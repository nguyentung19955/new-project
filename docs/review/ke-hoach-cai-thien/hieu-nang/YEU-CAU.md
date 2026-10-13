# Yêu cầu: dọn tệp không dùng + kiểm và tối ưu hiệu năng (chủ dự án 13/10 15:31)

"File nào không dùng nữa dọn đi, tiến hành check performance nữa, tối ưu được thì tối ưu."
Làm SAU phiên "Dọn code thừa" (`don-code/bao-cao.md`) và nên sau "Đợt 5 bot cân bằng" (`he-thong-moi/bao-cao-5.md`) nếu phiên đó còn sửa `data.js` — git pull, đọc báo cáo trước.

## A. Dọn tệp không dùng (toàn repo)
- `game/art/custom/*.sprite.json`, `game/art/**`, `game/js/*.js`, `game/tests/*`, `tools/**`, `dist/**`: tệp nào KHÔNG còn được nạp/tham chiếu (index.html, build.py, mã js, công cụ còn dùng) → xoá. Dò bằng grep tên tệp/mã; tệp nạp theo tiền tố/ghép chuỗi (vd. `'hu-' + ...`, `'zed-' + bo`) phải kiểm kỹ trước khi xoá.
- `game/tests/`: bài kiểm cho nhân vật/hệ thống cũ không còn chạy được → xoá; bài còn dùng (dps, campaign, cay… phiên đợt 5 vừa sửa) GIỮ.
- `docs/anh-goc/**` là ẢNH GỐC chủ dự án gen: KHÔNG xoá ảnh gốc của Zed, trang phục, hiệu ứng, trùm mới. Chỉ được xoá: thư mục GIF/xem thử tạm, `debug.png`, bản `-PHUC-HOI` thừa, ảnh gốc của nhân vật/vũ khí/trang phục cũ đã bỏ ở đợt 2 (liệt kê trong báo cáo trước khi xoá).
- `docs/review/**`: giữ (là hồ sơ). Có thể xoá ảnh kiểm thử nặng không còn giá trị (kiem-thu/*.gif cũ) nếu > 1 MB, ghi lại.
- Ghi bảng xoá/giữ + dung lượng repo trước/sau (`du -sh`, `git count-objects -vH`).

## B. Kiểm hiệu năng (được chạy game headless CHỈ để đo hiệu năng, Chromium ở /opt/pw-browsers, KHÔNG playwright install, ?cloud=0)
Đo trên giả lập điện thoại (844×390, dpr 3, CPU chậm 4×):
1. Thời gian tải trang đầu (bản hai tệp và một tệp), dung lượng tải, số ảnh tải sau; thời gian tới khi chơi được.
2. FPS và thời gian mỗi khung trong trận đông quái (vùng 3 nhiều quái + hiệu ứng Thức tỉnh + mưa phi tiêu + chạy chém), ở làng, ở màn chính; đỉnh bộ nhớ JS.
3. Hồ sơ CPU (Performance profile): 10 hàm tốn nhất mỗi khung; chỗ tạo canvas/ảnh mỗi khung, getImageData mỗi khung, đối tượng rác nhiều.
## C. Tối ưu (chỉ chỗ đo thấy rõ, không đổi hình/luật)
- Ví dụ: bộ nhớ đệm canvas nhuộm, gộp vẽ, bỏ tạo đối tượng mỗi khung, giới hạn hạt, ảnh tải sau nhỏ lại (WebP/nén), tách ảnh lớn khỏi bản một tệp, nạp lười.
- Đo lại sau khi sửa, ghi bảng trước/sau. Hình và lối chơi phải y hệt.

## Luật
- Chỉ được chạy game để ĐO HIỆU NĂNG như mục B; không thêm bài test chức năng.
- Không chép apiKey trong `game/js/firebase-config.js`; không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`, đường đọc save cũ.
- Chỉ push nhánh `khoi-tao-du-an`; KHÔNG master, KHÔNG force push, KHÔNG PR. Bị từ chối thì `git pull --rebase` (xung đột `game/dist` thì lấy bản trên nhánh rồi chạy lại `python3 game/build.py`).
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g

## Khi xong
`bao-cao.md` cùng thư mục (tiếng Việt dễ hiểu: đã xoá gì, dung lượng trước/sau, bảng hiệu năng trước/sau, đã tối ưu gì, mã commit), push, tự dừng.
