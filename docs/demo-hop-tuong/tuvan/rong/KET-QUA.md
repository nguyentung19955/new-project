# Đầu rồng từ ụ — Leviathan (băng) + Wyrm Engine (lửa) — 06/11

Yêu cầu user 16:36 + 17:37 (tuvan/leviathan/YEU-CAU-THEM.md). Luật chơi KHÔNG đổi (cùng vùng trúng / sát thương / thời gian / đẩy lùi / cháy).

- `js/sigfx.js` SIG.rongVe (dùng chung): đầu rồng PNG trồi lên từ ô ụ (~1.7 ô, mờ 0.88 đè ô kề) → gầm (loé họng, REDUCE FLASH ×0.4) →
  luồng = dải 16 khung chạy đúng thứ tự (1–4 hình thành, 5–12 chảy, 13–16 tan) từ MIỆNG tới đầu sóng thật (HU.thoThuy / HU.rongBo) → dọc đường từ lõi →
  vệt tan (EFFECTS gọn: bỏ, cân bằng: thưa nửa) → đầu rồng chìm lại vào ụ. Bỏ "đầu rồng rơi từ trời" và rồng bay dọc đường.
- Ảnh mới: `assets/wyrm_rong.png`, `assets/fx_wyrm_lua.png` (16 × 300×150), `assets/lev_rong.png` cắt lại 420 px — `tools/thap-cat-wyrm.py`.
- Nón lửa thường Wyrm (`HU.nonLua`, skills5.js): bỏ ảnh tĩnh rung/phóng → khung bắt lửa → chảy lặp → tàn; dạng 2/3 = cùng khung tô xanh/trắng.
- Bản sao Copycat = cùng id → cùng hình; SOLO / CO-OP (bàn đồng đội) / PVP (bàn đối thủ, cỡ theo ô nhỏ) / Test range / demo Turret File.
- Kiểm: `node tools/thap-kt-rong.js` + `python3 tools/thap-kt-rong-ghep.py` → `*_strip.jpg` (khung đen đầu dải = nền wave chưa vẽ lúc chụp canvas, không phải lỗi).

## Kiểm nhanh "ảnh tĩnh rung" (YEU-CAU-ANIM.md) — để VFX P2
- Black Hole (HU.hoden): đĩa xoáy 3 s = 1 ảnh xoay + phập phồng (khung sig chỉ phủ đầu/cuối) → cần dải khung xoáy.
- Wyrm DRAGON DIVE hình dự phòng (HU.rongBo.ve, chỉ khi ảnh mới chưa tải) vẫn là ảnh rồng phồng nhịp.
- Overlord (sấm vẽ lại mỗi 45 ms), Hive Queen (dải sig), Orbital (tia cuộn) — không phải ảnh tĩnh rung.
