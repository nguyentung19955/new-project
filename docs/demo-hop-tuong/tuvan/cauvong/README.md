# Cầu vồng / hiệu ứng chạy dọc làn qua GÓC RẼ

Lỗi: vệt cầu vồng (ụ Rainbow, `HU.cauvong` – skills2.js) vẽ bằng các lát ảnh `hu_cauvong` 8.6 px đặt ở điểm lấy mẫu mỗi 8 px,
mỗi lát xoay theo hướng đoạn → tới góc 90° thì 2 đoạn thẳng rời nhau (góc ngoài hở, góc trong chồng, ray kim loại và dải màu không nối).

Sửa (chỉ dùng PNG ChatGPT có sẵn, code chỉ đặt/xoay/cắt):
- `veDaiDuong()` (skills2.js): đoạn thẳng = ảnh lặp theo độ dài đường; góc rẽ = khúc cong gồm các lát ảnh mỏng xoay quanh tâm bên trong góc
  (bán kính trong 8 px) → ray + dải màu uốn liền, bo tròn khớp với góc bo của làn. Toạ độ ảnh nối tiếp theo s (không bắt đầu lại mỗi đoạn, không lật).
- Vẽ đục vào canvas phụ rồi dán 1 lần với độ mờ 0.85 → chỗ nối không sáng gấp đôi. Vẽ lại canvas phụ khi ảnh trôi ≥ 3 px ảnh (≈20 lần/s) → fps 60.
- Đầu vệt mọc 0.5 s: đi qua góc thì quẹo theo khúc cong (ảnh `*_dau0..5`).
- Cầu vồng là VỆT trên đường (không phải tia ụ → mục tiêu) nên phải uốn theo làn; không có tia cầu vồng nào bắn từ ụ.

Cùng lỗi: hơi thở Leviathan (`SIG.tho`, sigfx.js) — dải `sig_m07_breath` đặt thẳng đè qua đỉnh góc → 2 khối lệch.
Sửa: bỏ lát thẳng trong ±22 px quanh đỉnh góc, đặt ảnh khúc cua ChatGPT có sẵn `sig_m07_corner` (4 khung mọc theo đầu sóng), xoay theo làn, lật khi rẽ trái.

Ảnh: `truoc_cacgoc.jpg` / `sau_cacgoc.jpg` (SOLO, CO-OP, PVP: mọi góc + dải đầu vệt), `truoc_sau.jpg`, `leviathan_truoc_sau.jpg`.
Kiểm: `TAG=sau OUT=docs/demo-hop-tuong/tuvan/cauvong/ node tools/thap-kt-cauvong.js` (390×844 DPR3) — fps solo/coop/pvp 60/60/60, không lỗi trang.
