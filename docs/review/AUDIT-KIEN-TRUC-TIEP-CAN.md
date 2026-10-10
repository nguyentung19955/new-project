# AUDIT người mới, nội dung, âm thanh, khả năng truy cập, kiến trúc code

Phiên `au-kien-truc-tiep-can`, 10/10/2026. **Chỉ kiểm tra — không sửa dòng nào trong `game/js`, `index.html`, `build.py`, luật Firestore.**
Bản được kiểm tra: nhánh `khoi-tao-du-an` lúc gộp audit chiến đấu (`0b7aa02b`, 10/10). Đã đọc `AUDIT-VONG-LAP.md`, `AUDIT-CHIEN-DAU.md`, `AUDIT-VAN-HANH-UI.md` và **không lặp lại** những gì ở đó; chỗ nào chạm nhau thì ghi "xem AUDIT-…".

## 0. Đọc nhanh cho chủ dự án (không cần rành kỹ thuật)

1. **Ải đầu dạy được việc chính** (đi, đánh, né, đổi vũ khí, đặc biệt, rương, suối hồi, trùm) và người mới **không thể chết** ở 7 phòng đầu (game giữ máu tối thiểu 1). Đây là nền tốt.
2. **Nhưng phòng đầu tiên nhồi quá nhiều chữ một lúc**: hai khung chữ (8 dòng) hiện cùng lúc với 5 nút tròn, thanh linh khí, bản đồ, trong khi 3 con heo rừng đã lao tới sau khoảng 1 giây. Hai khung còn nói ngược nhau: "**Giữ** nút Đánh" và "**bấm** Đánh ra chuỗi 3 nhát".
3. **Nút Chưởng không được dạy ở ải đầu**; tới ải 2 mới có câu mẹo, mà lúc đó em bé chỉ có ~9 mana nên nút đang xám, bấm không được. Mẹo cách đánh của vũ khí thì **lặp lại ở đầu mọi ải**.
4. **Sau ải đầu, 6 trên 7 người làng cùng hiện chấm đỏ** và thêm một dòng nhắc chưởng: người mới không biết nên đi đâu trước. Mở Cụ Đồ thì thẻ đầu tiên báo "Còn 0 điểm", phải tự tìm thẻ thứ hai.
5. **Có một lỗi chữ dễ thấy**: tranh chọn ải ghi ải 1 và 2 có "**7 phòng**", nhưng mọi ải đều có **8 phòng** (bản đồ nhỏ ghi "Phòng 1/8").
6. **Âm thanh không có giới hạn số tiếng cùng lúc**: 20 quái chết cùng lúc là 20 tiếng giống hệt chồng lên nhau (đo được). Một tiếng "nhặt đồ" dùng cho khoảng 8 việc khác nhau; **lên cấp, chết, sắp hết máu không có tiếng riêng**.
7. **Màu chữ đọc rõ trên nền** (đo 232 dòng chữ ở 7 màn: 220 dòng đạt tương phản tốt), nhưng **88% chữ nhỏ hơn 12 px** trên điện thoại (đã ghi ở AUDIT-VAN-HANH-UI).
8. **Người khó phân biệt màu đỏ–lục** (khoảng 1/12 nam giới) sẽ khó: vòng đỏ báo đòn của quái và vòng xanh quanh em bé trở nên **cùng một màu vàng đục**; bậc vũ khí Lam/Tím trong danh sách chỉ phân biệt bằng màu chữ. Game **không có cài đặt** giảm hiệu ứng, cỡ chữ, đổi tay.
9. **Code lưu game chống hỏng tốt** (thử 618 kiểu hỏng, không lần nào mất tiến trình), nhưng nếu một chỗ trong phần sửa bản lưu bị lỗi thì cả bản lưu bị thay bằng bản mới và ghi đè ngay khi vào làng. **Bản đăng lên spiritblade.web.app không chạy bài kiểm tra nào trước khi đăng.**
10. **Ba việc nên làm trước** (mục 7): gọt lại chữ hướng dẫn và thứ tự chấm đỏ cho người mới; giữ lại bản lưu cũ khi phải sửa + cho máy đăng game chạy kiểm tra trước; giới hạn tiếng chồng nhau và thêm tiếng cho lên cấp/chết/máu thấp.

Chưa thử trên điện thoại thật, chưa nghe thật bằng tai (chỉ đếm tiếng game tạo ra), chưa thử bản trên web có đăng nhập Google (mục 8).

## Cách đo (tất cả tự chạy lại được, trong `game/`)

| Lệnh | Đo gì | Thời gian |
|---|---|---|
| `python3 tests/au_onboarding.py` | Chơi như người mới từ bản lưu trống, 844×390 cảm ứng: màn chào → làng → ải 1 (bot đánh) → kết quả → làng → các bảng → ải 2. Ảnh `docs/review/anh/onboarding/`, số liệu `onboarding.json` (chữ chỉ dẫn, dòng báo, số dòng, tiếng) | ~4 phút |
| `python3 tests/au_noi_dung.py` | Đếm nội dung thật (G.*), rà mọi chuỗi có dấu trong `js/` (đặt dấu lệch, chữ tiếng Anh, số phòng). `docs/review/anh/au_noi_dung.json` | ~20 giây |
| `python3 tests/au_am_thanh.py` | Bọc AudioContext, ghi từng tiếng: 20 quái trúng Địa Chấn / chết cùng lúc / trúng Hỏa chưởng. `au_am_thanh.json` | ~20 giây |
| `python3 tests/au_truy_cap.py` | 7 màn: cỡ chữ thật (CSS px), tương phản chữ/nền, ảnh giả lập mù màu đỏ (protan), lục (deutan), ảnh xám. `docs/review/anh/truy-cap/` | ~1 phút |
| `python3 tests/au_kien_truc.py` | Số dòng, sơ đồ phụ thuộc qua G.*, hàm dài, try/catch nuốt lỗi, tệp nào chưa có bài kiểm tra. `au_kien_truc.json` | vài giây |
| `python3 tests/au_luu_hong.py` | Làm hỏng từng trường của bản lưu (618 lần) và xem G.fixSave có xoá trắng không. `au_luu_hong.json` | ~10 giây |

Mức ưu tiên: **P0** chơi không được / mất dữ liệu · **P1** ảnh hưởng lớn tới người mới, độ rõ, độ an toàn khi đăng · **P2** đánh bóng.
Trạng thái: **A** đã xác nhận bằng máy · **B** cơ chế có thật, cần thử tay/máy thật · **C** không áp dụng. Độ khó: S nhỏ (vài dòng) · M vừa · L lớn.

## 1. Bảng vấn đề

### 1a. Người mới (onboarding)

| # | Vấn đề | Loại | TT | Bằng chứng | Ảnh hưởng người chơi | Ưu tiên | Khó | Cách sửa tối thiểu (tệp + hàm) | Rủi ro hồi quy | Cách kiểm thử |
|---|---|---|---|---|---|---|---|---|---|---|
| O1 | **Phòng đầu dạy quá nhiều một lúc**: lời chỉ dẫn 4 dòng + mẹo kiếm 4 dòng hiện cùng lúc, kèm 5 nút có chữ, 3 thanh linh khí "0/30", bản đồ; quái lao tới sau ~1 giây (ảnh 08: máu 100 → 90 sau 4 giây đứng yên) | THIẾT KẾ | A | Ảnh `onboarding/07-ai1-phong-dau.png`, `08-…`. `stage.js` `TUT.start` (dòng 61) + `moves.js` `tip()` 147–152 đặt `W.banner.tip` ngay khi vào phòng; `stage.js` drawHud 859–872 vẽ cả hai ô | Người mới không kịp đọc, bỏ qua hết chữ; dễ bỏ sót "Né" | P1 | S | `moves.js` `tip()`: không hiện mẹo vũ khí khi `S.tut` và đang ở phòng `start` (để tới phòng 2, sau khi đã đánh xong đợt đầu); hoặc trong `stage.js` drawHud chỉ vẽ ô mẹo khi `!hint` | Thấp, chỉ chữ | Chạy lại `au_onboarding.py`, ảnh 07 chỉ còn một ô chữ |
| O2 | **Chữ mâu thuẫn**: chỉ dẫn "**Giữ** nút Đánh để ra đòn" — mẹo kiếm "**bấm** Đánh ra chuỗi 3 nhát" | LỖI (chữ) | A | `stage.js` dòng 61 (`TUT.start`), `moves.js` dòng 114 (`MOVE_TIPS.sword`); trang Cụ Đồ "giữ Đánh để ra đòn liên tục" (`village.js` 610) | Người mới không biết bấm hay giữ | P2 | S | Sửa `TUT.start` thành "Bấm (hoặc giữ) nút Đánh để chém" | Không | Đọc lại chữ |
| O3 | **Nút Chưởng không được dạy ở ải hướng dẫn**; mẹo Chưởng chỉ hiện ở ải sau, **khi mana chưa đủ** (ải 2 vào với ~9 mana, nút xám, mẹo bảo bấm) | THIẾT KẾ | A | `chuong.js` 403: điều kiện `!run.tut` (bỏ qua ải 1), không xét `P.mana`. `combat.js` `buildPlayer` mana 0 lúc vào ải. Ảnh `36-ai2-5s.png` (mana 11/100, nút Chưởng xám, khung mẹo đang nói về nó) | Học xong không thử được ngay → quên; nút chưởng to ở góc nhưng bí ẩn suốt ải 1 | P2 | S | `chuong.js` dòng 403: thêm điều kiện `W.P.mana >= CH.cost(W.P)` | Không | `au_onboarding.py` ảnh ải 2: mẹo hiện lúc nút đã sáng |
| O4 | **Mẹo cách đánh của vũ khí lặp lại đầu mọi ải** (5 giây, che lề trái) | THIẾT KẾ | A | `moves.js` 129: `tips: {}` nằm trong trạng thái đòn của em bé, tạo lại mỗi ải. `onboarding.json` bước 35 (ải 2) vẫn hiện "Kiếm: bấm Đánh ra chuỗi 3 nhát…" | Chữ thừa mỗi lần vào ải, che chỗ đọc chỉ dẫn khác | P2 | S | `moves.js` `tip()`: ghi đã xem vào `G.save.tut.mv[type]` (bản lưu đã có `tut`), chỉ hiện lần đầu cho mỗi loại vũ khí | Thấp (bản lưu thêm một khoá nhỏ, `fixSave` giữ `tut` dạng đối tượng) | Vào 2 ải liên tiếp: lần 2 không còn mẹo |
| O5 | **Chỉ dẫn ở phòng trùm không khớp điều xảy ra**: "Trùm kháng hệ bạn dùng nhiều nhất…" nhưng người mới cầm kiếm Trắng thì trùm học "**Chống áp sát**" (không phải hệ) | THIẾT KẾ | A | `stage.js` `TUT.boss` dòng 67; ảnh `23-phong7-boss.png` dòng "Chống áp sát"; `boss.js` `computeLayers` (AUDIT-CHIEN-DAU #22: kiếm không hệ → Chống áp sát) | Người mới đi tìm "vật mang hệ khắc chế" không liên quan | P2 | S | Đổi `TUT.boss`: "Trùm học theo cách bạn đánh, chữ dưới tên nó cho biết nó đã học gì. Đánh vỡ vật nổ quanh phòng để gây thêm sát thương." | Không | Đọc lại chữ |
| O6 | **Sau ải 1, 6/7 người làng cùng có chấm đỏ + "!"** và dòng nhắc chưởng; không có thứ tự | THIẾT KẾ | A | Ảnh `28-lang-sau-ai1-10s.png`; `onboarding.json` bước 27: `news` = lai, xen, mo, do, may, ren. `village_scene.js` `checkNews` 500–523 bật theo từng điều kiện riêng (đủ tiền mài, có đồ mới, có điểm…) | Quá tải lựa chọn ngay sau trận đầu; khó biết nâng cấp nào thay đổi trải nghiệm (đúng mục tiêu "một lần nâng cấp có ý nghĩa" của bản góp ý) | P1 | S | `village_scene.js` `checkNews`: khi `Object.keys(sv.stars).length <= 1` chỉ bật **một** chấm theo thứ tự ưu tiên (Cụ Đồ có điểm → Lò rèn mài được → Thợ May có đồ mới → Lái Đò) | Thấp, chỉ dấu báo | `au_onboarding.py` bước 27: `news` chỉ còn 1 mục |
| O7 | **Mở Cụ Đồ thấy "Còn 0 điểm"** trong khi chấm đỏ là vì điểm **chưởng** (thẻ thứ hai) | THIẾT KẾ | A | Ảnh `29-bang-cu-do.png` (thẻ Cây kỹ năng, "Lên thêm cấp rồi quay lại"); `village.js` `open()` dòng 48 luôn mở `skill` nếu chưa chọn thẻ khác | Người mới tưởng chưa có gì để học | P2 | S | `village.js` `open()`: nếu điểm kỹ năng = 0 mà `G.chuong.pts(...).left > 0` thì mở thẻ `chuong` | Không | Mở Cụ Đồ ở cấp 2 → thẻ Cây chưởng |
| O8 | Phòng phụ ngẫu nhiên (**Bàn thờ lời nguyền**, Thử thách, Thương nhân) có thể xuất hiện ngay trong ải hướng dẫn, nói về "dấu ấn tăng gấp đôi" khi người mới chưa hiểu dấu ấn | THIẾT KẾ | A | `mapgen.js` dòng 12 `SIDE`; ải hướng dẫn chỉ ép kiểu bản đồ `A` (`stage.js` 82) chứ không ép loại phòng phụ. Lượt đo gặp Lời nguyền (ảnh `20-bang-curse.png`) | Thêm một khái niệm khó ở ải đầu | P2 | S | `stage.js` `startStage`: khi `tut`, đổi phòng phụ thành `merchant` (dễ hiểu nhất) | Thấp (bản đồ ải 1 lần đầu khác đi) | `au_onboarding.py` vài hạt giống |
| O9 | **Bình máu không được dạy** (không có câu chỉ dẫn nào), và ải 1 giữ máu tối thiểu 1 nên người mới không cần dùng; sao 2 lại thưởng việc *không* dùng | THIẾT KẾ | A | `TUT` không có câu nào về bình máu; `stage.js` 224 `hpFloor`; HELP có ("Chạm ô Bình máu để hồi máu") nhưng nằm ở trang Cụ Đồ | Lần đầu thật sự nguy hiểm (trùm ải 1, ải 2) mới phải tự phát hiện | P2 | S | Khi máu < 40% lần đầu (lưu `tut.potion`), hiện dòng mẹo "Chạm Bình máu (góc trên trái) để hồi 30% máu" bằng `W.banner.tip` như mẹo chưởng | Thấp | Thử tay |
| O10 | Dải tài nguyên ở làng hiện **9 biểu tượng toàn số 0** ngay lần đầu | Ý TƯỞNG | A | Ảnh `02-lang-vua-vao.png`; `village_scene.js` `resParts` | Thêm thứ lạ phải hiểu; (chạm vào biểu tượng có hiện tên — tốt) | P2 | S | Chỉ hiện tài nguyên đã từng có (> 0 hoặc đã gặp) | Thấp | Ảnh làng lần đầu |
| — | Điểm tốt đã xác nhận | — | A | Chỉ dẫn từng phòng (`TUT`) đều vẽ đủ, không bị cắt (đo số dòng: 3–7 dòng, đáy ≤ 174 < 186); chữ trên 4 nút chỉ hiện ở ải hướng dẫn; mũi tên "↑ Chạm để đổi vũ khí" ở phòng tinh anh; "Hết quái rồi, cửa đã mở…" khi dọn xong; gợi ý "Tới bến đò bên phải…" sau 9 giây ở làng; bản đồ chọn ải chọn sẵn ải kế tiếp; thua ở ải 1 không thể xảy ra trước trùm | — | — | — | Giữ | — | — |

Ghi chú: màn chào trên web bắt đăng nhập Google — người mở link từ Zalo/Messenger bị kẹt (P0) đã ghi ở AUDIT-VAN-HANH-UI #1, không lặp lại. Số lượt cày, nhịp tiến triển ở AUDIT-VONG-LAP.

### 1b. Nội dung và chữ

| # | Vấn đề | Loại | TT | Bằng chứng | Ảnh hưởng | Ưu tiên | Khó | Cách sửa tối thiểu | Rủi ro | Kiểm thử |
|---|---|---|---|---|---|---|---|---|---|---|
| N1 | **"7 phòng" sai**: thẻ ải 1, 2 ghi 7 phòng, thật là 8 | LỖI | A | `village.js` mapScreen dòng 167 `(i < 2 ? 7 : 8) + ' phòng'`; `mapgen.js` luôn đúng 8 phòng (dòng 276 báo lỗi nếu khác); `au_noi_dung.py`: 15/15 ải có 8 phòng; ảnh `06-ban-do-chon-ai.png` "7 phòng" vs `07-…` "Phòng 1/8" | Mất tin vào thông tin trên màn hình | P2 | S | Thay bằng `'8 phòng · '` | Không | `au_noi_dung.py` mục `so_phong` |
| N2 | **Một khái niệm hai tên**: "**linh khí**" và "**dấu ấn**" cùng chỉ một thứ (thanh 0/30 trên ô vũ khí) | THIẾT KẾ | A | Bảng kết quả "Linh khí của vũ khí … +36 Độc … Độc 36/120" ngay trên dòng "Chưa có dấu ấn" (ảnh `26-ket-qua.png`); Hành trang có thẻ "Linh khí", lò rèn ghi "Chưa có dấu ấn"; `data.js` chú thích "Linh khí (dấu ấn)" | Người mới tưởng là hai loại tài nguyên | P2 | M | Chọn một tên cho người chơi (đề xuất "linh khí", vì là tên game) rồi thay chữ hiển thị "dấu ấn" (không đổi tên biến) — rà ~30 chuỗi | Thấp (chỉ chữ), nhưng nhiều chỗ | Tìm "dấu ấn" trong chuỗi hiển thị |
| N3 | **Cùng một tên, hai cơ chế khác nhau**: "Vệt cháy", "Lây độc", "Băng vỡ" vừa là đặc trưng hệ của **vũ khí** (`G.HE_FEATURES`), vừa là nút của **cây chưởng**; "Tích lực" vừa là nút cây Hỏa chưởng vừa là cách giữ nút | THIẾT KẾ | A | `data.js` 70–82; `au_noi_dung.json` `trees` (Hỏa chưởng: Vệt cháy; Độc chưởng: Lây độc; Băng chưởng: Băng vỡ, Tích lực) | Học xong "Lây độc" ở Cụ Đồ, tưởng vũ khí cũng lây độc | P2 | S | Đổi tên nút chưởng (ví dụ "Vệt lửa chưởng", "Độc lan", "Băng nổ") | Không | Đọc bảng Cụ Đồ |
| N4 | **Ô vũ khí có hai chữ nhạt cùng lúc "Thường" (bậc) và "Trắng" (mốc tiến hóa)** | THIẾT KẾ | A | Ảnh `07-…` góc trên phải; `G.RARITY[0].name`, `G.STAGE_NAMES[0]` | Hai từ gần nghĩa ("thường", "trắng") khó hiểu | P2 | S | Ở ô HUD bỏ chữ "Trắng" khi chưa có hệ (chỉ hiện từ "Mầm") | Không | Ảnh HUD |
| N5 | **Đặt dấu thanh không thống nhất**: hoá 4 / hóa 12; khoá 33 / khóa 9; hoả 4 / hỏa 5 (ví dụ "Hỏa chưởng" nhưng "Hoả" ở chữ của trùm) | LỖI (chữ) | A | `au_noi_dung.json` `dat_dau` (chỗ: `hanh_trang.js:328`, `boss.js:175, 203`, `ban_do.js:44`…) | Nhỏ, trông thiếu chăm chút | P2 | S | Chọn một kiểu (đề xuất kiểu mới hóa/khóa/hỏa vì đang nhiều hơn ở chữ hiển thị, trừ "khoá" nên đổi theo) | Không | `au_noi_dung.py` (mục `dat_dau` không còn cặp nào) |
| N6 | **Chữ tiếng Anh "Hero"** lẫn trong chữ Việt: dải lối tắt "Hero", "Chọn hero", tiêu đề "Hero" trong Hành trang, "Đổi hero: Ông Từ", "Hero mới đã mở", "Hero · xa nhất" (Bảng vàng); trong khi tài liệu và lời thoại gọi là "em bé" | THIẾT KẾ | A | `village_scene.js` 43; `hanh_trang.js` 86, 110; `stage.js` 469; `bang_vang.js` 156 | Không nhất quán, trẻ em/người lớn tuổi khó hiểu | P2 | S | Thay bằng "Em bé" / "Đổi em bé" | Không | Đọc lại |
| N7 | **Em bé "Thợ Rèn" trùng tên người làng "Ông Thợ Rèn"** | THIẾT KẾ | A | `data.js` `HEROES.smith.name`; `village_scene.js` NPCS.ren. Dòng trên cùng làng: "Thợ Rèn · cấp 1"; bảng lò rèn: "Ông Thợ Rèn" | Nhầm em bé với người làng ("Thợ Rèn lên cấp 2!") | P2 | S | Đổi tên em bé ("Bé Thợ Rèn" hoặc "Cu Rèn") | Thấp (bảng vàng hiện tên cũ của bản lưu cũ? tên lấy theo mã nên không) | Đọc lại |
| N8 | Tên quái dễ lẫn: trùm nhỏ **"Nấm Chúa"** và tinh anh **"Nấm Phồng Chúa"** cùng vùng | THIẾT KẾ | A | `monster_art.js` (`namChua`, `namPhongChua`) | Khó nhớ con nào là trùm | P2 | S | Đổi tên trùm nhỏ (ví dụ "Nấm Mẹ") | Không | — |
| N9 | **Nội dung lặp**: vai "Gai" ở cả ba vùng đều là con **nhím** (Nhím Gai Độc, Nhím Biển, Nhím Than Hồng); 3/6 tinh anh là bản to của quái thường cùng vùng (Nấm Phồng Chúa, Cá Nóc Chúa, Hũ Lửa Chúa) | THIẾT KẾ | A | `au_noi_dung.json` `mobs`; ảnh `hinh-*-x3.png` (của AUDIT-VAN-HANH-UI) cho thấy hình mỗi con vẫn khác nhau | Ít bất ngờ khi sang vùng mới | P2 | M | Không cần làm ngay; nếu thêm hình: thay nhím ở Lâu đài bằng con khác (ví dụ "Gà Than Gai") | Thấp | — |
| N10 | **Dữ liệu trùng lặp**: mũ/áo kiểu cũ (`G.GEAR`) và trang phục mới (`outfit.js`) có món **cùng tên khác chỉ số** (Mũ sừng gỗ: kháng 40% ở `G.GEAR`, 32% ở `outfit`; Áo vỏ cây, Mũ vây cá, Áo vảy, Mũ tai cáo, Áo lông trắng, Nón lá rừng…) | THIẾT KẾ | A | `data.js` 263–287 vs `outfit.js` 30–60; `combat.js` 68–69 vẫn đọc `G.GEAR` cho bản lưu cũ | Sửa số ở một chỗ, quên chỗ kia | P2 | S | Ghi chú rõ `G.GEAR` chỉ dùng để đổi bản lưu cũ; không thêm món mới vào đó | — | — |
| N11 | Không tìm thấy lỗi chính tả rõ ràng | — | A | Rà 1 924 chuỗi có dấu, các từ chỉ xuất hiện 1 lần (187 từ) đều đúng; không có từ hai dấu thanh | — | — | — | — | — | `au_noi_dung.py` |

### 1c. Âm thanh (phần AUDIT-VAN-HANH-UI #25–26 và AUDIT-CHIEN-DAU #5, #26 chưa làm)

| # | Vấn đề | Loại | TT | Bằng chứng | Ảnh hưởng | Ưu tiên | Khó | Cách sửa tối thiểu | Rủi ro | Kiểm thử |
|---|---|---|---|---|---|---|---|---|---|---|
| S1 | **Không giới hạn số tiếng cùng lúc, không gộp tiếng trùng**: 20 quái chết cùng một khung → **20 tiếng 'die' giống hệt** (cùng 160 Hz, cùng lúc) chồng lên nhau, tổng âm lượng 0,8 (ngưỡng vỡ tiếng là 1,0); Hỏa chưởng nổ giữa bầy → 16 tiếng trong một khung | THIẾT KẾ | A | `engine.js` `G.sfx` 189–204: mỗi lần gọi tạo một bộ dao động mới, nối thẳng ra loa, không đếm. `au_am_thanh.py`: B `cungLucNhieuNhat` 20, `tongAmLuongDinh` 0,8; C 16 tiếng/khung | Tiếng to bất thường, rè khi có thêm tiếng nổ/trúng; mất cảm giác "nhiều quái chết" vì chỉ nghe một tiếng to | P1 | S | `G.sfx`: nhớ tên tiếng đã phát trong khung hiện tại (`G.time`), cùng tên trong cùng khung thì bỏ qua (hoặc chỉ tăng nhẹ âm lượng tới tối đa ×1,5); giới hạn tổng ~8 tiếng đang kêu | Thấp | `au_am_thanh.py`: B ≤ 2 tiếng 'die', tổng âm lượng < 0,3 |
| S2 | **Một tiếng cho nhiều việc**: 'pick' dùng cho nhặt đồ, đổi vũ khí, uống bình máu, dọn sạch phòng (cửa mở), chọn rương, mua hàng, mặc đồ, mang vũ khí; 'evolve' cho tiến hóa, suối hồi, mở cửa trùm, thắng (đồ rơi), vào cổng, mài, nâng bậc; 'swing' cho vung đòn, lộn né và chuyển phòng | THIẾT KẾ | A | `grep G.sfx(` (114 chỗ gọi, 15 tiếng): ví dụ `combat.js` 672 (đổi vũ khí 'pick'), 680 (bình máu 'pick' 1,4), `stage.js` 338 (dọn phòng 'pick' 0,8), 365 (nhặt đồ 'pick' 1,2), 656 né = 'swing' 0,7, 672 chuyển phòng 'swing' 0,5 | Khó nghe ra việc gì vừa xảy ra; uống máu nghe như nhặt đồ | P2 | S | Thêm 3–4 tiếng vào bảng `SFX` (engine.js 182): 'potion' (hai nốt lên), 'door' (thấp, dài), 'swap' (ngắn, cao), 'dodge' (lướt, tần số giảm) rồi đổi tên ở chỗ gọi | Thấp | Thử tay bằng tai |
| S3 | **Việc quan trọng không có tiếng riêng**: lên cấp (chỉ có tiếng 'win' chung của bảng kết quả); **em bé gục** (chỉ một tiếng 'hurt' như mọi lần trúng, bảng thua im lặng); **máu thấp** (chỉ viền đỏ nhấp nháy); **hồi xong chiêu/đủ mana chưởng**; nhận linh khí đủ mốc thì có ('evolve') | THIẾT KẾ | A | `combat.js` 557 (`P.dead`, không gọi sfx), `stage.js` 474 ('win' chỉ khi thắng), `fx.js` 1829 (máu < 30%: chỉ hình), `stage.js` `G.addXp` 47–53 (không tiếng) | Người chơi không nhìn HUD thì không biết sắp chết; trận thua kết thúc hụt hẫng | P2 | S | `combat.js` 557: `G.sfx('gong', 0.7)` khi gục; `fx.js` hoặc `combat.js` khi máu vừa qua ngưỡng 30%: một tiếng 'warn' thấp (một lần, không lặp); `stage.js` settle: lên cấp thì thêm 'evolve' 1,2 | Thấp | `au_onboarding.py` đếm tiếng |
| S4 | Đòn Địa Chấn trúng 20 quái chỉ có một tiếng nổ, không có tiếng trúng | LỖI | A | `au_am_thanh.py` A: 1 lần gọi ('boom'), 20 quái trúng. Trùng AUDIT-CHIEN-DAU #5 (đòn đặc biệt trúng im lặng) — ghi lại để đối chiếu, không đề xuất trùng | — | — | — | xem AUDIT-CHIEN-DAU #5 | — | — |
| S5 | Tiếng 'ui' phát cho **mọi** nút, kể cả nút bị khoá thì không (đúng) — nhưng nút trên dải làng gọi 'ui' **hai lần** cho một lần chạm (một lần trong `drawStrip`, một lần trong `drawHud`) | LỖI | B | `village_scene.js` 853 (`drawStrip` khi `clickable`) và 904 (`drawHud`, dải không clickable ở làng nên thực tế chỉ 904 chạy); `goNpc`→`interact` 565 gọi thêm 'ui' khi tới nơi | Hai tiếng 'ui' sát nhau khi chạm lần 2 vào khuôn mặt (tới ngay) | P2 | S | Bỏ `G.sfx('ui')` ở dòng 904 (đã có trong `interact`) | Không | Đếm tiếng khi chạm dải |
| S6 | Cài đặt âm thanh chỉ bật/tắt, lưu theo máy; không có âm lượng; không có nhạc nền | — | A | Đã ghi AUDIT-VAN-HANH-UI #25, không lặp | — | — | — | — | — | — |

### 1d. Khả năng truy cập

| # | Vấn đề | Loại | TT | Bằng chứng | Ảnh hưởng | Ưu tiên | Khó | Cách sửa tối thiểu | Rủi ro | Kiểm thử |
|---|---|---|---|---|---|---|---|---|---|---|
| T1 | **Vòng báo đòn đỏ của quái và vòng xanh quanh em bé thành cùng màu** với người mù màu lục (deutan) | THIẾT KẾ | A (giả lập) / B (người thật) | `truy-cap/vung-do-rung-deutan.png` (từ ảnh phòng đầu): vòng đỏ trên sàn và vòng lục dưới chân em bé đều thành vàng đục; ảnh xám vẫn thấy vòng nhờ độ sáng | Khó tách "chỗ nguy hiểm" và "chỗ của mình" — đúng loại tín hiệu không được phép chỉ dựa vào màu (bản góp ý mục 2.2) | P1 | S | `bao_truoc.js` (vẽ vùng báo): thêm hoạ tiết sọc chéo hoặc viền nét đứt nhấp nháy cho vùng của quái (hình dạng, không đổi màu); vòng dưới chân em bé giữ nét liền | Thấp (chỉ hình) | Chạy lại `au_truy_cap.py`, so ảnh deutan |
| T2 | **Bậc vũ khí trong danh sách chỉ bằng màu chữ** (Lò rèn, Hành trang, rương): không có chữ "Lam/Tím/Vàng"; ảnh xám thì 4 món như nhau; giả lập deutan thì Tím thành xanh lam | THIẾT KẾ | A | `truy-cap/lo-ren.png`, `lo-ren-xam.png`, `lo-ren-deutan.png`; `village.js` forge (dòng ~259 `G.weaponLine`) | Không biết món nào quý hơn | P2 | S | `G.weaponLine` (stage.js): thêm chữ bậc nhỏ ở cuối dòng phụ ("· Tím") như bảng kết quả đã làm ("bậc Thường") | Thấp (dòng có thể dài) | Ảnh xám lò rèn |
| T3 | **Sức mạnh so với khuyên dùng chỉ báo bằng màu** (xanh đủ / vàng sát / đỏ thiếu) ở số "⚔" trên tranh chọn ải và dòng HUD; protan thì đỏ và vàng gần như một màu | THIẾT KẾ | A | `truy-cap/chon-ai-protan.png`; `village.js` 135, 169 (`G.powerCol`); `stage.js` HUD "Sức mạnh 126 / khuyên 475" (ảnh `phong-danh.png` đỏ, `-protan` vàng đục) | Không biết ải có quá sức không (vẫn có hai con số để tự so) | P2 | S | Thêm ký hiệu: "⚔110 ✓" / "⚔475 !" (`G.powerCol` trả thêm ký hiệu) | Thấp | Ảnh protan |
| T4 | **Máu thấp chỉ báo bằng viền đỏ nhấp nháy** (không tiếng, không chữ) | THIẾT KẾ | A | `fx.js` 1829 (máu < 30%: viền đỏ nhịp ~0,9 lần/giây); xem S3 | Người mù màu đỏ thấy viền tối mờ | P2 | S | Cùng sửa với S3 (một tiếng cảnh báo) + thanh máu nhấp nháy sáng | Thấp | Thử tay |
| T5 | **Không có tuỳ chọn nào cho người chơi** ngoài bật/tắt tiếng và toàn màn hình: không giảm rung/chớp/hạt (chỉ có `G.VFX` trong code), không cỡ chữ, **không đổi tay** (nút đánh luôn bên phải), không chế độ dễ (chỉ có "Độ khó 2" khó hơn) | THIẾT KẾ | A | `village.js` `settings()` 637–679; `vfx_cfg.js`; AUDIT-CHIEN-DAU (dòng cuối bảng) đã đề xuất nút "Giảm hiệu ứng" | Người thuận tay trái, người nhạy ánh chớp, người mắt kém không chỉnh được | P2 | M | Thêm 2 nút ở Anh Mõ, lưu trong bản lưu: "Giảm hiệu ứng" (đặt `G.VFX.rung = 0.3, hat = 0.5`) và "Nút bên trái" (lật toạ độ x cụm nút trong `stage.js` drawHud / cần gạt trong `readInput`) | Trung bình với "đổi tay" (chạm, vùng an toàn) | `ui_input.py`, `au_onboarding.py` |
| T6 | Chớp sáng cả màn hình: **ít và ngắn** — chỉ khi tiến hóa (0,45 giây), trùm chết (0,5), chưởng tích lực (0,2), độ mờ tối đa 38%; viền đỏ máu thấp nhịp ~0,9 Hz (dưới ngưỡng nguy hiểm 3 lần/giây) | — | A (tốt) | `fx.js` 1363, 1388, 1443, 1832; `fx_ky_nang.js` 38–41; chớp gắn với `G.VFX.rung` | Không thấy rủi ro co giật | — | — | Giữ; nếu làm T5 thì nút "Giảm hiệu ứng" tắt luôn chớp | — | — |
| T7 | **Tương phản chữ/nền tốt**: 232 dòng chữ đo ở 7 màn, 220 dòng ≥ 4,5:1. Dòng thấp: chữ trang trí trên tranh chọn ải ("Núi tuyết", "sắp có" 2,8–3,0:1), số sát thương trắng trên tia lửa cam (2,5–3,2:1, có viền tối nên vẫn đọc được) | — | A (tốt) | `truy-cap/truy_cap.json` mục `te_nhat` | — | — | — | Giữ | — | `au_truy_cap.py` |
| T8 | Cỡ chữ: 204/232 dòng (88%) **nhỏ hơn 12 px**, 55 dòng nhỏ hơn 10 px, nhỏ nhất 9,4 px (844×390) | — | A | `truy_cap.json`; trùng AUDIT-VAN-HANH-UI #13 (đề xuất nâng sàn chữ) — chỉ bổ sung số liệu theo từng màn | — | — | — | xem AUDIT-VAN-HANH-UI #13 | — | — |
| T9 | **Bàn phím: đánh đủ, bảng chọn thì không** — các bảng (rương, thương nhân, bàn thờ, rương đồ, mọi bảng ở làng, nút "Ải tiếp theo") chỉ bấm được bằng chuột/chạm; bảng kết quả Esc = về làng | THIẾT KẾ | A | `stage.js` `readInput` 564–572, 616–618; `village_scene.js` 609–613; danh sách phím ở mục 5 | Máy tính có chuột nên ít ảnh hưởng; người chỉ dùng bàn phím không qua được bảng | P2 | M | Ít nhất: phím 1/2/3 chọn ô ở bảng rương, Enter = nút chính ("Ải tiếp theo", "Lên đò") | Thấp | `ui_input.py` thêm phím |

### 1e. Kiến trúc code

| # | Vấn đề | Loại | TT | Bằng chứng | Ảnh hưởng | Ưu tiên | Khó | Cách sửa tối thiểu | Rủi ro | Kiểm thử |
|---|---|---|---|---|---|---|---|---|---|---|
| K1 | **Máy đăng game không chạy bài kiểm tra nào**: GitHub Actions gói game rồi đăng thẳng lên spiritblade.web.app | THIẾT KẾ | A | `.github/workflows/linh-khi-hosting.yml`: chỉ `python3 game/build.py` rồi `firebase deploy`; 103 tệp trong `tests/` không bài nào chạy trên máy đăng | Một lỗi cú pháp/luật lọt vào nhánh là người chơi gặp ngay (màn đen) | P1 | S/M | Thêm bước trước "Gói game": `for f in game/js/*.js; do node --check "$f" \|\| exit 1; done` (có sẵn Node 22, 2 giây). Bước sau (M): `pip install playwright && python -m playwright install chromium && python3 game/tests/smoke.py && python3 game/tests/rules.py` | Thấp; bài chạy thêm 1–3 phút | Đẩy một lỗi cú pháp lên nhánh thử: máy dừng, không đăng |
| K2 | **Một lỗi nhỏ trong phần sửa bản lưu làm mất cả tiến trình**: `G.fixSave` bọc mọi thứ trong `try {…} catch (e) { return base; }` (bản lưu MỚI); làng gọi `G.persist()` ngay khi vào → ghi đè bản cũ trong máy, không giữ bản sao | THIẾT KẾ | A (cơ chế) / B (chưa thấy bản lưu thật gây lỗi) | `engine.js` 259–343 (dòng 342), `village.js` 697 (`enter` gọi `G.persist()`). `au_luu_hong.py`: 618 kiểu hỏng → **0 lần** mất tiến trình (phần sửa rất chắc); nhưng giả một lỗi trong `G.outfit.fix` → **xoá trắng** (`gia_loi_outfit_fix_xoa_trang: true`). Cùng chuyện khi `s.v !== 1` | Nếu một bản cập nhật sau có lỗi ở phần sửa (outfit, chưởng…), mọi người chơi mở game là mất hết (bản mây có thể cứu nếu đã đăng nhập) | P1 | S | `engine.js` `loadSave`: nếu có `raw` mà `fixSave` trả về bản mới (đánh dấu `base.__moi = true` trong nhánh catch/v sai), chép `raw` sang khoá `linhkhi_save_v1_hong` trước khi chơi tiếp, và `console.error` lỗi thay vì nuốt | Rất thấp | `au_luu_hong.py`: giả lỗi → còn bản sao ở khoá phụ |
| K3 | **Bản lưu chỉ có một số phiên bản (`v: 1`)**, mọi thay đổi cấu trúc được "vá" bằng cách đoán (có trường này thì đổi, thiếu thì bù) | THIẾT KẾ | A | `engine.js` 207 (`linhkhi_save_v1`), 240 (`v: 1`), 262 (`s.v !== 1` → bản mới), các nhánh chuyển đổi cũ (`tier`→`rarity`, `affix`→`affixes`, `grit`, G.GEAR→outfit) | Hiện chạy tốt (K2 đo được), nhưng càng nhiều đợt đổi càng khó biết bản lưu nào đã qua bước nào; tăng `v` sau này sẽ làm bản cũ bị xoá (dòng 262) | P2 | S | Khi cần đổi cấu trúc lần tới: đổi dòng 262 thành `s.v > 1` → giữ nguyên (không xoá) và thêm `s.v = 1` sau khi sửa; ghi một bảng "phiên bản → bước chuyển" trong chú thích | Thấp | `au_luu_hong.py`, `au_luu.py` |
| K4 | **Luật chơi nằm trong hàm vẽ**: mài, nâng bậc, mua, chọn rương, may đồ chạy ngay trong lúc vẽ nút (`if (ui.btn(...)) { pay(); w.sharpen++; G.persist(); }`) | THIẾT KẾ | A | `village.js` forge 294–304, 347, 365; `stage.js` panel rương 984–992, thương nhân 1054; `tailor.js` 123–197; bot phải "giả vẽ" để bấm (`tests/bot.js` `tap()`) | Không kiểm tra được luật mà không vẽ; dễ lỗi khi một khung không vẽ (`G.noRender`) | P2 | M | Không viết lại; mỗi lần chạm tới một bảng thì tách việc ra hàm riêng (ví dụ `G.forge.sharpen(w)`), nút chỉ gọi hàm | Thấp nếu làm từng chỗ | Bài kiểm tra gọi thẳng hàm |
| K5 | **Tệp và hàm rất dài** (xem bảng mục 6): `art.js` 3 338 dòng, 7 tệp > 1 300 dòng; hàm `stage.js` drawHud **219 dòng** (vẽ HUD + đọc chạm + chọn nút), hàm vô danh trong `mobs.js` 485 (257 dòng), `combat.js` updateWorld 138 / updatePlayer 130 | THIẾT KẾ | A | `au_kien_truc.py` | Sửa một chỗ dễ làm hỏng chỗ khác; nhiều phiên cùng sửa một tệp dễ xung đột khi gộp | P2 | — | **Không đề xuất tách ngay.** Chỉ khi sửa drawHud lần tới thì tách phần "đọc chạm nút" ra hàm riêng | — | — |
| K6 | **Trạng thái dùng chung dễ vỡ**: `G.click` được 8 tệp "tiêu thụ" (đặt null) theo thứ tự vẽ; `G.save` bị tạm thay bằng bản sao trong `upgrade.js` powerWith (có `finally` trả lại); `cloud.js` ghi đè `G.persist`/`G.loadSave` của engine.js (phụ thuộc thứ tự nạp) | THIẾT KẾ | A | `au_kien_truc.json` `G_dinh_nghia_o_nhieu_tep`: click (8 tệp), save (3), persist (2), loadSave (2), syncTaps (2), villageGo (2); `upgrade.js` 172–176 | Thêm một nút vẽ trước nút khác có thể "nuốt" mất lần chạm; một lỗi trong `fn` của powerWith không lan ra (có finally) — an toàn | P2 | — | Giữ; ghi quy tắc vào đầu engine.js: "nút nào vẽ trước được chạm trước" | — | — |
| K7 | **Nuốt lỗi im lặng**: 104 khối catch, 29 khối rỗng; quan trọng nhất `G.persist` (`engine.js` 345 "chơi không lưu"): bộ nhớ trình duyệt đầy/bị chặn thì tiến trình **không lưu mà không báo** | THIẾT KẾ | A (code) / B (máy thật) | `au_kien_truc.json` `catch_nuot_loi` (engine.js 8, cloud_ui.js 6, cloud.js 4…) | Chơi cả buổi, tắt máy là mất (nếu không đăng nhập mây) | P2 | S | `G.persist` catch: đặt `G.saveFail = true`; làng hiện một dòng "Không lưu được trên máy này" (Anh Mõ) | Thấp | Giả `localStorage.setItem` ném lỗi |
| K8 | **Dữ liệu trùng**: `G.STAGE_K.boss` giống hệt `G.STAGE_K.mob` (15 cặp số), chú thích nói là hai bảng riêng; `G.GEAR` và `outfit.js` (N10) | THIẾT KẾ | A | `data.js` 207–210 | Chỉnh trùm mà sửa nhầm bảng | P2 | S | `boss: null` → dùng `mob` khi null; hoặc ghi chú "đang bằng nhau có chủ ý" | Không đổi số | `rules.py` |
| K9 | **Vùng chưa có bài kiểm tra**: `tailor.js` (may, nâng bậc trang phục: 0 bài nhắc tới), `portal.js`, `hero_art.js`/`env_art.js` (chỉ hình), `cloud_ui.js` (1); chưa có bài cho luồng người mới (nay có `au_onboarding.py`), cho chữ tràn ở mọi bảng, cho tiếng | THIẾT KẾ | A | `au_kien_truc.json` `bai_kiem_thu_nhac_toi` | Sửa Thợ May dễ lọt lỗi tiêu tiền/mất đồ | P2 | M | Một bài `tests/tho_may.py`: may 1 món, nâng bậc, kiểm tra trừ đúng nguyên liệu và món còn trong kho | — | — |
| — | Điểm tốt | — | A | Vòng lặp bước cố định 1/60 giây, `requestAnimationFrame` đặt trước khi chạy để một lỗi lẻ không đứng game (`engine.js` 457); bản lưu chống hỏng tốt (K2); `build.py` tự kiểm tra bản gói (không địa chỉ ngoài, không tệp test); mỗi tệp tự bọc trong một hàm, chỉ chia sẻ qua `G.*`; có 103 tệp kiểm tra | — | — | — | — | — | — |

## 2. Dòng thời gian người mới (844×390 cảm ứng, bản lưu trống, mở tệp trên máy nên không có đăng nhập)

Ảnh trong `docs/review/anh/onboarding/`. Giây tính theo đồng hồ game.

| Bước | Ảnh | Game dạy gì / người mới thấy gì | Nhận xét |
|---|---|---|---|
| Màn chào (0 s) | `01-man-chao.png` | Logo, câu giới thiệu, "Chạm để bắt đầu", nút Đăng nhập Google + Bảng vàng, dòng "chỉ lưu trên máy" | Rõ ràng. Trên web thật phải đăng nhập (AUDIT-VAN-HANH-UI #1) |
| Làng (2 s) | `02-lang-vua-vao.png` | Toast "Kéo bên trái để đi. Chạm vào một người để nói chuyện." (9 giây); 7 khuôn mặt lối tắt có chữ; 3 chấm đỏ (Vào ải, Kỹ năng, Cài đặt); 9 tài nguyên toàn 0 | Ổn; dải tài nguyên chưa cần (O10). Chấm đỏ ở "Kỹ năng" vì cấp 1 đã có 1 điểm chưởng |
| Làng (11 s) | `04-lang-sau-10-giay.png` | Toast đổi thành "Tới bến đò bên phải, gặp Chú Lái Đò để vào ải" | Tốt: chỉ đúng một việc |
| Chọn ải (14 s) | `06-ban-do-chon-ai.png` | Tranh vùng, ải 1 chọn sẵn, thẻ: trùm nhỏ, **7 phòng** (sai, N1), hệ Độc, sức mạnh khuyên 100 / bé 98 (màu vàng), thưởng bằng biểu tượng, nút "Lên đò" | Nút chính nổi bật. "Sức mạnh" chưa được giải thích nhưng có hai số để so |
| Phòng 1 (15 s) | `07-ai1-phong-dau.png` | Chỉ dẫn: đi, giữ Đánh, Né, hết quái thì cửa mở + mẹo kiếm (Đánh, Né rồi đánh, Trảm Nguyệt); 4 nút có chữ (Đánh, Né, Trảm Nguyệt, Chưởng) | Quá nhiều chữ cùng lúc, "giữ" vs "bấm" (O1, O2) |
| Phòng 1, đứng yên 4 s | `08-ai1-dung-yen-4s.png` | 3 heo rừng đã vây, máu 90/100 | Không chết được (máu tối thiểu 1) — an toàn |
| Phòng 1 dọn xong | `10-phong0-start-xong.png` | "Sạch bóng quái!", chỉ dẫn đổi thành "Hết quái rồi, cửa đã mở. Đi vào cửa có mũi tên…", cửa hai bên sáng có mũi tên | Rất rõ |
| Phòng 2 (đánh quái) | `11-…`, `12-…` | "Đánh vỡ chậu than để đốt quái. Kết liễu quái đang cháy thì kiếm nhận dấu ấn Lửa." Thanh linh khí Lửa lên 4/30 | Dạy hệ + linh khí đúng lúc; "dấu ấn" và "linh khí" hai tên (N2) |
| Phòng 3 | `13-…`, `14-…` | "Thanh xanh là mana. Đủ 25 mana thì bấm Đặc biệt…" | Tốt |
| Phòng tinh anh | `15-phong3-elite.png` | "Quái tinh anh mang hệ. Chạm ô vũ khí… để đổi sang cung" + mũi tên vàng "↑ Chạm để đổi vũ khí" chỉ đúng ô | Tốt nhất trong các bước: có mũi tên chỉ chỗ |
| Rương | `18-bang-chest.png` | Ba lựa chọn: Nỏ Thần (vũ khí), 5 quặng (chỉ biểu tượng + "Dùng để mài vũ khí ở lò rèn"), Bùa Lửa | Rõ |
| Bàn thờ lời nguyền | `20-bang-curse.png` | "Nhận lời nguyền này để mọi dấu ấn … tăng gấp đôi" | Khái niệm khó cho ải đầu (O8) |
| Suối hồi | `21-phong6-fountain-xong.png` | Hai suối "Hồi máu"/"Hồi mana", dòng "Trùm đã học: Chống áp sát", có "Rương đồ" không được giải thích | Chỉ dẫn 5 dòng, vẽ đủ |
| Trùm (Nấm Chúa) | `23-phong7-boss.png`, `24-…` | Tên trùm + thanh máu, nhãn "Chống áp sát", chỉ dẫn "Trùm kháng hệ bạn dùng nhiều nhất…" (7 dòng, ô hẹp), tinh thể băng hai bên | Chỉ dẫn lệch với điều trùm học (O5); ô chữ 7 dòng hẹp |
| Kết quả | `26-ket-qua.png` | Sao (2/3), thưởng bằng biểu tượng, thẻ vũ khí, "Thợ Rèn lên cấp 2!", "Kỷ lục mới: Sức mạnh 102", khối Linh khí, 3 nút (nổi nhất: "Ải tiếp theo ▶") | Đầy đủ; "lên cấp" không có tiếng riêng (S3) |
| Về làng | `27-…`, `28-lang-sau-ai1-10s.png` | 6 chấm đỏ + "!" trên đầu 4 người, toast "Có điểm chưởng! Gặp Cụ Đồ…" | Quá tải (O6) |
| Cụ Đồ | `29-bang-cu-do.png` | Thẻ Cây kỹ năng "Còn 0 điểm", chấm đỏ ở thẻ Cây chưởng | O7 |
| Lò rèn | `30-bang-lo-ren.png` | 5 thẻ (Mài, Nâng bậc, Tôi lại, Rèn đồ, Nâng lò), danh sách vũ khí, "Chọn một vũ khí để mài" | Nhiều thẻ nhưng lời Ông Thợ Rèn dẫn đúng việc đầu |
| Hành trang | `33-hanh-trang.png` | 6 thẻ, chỉ số đầy đủ, "Hero", "Đổi hero: Ông Từ" | Chữ "Hero" (N6) |
| Ải 2 | `35-ai2-vao.png`, `36-ai2-5s.png` | Không còn chữ trên nút; mẹo kiếm lặp lại; mẹo Chưởng khi nút đang xám | O3, O4 |

**Thứ tự dạy thực tế**: di chuyển, đánh, né (phòng 1) → hệ, linh khí/dấu ấn (phòng 2) → mana, Đặc biệt (phòng 3) → tinh anh, đổi vũ khí (phòng 4) → rương, bùa hệ, quặng → lời nguyền / thương nhân / thử thách (ngẫu nhiên) → suối hồi, "trùm học" → trùm, vật nổ hệ → kết quả, sao, linh khí → (làng) chưởng, lò rèn, kỹ năng, may đồ, hành trang cùng lúc. **Không bao giờ được dạy**: bình máu, Chưởng (trong ải 1), rương đồ, bản đồ to (chỉ một câu), cây kỹ năng (chỉ chấm đỏ).

## 3. Kiểm kê nội dung (đếm từ `G.*` khi game chạy, `au_noi_dung.json`)

| Loại | Số lượng | Chi tiết / nhận xét |
|---|---|---|
| Vùng | 3 (+3 "sắp có" trên tranh: Núi tuyết, Núi lửa, Đầm lầy) | Rừng già (Độc), Hang biển (Băng), Lâu đài cổ (Lửa) |
| Ải | 15 (5/vùng) + độ khó 2 sau khi đủ 15 ải | Mọi ải 8 phòng (AUDIT-VONG-LAP đã nói về lặp phòng) |
| Loại phòng | 9 | Bắt đầu, Đánh quái, Tinh anh, Rương, Suối hồi, Trùm, Thương nhân, Thử thách, Lời nguyền |
| Vai quái | 9 | xông, bầy, khiên, xạ thủ, nhanh nhẹn, cảm tử, đặt bom, gai, tinh anh |
| Quái có hình riêng | 36 | 24 thường (8 vai × 3 vùng), 6 tinh anh, 3 trùm nhỏ (Nấm Chúa, Cua Đá, Hổ Lửa), 3 trùm vùng (Mộc Tinh, Ngư Tinh, Hồ Tinh). Mỗi con có kiểu đòn riêng (lao, chém, đập, ném, bắn, nổ, gai, phun) — **không phải chỉ đổi màu**. Lặp: vai gai = nhím ×3; 3/6 tinh anh = bản to của quái thường (N9) |
| Vùng 1 mở dần vai | ải 1: 4 vai; ải 2: 6; ải 3: 8 | `stage.js` buildWaves 116–119 |
| Dấu hiệu tinh anh | 4 | Nhanh, Bọc giáp, Nổ khi chết, Hút máu |
| Em bé | 4 | Thợ Rèn, Thợ Săn, Thầy Lang, Đô Vật (mở bằng hạ trùm vùng) |
| Loại vũ khí / dòng | 4 / 40 | Mỗi loại 10 dòng tên dân gian (Kiếm Tre, Gươm Rồng, Mã Tấu, Đoản Kiếm Đông Sơn…; Nỏ Thần, Cung Đàn Bầu, Cung Đèn Ông Sao…; Đinh Ba, Mái Chèo, Bút Lông…; Chày Giã Gạo, Chiêng Đồng, Trống Đồng…). Dòng chỉ khác hình/tên (AUDIT-VONG-LAP đã ghi) |
| Bậc / mốc tiến hóa | 4 / 4 | Thường, Lam, Tím, Vàng / Trắng, Mầm, Thành hình, Thức tỉnh |
| Dòng phụ / dòng mạnh | 3 / 3 | mana, chí mạng, tầm / Diệt yêu, Thấm hệ, Mở màn |
| Đặc trưng hệ | 6 | Vệt cháy, Nổ lan, Vũng độc, Lây độc, Gai băng, Băng vỡ |
| Trang phục | 37 món, 5 ô | mũ 9, áo 10, đeo lưng 6, cầm tay 8, cánh 4; 3 bộ theo vùng |
| Bùa (kiểu cũ) | 5 | Hút máu, Tàn lửa, Sương, Tham, Linh (nay là "tác dụng cũ" của trang phục cầm tay) |
| Cây kỹ năng | 3 nhánh × 5 = 15 nút | "Sát thương +8%" xuất hiện 2 lần trong nhánh Công |
| Cây chưởng | 3 cây × 6 = 18 nút | Hỏa, Độc, Băng chưởng; trùng tên với đặc trưng vũ khí (N3) |
| Lời nguyền | 3 | Máu −20%, Không bình máu, Quái nhanh 15% |
| Người làng | 7 | Chú Lái Đò, Ông Thợ Rèn, Bà Hàng Xén, Cô Thợ May, Cụ Đồ, Ông Từ, Anh Mõ |
| Trang hướng dẫn (Cụ Đồ) | 11 trang, 22 mục | Có trang hình về linh khí |
| Mẹo (HINTS) / mẹo vũ khí | 10 / 4 | |
| Chuỗi có dấu trong code | 1 924 | |

**Danh sách lỗi chữ cụ thể** (để sửa một lượt):
1. `village.js` 167: "7 phòng" (ải 1, 2) → "8 phòng" (N1).
2. `stage.js` 61 `TUT.start`: "Giữ nút Đánh để ra đòn" mâu thuẫn `moves.js` 114 "bấm Đánh ra chuỗi 3 nhát" (O2).
3. `stage.js` 67 `TUT.boss`: nói "kháng hệ" trong khi trùm ải 1 thường học "Chống áp sát" (O5).
4. Đặt dấu lệch (N5): "hoá" ở `hanh_trang.js:328`, `monster_art.js:1915, 1977, 2043` (12 chỗ khác viết "hóa"); "Hoả" ở `boss.js:175, 203`, `monster_art.js:2026, 2041` (5 chỗ khác "Hỏa", gồm tên "Hỏa chưởng"); "khoá" 33 chỗ / "khóa" 9 chỗ (`data.js:329`, `mapgen.js:315–318`, `minimap.js:176`, `village.js:222`…); "tuỳ" (`stage.js:536`, "đi dạo tuỳ ý").
5. Chữ tiếng Anh "Hero" (N6): `village_scene.js:43` ("Chọn hero", "Hero"), `hanh_trang.js:86` ("Đổi hero"), `:110` (tiêu đề "Hero"), `:291` và `tailor.js:79` ("hero từ cấp 5"), `stage.js:469` ("Hero mới đã mở"), `bang_vang.js:156` ("Hero · xa nhất").
6. Hai tên một khái niệm "linh khí" / "dấu ấn" (N2); tên trùng "Vệt cháy", "Lây độc", "Băng vỡ", "Tích lực" (N3); "Thợ Rèn" em bé / "Ông Thợ Rèn" người làng (N7); "Nấm Chúa" / "Nấm Phồng Chúa" (N8).
7. `village.js:629` (Cụ Đồ, "Đặc trưng hệ theo cấp"): còn vế "quái thường 0% rơi viên linh khí" — đã ghi AUDIT-VONG-LAP 4.3c.
8. "mana" là chữ tiếng Anh nhưng game thủ quen dùng — giữ.

## 4. Bảng âm thanh

15 tiếng tổng hợp (một bộ dao động mỗi tiếng, `engine.js` 182–188), 114 chỗ gọi `G.sfx`.

| Tiếng | Tần số, dạng sóng, dài | Dùng cho (chỗ gọi chính) | Nhận xét |
|---|---|---|---|
| hit | 220 Hz vuông, 0,05 s | trúng quái (`moves.js` 267, `combat.js` 499, 839, 911) | Đòn đặc biệt trúng thì không có (AUDIT-CHIEN-DAU #5) |
| swing | 520 Hz tam giác, 0,04 s | vung đòn, **lộn né** (656), **chuyển phòng** (`stage.js` 672), quái vung (`mobs.js` 387, 394) | Một tiếng cho 3 việc (S2) |
| hurt | 110 Hz răng cưa, 0,12 s | em bé trúng đòn (`combat.js` 547) | **Gục cũng chỉ tiếng này** (S3) |
| mark | 1 040 Hz sin | vũ khí nhận linh khí (`combat.js` 51), cao dần theo tiến độ | Hay |
| evolve | 660 Hz, lên ×2 | tiến hóa, mài, nâng bậc, nâng lò, học kỹ năng, suối hồi, mở cửa trùm, thắng (đồ rơi), vào cổng | 9 việc (S2) |
| warn | 330 Hz vuông | quái xuất hiện (`stage.js` 165), trùm ra chiêu, xạ thủ ngắm, cảm tử, hero chưa mở | |
| gong | 98 Hz sin, 0,6 s | trùm xuất hiện (`stage.js` 269), trùm đổi pha (`boss.js` 343), nhận lời nguyền | Đúng việc lớn |
| pick | 780 Hz sin | nhặt đồ, **đổi vũ khí**, **uống bình máu**, **dọn sạch phòng/cửa mở**, chọn rương, mua, mặc đồ, mang vũ khí, ếch kêu ở làng | 9+ việc (S2) |
| die | 160 Hz vuông | quái chết (`combat.js` 338) | 20 con chết cùng lúc = 20 tiếng chồng (S1) |
| fire / poison / ice | 300 / 180 / 1 400 Hz | quái dính hệ (`combat.js` 288–304) | Có hệ thì có tiếng riêng — tốt |
| boom | 70 Hz răng cưa, xuống ×0,5 | nổ khói, sốc nhiệt, chưởng, Địa Chấn, vỡ giáp, tinh anh nổ | |
| ui | 600 Hz vuông, 0,03 s | mọi nút bấm (`engine.js` 420, `ui_theme.js` 96) | Nút dải làng có thể kêu hai lần (S5) |
| win | 880 Hz, lên ×2 | bảng thắng (`stage.js` 474) | Không có tiếng thua |

**Không có tiếng**: lên cấp, em bé gục / bảng thua, máu xuống dưới 30%, đủ mana chưởng / hết hồi chiêu, mở rương (chỉ có khi chọn xong), nhặt vàng ở bảng kết quả.
**Giới hạn tiếng cùng lúc**: không có (S1). **Âm lượng**: chỉ bật/tắt, lưu trong bản lưu trên máy (AUDIT-VAN-HANH-UI #25). Tiếng chỉ phát khi trang có `AudioContext` đang chạy — được mở bằng cú chạm/phím đầu tiên (`engine.js` 175–181).

## 5. Bảng khả năng truy cập

| Hạng mục | Kết quả | Chỗ / ảnh |
|---|---|---|
| Thông tin chỉ bằng màu | **Có**: vùng báo đỏ vs vòng xanh dưới chân (T1), bậc vũ khí trong danh sách (T2), sức mạnh đủ/thiếu (T3), máu thấp (T4). **Không**: bậc trên bảng kết quả có chữ "bậc Thường"; 3 hệ trên thanh linh khí có biểu tượng hình khác nhau (lửa, giọt, bông tuyết) | `truy-cap/*-protan.png`, `*-deutan.png`, `*-xam.png` |
| Cỡ chữ nhỏ nhất (844×390) | 9,4 px; 88% dòng < 12 px | `truy_cap.json` (xem AUDIT-VAN-HANH-UI #13) |
| Tương phản chữ/nền | 220/232 dòng ≥ 4,5:1; thấp nhất là chữ trang trí trên tranh (2,8:1) và số sát thương trên tia lửa | T7 |
| Chớp sáng | ít, ngắn, ≤ 38% độ mờ, nhịp máu thấp ~0,9 Hz (< 3 Hz) | T6 |
| Tuỳ chọn tắt rung/chớp | Không cho người chơi (chỉ `G.VFX` trong code) | T5 |
| Giảm hiệu ứng / chế độ dễ / đổi tay | Không / chỉ ải hướng dẫn giữ máu 1 / Không | T5 |
| Bàn phím (máy tính) | Đi: mũi tên hoặc WASD · Đánh: J, Z, Space (giữ được) · Né: K, X, Shift trái · Đặc biệt: L, C · Chưởng: I, V (giữ để tích lực) · Đổi vũ khí: Q, Tab · Bình máu: E, H · Tạm dừng: Esc, P · Bản đồ: M · Ở làng: Nói chuyện J/Z/Space/Enter, Hành trang B, Esc đóng bảng · Màn chào: Enter/Space/J. **Thiếu**: chọn trong bảng rương/thương nhân/bàn thờ/rương đồ/kết quả/mọi bảng ở làng (chỉ chuột) | T9; trang "Bàn phím" ở Cụ Đồ chỉ liệt kê một phím mỗi việc |
| Âm thanh thay cho hình | Thiếu cho máu thấp, gục, lên cấp (S3) | — |

## 6. Sơ đồ module và vùng chưa có bài kiểm tra

43 tệp, 30 753 dòng JS. Mỗi tệp tự bọc trong `(function () { … })()` và chỉ nói chuyện với nhau qua đối tượng chung `window.G`. Thứ tự nạp do `index.html` quyết định (build.py giữ đúng thứ tự).

```
data.js (số liệu: hệ, vũ khí, em bé, quái, vùng, giá)          ← 34 tệp dùng
  └─ engine.js (khung vẽ, xoay, chạm/phím, âm thanh, LƯU GAME, vòng lặp, nút/chữ cơ bản)   ← 37 tệp dùng
       ├─ HÌNH VẼ: art.js(3338) · weapon_art.js(2333) · hero_art.js · hero_tinhlinh.js · env_art.js
       │           monster_art.js(2317) · room_art.js · sprite_custom.js · btn_art.js · ui_theme.js
       ├─ LUẬT TRẬN: combat.js (người chơi, sát thương, hệ, quái chung; ← 25 tệp dùng)
       │           moves.js (đòn từng vũ khí) · chuong.js · boss.js · mobs.js · bao_truoc.js
       │           linhkhi.js · outfit.js · do_roi.js · upgrade.js (sức mạnh, gợi ý nâng cấp)
       ├─ HIỆU ỨNG: vfx_cfg.js → fx.js(1856) → fx_he.js · fx_dan.js · fx_chuong.js · fx_ky_nang.js
       ├─ MÀN ẢI:   stage.js (ải, phòng, HUD, bảng rương/kết quả) · mapgen.js · minimap.js · portal.js
       ├─ LÀNG:     village_scene.js (cảnh, đi lại, dải mặt) · village.js (bảng người làng, màn chào)
       │           tailor.js · hanh_trang.js · ban_do.js · chuong_ui.js · bang_vang.js
       └─ MÂY:      firebase-config.js → cloud.js (ghi đè G.persist/G.loadSave) → cloud_ui.js
main.js (khởi động: nạp bản lưu → màn chào → vòng lặp; đăng ký sw.js)
```

| Tệp lớn nhất | Dòng | Hàm dài nhất | Dòng |
|---|---|---|---|
| art.js | 3 338 | `hoDraw` (vẽ Hồ Tinh) | 190 |
| weapon_art.js | 2 333 | — | — |
| monster_art.js | 2 317 | hàm vô danh dòng 2055 | 259 |
| fx.js | 1 856 | `drawFx` | 139 |
| room_art.js | 1 566 | `ambLive` | 122 |
| env_art.js | 1 426 | — | — |
| hero_tinhlinh.js | 1 332 | `pose` | 99 |
| stage.js | 1 189 | **`drawHud`** (vẽ + đọc chạm + nút) | 219 |
| combat.js | 1 026 | `G.updateWorld` / `G.updatePlayer` | 138 / 130 |
| mobs.js | 741 | hàm vô danh dòng 485 (hành vi quái) | 257 |

**Đã có bài kiểm tra** (103 tệp trong `tests/`): luật hệ/dấu ấn/sao (`rules.py`), cân bằng và cày (`cay.py`, `balance.py`, `dps.py`), bản đồ (`mapgen.py`), cửa (`doors.py`), quái (`quai.py`), chưởng (`chuong.py`), hành trang (`hanh_trang.py`), trang phục (`trang_phuc.py`), lưu mây (`may.py`, `may_luat.test.js`), giao diện chạm (`ui_input.py`, `ui_robust.py`), hiệu năng (`perf.py`), các bài `au_*` của 4 phiên audit.
**Chưa có hoặc gần như chưa có**: `tailor.js` (may/nâng trang phục — 0 bài), `portal.js` (0), `main.js` (0), `hero_art.js`, `env_art.js` (chỉ hình, 0), `cloud_ui.js` (1), `fx_he.js`/`fx_chuong.js`/`fx_ky_nang.js` (1 mỗi tệp, chủ yếu chụp ảnh). **Không có bài nào chạy tự động khi đăng game (K1).** Chưa có bài kiểm tra chữ tràn ở mọi bảng và kiểm tra tiếng (nay có `au_am_thanh.py` đo số tiếng).

## 7. Ba việc nên làm trước (trong phạm vi phiên này)

1. **Gọt lại 10 phút đầu cho người mới (O1–O7, N1) — P1, toàn việc nhỏ (S), chỉ đổi chữ và điều kiện hiện**. Phòng đầu chỉ một khung chữ; sửa "giữ/bấm", câu ở phòng trùm, "7 phòng"; mẹo Chưởng chỉ hiện khi đủ mana; mẹo vũ khí chỉ lần đầu; sau ải 1 chỉ một chấm đỏ theo thứ tự (Cụ Đồ mở thẳng thẻ Cây chưởng). Đúng tiêu chí bản góp ý: "dẫn người mới qua một trận ngắn, một lần nâng cấp có ý nghĩa, rồi mới mở rộng". Kiểm tra lại bằng `au_onboarding.py`.
2. **Chặn hai đường mất tiến trình/hỏng game hàng loạt (K1, K2) — P1, S**. Máy đăng chạy `node --check` cho mọi tệp JS (rồi dần thêm `smoke.py`, `rules.py`); `loadSave` giữ bản sao bản lưu cũ trước khi buộc phải thay bằng bản mới. Hai thay đổi nhỏ, không đụng lối chơi, bảo vệ mọi người chơi trước lỗi của các phiên sau.
3. **Âm thanh rõ hơn với ít công sức (S1–S3) — P1/P2, S**. Gộp tiếng trùng tên trong cùng khung (20 quái chết = 1–2 tiếng), thêm tiếng riêng cho bình máu, cửa mở, lên cấp, gục, máu thấp. Chỉ sửa `engine.js` `G.sfx`/bảng `SFX` và vài chỗ gọi. Việc này cũng giúp người khó nhìn màu (T4).

(Nếu còn sức: T1 — thêm hoạ tiết sọc cho vùng báo đòn để người mù màu đỏ–lục tách được với vòng của em bé.)

## 8. Những gì chưa xác minh được

- **Chưa thử trên điện thoại thật**, chưa thử Safari iPhone. Mọi số đo ở Chromium giả lập 844×390, mật độ 2.
- **Chưa nghe bằng tai**: chỉ đếm và đo thời điểm, âm lượng ban đầu của từng tiếng game tạo ra; không đánh giá được tiếng hay/dở, có rè thật không.
- **Chưa thử luồng người mới trên web thật** (spiritblade.web.app bắt đăng nhập Google): bài chạy bằng tệp trên máy nên không có mây, màn chào là "Chạm để bắt đầu".
- Phần đánh trong ải 1 do **bot** chơi (`tests/bot.js`), không phải người: bot đi đủ phòng phụ, mở rương, bỏ qua lời nguyền; người thật có thể đi thứ tự khác, gặp phòng phụ khác (thương nhân/thử thách).
- **Máy kiểm tra không tải được phông Be Vietnam Pro** (giống AUDIT-VAN-HANH-UI) → độ rộng chữ, số dòng chữ có thể khác chút ít trên máy thật.
- Giả lập mù màu bằng ma trận Machado 2009 (mức nặng nhất) trên ảnh chụp; **chưa có người mù màu thật xem**. Tương phản đo trên nền lấy bằng cách tạm ẩn chữ (nền có thể lệch nhẹ vì cảnh làng có cử động), chữ có bóng/viền tối nên đọc thực tế dễ hơn số đo.
- K2: cơ chế "lỗi nhỏ → mất cả bản lưu" xác nhận bằng **giả lỗi**; 618 kiểu hỏng tự nhiên không gây mất — chưa tìm được bản lưu thật nào làm `fixSave` ném lỗi.
- K7: chưa thử trình duyệt chặn bộ nhớ thật (Safari riêng tư cũ, bộ nhớ đầy).
- Không đo hiệu năng hay đăng nhập/lưu mây (phiên `au-van-hanh-ui`), không đo cảm giác đánh (phiên `au-chien-dau`), không đo vũ khí/hệ/trùm chi tiết (phiên `au-vu-khi-he`).
