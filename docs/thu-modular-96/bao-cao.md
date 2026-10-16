# Báo cáo: thử thay trang phục modular 96×96 (Cu Tí mới, hàng chạy 12 khung)

Mọi thứ nằm trong `docs/thu-modular-96/`. Code game và ảnh nguồn không bị sửa.

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

## Kết quả sau khi sửa (16/10)

**Đã thay được áo và quần thật trên nhân vật đang chạy, đủ 12 khung.** Có thể đổi riêng áo, riêng quần, hoặc cả bộ.

| Kiểm tra (tự chạy mỗi lần dựng) | Kết quả |
|---|---|
| Ghép nền + đồ gốc so với ảnh game | khớp từng điểm ảnh, 12/12 khung |
| Áo mới + quần gốc: đồ gốc hoặc thân trần còn lộ | 0 điểm ảnh, 12/12 khung |
| Áo gốc + quần mới: đồ gốc hoặc thân trần còn lộ | 0 điểm ảnh, 12/12 khung |
| Cả bộ mới: đồ gốc hoặc thân trần còn lộ | 0 điểm ảnh, 12/12 khung |
| Chỉ còn nền cơ thể (cởi hết đồ): lỗ trong suốt trên thân | 0 điểm ảnh, 12/12 khung |
| 22 sheet: 1152×96, có alpha và nền trong suốt, đủ 12 khung, nằm đúng khung nhân vật, chân chạm y = 90 | đạt hết |

Xem bằng mắt:

- **`so-sanh-do.png`**: 6 hàng × 12 khung, phóng ×4. Các hàng: ảnh game gốc, nền cơ thể, áo mới + quần gốc, áo gốc + quần mới, đồ mới đầy đủ, và hàng "đồ gốc còn lộ" (nếu lộ thì tô đỏ; hiện không có điểm đỏ nào).
- **`chay-goc-moi.gif`**: nhân vật chạy, ba bản đặt cạnh nhau: đồ gốc, đồ mới, đồ mới + giáp.
- **`kiem-tra.html`**: mở trên điện thoại được. Có nút **Áo: Gốc / Mới / Không**, **Quần: Gốc / Mới / Không** và **Đổi cả bộ gốc ⇄ mới**. Bấm được cả khi nhân vật đang chạy.

### Cách làm từng mục

1. **Chuẩn khung giữ nguyên.** Khung 96×96, 12 khung, pivot (48,90), hiển thị 48×48 (SCALE 0,5), `imageSmoothingEnabled = false`.
2. **Tách nền cơ thể và quần áo.**
   - **Nền cơ thể** gồm 7 lớp: `rearLeg`, `rearArm`, `body`, `frontLeg`, `frontArm`, `head`, `hair`. Đầu, tóc, tay, cổ và bàn chân lấy nguyên điểm ảnh gốc. Phần thân và chân nằm dưới áo/quần thì ảnh gốc không có, nên mình **dựng thân trần**: tô màu da và khố vải xám vào đúng hình bóng áo/quần gốc của từng khung. Phần này chỉ để không lộ lỗ; đồ luôn phủ lên trên.
   - **Trang phục** gồm 2 ô thay được:
     - **Áo** = `torsoOutfit` (áo) + `belt` (đai và hai dải bay);
     - **Quần** = `rearPants` (ống quần sau) + `pants` (phần hông) + `frontPants` (ống quần trước).
   - Áo đen, đai đỏ, quần đen gốc nay là bộ **"goc"** trong `sheets/do-goc/`.
   - Thân trần chỉ tô **bên dưới** lớp đồ, và chỉ ở chỗ đồ gốc đặc hẳn. Vì vậy ghép với đồ gốc vẫn ra đúng ảnh game, kể cả viền mờ.
3. **Bộ đồ mới** ở `sheets/do-moi/`, gồm áo chàm có cổ và nẹp trắng, đai vàng đồng, quần kaki quấn xà cạp trắng ở ống chân.
   - Máy vẽ từng điểm ảnh cho từng khung, dựa theo `data.json` (gối, cổ chân, cổ, eo), không xoay sprite.
   - Đồ mới phủ kín hình bóng đồ gốc của cùng khung và giữ các nếp gấp sáng/tối của đồ gốc. Vạt áo dài thêm xuống ngang hông.
4. **Thứ tự vẽ** (17 lớp, số nhỏ vẽ trước):
   `rearLeg, rearPants, rearArm, backShoulderArmor, body, pants, torsoOutfit, belt, chestArmor, frontLeg, frontPants, frontShoulderArmor, frontArm, frontShoulderArmorTop, forearmArmor, head, hair`.
   - Giáp vai sau nay nằm **sau thân** và sau giáp ngực.
   - Giáp vai trước được **tách làm hai lớp**. Phần nào bị cẳng tay hoặc nắm tay trước đi ngang qua thì nằm dưới tay (`frontShoulderArmor`); phần còn lại nằm trên bắp tay (`frontShoulderArmorTop`). Việc tách tính riêng cho từng khung. Ở hàng chạy này, tay trước chỉ đi ngang vai ở khung 5 (1 điểm ảnh), các khung khác giáp vai nằm trọn trên bắp tay.
   - Giáp ngực vẽ lại theo vùng thân trần, nhưng vẫn là giáp mẫu: nó chỉ phủ khoảng 50–75% phần áo phía trên đai (khung 1–3, 6, 9 vẫn hẹp). Lần này mình chưa sửa giáp ngực vì không nằm trong yêu cầu.
5. **Một nguồn thứ tự duy nhất.** `kiem-tra.html` dùng `const LAYER_ORDER = DATA.layerOrder`. Danh sách lớp, ô đồ, loại lớp (nền/đồ/giáp) cũng đều đọc từ `data.json`, không gõ lại ở đâu.
6. **Lỗi thật.** Nếu ghép nền + đồ gốc khác ảnh game, hoặc đồ mới để lộ đồ gốc/thân trần, hoặc sheet sai, `tao-bo.py` in danh sách lỗi rồi `raise SystemExit(1)` (mã thoát 1).
   - Phép so được làm hai lần: một lần trong bộ nhớ, và một lần **đọc lại các tệp PNG trên đĩa** rồi so với hàng chạy đọc lại từ game.
   - Đã thử cố ý làm hỏng một sheet: script dừng với mã 1 và báo "khung 5: … khác ảnh game 91 điểm ảnh".
7. **Kiểm tra sheet.**
   - `tao-bo.py` đọc lại từng tệp và kiểm: kích thước 1152×96, có kênh alpha, có nền trong suốt, không khung nào trống, không điểm ảnh nào nằm lệch ra ngoài nhân vật (dấu hiệu sai pivot), và chân chạm đúng y = 90 ở mọi bộ đồ.
   - Trang `kiem-tra.html` cũng tự kiểm khi mở. Nếu sheet thiếu, tải lỗi, sai kích thước hoặc không có nền trong suốt, đầu trang hiện **khung đỏ** liệt kê lỗi. Đã thử với một tệp cố ý hỏng (xoá một ảnh, thay một ảnh 1×1): khung đỏ hiện đúng 2 lỗi.

## Cách chạy

```
python3 docs/thu-modular-96/tao-bo.py
```

- Cần Python 3 với `numpy`, `pillow`, `scipy`. Chạy mất khoảng 5 giây.
- Chạy đúng thì in dòng `xong: …` và thoát mã 0. Có lỗi thì in `LỖI …` và thoát mã 1.
- Khi bị lỗi, thư mục `sheets/` có thể đã bị ghi dở. Lấy lại bản cũ bằng `git checkout -- docs/thu-modular-96`.
- Mở `kiem-tra.html` bằng trình duyệt; không cần mạng.

## Tệp nào cần nằm trong repo

**Đầu vào (chỉ đọc, phải có):**

- `game/art/custom/zed-moi.sprite.json` (hàng `chay`);
- `docs/anh-goc/zed/moi/03-chay-v4-gif/03-chay-v4/khung-01..12.png`;
- `docs/thu-modular-96/khop-nguon.json`.

**Công cụ:**

| Tệp | Là gì |
|---|---|
| `tao-bo.py` | dựng lại tất cả và chạy mọi kiểm tra |
| `tach_lop.py` | tách lớp trên ảnh nguồn lớn |
| `trang_phuc.py` | chia nền / đồ, dựng thân trần, vẽ đồ mới; chứa thứ tự lớp duy nhất |
| `nap-anh-gen.py` | nạp ảnh gen thành bộ đồ mới |
| `kiem-tra.tmpl.html` | khuôn trang kiểm tra |

**Đầu ra (dựng lại được, vẫn giữ trong repo để xem ngay):**

| Tệp | Là gì |
|---|---|
| `sheets/*.png` | nền cơ thể và giáp mẫu |
| `sheets/do-goc/*.png`, `sheets/do-moi/*.png` | hai bộ trang phục |
| `data.json` | khớp, neo, thứ tự lớp, bộ đồ, kết quả kiểm |
| `kiem-tra.html` | trang kiểm tra tự chứa |
| `sheets-luoi.png` | lưới mọi lớp × 12 khung |
| `so-sanh-do.png`, `chay-goc-moi.gif` | ảnh soát và GIF chạy |
| `mau-gen/*.png` | ảnh mẫu để gửi kèm khi gen |
| `do-gen/<tên>/` | chỉ có khi đã nạp ảnh gen |

## Giới hạn còn lại

- **Đồ mới do máy vẽ còn thô.** Hình bóng giữ gần giống đồ gốc (chỉ dài thêm vạt áo); khác chủ yếu ở màu, nẹp, đai và xà cạp. Muốn kiểu dáng khác hẳn (áo choàng, giáp to) thì nên gen ảnh, xem mục dưới.
- **Thân trần dựng lại rất đơn giản**: da phẳng và khố xám, không có cơ bắp. Nó chỉ để không lộ lỗ, vì lúc nào cũng có đồ phủ lên. Bấm "Không (nền)" sẽ thấy rõ.
- **Ở "Không (nền)", phần dải đai bay ngoài người sẽ biến mất** (13–53 điểm ảnh tuỳ khung), vì dải đai thuộc bộ áo. Điều này là đúng ý đồ.
- **Tay chưa có lớp áo.** Bao cổ tay đen vẫn thuộc nền. Muốn áo có tay áo thì cần thêm lớp tay áo nằm trên `frontArm`/`rearArm`.
- **Giáp vai sau gần như bị thân che hết** khi chạy sang phải. Thứ tự này đúng, nhưng giáp vai sau ít khi thấy.
- **Script nạp ảnh gen** co phần hình trong mỗi ô cho vừa đúng khung bao của đồ gốc cùng khung. Đồ gen rộng hơn đồ gốc nhiều sẽ bị co lại, và điểm ảnh lạc xa thân quá 3 điểm ảnh sẽ bị bỏ.
  - Đã thử chạy vòng: dựng ảnh "gen" giả từ bộ áo mới, phóng ×4, đặt lệch, trên nền xanh, rồi nạp lại. Kết quả 0 điểm hở, khác bản gốc 20/2188 điểm ảnh, kiểm tra vẫn đạt.
  - Chưa thử với ảnh gen thật.
- **Khớp vẫn đánh bằng mắt**, sai khoảng ±1–2 điểm ảnh, nên xà cạp và cổ áo có khung hơi nhảy.
- **Ở cỡ game 48×48**, nét mảnh (nẹp, viền) có khung bị mất. Bấm "Soi ảnh 96 gốc" để xem rõ.
- Mới làm hàng chạy. Hàng đứng/đi chưa làm, và chưa đưa vào game.

## Prompt gen ảnh (nếu muốn đồ đẹp hơn bản máy vẽ)

Yêu cầu ảnh gen: **1 hàng 12 ô vuông, mỗi ô 384×384 (cả ảnh 4608×384), nền xanh #00FF00, không chữ, không bóng.**

**Prompt 1 – áo:**
> Pixel art sprite sheet, one row of 12 square cells (4608×384 total), flat #00FF00 background, no text, no shadow, no body. Only the upper clothing of a small chibi boy running to the right: a sleeveless brown leather vest with bronze buckles and a cloth belt whose two sash ends fly behind. In each cell, the clothing must exactly fill the magenta shape of the same cell in the reference image. Crisp hard pixels, 1-pixel dark outline, 3-tone shading.

**Prompt 2 – quần:**
> Pixel art sprite sheet, one row of 12 square cells (4608×384 total), flat #00FF00 background, no text, no shadow, no body, no shoes. Only the trousers of a small chibi boy running to the right: loose dark-green martial-arts trousers tied at the ankles. In each cell, the trousers must exactly fill the magenta shape of the same cell in the reference image. Crisp hard pixels, 1-pixel dark outline, 3-tone shading.

**Prompt 3 – áo giáp (biến thể):**
> Same layout and rules as before: 12 cells in one row, #00FF00 background, no text, no shadow. Only a light steel chest plate with red cloth belt and two flying sash ends, matching the magenta shape in each cell of the reference.

**Gửi kèm:**

- `mau-gen/vung-phu-ao.png` (với prompt 1 và 3) hoặc `mau-gen/vung-phu-quan.png` (với prompt 2): vùng đồ cần phủ ở từng khung, tô hồng.
- `mau-gen/nen-co-the.png`: hàng nền cơ thể.
- `mau-gen/do-goc.png`: đồ gốc để làm mẫu dáng.
- `sheets-luoi.png`: lưới lớp × khung.

**Nạp ảnh gen vào:**

```
python3 docs/thu-modular-96/nap-anh-gen.py ANH-GEN.png --o ao --ten ao-da --nhan "Áo da (gen)"
python3 docs/thu-modular-96/tao-bo.py
```

Sau đó trong `kiem-tra.html` sẽ có thêm nút `gen-ao-da` ở hàng Áo. Nếu bộ gen để lộ đồ gốc, `tao-bo.py` báo lỗi và dừng.

## Cách chia lớp cũ còn giữ (cần chủ dự án duyệt)

- **Tay trước** = tay lộ bắp tay trần, vẽ đè lên thân. **Tay sau** = tay đấm ra trước, bắp tay khuất sau thân.
- **Chân trước** = chân trụ ở khung 0. Mỗi chân giữ nguyên vai trò trước/sau suốt 12 khung.
- **Neo bàn chân:** khung đặt giống game, căn ngang theo tâm đầu. Vì vậy chân trụ không phải lúc nào cũng ở đúng x = 48, nhưng đáy chân luôn chạm y = 90.

## Thử rig gắn giáp lên khớp (16/10)

- Đây là thử nghiệm riêng, nằm trong `rig/`. Chi tiết ở **[`rig/bao-cao-rig.md`](rig/bao-cao-rig.md)**, trang xem là `rig/kiem-tra-rig.html`.
- **Cả chu kỳ 12 khung chỉ dùng 6 ảnh giáp** (giáp vai, cẳng tay, ống chân + chụp vai, khuỷu, gối), dùng chung cho cả bên trước và bên sau. Code xoay/đặt các ảnh này theo khớp trong `data.json`; không dùng sheet giáp 12 khung.
- Giáp bám khớp 11/12 khung khi xoay liên tục và 9/12 khung khi làm tròn 8 hướng. Chụp khớp giảm điểm ảnh hở từ 48 xuống 12.
- **Giới hạn:** xoay pixel art nhỏ làm rơi điểm ảnh và nhấp nháy (ở 8 hướng còn nhảy 45°). Ở cỡ 48×48, mảnh giáp gần như chỉ còn một chấm màu.
