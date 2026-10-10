# Báo cáo: Game có hai ngôn ngữ Tiếng Việt và English

Ngày 10/10/2026.

## 1. Đã làm gì

- Toàn bộ chữ trong game đã có bản **tiếng Anh**: màn hình đầu, làng, hội thoại người làng, hướng dẫn, cài đặt, lò rèn, hàng xén, thợ may, kỹ năng, cây chưởng, túi đồ, bản đồ, bảng vàng, lưu mây, góp ý, màn thắng/thua, tên phòng, tên ải, tên vùng, tên quái và trùm, tên vũ khí, tên đồ, mô tả kỹ năng, mẹo, chữ nổi trong trận.
  Từ điển có **hơn 1.400 mục**.
- **Tiếng Việt vẫn là mặc định và y hệt như trước.**
- Tên game "Linh Khí" và tên 4 em bé (Cu Tí, Cu Tèo, Cái Bống, Cu Lì) giữ nguyên ở bản tiếng Anh.

## 2. Cách đổi ngôn ngữ

- **Ở màn hình đầu**: bấm nút nhỏ **"EN / VI"** ở góc trên bên phải.
- **Trong làng**: vào **Anh Mõ (cài đặt)** → bấm nút **"Ngôn ngữ"** (dưới chữ có ghi "Tiếng Việt" hoặc "English").
- Bấm là đổi ngay, không cần tải lại. Mọi bảng đang mở cũng đổi theo.
- Game nhớ lựa chọn theo từng máy (lần sau mở lại vẫn đúng), và ghi vào bản lưu (trường `lang`; bản lưu cũ không có trường này = tiếng Việt).
- Lưu mây: ngôn ngữ đi theo máy, giống nút Âm thanh. Tải tiến trình từ mây về không làm đổi ngôn ngữ của máy.

## 3. Đã kiểm thế nào

- **Tiếng Việt**: chụp 49 màn (màn hình đầu, làng, các bảng người làng, túi đồ, phòng đánh, phòng trùm, tạm dừng, bản đồ, thắng, thua…) ở bản trước khi sửa và bản sau khi sửa, so từng điểm ảnh.
  Kết quả: **khác 0 điểm ảnh**, trừ đúng 2 chỗ có nút mới (nút "EN / VI" ở màn hình đầu và nút "Ngôn ngữ" ở bảng cài đặt).
- Đổi sang English rồi đổi lại Tiếng Việt: hình cũng y hệt bản tiếng Việt (khác 0 điểm ảnh).
- **English**: chụp cùng 49 màn, không có lỗi. Danh sách chữ chưa dịch (`G.ngonNgu.thieu`) **rỗng**.
- Bấm thử hai nút đổi ngôn ngữ trên bản đóng gói; tải lại trang vẫn giữ ngôn ngữ; bản lưu cũ mở ra là tiếng Việt.
- Bài kiểm tra lưu mây vẫn đạt, có thêm một mục kiểm "ngôn ngữ giữ theo máy".
- Chưa thử trên điện thoại thật, và chưa thử đăng nhập Google thật ở bản tiếng Anh (máy kiểm tra không có mạng tới Google). Phần đăng nhập và đồng bộ không bị sửa logic, chỉ đổi chữ hiển thị.

Ảnh ở thư mục `docs/review/ngon-ngu/anh/`: tệp `en-…` là tiếng Anh (49 ảnh), tệp `vi-…` là tiếng Việt (5 ảnh chính).

## 4. Chỗ còn tiếng Việt ở bản English (cố ý)

- Tên game **Linh Khí** và tên 4 em bé **Cu Tí, Cu Tèo, Cái Bống, Cu Lì**.
- Chữ "Tiếng Việt" trên nút Ngôn ngữ (để người Việt lỡ bấm nhầm vẫn tìm lại được).
- **Tên người chơi** trên Bảng vàng, tên tài khoản Google, nội dung góp ý người chơi tự gõ.
- Tên vùng, trùm, quái dân gian được **phiên âm không dấu**: Moc Tinh, Ngu Tinh, Ho Tinh (trong lời giới thiệu có kèm nghĩa).
- Trong hộp Góp ý, dòng "chỗ đang mở" (vd "Làng · …") vẫn là tiếng Việt vì đó là thông tin gửi về cho người làm game đọc.
- Danh hiệu vũ khí do game tự đặt (vd ", kẻ hạ …") được lưu trong bản lưu bằng tiếng Việt, nhưng khi hiện ở English thì được dịch.
- Thông báo lỗi kỹ thuật của trình duyệt/Google (nếu có) hiện nguyên văn.
- Các trang công cụ (Xưởng Sprite, Tách ảnh…) vẫn chỉ có tiếng Việt.

## 5. Chỗ cần biết thêm

- Tiếng Anh thường dài hơn tiếng Việt. Nút bấm ở bản English **tự thu nhỏ chữ**, vẫn không vừa thì cắt bằng dấu "…".
  Vài chỗ rất hẹp còn bị cắt "…" (vd tên vũ khí dài ở bảng thua, vài dòng phụ của vũ khí). Bản tiếng Việt cũng bị cắt ở những chỗ này.
- Tên vũ khí tiếng Anh ghép theo kiểu "chữ hệ + tên dòng", ví dụ "Kiếm Rèn Xích Diệm" → "Blaze Forged Sword".
- Đổi ngôn ngữ giữa lúc đang đánh (không có nút trong ải) thì vài dòng đã tạo sẵn của ván đó giữ ngôn ngữ cũ tới hết ván.
- **Sửa kèm một lỗi cũ**: từ lần làm "Độ nét", khi tải bản lưu từ mây về, hai lệnh ghi "chủ bản lưu" và "giờ lưu" bị lọt vào dòng chú thích nên không chạy. Đã cho chạy lại như trước.

## 6. Sau này thêm chữ mới thì làm sao

1. Viết chữ tiếng Việt trong code như bình thường (vd `ui.text('Chữ mới', …)`).
2. Nếu là chữ **ghép với số hoặc tên**, viết theo mẫu: `G.t('Cần {0} vàng', 50)` (đừng dùng dấu `+` để ghép).
3. Thêm bản dịch vào một tệp trong `tools/ngon-ngu/tu-dien/` (vd `lang.json`): `"Chữ mới": "New text"`, hoặc gõ lệnh:
   `python3 tools/ngon-ngu/sua.py lang "Chữ mới" "New text"`
4. Chạy `python3 tools/ngon-ngu/gop.py` (gộp từ điển vào game), rồi `python3 game/build.py`.
5. Soát chữ còn thiếu: `python3 tools/ngon-ngu/trich.py --thieu`, hoặc chạy `python3 game/tests/ngon_ngu_shots.py --lang en --out <thư mục>` (chụp ảnh và in danh sách chữ chưa dịch).

Quên bước 3 thì game không hỏng: chỗ đó hiện tiếng Việt ở bản English.
Hướng dẫn chi tiết và bảng thuật ngữ (từ nào dịch thành từ nào): `tools/ngon-ngu/HUONG-DAN-DICH.md`.

## 7. Tệp đã thêm / sửa

- Mới: `game/js/ngon_ngu.js` (cơ chế), `game/js/ngon_ngu_en.js` (từ điển, do máy gộp), `tools/ngon-ngu/` (từ điển gốc, công cụ trích/kiểm/gộp, hướng dẫn), `game/tests/ngon_ngu_shots.py` (chụp và so ảnh).
- Sửa chỗ ghép chữ trong `game/js/`: `village.js`, `stage.js`, `hanh_trang.js`, `linhkhi.js`, `upgrade.js`, `chuong.js`, `chuong_ui.js`, `tailor.js`, `outfit.js`, `weapon_art.js`, `combat.js`, `boss.js`, `minimap.js`, `ban_do.js`, `do_roi.js`, `bang_vang.js`, `cloud.js`, `cloud_ui.js`, `village_scene.js`, `ui_theme.js`, `engine.js`; thêm 2 dòng nạp tệp trong `game/index.html`; `game/build.py` (công cụ Xưởng Sprite nạp kèm `ngon_ngu.js`).
- Bản đóng gói `game/dist/*` và `tools/xuong-sprite/*` do `build.py` tạo lại.
