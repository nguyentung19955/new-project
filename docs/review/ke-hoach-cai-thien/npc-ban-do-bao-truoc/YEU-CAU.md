# NPC mới, bản đồ chọn ải, thẻ ô ải, vòng báo trước bằng hoạt ảnh, nén dung lượng (14/10 09:05)

Đọc trước `docs/review/ke-hoach-cai-thien/trum-moi/bao-cao-*.md` và dùng lại công cụ ở `trum-moi/cong-cu/` (cắt, co, bảng màu, dựng sprite.json).

## 1. Bảy NPC làng (phong cách Zed mới) — `docs/anh-goc/npc-moi/`
Khung đã cắt sẵn: `nl-<ma>-1-dung-cat/nl-<ma>-1-dung/khung-01..06.png` và `nl-<ma>-2-noi-cat/...` cho ma = lai, ren, xen, may, do, tu, mo. Ảnh mẫu toàn thân `nl-<ma>-mau.png`.
Thay `game/art/custom/nl-<ma>.sprite.json`: giữ đúng định dạng hiện có (2 hàng × 6: hàng 0 đứng 1,2 s lặp, hàng 1 nói 0,9 s lặp; xem `village_scene.js` ~dòng 38–44, `putNpc`). Ảnh mới chi tiết hơn và to hơn nhiều so với 56×52 cũ: co cho chiều cao NPC trong làng tương xứng với Zed (người lớn cao hơn Zed khoảng 1,2–1,4 lần; Cụ Đồ ngồi; Bà Hàng Xén thấp), chân cùng đường đất, neo đáy chân. Có thể tăng cỡ ô khung nếu cần, cập nhật neo/hộp chạm tương ứng để không lệch chỗ bấm. Ảnh nhìn sang PHẢI — giữ quy ước lật hiện có. Chân dung lớn trong cảnh truyện (`truyen.js` nền `lang`, `putNpc` cỡ lớn) dùng luôn ảnh mới.

## 2. Bản đồ chọn ải
- `docs/anh-goc/nen-phong/ban-do-chon-ai.png` (1672×941) → thay `gd-ban-do-vung` (480×270). Tranh đã có sẵn ổ khoá ở 3 vùng sương (núi tuyết, đầm lầy, núi lửa) — chấp nhận. Chỉnh lại toạ độ 15 ô ải `VS.MAP.nodes` + làng cho nằm trên đất trống, theo đúng vùng: Rừng già (bên trái, rừng + thác), Hang biển (bờ biển phải/dưới có hang đá), Lâu đài cổ (trên phải, núi lửa + lâu đài). Đường nét đứt nối các ô giữ như cũ.
- `docs/anh-goc/giao-dien/the-o-ai-6.png`: 2 hàng × 3 — hàng trên ô thường (thường / đang chọn / khoá), hàng dưới ô trùm (thường / đang chọn / khoá). Tách nền xanh, thay `gd-the-ai`, `-chon`, `-khoa` và `gd-the-trum`, `-chon`, `-khoa` (giữ cỡ ~38×30 / 42×34 hoặc to hơn chút nếu vẫn vừa bản đồ).

## 3. Vòng báo trước = HOẠT ẢNH chạy đúng thời gian ra chiêu (chủ dự án 08:44–08:59)
Ảnh `docs/anh-goc/bao-truoc/`: `tron.png`, `vanh-khuyen.png`, `hinh-quat.png` (mỗi tấm 1 hàng 8 khung, các khung SÁT/CHẠM nhau → cắt theo cột đều 1/8 hoặc theo khe), `dai-thang-doc.png` (8 khung xếp DỌC, mỗi dòng một dải ngang). Khung 1 viền mờ → khung 2–6 lấp dần → khung 7 đầy → khung 8 chớp nổ.
LƯU Ý tách nền: lòng đỏ bán trong suốt đã pha với nền xanh (khung 2–4 có màu nâu/vàng lục). Phải tách màu có alpha (unmix: coi điểm = α·màu + (1−α)·#00FF00, tìm α nhỏ nhất cho màu đỏ hợp lệ), KHÔNG chỉ xoá điểm xanh — không được còn ám xanh.
Trong `game/js/bao_truoc.js`:
- Mỗi vùng (circle, donut, cone, line, rect) vẽ ảnh tương ứng (rect dùng ảnh dải thẳng kéo theo w/h; cone xoay theo `ang`, giãn theo `r` và `span`; donut co giãn theo r0/r1 — bỏ cắt khe `gaps` thì vẽ khe bằng cách xoá cung bằng `destination-out` nếu có gaps; circle ép dẹt theo `ky`).
- Chọn khung theo tiến độ: khung = floor(tiến độ × 7) cho khung 1–7 từ lúc vùng xuất hiện tới lúc nổ (dùng đúng t0/thời điểm nổ mà code hiện đã dùng cho phần "lấp dần"); khung 8 khi nổ (thay chớp cũ). Nhuộm nhẹ theo hệ như hiện có (băng/độc/lửa) — giữ đỏ là chủ đạo.
- Vẽ ở lớp ĐẤT (#world, trước khi vẽ nhân vật/quái) thay vì lớp #ui → BỎ hẳn `BT.snap` / `maskOut` / đọc lại canvas (đây là chỗ tốn hiệu năng nhất). Giữ đường cũ làm dự phòng khi thiếu ảnh hoặc `?baoanh=0`.
- Không đổi thời gian báo trước, vùng va chạm, sát thương. Cập nhật bài kiểm có đọc `BT._px`/`maskOf` nếu bị ảnh hưởng (chỉ sửa, không chạy).

## 4. Nén dung lượng (bản một tệp đang 31,3 / 30 MB)
Sau khi thêm mọi thứ trên, nén cho bản một tệp DƯỚI 30 MB và ảnh máy chủ (`--hai-tep`) dưới trần: ưu tiên giảm cỡ các tấm trùm/NPC lớn nhất (giảm số khung trùng lặp, giảm bảng màu ở tấm không thấy khác, cắt viền trống, WebP nếu build hỗ trợ). Ghi bảng trước/sau. Không làm hình mờ đi rõ.

## Kiểm
**TUYỆT ĐỐI KHÔNG TEST** (không Playwright, không chạy game) — chỉ xử lý ảnh, ảnh soát TĨNH bằng script, node --check, build.py (timeout dài). Ảnh soát trong thư mục này: `xem-npc.png` (7 NPC 2 hàng cạnh Zed cùng tỉ lệ), `xem-ban-do.png` (bản đồ + 15 ô ải đặt thử), `xem-bao-truoc.png` (4 kiểu × 8 khung trên nền sàn thật).
Ràng buộc: KHÔNG đụng master, KHÔNG force push, KHÔNG PR. Không chép apiKey trong game/js/firebase-config.js. Không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`. Xung đột game/dist khi rebase: lấy bản trên nhánh rồi build lại. Push bị từ chối thì pull --rebase rồi push lại.
Viết `bao-cao.md` (tiếng Việt, ngắn, có mã commit, mục "Cần chủ dự án xem khi chơi").
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
