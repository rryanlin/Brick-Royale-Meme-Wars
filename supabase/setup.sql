-- Brick Royale: Memewars | online setup for Supabase.
-- Paste this whole file into Supabase > SQL Editor > New query, then click Run. Safe to run more than once.
--
-- What it creates
--   players   one row per player (anonymous account): rating, wins, losses. Only the server changes these.
--   queue     the ranked waiting room.
--   matches   one row per ranked match, and who said they won.
--   parties   private party codes.
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

-- ---------------------------------------------------------------- locked down tables
alter table public.players enable row level security;
alter table public.queue   enable row level security;
alter table public.matches enable row level security;
alter table public.parties enable row level security;
alter table public.signals enable row level security;

drop policy if exists players_read on public.players;
create policy players_read on public.players for select to authenticated using (true);   -- ratings are public (leaderboard later)
drop policy if exists matches_read on public.matches;
create policy matches_read on public.matches for select to authenticated using (auth.uid() in (p1, p2));
-- queue, parties and signals have no policies, so only the functions below can touch them
revoke all on public.players, public.queue, public.matches, public.parties, public.signals from anon, authenticated;
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
revoke execute on function public.sig_send(text, text, jsonb) from public, anon;
revoke execute on function public.sig_poll(text, bigint) from public, anon;
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
grant execute on function public.sig_send(text, text, jsonb) to authenticated;
grant execute on function public.sig_poll(text, bigint) to authenticated;
