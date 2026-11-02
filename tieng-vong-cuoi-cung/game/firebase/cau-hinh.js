/* Cấu hình Firebase cho lưu mây (game/luu-may.js).
   null = CHƯA có dự án Firebase → game chỉ lưu trên máy (localStorage), không lỗi.
   Khi đã tạo dự án (xem docs/firebase/BAO-CAO.md), dán cấu hình web app vào đây, ví dụ:
   window.TVCC_FIREBASE = {apiKey:'AIza…', authDomain:'tieng-vong-cuoi-cung.firebaseapp.com',
     projectId:'tieng-vong-cuoi-cung', appId:'1:…:web:…', storageBucket:'…', messagingSenderId:'…'};
   (apiKey của web app KHÔNG phải mật khẩu – để công khai là bình thường; dữ liệu được bảo vệ bằng firestore.rules.) */
window.TVCC_FIREBASE = window.TVCC_FIREBASE || null;
