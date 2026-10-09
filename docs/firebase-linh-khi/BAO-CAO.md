# Báo cáo: nối Linh Khí với Firebase

Nhánh `claude/firebase-linh-khi`, làm từ `khoi-tao-du-an`. Dùng chung dự án Firebase **sontinhthuytinh** với Thần Thoại Việt, dữ liệu Linh Khí tách riêng ở ba bảng `linhkhi_users`, `linhkhi_scores`, `linhkhi_feedback`. Việc chủ dự án cần làm: xem `HUONG-DAN.md` (dán luật đầy đủ và Publish, kiểm tra tên miền `nguyentung19955.github.io`).

## Đã làm

1. **Lưu tiến trình lên mây** (`game/js/cloud.js`, `game/js/firebase-config.js`)
   - Vào game tự đăng nhập khách. Mỗi lần game lưu mà nội dung có đổi thì đặt hẹn 4 giây, các lần lưu sát nhau gộp làm một lần ghi. Lưu mà không có gì đổi thì không ghi.
   - Mở game: bản trên mây mới hơn thì dùng bản trên mây; bản trên máy mới hơn thì đẩy lên. Nếu bản trên mây mới hơn mà bản trên máy đi xa hơn rõ rệt (nhiều sao, ải xa, cấp cao hơn), game hiện khung **Chọn bản lưu** có tóm tắt hai bản; đóng khung là giữ bản trên máy. Đang trong ải thì chờ về làng mới thay bản lưu.
   - Âm thanh bật/tắt giữ theo từng máy. Bản lưu cũ vẫn đọc được (chỉ thêm hai trường `savedAt`, `owner`, và `rec`, `lbName` cho bảng vàng).
   - Anh Mõ: mục *Lưu tiến trình* với dòng trạng thái ("Đã lưu lên mây lúc …", "Đang lưu…", "Đang ngoại tuyến…", "Bản xem trước…"), nút **Đăng nhập Google** (nối khách vào Google, giữ uid và tiến trình; tài khoản Google đã có dữ liệu thì chuyển sang tài khoản đó, hỏi lại nếu bản trên máy hơn rõ rệt), số phiên bản.
   - Tự tắt mây, không tải gì, không báo lỗi khi: không có cấu hình, mở từ tệp (`file://`), chạy trong khung xem trước khác nguồn (claude.ai), máy báo không có mạng. Tải thư viện thất bại thì cũng tắt, có mạng lại thì tự thử lại.
2. **Hòm thư góp ý** (`game/js/cloud_ui.js`): nút **✉ Góp ý** ở Anh Mõ, bảng tạm dừng (nút mới dưới cùng), màn kết quả (nút nhỏ góc trên phải). Bốn loại, 10 đến 1000 ký tự, liên hệ, ảnh chụp trận (chỉ khi mở trong trận, JPEG ≤ 150 KB). Tự gửi kèm phiên bản, chỗ đang mở, màn hình, máy và trình duyệt, thời điểm, uid; không gửi email. 1 góp ý mỗi 60 giây, 10 mỗi ngày, mất mạng giữ tối đa 5 góp ý và tự gửi lại. Quản trị (ly230595@gmail.com, đăng nhập Google) có nút **📥 Góp ý nhận được** kèm số góp ý mới: xem mới nhất trước, tải thêm, lọc loại và trạng thái, đổi trạng thái, ghi chú, xoá có hỏi lại, xem ảnh to.
3. **Bảng vàng** (`game/js/bang_vang.js`): thẻ thứ ba ở Cụ Đồ. Thẻ Sức mạnh / Sao / Mộc Tinh / Ngư Tinh / Hồ Tinh, mỗi lần tải 8 dòng, tối đa 50, dòng của mình luôn hiện ở dưới, nút Đổi tên (2 đến 16 ký tự, lọc ký tự lạ), Tải lại. Dòng trên mây chỉ ghi khi có số tốt hơn hoặc đổi tên; chỉ người đã qua ít nhất một ải mới lên bảng. Hạ trùm vùng nhanh hơn kỷ lục riêng thì màn kết quả có dòng vàng "★ Kỷ lục mới: Ngư Tinh 41,5 giây". Không có mạng thì thẻ báo cần mạng và hiện kỷ lục trên máy.
4. **Luật Firestore**: `game/firebase/linhkhi.rules` (ba khối Linh Khí: đúng uid, đúng kiểu, độ dài, số trong khoảng hợp lý, bảng vàng chỉ tốt lên, quản trị chỉ đổi `status`/`note`) và `game/firebase/firestore.rules.gop` (luật Thần Thoại Việt giữ nguyên + ba khối Linh Khí). Khối luật của game kia không đổi.
5. `build.py`: cho phép đúng một địa chỉ ngoài trong mã JS là thư viện Firebase trên gstatic (chỉ tải lúc chạy trên web thật).

## Kiểm tra

- `tests/may.py` (mới, không cần mạng, Firebase giả `tests/fake_firebase.js`, chặn tải từ gstatic): **100/100 đạt**. Gồm: tắt mây khi mở từ tệp / không cấu hình / chặn mạng (cả `index.html` và `dist/linh-khi.html` chạy qua http) mà game vẫn vào làng, vào ải; khách tự đăng nhập; 6 lần lưu trong 1 giây thành 1 lần ghi; mất mạng rồi có mạng lại; chọn bản mới hơn, giữ âm thanh theo máy, hỏi lại khi máy đi xa hơn (chọn được cả hai phía), bản lưu cũ; nối Google giữ uid; nút quản trị chỉ hiện với đúng email đã xác minh; góp ý đủ trường, chặn 60 giây, 10/ngày, hàng đợi tối đa 5 rồi tự gửi, ảnh trận ≤ 150 KB; bảng vàng chỉ ghi khi tốt hơn, kỷ lục trùm, tải theo trang, sắp xếp, đổi tên; màn Góp ý nhận được (tải thêm, lọc, trạng thái, ghi chú, xoá, ảnh to).
- Toàn bộ `game/tests/` chạy lại: đều đạt. Phải sửa một chỗ trong `tests/ui_input.py`: thẻ Hướng dẫn của Cụ Đồ dời vào giữa vì thêm thẻ Bảng vàng (không bỏ mục nào). Các bài `*_shots.py` chỉ chụp ảnh cho đợt khác, không chạy lại.
- `python3 game/build.py` chạy được; `tests/ui_build.py` mở cả hai bản đóng gói, kể cả `artifact.html` trong khung: không lỗi trang.
- **Luật trên emulator: chưa chạy được.** Máy có Java nhưng không tải được gói npm (`registry.npmjs.org` không truy cập được từ máy này). Bài thử đã viết sẵn ở `game/tests/may_luat.test.js` (khoảng 50 mục, thử trên bản luật đầy đủ), cách chạy ghi ở đầu tệp.

## Ảnh

`anh-mo-khach.png`, `anh-mo-google.png`, `anh-mo-quan-tri.png` (Anh Mõ), `chon-ban-luu.png`, `gop-y.png`, `tam-dung.png`, `gop-y-trong-tran.png`, `gop-y-nhan-duoc.png`, `bang-vang-suc-manh.png`, `bang-vang-sao.png`, `bang-vang-ngu-tinh.png`, `bang-vang-trong.png`, `bang-vang-ngoai-tuyen.png`, `ket-qua-ky-luc.png`.

## Lưu ý

- Đã chờ 75 phút nhưng phiên **cân bằng phải cày** (`claude/can-bang-cay`) chưa vào `khoi-tao-du-an`, nên chỉ số Sức mạnh (`G.power`) chưa có ở bản này: cột Sức mạnh tạm hiện "-". Mã đã gọi `G.power()` khi có, nên sau khi phiên đó được gộp, Sức mạnh tự lên bảng mà không cần sửa gì. Phiên hiệu ứng đạn và linh khí đã có trong nhánh.
- Phải dán luật mới (HUONG-DAN.md bước 1) thì lưu mây, bảng vàng, góp ý mới chạy trên máy chủ thật. Chưa dán thì game vẫn chơi và lưu trên máy bình thường.
- Luật bảng vàng chặn ghi lùi và số vô lý, nhưng không chống được người cố tình sửa mã gửi số giả trong khoảng cho phép (cách chống chắc chắn cần máy chủ riêng, ngoài gói miễn phí).
- Luật kiểm tra tên hero theo bốn hero hiện có (`smith`, `hunter`, `healer`, `wrestler`); thêm hero mới thì nhớ thêm vào luật.
