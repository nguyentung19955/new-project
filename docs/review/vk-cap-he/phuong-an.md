# Phương án: ngoại hình vũ khí theo cấp Hệ (Lửa / Băng / Độc)

Tài liệu kỹ thuật cho bản mẫu. Game **chưa đổi** — bản đang chạy giữ nguyên tới khi mẫu được duyệt.

## B2. Hiện trạng trong code

### Cấp Hệ xác định thế nào
- Game có 3 hệ: `fire` (Lửa), `poison` (Độc), `ice` (Băng). Không thêm hệ mới.
- `G.wStage(w)` (game/js/combat.js, dòng 14): lấy điểm hệ `w.marks[w.branch]`, so với `G.MARKS = [30, 120, 300]` (game/js/data.js) → giai đoạn 0–3, giới hạn bởi `G.RARITY[bậc].maxStage` (bậc Thường tối đa giai đoạn 2; Lam/Tím/Vàng tối đa 3).
- Tên giai đoạn: `STAGES = ['Trắng', 'Mầm', 'Thành hình', 'Thức tỉnh']` (game/js/weapon_art.js). **Cấp 1/2/3 của đặc tả = giai đoạn 1/2/3** (Nhiễm = Mầm, Cường hoá = Thành hình, Thức tỉnh = Thức tỉnh).
- `G.weaponArt.fromWeapon(w)` đổi món đồ thành `opts = { type, family, branch, stage, rarity }` (branch = null khi stage 0). Bùa/Nung (`w.coat`) chưa có nhánh thì hiện như giai đoạn 1 (hero_tinhlinh.js `drawWeapon`).

### Vũ khí được vẽ ở đâu
| Chỗ | Tệp | Ghi chú |
|---|---|---|
| Em bé cầm vũ khí (đứng, chạy, đánh) | hero_tinhlinh.js `drawWeapon` → `G.weaponArt.draw` | điểm cầm, góc, ép bẹt khi quét vòng |
| Ảnh AI thay bản code | sprite_custom.js `noiVuKhi` bọc `WA.draw`/`WA.icon` → `SC.veVuKhi` / `SC.iconVuKhi` | `SC.timVuKhi(opts)` chọn ảnh `vk-<loại>-<dòng>[-<hệ>[-<gđ>]]` |
| Xoay + nhớ đệm | sprite_custom.js `xoayVk` | nhớ theo góc (bước 5°), bậc, hệ+gđ; không tạo canvas mỗi khung |
| Biến đổi theo hệ hiện tại | sprite_custom.js `heCua`, `hinhVk`, `pxHe` (nhuộm 45%/70% cả lưỡi), quầng sáng ở gđ 3, `hatHe` (hạt + lửa liếm) | đây là kiểu "phủ màu đều" cần thay |
| Vũ khí bay (chiêu hệ) | fx_he.js dòng 569 | cũng gọi `G.weaponArt.draw` |
| Làng (giá vũ khí) | village_scene.js dòng 694 | cũng gọi `G.weaponArt.draw` |
| Ô đồ | `SC.iconVuKhi` | hiện nhuộm khi gđ ≥ 2 |

Ảnh AI: `game/art/custom/vk-<loại>-<dòng>.sprite.json`, `net: 2` (ảnh có số điểm ảnh gấp đôi điểm ảnh game), `vu_khi.cam` (điểm cầm), `vu_khi.mui` (mũi), `vu_khi.day` (hai đầu dây cung, game tự vẽ dây).

### Tệp sẽ sửa khi triển khai (phiên sau, sau khi duyệt)
- **Chỉ `game/js/sprite_custom.js`**: chép khối `tools/vk-cap-he/cap_he.js` vào; trong `SC.veVuKhi` khi `heCua()` có hệ và ảnh không phải biến thể riêng → vẽ bằng sprite dẫn xuất + hạt mới (thay `pxHe` + quầng sáng + `hatHe`). `SC.iconVuKhi` dùng sprite dẫn xuất khung 0, không hạt.
- Không đụng: sát thương, tốc độ, hitbox, tầm (combat.js/moves.js), bản lưu, điểm cầm/mũi/dây, hệ ghép trang bị (neo, tay), weapon_art.js (bản code giữ nguyên làm dự phòng).
- `python3 game/build.py` để gói lại.

## Phương án kỹ thuật (đã làm trong mẫu)

### 1. Tự tìm vùng trên ảnh (một lần mỗi ảnh — `doThan`)
- Trục thân: từ điểm cầm `cam` tới `mui`. Mỗi điểm ảnh thật có toạ độ **dọc trục** (0 = tay cầm, 1 = mũi) và **ngang trục**.
- Cung dựng đứng: cắt lát theo thân cung (vuông góc với hướng bắn), khoảng cách tính từ tay cầm ra hai đầu cung. Dây cung do game vẽ riêng → **không bao giờ mất**.
- Vùng nhận màu hệ = đoạn dọc trục theo loại (bảng `LOAI`): kiếm từ 0,34 (sau chắn tay), giáo từ 0,66 (mũi) + vân dọc cán, búa từ 0,55 (đầu búa), cung từ 0,22 (bỏ chỗ cầm).
- Cắt lát theo trục, mỗi lát 1 điểm ảnh thật: tìm mép trên, mép dưới, **rãnh giữa**. Từ đó có: dải mép, rãnh, đầu mũi, điểm mép để đặt họa tiết và hạt.
- **Giữ nguyên**: điểm ảnh tối (độ sáng < 0,2: viền, mắt, khắc), viền ngoài `#1b1118` (để viền bậc Lam/Tím/Vàng vẫn hiện), cán, chuôi, chắn tay.
- Độ sáng tương đối trong lưỡi (bỏ 10% hai đầu) → 3 tông phẳng của hệ (tối / cơ bản / nhấn): giữ khối sáng tối gốc, không chuyển màu mịn.

### 2. Lớp theo cấp (sprite dẫn xuất — `taoSprite`)
| Cấp | Lớp |
|---|---|
| 1 · Nhiễm | chấm màu hệ cách quãng trên rãnh giữa; đầu mũi đổi màu nhấn; 3 điểm sáng cố định trên mép; 2 hạt |
| 2 · Cường hoá | dải 2 điểm ảnh màu hệ dọc mép lưỡi; đầu mũi/mặt búa/đầu cung cả bề ngang; vân năng lượng liền trên rãnh với **lõi sáng** + chấm hai bên; 4 điểm sáng; 3 hạt |
| 3 · Thức tỉnh | dải 3 điểm ảnh; thân lưỡi ửng màu hệ 35% (vẫn thấy kim loại); vân dạng sóng; **họa tiết riêng**; 5 hạt; họa tiết động 2 khung |

Họa tiết cấp 3 (nhô ra lề 3 điểm ảnh game quanh ảnh, dính liền thân):
- **Lửa**: ngọn lửa pixel bám mép lưỡi, chân 3 điểm ảnh, cao 2–7, nghiêng về mũi, lõi vàng sáng, viền đỏ sẫm, 2 khung lay.
- **Băng**: mấu tinh thể nhọn nhô trên mép (mặt sáng/tối, viền xanh đậm) + sương giá chấm trắng cách quãng dọc mép.
- **Độc**: vân rễ tím toả từ rãnh ra hai mép + giọt nọc treo ở mép dưới (dài ngắn theo 2 khung) + bọt tím.

Không có quầng sáng loang (bản hiện tại có quầng 2 điểm ảnh quanh cả vũ khí) → không che hình, không che em bé.

### 3. Dữ liệu cấu hình (trong `cap_he.js`)
- `PAL[hệ]`: `toi, co (cơ bản), nhan (nhấn), loi (lõi sáng), vien, hat[]`; Độc thêm `phu, phuToi, phuSang` (tím). Đối chiếu `G.weaponArt.ELP`: toi = B[0], co = B[1], nhan = B[2], vien = ol, loi = hot.

| Hệ | tối | cơ bản | nhấn | lõi | viền |
|---|---|---|---|---|---|
| Lửa | #8a1c12 | #e8492a | #ffb347 | #fff0b0 | #4a1010 |
| Băng | #2f62ad | #7fc4f2 | #bfe9ff | #ffffff | #1c3a70 |
| Độc | #1d5a2a | #49a83c | #b5ea6a | #e6f58a | #12331a (+ tím #6b3a8f / #a56fd0) |

- `CAP[1..3]`: `bang` (bề rộng dải mép), `than` (độ ửng thân), `van` (chấm / liền / sóng), `diemSang`, `hoaTiet`, `hat`.
- `LOAI[loại]`: `t0` (vùng lưỡi bắt đầu), `vanT0/vanT1` (đoạn có vân), `canh` (mép đặt họa tiết), `muiT` (đầu mũi), `doc: 'ngang'` cho cung, `vanThan` cho giáo.

### 4. Hiệu năng, an toàn
- Sprite dẫn xuất tạo **một lần** cho mỗi (ảnh × hệ × cấp × khung 0/1), nhớ trên `sp._capSp`; sau đó đi qua `SC.xoayVk` sẵn có (nhớ theo góc). Mỗi khung chỉ vẽ 1 ảnh + 2–5 hạt 1 điểm ảnh.
- Điểm cầm/mũi/dây dời theo lề nên vị trí trong tay em bé **y hệt** bản gốc (xem hàng ④ trong ảnh mẫu).
- Ảnh hệ riêng (`vk-…-fire.sprite.json`) nếu sau này có: giữ ảnh đó, chỉ thêm hạt (như hiện nay).

## Chạy lại ảnh mẫu
```
NODE_PATH=$(npm root -g) node tools/vk-cap-he/tao_anh.js          # cả 3 hệ
NODE_PATH=$(npm root -g) node tools/vk-cap-he/tao_anh.js fire     # chỉ Lửa
```
Script mở `game/dist/linh-khi.html` bằng Chromium, nạp `cap_he.js`, vẽ bằng chính hàm của game và ghi `docs/review/vk-cap-he/mau-*.png`.
