# Báo cáo RUN – Lam 3/4, 8 khung · 12 FPS · loop – **vòng 2** (sửa 4 điểm theo review)

Phạm vi: đúng 4 mục ChatGPT yêu cầu, chỉ trong `proto-lam/proto.html` (các chỉnh **chỉ bật khi animation là Run** qua `lam.datCheDo('run')`) và `proto-lam/xuat-run.py` (thêm so sánh vòng 1/vòng 2, kiểm Idle trùng pixel). **Giữ nguyên:** 8 khung, 12 FPS, pivot [32,63], quỹ đạo hai chân, rig, camera (xoay 22°, nhìn xuống 12°), tỉ lệ, toon 3 tông, hậu kỳ pixel, bảng 12 màu, alpha 0/255, viền ngoài 1 px. Không làm Jump/Fall/Attack; không đụng `game/demo.html`, `game/lib/*`, `art/sprite/*`, `tools/*`, `game/xem-thu/anim2d.html`.

Ảnh để xem: **`so-sanh-v1-v2-x4.png`** (vòng 1 trên / vòng 2 dưới, 8 khung), `run-x4.png` / `run-x8.png`, `run.gif` (×4, lặp vô hạn), `silhouette.png`, `quy-dao-chan.png`, `chong-silhouette.png`, `idle-run-idle.gif`, `trong-game.png`, `lat-check.png`, `anim2d-check.png`. Số liệu: `kiem-tra.json` (khoá mới: `mauChan`, `vatAoGan`, `soVoiVong1`, `idle`, `chuong.dinhDayChamMuMoiKhung`). Bản vòng 1 giữ ở `vong1/` (run-0..7.png, run-x4.png, kiem-tra.json). Sheet: `game/anim/lam-proto.png` (hàng 0 idle – trùng từng pixel `lam-idle-proto.png`; hàng 1 run mới) + `lam-proto.anim.json` (không đổi nội dung).

## Mục 1 – Chân xa sáng hơn một bậc (chỉ màu trong bảng) – ĐẠT

*Làm gì:* đổi ramp toon của quần xa + ủng xa đúng **một bậc trong bảng** (`vien→ao0`, `ao0→ao1`): quần xa `['vien','ao0','ao0']` → `['ao0','ao1','ao1']`, ủng xa `['vien','ao0','ao0']` → `['ao0','ao1','ao1']`. Chỉ đổi 3 uniform màu khi đặt khung Run (`datMauChanXa(true)`); bias, ID, hình học, chân gần giữ nguyên. Không thêm màu: vẫn 12 màu kể cả trong suốt, `mauNgoaiBang = []`.

*Trước → sau (pixel quần + ủng chân xa theo mặt nạ ID, `kiem-tra.json → mauChan`):*

| Khung | Vòng 1 | Vòng 2 |
|---|---|---|
| F0 | #1A212B ×36, #0C0F14 ×10 | **#212835 ×36**, #0C0F14 ×7 (viền trong), #1A212B ×3 |
| F1 | #1A212B ×9, #0C0F14 ×8 | #212835 ×9, #0C0F14 ×6, #1A212B ×2 |
| F2 | #1A212B ×32, #0C0F14 ×12 | #212835 ×32, #1A212B ×7, #0C0F14 ×5 |
| F3 | #1A212B ×48, #0C0F14 ×7 | #212835 ×48, #1A212B ×7 |
| F4 | #1A212B ×50, #0C0F14 ×8 | #212835 ×50, #1A212B ×8 |
| F5 | #1A212B ×40, #0C0F14 ×11 | #212835 ×40, #0C0F14 ×7, #1A212B ×4 |
| F6 | #1A212B ×26, #0C0F14 ×11 | #212835 ×26, #0C0F14 ×7, #1A212B ×4 |
| F7 | #1A212B ×40, #0C0F14 ×11 | #212835 ×40, #1A212B ×7, #0C0F14 ×4 |

Tổng 8 khung: chân xa **#0C0F14/#1A212B (≈ 78 / 281 px)** → **#212835 ×281, #1A212B ×42, #0C0F14 ×36** (phần #0C0F14 còn lại là viền trong giữa chân xa và chân gần/áo). Chân gần không đổi: #1A212B ×307, #212835 ×163, #2C3546 ×31. Chân xa không còn trùng bậc màu tối nhất của áo choàng/viền; hai chân khác nhau cả về màu lẫn viền trong nên đọc được chân trước/sau ở mọi khung (xem `so-sanh-v1-v2-x4.png`, rõ nhất F0/F2/F4/F6).

## Mục 2 – Vạt áo choàng phía gần vén lên 2–3 px khi chạy – ĐẠT (có ghi chú thật)

*Làm gì:* cột 0–5 của lưới áo (mép trước bên gần camera → gần lưng) rút chiều dài mỗi đoạn theo `AO_VEN_RUN = [0.26, 0.26, 0.24, 0.20, 0.14, 0.07, 0]` (vén/ngắn vạt gần), chỉ khi Run (`lam.aoVen`); Idle `aoVen = null`. Bên xa và lưng (cột 6–18) không đổi → áo vẫn xoè sau 22–25 px, 3 vạt rách còn nguyên.

*Trước → sau – hàng gấu vạt gần (hàng thấp nhất của áo trong cột 18–34, sát hai chân) và số hàng chân lộ dưới gấu đó tới đất (`vatAoGan`, `soVoiVong1.gauVatGanVenLenPx`):*

| | F0 | F1 | F2 | F3 | F4 | F5 | F6 | F7 |
|---|---|---|---|---|---|---|---|---|
| gấu vạt gần vòng 1 | 55 | 56 | 57 | 56 | 55 | 56 | 56 | 56 |
| gấu vạt gần vòng 2 | 53 | 54 | 54 | 53 | 53 | 54 | 54 | 53 |
| **vén lên (px)** | **2** | **2** | **3** | **3** | **2** | **2** | **2** | **3** |
| hàng chân lộ dưới gấu vòng 1 → 2 | 8→10 | 7→9 | 6→9 | 7→10 | 8→10 | 7→9 | 7→9 | 7→10 |

*Ghi chú thật:* render thử **ẩn áo choàng** (lớp `ao`) và so mặt nạ ID với bản có áo cho thấy ở vòng 1 áo choàng thực tế **không che pixel chân nào** (chỉ 1 px vạch ủng gần ở F3). Phần đùi/gối bị che là do **gấu áo thân (thân xanh + quần hông)**, không phải vạt áo choàng. Vì vậy vén vạt gần làm vùng chân tách khỏi khối áo trong silhouette thêm 2–3 hàng (số ở bảng trên, kiểm trên `silhouette.png`/`chong-silhouette.png`), nhưng **số pixel chân gần (ID) từng khung không tăng** (18/18/24/20/25/18/21/15 như vòng 1). Muốn thấy thêm gối thật sự phải ngắn gấu áo thân khi chạy – ngoài 4 mục, chưa làm, chờ duyệt.

## Mục 3 – Dây chuông bám mép mũ ở mọi khung – ĐẠT

*Làm gì:* gốc dây (neo trong hệ ngực) **dời theo mũ khi thân nghiêng**: mỗi độ nghiêng thêm so với idle (`lean − 3°`, run = 16° ± 0,5°) dời neo `(+0,0026, +0,0012, 0)` đơn vị → tổng ≈ (+0,034, +0,016) ≈ 1,5 px tới trước, 0,7 px lên; đồng thời chuông ngả sau thêm `CH_REST_RUN = 0,20 rad` chỉ khi Run để thân chuông không bị kéo sát mũ. Dời này dùng cả trong mô phỏng con lắc (gia tốc neo) và khi dựng, chỉ khi `cheDoRun`; Idle lean 3–4° nhưng cờ tắt nên không đổi.

*Trước → sau (`chuong.dinhDayCachMuPx` = số pixel nền giữa đỉnh dây và mũ cùng hàng về phía trước; `khoangCachToiMu` = pixel nền giữa thân chuông và mép lưng mũ):*

| | F0 | F1 | F2 | F3 | F4 | F5 | F6 | F7 |
|---|---|---|---|---|---|---|---|---|
| đỉnh dây cách mũ vòng 1 | 2 | 2 | 1 | 1 | 1 | 2 | 1 | 1 |
| **đỉnh dây cách mũ vòng 2** | **0** | **0** | **0** | **0** | **0** | **0** | **0** | **0** |
| đỉnh dây kề pixel mũ (8 lân cận) | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| dây (px) vòng 1 → 2 | 7→4 | 6→3 | 5→5 | 6→4 | 3→4 | 5→3 | 3→4 | 4→5 |
| thân chuông cách mũ vòng 1 → 2 | 3→2 | 3→2 | 3→2 | 3→2 | 2→2 | 2→1 | 2→2 | 3→2 |

Đỉnh dây giờ ở cột 27 (vòng 1: 25–26) đúng mép lưng mũ, dây liền (liên thông 8) 3–5 px ở mọi khung, chuông 26–28 px, **không xuyên mũ** (`khongXuyenMu = true`, ≥ 1 px nền, F5 là 1 px), không trùm mặt. Dao động chuông **1,0 px ngang / 0,8 px dọc** (vòng 1: 1,2 / 1,0) – trong mốc 1–2 px, hình chuông không biến dạng (26–28 px/khung).

## Mục 4 – Giảm biên độ gió nhấp – ĐẠT

*Làm gì:* `gio` −2,5 → **−1,5** × sin(4πt/T) (`RUN.gioNhap`); gió nền 2,2·v giữ nguyên nên áo vẫn bay hẳn ra sau.

*Trước → sau:* đuôi áo (pixel trái nhất) dao động **x 4 / y 4 px → x 3 / y 2 px**; hàng gấu 55–57 (2 px) → 54–56 (2 px); góc đoạn cuối áo 0,29–0,85 rad → 0,41–0,77 rad (vẫn + góc tĩnh 0,62 → bay sau ≈ 60–80°); xoè sau 21–25 px → 22–25 px (`bayRaSau = true`). Sai khác pixel khung kề **612/737/669/644/605/720/639/632 → 588/693/666/625/586/698/658/608** (hai cặp lớn nhất F1→F2, F5→F6 giảm 44/22 px); khép vòng F7→F0 = 608 ≤ max → không nổi bật. Pha vẫn trễ 1 khung so với thân (áo cao nhất F0/F4, thân cao nhất F3/F7). Lệch khép vòng mô phỏng 0,0005 px.

## Xác nhận GIỮ NGUYÊN (số đo `kiem-tra.json`)

- **Quỹ đạo hai chân:** mắt cá/mũi/gót 2 bàn chân (3D chiếu) so với `vong1/kiem-tra.json`: lệch tối đa **0,000 px** ở cả 8 khung (`soVoiVong1.lechQuyDaoChan3DPxToiDa = 0`); đáy ủng theo mặt nạ gần [62,63,63,63,60,58,59,62], xa [60,56,59,62,62,63,63,63] – y hệt vòng 1; `datHang63 = true`; dịch x mũi −4,23/−4,56/−4,91 (gần), −4,37/−4,60/−4,70 (xa); sải 6,3 / 6,2 px.
- **Pivot** `pivotRender = [32,63]` 8/8 khung; lật (`lat-check.png`, pivotLat [31,63]) lệch 0/0/0, 0 pixel sai ở 8 khung; anim2d "Kiểm lật" ĐẠT, "Phát 20 vòng" 800 bước, nối 7→0 liền.
- **Màu/alpha:** 12 màu kể cả trong suốt, 0 màu ngoài bảng, alpha chỉ 0/255, viền ngoài 1 px, viền trong theo ID.
- **Nhún/tay/kiếm:** hông 1,77 px, đỉnh mũ 2 px; tay xa 3,63 px, tay gần 4,91 px, đối pha; kiếm liền tay ở 8 khung, không kề áo choàng, lưỡi 33–37 px, góc lưỡi y như vòng 1.
- **Idle V3 trùng từng pixel:** `xuat-run.py` render lại 6 khung idle từ cùng trang (sau khi đã sửa) và so với `out/idle/idle-0..5.png`: **0 pixel khác ở cả 6 khung** (`idle.trungPixel = [true×6]`), và trùng hàng 0 của `game/anim/lam-idle-proto.png` (`trungSheetIdleProto = true`). Hàng 0 sheet `lam-proto.png` cũng trùng từng pixel `lam-idle-proto.png` (kiểm riêng bằng PIL, 6/6 ô). `xuat-idle.py`, `out/idle/*` không đổi.
- Chuỗi Idle → Run → Idle: hàng 63 idle ủng cột 28–40, run F0 35–38, F7 30–41 – cùng vùng đất như vòng 1.

## Thẳng thắn – điểm còn yếu

1. **Mục 2 chỉ "đúng chữ", chưa đúng ý.** Vạt áo choàng gần đã vén 2–3 px nhưng không lộ thêm pixel gối/đùi nào vì áo choàng vốn không che chân; cái che là gấu áo thân + quần hông (hàng ≈ 50–54). Chân vẫn chỉ đọc được từ hàng 50–54 xuống. Nếu muốn thấy gối thật, vòng sau cần cho phép ngắn gấu áo thân/quần hông 2–3 px khi Run (Idle giữ nguyên bằng cùng cơ chế `cheDoRun`).
2. **Ủng xa giờ sáng hơn ủng gần** (#212835 vs #1A212B) vì dịch nguyên một bậc cả quần lẫn ủng; đọc trước/sau dựa vào chồng lấp + viền trong chứ không còn theo quy ước "xa tối hơn". Nếu muốn giữ quy ước, ủng xa có thể lấy ramp `['ao0','ao0','ao1']` (bằng ủng gần) – nhưng khi đó hai ủng trùng màu.
3. **Chuông sát mũ hơn:** thân chuông cách mép mũ 2 px (F5: 1 px) thay vì 3 px như idle/vòng 1, và dây ngắn còn 3 px ở F1/F5 (mốc ≥ 3). Dây treo nghiêng hơn (chuông ngả sau thêm 0,2 rad) nên nhìn như bị gió thổi – hợp khi chạy nhưng khác tư thế idle rõ hơn trước.
4. F2/F6 ("ngang nhau") hai ủng vẫn chồng thành một khối tối 8 px rộng; vạch cổ ủng xa vẫn bị che ở F1–F2; đùi xa chỉ 1 px ở F6 – như vòng 1.

## Cách chạy lại

`python3 proto-lam/xuat-run.py` (≈ 9 s; `--xem` chỉ in số liệu + `run-x8.png`; lần đầu tự lưu `vong1/` nếu chưa có), rồi `python3 proto-lam/build.py` để cập nhật `proto.build.html` (tab **Run 64**). Tham số vòng 2 trong `proto.html`: `MAU_CHAN_XA.run`, `AO_VEN_RUN`, `DAY_THEO_MU`, `CH_REST_RUN`, `RUN.gioNhap` (có thể ghi đè qua `PROTO.TUY` khi dò số).
