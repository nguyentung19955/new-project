# Tích hợp bộ Zed mới vào game (13/10/2026)

Chủ dự án đã DUYỆT toàn bộ ảnh Zed mới và cách gắn vũ khí. Việc của phiên này: đưa vào game, thay hình Zed cũ.

## Luật bắt buộc
- Nhánh `khoi-tao-du-an` (push là tự deploy). KHÔNG đụng master, KHÔNG force push, KHÔNG PR.
- **KHÔNG TEST**: không chạy Playwright, không chạy game, không chạy test. Chỉ sửa code + asset rồi push để chủ dự án tự xem. (Chạy script Python để dựng ảnh thì được.)
- Không chép apiKey trong `game/js/firebase-config.js` ra chỗ khác. Không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`.
- Giữ nguyên NHỊP ĐÁNH (thời lượng, hitAt, combo) trong `moves.js`/`combat.js`; chỉ đổi cách chọn khung hình.
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
- Xong thì viết `bao-cao.md` cạnh file này (tiếng Việt, có mã commit), push, rồi dừng.

## Nguồn ảnh (đã cắt sẵn theo hình, PNG trong suốt)
`docs/anh-goc/zed/moi/<ten>-gif/<ten>/khung-NN.png` — mỗi động tác 1 thư mục.
Dùng các bản sau (bản khác bỏ qua):
| Động tác | Thư mục `<ten>` | Khung |
|---|---|---|
| Đứng | 01-dung | 8 |
| Đi bộ (MỚI, code chưa có) | 02-di | 8 |
| Chạy | 03-chay | 8 |
| Lộn né | 04-lon | 6 |
| Trúng đòn | 05-trung-don | 4 |
| Chết | 06-chet-b2 (người vẽ nhỏ hơn → phóng cho cùng chiều cao với tấm đứng) | 8 |
| Chưởng | 07-chuong-b2 | 6 |
| Kiếm nhát 1/2/3 | 08-kiem-1-b3 / 09-kiem-2 / 10-kiem-3 | 5/5/6 |
| Thương đâm 1/2/3, quét | 11-thuong-1 / 12-thuong-2 / 13-thuong-3 / 14-thuong-quet | 6 mỗi đòn |
| Thương giữ đà / Xốc tới | 15-thuong-giu / 16-thuong-xoc | 3 / 4 |
| Búa nện / giữ đà / nện đất | 17-bua-nen / 18-bua-giu / 19-bua-nen-dat | 8/4/6 |
| Phi tiêu ném / ngắm / chùm (thay CUNG) | 20-phi-tieu / 21-phi-tieu-ngam / 22-phi-tieu-chum | 6/3/6 |
| Đặc biệt: Trảm Nguyệt / Phi Thương / Địa Chấn / Mưa phi tiêu | 23-tram-nguyet / 24-phi-thuong / 25-dia-chan / 26-mua-phi-tieu | 6 mỗi đòn |
| Đấm (tay không) | 27-dam | 5 |

Vũ khí (4 cấp = `G.STAGE_NAMES` Trắng/Mầm/Thành hình/Thức tỉnh, mỗi cấp 1 khung):
`vk-kiem-moi`, `vk-thuong`, `vk-bua`, `vk-phi-tieu` (cùng chỗ `moi/<ten>-gif/<ten>/khung-0N.png`). Màu trung tính; giữ cơ chế nhuộm theo hệ nếu game đang có.

## Gắn vũ khí (ĐÃ DUYỆT — làm đúng như ảnh thử)
- Điểm cầm + góc từng khung: `docs/anh-goc/zed/gan-vk/neo.json`; cách ghép chuẩn: `docs/anh-goc/zed/gan-vk/ghep-thu-vk.py` (đọc kỹ: chuôi/điểm cầm `cam`, độ dài `dai` so chiều cao Zed, cờ `sau` = vũ khí nằm sau người, `tay2` = tay thứ hai được vẽ đè lên cán, khung `null` = không vũ khí). Ảnh đã duyệt: `gan-vk/tong-*.png`, `thu-*.png`.
- Toạ độ neo theo ẢNH KHUNG ĐÃ CẮT (nguồn). Khi đóng khung 96×96 (game 48×48, neo chân (24,45) theo khung game = (48,90) nguồn 96) phải quy đổi toạ độ neo theo cùng phép co/dịch và ghi rõ hệ toạ độ.
- Trong game: vẽ người → vẽ vũ khí theo neo khung hiện tại (xoay quanh điểm cầm) → vẽ lại nắm tay đè lên (hoặc vũ khí trước người khi `sau`=0, sau người khi `sau`=1). Hình vũ khí theo cấp hiện tại.
- Phi tiêu: ném tay không, game vẽ phi tiêu bay (đạn) bằng ảnh `vk-phi-tieu` cấp hiện tại, xoay khi bay. Phi Thương: khung 3–6 không có thương trong tay.
- Khi Zed quay trái thì lật cả người + vũ khí.

## Việc code
1. Dựng sprite sheet Zed mới (mỗi động tác 1 hàng, khung 96×96 nguồn, chân trùng (48,90), CÙNG tỉ lệ co cho mọi động tác theo chiều cao tấm đứng) + `.sprite.json` theo chuẩn `game/art/custom/*.sprite.json` (`net` 2, `goc` [24,45], `dong_tac`). Lưu script dựng vào repo để chạy lại được.
2. Thay hình Zed cũ bằng bộ này (giữ cờ tắt kiểu `?zed=0` hoạt động nếu đang có).
3. Bảng mốc khung theo tiến độ `u` cho từng đòn mới; khung ★ (tư thế chạm) phải hiện đúng lúc `u = hitAt`. Sửa lỗi L3 (chưởng tính theo 0,4 thay vì castT 0,3) và L1 (búa nện chạm 0,35 nhưng hình đặt 0,45) — chỉ sửa cách chọn khung. Tham khảo `docs/review/ke-hoach-cai-thien/zed-trang-phuc/BANG-ANIMATION.md`, `MOC_DON` ở `sprite_custom.js:585`.
4. Kiếm combo 3 nhát dùng 3 hàng riêng (08/09/10), chọn theo `comboI`. Thương 4 nhịp: 11/12/13/14. Giữ đà dùng 15/18/21 (lặp khi giữ). Thả: 16 xốc tới, 19 nện đất, 22 ném chùm.
5. Thêm trạng thái ĐI BỘ (02-di) khi đẩy cần nhẹ / tốc độ thấp; chạy (03) khi nhanh. Không đổi tốc độ di chuyển.
6. Đổi CUNG thành PHI TIÊU (giữ y nhịp cung: 0,38/0,45 s, hitAt 0,45, giữ 0,75 s). Tên hiển thị đổi thành Phi tiêu.
7. Đòn đặc biệt dùng hàng 23–26 (specT 0,35); Đấm dùng 27.
8. Đang chạy mà đánh: giữ cách hiện tại (thân hàng chạy, chỉ vũ khí vung theo neo khung đánh đầu tiên là đủ).
9. 160 ảnh vũ khí `vk-*` cũ: không xoá file, chỉ không dùng cho Zed nữa (mỗi loại 1 món × 4 cấp).
