# Audit C — description vs code (TURRET MERGE, group C)

Scope: lienket kepha taylo khien hopbi nangsao tuthan xaotron epxung no5 bao anhsang aten dongbo vughep sinhdoi hasao saochep ngoisao soi tienhoa cauvong lophanung haoquang (24 turrets).
Sources checked: `TEXT.turret[id].skill` (text.js), `SKILLS[id].mo` and other text fields (skills2.js), `MOC_RIENG`/`MOC_CHUNG`, `HO_MOI`, `GROW` (phattrien.js), `KY_NANG_CAP` (data.js, card-level rows in thebai-ui.js), `SUP[id].chu` (support.js — this is the "Effect" column of the ★1→★7 table on the turret page), `SUP_GIA` (buff.js), `ATK[id]` stage texts (growfx.js), skill-demo captions `SD_K` / `SD_MO` / `SD_GD` (skilldemo.js), turret-page rows (unitpage.js), preset-deck plans (bobai.js).
Code paths read: skills2.js, hotro.js (HOTRO.k / caps / apDung / dkHeSo / khiTrung / ghep + chanKhien wrappers), game.js (taoU, trieu, sinhDoi, ghep, dmgU, tocU, capNhatBan/capNhatU), growfx.js overrides (soi, ngoisao, lienket, dongbo, lophanung, hopbi/tienhoa poke).
Rule: the text follows the code. There was one display-only code change (Reaper Pillar `tile`, see below). Gameplay is unchanged.

Runtime check (Playwright, 4000 rolls each at the base card level): Werewolf Awakened 29%, Merge King Golden 9%, Twin Maker +1★ 10%. These match the texts (30% / 10% / 10%). The Reaper execute buff on a neighbour is 0.195 both before and after the change.

## Mismatches fixed

| Turret | Where | Text said | Code actually does | Fix |
|---|---|---|---|---|
| hopbi (Mystery Box) | phattrien.js MOC_RIENG 3★ | "Opens 10s sooner" | `can`: 58 s → 46 s at 3★ (12 s sooner) | text: "Opens 12s sooner" |
| tienhoa (Evolver) | MOC_RIENG 3★ | "Evolves 20% faster" | countdown × 0.8 (20% less time, which is 25% faster) | text: "Countdown 20% shorter" |
| haoquang (Holy Halo) | MOC_RIENG 3★ / 7★ | "Barrier 2.5s" / "Barrier 3.5s + 30% speed" | `tg` = 3 + 0.5 (3★) + 1 (7★) → 3.5 s / 4.5 s; 7★ gives +30% fire rate | text: "Barrier 3.5s" / "Barrier 4.5s + 30% fire rate" |
| nangsao (Star Lift) | MOC_RIENG 3★ | "+18% fire rate to the 2 lowest" | `them` = min(30% × 1.3 = 39%, 24%/★) → already 39% (capped) at 2★/3★ | text: "The 2 lowest get the full +39% fire rate (cap)" |
| nangsao | text.js skill | "(24% per ★)" | 24%/★ but capped at 39% (before power-ups) | text: "(+24% per ★, max +39%)" |
| tuthan (Reaper Pillar) | `mo`, support.js chu (★-table), buff.js SUP_GIA | `mo` capped at 15.0%; ★-table / buff panel showed the raw 24.0% | HOTRO cap `chet` 0.15 × CAP_BAC[tim 1.3] = **19.5%** (Reaper is the only `chet` source) | display fix: `tile()` clamps to that same cap (no gameplay change, verified); `mo` uses `tile` directly |
| hasao (Star Breaker) | MOC_RIENG 7★ | "merge surge +32%" | `dot` = 0.2 × HOTRO.k / 1.45 → about 32% at **1★**, about 75% at 7★ (the old comment predates the tier multiplier) | text: "merge surge ×2.35" |
| hasao | `mo`, support.js chu | uncapped damage % (7★ showed 54%) | damage group cap 35% × CAP_BAC[vang 1.5] = 52.5% | show min(cap, k) |
| hasao | text.js skill / `mo` | only PVP mentioned; `mo` CO-OP only | Co-op: any first 5★ each wave → ally's lowest Attack turret +8% 6 s; Solo: your own lowest | text: added Co-op + Solo clauses (unit page "Modes" rows now parse correctly) |
| cauvong (Rainbow) | `mo`, support.js chu | uncapped (7★ "+70%") | conditional damage shares the 52.5% damage cap | show min(cap, k) |
| cauvong | text.js skill | "Co-op/Solo: …" | (behaviour right) but unitpage `upCheDo` regex turned it into a Co-op row "/Solo: enemies…" | text restructured: "Solo: …; Co-op: the same, on your path; PVP: …" |
| lophanung (Cryo Reactor) | `mo`, support.js chu | uncapped (3★ "+81%", 7★ "+132% vs slowed") | conditional damage cap 35% × 1.7 = 59.5% | show min(cap, k); `mo` also gains "charges 24s" and "(bosses 0.8s)" freeze |
| lophanung | growfx.js ATK stage 3 | "enemies shatter into shards" (sounds like damage) | ICE STORM only freezes (`chuDong` has no damage; `HU.voBang` is never spawned) | text: "…freezes nearby enemies (no damage)" |
| lophanung | skilldemo caption | "Tap when charged: freeze all" | freezes enemies within r × 1.6 only | "freeze nearby" |
| dongbo (Sync Cannon) | growfx.js ATK stages | "same-star Attack **neighbour(s)**", "3+ … the biggest +damage" | board-wide (`toanBan`); buff does not grow with count; 5★ adds fire rate at 2+ matched | text rewritten: board-wide, "same +damage each", "5★: 2+ matched also +fire rate" |
| dongbo | unitpage.js spec "Buffs" + footprint diagram | "4 neighbours" + 4-cell diagram | whole board | "Whole board"; footprint section hidden for `toanBan` |
| dongbo | bobai.js CHAIN COMBO plan | "Sync Cannon buffs same-star neighbours" | every same-star Attack turret on the board | text fixed |
| vughep (Merge King) | unitpage.js "Normal merge" row | "Two Merge King … merge into a random turret" | `ghepDB.cungLoai`: MK + MK → one Merge King +1★, Golden kept | row text for `cungLoai` turrets |
| saochep (Copycat) | skilldemo caption + SD_MO | "half damage" / "Copy deals 50% damage" | `heSaoChep` = KY_NANG_CAP 70% → 94% (card level) | live % (another agent also switched it to `sdPct`; kept theirs, wording "damage") |
| saochep | `mo` | "copy at 70% **power**" | only damage is scaled; a copied support keeps full buff (`HOTRO.kThe`) | "% damage" |
| saochep | HO_MOI | "becomes a copy of any turret" | same-star only | "any same-star turret" |
| sinhdoi (Twin Maker) | text.js skill, HO_MOI | "10%: one star higher" | 10% + 1%/card level (max 16%) | "10%+" |
| sinhdoi | `mo` at 7★ | "(10%: 7★ instead)" | nothing to roll at 7★ | clause hidden at 7★ |
| epxung (Overclock) | text.js skill, `mo` | "Drag onto a same-star turret" | `hopLe` needs `SKILLS[b].dmg` (shooting turret, not Support/box) | "same-star shooting turret"; skill adds "(stacks)" |
| epxung | skilldemo SD_MO | "+90%" fixed | card level 90 → 112.5% | live `knThe` |
| soi (Werewolf) | `mo` 7★ | "howl +25% to neighbours" | +25% **fire rate** to N/E/S/W neighbours | "howl: neighbours +25% fire rate" |
| kepha (Jammer) | text.js skill | PVP + Co-op only | Solo: speeds your own top turrets | added "; Solo speeds your own" |
| xaotron (Scrambler) | text.js skill | "On merge: PVP shuffles rival turrets" | Co-op/Solo: turns lone turrets (ally / own) into merge pairs | added Co-op + Solo clauses |
| taylo (Cleanser) | text.js skill | "cleanses 2 neighbours" | up to 2 (only debuffed ones) | "up to 2" |

## Not fixed — reported (balance / design, not text)

- **Reaper Pillar card level does nothing**: its KY_NANG_CAP row "Execute 24% → 25.2%" is the raw value. The real chance is already capped at 19.5% at 1★, so leveling the card, stars and power-ups do not raise the execute chance. This is a balance issue; I left the row as is.
- Cryo Reactor's "Slowed dmg +56% → …" row and the generic support milestone "Aura ×1.9 / ×2.35" are also hidden by the damage cap (59.5%) from about 2★ up. The same happens for Star Breaker and Rainbow at 7★ (52.5% cap).
- Cryo Reactor and Holy Halo **auto-cast for the human player** (`!B.ai && napDay > 6 / 0.3 && aiNen`). The text says "TAP"; that is still true, but they also fire on their own.
- unitpage `upTam` shows "Reach: Whole path" for non-shooting turrets (generic, all Support / box turrets).
- meta.js `ROSTER_EMBED.kyNang_vi` (Vietnamese, search only) is stale for taylo/khien/nangsao ("On merge…"). It is out of English scope.
- `HU.voBang` (Cryo shatter blast) is dead code. Nothing spawns it.

## Checked, OK

- **lienket**: skill, `mo` (+40%/link, N/E/S/W flood fill, stones break), GROW 2 / 4+ (arc ×0.5 within 90 px), ATK, SD texts.
- **kepha**: `mo` (n = 1 + ⌊★/2⌋, −40% fire rate via `st.kep`, co-op 70% + 5%/★), SD captions.
- **taylo**: 12 s / 2 (5★ 9 s / 3), +18% when nothing to clean, 7★ +20% 4 s, support chu, KN row.
- **khien**: 18/16/14/10 s, KN 18 → 14.4 s, 7★ +20% 4 s on block (hotro.js), no stacking.
- **hopbi**: 58 s (46 s at 3★), 1–6★ / 3–6★ / 5–7★ (`rint`), GROW, ATK poke 0.3×, KN row.
- **no5**: every 5th (`banLan % 5`), 3 bolts ×2, 34 px; MOC 'tu' (no double tap).
- **bao**: 4.5/s + 5%/★, −30% per adjacent Storm Gun, 20% arc 70% within 96 px.
- **anhsang**: max(9, 21 − 1.6★) s free 1★ summon.
- **aten**: ×4 (7★ ×6) vs poisoned, kill blast ×2 50/70 px, 5★ poisons.
- **dongbo**: skill, `mo`, MOC 5★/7★, GROW dk, PVP −3% → −6% (max 8%), KN 17.25%.
- **vughep**: skill, `mo` (live gold %), xemSao, stone/frozen allowed (quaKhoa), KN 10 → 22%.
- **ngoisao**: luat (10 / 50 milestones, exact-hit bonus), demTT, GROW, ATK, KN ×100 → 130%.
- **soi**: 30% + 1.5%/level (cap 50%), always crit, +40%, MOC 3/5, GROW dk, ATK, SD.
- **tienhoa**: 14 + 5★ s, 5★ 25% +2★, 7★ fizzle, GROW, SD.
- **cauvong**: 7 s, 6 + 0.5★ s, co-op +4 + 1★%, PVP −(8 + 2★)%, 5★ 2 trails, 7★ slow 10% (non-PVP only).
- **lophanung**: radius 110 + 5★ (+20 at 3★), slow 20% + 2.5%/★ (bosses 15%), MOC 5/7, GROW.
- **haoquang**: cooldown max(20, 30 − 2★), leaks / boss skills (hotro.js), 5★ cleanse, SD.
- **hasao**: 5★ milestone, merge surge trigger (real merges + Merge King only).
- **tuthan**: thresholds 30% / 40% (5★), 7★ big enemies under 15%, bosses ≤1% max HP.
- **nangsao**: 5★ pip / wave, 3 pips (7★: 2), max 2★ per match.
- **sinhdoi**: same star as material, random deck card, once per merge (Set of ids).
- **saochep**: same star, keeps Awakened/Golden + Aurora/Overclock, KN 70 → 94%.
- **epxung**: KN 90 → 112.5%, permanent until merged.

## Files changed (my lines only)
thap/js/skills2.js, text.js, phattrien.js, growfx.js, skilldemo.js, support.js, unitpage.js, bobai.js
