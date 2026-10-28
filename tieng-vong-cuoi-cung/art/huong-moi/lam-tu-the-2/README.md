# Lam mới – thử 2: sheet theo tư thế chính (CHẠY 8 + CHÉM 1 A/B/C/D)

Theo `docs/gameplay/PHAN-HOI-11` + `PHAN-HOI-12`. Thay hướng rig 13 mảnh (`../lam-rig/`, giữ làm đối chứng).
Ghi chú đầy đủ, số đo, tự kiểm, đề xuất gen lại: **`game/thu-lam-moi-2/GHI-CHU.md`**.

| Thư mục | Nội dung |
|---|---|
| `sprite/lam-moi2-chay-2x.png/.json` | 8 tư thế chạy, ô 235×239, 4×2, neo (134, 235); 224 px nguồn = 112 px logic |
| `sprite/lam-moi2-chem1-2x.png/.json` | 4 tư thế chém 1 (A lấy đà, B cắt, C kết thúc, D hồi), ô 330×239, 4×1, neo (151, 233) |
| `sprite/lam-moi2-{chay,chem1}-3x.png/.json` | **Làm nét 28/10**: cùng tư thế, cùng neo gen, cỡ 3x (ô chạy 352×358 neo (201, 352); ô chém 494×358 neo (227, 349)), thu thẳng từ ảnh gen bằng Lanczos + làm nét nhẹ có kẹp; game dùng khi bộ đệm/logic > 2 |
| `kiem/dai-khung-*.png` | ảnh dải khung so với Lam chốt (2x + 112 px + bóng đen) |
| `kiem/so-do.json` | số đo từng tư thế (px logic) + Lam chốt |
| `gif/` | GIF tại chỗ 112 px / 2x, màu / bóng đen, bản chậm ×4 |
| `code/tach.py`, `dung_sheet.py`, `xuat.py` | tách nền, dựng sheet, xuất ảnh kiểm + GIF |
| `code/dung_thu3.py` + `code/bang-thu3.json` | **PH13 (29/10)**: dựng sheet bộ 3 (pogo / tường / nhảy-rơi / đứng / chạy sửa / chém 1 sửa) bằng 1 lệnh, tỉ lệ theo mũ Lam chốt, xuất 2x + 3x → `sprite/lam-moi3-*`, cập nhật `sprite/thu3-danh-sach.json` (hiện rỗng – chưa có ảnh). Hướng dẫn: GHI-CHU mục "Khung code cho các sheet sắp gen" |
