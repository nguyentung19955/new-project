# Hàng động tác mới Cu Tí (16/10) — cắt, soát mượt, neo vũ khí, đưa vào game

Ảnh gốc: `docs/anh-goc/cu-ti-hang-moi-16-10/` (chủ game gen: tay không cầm vũ khí, nắm hờ tay phải, nhìn phải, nền #00FF00).

## Tóm tắt

| Hàng | Số khung (game cần) | Dùng? | Lý do | Cần gen lại? |
|---|---|---|---|---|
| 01 Đứng thở | 8 (8) | **DÙNG** | Thở thật (đầu/vai nhô 1–1,5 điểm ảnh game rồi về), chân đứng yên tuyệt đối, nối vòng 8→1 êm → bỏ được kiểu phát đi-về 1-2-3-4-5-4-3-2 của hàng cũ (hàng cũ gần như đứng im). Tay phải (sau thân, gần camera) cùng chỗ hàng cũ → vũ khí cầm lúc đứng không nhảy. | Không |
| 04 Lộn | 6 (6) | **DÙNG** | Sửa đúng lỗi cũ: khung 6 (đứng dậy) hàng cũ cao 69 điểm ảnh ô 96 so với đứng 64 (to hơn hẳn); hàng mới khung 6 = 66 = đúng cỡ đứng mới. Đầu không còn phình (hàng cũ phải phóng ×1,28). | Không |
| 05 Trúng đòn | 4 (4) | **DÙNG** | Giống dáng cũ, mặt nhăn rõ hơn, 2 khung hồi thế cùng cỡ đứng (65 vs 66), chân không trượt (lệch ≤ 1 điểm ảnh ô 96). | Không |
| 08 Kiếm 1 | 5 (5) | **KHÔNG** | **Đổi tay**: khung 1 tay phải giơ cao sau đầu, khung 2–4 tay phải CHỐNG HÔNG phía sau còn tay TRÁI (phía trước) đấm/vung → vũ khí sẽ nhảy từ tay này sang tay kia. Thêm: khung 2 (thấp) chen giữa khung 1 (cao) và khung 3 (ngang) làm đường vung lên-xuống-lên, khung 4 thân sụp 10 điểm ảnh. Giữ hàng cũ. | **Có** (prompt A) |
| 09 Kiếm 2 | 5 (5) | **KHÔNG** | **Đổi tay** y như kiếm 1: khung 1 tay phải hạ thấp sau lưng, khung 2–5 tay phải chống hông, tay trái vung lên. Khung 5 kết thúc tay đưa ra trước (không về thế đứng). Giữ hàng cũ. | **Có** (prompt B) |
| 10 Kiếm 3 (HỎNG) | 6 (6) | **KHÔNG** | Xếp lưới 2×3, gần như đứng yên (đã ghi là hỏng). | **Có** (prompt C) |

Số khung đối chiếu `game/art/custom/zed-moi.sprite.json` (`dong_tac.<hàng>.so`) và bảng mốc `MOC` trong `game/js/zed_moi.js`: dung 8, kiem_1 5, kiem_2 5, kiem_3 6, lon 6, trung 4.

## 1. Cắt khung

- Cắt bằng công cụ có sẵn `docs/anh-goc/zed/cat-diem-anh.py` (tách theo khe cột, khử nền xanh + viền ngả xanh, không opening nên giữ nét 1 điểm ảnh): cả 5 tấm **ĐẠT**, đúng số khung. Ra: `docs/anh-goc/zed/moi16/<tên>-gif/` (khung nền trong suốt cỡ gốc + `bao-cao.json` + `debug.png`).
- Co về cỡ Cu Tí trong game bằng đúng đường dựng `docs/anh-goc/zed/dung-zed-game.py` (ô 96×96 = 48×48 game, chân ở (48, 90), đường đất chung):
  - đứng mới: co theo cỡ ĐẦU so với tấm đứng cũ (r = 1,018), canh ngang theo tâm đầu như hàng đứng cũ;
  - lộn, trúng đòn: cỡ đầu đo sai vì tóc bay (trúng đòn đo đầu to hơn 15 % → người co nhỏ hơn đứng 7 điểm ảnh) → co theo CHIỀU CAO khung đứng thẳng (lộn khung 6, trúng đòn khung 3–4) = cao hàng đứng mới (`R_CAO` trong dung-zed-game.py); canh chân theo điểm giữa hai bàn chân như mọi hàng đòn.
- Mặt / tóc / áo / đai / băng tay nhất quán với bộ ninja cũ (cùng bảng màu). Tay phải ở trước thân mọi khung ở đứng / lộn / trúng đòn; kiếm 1 / 2 hỏng ở điểm này (xem bảng).

## 2. Soát mượt

Ảnh / GIF (thư mục này): `so-sanh-cu-moi.png` (cũ trên, mới dưới, ×2, vạch đất + vạch giữa ô), `<hàng>-cu|moi-x1.gif` (cỡ thật ô 96) và `-x3.gif`, số đo đủ trong `do-lech.json`.

Độ lệch lớn nhất giữa hai khung liền nhau (điểm ảnh ô 96 = ½ điểm ảnh game; đứng tính cả nối vòng 8→1):

| Hàng | Cao người | Đỉnh đầu | Tâm đầu (ngang) | Tâm thân | Chân sau | Chân trước | Đường đất |
|---|---|---|---|---|---|---|---|
| đứng cũ | 0 | 0 | 0,5 | 0,8 | 1 | 1 | 0 |
| **đứng mới** | 2 (thở) | 2 | 0,5 | 0,3 | 0,5 | 0,5 | 0 |
| lộn cũ | 22 | 22 | 12,5 | 9,4 | 20 | 20 | 0 |
| **lộn mới** | 17 | 17 | 12 | 10,5 | (lăn) | 13 | 0 |
| trúng cũ | 1 | 1 | 22,5 (ngửa đầu) | 6,8 | 1 | 2 | 0 |
| **trúng mới** | 1 | 1 | 18,5 (ngửa đầu) | 4,0 | 1 | 2 | 0 |
| kiếm 1 cũ | 0 | 0 | 3,5 | 6,3 | 1 | 1 | 0 |
| kiếm 1 mới | 10 | 10 | 10,5 | 7,7 | 2,5 | 2 | 0 |
| kiếm 2 cũ | 9 | 9 | 3 | 3,3 | 2 | 1 | 0 |
| kiếm 2 mới | 3 | 3 | 3 | 6,1 | 1 | 0,5 | 0 |

Cỡ người khung cuối so với đứng (vào/ra động tác): lộn cũ khung 6 = 69 vs đứng 64 (**+5, giật to**), lộn mới 66 vs 66 (**0**); trúng mới 65 vs 66.

Nhận xét thẳng:
- **Đứng mới tốt hơn rõ** (hàng cũ gần như ảnh tĩnh nên phải phát đi-về; hàng mới thở thật, nối vòng êm → game phát thẳng 1→8).
- **Lộn mới tốt hơn** (hết khung 6 to, đầu không phình; lăn tròn gọn hơn). Nhảy lớn giữa khung là do lăn (đúng động tác).
- **Trúng đòn mới ngang / nhỉnh hơn** (cùng dáng, thân bớt trôi 6,8 → 4,0).
- **Kiếm 1, kiếm 2 mới KHÔNG dùng được** vì đổi tay (lỗi hình, không sửa bằng cắt ghép được: tay phải không cầm gì ở khung chạm). Kiếm 2 mới thì về đường vung khá mượt (vung từ thấp sau lên cao trước), chỉ hỏng tay.

## 3. Neo vũ khí (điểm nắm tay phải + góc)

Định dạng y như hàng cũ (`docs/anh-goc/zed/gan-vk/neo.json`, đọc bởi `dung-zed-game.py`): mỗi khung `[x, y, góc độ, sau, [tay2]]` trên ảnh khung đã cắt; góc 0 = lưỡi chỉ sang phải, dương = chúc xuống; sau 0 = vẽ trước thân; tay2 = nắm tay trái (thương/búa cầm hai tay). Game nhận bản đã quy đổi về ô 96 (`dong_tac.<hàng>.neo` = `[X96, Y96, góc, sau]`, `he_neo: nguon-96`) + biến thể nắm chuôi `nam` + hàng lớp nắm tay `hang_tay`, tự dựng bằng dung-zed-game.py.

Chỉ hàng ĐỨNG có vũ khí (lộn, trúng đòn: không vũ khí, như cũ). Đo bằng `docs/anh-goc/zed/gan-vk/neo-hang-16-10.py` (chinh_nam quanh nắm tay, cùng luật góc của cam-vk.py) → mục `01-dung-8k#kiem|thuong|bua|phitieu` trong neo.json:

| Khung | Nắm tay phải P (x, y) | Nắm tay trái T | Kiếm | Thương / búa (qua P→T) | Phi tiêu |
|---|---|---|---|---|---|
| 1 | 60, 320 | 187, 284 | −15° | −15,8° | −20° |
| 2 | 60, 320 | 186, 282 | −15° | −16,8° | −20° |
| 3 | 58, 330 | 185, 291 | −15° | −17,1° | −20° |
| 4 | 59, 331 | 186, 291 | −15° | −17,5° | −20° |
| 5 | 58, 334 | 186, 292 | −15° | −18,2° | −20° |
| 6 | 60, 320 | 187, 283 | −15° | −16,2° | −20° |
| 7 | 58, 320 | 186, 284 | −15° | −15,7° | −20° |
| 8 | 60, 317 | 185, 282 | −15° | −15,6° | −20° |

(y đổi theo khung vì khung 3–5 cao hơn — tóc nhô khi hít vào; tính từ chân thì nắm tay đứng yên ±1.) Ảnh soát ghép như game: `cam-vk-dung-cu-vs-moi.png` (4 hàng trên = đứng cũ, 4 hàng dưới = đứng mới; kiếm / thương / búa / phi tiêu cấp 1).

## 4. Đưa vào game

_(đang chờ phiên "Cu Tí to hơn + động tác mượt" xong phần sửa js/zed_moi.js — mục này điền khi tích hợp.)_

## Prompt gen lại

Dùng chung: gửi kèm ảnh mẫu `docs/anh-goc/zed/moi/01-dung.png` (giữ mặt/áo) và người đặc `docs/khung-que-8-huong/nguoi-dac/kiem-<n>-e.png` (cam = tay phải, tím = tay trái, vạch đỏ = hướng lưỡi). Lỗi chính phải chặn: **tay trái không được chống hông / không được vung**.

**A — Kiếm 1 (5 khung, sửa đổi tay):**

```
Pixel art chibi boy, same character as reference (spiky black hair, red eyes, black ninja gi, red belt, sandals), side view facing RIGHT, empty hands, RIGHT hand loosely closed fist (a sword will be added in game). One horizontal row of 5 frames, same size, feet on one ground line, plain #00FF00 background.
The RIGHT arm (near the camera) does ALL the motion and is always drawn IN FRONT of the torso. The LEFT hand stays as a fist at the belt in front of the body in every frame — never on the hip, never swinging.
1 guard stance, right fist low behind the hip. 2 wind-up: right fist raised high behind the head. 3 HIT: right arm fully straight forward at shoulder height. 4 follow-through: right fist swung down in front of the knees. 5 back to the guard stance of frame 1.
Feet do not move. Body height the same in all frames.
```

**B — Kiếm 2 (5 khung, chém hất lên, sửa đổi tay):**

```
Pixel art chibi boy, same character as reference (spiky black hair, red eyes, black ninja gi, red belt, sandals), side view facing RIGHT, empty hands, RIGHT hand loosely closed fist (a sword will be added in game). One horizontal row of 5 frames, same size, feet on one ground line, plain #00FF00 background.
Only the RIGHT arm (near the camera) moves and it is always drawn IN FRONT of the torso. The LEFT hand stays as a fist at the belt in front of the body in every frame — never on the hip, never raised.
1 guard stance, right fist low behind the hip. 2 knees bent a little, right fist low behind, near the back knee. 3 HIT: right arm sweeping up and forward at 45 degrees, fist in front of the face. 4 right arm fully raised straight up above the head, in front. 5 back to the guard stance of frame 1.
Feet do not move.
```

**C — Kiếm 3 (6 khung, MỘT hàng ngang, động tác rõ):**

```
Pixel art chibi boy, same character as reference (spiky black hair, red eyes, black ninja gi, red belt, sandals), side view facing RIGHT, empty hands, RIGHT hand loosely closed fist (a sword will be added in game). ONE horizontal row of 6 frames (not a grid), same size, feet on one ground line, plain #00FF00 background. Big clear motion, every frame clearly different.
The RIGHT arm (near the camera) is always drawn IN FRONT of the torso; the LEFT hand stays a fist at the belt.
1 wind-up: torso twisted back, right fist pulled far back behind the shoulder. 2 step forward: front foot steps forward, right arm swinging wide and low at the side. 3 HIT: lunge, right arm fully straight forward at shoulder height. 4 follow-through: right arm swept across and down past the body. 5 right fist low in front of the back knee, body still low. 6 hold the finishing pose: low wide stance, right fist low forward, still.
```

Ghi chú C: game đặt khung chạm ★ của kiếm 3 ở **khung 3** (u = 0,45, `MOC.kiem_3`) và không được đổi khung chạm, nên prompt gộp "bước tới + vung rộng" vào khung 2 để "CHẠM tay duỗi thẳng" rơi đúng khung 3; "vung theo qua thân" chia khung 4–5, "giữ thế" khung 6.
