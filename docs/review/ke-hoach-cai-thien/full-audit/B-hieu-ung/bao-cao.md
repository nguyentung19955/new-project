# Rà soát toàn bộ — Phần B: Hiệu ứng chiến đấu (12/10/2026)

Làm đúng mục 3 của `../YEU-CAU.md` (bom, bẫy, vùng sát thương, vòng cảnh báo, dấu ngắm, hiệu ứng kỹ năng, nổ, lửa, băng, độc, va chạm, trạng thái bất lợi, đạn quái) theo quy trình mục 6–8. **Chỉ đổi cách vẽ**: thời gian báo trước, vùng va chạm, sát thương, tốc độ, cân bằng giữ nguyên. Không đụng vệt chém của bé (phiên "Sửa vệt chém"), tay/kiếm/mặt, dáng chạy, chớp chuyển pha trùm, tải ảnh.

## Tóm tắt

1. **Vùng báo đỏ nhỏ hơn chỗ thật sự bị đánh** (đường thẳng, hình quạt, vòng gai): đo bằng code, phần bị đánh mà không tô đỏ là 9–26% diện tích. Đã sửa: vùng báo giờ được tô **thẳng từ hàm gây sát thương**, đo lại 0 điểm ảnh lệch ở 20 chiêu.
2. **Vùng báo vẽ mịn, sọc chéo thô, viền nét đứt** (lệch pixel art — đúng ví dụ chủ dự án nêu). Đã sửa: vẽ từng điểm ảnh như mọi hình khác.
3. **Vũng lửa / độc / băng của quái (ảnh AI) dẹt hơn và (vũng lửa) lệch xuống so với chỗ gây sát thương**: đứng phía trên mép vũng trông như ngoài vũng vẫn mất máu. Đã sửa cách dán ảnh cho khít; nên vẽ lại 4 ảnh (prompt ở mục 6).
4. **Bom của quái nổ to gần gấp đôi chỗ gây sát thương**. Đã sửa: hình nổ theo đúng bán kính bom.
5. Tường nước (Sóng thần): lối an toàn nay kéo dài suốt đường tường chạy.

Cờ tắt (thêm vào cuối địa chỉ, ghép được): `?btpx=0` (vùng báo về kiểu vẽ mịn cũ), `?vungkhop=0` (ảnh vũng dán như cũ). Ví dụ `linh-khi-nhe.html?cloud=0&btpx=0&vungkhop=0`.

## 1. Danh sách lỗi theo mức độ

| # | Mức | Nhóm | Lỗi | Tệp | Trạng thái |
|---|---|---|---|---|---|
| B1 | Nghiêm trọng | hiệu ứng / gameplay hiển thị | Vùng báo trước của **đường thẳng, hình quạt, vành khăn** nhỏ hơn vùng gây sát thương thật: thiếu dải 3 điểm ảnh quanh mép, 4 điểm ảnh sau gốc đường thẳng, vòng tròn bán kính 8 quanh gốc hình quạt (đứng sau lưng quái sát gốc vẫn bị đánh), khe an toàn của vành khăn thật ra hẹp hơn khe vẽ 3 điểm ảnh mỗi bên. Đo: 9–26% diện tích bị đánh không được tô (bảng mục 5) | `game/js/bao_truoc.js` (vẽ) ↔ `game/js/mobs.js` `G.inShape` (gây sát thương) | **ĐÃ SỬA** |
| B2 | Nghiêm trọng | sprite/asset + hiệu ứng | Bốn ảnh vũng của quái `hu-vung-quai-lua/doc/bang/do` dán theo bề ngang nên **thấp hơn vùng gây sát thương**: phần thân vũng cao 0,49 (lửa) – 0,70 (độc) bán kính, vùng thật cao 0,85 (`G.ZK`); vũng lửa còn **lệch xuống 0,36 bán kính**. Đứng ở nửa trên vùng: trông ngoài vũng, vẫn mất máu mỗi 0,5 giây | `game/js/fx.js` `pool()` + ảnh `game/art/custom/hu-vung-quai-*.sprite.json` | **ĐÃ SỬA cách dán** (ảnh nên vẽ lại, mục 6) |
| B3 | Cao (phong cách) | render | Vùng báo trước vẽ **mịn (khử răng cưa) ở lớp nét cao**, sọc chéo 1,5 điểm, viền nét đứt chạy, góc bo — lệch phong cách pixel art của cả game | `game/js/bao_truoc.js` | **ĐÃ SỬA** (cờ `?btpx=0`) |
| B4 | Trung bình | hiệu ứng | Bom quái (Sóc ném quả nổ, quái đặt bom, tinh anh "Nổ khi chết") gọi chung hình nổ của **đồ vật trên sàn cỡ 52**, trong khi vùng gây sát thương của bom chỉ 26–28 (tinh anh 44): vòng nổ, ảnh nổ AI to gần gấp đôi chỗ đau thật | `game/js/mobs.js` `blast()` → `game/js/fx.js` `propBlast` | **ĐÃ SỬA** |
| B5 | Trung bình | hiệu ứng | Sóng thần (Ngư Tinh): báo trước chỉ một dải dài 40 ở chỗ tường xuất phát; tường chạy tới 340 nhưng **lối an toàn không được vẽ tiếp** nên khó biết phải đứng thẳng hàng với khe | `game/js/bao_truoc.js` | **ĐÃ SỬA** (kiểu điểm ảnh); phần đường tường quét qua tô đỏ nhạt: mục 10 |
| B6 | Thấp | gameplay hiển thị | Vũng **của em bé** (vũng độc, vệt cháy, mưa tên): vẽ cao 0,85 bán kính nhưng luật áp hiệu ứng cho quái dùng chiều dọc ÷1,6 (≈0,63) cộng bán kính thân quái → lệch vài điểm ảnh ở mép trên/dưới | `game/js/combat.js` dòng ~990–1000 ↔ `fx.js pool()` | CHƯA SỬA (mục 4) |
| B7 | Thấp | thiết kế đòn | Vài vũng của trùm hiện ra **không có báo trước**: "Vũng lửa ma" khi Hồ Tinh bật lùi, vũng băng / lửa sau Phun băng, Quạt đuôi, Vồ lửa, vũng độc của Bão bào tử. Các vũng này nằm trong vùng đòn vừa báo nên thường đã thấy | `game/js/boss.js` | Không sửa (là cơ chế) |
| B8 | Thông tin | — | Đòn thường của quái (chém, húc, lao) không có vùng báo — theo quyết định trước của chủ dự án (`z.quiet`) | `mobs.js strikeZone` | Giữ nguyên |
| B9 | Thông tin | bài kiểm | `game/tests/bao_truoc.py` hỏng 1/21 mục "sàn quanh em bé vẫn đỏ" **ngay cả trước khi sửa**: bài đọc điểm ảnh theo toạ độ game nhưng canvas thế giới nay gấp `G.NET` = 2 lần | `game/tests/bao_truoc.py` | Lỗi của bài kiểm, không phải game; **ĐÃ SỬA bài** (mục 10) |

**Đã kiểm và thấy ổn** (không sửa): vùng **tròn** (mưa băng, rễ đâm, quả độc, vòng lửa ma, đập càng, bom) vẽ đúng hình bầu dục `G.inZone`; vùng chữ nhật; hạt nổ / lửa / băng / độc / va chạm trong `fx.js`, `fx_he.js` đều vẽ bằng ô điểm ảnh; đạn quái `fx_dan.js` vẽ điểm ảnh (quầng sáng là chấm thưa, không mờ nhoè); viền nóng quanh vũng quái đã tắt từ trước (`G.VIEN_VUNG`, lỗi "vòng quanh vũng độc"); nổ đồ vật trên sàn (lò than, nấm, tinh thể) cỡ 52 = đúng bán kính gây sát thương 52; sóng tràn `z.wave` (vẽ rộng ~14, trúng khi chân cách tâm < 6 — chạm thân là trúng, hợp lý); thời điểm: vùng báo đầy đúng lúc nổ, chớp sáng đúng khung nổ (bài `bao_truoc.py` mục "thời gian báo trước giữ nguyên" đạt). Trạng thái trên thân quái (cháy, độc, băng, đóng băng, choáng) và trên em bé: xem ảnh `anh/12-…`, không thấy che mặt bất thường ngoài chớp trắng khi trúng đòn (cố ý).

## 2. Nguyên nhân gốc

- **B1, B3, B5 — một bộ vẽ dùng chung cho mọi vùng báo** (`bao_truoc.js`, vẽ cho quái, tinh anh, trùm nhỏ, trùm vùng): nó tự vẽ lại hình học "lý tưởng" bằng nét mịn (canvas path, khử răng cưa, ở độ phân giải màn hình), **tách rời hàm quyết định có trúng hay không** (`G.inShape` trong `mobs.js` có cộng dung sai để đòn "ăn" khi chạm mép thân). Hai nơi mô tả cùng một vùng → lệch nhau; và vì vẽ mịn nên lệch phong cách. Sọc chéo và nét đứt được thêm hồi trước để người khó phân biệt đỏ–lục nhận ra vùng của quái (V31).
- **B2 — cách dán ảnh vũng giả định ảnh có tỉ lệ đúng `G.ZK`**: chỉ co theo bề ngang (`2·rx / (khung − 4)`), không đo phần có hình trong ảnh. Ảnh AI vẽ vũng nhìn nghiêng hơn (dẹt hơn) và vũng lửa đặt lệch xuống trong khung.
- **B4 — dùng lại một hàm nổ có cỡ cố định** (`propBlast` của đồ vật cỡ 52) cho bom có bán kính khác.

## 3. Đã sửa gì

| Tệp | Thay đổi | Cờ tắt |
|---|---|---|
| `game/js/bao_truoc.js` | Thêm **kiểu điểm ảnh** (mặc định): mỗi vùng báo được tính thành một mặt nạ điểm ảnh game (480×270) — một điểm ảnh được tô **khi và chỉ khi** `G.inShape` (đường thẳng, quạt, vành) / công thức của `G.inZone` (tròn, chữ nhật) nói chân em bé đứng đó sẽ bị đánh. Mặt nạ tính một lần cho mỗi vùng (vùng không đổi chỗ), chỉ trong sàn phòng. Tô: lòng đỏ trong suốt, mép sáng 1 điểm ảnh, viền tối 1 điểm ảnh bên ngoài, **chấm lưới thưa so le thay sọc chéo** (vẫn là dấu hiệu bằng hình, vòng dưới chân bé không có chấm), phần đỏ đậm lấp dần với mép trước 1 điểm ảnh, mũi chữ V chỉ hướng bằng điểm ảnh, hiện ra 3 nấc, 15% cuối sáng dần, chớp lúc nổ, đòn bị huỷ thì mờ dần. Phóng lên màn hình **không làm mịn**. Vẫn vẽ trên lớp cao và khoét chỗ thân nhân vật như trước. Tường nước: khe an toàn kéo dài tới hết đường tường chạy (`z.maxS`), đoạn kéo dài nhạt hơn, mép chấm. | `G.BT_PIXEL = false` hoặc `?btpx=0` |
| `game/js/fx.js` | `pool()`: ảnh vũng của quái được **đo một lần** phần có hình (gộp mọi khung; bề cao lấy theo thân vũng — các hàng rộng ≥ 50% — để lưỡi lửa, bong bóng nhô lên không làm sai), rồi dán sao cho thân vũng khít đúng hình bầu dục gây sát thương (rộng 2·r, cao 2·r·0,85, tâm ở tâm vùng), không làm mịn. Ảnh không đọc được điểm ảnh thì dán như cũ. | `G.VUNG_KHOP = false` hoặc `?vungkhop=0` |
| `game/js/fx.js` | `propBlast`: nhận bán kính nổ thật `pr.nr` nếu có; đồ vật trên sàn vẫn 52. | `git revert` |
| `game/js/mobs.js` | `blast()` gửi `nr: r` (bán kính bom) cho hình nổ. Không đổi vùng sát thương, vũng để lại. | `git revert` |
| `game/tests/bt_khop.py` (mới) | So từng điểm ảnh vùng báo vừa vẽ với `G.inZone`; đo phần hình kiểu cũ thiếu; chụp 34 cảnh (15 chiêu trùm vùng, 9 chiêu trùm nhỏ, tinh anh, bom 3 vùng, 4 cảnh vũng có viền vàng = vùng thật). | — |
| `game/tests/bt_hieu_ung_shots.py` (mới) | Chụp trạng thái trên thân quái / em bé, nổ bom 3 hệ (viền vàng), đòn đặc biệt 4 vũ khí, chưởng 3 hệ, em bé trúng đòn. | — |

Không đổi: thời gian báo trước, `z.t`, `z.r`, hình vùng, sát thương, nhịp gây sát thương, vùng va chạm, ảnh trong `game/art/custom`, định dạng bản lưu.

## 4. Chưa xử lý được + lý do

- **B6 (vũng của em bé lệch vài điểm ảnh)**: gốc là **luật chơi** không thống nhất (`combat.js` dùng ÷1,6 + bán kính quái; `moves.js`, `chuong.js` dùng `G.ZK`). Sửa luật là đổi cân bằng (không được phép); sửa hình riêng cho vũng của bé thì đụng phần "Độ đọc trận" (vũng của bé đang được làm nhạt, mây độc cố ý thu hình). Đề nghị chủ dự án chọn: (a) giữ nguyên; (b) cho phép thống nhất luật về `G.ZK`.
- **B2 — ảnh gốc vẫn dẹt**: cách dán mới kéo ảnh cao thêm 1,2–1,7 lần theo chiều dọc (vũng lửa nhiều nhất), ô điểm ảnh hơi cao hơn rộng. Đẹp nhất là vẽ lại 4 ảnh đúng tỉ lệ (mục 6). Khi có ảnh mới, cách dán tự đo lại, không cần sửa code.
- **Màu**: vùng báo vẫn dùng đỏ pha nhẹ theo hệ như cũ (không có bảng màu hệ thống trong code để đối chiếu từng màu); không đổi để khỏi lệch với các phiên đã duyệt.

## 5. Kiểm trước / sau

Bản HAI TỆP như web: `LK_HAI_TEP=1 python3 game/build.py --hai-tep`, phục vụ `game/dist` bằng **bản sao** của `docs/review/kiem-thu-12-10/srv.py` (gzip, ETag như Firebase) có thêm phục vụ thư mục con `anh/` và kiểu `.webp` — bản gốc chỉ phục vụ tệp ngay trong thư mục nên ảnh rời WebP của "Tải nhanh" không về được (ghi chú cho phiên giữ srv.py). Mở `linh-khi-nhe.html?cloud=0`, iPhone ngang 844×390, tỉ lệ 3, Chromium Playwright. Ảnh "trước" chụp bằng chính bản mới với hai cờ tắt (`&btpx=0&vungkhop=0`), nên cũng chứng minh cờ tắt về đúng cách cũ.

### 5.1 Vùng báo khớp vùng sát thương (đếm điểm ảnh, chỉ trong sàn phòng đang thấy)

"Cũ thiếu" = điểm ảnh bị đánh mà hình kiểu cũ không phủ. "Mới thiếu / thừa" = so tấm điểm ảnh vừa vẽ với `G.inZone` (thừa không tính viền tối 1 điểm ảnh sát mép).

| Cảnh | Chiêu | Vùng | Điểm bị đánh | Cũ thiếu | Mới thiếu | Mới thừa |
|---|---|---|---|---|---|---|
| Mộc Tinh c1 | Quật cành | quạt r118 góc 2 | 15501 | 1651 (11%) | 0 | 0 |
| Mộc Tinh c2 | Rễ đâm | 7 vòng r14 | 3342 | 0 | 0 | 0 |
| Mộc Tinh c3 | Mưa quả độc | vòng r18 | 3695 | 0 | 0 | 0 |
| Mộc Tinh c5 | Rừng gai | 3 vành có khe | 25195 | 4129 (16%) | 0 | 0 |
| Ngư Tinh c1 | Đớp | đường 98×46 | 5460 | 951 (17%) | 0 | 0 |
| Ngư Tinh c3 | Phun băng | quạt r125 góc 1 | 9326 | 1515 (16%) | 0 | 0 |
| Ngư Tinh c4 | Mưa băng nhọn | vòng r16 | 3748 | 0 | 0 | 0 |
| Ngư Tinh c5 | Xoáy nước | vòng r60 + vành 60–112 | 31222 | 1092 (3%) | 0 | 0 |
| Hồ Tinh c2 | Vồ mồi | đường 94×40 | 4645 | 884 (19%) | 0 | 0 |
| Hồ Tinh c3 | Quạt đuôi | 3 vành trăng khuyết | 14187 | 1231 (9%) | 0 | 0 |
| Hồ Tinh c4 | Vòng lửa ma | vòng r12 | 5572 | 0 | 0 | 0 |
| Nấm Chúa | Phun bào tử | quạt r64 góc 1,2 | 3325 | 871 (26%) | 0 | 0 |
| Nấm Chúa | Hàng nấm độc | vòng r14 | 3252 | 0 | 0 | 0 |
| Cua Đá | Kẹp càng | quạt r58 góc 2 | 4276 | 920 (22%) | 0 | 0 |
| Cua Đá | Đập càng rung sàn | vòng r80 | 17093 | 0 | 0 | 0 |
| Cua Đá | Mưa tinh thể | vòng r16 | 3420 | 0 | 0 | 0 |
| Hổ Lửa | Cào | quạt r58 góc 2 | 4276 | 920 (22%) | 0 | 0 |
| Hổ Lửa | Vồ lửa | đường 104×32 | 4200 | 887 (21%) | 0 | 0 |
| Hổ Lửa | Gầm phun lửa | quạt r112 góc 1,5 | 10922 | 1522 (14%) | 0 | 0 |
| Quái thường | bom r26/28, tinh anh nổ r44, mưa quả r17 | vòng | 1804–5170 | 0 | 0 | 0 |

(Ngư Tinh c2 Sóng thần là tường nước, kiểm bằng ảnh; Mộc Tinh c4, Hồ Tinh c1/c5, Nấm Chúa chiêu 2 là đạn bay, không có vùng.) Toàn bộ: **0 pageerror**, `G.fx.errs` = 0, `G.baoTruoc.errs` = 0.

### 5.2 Ảnh (trên: trước, dưới: sau; viền vàng chỉ có trong ảnh kiểm = vùng gây sát thương thật)

- `anh/01-rung-gai-truoc-sau.jpg` — Rừng gai: sọc chéo và nét đứt mịn → điểm ảnh, vành rộng đúng chỗ bị đánh.
- `anh/02-quat-canh-truoc-sau.jpg`, `04-gam-phun-lua-…`, `05-dop-…` — quạt, đường thẳng: thêm phần mép và vòng quanh gốc từng bị thiếu.
- `anh/03-song-than-truoc-sau.jpg` — tường nước: lối an toàn kéo dài theo đường tường chạy.
- `anh/06-vung-lua-…`, `07-vung-doc-…`, `08-vung-bang-…` — vũng của quái: trước lệch / thấp hơn viền vàng, sau khít viền vàng.
- `anh/09-no-bom-…`, `09b-no-bom-rung-…` — nổ bom so với viền vàng r26.
- `anh/10-bom-dang-bay-…` — vùng báo dưới bom đang bay.
- `anh/11-anh-vung-quai-so-vung-that.jpg` — 4 ảnh vũng gốc đặt trong vùng thật (vàng): tham chiếu để vẽ lại.
- `anh/12-hieu-ung-khac-ban-sau.jpg` — trạng thái trên thân quái 3 vùng, trạng thái em bé, đòn đặc biệt 4 vũ khí, chưởng 3 hệ, em bé trúng đòn (để xem bằng mắt).

### 5.3 Bài kiểm có sẵn (chạy trước và sau khi sửa, bản nguồn `game/index.html`)

| Bài | Trước | Sau |
|---|---|---|
| `tests/bao_truoc.py` | 20/21 (hỏng "sàn quanh em bé vẫn đỏ" — lỗi bài kiểm, B9) | 20/21 (cùng mục, xem B9) |
| `tests/au_bao_truoc.py` | chạy hết, thoát 0 | chạy hết, thoát 0, kết quả giống hệt trước (so từng dòng) |
| `tests/au_he.py` | chạy hết, thoát 0 | chạy hết, thoát 0 |
| `tests/au_hieu_ung.py 10` | 12 quái: vùng báo cùng lúc 4, khung giữa 17,6 ms / 95% 35,9 ms; phòng thường: 16,5 / 26,9 ms | 12 quái: vùng báo cùng lúc 4, khung giữa 16,8 ms / 95% 39,1 ms; phòng thường: 16,6 / 25,5 ms (máy chủ không GPU, dao động giữa các lần chạy cỡ này; không thấy chậm đi rõ) |

`node --check game/js/*.js`: sạch. `node game/tests/cloud_save_regression.test.js`: 7 PASS, 0 FAIL. `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep`: chạy được.

## 6. Ảnh cần vẽ lại (kèm prompt ngắn)

Bốn ảnh vũng của quái — tham chiếu `anh/11-anh-vung-quai-so-vung-that.jpg` (viền vàng = hình vũng phải có). Không vẽ lại cũng được (code đã dán khít), vẽ lại thì ô điểm ảnh vuông, đẹp hơn.

**Chung cho cả 4 (dán trước từng prompt):** "Pixel art 2D game effect, top-down 3/4 view like a cozy Vietnamese folk RPG. One ground puddle seen from above, shape is an ellipse exactly 100 px wide and 85 px tall (height = 0.85 × width), centered in a 104×104 transparent canvas, nothing outside the ellipse except tiny 1–2 px splashes. Hard pixel edges, no anti-aliasing, no blur, no glow halo, 1 px dark outline, max 16 colors. 6 looping frames in one horizontal strip, the ellipse outline stays the same size and position in every frame; only surface details move. No text, no background, no shadow below."

1. `hu-vung-quai-lua`: "…a puddle of cracked glowing lava: dark red-black crust plates with orange-yellow cracks, 3–4 small flames rising but flame tips must stay inside the top edge of the canvas and the lava body must fill the whole ellipse (not only the bottom half)."
2. `hu-vung-quai-doc`: "…a bubbling green poison bog: olive-green slime, 4–5 bubbles that swell and pop, a few dead twigs at the rim, light green highlight on the slime surface."
3. `hu-vung-quai-bang`: "…an icy water puddle: deep blue water in the middle, white-cyan frost crust around the rim, small ice shards, a slow light glint sweeping across."
4. `hu-vung-quai-do`: "…a dark red blood-colored magic puddle (no gore): red liquid with 3 glossy round blobs, darker red rim, slow ripples."

Nhập: trang `tools/tach-hieu-ung`, giữ mã tệp cũ, `goc` ở tâm khung.

## 7. Vùng chưa kiểm đủ

- Chỉ kiểm vùng báo của **những chiêu ép được bằng `G.bossDebug`** và của tinh anh / quái đặt bom ở 3 vùng; chiêu tinh anh ngẫu nhiên khác (theo dấu hiệu) chỉ đi qua cùng bộ vẽ nên khớp theo cách xây (mặt nạ lấy từ `G.inShape`), chưa chụp từng cái. Tinh anh vùng Biển không ra chiêu trong 15 giây chạy thử (cảnh `quai1-elite` trống).
- Bẫy của Thợ Săn (`trapPlace`, `trapSnap`), Cồng, Bình độc, Lướt, đòn Nện: đọc code (vẽ điểm ảnh), chưa chụp riêng.
- Máy thật iPhone: chưa thử; chỉ giả lập Chromium tỉ lệ 3. Thời gian tính mặt nạ một vùng lớn (vành 134) đo trên máy chủ không GPU: không thấy khung chậm bất thường trong `au_hieu_ung.py`, nhưng trên máy yếu khung đầu của chiêu lớn có thể chậm thêm vài mili giây (chỉ một lần mỗi vùng).
- Thứ tự lớp của hiệu ứng em bé so với viền bé (phiên Sửa vệt chém đang làm) — không kiểm.
- Chế độ không có bộ lọc SVG (máy cũ): vùng báo vẫn khoét thân nhân vật bằng hình bầu dục mềm như cũ (không đổi phần đó).

## 8. Chuyển phiên khác

- **Phần A** (nhân vật): em bé lúc vừa trúng đòn + đang đóng băng trông rất nhạt (chớp trắng + nhấp nháy bất tử + lớp băng chồng nhau, ảnh `anh/12-…` ô hàng 2 cột 1 và ô cuối) — là cố ý theo từng hiệu ứng riêng, nhưng cộng lại khó thấy dáng bé; nên xem cùng phần "viền bé".
- **Bài kiểm** `game/tests/bao_truoc.py` cần nhân toạ độ với `G.NET` ở hàm `redAt` (B9).
- **Công cụ kiểm** `docs/review/kiem-thu-12-10/srv.py` chưa phục vụ thư mục `anh/` (ảnh rời WebP).

## 9. Quay lui

- Không cần sửa code: `?btpx=0` (vùng báo kiểu mịn cũ), `?vungkhop=0` (ảnh vũng dán như cũ).
- Hoàn toàn: `git revert <mã commit của phiên này>` (ghi ở tin nhắn cuối / lịch sử git).

## 10. Bổ sung (lượt chạy thứ hai của phiên B, cùng ngày)

Lệnh rà soát phần B được chạy hai lần song song. Lượt thứ hai làm trùng phần vùng báo kiểu điểm ảnh, nên **bỏ bản của mình và giữ bản ở trên**. Lượt này chỉ đẩy thêm những phần lượt đầu chưa có.

### 10.1 Đã sửa thêm

| # | Mức | Việc | Tệp |
|---|---|---|---|
| B5b | Cao | **Sóng thần: phần đường tường sẽ quét qua chưa tô đỏ.** Tường trúng khi mép tường dày `th` quét qua (`abs(al − s) < th/2 + 3`, `G.mobWall`) trên **cả** đường từ `s` tới `maxS`, trừ khe. Bản ở trên chỉ tô đỏ dải 40 điểm ảnh đầu và kéo dài lối an toàn. Đo bằng cách đọc lớp giao diện ở màn 844×390 dpr 3: chỉ **4 032 / 25 920** điểm ảnh sẽ bị trúng có màu đỏ (84% thiếu). Nay phần đường còn lại tô **đỏ rất nhạt cộng chấm thưa**, gồm cả nửa bề dày mép tường ở hai đầu. Lối an toàn giữ nguyên, mép chấm trắng. | `js/bao_truoc.js` (`memb` loại `-4`, ô `8`; khung bao tường) |
| B9 | — | Bài `tests/bao_truoc.py` đổi toạ độ game sang điểm ảnh thật (`cw / G.W`). Trước đây điểm "thân bé không đỏ" đo sai chỗ nên luôn đạt; nay **21/21**. | `tests/bao_truoc.py` |
| B9b | — | Bài `tests/fx_check.py` so phép biến đổi gốc với `G.NET`. Trước đây báo **64 lỗi nhầm** "phép biến đổi canvas không được trả về như cũ" và mỗi phòng dừng sau 4 khung, nên kiểm hiệu ứng thực chất không chạy. Nay chạy đủ khoảng 2 400–3 000 khung mỗi phòng, **0 lỗi**. | `tests/fx_check.py` |

Bài kiểm mới:

- `tests/bt_tuong.py`: 3 bức tường (hướng, khe, bề dày khác nhau). Kết quả: không điểm nào bị trúng mà không đỏ, khe an toàn không bị tô đỏ. **Đạt 3/3.**
- `tests/bt_vung.py`: đo vũng đang gây sát thương ở lớp `#world`, bản nguồn dùng hình code.
  - Vũng quái: mép uốn ±2–3 điểm ảnh.
  - Vũng của bé: vùng trúng rộng hơn hình 11–16 điểm ảnh ngang, do cộng thân quái (khớp B6).

### 10.2 Tìm thêm, chưa sửa (lý do)

| # | Mức | Lỗi | Tệp | Lý do chưa sửa |
|---|---|---|---|---|
| B10 | Vừa | Ảnh AI hiệu ứng **xoay góc tự do và co theo số lẻ**, nên điểm ảnh không đều và rung khi vũng hay mây đang nở. Gặp ở đạn quái `hu-dan-*`, tên, chưởng, Trảm Nguyệt, vũng `hu-vung-*`. | `js/fx_anh.js FA.ve` (`rotate(goc)`, `scale(s)`); gọi từ `fx_dan.js:229/256/257`, `fx_chuong.js:92/101`, `fx_he.js:381/580` | Đã thử làm tròn cỡ theo bậc 1/8 và góc 16 hướng ngay trong `FA.ve`, rồi bỏ. `FA.ve` cũng vẽ vệt chém bám mũi vũ khí (phiên Sửa vệt chém): làm tròn cỡ sẽ lệch mũi kiếm, làm tròn góc lệch tên tới 11°. Cách gọn: **ảnh vẽ sẵn 8 hướng** (prompt bên dưới). |
| B11 | Vừa | Hiệu ứng vẽ bằng code xoay theo hướng nhắm (vệt chém, đâm, lướt, sóng búa) dùng `rotate` lên `fillRect`, nên ở góc chéo ô thành hình thoi mép mờ. | `js/fx.js drawFx` (`o.rot`, `aimed()`); `fx_he.js:417/499/582`; `fx_chuong.js:58` | Cần vẽ ra tấm phụ rồi xoay kiểu láng giềng gần nhất. Đụng `drawFx` cùng chỗ phiên Sửa vệt chém, nên để sau. |
| B12 | Vừa | Nổ ảnh AI (`hu-no-*`, `hu-trum-no-*`), cột lửa/nước, mây độc vẽ ở lớp trên nhân vật (`ly:1`), nên che em bé đứng giữa vụ nổ. | `js/fx.js` (`anh` mặc định `ly:1`, `drawOver`), `fx_he.js:472` | Đã có viền em bé vẽ đè (`G.DOC_TRAN2`). Hạ lớp nổ là đổi cảm giác đòn, cần chủ dự án quyết. |
| B13 | Nhẹ | Viền đỏ màn hình khi máu thấp dùng dải màu mịn (`createLinearGradient`) kéo giãn. | `js/fx.js:2285` | Hiệu ứng cả màn hình, không phải vật trên sàn. |
| B14 | Nhẹ | Sóng hồi máu của quái giáp vẽ elip 90×54, vùng hồi thật tròn 90. | `mobs.js:880` ↔ `mobs.js:337` | Hồi máu cho quái, không phải đòn đánh bé. |
| B15 | Nhẹ | Đạn quái trúng theo ô 7×8 quanh bóng dưới đất; đạn to (`dBig`) vẽ gấp đôi, ô trúng giữ nguyên. | `combat.js:959`, `fx_dan.js:257` | Có lợi cho người chơi; đổi là đổi cân bằng. |
| B16 | Nhẹ | Bản vẽ dự phòng `drawLine/drawCone/drawDonut` dùng đường cong có khử răng cưa. | `mobs.js` | Chỉ chạy khi tắt hẳn `G.baoTruoc`. |

**Chuyển phiên C (giao diện):** biểu tượng trạng thái và dấu tinh anh trên đầu quái (`gd-tt-troi`, `gd-quai-*`, `gd-quai-sap-danh`) vẽ qua `SC.veGd`. Hàm này **bật làm mịn** khi thu nhỏ ảnh AI ngay trên canvas thế giới, lại đặt lệch nửa điểm (`mobs.js:699`, `o = 5,5`), nên biểu tượng hơi nhoè. `SC.veGd` là hàm giao diện dùng chung (`sprite_custom.js`).

### 10.3 Ảnh cần vẽ lại cho B10 (tuỳ chọn)

Tham chiếu: `game/art/custom/hu-dan-ten.sprite.json`, `hu-dan-lua.sprite.json` và ảnh `anh/12-hieu-ung-khac-ban-sau.jpg`.

> **Tên bắn, 8 hướng:** Pixel art 2D top-down nhìn chéo, cùng phong cách ảnh tham chiếu: viền tối 1 điểm ảnh, ít màu, không khử răng cưa. Một mũi tên gỗ đầu sắt dài khoảng 22 điểm ảnh, vẽ ở 8 hướng: phải, chéo phải-xuống, xuống, chéo trái-xuống, trái, chéo trái-lên, lên, chéo phải-lên. Mỗi hướng một ô 32×32, xếp một hàng 8 ô trên nền hồng tím đặc #ff00ff. Ở hướng chéo, nét đi đúng bậc thang 1:1, không có điểm ảnh lẻ mờ. Không bóng đổ, không chữ.

> **Cầu lửa / đạn quái, 8 hướng:** Pixel art 2D, cùng phong cách ảnh tham chiếu. Một quả cầu lửa có đuôi lửa ngắn, dài khoảng 18 điểm ảnh, ở 8 hướng bay như trên, mỗi hướng 2 khung (đuôi lửa lay nhẹ). Lưới 8 cột × 2 hàng, ô 32×32, nền hồng tím đặc #ff00ff. Lõi vàng nhạt, giữa cam, mép đỏ thẫm, viền tối 1 điểm ảnh. Không khử răng cưa, không bóng đổ, không chữ.

### 10.4 Kiểm của lượt này

| bài | kết quả |
|---|---|
| `tests/bt_tuong.py` (mới) | 3/3 đạt |
| `tests/bao_truoc.py` | 21/21 (trước 20/21 vì lỗi đo) |
| `tests/fx_check.py` | 0 lỗi, chạy đủ khung (trước 64 lỗi nhầm) |
| `tests/bt_khop.py` (bài của lượt đầu, bản hai tệp) | thoát 0, 0 pageerror |
| `LK_HAI_TEP=1 python3 game/build.py --hai-tep` | chạy được |

Ảnh trước/sau của Sóng thần (lượt đầu ↔ lượt này): `anh/13-song-than-duong-quet-truoc-sau.jpg`.
