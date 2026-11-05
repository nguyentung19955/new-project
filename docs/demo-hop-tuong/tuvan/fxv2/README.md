# Hiệu ứng đánh v2 — đã nối (2026-11-05)
- Cắt: `python3 tools/thap-cat-fxv2.py` → `thap/assets/fx_<id>_{dan,no,trung,hieu,tia}.png`, `fx_st_*`, hạt T22, `thap/js/fxu-meta.js` (cỡ + điểm neo). Tờ mới (T07 T08 T10–T13 T15 T17 T19 T21 G1–G4) chỉ cần thả `raw_fx_<mã>.png` vào `thap-art/` rồi chạy lại script → tự nối.
- Bảng dữ liệu: `thap/js/fxu.js` (`FXU.CFG` cỡ từng ụ, `FXU.THAY` ảnh cũ → ảnh v2). Móc: `fx.js` FX.no (chớp nòng/nổ trúng theo `G.dangBan`), `render.js` veDan/veFx/tia/set/veLaser, `quaianim.js` trạng thái quái (tờ ST).
- Ảnh: `cut_contact.png` (mọi ảnh đã cắt), `battle_*.jpg` (trên = TRƯỚC, dưới = SAU, 390×844), `status_*.jpg`.
