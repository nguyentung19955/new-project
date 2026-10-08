# Báo cáo: sửa theo góp ý chơi thử (đợt 1)

Nhánh: `claude/sua-gop-y-1`, lấy `khoi-tao-du-an` làm gốc. Ba việc chủ dự án góp ý sau khi chơi thử trên điện thoại đều đã làm xong, mỗi việc một lần đẩy lên (mốc 1 cung, mốc 2 cổng, mốc 3 cân bằng).

## Ảnh nên xem (cùng thư mục này)

| Ảnh | Nội dung |
| --- | --- |
| `truoc-ten-bay-xa.png` và `sau-ten-bay-xa.png` | **Nên xem đầu tiên.** Bắn thường vào quái ở tám hướng. Trước: tên luôn bay ngang dù quái ở trên hay dưới. Sau: tên bay thẳng tới quái |
| `truoc-giuong-cung-gan.png` và `sau-giuong-cung-gan.png` | Đang giương cung, quái đứng sát người. Trước: cung luôn chĩa sang phải. Sau: cung, dây, tay và mũi tên cùng chĩa về quái |
| `truoc-vua-buong-gan.png` và `sau-vua-buong-gan.png` | Vừa buông dây, quái sát người: sau khi sửa, cả tám hướng đều trúng (có số sát thương) |
| `truoc-ten-manh-xa.png` và `sau-ten-manh-xa.png` | Tên mạnh hệ Lửa: lửa bọc tên và vệt gió xoay theo hướng bay |
| `cong-dich-chuyen.png` | Sáu khung của luồng thắng mới: cổng mọc lên, đồ rơi, nút "Vào cổng", bản đồ to có biểu tượng cổng, phòng trùm vùng 3, bảng tạm dừng có "Rời ải" |

Chụp lại: `cd game && python3 tests/cung_shots.py` (ảnh "sau") và `python3 tests/cong_shots.py`. Máy chụp không tải được phông chữ của Google nên chữ trong ảnh là phông thay thế.

## 1. Cung bắn trượt và hình xiêu vẹo

### Vì sao cung trượt

Tôi cho bot bắn thử 40 phát vào quái ở tám hướng, năm cự ly (từ sát người tới xa), trước khi sửa:

| Kiểu bắn | Quái đứng yên | Quái đi ngang | Người chơi vừa đi vừa bắn |
| --- | --- | --- | --- |
| Bắn thường | 65% | 60% | 55% |
| Giữ rồi thả | 65% | 50% | 55% |
| Mưa tên (Đặc biệt) | 48% | 48% | 48% |
| Kỹ năng bẫy của Thợ Săn | 5% | 10% | 5% |

Có bốn nguyên nhân:

1. **Tên chỉ bay theo phương ngang.** Vận tốc ngang của tên luôn đủ 100%, phần dọc bị chặn ở 0,7 lần. Quái ở thẳng trên hoặc dưới em bé thì tên vẫn lao ngang qua mặt nó. Đây đúng là lỗi "game từng chỉ đánh theo phương ngang" mà chủ dự án nghi.
2. **Chỉ tìm quái lệch dọc dưới 60 điểm ảnh, và chỉ tìm phía trước mặt.** Quái ở xa phía trên/dưới hoặc sau lưng thì không được ngắm. Mưa tên cũng chỉ tìm phía trước mặt, nên quay lưng với quái là mưa rơi vào khoảng không.
3. **Không có đón đầu.** Tên ngắm vào chỗ quái đang đứng, quái chạy ngang thì tên tới nơi đã trễ.
4. **Kiểm tra trúng chỉ ở điểm cuối của mỗi khung.** Tên sinh ra cách em bé 8 điểm ảnh về phía trước; quái đứng sát hay chồng lên người thì có khi nằm sẵn sau đầu tên.

Về nghi ngờ "lệch trục y giữa chỗ vẽ và chỗ tính trúng": chỗ tính trúng và chỗ ngắm đều dùng chân quái và chân em bé nên không lệch nhau. Hình mũi tên được vẽ cao hơn chân 10 điểm ảnh, và đó là cách thể hiện tên bay trên không, không phải lỗi. Lỗi thật là nguyên nhân 1.

Bẫy của Thợ Săn luôn đặt cách người 26 điểm ảnh về phía trước, nên gần như không bao giờ nằm dưới chân quái.

### Đã sửa gì

- Mọi phát bắn của cung (bắn thường, giữ rồi thả, mưa tên) và bẫy của Thợ Săn khi đang cầm cung đều tìm **quái gần nhất trong tầm theo khoảng cách thật**, ở mọi hướng, kể cả sau lưng. Tên bay đúng theo góc tới quái, đón đầu 0,85 lần quãng quái chạy được trong lúc tên bay. Vận tốc quái được đo từ chỗ đứng ở các khung trước.
- Mưa tên đặt tâm vào quái gần nhất, rồi dời về giữa cụm nếu quanh đó có nhiều quái (luôn vẫn phủ con gần nhất). Bẫy ném thẳng vào chỗ quái gần nhất trong tầm 150.
- Không có quái thì bắn theo hướng đang đi, đứng yên thì bắn theo hướng đang nhìn.
- Kiểm tra trúng theo **cả đoạn tên vừa bay trong khung**. Ở khung đầu, đoạn này bắt đầu từ giữa người bắn, nên quái đứng sát người vẫn trúng, không còn vùng chết. Vùng trúng là hình bầu dục rộng hơn thân quái 5 điểm ảnh theo ngang và 8 theo chiều sâu.
- Đồ vật trên sàn (chậu than, nấm, đá băng) không chặn tên nữa: tên bay qua thì vẫn kích nổ đồ vật, rồi bay tiếp.
- Mọi con số mới nằm ở `G.MOVES.bow` đầu tệp `js/moves.js`.

Sau khi sửa (`tests/cung.py`, mỗi dòng 40 phát):

| Kiểu bắn | Quái đứng yên (cần 90%) | Quái đi ngang (cần 75%) | Quái chạy nhanh (cần 75%) | Vừa đi vừa bắn (cần 90%) |
| --- | --- | --- | --- | --- |
| Bắn thường | 100% | 100% | 100% | 100% |
| Giữ rồi thả | 100% | 100% | 100% | 100% |
| Mưa tên | 100% | 100% | 100% | 100% |
| Bẫy của Thợ Săn | 100% | 100% | 100% | 100% |

### Vì sao cung "xiêu vẹo" và đã sửa gì

Trước đây tư thế bắn cung là một chuỗi khung hình vẽ tay: góc cung đổi từ -3 tới 4 độ, chỗ cầm nhảy từ 15 tới 23 điểm ảnh, thân em bé ngả từ -16 tới 14 độ, còn đòn đặc biệt thì chĩa lên trời 25 tới 68 độ. Không khung nào biết quái đang ở đâu, nên cung chĩa một đằng, tên bay một nẻo, và giữa các khung cung trượt tới trượt lui. Hình mũi tên chỉ nghiêng được tối đa 45 độ; vệt gió và lửa, độc, băng bọc tên luôn nằm ngang.

Nay:

- Cung quay quanh một điểm cố định ở vai, luôn chĩa đúng hướng bắn (mỗi nấc 15 độ, từ thẳng lên tới thẳng xuống, lật theo mặt trái hoặc phải). Thân em bé đứng thẳng. Tay kéo dây dọc theo trục cung. Giữa các khung chỉ có độ căng dây đổi, kèm một điểm ảnh giật lùi lúc buông.
- Đang giương thì cung xoay theo quái gần nhất từng khung. Ngắm xuống thì cung vẽ trước người để không bị thân che.
- Tên sinh ra ngay ở dây cung, cùng độ cao với cung, rồi hạ dần về tầm bay. Mũi tên, vệt sau tên và hình hệ (lửa, độc, băng) đều xoay theo hướng bay. Chớp sáng, vòng gió lúc buông dây cũng đi theo hướng ngắm.

Tôi đã xem ảnh tám hướng, cả khi quái ở gần lẫn ở xa (các ảnh `sau-*.png`).

## 2. Cổng dịch chuyển sau khi thắng

- Hạ trùm cuối ải thì **không hiện bảng kết quả ngay**. Khoảng 1,2 giây sau khi trùm gục, phần thưởng được tính và **lưu ngay**. Màn hình hiện dòng "Thắng rồi! Nhặt đồ rơi, đi dạo tuỳ ý, xong thì vào cổng dịch chuyển".
- Mỗi phần thưởng (vàng, quặng, nguyên liệu, mảnh trùm, vũ khí rơi...) thành một món văng ra quanh chỗ trùm gục. Đi ngang qua là nhặt, có chữ phần thưởng bay lên. Thưởng đã được cộng lúc thắng, nên nhặt không cộng thêm lần nữa.
- Một **cổng dịch chuyển** mọc lên giữa phòng trùm: vòng sáng toả ra, rồi một vòng xoáy xanh ngọc trong vành đồng có hoa văn vàng như mặt trống, màu lấy từ `G.theme`, có đốm sáng bay lên. Bản đồ nhỏ và bản đồ to hiện biểu tượng cổng ở phòng trùm, chú giải có dòng "Cổng dịch chuyển".
- Cửa phòng trùm mở. Người chơi đi lại tự do, quay lại các phòng đã mở; rương, suối, thương nhân còn dùng được. Trùm vùng gục thì bức chắn bên phải phòng cũng mất, để nhặt được đồ rơi ở đó.
- Tới gần cổng thì nút Đánh thành **"Vào cổng"**, dùng đúng kiểu nút "Nói chuyện" ở làng. Vào cổng mới hiện bảng kết quả với ba nút như cũ: Về làng, Chơi lại, Ải tiếp theo. Rương mở hoặc dấu ấn nhận được sau khi thắng được ghi thêm vào bảng.
- Bảng tạm dừng sau khi thắng có nút **"Rời ải"** dẫn tới bảng kết quả. Nút "Bỏ ải, về làng" thay bằng nút này, vì đã thắng thì "bỏ ải" sẽ thành thua.
- Thua vẫn hiện bảng thua ngay như cũ.
- Bot tự đi tới cổng rồi vào. `ghep2_fgh.js` được sửa để vào cổng sau khi hạ trùm. `setup.js` (dùng cho `balance.py`) tính thời gian đánh trùm tới lúc trùm gục, không tính lúc đi nhặt đồ. Không xoá mục kiểm tra nào.
- Bài kiểm tra mới `tests/cong.py` có 66 mục: luật ở ba ải, trong đó có hai trùm vùng; bấm thật trên điện thoại cầm ngang và cầm dọc. Hàm `G.finishStage(win)` giữ nguyên cách dùng cũ (hiện bảng ngay), để các bài kiểm tra cũ vẫn chạy.

Chỗ tôi tự quyết vì yêu cầu chưa nói rõ:

- **Sau khi thắng, người chơi không mất máu nữa.** Ở các phòng chưa vào vẫn có quái, đánh được và vẫn nhận dấu ấn, nhưng không thể gục. Nếu gục sau khi thắng mà hiện bảng thua thì vô lý, vì thưởng thắng đã được lưu.
- Đồ rơi chỉ là hình để nhặt cho vui tay. Thưởng thật được lưu ngay lúc thắng, đúng yêu cầu "phần thưởng vẫn tính và lưu ngay", nên tắt game giữa chừng cũng không mất gì.

## 3. Cân bằng bốn loại vũ khí

Nguyên tắc: càng chậm hoặc càng phải áp sát thì mỗi đòn càng mạnh. Búa mạnh nhất mỗi đòn, giáo ở giữa. Kiếm nhanh, tầm ngắn, và có sát thương mỗi giây cao hơn cung rõ rệt. Cung an toàn nhất nên có sát thương mỗi giây thấp nhất (thấp hơn kiếm khoảng 15-25%).

### Bảng trên giấy (sát thương gốc của loại vũ khí, chưa tính cấp, bậc, mài)

| Loại | Tầm với (điểm ảnh) | Giây mỗi đòn, trước → sau | Sát thương mỗi đòn, trước → sau | Sát thương mỗi giây trên giấy, trước → sau |
| --- | --- | --- | --- | --- |
| Kiếm (chuỗi 3 nhát) | 32-40 | 0,35 | 11,8 → **12,8** | 33,5 → 36,3 |
| Giáo (3 đâm + quét vòng) | 60-62 | 0,36 → **0,40** | 11,1 → **14,2** | 30,9 → 35,9 |
| Búa (nện) | 32 (vùng rộng) | 0,80 | 23,0 → **22,0** | 28,8 → 27,5 |
| Cung (bắn thường) | 180 | 0,40 → **0,38** | 9,0 → **11,0** | 22,5 → 28,9 |

Trước đây giáo với xa gần gấp đôi kiếm, đánh nhanh ngang kiếm, mà mỗi nhát lại yếu hơn kiếm. Nay kiếm nhanh nhất, giáo chậm hơn kiếm, búa chậm nhất, và thứ tự mỗi đòn là búa > giáo > kiếm > cung.

Số trên giấy chưa tính chuyện đánh trúng nhiều quái, nên cung trông như mạnh hơn búa. Số đo thật khi bot chơi (bảng dưới) mới là số quyết định.

### Đã chỉnh

| Chỗ | Trước | Sau |
| --- | --- | --- |
| Kiếm: sức ba nhát | 0,9 / 0,95 / 1,7 | 1 / 1,05 / 1,8 |
| Giáo: thời gian ba đâm và quét | 0,34 / 0,3 / 0,3 / 0,5 | 0,38 / 0,34 / 0,34 / 0,52 |
| Giáo: sức mỗi đâm và quét | 0,85 / 1,5 | 1,1 / 1,85 |
| Búa: sát thương gốc | 23 | 22 |
| Cung: sát thương gốc | 9 | 11 |
| Cung: bắn thường đứng yên / vừa đi | 0,4 / 0,47 giây | 0,38 / 0,45 |
| Cung: tên thường xuyên qua, con thứ hai nhận | 0,75 lần | 0,35 lần |
| Cung: tên mạnh xuyên thêm (đà thấp, trên 60%, đầy) | 1 / 2 / 4 quái, không giảm | 1 / 1 / 2 quái, mỗi con sau 0,6 lần |
| Cung: mưa tên mỗi đợt | 0,5 | 0,28 |

Tôi đã thử cách khác cho kiếm: giữ sức mỗi nhát cũ nhưng cho ra tay nhanh hơn (0,27 giây). Số đo đẹp, nhưng bot cầm kiếm lại thua ở vùng 3 trong bài `doors.py`: nó đứng chém liên tục và ít né hơn. Vì vậy tôi giữ nhịp kiếm cũ (vẫn nhanh nhất), chỉ tăng nhẹ sức mỗi nhát, rồi tăng giáo nhiều hơn để giáo vẫn mạnh hơn kiếm mỗi nhát. Bot cầm giáo lúc đầu chỉ thắng 10/14 lượt ở các ải khó (thấp hơn ngưỡng 75%), nên giáo được tăng thêm một nấc (đâm 1,1, quét 1,85).

Sau đợt sửa cung ở mục 1, cung bắn trúng gần như mọi phát, và bắn trúng cả cụm bằng tên xuyên và mưa tên. Vì vậy phần đánh cụm của cung bị giảm mạnh, còn mỗi phát đơn thì mạnh hơn: đánh một con, cung không quá yếu; đánh cả đám, cung không vượt kiếm.

### Số đo khi bot chơi (sát thương mỗi giây; hero cấp 10, vũ khí Lam mài +3, chưa có hệ)

"Trước" là bản gốc của nhánh `khoi-tao-du-an`; "sau" là bản cuối của đợt này. Cả hai đều đo bằng `tests/dps.py` mới, 90 giây × 16 hạt giống.

| | Cụm 5 quái, phòng thường: trước | Cụm 5 quái, phòng thường: sau | Một quái: trước | Một quái: sau | Cụm 5 quái, phòng trùm: trước | Cụm 5 quái, phòng trùm: sau |
| --- | --- | --- | --- | --- | --- | --- |
| Kiếm | 61,9 | **64,3** | 36,3 | **39,1** | 50,2 | **54,7** |
| Giáo | 62,4 | **68,7** | 35,8 | **42,8** | 52,1 | **56,8** |
| Búa | 68,9 | **68,8** | 43,7 | **41,3** | 53,7 | **53,5** |
| Cung | 58,6 | **50,9** | 28,8 | **32,1** | 52,9 | **46,4** |
| Cung thấp hơn kiếm | 5% | **21%** | 21% | **18%** | -5% (cung cao hơn) | **15%** |
| Ba vũ khí cận chiến lệch nhiều nhất | 7% | **4%** | 13% | **5%** | 4% | **3%** |
| Vũ khí yếu nhất so với mạnh nhất | 85% | **74%** | 66% | **75%** | 93% | **82%** |

Bản gốc đánh cụm thì cung gần ngang kiếm, còn đánh một con thì búa bỏ xa mọi loại (cung chỉ bằng 66% búa). Riêng việc sửa cung ở mục 1 (chưa cân bằng) đã đưa cung đánh cụm lên ngang kiếm: 62,4 so với 60,7, đo 60 giây × 8 hạt giống. Nay đánh một con hay cả cụm, phòng thường hay phòng trùm, cung đều thấp nhất và thấp hơn kiếm 15-21%. Ba vũ khí cận chiến sát nhau hơn trước.

Khi có hệ ở Thức tỉnh (cụm, phòng thường, sau): Lửa 90,5; Độc 97,3; Băng 80,3. Ba hệ lệch nhau 10%, trong ngưỡng 15%. Cung có hệ: Lửa 83,4, Độc 90,3, Băng 85,4.

### Ngưỡng kiểm tra mới

`tests/dps.py` in bảng trên giấy trước khi đo. Bài đo thêm kiểu `mot` (một quái máu dày) và `khonghe` (bỏ ba hệ cho nhanh). Bài trả lỗi nếu:

- thứ tự mỗi đòn không phải búa > giáo > kiếm > cung;
- cung không thấp nhất, hoặc không thấp hơn kiếm 13-27% (khoảng 15-25%, chừa 2 điểm cho độ lệch của bot);
- ba vũ khí cận chiến lệch nhau quá 15%;
- vũ khí yếu nhất dưới 70% vũ khí mạnh nhất;
- ba hệ lệch nhau quá 15%.

`tests/balance.py` nay trả lỗi nếu bot thắng dưới 85% số lượt. Chạy thêm chữ `vukhi` thì bài chơi lại với từng loại vũ khí, và loại nào thắng dưới 75% là lỗi.

KẾT_QUẢ_KIỂM_TRA

## Điểm còn yếu

- **Cung ngắm rất "ngoan".** Gần như phát nào cũng trúng, nên độ khó khi cầm cung nay nằm ở việc né, không còn ở việc ngắm. Đổi lại, sát thương của cung đã được hạ (mục 3). Muốn cung khó hơn thì giảm `G.MOVES.bow.lead` (đón đầu) hoặc thu hẹp `hitX`, `hitY` (vùng trúng).
- **Bẫy chỉ tự ngắm khi đang cầm cung.** Khi cầm vũ khí cận chiến, bẫy vẫn đặt trước mặt như cũ, vì lúc đó quái thường đã ở sát người. Ba hero còn lại có kỹ năng không cần ngắm (Nung phủ lửa vũ khí, Bình thuốc là vũng hồi máu, Gồng toả quanh người) nên không đổi.
- **Cung ngắm thẳng xuống thì cung che chân em bé**, vì phải vẽ trước người mới thấy được cung. Ảnh trông vẫn ổn, nhưng nhìn kỹ sẽ thấy.
- **Băng vẫn yếu nhất trong ba hệ khi đánh cụm** (80 so với 90-97), dù vẫn trong ngưỡng. Đợt này không đụng tới hệ.
- **Số đo cân bằng là số của bot.** Người thật chơi cung có thể đứng xa an toàn hơn bot, nên cảm giác cung yếu hơn kiếm có thể ít hơn con số 20%.
- **Cổng chỉ có ở cuối ải.** Ải hướng dẫn (ải 1) cũng dùng cổng; dòng báo thắng đủ rõ để người mới biết phải làm gì.
