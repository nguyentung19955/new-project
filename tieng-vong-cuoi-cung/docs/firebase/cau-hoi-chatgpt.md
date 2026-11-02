# Câu hỏi soạn sẵn cho ChatGPT – Lưu game bằng Firebase (phiên firebase)

Lần chạy 02/11/2026 KHÔNG có Claude in Chrome nên chưa hỏi được ChatGPT. Lần chạy có Chrome: mở cuộc trò chuyện ChatGPT mới,
dán nguyên khối dưới, lưu câu trả lời nguyên văn vào `docs/firebase/tu-van-chatgpt.txt`, rồi sửa `game/luu-may.js` /
`firestore.rules` theo tư vấn (phép thử: `node tools/firebase/kiem-thu-luu-may.js`, `node tools/firebase/kiem-tra-trinh-duyet.js`).

---

Bạn là chuyên gia Firebase cho game web HTML5 (canvas, JavaScript thuần, không framework), chơi chủ yếu trên iPhone Safari xoay ngang.
Game "Tiếng Vọng Cuối Cùng" lưu tiến độ bằng localStorage, mỗi vùng 1 khoá JSON nhỏ (vài KB): `tvcc-vung1`, `tvcc-chung`
(lưu chung giữa các vùng), `tvcc-he-thong`… Tôi muốn lưu lên mây để đổi máy vẫn giữ tiến độ, CHỈ dùng gói miễn phí Spark
(tuyệt đối không bật Blaze, không nhập thẻ). Game phải chạy được khi không có mạng hoặc khi trang bị chặn mạng.

Bản nháp hiện tại (đã viết, có phép thử):
1. Đăng nhập ẩn danh tự động; nút "Giữ tiến độ bằng Google" gắn (linkWithPopup) tài khoản Google vào người dùng ẩn danh;
   nếu Google đó đã có bản lưu từ máy khác (auth/credential-already-in-use) thì chuyển sang tài khoản đó.
2. Firestore, 1 tài liệu / người: `nguoi_choi/{uid}` = { khoa: { "tvcc-vung1": {du:"<chuỗi JSON>", t:<ms lúc sửa>} , ...},
   saoLuu: {<khoá>: bản bị đè gần nhất}, phienBan, capNhat:serverTimestamp }.
3. localStorage vẫn là nguồn chính. Mở trang: chờ tối đa 2,5 s lấy bản mây; theo từng khoá, bản có thời điểm sửa mới hơn thắng;
   bản bị thay giữ 1 bản dự phòng (trên máy và trên mây). Chưa lấy được bản mây thì KHÔNG gửi lên (tránh máy mới đè tiến độ).
   Đang chơi mà mây có bản mới hơn → không đè game đang chạy, báo "tải lại trang".
4. Gửi lên gom lại tối đa 10 s/lần + khi ẩn trang (pagehide/visibilitychange); trước khi ghi đọc lại tài liệu 1 lần.
5. SDK Firebase 10.14.1 nạp động từ gstatic khi có cấu hình; lỗi/quá giờ → chỉ lưu máy.
6. Quy tắc: chỉ uid đó đọc/ghi `nguoi_choi/{uid}`, chỉ cho các trường khoa/saoLuu/phienBan/capNhat, tối đa 50 khoá.
7. Hosting: Firebase Hosting gói Spark, triển khai bằng GitHub Actions (service account), ảnh game ~700 MB.

Hãy tư vấn:
a) Firestore hay Realtime Database cho trường hợp này? Cấu trúc dữ liệu trên có ổn không?
b) "Sửa sau cùng thắng" theo đồng hồ máy có rủi ro gì (đồng hồ lệch)? Nên dùng serverTimestamp, số đếm phiên bản, hay so "tiến độ" (vd đã hạ trùm)?
c) Có nên bật bộ nhớ đệm offline của Firestore (persistentLocalCache) không, hay để localStorage lo là đủ?
d) Đăng nhập Google trên iPhone Safari: linkWithPopup hay linkWithRedirect? Cần cấu hình authDomain gì khi dùng Hosting?
e) Quy tắc bảo mật: viết lại bản tốt nhất (giới hạn kích thước, kiểu dữ liệu).
f) Giới hạn gói Spark (Firestore đọc/ghi/ngày, Hosting dung lượng + băng thông/ngày, số phiên bản Hosting lưu giữ) – với ~700 MB ảnh,
   có cần giảm/nén ảnh hay giới hạn số phiên bản giữ lại không? Cách chắc chắn không bao giờ bị tính tiền?
g) Có cần App Check / chống lạm dụng ở gói miễn phí không?
h) Giao diện: hiện trạng thái lưu mây ở đâu trong menu cho người chơi dễ hiểu (chỉ chữ, hay cần biểu tượng)?

Yêu cầu: viết TOÀN BỘ câu trả lời vào 1 file .txt (tải về được) VÀ in luôn toàn bộ nội dung trong khung chat.
