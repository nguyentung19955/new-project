# Báo cáo B — Chỉ số đồ, ép đồ, kinh tế, bộ trang phục (15/10)

Làm theo `YEU-CAU-B.md` và `CHUNG.md`. **Chỉ đo và đề xuất, không sửa số nào trong `game/js`.** Mọi số "thử đề xuất" chỉ đổi trong bộ nhớ của tiến trình đo. Đo bằng bot Node (`game/tests/node_trang.js`, chạy như `?cloud=0`), không mở trình duyệt. Không đụng đăng nhập Google, lưu mây hay `firebase-config.js`.

## Tóm tắt

**Ổn:**
- **Kinh tế trong chiến dịch cân.** Lúc qua 3-5, bot còn khoảng 2.000 vàng, 500–630 linh khí, 135 quặng, 25–30 đá.
- **Đá nâng bậc là thứ giới hạn ép**, đúng ý đồ. Bot (8 lượt mỗi ngày) lên Tím ở 2-1 / 2-2 (ngày ~1,6) và lên Vàng quanh 3-3 tới ngay sau 3-5 (ngày ~5).
- **Sức mạnh tính bậc ép khớp sát thương thật** (lệch ±5%).
- **Quặng không bao giờ bị tắc.**

**Chỗ lệch** (nặng nhất trước):

1. **Lỗi mất bậc ép** (lỗi code, không phải số). Sau khi bấm **"Xoá hết"** và chơi lại, lần mở game kế tiếp vũ khí bị **mất bậc ép và các dòng hiệu ứng**. Đá và vàng đã tiêu cũng mất. Các công cụ bot `cay.py --kd`, `balance.py`, `do_trum.py` cũng mất bậc ép khi nạp `cay_luu.json`.
   - **Đề xuất:** trong `js/vk_moi.js`, `VM.canLai` giữ trường `ep: w.ep` khi dựng lại vũ khí. Thêm `canLai` vào bản mới của `G.resetSave`.
   - Tự tin: **cao** (đã tái hiện bằng đúng đường nạp `G.persist` → `G.loadSave`).
2. **Dòng "Hút máu" quá mạnh.**
   - Ở mức Rực lửa: thắng Ngư Tinh (vào trận với 40% máu) **15% → 42%**, máu còn sau khi hạ Hồ Tinh **44% → 80%**. Các dòng khác chỉ +0…+10 điểm.
   - **Đề xuất:** `G.EP_DO.dong` hutMau `goc` **0,012 → 0,006** và `G.EP_DO.hutToiDa` **0,02 → 0,01**. Đo lại với số mới: thắng 21%, máu còn 59%, ngang Chí mạng / Tốc đánh mà vẫn là dòng thủ tốt nhất.
   - Tự tin: **vừa–cao**.
3. **Sau 3-5 hết chỗ tiêu.**
   - Khoảng 3 ngày sau 3-5 thì mài +15, lò cấp 4 và cả 4 bộ đều đã tối đa. Kiếm lên Rực lửa ở ngày ~9 (4–5 ngày sau 3-5).
   - Sau đó mỗi ngày dư 5–7 nghìn vàng. Sau 3 tuần còn **~120 nghìn vàng, 21 nghìn linh khí, 2.800 quặng, 900 đá** không dùng tới.
   - **Đề xuất, nếu muốn ép kéo dài ~1,5–2 tuần sau 3-5:**
     - Đá đánh lại trùm (`G.EP_DO.roi`): `vung` **[3,4,5] → [2,2,2]**, `mini` **[1,1,2] → [1,1,1]**.
     - Bùa giữ bậc từ trùm vùng (`bua.trumVung`) **0,1 → 0,04**.
     - Giá Đỏ (`gia[5]`) **25 đá + 800 vàng + 1 mảnh → 30 + 1.500 + 2**.
     - Giá Rực lửa (`gia[6]`) **40 + 1.200 + 2 → 60 + 3.000 + 3**.
     - Kết quả đo: kiếm Rực lửa ở ngày ~14 (9 ngày sau 3-5). Chiến dịch gần như không đổi, vì đá rơi lần đầu giữ nguyên.
   - Vàng vẫn dư: cần một chỗ tiêu mới. Đây là quyết định thiết kế.
   - Tự tin: **vừa**.
4. **Bộ Rừng yếu nhất.**
   - Thắng cả ải (bộ cấp 3), 150 lượt mỗi ô:

     | | Rừng | Ninja | Biển | Lâu đài |
     |---|---|---|---|---|
     | 2-3 | 83% | 91% | 98% | 87% |
     | 3-3 | 79% | 91% | 86% | 86% |

   - Nâng Rừng từ cấp 2 lên 3 tốn 5.500 vàng quy đổi mà chỉ được +6 Sức mạnh.
   - **Đề xuất:** `G.SKILL_BO.rung[0]` Nhựa rừng `dung` **1 → 0,3** giây, `hoi` **0,01 → 0,03**; `rung[1]` Gai độc `satThuong` **0,5 → 1,0**. Đo lại: 90% / 85%, ngang các bộ khác.
   - Tự tin: **thấp–vừa** (nhiễu ±7 điểm; bot ít đứng yên hơn người chơi).
5. **Ải Đá Mài cho thứ không thiếu.**
   - Bà Hàng Xén bán quặng (đang chờ quyết): bot gần như không bao giờ cần mua. Kể cả khi thử giá 25 vàng và 25 quặng mỗi ngày, cả chiến dịch bot mua đúng 1 quặng.
   - Thứ làm tắc việc mài ở vùng 2–3 là **nguyên liệu vùng và vàng**, không phải quặng.
   - **Đề xuất:**
     - Giữ Bà Hàng Xén 40 vàng / 15 quặng mỗi ngày (vô hại), hoặc bỏ.
     - Đổi thưởng Ải Đá Mài `G.AI_NGAY.ai.mai.thuong` **14/18/22 quặng → 8/10/12 quặng + 4/6/8 nguyên liệu** của vùng đó.
   - Tự tin: **vừa** (chưa chạy bot với thưởng mới).
6. **Bộ Biển cấp 1 trội hẳn về Sức mạnh trên mỗi đồng.**
   - Được 20–24 Sức mạnh cho mỗi 1.000 vàng quy đổi, gấp 2–3 lần mọi việc nâng cấp khác, vì Khiên nước được quy thành máu ×1,20.
   - Nhưng khi đánh thật, Biển 3 ≈ Ninja 3 ≈ Lâu đài 3 (bảng ở mục 4).
   - **Đề xuất:** trong `js/bo_skill.js`, phần quy đổi Khiên nước dùng hệ số **3 → 2** (×1,13).
   - Tự tin: **thấp**.
7. **Hai dòng ép không có tác dụng đo được:** "Linh khí nhận" (linh khí đã dư sẵn) và "Giảm hồi chiêu đặc biệt".
   - **Đề xuất:** thay "Linh khí nhận" bằng dòng khác; "Giảm hồi chiêu" `goc` **0,06 → 0,12**.
   - Tự tin: **thấp** (bot dùng đòn Đặc biệt đơn giản).
8. **Chữ trong bảng ép hứa cao hơn thật.**
   - Bảng ép ghi "Sức mạnh vũ khí ×1,75". Đánh thật, kiếm Rực lửa chỉ mạnh ×1,55–1,66, vì phần tốc đánh (+15%) chỉ ăn khoảng 60%.
   - **Đề xuất:** không phải đổi số; con số Sức mạnh (`G.power`) đã đúng. Nếu muốn kiếm nhận đủ: `G.EP_DO.phu.sword.giaTri` **0,025 → 0,015**.
   - Tự tin: **vừa**.

**Đồ "mũ, áo, giày, phụ kiện" không còn trong game.** Đợt 1–2 đã bỏ `G.GEAR` và `G.SETS`. Đồ hiện nay chỉ có 4 vũ khí cố định (trục cấp hệ, mài, bậc ép) và 4 bộ trang phục (3 cấp). Sức mạnh quy mọi vũ khí về thang của kiếm, nên **không loại nào trội tuyệt đối về Sức mạnh**. Phần sát thương thật của từng loại là việc của phiên C.

Ảnh tóm tắt: `xem-B.png`. Số thô: `so-lieu-B.json`. Công cụ đo: `do_b.py` (cùng thư mục).

---

## 0. Cách đo và lệnh chạy lại

Mọi lệnh chạy trong thư mục `docs/review/ke-hoach-cai-thien/kiem-can-bang/`. Mỗi lệnh gộp kết quả vào `so-lieu-B.json`.

| Lệnh | Đo gì | Thời gian |
|---|---|---|
| `python3 do_b.py bang` | Bảng hệ số bậc ép / mài, Sức mạnh tăng khi nâng từng thứ và Sức mạnh / 1.000 vàng quy đổi, trên hồ sơ bot thật ở 1-5, 2-5, 3-5 | < 1 phút |
| `python3 do_b.py ep 20000` | Monte Carlo ép bằng đúng hàm `G.epDo.ep` | vài giây |
| `python3 do_b.py dong 150 ai=9,14 mau=0.4` | Mỗi dòng ở giá trị Rực lửa (q = 1) trên kiếm + phi tiêu, vào thẳng phòng trùm với 40% máu | ~1 phút |
| `python3 do_b.py bo 150 ai=7,12 ca` | Mỗi bộ ở cấp 3 so với Ninja cấp 0, chơi **cả ải** | ~6 phút |
| `python3 do_b.py bo 120 ai=4,9,14 mau=0.4` | Như trên nhưng chỉ đánh trùm | – |
| `python3 do_b.py dpsep 40 6 8` | Sát thương mỗi giây thật của 4 vũ khí ở Bậc Trắng / Tím / Rực lửa | – |
| `python3 do_b.py kinhte 4 21 [mua] [ngay=4] [bq=25,25] [nhan=… "js=…"]` | 4 lượt chiến dịch 15 ải (bot `cd_lib`, kiểu `khuyen`), rồi 21 ngày chơi tiếp sau 3-5 | ~5 phút cho 4 lượt |
| `python3 do_b.py ve` | Vẽ `xem-B.png` | – |

Chi tiết lệnh `kinhte`:
- Thu nhập từng lượt và chi tiêu theo việc được ghi bằng cách bọc hàm trong bộ nhớ: `U.doIt`, `VM.nangBo`, `E.ep`, `U.doi`, `U.bqMua`.
- Tắc nghẽn: mỗi lần về làng ghi lại "việc đáng nhất chưa làm được đang thiếu gì".
- Sau 3-5, mỗi ngày bot chơi K lượt ải thường rồi mọi ải ngày. Nếu lần ép kế tiếp thiếu mảnh trùm thì bot đánh lại đúng trùm vùng đó.

Ghi chú:
- **Bản lưu `tests/cay_luu.json` không có cờ `canLai`.** Nạp bằng `G.fixSave` sẽ mất bậc ép (mục 7). `do_b.py` đặt cờ này trước khi nạp.
- **Một ngày giả = 8 lượt ải thường** (bằng `cd_lib.NGAY`, khoảng 35–40 phút chơi). Có đo thêm kiểu 4 lượt mỗi ngày.
- **Phiên `cua-tuong-kho` vừa sửa Cua Đá** (trùm 2-1…2-4) trong lúc tôi đo. Các số 2-3 ở mục 4 chạy trên Cua Đá cũ. Phần so giữa các bộ vẫn đúng, còn số thắng tuyệt đối có thể đổi. `do_b.py` đã chạy thử lại trên bản mới nhất.

## 1. Chỉ số đồ theo bậc ép, cấp mài, cấp hệ

### 1.1 Hệ số của một vũ khí

"Tổng" là con số `G.EP_DO.tong`. Các cột theo loại vũ khí là phần **sát thương** mà Sức mạnh tính. Phần phụ (kiếm tốc đánh, thương tầm, búa choáng, phi tiêu xuyên) không vào Sức mạnh.

| Bậc | Tổng | Kiếm | Thương | Búa | Phi tiêu | Giá 1 lần ép | Tỉ lệ |
|---|---|---|---|---|---|---|---|
| Trắng | ×1,00 | ×1,000 | ×1,000 | ×1,000 | ×1,000 | – | – |
| Xanh lam | ×1,08 | ×1,054 | ×1,064 | ×1,067 | ×1,064 | 3 đá + 100 vàng | 100% |
| Xanh lục | ×1,17 | ×1,114 | ×1,136 | ×1,143 | ×1,136 | 6 + 200 | 90% |
| Tím | ×1,28 | ×1,191 | ×1,225 | ×1,236 | ×1,225 | 10 + 350 | 75% |
| Vàng | ×1,40 | ×1,273 | ×1,321 | ×1,336 | ×1,321 | 16 + 550 | 60% |
| Đỏ | ×1,55 | ×1,378 | ×1,442 | ×1,462 | ×1,442 | 25 + 800 + 1 mảnh Ngư | 45% |
| Rực lửa | ×1,75 | ×1,522 | ×1,606 | ×1,632 | ×1,606 | 40 + 1.200 + 2 mảnh Hồ | 30% |

**Mài** (×(1 + 0,08 × cấp)): +5 là ×1,40, +10 là ×1,80, +15 là ×2,20. Giá cộng dồn tới +15 là 6.000 vàng, 184 quặng và nguyên liệu 3 gỗ linh / 13 vảy cá / 30 đá lửa (mỗi vũ khí).

**Cấp hệ:** Trắng ×1 · Mầm ×1,15 · Thành hình ×1,35 · Thức tỉnh ×1,6 (100 / 300 / 800 linh khí).

### 1.2 Sát thương thật theo bậc ép (`dpsep`, Zed cấp 20, Thành hình Độc, mài +6, 8 hạt giống)

| Vũ khí | 1 quái máu dày: Rực lửa ÷ Trắng | 5 quái máu ×20 | Sức mạnh tính | Rực lửa không phần phụ (sát thương ×1,75 thẳng) |
|---|---|---|---|---|
| Kiếm | ×1,66 | ×1,55 | ×1,52 | ×1,74 / ×1,75 |
| Thương | ×1,61 | ×1,64 | ×1,61 | ×1,75 / ×1,66 |
| Búa | ×2,08 | ×1,48 | ×1,63 | ×2,03 / ×1,57 |
| Phi tiêu | ×1,60 | ×1,88 | ×1,61 | ×1,74 / ×1,87 |

- Phần phụ đáng ít hơn mức được tính.
  - Kiếm: tốc đánh +15% chỉ cho khoảng +9%.
  - Phi tiêu: xuyên vô dụng khi đánh 1 quái, đáng trọn khi đánh cả cụm.
  - Búa: choáng gần như không đổi gì.
- Vì vậy Sức mạnh (`G.power`), vốn chỉ tính phần sát thương, **lại khớp thực tế**. Chỉ dòng chữ "Sức mạnh vũ khí ×1,75" trong bảng ép là hứa cao.
- Với quái máu mỏng (×2,5), số đo bị kẹt ở tốc độ quái mọc ra. Bậc ép chỉ cho ×1,25–1,46 nên không dùng số đó để so.

### 1.3 Sức mạnh tăng khi nâng từng thứ (hồ sơ bot thật, lệnh `bang`)

**Cách quy ra vàng:** 1 linh khí = 4 vàng, quặng = 12, nguyên liệu = 20, mảnh = 150 (theo `G.upg.VAL`); **1 đá = 140 vàng** (Ải Đá Bậc Khó 8 đá ≈ Ải Vàng Khó 1.100 vàng). Giá ép là giá kỳ vọng của **một** bậc (giá một lần chia tỉ lệ).

| Hồ sơ | Việc đáng nhất (Sức mạnh / 1.000 vàng) | Việc kém nhất |
|---|---|---|
| Tới 1-5: cấp 8, SM 183, kiếm Mầm +6 Xanh lục | bộ Biển 0→1: 22,0 · bộ Lâu đài 0→1: 12,2 · kiếm Thành hình: 10,8 · mài kiếm +7: 6,9 | ép phi tiêu Xanh lục: 1,7 · ép kiếm Tím: 2,1 |
| Tới 2-5: cấp 20, SM 318, kiếm Thành hình +9 Tím | bộ Biển 0→1: 24,4 · bộ Lâu đài 0→1: 8,5 · mài kiếm +10: 7,6 · kiếm Thức tỉnh: 6,9 | bộ Rừng 2→3: **1,1** · ép kiếm Vàng: 1,7 · đổi sang Ninja 1: **−6,1** |
| Tới 3-5: cấp 30, SM 514, kiếm Thức tỉnh +12 Vàng | mài kiếm +13: 8,5 · bộ Biển 2→3: 7,5 | ép phi tiêu Vàng: 1,1 · ép kiếm Đỏ: 1,6 · bộ Ninja 1→2: 2,2 |

- **Trội tuyệt đối:** bộ Biển cấp 1 (80 linh khí + 500 vàng cho +18…+46 Sức mạnh). Biển cấp 3 có quy đổi ×1,134 trong Sức mạnh, cao nhất 4 bộ (Lâu đài ×1,097, Ninja ×1,088, Rừng ×1,049).
- **Gần vô dụng:** bộ Rừng cấp 2→3 (1,1 Sức mạnh / 1.000 vàng). Đổi từ bộ đang cao cấp sang Ninja cấp 1 còn làm Sức mạnh giảm.
- **Ép đắt nhất tính theo Sức mạnh** (1–2 / 1.000 vàng) nếu quy đá ra vàng. Nhưng đá là tiền riêng, chỉ dùng để ép, nên ép không giành vàng với mài.

Lưới Sức mạnh cả người ở hồ sơ 3-5, theo bậc ép kiếm (hàng) và mài kiếm (cột):

| | +0 | +3 | +6 | +10 | +12 | +15 |
|---|---|---|---|---|---|---|
| Trắng | 460 | 467 | 474 | 483 | 488 | 494 |
| Tím | 466 | 474 | 482 | 493 | 501 | 523 |
| Vàng | 468 | 477 | 486 | 497 | 514 | 537 |
| Đỏ | 471 | 481 | 490 | 512 | 530 | 554 |
| Rực lửa | 475 | 486 | 496 | 532 | 551 | 577 |

Ở mài thấp, bậc ép kiếm gần như không làm Sức mạnh tăng: kiếm khi đó yếu hơn phi tiêu nên chỉ được tính 25%. Từ +10 trở lên, Rực lửa đáng khoảng +10% Sức mạnh cả người so với Trắng.

## 2. Ép đồ

### 2.1 Giá kỳ vọng để ép một vũ khí từ Bậc Trắng (`ep 20000`, đúng luật may mắn và tụt bậc)

| Lên | Đá TB (trung vị / 90% người) | Vàng | Mảnh Ngư / Hồ | Lần ép | Lần tụt | Luôn dùng bùa: đá / vàng / bùa tốn |
|---|---|---|---|---|---|---|
| Xanh lam | 3 (3 / 3) | 100 | – | 1,0 | 0 | 3 / 100 / 0 |
| Xanh lục | 10 (9 / 15) | 321 | – | 2,1 | 0 | 10 / 320 / 0 |
| Tím | 23 (19 / 29) | 772 | – | 3,4 | 0 | 22 / 771 / 0 |
| Vàng | 54 (45 / 87) | 1.873 | – | 5,7 | 0,6 | 47 / 1.625 / 0,6 |
| Đỏ | 131 (112 / 225) | 4.397 | 1,9 / 0 | 9,6 | 2,0 | 95 / 3.150 / 1,5 |
| Rực lửa | 339 (300 / 599) | 10.949 | 4,6 / 4,9 | 17,7 | 5,4 | 193 / 6.097 / 2,9 |

Đổi dòng cho tới khi ra đúng một dòng mong muốn (Rực lửa, món đã có 3 dòng khác): trung bình 5,1 lần, mỗi lần 12 đá + 600 vàng.

### 2.2 Bot mất bao nhiêu ngày để lên mỗi bậc (`kinhte`)

**Cách bot ép:** ép món chính trước, món phụ thấp hơn 1 bậc. Từ Vàng trở lên chỉ ép khi có bùa hoặc đá đủ gấp đôi giá. "Ngày" tính cả chiến dịch.

| Kiếm lên | 8 lượt / ngày (8 lượt chiến dịch × 2 kiểu: không mua / có mua quặng) | 4 lượt / ngày (3 lượt) |
|---|---|---|
| Qua 3-5 | ngày ~4,8–5,0 (42 lượt ải thường, ~200 phút) | ngày ~8,7 (35 lượt, ~180 phút) |
| Tím | ngày **1,5–1,7** (ải 2-1 / 2-2; sớm 1,2 · muộn 3,8) | ngày 3,2 (2-2) |
| Vàng | ngày **5,2–5,3** (3-3, 3-4 hoặc ngay sau 3-5) | ngày 6,8 (2-5 … 3-2) |
| Đỏ | ngày **6,0–7,5** (1–2 ngày sau 3-5) | ngày 8,0 (3-3 … 3-5) |
| Rực lửa | ngày **9,0–9,5** (4–5 ngày sau 3-5; sớm 7, muộn 13) | ngày 15 (6 ngày sau 3-5) |
| Phi tiêu Tím / Vàng / Đỏ | ngày 5,3–5,5 / 7–7,5 / 9–9,5 | ngày 7,2 / 8,2 / 17 |

- Trong chiến dịch, đá giữ nhịp ép: lần về làng nào cũng có "ép kiếm thiếu đá", 100% ở vùng 1, 88–90% ở vùng 2, 55–58% ở vùng 3.
- Sau 3-5, bot có ~50 đá mỗi ngày (đánh lại 3-5 được 5 đá mỗi lần, cộng Ải Đá Bậc Khó). Bùa từ trùm vùng dồn lại 15–20 cái không dùng hết. Vì vậy Đỏ và Rực lửa tới rất nhanh.
- Thử nâng **chỉ giá** Đỏ / Rực lửa (`deXuat`, `deXuat2`: Rực lửa 60–80 đá, 3.000–4.000 vàng, tỉ lệ 25%): kiếm Rực lửa vẫn ở ngày ~10, không đổi bao nhiêu.
- Thử **giảm đá khi đánh lại trùm** (`deXuat3`: `vung` [2,2,2], `mini` [1,1,1], bùa 4%): Rực lửa ngày 13.
- Thử **cả hai** (`deXuat4`: như `deXuat3`, cộng Đỏ 30 + 1.500 + 2 mảnh, Rực lửa 60 + 3.000 + 3 mảnh): kiếm Rực lửa **ngày 14** (sớm 13, muộn 18), phi tiêu Đỏ ngày 14. Tím vẫn ở 2-2, Vàng ở ngày ~5. Đây là đề xuất 3 trong tóm tắt.

### 2.3 Dòng hiệu ứng: quá mạnh / vô dụng (`dong`)

**Cách đo:** mỗi dòng ở giá trị Rực lửa (`goc × 2`, q = 1), gắn trên cả kiếm lẫn phi tiêu. Bản lưu bot ở mức khuyên dùng, vào thẳng phòng trùm với 40% máu. Ngư Tinh 150 lượt, Hồ Tinh 150 lượt; lượt lặp ±5 điểm.

| Dòng | Giá trị Rực lửa | Sức mạnh tính | Thắng Ngư Tinh 2-5 | Máu còn khi hạ Hồ Tinh 3-5 |
|---|---|---|---|---|
| (không dòng) | – | ×1,00 | 15% | 44% |
| Chí mạng | +8% | ×1,08 | 21% | 44% |
| Sát thương chí mạng | +30% | ×1,03 | 10–19% | 44% |
| Sát thương lên trùm, tinh anh | +16% | ×1,08 | 25% | 44% |
| **Hút máu** | 2,4% (mỗi đòn tối đa 2% máu) | ×1,12 | **41–43%** | **79–80%** |
| Tốc đánh | +8% | ×1,08 | 22–25% | 42% |
| Giảm hồi chiêu đặc biệt | −12% | ×1,00 | 11–20% | 43% |
| Linh khí nhận | +10% | ×1,00 | 15% (không có tác dụng trong trận) | 42% |
| Sát thương hệ | +12% | ×1,06 | 23% | 45% |
| Giảm sát thương nhận | −6% | ×1,00 | 16–19% | 45% |

- **Hút máu ở mức Tím** (1,2%) đã cho thêm +14 điểm máu còn ở Hồ Tinh. Lên Rực lửa thì gấp ~2,5 lần, vì kiếm và đòn quét trúng nhiều nhát.
- Thử số mới (Rực lửa, cùng cách đo):

  | goc / hutToiDa | Thắng 2-5 | Máu còn 3-5 |
  |---|---|---|
  | 0,012 / 0,02 (hiện tại) | 43% | 78% |
  | **0,006 / 0,01 (đề xuất)** | **21%** | **59%** |
  | 0,005 / 0,006 | 20% | 55% |
  | 0,004 / 0,005 | 19% | 56% |

- Thử nâng các dòng yếu, mức Rực lửa, 200 lượt: Sát thương chí mạng 0,15 → 0,30, Giảm hồi chiêu 0,06 → 0,15, Giảm sát thương 0,03 → 0,05 đều vẫn nằm trong nhiễu ±5 điểm. Các dòng ngoài Hút máu chênh nhau rất ít khi đánh thật. Vì vậy đề xuất 7 chỉ có tự tin thấp.
- **Linh khí nhận vô dụng.** Linh khí đã dư sẵn: lúc qua 3-5 còn ~500–630, ba tuần sau 3-5 là ~21.000, không có chỗ tiêu.

## 3. Kinh tế vàng / quặng / đá

### 3.1 Thu mỗi lượt ải thường thắng (chiến dịch, 8 lượt chiến dịch, `kinhte_khong_n8`)

| Loại | Vàng | Quặng | Đá | Linh khí | Nguyên liệu | Giây |
|---|---|---|---|---|---|---|
| Vùng 1, ải thường | 264–283 | 10 | 1,5 | 54 | 7 | 237–241 |
| Vùng 1, trùm vùng | 573–623 | 8–11 | 4,5–5 | 91–93 | 9 | 244–259 |
| Vùng 2, ải thường | 398–401 | 10,4 | 1,3 | 65 | 6,6 | 248–255 |
| Vùng 2, trùm vùng | 756–762 | 10–11 | 5,3 | 109 | 9 | 286–305 |
| Vùng 3, ải thường | 576–580 | 12–13 | 2,5–2,6 | 79–82 | 6,5–7 | 309–333 |
| Vùng 3, trùm vùng | 1.037–1.079 | 9–12 | 10 | 127–132 | 9 | 309–347 |
| Lượt thua | 63–153 | 0–3 | 0 | 36–82 | 0–3 | 165–358 |

- **Ải ngày trong chiến dịch** (5 ngày giả): 15–18 lượt, thắng 100%. Thu 4.300–5.000 vàng, 82–96 quặng, 15–21 đá, 300–360 linh khí.
- **Chi tiêu trong chiến dịch** (trung bình một lượt chiến dịch):
  - Mài: 8.800–10.000 vàng, 290–320 quặng, nguyên liệu 6 / 26 / 36–45.
  - Bộ: 5.300–5.600 vàng, 730–780 linh khí, 6–7,5 mảnh Ngư.
  - Lò: 2.300 vàng.
  - Ép: 2.300–2.400 vàng, 67–70 đá.
  - Nâng vũ khí bằng linh khí: 1.800–2.000 linh khí.
  - Mua quặng: **0**.
- **Tắc nghẽn** (phần trăm số lần về làng mà việc đáng nhất còn thiếu thứ đó; mỗi lần có thể thiếu nhiều thứ):

  | Vùng | Ép kiếm thiếu đá | Mài thiếu vàng | Mài thiếu nguyên liệu | Linh khí (nâng vũ khí) | Thiếu quặng |
  |---|---|---|---|---|---|
  | 1 | 100% | 30–48% | – | 33–46% | 11–14% (cùng lúc thiếu cả vàng) |
  | 2 | 86–90% | 21–26% | 9–19% | 36–44% | – |
  | 3 | 55–67% | 20–27% | 11–38% | 19–25% | – |

  Ngoài ra, ở vùng 3, ép kiếm thiếu vàng 17–34%. Quặng chưa lần nào là thứ duy nhất làm tắc.

### 3.2 Bà Hàng Xén bán quặng (40 vàng, 15 quặng mỗi ngày — đang chờ quyết)

| Kiểu | Lượt ải để qua 3-5 | Quặng đã mua | Quặng còn lúc qua 3-5 | Kiếm Vàng / Rực lửa (ngày) |
|---|---|---|---|---|
| Không mua | 42,8 | – | 137 | 5,3 / 9,0 |
| Mua khi thiếu quặng để mài lần kế (40 / 15) | 42,2 | **0** | 139 | 5,2 / 9,5 |
| Mua, giá 25 vàng / 25 quặng mỗi ngày | 42,3 | **1** | 164 | 6,0 / 10 |

Bot gần như không cần mua: mài bị tắc vì vàng và nguyên liệu (vảy cá, đá lửa của vùng chưa hạ trùm, chưa đổi được). → Giữ 40 / 15 không hại gì nhưng cũng không giúp gì. Đề xuất 5: chuyển một phần thưởng Ải Đá Mài sang nguyên liệu vùng.

### 3.3 Sau 3-5: dư thừa (`kinhte`, 21 ngày, 8 lượt mỗi ngày + ải ngày)

| Ngày sau 3-5 | Vàng | Quặng | Đá | Linh khí | Kiếm (bậc, mài) | Sức mạnh |
|---|---|---|---|---|---|---|
| +1 | 3.077 | 232 | 33 | 642 | Vàng +15 | 685 |
| +3 | 1.121 | 494 | 37 | 1.133 | Đỏ +15, lò 4, cấp 40 | 817 |
| +6 | 15.983 | 847 | 104 | 4.250 | 5,8 | 873 |
| +9 | 40.069 | 1.305 | 230 | 7.813 | Rực lửa | 890 |
| +15 | 79.844 | 2.082 | 542 | 14.512 | Rực lửa | 890 |
| +21 | 119.422 | 2.845 | 860 | 21.235 | Rực lửa | 890 |

- Từ ngày +9, Sức mạnh đứng yên. Thu mỗi ngày khoảng: +5–7 nghìn vàng (dù thưởng đã giảm còn ~55% vì Sức mạnh quá khuyên dùng), +110 quặng, +50 đá, +1.100 linh khí, không có chỗ tiêu.
- Bot không đổi dòng. Người chơi đổi dòng sẽ tiêu thêm đá và vàng (mục 2.1: ~5 lần × 12 đá + 600 vàng cho mỗi dòng mong muốn), nhưng vẫn không hết được ngần ấy.
- **Bot không chơi độ khó 2 sau 3-5.** Độ khó 2 cho thêm thu nhập nhưng cũng không có gì để mua.

## 4. Bộ trang phục và skill bộ

### 4.1 Lực chiến bộ so với nâng thứ khác

Không còn "đồ lẻ" (quần áo từng món) để so. So với các cách tiêu cùng giá:

| Bộ | Quy đổi cấp 3 (đòn / máu) | Sức mạnh ở hồ sơ 3-5, cấp 0 → 1 → 2 → 3 | Sức mạnh / 1.000 vàng |
|---|---|---|---|
| Ninja | ×1,082 / ×1,094 | 490 → 497 → 520 → 532 | 1→2: 2,2 |
| Rừng | ×1,020 / ×1,079 | 490 → 499 → 504 → 514 | 2→3: **1,1** |
| Biển | ×1,000 / **×1,285** | 490 → 536 → 547 → 555 | 0→1: **20–24** |
| Lâu đài | ×1,084 / ×1,111 | 490 → 516 → 521 → 537 | 0→1: 8–12 |

- Giá mỗi bộ: 80 / 200 / 400 linh khí, 500 / 1.500 / 3.000 vàng, 0 / 3 / 6 mảnh.
- Tổng mọi bộ: 20.000 vàng, 2.720 linh khí, 36 mảnh. Đây là chỗ tiêu vàng lớn nhất trong game. Bot làm xong cả 4 bộ khoảng 3 ngày sau 3-5.

### 4.2 Đánh thật: cả ải và riêng trùm (`bo`)

| Bộ (cấp 3) | 2-3 cả ải: thắng · máu còn · Sức mạnh | 3-3 cả ải | 1-5 trùm (40% máu) | 2-5 trùm (40% / 65% máu) | 3-5 trùm (40%) |
|---|---|---|---|---|---|
| Ninja 0 (không skill) | 69% · 77% · 266 | 69% · 83% · 404 | 83% | 18% / 30% | 98% |
| Ninja 3 | 91% · 81% · 289 | **91%** · 88% · 440 | 86% | 21% / – | 99% |
| Rừng 3 | 83% · 80% · 279 | **79%** · 84% · 424 | 82% | 18% / 36% | 100% |
| Biển 3 | **98%** · 86% · 301 | 86% · 85% · 458 | 92% | 18% / 54% | 100% |
| Lâu đài 3 | 87% · 82% · 292 | 86% · 86% · 444 | 92% | 19% / 56% | 100% |

- **Cả ải:** mọi bộ cấp 3 thắng nhiều hơn hẳn không có skill bộ (+10…+29 điểm). Rừng thấp nhất.
- **Biển:** Sức mạnh tính cao nhất (+13%), nhưng đánh thật chỉ ngang Ninja 3 / Lâu đài 3 → Sức mạnh đánh giá Khiên nước hơi cao (đề xuất 6).
- **Riêng trùm vào với 40% máu:** gần như không bộ nào giúp đổi được kết quả. Khiên chặn được một đòn, nhưng 40% máu thì đòn kế vẫn hạ được bé. Vào trùm với 65% máu thì Biển và Lâu đài thắng Ngư Tinh 54–56%, Ninja 0 30%, Rừng 36%.
- Hồ Tinh khi vào thẳng trùm thắng 98–100% ở mọi bộ. Hồ Tinh dễ là việc của phiên A.
- **Thử số mới cho Rừng** (cả ải, 150 lượt):

  | Số thử | 2-3 | 3-3 |
  |---|---|---|
  | Nhựa 0,5 giây 1,5%/giây + Gai 1,0 + Dây 2 giây | 82% | 83% |
  | Nhựa 0,3 giây 2%/giây + Gai 1,5 + Dây 2,5 giây | 88% | 82% |
  | **Nhựa 0,3 giây 3%/giây + Gai 1,0 (đề xuất)** | **90%** | **85%** |
  | Nhựa luôn hồi 0,5%/giây + Gai 1,0 | 99% | 97% (quá mạnh) |
  | Nhựa luôn hồi 1,5%/giây | 100% | 99% (quá mạnh) |

## 5. Đề xuất số cụ thể (gom lại)

| # | Tệp / khoá | Cũ → mới | Lý do (số đo) | Tự tin |
|---|---|---|---|---|
| 1 | `js/vk_moi.js` `VM.canLai` (dựng lại vũ khí) | thêm `ep: w.ep` vào vũ khí mới; `G.resetSave` (hoặc `G.newSave`) đặt `canLai = G.SAVE_CAN_LAI` | Lỗi: "Xoá hết" rồi mở lại game thì mất bậc ép (mục 7) | cao |
| 1b | `game/tests/cay.py`, `balance.py`, `noi-gian-manh/do_trum.py` | đặt `canLai` trước `G.fixSave` | Hiện các công cụ này đo trên vũ khí đã mất bậc ép | cao |
| 2 | `G.EP_DO.dong` hutMau `goc`; `G.EP_DO.hutToiDa` | 0,012 → **0,006**; 0,02 → **0,01** | Mục 2.3 | vừa–cao |
| 3a | `G.EP_DO.roi.vung` / `.mini` | [3,4,5] → **[2,2,2]**; [1,1,2] → **[1,1,1]** (giữ `vungDau`, `miniDau`) | Mục 2.2 / 3.3: Rực lửa ngày 9 → 14 | vừa |
| 3b | `G.EP_DO.bua.trumVung` | 0,1 → **0,04** | Bùa dồn 15–20 cái không dùng hết | vừa |
| 3c | `G.EP_DO.gia[5]`, `gia[6]` | {25, 800, mảnh [0,1,0]} → **{30, 1.500, [0,2,0]}**; {40, 1.200, [0,0,2]} → **{60, 3.000, [0,0,3]}** | Đi cùng 3a (thử riêng 3c không đổi được bao nhiêu); thêm chỗ tiêu vàng | vừa |
| 4 | `G.SKILL_BO.rung[0]`, `rung[1]` | Nhựa rừng `dung` 1 → **0,3**, `hoi` 0,01 → **0,03**; Gai độc `satThuong` 0,5 → **1,0** | Mục 4.2: Rừng 83/79% → 90/85% | thấp–vừa |
| 5 | `G.AI_NGAY.ai.mai.thuong` | 14/18/22 quặng → **8/10/12 quặng + 4/6/8 nguyên liệu** (vùng của mức đó; cần thêm vài dòng ở `js/ai_ngay.js`) | Mục 3.1–3.2: quặng không bao giờ thiếu, nguyên liệu thì có | vừa |
| 5b | `G.BAN_QUANG` | **giữ 40 / 15** (hoặc tắt) | Bot không bao giờ cần mua | vừa |
| 6 | `js/bo_skill.js` quy đổi Khiên nước | hệ số 3 → **2** (×1,20 → ×1,13) | Mục 4.2: Biển 3 ≈ Ninja 3 ≈ Lâu đài 3 khi đánh thật | thấp |
| 7 | `G.EP_DO.dong` linhKhi, hoiChieu | linhKhi: thay bằng dòng khác (ví dụ "Đá nâng bậc nhận"); hoiChieu `goc` 0,06 → **0,12** | Mục 2.3: không có tác dụng đo được | thấp |
| 8 | `G.EP_DO.phu.sword.giaTri` (tuỳ chọn) | 0,025 → **0,015** | Mục 1.2: tốc đánh của kiếm chỉ ăn ~60% | vừa |
| – | Chỗ tiêu vàng sau 3-5 | quyết định thiết kế (chưa có số) | Mục 3.3: dư ~120 nghìn vàng sau 3 tuần | – |

## 6. Lưu ý về độ tin của số đo

- **Bot vụng có chủ ý:** né đơn giản, ít đứng yên, dùng đòn Đặc biệt đơn giản.
  - Skill cần đứng yên (Nhựa rừng) hay đòn Đặc biệt (Giảm hồi chiêu) có thể đáng hơn với người thật.
  - Hút máu đáng nhất khi trúng nhiều đòn, nên với người thật nó có thể còn mạnh hơn.
- **Nhiễu:** mỗi ô trong bảng 150–200 lượt là ±5–7 điểm. Mốc ngày ép là trung vị của 3–8 lượt chiến dịch, lệch ±2 ngày.
- **Bot chỉ dùng kiếm + phi tiêu**, không đổi dòng, không chơi độ khó 2.
- **Con số "Ngày"** giả định 8 (hoặc 4) lượt ải thường mỗi ngày, và chơi hết ải ngày.

## 7. Lỗi mất bậc ép khi nạp bản lưu (chi tiết)

- `G.fixSave` (bọc ở `js/vk_moi.js`) chạy `VM.canLai` khi `s.canLai !== G.SAVE_CAN_LAI`.
- `VM.canLai` dựng lại 4 vũ khí từ đầu. Nó chỉ giữ loại, cấp hệ, mài và số quái đã hạ, **không giữ `w.ep`**.
- `G.newSave()` không có `canLai`, và `js/engine.js` có ghi chú cố ý không thêm. Bản mới tạo qua `G.fixSave(null)` khi mở game lần đầu thì có cờ, còn `G.resetSave()` (nút **"Xoá hết"** ở `js/village.js`) thì **không có**.

Tái hiện (Node, đúng hàm game):

```
G.resetSave(); kiếm.ep = { b: 4, d: [Chí mạng, Trùm] }; G.persist(); G.loadSave()
→ kiếm.ep = null (mất Bậc Vàng và 2 dòng); daBac còn nguyên; save.canLai = 1
G.persist(); G.loadSave() lần hai → giữ được
```

- **Ai bị ảnh hưởng:** người chơi bấm "Xoá hết" rồi chơi lại. Mọi bậc ép làm trước lần mở game kế tiếp đều mất. Bản lưu như vậy tải lên mây rồi tải về cũng mất.
- **Sửa (đề xuất, chưa làm vì phiên này chỉ đo):** trong `VM.canLai`, vũ khí mới thêm `ep: w.ep && typeof w.ep === 'object' ? w.ep : undefined`. Phần sửa của `js/ep_do.js` chạy sau sẽ chuẩn hoá lại. Hoặc `G.resetSave` đặt `G.save.canLai = G.SAVE_CAN_LAI || 1` trước `G.persist()`.
- **Công cụ bot:** `tests/cay_luu.json` (mọi bản lưu) không có `canLai`. Vì vậy `cay.py --kd`, `balance.py` và `do_trum.py` đều đo trên vũ khí đã mất bậc ép.
  - Lấy bản lưu 3-5 làm ví dụ: Sức mạnh 455 khi mất bậc ép, 514 khi còn.
  - Các con số "Sức mạnh thắng 75%" vẫn tự khớp nhau vì đo và chơi cùng một bản đã mất bậc ép. Nhưng bản lưu dùng để đo không còn đúng là bản bot đã chơi.

## 8. Tệp

- **Mới** (thư mục này):
  - `do_b.py`: công cụ đo.
  - `so-lieu-B.json`: số thô của mọi lần đo, kể cả các lần thử đề xuất `kinhte_*_deXuat*`, `dong_m40`, `bo_ca`, `bo_m40`, `dpsep_hp8.0`.
  - `xem-B.png`: ảnh 6 ô (lưới Sức mạnh, Sức mạnh / 1.000 vàng, đá để ép, tồn kho sau 3-5, các dòng ép, các bộ).
  - `bao-cao-B.md`: báo cáo này.
- **Không sửa tệp nào trong `game/`.**
