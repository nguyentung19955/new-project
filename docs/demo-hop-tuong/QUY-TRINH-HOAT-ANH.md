# Quy trình làm hoạt ảnh tướng (người dùng chốt 03/11/2026) — áp dụng MỌI tướng

Đọc trước: TIEU-CHI-NGHIEM-THU-HOAT-ANH.md và BAI-HOC-LOI-SAI.md.

0. **Hồ sơ nhân vật** (ho-so-tuong/<so>-<TEN>.md) — viết TRƯỚC, người dùng duyệt: vai trò/chiêu, hình dáng, màu, DANH SÁCH CHI TIẾT bắt buộc, LOẠI VŨ KHÍ và cách mang (gắn tay / cầm 1 tay / cầm 2 tay / vác vai…, tay nào), bảng vị trí vũ khí 8 hướng, động tác đánh, hiệu ứng. MỌI prompt (ảnh gốc, 8 hướng, sửa, hoạt ảnh) đều dán kèm phần mô tả ngắn của hồ sơ. Không dựa vào nhân vật cũ.
1. **Ảnh gốc** — ChatGPT vẽ model sheet / ảnh hướng S (camera top-down cao như Defense War). Người dùng duyệt.
2. **8 hướng bằng PixelLab** — PixelLab › Create Character › Create from Reference, Camera **High Top-Down**, 8 dir.
   - Đưa ảnh S (bản pixel sạch, ≤256px, ví dụ khung 1 đã cắt pixel) vào ô South; hướng nào đã có bản duyệt thì đưa vào đúng ô của nó.
   - Ảnh bị mờ/không pixel → PixelLab báo "Blurry" → dùng bản pixel đã cắt.
   - Gửi người dùng xem 8 hướng; kiểm bảng tay (BAI-HOC mục 10) trước khi gửi.
3. **Hoạt ảnh từng hướng** — với MỖI hướng: đính kèm ĐÚNG ảnh hướng đó của PixelLab cho ChatGPT làm khung 1, prompt ngắn + các lưu ý trong sổ (thân đứng yên, đủ 2 tay 12 khung, động tác hợp vũ khí, không hiệu ứng, nền trong suốt, 2 hàng × 6). KHÔNG để ChatGPT tự nghĩ ra hướng bằng chữ.
4. **Cắt pixel** — `NORM=1 SACH=vien FH=224 PADB=40 python3 tools/demo-cat-luoi-khung-pixel.py …` rồi `CUNG=1 T=60 python3 tools/demo-khoa-than-dung-yen.py …`.
5. **Tự kiểm hết sổ** — đặt khung 1 cạnh ảnh PixelLab của hướng đó + các hướng đã duyệt; đo đỉnh/đáy; xem GIF như người chơi. Không đạt → vẽ lại, không gửi, không tự bào chữa.
6. **Gửi người dùng** GIF (3× NEAREST) khi đạt hết; gộp các hướng đã duyệt vào 1 GIF.
7. Hiệu ứng (lửa, tia…) vẽ riêng sau cùng; code gắn vào nòng theo hướng.
