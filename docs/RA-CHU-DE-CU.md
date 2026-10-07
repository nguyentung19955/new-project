# Rà chủ đề cũ Sơn Tinh – Thủy Tinh (phiên bản 159)

Game ban đầu chỉ có truyện Sơn Tinh – Thủy Tinh (giữ thành Phong Châu trước nước lũ). Nay có 5 chương
(Sơn Tinh – Thủy Tinh ải 1–8 · Thạch Sanh 9–11 · Thánh Gióng 12–13 · Lạc Long Quân 14–15 · An Dương Vương 16–17),
Vô tận và chơi nhóm. Bảng dưới liệt kê mọi chỗ người chơi còn thấy chữ / hình gắn cứng chủ đề cũ và cách đã sửa.

Ảnh trước / sau: `docs/ra-chu-de-cu-truoc-sau.png`.

## Cách làm chung

- Bảng **`CH_THEME`** (js/chapters.js) theo mã chương: chữ nhãn đầu, mục tiêu ải, tên quân địch, tựa / nhãn màn thua – thắng,
  biểu tượng, hiện tượng trong tranh (`water` nước lũ, `mist` sương yêu, `fire` lửa giặc, `wave` sóng biển), cổng vẽ trong tranh,
  màu thanh tiến độ, lời ban thưởng. `themeOf(ải, vôTận)` trả chủ đề; **Vô tận** dùng chữ trung tính (`ENDLESS_THEME`), tranh theo bản đồ của ải.
- Tranh thắng / thua: có file `assets/scenes/thang-<chương>.png` / `thua-<chương>.png` thì dùng ảnh; chưa có thì Sơn Tinh dùng tranh cũ
  (art.js), chương khác dựng SVG `resultScene()` từ nền truyện + boss cuối ải / tướng mở chương.

| Chỗ cũ | Ở đâu | Cách sửa |
|---|---|---|
| Màn thua mọi ải: "💧 Phong Châu thất thủ", nhãn tranh "NƯỚC NGẬP THÀNH", tranh thành ngập + rắn nước, số đợt / thanh tiến độ xanh nước, khung mẹo viền xanh | ui.js `finishLevel` | Theo chương: Sơn Tinh giữ nguyên; Thạch Sanh "👹 Yêu quái tràn vào làng / MIẾU THẤT THỦ"; Gióng "🔥 Giặc Ân chiếm làng Phù Đổng / LỬA GIẶC CHÁY LÀNG"; Lạc Long Quân "🌊 Yêu tinh biển hoành hành / SÓNG DỮ TRÀN BỜ"; An Dương Vương "🏹 Cổ Loa thất thủ / GIẶC TRIỆU VÀO THÀNH"; Vô tận "♾ Thành đã thất thủ". Màu thanh, số đợt, viền tranh, khung mẹo theo chương. Tựa dài tự thu chữ (`.res-title.long`) |
| Màn thắng: nhãn tranh "NƯỚC RÚT", tranh núi Tản Viên | ui.js `finishLevel` | "YÊU QUÁI TAN / GIẶC ÂN TAN / BIỂN LẶNG / NỎ THẦN GIỮ THÀNH"; tranh tướng mở chương dưới mặt trời trống đồng |
| Nhãn đầu "Thành đã mất" / "✓ Đã giữ thành" | ui.js `finishLevel` | "Làng đã mất / Bờ biển đã mất / Thành đã mất", "Đã giữ làng / biển / thành"; Vô tận "Hết lượt trụ" |
| Vô tận: đầu ghi "Ải 5", "Dừng ở đợt 47/35", thanh tràn 134% | ui.js `finishLevel` | "♾ Vô tận · tên ải", "Trụ được 47 đợt", thanh so với kỷ lục vô tận |
| Mẹo 2 luôn "đợt Chim Bão (quái bay)" | ui.js `finishLevel` | Quái bay của bộ quân ải (Dơi Hang, Chim Bão…); chương không có quái bay (Gióng, An Dương Vương) → "chặn Voi Chiến ở đợt quái khỏe"; Vô tận → quân đổi chương mỗi 10 đợt |
| Nút ải cuối "Năm nào cũng dâng nước ›" + nút "Chơi vô tận" trùng | ui.js `finishLevel` | "♾ Chơi vô tận ›", bỏ nút trùng |
| Lời nhắc vào vô tận "Năm nào cũng dâng nước: …" | ui.js `action('endless')` | "♾ Vô tận: quái mạnh dần, boss mỗi 10 đợt, quân địch đổi chương mỗi 10 đợt" |
| Lời nhắc đầu trận "giữ thành Phong Châu qua N đợt" | ui.js `startLevel` | `themeOf(ải).goal`: giữ miếu và bản làng / làng Phù Đổng / miền sông biển / thành Cổ Loa |
| Hướng dẫn người mới "Bấm ▶ để quân Thủy Tinh tràn tới" | ui.js coach | "… để yêu tinh rừng / giặc Ân / yêu tinh biển / quân Triệu Đà tràn tới" |
| Màn hạ boss "Chọn sính lễ · Vua Hùng ban thưởng" | ui.js `showReward` | Sơn Tinh giữ nguyên; chương khác "Chọn phần thưởng · Dân làng tạ ơn / Vua Hùng ban thưởng (Gióng, đời Hùng Vương thứ sáu) / Long Cung ban thưởng / An Dương Vương ban thưởng". Nhãn "SÍNH LỄ" trên thẻ đồ giữ (tên loại đồ) |
| Thông báo "Hoàn thành đợt … · núi cao +N vàng", "Núi cao che thành: +1 mạng" | game.js `growMountain` / hết đợt | Chương Sơn Tinh giữ; chương khác / Vô tận "giữ vững +N vàng", "Thành vững thêm: +1 mạng". **Số không đổi** |
| Ảnh thành Phong Châu `ban-do_phong-chau.png` vẽ ở góc phải mọi bản đồ (khi có file) | main.js vẽ nền | Chỉ ải chương Sơn Tinh |
| Ảnh nền sông Đà `nen_ai-N.png`: ải 9–17 rơi về `nen_ai-1` (khi có file) | main.js vẽ nền | Chỉ ải 1–8 |
| Lịch đợt (Bách khoa): vạch xanh + chú thích "Nước dâng", "Rùa khổng lồ" | ui.js bestiary | Bỏ vạch "Nước dâng" (cơ chế tắt từ v36); chú thích quái khỏe = tên quái khỏe của bộ quân ải (Rùa / Thạch Tinh / Voi Chiến / Cua…) |
| Boss Thủy Tinh "… làm ngập tạm 3 ô trong 8 giây" | data.js | Bỏ câu (ngập tạm đã tắt từ v36) |
| Cài đặt "Không hiện màn Vua Hùng kén rể trước trận" | ui.js settings | "Không hiện truyện mở đầu chương trước trận" (áp mọi chương) |
| Chân menu "Phong Châu Thành • Đông Sơn Fantasy" | index.html | "Văn Lang – Âu Lạc • Đông Sơn Fantasy" |
| README "chủ đề Sơn Tinh – Thủy Tinh … chặn quân Thủy Tinh tràn vào thành Phong Châu", "Nước Dâng & Mọc Núi" | README.md | Mô tả 5 chương + Vô tận; ghi Nước Dâng & Mọc Núi đã bỏ từ v36 |

## Cơ chế nước dâng / ngập ô / Mọc Núi — quyết định

- Kiểm tra code: `game.rise()` `return` ngay (v36), `isFlooded()` luôn `false`, `tempFloodSpots()` `return`, nút `#btn-moc` luôn ẩn,
  `#tb-water` ẩn, `game.water` luôn 0 nên `drawWaterLevel` không vẽ. Cơ chế **đã tắt cho mọi chương** từ phiên bản 36.
- Phương án chọn: **giữ tắt, không bật lại** cho chương nào (bật lại cho Sơn Tinh / Lạc Long Quân sẽ đổi cân bằng các ải đã chỉnh bằng bot từ v49–v136).
  Chỉ dọn chữ người chơi còn thấy (bảng trên). Code chết (`rise`, `floodSoon`, `raised`, lời Thủy Tinh khi `flood`, ô "Thủy Tinh dâng nước" ở màn sính lễ
  với `flood = false`) giữ nguyên vì không hiện ra; nếu sau này bật lại thì nên chỉ bật ở ải có `MAP_THEMES[...].water` (song, dam, bien).
- Không đổi tên / số: tướng & kỹ năng gốc Sơn Tinh (Đá Lăn Phong Châu, Tản Viên…), sính lễ voi chín ngà / gà chín cựa / ngựa chín hồng mao
  (đồ của boss chương Sơn Tinh), lời thoại Thủy Tinh (chỉ nói khi boss Thủy Tinh xuất hiện), truyện mở đầu "Vua Hùng kén rể" (chỉ chương Sơn Tinh),
  màn Núi Tản Viên (đã bỏ khỏi trận từ v92, không mở được).

## Phần 2 — prompt khung / nút / tranh giao diện (nhóm 14–17 trong docs/PROMPT_GEMINI_FULL.md)

Không gồm icon nhỏ chỉ số / trạng thái / tiền tệ (nhánh `claude/icon-nho`), ô đặt tướng, đường quái (nhánh khác).

| Nhóm | File | Cắt / đặt | Gắn vào game (chưa có file → giữ hình cũ) |
|---|---|---|---|
| 14 · Tranh kết quả (10) | `scenes/thang-<chương>.png`, `scenes/thua-<chương>.png` (768×832) | đặt thẳng vào `assets/scenes/` | `resultImg()` ở màn thắng / thua; tải sẵn khi vào ải |
| 15 · Nền bản đồ chọn ải (5) | `scenes/chuong-<chương>.png` (1280×768) | đặt thẳng | `<img class="cp-bgimg">` trên nền SVG, lỗi tải thì tự gỡ |
| 16 · Nền màn phụ (1) | `scenes/nen-man-phu.png` | đặt thẳng | `html.sk-nen-man-phu` → nền màn Chuẩn bị / Kết quả / Phần thưởng |
| 17 · `khung-bang` | `ui/khung-bang.png` | `python3 tools/cat-khung.py <ảnh> khung-bang` | border-image 9 mảnh cho khung mẹo / bảng kết quả, bảng Nghỉ chân, thẻ phần thưởng |
| 17 · `nut-chu-nhat` | `ui/nut-vang-{thuong,nhan,khoa}.png`, `ui/nut-dong-…` | `cat-khung.py … nut-chu-nhat` | `.btn-gold` (thường / :active / :disabled); nút đồng ở thanh kết quả + Nghỉ chân |
| 17 · `nut-tron` | `ui/nut-tron-{thuong,nhan,khoa}.png` | `cat-khung.py … nut-tron` | nút tròn quay lại / đóng `.xbtn` |
| 17 · `thanh-mau` | `ui/thanh-mau-{boss,tuong,quai}.png` | `cat-khung.py … thanh-mau` | khung thanh máu boss (#bossbar), tướng và quái trên canvas |
| 17 · `khung-thanh-day` | `ui/khung-thanh-day.png` | `cat-khung.py … khung-thanh-day` | thanh đáy chợ tướng `#deck` |
| 17 · `khung-the-cho` | `ui/the-cho-{thuong,ghep,thieu}.png`, `ui/nut-doi-cho.png` | `cat-khung.py … khung-the-cho` | khung thẻ chợ tướng (thường / ghép được / thiếu vàng), nút ↻ |
| 17 · `dai-thong-bao` | `ui/dai-thong-bao.png` | `cat-khung.py … dai-thong-bao` | dải lụa sau chữ lớn giữa màn (tên chiêu tối thượng, Kim Quy Hộ Thành…) |
| 17 · `huy-hieu-ai` | `ui/ai-{mo,chon,khoa}.png` | `cat-khung.py … huy-hieu-ai` | huy hiệu ải trên bản đồ chọn ải |

Prompt đã có file thì `node tools/build-prompts.js` tự ẩn. Cơ chế: `loadUiSkins()` (ui.js) thử tải từng file, có thì gắn biến CSS `--sk-<tên>`
và lớp `sk-<nhóm>` lên `<html>`; các luật `html.sk-…` cuối css/style.css mới dùng ảnh.
