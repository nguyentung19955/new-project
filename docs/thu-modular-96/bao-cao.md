# Báo cáo: thử ghép trang phục modular 96×96 (Cu Tí mới)

## Rà soát bộ hiện có (16/10, trước khi sửa)

Đã chạy lại `tao-bo.py` trên bản hiện có: ra đúng từng byte các tệp đang có trong repo, nên bộ này tái tạo được.

**Đã hoạt động thật:**

- 13 sheet đều 1152×96, có nền trong suốt, 12 khung, chân chạm y = 90.
- Chồng 9 lớp Cu Tí (không giáp) ra đúng từng điểm ảnh khung chạy trong game, 12/12 khung.
- `kiem-tra.html` tự chứa, vẽ cỡ game (×0,5, tắt làm mượt), chạy/dừng, tua khung, bật/tắt lớp, Debug khớp/neo.
- `data.json` có khớp và điểm neo cho cả 12 khung.

**Mới là minh họa / chưa đúng:**

- **Không thay được quần áo.** Áo đen nằm chung trong lớp `body`, ống quần nằm trong `frontLeg`/`rearLeg`, lớp `pants` chỉ là mẩu nhỏ ở hông, `torsoOutfit` thật ra chỉ là đai đỏ. Không có thân trần, nên mặc đồ khác thì áo/quần cũ vẫn lộ.
- **Giáp ngực chỉ là bật/tắt một mẫu do máy vẽ.** Nó chỉ phủ khoảng 30–65% áo đen tùy khung (khung 2, 3, 6, 9 chỉ còn một dải mỏng), nên áo cũ lộ quanh giáp.
- **Thứ tự vẽ sai:** giáp vai sau nằm trên giáp ngực (trông như dán lên ngực); giáp vai trước bị bắp tay trước đè.
- **Danh sách lớp bị khai báo hai lần:** trang HTML tự gõ lại `LAYER_ORDER` và danh sách giáp thay vì đọc `DATA.layerOrder`.
- **Kiểm tra ghép lại chỉ in chữ:** nếu ảnh lệch, `tao-bo.py` vẫn kết thúc "thành công" (mã thoát 0).
- **Chưa kiểm tra sheet:** không có bước nào kiểm kích thước, số khung, kênh trong suốt hay pivot. Nếu một sheet tải lỗi, trang chỉ lặng lẽ bỏ lớp đó, không báo gì.

Mọi thứ nằm trong `docs/thu-modular-96/`. Code game không đổi. Chạy lại tất cả bằng lệnh `python3 docs/thu-modular-96/tao-bo.py`, mất khoảng 2 giây.

## Xem nhanh

- **`kiem-tra.html`** là một tệp duy nhất, ảnh đã nhúng sẵn, mở được trên điện thoại. Trang có:
  - nút chạy/dừng và tua ◀ ▶ từng khung;
  - phóng ×2, ×4, ×8 (điểm ảnh sắc nét);
  - bật/tắt riêng 13 lớp;
  - nút mặc/cởi giáp mẫu;
  - nút **Debug**: vẽ khung 96×96, chữ thập đỏ ở điểm neo bàn chân (48,90), chấm khớp (đỏ = bên trước, xanh = bên sau), que nối khớp và ô tím ở các điểm neo đồ;
  - bảng toạ độ khớp của khung đang xem.
- **`sheets-luoi.png`**: lưới gồm 13 lớp × 12 khung, thêm hàng "ghép Cu Tí" và hàng "ghép + giáp". Ảnh phóng ×2, đường xanh là mặt đất y = 90.

## Đã làm

1. **Quy cách**: mỗi khung 96×96, neo bàn chân ở (48,90), SCALE 0.5, `imageSmoothingEnabled = false`. Mỗi lớp là một ảnh PNG ngang 1152×96 (12 khung × 96), nền trong suốt, nằm trong `sheets/<tên lớp>.png`. Mọi lớp có cùng số khung và cùng cách căn.
2. **Thứ tự lớp** dùng đúng tên: rearLeg, rearArm, body, pants, torsoOutfit, chestArmor, backShoulderArmor, frontLeg, frontShoulderArmor, frontArm, forearmArmor, head, hair.
3. **Nhân vật mẫu là Cu Tí mới, chạy sang phải, 12 khung.**
   - Nguồn ảnh: hàng `chay` (hàng 2) trong `game/art/custom/zed-moi.sprite.json`, tức đúng hình game đang vẽ. Hàng này vốn đã là khung 96×96, chân chạm y = 90, nên mình dùng nguyên điểm ảnh, không vẽ lại và không xoay.
   - Để tách lớp cho chuẩn, mình dùng ảnh gốc độ phân giải cao của chính hàng đó: `docs/anh-goc/zed/moi/03-chay-v4-gif/03-chay-v4/khung-01..12.png`.
   - Cách tách: đánh khớp bằng tay trên ảnh lớn (`khop-nguon.json`), chia điểm ảnh theo xương gần nhất và theo màu (da, đai đỏ, tóc), rồi thu về ô 96. Mỗi điểm ảnh 96 chỉ thuộc một lớp.
   - **Kiểm tra:** chồng 9 lớp của Cu Tí lại cho ra đúng từng điểm ảnh của khung game, 12/12 khung. Trong lúc chạy, `tao-bo.py` tự so lại và sẽ báo lỗi nếu lệch.
   - Không dùng Cu Tí cũ (zed-v2-canonical, Xưởng Rối, khung xương chibi cũ).
4. **Giáp ngực mẫu**: 4 lớp chestArmor, backShoulderArmor, frontShoulderArmor và forearmArmor. Màu thép xanh, viền đồng. Mỗi khung được vẽ riêng bằng điểm ảnh, không xoay sprite:
   - giáp ngực lấy đúng bề ngang thân của khung đó, từ cổ xuống mép trên đai, phủ cả phần thân nằm dưới tay trước; có cổ đồng, 2 đường nối lá giáp, sáng phía ngực và tối phía lưng;
   - giáp vai là vỏ úp trên khớp vai, hướng theo bắp tay của khung đó;
   - giáp cẳng tay chạy từ dưới khuỷu tới cổ tay trước.
5. **`data.json`** ghi cho từng khung, toạ độ tính trong ô 96 với gốc ở góc trên-trái:
   - khớp: cổ, tâm mặt, đỉnh tóc, cằm, vai, khuỷu, cổ tay, nắm tay, hông, gối, cổ chân và mũi chân (mỗi khớp có bản trước và sau), giữa hông, eo, mép trên đai;
   - điểm neo: áo, giáp ngực, quần, tóc, mũ, đai, lưng, đồ cầm ở hai tay, giáp vai trước/sau, giáp cẳng tay;
   - thêm thứ tự lớp, đường dẫn sheet, pivot, scale, fps (20) và tên tiếng Việt của từng khớp.
6. **`kiem-tra.html`** có hàm `drawLayer` / `drawCharacter` theo mẫu: cắt `frame*96` từ sheet, đặt theo pivot, nhân SCALE 0.5. Nút "Soi ảnh 96 gốc" chỉ để soi ở cỡ nguồn và không ảnh hưởng gì tới hàm vẽ.

## Cách chia lớp (cần chủ dự án duyệt)

- **Tay trước / tay sau.** Ảnh gốc không đổi tay giữa chu kỳ: tay đấm ra trước luôn là cùng một tay. Mình đặt:
  - **frontArm** = tay lộ bắp tay trần, vẽ đè lên thân;
  - **rearArm** = tay đấm ra trước. Bắp tay này khuất sau thân, nên lớp này chỉ có cẳng tay và nắm đấm.
- **Chân trước / chân sau** là cùng một chân trong suốt 12 khung. Chân trước là chân trụ ở khung 0.
- **body** = thân kèm áo đen. Áo vẽ liền người, ảnh gốc không có thân trần, nên tắt lớp này sẽ thấy trống.
- **torsoOutfit** = đai đỏ và hai dải đai bay.
- **pants** = phần quần ở hông. Ống quần nằm trong frontLeg/rearLeg, vì Cu Tí không có chân trần để lộ ra.
- **head** = mặt, tai, mắt. **hair** = toàn bộ tóc, kể cả mái che trán.

## Chỗ còn lệch / giới hạn

- **Khớp đánh bằng mắt** trên ảnh lớn rồi quy đổi, nên có thể sai khoảng ±1–2 điểm ảnh ô 96. Lệch nhiều nhất là khuỷu và vai tay sau (bị thân che) và gối của chân đá ra sau.
- **Đường cắt giữa các lớp** đôi chỗ răng cưa: chỗ tay trước bắt chéo ngực (khung 1–3, 5–6, 8–9), chỗ dải đai bay đè lên chân sau. Khi chồng đủ lớp thì không thấy, chỉ lộ khi tắt riêng một lớp.
- **Thứ tự lớp theo quy cách** làm giáp vai trước (lớp 9) bị bắp tay trước (lớp 10) đè một phần. Giáp vai sau (lớp 7) lại nằm trên giáp ngực, nên trông như dán lên ngực. Nếu muốn giáp vai luôn lộ thì nên đưa frontShoulderArmor lên sau frontArm.
- **Neo bàn chân:** khung đặt giống game, tức căn ngang theo tâm đầu để người không giật tới lui. Vì vậy chân trụ không phải lúc nào cũng nằm đúng x = 48. Đáy bàn chân luôn chạm y = 90.
- **SCALE 0.5 khi tắt làm mượt** chỉ giữ 1 trong 4 điểm ảnh. Sheet 96 có chi tiết ở từng điểm ảnh, nên ở cỡ 48×48 nét mảnh như viền giáp hay đinh tán có khung bị mất hoặc nhảy. Bật nút "Soi ảnh 96 gốc" để so.
- **Giáp mẫu do máy vẽ** từ khớp (đúng từng khung, khớp thân) nhưng còn đơn giản. Nếu vẽ tay hoặc gen ảnh thì nên dùng `sheets-luoi.png` và `data.json` làm khuôn.

## Gợi ý bước tiếp

1. Chủ dự án xem `kiem-tra.html` với Debug bật, chỉ ra khung nào lệch khớp. Sửa `khop-nguon.json` rồi chạy lại `tao-bo.py`.
2. Chốt cách chia lớp: tay nào là tay trước, quần gộp vào chân hay tách riêng, có cần lớp thân trần không. Chốt luôn thứ tự giáp vai.
3. Gen hoặc vẽ một bộ giáp thật theo khuôn 96×96: mỗi khung một ô, đặt theo các neo trong `data.json`. Sau đó thay vào `sheets/chestArmor.png` để thử ngay trên trang.
4. Nếu ổn, làm tiếp cho các hàng đứng và đi (cũng là khung 96, chân ở 48,90, cùng nguồn `docs/anh-goc/zed/moi/`).
5. Chỉ khi chủ dự án đồng ý mới tính tới việc đưa lớp vào game.

## Tệp

| Tệp | Là gì |
|---|---|
| `kiem-tra.html` | trang kiểm tra tự chứa |
| `sheets-luoi.png` | lưới lớp × khung |
| `sheets/*.png` | 13 sprite sheet 1152×96 |
| `data.json` | khớp, neo, thứ tự lớp |
| `khop-nguon.json` | khớp đánh tay trên ảnh nguồn lớn (sửa ở đây) |
| `tao-bo.py`, `tach_lop.py` | công cụ dựng lại |
| `kiem-tra.tmpl.html` | khuôn trang (tao-bo.py nhúng dữ liệu vào) |
