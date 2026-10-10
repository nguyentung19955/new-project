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

## Đã làm — chiến đấu (phiên vfx-chien-dau, 10/10/2026)
- **Vệt vũ khí thật** (`fx.js` trailStep/trailDraw, `hero_tinhlinh.js` tip, `weapon_art.js` tipLen): mỗi bước hỏi chỗ cầm, hướng, độ dài vũ khí ở khung đang vẽ, nhớ 12 điểm trong mảng vòng dùng lại; vẽ dải bám cung quỹ đạo (nội suy theo góc, không nối thẳng hai mũi), đầu sáng – thân màu hệ – đuôi tối thưa điểm ảnh, tô bằng hàng điểm ảnh nên cạnh sắc. Bậc: thường / nhát kết + búa + quét giáo (viền tối, dài hơn) / chí mạng (đổi vàng) / chiêu đặc biệt. Chỉ ghi trong đoạn vung qua vùng đánh. Kiếm, búa, giáo quét có vệt; giáo đâm giữ vệt đâm cũ; cung giữ nguyên. Có vệt thật thì bỏ trăng khuyết vẽ sẵn của kiếm/búa; `G.VFX.vet = 0` thì quay về hình cũ. Vệt khựng chậm theo hit-stop.
- **Nhịp đòn em bé** (`hero_tinhlinh.js` nhip): tới tư thế lấy đà rồi giữ lâu hơn, vung nhanh dần, giữ khung trúng thêm (0,43–0,53 thời gian đòn), thu đòn chậm dần. Tổng thời gian, lúc gây sát thương (0,45) không đổi; cung và quét vòng giữ cũ.
- **Nhún co giãn** (`fx.js` springStep, fx.xf; `combat.js` chỉ gọi xf khi vẽ): lò xo nhỏ trên mỗi nhân vật, biến dạng tối đa 13% × `G.VFX.nhun`, co giãn theo nấc 1/32. Em bé: bật lộn, chạm đất, dừng chạy, quay đầu, lấy đà, ra đòn, trúng đòn. Quái: bẹp theo hướng đánh, nghiêng, nảy; quái kiểu cũ nhún khi lấy đà (quái mới đã có cử động lấy đà/ra đòn riêng trong monster_art); quái kiểu cũ chết thì phồng – co lại.
- **Phản ứng quái phân cấp** (`fx.js` hit, `mobs.js`): thường / nặng (búa, nhát kết, đòn chết) / chí mạng: chớp trắng 0,55/0,7/0,85, nghiêng 1,5/3,5/5 độ, nảy 2–3 điểm ảnh, đòn nặng thêm vòng mảnh, chí mạng thêm vòng trắng thứ hai. Quái chết tan thành vài hạt điểm ảnh. Trùm chỉ nhún 35%, không nảy.
- **Rung/khựng**: nhân `G.VFX.rung`, `G.VFX.khung`; nhiều quái trúng cùng một nhịp thì rung, giật giảm dần (1/(1+1,5n)), từ con thứ 4 bớt nửa số hạt; hit-stop vẫn giữ nút bấm (đã có).
- **Số sát thương**: bật to (0,07 giây) rồi lắng, bay lên chậm dần, rơi nhẹ (tối đa 18 điểm ảnh/giây), co và mờ lúc cuối; viền tối quanh chữ cho mọi số; chí mạng to hơn (13), rung nhẹ lúc bật.
- Kiểm tra: build, `rules.py` 82/82, `fx_check.py` 0 lỗi, `moves.py` 93/93, `anim_smoke.py` không lỗi, `ui_build.py` đạt. Đã chụp từng khung bằng Playwright trong ải 1-1 (kiếm, búa, giáo, chí mạng lửa, Trảm Nguyệt, tắt hết G.VFX) và tự xem; không lỗi JS.
- Còn để ý: quái mới chớp trắng suốt lúc khựng hình (có từ trước, do cử động 'hit' của monster_art); vệt chiêu Trảm Nguyệt khá to.
