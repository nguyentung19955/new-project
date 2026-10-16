# Báo cáo phiên 3 — Luyện vũ khí: đo bot, chốt số, dọn (16/10)

Làm "Phiên 3" ở mục 5.2 của [THIET-KE.md](THIET-KE.md), nối tiếp [bao-cao-1.md](bao-cao-1.md) và [bao-cao-2.md](bao-cao-2.md). Mọi lần đo đều có luật trùm công bằng (tư vấn 2), phúc lành giữa ải (tư vấn 4) và vùng 4 (cả ba đang bật mặc định). Chỉ đo bằng bot Node, **không chơi tay**.

## Tóm tắt 1 phút

- **15 ải (vùng 1–3): giữ nguyên giá.** Luyện **38 lần chơi, 181 phút**; luật cũ (`?luyen=0`) **38 lần, 178 phút**; phiên 1 là 38 lần, 179 phút. Lệch dưới 2%. Không ải nào quá 9 lần.
- **Vùng 4: phải chỉnh một chỗ.** Với trần cũ (cấp 13 trước Thuồng Luồng), ải **4-5 phải chơi 11,2 lần** (quá trần 9; luật cũ 7,2), có lượt kẹt tới 32 lần, vàng dồn gần 10.000. Cả 20 ải: 54 lần so với 49 của luật cũ (+10%).
- **Đã chỉnh:** trần trước Thuồng Luồng **13 → 14**. Cấp 14 **không cần mảnh**, cấp 15 vẫn cần 2 mảnh Thuồng Luồng. M và giá giữ nguyên. Sau khi chỉnh (16 lượt bot): 4-5 còn **5,3 lần** (luật cũ 7,2), cả 20 ải **49 lần, 234 phút** (luật cũ 50 lần, 237 phút).
- **Trần theo trùm nay là 5 / 9 / 12 / 14 / 15.** Mảnh trùm cần ở cấp 6 (Mộc Tinh), 10 (Ngư Tinh), 13 (Hồ Tinh), 15 (Thuồng Luồng ×2).
- **Sức mạnh lúc tới từng ải** (mô hình `mo_hinh.js`): lệch so với trước Luyện trong khoảng **−0,9% … +1,6%**, trong giới hạn 3%.
- **Dọn:** gần như **không bỏ được gì** của hệ cũ, vì `?luyen=0` vẫn dùng mài, lò, ép đồ, bùa và mọi ảnh. Chỉ bỏ được 3 câu chữ chết và 1 nhánh code chết. Chi tiết ở mục 4.
- **12 ảnh "gân":** chỉ ghi prompt (mục 5), chưa vẽ.

---

## 1. Bảng trước / sau

Lệnh: `python3 game/tests/cay.py 8 --node --ngay=8 --viec` (thêm `--vung4` để đi 20 ải; luật cũ chạy với `LK_Q=luyen=0`).

### 1.1. 15 ải (vùng 1–3)

| | Luật cũ (`?luyen=0`) | Phiên 1 | **Phiên 3 (giữ giá)** |
|---|---|---|---|
| Lần chơi đi hết 15 ải | 38 | 38 | **38** |
| Thời gian (trung bình) | 178 phút | 179 phút | **181 phút** (+1,7%) |
| Ải nhiều nhất | 3-5: 4,8 lần | 3-5: 4,6 | **3-5: 4,9** |
| Lúc qua 3-5 | Sức mạnh 579, còn 2.283 vàng, 683 LK, 227 quặng | 564 | Sức mạnh 570, còn 3.839 vàng, 282 LK, 0 NLR |

Số lần chơi từng ải (trung bình 8 lượt):

- **Luật cũ:** `1 · 1 · 2,1 · 1,1 · 3,5 | 1 · 3,0 · 4,6 · 1,1 · 3,4 | 2,0 · 2,6 · 4,6 · 2,1 · 4,8`
- **Luyện:** `1 · 1 · 3,0 · 1,5 · 3,4 | 1 · 4,5 · 3,6 · 2,0 · 3,9 | 1 · 1,8 · 3,9 · 1,5 · 4,9`

Vì lệch dưới 10% và không ải nào quá 9 lần, **giá trong `G.LUYEN` không đổi**. Vùng 1 vẫn chậm hơn luật cũ khoảng 1,3 lần chơi (1-3, 1-4); vùng 3 nhanh hơn bù lại. Linh khí và NLR nay tiêu gần hết (không còn dồn 683 linh khí, 227 quặng như luật cũ). Vàng còn dư hơn (3.839 so với 2.283).

### 1.2. 20 ải (thêm vùng 4)

Đo lần đầu 8 lượt mỗi bên. Vì 4-5 dao động mạnh giữa các lượt, sau khi chỉnh đo lại **16 lượt cho cả hai luật** (cột in đậm).

| | Luật cũ, 8 lượt | **Luật cũ, 16 lượt** | Luyện trần 13, 8 lượt | **Luyện trần 14, 16 lượt (đã dùng)** |
|---|---|---|---|---|
| Lần chơi đi hết 20 ải | 49 | **50** | 54 | **49** |
| Thời gian | 236 phút | **237 phút** | 266 phút | **234 phút** |
| Riêng 15 ải đầu | | **37,4 lần** | | **36,4 lần** |
| 4-1 · 4-2 · 4-3 · 4-4 · 4-5 | 1,0 · 1,0 · 1,4 · 2,0 · 7,2 | **1,0 · 1,1 · 1,6 · 1,4 · 7,2** | 1,0 · 1,6 · 2,0 · 1,5 · **11,2 ✗** | **1,2 · 2,0 · 2,2 · 1,5 · 5,3** |
| Lượt tệ nhất ở 4-5 | 13 lần | 13 lần | 32 lần | 12 lần |
| Lúc qua 4-5 | Sức mạnh 756, còn 2.479 vàng | 753, còn 3.001 vàng, 420 quặng | 741, còn **9.956 vàng** | 742, còn 3.735 vàng |

- Luyện trần 14 còn được đo thêm 2 lần 8 lượt: 4-5 là 5,6 và 9,4 lần. Gộp cả 32 lượt thì trung bình **6,4 lần**, dưới trần 9 và dưới luật cũ (7,2).
- Kiếm lên cấp 14 ở khoảng ải 4-4 (sớm nhất 4-2).

**Vì sao chỉnh:** với trần 13, bot chạm trần ngay đầu vùng 4. Lúc đó nó không còn gì để nâng, vàng dồn lại, và chỉ còn cách đánh đi đánh lại trùm 4-5. Luật cũ vẫn mài, ép tiếp được nên vượt 4-5 nhanh hơn. Cho lên cấp 14 trước Thuồng Luồng (cấp 14 = ×5,30, gần bằng Thức tỉnh +15 Đỏ ×5,46 của luật cũ) là đủ. Cấp 15 (Viên mãn) vẫn là phần thưởng sau Thuồng Luồng.

### 1.3. Đo "khuyên dùng" (`--kd=4`)

Sức mạnh để bot thắng 75% (mỗi bản lưu đánh lại ải 4 lần):

| Ải | Khuyên dùng hiện | Luật cũ | Luyện |
|---|---|---|---|
| 2-3 | 260 | 237 | 239 / 248 |
| 3-3 | 410 | 394 | 400 / 437 |
| 3-5 | 520 | 585 | 574 / 562 |
| 4-5 | 690 | 817 | 809 (trần 13) / trên 739 (trần 14: mọi bản lưu ≤ 739 đều thắng dưới 75%) |

Cột Luyện có 2 số vì đo 2 lần (trần 13 và trần 14; vùng 1–3 không bị trần ảnh hưởng, chênh là do bot ngẫu nhiên).

- Hai luật cho số gần như nhau, tức là Luyện không làm ải dễ hay khó đi.
- **Cần chủ game biết:** ở cả hai luật, 3-5 và 4-5 thật ra cần cao hơn số khuyên dùng (3-5 khoảng 575–585 so với 520; 4-5 khoảng 810 so với 690). Bot vẫn qua được vì có thua rồi cày thêm. Đây là việc của phiên cân vùng 4 / trùm, phiên này không đổi số khuyên dùng.

---

## 2. Giá đã chỉnh

Chỉ đổi trần và mảnh ở cấp 14. **M, vàng, linh khí, NLR, nguyên liệu vùng của cả 15 cấp giữ nguyên.**

| | Trước | Sau |
|---|---|---|
| Trần theo trùm đã hạ (`G.LUYEN.tran`) | 5 / 9 / 12 / 13 / 15 | **5 / 9 / 12 / 14 / 15** |
| Cấp 14 | 1.450 vàng, 120 LK, 75 NLR, 6 Gỗ linh **+ 1 mảnh Thuồng Luồng** | 1.450 vàng, 120 LK, 75 NLR, 6 Gỗ linh |
| Cấp 15 | 2 mảnh Thuồng Luồng | giữ |

Chữ ở Hành trang › Tài nguyên: mảnh Thuồng Luồng nay ghi "Luyện lên cấp 15" (trước: "cấp 14 và 15"). Muốn trả lại như cũ: sửa `tran` và dòng cấp 14 trong `G.LUYEN` (`game/js/data.js`, đã ghi chú ngay đó).

## 3. Sức mạnh khi tới từng ải (mô hình)

`mo_hinh.js` nay dùng đúng trần và mảnh như game. Kết quả ghi lại ở [ket-qua-mo-hinh.txt](ket-qua-mo-hinh.txt). So Sức mạnh lúc tới từng ải, luật cũ → Luyện:

| Ải | 1-1 | 1-2 | 1-3 | 1-4 | 1-5 | 2-1 | 2-2 | 2-3 | 2-4 | 2-5 | 3-1 | 3-2 | 3-3 | 3-4 | 3-5 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Cũ | 98 | 109 | 127 | 136 | 164 | 171 | 197 | 235 | 254 | 277 | 297 | 318 | 374 | 382 | 472 |
| Luyện | 98 | 108 | 126 | 138 | 163 | 170 | 197 | 234 | 258 | 281 | 296 | 317 | 379 | 379 | 470 |
| Lệch | 0 | −0,9% | −0,8% | +1,5% | −0,6% | −0,6% | 0 | −0,4% | **+1,6%** | +1,4% | −0,3% | −0,3% | +1,3% | −0,8% | −0,4% |

Tất cả trong khoảng **±3%**. Mô hình cũng cho 30 lượt so với 31 của luật cũ. Đổi trần ở mục 2 chỉ có tác dụng sau khi hạ Hồ Tinh, nên không làm thay đổi bảng này.

---

## 4. Dọn

Nguyên tắc: chỉ bỏ những gì **không còn đường dùng ở cả hai chế độ** (Luyện bật, `?luyen=0`, và `?luyen=0&tutbac=1`). Mỗi thứ đều đã grep trong `game/js`, `game/index.html`, `game/tests`, `tools/`.

### 4.1. Đã bỏ

| Thứ | Ở đâu | Grep chứng minh |
|---|---|---|
| Chữ "Luyện vũ khí: mỗi cấp chắc chắn thành công, không tụt cấp." | `js/luyen.js` (bảng chữ) | Chỉ có ở dòng khai báo, không chỗ nào gọi |
| Chữ "Đá nâng bậc: {0} · Bùa giữ bậc: {1}" | `js/ep_do.js` (bảng chữ) | Như trên. Bảng Ép đồ cũ hiện đá / bùa bằng biểu tượng, không dùng câu này |
| Chữ "Mài, nâng lò, nâng bộ trang phục, đổi nguyên liệu, đặt lại điểm kỹ năng" | `js/vk_moi.js` (bảng chữ) | Như trên. Hành trang dùng câu dài hơn ở `hanh_trang.js` |
| Nhánh `G.luyen.bat() ? sv.nlr : sv.ore` ở thanh làng | `js/village_scene.js` `VS.resParts` | Khi Luyện bật, `js/luyen_ui.js` thay cả hàm `VS.resParts` (nạp sau, `index.html`). Nhánh này không bao giờ chạy. Nay chỉ còn `sv.ore` của luật cũ |

### 4.2. Không bỏ được (vì `?luyen=0` hoặc chuyển bản lưu còn dùng)

| Thứ | Ai còn dùng |
|---|---|
| Luật mài, lò rèn (`upgrade.js`, `G.sharpenFull`, `G.FORGE_UP`, `G.FORGE_CAP`) | Thẻ Mài và nút lò ở Ông Thợ Rèn khi `?luyen=0` (`village.js`). Chuyển bản lưu dùng để tính phần đã tiêu và hoàn lò (`luyen.js` `L.daTieuCu`, `L.chuyen`). |
| Ép đồ (`ep_do.js`: ép, đổi dòng, khung, số bậc) | Thẻ Ép đồ ở `?luyen=0` (`village.js`, `hanh_trang.js`). `G.EP_DO.tong` dùng để tính M cũ khi chuyển bản lưu (`L.Mcu`). Khung ô `gd-o-ep-0..6` và `E.soBac` Luyện cũng dùng. |
| Bùa giữ bậc | Chỉ còn ở `?luyen=0&tutbac=1`: thương nhân bán bùa (`stage.js`), ô bùa ở bảng Ép đồ (`ep_do.js`), rơi bùa (`data.js`). |
| Cấp hệ bằng linh khí (`VM.nang`, `G.VK_MOI.gia`) | Thẻ Linh khí ở `?luyen=0`; chuyển bản lưu tính linh khí đã tiêu. |
| Ải Đá Bậc, Ải Đá Mài (`G.AI_NGAY.ai.da / mai`) | Danh sách ải ngày khi `?luyen=0` (`data.js`). |
| Ví cũ `sv.ore`, `sv.daBac`, `sv.buaBac`, `sv.forge` | Đường lui (thiết kế mục 4.3) và chuyển bản lưu. |
| Ảnh `gd-da-nang-bac`, `gd-bua-giu-bac`, `hu-ep-thanh-cong`, `hu-ep-that-bai`, `hu-ep-tut-bac` | `ep_do.js` (bảng Ép đồ, hiệu ứng ép) khi `?luyen=0`. Riêng `hu-ep-tut-bac` chỉ hiện khi `?tutbac=1`. |
| Ảnh nút `gd-ai-ngay-da`, `gd-ai-ngay-mai` | `ai_ngay.js` ghép tên ảnh từ mã ải. Ải Rèn đang mượn ảnh `mai` nên ảnh này dùng ở cả hai chế độ. |

**Ghi chú:**

- THIET-KE.md mục 5.1 ghi `hu-tut-bac`, nhưng ảnh thật tên là `hu-ep-tut-bac`. Không có tệp nào tên `hu-tut-bac`.
- Muốn xoá hẳn những thứ ở mục 4.2 thì phải bỏ cờ `?luyen=0` trước. Đây là "phiên dọn mới sau khi chủ game duyệt" trong thiết kế. Khi làm thì giữ lại `L.Mcu`, `L.daTieuCu`, bảng giá cũ và `G.EP_DO.tong` để bản lưu cũ vẫn chuyển được.
- Còn một khối code của Luyện có thể bỏ, nhưng **không thuộc hệ cũ nên chưa bỏ**: bảng Luyện tối thiểu của phiên 1 (`L.panel`, `L.chuGia` trong `luyen.js`, khoảng 115 dòng). Phiên 2 đã có bảng mới thay. Bảng cũ chỉ còn được gọi khi bảng mới bị lỗi (`luyen_ui.js`, trong `catch`). Bỏ thì mất chỗ dự phòng này.
- Các câu cũ "Mài / nâng lò" trong `tools/ngon-ngu/tu-dien/*.json` (công cụ dịch) đã cũ từ trước Luyện, không ảnh hưởng game. Chưa đụng.

---

## 5. Ảnh "gân" tiến độ 25% / 50% (bao-cao-C mục 4): prompt, chưa vẽ

- **12 ảnh** = 4 loại × 3 hình thái chưa tối đa (Trắng, Mầm, Thành hình).
- Theo Luyện, ảnh này hiện ở các cấp giữa hai mốc:
  - Trắng: Lv 2, trên đường tới Mầm (Lv 3);
  - Mầm: Lv 4–5, tới Thành hình (Lv 6);
  - Thành hình: Lv 7–11, tới Thức tỉnh (Lv 12).
- Nấc 50% không cần ảnh mới: bảng lò đã có hình mốc kế.

**Ảnh mẫu gửi kèm:**

- `docs/anh-goc/zed/moi/vk-kiem.png`, `vk-thuong.png`, `vk-bua.png`, `vk-phi-tieu.png` (mỗi ảnh 4 khung, 2172×724; khung thứ 1/2/3 là Trắng/Mầm/Thành hình);
- `docs/anh-goc/zed/moi/00-anh-mau.png`.

**Cỡ đích:**

- Vẽ cùng cỡ một khung của ảnh mẫu (khoảng 543×724, vũ khí cùng chỗ, cùng cỡ).
- Game thu nhỏ ×0,256 vào bộ `zed-vk` như ảnh hiện có. Cỡ trong game bằng đúng ô của cấp đó, ví dụ kiếm Trắng 111×29, kiếm Mầm 124×48, kiếm Thành hình 142×68.
- Đặt mã `zed-vk-gan`, cùng thứ tự ô với `zed-vk`.

| # | Ảnh | Prompt ngắn |
|---|---|---|
| 1–3 | Kiếm Trắng / Mầm / Thành hình | *pixel art, redraw frame N of the attached sword sheet exactly (same shape, horizontal, tip right, same size and grip position), add ONE thin 2-px glowing pale gold (#FFE9A8) vein along one third of the blade spine, nothing else changed, 1-px black outline, flat solid #00FF00 background, no text, no hands* |
| 4–6 | Thương Trắng / Mầm / Thành hình | *pixel art, redraw frame N of the attached spear sheet exactly (same shape, horizontal, tip right, same size and grip position), add ONE thin 2-px glowing pale gold (#FFE9A8) vein around the neck of the spearhead, nothing else changed, 1-px black outline, flat solid #00FF00 background, no text, no hands* |
| 7–9 | Búa Trắng / Mầm / Thành hình | *pixel art, redraw frame N of the attached hammer sheet exactly (same shape, same size and grip position), add ONE thin 2-px glowing pale gold (#FFE9A8) vein across the hammer face, nothing else changed, 1-px black outline, flat solid #00FF00 background, no text, no hands* |
| 10–12 | Phi tiêu Trắng / Mầm / Thành hình | *pixel art, redraw frame N of the attached throwing-star sheet exactly (same shape, same size, centered), add ONE thin 2-px glowing pale gold (#FFE9A8) ring around the center, nothing else changed, 1-px black outline, flat solid #00FF00 background, no text, no hands* |

N = 1 (Trắng), 2 (Mầm), 3 (Thành hình). Có ảnh rồi thì phiên sau gắn code: chọn ảnh `zed-vk-gan` khi tiến độ tới mốc kế ≥ 25%. Chưa có ảnh thì vẫn chỉ hiện thanh tiến độ như bây giờ.

---

## 6. Kiểm

| Bài | Kết quả |
|---|---|
| `node --check` mọi `game/js/*.js` | Đạt |
| `python3 game/build.py`, `--hai-tep` | Đạt. Bản một tệp báo 30,26 MB / trần 30 MB, đã vượt từ trước phiên này (do ảnh mới của các phiên khác). Phiên này không thêm ảnh |
| `node game/tests/*.test.js` (18 bài) | **18/18 đạt** |
| `node game/tests/luyen.test.js` | PASS 88 điều kiện (sửa 1 điều kiện cho trần 14) |
| `node game/tests/cloud_save_regression.test.js` | PASS |
| `python3 game/tests/cay.py --node` (luật) | Đạt hết |

Không đụng đăng nhập Google, lưu mây hay `?cloud=0`.

## 7. Tệp đã sửa

- `game/js/data.js`: `G.LUYEN.tran` = 5/9/12/14/15, cấp 14 bỏ mảnh.
- `game/js/hanh_trang.js`, `game/js/luyen_ui.js`: chữ "Luyện lên cấp 15".
- Dọn: `game/js/luyen.js`, `game/js/ep_do.js`, `game/js/vk_moi.js`, `game/js/village_scene.js`.
- `game/tests/cay.py`, `game/tests/cd_lib.py`: thêm cờ `--vung4` (đi 20 ải, `--kd` đo cả 4-1..4-5).
- `game/tests/luyen.test.js`: điều kiện trần.
- `mo_hinh.js` và `ket-qua-mo-hinh.txt`: khớp trần / mảnh với game.
- `game/dist` dựng lại.
