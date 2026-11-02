# 005 – Chuông nhỏ đeo hông (kiểu NEO)
- **Trạng thái:** CHỜ (làm sau 001)
- **Dùng vào đâu:** lớp `chuong-hong` (khe "hong", vẽ TRÊN thân) – trang bị gắn theo Âm Phù (phiên "do").
- **Mô tả:** chuông đồng nhỏ (~8×10 điểm ảnh ở cỡ ảnh gốc) treo dây ở hông, cùng bảng màu đồng tối của game.
- **Kiểu neo:** chỉ cần 1 ảnh `art/kiem-khach-lop/chuong-hong/neo00.png` (nền trong suốt; nếu ChatGPT khuyên lắc thì neo00…neo02, ghi `so_hinh_neo`, `ms_neo`). Ghi điểm treo trong ảnh nhỏ → `chan_neo: [x, y]`.
- **Điểm neo từng khung:** đo vị trí hông trong từng khung gốc 256×256 (mặt phải) cho các clip dung/chay/nhay/don1/don2/don4 → ghi vào file này dạng `chay: [[x,y],…8 điểm]`. Phiên LÀM (hoặc phiên gen nếu LÀM đã dừng) chép vào `neo` của lớp trong trang-bi.json. Clip chưa đo → chuông ẩn ở clip đó.
- Lưu ảnh nguồn: `art/kiem-khach-lop/chuong-hong/nguon-chatgpt.png`.
