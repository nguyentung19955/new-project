# Nền / đồ vật THIẾU ẢNH GỐC (17/10)

Các ảnh dưới đây đang có trong game nhưng **tấm ảnh AI gốc to không còn trong repo** (được tách bằng trang `tools/tach-phong`, `tools/tach-lang` trên máy chủ game, tấm gốc không được lưu; lịch sử git cũng không có). Nên chưa dựng được bản nét cao thật. Khi bật `?netcao=3/4` chúng vẫn vẽ từ ảnh net 2 hiện tại (rõ hơn trước vì nền phòng không còn bị thu về cỡ 1 điểm game — xem báo cáo).

Muốn nét thật: gen lại đúng tấm (cùng bố cục, cùng màu) theo prompt ngắn dưới đây, lưu vào `docs/anh-goc/nen-phong/` (hoặc `docs/anh-goc/lang/`), báo phiên sau dựng lại. Prompt đầy đủ tiếng Việt cho từng ô có sẵn trong trang `tools/tach-phong` / `tools/tach-lang` (nút "Chép prompt"); bản ngắn tiếng Anh:

Chung cho mọi tấm: *"Pixel art, crisp hard pixels, no anti-aliasing, no blur, limited palette, top-down 3/4 view like a 16-bit JRPG, render LARGE (at least 2048 px wide), solid magenta #FF00FF background between items."*

| Ưu tiên | Tấm cần gen lại | Mã trong game (số ảnh) | Prompt ngắn (tiếng Anh) |
|---|---|---|---|
| **1** | Nền làng (một tấm liền) | `gd-lang-nen` (1; đang **net 1**, 720×270 — mờ nhất game) | *"Wide 8:3 top-down pixel art ground map of a Vietnamese village at the same layout as the current game village: grass, dirt paths, a river along the bottom right with a ferry dock, a lotus pond, brick courtyard in front of the communal house, a row of trees along the top edge. Ground only — no buildings, no people, no props. Daylight colors. 2880×1080."* |
| **1** | Rừng già 9 mảng tile | `gd-nen-rung-san0/1/2/san-nhan/ngoai/tuong-sau/tuong-truoc/mep/tuong-ben` (9) | *"3×3 grid tile sheet for a dark ancient forest dungeon room: (1–3) three seamless mossy forest-floor tiles with dirt patches and pebbles, (4) same floor with a root cluster accent, (5) very dark outer forest void tile, (6) back wall of giant old tree trunks with a leafy canopy top, (7) thin front strip of dense dark bushes, (8) thin strip of tall grass blades on transparent/magenta, (9) narrow vertical left wall of bushes and roots. Each floor tile must tile seamlessly."* |
| 2 | Rừng già 16 đồ trang trí | `gd-tt-rung-*` (16) | *"4×4 grid of forest room decorations: tree stump, berry bush, red mushrooms, fallen log; ancient broken tree stump (large), wildflower patch; two glowing mushroom clusters; three leafy canopy clumps; three hanging vines; two very dark fern foreground clusters (left, right)."* |
| 2 | Hang biển 16 đồ trang trí | `gd-tt-bien-*` (16) | *"4×4 grid of sea-cave decorations: two rock piles, old rusty anchor, four stalactites (long, medium, short, double), two crystal clusters small, two crystal clusters large, seashell, small tide pool, tide pool under a light beam, two dark rock foreground clusters (left, right)."* |
| 2 | Cửa phòng 3 vùng (mở + khoá) | `gd-cua-rung-*`, `gd-cua-bien-*`, `gd-cua-lau-*` (18) + `gd-cua-o-khoa`, `gd-cua-dau-lau` | *"Door set for a top-down dungeon room, one row per biome (forest / sea cave / old castle): top door open, top door locked with bars, side door open, side door locked, bottom door open, bottom door locked; plus a red padlock and a small skull emblem."* |
| 2 | 17 vật trong phòng | `gd-vat-*` (18) | *"Grid of dungeon room interactables: treasure chest closed / opened, equipment chest, merchant stall, health fountain full / empty, mana fountain full / empty, cursed altar lit / unlit, challenge pedestal with hourglass active / used, brazier lit / unlit, poison mushroom / burst, ice crystal / shattered."* |
| 3 | 6 công trình làng | `gd-lang-dinh, cong, cay-da, lo-ren, hang-xen, nha-may` | *"Vietnamese village buildings, top-down 3/4 pixel art, one per cell: communal house (đình), village gate, big banyan tree, blacksmith forge, small market stall, tailor house."* |
| 3 | 13 đạo cụ / con vật làng | `gd-lang-bang-tranh, cay-rom, chum, coc, cot-den, day-phoi, de, den-long, do, ga, ga-mo, gieng` | *"Village props grid: map signboard, haystack, clay jar, toad, lamp post, clothesline, anvil, red paper lantern, small wooden ferry boat, standing chicken, pecking chicken, stone well."* |

Không cần gen lại:
- `gd-cot-nang-rung` (cột nắng mờ, nhiều nấc trong suốt — nét cao không thấy khác).
- `gd-loi-mon-rung` (net 1, game chỉ lấy MÀU đất của ảnh để tô lối mòn, không vẽ thẳng ảnh).

## Hình vẽ bằng code (không phải ảnh)

Không có ảnh để dựng lại; ở `?netcao=3/4` vẫn vẽ theo ô điểm game như cũ (to đều, không nhoè):
- Trong phòng: dấu loại phòng trên sàn, lớp lối mòn, ánh sáng sàn (`lightPass`), bóng tường (`backPass`), cột sáng code, quầng đuốc/nấm/tinh thể, bóng dưới chân đồ, đom đóm / hạt bụi / sương (lớp sống), tiền cảnh code khi thiếu ảnh.
- Làng: lớp nhuộm chạng vạng, quầng đèn, sậy, vệt nước, khói, đom đóm (vẽ sống).
- Mọi vùng khi tắt ảnh (`?vecode=1`, `?nentile=0`, `?gop8=0`): toàn bộ nền vẽ code như cũ.
