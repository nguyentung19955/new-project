# Hero trang ụ / trang chỉ huy — hết mờ, bỏ huy hiệu ụ, ảnh nét (2026-11-05)

User: "cái này là cái gì mà cứ mờ mờ… để ảnh thôi không cần để ụ súng, đồng thời làm nét ảnh lên"
(ảnh: thap-art/tuvan/hero_top_blur.png, hero_medallion_soft.png).

## Nguyên nhân
1. Mặt nạ CSS `linear-gradient(to bottom, transparent 2%, #000 17% …)` trên `.up-pi` + `top:-6px` → đỉnh tóc mờ dần vào thanh trên (nền ống thép lộ qua).
2. Ảnh hero = `pilot_<id>.png` **256 px** (85 phi công) / `af_*.png` 474 px, hiện ở 300–510 css × DPR3 = **phóng 4–6 lần** → mềm, nhoè.
3. `pilot_<id>.png` cũ còn có dải "kéo dài nền + làm mờ" 32 px trên đầu (tools/thap-pilot-fit.py).

## Sửa
- Hero chỉ còn ẢNH, rộng hết màn 390×340 css, bắt đầu ngay DƯỚI thanh trên; không mặt nạ mờ ở đỉnh/hai bên (chỉ mờ nhẹ 16 % dưới cùng, ở ngực).
- Bỏ huy hiệu ụ tròn (vòng bậc + đầu súng) khỏi ảnh; ụ nhỏ (assets/nho/<id>.png / icon chỉ huy) để cạnh TÊN, không đè ảnh.
- Ảnh mới `thap/assets/hero/hero_<id>.jpg` (chỉ huy `hero_af_<id>.webp`, nền trong suốt) **1170×1020 = đúng 3× 390×340** → hiện 1:1 trên iPhone.
  Màn chính: `home_af_<id>.webp` 1260×1260 (3× 420 css).
- Nguồn: cắt lại từ tấm gốc ChatGPT trong thap-art (raw_fp*, raw_redo_pilots, raw_fp_fix1, raw_fp10, raw_commanders; overlord/doc/docton = raw_pilot_<id>_v3.png 1254 px),
  vị trí trong tools/thap-hero.json (thêm v3 mới: chimang, chuato, dichchuyen, nhanban, nhieusong); phóng ×4 bằng **Real-ESRGAN x4plus_anime_6B** (xinntao/Real-ESRGAN v0.2.2.4, giấy phép BSD-3-Clause, chạy CPU) rồi thu Lanczos về 1170.
  Công cụ: `tools/thap-hero.py`. Thẻ/thanh bài vẫn dùng ảnh nhỏ.

## Số đo (Playwright 390×844 DPR3, không lỗi trang)
| | nguồn | hiển thị css | px máy (DPR3) | tỉ lệ phóng |
|---|---|---|---|---|
| TRƯỚC (vd. Cannon) | pilot_canon.png 256×256 | 319×338 (Overlord/Venom/Lone Ace 509×540) | 957–1527 | ×3.7 – ×6.0 |
| TRƯỚC chỉ huy | af_*.png 474 | 333–365 | 1000–1100 | ×2.1 – ×2.3 |
| SAU (cả 85 + 3) | hero_<id> 1170×1020 | 390×340 | 1170×1020 | **×1.0** |
Vùng gốc trong tấm raw: 398–444 px (lưới 4×2), 380 px (fp2/fp7), 602–700 px (fp_fix1, v3, chỉ huy) → ×4 AI → 1170.

## Ảnh kiểm tra
- `zoom_top_<id>.jpg`: thanh trên + tóc, TRƯỚC | SAU, 1:1 px máy — 12 ụ (canon, sungluc=Revolver, overlord, doc, docton, tia, lien, bang, phun, cuuvi, pandora, xucxac) + 3 chỉ huy.
- `full_<id>.jpg`: cả hero TRƯỚC | SAU. `home_before_after.jpg`: màn chính.
- Khung logic 430 css (#wrap thu theo màn): ảnh 430×375 logic × 0,907 = 390×340 css → 1170×1020 px máy = đúng cỡ ảnh. Mặt nạ 'mờ sang phải' của tvA.css bị đè (chỉ còn mờ đáy 16 %).
