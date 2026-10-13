# Yêu cầu: đòn của Zed mới quay theo hướng nhắm (8 hướng / mọi góc)

## Chủ dự án báo (13/10 12:30)
"Chọc giờ không xoay 8 hướng được, chỉ chọc ngang với dọc theo hình ảnh thôi à" — kèm ảnh chụp: Zed cầm thương, quái ở chéo trên/dưới.

## Hiện trạng
- Sát thương vẫn đánh theo hướng nhắm thật (`moves.js` `aimM`, mọi góc).
- Nhưng HÌNH của Zed mới (`game/js/zed_moi.js`) chỉ vẽ nhìn ngang: góc vũ khí lấy từ neo từng khung (`gocMuot`), chỉ lật trái/phải theo `o.face`. Hướng nhắm KHÔNG đưa vào hình → quái ở chéo trên/dưới thì mũi thương vẫn chọc ngang, lệch chỗ trúng thật. Bản Zed cũ (`?zedmoi=0`) vũ khí xoay theo hướng nhắm.

## Cần làm
1. Với các đòn ĐÂM / NÉM (thương đâm 1–3, thương xốc, phi thương, phi tiêu thường/chùm/ngắm, kiếm đâm nếu có): cộng thêm góc lệch nhắm vào góc vũ khí, xoay quanh điểm cầm (nắm tay) — vũ khí vẫn nằm trong tay. Góc lệch = góc nhắm thật trừ hướng ngang của mặt (sau khi lật), kẹp trong khoảng ±75°. Nhắm gần thẳng lên/xuống (ngoài ±75°): kẹp ở ±75° và nghiêng nhẹ cả thân trên (tối đa ~12°, xoay quanh eo) cho đỡ cứng; không được lật ngược người.
2. Vệt chém / hiệu ứng của đòn đó (vệt đâm thương, vệt ném, hu-phi-tieu-chum, hu-quet-giao...) xoay cùng góc để khớp mũi vũ khí. Đạn (phi tiêu bay, phi thương) đã bay theo góc thật thì giữ nguyên.
3. Các đòn CHÉM / QUÉT / NỆN (kiếm 1–3, quét thương, búa): giữ đường vung theo ảnh, chỉ nghiêng cả đường vung theo hướng nhắm một phần (tối đa ±35°) để vệt chém hướng về phía quái.
4. Góc nhắm chốt lúc ra đòn (đúng luật phiên chạy-chém), không đổi giữa nhát; vào thế êm (nội suy như gocMuot), không giật, không lật 360°.
5. Chạy + chém (ghép eo, `zed_eo_data.js`): phần thân trên/vũ khí cũng theo góc nhắm như trên, chân vẫn theo hướng chạy.
6. Cờ `?huongvk=0` để tắt (về như hiện tại). Không đổi sát thương, tầm, thời lượng đòn. `?zedmoi=0`, `?chaydanh=0`, `?camvk=0`, `?zedbo=...` vẫn chạy.
7. Phải làm SAU phiên "Zed cầm vũ khí lúc đứng/đi/chạy" (zed-cam-vk) vì cùng sửa `zed_moi.js`: git pull trước, đọc kỹ code mới.

## Luật
- **KHÔNG TEST** (không Playwright, không chạy game). Chỉ `node --check`, có thể vẽ ảnh soát tĩnh bằng Python.
- Chỉ push nhánh `khoi-tao-du-an`; KHÔNG master, KHÔNG force push, KHÔNG PR. Bị từ chối thì `git pull --rebase` (xung đột `game/dist` thì lấy bản trên nhánh rồi chạy lại `python3 game/build.py`).
- Không chép apiKey trong `game/js/firebase-config.js`; không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`.
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g

## Khi xong
`bao-cao.md` cùng thư mục (tiếng Việt dễ hiểu, mã commit, cách tắt) + ảnh soát `xem-8-huong.png` (thương đâm và phi tiêu ném ở 8 hướng, bộ ninja, ngang ≤ 4000 điểm ảnh), push, tự dừng.
