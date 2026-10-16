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
  - Ảnh gen thật của chủ game (cùng cỡ tấm gốc, vẽ cả người) dùng script riêng `nap-do-gen-that.py`, xem mục **Nạp đồ gen** ở dưới.
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
- **Giáp gen thật (bộ "Gen")**: 4 mảnh trong `anh-gen/giap-roi-4-manh.png` đã được cắt, thu nhỏ giữ nét (bảng 8 màu, giữ viền đen + đai đồng) và gắn thử. Trên trang có nút chọn bộ **Máy vẽ / Gen** và ô xem **×2 (192)** (chỉ để so sánh).
  - Cả chu kỳ dùng **7 ảnh** (4 mảnh + 3 chụp khớp). Xoay liên tục bám khớp **12/12 khung**. Làm tròn 8 hướng chỉ **4/12**, giáp ngực nhảy 45° ở 8 khung.
  - **Ở cỡ game 48×48, mảnh gen chỉ còn 4×2 đến 6×6 điểm ảnh**, gần như mất hết chi tiết gen. Đề xuất: vẽ mảnh ở đúng cỡ nhỏ, hoặc chỉ dùng rig cho món to (giáp ngực, khiên, áo choàng). Chi tiết ở mục "Giáp gen thật" trong `rig/bao-cao-rig.md`.

## Nạp đồ gen (16/10)

**Đã đưa 3 loại ảnh gen của chủ game vào nhân vật đang chạy, đủ 12 khung.** Trên `kiem-tra.html`, khung **Bộ đồ** có các nút: **Gốc / Đồ xanh (gen) / Giáp (gen, tách từ cu-ti-giap) / Giáp 1 ảnh + neo / Đồ máy vẽ (lần 2) / Máy vẽ + giáp máy vẽ**, cộng 2 nút **Ảnh gen thô** để so với ảnh gen chưa tách. Bấm được khi nhân vật đang chạy.

Chạy lại: `python3 docs/thu-modular-96/nap-do-gen-that.py` rồi `python3 docs/thu-modular-96/tao-bo.py` (khoảng 20 giây). Các mục của lần 2 (nền cơ thể, ô áo/quần, kiểm lỗi) giữ nguyên; đồ gen chỉ là thêm bộ đồ và bộ giáp mới.

### Cách đưa ảnh gen về ô 96

- Ảnh gen **cùng cỡ tấm** với `03-chay-v4.png` (2172×724) nhưng **hình người không nằm cùng chỗ, không cùng cỡ**: đồ xanh nhỏ hơn bản gốc (phải phóng ×1,31–1,40), Cu Tí giáp nhỏ hơn nhiều (phóng ×2,29–2,32). Vì vậy không cắt thẳng theo `khung_bao` của tấm gốc được.
- Cách làm từng khung: tách nền xanh → lấy 12 hình trái → phải → dò **tỉ lệ + dời (không xoay)** cho hình bóng khớp nhất với khung nguồn cùng số → co về ô 96 **đúng cách game co/đặt khung đó** (`tach_lop.quy_doi`: co BOX theo SK, đặt DAT, chân ở (48,90)) → nhích ±3 điểm ảnh cho khớp hình bóng game nhất.
- Hình đã kéo về ô 96 lưu ở `anh-gen-96/` (nút "Ảnh gen thô" trên trang).

**Khớp hình bóng với hàng chạy trong game** (IoU, 1 = trùng khít):

| Ảnh gen | Khớp | Khung lệch dáng rõ (IoU < 0,83) |
|---|---|---|
| Cu Tí đồ xanh | 0,81–0,88 | **khung 2, 3, 5, 11** (khung 3 thấp nhất 0,81). Đầu ảnh gen to hơn so với thân, chân sau và dải đai bay lệch chỗ. |
| Cu Tí mặc giáp | 0,89–0,92 | không khung nào. Ảnh này bám dáng game tốt nhất. |

### Đồ xanh (gen) → bộ đồ `gen-xanh` (áo + đai + quần)

- Tách đồ bằng **màu**: xanh trên mép đai = áo (cả nẹp trắng), xanh dưới mép đai = quần, nâu sát đai gốc = đai. Nét viền tối nằm trong vùng đồ gốc cũng lấy theo.
- Mỗi ô (áo, quần) **phủ ít nhất đúng vùng đồ gốc của ô đó** ở cùng khung. Chỗ ảnh gen lệch dáng không phủ tới thì lấp bằng màu đồ gen gần nhất. Nhờ vậy:
  - **Đồ cũ (áo đen, quần đen) còn lộ: 0 điểm ảnh; thân trần lộ: 0**, ở cả 12 khung và cả khi đổi riêng áo hoặc riêng quần (tao-bo.py tự kiểm, sai là dừng).
- **Chỗ phải lấp vì ảnh gen lệch dáng: 1304 / 5441 điểm đồ nhìn thấy (24%)**, nhiều nhất khung 5 (142) và khung 11 (138), ít nhất khung 7 (65). Phần lấp nằm chủ yếu ở viền đồ, phần đai dưới và ống quần sau. Hàng vàng trong `so-sanh-gen.png` chỉ rõ từng điểm.
- Nhìn chung bộ đồ xanh đọc rõ là áo võ xanh, quần xanh đậm, đai nâu, chạy liền mạch. Nét viền chỗ lấp hơi mờ hơn chỗ lấy thẳng từ ảnh gen.

### Giáp (gen, tách từ cu-ti-giap) → bộ giáp `gen-tach`

- Đây là nguồn giáp chính. Giáp được tách bằng **so khác biệt với Cu Tí gốc cùng khung** + màu giáp (đồng/thép, không phải đen, không phải đỏ đai, không phải da ở chỗ gốc cũng là da). Chỉ tìm trong thân trên (cổ → mép trên đai) và quanh hai vai.
- Chia lớp theo chỗ gần nhất: `chestArmor` (ngực), `frontShoulderArmor` / `frontShoulderArmorTop` (vai trước, tách dưới/trên tay như lần 2), `backShoulderArmor` (vai sau). Giáp tách được 81–126 điểm ảnh mỗi khung.
- **Áo đen còn lộ ở thân trên khi có giáp: 552 / 1001 điểm.** Lý do chính: trong chính ảnh gen, giáp chỉ là một tấm nhỏ ở ngực + vai, phần áo đen dưới giáp vẫn lộ (ảnh gen cũng vậy). Giáp máy vẽ phủ nhiều hơn (còn lộ 279) nhưng là giáp mẫu.
- Ảnh gen này nhỏ (người cao 120 điểm ảnh trên tấm), có nhoè, nên giáp tách ra còn vụn ở mép; ở cỡ game 48×48 chỉ còn một mảng nâu xám trên ngực.

### Giáp 1 ảnh + neo (`giap-chay-12-a/-b.png`) → bộ giáp `gen-mot-anh`

- Chọn **1 khung**: bản **b, khung 1** (nghiêng 3/4 sang phải, vai trước rõ; ở bản b khung 5 và 11 nhìn thẳng, bản a mọi khung nghiêng nhiều và có chỗ nền xanh lọt vào lòng giáp).
- Cắt nền, co về cỡ thân (cao bằng giáp tách trung bình: 11×10 điểm ảnh ở ô 96), rồi đặt vào từng khung theo **neo `chestArmor` trong data.json** (độ lệch tâm ảnh ↔ neo đo ở khung 0 rồi giữ nguyên). **Chỉ dời, không xoay điểm ảnh.** Ảnh đã co ở `giap-gen/mot-anh/anh-goc-da-co.png`.
- **So với bản tách** (xem cạnh nhau ở `so-sanh-gen.png`, `chay-gen.gif`, hoặc bấm 2 nút trên trang):
  - Ưu: 1 ảnh dùng cho cả 12 khung, nét giữ nguyên, không vụn mép. Áo đen còn lộ 408 / 1001, ít hơn bản tách (552) vì tấm luôn nằm giữa ngực.
  - Nhược: tấm giáp **cứng đơ**, không nghiêng theo thân, không co giãn theo vai/tay, nên ở các khung thân ngả về trước trông như dán lên. Vai trước không ôm bắp tay như bản tách. Ở cỡ 48×48 cũng chỉ còn mảng màu khoảng 6×5 điểm ảnh.
  - Nhận xét: món cứng 1 ảnh + neo **dùng được cho đồ nhỏ, cứng, ít đổi dáng** (huy hiệu, mũ, đồ lưng). Giáp ngực/vai ôm thân thì bản tách theo từng khung tự nhiên hơn, nhưng đòi ảnh gen 12 khung bám dáng.

### Tệp mới

| Tệp | Là gì |
|---|---|
| `nap-do-gen-that.py` | căn ảnh gen về ô 96, tách đồ xanh, tách giáp, dựng giáp 1 ảnh + neo |
| `nap-gen-that.json` | số liệu: tỉ lệ, IoU, điểm phải lấp, điểm giáp từng khung |
| `anh-gen-96/*.png` | ảnh gen đã kéo về ô 96 (1152×96) |
| `do-gen/xanh/`, `giap-gen/tach/`, `giap-gen/mot-anh/` | đầu ra của script (tao-bo.py tự nhận) |
| `sheets/do-gen-xanh/`, `sheets/giap-gen-*/` | sheet đã kiểm (1152×96, alpha, nằm đúng khung/pivot) |
| `so-sanh-gen.png` | ảnh soát 12 khung ×4: gốc, ảnh gen kéo về, đồ xanh, chỗ lấp (vàng), giáp tách / 1 ảnh / máy vẽ với áo đen còn lộ (đỏ) |
| `chay-gen.gif` | GIF chạy: gốc, đồ xanh, giáp tách, giáp 1 ảnh + neo |

## Hiển thị nét (16/10)

Trang `kiem-tra.html` cũ bị nhoè trên điện thoại vì canvas nhỏ rồi bị CSS kéo giãn (`max-width:100%; height:auto`) theo tỉ lệ lẻ, và chưa tính mật độ điểm ảnh của màn hình (DPR). Đã sửa:

1. **Canvas vẽ theo devicePixelRatio.** Kích thước thật của canvas = kích thước CSS × DPR, phóng to bằng **số nguyên** điểm ảnh màn hình cho mỗi điểm ảnh nhân vật. `image-rendering: pixelated` và `imageSmoothingEnabled = false` ở mọi canvas (đặt lại sau mỗi lần đổi cỡ). Không còn CSS co giãn canvas: script tự tính hệ số phóng vừa bề ngang, vẽ lại khi xoay máy/đổi cỡ cửa sổ.
2. **Mặc định nhân vật to gần hết bề ngang.** Hai ô **"Cỡ game 48×48"** và **"Soi 96 gốc"** đặt cạnh nhau trên màn rộng, trên/dưới trên điện thoại. Ô vẽ được cắt sát nhân vật (vùng cắt tính tự động từ mọi sheet). Hai ô cùng cỡ để dễ so.
3. **Xem chậm** ×0,25 / ×0,5 / ×1 và **12 khung cùng lúc** dạng lưới to (cỡ game hoặc ảnh 96), ô hồng là khung đang xem.
4. **Đổi nền**: ca rô / trắng / đen / xanh lá.
5. Ô "Cỡ game" vẫn vẽ đúng quy cách game: ô 96×96, pivot (48,90), SCALE 0,5, `drawCharacter` / `drawLayer` giữ nguyên mã; chỉ phóng ảnh đã vẽ lên bằng số nguyên.

**Kiểm bằng Chromium headless** (ảnh ở `soat-hien-thi/`):

- 390×844, DPR 3: canvas 936×1260 điểm ảnh thật cho 312×420 điểm CSS (đúng ×3), 1 điểm ảnh 96 = 14 điểm ảnh màn hình, 1 điểm ảnh cỡ game = 28. Trang không tràn ngang, chữ và nút không tràn khung.
- 1280×800, DPR 1: hai ô cạnh nhau 416×560, 1 điểm ảnh 96 = 8 điểm ảnh màn hình.
- Đo độ nét trên ảnh chụp: khoảng 94% điểm ảnh trùng màu với điểm bên phải (đúng với khối vuông 14–16 điểm, không có màu nội suy giữa các khối).
- Có ảnh `TRUOC-...-trang-cu.png` chụp trang cũ ở cùng cỡ để so.
- Không có lỗi JavaScript, khung đỏ báo lỗi sheet không hiện.

## Hướng tiết kiệm ảnh (đề xuất, chưa làm)

Game có **28 hàng động tác, 173 khung** (đứng 8, đi 8, chạy 12, lộn 6, trúng đòn 4, chết 8, chưởng 6, kiếm 5+5+6, thương 6+6+6+6+3+4, búa 8+4+6, phi tiêu 6+3+6, đỡ đòn 4×6, đấm 5, chạy 2 tay 12). Gen mỗi bộ đồ cho cả 173 khung rất tốn và khó giữ dáng. Ba hướng, từ rẻ đến đắt:

### 1. Đổi màu bộ đồ gốc bằng bảng màu (0 ảnh gen)

- Giữ nguyên hình, chỉ thay màu áo/quần/đai theo dải sáng → tối mới. Làm được cho **cả 28 động tác cùng lúc**, chi phí gần như bằng 0, dáng luôn đúng.
- Đã thử nhanh trên hàng chạy: `doi-mau-chay.png` (script `doi-mau-thu.py`): áo/quần đen → chàm, đai đỏ → vàng đồng.
  - **Hàng 2 (đổi theo mặt nạ lớp đồ): đẹp, đúng.**
  - **Hàng 3 (đổi theo màu thuần, không mặt nạ): tóc, mắt, viền cũng bị đổi** vì tóc Cu Tí cũng đen, mắt cũng đỏ.
- Vì vậy cần một trong hai: (a) **mặt nạ đồ** cho mọi khung (như lớp đồ gốc của hàng chạy, phải tách cho 161 khung còn lại; tách bán tự động bằng màu + vị trí, soát tay), hoặc (b) vẽ lại đồ gốc bằng **bảng màu riêng** (màu áo khác mã màu tóc dù nhìn giống nhau), rồi trong game đổi màu theo bảng.
- Giới hạn: chỉ đổi màu, không đổi kiểu dáng (không thêm tay áo, vạt dài, giáp).
- Ước lượng: mặt nạ đồ cho 28 hàng khoảng 1–2 ngày làm (tự động + soát), sau đó mỗi bộ màu mới chỉ là một bảng màu.

### 2. Món cứng: 1 ảnh, 3–4 góc + neo

- Hợp với giáp ngực/vai, mũ, khăn, đồ đeo lưng: những món không co giãn theo tay chân. Mỗi món gen **1 ảnh có 3–4 góc** (nghiêng phải, thẳng, sau lưng, có thể thêm cúi/ngả). Code chọn góc theo khung và đặt theo neo, chỉ dời (đã thử ở trên: dùng được, nhưng cứng).
- **Phần việc lớn nhất là đo neo** cho các hàng khác. Hiện chỉ hàng chạy có khớp (đánh tay trên ảnh nguồn). Mỗi khung cần khoảng 5–6 điểm: đỉnh đầu, cổ, ngực/eo, vai trước, vai sau, lưng; cộng thêm: góc nào, lớp nằm trên hay dưới tay (đổi theo động tác).
- Ước lượng: **161 khung × 1–2 phút** soát/đánh tay ≈ **3–5 giờ**, nếu có công cụ dò tự động đầu/cổ/thân (đã có hàm dò mặt, cổ trong `tach_lop.py`) thì phần tay chỉ còn vai. Các hàng lộn, chết, trúng đòn (người xoay, nằm) cần thêm góc hoặc chấp nhận tháo món ở các khung đó.
- Sau khi có neo, mỗi món mới chỉ tốn 1 ảnh gen.

### 3. Đồ bọc tay chân: phải gen theo động tác

- Áo có tay, quần, găng, giày, ống quấn: bám theo khớp tay chân, đổi dáng mỗi khung. Không làm "1 ảnh + neo" được (lần thử rig xoay mảnh cũng nhấp nháy, rơi điểm ảnh).
- Phải gen theo từng động tác (Cu Tí mặc đồ đó, cùng dáng), rồi tách như bộ đồ xanh. Bài học từ lần này:
  - Ảnh gen **lệch dáng** so với game (IoU 0,81–0,88 ở đồ xanh) → phải lấp 24% điểm đồ. Nên gửi kèm **ảnh mẫu đúng dáng game** (như `mau-gen/do-goc.png`) và yêu cầu giữ nguyên tỉ lệ đầu/thân.
  - Ảnh gen Cu Tí giáp bám dáng tốt (0,89–0,92) vì gần như vẽ đè lên Cu Tí gốc → **gen "Cu Tí gốc + món đồ" theo đúng tấm gốc** cho kết quả dễ tách nhất.
  - Nên gen to (như tấm gốc 2172×724, người cao khoảng 290 điểm ảnh), không nhỏ như ảnh giáp (120 điểm), để tách đỡ vụn.
- Gợi ý ưu tiên: hàng đứng, đi, chạy, kiếm trước (dùng nhiều nhất), các hàng hiếm (lộn, chết, phi tiêu chùm) dùng đổi màu hoặc để đồ gốc.
