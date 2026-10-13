# Báo cáo: Zed mới — co đều cỡ người từng hàng (13/10/2026)

Commit chính: **`5df723ef`** trên nhánh `khoi-tao-du-an` (đã push). Theo đúng luật: **KHÔNG test, không Playwright, không chạy game** — chỉ chạy script dựng ảnh `docs/anh-goc/zed/dung-zed-game.py` và `python3 game/build.py`. Không đổi nhịp đánh/gameplay, chỉ đổi cỡ hình. **Chủ dự án cần mở game xem thử.**

## Đã làm
1. **Co theo từng hàng** (`dung-zed-game.py`): mỗi hàng có tỉ lệ riêng `s × r_hang`, với `s = 62/485` (tấm đứng) và `r_hang` làm cho **đầu** Zed ở hàng đó bằng đầu ở tấm đứng. Cách đo (ghi rõ trong đầu tệp và hàm `do_dau`):
   - mặt = mảng da lớn nằm cao nhất trong khung; cằm = đáy mảng mặt;
   - `cao_dau` = cằm − đỉnh tóc (trung vị đỉnh điểm ảnh đặc trên các cột giữa mặt); `mat` = căn diện tích mảng mặt;
   - bỏ khung đo hỏng (cao_dau < 0,75 × lớn nhất hàng — lúc bàn tay giơ cao hơn mặt), lấy trung vị;
   - `r_hang = căn((cao_dau_đứng/cao_dau_hàng) × (mat_đứng/mat_hàng))` — trung bình nhân hai phép đo cho đỡ lệch khi đầu ngửa/nghiêng.
   - Hàng chết `06-chet-b2` cũng theo cách này; **bỏ hệ số ×1,639 cứng**.
2. **Vũ khí**: độ dài tính theo Zed chuẩn (chiều cao ảnh khung tấm đứng × s) cho mọi hàng → vũ khí không to nhỏ theo động tác. Neo (`he_neo: nguon-96`) quy đổi bằng tỉ lệ mới + dx, dy của từng khung. Tấm `zed-vk` không cần đổi (giữ nguyên).
3. **Tràn ô 96×96**: hình tràn được **dời** vào trong ô (từng khung, ít nhất có thể; neo + nắm tay dời theo), không cắt: `06-chet-b2` khung 5 dời (−14,0); `16-thuong-xoc` khung 1 (−9,0), khung 2 (−20,0). Không hình nào lớn hơn ô.
4. Dựng lại `game/art/custom/zed-moi.sprite.json`, chạy `python3 game/build.py` (`game/dist/*`). Ảnh xem trước: `xem-truoc-than.png` trong thư mục này (ảnh cũ để so: `../zed-tich-hop/xem-truoc-than.png`).

## Bảng cỡ người từng hàng (điểm ảnh ô 96; game = chia 2)
"Đầu" = chiều cao đầu (đỉnh tóc→cằm). "Cao người" = trung vị / lớn nhất các khung (bao gồm tư thế cúi, ngã nên chỉ để tham khảo; cỡ đều được so bằng đầu).

| Hàng | r_hang | Đầu trước | Đầu sau | Cao người trước (TV/max) | Cao người sau (TV/max) |
|---|---|---|---|---|---|
| 01-dung | 1.000 | 25.1 | 25.1 | 62.0 / 62.4 | 62.0 / 62.4 |
| 02-di | 1.134 | 22.8 | 25.8 | 55.4 / 55.4 | 62.8 / 62.8 |
| 03-chay | 1.383 | 18.7 | 25.9 | 47.0 / 48.1 | 65.0 / 66.5 |
| 04-lon | 1.282 | 20.3 | 26.1 | 34.4 / 53.9 | 44.1 / 69.1 |
| 05-trung-don | 0.851 | 26.2 | 22.3 | 73.1 / 73.5 | 62.2 / 62.5 |
| 06-chet-b2 | 2.040 | 19.7 | 24.6 | 42.9 / 62.0 | 53.5 / 77.2 |
| 07-chuong-b2 | 0.997 | 25.4 | 25.3 | 60.8 / 61.4 | 60.6 / 61.2 |
| 08-kiem-1-tp | 0.928 | 28.1 | 26.1 | 71.1 / 71.1 | 65.9 / 65.9 |
| 09-kiem-2-tp | 0.879 | 29.5 | 26.0 | 70.4 / 70.8 | 61.9 / 62.3 |
| 10-kiem-3 | 1.122 | 23.6 | 26.5 | 56.0 / 68.0 | 62.8 / 76.3 |
| 11-thuong-1 | 1.326 | 19.4 | 25.7 | 51.2 / 51.5 | 67.9 / 68.3 |
| 12-thuong-2 | 1.243 | 20.3 | 25.3 | 52.9 / 53.9 | 65.7 / 67.1 |
| 13-thuong-3 | 1.259 | 20.7 | 26.1 | 55.0 / 55.0 | 69.2 / 69.2 |
| 14-thuong-quet | 1.131 | 22.8 | 25.8 | 56.2 / 56.9 | 63.6 / 64.3 |
| 15-thuong-giu | 0.765 | 33.2 | 25.4 | 75.0 / 75.0 | 57.4 / 57.4 |
| 16-thuong-xoc | 1.159 | 23.4 | 27.1 | 51.9 / 60.3 | 60.2 / 69.9 |
| 17-bua-nen | 1.446 | 17.6 | 25.5 | 43.6 / 46.8 | 63.1 / 67.7 |
| 18-bua-giu | 0.838 | 30.2 | 25.3 | 65.4 / 68.4 | 54.8 / 57.3 |
| 19-bua-nen-dat | 1.082 | 24.5 | 26.5 | 55.4 / 61.6 | 59.9 / 66.6 |
| 20-phi-tieu | 1.141 | 22.9 | 26.1 | 54.6 / 55.1 | 62.4 / 62.9 |
| 21-phi-tieu-ngam | 0.758 | 32.7 | 24.8 | 80.8 / 80.9 | 61.3 / 61.4 |
| 22-phi-tieu-chum | 1.099 | 23.1 | 25.4 | 58.6 / 59.2 | 64.4 / 65.0 |
| 23-tram-nguyet-tp | 1.030 | 25.3 | 26.1 | 61.6 / 61.7 | 63.5 / 63.6 |
| 24-phi-thuong | 1.122 | 22.6 | 25.4 | 55.7 / 55.7 | 62.6 / 62.6 |
| 25-dia-chan | 1.034 | 24.7 | 25.5 | 58.5 / 64.0 | 60.6 / 66.2 |
| 26-mua-phi-tieu | 1.020 | 24.4 | 24.9 | 61.1 / 63.3 | 62.3 / 64.5 |
| 27-dam | 0.882 | 28.1 | 24.8 | 67.2 / 67.2 | 59.3 / 59.3 |

Đầu trước dao động 17,6–33,2 → sau 22,3–27,1. **Chạy** (và chạy-đánh, vì thân dùng hàng chạy) từ đầu 18,7 lên 25,9 — hết bị nhỏ lại.

## Cần chủ dự án xem
- **Hàng chết**: đầu đã bằng tấm đứng nhưng người cao hơn (khung đầu ~77 so với 62), vì ảnh gốc chết vẽ đầu nhỏ so với thân. Nếu nhìn thấy to, có thể đổi riêng hàng này sang co theo chiều cao (×1,64 như cũ).
- **Trúng đòn** đầu sau 22,3 (hơi nhỏ) do đầu ngửa ra sau làm phép đo lệch; chiều cao người (62) đã khớp tấm đứng.
- Kiếm 3, lộn, thương xốc có khung cao tới ~69–76 vì nhảy/vươn — đúng tư thế, không phải lỗi cỡ.
- Vũ khí ở các hàng trước đây to (thương giữ, búa giữ, phi tiêu ngắm) nay ngắn hơn chút, ở hàng nhỏ (thương 1–3, búa nện) dài hơn chút — vì giờ cùng một độ dài chuẩn.

## Tệp đổi
`docs/anh-goc/zed/dung-zed-game.py`, `game/art/custom/zed-moi.sprite.json`, `game/dist/*` (đóng gói lại), `docs/review/ke-hoach-cai-thien/zed-co-deu/xem-truoc-than.png`, báo cáo này.
