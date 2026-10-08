# Giao diện trống đồng và làng có người: báo cáo

Hai việc đã duyệt qua phác thảo nay đã chạy trong game: bộ giao diện chủ đề **trống đồng Đông Sơn** và **làng có người** theo bố cục A (làng rộng 720 điểm, màn hình trượt ngang theo em bé). Ba yêu cầu thêm trong `docs/GHI-CHU-DIEU-PHOI.md` cũng đã làm: tài nguyên hiện bằng biểu tượng, dải khuôn mặt không đè công trình, màn kết quả giữ ba nút.

Chưa thử trên điện thoại thật. Mọi thứ dưới đây được thử bằng Chromium giả lập màn hình điện thoại.

## Đã làm gì

### 1. Bộ giao diện trống đồng (`game/js/ui_theme.js`)

- Màu đồng vàng và xanh ngọc đậm, đinh tán tròn, băng răng cưa, chim Lạc và thuyền trên băng tiêu đề, cóc ngồi bốn góc bảng, vòng tròn nối nhau.
- Có đủ: nút to (thường, đang bấm, mờ), nút nhỏ, thẻ chuyển mục, nút tròn mặt trống, khung bảng có tiêu đề, thanh máu, mana, kinh nghiệm và máu trùm (có vạch khắc), ô đồ viền theo bốn bậc Thường, Lam, Tím, Vàng, thẻ ải mặt trống (đã qua kèm sao, đang chọn, mới mở, chưa mở, ải trùm), dải thông báo, dải tài nguyên trên cùng, khung thoại của người làng, khung thẻ ở màn kết quả.
- Cả game đổi sang bộ này: màn tiêu đề, trong trận (thanh máu, mana, máu trùm, dòng báo, lời chỉ dẫn, bản đồ nhỏ), bảng tạm dừng, rương báu, thương nhân, bàn thờ lời nguyền, rương đồ, bản đồ ải, màn kết quả, mọi bảng ở làng.
- Bản đồ nhỏ vẫn một màu cho mọi ô, nay là tông xanh ngọc, viền đồng.
- Bộ nút Đánh, Đặc biệt, kỹ năng, Né, bình máu, tạm dừng, ô vũ khí và cần điều khiển của `btn_art.js` giữ nguyên, vì vốn đã là màu đồng.

### 2. Làng có người (`game/js/village_scene.js`, `game/js/village.js`)

- Cảnh làng nhìn từ trên xuống chếch: cổng làng, đình, gốc đa, lò rèn, nhà thợ may, gánh hàng xén, giếng, ao sen, bến đò, đèn lồng, đom đóm.
- Em bé đi tám hướng bằng cần điều khiển (kéo ở nửa trái màn hình) hoặc bàn phím. Hai vũ khí đang mang bay theo sau.
- Bảy người, mỗi người có động tác khi rảnh, ngẩng lên nhìn khi em bé tới gần, có dấu chấm than vàng khi có việc mới.
- Tới gần thì nút tròn bên phải sáng lên thành "Nói chuyện". Chạm thẳng vào người thì em bé tự tìm đường chạy tới.
- Dải bảy khuôn mặt ở mép trên là lối tắt, có chấm đỏ khi có việc. Chạm một mặt: em bé chạy tới rồi bảng mở. Chạm lần hai: tới ngay. Đang mở bảng mà chạm mặt khác: sang thẳng người đó.
- Chạm vào vũ khí đang bay để xem vũ khí. Ba bé hero còn lại ngồi chơi ở sân đình, chạm vào bé nào là đổi sang bé đó (bé chưa mở thì hiện điều kiện mở).
- Từ ải về (và lúc mới vào game), em bé xuống đò ở bến bên phải.
- Khi mở bảng: bảng nằm bên phải, người đứng bên trái và nói. Câu nói đổi theo tình huống, thay cho các dòng chỉ dẫn trước đây.

### 3. Ai giữ việc gì

Làm đúng bảng phân việc trong báo cáo phác thảo làng. Không bỏ chức năng nào.

| Người | Bảng mở ra | Có gì trong đó |
|---|---|---|
| Chú Lái Đò | Tranh bản đồ vùng | 15 thẻ ải mặt trống trên tranh, sao từng ải, ải chưa mở có khoá, chọn ải, thông tin ải (trùm, số phòng, hệ, gợi ý cấp, thưởng), đổi độ khó thường và độ khó 2 (tranh chuyển màu đêm), nút "Lên đò" |
| Ông Thợ Rèn | Lò rèn | Mài, Nâng bậc (kể cả lên Vàng bằng mảnh trùm), Tôi lại, Rèn đồ, Nâng lò |
| Bà Hàng Xén | Rương vũ khí | Hai món đang mang, rương đồ có lật trang, đổi món mang theo, Xem, Bán |
| Cô Thợ May | Mũ, áo, bùa | Đổi mũ, áo, bùa; chỉ số máu, mana, giảm sát thương; hiệu ứng bộ; ô "sắp có: đồ đeo lưng, cánh" |
| Cụ Đồ | Cây kỹ năng, Hướng dẫn | Học ba nhánh Công, Thủ, Hệ; đặt lại điểm; hướng dẫn nhiều trang (bảng hẹp hơn nên từ 3 trang thành khoảng 6) |
| Ông Từ | Chọn hero | Bốn hero, chỉ số, sở trường, nội tại, kỹ năng |
| Anh Mõ | Cài đặt | Âm thanh, toàn màn hình, xoá tiến trình (có hỏi lại) |
| Vũ khí sống đang bay | Xem vũ khí | Bậc, dòng phụ, đặc trưng hệ đã mở và sắp mở |

Thẻ hero ở góc phải của màn làng cũ đã bỏ, theo bảng phân việc: tên và cấp nằm ở dải trên cùng.

### 4. Theo ghi chú điều phối

- **Tài nguyên bằng biểu tượng.** Vàng, quặng, đá tôi, gỗ linh, vảy cá, đá lửa, mảnh trùm của từng trùm và kinh nghiệm có biểu tượng pixel riêng. Dải trên cùng chỉ còn biểu tượng và số. Mọi dòng chữ kiểu "400 vàng", "+5 quặng", "2 mảnh Mộc Tinh" ở bất cứ đâu trong game (giá ở lò rèn, giá bán, thương nhân, thưởng trên tranh bản đồ, màn kết quả) tự đổi thành số kèm biểu tượng. Chạm vào biểu tượng thì hiện tên khoảng hai giây.
- **Dải khuôn mặt không đè công trình.** Cảnh làng lùi xuống 14 điểm và dải thu gọn lại, nên mép dưới của dải nằm trên mọi nóc nhà. Em bé đi tới ngay dưới dải thì dải mờ đi.
- **Khoá ngang.** Mã mới chỉ đọc ngón tay qua `G.pointers`, `G.click`, `G.downs`. Đã thử cầm dọc: game tự xoay, làng và các bảng chạm đúng chỗ.
- **Màn kết quả** giữ ba nút Về làng, Chơi lại, Ải tiếp theo; nút Ải tiếp theo màu đỏ đồng, to nhất.

## Những chỗ tôi tự quyết định

1. **Bảng hẹp lại để nhường chỗ cho người đứng cạnh.** Danh sách vũ khí và món rèn hiện 4 dòng mỗi trang, có nút lật trang (trước là 12 dòng chia hai cột).
2. **Màn Xem vũ khí vẫn là bảng rộng cả màn hình**, không có người đứng cạnh, vì nội dung nhiều.
3. **Chạm vào đất trống thì em bé cũng đi tới đó.** Phác thảo không nói, nhưng thiếu thì chạm hụt người sẽ không có gì xảy ra.
4. **Tốc độ.** Đi bằng cần: nhanh gấp rưỡi trong trận. Tự chạy tới người: nhanh hơn nữa, xa nhất chừng 3 giây.
5. **Lần đầu vào làng** có hai dòng nhắc: cách đi, rồi "Tới bến đò bên phải, gặp Chú Lái Đò để vào ải". Chưa làm cảnh Anh Mõ dẫn đi một vòng.
6. **Dấu chấm than** bật khi: Lái Đò có ải mới mở; Thợ Rèn đủ nguyên liệu để mài món đang mang, nâng bậc hoặc nâng lò; Hàng Xén có vũ khí mới; Thợ May có mũ áo bùa mới; Cụ Đồ còn điểm kỹ năng; Ông Từ có hero mới; Anh Mõ lần đầu vào làng. Nói chuyện xong thì tắt.
7. **Nút "Thôi" nằm đúng chỗ nút xoá tiến trình vừa bấm**, để bấm đúp nhầm không xoá mất.
8. **Con cóc ở giếng** chạm vào thì kêu "Ộp!" rồi nhảy xuống giếng, chỉ để vui.
9. **Bản lưu.** Không đổi cách lưu và không sửa `G.fixSave`. Chỉ thêm mốc "đã xem việc mới" vào ô `tut` sẵn có (`tut.lang`). Bản lưu cũ mở bình thường.
10. **Trời chạng vạng** giữ như phác thảo. Chưa có bản ban ngày.

## Kiểm tra

Đã chạy toàn bộ bài trong `game/tests/`. Số liệu của lượt chạy cuối:

| Bài | Kết quả |
|---|---|
| `ui_input.py all` (điều khiển thật, bốn cỡ màn hình, có cỡ cầm dọc) | 157/157, 157/157, 148/148 (máy tính), 157/157 |
| `ui_robust.py` (xoay máy, ẩn trang, khung hình chậm, bản lưu hỏng hoặc cũ) | 17/17, 1/1, 16/16 |
| `ui_build.py` (đóng gói rồi chơi thử hai tệp trong `dist/`) | 6/6, 157/157, 6/6, 157/157, không lỗi console |
| `rules.py` (hai luật lõi, ba hệ, dấu ấn, trùm thích nghi) | 82/82 |
| `moves.py` | 92/92 |
| `ghep.py` | 109/109 |
| `ghep2.py` | 196/196 |
| `mapgen.py`, `doors.py` | đạt |
| `env_rooms.py` | 108 phòng, 0 lỗi |
| `fx_check.py`, `fuzz.py`, `anim_smoke.py`, `smoke.py` | 0 lỗi |

Các bài đo (bot chơi 15 ải, cân bằng, sát thương, tốc độ khung hình) chạy một lần trên bản gần cuối: bot thắng đủ 15 ải, không thua lần nào; bài cân bằng thắng 44/45; một khung hình trong trận đông quái tốn trung bình 1,96 mili giây. Sau đó tôi chỉ sửa phần làng và vùng chạm, không đụng tới trận đánh, nên không chạy lại các bài đo này.

Bài kiểm tra đã sửa cho khớp cách chơi mới, không bỏ mục nào:

- `ui_input.py`: phần làng viết lại theo điều khiển thật (kéo cần, chạm người, chạm đất, chạm vũ khí, dải khuôn mặt, nút Nói chuyện, phím J, chạm bé ở sân đình, tranh bản đồ, từng bảng). Nay có 157 mục mỗi cỡ màn hình điện thoại.
- `ghep.py`: ở cảnh làng, vũ khí nay bay theo em bé nên mục đó đếm hình vũ khí bay; trong các bảng vẫn đếm biểu tượng như cũ.
- `ghep2_d.js`: bản đồ nhỏ vẫn phải một màu, nhưng màu đó nay là xanh ngọc và đồng. Mục "không còn màu sặc sỡ" nay không tính các màu của bảng màu một tông, và thêm một mục kiểm tra bảng màu đúng là xanh ngọc với đồng, không có đỏ, lam, tím.
- `ghep2_fgh.js`: màn kết quả vẽ tên vũ khí trong thẻ, nên mục đó nhận cả tên món đứng riêng.
- `shots.py`, `ui_shots.py`, `ui_robust.py`: thêm hai bảng mới (mũ áo bùa, cây kỹ năng) vào danh sách đi qua.
- Thêm `lang_shots.py` để chụp bộ ảnh trong thư mục này.

Bản đóng gói `dist/linh-khi.html` và `dist/artifact.html` đã dựng lại bằng `build.py`; bài `ui_build.py` mở cả hai bằng Chromium, chơi thử, không có lỗi console.

Trong lúc kiểm tra tôi bắt được một lỗi của chính mã mới và đã sửa: lần chạm ở cảnh làng đôi khi bị bỏ sót, vì tôi xử lý nó ở bước cập nhật trong khi bộ máy xoá lần chạm sau mỗi khung hình. Nay xử lý ngay lúc vẽ như các nút khác.

## Điểm còn yếu

- **Chưa thử trên máy thật.** Cỡ vùng chạm tính theo màn 844x390: nhỏ nhất là nút lật trang và nút Xem, Bán (cao khoảng 36 điểm màn hình), khuôn mặt lối tắt khoảng 45x52. Cần cầm máy thật mới biết đã vừa tay chưa.
- **Phông chữ trong ảnh là phông thay thế**, vì máy chụp không tải được Be Vietnam Pro. Chữ được đo lúc chạy nên xuống dòng vẫn đúng, nhưng vài nhãn một dòng có thể rộng hẹp khác chút trên máy thật.
- **Danh sách phải lật trang nhiều hơn** khi có nhiều vũ khí (4 dòng mỗi trang).
- **Vũ khí bay theo có lúc che người hoặc đồ vật** đứng sau nó. Em bé đi sau tán cây đa thì bị tán che.
- **Va chạm còn thô.** Đẩy cần thẳng vào vật cản thì em bé đứng lại chứ chưa tự trượt dọc theo vật.
- **Người làng chỉ đứng tại chỗ**, mỗi người ba khung động tác. Chưa có ai đi lại.
- **Biểu tượng trong câu văn.** Việc đổi "số + tên tài nguyên" thành biểu tượng áp dụng cho mọi dòng chữ, kể cả lời thoại, nên có câu đọc hơi lạ ("Tốn 1 [biểu tượng đá tôi], vũ khí giữ một nửa dấu ấn"). Chữ "mảnh trùm" chung chung, không nêu trùm nào, vẫn là chữ.
- **Biểu tượng ở dải trên cùng nhỏ**, chạm để xem tên hơi khó trúng.
- **Hình pixel của khung, nút** được phóng theo tỉ lệ màn hình nên trên vài cỡ màn, các điểm ảnh không đều tăm tắp.
- **Chưa làm**: trời ban ngày, cảnh Anh Mõ dẫn đi một vòng, ba vùng "sắp có" trên tranh, đồ đeo lưng và cánh ở chỗ Cô Thợ May.

## Ảnh trong thư mục này

Chụp bằng `python3 tests/lang_shots.py` (chạy từ thư mục `game`), cỡ điện thoại ngang 844x390.

| Ảnh | Nội dung |
|---|---|
| `lang-trong-game.png`, `bo-giao-dien.png` | Hai ảnh của giai đoạn 1: làng trong game và tờ gom mọi thành phần giao diện |
| `01-tieu-de.png`, `01b`, `01c` | Màn tiêu đề; người chơi mới vừa vào làng; dòng chỉ đường tới Chú Lái Đò |
| `02`, `04` | Hai đầu làng: bên phải lúc vừa xuống đò, bên trái có đình, cổng làng, ao sen |
| `03`, `05`, `06` | Tới gần thì nút thành "Nói chuyện"; chạm khuôn mặt thì em bé tự chạy; chạm biểu tượng thì hiện tên |
| `10`, `10b`, `10c` | Chú Lái Đò: tranh bản đồ vùng, chọn ải trùm, độ khó 2 |
| `11` đến `11f` | Ông Thợ Rèn: Mài, Nâng bậc, lên Vàng, Tôi lại, Rèn đồ, Nâng lò |
| `12`, `12b` | Bà Hàng Xén: rương vũ khí, đã chọn một món |
| `13` | Cô Thợ May: mũ, áo, bùa |
| `14`, `14b` | Cụ Đồ: cây kỹ năng, hướng dẫn |
| `15` | Ông Từ: chọn hero |
| `16`, `16b` | Anh Mõ: cài đặt, hỏi lại trước khi xoá |
| `17` | Xem vũ khí |
| `20` đến `26` | Trong trận, tạm dừng, bản đồ ải, rương báu, thương nhân, bàn thờ lời nguyền, rương đồ |
| `27`, `28`, `29` | Kết quả thắng, phòng trùm có thanh máu trùm, kết quả thua |
| `30` | Cầm máy dọc: game tự xoay ngang |

## Tệp đã đổi

- Mới: `game/js/ui_theme.js`, `game/js/village_scene.js`, `game/tests/lang_shots.py`, thư mục này.
- Viết lại: `game/js/village.js`.
- Sửa ít: `game/index.html` (nạp hai tệp mới), `game/js/stage.js` (thanh máu, mana, máu trùm, dòng báo, ô vũ khí trong bảng, màn kết quả dạng thẻ), `game/js/minimap.js` (màu), `game/js/engine.js` (một dòng: hiện tên biểu tượng khi chạm), `game/README.md`, các bài kiểm tra nêu ở trên, `game/dist/`.
- Không đụng: luật trận đánh, số liệu, bộ sinh bản đồ, cách lưu game.
