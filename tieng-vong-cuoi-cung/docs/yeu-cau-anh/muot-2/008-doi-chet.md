# 008 – Dơi Rễ – chết: 2 khung rơi giữa F6–F7 (P0)
- **Trạng thái:** VẼ LẠI (02/11, phiên MƯỢT-2 kiểm: moi-01, moi-02 LỆCH THIẾT KẾ – thân dơi mất khối đen đặc, không thấy đầu tai nhọn + 2 mắt vàng như F6/F7, cả hình bạc màu, nhòe, không có viền tối 1 px; trông như vật khác. Cần: giữ đúng thân đen đặc, đầu + mắt vàng, cánh rễ nâu có viền tối như F6/F7, nét pixel sắc. Gợi ý thêm vào prompt: 'keep the solid black body, pointed ears and the two amber eyes exactly as in the neighbouring frames, same 1-pixel dark outline, no blur, no soft shading'. Thu nhỏ đúng bội số điểm ảnh ChatGPT (nearest) để khỏi nhòe.)
- **Clip:** `quai.json → loai.doi.hinh.chet` – thư mục art gốc `art/quai-moi/doi/chet/` (9 khung `fNN.png`, ô 76×76, quay TRÁI, neo chân [37, 59])
- **Việc cần vẽ:** Vẽ **2 khung mới** `moi-01`, `moi-02`, chèn SAU F6.
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "Giật nặng F6→F7: đang rơi giữa không trung → nằm sát đất trong 1 bước. Thêm 2 khung rơi giữa F6–F7 (thân hạ dần, cánh gập; gần chạm đất, cánh chạm trước); giữ khung cuối."
  - moi-01: thân hạ dần (khoảng 1/3 quãng còn lại), cánh gập lại.
  - moi-02: gần chạm đất, cánh chạm đất trước.
- **Ảnh tham chiếu:** `008-doi-chet-thamchieu.png` (972×252) = ghép ngang F6 | [Ô TRỐNG] | [Ô TRỐNG] | F7, cắt cửa sổ (x0=0, y0=0, rộng 76, cao 76) của ô 76×76 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art animation of the Root Bat (bat made of dark roots and bark). The creature faces LEFT. Left = falling in mid-air after death, right = lying on the ground. Draw ONLY the 2 missing in-between frames for the 2 empty dashed cells: cell 2 = body lower (one third of the way down), wings folding; cell 3 = almost on the ground, wing tips touching the ground first. Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/doi-chet/moi-01.png`, `art/muot-2/doi-chet/moi-02.png` – mỗi tệp PNG RGBA đúng **76×76** (cỡ ô gốc), nền trong suốt, chân ở **[37, 59]** như khung gốc, quay TRÁI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 76 × cao 76, dán vào ô 76×76 trong suốt tại (0,0). Lưu kèm ảnh nguồn `art/muot-2/doi-chet/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 … F6 **moi-01** **moi-02** F7 F8 (11 khung)
- **ms mới cho cả clip:** 67, 67, 67, 67, 67, 50, 50, 50, 67, 83, 150 (785 ms, đúng bộ 11 khung ChatGPT)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** doi.hinh.chet: so_hinh 9→11, ms mảng.
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
