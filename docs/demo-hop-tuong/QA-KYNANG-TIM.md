# QA KỸ NĂNG — 22 ụ TÍM (Epic)

Phạm vi: Berserker, Blizzard, Cloner, Chain Link, Clamp (tên hiển thị "Jammer"), Cleanser, Shield Gen, Mystery Box, Star Lift, Reaper Pillar, Scrambler, Overclock, Fifth Shot, Storm Gun, Lighthouse, Ricochet, Combo Core, Chrono Lock, Lone Ace, Focus Lens, Signal Jammer, Bounty Beacon.
Kiểm: chữ kỹ năng (text.js EN, roster.json VI, dòng chỉ số khi chạm ụ, mốc 3/5/7★, dạng grow-up) ↔ code; 1/3/5/7★; dạng 1/2/3 (Berserker, Chain Link, Mystery Box, Combo Core); hỗ trợ kề + trần `HOTRO.CAP`; RAGE ×2; ghép đặc biệt; PVP / CO-OP cùng-wave.

Công cụ: `node tools/thap-kt-kynang-tim.js` (155 kiểm tra, mô phỏng không giao diện + growfx.js, RNG có hạt giống) · `node tools/thap-kt-kynang-tim.js md` in bảng dưới.

## Sai gì → sửa gì

| Ụ | Lỗi | Sửa |
|---|---|---|
| Storm Gun | 4 Súng Bão kề nhau: tốc bắn −120% → âm → ụ không bao giờ bắn | code: `tocU` kẹp hệ số tốc ≥ 0.1 (game.js) |
| Blizzard | Ép Xung (Overclock) thả lên Bão Tuyết không có tác dụng; Kẹp/Nhiễu PVP cũng không làm chậm nó (xung không dùng tốc bắn) | code: nhịp xung dùng `nhipU(T)` = buff tốc + Ép Xung, bị Kẹp/Nhiễu ×0.6 (skills2.js) — áp luôn cho Chrono Lock, Bounty Beacon |
| Bounty Beacon | +10% của truy nã nhân NGOÀI trần suy yếu 25% (Venom + Time Bomb + Bounty = 137.5%) | code: +10% chuyển vào `HOTRO.vuln` (chung trần 25%) |
| Bounty Beacon / Chrono Lock | Chữ "Every 5s / Every 8s…" nhưng từ 3★ mốc chung QUICK HANDS (+20%) làm nhanh hơn (4.2 s / 6.7 s) | chữ: dòng chỉ số hiện chu kỳ thật |
| Signal Jammer | Chữ khi chạm ụ dùng số của sao hiện tại, còn khi ghép dùng sao kết quả (+1) → số lệch | chữ: "On merge (as N★): …" hiện đúng số khi ghép |
| Cleanser | Trước nhịp tẩy đầu tiên (12 s) không có +8% sát thương dù "không có gì để tẩy" | code: có buff ngay từ đầu |
| Mystery Box | Đòn chọc (growfx) không ăn RAGE ×2 / buff sát thương | code: nhân buff + RAGE như mọi ụ |
| Focus Lens | Mốc 7★ TRUE FOCUS (xuyên 65%) bị skills4.js ghi đè mất khỏi danh sách mốc | chữ: thêm lại mốc 7★ |
| Lone Ace | "double fire rate" — thật ra +100% cộng chung với buff tốc khác | chữ: "+100% fire rate" (EN, chạm ụ, VI) |
| Reaper Pillar | Mô tả họ "SOUL BLAST" — không có trong code | chữ: "neighbours execute low-HP enemies" |
| 10 ụ | roster.json EN/VI còn mô tả cũ trước đợt vai trò (Cleanser/Shield Gen/Star Lift "On merge…", Reaper "small enemies"…) | chữ: cập nhật kyNang / kyNang_vi |

Không đổi số cân bằng. Ghi chú (để nguyên, có chủ ý theo CAN-BANG-VAI-TRO.md): Blizzard DPS rất thấp (ụ khống chế), Lone Ace DPS cao khi đứng một mình (ngách vị trí); Blizzard làm chậm cả trùm 33–51% (không theo trần 15% của hỗ trợ). Tên "Jammer" (Clamp) trùng gần với "Signal Jammer" — đổi tên từ đợt trước, không sửa ở đây. `meta.js` ROSTER_EMBED (bản dự phòng) chưa đồng bộ chữ VI mới.

Kiểm chứng: 155/155 OK · `thap-sim-vaitro.js dem` đúng 40/27/18 · `che` không lỗi · deck SOLO 5 kiểu trong ±15% (−4…+7%); CO-OP hạt mặc định 4A+1Sp +19% (bản trước +9% — nhiễu hạt RNG), 2 hạt khác 777 / 4242: cả 5 kiểu trong ±15% (−9…+8%, bản trước −7…+12%) · DPS Epic gần như cũ (Berserker 2.12, Fifth Shot 2.45, Storm Gun 2.29, Lone Ace 2.94 ×Thường, không tính Guillotine) · Playwright 5 trận SOLO/CO-OP/PVP 60 s với 22 ụ tím: 0 lỗi trang.

## Bảng chi tiết

| Turret | Claim (text / code) | Measured | Status | Note |
|---|---|---|---|---|
| All Epic | 22 Epic turrets in roster.json | 22 Epic: all 22 present | OK |  |
| All Epic | every Epic has EN + VI skill text | EN + VI present | OK |  |
| All Epic | dmgU = base × 1.65 (Epic) × (1+0.85·(★−1)) × star milestone, 1/3/5/7★ | 88/88 match | OK |  |
| Berserker | 1★: base crit 15%, Rage after 1st crit lasts 5s, Frenzy after 2nd 5s | crit 15% · rage 1 5s · frenzy 5s | OK |  |
| Berserker | 1★ FRENZY: fire rate ×(1+165%), stage 3 | 3.97/s (expect 3.97) · stage 3 · crit 15% | OK |  |
| Berserker | 3★: base crit 15%, Rage after 1st crit lasts 8s, Frenzy after 2nd 5s | crit 15% · rage 1 8s · frenzy 5s | OK |  |
| Berserker | 3★ FRENZY: fire rate ×(1+195%), stage 3 | 4.43/s (expect 4.43) · stage 3 · crit 15% | OK |  |
| Berserker | 5★: base crit 15%, Rage after 1st crit lasts 8s, Frenzy after 2nd 7s | crit 15% · rage 1 8s · frenzy 7s | OK |  |
| Berserker | 5★ FRENZY: fire rate ×(1+225%), stage 3 | 4.88/s (expect 4.88) · stage 3 · crit 15% | OK |  |
| Berserker | 7★: base crit 15%, Rage after 1st crit lasts 8s, Frenzy after 2nd 7s | crit 15% · rage 1 8s · frenzy 7s | OK |  |
| Berserker | 7★ FRENZY: fire rate ×(1+255%), stage 3, crit +25% (RAMPAGE) | 5.32/s (expect 5.32) · stage 3 · crit 40% | OK |  |
| Berserker | stage 1 (CALM) shot = 1× damage | 47.27 vs dmgU 47.27 | OK |  |
| Berserker | stage 2 (RAGE) shot = 1× damage | 47.27 vs dmgU 47.27 | OK |  |
| Berserker | stage 3 (FRENZY) shot = 1× damage | 47.27 vs dmgU 47.27 | OK |  |
| Blizzard | 1★: pulse every 10.4s | first pulse at 10.47s | OK |  |
| Blizzard | 1★: slows ALL 33% (Frost Flyer immune), pulse 22.28 dmg each | slow 33%/33%/33%/0% · dmg 22.27/22.27/22.27/22.27 | OK |  |
| Blizzard | 1★: freezes SMALL enemies 0.35s (not big / boss / Frost Flyer) | freeze left 0.15/0/0/0 | OK |  |
| Blizzard | 3★: pulse every 7.7s | first pulse at 7.77s | OK |  |
| Blizzard | 3★: slows ALL 39% (Frost Flyer immune), pulse 60.14 dmg each | slow 39%/39%/39%/0% · dmg 60.14/60.14/60.14/60.14 | OK |  |
| Blizzard | 3★: freezes SMALL enemies 0.35s (not big / boss / Frost Flyer) | freeze left 0.15/0/0/0 | OK |  |
| Blizzard | 5★: pulse every 6.5s | first pulse at 6.57s | OK |  |
| Blizzard | 5★: slows ALL 45% (Frost Flyer immune), pulse 294.03 dmg each | slow 45%/45%/45%/0% · dmg 294.03/294.03/294.03/294.03 | OK |  |
| Blizzard | 5★: freezes SMALL enemies 0.35s (not big / boss / Frost Flyer) | freeze left 0.15/0/0/0 | OK |  |
| Blizzard | 7★: pulse every 5.3s | first pulse at 5.37s | OK |  |
| Blizzard | 7★: slows ALL 51% (Frost Flyer immune), pulse 407.63 dmg each | slow 51%/51%/51%/0% · dmg 407.63/407.63/407.63/407.63 | OK |  |
| Blizzard | 7★: freezes SMALL enemies 1s (not big / boss / Frost Flyer) | freeze left 0.8/0/0/0 | OK |  |
| Blizzard | Overclock on Blizzard: pulses 65% faster (10.4s → 6.3s) | first pulse 6.37s | fixed code | pulse charge now uses fire-rate multiplier |
| Cloner | nhanban+nhanban 2★ merge → 3★ result + one free 1★ turret | turrets 2 (1★: 1) · result 3★ · mana 50 · price 10→10 | OK |  |
| Cloner | mimic+nhanban 2★ merge → 3★ result + one free 1★ turret | turrets 2 (1★: 1) · result 3★ · mana 50 · price 10→10 | OK |  |
| Chain Link | 1 linked: +0% damage, stage 1 | chain 1 · +0% · stage 1 | OK |  |
| Chain Link | 1 linked: one shot = 1× (buff applied once) | 59.39 vs 59.39 | OK |  |
| Chain Link | 2 linked: +40% damage, stage 2 | chain 2 · +40% · stage 2 | OK |  |
| Chain Link | 2 linked: one shot = 1× (buff applied once) | 83.14 vs 83.14 | OK |  |
| Chain Link | 3 linked: +80% damage, stage 2 | chain 3 · +80% · stage 2 | OK |  |
| Chain Link | 3 linked: one shot = 1× (buff applied once) | 106.89 vs 106.89 | OK |  |
| Chain Link | 4 linked: +120% damage, stage 3 | chain 4 · +120% · stage 3 | OK |  |
| Chain Link | 4 linked: one shot = 1× + arc 0.5× to a 2nd enemy (buff applied once) | 195.97 vs 195.97 | OK |  |
| Chain Link | 5 linked: +160% damage, stage 3 | chain 5 · +160% · stage 3 | OK |  |
| Chain Link | 5 linked: one shot = 1× + arc 0.5× to a 2nd enemy (buff applied once) | 231.6 vs 231.6 | OK |  |
| Jammer | PVP 1★ merge: clamps 1 highest-star rival turrets −40% for 6s, shield blocks 1 | clamped 0 (0/0/0/0/0) · shield 0 · rate 1/1/1/1/1 | OK |  |
| Jammer | PVP 3★ merge: clamps 2 highest-star rival turrets −40% for 8s, shield blocks 1 | clamped 1 (0/0/0/8/0) · shield 0 · rate 1/1/1/0.6/1 | OK |  |
| Jammer | PVP 5★ merge: clamps 3 highest-star rival turrets −40% for 10s, shield blocks 1 | clamped 2 (0/0/10/10/0) · shield 0 · rate 1/1/0.6/0.6/1 | OK |  |
| Jammer | COOP 3★ merge: 2 ally turrets +55% fire rate 9s | 0s/+0% · 9s/+55% · 9s/+55% | OK |  |
| Jammer | SOLO 3★ merge: 2 own turrets +55% fire rate 9s | 0s/+0% · 9s/+55% · 9s/+55% | OK |  |
| Cleanser | 1★: nothing to clean → neighbours +8% damage (from the start) | +8% | fixed code | before the first pulse the buff was missing |
| Cleanser | 1★: every 12s cleanses up to 2 neighbours | debuffed 4 → 2 | OK |  |
| Cleanser | 3★: nothing to clean → neighbours +11.6% damage (from the start) | +11.6% | OK |  |
| Cleanser | 3★: every 12s cleanses up to 2 neighbours | debuffed 4 → 2 | OK |  |
| Cleanser | 5★: nothing to clean → neighbours +15.2% damage (from the start) | +15.2% | OK |  |
| Cleanser | 5★: every 9s cleanses up to 3 neighbours | debuffed 4 → 1 | OK |  |
| Cleanser | 7★: nothing to clean → neighbours +18.8% damage (from the start) | +18.8% | OK |  |
| Cleanser | 7★: every 9s cleanses up to 3 neighbours + they get +20% fire rate 4s | debuffed 4 → 1 · boosted 3 (3.83s+20%,3.83s+20%,3.83s+20%) | OK |  |
| Shield Gen | 1★: neighbours shielded every 18s, no stacking, blocks a boss freeze | first at 18.03s · 4/4 · max stack 1 · after boss: shield 0, frozen 0 | OK |  |
| Shield Gen | 3★: neighbours shielded every 16s, no stacking, blocks a boss freeze | first at 16.07s · 4/4 · max stack 1 · after boss: shield 0, frozen 0 | OK |  |
| Shield Gen | 5★: neighbours shielded every 14s, no stacking, blocks a boss freeze | first at 14.07s · 4/4 · max stack 1 · after boss: shield 0, frozen 0 | OK |  |
| Shield Gen | 7★: neighbours shielded every 10s, no stacking, blocks a boss freeze, block → +20% fire rate 4s | first at 10.07s · 4/4 · max stack 1 · after boss: shield 0, frozen 0, +20% 4s | OK |  |
| Mystery Box | 1★ stages: SEALED <70% · UNSEALING 70–93% · ABOUT TO OPEN >93% | at 50/80/95%: 1/2/3 | OK |  |
| Mystery Box | 1★: opens after 47s into a random deck turret 1–7★ (never a Box) | opened at 47.07s · types lien,tia,canon,set · stars 1,2,3,4,5,6,7 | OK |  |
| Mystery Box | 3★ stages: SEALED <70% · UNSEALING 70–93% · ABOUT TO OPEN >93% | at 50/80/95%: 1/2/3 | OK |  |
| Mystery Box | 3★: opens after 37s into a random deck turret 1–7★ (never a Box) | opened at 37.03s · types canon,lien,set,tia · stars 1,2,3,4,5,6,7 | OK |  |
| Mystery Box | 5★ stages: SEALED <70% · UNSEALING 70–93% · ABOUT TO OPEN >93% | at 50/80/95%: 1/2/3 | OK |  |
| Mystery Box | 5★: opens after 37s into a random deck turret 3–7★ (never a Box) | opened at 37.03s · types tia,canon,set,lien · stars 3,4,5,6,7 | OK |  |
| Mystery Box | 7★ stages: SEALED <70% · UNSEALING 70–93% · ABOUT TO OPEN >93% | at 50/80/95%: 1/2/3 | OK |  |
| Mystery Box | 7★: opens after 37s into a random deck turret 5–7★ (never a Box) | opened at 37.03s · types canon,set,lien,tia · stars 5,6,7 | OK |  |
| Mystery Box | stage-1 poke 0.3× (×2 under Archfiend RAGE) | 40.1 vs 40.1 | OK |  |
| Mystery Box | stage-1 poke 0.3× (×2 under Archfiend RAGE) — RAGE | 80.19 vs 80.19 | fixed code | poke ignored RAGE / damage buffs |
| Star Lift | 1★: only the 2 lowest-star neighbours +6% fire rate | 6% / 6% / 0% / 0% | OK |  |
| Star Lift | 3★: only the 2 lowest-star neighbours +18% fire rate | 18% / 18% / 0% / 0% | OK |  |
| Star Lift | 5★: only the 2 lowest-star neighbours +30% fire rate | 30% / 30% / 0% / 0% | OK |  |
| Star Lift | 5★: a star pip each wave (3 pips = +1★), max 2★ per match | 8 waves → +2★ (stars 3/2/3/4, used 2) | OK |  |
| Star Lift | 7★: only the 2 lowest-star neighbours +30% fire rate | 30% / 30% / 0% / 0% | OK |  |
| Star Lift | 7★: a star pip each wave (2 pips = +1★), max 2★ per match | 8 waves → +2★ (stars 3/2/3/4, used 2) | OK |  |
| Reaper Pillar | 1★: 8% per hit to execute normal enemies under 30%, never big ones | chance 8% · kills under 6.3% · above 0 · big 0% | OK |  |
| Reaper Pillar | 3★: 11.6% per hit to execute normal enemies under 30%, never big ones | chance 11.6% · kills under 13.3% · above 0 · big 0% | OK |  |
| Reaper Pillar | 5★: 15% per hit to execute normal enemies under 40%, never big ones | chance 15% · kills under 14% · above 0 · big 0% | OK |  |
| Reaper Pillar | 7★: 15% per hit to execute normal enemies under 40%, big ones under 15% | chance 15% · kills under 15.5% · above 0 · big 14.3% | OK |  |
| Reaper Pillar | bosses are never executed: proc adds at most 1% max HP | worst hit 10 (cap 10, boss alive) | OK |  |
| Scrambler | PVP 1★ merge: 1 rival turrets become another deck type, same ★ | 1 changed (sungluc2,lien2,lien2,lien2,lien2) | OK |  |
| Scrambler | PVP 3★ merge: 2 rival turrets become another deck type, same ★ | 2 changed (lien2,sungluc2,lien2,sungluc2,lien2) | OK |  |
| Scrambler | PVP 5★ merge: 3 rival turrets become another deck type, same ★ | 3 changed (lien2,sungluc2,tia2,set2,lien2) | OK |  |
| Scrambler | COOP merge: a lone turret becomes a mergeable pair | canon2,canon2,set3 | OK |  |
| Scrambler | SOLO merge: a lone turret becomes a mergeable pair | canon2,canon2,set3 | OK |  |
| Overclock | same-star drag: +65% fire rate, stacks (+130%), Overclock consumed; not onto other star / Support | rate ×1.65 → ×2.3 · left 1 · diff-star false · on Radar false | OK |  |
| Fifth Shot | 1★: 5 shots on one enemy = 4×1 + 3 bolts × 2 = 10× damage | 158.4 vs 158.4 | OK |  |
| Fifth Shot | 1★: 5th shot spreads to the 2 nearest enemies (34 px blasts) | 63.36 / 95.04 / 63.36 | OK |  |
| Fifth Shot | 4★: 5 shots on one enemy = 4×1 + 3 bolts × 2 = 10× damage | 562.32 vs 562.32 | OK |  |
| Fifth Shot | 4★: 5th shot spreads to the 2 nearest enemies (34 px blasts) | 224.93 / 337.39 / 224.93 | OK |  |
| Storm Gun | instant hit = 1× damage (no projectile) | 8.58 vs 8.58 in 0.05s | OK |  |
| Storm Gun | 2★ next to 0 Storm Gun(s): 4.73 hits/s | 4.73/s | OK |  |
| Storm Gun | 2★ next to 1 Storm Gun(s): 3.31 hits/s | 3.31/s | OK |  |
| Storm Gun | 2★ next to 2 Storm Gun(s): 1.89 hits/s | 1.89/s | OK |  |
| Storm Gun | 2★ next to 4 Storm Gun(s): 0.47 hits/s (floored, never negative) | 0.47/s | fixed code | 4 neighbours gave −20% total → negative fire rate (never shot) |
| Storm Gun | 20% of hits arc to a 2nd enemy at 0.7× (avg +14%) | arc share 13.7% of main | OK |  |
| Lighthouse | 1★: shot ×1.15, free 1★ summon every 19.4s | 18.22 vs 18.22 · summon at 19.47s 1★ | OK |  |
| Lighthouse | 3★: shot ×1.45, free 1★ summon every 16.2s | 62.01 vs 62.01 · summon at 16.23s 1★ | OK |  |
| Lighthouse | 5★: shot ×1.75, free 1★ summon every 13s | 121.97 vs 121.97 · summon at 13.07s 1★ | OK |  |
| Lighthouse | 7★: shot ×2.05, free 1★ summon every 9.8s | 257.5 vs 257.5 · summon at 9.83s 1★ | OK |  |
| Ricochet | 1★: 1 bounces (+15% each) → 2 enemies, total ×2.15 | 2.15× on 2 enemies | OK |  |
| Ricochet | 3★: 3 bounces (+18% each) → 4 enemies, total ×5.08 | 5.08× on 4 enemies | OK |  |
| Ricochet | 5★: 5 bounces (+20% each) → 6 enemies, total ×9 | 9× on 6 enemies | OK |  |
| Ricochet | 7★: 7 bounces (+25% each) → 8 enemies, total ×15 | 15× on 8 enemies | OK |  |
| Ricochet | no enemy within 90 px → the disc stops (no re-hit) | 1× | OK |  |
| Combo Core | Combo+Combo and Mimic+Combo count, other merges do not; 5★ +10% per combo | COMBO 2 → +20% | OK |  |
| Combo Core | COMBO 30 → 20 + 10×½ = 25 effective → +250% at 5★, stage 3 (OVERDRIVE) | +250% · stage 3 | OK |  |
| Combo Core | 1★: +6% per combo | +6% | OK |  |
| Combo Core | 7★: +12% per combo | +12% | OK |  |
| Combo Core | CO-OP: both decks have Combo Core → +½ of ally COMBO | +42% (expect 42%) | OK |  |
| Combo Core | twin barrel: 2 rounds × 0.5 = 1× per shot | 66.83 vs 66.83 | OK |  |
| Chrono Lock | 1★: locks the lead enemy every 9s (9s) for 1.2s, release bursts 30% of stored damage (40 px); tap text shows the real period | lock at 9.07s for 1.17s · burst 300 / neighbour 300 · text "Every 9.0s locks…" | OK |  |
| Chrono Lock | 3★: locks the lead enemy every 6.67s (8s ÷ QUICK HANDS 1.2) for 1.6s, release bursts 40% of stored damage (40 px); tap text shows the real period | lock at 6.7s for 1.57s · burst 400 / neighbour 400 · text "Every 6.7s locks…" | fixed text | 3★+ QUICK HANDS (+20% speed) also shortens the lock cycle; text showed the base period |
| Chrono Lock | 5★: locks the lead enemy every 5.83s (7s ÷ QUICK HANDS 1.2) for 2s, release bursts 50% of stored damage (40 px); tap text shows the real period | lock at 5.9s for 1.97s · burst 500 / neighbour 500 · text "Every 5.8s locks…" | OK |  |
| Chrono Lock | 7★: locks the lead enemy every 5s (6s ÷ QUICK HANDS 1.2) for 2.5s, release bursts 75% of stored damage (40 px); tap text shows the real period | lock at 5.03s for 2.47s · burst 750 / neighbour 750 · text "Every 5.0s locks…" | OK |  |
| Chrono Lock | boss: half lock time, 50% slow, half burst | lock 1s · burst 25% | OK |  |
| Lone Ace | 1★ with 0 N/E/S/W neighbours (+1 diagonal): ACE +100% fire rate, +10% crit | rate 100% · crit +10% · ace true | fixed text | said "double fire rate"; it is +100% added to other fire-rate bonuses (EN text, tap text, roster VI) |
| Lone Ace | 1★ with 2 N/E/S/W neighbours (+1 diagonal): normal | rate 0% · crit +0% · ace false | OK |  |
| Lone Ace | 1★ with 3 N/E/S/W neighbours (+1 diagonal): −30% fire rate | rate -30% · crit +0% · ace false | OK |  |
| Lone Ace | 3★ with 0 N/E/S/W neighbours (+1 diagonal): ACE +100% fire rate, +14% crit | rate 100% · crit +14% · ace true | OK |  |
| Lone Ace | 3★ with 2 N/E/S/W neighbours (+1 diagonal): normal | rate 0% · crit +0% · ace false | OK |  |
| Lone Ace | 3★ with 3 N/E/S/W neighbours (+1 diagonal): −30% fire rate | rate -30% · crit +0% · ace false | OK |  |
| Lone Ace | 5★ with 0 N/E/S/W neighbours (+1 diagonal): ACE +100% fire rate, +18% crit | rate 100% · crit +18% · ace true | OK |  |
| Lone Ace | 5★ with 2 N/E/S/W neighbours (+1 diagonal): normal | rate 0% · crit +0% · ace false | OK |  |
| Lone Ace | 5★ with 3 N/E/S/W neighbours (+1 diagonal): −30% fire rate | rate -30% · crit +0% · ace false | OK |  |
| Lone Ace | 7★ with 0 N/E/S/W neighbours (+1 diagonal): ACE +100% fire rate, +25% crit | rate 100% · crit +25% · ace true | OK |  |
| Lone Ace | 7★ with 2 N/E/S/W neighbours (+1 diagonal): normal | rate 0% · crit +0% · ace false | OK |  |
| Lone Ace | 7★ with 3 N/E/S/W neighbours (+1 diagonal): −30% fire rate | rate -30% · crit +0% · ace false | OK |  |
| Lone Ace | 7★ ACE: shots pierce 1 enemy behind (2× total on 2 enemies) | 2× | OK |  |
| Focus Lens | 1★: neighbour crits ×2.14, pierce 1 enemy behind at 50% | cdmg +14% · hits 214/107/0/0 | OK |  |
| Focus Lens | 3★: neighbour crits ×2.2, pierce 1 enemy behind at 50% | cdmg +20.3% · hits 220.3/110.15/0/0 | OK |  |
| Focus Lens | 5★: neighbour crits ×2.27, pierce 2 enemy behind at 50% | cdmg +26.6% · hits 226.6/113.3/113.3/0 | OK |  |
| Focus Lens | 7★: neighbour crits ×2.33, pierce 2 enemy behind at 65% | cdmg +32.9% · hits 232.9/151.38/151.38/0 | fixed text | 7★ TRUE FOCUS milestone was missing from the star list |
| Signal Jammer | PVP 1★ merge (→2★): after 0.65s jams 1 rival turrets −40% 3.5s; their next summon +5 mana; tap text shows the same | before 0.65s 0 · jammed 1 (3.43s) · price 10→15, paid 15, next 20 · text matches | fixed text | tap panel showed the numbers of the current star, the merge uses the result star |
| Signal Jammer | PVP 2★ merge (→3★): after 0.65s jams 2 rival turrets −40% 4s; their next summon +10 mana; tap text shows the same | before 0.65s 0 · jammed 2 (3.93/3.93s) · price 10→20, paid 20, next 20 · text matches | OK |  |
| Signal Jammer | PVP 4★ merge (→5★): after 0.65s jams 3 rival turrets −40% 5s; their next summon +15 mana; tap text shows the same | before 0.65s 0 · jammed 3 (4.93/4.93/4.93s) · price 10→25, paid 25, next 20 · text matches | OK |  |
| Signal Jammer | PVP 6★ merge (→7★): after 0.65s jams 4 rival turrets −40% 6s; their next summon +20 mana; tap text shows the same | before 0.65s 0 · jammed 4 (5.93/5.93/5.93/5.93s) · price 10→30, paid 30, next 20 · text matches | OK |  |
| Signal Jammer | CO-OP 3★ merge: ally next summon FREE + ally Attack turrets +10% fire rate 4.5s | ally turrets 2→3 with 0 mana · +10% 4.5s | OK |  |
| Signal Jammer | SOLO 3★ merge: all enemies slowed 20% for 4.5s | slow 20% 4.5s | OK |  |
| Bounty Beacon | 1★: marks 1 enemies every 5s (5s; 3★ QUICK HANDS +20% speed), big first; a marked kill +2 bonus mana; tap text shows the real period | mark at 5.03s · marked 1 (big first true) · bonus +2 · text "Every 5.0s marks…" | OK |  |
| Bounty Beacon | 3★: marks 2 enemies every 4.17s (5s; 3★ QUICK HANDS +20% speed), big first; a marked kill +3 bonus mana; tap text shows the real period | mark at 4.2s · marked 2 (big first true) · bonus +3 · text "Every 4.2s marks…" | fixed text | at 3★+ the common QUICK HANDS (+20% speed) also speeds marking; text said 5s |
| Bounty Beacon | 6★: marks 3 enemies every 4.17s (5s; 3★ QUICK HANDS +20% speed), big first; a marked kill +5 bonus mana; tap text shows the real period | mark at 4.2s · marked 3 (big first true) · bonus +5 · text "Every 4.2s marks…" | OK |  |
| Bounty Beacon | marked: +10% damage taken; with Venom 12% + Time Bomb 10% the total stays at the 25% weakness cap | 110 · stacked 125 | fixed code | Bounty +10% used to multiply on top of the 25% cap (→ 137.5) |
| Bounty Beacon | CO-OP: marked boss ×5 bounty split between both boards | 586 + 10 (base 4×5 = 20) | OK |  |
| Interactions | Radar 7★ + Star Lift 7★ + Fusion Mixer 7★ on Berserker: support fire rate capped at +45% | +45% (buf 45%) | OK |  |
| Interactions | Chain Link (2 linked) + Grid diagonal + Cleanser: support damage ≤35%, chain +40% added on top | support +35% · total buf +75% | OK |  |
| Interactions | Crit Antenna + Hammer on Berserker: crit ≤ +20 pts; Hammer + Focus Lens crit damage ≤ +50% | crit +20% · cdmg +50% | OK |  |
| Interactions | Chiller 7★ next to Storm Gun: its hits slow ≤35% (boss ≤15%) | 18.8% / 15% | OK |  |
| Interactions | Archfiend RAGE: +100% damage on every Epic shot (15 shooters) | all ×2.00 | OK |  |
| Interactions | Berserker: DPS grows with stars (1/3/5/7★), 7★ ≥ 4× 1★ | 44 / 135 / 275 / 479 (×10.91) | OK |  |
| Interactions | Chain Link: DPS grows with stars (1/3/5/7★), 7★ ≥ 4× 1★ | 22 / 77 / 140 / 297 (×13.48) | OK |  |
| Interactions | Fifth Shot: DPS grows with stars (1/3/5/7★), 7★ ≥ 4× 1★ | 44 / 143 / 287 / 557 (×12.8) | OK |  |
| Interactions | Storm Gun: DPS grows with stars (1/3/5/7★), 7★ ≥ 4× 1★ | 42 / 155 / 336 / 660 (×15.54) | OK |  |
| Interactions | Lighthouse: DPS grows with stars (1/3/5/7★), 7★ ≥ 4× 1★ | 15 / 63 / 147 / 342 (×23.47) | OK |  |
| Interactions | Ricochet: DPS grows with stars (1/3/5/7★), 7★ ≥ 4× 1★ | 24 / 66 / 140 / 273 (×11.59) | OK |  |
| Interactions | Combo Core: DPS grows with stars (1/3/5/7★), 7★ ≥ 4× 1★ | 28 / 85 / 174 / 353 (×12.41) | OK |  |
| Interactions | Lone Ace: DPS grows with stars (1/3/5/7★), 7★ ≥ 4× 1★ | 52 / 175 / 346 / 528 (×10.17) | OK |  |
| Interactions | SOLO / CO-OP / PVP 60s with each Epic + rival Clamp/Scrambler/Signal Jammer: no errors | 66 runs clean | OK |  |
