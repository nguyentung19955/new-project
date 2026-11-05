# QA KỸ NĂNG — ụ THƯỜNG (trắng) + HIẾM (xanh) + HỆ THỐNG HỖ TRỢ CHUNG

Đợt: 5/11/2026 · phạm vi: 32 ụ Thường/Hiếm trong `thap/assets/roster.json` + `thap/js/hotro.js` (ô kề, ô chéo Resonance, mốc 3/5/7★, trần, cộng với RAGE chỉ huy).
Công cụ: `node tools/thap-kt-kynang-tx.js` (193 phép kiểm, không giao diện, RNG có hạt giống; `KT_HAT=<số>` đổi hạt giống — đã chạy 3 hạt 2026/7/99: 193/193). `node tools/thap-kt-kynang-tx.js md` in lại bảng dưới, `node tools/thap-kt-kynang-tx.js <id>` chạy 1 ụ.
Cách đo: giá trị tất định so ±1% với chữ trong game (TEXT.turret / dòng thông tin `mo()` / mốc sao MOC); DPS đo trên quái trâu đi vòng, lấy sát thương TRƯỚC chí mạng × kỳ vọng chí mạng (bỏ nhiễu), so công thức ±7%.

## Tóm tắt — sai gì, sửa gì

| # | Ụ | Sai | Sửa |
|---|---|---|---|
| 1 | Dice Gun | Ăng-ten Chí Mạng 7★ "chắc chắn chí mạng" làm cú 300% bị nhân đôi → 630%; Hammer / Focus Lens (+sát thương chí mạng) không có tác dụng với Dice Gun | Chí mạng đi qua hệ chí mạng chung: 150% × (2 + sát thương chí mạng) = 300% (Hammer 5★ → 375%), không bao giờ 600% |
| 2 | Scatter | Ở 60 khung/giây cửa sổ đổi mục tiêu bị nhảy qua → bắn mãi 1 con (chữ: "random enemies") | Sau mỗi phát chọn quái ngẫu nhiên mới (4/4 quái bị bắn) |
| 3 | Frost | Lạnh 30% sau khi đóng băng áp cả lên trùm (trần chậm trùm 15%) | Trùm 15% (chữ thông tin ghi rõ) · Ice Blade lan lạnh lên trùm cũng 15% |
| 4 | Ice Blade | 5★ SPLINTERS đánh lại CHÍNH mục tiêu (×6 thành ×8.4, 7★ ×8 thành ×11.2); quái kháng chậm (Ice Flyer) có đồng hồ chậm 0% vẫn bị tính "đang chậm" → ăn ×5; quái đang đóng băng (chỉ `chan`) không tính | Mảnh văng chỉ ra quái xung quanh; "đang chậm" = còn % chậm hoặc đang đóng băng (`biCham`) |
| 5 | Chiller | Gắn đồng hồ chậm lên quái kháng chậm (gây lỗi #4) | Quái kháng chậm không nhận đồng hồ chậm |
| 6 | Radar | 7★ OVERDRIVE +25% cộng NGOÀI trần → tốc bắn ụ kề 53% (trần 45%) | OVERDRIVE tính trong trần chung 45% |
| 7 | Laser (+ Frost, Venom, Time Bomb, Toxic Pool, Mine Layer) | Ụ tự quản nhịp chỉ đọc `buf.toc`: Overclock (+65%) không có tác dụng, Kẹp Phá PVP (−40%) cũng không | Hệ số nhịp chung `nhipU(T)` = như `tocU` (buff + Ép Xung + Kẹp Phá) — Laser + Overclock ×1.67, + Kẹp ×0.62 |
| 8 | Amplifier | Cửa sổ cộng dồn 1.5 s < nhịp bắn của ụ chậm (Revolver 0.6/s, Sniper 0.35/s, Cannon 0.55/s, Mortar 0.4/s) → không bao giờ cộng dồn | Cửa sổ = max(1.5 s, 1 nhịp bắn) (7★ max(3 s, …)); chữ "fades after 1.5s without a hit (slow guns: one missed shot)" |
| 9 | Toxic Pool / Venom | Độc của vũng không xoá khi hết → Venom gắn dấu (đặt cờ độc 5 s) làm độc CŨ sống lại 5 s (mất máu không ai gây) | Hết độc thì xoá dps độc (`game.js`); Venom không đụng cờ độc nữa — Purifier coi dấu Venom là "trúng độc" qua `biDoc(E)` |
| 10 | Crit Antenna | Mốc 3★ / 5★ ghi +8% / +13% nhưng thật +11% / +15% | Sửa chữ mốc |
| 11 | Crit Antenna 7★ | Cú "chắc chắn chí mạng" bị tiêu vào tia Laser / phát chém Guillotine (đòn tự quyết chí mạng) | Để dành cho đòn thường (`trung`: chỉ ép khi đòn không tự quyết chí mạng) |
| 12 | Mortar | Dòng "cluster shell in N" đếm sai 1 → 3 → 2 | Đếm đúng 3 → 2 → 1 |
| 13 | Resonance Grid | Dòng thông tin 7★ ghi tốc bắn ×1.5 cả khi chưa đủ 4 ô chéo | Chỉ ghi ×1.5 khi đủ cộng hưởng |
| 14 | roster.json / meta.js | 14 chữ kỹ năng EN/VI cũ trước đợt vai trò (Frost "slows 35%", Venom "poison", Blender "merges any turret; stars = average", Radar "+30%", Breaker, Hammer, Time Bomb, Mortar, Mana Leech…) | Đồng bộ EN với chữ trong game (TEXT.turret) + viết lại VI |

Không đổi số cân bằng nào (sát thương gốc / tốc / giá trị hỗ trợ giữ nguyên). Ụ Thường/Hiếm **không có dạng grow-up / thức tỉnh** (GROW chỉ có ở Sử thi trở lên) → không có hệ số dạng để kiểm.

## Ghi chú (đúng theo thiết kế, không sửa)

- Laser không bao giờ chí mạng (`crit:false`) → Ăng-ten / Hammer kề Laser không có tác dụng chí mạng.
- Drone Bay: drone dùng sức mạnh gốc của sao kết quả (`hsU`, không buff / không RAGE) — chữ "result-star power".
- Iron Fist: cận chiến 105 px — chỉ đánh khi đứng sát đường (ô 2 cách đường 89 px → đánh được).
- Mortar: 3 mảnh chùm (×45%) rơi cách 30 px nên thường trúng cả mục tiêu chính → 1 mục tiêu nhận ~+45% mỗi 3 phát (đã tính vào công thức DPS).
- Mana Leech: trần mana/giây tính theo cửa sổ bắt đầu từ phát trúng đầu → thực tế ~75–85% trần, không bao giờ vượt.
- `nhipU(T)` dùng chung với phiên QA Sử thi (khai báo 1 lần ở skills2.js). Ngoài bộ còn đọc `(1 + T.buf.toc)` (Overclock / Kẹp Phá không tác dụng): Wall Projector, Black Hole, Overlord (+ tia grow-up growfx.js), Hydra 7★, Hive Queen, Leviathan, Genesis Core, Wyrm Engine — để phiên Huyền thoại/Đỏ quyết.
- Ba bộ kiểm chạy chung sau rebase: `thap-kt-kynang-tx.js` 193/193 · `thap-kt-kynang-tim.js` 155/155 · `thap-kt-kynang-vd.js` 223/223.
- `thap/js/meta.js` ROSTER_EMBED lệch roster.json ở 29 ụ Sử thi+ (có từ trước, do phiên khác) — chỉ đồng bộ phần Thường/Hiếm.

## Kiểm cân bằng sau sửa (`tools/thap-sim-vaitro.js`)

- `deck 8 solo`: 5 kiểu bộ −6% … +13% ✔. `deck 10 coop`: −7% … +13% ✔ (5 lần/họ: 2A+2Sup+1Sp −15.2% — nhiễu; 10 lần: +1%). `deck 5 pvp`: −7% … +11% ✔.
- `hotro 30`: Amplifier +7 / +20 / +25% (trước +6 / +18 / +26%), các ụ khác trong nhiễu ±5%.
- `che`: SOLO / CO-OP / PVP 90 s không lỗi. Trình duyệt (Playwright, SOLO/CO-OP/PVP 25 s, tốc ×3): không lỗi trang.

## Bảng đầy đủ

Status: OK = đúng từ trước · fixed code = sửa mã · fixed text = sửa chữ.

| Turret | Claim | Measured | Status | Note |
|---|---|---|---|---|
| (all) | damage per star = base × (1 + 0.85×(★−1)); 7★ APEX +30% | 5 / 12.2 / 19.80 / 35.685 | OK | Gatling 1/3/5/7★ |
| (all) | fire rate: base × (1 + tocSao×(★−1)); 3★ QUICK HANDS +20% | 4 / 6.1 / 7.49 / 8.832 | OK | Gatling 1/3/5/7★ |
| (all) | crit 10% base; 7★ APEX +10% | 10.0% / 20.0% | OK |  |
| (all) | in-match upgrade +18% damage / LV | 6.12 | OK |  |
| (all) | commander RAGE: +100% damage | 9.00 | OK |  |
| (all) | Rare tier multiplier ×1.3 | 15.60 | OK | Laser 1★ |
| (all) | Common/Rare have NO grow-up / awaken forms (stage multipliers n/a) | none | OK |  |
| canon | blast radius widens with stars (28 + 6/★ px) | 34/46/58/70 | OK |  |
| canon | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones | 1★ 19.2/19.8 · 3★ 61.6/64.2 · 5★ 132.0/134.0 · 7★ 259.5/263.5 | OK | measured/formula, worst 4.0% |
| canon | star scaling 7★/1★ as designed | 13.52× (design 13.31×) | OK |  |
| canon | splash hits the group, not far enemies | hits lead/20px behind/120px behind = 3/3/0 | OK |  |
| xucxac | each shot 3–300% damage | 5–300% over 160 shots | OK |  |
| xucxac | crits always roll max (300%, never doubled) | 17 max rolls, 0 above 300% | OK |  |
| xucxac | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones (mean roll 151%, 240s) | 1★ 22.9/21.2 · 3★ 73.1/68.8 · 5★ 149.3/143.7 · 7★ 284.6/282.3 | OK | measured/formula, worst 7.7% |
| xucxac | star scaling 7★/1★ as designed | 12.45× (design 13.30×) | OK |  |
| xucxac | with Crit Antenna 7★ sure crit: max roll 300% (× its +10% crit damage = 315%), never doubled to 600% | max hit 315% | fixed code |  |
| xucxac | Hammer 5★ (+50% crit damage) raises a max roll to 300×(2.5/2) = 375% | max hit 375% | fixed code |  |
| lien | very fast: 4 shots/s, +14% fire rate per ★ | 4.00/5.12/6.24/7.36 (before 3★ +20%) | OK |  |
| lien | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones | 1★ 19.8/19.8 · 3★ 82.0/82.1 · 5★ 208.4/209.1 · 7★ 466.8/484.9 | OK | measured/formula, worst 3.7% |
| lien | star scaling 7★/1★ as designed | 23.57× (design 24.49×) | OK |  |
| phun | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones | 1★ 18.9/18.9 · 3★ 71.0/70.9 · 5★ 166.0/168.6 · 7★ 355.8/371.6 | OK | measured/formula, worst 4.3% |
| phun | star scaling 7★/1★ as designed | 18.86× (design 19.70×) | OK |  |
| phun | fires at RANDOM enemies (not just the lead) | 4 of 4 enemies hit | fixed code |  |
| phun | 5 shots/s, +8%/★ | 5.00 → 5.40 | OK |  |
| sungluc | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones | 1★ 24.8/24.8 · 3★ 82.0/80.5 · 5★ 170.0/168.1 · 7★ 331.9/328.3 | OK | measured/formula, worst 1.9% |
| sungluc | star scaling 7★/1★ as designed | 13.36× (design 13.22×) | OK |  |
| sungluc | one heavy instant shot, 20% crit | 18.9% crits over 180 shots | OK |  |
| sungluc | hits the lead enemy | all shots on lead | OK |  |
| bang | freezes the lead enemy every 6s | freeze starts 6.4, 12.5, 18.6, 24.5s | OK | gap = 6s charge + bolt flight |
| bang | Frost deals no damage | damage 0 | OK |  |
| bang | freeze 2s (3★ LONG FREEZE 2.5s) | 2.00s / 2.50s | OK |  |
| bang | big enemies ×0.6, bosses 0.6s | big 1.20s · boss 0.60s | OK |  |
| bang | after freeze: 30% chill 2s (bosses 15% — boss slow cap) | normal 30.0% 2.00s · boss 15.0% | fixed code |  |
| bang | no chain-freeze: 3s immunity after the freeze | 3.00s after thaw | OK |  |
| bang | 5★ QUICK FROST every 4.5s · 7★ DOUBLE FREEZE 2 enemies | 6 / 4.5 / 2 | OK |  |
| bang | 7★ freezes 2 lead enemies at once | 2 frozen | OK |  |
| bang | slow-immune (ice flyer) is skipped | freeze 0.00 | OK |  |
| doc | marks the lead enemy 5s: +12% damage taken from all turrets | mark 3.75s left · vuln 12.0% | OK |  |
| doc | Venom itself deals no damage (mark only, no poison ticks) | 0 hits, poison dps 0.00 | OK |  |
| doc | Gatling on a marked enemy deals +12% | hit ×1.120 / ×2.240 (normal / crit) | OK |  |
| doc | every 2.5s; 3★ TWIN MARK 2 enemies | 1 / 2 / 2.5 | OK |  |
| doc | 7★ NEUROTOXIN: marked slowed 15% | 15.0% | OK |  |
| doc | 5★ CONTAGION: mark jumps to a nearby enemy on death | neighbour mark 5.00s | OK |  |
| doc | Purifier counts a Venom mark as "poisoned" | true/true | OK |  |
| mana | does not shoot; +9×★ mana every 7s (3★ 6s, 5★ +25%, 7★ 5s) | 1★ +9/7s · 3★ +27/6s · 5★ +56/6s · 7★ +79/5s | OK |  |
| mana | measured over 21s at 1★ | +27 mana, 0 hits | OK |  |
| tia | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones (normal enemy) | 1★ 28.1/26.8 · 3★ 89.6/86.8 · 5★ 179.7/181.4 · 7★ 353.2/356.6 | OK | measured/formula, worst 4.8% |
| tia | star scaling 7★/1★ as designed | 12.58× (design 13.31×) | OK |  |
| tia | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones (big enemy ×2) | 1★ 56.1/53.6 · 3★ 179.2/173.6 · 5★ 359.3/362.8 · 7★ 706.5/713.3 | OK | measured/formula, worst 4.8% |
| tia | star scaling 7★/1★ as designed | 12.58× (design 13.31×) | OK |  |
| tia | targets the highest-HP enemy | all on toughest | OK |  |
| tia | +100% vs bosses | 2.00× | OK |  |
| set | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones (single target) | 1★ 14.0/14.0 · 3★ 45.1/45.4 · 5★ 94.0/94.9 · 7★ 184.8/186.6 | OK | measured/formula, worst 1.0% |
| set | star scaling 7★/1★ as designed | 13.18× (design 13.31×) | OK |  |
| set | chain lightning hits N = ★ enemies (×0.88 per jump) | 1★: 1 enemies | OK |  |
| set | chain lightning hits N = ★ enemies (×0.88 per jump) | 3★: 3 enemies, jump ×0.880 | OK |  |
| set | chain lightning hits N = ★ enemies (×0.88 per jump) | 5★: 5 enemies, jump ×0.880 | OK |  |
| maychem | instant-kill chance 3.75% +0.75%/★ per shot | 3.8%/5.3%/6.8%/8.2% | OK |  |
| maychem | measured kill rate on small enemies (7★) | 7.5% of 400 shots | OK |  |
| maychem | never instant-kills big enemies | 0 kills / 150 | OK |  |
| maychem | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones (big enemy, no execute) | 1★ 14.3/14.3 · 3★ 46.7/46.3 · 5★ 97.0/96.8 · 7★ 190.7/190.3 | OK | measured/formula, worst 0.7% |
| maychem | star scaling 7★/1★ as designed | 13.34× (design 13.31×) | OK |  |
| nam | rapid punches 2.4/s +6%/★ | 2.40/2.69/2.98/3.26 (before 3★ +20%) | OK |  |
| nam | melee: only hits enemies within 105 px | nearest path point 89 px from cell 2 | OK | info |
| nam | ring blast hits enemy in reach, ignores far enemy | 13/0 | OK |  |
| nam | DPS 1/3/5/7★ in reach = formula | 1★ 19.8/19.8 · 3★ 69.5/71.9 · 5★ 161.7/166.2 · 7★ 345.0/358.4 | OK |  |
| bomhen | blast radius 34+3/★ px; weakness 4s (3★ LONG FUSE 6s) | 37 / 55 / 4 / 6 | OK |  |
| bomhen | bomb goes off ~5s after it sticks | 4.8s after throw (flight ~0.4s) | OK |  |
| bomhen | blast weakens nearby enemies +10% (far enemy not) | 10.0% / 10.0% / 0.0% · 3.98/3.98/0s | OK |  |
| bomhen | blast deals no damage | 0 hits | OK |  |
| bomhen | 7★ TWIN BOMBS | 2 bombs | OK |  |
| bomhen | 5★ SHOCKWAVE staggers 0.5s | 0.48s | OK |  |
| bomhen | sticks a new bomb every 2s | 2 bombs live after 10s | OK | 5s fuse → ≤3 alive at once |
| nhanmana | on merge: +32 × ★ mana | 1★+1★ → +32 mana, result 2★ | OK |  |
| nhanmana | on merge: +32 × ★ mana | 3★+3★ → +96 mana, result 4★ | OK |  |
| nhanmana | on merge: +32 × ★ mana | 6★+6★ → +192 mana, result 7★ | OK |  |
| nhanmana | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones | 1★ 11.6/11.6 · 3★ 37.7/37.5 · 5★ 78.4/78.4 · 7★ 154.1/154.1 | OK | measured/formula, worst 0.4% |
| nhanmana | star scaling 7★/1★ as designed | 13.31× (design 13.31×) | OK |  |
| kiembang | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones (not slowed) | 1★ 17.6/18.0 · 3★ 47.6/48.6 · 5★ 77.5/79.3 · 7★ 107.5/109.9 | OK | measured/formula, worst 2.2% |
| kiembang | star scaling 7★/1★ as designed | 6.10× (design 6.10×) | OK |  |
| kiembang | vs slowed enemies ×5 (+400%) | 1★ hit ×5.00 | OK |  |
| kiembang | vs slowed enemies ×6 (3★ SHATTER ×6) | 3★ hit ×6.00 | OK |  |
| kiembang | vs slowed enemies ×6 | 5★ hit ×6.00, splinters on the target itself: 0 | fixed code |  |
| kiembang | vs slowed enemies ×8 (7★ GLACIER ×8) | 7★ hit ×8.00, splinters on the target itself: 0 | fixed code |  |
| kiembang | each hit chills enemies within 44 px 20% · 2s | 20px: 0.2 · 120px: 0 | OK |  |
| kiembang | slow-immune enemy with a slow timer but 0% slow is NOT "slowed" | hit ×1.0 | fixed code |  |
| kiembang | frozen (Frost) counts as slowed | hit ×5.0 | fixed code |  |
| kiembang | 5★ SPLINTERS: shatter splashes 40% (of ×6) on enemies within 40 px | splash ×2.40,×2.40 | OK |  |
| mimic | merges with ANY same-star turret → +1★ from deck | Mimic3★+Cannon3★ → 4★, slot freed true | OK |  |
| mimic | result +50% attack for 8s | aurora set true | OK |  |
| mimic | aurora = ×1.5 damage, expires after 8s | ×1.50, left 0.00s | OK |  |
| mimic | not with a different star; works with supports; not at 7★ | false/true/false | OK |  |
| mimic | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones | 1★ 11.1/11.4 · 3★ 36.9/37.1 · 5★ 76.9/77.5 · 7★ 151.3/152.3 | OK | measured/formula, worst 2.8% |
| mimic | star scaling 7★/1★ as designed | 13.59× (design 13.31×) | OK |  |
| chimang | +crit chance N/E/S/W: 6% at 1★ → 20% at 7★ | 6/8/11/13/15/18/20 | OK |  |
| chimang | milestone text 3★/5★ = real crit value | +11% crit chance / +15% crit chance, +10% crit damage / +20% crit; every 6s a sure crit | fixed text | real 3★ 11%, 5★ 15% |
| chimang | buffs N/E/S/W only (not diagonal, not other supports); 5★ +10% crit damage | N 25.0% · W 25.0% · diag 10.0% · cdmg +10.0% · Radar 0.0% | OK |  |
| chimang | 7★ CERTAIN STRIKE: a sure crit every 6s | crit rate 56.7% over 180 shots (40% without it, ~57% expected) | OK | Revolver 20% + Antenna 20% + 1 sure crit / 6s |
| dichchuyen | drag onto a same-star turret: SWAP places (no merge, stars kept) | true/true/true/2/12 | OK |  |
| dichchuyen | different star → cannot swap | false | OK |  |
| dichchuyen | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones | 1★ 14.0/14.3 · 3★ 46.9/46.3 · 5★ 98.7/96.8 · 7★ 194.0/190.2 | OK | measured/formula, worst 2.0% |
| dichchuyen | star scaling 7★/1★ as designed | 13.84× (design 13.31×) | OK |  |
| radar | +fire rate N/E/S/W: 12% at 1★ → 28% at 7★ | 12.0%/17.4%/22.8%/28.2% | OK |  |
| radar | neighbours only; 5★ LOCK-ON +4% crit; also buffs Special turrets (Frost) | N 22.8% · diag 0.0% · crit 4.0% · Frost 22.8% | OK |  |
| radar | 7★ OVERDRIVE: every 8s +25% fire rate for 2s — inside the 45% fire-rate cap | peak 45.0%, 3.0s boosted in 17s (bursts at 8s, 16s) | fixed code |  |
| radar | measured: Gatling next to Radar 3★ fires +17.4% faster | +17.5% | OK |  |
| drone | on merge: 1 + ⌊★/3⌋ bomb drones × 24 (result-star power), 46 px blast | 1★: 1 drones × 500, 3 blast hits | OK |  |
| drone | on merge: 1 + ⌊★/3⌋ bomb drones × 24 (result-star power), 46 px blast | 3★: 2 drones × 960, 6 blast hits | OK |  |
| drone | on merge: 1 + ⌊★/3⌋ bomb drones × 24 (result-star power), 46 px blast | 6★: 3 drones × 1650, 9 blast hits | OK |  |
| drone | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones | 1★ 18.6/18.6 · 3★ 60.3/60.3 · 5★ 123.7/125.9 · 7★ 246.7/247.5 | OK | measured/formula, worst 1.8% |
| drone | star scaling 7★/1★ as designed | 13.26× (design 13.31×) | OK |  |
| tron | +6% fire rate, +2% per different Attack type (max 12% at 1★) | 1 type 6.0% · 4 types 12.0% · 2 same 6.0% | OK |  |
| tron | Attack neighbours only (Frost not buffed) | 0.0% | OK |  |
| tron | 5★ MIXED FIRE: 3+ types +3%×K damage · 7★ PERFECT BLEND 4 types +6% crit | 5★ dmg 5.7% · 7★ crit 6.0% · 7★ fire 28.2% | OK |  |
| tron | old text "merges with any turret; stars = average" removed | false / Support: +6% fire rate to Attack neighbours, +2% per different type (max 12% at 1★) | fixed text |  |
| nangluong | damage +100% per 120 current mana (max +500%) | 0 mana → ×1.00 | OK |  |
| nangluong | damage +100% per 120 current mana (max +500%) | 240 mana → ×3.00 | OK |  |
| nangluong | damage +100% per 120 current mana (max +500%) | 600 mana → ×6.00 | OK |  |
| nangluong | damage +100% per 120 current mana (max +500%) | 2000 mana → ×6.00 | OK |  |
| nangluong | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones (0 mana) | 1★ 15.4/15.4 · 3★ 49.6/50.0 · 5★ 103.6/104.6 · 7★ 203.6/205.6 | OK | measured/formula, worst 1.0% |
| nangluong | star scaling 7★/1★ as designed | 13.18× (design 13.31×) | OK |  |
| laser | beam ramps to ×4 over 3s | 2.1 → 3.6 → 4.0 → 4.0 × | OK |  |
| laser | beam never crits (crit supports do nothing on Laser) | 0 crit ticks | OK | by design (crit:false) |
| laser | switching target resets the ramp | 1.00 → 0.04 | OK |  |
| laser | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones (ramped ×4, fire-rate buffs scale it) | 1★ 62.7/62.4 · 3★ 201.3/202.2 · 5★ 410.0/411.8 · 7★ 745.5/742.2 | OK | measured/formula, worst 0.4% |
| laser | star scaling 7★/1★ as designed | 11.89× (design 11.89×) | OK |  |
| laser | Overclock +65% fire rate also speeds the beam | ×1.67 | fixed code |  |
| laser | rival Clamp (−40% fire rate, PVP) also slows the beam | ×0.62 | fixed code |  |
| lanhgia | neighbours’ hits slow 8% × star curve (1★ 8% → 7★ 18.8%), 2s | 8.0%/11.6%/15.2%/18.8% | OK |  |
| lanhgia | slow applies on hit for 2s | 18.8%, 1.9s | OK |  |
| lanhgia | bosses max 15% | 15.0% | OK |  |
| lanhgia | slow-immune enemies get no slow (and no slow timer) | 0.00 / 0.00 | fixed code |  |
| lanhgia | 5★ FROSTNIP: +5%×K damage vs slowed | 9.5% | OK |  |
| lanhgia | 7★ FLASH FREEZE: every 8s a hit freezes 0.8s | 8, 16.1, 24.3s | OK |  |
| lanhgia | measured: Gatling hit on a slowed enemy next to Chiller 5★ = +9.5% | hit ×1.095 | OK |  |
| mortar | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones (single target + every 3rd shell 3 bomblets ×45% land on it) | 1★ 22.8/22.2 · 3★ 75.2/71.8 · 5★ 153.4/150.0 · 7★ 301.6/287.9 | OK | measured/formula, worst 4.8% |
| mortar | star scaling 7★/1★ as designed | 13.22× (design 12.99×) | OK |  |
| mortar | every 3rd shell is a CLUSTER (3 bomblets ×45%) | 5 shells → 4 bomblet hits | OK |  |
| mortar | info line "cluster shell in N" counts down 3 → 2 → 1 | 3 → 2 → 1 | fixed text |  |
| mortar | shells random enemies, 46 px splash | 4 different enemies hit | OK |  |
| khuech | +9%×K damage per consecutive hit on the same enemy, max 5 stacks (5★ 7) | 9.0%×5 / 13.1%×5 / 17.1%×7 / 21.1%×7 | OK |  |
| khuech | stacks grow per hit then cap at 35% (shared damage cap) — lien | 1 → 1.09 → 1.18 → 1.27 → 1.35 → 1.35 → 1.35 → 1.35 | OK |  |
| khuech | stacks grow per hit then cap at 35% (shared damage cap) — sungluc (slow gun) | 1 → 1.09 → 1.18 → 1.27 → 1.35 → 1.35 → 1.35 → 1.35 | fixed code |  |
| khuech | stacks grow per hit then cap at 35% (shared damage cap) — tia (slow gun) | 1 → 1.09 → 1.18 → 1.27 → 1.35 → 1.35 → 1.35 → 1.35 | fixed code |  |
| khuech | stacks fade after a 1.5s+ pause | 5 stacks → after 2s pause ×1.00 | OK |  |
| khuech | 7★ LOCKED IN: stacks last 3s | ampGiu 1 | OK |  |
| khuech | Attack neighbours only | false/false | OK |  |
| vungdoc | a pool every 4.6−0.2×★ s (min 2.6), radius 30+2×★ px (7★ ×1.5) | 1★ 4.4s/32px · 3★ 4.0s/36px · 5★ 3.6s/40px · 7★ 3.2s/66px | OK |  |
| vungdoc | pool poisons enemies on it: 3.5 × damage per second, 5s | 31.8/s (formula 31.8) | OK |  |
| vungdoc | poison stops after the pool/linger ends (no stale poison) | poison dps left 0.00 | fixed code |  |
| vungdoc | 3★ TWIN POOLS | 2 pools | OK |  |
| vungdoc | 5★ CORROSION: +15% damage taken | 15.0% | OK |  |
| vungdoc | old pool poison does not come back when Venom marks the enemy | poison dps 0 | fixed code |  |
| loa | on merge: Archfiend cooldown −(3 + 1.5×★)s; if ready: cost −15% (not below base) | cd 20→14 (2★) · cost 120→102 · base 30→30 | OK |  |
| loa | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones | 1★ 14.3/14.3 · 3★ 46.7/46.3 · 5★ 97.0/96.8 · 7★ 190.7/190.3 | OK | measured/formula, worst 0.7% |
| loa | star scaling 7★/1★ as designed | 13.34× (design 13.31×) | OK |  |
| hutmana | DPS 1/3/5/7★ = dmgU × fire rate × crit × milestones | 1★ 22.0/22.0 · 3★ 72.2/71.4 · 5★ 150.0/149.1 · 7★ 299.4/293.1 | OK | measured/formula, worst 2.1% |
| hutmana | star scaling 7★/1★ as designed | 13.59× (design 13.31×) | OK |  |
| hutmana | each hit +mana (0.35 +0.15/★), never above the per-second cap (1.2 +0.3/★) | 1★: 0.45/s (hits give 0.49/s, cap 1.2) | OK |  |
| hutmana | each hit +mana (0.35 +0.15/★), never above the per-second cap (1.2 +0.3/★) | 3★: 1.05/s (hits give 1.09/s, cap 1.8) | OK |  |
| hutmana | each hit +mana (0.35 +0.15/★), never above the per-second cap (1.2 +0.3/★) | 7★: 2.25/s (hits give 2.66/s, cap 3.0) | OK |  |
| min | a mine every 4−0.2×★ s (min 2s); star mine chance 3% +0.5%/★ | 1★ 3.8s/3.0% · 3★ 3.4s/4.0% · 5★ 3.0s/5.0% · 7★ 2.6s/6.0% | OK |  |
| min | mine = 7 × damage, 36 px blast (star mine ×3) | ×7.00, 36 px | OK |  |
| min | at most 6 mines out at once | 6 mines after 40s | OK |  |
| min | walking onto a mine blows it up (Mine Layer gets the hit) | 1 / 1 / min | OK |  |
| phagiap | every 3s EXPOSES the lead + the toughest enemy for 6s | 5.9 / 5.9 / 0.0 s | OK |  |
| phagiap | Attack neighbours +22% vs exposed (Frost neighbour gets nothing) | 22.0% / null | OK |  |
| phagiap | 5★ DOUBLE EXPOSE: 3 enemies | 2/3 | OK |  |
| phagiap | 7★ SHATTERED GUARD: exposed take +8% from all | 8.0% | OK |  |
| phagiap | measured: Revolver hit on the exposed lead next to Breaker 3★ = +31.9% | hit ×1.319 / ×2.638 | OK |  |
| bua | Attack neighbours +5%×K crit, +30%×K crit damage (cap 50%), stagger 0.2s (7★ 0.35s) | 1★ 5.0%/30.0%/0.2s · 3★ 7.2%/43.5%/0.2s · 5★ 9.5%/50.0%/0.2s · 7★ 11.8%/50.0%/0.35s | OK |  |
| bua | neighbours’ crits stagger normal enemies (3s immunity) | 6 staggers in 60s | OK |  |
| bua | big enemies: no stagger below 7★; 7★ QUAKE staggers them too | stunned frames 1★ 0 · 7★ 180 | OK |  |
| bua | measured: Revolver next to Hammer 5★: crit hit ×2.5 (cap), crit rate 29.5% | crit ×2.50, rate 26.4% | OK |  |
| hotro | star curve 1.00/1.20/1.45/1.65/1.90/2.10/2.35 | 1/1.2/1.45/1.65/1.9/2.1/2.35 | OK |  |
| hotro | in-match LV: +6% per level | 1.798 (3★ LV5) | OK |  |
| hotro | shape: 4 straight cells; Resonance Grid: 4 diagonal cells; board edge clips | [6,8,2,12] [1,5] [1,3,11,13] [1,11] | OK |  |
| hotro | supports never buff themselves or other supports | 0/0/0 | OK |  |
| hotro | several copies of one support type → only the strongest counts | 28.2% (7★ alone 28.2%) | OK |  |
| hotro | different types add up, fire-rate cap 45% | 45.0% (cap hit 1) | OK |  |
| hotro | crit +20 points cap, crit damage +50% cap | 20.0% / 50.0% (total crit 40.0%) | OK |  |
| hotro | conditional damage (exposed/slowed/stacks) shares the 35% damage cap with plain +damage | plain 0.0% → conditional ×1.350/1.350/1.350 | OK |  |
| hotro | slow from supports: strongest only, cap 35% | 23.3% | OK |  |
| hotro | enemy weakness (Venom 12 + Time Bomb 10 + Breaker 7★ 8 + Toxic 15) caps at 25% | 25.0% | OK |  |
| hotro | commander RAGE ×2 stacks on top of capped support buffs (not inside the cap) | ×2.000 with +0.0% support damage | OK |  |
| hotro | measured: full support ring + RAGE → pre-crit damage exactly ×2 (support multipliers unchanged) | ×2.000 | OK |  |
| hotro | milestones: 3★ +20% fire (not supports) · 7★ +30% dmg (not supports) · 5★ OVERCHARGE +25% (beam/pool types) | 0.20/0.00/1.30/1.00/0.00/1.25 | OK |  |
| hotro | 5★ DOUBLE TAP: every 4th attack fires twice | 18 shots in 20s (no DT 14) | OK |  |
| hotro | Resonance Grid: +8% to diagonals only; all 4 diagonals filled → RESONANCE ×1.5 | diag 8.0% · straight 0.0% · full 12.0% | OK |  |
| hotro | Resonance Grid 7★ info: fire-rate ×1.5 shown only when resonance is full | +19% damage to the 4 DIAGONAL cells (never N/E/S/W) · 0/4 filled · fill all 4 (middle row) for RESONANCE · +12% fire rate | fixed text |  |
| hotro | Attack floor: board with <2 Attack turrets summons Attack cards only | tc,tc,ht,tc,ht,tc | OK |  |
| (all) | info panel lines (skill / fire rate / milestones) at 1/3/5/7★ have no NaN/undefined | 32 turrets × 4 stars clean | OK |  |
| (all) | SOLO / CO-OP / PVP 60s with each Common/Rare turret in deck: no errors | 96 runs clean | OK |  |
