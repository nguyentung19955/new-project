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

## Việc còn lại (ưu tiên)
1. **VÀNG (cao)** — 12 ụ tấn công dùng chung khuôn trúng nhạt (Nemesis, Blood Circuit, Prism Thief, Quantum Choir, Merge King, Purifier, Twin Maker, Copycat*, Fusion Archive, Hero Foundry, Hex Saboteur, Wild Link) + Sync Cannon, Star Breaker: cần (a) lớp phát sáng riêng lúc trúng (quầng màu nguyên tố ≥ 40 px, vòng xung nhỏ), (b) 1 hình đặc trưng mỗi ụ (vd Nemesis = dấu ngắm khoá đỏ; Blood Circuit = giọt máu bay về ụ; Prism Thief = tia khúc xạ 3 màu; Quantum Choir = nốt sóng; Merge King = vương miện loé; Purifier = vòng thánh + lông vũ). *Copycat lấy hình ụ được chép.
2. **TÍM (vừa)** — Cloner, Chain Link, Jammer, Scrambler, Overclock, Signal Jammer: thêm hạt/ánh riêng lúc trúng + hình 5★ thấy được (Chain Link: mắt xích sáng nối 2 quái; Jammer/Signal Jammer: nhiễu sọc quanh quái; Overclock: tia điện nhỏ quanh ụ khi tăng tốc).
3. **XANH (thấp)** — Teleporter, Mana Leech, Cooldown Horn, Mana Doubler hơi nhạt.
4. **Cryo Reactor**: tờ P2 phủ kín cả vùng ~0,8 s — cân nhắc giảm alpha/cỡ tờ (thuộc vfxp2.js).
5. Rà riêng các ụ chạy theo sự kiện ghép (Evolver, Orbital, Twin Anvil, Resonance Grid, Mirror Gate, Sanctum, Hatchery Gate) bằng kịch bản ghép thật.

## Bản pixel
Nhánh `claude/demo-hop-tuong` (game `thap/`) không có `docs/pixel/QUY-CHUAN.md` / `DANH-SACH.md` (quy chuẩn pixel thuộc game nhánh chính). Chữ ký Đỏ chỉ dùng lại ảnh PNG có sẵn, không thêm ảnh mới → khi chuyển `thap/` sang pixel chỉ cần bản pixel của 10 ảnh nền đã liệt kê ở trên (vòng mỏng, tia, chấm sáng, sao, vòng gai `fx_song_xung`, vệt `fx_vet_trang`, lá `fx_la`, giọt `fx_giot_nuoc`, than `fx_than`, giấy màu `fx_hoa_giay`, xu `cb_xu`, tuyết `hat_tuyet`) — ghi ở đây làm mục "Bổ sung" cho đợt pixel.

## Cần ảnh (ChatGPT) — không bắt buộc, code đã chạy được bằng ảnh có sẵn
Chung: lưới ô vuông, nền magenta #FF00FF đặc, không chữ, "same style as attached" (đính kèm `fx_song_xung.png` + `fx_vet_trang.png`).
- `raw_dosig_hex`: *"4×1 grid, glowing amber honeycomb hexagon outline sprites (thin bright edge, soft glow), frames: small → full → cracked → fading, game VFX, magenta background, no text"* — thay lục giác ghép từ đoạn tia (Hive Queen).
- `raw_dosig_lotus_petal`: *"4×1 grid, single glowing pink lotus petal, front / tilted / curled / dissolving into sparkles, game VFX, magenta background, no text"* — thay `fx_la` tô hồng (Genesis Core).
- `raw_dosig_crack`: *"4×1 grid, glowing crimson ground crack decals radiating from center, fresh / bright / cooling dark red / faded, top-down, magenta background, no text"* — thay vết nứt ghép đoạn tia (Overlord).
- `raw_dosig_rune`: *"4×1 grid, arcane magic circle with hexagram and rune ticks, violet and cyan glow, top-down, rotation-friendly, magenta background, no text"* — trận đồ Thác Mana.
