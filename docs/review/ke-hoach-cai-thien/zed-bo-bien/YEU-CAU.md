# Đưa trang phục bộ 3 "Biển" của Zed vào game (13/10/2026)

Chủ dự án đã DUYỆT. Làm y hệt cách đã làm bộ 2 "Rừng" — đọc trước `../zed-bo-rung/YEU-CAU.md` và `../zed-bo-rung/bao-cao.md` (commit 048cb9c3) và dùng lại đúng hàm/đường dẫn đã có trong `docs/anh-goc/zed/dung-zed-game.py`, `game/js/zed_moi.js`, save `zed.bo/boMo`, Hành trang › Nhân vật.

## Nguồn ảnh bộ Biển (đủ 27 động tác, cắt theo hình)
`docs/anh-goc/zed/trang-phuc/bo-3-bien/<ten>-cat/<ten>/khung-NN.png` (+ `bao-cao.json`). Tên thư mục giống hệt bộ Rừng (01-dung, 02-di, 03-chay-v4 (12 khung), 04-lon, 05-trung-don, 06-chet, 07-chuong, 08-kiem-1, 09-kiem-2, 10-kiem-3, 11-thuong-1 … 27-dam) và cùng ánh xạ sang hàng ninja như bộ Rừng. Ảnh mẫu `bo-3-bien/00-anh-mau.png`. Màu chủ: trắng ngà – xanh lam đậm – xanh ngọc.
Lưu ý: `06-chet` đã cắt tay (bao-cao.json có khung_bao đúng); áo NGẮN TAY (cẳng tay trần) → bán kính chinh_nam như bộ Rừng (18).

## Việc cần làm
1. Dựng `zed-bien.sprite.json` bằng cùng hàm dựng (co theo cỡ đầu từng hàng, neo ngang theo tâm đầu cho đứng/đi/chạy — `NEO_DAU`/`DAU_X` đã có; neo vũ khí lấy từ hàng ninja tương ứng như bộ Rừng). Bộ ninja và bộ Rừng dựng lại phải ra y hệt.
2. Sửa sót màu (sửa thẳng PNG, script lưu vào `bo-3-bien/`): băng tay/nắm tay còn TRẮNG ở `10-kiem-3` khung 6 (tay sau) và bất kỳ khung nào khác có mảng trắng thuần nằm ở cổ tay → tô xanh lam như băng tay ở khung khác. KHÔNG đụng áo trắng ngà (áo màu ngà, hơi vàng; băng trắng thì trắng lạnh/xám) — giới hạn vùng quanh cổ tay/nắm tay.
3. Thêm bộ `'bien'`: tên "Chiến Binh Biển"/"Sea Warrior" (VI+EN, thêm cả `tools/ngon-ngu/tu-dien/zed.json` và `game/js/ngon_ngu_en.js`, KHÔNG chạy gop.py). Mở khoá khi hạ trùm vùng Biển (vùng thứ 2 trong `G.REGIONS`, xem tên vùng) — giống cách bộ Rừng mở bằng trùm Rừng già, có dòng ở bảng kết quả + lời nhắc ở làng + mở bù cho save cũ đã có sao ở ải trùm đó. Nút đổi bộ trong Hành trang xoay vòng qua các bộ đã mở.
4. Cờ thử `?zedbo=bien`.
5. `python3 game/build.py`. Ảnh `xem-truoc-bien.png` vào thư mục này.

## Luật
- Nhánh `khoi-tao-du-an`, KHÔNG master, KHÔNG force push, KHÔNG PR. KHÔNG TEST (không Playwright, không chạy game). Không chép apiKey. Không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`.
- Không đổi nhịp đánh/gameplay.
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
- Xong viết `bao-cao.md` cạnh file này (tiếng Việt, mã commit, cách xem thử), push, tự dừng.
