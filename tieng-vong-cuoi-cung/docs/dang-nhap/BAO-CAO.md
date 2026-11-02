# Báo cáo phiên Đăng nhập Google (dangnhap) – 02/11/2026

## Việc bạn cần làm: KHÔNG có
- Đăng nhập Google **đã bật sẵn** trên dự án thật; tên miền được phép đã đủ (`tieng-vong-cuoi-cun.web.app`, `tieng-vong-cuoi-cun.firebaseapp.com`). Máy tự kiểm qua GitHub Actions lúc 06:38 UTC: ĐẠT cả 3 mục.
- Quy tắc Firestore: bạn **đã dán xong** (kiểm dự án thật: đăng nhập khách, đọc, ghi đều ĐẠT). Phiên này **không đổi** quy tắc và không thêm khoá lưu, nên không cần dán lại.
- Còn chờ **phiên chính** vẽ ảnh nút bằng ChatGPT (yêu cầu ở `docs/yeu-cau-anh/dangnhap/001-nut-dang-nhap-dang-xuat.md`). Chưa có ảnh thì game tạm dùng khung gỗ-đồng sẵn có, vẫn bấm được bình thường.

## Đã làm
- **Ô tài khoản** ở trang chọn game, menu Vùng 1 và màn chờ Làng Chuông:
  - chưa đăng nhập: "Playing as guest" + nút **Sign in with Google**;
  - đã đăng nhập: "Signed in: Tên · ly23…@gmail.com" + nút **Sign out**.
- **Chơi khách vẫn như cũ**; không có mạng vẫn chơi và lưu trên máy.
- **Đăng nhập khi đang là khách** thì gắn Google vào tài khoản khách, nên tiến độ được giữ nguyên.
- **Tài khoản Google đã có bản lưu** (ví dụ đã chơi ở máy khác): game không đè bên nào. Menu hiện "Cloud save needs attention" cùng 2 nút **Use cloud save** / **Keep this device's save**, đúng như tư vấn ChatGPT.
- **Sign out**: gửi nốt bản lưu lên mây rồi về chế độ khách. Bản lưu trên máy không bị xoá.
- **Phiên đăng nhập giữ đúng 7 ngày:**
  - Đăng nhập một lần thì đóng/mở Safari hay tắt máy vẫn còn đăng nhập. Phiên được lưu lâu dài trên máy, theo thứ tự IndexedDB → localStorage → …; trình duyệt chặn cách nào thì game tự dùng cách sau.
  - Hết 7 ngày kể từ lần đăng nhập Google gần nhất thì game tự về chế độ khách và hiện: *"Your sign-in expired after 7 days. Sign in again to sync your progress."* Tiến độ trên máy vẫn giữ nguyên.
  - Mốc 7 ngày lấy theo **giờ máy chủ Google** (`auth_time`), nên vặn đồng hồ điện thoại không kéo dài được phiên.
  - Game kiểm phiên lúc mở game, mỗi lần lưu lên mây, mỗi 10 phút và mỗi lần quay lại trang.
  - Đăng nhập lại thì tính lại từ đầu 7 ngày. Phiên khách không bao giờ hết hạn.
  - Muốn đổi số ngày: sửa `SO_NGAY_PHIEN = 7` trong `game/luu-may.js`.
- **Sửa lỗi cũ:** ở menu Vùng 1, 2 nút chọn bản trước đây **luôn hiện**, kể cả khi không có xung đột. Giờ chỉ hiện khi cần.
- **GitHub Actions** có thêm bước tự kiểm (và tự bật nếu đang tắt) đăng nhập Google và tên miền được phép trên dự án thật. Bước này cũng kiểm xem bản mới đã lên Hosting chưa.
- **Tài liệu nghiên cứu** Firebase (lưu phiên, auth_time, Safari/iPhone, đăng nhập kiểu chuyển trang): `docs/dang-nhap/nghien-cuu.md`.

## Kết quả kiểm (đều đạt)
- Lõi lưu mây + phiên 7 ngày: **36/36** (6 ngày còn, 8 ngày hết, đúng mốc 7 ngày, vặn lùi đồng hồ không kéo dài, token hỏng không sập).
- Trình duyệt + Firebase giả lập, phần đăng nhập mới: **28/28**. Các trường hợp đã thử:
  - đăng nhập từ khách vẫn giữ tiến độ;
  - tải lại trang vẫn đăng nhập;
  - 6 ngày vẫn còn đăng nhập;
  - 8 ngày thì tự về khách, có thông báo, giữ tiến độ;
  - đang chơi mà qua mốc 7 ngày thì tự về khách, game không bị gián đoạn;
  - Sign out rồi đăng nhập lại thì tính lại 7 ngày;
  - tài khoản đã có bản lưu thì được chọn bản;
  - không có mạng vẫn chơi;
  - nút cao ≥ 44 px và nằm gọn trong màn 844×390;
  - không lỗi JS.
- Trình duyệt, phần lưu mây cũ: **24/24**.
- Firebase Emulator thật trên GitHub Actions: **22/22**. Gồm:
  - gắn Google giữ nguyên tài khoản;
  - máy chủ làm mới `auth_time` khi đăng nhập;
  - token tự làm mới không kéo dài phiên;
  - báo đúng khi tài khoản đã được dùng;
  - đăng nhập lại có mốc mới.
- Dự án thật:
  - Google BẬT;
  - tên miền ĐỦ;
  - khách BẬT;
  - ghi/đọc bản lưu ĐẠT;
  - đã đưa lên Hosting.
- Vùng 1: kiem-thu-f **66/66**, kiem-thu-g hỏng 0, kiem-thu-h hỏng 0. Lối chơi không đổi.

## Thử trên iPhone
1. Mở https://tieng-vong-cuoi-cun.web.app/ bằng Safari, xoay ngang.
2. Ở ô tài khoản bấm **Sign in with Google**, chọn tài khoản. Nếu Safari chặn cửa sổ bật lên, game sẽ tự chuyển sang trang đăng nhập rồi quay lại.
3. Kiểm thấy dòng "Signed in: …". Đóng hẳn Safari, mở lại link: vẫn còn đăng nhập.
4. Sang máy khác, đăng nhập cùng Google là có tiến độ. Nếu cả hai máy đều có tiến độ riêng, game sẽ hỏi muốn giữ bản nào.
5. Lưu ý về Safari: nếu không mở game suốt 7 ngày, Safari có thể tự xoá dữ liệu web. Khi đó chỉ cần đăng nhập lại là tiến độ trên mây về đủ. Có thể bấm **Export save** để giữ thêm một bản trên máy.
