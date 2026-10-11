# Đợt 1 — Chơi ngay không bắt đăng nhập (Q4) + màn hình tải + sửa co Hồ Tinh

Đọc `CHUNG.md`, `QUYET-DINH-Q1-Q6.md` mục Q4 và Q5 (phần "phản hồi tải trong 1 giây"), `KE-HOACH.md` Phần 1-F và Phần 2 dòng F2/F3. Dự kiến 2 giờ. Tệp được sửa: `game/js/village.js`, `game/js/cloud.js`, `game/js/engine.js` (chỉ nếu cần cờ), `game/index.html`, `game/build.py` (chỉ phần khuôn HTML), `game/js/boss.js` (1 dòng), `game/js/ngon_ngu.js` (thêm chữ tiếng Anh cho chuỗi mới qua `G.t`), `game/tests/cloud_save_regression.test.js` (chỉ thêm ca kiểm).

## 1. Chơi ngay (Q4)
Hiện trạng: `village.js:785–790` `titleGate` → có mây thì bắt Google; nút "Đăng nhập Google để vào" (:880); "Chơi tạm" chỉ hiện khi mây lỗi/quá 10 s/`V.loginFail` (:886). `cloud.js:2` đã đăng nhập **ẩn danh Firebase** trước; Google dùng `linkWithPopup` lên tài khoản ẩn danh (:245–253) giữ tiến trình; nếu tài khoản Google đã có dữ liệu thì chuyển sang tài khoản đó và hỏi khi bản cục bộ rõ ràng mới hơn (:257–260).

Làm:
1. Màn chào có **hai nút rõ**: "Chơi ngay" (vào bằng ẩn danh, lưu mây theo tài khoản ẩn danh như hiện có) và "Đăng nhập Google" (cho người đã có tài khoản). Khi ẩn danh chưa sẵn sàng, "Chơi ngay" vẫn vào được ở chế độ cục bộ và tự nối mây khi xong (dùng cơ chế sẵn có nếu có; không viết lại đồng bộ).
2. Sau khi **xong ải 1** (lần đầu, chỉ với tài khoản ẩn danh): hiện một lời mời ngắn "Liên kết Google để giữ tiến trình trên mọi máy" với nút Liên kết / Để sau. "Để sau" không hỏi lại trong cùng phiên chơi; lần sau hỏi lại tối đa 1 lần ở Anh Mõ. Lưu cờ đã-từ-chối trong bản lưu **chỉ bằng trường mới tuỳ chọn** (không đổi schema trường cũ).
3. Liên kết thất bại (popup đóng, tài khoản đã dùng…): thông báo rõ bằng tiếng Việt, **không xoá, không ghi đè** tiến trình. Trường hợp "tài khoản Google đã có tiến trình khác" → giữ nguyên luồng hỏi hiện có; nếu luồng hiện có tự chọn bản thắng mà không hỏi trong ca nào đó, **không sửa**, ghi vào báo cáo làm quyết định cần duyệt.
4. Nút Google vẫn còn ở Anh Mõ cho người bỏ qua.
5. Mọi chuỗi mới đi qua `G.t(...)` và có bản tiếng Anh trong `ngon_ngu.js`.

Nghiệm thu (bắt buộc chụp ảnh/ghi kết quả): (1) người mới chơi ẩn danh xong ải 1 → mời liên kết; liên kết (mây giả của dự án) → tiến trình giữ nguyên; (2) Google đã có tiến trình, mở máy mới → đi đúng tiến trình mây, không tạo bản mới; (3) liên kết thất bại → tiến trình không đổi; (4) `?cloud=0` chơi được; (5) `node game/tests/cloud_save_regression.test.js` qua, thêm ca kiểm cho (1)(3) nếu khung test cho phép; (6) bản lưu cũ `linhkhi_save_v1` (tạo tay theo schema hiện có) đọc được.

## 2. Màn hình tải
Hiện trạng: `game/index.html:53–57` chỉ canvas + script; `build.py:44–56` gom hết thành 1 `<script>` → đen cho đến khi tải xong ~10 MB.

Làm: thêm **khối HTML tĩnh** trước thẻ script (trong `index.html` và trong khuôn mà `build.py` xuất): nền tối, chữ "LINH KHÍ" và dòng "Đang tải…" bằng CSS thuần (không ảnh), một vạch tải. Với bản gom 1 tệp, trình duyệt phải nhận hết tệp mới chạy script, nên vạch tải **không thể đo tiến độ thật** — dùng vạch chuyển động (indeterminate) và hiện ngay khi HTML bắt đầu được phân tích (khối tĩnh nằm trước script là đủ). Game sẵn sàng (chỗ `engine.js` khởi động xong, màn chào vẽ lần đầu) thì ẩn khối. Chữ song ngữ theo `navigator.language` (VI/EN) vì lúc này chưa có `G.t`. Không tách ảnh ra tệp riêng ở đợt này (thuộc Q5).

Nghiệm thu: Playwright giả lập mạng 1,5 Mbps: ảnh chụp ở giây thứ 1 thấy chữ tải; thời gian từ bắt đầu tới màn chào ghi vào báo cáo; không khung trắng/đen sau khi HTML về.

## 3. Sửa co Hồ Tinh pha 3
`boss.js:408` co 72% khi pha 3 — với ảnh AI (`sprite_custom.js:187–199` dùng cùng ảnh mọi pha) thì thân bị co sai. Chỉ áp co khi **không** có ảnh AI (`G.spriteCustom && G.spriteCustom.cuaQuai && G.spriteCustom.cuaQuai('ho')` hoặc hàm tương đương — tìm đúng tên trong `sprite_custom.js`). Chụp trước/sau pha 3.

## Ghi chú
- Nếu luồng Firebase ẩn danh có giới hạn (ví dụ tài khoản ẩn danh bị dọn sau 30 ngày không dùng), ghi vào rủi ro còn lại.
- Thứ tự đẩy: mục 3 (nhỏ) → mục 2 → mục 1. Mỗi mục một commit, tên commit tiếng Việt, ghi "Đợt 1".
- Báo cáo: `docs/review/ke-hoach-cai-thien/dot-1/bao-cao.md` + `anh/`.
