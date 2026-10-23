-- Brick Royale: Memewars | online setup for Supabase.
-- Paste this whole file into Supabase > SQL Editor > New query, then click Run. Safe to run more than once.
--
-- What it creates
--   players   one row per player (anonymous account): rating, wins, losses. Only the server changes these.
--   queue     the ranked waiting room.
--   matches   one row per ranked match, and who said they won.
--   parties   private party codes.
--   fill_queue  the Duos / Trios "Fill" waiting room.
--   signals   short-lived messages two players swap to open a direct connection.
-- Everything is reached through the functions at the bottom. The tables themselves are locked down.

-- ---------------------------------------------------------------- tables
create table if not exists public.players (
  id uuid primary key references auth.users(id) on delete cascade,
  rating int not null default 1000,
  wins int not null default 0,
  losses int not null default 0,
  created_at timestamptz not null default now()
);

-- round 22: profile numbers for the leaderboards (level / games won / kills are what each player's game reports after online matches, see sync_profile below)
alter table public.players add column if not exists name text;
alter table public.players add column if not exists xp bigint not null default 0;
alter table public.players add column if not exists games_won int not null default 0;
alter table public.players add column if not exists kills int not null default 0;
alter table public.players add column if not exists holder boolean not null default false;

create table if not exists public.queue (
  player_id uuid primary key references auth.users(id) on delete cascade,
  rating int not null,
  joined_at timestamptz not null default now(),
  seen_at timestamptz not null default now(),
  match_id uuid
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  p1 uuid not null references auth.users(id) on delete cascade,
  p2 uuid not null references auth.users(id) on delete cascade,
  r1 int not null,
  r2 int not null,
  status text not null default 'active',   -- active | applied | disputed | void
  rep1 boolean,                            -- did player 1 say "I won"?
  rep2 boolean,                            -- did player 2 say "I won"?
  rep1_at timestamptz,
  rep2_at timestamptz,
  d1 int,                                  -- rating change applied to player 1
  d2 int,
  created_at timestamptz not null default now()
);

create table if not exists public.parties (
  code text primary key,
  host uuid not null references auth.users(id) on delete cascade,
  guest uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  seen_at timestamptz not null default now()
);

create table if not exists public.signals (
  id bigint generated always as identity primary key,
  room text not null,
  sender uuid not null,
  kind text not null,
  body jsonb,
  created_at timestamptz not null default now()
);
create index if not exists signals_room_idx on public.signals (room, id);
create index if not exists signals_created_idx on public.signals (created_at);

-- round 31: the Duos / Trios "Fill" waiting room (players with no party who want real teammates)
create table if not exists public.fill_queue (
  player_id uuid primary key references auth.users(id) on delete cascade,
  kind text not null,                       -- 'duos' or 'trios'
  joined_at timestamptz not null default now(),
  seen_at timestamptz not null default now(),
  squad_id text,                            -- set when a squad has been formed
  seat int,
  sz int
);

-- ---------------------------------------------------------------- locked down tables
alter table public.players enable row level security;
alter table public.queue   enable row level security;
alter table public.matches enable row level security;
alter table public.parties enable row level security;
alter table public.signals enable row level security;
alter table public.fill_queue enable row level security;

drop policy if exists players_read on public.players;
create policy players_read on public.players for select to authenticated using (true);   -- ratings are public (leaderboard later)
drop policy if exists matches_read on public.matches;
create policy matches_read on public.matches for select to authenticated using (auth.uid() in (p1, p2));
-- queue, parties and signals have no policies, so only the functions below can touch them
revoke all on public.players, public.queue, public.matches, public.parties, public.signals, public.fill_queue from anon, authenticated;
grant select on public.players, public.matches to authenticated;   -- read-only; every change goes through the functions

-- ---------------------------------------------------------------- internal helpers (not callable from the game)
create or replace function public.apply_match(p_match uuid, p_winner uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  m matches; a players; b players;
  ka int; kb int; ea numeric; sa numeric; da int; db int;
begin
  select * into m from matches where id = p_match;
  select * into a from players where id = m.p1;
  select * into b from players where id = m.p2;
  ka := case when a.wins + a.losses < 10 then 48 else 32 end;
  kb := case when b.wins + b.losses < 10 then 48 else 32 end;
  ea := 1 / (1 + power(10::numeric, (b.rating - a.rating) / 400.0));
  sa := case when p_winner = m.p1 then 1 else 0 end;
  da := round(ka * (sa - ea));
  db := round(kb * ((1 - sa) - (1 - ea)));
  update players set rating = greatest(0, rating + da), wins = wins + (case when sa = 1 then 1 else 0 end), losses = losses + (case when sa = 1 then 0 else 1 end) where id = m.p1;
  update players set rating = greatest(0, rating + db), wins = wins + (case when sa = 1 then 0 else 1 end), losses = losses + (case when sa = 1 then 1 else 0 end) where id = m.p2;
  update matches set status = 'applied', d1 = da, d2 = db where id = p_match;
end $$;

create or replace function public.settle_match(p_match uuid) returns void
language plpgsql security definer set search_path = public as $$
declare m matches; w uuid;
begin
  select * into m from matches where id = p_match for update;
  if not found or m.status <> 'active' then return; end if;
  if m.rep1 is not null and m.rep2 is not null then
    if m.rep1 <> m.rep2 then
      perform apply_match(p_match, case when m.rep1 then m.p1 else m.p2 end);
    else
      update matches set status = 'disputed' where id = p_match;   -- both claim the same result: no rating change
    end if;
  elsif (m.rep1 is not null or m.rep2 is not null) and now() - coalesce(m.rep1_at, m.rep2_at) > interval '30 seconds' then
    -- the other player never reported (they closed the game): accept the one report
    if m.rep1 is not null then w := case when m.rep1 then m.p1 else m.p2 end;
    else w := case when m.rep2 then m.p2 else m.p1 end; end if;
    perform apply_match(p_match, w);
  end if;
end $$;

create or replace function public.settle_stale() returns void
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  for r in select id from matches where status = 'active' and (rep1 is not null or rep2 is not null) and coalesce(rep1_at, rep2_at) < now() - interval '30 seconds' limit 20 loop
    perform settle_match(r.id);
  end loop;
  update matches set status = 'void' where status = 'active' and rep1 is null and rep2 is null and created_at < now() - interval '3 hours';
end $$;

create or replace function public.room_ok(p_room text, p_uid uuid) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if p_room is null or length(p_room) < 3 or length(p_room) > 45 then return false; end if;
  if left(p_room, 2) = 'P-' then
    return exists (select 1 from parties where 'P-' || code = p_room and p_uid in (host, guest));
  end if;
  return exists (select 1 from matches where id::text = p_room and p_uid in (p1, p2));
end $$;

-- ---------------------------------------------------------------- player and ranked
create or replace function public.ensure_player() returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); p players;
begin
  if uid is null then raise exception 'not signed in'; end if;
  insert into players (id) values (uid) on conflict do nothing;
  select * into p from players where id = uid;
  return jsonb_build_object('rating', p.rating, 'wins', p.wins, 'losses', p.losses);
end $$;

-- Call every ~2 seconds while searching. Returns {match: null} until someone is found, then {match, host, opp_rating}.
-- The search window starts at +/-100 rating and widens by 40 per second waited (up to +/-600).
create or replace function public.find_match() returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid(); me queue; opp queue; p players; mid uuid; m matches;
begin
  if uid is null then raise exception 'not signed in'; end if;
  perform settle_stale();
  insert into players (id) values (uid) on conflict do nothing;
  select * into p from players where id = uid;
  delete from queue where seen_at < now() - interval '12 seconds' and player_id <> uid;
  insert into queue (player_id, rating) values (uid, p.rating)
    on conflict (player_id) do update set seen_at = now();
  select * into me from queue where player_id = uid for update;
  if me.match_id is not null then                       -- someone matched me since my last call
    select * into m from matches where id = me.match_id;
    delete from queue where player_id = uid;
    return jsonb_build_object('match', m.id, 'host', m.p1 = uid, 'opp_rating', case when m.p1 = uid then m.r2 else m.r1 end);
  end if;
  select q.* into opp from queue q
    where q.match_id is null and q.player_id <> uid and q.seen_at > now() - interval '12 seconds'
      and abs(q.rating - me.rating) <= greatest(
            least(600, 100 + 40 * extract(epoch from now() - me.joined_at)),
            least(600, 100 + 40 * extract(epoch from now() - q.joined_at)))
    order by abs(q.rating - me.rating), q.joined_at
    limit 1 for update skip locked;
  if found then
    insert into matches (p1, p2, r1, r2) values (opp.player_id, uid, opp.rating, me.rating) returning id into mid;
    update queue set match_id = mid where player_id = opp.player_id;   -- the waiting player is player 1 and hosts
    delete from queue where player_id = uid;
    return jsonb_build_object('match', mid, 'host', false, 'opp_rating', opp.rating);
  end if;
  return jsonb_build_object('match', null, 'waited', extract(epoch from now() - me.joined_at));
end $$;

create or replace function public.leave_queue() returns void
language sql security definer set search_path = public as $$
  delete from queue where player_id = auth.uid();
$$;

-- Both players call this when the match ends. Ratings change only when the two reports agree
-- (one says "I won", the other "I lost"), or when only one player reports and the other has been silent for 30 seconds.
create or replace function public.report_result(p_match uuid, p_won boolean) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); m matches;
begin
  select * into m from matches where id = p_match for update;
  if not found or uid not in (m.p1, m.p2) then raise exception 'no such match'; end if;
  if m.status = 'active' then
    if uid = m.p1 then update matches set rep1 = p_won, rep1_at = coalesce(rep1_at, now()) where id = p_match;
    else update matches set rep2 = p_won, rep2_at = coalesce(rep2_at, now()) where id = p_match; end if;
    perform settle_match(p_match);
  end if;
  return public.match_result(p_match);
end $$;

create or replace function public.match_result(p_match uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); m matches; p players;
begin
  select * into m from matches where id = p_match;
  if not found or uid not in (m.p1, m.p2) then raise exception 'no such match'; end if;
  if m.status = 'active' then perform settle_match(p_match); select * into m from matches where id = p_match; end if;
  select * into p from players where id = uid;
  return jsonb_build_object('status', case when m.status = 'active' then 'pending' else m.status end,
    'delta', case when uid = m.p1 then m.d1 else m.d2 end, 'rating', p.rating, 'wins', p.wins, 'losses', p.losses);
end $$;

-- A connection that never opened: void the match so it does not count.
create or replace function public.cancel_match(p_match uuid) returns void
language sql security definer set search_path = public as $$
  update matches set status = 'void'
  where id = p_match and status = 'active' and rep1 is null and rep2 is null and auth.uid() in (p1, p2);
$$;

-- ---------------------------------------------------------------- parties
create or replace function public.party_create() returns text
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid(); c text; tries int := 0; chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; i int;
begin
  if uid is null then raise exception 'not signed in'; end if;
  delete from parties where seen_at < now() - interval '2 minutes';
  delete from parties where host = uid;
  loop
    c := '';
    for i in 1..5 loop c := c || substr(chars, 1 + floor(random() * 32)::int, 1); end loop;
    begin
      insert into parties (code, host) values (c, uid);
      return c;
    exception when unique_violation then
      tries := tries + 1;
      if tries > 20 then raise; end if;
    end;
  end loop;
end $$;

-- The host calls this about once a second; it keeps the party alive and says whether a friend has joined.
create or replace function public.party_status(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); pt parties;
begin
  update parties set seen_at = now() where code = upper(trim(p_code)) and host = uid;
  select * into pt from parties where code = upper(trim(p_code)) and host = uid;
  if not found then return jsonb_build_object('open', false, 'guest', false); end if;
  return jsonb_build_object('open', true, 'guest', pt.guest is not null);
end $$;

create or replace function public.party_join(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); pt parties;
begin
  if uid is null then raise exception 'not signed in'; end if;
  select * into pt from parties where code = upper(trim(p_code)) and seen_at > now() - interval '2 minutes' for update;
  if not found then return jsonb_build_object('ok', false, 'err', 'none'); end if;
  if pt.host = uid then return jsonb_build_object('ok', false, 'err', 'self'); end if;
  if pt.guest is not null and pt.guest <> uid then return jsonb_build_object('ok', false, 'err', 'full'); end if;
  update parties set guest = uid where code = pt.code;
  return jsonb_build_object('ok', true, 'room', 'P-' || pt.code,
    'head', coalesce((select max(id) from signals where room = 'P-' || pt.code), 0));   -- the guest ignores older (stale) messages
end $$;

create or replace function public.party_close(p_code text) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  delete from parties where code = upper(trim(p_code)) and host = uid;
  update parties set guest = null where code = upper(trim(p_code)) and guest = uid;
end $$;

-- ---------------------------------------------------------------- Duos / Trios fill (round 31)
-- Call every ~2 seconds while waiting. Returns {status:'wait', waiting} until a squad forms, then {status:'match', id, seat, size}.
-- A full squad (2 for Duos, 3 for Trios) forms as soon as enough players of the same kind wait. After a while the game passes
-- p_force = true, which forms a smaller squad out of whoever is waiting (the empty seats become CPU teammates).
create or replace function public.fill_join(p_kind text, p_force boolean default false) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid(); need int; me fill_queue; ids uuid[]; n int; sid text;
begin
  if uid is null then raise exception 'not signed in'; end if;
  if p_kind not in ('duos', 'trios') then raise exception 'bad kind'; end if;
  need := case p_kind when 'duos' then 2 else 3 end;
  delete from fill_queue where player_id <> uid and (
    (squad_id is null and seen_at < now() - interval '12 seconds') or (squad_id is not null and seen_at < now() - interval '90 seconds'));
  insert into fill_queue (player_id, kind) values (uid, p_kind)
    on conflict (player_id) do update set seen_at = now();
  select * into me from fill_queue where player_id = uid for update;
  if me.kind <> p_kind and me.squad_id is null then   -- changed their mind between Duos and Trios
    update fill_queue set kind = p_kind, joined_at = now() where player_id = uid returning * into me;
  end if;
  if me.squad_id is not null then
    return jsonb_build_object('status', 'match', 'id', me.squad_id, 'seat', me.seat, 'size', me.sz);
  end if;
  select array_agg(player_id) into ids from (
    select player_id from fill_queue
      where kind = p_kind and squad_id is null and player_id <> uid and seen_at > now() - interval '12 seconds'
      order by joined_at limit need - 1 for update skip locked) s;
  n := coalesce(array_length(ids, 1), 0);
  if n >= need - 1 or (p_force and n >= 1) then
    sid := substr(md5(random()::text || clock_timestamp()::text), 1, 10);
    ids := ids || uid;
    update fill_queue f set squad_id = sid, sz = n + 1, seat = r.rn - 1
      from (select player_id, row_number() over (order by joined_at, player_id) rn from fill_queue where player_id = any(ids)) r
      where f.player_id = r.player_id;
    select * into me from fill_queue where player_id = uid;
    return jsonb_build_object('status', 'match', 'id', me.squad_id, 'seat', me.seat, 'size', me.sz);
  end if;
  return jsonb_build_object('status', 'wait', 'waiting', n + 1, 'need', need);
end $$;

create or replace function public.fill_leave() returns void
language sql security definer set search_path = public as $$
  delete from fill_queue where player_id = auth.uid();
$$;

-- ---------------------------------------------------------------- connection handshake (WebRTC offers, answers, candidates)
create or replace function public.sig_send(p_room text, p_kind text, p_body jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null or not public.room_ok(p_room, uid) then raise exception 'bad room'; end if;
  if p_kind not in ('offer', 'answer', 'ice') then raise exception 'bad kind'; end if;
  if octet_length(coalesce(p_body::text, '')) > 8000 then raise exception 'too large'; end if;
  insert into signals (room, sender, kind, body) values (p_room, uid, p_kind, p_body);
  if random() < 0.02 then delete from signals where created_at < now() - interval '15 minutes'; end if;
end $$;

create or replace function public.sig_poll(p_room text, p_after bigint) returns table (id bigint, kind text, body jsonb)
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null or not public.room_ok(p_room, uid) then return; end if;
  return query select s.id, s.kind, s.body from signals s
    where s.room = p_room and s.id > p_after and s.sender <> uid order by s.id limit 100;
end $$;

-- ---------------------------------------------------------------- leaderboards (round 22)
-- Account level from total XP (same curve as js/account.js: level L starts at 100*(L-1) + 5*L*(L-1) XP, max 100).
create or replace function public.level_of(p_xp bigint) returns int
language plpgsql immutable set search_path = public as $$
declare l int := 1;
begin
  while l < 100 and p_xp >= 100 * l + 5 * (l + 1) * l loop l := l + 1; end loop;
  return l;
end $$;

-- The game reports the player's numbers after online matches and when the leaderboard is opened. Numbers can only go up, and by a limited amount per call.
-- (These numbers come from the player's browser, so treat the level / wins / kills boards as for fun; the RANK board uses the server-kept rating and cannot be faked.)
create or replace function public.sync_profile(p_name text, p_xp bigint, p_won int, p_kills int, p_holder boolean) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); nm text;
begin
  if uid is null then raise exception 'not signed in'; end if;
  insert into players (id) values (uid) on conflict do nothing;
  nm := left(regexp_replace(coalesce(p_name, ''), '[^A-Za-z0-9_]', '', 'g'), 16);
  update players set
    name = case when length(nm) >= 3 then nm else name end,
    xp = greatest(xp, least(greatest(coalesce(p_xp, 0), 0), xp + 20000)),
    games_won = greatest(games_won, least(greatest(coalesce(p_won, 0), 0), games_won + 50)),
    kills = greatest(kills, least(greatest(coalesce(p_kills, 0), 0), kills + 200)),
    holder = coalesce(p_holder, false)
  where id = uid;
end $$;

-- Top 20 for one board ('rating', 'level', 'wins' or 'kills'), plus the caller's own row if they are further down. Only named players are listed.
create or replace function public.leaderboard(p_kind text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); res jsonb;
begin
  if uid is null then raise exception 'not signed in'; end if;
  if p_kind not in ('rating', 'level', 'wins', 'kills') then raise exception 'bad board'; end if;
  with r as (
    select id, name, public.level_of(xp) as level, rating, games_won, kills, holder, xp,
      row_number() over (order by (case p_kind when 'rating' then rating::bigint when 'level' then xp when 'wins' then games_won::bigint else kills::bigint end) desc, xp desc, created_at) as rnk
    from players where name is not null)
  select coalesce(jsonb_agg(jsonb_build_object('rank', rnk, 'name', name, 'level', level, 'rating', rating, 'wins', games_won, 'kills', kills, 'holder', holder, 'me', id = uid) order by rnk), '[]'::jsonb)
    into res from r where rnk <= 20 or id = uid;
  return res;
end $$;

-- ---------------------------------------------------------------- permissions
-- Internal helpers: nobody can call them from the game.
revoke execute on function public.apply_match(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.settle_match(uuid) from public, anon, authenticated;
revoke execute on function public.settle_stale() from public, anon, authenticated;
revoke execute on function public.room_ok(text, uuid) from public, anon, authenticated;
-- Game functions: signed-in players only (anonymous sign-in counts as signed in).
revoke execute on function public.ensure_player() from public, anon;
revoke execute on function public.find_match() from public, anon;
revoke execute on function public.leave_queue() from public, anon;
revoke execute on function public.report_result(uuid, boolean) from public, anon;
revoke execute on function public.match_result(uuid) from public, anon;
revoke execute on function public.cancel_match(uuid) from public, anon;
revoke execute on function public.party_create() from public, anon;
revoke execute on function public.party_status(text) from public, anon;
revoke execute on function public.party_join(text) from public, anon;
revoke execute on function public.party_close(text) from public, anon;
revoke execute on function public.fill_join(text, boolean) from public, anon;
revoke execute on function public.fill_leave() from public, anon;
revoke execute on function public.sig_send(text, text, jsonb) from public, anon;
revoke execute on function public.sig_poll(text, bigint) from public, anon;
revoke execute on function public.sync_profile(text, bigint, int, int, boolean) from public, anon;
revoke execute on function public.leaderboard(text) from public, anon;
revoke execute on function public.level_of(bigint) from public, anon;
grant execute on function public.ensure_player() to authenticated;
grant execute on function public.find_match() to authenticated;
grant execute on function public.leave_queue() to authenticated;
grant execute on function public.report_result(uuid, boolean) to authenticated;
grant execute on function public.match_result(uuid) to authenticated;
grant execute on function public.cancel_match(uuid) to authenticated;
grant execute on function public.party_create() to authenticated;
grant execute on function public.party_status(text) to authenticated;
grant execute on function public.party_join(text) to authenticated;
grant execute on function public.party_close(text) to authenticated;
grant execute on function public.fill_join(text, boolean) to authenticated;
grant execute on function public.fill_leave() to authenticated;
grant execute on function public.sig_send(text, text, jsonb) to authenticated;
grant execute on function public.sig_poll(text, bigint) to authenticated;
grant execute on function public.sync_profile(text, bigint, int, int, boolean) to authenticated;
grant execute on function public.leaderboard(text) to authenticated;
grant execute on function public.level_of(bigint) to authenticated;
