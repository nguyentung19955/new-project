# Lam – bộ mảnh cutout (modular) · Chuông Hunter

Game 2D metroidvania HTML5 Canvas, chơi trên iPhone xoay ngang. Lam hiển thị cao **112 px logic** (≈ 243 điểm ảnh thật).
Mục tiêu: bộ mảnh ráp và xoay được (cutout), không chỉ một sheet trông đẹp.

## Ảnh (thư mục `anh/`)
| File | Nội dung |
|---|---|
| 00 (jpg) | Ảnh quảng cáo tham khảo phong cách |
| 01 (jpg) | Lam mẫu chuẩn, nhìn chéo |
| 02 | Lam mẫu nhìn ngang quay phải – **nguồn duy nhất cho tỉ lệ, màu, viền** |
| 03 | Bảng 24 mảnh ChatGPT gen (nguồn hình dáng ban đầu) |
| 04 | Khuôn v1 (xám) – có lỗi: mũ còn chóp, đùi/cẳng dạng bậc, viền không đều, mắt có viền |
| 05 | ChatGPT tô khuôn v1 – vị trí giữ tốt (lệch ≤ 6 px) nhưng viền phình ra 4–9 px, độ trùng khít mảnh nhỏ chỉ 69–78 %, màu trôi, phía xa không tối, mắt bị thêm viền |
| 06 | **Khuôn v2 (xám)** – dựng bằng code, đã sửa A–E |
| 07 | **Khuôn v2 tô bằng mask** (palette 13 màu lấy từ ảnh 02, phía xa tối 18 %, viền đều 8 px) |
| 08 | Ráp dáng chuẩn từ khuôn v2: ảnh mẫu · bản ráp · chồng 2 ảnh |
| 09 | 1 tay + 1 chân ở duỗi / gập vừa / gập mạnh, phóng ×3, nền caro hồng để lộ chỗ hở |
| 10 | Cả nhân vật ở cỡ 112 px (theo điểm ảnh thật iPhone), 6 tư thế |
| 11 | Phóng to chỗ nối chóp mũ khi lắc +10° |

## Cách ráp (code trong `code/`)
- Đơn vị: px "thế giới" = tỉ lệ ảnh 02 thu còn Lam cao ~470 px. Game: × 0,238.
- Chuỗi cha–con: hông → đùi → cẳng chân → ủng; vai → tay trên → cẳng tay → găng → dao (gắn cứng vào găng).
- **Con đè cha** ở mỗi khớp. Capelet trước che vai, vạt áo che hông, găng/ủng che cổ tay/cổ chân.
- Gối/khuỷu: nắp tròn của đoạn dưới và đoạn trên **cùng tâm tại điểm xoay**, nắp đoạn dưới lớn hơn → đầu đoạn trên luôn bị che ở mọi góc.
- Mỗi mảnh ghi riêng điểm xoay gần `P`, điểm xoay xa `D`, **chiều dài xương** `|D−P|` trong `khuon-v2.json` – không lấy mép ảnh làm khớp.
- Viền chỉ kẻ ở mép thật; mép cắt luôn bị che thì không kẻ (tránh viền kép, vạch thò ra).
- Mũ: chóp cắt ra từ chính mũ gốc + 30 px phần dư phủ lên; mũ chính bo kín vùng nối dưới chóp. Chóp lắc nên giới hạn ±6°.
- Lớp (xa → gần): capelet sau · tay xa · chân xa · chân gần · thân · bao dao · vạt sau · vạt trước · đai · mũ · chóp · mắt · tay gần · dao · găng gần · capelet trước · chuông.

| Mảnh | Ảnh (px) | Xương (px) |
|---|---|---|
| tay trên | 75×83 | 45,8 |
| cẳng tay | 70×64 | 44,9 |
| găng | 73×70 | 39 |
| đùi | 58×91 | 47 |
| cẳng chân | 54×87 | 38 |
| ủng | 98×66 | 42 (cổ chân → đế) |

## Chạy code
```
pip install pillow numpy scipy
cd code
python3 xuat.py   # khuôn xám, bản tô mask, khuon-v2.json
python3 rap2.py   # rest2.png: ráp dáng chuẩn so với ảnh mẫu
python3 thu2.py   # thu-khop-v5.png, thu-112px.png, thu-chop.png
```
- `khuon2.py`: palette, tách mũ/chóp, dựng đùi/cẳng, phân lớp màu, kẻ viền, xuất sheet.
- `rap2.py`: hàm ráp (ma trận xoay quanh điểm xoay), dáng chuẩn.
- `thu2.py`: bài thử 3 mức gập và cỡ 112 px.
- `manh-goc/`: 24 mảnh tách từ ảnh 03 (nguồn hình dáng và lớp màu).

## Vấn đề còn mở
1. Khi gập vừa, cẳng chân gần như khuất sau vạt áo và ủng (tỉ lệ chibi chân rất ngắn).
2. Chóp mũ lắc +10° lộ một bậc nhỏ ở chân chóp.
3. Độ dày viền 8 px (≈ 4 điểm ảnh thật ở 112 px) cần duyệt.
4. Bóng đổ trên đùi/cẳng mới chỉ là một dải phẳng.
5. ChatGPT không giữ chính xác đường bao khi tô → đề xuất tô bằng mask (ảnh 07), AI chỉ để tham khảo bóng đổ.
