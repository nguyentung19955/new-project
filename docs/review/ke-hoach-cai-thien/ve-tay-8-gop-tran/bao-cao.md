# Vẽ tay 8 gộp — phần trận (16/10)

Đã chờ đủ 2 báo cáo `con-ve-tay-9/bao-cao.md` và `ve-tay-8-dot-1/bao-cao.md` rồi mới sửa game, cắt theo cùng cách của `ve-tay-8-dot-1/cong-cu/dung-hud.py`.
**Không chơi thử**: chỉ dựng cảnh bằng lệnh rồi chụp ảnh headless.

Không đổi luật, số liệu, vùng trúng, thời gian. Không đụng đăng nhập Google / lưu mây / `?cloud=0`.

## Cờ

| Cờ | Tác dụng |
|---|---|
| `?gop8=0` | Mọi chỗ của phiên này về như bản trước |
| `?vecode=1` | Như cũ: vẽ code toàn bộ (cũng tắt phiên này) |

## Cắt

- Công cụ: `cong-cu/dung-gop.py --ghi`.
- Cách cắt giống `dung-hud.py`:
  - thu nhỏ nearest neighbor;
  - bỏ nền xanh;
  - đưa viền lem về màu sạch của chính ảnh.
- Vật màu lục (lá lục bình, cỏ, đèn dầu): giữ màu gốc, chỉ bỏ điểm gần nền và điểm lục chói.
- Ra 43 tệp `game/art/custom/*.sprite.json`, tổng ~450 KB.
- Ảnh xem tất cả: `anh-soat/anh-da-cat.png`.
- Ô lặp có ảnh lát 3×3 trong `cong-cu/ra/lat-*.png`: dòng chảy, mép, nước ngoài, ba tường, nước dâng, ruột thanh trùm.

| Ảnh gộp | Mã | Ghi chú cắt |
|---|---|---|
| g2 | `hu-luoi-lua`, `hu-lua-bung`, `hu-lang-tia-lo`, `hu-vung-dau-chay` | |
| g3 | `hu-gon-nuoc`, `hu-moi-truong-bien-giot`, `hu-nuoc-dang` (ô lặp), `hu-song-vung-sau` | |
| g4 | `hu-tia-gay`, `hu-vet-vung`, `hu-hat-bui`, `hu-suong-dai`, `hu-quang-den`, `hu-bia-hat` | Bụi: tách theo đốm, lấy 8 đốm sáng nhất. Quầng: alpha dựng lại từ độ sáng, màu trắng. Sương: hàng có hạt lẻ nên chia lưới đều 4 ô |
| g5 | `hu-vat-luc-binh`, `hu-vat-den-dau`, `hu-bom-song`, `hu-vung-luc-binh`, `hu-moi-truong-rung-co-lay`, `hu-moi-truong-rung-nam-sang` | |
| g6 (hàng 4–7) | `hu-song-dong`, `gd-song-cau`, `gd-nen-song-mep`, `gd-nen-song-ngoai` | Hàng 1–3 để phiên giao diện |
| g7 | `gd-ruot-thanh-trum` + `gd-trum-vach-ten`, `gd-vien-man-do`, `gd-bong-khung`, `gd-cot-nang-bien`, `gd-cot-nang-lau` | Viền đỏ: giải màu trộn với #00FF00. Bóng khung: dựng 9 mảnh từ góc dưới phải. Cột nắng: 3 bậc alpha 30 / 20 / 10 % |
| g8 | `gd-nen-song-tuong-sau` / `-truoc` / `-ben`, `gd-cua-song-tren` / `-ben` / `-duoi` (+ `-khoa`), `gd-tt-song-coc`, `-da-bun`, `-tien-canh-trai` / `-phai` | Xem ghi chú dưới |

Ghi chú về tên và cách cắt:

- **Đổi tên**: 4 mã kiểm kê ghi `gd-*` nhưng là dải nhiều khung, nên đặt tên `hu-*` (game chỉ nhận dải khung với tên `hu-`):
  - `gd-song-dong` → `hu-song-dong`
  - `gd-song-vung-sau` → `hu-song-vung-sau`
  - `gd-vat-luc-binh` → `hu-vat-luc-binh`
  - `gd-vat-den-dau` → `hu-vat-den-dau`
- **Tường bên**: ảnh gen chỉ có **một cột cọc**. Lấy đoạn thân cọc (18–78 % chiều cao), lặp dọc làm tường bên. Đường nối hơi lộ ở dây buộc.
- **Tường sau / tường trước**: cắt đúng đoạn lặp liền (tự tìm chỗ hai mép giống nhau nhất). Cỡ riêng cho Sông sâu: 165×49 và 48×12 điểm game. Chỗ trống sau hàng rào tô màu lau tối.
- **Cửa bên**: ảnh gen vẽ nhìn thẳng. Đã xoay 90° và kéo dọc cho vừa tường bên.

## Đã nối vào game

**Sông sâu**: thay hình tạm của phiên vung-4-2b.

| Thứ | Chỗ |
|---|---|
| Tường sau / bên / trước, nước ngoài phòng, mép sàn | `room_art.js` (dùng chuẩn tile, sàn vẫn vẽ code vì ảnh sàn `gd-nen-song-san*` chưa cắt; khi có thì tự dùng) |
| Cửa trên / bên / dưới (mở, khoá) | `cuaAnh` như ba vùng cũ |
| Cọc chân tường, đá bùn (chỗ chum), cọc buộc thuyền, tiền cảnh lau sậy | `backDeco`, `DECOR[3]`, tiền cảnh |
| Dòng chảy (ô lặp, cuộn đúng tốc dòng, xoay theo hướng), cầu tre | `song_luat.js` `veDai`, `veCau` |
| Vũng sâu, lục bình, đèn dầu, vũng độc, vệt dầu cháy | `song_luat.js` |
| Bom của quái Sông sâu (Ma Da...) | `mobs.js` `drawBomb` |

**Trận, các vùng**:

| Thứ | Chỗ |
|---|---|
| Lưỡi lửa (vùng cháy, đang cháy, chém Lửa) | `fx.js` `tongue` |
| Vệt vung vũ khí (nhuộm màu hệ) | `fx.js` `trailDraw` (trước bị chặn, không hiện) |
| Viền đỏ màn hình (máu thấp, trúng đòn, trùm nổi giận) | `fx.js` `vignette`, `noi_gian.js` |
| Lửa bùng Hồ Tinh / Hổ Lửa | `monster_art.js` `F.lua` (thay ảnh tạm `hu-bam-lua` của vẽ tay 9) |
| Tia gãy | `monster_art.js` `F.set` |
| Nước dâng trận Ngư Tinh | `room_art.js` (vùng không đổi) |
| Bụi / phấn, sương, khóm cỏ lay, gợn vũng nước, giọt nhũ đá, quầng đuốc | `room_art.js` `ambLive` (trước bị chặn, không hiện) |
| Cột sáng Hang biển, Lâu đài | `room_art.js` (lớp sống, như cột nắng Rừng) |
| Ruột thanh máu trùm, vạch đồng hai bên tên trùm | `ui_theme.js` |
| Bóng đổ bảng | `ui_theme.js` `T.panel` |

**Làng và màn chào**:

- Gợn nước sông / ao, quầng đèn lồng, quầng lò, tia lửa lò rèn, khói lò (`hu-khoi-tron` có sẵn): `village_scene.js`.
- Hạt sáng trên tranh bìa: `bia.js`.

## Kiểm

- `node --check` mọi `game/js/*.js`: đạt.
- `python3 game/build.py`: bản một tệp 29,35 / 30 MB.
- `python3 game/build.py --hai-tep`: **người chơi tải 16,63 / 20 MB** (trước 16,50; ảnh phiên này ~0,13 MB). Sau khi kéo commit của phiên khác về: 16,80 / 20 MB. Sông sâu tải riêng 0,27 MB.
- `tests/smoke.py`: `errors: []`.
- `song_luat.test.js`, `vung4.test.js`, `cloud_save_regression.test.js`: PASS.
- `tools/kiem-alpha.py`: ĐẠT.
- Mọi lượt chụp, cả `?vecode=1` và `?gop8=0`: 0 lỗi trang.

## Ảnh soát (`anh-soat/`)

`truoc-sau-*.jpg`: hàng trên là bản trước, hàng dưới là bản mới.

| Nhóm | Ảnh |
|---|---|
| Trận 4 vùng | `vung1`–`vung4`, `chem-lua` |
| Phòng Sông sâu | `song-phong-day` (dòng dọc + cầu), `song-phong-vat` (dòng ngang, lục bình, đèn dầu, vũng sâu), `song-vung` (vũng độc, dầu cháy) |
| Phòng trùm | `song-trum`, `ho-tinh-lua` (lửa), `moc-tinh-ra-mat`, `ngu-tinh-nuoc` (nước dâng) |
| Phòng các vùng | `rung-phong`, `hang-bien-phong`, `lau-phong` (cột sáng, sương) |
| Làng, bảng, màn chào | `lang-lo-ren`, `bang-lang`, `man-chao` |
| Kiểm cờ | `covecode-*`, `cogop8-*` (về vẽ code đúng như cũ) |

## Chưa nối / ảnh nên gen lại

1. **`hu-moi-truong-rung-nam-sang`**: ảnh vẽ cả cây nấm, trong khi phòng đã có ảnh nấm. Nếu nối thì nấm thành đôi, nên **chưa nối**. Gen lại:
   *"Pixel art, 1 row of 6 looping frames, flat #00FF00 background, top-down: ONLY a soft green glow ellipse on the ground (#b0f070, 8–15% opacity) breathing, plus one tiny spore dot rising, NO mushroom, 24x28 px per frame, no text."*
2. **`gd-nen-song-tuong-ben`**: chỉ có một cột cọc. Gen lại:
   *"Pixel art, flat #00FF00 background, 3/4 top-down: a LEFT side wall of a river camp, vertical stack of bamboo stakes tied with rope, seamless top-bottom, 28x128 px, dark outline #14182e, no text."*
3. **Cửa bên Sông sâu**: ảnh gen nhìn thẳng (đã xoay tạm). Gen lại:
   *"…a gate in the LEFT side wall seen from above, wall runs vertically, 30x74 px per frame, open | closed by vertical bamboo bars…"*
4. **`gd-cot-nang-bien` / `-lau`**: ảnh thấp, bè (28×39 thay vì 28×96), nên game phải kéo dọc. Gen lại, thêm câu *"tall thin beam, exactly 28x96 px"*.
5. **`hu-moi-truong-bien-giot`**: ảnh có vẽ cả chóp nhũ đá, đè lên nhũ đá của phòng. Gen lại chỉ giọt nước: *"…ONLY the water drop and splash, no stalactite…"*.
6. **`hu-song-dong`**: mỗi khung đặt mũi tên chỗ khác nhau, nên game chỉ dùng khung 1 và cho cuộn theo tốc dòng. Dùng được.
7. **`hu-tia-gay`**, **`hu-quang-den`**, **`hu-suong-dai`**: dùng được.

## Quay lui

- Thêm `?gop8=0` (hoặc `?vecode=1`) vào địa chỉ.
- Hoặc `git revert` 3 commit "Vẽ tay 8 gộp (trận)".

## Tệp

- `game/art/custom/`: 43 tệp mới.
- Code: `game/js/fx_anh.js`, `room_art.js`, `song_luat.js`, `fx.js`, `monster_art.js`, `noi_gian.js`, `mobs.js`, `ui_theme.js`, `village_scene.js`, `bia.js`.
- `game/dist/*`: đóng gói lại.
- Thư mục này:
  - `cong-cu/dung-gop.py` (cắt), `cong-cu/soat.py` (chụp trước / sau), `cong-cu/xem.py` (ảnh xem);
  - `cong-cu/ra/`;
  - `anh-soat/`.
