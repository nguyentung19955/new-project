# Yêu cầu: hiệu ứng vũ khí Thức tỉnh bị chồng chéo, vũng/mây độc lẫn đốm tím (13/10 12:36)

## Chủ dự án báo
"Hiệu ứng đang bị chồng chéo quá ở vũ khí lúc thức tỉnh, bãi độc tôi thấy cả gì tím tím kia." Ảnh: `anh-chu-du-an.png` (Rừng già 4, thương hệ Độc cấp Thành hình/Thức tỉnh: 2 đám độc xanh to, bên trong lẫn mảng tím-xám, Zed đứng trong một đám).

## Đã soát sơ bộ (điều phối)
- Ảnh AI `hu-vung-doc`, `hu-may-doc` (game/art/custom) gần như toàn xanh chanh, chỉ có vài điểm hồng/tím lẻ ở mép (sót viền khi tách nền) → cần làm sạch.
- Phần tím nhiều khả năng do các lớp VẼ BẰNG CODE vẫn chồng lên ảnh AI: ví dụ `fx_he.js` drawCloud (đốm tím rgba(154,95,214)), bong bóng/đốm tím `#b98af0` trong drawHeZone, hazeSprite, `fx_chuong.js` mây độc, dấu hệ trên quái, nhuộm độc lên người... Cần tìm đúng lớp nào đang vẽ trong cảnh này.

## Cần làm
1. Tìm mọi lớp hiệu ứng sinh ra khi đánh bằng vũ khí hệ Độc ở cấp Thành hình và Thức tỉnh (vũng độc, mây độc, bọt, hạt, dấu hệ, vệt...). Liệt kê trong báo cáo: lớp nào, tệp/dòng, có ảnh AI hay vẽ code.
2. Khi đã có ảnh AI cho một hiệu ứng thì KHÔNG vẽ thêm lớp code cùng loại đè lên (nhất là đốm/bong bóng tím). Bỏ các đốm tím lẻ ở mép ảnh `hu-vung-doc`, `hu-may-doc` (chuyển điểm hồng/tím lẻ sang trong suốt).
3. Giảm chồng chéo: vũng/mây độc mới sinh gần vũng cũ (trùng > ~50% diện tích) thì gộp/làm mới vũng cũ thay vì đẻ thêm; giới hạn số vũng/mây của người chơi cùng lúc (ví dụ tối đa 2–3); mây độc trên đầu nhân vật mờ hơn (để thấy rõ Zed). KHÔNG đổi sát thương, thời gian, bán kính vùng gây hại.
4. Soát tương tự hệ Lửa và Băng ở cấp Thức tỉnh (cùng kiểu chồng lớp), sửa cùng nguyên tắc.
5. Cờ `?gonhu=0` để tắt (về như cũ).

## Luật
- **KHÔNG TEST** (không Playwright, không chạy game). Chỉ `node --check`, ảnh soát tĩnh bằng Python nếu cần.
- Có phiên khác đang sửa `game/js/zed_moi.js`: KHÔNG sửa tệp đó.
- Chỉ push nhánh `khoi-tao-du-an`; KHÔNG master, KHÔNG force push, KHÔNG PR. Bị từ chối thì `git pull --rebase` (xung đột `game/dist` thì lấy bản trên nhánh rồi chạy lại `python3 game/build.py`).
- Không chép apiKey trong `game/js/firebase-config.js`; không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`.
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g

## Khi xong
`bao-cao.md` cùng thư mục (tiếng Việt dễ hiểu, mã commit, cách tắt), push, tự dừng.
