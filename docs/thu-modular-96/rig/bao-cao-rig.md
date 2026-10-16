# Báo cáo: thử rig gắn giáp lên khớp (16/10)

> Mới: đã thử **giáp gen thật** (4 mảnh). Xem mục **"Giáp gen thật"** ngay dưới phần "Nói ngắn gọn" của bộ máy vẽ.

Mọi thứ nằm trong `docs/thu-modular-96/rig/`. **Không sửa code game, không sửa ảnh nguồn, không sửa tệp nào ngoài thư mục `rig/`** (chỉ đọc `../data.json` và `../sheets/`).

## Nói ngắn gọn

- **Toàn bộ chu kỳ chạy 12 khung chỉ dùng 6 ảnh giáp nhỏ** (3 mảnh + 3 chụp khớp). Không có sheet giáp 12 khung nào.
  - Mỗi ảnh dùng cho **cả 12 khung và cả bên trước lẫn bên sau**. Bên sau chỉ được làm tối đi lúc chạy, vẫn là cùng ảnh đó.
  - Mỗi khung, code đọc khớp trong `data.json`, tính vị trí, góc và chiều dài, rồi xoay/đặt ảnh giáp vào đó.
- **Giáp bám theo khớp 11/12 khung ở chế độ xoay liên tục.** Khung còn lại là khung 7: giáp cẳng tay trước hụt khoảng 2 điểm ảnh so với cổ tay, vì xương ở khung đó dài gấp 1,6 lần bình thường (xem bảng dưới). Mảnh giáp nào cũng đi theo khớp của nó ở mọi khung, không mảnh nào bị bỏ lại hay trôi đi.
- **Ở chế độ làm tròn 8 hướng**, giáp bám tốt 9/12 khung. Khung 4, 7 và 11 bị lệch đuôi.
- **Chụp khớp che được hở**: điểm ảnh tay/chân lộ quanh vai, khuỷu, gối giảm từ **48 xuống 12** trên cả chu kỳ. Phần còn hở chủ yếu ở gối sau, mỗi khung 1–2 điểm ảnh.
- **Kết luận:** cách này chạy được và tiết kiệm ảnh. Nhưng ở cỡ 96 (và nhất là 48), mảnh giáp chỉ dài 4–9 điểm ảnh. Xoay pixel art nhỏ như vậy làm **rơi điểm ảnh và nhấp nháy** (chi tiết ở mục "Giới hạn").

## Giáp gen thật (16/10, bộ "Gen")

Chủ game gen ảnh `anh-gen/giap-roi-4-manh.png` (4 mảnh: vai, cẳng tay, ống chân, ngực nhỏ). Đã cắt, thu nhỏ và gắn thử như **một bộ giáp thứ hai**. Bộ máy vẽ cũ vẫn giữ nguyên (kết quả của nó không đổi so với trước).

### Nói ngắn gọn

- **Cả chu kỳ 12 khung dùng 7 ảnh nhỏ**: 4 mảnh gen + 3 chụp khớp (vai, khuỷu, gối). Mỗi ảnh dùng cho cả 12 khung và cả bên trước lẫn bên sau. Ảnh gen không có chụp khớp, nên 3 chụp khớp lấy hình của bộ máy vẽ và tô lại bằng màu của ảnh gen.
- **Xoay liên tục: giáp bám khớp đủ 12/12 khung.** Chỉ khung 11 có giáp ống chân trước hụt cổ chân 2,1 điểm ảnh (xương ở khung đó dài gấp 1,6 lần).
- **Làm tròn 8 hướng: chỉ 4/12 khung bám đủ, và giáp ngực nhảy 45° ở 8/12 khung.** Thân nghiêng khoảng 106–120°, nằm ngay giữa hai nấc 90° và 135°, nên giáp ngực lật qua lật lại. **Với bộ gen, không nên dùng 8 hướng.**
- **Chụp khớp che hở**: điểm ảnh lộ quanh khớp giảm từ 45 xuống 8 (bộ máy vẽ: 48 xuống 12).
- **Nhận xét thẳng:** ở ô 96, mỗi mảnh chỉ còn **25–121 điểm ảnh** (ảnh gốc mỗi mảnh khoảng 80–100 nghìn điểm ảnh). Ở **cỡ game 48×48** chỉ còn **4×4, 4×2, 4×3 và 6×6 điểm ảnh**. Gần như **mất hết chi tiết gen**: đinh tán, chữ V trên cẳng tay, hình thoi trên ngực đều biến mất. Chỉ còn lại "một mảng thép xám có chấm đồng và viền đen". Ở ô 96, cẳng tay và ống chân khó phân biệt với bộ máy vẽ. Giáp ngực là món duy nhất còn nhìn ra là giáp.

### Xem ở đâu

| Tệp | Là gì |
|---|---|
| `kiem-tra-rig.html` | Trang kiểm tra. Có nút **Bộ giáp: Máy vẽ / Gen** ở đầu trang, và ô **"Phóng to nhân vật ×2 (192)"**. |
| `soat/giap-gen-truoc-sau.png` | 4 mảnh gen: gốc cắt → thu nhỏ ô 96 → bản ô 192 → còn lại ở cỡ game 48. **Nên xem ảnh này trước.** |
| `soat/luoi-may-vs-gen.png` | Lưới 12 khung phóng ×4. Các hàng: máy vẽ / gen × liên tục / 8 hướng, thêm gen cỡ game 48 và gen ô 192. |
| `soat/chay-may-vs-gen.gif` | Chạy cạnh nhau: Máy vẽ, Gen, Gen 8 hướng, Gen ô 192. |
| `soat/dien-thoai-390-gen*.png` | Chụp trang trên điện thoại 390×844 (DPR 3): bộ Gen, Gen + ×2, Gen + debug, cả trang. |
| `soat/tu-kiem-gen.json` | Số liệu tự kiểm 12 khung của cả 2 bộ. |
| `giap-gen/goc-*.png` | 4 mảnh cắt nguyên cỡ (nền trong suốt, đã xoay về chiều xương). |
| `giap-gen/*.png`, `giap-gen/*-x2.png` | Bản thu nhỏ cho ô 96 (dùng trong rig) và bản ×2 (chỉ để so sánh). |
| `giap-gen/gen.json` | Cỡ, điểm neo, bảng màu, số điểm ảnh của từng bước. |

### Cắt và đặt chiều xương (`tao-giap-gen.py`)

- **Tách nền**: điểm ảnh có màu xanh lá trội hơn đỏ và lam hơn 28 đơn vị thì coi là nền. Viền xanh nhạt lẫn quanh mép (hơi xanh và nằm sát nền) cũng bỏ đi, tổng cộng 1.779 điểm ảnh. Điểm còn hơi ngả xanh thì kéo màu xanh xuống cho hết ám xanh.
- **Tìm 4 mảnh** bằng các cột trống giữa chúng. Mỗi mảnh cắt sát hình.
- **Chiều xương**: theo quy ước, đầu xương nằm bên trái.
  - Cẳng tay và ống chân: script đo độ dày hai đầu. Đầu loe to hơn (khuỷu/gối) đã nằm bên trái nên giữ nguyên.
  - Giáp vai: vòm vai ở bên trái, giữ nguyên.
  - Giáp ngực: xoay 90° ngược chiều kim đồng hồ để mép cổ sang trái, thắt lưng sang phải.

| Mảnh | Gốc cắt | Ô 96 | Ô 192 (so sánh) | Gắn theo | Độ dài xương TB | anchorStart → anchorEnd | thicknessScale |
|---|---|---|---|---|---|---|---|
| Giáp vai | 359×360 | 8×8 | 16×16 | vai → khuỷu | 5,6đ | (1,2; 4) → (6,8; 4) | 1 |
| Giáp cẳng tay | 458×248 | 8×4 | 16×8 | khuỷu → cổ tay | 6,0đ | (0,96; 2) → (7,04; 2) | 1 |
| Giáp ống chân | 503×347 | 9×6 | 18×12 | gối → cổ chân | 7,0đ | (1,08; 3) → (7,92; 3) | 1 |
| Giáp ngực nhỏ | 382×383 | 13×13 | 26×26 | cổ → 60% đoạn tới giữa hông | 10,8đ | (1,04; 6,5) → (11,96; 6,5) | 1 |

- Cỡ ô 96 được chọn để khoảng cách giữa 2 điểm neo bằng **độ dài xương trung bình** trong `data.json`. Hai đầu thò ra thêm 12–15% để che khớp.
- **Giáp ngực** gắn theo đoạn **cổ → giữa hông** (`neck` → `hipCenter`), nhưng chỉ phủ 60% đầu đoạn (`boneFrac: 0.6`, khoảng tới thắt lưng). Nó xoay theo góc thân và được vẽ **trên thân, dưới chân trước và tay trước** (chèn ở chỗ lớp `chestArmor`).

### Cách thu nhỏ mà vẫn giữ nét

Không dùng thu nhỏ thường (sẽ nhoè thành một mảng xám). Thay vào đó làm 4 bước:

1. **Giảm màu**: gom màu của cả 4 mảnh về **bảng 8 màu lấy từ chính ảnh**: viền đen `#050403`, 2 tông tối `#231714` `#352f31`, 2 tông thép `#4b5666` `#748293`, 3 tông đồng `#944a1d` `#dd8940` `#e0c7a6`.
2. **Thu nhỏ có chọn lọc**: mỗi điểm ảnh nhỏ ứng với một ô trong ảnh gốc.
   - Ô phủ dưới 40% hình thì để trống.
   - Ô có từ 50% viền đen trở lên thì tô **viền đen**.
   - Ô có từ 45% đồng trở lên (không tính viền) thì tô **đồng**, để đai đồng mỏng không bị thép lấn mất. Ô còn lại tô thép.
   - Màu cụ thể = trung bình màu trong ô, rồi chọn màu gần nhất trong nhóm đó.
3. **Giữ viền**: điểm ảnh ở mép hình mà ô gốc có từ 12% viền đen thì tô viền đen. Ở ô 96 có 14–22 điểm như vậy mỗi mảnh.
4. **Dọn điểm ảnh lẻ**: bỏ điểm đứng một mình, và đổi màu điểm bên trong khác màu hết 8 điểm xung quanh (1–6 điểm mỗi mảnh).

Kết quả: mỗi mảnh ô 96 dùng 5–8 màu. Bản ×2 làm lại từ ảnh gốc (không phóng to từ bản ô 96).

### Kết quả từng khung (bộ Gen)

"đ" = điểm ảnh ở ô 96. Số đo do trang tự đo, giống `soat/tu-kiem-gen.json`.

| Khung | Bám khớp (liên tục / 8 hướng) | Rung | Méo | Hở khớp còn lại |
|---|---|---|---|---|
| 1 | ✓ / ống chân trước lệch đuôi | ống chân sau xoay gắt 90° | 8 hướng: cẳng tay mất 6–7/25đ | gối sau 1đ |
| 2 | ✓ / ống chân trước, cẳng tay trước lệch đuôi | **8 hướng: ngực nhảy 45°**; cẳng tay trước xoay gắt 90° | 8 hướng: cẳng tay sau mất 7/25đ | – |
| 3 | ✓ / ống chân trước lệch đuôi | – | 8 hướng: ống chân sau mất 7/34đ | – |
| 4 | ✓ / ✓ | **8 hướng: ngực nhảy 45°** | 8 hướng: cẳng tay sau mất 6/25đ | gối trước 1đ |
| 5 | ✓ / ✓ | cẳng tay trước xoay gắt 90° | 8 hướng: ống chân sau hụt 2,0đ | – |
| 6 | ✓ / ✓ | 8 hướng: vai sau nhảy 45°; cẳng tay trước xoay gắt 90° | 8 hướng: cẳng tay sau mất 6/25đ | – |
| 7 | ✓ / ống chân trước lệch đuôi | **8 hướng: ngực + vai sau nhảy 45°**; ống chân trước xoay gắt 90° | 8 hướng: ống chân sau mất 8/34đ | gối sau 1đ |
| 8 | ✓ / ống chân sau lệch đuôi | **8 hướng: ngực nhảy 45°**; cẳng tay trước xoay gắt 90° | 8 hướng: cẳng tay sau lố 1,8đ | gối sau 1đ |
| 9 | ✓ / ống chân sau lệch đuôi | **8 hướng: ngực nhảy 45°**; cẳng tay trước xoay gắt 90° | 8 hướng: cẳng tay sau mất 6/25đ | gối sau 2đ |
| 10 | ✓ / ống chân sau lệch đuôi | **8 hướng: ngực nhảy 45°** | 8 hướng: cẳng tay sau mất 6/25đ | gối sau 1đ |
| 11 | ✓ / ✓ | **8 hướng: ngực nhảy 45°**; cẳng tay trước xoay gắt 90° | **ống chân trước hụt 2,1đ** (cả 2 chế độ) | – |
| 12 | ✓ / ngực lệch đuôi | **8 hướng: ngực nhảy 45°** | 8 hướng: ống chân trước mất 8/34đ | gối trước 1đ |

- **Xoay liên tục** không mảnh nào mất quá 16% điểm ảnh. Nhưng do mảnh nhỏ nên hình mảnh vẫn đổi chút ít mỗi khung (lấp lánh), giống bộ máy vẽ.
- **"Xoay gắt"** là do chính dáng chạy trong `data.json` (cẳng tay trước lật 90° giữa 2 khung), không phải lỗi gắn. Giống hệt bộ máy vẽ.
- Nhìn lưới: ở xoay liên tục không thấy mảnh nào rời khớp hay trôi. Giáp vai gen (8×8) to hơn bản máy vẽ nên che gọn vai trước. Viền đen ở đuôi giáp vai thành 1–2 điểm đen lởm chởm.

### Chế độ "Phóng to nhân vật ×2 (192)" — chỉ để so sánh

- **Game vẫn là 96/48.** Chế độ này vẽ cùng rig ở ô 192. Thân người chỉ được phóng ×2 nên không thêm chi tiết. Riêng mảnh giáp gen dùng bản thu nhỏ ×2 (gấp 4 lần số điểm ảnh: vai 164, cẳng tay 98, ống chân 126, ngực 486 điểm ảnh).
- Ở ô 192 thì **bắt đầu thấy lại** đai đồng trên cẳng tay, mép loe ở gối, và trên giáp ngực có viền đồng cổ áo + mảng thép sáng. Đinh tán và hình thoi vẫn mất.
- Nghĩa là: muốn giáp gen giữ được chất "gen" thì nhân vật cần cỡ khoảng **192 trở lên**, hoặc mảnh giáp phải to (như giáp ngực).

### Đề xuất

1. **Nếu giữ cỡ game 48×48**: đừng gen ảnh to rồi thu nhỏ. Hãy **vẽ (hoặc gen) mảnh ở đúng cỡ nhỏ** (khoảng 8×4 đến 13×13 ở ô 96) với ít chi tiết: 1 viền đen, 1 đai đồng, 2 tông thép. Hoặc giữ bộ máy vẽ tối giản: ở 48×48 nó cho kết quả gần như bằng bộ gen mà rõ hình hơn.
2. **Chỉ dùng rig cho món to, ít xoay**: giáp ngực, khiên, áo choàng, mũ. Giáp ngực gen là mảnh duy nhất giữ được dáng sau khi thu nhỏ. Còn tay/chân (vai, cẳng tay, ống chân) thì gần như thành chấm màu, không đáng công gen.
3. **Giáp ngực nên đặt theo neo `chestArmor` với góc cố định** (hoặc chỉ dùng xoay liên tục), không dùng 8 hướng: góc thân nằm ngay giữa hai nấc nên bị nhảy 45° ở 8/12 khung.
4. Nếu muốn giữ chi tiết gen thật thì phải tăng cỡ nhân vật (192). Đây là quyết định lớn, ảnh hưởng toàn bộ game, cần chủ game chọn.

## Xem ở đâu

| Tệp | Là gì |
|---|---|
| `kiem-tra-rig.html` | Trang kiểm tra, 1 tệp tự chứa, mở được trên điện thoại. |
| `soat/luoi-12-khung.png` | Lưới 12 khung, phóng ×4. Có 4 hàng: xoay liên tục (96), 8 hướng (96), xoay liên tục cỡ game (48), 8 hướng cỡ game. |
| `soat/chay-rig.gif` | Nhân vật chạy: xoay liên tục (trái) và 8 hướng (phải). |
| `soat/dien-thoai-390*.png`, `soat/may-tinh-1280.png` | Ảnh chụp trang trên điện thoại 390×844 (DPR 3) và máy tính 1280×800. |
| `soat/bao-loi-*.png` | Ảnh chụp trang khi cố ý làm lỗi: thiếu khớp, thiếu ảnh, điểm neo sai. |
| `soat/tu-kiem.json` | Số liệu tự kiểm của trang, đủ 12 khung × 2 chế độ. |

### Trang kiểm tra có gì

1. **Hai nhân vật cạnh nhau**: trái là "Xoay liên tục", phải là "Làm tròn 8 hướng".
   - Hình trên là khung nguồn 96×96, hình dưới là cỡ game 48×48.
   - Cả hai được phóng bằng số nguyên theo độ nét màn hình, không làm mượt, nên không bị nhòe.
   - Mặc định trang cắt sát nhân vật cho to. Bấm **"Cả khung 96"** để xem đủ khung.
2. **Nút điều khiển**: Chạy/Dừng, tua ◀ ▶ từng khung, và **Chậm ×¼** để soi rung.
3. **Bật/tắt riêng từng mảnh**: 12 nút, gồm giáp vai, giáp cẳng tay, giáp ống chân, chụp vai, chụp khuỷu, chụp gối, mỗi thứ có bên trước và bên sau.
4. **Debug**:
   - **Xương**: xanh lơ là bên trước, hồng là bên sau.
   - **Khớp**: chấm tròn.
   - **Điểm neo**: neo đầu màu vàng, neo cuối màu cam (lấy từ ảnh giáp và tính ra vị trí trên nhân vật).
   - **Đường nối**: nét đứt đỏ từ điểm neo tới khớp. Nét càng dài thì giáp càng lệch.
5. **Báo lỗi**: có khung đỏ ở đầu trang khi thiếu khớp (ghi rõ khớp nào, khung nào), thiếu ảnh giáp, điểm neo sai (nằm ngoài ảnh, hai neo trùng nhau, `thicknessScale` ≤ 0), hoặc lớp chèn không có trong `layerOrder`.
   - Mảnh bị lỗi sẽ không vẽ. Mảnh còn lại vẫn chạy bình thường.
   - Ô **"Thử báo lỗi"** cho cố ý gây 3 loại lỗi để xem khung đỏ. Đã thử cả 3: khung đỏ hiện đúng.
6. Bảng **"Khung đang xem"** (góc, độ giãn, số điểm ảnh bị rơi) và bảng **"Tự kiểm 12 khung"**. Bấm một dòng trong bảng để nhảy tới khung đó.

## Cách gắn

Ảnh giáp và điểm neo nằm trong `giap/*.png`, khai báo trong `rig.json`. Mỗi mảnh được vẽ **nằm ngang theo chiều xương**: đầu xương ở bên trái.

| Ảnh | Cỡ | Gắn theo | anchorStart → anchorEnd | Dùng cho |
|---|---|---|---|---|
| `giap-vai.png` | 9×6 | vai → khuỷu | (1.5,3) → (7.5,3) | vai trước, vai sau |
| `giap-cang-tay.png` | 7×4 | khuỷu → cổ tay | (1,2) → (6.5,2) | cẳng tay trước, sau |
| `giap-ong-chan.png` | 9×5 | gối → cổ chân | (1,2.5) → (8,2.5) | ống chân trước, sau |
| `chup-vai.png` | 5×5 | tâm đặt tại vai | (2.5,2.5) | 2 bên |
| `chup-khuyu.png` | 4×4 | tâm đặt tại khuỷu | (2,2) | 2 bên |
| `chup-goi.png` | 4×4 | tâm đặt tại gối | (2,2) | 2 bên |

**Hàm gắn** (`place()` trong trang) làm 4 bước cho mỗi khung:

1. Lấy 2 khớp A, B từ `data.json.frames[khung].joints` (tên khớp đúng như trong data, ví dụ `shoulderFront`/`elbowFront`).
2. Tính góc = atan2(B − A). Ở chế độ 8 hướng, góc được làm tròn về bội số 45°.
3. Tính độ giãn = |AB| / |anchorEnd − anchorStart|, giới hạn trong khoảng 0,75–1,3 (`stretch` trong metadata). Bề dày nhân với `thicknessScale`.
4. Ghép thành một ma trận: dời tới A, xoay, co giãn, rồi đưa `anchorStart` về gốc. Sau đó vẽ ảnh bằng `drawImage`, tắt làm mượt.

**Chụp khớp** không xoay. Tâm của nó được đặt vào khớp, làm tròn về điểm ảnh nguyên, nên không bao giờ bị méo.

**Thứ tự chồng** đọc từ `DATA.layerOrder`. Mỗi mảnh khai báo `insertAfter` (vẽ ngay sau lớp nào). Có thể ghi đè theo khung bằng `frameOverrides` (hiện chưa cần dùng).

- **Bên sau** (vẽ dưới thân):
  - giáp vai sau, cẳng tay sau, chụp vai sau, chụp khuỷu sau: vẽ sau `rearArm`;
  - giáp ống chân sau, chụp gối sau: vẽ sau `rearPants`.
- **Bên trước** (vẽ trên tay/chân trước):
  - giáp ống chân trước, chụp gối trước: vẽ sau `frontPants`;
  - cẳng tay trước, rồi vai trước, rồi chụp khuỷu, rồi chụp vai: vẽ sau `frontArm`.
- Đầu và tóc vẫn vẽ trên cùng.

Thân người là các lớp gốc trong `sheets/` cùng bộ đồ "goc". **Các sheet giáp 12 khung của bản cũ** (`chestArmor`, `backShoulderArmor`, `frontShoulderArmor*`, `forearmArmor`) **không được vẽ** (`skipLayerKinds: ["giap"]`). Vì thế thử nghiệm này không có giáp ngực.

**Nguồn ảnh giáp**: vẽ pixel tối giản bằng mã trong `tao-rig.py`, màu đồng/thép gần với giáp gen. Không dùng ảnh trong `anh-gen/`, vì cả 3 ảnh đó là giáp ngực + vai liền khối, không có mảnh tay/chân để cắt.

## Kết quả từng khung

Các số dưới đây do trang tự đo trong Chromium, giống hệt `soat/tu-kiem.json`. "đ" = điểm ảnh, đo ở khung nguồn 96.

| Khung | Bám khớp | Rung / giật | Méo | Hở khớp còn lại (sau khi có chụp) |
|---|---|---|---|---|
| 1 | ✓ | ống chân sau xoay gắt 90° | – | gối sau 1đ |
| 2 | ✓ | cẳng tay trước xoay gắt 90° | 8 hướng: cẳng tay sau mất 6/26đ | – |
| 3 | ✓ | – | vai sau lố 1,6đ; 8 hướng: cẳng tay sau, ống chân sau mất 8/26, 14/38đ | – |
| 4 | 8 hướng: ống chân sau lệch đuôi | – | 8 hướng: cẳng tay sau mất 8/26đ | gối sau 1đ, gối trước 1đ |
| 5 | ✓ | cẳng tay trước xoay gắt 90° | 8 hướng: cẳng tay sau mất 8/26đ | – |
| 6 | ✓ | **8 hướng: vai sau nhảy 45° (xương chỉ xoay 15°)**; cẳng tay trước xoay gắt 90°, vai trước 45° | – | gối trước 1đ |
| 7 | **cẳng tay trước hụt cổ tay** (cả 2 chế độ) | **8 hướng: vai sau nhảy 45° (xương chỉ 7°)**; ống chân trước xoay gắt 90° | cẳng tay trước hụt 1,9đ (xương dài ×1,64); 8 hướng: ống chân sau mất 11/38đ | gối sau 1đ |
| 8 | ✓ | cẳng tay trước xoay gắt 90° | 8 hướng: cẳng tay sau mất 8/26đ | gối sau 1đ |
| 9 | ✓ | cẳng tay trước xoay gắt 90° | vai sau lố 1,7đ (xương ngắn ×0,47); 8 hướng: ống chân trước mất 8/38đ | gối sau 2đ |
| 10 | ✓ | – | 8 hướng: cẳng tay sau mất 8/26đ | gối sau 1đ |
| 11 | 8 hướng: ống chân trước lệch đuôi | cẳng tay trước xoay gắt 90° | ống chân trước hụt 1,9đ (xương dài ×1,57) | gối sau 1đ |
| 12 | ✓ | – | 8 hướng: ống chân trước mất 9/38đ | gối sau 1đ, gối trước 1đ |

### Đọc bảng thế nào

- **"Xoay gắt"** nghĩa là chính xương trong `data.json` xoay 45–90° chỉ trong 1 khung (cẳng tay trước lật từ chúc xuống sang ngang). Đây là dáng chạy, không phải lỗi gắn. Nhưng mảnh giáp cứng nên nhìn thấy nó "lật" rõ, nhất là khi bấm Chậm ×¼.
- **"Nhảy 45°"** chỉ có ở chế độ 8 hướng. Xương xoay rất ít nhưng góc vượt ngưỡng làm tròn, nên giáp nhảy hẳn một nấc. Đây là kiểu rung riêng của cách làm tròn (khung 6, 7, giáp vai sau).
- **"Mất x/y điểm ảnh"**: khi xoay hoặc co lại bằng nearest-neighbor, một số điểm ảnh của ảnh giáp bị rơi mất. Ở xoay liên tục không mảnh nào mất quá 20%. Ở 8 hướng, giáp cẳng tay sau mất 23–31% vì vừa bị ép ngắn ×0,75 vừa xoay.
- **"Hụt/lố"**: xương trong data dài/ngắn thất thường do góc nhìn nghiêng (cẳng tay trước dài 4,5–9đ, vai sau chỉ 2,8–4,8đ). Giáp chỉ được kéo trong khoảng 0,75–1,3 lần, vì kéo nhiều hơn thì pixel art bị méo nặng. Nên ở khung 7 và 11 giáp không chạm tới khớp cuối, còn ở khung 3 và 9 giáp vai sau thò quá khuỷu. Riêng giáp vai sau gần như bị thân che hết.
- **Hở khớp**: đếm điểm ảnh tay/chân trong bán kính 2đ quanh khớp mà không có giáp che. Trước khi có chụp: 48đ. Sau khi có chụp: 12đ.

## Giới hạn của cách xoay pixel art

1. **Chỉ góc 0°/90°/180°/270° là giữ nguyên nét.** Ở góc khác (kể cả 45° của chế độ 8 hướng), nearest-neighbor làm rơi hoặc nhân đôi điểm ảnh. Viền bị răng cưa và đổi hình theo từng khung.
2. **Xoay liên tục** làm mảnh giáp đổi hình dạng mỗi khung dù góc chỉ đổi vài độ, trông như "lấp lánh". **8 hướng** thì hình ổn định hơn trong cùng một nấc, nhưng nhảy 45° khi qua ngưỡng và lệch khỏi xương tới khoảng 22°.
3. **Mảnh càng nhỏ càng tệ.** Ở cỡ game 48×48, mảnh giáp chỉ còn 2–4 điểm ảnh, gần như thành một chấm màu. Chi tiết đai/viền mất hết (xem 2 hàng dưới của `luoi-12-khung.png`).
4. **Co giãn theo chiều dài xương** cũng làm méo pixel. Không co giãn thì giáp lại hụt/lố khớp khi xương bị phối cảnh ngắn lại.
5. **Không có xoay 3D**: giáp luôn là mặt nghiêng, không đổi khi tay vung ra trước/sau thân. Ánh sáng vẽ sẵn trên ảnh xoay theo xương, nên có khung chỗ sáng nằm ở dưới.
6. **Chất lượng phụ thuộc khớp đánh bằng mắt** (sai ±1–2đ). Khớp lệch thì giáp lệch theo.

**Hướng đề xuất** (chưa làm, cần chủ game chọn):

- (a) Mỗi mảnh vẽ sẵn **4–8 ảnh theo góc** (vẽ tay, không xoay bằng code), code chỉ chọn ảnh gần nhất và đặt vào khớp. Khi đó số ảnh giáp sẽ là 6 × 8 = 48 ảnh nhỏ, vẫn ít hơn sheet 12 khung cho từng món.
- (b) Chỉ dùng rig cho đồ ít xoay (vai, ngực, mũ), còn tay/chân dùng sheet theo khung.

## Cách chạy lại

```
python3 docs/thu-modular-96/rig/tao-giap-gen.py  # cắt + thu nhỏ 4 mảnh giáp gen -> giap-gen/
python3 docs/thu-modular-96/rig/tao-rig.py       # vẽ 6 ảnh giáp máy vẽ, ghi rig.json (cả bộ Gen), dựng kiem-tra-rig.html
python3 docs/thu-modular-96/rig/soat-rig.py      # soát bộ máy vẽ: chụp màn hình, lưới, GIF, tu-kiem.json
python3 docs/thu-modular-96/rig/soat-giap-gen.py # soát máy vẽ vs gen: lưới, GIF, ảnh trước/sau, tu-kiem-gen.json
```

- Cần Python 3 + `pillow`. Riêng `soat-rig.py` cần thêm `playwright` + Chromium.
- `soat-rig.py` thoát mã 1 nếu trang báo lỗi với dữ liệu thật, nếu thử lỗi mà trang không báo, hoặc nếu trang điện thoại bị tràn ngang.
- Nếu phiên khác đổi tên hoặc thêm lớp trong `data.json`, chỉ cần chạy lại `tao-rig.py`. Thứ tự lớp luôn đọc từ `DATA.layerOrder`. Nếu `insertAfter` trỏ vào lớp không còn tồn tại, trang sẽ báo lỗi đỏ.

## Prompt gen ảnh (nếu muốn giáp đẹp hơn bản vẽ tối giản)

> Pixel art, one image, flat #00FF00 background, no text, no shadow. Three separate small armor pieces in a row, each lying horizontally along its bone direction (joint end on the left): 1) a bronze shoulder pauldron about 9×6 px, 2) a steel forearm bracer with two bronze bands about 7×4 px, 3) a steel shin greave with a bronze knee band about 9×5 px. Crisp hard pixels, 1-pixel dark outline, 3-tone shading, same bronze/steel palette as the reference.

Gửi kèm `mau-gen/giap-mau-x12.png` (3 mảnh hiện tại phóng ×12, trên nền xanh). Ảnh gen về cần thu nhỏ đúng cỡ đó, rồi thay vào `giap/*.png`, giữ nguyên `rig.json`, sau đó chạy lại 2 lệnh trên.
