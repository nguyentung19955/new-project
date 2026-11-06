# Audit A: description vs code (skills.js, skills3.js, skills5.js turrets)

Scope: the 28 turrets in `thap/js/skills.js` (canon lien bang doc tia set mana radar mimic laser mortar railgun orbital wallgen blackhole overlord), `thap/js/skills3.js` (nayda combo khoathoigian hydra cuuvi pandora luoicheo ngaithoigian) and `thap/js/skills5.js` (chuato leviathan khoisinh ronglua).

Texts checked for each turret: `TEXT.turret[id].skill`, `SKILLS[id].mo`, `NHIP` (fire-rate line), `MOC_RIENG` / `MOC_CHUNG` (3★/5★/7★, checked against `ms()`/`mocChung()` in the code), `GROW[id].dk` (shown on the unit page), `ATK[id]` (growfx.js "attack by stage"), `HO_MOI`, `KY_NANG_CAP` (card rows), `SUP[id].chu` (support.js / tuongmoi-ui.js), unit page (`upLuatGhep`, `upCheDo`), skill demo (`SD_K`, `SD_GD`, `SD_MO`, `SD_MOC_NGAN`).

Rule: the text follows the code. No gameplay code was changed. The only code edits are display formulas, so the shown numbers now match the real ones (caps, live card level, live interval).

| Turret | Where | Text said | Code actually does | Fix |
|---|---|---|---|---|
| bang (Frost) | text.js skill, skills.js `mo` | "freezes … (bosses 0.6s)" | Bosses are never frozen: `chan` on a boss means a 50% slow (game.js `capNhatQuai`). Big enemies get ×0.6 duration. Frost Flyers (`khangCham`) can't be picked. | text: "bosses: 50% slow 0.6s"; `mo` adds "big ×0.6; bosses only 50% slow 0.6s", "Frost Flyers immune" |
| bang (Frost) | phattrien.js MOC 3★ | "Freeze lasts 2.5s" | +0.5s on top of the card-level freeze time (2s to 2.98s) | "Freeze +0.5s" |
| mana (Mana Core) | support.js `SUP.mana.chu` (board tap label and unit-page star table) | "+N MANA / 7s" at every star | Interval is 7s, 6s from 3★, 5s at 7★ (`SKILLS.mana.ky`) | uses `SKILLS.mana.ky(T)` |
| radar (Radar) | skills.js `mo`, support.js `SUP.radar.chu`, MOC 7★ | uncapped "+X% fire rate"; OVERDRIVE "+25% fire rate 2s" | Fire rate is capped at 45% × tier factor (Rare 1.1, so 49.5%). At 7★ the 42% aura plus 25% OVERDRIVE is cut to 49.5%. At high card levels the aura alone exceeds the cap. | shown value capped; `mo` and MOC say the cap still applies |
| mimic (Mimic) | unitpage.js "Joker merge", skilldemo SD_K / SD_MO | "+50% attack for 8s" (fixed number) | +`knThe(mimic)`% damage (50% at the starting card level, up to 74%) | live card-level value, worded "damage" |
| laser (Laser) | skills.js `mo` | "Beam ramps to ×4 over 3s" | Same, but it targets the lead enemy, resets when the target changes, and the beam has `crit:false`, so the 7★ APEX "+10% crit" does nothing | `mo` adds "on the lead enemy (resets on switch) · beam never crits" |
| set (Tesla) | skills.js `mo` | "Chains to 1 enemies" | Each jump is up to 120 px, and damage is ×0.88 per jump | grammar fixed; adds "120 px jumps, −12% per jump" |
| orbital (Orbital) | growfx.js ATK stage 3 | "salvo … every 1.8s" | 1.8s, then 1.5s from 3★ (QUICK HANDS) | "every 1.8s (1.5s from 3★)" |
| overlord (Overlord) | phattrien.js HO_MOI | "(active-tier finisher)" | Has no active skill; it is passive | "(passive finisher, no active skill)" |
| nayda (Ricochet) | text.js skill | "Disc bounces to N enemies" | Hits the first target and then bounces N times, so N+1 enemies are hit | "Disc hits, then bounces N more times (N = stars)…" |
| combo (Combo Core) | text.js skill → unit page "Modes" | no mode note, so the unit page said "Works the same in solo, co-op and PvP" | Co-op: adds ½ of the ally's COMBO if the ally runs Combo Core (`hieuLuc`) | adds "; Co-op: also counts half of an ally's COMBO" |
| combo (Combo Core) | skilldemo SD_MO | "Each combo: +6% damage" | 6% at 1★ up to 12% at 7★ (`c(T)`) | live value |
| khoathoigian (Chrono Lock) | skills3.js `mo` | "locks the lead enemy … bosses: 50% slow, half time" | It picks the lead NON-boss enemy, and a boss only if nothing else is there. A locked boss also gets half the burst %. | "lead non-boss enemy … a boss (only if nothing else): 50% slow, half time, half burst" |
| hydra (Hydra) | skills3.js MOC 7★, `NHIP.hydra` | "×6 piercing beam, 0.6/s" | 0.6 × (1 + fire-rate buffs). The general 3★ QUICK HANDS (+20%) always applies, so the base is 0.72/s. | MOC "0.72/s"; NHIP shows the live value (and the SD_MOC_NGAN key is updated) |
| pandora (Pandora Vault) | skills3.js `mo`, MOC 5★/7★, GROW dk, skilldemo SD_GD | "7★: OPEN: 2 effects / Every opening fires 2 effects"; 5★+ "next merge rolls twice" | The effect uses the RESULT star (`a.sao+1`). Merging two 5★ (into 6★) rolls twice. Merging two 6★ (into 7★) fires 2 effects. A 7★ can't merge at all. | `mo`: 5★ "next merge (into 6★) rolls twice…", 6★ "next merge (into 7★) fires 2 effects", 7★ no line; MOC "Merging 5★s rolls twice…" / "Merging 6★s (into 7★) fires 2 effects"; GROW and SD_GD to match |
| pandora (Pandora Vault) | text.js skill → unit page "Modes" | said "Works the same in all modes" | Co-op: star gift, shields and frenzy also hit the ally board | adds "; Co-op: star gift, shields and frenzy also hit your ally" |
| luoicheo (Resonance Grid) | skills3.js `mo`, tuongmoi-ui.js `SUP.luoicheo.chu` | "+65% damage" (6–7★ with full RESONANCE) | The damage buff is capped at 35% × Legendary 1.5 = 52.5% (checked: real `buf.dmg` = 0.525) | shown value capped, plus "(damage cap)" |
| luoicheo (Resonance Grid) | growfx.js ATK stage 3, skilldemo SD_GD | "fires an extra teal echo bolt" | The echo bolt has `T:null` and no `trung()`, so it does no damage | "(visual, no damage)" |
| ngaithoigian (Chrono Throne) | text.js skill → unit page | "Works the same in all modes" | Co-op: Rewind pulls back every enemy on both paths; at 7★ it also saves one leak per match | adds "; Co-op: Rewind hits both paths"; MOC 7★ adds "also saves 1 leak" |
| ngaithoigian (Chrono Throne) | MOC 3★ | "(tap when full)" | If the player leaves it full for over 5s and enemies are near the exit or a boss is up, it fires by itself | "(tap when full; auto-fires if left full)" |
| ngaithoigian (Chrono Throne) | skilldemo SD_MO | "Enemies slow up to 15%" | 15% at 1★ up to 35% at 7★ | live `sMax(T)` |
| chuato (Hive Queen) | MOC 5★ | "QUICK BROOD: More drones, faster hatching" | There is no 5★ special: the drone cap and hatch time just scale with stars (5★ = 7 drones, one every 2.8s). This entry also blocks the general DOUBLE TAP. | "Up to 7 drones, one every 2.8s" |
| chuato (Hive Queen) | skills5.js `mo` | "perched drones +10% fire rate to 4 neighbours" | From 4★, all N/E/S/W neighbours get +10% as long as the hive has at least 1 drone, perched or not | "while it has drones: N/E/S/W neighbours +10% fire rate" |
| chuato (Hive Queen) | growfx.js ATK stage 1 | "up to 3–4 orbiting drones" | 1–3★ cap = 3/4/5 | "3–5" |
| chuato / leviathan / khoisinh / ronglua | MOC 3★ | "Unlocks the active skill (tap when full)" | `napChuDong`: the player's board auto-fires it after 6s full when it is worth it | "(tap when full; auto-fires if left full)" (SD_MOC_NGAN key updated) |
| leviathan (Leviathan) | text.js skill, HO_MOI (skills5.js `themHo`) | "endless stacks" | ABYSS stacks are capped at 100 (`Math.min(100, …)`) | "damage stacks (max 100)" |
| leviathan (Leviathan) | growfx.js ATK stage 2, skilldemo SD_GD | "wider splash ring" | Splash damage radius is always 30 px; only the ring effect is bigger | "bigger splash ring (same 30 px)" / "Eats big enemies too" |
| khoisinh (Genesis Core) | text.js skill → unit page | "Works the same in all modes" | Co-op: it raises the ally's lowest turret instead if that one is lower | adds "; Co-op: may raise your ally's lowest turret instead" |
| doc (Venom) | skilldemo SD_K caption | "Marked: +12% damage from all" (fixed) | +`knThe(doc)`% (12% up to 17.6% with card level) | live value |

## Checked, OK (no mismatch)

canon (Cannon), lien (Gatling), tia (Sniper), mortar (Mortar), railgun (Railgun), wallgen (Wall Projector), blackhole (Black Hole), cuuvi (Nine-Tail). Wyrm Engine (ronglua) had only the shared 3★ auto-fire wording fix. Frost, Venom, Mana, Orbital and Overlord had no other issues beyond the rows above: their MOC 3★/5★/7★, GROW, card rows and `mo` lines match.

Also verified with no change needed:
- `KY_NANG_CAP` card rows for mimic, orbital, mana, bang, doc, radar and luoicheo. The base and max values equal the real formula (support turrets include the tier factor HOTRO.BAC, for example Radar 0.12 × 1.5 = 18%, Resonance 0.08 × 2.3 = 18.4%).
- General milestones (`loaiMoc`) for every turret: 'ban' / 'tu' / 'khac' / 'ht' match how each one fires (QUICK HANDS through `T.buf.toc` / `nhipU`, OVERCHARGE / APEX through `heSoMocDmg`, DOUBLE TAP through `mocBanXong`).

## Notes, not changed

- Chrono Throne boss slow cap: bosses cap at 20% even when the normal cap is lower (15% at 1★, 18% at 2★). The `mo` line already says this ("bosses 20%"), so I left the code as it is. Worth a design look.
- Static TEXT.skill numbers (Radar 18%→42%, Orbital 23s, Frost 2s) are starting-card-level values. The live lines (`mo`, card rows) show the real values.

Verification: a Playwright check (headless page at http://localhost:8765/thap/) evaluated `mo`, `tocTT`, `SUP.chu`, `upCheDo`, `mocCua` for all 28 turrets at 1/3/5/6/7★ and a few SD_MO lines. There were no page errors. A Resonance Grid board (7★ with 4 diagonals) confirmed the real buf.dmg = 0.525 matches the new capped text. A Radar check confirmed the 49.5% fire-rate cap. `node --check` passes on every changed file.
