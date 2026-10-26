# Ghi chú v5 – thay đổi gì, vì sao, còn gì chưa ổn

Theo `../review-v4/YEU-CAU-V5.md`. Không đổi thiết kế, tỷ lệ, kích thước Lam: 24 mảnh PNG giống hệt v4 từng điểm ảnh,
điểm gắn, độ dài xương, cha–con giữ nguyên. Chỉ làm 4 tư thế để duyệt; chưa ráp chu kỳ, chưa làm GIF.
Mọi ảnh dựng bằng code từ mảnh v4, không dùng ảnh AI. Chưa chạy thử trên iPhone.

## 1. Tóm tắt dễ hiểu

- **Tay và chân giờ là một khối liền.** Ở v4, tay trên + cẳng tay (và đùi + cẳng chân) là hai mảnh, mỗi mảnh có
  viền đen riêng và một "nắp tròn" ở khớp. Khi gập, nắp tròn nhô ra và viền mảnh con vạch ngang ống tay áo, nên
  nhìn ra là "mảnh ghép". v5 dựng sẵn các **mảnh liền theo góc gập** (gọi là attachment: 0°/15°/…/135°). Mỗi mảnh
  liền có **một đường viền ngoài**, khớp không nhô, có **một nếp gấp ngắn** ở phía trong khi gập. Găng tay và ủng
  vẫn là mảnh riêng có viền riêng, để giữ ranh giới vải ↔ da.
- **Dáng do người đặt, không do IK.** Mỗi tư thế được đặt bằng góc: nghiêng thân, nhún, sải chân, vung tay ngược
  chân. Chỉ có một bước tự động: dịch cả người lên/xuống để đế chân trụ chạm đúng mặt đất (không đổi góc nào).
- **Hai chân cùng một logic bước.** Bỏ hai số riêng của chân xa ở v4 (dịch −32 px, nhấc ×0,7). Chân xa dùng đúng
  bảng bước của chân gần, lệch nửa chu kỳ. Ảnh `tu-the/04-phoi-canh-chan-xa.png` cho thấy không cần giữ hai số đó (mục 4).
- **Tay cầm dao có nhịp.** Ở v4, khuỷu tay dao gần như không đổi (86°–100° ở 4 khoá). v5: khuỷu đổi 105° → 75°
  qua 4 tư thế (60° ở lúc tay ra trước nhất), tay trên vung từ 100° (sau) đến 40° (trước). Nắm tay luôn ở trước ngực,
  lưỡi dao luôn chĩa ra trước-chếch lên. Ở v4 tư thế chạm đất, lưỡi dao chúc xuống 17° về phía chân trước.

## 2. File / hàm / thông số: trước → sau

| Chỗ | v4 | v5 | Vì sao |
|---|---|---|---|
| Tay/chân khi vẽ | 2 mảnh cứng/chi + nắp tròn R 25–27,5 px + viền riêng từng mảnh | 1 attachment liền/chi (`code/attachment.py`, `rap5.Rig5.layers`) | Đường bao liên tục, hết nắp nhô và vạch ngang tay áo (YC mục 4, 5) |
| Bộ attachment | không có | `manh/attachment/`: tay gần/xa 15…135°, chân gần/xa 0…135°, bước 15° (38 PNG) | Mảnh thay thế theo góc, thay vì ép một bộ mảnh cứng chịu mọi góc |
| Cách dựng một attachment | – | Đặt cẳng vào tay trên đúng như rig (FK) → cắt 26 px nắp ở hai đầu khớp (`CAT_CHA`, `CAT_CON`) → thay bằng ống thuôn đo từ bề rộng mảnh thật + đĩa khớp **bằng** bề rộng ống → đóng hình 8 px (`DONG_R`) + làm mịn σ 1,6 (`MIN_SIGMA`) → viền 8 px như v4 | Giữ nguyên bề rộng, màu, viền của thiết kế; chỉ bỏ phần thừa ở khớp |
| Bóng trên tay/chân | mỗi mảnh tự có dải tối riêng; tay trên tối phía trong, cẳng tay tối phía ngoài → dải tối đổi phía tại khuỷu | **một quy tắc cho cả chi**: dải tối ở phía NGOÀI khớp (cách xương > 3,5 px, `NGUONG_TOI`), dải tối hai đoạn nối liền qua khớp | Màu và bóng ăn nhau như một bộ quần áo (YC mục 4). Chân v4 vốn đã tối phía ngoài (phía trước) – giữ; tay trên đổi phía tối |
| Nếp gấp | không có (chỉ có viền mảnh con) | 1 nét ngắn 6–14 px, rộng 4 → 1,5 px, từ mép trong khớp vào, chỉ khi gập ≥ 30° (`NEP_TU`, `NEP_DAI`, `NEP_RONG`) | Nếp gấp phía trong ngắn, có chủ đích |
| Tay xa | tông tối toàn bộ | giữ toàn bộ tông tối | Như v4 |
| `chay_nhap.py` `DX_SHIFT` chân xa | −32 | **0** | YC mục 2; bằng chứng ở mục 4 |
| `chay_nhap.py` `LIFT_SCALE` chân xa | 0,7 | **1,0** | như trên |
| Luật đổi slot cẳng+ủng chân gần (v4: lên trên thân khi nâng đùi) | bật | **tắt khi chân gần dùng attachment** (`tu_the.slot_goc`) – ủng giữ ngay trên chân | Chân giờ là một khối, không tách cẳng lên trên thân được |
| Dáng | khoá trong `chay_nhap.py` (đích cổ chân + IK quyết định góc gối) | `code/tu_the.py`: bảng góc `BUOC_CHAN`, `TAY_DAO`, `TAY_KHONG`, `THAN` do người đặt | YC: người thiết kế quyết dáng; IK chỉ dùng sau để giữ chân chịu lực |
| Thân lên/xuống | cộng theo khoá + hạ root khi chân ngoài tầm | chân trụ chạm đất: dịch dọc để đế thấp nhất = đất; bay: đế thấp nhất cách đất 12 px (`BAY_CAO`) | Không xuyên đất, không bay lơ lửng ở tư thế chạm đất |
| JSON | `lam-v4.json` schema 4.0.0 | `lam-v5.json` schema 5.0.0: thêm `attachment`, `tu_the` | Runtime đọc được mảnh thay thế + tư thế |
| Validator `kiem_json.py` | – | thêm kiểm: file attachment tồn tại, kích thước khớp, tư thế chỉ dùng góc gập có sẵn | |

Runtime dùng attachment thế nào (ghi trong JSON `attachment.ghi_chu`): chọn attachment có góc gập gần nhất, vẽ nó
**thay** mảnh tay trên/đùi với ma trận `M_cha · T(−ox, −oy)`, **không vẽ** cẳng; găng, ủng, dao vẽ như cũ.

## 3. Số đo 4 tư thế (`tu-the/so-lieu.json`)

| | Chạm đất | Chịu lực | Đạp | Bay |
|---|---|---|---|---|
| Thân lên/xuống (px logic) | −1,4 | +2,3 | −4,9 | −3,5 |
| Đế thấp nhất chân gần / chân xa (đất y = 468) | 468 / 459 | 468 / 450 | 468 / 447 | 447 / 456 |
| Hướng lưỡi dao v5 (v4) | −11° (+17° chúc xuống) | −18° (+5°) | −15° (−5°) | −16° (−15°) |
| Gập khuỷu tay dao v5 (v4) | 105° (86°) | 105° (92°) | 90° (98°) | 75° (100°) |
| Dao che phần đang thấy của đai/vạt/bao dao/chân | 0 px | 0 px | 0 px | 0 px |

## 4. Chân xa: có cần giữ khác biệt phối cảnh không? (`tu-the/04-phoi-canh-chan-xa.png`)

Rig (từ v4) đã đặt sẵn hông xa **sau hông gần 49 px** và **thấp hơn 20 px**. Như vậy phối cảnh đã nằm ở điểm gắn hông.
Ảnh 04 so hai cách ở từng tư thế:
- v5 (cùng logic): chân xa không xuyên đất ở cả 4 tư thế (đế thấp nhất 447–459, đất 468).
- Thêm DX −32 và nhấc ×0,7 kiểu v4: ở tư thế **chạm đất**, đế chân xa **xuyên đất 8 px** (y 476). Ở cả 4 tư thế
  chân xa tụt ra sau thêm 29–36 px, lẫn vào bao dao và vạt áo, nên silhouette hai chân dính thành một khối.

→ **Không giữ** hai số này. Nếu chủ dự án vẫn muốn chân xa "lùi vào trong" hơn, nên sửa ở điểm gắn hông xa (một chỗ,
nhìn thấy được) thay vì cộng số riêng vào bước chạy.

## 5. Cái còn chưa đẹp / chưa làm (nói thẳng)

- **Chân bị áo che nhiều.** Thiết kế Lam chân ngắn, hông nằm cao dưới áo nên gối gần hầu như luôn khuất. Ở 112 px,
  chân đọc chủ yếu bằng ủng + một đoạn ống quần. Ảnh 03: ô "gối gần" chủ yếu thấy vạt áo.
- **Silhouette tư thế chịu lực và đạp: hai chân còn dính thành một khối** (chân lướt qua nằm ngay sau chân trụ).
  Tư thế chạm đất tách hai chân rõ nhất. Tư thế bay đọc được nhưng chưa "bay" mạnh: chân ngắn nên sải hẹp.
- **Độ nhún tổng ~7 px logic** (từ +2,3 đến −4,9). Có thể hơi mạnh với nhân vật 112 px. Tư thế đạp nâng thân cao vì
  chân sau duỗi và đẩy bằng mũi ủng.
- **Tay trên đổi phía tối** so với v4 (để bóng cả tay liền một quy tắc). Phần lớn tay trên bị capelet che, nhưng ở
  ảnh phóng to thấy rõ khác v4.
- **Khuỷu gập ≥ 105°**: phía trong khớp còn một khía nhỏ ngay chỗ nếp gấp (đọc như nếp vải dồn, nhưng chưa thật mềm).
- **Attachment chỉ có bước 15°.** Tư thế đặt đúng bội 15°. Khi ráp chu kỳ, các khung giữa sẽ nhảy từng nấc 15°,
  hoặc phải thêm nấc nhỏ hơn (dựng bằng code, chỉ tốn thêm file PNG nhỏ).
- **Chưa làm:** ráp chu kỳ, GIF, IK giữ chân chịu lực, kiểm trên iPhone/Safari, luật lật ngang cho attachment
  (về nguyên tắc dùng chung luật lật toàn rig của v4, nhưng chưa thử).
- `chay_nhap.py` chỉ sửa hai số chân xa, chưa nối với attachment. Chạy nó lúc này sẽ ra kiểu v4 (mảnh cứng).

## 6. Câu hỏi cần chủ dự án quyết

1. **Bóng tay/chân:** chọn "dải tối phía ngoài khớp" cho cả chi (như v5), hay giữ kiểu v4 (tay trên tối phía trong)
   và chấp nhận dải tối đổi phía tại khuỷu?
2. **Độ nhún** ~7 px logic có ổn không, hay giảm còn ~4 px (thân bớt nảy ở tư thế đạp/bay)?
3. **Tay dao:** nắm tay luôn ở trước ngực, lưỡi chĩa trước-lên, như v5 có đúng tính cách Lam không? Hay muốn khi
   vung ra sau thì dao chúc xuống/ra sau (dễ đè lên vùng hông – trái với yêu cầu mục 3)?
4. **Chân xa:** đồng ý bỏ DX −32 / nhấc ×0,7 không (mục 4)? Có muốn dời điểm gắn hông xa thay vào đó?
5. **Chân bị áo che:** chấp nhận theo thiết kế, hay cho phép tư thế nâng gối thì chân gần vẽ đè lên vạt áo
   (kiểu luật đổi lớp của v4, làm lại cho mảnh liền)?
6. Duyệt 4 tư thế này (hoặc chỉ ra tư thế cần sửa) để bước sau ráp chu kỳ + GIF, dùng IK chỉ để giữ chân chịu lực.
