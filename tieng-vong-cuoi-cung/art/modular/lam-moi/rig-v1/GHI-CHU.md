# Ghi chú rig-v1 – Lam "tay chân rời"

Viết cho người không rành kỹ thuật. Mở `tu-the/01-bang-duyet.png` trước, rồi đọc tiếp.

## 1. Đã làm gì
1. **Cắt 9 mảnh** từ `3-bang-manh.png`: mũ (mặt đen, không mắt), chóp mũ, thân + capelet, tay trước cầm dao, tay sau, 2 ủng, 1 mắt vàng, chuông. Nền trắng đã xoá, mép đã khử viền trắng (kiểm tự động: 0 điểm viền trắng ở mọi mảnh).
2. **Đo cỡ từng mảnh so với ảnh nhìn ngang** `2-nhin-ngang.png` (máy dò cho đến khi mảnh chồng khít nhất lên ảnh). Bảng mảnh **không cùng cỡ** với ảnh nhìn ngang: mũ, thân, chóp nhỏ hơn rõ, găng/chuông gần bằng, ủng hơi to hơn. Mọi mảnh đã được phóng về cỡ ảnh nhìn ngang (bảng dưới).
3. **Dựng rig** (cây xương): mảnh nào gắn vào mảnh nào, xoay quanh điểm nào, vẽ trước/sau. Không có khuỷu/gối – tay và ủng là mảnh rời "lơ lửng".
4. **Ráp dáng nghỉ** khớp ảnh nhìn ngang: `tu-the/00-nghi-so-sanh.png` (độ trùng bóng IoU = 0,913).
5. **Đặt tay 4 tư thế chạy** (không dùng IK): chạm đất, chịu lực, đạp, bay.
6. **Ảnh duyệt** + so sánh với v5 cũ (`tu-the/02-so-sanh-v5.png`) + thử lắc chóp mũ ±10°.

## 2. Cỡ và hệ số
Nhân vật dáng nghỉ cao **1040 px** trên ảnh nhìn ngang → hệ số ra game **112 / 1040 ≈ 0,1077**.
Trên iPhone (~2,17 px thiết bị / px logic) Lam cao khoảng **243 px thiết bị** (tính toán, **chưa chạy thử trên iPhone**).

| Mảnh (tên mới) | Từ mảnh bảng | Cỡ trên bảng | Hệ số phóng | Cỡ mới (px ảnh ngang) | Góc ở dáng nghỉ |
|---|---|---|---|---|---|
| `mu` | mũ | 499×441 | **×1,351** | 674×596 | +1,0° |
| `chop-mu` | chóp mũ | 397×278 | **×1,400** | 556×389 | −2,0° |
| `than` | thân + capelet | 302×260 | **×1,259** | 380×327 | 0° |
| `tay-truoc-dao` | tay cầm dao | 410×174 | ×1,015 | 416×177 | −1,4° |
| `tay-sau` | tay sau | 183×185 | ×1,047 | 192×194 | −3,3° |
| `ung-gan` | ủng hàng giữa | 218×174 | ×0,934 | 204×163 | −5,2° |
| `ung-xa` | ủng hàng dưới | 223×175 | ×0,971 | 216×170 | +7,9° |
| `mat-gan` | mắt | 55×119 | ngang ×1,00, dọc ×1,164 | 55×138 | 0° |
| `mat-xa` | (từ mắt gần) | – | ngang ×0,70, dọc ×0,94, tối 20 % | 38×130 | – |
| `chuong` | chuông | 147×178 | ×1,012 | 149×180 | 0° |

Ghi chú: hệ số và góc đo được nằm ở `manh/goc/khop.json`. Ảnh mảnh chỉ bị **phóng**, không bị xoay – góc nghiêng ở dáng nghỉ ghi trong `lam-moi.json`.

## 3. Các quyết định (cần biết)
- **Mắt – 2 bản gần/xa.** Ảnh nhìn ngang chỉ thấy **1 mắt** (mắt gần, sát mép phải lòng mặt). Vì vậy: `mat-gan` = mắt đó, đặt đúng chỗ ảnh ngang; `mat-xa` = bản hẹp hơn, tối hơn, đặt lùi vào trong lòng mặt 62 px nhưng **ẨN** ở cả dáng nghỉ và 4 tư thế (để giống ảnh nhìn ngang). Để sẵn cho khi Lam quay 3/4 sau này.
- **Mắt phóng không đều** (ngang ×1,00, dọc ×1,16): mắt trên ảnh ngang cao hơn mắt trên bảng (có quầng sáng). Mắt không có viền đen nên máy dò màu làm co mắt lại → đo thẳng vùng vàng trên ảnh ngang.
- **Chóp mũ gắn SAU mũ**, xoay quanh trọng tâm đầu tròn của chóp (nằm khuất trong mũ). Đỉnh chóp neo đúng đỉnh chóp trên ảnh ngang; đầu tròn gốc khuất sau mũ ~99 %. Lắc −10°…+10°: không thủng, gốc lộ tối đa 2,5 % (ở −10°) – xem `03-chop-mu-lac.png`.
- **Tên ủng gần/xa:** ủng ở chỗ phía trước (x≈738, hàng giữa bảng) = `ung-gan` (vẽ TRƯỚC thân); ủng phía sau (x≈513, hàng dưới bảng) = `ung-xa` (vẽ SAU thân). Ảnh nhìn ngang không cho biết ủng nào gần, nên chọn theo vị trí. Gán ngược lại cũng được, chỉ đổi tên file.
- **Thứ tự vẽ (sau → trước):** tay-sau → ủng-xa → chóp-mũ → thân → ủng-gần → mũ → (mắt-xa) → mắt-gần → chuông → tay-trước + dao. Tay sau và ủng xa nằm sau thân; tay trước + dao nằm trước hết. Chuông vẽ đè mép mũ như ảnh ngang.
- **Cây xương:** gốc (giữa hai ủng, trên mặt đất) → thân, ủng-gần, ủng-xa. Thân → mũ (xoay quanh cổ), chuông, vai-trước (ẩn), vai-sau (ẩn). Mũ → chóp, 2 mắt. Vai-trước → tay-trước-dao; vai-sau → tay-sau.
- **Vai ẩn:** điểm không vẽ, nằm phía trên nắm tay khoảng 240 px. Tay vung = xoay quanh vai ẩn → nắm tay đi theo cung gần như ngang. Cổ tay xoay ngược 80 % góc vung để dao luôn gần nằm ngang, không chĩa xuống ủng.
- **Ủng:** một quỹ đạo 8 mốc dùng chung cho cả hai ủng (ủng xa lệch nửa chu kỳ): chạm đất phía trước (gót chạm, mũi hếch) → phẳng dưới thân → lùi ra sau, gót nhấc → rời đất → nhấc lên sau → co lên qua dưới thân → đưa lên trước → vươn trước, hạ dần. Ủng nào đang chạm đất thì máy tự hạ cho điểm thấp nhất vừa chạm đất (không lún, không lơ lửng; sai ≤ 1 px).
- **Nửa sau chu kỳ (đổi chân):** chưa vẽ ảnh; trong JSON ghi cách làm: đổi pha hai ủng và đổi dấu góc vung hai tay.
- **Quy ước góc:** độ, **dương = quay thuận chiều kim đồng hồ** trên màn hình; Lam quay mặt sang phải. Thân dương = chúi về trước; chóp dương = đỉnh chóp hất lên; tay dương = vung về sau.

### Số của 4 tư thế (px ảnh ngang)
| | Chạm đất | Chịu lực | Đạp | Bay |
|---|---|---|---|---|
| Cả người lên/xuống | 0 | 0 | 0 | lên 22 |
| Thân nhún (+ = xuống) | +6 | **+30** (thấp nhất) | −6 | −8 (tổng lên 30) |
| Thân nghiêng | 5° | 7° | 8° | 6° |
| Mũ trễ so với thân | lên 4, −2° | lên 10, +2,5° | xuống 2, +0,5° | xuống 8, −2,5° |
| Chóp mũ | +3° | +9° | +2° | −7° |
| Chuông | −3° | +6° | +2° | −5° |
| Tay trước (dao) | về sau 14° | về sau 10° | 0 | ra trước 10° |
| Tay sau | ra trước 20° | ra trước 14° | 0 | về sau 14° |
| Ủng gần | trước, gót chạm | dưới thân, phẳng | sau, đạp | rời đất sau |
| Ủng xa | nhấc sau | qua dưới thân | đưa lên trước | vươn trước |

Kiểm tự động (`kiem_tra.py`): tay dao **không chồng lên ủng** ở cả 4 tư thế; ủng chạm đất không lún; chóp trong ±10°; cao ở 112 px = 109–112 px.

## 4. Cái còn chưa đẹp
- **Gáy mũ hơi "hai bướu".** Mảnh mũ trên bảng có gáy hẹp hơn ảnh nhìn ngang, nên phần trên của chóp ló ra thành một gờ nhỏ phía trên-sau mũ (thấy ở `00-nghi-so-sanh.png`: viền đỏ ở đỉnh/gáy mũ). Đỉnh mũ cũng thấp hơn ảnh ngang một chút. Cách sửa tốt nhất là có mảnh mũ vẽ lại khớp ảnh nhìn ngang (hoặc cho phép em sửa tay phần gáy).
- **Hai ủng không cùng cỡ** (×0,934 và ×0,971) vì hai ủng trên bảng vẽ hơi khác nhau; máy đo theo từng chỗ trên ảnh ngang. Mắt thường khó thấy, nhưng nếu muốn có thể ép cùng một hệ số.
- **Tay sau** khi vung ra trước thì lẩn vào sau thân, ở 112 px gần như mất (chạm đất, chịu lực). Đó là đúng phối cảnh nhưng làm silhouette ít "động".
- **Tư thế bay:** hai ủng đều lơ lửng và khá gần nhau, nhìn hơi "đứng trên không" hơn là sải bước.
- **Ở 112 px**, viền đen dày của mảnh gốc vẫn đọc được, nhưng chuông và chuôi dao thành vài điểm ảnh; mắt vẫn rõ.
- Ủng ở mốc chạm đất có thể lơ lửng 1 px do làm tròn.
- Mảnh không bị bóp méo (squash/stretch) – chỉ xoay và dịch. Nếu muốn nhún "mềm" hơn cần thêm.

## 5. Câu hỏi cần chủ dự án quyết
1. Có chấp nhận gáy mũ hơi lệch so với ảnh nhìn ngang không, hay cần vẽ lại/sửa tay mảnh mũ (hoặc chóp) cho khớp?
2. Mắt xa: giữ ẩn hoàn toàn khi chạy nhìn ngang, hay cho ló một chút (cảm giác 3/4)?
3. Gán ủng gần/xa như hiện tại (ủng phía trước = gần) có đúng ý không? Có muốn làm tối nhẹ tay sau + ủng xa để tách lớp rõ hơn không (ảnh nhìn ngang hiện không làm tối)?
4. Biên độ: thân nhún 30 px (≈ 3 px logic), sải ủng ±150 px (≈ ±16 px logic), tay dao vung ±14° – tăng hay giảm?
5. Hai ủng có cần ép cùng một cỡ không?
6. Nếu duyệt 4 tư thế này: bước sau làm nửa sau chu kỳ (đổi chân) + ráp chu kỳ + GIF thử?
