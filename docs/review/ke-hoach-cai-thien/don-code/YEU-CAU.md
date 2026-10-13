# Yêu cầu: dọn code thừa còn sót sau khi bỏ nhân vật/hệ thống cũ (chủ dự án chọn, 13/10 15:27)

Sau đợt 2 (`he-thong-moi/bao-cao-2.md` mục "việc còn lại"): `G.ZED`, `G.ZED_MOI`, `G.HE_MOI` luôn đúng nên nhiều nhánh cờ cũ thành mã chết.

## Cần làm
1. `game/js/zed_moi.js`: bỏ nhánh/chú thích cờ cũ (`?zedmoi=0`, hàm `bat()` luôn đúng, nhắc `ghep_lop`), giữ nguyên hành vi hiện tại và mọi cờ còn dùng (`?camvk`, `?huongvk`, `?eosua`, `?chaydanh`, `?zedbo`, `?buakhop`, `?hudot3`, `?tuluc`, `?gonhu`, `?skillbo`…).
2. Toàn bộ `game/js/*.js`: tìm nhánh `if (!G.ZED)`, `G.ZED_MOI === false`, `!G.HE_MOI`, `G.HKEYS_CHOI`, chọn em bé, `weapon_art` họ cũ, `wRar`/bậc màu, `marks` dấu ấn từng vũ khí, hàm không còn ai gọi (dò bằng grep tên hàm), biến/hằng không ai đọc → xoá. Dữ liệu NPC (3 em bé trong làng), quái, giao diện còn dùng thì GIỮ.
3. Hợp nhất trùng lặp dễ thấy (hàm giống nhau ở hai tệp) nếu an toàn.
4. Ghi dung lượng `game/js` và bản một tệp trước/sau.

## Luật
- **KHÔNG TEST** (không Playwright, không chạy game). Chỉ `node --check` mọi tệp, `python3 game/build.py`, grep kiểm tham chiếu trước khi xoá.
- Có phiên khác đang sửa số cân bằng (`data.js`, `tests/`): tránh sửa các bảng hằng số; xoá mã chết trong `data.js` thì rebase cẩn thận.
- Không chép apiKey; không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`, chuyển save cũ (`fixSave`, `vk_moi.js` — KHÔNG xoá đường đọc save cũ).
- Chỉ push nhánh `khoi-tao-du-an`; KHÔNG master, KHÔNG force push, KHÔNG PR. Bị từ chối thì `git pull --rebase` (xung đột `game/dist` thì lấy bản trên nhánh rồi chạy lại build.py).
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g

## Khi xong
`bao-cao.md` cùng thư mục (tiếng Việt: đã xoá gì, dung lượng trước/sau, mã commit), push, tự dừng.
