# Báo cáo phiên Phòng A3: đồ trang trí phòng vẽ bằng ảnh AI

Ngày 11/10/2026 · nhánh `khoi-tao-du-an` · commit game `917ffb3`, commit công cụ `ae293c7`

## Tóm tắt

**Game đã sẵn sàng nhận ảnh AI cho đồ trang trí phòng của cả 3 vùng, và cho lửa đuốc, lửa nến.** Hiện **chưa có tệp ảnh nào** trong game nên phòng chơi vẫn **y như cũ** (đã so từng điểm ảnh: khác 0). Lối chơi, bản lưu, đăng nhập Google, lưu mây, kích thước phòng đều không bị đụng tới.

Mọi kiểm thử dùng **hình khối mẫu máy tự dựng**, không phải tranh thật. Chưa thử với ảnh ChatGPT thật và chưa thử trên điện thoại thật.

## Bạn cần làm gì tiếp

1. Mở https://spiritblade.web.app/tach-phong.html trên iPhone. Ở bước 1 chọn một trong 4 lô mới (nằm cuối danh sách):
   - **Trang trí · Rừng già · 16 hình**
   - **Trang trí · Hang biển · 16 hình**
   - **Trang trí · Lâu đài cổ · 16 hình**
   - **Trang trí · lửa đuốc và nến · 3 khung**
2. Bấm **Sao chép prompt vẽ**, dán vào ChatGPT, lưu tấm ảnh.
3. Đưa ảnh vào bước 2. Bước 3 phải hiện **ĐẠT**.
4. Xem thử ở bước 4. Bấm **Đổi phòng** để xem phòng mẫu thứ hai (mỗi vùng có 2 phòng mẫu, bày đủ mọi món).
   - Món nào to hoặc nhỏ quá: chạm vào hình đó ở bước 3, bấm **To hơn** / **Nhỏ hơn**.
   - Món nào đứng lệch: bấm **Sang trái** / **Sang phải**.
5. Ưng thì bấm **Tải tất cả (.zip)** và gửi tệp .zip cho Claude để đưa vào game.

Nên làm lô Lâu đài cổ trước, rồi lô lửa đuốc (lửa chỉ dùng ở Lâu đài cổ). Prompt đầy đủ: [`PROMPT.md`](PROMPT.md).

## 1. Tệp đã đổi

| Tệp | Đổi gì |
|---|---|
| `game/js/room_art.js` | Phần đồ trang trí: mỗi món hỏi "có ảnh chưa", có thì vẽ ảnh, chưa có thì vẽ code y như cũ. Thêm phần vẽ lửa đuốc, lửa nến bằng dải ảnh. |
| `tools/tach-phong/index.html` | 4 lô mới, prompt, phòng xem thử, cách ghép 3 khung lửa thành một tệp. Prompt của 10 lô cũ không đổi (đã so: y hệt). |
| `game/dist/*`, `tools/xuong-sprite/index.html` | `build.py` tạo lại. |
| `docs/review/phong-a3/` | Báo cáo này, `PROMPT.md`, `anh-kiem.png`, `kiem/kiem.py` (bài kiểm chạy lại được). |

Không sửa tệp nào khác. Không thêm tệp nào vào `game/art/custom`. Ảnh mẫu dùng để thử đã xoá.

## 2. Đã làm gì

**Những món nay nhận được ảnh** (mã tệp `gd-tt-<vùng>-<tên>`, vùng là `rung`, `bien`, `lau`):

| | Rừng già | Hang biển | Lâu đài cổ |
|---|---|---|---|
| Đồ ở góc phòng | gốc cây cụt, bụi quả, nấm đỏ, khúc gỗ | đống đá, cụm tinh thể nhỏ, vũng nước, vỏ sò | thùng gỗ, hòm gỗ, xương sọ, chân nến |
| Vật điểm nhấn góc trên | gốc cổ thụ; khóm hoa dưới cột nắng | mỏ neo cũ; vũng nước dưới tia sáng | tượng hiệp sĩ (kèm 2 cây nến); cửa sổ kính màu |
| Đồ trên tường sau | chùm tán lá, dây leo, nấm sáng | nhũ đá (4 kiểu), tinh thể nhỏ và to | cột đá, giá đuốc, cờ đỏ, cờ xanh, cửa sổ nhỏ |
| Tiền cảnh 2 góc dưới | bụi dương xỉ tối | đá và măng đá tối | chân cột gãy tối |
| Giữa phòng | | | hoa văn tròn, tấm thảm |

Thêm một tệp kiểu hiệu ứng: `hu-lua-duoc`, 3 khung 8×12, dùng cho lửa đuốc (cỡ thật) và lửa nến (thu nhỏ một nửa).

**Game vẫn tự vẽ bằng code, đè lên hoặc nằm dưới ảnh:** bóng dưới chân, quầng sáng của đuốc / tinh thể / nấm, bóng đổ của cột và tượng, cột nắng, đom đóm, tia lấp lánh, gợn nước, giọt nước nhỏ từ nhũ đá. Hai cụm tiền cảnh vẫn **mờ dần khi em bé hoặc quái đứng sau**, dùng đúng khung cắt cũ.

**Chỗ đặt:** giữa đáy ảnh là chân vật. Riêng nhũ đá thì đỉnh ảnh bám nóc vách; dây leo rủ từ dưới tán lá, dây ngắn chỉ lộ phần ngọn; thảm và hoa văn tròn thì tâm ảnh ở giữa phòng.

**Biến thể:** vài món có "kiểu 2", "kiểu 3" (tán lá, dây leo, nấm sáng, đống đá, tinh thể, nhũ đá). Game đổi qua lại cho các phòng đỡ giống nhau. Thiếu biến thể nào thì dùng biến thể đang có.

**Tile Rừng già (Đợt 6) không bị đụng.** Cờ `G.TILE_RUNG` và mọi phần tile giữ nguyên. Đã thử bật bộ tile mẫu cùng lúc với ảnh trang trí mẫu: đồ trang trí vẽ đè lên tile, không lỗi. Khi dùng tile thì tán lá đã nằm sẵn trong ảnh tường sau, nên ảnh chùm tán lá không được dùng.

## 3. Đã kiểm

Chạy lại được bằng `python3 docs/review/phong-a3/kiem/kiem.py thu` và `... sosanh <thư mục game trước phiên>`.

| Việc kiểm | Kết quả |
|---|---|
| Kiểm lỗi gõ mọi tệp code game, bài kiểm lưu mây, gói game | **Đạt** |
| Không có tệp thì game không đổi | **Đạt.** 108 phòng (3 vùng, 3 kiểu sàn, phòng thường và phòng Trùm, nhiều bộ cửa, 6 loại phòng), mỗi phòng 5 ảnh (nền, lớp phủ trước, tiền cảnh, 2 thời điểm có lửa): 540 ảnh, **khác 0**. Bản đem so là bản trước cả Đợt 8 và E2. |
| Công cụ tách 4 tấm ảnh lưới mẫu | **Đạt.** Cả 4 lô báo ĐẠT, đủ 16/16, 16/16, 16/16 và 3/3 hình, tệp nào cũng ghi độ nét gấp đôi. Trang vừa màn điện thoại rộng 390, không cuộn ngang, không lỗi. |
| Nạp tạm 49 tệp mẫu vào game, vẽ 6 phòng (3 vùng × 2 phòng) | **Đạt.** Mọi món hiện đúng chỗ, lửa mẫu cháy trên đuốc và nến, không lỗi. Xem `anh-kiem.png`. |
| Gỡ tệp ra thì game về y như cũ | **Đạt** (6 phòng, giống hệt từng điểm ảnh) |
| Lô lửa: bấm tải | **Đạt một phần.** Máy thử không có mạng để nạp thư viện nén, nên công cụ tự chuyển sang tải 2 tệp rời (đúng như thiết kế). Đường tải .zip chưa chạy thử được. |
| Đẩy lên, workflow đăng web | **Đạt.** Lần đẩy game và lần đẩy công cụ đều xanh. |
| Khung hình/giây khi có ảnh | **Chưa đo** (phiên này chỉ chạy kiểm nhanh) |
| Ảnh ChatGPT thật, điện thoại thật | **Chưa kiểm** |

Ảnh chụp: `docs/review/phong-a3/anh-kiem.png`. Từ trên xuống: (1) game chưa có tệp, 3 vùng; (2) game nạp lô mẫu, phòng 1; (3) phòng 2; (4) bước 4 và bước 3 của trang công cụ. Hình trong ảnh là **hình khối mẫu**, đừng lấy đó để đánh giá đẹp xấu. Ảnh đã giảm màu cho nhẹ nên màu hơi lệch so với game.

## 4. Vài điều nên biết

- **Giá đuốc, chân nến, cây nến vẽ KHÔNG có lửa.** Game tự đặt lửa lên đỉnh ảnh. Chưa có lô lửa thì lửa vẫn là lửa code cũ.
- **Hai cụm tiền cảnh** là hai tệp (trái, phải). Chỉ có một tệp thì game lật ngang tệp đó cho bên kia.
- **Tượng hiệp sĩ và hai cây nến** là hai tệp riêng. Có tượng mà chưa có nến thì nến vẫn vẽ code.
- **Hình rất nhỏ** (vỏ sò 8×5, cây nến 4×8, giá đuốc 6×11): ChatGPT vẽ gì cũng bị thu rất nhỏ, chỉ cần khối đơn giản.
- **Nhũ đá** phải vẽ mũi nhọn chĩa xuống. Nếu ChatGPT vẽ ngược thì nhờ vẽ lại ô đó.
- **Phòng xem thử bày đủ 4 món góc phòng** để bạn soi. Trong game mỗi phòng chỉ có 2 đến 3 món và một vật điểm nhấn.
- **Dung lượng:** phiên này thêm 0 MB ảnh. Khi có đủ ảnh thật, ước cả 4 lô khoảng 0,1 MB. Phần code mới làm bản game nặng thêm khoảng 11 KB.

## 5. Rủi ro còn lại

- **Chưa thử với ảnh ChatGPT thật.** Lần đầu có thể phải chỉnh cỡ, dịch trái phải, hoặc chạm bỏ khung thừa.
- **Ảnh trang trí không bị ánh sáng sàn phủ lên.** Hình code cũ nằm trong nền nên bị bóng tường làm tối đi một chút; ảnh AI thì vẽ thẳng, luôn sáng đúng màu ChatGPT vẽ. Nếu vật trông quá nổi so với sàn thì cần nhờ ChatGPT vẽ trầm hơn.
- **Chưa đo tốc độ.** Ảnh được vẽ lại mỗi khung hình để giữ độ nét gấp đôi: phòng Rừng già và Hang biển khoảng 40 hình nhỏ mỗi khung, Lâu đài cổ khoảng 15. Số này nhỏ so với phần còn lại của trận đấu, nhưng nên đo trên điện thoại khi đưa ảnh thật vào.
- **Thảm và hoa văn tròn ở độ nét thường** (như sàn), không phải nét gấp đôi, vì chúng nằm dưới dấu sàn và ánh sáng.
- **Trộn kiểu:** đưa thiếu tệp thì trong một phòng sẽ có món là ảnh, món là hình code. Nên đưa đủ cả lô của một vùng.
- **Màu nền hồng tím với lô Lâu đài cổ:** cờ và thảm màu đỏ rượu sẫm. Nếu khi tách bị mất mảng đỏ, bỏ dấu tích **Lọc đốm màu nền** ở bước 2 rồi bấm **Tách lại**.

## 6. Chỗ tự quyết

- **Ảnh vẽ thẳng mỗi khung hình, không vẽ sẵn vào nền phòng** (giống cách làm cửa ở phiên A2), để giữ độ nét gấp đôi. Riêng thảm thì vẽ vào nền.
- **Lô lửa đuốc đặt ở trang Tách Phòng**, không ở trang Tách Hiệu Ứng, vì phiên này chỉ được sửa trang Tách Phòng. Tệp ra vẫn đúng kiểu hiệu ứng.
- **Lấp đủ 16 ô mỗi lô bằng biến thể và 3 món nhỏ**, vì ChatGPT vẽ lưới đầy dễ đúng hơn lưới có ô trống. Ba món thêm là hình code đang có nhưng kế hoạch chưa kể tên: khóm hoa dưới cột nắng, vũng nước dưới tia sáng, cây nến cạnh tượng.
- **Cỡ khung từng món** lấy theo hình code. Thảm rộng 68 nên được phép vượt mức 48 thường lệ của công cụ.
- **Màu:** prompt có đoạn bảng màu chung (gỗ, đá, cỏ cây, kim loại, bóng) và một đoạn màu riêng của từng vùng lấy từ code (ví dụ đá Lâu đài xám nâu, tinh thể xanh lơ). Chỗ hai đoạn khác nhau thì prompt dặn giữ màu riêng của vùng.
- **Quả, nấm đỏ, cờ đỏ dùng đỏ gạch và đỏ rượu sẫm**, không đỏ tươi, vì đỏ tươi dành cho dấu báo nguy hiểm.
- **Thêm hai chỗ móc chỉ dành cho trang công cụ** trong `room_art.js`: một để phòng xem thử bày đủ món, một để xem thử lửa. Trong game hai chỗ này luôn không có gì, không ảnh hưởng lối chơi.
- **Chưa chuyển sang ảnh (đúng kế hoạch):** thảm dẫn vào cửa, cột nắng, hạt môi trường (giữ code); gờ đá chân vách, măng đá và cỏ mép dưới, chi tiết trên sàn (thuộc phiên A4).

## 7. Cách quay lui

- Không đưa tệp `gd-tt-*` và `hu-lua-duoc` vào game thì game vẽ bằng code y như cũ.
- Gỡ hẳn code: `git revert ae293c7 917ffb3`, rồi chạy `python3 game/build.py`.

## 8. Quyết định cần bạn duyệt

1. Khi có ảnh thật: nếu đồ trang trí trông quá sáng so với sàn, có muốn game phủ thêm một lớp tối nhẹ lên ảnh không (cần một phiên nhỏ)?
2. Có muốn đo khung hình/giây trên điện thoại trước khi đưa cả 3 lô vào game không?

## Cho phiên A4 dùng tiếp

- Lô mới thêm vào CUỐI mảng `LO`. Lô trang trí sinh từ mảng `TT`; prompt: `promptTT`, `promptLua`.
- Xem thử: `xem: 'tt'`, 2 phòng mẫu trong `TT_PHONG`; `W.ttThu = { decor, kind }` ép món góc phòng và vật điểm nhấn.
- Trong game: `ttMot(vùng, tên, x, đáy)` hỏi ảnh và vẽ giữa đáy; `ttChon` chọn biến thể; `ttNho(ảnh)` cho bản thu về cỡ game để vẽ vào nền (dùng cho thảm, hợp với sàn và tường của A4). Lệnh vẽ sống của vỏ phòng nằm trong `shell.tt`, chạy ở đầu lớp sống.
- Bộ nhớ đệm phòng tự xoá khi số ảnh `gd-tt-*` sẵn sàng đổi, và khi dải lửa sẵn sàng.
