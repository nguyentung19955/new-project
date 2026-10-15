# Cua Đá (trùm nhỏ Hang biển) quá dễ — đứng sát tường trên / phải là thắng (15/10 17:10, sửa 17:08)

Chủ dự án chơi thử Cua Đá: **chỉ cần di chuyển sát tường bên trên hoặc bên phải là ăn** — gần như không chiêu nào với tới. Vấn đề là CẢ CON TRÙM, không riêng một chiêu.

Code: `game/js/boss.js` (Cua Đá: `atk` Kẹp càng, `chieu1` Đập càng rung sàn = vòng tròn quanh thân r80 + donut 80–118 ở pha sau, `chieu2` → `chieu_trum.js` `tuongTinhThe` Tường tinh thể: 2 tường cố định giữa phòng cx±70, mảnh ngang dài tối đa 96; chiêu cũ Mưa tinh thể quanh em bé), bảng AI `cuaDa: { w, wXa, cd, combo }`, `BODY.cuaDa`, di chuyển/nhắm của trùm nhỏ, `G.NOI_GIAN` (`js/data.js`).

Việc:
1. **Tìm vì sao đứng sát tường trên/phải an toàn** bằng mô phỏng Node (bot đứng sát mỗi mép / mỗi góc, đo máu mất mỗi phút, chiêu nào trúng / hụt; trùm có đi tới được không — có thể Cua Đá bị kẹp trong vùng giữa, không đuổi sát mép, hoặc chiêu chỉ vẽ quanh thân / giữa phòng, hoặc vùng bị kẹp ra ngoài sàn). Ghi rõ nguyên nhân bằng lời dễ hiểu.
2. Sửa để **không có chỗ đứng an toàn**: 
   - Trùm đuổi được tới sát mép (cua đi ngang nhanh), hoặc có chiêu kéo / ép người chơi ra khỏi mép.
   - Mỗi chiêu nhắm theo vị trí em bé (kể cả khi em bé sát mép / góc), vùng không bị cắt mất khi gần mép.
   - Tường tinh thể: dựng tường hai bên chỗ em bé đang đứng (nhốt, chừa một khe thoát ≥ 24), mảnh phủ hết sàn, 2 loạt so le (bỏ khe đứng yên an toàn); trùm vẫn đánh trong lúc tường đứng.
   - Có ít nhất một chiêu phạt việc đứng xa/sát mép (ví dụ mảnh tinh thể dội từ mép tường phòng vào, sóng lan tới hết sàn).
   - Giữ công bằng: báo trước ≥ 0,45 s đòn thường, ≥ 0,6 s vùng to (`G.NOI_GIAN.san`), luôn có lối né.
3. Rà nhanh 2 trùm nhỏ còn lại (Nấm Chúa, Hổ Lửa) và 3 trùm vùng xem có cùng kiểu "góc / mép an toàn" không (mô phỏng như mục 1); có thì ghi vào báo cáo (con nào, mép nào, máu mất / phút) và sửa luôn nếu cùng nguyên nhân chung (ví dụ di chuyển trùm bị kẹp giữa).
4. Cờ `?cuade=1` → Cua Đá như cũ.
5. Đo bằng bot cân bằng (`game/tests/balance.py`, `do_trum.py` của phiên `noi-gian-manh`, `--node`): ải có Cua Đá (2-1, 2-2, 2-3) trước/sau; bot "đứng mép" trước/sau. Mục tiêu: đứng mép không còn an toàn (máu mất / phút ≥ đứng giữa); thắng ải ở Sức mạnh khuyên dùng không tụt quá 12 điểm % (tụt quá thì hạ sát thương, không bỏ cơ chế).
6. Ảnh soát tĩnh `xem-cua-da.png`: bản đồ nhiệt "máu mất theo chỗ đứng" trước/sau, và sơ đồ chiêu mới.

**KHÔNG TEST bằng trình duyệt** — chỉ mô phỏng / bot Node, ảnh soát tĩnh, node --check, build.py. KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Phiên `quai-moi-lau` đang chạy song song — pull --rebase cẩn thận. Viết `bao-cao.md` (ngắn, dễ hiểu).
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
