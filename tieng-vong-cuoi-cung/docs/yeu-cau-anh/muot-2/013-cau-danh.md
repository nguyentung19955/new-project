# 013 – Khuyết Cẩu – đánh: VẼ LẠI F3 và F7 (P0)
- **Trạng thái:** VẼ LẠI (02/11, phiên MƯỢT-2 kiểm: thay-03 và thay-07 LỆCH PHONG CÁCH – hình nhòe, lấm tấm hạt rời, mất viền tối 1 px và mảng màu phẳng như F2/F4/F8; thay-07 đầu hất thẳng đứng quá xa, thân mất khối, trông như con khác. Cần: giữ đúng khối thân/chân/cành như F6–F8, chỉ đổi đầu-cổ (thay-03: cúi cổ thấp mõm khép; thay-07: đầu hất lên-ra sau ~30°), viền tối 1 px, nét sắc, không hạt rời. Prompt thêm: 'keep the body, legs and branches pixel-identical to the side frames, change ONLY head and neck; same 1-pixel dark outline, flat crisp shading, no noise, no blur'.)
- **Clip:** `quai.json → loai.cau.hinh.danh` – thư mục art gốc `art/quai-moi/cau/danh/` (9 khung `fNN.png`, ô 88×88, quay TRÁI, neo chân [44, 69])
- **Việc cần vẽ:** Vẽ **2 khung** `thay-03` (thay F3) và `thay-07` (thay F7). Giữ F4–F6 (há mõm/nhả cầu).
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "Chưa đạt: chân trượt 15,4% – trông như bước tới cắn chứ không phải đứng há mõm bắn. Khoá chân trụ; F3 hạ cổ tích năng lượng, F4–F5 há mõm, F6 nhả cầu, F7 giật lùi, F8–F9 hồi."
  - thay-03: hạ cổ thấp tích năng lượng, mõm còn khép/hé – 4 chân đứng yên đúng chỗ các khung khác.
  - thay-07: giật lùi sau khi nhả cầu – đầu hất lên-ra sau, thân dồn về sau, chân không đổi chỗ.
- **Ảnh tham chiếu:** `013-cau-danh-thamchieu.png` (1668×288) = ghép ngang F2 | [Ô TRỐNG] | F4 | F6 | [Ô TRỐNG] | F8, cắt cửa sổ (x0=0, y0=0, rộng 88, cao 88) của ô 88×88 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art animation of the Hollow Hound (bony skull-headed hound with branches growing on its back). The creature faces LEFT. Draw ONLY the 2 empty dashed cells: cell 2 = head and neck lowered, charging energy, jaw still closed or barely open; cell 5 = recoil right after spitting the energy orb - head tossed up and back, weight shifted back. All four feet stay exactly where they are in the other frames (no stepping). Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/cau-danh/thay-03.png`, `art/muot-2/cau-danh/thay-07.png` – mỗi tệp PNG RGBA đúng **88×88** (cỡ ô gốc), nền trong suốt, chân ở **[44, 69]** như khung gốc, quay TRÁI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 88 × cao 88, dán vào ô 88×88 trong suốt tại (0,0). Lưu kèm ảnh nguồn `art/muot-2/cau-danh/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 F1 F2 **thay-03** F4 F5 F6 **thay-07** F8 (9 khung)
- **ms mới cho cả clip:** 67, 83, 100, 67, 50, 50, 67, 83, 100 (667 ms, bộ ChatGPT)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** số khung giữ 9; chieu.khung_ban giữ 4.
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
