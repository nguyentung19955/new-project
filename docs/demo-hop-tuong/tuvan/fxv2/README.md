# Hiệu ứng đánh v2 — đã nối (2026-11-05)
- Cắt: `python3 tools/thap-cat-fxv2.py` → `thap/assets/fx_<id>_{dan,no,trung,hieu,tia}.png`, `fx_st_*`, hạt T22, `thap/js/fxu-meta.js` (cỡ + điểm neo). Tờ mới (T07 T08 T10–T13 T15 T17 T19 T21 G1–G4) chỉ cần thả `raw_fx_<mã>.png` vào `thap-art/` rồi chạy lại script → tự nối.
- Bảng dữ liệu: `thap/js/fxu.js` (`FXU.CFG` cỡ từng ụ, `FXU.THAY` ảnh cũ → ảnh v2). Móc: `fx.js` FX.no (chớp nòng/nổ trúng theo `G.dangBan`), `render.js` veDan/veFx/tia/set/veLaser, `quaianim.js` trạng thái quái (tờ ST).
- Ảnh: `cut_contact.png` (mọi ảnh đã cắt), `battle_*.jpg` (trên = TRƯỚC, dưới = SAU, 390×844), `status_*.jpg`.

## Phần 2 (2026-11-05)
- Cắt thêm T07 T08 T10–T13 T15 T17 T19 T21 + G1–G4 (450 ảnh tổng). Script thêm: khử viền hồng/tím sẫm của nền magenta (`khu_hong`, ảnh tông tím/hồng giữ nguyên), bỏ vệt mảnh kéo dài khung (hydra_dan2).
- Nối: `fxu.js` THAY (g_* growfx → ảnh dạng 1/2/3 riêng, hu_hoden → fx_blackhole_hieu), `khoi_doc` → nổ trúng riêng, xung buff ụ HỖ TRỢ (đầu xung = dan, tới nơi bật hieu nhỏ 0.24 s), vũng độc Toxic Pool, máy chém Guillotine, nhát hái Reaper khi giết ngay. `growfx.js`: cột sét/dư chấn/hố cháy Overlord, giáo trời + tâm ngắm Orbital, vuốt X/3 vuốt + bóng sói, thiên thạch/nổ sao Star Cannon, sương/lưới/bão băng Cryo, xích Chain Link, dấu rune Hydra, lửa hồ ly, kim/dấu đồng hồ/tiếng vọng Chrono, tia vàng DNA/Sync, NỔ BIẾN HÌNH riêng từng ụ (dạng 3 = trung3). `skills5.js`: nón lửa dạng 2/3, rồng bổ nhào, ong chúa vàng.
- Ảnh: `p2/` (SOLO/CO-OP/PVP × 8 lô 5 ụ + biến hình). Kiểm thử: `tools/thap-kt-fxv2-p2.js`. Còn thiếu: `CON-THIEU.md`.
