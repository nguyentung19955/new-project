# VFX P2 — chiêu lớn có hoạt ảnh thật (06/11)

Yêu cầu: tuvan/vfx/YEU-CAU-ANIM.md ("ảnh rung, không phải animation") + REVIEW-VFX-93 §III. Kiểm toán: [AUDIT.md](AUDIT.md). Ảnh cần vẽ: [CAN-VE.json](CAN-VE.json) (12 tờ 4×4, tệ nhất trước).
Luật chơi KHÔNG đổi (vùng trúng / sát thương / thời điểm / mục tiêu giữ nguyên); không Math.random mới; Copycat = cùng id → cùng hình; mọi chế độ dùng chung HU/SKILLS.

## Code — `thap/js/vfxp2.js` (+ `p2-meta.js` do `tools/thap-cat-p2.py` sinh)
- Tờ `assets/p2_<ten>.png` (16 khung vuông, tâm cố định) chạy theo bảng pha báo trước → trúng → dư âm; EFFECTS Minimal rút dư âm, REDUCE FLASH giữ chớp màn ×0,3 sẵn có.
- Ảnh về: `python3 tools/thap-cat-p2.py` (khoá magenta, Lanczos nhân-trước-alpha) → tự bật, không cần sửa code.

| Ụ | Trước | Dự phòng (tờ chưa tải) | Tờ 16 khung (ĐÃ GẮN — assets/p2_*) |
|---|---|---|---|
| Overlord | cột sét ảnh tĩnh co lại + 4 ảnh tĩnh trượt, tia nhấp nháy alpha 40 Hz, vết cháy phóng | cột sét = dải điện fx_dien chạy khung (tô đỏ-hồng), tia không nhấp nháy, vết cháy chỉ mờ | báo trước trên quái đầu khi nạp ≥ 85% → sét giáng → sóng + vết cháy |
| Black Hole | 1 ảnh đĩa xoay + phập phồng bán kính + lõi phập phồng (1,1–3 s) | đĩa quay đều (mép = vùng hút) + xoáy sig_m01_swirl lặp khung | xoáy 16 khung lặp |
| Cryo Reactor | 2 ảnh tĩnh xoay | dải vỡ băng fx_bang_vo chạy khung + sàn băng đứng yên mờ dần | sương cuộn → loé gai băng → băng lan → tan (1,1 s) |
| Evolver | bom phập phồng + lắc 3 s cuối | bom đứng yên (số đếm + quầng đỏ 3 s cuối) | tích 8 khung lặp → nứt sáng 8 khung lặp nhanh |
| Chrono Throne | đồng hồ ảnh tĩnh xoay ngược | đứng yên mờ dần (dải sig_m05 vẫn chạy) | đồng hồ quay ngược 16 khung |
| Orbital | vòng ảnh tĩnh xoay + nhấp nháy 23 s | đứng yên, mờ vào/ra | vệ tinh bay 16 khung lặp |
| Hero Foundry | vòng vàng xoay + nhấp nháy 12 s | đứng yên | ô anh hùng 16 khung lặp |
| Ember Relay | lửa ảnh tĩnh phập phồng / trượt | cỡ cố định | lửa sống 16 khung (trên ụ + khi bay) |
| Chrono Lock | ấn tĩnh phóng vào | ấn đứng yên + kim + vành đếm | vẽ vòng → giữ lặp → vỡ |
| Holy Halo / Genesis / Copycat | không có hình riêng | như cũ | vòm thánh / hoa sáng ở ô mới / dựng hình sao chép |
| Hive Queen, Pandora, Merge King, Fusion Archive, Quantum Choir, Prism Thief, Blood Circuit, Hex Saboteur | đã là dải khung (AUDIT: KHÔNG rung) | giữ | — |

## Kiểm
- `node tools/thap-kt-p2.js` → `*_strip.jpg` (10 khung/chiêu, iPhone 13). `STANDIN=1` thử đường tờ 16 khung bằng ảnh mượn (không xuất bản) — đã chạy: Overlord báo trước → trúng → dư âm, Cryo, Halo, Genesis, Copycat đúng pha, 0 lỗi trang.
- Hiệu năng `node tools/thap-kt-p2-perf.js` (CPU ×4, bàn 15 ụ chiêu lớn ra chiêu mỗi 40 khung, 30 quái): trước p50 24,9 / 24,0 ms, tb 29,4 / 29,9 — sau p50 24,7 / 26,8, tb 29,5 / 31,4 (trong nhiễu đo, không tụt).
- thap-kt-mau: xanh (cột sét dự phòng tô đỏ-hồng cho Overlord). Hồi quy 4 cỡ: 1 lỗi chập chờn đã biết (cut-in `.ci-chu` 360x780 solo_trum) → chạy lại riêng.

## Tờ ảnh đã gắn (06/11 chiều)
- 12 tờ ChatGPT `raw_p2_*.png` → `python3 tools/thap-cat-p2.py`: khung vuông tâm cố định, cỡ ≤ độ nét ô raw (288 px chiêu to). Màu lệch nguyên tố được đặt lại SẮC lúc cắt
  (giữ sáng/bão hoà): Overlord đỏ-hồng, Black Hole tím, Chrono Lock ngọc lam, Holy Halo vàng, Copycat tím nhạt → thap-kt-mau XANH (9 mục chiêu lớn).
- Dải kiểm `*_strip.jpg` chụp lại với tờ thật (SOLO, CO-OP bàn đồng đội, PVP bàn đối thủ, EFFECTS Minimal + REDUCE FLASH). Holy Halo vòm mờ 0,62 để không che ụ.
- Hồi quy 390×844 NHANH: XANH (1863 s).
