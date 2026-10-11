# Đợt 4 — Bảng màu lõi 32 + 12 màu hệ (Q6)

Đọc `CHUNG.md`, `QUYET-DINH-Q1-Q6.md` mục Q6 (+ II, IV), `docs/review/ra-soat-my-thuat/bao-cao.md` mục 2 và 6, `docs/review/ra-soat-my-thuat/bang-mau.json` (32 màu lõi + 12 màu hệ đã lấy mẫu từ PNG gốc, có ghi nguồn từng màu). Dự kiến 1,5–2 giờ. Tệp được sửa: `docs/vfx/BANG-MAU.md` (hoặc tạo `docs/vfx/BANG-MAU-LOI.md` nếu tệp cũ dùng cho mục đích khác), **mọi** `tools/tach-*/index.html` trừ `tach-ghep` (phần sinh prompt + tuỳ chọn giảm màu), `tools/xuong-sprite` KHÔNG đụng. KHÔNG sửa `game/js/*`, KHÔNG sửa ảnh trong `game/art/custom`, KHÔNG đổi hành vi mặc định của công cụ với lô cũ.

## Làm
1. **Tài liệu bảng màu** (`docs/vfx/BANG-MAU-LOI.md`): bảng 32 màu lõi theo nhóm (da, tóc, gỗ, đá, kim loại, vải, cỏ cây, nước, lửa, bóng) + 12 màu hệ (Lửa/Độc/Băng × nhạt/chính/đậm/lõi sáng), mỗi màu: ô màu (ảnh PNG `docs/vfx/bang-mau-loi.png` tự vẽ bằng Pillow, 44 ô có mã hex), mã hex, vai trò, nguồn (lấy mẫu từ asset nào / ước lượng / đề xuất mới). Quy tắc dùng: viền ngoài luôn `#14182e`; hiệu ứng của người chơi lõi `#fbfed0`; hiệu ứng của quái dùng nấc đậm; mỗi vật tối đa 3 sắc một chất liệu.
2. **Đoạn màu trong prompt**: thêm vào hàm sinh prompt của từng trang `tach-*` một đoạn ngắn "BẢNG MÀU (bắt buộc bám theo): …" liệt kê **chỉ các nhóm màu liên quan đến lô đó** (ví dụ lô cửa: gỗ, đá, kim loại, bóng; lô hiệu ứng: hệ + lõi sáng; lô người làng: da, tóc, vải) với mã hex, cộng câu "viền ngoài một nét `#14182e`". Không nhồi cả 44 màu vào mọi prompt. Tách Hiệu Ứng đã có `BAN_MAU` cho mục B2 — dùng chung nguồn, không trùng lặp câu.
3. **Tuỳ chọn giảm màu theo bảng** trong công cụ: thêm ô chọn "Giảm màu: Tự do (như cũ) / Theo bảng màu Linh Khí". Mặc định **Tự do** để lô cũ không đổi. Chế độ "Theo bảng": sau bước giảm màu hiện có (`giamMau`, median cut), ánh xạ mỗi màu kết quả về màu gần nhất trong bảng (44 màu + viền `#14182e` + trắng/đen) **chỉ khi khoảng cách màu nhỏ hơn ngưỡng** (ví dụ ΔE ≈ 18 trong Lab hoặc khoảng cách RGB ≤ 60); màu xa hơn giữ nguyên để không bệt. Ghi rõ trong phần "kết quả kiểm" của trang: số màu đã khớp bảng / tổng.
4. **Lô thử 2 vật thể môi trường** (tiêu chí Q6): tự dựng 2 ảnh mẫu (ví dụ rương và bàn thờ từ lô A1) bằng cách vẽ pixel đơn giản theo bảng mới, chạy qua Tách Phòng ở cả hai chế độ, đặt cạnh quái `boHung` và em bé `em-be-smith` trong một ảnh so sánh `anh/so-sanh.png` (phóng 4×). Đây là ảnh để chủ dự án duyệt bằng mắt — không phải ảnh đưa vào game.
5. Cập nhật `docs/review/ra-soat-my-thuat/bang-mau.json` nếu phải đổi mã màu nào (ghi lý do).

## Nghiệm thu
- Mọi trang `tach-*` (trừ ghép): mở không lỗi console; prompt của 1 lô bất kỳ có đoạn bảng màu đúng nhóm; chế độ "Tự do" cho kết quả **y hệt** trước đợt này (so tệp xuất của cùng một ảnh mẫu: giống từng byte hoặc từng điểm ảnh).
- Chế độ "Theo bảng" với ảnh mẫu: không mất viền, không mất chi tiết, số màu khớp bảng ≥ 70%.
- `docs/vfx/BANG-MAU-LOI.md` + `bang-mau-loi.png` đọc được, 44 màu đủ nguồn.
- Báo cáo `docs/review/ke-hoach-cai-thien/dot-4/bao-cao.md` theo mục IV, kèm `anh/so-sanh.png`, và câu hỏi duyệt: "bảng màu này dùng từ lô mới trở đi?".
