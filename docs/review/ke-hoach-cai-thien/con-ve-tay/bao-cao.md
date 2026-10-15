# Báo cáo: còn chỗ "vẽ tay" trong trận (Cua Đá và các trùm khác)

Ngày 15/10/2026. Commit sửa code: `1cb25b3e` (nhánh `khoi-tao-du-an`).

**Chưa chơi thử.** Theo yêu cầu, phiên này không chạy game và không chạy bot. Mọi kết luận dưới đây đều từ đọc code, đo điểm ảnh của tệp ảnh và ảnh soát tĩnh. Đã kiểm:

- `node --check` cho mọi `game/js/*.js`: đạt.
- `python3 game/build.py`: đạt (25,1 MB / trần 30 MB).

Phiên này không đổi bản lưu, đăng nhập Google, lưu mây hay `?cloud=0`. Không tệp nào trong `cloud.js`, `cloud_ui.js`, `firebase-config.js` hay `bo_nho.js` bị đụng tới.

## 1. Thân trắng như bóng ma lúc trúng đòn

### Nguyên nhân (đọc code + đo ảnh)

Có hai lớp trắng chồng lên nhau:

1. **Ảnh AI:** cột 3 hàng `hit` của Cua Đá (cả 2 pha) đã tô trắng gần hết thân.
2. **Code chồng thêm chớp trắng:** `js/sprite_custom.js` (`SC.veQuai`) phủ trắng cả thân mỗi lần trúng đòn.
   - Mức phủ là 55–85% theo độ nặng của đòn (`js/mobs.js`) hoặc 70% với trùm (`js/boss.js`).
   - Đầu hàng trúng đòn còn ép thêm lên ít nhất 75%.
   - Lớp phủ này chồng lên đúng khung đã trắng, nên thành **trắng gấp đôi**.

Thêm một lý do khiến dễ thấy: lúc **choáng**, game phát qua lại cột 1–3 của hàng `hit`. Vì thế khung trắng nhấp nháy suốt thời gian choáng.

### Rà mọi tấm trùm vùng, trùm nhỏ, tinh anh (21 tấm)

Cách đo: tỉ lệ điểm ảnh của thân có độ sáng trung bình > 140 và độ bão hoà < 0,5, rồi soát lại bằng mắt trên ảnh ghép.

| Tấm | Khung | Đo | Bằng mắt | Xử lý |
|---|---|---|---|---|
| cuaDa | hit cột 3 | 0,57 (khung thường ~0,09) | trắng gần hết thân | sửa |
| cuaDa-p2 | hit cột 3 | 0,33 | trắng gần hết thân (trắng ngả kem) | sửa |
| mocTinh-p2 | hit cột 3 | 0,50 | trắng kem gần toàn thân | sửa |
| hoTinh-p2 | hit cột 3 | 0,32 | thân trắng, lửa còn màu | sửa |
| hoLua | hit cột 3 | 0,29 | thân hổ bạc màu kem | sửa |
| namChua | hit cột 3 | 0,34 | thân nhạt kem | sửa |
| namChua-p2 | hit cột 3 | 0,48 | **hồng tím**, không trắng | giữ |
| hoLua-p2 | hit cột 2 | 0,53 | **vàng lửa + xanh**, không trắng | giữ |
| 13 tấm còn lại | — | < 0,3 | bình thường | giữ |

Ghi chú về con số: chỉ số đo ra thấp hơn mức "60%" mà mắt thấy, vì phần thân trắng ngả kem / xám bị loại bởi ngưỡng bão hoà. Vì vậy danh sách cuối cùng chốt bằng mắt.

Các tấm 10 quái Lâu đài vừa vẽ lại (phiên `quai-moi-lau`, kéo về giữa phiên) cũng đã quét: không có hàng `hit` nào trắng. Có thấy hàng `die` của `denLong` cột 5–6 (0,79) nhạt. Đó là quái thường và là cảnh gục mờ dần, ngoài phạm vi phiên này.

### Đã sửa (`js/sprite_custom.js`)

- **Khung trắng:** bảng `KHUNG_TRANG` ghi 6 khung trên. Khi đến khung trắng, game vẽ **cột 2 của cùng hàng** rồi phủ trắng nhẹ **25%**.
  - Không sửa tệp ảnh trong `game/art/custom`, đúng luật chung số 1.
  - Cờ tắt: `?khungtrang=1`.
- **Chớp trúng đòn của quái / trùm có ảnh AI:** bỏ lớp phủ trắng cả thân.
  - Thay bằng một **viền sáng mảnh** (bóng trắng ngà dời 1 điểm ảnh bốn phía, vẽ dưới thân) và **nhuộm đỏ nhẹ**.
  - Mức nhuộm đỏ là 30% × độ chớp, tức khoảng 16–26% trong trận.
  - Cờ tắt: `?chopcu=1`.
- **Giữ nguyên chớp "báo sắp ra đòn" và "đổi pha" của trùm vùng** (`o.baoDon`). Đây là tín hiệu né đòn, không phải trúng đòn.

## 2. Rà đường vẽ bằng code đang hiện trong trận

Đã rà (đọc code) các tệp: `fx.js`, `fx_he.js`, `fx_ky_nang.js`, `fx_chuong.js`, `fx_dan.js`, `art.js`, `mobs.js`, `boss.js`, `chieu_trum.js`, `ky_nang_quai.js`, `bao_truoc.js`, `monster_art.js`, `noi_gian.js`.

Mỗi nhánh vẽ code được xếp vào một trong ba loại:

- đã có ảnh và đang dùng;
- có ảnh nhưng chưa nối;
- chưa có ảnh.

Các phần đã dùng ảnh và **không cần làm gì**:

- **Vùng báo trước** (`bao_truoc.js`): ảnh `gd-bt-*`.
- **Vũng quái trên sàn:** `hu-vung-quai-*`.
- **Vũng / mây của em bé:** `hu-vung-doc`, `hu-vung-lua`, `hu-may-doc`.
- **Đạn quái:** `hu-dan-*` (vẫn còn quầng / vệt code bao quanh, xem mục 4).
- **Tường tinh thể:** `hu-tuong-tinh-the`, vỡ thì `hu-bang-vo`.
- **Đập sàn của Cua Đá:** `hu-dap-san` + `hu-nut-san`.
- **Thân trùm / trùm nhỏ / tinh anh luôn là ảnh AI.** Đường vẽ thân bằng code trong `art.js` không còn tới được. Chỉ vài khung đầu, khi ảnh rời chưa tải xong, mới vẽ thân code của `monster_art.js` (như cũ).
- **`fxKind` ('slam', 'spout') của vùng không được hàm vẽ nào đọc**, nên không gây hình gì.

### "Ô vuông xanh lục" và "vết độc / vết băng" trong trận Cua Đá: nguồn tìm được

Cua Đá chỉ đánh hệ băng hoặc không hệ. Vậy màu **xanh lục** phải đến từ **vũ khí / chưởng độc của em bé** (độc dính lên Cua Đá và nổ trên sàn). Từ mạnh đến yếu:

1. **Bong bóng độc vẽ code trên thân** (`mobs.js` `ttBong`, Đợt 7).
   - Hình: ô vuông s×s màu `#c8f90b`, viền `#277600`, ở nửa dưới thân sát sàn. Với Cua Đá ô rộng ~5–7 điểm ảnh.
   - Vẽ **chồng lên** ảnh `hu-bam-doc` mà `fx.js` đã vẽ, nên thành hai lớp.
   - Tương tự với mảnh băng ở chân (`ttBang`, chồng `hu-bam-bang`) và lưỡi lửa (`ttLua`, chồng `hu-bam-lua`).
2. **Hàng ô vuông trạng thái trên đầu trùm** (`art.js` `A.status`).
   - `combat.js` luôn gọi cho trùm / trùm nhỏ (bỏ qua cờ Đợt 7).
   - Độc là 5 ô tối có lõi `#8fe04a`; băng là ô xanh lam.
   - Trong khi đó đã có ảnh `gd-tt-chay`, `gd-tt-doc`, `gd-tt-bang`, mới chỉ dùng ở thanh trạng thái của em bé.
3. **Chớp "sq" ở mọi vùng nổ** (`fx.js` kiểu `flash` có `sq: true`).
   - Hình: lõi vuông + 4 ô vuông góc. Có 13 chỗ gọi.
   - Màu theo chỗ gọi: vùng độc `#8fe04a` (xanh lục), vùng đất đá (Cua Đá đập càng, vành sóng) be `#e2d4b8`, cam với lửa, xanh băng với băng.
4. **Hạt rơi đọng trên sàn** (`fx.js` loại 5 / loại 8): giọt độc thành vệt 3×1, mảnh đá / mảnh vụn nảy rồi nằm với bóng đen. Chưa có ảnh, xem mục 4.
5. **Vùng đường / quạt / vành nổ** (`mobs.js`): mỗi điểm rải 4 hạt vuông màu hệ.
   - Gồm mảnh tinh thể của Tường tinh thể, Kẹp càng, vành sóng đập càng.
   - Tường tinh thể có nhiều hàng × 2 phía nên thành rất nhiều ô xanh băng.
6. **Cua Đá trúng đòn** (`monster_art.js`): thêm hạt vuông xám xanh, nhấp nháy suốt lúc choáng. Trong khi hàng `hit` của ảnh AI đã vẽ sẵn đá văng.

## 3. Đã nối ảnh có sẵn

Tất cả đều có cờ tắt chung `?vetaycu=1` (`G.VE_TAY_MOI`, khai ở `js/fx_anh.js`). Ảnh chưa tải xong thì vẫn vẽ code như cũ, không lỗi.

| Chỗ | Trước (code) | Sau (ảnh có sẵn) | Tệp |
|---|---|---|---|
| Chớp "sq" ở mọi vùng nổ / trúng đòn (13 chỗ) | lõi vuông + 4 ô vuông | `hu-va-cham` nhuộm đúng màu chớp, cỡ theo bán kính. Đòn của em bé vẫn giữ đậm như vệt đòn. | `fx.js` `add()` |
| Bong bóng độc / mảnh băng / lưỡi lửa vẽ code trên thân quái có ảnh AI | vẽ thêm trên ảnh `hu-bam-*` | bỏ hạt code khi ảnh `hu-bam-*` đang vẽ; nhuộm thân giữ nguyên | `mobs.js` `ttHat` |
| Biểu tượng trạng thái trên đầu trùm / trùm nhỏ | hàng ô vuông | `gd-tt-chay` / `gd-tt-doc` / `gd-tt-bang` (9×9) xếp một hàng | `art.js` `A.status` |
| Sao choáng trùm vùng (Ngư / Mộc / Hồ Tinh) | 4 sao vẽ code; `fx.js` còn vẽ thêm `hu-choang` lần nữa | một ảnh `hu-choang` (×2) trên đầu, bỏ bản thứ hai | `monster_art.js` `TRUM.choang`, `fx.js` |
| Vùng đường / quạt / vành nổ (Tường tinh thể, Kẹp càng, vành sóng) | 4 hạt vuông mỗi điểm | `hu-va-cham` nhuộm màu hệ mỗi điểm | `mobs.js` |
| Đạn chạm Tường tinh thể | hạt vuông | `hu-va-cham` xanh băng | `chieu_trum.js` |
| Cua Đá trúng đòn / choáng | hạt vuông xám xanh | bỏ khi thân là ảnh AI (hàng `hit` đã có đá văng) | `monster_art.js` |

Ảnh soát tĩnh: `xem-truoc-sau.png` (cùng thư mục). Ảnh có các hàng sau:

- Khung `hit` cũ / mới của Cua Đá pha 1 và pha 2.
- Khung 3 cũ / mới của 4 trùm còn lại.
- Chớp trúng đòn cũ / mới. Ảnh vẽ đỏ 30%, đậm hơn trong trận (16–26%).
- Hàng ô trạng thái → `gd-tt-*`.
- Chớp vuông xanh lục / be → `hu-va-cham` nhuộm.

## 4. Chưa có ảnh: danh sách cần gen (KHÔNG tự vẽ)

Quy cách chung cho mọi ảnh (giống bộ `hu-*` sẵn có):

- Pixel art, nền trơn `#00FF00`, MỘT hàng N khung xếp ngang, các khung cách xa nhau.
- Viền tối `#14182e`, không bóng đổ, không chữ.
- Kích thước ghi theo điểm ảnh game. Tách bằng `tools/tach-hieu-ung` ở `net: 2`, tức vẽ gấp đôi.
- Mẫu kèm khi gen: `hu-va-cham`, `hu-no-doc`.

| # | Tệp | Cỡ khung (game) | Khung | Thay cho (code đang hiện) | Prompt |
|---|---|---|---|---|---|
| 1 | `hu-giot-doc-san` | 16×8 | 5 | giọt độc rơi đọng thành vệt 3×1 trên sàn (`fx.js` loại 5 với độc; `fx_he.js` vung / tên / kết liễu độc) | `Pixel art, 1 row of 5 frames, flat #00FF00 background, top-down: a single drop of glowing toxic green liquid (#8fe04a, highlight #e6ffc0, dark #2f6b1a) splashing onto stone floor and spreading into a small flat puddle that shrinks and fades, dark outline #14182e, no shadow, no text.` |
| 2 | `hu-manh-da` | 24×16 | 6 | mảnh đá / vụn nảy để lại ô vuông có bóng (`fx.js` loại 8: vùng đất đá, búa nện, đạn chạm tường) | `Pixel art, 1 row of 6 frames, flat #00FF00 background, top-down 3/4 view: three small grey-brown rock chips (#8a7a66, #b8a890, #4a3e34) bursting up from the floor, bouncing once and settling, then fading, tiny dust puff, dark outline #14182e, no shadow, no text.` |
| 3 | `hu-vet-chay` | 32×16 | 4 | vệt cháy đen hình elip dưới vùng lửa nổ (`fx.js` `scorch`: cầu lửa, vùng lửa nổ, nổ lửa quái) | `Pixel art, 1 row of 4 frames, flat #00FF00 background, top-down: a flat oval scorch mark on stone floor, charred black-brown (#2a1a12, #5a2a1c) with a few glowing orange embers (#ff7a2a) that dim frame by frame until only a faint dark stain remains, no shadow, no text.` |
| 4 | `hu-bot-doc` | 12×16 | 6 | bong bóng độc 2×2 nổi lên từ vũng độc / vùng độc nổ (`fx.js` loại 11, `stepZones`) | `Pixel art, 1 row of 6 frames, flat #00FF00 background: one toxic green bubble (#c2f58a body, #6fcf3a rim, white glint) rising from a puddle, growing slightly, then popping into 3 tiny droplets, dark outline #14182e, no shadow, no text.` |
| 5 | `hu-ray-bang` | 16×16 | 5 | mảnh băng / sương rơi đọng (`fx.js` vùng băng nổ loại 4–5, `shatter`; quái đang đóng băng rụng hạt băng) | `Pixel art, 1 row of 5 frames, flat #00FF00 background: a few sharp ice shards (#bfeaff, #7fd4ff, white core) and frost mist falling onto the floor, breaking into tiny sparkles and melting away, dark outline #14182e, no shadow, no text.` |
| 6 | `hu-cao-quai` | 48×32 | 5 | vệt chém lưỡi liềm vẽ code khi quái cận chiến ra đòn (`monster_art.js` DON 'chem': Cua Lính, Ốc, Mèo Đen, Cua Đá Kẹp càng, Cua Tướng) | `Pixel art, 1 row of 5 frames, flat #00FF00 background, facing right: a white-grey crescent claw swipe arc (white #ffffff to light grey #c8d0dc, made white so the game can tint it), appearing, sweeping forward and breaking into a few sparks, dark outline #14182e, no shadow, no text.` |
| 7 | `hu-lao-bui` | 40×16 | 5 | vệt bụi + vạch tốc độ khi quái lao (`monster_art.js` DON 'lao': Heo Con, Cá Con, Ong, Chồn, Linh Ma, Dơi, Cá Chuồn, Heo Nanh) | `Pixel art, 1 row of 5 frames, flat #00FF00 background, facing right: a burst of beige dust (#d8c08a, #a88a58) kicked from the floor with 3 white speed lines trailing to the left, stretching then fading, dark outline #14182e, no shadow, no text.` |
| 8 | `hu-gai-toa` | 64×40 | 6 | vòng gai bắn toả vẽ code (`monster_art.js` DON 'gai': Cá Nóc, Nhím Biển, Nhím Độc, Nhím Thần) | `Pixel art, 1 row of 6 frames, flat #00FF00 background, top-down 3/4 view: a ring of 8 white-grey spikes (tintable, #ffffff/#c8d0dc) shooting outward from a center point, flying apart then breaking into small sparks, dark outline #14182e, no shadow, no text.` |
| 9 | `hu-tia-mom` | 16×16 | 5 | tia sáng ở miệng lúc lấy đà bắn / ném / phun (`monster_art.js` DON tele 'ban', 'nem', 'phun': Hoa Bào Tử, Đèn Lồng, Hải Quỳ, Sóc, Tiểu Yêu) | `Pixel art, 1 row of 5 frames, flat #00FF00 background: a small charging energy spark, white core with soft white glow (tintable), particles converging inward then flaring, no outline on glow, no shadow, no text.` |
| 10 | `hu-vong-hoi-quai` | 96×56 | 6 | vòng elip xanh lá phẳng khi quái khiên hồi máu đồng đội (`mobs.js` `healFx`, bán kính 90) | `Pixel art, 1 row of 6 frames, flat #00FF00 background, top-down: a flat healing ring on the floor, soft green (#8fe86a, #e6ffc0) expanding outward with small plus-shaped sparkles rising, fading at the edge, no shadow, no text.` |
| 11 | `hu-tuong-song` | 64×48 | 6 | tường sóng nước của Ngư Tinh (`fx.js` `wave()` vẽ toàn hình chữ nhật) | `Pixel art, 1 row of 6 frames, flat #00FF00 background, side 3/4 view facing right: a tall curling sea wave wall (#4a80b0, #9fd0e8, white foam #ffffff) rising, rolling forward and crashing into foam, dark outline #14182e, no shadow, no text.` |
| 12 | `hu-khoi-doc-nho` | 24×24 | 6 (lặp) | làn khói độc quanh thân Nấm Chúa / Nấm Phồng / Nấm Phồng Chúa / Mộc Tinh (`monster_art.js` `khiDoc`) | `Pixel art, 1 row of 6 looping frames, flat #00FF00 background: a small wisp of purple-green toxic smoke (#9a48d4, #c4f43c, #58208c) curling upward and dissolving, seamless loop, dark outline #14182e, no shadow, no text.` |
| 13 | `hu-hao-quang-gian` | 48×20 | 6 (lặp) | quầng đỏ + đốm vuông khi trùm nhỏ / tinh anh / trùm nổi giận (`noi_gian.js`) | `Pixel art, 1 row of 6 looping frames, flat #00FF00 background, top-down: a flat red rage aura ring on the floor (#c8372d, #ff5a46, #ffb0a0) pulsing, with small ember flecks rising, seamless loop, no shadow, no text.` |
| 14 | `hu-tam-giac-bua` (vùng) | 64×56 | 6 | hình tam giác tô đỏ hồng của Tiểu Yêu (`ky_nang_quai.js`; ảnh `hu-bua-tam-giac` hiện chỉ thay lá bùa) | `Pixel art, 1 row of 6 frames, flat #00FF00 background, top-down: a glowing triangular magic seal on the floor (#ff4a7a edges, #ffb0c8 inner glow, faint runes) forming line by line, filling with light, then flashing and fading, no shadow, no text.` |

Việc nối sau khi có ảnh (để phiên sau làm): ở mỗi chỗ code ghi trong cột "Thay cho", gọi `G.huVt('<mã>')` rồi `anh(...)` / `G.fxAnh.ve(...)`. Giữ vẽ code làm dự phòng, giống cách đã làm ở mục 3.

### Có ảnh nhưng CHƯA nối: cần duyệt, không tự quyết

Các chỗ dưới đây ảnh đã có nhưng **khác nghĩa hoặc khác cỡ**. Nối thẳng có thể làm hình sai, nên ghi lại để chủ dự án chọn:

- **Vệt cháy (`scorch`) → `hu-vung-lua`:** ảnh là vũng lửa cháy, không phải vết cháy đen. Nên gen #3.
- **`khiDoc` → `hu-may-doc`:** đám mây độc to của em bé; khói quanh thân nhỏ hơn nhiều. Nên gen #12.
- **Nổ quái cảm tử (DON 'no') → `hu-no-nho` / `hu-no-doc` / `hu-no-lua`:** dùng được. Nhưng phải đo lại tâm nổ (code nổ ở giữa thân, ảnh neo ở chân), nên để phiên sau.
- **Mộc Tinh c4 Bùa bay:** `monster_art.js` vẽ thêm bùa giả trùng với đạn thật (đã là ảnh `hu-dan-bua`). Có thể tắt hiệu ứng code của cử động này (`o.fx = false`). Đây là đổi hình của trùm vùng, cần duyệt.
- **Hồ Tinh c3 Quạt đuôi (3 lưỡi liềm code) → `hu-tram-nguyet-fire`; Ngư Tinh c3 cột băng → `hu-gai-bang`:** có thể nối. Cần đo cỡ / góc với vùng thật.

### Vẽ code còn lại, cố ý giữ (hiệu ứng nhỏ, không có hình khối)

- Quầng / vệt đuôi quanh ảnh đạn quái (`fx_dan.js`).
- Vòng sóng mảnh, khói tròn.
- Số sát thương.
- Vệt tay khi vung vũ khí hệ (`fx_he.js` lưỡi lửa / răng cưa băng / giọt độc dọc nhát chém).
- Hạt nổ chung `burst` ở các chỗ chưa có ảnh khớp.

Các hình này đều là hạt 1–3 điểm ảnh. Nếu chủ dự án vẫn thấy "vẽ tay" sau phiên này, nguồn còn lại nhiều khả năng là mục 1, 2, 5 ở bảng trên.

## 5. Tệp đổi

- `game/js/sprite_custom.js`: bảng `KHUNG_TRANG` + phủ 25%; chớp trúng đòn thành viền sáng + đỏ nhẹ; cờ `?khungtrang=1`, `?chopcu=1`.
- `game/js/fx_anh.js`: cờ `G.VE_TAY_MOI` (`?vetaycu=1`), hàm `G.huVt(mã)`.
- `game/js/fx.js`: chớp "sq" → `hu-va-cham`; trùm vùng không vẽ `hu-choang` lần hai.
- `game/js/mobs.js`: bỏ hạt code khi đã có ảnh `hu-bam-*`; vùng đường / quạt / vành nổ → `hu-va-cham`.
- `game/js/art.js`: `A.status` → `gd-tt-chay` / `gd-tt-doc` / `gd-tt-bang`.
- `game/js/monster_art.js`: `TRUM.choang` → `hu-choang`; Cua Đá trúng đòn bỏ hạt khi thân là ảnh AI.
- `game/js/chieu_trum.js`: đạn chạm Tường tinh thể → `hu-va-cham`.
- `game/dist/*`, `tools/xuong-sprite/index.html`: build lại.
- `docs/review/ke-hoach-cai-thien/con-ve-tay/xem-truoc-sau.png`: ảnh soát tĩnh.

## 6. Rủi ro còn lại (vì chưa chơi thử)

- **Chớp trúng đòn nay nhẹ hơn hẳn.** Nếu thấy khó nhận ra đã đánh trúng, dùng `?chopcu=1` để so. Có thể tăng mức viền / đỏ trong `SC.veKhung` (`0.85`, `0.3`).
- **Viền sáng vẽ 4 lần khung đã nhuộm** (có bộ nhớ tấm nhuộm), chỉ trong lúc chớp (~0,1–0,2 giây). Tốn thêm rất ít.
- **Ảnh `hu-va-cham` thay chớp vuông ở 13 chỗ, kể cả đòn của em bé** (búa nện, kết liễu hệ, nổ lửa). Hình chớp đổi từ ô vuông sang tia va chạm.
- **`gd-tt-*` trên đầu trùm không còn hiện số tầng độc / băng bằng số ô.** Số tầng vẫn có chữ số nhỏ của `fx.js` (độc ≥ 2, băng ≥ 2).
- **Ngưỡng "trắng > 60%"** không đo đúng được bằng công thức điểm ảnh (trắng ngả kem). Danh sách 6 khung chốt bằng mắt; có thể còn sót khung nhạt nhẹ hơn.

## 7. Quay lui

- Cả phiên: `git revert 1cb25b3e`.
- Từng phần (thêm vào địa chỉ trang):
  - `?khungtrang=1`: khung trắng như cũ.
  - `?chopcu=1`: chớp trắng cả thân như cũ.
  - `?vetaycu=1`: mọi chỗ nối ảnh ở mục 3 vẽ code như cũ.

## 8. Quyết định cần duyệt

1. Có nối các ảnh "khác nghĩa" ở mục 4 không: tắt bùa giả Mộc Tinh c4, Quạt đuôi → `hu-tram-nguyet-fire`, Ngư Tinh c3 → `hu-gai-bang`, nổ cảm tử → `hu-no-*`.
2. Có gen 14 ảnh ở mục 4 không, và gen trước những ảnh nào. Đề xuất ưu tiên #1, #2, #3, #5 vì chúng là các "ô / vệt trên sàn" mà chủ dự án thấy.
3. Mức chớp trúng đòn mới (viền + đỏ nhẹ) có vừa mắt không.
