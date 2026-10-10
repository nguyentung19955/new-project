# Thử ghép 5 lô trang phục AI (phiên "ghep-thu")

Ngày 10/10/2026. Câu hỏi của bạn: *"thử dùng tool rồi ghép với các phụ kiện này xem có khớp được không"*.

## Trả lời ngắn

- **Công cụ Tách Đồ tách được đủ 38/38 món** ở cả 5 ảnh, đúng thứ tự, cả bản nét gấp đôi lẫn bản thường. Không phải sửa cách tách.
- **ChatGPT vẽ đúng thứ tự và đúng món** ở cả 5 lô. Nhưng nhiều món **sai dáng** so với chỗ trong game (áo có tay dài, dấu mặt nạ sai dáng, trống nằm ngang, bùa xoè ngang).
- **Khoác lên em bé trong game, bản cũ chưa có điểm neo:** phần lớn món **lệch nhẹ**: đặt thấp hơn đồ vẽ bằng code khoảng 2 đến 4 điểm ảnh.
- **Bản mới của phiên "ghep-loi" (đặt theo điểm neo, vừa đẩy lên):** áo ôm thân đúng cổ đến hông, khố đô vật về đúng hông, đồ lưng lên ngang vai. Xem mục 7.
- **Không dùng được, phải vẽ lại (7 món):** găng đồng, dấu đô vật, dấu lá, áo choàng, khăn choàng sương, trống đồng nhỏ, và nên vẽ lại khố đô vật nếu muốn đẹp.
- **Chưa đưa món nào vào game.** Tệp thử nằm ở `docs/review/ghep-trang-bi/tep/`. Riêng 4 cánh đã có sẵn trong game từ trước (phiên khác đưa vào). Tệp cánh của phiên này giống hệt, chỉ thêm điểm neo.

## Phần nào ĐÃ SỬA THẬT, phần nào CHỈ ĐỀ XUẤT

| Việc | Trạng thái |
|---|---|
| Tách Đồ: tự đoán **điểm neo món đồ** (`trang_phuc.diem`) khi tách, theo đúng bảng trong DINH-DANG-GHEP.md mục 3 | **ĐÃ SỬA THẬT** |
| Tách Đồ: chạm để sửa từng điểm, giống cách đặt điểm cầm vũ khí (nút chọn tên điểm, chấm màu có chữ trên hình) | **ĐÃ SỬA THẬT** |
| Tách Đồ: tệp tải về (cả bản gấp đôi và bản thường) có thêm `diem` và `co_chuan` | **ĐÃ SỬA THẬT** |
| Tách Đồ: prompt vẽ ghi rõ **dáng** từng món, áo không tay, bùa dài hẹp, đồ lưng dựng đứng, dấu mặt không che mắt | **ĐÃ SỬA THẬT** (chỉ đổi chữ trong prompt, không đổi lô hay mã) |
| Thuật toán tách (nền xanh lá, tia lửa rời, mặt nạ) | Không cần sửa: đã tách đúng |
| Đặt đồ theo điểm neo trong game | Việc của phiên "ghep-loi" (đã đẩy lên lúc gần cuối). Phiên này đã chụp ảnh "sau" để so (mục 7) |
| Neo áo choàng và khăn vào cổ, kiểu găng tay | **CHỈ ĐỀ XUẤT** (cho phiên ghep-loi) |
| Vẽ lại 7 món | **CẦN VẼ LẠI ẢNH** (dùng prompt mới của Tách Đồ) |

Mọi tính năng cũ của Tách Đồ vẫn giữ: tải 2 bản, lật, xoay, to nhỏ, dời bằng mũi tên, bỏ món, vũ khí. Không có tên trường mới ngoài định dạng đã chốt: chỉ dùng `diem` và `co_chuan`.

## 1. Tách 5 ảnh bằng Tách Đồ

Chạy thật trên trang `tools/tach-do` (Chromium), chọn đúng lô, đưa ảnh vào, lấy kết quả.

| Lô | Ảnh | Kết quả | Ghi chú |
|---|---|---|---|
| Áo (tp-robes) | lưới 5×3, nền hồng tím | 13/13 | đúng thứ tự |
| Cánh (tp-wings) | 2×2, nền hồng tím | 4/4 | tia lửa rời (cánh lửa) và mảnh băng rời (cánh băng) đã tự bị bỏ, đúng ý |
| Đồ lưng (tp-backs) | 3×2, nền hồng tím | 6/6 | |
| Dấu mặt nạ (tp-masks) | 5×1, nền hồng tím | 5/5 | công cụ ghi nhầm "2 hàng" trong dòng ghi chú nhưng tách vẫn đúng. Mảnh nhỏ giữa mũi của dấu đô vật bị bỏ (quá nhỏ) |
| Bùa, đồ tay (tp-hands) | 5×2, nền **xanh lá** | 10/10 | công cụ tự chọn đúng nền xanh lá |

Kết luận: lỗi chủ yếu nằm ở **dáng hình vẽ**, không nằm ở công cụ. Khi dáng vẽ khác dáng trong game, công cụ phải thu nhỏ cho lọt khung nên món bị nhỏ đi. Ví dụ dấu đô vật cần 10×5 nhưng vẽ gần vuông nên còn 5×5.

## 2. Điểm neo món đồ trong Tách Đồ

Khi tách, công cụ **tự đoán** các điểm sau. Toạ độ tính theo điểm ảnh game, đo từ góc trên bên trái ảnh món đồ, làm tròn đến nửa điểm ảnh:

| Ô | Điểm | Cách đoán |
|---|---|---|
| Mũ | `dinh_dau`, `gay` | đỉnh đầu: giữa, gần đáy mũ (cao hơn đáy khoảng 15% bề cao). Gáy: mép sau, cùng độ cao |
| Mặt nạ | `mat` | tâm hình |
| Áo | `co`, `vai_sau`, `vai_truoc`, `hong` | cổ: giữa mép trên. Hai vai: ở 20% bề cao, cách mép áo 15% bề ngang. Hông: giữa mép dưới |
| Khố đô vật | `eo`, `hong` | eo: giữa mép trên (đai). Hông: giữa mép dưới |
| Đồ lưng | `lung` | 60% ngang, 60% cao (phía áp vào lưng). Lúc đầu dùng 40% cao, thử trong game thấy đồ lưng thấp khoảng 3 nên đổi sang 60% |
| Cánh | `goc_canh` | điểm xa nhất ở góc dưới bên phải (gốc cánh), lùi vào trong một chút |
| Bùa | `eo` | giữa móc treo trên cùng |
| Đồ cầm (búa tí hon) | `tay_truoc` | giữa cán, ở 78% bề cao |

`co_chuan` = `[rong, cao]` lúc xuất.

Muốn sửa: chạm món, bấm tên điểm (ví dụ "Vai trước"), rồi chạm vào hình. Bấm "Đặt lại" thì về điểm tự đoán.

- Ảnh tất cả điểm tự đoán: `anh-thu/diem-neo-tu-doan.png`
- Ảnh giao diện: `anh-thu/cong-cu-diem-neo-robes.png`, `-wings`, `-backs`, `-masks`, `-hands`

## 3. Tệp kết quả (KHÔNG nằm trong game)

`docs/review/ghep-trang-bi/tep/`: 38 món × 2 bản:
- `<mã>.sprite.json`: nét gấp đôi
- `<mã>.thuong.sprite.json`: nét thường

Mã từng món khớp với hình trong game (`hero_tinhlinh.js` `L.robes`, `L.backs`, `L.hands`, `L.masks`, `L.wings`). Khi đưa vào game, món AI sẽ **thay** hình code cùng tên:
- **Áo:** ao_trum, ao_toi, ao_the, giap_tre, ao_da, ao_la, kho_vat, ao_vai, ao_da_bien, giap_da, ao_vo_cay, ao_vay, ao_long. ChatGPT vẽ đúng 13/13 theo thứ tự, mỗi món có đúng "nét lạ".
- **Cánh:** chuon, la, lua, bang. Đúng thứ tự. Gốc cánh ở góc dưới bên phải, đúng prompt.
- **Đồ lưng:** ho_lo, ong_ten, ao_choang, gui_tre, khan_bang, trong_nho. Đúng thứ tự. Trống đồng nhỏ vẽ **nằm ngang**, sai dáng đứng.
- **Dấu mặt nạ:** lua, la, xoay, du, ho. Đúng thứ tự, nhưng dấu lửa, dấu lá và dấu đô vật **sai dáng**.
- **Đồ tay:** bua_con, gang_dong, bua_nanh, bua_oc, bua_lua, bua_hut, bua_tan, bua_suong, bua_tham, bua_linh. Đúng thứ tự. Các bùa đều có tua xoè ngang.

## 4. Ảnh xem thử trong game thật

Dùng game thật (`game/dist/xuong-sprite.html`, thân em bé vẽ bằng code), phóng to 4 lần. Mỗi ảnh có 4 em bé (Thợ Rèn, Thợ Săn, Thầy Lang, Đô Vật) × 4 động tác (đứng, chạy, chém, lăn):
- **hàng trên:** đồ vẽ bằng code đang có trong game
- **hàng dưới:** đồ AI vừa tách

Để dễ nhìn, khi thử đã bỏ mũ, nên 4 em bé trông gần giống nhau. Chỉ động tác chém có cầm kiếm.

- Mỗi món: `anh-thu/tp-<ô>-<hình>.png`, ví dụ `anh-thu/tp-robes-giap_tre.png`
- Nhiều món cùng lúc (4 bộ phối): `anh-thu/phoi-nhieu-mon.png`

## 5. Đánh giá từng món

Đánh giá trên bản game **hiện tại** (đặt theo `lech`, chưa theo điểm neo):
- **Khớp:** dùng được ngay.
- **Lệch nhẹ:** dời 1 đến 4 điểm ảnh là ổn. Điểm neo hoặc "chỉnh theo cặp" sửa được, không cần vẽ lại.
- **Không hợp:** phải vẽ lại.

### Áo (13)

Chung cho cả lô:
- ChatGPT vẽ **áo khoác đủ tay, cổ cao**, dù prompt đã dặn không vẽ tay áo. Áo trong game chỉ khoảng 11 đến 15 điểm ảnh nên tay áo chỉ thành hai cục ở hai bên, chưa thành lỗi lớn.
- Áo AI nằm **thấp hơn áo code khoảng 2 điểm ảnh** và dài xuống che bớt chân.
- Áo dính theo thân khi chém và lăn, không bay.

| Món | Cỡ (gốc) | Đánh giá | Lý do |
|---|---|---|---|
| ao_trum · Áo trùm | 13×12 (13×13) | lệch nhẹ | thấp khoảng 2. Vẽ kèm mũ trùm sau cổ, nhìn như cổ áo dày |
| ao_toi · Áo tơi lá | 15×14 | lệch nhẹ | thấp, che gần hết chân |
| ao_the · Áo the | 12×11 (12×13) | lệch nhẹ | gần khớp, đẹp nhất lô |
| giap_tre · Giáp tre | 15×13 | lệch nhẹ | thấp khoảng 2, hơi rộng |
| ao_da · Áo da | 11×11 (11×13) | lệch nhẹ | dùi trống bên hông chỉ còn vài điểm |
| ao_la · Áo lá | 15×14 | lệch nhẹ | rộng, thấp |
| kho_vat · Khố đô vật | 11×8 | **lệch rõ** | game đặt mọi áo quanh giữa thân nên khố nằm ở **ngực** thay vì hông. Điểm neo `eo` hoặc dời xuống khoảng 4 thì được. Hình là đai + chuông, dùng được |
| ao_vai · Áo vải thô | 12×11 (12×12) | lệch nhẹ | gần khớp |
| ao_da_bien · Áo da biển | 11×12 (11×13) | lệch nhẹ | gần khớp |
| giap_da · Áo giáp đá | 14×13 (15×13) | lệch nhẹ | thấp khoảng 2 |
| ao_vo_cay · Áo vỏ cây | 15×14 (15×16) | lệch nhẹ | to, che tay sau |
| ao_vay · Áo vảy | 12×12 | lệch nhẹ | gần khớp |
| ao_long · Áo lông trắng | 15×14 | lệch nhẹ | phồng to như cục bông, che tay. Muốn đẹp nên vẽ lại gọn hơn |

### Cánh (4)

Đã có trong game. Gốc cánh đúng góc dưới bên phải, cánh vỗ theo nhịp, có cánh xa tối hơn.

| Món | Cỡ (gốc) | Đánh giá | Lý do |
|---|---|---|---|
| chuon · Cánh chuồn chuồn | 17×16 (17×17) | lệch nhẹ | gốc cánh thấp hơn cánh code khoảng 2 đến 3, chót cánh xuống ngang hông |
| la · Cánh lá | 17×16 (17×17) | lệch nhẹ | như trên |
| lua · Cánh lửa | 18×17 (18×19) | lệch nhẹ | như trên. Tia lửa rời đã bị bỏ |
| bang · Cánh băng | 18×18 | lệch nhẹ | như trên. Mảnh băng rời đã bị bỏ |

### Đồ lưng (6)

Chung: đồ AI nằm **thấp hơn đồ code khoảng 3 đến 4**.

| Món | Cỡ (gốc) | Đánh giá | Lý do |
|---|---|---|---|
| ho_lo · Bầu hồ lô | 20×23 (20×28) | lệch nhẹ | to, đáy bầu xuống tận chân. Điểm neo `lung` sẽ kéo lên |
| ong_ten · Ống tên | 16×18 (18×18) | lệch nhẹ | vẽ nghiêng, đuôi tên chĩa lên phải. Vẫn đọc được là ống tên |
| ao_choang · Áo choàng | 13×12 (13×15) | **không hợp** | áo choàng phải rủ từ vai. Ảnh vẽ cổ khăn tròn + vạt cờ, game đặt sau lưng thấp nên thành cục vải ở sau mông. Cần vẽ lại dạng vạt rủ từ vai, hoặc game neo vào `co` (đề xuất) |
| gui_tre · Gùi tre | 12×14 (12×16) | lệch nhẹ | gà con và rau còn nhận ra |
| khan_bang · Khăn choàng sương | 16×16 (18×16) | **không hợp** | vẽ khăn quấn cổ (vòng cổ + hai vạt), nhưng game đặt sau lưng nên thành cục xanh ở hông. Cần vẽ lại dạng khăn bay ra sau từ cổ, hoặc neo `co` |
| trong_nho · Trống đồng nhỏ | 16×18 (16×25) | **không hợp** | vẽ trống **nằm ngang** (như thùng), thiếu chiều cao. Cần vẽ lại dựng đứng (prompt đã sửa) |

### Dấu mặt nạ (5)

| Món | Cỡ (gốc) | Đánh giá | Lý do |
|---|---|---|---|
| lua · Dấu lửa | 2×4 (4×4) | lệch nhẹ | vẽ ngọn lửa cao hẹp nên còn 2×4, đè lên mắt. Dùng tạm được |
| la · Dấu lá | 7×8 (11×8) | **không hợp** | thành mảng xanh to che nửa mặt và mắt |
| xoay · Dấu nước | 4×4 | khớp | chấm xoáy xanh ở vùng mắt, giống code |
| du · Dấu đô vật | 5×5 (10×5) | **không hợp** | vẽ hình con bướm nét mảnh, thu về 5×5 chỉ còn vài chấm đỏ, gần như không thấy. Cần vẽ lại: hai vạch đỏ dày nằm ngang |
| ho · Mặt nạ hổ | 10×9 (11×9) | khớp (là mặt nạ cả mặt) | che kín mặt như mặt nạ thật. Ở khung chém em bé xoay người, mặt nạ theo mặt sang bên trái giống dấu code, không lỗi |

### Bùa và đồ tay (10)

| Món | Cỡ (gốc) | Đánh giá | Lý do |
|---|---|---|---|
| bua_con · Búa rèn tí hon (cầm) | 7×8 (7×11) | khớp | nằm trong tay lúc đứng và chạy, khi chém thì ẩn (như code) |
| gang_dong · Găng đồng | 6×5 (14×5) | **không dùng được** | code vẽ găng **trên hai bàn tay**. Ảnh AI chỉ là một chiếc găng, công cụ xuất kiểu "bùa" nên game treo nó ở hông như cục đồng. Cần ảnh găng nhỏ cho từng tay và game hỗ trợ kiểu "găng" |
| bua_nanh · Bùa nanh rắn | 5×7 (5×13) | lệch nhẹ | treo thấp sát đất khoảng 3. Bùa ngắn vì tua vẽ xoè ngang nên bị thu theo bề rộng 5. Chỉ thấy chấm màu |
| bua_oc · Bùa vỏ ốc | 5×6 (5×13) | lệch nhẹ | như trên |
| bua_lua · Bùa đá lửa | 5×7 (5×13) | lệch nhẹ | như trên |
| bua_hut · Bùa hút máu | 5×7 (5×13) | lệch nhẹ | như trên |
| bua_tan · Bùa tàn lửa | 5×7 (5×13) | lệch nhẹ | như trên |
| bua_suong · Bùa sương | 5×6 (5×13) | lệch nhẹ | như trên |
| bua_tham · Bùa tham | 5×6 (5×13) | lệch nhẹ | như trên |
| bua_linh · Bùa linh | 5×7 (5×13) | lệch nhẹ | như trên |

Bùa: điểm neo `eo` (móc treo) sẽ kéo bùa lên đúng thắt lưng. Muốn bùa dài như code (có dây treo) thì nên vẽ lại theo prompt mới: dài hẹp, tua rủ thẳng.

### Phối nhiều món cùng lúc (`anh-thu/phoi-nhieu-mon.png`)

- Bốn bộ phối đều không lỗi vẽ. Thứ tự lớp đúng: cánh và đồ lưng sau thân, áo trên thân, mặt nạ trên mặt.
- Vì cánh, đồ lưng và áo đều nằm thấp nên **dồn cục ở nửa dưới** sau lưng em bé, khá rối. Bầu hồ lô to + cánh băng che gần hết nửa người.
- Khi đồ lên đúng chỗ theo điểm neo, đồ lưng và cánh sẽ tách ra hơn.

## 6. Đề xuất

**Cho phiên ghep-loi (game), chỉ là đề xuất:**
1. Đặt theo điểm neo sẽ sửa hầu hết lỗi "thấp 2 đến 4 điểm ảnh" ở trên. Không cần vẽ lại áo, cánh, phần lớn đồ lưng và bùa.
2. Áo choàng và khăn choàng: nên cho phép đồ lưng neo vào `co` thay vì `lung`. Cách làm: trong tệp món đồ chỉ ghi điểm `co` (định dạng đã cho phép). Công cụ hiện tự đoán `lung` cho mọi đồ lưng; người dùng có thể đổi tay sau khi game hỗ trợ.
3. Găng tay: cần kiểu "găng" riêng (ảnh nhỏ đặt ở `tay_truoc` và `tay_sau`). Hiện không có trong định dạng, nên để sau.

**Sửa prompt vẽ (đã sửa trong Tách Đồ):**
- Mỗi ô thêm câu về dáng, ví dụ "dáng NGANG DẸT, rộng gấp khoảng 2 lần cao" (dấu đô vật), "dáng ĐỨNG CAO HẸP…" (bùa, trống), "dáng gần vuông".
- Áo: "kiểu áo KHÔNG TAY (như áo gi lê, áo yếm), không tay áo kể cả tay ngắn, cổ thấp, không cổ đứng, không mũ trùm".
- Đồ lưng: "DỰNG ĐỨNG, không nằm ngang".
- Bùa: "dài và hẹp, móc treo trên cùng, dây treo thẳng, tua rủ thẳng xuống, không xoè sang hai bên".
- Dấu mặt: "không che mắt (trừ mặt nạ hổ), nét dày, không nét mảnh rời, đúng dáng ghi ở từng ô".

**Cần vẽ lại** (dán prompt mới của lô đó vào ChatGPT, rồi chỉ lấy các món này):
- áo choàng, khăn choàng sương, trống đồng nhỏ (lô Đồ đeo lưng)
- dấu lá, dấu đô vật (lô Dấu mặt nạ)
- găng đồng (lô Bùa và vật cầm tay; còn cần game hỗ trợ găng)
- tuỳ ý: áo lông trắng, và cả lô áo nếu muốn áo không tay cho gọn

## 7. Ảnh trước và sau khi có điểm neo

Gần cuối phiên, phiên "ghep-loi" đẩy lên phần game đặt đồ theo điểm neo (commit `213989f`). Phiên này chạy lại cùng bảng xem thử với cùng tệp trong `tep/`:
- **Trước** (game cũ, đặt theo `lech`): `anh-thu/tp-*.png`, `anh-thu/phoi-nhieu-mon.png`
- **Sau** (game mới, đặt theo điểm neo): `anh-thu/sau/tp-*.png`, `anh-thu/sau/phoi-nhieu-mon.png`

Đã thấy trên ảnh "sau":

| Lô | Trước | Sau |
|---|---|---|
| Áo | thấp khoảng 2, che chân. Khố đô vật nằm ở ngực | **khớp**: mép trên ở cổ, mép dưới ở hông. Khố đô vật về đúng hông. Áo lông trắng gọn vào thân |
| Đồ lưng | thấp 3 đến 4 | **gần khớp**: lên ngang vai, chỉ còn bầu hồ lô hơi thấp (chạm điểm `lung` lên cao hơn là được). Áo choàng và khăn choàng vẫn **không hợp** vì vẽ sai kiểu |
| Cánh | gốc hơi thấp | gần như cũ, lệch nhẹ (game giữ cách đặt cánh riêng có vỗ cánh) |
| Bùa | treo sát đất | treo từ thắt lưng, gần như bùa code. Vẫn nhỏ |
| Mặt nạ | | dấu lá vẫn che mặt, dấu đô vật vẫn gần như không thấy: phải vẽ lại |
| Găng đồng | | vẫn treo ở hông: không dùng được |

Kết luận sau khi có điểm neo:
- **Dùng được** (khớp hoặc lệch nhẹ, chỉnh bằng chạm điểm neo trong Tách Đồ hoặc "chỉnh theo cặp" trong trang Ghép Trang Bị): 13 áo, 4 cánh, bầu hồ lô, ống tên, gùi tre, 8 bùa, búa tí hon, dấu lửa, dấu nước, mặt nạ hổ.
- **Phải vẽ lại:** áo choàng, khăn choàng sương, trống đồng nhỏ, dấu lá, dấu đô vật, găng đồng.
- Đã soát thêm ở 4 em bé: thân code của cả 4 có cùng dáng, nên đồ khớp ở một em thì khớp ở cả 4.

## Cách đã kiểm

- `node --check` toàn bộ phần script của trang Tách Đồ (tách script rồi `new Function`): không lỗi
- `python3 game/build.py`: chạy được. Các tệp game do nó tạo lại **không** được đẩy lên
- Chạy Tách Đồ thật bằng Chromium cho 5 lô, tải 2 bản qua chính hàm tải của trang
- Xem thử bằng game thật trong Chromium
- Workflow lần đẩy Tách Đồ: xanh

Không sửa `game/js`, không thêm gì vào `game/art/custom/`.
