# Linh Khí

Game đánh quái màn hình ngang cho điện thoại, chạy ngay trong trình duyệt. Bạn dẫn một em bé tinh linh (hero) cầm vũ khí sống đi qua từng ải, mỗi ải là một bản đồ 8 phòng vuông nhìn từ trên xuống, xếp ngẫu nhiên mỗi lần chơi, và kết thúc bằng một con trùm. Vũ khí lớn lên theo cách bạn đánh (nhận dấu ấn Lửa, Độc, Băng rồi tiến hóa), còn trùm thì học theo bạn: dùng một hệ quá nhiều, nó sẽ kháng hệ đó.

Đây là bản thử. Tiến trình được lưu trong trình duyệt của máy đang chơi.

## Cách chơi

Mở `index.html` (hoặc `dist/linh-khi.html`) bằng trình duyệt. Chạm màn hình để vào làng: em bé xuống đò ở bến bên phải. Nói chuyện với **Chú Lái Đò** ngay cạnh bến, chọn **Ải 1** trên tranh bản đồ rồi bấm **Lên đò**. Ải đầu tiên có lời chỉ dẫn ở từng phòng.

### Ở làng

Làng là một cảnh đi lại được, rộng gấp rưỡi màn hình; màn hình trượt ngang theo em bé. Không còn danh sách nút: mỗi chức năng là một người.

- Kéo ở nửa trái màn hình để đi (tám hướng). Hai vũ khí đang mang bay theo sau em bé.
- Tới gần một người thì người đó ngẩng lên và nút tròn bên phải thành **Nói chuyện**. Chạm thẳng vào người cũng được: em bé tự chạy tới.
- Dải bảy khuôn mặt ở mép trên là lối tắt: chạm một mặt là em bé tự chạy tới người đó và bảng mở luôn (chạm lần hai thì tới ngay). Đang mở bảng mà chạm mặt khác thì sang thẳng người đó.
- Ai có việc mới thì có dấu chấm than vàng trên đầu và chấm đỏ trên khuôn mặt ở dải lối tắt.
- Chạm vào vũ khí đang bay để mở màn **Xem vũ khí**. Ba bé hero còn lại ngồi chơi ở sân đình, chạm vào bé nào là đổi sang bé đó.
- Tài nguyên ở dải trên cùng và mọi chỗ ghi giá, thưởng hiện bằng biểu tượng kèm số. Chạm vào biểu tượng để xem tên.

| Người | Ở đâu | Việc |
| --- | --- | --- |
| Chú Lái Đò | bến đò | Tranh bản đồ vùng: chọn ải, đổi độ khó, **Lên đò** |
| Ông Thợ Rèn | lò rèn | Mài, Nâng bậc, Tôi lại, Rèn đồ, Nâng lò |
| Bà Hàng Xén | gánh hàng | Rương vũ khí, chọn hai món mang theo, xem, bán |
| Cô Thợ May | khung cửi | Mũ, áo, bùa |
| Cụ Đồ | gốc đa | Cây kỹ năng, đặt lại điểm, hướng dẫn |
| Ông Từ | sân đình | Chọn hero, xem chỉ số |
| Anh Mõ | cổng làng | Cài đặt: âm thanh, toàn màn hình, xoá tiến trình |

### Trong ải

Trên điện thoại (nên cầm ngang):

- Đặt ngón ở nửa trái màn hình rồi kéo để di chuyển.
- Các nút tròn bên phải: **Đánh** để ra đòn, **Né** để lăn tránh, **Đặc biệt** để tung đòn mạnh (tốn mana), nút còn lại là kỹ năng riêng của hero. Nút đổi hình theo vũ khí và hệ đang cầm. Khi giữ **Đánh** để lấy đà, quanh nút có vòng nạp.
- **Né** lộn theo hướng đang đẩy cần. Không đẩy cần thì lộn theo hướng vừa di chuyển gần nhất; mũi tên trên nút Né chỉ sẵn hướng đó.
- Mỗi vũ khí có lối đánh riêng với nút **Đánh**:
  - Kiếm: bấm liên tiếp (hoặc giữ) ra chuỗi 3 nhát, nhát thứ ba mạnh và rộng hơn. Đánh ngay sau khi Né thì lướt tới chém.
  - Cung: bấm để bắn nhanh; tên tự ngắm chéo tới quái đứng lệch trên dưới và xuyên thêm một con. Giữ để giương cung (có vạch lấy đà trên đầu), thả ra bắn tên mạnh xuyên qua nhiều quái.
  - Giáo: bấm liên tiếp ra ba nhát đâm rồi quét một vòng. Giữ rồi thả để lao tới một đoạn ngắn xuyên qua quái.
  - Búa: bấm để nện, làm quái khựng. Giữ để lấy đà 2 nấc, thả ra nện đất tạo sóng chấn động; đủ nấc 2 thì làm choáng.
- Hệ của vũ khí mạnh lên theo cấp tiến hóa:
  - Trắng: chỉ có chỉ số.
  - Mầm (30 dấu ấn): chỉ số tăng, mỗi đòn có 20% gây cháy, độc hoặc chậm, vệt chém nhuốm màu hệ. Chưa có luật hệ.
  - Thành hình (120 dấu ấn): mở đặc trưng thứ nhất, thứ để lại trên sân. Lửa: vệt cháy. Độc: vũng độc. Băng: gai băng làm chậm.
  - Thức tỉnh (300 dấu ấn): mở đặc trưng thứ hai, phản ứng dây chuyền. Lửa: quái đang cháy chết thì nổ lan. Độc: quái đang trúng độc chết thì lây sang con bên cạnh. Băng: quái đóng băng bị đánh thì vỡ, văng mảnh.
  - Lên Thành hình và Thức tỉnh giữa trận thì có dòng thông báo kèm tên đặc trưng vừa mở.
- Chạm ô vũ khí ở góc trên bên phải để đổi giữa hai vũ khí.
- Chạm ô **Bình máu** để hồi máu, chạm **Dừng** để tạm nghỉ.
- Lại gần rương, suối, thương nhân, bàn thờ rồi bấm **Đánh** để mở hoặc chọn.
- Suối hồi chỉ dùng được khi đã dọn đủ 3 phòng quái. Ghé sớm thì suối hiện mờ kèm dòng "Dọn hết quái rồi quay lại".
- Còn quái thì mọi cửa khóa. Hết quái thì cửa mở: đi vào cửa có mũi tên để sang phòng kề.
- Chạm **bản đồ nhỏ** ở góc trên bên phải để tạm dừng và xem bản đồ cả ải; chạm lần nữa để chơi tiếp. Mọi ô phòng trên bản đồ cùng một màu, loại phòng xem ở biểu tượng; ô đang đứng sáng và có viền nổi, ô đã qua đậm hơn ô mới biết, cửa Trùm còn khóa có ổ khóa.

Trên máy tính:

| Phím | Việc |
| --- | --- |
| Mũi tên hoặc W A S D | Di chuyển |
| J | Đánh (kiếm: giữ để đánh liên tục; cung, giáo, búa: giữ để lấy đà, thả để tung đòn), mở rương |
| K | Né |
| L | Đòn đặc biệt |
| I | Kỹ năng của hero |
| Q | Đổi vũ khí |
| E | Uống bình máu |
| M | Mở hoặc đóng bản đồ ải |
| Esc | Tạm dừng, đóng bảng, quay về cảnh làng |

Ở làng: mũi tên hoặc W A S D để đi, J (hoặc Enter) để nói chuyện với người đang ở gần.

Chuột dùng được như ngón tay.

## Vũ khí: dòng và bậc

- Mỗi loại vũ khí (kiếm, cung, giáo, búa) có 10 dòng, mỗi dòng một hình và một tính nết. Tên và hình đổi theo nhánh hệ và mốc tiến hóa.
- Bốn bậc màu:

| Bậc | Sát thương gốc | Tiến hóa cao nhất | Dòng phụ |
| --- | --- | --- | --- |
| Thường | x1 | Thành hình | không có |
| Lam | x1,15 | Thức tỉnh | 1 |
| Tím | x1,3 | Thức tỉnh | 2 |
| Vàng | x1,5 (vùng 1), x1,6 (vùng 2), x1,7 (vùng 3) | Thức tỉnh | 2 và 1 dòng mạnh riêng |

- Dòng phụ: hồi thêm mana khi trúng, 10% gấp đôi sát thương, tầm xa hơn 15%. Dòng mạnh của bậc Vàng: Diệt yêu, Thấm hệ hoặc Mở màn.
- Nguồn: rương và quái tinh anh rơi vũ khí bậc ngẫu nhiên (đa số Thường, cao nhất Tím, vùng sau dễ ra bậc cao hơn), dòng ngẫu nhiên. Trùm vùng (ải 5, 10, 15) lần đầu bị hạ chắc chắn rơi một vũ khí Vàng; đánh lại thì 12% Vàng, còn lại Tím.
- Lò rèn, mục **Nâng bậc**: mỗi lần lên một nấc (Thường, Lam, Tím, Vàng), không mất dấu ấn và tiến hóa. Nấc lên Vàng cần mảnh trùm, thứ chỉ trùm vùng rơi.
- Ở làng, chạm vào vũ khí đang bay theo em bé (hoặc bấm **Xem** ở chỗ Bà Hàng Xén) để mở màn **Xem vũ khí**: bậc, dòng phụ, các đặc trưng hệ đã mở và sắp mở.
- Bản lưu cũ tự được nâng cấp khi mở game: Sắt thành Thường, Bạc thành Lam, Linh thành Tím; dòng lấy theo số thứ tự của món chia 10 lấy dư.

## Các tệp

| Tệp | Nội dung |
| --- | --- |
| `index.html` | Trang game: bố cục, màu sắc, thứ tự nạp các tệp JS |
| `js/data.js` | Số liệu: hệ, vũ khí, bốn bậc, dòng phụ, tỉ lệ rơi, hero, quái, vùng, trang bị, giá cả |
| `js/engine.js` | Bộ máy: co giãn màn hình, bàn phím và cảm ứng, âm thanh, lưu game, vẽ chữ và nút, vòng lặp |
| `js/art.js` | Hình vẽ: quái, trùm, đồ vật, phông nền; hình hero và vũ khí kiểu cũ (chỉ còn dùng khi thiếu các tệp mới) |
| `js/weapon_art.js` | Vũ khí sống: 400 hình (4 loại, 10 dòng, 3 nhánh hệ, 3 mốc), 4 bậc, khuôn mặt theo tâm trạng, biểu tượng ô đồ, tên |
| `js/hero_art.js` | Hình hero kiểu cũ (dự phòng khi hình mới lỗi) |
| `js/hero_tinhlinh.js` | Em bé tinh linh: bốn hero vẽ theo lớp (thân, áo, mũ, đồ đeo lưng, cánh), tư thế theo từng đòn đánh, cầm vũ khí sống |
| `js/btn_art.js` | Bộ nút bấm: Đánh, Đặc biệt, kỹ năng, Né, bình máu, tạm dừng, ô vũ khí, cần điều khiển |
| `js/ui_theme.js` | Bộ giao diện chủ đề trống đồng Đông Sơn (`G.theme`): nút, bảng, thanh máu và mana, ô đồ bốn bậc, thẻ ải mặt trống, thông báo, khung thoại, biểu tượng tài nguyên. Tệp này cũng đổi cách vẽ chung `G.ui.btn`, `G.ui.panel`, `G.ui.bar`, `G.ui.text` của cả game sang chủ đề |
| `js/combat.js` | Trận đánh: người chơi, quái, sát thương, hiệu ứng ba hệ, dấu ấn |
| `js/moves.js` | Lối đánh riêng của từng vũ khí (chuỗi kiếm, giương cung, loạt đâm, lấy đà búa) và đặc trưng hệ mở theo cấp; mọi con số nằm ở đầu tệp |
| `js/boss.js` | Trùm: các đòn đánh và cách trùm học theo người chơi |
| `js/fx.js` | Hiệu ứng hình ảnh chung: vệt chém, hạt, số sát thương, rung màn hình |
| `js/fx_he.js` | Hiệu ứng ra chiêu theo lối đánh và theo hệ Lửa, Độc, Băng; vạch lấy đà |
| `js/stage.js` | Một ải: bản đồ 8 phòng, cửa và chuyển phòng, đợt quái, nút điều khiển, thông tin trên màn hình, các bảng chọn, bảng kết quả |
| `js/mapgen.js` | Sinh bản đồ ải ngẫu nhiên theo hạt giống (ba kiểu bố cục A, B, C) và hàm kiểm tra bản đồ |
| `js/room_art.js` | Vẽ phòng vuông nhìn từ trên cho ba vùng: sàn, tường, cửa khóa và cửa mở |
| `js/minimap.js` | Bản đồ nhỏ và bản đồ to |
| `js/village_scene.js` | Cảnh làng có người (`G.villageScene`): nền làng 720 điểm, bảy người làng, em bé đi lại, vũ khí bay theo, tìm đường khi chạm, dải khuôn mặt lối tắt, tranh bản đồ vùng |
| `js/village.js` | Màn hình đầu và làng: mỗi người mở một bảng (tranh bản đồ, lò rèn, rương vũ khí, mũ áo bùa, cây kỹ năng và hướng dẫn, chọn hero, cài đặt), màn xem vũ khí |
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

Cần Python 3 và Playwright (`pip install playwright` rồi `playwright install chromium`; máy đã có sẵn Chromium của Playwright thì không cần cài lại). Chạy từ thư mục `game`:

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
python3 tests/moves.py             # lối đánh của bốn vũ khí và luật riêng của ba hệ
python3 tests/dps.py 90 16 nho     # đo sát thương của bốn vũ khí và ba hệ khi bot chơi trong phòng thường (thêm "trum" thay "nho": phòng trùm)
python3 tests/perf.py              # đo thời gian một khung hình trong cảnh đông quái
python3 tests/chieu_shots.py       # chụp ảnh các lối đánh và hiệu ứng theo hệ vào docs/chieu-thuc/
python3 tests/ghep.py              # bản lưu cũ, bốn bậc, trùm rơi Vàng, đặc trưng hệ theo cấp, né theo hướng cuối, hero và nút mới
python3 tests/ghep2.py             # đợt ghép 2: nút trong hai lề, bóng và chiều sâu, lối đánh trong phòng hẹp, bản đồ một màu, né tám hướng, vũ khí rơi, suối khóa, hoạt ảnh trùm
python3 tests/balance.py 4         # bot chơi 15 ải với bản lưu cố định, mỗi ải 4 lần: tỉ lệ thắng, thời gian, máu mất
python3 tests/ghep2_shots.py       # chụp ảnh và ảnh động của đợt ghép 2 vào docs/ghep-2/ (cần thêm Pillow)
python3 tests/ghep_shots.py        # chụp sáu ảnh của đợt ghép 1 vào docs/ghep/ (cần thêm Pillow)
python3 tests/lang_shots.py        # chụp từng màn hình của giao diện trống đồng và làng có người vào docs/giao-dien-va-lang/
```

Mỗi bài in ra số mục đạt và các mục hỏng. `tests/bot.js` là bot chơi thử, chỉ dùng khi kiểm tra và không bao giờ nằm trong bản đóng gói.
