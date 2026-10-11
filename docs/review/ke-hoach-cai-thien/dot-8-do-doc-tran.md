# Đợt 8 — Độ đọc trận đấu trên điện thoại (R1 của cố vấn, mục 1/3/5 rà soát mỹ thuật)

Đọc `CHUNG.md`, `QUYET-DINH-Q1-Q6.md` mục II, IV, `docs/review/ra-soat-my-thuat/bao-cao.md` mục 1, 3, 5 (ưu tiên 2: "dọn lớp chữ trong ải + trả đỏ về cho cảnh báo"), `CO-VAN-CHATGPT-2026-10-11.md` mục R1, `docs/review/trai-nghiem/bao-cao.md` (các ảnh 06, 10, 11, 13, 18 chữ cắt/đè), `dot-2/bao-cao.md` mục 2 (chữ chỉ dẫn đã dời xuống đáy giữa, bộ nút gọn). Dự kiến 2 giờ. Tệp được sửa: `game/js/stage.js` (HUD trận, thông báo, chữ chỉ dẫn), `game/js/fx.js` hoặc nơi vẽ số sát thương, `game/js/btn_art.js` (màu nút Đánh), `game/js/ui_theme.js` (hằng màu), `game/js/ngon_ngu*.js` nếu đổi chữ. KHÔNG đổi luật chơi, sát thương, thời gian; KHÔNG đổi hình học phòng, cỡ nút, vị trí nút (Đợt 2 đã chốt).

## Làm
1. **Thứ bậc hình ảnh cố định** (ghi thành bảng trong `ui_theme.js` và báo cáo): vùng báo đòn > nhân vật và quái > thanh máu trùm/tinh anh và trạng thái trên thân > số sát thương > thông báo chiến đấu > chữ phụ (tên phòng, sức mạnh, mẹo). Lớp dưới không được vẽ đè lên lớp trên: kiểm thứ tự gọi vẽ trong `stage.js` và sửa nếu sai.
2. **Màu đỏ chỉ dành cho nguy hiểm.** Hiện nút Đánh và vùng báo đòn cùng đỏ. Đổi nút Đánh sang màu khác trong bảng màu lõi (đề xuất vàng đồng `#ffd23f`/`#c8a060` theo tông trống đồng; ghi hex đã chọn); nút Né, Chiêu, Chưởng giữ. Màu hệ của vòng nút (lửa/độc/băng) giữ. Chụp trước/sau.
3. **Số sát thương không chồng nhau:** cùng một quái trong 0,25 s → gộp thành một số (cộng dồn) hoặc lệch ngang/dọc theo lượt (so le 6 px); chí mạng to hơn và màu riêng như cũ; số của người chơi nhận sát thương màu khác số gây ra. Tối đa 6 số trên màn cùng lúc, cũ nhất tắt sớm.
4. **Thông báo chiến đấu có vùng riêng:** một dải ở mép trên sàn (dưới thanh máu trùm), tối đa **2 dòng** cùng lúc, dòng mới đẩy dòng cũ; không bao giờ vẽ lên vùng giữa sàn. Thông báo "+vàng/+vật phẩm" nhỏ bay lên tại chỗ nhặt như cũ nhưng không chồng lên số sát thương (lệch lớp).
5. **Cỡ chữ tối thiểu:** chữ nào người chơi phải đọc trong trận (chỉ dẫn, thông báo, tên trùm) ≥ 7 px game đậm, có nền tối mờ 70%; chữ phụ (tên phòng, sức mạnh) có thể 6 px nhưng không đè sàn. Không có chữ nào bị cắt bởi ô vũ khí/bản đồ (kiểm 844×390 và 1280×720).
6. **Cờ tắt** `G.DO_DOC_TRAN = true` → false về cách cũ (để so sánh).

## Nghiệm thu
- Ảnh trước/sau 844×390 ở 4 tình huống: phòng đông 6 quái đang đánh (số sát thương), tinh anh + thông báo, trùm (thanh máu + thông báo + báo đòn), ải 1 phòng đầu (chữ chỉ dẫn). Mỗi ảnh ghi rõ chỗ đã sửa.
- Không nút nào còn màu đỏ cảnh báo; vùng báo đòn vẫn đỏ.
- Trong 10 s bot đánh phòng 6 quái: không lúc nào > 6 số sát thương, không số nào đè số khác (kiểm bằng toạ độ khi vẽ, ghi log).
- Thông báo: không quá 2 dòng, không vẽ vào vùng sàn giữa.
- Bot ải 1 vẫn thắng; nhật ký sát thương trùng bản trước (chỉ đổi cách vẽ).
- Cờ false → so ảnh = 0 khác.
- Báo cáo `docs/review/ke-hoach-cai-thien/dot-8/bao-cao.md` theo mục IV; chỗ nào đổi màu/cỡ là lựa chọn thẩm mỹ thì ghi vào "quyết định cần duyệt" kèm ảnh.

## Bổ sung 13:21 (chủ dự án duyệt) — Đợt 8b, làm NGAY SAU Đợt 8 (cùng tệp HUD)
Bỏ **ô vuông "dấu Linh Khí"** (hình lửa / giọt độc / bông tuyết) trên đầu quái (`linhkhi.js` `iconCv` và chỗ vẽ trên đầu quái trong `mobs.js`/`stage.js`). Thông tin đó chuyển thành **viền 1 px màu hệ quanh thanh máu nhỏ của quái** (lửa `#fe7d04`, độc `#5aca02`, băng `#32b0e9`); quái không có dấu thì viền như cũ. Trên đầu quái sau đợt này chỉ còn: thanh máu (có viền hệ), biểu tượng đặc tính tinh anh (12×12), biểu tượng vỡ giáp. Cờ tắt dùng chung `G.DO_DOC_TRAN`. Kiểm: ảnh 844×390 phòng có 3 quái mang dấu 3 hệ, trước/sau; bot ải 1 vẫn thắng; cờ false → như cũ. Báo cáo ghi vào `dot-8/bao-cao.md` mục riêng "8b".
