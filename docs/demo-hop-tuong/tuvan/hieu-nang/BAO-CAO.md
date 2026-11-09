# Hiệu năng — nóng máy iPhone, PVP đợt 15 bàn đầy Ember (09/11)

Báo lỗi: "Mới như này mà đã giật nóng hết máy" (PVP dọc iPhone, đợt 15, 11 Ember n/90 + 3 Đỏ + vàng; bàn đối thủ 13 ụ).

## Dựng lại
- Playwright Chromium 390×844, deviceScaleFactor 3, isMobile, `?notut=1&mode=pvp&deck=lualien,chuato,leviathan,khoisinh,hopca&deck2=cobac,bienmau,nhieusong,lien,canon&wave=15&mana=2500&auto=1`,
  rồi ép bàn: 11 Ember 4★ (lửa 30–90) + Hive Queen + Leviathan + Genesis Core + Quantum Choir; đối thủ 13 ụ. Tắt tự ghép để giữ 11 Ember.
- Máy đo dùng chung 2 nhân, tải 5–8 → thời gian khung (rAF) dao động gấp đôi giữa 2 lần chạy cùng cấu hình (78 ms / 40 ms) — KHÔNG dùng làm số chính.
  Số chính là đại lượng không phụ thuộc máy: điểm ảnh canvas xoá + vẽ mỗi khung, số lệnh vẽ, số lần đổi DOM mỗi khung (`tools/thap-kt-hieunang-dem.js`).

## Kết quả đo (mỗi khung)

| Cấu hình | Canvas | Điểm ảnh xoá+vẽ | drawImage | Đổi DOM | JS/khung* |
|---|---|---|---|---|---|
| Trước — iPhone 3× (`?dpr=3`) | 1170×2340 | **15,4 M** | 517 | **8,0** | 31 ms |
| Trước — 2× | 780×1560 | 7,0 M | 593 | 8,0 | 32 ms |
| `?ha=0` (HUD cũ) | 780×1560 | 7,4 M | 707 | 8,1 | — |
| Bỏ 11 Ember (thay Pháo) | 780×1560 | 6,6 M | 427 | 7,3 | — |
| **Sau — iOS (`?ios=1`)** | 780×1560 | **7,1 M** | 638 | **2,7** | 19–23 ms |

*JS/khung trên máy đo đang bận, chỉ để tham khảo.

Phân tích:
- **HUD anime mới (`ha2`) không phải thủ phạm**: tắt `?ha=0` không giảm việc vẽ / đổi DOM; trace Chromium: Paint + Raster DOM chỉ ~25 ms/s.
- **Ember không phải thủ phạm chính**: 11 Ember chỉ thêm ~115 lệnh vẽ (huy hiệu n/90, quầng lửa), +6% điểm ảnh.
- **Thủ phạm: độ phân giải canvas 3× trên iPhone.** Mỗi khung xoá canvas chính + 2 lớp hiệu ứng "dịu VFX" (`REN.lopFx`, 2,67 màn hình) và đổ lớp (`gopLop`, ~1,6 màn) + vẽ ~3 màn ảnh → 15 M điểm ảnh × 60 khung/s ≈ 0,9 G điểm ảnh/s liên tục.
  Cơ chế tự lùi 2× (`REN.doKhung`) chỉ chạy khi TỤT khung > 4 s — iPhone vẫn kịp 60 Hz nên không bao giờ lùi, GPU gồng suốt trận → nóng.
- Profile JS: 70–80% thời gian JS của khung là `drawImage` trong `gopLop` (đổ lớp hiệu ứng cả màn) — tỉ lệ với số điểm ảnh.
- HUD: `UI.capNhat` gọi `classList.add('max') / remove('du','thieu')` cho 5 thẻ khay mỗi khung → ghi lại thuộc tính `class` 5 lần/khung dù không đổi.

## Đã sửa (đợt 1)
1. `thap/js/render.js` `coLai`: iOS vẽ canvas trận tối đa **2×** (máy khác giữ 3×, tự lùi như cũ). `?dpr=N` vẫn ép được. → điểm ảnh/khung 15,4 M → 7,1 M (−54%).
2. `thap/js/ui.js` `capNhat`: dùng `classList.toggle(x, bool)` (không ghi khi không đổi) → đổi DOM 8,0 → 2,7 lần/khung.
- Không đổi luật / thời gian / ngẫu nhiên gameplay (chỉ độ phân giải vẽ và ghi DOM).
- Ảnh 390×844 đã xem: PVP/solo trước–sau không vỡ hình (chữ n/90, viền ô hơi mềm hơn ở 2× — chấp nhận được).

## Còn có thể làm (đợt 2, chưa làm)
- `REN.lopFx` + `gopLop`: xoá & đổ cả lớp mỗi khung kể cả khi lớp gần trống → theo dõi khung bao vùng đã vẽ, chỉ xoá/đổ vùng đó.
- `#top`, `#the-mv`, `#mana-hop` có `filter: drop-shadow` trong khi nội dung bên trong đổi ~30 lần/s (thanh trùm, hồi chiêu, số mana) — Safari phải dựng lại bộ lọc; nên chuyển bóng vào ảnh / `box-shadow` tĩnh (chưa đo được trên WebKit thật vì máy không có WebKit).
