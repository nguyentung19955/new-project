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

## Bám sát DCDW: tràn màn, tướng to, 5 bậc màu, Archfiend, đạn gọn (02/11/2026, phiên tự động)
Không chạy test. Đã chụp màn (390×844, 360×640, 430×932, màn chọn tướng, phóng to làn) xem bằng mắt qua http (file:// làm canvas không đo được ảnh) — không lỗi JS; chạy thử 2 bot tự chơi bằng node (co-op tới wave 32, PVP tới wave 15) không lỗi.

### Tóm tắt đối chiếu DCDW (chi tiết: `DOI-CHIEU-DCDW.md`)
- Đã đúng từ trước: 2 bàn 5×3, triệu hồi ngẫu nhiên đều trong bộ 5 (giá tăng dần), ghép cùng loại cùng sao → sao+1 loại ngẫu nhiên, tối đa 7 sao, đầy bàn phải ghép, nâng cấp cả LOẠI bằng mana, mana từ giết quái + thưởng wave, PvP 3 mạng, co-op 70 wave có trùm.
- Đã thêm: **Archfiend** (ô thẻ thứ 6), **5 bậc màu**, skill **VÀNG/ĐỎ** độc đáo, chọn mục tiêu + skill thành **dữ liệu**.
- Đã sửa: bố cục tràn bề ngang, tướng/bàn to, sao dạng pip, đạn gọn, tia LANCE dừng ở mục tiêu, hiển thị skill tiết chế.

### Đã làm
1. **Tràn màn** (ui.js `resize`, game.js `boCuc`): scale = rộng/390, chiều cao logic H = cao/scale (744–960). Bàn trên neo trên (y 92), bàn người chơi + Energy/SUMMON + thẻ neo đáy, khoảng giữa co giãn (dải thông báo wave nằm giữa khoảng này). Màn thấp hơn 744 logic mới giảm scale. Trừ safe-area 4 phía. Đổi cỡ giữa trận: bàn dưới dời theo, quái tính lại vị trí.
2. **Tướng + bàn to**: ô 56×54 (bước 58×56), bàn 302×180 (~77% bề ngang), làn x 12..60. Tướng cao 39px (rộng ≤ 50, chân cách đáy ô 9). Quái/trùm ×58/48 (thường ~27px, trùm ~48px). Thanh máu 24×3 / trùm 56×5.
3. **Đạn gọn**: `assets/v3/proj_<id>.png` (1 hàng 4 khung), chỉ khung 1↔2, dài 12px, xoay theo hướng bay, đầu đạn ở điểm bay; không trail/hạt. Tướng không có ảnh đạn → vạch ngắn màu hệ. Đạn phát đúng khung ra đòn (như cũ). Tia LANCE vẽ từ nòng **dừng ở mục tiêu**; quái bị xuyên chỉ chớp nhỏ.
4. **Sao 1–7**: pip ngôi vàng trên đầu (7★ đỏ cam), không hộp nền. Vòng dưới chân màu BẬC, đậm dần theo sao, vòng kép từ 5★. Tướng to dần 1.00 → 1.06.
5. **Hiển thị skill tiết chế**: biểu tượng 5px cạnh thanh máu quái (lửa, băng + số tầng, độc + số tầng, hack, truy nã, choáng) thay các hình vẽ quanh thân. Skill VÀNG/ĐỎ kích hoạt: chớp vòng màu bậc dưới chân + tên skill 0.6s.
6. **5 bậc màu** (`BAC` trong data.js): TRẮNG → LAM → TÍM → VÀNG → ĐỎ (Common/Rare/Epic/Legendary/Ancient). Màu khung + nền thẻ, tên trên thẻ, viền chân dung đội AI, vòng chân trên bàn; màn chọn tướng ghi tên bậc. Bậc KHÔNG ảnh hưởng tỉ lệ triệu hồi.
7. **Archfiend** (`ARCHFIEND` trong data.js): chọn 1 trong 2 ở màn chọn tướng (nhớ lựa chọn: localStorage `neon-grid.af`). Thẻ thứ 6 bên phải: chân dung tạm (portrait tướng có sẵn; có `assets/v3/archfiend_<id>.png` thì tự dùng), vòng hồi chiêu + số giây, giá Energy (tăng ×1.6 sau mỗi lần dùng).
   - OVERCLOCK: cả bàn +35% tốc đánh 6s, hồi 30s, giá 40 → 64 → 102...
   - FIREWALL: xoá hiệu ứng trùm trên tướng (HOT/BUG) + chặn chiêu trùm lên tướng 6s ("BLOCKED"), hồi 35s, giá 30 → 48 → 77...
   - Bot AI (PVP) và đồng đội (co-op) cũng dùng (`botAF`): FIREWALL khi ≥2 tướng dính chiêu trùm hoặc trùm sắp tung chiêu lên tướng; OVERCLOCK khi có trùm hoặc ≥8 quái. Ô thứ 6 trên HUD đội AI = Archfiend của AI (OVERCLOCK).
8. **Skill data-driven** (game.js): `MUC` (chọn mục tiêu), `DON` (kiểu ra đòn), `HIEU` (hiệu ứng khi trúng), `DAC_BIET` (skill riêng VÀNG/ĐỎ). Logic không còn nhắc tên tướng nào.

### Bảng 8 tướng (TẠM, sẽ đổi khi có bể tướng mới)
| Bậc | Tướng | Mục tiêu | Đòn | Skill |
|---|---|---|---|---|
| TRẮNG | SCORCH | đi đầu | đạn | `chay`: vệt cháy trên làn, đốt 3–4 quái / 0.5s |
| TRẮNG | FROST | đi đầu chưa lạnh | đạn | `bang`: tầng lạnh làm chậm, đủ 3 tầng vỡ băng gây sát thương vùng |
| LAM | VENOM | còn nhiều % máu nhất | 2 đạn | `doc`: tầng độc (tối đa 4), quái chết khi ≥3 tầng lan 2–3 quái |
| LAM | GLITCH | đi đầu chưa hack | đạn | `hack`: mỗi 3 đòn lộ điểm yếu +15–20% sát thương nhận, choáng 0.35s |
| TÍM | ARC | giữa đám đông | chém ngay | `chuoi`: mỗi 3 đòn sét nảy 2–3 quái |
| VÀNG | WARP | giữa đám đông | đạn | `hut` (trường hút gom quái) + **WARP GATE** (kiểu Brownie): ghép 2 WARP cùng sao → cả 2 biến mất, 1 đồng minh khác loại cùng sao được +1 sao **giữ nguyên loại** (không có thì ghép thường) |
| VÀNG | BROKER | đi đầu | đạn yếu | **MANA FEED** (kiểu Syrinx): mỗi 7s +4/7/11/16/22/29/38 Energy theo sao, +25% mỗi cấp nâng |
| ĐỎ | LANCE | máu cao nhất | tia dừng ở mục tiêu, xuyên 1–2 quái sau | **DEADLINE**: mỗi đòn thứ 4 ×3 (5★ ×3.5, 7★ ×4) xuyên 4 quái, kết liễu quái thường dưới 15–20% máu |

### Cách thêm tướng mới (chỉ thêm dữ liệu + ảnh, không sửa logic)
1. Ảnh vào `demo/assets/v3/`: `<anh>.png` (ảnh tĩnh) hoặc sheet `<anh>_idle_<dir>.png` / `<anh>_attack_<dir>.png` (dir = s, sw, w, nw, n), `portrait_<anh>.png` (chân dung thẻ), `proj_<anh>.png` (đạn, 1 hàng 4 khung, đầu đạn hướng phải). Thiếu ảnh nào thì code tự dùng dự phòng.
2. Thêm 1 mục vào `TUONG` trong `demo/js/data.js`, ví dụ:
   ```js
   spark: { bac: 'lam', ten: 'SPARK', chuc: 'ARC GUNNER', hanh: 'Voltage', kieu: 'Static', mo: 'Every 3rd shot chains.',
     dmg: 20, cd: 0.9, muc: 'ngauNhien', hit: 'electric',
     don: { k: 'dan', toc: 900 },
     hieu: [{ k: 'chuoi', moi: 3, nhay: { 1: 1, 4: 2 }, r: 80, he: 0.4 }] },
   ```
   - `bac`: trang | lam | tim | vang | do · `hanh`: màu VFX (HANH) · `anh`: tên file ảnh nếu khác id · `xoay: true` nếu là drone xoay bằng code.
   - `muc`: dau | dongQuai | mauCao | mauThap | mauDay | chuaHieu (+ `mucHieu`: chill/hack/doc/chay) | ngauNhien.
   - `don`: `{ k: 'dan', toc, so }` · `{ k: 'chem' }` · `{ k: 'tia', xuyen }`.
   - `hieu`: danh sách `chay` | `bang` | `doc` | `hack` | `chuoi` | `hut` | `truyNa` kèm tham số.
   - `dac` (VÀNG/ĐỎ): `taoMana` | `cayGhep` | `phatNap` kèm `ten` (tên hiện khi kích hoạt).
   - Tham số theo sao: số, hoặc `{ 1: a, 3: b, 5: c }` (lấy mốc sao cao nhất ≤ sao hiện tại).
3. Muốn có cơ chế mới hoàn toàn (vd. biến hình kiểu Daron/Moa, sao chép kiểu Shamash): thêm 1 loại vào `DAC_BIET` trong game.js (`moiDon` / `capNhat` / `khiGop`) một lần, sau đó mọi tướng dùng lại bằng dữ liệu.
4. Archfiend mới: thêm 1 mục vào `ARCHFIEND` (k = tocDanh | tuongLua, hoặc thêm loại mới trong `dungAF`).

### Còn lại / ghi chú
- Chân dung Archfiend đang mượn portrait WARP/GLITCH — cần ChatGPT vẽ `archfiend_overclock.png`, `archfiend_firewall.png`.
- Cân bằng skill mới (MANA FEED, DEADLINE, WARP GATE) là số thử nghiệm.
- Bộ test cũ `tests/demo-hop-tuong` vẫn viết cho bản cũ — chưa chạy, chưa sửa.

## Bố cục DCDW, tướng đầy ô, animation ổn định, đạn từ nòng, bậc rõ, bọ + tinh anh (02/11/2026, phiên tự động)
Làm theo phản hồi người dùng: "chưa giống Defense War", animation giật, đạn không ra từ nòng, không nhìn ra bậc. Không chạy test. Đã chụp màn 390×844, 390×700, màn chọn tướng, phóng to bàn (điểm nòng 8 hướng) và tự xem; chạy thử bot tự chơi bằng node (co-op tới wave 30–39, PVP tới wave 17–21) không lỗi.

### Đã làm
1. **Bố cục DCDW** (data.js `CAU_HINH`, game.js `boCuc`): bỏ khoảng trống tím giữa 2 bàn — chiều cao dư dùng làm **ô cao hơn** (ô rộng 62, cao 58–78 tuỳ màn: 844 → 62×78, 700 → 62×58). Bàn 332px (~85% bề ngang), làn quái hẹp lại x 8..48. Khoảng giữa 2 bàn còn ~44px (cửa làn + nhãn PLAYER). HUD dưới gọn lại (cao 186). Màn 700 vẫn vừa không thu nhỏ.
2. **Tướng đầy ô**: cao = min(0.8 × chiều cao ô, 58) × hệ số riêng, neo chân cách đáy ô 7px, rộng ≤ ô + 8. Hệ số (`TUONG[id].co`): scorch 1.08, lance 1.12, broker 1.08, venom 1.14, arc 0.90, warp 0.92, frost 0.95, glitch 0.96. Mọi hướng dùng chung 1 tỉ lệ → không đổi cỡ khi quay.
3. **Ô/bàn sáng hơn**: tile.png phủ lớp xám-xanh (screen) + viền ô sáng, nền bàn sáng hơn; vẫn tông neon.
4. **Animation ổn định**: `CAU_HINH.SHEET_TUONG = false` → TẮT sheet idle/attack (không nạp luôn). Tướng luôn là **ảnh tĩnh theo hướng** (5 hướng + lật gương, WARP xoay). Đánh = giật lùi 2px ngược hướng bắn trong 90ms (dịch nguyên khối) + chớp đầu nòng 70ms + đạn bay. Nhún 0.8px khi đứng. Đạn ra 50ms sau khi quay mặt.
   - **Chờ ảnh đánh**: có file `demo/assets/v3/<anh>_atk_<dir>.png` (dir = s, sw, w, nw, n; cùng khung 112 như ảnh tĩnh) thì tự đổi sang ảnh đó ~120ms lúc ra đòn; chưa có thì bỏ qua.
   - Ảnh ChatGPT có vài mảnh vụn rời (lance_nw, venom_sw): code chỉ xoá mảng rời < 2% hình khi nạp, không sửa hình chính.
5. **Đạn từ đầu nòng**: bảng `TUONG[id].nong` (toạ độ trong ảnh 112, 5 hướng; lật gương đối xứng x; ARC = mũi kiếm; WARP = lõi, xoay theo góc). Đo bằng script (điểm xa nhất của vũ khí theo hướng nhìn trong vùng ước lượng tay), rồi chụp đánh dấu chấm đỏ trên cả 8 hướng để kiểm tra. Đạn, tia LANCE, chớp nòng đều xuất phát từ điểm này (render.js `diemNong` → `GAME.nongHook`).
6. **Bậc nhìn ra ngay**: đế tròn dưới chân tô đặc màu bậc (trắng bạc / lam / tím / vàng kim / đỏ) có viền tối; 5★+ thêm vòng ngoài; VÀNG/ĐỎ lấp lánh nhẹ trên đế; viền sáng 1px màu bậc quanh hình tướng. Thẻ, nền chân dung, tên vẫn theo màu bậc.
7. **Xếp bậc 8 tướng (người dùng chốt)** + skill theo mục III bản thiết kế:
   | Bậc | Tướng | Mục tiêu | Skill |
   |---|---|---|---|
   | TRẮNG | SCORCH | đi đầu | vệt cháy trên làn |
   | TRẮNG | FROST | đi đầu | làm chậm (10% → 12.5%/tầng từ ★3), 3 tầng vỡ băng |
   | TRẮNG | ARC | gần tướng nhất | chém, mỗi 3 nhát sét nảy 1 (★3: 2) |
   | TRẮNG | VENOM | máu cao nhất | độc cộng dồn tối đa 5 (★3: 6), ★7 chết lan 2 |
   | LAM | LANCE | máu cao nhất | tia xuyên 1 (★3: 2); ★7 mỗi phát 3 = FOCUS ×2.5 |
   | TÍM | WARP | đi cuối | cầu hư không đẩy lùi (★3 đẩy cả quái quanh, ★5 thêm trường hút, ★7 đẩy mạnh; trùm kháng, SHELL kháng 60%) |
   | VÀNG | BROKER | đi đầu | quái chết gần HÀNG của Broker → Energy (trần mỗi wave); ★3 **TRADE** (chọn ô kề: tướng đó hạ quái +2 Energy trong 8s, hồi 20s); ★5 **SWAP** (đổi chỗ với tướng cùng sao, hồi 20s); ★7 **TAKE PROFIT** (ghép ở ô kề hoàn 30% giá summon gần nhất, hồi 10s) |
   | VÀNG | GLITCH | đi đầu chưa đánh dấu | đánh dấu (+10–15% sát thương nhận), mỗi 6 đòn khoá (choáng 0.6s, không lên trùm); ★3 **COPY BUFFER** (chọn ô kề: +35% tốc đánh 5s, hồi 15s); ★5 **PACKET SWAP** (ghép cạnh GLITCH → chọn 1 trong 2 loại, 4s); ★7 **REROLL** (1 lần / GLITCH: rút lại 2 lựa chọn) |
   - **UI chọn ô**: tướng VÀNG có huy hiệu tia sét góc phải trên ô (vàng nhịp sáng = sẵn sàng, vòng xám = đang hồi). **Chạm** (không kéo) tướng → hàng nút kỹ năng (tên + READY / số giây). Chạm nút → các ô hợp lệ viền vàng, ô khác tối; chạm ô để dùng, chạm chỗ khác để huỷ. PACKET SWAP: 2 chân dung + REROLL hiện trên ô ghép, thanh đếm giờ; hết giờ giữ kết quả đang hiện.
   - WARP GATE / MANA FEED / DEADLINE cũ bỏ (không còn tướng ĐỎ trong 8 tướng).
8. **Quái mới**: 4 BỌ thay 3 quái cũ (`QUAI`: scuttle, dart (ra đợt 3 con), gnat, shell; ảnh `bug_<id>_walk.png`, 10fps, cao 26–30px). 4 TINH ANH từ wave 5 cả PVP và co-op (`TINH_ANH`, `soTinhAnh`): PRISM MANTIS (phản 1 đòn trực tiếp mỗi 6s, báo lục giác co 0.7s, hiện "REFLECT"), JAMMER BEETLE (mỗi 12s khoá kỹ năng 1 tướng 3s, báo anten đỏ + đường đứt nét nối ô 1s, tướng hiện "LOCK"), BROOD CARRIER (chết tách 3 DART, gần chết rung nhẹ), PHASE CICADA (mỗi 9s né đạn 1.2s, vẫn dính DoT, báo vòng đứt nét 0.8s, mờ tím khi né, hiện "MISS"). Cao 38–40px. Archfiend FIREWALL giải + chặn khoá của JAMMER.
9. **3 trùm chỉnh theo mục VII**: FIREWALL = FIRE SHIELD (khiên trước thân 4s giảm 60% đòn thường, tia + DoT xuyên qua; báo 1.2s) + HEAT LOCKDOWN (báo 1.5s). OVERCLOCK = OVERDRIVE (tự +50% tốc chạy 4s, báo 1s) + CLOCK PULSE (bọ +35% tốc 5s, báo 1.3s). CORRUPTOR = DATA INFECTION (2 ô, đánh chậm 33% 5s, báo 1.5s) + COCOON (kén 4s: không gây đủ 5% máu tối đa thì trùm hồi 8%, vòng hiện tiến độ phá).

### Còn lại / ghi chú
- Cần ChatGPT vẽ ảnh ra đòn `<anh>_atk_<dir>.png` (5 hướng/tướng, cùng khung + tỉ lệ + neo chân với ảnh tĩnh) — code đã sẵn. GLITCH còn thiếu 2 hướng sw, nw (đang dùng hướng gần nhất).
- Muốn bật lại sheet cũ: `SHEET_TUONG: true` trong data.js (không khuyến nghị).
- Cân bằng (máu tinh anh, Energy Broker, giá trị kỹ năng) là số thử nghiệm. Bot AI chưa dùng kỹ năng chủ động VÀNG.
- Bộ test cũ `tests/demo-hop-tuong` vẫn viết cho bản cũ — chưa chạy, chưa sửa.
