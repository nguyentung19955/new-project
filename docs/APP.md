# Bản app Android (Capacitor)

Game web được đóng gói thành app bằng Capacitor (`android/`, `capacitor.config.json`, mã app `vn.nuicao.game`).

## Lấy file APK
Mỗi lần đẩy code lên nhánh, GitHub Actions (`.github/workflows/android.yml`) tự build:
GitHub → repo → tab **Actions** → lượt chạy mới nhất "Build Android APK" → mục **Artifacts** → tải `nui-cao-nuoc-dang-apk` (file zip chứa `app-debug.apk`).
Cài lên điện thoại: chép file APK sang máy → mở → cho phép "Cài ứng dụng không rõ nguồn gốc".

## App đã có
- Chơi toàn màn hình, khoá màn hình ngang, icon và màn khởi động riêng.
- Toàn bộ hình ảnh nằm trong app; cần mạng cho phông chữ Google và lưu đám mây Firebase.

## Chưa có (bước sau)
- **Đăng nhập Google trong app**: Google chặn cửa sổ đăng nhập trong WebView → cần plugin đăng nhập gốc + file `google-services.json` (Firebase → Project settings → Add app → Android, mã gói `vn.nuicao.game`, kèm SHA-1). Đăng nhập khách + lưu đám mây vẫn chạy.
- **Bản phát hành (ký số) để đưa lên CH Play**: cần tạo keystore, tài khoản Google Play Console (25 USD một lần).
- **iOS**: cần máy Mac + tài khoản Apple Developer (99 USD / năm).

## Tự build trên máy
Cài Node 22, JDK 21, Android Studio → `npm install` → `npm run apk` → APK ở `android/app/build/outputs/apk/debug/`.
