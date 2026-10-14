# Cốt truyện: Zed cứu các bạn, BỎ Lạc Long Quân (14/10 08:04)

Chủ dự án: "cốt truyện đổi thành Zed cứu các bạn thôi, không còn Lạc Long Quân nữa".

Sửa lời thoại trong `game/js/truyen.js` (MO_DAU, VUNG, KET, TRUM, LANG) và mọi chỗ khác trong `game/js/*.js` / `game/index.html` có nhắc Lạc Long Quân, Phong Châu, "khối sắt nung", truyền thuyết cũ:
- Mở đầu: làng ven sông sống nhờ linh khí cây đa; ba yêu tinh (Mộc Tinh – cây cổ thụ ở Rừng già, Ngư Tinh – mực khổng lồ cầm rìu san hô ở Hang biển, Hồ Tinh – cáo chín đuôi đeo mặt nạ ở Lâu đài cổ) thức dậy hút linh khí và bắt ba bạn của Zed (Cu Tèo, Cái Bống, Cu Lì). Zed – bạn thân của ba đứa – lên đường cứu bạn. Không nhắc nguồn gốc truyền thuyết, không có nhân vật lịch sử/thần thoại.
- Lời Cụ Đồ / NPC về trùm: mô tả đúng hình dạng MỚI (mực, cây có nấm độc, cáo lửa đeo mặt nạ), không còn "cá"/"đinh ba"/"chiên đàn nghìn năm do LLQ trừ".
- Kết: hội làng mừng ba bạn trở về, Zed được cả làng cảm ơn (bỏ "kể chuyện Lạc Long Quân trừ yêu").
- Giữ giọng văn ngắn, dễ thương, tiếng Việt có dấu; độ dài mỗi câu xấp xỉ câu cũ (khung thoại có giới hạn). Giữ nguyên cấu trúc mảng, khoá `nen`/`ai`, số câu không đổi nhiều.
- Không đổi luật, số, tên NPC, tên vùng.

**TUYỆT ĐỐI KHÔNG TEST** (không Playwright, không chạy game) — chỉ node --check, build.py (timeout dài). Ghi lời cũ → mới trong `bao-cao.md` cùng thư mục.
Ràng buộc: KHÔNG đụng master, KHÔNG force push, KHÔNG PR. Không chép apiKey. Không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`. Phiên khác đang sửa `monster_art.js`, `sprite_custom.js`, `ui_theme.js` — không đụng các tệp đó; xung đột game/dist khi rebase: lấy bản trên nhánh rồi build lại. Push bị từ chối thì pull --rebase rồi push lại.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
