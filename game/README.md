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
| Bà Hàng Xén | gánh hàng | Rương vũ khí, chọn hai món mang theo, xem, bán; bán trang phục thường (nút **Trang phục ›**) |
| Cô Thợ May | khung cửi | Trang phục năm ô: mặc, tháo, may, nâng bậc, mở cấp cánh, mặc thử |
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
  - Cung: bấm để bắn nhanh; tên tự ngắm vào quái gần nhất theo mọi hướng (trên, dưới, chéo, sau lưng, kể cả quái đứng sát người), đón đầu nhẹ quái đang chạy, và xuyên thêm một con (con sau nhận khoảng một phần ba sát thương). Giữ để giương cung (có vạch lấy đà trên đầu), cung xoay theo quái gần nhất; thả ra bắn tên mạnh xuyên qua nhiều quái. Mưa tên (Đặc biệt) rơi vào quái hoặc cụm quái gần nhất; bẫy của Thợ Săn khi cầm cung ném thẳng vào chỗ quái gần nhất.
  - Giáo: bấm liên tiếp ra ba nhát đâm rồi quét một vòng. Giữ rồi thả để xốc tới một đoạn ngắn xuyên qua quái. Quét vòng quét ba phần tư vòng quanh người, chỉ chừa khe ngay sau lưng.
  - Búa: bấm để nện, làm quái khựng. Giữ để lấy đà 2 nấc, thả ra nện đất tạo sóng chấn động; đủ nấc 2 thì làm choáng.
- Mọi đòn đánh theo **tám hướng**: tự quay về quái gần nhất trong tầm của đòn (lên, xuống, chéo); không có quái thì theo hướng đang kéo cần, rồi hướng vừa đi. Em bé chỉ lật trái phải, còn vũ khí, vệt chém và vùng trúng xoay đúng góc. Lướt và lao đi theo hướng đó, chạm tường thì dừng.
- Mỗi loại vũ khí một chiêu **Đặc biệt** riêng (tốn mana, cũng tám hướng):
  - Kiếm, **Trảm Nguyệt**: vung một nhát phóng vệt chém trăng khuyết bay thẳng chừng 2/3 phòng, xuyên mọi quái; em bé lùi nửa bước.
  - Giáo, **Phi Thương**: ném giáo bay thẳng xuyên một hàng quái, con cuối (hoặc con sát tường) bị ghim, choáng ngắn; giáo cắm 0,6 giây rồi tự bay về tay, trúng lần nữa trên đường về. Giáo chưa về thì nút Đánh của cây giáo đó là cú đấm tay yếu (đổi sang vũ khí kia vẫn đánh bình thường).
  - Búa, **Địa Chấn**: nện xuống, vòng chấn nhỏ quanh người, rồi vệt nứt chạy nhanh theo hướng nhắm chừng nửa phòng (có vết nứt báo trước rất ngắn), quái trên vệt bị hất tung và choáng.
  - Cung, **Mưa Tên**: như cũ, rơi vào cụm quái gần nhất.
  - Đặc trưng hệ (vệt cháy, vũng độc, gai băng) để lại dọc đường chiêu bay.
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
- Hạ trùm cuối ải thì chưa hiện bảng kết quả: phần thưởng đã được tính và lưu ngay, đồ rơi nằm trên sàn (đi ngang qua là nhặt), và một **cổng dịch chuyển** mọc lên giữa phòng trùm (bản đồ nhỏ có biểu tượng cổng). Cửa phòng trùm mở, bạn đi lại tuỳ ý (không còn mất máu), ghé lại rương, suối, thương nhân. Tới gần cổng thì nút Đánh thành **Vào cổng**; vào cổng mới hiện bảng kết quả (Về làng, Chơi lại, Ải tiếp theo). Bảng tạm dừng lúc này có nút **Rời ải** để sang thẳng bảng kết quả. Thua thì vẫn hiện bảng thua ngay.
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

## Quái và trùm

Mỗi vùng có tám loại quái thường, hai tinh anh, một trùm nhỏ (ải 1 đến 4) và một trùm vùng (ải 5). Mọi đòn của quái ngắm thẳng vào em bé theo góc bất kỳ (trên, dưới, chéo), vùng đỏ báo trước xoay theo góc đó. Em bé không nhảy: chiêu nào cũng né được bằng đi hoặc lộn.

| Vai | Rừng già | Hang biển | Lâu đài cổ | Cách đánh |
| --- | --- | --- | --- | --- |
| Xông tới | Heo Rừng Con | Cua Lính | Lính Ma Giáp Gỉ | Áp sát, báo trước rồi lao hoặc chém |
| Bầy nhỏ | Bầy Ong Vò Vẽ | Bầy Cá Con | Bầy Dơi Than | Nhanh, lao cắn liên tục |
| Giáp | Bọ Hung Mai Cứng | Ốc Mượn Hồn | Tượng Đá Cầm Khiên | Che phía trước (vệt vàng), quay mặt chậm, hồi máu cho bạn đứng gần. Vòng ra sau, hoặc đánh mãi vào giáp cho vỡ |
| Bắn xa | Hoa Phun Bào Tử | Hải Quỳ | Đèn Lồng Ma | Giữ khoảng cách, có đường ngắm đỏ (0,7 giây) rồi bắn, mỗi 3 giây một phát, đạn đủ chậm để né; thỉnh thoảng gọi thêm hai bầy nhỏ |
| Nhanh nhẹn | Chồn Bóng | Cá Chuồn | Mèo Đen Hai Đuôi | Lặn hoặc chui xuống (không đánh được), vòng đỏ báo chỗ trồi lên cạnh em bé |
| Cảm tử | Nấm Phồng | Cá Nóc | Hũ Lửa Sống | Lao vào, phồng lên (vòng đỏ) rồi nổ, nổ xong thì mất |
| Đặt bom | Sóc Ném Quả Nổ | Sứa Bom | Tiểu Yêu Ném Pháo | Ném hoặc thả bom; bom nằm đếm ngược trong vòng đỏ rồi nổ |
| Gai | Nhím Gai Độc | Nhím Biển | Nhím Than Hồng | Có lúc dựng gai (vòng đỏ nhấp nháy, dấu chấm than): chém lúc đó bị phản đòn, bắn tên thì không. Hạ gai thì bắn gai tám hướng |

- Nổ theo hệ của vùng: Hang biển đóng băng em bé một lúc ngắn, Rừng già để lại vũng độc, Lâu đài cổ để lại vệt cháy.
- Quái xuất hiện theo ba kiểu: lần lượt từng con, cả đợt cùng lúc, hoặc từng tốp. Chỗ sắp mọc có vòng đỏ; đứng trong vòng lúc quái mọc thì bị đẩy ra. Phòng thường chỉ có tối đa 4 quái cùng lúc (tinh anh tính là hai): đủ số thì quái kế tiếp chờ, có chỗ mới mọc.
- Tinh anh mạnh hơn, có một chiêu riêng và một dấu hiệu trên đầu: tia chớp (nhanh), khiên (bọc giáp mọi phía), quả bom (nổ khi chết), giọt máu (đánh trúng thì hồi máu).
- Trùm nhỏ (Nấm Chúa, Cua Đá, Hổ Lửa) có đòn thường và hai chiêu riêng.
- Trùm vùng (Mộc Tinh, Ngư Tinh, Hồ Tinh) có màn ra mắt, ba pha đổi ở 2/3 và 1/3 máu (cảnh chuyển pha, hình đổi, không nhận sát thương lúc đó), năm chiêu (pha 1 ba chiêu, pha 2 thêm một, pha 3 đủ năm và nhanh hơn). Sau chiêu lớn nhất trùm choáng một lúc. Chết xong cổng dịch chuyển mới mọc.
- Trùm vẫn học theo bạn: kháng hệ dùng nhiều nhất, chống đánh xa, chống áp sát, bắt bài lăn né.

## Trang phục

Em bé mặc đồ theo năm ô: **Mũ**, **Áo**, **Đồ đeo lưng** (gùi, khăn choàng, trống nhỏ...), **Bùa** (đeo hông) và **Cánh**. Ô nào trống thì bé mặc đồ khởi đầu của mình. Đồ mặc chung cho cả bốn bé.

- Mỗi món có bậc Thường, Lam, Tím, Vàng như vũ khí (chỉ số x1; x1,25; x1,5; x1,8) và có thể có hệ Lửa, Độc, Băng.
- Mỗi món có 1 đến 3 chỉ số: máu, mana, giảm sát thương, tốc chạy, hồi chiêu nhanh, tầm nhặt đồ, bớt thời gian dính hệ.
- Món bậc Tím và Vàng có thêm một tác dụng đặc biệt (Vàng mạnh hơn):

| Ô | Món có hệ | Món không hệ |
| --- | --- | --- |
| Mũ | Quái đánh trúng bé bị cháy, độc hoặc chậm | Khiên đầu phòng: vào phòng mới chặn 1 đòn (Vàng: 2) |
| Áo | Lộn để lại vệt cháy, vũng độc hoặc vệt băng | như trên |
| Đồ đeo lưng | Mỗi 5 giây (Vàng: 4) rải một vũng hệ dưới chân khi còn quái | như trên |
| Bùa | Quái gục gần bé nổ nhỏ, làm quái quanh đó dính hệ | như trên |

- Cánh có ba cấp: mầm cánh, cánh nhỏ, cánh lớn. Cánh không cho bay hay nhảy. Cánh nhỏ: lộn xa hơn 20%, lộn xong có khiên 0,5 giây chặn một đòn (hồi 4 giây). Cánh lớn: xa hơn 30%, khiên 0,8 giây (hồi 3 giây).
- Ba bộ theo vùng: **Bộ Rừng Già** (Độc), **Bộ Hang Biển** (Băng), **Bộ Lâu Đài** (Lửa), mỗi bộ 5 món (cả cánh). Mặc 2 món cùng bộ: hiệu ứng bộ cũ (Mộc Tinh, Ngư Tinh, Hồ Tinh). Mặc 3 món trở lên: sát thương hệ của bộ +10% (4 món +14%, 5 món +18%) và vầng sáng quanh chân.
- Hình: vải, khăn, tua đung đưa theo bước chạy và văng ra sau khi lộn; món Lam trở lên có tua màu bậc; Tím, Vàng có ánh viền quanh bé; món có hệ toả tàn lửa, giọt độc hoặc bông tuyết; khiên hiện thành vòng sáng quanh bé.
- Cách kiếm: quái thường (1,2%) và tinh anh (12%) rơi món của vùng; trùm nhỏ 35% rơi một món Lam trở lên; trùm vùng luôn rơi một món của bộ vùng, bậc Tím (25% Vàng). Tinh anh vẫn có thể rơi bùa cũ (nay ở ô Bùa). Bà Hàng Xén bán đồ thường. Cô Thợ May may theo công thức từ gỗ linh, vảy cá, đá lửa (đồ bộ cần thêm 1 mảnh trùm), nâng bậc từng nấc (lên Vàng cần mảnh trùm), mở cấp cánh bằng mảnh trùm.
- Cô Thợ May có dấu chấm than khi có món mới hoặc đủ nguyên liệu may một món chưa có. Kho chứa 40 món, đầy thì món rơi đổi thành vàng.
- Bản lưu cũ: mũ, áo, bùa cũ tự chuyển sang kho trang phục, giữ nguyên chỉ số (đồ thường thành bậc Thường; đồ trùm và bùa thành bậc Lam), món đang mặc vẫn mặc. Thẻ **Rèn đồ** của Ông Thợ Rèn nay chỉ đường sang Cô Thợ May.

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

## Sức mạnh và cày

- **Sức mạnh** của em bé là một con số tính từ cấp hero, vũ khí mạnh nhất đang mang (bậc, mài, mốc tiến hóa), điểm kỹ năng, mũ và áo. Em bé mới có sức mạnh 100. Xem ở dải trên cùng trong làng, ở bảng hero của Ông Từ và ở góc trái khi đang trong ải.
- Mỗi ải có **Sức mạnh khuyên dùng**, ghi dưới thẻ ải trên tranh bản đồ của Chú Lái Đò và trong thẻ thông tin ải. Màu so với sức mạnh của bé: xanh là đủ, vàng là sát nút (từ 90%), đỏ là còn thiếu.
- Vùng 1 nhẹ: ải 1 đến 4 thường chơi một hai lần là qua. Ải 3, ải 4 của vùng 2 và 3 cần cày thêm vài lượt; ải trùm vùng (5, 10, 15) cần cày nhiều nhất, vùng sau nhiều hơn vùng trước.
- **Cày**: chơi lại ải cũ vẫn được kinh nghiệm, vàng, quặng và nguyên liệu vùng (cần cho mài từ +5, nâng bậc, rèn đồ). Chơi lại một ải đã qua có cơ hội rơi vũ khí bậc cao hơn lần đầu. Khi bé đã mạnh hơn 130% khuyên dùng của ải thì kinh nghiệm và vàng giảm dần (thấp nhất 40%), nguyên liệu vẫn đủ.
- **Quyết tâm**: thua thật ở một ải (không tính bỏ ải) thì lần sau vào lại chính ải đó bé mạnh thêm 4% máu và sát thương, cộng dồn tối đa 20%; qua ải thì hết.
- Lên cấp chậm hơn trước (cần 50 + 50 x cấp kinh nghiệm), mỗi cấp tăng 1,5% sát thương và 3,5% máu.
- Đi hết 15 ải lần đầu mất khoảng 3 đến 4 giờ chơi (bot đo bằng `tests/cay.py`).

## Các tệp

| Tệp | Nội dung |
| --- | --- |
| `index.html` | Trang game: bố cục, màu sắc, thứ tự nạp các tệp JS |
| `js/data.js` | Số liệu: hệ, vũ khí, bốn bậc, dòng phụ, tỉ lệ rơi, hero, quái, vùng, trang bị, giá cả |
| `js/engine.js` | Bộ máy: co giãn màn hình, bàn phím và cảm ứng, âm thanh, lưu game, vẽ chữ và nút, vòng lặp |
| `js/art.js` | Hình vẽ: đồ vật, phông nền, vùng nguy hiểm, đạn; hình quái, trùm, hero và vũ khí kiểu cũ (chỉ còn dùng khi thiếu các tệp mới) |
| `js/weapon_art.js` | Vũ khí sống: 400 hình (4 loại, 10 dòng, 3 nhánh hệ, 3 mốc), 4 bậc, khuôn mặt theo tâm trạng, biểu tượng ô đồ, tên |
| `js/hero_art.js` | Hình hero kiểu cũ (dự phòng khi hình mới lỗi) |
| `js/hero_tinhlinh.js` | Em bé tinh linh: bốn hero vẽ theo lớp (thân, áo, mũ, đồ đeo lưng, bùa, cánh), tư thế theo từng đòn đánh, cầm vũ khí sống; vải và tua đung đưa, ánh viền, hạt theo hệ, vầng sáng đủ bộ, khiên |
| `js/outfit.js` | Trang phục (`G.outfit`): danh mục món, bậc, hệ, bộ, chỉ số, tác dụng trong trận, rơi đồ, giá may, nâng bậc, mở cấp cánh, lưu và chuyển bản lưu cũ |
| `js/tailor.js` | Bảng của Cô Thợ May: năm ô đang mặc, kho có lật trang, may, nâng bậc, cánh, em bé mặc thử |
| `js/btn_art.js` | Bộ nút bấm: Đánh, Đặc biệt, kỹ năng, Né, bình máu, tạm dừng, ô vũ khí, cần điều khiển |
| `js/ui_theme.js` | Bộ giao diện chủ đề trống đồng Đông Sơn (`G.theme`): nút, bảng, thanh máu và mana, ô đồ bốn bậc, thẻ ải mặt trống, thông báo, khung thoại, biểu tượng tài nguyên. Tệp này cũng đổi cách vẽ chung `G.ui.btn`, `G.ui.panel`, `G.ui.bar`, `G.ui.text` của cả game sang chủ đề |
| `js/combat.js` | Trận đánh: người chơi, quái, sát thương, hiệu ứng ba hệ, dấu ấn |
| `js/moves.js` | Lối đánh riêng của từng vũ khí (chuỗi kiếm, giương cung, loạt đâm, lấy đà búa) và đặc trưng hệ mở theo cấp; mọi con số nằm ở đầu tệp |
| `js/boss.js` | Trùm: trùm nhỏ (hai chiêu riêng), trùm vùng (ra mắt, ba pha, năm chiêu, choáng, chết), và cách trùm học theo người chơi |
| `js/monster_art.js` | Hình và cử động của 36 quái và trùm (ghép tự động từ `docs/phac-thao/quai-hoat-hinh/nguon/`, không sửa tay) |
| `js/mobs.js` | Quái mới trong trận: con nào ở vùng nào, cơ chế từng vai, tinh anh, đòn ngắm mọi hướng, vùng báo trước xoay theo góc, cách vẽ quái |
| `js/bao_truoc.js` | Vùng báo trước đòn của quái và trùm (quạt, chữ nhật, tròn, đường thẳng, vành, vòng bom, vòng mọc quái, tường nước): vẽ mịn ở lớp giao diện, nằm dưới chân nhân vật, hiện ra mượt, thanh đếm ngược, chớp khi ra đòn |
| `js/fx.js` | Hiệu ứng hình ảnh chung: vệt chém, hạt, số sát thương, rung màn hình |
| `js/fx_he.js` | Hiệu ứng ra chiêu theo lối đánh và theo hệ Lửa, Độc, Băng; vạch lấy đà |
| `js/fx_dan.js` | Hiệu ứng đạn: hình riêng từng loại đạn theo vùng, xoay theo hướng bay, vệt bay, quầng sáng hệ, chớp lúc bắn, toé hạt lúc trúng, cắm tường, vỡ tan |
| `js/linhkhi.js` | Hiển thị linh khí (dấu ấn hệ): ba vạch dưới ô vũ khí, biểu tượng hệ trên đầu quái, khối linh khí ở màn kết quả, bảng Xem vũ khí, trang hướng dẫn |
| `js/stage.js` | Một ải: bản đồ 8 phòng, cửa và chuyển phòng, đợt quái, nút điều khiển, thông tin trên màn hình, các bảng chọn, bảng kết quả |
| `js/mapgen.js` | Sinh bản đồ ải ngẫu nhiên theo hạt giống (ba kiểu bố cục A, B, C) và hàm kiểm tra bản đồ |
| `js/room_art.js` | Vẽ phòng vuông nhìn từ trên cho ba vùng: sàn, tường, cửa khóa và cửa mở |
| `js/minimap.js` | Bản đồ nhỏ và bản đồ to |
| `js/portal.js` | Hình cổng dịch chuyển sau khi thắng và đồ rơi trên sàn |
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
python3 tests/campaign.py          # bot tự chơi hết 15 ải để xem độ khó (thua thì cày ải trước một lượt rồi thử lại)
python3 tests/cay.py               # cân bằng phải cày: kiểm luật sức mạnh, quyết tâm; bot chơi từ đầu 8 lượt, đếm số lần chơi từng ải và tổng thời gian ("lieu": bot không nhìn lời khuyên)
python3 tests/cay_shots.py         # chụp ảnh sức mạnh khuyên dùng trên thẻ ải, bảng hero, dải trên vào docs/can-bang-cay/
python3 tests/mapgen.py            # bộ sinh bản đồ ải: 1000 hạt giống cho mỗi kiểu A, B, C
python3 tests/doors.py             # luật cửa, điều kiện mở cửa Trùm, bot đi hết ải ở cả ba kiểu
python3 tests/env_rooms.py         # vẽ thử mọi loại phòng ở ba vùng, cửa khóa và cửa mở
python3 tests/rules.py             # luật ba hệ, dấu ấn, trùm thích nghi
python3 tests/trang_phuc.py        # trang phục: bản lưu cũ và hỏng, mặc, tháo, mua, may, nâng bậc, cánh, rơi đồ, tác dụng trong trận, dấu chấm than
python3 tests/trangphuc_shots.py   # chụp ảnh và GIF trang phục vào docs/trang-phuc/ (cần thêm Pillow)
python3 tests/fuzz.py              # bấm loạn tìm lỗi sập
python3 tests/room_shots.py        # chụp ảnh phòng và bản đồ vào docs/phong-vuong/
python3 tests/moves.py             # lối đánh của bốn vũ khí và luật riêng của ba hệ
python3 tests/cung.py              # cung tự ngắm: mỗi kiểu bắn 40 phát vào quái ở tám hướng, gần và xa, đứng yên và đang chạy
python3 tests/cung_shots.py        # chụp ảnh cung tám hướng vào docs/sua-gop-y-1/ (cần thêm Pillow)
python3 tests/cong.py              # cổng dịch chuyển sau khi thắng: luật, và bấm thật trên điện thoại
python3 tests/cong_shots.py        # chụp ảnh cổng dịch chuyển vào docs/sua-gop-y-1/ (cần thêm Pillow)
python3 tests/dps.py 90 16 nho     # bảng tầm với, thời gian, sát thương mỗi đòn; đo sát thương mỗi giây của bốn vũ khí và ba hệ khi bot chơi ("trum": phòng trùm, "mot": một quái thay cho cụm, "khonghe": bỏ ba hệ, "trangphuc": mặc đủ bộ trang phục Vàng)
python3 tests/perf.py              # đo thời gian một khung hình trong cảnh đông quái
python3 tests/chieu_shots.py       # chụp ảnh các lối đánh và hiệu ứng theo hệ vào docs/chieu-thuc/
python3 tests/ghep.py              # bản lưu cũ, bốn bậc, trùm rơi Vàng, đặc trưng hệ theo cấp, né theo hướng cuối, hero và nút mới
python3 tests/ghep2.py             # đợt ghép 2: nút trong hai lề, bóng và chiều sâu, lối đánh trong phòng hẹp, bản đồ một màu, né tám hướng, vũ khí rơi, suối khóa, hoạt ảnh trùm
python3 tests/quai.py              # quái mới: mỗi cơ chế (bom, cảm tử, gai, giáp, bắn xa, lặn, tinh anh, kiểu xuất hiện), đòn tám hướng, trùm đủ ba pha và chết được
python3 tests/linhkhi.py           # hiệu ứng đạn (hình theo vùng, không đổi đường bay, cắm tường, nhiều đạn) và linh khí (vạch tăng đúng, hạt bay vào vạch, màn kết quả ghi đúng số)
python3 tests/dan_linhkhi_shots.py # chụp ảnh và GIF đạn, linh khí vào docs/dan-va-linh-khi/ (cần thêm Pillow)
python3 tests/bao_truoc.py          # vùng báo trước vẽ mịn: đủ mọi hình, không vẽ lên lớp điểm ảnh, nằm dưới em bé, hiện ra mượt, đếm ngược, chớp khi nổ, thời gian không đổi
python3 tests/bao_truoc_shots.py chup <thư mục game> <thư mục ra>   # chụp ảnh trước/sau vùng báo trước (rồi "ghep", "gif") vào docs/bao-truoc-muot/
python3 tests/quai_shots.py        # chụp ảnh và GIF quái mới trong game vào docs/quai-vao-game/ (cần thêm Pillow)
python3 tests/balance.py 4         # bot chơi 15 ải với bản lưu thật vừa đủ sức mạnh khuyên dùng (tests/cay_luu.json), mỗi ải 4 lần: tỉ lệ thắng, thời gian, máu mất (thêm "- 0,4,9 vukhi": chạy với từng loại vũ khí; thêm "- - trangphuc" hoặc "trangphuc:vang": mặc bộ trang phục của vùng; "codinh": bản lưu dựng tay)
python3 tests/ghep2_shots.py       # chụp ảnh và ảnh động của đợt ghép 2 vào docs/ghep-2/ (cần thêm Pillow)
python3 tests/ghep_shots.py        # chụp sáu ảnh của đợt ghép 1 vào docs/ghep/ (cần thêm Pillow)
python3 tests/lang_shots.py        # chụp từng màn hình của giao diện trống đồng và làng có người vào docs/giao-dien-va-lang/
```

Mỗi bài in ra số mục đạt và các mục hỏng. `tests/bot.js` là bot chơi thử, chỉ dùng khi kiểm tra và không bao giờ nằm trong bản đóng gói.
