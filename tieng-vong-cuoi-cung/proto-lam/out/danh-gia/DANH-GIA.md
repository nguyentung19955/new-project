# ĐÁNH GIÁ LẠI pipeline Three.js → pixel 64×64 của Lam (ưu tiên chất lượng pixel art)

Phạm vi: chỉ đọc/so sánh và thử trên 2 khung Run F0, F1. **Không** ghi đè `out/run/*`, `out/idle/*`, không đổi `game/anim/*`, `game/demo.html`, `game/lib/*`, `art/sprite/*`, `tools/*`, không sửa `proto.html`. Mọi thứ mới nằm trong `proto-lam/out/danh-gia/` và 3 script mới `proto-lam/danh-gia-chup.py`, `danh-gia.py`, `cleanup.py`, `mau-ve-tay.py`.

Ảnh để xem (mở ở 100 %, không để trình xem làm mờ):

| Ảnh | Nội dung |
|---|---|
| `so-sanh-3d-vs-goc.png` | mẫu gốc · render 3D 512 px Idle F0 · render 3D 512 px Run F0, 12 số đỏ đánh dấu chi tiết mất ngay từ mô hình |
| `so-sanh-ha-phan-giai.png` | ×8: gốc thu về 64 · 512→64 nearest · 512→64 đa số · render thẳng 64 · pipeline hiện tại + bảng bộ phận |
| `flicker-map.png` | ×8, 8 khung: vàng = pixel khác khung trước, đỏ = pixel chỉ tồn tại 1 khung (mép nhích), trắng = đốm lẻ ≤ 3 px chỉ sống 1 khung |
| `ma-bo-phan.png` | ×8: run-0 · mặt nạ ID tô màu riêng · pixel kề khác bộ phận mà cùng màu (đỏ) / xám chênh 1 bậc (cam) |
| `so-sanh-cu-moi-x4.png`, `-x8.png` | F0, F1 cũ (trên) / mới sau cleanup (dưới), cạnh mẫu gốc thu về 64 |
| `trong-game-x1.png` (480×270, ×1), `trong-game-x4.png` | F0 F1 cũ · F0 F1 mới trên nền Làng Chuông |
| `run-0-moi.png`, `run-1-moi.png` | 2 khung 64×64 sau cleanup |
| `mau-ve-tay-dung.png`, `mau-ve-tay-so-sanh-x8.png` | 1 khung mẫu minh hoạ hướng "từ mẫu gốc + dọn tay" (tư thế đứng) |
| `so-lieu.json`, `cleanup-so-lieu.json` | toàn bộ số đo |

---

## PHẦN A – CHẨN ĐOÁN

### A1. Chi tiết mất NGAY TỪ MÔ HÌNH 3D (ảnh `so-sanh-3d-vs-goc.png`)

Render 512 px cùng camera (toon, có khử răng cưa, chưa hậu kỳ) cho thấy vấn đề **không nằm ở bước xuống 64 px** – mô hình 3D đã khác mẫu Lam gốc từ đầu:

1. **Mắt** – mẫu có 2 vệt vàng nhạt rõ; render 512 **không có mắt**. Hai điểm mắt trong sprite hiện nay là bước hậu kỳ "chấm lại" 2 px theo xương đầu, không phải hình thật.
2. **Khoang mặt đen + mép mũ xanh sáng** – render chỉ là khối mũ xám; viền xanh cũng là hậu kỳ tô lên mép trên/trái (tức phía **sau** gáy), trong khi mẫu có mép xanh ở **trước** quanh khoang mặt.
3. **Hình mũ** – mẫu: chỏm nhọn gập về sau, nếp góc cạnh; render: mũ tròn bầu như quả bóng. Mũ+đầu chiếm 0,43 chiều cao (mẫu ≈ 0,37).
4. **Khoen + dây chuông** – mẫu có khoen tròn vàng ở mép mũ; render chỉ 1 sợi mảnh 0,5 px (bề dày ở 64).
5. **Chuông** – kích thước đúng (0,14 chiều cao cả hai) nhưng mẫu có vành sẫm, chỏm sáng, quả lắc; render là phễu vàng trơn.
6. **Trâm + đai chéo** – mẫu: vòng sáng rõ, đai tối chéo ngực; render trâm là chấm, đai chéo bị thân xanh lấn (ở 64 đai chỉ còn 1,25 px dày).
7. **Gấu áo thân** – mẫu: vạt xanh rách răng cưa, có bóng #21413A; render: khối xanh phẳng, gấu thẳng.
8. **Áo choàng** – mẫu: quấn ra **trước** và sang bên, lót xanh lộ rộng; render: tấm phẳng treo sau lưng, lót chỉ lộ ở đuôi.
9. **Găng/ống tay** – mẫu: xám sáng #4A5A6E có cổ tay; render: ống tối cùng ramp với áo → ở 64 tay gần có 10/31 px, tay xa 12/23 px là **#0C0F14** (viền trong ăn gần hết tay).
10. **Chắn kiếm** – mẫu: chắn ngang vàng rõ + chuôi; render: mẩu vàng nhỏ, ở 64 phải "ép" 1 px vàng bằng hậu kỳ chống nhấp nháy.
11. **Ủng** – mẫu: ủng cao, vạch xanh + khoá, mũi nhô; render: bầu tối, vạch ủng xa dày 0,75 px → **mất hẳn** ở 64 (0 ô thắng đa số, 2 px còn lại là nhờ cờ "bảo vệ").
12. **Góc nhìn** – camera xoay 22° về trước + nhìn xuống 12° nên thấy đỉnh vai, đỉnh mũ và một phần lưng; mẫu gốc là góc nhìn ngang thuần. Silhouette tổng thể (rộng/cao 1,05 vs 0,99) và cảm giác "chibi tròn" khác hẳn mẫu.

**Kết luận A1:** 12 chi tiết nhận dạng của Lam thì 10 chi tiết đã mất hoặc biến dạng ở mức mô hình, không hậu kỳ nào bù lại được. Hậu kỳ hiện tại đang "vá" 4 chi tiết (mắt, viền xanh, chắn kiếm, vạch ủng xa) bằng cách vẽ thêm pixel theo toạ độ xương – đây là lý do những pixel đó hay nhảy giữa khung.

### A2. Chi tiết mất KHI XUỐNG 64 (ảnh `so-sanh-ha-phan-giai.png`)

Bảng đo từ mặt nạ ID render 512 của Run F0 (diện tích quy về px² ở 64, bề dày lớn nhất tính bằng px ở 64, số ô 64 mà bộ phận thắng đa số):

| Bộ phận | S (px²) | dày max | ô thắng | px pipeline | nhận xét |
|---|---|---|---|---|---|
| dây chuông | 1,6 | **0,50** | 1 | 4 | mỏng < 1 px; 3 px còn lại do ưu tiên nét mảnh → vị trí đổi theo khung |
| vạch ủng xa | 1,2 | **0,75** | **0** | 2 | **mất**, chỉ còn nhờ cờ bảo vệ |
| thắt lưng/đai | 17,1 | 1,25 | 15 | 19 | dải 1 px đứt quãng |
| chân xa (quần) | 9,2 | 2,5 | 8 | 7 | đùi xa 1–2 px, lẫn vào áo choàng |
| chuôi/chắn kiếm | 11,7 | 2,24 | 13 | 16 | chắn ngang không đọc được |
| trâm | 5,3 | 1,9 | 5 | 7 | 7 px sáng là **to hơn mẫu** (mẫu ≈ 2 px) |
| tay xa / tay gần | 24 / 29 | 2,75 / 3,26 | 22 / 30 | 23 / 31 | sau viền trong chỉ còn 11 / 21 px có màu thật |

Bộ phận **dính nhau** khi xuống 64 (nhìn cột 2–4 của ảnh): hai ủng ở F2/F6 thành một khối tối 8 px; đùi xa dính vào vạt áo choàng; tay gần dính vào thân (13 cặp pixel kề xám chênh 1 bậc); chuông cách mũ 1–2 px nên dây chỉ còn 3–5 px và đổi hình mỗi khung.

Điều đáng chú ý: cột 1 (**mẫu gốc thu thẳng về 46 px cao, chỉ lấy màu đa số + khoá bảng, chưa dọn gì**) vẫn giữ được mắt, chuông to có vành, chắn kiếm, hai ủng, áo choàng quấn trước – tức ở 64×64 là **đủ chỗ** để Lam đọc được, vấn đề là nguồn hình (mô hình 3D) chứ không phải độ phân giải.

### A3. Pixel flickering giữa các khung Run (ảnh `flicker-map.png`)

Định nghĩa: pixel "chỉ 1 khung" = giá trị (màu/alpha) ở khung i khác cả khung i−1 lẫn i+1 trong khi hai khung kề giống nhau → nhấp nháy ở 12 FPS.

| Khung | px khác khung trước | px chỉ 1 khung | trong đó đốm lẻ ≤ 3 px (số đốm) | mép nhích |
|---|---|---|---|---|
| F0 | 608 | 137 | 52 (29) | 85 |
| F1 | 588 | 252 | 37 (23) | 215 |
| F2 | 693 | 97 | 32 (23) | 65 |
| F3 | 666 | 289 | 26 (16) | 263 |
| F4 | 625 | 141 | 30 (17) | 111 |
| F5 | 586 | 261 | 24 (18) | 237 |
| F6 | 698 | 114 | 42 (22) | 72 |
| F7 | 658 | 273 | 40 (24) | 233 |

- Sprite trung bình 993 px có hình; **mỗi khung có 586–698 px (≈ 60–70 %) đổi so với khung trước**. Sprite chạy vẽ tay thường chỉ đổi 25–40 % (đầu/thân gần như giữ nguyên, chỉ chân, tay, áo đổi).
- Tổng pixel "chỉ 1 khung" cả vòng: **1 564 px**, theo bộ phận: viền ngoài/nền 596, **mũ 288**, áo choàng 122, lưỡi kiếm 116, thân 97, đai 82, tay gần 49, ủng gần 38, mắt 29, … Trong đó **283 px là đốm lẻ ≤ 3 px** (168 đốm) – đây là loại nhấp nháy khó chịu nhất.
- Mũ nhấp nháy theo nhịp 2 khung (F1, F3, F5, F7 mỗi khung 65–73 px) vì nhún hông 1,8 px chu kỳ 4 khung làm mép mũ đổi hàng mỗi khung. Nhưng kể cả sau khi **căn chỉnh dịch nguyên pixel tốt nhất**, mũ hai khung kề vẫn khác nhau **15–25 px/≈ 240 px** (so-lieu.json → `muSauCanChinh`): đó là nhiễu lấy mẫu lại (render lại → gộp 2×2 → đa số), không phải chuyển động. Sprite vẽ tay chỉ dịch cả đầu 1 px, phần dư = 0.
- Vùng đầu + thân (lẽ ra tĩnh) đổi 125–152 px mỗi khung.

### A4. Vì sao màu áo, chân, tay LẪN NHAU (ảnh `ma-bo-phan.png`)

Mặt nạ ID (cột giữa) cho thấy mô hình **biết** rõ từng bộ phận – nhưng bước tô màu làm chúng trùng nhau:

1. **Mũ và áo choàng cùng ramp `ao0/ao1/ao2`** → ở run-0 mũ có #2C3546 ×86, áo choàng #2C3546 ×87: hai khối lớn nhất của sprite **cùng một màu chủ đạo**, chỉ cách nhau 1 px viền trong.
2. **Viền trong cùng màu #0C0F14 với màu nền của bộ phận kề**: quần xa (idle) và ủng, mặt trong mũ, bậc 0 của tay/áo đều là #0C0F14, nên 13/21 cặp "cùng màu kề nhau" là viền trong chìm vào bộ phận bên cạnh → viền tàng hình, tay/thân/áo dính thành một mảng tối.
3. **Viền trong ăn bộ phận mỏng**: tay rộng 2–3 px nên sau khi viền với thân, áo, mũ, kiếm, tay gần còn 21/31 px và tay xa 11/23 px là màu thật; phần còn lại đen → "tay biến dạng giữa khung" (hình dạng tay phụ thuộc viền nào thắng ở khung đó).
4. **Toon 3 bậc theo pháp tuyến**: cùng một bộ phận đổi bậc màu theo góc mặt → bậc 0 (tối nhất) của quần/tay/áo đều là #0C0F14 hoặc #1A212B, bậc này xuất hiện/biến mất theo khung. Thân xanh bias 0,14 nên gần phẳng (tốt), còn lại đều "lốm đốm".
5. **Thiếu quy tắc gần/xa nhất quán**: vòng 2 đổi chân xa sáng hơn chân gần (#212835 vs #1A212B) để tách – đúng là tách được nhưng ngược quy ước pixel art (xa tối hơn), đồng thời ủng xa lại trùng màu áo choàng bậc giữa.
6. **Camera 22°/12° làm chồng lấn**: đùi xa nằm sau vạt áo choàng, chuông sát lưng mũ 1–2 px, tay gần đè lên thân – các cặp này đều cùng họ xám nên không có ranh giới tự nhiên.

Số đo run-0: 21 px kề khác bộ phận **cùng màu**, 27 px kề khác bộ phận **xám chênh 1 bậc** (tayX↔thân 13, chânG↔chânX 5), 13 px viền trong tàng hình.

### A5. Có bổ sung được bước PIXEL-ART CLEANUP không?

**Có, và đã thử (Phần B)** – làm được các việc sau bằng Python trên dữ liệu thô 64×64 (chỉ số màu + ID + độ sâu lấy trước hậu kỳ, không cần sửa shader):

- **Theo bộ phận:** (a) bảng tra ramp **riêng từng ID** – mũ 2 tông tối (#1A212B/#212835), áo choàng sáng hơn mũ 1 bậc, tay/găng xám sáng (#2C3546/#4A5A6E – màu #4A5A6E hiện gần như không dùng), quần gần sáng hơn quần xa, ủng gần #212835 / ủng xa #1A212B, đai tối; (b) **viền trong bắt buộc** khi hai nhóm kề nhau cùng màu hoặc xám chênh ≤ 1 bậc, và luôn giữa mũ↔áo, chân↔chân, tay↔thân, áo↔chân; viền đặt lên pixel xa camera nhưng **không lên bộ phận mỏng ≤ 2 px** và không lên pixel mà bên kia đã là #0C0F14 (tránh viền tàng hình); (c) **pixel tối thiểu**: 2 mắt, chắn kiếm ≥ 1 px vàng, trâm **tối đa 2 px** (cắt từ 7), vạch ủng ≥ 2 px (lấy vị trí từ ID 512 nếu ở 64 mất), dây chuông nối liền tới mũ, viền xanh mũ ở mép trên và **mép trước quanh khoang mặt** thay vì sau gáy; (d) dọn pixel ID lạc (không dính nhóm mình → nhận nhóm/màu lân cận) và đốm màu lẻ 3/4 lân cận.
- **Theo thời gian:** xử lý cả 8 khung, pixel có (ID, màu) chỉ tồn tại 1 khung mà 2 khung kề giống nhau **và là đốm ≤ 3 px** → lấy giá trị 2 khung kề (đa số 3 khung); không đụng bộ phận dao động thật (chuông, kiếm, dây).

**Giới hạn (thật):**
- Cleanup chỉ đổi màu/viền của pixel **đã có**; không tạo ra hình mũ nhọn, áo quấn trước, chắn kiếm ngang, khoen chuông, gấu rách… (10/12 mục A1).
- Ổn định thời gian chỉ dám xoá đốm ≤ 3 px; phần "mép nhích" (200–260 px ở khung lẻ) là do nhún thân + lấy mẫu lại, muốn hết phải đổi cách sinh khung (giữ đầu/thân y nguyên và chỉ dịch nguyên pixel), tức sửa pipeline render chứ không phải hậu kỳ.
- Viền trong bắt buộc vẫn tốn pixel ở bộ phận hẹp; với tay 2–3 px không có cách nào vừa có viền vừa còn tay.

---

## PHẦN B – THỬ SỬA F0, F1 (`cleanup.py`, ảnh `so-sanh-cu-moi-x8.png`, `trong-game-x4.png`)

Cách làm: **script Python riêng `proto-lam/cleanup.py`**, không sửa `proto.html`. `danh-gia-chup.py` bọc `lam.hauKy` để lấy ci/id/dep 64×64 thô, `cleanup.py` làm lại toàn bộ hậu kỳ theo 7 bước ở A5 cho cả 8 khung (để có khung kề cho bước thời gian) nhưng chỉ xuất F0, F1.

Kết quả đo (cleanup-so-lieu.json):

| | F0 cũ | F0 mới | F1 cũ | F1 mới |
|---|---|---|---|---|
| px chỉ tồn tại 1 khung | 137 | **93** | 252 | **199** |
| trong đó đốm lẻ ≤ 3 px | 52 | **22** | 37 | **9** |
| px khác F0↔F1 | 588 | 507 | | |
| px đổi màu do ramp riêng | | 348 | | 326 |
| px viền trong đặt thêm | | 31 | | 34 |
| màu | 12 | 12 (không màu ngoài bảng, alpha 0/255) | | |

Màu theo nhóm F0 mới: mũ #212835/#1A212B (87/79), áo choàng #2C3546 ×104 → **mũ và áo choàng không còn cùng màu**; tay gần #4A5A6E ×16 + #2C3546 ×11 (chỉ còn 1 px đen, trước 10); tay xa 20/20 px có màu thật (trước 11/23); quần gần #212835 ×53 vs quần xa #1A212B ×35 → hai chân đọc được gần/xa đúng quy ước; trâm 2 px; mắt 2 px; chuông giữ 2 px chỏm sáng.

**Đạt được:** bộ phận tách màu rõ hơn; tay không còn bị viền nuốt; mũ/áo/chân phân biệt được ở ×1 lẫn ×4 (xem `trong-game-x4.png`); đốm nhấp nháy F0↔F1 giảm 52→22 và 37→9; không thêm màu, không làm mờ.

**Không đạt được (nói thẳng):** hình dáng vẫn là Lam "3D": mũ vẫn tròn, áo vẫn treo sau, không khoen chuông, chắn kiếm vẫn 1 mẩu, gấu áo thẳng, vạch ủng xa ở F1 vẫn 0 px (ID 512 cũng chỉ phủ < 25 % ô nên script không dám thêm); mép mũ vẫn nhích 1 px mỗi khung; so với mẫu gốc thu về 64 đặt bên cạnh, bản mới vẫn **không giống thiết kế gốc**. Cleanup làm sprite sạch hơn, không làm nó đúng mẫu hơn.

---

## PHẦN C – KẾT LUẬN THẲNG

**Pipeline 3D + cleanup tự động KHÔNG đạt chất lượng pixel art mục tiêu; chỉ đạt một phần (sạch hơn, tách màu hơn) và không thể đạt phần còn lại** vì:

1. 10/12 chi tiết nhận dạng của Lam mất ngay ở mô hình 3D; muốn có lại phải dựng lại mô hình gần như từ đầu (mũ nhọn có nếp, áo quấn trước, chắn kiếm, khoen, gấu rách, găng…) **và** đổi camera về góc ngang – tức làm lại toàn bộ Idle/Run đã duyệt về chuyển động, với rủi ro vẫn ra "chibi 3D".
2. Ở 46 px cao, pixel art tốt là quyết định **từng pixel** (mắt 2 px, dây 1 px đặt ở đâu, viền ăn vào bên nào); render + đa số 2×2 + viền tự động cho mỗi khung một quyết định khác → nhiễu lấy mẫu 15–25 px ở riêng mũ, không hậu kỳ nào triệt để được mà không làm cứng chuyển động.
3. Mẫu gốc thu thẳng về 64 (chưa dọn) đã đọc đúng Lam hơn mọi khung 3D – chứng tỏ hướng "từ mẫu 2D" là hướng ngắn hơn.

### Phương án đề xuất (để ChatGPT quyết)

**P1 – Vẽ tay từng khung, dùng render 3D làm lớp nháp tư thế (khuyên dùng).**
Cách làm: lấy khung mẫu đứng từ mẫu gốc (xem `mau-ve-tay-dung.png`: gốc thu về 64 + 3 quy tắc dọn + 121 pixel sửa tay ghi toạ độ trong `mau-ve-tay.py`), dùng mặt nạ ID 64 của mỗi khung Run 3D (đã có trong `raw/run-F-id.npy`) chỉ để biết chân/tay/áo ở đâu, rồi vẽ pixel lên theo mẫu: đầu + thân copy nguyên từ khung đứng và chỉ dịch 0–1 px theo nhún; chân, tay, áo choàng, chuông vẽ lại từng khung. Ưu: đúng thiết kế, viền và màu do người quyết nên ổn định tuyệt đối, 12 màu, không nhấp nháy; mỗi khung là file PNG sửa được bằng bất kỳ công cụ pixel nào. Nhược: cần người vẽ (hoặc ChatGPT vẽ từng pixel qua script toạ độ như `mau-ve-tay.py`); công ước lượng **1–2 giờ/khung** cho Run (chân + áo), Jump/Fall 1 giờ/khung, Attack 1,5–2 giờ/khung → Run 8 + Jump 4 + Fall 2 + Attack 6 = 20 khung ≈ 25–35 giờ; khó giữ quỹ đạo chân "vật lý" chính xác như 3D (nhưng tiêu chí mới không ưu tiên điều đó).

**P2 – ChatGPT sinh ảnh từng tư thế (như đã sinh mẫu gốc) rồi thu về 64 + dọn như `mau-ve-tay.py`.**
Ưu: nhanh ra tư thế, giữ "chất" của mẫu gốc; bước thu nhỏ + 3 quy tắc dọn đã có sẵn trong script. Nhược: ảnh sinh mỗi lần lệch tỉ lệ/màu/góc (mẫu gốc cũng không thẳng lưới: ô 12–23 px), nên **mỗi khung vẫn phải sửa tay 100–200 px** để đầu/thân trùng nhau giữa khung và khớp pivot [32,63]; chân có thể trượt; không kiểm soát được khép vòng Run. Phù hợp nhất cho khung tĩnh/ít (Idle, Fall), rủi ro cho Run 8 khung.

**P3 – Giữ pipeline 3D, dựng lại mô hình theo mẫu + camera ngang + cleanup.py.**
Ưu: Jump/Fall/Attack sinh tự động, quỹ đạo vật lý. Nhược: phải làm lại mô hình gần như toàn bộ (mục A1) và duyệt lại Idle/Run; kể cả làm xong, nhiễu lấy mẫu và viền tự động vẫn còn (A3, A5); chi phí tương đương P1 mà kết quả không chắc đạt – **không khuyên**.

**Khuyến nghị:** chọn **P1**, với P2 làm nguồn tư thế nếu không có người vẽ. Pipeline 3D giữ lại làm **công cụ tham chiếu tư thế/ID** (mặt nạ ID + toạ độ chân/tay/kiếm từng khung đã có trong `kiem-tra.json`), không dùng để xuất sprite.

Về khung mẫu `mau-ve-tay-dung.png`: đây là tư thế **đứng** (vì mẫu gốc là tư thế đứng), làm bằng script + danh sách pixel, mục đích chứng minh ở 46 px Lam gốc giữ được mắt, chuông có vành/khoen, chắn kiếm, hai ủng có vạch, áo quấn trước. Nó **chưa phải sprite hoàn chỉnh**: vùng vạt áo choàng dưới còn lốm đốm, khoen chuông còn thô, cần thêm ≈ 50–100 pixel sửa tay nữa – ghi vậy để không ai tưởng đã xong.

## Cách chạy lại

```
python3 proto-lam/danh-gia-chup.py   # ≈ 5 s, Chromium headless → out/danh-gia/raw/ (kiểm 8/8 khung trùng từng pixel out/run/)
python3 proto-lam/danh-gia.py        # ≈ 60 s → 4 ảnh chẩn đoán + so-lieu.json
python3 proto-lam/cleanup.py         # ≈ 10 s → run-0-moi, run-1-moi, so-sanh-cu-moi, trong-game, cleanup-so-lieu.json
python3 proto-lam/mau-ve-tay.py      # → mau-ve-tay-dung.png + so sánh
```
