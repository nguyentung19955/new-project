# GACHA THU THẬP — SỞ HỮU Ụ + RƯƠNG + MỞ NHÓM THEO CẤP PHI CÔNG (09/11/2026)

> Người dùng chốt 09/11 18:11–18:19: *"Đây là game gacha thu thập thẻ bài, phải thu thập dần dần"* — giống Destiny Child: Defense War.
> Mã: `thap/js/sohuu.js` (bảng `SHC` = nguồn duy nhất của bảng dưới) · rương `thap/js/kinhte.js` · túi trận `thap/js/thebai.js` · cấp phi công `thap/js/tientrinh.js`.
> Số ngày/ụ ở §2, §5 tính bằng `node tools/thap-sim-gacha.js` (đọc thẳng `SHC` + `roster.json`, 1 000 lần chạy). Kiểm: `tools/thap-kt-so-huu.js`.

## 0. Luật

1. **Chỉ dùng được ụ ĐÃ SỞ HỮU** (đã nhận ≥ 1 bản sao). Bộ bài / bộ mẫu / RANDOM / kéo vào bộ đều chỉ nhận ụ đã có. Summon trong trận vẫn chỉ từ bộ bài (không đổi).
2. **Người mới** có sẵn **10 ụ** (8 Trắng + 2 Xanh — §1). Hướng dẫn + Hành trình 7 ngày **tặng thêm ụ cụ thể**.
3. **Mỗi cấp phi công mở 1 NHÓM ụ cụ thể** (3–6 ụ cùng chủ đề, ghép bộ được) vào **bể rơi** của rương / Daily Specials / vòng quay / thưởng.
   **Ụ chưa mở không rơi.** Đỏ cần thêm **kỷ lục ≥ wave 30** (như đã chốt) — Đỏ từ cấp 12.
4. Ụ **đã có** luôn nhận thêm bản sao (để lên cấp thẻ) kể cả khi nhóm của nó chưa mở (người chơi cũ / quà tặng).
5. **Phần thưởng = RƯƠNG** (§3): thưởng trận (Rương Trận), nhiệm vụ, Hành trình, lên cấp, sự kiện, mốc Solo, trùm lần đầu → trả rương rồi MỞ RƯƠNG
   (lật thẻ theo bậc, Đỏ nổi bật, thẻ mới "NEW!"). Giữ nguyên phần **chọn 1 trong 3** đã thiết kế (chỉ đưa ra ụ đã mở).
6. Bậc của ụ rơi ra mà bể bậc đó còn trống (vd. rương Vàng ở cấp 3, chưa mở ụ Vàng nào) → **lùi xuống bậc thấp hơn gần nhất** có ụ đã mở (không mất lượt).
   Bảo hiểm Vàng chỉ đếm khi đã có ụ Vàng trong bể; bảo hiểm Đỏ chỉ đếm khi đã có ụ Đỏ trong bể.

## 1. Khởi đầu (cấp 1) + quà ụ cụ thể

| Ụ | Bậc | Vai |
|---|---|---|
| Sniper (Bắn Tỉa) | Trắng | bắn tỉa — săn quái máu cao |
| Gatling (Liên Thanh) | Trắng | bắn thường, rất nhanh |
| Revolver (Súng Lục) | Trắng | bắn thường, phát nặng |
| Frost (Băng) | Trắng | làm chậm / đóng băng con đầu |
| Tesla | Trắng | sét lan |
| Mana Core (Máy Mana) | Trắng | sinh mana |
| Venom (Độc) | Trắng | đánh dấu: quái nhận thêm sát thương |
| Armor Breaker (Phá Giáp) | Trắng | hỗ trợ: phá giáp cho ụ kề |
| Amplifier (Bộ Khuếch Đại) | Xanh | hỗ trợ: tăng sát thương ụ kề |
| Laser | Xanh | tia tăng dần ×4 |

Bộ hướng dẫn (Sniper, Gatling, Frost, Tesla, Revolver) nằm trọn trong 10 ụ này.

| Quà ụ cụ thể (1 lần) | Ụ | Bậc | Nhóm gốc |
|---|---|---|---|
| Xong / bỏ qua hướng dẫn | Ice Blade (Kiếm Băng) | Xanh | cấp 2 |
| Hành trình ngày 1 | Berserker (Súng Cuồng Nộ) | Tím | cấp 3 |
| Hành trình ngày 4 | Storm Gun (Súng Bão) | Tím | cấp 4 |
| Hành trình ngày 6 | Overclock (Bộ Ép Xung) | Tím | cấp 6 |
| Cấp 6 (có sẵn) | chọn 1 trong 3 thẻ Vàng (= đúng 3 Vàng của nhóm cấp 6) | Vàng | cấp 6 |
| Hành trình ngày 7 (có sẵn) | chọn 1 trong 3 thẻ Vàng đã mở × 2 bản | Vàng | — |

## 2. Bảng mở nhóm theo cấp (96 ụ chơi được: Trắng 14 · Xanh 17 · Tím 22 · Vàng 33 · Đỏ 10)

Ngày mở = ngày (kể từ lần đầu chơi) mà người chơi trung bình đạt cấp đó. XP mỗi trận = wave + 3 × trùm + 10 nếu thắng (không đổi).
THƯỜNG = 5 trận/ngày (wave 14 → 30 trong tuần đầu); NHẸ = 1–2 trận/ngày (wave 14 → 23 tuần đầu).

| Cấp | Chủ đề nhóm | Ụ mở (Tr Trắng · X Xanh · Tm Tím · V Vàng · Đ Đỏ) | THƯỜNG ngày | NHẸ ngày |
|---|---|---|---|---|
| 1 | Starter Arsenal | (10 ụ khởi đầu §1 — đã sở hữu) | 1 | 1 |
| 2 | Spread & Traps | Scatter (Súng Phun Loạn, Tr) · Time Bomb (Bom Hẹn Giờ, Tr) · Ice Blade (Kiếm Băng, X) · Toxic Pool (Bom Vũng Độc, X) | 1 | 2 |
| 3 | Critical Strike | Dice Gun (Pháo May Rủi, Tr) · Hammer (Búa Đẩy, Tr) · Iron Fist (Nắm Đấm Sắt, Tr) · Crit Antenna (Ăng-ten Chí Mạng, X) · Berserker (Súng Cuồng Nộ, Tm) | 1 | 3 |
| 4 | Heavy Fire | Guillotine (Máy Chém, Tr) · Mortar (Súng Cối, X) · Radar (X) · Fifth Shot (Nỏ Năm Nhịp, Tm) · Storm Gun (Súng Bão, Tm) | 2 | 5 |
| 5 | Frost & Mana | Chiller (Máy Phát Lạnh, X) · Mana Doubler (Máy Nhân Mana, X) · Mana Leech (Máy Hút Mana, X) · Blizzard (Bão Tuyết, Tm) · Bounty Beacon (Đèn Săn Thưởng, Tm) | 3 | 7 |
| 6 | First Legends | Mine Layer (Bệ Rải Mìn, X) · Chain Link (Chuỗi Liên Kết, Tm) · Overclock (Bộ Ép Xung, Tm) · **Salvo Battery (Pháo Loạt Salvo, V) · Werewolf (Sói Máy, V) · Purifier (Pháo Thanh Tẩy, V)** | 3 | 9 |
| 7 | Merge Bonus | Drone Bay (Drone Kéo Xa, X) · Cooldown Horn (Loa Hồi Chiêu, X) · Cloner (Máy Nhân Bản, Tm) · Lighthouse (Tháp Ánh Sáng, Tm) | 4 | 12 |
| 8 | One Big Shot | Energy Cannon (Pháo Năng Lượng, X) · Lone Ace (Độc Tôn, Tm) · Focus Lens (Thấu Kính, Tm) · Nemesis (Nữ Thần Phán Xử, V) | 5 | 15 |
| 9 | Guardians | Shield Gen (Máy Khiên, Tm) · Cleanser (Máy Tẩy Lỗi, Tm) · Signal Jammer (Máy Nhiễu Sóng, Tm) · Sanctum (Thánh Địa, V) | 6 | 17 |
| 10 | Teamwork | Reaper Pillar (Cột Tử Thần, Tm) · Ricochet (Đĩa Nảy, Tm) · Sync Cannon (Pháo Đồng Bộ, V) · Hydra (V) | 7 | 20 |
| 11 | Tricksters | Mimic (X) · Fusion Mixer (Bộ Trộn, X) · Teleporter (Bệ Dịch Chuyển, X) · Scrambler (Máy Xáo Trộn, Tm) | 8 | 23 |
| 12 | Eternal Frost | Jammer (Kẹp Phá, Tm) · Eclipse (Nhật Thực, V) · **Cryo Reactor (Lò Phản Ứng Băng, Đ)** | 9 | 27 |
| 13 | Starlight | Star Lift (Bệ Nâng Sao, Tm) · Star Cannon (Pháo Ngôi Sao, V) · Star Breaker (Súng Hạ Sao, V) | 10 | 30 |
| 14 | Firestorm | Nine-Tail (Cửu Vĩ, V) · Prism Thief (Siêu Trộm Lăng Kính, V) · **Overlord (Đ)** | 11 | 34 |
| 15 | Path Control | Chrono Lock (Khoá Thời Gian, Tm) · Wall Projector (Máy Dựng Tường, V) · Marionette (Rối Máy, V) · **Black Hole (Hố Đen, Đ)** | 12 | 38 |
| 16 | Swarm | Combo Core (Lõi Combo, Tm) · Twin Maker (Máy Sinh Đôi, V) · **Hive Queen (Chúa Tổ, Đ)** | 13 | 42 |
| 17 | Merge Workshop | Fusion Archive (Kho Lưu Hợp Nhất, V) · Hatchery Gate (Cổng Ấp Nở, V) · Merge King (Vua Ghép, V) | 15 | 47 |
| 18 | Star Forge | Twin Anvil (Đe Song Sinh, V) · Quantum Choir (Hợp Xướng Lượng Tử, V) · **Genesis Core (Lõi Khởi Sinh, Đ)** | 16 | 51 |
| 19 | Resonance | Rainbow (Máy Cầu Vồng, V) · Hero Foundry (Xưởng Anh Hùng, V) · Resonance Grid (Lưới Cộng Hưởng, V) · **Arcane Cascade (Thác Mana, Đ)** | 17 | 57 |
| 20 | Big Guns | Compass Cannon (Pháo La Bàn, V) · Orbital (Vệ Tinh, V) · **Leviathan (Thuỷ Quái, Đ)** | 19 | > 60 |
| 21 | Shapeshifters | Mystery Box (Hộp Bí Ẩn, Tm) · Evolver (Trứng Tiến Hoá, V) · Copycat (Máy Sao Chép, V) | 20 | > 60 |
| 22 | Dark Wards | Mirror Gate (Cổng Gương, V) · Hex Saboteur (Kẻ Nguyền, V) · **Chrono Throne (Ngai Thời Gian, Đ)** | 22 | > 60 |
| 23 | Dragonfire | Ember Relay (Lửa Thập Tự, V) · Blood Circuit (Mạch Máu, V) · **Wyrm Engine (Rồng Máy, Đ)** | 24 | > 60 |
| 24 | Wild Cards | Wild Link (Khớp Nối Vạn Năng, V) · Pandora Vault (Hộp Pandora, V) · **Lucky Slot (Máy Xèng, Đ)** | 25 | > 60 |

Tổng theo bậc: cấp 1–5 mở toàn bộ Trắng; Xanh hết ở cấp 11; Tím hết ở cấp 21; Vàng rải cấp 6–24; Đỏ cấp 12, 14, 15, 16, 18, 19, 20, 22, 23, 24 (1 Đỏ/nhóm, luôn đi cùng ụ cùng họ hoặc cùng lối chơi).

**Cách chia** (để mỗi cấp là một "gói" ghép bộ được):
- Cấp 2–5: ụ dễ hiểu, 1 cơ chế (bắn lan, chí mạng, nổ, băng/mana). Cấp 6 = "Huyền thoại đầu tiên": 3 Vàng đơn giản (Salvo, Werewolf, Purifier) — đúng 3 thẻ của quà "chọn 1 trong 3" cấp 6.
- Cấp 7–11: hỗ trợ / ghép thưởng / hộ vệ / phối hợp; **kẻ pha trò** (Mimic, Teleporter, Scrambler — đổi chỗ / xáo bàn, dễ làm người mới rối) để cấp 11.
- Cấp 12–24: mỗi cấp 1 chủ đề + (thường) 1 Đỏ cùng họ: Băng (Eclipse + Cryo Reactor), Bẫy đường (Wall Projector + Marionette + Black Hole), Bầy đàn (Twin Maker + Hive Queen), Lò sao (Twin Anvil + Quantum Choir + Genesis Core), Cộng hưởng (Rainbow + Hero Foundry + Resonance Grid + Arcane Cascade)…
  Cơ chế phức tạp nhất mở muộn: Compass Cannon / Orbital (20), Evolver / Copycat / Mystery Box (21), Wild Link / Pandora / Lucky Slot (24).

## 3. Loại rương

Tỉ lệ = % MỖI thẻ; bản sao mỗi thẻ: Trắng 4–8 · Xanh 2–4 · Tím 1–2 · Vàng/Đỏ 1. Chỉ ra ụ trong bể rơi (đã mở hoặc đã có).

| Rương | Lấy ở đâu | Thẻ | Trắng | Xanh | Tím | Vàng | Đỏ | Bảo đảm / bảo hiểm |
|---|---|---|---|---|---|---|---|---|
| **Rương Trận** (BATTLE CHEST) | cuối mỗi trận | 1 + ⌊w/4⌋ … tối đa 14 | 58 | 29 | 11 | 1,8 | 0,2 | 50% thẻ trong bộ (Đỏ 30%) — như túi thưởng cũ |
| Rương Thường (NORMAL) | cửa hàng 2 000 vàng · điểm danh · Hành trình · sự kiện · danh vọng | 6 | 62 | 29 | 8,5 | 0,5 | 0 | — |
| Rương Vàng (GOLD) | cửa hàng 500 ngọc · lên cấp 5/10/… · điểm danh ngày 7 · Hành trình · sự kiện | 8 | 44 | 36 | 16 | 3,8 | 0,2 | ≥ 1 Tím+ · Vàng ≤ 10 rương · Đỏ ≤ 120 rương |
| Rương Thần thoại (MYTHIC) | cửa hàng 6 000 ngọc (mở khi đủ điều kiện Đỏ) | 12 | 30 | 38 | 24 | 7 | 1 | 1 Đỏ + 2 Vàng |
| **Rương Sự kiện** (EVENT, mới) | thang sự kiện tuần (mốc 100 / 400 / 1 000 ×2) | 1 + 3 | 35 | 40 | 25 | — | — | 1 (2) bản **ụ Vàng nổi bật của tuần** |
| **Rương Huyền thoại** (LEGENDARY, mới) | mốc Solo w20/30/40…, trùm lần đầu, "Reach wave 30", nhiệm vụ tuần, sự kiện mốc 1 700, vòng quay jackpot | n + 2 | 40 | 40 | 20 | — | — | **n bản Vàng** (n = số bản Vàng của phần thưởng cũ) |
| **Rương Cổ đại** (ANCIENT, mới) | mốc Solo w50/60/70, hạ đủ 12 trùm, sự kiện mốc 3 600, lò rèn Đỏ | n + 2 | — | 40 | 60 | — | — | **n bản Đỏ** |

- Rương Sự kiện / Huyền thoại / Cổ đại **không bán** — chỉ là "vỏ" của phần thưởng cũ: lượng Vàng / Đỏ giữ đúng như trước (KINH-TE §8), thêm 2–3 thẻ Trắng/Xanh/Tím để mở rương có cảm giác.
- Ụ nổi bật của tuần: chọn tất định theo tuần trong các Vàng **đã mở** của người chơi (cùng cấp → cùng ụ).
- Không còn phần thưởng "thẻ ngẫu nhiên lẻ" ngoài: Daily Specials (thẻ cụ thể, trong bể), vòng quay (bản Trắng/Xanh/Tím ngẫu nhiên trong bể), chọn 1 trong 3, Ấn Vàng (chọn ụ đã mở).

## 4. Nguồn thưởng → rương (trước → sau)

| Nguồn | Trước | Sau |
|---|---|---|
| Túi thưởng cuối trận | danh sách bản sao | **Rương Trận** (cùng nội dung, mở bằng lật thẻ, "NEW!") |
| Hành trình ngày 1 | 10 bản Xanh ngẫu nhiên | Rương Thường + **Berserker** |
| Hành trình ngày 4 / 6 | vàng + ngọc | giữ + **Storm Gun** / **Overclock** |
| Nhiệm vụ "Reach wave 30" | 1 bản Vàng | Rương Huyền thoại (1 Vàng) |
| Nhiệm vụ tuần đủ 5 | 40 ngọc + 1 bản Vàng | 40 ngọc + Rương Huyền thoại (1 Vàng) |
| Sự kiện mốc 100 / 400 / 1 000 | 1 / 1 / 2 bản Vàng nổi bật | Rương Sự kiện (1 / 1 / 2 Vàng nổi bật) |
| Sự kiện mốc 1 700 | 3 000 vàng + 1 bản Vàng | 3 000 vàng + Rương Huyền thoại |
| Sự kiện mốc 3 600 | 1 bản Đỏ | Rương Cổ đại (1 Đỏ) |
| Mốc Solo w20…70 | 1/2/3/3/4/5 Vàng + w50/60/70 1/1/2 Đỏ | Rương Huyền thoại (n Vàng) + Rương Cổ đại (n Đỏ) |
| Trùm lần đầu / đủ 12 trùm | 1 Vàng / 1 Đỏ | Rương Huyền thoại / Rương Cổ đại |
| Lò rèn Sử thi → Vàng / Vàng → Đỏ | 1 bản ngẫu nhiên | 1 bản ngẫu nhiên **trong bể** |
| Ấn Vàng | chọn bất kỳ Vàng | chọn Vàng **đã mở / đã có** |
| Vòng quay, Daily Specials, quà miễn phí | thẻ ngẫu nhiên mọi ụ | thẻ **trong bể** |
| Lên cấp | vàng + ngọc (+ Rương Vàng mỗi 5 cấp) | giữ + bảng lên cấp hiện **nhóm ụ vừa mở** (hình + tên) |

## 5. Kinh tế: sở hữu theo ngày (mô phỏng 1 000 lần, `tools/thap-sim-gacha.js`)

THƯỜNG (5 trận/ngày):

| Ngày | Cấp | Sở hữu Trắng / Xanh / Tím / Vàng / Đỏ (tổng) | Đã mở (bể rơi) | Bản Vàng · Đỏ đã nhận | Có ≥ 1 Đỏ |
|---|---|---|---|---|---|
| 1 | 2,5 | 9,9 / 4,2 / 1 / 0 / 0 (15) | 17 | 0 · 0 | 0% |
| 3 | 5,8 | 13,8 / 9,1 / 5,1 / 1,2 / 0 (29) | 34 | 1,4 · 0 | 0% |
| 7 | 10,1 | 14 / 13,8 / 12,2 / 4,9 / 0 (45) | 51 | 16,9 · 0 | 0% |
| 14 | 16,6 | 14 / 17 / 18,6 / 8 / 0,5 (58) | 73 | 27,4 · 0,53 | 43% |
| 30 | 26 | 14 / 17 / 21,9 / 17 / 1,6 (71) | 96 | 51,9 · 1,77 | 87% |

NHẸ (1–2 trận/ngày):

| Ngày | Cấp | Sở hữu Trắng / Xanh / Tím / Vàng / Đỏ (tổng) | Đã mở | Bản Vàng · Đỏ | Có ≥ 1 Đỏ |
|---|---|---|---|---|---|
| 1 | 1,4 | 8,2 / 3,2 / 0 / 0 / 0 (11) | 12 | 0 · 0 | 0% |
| 3 | 3 | 10,9 / 4,5 / 1 / 0 / 0 (16) | 19 | 0 · 0 | 0% |
| 7 | 5 | 13,7 / 8,2 / 4,2 / 0 / 0 (26) | 29 | 0 · 0 | 0% |
| 14 | 7,7 | 14 / 12 / 7,7 / 3,1 / 0 (37) | 42 | 9,4 · 0 | 0% |
| 30 | 12,8 | 14 / 16,4 / 15 / 6,2 / 0,1 (52) | 61 | 26,5 · 0,13 | 12% |

- **Đủ xếp bộ ngay ngày 1**: 10 ụ khởi đầu đủ 3 vai (tấn công / hỗ trợ / khống chế + mana). Ngày 3 (THƯỜNG) đã có ~5 Tím + 1 Vàng → bộ "2 Tím + 1 Vàng" được.
- **Đỏ hiếm hơn Vàng rõ rệt**: ngày 14 THƯỜNG có ~27 bản Vàng nhưng ~0,5 bản Đỏ (≈ 1/50); 43% người chơi có 1 Đỏ ở ngày 14, 87% ở ngày 30. NHẸ: ngày 30 chỉ 12% có Đỏ.
- Bộ sưu tập đầy (96/96 đã mở) ở ~ngày 25 (THƯỜNG); **sở hữu** đủ cả 33 Vàng + 10 Đỏ còn mất nhiều tháng → mục tiêu dài hạn.

## 6. Người chơi cũ (không mất gì)

Lần đầu chạy bản này (`turret_kt.sh` chưa có): đánh dấu **SỞ HỮU** cho
1. 10 ụ khởi đầu; 2. mọi ụ đã có mục trong `turret_the.c` (từng nhận bản sao / đã lên cấp thẻ); 3. mọi ụ trong bộ bài đang chọn + 6 bộ mẫu đã lưu; 4. mọi ụ `cp.giu` (giữ từ đợt tiến trình 1).
Cấp phi công giữ nguyên (đã quy đổi theo kỷ lục ở đợt 1: ≥ 30 → 12 · ≥ 20 → 8 · ≥ 10 → 5 · có bản lưu → 3) → các nhóm ≤ cấp đó mở ngay, **không báo lại** (không có bảng "mở 50 ụ" ập tới).
Gộp hồ sơ Firebase: sở hữu / đã báo / quà đã nhận = OR (đổi máy không mất ụ).

## 7. Cần người dùng xem

1. Bảng nhóm §2 (thứ tự, chủ đề, Đỏ nào đi cấp nào).
2. 10 ụ khởi đầu §1 + 4 ụ quà (Ice Blade · Berserker · Storm Gun · Overclock).
3. 3 rương "vỏ" mới (Sự kiện / Huyền thoại / Cổ đại) — giữ nguyên lượng Vàng/Đỏ cũ, chỉ thêm 2–3 thẻ thấp.
4. Bộ mẫu (STARTER DECKS) có ụ chưa có → ẩn như đợt 1 (chưa thêm "bộ mẫu mở khoá").
