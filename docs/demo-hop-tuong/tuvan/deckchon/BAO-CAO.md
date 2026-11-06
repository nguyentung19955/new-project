# Màn tải + màn bộ bài: lỗi hình, ô "trong bộ", giật khi cuộn — 2026-11-06

Ảnh người dùng: `thap-art/tuvan/tai_loi_100.png` (LOADING 100% 256/309, thanh như bị chồng 2 lớp),
`thap-art/tuvan/deck_chon_giat.png` (viền xanh mảnh lệch quanh ụ đã chọn, cuộn giật trên iPhone).

## A. Màn tải

| Lỗi | Nguyên nhân | Sửa |
|---|---|---|
| Đứng **100 %** trong khi mới 256/309 tệp | `TAI.choNen` (bấm DECK khi đợt nạp nền chưa xong) đăng ký từng tệp rồi báo "xong" **xen kẽ**: lúc mới đăng ký vài tệp đầu (đã tải) thì "đã xong / tổng" = 100 %; % không bao giờ lùi → đứng 100 % suốt lúc chờ (đo: 16 s ở 2 MB/s, 160 s ở Fast 3G) | đăng ký HẾT danh sách trước rồi mới báo xong; tệp lỗi/thiếu cũng tính đã xử lý (`daXL`); % kẹp ≤ 99 khi còn tệp chưa xong; bỏ bộ đếm n/m (chỉ hiện %) |
| Thanh "bị chồng 2 lớp" (vệt vàng sọc trên/dưới) | khung `hud_trum_khung.png` có 2 miếng vàng giữa cạnh trên/dưới; cắt 9 lát kéo cạnh dài ×1,5 ngang nhưng ép ×0,33 dọc → miếng vàng thành vệt dẹt dính vào dải đầy vàng. Thêm: CSS nội tuyến index.html cắt lát `14 22` ≠ taitai.css `36.9 58` → khung đổi hình giữa chừng | `assets/tai_khung.png` = chính ảnh ChatGPT đó bỏ đoạn giữa (ghép 2 nửa, cạnh trên/dưới đều) → kéo dài sạch; cùng 1 luật lát `36.9 69 36.9 70 / 12px 23px` ở cả 2 nơi; dải đầy nằm đúng rãnh (9/11/10 px) |
| Logo / khung bật lẻ | nền hiện ngay, logo 490 KB về sau | `.tai-giua` ẩn tới khi logo + khung giải mã xong (≤ 1,5 s), rồi hiện cùng lúc |
| Thanh hiện lại đè HOME | không xảy ra khi không bấm gì (đo lạnh/ấm/3G: 0 lần); chỉ hiện khi người chơi bấm nút cần ảnh nền (cổng chờ có chủ đích) | giữ |

Khung chụp: `docs/demo-hop-tuong/tuvan/tai2/` — `tinh_0/30/60/100.png` (đặt % tay), `3g_0/30/60.png` (Fast 3G thật), `lanh_0.png`.
Tiến độ Fast 3G sau sửa (bấm DECK lúc nạp nền): `1% 2% 3% … 30% … 60% …` tăng đều, không lùi (trước: `100%` đứng yên).

## B. Ô "trong bộ" trên lưới (kiểu DCDW)

Trước: `.c.chon` = nhấc 1,04 + viền `khung_chon.png` 9 lát ở −5 px → tràn khe 6 px, nét đứt/lệch, đè ô bên.
Sau (`css/deckchon.css`, nạp cuối): ô không nhấc, không viền; chân dung + viền độ hiếm + ngọc mờ 0,42 (tĩnh) + huy hiệu dấu tích
`chon_huy.png` (ChatGPT) trong cửa sổ ảnh góc trên-phải (không che đinh khung). Bộ sưu tập: chỉ huy hiệu, không mờ (mờ = khoá ở DCDW).
Ô đang bị kéo: mờ như trên, bóng ma theo tay mới là vật đang chọn. Ô bộ bài chờ đổi giữ viền chọn cũ (ô 62 px có khe rộng).
So sánh: `so_sanh_luoi.png` (trước | sau | DCDW), `truoc_toanman.png`, `sau_toanman.png`, `sau_bosuutap.png`, `sau_khaytran.png`.

## C. Giật khi cuộn

Nguyên nhân chính (iPhone): 85 chân dung `pilot_*.png` 427 px (37,5 MB PNG, ≈ 62 MB RGBA khi giải mã) cho ô chỉ hiện ≤ 187 px thật
→ Safari giải mã/đẩy khỏi bộ nhớ khi cuộn; 248 lớp `filter: drop-shadow` trên ngọc; `getBoundingClientRect` ngay sau ghi `scrollTop`
mỗi pointermove (ép bố cục); đợt nạp nền vẫn giải mã ảnh trong lúc cuộn.

Sửa:
- `tools/thap-pilot-nho.py` → `assets/pn/pilot_<id>.png` 256 px (Lanczos nhân-trước-alpha). 200 px bị hồi quy bắt ở 360×780 (chân dung còn phóng theo khung mặt: 1,03 px nguồn/px máy) → 256 px. Dùng cho lưới, 5 ô bộ bài, khay trận, dải đối thủ/đồng đội, dải vào trận (`thumbOf`). 12 MB PNG thay 37,5 MB (bản xuất bản: webp). Ảnh giải mã ≈ 22 MB thay 62 MB.
- Ngọc trên lưới: bỏ filter. Ô: `content-visibility:auto`. Lưới: `will-change: scroll-position`, `overscroll-behavior: contain`. Ảnh `decoding="async"`.
- `js/dkkeo.js` cuộn tay: đo mép lưới 1 lần, gom pointermove → ghi `scrollTop` 1 lần / khung (rAF). Ngưỡng kéo / giữ lâu giữ nguyên (kiểm kéo-thả 21/21 × 3 cỡ).
- `js/taitai.js`: đợt nạp nền nhường 450 ms sau mỗi lần cuộn (`TAI_CUON`, cả cuộn gốc qua sự kiện scroll passive).

Số đo (Chromium headless, iPhone 13 390×844 DPR 3, CPU chậm ×6, 4 lượt vuốt + quán tính, 159 khung):

| | MP ảnh trong lưới* | khung TB ms | p95 | > 33 ms | long task | Layerize ms | Decode ms |
|---|---|---|---|---|---|---|---|
| bộ bài TRƯỚC | 47,7 | 24,7 | 33,4 | 6 | 0 | 668 | 34 |
| bộ bài SAU | 29,0 | 25,2 | 33,4 | 9 | 0 | 581 | 11 |
| bộ sưu tập TRƯỚC | 47,7 | 25,1 | 33,4 | 15 | 0 | 675 | 16 |
| bộ sưu tập SAU | 29,0 | 22,2 | 33,4 | 3 | 0 | 475 | 25 |

\* tổng điểm ảnh gốc của mọi `<img>` trong lưới (gồm 6 khung/viền dùng chung); riêng chân dung 15,5 → 5,6 MP (bản 256 px: tổng 31,2).

Đo lại cặp trước/sau xen kẽ lúc máy kiểm bận hơn (bản 256 px, bộ bài): SAU 29,7 ms TB / 21 khung > 33 ms — TRƯỚC 29,1 ms / 22 khung → **trên Chromium headless không khác biệt** (sai số máy 2 lõi lớn hơn hiệu quả).
Ghi chú thật thà: Chromium headless vẽ bằng CPU nên khung hình gần như không đổi (cả trước lẫn sau ~ 40–52 fps ở CPU ×6, ~60 fps ở ×4);
cái nặng trên iPhone là giải mã + bộ nhớ ảnh (giảm ≈ 4,6×) và filter — headless không đo được phần này.
**WebKit (Playwright) không chạy được trong máy kiểm** (tải trình duyệt WebKit bị chặn mạng) → chưa đo trên WebKit; cần thử trên iPhone thật.
