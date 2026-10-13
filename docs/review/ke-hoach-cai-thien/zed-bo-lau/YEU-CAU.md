# Đưa trang phục bộ 4 "Lâu đài cổ" của Zed vào game (13/10/2026)

Chủ dự án đã DUYỆT. Làm y hệt bộ Biển — đọc trước `../zed-bo-bien/YEU-CAU.md` và `../zed-bo-bien/bao-cao.md` (commit 8564a5cb): dùng lại `dung_bo`/`BO_KHAC` trong `docs/anh-goc/zed/dung-zed-game.py`, `game/js/zed_moi.js`, save `zed.bo/boMo`, nút đổi bộ trong Hành trang.

## Nguồn ảnh (đủ 27 động tác, cắt theo hình)
`docs/anh-goc/zed/trang-phuc/bo-4-lau/<ten>-cat/<ten>/khung-NN.png` (+ `bao-cao.json`). Tên thư mục giống bộ Rừng/Biển, cùng ánh xạ sang hàng ninja.
Ghi chú: `01-dung` cắt tay theo khe hở; `02-di` và `03-chay-v4` xuất ở chế độ phục hồi chỉ vì mũi chân khung 1 chạm mép ảnh (thư mục đã đổi tên về `<ten>`, bao-cao.json dùng được). Bỏ qua `03-chay-sai-9khung.png`.
Ảnh mẫu `bo-4-lau/00-anh-mau.png`. Màu chủ: đỏ đô – bạc – đồng. Áo ngắn tay, găng da nâu hở ngón (nắm tay vẫn là da) → bán kính chinh_nam như bộ Rừng/Biển (18).

## Việc cần làm
1. Thêm Lâu đài vào `BO_KHAC`, dựng `zed-lau.sprite.json`. Bộ ninja/Rừng/Biển dựng lại phải ra y hệt.
2. Soát nhanh 27 tấm: còn sót đai đỏ ninja hoặc DÉP (bộ này đi ủng) thì ghi vào báo cáo; chỉ sửa PNG nếu sửa gọn trong vùng nhỏ, không thì để nguyên và báo.
3. Bộ `'lau'`: tên "Hiệp Sĩ Lâu Đài"/"Castle Knight" (VI+EN, cả `tools/ngon-ngu/tu-dien/zed.json` và `game/js/ngon_ngu_en.js`, KHÔNG chạy gop.py). Mở khoá khi hạ trùm vùng "Lâu đài cổ" (vùng thứ 3 trong `G.REGIONS`), y cách bộ Rừng/Biển (dòng bảng kết quả, lời nhắc ở làng, mở bù save cũ). Nút đổi bộ xoay vòng 4 bộ.
4. Cờ thử `?zedbo=lau`.
5. `python3 game/build.py`. Ảnh `xem-truoc-lau.png` vào thư mục này.

## Luật
- Nhánh `khoi-tao-du-an`, KHÔNG master, KHÔNG force push, KHÔNG PR. KHÔNG TEST (không Playwright, không chạy game). Không chép apiKey. Không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`.
- Không đổi nhịp đánh/gameplay.
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
- Xong viết `bao-cao.md` cạnh file này (tiếng Việt, mã commit, cách xem thử), push, tự dừng.
