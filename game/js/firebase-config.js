// Cấu hình Firebase của dự án "sontinhthuytinh" (dùng chung với game Thần Thoại Việt; dữ liệu Linh Khí nằm riêng
// ở các bảng linhkhi_users, linhkhi_scores, linhkhi_feedback). Các giá trị này KHÔNG phải mật khẩu: Firebase cho phép
// để công khai, dữ liệu được bảo vệ bằng luật Firestore (game/firebase/linhkhi.rules). Xoá apiKey là tắt hẳn lưu mây.
window.FIREBASE_CONFIG = {
  apiKey: 'AIzaSyC3XN2vaptO7ErzF3U_Ayb6S0VBET8gvxU',
  authDomain: 'sontinhthuytinh.firebaseapp.com',
  projectId: 'sontinhthuytinh',
  storageBucket: 'sontinhthuytinh.firebasestorage.app',
  messagingSenderId: '194086791076',
  appId: '1:194086791076:web:81b3be1d4b2f1c7afd4331',
};
// Đăng nhập Google kiểu chuyển trang (mở từ màn hình chính) chỉ chạy ổn khi authDomain trùng tên miền đang mở:
// trình duyệt mới chặn dữ liệu "bên thứ ba" nên kết quả đăng nhập từ sontinhthuytinh.firebaseapp.com không về được trang.
// spiritblade.web.app là site Firebase Hosting của cùng dự án, tự có /__/auth/handler.
// Cần thêm https://spiritblade.web.app/__/auth/handler vào "Authorized redirect URIs" của OAuth client (xem docs/firebase-linh-khi/HUONG-DAN.md).
try { if (location.hostname === 'spiritblade.web.app') window.FIREBASE_CONFIG.authDomain = 'spiritblade.web.app'; } catch (e) { /* bỏ qua */ }
