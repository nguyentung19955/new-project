# Tư vấn 17/10 — Sông sâu, gọn hệ thống, tương phản nền (báo cáo)

Làm theo `../TU-VAN-CHATGPT-17-10.md` mục 2.1, 2.2, 5, 6 và việc 3. **Không chơi thử**: chỉ `node --check`, build, chạy headless bằng lệnh.
Không đổi luật chơi, không đổi số liệu cân bằng. Không đụng đăng nhập Google / lưu mây / `?cloud=0`.

## Phần A

### A1. Sông sâu: kiểm kê + bảng màu + prompt gộp

Tất cả ở `PROMPT.md` (cùng thư mục):

- **Kiểm kê hình tạm**: Thuồng Luồng (đang mượn ảnh Ngư Tinh nhuộm màu, thân / đuôi / chiêu vẽ code), Cá Trê (mượn Cua Đá), 2 tinh anh
  (Rái Cá Thủ Lĩnh mượn Tướng Ma, Cóc Tía Chúa mượn Nấm Phồng Chúa), 4 quái thường (Rắn Nước, Ếch Phình, Ma Da, Trai Gai), bản đồ trang 2, cảnh truyện kết vùng.
- **Bảng màu vùng 7 màu**: `#1A2624` đen nước sâu · `#365B55` xanh bùn · `#4E8F91` xanh nước · `#8A7A4C` bùn cát · `#F2C66D` vàng đèn · `#66508A` tím trầm ·
  `#5FF0FF` lam phát sáng (chỉ mắt Thuồng Luồng / điểm yếu). Ảnh: `mau/bang-mau-song.png`. Kèm luật: thân quái sáng hơn sàn ≥ 30–40 mức.
- **Prompt gộp**: 26 ảnh thay cho khoảng 70 tấm cũ, theo thứ tự Thuồng Luồng (8) → Cá Trê (4) → 2 tinh anh (5) → 4 quái thường (9).
  Mỗi prompt ghi rõ ảnh nộp đặt ở đâu và **ảnh nào gửi kèm** (đường dẫn trong repo).
- Ảnh mẫu mới để gửi kèm (lấy từ ảnh đang có trong game, không vẽ mới): `mau/quai-song-4-con.png` (4 quái Sông sâu đã có ảnh),
  `mau/raiCa-tam-sach.png` (tấm động tác Rái Cá, nền xanh — để ChatGPT thấy cách xếp hàng).

### A2. Gọn hệ thống: chữ nói theo Luyện 1–15 (chỉ đổi chữ, không xoá tính năng)

Khi Luyện bật (mặc định), những chỗ còn nhắc **mài / quặng / ép đồ / đá nâng bậc / thẻ Linh khí / nâng lò** đã đổi sang **luyện / nguyên liệu rèn**.
Thêm `?luyen=0` thì mọi câu về y như cũ.

| Chỗ người chơi thấy | Câu cũ (khi Luyện bật vẫn hiện) | Câu mới |
|---|---|---|
| Màn kết quả khi thua | "Mẹo: về làng **mài vũ khí ở lò rèn**…" | "Mẹo: về làng **luyện vũ khí ở Ông Thợ Rèn**…" (khi có gợi ý một việc thì dòng gợi ý thay chỗ này) |
| Dòng báo "Mở mới" ở làng (qua Rừng già 1) | "…Lò rèn **mài vũ khí**." | "…Ông Thợ Rèn **luyện vũ khí**." |
| "Mở mới" qua Rừng già 3 | "Lò rèn **thẻ Linh khí**, nâng vũ khí và chọn hệ…" | "Luyện vũ khí lên **cấp 3** ở Ông Thợ Rèn để chọn hệ Lửa, Độc, Băng." |
| "Mở mới" hạ Mộc Tinh | "Mở mới: **Ép đồ, Nâng lò**, và Cô Thợ May…" | "Mở mới: Cô Thợ May về làng may trang phục." |
| Câu khi Thợ Rèn chưa ra mặt | "…ghé ông **mài** vũ khí." | "…ghé ông **luyện** vũ khí." |
| Chỉ dẫn phòng Thương nhân | "…bùa hệ và **quặng**." | "…bùa hệ và **nguyên liệu rèn**." |
| Rương chọn quà (linh khí) | "Dùng để nâng vũ khí (Mầm, Thành hình, Thức tỉnh)…" | "Dùng để luyện vũ khí và nâng bộ trang phục" |
| Bà Hàng Xén, thẻ NLR | "**Quặng** vẫn rơi nhiều nhất… thiếu lúc **mài**" + câu bà nói | nói "nguyên liệu rèn / luyện" |
| Gốc đa › hướng dẫn, trang "Bốn vũ khí", "Xem vũ khí" | "Nâng vũ khí bằng linh khí… (thẻ Linh khí)… bậc **ép đồ**" | Luyện 1–15: cấp 3 Mầm, 6 Thành hình, 12 Thức tỉnh; luôn thành công |
| Việc hôm nay "Nâng cấp ở làng" | "(**mài, ép đồ**, học điểm…)" | "(luyện vũ khí, học điểm…)" |
| Sổ yêu quái: quà vùng, nấc ★★★, dòng "nhận" | "**đá nâng bậc**" | "**nguyên liệu rèn**" với đúng số nhận được (game vốn đã tự đổi 1 đá = 2 NLR khi nhận, chỉ chữ ghi sai) |
| Tên ô tài nguyên `ore` | "Quặng" | "Nguyên liệu rèn" |

Đã soát thêm, **đã đúng từ trước** (không sửa): gợi ý Sổ `G.HINTS`, Ải ngày (Ải Rèn), Thành tựu, Hành trang › Tài nguyên, bảng nâng cấp / bảng thua, khối linh khí màn kết quả.
Câu tiếng Anh cho mọi câu mới đã thêm.

### A3. Gợi ý MỘT việc sau mỗi lượt chơi — `js/goi_y_1.js`, cờ tắt `?goiy1=0`

- **Màn kết quả** (thắng, bỏ ải, thua mà không có bảng "Nên cày gì"): một dòng khung xanh "**Nên làm: …** ▶" ngay trên khối linh khí. Bấm → về làng, mở đúng người làng.
- **Về làng**: cùng câu đó hiện ở hộp thoại làng 5 giây (có dòng "Mở mới" thì dòng "Mở mới" đè lên).
- Bảng thua có danh sách "Nên cày gì" vẫn như cũ (đã là danh sách xếp theo việc quan trọng).
- Chọn việc từ **dữ liệu có sẵn** (`G.upgradeTips` — đã theo Luyện, đã bỏ người làng chưa mở; `G.power`, `G.stageRec`), theo thứ tự:
  1. còn điểm kỹ năng / chưởng chưa học (miễn phí) → học;
  2. Sức mạnh thấp hơn khuyên dùng của ải đích và có việc làm được ngay → làm việc đó (vd "Luyện Kiếm tập sự lên 2");
  3. thắng và đã đủ sức → "đi tiếp ải …" (bấm mở Chú Lái Đò, chọn sẵn ải);
  4. còn lại: việc gần làm được nhất kèm chỗ còn thiếu, hoặc "chơi lại ải cũ để lên cấp".
- Không tính cho ải hướng dẫn và Ải ngày. Không đổi bản lưu. Cần bus sự kiện (`?sukien=0` thì cũng không hiện).

### Kiểm phần A

| Bài | Kết quả |
|---|---|
| `node --check` mọi `game/js/*.js` | Đạt |
| `python3 game/build.py` / `--hai-tep` | Đạt — một tệp 29,85 MB / 30; người chơi tải 17,74 MB / 20 |
| Headless `dist/linh-khi.html?cloud=0`: thắng / thua / bỏ ải rồi về làng — mặc định, `&goiy1=0`, `&luyen=0` | **0 lỗi JS**; có dòng gợi ý (mặc định, `luyen=0`), không có (`goiy1=0`) |
| `game/tests/smoke.py` | 0 lỗi |
