# KINH TẾ — Cửa hàng / Rương / Vòng quay / Nhiệm vụ / Sự kiện / Cấp thẻ / Cấp phi công (cập nhật 09/11/2026 — tiến trình đợt 1)

Mã: `thap/js/thebai.js` (cấp thẻ: bản sao + vàng mỗi cấp, túi thưởng trận), `thap/js/kinhte.js` (cửa hàng, rương, quay, nhiệm vụ, điểm danh, thành tựu, sự kiện),
`thap/js/manh.js` (nguồn mảnh Vàng/Đỏ thêm 09/11), giao diện `thap/js/kinhte-ui.js` + `thap/css/kinhte.css`; kiểm `tools/thap-kt-shop.js`, `tools/thap-kt-manh.js`.
Theo yêu cầu người dùng (`YEU-CAU-NGUOI-DUNG.md`): **thẻ ĐỎ (Mythic) và VÀNG (Legendary) phải cày như DCDW** — không dễ. Không có nạp tiền (không mã thanh toán).

> 09/11: rà lại toàn bộ số theo code: thẻ Vàng/Đỏ lên tới **LV17** (thebai.js `lvMaxBac`, 08/11), wave người chơi giờ cao hơn nhiều (thường 25–35, giỏi 45–60, bộ mạnh 40–70),
> thêm nguồn mảnh `manh.js`. Bảng thu nhập cũ (wave TB 18) đã thay bằng 2 mức người chơi ở §3–§4.

## 1. DCDW làm thế nào (nguồn) và mình chọn gì

| Mục | DCDW | Nguồn | Mình |
|---|---|---|---|
| Túi Huyền thoại bảo đảm | 2 500 kim cương = 1 lượt Huyền thoại chắc chắn | thesovietgaming.com (DCDW beginners guide) | Rương Vàng 500 ngọc chỉ 3,8%/thẻ Huyền thoại, bảo hiểm 10 rương (= 5 000 ngọc ≥ 2× DCDW) |
| Hộp Huyền thoại | ~500 ngọc | bluestacks (ghi ở DCDW-TANG-SUC-MANH.md) | Rương Vàng 500 ngọc (không bảo đảm Huyền thoại mỗi rương) |
| Shop vàng | "để dành 40 000 vàng, đôi khi có túi/thẻ Huyền thoại" | thesovietgaming | Daily Specials: ô cuối Huyền thoại 12 000 vàng/bản; Cổ đại 60 000 vàng/bản, chỉ ~1 ngày/tuần |
| Devil Pass | 30 ngày, 35 bậc, 2 điểm/trận thắng PvP, bậc cuối = 1 thẻ Huyền thoại | thesovietgaming | Sự kiện tuần: 10 mốc, mốc cuối 1 700 điểm = 1 bản Cổ đại ngẫu nhiên (xem §3: giờ người chơi giỏi tới được mỗi tuần) |
| Nhiệm vụ ngày | 3 nhiệm vụ cùng lúc | thesovietgaming | 3 nhiệm vụ/ngày (bể 10) + thưởng đủ 3 |
| Tỉ lệ túi/hộp theo độ hiếm, lợi tức ngọc | **không tìm được** (namu.wiki, inven chặn đọc tự động) | — | chọn **chặt hơn hoặc bằng** (bảng dưới) |

## 2. Số trong game

**Túi thưởng cuối trận** (`THEBAI.thuong`): vàng = 10×wave + 40×trùm + 150 nếu thắng; số lượt rút (`THEBAI.soLuot`) = min(14, 1 + ⌊min(w,36)/4⌋ + ⌊max(0,w−36)/8⌋) — wave ≤ 36 như cũ, **trần 14 ở wave 68** (tiến trình đợt 1, trước: trần 10 ở wave 36);
độ hiếm mỗi lượt **58 / 29 / 11 / 1,8 / 0,2 %**; bản sao mỗi lượt Thường 3–6 · Hiếm 2–4 · Sử thi 1–2 · Vàng/Đỏ 1.
Mỗi lượt 50% lấy thẻ cùng bậc **trong bộ bài vừa chơi** (bộ 5 thẻ), 50% thẻ bất kỳ cùng bậc — riêng **Đỏ 30% / 70%** (tiến trình đợt 1) → thẻ trong bộ lên nhanh hơn
(bộ có 2 Vàng: 1 thẻ Vàng cụ thể nhận 0,5/2 + 0,5/32 ≈ 27% số bản Vàng rơi ra; bộ có 1 Đỏ: 0,3 + 0,7/10 = **37%** số bản Đỏ, trước 55%).
Roster hiện có: Thường 14 · Hiếm 17 · Sử thi 22 · **Vàng 32 · Đỏ 10** (đã bỏ Hào Quang). Trùm mỗi 10 wave; Solo thắng = qua wave 70 (`LUAT.waveMax`).
Phần thưởng thẻ "ngẫu nhiên theo bậc" (rương, mốc, lò rèn, nhiệm vụ) chọn đều trong các thẻ **chưa MAX** của bậc đó (`KT.chonThe`).

**Daily Specials** (đổi lúc 0 giờ máy; hạt giống = ngày + mã người chơi; mua 1 lần/ô):
ô 1 quà miễn phí (100 vàng / 5 ngọc / 5 bản Thường / 2 bản Hiếm) · Thường 20–40 bản × 25 vàng · Hiếm 6–12 × 80 · Hiếm/Sử thi · Sử thi 2–4 × 500 ·
ô cuối: Huyền thoại 1 bản 12 000 vàng (6/7 ngày) hoặc Cổ đại 1 bản 60 000 vàng (~1/7 ngày).

**Rương** (tỉ lệ MỖI thẻ; nút (i) hiện cả xác suất "≥1 trong rương"):

| Rương | Giá | Thẻ | Thường | Hiếm | Sử thi | Huyền thoại | Cổ đại | Bảo đảm / bảo hiểm |
|---|---|---|---|---|---|---|---|---|
| NORMAL | 2 000 vàng | 6 | 62 | 29 | 8,5 | 0,5 | 0 | — |
| GOLD | 500 ngọc | 8 | 44 | 36 | 16 | 3,8 | 0,2 | ≥1 Sử thi+ · Huyền thoại ≤ 10 rương · Cổ đại ≤ 120 rương (60 000 ngọc) |
| MYTHIC | 6 000 ngọc | 12 | 30 | 38 | 24 | 7 | 1 | 1 Cổ đại + 2 Huyền thoại |

Bản sao mỗi thẻ: Thường 4–8, Hiếm 2–4, Sử thi 1–2, Huyền thoại/Cổ đại 1. Đổi ngọc → vàng: 100→1 000, 500→5 500, 1 500→18 000.

**Vòng quay**: 1 lượt miễn phí/ngày + tối đa 5 lượt × 100 ngọc. 8 ô: 200 vàng 30% · 10 bản Thường 16% · 10 ngọc 14% · 800 vàng 14% · 4 bản Hiếm 12% · 40 ngọc 6% · 2 bản Sử thi 7,5% · JACKPOT
(miễn phí 0,5% = 1 bản Huyền thoại; lượt ngọc 1,0% → 70% Huyền thoại / 30% Cổ đại = **0,3% Cổ đại**, không có ở lượt miễn phí).

**Ngọc chỉ kiếm bằng chơi**: nhiệm vụ ngày — bể 10 (4 cái 300–400 vàng · 5 cái 10–15 ngọc · "Reach wave 30" = 1 bản Vàng), chọn 3/ngày, +20 ngọc đủ 3;
**lọc theo kỷ lục** (mọi chế độ): "Reach wave 15" khi kỷ lục ≥ 12 · "Defeat 2 bosses" ≥ 20 · "Reach wave 30" ≥ 28 (danh sách hôm nay đã lưu có nhiệm vụ vượt kỷ lục → thay ngay); **đổi 1 nhiệm vụ chưa xong/ngày** (miễn phí);
**nhiệm vụ tuần** (mở cấp phi công 8, reset thứ Hai): 15 trận · 8 trùm · 3 trận kết thúc ≥ kỷ lục − 5 · 10 ụ 5★+ · 12 nhiệm vụ ngày — mỗi việc 20 ngọc, đủ 5 = 40 ngọc + 1 bản Vàng ngẫu nhiên (**+140 ngọc/tuần**);
điểm danh 7 ngày (300 vàng, 10, Rương Thường, 20, 1 000 vàng, 30, Rương Vàng — không bảo đảm Cổ đại); thành tựu 1 lần (490 ngọc tổng);
sự kiện tuần (30 ngọc mốc 280 + 60 ngọc mốc 750 + 50 ngọc mốc 2 300). Điểm sự kiện mỗi trận = wave + 10 nếu thắng + 5/trùm, **tối đa 60** (chạm trần từ ~wave 45).
Thang sự kiện (tiến trình đợt 1): 40 · 100 · 180 · 280 · 400 · 550 · 750 · 1 000 · 1 300 · **1 700 = 3 000 vàng + 1 bản Vàng ngẫu nhiên** · 2 300 = 50 ngọc · **3 600 = 1 bản Đỏ** (trước: Đỏ ở 1 700).
**Ấn Vàng** (Lò rèn, `MH.an`): **6 bản Vàng thừa** (nhiều thẻ, trừ thẻ đích; lấy thẻ đã MAX trước → thẻ ngoài bộ → thẻ trong bộ, chồng nhiều trước) + **20 000 vàng → 1 bản Vàng TỰ CHỌN**, 1 lần/tuần (người dùng chốt 6:1).
**Bảo hiểm rương**: nút Rương Vàng hiện cả 2 bộ đếm "Legendary in ≤ N" + "Mythic in ≤ M" (`s.ru.pv/pd`). **Không dùng năng lượng.**

**Cấp thẻ** (`THE` trong thebai.js): cấp đầu Thường 1 · Hiếm 3 · Sử thi 6 · Vàng 9 · Đỏ 11; tối đa **LV15** (Thường/Hiếm/Sử thi) · **LV17** (Vàng/Đỏ).
Vàng cho cấp L → L+1 theo cấp TUYỆT ĐỐI (mọi bậc chung một bảng): 20 · 50 · 100 · 200 · 400 · 800 · 1 500 · 2 500 · 4 000 · 6 000 · 9 000 · 13 000 · 18 000 · 25 000 · 35 000 · 50 000.

| Cấp | Thường: bản / vàng | Hiếm: bản / vàng | Sử thi: bản / vàng | **Vàng: bản / vàng** | **Đỏ: bản / vàng** |
|---|---|---|---|---|---|
| 1→2 | 2 / 20 | | | | |
| 2→3 | 4 / 50 | | | | |
| 3→4 | 8 / 100 | 2 / 100 | | | |
| 4→5 | 15 / 200 | 4 / 200 | | | |
| 5→6 | 25 / 400 | 7 / 400 | | | |
| 6→7 | 40 / 800 | 12 / 800 | 2 / 800 | | |
| 7→8 | 60 / 1 500 | 20 / 1 500 | 3 / 1 500 | | |
| 8→9 | 90 / 2 500 | 32 / 2 500 | 5 / 2 500 | | |
| 9→10 | 130 / 4 000 | 48 / 4 000 | 8 / 4 000 | 1 / 4 000 | |
| 10→11 | 180 / 6 000 | 70 / 6 000 | 12 / 6 000 | 2 / 6 000 | |
| 11→12 | 240 / 9 000 | 100 / 9 000 | 18 / 9 000 | 3 / 9 000 | 1 / 9 000 |
| 12→13 | 320 / 13 000 | 140 / 13 000 | 26 / 13 000 | 5 / 13 000 | 2 / 13 000 |
| 13→14 | 420 / 18 000 | 190 / 18 000 | 36 / 18 000 | 8 / 18 000 | 3 / 18 000 |
| 14→15 | 550 / 25 000 | 250 / 25 000 | 50 / 25 000 | 12 / 25 000 | 5 / 25 000 |
| 15→16 | — | — | — | 18 / 35 000 | 8 / 35 000 |
| 16→17 | — | — | — | 26 / 50 000 | 12 / 50 000 |
| **Tổng tới MAX** | **2 084 / 80 570** | **875 / 80 500** | **160 / 79 800** | **75 / 160 000** | **31 / 150 000** |
| (tới LV15, để so bản cũ) | | | | 31 / 75 000 | 11 / 65 000 |

→ 2 cấp mới LV16–17 **hơn gấp đôi** chi phí thẻ Vàng/Đỏ (Vàng 31→75 bản, Đỏ 11→31 bản; vàng ~75 000→160 000 / 65 000→150 000).
Bộ 5 thẻ điển hình (2 Vàng + 1 Đỏ + 2 Sử thi) tới MAX: **~630 000 vàng**, 150 bản Vàng (2 thẻ cụ thể), 31 bản Đỏ (1 thẻ cụ thể), 320 bản Sử thi.

## 3. Thu nhập theo 2 mức người chơi

Giả định (người chơi chơi mọi chế độ, làm đủ 3 nhiệm vụ, điểm danh, quay miễn phí, mua 1 Rương Vàng bằng ngọc khi đủ 500):
- **Thường**: 5 trận/ngày, wave TB 30 (dải 25–35) → 8 lượt rút/trận, 3 trùm/trận, thắng 10% (co-op/PVP; Solo chưa qua wave 70).
- **Giỏi**: 8 trận/ngày, wave TB 52 (dải 45–60) → 10 lượt rút/trận (trần), 5 trùm/trận, thắng 20%.

| Nguồn / ngày | Thường: vàng | Thường: ngọc | Giỏi: vàng | Giỏi: ngọc |
|---|---|---|---|---|
| Túi thưởng trận | 2 175 (5 × 435) | — | 6 000 (8 × 750) | — |
| 3 nhiệm vụ + thưởng đủ 3 | ~420 | ~40 | ~420 | ~40 |
| Điểm danh (÷7) | ~186 | ~8,6 | ~186 | ~8,6 |
| Vòng quay miễn phí (kỳ vọng) | ~172 | ~3,8 | ~172 | ~3,8 |
| Quà Daily Specials | ~25 | ~1,3 | ~25 | ~1,3 |
| Sự kiện tuần (÷7) | ~71 | ~13 | ~71 | ~13 |
| **Tổng / ngày** | **≈ 3 050** | **≈ 66** | **≈ 6 900** | **≈ 66** |
| **Tổng / tuần** | **≈ 21 000** | **≈ 460** | **≈ 48 000** | **≈ 460** |

Điểm sự kiện / tuần: Thường 45 điểm/trận × 35 trận ≈ **1 600** (tới mốc 1 300, hụt mốc Đỏ 1 700 — chỉ cần 6 trận/ngày hoặc wave ~35 là tới);
Giỏi 60 (trần) × 56 ≈ **3 360** → mốc Đỏ 1 700 chỉ cần **~29 trận ≈ 4 trận/ngày**. Ngọc gần như không đổi theo trình độ (~460/tuần ≈ 0,9 Rương Vàng).
Rương Vàng / tuần: 1 điểm danh + 2 sự kiện (mốc 550, 1 300) + ~0,9 mua bằng ngọc ≈ **3,9 rương** (cả 2 mức).
Rương Thần thoại 6 000 ngọc ≈ **13 tuần** dành ngọc. Bảo hiểm Cổ đại 120 Rương Vàng ≈ **~30 tuần** với 3,9 rương/tuần (không chỉ đổi ngọc).

**Bản sao Vàng / Đỏ (bất kỳ thẻ) mỗi tuần, nguồn lặp lại:**

| Nguồn | Thường: Vàng | Thường: Đỏ | Giỏi: Vàng | Giỏi: Đỏ |
|---|---|---|---|---|
| Túi thưởng trận (lượt × 1,8% / 0,2%) | 5,0 | 0,56 | 10,1 | 1,12 |
| ~3,9 Rương Vàng (8 thẻ × 3,8% / 0,2%) | 1,2 | 0,06 | 1,2 | 0,06 |
| Sự kiện: ụ nổi bật mốc 100/400/1 000 (cùng 1 thẻ Vàng/tuần) | 4 | — | 4 | — |
| Sự kiện mốc 1 700 | — | 0 (hụt) | — | **1** |
| Nhiệm vụ "Reach wave 30" (3/10 ngày) | ~2,1 (nếu tới w30) | — | 2,1 | — |
| Lò rèn (tốn bản sao + vàng) | ≤ 3 | ≤ 1 | ≤ 3 | ≤ 1 |
| Daily Specials (mua) | ≤ 6 × 12 000 | ≤ 1 × 60 000 | ≤ 6 × 12 000 | ≤ 1 × 60 000 |

**Một lần** (`manh.js`): mốc Solo w20/30/40/50/60/70 = 1/2/3/3/4/5 Vàng + w50/60/70 = 1/1/2 Đỏ; hạ trùm lần đầu 12 × 1 Vàng; hạ đủ 12 trùm 1 Đỏ.
Thường (kỷ lục ~40): ~18 Vàng + 1 Đỏ (đủ trùm). Giỏi (kỷ lục ~60): 25 Vàng + 3 Đỏ (tới 70: 30 Vàng + 5 Đỏ).

## 4. Mất bao lâu để lên cấp (1 thẻ CỤ THỂ đang ở trong bộ bài)

Bộ giả định có 2 Vàng + 1 Đỏ. Thẻ ngoài bộ bài chậm hơn nhiều (chỉ nhận phần "bất kỳ"). Bản sao cho 1 thẻ cụ thể / tuần (nguồn lặp lại; ngẫu nhiên theo bậc chia 32 thẻ Vàng / 10 thẻ Đỏ):
- **Vàng** — Thường: túi trận 1,34 + rương 0,04 + ụ nổi bật 0,13 (trung bình, 1/32 tuần trúng 4 bản) + nhiệm vụ 0,07 + lò rèn 0,09 + Specials 0,19 (mua khi đúng thẻ) ≈ **1,85/tuần**;
  Giỏi: túi trận 2,68 + phần còn lại như trên ≈ **3,2/tuần**. Một lần: Thường ~0,6 bản, Giỏi ~0,8 bản.
- **Đỏ** — Thường: túi trận 0,31 + rương 0,006 + Specials 0,1 (nếu để dành đủ 60 000) + lò rèn ≤ 0,1 ≈ **0,3–0,5/tuần**;
  Giỏi: túi trận 0,62 + Specials 0,1 + mốc sự kiện 1 700 0,1 + lò rèn 0,1 ≈ **0,9/tuần**. Một lần: Thường ~0,1, Giỏi ~0,3 (tới w70: 0,5).

| Thẻ (bản / vàng tới MAX) | Thường (wave 25–35): tới LV15 | Thường: tới MAX | Giỏi (wave 45–60): tới LV15 | Giỏi: tới MAX | Lần lên cấp đầu |
|---|---|---|---|---|---|
| Thường LV1→15 (2 084 / 80 570) | — | ~5–6 tuần (~56 bản/ngày nếu là thẻ Thường duy nhất trong bộ) | — | ~3 tuần | trận đầu |
| Hiếm LV3→15 (875 / 80 500) | — | ~7 tuần (~18 bản/ngày) | — | ~3–4 tuần | trận đầu |
| Sử thi LV6→15 (160 / 79 800) | — | ~6–7 tuần (~3,4 bản/ngày; bộ có 2 Sử thi: ~3 tháng mỗi thẻ) | — | ~3–4 tuần (2 Sử thi: ~6 tuần) | 1 ngày |
| **Vàng LV9→17 (75 / 160 000)** | ~4 tháng (31 bản) | **~9–10 tháng** | ~2–2,5 tháng | **~5–5,5 tháng** | ~4 ngày / ~2 ngày |
| **Đỏ LV11→17 (31 / 150 000)** | ~5–8 tháng (11 bản) | **~14 tháng – 2 năm** (≈ 1,5 năm) | ~3 tháng | **~8 tháng** | ~2–3 tuần / ~1 tuần |

Vàng không phải nút thắt: 1 thẻ Vàng MAX = 160 000 vàng ≈ 7,5 tuần thu nhập Thường / 3,3 tuần Giỏi; cả bộ ~630 000 vàng ≈ 30 tuần Thường / 13 tuần Giỏi — đều ngắn hơn thời gian gom bản sao.
Riêng người chơi Thường muốn mua bản Đỏ ở Specials (60 000 ≈ 3 tuần vàng) thì phải chọn giữa mua và lên cấp.

## 5. Chống gian / an toàn bản lưu

- Mọi kết quả TẤT ĐỊNH theo hạt giống (mã người chơi + ngày / bộ đếm rương / số lượt quay) → tải lại trang không quay lại được kết quả khác.
- Cờ "đã nhận" ghi trước khi cộng thưởng; lùi đồng hồ máy không mở lại (dùng ngày lớn nhất từng thấy).
- `localStorage['turret_kt']` mới; ngọc nằm cùng vàng trong `turret_the`. Bản cũ: không xoá gì, kỷ lục wave / số trận thắng cũ mở thành tựu. Bản hỏng → giữ `turret_kt_hong`.
- Đã đăng nhập: chép `profiles/{uid}/kt` (chuỗi JSON, cùng luật Firebase hiện có — hồ sơ chỉ chủ ghi). Gộp: bản có bộ đếm lưu lớn hơn làm gốc, cờ đã nhận cùng ngày OR, cấp thẻ lấy lớn nhất.

## 6. Sẵn cho bán hàng sau này (CHƯA có mã thanh toán)

- Mọi lần cộng/trừ vàng, ngọc đi qua `KT.cong(loai, so, nguon)` (nguồn: quest login achieve event wheel shop chest battle exchange; để dành **iap ad pass**); tổng theo nguồn ở `turret_kt.nguon`.
- Chỗ để dành, đang ẩn: `KTC.goiNgoc` (thẻ GEM PACKS chỉ hiện khi có gói), `KTC.skPremium` (hàng premium của Event Pass).
- **Số sẽ đổi khi có ngọc trả tiền**: giá Rương Vàng / Thần thoại, giá lượt quay, giới hạn 5 lượt/ngày, bảo hiểm Cổ đại 120, lợi tức ngọc nhiệm vụ (thường giảm khi có gói bán), thêm Season Pass premium. Phải giữ tỉ lệ công khai (nút i) — luật nhiều nước bắt buộc.

## 7. Đối chiếu yêu cầu "đỏ phải cày" (06/11, kiểm bằng `tools/thap-kt-shop.js`; số thời gian cập nhật 09/11)

| Yêu cầu | Trong game | Kiểm |
|---|---|---|
| Không Cổ đại bảo đảm ở nguồn miễn phí hằng ngày | điểm danh ngày 7 = Rương Vàng (0,2%/thẻ), quà Daily Specials, quay miễn phí (jackpot = Huyền thoại), nhiệm vụ, thành tựu: **0 Cổ đại** (nguồn 1 lần mốc Solo/trùm ở §8) | ✓ quét bảng thưởng + 2 000 lượt quay miễn phí giả → 0 Cổ đại |
| Tỉ lệ đỏ rất nhỏ | túi trận 0,2%/lượt · Rương Vàng 0,2%/thẻ · Rương Thường 0 | ✓ ≤ 0,5% |
| Bảo hiểm dài | Cổ đại ≤ 120 Rương Vàng (= 60 000 ngọc ≈ 2,5 năm ngọc; tính cả rương điểm danh/sự kiện ≈ 30 tuần) | ✓ ≥ 100 |
| Rương Thần thoại rất đắt | 6 000 ngọc ≈ 13 tuần dành ngọc | ✓ ≥ 5 000 |
| Daily Specials đỏ hiếm + đắt | ~1 ngày/tuần, 60 000 vàng (≈ 20 ngày vàng Thường / ≈ 9 ngày Giỏi) | ✓ ≤ 1/7 ngày, ≥ 50 000 |
| Vòng quay: đỏ nhỏ, chỉ lượt ngọc | 0,3%/lượt ngọc, 0 ở lượt miễn phí | ✓ |
| Sự kiện tuần ≤ 1 bản đỏ ở cuối | chỉ mốc cuối (**3 600 điểm** từ tiến trình đợt 1; trần 60 điểm/trận → ≥ 60 trận/tuần) | ✓ (nhưng xem §9: người chơi giỏi tới mỗi tuần) |

**Đỏ bất kỳ / tuần**: Thường ~0,6–0,9 bản (≈ 1 bản mỗi 8–12 ngày), Giỏi ~2,2–3 bản (túi trận 1,1 + sự kiện 1 + Specials/lò rèn).
**1 thẻ Đỏ cụ thể tới LV17**: Thường ~1,5 năm, Giỏi ~8 tháng. **Vàng cụ thể tới LV17**: Thường ~9–10 tháng, Giỏi ~5 tháng. Sử thi trở xuống: dễ hơn (đúng yêu cầu).

## 8. Nguồn mảnh Vàng / Đỏ thêm (09/11 — `thap/js/manh.js`, kiểm `tools/thap-kt-manh.js`)

Người dùng: "các cơ chế kiếm thêm mảnh ụ Vàng, Đỏ — Đỏ sẽ khó kiếm hơn". Rương / Daily Specials / vòng quay / sự kiện giữ nguyên.

| Nguồn | Vàng (Huyền thoại) | Đỏ (Thần thoại/Cổ đại) | Ghi chú |
|---|---|---|---|
| Mốc wave Solo lần đầu | w20 ×1 · w30 ×2 · w40 ×3 · w50 ×3 · w60 ×4 · w70 ×5 = **18** | w50 ×1 · w60 ×1 · w70 ×2 = **4** | 1 lần, chỉ Solo; kỷ lục Solo cũ mở ngay |
| Hạ trùm lần đầu | ×1 mỗi trùm = **12** | hạ đủ 12 trùm = **1** | mọi chế độ (PVP: trùm bàn mình) |
| Nhiệm vụ ngày "Reach wave 30" | ×1 (bể 10 chọn 3 → 30% số ngày ≈ 2,1/tuần) | — | người chơi wave < 30 thì mất luôn thưởng đủ 3 (+20 ngọc) hôm đó |
| Lò rèn: 30 bản 1 thẻ Sử thi + 2 000 vàng | ×1 ngẫu nhiên, **3/tuần** | — | reset thứ Hai |
| Lò rèn: 10 bản 1 thẻ Vàng + 10 000 vàng | — | ×1 ngẫu nhiên, **1/tuần** | tỉ giá 10:1 |
| (có sẵn) túi trận / Rương Vàng | 1,8% / 3,8% mỗi lượt/thẻ | 0,2% / 0,2% | Đỏ ≈ 1/9–1/19 của Vàng |

Một lần tối đa: 30 Vàng + 5 Đỏ. Thường xuyên thêm: ~2,1 Vàng/tuần (nhiệm vụ) + tối đa 3 Vàng + 1 Đỏ/tuần (lò rèn, tốn bản sao + vàng).
Lưu `turret_kt.mh = { sw, moc, tr, trn, bo, ren: {tuan, n}, renN }`; gộp hồ sơ: cờ OR, `sw`/bộ đếm lấy lớn nhất.

## 9. Điểm bất hợp lý cần người dùng quyết (09/11) — **mục 1, 2, 3, 4 (một phần: Ấn Vàng), 6 (một phần: nhiệm vụ tuần), 7 đã sửa ở tiến trình đợt 1 (§10)**

1. **Mốc Đỏ sự kiện quá dễ với người chơi giỏi**: trần 60 điểm/trận đạt từ wave ~45 → 1 700 điểm chỉ cần ~29 trận/tuần (~4/ngày). Giỏi nhận **1 Đỏ/tuần = ~52 Đỏ/năm** chỉ từ sự kiện — nguồn Đỏ lớn nhất của họ, ngang túi trận. Thường (wave 30, 5 trận) hụt sát (≈1 600). Gợi ý: nâng mốc cuối (vd 2 500–3 000) hoặc giảm trần điểm/trận.
2. **Túi thưởng chạm trần 10 lượt ở wave 36**: sau wave 36 chỉ còn +10 vàng/wave; trận wave 60 dài gần gấp đôi trận wave 36 mà bản sao như nhau → người chơi giỏi bị thưởng/phút thấp hơn, lợi thế chỉ đến từ số trận + mốc 1 lần. Gợi ý: nới trần (vd 1 + wave/5, tối đa 14) hoặc thêm lượt theo trùm.
3. **Thiên vị bộ bài làm Đỏ "dễ" tương đối**: 1 thẻ Đỏ trong bộ nhận 55% bản Đỏ rơi ra (chỉ 10 thẻ Đỏ), 1 thẻ Vàng chỉ ~27% (32 thẻ, bộ thường có 2). Tỉ lệ rơi Đỏ = 1/9 Vàng nhưng bản cho thẻ cụ thể chỉ ≈ 1/4,3. Kết hợp Đỏ cần 31 bản vs Vàng 75 → Đỏ MAX chỉ chậm hơn Vàng ~1,5–1,9× (Giỏi 8 vs 5 tháng, Thường ~18 vs ~9,5 tháng). Nếu muốn "Đỏ khó hơn hẳn" thì giảm phần bộ bài cho Đỏ (vd 30%) hoặc tăng bản LV16–17.
4. **Lò rèn Đỏ gần như không dùng được sớm**: cần 10 bản của MỘT thẻ Vàng; bản Vàng ngoài bộ rải đều 30 thẻ (~0,15 bản/thẻ/tuần), còn thẻ trong bộ thì đang cần để lên LV17. Thực tế chỉ mở sau khi đã MAX thẻ Vàng (bản thừa). Tương tự lò rèn Vàng (30 bản 1 Sử thi) cạnh tranh với 160 bản Sử thi cần để MAX. Ổn nếu cố ý là "cửa xả bản thừa"; nếu muốn là nguồn thật thì cho dùng bản của nhiều thẻ.
5. **Vàng (tiền) dư cho người chơi giỏi**: ~48 000 vàng/tuần, cả bộ MAX ~630 000 ≈ 13 tuần trong khi bản sao cần 5–8 tháng → vàng chất đống; chỗ tiêu duy nhất có ý nghĩa là ô Đỏ 60 000 (mua được gần như mỗi tuần). Specials Đỏ vì thế thành nguồn đều ~0,1 bản thẻ cụ thể/tuần. Có thể chấp nhận (thưởng chơi nhiều) hoặc thêm chỗ tiêu vàng.
6. **Ngọc không theo trình độ**: ~460/tuần ở cả 2 mức (chỉ nhiệm vụ/điểm danh/sự kiện); thành tựu wave 50/70 là 1 lần. Ổn với mục tiêu bán ngọc sau này.
7. **Nhiệm vụ "Reach wave 30"** khó với người chơi mới/thường dưới wave 30 → hôm trúng nhiệm vụ này mất cả thưởng đủ 3 (+20 ngọc). Gợi ý: không tính nó vào điều kiện "đủ 3", hoặc chỉ đưa vào bể khi kỷ lục ≥ 25.

## 10. Tiến trình đợt 1 (09/11 — `thap/js/tientrinh.js` + chỉnh `kinhte.js` / `thebai.js` / `manh.js`; thiết kế `tuvan/tien-trinh/THIET-KE.md`; kiểm `tools/thap-kt-tien-trinh.js`)

Quyết định người dùng: khoá MỌI bậc theo cấp; Ấn Vàng 6:1; mốc Đỏ sự kiện 3 600; không năng lượng; hành trình không thưởng Đỏ.

| Phần | Số | Ghi chú |
|---|---|---|
| XP mỗi trận | wave + 3 × trùm hạ + 10 nếu thắng | mọi chế độ (trừ hướng dẫn / trận thử ?mana=) |
| XP lên cấp L → L+1 | 20 + 15·L (cấp 2 = 35 · 3 = 85 · 6 = 325 · 8 = 560 · 12 = 1 210 · 30 = 7 105 cộng dồn) | sau cấp 30: mỗi 1 000 XP = Rương Thường + 300 vàng |
| Thưởng mỗi cấp | 150·L vàng + 20 ngọc; cấp 5/10/15/20/25/30 + Rương Vàng | 1 lần (2→30 ≈ 69 600 vàng · 580 ngọc · 6 Rương Vàng) |
| Mở bậc ụ | Trắng + Xanh: xong/bỏ qua hướng dẫn · Tím: cấp 3 · **Vàng: cấp 6** (+ quà chọn 1 trong 3 thẻ Vàng × 1) · **Đỏ: cấp 12 VÀ kỷ lục ≥ wave 30** | ụ khoá vẫn xem được (thẻ tối + "PILOT LV n"), không vào bộ bài |
| Người chơi cũ | cấp khởi điểm theo kỷ lục mọi chế độ: ≥ 30 → 12 · ≥ 20 → 8 · ≥ 10 → 5 · có bản lưu → 3 | ụ trong bộ bài + 6 bộ mẫu lúc chuyển được giữ (`cp.giu`); cấp có sẵn không phát lại thưởng |
| Hành trình 7 ngày | 3 việc/ngày (chỉ nêu kết quả), ngày N mở sau N−1 ngày lịch, làm bù được | tổng ≈ 4 800 vàng · 190 ngọc · Rương Thường · Rương Vàng · 4 Sử thi (chọn 1/3) · 2 bản Vàng (chọn 1/3) · **0 Đỏ** |
| Nhiệm vụ tuần | 5 × 20 ngọc + đủ 5 = 40 ngọc + 1 bản Vàng | +140 ngọc/tuần (mở cấp 8) |

Lưu `turret_kt.cp = { v, xp, cu, giu, nhanCap, dv, qv, daMo, bao, hj: {ngay0, nhan}, dem, trk, nvt: {tuan, tien, nhan, bonus} }` (khoá mới; `turret_kt.tt` là cờ thành tựu — không đụng).
Gộp hồ sơ Firebase: XP / cấp đã thưởng / bộ đếm lấy lớn nhất, cờ (giu, daMo, trùm đã hạ, hành trình, nhiệm vụ tuần) OR, ngày bắt đầu hành trình lấy sớm nhất;
bản mạng của bản game cũ (chưa có `cp`) → quy đổi theo kỷ lục như người chơi cũ (đổi máy không tụt cấp). Nhãn nguồn mới của `KT.cong`: `level`, `journey`.
Chưa làm ở đợt 1 (theo thiết kế §2.2): khoá chế độ theo cấp (PVP/ONLINE/Leo Tháp…), khoá Lò rèn ở cấp 10 — người dùng chưa chốt.

