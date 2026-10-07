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
6. **Authentication → Settings → Authorized domains**: thêm tên miền đang chạy game (ví dụ `ten-ban.github.io` hoặc tên miền Firebase Hosting; `localhost` có sẵn).
7. Gửi 4 giá trị đó cho Claude hoặc tự điền rồi đẩy lên.

## Đưa game lên mạng (tuỳ chọn)
Firebase Hosting cùng dự án: cài `npm i -g firebase-tools` → `firebase login` → `firebase use --add` (chọn dự án) → `firebase deploy`. File `firebase.json` đã cấu hình sẵn (đăng cả luật Firestore).

## Giới hạn gói miễn phí
50.000 lượt đọc + 20.000 lượt ghi Firestore mỗi ngày. Mỗi người chơi ghi tối đa khoảng 1 lần / 4 giây khi đang thay đổi tiến trình — đủ cho vài trăm người chơi mỗi ngày.

## Lưu ý
- Bản thử trên claude.ai (artifact) chặn kết nối ra ngoài nên **không** lưu đám mây được; chỉ chạy khi game đặt trên web thật (GitHub Pages, Firebase Hosting…).

## Chơi nhóm "Cùng Giữ Thành" (v141) — BẮT BUỘC deploy lại luật
Chế độ chơi nhóm truyền tin qua Firestore: `rooms/{mã 6 ký tự}` (phòng) và 3 bảng con `cmds` (lô lệnh của người điều phối), `reqs` (yêu cầu của người chơi), `snap` (ảnh chụp trạng thái để đồng bộ lại / vào lại phòng).

1. **Deploy luật mới** (không làm thì không tạo được phòng — báo lỗi quyền): Firestore → tab **Rules** → dán toàn bộ `firestore.rules` → **Publish**; hoặc `firebase deploy --only firestore:rules`.
   Luật mới: chỉ 2 thành viên đọc / ghi phòng; người thứ hai chỉ được tự thêm mình vào phòng đang chờ còn 1 chỗ; chỉ người điều phối ghi `cmds` / `snap`; giới hạn kích thước (lô lệnh < 20 KB, yêu cầu < 4 KB, ảnh chụp < 900 KB); phòng có `expiresAt` tối đa 13 giờ, hết hạn thì không đọc / ghi được nữa.
2. **(Nên làm) Tự xoá phòng cũ:** Firestore → **TTL policies** → tạo 4 chính sách trên trường `expiresAt` cho các nhóm bộ sưu tập `rooms`, `cmds`, `reqs`, `snap`. Firestore tự xoá tài liệu đã hết hạn (trong vòng ~24 giờ).
3. Không cần tạo chỉ mục (index): các truy vấn chỉ dùng một trường (`seq`).

**Chi phí gói miễn phí:** một trận nhóm ~20 phút: người điều phối ghi khoảng 1,7 lô / giây khi có đồng đội (~2.000 lần ghi), khách ghi tín hiệu còn sống mỗi 4 giây + mỗi thao tác (~400 lần ghi); số lần đọc tương tự. Gói Spark (20.000 ghi / 50.000 đọc mỗi ngày) đủ khoảng 8 trận nhóm mỗi ngày.
