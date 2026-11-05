# Báo cáo Talesworn phiên E — phông chữ theo chủ đề cổ tích châu Âu (05/11/2026)

Chủ game: *"Cả font chữ cũng nên theo chủ đề của game, để chỉnh sửa."*

## Tóm tắt (đọc phần này là đủ)

- **Đã đổi phông toàn game** sang bộ ba phông mang không khí "sách truyện cổ châu Âu", cả ba đều giấy phép tự do **SIL OFL 1.1**:

  | Vai | Phông | Dùng ở đâu | Dấu tiếng Việt |
  |---|---|---|---|
  | **Tiêu đề** | **Grenze Gotisch** (chữ gô-tích kiểu sách cổ) | logo TALESWORN + dòng THE UNWRITTEN TALES, tiêu đề mọi bảng (Lò rèn, Qua ải…), tên trùm trên thanh máu, tên người nói trong hộp thoại, tên chương / tên trùm trong truyện, tiêu đề "Bản đồ ải", dòng tên ải ở bản đồ vùng | **Đủ** (kiểm bằng máy 178/178 chữ) |
  | **Thân chữ** | **Alegreya Sans** (chữ sách nhân văn, rõ ở cỡ nhỏ) | nút, hộp thoại, HUD, bảng, mọi chữ còn lại; cả khung HTML đăng nhập / lưu mây | **Đủ** (178/178) |
  | **Số** | **Silkscreen** (chữ điểm ảnh) | số sát thương, số chí mạng, số tầng hiệu ứng trên quái | **Không có** → chỉ dùng cho chuỗi toàn số (xem quy tắc rơi) |

- **Nhúng sẵn trong game** (không cần mạng, không phụ thuộc Google): 4 tệp phông đã thu gọn chỉ còn ký tự game cần, tổng **48,5 KB**. Game chờ phông nạp xong (tối đa **2,5 giây**, thực tế vài mili giây vì phông nằm sẵn trong trang) rồi mới vẽ khung hình đầu.
- **Chữ vẫn nằm giữa khung**: hàm căn chữ theo phông thật (phiên chu-giua-font-that) nay **đo theo đúng phông của từng vai** (tiêu đề / thân). Soát tự động 42 màn × tiếng Việt / tiếng Anh: **không màn nào hỏng**, số chữ tràn / lệch thật **giảm** so với trước (bảng ở dưới). Còn vài chỗ lệch 0,5–0,6 điểm (dưới 1 điểm ảnh trên iPhone) ghi ở mục "Chỗ còn lại".
- **Cờ quay lui `?phongcu=1`**: không nạp phông mới, mọi chữ về **Be Vietnam Pro y như trước phiên** (đã so 1 064 chữ tiếng Việt + 1 085 chữ tiếng Anh với bản trước phiên: vị trí và cỡ trùng khít, chỉ khác chữ đổi theo giờ như "Ngày mới sau…", số phiên bản).
- **Dung lượng** (sau khi gộp với phiên D đẩy lên cùng lúc): bản một tệp **27,00 / 30 MB** (phần phông +70 KB); web người chơi tải đầu **19,52 / 20 MB** (phần phông +≈0,05 MB nén), trang chính nén 0,99 / 1,50 MB.
- Không đổi luật chơi / cân bằng. Không đụng đăng nhập Google, lưu mây, `?cloud=0` (chỉ đổi họ phông chữ của khung HTML), không đụng bản lưu. Không đụng `js/slice.js`, ảnh Rowan, khung HUD `?hudmoi=1` (phần của phiên D).

## 1. Chọn phông — bảng mẫu các phương án

Mỗi ứng viên lấy từ kho github.com/google/fonts (sparse clone; tất cả OFL). Bảng mẫu vẽ bằng canvas trong Chromium **ở cỡ thật trong game,
nhìn như trên iPhone cầm ngang** (1 điểm game = 1,444 điểm màn × DPR 3), mỗi phông 4 dòng: "TALESWORN — Chapter I: Thornwood",
"Rowan · Forge · Toadstool King", "Rừng Gai · Lò rèn · Vua Nấm · Luyện lên 5", "1234567890". Dòng tiếng Việt **tô đỏ** = phông thiếu dấu
(trình duyệt phải mượn ký tự từ phông khác → chữ lẫn hai kiểu).

- Tiêu đề (cỡ 14): [`anh/bang-mau-tieu-de.png`](anh/bang-mau-tieu-de.png) — Jacquard 12, Jacquard 24, Jacquarda Bastarda 9, Grenze Gotisch, Texturina, Pirata One, Cinzel Decorative, Alegreya SC, Cormorant SC, Uncial Antiqua, MedievalSharp, Pixelify Sans, Be Vietnam Pro (hiện tại).
- Thân chữ (cỡ 8): [`anh/bang-mau-than-chu.png`](anh/bang-mau-than-chu.png) — Pixelify Sans, Alegreya Sans, Grenze, Jersey 10, Jersey 15, Tiny5, VT323, Handjet, Be Vietnam Pro.
- Số (cỡ 13): [`anh/bang-mau-so.png`](anh/bang-mau-so.png) — Silkscreen, Pixelify Sans, Jersey 10, Tiny5, VT323, Handjet, Be Vietnam Pro.

**Kiểm dấu tiếng Việt bằng máy** (đọc bảng ký tự của từng tệp phông; 178 chữ = a…ỵ thường + hoa, đủ ă â đ ê ô ơ ư và 5 dấu thanh):

| Đủ 178/178 | Thiếu (số chữ có) |
|---|---|
| Grenze Gotisch, Grenze, Texturina, Alegreya Sans, Alegreya SC, Alegreya Sans SC, Cormorant SC, Tiny5, VT323, Handjet, Be Vietnam Pro | Jacquard 12 / 24 / Jacquarda Bastarda 9 (82), Jersey 10 / 15 / 20 (82), Micro 5, Bytesized (82), Pixelify Sans (86), Uncial Antiqua (86), MedievalSharp (84), Pirata One (90), Cinzel / Cinzel Decorative (82), Silkscreen (76), Press Start 2P (84), Almendra, Macondo (78) |

**Vì sao chọn bộ này**
- **Grenze Gotisch** (tiêu đề): chất gô-tích sách cổ rõ nhất trong các phông **đủ dấu tiếng Việt** — một phông cho cả hai thứ tiếng, không phải trộn. Chữ hoa vẫn đọc được ("TALESWORN" rõ ràng), trong khi Jacquard 12 (tư vấn mục 6.3 đề xuất) đẹp nhưng chữ hoa gô-tích điểm ảnh rất khó đọc (T, W, N gần như ký hiệu) và thiếu 96 chữ có dấu → bản tiếng Việt sẽ phải dùng phông khác hẳn kiểu. Texturina / Cormorant SC đủ dấu nhưng nhạt, ít chất truyện cổ.
- **Alegreya Sans** (thân): dáng chữ sách nhân văn (hợp "Cuốn Sách Lớn"), **hẹp hơn Be Vietnam Pro** nên ít tràn khung, đủ dấu, rõ ở cỡ nhỏ. Các phông điểm ảnh (Pixelify Sans, Jersey — tư vấn 4.6 đề xuất) thiếu dấu tiếng Việt; Tiny5 / VT323 / Handjet đủ dấu nhưng đọc đoạn dài mỏi mắt.
- **Silkscreen** (số): số điểm ảnh to, vuông, rất rõ khi bay trên đầu quái — đúng tư vấn 4.6. Pixelify Sans có số 5 giống chữ S, số 4 lạ.

## 2. Quy tắc rơi phông tiếng Việt

1. **Tiêu đề, thân chữ**: Grenze Gotisch và Alegreya Sans **đủ mọi chữ tiếng Việt** → không bao giờ phải rơi phông với chữ Việt / Anh.
2. **Số (Silkscreen)**: chỉ dùng khi **cả chuỗi** là số + ký hiệu (`0–9 + - − × % ! . , : / ( ) #` và khoảng trắng), ví dụ `1452!`, `-12`, `x3`.
   Chuỗi **có chữ cái** (ví dụ "Sạch bóng quái!", "+3 Lửa", "All clear!") → **cả chuỗi** dùng phông thân **Alegreya Sans đậm** — không trộn hai phông trong một chuỗi.
3. Ký hiệu không có trong phông chủ đề (★ ✕ ▶ ✓ ⚔ …) → trình duyệt tự lấy đúng ký tự đó theo thứ tự: Alegreya Sans → Be Vietnam Pro → phông máy.
4. Trình duyệt không nhận phông nhúng (rất cũ, không có `FontFace`) → tự về Be Vietnam Pro như trước.

## 3. Đã làm

- `game/js/phong.js` (mới): nạp 4 phông từ dữ liệu nhúng (`FontFace` + `document.fonts`), ba vai `td` / `than` / `so`, mỗi vai một hệ số cỡ để
  **chiều cao chữ thường bằng Be Vietnam Pro cũ** (tiêu đề ×1,15, thân ×1,12, số ×1) → bố cục giữ như cũ. Thay `ui.font` (mọi chữ canvas đi qua đây).
  `?phongcu=1` → không làm gì (G.phong = null).
- `game/js/phong_data.js` (tự sinh): 4 tệp woff2 dạng base64. Tệp phông + giấy phép ở `game/art/phong/` (`OFL-*.txt`).
- `tools/phong/thu_gon.py`: từ bản gốc google/fonts → cố định nét 700 (Grenze Gotisch là phông biến thiên), **đổi số kiểu cũ (0 1 2 thấp như chữ thường) thành số thẳng hàng** (Alegreya Sans, Grenze Gotisch mặc định dùng số kiểu cũ; canvas không bật được tính năng phông nên đổi ngay trong tệp), chỉ giữ ký tự game cần (Latin, Latin-1, đủ chữ Việt, dấu câu, mũi tên, ≤ ≥ ≈ ≠ − ₫). `tools/phong/dung_phong.py`: woff2 → `phong_data.js`.
- `game/js/main.js`: chờ phông chủ đề tối đa 2,5 giây (`?phongcu=1`: chờ Be Vietnam Pro của Google như cũ, 1,2 giây).
- `game/js/ui_theme.js` (hàm đặt chữ chung): đo hộp mực bằng **đúng phông + hệ số của vai đang vẽ**; `T.datChu` / `T.chuTrongKhung` / `ui.text` nhận `vai: 'td'`;
  tiêu đề bảng, tên trùm, thẻ tên hộp thoại dùng phông tiêu đề (thẻ tên rộng theo mực thật vì nét gô-tích vươn ra ngoài bước chữ).
  **Sửa kèm**: tiếng Việt nay đo chữ **sau lớp tên mới** (vd. "Cô Thợ May" → vẽ "Cô Odile") — trước đây game đo tên cũ rồi vẽ tên mới nên thẻ tên / lời thoại bị lệch, tràn (ví dụ thẻ "Cô Odile", lời Anh Tom ở Cổng làng). Chỉ áp dụng khi dùng phông mới.
- `game/js/fx.js` (số sát thương), `game/js/fx_he_moi.js` (số tầng hiệu ứng), `game/js/btn_art.js` (nhãn nút trận): chọn phông theo vai.
- `game/js/village.js` (logo TALESWORN + dòng tên ải ở bản đồ vùng), `game/js/truyen.js` (tên chương, tên trùm trong truyện), `game/js/minimap.js` (tiêu đề "Bản đồ ải"): thêm `vai: 'td'`.
- `game/index.html`: nạp `js/phong_data.js`, `js/phong.js` ngay sau `js/engine.js`. Thẻ Google Fonts Be Vietnam Pro **giữ nguyên** (dùng cho `?phongcu=1` và làm phông dự phòng ký hiệu). `build.py` không cần đổi: phông đi theo mã JS nên tự có trong cả bản một tệp lẫn bản web.
- `game/dist/*` dựng lại (`python3 game/build.py` + `LK_ANH_ROI=1 python3 game/build.py --hai-tep`).

## 4. Soát chữ (ảnh headless, không chơi thử)

Công cụ `cong-cu/soat-phong.py` (chép từ công cụ phiên chu-giua-font-that): mở bản một tệp trong Chromium không màn hình 844×390, dựng từng màn
bằng bản lưu thử, đo **mọi chữ trong khung** (hộp mực quét điểm ảnh): tràn khung, lệch tâm > 0,5 điểm, chạm viền, cắt "…", đè nhau. "TRƯỚC" = `?phongcu=1`
với **Be Vietnam Pro thật** (tệp `docs/fonts/be-vietnam-pro` phục vụ thay Google Fonts). 42 màn: màn đầu, làng, mọi bảng người làng (Lò rèn 4 thẻ
gồm Luyện, Hàng xén, Thợ may, Cụ Đồ, Ông Từ, sổ yêu quái, thành tựu, việc hôm nay, cài đặt…), hành trang, trận (HUD, số sát thương), trùm, tạm dừng, bản đồ, phúc lành, thắng / thua, truyện.

| | Chữ soát | tràn | lệch ngang | lệch dọc | chạm viền | cắt "…" | đè chữ |
|---|---|---|---|---|---|---|---|
| Tiếng Việt TRƯỚC | 1 065 | 23 | 12 | 27 | 32 | 6 | 24 |
| Tiếng Việt SAU | 1 055 | 19 (8 giả*) | 14 | 35 | 24 | 1 | 8 |
| Tiếng Anh TRƯỚC | 1 085 | 18 | 6 | 27 | 20 | 4 | 0 |
| Tiếng Anh SAU | 1 066 | 17 (8 giả*) | 8 | 31 | 17 | 1 | 0 |

(Số "trước" phần lớn là chỗ cố ý / có sẵn từ các phiên trước — dải nút làng, tiêu đề bản đồ ải… — xem báo cáo chu-giua-font-that.)
\* 8 "tràn" ở Hành trang (các số `0%`, `+8%`, `100%` căn phải trong ô chỉ số) là **giả**: chữ cao hơn nên phần trên chạm vùng góc bo của ô, công cụ thu hẹp lòng ô; nhìn ảnh thấy số nằm gọn trong ô.

**Đã hết** nhờ phiên này (có ở TRƯỚC, không còn ở SAU): tràn "Đầm Sương ›", "Hạ Phù Thuỷ Cáo để mở (bán)", "Cần hạ Phù Thuỷ Cáo" (×2), lời Ông Ambrose, lời Anh Tom ở Cổng làng, bảng vàng; tiếng Anh "Rowan / Book / Achievements" (thẻ Ông Từ, 3 màn); 6 chữ đè nhau ở Cụ Đồ (Vệt cháy, Lây độc, Xuyên băng, Đóng băng); cắt "…" ở "Xuyên bă…", "Big Bl…", "Normal · 75, 2 forge mate…"; nhiều chữ chạm viền.

**Chỗ còn lại (mới, đều nhỏ hơn 1 điểm ảnh iPhone, chữ vẫn trong khung)**:
- Bảng vàng: 5 ô tiêu đề cột ("Sức mạnh", "Xa nhất", "Hang Chìm 2", "★ 13"…) thấp hơn tâm 0,58 điểm — chữ đặt cố định ở nơi gọi, phông mới cao hơn chút.
- Dấu "+" ở ô cây chưởng và "✓ Đang dùng": lệch ngang 0,54–0,55 (hai ký hiệu này lấy từ phông dự phòng).
- "Ăn mòn" (Cụ Đồ) lệch dọc 0,51; "Kiếm tập sự", "Gốc sồi: …", "Đổi danh hiệu", "Ải ngày", 2 dòng việc hôm nay (EN) sát viền 0,0–0,2 nhưng không ra ngoài.

**Ảnh trước / sau** (844×390 phóng ×2; trên = TRƯỚC Be Vietnam Pro, dưới = SAU), mỗi màn tiếng Việt + tiếng Anh:
- Màn đầu (logo TALESWORN): `anh/truoc-sau-chao-vi.jpg`, `anh/truoc-sau-chao-en.jpg`
- Làng: `anh/truoc-sau-lang-{vi,en}.jpg`
- Lò rèn › Luyện: `anh/truoc-sau-lo-ren-mai-{vi,en}.jpg`
- Trận (HUD + số sát thương 37 / 128 / 1452! / 9 + chữ nổi "Sạch bóng quái!"): `anh/truoc-sau-tran-so-{vi,en}.jpg`
- Trùm (tên trùm trên thanh máu): `anh/truoc-sau-trum-ten-{vi,en}.jpg`
- Truyện (tên chương + tên 3 trùm): `anh/truoc-sau-truyen-{vi,en}.jpg`
- Bảng kết quả (qua ải): `anh/truoc-sau-thang-{vi,en}.jpg`
- Cài đặt (Cổng làng, có hộp thoại Anh Tom): `anh/truoc-sau-cai-dat-{vi,en}.jpg`
- Thêm: Hành trang `anh/truoc-sau-hanh-trang-{vi,en}.jpg`, Cụ Đồ `anh/truoc-sau-cu-do-{vi,en}.jpg`

Không có lỗi trang (0 lỗi JavaScript) ở cả 4 lượt chạy.

## 5. Giấy phép

Cả ba phông: **SIL Open Font License 1.1** — được dùng, nhúng, sửa (thu gọn), phân phối kèm game, kể cả game có thu phí; không được bán riêng tệp phông.
Đã kèm thông báo giấy phép ở `game/art/phong/OFL-grenze-gotisch.txt`, `OFL-alegreya-sans.txt`, `OFL-silkscreen.txt` (bản quyền: The Grenze Gotisch Project Authors / Omnibus-Type; The Alegreya Sans Project Authors / Huerta Tipográfica; The Silkscreen Project Authors / Jason Kottke). Bản thu gọn vẫn giữ tên gốc trong tệp phông (OFL chỉ cấm dùng "Reserved Font Name" khi đổi tên; các phông này không khai tên dành riêng). Nên ghi một dòng "Fonts: Grenze Gotisch, Alegreya Sans, Silkscreen — SIL OFL 1.1" ở màn giới thiệu / cửa hàng ứng dụng khi phát hành.

## 6. Dung lượng thêm

| | Trước | Sau |
|---|---|---|
| 4 tệp phông woff2 (thu gọn) | — | 48,5 KB (Grenze Gotisch 15 KB, Alegreya Sans 500 + 700: 16 + 16 KB, Silkscreen 2 KB) |
| Bản một tệp `dist/linh-khi.html` | 26,84 MB | 26,91 MB (+70 KB); **27,00 / 30 MB** sau khi gộp phiên D |
| Web: người chơi tải đầu | ≈19,43 MB | 19,48 MB (+≈0,05 MB nén); **19,52 / 20 MB** sau khi gộp phiên D |
| Web: trang chính nén | ≈0,93 MB | 0,98 MB; **0,99 / 1,50 MB** sau khi gộp |

## 7. Cờ

| Cờ | Tác dụng |
|---|---|
| `?phongcu=1` | Về Be Vietnam Pro như trước phiên (không nạp phông mới; vị trí, cỡ chữ trùng bản trước phiên) |

Các cờ cũ (`?chufont=0`, `?lang=en|vi`, `?ten=cu`, `?mandau=cu`, `?cloud=0`…) vẫn chạy như trước.

## 8. Chủ game muốn chỉnh

- Đổi phông một vai: thay tệp ở `game/art/phong/`, sửa tên tệp trong `tools/phong/dung_phong.py`, chạy `python3 tools/phong/dung_phong.py`, dựng lại game.
- To / nhỏ cả loạt chữ: hệ số `K` trong `game/js/phong.js` (tiêu đề 1,15 · thân 1,12 · số 1). Hàm căn chữ tự đo lại.
- Muốn logo chữ điểm ảnh kiểu Jacquard 12 cho bản tiếng Anh: làm logo vẽ tay (tư vấn 6.3) thay vì phông — phông Jacquard thiếu dấu tiếng Việt.

## Kiểm

- `node --check` mọi `game/js/*.js`: đạt. `python3 game/build.py`: đạt (27,00 / 30 MB sau khi gộp phiên D). `LK_ANH_ROI=1 python3 game/build.py --hai-tep`: đạt (19,52 / 20 MB, trang nén 0,99 / 1,50 MB).
- Sau khi gộp phiên D (git pull --rebase, dist dựng lại): soát lại 12 màn VI / EN (màn đầu, làng, Lò rèn, trận + số sát thương, trùm, truyện, kết quả, cài đặt, hành trang, Cụ Đồ, Thợ may) — y như trước khi gộp, 0 lỗi trang.
- Soát ảnh headless 42 màn × VI / EN × TRƯỚC / SAU (bảng trên); `?phongcu=1` so với bản trước phiên: 1 050 / 1 064 (VI), 1 077 / 1 085 (EN) chữ trùng vị trí + cỡ, phần còn lại là chữ đổi theo giờ.
- Không chơi thử, không chạy bộ test (theo yêu cầu).

## Commit

Tên commit: "Talesworn phiên E: phông chủ đề cổ tích (Grenze Gotisch tiêu đề, Alegreya Sans thân chữ, Silkscreen số) nhúng sẵn, căn chữ đo theo phông mới; ?phongcu=1 quay lui + dựng lại dist"
