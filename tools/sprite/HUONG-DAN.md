# Hướng dẫn: biến ảnh tạo hình thành sprite nhân vật

Công cụ `gen_sprite.py` nhận MỘT ảnh tạo hình đã chốt của nhân vật và tự làm ra bộ hình pixel
đủ động tác cho game: đứng thở, chạy, né lăn, trúng đòn, gục ngã, ra chiêu, và các đòn đánh
bằng kiếm (3 nhịp), giáo, búa, cung.

Bạn không cần biết lập trình. Chỉ cần làm theo 4 bước dưới đây.

## Bước 0. Cài đặt (làm một lần)

Cần Python 3.9 trở lên. Mở cửa sổ dòng lệnh tại thư mục dự án rồi chạy:

```
pip install -r tools/requirements.txt
```

## Bước 1. Chuẩn bị ảnh tạo hình

Ảnh càng đúng yêu cầu thì kết quả càng đẹp. Ảnh cần đạt:

| Yêu cầu | Vì sao |
|---|---|
| Chỉ một nhân vật, thấy trọn từ đầu đến chân | Công cụ lấy mọi thứ trong ảnh làm nhân vật |
| Quay mặt sang PHẢI, đứng nghiêng hoặc chếch 3/4 | Game lật hình khi nhân vật quay trái |
| Đứng thẳng, hai tay buông xuống và hơi dang ra, KHÔNG chạm vào thân | Để công cụ tách được tay ra khỏi thân |
| Hai chân hơi dạng, có khe hở giữa hai chân | Để công cụ tách được hai chân |
| KHÔNG cầm vũ khí, tay không | Vũ khí do game vẽ riêng rồi gắn vào tay |
| Nền trơn một màu, màu đó không có trên nhân vật (nên dùng hồng cánh sen) | Để tách nền sạch |
| Không đổ bóng dưới chân, không chữ, không cảnh vật | Bóng và chữ sẽ bị tính là một phần nhân vật |
| Tô màu phẳng, mảng lớn, ít chi tiết li ti | Hình chỉ cao 40 điểm ảnh, chi tiết nhỏ sẽ mất |
| Ảnh cao từ 500 điểm ảnh trở lên (800 đến 1024 là đẹp) | Ảnh quá nhỏ thì cắt mảnh không chính xác |

Đầu to (kiểu chibi, cao khoảng 3 lần đầu) sẽ rõ mặt hơn khi thu nhỏ.

Lưu ảnh vào `art/raw/` với tên không dấu, ví dụ `art/raw/tho-ren.png`.

### Câu lệnh mẫu (prompt) để tạo ảnh bằng công cụ tạo ảnh

Thay phần trong ngoặc vuông bằng mô tả nhân vật của bạn:

```
Flat 2D game character design of [a young Vietnamese village blacksmith hero with a red cloth headband, brown tunic and leather apron], single character only, full body from head to feet, three-quarter side view facing right, standing upright in a relaxed A-pose, both arms hanging down and held clearly away from the body, legs slightly apart with a visible gap between them, empty hands, no weapon and no held items, chibi proportions 3 heads tall, bold dark outline, flat solid colors with no gradients, no shading and no texture, on a plain solid magenta background, no ground shadow, no text and no scenery.
```

Tạo vài lần, chọn tấm mà tay chân tách khỏi thân rõ nhất.

## Bước 2. Chạy công cụ

```
python tools/sprite/gen_sprite.py art/raw/tho-ren.png --name smith --height 40
```

- `art/raw/tho-ren.png` là ảnh tạo hình.
- `--name` là tên hero trong game. Bốn tên đang dùng: `smith` (Thợ Rèn), `hunter` (Thợ Săn),
  `healer` (Thầy Lang), `wrestler` (Đô Vật). Muốn chạy thử mà chưa đụng tới game thì đặt tên khác, ví dụ `thu-1`.
- `--height` là chiều cao nhân vật tính bằng điểm ảnh. Hero thường 40. Nhân vật to con có thể để 44.

Chạy mất khoảng 3 giây. Lần chạy đầu, công cụ tự đoán chỗ cắt và ghi ra file
`art/raw/tho-ren.rig.json` nằm cạnh ảnh.

## Bước 3. Xem ảnh kiểm tra chỗ cắt, sửa nếu lệch

Mở ảnh `tools/sprite/out/smith/xem-khop.png`. Trong ảnh có:

- Hình nhân vật phóng to, có thước đánh số ở mép trên và mép trái.
- Các khung màu: mỗi khung là hộp của một mảnh (đầu, thân, tay trước, tay sau, chân trước, chân sau).
- Các chấm tròn đánh số: điểm khớp (cổ, vai, khuỷu, bàn tay, hông, gối, bàn chân).
- Phía dưới: từng mảnh sau khi cắt, để bạn thấy mảnh nào thiếu hay dính phần lạ.
- Dòng chữ vàng cuối ảnh: lời nhắc của công cụ nếu nó không chắc chỗ nào.

"Tay trước" là tay gần người xem. Đó cũng là tay cầm vũ khí.

Nếu mọi thứ trông đúng thì sang Bước 4. Nếu lệch, mở file `art/raw/tho-ren.rig.json` bằng
Notepad, sửa số, lưu lại rồi chạy lại ĐÚNG câu lệnh ở Bước 2. Công cụ sẽ dùng số bạn đã sửa.

Cách đọc số: nhìn thước trên ảnh `xem-khop.png`. Số đầu là vị trí ngang (đếm từ trái sang),
số sau là vị trí dọc (đếm từ trên xuống).

| Mục trong file | Ý nghĩa |
|---|---|
| `"hop": [trái, trên, phải, dưới]` | Hộp bao quanh mảnh |
| `"day"` | Bề dày cánh tay. Công cụ chỉ lấy phần nằm dọc theo đường vai, khuỷu, bàn tay trong bề dày này. Để 0 thì lấy cả hộp |
| `"khop"` | Các điểm khớp, mỗi điểm là `[ngang, dọc]` |
| `"sao_chep": "tay_truoc"` | Mảnh này không có trong ảnh, dùng lại tay trước làm tay sau (tô tối hơn) |
| `"lech": [ngang, dọc]` | Bản sao đặt lệch đi bao nhiêu điểm |
| `"phu"` | Phần phụ như đuôi, tà áo: có hộp, điểm gắn (`khop`), gắn vào `than` hay `dau`, nằm lớp `truoc` hay `sau`, độ đung đưa `lac` |

Các lỗi hay gặp và cách sửa:

| Thấy gì | Sửa gì |
|---|---|
| Tay bị ngắn, vai nằm sai chỗ (hay gặp khi tay vẽ đè lên thân) | Dời điểm `vai_truoc` và `khuyu_truoc` về đúng chỗ, nới `hop` của `tay_truoc` |
| Mảnh tay dính một miếng thân | Giảm `day`, hoặc thu hẹp `hop` của tay |
| Bàn tay bị cụt | Tăng `day`, hoặc nới `hop` của tay xuống dưới |
| Đầu bị cắt mất cằm, hoặc đầu dính cả vai | Sửa số thứ tư của `hop` trong `dau`, và điểm `co` |
| Hai chân bị cắt lệch (hay gặp khi mặc áo dài, váy) | Sửa `hop` của `chan_truoc`, `chan_sau` và các điểm hông, gối, bàn chân |
| Có đuôi, tà áo mà công cụ không nhận ra | Thêm một mục vào `phu` (xem mẫu trong `art/raw/thu/ho-con.rig.json`) |
| Công cụ nhận nhầm một phần là đuôi | Xoá mục đó trong `phu` |
| Muốn công cụ đoán lại từ đầu | Xoá file rig.json, hoặc chạy lệnh có thêm `--doan-lai` |

Mẹo: thêm `--chi-xem-khop` vào cuối lệnh để công cụ chỉ cắt mảnh và xuất ảnh kiểm tra, chạy nhanh hơn khi đang sửa.

## Bước 4. Xem kết quả

Trong thư mục `tools/sprite/out/smith/`:

- `xem-truoc.png`: bảng tất cả khung hình, phóng to 6 lần, có tên động tác bằng tiếng Việt.
  Khung có chữ đỏ "TRÚNG" là lúc đòn đánh chạm mục tiêu.
- Mỗi động tác một file GIF chạy lặp, ví dụ `run.gif` (chạy), `atk_sword_1.gif` (kiếm nhịp 1),
  `atk_hammer.gif` (búa). Mở bằng trình duyệt để xem chuyển động.
- Vũ khí trong các ảnh này là vũ khí mẫu. Trong game, vũ khí thật sẽ được vẽ vào đúng bàn tay và vung theo.

Trong thư mục `game/assets/hero/smith/` là phần dành cho game: `sheet.png` (tấm sprite),
`sheet.json` (thông tin từng khung) và `sheet.js` (hai file trên gói lại để nhúng vào game).
Bạn không cần mở các file này.

Muốn xem hero trong game thật: chạy `python tools/sprite/thu_trong_game.py` (cần Playwright),
kết quả là ảnh `tools/sprite/out/trong-game.png`. Lệnh này đang dùng hai nhân vật thử.

## Các tuỳ chọn thêm

| Tuỳ chọn | Ý nghĩa | Mặc định |
|---|---|---|
| `--height` | Chiều cao nhân vật (điểm ảnh, kể cả viền) | 40 |
| `--colors` | Số màu tối đa | 14 |
| `--tol` | Độ rộng khi nhận màu nền. Tăng nếu còn sót nền, giảm nếu nhân vật bị ăn mất | 90 |
| `--rig` | Dùng file rig.json ở chỗ khác | cạnh ảnh |
| `--doan-lai` | Bỏ file rig.json cũ, đoán lại từ đầu | tắt |
| `--chi-xem-khop` | Chỉ cắt mảnh và xuất `xem-khop.png` | tắt |
| `--giu-net` | Giữ nét viền mảnh của ảnh gốc (mặc định bỏ đi cho hình sạch) | tắt |
| `--no-inner` | Không tô nét tối ở chỗ tay đè lên thân | có tô |

## Hai nhân vật thử có sẵn

`art/raw/thu/nguoi.png` và `art/raw/thu/ho-con.png` là ảnh do máy vẽ để thử công cụ, KHÔNG phải
tạo hình thật của game. Bạn có thể chạy thử trên chúng để làm quen:

```
python tools/sprite/gen_sprite.py art/raw/thu/nguoi.png --name thu-nguoi
python tools/sprite/gen_sprite.py art/raw/thu/ho-con.png --name thu-ho-con
```

File `art/raw/thu/ho-con.rig.json` là ví dụ về một file đã sửa tay (sửa điểm vai, thêm độ lắc cho đuôi).
