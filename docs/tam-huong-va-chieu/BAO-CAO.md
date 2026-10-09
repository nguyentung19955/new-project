# Tám hướng và chiêu riêng cho từng vũ khí

Góp ý của chủ dự án: "Chém lướt đang không theo 8 hướng, check lại các skill khác có theo 8 hướng không, và mỗi vũ khí nên có skill riêng, như thương tôi thấy cũng chọc thẳng".

## Đã làm gì

### 1. Mọi đòn của em bé đánh theo tám hướng

Trước đây nhiều đòn chỉ đánh sang trái hoặc phải theo hướng mặt của em bé: nhát lướt sau Né, đòn lao của giáo, búa, đòn Đặc biệt, bẫy và vũng hồi. Quái đứng ngay trên đầu hay dưới chân thì đòn chém trượt qua.

Nay mỗi lần ra đòn, game chọn một hướng theo thứ tự:

1. quái gần nhất trong tầm của đòn đó (tự ngắm, giống cung);
2. không có quái thì theo hướng đang kéo cần điều khiển;
3. không kéo cần thì theo hướng vừa đi;
4. cuối cùng mới là hướng mặt.

Áp dụng cho: chuỗi 3 nhát kiếm, nhát lướt sau Né, đâm, quét, xốc tới của giáo, búa nện và nện tích lực (cả sóng chấn động), mọi vệt hệ (vệt cháy, vũng độc, gai băng nằm dọc đúng hướng đòn), bốn chiêu Đặc biệt, bẫy của Thợ Săn (ném vào quái gần nhất dù cầm vũ khí gì, không có quái thì đặt theo hướng nhắm) và vũng hồi của Thầy Lang (có quái trong tầm 70 thì lệch về phía quái, không thì ngay dưới chân). Gồng của Đô Vật vẫn đánh vòng quanh người như cũ.

- Vùng trúng nay là hình chữ nhật xoay (hoặc dải, hoặc hình quạt) theo góc thật. Khi đánh ngang, vùng trúng rộng đúng bằng cũ.
- Quét vòng của giáo quét ba phần tư vòng quanh người, chỉ chừa một khe ngay sau lưng (để "đánh trước mặt, không trúng sau lưng" thì vẫn đúng). Mọi bài kiểm tra cũ về quét vẫn qua (vẫn trúng quái bên hông và quái sau lưng chếch).
- Lướt và xốc tới đi theo hướng thật (cả chéo), chạm tường thì dừng ngay, không xuyên tường.
- Hình: em bé vẫn chỉ lật trái phải, còn cây vũ khí sống, vệt chém, mũi giáo, sóng đập, hạt toé xoay đúng góc. Đánh chếch lên thì vũ khí vẽ sau lưng bé, chếch xuống thì vẽ trước người.

Xem: `tam-huong.png` (kiếm, nhát lướt, giáo, búa đánh lên, xuống, chéo) và `tam-huong.gif`.

### 2. Mỗi loại vũ khí một chiêu Đặc biệt riêng

Kiếm và giáo không còn dùng chung cú lao ngang. Nút Đặc biệt vẫn tốn 25 mana như cũ, biểu tượng nút đổi theo vũ khí đang cầm.

| Vũ khí | Chiêu | Cách đánh |
| --- | --- | --- |
| Kiếm | **Trảm Nguyệt** | Vung một nhát, vệt chém hình trăng lưỡi liềm bay thẳng theo hướng nhắm, xuyên mọi quái trên đường (con sau nhận 0,7 lần con trước), tầm khoảng 2/3 phòng. Em bé lùi nửa bước. |
| Giáo | **Phi Thương** | Ném giáo sống bay thẳng, xuyên một hàng quái; con cuối của hàng (hoặc con sát tường) bị ghim, choáng 1 giây. Giáo cắm 0,6 giây rồi tự bay vòng về tay, trúng lần nữa trên đường về. |
| Búa | **Địa Chấn** | Nện xuống: vòng chấn nhỏ quanh người, rồi vệt nứt đất chạy rất nhanh theo hướng nhắm (khoảng nửa phòng). Có vết nứt mảnh chạy trước 0,12 giây để báo. Quái trên vệt bị hất tung lên và choáng 0,9 giây. |
| Cung | **Mưa Tên** | Giữ như cũ (đã tự ngắm). |

- **Giáo đang bay thì sao?** Đã chọn: nút Đánh của chính cây giáo đó thành **cú đấm tay** yếu (0,45 lần, tầm ngắn). Lý do: rõ ràng, không tự đổi vũ khí làm người chơi bất ngờ. Muốn đánh mạnh thì tự bấm đổi sang vũ khí thứ hai (đổi được bình thường). Giáo chưa về thì chưa ném lại được. Sang phòng khác thì giáo coi như đã về tay.
- Đặc trưng hệ (từ Thành hình) nhuộm màu chiêu và để lại dấu dọc đường chiêu bay: vệt cháy, vũng độc, gai băng.
- Đòn Đặc biệt không hồi mana khi trúng (giống đòn lao cũ), để không tung liên tiếp được.
- Hướng dẫn trong game đã cập nhật: dòng mẹo của từng vũ khí khi vào ải, trang "Đánh tám hướng" và "Chiêu Đặc biệt" ở Cụ Đồ, README.

Xem: `bang-chieu.png` (bốn chiêu, mỗi chiêu bốn hướng kể cả chéo) và GIF từng chiêu: `tram-nguyet.gif`, `phi-thuong.gif`, `dia-chan.gif`, `mua-ten.gif`.

## Cân bằng

Sát thương một lần tung chiêu (đơn vị: lần sát thương gốc của vũ khí; đo bằng bia đứng yên trong phòng thường):

| Chiêu | 1 quái gần (40) | 1 quái xa (100) | 5 quái xếp hàng | 5 quái thành cụm | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| Trảm Nguyệt | 2,0 | 2,0 | 5,6 | 5,6 | xa, an toàn nhất trong cận chiến, cụm thì yếu dần |
| Phi Thương | 2,5 | 2,5 | 12,5 | 11,6 | cộng ghim 1 giây; bù lại không có giáo khoảng 1,3 giây |
| Địa Chấn | 2,1 (3,1 nếu sát người) | 2,1 | 11,5 | 10,5 | cộng choáng; mạnh nhất khi áp sát |
| Mưa Tên | 2,0 | 2,0 | 6,1 | 10,2 | xa nhất, phải đứng trong vùng mưa |
| (cũ) Chém lướt | 2,2 | 0 | 8,8 | 11,0 | |
| (cũ) Lao tới | 2,0 | 2,0 | 10,0 | 10,0 | |
| (cũ) Nện đất | 2,4 | 0 | 4,8 | 9,6 | |

Mưa Tên mỗi đợt 0,28 lên 0,34 lần cho ngang ba chiêu kia (trước đó chỉ 1,7 lần một quái).

Bot chơi 60 giây x 4 hạt giống, cụm năm quái (`python3 tests/dps.py 60 4 nho`):

| Vũ khí | không hệ | Lửa | Độc | Băng |
| --- | --- | --- | --- | --- |
| Kiếm | 78,6 | 105,5 | 112,9 | 91,4 |
| Cung | 60,6 | 85,2 | 95,1 | 92,2 |
| Giáo | 67,9 | 93,9 | 105,0 | 80,1 |
| Búa | 67,7 | 100,3 | 106,2 | 79,0 |

- Cung thấp hơn kiếm 23% (cần 15-25%).
- Ba vũ khí cận chiến lệch nhau nhiều nhất 10% (cần không quá 15%). Thứ tự sát thương mỗi đòn thường vẫn là búa > giáo > kiếm > cung.
- Ba hệ ở Thức tỉnh lệch nhau 10%.
- Số đo cao hơn đợt trước một chút ở mọi vũ khí vì tự ngắm tám hướng làm bot ít đánh trượt hơn.

## Kiểm tra

- Bài mới `game/tests/tam_huong.py` (37 mục): quái đặt ở 8 hướng quanh em bé, gần và xa trong tầm; mỗi đòn (chuỗi kiếm, nhát lướt, đâm, quét, xốc tới, búa, búa tích lực, 4 chiêu Đặc biệt, bẫy) trúng quái đúng hướng và không trúng quái đặt ở hướng ngược lại; lướt và xốc tới đi đúng hướng và không xuyên tường ở cả 8 hướng và góc phòng; Phi Thương ghim con cuối, đấm tay khi giáo chưa về, giáo bay về tay và trúng lần nữa; Địa Chấn hất tung và choáng; Trảm Nguyệt xuyên mọi quái; vũng hồi và gồng.
- Sửa cho khớp (không bớt nội dung): `tests/moves.py` (quái lệch chiều sâu đặt xa hơn để vẫn ngắm thẳng; quét vòng thử trong phòng riêng), `tests/ghep2_c.js` (đòn Đặc biệt của kiếm và giáo nay là chiêu bay: thử tầm bay theo bề ngang phòng, dừng ở tường, trúng quái sát tường; thử "lao vào cửa" bằng xốc tới của giáo), `tests/chieu_shots.py` (tên chiêu).
- Ảnh: `game/tests/tam_huong_shots.py`.
