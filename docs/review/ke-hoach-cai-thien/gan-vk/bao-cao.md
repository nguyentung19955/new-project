# Gắn ảnh "gân" tiến độ Luyện (16/10)

Đã chờ phiên giảm dung lượng xong (báo cáo `dung-luong-16-10/bao-cao.md` có lúc 19:30) rồi mới dựng.
**Không chơi thử**: chỉ chụp ảnh soát bằng máy. Không đổi luật / số liệu, không đụng đăng nhập Google / lưu mây / `?cloud=0`.

## Tóm tắt

- Gắn được **7 / 12 ảnh**: búa (3 cấp), phi tiêu (3 cấp), thương Trắng.
- **5 ảnh không gắn** vì hình vẽ lệch ảnh trong game quá nhiều (khớp chồng < 95%). Game vẫn hiện ảnh thường cho các ô này.
  - **Kiếm (cả 3)**: ảnh gân vẽ theo **kiếm cũ** (`vk-kiem.png`), còn game dùng **kiếm mới** (`vk-kiem-moi.png`). Dáng khác hẳn: 59–82%.
  - **Thương Mầm, Thành hình**: dải lụa đỏ vẽ khác: 92% và 90%.
- Gân hiện ở: **Trắng Lv 2, Mầm Lv 4–5, Thành hình Lv 7–11**. Áp cho vũ khí trên tay, ô vũ khí, bảng Luyện.
- Tắt: **`?gan=0`**.
- Bản một tệp: **28,35 → 28,44 MB** (trần 30 MB). Người chơi tải: 16,66 → 16,70 MB (trần 20 MB).

## Bảng khớp từng ảnh

Khớp chồng = phần chung / phần hợp của hai hình (IoU). Lệch tính bằng điểm ảnh ô game (`zed-vk`).

| Ảnh | Khớp chồng | Lệch điểm nắm | Lệch mũi | Gắn? |
|---|---|---|---|---|
| Kiếm Trắng | 81,6% | 2,3 | 6,1 | ✗ |
| Kiếm Mầm | 67,3% | 2,2 | 7,2 | ✗ |
| Kiếm Thành hình | 58,6% | 16,1 | 4,4 | ✗ |
| Thương Trắng | **96,3%** | 0 | 0 | ✓ |
| Thương Mầm | 92,2% | 0,1 | 0 | ✗ |
| Thương Thành hình | 90,5% | 0,4 | 1,5 | ✗ |
| Búa Trắng | **98,4%** | 0,1 | 0,3 | ✓ |
| Búa Mầm | **98,9%** | 0,1 | 0 | ✓ |
| Búa Thành hình | **98,2%** | 0,8 | 0 | ✓ |
| Phi tiêu Trắng | **97,2%** | 0,1 | 0 | ✓ |
| Phi tiêu Mầm | **97,7%** | 0 | 0 | ✓ |
| Phi tiêu Thành hình | **97,8%** | 1,1 (tâm) | 0 | ✓ |

Số đủ: `so-lieu.json`.

## Cách căn

`dung_zed_vk_gan.py` (chạy lại được):

1. Tách nền xanh, tách 3 khung.
2. Với mỗi khung: so với khung gốc cùng cấp (đúng khung mà `zed-vk` dùng). Máy dò tỉ lệ co (rộng, cao) và chỗ đặt sao cho hai hình chồng khít nhất.
3. Khớp ≥ 95% thì dùng. Thu về **đúng rộng × cao ô `zed-vk`**.
4. Đường viền (độ trong) lấy **y nguyên ô `zed-vk`**. Hình trong game trùng 100% với ảnh thường, chỉ khác màu (có gân). Nhờ vậy điểm cầm, nắm tay và neo của `cam-vk-chuan` **giữ nguyên**, không phải đo lại.

Bộ mới: `game/art/custom/zed-vk-gan.sprite.json` (mã `zed-vk-gan`, 84 KB). Cùng thứ tự ô với `zed-vk`; ô không gắn để trống.
Tải sau như `zed-vk-he`. Chưa tải xong thì hiện ảnh thường.

## Khi nào hiện gân

| Cấp Luyện | 1 | 2 | 3 | 4–5 | 6 | 7–11 | 12+ |
|---|---|---|---|---|---|---|---|
| Hình thái | Trắng | Trắng | Mầm | Mầm | Thành hình | Thành hình | Thức tỉnh |
| Gân | – | **có** | – | **có** | – | **có** | – |

- Đúng cấp mốc (1, 3, 6) chưa có gân: vừa đổi hình thái, chưa đi được đoạn nào.
- Theo thanh tiến độ Luyện, các cấp có gân đều ≥ 33% tới mốc kế.
- Riêng **Lv 9** (Tinh luyện): thanh đếm lại từ 0, nhưng vẫn hiện gân theo danh sách Lv 7–11 đã chốt.
- Vũ khí đã có hệ: ảnh gân cũng nhuộm màu hệ như ảnh thường.
- `?luyen=0`: không có cấp Luyện nên không hiện gân.

## Ảnh soát (thư mục này)

- `luoi-so-goc-gan-x3.png`: ô game, trái gốc / phải gân, phóng ×3. Ô bị bỏ ghi chữ đỏ.
- `can-<loại>.png`: căn ở cỡ ảnh gốc: gốc | gân đã căn | chồng hình (xám = trùng, đỏ = chỉ gốc có, lam = chỉ gân có).
- `o-vk-cap-1-12-x3.png`: ô vũ khí 4 loại × Lv 1–12, trên có gân, dưới `?gan=0`, phóng ×3.
- `tren-tay-x3.png`: Cu Tí cầm vũ khí ở cấp có gân, trái có gân, phải `?gan=0`, phóng ×3.
- `bang-luyen-*.jpg`: bảng Luyện ở Ông Thợ Rèn (thương Lv 2, búa Lv 5, phi tiêu Lv 8).

**Cần để ý**:
- Trên tay, gân chỉ rộng khoảng 1 điểm ảnh nên rất khó thấy.
- Rõ nhất ở ô vũ khí và bảng Luyện, nhất là vòng vàng của phi tiêu. Gân búa mảnh.

## Cần vẽ lại (5 ảnh)

**Kiếm**: vẽ lại từ `docs/anh-goc/zed/moi/vk-kiem-moi.png` (KHÔNG dùng `vk-kiem.png`). Prompt:

> pixel art, redraw frame N of the attached sword sheet exactly (same shape, same curved blade, same leaf guard, same size and grip position, tip right), add ONE thin 2-px glowing pale gold (#FFE9A8) vein along one third of the blade spine, nothing else changed, 1-px black outline, flat solid #00FF00 background, no text, no hands

**Thương Mầm, Thành hình**: vẽ lại khung 2, 3 từ `vk-thuong.png`. Giữ đúng dải lụa đỏ: cùng dài, cùng hướng rủ, cùng số dải. Prompt như bao-cao-3 mục 5, thêm câu:

> keep the red ribbon exactly the same shape, length and direction as the reference

Có ảnh mới thì đặt đè tệp `vk-*-gan.png`, chạy lại:

```
python3 docs/review/ke-hoach-cai-thien/gan-vk/dung_zed_vk_gan.py
cd game && python3 build.py && python3 build.py --hai-tep
python3 tests/gan_vk_shots.py
```

## Kiểm

- `node --check` mọi `game/js/*.js`: đạt.
- `python3 game/build.py` và `--hai-tep`: đạt.
  - Bản một tệp **28,35 → 28,44 MB** / 30.
  - Người chơi tải 16,66 → 16,70 MB / 20.
  - Tải trước khi vào vùng đầu 5,53 → 5,58 MB (ảnh gân xếp vào nhóm lõi tải sau).
- `tests/luyen.test.js`: PASS 88 điều kiện. `tests/luyen_may.py` (lưu mây, `?cloud=0`): 10/10 đạt. `tests/cloud_save_regression.test.js`: PASS.
- `tests/gan_vk_shots.py` (mới):
  - Gân bật đúng Lv 2, 4, 5, 7–11.
  - Ô gân cùng cỡ ô `zed-vk`.
  - 0 lỗi JS.
- Nạp trang `?cloud=0` và `?cloud=0&gan=0`: 0 lỗi, `G.zedMoi.loi` rỗng.

## Tệp đã sửa

- `game/js/vien_vk.js`: cờ `G.VK_GAN` (`?gan=0`), `G.vkGan(w, cấp)`, `G.vkGanAnh(loại, cấp, ô)`.
- `game/js/zed_moi.js`, `game/js/vk_moi.js`: `anhVk` nhận thêm vũ khí, chọn ảnh gân (trên tay, ô đồ, bảng Luyện).
- `game/build.py`: `zed-vk-gan` tải sau.
- Mới: `game/art/custom/zed-vk-gan.sprite.json`, `game/tests/gan_vk_shots.py`, thư mục này.
