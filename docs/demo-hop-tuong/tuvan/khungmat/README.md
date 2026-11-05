# Khung mặt ô nhỏ — "Nhiều hình bị zoom quá đà" (tile_zoom_qua.png)

- truoc_sau_360/390/430.jpg — 20 phi công khó nhất, ô kho / ô bộ bài / khay trận, TRƯỚC (bản người dùng thấy) và SAU, cạnh mẫu DCDW (dcdw_the_toigian.png).
- truoc_qa.jpg — bảng soát bản cũ: 1382 lỗi (746 "phóng quá — cả đầu > 60 %", 630 tóc sát/bị cắt, 6 cằm bị cắt), cả 88 chân dung.
- sau_qa.jpg — bản mới, mọi chỗ chứa (kho, bộ bài, ô chỉ huy, xem nhanh, trang ụ, trang chỉ huy, khay, bảng chạm, dải đồng đội, thẻ chỉ huy) × 360/390/430 DPR 3: 0 lỗi.
  Vạch: đỏ = mắt · xanh lá = đỉnh tóc · xanh dương = cằm · vàng = vùng thấy (cửa sổ trừ viền đè).
- Luật: thap/js/chandung.js (datDau) — mốc cằm mới trong PO_NEO[id][3]. Chạy lại: `SIZES=360x780x3,390x844x3,430x932x3 node tools/thap-kt-chandung.js`.
