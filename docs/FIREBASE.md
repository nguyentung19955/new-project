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
Game có đường dẫn riêng: **https://thanthoaiviet.web.app** (tên đẹp) và **https://sontinhthuytinh.web.app** (tên gốc của dự án) — hai đường dẫn cùng một bản game, cùng dữ liệu người chơi. Bản GitHub Pages vẫn chạy như cũ.

Mỗi lần có code mới đẩy lên nhánh `claude/mobile-tower-defense-game-k5oxzo` (hoặc `main`), GitHub tự gom bản web vào thư mục `dist-web/` (lệnh `npm run build:hosting`) và đăng lên Firebase Hosting (file `.github/workflows/firebase-hosting.yml`). Nếu `firestore.rules` có đổi thì đăng luôn luật Firestore.

### Việc bạn cần làm một lần (khoảng 5 phút)
1. Vào https://console.firebase.google.com → mở dự án **sontinhthuytinh** → menu trái **Build → Hosting** → bấm **Get started** và bấm **Next** đến hết (không cần chạy lệnh nào trên máy).
2. Lấy khoá cho GitHub: **bánh răng → Project settings → tab Service accounts → Generate new private key → Generate key**. Máy tải về một file `.json` — đây là mật khẩu, **không gửi cho ai, không đẩy lên GitHub**.
3. Vào trang repo trên GitHub → **Settings → Secrets and variables → Actions → New repository secret**:
   - Name: `FIREBASE_SERVICE_ACCOUNT_SONTINHTHUYTINH`
   - Secret: mở file `.json` vừa tải bằng Notepad, chép **toàn bộ** nội dung dán vào → **Add secret**. Xong thì xoá file `.json` trên máy.
4. Firebase console → **Authentication → Settings → Authorized domains → Add domain**: thêm `sontinhthuytinh.web.app` và `thanthoaiviet.web.app` (và `sontinhthuytinh.firebaseapp.com` nếu chưa có) để đăng nhập Google chạy trên đường dẫn mới.
   - Site tên đẹp `thanthoaiviet`: **Hosting** → kéo xuống cuối trang → **Add another site** → gõ `thanthoaiviet` → **Add site**. Tên site là duy nhất trên toàn Firebase; nếu bị báo đã có người dùng thì chọn tên khác và sửa `thanthoaiviet` trong `.firebaserc` cho khớp. Chưa tạo site thì workflow chỉ cảnh báo vàng, đường dẫn sontinhthuytinh.web.app vẫn được cập nhật.
5. Chạy lần đầu: GitHub → tab **Actions → Deploy Firebase Hosting → Run workflow** (hoặc chờ lần đẩy code tiếp theo).

Cách khác cho bước 2–3 (dành cho người quen dòng lệnh): `npm i -g firebase-tools` → `firebase login` → `firebase init hosting:github` — công cụ tự tạo khoá và secret (khi được hỏi, giữ thư mục `dist-web`, **không** cho nó ghi đè `firebase.json` và workflow sẵn có). Lưu ý: khoá tạo kiểu này có thể không đủ quyền đăng luật Firestore — khi đó dán `firestore.rules` tay vào Firestore → Rules.

### Kiểm tra đã chạy chưa
- GitHub → tab **Actions** → **Deploy Firebase Hosting**: dấu ✅ xanh là đã đăng; bấm vào lần chạy sẽ thấy dòng *Đã đăng game* kèm đường dẫn.
- Nếu thấy cảnh báo vàng *“Bỏ qua deploy: chưa có secret…”* → làm lại bước 3.
- Firebase console → **Hosting** cũng liệt kê các lần đăng (Release history).
- Mở https://sontinhthuytinh.web.app, vào **Cài đặt** xem số “Phiên bản” khớp bản mới nhất (trình duyệt có thể cần tải lại trang 1–2 lần để service worker cập nhật).

### Đăng tay (nếu cần)
Trên máy có Node.js: `npm i -g firebase-tools` → `firebase login` → trong thư mục game chạy `firebase deploy` (tự gom `dist-web/` trước khi đăng, đăng cả luật Firestore). Chỉ đăng game: `firebase deploy --only hosting` (cả hai site), hoặc một site: `firebase deploy --only hosting:main` / `hosting:thanthoaiviet`. Xem thử trên máy: `npm run build:hosting` rồi `firebase emulators:start --only hosting` → mở http://localhost:5000.

## Xem góp ý của người chơi (v149)
Nút **✉ Góp ý** (menu chính, Cài đặt, menu ☰ trong trận) gửi vào Firestore, collection **`feedback`**.

- **Xem**: [Firebase console](https://console.firebase.google.com/project/sontinhthuytinh/firestore/data/~2Ffeedback) → **Firestore Database** → **Data** → `feedback`. Mỗi góp ý là một tài liệu:
  - `kind`: `bug` (Lỗi) / `idea` (Ý tưởng) / `balance` (Cân bằng) / `other` (Khác); `text`: nội dung (10–1000 ký tự); `contact`: liên hệ người chơi tự để lại (có thể trống).
  - `ver` (phiên bản game), `where` (màn đang mở, ải, đợt), `scr` (cỡ màn hình), `ua` (hệ điều hành + trình duyệt rút gọn), `at` (thời điểm viết, mili-giây), `uid` (mã tài khoản ẩn danh), `guest` (true = khách).
  - `shot`: ảnh chụp trận dạng `data:image/jpeg;base64,…` (≤ 150KB, có thể trống). Xem ảnh: chép cả chuỗi, dán vào thanh địa chỉ trình duyệt.
  - **Không** gửi email người dùng. Cần biết ai gửi thì tra `uid` trong **Authentication → Users**.
- Sắp xếp: trong tab Data bấm biểu tượng lọc cạnh tên collection, chọn sắp theo `at` giảm dần. Xem xong có thể xoá tài liệu ngay trong console.
- **Luật**: ai đã đăng nhập (kể cả khách ẩn danh) chỉ được **tạo** góp ý. Luật kiểm tra loại, độ dài từng trường (ảnh ≤ 200000 ký tự), `uid` phải đúng người gửi. Từ v163 chỉ tài khoản quản trị đọc / đổi trạng thái / xoá được (xem mục dưới).
- **Phải đăng luật mới** (`firestore.rules` có thêm mục `feedback`) — chưa đăng thì mọi góp ý bị từ chối và nằm trong hàng đợi trên máy người chơi:
  - Workflow `.github/workflows/firebase-hosting.yml` tự đăng luật khi `firestore.rules` đổi trong lần đẩy code lên nhánh chính (cần secret `FIREBASE_SERVICE_ACCOUNT_SONTINHTHUYTINH` có quyền Firestore). Xem bước **Đăng luật Firestore** trong tab Actions; bị vàng/cảnh báo thì làm tay bên dưới.
  - Làm tay: Firestore → **Rules** → dán nội dung `firestore.rules` → **Publish**. Hoặc Actions → *Deploy Firebase Hosting* → **Run workflow** và tick *Đăng cả luật Firestore*.
- Giới hạn phía máy người chơi: 1 góp ý / 60 giây, 10 góp ý / ngày. Không có mạng, chưa bật Firebase hoặc gửi lỗi → lưu tối đa 5 góp ý trong `localStorage` (`nuicao.feedback`), tự gửi lại khi có mạng / khi mở game hoặc mở bảng góp ý lần sau.
- Gói miễn phí: mỗi góp ý là 1 lượt ghi (20.000 lượt/ngày miễn phí); ảnh ~40–150KB mỗi cái — 1GB lưu trữ đủ cho hàng nghìn góp ý có ảnh.

## Xem góp ý trong game (v163)
Tài khoản **ly230595@gmail.com** (đã đăng nhập, email đã xác minh) thấy nút **📥 Góp ý nhận được** trong **Cài đặt**, dòng *Góp ý* (chấm đỏ = số góp ý *Mới* trong 50 góp ý gần nhất; nút **Cài Đặt** ở menu chính cũng có chấm đỏ). Người khác — khách, tài khoản khác, email chưa xác minh — không thấy gì.

- **Màn Góp ý nhận được**: mới nhất trước, mỗi lần tải 20 mục (**Tải thêm** để xem tiếp). Mỗi mục: loại (Lỗi / Ý tưởng / Cân bằng / Khác, có màu), giờ Việt Nam, nội dung, liên hệ, phiên bản, màn / ải / đợt, cỡ màn hình, máy + trình duyệt, khách hay đã đăng nhập; ảnh chụp thu nhỏ — chạm để xem to.
- **Lọc** theo loại và trạng thái (*Mới* / *Đã xem* / *Đã xử lý*) — lọc trong số đã tải, không đủ thì bấm Tải thêm. Bấm nút trạng thái trên từng mục để đổi; **✎ Ghi chú** (≤ 300 ký tự, chỉ quản trị thấy); **🗑 Xoá** → hỏi lại ngay trong mục → **Xoá** để xoá hẳn.
- Góp ý cũ chưa có trường `status` được tính là *Mới*.
- **Đăng nhập bằng Google** thì email luôn được xác minh. Nếu tạo tài khoản bằng email + mật khẩu, Cài đặt hiện nút **📥 Xác minh email**: bấm lần 1 gửi thư xác minh, bấm vào liên kết trong thư, rồi bấm nút lần nữa.
- **Bảo mật thật nằm ở luật Firestore**: hàm `isAdmin()` trong `firestore.rules` (khối `feedback/{id}`) là nơi duy nhất ghi email quản trị phía máy chủ; `ADMIN_EMAILS` trong `js/cloud.js` chỉ để hiện / ẩn nút. Đổi / thêm quản trị → sửa **cả hai** chỗ rồi đăng lại luật. Luật chỉ cho quản trị đổi đúng 2 trường `status` (`new` / `seen` / `done`) và `note`; không sửa được nội dung người chơi gửi.
- **BẮT BUỘC đăng lại luật** (workflow tự đăng luật hiện bị lỗi 403): Firebase console → **Firestore Database** → **Rules** → xoá hết, dán toàn bộ nội dung `firestore.rules` → **Publish**. Chưa đăng thì màn báo *"Máy chủ chưa đăng luật mới"*.
- Thử luật trên máy (cần Java): `npm i firebase-tools @firebase/rules-unit-testing firebase` ở một thư mục tạm, rồi `NODE_PATH=<tạm>/node_modules <tạm>/node_modules/.bin/firebase emulators:exec --only firestore --project demo-tt "node tests/xem-gop-y/rules-emulator.test.js"`.
- Không cần chỉ mục ghép (sắp theo `at` dùng chỉ mục một trường có sẵn). Mỗi lần mở màn = tối đa 20 lượt đọc (+50 khi đăng nhập để đếm chấm báo).

## Giới hạn gói miễn phí
50.000 lượt đọc + 20.000 lượt ghi Firestore mỗi ngày. Mỗi người chơi ghi tối đa khoảng 1 lần / 4 giây khi đang thay đổi tiến trình — đủ cho vài trăm người chơi mỗi ngày.

## Lưu ý
- Bản thử trên claude.ai (artifact) chặn kết nối ra ngoài nên **không** lưu đám mây được; chỉ chạy khi game đặt trên web thật (GitHub Pages, Firebase Hosting…).

## Chơi nhóm "Cùng Giữ Thành" (v153) — BẮT BUỘC deploy lại luật
Chế độ chơi nhóm truyền tin qua Firestore: `rooms/{mã 6 ký tự}` (phòng) và 4 bảng con `cmds` (lô lệnh của người điều phối), `reqs` (yêu cầu của người chơi), `snap` (ảnh chụp trạng thái để đồng bộ lại / vào lại phòng), `chat` (trò chuyện: tin ≤ 120 ký tự, thời điểm = giờ máy chủ, chỉ tạo mới).

1. **Deploy luật mới** (không làm thì không tạo được phòng — báo lỗi quyền): Firestore → tab **Rules** → dán toàn bộ `firestore.rules` → **Publish**; hoặc `firebase deploy --only firestore:rules`.
   Luật mới: chỉ 2 thành viên đọc / ghi phòng; người thứ hai chỉ được tự thêm mình vào phòng đang chờ còn 1 chỗ; chỉ người điều phối ghi `cmds` / `snap`; giới hạn kích thước (lô lệnh < 20 KB, yêu cầu < 4 KB, ảnh chụp < 900 KB); phòng có `expiresAt` tối đa 13 giờ, hết hạn thì không đọc / ghi được nữa.
2. **(Nên làm) Tự xoá phòng cũ:** Firestore → **TTL policies** → tạo 5 chính sách trên trường `expiresAt` cho các nhóm bộ sưu tập `rooms`, `cmds`, `reqs`, `snap`, `chat`. Firestore tự xoá tài liệu đã hết hạn (trong vòng ~24 giờ).
3. Không cần tạo chỉ mục (index): các truy vấn chỉ dùng một trường (`seq` / `at`).

**Chi phí gói miễn phí:** một trận nhóm ~20 phút: người điều phối ghi khoảng 1,7 lô / giây khi có đồng đội (~2.000 lần ghi), khách ghi tín hiệu còn sống mỗi 4 giây + mỗi thao tác (~400 lần ghi); số lần đọc tương tự. Gói Spark (20.000 ghi / 50.000 đọc mỗi ngày) đủ khoảng 8 trận nhóm mỗi ngày.
