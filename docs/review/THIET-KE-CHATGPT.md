# LINH KHÍ — Bản thiết kế gameplay & mỹ thuật
**Phiên bản:** Đề xuất để Claude đối chiếu, cài đặt và đánh giá  
**Phạm vi:** Vũ khí · Thế giới · Tiến trình · Né chuẩn  
**Nguyên tắc:** Không sửa mã nguồn trong đợt này; giữ engine Canvas/JavaScript, cấu trúc save và logic nền đang có. Các con số dưới đây là mục tiêu thiết kế đề xuất, chưa phải giá trị đã triển khai hoặc đã cân bằng bằng bot.

## 0. Tóm tắt quyết định

1. Giữ bốn bản sắc vũ khí: **kiếm = chuỗi nhanh**, **cung = kiểm soát tầm xa**, **giáo = định vị/xuyên hàng**, **búa = chậm nhưng phá thế**. Không làm bốn vũ khí thành cùng một kiểu DPS.
2. Tạo phản hồi chiến đấu đọc được ở kích thước 480×270: một tín hiệu ngắn cho trúng thường, một tín hiệu nổi bật cho chí mạng, một nhịp kết liễu riêng; không che vùng báo trước của quái.
3. Biến vật thể môi trường thành lựa chọn rủi ro–phần thưởng có giới hạn mỗi phòng, không biến phòng thành chuỗi minigame bắt buộc.
4. Cây kỹ năng hiện tại chủ yếu cộng chỉ số. Đề xuất thay 4–6 nút bằng “nút đổi cách chơi”, giữ trần 5 điểm mỗi nhánh và chỉ số nền đủ nhẹ để không phá cân bằng cày.
5. Né chuẩn chỉ được kích hoạt bởi đòn tấn công có nguồn xác định: đòn cận chiến, đạn/vật bay hoặc vùng đòn có báo trước. **Vũng độc/lửa/băng tồn tại trên sàn không được tính**; va chạm với vũng cũng không được hồi mana.
6. Không đổi schema save cho bản đầu. Nếu cần lưu lựa chọn kỹ năng mới, dùng các node hiện có hoặc migration có mặc định; không tạo key bắt buộc mới trước khi xác nhận tương thích save cũ.

---

## 1. Vũ khí

### 1.1. Hiện trạng đọc từ mã nguồn

| Hạng mục | Giá trị/logic hiện tại trong bản ZIP |
|---|---|
| Kiếm (`data.js`) | Sát thương gốc 9; `cd` 0,36 s; tầm 32; sâu 17; đặc biệt **Trảm Nguyệt**. Chuỗi trong `moves.js`: 3 nhát, hệ số 1,00 / 1,05 / 1,80; thời lượng 0,30 / 0,30 / 0,46 s; nhát cuối đẩy lùi. Né xong đánh có **Nhát lướt** hệ số 1,4. |
| Cung | Sát thương gốc 11,4; `cd` dữ liệu 0,50 s, nhưng nhịp bắn đứng yên trong `moves.js` là 0,38 s và khi di chuyển 0,45 s. Giữ–thả để lấy đà, tên mạnh xuyên tối đa 2 mục tiêu ở mức đầy; đặc biệt **Mưa Tên**. |
| Giáo | Sát thương gốc 10,7; `cd` 0,44 s; tầm 56, sâu 12. Chuỗi 3 đòn đâm hệ số 1,1, sau đó quét vòng hệ số 1,85; giữ–thả **Xốc tới**. Đặc biệt **Phi Thương**: ném xuyên hàng, ghim/choáng mục tiêu cuối rồi bay về. |
| Búa | Sát thương gốc 21,3; `cd` 0,80 s; tầm 32, sâu 25; choáng cơ bản 0,4 s. Đòn thường **Nện** 0,80 s; giữ để lấy đà, đặc biệt **Địa Chấn** báo trước rồi tạo vệt nứt và hất tung/choáng. |
| Đặc điểm hệ | Lửa: cháy và nổ dây chuyền; Độc: tích tầng và lây khi quái chết; Băng: làm chậm/đóng băng và vỡ băng gây mảnh. Không nên gắn hiệu ứng hệ cố định vào vũ khí; hệ vẫn đến từ nhánh/tiến hóa vũ khí. |

**Các file liên quan:** `js/data.js` (sát thương gốc, nhịp nền, vùng, hệ); `js/moves.js` (chuỗi/giữ–thả/đặc biệt); `js/combat.js` (đánh trúng, sát thương, chí mạng, phản ứng khi hạ quái); `js/weapon_art.js` (hình vũ khí/tên); lớp vẽ hiệu ứng hiện có. Đây là mô tả từ mã nguồn, không phải kết quả đo cân bằng mới.

### 1.2. Vai trò, điểm mạnh/yếu và nhịp đòn đề xuất

| Vũ khí | Vai trò/nhịp | Điểm mạnh | Điểm yếu có chủ đích | Đòn đặc biệt và mục tiêu thiết kế |
|---|---|---|---|---|
| **Kiếm — Trảm nguyệt** | Chuỗi 3 nhịp ngắn; nhát 3 là kết thúc rõ ràng. Đánh rồi dịch chuyển, không đứng yên spam. | Dễ dùng, chuyển mục tiêu nhanh, có cửa sổ phản công sau né. | Tầm ngắn; dễ bị vây; nhát cuối có hồi phục đủ rõ để người chơi phải chọn thời điểm. | **Trảm Nguyệt** xuyên hàng theo hướng ngắm; dùng để mở đường hoặc kết liễu hàng quái, không nên trở thành nút gây DPS đơn mục tiêu cao nhất. |
| **Cung — Mưa tên** | Bắn nhanh khi bấm; giữ 0,45–0,65 s để có phát mạnh; khuyến khích vừa lùi vừa đổi góc. | An toàn, chọn mục tiêu/đón đầu, tốt khi giữ khoảng cách. | Sát thương đơn mục tiêu theo giây thấp hơn kiếm; yếu khi bị áp sát; phát mạnh có nhịp nạp và hồi. | **Mưa Tên** rải nhiều đợt vào vùng quái gần nhau; thể hiện vùng rơi rõ trước khi gây sát thương. Không để tự động dọn sạch toàn phòng. |
| **Giáo — Phi thương** | Đâm nhanh vừa phải, kết chuỗi bằng quét vòng; đòn giữ–thả là lao thẳng có cam kết hướng. | Tầm cận chiến dài, xuyên hàng, kiểm soát vị trí; phù hợp đánh mục tiêu đang bị khống chế. | Vùng đánh hẹp theo chiều sâu; quét chậm hơn kiếm; nếu lao sai hướng dễ đi vào nguy hiểm. | **Phi Thương** ném xuyên, ghim mục tiêu cuối rồi bay về. Khi giáo chưa về, cú đấm hiện tại nên là phương án khẩn cấp chứ không ngang sức vũ khí. |
| **Búa — Địa chấn** | Nện chậm; giữ để lấy đà; có tín hiệu rõ ở các mốc nạp. | Mỗi đòn nặng, choáng/đẩy lùi, tốt chống tinh anh và phá cụm áp sát. | Tốc độ thấp, dễ bị ngắt nhịp; phạm vi trước mặt hẹp hơn vẻ ngoài; phải đọc báo trước. | **Địa Chấn**: vòng chấn gần + vệt nứt có báo trước; thưởng khi căn đúng hướng và thời điểm, không gây sát thương xuyên tường. |

### 1.3. Con số mục tiêu đề xuất

Các con số dưới đây là **điểm xuất phát để Claude đối chiếu số đo hiện có**, không phải yêu cầu áp dụng máy móc. Ưu tiên đo DPS trên cùng một mục tiêu, DPS lên cụm 3 mục tiêu, thời gian hạ tinh anh, và lượng thời gian người chơi phải đứng yên.

| Thông số | Hiện tại | Đề xuất ban đầu | Lý do |
|---|---:|---:|---|
| Kiếm: sát thương gốc | 9 | **9,0 giữ nguyên** | Không tăng sức mạnh nền; giá trị kiếm nằm ở nhịp chuỗi và cửa sổ sau né. |
| Kiếm: nhịp chuỗi | 0,30 / 0,30 / 0,46 s | **giữ nguyên**, nhưng tăng phân biệt hình/âm ở nhát 3 | Tránh làm lại nhịp đã được cân bằng trước đó. |
| Kiếm: nhát lướt sau né | hệ số 1,4 | **1,4 giữ nguyên**; chỉ thêm dấu vệt và hit-stop ngắn | Không cộng dồn thêm sát thương với Né chuẩn. |
| Cung: sát thương gốc | 11,4 | **11,4 giữ nguyên** | Mã nguồn đã có ghi chú cân bằng cung an toàn nhất nhưng DPS thấp hơn. |
| Cung: bắn thường đứng yên/di chuyển | 0,38 / 0,45 s | **0,40 / 0,47 s** chỉ cân nhắc nếu số đo cho thấy cung vượt DPS mục tiêu | Không giảm tốc độ ngay nếu chưa đối chiếu số đo 5 phiên rà soát. |
| Cung: tên mạnh xuyên | tối đa 2 quái ở mức đầy | **giữ tối đa 2**; mục tiêu sau nhận 0,60 sát thương | Giữ vai trò xuyên hàng nhưng tránh dọn cụm dễ dàng. |
| Giáo: sát thương gốc | 10,7 | **10,7 giữ nguyên** | Đã được cân bằng so với kiếm/búa. |
| Giáo: chuỗi | 3 đâm 1,1; quét 1,85 | **giữ nguyên** | Tạo khác biệt bằng tầm 60–62 và quét vòng, không tăng số. |
| Giáo: choáng của Phi Thương | ghim 1,0 s; cắm 0,6 s | **ghim 0,8–0,9 s; cắm 0,55–0,60 s** nếu dữ liệu cho thấy khóa trùm quá lâu | Giảm khóa cứng trùm nhưng vẫn giữ khoảnh khắc ghim. |
| Búa: sát thương gốc | 21,3 | **21,3 giữ nguyên** | Mỗi đòn vốn đã mạnh nhất; tăng thêm dễ làm lệch cân bằng. |
| Búa: đòn thường | 0,80 s | **giữ 0,80 s**; báo trước 0,10–0,14 s cho đòn đặc biệt | Tăng độ đọc được, không cần tăng sát thương. |
| Búa: choáng thường | 0,40 s | **0,40 s giữ nguyên**; tinh anh/trùm chịu hệ số khống chế riêng | Tránh búa khóa mục tiêu lớn quá lâu. |
| Đặc biệt | Trảm Nguyệt 2,0×; Phi Thương 1,6×; Địa Chấn 2,1× + vòng 1,0× | **giữ hệ số hiện tại** ở lượt đầu | Chỉ chỉnh sau khi đối chiếu dữ liệu DPS và tỉ lệ thắng. |

**Quy tắc cân bằng đề xuất:** không chỉnh đồng thời sát thương gốc, thời lượng đòn và hồi chiêu của cùng một vũ khí. Mỗi lượt chỉ thay một nhóm tham số để dễ xác định nguyên nhân. Không tăng sát thương thưởng của Né chuẩn; nó là phần thưởng tài nguyên và phản hồi kỹ năng.

### 1.4. Phản hồi khi trúng, chí mạng và hạ quái

| Sự kiện | Hình/âm/nhịp đề xuất | Thời lượng/mức | Giới hạn để tránh rối |
|---|---|---|---|
| Trúng thường | Chớp sáng 1–2 pixel ở điểm va chạm, hạt theo màu vật liệu, âm thanh gọn; hit-stop nhẹ | 0,04–0,06 s; 2–4 hạt | Không rung camera với mọi cú đánh; không che thanh máu. |
| Trúng nặng/đòn kết chuỗi | Vệt chém dày hơn; mục tiêu giật lùi một nhịp; âm trầm hơn | 0,06–0,08 s; 4–6 hạt | Chỉ kiếm nhát 3, giáo quét, búa nện/đặc biệt mới dùng. |
| Chí mạng | Viền trắng-vàng trong một nhịp, chữ nhỏ “CHÍ MẠNG” hoặc biểu tượng đồng; âm cao hơn | 0,18–0,28 s; 6–8 hạt | Chữ không lặp nếu nhiều quái trúng cùng một đòn; ưu tiên hiện ở mục tiêu chính. |
| Hạ quái | Sprite nháy 1 lần, rơi mảnh/linh khí theo hệ, hiệu ứng tan theo vùng; âm xác nhận riêng | 0,20–0,35 s | Hiệu ứng rơi vật phẩm không giống hiệu ứng chí mạng; không làm chậm khung hình khi bầy lớn chết cùng lúc. |
| Hạ tinh anh | Tia sáng lớn hơn, rơi thưởng rõ, rung camera rất nhẹ | 0,12–0,18 s | Không che vùng nguy hiểm còn lại. |
| Né chuẩn | Vòng linh khí ngọc + âm “ting” và chữ ngắn | 0,22–0,32 s | Một lần mỗi lần lộn né; không kích hoạt từ sàn nguy hiểm. |

**Ngôn ngữ màu:** trúng thường = trắng ngà/màu hệ; chí mạng = vàng đồng; khống chế = xanh băng/lam; Né chuẩn = ngọc lục. Không dùng đỏ cho phần thưởng vì đỏ đã dành cho nguy hiểm/báo trước.

---

## 2. Thế giới: vật thể tương tác và bản sắc dân gian Việt

### 2.1. Nguyên tắc bố trí

- `js/room_art.js` hiện vẽ kiến trúc phòng, sàn, tường và lớp phủ trước cho ba vùng; ghi chú đầu file nói rõ nhân vật, quái và vật thể bấm được do `art.js`/`env_art.js` vẽ. Vì vậy, **nền tĩnh nên thêm họa tiết/đạo cụ không tương tác tại `room_art.js`; vật thể tương tác cần được tạo và xử lý ở hệ thống prop/logic hiện hữu**, không nhét logic vào bộ vẽ nền.
- Khung chơi là 480×270, phong cách pixel không làm mượt (`imageSmoothingEnabled = false`). Vật thể phải có silhouette dễ đọc, không lẫn với quái hoặc vùng báo trước.
- Mỗi phòng thường nên có tối đa **1 tương tác chính + 1 vật thể phụ nhỏ**; phần thưởng lớn không xuất hiện ở mọi phòng. Không đặt vật thể lên cửa, lối né hoặc vùng spawn.
- Vật thể phải có trạng thái `chưa dùng / đang kích hoạt / đã dùng` về mặt thiết kế. Nếu save không hỗ trợ trạng thái phòng, chỉ tồn tại trong phòng hiện tại; không thêm trạng thái vĩnh viễn trừ khi là mốc nhiệm vụ.

### 2.2. Danh sách vật thể tương tác

| Vật thể | Người chơi làm gì | Phần thưởng/tác dụng đề xuất | Rủi ro/giới hạn |
|---|---|---|---|
| **Bàn thờ đá / bệ thờ Thành hoàng** | Bấm tương tác, chọn một trong 2 lời khấn | Hồi 10% máu **hoặc** hồi 12 mana; một lựa chọn mỗi phòng | Không hồi cả hai; không dùng trong lúc quái còn sống. |
| **Trống đồng nứt** | Đánh/bấm để gõ một lần | Lộ vị trí đợt quái kế tiếp hoặc làm choáng nhẹ quái thường mới xuất hiện trong 1,0 s | Có thể gọi thêm một nhóm nhỏ; không làm choáng trùm. Dùng như lựa chọn rủi ro–phần thưởng. |
| **Cây đa / rễ linh** | Chạm vào dấu sáng dưới gốc | Chọn lấy 1 ít máu hoặc 1 ít vàng | Có thể bị “rễ quấn” làm chậm 0,6 s; chỉ kích hoạt một lần. |
| **Bụi tre / giàn dây leo** | Chém để mở lối hoặc thu thập | Mở lối tắt nhỏ, rơi Gỗ linh hoặc tạo vật cản tạm cho quái | Chỉ chặn quái thường trong thời gian ngắn; không chặn boss/đường cửa. |
| **Giếng cổ / chum nước** | Tương tác để uống một ngụm | Hồi 8% máu hoặc xóa 1 tầng hiệu ứng bất lợi | Dùng một lần; không xóa toàn bộ hiệu ứng trùm. |
| **Tổ ong vò vẽ** | Chọn phá hoặc né qua | Phá: rơi vàng/nguyên liệu nhỏ nhưng gọi bầy; né: không có thưởng | Báo trước rõ, tránh kích hoạt ngẫu nhiên khi va chạm. |
| **San hô phát sáng** | Thu thập mảnh hoặc chạm để kích hoạt | Vảy cá; hoặc tạo vùng sáng giúp nhìn đạn trong vài giây | Không gây sát thương; không nhầm với đạn băng. |
| **Vỏ ốc cổ** | Áp tai/nghe hoặc thổi | Báo hướng đợt quái; có cơ hội nhận mana | Tác dụng thông tin, không thêm chỉ số vĩnh viễn. |
| **Mỏm đá có khắc sóng nước** | Kích hoạt bằng đòn giáo hoặc tương tác | Mở đường phụ ngắn / lộ rương | Chỉ nên có ở một số phòng Hang biển; tránh puzzle bắt buộc. |
| **Rương gỗ sơn son** | Mở bằng tương tác; có thể dùng chìa/không chìa tùy thiết kế loot | Vàng, quặng hoặc nguyên liệu vùng | Rương thường cho thưởng nhỏ; rương lớn phải có tín hiệu hiếm và không sinh liên tục. |
| **Đèn lồng / giá nến** | Châm lại bằng đòn Lửa hoặc tương tác | Chiếu sáng khu vực, làm lộ dấu chân/đường bí mật | Không gây sát thương diện rộng; giữ đèn nền trang trí tách biệt với đèn tương tác. |
| **Bia đá chữ Hán-Nôm cách điệu** | Đọc một lần | Gợi ý khắc chế trùm, lore vùng hoặc mẹo chiến đấu | Không khóa tiến trình nếu bỏ qua; văn bản ngắn, dễ đọc trên mobile. |
| **Tượng hộ pháp / linh thú đá** | Dâng vật liệu vùng hoặc bỏ qua | Chọn buff cho phòng kế tiếp: +10% sát thương **hoặc** giảm 10% sát thương nhận vào | Chỉ tồn tại một phòng; không cộng dồn với chính nó. |
| **Cổng gỗ / cửa vòm** | Chọn nhánh đi tiếp | Giữ hệ cửa lựa chọn hiện tại: đánh, thương nhân, thử thách, nguyền rủa | Không đổi hệ điều hướng đang dùng; chỉ nâng nhận diện mỹ thuật. |

### 2.3. Bản sắc từng vùng

#### Rừng già — linh mộc, Sơn Tinh–Thủy Tinh và tín ngưỡng cây thiêng
**Bảng màu:** xanh lá sâu, rêu, nâu gỗ, điểm vàng nhạt; hiệu ứng Độc hiện dùng xanh lục nên nền phải tối và trầm để không lẫn vũng độc.

- **Đạo cụ tĩnh ở `room_art.js`:** thân cây hóa thạch, rễ nổi thành bậc, dây leo, lá cọ, cụm nấm nhỏ, đá phủ rêu, mô-típ mặt trời/trống đồng được khắc trên đá chứ không rải dày trên mọi tường.
- **Tương tác chính:** cây đa/rễ linh (đổi máu lấy vàng hoặc ngược lại); trống đồng nứt (gọi quái để đổi lấy thưởng); bụi tre (mở lối hoặc tạo chướng ngại ngắn).
- **Tương tác phụ:** nấm phát sáng (nhặt mana nhỏ hoặc chịu độc nhẹ); bia đá kể tích Sơn Tinh–Thủy Tinh, nhấn vào rừng thiêng và lời thề bảo vệ nguồn nước.
- **Chi tiết dân gian:** họa tiết chim Lạc, mặt trời đồng tâm, dây thừng/đan tre, hoa văn răng cưa và hình người cách điệu. Tránh sao chép nguyên xi vật thờ có thật theo kiểu trang trí tùy tiện; dùng ngôn ngữ hình khối lấy cảm hứng, không tuyên bố là phục dựng khảo cổ.
- **Đồ rơi/đầu mối:** Gỗ linh; Nấm Chúa là mini-boss; Mộc Tinh là boss vùng. Vật thể nên giúp người chơi hiểu hệ Độc: lây lan và kiểm soát khu vực.

#### Hang biển — thủy cung, truyền thuyết cá hóa rồng và văn hóa ngư dân
**Bảng màu:** lam đậm, xanh nước, đá ướt, ánh ngọc trai; hiệu ứng Băng phải sáng hơn nền.

- **Đạo cụ tĩnh ở `room_art.js`:** vân nước phản chiếu, thạch nhũ, mạch khoáng lam, vỏ ốc, xương cá lớn, dây neo và cọc gỗ mục; tránh phủ quá nhiều đường sóng gây rối vùng đạn.
- **Tương tác chính:** vỏ ốc cổ (nghe dự báo đợt quái/nhận mana); san hô phát sáng (thu Vảy cá hoặc kích hoạt đèn); mỏm đá khắc sóng (mở lối phụ).
- **Tương tác phụ:** chum nước/giếng ngầm (hồi nhẹ hoặc xóa một tầng bất lợi); rương ngư dân mắc lưới (thưởng nhỏ, có thể gọi cua).
- **Chi tiết dân gian:** cá chép hóa rồng, sóng nước, mắt thuyền, nút dây, đèn bão; hình rồng nên dùng nét Việt thanh mảnh, không chuyển toàn vùng thành long cung Trung Hoa. Có thể dùng mặt trống đồng như cổ vật bị nước bào mòn.
- **Đồ rơi/đầu mối:** Vảy cá; Cua Đá là mini-boss; Ngư Tinh là boss vùng. Vật thể nên làm rõ hệ Băng: làm chậm, giữ chân và vỡ băng.

#### Lâu đài cổ — thành lũy, đền đài và hồ ly linh hỏa
**Bảng màu:** gạch đỏ nâu, son, vàng đồng, than đen; hiệu ứng Lửa cần sáng vàng/cam và có viền tối.

- **Đạo cụ tĩnh ở `room_art.js`:** gạch vỡ, cột gỗ sơn son, chân tảng đá, cửa vòm, mái ngói cách điệu, đèn lồng, phù điêu chim Lạc; có thể thêm mô-típ rồng thời Lý/Trần dạng đường nét ngắn.
- **Tương tác chính:** đèn lồng (thắp sáng để lộ rương/dấu chân); tượng hộ pháp (đổi vật liệu lấy buff một phòng); rương sơn son (vàng/quặng hoặc vật liệu vùng).
- **Tương tác phụ:** bia đá Hán-Nôm cách điệu (gợi ý khắc chế Hồ Tinh); trống đồng nhỏ làm vật kích hoạt thử thách; giá nến có thể được châm bằng đòn Lửa.
- **Chi tiết dân gian:** linh vật canh cửa, hoa văn mây lửa, gạch hoa chanh, đầu đao mái, dây tua và đèn lồng; tránh nhồi quá nhiều vàng đỏ khiến sprite nhân vật mất tương phản.
- **Đồ rơi/đầu mối:** Đá lửa; Hổ Lửa là mini-boss; Hồ Tinh là boss vùng. Vật thể nên giúp người chơi học hệ Lửa: lan cháy/nổ dây chuyền, đồng thời tạo khoảng trống để né.

### 2.4. Ghi chú tích hợp cho `room_art.js`

1. Chỉ thêm **họa tiết tĩnh** (phù điêu, vết khắc, nền nước, rêu, gạch vỡ) vào pipeline vẽ nền/phủ hiện tại. Không đặt xử lý tương tác, phần thưởng hoặc va chạm trong `room_art.js`.
2. Vật thể bấm được nên đi qua hệ thống prop đang có (`art.js`/`env_art.js` và logic tạo vật thể), tái sử dụng quy tắc gần-vật-thể/đã-dùng của dự án nếu có. Bản hiện tại đã có prop như cửa, nấm, tinh thể, bẫy và các đạo cụ nền; ưu tiên mở rộng mô hình hiện có hơn là tạo hệ tương tác thứ hai.
3. Tách vật thể gameplay khỏi đạo cụ trang trí bằng silhouette và ánh sáng: vật thể tương tác có viền sáng/nhịp thở chậm, đạo cụ trang trí không nhấp nháy.
4. Tránh sinh ngẫu nhiên ở khu vực cửa, vùng xuất hiện của người chơi/quái và các điểm có nhiều FX. Nếu có vật cản, giới hạn thời gian tồn tại và không sửa đường đi của boss.
5. Mỗi vùng cần 2–3 motif chủ đạo lặp có chủ ý; không dùng mọi họa tiết ở mọi phòng. Phòng trùm giảm đạo cụ tương tác để người chơi đọc đòn dễ hơn.

---

## 3. Tiến trình: cây kỹ năng và nâng cấp

### 3.1. Hiện trạng

`data.js` có 3 nhánh, mỗi nhánh 5 node:
- **Công:** +8% sát thương; giảm 5 mana cho đặc biệt; +15% sát thương lên quái đang có hiệu ứng; +8% sát thương; 10% chí mạng gây gấp đôi.
- **Thủ:** +10% máu; né hồi nhanh hơn 25%; hồi 8% máu khi qua phòng; giảm 30% thời gian hiệu ứng bất lợi; giảm 10% sát thương nhận vào.
- **Hệ:** +20 mana tối đa; mỗi đòn trúng hồi 1 mana; Nổ khói/Sốc nhiệt mạnh hơn 30%; đòn đầu sau khi đổi vũ khí chắc chắn gây hiệu ứng; hiệu ứng kéo dài 25%.

Nhìn chung cây hiện tại dễ hiểu nhưng nhiều node chỉ tăng số. Đề xuất giữ ba nhánh và năm điểm/node mỗi nhánh, đổi **4 node chỉ số/ node ít tương tác** thành lựa chọn có hành vi mới. Không mở nhánh thứ tư trong đợt đầu để tránh tăng độ phức tạp UI/save.

### 3.2. Node đổi cách chơi đề xuất

| Nhánh / vị trí | Hiện tại | Đề xuất thay thế | Cách chơi thay đổi | Cân bằng ban đầu |
|---|---|---|---|---|
| Công 2 | Đặc biệt tốn ít hơn 5 mana | **Dư chấn:** đánh trúng bằng đòn kết chuỗi hoàn lại 3 mana, tối đa 1 lần mỗi 2,5 s | Khuyến khích hoàn tất chuỗi, thay vì spam đòn đầu hoặc chỉ chờ đặc biệt | Không cộng mana theo từng mục tiêu; hồi tối đa 3 mana/lần kích hoạt. |
| Công 4 | +8% sát thương | **Khai huyệt:** đòn nặng (kiếm nhát 3, giáo quét, búa nện đủ lực, cung nạp đầy) đánh vào mục tiêu đang báo trước/đang hồi chiêu gây thêm 12% sát thương | Khuyến khích canh nhịp và dùng đúng loại đòn, thay vì tăng DPS mọi lúc | Chỉ áp dụng một lần mỗi đòn trên mỗi mục tiêu; không cộng dồn với chí mạng thành nhân số quá lớn. |
| Thủ 2 | Né hồi nhanh hơn 25% | **Lướt bóng:** né chuẩn kéo dài cửa sổ phản đòn của đòn kế tiếp thêm 0,25 s; đòn đó giảm 20% sát thương nhận vào nếu đánh hụt | Biến né thành quyết định tấn công/phòng thủ, không chỉ giảm cooldown | Không tăng khoảng bất tử; không cho miễn nhiễm mới. |
| Thủ 3 | Hồi 8% máu qua phòng | **Tĩnh tức:** sau 3 s không nhận sát thương, hồi 1,5% máu tối đa mỗi 2 s, tối đa 6% máu mỗi phòng | Khuyến khích rút khỏi giao tranh, tái định vị và dùng không gian | Không kích hoạt trong phòng an toàn hoặc sau khi đã thắng; có giới hạn theo phòng. |
| Hệ 2 | Mỗi đòn trúng hồi thêm 1 mana | **Dẫn khí:** đánh trúng mục tiêu đang dính hiệu ứng hệ có 20% cơ hội tạo 1 hạt linh khí (nhặt hồi 3 mana); tối đa 3 hạt/phòng | Khuyến khích phối hợp vũ khí và hiệu ứng hệ, thêm mục tiêu di chuyển/nhặt | Giới hạn 3 hạt/phòng, không tạo hạt trên mỗi hit của Mưa Tên. |
| Hệ 4 | Đòn đầu sau đổi vũ khí chắc chắn gây hiệu ứng | **Đổi thế:** đổi vũ khí làm đòn kế tiếp trong 2 s có thêm 15% tầm/độ rộng vùng đánh, nhưng không tăng sát thương | Khuyến khích luân phiên hai vũ khí và chọn vị trí | Mỗi lần đổi vũ khí chỉ kích hoạt một lần; không kéo dài bằng đổi qua lại liên tục. |

**Giữ lại:** Công 1 (+8% sát thương) và Công 5 (10% chí mạng ×2) để người thích build đơn giản vẫn có đường mạnh; Thủ 1 (+10% máu), Thủ 4 (giảm 30% thời gian hiệu ứng), Thủ 5 (giảm 10% sát thương); Hệ 1 (+20 mana), Hệ 3 (Nổ khói/Sốc nhiệt +30%), Hệ 5 (hiệu ứng +25%). Nếu số đo cho thấy node đề xuất quá mạnh, ưu tiên giảm tần suất/giới hạn kích hoạt thay vì bỏ ý tưởng.

### 3.3. Nâng cấp vũ khí nên mở lựa chọn, không chỉ cộng số

- **Mài:** tiếp tục là tăng sức mạnh tuyến tính, dễ hiểu; không gắn thêm hiệu ứng ngẫu nhiên vào mỗi cấp mài.
- **Nâng bậc Lam/Tím/Vàng:** giữ tiến trình và chi phí hiện tại; bổ sung một mốc “lối đánh” lựa chọn khi vũ khí đạt bậc phù hợp, ví dụ:
  - Kiếm: **Liên trảm** (nhát 3 rộng hơn, hồi lâu hơn) hoặc **Du ảnh** (nhát lướt xa hơn, sát thương thấp hơn).
  - Cung: **Xuyên tâm** (ít mục tiêu hơn, sát thương mục tiêu đầu cao hơn) hoặc **Tán tiễn** (mũi tên nạp đầy tách thành 3 mảnh yếu).
  - Giáo: **Ghim mạch** (ghim lâu hơn lên quái thường, giảm sát thương lần về) hoặc **Hồi phong** (lần bay về nhanh hơn, không ghim).
  - Búa: **Phá giáp** (đòn nạp đầy giảm giáp tạm thời) hoặc **Chấn địa** (vùng rộng hơn nhưng sát thương thấp hơn).
- Chỉ chọn **một biến thể cho mỗi vũ khí**, không cộng dồn hai biến thể. Lựa chọn nên đổi hành vi/đường đòn, không chỉ +5% sát thương.
- Không áp dụng biến thể vũ khí cho vũ khí đang nằm trong kho nếu UI chưa thể hiện rõ; người chơi phải nhìn được thay đổi trước khi xác nhận.
- Không tạo chỉ số ẩn làm sai sức mạnh khuyến nghị (`G.STAGE_REC`). Nếu biến thể thay đổi DPS đáng kể, cần đưa vào hàm tính sức mạnh hoặc đánh dấu chưa tính để không gây hiểu nhầm.

### 3.4. Tiến trình theo vùng

- **Rừng già:** mở lựa chọn thiên về lây hiệu ứng, bẫy địa hình và hồi tài nguyên nhỏ; phần thưởng là Gỗ linh.
- **Hang biển:** mở lựa chọn thiên về xuyên hàng, làm chậm/đóng băng, quản lý khoảng cách; phần thưởng là Vảy cá.
- **Lâu đài cổ:** mở lựa chọn thiên về phá giáp, cháy dây chuyền, phản đòn theo nhịp; phần thưởng là Đá lửa.
- Không khóa build bắt buộc theo vùng. Mỗi lựa chọn phải có ít nhất một phương án đối trọng để người chơi không dùng đúng một hệ/vũ khí suốt game.

### 3.5. Nguyên tắc tương thích save

- Ưu tiên tái sử dụng ba nhánh và các vị trí node hiện có để save cũ đọc được.
- Nếu phải lưu lựa chọn biến thể, cần có giá trị mặc định khi đọc save cũ và xử lý khi dữ liệu thiếu/sai; không coi field mới là bắt buộc.
- Không reset kỹ năng người chơi đã học. Nếu một node đổi ý nghĩa, hiển thị thông báo ngắn về thay đổi; cân nhắc hoàn điểm miễn phí một lần nếu ảnh hưởng đáng kể.
- UI phải mô tả hiệu ứng thực tế và giới hạn kích hoạt; tránh chữ “luôn luôn” khi có cooldown/giới hạn phòng.

---

## 4. Né chuẩn

### 4.1. Quy tắc kích hoạt

**Giữ phần thưởng hiện tại: hồi tối đa 5 mana một lần cho mỗi lần né thành công**, cùng hiệu ứng vòng linh khí/âm thanh xác nhận. Thay đổi cần thiết là phân loại nguồn gây sát thương trước khi gọi phần thưởng.

| Nguồn va chạm | Có tính Né chuẩn? | Lý do |
|---|---|---|
| Đòn cận chiến của quái có pha ra đòn/động tác rõ | **Có** | Người chơi né đúng nhịp một đòn có chủ đích. |
| Đạn/vật bay có nguồn đạn riêng | **Có** | Quỹ đạo và thời điểm va chạm có thể đọc được. |
| Đòn vùng có báo trước rõ (vòng/vệt đỏ rồi mới nổ) | **Có** | Là đòn tấn công có cửa sổ né xác định, không phải địa hình tồn tại sẵn. |
| Vệt nứt Địa Chấn sau khi đã có báo trước | **Có**, nếu né trong pha sát thương | Cùng quy tắc với đòn vùng có báo trước. |
| Vũng độc/lửa/băng nằm trên sàn, kể cả vũng do hiệu ứng hệ tạo ra | **Không** | Vũng là vùng nguy hiểm duy trì, không phải một đòn có thời điểm ra đòn duy nhất. |
| Chạm thân quái khi quái chỉ đang di chuyển, không có đòn đánh | **Không** | Tránh thưởng cho việc lướt xuyên va chạm thụ động. |
| Tự gây sát thương, vật thể môi trường không phải đòn đánh, sát thương theo thời gian | **Không** | Không được tạo mana từ sát thương môi trường/DoT. |
| Phòng an toàn, sau khi đã thắng, nhân vật đã chết | **Không** | Giữ điều kiện hiện có, không phát thưởng sau giao tranh. |

### 4.2. Điều kiện và con số

- Cửa sổ né: giữ theo `G.DODGE` và `P.dodgeT` hiện có; **không tăng thời gian bất tử** chỉ để dễ kích hoạt.
- Phần thưởng: **+5 mana**, không vượt `maxmana`, tối đa một lần trong mỗi lần lộn né.
- Một đòn đa hit/mưa đạn cùng khung hình chỉ thưởng một lần cho một lần né.
- Nếu người chơi đang ở trong vũng sàn và đồng thời né được một viên đạn, chỉ đạn được xét. Vũng không được tính là nguồn kích hoạt.
- Vùng có báo trước phải có `attack/source` rõ ràng về mặt thiết kế; không suy ra từ việc nhân vật đơn thuần đang ở trong vùng sát thương.
- Không cộng sát thương cho đòn phản công trong bản đầu. Né chuẩn hiện là phần thưởng mana + phản hồi thị giác; phản công tự động sẽ làm khó cân bằng và chồng lên Nhát lướt của kiếm.

### 4.3. Phản hồi hiển thị

- Vòng ngọc lục 2–3 lớp pixel, một tia vàng đồng nhỏ, chữ **“NÉ CHUẨN!”** trong 0,22–0,32 s.
- Nếu mana đã đầy, vẫn hiển thị né chuẩn nhưng không tạo hiệu ứng “+5 mana” giả; có thể dùng nhãn phụ “ĐÃ NÉ” hoặc bỏ số mana.
- Không rung camera mạnh; không dùng hiệu ứng đỏ; không che báo trước của đòn kế tiếp.
- Chỉ phát âm xác nhận một lần mỗi lần né, không lặp theo số hit bị tránh.

---

## 5. Trình tự triển khai khuyến nghị cho Claude

1. **Đối chiếu số đo 5 phiên rà soát** trước khi thay DPS/nhịp. Giữ nguyên sát thương nền ở lượt đầu; triển khai trước hiệu ứng trúng/chí mạng/hạ quái và phân loại nguồn Né chuẩn.
2. **Làm `room_art.js` trước ở phần tĩnh**: thêm motif theo vùng, giữ độ tương phản và vùng trống chiến đấu. Không đưa logic tương tác vào file này.
3. **Thêm một vật thể tương tác mẫu cho mỗi vùng** bằng hệ prop/interaction hiện có, không triển khai cả danh sách cùng lúc. Đánh giá rõ ràng, phần thưởng, tần suất và khả năng né.
4. **Cây kỹ năng:** thay tối đa 2 node trong lượt đầu, ưu tiên node có giới hạn kích hoạt rõ; giữ save cũ đọc được và UI mô tả đúng hành vi.
5. **Vũ khí:** giữ các hệ số hiện tại trước; dùng phản hồi hình/âm và phân biệt nhịp để tạo cảm giác riêng. Chỉ đổi số khi kết quả bot/chỉ số DPS chỉ ra lệch.
6. **Không làm trong đợt đầu:** đổi engine, thay toàn bộ sprite, thêm nhánh kỹ năng mới, thêm hệ save mới bắt buộc, biến mọi vật thể thành tương tác, hoặc cho Né chuẩn kích hoạt từ vũng sàn.

## 6. Tiêu chí chấp nhận thiết kế

- Người chơi có thể nhận ra vai trò từng vũ khí trong vài đòn đầu mà không cần đọc hướng dẫn dài.
- Chí mạng và hạ quái phân biệt được với trúng thường nhưng không làm mất khả năng đọc đòn địch.
- Mỗi vùng có ít nhất 2 motif Việt Nam nhất quán và 1–2 tương tác mang dấu ấn vùng; không cần tương tác để hoàn thành phòng.
- Có ít nhất 4 node kỹ năng làm thay đổi quyết định/nhịp chơi, không chỉ tăng chỉ số.
- Né chuẩn không thể farm bằng vũng sàn, DoT hoặc chạm thân quái; vẫn thưởng khi né đòn có báo trước/đạn/cận chiến.
- Mã nguồn giữ Canvas/JavaScript, dữ liệu save cũ có mặc định tương thích và `room_art.js` chỉ phụ trách vẽ nền/lớp phủ.

**Trạng thái tài liệu:** Đề xuất thiết kế dựa trên việc đọc các tệp `js/data.js`, `js/moves.js`, `js/combat.js`, `js/upgrade.js`, `js/room_art.js` và `js/env_art.js` trong ZIP người dùng cung cấp. Không có mã nguồn nào được sửa trong đợt tạo tài liệu này. Con số đề xuất cần được đối chiếu với kết quả rà soát/bot trước khi triển khai.
