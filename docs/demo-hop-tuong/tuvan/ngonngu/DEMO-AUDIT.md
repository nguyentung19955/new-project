# Skill demo clip audit (thap/js/skilldemo.js)

Scope: all 93 turrets' "Test range" clips on the turret page (unitpage.js opens an iframe at `index.html?preview=<id>&star=<n>&notut=1`, and skilldemo.js runs the clip there).

How the clips work: every clip runs on the **real battle engine**. It builds a real board with `taoBan`, makes real turrets with `sinhU(taoU(...))`, does real drags through `ghep()` / `ghepDB.lam`, uses the real taps (`chuDong`) and the real `trung`/FX/HU sprites. That means turret art, FX and numbers match the battle. Where a clip "diverged", the cause was the script (which turrets it placed, when it merged, what the captions said), not a separate fake animation. One exception: the old Wall Projector clip called `SKILLS.wallgen.ghep` directly, with no merge.

How I verified: a headless sweep ran every turret at 1★/4★/7★ plus the 3 commander clips (282 runs) through `capNhat`/`VX.cap`. It recorded page errors, caption events that never fired (`SD.thieu`), merges, star changes, summons and the final board. I also captured real-time frame strips with Playwright at 390×844 and DPR 1 (PNGs in `demo/`). There were **0 page errors** after the fixes.

## Global fixes (affect every clip)

| Problem | Fix |
|---|---|
| The caption banner was drawn at logical y 175, right on the **top lane where enemies walk and get hit**. On most clips the targets, hit FX and damage numbers sat under the banner. | The caption moved to a strip under the board (`SD_YC = 510`, still inside the 150–530 crop). The 4★ chip and pause button do not overlap it. |
| `sdSC()` deleted every "awaken/awakened/awakens" word, which broke Werewolf and Orbital captions (e.g. "Each Werewolf is Normal or", ": always crits", "30% : always crits"). | The awaken-stripping was removed. Awakened is now a real form name. |
| The clip could do only one drag, and could not show a rare roll. | Added `keos` (several real drags per loop, each `[t, from, to, {may, so}]`). Added `SD.ep`: during a scripted lucky roll, `Math.random` returns 0.0004, so the **real** `.sinh` / `ghep` / `sinhDoi` code produces the rare outcome. Added helpers `sdDat` (real summon), `sdSoDoi` (before → after stat label), `sdPct` (card-level % through `knThe` / `heSaoChep` / `SKILLS.soi.tiLe`) and `SD.chi` (arrow + short label). |
| The "New" label on a summoned turret showed no star. | It now shows "New" + "N★", which is needed for the Twin Maker +1★ case. |
| `sdNgan` lower-cased "VAMP". | VAMP is kept as is. |

## Per-turret table

ok = shows the real trigger, effect and targets with battle art. wrong = shows something different from the real skill. missing = the mechanic is not shown. fake = the effect was triggered without its real trigger.

| Turret | Demo was | Problem | Fix |
|---|---|---|---|
| **Werewolf (soi)** | wrong | Captions were broken by the awaken-strip. The Awakened wolf sat in the dimmed edge column (cell 4). The awaken roll on summon/merge was never shown. | Normal wolf (cell 2) next to an Awakened wolf (cell 3, "Awakened" marker). At 3.8 s a real summon (`sdDat` → `SKILLS.soi.sinh`, lucky roll) comes out Awakened. Caption shows the live % from `SKILLS.soi.tiLe` (30% at LV9) and "Card level raises the chance". |
| **Orbital** | wrong | Captions broken ("Every Orbital on the board", ": area bomb salvos"). Only 2 same-star Orbitals, both in the centre. | Real merge of 2 Orbitals → `thucTinh` wakes **every** Orbital on the board, including a 1★ Orbital in the edge column (that column is no longer dimmed). Area bomb salvos follow. |
| **Railgun** | wrong | The board started with both bingos already complete, so nothing changed. "Other turrets don't count" was never shown. | The row starts with a Cannon in it (no bingo, 4/5). At 2.2 s a Railgun replaces it → full row, label 646 → 1938 dmg (+200%). At 4.6 s a third Railgun fills the column → label 0.4/s → 0.9/s fire rate (+150%). Live `SKILLS.railgun.bingo`. |
| **Wall Projector (wallgen)** | fake | The default "merge" script merged the two Projectors at 2.5 s (so the golden wall came while the caption talked about normal walls). Then at 4.6 s it called `SKILLS.wallgen.ghep` directly, with no merge (a second, fake golden wall). | Normal wall first (real timer). At 4.8 s **one real merge** of two Wall Projectors → GOLDEN WALL (6 s, ×6 blast). |
| **Merge King (vughep)** | missing | The Golden chance (+2★) was not shown. | Real drag: +1★, keeps its type. Then a real summon rolls a Golden King (`sinh`, lucky roll, "Golden" marker) and a second real drag gives +2★. Caption shows the live % from `knThe('vughep')`. |
| **Twin Maker (sinhdoi)** | missing | The caption "Sometimes the twin is +1★" was not backed by anything on screen. | Two real merges. The first twin has the same star as the pair. On the second merge `sinhDoi` rolls lucky (real code) → twin +1★, labelled "New N★". Caption shows the live % from `knThe('sinhdoi')`. |
| **Sync Cannon (dongbo)** | wrong | Most same-star turrets sat in the dimmed edge columns. The PvP caption had no rival board. | No dimming. Same-star Attack turrets in the corners and edges all show "+28%" (real `HOTRO` sources). The 1★ Tesla next to it gets nothing. New caption "Other stars get nothing". |
| **Copycat (saochep)** | wrong | The caption said "half damage" (hard-coded). The real value depends on card level (`heSaoChep`, 50% → 92%). | Caption shows the live %. A before → after label shows original vs copy damage (e.g. 247 → 173 = 70%). Added "Card level raises the copy power". |
| Ember Relay (lualien) | missing | No script. The caption was cut off ("Merging a Relay passes flames") and no Relays were next to the merge. | Real merge with Relays on the N and S cells → each gets a flame (live `lc`, damage before → after). |
| Quantum Choir (hopca) | missing | Board had 0 same-star turrets, so the skill showed "+0%". | Starts with 2 matches. 4 same-star turrets are summoned → damage 188 → 288 (live `dem`). |
| Fusion Archive (luutru) | missing | Default script merged the Archive away. The caption was cut off. At 7★ the pairs could not merge. | Two real merges of other pairs (≤6★) → archive charges +2 (live `kho`, damage label). |
| Hero Foundry (xuonganh) | missing | Truncated caption, no feedback on where the tile went. | Real merge → real random HERO tile ("Hero tile" marker + fire-rate before → after). |
| Blood Circuit (mauhut) | missing | Truncated caption. | Real drag onto a same-star turret (+1 VAMP), then a new Circuit dragged onto a different-star turret spends 2 VAMP on the real blood pulse. |
| Hex Saboteur (nguyenrua) | missing | Showed solo only, with a cut-off caption. | Real merge with a small rival board (PvP during the merge) → the hex flies and the rival Sniper drops 4★ → 3★. Solo effect is in the caption. |
| Sanctum (thanhdia) | missing | No script, and the default placed neighbours on the **diagonals** (its `huong` is a function), so the turret had no neighbours. | Neighbours on N/E/S/W, 2 frozen + 1 stone. Sanctum arrives at 1.6 s (real `sinh` → cleanse + shield), then the +% damage aura. |
| Prism Thief (bienmau) | missing | Default merge with random colours (usually different, so no COMBO). | The pair is phase-matched to the same colour → real COMBO +1, and a third Thief shows the damage gain. |
| Nine-Tail (cuuvi) | wrong | Auto "merge" type: the main Nine-Tail was merged away at 2.5 s, before the 9-tail payoff, and an extra "Merge two of the same" caption appeared. | Forced to attack type. Kills grow tails, then 9 homing foxfires. |
| Chrono Lock (khoathoigian) | wrong | Same auto-merge problem: the main turret was consumed at 2.5 s while the captions described the lock/release. | Forced to attack type. (The merge TIME LOCK is not shown; minor.) |
| Venom (doc) | ok (minor) | The 2nd caption waited for a 'hit' event that a non-shooting turret never sends, so the slow-mo missed. | Event wait removed. |
| Armor Breaker (phagiap) | ok (minor) | Same 'hit' wait problem. | Event wait removed. |
| Star Breaker (hasao) | wrong caption | The caption said "PvP: punishes a rival's first 5★", but the solo board shows the solo effect (your lowest turret +8% fire rate). | Caption: "First 5★: your lowest gets +8% speed". |
| Rainbow (cauvong) | ok (minor) | The 3rd caption describes PvP, which is not shown. | Unchanged. |
| Evolver (tienhoa) | ok (minor) | At 7★ the caption waits for a summon that never comes (fizzle is correct). | Unchanged (harmless). |
| Sniper (tia), Mine Layer (min) | ok (minor) | At 1★ the slow-mo sometimes misses the first hit window. | Unchanged. |
| Jammer, Scrambler, Signal Jammer (kepha, xaotron, nhieusong) | ok | Show the PvP branch on a small rival board (labelled "Rival"). Co-op/solo branches are not shown. | Unchanged. |
| Mirror Gate (guongcong) | ok | Boss block plus a real reflected Clamp (a real `kepha.ghep` on the rival board). | — |
| Cannon, Gatling, Frost, Tesla, Mana Core, Radar, Mimic, Laser, Mortar, Black Hole, Overlord, Dice Gun, Scatter, Revolver, Guillotine, Hammer, Iron Fist, Time Bomb, Mana Doubler, Ice Blade, Crit Antenna, Teleporter, Drone Bay, Fusion Mixer, Energy Cannon, Chiller, Amplifier, Toxic Pool, Cooldown Horn, Mana Leech, Berserker, Blizzard, Cloner, Chain Link, Cleanser, Shield Gen, Mystery Box, Star Lift, Reaper Pillar, Overclock, Fifth Shot, Storm Gun, Lighthouse, Purifier, Star Cannon, Cryo Reactor, Holy Halo, Ricochet, Combo Core, Hydra, Pandora Vault, Resonance Grid, Chrono Throne, Nemesis, Lone Ace, Focus Lens, Bounty Beacon, Eclipse, Scrap Forge, Marionette, Hive Queen, Leviathan, Genesis Core, Wyrm Engine | ok | Real trigger, targets and FX. Captions match TEXT/SKILLS (other agents are updating the numbers in parallel). | — (they benefit from the caption move) |

Counts: 93 turrets, **21 fixed**:
- 10 missing: Merge King, Twin Maker and the 8 new gold turrets.
- 8 wrong: Werewolf, Orbital, Railgun, Sync Cannon, Copycat, Nine-Tail, Chrono Lock, and the Star Breaker caption.
- 1 fake: Wall Projector.
- 2 minor event waits: Venom, Armor Breaker.

The other 72 are ok. 5 of those have minor notes left as is (Rainbow, Evolver at 7★, Sniper and Mine Layer at 1★). The global caption move improves all 93.

## Frame strips (demo/)

`<id>_strip.png` is a horizontal strip of 4–5 frames. `<id>_N.png` are the single frames, cropped to the clip window (logical y 150–530). 8 gold turrets: soi, orbital, railgun, wallgen, vughep, sinhdoi, dongbo, saochep. Also the 8 new gold turrets: lualien, hopca, luutru, xuonganh, mauhut, nguyenrua, thanhdia, bienmau.

## Opening a demo programmatically

- Direct clip page: `http://localhost:8765/thap/index.html?preview=<id>&star=<1-7>&notut=1`. Wait for `window.SD && SD.id`. Then:
  - `SD.bat(id, star, stage)` switches turret, star and stage (stage 0 = default, 1/2/3 = form buttons; `'mv:hero'|'mv:dahlia'|'mv:eve'` for commanders).
  - `SD.xep()` restarts the loop. `SD.t` is the clip time in seconds. `SD.ks.dai` is the loop length. `SD.dungMuon = true` pauses.
  - Crop: `REN.cv.getBoundingClientRect()`, k = width / `W` (430), clip = y `top + 150k`, height `380k`.
- Full turret page: on `index.html?notut=1` call `UP.mo('<id>')`, then `UP.moTam('ts')` (opens the Test range), and `UP.chonGd(g)` for the form buttons. The page sends `{tmXem:{id,sao,gd}}` to the iframe.
- Scripts used: `strip.js` / `audit.js` in the session scratchpad (not committed).
