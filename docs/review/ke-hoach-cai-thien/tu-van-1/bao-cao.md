# Tư vấn 1 — Mở hệ thống dần, bố cục nút điện thoại, tự ngắm (16/10)

Nguồn: `QUYET-DINH-TU-VAN-16-10.md` mục 1, 2; `TU-VAN-CHATGPT-TOAN-BO-16-10.md` mục 1, 2, 4.
Không đổi sát thương, giá, cân bằng, tầm đánh. Không thêm hình vẽ bằng code trong trận (vòng chọn vũ khí dùng khung ô và hình vũ khí có sẵn, vẽ ở lớp giao diện).

## 1. Mở hệ thống dần theo mốc (`js/mo_dan.js`, tắt: `?modan=0`)

Người mới chỉ thấy **Kiếm, Đánh, Né, Bình máu**. Trong ải chưa có nút Đặc biệt, Chưởng, chưa đổi được vũ khí (ô vũ khí chỉ còn ô đang cầm), thanh mana ẩn cho tới khi có nút dùng mana.

| Mốc (lần đầu, độ khó thường) | Mở thêm | Mốc cũ có sẵn trong code |
|---|---|---|
| Bắt đầu | Kiếm, Đánh, Né, Bình máu. Làng: Chú Lái Đò, Cụ Đồ (thẻ Hướng dẫn), Ông Từ (thẻ Cu Tí), Anh Mõ (Cài đặt, Đăng nhập Google, lưu mây luôn có) | Sổ yêu quái mở từ đầu (nay dời mốc) |
| Qua Rừng già 1 | Nút **Đặc biệt** và **Chưởng**; Cụ Đồ thẻ **Cây kỹ năng** (nội tại) + **Cây chưởng**; **Ông Thợ Rèn** thẻ **Mài** (nâng cấp đơn giản); **Bà Hàng Xén** | Cây chưởng sau ải đầu (giữ); Thành tựu sau Rừng già 1 (dời) |
| Qua Rừng già 2 | **Đổi vũ khí trong ải** (chạm ô vũ khí, giữ để mở vòng chọn 4 món) | Cô Thợ May, Việc hôm nay sau Rừng già 2 (dời) |
| Qua Rừng già 3 | Thợ Rèn thẻ **Linh khí** (nâng vũ khí, **chọn hệ** Lửa / Độc / Băng) | — |
| Hạ Mộc Tinh (trùm vùng 1) | **Rèn nâng cao**: thẻ Ép đồ, Nâng lò; **Cô Thợ May** (trang phục vùng) | Ải ngày sau Mộc Tinh (dời thêm 1 ải) |
| Qua Hang biển 1 (sau vùng 1) | **Sổ yêu quái, Việc hôm nay, Thành tựu, Ải ngày, Bảng vàng** | — |
| (giữ nguyên) | Độ khó 2: vẫn cần đủ 15 sao như cũ | Độ khó 2 sau 15 sao |

Đối chiếu với gợi ý: "nội tại bạn" trong code là Cây kỹ năng của Cụ Đồ (ba bạn chỉ dạy nét riêng khi được cứu sau trùm vùng, không đổi); "nâng cấp đơn giản" là Mài; "chọn hệ" là thẻ Linh khí (lên Mầm thì chọn hệ). Độ khó 2 không kéo sớm về sau Mộc Tinh vì như vậy là đổi tiến trình độ khó, ngoài phạm vi (không đổi cân bằng). Các mốc cũ trong code vẫn chạy, mốc mới chỉ đặt thêm điều kiện.

- Người / thẻ chưa mở thì **ẩn** (người làng không vẽ, không chạm được; mặt ở dải lối tắt mờ như Cô Thợ May trước đây, chạm vào thì người làng nói khi nào mở). Thẻ lò rèn, Cụ Đồ, Ông Từ, Anh Mõ, Hành trang (thẻ Kỹ năng), nút Ải ngày, gợi ý nâng cấp ở bảng thua đều lọc theo mốc. Sổ yêu quái vẫn **ghi từ đầu** (chỉ ẩn thẻ và dòng báo trong ải); Việc hôm nay chỉ đếm từ khi mở.
- Mở một mốc: về làng có **một dòng báo ngắn** (5 giây) và tiếng chuông, ví dụ "Mở mới: đổi vũ khí trong ải. Chạm ô vũ khí, giữ để chọn 1 trong 4 món." Mốc đã báo ghi ở `save.moDan.bao`, không báo lại.
- **Ải 1 Rừng già xếp sẵn**: bản đồ cố định (hạt giống 1610, kiểu A: Bắt đầu → Đánh quái → Đánh quái → Tinh anh → Suối → Trùm). Phòng Bắt đầu: **1** con xông tới trước (thấy rõ vùng đỏ báo đòn, chưa bị vây) rồi mới **2** con (vẫn đủ 3 con). Phòng đánh quái thứ hai xếp đợt ít quái lên trước, quái bắn xa / cảm tử dồn về đợt sau. Không đổi số quái, máu, sát thương. Ba lời chỉ dẫn nói về nút chưa mở (Đặc biệt, đổi phi tiêu, đổi vũ khí khác hệ) đổi sang dạy né vùng đỏ / uống bình máu.

### Bản lưu cũ

- Trường mới `save.moDan` (chỉ thêm, không xoá gì). Bản lưu **đã có tiến độ** (có sao ải hoặc có lần thắng) mà chưa có trường này → `{ cu: 1 }`: **mọi mốc mở như trước, không có dòng báo**. Gắn trước phần "thiếu gì thì bù" của `G.fixSave` nên cả bản trên máy lẫn bản trên mây đều đi qua.
- Bản lưu mới / xoá tiến trình → `{ bao: {} }` (người mới). Đăng nhập Google, lưu mây, `?cloud=0` không đổi.

### Cách tắt

| Cờ | Tác dụng |
|---|---|
| `?modan=0` | Tắt hẳn mở dần: mọi nút / người / thẻ như cũ, ải hướng dẫn như cũ (bản đồ ngẫu nhiên, 3 con một đợt), không báo. Dữ liệu `moDan` giữ nguyên. |
| `?nutcu=1` | Bố cục nút cũ: Đánh to bán kính 28, các nút khác 18, bình máu ô góc trái trên, chạm ô vũ khí là đổi ngay, không vòng chọn. |
| `?ngamcu=1` | Tự ngắm như cũ (quái gần nhất mọi hướng). |

## 2. Bố cục nút điện thoại ngang (`js/stage.js`)

- **Đánh** và **Né** to bằng nhau, cỡ tính theo `G.scale` (điểm ảnh CSS / đơn vị khung 480×270): đường kính **60 px** ở `G.scale` 1,25–1,44 (điện thoại ngang 844×390, 667×375), **64 px** ở 1,6; cách nhau **~11 px** mép tới mép. Kẹp bán kính 20–24 đơn vị để máy tính không ra nút tí hon (ảnh soát 960×540 nên nút trông to hơn).
- **Đặc biệt** và **Chưởng** cỡ vừa (~44 px) ngay trên Né / Đánh; **Bình máu** nút nhỏ (~32 px) trên cùng cụm, góc có số lần "x2". Cả cụm nằm ở cột phải, không đè sàn.
- **Ô vũ khí**: chạm nhanh rồi nhấc = sang món kế (như cũ). Giữ 0,3 giây (hoặc kéo ngón ra) = mở **vòng chọn 4 món** (2×2 ngay dưới ô vũ khí, có tên món); ô dưới ngón sáng lên, nhấc ngón là cầm món đó. Đang trong 0,75 giây chờ đổi thì lệnh được giữ tới khi đổi được (tối đa 0,8 giây). Phím 1–4 chọn thẳng món.
- Không đụng logic **đòn nối khi đổi vũ khí** của phiên Vũ khí B: chỉ thêm `inp.swapTo` (món chọn thẳng); đổi từ vòng chọn vẫn đi qua đúng khối đổi vũ khí trong `js/combat.js` nên đòn nối, `G.SWAP_CD` 0,75 giây giữ nguyên. Khựng hình giữ cả món chọn (`js/fx.js`).

## 3. Tự ngắm (`js/moves.js` aimM)

- Đang đẩy cần mà có quái **trong tầm** nằm trong hình nón **±40°** quanh hướng cần → ngắm con gần nhất trong nón; không có thì quái gần nhất như cũ. Tầm, sát thương không đổi.
- Tuỳ chọn **Khoá mục tiêu** ở Anh Mõ → Cài đặt → "Âm thanh, điều khiển ›" (nút thứ ba hàng giữa), **mặc định tắt**, lưu `save.khoaMT`. Bật: đã ngắm con nào thì giữ con đó tới khi nó gục hoặc ra khỏi tầm đòn (bot không dùng).

## 4. Kiểm

- `node --check` mọi tệp `js/*.js`: đạt. `python3 build.py` và `python3 build.py --hai-tep`: đạt. `tests/smoke.py`: 0 lỗi.
- `tests/mo_dan_shots.py` (mới, không chơi tay: đặt bản lưu, chạm giả bằng CDP rồi đọc trạng thái): **24/24 đạt** — người mới đóng đủ chức năng, ải hướng dẫn xếp sẵn, phím đổi vũ khí chưa có tác dụng, dòng báo khi mở + không báo lại, bản lưu cũ `cu = 1` mở hết không báo, cỡ nút 56–64 px và khoảng cách 10–12 px, chạm nhanh đổi món kế, giữ mở vòng chọn và chọn đúng món, tự ngắm theo nón, cờ `?modan=0&nutcu=1` về như cũ.

Ảnh soát 960×540 (`anh/`):

| Ảnh | Nội dung |
|---|---|
| `1-lang-nguoi-moi.png` | Làng người mới: chỉ Lái Đò, Cụ Đồ, Ông Từ, Anh Mõ; mặt Lò rèn / Vũ khí / Mũ áo mờ |
| `2-cu-do-nguoi-moi.png` | Cụ Đồ người mới: chỉ thẻ Hướng dẫn |
| `3-hud-nguoi-moi.png` | HUD ải hướng dẫn: Đánh, Né, Bình máu x2, một ô vũ khí, không thanh mana |
| `4-lang-bao-mo-moi.png` | Về làng sau Rừng già 2: dòng báo "Mở mới: đổi vũ khí…", Thợ Rèn + Hàng Xén đã ra mặt |
| `5-lang-ban-luu-cu.png` | Bản lưu cũ: đủ người làng, không báo |
| `6-hud-moi.png` | HUD mới đủ nút (bản lưu cũ) |
| `7-vong-chon-vu-khi.png` | Vòng chọn 4 món đang mở, ngón ở ô Búa |
| `8-cai-dat-khoa-muc-tieu.png` | Anh Mõ: nút Khoá mục tiêu |

## Tệp đổi

`js/mo_dan.js` (mới, nạp ngay sau `js/engine.js`), `index.html`, `js/stage.js` (bố cục nút, vòng chọn, chặn nút chưa mở, ải hướng dẫn xếp sẵn), `js/combat.js` (`inp.swapTo`), `js/fx.js` (giữ món chọn qua khựng hình), `js/moves.js` (nón ±40°, khoá mục tiêu), `js/village.js`, `js/village_scene.js`, `js/upgrade.js`, `js/hanh_trang.js`, `js/thanh_tuu.js`, `js/viec_ngay.js`, `js/so_yeu_quai.js`, `js/ai_ngay.js`, `js/chuong.js`, `tests/mo_dan_shots.py`, dist dựng lại.

## Còn để ý

- Khoá mục tiêu chưa có dấu hiện trên con bị khoá (tránh vẽ thêm bằng code trong trận); nếu cần, dùng một ảnh vòng ngắm có sẵn.
- Các bài kiểm cũ tự đặt bản lưu mới rồi đòi thấy Sổ / Thành tựu / Thợ Rèn sớm có thể cần thêm sao ải tương ứng (hoặc `?modan=0`).
