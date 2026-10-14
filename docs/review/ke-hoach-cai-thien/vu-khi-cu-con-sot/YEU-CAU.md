# Bỏ hết hình/tên vũ khí cũ còn sót (14/10 10:38 — chủ dự án: "sao vẫn là các vũ khí cũ hiển thị")

Hệ thống hiện tại: đúng 4 vũ khí cố định — Kiếm, Thương, Búa, Phi tiêu (type 'bow' trong code) — cấp Trắng → Mầm → Thành hình → Thức tỉnh (`G.VK_MOI`, `vk_moi.js`), ảnh mới ở `zed-vk.sprite.json` (4 loại × 4 cấp); bậc ép đồ 7 màu ở `G.EP_DO`. Nhân vật chính hiển thị tên "Cu Tí" (phiên đổi tên vừa chạy — git pull trước, giữ thay đổi đó).

Sửa mọi chỗ người chơi còn thấy vũ khí cũ:
1. **Làng**: 2 vũ khí "sống" có mắt bay cạnh nhân vật (`village_scene.js:842-851`, gọi ở ~1061, vẽ bằng `G.weaponArt`) → BỎ (nhân vật đã cầm vũ khí trên tay).
2. **Phi Thương** (`fx_he.js:723-739 drawSpear`): ngọn giáo tre cũ bay/cắm/quay về → vẽ bằng ô `zed-vk` thuong đúng cấp, xoay theo hướng bay (như `fx_dan.js:298` làm cho phi tiêu).
3. **Nút Đánh / Đặc biệt** (`btn_art.js:886-892`, ảnh `gd-nut-danh-<sword|spear|hammer>`, `gd-nut-dac-biet-<sword|spear|hammer>` là bộ cũ 11/10; chỉ `-bow` là mới): dựng lại 6 ảnh nút cho kiếm/thương/búa cùng phong cách 2 nút `-bow` mới — đế nút + ô `zed-vk` (cấp Trắng) ở giữa; nút Đặc biệt thêm nét hiệu ứng nhỏ của chiêu (kiếm: vệt chém cong; thương: vệt phóng thẳng; búa: vết nứt/sóng đất) lấy từ ảnh hiệu ứng đã có (`hu-chem-kiem`, `hu-chem-bua`, …). Bỏ hình vẽ code `ICON.w_*`, `ICON.s_*` cũ làm dự phòng, thay dự phòng bằng ô `zed-vk`.
4. **Icon vũ khí lúc chưa tải xong `zed-vk`** (`vk_moi.js:602-608` rơi về `A.weaponIcon`/`WA.icon` cũ): nạp `zed-vk` sớm cùng ảnh lõi trước khi vào làng; trong lúc chờ thì KHÔNG vẽ gì (hoặc ô trống), không bao giờ vẽ vũ khí cũ.
5. **Tên & chữ cũ**:
   - "Giáo" → "Thương" (`data.js:50` và mọi chỗ tên loại vũ khí; mô tả kỹ năng/chiêu nếu có "giáo").
   - Chữ hướng dẫn cũ "Cung … Mưa Tên", "Giáo" (`moves.js:117-118`, `village.js:471`) → theo 4 vũ khí mới (Phi tiêu: "Mưa phi tiêu").
   - Bậc màu cũ `G.RARITY` (Thường/Lam/Tím/Vàng) còn dùng cho màu tên, nhãn "bậc …" màn nhặt đồ, khung ô `gd-o-vk-0..3` (`stage.js:1245,1360,1370`, `hanh_trang.js:162`, `village.js:205`, `btn_art.js:1019`): đổi sang màu/tên theo **bậc ép đồ** `G.EP_DO` (Trắng→Rực lửa) của món đó (khung ô vẽ viền màu bậc như `ep_do.js E.vien`); bỏ câu "xem ở Bà Hàng Xén" (không còn rơi đồ).
   - Bản tiếng Anh `ngon_ngu_en.js`: bỏ các dòng tên vũ khí cũ không còn dùng (Cung Rồng Rắn, Ná Thun, Đàn Bầu…) và sửa bản dịch các câu đã đổi.
6. Đồng hành/NPC trong truyện vẫn dùng `weapon_art.js` (cố ý) — giữ, nhưng kiểm lại: nếu cảnh truyện vẽ 3 bạn nhỏ ảnh mới thì KHÔNG vẽ thêm vũ khí cũ lên họ.
Giữ cờ tắt cho thay đổi hình nếu tiện (`?vkcu=1` để xem lại kiểu cũ). Không đổi luật/số. Giữ bản build dưới trần (ảnh máy chủ < 26 MB, bản một tệp < 30 MB).
**TUYỆT ĐỐI KHÔNG TEST** — chỉ xử lý ảnh, ảnh soát tĩnh `xem-nut-vk.png` (6 nút mới cạnh 2 nút -bow), node --check, build.py. Ràng buộc: KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Xung đột game/dist khi rebase: lấy bản trên nhánh rồi build lại. Viết `bao-cao.md`.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
