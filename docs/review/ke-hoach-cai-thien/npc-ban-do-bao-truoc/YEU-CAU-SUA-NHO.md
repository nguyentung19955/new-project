# Sửa nhỏ sau đợt NPC + bản đồ (14/10 09:44, chủ dự án "Ok hết")

1. **Bật cử động NPC**: bật `G.NL_DONG` (đang tắt từ 12/10) để 7 NPC chạy hàng đứng (lặp) và hàng nói khi người chơi lại gần/đang nói chuyện, đúng như `village_scene.js` thiết kế. Kiểm chỗ dùng cờ này (grep) để không còn chỗ nào giả định chỉ có khung đầu. Giữ được tắt bằng `?nldong=0`.
2. **Bản đồ chọn ải**: thẻ bia đá vùng Lâu đài cổ đang chồng mép nhau (cách ~32). Giãn lại toạ độ `VS.MAP.nodes` của vùng đó (và chỗ nào khác chồng) để các thẻ không đè nhau, vẫn nằm trên đất trống của tranh `gd-ban-do-vung`; nếu không đủ chỗ thì thu nhỏ thẻ chút ít (≥ 85%). Ảnh soát tĩnh `xem-ban-do-2.png`.
Làm SAU khi phiên 3 bạn nhỏ (bao-cao-ban-nho.md) đã push — git pull trước. Giữ ảnh máy chủ dưới trần 26 MB, bản một tệp dưới 30 MB.
**TUYỆT ĐỐI KHÔNG TEST** — chỉ node --check, build.py, ảnh soát tĩnh. Ràng buộc như YEU-CAU.md. Viết `bao-cao-sua-nho.md`.
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
