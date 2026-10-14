# Báo cáo: 7 NPC mới, bản đồ chọn ải, thẻ ô ải, vòng báo trước hoạt ảnh, nén dung lượng — 14/10

Commit: **`a0da2ca`** (nhánh `khoi-tao-du-an`, đã rebase lên `ea6a6db`). Không chạy game, không Playwright: chỉ xử lý ảnh, ảnh soát tĩnh, `node --check` toàn bộ `game/js/*.js`, `python3 game/build.py --hai-tep`. Không đổi số cân bằng. Không đụng `firebase-config.js`, đăng nhập Google, lưu mây, `?cloud=0`. Công cụ: `cong-cu/` (cùng thư mục).

## 1. Bảy NPC làng (`cong-cu/dung-npc.py`)
- Thay `nl-<mã>.sprite.json`, giữ định dạng cũ: 2 hàng × 6 khung (đứng 1,2 s lặp; nói 0,9 s lặp), nét ×2, ảnh nhìn sang phải (quy ước lật giữ nguyên).
- **Chiều cao đứng** (điểm game, Zed mới cao 31):

  | Lái Đò | Thợ Rèn | Hàng Xén | Thợ May | Cụ Đồ (ngồi) | Ông Từ | Anh Mõ |
  |---|---|---|---|---|---|---|
  | 42 (cả nón) | 41 | 33 | 40 | 29–30 | 41 | 40 |

- Hàng nói co theo tỉ lệ đo bằng SIFT so với hàng đứng (`sift_ti_le.py`). Neo: đáy chân = đường đất, ngang = giữa dải chân. Bỏ mảnh vụn rời < 12 điểm.
- Ô khung to hơn (30–37 × 33–50). **Hộp chạm và chỗ hiện bong bóng / dấu "!"** theo cỡ ảnh: `VS.coAnh` (sprite_custom.js) → `topOf`, `halfW` (village_scene.js). Không có ảnh thì như cũ.
- Chân dung lớn (`bigNpc` ×3 ở bảng, Lái Đò ×2 ở bản đồ, `truyen.js`) dùng luôn ảnh mới. Cao gần như ảnh cũ (40 → 42) nên không phải dời.
- Ảnh soát: `xem-npc.png`.

## 2. Bản đồ chọn ải + thẻ ô ải
- `gd-ban-do-vung`: tranh mới thu về 480×270, bảng 256 màu (134 KB).
- **Toạ độ** (`VS.MAP`, nguồn `cong-cu/ban-do-toa-do.json`):
  - Rừng già: bên trái, đi từ bãi cỏ cạnh thác lên cao nguyên.
  - Hang biển: dọc bờ biển dưới, có hang đá. Trùm ở bãi cát trước hang bên phải.
  - Lâu đài cổ: trên phải, đường đá dưới cổng lâu đài.
- Đường nét đứt giữ cách nối cũ: lấy từ làng; vùng 3 nối từ trùm vùng 1 và trùm vùng 2.
- Mới thêm vào `MAP`: `bossLab` (chỗ tên trùm), `soonDash` (nét mờ tới 3 ổ khoá của tranh), `lang` (chữ "Làng"), `doKho` (nút độ khó).
- **Nút độ khó** dời lên trên (256, 7) vì chỗ cũ đè lên ải Hang biển.
- **Thẻ bia đá** (`cong-cu/dung-the-ai.py`):
  - Tách nền xanh có alpha ở mép và quầng sáng. Rêu bên trong giữ đục.
  - Thẻ thường 35×34, thẻ trùm 40×41.
  - `T.stageCard` vẽ đúng cỡ ảnh. Neo chỗ viết số: thẻ thường ở giữa mặt bia, thẻ trùm ở mặt đồng.
  - Dòng sao / sức mạnh nằm ngay dưới thẻ (`T.theDuoi`).
- Ảnh soát: `xem-ban-do.png` (khung trắng là bảng ải, nút, bong bóng chồng lên).

## 3. Vòng báo trước = hoạt ảnh (`cong-cu/dung-bao-truoc.py`, `js/bao_truoc.js`)
- **4 tấm ảnh**: `gd-bt-tron`, `gd-bt-vanh`, `gd-bt-quat`, `gd-bt-dai`, mỗi tấm 1 hàng 8 khung.
- **Tách nền có alpha** (`tach_xanh.py`):
  - Coi mỗi điểm = α·màu + (1−α)·nền đo được (#03F80D).
  - Lấy α nhỏ nhất cho màu hợp lệ. Kênh lục chặn dưới; đỏ và lam chỉ chặn trên, vì nền nhiễu ±5.
  - Kết quả: lòng bán trong trở về đỏ/cam, không còn ám xanh.
- **Cắt khung**: các khung chạm nhau nên không cắt theo cột trần.
  - Cắt theo tâm / đỉnh từng khung (bước 271,5), giữ trong bán kính hoặc hình quạt.
  - Hoa văn trái/phải của vòng chạm khung bên cạnh, nên thay bằng hoa văn trên/dưới xoay 90°.
  - Dải dọc: tâm từng dòng đo từ viền.
- **Vẽ**:
  - Khung = floor(u × 7), với u là tiến độ 1 − t/t0 như phần "lấp dần" cũ.
  - Khung 8 lúc nổ, thay chớp cũ, mờ dần trong 0,22 s. Đòn bị huỷ thì mờ dần như cũ.
  - Nhuộm nhẹ theo hệ bằng bảng TINT cũ, đỏ vẫn là chủ đạo.
- **Theo từng hình**:
  - Tròn: ép dẹt theo `ky`.
  - Quạt: xoay theo `ang`, giãn theo `r`. Góc mở khác 88° của ảnh thì chia lát, lát mép khớp đúng viền.
  - Đường thẳng / chữ nhật: dải kéo theo dài × rộng (chữ nhật đứng thì xoay dọc).
  - Vành: dời bán kính từng điểm cho dải vành nằm đúng r0..r1 (nhớ theo tỉ lệ). Có `gaps` thì xoá cung bằng `destination-out` trên tấm phụ. r0 < 0,15·r1 thì dùng ảnh tròn.
- **Lớp đất**:
  - `BT.dat` (gọi từ `G.drawWorld` ngay trước nhân vật) vẽ lên `#world`.
  - Ở kiểu ảnh không còn `BT.snap`, `maskOut`, đọc lại canvas.
  - Vùng thêm muộn (vòng gai dưới chân tinh anh) vẽ ngay lên `#world` trước thân quái.
  - Tường nước, đường ngắm (không có ảnh) vẽ kiểu điểm ảnh cũ trên lớp đất.
- **Dự phòng**: `?baoanh=0` / `G.BT_ANH = false`, hoặc thiếu ảnh, thì đi đường cũ y nguyên. Thời gian, vùng va chạm, sát thương không đổi.
- **Bài kiểm** (chỉ sửa, không chạy): `bao_truoc.py`, `bt_tuong.py` đặt `G.BT_ANH = false`. `bt_khop.py` tự thêm `&baoanh=0`, vì `_px` chỉ có ở kiểu điểm ảnh.
- Ảnh soát: `xem-bao-truoc.png` (4 kiểu × 8 khung trên sàn rừng thật, vành đã dời bán kính).

## 4. Nén dung lượng (`cong-cu/nen-anh.py`, bảng đủ ở `cong-cu/ra/nen-anh.json`)
- **Không mất gì**: 245 tấm có ≤ 256 màu nhưng đang lưu RGBA → PNG bảng màu. Đã so lại từng điểm ảnh.
- **Có mất ít**, chỉ áp cho tấm > 256 màu và ≥ 50 KB: bộ Zed (4 tấm thân + `zed-vk`) và 12 hiệu ứng lớn.
  - Đưa về 256 màu (k-means).
  - Điểm đục vẫn đục, điểm trong vẫn trong. Không đổi cỡ, không làm mờ.
  - Sai số trung bình 0,7–5,5 / 255. Ảnh so trước/sau không thấy khác.

| | Trước | Sau | Trần |
|---|---|---|---|
| PNG trong art/custom | 21,37 MB | 13,90 MB | |
| Bản một tệp | 31,17 MB | **21,32 MB** | 30 |
| Ảnh máy chủ (`--hai-tep`) PNG + WebP | 34,87 MB (21,30 + 13,57) | **25,82 MB** (13,90 + 11,91) | 26 |
| Người chơi tải (WebP) | 13,57 MB | 11,91 MB | |

Lớn nhất:

| Tấm | Trước | Sau | Cách |
|---|---|---|---|
| zed-bien / lau / rung / moi | 0,87–0,93 MB | 0,25–0,27 MB | 256 màu |
| hu-tien-hoa-* | 0,20–0,29 MB | 0,06–0,09 MB | 256 màu |
| gd-lang-nen | 309 KB | 103 KB | bảng màu |
| hu-trum-no-* | 0,19–0,24 MB | 0,06–0,07 MB | bảng màu |

Ảnh máy chủ chỉ còn **0,18 MB** dưới trần. Đợt sau thêm ảnh sẽ chạm trần. Có thể bớt tiếp: hạ trùm vùng xuống 96 màu, hoặc cắt viền trống ô khung.

## Cần chủ dự án xem khi chơi
1. **NPC**:
   - Cỡ so với Zed, và chỗ bấm (hộp chạm theo ảnh).
   - Dấu "!" và bong bóng nay nằm trên đỉnh đầu ảnh mới.
   - Lái Đò neo theo giữa chân + mái chèo nên có thể lệch trái 1–2 điểm.
   - Game vẫn chỉ vẽ khung đứng đầu (`G.NL_DONG` tắt như 12/10). Hàng nói chỉ chạy khi bật cờ đó.
2. **Bản đồ**:
   - Thẻ bia đá to hơn trống cũ, vài thẻ chồng mép nhau (Lâu đài cổ cách nhau ~32).
   - Số ải viết trên mặt bia (trùm: trên mặt đồng, hơi nhỏ so với chữ).
   - Em bé đứng trên thẻ đang chọn.
   - Nút độ khó (khi đã qua 15 ải) nay ở trên cùng giữa.
   - Ban đêm (độ khó 2) tranh nhân màu như cũ.
3. **Vòng báo trước**:
   - Nay nằm DƯỚI mọi nhân vật và hiệu ứng nhân vật (trước đây vẽ sau cùng trên #ui), nên quái to có thể che một phần vùng.
   - Số sát thương không còn bị vùng che.
   - Vòng vành dời bán kính nên hoa văn bị kéo / nén khi r0/r1 khác 0,77.
   - Quạt rộng (> 100°) ghép lát.
   - Dải thẳng mỏng bị kéo dày theo bề rộng đòn.
   - Ảnh 8 khung phóng lớn không làm mịn (điểm ảnh to ở vùng r > 100).
   - Bỏ chấm lưới cho người khó phân biệt đỏ–lục ở kiểu ảnh (ảnh có hoa văn riêng).
4. **Zed 256 màu**: soát xem áo / tóc có bị gợn màu không (ảnh so tĩnh không thấy).
