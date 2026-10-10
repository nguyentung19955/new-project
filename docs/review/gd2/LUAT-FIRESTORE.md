# Đưa luật Bảng vàng mới lên Firebase (V23) — hướng dẫn cho chủ dự án

Luật mới nằm trong tệp `game/firebase/linhkhi.rules` (nhánh `gd2-a`, sau khi gộp thì ở `khoi-tao-du-an`).
Claude **không** tự đưa lên Firebase. Anh/chị làm theo các bước dưới, mất khoảng 10 phút.

## Luật mới thay đổi gì

Chỉ đổi khối **Bảng vàng** (`match /linhkhi_scores/{uid}`). Bản lưu (`linhkhi_users`) và Góp ý (`linhkhi_feedback`) giữ nguyên.

| Trước | Sau |
|---|---|
| Ai đăng nhập cũng ghi được, kể cả **khách ẩn danh** (nút "Chơi tạm") | Chỉ tài khoản **Google** ghi được. Khách vẫn **xem** bảng và vẫn gửi góp ý |
| Sức mạnh tối đa 1.000.000 | Sức mạnh tối đa **1.500** (người chơi giỏi nhất hiện đo được khoảng 900) |
| Sao tối đa 90 | Sao tối đa **3 × số ải đã qua** (qua 10 ải thì tối đa 30; qua đủ 15 ải là **45**). Qua đủ 15 ải mới mở được Độ khó 2, lúc đó tối đa **90** (45 sao thường + 45 sao Độ khó 2) |
| Hạ trùm vùng nhanh nhất 5 giây | Nhanh nhất **20 giây**, và phải qua tới ải của trùm đó (Mộc Tinh: qua 5 ải, Ngư Tinh: 10 ải, Hồ Tinh: 15 ải) |

Ghi chú về "sao ≤ 45": anh/chị đã đồng ý "sao ≤ 45". Khi soạn luật, Claude thấy game cộng cả sao **Độ khó 2** vào tổng sao
(tối đa 90), nên nếu chặn cứng ở 45 thì người chơi thật đã chơi Độ khó 2 sẽ **không bao giờ cập nhật được dòng của mình nữa**.
Vì vậy luật chặn ở 45 cho đến khi qua đủ 15 ải (đúng như đã duyệt cho độ khó thường), chỉ sau đó mới cho tới 90.
Nếu anh/chị vẫn muốn chặn cứng 45, nói với Claude để đổi một dòng.

## Trước khi đưa lên: 1 việc ở game (người điều phối làm)

Khi khách ẩn danh qua ải, game vẫn thử gửi điểm lên bảng; luật mới sẽ từ chối và trong phần Cài đặt có thể hiện dòng
"Đang ngoại tuyến" dù vẫn có mạng (không mất dữ liệu, chỉ là chữ sai). Để tránh, người điều phối thêm một điều kiện trong
`game/js/bang_vang.js`, hàm `B.sync`: không gửi khi đang là khách (`C.isGuest()`). Tệp này ngoài phạm vi phiên gd2-a nên
Claude chưa sửa. Nếu chưa kịp sửa thì vẫn đưa luật lên được; chỉ là dòng chữ đó có thể hiện với khách.

## Các bước đưa luật lên

1. Mở <https://console.firebase.google.com>, đăng nhập đúng tài khoản Google quản lý dự án, chọn dự án của game.
2. Menu trái: **Firestore Database** → thẻ **Rules** (Quy tắc).
3. **Sao lưu luật cũ**: bấm vào ô luật, chọn hết (Ctrl+A / Cmd+A), sao chép (Ctrl+C), dán vào một tệp ghi chú trên máy và lưu lại
   (để lỡ có gì thì dán trả lại). Firebase cũng giữ lịch sử các bản luật ở cột bên trái thẻ Rules.
4. Trong ô luật, tìm dòng có chữ `LINH KHÍ (bắt đầu)` (Ctrl+F). Đây là phần của Linh Khí; phần phía trên là của game Thần Thoại Việt
   — **không sửa phần đó**.
5. Bôi đen từ dòng `// ===================== LINH KHÍ (bắt đầu) =====================`
   tới hết dòng `// ===================== LINH KHÍ (hết) =====================` (bôi cả hai dòng này).
6. Mở tệp `game/firebase/linhkhi.rules` trên GitHub (chọn nhánh `khoi-tao-du-an` sau khi đã gộp, hoặc `gd2-a`), bấm nút
   **Copy raw file** (biểu tượng hai tờ giấy), rồi quay lại Firebase, dán đè lên phần đang bôi đen.
7. Kiểm tra: phía dưới phần vừa dán vẫn còn các dấu `}` đóng của tệp như trước (thường là hai dòng `  }` và `}`).
8. Bấm **Publish** (Xuất bản). Nếu Firebase báo lỗi đỏ thì **không** xuất bản; chụp màn hình gửi Claude.

## Thử nhanh sau khi đưa lên (không bắt buộc)

Trong thẻ Rules có nút **Rules Playground** (Sân thử luật):

- Simulation type: **create**; Location: `linhkhi_scores/thu1`; bật **Authenticated**, Provider **google.com**, Firebase UID `thu1`.
- Phần Build document, thêm các trường: `name` (string) `Thu thu`, `power` (integer) `2000`, `stars` (integer) `10`,
  `far` (integer) `5`, `hero` (string) `smith`, `at` (number) `1`.
- Bấm **Run** → phải ra **Denied** (bị từ chối, vì Sức mạnh 2.000 > 1.500). Đổi `power` thành `800` → **Allowed**.
- Đổi Provider thành **Anonymous** → phải ra **Denied** (khách không ghi được).

Sân thử không ghi dữ liệu thật.

## Sau khi đưa lên: dọn các dòng "kẹt" trên bảng

Luật chỉ chặn lần ghi **mới**; các dòng đã có trên bảng vẫn hiện. Những dòng có số vượt luật mới sẽ không cập nhật được nữa
(người đó chơi tiếp cũng không thấy bảng đổi). Nên xoá chúng để người đó được tạo lại dòng mới đúng luật (dòng sẽ tự tạo lại
khi họ qua ải kế tiếp, nếu họ dùng tài khoản Google):

1. Firestore Database → thẻ **Data** → bộ sưu tập `linhkhi_scores`.
2. Lần lượt lọc (nút lọc bên cạnh tên bộ sưu tập) và xoá các tài liệu có:
   - `power` lớn hơn `1500`;
   - `b_moc`, `b_ngu` hoặc `b_ho` nhỏ hơn `20`;
   - `g` bằng `false` (dòng của khách ẩn danh — sau luật mới khách không lên bảng nữa);
   - số sao (`stars`) lớn hơn 3 × `far` (khó lọc tự động; nhìn qua cột nếu ít dòng).
3. Không cần đụng `linhkhi_users` (bản lưu) hay `linhkhi_feedback`.

## Nếu có người chơi thật báo "không lên bảng được"

- Nếu họ chơi bằng "Chơi tạm": đúng luật mới, cần đăng nhập Google.
- Nếu họ dùng Google: có thể Sức mạnh thật của họ đã vượt 1.500 (sau này game mạnh lên). Báo Claude để nới trần trong `linhkhi.rules`.
- Muốn quay lại luật cũ ngay: thẻ Rules → lịch sử bản luật bên trái → chọn bản trước → Publish (hoặc dán bản đã sao lưu ở bước 3).

## Ghi chú cho người điều phối

- `game/firebase/firestore.rules.gop` (bản luật ghép sẵn) **chưa** được cập nhật khối Linh Khí mới (ngoài phạm vi phiên).
  Bài `game/tests/may_luat.test.js` tự ghép khối mới từ `linhkhi.rules` vào `.gop` lúc chạy, nên vẫn thử đúng luật mới.
  Khi gộp, nên chép khối từ `linhkhi.rules` vào `.gop` cho đồng bộ.
- Chạy bài thử luật (cần Java + Firestore emulator, xem đầu tệp `may_luat.test.js`): các ca mới gồm Sức mạnh 2.000/1.501 bị
  từ chối, khách ẩn danh bị từ chối ghi nhưng vẫn đọc được, 45/90 sao đúng ngưỡng được, hạ trùm 19 giây bị từ chối.
