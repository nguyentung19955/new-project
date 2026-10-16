# Cầm vũ khí chuẩn theo luật chủ game (16/10)

Đã chờ đủ 3 báo cáo (chạy mới, búa mới, kiếm 2 mới — có lúc 15:43) rồi mới làm. Làm theo `LUAT.md`.
**Không chơi thử**: chỉ dựng khung bằng máy (y như game vẽ) rồi chụp ảnh, GIF.
Không sửa ảnh nhân vật, không đổi dáng tay, không đổi luật / sát thương / vùng trúng / thời gian đòn.

## Tóm tắt

- Soát **27 hàng × vũ khí**, mỗi khung × 4 cấp (Trắng / Mầm / Thành hình / Thức tỉnh), bộ ninja (bộ mặc định): **764 ô khung**.
- Trước: **215 ô lỗi**. Sau: **0 ô lỗi** (theo cùng máy đo).
- Lỗi chính:
  - **Kiếm**: cấp Mầm thì đốc chắn nằm lọt trong nắm tay; cấp Thành hình, Thức tỉnh thì chuôi hở dài ~2 điểm game giữa nắm tay và đốc.
  - **Phi tiêu** lúc đi / chạy: thân phi tiêu chĩa vào bụng, không theo hướng cổ tay.
  - **Búa**: 3 khung tay trái lệch cán hoặc bị cán vẽ đè lên.
- Thương: không có khung lỗi.
- Cờ quay lui: **`?camchuan=0`** (về neo cũ y như trước).
- Không có khung thương / búa phải gen lại.

## Bảng: hàng × vũ khí, số ô lỗi (khung × 4 cấp) trước → sau

| Hàng | Kiếm | Thương | Búa | Phi tiêu |
|---|---|---|---|---|
| Đứng | 24/32 → **0** | 0/32 → 0 | 0/32 → 0 | 0/32 → 0 |
| Đi | 24/32 → **0** | 0/32 → 0 | 0/32 → 0 | 16/32 → **0** |
| Chạy (kiếm, phi tiêu) | 36/48 → **0** | — | — | 44/48 → **0** |
| Chạy hai tay (thương, búa) | — | 0/48 → 0 | 0/48 → 0 | — |
| Kiếm 1 / 2 / 3 | 14/20, 15/20, 15/24 → **0** | — | — | — |
| Kiếm đặc biệt | 15/24 → **0** | — | — | — |
| Thương 1 / 2 / 3, quét, giữ, xốc, đặc biệt | — | 0 (cả 7 hàng) | — | — |
| Búa nện | — | — | 4/32 → **0** | — |
| Búa tụ lực | — | — | 0/16 → 0 | — |
| Búa nện đất | — | — | 4/24 → **0** | — |
| Búa đặc biệt | — | — | 4/24 → **0** | — |
| Phi tiêu ném / ngắm / chùm / đặc biệt | — | — | — | không vẽ phi tiêu trong tay (ném tay không, như thiết kế) |
| Lộn, trúng đòn | không cầm vũ khí (như thiết kế) | | | |

Chi tiết từng khung, mã lỗi: `so-do.json`.

## Máy đo gì (`do_cam.py`)

Đơn vị: 1 điểm game = 2 điểm ảnh ô 96.

| Mã | Lỗi |
|---|---|
| `tam` | Điểm cầm lệch tâm nắm tay (đo trên ảnh thân) quá 1 điểm game, hoặc dưới điểm cầm không có nắm tay (lơ lửng) |
| `truc` | Thương / búa: tay trái lệch đường cán quá 1 điểm game (cán gãy khúc) |
| `thieu2` | Thương / búa: ảnh có nắm tay thứ hai nằm trên cán, nhưng cán vẽ đè lên nó |
| `phu`, `phu2` | Cán không bị ngón che ở điểm cầm (vũ khí vẽ đè lên ngón) |
| `luoi` | Kiếm: đốc / lưỡi bắt đầu trong nắm tay |
| `ho` | Kiếm: chuôi hở dài quá 1,5 điểm game trước đốc |
| `phi` | Phi tiêu lệch hướng cẳng tay quá 45° |

## Đã sửa

Chỉ đổi điểm neo, góc, tay thứ hai, điểm cầm trên ảnh kiếm. Tính bằng `sua.py`. Kết quả ghi ở `game/js/cam_chuan_data.js` và `docs/anh-goc/zed/gan-vk/cam-chuan.json`.

1. **Kiếm (mọi hàng, cả 4 bộ trang phục)**: dời điểm cầm dọc chuôi để đốc chắn bắt đầu ngay mép nắm tay. Chuôi khuất dưới nắm tay, rồi đến đốc, rồi lưỡi, cùng một trục.

   | Cấp | Điểm cầm trên ảnh kiếm | Trước |
   |---|---|---|
   | Trắng | 19,9 → 21,6 | chuôi hở 0,6 điểm game |
   | Mầm | 21,5 → 18,6 | đốc lọt trong nắm tay |
   | Thành hình | 12,0 → 20,6 | chuôi hở 2,1 điểm game |
   | Thức tỉnh | 13,0 → 20,6 | chuôi hở 1,9 điểm game |

2. **Phi tiêu (đứng, đi, chạy)**: góc theo hướng cẳng tay đo từng khung, mũi hướng ra ngoài.
   - Đứng 55° → 70–75°.
   - Đi 55° → 90–110°.
   - Chạy 55° → 100–125°; riêng khung 8 → 15° (tay vung ra trước).
3. **Búa nện khung 8**: hai nắm tay nằm ngang, mà cán gần dựng đứng. Nay cán đi qua hai nắm tay: −75° → −20°. Góc mới nằm giữa khung 7 (−35°) và thế đứng (−17°), nên đường vung vẫn liền.
4. **Búa nện đất khung 5**: cán vẽ đè lên tay trái. Nay cán đi qua hai tay (−20° → 3°) và thêm nắm tay ôm cán ở tay trái.
5. **Búa đặc biệt khung 5**: tay trái đã nằm sát trục, nên giữ góc, chỉ thêm nắm tay ôm cán ở đó.

**Game**:
- `js/zed_moi.js`: hàm `camChuan` trong `bienThe` dùng bảng thay neo / điểm cầm.
- Chỉ thay khi tấm ảnh còn đúng bản đã đo. Ai dựng lại tấm thì game tự về số của tấm, không lệch.
- `js/data.js` có cờ `G.CAM_CHUAN`. `index.html` nạp thêm `js/cam_chuan_data.js` (1,4 KB).

## Ảnh soát (thư mục này)

- `luoi/<hàng>-<vũ khí>.png`: ảnh lưới phóng ×4 (×8 điểm game), cắt quanh tay. Hàng = khung. Trái là 4 cấp TRƯỚC, phải là 4 cấp SAU. Khung đỏ là ô có lỗi, mã lỗi ghi dưới ô.
  - Chấm vàng: điểm cầm. Chữ thập đỏ: nắm tay đo trên ảnh thân.
  - Chấm lam: tay thứ hai. Chữ thập cam: tay thứ hai đo trên ảnh thân.
  - Vạch hồng: trục vũ khí. Viền xanh lá: ngón / nắm tay vẽ đè lên cán.
- GIF ×3, trái TRƯỚC (`?camchuan=0`), phải SAU:
  - `gif-kiem-x3.gif` (kiếm 1–3, cấp 4), `gif-kiem-cap3-x3.gif` (cấp 3)
  - `gif-thuong-x3.gif`, `gif-bua-x3.gif`
  - `gif-phitieu-x3.gif` (đứng, đi, chạy)
  - `gif-chay-cam-thuong-x3.gif`
- Dựng lại:
  ```
  python3 docs/review/ke-hoach-cai-thien/cam-vk-chuan/sua.py
  python3 docs/review/ke-hoach-cai-thien/cam-vk-chuan/soat.py
  ```

## Kiểm

- `node --check` mọi `game/js/*.js`: đạt.
- `python3 game/build.py` và `--hai-tep`: đạt. Người chơi tải 17,14 / 20 MB. Phần của phiên này chỉ thêm khoảng 4 KB.
- **Cần để ý**: bản một tệp 30,27 / 30 MB, vượt trần. Đã vượt từ trước phiên này (bản trên nhánh lúc gộp đã 30,26 MB, do các phiên ảnh chạy song song). Bản này chỉ dùng cho trang công cụ, web chạy bản hai tệp.
- Chạy hàm vẽ của game bằng node (không mở trình duyệt): mặc định dùng điểm cầm / góc mới, `?camchuan=0` ra đúng số cũ, `G.zedMoi.loi` rỗng.
- Nạp trang `?cloud=0` (không bấm phím) và `?cloud=0&camchuan=0`: 0 lỗi JS.
- Không đụng đăng nhập Google / lưu mây / `?cloud=0`.

## Còn lại / cần gen lại

- **Thương / búa: không khung nào phải gen lại.** Mọi khung hai tay đều đặt được cán thẳng qua hai nắm tay.
- **Bộ Rừng / Biển / Lâu đài**: chỉ sửa điểm cầm kiếm. Neo từng khung chưa sửa, vì máy đo nắm tay không tin được ở các bộ này:
  - Rừng, Biển: cẳng tay trần dính liền nắm tay.
  - Lâu đài: găng da, giáp đỏ cùng tông màu da.
  - Thử đo 16/10 thì máy dời sai 1–2 điểm game, nên không dùng. Nếu cần, phải đo tay từng khung.
- **Chạy cầm phi tiêu, khung 8**: tay phải vung ra trước bụng, các khung khác ở sau hông. Phi tiêu theo cẳng tay nên lật hướng trong 1 khung (báo cáo chạy mới cũng đã nêu). Nếu muốn mượt, gen lại khung này:

  > Pixel art chibi boy running to the right, same character, outfit, size and style as the reference run sheet. Redraw ONLY frame 8 so it matches frame 2: right fist stays low behind the hip, forearm pointing down-back, hand empty. Same timing, same legs as frame 8. Background solid #00FF00, no weapon, no text, no shadow.
  >
  > Gửi kèm: `docs/anh-goc/cu-ti-hang-moi-16-10/03-chay-12k-v2.png`.
