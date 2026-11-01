# Báo cáo luồng H – báo trước đập chuông + phân biệt đạn quái

Nguồn: góp ý ChatGPT (docs/gop-y-nguoi-dung-01-11.md, mục 23: "báo trước rõ hơn cho đập chuông, phân biệt đạn").

## Đã làm

**Vẽ chiêu quái dùng chung** – `game/thu-mat-na/ve-chieu-quai.js` (mới). Phòng demo (`phong-demo/index.html`) và Vùng 1 (`vung-1/ve.js`) cùng gọi `VeChieuQuai(...)`, nên hai nơi luôn giống nhau. Đã bỏ phần vẽ đạn và chấn động cũ bị lặp ở cả hai file.

**1. Vọng Tàn – đập chuông (báo trước rõ ở tốc độ thật)**
- Từ lúc vào đòn tới khi sóng ra mất 53 khung (≈ 0,88 s), gồm khung giữ chuông trên cao sẵn có (`bao_truoc_them_ms` 300). Toàn bộ khoảng này đều có báo trước, mạnh dần:
  - Thân quái **rung ngang** (1→2 bước điểm ảnh) từ 30 % thời gian báo trước.
  - **Viền thân đổi sang đỏ gạch**, dày hơn, đậm dần. Từ 55 % trở đi viền nhấp nháy đỏ sáng (#F08B73).
  - **Quầng và vòng loé đỏ gạch quanh quả chuông**, có thêm hạt sáng xoay quanh khi sắp đập.
  - **Dải vạch nứt đỏ gạch trên mặt đất**, chạy hai phía đúng tầm `tam` 420 px và chỉ vẽ trên sàn liền của tầng đó. Dải mờ lúc đầu rồi đậm dần (độ đậm 0,2→1). Kèm một dải hắt sáng mờ và **cột mốc ở cuối tầm**.
- Khi đập vẫn rung màn như cũ. Lúc sóng đang chạy, dải nứt còn lại mờ để người chơi thấy tầm.
- **Sửa engine**: trước đây sóng đất chỉ sống 44 khung nên chỉ chạy ≈ 308 px, không tới `tam` 420. Nay thời gian sống = `tam / toc_song + 6`, nên sóng (và vùng gây sát thương) đi đúng tới mốc đã báo. Đây là thay đổi lối chơi nhỏ: Vọng Tàn với xa hơn trước khoảng 110 px.

**2. Phân biệt đạn: hình dạng + màu + quỹ đạo (không dùng cyan)**

| Quái | Hình | Màu | Quỹ đạo / giai đoạn |
|---|---|---|---|
| Kèn Câm | đạn **tròn** viền tối, có vệt đuôi ngắn (`ken_tron.png`) | đồng / hổ phách | bay thẳng, nhanh. Loé nòng và nổ dùng lại ô của `ken.png` |
| Khuyết Cẩu | **cầu năng lượng to** (×1,45) có đuôi lửa (`cau_tim.png`) | tím than / đỏ gạch | **tụ năng lượng rõ**: hạt hút về miệng, vòng co lại, cầu xoáy lớn dần. Khi bay nhấp nhô nhẹ |
| Hồn Vải | **cung sóng đồng tâm** (`vai_nhat.png`) | kem xám / tím nhạt, trong mờ | lớn dần và **mờ dần**. **Xuyên tường** (`"xuyen_tuong": true` trong quai.json); trong tường hao tuổi gấp 3 và mờ hơn |

- Ba hình mới được tạo bằng Python (`tools/vung-1/tao-fx-dan-h.py`), không vẽ tay. `cau_tim` và `vai_nhat` là hình có sẵn đổi bảng màu theo độ sáng. `ken_tron` giữ ô loé/nổ của `ken.png` và thêm 2 ô đạn tròn vẽ theo thuật toán.
- Cả hai nơi đều nạp hình (FXQ trong phòng demo, `nap.js` trong Vùng 1).

## Ảnh minh hoạ (chụp kiểm, để ngoài repo)
- *Vọng Tàn 30 % / 70 %*: viền đỏ gạch quanh thân, quầng đỏ ở quả chuông. Dải nứt đỏ gạch kéo dài khắp sàn hai bên, có cột mốc cuối tầm. Ở 70 % dải đậm và nhấp nháy sáng.
- *Vọng Tàn sóng 40 khung*: hai cụm sóng đất ở ±280 px, dải nứt mờ còn lại.
- *Kèn Câm*: loé nòng hổ phách, sau đó một viên tròn đồng nhỏ có đuôi ngắn bay ngang.
- *Khuyết Cẩu*: lúc tụ có hạt tím–đỏ xoáy về mõm. Lúc bay là quả cầu tím đỏ to có đuôi lửa, khác hẳn viên đạn kèn.
- *Hồn Vải*: các cung kem nhạt lớn dần và mờ dần. Ở P02 chụp cùng khung với cầu Khuyết Cẩu, hai loại phân biệt ngay.

## Kết quả kiểm
- `tools/vung-1/kiem-thu-f.js`: **65/65 đạt**.
- `tools/vung-1/kiem-thu-g.js`: **4/4 đạt**, hỏng 0. Bia chắn P09 vẫn chặn đạn kèn vì đạn kèn không xuyên tường.
- `tools/vung-1/kiem-thu-h.js` (mới): **4/4 đạt**
  - Vọng Tàn báo trước 53 khung (≥ 30).
  - Sóng tới 420 = `tam`.
  - Sóng âm Hồn Vải qua tường.
  - Không có lỗi JS.
- Chụp Playwright cả phòng demo và Vùng 1 (P01, P02, P09, P11): không có lỗi JS.
