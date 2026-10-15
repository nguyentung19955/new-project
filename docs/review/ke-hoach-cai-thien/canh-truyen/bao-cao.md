# Báo cáo: Cảnh truyện bằng ảnh + lời truyện theo mạch trống đồng (15/10/2026)

Làm theo `YEU-CAU.md` và `docs/cot-truyen/CHUNG.md`. **Không chạy/test game**: chỉ `node --check` mọi tệp JS, `build.py` (một tệp và `--hai-tep`), và ảnh soát tĩnh `xem-truyen.png`.

## 1. Ảnh vào game (tải lười)

| Ảnh gốc (docs/anh-goc/truyen) | Khoá nền trong `js/truyen.js` | Trang |
|---|---|---|
| b1-trong-vo-cay-da-ua | `cayda` | Mở đầu 1 "Trống đồng vỡ" |
| b2-ba-yeu-tinh | `yeu` | Mở đầu 2 "Ba yêu tinh" |
| b2b-bong-duoi-song | `song` (**MỚI**) | Mở đầu 3 "Bóng dưới sông" (sau `yeu`) |
| b3-ba-ban-bi-bat | `emBe` | Mở đầu 4 "Bị bắt" |
| b4-trao-vu-khi | `cuti` | Mở đầu 5 "Lên đường" |
| b5-hoi-lang | `hoi` | Đoạn kết 1–2 |
| b6-nen-lang | `lang` | 9 trang kết vùng (và mọi trang nền làng) |

- Không đưa vào game: `b2b-bong-duoi-song-v2.png` (dự phòng), `hac-long-tao-hinh.png` (chỉ lưu).
- B4/B5: lúc bắt đầu chưa có ảnh, đã làm sẵn chỗ (bảng `ANH` có sẵn khoá `cuti`/`hoi`, thiếu tệp thì vẽ nền code). Trong phiên, ảnh gốc B4/B5
  được đẩy lên (commit c4b4761b) → chỉ chạy `tools/anh-truyen/dung.py` là vào game, không sửa code (đúng cách "thả tệp vào").
- Cỡ: **960×540** (= số điểm ảnh thật của canvas thế giới khi Độ nét Cao, 480×270 × G.NET 2), WebP quality 80 + **JPEG dự phòng** quality 80.
  Dựng: `python3 tools/anh-truyen/dung.py` → `game/art/truyen/<tên>.webp|jpg`.
- **Tải lười**: `TR.choi` mới bắt đầu tải ảnh của các trang sắp chiếu; màn chào / làng / ải không tải ảnh truyện.
  - Bản ảnh rời (web): `build.py` chép sang `dist/anh/truyen-<tên>.<mã nội dung>.webp|jpg` (workflow đã chép cả `dist/anh/`, không phải sửa workflow),
    khai `G.TRUYEN_ANH` (chỉ đường dẫn) trong trang. WebP trước, lỗi thì JPEG, lỗi nữa thì nền code.
  - Bản một tệp (`linh-khi.html`, `artifact.html`): nhúng bản WebP dạng `data:` (không có JPEG dự phòng trong bản này — trình duyệt không đọc WebP thì nền code).
  - Chạy thẳng `game/index.html`: qua http thì tải `art/truyen/`; mở bằng `file://` (các bài kiểm) thì KHÔNG dùng ảnh (tránh làm bẩn canvas / báo lỗi tải) → nền code như cũ.
  - Cách 2 tệp Đợt 10 (`LK_ANH_ROI=0`): `G.TRUYEN_ANH = {}` → nền code.
  - `sprite_custom.js` (donBanCuRoi) giữ ảnh truyện khi dọn bộ nhớ đệm ảnh bản cũ; `web/sw.js` lưu đệm cả `.jpg` có mã nội dung như `.webp/.png`.
- Hiệu ứng: **Ken Burns** phóng 1,02 → 1,07 trong thời gian khung + trượt ngang chậm (khung chẵn sang phải, lẻ sang trái), ảnh về giữa khung thì hiện dần 0,5 giây
  đè lên nền code. Chữ trên **dải tối** dưới ảnh (+ dải mờ mỏng trên cùng cho chấm tiến độ / tiêu đề / nút Bỏ qua). Trang kết vùng có người nói: người làng vẫn đứng to bên trái trên ảnh làng.
- **Chữ không lệch khung**: phiên chu-lech-khung chưa có hàm chung (chưa có `T.chuTrongKhung` trong code) → dải chữ tự đo: lề 20, rộng 440 (trong 480), đáy 265;
  đo bằng chính `ui.wrap` (tự dịch EN) cùng cỡ chữ sẽ vẽ; quá 3 dòng thì thu cỡ 9,5 → 8 trước khi thêm dòng; dải cao theo số dòng. Khi phiên kia có hàm chung có thể thay `boChu/veDai`.

### Dung lượng người chơi tải (build.py --hai-tep)

| | Trước | Sau |
|---|---|---|
| Người chơi tải (tải đầu + mọi vùng, thước đo chính, trần 20 MB) | 15,44 MB | **15,44 MB** (ảnh truyện không vào gói tải đầu) |
| Tải trước khi vào vùng đầu | 4,85 MB | 4,85 MB |
| Ảnh truyện (chỉ khi mở truyện) | — | 7 ảnh **0,89 MB** WebP (JPEG dự phòng 0,95 MB) → xem hết truyện: 16,33 MB / 20 MB |
| Bản một tệp (trần 30 MB) | ≈ 26,2 MB | **27,40 MB** (nhúng 7 WebP, +1,2 MB) — dưới trần nên giữ ảnh trong bản một tệp |

("Trước" đo trên cùng nền sau khi rebase lên commit con-ve-tay đợt 3 — phiên đó thêm 10 ảnh hiệu ứng; lần đo đầu phiên là 15,34 MB / 26,04 MB.)

## 2. Lời truyện (VI + EN)

Câu ngắn, giọng kể cho trẻ con như cũ. Bản cũ giữ nguyên trong code (`MO_DAU_CU`, `VUNG_CU`, `KET_CU`) cho cờ `?truyencu=1`.

- Mở đầu (5 khung):
  1. Làng ven sông có cây đa nghìn tuổi và một trống đồng thiêng trấn yêu. Một đêm, trống bị đập vỡ. Lá đa úa vàng, linh khí cạn dần.
  2. Mất tiếng trống, ba yêu tinh thức dậy: Mộc Tinh ở Rừng già, Ngư Tinh ở Hang biển, Hồ Tinh ở Lâu đài cổ. Mỗi đứa ôm một mảnh trống vỡ.
  3. (mới, b2b) Dưới đáy sông có một cái bóng dài. Chính nó đập vỡ trống, hút linh khí cây đa qua rễ, rồi đánh thức yêu tinh để làng không để ý.
  4. Cu Tèo, Cái Bống, Cu Lì, ba bạn thân của Cu Tí, đi nhặt mảnh trống cho làng rồi bị yêu tinh bắt mất.
  5. (Cụ Đồ) … Cứu bạn, lấy lại mảnh trống. Chú Lái Đò chờ ở bến!
  - Chưa gọi tên Thuồng Luồng ở mở đầu (chỉ "cái bóng dài") để dành cho vùng 4; tên chỉ ở chú thích code.
- Kết vùng: thêm ý lấy lại mảnh trống — vùng 1 Cụ Đồ "Cháu lấy lại được một mảnh trống rồi!…", vùng 2 Chú Lái Đò "Thêm một mảnh trống về làng!…",
  vùng 3 Cụ Đồ "Mảnh trống thứ ba đã về…" (bỏ "như xưa" vì trống chưa lành). Câu của ba bạn và câu "dạy Cu Tí" giữ nguyên.
- Đoạn kết: "…Ba mảnh trống đã về đình, nhưng trống vẫn chưa lành. Hết truyện... mà chưa hết đâu!" và câu cuối của Chú Lái Đò
  "Đêm xuống, mặt sông lại gợn sóng, như có gì dưới đáy chưa ngủ. Muốn thử sức thì gặp chú, chạm "Độ khó 2" nhé!" (thay câu "yêu tinh có thể thức dậy mạnh hơn", giữ lời mời Độ khó 2).
- Tiêu đề khung mới: "Trống đồng vỡ", "Bóng dưới sông".
- EN: 12 mục mới trong `tools/ngon-ngu/tu-dien/truyen-am-thanh.json` và chèn thẳng vào `game/js/ngon_ngu_en.js` (mục cũ giữ cho `?truyencu=1`).
  Không chạy `gop.py` vì tệp ngon_ngu_en.js hiện tại đã lệch khá nhiều so với các tệp tu-dien (gộp lại sẽ đổi ~180 dòng của phiên khác) — nên được rà riêng.
- Câu người làng (LANG), câu trùm (TRUM) không đổi.

## 3. Không đổi luồng game

- Khi nào truyện hiện, tự sang khung, chạm để tiếp, nút Bỏ qua (vị trí/cỡ), Esc/Enter: giữ nguyên. Mở đầu dài thêm một khung (≈ 25 giây).
- `?truyencu=1` → 4 khung mở đầu, lời cũ, nền vẽ code cũ, khung thoại cũ (không tải ảnh). `?truyen=0` như cũ.
- `game/tests/truyen_am_thanh.py` (không chạy) sửa số khung mở đầu 4 → 5.
- Không đụng đăng nhập Google / lưu mây / `?cloud=0`, không chép apiKey, không đụng master.

## 4. Ảnh soát tĩnh

`xem-truyen.png` (dựng bằng `dung-xem-truyen.py`, không chạy game): 16 trang × VI | EN, ảnh khung đầu Ken Burns + dải tối + chữ theo đúng bố cục `boChu/veDai`
ở cỡ game ×4/3. Dòng dài nhất: VI 439/440, EN 435/440 — không trang nào tràn; tối đa 3 dòng. Phông đo là DejaVu Sans (máy dựng không có Be Vietnam Pro);
trong game `ui.wrap` đo bằng phông thật nên dòng luôn ngắt đúng bề rộng.

## Tệp

- `game/js/truyen.js`, `game/build.py`, `game/js/sprite_custom.js`, `game/web/sw.js`, `game/js/ngon_ngu_en.js`, `game/tests/truyen_am_thanh.py`
- `game/art/truyen/*.webp|jpg` (7 ảnh), `tools/anh-truyen/dung.py`, `tools/ngon-ngu/tu-dien/truyen-am-thanh.json`
- `game/dist/*` (đóng gói lại), `docs/review/ke-hoach-cai-thien/canh-truyen/{bao-cao.md, xem-truyen.png, dung-xem-truyen.py}`

## Việc còn lại / gợi ý

- Chạy thử thật trên điện thoại (không làm ở phiên này): độ mượt Ken Burns trên máy yếu (ảnh 960×540 vẽ mỗi khung hình, có làm mịn).
- Khi phiên chu-lech-khung có hàm chung, cho dải chữ truyện dùng hàm đó.
- Vùng mới: thêm một khối vào `VUNG_MOI` + một ảnh (theo CHUNG.md "truyện MỞ").
