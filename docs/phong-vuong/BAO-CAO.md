# Báo cáo: phòng vuông và bản đồ ải ngẫu nhiên

Nhánh `claude/phong-vuong`, tách từ `khoi-tao-du-an`. Đã làm xong cả 6 mốc. Game chơi được từ đầu đến cuối với phòng mới.

## Nên xem ảnh nào trước

Mọi ảnh đều chụp thật từ game (không phải ảnh vẽ tay), nằm trong `docs/phong-vuong/`.

| Ảnh | Nội dung |
| --- | --- |
| `cua-mo-va-chuyen-phong.png` | **Nên xem đầu tiên.** Bốn bước: cửa khóa khi còn quái, cửa mở khi hết quái, màn hình trượt khi bước qua cửa, hiện ra ở phòng kề. |
| `phong-lau-dai.png`, `phong-rung.png`, `phong-hang.png` | Đang đánh quái trong phòng bốn cửa ở ba vùng, mọi cửa khóa. |
| `ban-do-nho-ba-kieu.png` | Bản đồ nhỏ lúc đang chơi và bản đồ to của ba kiểu A, B, C. |
| `phong-trum.png` | Mộc Tinh, Ngư Tinh, Hồ Tinh và một trùm nhỏ trong phòng trùm mới. |
| `cac-loai-phong.png` | Rương báu, Suối hồi, Thương nhân, Thử thách, Lời nguyền, Tinh anh. |

Chụp lại bất cứ lúc nào: `cd game && python3 tests/room_shots.py`.

## Đã đổi gì

**Phòng.** Mỗi phòng là một ô gần vuông vừa một màn hình, nhìn từ trên xuống chếch. Sàn 208x196 điểm ảnh ở giữa. Hai lề trái phải dành cho giao diện: thanh máu, mana, bình máu, nút Dừng, tên vùng ở bên trái; hai ô vũ khí, bản đồ nhỏ, bốn nút tròn ở bên phải. Nhân vật và quái vẫn vẽ nghiêng như cũ, đi tám hướng trong sàn.

**Ba chủ đề.** Rừng già (thân cây, rào gai, cửa bị dây gai chắn), Hang biển (vách đá, nhũ đá, tinh thể chắn cửa), Lâu đài cổ (gạch đá, đuốc, cờ, cửa song sắt). Mỗi chủ đề có 3 kiểu sàn và đồ trang trí ngẫu nhiên ở các góc, nên các phòng trong một ải không giống hệt nhau. Lửa đuốc, tinh thể, đom đóm có chuyển động nhẹ.

**Đồ vật nhận diện.** Rương, hai suối và rương đồ, quầy thương nhân, bàn thờ lời nguyền dùng lại hình cũ. Thêm bệ đồng hồ cát cho phòng Thử thách. Phòng Bắt đầu, Tinh anh, Thử thách, Lời nguyền, Trùm có vòng dấu riêng trên sàn.

**Quái.** Quái hiện ra ngay trong phòng: một vệt tối loang trên sàn báo trước nửa giây rồi quái trồi lên, không chạy vào từ mép trái nữa. Nửa sau của mỗi đợt hiện ra chậm hơn 2 giây để không bị vây cùng lúc. Quái bắn xa đứng cách khoảng 85 điểm ảnh (trước là 150). Đạn dừng ở tường.

**Vùng nguy hiểm, vũng hệ, bóng đổ.** Trước cao bằng 0,6 lần rộng, nay 0,85 lần (số `G.ZK` trong `data.js`). Vùng trúng đòn cũng tính theo hình mới, không chỉ đổi hình vẽ. Bóng của quái, trùm và đồ vật tròn hơn.

**Phòng trùm và trùm nhỏ.** Sàn 300x198, vẫn vừa một màn hình. Bản đồ nhỏ thu lại thành một nút để nhường chỗ. Thanh máu trùm nằm trên mặt tường sau. Ba trùm và trùm nhỏ đã đặt lại vị trí, tầm đòn, vùng cảnh báo:
- Mộc Tinh đứng sát tường phải, giai đoạn cuối lết vào giữa phòng 56 điểm ảnh.
- Ngư Tinh: hàng lao rộng 38 (trước 26), khe hở của sóng 62 (trước 38), nước dâng thu sàn mỗi phía 24 rồi dâng từ bên trái 56.
- Hồ Tinh giữ nguyên lối đánh, chỉ đổi chỗ xuất phát.
- Trùm nhỏ đứng ở nửa phòng đối diện cửa vào; đường lao không vượt ra ngoài tường.
- Luật trùm thích nghi giữ nguyên (bài `rules.py` vẫn qua đủ 82 luật).

**Bản đồ ải.** Mỗi lần vào ải sinh một bản đồ 8 phòng trên lưới (tối đa 5 ô ngang, 4 ô dọc), có hạt giống.

**Bản đồ nhỏ.** Ở góc trên bên phải, dưới hai ô vũ khí, thay hàng chấm phòng cũ. Chạm vào (hoặc phím M) thì tạm dừng và hiện bản đồ to có chú giải; chạm lần nữa để chơi tiếp.

## Luật cửa và bản đồ đang chạy trong game

1. Vào phòng có quái thì mọi cửa khóa. Hạ hết quái thì các cửa mở cùng lúc.
2. Phòng không có quái (Rương báu, Suối hồi, Thương nhân, Lời nguyền) thì cửa mở sẵn.
3. Phòng đã dọn thì đi lại tự do, không sinh quái mới. Đồ vật giữ nguyên trạng thái (rương đã mở vẫn mở).
4. Đứng vào cửa đang mở và đi tiếp về phía cửa thì sang phòng kề, hiện ra ở cửa đối diện. Màn hình trượt theo hướng đi và tối nhanh, tổng cộng khoảng một phần ba giây.
5. Phòng chỉ có cửa ở những phía có phòng kề.
6. Bản đồ nhỏ: phòng đã qua tô đặc có biểu tượng; phòng đang đứng sáng có viền; phòng kề đã biết chỉ có viền và biểu tượng; phòng xa hơn chưa hiện.
7. Cửa dẫn tới Trùm còn khóa: trên bản đồ vẽ đỏ có ổ khóa; trong phòng có xích vàng và dòng chữ cạnh cửa cho biết còn thiếu gì.

Ba kiểu bố cục:
- **Kiểu A, đường chính có nhánh phụ.** Lối chính 6 phòng ngoằn ngoèo: Bắt đầu, Đánh quái, Đánh quái, Tinh anh, Suối hồi, Trùm. Hai phòng phụ bỏ qua được: Rương báu và một trong Thương nhân, Thử thách, Lời nguyền. Chỗ gắn phòng phụ đổi mỗi lần.
- **Kiểu B, mê cung nhỏ.** 8 phòng trong ô 3x3, có đường vòng. Cửa Trùm nằm trong phòng Suối hồi, chỉ mở khi dọn xong 3 phòng quái (2 Đánh quái và Tinh anh).
- **Kiểu C, sảnh trung tâm.** Sảnh giữa là phòng Bắt đầu, có ba cánh. Mỗi cánh có một phòng quái giữ một mảnh chìa. Đủ 3 mảnh thì cửa phía trên sảnh mở, qua Suối hồi tới Trùm. Bản đồ nhỏ hiện số mảnh chìa đã có.

Ở cả ba kiểu, Suối hồi nằm ngay trước Trùm, và trùm chỉ gặp sau khi người chơi đã đánh ít nhất 4 trận (phòng Bắt đầu và 3 phòng quái), nên trùm vẫn có đủ dữ liệu thói quen.

Chọn kiểu: ải cuối mỗi vùng (ải có trùm vùng) luôn là Kiểu C. Các ải khác chọn ngẫu nhiên, không lặp lại kiểu của lần chơi ngay trước.

## Chỗ làm khác với đề bài, cần biết

- **Cửa lựa chọn không còn.** Phòng "Chọn cửa" cũ (chọn một trong hai cửa) không hợp với bản đồ lưới. Nó được thay bằng phòng phụ: mỗi ải có một phòng Thương nhân, Thử thách hoặc Lời nguyền, người chơi tự quyết định ghé hay bỏ. Loại "Đánh quái thêm" bỏ hẳn vì đã có đủ phòng quái trên lối đi.
- **Ải nào cũng 8 phòng.** Trước đây hai ải đầu mỗi vùng chỉ có 7 phòng.
- **Phòng Bắt đầu có một đợt quái nhẹ** (hai đợt từ ải 3), để trùm vẫn có 4 trận để học như trước.
- **Ải dạy chơi đầu tiên luôn dùng Kiểu A** cho dễ theo. Lời chỉ dẫn nằm ở lề trái, không che phòng.
- **Hồi máu khi qua phòng** (kỹ năng nhánh Thủ) chỉ tính khi vào một phòng lần đầu, để không lợi dụng bằng cách đi qua đi lại.
- Công cụ `add_repo` không cần dùng vì kho đã gắn sẵn và đẩy được.

## Cân bằng: trước và sau

Đo bằng bài mới `tests/balance.py`: bot chơi 15 ải, mỗi ải dùng một bản lưu cố định (cấp, vũ khí, giáp đúng với tiến độ thường gặp). Bản cũ chạy 3 lần mỗi ải, bản mới 4 lần mỗi ải.

| | Bản cũ (phòng dài) | Bản mới (phòng vuông) |
| --- | --- | --- |
| Tỉ lệ bot thắng | 44/45 | 58/60 |
| Thời gian trung bình một ải | 244 giây (4,1 phút) | 253 giây (4,2 phút) |
| Trong đó đánh quái | 168 giây | 177 giây |
| Trong đó đánh trùm | 77 giây | 79 giây |
| Dấu ấn trung bình một ải | 35,3 | 32,9 |
| Số quái hạ một ải | 46,5 | 45,0 |
| Máu mất một ải (so với máu tối đa) | 79% | 96% |

Thời gian từng ải của bản mới: ải ngắn nhất 138 giây (1-1), dài nhất 389 giây (2-5, trận Ngư Tinh 172 giây, bằng bản cũ). Bot đánh nhanh hơn người; với người chơi thật tôi ước một ải khoảng 4 đến 7 phút, nhưng chưa có người thật đo.

Chạy theo kiểu chơi liền 15 ải trên một bản lưu mới (`campaign.py`, phụ thuộc nhiều vào vận may nhặt đồ): bản cũ 3 lượt, trung bình một ải 224, 256, 251 giây, không thua lần nào. Bản mới chạy 4 lượt trong lúc chỉnh: trung bình 204, 201, 256 và 237 giây, mỗi lượt thua từ 0 đến 3 lần rồi vẫn qua hết 15 ải (lượt cuối, với số liệu chốt: 237 giây, thua 1 lần). Số đo gốc của bản cũ lưu trong `do-truoc-khi-sua.txt`.

Các số đã chỉnh, đều nằm ở `G.ROOM_WAVES` trong `data.js`:
- Mỗi đợt còn 85% số điểm quái so với trước (sàn chỉ bằng 40% diện tích cũ).
- Phòng quái có 3 đợt ở ải 1 đến 3, 4 đợt ở ải 4 và 5 (trước là 2 và 3 đợt). Phòng Bắt đầu 1 đợt, từ ải 3 là 2 đợt. Thử thách 2 đợt trong 30 giây.
- Mỗi đợt tối đa 7 con và chỉ một bầy nhỏ.

## Bài kiểm tra

Trước khi sửa, mọi bài đều qua (rules 82/82, fuzz 0 lỗi, env_rooms 90 phòng 0 lỗi, ui_input 92/92, ui_robust, ui_build; `smoke.py` báo lỗi chỉ vì thiếu tham số thư mục).

Lượt chạy cuối, trên đúng mã của commit này. Tất cả đều qua:

| Bài | Kết quả |
| --- | --- |
| `mapgen.py` (bộ sinh bản đồ) | 1000 hạt giống mỗi kiểu, 0 lỗi. Kiểu A ra 947 bản đồ khác nhau, B 1000, C 398. Bắt được bản đồ có lối tắt, thiếu phòng, thiếu điều kiện cửa. |
| `doors.py` (luật cửa và bản đồ) | 57/57 luật. Bot thắng 9/9 ải thử: ba kiểu A, B, C, mỗi kiểu ba ải, có ghé và không ghé phòng phụ. |
| `rules.py` (ba hệ, dấu ấn, trùm thích nghi) | 82/82 |
| `fuzz.py` (bấm loạn, 4 hero x 4 vũ khí) | 16 lượt, 0 lỗi |
| `env_rooms.py` (vẽ mọi loại phòng, viết lại) | 108 phòng, 0 lỗi |
| `ui_input.py all` (chạm, chuột, bàn phím thật) | phone 113/113, p169 113/113, port 113/113, desk 105/105 |
| `ui_robust.py` | 17/17, 1/1, 16/16 |
| `ui_build.py` (đóng gói rồi chơi thử hai file trong `dist/`) | 6/6 và 113/113 cho mỗi file |
| `fx_check.py` | 16 lượt, 0 lỗi |
| `anim_smoke.py` | 6 ải, không lỗi |
| `campaign.py` (15 ải liền trên bản lưu mới) | Qua đủ 3 vùng x 5 ải. Thua 1 lần ở ải 2-5 rồi thắng lần sau. Trung bình 237 giây một ải thắng, tổng 418 dấu ấn. |
| `python3 build.py` | Ghi `dist/linh-khi.html` và `dist/artifact.html`, 664 KB, 14 file JS |

`ui_input.py` có thêm các mục mới: chạm bản đồ nhỏ để mở và đóng bản đồ to, kéo cần đi qua cửa mở, cửa khóa không qua được, bản đồ nhỏ không đè lên ô vũ khí, nút bấm hay sàn phòng.

Bài mới thêm: `tests/mapgen.py`, `tests/doors.py`, `tests/balance.py`, `tests/room_shots.py`. Bài viết lại: `tests/env_rooms.py`. Bài sửa theo phòng mới: `bot.js`, `setup.js`, `fuzz.py`, `ui_input.py`, `ui_robust.py`, `ui_build.py`, `ui_shots.py`, `shots.py`, `fx_check.py`, `anim_smoke.py`, `probe.py`, `smoke.py`.

## Ghép với các nhánh khác

Phần lớn mã mới nằm trong ba file mới: `game/js/mapgen.js`, `game/js/room_art.js`, `game/js/minimap.js`. Ba thẻ script được thêm vào `index.html` ngay sau `village.js` (cách xa chỗ nhánh chiêu thức thêm `moves.js` và `fx_he.js`). `build.py` tự lấy danh sách file từ `index.html` nên không phải sửa.

Tôi đã ghép thử ba chiều với `claude/chieu-thuc-va-he` (lúc nó ở commit `8c11bc1`):
- `combat.js`, `fx.js`, `index.html`, `tests/bot.js`, `hero_art.js`: ghép sạch, không xung đột.
- `tests/ui_input.py`: một chỗ xung đột nhỏ, hai bên mỗi bên thêm một dòng vào cùng chỗ. Cách sửa: giữ cả hai dòng.
- Bản ghép thử (có `moves.js`, `fx_he.js`) chạy được: bot thắng 4 ải thử ở ba kiểu bản đồ với kiếm, giáo, búa.

Những chỗ đã sửa trong file dùng chung:

| File | Sửa gì |
| --- | --- |
| `game/js/combat.js` | Chỉ 3 dòng. Hàm `G.inZone`: vùng tròn dùng `G.ZK`. Quái bắn xa: `const want = Math.min(150, (W.x1 - W.x0) * 0.45)`. Phần vẽ vùng `team: 'fx'`: dùng `G.ZK`. Không động vào phần đòn đánh của người chơi. |
| `game/js/stage.js` | Viết lại nhiều: vào ải theo bản đồ, dựng phòng, cửa, chuyển phòng, sinh quái trong phòng, giao diện trong ải. Nhánh chiêu thức không sửa file này. |
| `game/js/boss.js` | Vị trí xuất phát của bốn loại trùm, hàng lao và sóng của Ngư Tinh, nước dâng, đường lao của trùm nhỏ, chỗ Mộc Tinh dừng khi lết. |
| `game/js/fx.js` | 8 dòng lẻ: các chỗ dùng 0,6 cho vùng tròn đổi sang `G.ZK`; hiệu ứng nổ, sóng và lấp lánh giới hạn trong sàn phòng thay vì cả màn hình. |
| `game/js/art.js` | `A.zone` dùng `G.ZK`; bóng của quái, trùm nhỏ, Mộc Tinh tròn hơn; vòng nổ của Hồ Tinh khớp vùng mới. Không sửa phần hero và vũ khí. |
| `game/js/env_art.js` | Một dòng: bóng đồ vật tròn hơn. Phần nền phòng cũ còn nguyên nhưng game không dùng nữa. |
| `game/js/data.js` | Thêm `G.ROOM_WAVES` và `G.ZK`. `G.GY0`, `G.GY1` còn đó nhưng phòng mới không dùng. |
| `game/js/village.js` | Hai câu trong trang Hướng dẫn. |
| `game/index.html` | Thêm 3 thẻ script. |
| `game/README.md` | Cách chơi, bảng file, danh sách bài kiểm tra. |
| `game/dist/*` | Đóng gói lại. |

Không sửa `hero_art.js`, `engine.js`, `main.js`.

Lưu ý cho phiên làm hero mới và chiêu thức:
- Toạ độ thế giới giờ trùng toạ độ màn hình, không còn cuộn ngang. Sàn phòng thường: x từ 145 đến 335, y từ 64 đến 248. Mã mới nên đọc `W.x0`, `W.x1`, `W.y0`, `W.y1`, `W.geo` thay vì số cứng.
- Phòng hẹp 190 điểm ảnh: đòn lao xa (kiếm 92, giáo 112) và tên bay 320 giờ chạm tường sớm. Tôi không chỉnh vì đó là phần đòn đánh của người chơi.
- Mỗi phòng có thêm một "đồ vật" kiểu `roomFore` trong `W.props` (lớp phủ trước của phòng). Nó không có `act` hay `env` nên mã cũ bỏ qua, nhưng đừng lấy đồ vật theo số thứ tự.
- Bản lưu có thêm khóa `lastKind` (kiểu bản đồ vừa chơi).

## Chỗ còn yếu hoặc chưa làm

- **Bot mất máu nhiều hơn khoảng một phần năm** (96% so với 79% máu tối đa mỗi ải), rõ nhất ở ải 4 và trận trùm vùng. Tỉ lệ thắng gần như cũ, nhưng phòng nhỏ khó né hơn. Nếu người chơi thật thấy khó, giảm `pts` và `ptsLate` trong `G.ROOM_WAVES`.
- **Chưa có người thật chơi thử.** Mọi số đo là của bot.
- **Kiểu B còn một kẽ hở đã biết từ bản phác thảo:** người chơi có thể ghé Suối hồi sớm, dùng suối, rồi mới đi đánh tiếp. Suối chỉ dùng được một lần mỗi ải. Dòng "Trùm đã học" thì luôn tính lại mỗi lần vào phòng suối.
- **Bóng của hero chưa tròn hơn** vì nằm trong `hero_art.js`, file tôi không được sửa. Hero sắp thay nên để phiên đó làm.
- **Trùm vẫn vẽ nghiêng** (Mộc Tinh, Ngư Tinh đứng sát tường phải) trong phòng nhìn từ trên. Đánh được trọn vẹn nhưng chưa vẽ lại cho hợp góc nhìn.
- **Màn hình 16:9 không có lề thừa:** trong phòng trùm, nút Né và Đặc biệt đè lên khoảng 18 điểm ảnh mép phải của sàn. Điện thoại dài hơn (đa số máy hiện nay) thì nút tự dời ra lề, không đè.
- **Cửa vào phòng trùm của Mộc Tinh và Ngư Tinh:** hai trùm này chắn bên phải, nên nếu bản đồ cho vào từ cửa phải thì người chơi được đặt lùi vào trong. Việc này chỉ xảy ra khi ép kiểu A hoặc B cho ải cuối lúc kiểm tra; trong game thật ải cuối luôn là Kiểu C, vào từ cửa dưới.
- **Đường lao của kiếm và giáo, tầm bay của tên** chưa chỉnh cho phòng hẹp (xem mục ghép).
- **Một vài hoạt ảnh của trùm** (vòng gai của Ngư Tinh) vẫn vẽ theo tỉ lệ dẹt cũ; vùng đỏ cảnh báo thì đã đúng.
- Bài `campaign.py` dao động mạnh giữa các lượt vì phụ thuộc đồ nhặt được; nên dùng `balance.py` khi cần so sánh.
