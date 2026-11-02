# Tiến độ: hình v3 HIGH TOP-DOWN (02/11/2026)

Theo docs/demo-hop-tuong/tu-van-chatgpt-dac-ta-v3-topdown.txt, nghiem-thu-v3b (ĐẠT), mockup-v3c-8tuong.png.

## Đã làm
1. `demo/assets/v3/`: 8 ảnh tướng tĩnh (scorch từ scorch_master_82, frost, arc, lance, warp, broker, glitch, venom) — cắt viền alpha (≤8), thu nhỏ cao 128px, giữ alpha, 22–35KB/ảnh; `tile.png` 96×96 từ tile_normal_b. Chỉ cắt/thu nhỏ ảnh ChatGPT, không vẽ thêm. README trong thư mục.
2. render.js: tướng vẽ bằng ảnh v3 tĩnh, cao 29px trong ô 46px (rộng ≤ 40px), chân cách đáy ô 10px; bóng ellipse 16×5 #07090F alpha 0.2 do code vẽ; nhãn sao ở đỉnh ô + 2 (trên đầu, không che mặt). Hoạt ảnh tạm bằng code: nhún 0–1.5px chu kỳ 0.9s lệch pha theo ô; khi đạn phát: giật lùi 1.5px ngược hướng bắn + chớp sáng nhẹ (0.16s). Không uốn/xoay/biến dạng ảnh. Xuất hiện: hiện dần 0.3s.
   - Đã viết sẵn nhánh sheet: có `demo/assets/v3/<id>_idle.png` / `_attack.png` (1 hàng, khung vuông, số khung = rộng/cao) thì ưu tiên sheet, idle 9fps lặp, attack 14fps; tỉ lệ + điểm neo tự đo từ khung đầu idle (phần hình cao 29px, đáy phần hình = chân).
   - Thứ tự dự phòng: sheet v3 → ảnh tĩnh v3 → sheet v2 → ảnh cũ → hình vẽ code.
3. Bàn: tile v3, khe giữa ô 1px (chỉ nới ảnh tile, lưới logic giữ nguyên); khung graphite tối mảnh (#1a1f2b, viền #3b4356), bỏ viền neon; chỉ nhấn màu nhỏ ở 4 góc (người chơi magenta, AI cyan).
4. Tầm bắn: bỏ giới hạn tầm — mọi tướng trên bàn bắn được mọi quái trên làn của chính bàn đó, giữ cách chọn mục tiêu theo kiểu từng tướng (game.js `chonMuc`). Khi kéo tướng: tô sáng làn thay cho vòng tầm bắn. Điểm phát đạn (`nong`) dời về giữa thân tướng v3.
5. Đã chụp màn 390×844 xem bằng mắt: 2 bàn đủ tướng, sao không che mặt, mọi cột đều bắn. Không chạy test (chưa được cho phép).

## Còn chờ ảnh (ChatGPT vẽ, thả vào demo/assets/v3/)
- `<id>_idle.png` (8 khung) và `<id>_attack.png` (12 khung) cho scorch, frost, arc, lance, warp, broker, glitch, venom — khung vuông 128, chân (64,108).
- Quái/boss top-down (drone, skitter, bulwark, 3 boss), lane top-down, nền dọc trống, nhãn sao, VFX top-down.
- Thẻ bài/chân dung vẫn dùng ảnh cũ.

## Ghi chú
- Bộ test cũ tests/demo-hop-tuong viết cho màn ngang — cần viết lại khi người dùng cho chạy test.

## Tướng quay 8 hướng theo quái (02/11/2026)
Theo tu-van-chatgpt-huong-xoay-tuong.txt (phương án lai A+B+C), mockup-lance-8huong.png.

1. Quy ước ảnh trong `demo/assets/v3/` (có tới đâu dùng tới đó):
   - Ảnh tĩnh mỗi hướng `<id>_<dir>.png`, dir ∈ s, sw, w, nw, n (khung vuông, chân giữa-đáy).
   - Sheet `<id>_idle_<dir>.png` (8 khung, 9fps lặp) và `<id>_attack_<dir>.png` (12 khung, 14fps), 1 hàng, khung vuông, số khung = rộng/cao.
   - SE/E/NE = lật gương ngang SW/W/NW quanh tâm ô (`ctx.scale(-1,1)`); S, N không lật.
   - Thiếu hướng → hướng gần nhất có ảnh (s→sw→w; sw→s→w; w→sw→nw→s; nw→n→w; n→nw→w; nên GLITCH sw→s, nw→n). Không có hướng nào → sheet chung `<id>_idle.png` / ảnh tĩnh `<id>.png` như cũ. Thiếu sheet hướng → ảnh tĩnh hướng đó + nhún/giật lùi bằng code (giật lùi theo ngược hướng nhìn).
   - WARP (drone): chỉ dùng sheet `warp_idle_s.png` / `warp_attack_s.png` (không có thì `warp.png`), xoay cả khung quanh tâm phần hình theo góc tới mục tiêu, lerp góc mượt (hệ số ~10/s); ảnh gốc coi như nhìn S. Vẫn quay khi đang đánh.
   - Số khung đọc từ ảnh (rộng/cao) nên sheet attack 8 khung hiện có vẫn chạy (14fps, đạn phát ở ~khung 6).
2. Chọn hướng (game.js `capNhatHuong` / `chonHuong`, chạy cho cả bàn người chơi và bàn AI): d = (quái − giữa thân tướng) theo toạ độ màn hình, a = atan2, sector 45° gần nhất (E=0°, S=90°, W=180°, N=−90°); hysteresis 10° quanh biên; cooldown đổi hướng 120ms; mục tiêu dò lại 20 lần/giây bằng `chonMuc`; đầu mỗi đòn đánh quay ngay về mục tiêu rồi khoá hướng tới hết khung tác động (+0.1s); không có mục tiêu > 0.8s thì về S. Trạng thái trên tướng: `v.hg` (0=E…2=S…4=W…6=N), `v.goc` (rad, cho WARP).
3. Tỉ lệ/điểm neo (render.js `veHuong`): tỉ lệ chung đo theo hướng S (khung đầu idle_s hoặc ảnh tĩnh s: phần hình cao 29px, rộng ≤ 40px), quy theo cạnh khung nên mọi hướng cùng cỡ; mỗi hướng tự đo khung đầu, đáy phần hình = chân đặt cùng 1 điểm (chân cách đáy ô 10px) → không nhảy khi đổi hướng; nếu hướng nào rộng quá 40px thì thu riêng hướng đó.
4. Đã chụp màn 390×844 xem bằng mắt (không chạy test): tướng nhìn về phía làn bên trái, WARP xoay theo quái, không lỗi JS.

### Còn chờ
- Ảnh hướng/sheet idle + attack 5 hướng đã đủ cho 7 tướng (GLITCH 3 hướng), WARP idle/attack S — code đã dùng.
- Nếu lật gương làm sai tay cầm vũ khí ở tướng quan trọng thì vẽ riêng se/e/ne (cần thêm quy ước tên nếu làm).

## Độ đọc, thẻ, trúng đòn, animation (02/11/2026, phiên tự động)
Theo docs/demo-hop-tuong/tu-van-chatgpt-cham-ban-choi-8huong.txt — các mục [CODE] của P0.1, P0.2, P0.3, P0.4, P1.3, P1.4, P2.2. Không chạy test; đã chụp màn 390×844 (và phóng to bàn) xem bằng mắt, không lỗi JS.

1. P0.1 (render.js): tướng cao 32px (từ 29), rộng ≤ 40px trong ô 46 (chừa ≥3px mỗi bên); chân cách đáy ô 8px; nhãn sao tâm ở đỉnh ô + 1 (không che mặt). Điểm phát đạn / góc nhìn (game.js `nong`, `gocTo`) dời theo giữa thân mới.
   - Sheet attack ChatGPT vẽ nhỏ hơn idle ~0.72 (đo khung đầu: idle ~83px, attack ~60px trên khung 112) → code quy về cùng cỡ theo chiều cao khung đầu, đáy khung đầu = chân (giới hạn tỉ lệ 0.8–1.6). WARP không cần.
2. P0.2: thẻ nền sáng theo màu hệ, chân dung 53×66 dùng `v3/portrait_<id>.png` (id `miner` thử thêm `portrait_broker.png`), không có thì ảnh cũ. LV 10px, tên 9.5px, giá 11px (số tabular). Đủ tiền: viền + glow màu hệ, giá vàng ▲ xanh; thiếu: chỉ chân dung tối, giá đỏ nhạt, chữ vẫn đọc được. Icon đội AI cũng dùng portrait v3.
   - SUMMON: đủ tiền = sáng + nhịp phát sáng 1.4s; thiếu/đầy ô = nền xám tối, giá đỏ nhạt; nhấn = lún 2px + scale 0.97 (lớp `.ep` qua pointerdown cho mobile).
3. P0.3: cỡ quái qua `QUAI.co` (×0.686): thường 32→~22px, nhanh 29→~20px, trâu 41→~28px, boss 58→~40px. Dùng `v3/enemy_<kind>_walk.png` / `v3/boss_<id>_walk.png` (1 hàng khung vuông, 10fps, nhìn xuống = hướng đi; cao phần hình khung đầu = cỡ, đáy = chân; choáng thì đứng khung 0); thiếu thì giữ sheet v2 / ảnh cũ / vẽ code. Thanh máu thường 20×3, boss 48×5.
4. P0.4: trúng đòn dùng `v3/vfx_hit_<loai>.png` (6 khung, 120ms, 22px / chí mạng 30px, cộng sáng): lance/broker/glitch/warp→kinetic, venom→kinetic + ánh xanh độc, frost→frost, scorch→flame, arc→electric. Quái chớp trắng 60ms (bóng trắng từ alpha của khung đang vẽ). Số sát thương sống 0.55s, bay lên 12px chậm dần. Hit-stop chỉ cho LANCE (30ms, kèm giật màn ≤2px) và ARC nhịp chuỗi thứ 3 (25ms) — `S.hitStop` trong game.js đứng cả bàn đó. Tối đa 16 tia trúng đòn cùng lúc (`C.FX_NHO_MAX`); chỉ sinh khi trúng thật.
5. P1.4: summon — cổng `v3/vfx_summon.png` dưới chân (~180ms), tướng phóng đều 0.85→1.0 trong 150ms quanh chân + hiện dần. Merge — 2 tướng cũ (ô kéo + ô đích) thu nhỏ đều và trượt vào tâm ô đích trong 110ms, rồi tướng mới bật ra 0.85→1.08→1.0 (130ms); `v3/vfx_merge.png` chạy 240ms. fx `gop` giờ mang `tu` (ô nguồn) + `cu` (ảnh chụp 2 tướng cũ).
6. P1.3 (css): wave 20px, nhãn 9px, HOSTILES 10/11px, boss 11px; số tabular. "BOSS IN 1–2 WAVES" đổi vàng + nhịp chậm 1.6s, "BOSS LIVE" nhịp chậm 1.2s (bỏ nhấp nháy steps). Icon đội AI 22×22.
7. P2.2 animation tướng: attack 3 pha — khung 0–2 chuẩn bị, khung ra đòn 3 giữ thêm 75ms (`C.GIU_KHUNG`), rồi thu đòn; đạn/đòn phát đúng lúc vào khung 3 (`C.TAC_DONG` = 3/14s); số khung đọc từ ảnh nên sheet 12 khung sau này tự dùng. Giật lùi 2px ngược hướng nhìn lúc ra đòn (giữ trong lúc giữ khung, về trong 90ms) cho cả sheet lẫn ảnh tĩnh. Idle 8fps, lệch pha theo uid từng tướng. Quay > 90° chen 1 khung hướng trung gian ~70ms (ảnh hướng đó/lật gương, không xoay ảnh).

### Còn lại / ghi chú
- Hit-stop chỉ đứng bàn có đòn mạnh (bàn kia vẫn chạy) — 25–30ms nên khó thấy lệch.
- Chữ "RANK n" khi merge vẫn hiện 0.6s, đè nhẹ nhãn sao ô trên.
- Chưa làm P1.1/P1.2/P1.5/P2.1/P2.3.

## Chế độ CO-OP kiểu Defense War (02/11/2026, phiên tự động)
Theo tu-van-chatgpt-phan-tich-dcdw.txt (mục co-op 12, wave pacing: trùm mỗi 10 wave, 70 wave). Không chạy test; đã chụp màn 390×844 xem bằng mắt (cả CO-OP lẫn PVP), không lỗi JS; có chạy thử giả lập cân bằng bằng node (2 bot tự chơi).

1. Màn chọn tướng: thêm 2 nút chế độ **CO-OP** (mặc định) và **PVP** (AI MIRROR như cũ). Nhớ lựa chọn cuối (localStorage `neon-grid.mode`, bọc try/catch). Dòng hướng dẫn đổi theo chế độ.
2. CO-OP: bàn trên là **ALLY** (đồng đội AI, màu cyan giữ nguyên), bàn dưới là người chơi. Quái đi **một đường chung**: sinh ở đầu làn trên → hết làn trên → đường nối → hết làn dưới → mới trừ mạng. Mỗi bàn bắn quái đang ở làn của mình (quái chuyển xuống giữ nguyên máu + hiệu ứng; đạn đang bay theo nó thì huỷ). Mạng **dùng chung 10** (quái thường lọt −1, trùm lọt −3). Không thắng do AI chết; hết mạng = thua; dọn sạch wave 70 = thắng.
   - Đường nối giữa 2 làn vẽ bằng cùng thân làn đã có (ảnh `v2/lane_straight.png` nếu có), phủ cửa thoát làn trên + cổng làn dưới để thành 1 đường liền.
3. Nhịp wave (tất cả núm chỉnh ở `COOP` cuối data.js, có chú thích): số quái 6 → ~41; máu quái ~41 (wave 1) → ~96 (10) → ~600 (30) → ~3.4k (50) → ~19k (70); SKITTER từ wave 4, BULWARK từ wave 8, tỉ lệ tăng dần; tốc độ +0.5%/wave (tối đa +30%). Trùm mỗi 10 wave: FIREWALL → OVERCLOCK → CORRUPTOR → lặp vòng 2 (máu × 1.3 mỗi vòng); **wave 70 = FINAL BOSS** (CORRUPTOR, máu ×2, to hơn). Nghỉ 2.5s giữa các wave; thưởng Energy hết wave cho cả 2 bàn. Cả đường ~34 giây cho quái thường (`THOI_GIAN_DUONG`).
4. Nút tốc độ: 1x → 2x → 3x (cả 2 chế độ).
5. Đồng đội AI (`botCoop` trong game.js): mỗi 1.2–2s làm 1 việc — ưu tiên ghép cặp sao thấp nhất; còn ô thì chỉ triệu hồi (giữ Energy, không nâng cấp); bàn đầy mới nâng cấp loại tướng mạnh nhất trên bàn. Có Energy riêng (giết quái + thưởng wave). Để người chơi còn quái mà bắn: AI chỉ đặt tối đa `aiOToiDa(w)` tướng (2 ở wave 1 → đủ 15 ô từ wave 39) và sát thương AI × 0.35 (`AI_SAT_THUONG`).
   - Giả lập 2 bot: đi tới wave ~45–59 trong ~25 phút; phần sát thương của bàn dưới tăng dần (~0% đầu game → ~50–65% từ wave 45). Người chơi thật ghép khéo hơn bot nên có thể qua 70.
6. HUD co-op: `WAVE x/70`, `CORE x/10` (đỏ khi ≤3), `BOSS IN n WAVES` / `FINAL BOSS IN n WAVES`, HOSTILES = quái cả 2 làn + chưa sinh. Nhãn bàn trên "ALLY", bỏ 3 vạch mạng riêng. Màn kết quả: wave đạt được /70, số quái diệt, kỷ lục riêng co-op (`neon-grid.best.coop`), **sát thương từng tướng của người chơi** (thanh màu hệ) + tổng YOU/ALLY, nút RETRY / CHANGE SQUAD.
7. PVP giữ nguyên như cũ (bot cũ, 3 mạng, thắng khi AI MIRROR hết mạng).

### Ghi chú / còn lại
- Đầu game (wave 1–7) đồng đội AI vẫn dọn gần hết quái; muốn người chơi bắn nhiều hơn thì giảm `aiOToiDa` hoặc `AI_SAT_THUONG`.
- Trùm cuối wave 70 rất trâu (giả lập 2 bàn full 7 sao vẫn để lọt 1 lần) — chỉnh `CUOI` nếu quá khó.
- Chưa có assist/ping giữa 2 bàn, chưa có mốc thưởng 10/20/30/50/70.
