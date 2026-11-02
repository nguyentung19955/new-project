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
