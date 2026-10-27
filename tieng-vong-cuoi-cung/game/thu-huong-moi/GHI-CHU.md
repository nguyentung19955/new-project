# Thử hướng mới "Cổ tích chuông tàn" – cảnh chuẩn Làng Chuông (27/10/2026)

Viết cho người không rành kỹ thuật. Làm theo `art/huong-moi/TU-VAN-CHUYEN-GIA-2-CO-TICH-CHUONG-TAN.md`: **mục 5 bước 1–2 + mục 3 (ánh sáng)**.
**Chưa gen ảnh mới**: chỉ chỉnh bằng code trên asset hiện có + **Lam cũ**. Đây là **trang thử riêng**, sinh từ `game/demo.html` bằng script
(như các thư mục `thu-*`); **KHÔNG sửa** `demo.html`, `build-demo.py`, `demo-doi-chieu-v3.html`.

**Chơi thử:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-huong-moi/thu-huong-moi.html
— cảnh chuẩn là **màn hình thứ hai của Cổng làng**: chạy sang phải qua 2 bậc là tới (đèn treo, vực, chuông làng treo giữa cột treo và khối tường).

**Bật / tắt từng lớp để so** (thêm vào cuối link, nhiều cờ nối bằng `&`, vd. `...thu-huong-moi.html?suong=0&bui=0`):

| Cờ | Tắt gì |
|---|---|
| `?hm=0` | tắt HẾT → giống hệt demo hiện tại (dùng làm ảnh TRƯỚC) |
| `?grade=0` | không đổi màu (giữ màu gốc, các lớp sáng vẫn còn) |
| `?sang=0` | không quầng sáng (đèn, chuông, vệt sáng sàn, ánh đỏ đáy vực) |
| `?suong=0` | không sương mỏng + không làm tối đáy vực |
| `?vignette=0` | không tối góc |
| `?bui=0` | không hạt bụi sáng |
| `?dat=0` | không dịu vân rễ / không bo góc / không làm tối thân đất |
| `?bot=1` | giữ đủ trang trí cũ ở góc cảnh chuẩn (đèn thứ 2, chân rễ, rễ treo đầu cột, mảng rễ trên sàn) |
| `?vuc=0` | giữ hố nông cũ (không đào thành vực) |
| `?quai=1` | thêm 1 Chuông Gỗ đứng sau vực (để xem "nguy hiểm nổi nhất", rêu olive, lóe đòn cam đỏ) |

**Chưa thử trên iPhone thật.** Mọi ảnh / số đo là Chromium headless trên máy chủ Linux không GPU.

## 1. Xem gì trước (thư mục `xem-thu/`)

| File | Nội dung |
|---|---|
| `ghep-truoc-sau.png` | **TRƯỚC (demo hiện tại) \| SAU**, 960×540, cùng góc camera (x 192), Lam đứng trên bậc 2 dưới đèn – xem cái này đầu tiên |
| `ghep-truoc-sau-xam.png` | như trên, bản XÁM – kiểm sáng–tối (Lam sáng nhất? sàn tách nền?) |
| `ghep-truoc-sau-2.png` | Lam đã đi qua, đứng dưới chuông làng (SAU: chuông đã tắt) |
| `truoc.png`, `sau.png`, `truoc-2.png`, `sau-chuong-tat.png` + `*-xam.png` | từng ảnh rời |
| `tung-lop.png` | 6 ô cùng góc: đủ lớp / `?grade=0` / `?sang=0` / `?suong=0` / `?vignette=0` / `?dat=0` |
| `sau-khong-suong.png` | `?suong=0` – để chấm tiêu chí "không cần sương mới thấy chiều sâu" |
| `sau-co-quai.png` (+ xám) | `?quai=1`: quái chuông gỗ sau vực, rêu đã thành olive |
| `iphone-844x390-truoc.png` / `-sau.png` | iPhone ngang 844×390, có nút cảm ứng, camera lệch lên 28 như game |
| `lam-qua-canh-chuan-60fps.mp4` | **4 s, 60 hình/giây** (mỗi hình = 1 bước game): Lam chạy từ sau điểm lưu, lên 2 bậc, nhảy qua vực, đi dưới chuông làng → chuông **ngân trầm 1 lần, lắc, tắt dần** (khung 146), Lam dừng trước khối tường |
| `truoc-lam-qua-canh-60fps.mp4` | cùng đường chạy trên demo hiện tại (để so) |
| `so-do.json` | thời gian vẽ mỗi khung TRƯỚC / SAU, thời gian tô màu lúc nạp, lỗi trang (= 0) |

## 2. Đã chỉnh gì

**Cảnh chuẩn (bước 1)** – góc phải phòng Cổng làng 1, camera x 192:
- **Một đèn**: giữ đèn treo trên bậc 2 (hạ thấp 92 → 140 để trên iPhone không bị dòng hướng dẫn che), **ẩn** đèn thứ hai (cờ, không xoá).
- **Một chuông**: chuông làng treo dây giữa cột treo và khối tường – quả chuông cắt từ ảnh "điểm lưu tắt" có sẵn (chỉ chuông + quai). Còn sáng
  khi Lam chưa tới; **Lam đi qua dưới chuông → ngân trầm 1 lần, lắc, tắt dần trong 1,4 s và ở lại tắt** (thay đổi có nguyên nhân, mục 3 file tư vấn).
  Không phải điểm lưu, không chạm được.
- **Một vực tối**: hố cũ cột 19–21 đào thành vực không đáy (CHỈ trong trang thử; rơi xuống → về mép vực trái, không mất máu).
- **Ít đồ vật**: bỏ (bằng cờ) chân rễ nhỏ, rễ treo đầu cột, dải mép đáy hố, mảng rễ trên sàn ở góc này. Giữ mép đất (làm mềm mép sàn) và mảng gỗ.

**Màu (bước 2)** – tô SẴN 1 lần lúc nạp (bảng tra màu 3 chiều 33³ như file `.cube`), không xử lý điểm ảnh mỗi khung:
- Mỗi màu được kéo về **dải màu bảng khởi đầu**: dải ẤM `#17272C → #39312E → #65503C → #A78046 → #F2D69A` (gỗ, đất, đồng, đèn) trộn với dải
  LẠNH `#17272C → #35465C → #648D88` (nền xa). Lớp càng xa: càng lạnh, càng tối, **càng ít tương phản**; sàn chơi giữ sáng nhất trong cảnh.
- **Rêu xanh chanh → olive xỉn** (mọi ảnh cảnh; và quái khi `?quai=1`).
- Viền đen tuyền thành đen xanh đậm (bớt "đồ chơi").
- **Lam KHÔNG bị tô màu** (Lam cũ giữ nguyên) → Lam là thứ rực nhất cảnh.

**Thân đất (giảm nhiễu)**: vân rễ nhỏ giữ 40 % độ gắt ở ô thân, 65 % ở ô cạnh (làm mờ rồi trộn lại); thân tối hơn 20 %, ô có mặt trên sáng ở
mặt rồi tối dần xuống (không có vạch nối) → **mặt sàn nổi, thân lùi vào bóng**; **bo tròn góc lộ** 6 px (cạnh cắt vuông → góc mềm, viền tối vẽ lại theo cung).
Va chạm (collider) KHÔNG đổi.

**Ánh sáng (mục 3)** – mọi quầng / sương / vignette / chấm bụi là **ảnh vẽ sẵn**, mỗi khung chỉ "dán" ảnh; **không shadowBlur, không blur, không
ctx.filter mỗi khung** (theo MDN trong file tư vấn):
- **Vàng = đèn dẫn đường**: quầng quanh đèn + vệt sáng rất nhẹ rơi xuống sàn / Lam dưới đèn. Đây là **điểm thu hút chính**.
- **Đồng ấm nhỏ** quanh chuông làng khi còn sáng (nhỏ hơn đèn), tắt hẳn sau khi Lam đi qua.
- **Teal = Vọng / ký ức**: không thêm teal mới vào cảnh (để dành cho bóng Vọng như cũ).
- **Cam đỏ = nguy hiểm**: ánh cam đỏ rất mờ, thở chậm dưới đáy vực; với `?quai=1` lóe đòn của quái đổi vàng → cam đỏ (để vàng chỉ còn nghĩa "đèn").
- **Sương mỏng sau địa hình**: chỉ vẽ dưới mặt sàn, trước gạch → gạch che, chỉ lộ ra ở vực; không phủ sàn hay nhân vật. Đáy vực tối dần.
- **Vignette 13 %** ở góc; dải chân sàn chỉ tối ≤ 3 % (tránh vùng tiếp đất).
- **18 hạt bụi** chỉ trong vùng sáng của đèn, trôi chậm.
- Quầng điểm lưu: như cũ nhưng là ảnh vẽ sẵn (bản cũ tạo gradient mới mỗi khung).

## 3. Số đang dùng (chỉnh ở đầu `cong-cu/khoi-huong-moi.js`, bảng `HM_SO` và `HM_CANH`, rồi chạy lại `tao-tu-demo.py`)

| Số | Giá trị | Nghĩa / chỉnh thế nào |
|---|---|---|
| `GRADE.xa` | lanh 0,85 · tron 0,70 · tp 0,50 · sang 0,70 | nền xa: `tp` = tương phản giữ lại (thấp = phẳng), `sang` = độ sáng, `tron` = mức thay bằng bảng màu, `lanh` = mức xanh lạnh |
| `GRADE.giua` | 0,60 · 0,62 · 0,60 · 0,68 | nhà, cầu, giá chuông. Muốn nền rõ hơn: tăng `sang` |
| `GRADE.gan` | 0,35 · 0,55 · 0,75 · 0,78 | khung rễ gần |
| `GRADE.tien` | 0,50 · 0,70 · 0,80 · 0,62 | rễ treo tiền cảnh (bóng viền khung) |
| `GRADE.dat` | 0,10 · 0,45 · 0,85 · 1,00 | gạch + trang trí đất – sàn chơi |
| `GRADE.doVat` | 0 · 0,25 · 0,95 · 1,00 | điểm lưu, cổng, công tắc, đèn, chuông |
| `REU` | 62–150° → 50°, bão hoà ×0,45, sáng ×0,8 | rêu chanh → olive. Muốn rêu xỉn hơn: giảm `giuBao` |
| `DAT.kThan / kCanh / kTT` | 0,40 / 0,65 / 0,55 | phần vân nhỏ giữ lại (1 = như cũ) ở thân / ô cạnh / mảng gỗ |
| `DAT.r` | 5 | độ rộng làm mờ (px ảnh 2x) |
| `DAT.boGoc` | 6 | bán kính bo góc lộ (px logic); 0 = vuông như cũ |
| `DAT.sangThan` | 0,80 | độ sáng thân đất so với mặt sàn |
| `SANG.den` | r 150, a 0,80 | quầng đèn (bán kính, độ mạnh) |
| `SANG.denSan` | r 200, a 0,16 | vệt sáng rơi xuống sàn / Lam |
| `SANG.chuong` | r 70, a 0,34 | quầng chuông làng khi còn sáng |
| `SANG.tatSau` | 84 bước (1,4 s) | thời gian chuông tắt dần |
| `SANG.vucDo` | r 120, a 0,20 | ánh cam đỏ đáy vực |
| `SUONG` | a 0,55, màu `#648D88`, tốc 0,12, đáy tối 88 % | sương trong vực |
| `VIGNETTE.a` | 0,13 | tối góc (tư vấn: 8–15 %) |
| `BUI.n` | 18 | số hạt bụi (tư vấn: 12–24) |
| `HM_CANH.den / chuong / vuc` | đèn x 560 y 140 · chuông x 848 y 214 · vực x 608–704 | vị trí trong cảnh chuẩn |

## 4. Đo

| | TRƯỚC (`?hm=0`) | SAU |
|---|---|---|
| Vẽ 1 khung, đứng yên 600 khung (trung bình / 95 % / tối đa) | 21,4 / 29,0 / 45,5 ms | 12,2 / 18,1 / 29,7 ms |
| Vẽ 1 khung, bot chạy qua cảnh | 19,9 / 29,2 / 37,8 ms | 13,9 / 19,0 / 28,0 ms |
| Thêm lúc nạp (tô màu + dịu vân + đổi lại thành ảnh) | 0 | ≈ 1,5 s (tô 0,9 s, trong đó dịu vân 0,36 s; đổi ảnh 0,5 s), 8,7 triệu điểm ảnh, 23 ảnh |

- Máy đo là **CPU không GPU** nên số tuyệt đối lớn hơn iPhone nhiều; chỉ nên so TRƯỚC / SAU. SAU nhanh hơn chủ yếu vì cảnh ít đồ hơn và đèn
  không tạo gradient mỗi khung; lớp sáng + sương + vignette + bụi tốn ≈ 6 ms ở máy này. Số dao động ± vài ms giữa các lần chạy.
- Lần đầu thử, ảnh đã tô để dạng canvas → vẽ chậm gấp 5 (trình duyệt không thu nhỏ sẵn được); đã sửa: ảnh tô xong được đổi lại thành ảnh thường.
- **Chưa đo iPhone thật.** Riêng 1,5 s nạp thêm có thể thành 2–4 s trên iPhone → khi duyệt xong hướng màu, nên **tô sẵn ra file PNG/WebP
  bằng script** (cùng công thức) thay vì tô lúc nạp: không tốn gì khi chơi.

## 5. Tự đánh giá theo tiêu chí duyệt (mục 5 file tư vấn)

| Tiêu chí | Đánh giá | Ghi chú |
|---|---|---|
| Nhìn ở cỡ chơi vẫn nhận ra **mắt – mũ – chuông** | **Đạt một phần** | Mũ nhọn + mắt vàng rõ (cả bản xám, cả iPhone). Chuông cổ Lam nhỏ, chỉ là chấm vàng, lẫn với chuôi dao. Đây là hình Lam cũ – chờ Lam mới (chuông đồng cũ to hơn, một mảng sáng) |
| **Lam không chìm** trong tối | **Đạt** | Lam là vật sáng / bão hoà nhất (bản xám: Lam sáng hơn nền rõ). Nhưng đạt "quá mức": viền cyan neon của Lam cũ giờ càng chói trên nền trầm – chưa hợp hướng mới |
| Cảnh có **một điểm thu hút chính** | **Đạt** | Đèn treo + vệt sáng dưới nó; chuông làng sáng nhỏ hơn, và tắt sau khi Lam đi qua. Điểm phụ tranh mắt: Lam (cyan) – sẽ đỡ khi có Lam mới |
| **Không cần thêm sương** mới thấy chiều sâu | **Đạt một phần** | `sau-khong-suong.png`: vẫn đọc được 3 tầng (nền xa phẳng tối → nhà/cầu → sàn sáng) nhờ phân cấp màu. Nhưng tắt sương thì **vực mất tối** (lộ nền nhà phía sau, vì lớp tối đáy vực đi chung cờ `suong`), vực chỉ cao ≈ 90 px trên màn, và nền giữa vẫn đông chi tiết (nhà, cầu, chuông nhỏ) → chiều sâu còn "phẳng như tấm phông". Cần ảnh cảnh chuẩn mới (prompt 4) |

**Chưa đạt / còn lấn cấn**
1. Nền giữa (ảnh gen cũ) vẫn nhiều chi tiết nhỏ: tô tối + bớt tương phản chỉ làm nó lùi, không làm nó "yên tĩnh" thật. Đúng như tư vấn: không thể chỉ phủ tối asset cũ.
2. Thân đất vẫn là lưới rễ (đã dịu, nhưng vẫn lặp); khối tường phải có mảng gỗ phẳng ở trên, lưới rễ ở dưới – hai chất liệu.
3. Viền cyan + găng / ủng nâu tròn của Lam cũ trông "đồ chơi" hơn trên nền mới. Quái (`?quai=1`) cũng vậy: rêu đã olive nhưng dáng vẫn hoạt náo.
4. Màu nền chuyển sang xanh lạnh khá mạnh; nếu thấy quá "lạnh" thì giảm `lanh` của `xa`/`giua`.
5. Trên iPhone dòng hướng dẫn trên cùng vẫn che mép trên quầng đèn (đã hạ đèn xuống).
6. Vực, chuông làng, ẩn đèn là thay đổi **chỉ trong bản thử** (gameplay demo không đổi).
7. Dấu "!" vàng trên đầu quái khi lấy đà vẫn vàng (vẽ trong code demo) – nếu theo quy ước màu thì nên đổi sang cam đỏ khi ghép.

## 6. Chỗ sẽ thay khi có Lam mới / ảnh mới

- **Lam mới (prompt 1)**: thêm vào trang thử như một clip / ảnh đứng cạnh Lam cũ trong cùng cảnh, cùng 112 px (bước 3 mục 5). Không tô màu Lam
  (giữ màu gốc của ảnh duyệt). Khi đó có thể thêm **rim light vẽ sẵn** (P2) một đoạn trên mũ/vai.
- **Cảnh chuẩn mới (prompt 4)**: thay 3 lớp nền Làng Chuông ở `nen/`; giữ nguyên cách tô (`GRADE.xa/giua/gan`) hoặc giảm `tron` vì ảnh mới đã đúng màu.
- **Quái mới (prompt 3)**: thay mảnh trong `runtime/quai-boss/`; bỏ preset `quai` (không cần sửa rêu nữa), giữ lóe đòn cam đỏ.
- Khi chốt màu: chuyển phần tô lúc nạp thành script tô sẵn ra file (mục 4).

## 7. Cách ghép vào `demo.html` (khi duyệt)

Mọi chỗ đổi nằm trong `cong-cu/tao-tu-demo.py` dạng cặp (cũ → mới); cột `ghep=True` là **7 chỗ cần ghép** (in ra khi chạy script): gọi
`HM.veSauNen` sau nền, `HM.veDen` trong `drawDen`, `HM.veChuong` trong `drawSaveBell`, `HM.veTruoc` sau tiền cảnh, `HM.buoc` sau
`updateHazards`, `await HM.chuanBi(lc)` sau `dungGach(); dungDen();`, và khối `HM_SO` / `HM_CANH` / `HM` của `khoi-huong-moi.js`
(từ đầu tới trước dòng `/* === THỬ`). Phần sau dòng đó (đào vực, thêm quái, bot, `TVTHU`) KHÔNG ghép.

## 8. File và cách chạy lại

```
game/thu-huong-moi/thu-huong-moi.html     bản thử (SINH RA, đừng sửa tay)      python3 game/thu-huong-moi/cong-cu/tao-tu-demo.py
  cong-cu/khoi-huong-moi.js               khối mới: số chỉnh (HM_SO, HM_CANH), tô màu, dịu vân, ánh sáng, chuông làng, bot, TVTHU
  cong-cu/chup.py                         ảnh duyệt + xám + ghép + từng lớp + iPhone + so-do.json     python3 -B game/thu-huong-moi/cong-cu/chup.py
  cong-cu/quay-video.py                   video 60 fps ("truoc" = quay thêm bản demo hiện tại)       python3 -B game/thu-huong-moi/cong-cu/quay-video.py truoc
  xem-thu/                                ảnh, video, số đo
```
Không có kiểm thử tự động: `chup.py` / `quay-video.py` chỉ chụp, quay và ghi số đo cho người duyệt xem.
