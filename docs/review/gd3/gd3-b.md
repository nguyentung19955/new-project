# Phiên gd3-b — Giai đoạn 3, Nhóm 3B (Âm thanh và cài đặt)

Nhánh: `gd3-b` (tách từ `khoi-tao-du-an` đã có GĐ1, GĐ2). **Chưa chạy bài kiểm tra nào** theo yêu cầu chủ dự án, chỉ:
`node --check` các file js đã sửa và `node game/tests/cloud_save_regression.test.js` (3 dòng PASS, giống hệt trước khi sửa).

File đã sửa: `game/js/engine.js`, `game/js/vfx_cfg.js`, `game/js/village.js` (chỉ bảng cài đặt + một dòng báo ở màn làng),
`game/js/cloud.js`, `game/web/sw.js`. Không đụng combat/moves/fx/stage/village_scene (thuộc nhóm khác).
Khoá lưu `linhkhi_save_v1` và `v: 1` không đổi. Giới hạn số tiếng cùng lúc của gd1-a (V30) giữ nguyên.

## Từng mục

| ID | Đã sửa gì | Cần kiểm tra khi test |
|---|---|---|
| **V37** (phần tiếng) | `engine.js` bảng `SFX` thêm 3 tiếng: `hitHeavy` (đòn nặng: trầm hơn, dài hơn `hit`), `crit` (chí mạng: cao, sáng, trượt xuống), `block` (đánh vào khiên: "keng" kim loại ngắn). Thêm hàm `G.sfxHit({ block, crit, heavy, hammer }, pitch)` tự chọn tiếng (ưu tiên khiên > chí mạng > búa > nặng > thường). **Chỗ gọi chưa đổi** (nằm trong `combat.js`/`moves.js` của nhóm 3C) — xem "Đề nghị" bên dưới. | Sau khi nhóm 3C nối chỗ gọi: nghe thử đánh thường / nhát 3 / chí mạng / quái có khiên; `au_phan_hoi_shots.py`, `tests/quai.py`, `tests/smoke.py`. Trước khi nối: game kêu y như cũ. |
| **V40** | `G.sfx(name, pitch, o)` nhận thêm tham số thứ ba `{ delay: giây }` (0–0,5 s) để phát trễ, dùng cho tiếng vung ở ~35% động tác. Thêm tiếng `hitHammer` (búa: rất trầm, dài 0,17 s). Không truyền `o` thì chạy y như cũ. | `au_input.py` B5 (tiếng "trúng" vẫn đúng khung). Sau khi nối chỗ gọi: tiếng vung trùng lúc lưỡi vũ khí lia, không còn sớm. |
| **V41** | Bảng Anh Mõ thêm nút **"Giảm hiệu ứng: bật/tắt"**. `vfx_cfg.js` thêm `G.applyLowFx(on)`: bật thì `G.VFX.rung` còn 0,35 và `G.VFX.hat` còn 0,5 (chớp cả màn hình trong `fx.js` nhân theo `rung` nên cũng nhạt còn ~35%); tắt thì trả đúng số cũ. **Giữ nguyên**: khựng hình, vệt vũ khí, viền sáng, viền đỏ máu thấp/trúng đòn, vùng báo đòn, chớp cảnh báo lúc quái bắn. Lưu trong bản lưu (`G.save.lowFx`, bản cũ chưa có = tắt); `G.loadSave` và `G.resetSave` tự áp lại. "Đổi tay" chưa làm (để GĐ4). | `tests/ui_input.py`, `au_onboarding.py`. Thử tay: bật → vào ải, rung/hạt ít hẳn, vùng đỏ báo đòn vẫn rõ; tải lại trang vẫn còn bật; xoá tiến trình thì về tắt. |
| **V72** | Âm lượng 3 nấc: `G.save.vol` = 0 nhỏ / 1 vừa / 2 to (hệ số 0,35 / 0,65 / 1 nhân vào độ to mỗi tiếng). Bản lưu cũ chưa có → 2 = to, nghe như trước. Bảng Anh Mõ thêm nút **"Âm lượng: nhỏ/vừa/to"** (bấm để đổi vòng, phát tiếng `pick` để nghe thử; tắt tiếng thì nút mờ). Giới hạn V30 tính trên độ to gốc nên vặn nhỏ không làm đổi số tiếng được kêu. Nhạc/âm nền chưa làm (để GĐ4). | `au_am_thanh.py` (vẫn ≤ 2 tiếng cùng loại, tổng đỉnh < 0,3 ở nấc "to"); `au_luu.py` (bản lưu có `vol`, `lowFx`; bản cũ đọc được). Thử tay: đổi nấc, tải lại trang vẫn giữ. |
| **V73** | `G.audioStart`: `resume()` khi trạng thái **khác** `running` (trước chỉ khi `suspended`; iPhone sau cuộc gọi để `interrupted`). Thêm: trang hiện lại (`visibilitychange`) thì thử bật lại tiếng ngay. | Checklist 5b: iPhone có cuộc gọi đến, nghe xong quay lại game vẫn còn tiếng. |
| **V81** | `SFX` thêm `potion` (uống bình máu, tiếng sủi lên), `door` (qua cửa phòng, trầm trượt xuống), `swap` (đổi vũ khí, ngắn đi lên), `dodge` (lộn né, "vút" trượt xuống). **Chỗ gọi chưa đổi** (trong `combat.js`, `stage.js`, `village_scene.js` của nhóm khác) — xem "Đề nghị". | `au_onboarding.py`/`au_am_thanh.py` đếm tiếng sau khi nối chỗ gọi. `G.SFX_NAMES` liệt kê mọi tiếng cho bài kiểm tra. |
| **V63** | `cloud.js` `G.persist`: nếu **tiến độ** (`progress`: sao, ải xa nhất, cấp, số vũ khí) vừa tăng so với lần lưu trước thì **đẩy lên mây ngay**, không chờ gộp 4 giây. Thêm: trang bị ẩn (`visibilitychange`, chuyển ứng dụng/tắt màn hình trên điện thoại) mà còn phần chờ thì đẩy ngay. Đổi vàng/đồ lặt vặt vẫn gộp 4 giây như cũ. | `tests/may.py` mục "luu" (6 lần đổi vàng vẫn chỉ 1 lần ghi). Thử tay: qua ải, đóng tab ngay, mở máy khác thấy sao mới. Lưu ý: nhặt thêm vũ khí (số vũ khí ≤ 30) cũng làm tiến độ tăng → ghi ngay; nếu thấy ghi quá nhiều thì bỏ phần vũ khí khỏi điều kiện. |
| **V64** | `cloud.js` `push`: lỗi `permission-denied`/`unauthenticated` → `user.getIdToken(true)` rồi ghi lại **một lần**; vẫn lỗi thì xử lý như cũ (báo ngoại tuyến, thử lại giãn dần). | Để tab mở qua đêm rồi chơi tiếp (chưa thử Firebase thật). `node tests/cloud_save_regression.test.js` (đã chạy: PASS). |
| **V65** | `engine.js` `G.persist`: ghi `localStorage` lỗi → `G.saveFail = true` (ghi được lại → `false`), in `console.warn` một lần (không dùng `console.error` để bài kiểm tra không coi là lỗi game). Màn làng hiện dòng đỏ nhỏ "⚠ Không lưu được trên máy này" sát đáy; bảng Anh Mõ hiện "⚠ Không lưu được trên máy này: tắt trang sẽ mất phần chơi mới." Biểu tượng mây ở dải tài nguyên và trong ải **chưa làm** (dải nằm trong `village_scene.js`/`stage.js`, ngoài phạm vi). | Giả `localStorage.setItem` ném lỗi → làng và Anh Mõ hiện dòng đỏ; bỏ giả → lần lưu sau dòng đỏ biến mất. Ảnh làng khi `__fbFail = true` (mây lỗi) không đổi. |
| **V74** | `web/sw.js`: lưu thêm phông Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) và thư viện Firebase (`www.gstatic.com/firebasejs/`) vào kho riêng `linhkhi-ngoai-v1` (lấy mạng trước, mất mạng dùng bản đã lưu). Các máy chủ khác (Firestore, đăng nhập) không đụng. Kho cũ `linhkhi-v1` giữ nguyên. | Checklist 5b: mở web một lần có mạng, tắt mạng, mở lại → chữ vẫn là Be Vietnam Pro. Ghi chú cho người chơi: iPhone "Thêm vào màn hình chính" có bộ nhớ riêng, cần mở một lần có mạng từ biểu tượng đó. |

### Bảng Anh Mõ (cài đặt) — bố cục mới
- Hàng 1 (y 70, cao 22): **Âm thanh: bật/tắt** · **Âm lượng: nhỏ/vừa/to** · **Toàn màn hình** (mỗi nút rộng 96).
- Hàng 2 (y 94, cao 19): **Giảm hiệu ứng: bật/tắt** (rộng 146); bên phải là chú thích "Ít rung, ít chớp, ít hạt" hoặc dòng đỏ báo lưu lỗi.
- Phần "Lưu tiến trình", Đăng nhập Google, Góp ý, Góp ý nhận được, Xoá tiến trình: **dời xuống 8–10 đơn vị** cho đủ chỗ (bài kiểm tra nào bấm theo toạ độ cũ của các nút này cần cập nhật: Đăng nhập Google/Góp ý y 142→152, Góp ý nhận được 170→180, Xoá 200→208, Thôi/Xoá hết 208→214).
- Cần chụp ảnh kiểm tra (`ui_shots.py` thẻ settings, `lang_shots.py` 16-anh-mo-cai-dat) xem chữ có tràn nút trên điện thoại không.

### Lưu mây và cài đặt máy
`vol`, `lowFx` được coi là cài đặt riêng của máy như `sound`: thêm vào `META` của `cloud.js` (đổi chúng không làm đẩy lên mây) và `apply()` giữ giá trị trên máy khi tải bản từ mây.

## Đề nghị cho nhóm khác (không tự sửa vì ngoài phạm vi file)

Nhóm 3C (`combat.js`, `moves.js`) hoặc lần gộp sau:
1. **V40 tiếng vung** — `moves.js` `begin()` (~dòng 291) và `combat.js` (~dòng 492):
   `G.sfx('swing', w.type === 'hammer' ? 0.6 : 1, { delay: P.atkT * 0.35 })` (hoặc lấy mốc chạm `P.hitAt` nếu có: `delay: P.atkDur * Math.max(0, (P.hitAt ?? 0.45) - 0.1)`).
2. **V37/V40 tiếng trúng** — `moves.js` `gain()` (~dòng 296) và `combat.js` `doHit` (~dòng 514), thay `G.sfx('hit')` bằng
   `G.sfxHit({ crit: <có chí mạng trong khung này>, block: <trúng quái có G.mobArmor(t) > 0>, heavy: <nhát 3 / giương đầy>, hammer: w.type === 'hammer' })`.
   Cần trả thêm cờ chí mạng/khiên từ `meleeBox`/`G.damage` (vd. đếm trong khung).
3. **V81** — `combat.js` ~557: `G.sfx('gong', 0.7)` khi gục; tiếng `G.sfx('warn')` **một lần** khi máu tụt qua 30%; bình máu `G.sfx('potion')`; lộn né `G.sfx('dodge')`; đổi vũ khí `G.sfx('swap')`.
   `stage.js` ~683 qua cửa: `G.sfx('door')` thay `G.sfx('swing', 0.5)`; `G.addXp` (stage.js ~47) lên cấp: `G.sfx('evolve')`.
   `village_scene.js` ~904: bỏ `G.sfx('ui')` thừa (nút dải làng kêu hai lần).
4. **V65** — biểu tượng mây nhỏ ở dải tài nguyên (`village_scene.js` `drawHud`) và trong ải (`stage.js` `drawHud`): xám khi `G.cloud.status === 'error'`, đỏ khi `G.saveFail`.

## Chưa làm / để sau
- "Đổi tay" (V41) và nhạc/âm nền (V72): Giai đoạn 4 theo TONG-HOP.
- Chưa nghe thử trên máy thật: độ to/âm sắc các tiếng mới chỉ là ước lượng ban đầu, chỉnh số trong bảng `SFX` (`engine.js`) nếu nghe chói/nhỏ.
