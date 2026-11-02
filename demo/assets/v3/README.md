# Ảnh v3 — góc HIGH TOP-DOWN (kiểu Destiny Child: Defense War)

Nguồn: `docs/demo-hop-tuong/nguon-chatgpt/v3/` (ChatGPT vẽ). Chỉ cắt viền trong suốt + thu nhỏ bằng Python PIL (LANCZOS), giữ alpha; không vẽ thêm.

- `<id>.png` — 8 tướng ảnh tĩnh, cao 128px (rộng theo tỉ lệ), đã trim (bỏ alpha ≤ 8):
  scorch (từ scorch_master_82), frost, arc, lance, warp, broker (tướng id `miner`), glitch, venom.
- `tile.png` — ô bàn 96×96 từ `tile_normal_b.png`.

Trong game (render.js): tướng cao 29px logic trong ô 46px (rộng ≤ 40px), chân cách đáy ô ~10px, bóng ellipse do code vẽ, nhãn sao trên đầu.

Chờ thêm (thả vào đây là tự dùng, ưu tiên hơn ảnh tĩnh):
- `<id>_idle.png` — sheet 1 hàng, khung vuông (số khung = rộng / cao), phát 9fps lặp.
- `<id>_attack.png` — sheet 1 hàng, khung vuông, phát 14fps (đạn phát ở ~khung 6).
Neo khung: điểm giữa-đáy phần hình của khung đầu idle (code tự đo), nên giữ chân cố định ở (64,108)/128 mọi khung.

8 hướng (theo quái): `<id>_<dir>.png` (ảnh tĩnh) + `<id>_idle_<dir>.png` (8 khung) / `<id>_attack_<dir>.png` (12 khung), dir ∈ s, sw, w, nw, n; SE/E/NE do code lật gương SW/W/NW. Thiếu hướng → hướng gần nhất; WARP xoay ảnh bằng code. Chi tiết: docs/demo-hop-tuong/TIEN-DO-V3.md.

## Cut-in, sàn, khay (phiên "đường quái vòng bàn")
- `cutin_<archfiend>.png` — tranh cut-in khi Archfiend kích hoạt (đã có overclock, firewall). Avatar ở cổng + chân dung thẻ cắt vùng mặt theo `ARCHFIEND[id].mat`.
- `cutin_<tướng>.png` — cut-in tướng VÀNG/ĐỎ (chưa có → dùng `portrait_<anh>.png`). `cutin_boss_<id>.png` — cut-in trùm (chưa có → khung đầu ảnh đi bộ).
- `san_<x>.png` (vân sàn, lặp) / `khay_<x>.png` (khay bàn, kéo vừa bàn); x ∈ 1, 2, neon, graphite, circuit, steel, tech, ice, sand, a, b — ảnh thứ 1 = bàn mình, thứ 2 = bàn trên.
