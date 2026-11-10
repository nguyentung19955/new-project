# Quyền ADMIN (người dùng chốt 10/11)

## Ai là admin
- Tài khoản Google `ly230595@gmail.com` (so chữ thường, phải `emailVerified`). Email chỉ ghi ở `thap/js/admin.js` và file này.
- `ADMIN.la()` (thap/js/admin.js, nạp trước data.js) — đọc từ tài khoản hiện tại qua `NET.khiDoiTK` (net.js gửi thêm `ev` = emailVerified).
- Cache `localStorage.turret_admin = { uid }` (không lưu email) để mở ngoại tuyến vẫn nhận. Xoá khi đăng xuất (về khách), đổi sang tài khoản Google khác, hoặc email chưa xác minh.

## Admin được gì
- **Bỏ mọi khoá**: tính năng `TT.tnMo` (shop, vòng quay, nhiệm vụ ngày/tuần, Rương Vàng/Thần thoại, lò rèn, Ấn Vàng, Ấn Đỏ, online, CO-OP/PVP), bậc ụ `TT.bacMo`,
  Leo Tháp đủ 100 tầng `CD.thapMo`, Thử thách `CD.thuMo`, Săn Trùm mọi trùm + bậc cao nhất (`CD.trumHa`, `CD.bacMo`, khoá 'san'), Vô tận (khoá 'vt'), thử thách tuần ('tw'), chỉ huy `mvCo`.
- **Sở hữu ảo đủ 96 ụ (cả Đỏ)**: `SH.co()` trả "đã có" khi admin; `SH.coThat()` là dữ liệu thật (dùng khi ghi sở hữu / nhãn NEW). `SH.mo()` = mở.
- Nhãn nhỏ "ADMIN" trên chip phi công ở HOME và trong bảng PILOT PROFILE.

## Admin KHÔNG được gì
- Không ghi đè dữ liệu thật: `turret_kt.sh.co`, bản sao / cấp thẻ (`turret_the`), XP, chỉ huy đã mở giữ nguyên → đăng xuất là về đúng như cũ.
- Không cộng tài nguyên: vàng, ngọc, Tinh thể Đỏ, vé Săn Trùm, lượt rèn/Ấn trong tuần vẫn tính như người thường (chỉ bỏ điều kiện mở).
- Trong trận (PVP / co-op / online): cấp thẻ theo dữ liệu thật; lợi thế duy nhất là chọn được mọi ụ.
- Rương / cửa hàng: bể rơi gồm mọi ụ (vì coi như đã mở hết) — không tăng số thẻ hay tỉ lệ.

## Giới hạn bảo mật (quan trọng)
- Đây là **kiểm phía máy khách**: ai sửa JS (hoặc ghi `turret_admin` vào localStorage) cũng bật được. Chỉ dùng cho thử nghiệm / trình diễn.
- Quyền thật phải kiểm ở server (Firebase Rules / custom claims, bảng xếp hạng, phần thưởng online) — để **giai đoạn F**.
  Tới lúc đó: không tin `ADMIN.la()` cho bất cứ thứ gì ghi lên server.

## Kiểm
- `tools/thap-kt-admin.js`: stub tài khoản Google đúng email → mọi khoá mở + 96 ụ dùng được + dữ liệu thật y nguyên; email khác / chưa xác minh / khách → như cũ; tải lại vẫn admin; đăng xuất về như cũ.
