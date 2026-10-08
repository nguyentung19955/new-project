# Linh Khí

Game đánh quái màn hình ngang cho điện thoại, chạy ngay trong trình duyệt. Bạn dẫn một hero đi qua từng ải, mỗi ải là một bản đồ 8 phòng vuông nhìn từ trên xuống, xếp ngẫu nhiên mỗi lần chơi, và kết thúc bằng một con trùm. Vũ khí lớn lên theo cách bạn đánh (nhận dấu ấn Lửa, Độc, Băng rồi tiến hóa), còn trùm thì học theo bạn: dùng một hệ quá nhiều, nó sẽ kháng hệ đó.

Đây là bản thử. Tiến trình được lưu trong trình duyệt của máy đang chơi.

## Cách chơi

Mở `index.html` (hoặc `dist/linh-khi.html`) bằng trình duyệt. Chạm màn hình, bấm **Vào ải**, chọn **Ải 1** rồi **Bắt đầu**. Ải đầu tiên có lời chỉ dẫn ở từng phòng.

Trên điện thoại (nên cầm ngang):

- Đặt ngón ở nửa trái màn hình rồi kéo để di chuyển.
- Các nút tròn bên phải: giữ **Đánh** để ra đòn liên tục, **Né** để lăn tránh, **Đặc biệt** để tung đòn mạnh (tốn mana), nút còn lại là kỹ năng riêng của hero.
- Chạm ô vũ khí ở góc trên bên phải để đổi giữa hai vũ khí.
- Chạm ô **Bình máu** để hồi máu, chạm **Dừng** để tạm nghỉ.
- Lại gần rương, suối, thương nhân, bàn thờ rồi bấm **Đánh** để mở hoặc chọn.
- Còn quái thì mọi cửa khóa. Hết quái thì cửa mở: đi vào cửa có mũi tên để sang phòng kề.
- Chạm **bản đồ nhỏ** ở góc trên bên phải để tạm dừng và xem bản đồ cả ải; chạm lần nữa để chơi tiếp.

Trên máy tính:

| Phím | Việc |
| --- | --- |
| Mũi tên hoặc W A S D | Di chuyển |
| J | Đánh (giữ để đánh liên tục), mở rương |
| K | Né |
| L | Đòn đặc biệt |
| I | Kỹ năng của hero |
| Q | Đổi vũ khí |
| E | Uống bình máu |
| M | Mở hoặc đóng bản đồ ải |
| Esc | Tạm dừng, đóng bảng, quay về màn hình làng |

Chuột dùng được như ngón tay.

## Các tệp

| Tệp | Nội dung |
| --- | --- |
| `index.html` | Trang game: bố cục, màu sắc, thứ tự nạp các tệp JS |
| `js/data.js` | Số liệu: hệ, vũ khí, hero, quái, vùng, trang bị, giá cả |
| `js/engine.js` | Bộ máy: co giãn màn hình, bàn phím và cảm ứng, âm thanh, lưu game, vẽ chữ và nút, vòng lặp |
| `js/art.js` | Hình vẽ: hero, quái, trùm, vũ khí, đồ vật, phông nền |
| `js/combat.js` | Trận đánh: người chơi, quái, sát thương, hiệu ứng ba hệ, dấu ấn |
| `js/boss.js` | Trùm: các đòn đánh và cách trùm học theo người chơi |
| `js/stage.js` | Một ải: bản đồ 8 phòng, cửa và chuyển phòng, đợt quái, nút điều khiển, thông tin trên màn hình, các bảng chọn, bảng kết quả |
| `js/mapgen.js` | Sinh bản đồ ải ngẫu nhiên theo hạt giống (ba kiểu bố cục A, B, C) và hàm kiểm tra bản đồ |
| `js/room_art.js` | Vẽ phòng vuông nhìn từ trên cho ba vùng: sàn, tường, cửa khóa và cửa mở |
| `js/minimap.js` | Bản đồ nhỏ và bản đồ to |
| `js/village.js` | Màn hình đầu và làng: bản đồ, lò rèn, trang bị, hero và kỹ năng, hướng dẫn, cài đặt |
| `js/main.js` | Khởi động game |
| `build.py` | Đóng gói game vào thư mục `dist/` |
| `tests/` | Các bài kiểm tra tự động |

## Đóng gói

Cần Python 3, không cần cài thêm gì.

```
python3 build.py
```

Kết quả nằm trong `dist/`:

- `linh-khi.html`: một tệp duy nhất chứa cả game, mở là chơi, gửi cho người khác được.
- `artifact.html`: một mảnh trang (không có `<html>`, `<head>`, `<body>`) để dán vào dịch vụ lưu trữ tự bọc khung trang bên ngoài.

Hai tệp này chỉ nạp một thứ từ mạng là phông chữ của Google Fonts. Không có mạng thì game dùng phông sẵn có của máy.

## Chạy kiểm tra

Cần Python 3 và Playwright (`pip install playwright` rồi `playwright install chromium`). Chạy từ thư mục `game`:

```
python3 tests/ui_input.py all      # điều khiển thật trên 4 cỡ màn hình (mỗi cỡ khoảng 1 phút)
python3 tests/ui_input.py phone    # chỉ một cỡ: phone, p169, desk hoặc port
python3 tests/ui_robust.py         # xoay màn hình, ẩn trang, khung hình chậm, bản lưu hỏng
python3 tests/ui_build.py          # đóng gói rồi chơi thử cả hai tệp trong dist/
python3 tests/ui_shots.py anh phone   # chụp mọi màn hình vào thư mục anh/ để xem bằng mắt
python3 tests/smoke.py anh         # nạp game và đánh thử vài giây
python3 tests/campaign.py          # bot tự chơi hết 15 ải để xem độ khó
python3 tests/mapgen.py            # bộ sinh bản đồ ải: 1000 hạt giống cho mỗi kiểu A, B, C
python3 tests/doors.py             # luật cửa, điều kiện mở cửa Trùm, bot đi hết ải ở cả ba kiểu
python3 tests/env_rooms.py         # vẽ thử mọi loại phòng ở ba vùng, cửa khóa và cửa mở
python3 tests/rules.py             # luật ba hệ, dấu ấn, trùm thích nghi
python3 tests/fuzz.py              # bấm loạn tìm lỗi sập
python3 tests/room_shots.py        # chụp ảnh phòng và bản đồ vào docs/phong-vuong/
```

Mỗi bài in ra số mục đạt và các mục hỏng. `tests/bot.js` là bot chơi thử, chỉ dùng khi kiểm tra và không bao giờ nằm trong bản đóng gói.
