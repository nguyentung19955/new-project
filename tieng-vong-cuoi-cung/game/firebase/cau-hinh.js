/* Cấu hình Firebase cho lưu mây (game/luu-may.js).
   Dự án Firebase: tieng-vong-cuoi-cun (tạo 02/11/2026). Đặt null = tắt lưu mây → game chỉ lưu trên máy (localStorage), không lỗi.
   Khi đã tạo dự án (xem docs/firebase/BAO-CAO.md), dán cấu hình web app vào đây, ví dụ:
   window.TVCC_FIREBASE = {apiKey:'AIza…', authDomain:'tieng-vong-cuoi-cung.firebaseapp.com',
     projectId:'tieng-vong-cuoi-cung', appId:'1:…:web:…', storageBucket:'…', messagingSenderId:'…'};
   (apiKey của web app KHÔNG phải mật khẩu – để công khai là bình thường; dữ liệu được bảo vệ bằng firestore.rules.) */
window.TVCC_FIREBASE = window.TVCC_FIREBASE || {
  apiKey: 'AIzaSyAjRS6NCkwdxQfTxJyxQMoIudAMfCwVUmA',
  authDomain: 'tieng-vong-cuoi-cun.firebaseapp.com',
  projectId: 'tieng-vong-cuoi-cun',
  storageBucket: 'tieng-vong-cuoi-cun.firebasestorage.app',
  messagingSenderId: '312856385636',
  appId: '1:312856385636:web:5781423fcda7bc8837a771'
};
