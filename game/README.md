# Linh Khí

Game đánh quái màn hình ngang cho điện thoại, chạy ngay trong trình duyệt. Bạn dẫn Zed đi qua từng ải, mỗi ải là một bản đồ 8 phòng vuông nhìn từ trên xuống, xếp ngẫu nhiên mỗi lần chơi, và kết thúc bằng một con trùm. Zed luôn mang đủ 4 vũ khí (Kiếm, Thương, Búa, Phi tiêu), nâng bằng linh khí từ Trắng lên Thức tỉnh và ép đồ 7 bậc; 4 bộ đồ (Ninja và 3 bộ vùng) mỗi bộ có skill riêng. Trùm thì học theo bạn: dùng một hệ quá nhiều, nó sẽ kháng hệ đó.

Đây là bản thử. Tiến trình được lưu trong trình duyệt của máy đang chơi và, khi chơi trên web có mạng, lưu lên mây (Firebase). Hướng dẫn cho chủ dự án: `docs/firebase-linh-khi/HUONG-DAN.md`.

## Bản Zed: một nhân vật (12/10)

Từ bản này chỉ còn **một nhân vật chơi được tên Zed** (dùng hình và dữ liệu của Cu Tí; khoá nội bộ vẫn là `smith`). Zed dùng đủ bốn vũ khí (Kiếm, Thương, Búa, Phi tiêu). Ba bạn Cu Tèo, Cái Bống, Cu Lì vẫn bị yêu tinh bắt; hạ trùm vùng (độ khó thường) lần đầu thì cứu được bạn đó, bạn về ngồi chơi ở sân đình và **dạy Zed** nét riêng của mình (nội tại + nét riêng của chưởng, Cu Tèo thêm sở trường phi tiêu, Cái Bống thêm sở trường thương), cấp đúng một lần. Ông Từ không còn chọn em bé mà là bảng **xem chỉ số Zed** và ba nét đã học. Bản lưu cũ nhiều em bé được chuyển sang Zed (lấy em bé cấp cao nhất; vàng, tiến trình giữ nguyên; trùm đã hạ = nét đã học), dữ liệu cũ không bị xoá. Con số: `G.ZED_DAY` trong `js/data.js`.

## Cách chơi

Mở `index.html` (hoặc `dist/linh-khi.html`) bằng trình duyệt. Chạm màn hình để vào làng: em bé xuống đò ở bến bên phải. Nói chuyện với **Chú Lái Đò** ngay cạnh bến, chọn **Ải 1** trên tranh bản đồ rồi bấm **Lên đò**. Ải đầu tiên có lời chỉ dẫn ở từng phòng.

### Ở làng

Làng là một cảnh đi lại được, rộng gấp rưỡi màn hình; màn hình trượt ngang theo em bé. Không còn danh sách nút: mỗi chức năng là một người.

- Kéo ở nửa trái màn hình để đi (tám hướng). Nhân vật cầm vũ khí trên tay (14/10: bỏ hai vũ khí bay theo sau; 15/10 bỏ luôn cờ xem lại `?vkcu=1`).
- Tới gần một người thì người đó ngẩng lên và nút tròn bên phải thành **Nói chuyện**. Chạm thẳng vào người cũng được: em bé tự chạy tới.
- Dải bảy khuôn mặt ở mép trên là lối tắt: chạm một mặt là em bé tự chạy tới người đó và bảng mở luôn (chạm lần hai thì tới ngay). Đang mở bảng mà chạm mặt khác thì sang thẳng người đó.
- Ai có việc mới thì có dấu chấm than vàng trên đầu và chấm đỏ trên khuôn mặt ở dải lối tắt.
- Xem vũ khí ở Ông Thợ Rèn (thẻ Linh khí, **Xem linh khí**). Ba bạn đã được cứu ngồi chơi ở sân đình, chạm vào thì bạn nhắc lại chiêu đã dạy Zed.
- Tài nguyên ở dải trên cùng và mọi chỗ ghi giá, thưởng hiện bằng biểu tượng kèm số. Chạm vào biểu tượng để xem tên.

| Người | Ở đâu | Việc |
| --- | --- | --- |
| Chú Lái Đò | bến đò | Tranh bản đồ vùng: chọn ải, đổi độ khó, **Lên đò** |
| Ông Thợ Rèn | lò rèn | **Linh khí** (nâng 4 vũ khí: Trắng → Mầm → Thành hình → Thức tỉnh, chọn hệ), **Ép đồ** (7 bậc), Mài, Nâng lò |
| Bà Hàng Xén | gánh hàng | **Nguyên liệu** (đổi vàng lấy nguyên liệu vùng đã qua), **Quặng** (mua quặng, có giới hạn mỗi ngày) |
| Cô Thợ May | khung cửi | 4 bộ đồ của Zed: mặc, nâng cấp bộ (linh khí + vàng + mảnh trùm), mỗi cấp mở một skill bộ |
| Cụ Đồ | gốc đa | Cây kỹ năng, **Cây chưởng** (học điểm chưởng, đổi cây), đặt lại điểm, hướng dẫn, **Bảng vàng** (xếp hạng Sức mạnh, sao, thời gian hạ từng trùm vùng) |
| Ông Từ | sân đình | Thẻ **Zed** (chỉ số, nét ba bạn đã dạy), **Sổ yêu quái**, **Thành tựu** (đổi danh hiệu) |
| Anh Mõ | cổng làng | Thẻ **Việc hôm nay** (3 việc mỗi ngày, rương ngày, dải tuần), **Cài đặt**: âm thanh, toàn màn hình, lưu mây và **Đăng nhập Google**, **✉ Góp ý**, xoá tiến trình |

### Việc hôm nay, Sổ yêu quái, Thành tựu (Bước 2)

Ba hệ cho bé lý do ghé làng mỗi ngày (chừng 15–20 phút là xong việc), thưởng vừa phải. Chấm đỏ trên mặt Anh Mõ / Ông Từ ở dải lối tắt là có quà chờ **Nhận**.

- **Anh Mõ → Việc hôm nay** (mở sau ải Rừng già 2): mỗi ngày 3 việc (Dễ / Vừa / Khó), ví dụ "Hạ 30 quái", "Qua 1 ải không dùng bình máu", "Kết liễu 15 quái bằng đòn Lửa". Mỗi ngày đổi được 1 việc miễn phí. Xong việc thì bấm Nhận (vàng + quặng); xong đủ 3 việc mở **rương ngày** (đá nâng bậc + linh khí) và đóng dấu một ô trong **dải 7 ngày**; đủ 5 ngày trong tuần (Thứ 2 → Chủ nhật) mở **rương tuần** (bùa giữ bậc + đá). Quên nhận thì hôm sau tự cộng. Trong ải có dòng báo nhỏ khi xong việc, bảng kết quả có dòng "Việc hôm nay: x/3", bảng Tạm dừng có nút xem việc.
- **Ông Từ → Sổ yêu quái**: 36 trang (12 mỗi vùng), quái chưa gặp là bóng đen "?". Mỗi trang 3 nấc: ★ Đã hạ (vàng) · ★★ Tìm ra điểm yếu = hạ nó bằng hệ khắc chế (đòn kết liễu mang hệ đó, hoặc nó đang dính cháy / độc / chậm do vũ khí; trùm vùng: đạt sao thứ ba) (linh khí) · ★★★ Thuần thục = hạ đủ số con (đá nâng bậc). Đủ ★★ cả vùng: đá + danh hiệu "Thợ săn <vùng>"; đủ ★★★: danh hiệu "Bậc thầy <vùng>". Hệ khắc của quái thường chỉ để ghi sổ, **không** cộng sát thương.
- **Ông Từ → Thành tựu**: 30 huy hiệu Đồng / Bạc / Vàng, thưởng một lần (vàng, linh khí, đá, bùa, quặng) và danh hiệu. Danh hiệu chỉ để khoe (không cộng sức mạnh): đeo một cái, hiện dưới tên Zed ở Hành trang, ở bảng Ông Từ và trên đầu Zed trong làng.
- Bảng số: `G.VIEC_NGAY`, `G.SO_YQ`, `G.THANH_TUU` ở cuối `js/data.js`; khối **"PHIÊN E"** cuối tệp chỉnh lại số thưởng cho cân bằng (việc ~1/2 vàng, sổ và thành tựu 1/2 vàng, bớt đá). Cờ quay lui: `?sukien=0` (tắt cả ba), `?viecngay=0`, `?soyq=0`, `?thanhtuu=0`, `?khunganh=0` (ảnh khung → vẽ code), `?thuongb2=goc` (số thưởng gốc trước Phiên E). Dữ liệu trong bản lưu giữ nguyên khi tắt.

### Trong ải

Trên điện thoại (nên cầm ngang):

- Đặt ngón ở nửa trái màn hình rồi kéo để di chuyển.
- Các nút tròn bên phải: **Đánh** để ra đòn, **Né** để lăn tránh, **Đặc biệt** để tung đòn mạnh (tốn mana), nút trên cùng là **Chưởng**. Nút đổi hình theo vũ khí và hệ đang cầm. Khi giữ **Đánh** để lấy đà, quanh nút có vòng nạp.
- **Né** lộn theo hướng đang đẩy cần. Không đẩy cần thì lộn theo hướng vừa di chuyển gần nhất; mũi tên trên nút Né chỉ sẵn hướng đó.
- Mỗi vũ khí có lối đánh riêng với nút **Đánh**:
  - Kiếm: bấm liên tiếp (hoặc giữ) ra chuỗi 3 nhát, nhát thứ ba mạnh và rộng hơn. Đánh ngay sau khi Né thì lướt tới chém.
  - Phi tiêu: bấm để phóng nhanh; phi tiêu tự ngắm vào quái gần nhất theo mọi hướng (kể cả quái đứng sát người), đón đầu nhẹ quái đang chạy, và xuyên thêm một con (con sau nhận khoảng một phần ba sát thương). Giữ để lấy đà (có vạch trên đầu), thả ra phóng phát mạnh xuyên qua nhiều quái.
  - Thương: bấm liên tiếp ra ba nhát đâm rồi quét một vòng. Giữ rồi thả để xốc tới một đoạn ngắn xuyên qua quái. Quét vòng quét ba phần tư vòng quanh người, chỉ chừa khe ngay sau lưng.
  - Búa: bấm để nện, làm quái khựng. Giữ để lấy đà 2 nấc, thả ra nện đất tạo sóng chấn động; đủ nấc 2 thì làm choáng.
- Mọi đòn đánh theo **tám hướng**: tự quay về quái gần nhất trong tầm của đòn (lên, xuống, chéo); không có quái thì theo hướng đang kéo cần, rồi hướng vừa đi. Em bé chỉ lật trái phải, còn vũ khí, vệt chém và vùng trúng xoay đúng góc. Lướt và lao đi theo hướng đó, chạm tường thì dừng.
- Mỗi loại vũ khí một chiêu **Đặc biệt** riêng (tốn mana, cũng tám hướng):
  - Kiếm, **Trảm Nguyệt**: vung một nhát phóng vệt chém trăng khuyết bay thẳng chừng 2/3 phòng, xuyên mọi quái; em bé lùi nửa bước.
  - Thương, **Phi Thương**: ném thương bay thẳng xuyên một hàng quái, con cuối (hoặc con sát tường) bị ghim, choáng ngắn; thương cắm 0,6 giây rồi tự bay về tay, trúng lần nữa trên đường về. Thương chưa về thì nút Đánh của cây thương đó là cú đấm tay yếu (đổi sang vũ khí khác vẫn đánh bình thường).
  - Búa, **Địa Chấn**: nện xuống, vòng chấn nhỏ quanh người, rồi vệt nứt chạy nhanh theo hướng nhắm chừng nửa phòng (có vết nứt báo trước rất ngắn), quái trên vệt bị hất tung và choáng.
  - Phi tiêu, **Mưa Phi Tiêu**: rơi vào cụm quái gần nhất.
  - Đặc trưng hệ (vệt cháy, vũng độc, gai băng) để lại dọc đường chiêu bay.
- **Linh khí** vào một túi chung (không còn dấu ấn riêng từng vũ khí). Linh khí có từ: hạ tinh anh, trùm nhỏ, trùm vùng; viên linh khí quái thường thỉnh thoảng rơi (đi lại gần là nhặt); kết liễu quái đang dính hiệu ứng hệ; rương báu; phần thưởng qua ải. Số: `G.LINHKHI`, `G.ROI_MOI` trong `js/data.js`.
- Mỗi vũ khí nâng bằng linh khí ở Ông Thợ Rèn (thẻ Linh khí), theo cấp:
  - Trắng: chưa có hệ.
  - Mầm: chọn hệ Lửa, Độc hoặc Băng; chỉ số tăng, mỗi đòn có tỉ lệ gây cháy, độc hoặc chậm, vệt chém nhuốm màu hệ. Chưa có luật hệ.
  - Thành hình: mở đặc trưng thứ nhất, thứ để lại trên sân. Lửa: vệt cháy. Độc: vũng độc. Băng: gai băng làm chậm.
  - Thức tỉnh: mở đặc trưng thứ hai, phản ứng dây chuyền. Lửa: quái đang cháy chết thì nổ lan. Độc: quái đang trúng độc chết thì lây sang con bên cạnh. Băng: quái đóng băng bị đánh thì vỡ, văng mảnh.
  - Giá linh khí mỗi cấp: `G.VK_MOI.gia`; đổi hệ: `G.VK_MOI.doiHe`.
- **Chưởng** (thay nút kỹ năng riêng của hero cũ): bắn một luồng chưởng linh khí, tốn 30 mana, hồi 1 giây, tự ngắm quái gần nhất theo tám hướng.
  - Ba cây chưởng, mỗi lúc dùng một cây: **Hỏa chưởng** (cầu lửa nổ lan, gây cháy; nhánh nổ to, vệt cháy, lửa dai, Tích lực, mưa tàn lửa), **Độc chưởng** (luồng độc để lại mây độc; nhánh mây dày, lây độc, ăn mòn giáp, tách 3 luồng, mây hút), **Băng chưởng** (mũi băng xuyên 3 quái, làm chậm; nhánh tầm xa, xuyên thêm, đóng băng, băng vỡ, vòng băng). Mỗi cây 6 nút, 28 điểm để đầy.
  - Mỗi cấp nhân vật +1 điểm chưởng (riêng với điểm kỹ năng). Học ở Cụ Đồ (thẻ Cây chưởng) hoặc Hành trang (thẻ Kỹ năng) khi ở làng; đổi cây miễn phí, điểm được trả lại hết.
  - Kỹ năng cũ thành nét riêng của chưởng: Thợ Rèn đẩy lùi mạnh, Thợ Săn bay xa và nhanh hơn, Thầy Lang trúng thì hồi chút máu, Đô Vật tầm gần mà to.
  - Chưởng không cho linh khí cho vũ khí, không kết hợp hệ với vũ khí, trùm không học theo chưởng.
- Chạm ô vũ khí ở góc trên bên phải để đổi sang vũ khí kế tiếp (xoay vòng 4 món).
- Chạm ô **Bình máu** để hồi máu, chạm **Dừng** để tạm nghỉ.
- Lại gần rương, suối, thương nhân, bàn thờ rồi bấm **Đánh** để mở hoặc chọn.
- Suối hồi chỉ dùng được khi đã dọn đủ 3 phòng quái. Ghé sớm thì suối hiện mờ kèm dòng "Dọn hết quái rồi quay lại".
- Còn quái thì mọi cửa khóa. Hết quái thì cửa mở: đi vào cửa có mũi tên để sang phòng kề.
- Hạ trùm cuối ải thì chưa hiện bảng kết quả: phần thưởng đã được tính và lưu ngay (vàng, linh khí, quặng, nguyên liệu, đá nâng bậc nằm trên sàn, đi ngang qua là nhặt), và một **cổng dịch chuyển** mọc lên giữa phòng trùm (bản đồ nhỏ có biểu tượng cổng). Cửa phòng trùm mở, bạn đi lại tuỳ ý (không còn mất máu), ghé lại rương, suối, thương nhân. Tới gần cổng thì nút Đánh thành **Vào cổng**; vào cổng mới hiện bảng kết quả (Về làng, Chơi lại, Ải tiếp theo). Bảng tạm dừng lúc này có nút **Rời ải** để sang thẳng bảng kết quả. Thua thì vẫn hiện bảng thua ngay.
- Chạm **bản đồ nhỏ** ở góc trên bên phải để tạm dừng và xem bản đồ cả ải; chạm lần nữa để chơi tiếp. Mọi ô phòng trên bản đồ cùng một màu, loại phòng xem ở biểu tượng; ô đang đứng sáng và có viền nổi, ô đã qua đậm hơn ô mới biết, cửa Trùm còn khóa có ổ khóa.

Trên máy tính:

| Phím | Việc |
| --- | --- |
| Mũi tên hoặc W A S D | Di chuyển |
| J | Đánh (kiếm: giữ để đánh liên tục; phi tiêu, thương, búa: giữ để lấy đà, thả để tung đòn), mở rương |
| K | Né |
| L | Đòn đặc biệt |
| I | Chưởng (Hỏa chưởng có Tích lực: giữ để tích, thả để bắn) |
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
- Mười ba con trước trông chung chung (Cá Nóc, Sứa Bom, Cá Chuồn, Nhím Biển, Bầy Cá Con, Bầy Ong Vò Vẽ, Chồn Bóng, Nấm Phồng, Nhím Gai Độc, Bầy Dơi Than, Hũ Lửa Sống, Đèn Lồng Ma, Nhím Than Hồng) được thêm chi tiết nhận diện (đốm, vân, ánh mắt, nanh, lá bùa vàng trên Hũ Lửa...) và bộ phận cử động riêng (vây, cánh, đuôi, xúc tu, chùm gai, chân, quai), có tàn lửa, bào tử, khói bóng bay ra. Cỡ va chạm giữ nguyên.

### Thưởng trên sàn

Quái, tinh anh, trùm và rương **không rơi vũ khí hay quần áo** nữa: thưởng là vàng, linh khí, quặng, nguyên liệu vùng, mảnh trùm và đá nâng bậc. Thưởng được cộng ngay khi rơi; món trên sàn chỉ để thấy và nhặt (lại gần thì tự bay về). Thưởng nằm ở lớp sàn nên không che quái và vùng báo trước.

## Bộ đồ của Zed

- Có 4 bộ: **Ninja Bóng Đêm** (có sẵn), **Thợ Săn Rừng**, **Chiến Binh Biển**, **Hiệp Sĩ Lâu Đài** (mở khi hạ trùm vùng Rừng già, Hang biển, Lâu đài cổ lần đầu).
- Mỗi bộ có 3 cấp, nâng ở Cô Thợ May bằng linh khí + vàng (cấp 2, 3 cần thêm mảnh trùm của vùng bộ đó). Số: `G.BO_MOI`.
- Mỗi cấp bộ mở một **skill bộ** riêng, chỉ có tác dụng khi đang mặc bộ đó (bảng số `G.SKILL_BO`, luật `js/bo_skill.js`):
  - Ninja: Bóng lướt, Phân thân, Ám sát.
  - Rừng: Nhựa rừng, Gai độc, Bẫy dây leo.
  - Biển: Khiên nước, Sóng dội, Thuỷ triều.
  - Lâu đài: Giáp bạc, Phản đòn, Khí thế.
- Skill bộ cũng tác dụng lên trùm (Thuỷ triều làm trùm chậm một nửa hiệu lực; trùm có lúc nhắm vào bóng Phân thân) và được tính vào Sức mạnh.

## Vũ khí: ép đồ 7 bậc

- Ngoài cấp linh khí, mỗi vũ khí có **bậc ép đồ**: Trắng → Xanh lam → Xanh lục → Tím → Vàng → Đỏ → Rực lửa (Rực lửa mạnh khoảng gấp 1,75 lần).
- Ép ở Ông Thợ Rèn (thẻ **Ép đồ**) bằng **đá nâng bậc** + vàng (bậc Đỏ, Rực lửa thêm mảnh trùm). Có tỉ lệ hỏng; từ Vàng trở lên hỏng thì tụt 1 bậc, trừ khi dùng **bùa giữ bậc**. Mỗi lần hỏng cộng điểm may mắn cho lần sau.
- Từ bậc Tím, mỗi bậc mở 1 dòng hiệu ứng ngẫu nhiên (chí mạng, hút máu, tốc đánh...); đổi dòng luôn thành công. Bảng số: `G.EP_DO`.
- Đá nâng bậc rơi từ trùm nhỏ, trùm vùng và **Ải Đá Bậc** (ải ngày). Màu tên vũ khí theo bậc ép đồ.
- **Ải theo ngày** (mở sau khi hạ trùm vùng Rừng già, nút **Ải ngày** ở bản đồ của Chú Lái Đò): Ải Đá Bậc, Ải Đá Mài (quặng), Ải Vàng; mỗi ải mở vài ngày trong tuần, 3 lượt thắng mỗi ngày. Bảng số: `G.AI_NGAY`.

## Sức mạnh và cày

- **Sức mạnh** của Zed là một con số tính từ cấp, vũ khí đang mang (cấp linh khí, bậc ép đồ, mài; 75% món mạnh nhất + 25% món kế), điểm kỹ năng, chưởng và skill bộ đang mặc. Zed mới có sức mạnh khoảng 100. Xem ở dải trên cùng trong làng, ở bảng hero của Ông Từ và ở góc trái khi đang trong ải.
- Mỗi ải có **Sức mạnh khuyên dùng**, ghi dưới thẻ ải trên tranh bản đồ của Chú Lái Đò và trong thẻ thông tin ải. Màu so với sức mạnh của bé: xanh là đủ, vàng là sát nút (từ 90%), đỏ là còn thiếu.
- Vùng 1 nhẹ: ải 1 đến 4 thường chơi một hai lần là qua. Ải 3, ải 4 của vùng 2 và 3 cần cày thêm vài lượt; ải trùm vùng (5, 10, 15) cần cày nhiều nhất, vùng sau nhiều hơn vùng trước.
- **Cày**: chơi lại ải cũ vẫn được kinh nghiệm, vàng, linh khí, quặng và nguyên liệu vùng (cần cho mài từ +5, nâng lò), đánh lại trùm được đá nâng bậc và mảnh trùm. Khi Zed đã mạnh hơn 130% khuyên dùng của ải thì kinh nghiệm và vàng giảm dần (thấp nhất 40%), nguyên liệu vẫn đủ.
- **Thua không làm bé mạnh thêm** (đã bỏ "Quyết tâm"). Sức mạnh chỉ đến từ cày nâng cấp: cấp (tối đa 40), mài vũ khí (tối đa +15, lò cấp 4), nâng vũ khí bằng linh khí, ép đồ, cây kỹ năng, cây chưởng, nâng bộ đồ, nâng lò.
- **Bảng thua chỉ nên cày gì**: Sức mạnh hiện tại so với khuyên dùng, và 2-3 gợi ý cụ thể (ví dụ "Mài Kiếm lên +6: thiếu 80 vàng", "Mài Kiếm lên +7: thiếu 3 vảy cá — chơi lại Hang biển 2", "Còn 2 điểm kỹ năng chưa học"). Bấm gợi ý là về làng mở đúng người làng (js/upgrade.js).
- Lên cấp chậm hơn trước (cần 50 + 50 x cấp kinh nghiệm), mỗi cấp tăng 1,5% sát thương và 3,5% máu.
- Đi hết 15 ải lần đầu mất khoảng 3 giờ chơi, ~46 lượt (bot hệ thống mới đo bằng `tests/cay.py`, đợt 5).

## Các tệp

| Tệp | Nội dung |
| --- | --- |
| `index.html` | Trang game: bố cục, màu sắc, thứ tự nạp các tệp JS |
| `js/data.js` | Số liệu: hệ, 4 vũ khí, linh khí, ép đồ, ải ngày, bộ đồ và skill bộ, hero, quái, vùng, giá cả |
| `js/engine.js` | Bộ máy: co giãn màn hình, bàn phím và cảm ứng, âm thanh, lưu game, vẽ chữ và nút, vòng lặp |
| `js/art.js` | Hình vẽ: đồ vật, phông nền, vùng nguy hiểm, đạn; hình quái, trùm, hero và vũ khí kiểu cũ (chỉ còn dùng khi thiếu các tệp mới) |
| `js/weapon_art.js` | Mô tả vũ khí (`G.weaponArt.fromWeapon`, tầm mũi) để tra ảnh vũ khí; hàm vẽ code kiểu cũ chỉ còn cho công cụ Xưởng Sprite / tách đồ (game vẽ bằng bộ ảnh `zed-vk`, `js/vk_moi.js`; cờ `?vkcu=1` đã bỏ 15/10) |
| `js/vk_moi.js` | 4 vũ khí cố định, túi linh khí, nâng cấp vũ khí, nâng bộ đồ, chuyển bản lưu sang hệ mới |
| `js/ep_do.js` | Ép đồ 7 bậc: đá nâng bậc, bùa giữ bậc, dòng hiệu ứng, thẻ Ép đồ |
| `js/ai_ngay.js` | Ải theo ngày: Ải Đá Bậc, Ải Đá Mài, Ải Vàng |
| `js/bo_skill.js` | Skill của 4 bộ đồ Zed, và quy đổi skill bộ ra Sức mạnh |
| `js/hero_tinhlinh.js` | Em bé tinh linh: bốn hero vẽ theo lớp (thân, áo, mũ, đồ đeo lưng, bùa, cánh), tư thế theo từng đòn đánh, cầm vũ khí sống; vải và tua đung đưa, ánh viền, hạt theo hệ, vầng sáng đủ bộ, khiên |
| `js/btn_art.js` | Bộ nút bấm: Đánh, Đặc biệt, kỹ năng, Né, bình máu, tạm dừng, ô vũ khí, cần điều khiển |
| `js/ui_theme.js` | Bộ giao diện chủ đề trống đồng Đông Sơn (`G.theme`): nút, bảng, thanh máu và mana, ô đồ bốn bậc, thẻ ải mặt trống, thông báo, khung thoại, biểu tượng tài nguyên. Tệp này cũng đổi cách vẽ chung `G.ui.btn`, `G.ui.panel`, `G.ui.bar`, `G.ui.text` của cả game sang chủ đề |
| `js/combat.js` | Trận đánh: người chơi, quái, sát thương, hiệu ứng ba hệ, linh khí nhận |
| `js/moves.js` | Lối đánh riêng của từng vũ khí (chuỗi kiếm, lấy đà phi tiêu, loạt đâm thương, lấy đà búa) và đặc trưng hệ mở theo cấp; mọi con số nằm ở đầu tệp |
| `js/boss.js` | Trùm: trùm nhỏ (hai chiêu riêng), trùm vùng (ra mắt, ba pha, năm chiêu, choáng, chết), và cách trùm học theo người chơi |
| `js/monster_art.js` | Hình và cử động của 36 quái và trùm (ghép tự động từ `docs/phac-thao/quai-hoat-hinh/nguon/`, không sửa tay; phần chi tiết thêm ở `nguon/chitiet.js`, ghép riêng bằng `nguon/ghep_chitiet.py`) |
| `js/mobs.js` | Quái mới trong trận: con nào ở vùng nào, cơ chế từng vai, tinh anh, đòn ngắm mọi hướng, vùng báo trước xoay theo góc, cách vẽ quái |
| `js/bao_truoc.js` | Vùng báo trước đòn của quái và trùm (quạt, chữ nhật, tròn, đường thẳng, vành, vòng bom, vòng mọc quái, tường nước): vẽ mịn ở lớp giao diện, nằm dưới chân nhân vật, hiện ra mượt, thanh đếm ngược, chớp khi ra đòn |
| `js/fx.js` | Hiệu ứng hình ảnh chung: vệt chém, hạt, số sát thương, rung màn hình |
| `js/fx_he.js` | Hiệu ứng ra chiêu theo lối đánh và theo hệ Lửa, Độc, Băng; vạch lấy đà |
| `js/fx_dan.js` | Hiệu ứng đạn: hình riêng từng loại đạn theo vùng, xoay theo hướng bay, vệt bay, quầng sáng hệ, chớp lúc bắn, toé hạt lúc trúng, cắm tường, vỡ tan |
| `js/linhkhi.js` | Hiển thị linh khí: biểu tượng hệ trên đầu quái, khối linh khí ở màn kết quả, chuyển mốc của bản lưu cũ |
| `js/stage.js` | Một ải: bản đồ 8 phòng, cửa và chuyển phòng, đợt quái, nút điều khiển, thông tin trên màn hình, các bảng chọn, bảng kết quả |
| `js/mapgen.js` | Sinh bản đồ ải ngẫu nhiên theo hạt giống (ba kiểu bố cục A, B, C) và hàm kiểm tra bản đồ |
| `js/room_art.js` | Vẽ phòng vuông nhìn từ trên cho ba vùng: sàn, tường, cửa khóa và cửa mở |
| `js/minimap.js` | Bản đồ nhỏ và bản đồ to |
| `js/portal.js` | Hình cổng dịch chuyển sau khi thắng |
| `js/do_roi.js` | Hình thưởng nằm trên sàn (viền, bóng, nảy), tên khi lại gần, tự hút về |
| `js/village_scene.js` | Cảnh làng có người (`G.villageScene`): nền làng 720 điểm, bảy người làng, em bé đi lại, vũ khí bay theo, tìm đường khi chạm, dải khuôn mặt lối tắt, tranh bản đồ vùng |
| `js/village.js` | Màn hình đầu và làng: mỗi người mở một bảng (tranh bản đồ, lò rèn, rương vũ khí, mũ áo bùa, cây kỹ năng và hướng dẫn, chọn hero, cài đặt), màn xem vũ khí |
| `js/firebase-config.js` | Cấu hình web công khai của dự án Firebase sontinhthuytinh (dùng chung với Thần Thoại Việt) |
| `js/cloud.js` | Lưu mây (`G.cloud`): tự đăng nhập khách, lưu gộp 4 giây vào `linhkhi_users`, chọn bản mới hơn, nối Google, bảng vàng và góp ý trên Firestore; tự tắt khi không chạy được |
| `js/cloud_ui.js` | Khung HTML nổi để gõ chữ (`G.cloudUI`): hòm thư góp ý, Góp ý nhận được (chỉ quản trị), hỏi chọn bản lưu, đổi tên |
| `js/bang_vang.js` | Bảng vàng ở Cụ Đồ (`G.bangVang`), kỷ lục riêng trong bản lưu, dòng kỷ lục mới ở màn kết quả |
| `firebase/linhkhi.rules`, `firebase/firestore.rules.gop` | Luật Firestore của Linh Khí, và bản luật đầy đủ (luật Thần Thoại Việt + Linh Khí) để dán vào Firebase console |
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
python3 tests/may.py              # lưu mây, bảng vàng, góp ý với Firebase giả trong trang (không cần mạng)
python3 tests/ui_robust.py         # xoay màn hình, ẩn trang, khung hình chậm, bản lưu hỏng
python3 tests/ui_build.py          # đóng gói rồi chơi thử cả hai tệp trong dist/
python3 tests/smoke.py anh         # nạp game và đánh thử vài giây
python3 tests/campaign.py          # bot (hệ thống mới, ?cloud=0) chơi một lượt 15 ải, in từng lượt + bảng từng ải: cày, thua, cấp, Sức mạnh, máu còn, đòn trùm, linh khí/vàng, mốc Mầm/Thành hình/Thức tỉnh, mốc nâng bộ ([hoa|doc|bang] [khuyen|lieu])
python3 tests/cay.py               # cân bằng (đợt 5): luật Sức mạnh / 4 vũ khí / nâng bộ / gợi ý bảng thua; bot chơi từ đầu 12 lượt, bảng từng ải + mốc nâng cấp ("lieu": bot không nhìn lời khuyên; "--kd=4": đo lại Sức mạnh khuyên dùng từ bản lưu thật; "-v": in từng lượt)
python3 tests/cay.py 12 --node --ngay=8 --viec   # Bước 2: bot bấm Nhận hết Việc hôm nay / Sổ / Thành tựu mỗi lần về làng, in thu nhập mỗi ngày giả (so với --pre='G.SU_KIEN_BAT=false')
node tests/thuong_b2.test.js      # số thưởng ba hệ Bước 2 đã chỉnh (Phiên E) và cờ ?thuongb2=goc
node ../tools/can-bang/tinh.js     # mô hình số; mục 7: chiến dịch có / không ba hệ Bước 2 (--khong-buoc2: tắt ba hệ ở mọi bảng)
python3 tests/dps.py 60 8 quaimoi  # sát thương mỗi giây 4 vũ khí trên quái thật, Trắng và Thức tỉnh 3 hệ
python3 tests/cay_nang_cap_shots.py # chụp bảng thua có gợi ý nên cày gì, và cảnh bấm gợi ý mở đúng người làng, vào docs/cay-nang-cap/
python3 tests/mapgen.py            # bộ sinh bản đồ ải: 1000 hạt giống cho mỗi kiểu A, B, C
python3 tests/doors.py             # luật cửa, điều kiện mở cửa Trùm, bot đi hết ải ở cả ba kiểu
python3 tests/env_rooms.py         # vẽ thử mọi loại phòng ở ba vùng, cửa khóa và cửa mở
python3 tests/rules.py             # luật ba hệ, dấu ấn, trùm thích nghi
python3 tests/fuzz.py              # bấm loạn tìm lỗi sập
python3 tests/room_shots.py        # chụp ảnh phòng và bản đồ vào docs/phong-vuong/
python3 tests/moves.py             # lối đánh của bốn vũ khí và luật riêng của ba hệ
python3 tests/cung.py              # cung tự ngắm: mỗi kiểu bắn 40 phát vào quái ở tám hướng, gần và xa, đứng yên và đang chạy
python3 tests/cung_shots.py        # chụp ảnh cung tám hướng vào docs/sua-gop-y-1/ (cần thêm Pillow)
python3 tests/cong.py              # cổng dịch chuyển sau khi thắng: luật, và bấm thật trên điện thoại
python3 tests/cong_shots.py        # chụp ảnh cổng dịch chuyển vào docs/sua-gop-y-1/ (cần thêm Pillow)
python3 tests/dps.py 90 16 nho     # bảng tầm với, thời gian, sát thương mỗi đòn; đo sát thương mỗi giây của bốn vũ khí và ba hệ khi bot chơi ("trum": phòng trùm, "mot": một quái thay cho cụm, "khonghe": bỏ ba hệ, "trangphuc": mặc đủ bộ trang phục Vàng)
python3 tests/perf.py              # đo thời gian một khung hình trong cảnh đông quái và 16 món đồ rơi
python3 tests/chieu_shots.py       # chụp ảnh các lối đánh và hiệu ứng theo hệ vào docs/chieu-thuc/
python3 tests/ghep2.py             # đợt ghép 2: nút trong hai lề, bóng và chiều sâu, lối đánh trong phòng hẹp, bản đồ một màu, né tám hướng, vũ khí rơi, suối khóa, hoạt ảnh trùm
python3 tests/quai.py              # quái mới: mỗi cơ chế (bom, cảm tử, gai, giáp, bắn xa, lặn, tinh anh, kiểu xuất hiện), đòn tám hướng, trùm đủ ba pha và chết được
python3 tests/linhkhi.py           # hiệu ứng đạn (hình theo vùng, không đổi đường bay, cắm tường, nhiều đạn) và linh khí (vạch tăng đúng, hạt bay vào vạch, màn kết quả ghi đúng số)
python3 tests/dan_linhkhi_shots.py # chụp ảnh và GIF đạn, linh khí vào docs/dan-va-linh-khi/ (cần thêm Pillow)
python3 tests/bao_truoc.py          # vùng báo trước vẽ mịn: đủ mọi hình, không vẽ lên lớp điểm ảnh, nằm dưới em bé, hiện ra mượt, đếm ngược, chớp khi nổ, thời gian không đổi
python3 tests/bao_truoc_shots.py chup <thư mục game> <thư mục ra>   # chụp ảnh trước/sau vùng báo trước (rồi "ghep", "gif") vào docs/bao-truoc-muot/
python3 tests/quai_shots.py        # chụp ảnh và GIF quái mới trong game vào docs/quai-vao-game/ (cần thêm Pillow)
python3 tests/cay.py 6 khuyen --kd=4 --node   # 14/10: cùng bot cân bằng nhưng chạy luật game trong Node (tests/node_trang.js), KHÔNG cần trình duyệt; --vk=thuong|bua, --kho2 (độ khó 2), --ngay=K (ải ngày)
python3 tests/balance.py 4         # bot chơi 15 ải với bản lưu thật vừa đủ sức mạnh khuyên dùng (tests/cay_luu.json), mỗi ải 4 lần: tỉ lệ thắng, thời gian, máu mất (thêm "- 0,4,9 vukhi": chạy với từng loại vũ khí; thêm "- - trangphuc" hoặc "trangphuc:vang": mặc bộ trang phục của vùng; "codinh": bản lưu dựng tay)
python3 tests/do_roi.py            # đồ rơi (đủ loại có viền, bóng, cột sáng theo bậc, tên, hút về, tinh anh rơi trên sàn) và quái chi tiết (cỡ không đổi, đủ bộ phận mới, mọi cử động vẽ được)
python3 tests/chitiet_shots.py <thư mục ra> quai|do|gif 1   # chụp quái cỡ thật cạnh em bé, đồ rơi ba vùng, GIF trong game (cần thêm Pillow)
python3 tests/quai_truoc_sau.py <thư mục game cũ> <ảnh ra> caNoc,sua   # ảnh trước/sau từng con (cỡ thật và phóng 3 lần)
```

Mỗi bài in ra số mục đạt và các mục hỏng. `tests/bot.js` là bot chơi thử, chỉ dùng khi kiểm tra và không bao giờ nằm trong bản đóng gói.
