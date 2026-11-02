# 019 – Màn Tang – vồ: 1 khung lao nửa đường giữa F6–F7 (P0)
- **Trạng thái:** XONG (02/11 – ảnh ChatGPT, đã đặt vào ô gốc)
- **Clip:** `quai.json → loai.tang.hinh.danh` – thư mục art gốc `art/quai-moi/tang/danh/` (9 khung `fNN.png`, ô 104×104, quay TRÁI, neo chân [50, 87])
- **Việc cần vẽ:** Vẽ **1 khung mới** `moi-01`, chèn SAU F6.
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "Giật F6→F7 (IoU 0,36). Thêm 1 khung lao nửa đường giữa F6–F7." Treo trần: khoá điểm treo.
- **Ảnh tham chiếu:** `019-tang-danh-thamchieu.png` (984×336) = ghép ngang F6 | [Ô TRỐNG] | F7, cắt cửa sổ (x0=0, y0=0, rộng 104, cao 104) của ô 104×104 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art animation of the Mourning Veil (bird-skull veil creature hanging from a ceiling branch). The creature faces LEFT. Draw ONLY the missing in-between frame for the middle empty dashed cell: the lunge halfway between the left and right frames. The hanging point on the ceiling branch stays fixed. Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/tang-danh/moi-01.png` – mỗi tệp PNG RGBA đúng **104×104** (cỡ ô gốc), nền trong suốt, chân ở **[50, 87]** như khung gốc, quay TRÁI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 104 × cao 104, dán vào ô 104×104 trong suốt tại (0,0). Lưu kèm ảnh nguồn `art/muot-2/tang-danh/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 … F6 **moi-01** F7 F8 (10 khung)
- **ms mới cho cả clip:** 100, 100, 100, 83, 67, 50, 50, 33, 83, 117 (783 ms; bộ ChatGPT + 33 ms khung lao)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** so_hinh 9→10; khung_trung [6,7,8]→[6,7,8,9].
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
