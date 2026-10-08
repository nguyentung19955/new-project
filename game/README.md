# Linh Khí

Game đánh quái màn hình ngang cho điện thoại, chạy ngay trong trình duyệt. Bạn dẫn một hero đi qua từng ải, mỗi ải gồm 7 đến 8 phòng và kết thúc bằng một con trùm. Vũ khí lớn lên theo cách bạn đánh (nhận dấu ấn Lửa, Độc, Băng rồi tiến hóa), còn trùm thì học theo bạn: dùng một hệ quá nhiều, nó sẽ kháng hệ đó.

Đây là bản thử. Tiến trình được lưu trong trình duyệt của máy đang chơi.

## Cách chơi

Mở `index.html` (hoặc `dist/linh-khi.html`) bằng trình duyệt. Chạm màn hình, bấm **Vào ải**, chọn **Ải 1** rồi **Bắt đầu**. Ải đầu tiên có lời chỉ dẫn ở từng phòng.

Trên điện thoại (nên cầm ngang):

- Đặt ngón ở nửa trái màn hình rồi kéo để di chuyển.
- Các nút tròn bên phải: **Đánh** để ra đòn, **Né** để lăn tránh, **Đặc biệt** để tung đòn mạnh (tốn mana), nút còn lại là kỹ năng riêng của hero.
- Mỗi vũ khí có lối đánh riêng với nút **Đánh**:
  - Kiếm: bấm liên tiếp (hoặc giữ) ra chuỗi 3 nhát, nhát thứ ba mạnh và rộng hơn. Đánh ngay sau khi Né thì lướt tới chém.
  - Cung: bấm để bắn nhanh. Giữ để giương cung (có vạch lấy đà trên đầu), thả ra bắn tên mạnh xuyên qua nhiều quái.
  - Giáo: bấm liên tiếp ra ba nhát đâm rồi quét một vòng. Giữ rồi thả để lao tới một đoạn ngắn xuyên qua quái.
  - Búa: bấm để nện, làm quái khựng. Giữ để lấy đà 2 nấc, thả ra nện đất tạo sóng chấn động; đủ nấc 2 thì làm choáng.
- Vũ khí đã có hệ thì mọi đòn mang dáng vẻ của hệ đó: Lửa nổ lan và để lại vệt cháy, Độc để lại màn khói và lây sang quái gần, Băng mọc gai băng và làm vỡ quái đang đóng băng.
- Chạm ô vũ khí ở góc trên bên phải để đổi giữa hai vũ khí.
- Chạm ô **Bình máu** để hồi máu, chạm **Dừng** để tạm nghỉ.
- Lại gần rương, suối, cửa, thương nhân rồi bấm **Đánh** để mở hoặc chọn.
- Hết quái thì đi sang mép phải để qua phòng kế tiếp.

Trên máy tính:

| Phím | Việc |
| --- | --- |
| Mũi tên hoặc W A S D | Di chuyển |
| J | Đánh (kiếm: giữ để đánh liên tục; cung, giáo, búa: giữ để lấy đà, thả để tung đòn), mở rương, chọn cửa |
| K | Né |
| L | Đòn đặc biệt |
| I | Kỹ năng của hero |
| Q | Đổi vũ khí |
| E | Uống bình máu |
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
| `js/moves.js` | Lối đánh riêng của từng vũ khí (chuỗi kiếm, giương cung, loạt đâm, lấy đà búa) và luật riêng của ba hệ; mọi con số nằm ở đầu tệp |
| `js/boss.js` | Trùm: các đòn đánh và cách trùm học theo người chơi |
| `js/fx.js` | Hiệu ứng hình ảnh chung: vệt chém, hạt, số sát thương, rung màn hình |
| `js/fx_he.js` | Hiệu ứng ra chiêu theo lối đánh và theo hệ Lửa, Độc, Băng; vạch lấy đà |
| `js/stage.js` | Một ải: chuỗi phòng, nút điều khiển, thông tin trên màn hình, các bảng chọn, bảng kết quả |
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
python3 tests/moves.py             # lối đánh của bốn vũ khí và luật riêng của ba hệ
python3 tests/dps.py               # đo sát thương theo thời gian của bốn vũ khí và ba hệ khi bot chơi
python3 tests/perf.py              # đo thời gian một khung hình trong cảnh đông quái
python3 tests/chieu_shots.py       # chụp ảnh các lối đánh và hiệu ứng theo hệ vào docs/chieu-thuc/
```

Mỗi bài in ra số mục đạt và các mục hỏng. `tests/bot.js` là bot chơi thử, chỉ dùng khi kiểm tra và không bao giờ nằm trong bản đóng gói.
