# Ảnh bị MỜ trên iPhone (DPR 3) — đo, nguyên nhân, đã sửa — 05/11/2026

Người dùng: "ảnh đều là ảnh nét sao đưa vào game nhiều chỗ thấy bị mờ vậy".
Đo bằng **`tools/thap-kt-net.js`** (Playwright, 360×780 / 390×844 / 430×932, DPR 3): đi qua màn tải, NHÀ, bảng chế độ / chỉ huy /
bộ mẫu / lọc / cài đặt, bộ bài (+ cuộn), xem ụ, bộ sưu tập, hồ sơ ụ (+ khung xem trước), hồ sơ chỉ huy, hồ sơ phi công, sảnh online,
trận SOLO / CO-OP / PVP (17 bộ bài phủ 85 ụ, bảng ụ mở) và màn kết quả. Với mọi `<img>` / `background-image` / `border-image`
(9 mảnh: xét góc + mép, vùng giữa cố ý giãn 1 chiều) / `canvas` / mọi `drawImage` (lần theo cả bộ đệm thu nhỏ, iframe xem trước):
**tỉ lệ = điểm ảnh màn / điểm ảnh PNG** (> 1.05 = bị phóng = mờ), canvas: `canvas.width` / (cỡ CSS × DPR), `imageSmoothingQuality`,
`filter: blur`. Ảnh tia/dải kéo dài chỉ xét chiều ngang. Kết quả JSON: chạy lại `node tools/thap-kt-net.js /tmp/net.json 390 844`.

## Nguyên nhân (lời thường)
1. **Cả bàn trận tự hạ độ nét 3× → 2×.** Game đo tốc độ khung; hễ trung bình > 18 ms suốt 3 s là vẽ bằng 2× tới hết phiên.
   iPhone ở chế độ Nguồn điện thấp (Safari khoá 30 khung/giây) hoặc vài cú giật lúc nổ trùm là "trúng" ngay → mọi ụ, quái, khay, hiệu ứng
   bị phóng 1.5× (mờ cả màn). Mô phỏng 30 Hz: bản cũ tụt 2× sau ~5 s; bản mới giữ 3× (thời gian JS mỗi khung chỉ 1–5 ms).
2. **Khung xem trước kỹ năng (trang ụ) luôn vẽ 2×** (`&dpr=2` cố định trong unitpage.js).
3. **Bộ đệm ảnh trên canvas dùng lọc chất lượng thấp**: canvas tạo bằng `getContext('2d')` trực tiếp, hoặc sau khi đổi `width/height`,
   mặc định `imageSmoothingQuality = 'low'` → ảnh thu nhỏ vào bộ đệm lấm tấm/mềm. Đo: 42 ảnh vẽ bằng 'low' → 0.
4. **Nhiều ảnh UI cắt ở ~1–2× cỡ hiển thị** (nút, tấm, khung 9 mảnh, huy chương, LCD mana, tấm tên…) → iPhone phóng 1.2–3.2×.
5. **Hiệu ứng đánh v2 cắt nhỏ (96/128 px, tia 512 px)** dù tấm raw nét hơn → phóng 1.3–4.5×.
6. **Một số ảnh gốc ChatGPT quá nhỏ** cho chỗ hiển thị lớn nhất (chân dung phi công ở hero trang ụ, đầu súng ở trang ụ, chỉ huy ở NHÀ,
   nền 1024×1536…) → không cắt nét hơn được, phải gen lại: **[CAN-VE-LAI.md](CAN-VE-LAI.md)**.

Không thấy: `filter: blur` / `transform: scale > 1` tĩnh trên ảnh (chỉ trong hoạt ảnh vài trăm ms), JPEG nén nặng (chỉ 3 nền .jpg).

## Đã sửa
- `thap/js/render.js` `REN.doKhung`: chỉ lùi 2× khi **thật sự không giữ nổi 45 khung/giây VÌ VẼ NẶNG** (TB khoảng khung > 22 ms suốt 5 s
  **và** TB thời gian JS > 11 ms). `thap/js/ui.js` ghi `REN._viec` (thời gian JS của khung). Canvas trận = CSS × DPR (tối đa 3), `setTransform`
  theo `R.s × dpr` như cũ.
- `thap/js/donet.js` (nạp ĐẦU TIÊN): mọi ngữ cảnh 2D `imageSmoothingQuality = 'high'` (cả sau khi đổi cỡ canvas). Ảnh DOM
  (`<img>`, innerHTML) tải kèm `?v=băm` trên bản xuất bản → điện thoại không dùng PNG cũ cỡ nhỏ trong bộ đệm.
- `tools/thap-ver.py`: thêm băm cho `url(../assets/…)` trong CSS và ảnh tĩnh trong index.html (border-image slice đổi theo ảnh mới).
- `thap/js/unitpage.js`: khung xem trước dùng DPR thật (bỏ `&dpr=2`).
- **Cắt lại từ tấm ChatGPT raw** (`tools/thap-net-cat.py` → lam() của thap-cat-3x: so mẫu vùng cũ trong raw, khoá magenta, Lanczos
  nhân-trước-alpha, kiểm IoU/màu với ảnh cũ) ở 3× cỡ CSS lớn nhất (đo ở 430 px), số slice `border-image` nhân cùng hệ số
  (kiểm tự động: mọi phần tử, slice sau = slice trước × k — 0 lệch):

| ảnh | tỉ lệ trước (390, DPR3) | sau | cỡ PNG |
|---|---|---|---|
| `h2_mv_huy` | 3.17 | 0.90 | 160×168 → 563×592 |
| `h2_chip` | 1.63 | 0.89 | 109×40 → 198×73 |
| `h2_chip_tat` | 1.63 | 0.89 | 110×40 → 200×73 |
| `h2_lcd` | 1.27 | 0.81 | 331×116 → 519×182 |
| `h2_khay_doi` | 1.23 | 0.89 | 420×96 → 578×132 |
| `h2_tam` | 1.50 | 0.91 | 225×56 → 372×92 |
| `h2_tam_xanh` | 1.15 | 0.70 | 218×72 → 360×119 |
| `h2_tam_do` | 0.88 | 0.54 | 251×80 → 414×132 |
| `nut_lon_thep` | 1.90 | 0.92 | 216×96 → 455×202 |
| `nut_lon_vang` | 1.90 | 0.92 | 221×96 → 458×199 |
| `khung_tt` | 0.73 | 0.66 | 255×144 → 286×162 |
| `khung_bang` | 1.36 | 0.90 | 236×240 → 359×366 |
| `nen_hud_duoi` | 1.36 | 0.90 | 860×220 → 1306×334 |
| `hud_trum_khung` | 2.35 | 0.89 | 118×40 → 311×105 |
| `ic_solo` | 1.36 | 0.89 | 96×96 → 147×147 |
| `ic_coop` | 1.36 | 0.89 | 96×96 → 147×147 |
| `mui_tiep` | 1.23 | 0.89 | 51×48 → 70×66 |
| `logo` | 1.16 | 0.89 | 704×288 → 914×374 |
| `ic_lui` | 1.13 | 0.90 | 96×96 → 121×121 |
| `de_chung` | 1.32 | 0.89 | 256×256 → 381×381 |
| `chon_de_xanh` | 1.41 | 1.06 | 300×203 → 401×271 |
| `h2_burst` | 2.72 | 0.93 | 154×71 → 452×208 |
| `nut_lon_xanh` | – | – | 220×96 → 461×201 |
| `nhan_kn` | 4.19 | 2.37 | 226×96 → 376×160 |
| `hud_ten_ban` | 1.69 | – | 178×70 → 333×131 |
| `ui_gia` | 2.31 | 0.91 | 84×40 → 212×101 |
| `h2_tag` | 1.40 | 0.92 | 74×30 → 122×50 |
| `sao_chu` | 0.67 | 0.22 | 64×58 → 197×178 |

- **Hiệu ứng đánh v2**: chạy lại phép cắt của `tools/thap-cat-fxv2.py` ở 3× cỡ cũ (giới hạn độ nét raw), 415 ảnh `fx_<ụ>_*` + 18 tia
  `fx_*_tia` (512 → 952–1099 px, giữ tỉ lệ), giữ ảnh nào lệch so với bản cũ; `js/fxu-meta.js` cập nhật cỡ (chỉ dùng tỉ lệ).
  Ví dụ: `fx_canon_trung` 2.83 → 1.18, `fx_overlord_dan3` 4.48 → 1.52, `fx_st_yeu` 2.08 → 1.06.

## Đo lại (sau)
| | 360 | 390 | 430 |
|---|---|---|---|
| canvas thiếu điểm ảnh (canvas / CSS×DPR) | 0 (tối đa 1.000) | 0 | 0 |
| ảnh còn phóng > 1.05 | 39 | 95 | 62 |
| — trong đó CHƯA liệt kê ở CAN-VE-LAI | **0** | **0** | **0** |
| lọc 'low' | 0 | 0 | 0 |
| lỗi trang | 0 | 0 | 0 |

(390 chạy đủ 17 trận + 10 hồ sơ ụ; 360/430 chạy nhanh 3 trận + 3 hồ sơ.) Cùng phạm vi 390 (QUICK): cờ 100 → 54, tất cả 54 thuộc danh sách vẽ lại.

## Khung hình / bộ nhớ (390×844, ép ?dpr=3, wave 12, bàn 9 ụ) — `node tools/thap-kt-net-fps.js`
Máy đo là Chromium headless **không có GPU** (vẽ canvas bằng CPU) nên fps ở đây chỉ là cận dưới, không so được với iPhone.
Chỉ số so được: **thời gian JS mỗi khung** — SOLO TB 2.3 ms (p95 5.7), CO-OP 5.2 (13.4), PVP 6.3 (12.4) → dư xa ngân sách 20 ms (50 fps).
Độ phân giải canvas KHÔNG đổi so với trước khi máy giữ được 3× (1170×2340); thay đổi chỉ là không còn tụt nhầm về 2×.
Bộ nhớ (REN.boNho): ảnh gốc 41.8–48.3 → 47.2–54.0 MB, canvas 62.5–83.4 → 66.5–92.1 MB (+6–12 MB) — trong ngân sách cũ (phiên min3x: TB 139 MB).
Mô phỏng iPhone 30 Hz (`tools/thap-kt-net-chup.js`): bản cũ REN.dpr = 2, bản mới = 3.

## Ảnh trước | sau (cắt 1:1 điểm ảnh màn DPR 3, phóng ×2 điểm-ảnh-gần khi nhỏ)
Trận mô phỏng iPhone 30 Hz như máy thật (bản cũ tự lùi 2×). `tong-hop.jpg` = tất cả.
01 hero NHÀ (chưa đổi — cần vẽ lại) · 02 nút chế độ · 03 ô bộ bài · 04 thẻ bộ sưu tập · 05 bảng chế độ · 06 hero trang ụ (chưa đổi — phiên hero) ·
07 ụ trang ụ (bệ mới; đầu súng cần vẽ lại) · 08 huy chương chỉ huy · 09 nút thép · 10 thẻ khay trận · 11 ụ trên bàn · 12 quái/nổ ·
13 LCD mana · 14 bàn CO-OP · 15 bàn PVP · 16 nút kết quả.

## Công cụ
- `tools/thap-kt-net.js` — đo (JSON: co = cờ, raw = lý do đã liệt kê; brd = slice từng phần tử để kiểm khi đổi ảnh 9 mảnh)
- `tools/thap-net-cat.py` — cắt lại ảnh UI (+ nhân slice CSS); `tools/thap-net-cat.json` cỡ cũ → mới; `KREL=1.1 FORCE=1` nâng thêm
- `tools/thap-kt-net-chup.js` + `tools/thap-kt-net-ghep.py` — ảnh trước | sau; `tools/thap-kt-net-fps.js` — khung hình/bộ nhớ
- `tools/thap-kt-net-bo.json` — ảnh chờ vẽ lại (CAN-VE-LAI.md)
