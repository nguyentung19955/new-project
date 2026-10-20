> **Cập nhật 2026-10-20:** quy tắc khoá mắt / khoá gót dưới đây đã được THAY trong game (đo thấy gây giật 14–24 px) — xem `docs/fix-animation.md`.

# Vì sao trước đây giật, và cách sửa (áp dụng cho mọi animation chibi)

1. **Căn ngang sai mốc.** Trước căn theo giữa 2 bàn chân → khi chạy chân đổi chỗ nên cả người trượt ±17 px (ô 512). Sửa: **chạy/đi = khoá theo đầu/mắt** (thân đứng yên, chỉ chân tay chuyển động – cách các game 2D làm "run tại chỗ"); **tấn công = khoá theo gót chân sau** (chân trụ đứng yên, thân lao tới).
2. **Nhịp đều quá nhanh.** Tấn công trước để mỗi khung 71 ms. Game hành động dùng **thời lượng khác nhau từng khung**: chuẩn bị 120 ms → vung 60 ms → chạm 140 ms (dừng hình) → thu 140 ms. Chạy: 8 khung, 10–12 FPS (83–100 ms/khung).
3. **Cỡ:** mọi khung cùng 1 hệ số theo cỡ mắt (đã đúng); dọc luôn chạm đất y=500.
4. `rut-dao` = động tác **rút dao khi vào ải** (không phải tra dao).
