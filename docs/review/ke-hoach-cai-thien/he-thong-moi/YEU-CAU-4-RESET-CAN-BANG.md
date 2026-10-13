# Yêu cầu đợt 4: reset đồ trong save về đúng chỉ số + soát cân bằng (chủ dự án 13/10 14:03)

"Hãy reset đồ hiện tại của các saved game về đúng chỉ số, và thực hiện check cân bằng game: đồ, chỉ số, kỹ năng, hệ thống upgrade, hệ thống kiếm vật phẩm."

Làm SAU đợt 1–3 và đợt 2 (đọc `bao-cao-1.md`, `bao-cao-2.md`, `bao-cao-3.md`).

## A. Reset save (máy + mây)
- Tăng phiên bản chuyển đổi trong `fixSave` (engine.js) để MỌI save (kể cả save đã chuyển ở đợt 1) chạy lại một lần:
  - 4 vũ khí cố định: chỉ giữ cấp (Trắng/Mầm/Thành hình/Thức tỉnh), hệ, số lần mài; mọi chỉ số khác (sát thương, bậc, dòng phụ, dòng vũ khí, chỉ số cũ còn sót) tính LẠI từ công thức hiện hành (`G.VK_MOI`, `G.STAGE_MULT`, `G.wBase`…). Mài vượt mức tối đa hiện hành thì kẹp và hoàn quặng/vàng.
  - Trang phục: chỉ còn 4 bộ + cấp bộ (`boCap`), bộ đã mở đúng theo trùm đã hạ; xoá sạch mã đồ mặc cũ.
  - Chỉ số nhân vật (cấp, máu, công…) tính lại từ cấp + điểm kỹ năng; điểm kỹ năng/điểm chưởng phân bổ sai luật hoặc thừa thì hoàn lại cho người chơi phân lại.
  - Hành trang: xoá vật phẩm không còn tồn tại; nguyên liệu còn dùng giữ nguyên.
  - Không mất vàng, linh khí, cấp, sao ải, tiến độ vùng. Ghi một dòng "đã cân lại đồ theo luật mới" lên màn làng một lần.
- Lưu mây: cùng định dạng; không đụng đăng nhập Google, `?cloud=0`, không chép apiKey. Save mây cũ khi tải về cũng chạy qua bước này.

## B. Soát cân bằng (KHÔNG chạy game, KHÔNG Playwright — chỉ tính bằng số liệu/script Node hoặc Python đọc bảng hằng số)
Soát và ghi bảng trong báo cáo, sửa chỗ lệch rõ (ghi số cũ → mới, lý do):
1. **Đồ / vũ khí:** sát thương 4 vũ khí theo cấp × hệ, tốc đánh, tầm; DPS từng loại ở mỗi cấp — không loại nào trội/yếu quá ±20% nếu không có lý do (búa chậm mạnh, phi tiêu xa yếu hơn…).
2. **Chỉ số:** máu/công/thủ Zed theo cấp so với máu/sát thương quái từng vùng (Rừng già, Hang biển, Lâu đài cổ): số đòn để hạ quái thường/tinh anh/trùm, số đòn quái để hạ Zed — ở đúng mức cấp/nâng cấp người chơi có được khi tới vùng đó.
3. **Kỹ năng:** điểm kỹ năng (công/thủ/hệ), chưởng, skill 4 bộ (`G.SKILL_BO`) — skill nào quá mạnh (Phân thân không hồi, Khiên nước chặn đòn trùm, Khí thế…) thì đề xuất + sửa số.
4. **Hệ thống nâng cấp:** giá linh khí nâng vũ khí 60/340/500, đổi hệ, nâng bộ (linh khí + vàng), mài — so với thu nhập linh khí/vàng mỗi ải → số ải cần chơi để lên từng mốc; mục tiêu: lên Mầm sau ~2–3 ải đầu, Thành hình quanh lúc tới trùm vùng 1, Thức tỉnh quanh vùng 2–3; bộ cấp 1 ngay sau khi mở bộ, cấp 3 cần cày lại vùng.
5. **Kiếm vật phẩm:** nguồn vàng/linh khí/nguyên liệu (quái, tinh anh, trùm, rương, qua ải, bán đồ) sau khi bỏ rơi đồ — có chỗ nào thành vô dụng (lái buôn, thợ may, rương…), có vòng lặp cày quá lợi không.
- Bảng hằng số cân bằng gom về một chỗ dễ chỉnh (nếu chưa có), báo cáo nêu đường dẫn.

## Luật
- **KHÔNG TEST** (không Playwright, không chạy game). Chỉ script tính số liệu, `node --check`, `python3 game/build.py`.
- Chỉ push nhánh `khoi-tao-du-an`; KHÔNG master, KHÔNG force push, KHÔNG PR. Bị từ chối thì `git pull --rebase` (xung đột `game/dist` thì lấy bản trên nhánh rồi chạy lại build.py).
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g

## Khi xong
`bao-cao-4.md` (tiếng Việt dễ hiểu: reset làm gì với save cũ; bảng cân bằng trước/sau theo 5 mục; mã commit), push, tự dừng.
