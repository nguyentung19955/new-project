# Phase 1 — Audit hình ảnh, chuyển động, hiệu ứng (10/10/2026)

Yêu cầu gốc của chủ dự án: `docs/vfx/YEU-CAU.md` (đọc kỹ, làm đúng các nguyên tắc ở đó).

## Kiến trúc hiện tại (đã kiểm tra trong code)
- **Canvas 2D, hai lớp**: `#world` 480×270 vẽ pixel rồi phóng to (image-rendering: pixelated, `imageSmoothingEnabled = false`);
  `#ui` nét cao theo devicePixelRatio (chữ, nút, số sát thương, vùng báo trước `bao_truoc.js`). Xem `game/js/engine.js` `resize()`.
- **Vòng lặp**: `engine.js` `frame()` — bước cố định 1/60 giây có bộ tích luỹ, tối đa 5 bước/khung, `G.tickDraw` cho bước đầu. Không phụ thuộc FPS.
- **Hiệu ứng**: `game/js/fx.js` (1605 dòng) đã có: kho hạt dùng lại (MAXP 400), hình hiệu ứng (MAXE 72), số sát thương (MAXN 28),
  bảng màu theo hệ (fire/poison/ice/none/foe/gold), rung kiểu "trauma" + giật (`trauma`, `kick`), khựng hình `stop(ms)` 45–115 ms
  có giữ nút bấm (`fx.frozen`, `PRESS` latch), chớp/giật lùi quái khi trúng (`e.fxK`, `e.fxD`), bóng mờ khi né, quái chết (`dying`),
  đạn (`stepProjs`, `fx.proj`), vũng/vùng (`pool`, `fx.zone`). Hệ: `fx_he.js`; đạn: `fx_dan.js`; chưởng: `fx_chuong.js`.
- **Báo trước đòn quái**: `bao_truoc.js` (vẽ mịn ở #ui, đầy dần, chớp khi ra đòn).
- **Camera**: `combat.js` ~dòng 931 `W.cam += (camTo - W.cam) * min(1, dt*6)` (đã có làm mượt).
- **Em bé**: `hero_tinhlinh.js` vẽ bằng code theo khung (`drawFrame`, động tác idle/run/atk/dodge/hurt...), vũ khí `weapon_art.js`.
  Đòn đánh chọn khung tuyến tính `Math.floor(o.atk * n)`.
- **Quái**: `monster_art.js` (2287 dòng) + `mobs.js`; trùm `boss.js`.
- **Cấu hình mới**: `game/js/vfx_cfg.js` → `G.VFX` (rung, khung, hat, vet, nhun, moiTruong, giaoDien), nạp trước fx.js. MỌI hiệu ứng mới/sửa phải nhân theo hệ số này.

## Vấn đề thực tế (ưu tiên giảm dần)
1. **Vệt vũ khí không theo quỹ đạo thật**: kiếm/búa dùng hình trăng khuyết vẽ sẵn (`ty:'cres'` trong `api('swing')`), giáo `thrust`.
   Không có đầu–thân–đuôi, không bám mũi vũ khí đang chuyển động.
2. **Không có nhún/co giãn (squash & stretch)** ở bất kỳ đâu (không có trong code): em bé khi chạy/dừng/né/đánh/trúng đòn, quái khi trúng đòn/lấy đà/chết.
3. **Nhịp đòn đánh của em bé phẳng**: khung chọn tuyến tính theo thời gian → thiếu lấy đà (anticipation), khung trúng (impact) giữ lâu hơn, thu đòn (recovery) chậm dần.
4. **Phản ứng quái** chỉ là chớp + dời 2–4 điểm ảnh; chưa phân cấp rõ thường / nặng / chí mạng; chưa nảy, chưa nghiêng người.
5. **Thanh máu không có phần tụt dần** (damage lag) — mất máu nhìn không rõ.
6. **Đạn, độc, vùng kỹ năng**: cần rà lại theo YEU-CAU mục 4 (lõi–thân–đuôi, vòng xuất hiện–đỉnh–tan, độc chuyển động hữu cơ).
7. **Môi trường**: đã có một ít đom đóm/đèn ở làng (`village_scene.js`, `env_art.js`, `room_art.js`), các ải còn tĩnh; chưa có bóng chân (contact shadow) nhất quán.
8. **Màu**: cảnh nhiều chỗ tối/xỉn (làng ban đêm). YEU-CAU yêu cầu GIỮ bảng màu → không đổi bảng màu; chỉ được tăng độ đọc (viền, tương phản, ánh sáng đèn) nếu có lý do rõ.
9. Hiệu năng: `aimed()` tạo mảng mỗi lần gọi; `S.E.shift()` khi đầy — nhỏ, chỉ sửa nếu đụng tới.

## Chia việc (3 phiên song song)
- **vfx-chien-dau** (Phase 2): vấn đề 1, 2 (em bé + quái), 3, 4; số sát thương nếu cần.
- **vfx-ky-nang** (Phase 3): vấn đề 6, kiểm tra lại báo trước đòn quái theo YEU-CAU mục 3E.
- **vfx-the-gioi-ui** (Phase 4 + 5): vấn đề 5, 7, idle/chuyển động phụ, phản hồi nút/hồi chiêu/nhặt đồ.
Mỗi phiên tự làm Phase 6 (kiểm tra) cho phần của mình.
