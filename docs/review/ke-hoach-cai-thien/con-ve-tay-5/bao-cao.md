# Còn vẽ tay 5: bỏ hẳn hình vẽ code trong trận

Ngày 16/10/2026, nhánh `khoi-tao-du-an`.

**Chưa chơi thử.** Phiên này chỉ chạy headless để chụp ảnh soát tĩnh và kiểm lỗi JS:

- `node --check` mọi `game/js/*.js`: đạt.
- `python3 game/build.py` và `--hai-tep`: đạt.
- `tests/smoke.py`: `errors: []`.
- Mọi lượt chụp: 0 pageerror.

Không đụng `cloud.js`, `cloud_ui.js`, `firebase-config.js`, `bo_nho.js`, nên đăng nhập Google, lưu mây và `?cloud=0` giữ nguyên. Không chép apiKey.

Không đổi sát thương, tầm, thời gian, vùng va chạm. Phiên này chỉ đổi phần vẽ.

## 0. Cách làm: chặn ở một chỗ, không sửa từng hàm

Các phiên trước sửa từng hàm và cố ý giữ các hình "nhỏ". Lần này rà ra **89 hàm vẽ code** còn chạy trên canvas trận (mục 2), rải trong `fx.js`, `fx_he.js`, `fx_dan.js`, `fx_ky_nang.js`, `bo_skill.js`, `monster_art.js`, `mobs.js`, `room_art.js`, `env_art.js`, `zed_moi.js`, `song_luat.js`. Sửa từng chỗ thì sẽ lại sót. Cách làm lần này:

- **`G.drawWorld` (`js/combat.js`) bật CHẶN trên bút canvas trận** (`G.wx`, và lớp phụ hiệu ứng `LOPB` của `fx.js`).
  - Mọi lệnh tô hình bằng code (`fillRect`, `strokeRect`, `fill`, `stroke`) thành không vẽ gì. Các vòng chấm, ô vuông, vệt, hạt, bóng, quầng vẽ bằng code đều đi qua bốn lệnh này.
  - Ảnh (`drawImage`) và chữ vẫn vẽ.
  - Mã nằm ở `js/fx_anh.js`: `G.ganChan`, `G.moVe`, `G.dangChan`.
- **Vỏ phòng** (`js/room_art.js` `buildShell` / `buildRoom`): các phần vẽ code thuần được vẽ vào một bút giả 1×1 (`boCode`), nên không hiện ra:
  - dấu loại phòng trên sàn;
  - đồ trang trí code và bóng dưới chân;
  - quầng sáng, cột nắng, bóng đổ (`lightPass`);
  - trang trí tường sau, điểm nhấn góc;
  - xích / đầu lâu code;
  - nền lối đi và ánh sáng tràn dưới ảnh cửa.

  Sàn, tường, ảnh cửa, ảnh đồ trang trí vẫn vẽ như cũ.
- **Mở chặn (`G.moVe`) chỉ cho thứ ảnh hưởng chơi.** Xem mục 3.
- **Cờ `?vecode=1`** (hoặc `G.VE_CODE = true`): không chặn gì, mọi thứ vẽ như trước phiên này, để so.
- **Lớp giao diện (`G.ux`) không bị chặn.** Lớp này gồm số sát thương, thanh máu quái / trùm, viền đỏ khi trúng đòn hoặc máu thấp, chớp màn hình, và HUD.

## 1. Bốn hình trong ảnh chụp của chủ game (Rừng già 5, Zed kiếm Mầm hệ Độc)

| | Hình | Vẽ ra từ | Nay |
|---|---|---|---|
| (a) | Vòng tròn chấm xanh nhạt lớn quanh Zed | `fx_he.js` `FINISH.poison` → `addRing(x, y, 4, o.r, 0.34, '#c2f58a', 1, 0)`: "vòng tầm toé" của nhát kết hệ Độc. Phiên trước cố ý giữ ("vòng tầm toé giữ (mảnh)"). Vẽ ở `fx.js` `drawFx` → `ring()` | **đã tắt**. Ảnh `hu-doc-toe` (bãi nhớt toé) vẫn hiện |
| (b) | Vòng đôi có 4 vạch trên sàn giữa phòng | `room_art.js` `mark()` của phòng **Bắt đầu**: `ringMark` ×2 + 4 ô vuông, vẽ chết vào nền phòng. Phòng tinh anh / thử thách / lời nguyền / trùm cũng có vòng riêng | **đã tắt** (`boCode`) |
| (c) | Vệt / ô chữ nhật xanh lục quanh nhát chém | `fx_he.js` `drawDrips`: giọt độc dọc vệt chém của vũ khí hệ Độc. Cùng họ với lưỡi lửa `tongue` và răng cưa băng `drawIce`. Thêm hạt `drawParts` (`fx.js`), vòng sóng `addRing` | **đã tắt**. Ảnh vệt chém `hu-chem-kiem` / `hu-quet-giao-*` và ảnh bám `hu-bam-doc` vẫn hiện |
| (d) | Chấm vàng sau con bọ | `mobs.js` `shieldArc`: mặt khiên của quái giáp (vai `shield`), 9 ô 2×2 vàng | **đã nối ảnh**. Chỉ khi đang chặn: ảnh có sẵn `gd-quai-giap` (10×10) đặt ở mặt khiên, vẫn biết phải vòng ra sau |
| (e) | Khác trong cùng cảnh | xem mục 2 | — |

Các hình khác trong cùng cảnh:

- **Bóng tròn dưới chân Zed và quái:** `zed_moi.js` `veLop` (`G.art.ellipse`), `monster_art.js` `MA.draw` (`F.elip`).
- **Viền sáng + bóng mờ quanh Zed:** `fx.js` `vienBe`.
- **Đom đóm, bụi bay, lá rơi, khóm cỏ lay, quầng nấm sáng:** `room_art.js` `ambLive`.
- **Cột nắng chéo sàn:** `room_art.js` `shaft` / `lightPass`.
- **Vạch đỏ cửa khoá:** `room_art.js` `cuaAnh` (lệnh `DO`).

Tất cả nay đã tắt. Riêng ổ khoá là ảnh `gd-cua-o-khoa` nên vẫn hiện.

Ảnh soát:

- `truoc-sau-canh-chu-nhan.png`: 12 khung liên tiếp của chuỗi chém. Hàng trên là `?vecode=1`, hàng dưới là bản mới.
- `canh-chu-nhan-truoc.png` / `canh-chu-nhan-sau.png`: cả màn hình.

## 2. Rà toàn bộ hình vẽ code trong trận

Công cụ: `cong-cu/kiemke.py`. Bản game một tệp chạy headless và bot tự đánh qua các cảnh sau:

- 4 vùng (Rừng già, Hang biển, Lâu đài cổ, Sông sâu);
- 4 bộ vũ khí / hệ: kiếm Độc, thương Lửa, búa Băng, kiếm không hệ, cùng phi tiêu;
- phòng đủ 8 vai quái + tinh anh;
- trùm nhỏ và trùm vùng mỗi vùng.

Bản chạy chưa có lượt trùm vùng Sông sâu, vì lượt đó chạy headless quá chậm. Kiểm kê chỉ đếm lệnh tô hình trên canvas trận, nên nền phòng dựng sẵn không có trong số đếm.

Kết quả gom theo hàm:

- Trước: `cong-cu/kiem-ke-truoc.txt` (89 hàm).
- Sau: `cong-cu/kiem-ke-sau.txt`. Các dòng còn lại ở đó là thân quái Sông sâu vẽ code, đo trước khi sửa lần cuối (xem dòng "thân quái chưa có ảnh" ở mục 3).

Gom theo nhóm:

| Nhóm | Hàm / tệp (chỗ vẽ chính) | Có ảnh khớp? | Nay |
|---|---|---|---|
| Vòng sóng, vòng tầm (đòn hệ, nện búa, nhát kết, đổi vũ khí) | `fx.js` `drawFx` → `ring` / `addRing`; `fx_he.js` `FINISH.*` | không (ảnh chính `hu-doc-toe`, `hu-song-dat`... đã vẽ riêng) | đã tắt |
| Sao chớp, tia (`star`) | `fx.js` `drawFx` | không | đã tắt |
| Hạt nổ / bụi / tia lửa / giọt / lấp lánh (burst, emit, `drawParts` loại 0–11) | `fx.js` `drawParts` | không | đã tắt |
| Vệt kéo theo (dash, lộn, vung) | `fx.js` `quad` / `trailDraw` | không | đã tắt |
| Vệt tay vũ khí hệ: giọt độc, lưỡi lửa, răng cưa băng | `fx_he.js` `drawDrips`, `fx.js` `tongue`, `fx_he.js` `drawIce` | không | đã tắt |
| Vòng tụ lực, vạch lấy đà | `fx_he.js` `drawCharge`, `drawThrob` | không | đã tắt |
| Vòng phép code (khi chưa có `hu-vong-phep`), khói tròn, mây hơi | `fx_ky_nang.js` `drawRune`, `fx.js` `puffs` | `hu-vong-phep` đã dùng sẵn | đã tắt phần code |
| Hình trạng thái trên thân bằng code; chữ số tầng độc / băng | `fx.js` `fx.entity`, `digit` | `hu-bam-*` đã dùng sẵn | đã tắt phần code |
| Khiên nước, khí thế, dây leo, chấm chậm (bộ đồ) | `bo_skill.js` `veKhien`, `veKhiThe`, `veSan` | `hu-khien-nuoc`, `hu-khi-the`, `hu-day-leo` đã dùng sẵn | đã tắt phần code |
| Quầng + vệt bay quanh đạn, bóng đạn | `fx_dan.js` `fx.proj` (`glow`, `trail`), `fx_he.js` `fx.proj`, `fx_dan.js` `A.proj` (bóng, chấm đỏ đầu đạn) | không | đã tắt. Thân đạn ảnh `hu-dan-*` giữ |
| Hiệu ứng code quanh quái / trùm (vệt, hạt, lửa, khói, lá rơi, gai rễ, sóng) | `monster_art.js` `F.set`, `F.hat`, `F.lua`, `F.khoi`, `F.song`, `laRoi`, `gaiRe`, `P.under` / `P.over` | ảnh chiêu trùm đã dùng sẵn | đã tắt phần code |
| Bóng tròn dưới chân | `monster_art.js` `MA.draw` (`F.elip`), `zed_moi.js` `veLop`, `env_art.js` `shadow`, `fx_he.js` `drawSpear` | **không** | đã tắt (cần gen, #1) |
| Mặt khiên quái giáp | `mobs.js` `shieldArc` | `gd-quai-giap` | **đã nối ảnh** |
| Viền sáng + bóng mờ Zed | `fx.js` `vienBe` | không cần | đã tắt |
| Ô trạng thái trên đầu Zed (khi tắt fx) | `combat.js` | — | đã tắt |
| Đom đóm, bụi, lá, cỏ lay, vũng gợn, giọt nhũ, cột sáng động | `room_art.js` `ambLive` | không | đã tắt (cần gen, #7) |
| Lửa đuốc / nến code, quầng nến, lấp lánh, đom đóm đèn | `room_art.js` `live` | `hu-lua-duoc` đã dùng sẵn | đã tắt phần code |
| Mũi tên nhún ở cửa đang mở | `room_art.js` `live` → `arrow0` | không | đã tắt (cần gen, #8) |
| Vạch đỏ ngưỡng cửa khoá, xích vàng, đầu lâu code | `room_art.js` `cuaAnh` / `emblem` / `chain` | `gd-cua-*-khoa`, `gd-cua-o-khoa`, `gd-cua-dau-lau` đã dùng sẵn | đã tắt phần code |
| Dấu loại phòng trên sàn (Bắt đầu, tinh anh, thử thách, lời nguyền, trùm) | `room_art.js` `mark` / `ringMark` | không | đã tắt (cần gen, #6) |
| Quầng sáng, cột nắng, bóng đổ, quầng đuốc | `room_art.js` `lightPass`, `shaft`, `glow` | không | đã tắt |
| Đồ trang trí vẽ code khi thiếu ảnh, bóng dưới đồ trang trí, trang trí tường sau, điểm nhấn góc | `room_art.js` `decor`, `backDeco`, `accentPlan` | `gd-tt-*` đã dùng sẵn | đã tắt phần code. Ảnh giữ |
| Cụm tiền cảnh code (khi thiếu ảnh) | `room_art.js` `fgBuild` / `roomFore` | `gd-tt-*-tien-canh-*` | đã tắt phần code |
| Quầng mời gọi, lò lửa, nấm sáng code của vật trong phòng | `env_art.js` `halo`, `brazier`, `mushroom`, `spark` | ảnh `gd-vat-*` đã dùng sẵn | đã tắt phần code |
| Bóng quái lúc đi ngầm, chỗ quái sắp mọc (vệt tối) | `mobs.js` `drawUnder`, `room_art.js` `live` | `hu-quai-hien` đã dùng sẵn | đã tắt phần code |
| Dấu "!" sắp ra đòn (khi thiếu ảnh) | `mobs.js` | `gd-quai-sap-danh` đã dùng sẵn | ảnh giữ, code tắt |

"Đã dùng sẵn" nghĩa là ảnh đó đã được nối ở các phiên trước. Phần code còn lại (dự phòng khi ảnh chưa tải, hoặc vẽ thêm quanh ảnh) nay không hiện.

## 3. Giữ vẽ code vì ảnh hưởng chơi

Mỗi chỗ ở bảng dưới được mở chặn bằng `G.moVe`. Các chỗ đánh dấu * cần gen ảnh, xem mục 4.

| Chỗ | Tệp | Lý do |
|---|---|---|
| Vùng báo nguy hiểm đỏ (`bao_truoc.js` `dat` / `draw`) | `combat.js` | tín hiệu né |
| Vòng đỏ chỗ quái sắp mọc (khi tắt bao_truoc) | `room_art.js` | tín hiệu né |
| Vùng / vũng / sóng gây hại của quái (`F.zone`, `A.zone`, `z.wave`) khi chưa có ảnh | `combat.js` | tín hiệu né* |
| Nước dâng trận Ngư Tinh (phần sàn không đứng được) | `room_art.js` | địa hình* |
| Địa hình Sông sâu: dòng chảy, cầu tre, vũng nước sâu, vũng lục bình / dầu cháy | `room_art.js` → `song_luat.js` `lopSan` | địa hình* |
| Lục bình, đèn dầu (vật bấm được Sông sâu) | `song_luat.js` | vật bấm được* |
| Số sát thương, thanh máu, viền đỏ màn hình | lớp giao diện, không bị chặn | — |
| Thân quái chưa có ảnh (4 quái Sông sâu: `raiCa`, `diaTrau`, `cocTia`, `baBa`...). Thân dán bằng `drawImage` từ khung dựng sẵn nên vẫn hiện. Bóng / hiệu ứng code quanh thân thì tắt | `sprite_custom.js` | quái vô hình thì không chơi được* |
| Thân đạn quái chưa có ảnh: sprite code dán bằng `drawImage` | `fx_dan.js` | đạn phải thấy* |

Không giữ, có thể bàn lại:

- Chấm đỏ nhấp nháy trên đầu đạn quái: tắt, vì ảnh đạn đã đủ rõ.
- Chữ số tầng độc / băng nhỏ trên thân: tắt.

Nếu thấy thiếu khi chơi, có thể mở lại từng cái bằng `G.moVe` ở đúng chỗ.

## 4. Prompt gen ảnh còn thiếu

Quy cách chung, giống bộ `hu-*` hiện có:

- pixel art, một hàng N khung xếp ngang, các khung cách xa nhau, nền trơn `#00FF00`;
- vẽ gấp đôi (net 2);
- không bóng đổ, không chữ;
- vật trắng thì game tự nhuộm.

Mẫu kèm khi gen: `hu-va-cham`, `hu-doc-toe`.

### Đã tắt, gen để có lại hình

1. **`hu-bong-chan`**: bóng dưới chân Zed, quái, trùm, vật. Đứng yên, game co theo cỡ thân.
```
Pixel art, 1 frame, flat #00FF00 background, top-down: a soft flat oval ground shadow, dark #14182e at 45% opacity in the middle fading to 15% at the edge in 3 hard pixel steps, 32x10 px, no outline, no text.
```

2. **`hu-vong-song`**: vòng sóng lan trên sàn (đòn hệ, nện búa, nhát kết). Trắng để game nhuộm.
```
Pixel art, 1 row of 5 frames, flat #00FF00 background, top-down: a thin white shockwave ring (#ffffff, #c8d0dc) expanding from small to large and fading, flat on the floor, 64x32 px per frame, no outline, no text.
```

3. **`hu-giot-he-<fire|poison|ice>`**: vệt tay vũ khí hệ dọc nhát chém (giọt độc / lưỡi lửa / mảnh băng).
```
Pixel art, 1 row of 5 frames, flat #00FF00 background, facing right: a short trail of toxic green drips (#b6e85a, #5f9a26, purple tint #7a4fb0) falling off a sword swing arc and fading, 40x24 px per frame, dark outline #14182e, no text.
```
```
Pixel art, 1 row of 5 frames, flat #00FF00 background, facing right: small tongues of fire (#ffd23f, #ff7a2a, #c8372d) licking along a sword swing arc and fading, 40x24 px per frame, dark outline #14182e, no text.
```
```
Pixel art, 1 row of 5 frames, flat #00FF00 background, facing right: jagged ice shards (#e9f9ff, #7fd4ff) trailing a sword swing arc and shattering away, 40x24 px per frame, dark outline #14182e, no text.
```

4. **`hu-hat-no`**: hạt nổ / tia lửa chung (thay `burst` / `drawParts`). Trắng để nhuộm.
```
Pixel art, 1 row of 6 frames, flat #00FF00 background: a small burst of white square sparks (#ffffff, #c8d0dc) flying outward and shrinking to nothing, 24x24 px per frame, no outline, no text.
```

5. **`hu-quang-dan`**: quầng + vệt bay sau đạn và phi tiêu. Trắng để nhuộm, game xoay theo hướng bay.
```
Pixel art, 1 row of 4 looping frames, flat #00FF00 background, facing right: a soft white glow trail behind a projectile, 3 stepped alpha bands (#ffffff), tapering to the left, 24x8 px per frame, no outline, no text.
```

6. **`gd-dau-phong-<bat-dau|tinh-anh|thu-thach|nguyen|trum>`**: dấu loại phòng trên sàn (thay vòng đôi 4 vạch).
```
Pixel art, 1 frame, flat #00FF00 background, top-down: a faint carved stone floor sigil, double ring with 4 small notches, mossy green glow (#8fe06a, #e0ffc8) at low opacity, flat ellipse 48x40 px, no text.
```

7. **`hu-moi-truong-<rung|bien|lau|song>`**: đom đóm / bụi bay / lá rơi lặp (thay `ambLive`).
```
Pixel art, 1 row of 8 looping frames, flat #00FF00 background: two tiny glowing fireflies (#f4ffb0 core, #d2ff78 glow) drifting and blinking slowly, 24x24 px per frame, no outline, no text.
```
```
Pixel art, 1 row of 8 frames, flat #00FF00 background: a single small green leaf (#6fa83a, #3f6a22) falling and swaying, then lying on the floor and fading, 16x32 px per frame, dark outline #14182e, no text.
```

8. **`gd-mui-ten-cua`**: mũi tên nhún chỉ cửa đã mở.
```
Pixel art, 1 row of 2 frames, flat #00FF00 background: a small bright pale-yellow chevron arrow (#f4ffb0, #ffe08a) pointing up, bobbing 1 px, 9x7 px per frame, dark outline #14182e, no text.
```

### Đang giữ vẽ code (ảnh hưởng chơi), gen để thay

9. **`hu-nuoc-dang`**: nước dâng phủ sàn (trận Ngư Tinh), lát lặp được.
```
Pixel art, 1 row of 4 looping frames, flat #00FF00 background, top-down: a seamless tile of murky deep blue water (#3282b9 at 60%, foam lines #dcf5ff) with a foamy edge on top, 48x24 px per frame, no text.
```

10. **`gd-song-<dong|cau|vung-sau>`**: địa hình Sông sâu.
```
Pixel art, 1 row of 4 looping frames, flat #00FF00 background, top-down: a seamless vertical tile of a dark green river current with small white chevrons flowing down, 32x32 px per frame, no text.
```
```
Pixel art, 1 frame, flat #00FF00 background, top-down: a short bamboo plank bridge with rope rails on both edges (#a08a5a, #54482a), 48x32 px, dark outline #14182e, no text.
```

11. **`gd-vat-luc-binh`, `gd-vat-den-dau`**: hai vật bấm được của Sông sâu.
```
Pixel art, 1 row of 4 frames, flat #00FF00 background, 3/4 view: a floating water hyacinth clump with a purple flower (#3e8a3a, #7a3ab0, #d8a8ff), gently bobbing, 24x28 px per frame, dark outline #14182e, no text.
```
```
Pixel art, 1 row of 4 frames, flat #00FF00 background, 3/4 view: a bamboo pole with a hanging oil lantern glowing orange (#c88a3a, #ff9a30, #ffe890), lantern swaying, 20x36 px per frame, dark outline #14182e, no text.
```

12. **Bốn quái Sông sâu** (`raiCa`, `diaTrau`, `cocTia`, `baBa`): bộ quái cùng quy cách sprite quái hiện có. Đây là việc lớn, theo phiên quái mới, không gen theo prompt ngắn.

## 5. Ảnh soát (thư mục này)

- `truoc-sau-canh-chu-nhan.png`, `canh-chu-nhan-truoc.png`, `canh-chu-nhan-sau.png`: cảnh như ảnh chụp.
- `truoc-sau-*.png`: trên là cũ, dưới là mới, mỗi ảnh 6 khung:

| Ảnh | Cảnh |
|---|---|
| `truoc-sau-phong-0.png` | phòng quái Rừng già |
| `truoc-sau-phong-2.png` | phòng quái Lâu đài |
| `truoc-sau-phong-3.png` | phòng Sông sâu: địa hình và lục bình còn, thuyền / chum / lau sậy code mất |
| `truoc-sau-trum-0.png` | Mộc Tinh |
| `truoc-sau-trumnho-1.png` | Cua Đá |

Trong mọi ảnh mới, vùng báo đỏ, số sát thương và thanh máu còn đủ.

## 6. Rủi ro (vì chưa chơi thử)

- **Trận "trơn" hơn hẳn.** Không còn bóng dưới chân, hạt, vòng sóng, vệt tay, đom đóm, quầng sáng. Nhân vật có thể trông như "trôi" trên sàn cho tới khi có `hu-bong-chan` (#1).
- **Phản hồi đòn đánh nhẹ hơn.** Phần hình còn lại là ảnh `hu-*` (vệt chém, va chạm, nổ, bám thân).
- **Chặn theo lệnh tô hình, nên nếu có chỗ nào đang tô hình bằng code cho thứ ảnh hưởng chơi mà mục 3 chưa mở, nó sẽ mất.** Bảng rà mục 2 không thấy chỗ nào như vậy, nhưng chưa chơi thử. Gặp thì bọc lệnh vẽ của chỗ đó bằng `G.moVe(() => …)`.
- **Ảnh tải sau (bản hai tệp):** vài giây đầu, chỗ nào chưa có ảnh thì trống.
- Hiệu năng: chặn chỉ là một phép so mỗi lệnh. Nhiều hàm vẫn chạy (rồi bị bỏ), nên không nhanh hơn, cũng không chậm hơn đáng kể.

## 7. Quay lui

- Thêm `?vecode=1` vào địa chỉ trang để vẽ y như trước phiên này.
- Hoặc `git revert` commit của phiên.

## 8. Tệp đổi

- `game/js/fx_anh.js`: `G.VE_CODE` (`?vecode=1`), `G.ganChan`, `G.moVe`, `G.dangChan`.
- `game/js/combat.js`: `G.drawWorld` bọc chặn. Vùng gây hại của quái, bao_truoc được mở. Tắt quầng đạn `fx.proj`.
- `game/js/room_art.js`:
  - `boCode` cho dấu phòng, trang trí code, `lightPass`, `backDeco`, điểm nhấn, `emblem`, `cuaAnh`;
  - mở chặn cho nước dâng, vòng đỏ quái mọc, `lopSan`;
  - tắt cụm tiền cảnh code.
- `game/js/fx.js`: lớp phụ `LOPB` chịu chặn. `vienBe` tắt khi chặn.
- `game/js/mobs.js`: `shieldArc` dùng ảnh `gd-quai-giap` khi chặn.
- `game/js/sprite_custom.js`: chỉ thêm ghi chú về thân quái chưa có ảnh.
- `game/js/song_luat.js`: lục bình / đèn dầu mở chặn.
- `game/dist/*`, `tools/xuong-sprite/index.html`: đóng gói lại.
- `docs/review/ke-hoach-cai-thien/con-ve-tay-5/`: báo cáo, ảnh soát, `cong-cu/`.
  - Các script trong `cong-cu/` ghi đường dẫn tạm của phiên chạy. Muốn chạy lại thì sửa đường dẫn ở đầu tệp.
