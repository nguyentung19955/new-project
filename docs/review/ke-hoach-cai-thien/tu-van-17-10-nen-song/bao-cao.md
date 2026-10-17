# Tư vấn 17/10 — Sông sâu, gọn hệ thống, tương phản nền (báo cáo)

Làm theo `../TU-VAN-CHATGPT-17-10.md` mục 2.1, 2.2, 5, 6 và việc 3. **Không chơi thử**: chỉ `node --check`, build, chạy headless bằng lệnh.
Không đổi luật chơi, không đổi số liệu cân bằng. Không đụng đăng nhập Google / lưu mây / `?cloud=0`.

## Cờ quay lui

| Cờ | Về như cũ |
|---|---|
| `?goiy1=0` | Không có dòng "Nên làm" ở màn kết quả và ở làng |
| `?luyen=0` | Toàn bộ chữ cũ (mài, quặng, ép đồ…) — như trước |
| `?sanmoi=0` | Ảnh sàn 4 vùng như trước (bản web) |

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

## Phần B — tương phản Cu Tí / quái với nền (làm sau phiên "Nét cao — nền", `../net-cao-nen/bao-cao.md`)

Đã chờ báo cáo phiên nét cao nền rồi mới sửa (phiên đó thêm ảnh nét 3 / 4 cho sàn; phiên này sửa luôn cả bản nét cao).

### Đã làm — sửa ẢNH sàn (không vẽ code, không làm mờ)

Công cụ `cong-cu/san-diu.py --ghi` sửa thẳng 16 ảnh sàn `gd-nen-<vùng>-san0/1/2/san-nhan` (4 vùng):

1. **Rừng già: dọn đốm lẻ** — điểm game nào khác màu cả 4 điểm kề (đốm lá 1 điểm) lấy màu nhiều nhất của điểm kề; mảng lớn giữ nguyên, không thêm màu mới (số màu 6 → 6). Ba vùng kia sàn là vân hạt dày nên không dọn (sẽ đổi kiểu vẽ).
2. **Bớt tương phản chi tiết** quanh màu trung bình của mảng: Rừng già **24%**, Sông sâu 22%, Hang biển và Lâu đài 20%.
3. **Sáng thêm một chút** (nhân theo tỉ lệ, giữ độ đậm màu): Rừng già +14 mức, Lâu đài +12, Sông sâu +8, Hang biển 0 (đã sáng).
   Lý do: Cu Tí và mọi quái đều có **viền tối `#14182e`** và nhiều con thân tối / nâu — nền sáng hơn thì viền tách khỏi nền rõ hơn. Làm tối nền (thử trước) thì Rừng già **kém đi** (viền đọc được giảm 4–5 điểm %).
4. **Bản nét cao** (`anh_n3`, `anh_n4` của Hang biển, Lâu đài, Sông sâu) ép cùng màu trung bình, cùng hệ số, rồi ghi lại khoá `net_cao_cua` → build giữ ảnh nét cao (không có dòng "CHÚ Ý"). Rừng già chưa có ảnh nét cao (phiên trước ghi thiếu ảnh gốc), nét cao tự phóng từ ảnh mới.

Độ lệch chuẩn độ sáng của ảnh sàn (càng thấp càng ít rối): Rừng già 13,6 / 11,2 / 15,1 / 18,1 → 11,9 / 9,8 / 14,0 / 16,9 (kèm bớt ~400–700 đốm lẻ mỗi mảng); Hang biển ~23 → ~19; Lâu đài ~15 → ~11; Sông sâu ~31 → ~25.

### Cờ tắt `?sanmoi=0`

Ảnh sàn cũ giữ ở `game/art/custom/gd-nen-*-san*-sancu.sprite.json` (mục `san_cua`), **chỉ có ở bản web hai tệp** và chỉ tải khi bật `?sanmoi=0`
(như tấm `-netcu` của phiên do-net; không tính vào tải đầu). Đã thử bản web `linh-khi-nhe.html` qua máy chủ thử: mặc định nạp `gd-nen-rung-san0.<mã>.webp`,
`?sanmoi=0` nạp `gd-nen-rung-san0-sancu.<mã>.webp`, có / không `?netcao=3` đều đúng. **Bản một tệp** (chỉ còn dùng cho trang công cụ) không chứa sàn cũ (giữ dưới trần 30 MB) → `?sanmoi=0` ở đó không đổi gì.

### Đo ở 480×270 (`cong-cu/do-tuong-phan.py` + `cong-cu/do-vien.py`)

Mỗi vùng: ải 1, phòng đầu, Cu Tí giữa phòng, 4 quái thường của vùng quanh, chụp canvas thế giới thu về 480×270 (bot dựng cảnh, không chơi).
Hai cột cuối là **% điểm viền** của nhân vật lệch hẳn với nền ngay cạnh (độ sáng ≥ 30 mức / màu ΔE ≥ 30) — càng cao càng dễ nhìn ra dáng.

| Vùng | Ai | Thân − nền (độ sáng) | Viền lệch sáng ≥ 30 (%) | Viền lệch màu ≥ 30 (%) |
|---|---|---|---|---|
| Rừng già | Hoa Bào Tử | 3 → 16 | 51 → 58 | 72 → 75 |
| Rừng già | Heo Con | 15 → 28 | 55 → 64 | 75 → 74 |
| Rừng già | **Cu Tí** | 30 → 37 | 83 → 84 | 81 → 81 |
| Rừng già | Bọ Hung | 8 → 19 | 54 → 58 | 75 → 75 |
| Rừng già | Chồn Bóng | 10 → 1 | 39 → 50 | 67 → 67 |
| Hang biển | Hải Quỳ / Cua / Ốc / Cá Chuồn | 2–12 (không đổi) | 62–76 → 62–76 | 64–79 (không đổi) |
| Hang biển | **Cu Tí** | 44 → 44 | 81 → 84 | 69 → 72 |
| Lâu đài cổ | Đèn Lồng | 18 → 7 | 59 → 60 | 53 → 62 |
| Lâu đài cổ | Linh Ma | 7 → 4 | 37 → 42 | 23 → 30 |
| Lâu đài cổ | **Cu Tí** | 17 → 26 | 78 → 82 | 61 → 71 |
| Lâu đài cổ | Tượng Đá | 25 → 14 | 51 → 52 | 40 → 46 |
| Lâu đài cổ | Mèo Đen | 7 → 17 | 42 → 47 | 23 → 33 |
| Sông sâu | Cóc Tía | 7 → 16 | 72 → 71 | 74 → 74 |
| Sông sâu | Rái Cá | 16 → 25 | 68 → 68 | 53 → 53 |
| Sông sâu | **Cu Tí** | 53 → 58 | 89 → 87 | 77 → 79 |
| Sông sâu | Ba Ba | 16 → 22 | 59 → 58 | 38 → 38 |
| Sông sâu | Rắn Nước (hình tạm, đứng trên dòng nước) | 2 → 2 | 42 → 42 | 45 → 45 |

Số đầy đủ: `anh/do-truoc.json`, `anh/do-sau.json`. Ảnh TRƯỚC / SAU (480×270, trái / phải): `anh/truoc-sau-rung.png`, `anh/truoc-sau-bien.png`,
`anh/truoc-sau-lau.png`, `anh/truoc-sau-song.png`; Rừng già phóng ×2: `anh/rung-x2-truoc-sau.png`.

**Nói thẳng về mục "quái sáng hơn nền ≥ 30–40 mức"**: chưa đạt được chỉ bằng sửa sàn. Quái Rừng già / Lâu đài phần lớn **cùng độ sáng với sàn** (thân 55–90, sàn 60–95), còn Cu Tí thì **tối** —
sàn tối đi giúp quái thì làm Cu Tí chìm, và ngược lại. Phiên này chọn hướng **nền dịu + sáng hơn một chút** để viền tối của mọi nhân vật nổi lên (cả Cu Tí lẫn quái đều tăng hoặc giữ),
và quái vẫn tách khỏi nền nhờ **màu** (cột cuối: Rừng già 67–81%).

### Còn chìm — cần chủ game quyết

1. **Lâu đài cổ: Linh Ma, Mèo Đen** (viền lệch màu 30–33%): con tối trên sàn đỏ tối. Muốn sửa tận gốc phải sáng ảnh quái (hoặc thêm viền sáng 1 điểm ở ảnh quái) — đổi hình quái nên chưa làm.
2. **Sông sâu: Ba Ba** (thân ô-liu trên sàn tre vàng ô-liu, 38%) và Rắn Nước (hình tạm) — nên xử lý khi gen ảnh Sông sâu theo `PROMPT.md` (luật "thân sáng hơn sàn" đã ghi vào prompt).
3. Gợi ý của tư vấn "vùng sàn ít chi tiết quanh chân nhân vật" chưa làm (sẽ phải vẽ code chạy theo nhân vật).

### Kiểm phần B

| Bài | Kết quả |
|---|---|
| `node --check` mọi `game/js/*.js` | Đạt |
| `python3 game/build.py` / `--hai-tep` | Đạt — một tệp **29,88 MB** / 30; người chơi tải **17,69 MB** / 20; không có dòng "CHÚ Ý" ảnh nét cao |
| Headless `dist/linh-khi.html?cloud=0` 4 vùng: mặc định, `&sanmoi=0`, `&netcao=3` | **0 lỗi JS** |
| Bản web `linh-khi-nhe.html` qua máy chủ thử: mặc định, `&sanmoi=0`, `&netcao=3`, `&sanmoi=0&netcao=3` | 0 lỗi JS của game (chỉ báo thiếu `sw.js` vì máy chủ thử không có tệp đó); đúng ảnh sàn mới / cũ |
| Gợi ý một việc (phần A) chạy lại trên bản mới | 0 lỗi |
| `game/tests/smoke.py` | 0 lỗi |

Không đổi luật, số liệu, vùng trúng, va chạm, chỗ đặt đồ / quái. Không đụng đăng nhập Google / lưu mây / `?cloud=0`.
