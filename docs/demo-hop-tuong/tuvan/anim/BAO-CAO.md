# Animation hybrid — ụ "sống" (REVIEW-VFX-93-v2-ANIM, phụ lục P0 A–H)

Chỉ hình: không đổi sát thương, nhịp bắn, mục tiêu, vùng chạm. Không `Math.random`, không ghi trạng thái luật (online lockstep giữ nguyên).

## Đã làm

| Mục | Ở đâu | Ghi chú |
|---|---|---|
| Lõi tween/timeline (linear, easeOut, easeIn, easeInOut, smoothstep, spring giảm chấn), góc ngắn nhất ±180°, hệ số mũ theo thời gian | `thap/js/anim.js` (`AN.E`, `AN.spring`, `AN.tl`, `AN.lech`, `AN.kMu`) | |
| Đồng hồ: sự kiện ghi theo `G.t`, lấy mẫu ở thời điểm vẽ nội suy `G.t − (1−α)·BUOC` | `AN.tR()` | 30 FPS = 60 FPS (kiểm: 300 mẫu × 15 ụ trùng tuyệt đối) |
| Đạn nội suy giữa bước luật (đã có) + hướng đạn / độ sáng laser làm mượt theo thời gian (trước: `min(1, dt·k)` phụ thuộc FPS) | `render.js` veDan / veLaser | |
| 7 trạng thái: IDLE (thở lõi 1–3%, nhún ≤ 0,9 px, lệch pha mỗi ụ) · TRACK (lò xo tới hạn của luật, góc ngắn nhất, vẽ nội suy) · ANTICIPATION 60–180 ms (đọc `T.cd`/tốc bắn thật, ≤ 40% chu kỳ) · FIRE · RECOIL 2–8% theo bậc (ease-out) · RECOVERY lò xo vượt nhẹ 100–460 ms, bắn dồn = hoà trộn từ vị trí hiện tại (không khoá) · hỗ trợ: nạp → xung → toả | `AN.u`, `AN.ban`, `AN.giatAt`, `AN.antP`, `AN.xungAt` | sự kiện: bọc `giat()` + `TVX.ban()`; chiêu / hỗ trợ dò `T.sang` bật, `T.nap` tụt ở đầu mỗi bước luật (`chupTruoc`) |
| MUZZLE SOCKET: tâm ô + hướng đầu × bán kính mũi nòng đo từ ảnh (`ART_META.tip`, `STAGE_TIP` cho dạng grow) + thụt nòng + nhún | `AN.muzzle` | chớp nòng, tia laser, sét Tesla neo socket; đạn sinh ở tâm ụ được che dưới đầu tới khi qua mũi nòng (`AN.danChe`) |
| 13 nhóm chuyển động cho 93 ụ | `thap/js/anim-meta.js`, [ARCHETYPE.md](ARCHETYPE.md) | gatling quay nòng + chớp so le; revolver xoắn; Tesla sét lan theo danh sách trúng thật ~45 ms/mắt (≤ 160 ms); chrono 2–3 dư ảnh; portal 2 lớp quay ngược chiều; evolver mở/khoá lớp; drone lơ lửng |
| Rung CỤC BỘ: đòn thường (`FX.lac` ≤ 3,5 từ ụ) → rung quái quanh điểm nổ 140 ms, không rung cả màn; chiêu lớn / trùm giữ rung màn | `AN.lacCucBo`, veQuai | |
| Cài đặt: EFFECTS Full/Balanced/Minimal + REDUCE FLASH + **REDUCE MOTION** (mới, mặc định theo `prefers-reduced-motion`) · LOD bàn đông (≥ 15 ụ + trùm, > 22 ụ, tiết kiệm pin) | `camgiac.js`, `AN.khung` | lõi (ngắm, giật, xung) luôn giữ; bỏ sáng thở, dư ảnh, lớp quay phụ, rung cục bộ |
| Mọi chế độ | `REN.veU` dùng chung | SOLO / CO-OP / PVP / ONLINE / Turret File (Test range) / hướng dẫn — cùng 1 hàm vẽ; Copycat = cùng id → cùng chuyển động |

## Kiểm

- `node tools/thap-kt-anim.js` (đã thêm vào `thap-kt-hoiquy.js`, bước `anim`): 93/93 ụ có nhóm · 60 vs 30 FPS: 182 phát bắn trùng bước, 300 mẫu đường cong khác 0 · 272 viên đạn: hiện ở cửa nòng (lệch ≤ 5 px sau trừ 1 bước bay), 0 viên hiện ở tâm ảnh · anim.js không `Math.random`.
- Hiệu năng `node tools/thap-kt-anim-perf.js [BASE] [tat]` (iPhone 13, CPU ×4, 15 ụ đủ nhóm + trùm + chậm/độc, 30 quái), 5 cặp xen kẽ cùng bản: bật anim TB 11,73 ms/khung, tắt 11,75 ms (nhiễu ±1 ms) → không tăng.
- Dải khung (iPhone 13): `dai_<nhom>.png` — hàng 1 đứng yên 10 s (1 khung/s) · hàng 2 phát bắn quay chậm 0,25× (khung 12,5 ms, vẽ nội suy giữa bước luật) · hàng 3 cùng phát bắn ở 30 FPS. Chụp lại: `node tools/thap-anim-chup.js`.

## Cần ảnh mới (CAN-VE.json)

Nòng gatling tách lớp (quay thật), ổ đạn revolver, tờ tinh thể băng mọc→nứt, mặt độc gợn. Trong lúc chờ: dùng biến đổi code trên ảnh đầu có sẵn.

## Chưa làm / giới hạn

- Tốc quay đầu "súng nặng chậm hơn": góc đầu nằm trong luật (bắn khi lệch < 0,3 rad) → đổi là đổi nhịp bắn, nên giữ nguyên.
- Hạt bay tới ụ nhận buff: dùng xung `HU.ping` sẵn có; tinh thể băng / gợn độc chờ ảnh.
