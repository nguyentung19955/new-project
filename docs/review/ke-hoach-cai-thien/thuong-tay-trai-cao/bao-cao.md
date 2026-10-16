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
