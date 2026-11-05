# DCDW Wake-up / Grow-up — research + attack-effect plan for TURRET MERGE

Research run: 05 Nov 2026 (scheduled, unattended). Research only — no game code changed.
Scope: `thap/` game, branch `claude/demo-hop-tuong`. `demo/` untouched.

Confidence tags used below:
- **[V]** verified in a text source fetched/searched this run (see Sources).
- **[R]** from earlier research already in this repo (`DCDW-WIKI.md`, `DCDW-WIKI-TOM-TAT.md`, read from NamuWiki on 03–04 Nov) or our own video notes (`QUAN-SAT-10-VIDEO-DCDW.md`).
- **[I]** inferred / design recommendation — NOT confirmed from a source. Use as direction, not as fact.

> Honest limit of this run: namu.wiki, thewiki.kr and the Destiny Child fandom wiki all refused automated fetches (client errors), and YouTube pages returned no description text. No source this run describes the **pixel-level look** of an awakened DCDW unit. Mechanics are well covered; visuals of DCDW forms are reconstructed from our own video notes + genre conventions and are tagged [I]. If you want exact DCDW visuals, the fastest path is 2–3 screenshots/clips of Werewolf awakened, Mafdet bombarding and Darby at 50★ dropped into `docs/demo-hop-tuong/tham-chieu/`.

---

## 1. Which game is "DCDW"?

**DCDW = Destiny Child: Defense War** (데스티니 차일드: 디펜스 워), by Round2, 2020 → service ended 25 Jul 2024, Unity, Live2D chibis. NamuWiki calls it essentially *Random Dice reskinned with Destiny Child* [R]. Board 5×3, 1–7★ merges, 5 rarities (Normal → Rare → Epic → Legendary → Ancient) [R]. Launch review: ~50 Children at launch, Live2D animation down to eyes/mouth/accessories [V gameinsight].

It is **not** Lucky Defense (운빨존많겜): Lucky Defense has mythic recipes/upgrades but no in-battle "wake up" of a placed unit that we could find this run. Random Dice is the parent design: its "Transform" dice (Growth, Random Growth, Solar, Typhoon) are the mechanical ancestors of DCDW's growth/awaken children [V randomdice.wiki.gg].

### 1.1 Units that Wake-up / Grow-up (mechanics)

| Game | Unit | Type | Trigger | What changes in the attack | Source |
|---|---|---|---|---|---|
| DCDW | **Werewolf / Warwolf** (워울프), Legendary | Wake-up (binary) | **30% chance** a summoned Werewolf is the *awakened* version | Becomes **melee**, very fast, **every hit crits**; can only hit the enemy right in front → players park it in board corners next to the path and use Merlin to swap it there | [V tiprelay] [R] |
| DCDW | **Mafdet** (마프데트), Legendary | Wake-up (timed, group) | **On merge**, *every* Mafdet on the board awakens | Switches to **artillery bombardment** from the sky for a duration | [R] (our game: `orbital`, 20 s) |
| DCDW | **Darby** (다비), Legendary | Grow-up → Wake-up | Total ★ on board is a multiple of 10 → attack speed up; **50★ total → awakening +350% damage** | Grows faster then hits much harder; does not target the front monster; bonus vs big monsters; deck guides say "hold 40+★" | [V tiprelay] [R] (our `ngoisao`) |
| DCDW | **Daron / Moa** | Grow-up into another unit | Timer (Daron 47 s → random 1–7★; Moa → random +1★) | Becomes a different unit (new attack entirely) | [R] (our `hopbi`, `tienhoa`) |
| DCDW | **Jacheongbi** (Ancient) | Charge state | Slow charge | Huge thunder blast at full charge | [R] (our `overlord`) |
| DCDW | **Danu** | Rage state | Crits | Fire-rate frenzy | [R] (our `cuongno`) |
| Random Dice | **Growth** (Legendary) | Grow-up | Every **15 s → 7 s** (by class): +1 pip and turns into a random deck die | Identity change; no attack change on its own | [V wiki.gg] |
| Random Dice | **Random Growth** (Rare) | Grow-up | 45 s → 33 s, shorter with more pips | Random die, pips 1–7 (can go down). v5.4.3 added a **countdown indicator** — the only visual telegraph documented | [V wiki.gg] |
| Random Dice | **Solar** (Legendary) | Wake-up by count | Number of Solar dice on board (current patch 1/4/7) | **Solar mode**: attack interval 1.2 s → **0.4 s** + extra **splash** | [V wiki.gg] |
| Random Dice | **Typhoon** (Legendary) | Cyclic phases | 6 s normal → Phase 1 → Phase 2 → back | Phase 1 = faster attacks, Phase 2 = **100% crit** | [V wiki.gg] |

Key takeaway: in this genre the *attack* change is usually one of five things — **(a) melee ↔ ranged**, **(b) rate burst**, **(c) guaranteed crit**, **(d) single → splash/artillery**, **(e) a completely different unit**. Our proposals below use exactly these, plus a visible projectile change for every stage.

### 1.2 How DCDW shows it (visuals)

What we know [R, from our 10-video notes]: units are small Live2D chibis (~60–75% of a cell) seen from a high 3/4 angle; stars are pips above the head; **coloured disc/aura under the feet** when buffed or under an effect; bullets are short yellow/blue streaks; hits = small flash + white damage number; big moments use **anime CUT-INs** (large portrait slides in, halftone dots, name banner, "POWER UP!" text, purple lightning sweep).

What is likely for awakened forms [I — not confirmed this run]:
- Awakened Werewolf: a distinct card/sprite (wolf form, red/crimson eyes), red aura disc under feet, claw-slash hit FX instead of bullet streak, crit-style big yellow/red damage numbers on every hit.
- Mafdet awakening: all Mafdets flash at once on merge, then shells/beams fall from above onto enemies (vertical artillery), lasting a few seconds.
- Darby 50★: an aura/glow + bigger, brighter shots; the strength change is mainly communicated via numbers.

---

## 2. Design patterns extracted

1. **Three readable states max**, and they must map to real gameplay: Dormant → Active → Apex. Binary mechanics get 2 states, not fake 3 (Werewolf, Solar).
2. **Telegraph before the change**, never after: progress ring / pip counter (Random Growth's countdown, Darby's star total, Nine-Tail's visible tails). Players should *predict* the moment.
3. **Escalate along ONE axis per stage**, in this order: (1) silhouette part unfolds, (2) accent colour shifts warmer/brighter (orange → white, blue → cyan-white), (3) projectile changes type, (4) hit FX gains a second layer, (5) only Apex earns screen-level feedback (micro-shake, flash) — capped globally.
4. **Projectile ladder** that reads at 48 px: Stage 1 = thin streak/bullet; Stage 2 = bigger glowing bolt or 2 bolts / chain; Stage 3 = *different delivery*: beam, artillery-from-sky, cone, ring blast, melee slash or homing swarm. Change the delivery, not just the size.
5. **Colour shift = state, not rarity**: awake colour should be one hue step from the base accent (e.g., amber → white-gold, red → crimson-white, cyan → white-cyan) so the unit stays recognisable.
6. **Timing**: anticipation 80 ms → open 110 ms → assemble 120 ms → lock/impact 80 ms → settle 170 ms ≈ **560 ms** for a first awaken (matches our 64-turret bible §3.5); repeat/cyclic transitions (overlord, cuongno, lophanung, orbital) use a short **220–300 ms** pop, no banner after the first time (already how `VX.bien` treats `lap: true`).
7. **Readability guards**: awake aura stays inside the cell; ring shockwave ≤ 1.1 cell; Apex screen shake ≤ 2 px, max once per 0.8 s board-wide (TVX.duocLac already does this); cap simultaneous bloom; in PvP no screen flash for the rival board.
8. **Sound sells it**: a rising charge tone during anticipation + a heavy "lock" thunk at impact; each awake unit gets one signature attack sound that differs from its stage-1 sound.

---

## 3. Our current grow-up system (what exists)

- `thap/js/phattrien.js` → `GROW` table: per-unit `gd(T)` returns stage 1–3 + progress `p` + marks `v` for the ring; `tienHoaCap` detects stage change and calls `VX.bien` (hieuung.js) — 560 ms up / 260 ms down; "AWAKEN!" banner on first stage 3 for non-cyclic units, "EVOLVE!" on stage 2.
- Head art per stage: `assets/<id>_nong_s1..s3.png` exists for **overlord, hopbi, tienhoa, lophanung, soi, orbital, cuongno, ngoisao, lienket, dongbo**; scale in `artscale.js` (`STAGE_K`, `STAGE_TIP`).
- Attack FX today does **not** change by stage: per-tier escalation (`tiervfx.js` TVX: white → red adds sparks, rings, trails, WOW blast) plus each skill's own HU (`sam`, `vetinh`, `set`, `vuot`…). Projectile sprites are shared: `dan_phao, dan_lien, dan_tia, dan_bang, dan_doc`, beams `tia_laser, tia_lua, tia_set`.
- New units (hydra, cuuvi, ngaithoigian, ronglua, luoicheo) are design-only (`TUONG-MOI-20.md`), not in `skills*.js` yet.

**Gap the user cares about:** stage changes the head but the *shot* looks the same. Proposal: add a per-stage attack profile (projectile sprite + trail + hit FX + sound) keyed by `T.gd`, layered on top of TVX tier escalation (stage = what the shot *is*; tier = how *rich* it is).

Suggested data shape (for a later code task, not done here):
```js
// GROW_ATK[id][gd-1] = { dan: 'dan_soi_s2', vet: 'lua', trung: 'fx_soi_cao', am: 'chem', rung: 0 }
```

---

## 4. Per-unit proposals (15 units)

Format per unit: trigger (current) · Stage 1 / 2 / 3 look · **attack per stage** · transformation spec · new art + prompts.
All prompts share this suffix — call it **[SFX-SUFFIX]**:
`strict top-down 90° view, centered on exact canvas center, perfect circle silhouette where round (no ovals), clean industrial sci-fi, crisp edges, no text, no shadow, no perspective, flat #FF00FF magenta background, isolated, game sprite, 512x512.`
VFX sheets use: `… additive glow VFX, 4 frames in one row of equal square cells, perfect circular rings, flat #FF00FF magenta background, no text.`

### 4.1 OVERLORD (`overlord`, Red, Jacheongbi) — DORMANT / CHARGING / OVERCHARGED (cyclic, by charge 35/80%)
- Look: S1 locked compact cannon, coils dark · S2 rails part, 2 coils glow red-orange, faint crackle arcs on head · S3 rails fully aligned, white-hot aperture, crimson aura disc pulsing at 1.5 Hz.
- **Attack:** S1 — none (charging; tiny static sparks only). S2 — *new*: every 1.2 s a small **arc spark** jumps to the nearest enemy (10% of blast dmg, purely cosmetic-weight, telegraphs "almost"). S3 — the thunder blast becomes a **vertical lightning pillar** (sky → target, 90 px wide, 2 frames white) + **3 aftershock arcs** to nearby enemies + ground scorch ring 0.6 s; global micro-shake 2 px.
- Transform: cyclic → 260 ms pop (dip lights 60 ms → rails snap 120 ms → ring 80 ms). First-ever S3: full 560 ms + "OVERCHARGED".
- Art: `fx_overlord_cot.png` (lightning pillar, 4 frames), `fx_overlord_xem.png` (scorch ring).
  - Prompt: "Vertical lightning pillar seen from directly above as a bright white-violet circular impact core with 6 jagged radial bolts, red outer glow, [VFX suffix]."

### 4.2 MYSTERY BOX (`hopbi`, Purple, Daron) — SEALED / UNSEALING / ABOUT TO OPEN (timer 70/93%)
- Look: S1 closed hatch, "?" slot dim · S2 seams glow violet, box shakes 1 px every 0.5 s, ticking · S3 lid lifted 10%, light leaking from 4 seams, rapid shake, ring countdown flashes.
- **Attack:** S1 weak **violet card shards** (small spinning diamonds). S2 shards become **3-shot spread** of rotating "?" glyph bolts. S3 none — it is about to open; instead each 0.25 s a confetti spark pops (telegraph).
- Transform into target unit (existing `VX.doi`): 650 ms — lid blasts open (4 hinged plates fly outward 1 cell and fade), 6-colour light column 150 ms, new turret drops in with scale 1.25 → 1.0, star pips pop one by one (60 ms each), roulette sound → stop "ding".
- Art: `dan_hopbi.png` (violet "?" shard), `fx_hopbi_mo.png` (4 lid plates + light burst sheet).
  - Prompt: "Small glowing violet diamond-shaped card shard with a tiny question-mark rune, [SFX suffix]."

### 4.3 EVOLVER (`tienhoa`, Gold, Moa) — INCUBATING / FORGING / ASCENDING (timer 60/90%)
- Look: S1 incubator pod, amber core · S2 forge arms open, molten gold core, heat haze · S3 crown assembly lifts, one elevated star socket glowing white-gold.
- **Attack:** S1 amber pellet. S2 **molten slug** (orange-gold, short ember trail, small splash 20 px). S3 **golden spark beam** 0.2 s tick (thin, continuous) — feels "almost a new unit".
- Transform into target: same as hopbi but gold; the "+1★" pip is drawn larger and arrives last with a "+1" text.
- Art: `dan_tienhoa_s2.png` (molten slug), `fx_tienhoa_len.png` (gold star-socket burst).
  - Prompt: "Molten gold metal slug projectile, glowing orange core, short teardrop shape pointing right, [SFX suffix]."

### 4.4 CRYO REACTOR (`lophanung`, Red) — IDLE CORE / HEATING / CRYO STORM READY (cyclic, active charge 50/100%)
- Look: S1 core in brace, pale cyan · S2 heat-exchanger fins open, core bright, frost particles drift outward · S3 core white-cyan, hex frost lattice ring on the floor (inside cell + aura radius), slow spin.
- **Attack (aura ticks):** S1 faint expanding frost ring every tick. S2 ring + **ice needles** (3 tiny shards fly from core to the 3 slowest enemies). S3 when tapped: **CRYO STORM** = blue-white circle (aura radius) fills with a hexagonal ice field, enemies get ice-block overlay (`phu_bang`), on shatter → **ice-shard burst** (6 shards radial).
- Transform: cyclic pop 240 ms; ready state idles with 1 Hz shimmer; tap = 400 ms whiteout inside radius only.
- Art: `dan_lophanung_kim.png` (ice needle), `fx_bang_luoi.png` (hex frost field ring, perfect circle), reuse `fx_bang_vo.png`.
  - Prompt: "Perfect circular hexagonal frost lattice ring seen from above, cyan-white, thin lines, empty center, [VFX suffix]."

### 4.5 MECH WOLF (`soi`, Gold, Werewolf) — PUP / HUNTER / AWAKENED (3★ or 20 kills / 5★ or 50 kills; 30% born awakened)
Closest analogue of the user's favourite DCDW awakening.
- Look: S1 compact wolf-head chassis, ears folded, amber visor · S2 ears up, jaw plates extend, red eye slits, back spine plates · S3 full **howling wolf head**, crimson-white eyes, mane of 6 blade plates in a perfect ring, red aura disc with slow claw-mark pattern.
- **Attack:** S1 bite = short **amber claw swipe** arc 60° on the front enemy. S2 **double slash** (X-shaped two arcs, red-orange), slight lunge of the head 4 px. S3 **every hit is a crit**: **triple crimson claw slash** with white core + "CRIT" yellow numbers, every 4th hit a **dash**: head ghost-trails to the target and back (`vuot` already exists → upgrade sprite), tiny 1 px shake on dash only.
- Transform: 560 ms — head ducks (scale 0.9) 80 ms → mane plates unfold 110 ms → red eye flash 2 frames → **howl ring** (red, 1.1 cell) + short howl SFX → settle. Born-awakened: skip to S3 with the howl on summon.
- Art: `fx_soi_cao_s1.png` (amber single claw arc), `fx_soi_cao_s2.png` (X slash), `fx_soi_cao_s3.png` (triple crimson slash), `fx_soi_hu.png` (howl ring).
  - Prompt: "Three parallel curved claw-slash streaks, crimson red with white-hot core, seen from above, crescent shapes, [VFX suffix]."

### 4.6 ORBITAL (`orbital`, Gold, Mafdet) — STANDBY / UPLINK / BOMBARDMENT (2+ on board / during merge strike)
- Look (code-drawn, `khongAnh`): S1 dish closed · S2 dish opens, blue uplink beam line to top of screen (thin, 30% alpha) · S3 dish glows white, rotating targeting reticle under head.
- **Attack:** S1 small **cyan bolt**. S2 bolt + **target marker** ring flashes on the enemy 0.15 s before impact. S3 (all Orbitals together, like Mafdet) = **sky lance**: a vertical beam from screen top with a **red targeting reticle** 250 ms before, impact = circular blast 40 px + debris sparks; beams staggered 60 ms so it reads as a barrage.
- Transform: merge → all Orbitals flash simultaneously (120 ms white rim) → "BOMBARDMENT" on the merged one only.
- Art: `fx_orbital_tam.png` (red reticle), `fx_orbital_cot.png` (sky lance impact from above).
  - Prompt: "Red sci-fi targeting reticle, perfect circle with four inward tick marks and a center dot, thin lines, [VFX suffix]."

### 4.7 BERSERKER (`cuongno`, Purple, Danu) — CALM / RAGE / FRENZY (cyclic, by crits)
- Look: S1 twin barrels cold · S2 vents open, barrels orange, steam puffs · S3 barrels white-hot, red rage aura flickering, heat haze.
- **Attack:** S1 normal **yellow tracer**. S2 tracers turn **orange with ember trail** (+25% rate). S3 **twin alternating red-white rounds** at frenzy speed, muzzle flash doubled, shell casings eject (tiny gold sparks to the left), hit = small fire burst.
- Transform: cyclic pop 220 ms (steam burst) — no banner (already special-cased).
- Art: `dan_cuongno_s3.png` (red-white elongated round), reuse `tia_lua`.
  - Prompt: "Elongated red-white hot tracer round with a flame tail pointing right, [SFX suffix]."

### 4.8 STAR CANNON (`ngoisao`, Gold, Darby) — SPARK / NOVA / SUPERNOVA (board ★ ≥10 / ≥50)
- Look: S1 small 5-point star lens · S2 star lens + rotating ring of 5 small stars · S3 big white-gold star core, 8 rays, slow spin, gold aura disc; show board-star counter `37/50` on ring while S2.
- **Attack:** S1 small **star shard** bolt. S2 star shards in **pairs**, sparkle trail. S3 *(the +350% moment)* → **shooting star**: big white-gold star with a long comet tail, impact = star-shaped burst + 5 small stars scatter; every 5th shot a **meteor** falls from above on the largest enemy.
- Transform: 560 ms — counter hits 50 → screen-wide 80 ms gold vignette (only first time) → star rays extend → "SUPERNOVA".
- Art: `dan_ngoisao_s1.png`, `dan_ngoisao_s3.png` (comet star), `fx_ngoisao_no.png` (star burst).
  - Prompt: "White-gold shooting star projectile, five-pointed star head with a long glowing comet tail to the left, [SFX suffix]."

### 4.9 CHAIN LINK (`lienket`, Purple, Won) — SINGLE / LINKED / CHAIN MASTER (2 / 4+ linked)
- Look: S1 single ring · S2 two interlocked rings, violet links drawn to neighbours (exists) · S3 triple Borromean rings spinning, links become bright chains.
- **Attack:** S1 violet **ring bolt** (small hollow circle). S2 bolt leaves a **thin chain line** to the target (tether 0.1 s). S3 **chain lightning** arcs to +1 enemy (already the mechanic) → draw as violet **chain links** (sprite segments) not generic lightning, so it is unique.
- Art: `fx_xich_tim.png` (chain-link segment tile), `dan_lienket.png` (hollow violet ring bolt).
  - Prompt: "Single glowing violet chain link segment, horizontal, metallic with purple glow, tileable, [SFX suffix]."

### 4.10 SYNC CANNON (`dongbo`, Gold, Cosmem) — OFFLINE / SYNCED / FULL SYNC (3+ / 6+ same-★)
- Look: S1 grey disc with 1 lit segment · S2 3–6 segments lit gold, gold sync lines to same-★ units (exists) · S3 full gold ring, segments pulse in sequence like an equaliser.
- **Attack:** S1 single **gold pellet**. S2 pellet **pulses in sync**: all Sync Cannons fire on the same beat (visual sync, ±0.05 s) with a gold wave from each muzzle. S3 synced **volley**: on the beat, a thin gold **beam** from each Sync Cannon converges on the same target, hit = gold ring + "+15% crit" chance shows as gold sparks.
- Art: `fx_dongbo_song.png` (gold muzzle wave), reuse `tia_laser` tinted gold.
  - Prompt: "Gold concentric sound-wave arcs radiating right from a point, three thin arcs, [VFX suffix]."

### 4.11 HYDRA (`hydra`, Gold, new) — 1–3★ / 4–6★ / 7★ awakened "HỢP ĐẦU"
- Look: S1 round body, 1 serpent-neck barrel · S2 3–4 necks fanned to the right · S3 one big dragon-cannon head with gold crest, emerald glow.
- **Attack:** S1 thin **emerald needle**. S2 each neck fires its own needle at a *different* enemy (fan of thin lines, staggered 40 ms). S3 necks merge → **giant piercing emerald beam** straight through every enemy on one line, 0.6/s, 3 frames wide→thin, ground glyph line; 1 px shake.
- Transform S2→S3: 650 ms — necks retract (twist) 150 ms → crest snaps up → emerald flash → beam warm-up glow.
- Art: heads `hydra_nong_s1..s3.png`; `dan_hydra.png` (emerald needle); `tia_hydra.png` (beam tile).
  - Prompt (sheet): "Three-stage turret head sheet, 3 equal cells: (A) round gold body with one serpent-neck barrel pointing right; (B) same body with four serpent-neck barrels fanned to the right; (C) single large dragon-cannon head with gold crest and emerald glowing mouth pointing right; same center and scale, [SFX suffix]."

### 4.12 NINE-TAIL (`cuuvi`, Gold, new) — tails 0–3 / 4–6 / 7–9 + 7★ awakened blue-white fire
- Look: S1 gold fox head on disc · S2 3–6 metal tails fanned around the rim (count visible = gauge) · S3 9 gold-white flame tails in a perfect ring; awakened 7★ = blue-white fire.
- **Attack:** S1 small **orange foxfire** orb. S2 orbs leave a curling flame trail; each tail adds a tiny tail-flick. At 9 tails → **release**: 9 **homing foxfires** fly in curved arcs (staggered 50 ms) then tails reset. 7★: foxfires blue-white, explode 40 px.
- Transform: tails appear one by one (each 120 ms pop) — the gauge *is* the art; release = tails flare 200 ms then fade.
- Art: heads s1–s3; `dan_cuuvi.png` (orange foxfire), `dan_cuuvi_xanh.png` (blue-white), `cuuvi_duoi.png` (single tail sprite to rotate ×9 in code).
  - Prompt: "Single stylised flame fox tail, gold-white fire, curved, base at canvas center extending right, [SFX suffix]."

### 4.13 CHRONO THRONE (`ngaithoigian`, Red, new) — 1–3★ / 4–6★ / 7★
- Look: S1 black-gold clock face, 2 hands · S2 + 12 red hour dots + gear wings · S3 throne with 4 hourglass wings, ruby core, hour-hand barrel.
- **Attack:** S1 **clock-hand dart** (thin gold needle, pierces 1). S2 needle + **clock ring stamp** on hit (thin gold circle with 12 ticks, enemy slows a hair). S3 needles **pierce all** and leave a short **time-echo** (ghost copy hits again 0.3 s later at 40%). Active REWIND: VHS scanlines + enemies reverse 0.6 s (as designed).
- Art: `dan_kimgio.png`, `fx_dongho_vong.png` (12-tick ring).
  - Prompt: "Thin gold clock-hand needle projectile pointing right with a small ruby counterweight, [SFX suffix]."

### 4.14 WYRM ENGINE (`ronglua`, Red, new) — 1–3★ / 4–6★ / 7★
- Look: S1 red-black mecha dragon head · S2 + gold horns, neck fins · S3 mechanical bat wings wrapped around round body, white-hot eyes/throat.
- **Attack (cone):** S1 **orange flame cone** 40–50°. S2 **blue flame** (+30% vs big) and cone edge sparks. S3 **white flame** core with blue rim, burnt trail on path 4 s, cone length +, heat haze. Active DRAGON DIVE: dragon silhouette sweeps the whole path + 2 px shake.
- Art: `tia_lua_xanh.png`, `tia_lua_trang.png` (cone sprites), `fx_vet_chay.png` (scorch decal).
  - Prompt: "Flame cone seen from above, 60 degree wedge pointing right from canvas center, blue fire with white core, [VFX suffix]."

### 4.15 RESONANCE GRID (`luoicheo`, Gold support, new) — suggested 3 states by number of diagonal buffed units (0–1 / 2–3 / 4)
- Look: S1 square frame rotated 45°, 4 diagonal prongs dim · S2 prongs lit teal, diagonal beams to buffed units · S3 frame spins slowly, teal ring and an X-shaped light lattice.
- **Attack:** support, does not shoot → its "attack effect" is what it gives: S2 buffed neighbours' shots gain a **teal spark ring** on hit; S3 every 3rd shot of each diagonal neighbour fires an **extra teal echo bolt** (visual for the +dmg). Keep teal tiny so the neighbour's own identity stays.
- Art: `luoicheo_nong_s1..s3.png`, `fx_cong_huong.png` (teal echo ring).
  - Prompt: "Square metal frame rotated 45 degrees with four glowing teal prongs at the diagonal corners, center emitter, no barrel, [SFX suffix]."

---

## 5. Art shopping list (priority)

| Priority | Asset | For |
|---|---|---|
| P1 | `fx_soi_cao_s1/s2/s3`, `fx_soi_hu` | Mech Wolf — closest to DCDW Werewolf awakening |
| P1 | `dan_ngoisao_s3`, `fx_ngoisao_no` | Star Cannon Supernova (Darby) |
| P1 | `fx_orbital_tam`, `fx_orbital_cot` | Orbital bombardment (Mafdet) |
| P1 | `fx_overlord_cot` | Overlord S3 pillar |
| P2 | `dan_cuongno_s3`, `dan_lienket`, `fx_xich_tim`, `fx_dongbo_song` | Purple/Gold stage shots |
| P2 | `dan_hopbi`, `dan_tienhoa_s2`, `fx_hopbi_mo`, `fx_tienhoa_len` | Transform boxes |
| P2 | `dan_lophanung_kim`, `fx_bang_luoi` | Cryo |
| P3 | heads s1–s3 + shots for hydra, cuuvi, ngaithoigian, ronglua, luoicheo | new units when coded |

Production rules (from our bible): keep pivot at exact centre, projectiles authored pointing RIGHT, rings perfect circles, cut magenta to real alpha and check edges on grey/black/white; never bake VFX into head art.

## 6. Suggested next code task (not done here)
1. Add `GROW_ATK` table (stage → projectile sprite, trail, hit FX, sound).
2. In `ban()`/HU spawn read `T.gd` to pick sprite; TVX keeps adding tier richness on top.
3. Test at 48 px with 15 units on board; check that S3 FX never hides enemy lane or star pips.

---

## Sources
- [Destiny Child: Defense War — deck guide (tiprelay, KR)](https://tiprelay.com/%EB%8D%B0%EC%8A%A4%ED%8B%B0%EB%8B%88-%EC%B0%A8%EC%9D%BC%EB%93%9C-%EB%94%94%ED%8E%9C%EC%8A%A4%EC%9B%8C-%EB%8D%B1-%EC%B6%94%EC%B2%9C-%EC%A1%B0%ED%95%A9-%EC%A0%95%EB%A6%AC/) — awakened Werewolf: every attack crits, 30% chance, hits only the front; Darby total-star deck.
- [GameInsight launch review (KR, 27 Nov 2020)](https://www.gameinsight.co.kr/news/articleView.html?idxno=21782) — Live2D detail, ~50 Children.
- [Random Growth Dice — randomdice.wiki.gg](https://randomdice.wiki.gg/wiki/Random_Growth_Dice)
- [Growth Dice — randomdice.wiki.gg](https://randomdice.wiki.gg/wiki/Growth_Dice)
- [Solar Dice — randomdice.wiki.gg](https://randomdice.wiki.gg/wiki/Solar_Dice)
- [Typhoon Dice — randomdice.wiki.gg](https://randomdice.wiki.gg/wiki/Typhoon_Dice)
- [Gamertweak Random Dice tier list](https://gamertweak.com/random-dice-tier-list/) — "Transform" dice category.
- [YouTube: Defense War — Mafdet Challenge gameplay (Kogi MH, 2021)](https://www.youtube.com/watch?v=GIDdWGagsho) — confirms Mafdet decks; no description of effects.
- [YouTube: "Defense War — A New Character 'Mafdet' has Appeared!"](https://www.youtube.com/watch?v=lO_FgWAauDE) — title only (from search).
- Blocked this run (listed for manual reading): [NamuWiki DCDW/Card](https://en.namu.wiki/w/%EB%8D%B0%EC%8A%A4%ED%8B%B0%EB%8B%88%20%EC%B0%A8%EC%9D%BC%EB%93%9C:%EB%94%94%ED%8E%9C%EC%8A%A4%20%EC%9B%8C/%EC%B9%B4%EB%93%9C), [NamuWiki Werewolf](https://en.namu.wiki/w/%EC%9B%8C%EC%9A%B8%ED%94%84(%EB%8D%B0%EC%8A%A4%ED%8B%B0%EB%8B%88%20%EC%B0%A8%EC%9D%BC%EB%93%9C)), [NamuWiki Mafdet](https://en.namu.wiki/w/%EB%A7%88%ED%94%84%EB%8D%B0%ED%8A%B8(%EB%8D%B0%EC%8A%A4%ED%8B%B0%EB%8B%88%20%EC%B0%A8%EC%9D%BC%EB%93%9C)), [Destiny Child fandom — Werewolf](https://destiny-child-for-kakao.fandom.com/wiki/Werewolf).
- Repo: `DCDW-WIKI.md`, `DCDW-WIKI-TOM-TAT.md`, `QUAN-SAT-10-VIDEO-DCDW.md`, `TUONG-MOI-20.md`, `thap-art/TU-VAN-THIET-KE-64-U.txt`, `thap/js/phattrien.js`, `render.js`, `tiervfx.js`, `hieuung.js`.

---

## Tóm tắt (tiếng Việt)
- DCDW = **Destiny Child: Defense War** (bản Random Dice khoác skin Destiny Child). Ụ "thức tỉnh" chính: **Werewolf** (30% ra bản thức tỉnh, cận chiến, đòn nào cũng chí mạng), **Mafdet** (ghép → mọi Mafdet bắn phá từ trời), **Darby** (tổng sao bội 10 tăng tốc, 50★ thức tỉnh +350%). Tổ tiên Random Dice: Growth, Random Growth, Solar, Typhoon.
- Namu/fandom chặn máy nên **hình dạng thức tỉnh của DCDW chưa xác minh được** bằng chữ; phần hình ảnh ghi rõ là suy luận [I]. Gửi 2–3 ảnh/clip là chốt được.
- Quy luật: tối đa 3 dạng, báo trước bằng vòng tiến độ, mỗi dạng đổi **cách bắn** (đạn → chùm/xích → tia/pháo trời/chém/lửa nón), biến hình ~560 ms, ụ chu kỳ chỉ nảy 220–300 ms.
- Đã đề xuất cho cả 15 ụ: hình 3 dạng + **đòn đánh mới từng dạng** + hoạt ảnh biến hình + danh sách ảnh cần vẽ kèm prompt (nhìn thẳng từ trên, tròn tuyệt đối, nền magenta).
- Ưu tiên vẽ trước: vuốt 3 cấp + tiếng hú của Sói Máy, sao chổi Supernova, tâm ngắm + tia trời Vệ Tinh, cột sét Overlord.
