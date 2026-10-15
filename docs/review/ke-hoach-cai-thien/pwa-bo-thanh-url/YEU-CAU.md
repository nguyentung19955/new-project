# PWA: bỏ thanh URL hiện ở bên dưới

Chủ game (điện thoại, mở game từ biểu tượng ngoài màn hình chính): "chế độ pwa thì bỏ thanh url web ở bên dưới".
Manifest game/web/manifest.webmanifest đã display fullscreen, scope "./". Trang có apple-mobile-web-app-capable.

Nghi vấn chính (kiểm bằng đọc code, ghi kết luận rõ trong báo cáo):
1. **Đăng nhập Google đi ra ngoài phạm vi app.** firebase-config.js authDomain = 'sontinhthuytinh.firebaseapp.com' (khác tên miền
   spiritblade.web.app). cloud.js dùng signInWithRedirect khi ở chế độ app → trang nhảy sang tên miền khác → iOS mở khung Safari có thanh dưới,
   Android Chrome hiện thanh URL; có máy giữ thanh đó cả sau khi quay về. Cách sửa chuẩn của Firebase: authDomain = chính tên miền đang chạy
   (location.host) khi chạy trên site Firebase Hosting cùng dự án (spiritblade.web.app có sẵn /__/auth/handler vì cùng dự án — kiểm workflow
   .github/workflows/linh-khi-hosting.yml tạo site trong dự án nào). Phải giữ đăng nhập Google chạy được: chỉ đổi khi host là *.web.app /
   *.firebaseapp.com của đúng dự án, còn lại giữ authDomain cũ; ghi rõ chủ game có cần thêm tên miền vào "Authorized domains" trong Firebase
   Console không (thường *.web.app của cùng dự án đã có sẵn) — nếu cần thì ghi từng bước bấm cho người không rành kỹ thuật.
2. **Link / điều hướng khác ra ngoài scope** (tools, xuong-sprite, bảng vàng, chia sẻ, linh-khi.html, ?query) → mở trong trang ngoài hiện thanh URL. Rà và giữ trong scope hoặc mở tab mới rõ ràng.
3. **start_url / scope / service worker**: kiểm trang thật được deploy (index.html = linh-khi-nhe.html) có <link rel="manifest"> trỏ đúng, sw.js đăng ký đúng scope,
   start_url có cùng tên miền; build.py có dòng xoá link manifest (dòng ~600) — xác định áp vào bản nào, có làm bản deploy mất manifest không.
4. Android: thêm requestFullscreen() ở lần chạm đầu khi đang ở chế độ app mà vẫn còn thanh (display-mode không phải fullscreen) — không làm phiền bản web thường.
5. iOS: kiểm meta apple-mobile-web-app-status-bar-style, viewport-fit=cover, safe-area (đã có), không vô tình thoát chế độ app.

Làm: sửa đúng nguyên nhân tìm được, có cờ quay lui `?authcu=1` (authDomain cũ) nếu đụng đăng nhập. KHÔNG làm hỏng đăng nhập Google / lưu mây / ?cloud=0; không chép apiKey.
KHÔNG chơi thử game; kiểm bằng đọc code, node --check, build.py; nếu cần, kiểm bằng curl các tệp trên spiritblade.web.app (manifest, sw.js, /__/auth/handler) để chắc chắn tồn tại.
Báo cáo bao-cao.md: nguyên nhân (máy nào bị gì), đã sửa gì, chủ game cần làm gì trên điện thoại (thường: xoá biểu tượng cũ, mở lại trang, "Thêm vào màn hình chính" lại) — viết từng bước dễ hiểu cho iPhone và Android.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
Không đụng master, không force push, không PR. Push (bị từ chối thì pull --rebase rồi push lại; giữ thay đổi của phiên khác). Xong viết bao-cao.md, push, tự dừng.
