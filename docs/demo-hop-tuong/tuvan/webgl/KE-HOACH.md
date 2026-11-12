# Chuyển phần vẽ màn trận sang WebGL — kế hoạch + trạng thái

Hướng đã chốt (người dùng 11/11): giữ tranh 2D, vẽ bằng GPU theo 4 đợt — (1) quái + thanh máu + đạn · (2) ụ / bệ / sao / tấm đếm · (3) hiệu ứng · (4) ánh sáng + vật lý cho hiệu ứng.
Lý do: ~95% thời gian khung là tô canvas 2D (~1 100 `drawImage` / khung ở cảnh co-op cuối trận), mô phỏng chỉ ~1,3% (xem `../hieu-nang/BAO-CAO.md` Đợt 4).

**Đợt 1 đã làm (11/11)** — số đo ở cuối tệp và `GAMEPLAY.md`.

## 1. Cách tắt / bật

| | |
|---|---|
| `?gl=0` | tắt hẳn (vẽ 2D như trước, không tạo canvas mới) |
| `?gl=1` | ép bật kể cả GPU phần mềm (máy đo, máy ảo) |
| không tham số | BẬT nếu tạo được ngữ cảnh WebGL **có GPU thật** (`failIfMajorPerformanceCaveat`) và tự kiểm (vẽ 3 ô, đọc lại điểm ảnh) đạt; không thì vẽ 2D như cũ |
| `?glv=1` | ép WebGL1 (mặc định thử WebGL2 trước; shader chung GLSL ES 1.0) |

Tắt mặc định cho mọi người: đổi `MAC_DINH = false` trong `thap/js/gl/glr.js`. Không dùng localStorage. `GLR.thongTin()` (console) cho biết đang bật hay không + lý do; `<html data-gl="0|1|2">`.
Mất ngữ cảnh (`webglcontextlost`): ngay khung sau REN vẽ 2D như cũ (2 canvas GL ẩn đi); `webglcontextrestored`: dựng lại shader / bộ đệm / texture rồi vẽ GL tiếp.

## 2. Cấu trúc lớp (DOM, dưới → trên)

```
#cv-nen   2D  nền tĩnh (khay + đường) — như cũ
#cv       2D  dòng chảy, cổng/lõi, nhãn bàn, vùng phủ dưới quái, Ụ (veO + lớp bọc), hình sự kiện trên ụ (VX.veDs, vùng hỗ trợ, khoanh/viền kéo ghép)
#cv-gl    GL  QUÁI (+ bóng, quầng trạng thái, vòng/dấu trùm) → lưới DRAG NET → TIA LASER → ĐẠN (+ vệt) → THANH MÁU          ← mới
#cv-tren  2D  lớp hiệu ứng (đổ alpha 0,88, khoét quanh quái + khoét ô thanh máu), huy hiệu sao, ụ đang kéo, chữ số, HUD lõi, chớp màn   ← mới
HUD DOM
```

`#cv-gl`, `#cv-tren` chỉ được tạo khi GL bật; cùng cỡ + cùng phép biến đổi gốc (tỉ lệ, rung màn) với `#cv`. `REN.ve0` hỏi `GLR.khung()` mỗi khung:
`true` → `cq = GLR.x` (quái/laser/đạn/thanh máu), `ct = GLR.xTren` (phần sau đạn); `false` → `cq = ct = ctx` (y như trước).
Trạng thái "dính" của ngữ cảnh 2D (phông, canh chữ, màu…) được chép qua lại giữa `#cv` và `#cv-tren` ở các điểm chuyển (`GLR.chep`) để 2 canvas nối nhau như 1 ngữ cảnh.

### Chỗ thứ tự lớp KHÁC bản 2D (đợt 1, có chủ ý — hết khi ụ + hiệu ứng sang GL)

Bản 2D vẽ 1 canvas theo thứ tự: dưới → quái → ụ → laser → đạn → lớp hiệu ứng → thanh máu → sự kiện ụ → huy hiệu → chữ. Lớp GL là 1 tấm nên không thể xen giữa từng bước:

1. **Quái nằm TRÊN ụ** (trước: dưới). Đường và bàn ụ tách nhau nên chỉ khác khi thân trùm to lấn mép ô ụ.
2. **Hình sự kiện trên ụ** (`VX.veDs`: sao lên mốc, kỹ năng ghép, dây liên kết; vùng hỗ trợ; khoanh/viền kéo ghép) vẽ ở `#cv` → nằm **dưới** quái/đạn/lớp hiệu ứng (trước: trên). Lý do: quầng `lighter` của chúng phải cộng sáng lên thân ụ; vẽ ở canvas trong suốt phía trên thì quầng bị đục (đã thử, thấy rõ). Khác thấy được khi một vụ nổ/hiệu ứng trùng đúng ô ụ đang loé (quầng nằm dưới hiệu ứng).
3. **Ảnh cộng sáng của lớp GL đè lên thân ụ** (chớp đầu nòng của đạn/laser ngay trên ụ) hoà kiểu alpha với ụ chứ không cộng thật (ụ ở canvas khác). Trên đường/nền thì y hệt.
4. **Thanh máu**: vẫn đè lên hiệu ứng như cũ nhờ khoét lớp hiệu ứng đúng ô thanh máu (trước: vẽ sau lớp hiệu ứng). Khác: trong ô thanh máu không còn 25% bóng hiệu ứng sau nền thanh.
5. `?diu=0` (chế độ so cũ): thanh máu nằm dưới hiệu ứng.
6. Lệnh vector trong nhóm quái (chỉ khiên lăng kính của trùm Prism: `moveTo/lineTo/fill/stroke`) được chuyển tiếp sang `#cv-tren` → nằm trên đạn/thanh máu (trước: giữa thân trùm và ụ).
7. Mép ô ảnh thẳng trục: bám tâm điểm ảnh (giống Chrome; Safari khử răng cưa mép → lệch < 1 điểm ảnh thiết bị ở mép thanh máu).

## 3. Module `thap/js/gl/glr.js` (API)

- `GLR.x` — **ngữ cảnh thay thế** cùng tập lệnh canvas 2D mà phần vẽ ảnh của trận dùng: `drawImage` (3/5/9 tham số; nguồn `Image` / `Canvas` / `ImageBitmap`),
  `save/restore`, `translate/rotate/scale/transform/setTransform/resetTransform/getTransform`, `globalAlpha`, `globalCompositeOperation` (`source-over`, `lighter`),
  `beginPath + rect + clip` (cắt hình chữ nhật, cắt đa giác + nội suy UV), `imageSmoothing*` (bỏ qua). Tự giữ ngăn xếp ma trận, đẩy ô ảnh vào lô theo ma trận hiện hành
  → **hàm vẽ cũ chỉ cần nhận `GLR.x` thay cho `ctx`** (`REN.veQuai(cq)`, `REN.veDan(cq)`, `PX.ve`, `REN.anhGiua`, `REN.tia`…), toạ độ trận giữ nguyên.
- **Lệnh không phải ảnh** (`fill/stroke/arc/moveTo/lineTo/fillRect/fillText/…`): chuyển tiếp sang `#cv-tren` với đúng ma trận + kiểu vẽ hiện hành (hình đúng chỗ, nhưng nằm trên mọi ảnh GL)
  và **đếm theo nhóm** ở `GLR.thieu[nhóm][lệnh]` (`GLR.nhom` do REN đặt: `quai / luoi / laser / dan / thanh`). `gradient/measureText/setLineDash` mượn ngữ cảnh 2D. `clearRect/putImageData/getImageData`, `clip` theo đường không phải chữ nhật, kiểu hoà màu khác: bỏ qua + đếm.
- `GLR.sprite(img, x, y, w, h, goc, alpha)` — vẽ ảnh tâm (x, y) cho code mới.
- Canvas đệm: nội dung tĩnh sau khi dựng → tự vào atlas ở lần vẽ đầu. **Vẽ lại mỗi khung** → đặt `c._glD = 1` lúc tạo (texture riêng, tải lại ở mỗi lần vẽ; canvas nháp `REN.nhap` tự nhận). **Thỉnh thoảng vẽ lại** → gọi `GLR.ban(c)` sau khi vẽ (đánh dấu bẩn, lần vẽ kế tải lại đúng chỗ cũ).
- Gom lô: ảnh ≤ 512² điểm vào atlas 2048² (≤ 3 trang, xếp kệ, lề 1 điểm; đầy → dọn ở đầu khung sau, ≤ 1 lần / 600 khung); ảnh lớn = texture riêng (không dùng > 600 khung thì trả bộ nhớ GPU).
  1 lệnh vẽ GL = dãy ảnh liền nhau cùng texture + cùng kiểu hoà màu. Shader: lấy mẫu kẹp trong ô nguồn (không lem khung bên cạnh, như canvas), khử răng cưa mép ô xoay, alpha nhân sẵn, `highp` ở fragment.
- `GLR.khung(REN, k, rx, ry)` / `GLR.xong()` — đầu / cuối phần GL của khung; `GLR.ghiVung()` — ghi khung bao ảnh vừa vẽ (khoét dưới thanh máu); `GLR.chep(a, b)`; `GLR.dem` = `{ lenh, o, tai, px }` của khung; `GLR.thongTin()`.
- Nạp: thẻ `<script src="js/gl/glr.js">` trong `<template id="tm-nap">` của `index.html`, trước `render.js`. Service worker không có danh sách tệp (lưu theo yêu cầu) → không phải sửa `sw.js`; `tools/dieu-phoi/thap-ver.py` quét cả thư mục con `js/`.

## 4. Đã chuyển / để lại

**Đợt 1 — đã sang GL:** bóng quái, thân quái (dải khung, hoà 2 khung, lật, nén/giãn, quái "code" lăn/nảy), chớp trắng trúng đòn, xác nổ, quầng trạng thái + dấu trạng thái v2 (chậm/độc/cháy/choáng/đóng băng/suy yếu…),
12 trùm (code-anim nhiều phần rời, rig nhiều lớp, canvas tạm quay 3D, cắt vành/hoa lửa), vòng chân + dấu trên trùm (`TVF.veVongTrum/veTrenTrum`), dây báo chiêu trùm, lưới DRAG NET, tia laser + điểm cháy, đạn mọi loại (ảnh xoay, vệt, đạn v2, bóng đạn cong), thanh máu quái + trùm.

**Để lại 2D:**
- đợt 2: ụ (`REN.veO/veU`, bệ, viền bậc, sao, tấm đếm, vòng hồi chiêu, dấu trên ô), nhãn bàn, cổng/lõi, dòng chảy, huy hiệu, kéo ghép;
- đợt 3: vùng phủ dưới quái (`HU[*].duoi`, hố đen), lớp hiệu ứng trên (`HU[*].ve`, `REN.veFx`, chữ ký Đỏ/Vàng, P2/P3…) + khoét mềm quanh quái + đổ lớp, `VX.veDs`, chữ số sát thương (`veChu`), chớp màn, khiên lăng kính Prism (vector);
- đợt 4: ánh sáng / vật lý hạt (mới).

## 5. Bao nhiêu lệnh vẽ của ụ / hiệu ứng đi thẳng qua được ngữ cảnh thay thế?

Đo bằng `DEM=1 tools/thap-kt-hieunang-coop.js` (đếm mọi lệnh vẽ của 1 khung theo nhóm, bản 2D, 4 cảnh nặng): xem bảng "Lệnh vẽ theo nhóm" ở mục 7.
| 1 khung, bản 2D | A | B | C | D |
|---|---|---|---|---|
| ụ: `drawImage` / lệnh không-ảnh | 181 / 0 | 243 / 0 | 227 / 0 | 86 / 0 |
| hiệu ứng (`HU[*].ve` + `veFx`): `drawImage` / không-ảnh | 265 / 0 | 343 / 8 | 152 / 0 | 132 / 3 |
| khoét + đổ lớp hiệu ứng (`destination-out`) | 74 | 69 | 13 | 112 |
| quái + thanh máu + lưới + đạn (đã sang GL) | 389 / 0 | 379 / 0 | 415 / 0 | 554 / 0 |

Kết luận ngắn: **ụ 100%**, **hiệu ứng 97,7–100%** lệnh vẽ là `drawImage` với kiểu hoà màu `source-over` / `lighter` (gần như không có `fill/stroke/chữ/clip/filter/bóng` mỗi khung — game đã chuyển sang ảnh PNG tô màu từ trước) → về **loại lệnh** thì truyền `GLR.x` là chạy, phần lệnh không-ảnh lẻ được chuyển tiếp 2D. Việc phải làm tay ở đợt 2–3 không nằm ở lệnh vẽ mà ở:

1. **Canvas đệm đổi nội dung** phải đánh dấu: tấm đếm trên ụ (vẽ lại tại chỗ), ảnh chữ số (`chuSo/chuAnh`), các canvas nháp của hiệu ứng → `GLR.ban(c)` hoặc `_glD`. Sót = hình cũ.
2. **Lớp hiệu ứng + khoét**: `gopLop` dùng `destination-out` (72 lệnh/khung ở cảnh A) + đổ lớp alpha 0,88 → sang GL phải vẽ hiệu ứng vào framebuffer riêng rồi đổ (hoặc bỏ lớp, hạ alpha từng ảnh — đổi hình). Đây là phần việc chính của đợt 3.
3. **Thứ tự xen kẽ** ụ ↔ quái ↔ hiệu ứng: chừng nào còn 1 nhóm ở 2D thì còn các lệch ở mục 2 → **nên gộp đợt 2 + 3 thành một** (cùng vào GL thì thứ tự đúng tuyệt đối, bỏ được `#cv-tren` trừ chữ vector hiếm).
4. Lệnh vector hiếm (không gặp ở 4 cảnh đo nhưng có trong code): khiên Prism, vài hình `?debug`, hiệu ứng ít gặp — chạy rà `GLR.thieu` qua bộ ảnh 93 ụ + 12 trùm trước khi chuyển.
5. Bộ nhớ: atlas hiện ≤ 3 × 16 MB GPU; ụ + hiệu ứng thêm nhiều ảnh lớn (dải 16 khung) → cần tính lại ngân sách texture cho iPhone.

## 6. Tách luật trận khỏi phần vẽ (ghi nhận, CHƯA sửa)

Chỗ luật còn phụ thuộc nhịp vẽ / đồng hồ khung vẽ (cần xử lý trước khi nghĩ tới vẽ ở luồng khác hoặc bỏ khung vẽ):
- `growfx.js` `VX.bien` (dòng ~194): `VX.hen(0.2 | 0.52 s, () => { if (… T.cd > 0.02) T.cd = 0.01; })` — hẹn theo đồng hồ hiệu ứng `VX.t` (cộng `dt` khung vẽ ở `REN.ve` → `VX.cap`) rồi **ghi vào hồi chiêu ụ** → luật offline phụ thuộc nhịp vẽ.
- `trumvfx.js`: ghi `T.st.ngamK` (tên dấu ngắm) từ phần hình — chỉ để render biết ô do TVF vẽ, không vào luật, nhưng nằm trong `T.st`.
- `REN.noiSuy/traLai`: mỗi khung vẽ tạm ghi đè `E.x/y/gv/tChet`, `d.x/y/z`, `T.goc/rx`, `o.t`… rồi trả lại — đúng khi vẽ và luật cùng luồng, không ai đọc giữa chừng.
- `quaianim.js` / `render.js`: trong lúc vẽ gọi `Math.random()` (pha khung `E._ph`, hạt độc) và `FX.no/FX.hat1/FX.vong1` — chỉ hình, nhưng dùng chung `Math.random` với mọi thứ khác ngoài luật (luật online có bộ sinh số riêng — phải giữ vậy).
- Trạng thái hình ghi lên đối tượng luật (`E._ph, E._lechX, E._cdA, E._pop, d._g, d._ra, T._la…`): vô hại cho luật nhưng làm đối tượng luật không thuần — khi tách nên dời sang bảng riêng theo `uid`.

## 7. Số đo đợt 1

Xem mục "WebGL đợt 1" cuối `GAMEPLAY.md` (bảng 4 cảnh trước → sau, lệnh vẽ theo nhóm, sai khác hình, giới hạn đo).
Công cụ: `tools/thap-kt-hieunang-coop.js` (`Q=gl=1|gl=0`, `HASH`, `DEM=1`, `THUC=20`, `BENCH=15`, `SHOT=1`, `KHONGGL=1`) · `tools/thap-kt-webgl.js` (1 cảnh bất kỳ: trùm, PVP, mất ngữ cảnh `MAT=200,320`, không WebGL).
Ảnh so trước/sau: `/home/claude/xem/webgl1/` (máy làm việc, không commit).

## 8. Cần thử trên iPhone thật (máy đo là Chromium + GPU phần mềm, không đại diện)

- Có bật không: mở trận, console `GLR.thongTin()` hoặc so `?gl=0` / mặc định; quái, đạn, thanh máu phải hiện ngay khung đầu (không trắng/đen ô vuông).
- Quái/đạn có **mờ hơn hoặc lệch nửa điểm ảnh** so với `?gl=0` không (lọc song tuyến tính của GPU, canvas 2× trên máy 3×).
- Thanh máu: mép có nhấp nháy khi quái đi chậm không.
- Chớp đầu nòng / tia laser trên thân ụ: có tối hơn bản cũ không (mục 2.3).
- Về trang sau khi khoá máy / chuyển app lâu (iOS hay thu hồi ngữ cảnh WebGL): quái phải còn (rơi về 2D rồi có lại GL), không trắng màn.
- Nhiệt + pin 10 phút co-op wave 35+ so với `?gl=0`; khung hình có đều hơn không.
- Bộ nhớ: Safari không tải lại trang giữa trận dài (thêm 2 canvas cỡ màn + ≤ 48 MB texture).

## 9. Bộ nhớ + khựng của bản GL (11/11 tối — hoàn tất việc bị ngắt giữa chừng)

Số trên iPhone người dùng (bản live `b34f385`, co-op wave 31): `GL 23 · min 3 · ve 21/310 · t7 · m317+88`. Đo lại bằng `tools/thap-kt-bonho-gl.js`
(Chromium + GPU phần mềm, `ios=1`, co-op 3×, wave 25 → 45–56, bộ `bocap,sinhdoi,tudo,cobac,saochep` + `leviathan,ronglua,nemesis,khoisinh,overlord`):

**Giả thuyết "kho đệm 2 thế hệ xoay liên tục → dựng lại dồn dập + canvas rác không được thu" — KHÔNG đúng (trên máy đo):**
- Kho `REN.cSet` chỉ xoay 3–6 lần / 100 s (300 s trận); ảnh dựng ≤ 10 / khung sau 10 s đầu (ngân sách `REN.hetNgan` đã chặn); tổng điểm ảnh dựng lại nhỏ.
- Ép thu gom rác (`GC=1`) KHÔNG làm giảm MB canvas của bản 2D (238 MB có ép = 224–258 MB không ép) → gần hết canvas còn THAM CHIẾU thật (ảnh gốc chép sang canvas, ảnh tô màu, tầng mip), không phải rác chờ thu.
- Cái đo được ở bản live GL: (1) mọi ảnh nằm 2 nơi (canvas CPU 165 → 275 MB + GPU 81–104 MB = **245 → 376 MB, tăng dần**); (2) atlas đầy → xoá sạch rồi tải lại
  **185–200 texture trong 1 khung**, lặp lại ~40 s / lần; (3) khung đầu trận 0,45–0,9 s; (4) triệu hồi lần đầu tải 17–20 texture / khung.
- Khung 310 ms với `t7` trên iPhone: chưa tái hiện được (máy đo không có khung nào như vậy ngoài (2) và (3)). Ứng viên còn lại: giải mã đồng bộ tờ ảnh lớn, GC / thu hồi của Safari khi
  tổng > 400 MB. Nhãn admin nay thêm `d<ảnh dựng ở khung chậm nhất>x<lần xoay kho>h<ms dựng lại lớn nhất>` để lần đo máy thật kế phân biệt được.

**Đã làm (chỉ phần vẽ; băm trạng thái gl0 = gl1):**
1. Thả bản CPU của canvas đã có bản khác (glr.js mục BỘ NHỚ): ảnh gốc (giữ `Image`), tầng mip + ảnh tô màu (có hàm dựng lại trên CPU), ảnh kho đệm đã lên GPU (đọc ngược ≤ 1 lần / canvas, ≤ 1 lần / lượt dọn).
2. Atlas đầy → gom ngay trên GPU (`copyTexSubImage2D`), không tải lại. Ngân sách tải texture mỗi khung (`TAI_MAX`), phần dư vẽ tạm bằng tầng mip khác / hoãn 1–3 khung, hàng nạp nền (`GLR.nap`).
3. Canvas rơi khỏi 2 thế hệ kho đệm → 0×0 thật sau 90 khung không ai dùng (`huyKho`; chỉ bản GL — bản 2D vẽ canvas 0×0 sẽ ném lỗi, và đo cho thấy 2D không có rác để thu).
4. Làm nóng trong MÀN MỞ ĐẦU TRẬN (~4 s, trận đứng): còn việc thì vẽ 60 khung / giây, hàng nóng 10 ms / khung, tờ ảnh lớn của trận chép ngay, texture tải không giới hạn; thêm hiệu ứng triệu hồi theo bậc.
5. Sửa 2 lỗi của bước dở dang: kiểm "ảnh rỗng" áp nhầm cho tầng mip mảnh (4 700 lần vẽ hụt / 100 s), hàm dựng lại tầng mip bắt biến vòng lặp (dựng từ sai tầng → 2D dự phòng mất lớp sáng).

| co-op 3×, wave 25→45 (MB canvas + MB GPU = tổng) | 10 s | 30 s | 60 s | 100 s | khung chậm nhất sau 10 s đầu | tải texture nhiều nhất / khung |
|---|---|---|---|---|---|---|
| 2D live (`gl=0`) | 163 | 227 | 224 | 258 | 167 ms (trung vị 15–20 ms: 2D trên máy đo chậm) | — |
| GL live `b34f385` | 165+81 = 245 | 217+104 = 321 | 222+97 = 319 | 275+81 = 355 | 68 ms | 200 |
| GL sau | 59+102 = 161 | 70+116 = 186 | 57+107 = 164 | 63+115 = 178 (150 s: 58+111 = 168) | 60 ms (1 khung 119 ms ở giây 130 = lượt dọn texture riêng đọc ngược GPU; đã giới hạn 1 lần / lượt) | 8 |

| 12 lần triệu hồi đầu trận (có màn mở đầu) | texture tải lúc vẽ nhiều nhất / khung | tổng 8 khung sau lần triệu hồi đầu | ms khung chậm nhất sau triệu hồi |
|---|---|---|---|
| GL live | 17 | 25 | 38,5 |
| GL sau | 4 | 2 | 16,4 |

Kiểm: băm trạng thái gl0 = gl1 có vẽ — co-op A (`8b4f420b` / `2f83154d`), Hive (`f6b57405`), PVP (`49b2c42a`); mất ngữ cảnh `MAT=200,320` → 2D dự phòng đủ hình dù bản CPU đã thả → GL lại, không lỗi trang;
ảnh so CÙNG trạng thái GL ↔ 2D (`SOSANH=1`): co-op đang kéo ghép, Freezer (ụ đóng băng), Janus (ụ hoá đá) — khác ≤ 633 điểm ảnh (như bản live), 2D dự phòng = bản live từng điểm ảnh. Ảnh: `/home/claude/xem/webgl-xong/`.
Tải texture / khung ở cảnh trùm (240 khung cuối): Octopus 0,66 · Patcher 0,16 · **Hive 4,15 (= bản live 4,19)** — Hive lăn kiểu cầu được bẻ hình trên CPU mỗi khung (2 canvas 155² × 2 con), muốn hết phải chuyển sang shader (chưa làm).

Giới hạn / cần xem trên iPhone thật:
- Ảnh gốc đã thả mà hiệu ứng cần lại: 1–3 khung đầu vẽ bằng tầng mip nhỏ hơn (hơi mờ) hoặc bỏ vẽ trong lúc `Image.decode()` chạy nền (máy đo: 213 lượt vẽ bị hoãn / 150 s). iPhone giải mã chậm hơn → có thể thấy hiệu ứng lớn hiện trễ vài khung.
- `Image` giữ làm nguồn dựng lại: Safari có thể vẫn giữ bản giải mã của `Image` một lúc (không đo được ở đây) → MB thật có thể cao hơn nhãn `m`.
- Đọc ngược GPU (`readPixels`) còn ở 2 chỗ hiếm (ảnh kho đệm bị đọc 2D sau khi thả; dọn texture riêng quá 40 MB): máy đo 5–10 ms (114 ms khi dồn), iPhone chưa đo — xem `GLR.bn.hoiGPU / docDon / donMax`.
- Thời gian khung trên máy đo (GPU phần mềm, 2 nhân) không đại diện; chỉ số đếm (MB, số texture tải, số ảnh dựng) mới so được.

## 10. Tải texture giữa trận (11/11 đêm — nhánh `claude/gl-song-song-b`)

iPhone người dùng (bản `m60+104`, co-op wave 39–40, 3×): khung chậm nào cũng có 2–6 lần tải canvas → texture (`up5/18 235x147`, `up3/14 2016x250`, `up5/30 1016x159`…).
Đo bằng `tools/thap-kt-tai-gl.js` (bọc `gl.texImage2D / texSubImage2D`, ghi TỪNG lần tải theo khoá ảnh; co-op 3×, `ios=1`, wave 25 → 62, 180 s, bộ `bocap,sinhdoi,tudo,cobac,saochep` +
`leviathan,ronglua,nemesis,khoisinh,vughep`; máy đo tải gần như miễn phí → chỉ so SỐ ĐẾM):

**Nguồn nào chính?** Cả hai, theo số lần: trong 2 441 lần tải ảnh tĩnh / 180 s có 1 442 lần tải LẦN ĐẦU (59 %) và 999 lần tải LẠI (41 %, 675 khoá tải > 1 lần — nhiều khoá 4–5 lần).
- Tải lại: (1) gom atlas bỏ mọi ô không vẽ 10 s (ụ đổi dạng, hiệu ứng theo đợt, chữ số → cần lại là tải lại; atlas 4 trang luôn đầy 0,8–0,99); (2) kho đệm `REN.cSet` xoay → canvas rơi khỏi kho bị huỷ
  (768 canvas) → dựng lại + tải lại; (3) texture riêng (dải lớn) bỏ sau 10 s.
- Tải lần đầu rải giữa trận: ảnh tô màu `FXU.mau` + tầng mip (548), chữ số `REN.chuSo` (mỗi chữ × màu × cỡ 2 canvas), huy hiệu sao theo bậc cỡ (227), khung chiêu `sig|…` (179), và ẢNH CỠ ĐỘNG:
  Rồng Máy phóng theo hoạt ảnh xin mỗi khung 1 cỡ điểm ảnh (`ronglua_f1_nong|92`, `|91`, `|90`… + bản trắng) = ~420 lần tải.
- Ngoài 2 nguồn trên (KHÔNG sửa ở đây — file của phiên A): **tấm đếm `ND.veHuyHieu` (demkn.js:66/179) vẽ lại tại chỗ + `GLR.ban` = 27–44 lần tải / giây** (canvas 58–73 × 22), nhiều hơn mọi nguồn khác cộng lại;
  `mau:tai_day#<màu>` của demkn tải mới ở mỗi wave trùm. Cụm vector (`vecXa`) ~6 / giây.

**Đã làm (chỉ hình; băm gl0 = gl1):**
1. KHÔNG TẢI LẠI — `glr.js`: gom atlas giữ theo NGÂN SÁCH (mới dùng nhất trước, tới `GIU_DAY` = 78 % của `TRANG_MAX` = 5 trang; trước: bỏ theo tuổi 10 s, 4 trang); texture riêng chỉ bỏ theo tuổi khi tổng >
   `RIENG_GIU` (70 % `RIENG_MAX`); ảnh dựng đã thả bản CPU bị loại → gỡ khỏi kho đệm (`chet`), không đọc ngược GPU. `render.js`: thế hệ kho đệm dài 1,6 lần khi GL đang vẽ.
2. NẠP TRƯỚC — `GLR.nap` 2 mức: "nạp trước" (làm nóng) giữa trận ≤ 1 texture / khung, chỉ ở khung nhẹ (< 9 ms; khung nặng: 6 khung 1 lần), texture nạp xong được ghim 3 600 khung;
   "đang cần" (ảnh bị hoãn vẽ / vẽ tạm) theo `NAP_DV` như cũ. `nongskill.js`: trùm làm nóng từ khi còn 3 wave (trước: 1) — `NS.waveTrum`; mọi dạng grow-up + đầu vẽ riêng theo sao của ụ trong 2 bộ bài
   vẽ thử ở màn mở đầu (`NS.nongDang`); chữ số 0–9 lên GPU sẵn. `vaotran.js`: màn mở đầu nán thêm ≤ 2,5 s nếu còn việc làm nóng (chỉ khi GL bật; đo: không cần nán — hết việc ở khung 24 / 240).
3. BỚT ẢNH PHẢI TẢI — `nongskill.js` `REN.co` (chỉ GL): ảnh đã có ≥ 3 cỡ (= phóng động) mà cỡ mới chưa có → dùng bản lớn hơn ≤ 9 % (GPU thu), cùng cỡ xin 4 khung liền mới dựng đúng cỡ.
   `quaianim.js`: chớp trắng trúng đòn / xác quái của DẢI KHUNG = chính dải ở chế độ trắng của shader (`ctx.trang`) → không dựng + tải dải trắng (và hết khung 1,5–1,9 s trên máy đo do đọc ngược GPU dải
   đánh của trùm đã thả bản CPU để dựng bản trắng — lỗi sẵn có, lộ ra khi làm nóng trùm sớm hơn 10 s).

| co-op 3×, 180 s, wave 25 → 62 | trước (`ec20350`) | sau |
|---|---|---|
| tải ảnh tĩnh / giây (cả trận · bỏ 10 s đầu · nửa sau 90–180 s) | 13,6 · 10,2 · 8,7 | 8,0 · 4,4 · **1,5** |
| trong đó nguồn ≥ 256 điểm / giây | 1,23 | 0,84 |
| khoá tải > 1 lần (số lần tải lại · nguồn ≥ 256) | 675 (999 · 71) | **58 (58 · 13)** |
| tải tĩnh trong 2 s sau khi trùm ra, wave 30 / 40 / 50 / 60 (nguồn ≥ 256) | 100 / 100 / 53 / 40 (19 / 19 / 17 / 4) | 58 / 20 / 50 / 41 (14 / 1 / 14 / 5) |
| tải tĩnh nhiều nhất 1 khung (mọi loại) | 4 (10) | 4 (9) — ngân sách `TAI_MAX` không đổi |
| khung có tải tĩnh | 1 171 / 10 800 | 705 / 10 800 |
| MB canvas + GPU mỗi 10 s | 138–181 (đỉnh 181 ở 80 s) | 148–198 (đỉnh 198 ở 110 s; thường 175–190) |
| màn mở đầu: số khung · texture tải trong đó · hết việc làm nóng ở khung | 240 (4,0 s) · 73 · 12 | 240 (4,0 s) · 136 · 24 |
| đọc ngược GPU (`hoiGPU` + `docDon`) | 0 | 0 |

Phần tải sau khi trùm ra còn lại KHÔNG phải dải của trùm (đã nạp trước: 0 lần tải lúc vẽ ở wave 50) mà là: `mau:tai_day#…` (demkn), 8 dải vệt lửa Rồng Máy 1016×159 (`vfxmoi.js dung()`, dựng ở lần bổ nhào
đầu — biến riêng của module, chưa làm nóng được), khung chiêu `sig|…` và ảnh tô màu của ụ ra chiêu lần đầu đúng lúc wave trùm.

Kiểm: băm có vẽ co-op A `8b4f420b` / `2f83154d` (gl=1 = gl=0); cảnh trùm co-op wave 30 (Octopus + Janus) `e568d6c0` (gl=1 = gl=0); `MAT=200,320` → 2D dự phòng → GL lại, 0 lỗi trang, `veChet` 0;
`?gl=0` không khởi tạo GL. Ảnh: `/home/claude/xem/song-song-b/`.

Chưa làm / cần xem trên iPhone thật:
- Tải LẦN ĐẦU của ảnh không đoán trước được từ bộ bài (ảnh tô màu theo màu hạt, khung chiêu theo cỡ, chữ số theo cỡ) vẫn rải giữa trận, mỗi ảnh 1 lần / trận; muốn hết phải ghi "danh sách đã dùng" theo bộ bài
  (lần chơi sau nạp ở màn mở đầu) hoặc tô màu bằng shader — chưa làm.
- +16 MB GPU (trang atlas thứ 5): nhãn `m` trên iPhone sẽ khoảng +15–20 so với `m60+104`; nếu Safari thu hồi → hạ `TRANG_MAX` về 4 (tải lại sẽ tăng).
- "Khung nhẹ < 9 ms" đo bằng JS của khung trước; iPhone ở cảnh nặng hiếm khi < 9 ms → nạp trước chạy nhịp 6 khung 1 lần (10 texture / giây) — vẫn kịp 3 wave nhưng chưa đo thật.
- Cỡ động dùng bản lớn hơn ≤ 9 %: hình có thể mềm hơn 1 chút trong lúc đang phóng (không đo được bằng mắt trên ảnh chụp ở đây).

## 11. Full WebGL bước 3 + 4 (phần Hive) — chữ trong trận = ô ảnh ký tự, Hive lăn cầu bằng shader (nhánh `claude/gl-full-w1`)

Vì sao: iPhone tải canvas → texture 3–50 ms / lần. Hai nguồn còn lại do CHỮ và TRÙM: (1) chữ trong trận sinh canvas nhỏ liên tục — số sát thương `REN.chuSo` (mỗi ký tự × màu × cỡ = 2 canvas),
chữ nổi `REN.chuAnh` (mỗi chuỗi 1 canvas), `fillText/strokeText` qua kho chữ của GLR (mỗi chuỗi × cỡ × màu 1 canvas; "JACKPOT!" / "+2" phóng dần = mỗi cỡ 1 lần tải), ký tự tấm đếm `DEMKN.kyTu`;
(2) Hive bẻ hình cầu trên CPU mỗi khung (2 canvas 155² / con + `GLR.ban`).

**Đã làm (chỉ hình; `?gl=0` và 2D dự phòng đi đường cũ nguyên vẹn):**
1. `thap/js/chugl.js` (mới) — `CHU`: mỗi (phông, cỡ điểm ảnh thiết bị) 1 "mặt chữ"; mỗi bộ ký tự (SỐ `0-9 K M B . , + - × x / % ! ★ :` · CHỮ HOA · chữ thường) × kiểu (ruột / viền theo độ dày) = 1 TỜ canvas vừa khít,
   ký tự TRẮNG dựng bằng chính phông game, dựng ở lần dùng đầu → 1 lần tải / tờ / trận. Màu = màu đỉnh: `GLR.ve` đọc `X.nhuom = [r, g, b]` (1 dòng ở glr.js, shader không đổi). Ký tự ngoài 3 bộ → "tờ lẻ" (+ `GLR.ban`).
   - `REN.chuAnh / veChuAnh` (số sát thương, chí mạng, +N mana, nhãn "to", tên ụ lúc kéo ghép): khi GL đang vẽ trả BỐ CỤC (cùng trường `tw / lw / lh / by`), vẽ bằng tờ ĐÚNG CỠ (1:1, viền 3,5 đơn vị, 2 lượt viền → ruột như cũ).
   - `GLR.veChu` (mọi `fillText / strokeText` không xoay, màu đặc — nhãn kỹ năng, JACKPOT, +N huy hiệu…): tờ theo BẬC CỠ (8 × 1,25ⁿ điểm ảnh, GPU thu nhỏ ≤ 20 %), nét viền theo bậc × 1,25 (sai ≤ 12 % độ dày);
     có sẵn mặt đúng cỡ thì dùng luôn. Không còn đếm ở `GLR.thieu` (đã là lệnh ảnh; đếm ở `GLR.dem.kt`). Chữ xoay / gradient / bóng / `maxWidth` / ký tự > U+2BFF (emoji…) → đường cũ (kho chữ / vector).
   - `DEMKN.veGL`: ký tự tấm đếm dùng chung `CHU` (trước: canvas riêng mỗi ký tự × màu).
   - Màn mở đầu: `NS.nongSo` (bọc lại từ chugl.js, không sửa nongskill.js) nạp trước tờ số của 2 cỡ sát thương (thường / chí mạng) thay cho 40 canvas chữ số.
   - Tờ chưa lên GPU (hết ngân sách tải của khung) → CẢ chuỗi đợi 1–vài khung (`CHU.du`), không hiện dở viền / thiếu chữ. `?chugl=0` tắt riêng để so.
2. Hive — `GLR.veCT(khoá, fs, ảnh, uniform)` (mới, glr.js): tô kín đích vẽ phụ đang mở (`GLR.vao … ra`) bằng 1 fragment shader riêng lấy mẫu ảnh đã trên GPU. `quaianim.js` `CAU_FS` = bản GLSL của vòng lặp
   điểm ảnh trong `cdLanAnh` (quay Qᵀ, ba mặt chiếu ở xích đạo, nén mép, viền tối, mép mềm, gai quay phẳng) vẽ vào `GLR.tam('cdO' / 'cdO2')`, rồi phủ bóng sáng / tối `source-atop` như cũ. Hỏng shader / ảnh chưa có → nhánh CPU cũ. `?caugl=0` tắt để so.

**Số đo** (máy đo Chromium + GPU phần mềm — chỉ so SỐ ĐẾM; `tools/thap-kt-tai-gl.js` `TAO=1`, co-op 3×, wave 25 →, `ios=1`, 2 bộ `lien,sungluc,bocap,cobac,lualien`):

| | trước (`8aa0478`) | sau |
|---|---|---|
| tải texture do chữ, 30 s đầu trận | 249 (100 ô chữ số `chuSo`, 49 ký tự tấm đếm, ~90 kho chữ GLR, 10 `chuAnh`) | 34–36 (mỗi tờ 1 lần; 12 mặt chữ, 41–43 tờ / trận) |
| tải texture do chữ, 20 s kế (giây 30–50) | 32 = 1,6 / giây | 2–6 = 0,1–0,3 / giây (tờ của cỡ chữ mới gặp lần đầu) |
| `GLR.thieu` trong 20 s đó | `hieuung` strokeText 255 + fillText 255 · `huyhieu` strokeText 168 + fillText 168 | rỗng (0) |
| Hive (2 con), tải texture / khung, 240 khung cuối | 4,08 | 0,08 |
| Patcher · Octopus (cùng cách đo) | 0,16 · 0,66 (số ghi ở mục 9) | 0,07 · 0,45 |

Kiểm: băm có vẽ gl=1 = gl=0 — co-op A `8b4f420b` / `2f83154d`, Hive `f6b57405`, Patcher `6acc246e`, Octopus `fe56be3`; `MAT=200,320` (Hive và co-op có chữ): 2D dự phòng đủ chữ + Hive (đường CPU), có lại GL vẽ tiếp, 0 lỗi trang, `veChet` 0;
`?gl=0`: chỉ `cv-nen, cv`. Hình CÙNG trạng thái (`SOSANH=1`): Hive GL-shader ↔ GL-CPU 0 điểm ảnh khác (ngưỡng 40/255), ↔ 2D 1 điểm; chữ GL ↔ 2D không thấy khác bằng mắt ở ảnh phóng 3×. Ảnh: `/home/claude/xem/gl-full-w1/`.

**Còn lại / cần xem trên iPhone thật:**
- Cỡ chữ gặp LẦN ĐẦU trong trận vẫn tải 2–6 tờ (≤ 512², phần lớn < 512 × 150); nhãn chữ to gặp lần đầu có thể hiện trễ 1–vài khung (đợi ngân sách tải). Muốn hết: nạp trước theo "danh sách cỡ đã dùng" (chưa làm; nạp mọi bậc ≈ 0,3 trang atlas).
- Chữ theo bậc cỡ bị GPU thu ≤ 20 % → có thể mềm hơn chút so với chữ vẽ đúng cỡ (ảnh chụp ở máy đo không thấy).
- Nguồn tải do chữ / trùm còn lại (không sửa ở đây): Octopus 0,45 / khung (ảnh cỡ động 83–124 điểm, mỗi cỡ 1 ảnh — việc của phần kho ảnh), `mau:tai_day#…` của demkn ở wave trùm, ảnh dựng khi trùm chết (`cdPhanChup` 159², 1 lần),
  chữ xoay / gradient (vector, hiếm: 0 lần ở các cảnh đo), `DEMKN.ve0` vẽ thẳng khi icon chưa nạp (nay cũng qua `CHU`).
- Shader Hive dùng `highp` nếu có; GPU chỉ có `mediump` ở fragment (không phải iPhone) có thể lệch hoa văn → `?caugl=0`.

## 12. Full WebGL bước 1 + 2 — ẢNH ẢO: 1 texture gốc / ảnh, cỡ + biến thể bằng GPU (11/11 tối — nhánh `claude/gl-full-w2`)

Gốc vấn đề: lớp GL mới chỉ "vẽ ra màn bằng GL"; khâu CHUẨN BỊ ảnh vẫn kiểu 2D — mỗi cỡ thu nhỏ, mỗi màu tô, bản trắng / xám / bóng là 1 canvas dựng trên CPU rồi tải canvas → texture
(3–50 ms / lần trên iPhone), mỗi ảnh nằm 2 nơi.

**Cách làm (`glr.js` mục "ẢNH ẢO", chỉ WebGL2; `?gla=0` tắt để so; WebGL1 / `?gl=0` chạy đường cũ nguyên vẹn):**
- Các hàm dựng ảnh trả **canvas ảo**: phần tử canvas 0×0 (không điểm ảnh) báo đúng `width/height` cũ, mang `c._ao = { g: ảnh gốc, ô nguồn, k: kiểu tô, t: màu tô, al, them }` → mã vẽ cũ không đổi 1 dòng
  (`ctx.drawImage(c, …)` như trước). Ai đọc điểm ảnh của nó bằng 2D (canvas ghép từ nó, đường 2D dự phòng khi mất ngữ cảnh, `toDataURL`) → dựng thật bằng đúng hàm dựng cũ (cơ chế "thả bản CPU" loại 1 ở mục 9).
- **Ảnh gốc tải THẲNG `Image` → GPU** (không chép qua canvas; `REN.img` bản GL trả canvas 0×0 giữ `Image`). Mỗi ảnh gốc giữ sổ tầng `g._lv[L]` (L = 0 nguyên cỡ, 1 = ½, 2 = ¼ …): tầng > 0 dựng **ngay trên GPU** —
  tải vào texture tạm, `generateMipmap`, vẽ thu vào ô atlas / texture riêng qua bộ đệm khung rồi bỏ texture tạm (GPU chỉ giữ tầng cần); đã có tầng nét hơn thì thu ½ dần trên GPU (không tải gì).
  Chọn tầng nhỏ nhất còn ≥ cỡ cần (nới 6 %) → GPU chỉ thu ≤ 2× như chuỗi mip CPU cũ. Ảnh gốc cần lại ở tầng nét hơn: lần tải thứ 2 lấy luôn tầng 0 (≤ 2 lần tải / ảnh / ngữ cảnh).
- **Biến thể bằng shader, vẫn gom lô**: thêm 2 thuộc tính đỉnh `a_t` (màu r g b + độ mạnh) và `a_k` (kiểu): 1 = phủ màu trong alpha ('source-atop' — `FXU.mau`, `REN.toMauA`, bản trắng, bóng đen),
  2 = xám hoá đá (`toBien 'xam'`), 3 = nhân màu (chưa dùng). Bóng mềm (`'den'`, bóng đầu ụ) = phủ đen + lấy tầng thô hơn 2 bậc rồi phóng lên (thay `filter: blur`).
- Ô tầng nằm chung atlas / texture riêng với mọi ảnh khác: gom atlas (mục 10), ngân sách tải mỗi khung, hàng nạp nền + giải mã nền `Image.decode()`, vẽ tạm bằng tầng khác — dùng lại hết.

**Theo nhóm:**
| nhóm | đã chuyển sang ảnh ảo | còn là canvas (lý do) |
|---|---|---|
| (a) quái + trùm | dải khung `REN.coDai` (mỗi khung 1 ô của dải gốc; bản trắng = shader), `REN.co` của quái code / lớp rig, bóng | canvas tạm của trùm đã là bộ đệm khung GPU từ trước; Hive lăn cầu (phiên W1); `bonglan|…` (bóng cắt theo thân — ghép 2 ảnh) |
| (b) đầu ụ / bệ / huy hiệu | đầu ụ mọi cỡ + bản xám + chớp trắng (`REN.co`), **đầu-kèm-bóng `db|…` bỏ hẳn ở bản GL** (2 ô ảnh từ 1 texture), phần phụ, `banXam` / `banTrang`, bóng nhấc khi kéo (`'den'`) | bệ `than|…` (ghép bóng + viền bậc nhân màu + bệ: 1 canvas / loại ụ / cỡ, dựng ở màn mở đầu), huy hiệu sao `hh…` (có chữ số — nay bậc cỡ 26 % thay 8 % khi GL vẽ), tấm đếm (phiên W1) |
| (c) đạn + nổ + chiêu | mọi ảnh tô màu `FXU.mau` / `PX.mau` / `toMauA` (hạt, vòng, vệt, tia, thanh máu) + chuỗi mip của chúng, chuỗi mip của ảnh gốc (`REN.mip`), khung chiêu `SIG.khung` | dải dựng bằng code: `vfxmoi.js dung()` (vệt lửa Rồng Máy), `camgiac.js dai`, mặt nạ `HU.matNa`, tô kiểu 'color' (`REN.toMau` / `HU.toMau` — cần thêm kiểu shader 4) |
| (d) vòng / dây / triệu hồi / ghép | vòng + dây + chấm dùng `PX.*` (qua `FXU.mau`), vòng triệu hồi `REN.co` | cung hồi chiêu `PX.cung` (mặt nạ quạt nướng theo góc — nên chuyển thành quạt tam giác), chữ (`chuSo` / `chuAnh` / kho chữ — phiên W1) |

**Số đo** (`tools/thap-kt-tai-gl.js`, nay tách `anh` = tải từ Image / `cvT` = tải từ canvas, thêm `cvN`, `tex`, `lenhTB`; co-op 3×, `ios=1`, wave 25 → 49, 120 s, bộ `bocap,sinhdoi,tudo,cobac,saochep` + `leviathan,ronglua,nemesis,khoisinh,vughep`;
Chromium + GPU phần mềm → chỉ SỐ ĐẾM có nghĩa):
| | trước (`8aa0478`) | sau |
|---|---|---|
| tải canvas → texture, cả 120 s (/ giây) | 1 352 (11,3) | 442 (3,7) |
| … sau 10 s đầu (/ giây) · 60 s cuối (/ giây) | 642 (5,8) · 240 (4,0) | 166 (1,5) · 56 (0,9) |
| tải Image → texture giữa trận | 0 | 151 (87 trong 10 s đầu; sau đó 0,6 / giây; 60 s cuối: 23) |
| canvas đệm còn điểm ảnh: MB (số canvas) lúc 10 s · 60 s · 120 s | 52 (859) · 56 · 71 | 42 (494) · 36 (504) · 37 (531) |
| MB GPU lúc 10 s · 60 s · 120 s | 94 · 122 · 119 | 79 · 109 · 102 |
| tổng MB canvas + GPU (10 s … 120 s) | 145–195 | 108–152 |
| màn mở đầu: tải canvas / tải Image / MB tổng | 78 / 0 / 90 | 55 / 88 / 91 |
| số texture (trang atlas + texture riêng) | 20 (10 s) | 18–27 |
| lệnh vẽ GL / khung (GPU phần mềm: 1 texture / lệnh — máy thật 8 texture / lệnh nên ít hơn 2–4 lần) | 132 (10 s đầu) | 104 (10 s đầu) · 178 (trung bình cả trận) |
| canvas ảo đã tạo / tầng thu trên GPU / dựng lại bản CPU (`hoi`) | — | 1 539 / ~30–46 / 151 (85 ms tổng) |

Phần tải canvas còn lại giữa trận (120 s): ~330 chữ số + tấm đếm (`REN.chuSo`, `demkn.js kyTu`, kho chữ — phiên W1 đang chuyển sang sprite glyph), 81 huy hiệu sao `hh…`, ~25 bệ / bóng / dải dựng bằng code.

**Kiểm:** băm trạng thái có vẽ gl=1 = gl=0 — co-op A `8b4f420b` / `2f83154d`, cảnh trùm wave 30 (Octopus + Janus) `277795d6`; `MAT=200,320`: 2D dự phòng đủ hình (ảnh ảo dựng thật qua hàm cũ) → GL lại, 0 lỗi trang;
ảnh cùng trạng thái `?gl=1` mới ↔ `?gl=1&gla=0` (đường cũ): khác > 60 mức ở 14–74 điểm ảnh / 2,96 triệu (mép khử răng cưa); ↔ 2D: ụ hoá đá, đầu ụ, bóng, tia tô màu khớp. Ảnh: `/home/claude/xem/gl-full-w2/`.

**Giới hạn / cần xem trên iPhone thật:**
- Khung ĐẦU sau khi đổi 2D → GL (chỉ xảy ra khi ngữ cảnh vừa có lại): vài hình trùm thiếu 1 khung (có từ trước; bản mới thiếu thêm thân trùm 1 khung) — khung sau đủ.
- `texImage2D(Image)` ảnh chưa giải mã = giải mã đồng bộ: ảnh > 300 000 điểm giữa trận đã đi qua `Image.decode()` nền; ảnh nhỏ tải ngay trong ngân sách khung (`TAI_MAX`) — iPhone cần đo `up…` ở khung chậm.
- Hình thu 1–2× bằng lọc song tuyến tính của GPU thay vì thu sẵn đúng cỡ (lọc 'high'): mép đầu ụ có thể hơi khác răng cưa; bóng đầu ụ / bóng nhấc mềm bằng tầng thô (không phải Gaussian).
- `generateMipmap` + vẽ vào bộ đệm khung trên Safari WebGL2 chưa thử máy thật; lỗi → ảnh đó đánh dấu `_glLoi` (không vẽ) — nếu gặp, tắt bằng `?gla=0`.
- `Image` giữ làm nguồn: Safari có thể giữ bản giải mã một lúc (không đo được ở đây).

**Việc kế:** (1) bệ `than|…` vẽ 3 ô ảnh mỗi khung (bóng + viền nhân màu kiểu 3 + bệ) thay canvas ghép; (2) kiểu shader 4 'color' cho `REN.toMau` / `HU.toMau`; (3) `PX.cung` = quạt tam giác (thêm `GLR.quat`);
(4) dải dựng bằng code (`vfxmoi`, `camgiac`) → ô của dải gốc; (5) sau khi phiên W1 xong chữ: đo lại, mục tiêu tải canvas giữa trận ≈ 0; (6) bỏ đường canvas cũ khi `?gl=0` không còn cần.


## 13. Full WebGL — Ô Ụ không nướng canvas: bệ, huy hiệu sao, kéo / ghép (12/11 — nhánh `claude/gl-full-w3`)

Sau mục 12, canvas → texture giữa trận do Ô Ụ còn: huy hiệu sao `hh…` (81 lần / 120 s — 1 canvas / số sao / bậc cỡ), bệ ghép `than|…` (10), cộng ~180 lần ở màn mở đầu (bệ mọi ụ của 2 bộ bài + huy hiệu các bậc cỡ).

**Đã làm (chỉ hình; chỉ khi lớp GL đang vẽ + ảnh ảo — `?gl=0`, `?gla=0`, WebGL1, 2D dự phòng lúc mất ngữ cảnh đi đường canvas cũ nguyên vẹn):**
1. **Bệ** — `REN.veThanGL` (render.js): mỗi khung vẽ 3–4 ô ảnh thẳng từ texture ảnh gốc thay canvas `than|…`: bóng (`fx_cham_trang` phủ đen, alpha 0,7) → viền bậc `<id>_vien` NHÂN màu bậc bằng shader kiểu 3
   (`REN.vienAo`; lần đầu kiểu 3 được dùng) → Vàng / Đỏ thêm 1 **ô cộng** 0,22 của chính ảnh viền (ánh kim) → bệ (hoá đá = shader kiểu 2). Toạ độ = đúng toạ độ trong canvas nướng cũ (kể cả gốc làm tròn điểm ảnh lúc đứng yên).
   Ô cộng: `X.cong = 1` → alpha đỉnh = 0 trên nền nhân sẵn = cộng sáng mà KHÔNG đổi kiểu hoà màu → không ngắt lô (1 dòng ở `GLR.ve`, shader + bố cục đỉnh không đổi). `REN.thanChon` = phần chọn ảnh bệ tách ra dùng chung với `REN.than`.
   Vẽ làm nóng (`REN.ctxNong`) cũng đi đường này → màn mở đầu chỉ nạp texture ảnh gốc.
2. **Huy hiệu sao 1–6★** — `REN.huyHieu` (hud2.js) trả **canvas ảo vừa khít hàng sao** trỏ thẳng `hh_sao<n>` + vị trí của nó trong ô vẽ cũ (`_N, _X0, _Y0`); mọi nơi vẽ (bàn, con dấu ghép, sao "+1" xem trước, nhãn kéo) qua `REN.veHH`
   → đổi số sao / đổi cỡ = 0 canvas, 0 lần tải. **7★** (sao vàng viền đỏ + quầng: cần ngưỡng alpha + blur — không dựng được bằng 3 kiểu shader hiện có) vẫn nướng, nhưng chỉ **2 cỡ / trận** (`REN.qdH`: cỡ trên bàn + 2,5 lần cho con dấu / nhãn; GPU thu).
3. **Kéo / ghép / biến hình** — đầu ụ đang phóng theo hoạt ảnh (`veDauLop` có `sc`) xin ảnh ảo ở CỠ GỐC rồi GPU co giãn (trước: mỗi khung 1 canvas ảo + 1 mục kho đệm mới); ụ nhấc, bóng nhấc, bóng mờ ở ô gốc, khung ô đích đã là ô ảnh;
   bỏ 2 chỗ dựng canvas chữ thừa khi GL vẽ (`ghepfx.js` làm nóng tên ụ, `KG.khungTam` đo bề rộng → bố cục `CHU.anh`).

**Số đo** (`tools/thap-kt-tai-gl.js` `TAO=1`, co-op 3×, `ios=1`, wave 25 → 49, 120 s, bộ `bocap,sinhdoi,tudo,cobac,saochep` + `leviathan,ronglua,nemesis,khoisinh,vughep`; Chromium + GPU phần mềm → chỉ SỐ ĐẾM có nghĩa; "sau" = commit `b135edc`, chưa gồm 7★ 2 cỡ):
| | trước (`74582a0`) | sau |
|---|---|---|
| tải canvas → texture trong 120 s trận (/ giây) | 157 (1,31) | 78 (0,65) |
| … sau 10 s đầu (/ giây) | 65 (0,59) | 34 (0,31) |
| theo nguồn: `hh` · `than` · đầu ụ · khác | 81 · 10 · 0 · 66 | 11 (toàn 7★) · 0 · 0 · 67 |
| "khác" lúc sau gồm | — | 31 tờ ký tự `chugl` (cỡ chữ gặp lần đầu), 11 `camgiac.dai`, 8 `vfxmoi.dung`, 5 `HU.toMau`, 5 tầng mip + 2 `HU.matNa`, 2 `bonglan`, 3 lẻ — đều ngoài ô ụ (phiên W4 / W1) |
| tải Image → texture trong 120 s | 142 | 163 (+ ảnh viền / hh_sao tải thẳng 1 lần) |
| màn mở đầu: tải canvas · tải Image · canvas còn điểm ảnh (MB) | 182 · 88 · 284 (50) | **11** · 108 · 56 (31) |
| canvas đệm còn điểm ảnh giữa trận: số (MB) | 173–225 (33–42) | 83–114 (30–39) |
| MB GPU | 96–130 | 96–131 |
| lệnh vẽ GL / khung (trung bình cả trận) | 191,8 | 185,1 |
| dựng lại bản CPU của ảnh đã thả (`hoi`) | 104 (118 ms) | 47 (41 ms) |

Kéo – ghép 1 lần (`tools/thap-kt-gl-u.js`, ô 10 → ô 11): canvas có điểm ảnh tạo ra trong lúc KÉO: 2D 18 · GL đường cũ (`gla=0`) 24 (18 lần tải) · **GL mới 0 của ô ụ** (chỉ 6 tờ ký tự của nhãn "Random type, +1★" lần đầu);
lúc GHÉP: 2D 18 · `gla=0` 15–17 (22 lần tải) · GL mới 0 của ô ụ (còn `HU.matNa` + 1 tầng mip của `camgiac.veSao`, tờ ký tự). Ghép ra 7★: 1 canvas 7★ (cỡ lớn) — 1 lần tải.

**Kiểm:** băm trạng thái có vẽ co-op A gl=1 = gl=0 (`8b4f420b` / `2f83154d`); `MAT=200,320`: 2D dự phòng đủ bệ + sao → GL lại, 0 lỗi trang; trận co-op tải không lỗi trang ở `?gl=1`, `?gl=1&gla=0`, `?gl=0`.
Ảnh CÙNG trạng thái `?gl=1` ↔ `?gl=0` (390×844, `ios=1` → 2×; `/home/claude/xem/gl-full-w3/`, `ss_*.png` = GL trên · 2D giữa · độ lệch ×3 dưới): bệ + viền 5 bậc (giấu đầu ụ: `ss_be_hang1/2`), sao 1–7★, hoá đá, đóng băng,
Leviathan + tấm đếm, đang kéo (`ss_keo`), ghép (`ss_ghep1/2`, 7★ `ss_s7_ghep2`): vị trí / cỡ / màu khớp, chỉ lệch mép khử răng cưa (bệ: 121–231 điểm > 40 mức / hàng, 0–7 điểm > 100).

**Giới hạn / chưa làm:**
- Ụ đang mờ (alpha < 1: bóng ở ô gốc lúc kéo, tan lúc ghép): bóng / viền / bệ mờ RIÊNG từng lớp (trước: mờ cả ảnh ghép) → viền hơi lộ qua bệ trong lúc mờ; ảnh `ss_keo` không thấy khác bằng mắt.
- Bệ thu bằng lọc song tuyến tính GPU từ tầng ảnh gốc thay vì thu sẵn chất lượng cao rồi vẽ 1:1 → mép có thể mềm hơn chút trên máy thật. Shader kiểu 3 + ô cộng chưa thử trên Safari / iPhone thật.
- 7★ còn ≤ 2 canvas / trận; muốn 0: cần ảnh `hh_sao7` viền đỏ sẵn (ChatGPT) hoặc kiểu shader "ngưỡng alpha".
- Huy hiệu dự phòng có chữ số (`hh2` / `hh4`, chỉ khi `hh_sao*` chưa tải) và hàng 3 ngọc `MV.hangNgoc` (đang tắt: `MV.GON`) vẫn là canvas.
- Chưa chạy: hồi quy đầy đủ, PVP / solo, số đo 120 s sau thay đổi 7★ 2 cỡ (chỉ đo kéo–ghép ra 7★: 1 lần tải).
- Gộp với phiên W4: `glr.js` chỉ sửa 1 dòng (`mau = … & (X.cong ? 0xffffff : -1)`) trong `GLR.ve`.

## 14. Full WebGL — HIỆU ỨNG không còn dựng canvas: hoà 'color' + mặt nạ bằng shader, dải dựng trên GPU, cung = hình quạt, làm nóng ảnh gốc (12/11 — nhánh `claude/gl-full-w4`)

Việc (2) (3) (4) của mục 12 + làm nóng lần dùng đầu. Chỉ hình; chỉ chạy khi ảnh ảo bật (WebGL2). `?gl=0`, `?gla=0`, WebGL1 (`?glv=1`) và đường 2D dự phòng đi các hàm dựng canvas cũ nguyên vẹn
(mọi ảnh mới đều mang `c._dungLai` = đúng phép canvas cũ → ai đọc điểm ảnh 2D thì dựng thật).

**Shader (`glr.js`, vẫn gom lô, 1 chương trình):**
- `a_k` = kiểu tô (0–7) + 8 × q; q > 0 → **mặt nạ alpha tuyến tính** m = q / 64 − 4096 nội suy qua ô, fragment kẹp 0..1. Giải mã ở VERTEX shader (luôn có `highp`); 3 số lẻ
  (trắng + chỉ số texture, kiểu, mặt nạ) đi chung 1 `varying vec3 v_w` → còn 6 varying (WebGL1 bảo đảm 8). Fragment vẫn sau cổng `GL_FRAGMENT_PRECISION_HIGH` cũ; mặt nạ chỉ được dùng khi ảnh ảo bật (WebGL2 = có highp).
- **Kiểu 4 = hoà 'color' của canvas** (`fillRect` màu kiểu `'color'` rồi `'destination-in'` chính ảnh): `Cb = t.rgb / t.a`, `B = ClipColor(màu + (Lum(Cb) − Lum(màu)))`, `Lum = 0,3 R + 0,59 G + 0,11 B` (W3C Compositing),
  kết quả nhân sẵn `= a × mix(màu, B, a)` — điểm bán trong suốt ngả về màu tô y như canvas, `a = 0 → 0` nên không viền. **Kiểu 5** = như 4 trên bản TRẮNG của ảnh (`Lum = 1 → B = trắng`).
  **Kiểu 6** = phủ màu như kiểu 1 rồi alpha^2,2 (ảnh vòng gọn của vòng hồi chiêu: nhân sẵn nên cả 4 kênh × a^1,2).
- `GLR.aoTu(c, { k, t, mn })`: ảnh ảo PHÁI SINH từ ảnh gốc / ảnh ảo khác (giữ ô nguồn, alpha, mặt nạ; bản trắng + kiểu 4 → kiểu 5). Tầng mip của nó (`REN.mip`) giữ mặt nạ của tầng gốc.
- `GLR.dungG(w, h, { ve, dung })`: "canvas" mà nội dung do `ve(X)` VẼ BẰNG LỚP GL vào 1 bộ đệm khung rồi chép vào ô atlas (lớn: giữ làm texture riêng) — 1 lần; ô bị gom / mất ngữ cảnh → lần vẽ kế dựng lại trên GPU;
  ảnh nguồn chưa lên GPU (`GLR._hut` đổi) → bỏ, khung sau thử lại.
- `GLR.quat(X, ảnh, dx, dy, dw, dh, a0, d)`: phần hình quạt của 1 ảnh = các đa giác ≤ 90° (cắt theo ô ảnh) chung lô; 2 mép quạt khử răng cưa bằng mặt nạ tuyến tính theo khoảng cách tới mép.

**Đã chuyển:**
| nguồn canvas cũ | nay (bản GL ảnh ảo) |
|---|---|
| `REN.toMau` (support.js), `HU.toMau` (hieuung.js — cả `growfx` `duoiDau`, bóng trắng đầu ụ tô màu) | ảnh ảo kiểu 4 / 5 |
| `HU.matNa` (cột sáng triệu hồi `fx_summon`, sao lên bậc `fx_starup`) + `toMau(matNa)` | ảnh ảo + mặt nạ (m tính theo toạ độ v của texture) |
| `vfxmoi.js dung()` — 8 dải vệt lửa Rồng Máy 1016×159 | `GLR.dungG` (lát 10 ô của tờ gốc trên GPU); dựng sẵn ở màn mở đầu khi bộ bài có Rồng Máy |
| `camgiac.js dai` — dải nổ trúng 6 khung / chớp nòng 4 khung (≤ 960×160) | `GLR.dungG`: vẽ ảnh theo tầng mip + khoét `'destination-out'` trong bộ đệm khung; phủ màu nguyên tố = ảnh nguồn kiểu tô 1 |
| `PX.cung` — ảnh cung nướng theo góc (1/128 vòng × cỡ × màu) | `GLR.quat` trên ảnh vòng (tầng mip vừa cỡ) |
| `PX.anhHoi` — ảnh vòng hồi chiêu gọn (alpha^2,2 bằng `getImageData`) + chuỗi mip thật | ảnh ảo kiểu 6 |
| `camgiac` `mau()` đọc màu trội | đọc thẳng `Image` 20×20 (không dựng lại bản canvas cỡ gốc) |

Chưa chuyển (ít trong vết đo): `bonglan|…` (2 / trận), `REN.glow`, `cdPhanChup` (1 / lần trùm chết), khung 4×4 của jackpot.

**Làm nóng lần dùng đầu (`nongskill.js` `NS.dsHieuUng` / `NS.napGL`):** bản GL trước đây bỏ bước "vẽ thử" nên ảnh hiệu ứng chỉ lên GPU ở lần dùng đầu. Thử nạp CẢ danh sách `UI.dsTran` (290 ảnh) →
atlas 5 trang đầy 0,87–0,99 ngay màn mở đầu, GPU +56 MB, gom atlas 6 lần / 120 s (bỏ 147 ô), đọc ngược GPU 2 lần (1 lượt dọn 154 ms) → **bỏ cách đó**. Nay chỉ nạp ảnh chắc dùng:
hình phát bắn đầu của từng ụ (`FXU.dsAnh`: `_dan / _trung / _no / _tia`), tờ P2 / P3, `VXM.U` (gọi tải luôn nếu là ảnh tải lười), **ảnh đã vẽ ở trận trước của phiên** (`g._lvThay` — `glr.js` ghi tầng nét nhất từng vẽ),
và bảng `NONG_META` nếu có (chưa có). Tầng nạp = tầng từng vẽ / tầng trong bảng / tầng thô nhất mà cạnh ngắn ≥ 192 điểm.
**Không đoán trước được từ bộ bài (không có sổ đăng ký ụ → ảnh):** ảnh riêng của từng ụ nạp rải rác trong mô-đun của nó — Lucky Slot `cb_*`, Merge King `tv_ghep*`, Rồng Máy `ronglua_f2–f4_*` / `lua_t*` / `fx_wyrm_lua2*`,
chiêu chữ ký `sig_*` / `dosig_*`, mốc sao `p1_sao3/5/7`, `lev_abyss`, `vfxp0_*`, thẻ trùm `tb_*`, ảnh chỉ huy `cmd_*` / `cf_*` — trận ĐẦU của phiên vẫn tải ở lần dùng đầu (mỗi ảnh 1–2 lần); từ trận thứ 2 cùng phiên thì đã học.
Quái / trùm vẫn nạp trước 3 wave giữa trận (hàng nạp nền, khung nhẹ) như mục 10.

**Số đo** (`tools/thap-kt-tai-gl.js`, co-op 3×, `ios=1`, wave 25 → 49, 120 s, Chromium + GPU phần mềm → chỉ SỐ ĐẾM có nghĩa; "trước" = `74582a0`):
A = bộ `bocap,sinhdoi,tudo,cobac,saochep` + `leviathan,ronglua,nemesis,khoisinh,vughep` · B (nhiều hiệu ứng) = `ronglua,lualien,leviathan,overlord,nhatthuc` + `lophanung,orbital,wallgen,vungdoc,drone`.
| | A trước | A sau | B trước | B sau |
|---|---|---|---|---|
| màn mở đầu: tải canvas / tải Image / MB canvas + GPU | 32 / 88 / 37 + 53 = 90 | 28 / 136 / 26 + 76 = 102 | 34 / 90 / 37 + 53 = 90 | 29 / 149 / 26 + 94 = 121 |
| tải canvas → texture, cả 120 s (/ giây) | 154 (1,28) | 131 (1,09) | 123 (1,02) | 112 (0,93) |
| … sau 10 s đầu (/ giây) | 61 (0,55) | 48 (0,44) | 59 (0,54) | 64 (0,58) |
| … 60 s cuối (/ giây) | 4 (0,07) | 6 (0,10) | 3 (0,05) | 17 (0,28) |
| tải Image → texture, cả 120 s (/ giây) | 139 (1,16) | 131 (1,09) | 161 (1,34) | 139 (1,16) |
| … sau 10 s đầu (/ giây) | 54 (0,49) | 58 (0,53) | 78 (0,71) | 77 (0,70) |
| … 60 s cuối (/ giây) | 18 (0,30) | 17 (0,28) | 29 (0,48) | 37 (0,62) |
| tải tĩnh nhiều nhất 1 khung | 4 | 4 | 4 | 4 |
| canvas đệm còn điểm ảnh: MB (số canvas) lúc 10 · 60 · 120 s | 43 (221) · 41 (198) · 40 (204) | 33 (186) · 23 (190) · 23 (181) | 42 (198) · 40 (185) · 42 (190) | 29 (153) · 22 (154) · 22 (189) |
| MB GPU lúc 10 · 60 · 120 s | 80 · 123 · 122 | 98 · 118 · 125 | 95 · 132 · 125 | 117 · 131 · 123 |
| tổng MB canvas + GPU | 123 · 164 · 162 | 132 · 141 · 149 | 137 · 173 · 166 | 145 · 153 · 145 |
| số texture | 19 · 27 · 24 | 22 · 26 · 25 | 23 · 24 · 19 | 26 · 24 · 18 |
| lệnh vẽ GL / khung (trung bình tới lúc đó) | 129,5 · 173,3 · 197 | 118 · 174,2 · 206,9 | 123,2 · 192,7 · 209,4 | 169 · 213,6 · 214,7 |
| lần gom atlas · đọc ngược GPU | 0 · 0 | 0 · 0 | 0 · 0 | 1 · 0 |
| ảnh dựng trên GPU (`dungG`) | 0 | 21 | 0 | 26 |

Tải canvas → texture theo NƠI TẠO (cả 120 s sau màn mở đầu), phần HIỆU ỨNG: A trước 26 (10 + 1 `camgiac dai` 960×160, 8 `vfxmoi dung` 1016×159, 3 tầng mip của `matNa` 633×115, 3 `HU.toMau` 1116×186, 1 `matNa` 1266×211) → sau 0;
B trước 32 (14 `camgiac dai`, 8 `vfxmoi dung`, 9 tầng mip, 1 `toMau`) → sau @@BHU@@. Còn lại sau (A / B): huy hiệu sao `hh…` 81 / 68 + bệ `than|…` 8 / 5 (phiên W3), tờ chữ `chugl.js` 512×249 lần đầu 31 / 21, `bonglan` 2 / 2, `glow` 1, `cdPhanChup` / `cdChup` 1 / 3, jackpot 4×4 1.
Số tải Image giữa trận gần như không đổi (A 139 → ~130, B 161 → ~140): phần lớn là ảnh riêng của từng ụ không liệt kê trước được (xem trên) + quái / trùm nạp trước 3 wave; 2 lần chạy cùng mã lệch ±3 % (bộ hẹn giờ thật).
`PX.cung` không xuất hiện trong 2 vết đo (vòng hồi chiêu không vẽ khi tự đánh) — đã chuyển + kiểm bằng công cụ so hình.

**Kiểm:**
- `tools/thap-kt-gl-hieuung.js` (mới): mỗi họ hiệu ứng vẽ 2 lần cạnh nhau TRONG CÙNG 1 khung GL — trái = đường GPU, phải = canvas dựng bằng hàm CPU cũ: 109 ca ✓ — tô 'color' theo màu 10 ụ hỗ trợ × 3 ảnh + 7 màu × `fx_link / fx_evolve / fx_awaken`
  (0 điểm lệch > 24 mức, lệch sắc ≤ 0,3°), mặt nạ `fx_summon / fx_starup` (0 điểm > 24), `toMau(matNa)` (≤ 749 điểm > 24 trên 110 nghìn, 0 điểm > 60), bản trắng đầu ụ 6 ụ, 8 dải vệt lửa (khớp), dải camgiac 20 dải
  (lệch trung bình ≤ 3,1 mức, sắc ≤ 2,1° — do GPU thu bằng tầng mip + song tuyến tính thay lọc 'high' của canvas), 9 cung (≤ 26 điểm > 24 ở mép). Ảnh: `/home/claude/xem/gl-full-w4/hu_0..7.png`, `xem_*.png`.
- Ảnh CÙNG trạng thái trong trận (co-op bộ B, khung 500 và 900, 390×844 DPR 3, `SOSANH=1`): GL mới ↔ GL bản trước (`74582a0`, hiệu ứng còn dựng canvas) lệch > 40 mức ở **3 / 0 điểm ảnh** trên 2,96 triệu;
  GL ↔ 2D: 3 941 / 3 525 điểm (bản trước: 3 953 / 3 536 — khác biệt sẵn có của lớp GL, không do đợt này). Ảnh: `coop_B_500_gl1.png / _gl0.png`, `coop_B_900_…`.
- Băm trạng thái có vẽ (`HASH=450,900`) gl=1 = gl=0: cảnh A `8b4f420b` / `2f83154d`, cảnh B (nhiều hiệu ứng) `dc4831e1` / `318d8f3d`.
- `MAT=200,320` (co-op bộ nhiều hiệu ứng): 2D dự phòng đủ hình (ảnh ảo + ảnh dựng GPU dựng thật qua hàm cũ) → GL lại, 0 lỗi trang, `veChet` 0. `?gl=1`, `?gla=0`, `?glv=1` (WebGL1: shader mới biên dịch được), `?gl=0`: tải trận không lỗi, cùng băm.

**Giới hạn / cần xem trên iPhone thật:**
- Kiểu 4 / 5 và mặt nạ chỉ mới chạy trên SwiftShader; công thức chia `t.rgb / t.a` + rẽ nhánh — GPU thật khác độ chính xác ở điểm alpha rất nhỏ (kỳ vọng không thấy bằng mắt).
- Dải dựng trên GPU dùng bộ đệm khung tạm + `copyTexSubImage2D` (cùng chuỗi lệnh `aoKiem` đã thử lúc khởi tạo). Ảnh nguồn chưa lên GPU → hiệu ứng nổ trúng đầu tiên của 1 loại đạn có thể trễ 1–vài khung.
- Mép quạt của vòng hồi chiêu khử răng cưa theo khoảng cách (không phải lấy mẫu phủ như canvas) — chỉ khác ở 1 điểm ảnh mép.
- Làm nóng thêm ~44 ảnh ở màn mở đầu (GPU cuối màn mở đầu 53 → 76 MB (A) / 94 MB (B); giữa trận tổng không đổi vì trần atlas 5 trang).

**Việc kế:** (1) sinh `thap/js/nong-meta.js` = bảng `NONG_META[id ụ] = { tên ảnh: tầng }`: chạy `tools/thap-kt-tai-gl.js` từng ụ (bàn chỉ 1 loại ụ), lấy `kq.nong` trừ đi phần chung → hết tải lần đầu ngay từ trận đầu của phiên;
(2) `bonglan` = `GLR.dungG` + kiểu hoà `'destination-in'`; (3) số còn lại của canvas → texture là huy hiệu sao `hh…` + bệ `than|…` (phiên W3) và tờ chữ lần đầu của `chugl.js`.
