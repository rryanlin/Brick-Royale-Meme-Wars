# Brick Royale: Memewars (BrickBrawl 1v1)

Plain HTML + CSS + JavaScript, no build step. Open `index.html` in a desktop browser (it loads three.js r128 from a CDN, so it needs internet),
or run `python3 -m http.server` in this folder. It also works as-is on GitHub Pages: push this folder and enable Pages.

Controls: WASD move, Space jump, mouse aim, left click shoot (or swing the hammer), right click / F quick hammer, Q ability, T sprint, Shift crouch,
1 gun (press again to swap primary/secondary, also X or mouse wheel), 2 hammer, 3 4 5 use loot items, R reload, M mute.

## Files
- `index.html`  page shell and HUD markup (loads the CSS and every script in order)
- `css/style.css`  all styling
- `img/title.jpg`  title-screen art (a copy is also embedded in `js/title.js`)
- `js/game.js`  arena, colliders, characters, weapons, bullets, bot combat, rounds
- `js/polish.js`  sound, hit feedback, screen shake, ammo and reload, slow-mo round end
- `js/hold.js`  two-handed gun holds (arm IK)
- `js/arsenal.js`  gun models, loot bags, items, hit-only name/health bars
- `js/town.js`  brick buildings, roofs, fences, crates
- `js/roster.js`, `js/minifig.js`  fighter data and the LEGO-style character builder
- `js/progress.js`  kills, spins, unlocks, spin-the-wheel
- `js/levels.js`  gun and fighter levels, XP and rarity
- `js/loadout.js`  primary + secondary guns, hotbar keys
- `js/pickups.js`  health plus, shield and loot-bag models
- `js/nav.js`  bot pathfinding (A*), wall avoidance
- `js/logo.js`, `js/ui.js`, `js/gfx.js`, `js/title.js`  logo, menus and HUD, lighting/scenery, title screen (incl. the Play mode picker)
- `js/config.js`  your Supabase project URL and publishable key
- `js/supa.js`  tiny Supabase client (anonymous sign-in + RPC calls, no library)
- `js/rtc.js`  WebRTC link between two players (Supabase is only the signalling mailbox)
- `js/net.js`  in-match sync: each player simulates their own fighter, shots/hits are events, the victim decides damage
- `js/online.js`  ranked queue, party codes / invite links, ready-up, results and rating screens
- `supabase/setup.sql`  database schema and functions, run once in Supabase

Scripts share globals and must stay in the order listed in `index.html`.

## Online play (ranked + parties)
Matchmaking, ratings and party codes live in Supabase; the match itself runs peer to peer over WebRTC.
1. Supabase > SQL Editor > New query: paste `supabase/setup.sql` and Run (safe to run again).
2. Authentication > Sign In / Providers: turn on **Allow anonymous sign-ins**.
3. `js/config.js` holds the project URL and publishable key (already filled in; the publishable key is meant to be public).
4. Host the site over https (GitHub Pages is fine) and test in two different browsers or one normal plus one private window.

Ranked: Elo, start 1000, tiers Bronze / Silver 900 / Gold 1100 / Platinum 1300 / Diamond 1500 / Legend 1700. The server only changes ratings when both
players report matching results. Known limits: players are anonymous accounts (win-trading with extra accounts is possible), and there is no TURN relay,
so players behind very strict NATs may fail to connect (add a TURN server in `js/rtc.js` if needed).
