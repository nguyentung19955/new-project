# Đưa Ngư Tinh MỚI (mực khổng lồ) vào game (13/10 18:00)

Chủ dự án thiết kế lại hoàn toàn trùm vùng Hang biển: Ngư Tinh giờ là **mực khổng lồ cầm đôi rìu san hô** (bỏ hẳn hình người cá cầm đinh ba cũ).

Ảnh gốc đã cắt sẵn khung (PNG trong suốt) ở `docs/anh-goc/trum-moi/ngu-tinh/`:
- Pha 1 (6 hàng): `1-dung-cat/1-dung/khung-NN.png` (6), `2-di` (6, trườn bằng xúc tu), `3-bao-don` (6), `4-danh` (6, bổ hai rìu xuống, nước toé), `5-trung-don` (4), `6-chet` (6, tan thành vũng mực).
- Pha 2 nổi giận (đỏ vân cam): `p2-1-dung` (6), `p2-2-bao-don` (6), `p2-3-danh` (6), `p2-4-trung-don` (4).
- Pha 3 cuồng nộ (xanh đen, rìu băng): `p3-1-dung` (6), `p3-2-bao-don` (6), `p3-3-danh` (6), `p3-4-trung-don` (4).
- Ảnh mẫu cả con: `docs/anh-goc/trum-moi/ngu-tinh-p1.png`, `-p2.png`, `-p3.png`.

Việc cần làm:
1. Thay ảnh `game/art/custom/nguTinh.sprite.json`, `nguTinh-p2.sprite.json`, `nguTinh-p3.sprite.json` bằng khung mới, đúng định dạng/hàng mà `sprite_custom.js` đang đọc (idle, move, tele, atk, hit, die; pha 2/3 không có move/die thì dùng như hiện tại theo `PHA_HANG`). Xem cách các phiên trước tạo sprite từ khung cắt (tools/ hoặc build.py), dùng lại công cụ có sẵn.
2. **Co cỡ**: các tấm gen có cỡ con mực hơi khác nhau giữa các hàng (hàng trườn to hơn hàng đứng). Co từng hàng sao cho **đầu (mũ vây nhọn) và thân cùng cỡ** giữa mọi hàng và mọi pha; chân (xúc tu dưới cùng) cùng một đường đất. Kích thước hiển thị trong game giữ gần bằng Ngư Tinh cũ (hộp va chạm không đổi).
3. Hướng: ảnh nhìn sang PHẢI — giữ đúng quy ước lật của quái hiện tại.
4. Thời điểm đòn: khung "rìu chạm đất" của hàng đánh (pha 1: khung 3; pha 2: khung 3–4; pha 3: khung 3 và 5) phải trùng lúc gây sát thương nếu code có mốc khung đánh; nếu không có thì để như hiện tại và ghi lại trong báo cáo.
5. Không đổi máu/sát thương/kỹ năng trùm (đợt 5 vừa chỉnh). Không đụng Hồ Tinh, Mộc Tinh (đang chờ ảnh).
6. Ảnh soát tĩnh `xem-ngu-tinh.png` trong thư mục này: mọi hàng × 3 pha xếp cạnh nhau cùng tỉ lệ, kèm Ngư Tinh cũ để so cỡ.
7. `python3 game/build.py` (timeout dài), commit + push, viết `bao-cao-ngu-tinh.md` (tiếng Việt, ngắn, có mã commit).

**TUYỆT ĐỐI KHÔNG TEST** (không Playwright, không chạy game) — chỉ script xử lý ảnh, ảnh soát tĩnh, node --check, build.py.
Ràng buộc: KHÔNG đụng master, KHÔNG force push, KHÔNG PR. Không chép apiKey trong game/js/firebase-config.js. Không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`. Xung đột game/dist khi rebase: lấy bản trên nhánh rồi build lại. Push bị từ chối thì pull --rebase rồi push lại.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
