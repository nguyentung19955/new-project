# Đưa 10 quái Hang biển vẽ lại (6 động tác) vào game (15/10 14:05)

Làm y như phiên `quai-moi-6-con` (đọc `../quai-moi-6-con/YEU-CAU.md` + `bao-cao.md`, DÙNG LẠI `../quai-moi-6-con/cong-cu/` và `../quai-moi-4-con/cong-cu/`) cho 10 mã:
`cua`, `caCon`, `oc`, `haiQuy`, `caChuon`, `caNoc`, `sua`, `nhim`, `cuaTuong`, `caNocChua`.

Ảnh đã cắt: `docs/anh-goc/quai-moi/dong-tac/<mã>-<bước>-cat/<hàng>/khung-NN.png` (bước 1-dung idle, 2-di move, 3-bao-don tele, 4-danh atk, 5-trung-don hit 4 khung, 6-chet die). Ảnh mẫu `docs/anh-goc/quai-moi/<mã>-mau-moi.png`. Bản dự phòng `*-b-cat` (cuaTuong 3/4, haiQuy 4) — dùng bản chính.

**Thiếu**: `oc-5-trung-don` (chưa gen). Tạm dùng: khung 1–2 của `oc-3-bao-don` (rút vào vỏ) + khung 1–2 của `oc-1-dung` làm hàng hit 4 khung; ghi rõ trong báo cáo để thay khi có ảnh (viết công cụ dựng lại chỉ một con: `--chi oc`).

Lưu ý riêng:
- Loại thân (xem `tools/xuong-sprite/nguon/khung.js`): cá, cá con, cá chuồn, cá nóc, cá nóc chúa, sứa = **bay/bơi** (không đường đất, căn theo tâm thân, giữ độ cao bơi như tấm cũ); cua, ốc, cua tướng, hải quỳ, nhím = có đất. Hải Quỳ đứng yên trên đá (đá không trượt).
- Cá Con: bầy 3 con, căn theo tâm bầy.
- Đạn/vật do code vẽ: tia nước Hải Quỳ, gai Cá Nóc/Nhím, vũng điện Sứa, vệt nhớt Ốc — ảnh đánh không vẽ vật bay, giữ nguyên code.
- Ốc: kỹ năng rút vỏ (`js/ky_nang_quai.js` mục `oc`) — hàng tele = rút vào vỏ; nếu code có trạng thái "đang trong vỏ" dùng khung cuối hàng tele giữ suốt lúc đó (không vẽ code mới, chỉ chọn khung).
- Cua Tướng, Cá Nóc Chúa là tinh anh: hàng `chieu1/chieu2` theo `chieu_trum.js` → dùng lại hàng gần nhất như phiên trước. Cá Nóc Chúa Phồng lăn: atk có khung lăn tròn — lặp suốt lúc lăn nếu hợp.
- Hàng chết có vật rơi (mũ, muôi, cờ, vương miện, mảnh vò) — giữ.
- Chuẩn cỡ theo thân: nhiều tấm AI vẽ to hơn hẳn (trúng đòn Cá Nóc Chúa, Cua Tướng, Nhím…).

Việc: dựng 10 tấm `game/art/custom/<mã>.sprite.json` (giữ `rong/cao` cũ, `net: 2`, `can_tam`, `goc`), thời gian khớp kỹ năng, mở rộng cờ `?quaicu=1` cho 10 con, ảnh soát `xem-bien.png` + `xem-bien.gif`, dung lượng người chơi tải trước/sau (trần 20 MB; nếu vượt thì giảm màu/viền trống, ghi rõ). Ảnh Hang biển chỉ tải khi vào vùng biển.

**TUYỆT ĐỐI KHÔNG TEST** — chỉ xử lý ảnh, ảnh soát tĩnh, node --check, build.py. KHÔNG đụng master, KHÔNG force push, KHÔNG PR, không chép apiKey, không làm hỏng đăng nhập Google/lưu mây/?cloud=0. Viết `bao-cao.md`.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
