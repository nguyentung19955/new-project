# Đưa 6 quái Rừng già còn lại vẽ lại (đủ 6 động tác) vào game (15/10 09:10)

Làm y như phiên `quai-moi-4-con` (đọc `../quai-moi-4-con/YEU-CAU.md` và `bao-cao.md`, DÙNG LẠI `../quai-moi-4-con/cong-cu/` — dung-quai-moi.py, ve-soat.py, anh_quai.py), cho 6 mã:
`namPhong`, `namPhongChua`, `hoaBaoTu`, `socNo`, `nhimDoc`, `ongVo`.

Ảnh đã cắt: `docs/anh-goc/quai-moi/dong-tac/<mã>-<bước>-cat/<hàng>/khung-NN.png` (+ `bao-cao.json` của từng lần cắt có `khung_bao` = vị trí khung trên tấm gốc).
| Bước | Thư mục | Số khung | Hàng |
|---|---|---|---|
| 1 Đứng thở | `<mã>-1-dung-cat` | 6 | idle (ongVo: thư mục hàng `idle`; các con khác `dung`/`idle` — xem trong thư mục) |
| 2 Đi | `<mã>-2-di-cat` | 6 | move |
| 3 Báo đòn | `<mã>-3-bao-don-cat` | 6 | tele |
| 4 Đánh | `<mã>-4-danh-cat` | 6 | atk |
| 5 Trúng đòn | `<mã>-5-trung-don-cat` | 4 | hit |
| 6 Chết | `<mã>-6-chet-cat` | 6 | die |
Tên thư mục hàng bên trong có thể khác nhau (dung/idle, move, tele, atk, hit, die) — dò bằng glob. Ảnh mẫu: `docs/anh-goc/quai-moi/<mã>-mau-moi.png`.

Lưu ý riêng từng con (đã xử lý khi cắt):
- **Nấm Phồng / Nấm Phồng Chúa**: máy cắt căn đáy nên MẤT ĐỘ NHẢY. Hàng nào con nấm nhảy lên (đánh của Nấm Phồng Chúa = nhảy dập; đi của nấm nếu nảy) phải khôi phục độ cao từ `khung_bao` trong `bao-cao.json` (đáy khung so với đáy thấp nhất của hàng, nhân hệ số chuẩn cỡ) → ghi vào điểm neo/`can_tam` từng khung để thân bay lên thật. `namPhongChua-3-bao-don-b.png` là bản dự phòng, dùng bản chính.
- **Sóc Nổ**: hạt dẻ bay ra ở khung ném đã bị xoá — hạt dẻ là đạn do code vẽ (giữ như hiện tại trong `ky_nang_quai.js`). Hàng chết có quả hạt dẻ nằm cạnh, giữ.
- **Hoa Bào Tử**: các hạt bào tử bay ra ở hàng đánh đã xoá (còn 1 viên dính miệng là dáng phun). Hạt bào tử là đạn code vẽ. Hoa đứng yên một chỗ (rễ) — hàng đi chỉ đung đưa, không trượt chân.
- **Nhím Độc**: hàng đánh = cuộn tròn lăn (có bụi). Lăn dài theo vạch → hàng atk cần chạy LẶP suốt thời gian lăn (hoặc lặp khung 3–6). Hàng báo đòn = cuộn tròn dần.
- **Ong Vò**: bầy 3 con trong mỗi khung, loại `bay` (không có đường đất) — căn theo tâm bầy, giữ độ cao bay như tấm cũ. Hàng chết khung 5–6 là khung 4 mờ dần (đã làm sẵn).
- Hàng trúng đòn của Hoa Bào Tử và Nhím Độc AI vẽ TO hơn hẳn — chuẩn cỡ theo thân như phiên trước.

Việc:
1. Dựng lại 6 tấm `game/art/custom/<mã>.sprite.json` đúng định dạng phiên trước (`tam`, `dong_tac`, `khung_rong/khung_cao`, `goc`, `rong/cao` GIỮ số cũ, `net: 2`, `can_tam`), chuẩn cỡ theo thân (SIFT + diện tích), cỡ trong game = thân đứng của tấm cũ, LANCZOS + 32 màu, viền sắc.
2. Căn chân/căn tâm như phiên trước, không nhảy hình khi đổi hàng (trừ độ nhảy thật của nấm ở trên).
3. Thời gian khớp kỹ năng trong `game/js/ky_nang_quai.js` (Nấm Phồng phồng nổ, Sóc ném hạt dẻ, Hoa phun 3 hạt, Nhím lăn, Ong bổ 3 lần) và nếu Nấm Phồng Chúa là trùm nhỏ/tinh anh thì theo `chieu_trum.js`. Hàng game cần mà chưa có (chieu1…) → dùng lại hàng gần nhất, ghi rõ trong báo cáo, KHÔNG vẽ code.
4. Cờ `?quaicu=1` đã có: mở rộng để cũng trả 6 con này về tấm cũ (cách không làm phình ảnh người chơi tải, như phiên trước).
5. Ảnh soát: `xem-6-con.png` (6 hàng × khung mỗi con, cùng tỉ lệ, vạch đất, cột tấm cũ để so) và `xem-6-con.gif` (cỡ game ×3).
6. Dung lượng: báo "người chơi tải" trước/sau (trần 20 MB theo `build.py`; trước phiên này ~12,99 MB).

**TUYỆT ĐỐI KHÔNG TEST** — chỉ xử lý ảnh, ảnh soát tĩnh, node --check, build.py. KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Phiên `noi-gian-manh` có thể đang chạy song song (sửa js) — pull --rebase cẩn thận, giữ thay đổi của họ. Viết `bao-cao.md`.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
