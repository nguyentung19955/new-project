# 005 – Kiếm Khách – lướt: 2 khung đứng dậy giữa F4–F5 (P0)
- **Trạng thái:** CHỜ
- **Clip:** `nhan-vat.json → clip.luot` – thư mục art gốc `art/kiem-khach/luot/` (6 khung `fNN.png`, ô 256×256, quay PHẢI, neo chân [128, 172])
- **Việc cần vẽ:** Vẽ **2 khung mới** `moi-01`, `moi-02`, chèn SAU F4 (giữa F4 thấp người và F5 đứng thẳng).
- **Dáng khung mới (lời ChatGPT, duyệt 02/11):** "Dễ giật ở đoạn ra: từ thấp bật đứng trong 1 khung. Thêm 1–2 khung đứng dậy trung gian; giữ 2–3 khung lao (hold có chủ ý)."
  - moi-01: thân nâng lên ~1/3 – còn chúi tới, chân sau kéo lên, tóc vẫn bay ngang ra sau.
  - moi-02: thân gần đứng (~2/3), chân về gần nhau, tóc rủ dần xuống; kiếm hạ dần về dáng F5.
  - Chân trước đặt đúng vạch đất (dấu +).
- **Ảnh tham chiếu:** `005-kk-luot-thamchieu.png` (1152×300) = ghép ngang F4 | [Ô TRỐNG] | [Ô TRỐNG] | F5, cắt cửa sổ (x0=79, y0=90, rộng 91, cao 92) của ô 256×256 rồi phóng ×3 nearest, nền #FF00FF. Ô viền đứt = khung cần vẽ; dấu "+" trong ô trống = vị trí neo chân.
- **Prompt gửi ChatGPT (kèm ảnh tham chiếu, mỗi ảnh 1 cuộc trò chuyện mới):**
  ```
  This strip shows consecutive frames of a 2D side-view pixel-art dash of Kiếm Khách (The Masked Wanderer): white mask with icy-blue eye slit, long silver-cream ponytail, dark layered clothing with cyan rune marks, two icy-blue swords: left = low forward dash pose, right = standing recovery pose. Draw ONLY the 2 missing in-between frames for the 2 empty dashed cells: cell 2 = body rising about one third (still leaning forward, back leg pulling in, hair still streaming back); cell 3 = body almost upright (two thirds), feet coming together, hair starting to fall, swords lowering toward the right pose. Front foot on the ground line marked by "+". Use the image generation tool and DRAW. Keep EXACTLY the same character design, proportions, scale, palette, outline and pixel size as the neighbouring frames; do not redesign, do not add details, effects, text, shadow or ground. Same foot position as marked by the small "+" (feet on the same ground line). Output the frame(s) as crisp pixel art on flat #FF00FF, laid out in the same order as the empty cells.
  ```
- **Lưu ảnh ra:** `art/muot-2/kk-luot/moi-01.png`, `art/muot-2/kk-luot/moi-02.png` – mỗi tệp PNG RGBA đúng **256×256** (cỡ ô gốc), nền trong suốt, chân ở **[128, 172]** như khung gốc, quay PHẢI. Cách đặt: thu ảnh ChatGPT về cỡ thật (÷3, nearest) theo cửa sổ rộng 91 × cao 92, dán vào ô 256×256 trong suốt tại (79,90). Lưu kèm ảnh nguồn `art/muot-2/kk-luot/nguon-chatgpt.png`.
- **Thứ tự mới của clip sau khi lắp:** F0 F1 F2 F3 F4 **moi-01** **moi-02** F5 (8 khung)
- **ms mới cho cả clip:** 33, 33, 50, 50, 50, 33, 50, 67 (366 ms; bộ ChatGPT 33,33,50,50,50,67 + 33/50 cho 2 khung đứng dậy)
- **Sự kiện dời chỉ số (phiên lắp tự làm):** so_hinh 6→8 (clip chạy theo tỉ lệ thời gian lướt – không có khung sự kiện). Lớp sức mạnh có thư mục luot → phiên lắp tự đặt lớp theo điểm neo đo.
- **Luật:** giữ nguyên 100% thiết kế (màu, cỡ, chi tiết); không sửa khung gốc; không vẽ bằng code/nội suy. Ảnh lệch dáng/sai cỡ → phiên lắp đổi trạng thái thành "VẼ LẠI" kèm lý do.
- **Khi xong:** phiên chính đổi Trạng thái thành `XONG` (ghi cỡ ảnh, số tệp) rồi push; phiên MƯỢT-2 sẽ lắp vào game.
