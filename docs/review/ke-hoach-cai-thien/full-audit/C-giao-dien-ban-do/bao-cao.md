# Rà soát toàn bộ — Phần C: giao diện điện thoại (mục 4) + bản đồ và tương tác (mục 5)

Phiên 12/10/2026, nhánh `khoi-tao-du-an`. Làm theo `../YEU-CAU.md` mục 4, 5 và quy trình mục 6–8. Chỉ sửa thể hiện / bố cục; không đổi cơ chế, số liệu, tiến trình, lưu mây, đăng nhập Google, `?cloud=0`.

## Cờ tắt

Mọi thay đổi của phiên nằm sau cờ **`G.RSC`** (bật sẵn). Mở game với đuôi **`?rsc=0`** là về đúng như trước phiên (ảnh "trước" trong báo cáo chụp bằng chính bản mới với `?rsc=0`). Riêng phần vùng chạm còn đi kèm cờ cũ `G.CHAM44` (`?cham44=0` tắt cả hai).

## Cách kiểm

- Bản HAI TỆP như web: `LK_HAI_TEP=1 python3 game/build.py --hai-tep`, phục vụ `game/dist` bằng `docs/review/kiem-thu-12-10/srv.py` (bản chép trong thư mục tạm có thêm thư mục con `anh/` và kiểu `.webp`, vì bản trong repo chỉ phục vụ tệp ở gốc nên ảnh rời WebP báo 404), mở `linh-khi-nhe.html?cloud=0`, giả lập điện thoại cảm ứng, tỉ lệ điểm ảnh 3.
- **Năm cỡ màn**, có giả lập vùng an toàn của iPhone thật (máy thử không có tai thỏ nên đặt biến CSS `--sa-*` bằng số của máy thật):

| Tên | Cỡ (pt) | Vùng an toàn trên/phải/dưới/trái | 1 đơn vị game = |
|---|---|---|---|
| iPhone SE ngang | 667×375 | 0/0/0/0 | 1,32 pt |
| iPhone 14 ngang | 844×390 | 0/47/21/47 | 1,37 pt |
| iPhone Pro Max ngang | 932×430 | 0/59/21/59 | 1,51 pt |
| iPad | 1024×768 | 0 | 2,07 pt |
| iPhone 14 cầm dọc | 390×844 | 47/0/34/0 | 1,37 pt (game tự xoay ngang) |

- **Bài kiểm mới** (đều ở `game/tests/`):
  - `au_giao_dien_c.py`: 30 cảnh × 5 cỡ màn (màn chào lần đầu và người cũ, truyện mở đầu, làng mới/cũ, Chú Lái Đò, Lò rèn 3 thẻ, Bà Hàng Xén 2 thẻ, Thợ May, Cụ Đồ 3 thẻ, Ông Từ, Anh Mõ trang 1–2, Hành trang, Xem vũ khí, trận đông quái ở 3 vùng, phòng trùm Rừng và Lâu đài, bản đồ lớn, màn dừng, hành trang trong ải, thắng, thua). Mỗi cảnh: chụp ảnh, đọc mọi nút đã vẽ ra pt (nút có vùng chạm < 44 pt, hình nút chồng nhau), ghi mọi chữ vẽ ra (chữ ra ngoài khung, cỡ chữ thật).
  - `au_lang_che.py`: quét 2.584 điểm đi được trong làng (lưới 6 điểm), đếm phần thân em bé còn thấy.
  - `au_vat_cao.py`: em bé đứng sau vật trang trí cao trong phòng ải.
- **Bài có sẵn** chạy trước (bản gốc 66d8093) và sau (bản sửa): `au_ui.py`, `au_onboarding.py`, `au_truy_cap.py`, `au_input.py` đều thoát mã 0, "lỗi JS: không có", "lỗi trang: []". So nhật ký: `au_ui` y hệt; `au_truy_cap` bớt 1 dòng chữ tương phản thấp ở phòng đánh; `au_input` chỉ lệch số khung tuyệt đối 2–3 khung (vòng lặp thật), thứ tự và kết quả trúng/hụt y hệt. `node game/tests/cloud_save_regression.test.js`: 7 PASS. `node --check` mọi tệp js: sạch. `python3 game/build.py` và bản hai tệp: chạy được. **0 pageerror** ở mọi bài.
- Chạm thật (Playwright touchscreen, iPhone SE): chạm 7,7 đơn vị trên mép nút "✕ Xong" của Lò rèn: bản cũ không nhận (vẫn ở bảng), bản mới nhận (về làng). Chạm 5 đơn vị: cả hai nhận.

## Danh sách lỗi theo mức độ

Ký hiệu nhóm: [GD] giao diện, [LỚP] render/lớp trước-sau, [GP] gameplay/va chạm.

### CAO

**C-1. [GD] Nút nhỏ hơn 44 pt trên iPhone thật (tai thỏ) và iPhone SE — ĐÃ SỬA**
- Tệp: `game/js/ui_theme.js` (hàm `no`, `T.chamMin`), `game/js/stage.js` (`hitBox`, vùng chạm nút Bản đồ).
- Hiện tượng: đo được ở iPhone SE và iPhone 14 có tai thỏ: "✕ Xong", mọi thẻ mục, "Về làng", "Lên đò", Bán hết…, thẻ Hàng Xén, nút Bản đồ phòng trùm… vùng chạm chỉ **41–42 pt** (bản cũ: SE 2–5 nút mỗi bảng, iPhone 14: 1–5 nút mỗi bảng; Pro Max và iPad đủ).
- Nguyên gốc (dùng chung): phiên Độ đọc trận đặt vùng chạm tối thiểu là **31 đơn vị game cố định**, tính với iPhone 844×390 **không có** vùng an toàn (1 đơn vị = 1,44 pt). Trên iPhone thật cầm ngang, game chừa 47 pt mỗi bên cho tai thỏ và 21 pt cho thanh Home nên khung nhỏ lại (1 đơn vị = 1,37 pt); SE còn 1,32 pt.
- Cách sửa: vùng chạm tối thiểu tính theo cỡ khung thật: `max(31, 44 pt / tỉ lệ)` (SE 33,5; iPhone 14 32,5), trần 40. Hình nút giữ nguyên, luật "chạm trúng hình nút nào thì nút đó nhận, phần nới thì nút gần nhất nhận" giữ nguyên. Ô Bình máu, nút Dừng, nút Bản đồ phòng trùm (không đi qua bộ nút chung) cũng theo số này.
- Sau sửa: **0 nút dưới 44 pt** ở cả 30 cảnh × 5 cỡ màn; 0 cặp nút có hình chồng nhau.

**C-2. [LỚP] Em bé đi vào chỗ bị che kín trong làng (sau tán đa, sau Ông Thợ Rèn, sau Chú Lái Đò) — ĐÃ SỬA**
- Tệp: `game/js/village_scene.js` (`VS.drawWorld`).
- Hiện tượng: 157/2.584 điểm đi được (6%) em bé thấy dưới 50% thân, 18 điểm **mất hẳn** (sau tán cây đa x 306–378, y 76–112); đứng sát sau Thợ Rèn hoặc Lái Đò cũng gần như mất (4–11%). Tester 2 đã báo "khuất hẳn dưới cái dù" (V10).
- Nguyên gốc: thứ tự lớp đúng (vật vẽ theo chân), nhưng chỗ đó đi được và không có gì báo em bé đang ở sau.
- Cách sửa: giống trong ải (`G.mobHeroOver`): khi em bé đứng sau một vật (khung vật chứa giữa thân bé, chân vật thấp hơn chân bé) hoặc ngay sau một người làng / một bé ngồi, vẽ thêm **bóng mờ 45%** của em bé lên trên. Không đổi chỗ đi được.
- Sau sửa: còn **9 điểm** dưới 50% (đều ≥ 20%, ở rìa vật). Ảnh `anh/truoc-sau-lang-bong-mo.jpg` (trái: trước, phải: sau; hàng 1 sau cây đa, 2 sau Thợ Rèn, 3 sau Lái Đò).

### VỪA

**V-1. [LỚP] Vật trang trí cao trong phòng ải không che người đứng sau nó — ĐÃ SỬA**
- Tệp: `game/js/room_art.js` (`ttMot`, `buildShell`, `RA.vatCao`), `game/js/combat.js` (danh sách vẽ theo chân).
- Hiện tượng: tượng đá Lâu đài cổ (cao 32), gốc cổ thụ Rừng già (20), mỏ neo Hang biển, chân nến, thùng gỗ… ở góc trên phòng. Em bé / quái đứng **sau** vật (chân cao hơn chân vật) vẫn bị vẽ **đè lên** vật: nhìn như đứng trước tượng.
- Nguyên gốc (dùng chung): mọi đồ trang trí vẽ ở lớp nền phòng (dưới mọi nhân vật), chỉ vật bấm được (lò lửa, nấm độc, tinh thể) mới vẽ theo chân.
- Cách sửa: lúc dựng phòng ghi lại các vật **đứng** cao từ 12 điểm (tượng, gốc cổ thụ, mỏ neo, chân nến, cột đá, thùng gỗ, gốc cây, bụi quả, đống đá; không tính vật nằm bẹt như vũng nước, khóm hoa, thảm); lúc vẽ trận chèn thêm một lần vẽ vật vào danh sách vẽ theo chân. Ai đứng sau thì bị vật che; viền sáng + bóng mờ em bé của phiên Độ đọc trận vẫn vẽ trên cùng nên vẫn thấy bé. Không va chạm, không đổi đường đi.
- Ảnh `anh/truoc-sau-vat-cao.jpg` (trái: trước, phải: sau; trên: gốc cổ thụ Rừng già, dưới: tượng Lâu đài cổ).

**V-2. [GD] Ô mẹo ở đáy phòng che chân em bé, quái, vùng báo đòn — ĐÃ SỬA**
- Tệp: `game/js/stage.js` (ô mẹo đáy giữa, phòng sàn rộng).
- Hiện tượng: ô mẹo vũ khí / lời chỉ dẫn hai dòng nằm y 244–269, lấn mép dưới sàn (sàn tới 248). Em bé, quái, vùng sát thương ở mép dưới bị ô che (thấy ở mọi cỡ màn, rõ nhất SE và iPad).
- Cách sửa: khi em bé, trùm, quái hoặc vùng sát thương của quái nằm dưới ô thì ô **mờ còn 35%**; đi ra thì hiện lại. Chữ và chỗ đặt ô giữ nguyên.
- Ảnh `anh/truoc-sau-o-meo-day.jpg` (trên: trước, dưới: sau).

**V-3. [GD] Chữ trên nút có thể lòi ra ngoài nút trên iPhone — ĐÃ SỬA (phòng ngừa)**
- Tệp: `game/js/ui_theme.js` (hàm `nhan`).
- Hiện tượng: thẻ Bà Hàng Xén "Nguyên liệu", "Mua đồ mặc", "Bán đồ mặc" chạm hoặc lòi qua viền thẻ (đo được ở mọi cỡ màn). Máy thử chỉ có phông dự phòng (Inter); trên iPhone game tải **Be Vietnam Pro** rộng hơn, nên những chữ vừa khít trên máy thử có thể lòi ra trên máy thật.
- Nguyên gốc (dùng chung): chữ nút tiếng Việt vẽ thẳng, không đo; chỉ bản tiếng Anh mới tự thu chữ.
- Cách sửa: chữ tiếng Việt cũng được đo; **chỉ khi dài hơn nút** mới thu cỡ dần (không dưới 6,5 đơn vị). Chữ vừa thì vẽ y như cũ (so trước/sau: ngoài 3 thẻ Hàng Xén, không chữ nút nào đổi cỡ ở 30 cảnh × 5 cỡ). Bỏ qua chữ có số (có thể là "số + tài nguyên" vẽ thành biểu tượng).
- Thẻ Hàng Xén còn được nới bề rộng theo chữ nếu băng tiêu đề còn chỗ; thực tế băng tiêu đề **không còn chỗ** (giữa tên bảng và thẻ đầu chỉ ~8 đơn vị) nên ba thẻ đang dùng chữ thu nhỏ (khoảng 8,6 pt trên SE, 9,8 pt trên Pro Max). Ảnh `anh/truoc-sau-the-hang-xen.jpg`. Xem mục "chưa xử lý" C-N1.

**V-4. [GD] Nút cao có hai dòng chữ: dòng dưới chạm răng cưa — ĐÃ SỬA**
- Tệp: `game/js/ui_theme.js` (`T.btn`). Ví dụ "Âm thanh, pin › / Đang tắt", "Ngôn ngữ / Tiếng Việt", "Tiết kiệm pin / 30 khung/giây" (Anh Mõ trang 1–2).
- Nguyên gốc: cặp chữ đặt lệch xuống 1 đơn vị so với giữa nút. Cách sửa: nút cao từ 28 có dòng phụ thì nâng cả cặp chữ 1 đơn vị. Ảnh `anh/truoc-sau-nut-hai-dong.jpg` (trái trước, phải sau).

### THẤP (ghi nhận, không sửa)

- **T-1. [GD] Truyện mở đầu: dải đen trên cùng** (khoảng 14 đơn vị) — cảnh làng vốn bắt đầu dưới thanh tài nguyên; ở khung truyện không có thanh nên lộ dải đen, chấm tiến độ nằm trên mép dải (`game/js/truyen.js`, `VS.drawWorld` dời `OY`). Trông như khung phim, không che gì. Để phiên Cốt truyện quyết.
- **T-2. [GD] Băng chữ "… xuất hiện" ở phòng trùm che đầu trùm** trong 4 giây đầu (Mộc Tinh, Hồ Tinh). Băng tự tắt, trùm chưa đánh ngay. Không sửa.
- **T-3. [GD] Chữ nhỏ nhất**: sàn chữ 7,5 đơn vị = 9,9 pt (SE) / 10,3 pt (iPhone 14 có tai thỏ) / 11,4 pt (Pro Max); chữ "tiny" 6,5 đơn vị (số trên ô vũ khí, "trống" trong ô đồ, số độc/cháy) = 8,6–9,8 pt. Đọc được nhưng dưới 11 pt khuyên dùng; nâng toàn bộ cần bố cục lại nhiều ô chật — chưa làm.
- **T-4. [GD] iPad: dải đen trên/dưới** (khung 16:9 trên màn 4:3, mỗi dải ~12%) — tester 2 đã báo (V11). Nút Né, Đánh dời ra dải đen dưới là đúng thiết kế. Cần ảnh nền kéo dài, xem "asset".
- **T-5. [GP] Đồ trang trí và tượng trong ải không có va chạm** (đi xuyên qua). Đúng thiết kế ghi trong code ("Chỉ là hình vẽ: không va chạm, không đổi luật"); thêm va chạm là đổi đường đi nên không làm. Đồ vật mang hệ (lò lửa, nấm độc, tinh thể) cũng đi xuyên được, là luật cũ.
- **T-6.** Hành trang: dòng "• Kiếm Rèn +3 · sát thương mỗi đòn …" vẽ dưới mép bảng — là phần cuộn (có thanh cuộn), bài đo báo "ra ngoài khung" là báo nhầm.

### Đã kiểm, không thấy lỗi

- Hướng dọc: game không có màn nhắc xoay; cầm dọc thì cả khung **tự xoay 90°** và đổi toạ độ ngón tay (`engine.js applyRot`), vùng an toàn đổi cạnh đúng. Ảnh `anh/sau-doc.jpg`: làng, màn chào, trận đều đủ nút, không bị cắt.
- Vùng an toàn: mọi thứ vẽ trên lớp giao diện nằm trong khung `#fit` (đã trừ vùng an toàn); ở iPhone 14 / Pro Max có tai thỏ giả lập không chữ, nút nào ra ngoài khung (0 chữ cắt mép ở 4 cỡ ngang).
- Thanh máu, mana, ô vũ khí, dải linh khí, bản đồ nhỏ, nút Chiêu/Chưởng/Né/Đánh, cần điều khiển: không chồng nhau, không đè sàn ở phòng thường (cột nút nằm trên tường phải), đủ 44 pt.
- Phần của phiên Độ đọc trận (`G.CHAM44`, `G.CHU_RO`): nút Dừng không còn che chữ "Bình máu", "132/300" vừa ô, "Chưa hệ", dấu phẩy thập phân, máu không âm, thẻ "Rèn đồ" ẩn — **vẫn đúng** trên cả 5 cỡ màn. Chỉ có số 31 đơn vị là thiếu khi có vùng an toàn (đã sửa ở C-1).
- Lâu đài cổ (trang trí kiểu Việt 9a6015ca): cờ đuôi nheo đỏ, đèn lồng, tượng đá, thảm lối cửa — nằm đúng mặt đất, đúng tỉ lệ, cùng phong cách; không còn cờ thánh giá.
- Làng: va chạm người làng, án thư, ao, bờ sông, cầu tàu (`VS.blocked`) — bài `au_onboarding` đi bộ tới từng người vẫn qua.

## Chuyển phiên khác (không sửa ở đây)

- Phần B (hiệu ứng): trận đông Lâu đài cổ có vũng lửa phủ kín khoảng 1/3 sàn dưới; mây độc của em bé vẫn che quái ở Rừng già (ảnh trận trong `anh/sau-se.jpg`).
- Phần A: kiếm của em bé trong trận vẫn dài gần bằng thân (thấy ở mọi ảnh trận).

## Chưa xử lý và lý do

- **C-N1. Bố cục thẻ Bà Hàng Xén**: bốn thẻ nằm chung băng tiêu đề, không đủ chỗ cho chữ cỡ thường. Cách đúng là chuyển thành hàng thẻ dưới tiêu đề như Lò rèn — đổi bố cục cả bảng (danh sách vũ khí, ổ khoá, nút Bán hết… dời xuống), thuộc loại "thay đổi lớn"; để phiên sau, nay chữ đã thu cho vừa thẻ.
- **Phông thật**: máy thử không tải được Be Vietnam Pro (mạng chặn fonts.googleapis.com, npm), mọi số đo chữ dùng phông dự phòng Inter. V-3 làm để chữ không tràn khi phông thật rộng hơn, nhưng **chưa nhìn bằng mắt trên phông thật**.
- T-1 … T-5: lý do ghi ở từng mục.

## Asset cần vẽ lại

Không có asset nào **bắt buộc** vẽ lại cho phần C. Một món tuỳ chọn:

- **Dải nền kéo dài cho iPad (T-4)** — ảnh tham chiếu `anh/sau-ipad.jpg`.
  PROMPT: "Pixel art, top-down 3/4 view, Vietnamese countryside village at dusk, matching the attached screenshot's palette and 2× pixel density. Make two seamless horizontal strips 960×120 px: the TOP strip continues the bamboo grove and treetops above the village; the BOTTOM strip continues the grass, dirt path edge and riverbank below. No characters, no UI, no text. Edges must tile left-right and blend into the existing image border. Transparent background not needed."

## Tệp đã đổi

- `game/js/ui_theme.js`: cờ `G.RSC`; `T.chamMin`; chữ nút tiếng Việt tự thu khi dài hơn nút; nâng cặp chữ hai dòng.
- `game/js/stage.js`: vùng chạm Bình máu / Dừng / Bản đồ phòng trùm theo `T.chamMin`; ô mẹo đáy mờ khi che người.
- `game/js/village.js`: thẻ Bà Hàng Xén rộng theo chữ khi còn chỗ.
- `game/js/village_scene.js`: bóng mờ em bé khi bị vật / người làng che.
- `game/js/room_art.js`, `game/js/combat.js`: vật trang trí đứng cao vẽ lại theo chân.
- `game/tests/au_giao_dien_c.py`, `au_lang_che.py`, `au_vat_cao.py`: bài kiểm mới.
- `game/dist/*`: gói lại.

## Vùng chưa kiểm đủ

- Safari thật trên iPhone (thanh địa chỉ ở hướng ngang làm cao màn hình còn ~320–340 pt khi chưa "Thêm vào màn hình chính") — chỉ giả lập Chromium, chưa đo cỡ đó.
- Phông Be Vietnam Pro thật (xem trên).
- Tiếng Anh (`ngon_ngu_en.js`): chỉ chạy tiếng Việt.
- Các bảng phụ trong ải: rương chọn thưởng, thương nhân, bàn thờ lời nguyền, Suối hồi, kho đồ — có trong mã nhưng bài chụp chưa mở từng bảng (bài vào phòng bằng `testGoto` chưa bấm vào vật).
- Bảng vàng, hộp mời đăng nhập, hộp góp ý (cần mây) — không kiểm vì chạy `?cloud=0`.
- Làng ở mọi giờ trong ngày / mọi mốc tiến trình (người làng mới về như Cô Thợ May ẩn khi chưa mở) — chỉ quét bản lưu cấp 14.
- Va chạm/đường đi trong ải: chỉ đọc mã (`propSpot` tránh lối cửa và chỗ đứng đầu phòng, đồ trang trí không va chạm); không chạy lại `au_mapgen.py` (bài dài, không đổi gì ở sinh phòng).

## Ảnh

Thư mục `anh/` (JPEG nén):
- `sau-se.jpg`, `sau-ip14.jpg`, `sau-promax.jpg`, `sau-ipad.jpg`: 9 cảnh sau sửa ở mỗi cỡ (màn chào, truyện, làng, Hàng Xén, Anh Mõ, Hành trang, trận Rừng, trùm Rừng, thắng). `sau-doc.jpg`: cầm dọc.
- `truoc-sau-*.jpg`: so trước/sau từng mục ở trên.
