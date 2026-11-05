# TURRET MERGE — Firebase (đã cấu hình sẵn trên console)

- Project: **turret-merge** (gói Spark, miễn phí). Web config: `thap/js/online/firebase-config.js` (`window.FIREBASE_CONFIG`, đã có `databaseURL`).
- Authentication: bật **Anonymous** + **Google**. Tên hiển thị "Turret Merge". Authorized domain: `nguyentung19955.github.io` (localhost có sẵn).
- Realtime Database: `https://turret-merge-default-rtdb.asia-southeast1.firebasedatabase.app` (Singapore).
- Mọi dữ liệu game nằm dưới `turretmerge/`:
  - `turretmerge/profiles/{uid}` — hồ sơ người chơi (tên, avatar, deck, tiến độ). Chỉ chủ uid được ghi.
  - `turretmerge/rooms/{code}` — phòng CO-OP/PVP; `members/{uid}` = người trong phòng. Người đã đăng nhập đọc được; ghi khi tạo phòng mới, đã là thành viên, hoặc tự thêm mình vào `members`. Giới hạn 2 người kiểm tra ở client.
- Rules đã publish:
```json
{"rules":{"turretmerge":{
  "profiles":{"$uid":{".read":"auth != null",".write":"auth != null && auth.uid === $uid"}},
  "rooms":{"$code":{".read":"auth != null",
    ".write":"auth != null && (!data.exists() || data.child('members').child(auth.uid).exists() || newData.child('members').child(auth.uid).exists())"}}}}}
```
- Dùng Firebase JS SDK compat qua CDN (gstatic), đăng nhập ẩn danh mặc định, nút "Liên kết Google" để giữ tài khoản. Không cần Firestore/Functions.
