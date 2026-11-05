# PixelLab vẽ 3 quái nấm Thornwood (05/11/2026)

Thorncap Goblin, Spore Puff, Toadstool King: **hình do PixelLab vẽ**, động tác dựng bằng **khung xương PixelLab** (một nhân vật PixelLab
cho mỗi con, mọi động tác của con đó đi từ cùng một khung xương nên đồng bộ). Code chỉ cắt, đặt vị trí, ghép tấm — không vẽ / vá điểm ảnh nào.
**Chỉ đổi HÌNH**: không đổi luật chơi, chỉ số, hộp va chạm, thời điểm ra đòn, kỹ năng của quái. Không chơi thử bằng tay (chỉ chụp headless).

## Tóm tắt cho chủ game

| Con mới | Thay hình con nào | Vì sao chọn con đó | Ở đâu trong game |
|---|---|---|---|
| **Thorncap Goblin** (quái thường) | **Heo Rừng Con** (`heoCon`, Lính xông vùng Rừng) | Heo "cào chân rồi húc thẳng" → yêu tinh cúi đầu, mũ nấm gai chĩa ra trước, lao húc | Mọi ải Rừng; có ngay ở phòng 1 và phòng 3 của bản thử 5 phút đầu |
| **Spore Puff** (quái thường phun bào tử) | **Hoa Phun Bào Tử** (`hoaBaoTu`, Xạ thủ vùng Rừng) | Cùng kiểu đánh: phồng lên rồi phun 3 hạt bào tử (hạt bào tử, vòng đỏ, vũng độc vẫn do game vẽ như cũ) | Mọi ải Rừng có Xạ thủ |
| **Toadstool King** (trùm nhỏ, to hơn) | hình mượn **Nấm Chúa** của trùm bản thử | Trùm bản thử vẫn là Nấm Chúa về luật (chiêu, máu, Fire Guard), chỉ đổi hình | Chỉ trong bản thử 5 phút đầu (ải 1-1 lần đầu). Ải khác: Nấm Chúa như cũ |

- Toadstool King có thêm động tác **dựng khiên**: khi Fire Guard bật (4 đòn Lửa), vua giơ gậy dựng thẳng trước người, khom sau áo choàng
  rồi giữ thế chắn (khiên lửa trong mờ vẫn do game vẽ đè lên như cũ). Lúc ra chiêu / trúng đòn vẫn dùng động tác thường.
- **Cờ quay lui `?quaipl=0`**: cả 3 con về hình cũ y như trước. (`?slicecu=1` cũng đưa trùm bản thử về hình Nấm Chúa.)
  Hoặc revert commit này.

Ảnh soát (thư mục `anh/`):

| | Mới | Cũ (`?quaipl=0`) |
|---|---|---|
| Ải 1-1 bản thử: 2 Thorncap Goblin + 1 Spore Puff | `tran-1-quai-thuong.png` | `tran-1-quai-thuong-cu.png` |
| Đang ra đòn (goblin lao húc, puff phun bào tử) | `tran-1b-ra-don.png` | |
| Phòng trùm bản thử | `tran-2-trum.png` | `tran-2-trum-cu.png` |
| Fire Guard (vua dựng khiên) | `tran-3-fire-guard.png` | `tran-3-fire-guard-cu.png` |

GIF từng động tác (phóng ×3, đứng → động tác → đứng; vạch đỏ nhỏ dưới chân = điểm neo):
`anh/gif-thorncapGoblin-{idle,move,tele,atk,hit,die}.gif`, `anh/gif-sporePuff-{idle,move,tele,atk,hit,die}.gif`,
`anh/gif-toadstoolKing-{idle,move,tele,atk,hit,die,ne,noi}.gif` (`ne` = dựng khiên, `noi` = giữ khiên). Toàn tấm phóng ×2: `anh/tam-<mã>-x2.png`.

## 1. Game vẽ quái thế nào (tìm hiểu trước khi làm)

- Mỗi quái là một tệp `game/art/custom/<mã>.sprite.json`: một tấm ảnh, mỗi **hàng** một động tác (`dong_tac`: `idle` đứng thở, `move` đi,
  `tele` báo đòn, `atk` đánh, `hit` trúng đòn, `die` chết — số khung `so`, thời lượng `giay`, `lap` lặp), ô khung `khung_rong × khung_cao`
  (điểm game), `net: 2` (ảnh gấp đôi điểm game), `goc` = điểm neo giữa chân.
- Quái chỉ vẽ **MỘT hướng quay sang phải**, game tự lật khi quay trái (`js/sprite_custom.js` `SC.veKhung`). Nấm Chúa, Hoa Phun Bào Tử, Nấm Phồng
  vẽ nghiêng 3/4 (thấy mặt, quay sang phải) → chọn hướng PixelLab **south-east, góc nhìn low top-down**, chỉ làm động tác cho hướng đó.
- Chết: game phát hàng `die` rồi giữ khung cuối và mờ dần. Báo đòn / đánh: game tự trải theo thời gian thật của đòn.

## 2. Quy trình PixelLab (theo skill pixellab-api)

1. **Ảnh gốc** (hướng nam): cắt từng con từ ảnh mẫu ChatGPT (`docs/tu-van-toan-cau/chatgpt-05-11/quai-nam-3-con-nguon-chatgpt.png`, bỏ nền magenta,
   Spore Puff bỏ đám khói xanh) làm **ảnh tham chiếu** cho `POST /generate-image-v2` (giữ màu / dáng). 3 seed mỗi con (mỗi lượt ra 4–9 ảnh):
   `anh/chon-anh-goc-*.png`. Chọn: goblin `s33-1`, vua `s22-2` (cầm gậy tay trái như mẫu), puff `s33-0`.
2. **8 hướng**: `generate-8-rotations-v3`, 2 seed mỗi con (`anh/xoay-8-huong-*.png`), chọn nguyên một bộ (goblin r7, vua r7, puff r8 —
   bộ có hướng south-east rõ mặt, gậy vua vẫn thấy).
3. **Nhập nhân vật**: `create-character-v3` đủ 8 hướng, khung xương `mannequin` (cả Spore Puff: thử trước một động tác thấy không mọc thêm chân tay
   nên giữ khung xương cho đồng bộ).
4. **Động tác**: `POST /characters/animations` chế độ `skeleton-v3`, hướng `south-east`. Mô tả thuần động tác, luôn kèm "không thêm chân tay,
   không hiện gì khác" (không chữ lửa / khói / tia).
5. **Soát từng khung phóng ×2–×4** + soát tự động (mảnh rời, điểm ảnh mờ bán trong suốt, chân). Hỏng thì chạy lại động tác đó với seed / mô tả khác:

| Con | Động tác | Lần chạy | Vì sao chạy lại | Bản dùng |
|---|---|---|---|---|
| Goblin | đứng thở | 3 | lần 1 gần như đứng im; lần 2 có vệt nhoè ở tay | seed 4 |
| Goblin | báo đòn | 2 | "cào chân" sinh bụi đất | seed 5 ("giậm chân") |
| Goblin | đánh (lao húc) | 3 | vệt nhoè cạnh mắt / chân | seed 3 |
| Goblin | trúng đòn | 3 | tay nhoè | seed 3 |
| Goblin | đi, chết | 1 | đạt ngay | |
| Vua | đứng thở | 3 | lần 1 có làn khói nâu cạnh mặt | seed 5 |
| Vua | đánh | 8 (3 kiểu) | quật / đâm gậy làm gậy nhoè, mất đầu gậy, bụi | "dộng gậy thẳng xuống đất" seed 3 |
| Vua | chết | 3 | lần 1 mũ nấm nhân đôi, mất gậy; lần 2 gậy lem | seed 9 (ngã ngửa, gậy còn trong tay) |
| Vua | trúng đòn | 2 | mặt / đầu gậy nhoè | seed 5 |
| Vua | dựng khiên | 3 | lần 1 mất thân gậy | seed 3 (gậy thấy trọn từ đầu tới chân) |
| Vua | đi, báo đòn | 1 | đạt ngay | |
| Puff | đi, chết | 3 | lần đầu chết chỉ xẹp nhẹ | chết: "xì hơi xẹp" seed 4; đi: lần 1 (nhún 3–4 điểm ảnh) |
| Puff | đứng, báo đòn, đánh, trúng đòn | 1 | đạt ngay | |

Kết quả soát cuối: mọi khung là **một mảng liền** (không mảnh rời), **0 điểm ảnh bán trong suốt**, không thừa chân tay, không lửa / khói / tia.
Chân: mọi động tác đứng tại chỗ (đứng thở, báo đòn, trúng đòn của goblin; đứng thở của vua; đứng thở, báo đòn của puff) có giữa chân
**đúng một vị trí ở mọi khung** (đo số: goblin x = 46,9, vua 69,6, puff 54,2; đáy chân không đổi). Các động tác có bước / ngã thì chân
di chuyển đúng theo động tác.

## 3. Ghép vào game

- `docs/review/ke-hoach-cai-thien/pixellab-quai-nam/cong-cu/dung-quai-pl.py --ghi`: khung gốc ở `docs/anh-goc/pixellab-quai-nam/<con>/khung/`
  → `game/art/custom/{thorncapGoblin,sporePuff,toadstoolKing}.sprite.json`. Mọi khung một con cùng khung vẽ PixelLab nên dùng **một ô cắt chung**,
  không dời riêng khung nào; điểm neo = giữa chân tư thế đứng; `net 2`.

| Mã | Ô khung (điểm game) | Thân đứng (điểm game) | Hàng | Ảnh (PNG / WebP) |
|---|---|---|---|---|
| `thorncapGoblin` | 49 × 42 | 35 × 35 | đứng 6 · đi 8 · báo 8 · đánh 6 · trúng 4 · chết 7 | 125 / 39 KB |
| `sporePuff` | 35 × 35 | 29 × 30 | 6 · 8 · 8 · 6 · 4 · 7 | 53 / 18 KB |
| `toadstoolKing` | 71 × 69 | 61 × 57 | 6 · 8 · 8 · 6 · 4 · 8 · dựng khiên 5 · giữ khiên 4 | 385 / 114 KB |

(Chuẩn tư vấn: quái nhỏ ~24–40 điểm → goblin 35, puff ~30; trùm 64–96 → vua cao 57, to hơn rõ so với quái thường, hơi nhỏ hơn Nấm Chúa cũ ~64.)

- `game/js/quai_pl.js` (mới, nạp sau `slice.js`): lúc game vẽ quái mã `heoCon` / `hoaBaoTu` (và `namChua` khi bản thử đang chạy) thì tạm đặt tấm mới
  vào chỗ tấm cũ rồi trả lại → mọi đường vẽ cũ (bóng, chớp trúng đòn, nhuộm độc/cháy, hiệu ứng vẽ code của chiêu) giữ nguyên, **không phải sửa
  `sprite_custom.js` / `engine.js`** (phần của phiên F3). Fire Guard: đứng / đi phát hàng `ne` (dựng khiên, 0,45 giây) rồi `noi` (giữ khiên, lặp).
  Ba tấm mới bị gỡ khỏi danh sách quái (để việc ngày "tìm điểm yếu" không thấy 3 "con quái" lạ).
- `game/js/slice.js`: chỉ thêm `SL.anhTrum = 'toadstoolKing'` (mã ảnh trùm bản thử) + sửa chú thích. Không đổi luật.
- `game/index.html`: nạp `js/quai_pl.js`.

## 4. Kiểm (kết quả thật)

- `node --check` mọi `game/js/*.js`: đạt.
- `python3 tools/phat-hanh/kiem_anh.py`: **ĐẠT** (736 tệp).
- `python3 game/build.py`: bản một tệp **27,51 / 30 MB** (sau khi gộp phiên vũ khí PixelLab + F2/F3 đẩy trước; phần 3 quái +0,22 MB).
- `LK_ANH_ROI=1 python3 game/build.py --hai-tep`: web tải đầu **19,89 / 20 MB** (sau khi gộp các phiên đẩy trước; phần 3 quái +0,17 MB: ảnh WebP 39 + 18 + 114 KB), trang chính nén 1,01 / 1,50 MB. Đã sát trần: phiên sau thêm ảnh cần bớt chỗ khác.
- Đã `git pull --rebase` (phiên vũ khí PixelLab, F2, F3 đẩy trước; đụng nhau ở `game/dist` → dựng lại dist), rồi kiểm lại toàn bộ:
- `LK_BO_DUNG=1 bash tools/phat-hanh/cong_kiem.sh` (cổng kiểm như GitHub, dùng dist vừa dựng): **ĐẠT** — lưu mây, kiểm ảnh, trần dung lượng,
  smoke test 14 bước (màn đầu, ải 1-1 đi/đánh/né/đổi vũ khí, lưu → tải lại, `?cloud=0`, EN/VI).
- Chụp headless 844 × 390 (`cong-cu/chup.py`, `?cloud=0`): ải 1-1 bản thử với 2 Thorncap Goblin + 1 Spore Puff (đứng và đang ra đòn), phòng trùm,
  Fire Guard; cùng cảnh với `?quaipl=0` → hình cũ y như trước. **0 lỗi trang.**
- Không đụng đăng nhập Google / lưu mây / `?cloud=0`, `master`, phần vũ khí, `sprite_custom.js`, `engine.js`, bản lưu.

## 5. Chi phí PixelLab (số thật)

- Tổng phiên này: **266,75 lượt** (generations) — ảnh gốc 120 (9 lượt tham chiếu × 10–15), 8 hướng 14, nhập 3 nhân vật 0,75,
  44 động tác × 3 = 132.
- Số dư sau khi làm (GET /balance): **còn 6.295,55 / 10.000 lượt** (một phiên khác cũng đang dùng chung tài khoản cho vũ khí).
- Nhân vật trên PixelLab: "Talesworn goblin", "Talesworn king", "Talesworn puff mannequin" (còn trong tài khoản, có thể làm thêm động tác cùng khung xương).

## 6. Việc còn lại / đề xuất

- **Tên chữ chưa đổi** (ngoài phạm vi "chỉ hình"): lời nhắc / sổ yêu quái vẫn gọi "Heo Rừng Con" ("Boar charges straight…") và "Hoa Phun Bào Tử"
  dù hình đã là Thorncap Goblin / Spore Puff. Đề xuất phiên chữ (`js/ky_nang_quai.js` lời nhắc, `js/ten_moi.js` tên EN) đổi tên cho khớp.
- Toadstool King mới chỉ dùng trong bản thử; muốn thay Nấm Chúa ở mọi ải 1-4 thì thêm `namChua` vào `G.quaiPl.THAY` (một dòng) — cần chủ game quyết.
- Số màu: ảnh PixelLab ~40–60 màu / con (chuẩn tư vấn 8–16 là mục tiêu, không phải luật cứng); không giảm màu bằng code để giữ đúng luật "không sửa điểm ảnh".
- Spore Puff "đi" là nhún tại chỗ (khung xương không cho bật cao); trong game thân trượt theo bước như các quái tròn khác.

## Tệp

- `game/art/custom/thorncapGoblin.sprite.json`, `sporePuff.sprite.json`, `toadstoolKing.sprite.json` (mới)
- `game/js/quai_pl.js` (mới), `game/js/slice.js` (mã ảnh trùm), `game/index.html` (nạp tệp), `game/dist/*` (dựng lại)
- `docs/anh-goc/pixellab-quai-nam/` — ảnh gốc PixelLab, 8 hướng, khung từng động tác đã chọn, tấm ghép, `chon.json` (bản nào được chọn)
- Thư mục này: `cong-cu/` (`dung-quai-pl.py`, `gif.py`, `chup.py`), `anh/`

Commit: (ghi ở dòng cuối sau khi đẩy)
