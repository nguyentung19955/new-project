# Rà soát animation theo bậc + chữ ký hiệu ứng ĐỎ (09/11)

Yêu cầu người dùng: *"hiệu ứng skill, special của đỏ phải thật sự đẹp, khác biệt. rà soát animation của các ụ trắng xanh tím vàng đỏ xem có animation nào có đơn giản quá so với tier của ụ không"*.

## Cách làm
- Công cụ: `tools/thap-anim-bac.js` (390×844, DPR 2, chế độ SOLO). Mỗi ụ đặt ở ô hàng dưới giữa bàn, 8 quái đứng yên máu vô hạn trên đoạn đường đáy.
  - **đánh thường** = 1★, 8 khung × 0,08 s từ phát trúng đầu (sau 1,4 s để qua hiệu ứng triệu hồi);
  - **chiêu/đặc biệt** = 5★, nạp đầy + gọi chiêu chủ động; 2 lượt mô phỏng giống hệt: lượt 1 tìm SỰ KIỆN CHIÊU (T.nap tụt / T.sang bật / hiệu ứng sân ≥ 0,5 s / p2fx / SIG), lượt 2 chụp 10 khung quanh đó (0,14 s; ụ Đỏ 0,24 s và khung 320 px) — có cả pha báo trước.
  - Số liệu độ phức tạp (12 s mô phỏng): đỉnh hạt `FX.hat`, đỉnh vòng `FX.vong`, số dải nổ `FX.anim`, loại hiệu ứng sân `G.hu` → `ket-qua.json` (không commit, chạy lại được).
- Bảng ảnh (đã xem từng tấm bằng mắt): [bang-trang.jpg](bang-trang.jpg) · [bang-xanh.jpg](bang-xanh.jpg) · [bang-tim.jpg](bang-tim.jpg) · [bang-vang.jpg](bang-vang.jpg) · [bang-do.jpg](bang-do.jpg) (Đỏ TRƯỚC, `?dosig=0`) · [bang-do-truoc-sau.jpg](bang-do-truoc-sau.jpg) (Đỏ trước/sau).
- Chạy lại: `python3 -m http.server 8813 &` rồi `NODE_PATH=/opt/npm-tools/node_modules node tools/thap-anim-bac.js` (`CHI=id,id` · `PHA=atk|sk` · `Q='&dosig=0'` · `TE=cobac:1.92` ép thời điểm).
- Hạn chế: quái đứng yên, 1 ụ một mình; ụ hỗ trợ không có ụ để buff thì chỉ thấy `ping` (đã đặt 2 Hammer kề cho ụ Hỗ trợ). Lucky Slot quay ngẫu nhiên (jackpot không lần nào cũng ra).

## Thang chấm
- **Lớp** (độ phức tạp hình: số lớp, hạt, ánh sáng, chuyển động) 1–5 · **Riêng** (nhìn là nhận ra ụ nào) 1–5.
- **Quy chuẩn bậc**: Trắng 1–2 lớp gọn · Xanh +1 lớp · Tím có hạt/ánh (≥3) · Vàng có lớp phát sáng + hình đặc trưng (≥4, Riêng ≥3) · Đỏ hoành tráng, độc nhất: báo trước → bùng nổ nhiều lớp → ánh sáng/rung nhẹ → dư âm, màu riêng (5/5) — nhưng không che đường quái (dịu VFX: lớp dưới alpha 0,55, lớp trên khoét quanh quái, ≤ 28 dải nổ).
- Nền chung đã có (tiervfx.js `TVX`): Xanh +4 hạt, Tím +vòng mảnh, Vàng +tia lửa + quầng nhỏ, Đỏ +nổ "WOW" (mỗi 0,9 s). Lớp này làm Vàng/Tím **khác Trắng rất ít** khi nhìn trên điện thoại (hạt 6–7 px, sống 0,26 s, bị dịu ×0,88 và khoét quanh quái).

## Kết quả theo bậc
### TRẮNG (14) — đạt
Đơn giản gọn đúng bậc. Nổi bật hơn bậc (không phải lỗi): Tesla (sét chuỗi), Iron Fist, Time Bomb. Venom / Armor Breaker / Guillotine nhìn mờ nhưng hợp bậc. **Không ụ nào quá đơn giản.**

### XANH (17) — đạt, 2 ụ hơi nhạt
| Ụ | Lớp | Riêng | Ghi chú |
|---|---|---|---|
| Ice Blade, Energy Cannon, Mortar, Toxic Pool, Mine Layer, Laser | 3 | 3–4 | có lớp riêng (băng vỡ, cầu năng lượng, nổ chùm, vũng sủi, mìn nổ, tia) — đúng bậc |
| Teleporter, Mana Leech, Cooldown Horn, Mana Doubler | 2 | 2 | đạn nhỏ + chấm trúng nhạt — **hơi nhạt** (ưu tiên thấp) |
| Mimic, Drone Bay | 2 | 3 | ổn |
| Crit Antenna, Radar, Fusion Mixer, Chiller, Amplifier | — | — | Hỗ trợ: ping buff — đúng vai |

### TÍM (22) — 6 ụ quá đơn giản
| Ụ | Lớp | Riêng | Ghi chú |
|---|---|---|---|
| Blizzard, Storm Gun, Ricochet, Chrono Lock, Lighthouse, Berserker | 4 | 4 | tuyết phủ đường / sét đôi / đĩa nảy / ấn khoá / cột sáng / lửa cuồng nộ — đạt |
| Fifth Shot, Lone Ace, Bounty Beacon | 3 | 3 | đạt sát |
| **Cloner, Chain Link, Jammer, Scrambler, Overclock, Signal Jammer** | 2 | 1–2 | đạn nhỏ + chấm trúng nhạt, hiệu ứng 5★ gần như không thấy — **quá đơn giản so với Tím** (ưu tiên vừa) |
| Combo Core | 2 | 2 | chỉ thấy số; ưu tiên thấp |
| Mystery Box | 3 | 4 | hộp + tờ P3 (bật nắp) — đạt |
| Cleanser, Shield Gen, Star Lift, Reaper Pillar, Focus Lens | — | — | Hỗ trợ/đặc biệt: ping; Reaper có nhát hái P3 khi giết |

### VÀNG (33) — 14 ụ quá đơn giản (ưu tiên CAO)
Ụ Vàng tấn công phần lớn dùng chung khuôn: đạn nhỏ → chấm trúng trắng mờ 1 khung + 20–28 hạt TVX. Trên điện thoại khó phân biệt với Tím/Xanh; 5★ không có pha "đặc biệt" thấy được.
| Ụ | Lớp | Riêng | Ghi chú |
|---|---|---|---|
| Werewolf, Eclipse, Compass Cannon, Hydra, Marionette, Wall Projector, Salvo Battery, Rainbow | 4–5 | 4–5 | vuốt đỏ + vòng, nhật thực lửa, nổ pháo, đầu rồng, dây rối, tường sáng, loạt tên lửa, cầu vồng — **đạt** |
| Star Cannon, Nine-Tail, Pandora Vault, Ember Relay | 3 | 3 | hơi nhạt nhưng có hình riêng (sao, lửa cáo, hộp, vòng lửa ở ụ) |
| **Purifier, Merge King, Twin Maker, Copycat, Nemesis, Quantum Choir, Fusion Archive, Hero Foundry, Blood Circuit, Hex Saboteur, Prism Thief, Wild Link** | 2 | 1–2 | **quá đơn giản**: chấm trúng nhạt giống nhau, không lớp phát sáng riêng, không hình đặc trưng (ưu tiên CAO — theo thứ tự hay được chọn: Nemesis, Blood Circuit, Prism Thief, Quantum Choir, Merge King, Purifier, …) |
| **Sync Cannon, Star Breaker** | 1 | 1 | không thấy hiệu ứng nào trong 12 s (bắn theo nhịp ghép / sự kiện) — cần hình lúc kích (ưu tiên CAO) |
| Evolver, Orbital, Twin Anvil, Resonance Grid, Mirror Gate, Sanctum, Hatchery Gate | — | — | cơ chế theo sự kiện ghép/nhịp dài — không bắt được trong 12 s; cần rà riêng bằng tình huống ghép (ưu tiên vừa) |

### ĐỎ (10 đang chơi; Holy Halo đã bỏ) — TRƯỚC: 7 ụ chưa xứng bậc
Trước khi sửa ([bang-do.jpg](bang-do.jpg), hàng trên [bang-do-truoc-sau.jpg](bang-do-truoc-sau.jpg)):
- **Cryo Reactor** (tờ P2 phủ cả màn) và **Chrono Throne** (mặt đồng hồ P2) hoành tráng — nhưng Cryo phủ kín đường ~0,8 s (ghi nhận, chưa sửa: thuộc tờ P2).
- **Black Hole**: hố xoáy gần như KHÔNG THẤY (đĩa hu_hoden ×0,5 dưới quái, xám trên đường xám); nghiền chỉ là số. **Overlord**: tia + nổ P2 đẹp nhưng 1 lớp, tắt nhanh. **Hive Queen**: SWARM chỉ có vòng cam nhỏ. **Leviathan**: sóng thở chỉ là vệt tia dọc đường. **Genesis Core**: sen P2 đẹp nhưng chỉ ở ụ, ụ nhận không có gì. **Wyrm Engine**: bổ nhào = ảnh rồng trượt, không gầm, không dư âm. **Lucky Slot**: chỉ vòng 40–70 px khi ra kết quả. **Arcane Cascade**: MANA FLOOD không có hình riêng (chỉ lắc nhẹ + điện nổ thường).
- Không ụ Đỏ nào có **báo trước** khi chiêu sẵn sàng (ngoài Overlord tờ P2).

## Đã nâng cấp — CHỮ KÝ ĐỎ (`thap/js/dosig.js`)
Mỗi ụ Đỏ một chữ ký riêng (màu + hình khối + nhịp): **báo trước** (theo trạng thái nạp) → **bùng nổ nhiều lớp** → **loé/rung nhẹ** (qua `FX.sang`/`FX.lac`, chặn chung TVX 0,6–1,2 s) → **dư âm**.
| Ụ | Màu | Báo trước | Bùng nổ | Dư âm |
|---|---|---|---|---|
| Black Hole | tím–đen | hạt tối xoắn vào nòng khi hố kế ≥ 75% | 3 vòng co sập vào tâm + vệt hút; chân trời sự kiện: lõi tối, vành sáng, 2 tay xoắn bồi tụ, 12 điểm mép quay, hạt bị hút liên tục | NGHIỀN: loé trắng-tím, 2 vòng nổ + vòng gai, 14 mảnh bắn ra, rung 3–4 |
| Overlord | đỏ thẫm | điện đỏ bò quanh đầu (nạp ≥ 70%), dày dần | thiên lôi 3 nhánh từ trời + lõi trắng, loé, vòng gai, 2 vòng | 4–7 vết nứt đất đỏ nguội dần, điện bò dọc vết nứt, khói tối |
| Cryo Reactor | băng trắng-lam | 6 tinh thể quay quanh lò | hút sương → bông tuyết 6 cánh mọc nhánh xoay chậm, 18 mảnh băng, vòng gai | tuyết rơi xoay 1,4–1,9 s |
| Chrono Throne | đỏ + vàng kim | 12 vạch giờ, 1 vạch sáng chạy NGƯỢC (tích tắc) | mặt đồng hồ ngoài (2 vành, 12 vạch, kim quay ngược), gợn CO VÀO | bóng quái ở chỗ cũ + cát vàng chảy về ngai |
| Hive Queen | hổ phách | lục giác xoay quanh tổ | tổ ong 7 lục giác bật ra + quầng | lục giác nổ chỗ mỗi drone lao (SWARM to hơn, có tia) |
| Leviathan | xanh biển | bong bóng nổi | vòng gai nước + giọt văng ở thân; đầu sóng 3 vệt bọt theo hướng + giọt bắn | gợn đọng lại dọc đường; xoáy nuốt có giọt xoắn vào |
| Genesis Core | hồng + vàng | 3 cánh sen bay vòng | sen 8 cánh nở + cột sáng + sao bay lên | ụ nhận: vòng vàng + 7 cánh hoa toả rồi rơi |
| Wyrm Engine | lửa cam-vàng | than bốc + quầng nhiệt | gầm = 2 vòng xung lửa + 16 than | 2 dải cánh lửa theo cú bổ nhào + than bay |
| Lucky Slot | vàng | — (đang quay đã có hình) | cặp: 9 xu lật + vòng màu quả · JACKPOT: 18 xu, 12 giấy màu, 12 tia vàng quay, quầng | xu rơi theo trọng lực |
| Arcane Cascade | tím + lam | 3 giọt mana bay vòng | trận đồ suốt MANA FLOOD: 2 vành + 2 tam giác xoay ngược (lục mang tinh) + 12 phù văn | mỗi nhịp thác: dòng mana đổ từ trên xuống TỪNG quái + gợn + sao |

Trước/sau: [bang-do-truoc-sau.jpg](bang-do-truoc-sau.jpg) (10 khung × 0,24 s, 390×844).

Ràng buộc đã giữ:
- **Chỉ hình**: chỉ đọc `G.hu`, `T.nap`, `T.bhT`, `T.bungT`, `T.thacT`, `cbQuay.da`; không ghi vào G/T/quái; thời gian theo `G.t`; nhiễu băm theo sự kiện (không `Math.random`) → không đổi luật / đồng bộ online.
- **QUY-TAC-HINH**: chỉ đặt/xoay/phóng/mờ/tô màu ẢNH PNG có sẵn (`PX.vong/tia/cham/sao`, `fx_song_xung`, `fx_vet_trang`, `fx_la`, `fx_giot_nuoc`, `fx_than`, `fx_hoa_giay`, `cb_xu`, `hat_tuyet`); ảnh chưa tải → bỏ qua, hình cũ vẫn vẽ (đường dự phòng = chính hiệu ứng cũ, `?dosig=0` tắt hẳn).
- **Dịu VFX**: vẽ trong lớp TRÊN của `REN.veFx` → được khoét mềm quanh quái + alpha `DIU.tren`; lõi tối Hố Đen alpha 0,5; không thêm dải nổ vào `FX.anim` (trần 28 giữ nguyên).
- **EFFECTS Minimal**: ~40% hạt, bỏ dư âm dài, luôn bản nhẹ · **REDUCE FLASH**: loé ×0,4.
- **Ngân sách**: > 2 chiêu Đỏ cùng bùng → chiêu sau vẽ bản nhẹ (bỏ vòng/quầng > 120 px); trần 160 hạt; không dùng `PX.cung` xoay (mỗi góc dựng 1 canvas).

## Hiệu năng (`tools/thap-kt-dosig-perf.js`, iPhone 13, CPU ×4)
Kịch bản cực đoan: 15 ụ = 10 ụ Đỏ 5★ + 5 ụ bắn nhanh, 30 quái, MỌI ụ ra chiêu mỗi 40 khung (~0,7 s — ngoài trận thật hồi chiêu 25–40 s).
- Máy đo dùng chung, tải nặng (load 10–17) → đồng hồ khung nhiễu ±40% giữa 2 lần cùng bản. Trung bình khung (ms): tắt 368 / 335 / 492 — bật (bản cuối) 435 / 450 / 527.
- Số tất định: thời gian CPU trong DSG.ve **10–15 ms/khung ở CPU×4 (≈ 2–3% khung)**; điểm ảnh vẽ thêm **1,63 M/khung = 11,9% điểm ảnh của khung** (12,1 M → 13,7 M) trong kịch bản cực đoan. Trận thường (1–2 chiêu Đỏ cùng lúc, mỗi vài chục giây) chênh không đáng kể; bản nhẹ tự bật khi > 2 chiêu cùng bùng.

## Việc còn lại (ưu tiên) — đợt 1 (mục 1, 2, 4, 5 đã làm ở "Đợt 2" bên dưới)
1. **VÀNG (cao)** — 12 ụ tấn công dùng chung khuôn trúng nhạt (Nemesis, Blood Circuit, Prism Thief, Quantum Choir, Merge King, Purifier, Twin Maker, Copycat*, Fusion Archive, Hero Foundry, Hex Saboteur, Wild Link) + Sync Cannon, Star Breaker: cần (a) lớp phát sáng riêng lúc trúng (quầng màu nguyên tố ≥ 40 px, vòng xung nhỏ), (b) 1 hình đặc trưng mỗi ụ (vd Nemesis = dấu ngắm khoá đỏ; Blood Circuit = giọt máu bay về ụ; Prism Thief = tia khúc xạ 3 màu; Quantum Choir = nốt sóng; Merge King = vương miện loé; Purifier = vòng thánh + lông vũ). *Copycat lấy hình ụ được chép.
2. **TÍM (vừa)** — Cloner, Chain Link, Jammer, Scrambler, Overclock, Signal Jammer: thêm hạt/ánh riêng lúc trúng + hình 5★ thấy được (Chain Link: mắt xích sáng nối 2 quái; Jammer/Signal Jammer: nhiễu sọc quanh quái; Overclock: tia điện nhỏ quanh ụ khi tăng tốc).
3. **XANH (thấp)** — Teleporter, Mana Leech, Cooldown Horn, Mana Doubler hơi nhạt.
4. **Cryo Reactor**: tờ P2 phủ kín cả vùng ~0,8 s — cân nhắc giảm alpha/cỡ tờ (thuộc vfxp2.js).
5. Rà riêng các ụ chạy theo sự kiện ghép (Evolver, Orbital, Twin Anvil, Resonance Grid, Mirror Gate, Sanctum, Hatchery Gate) bằng kịch bản ghép thật.

## Đợt 2 (09/11) — VÀNG/TÍM xứng bậc, dịu Đỏ, báo trước theo tự kích
Bảng trước/sau (đã xem từng phần bằng mắt): [bang-vang-tim-sau.jpg](bang-vang-tim-sau.jpg) — mỗi ụ 1 dải TRƯỚC (`?vsig=0`) | SAU: 6 khung đòn trúng (0,06 s, khung bám điểm trúng) + 8 khung kỹ năng / ghép thật; cuối bảng: trận đông wave 30 trước (`?dodiu=0&vsig=0`) / sau.
Chạy lại: `NODE_PATH=/opt/npm-tools/node_modules node tools/thap-anim-vang.js` (`CHI=` · `Q='&vsig=0'` · `OUT=`) — kịch bản THẬT: `ghep()` 2 ụ cùng loại (ụ chỉ-chạy-khi-ghép; có ụ cùng loại thứ 3 cho Orbital/Anvil/…), kéo lên ụ khác (Overclock/Copycat/Merge King/Wild Link), ụ Hỗ trợ + 3 Gatling cùng sao (chờ nhịp xung), thêm ụ cùng sao kề (Hoà âm), PHÁN QUYẾT sau 10 đòn, Archive mốc 10, 3 ụ Chuỗi kề nhau; Blood Circuit: Máu +15 (giả lập 1 lần nuốt).

### Chữ ký Vàng/Tím — `thap/js/vangsig.js` (`?vsig=0` tắt)
| Ụ | Màu (BANG-MAU) | Hình trúng (lớp phát sáng + hình riêng) | Khoảnh khắc kỹ năng / ghép | Chấm sau (Lớp/Riêng) |
|---|---|---|---|---|
| Nemesis | đỏ thẫm #ff3a5a | 4 góc ngắm khép vào quái + hình thoi | PHÁN QUYẾT: kiếm sáng giáng xuống ụ + cán cân 2 đĩa (ST đỏ thẫm / tốc mint #46DFA6 = buff) | 4/5 |
| Blood Circuit | máu sẫm #d0204a | vòng máu + 4 giọt bắn ra rồi bị hút NGƯỢC về ụ | Máu tăng (nuốt ụ): xoáy 12 giọt hút vào + vòng co | 4/5 |
| Prism Thief | 4 màu mặt nạ | 4 tia khúc xạ toả quạt theo hướng bắn + kim cương trắng | (hợp thể giữ hình cũ) | 4/4 |
| Quantum Choir | tím hồng #e6a8ff | 2 vòng sóng âm lệch nhịp + nốt sao bay lên (số nốt = Hoà âm) | Hoà âm tăng: 3 vòng âm + nốt; thường trực: nốt bay vòng = số Hoà âm | 4/5 |
| Merge King | vàng #ffd65b | vương miện vàng loé trên điểm trúng | ghép: vương miện to bật lên + chùm tia | 4/5 |
| Purifier | trắng vàng #fff0a0 (+ độc #A6DF52) | vòng thánh + chữ thập sáng; quái trúng độc: tàn lục → trắng | PURIFY: 8 tia thánh toả | 4/4 |
| Twin Maker | vàng + lam | 2 vòng song sinh xoay quanh nhau | ghép: 2 vòng tách đôi | 4/4 |
| Copycat | tím nhạt #c9a2ff | 2 hình thoi gương trượt ra + vòng | COPY: khung vuông + vệt quét | 4/4 |
| Fusion Archive | lam giấy #bfe4ff | ấn vuông dữ liệu xoay + trang giấy bay | ARCHIVE mốc: 8 ấn vuông quay + trang toả | 4/4 |
| Hero Foundry | lửa rèn #FF8748 | tia lửa rèn bắn toả + vòng búa | ghép: tia lửa + cột vàng · ô ANH HÙNG: quầng mờ + than bốc | 4/4 |
| Hex Saboteur | debuff #759AEF | ngũ giác nguyền xoay + hạt tối rơi | ghép: ngũ giác to xoay (hình nguyền gốc fx_nguyenrua_sk giữ nguyên) | 4/4 |
| Wild Link | 4 màu | 4 chấm cầu vồng quay quanh điểm trúng | ghép: cung cầu vồng nối 2 ô nguyên liệu | 4/4 |
| Sync Cannon | vàng #ffe46b | (không bắn) chấm vàng quay quanh ụ = số ụ khớp sao | mỗi nhịp xung: tia đồng bộ tới MỌI ụ Tấn công cùng sao + vòng ở ụ nhận | 4/4 |
| Star Breaker | cam đỏ #ff7a4a | (không bắn) | mỗi nhịp xung: sao vỡ bay tới ụ kề; STAR BREAK / MERGE SURGE: 5 sao toả | 4/4 |
| Cloner (Tím) | #d9a8ff | 2 sao nhỏ tách đôi + ánh màu nguyên tố | CLONE: vòng + hạt | 3/3 |
| Chain Link (Tím) | #c8a8ff | 2 vòng mắt xích | thường trực: 3 vòng nhỏ chạy dọc nối các ụ cùng chuỗi | 3/4 |
| Jammer (Tím) | #c77dff | 2 vạch kẹp chéo khép vào | CLAMP/SPEED UP: 4 vạch kẹp quanh ô | 3/3 |
| Scrambler (Tím) | #ff8ae0 | 3 chấm xoáy | SCRAMBLE: 4 chấm xoáy co | 3/3 |
| Overclock (Tím) | #ffb070 | tia điện gấp khúc nhỏ | ụ đã ép xung: tia điện cam lách tách mỗi ~1,1 s | 3/3 |
| Signal Jammer (Tím) | #a89aff | 3 vạch nhiễu sọc nhấp nháy | STATIC FIELD: nhiễu sọc trên từng quái (≤ 12) | 3/3 |
- Không lấn Đỏ: không chớp/rung màn; vòng ≤ ~90 px (Đỏ 120–300 px); quầng 25–40%; chiêu Đỏ đang bùng → Vàng/Tím ×0,55; Vàng ×1,3 cỡ, Tím ×1,12; trần 10 hình trúng đồng thời (Minimal 4), Vàng 1 hình / 0,36 s mỗi ụ, Tím 0,6 s.
- Nguồn sự kiện chỉ đọc: `TVX.trung` · `nhanU` (nhãn chữ đã tắt nhưng vẫn được gọi đúng lúc kỹ năng nổ; ghép: trễ `G._treNhan` = lúc lộ kết quả) · `VX.ghep` + lớp bọc `ghep()` cho ghép đặc biệt (gọi/trả y nguyên) · trạng thái `T.nhip / T.mau / T.hop / T.chuoi / T.epxung / B.hero`. Không `Math.random`, thời gian G.t, nhiễu băm theo sự kiện. Màu chọn theo [BANG-MAU.md](../huong-anime/BANG-MAU.md), tránh đỏ báo chiêu trùm #FF4C55.
- **Sync Cannon / Star Breaker "không thấy hiệu ứng"**: không phải lỗi game — ụ Hỗ trợ chỉ nhấp nháy (`HOTRO.nhip` → HU.ping) khi có ụ **Tấn công** nhận buff; bản rà soát đợt 1 đặt 2 Hammer (cũng là Hỗ trợ) cạnh nên không ụ nào nhận. Kịch bản mới đặt 3 Gatling cùng sao → thấy xung (cũ: ping mờ; mới: tia/sao tới từng ụ).

### Ụ Vàng chỉ chạy khi ghép — chấm bằng ghép thật
Trước: hiệu ứng ghép CHUNG (bay vòng cung → nén → chớp → quay số thẻ → bảng tên) đã đẹp, nhưng **không có gì riêng của ụ** (Lớp 3 / Riêng 1); Twin Anvil (ghép đặc biệt) chỉ có nhãn tên. Sau (lúc lộ kết quả, 0,9 s): quầng + vòng phù văn + hình riêng — Evolver vỏ trứng lá xanh toả · Orbital 3 vệ tinh bay quỹ đạo · Twin Anvil tia lửa rèn bắn lên · Resonance Grid tia chéo tới 4 ô chéo + vòng ở mỗi ô · Mirror Gate 2 tấm gương mở + vệt quét · Sanctum cột sáng thánh + chữ thập · Hatchery Gate cổng xoáy 2 vòng ngược chiều + hạt hút vào → Lớp 4 / Riêng 3–4.

### Dịu (quy tắc: không che quái / thanh máu / đường; nổ loé ngắn rồi tắt; aura 25–40%)
- **Cryo Reactor** (vfxp2.js): tờ P2 1,1 s → 0,85 s (Minimal 0,7 s); pha băng lan sàn (khung 8–12) từ 100% → ~50% độ đậm; loé + vòng gai băng giữ nguyên.
- **Loé lớn Hố Đen nghiền / Overlord thiên lôi** (dosig.js `loeLon`): quầng 1,5–1,7R alpha 0,8 kéo 0,3 s (che cả cụm quái) → ×0,8 cỡ, alpha 0,45, tắt sau 0,22 s + lõi nóng nhỏ 0,4 cỡ 0,16 s (giữ cú "đã"); bản nhẹ (≥ 3 chiêu Đỏ cùng bùng) bỏ quầng lớn.
- **Nổ WOW Đỏ** (tiervfx.js, mỗi ụ Đỏ ~1 lần / 0,9 s): trận đông nhiều ụ Đỏ cùng nổ → nổ thứ 3–4 trong 0,6 s còn 70% cỡ, 0,3 s, bỏ vòng màu 54 px, 2 than; từ nổ thứ 5: chỉ quầng + vòng trắng nhỏ; than đọng 6 → 4. `?dodiu=0` = bản cũ. Trận đông wave 30 (tự chơi, 15 ụ, `tools/thap-chup-trandong.js`): quả cầu hồng ~200 px che cụm quái ở bản cũ → còn vòng trắng nhỏ + tia (cuối bảng ảnh).

### Báo trước Đỏ sau đổi TỰ KÍCH (commit 335decc86)
- Lỗi: `DSG.BAO` của 6 ụ tự kích (Cryo, Chrono, Hive, Leviathan, Genesis, Wyrm) chỉ vẽ khi `nap >= 1` → ụ tự kích nổ ngay lúc đầy nên báo trước gần như không bao giờ thấy (chỉ thấy khi đầy mà chưa "đáng dùng").
- Sửa (`DSG.qBao`): ụ tự kích → báo trước tăng dần từ nạp 80% tới đỉnh đúng lúc nổ (đầy mà chưa nổ = giữ đỉnh); ụ bấm tay (Black Hole, Arcane Cascade) → khi đầy; Overlord giữ 70%; Black Hole vẫn theo hố kế `bhT`.
- Không đôi: `MV.tichTu` của ụ Đỏ có báo trước nhường từ 80% (Overlord 70%) còn 30% (lõi mờ để ụ không "tắt"); XẢ lúc ra chiêu nhỏ lại ×0,45 vì chữ ký Đỏ đã có bùng nổ. Chụp `tools/thap-chup-baotruoc.js` (nạp 0,7 → 1 trong 1,2 s): Leviathan / Genesis / Cryo nổ lúc 1,22 s ngay sau đỉnh báo trước; Wyrm / Hive / Chrono đầy mà chưa đáng dùng → giữ đỉnh.

### Hiệu năng (`tools/thap-kt-dosig-perf.js`, iPhone 13, CPU ×4; máy đo chung nhiễu ±20% đồng hồ khung)
| Kịch bản | Điểm ảnh chữ ký / khung trước → sau | CPU chữ ký (ms, ×4) | Trung bình khung (ms) |
|---|---|---|---|
| 10 Đỏ 5★ + 5 bắn nhanh, mọi ụ ra chiêu mỗi 0,7 s (cũ) | 2,09 M → 2,09 M (12,4%) | 9,9 → 9,4–10,9 | 513–534 → 500–542 |
| `IDS=` 13 Vàng/Tím + Overlord + Wyrm | 0,50 M (6,7%) → 0,69 M (8,9%) | 4,0–5,4 → 6,0–8,4 | 165–207 → 182–216 |
Vàng/Tím thêm ~0,19 M điểm ảnh/khung (+2,4% điểm ảnh khung) sau khi đặt trần 10 hình trúng (bản đầu chưa trần: +0,25 M).

### Bổ sung (pixel) — đợt 2
Nhánh `claude/demo-hop-tuong` không có `docs/pixel/QUY-CHUAN.md`; chữ ký Vàng/Tím chỉ dùng ảnh PNG nền đã liệt kê ở mục "Bản pixel" (thêm `fx_cham_trang`, `fx_vong_mong`, `fx_laser_tia`, `fx_tia_sao`, `fx_giot_nuoc`, `fx_la`, `fx_than`) — khi chuyển `thap/` sang pixel không cần ảnh mới cho vangsig.js; hình khối (vương miện, ngũ giác, hình thoi, góc ngắm) ghép từ đoạn tia nên tự theo bản pixel của `fx_laser_tia`.

### Việc còn lại
1. XANH (thấp): Teleporter, Mana Leech, Cooldown Horn, Mana Doubler vẫn hơi nhạt.
2. Prism Thief hợp thể 4 màu, Copycat lấy hình ụ được chép: chưa có hình riêng thêm (giữ hình cũ đã có tờ fx).
3. Vòng đỏ quanh ụ Overlord lúc ra chiêu (có sẵn, cả `?dosig=0`) — bàn toàn Overlord vẫn nhiều vòng; cân nhắc giảm ở vfxp2.js nếu người dùng thấy rối.
4. Ảnh nâng cấp (không bắt buộc) — xem "Cần ảnh" (thêm `raw_vsig_*`).

## Bản pixel
Nhánh `claude/demo-hop-tuong` (game `thap/`) không có `docs/pixel/QUY-CHUAN.md` / `DANH-SACH.md` (quy chuẩn pixel thuộc game nhánh chính). Chữ ký Đỏ chỉ dùng lại ảnh PNG có sẵn, không thêm ảnh mới → khi chuyển `thap/` sang pixel chỉ cần bản pixel của 10 ảnh nền đã liệt kê ở trên (vòng mỏng, tia, chấm sáng, sao, vòng gai `fx_song_xung`, vệt `fx_vet_trang`, lá `fx_la`, giọt `fx_giot_nuoc`, than `fx_than`, giấy màu `fx_hoa_giay`, xu `cb_xu`, tuyết `hat_tuyet`) — ghi ở đây làm mục "Bổ sung" cho đợt pixel.

## Ảnh chữ ký Đỏ đã có (09/11) — ĐÃ GẮN
4 tờ `docs/demo-hop-tuong/thap-art/raw_dosig_{hex,lotus_petal,crack,rune}.png` → `python3 tools/thap-cat-dosig.py` → `thap/assets/dosig_hex|sen|nut|tran.png` (dải 4 khung vuông, hộp bao chung giữ tỉ lệ nhỏ → lớn, khoá magenta mềm + gỡ trộn nền; ảnh kiểm [dosig-cat.png](dosig-cat.png), đã xem). `DSG.khungAnh` (REN.khungMuot hoà 2 khung) thay phần ghép tạm, ảnh chưa tải → hình ghép cũ (dự phòng):
- **Hive Queen**: lục giác báo trước (khung "đầy" xoay chậm), tổ ong SWARM 7 ô (nhỏ → đầy → nứt → mờ theo đời), nổ chỗ drone lao (đầy → nứt → mờ).
- **Genesis Core**: 3 cánh sen báo trước, sen 8 cánh nở (lúc tắt chuyển khung "tan thành sao"), cánh hoa rơi ở ụ nhận = hạt `sen` (cuối đời tan).
- **Overlord**: vết nứt đất = decal `dosig_nut` (tươi → sáng → nguội → mờ trong 1,3 s, xoay theo sự kiện); điện vẫn bò dọc đường nứt cũ.
- **Arcane Cascade**: trận đồ suốt MANA FLOOD = `dosig_tran` đập nhịp (thường ↔ rực), sắp hết lũ → khung tan, quay chậm.
Ảnh nạp sớm khi bàn có ụ Đỏ. Trước/sau (anim-bac `PHA=sk`, đã xem): lục giác tổ ong / cánh sen / vòng trận đồ hiện rõ thay nét ghép mảnh.

## Cần ảnh (ChatGPT) — không bắt buộc, code đã chạy được bằng ảnh có sẵn (4 ảnh `raw_dosig_*` bên dưới: ĐÃ CÓ + đã gắn)
Chung: lưới ô vuông, nền magenta #FF00FF đặc, không chữ, "same style as attached" (đính kèm `fx_song_xung.png` + `fx_vet_trang.png`).
- `raw_dosig_hex`: *"4×1 grid, glowing amber honeycomb hexagon outline sprites (thin bright edge, soft glow), frames: small → full → cracked → fading, game VFX, magenta background, no text"* — thay lục giác ghép từ đoạn tia (Hive Queen).
- `raw_dosig_lotus_petal`: *"4×1 grid, single glowing pink lotus petal, front / tilted / curled / dissolving into sparkles, game VFX, magenta background, no text"* — thay `fx_la` tô hồng (Genesis Core).
- `raw_dosig_crack`: *"4×1 grid, glowing crimson ground crack decals radiating from center, fresh / bright / cooling dark red / faded, top-down, magenta background, no text"* — thay vết nứt ghép đoạn tia (Overlord).
- `raw_dosig_rune`: *"4×1 grid, arcane magic circle with hexagram and rune ticks, violet and cyan glow, top-down, rotation-friendly, magenta background, no text"* — trận đồ Thác Mana.
- `raw_vsig_crown`: *"4×1 grid, small glowing golden crown icon sprite, appear / bright / tilted / fading into sparkles, game VFX, magenta background, no text"* — thay vương miện ghép đoạn tia (Merge King).
- `raw_vsig_lockon`: *"4×1 grid, crimson targeting lock-on reticle (four corner brackets + diamond), wide → closing → locked → fading, game VFX, magenta background, no text"* — Nemesis.
- `raw_vsig_hex`: *"4×1 grid, blue-violet curse sigil pentagon with rune ticks, top-down, rotation-friendly, soft glow, magenta background, no text"* — Hex Saboteur.
- `raw_vsig_verdict`: *"4×1 grid, descending sword of light with golden crossguard over a balance scale, frames: falling / impact / scales tilting / fading, game VFX, magenta background, no text"* — PHÁN QUYẾT Nemesis.
