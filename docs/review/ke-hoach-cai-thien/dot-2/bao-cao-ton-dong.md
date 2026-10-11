# Đợt 2 — Xử lý tồn đọng sau khi mở rộng sàn 208 → 300 — Báo cáo

Ngày 11/10/2026 · nhánh làm việc `dot-2-ton-dong` (tách từ `khoi-tao-du-an` tại `4ad40cb7`) · commit `b5c2eefa`
**Chưa gộp vào `khoi-tao-du-an`, chưa lên spiritblade.web.app** (yêu cầu: không phát hành khi chưa được bảo). Sàn vẫn 300.

## A. Tóm tắt

**Đã sửa**
- Ô chỉ dẫn và dòng mẹo ở phòng thường **không còn che cửa, lối đi, mũi tên chỉ lối** ở cả ba trạng thái (cửa khoá, cửa mở, lúc cửa vừa mở). Chỗ đặt nay chọn theo cửa của phòng nên ô chữ không nhảy chỗ khi cửa mở.
- Câu hai dòng ở đáy chỉ còn chạm **4 điểm ảnh** mép sàn (trước 9), là dải không đứng được.
- Phòng Suối hồi: ô chỉ dẫn không còn sát chữ "Rương đồ".
- Chữ "Chạm để đổi vũ khí →" không còn có thể chồng lên thanh máu tinh anh.
- Hai bài kiểm còn dùng số của sàn cũ đã cập nhật (`au_onboarding.py`, `dan_linhkhi_shots.py`). Thêm một bài soát bố cục tự động mới.

**Chưa sửa (cố ý)**
- Nhãn "Trảm Nguyệt" của nút Đặc biệt chạm trụ cửa phải trên màn 16:9: chỉ là hai hình chạm nhau, không che lối, không cản thao tác → giữ nguyên.
- Bốn lỗi của `ui_robust.py` và ảnh cắt lệch của `dan_linhkhi_shots.py`: có từ trước đợt 2, không liên quan sàn → không đụng.
- Tầm đánh, khoảng cách quái bắn xa, số quái, tốc độ quái: không chỉnh.

**Cần chủ dự án quyết định:** có, 4 việc ở mục D.3 (quan trọng nhất: cách đo tiêu chí 60%, và có gộp nhánh này lên bản chạy thật không).

## B. Tệp thay đổi

| Tệp | Mục đích | Lý do |
|---|---|---|
| `game/js/stage.js` | Chọn chỗ đặt ô chỉ dẫn / dòng mẹo theo cửa của phòng; dời chữ "Chạm để đổi vũ khí" xuống dưới thanh máu tinh anh; ghi `S.hintBox` (vị trí ô chữ vừa vẽ) cho bài kiểm đọc | Mục 3.1, 3.2 của yêu cầu |
| `game/tests/au_onboarding.py` | Đọc ô chữ game vẽ thật thay cho công thức cột trái của sàn cũ | Công thức cũ (rộng 118, y 93) không còn đúng với phòng thường |
| `game/tests/dan_linhkhi_shots.py` | Khung cắt ảnh bám theo giữa phòng thay cho x 136–344 | Số cũ là mép sàn 208 |
| `docs/review/ke-hoach-cai-thien/dot-2/kiem_bo_cuc.py` | Bài soát bố cục mới + chụp ảnh từng tình huống | Để không kết luận từ một ảnh tĩnh |
| `docs/review/ke-hoach-cai-thien/dot-2/anh-ton-dong/` | 44 ảnh bằng chứng (3 cỡ màn) | |
| `game/dist/*` | Sinh lại bằng `python3 game/build.py` | Quy ước của repo |

Không đổi: `room_art.js`, `minimap.js`, `engine.js`, `data.js`, `mobs.js`, `moves.js`, `combat.js`, sprite, bản lưu, phòng trùm. Ba bài `ui_robust.py`, `hanh_trang.py`, `trangphuc_shots.py` không có dòng nào phụ thuộc sàn cũ nên không sửa.

### Luật đặt ô chữ mới (phòng thường)

| Phòng có cửa | Ô chữ nằm ở | Ảnh |
|---|---|---|
| Không có cửa dưới | Đáy giữa, trên dải tường trước | `*-1-day-khong-cua-duoi.png` |
| Có cửa dưới, không có cửa trên | Giữa tường phía trên, dưới thanh máu tinh anh / đồng hồ thử thách / ô "Trùm đã học" | `*-2-tuong-sau-cua-duoi-khoa.png`, `-mo.png` |
| Có cả cửa trên và cửa dưới | Trên tường, bên phải cửa trên (bên trái nếu bên phải đang có chữ "Chạm để đổi vũ khí") | `*-3-canh-cua-tren-khoa.png`, `-mo.png`, `*-3-tinh-anh-song-hai-cua.png` |
| Tường trên hết chỗ (câu dài, phía trên đang có thanh máu tinh anh…) | Cột trái, dưới dòng "khuyên" (kiểu phòng trùm) | `*-4-cot-trai-tinh-anh-meo-dai.png`, `*-suoi-hai-cua.png` |
| Vẫn không có chỗ sạch, và là dòng mẹo không gấp | Dời sang phòng kế (dùng lại cơ chế hoãn mẹo đã có ở phòng đầu ải 1) | — |

Giữ nguyên: mỗi lúc chỉ một ô (mẹo có đếm giờ hiện trước, rồi tới lời chỉ dẫn); cỡ chữ 7. Khi có dòng báo vài giây ở tường trên (rơi đồ…), ô chữ ở tường trên tạm ẩn để không chồng chữ.
Đã kiểm xung đột trước khi dùng tường trên: thanh máu tinh anh, đồng hồ thử thách, ô "Trùm đã học", thanh máu/mana, nút tạm dừng, ô vũ khí — bài soát đo từng thứ.

## C. Bảng kiểm thử

| Hạng mục | Lệnh / bài | Kết quả | Bằng chứng | Trạng thái |
|---|---|---|---|---|
| Ô chữ không che cửa (khoá và mở), vùng đứng được, nút, cần, bản đồ nhỏ, ô vũ khí, thanh máu, thanh máu tinh anh, đồng hồ thử thách, chữ "Rương đồ"; không bị cắt | `python3 docs/review/ke-hoach-cai-thien/dot-2/kiem_bo_cuc.py 40` | 3 cỡ màn × 2.560 ca (40 hạt giống ải hướng dẫn + mẹo dài ở cả ba kiểu bản đồ, mọi phòng, cửa khoá/mở, có ca tinh anh đang sống): **0 vi phạm**; lấn mép sàn nhiều nhất 4 px; 64 ca (2,5%) dòng mẹo dời sang phòng kế | đầu ra lệnh | PASS |
| Ba cỡ màn 844×390, 1280×720, 390×844 | cùng bài trên + `... kiem_bo_cuc.py anh` | 13 tình huống × 3 cỡ, đã xem ảnh | `anh-ton-dong/` | PASS |
| Lúc đang chuyển phòng | ảnh `*-chuyen-phong.png` | Ô chữ đứng yên trong lúc màn trượt, không che gì của phòng mới | ảnh | PASS |
| Người mới chơi thật ải 1 (chạm thật, 844×390): màn chào → làng → ải 1 → trùm → kết quả → làng → ải 2 | `python3 tests/au_onboarding.py` | Đi hết luồng, 0 lỗi trang; lời chỉ dẫn hiện ở mọi phòng (đáy hoặc tường trên) | 5 ảnh `nguoi-moi-844-*.png` | PASS (bài này là bài ghi nhận, không có điều kiện đạt/trượt riêng) |
| Hành trang | `python3 tests/hanh_trang.py` | 82/82 đạt (bản trước đợt 2 cũng 82/82) | đầu ra | PASS |
| Độ bền (xoay màn, ẩn trang, bản lưu hỏng) | `python3 tests/ui_robust.py` | 30/34; **4 hỏng, giống hệt khi chạy trên bản trước đợt 2** (`4aeaede1~1`) | xem D.1 | FAIL (có sẵn, không do sàn) |
| Ảnh đạn và linh khí | `python3 tests/dan_linhkhi_shots.py` | Chạy hết, 0 lỗi trang, 0 lỗi vẽ. Ảnh `01`, `05` cắt trúng tường chứ không trúng đạn — ảnh đang lưu trong repo cũng vậy | xem D.1 | PASS chạy được / lỗi nội dung ảnh có sẵn |
| Ảnh trang phục | `python3 tests/trangphuc_shots.py` | Chạy hết, 0 lỗi trang; đã xem `tac-dung-tran.png`, cảnh đánh nằm đúng khung | đầu ra | PASS |
| Nhịp đánh không đổi so với báo cáo đợt 2 | `kiem.py nhip 1..12` và `--rong=208` | 18,07 / 30,40 giây (sàn 300) và 16,43 / 30,32 (sàn 208): **trùng từng số** với lần đo trước → vòng này không đụng gameplay | đầu ra | PASS |
| Số quái, giới hạn quái | đọc `G.ROOM_WAVES` trong bản build | Không đổi (`maxAlive 4`, `pts 0,85`…) | đầu ra | PASS |
| Phòng trùm không đổi | so ảnh trước/sau vòng này, cùng hạt giống | 390×844: có cặp 0 điểm ảnh khác; 844×390: 24 điểm ảnh; 1280×720: không có cặp trùng khít, mức khác bằng hai lần chụp cùng một bản code (khung nhấp nháy của em bé). Code: mọi nhánh mới đều có điều kiện "không phải phòng trùm" | đầu ra | PASS (1280×720 dựa thêm vào đọc code) |
| Quay về sàn 208 vẫn chạy | `kiem.py nhip --rong=208` | Ra đúng số cũ; bố cục cũ dùng lại đường code cũ | đầu ra | PASS |
| Cú pháp, bản lưu, build | `node --check game/js/*.js`; `node game/tests/cloud_save_regression.test.js`; `python3 game/build.py`; mở `dist/linh-khi.html?cloud=0` | Không lỗi; 7/7; build xong; trang mở không lỗi JS | đầu ra | PASS |
| Các bài khác trong `game/tests/` (hơn 100 tệp) | — | — | Còn hiệu lực lời dặn không chạy bộ kiểm dài; chỉ chạy 5 bài được nêu + bài của đợt | NOT RUN |
| Workflow đăng web | — | — | Nhánh này không kích hoạt workflow (chỉ `khoi-tao-du-an` mới đăng) | NOT RUN (cố ý) |
| Cảm giác chơi trên iPhone thật | danh sách ở mục F | — | — | MANUAL REQUIRED |

Ảnh do ba bài `*_shots` và `au_onboarding` ghi đè vào `docs/` đã được trả về như cũ sau khi chạy (không commit ảnh sinh lại).

## D. Vấn đề còn lại

### D.1 Lỗi đã xác nhận (có từ trước đợt 2, chưa sửa vì ngoài phạm vi)
1. `ui_robust.py` hỏng 4 điều kiện, trên cả bản trước đợt 2: ba ca bản lưu hỏng (game vẫn chạy nhưng in một dòng cảnh báo ra console, bài kiểm coi mọi dòng console là lỗi) và một ca "lớp chữ khớp kích thước" (bài kiểm chờ mật độ 3, game đã giới hạn mật độ 2 từ bản V27). Có vẻ bài kiểm lạc hậu chứ không phải game hỏng, nhưng tôi chưa xác minh sâu.
2. `dan_linhkhi_shots.py`: ảnh `01-dan-tung-loai.png` cắt ở y 22–52 nên chụp trúng tường, không thấy viên đạn nào. Ảnh trong repo cũng thế.
3. Phòng Suối hồi có cửa trên: ô "Trùm đã học…" (giữa trên) che phần trên của cửa đó. Có từ trước; các dòng báo vài giây ở giữa trên cũng che cửa trên như vậy.

### D.2 Rủi ro chưa xác nhận
1. **Chưa ai chơi trên iPhone thật.** Bot và ảnh không nói được chữ có dễ đọc, quái có thưa không.
2. Cột trái hẹp (62–74 điểm ảnh): câu dài thành 7–9 dòng ngắn, đọc kém hơn. Chỉ gặp khi phòng có cả cửa trên, cửa dưới và phía trên đang bận.
3. Dòng mẹo bị dời sang phòng kế (2,5% số ca thử): nếu người chơi không vào thêm phòng mới nào trong ải đó thì mất dòng mẹo ấy (mẹo vũ khí chỉ hiện một lần).
4. Bài soát dùng hình chữ nhật ước lượng cho cửa (rộng 48) và chỉ chụp ảnh ở vùng Rừng già; Hang biển và Lâu đài cổ dùng chung toạ độ nhưng tôi chưa xem ảnh.
5. Tầm đánh và khoảng cách quái bắn xa đã đổi theo bề ngang phòng (mục dưới): chưa có người thật cảm nhận.
6. Nhãn "Trảm Nguyệt" chạm trụ cửa phải ở 16:9 (ảnh `may1280-nut-dac-biet-cua-phai.png`): lòng cửa, mũi tên, vệt sáng đều lộ rõ; vùng bấm của nút cách chỗ bước qua cửa 55 điểm ảnh (bán kính vùng bấm 23). Không phải lỗi, chỉ kém đẹp.

**Giải thích các con số gameplay đổi theo bề ngang (không sửa gì):** code tính các tầm này bằng "tỉ lệ × bề ngang chỗ đứng được" rồi kẹp trong [nhỏ nhất, lớn nhất]. Bề ngang chỗ đứng được từ 190 thành 282, **bằng đúng phòng trùm**, nên mọi giá trị mới là giá trị người chơi vốn đã gặp ở phòng trùm.

| Thứ | Chỗ trong code | Sàn 208 | Sàn 300 |
|---|---|---|---|
| Trảm Nguyệt (Đặc biệt của kiếm) | `moves.js:25`, `:735` — 0,66 × bề ngang, kẹp 110–170 | 125 | 170 |
| Phi Thương (giáo) | `moves.js:28` — 0,62 ×, kẹp 110–165 | 118 | 165 |
| Địa Chấn (búa) | `moves.js:30` — 0,5 ×, kẹp 90–140 | 95 | 140 |
| Sóng "Lấy đà" của búa | `moves.js:496` — tối đa 0,45 × | tới 85 | tới 127 |
| Tầm chưởng | `chuong.js:28`, `:242` — 0,8 ×, kẹp 130–205 | 152 | 205 |
| Mưa Tên khi không có quái để ngắm | `combat.js:540` — 0,4 ×, tối đa 110 | 76 | 110 |
| Quái bắn xa giữ khoảng cách | `mobs.js:286` — 0,42 ×, tối đa 120 | 80 | 118 |

Không đổi: tốc độ quái, số quái mỗi đợt, tối đa 4 quái cùng lúc, tầm chém thường, tốc độ lăn (195), khoảng cách quái mọc cách em bé (66 / 84). Hệ quả hợp lý: đòn tầm xa của người chơi với tới xa hơn (dễ hơn một chút), quái bắn xa đứng xa hơn nên phải đi bộ lâu hơn mới chém tới, đạn bay lâu hơn nên dễ né hơn. Đó là lý do phòng ải 1 dọn chậm 8,4% và cả ải chậm 9,1% dù không đổi quái. Bot ở ải 3 còn nhiều máu hơn (66% so với 53%) và thắng 38/40 so với 37/40 — gợi ý là không khó lên, nhưng bot không thay được người.

### D.3 Quyết định cần chủ dự án duyệt
1. **Tiêu chí "sàn ≥ 60%":** vẫn chưa thống nhất cách đo. Sàn 300 = 62,5% khung game = 51,3% màn hình 844×390. Tôi giữ 300 và **không coi tiêu chí này là đã đạt**. Cần bạn chốt đo theo khung game hay theo cả màn hình.
2. **Gộp nhánh `dot-2-ton-dong` vào `khoi-tao-du-an`** (gộp là bản sửa này tự lên spiritblade.web.app). Bản đang chạy trên web hiện vẫn là bản đợt 2 cũ: ô chỉ dẫn còn che cửa dưới khi cửa khoá.
3. Chấp nhận việc dòng mẹo đôi khi dời sang phòng kế, hay muốn nó luôn hiện ngay (khi đó sẽ có lúc che một góc sàn)?
4. Có mở việc riêng để sửa ba lỗi có sẵn ở D.1 không?

## E. Hướng quay lui

- **Chưa gộp thì không có gì để quay lui:** `khoi-tao-du-an` và bản trên web chưa đổi. Bỏ vòng này = không gộp nhánh `dot-2-ton-dong`.
- **Nếu đã gộp rồi muốn bỏ riêng vòng này:** `git revert b5c2eefa`, chạy `python3 game/build.py`, add `game/dist`. Chỉ đụng `stage.js`, hai tệp kiểm và ảnh/tài liệu của đợt 2, nên không ảnh hưởng việc của các phiên khác; tệp `game/dist` có thể xung đột nếu đã có build mới hơn, khi đó build lại là xong.
- **Quay về sàn 208:** vẫn như báo cáo đợt 2, đổi `RA.RONG_PHONG = 300` thành `208` trong `game/js/room_art.js` rồi build. Khi đó phòng thường dùng lại nguyên bố cục cũ (ô chỉ dẫn ở cột trái).
- Không có dữ liệu bản lưu nào bị đổi.

## F. Bước tiếp theo đề xuất

1. Bạn trả lời D.3 mục 1 và 2.
2. Chơi tay trên iPhone theo danh sách dưới (khoảng 15 phút). Kết quả sẽ cho biết có cần đụng tới quái hay tầm đánh không.

**Danh sách chơi tay** (iPhone cầm ngang; ca 1–5 cần bản lưu mới để vào ải hướng dẫn)

| # | Làm gì | Đạt khi | Trượt khi |
|---|---|---|---|
| 1 | Vào ải 1 lần đầu, đứng yên đọc lời chỉ dẫn | Đọc hết câu mà không phải nheo mắt; chữ không đè em bé, quái | Chữ bị cắt, bị nút che, hoặc che chỗ đang đánh |
| 2 | Dọn xong từng phòng, tìm cửa ra | Thấy ngay cửa mở và mũi tên ở mọi phòng | Có phòng phải đoán cửa ở đâu vì chữ che |
| 3 | Phòng tinh anh ải 1: làm theo "Chạm để đổi vũ khí →" | Đổi sang cung được ngay lần chạm đầu; chữ không đè thanh máu tinh anh | Chạm trượt, hoặc hai ô chữ chồng nhau |
| 4 | Phòng Suối hồi ải 1 | Đọc được lời chỉ dẫn và chữ "Rương đồ" riêng biệt | Hai chữ dính nhau |
| 5 | Trong cả ải 1, bấm Né / Đặc biệt / Chưởng 20 lần lúc đang chạy | Không lần nào bấm nhầm nút, không lần nào ngón cái che quái đang đánh mình | Bấm nhầm ≥ 2 lần, hoặc thấy quái hay nấp dưới ngón cái |
| 6 | Ải 1 và ải 3 với kiếm: đếm số lần phải đuổi theo quái bắn xa | Thấy đuổi được, không bực; phòng không có lúc trống quá 3 giây giữa các đợt | Thấy phòng "thưa", hay phải chạy vòng tìm quái |
| 7 | Dùng Trảm Nguyệt và Chưởng từ đầu này sang đầu kia phòng | Tầm đánh thấy hợp lý, không thấy "bắn xuyên cả phòng quá dễ" | Thấy đòn tầm xa làm trận quá dễ hoặc vệt đòn dừng lưng chừng khó hiểu |
| 8 | Ải 3: để ý số lần bị đạn quái bắn xa trúng | Né được phần lớn, không thấy khó hơn trước | Thấy bị bắn từ ngoài tầm mắt hoặc khó hơn hẳn |
| 9 | Đi sát bốn bức tường và qua cả bốn loại cửa | Em bé không lọt vào tường, qua cửa mượt | Kẹt ở mép, hoặc đứng trước cửa mà không qua được |
| 10 | Vào phòng trùm ải 1 và ải 5 | Giống hệt trước đây | Có gì lệch chỗ |
