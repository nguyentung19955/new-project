# Cày nâng cấp: bỏ "Quyết tâm", vượt ải khó chỉ nhờ nâng cấp

Ý chủ dự án: "phải cày" nghĩa là cày để nâng cấp nhân vật, vũ khí, trang phục; không phải cứ thua nhiều là tự mạnh lên.

## Tóm tắt

- **Đã bỏ hẳn "Quyết tâm".** Thua bao nhiêu lần bé cũng không mạnh thêm, quái cũng không yếu đi. Không còn chữ "quyết tâm" ở thẻ ải, thanh trên trong ải, bảng thua. Bản lưu cũ có mục này vẫn đọc được (mục đó bị xoá khi nạp).
- **Sức mạnh chỉ đến từ cày:** cấp hero, mài, nâng bậc, tiến hóa theo linh khí, cây kỹ năng, trang phục (may, nâng bậc, cánh), nâng lò.
- **Nâng trần:** cấp hero tối đa 40 (trước 30), mài tối đa +15 (trước +10) với lò cấp 4.
- **Sửa chỗ kẹt khi cày:** ở vùng hai mài bị chặn ở +7, trang phục lên Vàng phải chờ mảnh trùm, quặng thiếu ở vùng ba. Trước đây người chơi cày mà vàng, vảy cá cứ dồn lại không tiêu được. Nay mỗi vùng đều có chỗ tiêu.
- **Bảng thua chỉ rõ nên cày gì:** so Sức mạnh hiện tại với khuyên dùng, rồi 2-3 gợi ý cụ thể. Bấm một gợi ý là về làng, mở đúng người làng, chọn sẵn món cần nâng.
- **Số lần chơi đạt mục tiêu** (bot 8 lượt):
  - Vùng 1 nhẹ: 1 đến 2,5 lần mỗi ải.
  - Ải có trùm nhỏ (ải 3, 4 vùng hai và ba): 2,9 đến 4,6 lần.
  - Trùm vùng Mộc Tinh, Ngư Tinh, Hồ Tinh: **6,1 / 9,4 / 10,9** lần (Hồ Tinh hơi trên 10, trong mức cho lệch 15% của bài đo).
  - Đi hết 15 ải lần đầu: trung bình **3 giờ 4 phút**, từ 2 giờ 11 đến 3 giờ 49 phút.

## Đã bỏ gì

| Chỗ | Trước | Nay |
|---|---|---|
| `G.GRIT` trong `js/data.js` | thua liền một ải thì lần sau mạnh thêm 4%, tối đa 20% | xoá |
| `js/stage.js` lúc vào ải | nhân máu và sát thương theo số lần thua | xoá |
| `js/stage.js` lúc thua | dòng "Quyết tâm: lần sau mạnh thêm …%" | thay bằng gợi ý nên cày gì |
| `js/stage.js` thanh trên trong ải | "· quyết tâm +8%" | chỉ còn "Sức mạnh … / khuyên …" |
| `js/village.js` thẻ ải | "· quyết tâm +8%" | chỉ còn "Sức mạnh khuyên dùng … · bé …" |
| `js/engine.js` (`G.fixSave`) | thêm và chặn trường `grit` | xoá trường `grit` nếu có, phần còn lại đọc bình thường |
| `tests/doors.py` | cho bot Quyết tâm tối đa để qua mọi hạt giống | cho bản lưu đã cày dư (cấp và mài cao hơn một chút) |

Không thêm cơ chế "thua nhiều thì dễ hơn" nào khác. Bài `tests/cay.py` kiểm: thua 6 lần liền ở cùng ải thì máu, sát thương, sức mạnh, máu và sát thương của quái đều y như lúc đầu.

## Trần mới của từng đường nâng cấp

| Đường nâng cấp | Trước | Nay | Ghi chú |
|---|---|---|---|
| Cấp hero | tối đa 30 | **tối đa 40** | Mỗi cấp +1,5% sát thương, +3,5% máu. Điểm kỹ năng tối đa 13 (trước 10). |
| Mài vũ khí | tối đa +10 (lò cấp 3) | **tối đa +15 (lò cấp 4)** | Mỗi cấp mài +8% sát thương gốc. |
| Nâng lò | cấp 3 | **cấp 4**: 1500 vàng, 20 quặng, 10 đá lửa | Mài được tới +15. |
| Giá mài +5, +6 | 3 vảy cá | không đổi | |
| Giá mài +7 đến +9 | 3 đá lửa (chưa tới vùng ba thì không có, kẹt ở +7) | **5 vảy cá** | Vùng hai cày được. |
| Giá mài +10 đến +14 | (không có) | 5 đá lửa | |
| Quặng mỗi lần mài | 2 + 2 x cấp mài | **tối đa 16** | +11 đến +15 không đòi 24-30 quặng mỗi lần. |
| Nâng bậc vũ khí Thường → Lam → Tím → Vàng | như cũ | không đổi | Vàng của vùng sau mạnh hơn (x1,5 / x1,6 / x1,7). |
| Tiến hóa theo linh khí (30 / 120 / 300) | như cũ | không đổi | Bảng thua có gợi ý "còn thiếu N linh khí". |
| Trang phục Tím → Vàng | 700 vàng, 2 mảnh trùm, 1 đá tôi | **900 vàng, 18 nguyên liệu vùng, 2 đá tôi** | Mảnh trùm để dành cho vũ khí Vàng, cánh, may đồ bộ. Trang phục thành đường cày máu và giáp bằng vàng và nguyên liệu. |
| Cánh (mầm, nhỏ, lớn) | mảnh trùm | không đổi | |
| Cây kỹ năng | 15 nút | không đổi | Cấp 40 có 13 điểm. |
| Quặng mỗi lần qua ải | 3 + số sao | **3 + số sao + 2 x vùng** | Vùng ba được 7-10 quặng mỗi lần. |

Kiểm trần (trong `tests/cay.py`), chỉ dùng thứ có trước khi hạ Hồ Tinh:

- Cấp 40, hai vũ khí Vàng Ngư Tinh +15 Thức tỉnh, bộ Hang Biển Vàng, cánh lớn: sức mạnh **882**.
- Khuyên dùng của Hồ Tinh là 620. 882 cao hơn 1,4 lần, nên cày đủ thì chắc chắn vượt được.
- Trần cũ (cấp 30, mài +10) chỉ được 722.

### Sức mạnh và khuyên dùng

- **Sức mạnh tính cả vũ khí thứ hai:** 75% món mạnh nhất + 25% món còn lại.
  - Lý do: trùm thích nghi kháng hệ đang dùng nhiều, nên phải đổi sang vũ khí kia.
  - Bot cũ bỏ mặc cung +0, gặp trùm kháng hệ là gần như không đánh nổi, dù con số sức mạnh vẫn cao.
  - Nay con số và gợi ý thấy được điều này, nên sẽ nhắc mài cả món thứ hai.
- **Khuyên dùng đo lại** sau khi bỏ Quyết tâm:

| Ải | 2-5 Ngư Tinh | 3-1 | 3-2 | 3-4 | 3-5 Hồ Tinh |
|---|---|---|---|---|---|
| Trước | 395 | 405 | 440 | 495 | 515 |
| Nay | 420 | 425 | 445 | 525 | 620 |

  Các ải khác giữ nguyên. Độ mạnh của quái và trùm **không đổi**.

## Màn thua: nên cày gì

Ảnh: `bang-thua-goi-y-trum-ngu-tinh.png`, `bang-thua-goi-y-vung-ba.png`, `bam-goi-y-mo-nguoi-lang.png`.

- **Dòng trên:** Sức mạnh hiện tại / khuyên dùng, còn thiếu bao nhiêu, kèm thanh so sánh. Màu xanh là đủ, vàng là sát nút, đỏ là thiếu.
- **Dưới đó là 2-3 gợi ý.** Mỗi gợi ý có tên việc, số sức mạnh tăng thêm, và một dòng nhỏ nói đủ đồ chưa hoặc còn thiếu gì, nên chơi lại ải nào. Ví dụ:
  - "Còn 2 điểm kỹ năng chưa học (nhánh Thủ)": học ngay ở Cụ Đồ.
  - "Mài Kiếm Rèn lên +6 (+6 sức mạnh)": thiếu 80 vàng, chơi lại Hang biển 2.
  - "Nâng Kiếm Rèn Than Hồng lên Tím (+13 sức mạnh)": thiếu 3 vảy cá, chơi lại Hang biển 4.
  - "Lên cấp 17": còn thiếu 420 kinh nghiệm, chơi lại …
  - "Tiến hóa … lên Thành hình": còn thiếu 50 linh khí Lửa, kết liễu quái đang dính Lửa.
  - "May Áo da biển", "Nâng Áo vảy lên Vàng", "Mở cấp 2 cho Cánh …", "Mang … (vũ khí trong rương mạnh hơn)".
- **Thứ tự gợi ý:**
  - Điểm kỹ năng chưa học luôn đứng đầu.
  - Sau đó tới việc tăng nhiều mà gần làm được. Việc làm ngay được thì xếp trên.
  - Việc cần mảnh của trùm chưa hạ thì xếp cuối.
  - Mỗi loại chỉ một gợi ý cho khỏi trùng.
- **Bấm gợi ý** thì về làng và mở đúng người làng:
  - Mài, nâng bậc, nâng lò: lò rèn, đúng thẻ, chọn sẵn vũ khí.
  - May, nâng bậc trang phục, cánh: Cô Thợ May, đúng thẻ, chọn sẵn món.
  - Mua: Bà Hàng Xén, thẻ trang phục.
  - Kỹ năng: Cụ Đồ.
  - Lên cấp: tranh bản đồ của Chú Lái Đò, chọn sẵn ải nên chơi lại.
  - Linh khí: màn xem vũ khí.
- **Mã:** `js/upgrade.js` liệt kê mọi đường nâng cấp. Mỗi đường được tính thêm bao nhiêu Sức mạnh, tốn gì, thiếu gì, nên cày ở đâu. Bảng thua dùng `G.upgradeTips`, bot dùng `G.upg.auto`. Hai bên đi cùng một bộ luật.

## Bot cày như người chơi

`tests/cay.py`, `tests/campaign.py` (không dựa vào Quyết tâm):

- **Ở làng**, bot gọi `G.upg.auto` để nâng cấp như người chơi:
  - Học hết điểm kỹ năng, kể cả nút không làm tăng con số Sức mạnh như hồi máu mỗi phòng, lăn né hồi nhanh.
  - Rồi lặp lại: chọn việc làm ngay được mà sức mạnh tăng nhiều nhất trên mỗi đồng bỏ ra. Gồm mài, nâng bậc, lên Vàng, nâng lò, mua, may, mặc, nâng bậc trang phục, mở cấp cánh.
- **Chưa đủ khuyên dùng hoặc vừa thua** thì bot chơi lại ải cũ để cày, đúng chỗ gợi ý chỉ:
  - Thiếu mảnh trùm thì đánh lại trùm, nếu đã dư sức.
  - Thiếu nguyên liệu vùng nào thì chơi lại ải cao nhất của vùng đó.
  - Còn lại thì chơi lại ải mới nhất đã qua.
  - Vừa qua trùm vùng mà chưa dư sức thì cày ải 4 thay vì đánh lại trùm.

### Bảng số lần chơi từng ải

Số lần chơi tính mọi lượt, kể cả chơi lại ải cũ và lượt thua, từ lúc qua ải trước tới lúc qua ải đó. Cột "Nay" đo trên bản đã gộp mọi phiên mới nhất của `khoi-tao-du-an`. Chạy lại bằng: `python3 game/tests/cay.py 8`.

| Ải | Trước: có Quyết tâm (3 lượt) | Bỏ Quyết tâm, chưa sửa đường cày (3 lượt) | **Nay (8 lượt)** | Thua (nay) | Sức mạnh khi qua / khuyên dùng (nay) | Mục tiêu |
|---|---|---|---|---|---|---|
| 1-1 | 1,0 | 1,0 | **1,0** | 0,0 | 98 / 100 | 1-2 |
| 1-2 | 1,0 | 1,0 | **1,0** | 0,0 | 121 / 110 | 1-2 |
| 1-3 | 2,7 | 1,7 | **1,6** | 0,1 | 146 / 135 | 1-2 |
| 1-4 | 1,3 | 1,3 | **2,5** | 0,6 | 168 / 150 | 1-2 |
| 1-5 Mộc Tinh | 9,0 | 11,0 | **6,1** | 0,1 | 230 / 225 | 5-9 (vùng 1 nhẹ hơn) |
| 2-1 | 1,0 | 1,0 | **1,8** | 0,1 | 259 / 245 | 1-2 |
| 2-2 | 1,0 | 4,3 | **1,4** | 0,0 | 280 / 270 | 1-2 |
| 2-3 | 5,0 | 2,3 | **4,6** | 0,1 | 323 / 315 | 3-5 |
| 2-4 | 6,7 | 18,0 | **3,9** | 0,5 | 352 / 345 | 3-5 |
| 2-5 Ngư Tinh | 9,3 | 19,3 | **9,4** | 0,8 | 422 / 420 | 6-10 |
| 3-1 | 2,0 | 3,0 | **2,1** | 0,2 | 442 / 425 | 1-2 |
| 3-2 | 4,7 | 2,7 | **2,5** | 0,4 | 463 / 445 | 1-2 |
| 3-3 | 5,3 | 5,0 | **2,9** | 0,4 | 499 / 475 | 3-5 |
| 3-4 | 6,7 | 4,3 | **3,2** | 0,5 | 550 / 525 | 3-5 |
| 3-5 Hồ Tinh | 12,3 | 29,0 | **10,9** | 2,1 | 643 / 620 | 6-10 |
| **Tổng thời gian 15 ải** | **4,1 giờ** | **6,7 giờ** | **3,1 giờ** | | | 2,5-4 giờ |

- Cột "Trước" đo trên bản gộp lúc bắt đầu đợt này, còn Quyết tâm.
- "Bỏ Quyết tâm, chưa sửa đường cày" là đo thử giữa chừng. Lúc đó đã bỏ Quyết tâm, đã nâng trần, nhưng chưa sửa chỗ kẹt khi cày. Trùm Ngư Tinh và Hồ Tinh cần 19 đến 29 lần, có lượt kẹt tới 35 lần.
  - Vàng dồn tới hơn 20.000 mà không có gì để mua.
  - Cung đi kèm vẫn +0.
  - Bot bỏ trống điểm kỹ năng.
- **Nay**, 8 lượt chiến dịch:
  - Tổng thời gian trung bình 184 phút, trung vị 186, nhanh nhất 131, lâu nhất 229.
  - Trung bình 55 lần chơi, khoảng 3,3 phút mỗi lần.
  - Cấp hero khi qua Hồ Tinh khoảng 30.
- **Số lần chơi trùm vùng từng lượt:**
  - Mộc Tinh 3-12.
  - Ngư Tinh 5-19.
  - Hồ Tinh 2-22.
  - Không còn lượt kẹt 30-60 lần như lúc chưa sửa đường cày.
  - Đợt đo trước đó (cùng luật, trước khi sửa chỗ chỉ ải cày nguyên liệu) ra Mộc Tinh 5,8, Ngư Tinh 8,0, Hồ Tinh 8,2 lần, tổng 3,0 giờ. Tám lượt vẫn dao động khoảng ±2 lần ở trùm.

## Kiểm tra đã chạy

- `tests/cay.py` 8 lượt: mọi ải đạt mục tiêu (cho lệch 15% như trước). Có 24 luật, trong đó mới:
  - Thua 6 lần không mạnh thêm, không có chữ quyết tâm, quái không yếu đi.
  - Bản lưu cũ có `grit` vẫn đọc được.
  - Trần mới cấp 40, mài +15 và bản lưu cấp 40 / lò 4 / +15 đọc lại đúng.
  - Trần trước Hồ Tinh vượt 1,4 lần khuyên dùng.
  - Bảng thua có 2-3 gợi ý, so đúng sức mạnh với khuyên dùng, kỹ năng chưa học đứng đầu.
  - Gợi ý mài ghi đúng "thiếu 80 vàng". Gợi ý nâng Tím ghi đúng thiếu vảy cá và "chơi lại Hang biển 2".
  - Bấm gợi ý mở đúng lò rèn và thẻ, đúng tranh bản đồ và ải, đúng Cụ Đồ.
  - Nâng cấp tự động không tiêu quá số đang có.
- Toàn bộ `game/tests/`: xem mục "Kết quả chạy toàn bộ" ở cuối.
- Đóng gói `python3 game/build.py`. Mở `dist/linh-khi.html`, vào làng, vào ải, thua, bấm gợi ý: không có lỗi console. Chỉ có dòng báo không tải được phông chữ Google, vì máy kiểm tra không có mạng ngoài.
- Ảnh trong thư mục này. Chụp lại bằng `python3 game/tests/cay_nang_cap_shots.py`.

## Điểm còn yếu

- **Bot không phải người.** Bot né đều tay. Người mới có thể cần thêm vài lượt ở trùm vùng, người giỏi thì ít hơn.
- **Tám lượt chiến dịch vẫn dao động.** Đo nhiều đợt 8 lượt liền, trung bình số lần chơi Hồ Tinh xê dịch từ 8 tới 11. Từng lượt có thể ít tới 2 hoặc nhiều tới 22 lần (bot mang vũ khí cùng hệ trùm đang kháng thì thua nhiều).
- **Hệ khắc chế chưa vào con số Sức mạnh.** Mang vũ khí cùng hệ trùm đang kháng vẫn thiệt. Con số tính 25% vũ khí thứ hai, nhưng chưa xét hệ của từng món.
- **Gợi ý chỉ tính những gì thấy trong con số Sức mạnh**, cộng điểm kỹ năng. Trang phục chỉ tăng tốc chạy hoặc tầm nhặt thì không được gợi ý.
- **Phiên cân bằng phải cày chưa xong sau 60 phút chờ**, nên nhánh này gộp `claude/can-bang-cay` vào nền `khoi-tao-du-an` như hướng dẫn. Nếu phiên đó đẩy thêm thay đổi về khuyên dùng hoặc sức mạnh, cần đo lại bằng `tests/cay.py`.

## Kết quả chạy toàn bộ

Chạy trên bản cuối, đã gộp `khoi-tao-du-an` mới nhất. Mọi bài đều đạt:

- `cay` 24/24 luật, 8 lượt đạt mục tiêu.
- `rules` 82/82, `moves` 93/93, `doors`, `mapgen`, `fuzz` (0 lỗi), `cong` 66/66, `cung` 16/16.
- `env_rooms` (108 phòng, 0 lỗi), `fx_check` (0 lỗi), `ghep` 109/109, `ghep2` 192/192, `quai` 105/105.
- `perf` (3 ms mỗi khung), `anim_smoke`, `smoke`, `dps`, `ui_robust` 16/16, `ui_build`, `ui_input all` (4 cỡ màn hình, 162/162 mỗi cỡ).
- `trang_phuc` 66/66, `may` 100/100, `do_roi` 45/45, `linhkhi` 36/36, `bao_truoc` 21/21, `tam_huong` 37/37, `probe` 3/3.
- `balance 4`: thắng 52/60 với bản lưu thật mới (`tests/cay_luu.json` lấy từ bot đợt này).
- `campaign`: đi hết 15 ải.
