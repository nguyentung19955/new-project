# Audit B: description vs code (TURRET MERGE, turrets in the first half of skills2.js)

Rule: text follows code. 24 turrets checked: xucxac phun sungluc maychem phagiap bua nam bomhen nhanmana kiembang chimang dichchuyen drone tron nangluong lanhgia khuech vungdoc loa hutmana min cuongno baotuyet nhanban.

What I read for each turret: `TEXT.turret[id].skill` (text.js), `SKILLS[id].mo(T)` and the other fields on the entry (skills2.js), `MOC_RIENG` / `MOC_CHUNG` / `HO_MOI` / `GROW` / `NHIP` (phattrien.js), `KY_NANG_CAP` (data.js, card rows in thebai-ui.js), `SUP[id].chu` (support.js, which the unit-page star table and the skill demo use for Support turrets instead of `mo`), and the skilldemo.js captions and `SD_MO`. Code paths I traced: game.js (`dmgU`, `tocU`, `critU`, `trung`, `capNhatU`, `ghep`), hotro.js (`HOTRO.k`, `apDung` caps, `dkHeSo`, `khiTrung`, `vuln`) and the `HU.bom` / `HU.drone` / `HU.min` / `HU.may` handlers. I checked the numbers by running every `mo` / `SUP.chu` at 1★ to 7★ in the live page with Playwright, plus an `HOTRO.apDung` test that measured the neighbour buffs actually delivered.

Main systemic finding: **support buffs are capped per buff group** (`HOTRO.CAP` × `CAP_BAC` of the highest-tier source). Conditional damage (exposed, slowed, amp stacks) shares the damage cap (35% for White, 38.5% for Blue). The slow applied on hit is capped at a flat 35% in `khiTrung` (×CAP_BAC is not used there). Several texts showed the uncapped aura value.

## Mismatches fixed

| Turret | Where | Text said | Code actually does | Fix |
|---|---|---|---|---|
| chimang (Crit Antenna) | text.js `skill` | "9% at 1★ → 30% at 7★" | crit group capped at 0.20 × CAP_BAC.xanh 1.1 = **22%**; delivered buff measured at 22% for 5★, 6★ and 7★ | text: "9% at 1★ → 22% cap from 5★" |
| chimang | skills2.js `mo` | "+27% / +30% crit chance" at 6★/7★ | capped at 22% | text: shows min(value, cap) + "(crit-buff cap)" |
| chimang | support.js `SUP.chu` (unit-page star table, demo) | "+30% CRIT" | 22% max | text: shows the capped value |
| chimang | phattrien.js MOC_RIENG 3/5/7 | "+11%" / "+15%, +10% crit dmg" / "+20% crit; every 6s a sure crit" | stale numbers from before the ×1.5 tier factor: 3★ = 17%, 5★+ = 22% (cap) | text: "+17% crit chance" / "+22% crit chance (cap), +10% crit damage" / "Every 6s each neighbour gets a sure crit" |
| lanhgia (Chiller) | text.js `skill` | "max 38%" | `HOTRO.khiTrung` clamps the applied slow to `CAP.cham` = **35%** (comment: "trần thường 35%") | text: "max 35%" |
| lanhgia | skills2.js `mo`, support.js `chu` | min(0.35×CAP_BAC = 38.5%, value) / uncapped | real ceiling 35% | text: min(35%, value) |
| phagiap (Armor Breaker) | skills2.js `mo`, support.js `chu`, skilldemo caption | "+36% … +52% damage to exposed" (4★ and up) | `dkHeSo` caps conditional damage at the damage cap (35% for a White source, shared with normal damage buffs) | text: `mo` adds "(damage-buff cap 35%)" when above it; `chu` and the demo caption show the capped value |
| phagiap | phattrien.js HO_MOI | "exposes the toughest enemy" | exposes the lead enemy + the toughest (5★: + 2 toughest) | text: "exposes the lead + toughest enemy for its neighbours" |
| khuech (Amplifier) | skills2.js `mo`, support.js `chu`, skilldemo caption | "+13.5% per hit, max 5/7 stacks"; demo "Each gets +67% damage" | stacked bonus capped by `dkHeSo` at the damage cap (38.5%, Blue), so beyond about 3 stacks (2 at 5★) nothing is added | text: `mo` "total up to +39%, damage-buff cap"; `chu` "(MAX +39%)"; demo "Repeat hits: up to +X% damage", and "Buffs the Attack turrets around it" (chiTC) |
| bua (Hammer) | phattrien.js MOC 5★ HEAVY HAND | "crit damage reaches the 50% cap" | 5★ = 0.18 × 1.9 = 34% (the 50% cap is reached only at high card levels) | text: "Aura ×1.9 (crit damage cap 50%)" |
| bua | skills2.js `mo` | "their crits stagger normal enemies 0.2s" | never bosses; each enemy at most once per 3 s (`socMien`) | text: adds "(not bosses; each enemy once per 3s)" |
| min (Mine Layer) | skills2.js `mo` + phattrien.js `NHIP.min` | "every 3.4 s" at 3★ (raw `ky`) | the common 3★ milestone QUICK HANDS adds +20% charge (`mocBuf` → `nhipU`), so 3★ really lays a mine every 2.8 s; other NHIP entries already divide by `nhip3` | text: both use `ky / nhip3(T)`; `mo` adds "(max 6 out)" (`soMin < 6`) |
| sungluc (Revolver) | skills2.js `mo` | "20% crit" at all stars | 7★ APEX adds +10% crit → 30% | text: live `0.2 + themMocCrit(T)` |
| nam (Iron Fist) | text.js `skill`, skilldemo caption | "rapid ring blasts all around" | punches the lead enemy within 105 px; a 36 px blast centred on that **target**, not around the turret | text: "Melee: rapid punches; each blasts a ring around the target" / demo "Each punch blasts enemies around its target" |
| tron (Fusion Mixer) | text.js `skill` | "+3% per different type (max 18% at 1★)" | 6% + 2% × (types − 1), × Blue 1.5 → 9% + 3% per **extra** type; read literally, the old text gives 21% at 4 types | text: "+3% per extra different type" |
| drone (Drone Bay) | skills2.js `mo` | "1 bomb drones ×24" | 1 + ⌊★/3⌋ drones, each 24× damage in a 46 px blast | text: correct plural + "(×24 damage, blast 46 px)" |
| loa (Cooldown Horn) | skills2.js `mo` | "(if ready: cost −15%)" | `Math.max(MAVUONG.gia, gia × 0.85)`: the cost never goes below its base | text: "cost −15%, not below its base cost" |
| baotuyet (Blizzard) | skills2.js `mo` | slow + freeze only | each pulse also hits every enemy for 150% damage (×3 = 450% at 5★ ICE SHARDS) | text: adds "· hits all for 150% / 450% damage" |
| hutmana (Mana Leech) | support.js `chu` | "+0.3 MANA / HIT" (toFixed(1) of 0.35) | 0.35 per hit (`mo` already shows 0.35) | text: toFixed(2) |

## Checked, OK (no mismatch)

- **xucxac** (Dice Gun): roll 3–300% (`3 + rint(298)`); a crit is 1.5× × (2 + crit dmg) = 300%; the Crit Antenna sure-crit is consumed correctly; common milestones apply (`ban`).
- **phun** (Scatter): random target every shot (`T.muc = null`), +8% fire rate per ★.
- **maychem** (Guillotine): execute chance = card value + 0.75%/★ + 0.5%/LV, only vs non-big, non-boss enemies; the card row "Execute 3.75%" matches.
- **bomhen** (Time Bomb): every 2 s (× fire-rate factor), 5 s bomb on a random un-bombed enemy, blast r = 34 + 3★ (+ size), +10% damage taken for 4 s (6 s from 3★), 5★ stagger 0.5 s (not bosses), 7★ 2 bombs. Text and milestones are correct.
- **nhanmana** (Mana Doubler): card value × material ★ × power-up; card row "Merge mana +44" is the 1★ value, the same convention as the other card rows.
- **kiembang** (Ice Blade): ×5 (3★ ×6, 7★ ×8) vs slowed or frozen, chills others within 44 px 20% / 2 s (bosses 15%), 5★ splinters 40% around the target.
- **dichchuyen** (Teleporter): drag onto a same-star turret on your own board (not another Teleporter); works onto stone/frozen targets (`quaKhoa`).
- **nangluong** (Energy Cannon): +100% per 120 current mana, max +500%.
- **vungdoc** (Toxic Pool): pool r = (30 + 2★) × 1.5 at 7★, 5 s; interval `ky` (no common 3★ milestone because it has its own milestones, so the display is correct); 3★ twin pools, 5★ +15% weaken.
- **cuongno** (Berserker): crit 1 → Rage +25% fire rate (5 s, 8 s from 3★), crit 2 → Frenzy +(150 + 15★)% for 5 s (7 s at 5★), 7★ +25% crit in Frenzy. GROW text is correct.
- **nhanban** (Cloner): free deck turret on merge, 2★ when the materials are 2★+ (i.e. the merge makes 3★+).
- **tron** `mo` / `SUP.chu` / milestones, **phagiap** short text (1★ value) and milestones, **bua** card rows: all OK.
- Card rows (`KY_NANG_CAP`) for maychem, nhanmana, loa, phagiap, bua, chimang, tron, lanhgia, khuech: base values equal the code's 1★ values.

## Code bugs

None fixed. Nothing contradicted its own comment or design intent: the caps are documented in the hotro.js header and in the skill comments ("trần 20" / "trần 35%"). The cap leaves part of the Crit Antenna's 6★–7★ growth and of the Amplifier's stacks unused. That is a balance question for the designers, not a text bug.

Out of scope, noted only: `buff.js hoTroTT` prints the uncapped "(current)" value but already appends "CAP reached on a neighbour".
