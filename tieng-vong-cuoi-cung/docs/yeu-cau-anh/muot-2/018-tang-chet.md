# 018 – Màn Tang – chết: 2 khung đang rơi giữa F3–F4 (P0)
- **Trạng thái:** XONG (02/11 – ảnh ChatGPT, đã đặt vào ô gốc)
- **Clip:** `quai.json → loai.tang.hinh.chet` – thư mục art gốc `art/quai-moi/tang/chet/` (9 khung `fNN.png`, ô 104×104, quay TRÁI, neo chân [50, 87])
- **Việc cần vẽ:** Vẽ **2 khung mới** `moi-01`, `moi-02`, chèn SAU F3.
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "Lỗi nặng: F3→F4 IoU 0,15 – từ treo nhảy thẳng xuống nằm bẹp. Thêm tư thế đang rơi giữa không trung; tốt nhất tách tuột → rơi → chạm đất."
  - moi-01: vừa tuột khỏi cành, đang rơi giữa không trung (thân nghiêng ~45°, vải bay lên).
  - moi-02: sắp chạm đất (thân gần nằm ngang, vải chùng), ngay trên mặt đất.
- **Ảnh tham chiếu:** `018-tang-chet-thamchieu.png` (1308×336) = ghép ngang F3 | [Ô TRỐNG] | [Ô TRỐNG] | F4, cắt cửa sổ (x0=0, y0=0, rộng 104, cao 104) của ô 104×104 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art animation of the Mourning Veil (bird-skull veil creature hanging from a ceiling branch). The creature faces LEFT. Left = tearing loose from its branch, right = lying on the floor. Draw ONLY the 2 missing frames for the 2 empty dashed cells: cell 2 = falling in mid-air, body tilted about 45 degrees, veil cloth fluttering upward; cell 3 = just above the floor, body almost horizontal, cloth slackening. Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/tang-chet/moi-01.png`, `art/muot-2/tang-chet/moi-02.png` – mỗi tệp PNG RGBA đúng **104×104** (cỡ ô gốc), nền trong suốt, chân ở **[50, 87]** như khung gốc, quay TRÁI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 104 × cao 104, dán vào ô 104×104 trong suốt tại (0,0). Lưu kèm ảnh nguồn `art/muot-2/tang-chet/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 … F3 **moi-01** **moi-02** F4 … F8 (11 khung)
- **ms mới cho cả clip:** 67, 67, 67, 83, 50, 50, 100, 117, 117, 133, 133 (984 ms; bộ ChatGPT + 2×50 ms khung rơi)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** tang.hinh.chet: so_hinh 9→11.
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
