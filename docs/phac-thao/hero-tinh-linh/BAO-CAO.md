# Báo cáo: em bé tinh linh

Nhánh: `claude/hero-tinh-linh-2`. Làm theo lời chủ dự án: "nhân vật chibi hơn chút, cung hơi to hơn người, nhân vật số 3 đeo hồ lô", và câu hỏi "tinh linh thì mặc áo với mũ, sau này phát triển cánh thì sao".

Trả lời ngắn cho câu hỏi: **bé mặc đồ được**. Mỗi bé là một thân trần, cộng mũ, áo, đồ đeo lưng, cánh vẽ chồng lên. Đổi món nào thì hình đổi theo ngay. Xem ảnh `mac-do.png`.

## Ảnh nên xem trước

1. `bon-be-tinh-linh.png`: bốn bé bản mới, kèm vũ khí sống.
2. `mac-do.png`: bé tách lớp, sáu bộ đồ, cánh lớn dần, ba kiểu cánh theo hệ.

## Danh sách ảnh

Tờ phác thảo (giai đoạn 1):

| Ảnh | Nội dung |
| --- | --- |
| `bon-be-tinh-linh.png` | Tờ chính: bốn bé, ô "Lúc đang đánh", ô thay đồ, dải cỡ thật. |
| `mac-do.png` | Tách lớp có mũi tên, sáu bộ đồ, cánh ba cấp, ba kiểu cánh theo hệ, dải cỡ thật. |
| `truoc-va-sau.png` | Từng bé: bản cũ bên trái, bản mới bên phải, ghi điều đã đổi. |
| `moi-be-bon-vu-khi.png` | Lưới 4 bé nhân 4 loại vũ khí. |
| `dong-tac.png` | Một bé mặc đủ nón lá, áo tơi, cánh: đứng, chạy, né, trúng đòn, gục, ra chiêu, và đánh bằng từng loại vũ khí. |
| `co-that-phong-vuong.png` | Bốn bé ở cỡ thật trong phòng vuông nhìn từ trên, cạnh quái của game. |

Ảnh chụp từ game thật (giai đoạn 2):

| Ảnh | Nội dung |
| --- | --- |
| `trong-game-dung-chay.png` | Bốn bé đứng, chạy; thêm né, trúng đòn, ra chiêu, gục. |
| `trong-game-mac-do.png` | Một bé đổi qua mũ áo đang có trong game, món mới, và các cấp cánh. |
| `trong-game-danh-kiem.gif` | Thợ Rèn và kiếm sống: ba nhát chém rồi đòn đặc biệt. |
| `trong-game-danh-cung.gif` | Thợ Săn và cung rồng. |
| `trong-game-danh-giao.gif` | Thầy Lang và giáo sống. |
| `trong-game-danh-bua.gif` | Đô Vật và búa chiêng. |

## Điều đã đổi so với ảnh đã ưng

- Cả bốn bé chibi hơn: đầu to bằng nửa người, thân và tay chân ngắn, mắt to. Bé cao 25 điểm ảnh, chưa tính mũ.
- Thợ Săn: cung rồng cao khoảng 1,4 lần bé. Mũi tên cất vào ống tên đeo lưng.
- Thầy Lang: không cưỡi bầu nữa. Bầu hồ lô đeo sau lưng, có dây đỏ, miệng có lá, sủi bọt. Bé cầm cây giáo sống.
- Thợ Rèn: giữ ý cũ, bé áo đỏ cầm búa rèn tí hon, đi cùng thanh kiếm sống một mắt.
- Đô Vật: bỏ đôi nắm đấm bay. Bé quấn khăn đỏ, đeo găng đồng, cầm cây búa sống đầu to như chiêng đồng.
- Bộ áo trùm và mũ trùm trong ảnh cũ giờ là bộ khởi đầu, tháo ra thay được.

## Cách dựng lớp

Thứ tự vẽ từ sau ra trước:

1. Lưng: đồ đeo lưng (bầu hồ lô, ống tên, áo choàng, gùi tre), rồi cánh. Cánh có vỗ.
2. Thân trần: tay xa, chân, thân, đầu tròn, mặt nạ trắng.
3. Áo: phủ thân và tay.
4. Mũ.
5. Dấu trên mặt nạ, găng, đồ cầm tay.
6. Tay gần.
7. Vũ khí sống: trước hoặc sau bé tùy khung.

Mỗi món đồ không vẽ theo toạ độ màn hình. Nó vẽ theo "hệ thân" hoặc "hệ đầu" của bé. Khi bé nghiêng, lộn, bay ngang thì hệ này xoay theo. Nhờ vậy mũ luôn bám đầu, áo bám thân, cánh bám lưng. Tờ `dong-tac.png` cho thấy điều này.

Đang có: 13 mũ, 13 áo, 4 món lưng, 4 kiểu cánh nhân 3 cấp, 2 món tay, 5 dấu mặt nạ.

## Cách thêm một món đồ mới

Mở `game/js/hero_tinhlinh.js`, phần 3 "DANH MỤC ĐỒ MẶC". Thêm một dòng `def(...)`. Ví dụ một cái mũ:

```js
def('hats', 'mu_moi', 'Tên tiếng Việt', {
  draw: (cx, P) => { const H = cx.H; P((s) => { H.e(0, -7, 5, 3, STRAW); }); },
});
```

- `cx.H` là hệ đầu: tâm đầu ở (0,0), đầu rộng từ -6 đến 7, cao từ -6 đến 6.
- `cx.B` là hệ thân: chân ở y=0, vai ở y=-11.
- `P(...)` mở một miếng vẽ, tự có viền và sáng tối.
- Thêm `front: (cx, P) => ...` nếu món có phần phải đè lên mặt nạ (như vành nón).
- Áo có tay thì thêm `sleeve: () => MÀU`.
- Cánh mới: thêm một dòng vào bảng `WINGS` (màu, kiểu lá cánh, danh sách lá cho ba cấp).

## Cách nối file vào game

File mới chưa được nối. Muốn dùng, thêm đúng một dòng vào `game/index.html`, ngay sau dòng nạp `hero_art.js`:

```html
<script src="js/hero_tinhlinh.js"></script>
```

Khi đó:

- `G.art.hero` được thay bằng bản mới. Chữ ký giữ nguyên, mọi tùy chọn mà `combat.js`, `village.js`, `fx.js` đang truyền đều dùng được.
- Hàm cũ nằm ở `G.art.heroOld`. Nếu bản mới gặp lỗi lúc dựng hình thì tự gọi lại hàm cũ.
- Bỏ dòng script đi là game về như cũ.

Đồ mặc truyền qua `o.outfit = { hat, robe, back, hand, mask, wing: { kind, level } }`. Thiếu món nào thì lấy món khởi đầu của hero. Đặt `null` là tháo món đó ra. File cũng đọc `o.p.outfit`, nên chỉ cần gán `P.outfit = {...}` cho người chơi là thấy, không phải sửa `heroArgs`.

### Nối đồ đang có trong data.js

Game đã có mũ và áo trong `G.GEAR` (truyền qua `o.helm`, `o.armor`). File mới tự nối sang lớp mới qua bảng `G.heroLooks.fromGear`:

| Trong data.js | Món mới |
| --- | --- |
| `h_r1` Nón lá rừng | `non_la` |
| `h_r2` Mũ da cá | `mu_da_ca` |
| `h_r3` Khăn đá lửa | `khan_lua` |
| `h_moc` Mũ sừng gỗ | `mu_sung` |
| `h_ngu` Mũ vây cá | `mu_vay_ca` |
| `h_ho` Mũ tai cáo | `mu_tai_cao` |
| `a_r1` Áo vải thô | `ao_vai` |
| `a_r2` Áo da biển | `ao_da_bien` |
| `a_r3` Áo giáp đá | `giap_da` |
| `a_moc` Áo vỏ cây | `ao_vo_cay` |
| `a_ngu` Áo vảy | `ao_vay` |
| `a_ho` Áo lông trắng | `ao_long` |

Thứ tự ưu tiên: `o.outfit` trước, rồi mũ áo của game, rồi bộ khởi đầu. Cánh và đồ đeo lưng chưa có trong data.js và chưa có chỗ lưu trong bản lưu. Việc đó cần một phiên khác làm.

## Các trường xuất ra cho vũ khí

Vũ khí vẽ qua một hàm trung gian. Nếu có `G.weaponArt.draw` thì gọi:

```js
G.weaponArt.draw(c, opts, x0, y0, ang, pull)
```

- `c`: đã dời về chân bé và đã lật theo hướng mặt. Bên vẽ vũ khí chỉ cần vẽ như bé đang quay phải.
- `x0, y0`: điểm cầm, tính từ chân bé.
- `ang`: góc theo độ. 0 là chĩa về trước, âm là chĩa lên. Giống quy ước của `G.art.weapon` cũ.
- `pull`: độ kéo dây cung, từ 0 đến 1.
- `opts`: `type` (sword, bow, spear, hammer), `family` (fire, poison, ice hoặc null: hệ đang hiện, tính cả lớp phủ), `branch`, `stage` (0 đến 3), `rarity` (bậc 0 đến 2), `mood` ('idle', 'attack', 'hurt'), `t`, và `weapon` (nguyên món vũ khí của game).

Nếu chưa có `G.weaponArt`, hoặc nó báo lỗi, file vẽ hình tạm theo đúng tờ phác thảo.

Muốn lấy thông tin mà không vẽ: `G.tinhLinh.info(o)` trả về `{ type, x, y, ang, pull, front, mood, anim, f }`. `front` là vũ khí nằm trước bé (true) hay sau bé (false). Cung luôn nằm sau bé, để tay bé đè lên dây. Kiếm, giáo, búa nằm trước bé lúc đánh, sau bé lúc đứng và chạy.

## Đã kiểm tra

- `game/tests/rules.py`: 82/82 luật đạt. `game/tests/fuzz.py`: 0 lỗi. `game/tests/anim_smoke.py`: không lỗi. Cả ba chạy trên một bản sao tạm của game có nạp file mới. File gốc không bị sửa.
- `nguon/kiem_tra.py`: dựng 1890 khung (mọi bé, mọi vũ khí, mọi động tác, mọi món đồ, đầu vào lạ), không lỗi. Thử hàm trung gian bằng một `G.weaponArt` giả: gọi đúng tham số, và khi nó lỗi thì hero không sập.
- Trung bình 0,5 mili giây để dựng một khung mới trên máy tính. Khung dựng rồi thì được nhớ lại.
- Không sửa file nào khác trong `game/`.

## Chỗ còn yếu

- Hình vũ khí là hình tạm. Vũ khí chỉ đổi màu theo hệ, chưa đổi hình theo cấp tiến hóa. Phần này chờ `weapon_art.js` của phiên khác.
- Chưa thử với `weapon_art.js` thật, chỉ thử với bản giả. Điểm cầm và góc có thể phải chỉnh khi ghép.
- Vệt chém của game (`fx.js`) được canh theo dáng hero cũ. Với vũ khí mới to hơn, vệt chém hơi lệch khỏi lưỡi kiếm.
- Ở màn làng, bé được phóng 3 lần nên mũi kiếm chạm vào ô gợi ý phía trên.
- Chân bé ngắn nên dáng chạy chưa rõ lắm. Động tác "ra chiêu" còn nhẹ.
- Ở cỡ thật, áo nhận ra chủ yếu nhờ màu. Chi tiết nhỏ như nẹp giáp, vảy áo khó thấy.
- Mầm cánh (cấp 1) nhỏ. Bé đeo bầu hồ lô thì mầm cánh nằm sát bầu, hơi khó thấy.
- Lúc trúng đòn bé nháy trắng, vũ khí thì chưa nháy.
- Khi bé lộn vòng, vài khung có nét hơi răng cưa.
- Tốc độ mới đo trên máy tính, chưa đo trên điện thoại thật.
- Khăn đỏ của Đô Vật nhìn hơi giống vành mũ.

## Mã nguồn

- `game/js/hero_tinhlinh.js`: file game mới, một file, tự đứng một mình. Tờ phác thảo cũng vẽ bằng chính file này, nên hình trong tờ duyệt và trong game là một.
- `nguon/to.js`, `nguon/dung.py`: dựng năm tờ phác thảo. Chạy `python3 dung.py`.
- `nguon/dung_phong.py`: dựng `co-that-phong-vuong.png`. Nền phòng mượn từ nhánh `claude/phac-thao-phong` (thư mục `nguon/muon-phong/`).
- `nguon/thu.html`: trang thử, giống `game/index.html` nhưng nạp thêm file mới. Mở bằng trình duyệt là chơi thử được.
- `nguon/thu.py`: chụp ảnh và GIF trong game. `nguon/kiem_tra.py`: bài kiểm tra.
