# Búa nện: vệt chém (slash) vẫn không khớp đầu búa / đất nứt (13/10 17:01)

Chủ dự án: "slash không khớp" sau lần sửa 33ced312 (`dauBua`, `anhVk`, cờ `?buakhop=0`). Ảnh chụp điện thoại (xoay ngang): anh-nguoi-dung.png — vệt trắng và vết nứt nằm lệch so với đầu búa.

**ĐƯỢC CHẠY GAME** (chủ dự án cho phép 17:03) — CHỈ để chụp khung búa nện (đòn thường + Địa Chấn, 8 hướng, đứng và chạy) rồi căn cho khớp. Không test việc khác.

Việc cần làm:
1. Chạy game cục bộ (playwright, chromium sẵn), trang bị búa, chụp từng khung đòn búa: vị trí đầu búa thật trên ảnh Zed, vệt chém (`anhVk`/`cungVk`), vết nứt đất (`nenDat` trong fx_he.js) ở các hướng và các cấp (Trắng / Mầm / Thành hình / Thức tỉnh).
2. Tìm nguyên nhân lệch (góc nhắm `AIMG`, lật trái/phải, tỉ lệ co ảnh, mốc thời gian khung chạm đất…), sửa để vệt chém đi theo cung đầu búa và vết nứt nằm đúng chỗ đầu búa chạm đất.
3. Giữ cờ `?buakhop=0` tắt được. Không đụng vũ khí khác.
4. `python3 game/build.py` (timeout dài), commit + push nhánh khoi-tao-du-an. Lưu ảnh trước/sau vào thư mục này + bao-cao.md (tiếng Việt, ngắn).

Ràng buộc: KHÔNG đụng master, KHÔNG force push, KHÔNG PR. Không chép apiKey trong game/js/firebase-config.js. Không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`. Xung đột game/dist khi rebase: lấy --ours rồi build lại.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
