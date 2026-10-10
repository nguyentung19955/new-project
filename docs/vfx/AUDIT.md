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

## Đã làm — kỹ năng (phiên vfx-ky-nang, 10/10/2026)
- **Tệp mới `game/js/fx_ky_nang.js`** (nạp sau `fx_chuong.js`): bọc thêm lên các hàm sẵn có, dùng chung kho hạt (`emit`) và kho hình (`add`) của `fx.js`, không tạo đối tượng hay dải màu mới mỗi hạt mỗi khung. Mọi số hạt nhân `G.VFX.hat`; rung/khựng đi qua `trauma`/`stop` của `fx.js` (đã tự nhân `G.VFX.rung`/`khung`).
- **Độc**: hào quang là 2–3 dải sương lục/tím bay vòng quanh thân, mỗi dải một tốc độ và nhịp phồng xẹp riêng (chậm, không đều), vết loang mờ dưới chân; hạt nhỏ nổi lên rồi tan (lục ngả tím — hồi máu vẫn lục sáng ngả trắng có dấu cộng nên không lẫn); lúc vừa dính độc có vòng tím lục quanh thân; mỗi nhịp sát thương độc thân "nhói" (vòng elip co về thân + bọt vỡ), có cho cả em bé (đọc `P.dotT`), tối đa 6 nhịp mỗi khung. Vũng độc của quái, vũng độc theo hệ và mây Độc chưởng có mảng tối trôi chậm, mép bò ra bò vào (vẫn điểm ảnh). Hạt độc cũ trên người thưa bớt để bù.
- **Đạn và tên**: mũi tên có lõi sáng ở mũi (chớp chữ thập theo nhịp, tên lớn to hơn), vệt sau tên nhỏ có thân sáng rồi đuôi chấm thưa, mỗi mũi tối đa 6 hạt bám đường bay; đạn trúng có vài tia văng tiếp theo hướng bay (`fx_dan.js` impact). Chưởng bay giữ hình lõi–vỏ–đuôi cũ.
- **Vòng phép AoE** (`fx.rune`): xuất hiện (nở lố 8%) → đỉnh (sáng, tia ở tâm) → tan (nở thêm, thưa điểm ảnh, nhấp nháy cuối); vòng ngoài, vòng chấm xoay ngược, ký tự xoay. Dùng ở nổ chưởng, Nổ lan, Nổ khói/Sốc nhiệt. Chỉ là hình: không đọc lại để tính trúng. Địa Chấn giữ hình cũ (đã có vòng sóng, thêm sẽ rối).
- **Chưởng** (`fx_chuong.js`): vòng phép tích lực dưới chân lớn dần, xoay nhanh dần, đầy thì trắng nhấp nháy (phần "báo trước" của chưởng mạnh, vàng cam điểm ảnh — khác vùng báo đỏ mịn của quái); vệt lửa và mây độc đập nhịp đúng lúc gây sát thương (đọc `z.tick`/`z.every`), tan bằng co lại + thưa điểm ảnh thay vì tắt phụt; mây "thở".
- **Bậc cường độ** (`fx.capDo` trong `fx_ky_nang.js`, một chỗ để chỉnh): thường (rung 0,14, khựng 45) < chí mạng (0,4, 115) < kỹ năng = chưởng thường (0,28, không khựng, hạt ×1,15) < tối thượng = chưởng tích lực (0,62, khựng 85, hạt ×1,7, chớp màn hình 0,2 theo màu hệ). Luồng phụ Tam xà dùng bậc thường. Nổ lửa ít khói hơn, khói toả ra mép để không che quái.
- **Báo trước đòn quái** (`bao_truoc.js`, rà theo YEU-CAU 3E): đã có hiện mượt, lấp dần, chớp lúc ra đòn (0,22 giây, vùng trúng chỉ có tác dụng một khoảnh khắc). Thêm: 15% cuối lòng vùng sáng lên và viền trắng dày dần (lấy đà); đường thẳng và hình quạt có mũi chữ V chạy từ gốc ra (thấy hướng đòn); đòn bị huỷ (quái chết/choáng) thì vùng mờ dần 0,16 giây thay vì tắt phụt. Màu đỏ giữ nguyên nên không lẫn với vòng phép vàng/lục/lam của mình.
- **Kiểm tra**: build; `rules.py` 82/82; `tests/vfx_ky_nang.py` (mới) 27/27 — không lỗi, trần hạt 400/hình 72, vòng phép tự tắt, `G.VFX.hat = 0` không sinh hạt độc, `G.VFX.rung = 0` không rung/chớp, bậc tăng dần, tên có trần hạt, vùng huỷ mờ rồi mất, chạy không vẽ không sinh hình, luật không đổi (đường bay chưởng và máu quái giống hệt khi có vẽ / không vẽ); `fx_check.py` 0 lỗi; `chuong.py` 94/94; `bao_truoc.py` 21/21; `linhkhi.py` 36/36; `ui_build.py` đạt. `perf.py --so`: trung bình 103–106% bản cũ, cảnh 14 quái cùng trúng độc chậm nhất ~117% (khoảng +0,4 ms/khung).
- **Ảnh tự xem** (Playwright, chụp cả lớp điểm ảnh và lớp giao diện): `docs/vfx/anh-ky-nang/` — chưởng ba hệ, tích lực, bắn tên thường/lớn/hệ độc, trúng độc, vũng độc so với vũng hồi máu, em bé trúng độc, Địa Chấn + Nổ lan, báo trước đòn quái. Chụp lại: `python3 tests/vfx_ky_nang_shots.py` (trong thư mục game). Không lỗi JS.
- **Còn để ý (không thuộc phần kỹ năng)**: mỗi nhịp sát thương độc/cháy vẫn làm quái mới chớp trắng cả người (do `G.damage` đặt `t.flash` và cử động 'hit' của monster_art) — nhịp độc nhìn như trúng đòn; nên cho đòn `src: 'dot'` chớp nhẹ hoặc nhuộm màu hệ thay vì trắng.
