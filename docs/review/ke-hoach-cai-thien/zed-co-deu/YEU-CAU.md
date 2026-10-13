# Zed mới: cỡ người không đều (chạy + đánh bị nhỏ lại) — 13/10/2026

## Lỗi chủ dự án thấy
Vừa chạy vừa đánh thì Zed bị NHỎ LẠI. Nguyên nhân (đã đọc báo cáo `../zed-tich-hop/bao-cao.md`): `docs/anh-goc/zed/dung-zed-game.py` co MỌI hàng theo một tỉ lệ chung s = 62/485 (chiều cao tấm đứng), nhưng ảnh gốc mỗi tấm vẽ một cỡ người khác nhau. Tấm chạy `03-chay` cao chỉ ~357–388 điểm ảnh nguồn (tấm đứng 485) → chạy (và chạy-đánh, vì thân dùng hàng chạy) nhỏ hơn ~20%. Ngược lại trúng đòn, thương giữ, phi tiêu ngắm… to hơn.

## Việc cần làm
1. Sửa `dung-zed-game.py`: co THEO TỪNG HÀNG sao cho cỡ người (đo ở tư thế đứng thẳng nhất của hàng, ví dụ chiều cao đầu→chân trung vị hoặc chiều cao ĐẦU — chọn cách ổn định, ghi rõ trong code) bằng tấm đứng. Gợi ý ổn định nhất: đo chiều cao phần ĐẦU (tóc+mặt, từ đỉnh tóc tới cằm) hoặc bề ngang đầu ở từng hàng rồi co sao cho đầu bằng đầu tấm đứng — không phụ thuộc tư thế cúi/nhảy. Hàng chết `06-chet-b2` cũng theo cách này (bỏ hệ số ×1,639 cứng).
2. Neo vũ khí (`he_neo: nguon-96`) phải quy đổi theo tỉ lệ MỚI của từng hàng; độ dài vũ khí giữ theo chiều cao Zed chuẩn (tấm đứng) để vũ khí không to nhỏ theo hàng.
3. Sửa luôn tràn ô 96×96 (báo cáo nói chết khung 5, thương xốc khung 1–2 bị cắt mép): nếu sau khi co vẫn tràn thì dời trong ô hoặc nới ô cho hàng đó, không cắt hình.
4. Dựng lại `game/art/custom/zed-moi.sprite.json` (+ `zed-vk` nếu cần), chạy `python3 game/build.py`, cập nhật ảnh `xem-truoc-than.png` vào thư mục này để chủ dự án nhìn cỡ đã đều.

## Luật
- Nhánh `khoi-tao-du-an`, KHÔNG master, KHÔNG force push, KHÔNG PR. KHÔNG TEST (không Playwright, không chạy game). Không chép apiKey.
- Không đổi nhịp đánh/gameplay, chỉ đổi cỡ hình.
- Commit kết thúc bằng:
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
- Xong viết `bao-cao.md` cạnh file này (tiếng Việt, mã commit, bảng chiều cao người từng hàng trước/sau), push, tự dừng.
