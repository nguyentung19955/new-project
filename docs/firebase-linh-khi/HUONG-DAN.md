# Linh Khí và Firebase: hướng dẫn cho chủ dự án

Linh Khí dùng chung dự án Firebase **sontinhthuytinh** với game Thần Thoại Việt. Dữ liệu hai game nằm riêng:

| Bảng (collection) | Chứa gì |
| --- | --- |
| `linhkhi_users` | Bản lưu tiến trình của từng người chơi (mỗi người một tài liệu, tên tài liệu là mã người chơi `uid`) |
| `linhkhi_scores` | Bảng vàng (xếp hạng): mỗi người một dòng |
| `linhkhi_feedback` | Góp ý người chơi gửi |

Thần Thoại Việt vẫn dùng `users`, `boards`, `feedback`, `rooms` như cũ, không bị đụng tới.

## Việc chủ dự án cần làm (một lần, khoảng 5 phút)

1. **Dán luật mới.** Mở https://console.firebase.google.com → dự án **sontinhthuytinh** → menu trái **Build → Firestore Database** → thẻ **Rules**.
   Xoá hết chữ đang có, mở tệp `game/firebase/firestore.rules.gop` trong repo (nhánh `khoi-tao-du-an`), chép **toàn bộ** nội dung dán vào → bấm **Publish**.
   Tệp này là luật cũ của Thần Thoại Việt giữ nguyên, thêm ba khối của Linh Khí ở cuối. Chưa làm bước này thì Linh Khí vẫn chơi được, vẫn lưu trên máy, nhưng lưu mây, bảng vàng và góp ý bị máy chủ từ chối (góp ý nằm chờ trên máy người chơi, tự gửi lại sau khi có luật).
   - Nếu sau này luật của Thần Thoại Việt đổi, chỉ cần chép ba khối trong `game/firebase/linhkhi.rules` dán vào **bên trong** `match /databases/{database}/documents { ... }` của luật mới (ngay trước hai dấu `}` cuối tệp), rồi Publish.
2. **Kiểm tra tên miền được đăng nhập.** **Build → Authentication → Settings → Authorized domains**: phải có `nguyentung19955.github.io`. Chưa có thì bấm **Add domain**, gõ `nguyentung19955.github.io`, **Add**. Thiếu bước này thì nút "Đăng nhập Google" trong game báo "Tên miền này chưa được cho phép trong Firebase" (chơi khách vẫn được).
3. **Đăng nhập Ẩn danh và Google** đã bật sẵn cho Thần Thoại Việt (Authentication → Sign-in method), không cần làm gì thêm.

Không có khoá bí mật nào trong repo. Bốn giá trị trong `game/js/firebase-config.js` là cấu hình web công khai của Firebase, ai cũng thấy được; dữ liệu được bảo vệ bằng luật ở bước 1.

## Người chơi thấy gì

- **Vào game là tự đăng nhập khách.** Tiến trình vẫn lưu trên máy như cũ và được đẩy lên mây, các lần lưu sát nhau trong 4 giây gộp làm một.
- **Anh Mõ (Cài đặt)** có mục *Lưu tiến trình*: dòng trạng thái "Đã lưu lên mây lúc 14:32" hoặc "Đang ngoại tuyến…", nút **Đăng nhập Google** (nối tài khoản khách vào Google, giữ nguyên mọi thứ, để chơi tiếp khi đổi máy), nút **✉ Góp ý**.
- **Mở game trên máy khác** (đã đăng nhập Google): bản trên mây mới hơn thì tự dùng bản trên mây. Nếu bản trên máy đang mở lại đi xa hơn rõ rệt, game hiện khung hỏi giữ bản nào để không ai mất tiến trình. Âm thanh bật/tắt giữ theo từng máy.
- **Bảng vàng** ở **Cụ Đồ** (gốc đa), thẻ thứ ba: các thẻ Sức mạnh / Sao / Mộc Tinh / Ngư Tinh / Hồ Tinh, 50 người đầu, mỗi lần tải 8 dòng, dòng của mình luôn hiện ở dưới, nút **Đổi tên** (2 đến 16 ký tự). Tên mặc định là tên Google hoặc "Khách" kèm 4 số. Người chơi chỉ lên bảng sau khi qua ải đầu tiên. Hạ trùm vùng nhanh hơn lần trước thì màn kết quả có dòng "★ Kỷ lục mới".
- **✉ Góp ý** ở Anh Mõ, ở bảng tạm dừng trong trận và ở màn kết quả. Chọn loại Lỗi / Ý tưởng / Cân bằng / Khác, viết 10 đến 1000 ký tự, liên hệ (không bắt buộc). Mở trong trận thì có ô đính kèm ảnh chụp trận (đã chọn sẵn). Mỗi máy gửi tối đa 1 góp ý mỗi phút, 10 góp ý mỗi ngày; mất mạng thì giữ tối đa 5 góp ý trên máy và tự gửi khi có mạng.

## Xem góp ý

### Trong game (cách dễ nhất)

1. Mở game trên https://nguyentung19955.github.io/new-project/linh-khi/ → gặp **Anh Mõ** → **Đăng nhập Google** bằng **ly230595@gmail.com**.
2. Bảng Anh Mõ hiện thêm nút vàng **📥 Góp ý nhận được**, có chấm đỏ và số góp ý *Mới*. Người khác không thấy nút này (máy chủ cũng chặn họ đọc).
3. Màn góp ý: mới nhất trước, mỗi lần 20 mục, **Tải thêm** để xem cũ hơn. Lọc theo loại và trạng thái. Mỗi mục có: loại, giờ Việt Nam, nội dung, liên hệ, phiên bản, chỗ đang mở (màn, vùng, ải, phòng), cỡ màn hình, máy và trình duyệt; ảnh nhỏ, chạm để xem to.
4. Bấm **Mới / Đã xem / Đã xử lý** để đổi trạng thái, **✎ Ghi chú** để ghi chú riêng (tối đa 300 ký tự), **🗑 Xoá** rồi bấm **Xoá** lần nữa để xoá hẳn.

### Trong Firebase console

**Firestore Database → Data → `linhkhi_feedback`**. Mỗi tài liệu là một góp ý:
`kind` (bug = Lỗi, idea = Ý tưởng, balance = Cân bằng, other = Khác), `text` (nội dung), `contact` (liên hệ), `shot` (ảnh dạng `data:image/jpeg;base64,…`: chép cả chuỗi dán vào thanh địa chỉ trình duyệt để xem), `ver` (phiên bản), `where` (chỗ đang mở), `scr` (màn hình), `ua` (máy, trình duyệt), `at` (thời điểm, tính bằng mili-giây), `uid` (mã người chơi), `guest` (true là khách), `status` và `note` (do quản trị đặt). Game **không** gửi email hay tên người chơi.

## Giới hạn gói miễn phí (Spark)

Mỗi ngày 50.000 lượt đọc, 20.000 lượt ghi, 1 GB lưu trữ, dùng chung cho cả hai game.

- Lưu tiến trình: tối đa khoảng 1 lượt ghi mỗi 4 giây khi người chơi đang thay đổi gì đó; lưu mà không có gì đổi thì không ghi. Mở game: 1 lượt đọc.
- Bảng vàng: chỉ ghi khi có số tốt hơn hoặc đổi tên. Mỗi trang xem 8 lượt đọc, tối đa 50 dòng mỗi thẻ; bảng giữ trong máy 2 phút trước khi tải lại.
- Góp ý: 1 lượt ghi mỗi góp ý; ảnh khoảng 40 đến 150 KB. Quản trị mở màn góp ý tốn tối đa 20 lượt đọc mỗi trang, cộng 50 lượt khi đăng nhập để đếm chấm đỏ.

Như vậy đủ cho vài trăm người chơi mỗi ngày.

## Lưu ý

- **Bản xem trước trên claude.ai không kết nối được mây** (khung xem trước chặn kết nối ra ngoài). Game tự nhận ra, tắt phần mây, vẫn chơi và lưu trên máy bình thường; Anh Mõ ghi "Bản xem trước: không kết nối được mây".
- Mở tệp `dist/linh-khi.html` thẳng từ máy (đường dẫn `file://`) cũng chỉ lưu trên máy.
- Không có mạng hoặc không tải được thư viện Firebase: game tự tắt mây, không báo lỗi, có mạng lại thì tự kết nối.
- Muốn tắt hẳn mây: xoá giá trị `apiKey` trong `game/js/firebase-config.js`, hoặc mở game với đuôi `?cloud=0`.
- Đổi hoặc thêm tài khoản quản trị: sửa **cả hai** chỗ: hàm `isAdmin()` trong khối `linhkhi_feedback` của luật (rồi Publish lại) và `ADMIN_EMAILS` trong `game/js/cloud.js`.
