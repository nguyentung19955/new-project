# Báo cáo: Xưởng Sprite (công cụ tự vẽ quái, em bé, đồ và người làng)

## Đã làm

**Công cụ web** `tools/xuong-sprite/index.html` (một tệp tự chứa, tiếng Việt, chủ đề trống đồng như game; đăng thêm ở https://spiritblade.web.app/xuong-sprite.html). Năm bước:

1. **Chọn**: 36 quái (tên tiếng Việt, kèm hình code hiện tại để so), em bé (cả bốn hoặc từng bé), **Quái mới** (đặt mã và tên).
2. **Đưa hình**: kéo thả hoặc chọn ảnh PNG/JPG (ảnh chụp tranh giấy được). Tự tách nền (từ mép vào hoặc mọi chỗ cùng màu, chịu được giấy loang), bỏ đốm bẩn, bút giữ lại và cục tẩy có hoàn tác, lật hình, tự cắt sát, thu về chiều cao của quái gốc (có thanh chỉnh), giảm màu (3 đến 32 màu), viền tối 1px.
3. **Khung cơ thể**: 7 mẫu (Người, Bốn chân, Cua/bọ, Cá/chim bay, Khối mềm, Rắn, Cây). Gợi ý mẫu theo kiểu đi của quái gốc. Kéo khớp, tô bộ phận, "Tự đoán". Đổi cỡ ở bước 2 vẫn giữ chỗ đã tô.
4. **Chuyển động**: đứng thở, đi, chuẩn bị đánh, đánh, trúng đòn (chớp trắng và giật lùi), chết (em bé thêm né lăn); quay trái/phải; nền phòng thật của vùng, em bé thật cạnh bên, hình code để so, phóng to; thanh biên độ và tốc độ.
5. **Xuất tệp**: `<mã>.sprite.json` (tấm sprite PNG dạng data URL, khung, điểm chân, khớp, bộ phận, thông số) và `<mã>.png`; **Mở tệp** để sửa tiếp; tự lưu nháp trong máy (localStorage, có bọc lỗi, đầy bộ nhớ thì bỏ ảnh gốc và báo).

**Xem trong game**: nút mở bản game thử (`xuong-sprite-thu.html`) ngay trong công cụ: vào phòng của vùng quái đó, quái dùng hình đang làm đánh nhau thật, có nút "Cho bé tự đánh" và "Gọi quái lại". Bé không chết. Trang thử tắt ghi bản lưu và lưu mây nên không đụng bản chơi thật. Quái mới tạm mượn chỗ một quái có sẵn (chọn được).

**Đưa vào game**: bỏ tệp vào `game/art/custom/`, `game/build.py` tự nhúng khi đóng gói; `game/js/sprite_custom.js` vẽ quái/em bé có tệp bằng hình tự vẽ, còn lại vẫn hình code. Hiệu ứng chém, bóng, đạn, vùng báo trước và thời lượng các đòn vẫn của game, nên luật chơi và cân bằng không đổi. Thư mục chỉ có `.gitkeep` thì bộ nạp không nối vào đâu: game y hệt trước. Chi tiết: [DUA-VAO-GAME.md](DUA-VAO-GAME.md). Cách dùng: [HUONG-DAN.md](HUONG-DAN.md).

**Đăng**: `.github/workflows/linh-khi-hosting.yml` chép thêm `xuong-sprite.html` và `xuong-sprite-thu.html` lên site. Giữ nguyên bước chặn "còn G.GRIT thì không đăng" và bước dọn giữ 2 bản.

## Đợt 2: vũ khí, trang phục, vật phẩm

- Công cụ có thêm 40 vũ khí (4 loại × 10 dòng, làm được riêng từng hệ và giai đoạn thức tỉnh), toàn bộ trang phục của game (mũ, áo, đồ lưng, bùa và vật cầm tay, dấu mặt nạ, cánh) và 13 vật phẩm rơi ra.
- Vũ khí: chấm điểm cầm, mũi, hai đầu dây cung; xem trên tay em bé khi đứng, chạy, đánh, né, trúng đòn; ô đồ và đồ rơi; thử bốn bậc.
- Trang phục: kéo đặt món đồ lên em bé (so với em bé mặc đồ gốc), nhích từng điểm ảnh, chọn lớp, kiểu bùa, tay áo; xem cả bốn em bé.
- Vật phẩm: xem đồ rơi nảy trên sàn và biểu tượng trên giao diện, so với hình gốc.
- Xem trong game: cầm đúng vũ khí, mặc đúng món đồ (đồ khởi đầu thì chọn em bé có món đó), thả vật phẩm quanh em bé.
- Game: `js/sprite_custom.js` thêm phần đồ; sửa nhỏ, không đổi hành vi: `js/hero_tinhlinh.js` có thêm `G.tinhLinh.clearCache()`, `js/do_roi.js` hỏi hình tự vẽ trước khi vẽ đồ rơi và có `G.doRoi.xoaNho()`.
- [PROMPT-AI.md](PROMPT-AI.md): bộ prompt nhờ AI vẽ (mỗi dòng một ảnh, theo bộ) và các câu giữ AI không vẽ lệch.
- Bài kiểm tra `xuong_sprite.py` thêm phần đồ: **86/86 mục đạt**.

## Đợt 3: giữ nét và đứng yên từng bộ phận (theo góp ý dùng thử)

Góp ý 1: "Tool làm nhòe quá nhiều chi tiết đẹp". Chủ dự án chọn **thu nhỏ giữ nét, cỡ trong game giữ nguyên**.

- Cách thu nhỏ mới **Giữ nét** (mặc định): mỗi điểm ảnh lấy màu chiếm nhiều nhất trong ô (không lấy trung bình), ưu tiên nét tối, nối viền đứt, ưu tiên viền ở mép ngoài, cứu chi tiết nhỏ nổi bật (mắt, chuông). Giảm màu giữ đúng màu có thật trong hình. Kiểu **Mềm** (cũ) vẫn chọn được; tệp làm từ trước tự giữ kiểu Mềm.
- Số màu mặc định 20 (tối đa 32). Viền tối 1px chỉ ở mép ngoài (không đè lỗ, khe bên trong), có nút bật tắt.
- Xem **So sánh cạnh nhau**: ảnh gốc (tô đỏ chỗ chi tiết sẽ mất, đếm số mảng mất) | cỡ game phóng to | cỡ thật trong phòng game cạnh em bé gốc.
- Em bé thử (áo trùm đỏ, mặt nạ giấy, chuông, găng to) ở 28 điểm ảnh: điểm màu pha trộn **17 → 0**, viền mép ngoài liền **81% → 91%**, mặt nạ giấy còn **23 → 36** điểm đúng màu, vẫn còn chuông vàng, mắt, miệng, má hồng.

Góp ý 2: "Tool đang làm cử động cả đầu". Chủ dự án chọn **tự chọn từng bộ phận**.

- Bước Chuyển động có ô **Đứng yên** cho từng bộ phận và thanh **Độ nhún cả người** (0% = không nhún). Bộ phận đứng yên không xoay, lắc, nhún riêng, chỉ đi theo bộ phận cha. Thân đứng yên thì cả hình đứng yên (trừ ngã khi chết và lăn khi né).
- Mẫu **Người** (em bé) mặc định: **đầu và thân đứng yên, không nhún, chỉ tay chân cử động**. Mẫu khác giữ mặc định cũ.
- Tệp `.sprite.json` có thêm `dung_yen` (danh sách bộ phận) và `nhun`; `game/build.py` nhúng hai mục này; `game/js/sprite_custom.js` đọc (`sp.dungYen`, `sp.nhun`, `G.spriteCustom.dungYen(mã, bộ phận)`). Game chỉ phát từng khung đã dựng, không tự thêm nhún lắc, nên bộ phận đứng yên cũng đứng yên trong game. Tệp cũ không có hai mục: đọc và chạy y như trước.
- Bài kiểm tra `xuong_sprite.py` thêm 23 mục (giữ nét so với kiểu cũ, viền mép ngoài, mặc định em bé, đầu và thân không đổi vị trí, góc qua mọi khung của đứng thở, đi, chuẩn bị đánh, đánh, trúng đòn trong công cụ; đầu đứng yên trong game qua 32 khung đứng thở và chạy; tệp cũ mở được trong công cụ và game): **109/109 mục đạt**.
- Ảnh: [giu-net-truoc-sau.png](giu-net-truoc-sau.png), [chi-tay-chan.gif](chi-tay-chan.gif), [buoc-2-so-sanh.png](buoc-2-so-sanh.png), [buoc-4-dung-yen.png](buoc-4-dung-yen.png), tạo bằng `game/tests/xuong_sprite_giu_net_shots.py`.

- Đã gộp `khoi-tao-du-an` mới nhất (có phần Chuông), đóng gói lại, chạy lại: `xuong_sprite.py` 109/109, các bài cũ (anim_smoke, balance, ban_do, bao_truoc, campaign, cay, chuong, cong, cung, do_roi, doors, dps, env_rooms, fuzz, fx_check, hanh_trang, linhkhi, mapgen, moves, perf, quai, rules, tam_huong, trang_phuc, ui_build, ui_input, ui_robust) đều đạt; `may.py` vẫn 2 mục hỏng như bản gốc (404 của máy chủ thử).

| Trước / sau giữ nét | Chỉ tay chân cử động (phải) |
|---|---|
| ![](giu-net-truoc-sau.png) | ![](chi-tay-chan.gif) |

## Đợt 4: trang chọn chia nhóm, vũ khí nằm ngang, người làng

- **Trang chọn** chia sáu nhóm: Em bé (5) · Quái (36, ba vùng và Quái mới) · Vũ khí (40) · Trang phục (51) · Đồ và tài nguyên (14) · Người làng (7). Mỗi lần hiện một nhóm, thẻ nào cũng có hình code để so; công cụ nhớ nhóm mở lần trước. ![](chon-nhom-vu-khi.png)
- **Vũ khí**: vẽ nằm ngang mũi sang phải (đúng kiểu prompt mới) hay dựng đứng đều được, công cụ tự đặt điểm cầm và mũi; thanh cỡ là chiều dài vũ khí; **chạm vào chuôi** là đặt điểm cầm; bước xem có **Tám hướng** (đúng đường vẽ của game). Game vẫn tự thêm ánh hệ, vệt chém; làm được một hình cho cả dòng hoặc riêng từng hệ, giai đoạn như trước.
- **Trang phục**: ba dáng nhỏ Đứng · Đi · Đánh ngay khi kéo đặt món đồ lên em bé mẫu, và cảnh ba dáng to ở bước xem.
- **Đồ và tài nguyên**: thêm biểu tượng Kinh nghiệm; "Xem trong game" có nút sang làng để thấy biểu tượng ở dải tài nguyên góc trên. Một hình dùng ở mọi chỗ (góc màn hình, Hành trang, giá bán, đồ rơi).
- **Người làng** (mới): bảy người, khung Người, hai động tác Đứng thở và Nói chuyện vẫy tay; thay hình trong làng, dải khuôn mặt, khung nói chuyện. "Xem trong game" mở thẳng làng, em bé đứng cạnh người đó, có nút mở khung nói chuyện.
- **Game** (chỉ đổi hình, không đổi luật chơi, cân bằng, giao diện người chơi): `js/sprite_custom.js` thêm phần người làng; `js/village_scene.js` thêm hai chỗ hỏi hình tự vẽ (`VS.tuVe`, `VS.tuVeMat`, chỉ được gắn khi có tệp `nl-…`) và `VS.npcCode` cho công cụ so hình. Thư mục `game/art/custom/` chỉ có `.gitkeep` thì game y hệt trước.
- **Prompt**: [PROMPT-VE.md](PROMPT-VE.md) phần 2: 40 vũ khí, 51 trang phục, 14 đồ và tài nguyên, 7 người làng, mỗi món một dòng prompt đầy đủ có nét phá cách dân gian (`Twist:`), kèm đoạn "Phong cách chung cho đồ vật".
- Kiểm tra `game/tests/xuong_sprite.py` thêm phần đợt 4: **141/141 mục đạt** sau khi gộp đợt 3 (giữ nét) (trong đó: kiếm vẽ nằm ngang xoay đúng tám hướng quanh điểm cầm, khăn xếp theo đứng/đi/đánh/lăn né, quặng tự vẽ ở dải tài nguyên và Hành trang, Chú Lái Đò trong làng, dải khuôn mặt và khung nói chuyện, người làng khác vẫn hình code, xoá tệp thì về hình code). Ảnh trước/sau: `game/tests/xuong_sprite_them_shots.py`. Chạy lại các bài cũ: đều đạt, trừ `may.py` (2 mục 404 của máy chủ thử, bản gốc cũng vậy), `ghep2.py` 1 mục vành gai rễ Mộc Tinh (bản gốc `khoi-tao-du-an` hỏng y hệt, không liên quan Xưởng Sprite) và `cay.py` (mô phỏng cân bằng ngẫu nhiên: lần chạy đầu đạt, lần sau lệch ngưỡng một ải; lần này không đổi luật chơi hay cân bằng).

| Trước / sau | |
|---|---|
| Làng | ![](truoc-sau-lang.png) |
| Khung nói chuyện | ![](truoc-sau-noi-chuyen.png) |
| Hành trang | ![](truoc-sau-hanh-trang.png) |
| Trong trận | ![](truoc-sau-tran.png) |

## Đợt 5: sửa vỡ hình và Tự đoán (theo góp ý dùng thử)

Góp ý: "hay bị bẻ vỡ hình" khi cử động, và "Tự đoán cũng không ok" với ảnh thật (ảnh vẽ AI: em bé áo trùm đỏ, mặt nạ giấy,
găng to, nhìn chính diện hơi nghiêng). Ảnh thật không có trong máy làm việc nên dùng năm ảnh giả lập kiểu ảnh AI
(`game/tests/xuong_sprite_ai.py`: em bé áo trùm đỏ chính diện, em bé áo xanh, quái bốn chân, cá bay, khối mềm).

**Nguyên nhân vỡ hình (đo trên ảnh thử):**
- Tự đoán cũ chia theo tỉ lệ khung cố định: với ảnh chính diện, "tay" bị cắt từ giữa áo, "chân" cắt chéo qua người, nên khi
  cử động là cả mảng áo bị bẻ đi.
- Chỗ thân bị tay chân che bị khoét trống: tay xoay ra là lộ lỗ giữa hình (em bé áo đỏ: 113 điểm lỗ kín qua các động tác).
- Tay áp sát thân bị xoay góc lớn (đánh 60 đến 70 độ) nên rách cả vai.
- Xoay lấy điểm thẳng nên mép răng cưa, khe một điểm ở khớp; viền khép miệng khe hẹp thành lỗ.

**Đã sửa** (`tools/xuong-sprite/nguon/khung.js`): lấp chỗ khoét bằng màu thân xung quanh (vẽ dưới cùng, theo thân); mép
thân dư ở khớp đi theo bộ phận (vá khớp, giữ viền); giới hạn góc xoay theo độ dính sát thân; xoay quanh khớp bằng cách lấy
điểm gần nhất trên hình phóng to kiểu Scale2x (không răng cưa, không màu mới); thứ tự lớp (tay sau dưới thân, tay trước
trên thân); vá lỗ kín và khe một điểm mới sinh ra (lỗ có sẵn trong hình vẽ giữ nguyên); lỗ nhỏ do viền khép thì tô màu viền.
Kết quả: năm ảnh thử, mọi động tác, mọi khung, cả bảy mẫu khung: **0 lỗ kín mới, 0 mảnh rời** (kiểu cũ: 21 đến 113 điểm lỗ).

**Tự đoán mới** (`tools/xuong-sprite/nguon/tu-doan.js`): theo độ dày (lõi dày và nhánh mỏng), chỗ thắt (cổ), khe giữa
các chân từ đáy lên, mảng màu riêng sát mép (găng, bàn tay khi tay áp sát thân), cổ dự phòng theo mảng màu mặt khi mũ trùm
liền áo; đặt khớp theo kết quả. Không chắc thì để dính thân, hiện "Tô thêm cho đúng". Tô tay: bút 1 đến 10, cục tẩy trả về
thân, phóng ×2 ×3, kéo hình, hoàn tác, nút to hơn trên màn hình cảm ứng.

| | |
|---|---|
| Trước / sau khi cử động | ![](sua-vo-truoc-sau.gif) |
| Tự đoán cũ / mới | ![](tu-doan-truoc-sau.png) |

Ảnh do `game/tests/xuong_sprite_sua_vo_shots.py` tạo. Bài kiểm tra: phần 8 của `game/tests/xuong_sprite.py`.
Phần 9 (`game/tests/xuong_sprite_vo.py`, ảnh giả lập thêm ở `xuong_sprite_ve_ai.py`) đo thêm **khe ở khớp**: điểm trống kẹp giữa
bộ phận con và bộ phận nó gắn vào (trừ khe có sẵn trong hình vẽ, như giữa hai vây cá). Tắt phần vá thì đếm được 1 đến 11 điểm khe
mỗi động tác; bật lên thì 0 ở cả 6 ảnh thử (có ảnh vẽ tay), cả 7 mẫu khung, cả khi chia theo khớp kiểu cũ; chạm để tô trên
điện thoại cầm ngang, nút ở bước Khung cao từ 36 điểm. Cả bài `xuong_sprite.py`: **191/191 mục đạt**.

**Bổ sung (phiên kiểm tra lại, 09/10):** đo lại bằng một bộ ảnh thử khác (em bé chibi tay áp thân, heo, cá chuồn, khối mềm,
cả ba ảnh vẽ tay cũ; 7 mẫu khung; biên độ 100% và 200%) và đếm trên **khung có viền** (đúng hình người chơi thấy):
- Còn một lỗi: bộ phận khi thu nhỏ bị tách thân 1 đến 3 điểm ảnh (đuôi con mèo vẽ tay) ở dáng đứng chỉ dính thân nhờ nét viền,
  cử động là **bay rời** (85 điểm rời khỏi thân ở động tác đứng thở). Bài cũ không bắt được vì đếm mảnh rời trên hình chưa có viền.
- Còn khe rộng 1 điểm ngoài thân (giữa tay và thân khi tay xoay ra): 2 đến 12 điểm mỗi động tác, nhìn như vết rách.

Đã sửa (`khung.js`): **cầu nối** vài điểm màu nét nối bộ phận tách rời với chỗ nó gắn vào (chỉ thêm khi cách nhau từ 1 đến 3 điểm);
**khe 1 điểm ngoài thân tô màu viền** thành nét viền liền (khe có sẵn trong hình vẽ giữ nguyên). Sau sửa: 0 mảnh rời, 0 khe mới
ở mọi ảnh thử, mọi mẫu khung. Bài `xuong_sprite_vo.py` thêm 2 mục (đếm trên khung có viền, đuôi mèo được nối):
`xuong_sprite.py` **193/193 mục đạt**, `rules.py` 82/82.

![Trước / sau: đuôi mèo vẽ tay không còn bay rời khi đứng thở, đi](cau-noi-truoc-sau.png)

## Kiểm tra

- `game/tests/xuong_sprite.py`: **65/65 mục đạt**. Ảnh vẽ tay giả lập trên giấy trắng loang có vết bẩn → tách nền (góc trống, giữ tròng mắt trắng), đúng cỡ, giảm màu, cục tẩy và hoàn tác, mẫu gợi ý, tự đoán đủ bộ phận, kéo khớp và tô bằng chuột, mọi khung đều có hình và có cử động, tốc độ và biên độ, tải về và mở lại tệp, nháp còn sau khi tải lại trang, em bé; xem trong game (quái mới đứng vào chỗ Cua Lính ở Hang biển, bé tự đánh, không ghi bản lưu); bỏ tệp vào `game/art/custom/`, đóng gói, vào game: Heo Rừng Con và em bé dùng hình mới ở mọi cử động, lật gương đúng, chớp trắng, chết mờ dần, quái khác vẫn hình code, thời lượng đòn như cũ, trận 4 giây không lỗi; xoá tệp thì về hình code. Cuối bài thư mục chỉ còn `.gitkeep`.
- Các bài cũ chạy lại đều đạt: rules, bao_truoc, tam_huong, ghep (109/109), ghep2, linhkhi, quai, anim_smoke, balance, ban_do, campaign, cay, cong, cung, do_roi, doors, dps, env_rooms, fuzz, fx_check, hanh_trang, mapgen, moves, perf, trang_phuc, ui_build, ui_input, ui_robust.
- `tests/may.py` báo 2 mục hỏng ("404 khi tải script" của máy chủ thử) — **bản gốc `khoi-tao-du-an` cũng hỏng y hệt** trong môi trường này, không do thay đổi lần này. `smoke.py`, `quai_tam.py` là công cụ chụp ảnh cần tham số, không phải bài kiểm tra.
- Ảnh và GIF trong thư mục này do `game/tests/xuong_sprite_shots.py` tạo.

## Ảnh

| | |
|---|---|
| Trước / sau trong phòng game | ![](truoc-sau-trong-phong.png) |
| Bước 2: tách nền | ![](buoc-2-tach-nen.png) |
| Bước 3: khung cơ thể | ![](buoc-3-khung.png) |
| Bước 4: chuyển động | ![](cong-cu-xem-chuyen-dong.gif) |
| Xem trong game | ![](xem-trong-game.png) |
| Động tác (quái, em bé) | ![](dong-tac-heo-tu-ve.gif) ![](dong-tac-em-be-tu-ve.gif) |

## Giới hạn, việc có thể làm sau

- Hình tự vẽ chỉ có một dáng gốc; động tác được tạo bằng xoay, uốn từng bộ phận nên hợp nhất với hình vẽ tách rõ tay chân. Trùm 3 pha dùng chung một hình cho cả ba pha.
- Em bé tự vẽ: vũ khí vẫn do game vẽ ở chỗ tay của em bé gốc, nên vẽ em bé tay không và dáng gần giống em bé gốc.
- Quái mới chỉ vẽ được, chưa vào trận: cần xếp vào `G.MOB_ART` (và luật nếu có) khi chủ dự án muốn.
- Nháp lưu theo trình duyệt từng máy; muốn chắc thì tải tệp về.
