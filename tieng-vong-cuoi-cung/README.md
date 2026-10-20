# Tiếng Vọng Cuối Cùng

Game metroidvania 2D pixel art. Nhân vật chính là một cô bé giữ chuông, có thể ghi lại 3 giây chuyển động của mình thành một "tiếng vọng".

## Thư mục

| Thư mục | Nội dung |
| --- | --- |
| `docs/gdd.md` | Bản thiết kế game: cốt truyện, cơ chế, động tác, item, thế giới, kế hoạch |
| `docs/dac-ta-nhan-vat-sprite.txt` | Đặc tả sprite 24×24 của nhân vật Thợ Săn Chuông |
| `tools/sprite-lab.html` | Công cụ dựng nhân vật 3D, 26 animation (di chuyển, leo trèo, combo 3 nhát, đỡ đòn…), xuất sprite sheet. Bản trực tuyến: https://claude.ai/artifact/FAy4oP69UsN6H5LRLTFDb2 |
| `game/demo.html` | **Demo Làng Chuông** chơi được 5–8 phút: Lam, Tiếng Vọng, Cộng hưởng, câu đố, boss Chuông Gác Làng. Bản trực tuyến: https://claude.ai/artifact/Q7zF46xo6ZbqnNtfPBa1My (dựng lại bằng `python3 game/build-demo.py`). Độ phân giải logic 960×540, Lam chibi (ảnh vẽ, cao ≈160 px), môi trường pixel cũ tạm ×2 — xem `docs/do-phan-giai-960.md`. So sánh hai cỡ: `art/nhan-vat/lam-3d/co-36-vs-46.png` (chụp bằng `tools/chup-co-lam3d.py`) |
| `proto-lam/` | **Prototype Lam 3/4 (3D → pixel, độc lập)**: `proto.html` xem 3D + pixel 36/44 px + 3 animation idle/run/slash; `xuat.py` xuất sprite sheet/GIF vào `proto-lam/out/`; đề xuất trong `proto-lam/DE-XUAT.md`. Bản trực tuyến: https://claude.ai/artifact/XFkRANTVGr5eDpW8rgCHVt |
| `game/phong-xam.html` | Phòng xám thử điều khiển và Tiếng Vọng |
| `game/lib/anim2d.js` | **Anim2D (giai đoạn 1, chưa tích hợp vào demo)**: bộ phát animation từ sprite sheet lưới 64×64 theo `game/anim/lam.anim.json` (idle/run/jump/fall/attack, pivot chân, hitFrames chỉ là metadata); trang thử `game/xem-thu/anim2d.html` (placeholder khi chưa có `anim/lam.png`). Bản trực tuyến: https://claude.ai/artifact/ReNZkyMC73J7jBqKEZfVVM |
| `tools/rig-lab-2d.html` | **Rig Lab 2D – Lam 48×48** (trực tuyến: https://claude.ai/artifact/URsWoBBKqbSNSVxvUXupyq): xem 26 animation (×4/×6, từng khung, nền Làng Chuông), chỉnh góc khớp bằng thanh trượt, xuất JSON keyframe, xuất sprite sheet. Dựng lại cùng lúc với `python3 -I tools/in-lam48.py` |
| `tools/in-lam48.py` | In sẵn Lam 48: `art/sprite/lam48.png` + khóa `lam48` trong `atlas.json` (rig 2D: `tools/lam48-rig.js`, tư thế `tools/lam48-anim.js`, bộ phận `tools/lam48_bo_phan.py`). `--xem` ghi lưới + GIF vào `art/nhan-vat/lam-48/` |
| `tools/pixel-fit.html` | Đưa ảnh AI về đúng lưới pixel, khóa bảng màu, cắt tile. Bản trực tuyến: https://claude.ai/artifact/4LLj7aFE5jyrNBbS5vLVma |
| `art/nhan-vat/` | `tho-san-chuong-chuan.png` là bản chuẩn (chuông vàng đồng). `tho-san-chuong-ban-dau.png` là bản đầu, chỉ để tham khảo |
| `art/ke-dich/` | Quái chuông gỗ (chuông đồng xỉn) |
| `art/item/` | 12 icon item |
| `art/tileset/` | Tileset concept: đất, rêu, ván, thang, dây. Chưa ghép liền mạch |
| `art/nen/lang-chuong/` | Nền Làng Chuông: 3 lớp parallax (xa, giữa, gần) và ảnh toàn cảnh |
| `art/nen/tham-khao/` | Nền phụ và ảnh mẫu bố cục màn chơi |

## Bảng màu chuẩn

| Mã | Dùng cho |
| --- | --- |
| `#0C0F14` | Viền, mảng tối nhất |
| `#212835` | Mũ, áo choàng |
| `#1A212B` | Bóng |
| `#21413A` | Xanh tối |
| `#32804F` | Xanh lá chính |
| `#83CC93` | Viền sáng xanh |
| `#CEF0D6` | Điểm sáng, hiệu ứng tiếng vọng |
| `#4A5A6E` | Xám kim loại |
| `#E1B85A` / `#9C6B30` / `#F3E6C8` | Vàng đồng, bóng vàng, ánh kem (chuông, chắn kiếm) |

## Việc còn mở

- Ảnh từ ChatGPT chưa đúng lưới pixel và còn điểm ảnh bán trong suốt. Cần làm sạch bằng Pixel Fit (đã có công cụ).
