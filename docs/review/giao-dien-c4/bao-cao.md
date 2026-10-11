# Báo cáo phiên C4: thân nút, ô vũ khí, cần điều khiển dùng được ảnh AI

Ngày 11/10/2026 · nhánh `khoi-tao-du-an` · làn C (Giao diện)

## Tóm tắt một dòng

Game đã sẵn sàng nhận ảnh ChatGPT cho **13 hình**: 6 thân nút tròn, 1 nút vuông, đế và núm cần điều khiển, 4 khung ô vũ khí. Chưa có tệp ảnh nào nên game **y hệt cũ** (đã so từng điểm ảnh: khác 0).

## Bạn cần làm gì tiếp

Chỉ cần vẽ **2 tấm ảnh**.

1. Mở https://spiritblade.web.app/tach-giao-dien.html, chọn lô **Thân nút · vòng nút, nút vuông, cần điều khiển (9 hình)** (gần cuối danh sách), bấm **Sao chép prompt vẽ**, dán vào ChatGPT.
2. Đưa ảnh vào bước 2 của trang. Xem thử ở bước 4. Ưng thì bấm **Tải tất cả (.zip)**.
3. Chọn lô **Ô vũ khí · khung theo 4 bậc** (cuối danh sách), làm lại y như vậy. Tấm này nền xanh lá.
4. Gửi hai tệp .zip cho Claude.

Hai prompt đầy đủ và bảng thứ tự các ô: `PROMPT.md` cùng thư mục này.

## Đã làm

**1. Game** (`game/js/btn_art.js`)

| Hình | Mã tệp | Cỡ | Dùng cho |
|---|---|---|---|
| Vòng nút theo hệ: chưa hệ, Lửa, Độc, Băng | `gd-vong-thuong`, `-fire`, `-poison`, `-ice` | 76×76 | nút Đánh; nút Chưởng dùng chung (game thu nhỏ) |
| Vòng nút vành ngọc lam | `gd-vong-ngoc` | 56×56 | nút Chiêu |
| Vòng nút vành sắt | `gd-vong-sat` | 56×56 | nút Né |
| Nút vuông vát góc | `gd-nut-vuong` | 42×42 | Bình máu, Tạm dừng |
| Đế và núm cần điều khiển | `gd-can-de`, `gd-can-num` | 66×66, 30×30 | cần điều khiển (trong trận và ở làng) |
| Khung ô vũ khí theo bậc | `gd-o-vk-0` đến `gd-o-vk-3` | 54×35 | ô vũ khí góc trên phải |

- Ảnh chỉ là **thân nút nhìn từ trên xuống**: vành, mặt nút, lửa / giọt độc / gai băng quanh vành.
- Game vẫn tự làm mọi thứ còn lại từ MỘT ảnh: bề dày dưới nút, bóng đổ, nút lún và sáng lên khi bấm, xám khi khoá, ô vũ khí chưa cầm thì trầm màu, ô đang cầm có viền sáng, núm sáng lên khi đang kéo.
- Hình ở giữa nút (phiên C1), thẻ giá mana, màn hồi chiêu, số giây, hình vũ khí và ngọc trong ô vẫn vẽ đè lên thân như cũ.
- **Vị trí và cỡ nút không đổi.** Game tự tìm vòng tròn thân nút trong ảnh rồi đặt tâm và bán kính trùng với nút cũ. Nhờ vậy ảnh không cần nằm đúng giữa ô, và lửa hay giọt độc thò ra không làm nút lệch.
- **Mặt nút Đánh** lấy từ ảnh; prompt dặn đúng màu đồng vàng `#c98c34` của Đợt 8. **Mặt nút Chiêu và Chưởng** vẫn do game tô, vì màu mặt hai nút này cho biết hệ đang dùng. Không nút nào dùng màu đỏ; prompt cũng cấm đỏ.
- Lòng đế cần điều khiển: game làm phần tối trong lòng đế trong mờ như cũ, để vẫn nhìn thấy sân phía dưới.
- Ảnh nạp xong lúc nào thì nút đổi lúc đó; gỡ tệp thì nút về hình cũ. Thiếu tệp nào thì riêng nút đó vẽ như cũ.
- **Cờ tắt:** `G.THAN_NUT_ANH = false` thì game bỏ qua các ảnh này.

**2. Trang công cụ** https://spiritblade.web.app/tach-giao-dien.html

- Hai lô mới ở cuối danh sách: **Thân nút** (lưới 4×3, 9 hình, 3 ô cuối trống, nền hồng tím) và **Ô vũ khí** (lưới 2×2, nền xanh lá vì có ô màu tím).
- Prompt tiếng Việt một đoạn, dán thẳng ChatGPT. Mọi chi tiết của hình vẽ code đều có trong prompt: vành có gờ nổi, vòng viền tối trong vành, mặt nút lõm hai nấc sáng tối, đinh tán bốn góc, ngọn lửa trên đỉnh, giọt độc dưới đáy, bốn gai băng chéo, bốn mũi tên và bốn đinh đồng của đế cần, viên ngọc xanh của núm, vành và lòng ô theo bậc. Có đoạn bảng màu (kim loại, gỗ, ba hệ).
- Bước 4 **xem thử**: bộ nút do chính code nút của game vẽ, có thêm hàng ô vũ khí bốn bậc và cần điều khiển lúc nghỉ, lúc đang kéo. Có nút so với bản vẽ code cũ.
- Nút ở bước 4 nay dùng màu Đợt 8 (mặt nút Đánh đồng vàng) như game thật. Việc này áp cho cả lô "Nút điều khiển" của C1.
- Các lô cũ không đổi.

## Đã kiểm (một lượt tự động, ảnh mẫu máy tự dựng)

| Việc kiểm | Kết quả |
|---|---|
| Ảnh lưới mẫu 4×3 đưa vào lô Thân nút | **ĐẠT**, tìm được 9/9 hình, mọi tệp ghi `"net": 2`, ảnh đúng gấp đôi cỡ trong game |
| Ảnh lưới mẫu 2×2 nền xanh lá đưa vào lô Ô vũ khí | **ĐẠT**, tìm được 4/4 hình, tệp 108×70, `"net": 2` |
| Game không có tệp, bản trước phiên so với bản mới, một trận ở 844×390 | **khác 0 điểm ảnh** |
| Vẽ riêng cả bộ nút (mọi hệ, bấm, khoá, hồi chiêu, ô vũ khí 4 bậc, cần điều khiển) ở 5 cỡ màn, bản trước so bản mới, không tệp | **khác 0 điểm ảnh** ở cả 5 cỡ |
| Nạp tạm đủ 13 tệp mẫu vào game | thân nút, ô vũ khí, cần điều khiển đổi sang ảnh; hình ở giữa, số mana, chữ vẫn nằm trên |
| Toạ độ dán hình của một khung hình, trước và sau khi nạp tệp | 20 lần dán, **trùng hết** |
| Khung bao phần đặc của từng nút (Đánh, Chiêu, Né, Né đang bấm, Bình máu, Tạm dừng, ô vũ khí, núm cần), code so với ảnh, ở 2 cỡ màn | **trùng từng điểm** ở cả 9 trường hợp |
| Có tệp nhưng tắt cờ `G.THAN_NUT_ANH` | về đúng hình cũ, khác 0 điểm ảnh |
| Gỡ 3 tệp (vòng Lửa, ô bậc Vàng, núm) | ba hình đó về hình code, các hình khác vẫn dùng ảnh |
| Gỡ hết tệp | game về đúng như lúc đầu, khác 0 điểm ảnh |
| Lỗi JavaScript | không có (game, bản gói, trang công cụ) |
| `node --check game/js/*.js`, bài kiểm tra lưu mây, `python3 game/build.py` | đều qua |

Ảnh kiểm: `anh-kiem.png`. **Bên trái là hình vẽ code, bên phải là có tệp mẫu.** Từ trên xuống:

1. Một trận ở 844×390: kiếm hệ Lửa bậc Tím, cung bậc Vàng, cần điều khiển đang kéo.
2. Phóng to cần điều khiển, cụm nút, hai ô vũ khí.
3. Cả bộ nút vẽ riêng: 4 hệ, đang bấm, bị khoá, đang hồi; ô vũ khí đủ 4 bậc (hàng trên đang cầm, hàng dưới chưa cầm); cần điều khiển lúc nghỉ và lúc kéo.
4. Trận có đủ tệp (trái) và trận thiếu 3 tệp (phải).
5. Bước 4 của trang công cụ.
6. Hai tấm ảnh lưới mẫu đã dùng.

Lưu ý: hình trong ảnh kiểm là **hình mẫu máy tự vẽ để thử** (có các chấm trắng trên vành để dễ nhận ra), không phải tranh thật. Không có ảnh nào được thêm vào `game/art/custom`.

Chạy lại: `python3 docs/review/giao-dien-c4/kiem.py <thư mục bản code cũ>`.

## Chưa làm, chưa thử

- Chưa thử với ảnh ChatGPT thật và chưa thử trên iPhone thật. Lần đầu có thể cần nhờ ChatGPT vẽ lại vài ô.
- Trong một trận thật chỉ có 2 ô vũ khí, nên ảnh trận chỉ có bậc Tím và Vàng. Đủ 4 bậc nằm ở phần "cả bộ nút vẽ riêng".
- Chỉ chụp ở 844×390; các cỡ màn khác chỉ so bằng bộ nút vẽ riêng. Không chạy bộ test dài (theo lời dặn).
- Cần điều khiển ở làng dùng chung đúng hàm vẽ với trong trận; không chụp riêng (tệp làng thuộc phiên D3).
- Nút "Kỹ năng" (game hiện không hiện ra) chưa có ảnh thân, vẫn vẽ code.

## Nên biết

- **Lửa quanh nút đứng yên khi dùng ảnh.** Hình code có lửa nhấp nháy hai nhịp và nhiều ngọn hơn khi vũ khí lên mốc tiến hoá. Ảnh chỉ có một hình nên hai điều này mất. Mốc tiến hoá vẫn thấy ở ngọc trong ô vũ khí.
- **Nút Chưởng dùng chung ảnh vòng hệ với nút Đánh**, game thu nhỏ lại. Mặt nút Chưởng vẫn do game tô màu theo hệ nên không lẫn với nút Đánh.
- **Bình máu và Tạm dừng dùng chung một ảnh nút vuông.** Mặt nút Bình máu vì thế đổi từ đỏ sẫm sang nâu, giống nút Tạm dừng. Hình bình máu ở giữa không đổi.
- **Ảnh phải là vòng tròn đều.** Nếu ChatGPT vẽ nút nghiêng hoặc có bề dày phía dưới, game vẫn đặt được nhưng nút trông nhỏ hơn hoặc lệch. Khi đó nên vẽ lại ô đó.
- **Lòng đế cần điều khiển** chỉ trong mờ ở những điểm ảnh tối. Nếu ChatGPT tô lòng đế bằng màu sáng thì lòng đế sẽ che sân.
- Viền trong hai prompt là `#140e0c` (màu viền của bộ nút), để khớp với bề dày và viền mà game vẫn tự vẽ quanh ảnh.

## Chỗ tôi tự quyết (không hỏi lại)

1. **Ảnh không có bề dày và bóng; game tự vẽ.** Nhờ vậy một ảnh dùng được cho cả lúc thường và lúc bấm, và bóng mờ không phải tách khỏi nền hồng tím.
2. **Game tự tìm tâm và cỡ nút trong ảnh**, thay vì tin rằng hình nằm đúng giữa tệp. Trang công cụ cắt sát hình rồi mới thu nhỏ, nên nút có lửa trên đỉnh sẽ lệch tâm nếu không làm vậy.
3. **Mặt nút Chiêu và Chưởng vẫn do game tô**, để giữ nghĩa màu theo hệ và luật "không nút nào đỏ" của Đợt 8.
4. **Lô Thân nút có 3 ô trống**, không phải 2 như brief ghi: brief liệt kê đúng 9 hình trên lưới 4×3. Tôi giữ lưới 4×3 theo kế hoạch làn.
5. **Lô Ô vũ khí dùng nền xanh lá**, vì ô bậc Tím gần màu nền hồng tím. Lô Thân nút vẫn nền hồng tím (có nút xanh lá và xanh lam nên không đổi nền được; cam của hệ Lửa đủ xa hồng tím).
6. **Bước 4 dùng màu Đợt 8** cho mọi lô nút, để hình xem thử giống game thật.

## Tệp đã đổi

- `game/js/btn_art.js`: khối "thân nút bằng ảnh AI" (tìm vòng tròn, lấy mẫu ảnh, làm sáng, làm trầm); `buildBase`, `buildSlot`, `buildStickBase`, `buildKnob`, `B.draw`, `B.slot`, `B.stick`.
- `game/dist/*`, `tools/xuong-sprite/index.html`: gói lại.
- `tools/tach-giao-dien/index.html`: hai lô mới ở cuối, prompt, mô tả lô, xem thử.
- `docs/review/giao-dien-c4/`: báo cáo, `PROMPT.md`, `anh-kiem.png`, `kiem.py`.
- `docs/review/ke-hoach-cai-thien/TRANG-THAI.md`: dòng C4.

## Dung lượng

Không thêm ảnh nào. Bản gói tăng khoảng 10 KB (10.591.221 → 10.601.652 byte, đo ngay sau khi sửa code). Khi bạn gửi đủ 13 hình, ước chừng thêm 80 đến 150 KB. Đây là ước lượng: 13 tệp mẫu máy vẽ nặng 60 KB, tranh thật nhiều màu hơn nên nặng hơn.

## Rủi ro còn lại

- Ảnh thật có thể không tròn đều hoặc có bề dày; xem mục "Nên biết".
- Vành trong ảnh thật có thể dày mỏng khác hình code. Ở nút Chiêu và Chưởng, game tô mặt nút theo cỡ vành của hình code, nên vành ảnh dày hơn sẽ bị che bớt mép trong, vành mỏng hơn sẽ lộ một vòng màu mặt nút của ảnh.
- Ở cỡ màn mà ảnh phải thu theo tỉ lệ lẻ, nét ảnh có thể mềm hơn hình code một chút (giống biểu tượng của C1).

## Cách quay lui

- Chưa có tệp ảnh thì không có gì để quay lui: game đang vẽ y như cũ.
- Có ảnh mà không ưng: đặt `G.THAN_NUT_ANH = false`, hoặc xoá các tệp `gd-vong-*`, `gd-nut-vuong`, `gd-can-*`, `gd-o-vk-*` khỏi `game/art/custom` rồi gói lại.
- Bỏ hẳn phần code: `git revert b9fcf76 bc2589e` (công cụ, rồi game), sau đó chạy `python3 game/build.py`.

## Quyết định cần bạn duyệt

1. Lửa quanh nút Đánh đứng yên và không lớn dần theo mốc tiến hoá khi dùng ảnh. Mặc định: chấp nhận. Lựa chọn khác: game vẽ thêm lửa động của code đè lên ảnh.
2. Nút Chưởng dùng chung ảnh vòng hệ với nút Đánh. Mặc định: giữ. Lựa chọn khác: thêm 3 ảnh vòng riêng cho Chưởng.
3. Mặt nút Bình máu đổi từ đỏ sẫm sang nâu khi dùng ảnh. Mặc định: giữ (hợp với luật đỏ chỉ dành cho nguy hiểm).

## Cho người làm kỹ thuật

- `thanMa(kind, el)` trả mã ảnh thân; `G.btnArt.maThan`, `G.btnArt.MA_THAN` cho công cụ và bài kiểm tra.
- `gdTron(g)`: đĩa tròn to nhất nằm trọn trong phần đặc của ảnh (biến đổi khoảng cách hai lượt, rồi chốt lại bằng khoảng cách thật quanh điểm tốt nhất, bước nửa điểm). Kết quả nhớ theo ảnh bằng `WeakMap`. `gdThanTron` đặt tâm đĩa vào `(c, c)` và bán kính đĩa bằng `R` điểm vẽ (bằng thân code `R − 1` cộng nét viền). Nút vuông vát góc dùng cùng cách (đĩa nội tiếp có bán kính bằng nửa cạnh).
- `buildBase`: có ảnh thì vẽ bề dày, viền quanh bề dày, dán ảnh (đang bấm: `sang(0.22)`), bỏ `decor`, đinh tán, vòng lặp vành. `matCode` (Chiêu, Chưởng, và Đánh khi cờ Đợt 8 tắt): vòng lặp mặt nút vẫn chạy cho phần `d ≤ Rb − rw`.
- `buildSlot`: ảnh kéo vừa `(W + 2) × (H + 2)` tại `(P − 1, P − 1)`, tức đúng chỗ khung code kể cả viền. Chưa cầm: `nga('#201a18', 0.38)`.
- `buildStickBase`: điểm có kênh màu lớn nhất dưới 72 và nằm trong bán kính `Rf` được đặt độ đậm 140/255.
- Khoá bộ nhớ đệm mang thêm dấu của ảnh thân (`gdTagMa`), nên ảnh nạp xong, đổi hay gỡ thì nút tự dựng lại, không cần gọi `B.clear()`. Không có ảnh thì khoá y như cũ.
- Trang công cụ: mảng `THAN`, `O_VK`; lô `id: 'than'` (`kieu: 'icon'`) và `id: 'ovk'` (`kieu: 'gian'`), cờ `xemThan`; `veXemNut` cao thêm một hàng. Bản game nạp ở bước 4 không có `ui_theme.js` nên trang tự đặt `GAME.theme.DOC` với ba màu của Đợt 8.
- `python3 game/build.py` ghi dấu thời gian vào bản gói, nên mỗi lần gói là `game/dist` đổi; commit "Gói lại game" (`f055d1a`) chỉ vì thế.
