# Đưa trang phục bộ 2 "Rừng" của Zed vào game (13/10/2026)

Chủ dự án đã DUYỆT. Mỗi bộ trang phục = nguyên bộ animation Zed mặc sẵn bộ đó (không ghép lớp). Bộ 1 = ninja đen–đỏ đang chạy trong game (`game/art/custom/zed-moi.sprite.json`, dựng bởi `docs/anh-goc/zed/dung-zed-game.py`, code `game/js/zed_moi.js`).

## Nguồn ảnh bộ Rừng (đã cắt theo hình, PNG trong suốt, đủ 27 động tác)
`docs/anh-goc/zed/trang-phuc/bo-2-rung/<ten>-cat/<ten>/khung-NN.png` (+ `bao-cao.json` trong `<ten>-cat/`).
Tên → hàng bộ ninja tương ứng (cùng tư thế, cùng số khung, cỡ người lệch ≤3%):
01-dung→01-dung, 02-di→02-di, 03-chay-v4→03-chay-v4 (12 khung), 04-lon, 05-trung-don, 06-chet→06-chet-b2, 07-chuong→07-chuong-b2, 08-kiem-1→08-kiem-1-tp, 09-kiem-2→09-kiem-2-tp, 10-kiem-3, 11-thuong-1, 12-thuong-2, 13-thuong-3, 14-thuong-quet, 15-thuong-giu, 16-thuong-xoc, 17-bua-nen, 18-bua-giu, 19-bua-nen-dat, 20-phi-tieu, 21-phi-tieu-ngam, 22-phi-tieu-chum, 23-tram-nguyet→23-tram-nguyet-tp, 24-phi-thuong, 25-dia-chan, 26-mua-phi-tieu, 27-dam.
Ảnh mẫu: `bo-2-rung/00-anh-mau.png`. Màu chủ: xanh rêu – nâu đất – vàng đất.

## Việc cần làm
1. Mở rộng `dung-zed-game.py` để dựng thêm `zed-rung.sprite.json` (cùng chuẩn: net 2, goc [24,45], ô 96, chân (48,90), co từng hàng theo cỡ ĐẦU như bộ ninja). **Neo vũ khí dùng lại `gan-vk/neo.json` của hàng ninja tương ứng** (tư thế trùng) — chỉ quy đổi theo tỉ lệ/dịch của ảnh Rừng; vẫn chạy `chinh_nam` (dò nắm tay) trên ảnh Rừng để bám đúng tay.
2. Sửa sót màu: tấm `03-chay-v4` bộ Rừng, khung 3, 9, 11 còn vệt ĐỎ của đai ninja cũ trong đai vàng → tô các điểm đỏ thuần (đỏ, không phải da/mắt) ở vùng đai thành vàng đất của đai. Không đụng mắt đỏ.
3. Code: Zed có trường trang phục (ví dụ `P.zedBo = 'ninja' | 'rung'`), lưu vào save (cả lưu máy và lưu mây, tương thích ngược: save cũ → 'ninja'). `zed_moi.js` chọn sheet theo bộ đang mặc; vũ khí, nhịp, neo giữ nguyên cách cũ.
4. Mở khoá: bộ Rừng mở khi hạ trùm vùng Rừng (xem `G.REGIONS` trong `data.js`; nếu khó xác định thì mở khi qua vùng đầu tiên). Mở rồi mặc được ở MỌI vùng. Có chỗ đổi bộ đơn giản trong màn trang phục/hành trang hiện có (`outfit.js`/`tailor.js`/`hanh_trang.js` — chọn chỗ hợp nhất, nhỏ gọn) + thông báo ngắn khi mở khoá. Thêm tên hiển thị (VI + EN) cho 2 bộ: "Ninja Bóng Đêm"/"Night Ninja", "Thợ Săn Rừng"/"Forest Hunter".
5. Cờ thử: `?zedbo=rung` để mặc ngay bộ Rừng (cho chủ dự án xem không cần mở khoá).
6. `python3 game/build.py`. Ảnh xem trước `xem-truoc-rung.png` (như xem-truoc-than) vào thư mục này.

## Luật
- Nhánh `khoi-tao-du-an`, KHÔNG master, KHÔNG force push, KHÔNG PR. KHÔNG TEST (không Playwright, không chạy game). Không chép apiKey. Không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`.
- Không đổi nhịp đánh/gameplay.
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
- Xong viết `bao-cao.md` cạnh file này (tiếng Việt, mã commit, cách xem thử), push, tự dừng.
