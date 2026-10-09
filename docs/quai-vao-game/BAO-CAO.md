# Đưa quái và trùm mới vào game: báo cáo

Bộ 36 con (24 quái thường, 6 tinh anh, 3 trùm nhỏ, 3 trùm vùng) đã có hình và cử động từ đợt trước. Đợt này nối chúng vào trận đánh thật, kèm cơ chế chiến đấu mới. Hình quái cũ không còn dùng trong trận (vẫn giữ trong `js/art.js` làm dự phòng khi tệp hình mới lỗi).

## Đã làm gì

1. **Hình mới thay hình cũ** ở cả ba vùng (`js/monster_art.js`, `js/mobs.js`, `js/boss.js`). Mỗi trạng thái trong trận nối đúng cử động: xuất hiện, đứng thở, đi, báo trước đòn, ra đòn, trúng đòn (giật lùi và chớp trắng), choáng, chết. Vùng va chạm (thân rộng bao nhiêu thì đánh trúng bấy nhiêu) tính theo cỡ hình mới, nên quái to thì dễ trúng hơn quái nhỏ.
2. **Cơ chế theo vai** (bảng dưới), đủ tám vai ở mỗi vùng. Nổ theo hệ của vùng: Hang biển đóng băng em bé khoảng 0,65 giây, Rừng già để lại vũng độc, Lâu đài cổ để lại vệt cháy.
3. **Tinh anh**: máu gấp 5 quái thường, có chiêu riêng (dùng cử động `chieu1`) và một dấu hiệu ngẫu nhiên vẽ thành biểu tượng nhỏ trên đầu: tia chớp (nhanh hơn 45%), khiên (giảm 35% sát thương mọi phía), quả bom (chết thì nổ sau 0,95 giây), giọt máu (đánh trúng em bé thì hồi máu).
4. **Kiểu xuất hiện**: mỗi đợt quái chọn một trong ba kiểu: lần lượt từng con, cả đợt cùng lúc (chỉ khi đợt có từ 4 con trở xuống), hoặc từng tốp ba con. Chỗ sắp mọc có vòng đỏ khoảng một giây; em bé đứng trong vòng lúc quái mọc thì bị đẩy ra. Mỗi con diễn cử động xuất hiện riêng của nó (chui lên từ cát, nổi lên từ nước, rơi xuống, hiện từ khói...), lúc đó chưa đánh.
5. **Tám hướng**: mọi đòn của quái, tinh anh, trùm ngắm thẳng vào em bé theo góc bất kỳ. Vùng báo trước là đường thẳng, hình quạt, vòng tròn hoặc vành khăn, đều xoay theo góc. Đạn bay theo góc, gai toả tám hướng. Hình quái lật trái phải theo hướng đòn; vệt chém trong hình quái cũng xoay theo góc.
6. **Trùm nhỏ** có đòn thường và hai chiêu riêng. **Trùm vùng** có màn ra mắt (không nhận sát thương), ba pha đổi ở 66% và 33% máu (cảnh chuyển pha có gầm và chớp sáng, hình đổi theo pha, không nhận sát thương lúc đó), năm chiêu. Pha 1 dùng ba chiêu, pha 2 thêm chiêu 4, pha 3 đủ năm chiêu; pha sau ra chiêu nhanh hơn (cử động và vùng báo nhanh hơn 10% rồi 20%, nghỉ giữa hai chiêu ngắn hơn). Sau chiêu lớn nhất (chiêu 5), trùm choáng khoảng 1,5 giây và nhận thêm 50% sát thương. Chết thì diễn cử động chết dài khoảng 3,2 đến 3,4 giây, xong mới mọc cổng dịch chuyển.
7. **Giữ luật trùm học theo người chơi**: kháng hệ dùng nhiều nhất, yếu hệ khắc chế; chống đánh xa (đứng xa quá 120 điểm ảnh thì tên chỉ còn 30% sức; riêng Hồ Tinh bị bắn còn biến ra sau lưng em bé vồ một cái); chống áp sát (em bé đứng sát thì trùm hay dùng chiêu đánh quanh mình hơn; Hồ Tinh bật lùi để lại vũng lửa); bắt bài lăn né (sau mỗi chiêu thêm một vùng đỏ ở chỗ em bé sắp lăn tới).
8. **Dễ đọc**: vùng báo trước màu đỏ, đầy dần theo thời gian, viền nhấp nháy; lúc nổ chớp sáng nhẹ. Đòn trúng em bé có rung nhẹ, khựng hình và số sát thương. Em bé đứng sau quái to (hoặc sau trùm) thì vẽ thêm bóng mờ của bé lên trên để không bị che mất.
9. **Sổ tay trong game** (Cụ Đồ, mục hướng dẫn) thêm ba mục: Đọc đòn quái, Các loại quái, Tinh anh và trùm. `game/README.md` thêm mục "Quái và trùm".

## Cơ chế từng con

| Vai | Rừng già (Độc) | Hang biển (Băng) | Lâu đài cổ (Lửa) | Cách đánh trong game |
|---|---|---|---|---|
| Xông tới | Heo Rừng Con | Cua Lính | Lính Ma Giáp Gỉ | Áp sát, báo trước 0,6 giây rồi lao (heo, lính ma: thân lao tới thật một đoạn) hoặc chém hình quạt (cua) |
| Bầy nhỏ | Bầy Ong Vò Vẽ | Bầy Cá Con | Bầy Dơi Than | Một con là cả bầy; chạy nhanh, lao cắn ngắn, báo trước 0,4 giây |
| Giáp | Bọ Hung Mai Cứng | Ốc Mượn Hồn | Tượng Đá Cầm Khiên | Phía trước có vệt vàng (mặt khiên): đánh từ trước giảm 45%. Quay mặt chậm (em bé đứng sau lưng gần 1 giây nó mới quay). Đánh mãi vào khiên (khoảng 45% máu của nó) thì vỡ giáp 6 giây. Mỗi 7 đến 9 giây hồi 14% máu cho bạn đứng gần |
| Bắn xa | Hoa Phun Bào Tử | Hải Quỳ | Đèn Lồng Ma | Giữ khoảng cách, đường ngắm đỏ chớp rồi bắn (Hải Quỳ thì ném bong bóng rơi xuống chỗ em bé). Mỗi 9 đến 12 giây gọi hai bầy nhỏ (có vòng báo), tối đa hai con gọi ra còn sống |
| Nhanh nhẹn | Chồn Bóng | Cá Chuồn | Mèo Đen Hai Đuôi | Lặn hoặc chui xuống (cử động xuất hiện chạy ngược, lúc đó không bị nhắm), đi ngầm, vòng đỏ 0,75 giây báo chỗ trồi lên sau lưng hoặc bên cạnh em bé, trồi lên trúng thì mất máu, rồi đánh thêm một đòn và lùi ra |
| Cảm tử | Nấm Phồng | Cá Nóc | Hũ Lửa Sống | Lao vào, tới gần thì phồng lên trong vòng đỏ 0,85 giây rồi nổ, nổ xong thì mất (không tính là bị hạ, không cho dấu ấn). Hạ nó trước khi nổ thì không nổ |
| Đặt bom | Sóc Ném Quả Nổ | Sứa Bom | Tiểu Yêu Ném Pháo | Sóc và Tiểu Yêu ném quả nổ vòng cung tới chỗ em bé; Sứa thả bom nước ngay dưới mình. Bom nằm đếm ngược 1,2 đến 1,6 giây (vòng đỏ đầy dần, ngòi chớp nhanh dần) rồi nổ |
| Gai | Nhím Gai Độc | Nhím Biển | Nhím Than Hồng | Cứ 4,5 đến 6 giây dựng gai 2,2 giây: vòng đỏ nhấp nháy dưới chân và biểu tượng chấm than. Chém lúc này bị phản đòn (kèm hệ của vùng), bắn tên thì không. Hạ gai thì bắn gai toả tròn tám hướng |

| Tinh anh | Đòn thường | Chiêu riêng |
|---|---|---|
| Heo Rừng Nanh Dài | lao húc | húc ba lần zíc zắc, mỗi lần nhắm lại |
| Nấm Phồng Chúa | nổ khí độc quanh mình (không chết) | mưa bào tử: 5 quả rơi quanh em bé, để lại vũng độc |
| Cua Tướng | chém càng | kẹp chéo: hai đường chém hình chữ X đi qua chỗ em bé |
| Cá Nóc Chúa | bắn gai tám hướng | gai xoáy: hai đợt gai băng toả tròn lệch nhau |
| Tướng Ma | chém đại đao | đao xoáy: hai vòng chém quanh mình |
| Hũ Lửa Chúa | nổ lửa quanh mình | vòng cầu lửa: hai đợt cầu lửa toả tròn |

| Trùm nhỏ | Chiêu 1 | Chiêu 2 |
|---|---|---|
| Nấm Chúa (Rừng già) | hàng nấm độc mọc nối nhau theo hướng em bé (pha cuối để lại độc) | bão bào tử: hai đợt bào tử toả tròn và vũng độc quanh mình |
| Cua Đá (Hang biển) | đập càng rung sàn: vòng đỏ lớn quanh mình, chạy ra ngoài; từ pha 2 thêm vành sóng ngoài | mưa tinh thể: 5 đến 7 chỗ quanh em bé |
| Hổ Lửa (Lâu đài cổ) | vồ lửa: chồm tới một đường dài, để lại vệt lửa | gầm phun lửa hình quạt rộng |

| Trùm vùng | c1 | c2 | c3 | c4 (từ pha 2) | c5 (pha 3) |
|---|---|---|---|---|---|
| Mộc Tinh | quật cành (quạt rộng) | rễ đâm thành hàng (pha 2 thành hai hàng) | mưa quả độc, vỡ thành vũng độc | năm lá bùa bay đuổi theo | rừng gai: ba vành lan ra, mỗi vành chừa bốn khe |
| Ngư Tinh | đớp: lao tới theo đường thẳng | sóng thần: tường nước chạy về phía em bé, chừa một khe (mép khe trắng); pha 2 thêm bức thứ hai | phun băng (quạt hẹp), sàn để lại băng làm chậm | mưa băng nhọn 7 chỗ | xoáy nước quanh thân rồi bung vành sóng |
| Hồ Tinh | hồ hoả: 5, 6 rồi 8 cầu lửa ma bay vòng đuổi theo | vồ mồi hai lần | quạt đuôi: ba lớp vệt lửa trăng khuyết, sàn cháy | vòng lửa ma: hai vòng cột lửa lệch chỗ (giữa các cột là khe đứng được) | bão hồ hoả: ba đợt cầu lửa toả tròn lệch nhau |

Không chiêu nào phủ kín sàn: luôn có chỗ đứng ngoài vùng đỏ, khe hở, hoặc đi vào giữa sau khi vòng trong đã nổ.

## Kiểm tra

- Toàn bộ bài có sẵn đều qua: `ui_input.py all` (4 cỡ màn hình), `ui_robust.py`, `rules.py` 82/82, `moves.py` 92/92, `doors.py` 57/57, `mapgen.py`, `fuzz.py` (0 lỗi), `dps.py`, `ui_build.py`, `anim_smoke.py`, `cong.py` 66/66, `cung.py`, `env_rooms.py`, `fx_check.py`, `ghep.py` 109/109, `ghep2.py` 196/196, `perf.py`, `balance.py`, `campaign.py`.
- **Bài mới `tests/quai.py`** (105 mục): mọi vai có hình mới ở cả ba vùng; đòn tám hướng (quái xông tới, bầy nhỏ, nhanh nhẹn, tinh anh, giáp, bắn xa đứng ở 8 phía quanh em bé đứng yên đều đánh trúng, ở cả ba vùng); vùng báo xoay theo góc; bom có vòng đếm ngược và nổ theo hệ vùng; đóng băng làm em bé đứng yên rồi đi lại được; cảm tử nổ rồi mất; gai phản đòn cận chiến mà không phản đòn bắn xa, rồi bắn gai tám hướng; giáp che trước, vỡ giáp, quay mặt chậm, hồi máu cho bạn; bắn xa bắn xuống được và gọi bầy; nhanh nhẹn lặn rồi trồi lên cạnh em bé; sáu tinh anh dùng chiêu riêng và bốn dấu hiệu đều có tác dụng; đủ ba kiểu xuất hiện; ba trùm nhỏ dùng đủ hai chiêu; ba trùm vùng có màn ra mắt, đổi đủ hai pha, dùng đủ năm chiêu, có lúc choáng, chết xong mới mọc cổng; không lỗi trang, không lỗi hiệu ứng.
- **Sửa bài cũ cho khớp** (không bỏ mục nào): bài đo tầm đòn vũ khí (`moves.py`, `ghep.py`, `dps.py`) dùng bia thử cỡ chuẩn như quái cũ (`noArt`) để số đo vũ khí không đổi theo cỡ quái; bài nào hạ trùm ngay khi vào phòng thì bỏ qua màn ra mắt (`invuln = 0`) và chờ thêm cho màn chết; `ghep2.py` mục H (hoạt ảnh vòng gai, vòng nứt của trùm cũ) đổi sang kiểm tra vùng cảnh báo của chiêu xoáy nước và độ dẹt của vòng tròn, vành khăn; `fx_check.py` cho xác quái tan theo thời gian cử động chết; `doors.py` chờ 2 giây thay cho 1,5 giây để quái mọc; `perf.py` rải đủ tám vai mới; bot thử (`tests/bot.js`) biết né đường thẳng, quạt, vành khăn, chạy về khe của tường nước, và không chém quái gai đang dựng gai (như người chơi bình thường).
- **Độ khó** (bot, `balance.py`, mỗi ải 3 lần): trước đợt này thắng 44/45, mất trung bình 97% máu mỗi ải, một ải 265 giây, trùm 82 giây. Sau đợt này thắng 44/45 (thua một lượt ở ải 3-5, trước thua một lượt ở ải 2-4), mất trung bình 63% máu mỗi ải, một ải 288 giây, trùm 80 giây. Tỉ lệ thắng như cũ; bot mất máu ít hơn vì quái mới báo đòn rõ và lâu hơn, nhưng mỗi ải dài hơn khoảng 20 giây (quái diễn cử động xuất hiện, quái lặn và quái giáp lâu chết hơn). `campaign.py` (bot chơi nối 15 ải): 0 lần thua, như trước; tổng 60 phút (trước 57 phút).
- **Hiệu năng** (`perf.py --so`, 14 quái đủ tám vai và tinh anh, đo cả bản cũ với cùng cảnh): bản mới trung bình 2,0 ms mỗi khung, bằng 118% bản cũ (1,7 ms); khung hình cho phép là 16,7 ms nên vẫn rất mượt.

| Ải | 1-1 | 1-2 | 1-3 | 1-4 | 1-5 | 2-1 | 2-2 | 2-3 | 2-4 | 2-5 | 3-1 | 3-2 | 3-3 | 3-4 | 3-5 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Thắng (trước) | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 2/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 |
| Thắng (sau) | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 2/3 |

## Ảnh và GIF (trong thư mục này, chụp trong game, đã xem bằng mắt)

| Tệp | Nội dung |
|---|---|
| `phong-rung.png`, `phong-bien.png`, `phong-lau-dai.png` | Một phòng đánh quái thật mỗi vùng (bot đang đánh), có vùng đỏ báo đòn, bom đếm ngược |
| `tinh-anh-rung.png`, `tinh-anh-bien.png`, `tinh-anh-lau-dai.png` | Hai tinh anh mỗi vùng đang ra chiêu riêng, có biểu tượng dấu hiệu trên đầu |
| `trum-nho-*.png` | Trùm nhỏ mỗi vùng: chiêu 1 và chiêu 2 |
| `trum-rung-ba-pha.png`, `trum-bien-ba-pha.png`, `trum-lau-dai-ba-pha.png` | Trùm vùng ở pha 1, pha 2, pha 3 (hình đổi theo pha), mỗi pha một chiêu |
| `gif-phong-bien.gif` | Phòng quái Hang biển: cảm tử, đặt bom, gai, bắn xa |
| `gif-lan-troi-len.gif` | Mèo Đen lặn xuống rồi trồi lên cạnh em bé |
| `gif-moc-tinh-pha-3.gif` | Mộc Tinh chuyển sang pha 3 rồi ra chiêu rừng gai |
| `gif-ho-tinh.gif` | Hồ Tinh ra mắt rồi đánh (bot đánh thật) |
| `gif-ngu-tinh-chet.gif` | Ngư Tinh chết hoành tráng, sau đó cổng dịch chuyển mọc lên |

Dựng lại: `python3 game/tests/quai_shots.py` (cần Pillow).

## Chỗ mơ hồ, đã tự chọn

- **Bản chốt chỉ có tám vai mỗi vùng**, mà yêu cầu có thêm triệu hồi, hồi máu, chui đất. Đã gộp vào vai sẵn có cho hợp hình: quái bắn xa gọi thêm bầy nhỏ của vùng mình (hải quỳ gọi cá con, hoa gọi ong, đèn lồng gọi dơi); quái giáp hồi máu cho bạn; quái nhanh nhẹn lặn hoặc chui đất rồi trồi lên.
- **Cá Nóc** trong bản chốt là cảm tử nhưng cử động "ra đòn" là bắn gai toả tròn: trong game nó lao vào rồi nổ, cử động bắn gai dùng làm cảnh nổ. **Sứa Bom** có cử động "nổ" nhưng vai là đặt bom: trong game nó thả bom nước dưới mình.
- **Bầy nhỏ**: hình là cả bầy, nên một con trong game là một bầy (máu 0,9 thay cho ba con 0,34), mỗi đợt tối đa một bầy.
- **Trùm vùng** không còn đứng chắn một bên phòng như trước (Mộc Tinh sát tường phải, Ngư Tinh làm nước dâng thu hẹp sàn): cả ba đi lại trong phòng để mọi chiêu ngắm được theo góc bất kỳ. Hồ Tinh không còn tạo ảo ảnh đánh được; pha 2 của nó có hai bóng cáo tím trong hình.
- **Hồ Tinh pha 3** to gấp rưỡi (281x174) gần bằng cả sàn phòng trùm, nên trong game vẽ thu nhỏ còn 72%.
- **Cú lao** trong hình tự lùi về chỗ cũ: game dời vị trí thật của quái và dừng cử động ở lúc vươn xa nhất (chỉ dùng nửa đầu).
- **Vùng báo của hình** (vẽ sẵn trong cử động) được tắt; vùng báo trong game do luật chơi vẽ, để chỗ đỏ đúng bằng chỗ bị đánh.

## Điểm còn yếu

- **Quái đông và to**: quái mới to hơn quái cũ nhiều (Cua Lính 48x36 so với em bé cao 25), phòng thường chỉ 208x196 nên lúc đông quái thì hình đè lên nhau, khó nhìn từng con. Bóng mờ của em bé giúp không mất dấu bé, nhưng chưa giải quyết chuyện chật.
- **Quái bắn xa** là nguồn mất máu lớn nhất của bot trong `campaign.py`. Bot né đạn kém hơn người (bỏ sót 25% viên đạn), người chơi thật có lẽ thấy dễ hơn; phiên cân bằng sau nên xem lại tốc độ bắn.
- **Cân bằng vũ khí khi đánh quái mới**: bài `dps.py` mặc định đo trên bia cỡ chuẩn nên vẫn đạt; chạy `dps.py quaimoi` (đánh quái mới thật) thì cung chỉ thấp hơn kiếm khoảng 11% (mục tiêu 15 đến 25%), vì cận chiến khó hơn trước (giáp che trước, gai phản đòn, quái lặn). Để phiên cân bằng sau quyết.
- **Trùm lâu hơn**: có màn ra mắt, cảnh chuyển pha và màn chết, nên mỗi trận trùm dài thêm khoảng 10 giây; ải dài hơn trước một chút.
- **Hướng thẳng lên, thẳng xuống**: quái chỉ có hình nhìn ngang, đánh thẳng lên hoặc xuống trông hơi nghiêng (như đã ghi ở đợt hoạt hình).
- **Lặn của Cá Chuồn, Mèo Đen** dùng cử động xuất hiện chạy ngược nên lúc lặn xuống trông giống "tan vào" hơn là lặn.
- **Tường nước** của Ngư Tinh vẽ bằng chấm điểm ảnh khá đơn giản; khe an toàn có viền trắng và lối xanh nhạt nhưng nhìn nhanh vẫn hơi khó thấy.
