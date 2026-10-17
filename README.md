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
- `js/logo.js`, `js/ui.js`, `js/gfx.js`, `js/title.js`  logo, menus and HUD, lighting/scenery, title screen

Scripts share globals and must stay in the order listed in `index.html`.
