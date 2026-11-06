# Audit D: description vs code

Scope: skills4.js (9 turrets), skills7.js (4), vangmoi1.js (4), the 3 commanders (TEXT.af / chihuy.js / unitpage UP_MV / skilldemo SD_MV / tien-ui), the 6 classic bosses (TEXT.boss + game.js) and the 6 new bosses (trum.js TRUM_MOI + vaotran.js VT.NGUY).
Rule: the text follows the code. There is one code fix (a clear bug), checked in Playwright.

Texts checked per turret: TEXT.turret[id].skill · SKILLS[id].mo(T) at 1/5/7★ (read at runtime) · MOC_RIENG / MOC_CHUNG · GROW dk · KY_NANG_CAP card row · SUP chips · skilldemo captions / SD_GD / SD_MO · DEMKN.

## Fixes

| # | item | where | text said | code does | fix |
|---|------|-------|-----------|-----------|-----|
| 1 | Mirror Gate vs new bosses | trum.js capNhatTrum wrapper | "blocks a boss skill" | New bosses (Static Jammer, Star Leech) call chanKhien without `G._trumDang`. In SOLO the Mirror never fired. In PVP it treated the boss skill as a rival effect and REFLECTED it (it Clamped the rival's turret). This goes against the comment "Trùm: chặn (không phản)". | **code**: set `G._trumDang` around the block loop. Playwright: solo old = mirror unused, 2 jammed → new = mirror used, 1 jammed. PVP old = rival clamped 1 → new = 0. |
| 2 | Mirror Gate | text.js turret.skill, skills4 mo | "Solo blocks a boss skill" / "blocks a boss skill" | Works in every mode. Blocks the skill on **1 target turret** only: multi-target skills (Mad Crown 3, Freezer 3–5, Octopus 3) still hit the rest. At 7★ the reflect Clamps 2 rival turrets. | text: "Every 20s: PVP reflects 1 control; … blocks a boss skill on 1 turret". mo adds "onto 2 rival turrets" at 7★. |
| 3 | Mirror Gate 5★/7★ | phattrien.js MOC_RIENG.guongcong | 5★ "Aura ×1.9: resist up to 28%" · 7★ "Resist 35%, mirror every 15s" | Resist = min(0.35, 0.15·HOTRO.k). That is already 34.5% at 1★ and 35% from 3★. 5★ adds nothing. 7★ = 15s and reflects onto 2. | text: 5★ "Resist stays at its 35% cap" · 7★ "Mirror every 15s; reflects onto 2 turrets" |
| 4 | Mirror Gate card row | data.js KY_NANG_CAP.guongcong | "Resist 34.5% → 36.8% … 48.3%" | Hard cap of 35% in HOTRO.khang | label "Resist (max 35%)" (balance issue flagged below) |
| 5 | Focus Lens card row | data.js KY_NANG_CAP.thaukinh | "Crit dmg 60% → … 83%" | cdmg group cap 0.5 × CAP_BAC.tim = 65% | label "Crit dmg (max 65%)" |
| 6 | Focus Lens tap chip | tuongmoi-ui.js SUP.thaukinh | "+72%…+141% CRIT DMG" (uncapped) | capped at 65% (mo() already capped) | text: same cap as mo |
| 7 | Focus Lens mo | skills4.js | "pierce 2 enemy behind" | — | grammar: "2 enemies" |
| 8 | Sanctum mo | skills7.js | "Attack neighbours +35%" from 5★ (capped at 0.35) | dmg cap = 0.35 × CAP_BAC.vang = 52.5%. 5★ really gives +44%, 7★ +52%. | text: cap 0.35×CAP_BAC (same as its SUP chip) |
| 9 | Hex Saboteur mo | skills7.js | "— 35% · … SOLO: lead enemy slowed + weakened" | Solo always lands (no roll): slow 30% + vuln +15% for 4s | text: "SOLO (always): lead enemy slowed 30% + takes +15% for 4s" |
| 10 | Nemesis mo | skills4.js | "+1.2% max HP per hit" (6–7★) | bosses capped at 0.8% per hit | text: adds "(bosses 0.8%)" when p > 0.8% |
| 11 | Nemesis 7★ | skills4 MOC_RIENG | "Executions leap to the nearest enemy" | the leap is a normal Nemesis hit on the nearest enemy (110 px). It executes only if that enemy is below the threshold, and it does not chain. | text: "An execution leaps a hit to the nearest enemy" |
| 12 | Marionette mo | skills4.js | "rams others for 30% of its HP" | min(30% puppet HP, dmg×4), up to 6 rams | text: "(max ×4 damage)" + grammar "2 enemies" |
| 13 | Bounty Beacon mo | skills4.js | "+g mana when killed (boss ×5)" | CO-OP: each board gets ceil(g/2) | text: "; CO-OP: split with ally" + grammar "1 enemy" |
| 14 | Holy Shield (Eve) | text.js af.eve.desc | "Clears debuffs + blocks boss skills for 8s" | Clears only freeze/stone/burn/aim (not Clamp/Jam/Hex/−fire-rate). The board shield also blocks rival PVP merge effects. | text: "Clears freeze, stone & burn + blocks boss skills and rival merge effects for 8s" |
| 15 | Holy Shield demo | skilldemo.js SD_MV.eve | "All debuffs cleared" | same as above (the demo shows freeze + stone) | text: "Freeze & stone cleared" |
| 16 | Reinforce details | unitpage.js UP_MV.hero | "Board full: Fills only the empty cells left" | each turret with no free cell gives +1★ to the weakest turret instead (chihuy.js keHoach) | text corrected |
| 17 | Mad Crown | text.js boss | "Turns 3 turrets into random types" | 3 random turrets → random **deck** turret, same star | text |
| 18 | Freezer | text.js boss desc/descN | "3 strongest" | sorted by star (highest first), unfrozen first. CO-OP splits n across both boards. | text: "highest-star" + co-op split |
| 19 | Octopus | text.js boss | "−1★ when the fire ends unless cleansed" | burn 6s → haSao: a 1★ is destroyed | text: "for 6 s … (1★ is destroyed)" |
| 20 | Prism Warden | trum.js TRUM_MOI | "until hit by 3 different turret types" | 4 types from wave 40. The shield comes back ~8.4s after breaking (7s + 1.4s warning). | text (mo + nguy "3–4 types") |
| 21 | Star Leech | trum.js TRUM_MOI | "Kill it to get the stars back" | targets only 2★+ turrets. On death each stolen star goes +1★ to a **random** <7★ turret (no space → mana ×3). | text |

## Flagged, not changed (design/balance; not obvious bugs)
- **Resist cap mismatch**: HOTRO.apDung caps 'khang' at 0.35×CAP_BAC (52.5% for Gold), but HOTRO.khang() uses a hard 0.35. So Mirror Gate's star curve and card levels do nothing past 1★. Focus Lens is the same: from 2★/LV11 its crit-dmg sits at the 65% cap.
- **Halo (haoquang) vs new bosses**: hotro.js wraps thucHienChieu for the Halo weakening. The 6 trum.js bosses bypass it. While Halo is up, only B.khien blocks them fully. (Not my item; Halo text says "boss skills only weakened".)
- skills4.js header comment says Bounty "+10%", but the code is 15% (HOTRO.vuln). The comment is not shown to players, so it was left as is.
- Blood Circuit "drag onto ANY of your turrets": another Blood Circuit is excluded (that is a normal merge). Left as is.

## Checked, OK
- Nemesis: execute only non-big, non-boss · JUDGMENT every 10 boss hits, ≥2s · GROW dk · SD texts.
- Lone Ace: keCan = N/E/S/W (stones/frozen count) · ACE ×2 rate + crit 10–25% · ≥3 neighbours −30% · 7★ pierce 1 · DEMKN chips.
- Focus Lens: k=0.30·HOTRO.k (card base 60 ✓) · 5★ pierce 2 · 7★ 65% pierce · TEXT.turret.
- Signal Jammer: numbers at the merged star · PVP jam −40% (kep ×0.6) + 0.65s warning + 8s immunity + next summon +m · CO-OP free summon + 10% · SOLO 20% slow · SD_MO.
- Bounty Beacon: every 5s/nhipU, big first, +15% vuln (shared 25% cap), boss ×5.
- Eclipse: 8s swap, DAY beam ×d + 4s burn, NIGHT cone (+100 px) ×0.6 + 25% slow 2s, 7★ 1.5s both + ×4 ring (50 px), twins out of phase · MOC/GROW.
- Scrap Forge: f per star (1,1,2,2,3,3,4) = MOC 3/5/7 · 3★ food ×3 · cap 15 = +60% to the highest-star Attack turret · GROW dk · SD_MO.
- Mirror Gate: 20s/15s recharge · PVP reflect = Clamp 4s on 1 (7★: 2) rival turrets · CO-OP copy at ceil(★/2) · GROW dk.
- Marionette: cycle ky/(1+rate), t s, no bosses, big from 4★, 2 at 7★, explosion ×8 60 px, no mana from puppet · MOC/GROW.
- Blood Circuit: higher star, VAMP max 10 (+2 at 7★), 2 VAMP pulse 220%/300% (120 px) · MOC · card row Vamp +6%.
- Hex Saboteur: 35% +5%/★ +2%/LV, cap 80% · MOC 5/7 · PVP −1★ / 1★ disabled 2.5s, shield/mirror at impact · CO-OP +1★ · 8s team cooldown.
- Sanctum: chiTC aura, 8 cells at 5★, shields 14s/4s, cleanse on arrival · MOC · SUP chip · card row.
- Prism Thief: colour every 3s, red burn 3s / gold +40% crit / blue 25% slow 1.5s, COMBO cap 10/15, +6% dmg +4% rate · 7★ all 3 · MOC.
- Ember Relay: + cross only, max 5 flames, +12%/LV dmg +3% crit, +15% rate 5s · GROW "+60% / +15% crit at LV9" ✓.
- Quantum Choir: same-star others on own board (stones excluded), max 7, 7★ +12% rate.
- Fusion Archive: +1 per own merge, max 40, new Archive 50%, Archive+Archive 3×160% pulses (45 px) · GROW dk.
- Hero Foundry: 12s, max 2 tiles (oldest replaced), +20%/LV +4%/★, prefers occupied cells.
- MOC_CHUNG for all 17 (QUICK HANDS / DOUBLE TAP / APEX / TUNED AURA) matches the loaiMoc class.
- Commanders: costs 30/40/40, cooldowns 15/25/25, ×2 cost per cast · RAGE = dmgU ×2 for 10s · REINFORCE 2 free 1★ (no summon-price rise) · tien-ui "board full → +1★" / "lasts Xs (own board only)" · effect timers pause between waves.
- Bosses: Janus (1 random turret → stone) · Joker King (Mimic + forced same-star merge if any, <7★) · Nightmare (highest star, −1★, 1★ destroyed) · Freezer count min(5, 3+⌊w/20⌋), 6s · Hive 4 drones (6 from w40) · Static Jammer 2 turrets, supports first, 6s no fire/merge/aura · Twin Core 2 cores (35% HP, fast) · Patch Titan 12% self / 35% lane / 6% other bosses · VT.NGUY one-liners · boss HP formula has no player text.
