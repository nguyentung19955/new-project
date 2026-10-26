# Ghi chú rig-v3 – Lam "tay chân rời" (chốt + sprite sheet chạy)

Viết cho người không rành kỹ thuật. Mở `chay/chay-112px-x4.gif`, `chay/chay-nhun-v2-v3-112px-x4.gif` và
`sprite/kiem-sheet-ghep-112px-x4.gif` trước. Mọi số "px logic" là tính toán theo Lam cao 112 px logic (~243 px thiết bị
ở 2,17) – **chưa chạy thử trên iPhone/Safari, không khẳng định hiệu năng**. Không gen ảnh; không đổi cấu trúc rig-v2.

## 1. Đã đổi gì (trước → sau) theo YEU-CAU-RIG-V3

| # | Yêu cầu | rig-v2 (trước) | rig-v3 (sau) | Xem |
|---|---|---|---|---|
| 1 | Tối 10 % tay sau + boot xa | chỉ là bản thử, GIF chính không tối | **Bật mặc định** trong mọi GIF, contact sheet, ảnh tư thế, sprite sheet (màu ×0,90, alpha giữ nguyên). Đo lại ở **đúng 112 px**: tay sau tối đi **9,9 %**, ủng xa **10,0 %**; % tay sau còn thấy không đổi (thấp nhất 96,5 %) | `tu-the/06-toi-10.png`, `so-lieu.json → toi_10_112px` |
| 2 | Giữ đường vung tay sau phía sau lưng | vòng elip sau lưng | **giữ nguyên**, không tối ưu thêm | `tu-the/07-tay-sau-duong-di.png` |
| 3 | Dáng nghỉ 112 px, một scale | hệ số 0,1046 | giữ: dáng nghỉ 112 px logic = **224 px nguồn** ở sheet 2x; một hệ số cho mọi tư thế (thân nhỏ hơn v1 ~3 % – đã chấp nhận) | `sprite/lam-chay-2x.json → ty_le` |
| 4 | Nhún thân tổng ~3 px logic | `THAN_DY [-16, 30, -4, -30]` → tổng cao–thấp **6,27 px logic** | `THAN_DY [-8, 15, -2, -15]` → **3,14 px logic** (thấp nhất +1,57, cao nhất −1,57). Chuyển động phụ: thử giữ nguyên trước, đo, rồi chỉnh (mục 2) | `chay/chay-nhun-v2-v3-112px-x4.gif`, `chay/bieu-do-nay-dau.png` |
| 4b | Đầu có nảy quá mạnh không | — | Có (khi giữ chuyển động phụ) → **giảm một nửa** mũ/chóp/chuông: `MU_DY [-4,-10,2,8]→[-2,-5,1,4]`, `MU_GOC [-2,2.5,0.5,-2.5]→[-1,1.25,0.25,-1.25]`, `CHOP [2,7,2,-6]→[1,3.5,1,-3]`, `CHUONG [-3,6,2,-5]→[-1.5,3,1,-2.5]` | mục 2 |
| 5 | Giữ chu kỳ 0,64 s tại 130,72 px logic/s; đối chiếu game | — | giữ làm bản chuẩn; **game chạy 264 px logic/s → KHÔNG khớp** (nhanh gấp 2,02) – mục 3 | `so-lieu.json → toc_do_game` |
| 6 | Rig/JSON là nguồn; xuất sprite sheet | — | `lam-moi-v3.json` là nguồn; `sprite/lam-chay-2x.png` + `.json` sinh từ rig bằng `code/sprite.py` | `sprite/` |
| + | Trượt tuyệt đối | chỉ có tổng có dấu | thêm Σ\|v_chạm − v_đất\|·dt: **0,0002 px logic** mỗi ủng/chu kỳ (có dấu 0,0001) | `so-lieu.json → ung_chiu_luc` |
| + | Không ép 2 boot tách nhau | — | không thêm ràng buộc nào; ở chịu lực hai ủng vẫn chồng thoáng qua (như v2) | contact sheet khung 6, 22 |
| + | Bậc chân chóp | thấy ở 112 px khi chóp lắc −6…+7° | sửa (mục 4): bậc lớn nhất trong lúc chạy **2,09 → 0,42 px** ở sheet 2x | `tu-the/04-chop-mu-lac.png`, `so-lieu.json → chop_bac` |

Không đổi: chân bám đất (lệch vận tốc ≤ 0,15 px logic/s = 0,11 %), vào/rời đất (nhảy vận tốc ≤ 0,48 px logic/s),
vòng nối cuối→đầu (nhảy vị trí 0,0008 px ảnh ngang, vận tốc 0,14 px logic/s; gia tốc ở khung 0 là 1,0 so với lớn nhất
3,0 ở khung 14), tay dao ±14°, tay sau, sải, ủng. Dáng nghỉ khớp ảnh ngang vẫn IoU 0,954. `kiem_tra.py`: **ĐẠT** mọi mục.

## 2. Nảy đầu – trước / sau (px logic, `so-lieu.json → nay_dau`)
| | v2 | thử: nhún ½, giữ chuyển động phụ | **v3 chốt** |
|---|---|---|---|
| Thân cao–thấp | 6,27 | 3,14 | **3,14** |
| Đỉnh mũ cao–thấp | 4,70 | 2,11 | **2,45** |
| Mắt cao–thấp | 6,92 | 4,35 | **3,90** |
| Đầu lắc riêng so với thân | 1,78 (28 % nhún) | 1,78 (**57 %** nhún) | **0,92 (29 %)** |
| Gia tốc dọc đỉnh mũ lớn nhất (px/s²) | 2062 | **2843** | **1140** |

Đọc: nếu chỉ giảm nhún thân mà giữ chuyển động phụ thì đầu vẫn lắc riêng y như cũ (1,78 px) – thành **57 %** nhún thân, gia
tốc đỉnh mũ còn **lớn hơn v2** → đầu trông "giật/nảy" tách khỏi thân. Giảm một nửa chuyển động phụ đưa tỉ lệ về như v2
(29 %), gia tốc còn 55 % của v2. Mắt vẫn đi nhiều hơn thân một chút (3,9 vs 3,1) vì thân nghiêng 5–8° theo nhịp (giữ v2).

## 3. Đối chiếu tốc độ game (đọc code, KHÔNG sửa demo.html)
Nguồn: `game/demo.html` – `P.runSpeed = 4.4` (px logic **mỗi bước logic**), `const DT = 1000/60` (60 bước logic/giây, độc
lập tần số màn), canvas logic 960×540; `updatePlayer()`: `vx` tiến dần tới `dir·runSpeed` trong 6 bước (dừng 5 bước).
- **Tốc độ chạy game = 4,4 × 60 = 264 px logic/s.** Rig chuẩn = 130,72 px logic/s → **lệch +133,28 px logic/s (×2,02)**. Chưa khớp.
- Tốc độ là tốc độ thế giới nên so thẳng px logic/s; Lam cũ cao ~162 px, Lam mới 112 px: game = 2,36 chiều cao Lam mới/giây,
  rig chuẩn = 1,17. Clip chạy cũ (8 khung × 83 ms = 0,664 s) phát theo số bước, không theo vx.
- Nếu phát chu kỳ chuẩn 0,64 s ở tốc độ game: chân trượt 133 px logic/s (~43 px mỗi bước chân) – không nên.
- **Đề xuất đồng bộ (giữ pha liên tục)**: phát theo quãng đường – mỗi bước logic `pha += |vx| / 83,66` (83,66 px logic =
  quãng đường mỗi chu kỳ ở tốc độ chuẩn), khung = `floor(pha·32)`. Tăng/giảm tốc chỉ đổi lượng cộng → không nhảy khung,
  không trượt. Ở 264 px/s: chu kỳ 0,317 s (9,9 ms/khung, 6,3 bước chân/giây, mỗi bước logic nhảy ~1,7 khung sheet).
- Hệ quả cần quyết: 6,3 bước/giây là nhịp chân **rất nhanh** (gấp đôi bản duyệt). Ba hướng (câu hỏi 1):
  a) giữ runSpeed 264, phát theo quãng đường (chân đạp nhanh, kiểu chibi "chạy lạch bạch");
  b) giảm runSpeed game về ~2,18 px/bước (= 130,72 px/s) – đổi cảm giác điều khiển, phải thử lại màn chơi;
  c) làm rig chạy sải dài hơn/nhịp khác cho tốc độ 264 (bước sau, thay đổi bảng mốc – không làm ở v3).

## 4. Sửa bậc chân chóp (không làm lại mũ)
Đo ở `code/do_chop.py` (`so-lieu.json → chop_bac`; "bướu" = viền gáy ló trên chóp, "bậc" = chóp nhô trên viền mũ ở đỉnh).
- Nguyên nhân: chóp xoay quanh chỗ giáp *dưới* nếp gấp, cách chỗ giáp *đỉnh* ~320 px → lắc vài độ là đỉnh lệch nhiều;
  lớp gáy (vẽ sau chóp) có viền trùng viền chóp nên khi chóp hạ, viền gáy ló thành bướu.
- Sửa: (1) dời pivot chóp lên **giữa nếp gấp** (515, 224) – chỉ đổi điểm xoay, dáng nghỉ không đổi; (2) xoá dải viền thừa
  trên cùng của **lớp gáy** sát đỉnh (594 px); (3) xoá đuôi chóp **bị mũ che hẳn** ở dáng nghỉ sát đỉnh (785 px).
  Mảnh mũ giữ nguyên. Cộng thêm biên độ chóp giảm một nửa (−3…+3,5°, mục 2).
- Kết quả (px ở sheet 2x): v2 trong dải chạy −6…+7°: lớn nhất **4,39** (bướu ở +7°); cùng góc với pivot cũ ở −3/+3,5°:
  0,63/2,09. **v3 ở −3/+3,5°: 0,42/0,21** – dưới nửa điểm ảnh. Lỗ thủng 0 px.

## 5. Sprite sheet (`sprite/`)
- `lam-chay-2x.png`: RGBA, 2142×970, 8 cột × 4 hàng, khe 2 px; **mỗi ô 266×241**, cùng canvas, không crop riêng khung,
  không nền/chữ/đất. Điểm neo trong mỗi ô **(123, 234)** = giữa hai chân (gốc rig cố định), mặt đất (hàng 233 là đáy đế khi
  chạm). Dáng nghỉ cao **224 px nguồn** (game vẽ ½ → 112 px). Ô chứa trọn dao, chóp, tay sau ở mọi khung (kiểm: mép ô alpha 0).
- `lam-chay-2x.json`: danh sách 32 khung (x, y, w, h, 20 ms, pha, ủng nào chạm đất), điểm neo, cỡ khung, tỉ lệ 2x, tốc độ
  chuẩn (130,72 px logic/s, chu kỳ 0,64 s, 83,66 px/chu kỳ), cách giữ pha khi đổi tốc độ, ghi chú hitbox, đối chiếu tốc độ game.
- **Hitbox/va chạm lấy từ gameplay** (hộp cố định của nhân vật), không theo bóng hình sprite đang nhún – ghi trong JSON.
- Kiểm: GIF ghép lại **từ chính sheet** theo JSON lên đường đất/gốc cố định (`kiem-sheet-ghep*.gif`); khung có chân chạm đất
  đáy đế đúng hàng neo (lệch 0–1 px); ô cắt từ sheet trùng ảnh vẽ lại trực tiếp từ rig (lệch alpha ≤ 2/255).
- ZIP nguồn: không commit file zip (theo quy định repo); nguồn đầy đủ là thư mục `rig-v3/` (chạy độc lập).

## 6. Cái còn chưa đẹp / cần biết
- **Tốc độ game chưa khớp** (mục 3) – chưa sửa game, chờ quyết định.
- Bậc chân chóp còn ~0,4 px ở sheet 2x khi chóp ở −3° (khung bay). Nếu muốn chóp lắc mạnh lại (±6–7°) thì pivot mới làm
  **chỗ giáp dưới hở rộng hơn** (khe mới ~1080 px ảnh ngang ở +7°, có gáy mũ đỡ nhưng thấy nếp gáy) – khi đó nên vẽ lại mảnh
  chóp có gốc dài hơn.
- Nhún còn 3,1 px logic → ở 112 px chuyển động lên–xuống nhẹ hẳn; tư thế bay cao 110 px (v2 113), chịu lực 111.
- Mắt đi nhiều hơn thân (do nghiêng thân), ở 112 px khó thấy.
- Chịu lực: hai ủng vẫn chồng thoáng qua (đúng yêu cầu không ép tách). Khe hở thấp nhất khi bay 0,96 px logic (như v2).
- Sheet ở 2x khá lớn (1,5 MB PNG, ~8,3 MB khi giải nén RGBA) – chưa đo bộ nhớ/tốc độ vẽ trên iPhone.
- GIF 20 ms/khung: vài trình xem chạy chậm hơn; trong game lấy theo bước logic/quãng đường.
- Dao vẫn đè chuông ở chịu lực; chưa có bóp méo (squash/stretch).

## 7. Câu hỏi cần chủ dự án quyết
1. **Tốc độ**: game 264 px logic/s vs rig 130,72. Chọn (a) phát theo quãng đường ở 264 (nhịp 6,3 bước/s), (b) giảm runSpeed
   game về ~2,18 px/bước, hay (c) làm bảng mốc chạy riêng cho tốc độ nhanh (sải dài hơn)?
2. Nảy đầu v3 (chuyển động phụ ×½) đã ổn chưa, hay muốn đầu "trễ" nhiều hơn chút (ví dụ ×0,7)?
3. Chóp lắc −3…+3,5° (nhẹ hơn v2) có đủ sinh động không?
4. Sheet 2x (ô 266×241) có dùng luôn, hay muốn thêm bản 1x/2,17x cho thiết bị?
5. Bước sau: tích hợp sheet vào demo.html (thay clip run cũ) – làm khi nào và theo hướng tốc độ nào ở câu 1?
