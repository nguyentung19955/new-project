# Đưa 4 quái Rừng già vẽ lại (đủ 6 động tác) vào game (14/10 22:40)

Ảnh đã cắt sẵn (nền trong suốt, mỗi khung một tệp) ở `docs/anh-goc/quai-moi/dong-tac/<mã>-<bước>-cat/<hàng>/khung-NN.png`, mã: `heoCon`, `heoNanh`, `chonBong`, `boHung`:
| Bước | Thư mục | Số khung | Hàng sprite |
|---|---|---|---|
| 1 Đứng thở | `<mã>-1-dung-cat` | 6 | idle |
| 2 Đi | `<mã>-2-di-cat` | 6 | move |
| 3 Báo đòn | `<mã>-3-bao-don-cat` | 6 | tele |
| 4 Đánh | `<mã>-4-danh-cat` | 6 | atk |
| 5 Trúng đòn | `<mã>-5-trung-don-cat` | 4 | hit |
| 6 Chết | `<mã>-6-chet-cat` | 6 | die |
Ảnh mẫu từng con: `docs/anh-goc/quai-moi/<mã>-mau-moi.png`. GIF xem thử: `xem-thu-*.gif` cùng thư mục.

Việc:
1. Dựng lại `game/art/custom/<mã>.sprite.json` (thay tấm cũ, giữ đúng định dạng các tấm quái hiện có: `tam`, `dong_tac` với hang/so/giay/lap, `khung_rong`/`khung_cao`, `rong`/`cao`, điểm neo chân, `can_tam` như phiên `trum-chet-pha3`). Mỗi bước được AI gen ở cỡ khác nhau → **chuẩn cỡ theo thân con quái** (lấy hàng idle làm chuẩn: chiều cao thân / chiều rộng thân trung vị của từng hàng đưa về bằng idle; hàng hit khung 1 và hàng die được phép cao/thấp hơn vì là dáng thật). Thu nhỏ về đúng cỡ hiển thị của con đó trong game hiện tại (đo từ tấm cũ: chiều cao thân khi đứng), dùng LANCZOS rồi lượng tử về bảng màu như các tấm khác; giữ viền sắc.
2. Căn chân: mọi khung cùng đường đất (đáy thân), tâm thân trùng điểm neo (đo và ghi `can_tam` từng khung). Không để hình nhảy khi đổi hàng.
3. Thời gian: idle ~1,2 s/6 khung lặp, move theo tốc độ đi của vai, tele/atk khớp mốc báo trước và ra đòn hiện tại của kỹ năng mới (`js/ky_nang_quai.js` — Heo Con Húc thẳng, Chồn Bóng Lẩn bóng, Bọ Hung Lăn cầu đất; Heo Nanh là tinh anh, xem `thinkElite` + `chieu_trum.js`), hit ~0,35 s, die ~0,9 s rồi mờ. Hàng nào game còn cần mà chưa có (ví dụ `chieu1` của tinh anh Heo Nanh) thì dùng lại hàng gần nhất (atk/tele) — ghi rõ trong báo cáo, KHÔNG vẽ code.
4. Cờ `?quaicu=1` → dùng lại 4 tấm cũ (giữ tấm cũ dưới tên khác hoặc trong lịch sử git — chọn cách không làm phình ảnh người chơi tải).
5. Ảnh soát tĩnh `xem-4-con.png`: mỗi con 6 hàng × khung, cùng tỉ lệ, có vạch đường đất; và `xem-4-con.gif` cả 4 con chạy lần lượt 6 động tác ở cỡ trong game ×3.
6. Dung lượng: báo "người chơi tải" trước/sau (trần 20 MB, theo `build.py`).

**TUYỆT ĐỐI KHÔNG TEST** — chỉ xử lý ảnh, ảnh soát tĩnh, node --check, build.py. KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Viết `bao-cao.md`.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
