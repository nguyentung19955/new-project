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

// PWA bỏ thanh URL (15/10, docs/review/ke-hoach-cai-thien/pwa-bo-thanh-url): mở game từ biểu tượng màn hình chính (chế độ ứng dụng) trên
// spiritblade.web.app thì trang đăng nhập Firebase (/__/auth/handler) chạy NGAY trên tên miền game, không nhảy sang sontinhthuytinh.firebaseapp.com
// (tên miền khác → máy hiện thanh URL, iPhone tách bộ nhớ nên mất đăng nhập). Site spiritblade nằm trong cùng dự án sontinhthuytinh
// (.github/workflows/linh-khi-hosting.yml) nên Firebase Hosting có sẵn /__/auth/handler ở đây.
//  - Chỉ đổi khi: đúng site spiritblade (*.web.app / *.firebaseapp.com), https, và đang ở chế độ ứng dụng (hoặc thêm ?authmoi=1 để thử trên trình duyệt).
//    Mở trong trình duyệt thường: GIỮ authDomain cũ như trước (không đổi gì).
//  - Cờ quay lui: ?authcu=1 → dùng lại authDomain cũ (máy nhớ luôn; ?authmoi=1 để bỏ nhớ). Máy tự quay lui (lk_authcu) nếu lần đăng nhập
//    kiểu mới đầu tiên không trả kết quả về (ví dụ Google báo redirect_uri_mismatch vì chủ game chưa thêm địa chỉ ở Google Cloud) — js/cloud.js.
(function () {
  const cfg = window.FIREBASE_CONFIG;
  const info = (window.LK_AUTH = { cu: cfg ? cfg.authDomain : '', moi: false, ly: '' });
  try {
    if (!cfg) return;
    let ls = null;
    try { ls = window.localStorage; } catch (e) { ls = null; }
    const q = location.search || '';
    const thuMoi = /[?&]authmoi=1\b/.test(q);
    try {
      if (thuMoi && ls) ls.removeItem('lk_authcu');
      if (/[?&]authcu=1\b/.test(q) && ls) ls.setItem('lk_authcu', '1');
    } catch (e) { /* bỏ qua */ }
    if (/[?&]authcu=1\b/.test(q)) { info.ly = 'authcu'; return; }
    if (location.protocol !== 'https:' || !/^spiritblade\.(web\.app|firebaseapp\.com)$/.test(location.hostname)) { info.ly = 'ten-mien-khac'; return; }
    const mm = (s) => !!(window.matchMedia && window.matchMedia(s).matches);
    const app = mm('(display-mode: fullscreen)') || mm('(display-mode: standalone)') || mm('(display-mode: minimal-ui)') || navigator.standalone === true;
    info.app = app;
    if (!app && !thuMoi) { info.ly = 'trinh-duyet'; return; }
    let cu = false;
    try { cu = !!ls && ls.getItem('lk_authcu') === '1'; } catch (e) { cu = false; }
    if (cu) { info.ly = 'tu-quay-lui'; return; }
    cfg.authDomain = location.hostname;
    info.moi = true;
  } catch (e) { /* lỗi bất kỳ: giữ authDomain cũ */ }
})();
