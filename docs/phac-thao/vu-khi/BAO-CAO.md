# Vũ khí sống: báo cáo

Đã vẽ xong 400 hình vũ khí sống bằng mã, nhân với 4 bậc. Tất cả nằm trong một file mới `game/js/weapon_art.js`. Không sửa file nào khác trong `game/`.

## Kết quả ngắn gọn

- 4 loại: kiếm, cung, giáo, búa. Mỗi loại 10 dòng, mỗi dòng 10 hình (1 hình gốc, 3 nhánh Lửa, Độc, Băng, mỗi nhánh 3 giai đoạn).
- Vũ khí nào cũng có mặt: mắt, miệng, có dòng thêm lông mày, râu, má hồng. Mỗi dòng một tính nết.
- Mặt có 4 trạng thái: bình thường (chớp mắt), lúc đánh, bị đau, ngủ.
- 4 bậc Thường, Lam, Tím, Vàng là lớp trang trí phủ lên, không đổi hình bóng.
- Kịch bản kiểm tra chạy đạt: nạp sau các script của game không lỗi, vẽ đủ 400 hình nhân 4 bậc không lỗi, không có hai hình cùng loại trùng điểm ảnh, không trùng tên.

## Danh sách ảnh

| Ảnh | Nội dung |
| --- | --- |
| `xem-som.png` | Hai dòng kiếm, một dòng cung, đủ 10 hình mỗi dòng, cạnh em bé cao 25 điểm ảnh |
| `kiem-100-hinh.png` | 100 hình kiếm: 10 hàng là 10 dòng, 10 cột là gốc và 9 hình tiến hóa |
| `cung-100-hinh.png` | 100 hình cung |
| `giao-100-hinh.png` | 100 hình giáo |
| `bua-100-hinh.png` | 100 hình búa |
| `tien-hoa-mot-dong.png` | Phóng to dòng Kiếm Rèn và dòng Cung Rồng Rắn, mũi tên từ gốc tỏa ra ba nhánh, có tên từng hình |
| `bon-bac.png` | Mỗi loại 3 hình, mỗi hình ở cả 4 bậc, kèm ô đồ có khung màu bậc |
| `bieu-cam.png` | 8 vũ khí, mỗi món 4 trạng thái mặt |
| `co-that.png` | Vũ khí cỡ thật trên nền một phòng game, cạnh em bé chibi (bản phóng 3 lần và bản đúng từng điểm ảnh) |

Mã dựng ảnh nằm trong `nguon/`:

- `trang.js`: xếp các tờ ảnh, có cả hình em bé chibi.
- `dung.py`: dựng ảnh. Ví dụ `python3 dung.py` dựng lại tất cả, `python3 dung.py kiem bon-bac` dựng riêng.
- `kiem_tra.py`: kịch bản tự kiểm tra. `do_khac.py`: đo mức khác hình bóng giữa các giai đoạn.
- `lay_nen.py`: chụp nền phòng từ game. `soi.sh`: ảnh phóng to từng dòng để soát nét.

## 40 dòng vũ khí

**Kiếm** (thân dài 43 đến 47 điểm ảnh): Kiếm Rèn (kiêu ngạo), Đao Lưỡi Liềm (láu cá), Kiếm Lá Lúa (hiền lành), Gươm Rồng (dữ dằn), Mã Tấu (bặm trợn), Dao Rựa (ngơ ngác), Kiếm Tre (ngái ngủ), Đoản Kiếm Đông Sơn (nghiêm nghị), Đao Cá Chép (hớn hở), Kiếm Sóng Nước (mít ướt).

**Cung** (cao 32 đến 40): Cung Rồng Rắn (kiêu kỳ), Nỏ Thần (dữ dằn), Cung Sừng Trâu (lì lợm), Cung Tre (hiền lành), Ná Thun (láu cá), Cung Cánh Cò (điệu đà), Cung Trăng Khuyết (ngái ngủ), Cung Đàn Bầu (mơ màng), Cung Xương Cá (ngơ ngác), Cung Đèn Ông Sao (hớn hở).

**Giáo** (dài 56 đến 61): Giáo Tre Vót (lì lợm), Đinh Ba (dữ dằn), Câu Liêm (láu cá), Mác (kiêu ngạo), Lao Phóng (hớn hở), Giáo Đồng Đông Sơn (nghiêm nghị), Xà Mâu (nham hiểm), Mái Chèo (ngơ ngác), Cờ Lau (ngái ngủ), Bút Lông (mơ màng).

**Búa** (cao 40 đến 45): Búa Lò Rèn (cau có), Chày Giã Gạo (hiền lành), Chùy Gai (dữ dằn), Rìu Đá (ngơ ngác), Vồ Gỗ (ngái ngủ), Chiêng Đồng (hớn hở), Trống Đồng (nghiêm nghị), Rìu Xéo Đông Sơn (kiêu ngạo), Búa Đầu Trâu (lì lợm), Chùy Hồ Lô (say sưa).

Tên hình tiến hóa ghép từ tên dòng và chữ theo nhánh, giai đoạn:

- Lửa: Than Hồng, Xích Diệm, Hỏa Thần.
- Độc: Rêu Xanh, Nọc Rừng, Độc Vương.
- Băng: Sương Giá, Hàn Ngọc, Băng Đế.

Ví dụ: Lá Lúa Than Hồng, Lá Lúa Xích Diệm, Lá Lúa Hỏa Thần.

## Số hình thật sự khác nhau (số đo từ kịch bản)

| Loại | Số tên | Hình khác nhau từng điểm ảnh | Hình bóng khác nhau | Thức tỉnh to hơn gốc |
| --- | --- | --- | --- | --- |
| Kiếm | 100 | 100 | 100 | 11% đến 30% |
| Cung | 100 | 100 | 100 | 11% đến 27% |
| Giáo | 100 | 100 | 100 | 12% đến 23% |
| Búa | 100 | 100 | 100 | 11% đến 30% |

Cả 1600 tổ hợp (400 hình nhân 4 bậc) đều cho ảnh khác nhau. Bốn trạng thái mặt của mỗi hình cũng khác nhau.

Nói thật về mức khác nhau:

- **Không có hình nào chỉ khác màu so với hình bên cạnh.** Hình nào cũng lệch hình bóng so với hình liền trước.
- **Nhưng 120 hình giai đoạn Mầm còn rất giống hình gốc.** Đây là chủ ý (mới nhú mầm), song là chỗ khác biệt yếu nhất. Hình bóng Mầm chỉ lệch khoảng 11% đến 12% so với gốc (có hình chỉ 6%). Thay đổi gồm: một mầm nhỏ mọc thêm (ngọn lửa bé, nhánh dây leo, mảnh băng), mép hơi gợn, vết than hồng hoặc rêu hoặc sương bên trong, mắt hé và ngả màu hệ, to hơn 3%.
- Mầm sang Thành hình lệch khoảng 18% đến 20% và đổi hẳn chất liệu. Thành hình sang Thức tỉnh lệch khoảng 22% đến 26%, thêm mắt thứ ba, thêm bờm lửa, nấm, tinh thể.
- **Cách biến hình theo hệ dùng chung một bộ quy tắc cho mọi dòng.** Lửa: mép thành răng lửa, mũi vươn thành ngọn. Độc: thân cong vẹo, mọc gai, nấm, dây leo. Băng: mép gãy thành mặt tinh thể, mọc mảnh băng. Vì vậy các hình cùng hệ của những dòng khác nhau có "chất" giống nhau; chúng khác nhau nhờ hình dáng gốc của dòng. Một số dòng có biến hình riêng (xương sườn Cung Xương Cá, gai Chùy Gai, cánh sao Đèn Ông Sao, ngạnh Đinh Ba, mang rắn hổ của Cung Rồng Rắn).

## Chỗ còn yếu

1. Giai đoạn Mầm ít khác gốc, như nêu trên.
2. Một số hình Thức tỉnh to hơn gốc tới 30%, vượt mức 25% mong muốn (do ngọn lửa hoặc mũi băng vươn dài). Thấp nhất là 11%.
3. Vài cỡ gốc lệch nhẹ khỏi khoảng đề ra: kiếm dài nhất 47 (đề ra 46), cung cao nhất 40 (đề ra 38), giáo dài nhất 61 (đề ra 60), búa cao nhất 45 (đề ra 44).
4. Bậc Lam khá kín đáo ở cỡ thật: chỉ có đai màu, một viên đá 2 điểm ảnh và vài chấm. Bậc Tím và Vàng rõ hơn nhiều.
5. Biểu tượng ô đồ là hình thật thu nhỏ, không vẽ riêng. Ở ô 24 điểm ảnh thì nét bị mất bớt, nhất là giáo.
6. Khi vũ khí xoay góc lẻ, khuôn mặt xoay theo nấc 90 độ để nét không vỡ, nên mặt không nghiêng mượt theo thân.
7. Mắt của Gươm Rồng nằm ở đầu rồng chỗ chắn tay, trông giống mặt mèo hơn mặt rồng. Trống Đồng nhìn nghiêng hơi giống cái đe.
8. Chưa có ảnh động. Chớp mắt, giọt nước mắt, chữ z, nốt nhạc, ánh lấp lánh bậc Vàng đều chạy theo `opts.t` nhưng mới xem ở ảnh tĩnh.
9. Chưa thử trên điện thoại thật.

## Cách gọi hàm

```js
const opts = { type: 'sword', family: 2, branch: 'fire', stage: 3, rarity: 2, mood: 'idle', t: G.time };
G.weaponArt.draw(c, opts, x0, y0, ang, pull);   // vẽ; (x0, y0) là điểm cầm, ang tính bằng độ, pull từ 0 đến 1
G.weaponArt.icon(c, opts, x, y, size);          // vẽ vào ô đồ vuông, (x, y) là tâm ô
G.weaponArt.name(opts);                         // "Lá Lúa Hỏa Thần"
G.weaponArt.fullName(opts);                     // "Lá Lúa Hỏa Thần (Tím)"
G.weaponArt.familyName('sword', 2);             // "Kiếm Lá Lúa"
G.weaponArt.size(opts);                         // { len, w, h, box: { x0, y0, x1, y1 } } tính từ điểm cầm khi đứng nghỉ
G.weaponArt.FAMILIES.sword[2].nature;           // "hiền lành"
G.weaponArt.RARITY[2];                          // { name: 'Tím', col, frame, bg, ... } màu chữ, màu khung ô đồ, màu nền ô
G.weaponArt.fromWeapon(w, { mood, t });         // đổi vũ khí của game sang opts
```

- `type`: `sword`, `bow`, `spear`, `hammer`. `family`: 0 đến 9. `branch`: `null`, `fire`, `poison`, `ice`. `stage`: 0 đến 3. `rarity`: 0 đến 3.
- `mood`: `idle` (chớp mắt theo `t`), `attack`, `hurt`, `sleep`. Có thêm `calm` là bình thường nhưng không chớp, dùng cho ảnh tĩnh.
- `ang`: 0 là chĩa ra trước, âm là chĩa lên, cùng nghĩa với `A.weapon`. Cung thì `ang` là hướng bắn.
- `len` trong `size` là chiều dài thân, không tính tua và hạt hiệu ứng.
- Thân vũ khí được vẽ sẵn vào canvas đệm theo khóa (loại, dòng, nhánh, giai đoạn, bậc, góc làm tròn 5 độ). Mặt, dây cung, mũi tên, ánh lấp lánh vẽ đè mỗi khung hình. Đo trên máy tính: dựng một hình mới khoảng 1,6 phần nghìn giây, vẽ lại khoảng 0,03 phần nghìn giây. Bộ đệm giữ tối đa 600 hình.

## Đề xuất nối vào game (phiên điều phối làm)

1. **`game/index.html`**: thêm `<script src="js/weapon_art.js"></script>` sau `js/art.js`. `build.py` tự lấy theo thứ tự thẻ script nên không cần sửa.
2. **`game/js/art.js`, hàm `A.weapon` và `A.weaponIcon`**: thay phần vẽ bằng `G.weaponArt.draw(c, G.weaponArt.fromWeapon(w, { mood, t }), x0, y0, ang, pull)`. Lưu ý `pull` hiện tại của game tính bằng điểm ảnh (0 đến 4), cần chia cho 4 để ra 0 đến 1. `A.weaponLook` đang trả về màu; cần chuyển cả vũ khí `w` xuống hàm vẽ.
3. **`game/js/hero_art.js`, hàm `drawWeapon`**: tương tự. Vũ khí mới to hơn nhiều (kiếm 45 so với 17 điểm ảnh), nên các tư thế cầm, vệt chém, vị trí rắc hạt ở đầu vũ khí (`tipU`) cần chỉnh theo `G.weaponArt.size(opts).len`.
4. **`game/js/data.js` và `combat.js`**: mỗi vũ khí cần thêm `family` (0 đến 9) và `rarity` (0 đến 3). Hiện game có 3 bậc `G.TIERS` (Sắt, Bạc, Linh); cần quyết định đổi sang 4 bậc Thường, Lam, Tím, Vàng hay giữ cả hai. Khi chưa có, `fromWeapon` tạm suy `family` từ `w.id` và lấy `rarity` từ `w.tier`.
5. **Tên vũ khí**: `G.wName` đang bốc ngẫu nhiên một chữ trong `G.NAME_WORDS`. Nên đổi sang `G.weaponArt.name(opts)` để tên khớp với hình. Chữ giai đoạn 3 của tôi (Hỏa Thần, Độc Vương, Băng Đế) khác `G.NAME_WORDS` hiện có (Tàn Tro, Gai Độc, Tuyết Trắng); cần chọn một bộ.
6. **Trạng thái mặt**: đang ra đòn thì `attack`, hero vừa trúng đòn thì `hurt` trong khoảng nửa giây, ở làng hoặc trong rương đồ thì `sleep`, còn lại `idle`.
7. **Em bé chibi**: hình em bé trong các ảnh chỉ là hình minh họa nằm ở `nguon/trang.js`, chưa có trong game. Vũ khí được chỉnh cỡ theo em bé cao 25 điểm ảnh.
8. **Tầm đánh**: hình to hơn nhưng tầm đánh trong `G.WTYPES` chưa đổi. Nên xem lại `reach` cho khớp mắt nhìn (kiếm 45, giáo 58 điểm ảnh).
9. **Khi hero quay trái**: lật bằng `c.scale(-1, 1)` như hiện nay là được, mặt và tua lật theo.
