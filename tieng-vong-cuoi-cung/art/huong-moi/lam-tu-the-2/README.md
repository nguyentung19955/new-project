# Lam mới – thử 2: sheet theo tư thế chính (CHẠY 8 + CHÉM 1 A/B/C/D)

Theo `docs/gameplay/PHAN-HOI-11` + `PHAN-HOI-12`. Thay hướng rig 13 mảnh (`../lam-rig/`, giữ làm đối chứng).
Ghi chú đầy đủ, số đo, tự kiểm, đề xuất gen lại: **`game/thu-lam-moi-2/GHI-CHU.md`**.

| Thư mục | Nội dung |
|---|---|
| `sprite/lam-moi2-chay-2x.png/.json` | 8 tư thế chạy, ô 235×239, 4×2, neo (134, 235); 224 px nguồn = 112 px logic |
| `sprite/lam-moi2-chem1-2x.png/.json` | 4 tư thế chém 1 (A lấy đà, B cắt, C kết thúc, D hồi), ô 330×239, 4×1, neo (151, 233) |
| `kiem/dai-khung-*.png` | ảnh dải khung so với Lam chốt (2x + 112 px + bóng đen) |
| `kiem/so-do.json` | số đo từng tư thế (px logic) + Lam chốt |
| `gif/` | GIF tại chỗ 112 px / 2x, màu / bóng đen, bản chậm ×4 |
| `code/tach.py`, `dung_sheet.py`, `xuat.py` | tách nền, dựng sheet, xuất ảnh kiểm + GIF |
