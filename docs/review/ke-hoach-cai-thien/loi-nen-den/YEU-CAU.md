# LỖI GẤP: hình bị NỀN ĐEN (14/10 10:41, ảnh chụp điện thoại `anh-loi-nen-den.png`)

Chủ dự án chơi trên iPhone (Safari, spiritblade.web.app): **quả bom trên đầu quái tinh anh (dấu hệ "Nổ khi chết")** và **gai trên lưng nhím** hiện ô NỀN ĐEN thay vì trong suốt. Rất có thể do đợt nén ảnh `a0da2ca` (`npc-ban-do-bao-truoc/cong-cu/nen-anh.py`): 245 tấm đổi sang PNG bảng màu (mode P + tRNS), và/hoặc bước WebP lossless trong `game/build.py` (`ma_webp` so điểm ảnh — kiểm có so cả kênh alpha không), và/hoặc chỗ game xử lý ảnh bằng canvas (nhuộm, viền, cắt ô, `getImageData`, tạo bản sao) giả định ảnh RGBA.
Việc cần làm:
1. Tìm đúng nguyên nhân (so tệp trước/sau `a0da2ca`, giải mã đúng như trình duyệt: PNG bảng màu có tRNS nhiều mức alpha, WebP lossless alpha). Tìm hình bom/dấu hệ tinh anh (gd-*/hu-* hoặc vẽ code) và hình gai nhím (`nhim`, `nhimDoc`, `nhimThan` hoặc hiệu ứng gai) để xác định.
2. Sửa tận gốc: nếu tRNS/bảng màu gây lỗi trên Safari thì đổi các tấm có alpha về PNG RGBA (hoặc bảng màu mà mọi trình duyệt đọc đúng), WebP luôn giữ alpha; nếu do code canvas thì sửa code. Giữ trần dung lượng (ảnh máy chủ < 26 MB, bản một tệp < 30 MB) — nếu vượt thì nén chỗ khác không đụng alpha.
3. **Rà toàn bộ** `game/art/custom/*.sprite.json` và `dist/anh/*.png|webp`: giải mã từng ảnh, liệt kê mọi tấm có viền/nền đáng lẽ trong suốt mà thành đen/đục (so với ảnh gốc trước `a0da2ca` nếu có), sửa hết. Ghi danh sách vào báo cáo.
4. Thêm một bài kiểm TĨNH (script, không chạy game) vào `tools/` để lần sau nén ảnh không làm mất alpha: so alpha trước/sau từng tấm.
**TUYỆT ĐỐI KHÔNG chạy game/Playwright** — chỉ script giải mã ảnh, node --check, build.py (cả `--hai-tep`). Ràng buộc: KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Phiên khác có thể đang sửa code vũ khí/tên: pull --rebase cẩn thận; xung đột game/dist lấy bản trên nhánh rồi build lại. Viết `bao-cao.md` (nguyên nhân, danh sách tấm đã sửa, dung lượng).
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
