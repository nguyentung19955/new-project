# Lưu đám mây bằng Firebase

Game đã có sẵn mã lưu đám mây (`js/cloud.js`). Chỉ cần tạo dự án Firebase (miễn phí, gói Spark) và điền cấu hình.

## Cách hoạt động
- Vào game là tự đăng nhập **khách (ẩn danh)**; tiến trình lưu trên máy **và** lên Firestore (`users/{uid}`), gộp các lần lưu trong 4 giây.
- Trong **Cài đặt → Lưu đám mây** bấm **Đăng nhập Google** để giữ tiến trình khi đổi máy / xoá dữ liệu trình duyệt (tài khoản khách được nối vào tài khoản Google, không mất tiến trình).
- Mở game: bản trên mây mới hơn bản trên máy thì tự dùng bản trên mây. Cài đặt (cỡ chữ, đồ hoạ…) giữ theo từng máy.
- Chưa điền cấu hình → game lưu trên máy như cũ.

## Các bước (khoảng 10 phút)
1. Vào https://console.firebase.google.com → **Add project** (tắt Google Analytics cũng được).
2. **Build → Authentication → Get started → Sign-in method**: bật **Anonymous** và **Google**.
3. **Build → Firestore Database → Create database** → chọn vùng `asia-southeast1` → chế độ *production*.
4. Tab **Rules** của Firestore: dán nội dung file `firestore.rules` → **Publish**.
5. **Project settings (bánh răng) → Your apps → Web (</>)** → đặt tên → **Register app** → chép 4 giá trị `apiKey`, `authDomain`, `projectId`, `appId` vào `js/firebase-config.js`.
6. **Authentication → Settings → Authorized domains**: thêm tên miền đang chạy game (ví dụ `ten-ban.github.io` và `sontinhthuytinh.web.app`; `localhost` có sẵn).
7. Gửi 4 giá trị đó cho Claude hoặc tự điền rồi đẩy lên.

## Firebase Hosting tự động
Game có đường dẫn riêng: **https://sontinhthuytinh.web.app** (hoặc https://sontinhthuytinh.firebaseapp.com). Bản GitHub Pages vẫn chạy như cũ.

Mỗi lần có code mới đẩy lên nhánh `claude/mobile-tower-defense-game-k5oxzo` (hoặc `main`), GitHub tự gom bản web vào thư mục `dist-web/` (lệnh `npm run build:hosting`) và đăng lên Firebase Hosting (file `.github/workflows/firebase-hosting.yml`). Nếu `firestore.rules` có đổi thì đăng luôn luật Firestore.

### Việc bạn cần làm một lần (khoảng 5 phút)
1. Vào https://console.firebase.google.com → mở dự án **sontinhthuytinh** → menu trái **Build → Hosting** → bấm **Get started** và bấm **Next** đến hết (không cần chạy lệnh nào trên máy).
2. Lấy khoá cho GitHub: **bánh răng → Project settings → tab Service accounts → Generate new private key → Generate key**. Máy tải về một file `.json` — đây là mật khẩu, **không gửi cho ai, không đẩy lên GitHub**.
3. Vào trang repo trên GitHub → **Settings → Secrets and variables → Actions → New repository secret**:
   - Name: `FIREBASE_SERVICE_ACCOUNT_SONTINHTHUYTINH`
   - Secret: mở file `.json` vừa tải bằng Notepad, chép **toàn bộ** nội dung dán vào → **Add secret**. Xong thì xoá file `.json` trên máy.
4. Firebase console → **Authentication → Settings → Authorized domains → Add domain**: thêm `sontinhthuytinh.web.app` (và `sontinhthuytinh.firebaseapp.com` nếu chưa có) để đăng nhập Google chạy trên đường dẫn mới.
5. Chạy lần đầu: GitHub → tab **Actions → Deploy Firebase Hosting → Run workflow** (hoặc chờ lần đẩy code tiếp theo).

Cách khác cho bước 2–3 (dành cho người quen dòng lệnh): `npm i -g firebase-tools` → `firebase login` → `firebase init hosting:github` — công cụ tự tạo khoá và secret (khi được hỏi, giữ thư mục `dist-web`, **không** cho nó ghi đè `firebase.json` và workflow sẵn có). Lưu ý: khoá tạo kiểu này có thể không đủ quyền đăng luật Firestore — khi đó dán `firestore.rules` tay vào Firestore → Rules.

### Kiểm tra đã chạy chưa
- GitHub → tab **Actions** → **Deploy Firebase Hosting**: dấu ✅ xanh là đã đăng; bấm vào lần chạy sẽ thấy dòng *Đã đăng game* kèm đường dẫn.
- Nếu thấy cảnh báo vàng *“Bỏ qua deploy: chưa có secret…”* → làm lại bước 3.
- Firebase console → **Hosting** cũng liệt kê các lần đăng (Release history).
- Mở https://sontinhthuytinh.web.app, vào **Cài đặt** xem số “Phiên bản” khớp bản mới nhất (trình duyệt có thể cần tải lại trang 1–2 lần để service worker cập nhật).

### Đăng tay (nếu cần)
Trên máy có Node.js: `npm i -g firebase-tools` → `firebase login` → trong thư mục game chạy `firebase deploy` (tự gom `dist-web/` trước khi đăng, đăng cả luật Firestore). Chỉ đăng game: `firebase deploy --only hosting`. Xem thử trên máy: `npm run build:hosting` rồi `firebase emulators:start --only hosting` → mở http://localhost:5000.

## Xem góp ý của người chơi (v149)
Nút **✉ Góp ý** (menu chính, Cài đặt, menu ☰ trong trận) gửi vào Firestore, collection **`feedback`**.

- **Xem**: [Firebase console](https://console.firebase.google.com/project/sontinhthuytinh/firestore/data/~2Ffeedback) → **Firestore Database** → **Data** → `feedback`. Mỗi góp ý là một tài liệu:
  - `kind`: `bug` (Lỗi) / `idea` (Ý tưởng) / `balance` (Cân bằng) / `other` (Khác); `text`: nội dung (10–1000 ký tự); `contact`: liên hệ người chơi tự để lại (có thể trống).
  - `ver` (phiên bản game), `where` (màn đang mở, ải, đợt), `scr` (cỡ màn hình), `ua` (hệ điều hành + trình duyệt rút gọn), `at` (thời điểm viết, mili-giây), `uid` (mã tài khoản ẩn danh), `guest` (true = khách).
  - `shot`: ảnh chụp trận dạng `data:image/jpeg;base64,…` (≤ 150KB, có thể trống). Xem ảnh: chép cả chuỗi, dán vào thanh địa chỉ trình duyệt.
  - **Không** gửi email người dùng. Cần biết ai gửi thì tra `uid` trong **Authentication → Users**.
- Sắp xếp: trong tab Data bấm biểu tượng lọc cạnh tên collection, chọn sắp theo `at` giảm dần. Xem xong có thể xoá tài liệu ngay trong console.
- **Luật**: ai đã đăng nhập (kể cả khách ẩn danh) chỉ được **tạo** góp ý; không ai đọc / sửa / xoá được từ máy người chơi. Luật kiểm tra loại, độ dài từng trường (ảnh ≤ 200000 ký tự), `uid` phải đúng người gửi.
- **Phải đăng luật mới** (`firestore.rules` có thêm mục `feedback`) — chưa đăng thì mọi góp ý bị từ chối và nằm trong hàng đợi trên máy người chơi:
  - Workflow `.github/workflows/firebase-hosting.yml` tự đăng luật khi `firestore.rules` đổi trong lần đẩy code lên nhánh chính (cần secret `FIREBASE_SERVICE_ACCOUNT_SONTINHTHUYTINH` có quyền Firestore). Xem bước **Đăng luật Firestore** trong tab Actions; bị vàng/cảnh báo thì làm tay bên dưới.
  - Làm tay: Firestore → **Rules** → dán nội dung `firestore.rules` → **Publish**. Hoặc Actions → *Deploy Firebase Hosting* → **Run workflow** và tick *Đăng cả luật Firestore*.
- Giới hạn phía máy người chơi: 1 góp ý / 60 giây, 10 góp ý / ngày. Không có mạng, chưa bật Firebase hoặc gửi lỗi → lưu tối đa 5 góp ý trong `localStorage` (`nuicao.feedback`), tự gửi lại khi có mạng / khi mở game hoặc mở bảng góp ý lần sau.
- Gói miễn phí: mỗi góp ý là 1 lượt ghi (20.000 lượt/ngày miễn phí); ảnh ~40–150KB mỗi cái — 1GB lưu trữ đủ cho hàng nghìn góp ý có ảnh.

## Giới hạn gói miễn phí
50.000 lượt đọc + 20.000 lượt ghi Firestore mỗi ngày. Mỗi người chơi ghi tối đa khoảng 1 lần / 4 giây khi đang thay đổi tiến trình — đủ cho vài trăm người chơi mỗi ngày.

## Lưu ý
- Bản thử trên claude.ai (artifact) chặn kết nối ra ngoài nên **không** lưu đám mây được; chỉ chạy khi game đặt trên web thật (GitHub Pages, Firebase Hosting…).
