# Còn vẽ tay 9: nối 7 hàng "có sẵn hình", chặn hiệu ứng code của trùm, sửa phòng trùm Sông sâu chậm

Ngày 16/10/2026, nhánh `khoi-tao-du-an`. Đầu vào: `../con-ve-tay-8/KIEM-KE.md`.

**Chưa chơi thử.** Chỉ chạy headless (Playwright, bot tự đánh) để chụp ảnh soát và đo:

- `node --check` mọi `game/js/*.js`: đạt.
- `python3 game/build.py` và `--hai-tep`: đạt. Người chơi tải 16,41 / 20 MB (trước 16,37). Lõi vùng đầu 5,70 MB. Bản một tệp 28,67 / 30 MB. Không thêm ảnh mới, chỉ thêm mã.
- `game/tests/smoke.py`: `errors: []`. `thuong_luong.test.js`, `vung4.test.js`, `cloud_save_regression.test.js`: PASS.
- `so_yeu_quai.test.js` và `trum_song.test.js` báo SAI **giống hệt trên bản trước phiên này** (đã chạy lại trên bản gốc để so). Không phải do phiên này.
- Mọi lượt chụp: 0 lỗi trang.

Không đụng `cloud.js`, `cloud_ui.js`, `firebase-config.js`, `bo_nho.js`. Đăng nhập Google, lưu mây, `?cloud=0` giữ nguyên. Không chép apiKey. Không đổi luật chơi, sát thương, vùng, thời gian. Chỉ đổi phần vẽ.

## Cờ URL (bật lại bản cũ)

| Cờ | Tắt phần nào |
|---|---|
| `?noi9=0` | Mục 1: 7 hàng "có sẵn hình" quay về vẽ code |
| `?trum9=0` | Mục 2: hiệu ứng code của trùm / quái lại lọt qua chặn như trước, không vẽ ảnh thay |
| `?songnhanh=0` | Mục 3: nhuộm màu bằng `ctx.filter` kiểu cũ |
| `?vt9=0` | Tắt cả ba (y bản trước phiên này) |
| `?vecode=1` | Như cũ: vẽ code toàn bộ để so (cũng tắt mục 1 và 2) |

## 1. Nối 7 hàng "có sẵn hình"

| Hàng | Chỗ | Nay |
|---|---|---|
| 6 | Viền màu bậc ép đồ quanh ô vũ khí trong trận (`ep_do.js` `E.vien`) | Ảnh `gd-o-ep-<bậc>`, khoét lòng, cắt 9 mảnh cho vừa ô 54 × 35 (`E.vienAnh`). Bậc Rực lửa dùng khung lửa của ảnh (không còn ô lửa chạy vẽ code) |
| 23 | Vòng sóng, hạt, khói, lá rơi, gai rễ, tia lửa của trùm / quái (`monster_art.js`) | Xem mục 2 |
| 25 | Bóng chân người làng, bé Sen, Cu Tí ở làng | Ảnh `hu-bong-chan` (`G.bongLang`; trong lúc vẽ làng `G.langVe` bật để `G.bongAnh` dùng được) |
| 29 | Lá đa rơi, đom đóm ở làng (`village_scene.js` `ambTop`, đom đóm) | Ảnh `hu-moi-truong-rung-la` (rơi khung 1–3, nằm đất khung 4–8), `hu-moi-truong-rung-domdom`. Đường bay giữ như cũ |
| 40 | Sổ yêu quái: elip bóng dưới bóng đen quái chưa gặp, viền vàng ô đang chọn | Bỏ elip bóng ở ô chưa gặp; ô đã gặp dùng `hu-bong-chan`. Viền chọn = ảnh `gd-o-con-chon` |
| 46 | Tinh thể Hang biển loé, đom đóm Sông sâu, lấp lánh / đom đóm đèn (`room_art.js`) | `hu-sao-chop` (nhuộm lam nhạt), `hu-moi-truong-rung-domdom`. Trước đây đã bị chặn nên không hiện, nay hiện bằng ảnh |
| 50 | Chớp ở mũi đâm (`fx.js` `thrust`) | `hu-sao-chop` ở mũi (khối này hiện ít khi chạy vì đòn đâm đã có ảnh `hu-dam-giao`) |

Ảnh soát: `anh-soat/truoc-sau-hud-o-vk.png`, `-hud-o-vk-ruc-lua.png`, `-lang.png`, `-lang-gan.png`, `-so-yeu-quai.png`, `-hang-bien-phong.png`, `-song-phong.png`. Hàng trên là bản trước, hàng dưới là bản mới.

## 2. Hiệu ứng code của trùm lọt qua chặn vẽ

**Nguyên nhân:** bút giả của `sprite_custom.js` (`muonBut` / `butGia`, dùng khi thân quái là ảnh AI) **nhớ hàm tô của bút thật lần đầu mượn**. Màn chào / làng vẽ quái lên canvas trước khi trận bật chặn (`G.ganChan`), nên bút giả giữ hàm tô **chưa chặn**. Mọi hình code vẽ trong cử động của quái (`P.under` / `P.over`) đi thẳng qua.

**Sửa:** bút giả nhớ theo chính hàm gốc. Hàm gốc đổi (vừa bị bọc chặn) thì buộc lại. Đo bằng công cụ kiểm kê của vẽ tay 8, 3 trùm vùng + làng + 2 phòng: lệnh tô code ở lớp trận từ quái **248 954 → 0**.

Sau khi chặn, các hình đó được thay bằng ảnh có sẵn gần nhất (chỉ khi đang chặn; ảnh vẽ bằng bút thật như `HT.ve`):

| Hình code | Ảnh thay |
|---|---|
| Ngư Tinh xuất hiện: 3 vòng nước lan | `hu-vong-song` (dẹt như vòng cũ, nhuộm màu pha) |
| Ngư Tinh xuất hiện: bọt nổi | `hu-dan-bot` nhỏ |
| Ngư Tinh xuất hiện: 5 cột nước | `hu-cot-nuoc` |
| `F.song` (vòng sóng, cả sóng lớn cuối lúc ra mắt) | `hu-vong-song`; vòng to nhạt bớt cho đỡ thô |
| `F.hat` (chùm hạt, có hạt lúc trùm / quái chết) | `hu-hat-no`, nhuộm màu giữa dải hạt |
| `F.khoi` (khói, bụi) | `hu-khoi-tron` |
| `F.lua` của Hồ Tinh / Hổ Lửa (lửa bùng, vệt lửa, cột lửa) | `hu-bam-lua` (lửa cháy lặp), cao theo ngọn lửa cũ |
| `F.set` của Mộc Tinh (8 vết nứt toả ra lúc ra mắt) | Một ảnh `hu-nut-san` ở giữa, to theo độ lan, dẹt như sàn |
| Gai rễ Mộc Tinh (`gaiRe`) | `hu-gai-re` |
| Lá rơi Mộc Tinh (`laRoi`) | `hu-moi-truong-rung-la` |
| Tia lửa ngòi / lửa lép bép / tàn lửa trên vài quái (`tiaNgoi`, `lepLua`, `tanThan`) | `hu-sao-chop` nhỏ nhuộm vàng, `hu-lua-duoc` nhỏ |
| Chớp nổ quả nổ lúc Sóc Ném Quả Nổ chết | `hu-no-nho-fire` |

Các hình code khác trong cử động quái mà kiểm kê không liệt kê (vì trước đó cũng lọt) nay **bị ẩn** theo đúng chặn. Đây là hình trang trí, không phải vùng gây hại. Vùng báo nguy hiểm, vùng / vũng gây hại vẫn vẽ như cũ.

Ảnh soát: `anh-soat/truoc-sau-ngu-tinh-ra-mat.png`, `-moc-tinh-ra-mat.png`, `-ho-tinh-danh.png`.

### Prompt nên gen (không bắt buộc, đang dùng ảnh gần nhất)

Ảnh tạm dùng được, nhưng ba chỗ này gen riêng sẽ khớp hơn. Prompt lấy từ kiểm kê 8 (mục 3), sửa lại cho đúng chỗ dùng:

1. `hu-ngu-tinh-mo-man` (thay bộ vòng / bọt / cột nước lúc Ngư Tinh xuất hiện). Gửi kèm `../con-ve-tay-8/mau/hu-ngu-tinh-mo-man.png`.
   ```
   Pixel art, 1 row of 8 frames, flat #00FF00 background, top-down: a sea boss emerging: 3 flat water rings expanding outward on the floor (#9fd8f5, #ffffff), small round bubbles rising, then 5 thin white water spouts shooting up and falling, ending with one big wave ring, 128x64 px per frame, no outline, no text.
   ```
2. `hu-nut-re-moc` (thay vết nứt `F.set` lúc Mộc Tinh trồi lên; nay dùng `hu-nut-san`). Gửi kèm `../con-ve-tay-8/mau/hu-tia-gay.png`.
   ```
   Pixel art, 1 row of 4 frames, flat #00FF00 background, top-down floor view: 8 thin jagged dark-brown ground cracks (#3a2614, #6a4a2a) radiating from the center, growing longer each frame, flattened ellipse 160x60 px per frame, no outline, no text.
   ```
3. `hu-lua-bung` (thay `F.lua` của Hồ Tinh; nay dùng `hu-bam-lua`). Gửi kèm `../con-ve-tay-8/mau/hu-lua-bung.png`.
   ```
   Pixel art, 1 row of 6 looping frames, flat #00FF00 background, side view: a tall layered flame burst rising from the ground, 4 layers (#c43c10, #ff8a1e, #ffd23c, core #fff6b0), flickering tongues, 32x48 px per frame, dark outline #14182e on the first layer only, no text.
   ```

## 3. Phòng trùm Sông sâu vẽ rất chậm

**Nguyên nhân (hai lớp chồng nhau):**

1. Thuồng Luồng mượn thân Ngư Tinh, nhuộm màu bằng `ctx.filter` (`thuong_luong.js`, cả `vung4.js` nhuộm vùng 4 và `KN.veTam`). Khi `ctx.filter` đang bật, **mỗi lệnh vẽ** bắt trình duyệt lọc một lớp bằng cả canvas trận.
2. Trong lúc nhuộm đó, các hình code lọt qua chặn (mục 2) gửi hàng chục nghìn lệnh tô 1 điểm ảnh mỗi khung (vòng `F.vong` vẽ từng điểm). Mỗi lệnh lọc cả canvas một lần, nên chậm.

**Sửa:**

- Mục 2 bỏ hẳn các lệnh tô lọt.
- `G.locVe` (`fx_anh.js`): nhuộm ảnh trên một tấm nhỏ bằng đúng ô nguồn rồi mới dán (ảnh: nhớ lại, tối đa 48 ô mỗi ảnh). Lệnh tô code (nếu có) vẫn bật `ctx.filter` thật nên đúng màu.

So màu cùng khung với `?songnhanh=0`: lệch lớn nhất 2/255, 0 điểm lệch quá 24 (`anh-soat/so-mau-song-trum.png`).

**Số đo** (headless, 12 khung mỗi cảnh, bot đánh; "vẽ" = thời gian trình duyệt tô điểm ảnh, ép bằng `getImageData`; ms mỗi khung):

| Bản | Trùm Hang biển (JS / vẽ) | Phòng Sông sâu | **Trùm Sông sâu** |
|---|---|---|---|
| Trước phiên này | 3,0 / 3,3 | 1,9 / 2,2 | 5,3 / **8 882** |
| Trước, `?vecode=1` | 2,8 / 2,5 | 1,5 / 1,7 | 5,6 / **8 623** |
| **Sau (mặc định)** | 2,1 / 2,3 | 1,3 / 1,8 | 3,7 / **2,2** |
| Sau, `?songnhanh=0` | 1,9 / 2,2 | 1,3 / 1,6 | 2,9 / 90 |
| Sau, `?trum9=0` | 2,8 / 2,8 | 1,7 / 2,1 | 2,6 / 2,6 |
| Sau, `?vt9=0` (như cũ) | 2,9 / 3,2 | 1,3 / 1,6 | 4,8 / 8 598 |
| Sau, `?vecode=1` | 2,9 / 2,5 | 1,4 / 1,7 | 3,2 / 3,5 |

Phòng trùm Sông sâu: **khoảng 8,9 giây → 6 ms mỗi khung**, ngang các phòng khác. Mỗi cách sửa một mình đã đủ nhanh. Ghi chú: bản vẽ tay 8 ghi "`?vecode=1` thì nhanh", nhưng đo lại thì bản trước cũng chậm với `?vecode=1`.

Ảnh soát: `anh-soat/truoc-sau-song-trum.png`.

## 4. Công cụ (`cong-cu/`)

- `soat9.py <bản trước.html> [cảnh,...]`: chụp cùng cảnh trên bản trước và bản mới, ghép ảnh trên / dưới.
- `do.py <cảnh.js> [lọc]`: chạy cảnh trên bản một tệp, có móc đếm hình code của vẽ tay 8 (`HOOK=0` để đo tốc độ, `DIST=` chọn bản, `THEM=` thêm cờ).
- `canh-do-toc.js`: đo tốc độ (mục 3). `canh-kiem.js`: đếm hình code (mục 2). `canh-ngu.js`: trận Ngư Tinh.
- `so_mau.py`: so màu nhuộm nhanh với `ctx.filter`.

Bản trước dùng để so: `git show 2b4be365:game/dist/linh-khi.html`.

## 5. Rủi ro / còn lại

- Viền ô vũ khí bằng ảnh dày hơn nét code cũ (5 điểm). Bậc Rực lửa không còn đốm lửa chạy quanh viền.
- Đom đóm ảnh ở làng / Sông sâu sáng hơn chấm cũ một chút.
- Vòng sóng lớn (Ngư Tinh ra mắt, r 110) là ảnh phóng ~3,4 lần nên nét thô. Gen `hu-ngu-tinh-mo-man` sẽ đẹp hơn.
- Các dòng khác của kiểm kê 8 (ruột thanh máu, nền Sông sâu...) chưa làm: vẫn cần gen.
- Quay lui: `?vt9=0`, hoặc `git revert` commit này.
