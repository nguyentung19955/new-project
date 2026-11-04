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

## Đường quái vòng bàn, thanh Round, khay lõm, hàng dưới DCDW, kéo thả, nhịp đánh, cut-in (02/11/2026, phiên tự động)
Làm theo mục G của `QUAN-SAT-10-VIDEO-DCDW.md` + P0/P1 của `tu-van-chatgpt-animation-dcdw.txt`. Không chạy test. Đã chụp màn 390×844 (PVP + CO-OP), 390×700, 390×960, màn chọn tướng, kéo thả, cut-in Archfiend / tướng VÀNG / trùm, màn giới thiệu trùm co-op — tự xem, không lỗi JS; chạy thử bot tự chơi bằng node (co-op tới wave 46, PVP tới wave 16) không lỗi.

### Đã làm
1. **Đường quái vòng quanh bàn như DCDW** (game.js `boCuc`, `dungBan`): mỗi bàn có hành lang sàn ôm mép TRÁI (x 4..38) và mép DƯỚI bàn. Quái sinh ở góc trên trái → đi xuống dọc mép trái → rẽ chạy dọc mép dưới → tới **cổng ở góc phải** (mất mạng khi tới cổng). Bỏ làn dọc riêng.
   - CO-OP: **một hành lang trái chung** xuyên qua cả 2 bàn (đoạn cạnh bàn trên thuộc đồng đội, tới ngang đỉnh bàn dưới thì quái chuyển sang bàn mình), rồi chạy dưới bàn dưới tới cổng.
   - Lệch ngang của quái vuông góc với hướng đi (đi thành dòng cả đoạn dọc lẫn ngang). Ảnh bọ/tinh anh/trùm **xoay nguyên ảnh** theo hướng đi, góc mượt ở chỗ rẽ (không méo hình).
   - Tầm bắn: mọi tướng bắn mọi quái trên đường của bàn mình; "đi đầu" = gần cổng nhất **theo quãng đường** (giữ `q.d`). Thời gian đi hết đường giữ như cũ (tốc độ nhân theo độ dài đường).
   - **Cổng**: avatar Archfiend nhỏ (tròn, viền màu Archfiend; vòng trắng = thời gian hiệu lực khi đang bật) + **3 trái tim** (PVP) / 1 tim + số mạng chung (CO-OP); chớp đỏ khi mất mạng. Avatar cắt vùng mặt từ `cutin_<af>.png` (toạ độ `ARCHFIEND[id].mat`), có `archfiend_<id>.png` thì dùng ảnh đó.
2. **Thanh giữa mỏng** (cao 24) giữa 2 bàn: PVP = "ROUND N" + đồng hồ giây của round (hoặc **tên trùm** khi round trùm) + **cờ đầu hàng đỏ** bên phải (nút 44×36, mở bảng tạm dừng có QUIT). CO-OP = dải đèn đỏ chạy + "BOSS IN n WAVES" / tên trùm; **WAVE x/70 lớn** ở góc trên trái. Dải báo round/trùm đè tạm lên thanh này rồi tắt.
3. **Bàn trong khay lõm**: vành vát (tối trên, sáng dưới), lòng khay tối, ô gần vuông **64×70** (khe 3px rõ), tile.png phủ nhẹ (tối hơn sàn). **Sàn sáng hơn ô**: graphite từ vân tile.png phủ sáng + vi mạch cyan rất mờ (< 5% phát sáng); hành lang = tấm lát hơi tối hơn sàn + vạch nối tấm + mũi tên đỏ rất mờ chỉ hướng. Bỏ mưa + nền hẻm tím.
   - Có `demo/assets/v3/san_<x>.png` (vân sàn, lặp ô 96px) / `khay_<x>.png` (kéo vừa bàn) thì tự dùng — x theo thứ tự `1, 2, neon, graphite, circuit, steel, tech, ice, sand, a, b`; ảnh thứ 1 tìm được = bàn mình, thứ 2 = bàn trên.
4. **Hàng dưới như DCDW**: ô **MANA** (giọt tím + số) bên trái; nút **SUMMON** tím sáng to ở giữa (160×62, giá có giọt mana); nút tốc độ / tạm dừng gọn 44×44 bên phải. 5 thẻ 57×106: viền màu bậc mảnh, chân dung rõ, **LV**, tên chữ trắng, giá nâng cấp; **số bản trên bàn** (góc trên trái), huy hiệu xanh **"+N"** = số cấp nâng được ngay với mana hiện có, **"+MAX"** khi tối đa. Thẻ **Archfiend** to hơn (71×110) viền tím sáng bên phải. Biểu tượng tia sét Energy đổi thành **giọt mana tím** ở mọi nơi.
5. **Kéo thả**: ghost tướng dưới ngón; ô nguồn viền **CAM**; ô ghép được (cùng loại cùng sao) viền **xanh-vàng sáng** nhịp; ô trống viền **cyan nhạt** (sáng hơn khi ngón ở trên); ô không hợp lệ **đỏ mờ**; đường quái của bàn mình tô sáng màu hệ. Bấm SUMMON / thẻ nâng cấp / Archfiend khi thiếu → chữ **"Not enough mana."** nổi giữa bàn, xếp chồng (đầy bàn: "Board is full.", Archfiend đang hồi: "Archfiend is recharging.").
6. **Sao**: pip trên đầu, **cố định theo ô** (tính theo cỡ chuẩn, không theo nhún); 1–3 sao 1 hàng, 4–7 sao **2 hàng** (2+2, 3+2, 3+3, 4+3). **Đĩa aura** tròn màu dưới chân khi tướng đang được buff (OVERCLOCK màu cam, COPY BUFFER xanh ngọc). **Mũi tên** nhỏ xanh ▲ (buff, bên phải) / đỏ ▼ (debuff HOT / BUG / LOCK, bên trái) cạnh tướng.
7. **Nhịp đánh** (data.js, tư vấn bước 3–4, 7): idle nhún **±0.5px chu kỳ 1.7s** nguyên khối; attack **240ms**: lùi 1.5px (70ms) → lao tới +2.5px (45ms — **đạn phát đúng lúc này từ đầu nòng**) → về (125ms), dịch theo hướng bắn; trúng đòn 120ms cỡ ~16px (đỉnh ~12px); summon **220ms**, merge **180ms**; hysteresis đổi hướng 10° (giữ).
   - **Cỡ tướng**: đã thử 38px và 44px trên ô 64×70 (chụp so sánh) → **chọn 44px** (≈63% chiều cao ô, trong khoảng 60–75% của DCDW): 38px mặt + vũ khí quá nhỏ, khó nhận ra loại để ghép. Chỉnh ở `CAU_HINH.TL_CAO / CAO_MIN / CAO_MAX`.
8. **CUT-IN như DCDW** (render.js, game không dừng):
   - (a) **Archfiend** (của mình) kích hoạt: băng chéo giữa màn, tranh `cutin_<af>.png` trượt vào từ trái + chữ **"POWER UP!"** + băng tên kỹ năng + vệt sét/halftone/vệt tốc độ, **0.9s**.
   - (b) Tướng **VÀNG/ĐỎ** xuất hiện lần đầu trong trận (triệu hồi/ghép) hoặc tung kỹ năng chủ động: tranh `cutin_<id>.png` (chưa có → `portrait_<anh>.png`) trượt vào từ phải + băng tên + tên bậc, **0.8s**, tối đa **1 lần / 8s**.
   - (c) **Trùm tung chiêu** (bàn mình; co-op cả bàn đồng đội): mặt trùm trượt ngang trên nền halftone đỏ + tên chiêu, **0.8s** (tối đa 1 lần / 5s). Ảnh `cutin_boss_<id>.png`, chưa có → khung đầu ảnh đi bộ trùm phóng to.
9. **Màn giới thiệu trùm co-op**: khi trùm xuất hiện — tối màn, trùm phóng to giữa màn + băng đỏ "WAVE N / FINAL BOSS" + tên trùm, **1.2s** (thay cho dải báo trùm ở co-op).

### Ảnh chờ ChatGPT vẽ (thả vào `demo/assets/v3/` là tự dùng)
- `cutin_<id>.png` cho tướng VÀNG/ĐỎ (glitch, broker → tên file `cutin_broker.png` hoặc `cutin_miner.png`), `cutin_boss_<id>.png` (firewall, overclock, corruptor). Đã có: `cutin_overclock.png`, `cutin_firewall.png` (Archfiend).
- `san_<x>.png` / `khay_<x>.png` (skin sàn / khay bàn), `archfiend_<id>.png` (avatar vuông).

### Còn lại / ghi chú
- Màn rất cao (960) còn khe trống nhỏ trên/giữa/dưới (~30px mỗi khe) vì ô bị kẹp tối đa 70px để giữ gần vuông.
- Co-op: phần sàn dưới bàn trên không có đường (quái đi thẳng xuống bàn dưới).
- Bộ test cũ `tests/demo-hop-tuong` vẫn viết cho bản cũ — chưa chạy, chưa sửa.

## Sửa 4 lỗi người dùng báo trên iPhone: bỏ đế màu, đứng trong ô, quay hướng mượt, bắn chậm (02/11/2026, phiên tự động)
Không chạy test. Đã chụp màn 390×844 (PVP, bàn đầy tướng) tự xem: tướng đứng trên sàn ô, không lỗi JS. Ghi lại hướng quay 10 giây của 10 tướng: mỗi tướng chỉ đổi 4–6 nấc, đi tuần tự qua hướng trung gian (vd. S → SW → W → SW → S), không còn nhảy qua lại.

1. **Bỏ đế màu dưới chân** (đĩa trắng/lam/tím/vàng/đỏ) trên bàn. Bậc chỉ còn thể hiện ở **thẻ** (viền/nền thẻ, màu tên) và **màn chọn tướng**. Vòng aura buff (OVERCLOCK / COPY BUFFER) chỉ hiện khi có buff thật, giờ là **vòng mảnh, mờ** sát chân (không phải đĩa).
2. **Đứng trong ô, không lơ lửng**: chân tướng đặt ở **75% chiều cao ô** (`CAU_HINH.TL_CHAN`, nên dùng 0.72–0.78; trước là ~87% và đứng trên đế màu nên trông nổi), thêm **bóng đổ mềm** sát chân: elip tối alpha **0.35**, rộng **45% ô**, dẹt (`BONG_A`, `BONG_W`, `BONG_DET`). Tướng chỉ được vượt mép trên ô tối đa ~3px; sao pip ngay trên đầu.
3. **Quay theo hướng quái mượt như DCDW** (thông số `CAU_HINH.HUONG` trong data.js):
   - chỉ đổi hướng khi **chọn mục tiêu mới** hoặc quái lệch **> 30°** so với hướng đang nhìn; tối thiểu **0.4s** giữa 2 lần đổi (`DOI_MIN`, `LECH`);
   - đổi xa (> 45°) thì **đi qua các hướng trung gian**, mỗi nấc **60ms** (`BUOC`); quay 180° thì đi vòng qua hướng nhìn xuống (không quay lưng);
   - không có quái **> 1.2s** → từ từ quay về hướng mặc định **nhìn xuống (phía hành lang quái)**, mỗi nấc 120ms (`VE_S`, `BUOC_VE`, `MAC_DINH`);
   - WARP (xoay bằng code) vẫn nội suy góc mượt (`LERP`).
4. **Bắn chậm lại cho giống DCDW**: chu kỳ đòn = cd cũ **×1.7** (SCORCH 1.36s, FROST 1.7, ARC 1.53, VENOM 1.7, **LANCE 2.5**, WARP 2.04, BROKER 2.38, GLITCH 1.87), sát thương mỗi đòn **×1.5** để DPS không tụt quá. OVERCLOCK vẫn +35%. Nhịp mỗi đòn giữ nguyên: lùi → lao tới (đạn phát lúc này từ đầu nòng) → về.

### Ghi chú
- Hàm vẽ đế cũ `veVongBac` vẫn giữ trong render.js (không gọi nữa) phòng khi cần dùng lại.
- Có thể chỉnh nhanh trong data.js: `TL_CHAN` (vị trí chân), `BONG_*` (bóng), `HUONG.*` (độ "lì" khi quay), `cd`/`dmg` từng tướng.

## Phong cách NEON FRACTURE: skin bàn bằng ảnh, nền trung tính, cut-in tướng VÀNG (02/11/2026, phiên tự động)
Người dùng: "chưa đổi phong cách game, toàn bộ vẫn là cyber". Làm theo thế giới đã duyệt NEON FRACTURE (thành phố mô phỏng nứt vỡ trộn nhiều thế giới, neon chỉ là vết nứt cyan điểm nhấn). Không chạy test. Đã chụp 390×844 (PVP + CO-OP, có/không triệu hồi để xem quái đi hết đường), 390×720, màn chọn tướng — tự xem, không lỗi JS.

1. **SKIN BÀN kiểu DCDW** — mỗi bàn vẽ nguyên ảnh `demo/assets/v3/skin_<da|bang|samac|rung>.png` (ChatGPT vẽ: khay 5×3 + hành lang chữ L + trang trí), **thu nhỏ đều, không méo**.
   - Toạ độ lưới + hành lang **đo bằng script Python** (khe tối giữa ô, mép khay, sàn hành lang), kiểm lại bằng ảnh vẽ đè khung đỏ/xanh — lưu tỉ lệ 0–1 trong `data.js` `SKIN[k] = { grid: [x0,y0,x1,y1], lane: { x, y, top, end, w, h } }`.
   - `game.js boCuc`: bố cục theo ảnh — bề rộng lưới lớn nhất sao cho hành lang trái + lưới vừa 390 và 2 bàn vừa bề cao; **ô logic = đúng ô trong ảnh** (~57×47 ở màn 844, rộng hơn cao như ảnh). Trang trí ngoài cùng của ảnh có thể tràn ra mép màn / dưới HUD. `hinhSkin(k, gx, gy)` đổi toạ độ ảnh → toạ độ màn.
   - **Đường quái = hành lang trong ảnh**: sinh ở đầu hành lang trái → xuống → rẽ chạy hành lang dưới → cổng (avatar Archfiend + tim) ở cuối hành lang dưới.
   - CO-OP: hành lang trái bàn trên đi thẳng xuống bàn dưới; đoạn nối giữa 2 bàn là **mảnh hành lang cắt từ chính ảnh skin bàn trên** (không vẽ bằng code).
   - Người chơi mặc định skin **STONE (da)**; bàn trên (AI / đồng đội) lấy **ngẫu nhiên skin khác**. Màn chọn tướng có hàng **chọn skin** (4 ảnh thu nhỏ: STONE / ICE / SAND / FOREST), nhớ trong localStorage (`neon-grid.skin`, có try/catch).
   - Khi có ảnh skin: **bỏ** khay/ô/hành lang/mũi tên vẽ bằng code; chỉ còn chút sáng cyan ở cổng sinh + bóng mờ dưới đế cổng. Ảnh chưa tải → vẽ kiểu cũ (dự phòng).
   - Cỡ tướng theo ô mới: `TL_CAO 0.82`, `TL_CHAN 0.80` (tướng ~36–39px, chân gần đáy ô).
2. **NỀN MÀN**: bỏ nền tím neon — nền **xám xanh than** (#1b232c → #10151b) + 7 **vết nứt cyan rất mờ**. Màn chọn tướng / bảng phụ / HUD trên-dưới đổi sang tông than; giảm glow tím của nút SUMMON, logo bớt tím. Thanh Round giữa giữ gọn.
3. **CUT-IN tướng VÀNG**: `cutin_broker.png`, `cutin_glitch.png` cắt từ `nguon-chatgpt/v3/cutin_vang.png` (tách theo khe trong suốt x 883–926, crop bbox, cao 512, giữ alpha); `cutin_miner.png` = bản sao broker. Code cut-in tự dùng.

### Ghi chú
- Thêm skin mới: thả `skin_<id>.png` + thêm 1 dòng `SKIN` trong data.js (đo lại lưới/hành lang bằng script; ảnh nên cùng bố cục: lưới ~62% bề ngang, hành lang trái ~11%).
- Màn thấp (720): bàn thu nhỏ theo bề cao nên hai bên lộ nền than nhiều hơn.
- Ảnh skin ICE khá tím-lam (đúng ảnh ChatGPT, không chỉnh màu).
- Bộ test cũ `tests/demo-hop-tuong` vẫn viết cho bản cũ — chưa chạy, chưa sửa.

## PATCHWORK — tướng PIXEL ART đầu tiên + đường render pixel dùng lại (03/11/2026, phiên tự động)
Người dùng đã quyết định chuyển game sang pixel art dần dần. PATCHWORK (VÀNG · BIẾN HÌNH · Ô KỀ, dòng 97/174 tài liệu tư vấn 24 tướng) là tướng pixel đầu tiên. Không viết test; đã chạy thử bằng trình duyệt (390×844, DPR 2 và 3): không lỗi JS, xem ảnh chụp đứng yên / đang đập / dạng to.

1. **Ảnh** (copy nguyên, không vẽ lại / không méo; bản dap6 đã căn khung của phiên khác đẩy lên cùng lúc — ảnh 12 khung `px_patchwork_dap12_s.png` CHƯA dùng) → `demo/assets/v3/pixel/`: `patchwork_8dir.png` (8 ô 128), `patchwork_idle_s.png` (4 ô 176), `patchwork_atk_s|w|n.png` (6 ô 224×176).
   - **Lưu ý thứ tự 8 hướng**: xem ảnh thì thứ tự thật trên màn hình là **S, SW, W, NW, N, NE, E, SE** (ô 3 quay mặt sang TRÁI = W, khớp `atk_w`), không phải S, SE, E… như ghi chú PixelLab. Đã khai đúng theo ảnh trong `data.js px.dir8.thuTu` — nếu ảnh khác thì chỉ sửa mảng này.
2. **Đường render pixel** (`render.js vePixel`, bật khi `TUONG[id].px` có và ảnh đã tải):
   - `imageSmoothingEnabled = false`; tỉ lệ tính theo **px thiết bị**: cao ≈ `C.TUONG_CAO × co` như tướng khác → số px thiết bị / 1 px ảnh, **≥ 1 thì làm tròn số nguyên** (iPhone DPR 3: đúng 1:1), < 1 thì giữ tỉ lệ nhưng góc ảnh bắt lưới px thiết bị.
   - **Neo chân**: đo khung 0 mỗi ảnh (đáy phần hình + tâm chân ở 3 hàng đáy) → đặt đúng (cx, chân) như tướng khác; giữ bóng đổ chung, **không đế màu**, không viền màu bậc (pixel đã có viền tối).
   - **Hướng** theo `v.hg` (hệ quay theo quái sẵn có): đứng yên = ô hướng đó của dir8; nhìn S thì phát `idle_s` 4 khung × 180ms; đang đánh: S/SE/SW → atk_s, N/NE/NW → atk_n, W → atk_w, **E = lật gương atk_w**.
   - Xuất hiện: chỉ hiện dần (không phóng to/nhỏ để px không vỡ). Chân dung thẻ + cut-in VÀNG dùng ô S của dir8 (không smoothing).
   - **Thêm tướng pixel sau**: thả ảnh vào `assets/v3/pixel/` + khai `px: { dir8, idle, atk: { file, w, h, nhip, trung, huong }, to }` trong `TUONG` (mô tả ở đầu `data.js`). Không cần sửa code.
3. **Nhịp đòn** (`game.js tacDong / chuoiDon`): 6 khung 300/140/180/60/260/200 ms; **sát thương ra đúng đầu khung 5** (680ms sau khi vung); không bắt đầu đòn mới khi chuỗi 1.14s chưa xong (kể cả có OVERCLOCK / COPY BUFFER). Tướng cũ vẫn dùng `C.TAC_DONG` như trước.
4. **Kỹ năng** (`data.js patchwork`, `game.js DON.dap` + `DAC_BIET.bienHinh`): đập quái gần nhất (dmg 30, cd 1.7s) + văng 50% quanh đó (r 26→32 từ 5★), **làm chậm 18%→24%** trong 1.2s (trùm một nửa); vòng sóng dẹt ở chỗ đập + dưới chân, rung màn rất nhẹ. Mỗi **5 đòn (4 từ 5★)** → **STITCH UP**: to ×1.25 trong 4s (5s từ 3★), sát thương ×1.5, vùng ×1.4, tướng **ô kề** +15% tốc đánh (25% từ 5★). Hệ mới `Stitch` (màu VFX hồng #ff6f91).
5. **Bộ bài**: màn chọn tướng chọn sẵn `BO_MAC_DINH` = PATCHWORK, SCORCH, FROST, LANCE, GLITCH (người chơi đổi được). Bàn AI giữ nguyên. Tên dài trên thẻ dưới tự thu chữ (`.the .ten.dai`).

## 04/11 bộ v9 — SCORCH, FROST, ARC (PixelLab) thay bộ thử v4 (phiên tự động)
- Xoá SENTINEL / PULSE / ANCHOR khỏi `demo/js/data.js` và xoá `demo/assets/v4/`. Bộ tướng giờ là 3 tướng TRẮNG theo `BO-24-TUONG-V2.md`: SCORCH (Lửa, quái ĐẦU, đạn lửa + vệt cháy 2 s), FROST (Băng, quái ĐẦU, đạn băng làm chậm 20% trong 1,5 s; 3★ 25%), ARC (Sét, quái GẦN, đạn sét bay nhanh tầm ngắn — không cận chiến cứng; mỗi đòn thứ 3 sét nảy).
- Script `docs/demo-hop-tuong/ghep_sheet_v9.py` (chỉ cắt/căn/ghép, không sửa pixel, không lật gương) → `demo/assets/v9/<id>_dung.png` (8 hàng × 4 khung thở) + `<id>_tc.png` (8 hàng × 12 khung tấn công), ô 192, chân mọi hướng ở (96,160). Khung tấn công dịch chung theo độ lệch khớp alpha khung 0 với ảnh đứng (thử ±40 px). Độ dịch ghi ở `demo/assets/v9/meta.json`.
- Hiệu ứng ChatGPT thu nhỏ LANCZOS → `fx_<id>_phat|bay|trung.png` (1 hàng 6 khung, ô 48/56/72 = 2× cỡ hiển thị 24/28/36 px).
- `data.js`: hàm `V9(id, tc)` — dir8 dùng khung 0 sheet đứng (`doc: true`), thở 4 khung 170 ms (`tho`), tấn công 12 khung 60–90 ms, đòn ra đầu khung 6 (`trung: 6`), `co` 1.0 cả 3 (cao bằng nhau, ngang tướng cũ).
- `render.js`: đọc sheet đứng theo hàng, phát thở 4 khung (tắt nhún code), đạn vẽ sheet `bay` xoay theo góc bay, chớp `phat` tại tay lúc ra đòn, nổ `trung` khi trúng. Giữ nguyên mượt xoay hướng (MUOT).
- `game.js`: chớp tay của bộ v9 kéo dài 0,3 s; trúng đạn sinh hiệu ứng `trung9`; HIEU `bang` không có `voR` thì chỉ làm chậm (không vỡ băng).
- Chưa chạy thử (người dùng tự test).

## 04/11/2026 20:12 — Sửa CO-OP theo ảnh thật DCDW + thêm chế độ SOLO (phiên tự động)
- **CO-OP sửa đường quái**: bỏ đường hình ⊢ (rẽ ngang hành lang giữa). Giờ là **một làn dọc duy nhất ở mép trái**, quái sinh ở cổng trên cùng (`assets/bg/portal.png`) và đi **thẳng xuống** lõi dưới cùng (`assets/bg/core.png`, avatar Archfiend + tim mạng chung đặt trên lõi). Hai bàn 5×3 chồng bên phải làn: trên = ĐỒNG ĐỘI AI, dưới = người chơi; khoảng giữa chỉ là nền (dải "WAVE n/70" hiện ở đây).
- Thân làn: lát nối tiếp đoạn hành lang trái **cắt từ ảnh skin bàn người chơi** (không vẽ lại pixel). Ảnh skin mỗi bàn bị cắt bỏ hành lang trái + dưới của ảnh.
- Bắn: tướng bàn nào cũng bắn mọi quái trong tầm (bỏ giới hạn "bàn dưới chỉ bắn từ góc rẽ"); cận chiến đo tầm tới làn dọc. Quái tới cuối làn mới trừ mạng chung. Nhịp wave/trùm/70 wave/AI đồng đội giữ nguyên; thời gian đi hết làn vẫn ≈ `COOP.THOI_GIAN_DUONG`.
- Code: `game.js boCuc` (bố cục co-op mới + `C.LAN_CO`, `BAN_SO`/`C.LAN_SO` cho solo), `chonMuc`/`kcDuong` bỏ lọc góc rẽ, `C.D_RE_CO` = giữa 2 bàn (quái trước mốc thuộc bàn trên cho trùm/tinh anh); `render.js veLanDoc` + `taoLop(k, che)`.
- **SOLO mới**: nút thứ 3 "SOLO" ở màn chọn tướng (nhớ bằng localStorage `neon-grid.mode`). Chỉ 1 bàn người chơi, làn dọc trái ngắn (cao vùng bàn + ~70px trên/dưới), không có đội AI ở HUD. Nhịp wave/trùm/mạng như co-op, máu quái × `SOLO.MAU` = 0.55 (`data.js SOLO`). Kỷ lục riêng `neon-grid.best.solo`. Màn kết quả không có cột ALLY.
- Cân bằng nhanh (bot giả lập trong node, 4 trận mỗi chế độ): co-op tới wave ~40–44, solo ~31–46 → 0.55 tạm hợp lý.
- Tự kiểm 390×844 bằng Playwright: ảnh so sánh `tu-kiem/coop-solo-lan-doc.png` (trái: ảnh thật DCDW · giữa: CO-OP · phải: SOLO) — làn dọc trái, 2 bàn chồng bên phải, quái đi thẳng xuống. Không lỗi JS.
- PVP giữ nguyên.
