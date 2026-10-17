# Kiếm bớt cứng (17/10) — báo cáo

## Phần A — hình que + prompt để gen lại 3 hàng kiếm (xong)

- Hình que người đặc mới (thư mục `docs/khung-que-8-huong/nguoi-dac/`):
  - `kiem-1-v3-e.png` — kiếm 1, 7 khung, **★ khung 4**
  - `kiem-2-v3-e.png` — kiếm 2, 6 khung, **★ khung 3**
  - `kiem-3-v3-e.png` — kiếm 3, 7 khung, **★ khung 4**
  - GIF xem thử: `kiem-1-v3-que.gif`, `kiem-2-v3-que.gif`, `kiem-3-v3-que.gif` (thủ thế → đòn đúng mốc thời gian game, chậm ×3 → thủ thế)
  - Script dựng lại: `python3 docs/khung-que-8-huong/nguoi-dac/ve-kiem-v3.py`; số đo: `kiem-v3-so-do.json`.
- Prompt: `PROMPT.md` (thư mục này) — 3 prompt riêng, 1 prompt gộp (tuỳ chọn, kém chắc hơn), 1 prompt tấm vệt chém 3×3.

Điểm khác so với hình que 16/10:

| | Hình que 16/10 | Hình que v3 |
|---|---|---|
| Số khung | 5 / 5 / 6 | **7 / 6 / 7** |
| Chân | gần như đứng im | lấy đà gập gối, chân trước bước lên rồi lùi về; **chân sau ghim cố định** (máy tính tự giữ) |
| Bàn chân trước nhích tới tối đa | ~0 | kiếm 1: 6 · kiếm 2: 3 · kiếm 3: 7 (≈ 1 bàn chân) |
| Đầu nhún (thấp nhất → cao nhất) | ~3 | kiếm 1: −12 → +0 · kiếm 2: −8 → −1,5 · kiếm 3: −14 → −1 |
| Thân | luôn thẳng | ngả ra sau lúc lấy đà (−8 / −10°), đổ tới lúc chạm (22° / 28°) |
| Mũi kiếm so với đất | xuyên đất (kiếm 1 khung 4, kiếm 3 khung 5–6) | luôn trên đất (thấp nhất còn cách 15 đơn vị) |

(Đơn vị = đơn vị hình que; người cao ≈ 90.)

Khung ★ đặt sao cho khi ghép vào game, mốc thời gian (bảng trong PROMPT.md) đưa ★ đúng lúc chạm cũ u = 0,45 — không đổi thời lượng đòn.
