# Quy tắc làm việc

- **Mỗi yêu cầu tách thành một session riêng.** Khi người dùng đưa ra một yêu cầu mới (tính năng, sửa lỗi, prompt ảnh…), mở một session Claude Code mới cho yêu cầu đó, làm trên nhánh riêng (`claude/<tên-ngắn>`) tách từ nhánh chính `claude/mobile-tower-defense-game-k5oxzo`, không tạo pull request. Session chính chỉ điều phối, theo dõi và gộp kết quả về.
- **Session con xong việc thì nhắn lại cho session điều phối.** Khi đã commit + push xong (hoặc bị chặn, cần người dùng quyết định), session con gửi một tin nhắn cho session cha bằng công cụ `send_message` (claude-code-remote; tìm bằng ToolSearch nếu chưa nạp) tới `parent_session_id` của mình (xem bằng `get_session` không truyền session_id). Nội dung ngắn: nhánh, số phiên bản, commit cuối, tóm tắt thay đổi, kết quả test, việc người dùng cần làm (nếu có). Không chờ trả lời.
- Trả lời người dùng bằng tiếng Việt.
- Sau mỗi thay đổi: tăng phiên bản (`?v=N` trong `index.html`, "Phiên bản N" trong `js/ui.js`, `const VERSION='vN'` trong `sw.js`, `<div class="ver">Phiên bản N</div>` trong `index.html`), thêm ghi chú vào `GAMEPLAY.md`, chạy test, commit và push.
