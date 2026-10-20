# Độ phân giải 960×540 + Lam chibi (2026-10-20)

> Cập nhật: toàn bộ demo đã sang chibi (môi trường, quái, boss, đồ vật, Lam cỡ đồng nhất) — xem `docs/demo-chibi.md`. Phần "Còn TẠM" dưới đây đã cũ.

Chơi thử: https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/demo.html
(bản artifact tự chứa: https://claude.ai/artifact/Q7zF46xo6ZbqnNtfPBa1My — dựng bằng `python3 game/build-demo.py`).

## Đã đổi

- **Logic 960×540** (gấp đôi 480×270). Ô gạch 32. Mọi toạ độ, tốc độ, trọng lực, hitbox, camera, hạt, quái, boss ×2;
  số khung (thời gian) giữ nguyên → nhảy cùng thời gian, tới cùng số ô như trước. Ví dụ: chạy 4,4 px/khung, nhảy cao 112 px (= 3,5 ô), trọng lực 0,64.
  Hitbox Lam 20×30 (= 10×15 cũ ×2) — **không** theo ảnh.
- **Canvas vừa màn (letterbox)**, bộ đệm = cỡ CSS × devicePixelRatio (iPhone @3x nét). Nút cảm ứng, chữ hướng dẫn vẫn là lớp HTML nên đúng chỗ.
- **Lam chibi** (`game/anim/lam-chibi.png` + `.json`, tạo bằng `game/tools/lam-chibi-sheet.py` từ `art/chibi/lam/khung/`):
  ô 240×240 (Lanczos từ 512), người đứng ≈160 px, pivot [120, 234] = giữa đế ủng. Vẽ có khử răng cưa, lật ngang quanh pivot khi quay trái.
  - run: run-6 thật, 6 khung @12 lặp.
  - combo 3 đòn dưới đất (bấm Chém liên tiếp): combo-1 → combo-3 (đâm) → combo-4 (nhảy bổ). Khung chạy theo thời lượng đòn cũ; khung "chạm" đúng lúc hitbox bật.
  - chém hất (↑+X) và chém trên không: combo-3 (đâm). Chém nảy (↓+X trên không): combo-4 khung 3–4 (đâm xuống).
  - Bóng Tiếng Vọng + vệt lướt: cùng sheet tô màu ngọc, phát lại đúng khung đã ghi.
- Bỏ cờ `?anim=2d` / nút "Lam 3D" (sheet pixel đã xoá). `lib/anim2d.js` không còn nạp trong demo.

## Còn TẠM

- **Môi trường pixel cũ phóng ×2 nearest**: nền 3 lớp, gạch, cửa, công tắc, chuông lưu, Quái Chuông Gỗ, boss, hiệu ứng, HUD. Sẽ gen lại theo phong cách chibi.
  Hệ quả: Lam (160 px) to gấp ~2 lần so với tỉ lệ cũ — quái (40 px) và boss trông bé, hố/bệ trông thấp. Đây là chủ ý của phương án A, chờ môi trường mới.
- **idle**: 1 khung góc nhìn ngang phải (goc-nhin khung 7), đứng im không thở. `idle.gif` gốc là rút dao nên không dùng.
- **jump / fall**: 1 khung mỗi cái (khung bay run 5 / run 2).
- **Lướt** = run khung 1; **bám tường, chết** = fall; **bị đánh** = idle. Chưa có sheet riêng.
- combo-1 khung 1 dao ở tay sau (lỗi ảnh gốc); combo-4 khung 1–2 vẽ chạm đất nên "nhảy bổ" trông như đứng tại chỗ.
- Nét chém pixel chỉ còn vẽ cho chém hất (ảnh đâm ngang không chỉ lên trên).
- Nếu sheet chibi không tải được, game tự dùng Lam pixel cũ ×2 và báo nhỏ.

## Ảnh chụp

`game/xem-thu/anh/chibi-{dung,chay,nhay,dam,echo}-{1280,iphone}.png` (Chromium headless, 1280×720 và 844×390 @3x) — chụp lại: `python3 game/tools/chup-chibi.py`.
