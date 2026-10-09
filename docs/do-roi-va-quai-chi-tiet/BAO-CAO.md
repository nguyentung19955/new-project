# Báo cáo: đồ rơi dễ nhìn và quái chi tiết hơn

Nhánh: `claude/do-roi-va-quai-chi-tiet`. Làm theo hai góp ý của chủ dự án sau khi chơi thử:
(A) "Đồ rơi trên bản đồ hơi khó nhìn, hình dạng ấy"; (B) "Quái cũng cần chi tiết hơn chút, một vài con chi tiết chung quá".

Tóm tắt: đồ rơi giờ to hơn, có viền tối và bóng, mỗi loại một hình riêng, đồ có bậc có cột sáng màu bậc. Mười ba con quái trông chung chung nhất được thêm chi tiết nhận diện và bộ phận cử động riêng. Luật chơi, cân bằng, dữ liệu lưu, cỡ va chạm của quái đều giữ nguyên.

## Ảnh nên xem

| Tệp | Nội dung |
| --- | --- |
| `do-roi-truoc-sau.png` | Đồ rơi đủ loại trên sàn ba vùng (đất rừng, sàn đá biển, gạch lâu đài): trước và sau, cỡ thật như trên điện thoại và phóng to |
| `quai-truoc-sau.png` | 13 con đã sửa, mỗi con một hàng: trái là bản cũ, phải là bản mới; mỗi bên một hình phóng 3 lần và 5 khung cỡ thật (thở, thở, báo đòn, ra đòn, trúng đòn) |
| `quai-trong-phong.png` | Cả 36 con ở cỡ thật trong phòng, cạnh em bé, ba vùng: trước và sau |
| `trong-game.gif` | Một đoạn đánh nhau ở Hang biển với bốn con đã sửa (Cá Nóc, Sứa Bom, Cá Chuồn, Nhím Biển); tinh anh gục rơi vũ khí xuống sàn, lại gần thì đồ bay về |

## A. Đồ rơi

Trước đây đồ rơi chỉ là một ô vuông nhỏ mờ có hình bé xíu bên trong, khó tách khỏi nền, nhất là trên sàn đá biển.

Giờ thì:

- **Hình theo loại**, to hơn (khoảng 18 điểm ảnh thay vì 11 đến 13):
  - vũ khí: hình thu nhỏ của chính vũ khí sống đó (đúng dòng, nhánh, bậc), nằm nghiêng;
  - trang phục: hình món đồ;
  - vàng: một đống năm đồng xu có lỗ vuông như tiền đồng;
  - quặng, đá tôi, nguyên liệu ba vùng, mảnh trùm, kinh nghiệm: đúng biểu tượng ở dải tài nguyên trên cùng, phóng gấp đôi; mảnh trùm có vệt sáng và màu của trùm vùng đó;
  - bình máu: đã có hình (bình đỏ nút gỗ) để dùng khi sau này có đồ rơi là bình máu; hiện game chưa rơi bình máu.
- **Tách khỏi mọi nền**: viền tối 1 điểm ảnh quanh hình, bóng dưới chân (nhỏ lại khi đồ nảy cao), ánh nhẹ dưới chân.
- **Theo bậc**: đồ Thường chỉ ánh trắng nhẹ. Đồ Lam, Tím, Vàng có cột sáng mảnh màu bậc bốc lên (bậc càng cao cột càng cao), có hạt sáng bay trong cột. Đồ Vàng thêm sáu tia sáng xoay quanh và lấp lánh dày hơn. Mảnh trùm cũng có cột sáng màu trùm.
- **Chuyển động**: đồ nảy ra theo đường vòng từ chỗ quái gục, nảy nhẹ thêm một lần, rồi nhấp nhô tại chỗ.
- **Lại gần**: hiện tên ngắn (tối đa 18 chữ) màu theo bậc, chỉ hai món gần nhất để chữ không chồng lên nhau; có vùng báo trước ở gần thì tạm không hiện tên.
- **Tự hút về**: vũ khí và trang phục bay về khi em bé ở rất gần (khoảng 24 điểm ảnh); vàng, quặng, đá tôi, nguyên liệu, mảnh trùm, kinh nghiệm bay về từ xa hơn (khoảng 44 điểm ảnh). Trang phục có "Tầm nhặt đồ" vẫn cộng thêm vào hai khoảng này như cũ.
- **Không che**: đồ rơi giờ vẽ ở lớp sàn, trước quái, em bé và trước khi chụp nền cho vùng báo trước, nên quái và vùng đỏ luôn nằm trên đồ rơi.
- **Đồ rơi mới trên sàn**: trước đây chỉ phòng trùm (sau khi thắng) có đồ nằm trên sàn. Giờ tinh anh rơi vũ khí và quái rơi trang phục cũng thả món đó xuống sàn chỗ chúng gục (dòng báo trên màn hình vẫn như cũ). Thưởng vẫn được cộng ngay lúc rơi như trước, đồ trên sàn chỉ để thấy và nhặt; không nhặt cũng không mất gì. Chỗ đồ văng ra dùng số ngẫu nhiên riêng, không đụng tới số ngẫu nhiên của luật chơi, nên tỉ lệ rơi và các ván bot chơi không đổi.

Tệp: `game/js/do_roi.js` (mới); sửa nhỏ ở `portal.js` (gọi hình mới), `combat.js` (vẽ ở lớp sàn, tên khi lại gần), `stage.js` (hút về luôn chạy, tinh anh và quái thả đồ xuống sàn).

## B. Quái chi tiết hơn

Chọn 13 con trông "chung chung" nhất ở cỡ thật (ít mảng màu, giống khối tròn, hoặc trước chỉ nhún cả thân). Mỗi con thêm chi tiết nhận diện trên hình và tách thêm bộ phận cử động riêng. Hình dáng, màu chủ đạo và khung hình (dùng để tính cỡ va chạm) giữ nguyên; bài kiểm tra so cỡ khung cả 36 con với bản cũ.

| Con | Chi tiết thêm | Bộ phận cử động mới |
| --- | --- | --- |
| Cá Nóc | Đốm báo sẫm trên lưng, ánh mắt trắng, con ngươi đỏ, vằn bụng, nanh dưới | Vây ngực vỗ, đuôi quẫy, gai lưng và gai bụng dựng lên khi báo đòn, xẹp khi trúng đòn |
| Sứa Bom | Gân sẫm trên chuông, vân vành chuông, đốm phát quang, nanh, dấu nguy trên bom | Hai chùm xúc tu lượn lệch nhịp, quả bom đung đưa, ngòi bom cháy lách tách (tia lửa động) |
| Cá Chuồn | Ánh mắt, đường sáng dọc thân, vảy lưng, gân cánh | Cánh vây vỗ (gập ra sau khi lao), đuôi quẫy, vây bụng lay |
| Nhím Biển | Ánh mắt, nanh, đốm phát quang, rãnh vỏ, đầu gai đỏ có độc | Ba chùm gai (trên, trái, phải) xù ra riêng khi thở, báo đòn, bắn |
| Bầy Cá Con | Mỗi con một vằn sẫm ngang thân, ánh mắt trắng | (đã có thân và đuôi riêng từ trước) |
| Bầy Ong Vò Vẽ | Gân cánh, kim chích sáng | (đã có thân và cánh riêng) |
| Chồn Bóng | Vằn sáng dọc sống lưng, mắt rực có lõi trắng, vằn đuôi | Khói bóng tím bay từ chóp đuôi |
| Nấm Phồng | Ánh mắt, nanh, phiến dưới mũ, giọt độc rỉ dưới vành mũ | Hai chùm rễ chân bước riêng, bào tử bốc lên từ mũ |
| Nhím Gai Độc | Chóp gai nhỏ giọt độc xanh, mắt có ánh và tròng đỏ, mũi hồng, vằn lông | Cả chùm gai phập phồng, hai chân bước |
| Bầy Dơi Than | Gân màng cánh, ánh mắt | (đã có thân và cánh riêng) |
| Hũ Lửa Sống | **Lá bùa vàng chữ đỏ dán trán** (bùa trấn yểm theo truyện dân gian), vết nứt rực lửa, ánh mắt | Hai quai vẫy như tay, hai chân bước, tàn lửa bay lên |
| Đèn Lồng Ma | Nan tre trên thân đèn, viền vàng đáy đèn, ánh mắt | Quai treo đung đưa, lửa trong đèn chập chờn |
| Nhím Than Hồng | Vết nứt than đỏ rực trên lưng, mắt có lõi sáng, nanh | Ba chùm gai và hai chân cử động riêng, tàn than bay |

- Mọi cử động (xuất hiện, thở, đi, báo đòn, ra đòn, trúng đòn, chết, chiêu riêng) vẫn chạy: cử động mới đều chạy cử động cũ trước rồi mới thêm phần của bộ phận. Lúc phồng (Nấm Phồng, Hũ Lửa) và lúc xù gai (hai con nhím) vẫn dùng hình phồng, hình xù như cũ.
- Đã rà nhanh 23 con còn lại ở cỡ thật trong phòng: Cua Lính, Ốc, Hải Quỳ, Heo Rừng, Bọ Hung, Hoa Phun Bào Tử, Sóc, Lính Ma, Tượng Đá, Mèo Đen, Tiểu Yêu, các tinh anh và trùm đã đủ mảng màu, phụ kiện và bộ phận cử động, nên chưa sửa.

Tệp: phần chi tiết nằm ở `docs/phac-thao/quai-hoat-hinh/nguon/chitiet.js`, ghép vào `game/js/monster_art.js` bằng `nguon/ghep_chitiet.py` (các tệp nguồn bản chốt cũ không còn trên nhánh này nên không chạy lại được `ghep.py` đầy đủ; `ghep.py` đã được thêm `chitiet.js` vào danh sách cho lần ghép sau).

## Kiểm tra

- Bài mới `tests/do_roi.py`: 45/45 mục đạt. Quái: 36 con không lỗi, cỡ khung cả 36 con đúng như bản đã duyệt, 13 con có đủ bộ phận mới, vẽ thử hơn 2600 khung cử động của 30 con thường, tinh anh, trùm nhỏ không lỗi. Đồ rơi: 16 loại đều có viền tối và bóng, vũ khí Thường không có cột sáng còn Lam, Tím, Vàng có, vàng hút về từ xa còn vũ khí chỉ khi rất gần, lại gần hiện tên, tinh anh rơi vũ khí xuống sàn, thả đồ không dùng thêm số ngẫu nhiên của luật chơi.
- Chạy lại toàn bộ `game/tests/` (cả bài tám hướng mới gộp vào): mọi bài đạt, kể cả `quai.py` 105/105, `trang_phuc.py`, `cong.py`, `bao_truoc.py`, `ui_input.py all` trên bốn cỡ màn hình, `ui_robust.py`, `ui_build.py`, `campaign.py` (không thua ải nào), `balance.py` (thắng 43/45).
- `tests/perf.py` nay đo thêm 16 món đồ rơi trên sàn cùng 14 quái: trung bình 2,7 ms một khung (một khung được phép khoảng 16,7 ms). So với bản cũ có cùng 16 món đồ rơi: bằng khoảng 106%, chậm nhất 115%, vẫn rất mượt.
- `python3 game/build.py` ra hai tệp trong `dist/`, mở cả hai không có lỗi console, đủ 36 quái và đồ rơi mới.
- Đã tự xem bằng mắt ảnh trước/sau, ảnh trong phòng ba vùng và GIF.
- Ghi chú: đã chờ 75 phút nhưng phiên "cân bằng phải cày" chưa gộp vào `khoi-tao-du-an`, nên nhánh này làm từ `khoi-tao-du-an` lúc đó (đã có đạn và linh khí, tám hướng). Phần của nhánh này không đụng tới số liệu cân bằng.

## Điểm còn yếu

- Ở cỡ thật trên điện thoại, nhiều chi tiết mới chỉ 1 đến 2 điểm ảnh nên khác biệt khi đứng yên không lớn; thấy rõ nhất là cử động riêng (vây, gai, xúc tu, chân), tàn lửa, bào tử, và lá bùa trên Hũ Lửa. Muốn quái khác hẳn thì phải vẽ lại hình gốc to hơn, việc này đụng tới cỡ va chạm đã duyệt nên chưa làm.
- Khi xoay mạnh, vài bộ phận mới (cánh Cá Chuồn, đuôi Cá Nóc) bị cắt bớt vài điểm ảnh ở mép khung hình của máy hoạt hình.
- Đồ rơi trên sàn chỉ để thấy và nhặt; thưởng đã cộng sẵn như trước. Game chưa có bình máu rơi (đã có hình sẵn).
- Đồ rơi ngay sát tường có thể văng sát mép phòng (đã giữ trong sàn), cột sáng có thể chạm lên tường phía trên.
