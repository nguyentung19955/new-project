# 009 – Nấm Thở – chết: 1 khung gập thân giữa F5–F6 (P0)
- **Trạng thái:** VẼ LẠI (02/11, phiên MƯỢT-2 kiểm: dáng moi-01 đúng ý nhưng KHÔNG CÓ VIỀN ĐEN 1 px như mọi khung gốc, mũ tô mịn/nhòe, chân nhạt – nhìn lệch phong cách khi chạy. Cần: viền tối 1 px quanh mũ và thân, mảng màu phẳng sắc như F5/F6, giữ cỡ mũ. Prompt thêm: 'same 1-pixel near-black outline around every shape, flat crisp pixel shading, no blur, no soft gradients'.)
- **Clip:** `quai.json → loai.nam.hinh.chet` – thư mục art gốc `art/quai-moi/nam/chet/` (9 khung `fNN.png`, ô 84×84, quay TRÁI, neo chân [43, 71])
- **Việc cần vẽ:** Vẽ **1 khung mới** `moi-01`, chèn SAU F5.
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "F1–F4 gần đứng yên rồi F5→F6 nằm ngang đột ngột. Thêm dáng gập thân/khuỵu giữa F5–F6; giữ xác."
  - Thân gập/khuỵu, mũ đổ nghiêng ~45°, nửa đường giữa F5 và F6; chân ở vạch đất.
- **Ảnh tham chiếu:** `009-nam-chet-thamchieu.png` (804×276) = ghép ngang F5 | [Ô TRỐNG] | F6, cắt cửa sổ (x0=0, y0=0, rộng 84, cao 84) của ô 84×84 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art animation of the Breathing Shroom (grey-blue mushroom creature with a breathing cap). The creature faces LEFT. Draw ONLY the missing in-between frame for the middle empty dashed cell: the mushroom collapsing - stem buckling, cap tipping about 45 degrees, halfway between the left frame and the lying frame on the right. Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/nam-chet/moi-01.png` – mỗi tệp PNG RGBA đúng **84×84** (cỡ ô gốc), nền trong suốt, chân ở **[43, 71]** như khung gốc, quay TRÁI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 84 × cao 84, dán vào ô 84×84 trong suốt tại (0,0). Lưu kèm ảnh nguồn `art/muot-2/nam-chet/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 … F5 **moi-01** F6 F7 F8 (10 khung)
- **ms mới cho cả clip:** 83, 83, 83, 100, 100, 117, 100, 117, 117, 100 (1000 ms; bộ ChatGPT 9 khung + 100 ms khung gập)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** nam.hinh.chet: so_hinh 9→10.
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
