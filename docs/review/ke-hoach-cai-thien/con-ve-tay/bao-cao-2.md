# Báo cáo đợt 2: đưa 4 ảnh sàn vào game, xoá hình vẽ code còn lại

Ngày 15/10/2026. Commit code: `6f6d7af8` (nhánh `khoi-tao-du-an`, đã rebase lên `1b13f56d` của phiên khác, giữ nguyên thay đổi của họ).

**Chưa chơi thử.** Theo yêu cầu, phiên này không chạy game, không chạy bot. Đã kiểm:

- `node --check` mọi `game/js/*.js`: đạt.
- `python3 game/build.py`: đạt. Xung đột khi rebase chỉ ở 3 tệp `game/dist/*` (tệp sinh ra), đã đóng gói lại từ mã đã gộp.
- Ảnh soát tĩnh: `xem-dot2.png` (cùng thư mục).

Không đụng `cloud.js`, `cloud_ui.js`, `firebase-config.js`, `bo_nho.js`. Đăng nhập Google, lưu mây, `?cloud=0` giữ nguyên. Không đổi luật chơi: vùng va chạm, sát thương, thời gian giữ nguyên, chỉ đổi phần vẽ.

## Dung lượng người chơi tải (`build.py --hai-tep`, ảnh rời)

| | Trang nén | Ảnh | Tổng / trần 20 MB | Không WebP |
|---|---|---|---|---|
| Trước (`5c2dd0e7`) | 0,94 MB | 14,37 MB | 15,31 MB | 18,15 MB |
| Sau | 0,95 MB | 14,38 MB | 15,32 MB | 18,17 MB |

4 ảnh mới cộng lại khoảng 17 KB. Chúng là ảnh tải sau (luật cũ của `build.py`, không đổi).

## 1. Bốn ảnh mới

Công cụ: `cong-cu/dung-dot2.py` (chạy `--ghi` để ghi vào `game/art/custom`). Cách cắt giống `hieu-ung-ky-nang/cong-cu/dung-hieu-ung.py`: net 2, khử nền `#00FF00`, tách khung theo khe cột, lượng tử 128 màu, có kiểm khớp từng điểm.

| Mã | Khung | Ô (điểm game) | Cỡ dấu trên sàn | Thời lượng | Neo |
|---|---|---|---|---|---|
| `hu-giot-doc-san` | 5 | 18×17 | rộng 16 | 0,6 s | tâm vũng (đường đất − nửa bề cao vũng) |
| `hu-manh-da` | 6 | 26×32 | rộng 24 | 0,7 s | đường đất |
| `hu-vet-chay` | 4 | 35×20 | 32×17 | 1,6 s (game phát theo thời gian vết) | tâm vết |
| `hu-ray-bang` | 5 | 18×25 | rộng 16 | 0,6 s | đường đất |

Một số điều chỉnh khi cắt:

- **Cỡ:** bề rộng khớp đúng số ở bảng mục 4 của `bao-cao.md`. Bề cao cho phép tới 2 lần số ghi, vì có khung giọt hoặc mảnh còn đang rơi, đang nảy trên không. Hạt code cũ cũng bay cao tới ~27 điểm.
  - Nếu ép cả bề cao vào 16×8 hay 24×16 thì vũng độc chỉ còn rộng 9, mảnh đá rộng 13.
- **`ray-bang`:** bỏ hẳn khói xanh lục nhạt mà AI tô. Điểm nào còn hơi lục thì kéo về trắng / xanh băng. Kết quả không còn ám lục.
  - Khung 5 chỉ còn vài đốm lấp lánh (đúng ý "tan biến").
- **`giot-doc-san`:** chất độc cũng màu lục, nên chỉ khử đúng màu nền (khoảng cách màu < 60). Lần cắt đầu làm mất hết chất lỏng, đã sửa.
- **`manh-da`:** bụi be bị ám nền lục, đã kéo về màu be. Khung 1 và khung 6 rất nhỏ, vẫn giữ (khung 6 chỉ còn bụi).

## 2. Nối vào game

Mọi thay đổi dưới đây đều quay lui được bằng cờ chung **`?vetaycu=1`** (`G.VE_TAY_MOI`, `js/fx_anh.js`). Khi bật cờ, mọi chỗ vẽ code như trước đợt 1.

### 2a. Hạt vẽ code → ảnh trên sàn (`js/fx.js`, hàm `emit`)

Hạt đổi thành **hạt loại 12** (một ảnh phát tại chỗ). Hạt này dùng chung kho hạt, nên vẫn qua lớp làm nhạt hiệu ứng em bé, `aimed()` và giới hạn 400 hạt. Nhờ vậy nó không đẩy các hình khác ra khỏi danh sách 72 hình.

- **Gộp:** cùng mã, cách nhau < 9–12 điểm và < 0,12 giây thì gộp làm một ảnh. Một chùm 7 hạt thành một ảnh.
- **Ảnh chưa tải:** không vẽ gì.

| Hạt cũ | Hệ (đoán theo dải màu) | Sau |
|---|---|---|
| Loại 5 (giọt, vệt 3×1) | độc / tím độc | `hu-giot-doc-san` tại điểm chạm sàn (lớp sàn) |
| Loại 5 | băng | `hu-ray-bang` |
| Loại 5 | nước | **giữ** (ngoài phạm vi) |
| Loại 8 (ô vụn có bóng) | đá, thép, lửa, thân quái chết… | `hu-manh-da` tại chỗ bật lên |
| Loại 8 | độc | `hu-giot-doc-san` |
| Loại 8 | băng | `hu-ray-bang` |
| Loại 4 (mảnh xoay) | băng | `hu-ray-bang` |
| Loại 0 | băng có điểm rơi (quái đang đóng băng rụng hạt) | `hu-ray-bang`, thưa còn 30% |
| Loại 11 (bọt độc 2×2, #4) | mọi hệ | **tắt** |

Vết cháy `scorch` (cầu lửa, vùng lửa nổ, nổ lửa quái, vệt lửa của em bé) dùng `hu-vet-chay`, rộng 32 = 2r khi co 1. Mỗi khung là một nấc than tắt dần theo thời gian của vết, mờ dần như cũ.

### 2b. Bỏ vẽ code dự phòng khi ảnh đang tải (các chỗ đã nối ở đợt 1)

Khi ảnh chưa tải, các chỗ sau nay **không vẽ gì** (trước đây vẽ lại hình code):

- Chớp "sq" (`fx.js add`).
- Hạt trạng thái trên thân quái (`mobs.js ttHat`): bỏ khi cờ `?hudot3` còn bật, không chờ `hu-bam-*`.
- Ô trạng thái trên đầu trùm (`art.js A.status`).
- Sao choáng trùm vùng (`monster_art.js TRUM.choang`, `fx.js`).
- Vùng đường / quạt / vành nổ (`mobs.js`).
- Đạn chạm Tường tinh thể (`chieu_trum.js`).

**Cố ý KHÔNG bỏ dự phòng** ở các hình nguy hiểm: đạn quái, vùng báo trước, vũng quái, tường tinh thể, tường sóng, bùa tam giác Tiểu Yêu. Nếu ảnh chưa về mà bỏ hình code, đòn sẽ tàng hình và người chơi không né được.

### 2c. 10 hiệu ứng chưa có ảnh (#4, #6–#14)

"Trong trận" nghĩa là `G.monsterArt.draw` được gọi với `bao: false`. Game luôn gọi như vậy. Trang Xưởng Sprite và truyện vẫn hiện hình code để xem.

| # | Hình | Xử lý |
|---|---|---|
| 4 | bọt độc | tắt (xem 2a) |
| 6 | vệt chém lưỡi liềm (DON chem) | tắt. Vệt cào ảnh `hu-quai-cao` vẫn do `fx.js` vẽ |
| 7 | vệt lao + bụi (DON lao) | tắt |
| 8 | vòng gai toả (DON gai) | tắt. Đạn gai thật vẫn bay |
| 9 | tia sáng ở miệng lúc lấy đà (bắn / ném / phun) | tắt. Đây là đốm trang trí, không phải vùng báo trước. Vùng báo trước của game (`bao_truoc.js`) vẫn giữ |
| 10 | vòng elip hồi máu | thay bằng `hu-hoi-mau` có sẵn trên **mỗi con được hồi**, cỡ theo thân. Ảnh màu hồng (thuốc), không nhuộm |
| 11 | tường sóng Ngư Tinh (`fx.js wave()`) | **không còn chỗ nào tạo vùng `z.wave`** (đã rà mọi tệp). Sóng thần hiện tại là `z.wall` ở `mobs.js drawWall`, đã dùng `hu-song-than` từ 14/10. Không đổi gì |
| 12 | khói độc quanh thân Nấm / Mộc Tinh (`khiDoc`, 3 chỗ) | tắt |
| 13 | quầng nổi giận | xem dưới bảng |
| 14 | tam giác đỏ hồng của Tiểu Yêu | **giữ**. Đó là vùng sát thương ("chạy ra khỏi tam giác"), tức tín hiệu né đòn |

**#13 quầng nổi giận:** đã bỏ các ô đỏ chạy vòng và đốm lửa vuông. **Giữ tạm** quầng elip mờ dưới chân, kèm thân nhuộm đỏ có nhịp và màn đỏ ở mép (pha 3), để không mất dấu hiệu nổi giận. Không dùng `hu-vung-*` vì nhìn như vùng sát thương.

Giữ nguyên (tín hiệu né đòn):

- vùng báo trước;
- chớp báo đòn trùm (`P.flash`, `o.baoDon`);
- vạch đỏ / khe trắng của tường sóng lúc báo;
- chấm đỏ mép trước của sóng.

### 2d. Có ảnh nhưng chưa nối (đã làm)

- **Nổ cảm tử (DON 'no': Sứa Bom, Nấm Phồng, Nấm Phồng Chúa, Hũ Lửa, Hũ Lửa Chúa):** dùng ảnh theo vùng: rừng `hu-no-doc`, biển `hu-no-bang`, lâu đài `hu-no-lua`.
  - Neo ở **chân quái**, cỡ `tam / 40`. Ảnh chuẩn là nổ r = 40 neo tâm trên sàn, nên khớp vòng va chạm thật ở `mobs.js` (tròn, tâm chân quái, bán kính `don.tam`).
  - Code cũ nổ ở giữa thân.
- **Mộc Tinh c4 Bùa bay:** tắt bùa giả và vụ nổ vẽ code. Đạn bùa thật `hu-dan-bua` vẫn bay.
- **Hồ Tinh c3 Quạt đuôi:** 3 lưỡi liềm code thay bằng 3 ảnh `hu-tram-nguyet-fire`, xếp theo cung quạt va chạm thật (tâm chân trùm, bán kính 120, mở 2,6 rad).
  - Mỗi ảnh nằm ở 1/3 cung, cách tâm 0,6 × 120 và xoay theo hướng.
  - Co 2,2: lưỡi cao ~80, nên 3 lưỡi phủ được dây cung ~220. Các lưỡi hiện lần lượt theo nhát quét.
  - Lửa ma trên sàn sau nhát quét: giữ.
- **Ngư Tinh c3 cột băng:** `cotBang` thay bằng `hu-gai-bang` (neo chân, co h/12 ≈ cột code 4–11).
  - Cùng chỗ và cùng lúc mọc như cũ: khung 1–4 lúc mọc, 4–6 lúc vỡ.
  - Hạt vỡ vẽ code bỏ.

## 3. Rủi ro (vì chưa chơi thử)

- **Hệ của hạt đoán theo dải màu.** Ví dụ: mảnh thân quái chết có màu da lục có thể ra `hu-giot-doc-san` thay vì `hu-manh-da`.
- **Ảnh tải sau.** Ở vài giây đầu ván, chỗ đã tắt dự phòng sẽ trống. Có thể đưa vào `HU_CO_BAN` của `build.py` để ảnh nằm sẵn trong trang (thêm ~17 KB, cộng `hu-va-cham`, `hu-choang` nếu muốn). Phiên này chưa đổi luật tải.
- **Cỡ và tâm của Quạt đuôi và nổ cảm tử chỉ đo trên giấy.** Nếu lệch so với vùng thật, chỉnh hệ số `.6` / `2.2` (`monster_art.js` Hồ Tinh c3) hoặc `tam / 40`.
- **Nhiều ảnh nhỏ cùng lúc** (trận đông, nhiều độc / băng): đã gộp chùm. Nếu vẫn rối, tăng ngưỡng gộp trong `datSan` (`fx.js`).
- **Còn vẽ code, ngoài phạm vi YEU-CAU-2:** giọt nước loại 5, lấp lánh loại 6, khói tròn, vệt / đuôi quanh đạn, lưỡi lửa loại 9, đạn giả của DON 'ban' / 'nem' / 'phun', lửa ma trên sàn của Hồ Tinh. Nếu chủ dự án vẫn thấy "vẽ tay", đây là nguồn còn lại.

## 4. Quay lui

- Cả đợt: `git revert 6f6d7af8`.
- Thêm `?vetaycu=1` vào địa chỉ trang: mọi chỗ của đợt 1 và đợt 2 vẽ code như cũ.

## 5. Tệp đổi

- `game/art/custom/hu-giot-doc-san|hu-manh-da|hu-vet-chay|hu-ray-bang.sprite.json` (mới).
- `game/js/fx.js`, `mobs.js`, `monster_art.js`, `art.js`, `chieu_trum.js`, `noi_gian.js`.
- `game/dist/*`, `tools/xuong-sprite/index.html`: đóng gói lại.
- `docs/review/ke-hoach-cai-thien/con-ve-tay/cong-cu/dung-dot2.py`, `ve-soat-dot2.py`, `xem-dot2.png`, `bao-cao-2.md`.

## 6. Cần duyệt

1. Giữ tạm quầng elip nổi giận, hay gen ảnh `hu-hao-quang-gian` (#13)?
2. Có đưa 4 ảnh sàn (và `hu-va-cham`, `hu-choang`) vào phần tải sẵn không?
3. Cỡ 3 lưỡi Quạt đuôi khi chơi thử.
