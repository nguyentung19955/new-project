# 002 – Kiếm Khách – đập đất: 1 khung chuyển giữa F3–F4 (P0)
- **Trạng thái:** XONG (02/11, phiên chính vẽ bằng ChatGPT; đã căn theo khung hàng xóm – IoU hàng xóm ≥ 0.87; ảnh 256×256 neo [128,172])
- **Clip:** `nhan-vat.json → clip.dapdat` – thư mục art gốc `art/kiem-khach/dapdat/` (14 khung `fNN.png`, ô 256×256, quay PHẢI, neo chân [128, 172])
- **Việc cần vẽ:** Vẽ **1 khung mới** `moi-01`, chèn SAU F3 (giữa F3 lao xuống và F4 chạm đất).
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "Khựng rõ F3→F4 (đảo người → chạm đất 1 bước). Thêm 1 khung chuyển giữa F3–F4 (thân gần ngang, chân hướng đất); gai đỉnh F5–F7 rồi thu."
  - Khung đúng lúc sắp chạm đất: thân gần ngang/đang gập xuống, chân hướng xuống đất, kiếm chĩa xuống sắp cắm; chân sát vạch đất (dấu +). Chưa có gai/bụi băng (gai bắt đầu ở F4).
- **Ảnh tham chiếu:** `002-kk-dapdat-thamchieu.png` (1218×402) = ghép ngang F3 | [Ô TRỐNG] | F4, cắt cửa sổ (x0=64, y0=59, rộng 130, cao 126) của ô 256×256 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art ground-pound (plunging sword strike) of Kiếm Khách (The Masked Wanderer): white mask with icy-blue eye slit, long silver-cream ponytail, dark layered clothing with cyan rune marks, two icy-blue swords. Draw ONLY the missing in-between frame for the middle empty dashed cell: the instant just before impact - body folding down almost horizontal, legs pointing to the ground, swords pointing down about to hit, feet just at the ground line marked by "+". No ice spikes or impact effect yet. Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/kk-dapdat/moi-01.png` – mỗi tệp PNG RGBA đúng **256×256** (cỡ ô gốc), nền trong suốt, chân ở **[128, 172]** như khung gốc, quay PHẢI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 130 × cao 126, dán vào ô 256×256 trong suốt tại (64,59). Lưu kèm ảnh nguồn `art/muot-2/kk-dapdat/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 F1 F2 F3 **moi-01** F4 … F13 (15 khung)
- **ms mới cho cả clip:** 55, 55, 45, 45, 33, 45, 45, 45, 50, 55, 55, 55, 55, 70, 80 (798 ms; bộ ChatGPT 14 khung + 33 ms cho khung chuyển)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** so_hinh 14→15; khung_lao giữ 3 (F3 vẫn là khung giữ khi lao; khung mới là khung chạm đất đầu tiên); trung [4,5,6,7,8]→[5,6,7,8,9].
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
