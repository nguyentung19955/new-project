# Báo cáo phiên Lưu game bằng Firebase (firebase) – 02/11/2026

## Tóm tắt dễ hiểu
- **Phần mã lưu mây đã xong và đã kiểm thử**, nhưng **chưa bật**: chưa có dự án Firebase nên game vẫn lưu trên máy như cũ (không lỗi gì).
- **Chưa có link chơi trên iPhone.** Lần chạy này chạy trên máy chủ đám mây theo lịch, **không có Claude in Chrome**, nên:
  - chưa hỏi được ChatGPT (câu hỏi đã soạn sẵn: `docs/firebase/cau-hoi-chatgpt.md`, chưa có `tu-van-chatgpt.txt`);
  - chưa tạo được dự án Firebase trong trình duyệt của bạn;
  - máy chủ này bị chặn tải gói phần mềm (npm) nên cũng không dùng được Firebase CLI.
- Theo luật "tham khảo ChatGPT 100%", cách làm hiện tại là **bản nháp chờ ChatGPT duyệt**; lần chạy có Chrome sẽ hỏi ChatGPT rồi chỉnh theo.

## Lưu mây hoạt động thế nào (khi đã bật)
1. Mở game → tự đăng nhập **khách (ẩn danh)**, không cần làm gì.
2. Game vẫn lưu vào máy (localStorage) như trước. Cứ khoảng 10 giây, và khi bạn thoát/ẩn trang, bản lưu được **gửi lên mây** (Firestore).
3. Mở game trên máy mới / sau khi xoá dữ liệu trình duyệt: game chờ tối đa 2,5 giây để **lấy bản lưu trên mây về**, rồi mới hiện "Tiếp tục".
4. Trong menu Vùng 1 có dòng trạng thái và nút **"Giữ tiến độ bằng Google"**. Bấm 1 lần để gắn tài khoản Google → sang iPhone/máy khác đăng nhập cùng Google là có tiến độ.
5. Hai máy cùng chơi: **bản chơi sau cùng thắng**; bản bị đè được giữ 1 bản dự phòng (trên máy và trên mây) để cứu nếu cần.
6. **Không có mạng / trang bị chặn mạng** (vd mở trong Artifact của claude.ai): lưu mây tự tắt, game chơi và lưu trên máy bình thường; có mạng lại thì tự gửi lên.
7. Đồng bộ mọi bản lưu có tên bắt đầu `tvcc-` (Vùng 1, lưu chung giữa các vùng, hệ thống đồ…) → các vùng/làng mới **tự được lưu mây**, chỉ cần thêm 2 dòng script (xem dưới).

## Đã làm
- `game/luu-may.js` – mô-đun lưu mây dùng chung (không vẽ gì). Không đụng `game/luu-chung.js` của phiên Cốt truyện (chỉ đồng bộ khoá của họ).
- `game/firebase/cau-hinh.js` – chỗ dán cấu hình dự án Firebase (đang `null` = tắt).
- Móc Vùng 1 (thay đổi nhỏ, có điều kiện): `index.html` nạp 2 script, chờ mây trước khi đọc bản lưu, dòng trạng thái + nút Google (ẩn khi chưa cấu hình); `the-gioi.js` báo "vừa lưu" để gửi sớm.
- `firebase.json` (Hosting: đưa `game/` + `art/` lên, bỏ docs/tools/ảnh nguồn; `/` chuyển tới `/game/`), `firestore.rules` (mỗi người chỉ đọc/ghi bản lưu của chính mình), `.firebaserc`.
- `game/index.html` – trang chọn đơn giản (chỉ chữ): Làng Chuông, Vùng 1, Phòng demo. Chờ màn tiêu đề do ChatGPT thiết kế.
- `.github/workflows/tvcc-firebase.yml` – tự đưa game lên Firebase Hosting mỗi khi nhánh có thay đổi trong `game/`, **chỉ khi** đã có bí mật `FIREBASE_SERVICE_ACCOUNT` (chưa có thì tự bỏ qua).
- Không cần ảnh mới (trạng thái chỉ là chữ trong menu có sẵn) → không ghi yêu cầu ảnh.

## Kiểm thử (đều đạt)
- `node tools/firebase/kiem-thu-luu-may.js` – lõi đồng bộ **17/17**: gửi lên, xoá máy rồi lấy lại, mất mạng không đè mây, máy cũ nhường bản mây, xung đột 2 máy, đang chơi không bị đè, đồng bộ việc xoá, localStorage bị chặn không sập.
- `node tools/firebase/kiem-tra-trinh-duyet.js` (Playwright, Firebase giả lập trong máy) – **17/17**: chơi → lưu lên mây → xoá localStorage → tải lại có tiến độ; tự gửi định kỳ; gắn Google; máy thứ 2 đăng nhập Google nhận tiến độ; hai máy (bản sau thắng, có dự phòng); rớt mạng giữa chừng vẫn chơi rồi tự gửi khi có mạng; chặn mạng hẳn vẫn chơi; chưa cấu hình thì tắt; trang chọn; không lỗi JS.
  (Không dùng được Firebase Emulator thật vì máy chủ chặn npm – lần có mạng nên chạy thêm với emulator.)
- Vùng 1 sau khi móc: kiem-thu-f **66/66**, kiem-thu-g hỏng 0, kiem-thu-h hỏng 0, kiem-tra-vung1 đi P01→…→P12 như trước, không thiếu hình, không lỗi JS. Phép thử Cốt truyện vẫn đạt.

## Giới hạn gói miễn phí Spark (theo tài liệu Firebase – kiểm lại khi tạo dự án)
- Firestore: 1 GiB dữ liệu, ~50.000 lượt đọc + 20.000 lượt ghi mỗi ngày. Mỗi người chơi chỉ 1 tài liệu vài KB, ghi tối đa ~6 lần/phút khi đang chơi → thừa sức cho vài chục người chơi/ngày.
- Hosting: 10 GB lưu trữ, ~360 MB tải xuống/ngày. Ảnh game ~700 MB nhưng người chơi chỉ tải ảnh cần dùng. **Lưu ý:** mỗi lần triển khai giữ 1 phiên bản cũ → nên vào Hosting ▸ "Release storage settings" đặt **giữ 5 phiên bản** để không đầy 10 GB.
- Gói Spark khi hết hạn mức chỉ **tạm ngừng** đến hôm sau, **không tự tính tiền**. Tuyệt đối không bấm "Upgrade/Blaze".

## Việc còn lại (lần chạy CÓ Chrome sẽ tự làm – bạn chỉ cần để Chrome mở và đã đăng nhập Google)
1. Gửi `docs/firebase/cau-hoi-chatgpt.md` cho ChatGPT, lưu `tu-van-chatgpt.txt`, chỉnh mã theo tư vấn.
2. Tạo dự án Firebase MỚI "tieng-vong-cuoi-cung" (không đụng dự án cũ), web app, bật Authentication (Anonymous + Google), Firestore (production) + dán `firestore.rules`, Hosting.
3. Dán cấu hình web app vào `game/firebase/cau-hinh.js`.
4. Tạo khoá service account → thêm bí mật GitHub `FIREBASE_SERVICE_ACCOUNT` (và biến `FIREBASE_PROJECT_ID` nếu mã dự án khác `tieng-vong-cuoi-cung`) → GitHub Actions tự đưa game lên; link chơi sẽ là `https://<mã-dự-án>.web.app/`.

### Nếu bạn muốn tự làm ngay (không bắt buộc)
1. Vào https://console.firebase.google.com → **Thêm dự án** → tên `tieng-vong-cuoi-cung` → tắt Google Analytics → Tạo.
2. Trong dự án: biểu tượng **</>** (Web) → đặt tên → tích "Firebase Hosting" → Đăng ký → **chép khối `firebaseConfig`** gửi cho Claude (hoặc dán vào `game/firebase/cau-hinh.js`).
3. **Authentication** → Bắt đầu → bật **Anonymous** và **Google**.
4. **Firestore Database** → Tạo → chế độ **production** → chọn vùng gần (vd `asia-southeast1`).
5. Báo lại cho Claude; phần còn lại (quy tắc, triển khai) Claude làm.

## Cho các phiên khác (vùng mới, làng)
Trong trang, trước script game: `<script src="../firebase/cau-hinh.js"></script><script src="../luu-may.js"></script>`;
trước khi đọc bản lưu: `if (window.LuuMay && LuuMay.coMay()) await LuuMay.cho(2500);`. Đặt tên khoá localStorage bắt đầu bằng `tvcc-` là tự được lưu mây.
