# Hướng dẫn tool dựng xương — tạo cử động từ 1 ảnh tĩnh

Gen nhiều khung bằng AI hay hỏng (sai phong cách, khung trước sau như hai người khác nhau, nhân bản người…).
`tools/dung-xuong.html` làm ngược lại: chỉ cần **1 ảnh đứng toàn thân** mỗi nhân vật, tool tự đoán khung xương,
cắt ảnh thành bộ phận và xoay quanh khớp để ra đủ khung đứng thở · đánh · tung chiêu · trúng đòn (quái / boss: đi · đánh · nổi giận).
Mọi khung dùng đúng nét vẽ của ảnh gốc nên không bao giờ lệch phong cách hay đổi mặt.

Ví dụ khung tool tự xuất (chưa chỉnh tay): `docs/dung-xuong-mau.png`.

## Ảnh đầu vào cần thế nào

- **1 nhân vật, đứng thẳng, toàn thân**, quay sang phải (quay trái thì tick "ảnh quay trái"), nghiêng 3/4 như ảnh tướng hiện có.
- **Nền trong suốt** (PNG) hoặc **nền hồng tím phẳng #FF00FF** — tool tự xoá nền (dùng chung cách tách nền với `cat-anh.html`).
- **Hai tay tách khỏi thân** một chút, tay cầm vũ khí chìa ra ngoài; hai chân hơi dang (thấy khe giữa hai chân). Tay khoanh / giấu sau lưng thì tool không xoay được tay.
- Cao ≥ 300 px là đủ (to hơn tool tự thu về 720 px). Đặt **tên file = mã tướng** như cat-anh: `lactuong.png`, `Thầy Mo Lửa.png`… (quái `tom.png`, boss `chantinh.png`).
- Lấy ngay ảnh có sẵn trong game cũng được: `assets/packs/<mã>/idle.png` (tướng) hoặc `walk1.png` (quái, boss).

## 5 bước

1. **Mở tool:** tải `tools/dung-xuong.html` về máy, bấm đúp — mở bằng Chrome hoặc Edge, không cần cài gì.
2. **Thả ảnh:** kéo thả một hay nhiều ảnh (hoặc cả thư mục) vào ô trên cùng. Mỗi ảnh thành một nút tròn ở hàng dưới; bấm nút để chọn tướng đang sửa.
3. **Kiểm tra xương (khung trái):** chấm vàng là khớp (đỉnh đầu, cổ, vai, khuỷu, bàn tay, hông, háng, gối, bàn chân, gốc / đầu vũ khí), màu phủ là vùng từng bộ phận (chú giải ở dưới).
   - Khớp lệch → **kéo chấm** tới đúng chỗ rồi bấm **Chia vùng theo khớp**.
   - Vùng sai (ví dụ cán vũ khí bị tính là tay) → chọn **Tô vùng**, chọn bộ phận, tô lên ảnh. **Hoàn tác** nếu tô nhầm.
   - Bấm **Lưu rig .json** để giữ lại (cất vào `tools/rig/<mã>.json`); lần sau thả ảnh kèm file `.json` đó (hoặc bấm **Nạp rig…**) là có lại xương đã chỉnh.
4. **Xem chuyển động (khung phải):** chọn **Động tác**, kéo **Biên độ** (to / nhỏ) và **Tốc độ**, chọn **Nền** bản đồ để xem như trong game. Tick **so khung trước / sau** để thấy bóng mờ khung trước.
   Bấm một khung ở dải ảnh nhỏ để dừng ở khung đó. Sai bộ đánh thì đổi ô **Vũ khí**: kiếm / rìu / giáo (vung cung) · cung (kéo dây, bắn) · nỏ (ngắm, bắn giật) · gậy phép (giơ cao) · tay không (đấm);
   ô **Tay cầm** chọn tay nào cầm vũ khí.
5. **Xuất:**
   - **Tải da-dung-xuong.zip** (trên cùng, gộp mọi tướng) hoặc **Tải zip tướng này** — khung đã cắt đúng `assets/packs/<mã>/…` + `pack-frames.json`, giống `da-cat.zip` của cat-anh.
     Gửi zip cho Claude ("ghép ảnh này vào game") hoặc tự chạy trong repo: `python3 tools/cat_anh.py --ghep da-dung-xuong.zip`.
   - **Tải tấm sheet PNG** — tấm lưới đúng chuẩn (`hero12` 4×3, `enemy6` 3×2, `boss9` 3×3, nền #FF00FF, chân cùng một đường) để đưa qua `cat-anh.html` như ảnh AI, hoặc làm ảnh tham chiếu tư thế khi gen AI.
   - Tick **kèm khung đi / chết** để zip có thêm `walk_1..4`, `die_1..4` (game hiện chưa dùng, để dành).

## Mẹo

- Ảnh tướng mặc áo choàng / váy dài: phần dưới háng thuộc thân, chỉ cẳng chân cử động — bình thường.
- Tay cầm khiên to: tool chỉ xoay nhẹ tay kia nên khiên không méo.
- Thấy mảnh vũ khí sót lại cạnh chân khi vung → tô vùng **Vũ khí** lên mảnh đó.
- Kiểm tra lại các khung trước khi ghép: tool báo đỏ nếu hai khung giống hệt nhau (tăng biên độ).
- Sửa tool: lõi tách nền / PNG / zip chép từ `cat-anh.html` bằng `node tools/build-dung-xuong.js`; test `node tests/dung-xuong/dung-xuong.test.js`.
