# Quy tắc làm việc

- **Mỗi yêu cầu tách thành một session riêng.** Khi người dùng đưa ra một yêu cầu mới (tính năng, sửa lỗi, prompt ảnh…), mở một session Claude Code mới cho yêu cầu đó, làm trên nhánh riêng (`claude/<tên-ngắn>`) tách từ nhánh chính `claude/mobile-tower-defense-game-k5oxzo`, không tạo pull request. Session chính chỉ điều phối, theo dõi và gộp kết quả về.
- Trả lời người dùng bằng tiếng Việt.
- Sau mỗi thay đổi: tăng phiên bản (`?v=N` trong `index.html`, "Phiên bản N" trong `js/ui.js`, `const VERSION='vN'` trong `sw.js`), thêm ghi chú vào `GAMEPLAY.md`, chạy test, commit và push.
