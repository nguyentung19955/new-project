# Bước 2 — LẬP KẾ HOẠCH chi tiết (CHƯA viết code game)

Chủ game: "lên kế hoạch thực hiện chứ chưa làm vội, lên kế hoạch từng bước một". Phiên này CHỈ đọc code + viết kế hoạch, không sửa game/.
Phạm vi: sổ yêu quái, nhiệm vụ hằng ngày, thành tựu. Đọc: docs/thiet-ke-game.md mục 14, docs/ke-hoach/BUOC-2-3-4.md, docs/cot-truyen/CHUNG.md,
code hiện có liên quan (ai_ngay.js ải ngày, village.js, hanh_trang.js, bo_nho.js/cloud.js chỉ để hiểu cách lưu, data.js, ngon_ngu*.js).

Viết docs/ke-hoach/buoc-2/KE-HOACH.md gồm:
1. Thiết kế từng hệ (người chơi thấy gì, ở đâu trong làng/menu, luật, thưởng cụ thể có số, danh sách đầy đủ: mọi trang sổ (30 quái + tinh anh + trùm),
   mẫu nhiệm vụ hằng ngày (~20 mẫu, cách chọn 3/ngày), ~30 thành tựu + danh hiệu). Hợp với game cho trẻ con, tránh cày nặng.
2. Dữ liệu lưu thêm (khoá nào, tương thích bản lưu cũ + lưu mây, không đổi cách đăng nhập).
3. Ảnh cần gen: danh sách đầy đủ + prompt ngắn tiếng Anh từng cái (phong cách khung đồng Đông Sơn như gd-khung-bang), ghi ảnh mẫu kèm (đường dẫn tệp trong repo).
4. Chia việc code thành các bước nhỏ, mỗi bước 1 phiên (2–3 phiên chạy song song được), ghi tệp đụng tới, cờ quay lui, cách kiểm.
5. Ảnh hưởng cân bằng (thêm vàng/quặng/đá) + cách bot đo lại.
6. Câu hỏi cần chủ game quyết (ngắn, có lựa chọn đề xuất).
Viết tiếng Việt dễ hiểu (chủ game không rành kỹ thuật); phần kỹ thuật để cuối.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
Không đụng master, không force push, không PR. Push (bị từ chối thì pull --rebase rồi push lại). Xong push, tự dừng.
