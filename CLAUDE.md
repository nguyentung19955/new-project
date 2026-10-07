# Quy tắc làm việc

- **Mỗi yêu cầu tách thành một session riêng.** Khi người dùng đưa ra một yêu cầu mới (tính năng, sửa lỗi, prompt ảnh…), mở một session Claude Code mới cho yêu cầu đó, làm trên nhánh riêng (`claude/<tên-ngắn>`) tách từ nhánh chính `claude/mobile-tower-defense-game-k5oxzo`, không tạo pull request. Session chính chỉ điều phối, theo dõi và gộp kết quả về.
- **Session con xong việc thì nhắn lại cho session điều phối.** Khi đã commit + push xong (hoặc bị chặn, cần người dùng quyết định), session con gửi một tin nhắn cho session cha bằng công cụ `send_message` (claude-code-remote; tìm bằng ToolSearch nếu chưa nạp) tới `parent_session_id` của mình (xem bằng `get_session` không truyền session_id). Nội dung ngắn: nhánh, số phiên bản, commit cuối, tóm tắt thay đổi, kết quả test, việc người dùng cần làm (nếu có). Không chờ trả lời.
- Trả lời người dùng bằng tiếng Việt.
- Sau mỗi thay đổi: tăng phiên bản (`?v=N` trong `index.html`, "Phiên bản N" trong `js/ui.js`, `const VERSION='vN'` trong `sw.js`, `<div class="ver">Phiên bản N</div>` trong `index.html`), thêm ghi chú vào `GAMEPLAY.md`, chạy test, commit và push.
- **Chỉ sửa tài liệu thì không chạy test.** Nếu thay đổi chỉ đụng tới tài liệu/prompt (docs/, *.md, *.txt, file prompt sinh ra) mà không sửa code game, thì bỏ qua bước chạy test; vẫn tăng phiên bản, ghi GAMEPLAY.md, commit và push.
- **Sửa tool ngoài thì chỉ test tool đó.** Tool chạy ngoài game (tools/cat-anh.html, tools/cat_anh.py, tools/cat-anh.bat, tools/build-*.js, tools/cat-*.py…) không ảnh hưởng game: chỉ chạy test riêng của tool (ví dụ `node tests/cat-anh/cat-anh.test.js`), không chạy toàn bộ test hệ thống. Chỉ khi sửa code game (js/, css/, index.html, sw.js, assets game dùng) mới chạy toàn bộ test.
- **Sửa giao diện thì phải NHÌN ảnh chụp, không chỉ chạy test.** Mọi thay đổi đụng tới giao diện/ảnh: chụp màn hình trước/sau bằng Playwright ở 1920×934, 844×390, 667×375 và dùng công cụ Read để xem tận mắt từng ảnh (ảnh vỡ/cắt/lệch, icon lòi ra, chữ tràn, nút chồng). Chỉ báo "xong" khi đã xem ảnh và không thấy lỗi; ghi đường dẫn ảnh đã xem trong tin nhắn báo cáo. Session điều phối cũng xem lại ảnh trước khi báo người dùng.
- **Tester 10 năm kinh nghiệm kiểm tra sau mỗi lần sửa.** Khi một session sửa lỗi / làm tính năng báo xong, session điều phối giao nhánh đó cho session tester (vai tester game mobile 10 năm kinh nghiệm: chơi thật bằng Playwright ở 1920×934, 844×390, 667×375, dọc 390×844, chụp và xem tận mắt từng ảnh, soi cả lỗi hồi quy xung quanh chỗ sửa). Tester chỉ báo cáo (đạt / lỗi + ảnh + bước tái hiện), không sửa code. Chỉ gộp vào nhánh chính khi tester báo đạt; lỗi thì trả lại session sửa. Hàng đợi theo thứ tự đến trước — xử lý trước, test trước (FIFO), không chen ngang.

# Chạy test

- Đủ bộ (song song 4 luồng, in bảng thời gian, mã thoát ≠ 0 nếu có lỗi): `node tests/run-all.js` (thêm `--j 6` để đổi số luồng).
- Chỉ test liên quan: `node tests/run-all.js <tên> [<tên>…]` (lọc theo đường dẫn, vd `node tests/run-all.js hop-the cho-tuong`).
- Test thiếu môi trường (emulator Firestore, Java, scipy không cài được) tự in `SKIP` và không tính lỗi.
- Ảnh test chụp ra `tests/<tên>/shots/` — không commit (đã .gitignore). Ảnh minh hoạ muốn giữ thì để ở `docs/`.
- Test không được ghi vào `assets/`, `js/` thật (dùng thư mục tạm + `page.route`), để chạy song song an toàn.
