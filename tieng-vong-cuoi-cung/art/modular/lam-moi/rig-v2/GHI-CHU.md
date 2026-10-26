# Ghi chú rig-v2 – Lam "tay chân rời"

Viết cho người không rành kỹ thuật. Mở `chay/chay-112px-x4.gif` và `chay/chay-contact-sheet.png` trước, rồi
`tu-the/02-so-sanh-v1-v2.png`. Mọi số "px logic" là tính toán theo Lam cao 112 px logic (~243 px thiết bị ở 2,17) –
**chưa chạy thử trên iPhone/Safari**. Không gen ảnh AI; tư thế do người đặt mốc bằng số, không IK.

## 1. Đã sửa gì (trước → sau) theo YEU-CAU-RIG-V2

| # | Yêu cầu | rig-v1 (trước) | rig-v2 (sau) | Xem |
|---|---|---|---|---|
| 1 | Gáy mũ/chóp liền | Nét viền gáy của mảnh mũ vắt ngang qua chóp → "hai bướu"; đỉnh mũ thấp hơn ảnh ngang tới ~50 px | Sửa tay bằng code, chỉ dùng điểm ảnh có sẵn của `2-nhin-ngang.png`: đường bao đỉnh/gáy = đúng ảnh ngang. Ranh giới mũ ↔ chóp đặt dọc **nếp gấp đen có sẵn**; thêm lớp "gáy mũ" vẽ sau chóp để khi chóp lắc không lộ nền. Chóp xoay quanh chỗ giáp mặt dưới chóp ↔ gáy (không còn khe trắng khi hất lên) | `tu-the/03-sua-gay-mu.png`, `04-chop-mu-lac.png`, `00-nghi-so-sanh.png` |
| 2 | Hai boot cùng cỡ, cùng neo | ×0,934 và ×0,971 (196×155 vs 207×162 px) | Cùng diện tích bóng: ×0,958 / ×0,947 → 201×159 vs 202×158 px (lệch < 1 %). Hình vẽ mỗi ủng giữ nguyên. Neo giống hệt: giữa đế, mép dưới; góc 0 = đế phẳng | `tu-the/05-ung-chuan-hoa.png` |
| 3 | Thử tối 10 % | không có | Tay sau + ủng xa nhân màu ×0,90 – **chỉ là bản thử, GIF chính không tối** | `tu-the/06-thu-toi-10.png`, `chay/chay-toi10-*.gif` |
| 4 | Tay sau còn đọc được | Xoay ±20° quanh vai ẩn → ra trước lẩn sau thân | **Đổi đường đi** (không đổi màu, không đổi lớp vẽ – vẫn nằm sau cùng): nắm tay chạy một vòng elip dẹt phía sau lưng – ra trước tối đa tới mép sau thân (thấp hơn), về sau xa hơn và cao hơn; vẫn ngược nhịp tay dao | `tu-the/07-tay-sau-duong-di.png` |
| 5 | Tư thế bay | Hai ủng lơ lửng gần nhau, "đứng trên không" | Ủng gần **thu sau** (mũi chúi 42°), ủng xa **đưa trước** (mũi hếch 18°), chênh cao ~3 px logic, cả hai rời đất | `tu-the/01-bang-duyet.png` cột 4 |
| 6 | Giữ nhún, sải, tay dao | nhún +30 px ảnh ngang, sải ±150, dao ±14° | giữ: thân thấp nhất +30 (3,14 px logic), sải chạm đất +149 → rời đất −139 (do đế lăn, xem mục 4), dao ±14° | `so-lieu.json → bien_do` |

**Chu kỳ chạy đầy đủ** (mới): 32 khung × 20 ms = 0,64 s (2 bước).
- **Nửa sau chỉ đổi pha**: hai ủng dùng **cùng một bộ mốc**, ủng xa lệch nửa chu kỳ; tay dao góc = 14°·cos, tay sau ngược pha.
  Không tráo ảnh/nút tay dao ↔ tay trống, không tráo vai trò gần/xa (kiem_tra.py kiểm cả hai).
- **Nội suy theo thời gian**: mỗi kênh là đường Hermite bậc 3 tuần hoàn qua mốc đặt tay, tiếp tuyến kiểu
  Fritsch–Butland → **không vượt biên** (đo bằng số: 0 ở mọi kênh). Liên tục vị trí và vận tốc ở mọi mốc, kể cả nối cuối→đầu.
- **Chân chịu lực – vận tốc ngang**: đế ủng hơi cong nên khi nghiêng ủng *lăn* (điểm chạm đi từ gót ra mũi). Vị trí ngang
  khi chịu lực được **tích phân** sao cho điểm vật chất đang chạm đất đi đúng tốc độ đất trôi. Vào/rời đất: mốc biên lấy
  đúng vị trí + vận tốc của pha chịu lực; khe hở ↔ đất có tiếp tuyến 0 (vào/ra đất êm).
- **Gốc (root) cố định**, nhún/bay là dịch thân; đất trôi sang trái 130,7 px logic/s (2,61 px logic/khung).
- **Vòng nối** cuối → đầu: liên tục cả vị trí và vận tốc (đo ở mục 3).

Sửa nhỏ khác: v1 ghi góc nghỉ của nút con là góc tuyệt đối (lệch ≤ 1° ở chóp/mắt) → v2 ghi góc tương đối đúng công
thức. Dáng nghỉ khớp ảnh ngang tốt hơn: IoU bóng **0,913 → 0,954**; riêng vùng mũ px lệch "mẫu có/rig không"
**19 502 → 786**, "rig có/mẫu không" **3 420 → 0**.

## 2. 4 tư thế (lấy ra từ chu kỳ – không còn đặt riêng)
| | Chạm đất (khung 0) | Chịu lực (6) | Đạp (10) | Bay (14) |
|---|---|---|---|---|
| Thân nhún (+ = xuống, px ảnh ngang) | −16 | **+30** (thấp nhất) | −4 | **−30** (cao nhất) |
| Thân nghiêng | 5° | 7° | 8° | 6° |
| Tay dao (+ = về sau) | +14° | +5,4° | −5,4° | −12,9° |
| Tay sau: dịch nắm tay (x, y) | (+40, +20) ra trước nhất | (−19, +16) | (−91, −3) | (−143, −24) |
| Chóp mũ | +2° | +7° | +2° | −6° |
| Ủng gần: x / khe hở / góc | +164 / 0 / −14° gót chạm | +15 / 0 / 0° phẳng | −83 / 0 / +18° gót nhấc | −155 / 55 / +42° **thu sau** |
| Ủng xa: x / khe hở / góc | −164 / 80 / +34° | +16 / 90 / −3° qua dưới thân | +112 / 65 / −17° | +156 / 24 / −18° **đưa trước** |
| Khe hở ủng ↔ đất ở 112 px (bay) | | | | gần 5,75 / xa 2,51 px logic |
| Tay sau còn thấy ở 112 px (v1 → v2) | 69,7 → **96,5 %** | 85,7 → **100 %** | 100 → 100 % | 100 → 100 % |
| Cao ở 112 px | 114 | 110 | 112 | 113 |

(x = giữa đế so với gốc, px ảnh ngang, + = trước; khe hở = điểm thấp nhất cách đất.)

## 3. Số đo kiểm tra (đầy đủ trong `so-lieu.json`, đồ thị trong `chay/`)
| Kiểm | Kết quả |
|---|---|
| Vận tốc ngang điểm chạm khi chịu lực so với đất (−130,72 px logic/s) | lệch tối đa **0,15 px logic/s (0,11 %)**, cả hai ủng |
| Trượt tích luỹ cả pha chịu lực | **0,0001 px logic** |
| Dịch điểm chạm mỗi khung (đất trôi −2,614) | −2,589 … −2,614 px logic/khung |
| Vận tốc dọc điểm chạm khi chịu lực | ≤ 0,5 (ủng gần) / ≤ 2,8 (ủng xa) px logic/s – do lấy mẫu bóng theo điểm ảnh, không thấy được |
| Lún/hở khi chịu lực | 0 px |
| Nhảy vận tốc giữa đế lúc chạm đất / rời đất | 0,19 / 0,48 px logic/s (≈ 0 – không giật) |
| Vòng nối cuối → đầu | nhảy vị trí 0,0008 px ảnh ngang, góc 0,0002°, vận tốc 0,15 px logic/s; gia tốc rời rạc ở khung 0 = 1,0 px logic (lớn nhất cả chu kỳ 3,0 ở khung 14) → chỗ nối không nổi bật |
| Vượt biên nội suy | 0 ở cả 10 kênh |
| Tay dao chồng ủng | 0 px ở cả 32 khung |
| Tay sau còn thấy ở 112 px | thấp nhất 96,5 % (v1: 69,7 % ở chạm đất) |
| Chóp lắc trong chu kỳ | −6 … +7° (v1 −7 … +9°); lỗ thủng ≤ 3 px ảnh ngang (~0,03 px² logic) |

`kiem_tra.py`: 118 mục ĐẠT.

## 4. Cái còn chưa đẹp / cần biết
- **Lam nhỏ đi ~3 % trong game.** Mũ sửa xong cao bằng ảnh ngang (đỉnh cao hơn v1 ~31 px) nên dáng nghỉ cao 1071 px thay
  vì 1040 → hệ số 112 px giảm 0,1077 → **0,1046**: thân, ủng, dao nhỏ hơn v1 ~3 % để tổng chiều cao vẫn 112.
- **Chóp lắc**: khi hất lên +7° có một bậc nhỏ ở chỗ giáp đỉnh mũ ↔ chóp và nét mặt dưới chóp hơi chồng đôi ở gáy dưới;
  ở −6° có bậc nhỏ ở đỉnh. Ở 112 px khoảng 1 px. Muốn sạch hẳn cần mảnh chóp vẽ lại có phần gốc dài hơn.
- **Gáy mũ là điểm ảnh của ảnh ngang ghép vào mảnh bảng**: tông màu chỗ ghép đã hoà mềm, phóng to rất kỹ mới thấy. Quanh mắt
  và quanh chuông vẫn là mảnh bảng (mắt là mảnh riêng, không nướng mắt vào mũ; quầng sáng quanh mắt của ảnh ngang không có).
- **Tay sau không bao giờ ra phía trước thân** – là cách "ăn gian" cho dễ đọc; đường đi tay sau (~190 px) dài hơn tay dao
  (~115 px). Nhìn chuyển động thấy tay sau đánh vòng phía sau lưng chứ không vung qua người.
- **Chịu lực**: ủng xa đi qua ngay trên ủng gần → ở 112 px hai ủng dính thành một khối (v1 cũng vậy).
- **Sải**: đế lăn làm giữa đế khi chịu lực đi +149 → −139 (288 px) thay vì đúng ±150; điểm chạm vẫn bám đúng tốc độ đất.
- **Nhún**: giữ số v1 – thân thấp nhất 3,14 px logic dưới dáng nghỉ, cao nhất 3,14 px logic trên → tổng biên độ ~6,3 px logic.
- Ngay sau rời đất ủng nhấc nhanh (55 px ảnh ngang trong ~40 ms) để kịp "thu sau" ở tư thế bay.
- GIF 20 ms/khung (50 hình/s): vài trình xem GIF cũ chạy chậm hơn; trong game nên lấy theo thời gian thật.
- Thử tối 10 %: ở 112 px khác biệt nhẹ, giúp tách lớp xa/gần một chút; chưa bật.
- Chưa có bóp méo (squash/stretch); dao vẫn đè chuông ở chịu lực (như v1).

## 5. Câu hỏi cần chủ dự án quyết
1. **Tối 10 %** tay sau + ủng xa: bật luôn, bỏ, hay thử mức khác (5 %/15 %)?
2. **Đường đi tay sau** kiểu vòng phía sau lưng (luôn ló) có được không, hay muốn tay sau vung qua trước ngực (phải chấp nhận lẩn sau thân hoặc đổi lớp vẽ)?
3. **112 px tính cả mũ đã sửa** (Lam nhỏ đi ~3 % so với v1) – giữ vậy, hay giữ cỡ thân như v1 (Lam cao ~115 px logic)?
4. **Nhún**: "khoảng 3 px logic" là độ hạ thấp nhất (hiện 3,14 px) hay tổng biên độ lên–xuống (hiện ~6,3 px, nếu vậy cần giảm một nửa)?
5. **Chóp lắc** −6…+7°: giữ, giảm (ít bậc ở chỗ giáp hơn), hay vẽ lại mảnh chóp có gốc dài hơn để lắc mạnh hơn?
6. Tốc độ: chu kỳ 0,64 s, đất trôi 130,7 px logic/s – có khớp tốc độ di chuyển trong game không? (đổi `CHU_KY_S` trong `chu_ky.py`; sải giữ nguyên thì tốc độ đất đổi theo).
7. Nếu duyệt: bước sau xuất cho game (sprite sheet từng khung hay rig chạy trực tiếp bằng JSON trên Canvas)?
