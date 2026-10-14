# 3 bạn nhỏ mới (Cu Tèo, Cái Bống, Cu Lì) — phong cách Zed (14/10 09:10)

Khung đã cắt: `docs/anh-goc/npc-moi/em-<ma>-1-dung-cat/em-<ma>-1-dung/khung-01..06.png` và `em-<ma>-2-ngoi-cat/...` với ma = cu-teo (hunter), cai-bong (healer), cu-li (wrestler). Ảnh mẫu `em-<ma>-mau.png`.
Hiện game dùng `game/art/custom/em-be-hunter|healer|wrestler.sprite.json` (48×48, 7 hàng). Giờ các bạn KHÔNG còn đánh nhau, chỉ: (1) ngồi chơi ở sân đình sau khi được cứu (`village_scene.js` `seats()` ~dòng 532) → dùng hàng NGỒI; (2) xuất hiện trong cảnh truyện (`truyen.js` nền emBe/hoi, lời thoại `ai: hunter|healer|wrestler`) → dùng hàng ĐỨNG; nếu có chỗ nào khác (ví dụ lúc được cứu trong ải) thì dùng hàng đứng.
Dựng lại 3 sprite: hàng đứng + hàng ngồi (6 khung mỗi hàng, ~1,2 s lặp), các hàng cũ khác trỏ về hàng đứng để code cũ không vỡ. Co cho cao bằng Zed (bạn thân cùng tuổi), chân/mông cùng đường đất, ảnh nhìn sang PHẢI — giữ quy ước lật hiện có. Không đổi luật/số.
Làm SAU khi phiên NPC + bản đồ + báo trước + nén (YEU-CAU.md cùng thư mục) đã push — git pull trước; giữ bản build dưới 30 MB.
**TUYỆT ĐỐI KHÔNG TEST** — chỉ xử lý ảnh, ảnh soát tĩnh `xem-ban-nho.png`, node --check, build.py. Ràng buộc như YEU-CAU.md. Viết `bao-cao-ban-nho.md`.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
