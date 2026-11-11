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

## Đợt 2 (09/11)
Đo lại `tools/thap-kt-hieunang-dem.js`, `?ios=1` (canvas 780×1560), mỗi khung, trước = 7e275d15:

| Chế độ | Điểm ảnh vẽ | Điểm ảnh xoá | Tổng | Đổi DOM |
|---|---|---|---|---|
| PVP trước | 4,22 M | 3,25 M | 7,47 M | 3,2 |
| **PVP sau** | 2,59 M | 1,93 M | **4,52 M (−39%)** | 2,2 |
| Solo trước | 3,13 M | 2,93 M | 6,06 M | 2,0 |
| **Solo sau** | 1,51 M | 1,37 M | **2,88 M (−52%)** | 1,7 |

So với gốc 3× (15,4 M) → PVP iPhone còn 4,5 M điểm ảnh/khung (−71%).

1. (a) `REN.lopFx` / `gopLop` (render.js): ctx lớp hiệu ứng tự ghi KHUNG BAO điểm ảnh của mọi `drawImage` (4 góc theo phép biến đổi, cộng bóng);
   fill/stroke/chữ/filter → cả lớp. Chỉ xoá + đổ đúng khung bao; lớp rỗng thì bỏ qua. Kiểm 48 khung PVP/solo: 0 điểm ảnh nằm ngoài khung bao (hình y hệt). ~1/3 khung lớp rỗng.
2. (b) `filter: drop-shadow` trên HUD: ĐO trước khi sửa — gắn MutationObserver vào 21 phần tử có filter: chỉ #nut-trieu đổi 7–8 lần/s (do `classList.remove('h2-san')` mỗi lần cập nhật),
   #the-mv / nút nhỏ 0,3 lần/s. Diện tích filter vẽ lại ≈ 0,6 M điểm ảnh/GIÂY, so với canvas ≈ 270 M/giây → < 0,3%. Không bỏ bóng (giữ hình),
   chỉ sửa nguồn đổi: `hud2.js` dùng `toggle('h2-san', false)` → #nut-trieu hết vẽ lại.
3. (c) Animation CSS chạy liên tục trong trận (`document.getAnimations()` sau 6 s, PVP + solo): KHÔNG có cái lặp vô hạn nào trên HUD trận
   (cổng/lõi vẽ bằng canvas). Chỉ bảng giới thiệu đợt (#nd-gt, tạm thời). Không cần sửa.
4. (d) Dải chân dung đối thủ PVP: cụm số "6 5 5" = dải điểm 3 quả Lucky Slot (`.cb-qua`, chữ 6px) đè nửa dưới chân dung 30px → ẩn trong `#dp-dai` (hud-anime.css).

## Còn có thể làm
- Khung bao lớp hiệu ứng hay bị "cả lớp" do vài hiệu ứng vẽ fill/stroke/chữ vào lớp → tính khung bao cho fillRect / chữ để giảm thêm.

## Đợt 3 (10/11) — "Rất giật" cảnh 8 Lucky Slot đợt 66
Báo lỗi iPhone: đợt 66, 8 Lucky Slot (cobac, 2–3 tia hồng tím) + vài ụ, quái dồn chùm, số sát thương khổng lồ chồng nhau, nhiều chấm trắng sáng to.

Dựng lại: `BAN=cobac MODE=solo WAVE=66 node tools/thap-kt-hieunang-dem.js x=ios=1` (tham số mới `BAN` / `SAO` / `WAVE`: bàn 0 = 8 Lucky Slot 6★ + Ember / Hive Queen / Pháo / Liên xen kẽ, 15 ô đầy, auto=1, không kết thúc trận khi đo).
Canvas 780×1560 (iOS 2×). Máy đo bận → đo xen kẽ trước/sau 5 lần mỗi bên; số mỗi khung:

| | drawImage | Điểm ảnh vẽ | Điểm ảnh xoá | Hạt sống |
|---|---|---|---|---|
| Trước (5 lần) | 630–757 (TB ~680) | 1,98–2,18 màn (TB 2,07) | 1,41–1,47 | 212–296 (sát trần 320) |
| **Sau** (5 lần) | 535–612 (TB ~557, **−18%**) | 1,67–1,93 (TB 1,81, **−13%**) | 1,28–1,49 (TB 1,34) | 86–152 |

Điểm ảnh còn lại chủ yếu là cảnh nền (xoá canvas chính 1,0 màn, ụ/quái/thanh máu) — không thuộc hiệu ứng.

Đã sửa (chỉ hình, không đổi luật / thời gian / ngẫu nhiên luật):
1. `fx.js`: số ≥ 100 000 hiện gọn `199.9K` / `14.3M` / `1.2B` (`FX.soGon`, chỉ lúc vẽ — số thật không đổi); số thường cách nhau < 44×22 px chỉ giữ số LỚN nhất; trần số cùng lúc 14 → 10, chữ 32 → 24.
2. `render.js` `veFx`: ≤ 120 hạt sáng vẽ mỗi khung (`REN.MAX_HAT_VE`), đông thì giữ hạt to / mới (điểm = cỡ × phần đời còn lại; không Math.random).
3. `tiervfx.js` `TVX.dan`: vệt hạt sau đạn bậc Vàng/Đỏ dùng chung "xô" theo thời gian TRẬN (G.t, tất định): ≤ 70 hạt/giây toàn màn (dồn ≤ 10) → 1–3 đạn như cũ, nhiều đạn thì thưa dần.
4. `jackpot.js` `HU.cbTia`: chấm sáng ở quái 22 → 14 px; mỗi khung ≤ 6 chấm, chấm trùng chỗ (< 14 px, nhiều Lucky Slot bắn cùng cụm) chỉ vẽ 1.
5. `render.js` `gopLop`: chỉ khoét quái chạm khung bao hình thật của lớp; `theoVung` tính khung bao cho chữ (measureText actualBoundingBox) và fillRect/strokeRect thay vì "cả lớp"
   — "+1" / "JACKPOT!" của Lucky Slot trước làm lớp hiệu ứng xoá + đổ cả màn (~0,7 màn) ở ~40% số khung. Kiểm: chữ thường / xoay / bóng / rect âm: 0 điểm ảnh ngoài khung bao.

Ảnh 393×852 trước/sau: `/home/claude/xem/giat-lucky.jpg` (chỉ trên máy làm). Kiểm: hud2, hudtop, nut-trieu, tu-kich (29/0), vetay-ui, keoghep, trum-don, anim (RNG 30/60 FPS) xanh; matran 3 lỗi có sẵn.

## Đợt 4 (11/11) — giật co-op cuối trận (video wave 38: ~10% khung 30 fps, 1 lần đứng 0,35 s)

**Cách đo.** Chromium không màn hình (canvas tô bằng CPU — gần cách Safari iOS tô canvas 2D hơn là máy có GPU), 390×844 ×3, `?ios=1` (canvas 2×), không giảm tốc CPU thêm (máy đo vốn đã chậm: giảm 4× thì mọi khung > 200 ms, không còn phân biệt được). 4 cảnh co-op, đường luôn đầy quái (công cụ giữ máu quái tới 85% đường), DRAG NET bật liên tục:
A = video người dùng (wave 38; bàn dưới Hex Saboteur / Twin Maker / Genesis Core, bàn trên Leviathan / Lucky Slot / White Wyrm / Hive Queen / Overlord) · B = wave 55, 2 bàn `cobac,leviathan,ronglua,chuato,overlord` · C = wave 45 có `bocap` + `cuuvi` + `hydra` · D = ảnh "nóng máy" thứ 2 (wave 35, ~100 quái tách/đá/bay, 6 Lucky Slot).

**Tìm ra.** Mô phỏng (luật, tìm mục tiêu, va chạm) chỉ ≈ 1–1,5% thời gian kể cả 100 quái → KHÔNG đụng. 95% là tô canvas: ~1 100 lệnh `drawImage` / khung, ~6 triệu điểm ảnh co/xoay. Mọi ngữ cảnh vẽ đặt `imageSmoothingQuality = 'high'` → mỗi lệnh co/xoay đi đường lọc đắt nhất (mipmap / bicubic; Safari: nội suy CG "high"). Ảnh đã được thu sẵn gần đúng cỡ nên lọc 'high' lúc vẽ không thêm được gì.

**Sửa (chỉ hiển thị).**
1. Canvas trận + lớp hiệu ứng lọc `'low'` lúc vẽ mỗi khung (dựng ảnh đệm vẫn `'high'`) — phần lớn mức giảm.
2. Lớp hiệu ứng tự giữ ma trận biến đổi (bỏ `getTransform()` mỗi lệnh vẽ: ~450 DOMMatrix rác / khung). Kiểm: 1,2 triệu lệnh ở 4 cảnh, lệch tối đa 9e-7.
3. Tấm đếm trên ụ: 1 canvas riêng / ụ vẽ lại tại chỗ (trước ~1 canvas mới / khung); số gọn `199.9K` ghép từ ảnh chữ số có sẵn → canvas tạo mới 3,5 → ~1,2 / khung.
4. Đường > 60 quái: bỏ hoà 2 khung hoạt ảnh thân quái (LOD kín đáo).
5. Thẻ Lucky Slot ở khay: không đọc `clientWidth` 30 lần/giây; icon + lưới DRAG NET nạp cùng ảnh trận (trước tải lười lúc bấm chiêu lần đầu).

**Số đo** (thời gian thực 25 s / cảnh; khoảng khung ms):

| Cảnh | trung bình | trung vị | p95 | p99 | max | khung > 50 ms | khung > 100 ms | JS + lệnh vẽ / khung |
|---|---|---|---|---|---|---|---|---|
| A | 68,4 → 47,6 | 66,7 → 50 | 83,4 → 66,7 | 100,1 → 66,7 | 116,7 → 83,3 | 305 → 103 | 7 → 0 | 32,6 → 24,1 |
| B | 81,4 → 60,5 | 83,3 → 66,6 | 100 → 83,3 | 116,7 → 99,9 | 116,7 → 116,6 | 304 → 249 | 15 → 1 | 42,4 → 33,8 |
| C | 51,2 → 34,4 | 50 → 33,3 | 66,7 → 50 | 83,3 → 66,6 | 100 → 83,4 | 133 → 24 | 0 → 0 | 18,3 → 13,4 |
| D | 57,2 → 34,6 | 50 → 33,3 | 83,3 → 50 | 99,9 → 50,1 | 100,1 → 66,7 | 218 → 18 | 1 → 0 | 19,9 → 13,3 |

Vẽ + tô 1 khung ở CÙNG trạng thái trận (bước 900, `tools/thap-kt-hieunang-coop.js BENCH=15`): A 54,5 → 35,7 ms · B 74,1 → 47,9 · C 33,9 → 22,6 · D 39,2 → 27,5 (−30…35%).

**Luật không đổi.** `tools/thap-kt-hieunang-coop.js` (đồng hồ ảo, hạt giống cố định, Math.random tách dòng luật / hình): băm trạng thái (mana, ụ, sao, hồi chiêu, máu + vị trí quái, đạn) của bản trước và bản sau GIỐNG HỆT ở 30 / 60 / 90 s mô phỏng thuần và ở 7,5 / 15 s có vẽ, cả 4 cảnh. `thap-kt-nguyen-tac` 57/57, `thap-kt-tu-kich` 29/29; `co-bac`, `chi-huy-moi`, `giat`, `vfx-p0` chỉ còn các lỗi có sẵn (bản trước cũng lỗi y hệt).

**Chưa tái hiện được cú đứng 0,35 s** trên Chromium (khung dài nhất 117 ms → 83 ms). Nghi phạm còn lại, cần máy thật: dọn rác của Safari (đã bớt nguồn rác ở mục 2–3), trùm Hive xuất hiện (khung JS 32–35 ms ở máy đo, có sẵn), ảnh tải lười giải mã.
Ghi nhận thêm (có sẵn, chưa sửa): `VX.hen` (đồng hồ hiệu ứng theo khung vẽ) đặt `T.cd = 0.01` sau khi ụ biến hình (`growfx.js` VX.bien) → luật offline phụ thuộc nhịp vẽ.
