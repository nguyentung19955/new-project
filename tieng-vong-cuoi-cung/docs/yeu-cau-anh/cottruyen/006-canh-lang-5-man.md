# 006 – Cảnh Làng Chuông (Bell Village): 5 nền + 5 tiền cảnh
- **Trạng thái:** CHỜ
- **Ưu tiên:** P0 (thiếu ảnh này thì cả trang Làng Chuông tắt).
- **Dùng vào:** game/lang-chuong/ – màn làng đi ngang 5 màn liền nhau (theo docs/cot-truyen/ke-hoach-chatgpt.txt mục 5–6). Nhân vật chỉ đi trái/phải trên một mặt đất.
- **Phong cách:** pixel u tối như Vùng 1 (art/vung-1/P02-canh.png, P03-canh.png), làng nằm trong lòng Cây Chuông: nhà gỗ/rễ, mái treo nhiều chuông đồng im lặng, đèn lồng ấm, sương xám. Điểm sáng ấm duy nhất là đồng #E1B85A/#9C6B30 và đèn.
- **QUAN TRỌNG (để ghép được):**
  - Mỗi ảnh 960×540 px (đúng cỡ logic, không phóng).
  - **Mặt đất phẳng ở y = 468** (dải đất 468→540) trên CẢ 5 màn, cùng độ cao; mép trái/phải của màn kề nhau nối liền mạch (màn 1 phải ↔ màn 2 trái…). Mép trái màn 1 và mép phải màn 5 là vách rễ chặn đường.
  - Không vẽ nhân vật, không vẽ chuông teleport, không chữ (game tự đặt các thứ đó).
- **Nội dung từng màn (trái → phải):**
  1. Lò rèn của Morrow, the Stone Smith: đe đá, lò than hồng, búa treo. Chừa trống khoảng x 300–460 trên mặt đất để đặt Morrow.
  2. Nhà Vesper, the Bellkeeper + quả **chuông làng lớn bị nứt** treo trên giàn rễ (vẽ trong nền). Chừa trống x 560–700 cho Vesper.
  3. Quảng trường giữa làng: rễ toả tròn, **chừa trống x 380–580** (giữa màn) cho cổng teleport, và x 90–170 cho bia tưởng niệm (012) The Rootbound Bell (sprite riêng cao ~372 px, đáy chạm y 468).
  4. Sạp bản đồ của Tock, the Clockwork Owl: kệ giấy cuộn, sào đậu cho cú. Chừa trống x 420–560.
  5. Rìa làng, chòi gác nhìn xuống lối rễ đi vào Rotting Roots, có cây sào/đá cao cho Kaelith đứng (x 600–720).
- **Tiền cảnh (truoc-N.png):** cùng cỡ 960×540, nền TRONG SUỐT, chỉ vài rễ/cỏ/chuông treo ở mép dưới và mép trên (che ≤ 15% ảnh, không che giữa màn), đặt trước nhân vật.
- **Số khung:** 1 (tĩnh) mỗi ảnh. Neo: góc trên-trái (0,0).
- **Lưu:** art/lang-chuong/nen-1.png … nen-5.png (đục, không trong suốt) và art/lang-chuong/truoc-1.png … truoc-5.png (trong suốt) + ảnh gốc *-nguon-chatgpt.png.
- Ghi lại trong file này nếu mặt đất không đúng y = 468 (ghi y thật cho từng màn) để phiên LÀM sửa game/lang-chuong/lang.json.
