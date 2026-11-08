# Pháo La Bàn — tổ hợp hướng: ảnh cần gen (ChatGPT)

Trạng thái 08/11: lượt 1 (08:35, tài khoản cũ) hết lượt; **lượt 2 (08:58, tài khoản người dùng đổi) gen xong 1 tờ đủ 15 bệ + tên lửa, đúng thứ tự** →
`docs/demo-hop-tuong/thap-art/raw_laban_tohop.png` → cắt `tools/thap-cat-laban.py` → `thap/assets/canon_de_<1–15>.png` (211×211 = khung canon_de 177 + 17 px mỗi phía, cùng tâm)
+ `fx_canon_ten.png`; `window.LABAN_DE = true`. Xem: `to-hop-15-anh-cat.jpg` (ảnh cắt), `to-hop-15-trong-game.png`, `ten-lua-bay.jpg`.
Trong game vẫn vẽ thêm chevron `duong_mui` trên đầu súng (CM.veMui) vì đầu súng xoay + tấm đếm đáy ô che gai N / S của bệ.
Dự phòng khi ảnh chưa tải: bệ `canon_de` + chấm sáng/tối PNG (CM.veDe) · tên lửa `fx_lien_dan`.

## Tờ 1 — 1024×1024, lưới 4×4 trên nền magenta (đính kèm `ref_canon_de.png` = bệ hiện tại trên nền magenta)

```
Use the attached image as the exact style reference: it is the base plate of the "Compass Cannon" turret in my mobile tower-defense game (top-down view, gold ornate ring, dark navy star-map disc, 4 gold compass spikes with cyan gems pointing North/up, East/right, South/down, West/left). Create ONE sprite sheet, 1024x1024, flat pure magenta background (#FF00FF), a 4x4 grid of equal cells, no grid lines, no text, no labels. Each cell holds one centered, top-down copy of this same base plate, same size, same gold look, same outline, nothing touching the cell edges. The ONLY difference between cells is which compass spikes are "ON": ON spike = longer, bright glowing cyan-white gem, a small glowing cyan arrow-head on the tip, brighter gold, soft cyan glow around that spike only. OFF spike = short, dull dark-bronze, dark grey gem, no glow. Cells, left to right, top to bottom (N = up, E = right, S = down, W = left): 1 N only; 2 S only; 3 W only; 4 E only; 5 N+S; 6 N+W; 7 N+E; 8 S+W; 9 S+E; 10 W+E; 11 N+S+W; 12 N+S+E; 13 N+W+E; 14 S+W+E; 15 all four N+S+W+E (extra: center disc glows faint gold); 16 (different): a small gold homing rocket seen from above, pointing RIGHT, gold body with a cyan compass gem, small fins, short orange-cyan flame trail on its left, fitting inside the cell. Keep the plates perfectly top-down and identical in rotation, so only the ON/OFF spikes differ.
```

## Sau khi có ảnh

1. Lưu tờ vào `docs/demo-hop-tuong/thap-art/raw_laban_tohop.png`.
2. `KT=1 python3 tools/thap-cat-laban.py` → xem `/tmp/laban-cat-xem.png` (đúng thứ tự ô, gai sáng đúng hướng, không viền hồng).
3. `python3 tools/thap-cat-laban.py` → ghi `thap/assets/canon_de_<1–15>.png` (mặt nạ bit 1 N · 2 E · 4 S · 8 W) + `fx_canon_ten.png` + mục `fx_canon_ten` trong `js/fxu-meta.js`, bật `window.LABAN_DE = true` (`js/comoi.js`).
4. Chạy `node tools/thap-kt-la-ban.js`, xem ảnh `to-hop-15-*.png` / `ten-lua-bay-*.png`.
5. Pixel: thêm bản pixel theo `docs/pixel/QUY-CHUAN.md` (mục "Bổ sung" trong `docs/pixel/DANH-SACH.md` đã ghi `u/canon_de_<1–15>`, `fx/canon_ten`).

Ghi chú: nếu ảnh lệch (gai sáng sai hướng) chỉ gen lại ô sai, hoặc gen 2 tờ 2×4 (8 ô mỗi tờ) rồi ghép thành lưới 4×4 đúng thứ tự trước khi cắt.
