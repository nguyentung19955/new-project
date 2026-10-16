# Còn vẽ tay 7: thay 5 ảnh chủ game gen lại

Ngày 16/10/2026, nhánh `khoi-tao-du-an`. Ảnh nguồn: `../con-ve-tay-6/anh-gen-lai/` (gen theo mục 4 báo cáo vẽ tay 6).

**Chưa chơi thử.** Chỉ chạy headless để chụp ảnh soát và kiểm lỗi:

- `node --check` mọi `game/js/*.js`: đạt.
- `python3 game/build.py` và `--hai-tep`: đạt. Người chơi tải 16,37 / 20 MB (trước 16,34). Lõi vùng đầu 5,65 MB. Bản một tệp 28,53 / 30 MB.
- `game/tests/smoke.py`: `errors: []`.
- Ảnh soát (`cong-cu/soat7.py`): 0 pageerror. `G.fxAnh.loi` và `G.spriteCustom.loi` rỗng.

Không đụng `cloud.js`, `cloud_ui.js`, `firebase-config.js`, `bo_nho.js`. Đăng nhập Google, lưu mây và `?cloud=0` giữ nguyên. Không đổi luật chơi, sát thương, vùng hay thời gian của đòn. `?vecode=1` vẫn vẽ code như cũ.

## 1. Cắt ảnh

Dùng công cụ `../con-ve-tay-6/cong-cu/dung-dot6.py` (đã thêm phần đợt 7). 15 tệp không gen lại cho ra **giống hệt từng byte** bản cũ.

| Ảnh | Cách cắt | Kết quả |
|---|---|---|
| `gd-cot-nang-rung` | Khử `nang`, nay tách 3 dải theo kênh lam. Chỉ lấy điểm có kênh đỏ > 150, nên không còn viền xanh lục | 27×98, màu `#fff4b0`, alpha 30 / 20 / 10 %. Dải sáng rộng khoảng 16 (trước 8–10). Giữa dải đi từ x 6,2 (đỉnh) tới 19,5 (đáy), trước là 4,8 → 43,8 |
| `hu-hat-no` | Vẫn chỉ 5 khung trên lưới 6 ô, đã bỏ ô cuối trống | 5 khung. `giay` 0,4 → **0,33** để mỗi khung giữ nhịp như prompt 6 khung |
| `hu-khoi-tron` | Đủ 6 khung | 6 khung, 0,5 giây |
| `hu-vong-song` | **Xoá vạch đen chia ô.** Cột nào có hơn 100 điểm tối thì tô thành màu nền, rộng ±5 điểm ảnh (cả viền trộn). Sau đó tô nốt mọi điểm tối còn sót | 5 khung vòng dẹt, 66×30. Kiểm lại: sprite có **0 điểm tối** và 0 điểm xanh lục. Ghi thêm `det` = 0,398 (tỉ lệ cao / rộng của vòng) |
| `gd-dau-phong-4-loai` | Cắt thành 4 ô đều, giữ màu gốc. Khử `vong` = cách khử `phong` cộng thêm alpha theo khoảng cách tới màu nền, để mép vòng ngọc không bị thủng | `gd-dau-phong-tinh-anh` (cam, rộng 64), `-thu-thach` (ngọc, 72), `-nguyen` (tím, 52), `-trum` (đỏ, 120). Bề rộng = 2 × bán kính vòng cũ + 4 |

Bản xem từng ảnh (nền tím): `xem/`. Số đo: `../con-ve-tay-6/cong-cu/ra6/so-do.json`.

## 2. Đổi trong game

- **Dấu phòng** (`room_art.js` `dauPhongAnh`):
  - Mỗi loại phòng dùng ảnh riêng, màu gốc, đậm 50 % (trùm 45 %).
  - Ảnh là vòng tròn, game kéo dẹt 0,82 như `ringMark` cũ. Lời nguyền vẫn lệch lên 4 như cũ.
  - Bỏ cách dùng tạm ảnh phòng Bắt đầu nhuộm màu (`nhuomXam`).
  - Phòng Bắt đầu giữ `gd-dau-phong` cũ.
- **Cột nắng** (`room_art.js` `cotNangAnh`): đỉnh dải sáng đặt theo số đo mới (6,2).
- **Vòng sóng** (`fx.js` `vongAnh`, `fx_anh.js`): ảnh đã dẹt sẵn, nên game kéo dọc theo (ry / r) / `det`. Kết quả vòng ra đúng tỉ lệ vòng cũ.
- **Sửa lỗi có từ vẽ tay 6** (`build.py` `HU_KEYS`): lúc đóng gói, `build.py` lọc mất `ban_kinh`, nên game chưa bao giờ dùng bán kính từng khung. Nay giữ lại cả `ban_kinh` và `det`. Nhờ vậy vòng sóng to đúng bằng vòng cũ ở mọi khung.

## 3. Ảnh soát (`anh-soat/`)

Mỗi tệp `truoc-sau-*.png` có hai hàng: trên là bản vẽ tay 6, dưới là bản mới.

| Cảnh | Thấy gì |
|---|---|
| `phong-bat-dau` | dấu phòng không đổi; cột nắng rộng hơn, đứng hơn |
| `phong-tinh-anh` / `-thu-thach` / `-loi-nguyen` / `-trum` | vòng rỗng màu riêng, dẹt như vòng cũ (trước: đĩa nhuộm hoặc không có) |
| `tu-luc` | búa Băng nện: vòng sóng dẹt đúng tỉ lệ, hạt nổ, khói bụi |
| `luot` | lướt, lộn, nổ: hạt nổ 5 khung, khói 6 khung, vòng sóng (trước: vòng tròn to quá cỡ) |

## 4. Rủi ro / còn lại

- Vòng sóng gen dẹt (tỉ lệ khoảng 0,4), game kéo lên khoảng 0,85. Vì vậy nét trên / dưới dày gấp đôi nét hai bên. Nếu thấy thô, có thể gen vòng dẹt theo đúng 0,85.
- Sửa `ban_kinh` làm vòng sóng ở các khung đầu nhỏ hơn bản vẽ tay 6, nhưng đúng bán kính vòng code cũ.
- Mục "còn thiếu ảnh" của vẽ tay 6 vẫn giữ nguyên.

## 5. Quay lui

- Thêm `?vecode=1` vào địa chỉ để vẽ code như cũ.
- Hoặc `git revert` commit này.

## 6. Tệp đổi

- `game/art/custom/`: 4 tệp sửa (`gd-cot-nang-rung`, `hu-hat-no`, `hu-khoi-tron`, `hu-vong-song`), 4 tệp mới (`gd-dau-phong-*`).
- `game/js/room_art.js`, `fx.js`, `fx_anh.js`.
- `game/build.py`.
- `game/dist/*`, `tools/xuong-sprite/index.html`: đóng gói lại.
- `../con-ve-tay-6/cong-cu/dung-dot6.py` và `ra6/`.
- Thư mục này: báo cáo, `cong-cu/soat7.py`, `anh-soat/`, `xem/`.
