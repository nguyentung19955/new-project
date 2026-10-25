# CHANGELOG – Lam cutout v2 → v3 (25/10/2026)

Gốc so sánh: `../review-v2/lam-cutout/code` (không sửa). Mọi số dưới đây sinh lại được bằng `code/xuat.py` + `code/thu3.py`.
Các con số thử trong REVIEW.md (w1 28, r1 14, nét trong 5–6…) được **kiểm**, không mặc nhiên áp dụng – kết quả ở mục 3, 6.

## Tóm tắt kết quả đo
| Hạng mục | v2 | v3 | Bằng chứng |
|---|---|---|---|
| Dáng nghỉ so ảnh 02: IoU silhouette | 0,754 | **0,911** | `02-nghi-*` |
| Dáng nghỉ: tỉ lệ khớp họ màu (trên vùng chung) | 0,697 | **0,783** | `02-nghi-so-lieu.json` |
| Chóp ±6/±10°: điểm màu sát nền (viền hở) vùng mũ | 11 / 12 / 9 / 13 | **0 / 0 / 0 / 0** | `07-*` |
| Chóp 0°: mũ chính + chóp so với mũ gốc (điểm khác > 8) | – | **0** | `07-chop-so-lieu.json` |
| Tay 0/50/105°: điểm viền nằm sâu gần khuỷu (vành ống…) gần / xa | 473–491 / 652–727 | **177–197 / 188–330** | `03-*` |
| Lean ±8°: đầu/capelet/vạt/đai/bao dao/chuông theo thân | không (toạ độ thế giới) | có; khe vùng cổ 0 | `06-*` |
| Cẳng chân gần còn thấy (full rig, 0/50/105°) | 7,6 / 4,1 / 0 % | **50 / 41 / 22 %** | `08-*` |
| Đùi gần còn thấy | 0 / 0 / 0 % | 2 / 4 / 7 % (bị tay gần ở dáng nghỉ che nhiều nhất) | `08-*` |
| Viền hở ở 4 chi, 0–120° mỗi 10° (52 ảnh) | 0 | 0 | `04-dai-goc-so-lieu.json` |

## 1. Quan hệ cha–con, toạ độ cục bộ (PROMPT mục 1, REVIEW P0-1, P0-4)
- `rap2.lam()` → `rap3.Rig` + `lam-v3.json`. Capelet trước/sau, vạt trước/sau, đai, bao dao, chuông: v2 đặt bằng `at()`
  toạ độ thế giới → v3 là con của `than` với `gan` trên ảnh thân. Đầu (`mu`) là con của thân tại cổ (P mũ (205,250) giữ v2),
  chóp con của mũ, 2 mắt con của mũ (`ti_le` 0,92 / 1), dao con của găng gần.
- Bước chuyển không làm nhảy vị trí: `kiem_chuyen_doi.py` render mảnh v2 bằng rap3 sau khi chuyển: **0 điểm khác** ngoài
  hộp mắt 1 (234..256, 173..213; 121 điểm >8) do v2 resize ảnh mắt còn v3 scale 0,92 bằng ma trận. `00-chuyen-doi-*`.
- Góc: v2 `chain()` dùng góc **tuyệt đối thế giới** (không cộng góc cha, lean không kéo chi). v3 dùng góc **tương đối**
  nhất quán cho mọi mảnh, công thức ghi trong JSON (`quy_uoc_goc`) và `rap3.py`. Lean −8° v2: mũ đứng yên (178,146.5),
  v3 mũ đi theo (bảng `lean_-8` trong `00-chuyen-doi-v2-cuc-bo-ketqua.json`).
- Chuyển động phụ (`phu` trong JSON): đầu bù −0,3 × lean (giới hạn ±6°). Bài lean bù đùi −lean để chân bám đất: bàn chân
  vẫn trôi ±1,5 px ngang / ±3,4 px dọc vì thân xoay quanh P thân (57,56), không quanh hông (`06-lean-so-lieu.json`).

## 2. Dáng nghỉ theo ảnh 02 (PROMPT mục 2, REVIEW P0-2)
Cách làm: `do_mau.py` dò từng mảnh cứng trên `master-s.png` (tương quan theo họ màu, phạt nền), rồi IK cho tay/chân với
**xương giữ nguyên** 45,79/44,94 (tay) và 47/38 (chân). Ảnh từng mảnh: `01-do-mau-manh.png`; số: `01-do-mau-ketqua.json`.

| Mảnh | v2 (tâm thế giới, góc) | v3 | Điểm dò v2 → v3 |
|---|---|---|---|
| than (gốc) | (236.5,335), 0° | (220.5,350), 0° — gốc P thân (220,350) | 0,271 → 0,444 (thử −8..8°: 0,444..0,454, chênh <1 % → giữ 0°) |
| mu | (178,146.5) | (180,153.5) | 0,603 → 0,667 |
| capelet-sau | (165,285) | (167,289) | 0,760 → 0,825 |
| vat-sau | (175,372) | (169.5,369.5), +6° | 0,383 → 0,456 |
| dai | (236,338) | (211.5,337), +5° | 0,619 → 0,732 |
| bao-dao | (160,352) | (160.5,351), +1° | 0,839 → 0,853 |
| chuong | (245,290) | (250.5,289), −14°; P = (22,4) điểm treo (v2 xoay quanh tâm ảnh) | 0,423 → 0,622 |
| gang-gan / dao | dao gắn (38,34) −12° trong găng | găng −23°; dao gắn (28.65,40.16) +9° trong găng | găng −1,01 → 0,719; dao −1,10 → 0,730 |
| gang-xa | lật 180° | −4° | 0,155 → 0,916 |
| ung-gan / ung-xa | (286.5,445) / (215.5,445) | (269,437) / (150,437), 0° (đế phẳng) | 0,287 → 0,810 / −0,39 → 0,559 |

Điểm gắn chi trên thân (pivot – chỉ đổi khi có số):
- **vai xa (29,36) → (10,36)**. Với xương 90,73, vai v2 cách cổ tay găng xa (dò) 109,8 px → không với tới; vai (10,36): 91,2
  (thiếu 0,5 px, tay thẳng). Điểm vùng tay xa (x50–200, y280–400): 0,568 → 0,627. Giữ y = 36 như vai gần để hai vai đối xứng.
- vai gần giữ (85,36): phương án tốt nhất (70,10) chỉ hơn 0,023 và lệch vai không đối xứng → chưa đủ căn cứ.
- hông giữ (81,65)/(32,65): phương án đối xứng tốt nhất (y 60, xa x 22) chỉ hơn 0,012.
- Góc nghỉ cục bộ (v2 → v3): tay gần 85/−55/−20 → 72.7/−111.2/+15.5; tay xa 120/30/30 → 167.2/0/−171.2;
  chân gần 80/5/5 → 42.8/87.3/−40.1; chân xa 100/−5/−5 → 135.0/0/−45.0.

Thứ tự lớp (`khung.ORDER_V3`), lý do từ crop ảnh 02: bao dao đè vạt sau và đầu đai; capelet sau đè vai/tay xa/đỉnh bao dao;
chóp nằm dưới mũ chính. Hai mảnh **không thấy trên ảnh 02** (mặt trước áo là xanh thân, ngực không có vạt capelet):
`vat-truoc` (slot sau thân, dịch (0,−25)) và `capelet-truoc` (dưới mũ/tay gần, dịch (−15,−25)) được đặt bị che hoàn toàn
lúc nghỉ (còn thấy 266 / 949 px ở vị trí v2 → 0). **Cần chủ dự án xác nhận** có giữ hai mảnh này không.

Sai lệch còn lại ở dáng nghỉ: chân gần phải gập gối 87° (gối nhô trước vạt) mới chạm vị trí ủng trên ảnh 02 vì hông gần v2
cách cổ chân 61,8 px < 85; chân xa thẳng nhưng thiếu 1,3 px. Ảnh 02 là tranh phối cảnh, rig 2D đối xứng không khớp tuyệt đối.

## 3. Viền và mask (PROMPT mục 3, REVIEW P0-3)
`khuon3.py`:
- `Piece`: tách `mask` (hình) / `mat` (vật liệu, **không** chứa viền) / viền tính khi xuất bằng `line()` từ `ring_base`
  + nét trong. v2 `Piece.__init__` nung ring T_LINE quanh mọi mảnh vào `cls`.
- `from_src()`: bỏ dải viền ngoài của ảnh nguồn (đo được 5,8–8,0 px ở tỉ lệ 0,65; mũ 11,2 px) và dải khử răng cưa sát nó
  (≤ t_src + 1,5 px), thay bằng vật liệu sâu bên trong gần nhất; viền ngoài chỉ còn viền code T_LINE = 8. v2 giữ ink nguồn
  (viền mũ 11 px, các mảnh khác 7–8 px chồng ring 8). Nét trong nguồn (cách mép > t_src + 1) giữ nguyên hình, nối dài hình nón
  về phía mép để chạm viền mới (không hở, không râu). **Viền mũ đổi 11 → 8 px** cho đều toàn thân (ảnh 02 đo ~10 ở mũ, ~9 thân).
- Khớp lồng `child_cap()` / `parent_cap()` (thay `cap1_visible` không dùng ở v2 – đã bỏ tham số):
  cha có nắp tròn bán kính R tại D (có viền – silhouette khi gập); con bỏ phần sau P, nắp ẩn R − 8 tại P, không kẻ viền phía
  sau P; viền con tính trên hình kéo dài tiết diện (lấy tại P + 6 px để tránh đầu xiên của ảnh nguồn) → **không vành ống,
  không khớp cầu lộ**, hai cạnh bên liền. R: gối 25 (= nửa rộng 50 của đùi và cẳng), khuỷu gần 27 / xa 27,5 (= nửa rộng lớn
  nhất của cẳng tay tại P; cẳng tay lệch tâm 21,5/27). Khuỷu: nắp R làm đầu tay trên to hơn đầu nguồn (khoảng hở 18,4 → 27)
  — khi duỗi bị cẳng tay che.
- Đùi/cẳng (`segment`): v2 đùi 50→38 (r1 18), cẳng 46→36 (r1 18). v3 đùi 54→50, cẳng 50 tới mép cổ ủng (16 px trên cổ chân,
  đo trên mask ủng: cổ ủng rộng 60, P cách mép 16) rồi thu về **w1 28, r1 14 trong ủng**; L = 47/38 giữ nguyên. Bề rộng cẳng
  thấy ở cổ ủng 41 → 51 px (ảnh 02 đo ~40 px màu + viền ~9 mỗi bên ≈ 55).
- Kiểm phương án REVIEW (w1 28, r1 14 nội suy thẳng, `09-*`): đổi silhouette dáng nghỉ (cổ ủng 41 → 35 px, khác 414 điểm so v3)
  và chỉ giảm phần cẳng lộ ngoài ủng 1366 → 1354 px (tổng cổ chân −30..+40°). Phương án v3 (giữ rộng tới cổ ủng, thu trong
  ủng): 1208 px. Phần lộ còn lại chủ yếu là ống quần cạnh cổ ủng khi cổ chân gập mạnh (−30°: 370 px), không phải đầu ẩn.
- Viền hở (điểm màu sát nền) ở mọi ảnh chi 0–120°: 0 (v2 cũng 0). Khe nền kín gần khớp: 0, trừ chân gần 80° (18 điểm) – là
  khe giữa đáy áo (chỗ xẻ) và ủng, không phải hở khớp; tay gần 9 điểm cố định ở mọi góc là khe thân–capelet trước trong ảnh
  lọc lớp (full rig bị mũ che).

## 4. Chân gần bị che (PROMPT mục 4, REVIEW P0-5)
- Bảng đầy đủ `08-dien-tich-dui-cang.md` (mảnh nào che bao nhiêu px). v3 lý do thấy hơn: vạt trước không còn phủ chân
  (đặt sau thân), cẳng rộng đúng ảnh 02, dáng nghỉ mới. Phần che còn lại là **che khuất hợp lệ**: ủng (con) che nửa dưới cẳng,
  thân che hông, tay gần ở dáng nghỉ che đùi. Lỗi mask đo riêng (mục 3) = 0.
- Không kéo dài chân, không thu ủng, không đưa cả chân ra trước áo. Thêm `slot_theo_tu_the`: khi góc đùi gần so với thân
  < 30° (nâng gối), cẳng + ủng gần vẽ ngay trên thân (đùi vẫn dưới thân). Ngưỡng chọn theo số điểm đổi khi bật luật:
  ≤ 6 px tại 30° (gối 60/90°), 16–31 px ở 35–40°, ≥ 200 px nếu chuyển cả đùi (`11-*`). Ở các tư thế đã thử luật chỉ đổi
  2–6 px, tức hiện chưa cần hình thay thế; chưa thử chu kỳ chạy thật.

## 5. Chóp mũ (PROMPT mục 5)
`hood_pieces()`: giữ pivot v2 (80,95). v2 cắt gần thẳng đứng x≈92 nên khi xoay, điểm nối ở mép trên dịch ⊥ mép → bậc.
v3 cắt theo gấp khúc **góc lồi đỉnh (46,43) – pivot – hốc dưới (69,126)**: bán kính từ pivot tới hai điểm nối gần vuông góc mép
→ điểm nối trượt dọc mép khi xoay. Chóp có **quạt nối ẩn ±16°** + đĩa r20 quanh pivot nằm dưới mũ chính (vùng bù thật, không
phải giảm biên độ); viền chỉ kẻ trên mép mũ gốc. Kết quả ±6/±10°: viền hở 0 (v2 9–13); góc 0 trùng mũ gốc 0 điểm khác.
Còn lại: vạch nhỏ ở hốc dưới (đầu nếp gấp nguồn) thấy cả ở 0°; ở ±10° góc lồi lệch ~1–2 px.

## 6. Bài 112 px và nét (PROMPT mục 6)
- `thu3.t_112()`: khung thế giới cố định 600×520 cho mọi tư thế, thu **đồng nhất hai trục** (v2: ngang 112/470, dọc crop
  480→112, lệch ~2,1 %); không crop theo từng tư thế; đất cố định (116,3 px logic / 252,4 px thiết bị). Ghi trong
  `05-112px-thong-so.json`.
- T_LINE = 8 giữ làm đối chứng (1,91 px logic, 4,14 px thiết bị). `10-net-trong-8-6-5.png`: viền mảnh 6 hoặc 5 + một lượt
  silhouette 8 trên ảnh ráp. Phương án này cần **thêm một lượt xử lý mỗi khung hình trong game** (vẽ silhouette) → chưa chọn,
  chỉ để duyệt bằng mắt. Asset xuất ra vẫn là T_LINE 8.
- Palette và FAR = 0,82 giữ. Bóng đùi/cẳng: dải dọc đều v2 → đa giác xiên (ranh 30 % nửa rộng ở gối → 5 % ở cổ chân).

## 7. Metadata (PROMPT mục 7)
`lam-v3.json` do `xuat.py` sinh từ `khung.py` (quyết định) + số đo mảnh; `rap3.py` và `thu3.py` chỉ đọc JSON + PNG.
Các số rig không còn hardcode trong code ráp (v2: `rap2.lam()` hardcode, JSON không có cha/gắn/góc/slot).

## Lỗi / việc còn mở
1. Gối gần gập 87° ở dáng nghỉ (mục 2) – cần chủ dự án chọn: chấp nhận, hay hông gần y 65 → 45 (khớp ảnh hơn 0,022 nhưng hai hông lệch cao).
2. `vat-truoc`, `capelet-truoc` đang bị che lúc nghỉ – cần xác nhận thiết kế; lean/xoay đầu lớn có thể làm lộ.
3. Khuỷu duỗi thẳng còn bậc nhỏ ở một bên (cẳng tay hẹp hơn tay trên 59 vs 48,5 px) và mảng màu nắp ẩn khác bóng tay trên.
4. Đầu xa cẳng tay (khoảng hở 9,8 px) chưa kiểm ở góc cổ tay lớn.
5. Thân xoay quanh P thân nên lean làm bàn chân trôi ~3,4 px nếu chỉ bù đùi.
6. Chỉ số "nét trong khớp" gồm cả nếp gấp hợp lệ và mép găng/ủng – đọc cùng ảnh.

## CHƯA kiểm tra
- Chưa chạy trong game HTML5 Canvas, chưa trên iPhone/Safari thật (chỉ mô phỏng thu nhỏ LANCZOS bằng Pillow; Canvas
  `drawImage` nội suy khác). Chưa đo hiệu năng.
- Chưa có IK/bám đất runtime, chưa thử chu kỳ chạy/nhảy/tấn công; luật slot mới thử trên vài tư thế tĩnh.
- Chưa duyệt màu trên nền gameplay thật (chỉ nền sáng/tối/caro).
- Lượt silhouette cho phương án nét trong 5–6 chưa có trong game.
