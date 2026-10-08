# Báo cáo: công cụ tạo sprite nhân vật từ ảnh tạo hình

Nhánh: `claude/cong-cu-sprite`. Hướng dẫn dùng: `tools/sprite/HUONG-DAN.md`.

## Tóm tắt

Công cụ đã chạy được trọn vẹn: đưa vào một ảnh tạo hình, khoảng 3 giây sau có bộ sprite 12 động tác,
64 khung hình, kèm điểm bàn tay và góc vũ khí cho từng khung. Bộ nạp cho game đã thử trong game thật,
chạy trọn một ải không lỗi. Hình ra nhìn giống pixel vẽ tay ở mức khá, rõ động tác, không rời khớp.

Điều quan trọng nhất cần biết: **công cụ mới chỉ được thử trên 2 ảnh do máy tự vẽ, chưa thử trên ảnh
tạo hình thật** (Pippit hay vẽ tay). Ảnh thật sẽ khó hơn, khả năng cao phải sửa tay file rig.json.

## Đã làm được

| Yêu cầu | Kết quả |
|---|---|
| A. Công cụ `tools/sprite/gen_sprite.py` | Xong. Chỉ dùng Pillow và numpy (không cần scipy) |
| Tách nền, thu về chiều cao chọn được, giảm màu, viền tối | Xong |
| Tách mảnh tự động theo hình bóng | Xong. Tìm cổ, khe chân, tay thò ra, đuôi |
| Tách mảnh theo file rig.json sửa tay | Xong. Đã sửa tay thật cho nhân vật hổ con |
| Ảnh `xem-khop.png` | Xong. Có thước số, hộp, điểm khớp, từng mảnh sau khi cắt, lời nhắc |
| Động tác: đứng thở 4, chạy 8, né lăn 6, trúng đòn 2, gục ngã 6, ra chiêu 5 | Xong |
| Kiếm 3 nhịp (5 khung mỗi nhịp), giáo 5, búa 7, cung 6 | Xong. Có lấy đà, vung, quá đà, thu về, co giãn nhẹ |
| Vũ khí không vẽ chết: xuất điểm tay, góc, lớp trước sau | Xong. Thêm độ kéo dây cung và cờ giấu vũ khí |
| `sheet.png`, `sheet.json`, `xem-truoc.png`, GIF từng động tác | Xong. Thêm `sheet.js` để nhúng |
| B. Bộ nạp `game/js/hero_sprite.js` | Xong. Hero chưa có sprite vẫn vẽ như cũ |
| C. Hai ảnh thử, nhìn bằng mắt, thử trong game | Xong. Ảnh ở `tools/sprite/out/trong-game.png` |
| D. Hướng dẫn và prompt mẫu | Xong |

Không sửa file nào ngoài phạm vi cho phép. `tools/requirements.txt` không cần đổi (đã có numpy và pillow).

## Chưa làm được, hoặc làm chưa tới

- **Chưa thử trên ảnh thật.** Hai ảnh thử là hình phẳng, sạch, tay chân tách rõ, đúng kiểu dễ nhất.
- **Trang bị không đổi hình.** Hero vẽ bằng mã đổi màu áo, mũ theo đồ đang mặc. Sprite thì luôn một bộ đồ.
- **Vũ khí vẽ bằng `A.weapon` đơn giản hơn** vũ khí mà `hero_art.js` đang tự vẽ (có hiệu ứng theo cấp, theo hệ).
  Chuyển sang sprite thì vũ khí trên tay hero sẽ trông giản dị hơn hiện tại, cho tới khi có `G.weaponArt`.
- **`G.weaponArt.draw` chưa tồn tại** nên tôi phải đoán cách gọi:
  `draw(c, vũ khí, x tay, y tay, góc, { pull, look, layer, face })`. Khi có thật, sửa một chỗ trong `hero_sprite.js` (đã ghi chú).
- **Cung chỉ cầm một kiểu**: game vẽ cung luôn dựng đứng, nên góc vũ khí không có tác dụng với cung.
- **Lướt (dash) và Gồng** chưa có động tác riêng. Lướt dùng khung trúng của đòn đánh, Gồng dùng thế đứng kèm hào quang.
- **Đòn đặc biệt** dùng lại động tác đánh (kiếm thì dùng nhịp 3).
- Giáo, búa, cung mỗi loại chỉ có 1 động tác, dùng chung cho cả 3 nhịp combo (đúng theo yêu cầu, nhưng nhịp 3 không khác nhịp 1).
- Tấm `sheet.png` nặng khoảng 32 KB mỗi hero, `sheet.js` khoảng 52 KB. Chưa nén bảng màu.

## Chất lượng thật khi nhìn bằng mắt

Tôi đã mở `xem-truoc.png`, ảnh phóng to từng động tác và ảnh trong game của cả hai nhân vật. Nhận xét thẳng:

Tốt:
- Hình đứng sạch, giống pixel vẽ tay. Mặt giữ nguyên qua các khung vì đầu luôn được giữ thẳng.
- Chạy đọc được rõ là chạy: chân gập gối, tay đánh ngược chân, người nhún.
- Búa là động tác đẹp nhất: giơ cao ra sau, khựng, bổ xuống, người chùng. Kiếm 3 nhịp khác nhau rõ.
- Không thấy chỗ nào rời khớp hay thủng lỗ ở hai nhân vật thử.

Chưa tốt:
- **Tay đè lên thân bị lẫn** khi tay và thân cùng màu (áo nâu tay nâu, hổ cam tay cam). Công cụ có tô nét tối
  quanh tay nhưng vùng ngực vẫn hơi rối. Đây là điểm xấu rõ nhất.
- **Khi vung về trước, tay trông ngắn.** Vai của tay cầm vũ khí nằm ở phía lưng (do góc nhìn 3/4), nên tay
  phải đi ngang qua ngực. Đã dịch vai ra trước vài điểm lúc vung để đỡ, nhưng không bằng vẽ tay.
- **Giơ tay cao thì tay che một phần đầu** (ra chiêu, kiếm nhịp 2, búa lúc giơ).
- **Né lăn chỉ tạm được**: là cả người co lại rồi xoay tròn. Nhìn ra là lăn, nhưng các khung giữa hơi rối.
- **Thân và tay chân khi nghiêng bị "bơi" điểm ảnh**: chi tiết nhỏ như đai lưng, sọc hổ đổi hình nhẹ giữa các khung.
- Hổ con tay rất ngắn nên đòn kiếm và cung của nó kém rõ hơn nhân vật người.
- Nằm gục: tư thế cuối ổn, nhưng hai khung đang ngã trông cứng như tấm ván đổ.
- Co giãn làm cả người bị lấy mẫu lại, mắt có thể méo 1 điểm trong khung đó (chỉ ở khung nhanh).

Đánh giá chung: dùng được ngay làm bản chạy thử trong game và hơn hẳn việc tự vẽ tay từng khung về tốc độ.
So với hoạt ảnh pixel vẽ tay của hoạ sĩ thì còn kém ở chỗ tay chân chồng lên thân.

## Giới hạn của cách xoay mảnh

Cách này cắt hình thành mảnh cứng rồi xoay quanh khớp. Vì vậy:

1. **Không vẽ được thứ ảnh gốc không có.** Không có mặt nhìn từ sau, không có bàn tay nắm, không có lưng.
   Tay sau và chân sau nếu bị che trong ảnh gốc thì là bản sao tô tối của tay trước, chân trước.
2. **Không xoay người được.** Chém ngang thật ra cần vặn thân; ở đây thân chỉ nghiêng trước sau.
3. **Áo dài, váy, áo choàng sẽ xấu**: chân bị cắt từ vạt áo, khi chạy vạt áo tách làm đôi. Đã thử một hình áo dài:
   công cụ không lỗi nhưng hình chạy không đẹp. Tóc dài, tà áo không tự bay.
4. **Phụ thuộc ảnh gốc.** Tay dính sát thân hay đè lên thân thì máy đoán khớp sai (đã gặp ở hổ con: máy đoán
   tay ngắn một nửa, phải sửa tay điểm vai). Nền có bóng đổ, nền trùng màu nhân vật cũng gây lỗi.
5. **Mảnh nhỏ thì xoay xấu.** Ở cỡ 40 điểm ảnh, tay chỉ dày 3 điểm. Xoay 45 độ thành bậc thang.
   Đã giảm bằng cách tính trên bản phóng 8 lần rồi thu về, nhưng không hết.
6. **Chỗ bị tay che được vá bằng màu bên cạnh**, không phải vẽ lại. Hoa văn phức tạp dưới tay sẽ bị bệt.
7. Động tác dùng chung cho mọi nhân vật. Chưa có cách chỉnh riêng (ví dụ Đô Vật đánh nặng nề hơn) ngoài sửa mã.

## Việc phiên điều phối cần làm để nối vào game

1. Trong `game/index.html`, thêm ngay SAU dòng nạp `js/hero_art.js`:
   ```html
   <script src="assets/hero/smith/sheet.js"></script>   <!-- mỗi hero có sprite một dòng -->
   <script src="js/hero_sprite.js"></script>
   ```
   `sheet.js` đã chứa sẵn `sheet.json` và `sheet.png` (dạng data URI). `game/build.py` gộp mọi thẻ script
   trong index.html nên **bản một file tự có sprite, không cần sửa build.py**. Đã thử trên một bản sao của
   thư mục game (không đụng file gốc): thêm hai dòng trên, chạy build.py, mở `dist/linh-khi.html`, hero smith
   vẽ bằng sprite, không lỗi. Bản một file nặng thêm khoảng 60 KB cho mỗi hero có sprite.
2. Nếu không muốn thêm dòng `sheet.js`: chỉ cần nạp `hero_sprite.js`. Nó tự tìm `assets/hero/<tên hero>/`.
   Cách này chỉ hợp bản chạy từ thư mục, không hợp bản một file. Hero chưa có sprite sẽ sinh một dòng báo
   thiếu file trong bảng điều khiển của trình duyệt, vô hại. Đặt `G.heroSpriteFetch = false` để tắt việc tự tìm.
3. Hiện chưa hero nào của game bị đổi hình: hai bộ thử nằm ở `game/assets/hero/thu-nguoi/` và `thu-ho-con/`,
   không trùng tên hero. Khi có ảnh thật, chạy công cụ với `--name smith` (hoặc hunter, healer, wrestler).
   Nên xoá hai thư mục thử trước khi phát hành.
4. Đã thử cả ba đường nạp: nhúng sẵn, tải json và png qua máy chủ web, tải `sheet.js` khi mở từ ổ đĩa.
5. Muốn xem thử ngay: `python tools/sprite/thu_trong_game.py`. Nó gán tạm smith thành `thu-nguoi`,
   hunter thành `thu-ho-con` qua `G.heroSpriteMap`, không sửa file game.

Game tính sát thương khi đòn đánh đi được 45%. Khung "trúng" của mọi đòn đã được căn để đang hiện đúng lúc đó.

## Đề xuất

1. **Thử ngay trên một ảnh Pippit thật** của Thợ Rèn. Đây là phép thử còn thiếu. Dành thời gian sửa rig.json.
2. Sửa prompt trong `art/prompts/pippit.md`: bỏ vũ khí khỏi mô tả (prompt hiện tại cho hero cầm kiếm, cung),
   thêm "A-pose, tay không". Tôi không sửa file đó vì ngoài phạm vi. Prompt mẫu có trong HUONG-DAN.md.
3. Để đỡ rối chỗ tay đè thân: dặn người vẽ cho tay áo khác màu thân áo, hoặc để tay trần.
4. Nếu muốn đẹp hơn nữa: cho phép hoạ sĩ vẽ đè lên vài khung chính (khung trúng đòn) rồi công cụ giữ lại
   các khung đã sửa khi chạy lại. Chưa làm.
5. Thêm tấm trang bị (mũ, áo) dạng lớp phủ theo điểm đầu và thân của từng khung, giống cách làm với vũ khí.
6. Thêm động tác riêng cho Lướt, Gồng, và nhịp 3 của giáo, búa, cung.

## Danh sách file

| File | Việc |
|---|---|
| `tools/sprite/gen_sprite.py` | Lệnh chính, xuất mọi kết quả |
| `tools/sprite/sprite_rig.py` | Tách nền, bảng màu, tự đoán khớp, cắt mảnh |
| `tools/sprite/sprite_anim.py` | Bộ xương, các tư thế, dựng khung |
| `tools/sprite/make_test_art.py` | Vẽ 2 ảnh thử |
| `tools/sprite/thu_trong_game.py` | Chụp ảnh thử trong game |
| `tools/sprite/HUONG-DAN.md`, `BAO-CAO.md` | Hướng dẫn và báo cáo này |
| `tools/sprite/out/` | Ảnh xem khớp, xem trước, GIF, ảnh trong game |
| `art/raw/thu/` | 2 ảnh thử và 2 file rig.json |
| `game/assets/hero/thu-nguoi/`, `thu-ho-con/` | Sprite thử cho game |
| `game/js/hero_sprite.js` | Bộ nạp sprite cho game |
