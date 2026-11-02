# 010 – Nấm Thở – đánh: VẼ LẠI F3–F7 (P0)
- **Trạng thái:** VẼ LẠI (02/11, phiên MƯỢT-2 kiểm: dáng thay-03…07 đọc rõ đòn phun (đạt ý ChatGPT) nhưng LỆCH PHONG CÁCH – mất viền đen 1 px, mũ nhòe/tô mịn, mất mảng viền vàng ở mép mũ như F0–F2/F8, thân hơi nhỏ hơn. Cần: viền tối 1 px, mảng màu phẳng sắc, giữ chiều rộng mũ và thân như F2/F8, mép mũ phía trước vẫn có vệt vàng hổ phách. Prompt thêm: 'same 1-pixel near-black outline, flat crisp pixel shading, keep the amber rim on the cap edge, same cap width as the side frames, no blur'.)
- **Clip:** `quai.json → loai.nam.hinh.danh` – thư mục art gốc `art/quai-moi/nam/danh/` (9 khung `fNN.png`, ô 84×84, quay TRÁI, neo chân [43, 71])
- **Việc cần vẽ:** Vẽ **5 khung** `thay-03` … `thay-07`, THAY F3–F7 (giữ F0–F2, F8).
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "Mượt nhưng KHÔNG đọc được là đang đánh (chỉ nghiêng đầu nhẹ, cao đổi 4%). Vẽ lại F3–F7: mũ co tích lực → nghiêng tới → F5 phun bào tử mạnh → giật lùi."
  - thay-03 mũ co lại tích lực · thay-04 nghiêng tới · thay-05 PHUN (mũ bật mở, dáng mạnh nhất – không vẽ đám bào tử, hiệu ứng đã có riêng) · thay-06 giật lùi · thay-07 hồi về gần F8.
  - Chân giữ đúng chỗ (dấu +).
- **Ảnh tham chiếu:** `010-nam-danh-thamchieu.png` (1860×276) = ghép ngang F2 | [Ô TRỐNG] | [Ô TRỐNG] | [Ô TRỐNG] | [Ô TRỐNG] | [Ô TRỐNG] | F8, cắt cửa sổ (x0=0, y0=0, rộng 84, cao 84) của ô 84×84 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art animation of the Breathing Shroom (grey-blue mushroom creature with a breathing cap). The creature faces LEFT. Left = wind-up frame, right = recovery frame. Draw ONLY the 5 empty dashed cells as a clear spore attack: 1 cap squeezes down gathering force; 2 leaning forward; 3 strongest pose - cap bursting open forward (do NOT draw the spore cloud, it is a separate effect); 4 recoil backward; 5 settling back toward the right frame. Feet stay planted at "+". Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/nam-danh/thay-03.png`, `art/muot-2/nam-danh/thay-04.png`, `art/muot-2/nam-danh/thay-05.png`, `art/muot-2/nam-danh/thay-06.png`, `art/muot-2/nam-danh/thay-07.png` – mỗi tệp PNG RGBA đúng **84×84** (cỡ ô gốc), nền trong suốt, chân ở **[43, 71]** như khung gốc, quay TRÁI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 84 × cao 84, dán vào ô 84×84 trong suốt tại (0,0). Lưu kèm ảnh nguồn `art/muot-2/nam-danh/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 F1 F2 **thay-03 … thay-07** F8 (9 khung)
- **ms mới cho cả clip:** 120, 100, 100, 67, 50, 67, 83, 100, 100 (787 ms, bộ ChatGPT)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** số khung giữ 9; khung_trung [5,6,7] giữ (F5 = phun).
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
