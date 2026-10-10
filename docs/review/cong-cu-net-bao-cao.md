# Báo cáo: 4 trang tách ảnh có "Độ nét gấp đôi"

Ngày 10/10/2026. Đã sửa 4 trang công cụ (không đụng mã game):

- Quái: https://spiritblade.web.app/tach-quai.html
- Anh hùng · Người làng: https://spiritblade.web.app/tach-anh-hung.html
- Vũ khí · Đồ · Vật phẩm: https://spiritblade.web.app/tach-do.html
- Hiệu ứng: https://spiritblade.web.app/tach-hieu-ung.html

## Có gì mới

1. Ở bước 2 của mỗi trang có thêm ô **Độ nét**: *Gấp đôi (khuyên dùng)* hoặc *Thường*. Mặc định là Gấp đôi.
   - Gấp đôi: hình trong file có số điểm ảnh gấp 2 lần, nên khi game vẽ màn 960×540 thì hình AI rõ hơn, không nhoè.
   - Thường: như cũ.
2. Ô cũ "Mịn / Sắc nét" vẫn còn, đổi tên thành **Nét vẽ** (mặc định vẫn là Mịn).
3. File tải về có thêm dòng `"net": 2`. Mọi số khác trong file (cỡ khung, điểm chân, cỡ trong game, điểm neo đầu/thân/tay, điểm cầm/mũi/dây của vũ khí, chỗ đặt trang phục) **vẫn tính theo điểm ảnh của game như cũ**, không nhân đôi. Chọn Thường thì file không có dòng "net".
4. Danh sách tự kiểm có dòng mới, ví dụ: "Độ nét gấp đôi: tấm ảnh 1024×480 = (512×240) × 2". Cỡ sai là báo đỏ.
5. Khung xem cử động hiện đúng độ nét thật (mỗi điểm ảnh game là 2×2 điểm ảnh của hình).
6. Số màu: khi Gấp đôi tự đặt 48 màu (hình có nhiều điểm hơn nên 48 màu chuyển sắc mượt hơn); chọn Thường thì về 32 như cũ. Trang Đồ giữ số màu riêng của từng lô như trước (đồ rất nhỏ, ít màu trông gọn hơn).
7. Mọi tính năng cũ vẫn giữ: tách nền, dò lưới, tự tìm từng hình, chạm để bỏ khung, lọc đốm màu nền, lặp khung, bỏ hình lạc, lật ngang, cắt bớt. Prompt vẽ không đổi.

## Viền ngoài: chọn dày 1 điểm ảnh của hình

Khi Gấp đôi, viền tối bao quanh hình dày **1 điểm ảnh của hình** (bằng nửa điểm ảnh game), không phải 2.
Lý do: đã so cả hai ở cỡ thật. Hình ChatGPT vẽ đã có sẵn nét viền riêng; thêm viền 2 điểm làm hình phình to, nét viền thành quá đậm và mất chi tiết nhỏ (mắt, vằn). Viền 1 điểm vẫn tách hình khỏi nền rõ ràng mà trông gọn hơn.

## Trang Anh hùng và trang Đồ: thử khoác đồ

Hai trang này nạp game thật để thử đồ. Trang tự xem game đã đọc được "net" chưa:
- Game mới (đã có "net", vừa được phiên sửa game đẩy lên): đưa hình gấp đôi vào, hiện nét thật. Đã thử: thân AI khoác nón, áo đúng chỗ; kiếm nằm đúng tay.
- Game cũ (chưa có "net"): trang tự thu hình về cỡ thường để vẫn hiện đúng, không lỗi.

Trang Đồ: chạm vào hình để đặt điểm cầm/mũi vẫn đúng; đã thử chạm cùng một chỗ ở cả Gấp đôi và Thường đều ra cùng số (ví dụ điểm cầm 22; 6,94).

## Có phiên khác cùng sửa

Trong lúc làm, một phiên khác thêm nút **tải 2 bản cùng lúc** (bản gấp đôi + bản thường) ở cả 4 trang (Quái, Anh hùng, Đồ, Hiệu ứng). Phần đó hợp với phần của tôi nên giữ cả hai, không xung đột.

## Đã tự kiểm

- Kiểm cú pháp cả 4 trang: không lỗi.
- Mỗi trang chạy một lượt với ảnh mẫu tự vẽ (nền hồng tím, có lưới): đều ra **ĐẠT**, file có `"net": 2`, cỡ ảnh đúng gấp đôi (Quái 1024×480, Anh hùng 768×672, Kiếm 88×28, Vệt chém 672×96). Chọn Thường thì ra cỡ cũ, không có "net".
- Trang không báo lỗi nào khi chạy.
- Các lần đẩy lên đều qua kiểm tra tự động (xanh).

## Kiểm thêm: mọi phụ kiện đều có "net": 2

Theo lời dặn "cả các phụ kiện khác cũng nên như thế", đã kiểm lại từng lô ở trang Đồ với ảnh mẫu. Cả 11 lô đều ra ĐẠT, **mọi món** đều có `"net": 2` và hình đúng gấp đôi cỡ trong game:
- Vũ khí: Kiếm, Cung, Giáo, Búa (mỗi lô 10/10 món).
- Trang phục, đủ 6 lô: Mũ (13), Áo (13), Đồ đeo lưng (6), Bùa và vật cầm tay (10), Dấu mặt nạ (5), Cánh (4).
- Vật phẩm: 14/14 món.
Trang Anh hùng: 4 em bé và cả 7 người làng đều ra `"net": 2`, cỡ đúng. Trang Quái và Hiệu ứng cũng vậy (đã thử ở trên).
Khi bấm tải, tệp chính `<mã>.sprite.json` luôn là bản nét gấp đôi; tệp `<mã>.thuong.sprite.json` là bản thường để dự phòng. Không phải sửa thêm mã.

## Bạn cần làm gì

Không cần làm gì thêm. Lần sau tách ảnh cứ để Độ nét là Gấp đôi, tải file và gửi cho Claude như thường lệ.
