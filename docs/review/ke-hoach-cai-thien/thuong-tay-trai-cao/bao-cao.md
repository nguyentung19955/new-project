# Thương: nâng tay trái cao hơn (17/10)

Yêu cầu chủ game (17/10 01:39): "ở phần thương tôi muốn cầm cao ở tay trái lên 1 chút để trông nó rộng ra".
Đã chờ phiên `gan-vk` xong (có báo cáo lúc 19:45) rồi mới gộp. **Không chơi thử**: chỉ ảnh soát và GIF dựng bằng máy.
Không đổi luật, sát thương, vùng trúng, thời gian đòn. Không đụng đăng nhập Google / lưu mây / `?cloud=0`.

## Tóm tắt

- Cu Tí cầm thương hai tay: **nắm tay trái nâng lên 2–3 điểm game**. Tay phải giữ nguyên chỗ cũ.
- Cán đi thẳng qua tay phải và tay trái mới, nên **chếch lên thêm khoảng 11–20°**. Thế cầm trông rộng, thoáng hơn.
- Tay trái vẫn là nắm tay ôm cán (ngón đè lên cán, cán khuất dưới ngón), đúng `cam-vk-chuan/LUAT.md`.
- **43 / 50 khung** cầm hai tay đã nâng. 7 khung giữ bản cũ (xem bảng).
- Tắt: **`?thuongcao=0`** (về y như cũ).
- Không thêm ảnh: chỉ thêm tệp số `game/js/thuong_cao_data.js` (9 KB).

## Bảng từng hàng (bộ Ninja)

| Hàng | Khung nâng | Nâng (điểm game) | Góc cán thêm | Ghi chú |
|---|---|---|---|---|
| Đứng | 8 / 8 | 2 | ~12° (−18° → −30°) | |
| Đi | 8 / 8 | 2,5 | ~13° | |
| Chạy hai tay | 12 / 12 | 2 | ~20° | hai tay gần nhau nên góc đổi nhiều hơn |
| Thương 1 | 4 / 6 | 2–3 | ~11° | **khung 3–4 (đâm trúng) giữ cũ** |
| Thương 2 | 4 / 6 | 2–2,5 | ~12° | **khung 3–4 (hất trúng) giữ cũ** |
| Thương 3 | 4 / 6 | 2–2,5 | ~14° | **khung 3–4 (đâm trúng) giữ cũ** |
| Quét | 0 / 1 | – | – | chỉ khung 6 cầm hai tay; **giữ cũ** (xem dưới) |
| Giữ thương | 3 / 3 | 3 | ~12° | |
| Xốc, Phi Thương (đặc biệt) | – | – | – | cầm **một tay phải**, không có tay trái trên cán: không đổi |

Số đủ từng khung: `so-do.json`.

**Mũi thương và chỗ đâm:** các khung đâm / hất trúng giữ nguyên hẳn (cùng neo, cùng góc), nên mũi và hướng đâm lúc trúng không đổi. Vùng trúng là luật, không đụng tới. Vì thế không cần bù độ dài cán.
Các khung vào thế / thu thế nâng tay, game nội suy góc giữa các khung như cũ nên vẫn liền.

## Cách làm

1. Máy dò cánh tay trái theo từng cột điểm ảnh: từ nắm tay đi ngược cẳng tay tới mép thân (chỗ khuỷu / chỗ tay khuất sau người).
2. Mỗi cột của cẳng tay **dời lên dần**: 0 ở khuỷu, tăng đều tới đủ mức ở cổ tay, nắm tay dời đủ mức.
   Cả cột dời nguyên khối, nên nét, màu, viền pixel giữ nguyên. Cẳng tay nghiêng lên, vẫn liền với khuỷu. Không vẽ thêm, không đổi thân.
3. Điểm tay trái trên cán dời lên cùng mức. Góc cán = đường nối hai tay. Nắm tay ôm cán (ảnh `20-nam-tay-om-can`) tự đặt vào chỗ mới.
4. Lớp nắm tay cắt từ thân (dùng khi nhắm lệch nhiều) dời cùng phép, nên hai lớp khớp nhau.

Đã chọn cách 1 (tách và dời cẳng tay) vì giữ đúng nét gốc. Lớp nắm tay ôm cán có sẵn vẫn dùng như trước, chỉ đặt vào chỗ mới.

**Game** (`js/zed_moi.js`): hàm `thuongCao` (thay neo), `anhCao` (dựng khung thân đã nâng tay một lần trên canvas phụ, từ tấm thân hiện có), `caoCua` (chọn khung khi vẽ, cả lúc chạy mà đánh).
- Chỉ áp khi neo đang dùng còn khớp bản đã đo. Ai dựng lại tấm thì game tự về như cũ.
- Cần nắm tay từ ảnh: `?ngonanh=0` thì cũng về như cũ.
- Cờ `G.THUONG_CAO` ở `js/data.js`. `index.html` nạp thêm `js/thuong_cao_data.js`.

## Khung giữ bản cũ, cần gen lại nếu muốn

**Quét khung 6** (thu thế): hai nắm tay chỉ cách nhau ~3 điểm game. Nâng 2 điểm game thì cán dựng ~30° và hai nắm tay gần chồng lên nhau, nhìn xấu. Nếu muốn khung này cũng cầm cao:

> Pixel art chibi boy, same character, outfit, size and style as the reference sheet. Redraw ONLY frame 6 of the spear sweep row: both fists in front of the chest on one diagonal line as if holding an invisible spear shaft, left fist about 4 px higher and 6 px further forward than the right fist (wider grip), right fist stays at the same place as the reference frame. Same legs and body as frame 6. Background solid #00FF00, no weapon, no text, no shadow.
>
> Gửi kèm: `docs/anh-goc/zed/moi/14-thuong-quet.png`.

Khung đâm / hất trúng của thương 1–3 giữ cũ **có chủ ý** (giữ chỗ đâm), không cần gen lại.

**Bộ Rừng / Biển / Lâu đài: chưa làm.** Như `cam-vk-chuan/bao-cao.md` đã ghi, máy đo tay ở các bộ này không tin được (cẳng tay trần dính liền nắm tay; găng da cùng tông màu da). Các bộ này giữ như cũ.

## Ảnh soát (thư mục này)

- `luoi/<hàng>.png`: mỗi khung một cột, **trên TRƯỚC / dưới SAU**, phóng ×4, thương cấp Trắng. Dưới mỗi cột ghi "NANG TAY" hoặc "giu nhu cu".
  Có đủ: `dung`, `di`, `chay-hai-tay`, `thuong-1`, `thuong-2`, `thuong-3`, `quet`, `giu`, `xoc`, `dac-biet`.
- GIF ×3, trái TRƯỚC, phải SAU: `gif-dung-x3.gif`, `gif-chay-x3.gif`, `gif-thuong-1-3-x3.gif`.
- Dựng lại (từ gốc repo):
  ```
  python3 docs/review/ke-hoach-cai-thien/thuong-tay-trai-cao/sua.py
  python3 docs/review/ke-hoach-cai-thien/thuong-tay-trai-cao/soat.py
  ```

## Kiểm

- `node --check` mọi `game/js/*.js`: đạt.
- `python3 game/build.py` và `--hai-tep`: đạt. Bản một tệp **28,45 / 30 MB**. Người chơi tải 16,70 / 20 MB.
- Nạp `linh-khi.html?cloud=0` bằng trình duyệt không giao diện (không bấm phím), gọi hàm vẽ Cu Tí cầm thương: 0 lỗi JS, `G.zedMoi.loi` rỗng.
  Bản mặc định khác `?thuongcao=0` ở mọi khung đứng / đi / chạy / đòn đã nâng; khung đâm trúng giống hệt bản cũ.
- Không đụng master, không force push, không tạo PR.

## Lần 2: khung 6 quét (17/10)

Chủ game đã gen lại khung 6 (thu thế) của hàng thương quét theo prompt ở mục "Khung giữ bản cũ". **Không chơi thử**: chỉ ảnh soát và GIF dựng bằng máy.

**Đã làm**
- Dùng bản **1 khung to** (`docs/anh-goc/zed/moi/14-thuong-quet-k6-moi.png`): khớp tốt, không cần bản dự phòng.
- Cỡ: **cao đầu bằng khung 6 cũ** của hàng quét (người cao 64 so với 66 điểm ảnh ô 96 cũ). Chỗ: **bàn chân trước đứng đúng chỗ cũ**, chân chạm đất như cũ.
- Thu nhỏ kiểu **nét** (`do-net/cong-cu/thu_net.py`: mỗi điểm một màu có thật), có sẵn **bản to ×1,2** dựng thẳng từ ảnh gốc (trong trận chép 1:1, không phóng lúc vẽ). Thêm bản cũ kiểu BOX cho `?netcu=1`.
- Neo đo lại trên ảnh mới: tay phải (dưới) `61,65 ; 58,92`, tay trái (trên, xa ra trước) `69,53 ; 52,17`. Hai tay cách nhau **5,2 điểm game** (cũ 3,2), tay trái cao hơn ~3,4 điểm game.
  **Cán đi thẳng qua hai nắm tay**, chếch lên **−40,6°** (cũ −6°). Thế cầm rộng hẳn, hai nắm tay không còn chồng nhau.
- Chỉ thay khung 6. Khung 1–5 và các hàng khác giữ nguyên từng số.

**Bật / tắt**
- Mặc định: khung 6 mới.
- `?thuongcao=0`: về khung 6 cũ + neo cũ (y như trước).
- `?netcu=1`: khung 6 mới, bản thu nhỏ kiểu cũ, vẽ cách cũ.

**Cách làm (kỹ thuật)**
- Không sửa tấm `zed-moi`. Ảnh khung mới (2 ô: thân | lớp ngón tay trước) nằm trong `game/js/thuong_cao_data.js`, mục `thuong_quet` khung 6, khoá `anh` (bản thường, bản to, bản cũ). +13 KB.
- `js/zed_moi.js`: `thuongCao` nhận mục `anh`; `anhCao` chép ảnh thay khung (không dời cột); `veT` lấy ô bản to của khung thay khi vẽ nét to. Tải sẵn ảnh khi nạp trang.
- `game/build.py` (bản hai tệp): ảnh base64 còn trong mã được tách ra `anh/ma-rieng.<mã>.png` như các ảnh rời khác.
- Dựng lại: `python3 docs/review/ke-hoach-cai-thien/thuong-tay-trai-cao/quet-k6/dung_k6.py --ghi` (chỉ ghi mục quét khung 6, không đụng mục khác).
  `sua.py` cũng biết mục này (`ANH_THAY`). Lưu ý: chạy lại cả `sua.py` sẽ đo lại "cột" các hàng khác trên tấm đã dựng nét (lần này **không** chạy lại, để giữ nguyên).

**Kiểm**
- Soát cầm vũ khí `cam-vk-chuan/soat.py` (nay đo luôn khung thay ảnh, `ap_anh_thay`): **0 lỗi** mọi hàng × 4 cấp. Khung 6 mới: tâm nắm đo lệch neo ≤ 0,9 đơn vị ô 96 (ngưỡng 2), tay trái nằm trên cán.
- `node --check` mọi `game/js/*.js`: đạt.
- `python3 game/build.py` và `--hai-tep`: đạt. Bản một tệp **29,74 / 30 MB**. Người chơi tải **17,68 / 20 MB**.
- Nạp trang bằng trình duyệt không giao diện (không bấm phím), gọi hàm vẽ Cu Tí ở khung 6 quét: 0 lỗi JS, `G.zedMoi.loi` rỗng. Bản một tệp và bản hai tệp đều dùng ảnh mới (cả bản to); `?thuongcao=0` ra khung cũ; `?netcu=1` ra khung mới vẽ cách cũ (`quet-k6/kiem-may-ve.png`: mặc định | thuongcao=0 | netcu=1 | hai tệp | hai tệp thuongcao=0).

**Ảnh soát** (`quet-k6/`)
- `gif-quet-x3.gif` (thương Trắng), `gif-quet-cap4-x3.gif` (Thức tỉnh): đứng → quét 6 khung → đứng, trái TRƯỚC | phải SAU, ×3, dừng lâu ở khung 6.
- `k6-x4.png`: khung 6 ×4, trên TRƯỚC / dưới SAU; cột 1 thân trơn, cột 2–5 bốn cấp thương.
- `k6-to-x4.png`: khung 6 mới: bản thường | bản to ×1,2 | bản BOX (`?netcu=1`).
- Dựng lại ảnh: `python3 docs/review/ke-hoach-cai-thien/thuong-tay-trai-cao/quet-k6/soat_k6.py`.

Không đụng đăng nhập Google, lưu mây, `?cloud=0`. Không đụng master, không force push, không tạo PR.
