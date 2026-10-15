# Bước 2 — Kế hoạch chi tiết: Sổ yêu quái, Việc làng hằng ngày, Thành tựu

Lập 15/10/2026 theo `docs/ke-hoach/buoc-2/YEU-CAU.md`. **Chưa viết code game**: tài liệu này chỉ để chủ game đọc, sửa, chốt.
Đã đọc: `docs/thiet-ke-game.md` mục 13–14, `docs/ke-hoach/BUOC-2-3-4.md`, `docs/cot-truyen/CHUNG.md` và code hiện có
(`ai_ngay.js`, `village.js`, `village_scene.js`, `hanh_trang.js`, `engine.js` + `cloud.js` (cách lưu), `data.js`, `combat.js`, `stage.js`,
`monster_art.js`, `ky_nang_quai.js`, `ngon_ngu.js`). Lưu ý: `bo_nho.js` là bộ nhớ đệm hình, không phải bản lưu; bản lưu nằm ở `engine.js` + `cloud.js`.

Ba hệ này cho bé **lý do mở game mỗi ngày** mà không bắt cày: mỗi ngày chừng 15–20 phút là xong việc, phần thưởng vừa phải, và mọi việc
đều đẩy bé thử cách chơi khác (đổi vũ khí, dùng hệ khắc chế, chơi lại vùng cũ) — đúng tinh thần "vũ khí lớn lên theo cách bạn dùng".

Mục lục: 1. Thiết kế (người chơi thấy gì) · 2. Dữ liệu lưu · 3. Ảnh cần gen · 4. Chia phiên code · 5. Cân bằng · 6. Câu hỏi cho chủ game
· Phụ lục kỹ thuật.

---

## 1. Thiết kế từng hệ

### 1.0 Đặt ở đâu trong làng (chung cho cả ba)

Làng không thêm người mới (đỡ phải vẽ thêm NPC). Hai người đang "nhàn" nhận thêm việc:

| Người | Hiện giờ | Thêm | Vì sao hợp |
|---|---|---|---|
| **Anh Mõ** (cổng làng) | chỉ Cài đặt | thẻ đầu tiên **"Việc hôm nay"** (Cài đặt thành thẻ thứ hai) | Mõ làng là người rao việc cho cả làng |
| **Ông Từ** (sân đình) | chỉ xem chỉ số Zed | thêm thẻ **"Sổ yêu quái"** và **"Thành tựu"** | Đình làng là nơi ghi công, cất sổ sách |

- Dải khuôn mặt ở mép trên: Anh Mõ có chấm đỏ khi có việc xong chưa nhận thưởng; Ông Từ có chấm đỏ khi có trang sổ / thành tựu chờ nhận.
- **Hành trang** (túi vải) thêm nút "Đến chỗ Anh Mõ / Ông Từ" ở thẻ Nhân vật, và dòng danh hiệu đang đeo dưới tên Zed.
- **Trong ải** không có bảng mới, chỉ có dòng báo nhỏ khi vừa xong một việc ("Xong việc: Hạ 3 tinh anh!") hoặc mở trang sổ mới
  ("Sổ yêu quái: Cá Nóc — trang mới!"). Bảng kết quả cuối ải thêm 1 dòng "Việc hôm nay: 2/3".
- Bảng **Tạm dừng** trong ải: thêm nút "Việc hôm nay" (chỉ xem tiến độ, không nhận thưởng).
- Mọi phần thưởng phải **bấm "Nhận"** (bé thích bấm nhận quà). Riêng việc hằng ngày: hết ngày mà quên nhận thì
  **tự cộng vào hôm sau** (không mất), có dòng báo "Hôm qua bé quên nhận: +…".
- Mở khoá (để người mới không ngợp): Việc hôm nay mở sau khi **qua ải Rừng già 2** (cùng lúc Cô Thợ May ra mặt); Sổ yêu quái mở
  **ngay từ đầu** (ghi cả ải hướng dẫn); Thành tựu mở sau khi **qua ải Rừng già 1**. (Xem câu hỏi Q1.)

---

### 1.1 Sổ yêu quái

**Người chơi thấy gì.** Ông Từ, thẻ "Sổ yêu quái": một cuốn sổ có 3 mục vùng (Rừng già · Hang biển · Lâu đài cổ), mỗi vùng một lưới ô
quái. Chạm một ô → trang chi tiết bên phải. Ô chưa gặp chỉ là **bóng đen + dấu "?"** (bé tò mò đi tìm).

**Mỗi trang có 4 nấc** (sao đồng trên góc ô):

| Nấc | Điều kiện | Trang hiện thêm | Thưởng (bấm Nhận) |
|---|---|---|---|
| Đã gặp | Quái xuất hiện trong phòng bé đang đứng | Hình (dùng ảnh quái có sẵn trong game), tên, vùng | — |
| ★ Đã hạ | Hạ con đó lần đầu | Vai (Lính xông, Bầy nhỏ…), số lần đã hạ, **mẹo đánh** (lấy câu mẹo có sẵn ở `ky_nang_quai.js`) | vàng: thường 20/40/60 · tinh anh 50/80/120 · trùm nhỏ 80/120/180 · trùm vùng 150/250/400 (theo vùng 1/2/3) |
| ★★ Tìm ra điểm yếu | Hạ con đó **bằng hệ khắc chế** lần đầu (đòn kết liễu mang hệ đó, hoặc con quái đang dính cháy/độc/chậm của hệ đó do vũ khí gây) | Hệ khắc chế hiện ra (đóng **dấu đỏ** lên trang), lời ông Từ "Hoá ra nó sợ Lửa!" | linh khí: thường 3 · tinh anh 6 · trùm nhỏ 10 · trùm vùng 20 |
| ★★★ Thuần thục | Hạ đủ số con: thường 30 · tinh anh 10 · trùm nhỏ 5 · trùm vùng 3 | Viền trang thành vàng | đá nâng bậc: thường 0 (chỉ viền vàng) · tinh anh 1 · trùm nhỏ 2 · trùm vùng 3 |

- **Hoàn thành vùng**: mọi trang của vùng đạt ★★ → thưởng vùng **5 / 8 / 12 đá nâng bậc + danh hiệu "Thợ săn <vùng>"**.
  Mọi trang của vùng đạt ★★★ → danh hiệu "Bậc thầy <vùng>" (chỉ danh hiệu).
- **Trang trùm vùng** ghi thêm: các lớp thích nghi bé đã gặp (kháng Lửa / Độc / Băng, chống đánh xa / áp sát), **vết sẹo hiện tại**
  (đọc `save.scars`), thời gian hạ nhanh nhất (lấy từ kỷ lục Bảng vàng đã có), số sao cao nhất ở ải 5 vùng đó.
  Điểm yếu của trùm vùng = **đạt sao thứ ba** khi hạ nó (đúng luật sao thứ ba hiện có).
- **Hệ khắc chế của quái thường / tinh anh** hiện chưa có trong code (chỉ trùm có). Đề xuất gán cố định trong bảng dữ liệu, **chỉ để ghi sổ,
  không đổi sát thương** (giữ nguyên cân bằng; xem Q3). Quy tắc: theo vai trò như thiết kế mục 9 (Bầy nhỏ → Lửa, Khiên → Độc,
  Xạ thủ + Nhanh nhẹn → Băng), các vai còn lại → hệ khắc hệ của vùng (Rừng già: Lửa, Hang biển: Độc, Lâu đài cổ: Băng).

**Danh sách đầy đủ 36 trang** (mã nội bộ = mã hình quái trong `monster_art.js`):

| # | Vùng | Mã | Tên | Loại / vai | Hệ khắc (đề xuất) |
|---|---|---|---|---|---|
| 1 | Rừng già | heoCon | Heo Rừng Con | thường · Lính xông | Lửa |
| 2 | Rừng già | ongVo | Bầy Ong Vò Vẽ | thường · Bầy nhỏ | Lửa |
| 3 | Rừng già | boHung | Bọ Hung Mai Cứng | thường · Khiên | Độc |
| 4 | Rừng già | hoaBaoTu | Hoa Phun Bào Tử | thường · Xạ thủ | Băng |
| 5 | Rừng già | chonBong | Chồn Bóng | thường · Nhanh nhẹn | Băng |
| 6 | Rừng già | namPhong | Nấm Phồng | thường · Cảm tử | Lửa |
| 7 | Rừng già | socNo | Sóc Ném Quả Nổ | thường · Đặt bom | Lửa |
| 8 | Rừng già | nhimDoc | Nhím Gai Độc | thường · Gai | Lửa |
| 9 | Rừng già | heoNanh | Heo Rừng Nanh Dài | tinh anh | Lửa |
| 10 | Rừng già | namPhongChua | Nấm Phồng Chúa | tinh anh | Lửa |
| 11 | Rừng già | namChua | Nấm Chúa | trùm nhỏ | Lửa |
| 12 | Rừng già | mocTinh | Mộc Tinh | trùm vùng | sao thứ ba |
| 13 | Hang biển | cua | Cua Lính | thường · Lính xông | Độc |
| 14 | Hang biển | caCon | Bầy Cá Con | thường · Bầy nhỏ | Lửa |
| 15 | Hang biển | oc | Ốc Mượn Hồn | thường · Khiên | Độc |
| 16 | Hang biển | haiQuy | Hải Quỳ | thường · Xạ thủ | Băng |
| 17 | Hang biển | caChuon | Cá Chuồn | thường · Nhanh nhẹn | Băng |
| 18 | Hang biển | caNoc | Cá Nóc | thường · Cảm tử | Độc |
| 19 | Hang biển | sua | Sứa Bom | thường · Đặt bom | Độc |
| 20 | Hang biển | nhim | Nhím Biển | thường · Gai | Độc |
| 21 | Hang biển | cuaTuong | Cua Tướng | tinh anh | Độc |
| 22 | Hang biển | caNocChua | Cá Nóc Chúa | tinh anh | Độc |
| 23 | Hang biển | cuaDa | Cua Đá | trùm nhỏ | Độc |
| 24 | Hang biển | nguTinh | Ngư Tinh | trùm vùng | sao thứ ba |
| 25 | Lâu đài cổ | linhMa | Lính Ma Giáp Gỉ | thường · Lính xông | Băng |
| 26 | Lâu đài cổ | doiThan | Bầy Dơi Than | thường · Bầy nhỏ | Lửa |
| 27 | Lâu đài cổ | tuongDa | Tượng Đá Cầm Khiên | thường · Khiên | Độc |
| 28 | Lâu đài cổ | denLong | Đèn Lồng Ma | thường · Xạ thủ | Băng |
| 29 | Lâu đài cổ | meoDen | Mèo Đen Hai Đuôi | thường · Nhanh nhẹn | Băng |
| 30 | Lâu đài cổ | huLua | Hũ Lửa Sống | thường · Cảm tử | Băng |
| 31 | Lâu đài cổ | tieuYeu | Tiểu Yêu Ném Pháo | thường · Đặt bom | Băng |
| 32 | Lâu đài cổ | nhimThan | Nhím Than Hồng | thường · Gai | Băng |
| 33 | Lâu đài cổ | tuongMa | Tướng Ma | tinh anh | Băng |
| 34 | Lâu đài cổ | huChua | Hũ Lửa Chúa | tinh anh | Băng |
| 35 | Lâu đài cổ | hoLua | Hổ Lửa | trùm nhỏ | Băng |
| 36 | Lâu đài cổ | hoTinh | Hồ Tinh | trùm vùng | sao thứ ba |

(30 quái = 24 thường + 6 tinh anh; cộng 3 trùm nhỏ + 3 trùm vùng = 36 trang.) Vùng mới (Bước 3: Sông sâu) chỉ cần thêm dòng vào bảng
dữ liệu, sổ tự có thêm một mục. Quái phụ do trùm gọi ra (`e.add`) và ảo ảnh (`e.illusion`) không tính.

**Bản lưu cũ**: bé đã chơi xa thì sổ **không trống trơn**: lần đầu mở, mọi quái của vùng đã qua ải được tính "Đã gặp"; trùm vùng đã hạ
(có sao ải 5) tính "Đã hạ", có sao 3 thì "Tìm ra điểm yếu". Phần còn lại bé tự điền (vì game cũ chưa đếm từng con).

---

### 1.2 Việc làng hằng ngày ("Việc hôm nay")

**Người chơi thấy gì.** Anh Mõ, thẻ "Việc hôm nay": tấm **bảng việc làng** có 3 thẻ việc, mỗi thẻ: biểu tượng, câu việc, thanh tiến độ
(ví dụ 12/30), phần thưởng, nút **Nhận** khi xong. Dưới bảng: **rương ngày** (mở khi xong đủ 3 việc) và **dải 7 ô tuần** (ô nào làm đủ 3 việc
thì được đóng dấu trống đồng). Góc phải: "Ngày mới sau 05:12:30" (giống ải ngày).

**Luật**
- Ngày tính theo giờ máy, đổi lúc 0 giờ (dùng đúng cách của ải ngày; ngày lùi giờ máy thì không ra việc mới).
- Mỗi ngày **3 việc**: 1 việc **Dễ**, 1 **Vừa**, 1 **Khó** (Khó vẫn làm được trong 2–3 ải). Không trùng nhóm.
- Việc được chọn từ các mẫu **hợp với tiến độ của bé** (chưa mở ải ngày thì không ra việc ải ngày; chưa có vũ khí Thức tỉnh thì không ra việc
  phản ứng hệ…). Chọn theo "hạt giống" = ngày + mã riêng của bản lưu, nên tải lại trang hay đổi máy (lưu mây) vẫn ra đúng 3 việc đó.
- **Đổi việc**: mỗi ngày đổi miễn phí **1 lần** một việc chưa xong (bé không thích việc nào thì đổi).
- Tiến độ chỉ tính từ lúc nhận việc; tính cả ải thường, ải ngày, độ khó 2. Thua ải vẫn giữ số quái đã hạ (bé không buồn khi thua).
- **Rương ngày** (xong đủ 3 việc): đá nâng bậc + linh khí. **Tuần** (Thứ 2 → Chủ nhật): đủ **5 ngày** đóng dấu → **rương tuần**
  (thay cho "đá tôi" trong thiết kế cũ, vì đá tôi đã bỏ ở đợt 4).

**Thưởng mỗi việc** (theo vùng cao nhất bé đã hạ trùm: chưa hạ Mộc Tinh = mức 1, đã hạ Mộc Tinh = mức 2, đã hạ Ngư Tinh = mức 3):

| | Mức 1 | Mức 2 | Mức 3 |
|---|---|---|---|
| Việc Dễ | 60 vàng + 2 quặng | 120 vàng + 3 quặng | 200 vàng + 4 quặng |
| Việc Vừa | 90 vàng + 3 quặng | 180 vàng + 4 quặng | 300 vàng + 6 quặng |
| Việc Khó | 120 vàng + 4 quặng | 240 vàng + 6 quặng | 400 vàng + 8 quặng |
| Rương ngày (3/3) | 2 đá nâng bậc + 8 linh khí | 3 đá + 12 linh khí | 4 đá + 16 linh khí |
| Rương tuần (5 ngày) | 1 bùa giữ bậc + 5 đá | 1 bùa + 8 đá | 1 bùa + 12 đá |

**22 mẫu việc** (số trong ngoặc là mặc định; mẫu có điều kiện mở ghi ở cột cuối)

| # | Mã | Câu việc | Nhóm | Mức | Mở khi |
|---|---|---|---|---|---|
| 1 | haQuai | Hạ (30) quái | hạ quái | Dễ | luôn |
| 2 | haTinhAnh | Hạ (3) tinh anh | hạ quái | Vừa | luôn |
| 3 | haLoai | Hạ (8) con *<tên quái đã có trang sổ>* | sổ | Dễ | sổ có ≥ 3 trang ★ |
| 4 | timDiemYeu | Tìm ra điểm yếu của (1) quái mới trong sổ | sổ | Khó | còn trang chưa ★★ ở vùng đã mở |
| 5 | quaAi | Qua (2) ải bất kỳ | qua ải | Dễ | luôn |
| 6 | khongBinh | Qua (1) ải không dùng bình máu | qua ải | Vừa | luôn |
| 7 | baSao | Qua (1) ải đạt 3 sao | qua ải | Khó | luôn |
| 8 | trumKhac | Hạ (1) trùm bằng hệ khắc chế (sao thứ ba) | trùm | Khó | luôn |
| 9 | veVung | Về thăm *<vùng ít chơi nhất đã mở>*: qua (1) ải ở đó | qua ải | Dễ | đã mở ≥ 2 vùng |
| 10 | kho2 | Qua (1) ải độ khó 2 | qua ải | Khó | đã mở độ khó 2 |
| 11 | aiNgay | Thắng (1) lượt Ải ngày | ải ngày | Vừa | ải ngày đã mở và hôm nay còn lượt |
| 12 | heKet | Kết liễu (15) quái bằng đòn *<Lửa/Độc/Băng — xoay theo ngày>* | hệ | Vừa | có vũ khí đã chọn hệ đó |
| 13 | dinhHe | Làm (25) quái dính hiệu ứng hệ (cháy, độc, chậm) | hệ | Dễ | có vũ khí cấp Mầm |
| 14 | phanUng | Gây (5) lần phản ứng hệ (Nổ lan, Lây độc, Băng vỡ) | hệ | Khó | có vũ khí Thức tỉnh |
| 15 | vuKhi | Hạ (12) quái bằng *<vũ khí bé ít dùng nhất>* | vũ khí | Dễ | luôn |
| 16 | doiVk | Đổi vũ khí giữa trận (10) lần | vũ khí | Dễ | luôn |
| 17 | dacBiet | Dùng đòn Đặc biệt (10) lần | chiêu | Dễ | luôn |
| 18 | chuong | Bắn Chưởng (15) lần | chiêu | Dễ | đã mở chưởng |
| 19 | ne | Lộn né (20) lần | chiêu | Dễ | luôn |
| 20 | ruong | Mở (2) rương báu | phòng | Dễ | luôn |
| 21 | thuThach | Thắng (1) phòng thử thách | phòng | Vừa | đã gặp phòng thử thách |
| 22 | nangCap | Nâng cấp (1) lần ở làng (mài, nâng vũ khí, ép đồ, nâng bộ, học điểm) | làng | Dễ | luôn |

Cách chọn 3 việc/ngày: lọc mẫu đang mở → chọn 1 Dễ, 1 Vừa, 1 Khó (khác nhóm nhau) theo hạt giống ngày; không ra lại đúng mẫu đã ra hôm qua
nếu còn mẫu khác. Thiếu mẫu ở một mức thì lấy mẫu mức thấp hơn nhưng thưởng vẫn theo ô (người mới hay gặp trường hợp này).

---

### 1.3 Thành tựu và danh hiệu

**Người chơi thấy gì.** Ông Từ, thẻ "Thành tựu": lưới **huy hiệu tròn khung đồng** (chưa đạt: xám + ổ khoá; đạt: sáng, có nút Nhận).
Chạm huy hiệu: tên, cách đạt, tiến độ (ví dụ 412/1000), thưởng. Trên cùng: **danh hiệu đang đeo** + nút "Đổi danh hiệu".
Danh hiệu hiện dưới tên Zed ở Hành trang, ở bảng Ông Từ, và trên đầu Zed trong làng (chữ nhỏ). Mặc định không hiện trên Bảng vàng (Q5).

- Thành tựu **dài hạn, thưởng một lần**, không có hạn giờ. 3 cấp huy hiệu: Đồng (dễ), Bạc (vừa), Vàng (khó).
- Bản lưu cũ: thành tựu nào đọc được từ tiến độ cũ (sao, trùm đã hạ, cấp, bậc ép, cấp vũ khí…) thì **tự đạt ngay** lần đầu mở (vẫn bấm Nhận).
  Thành tựu đếm số (hạ 1000 quái…) bắt đầu đếm từ bản này.

**30 thành tựu** (thưởng: V = vàng, LK = linh khí, Đ = đá nâng bậc, B = bùa giữ bậc, DH = danh hiệu)

| # | Mã | Tên | Cách đạt | Cấp | Thưởng |
|---|---|---|---|---|---|
| 1 | buocDau | Bước đầu | Qua ải hướng dẫn | Đồng | 100 V · DH "Tân binh" |
| 2 | cuuTeo | Cứu bạn đầu tiên | Hạ Mộc Tinh (cứu Cu Tèo) | Đồng | 10 LK · DH "Người cứu bạn" |
| 3 | cuuBong | Cứu Cái Bống | Hạ Ngư Tinh | Bạc | 20 LK |
| 4 | cuuLi | Cứu Cu Lì | Hạ Hồ Tinh | Vàng | 30 LK · DH "Anh hùng làng" |
| 5 | quai100 | Diệt yêu | Hạ 100 quái | Đồng | 200 V |
| 6 | quai1000 | Trừ yêu | Hạ 1.000 quái | Bạc | 3 Đ |
| 7 | quai5000 | Khắc tinh yêu quái | Hạ 5.000 quái | Vàng | 1 B · DH "Khắc tinh yêu quái" |
| 8 | tinhAnh50 | Săn tinh anh | Hạ 50 tinh anh | Bạc | 3 Đ |
| 9 | sao15 | Mười lăm sao | Tổng 15 sao (độ khó thường) | Đồng | 300 V |
| 10 | sao45 | Trọn sao | Đủ 45 sao ở 15 ải độ khó thường | Vàng | 1 B · DH "Sao sáng" |
| 11 | kho2 | Gan dạ | Qua 1 ải độ khó 2 | Bạc | 5 Đ |
| 12 | kho2Trum | Không sợ trùm | Hạ Hồ Tinh ở độ khó 2 | Vàng | 1 B · DH "Không biết sợ" |
| 13 | khongBinh | Không cần thuốc | Qua 10 ải không dùng bình máu | Bạc | 300 V |
| 14 | khacChe | Biết người biết ta | Hạ trùm bằng hệ khắc chế 10 lần | Bạc | 15 LK · DH "Quân sư nhí" |
| 15 | khongKip | Nhanh hơn trùm | Hạ một trùm vùng mà nó chưa kịp kháng hệ nào | Vàng | 20 LK · DH "Tia chớp" |
| 16 | mam | Mầm non | Nâng 1 vũ khí lên Mầm | Đồng | 100 V |
| 17 | thucTinh1 | Thức tỉnh | Nâng 1 vũ khí lên Thức tỉnh | Bạc | 3 Đ |
| 18 | thucTinh4 | Bốn món thần binh | Cả 4 vũ khí Thức tỉnh | Vàng | 1 B · DH "Chủ thần binh" |
| 19 | baHe | Đủ ba hệ | Có vũ khí Thức tỉnh ở cả Lửa, Độc, Băng (cùng lúc hoặc lần lượt) | Vàng | 20 LK |
| 20 | epTim | Ép đồ lên Tím | 1 vũ khí bậc Tím | Đồng | 2 Đ |
| 21 | epDo | Rực lửa | 1 vũ khí bậc Rực lửa | Vàng | DH "Thợ rèn lửa" |
| 22 | mai10 | Mài sắc | Mài 1 vũ khí lên +10 | Bạc | 10 quặng |
| 23 | cap20 | Lớn khôn | Zed cấp 20 | Bạc | 300 V |
| 24 | cap40 | Trưởng thành | Zed cấp 40 | Vàng | DH "Đại hiệp nhí" |
| 25 | boDo | Tủ đồ | Mở đủ 4 bộ trang phục | Bạc | 15 LK |
| 26 | chuongDay | Chưởng đầy | Học đầy 1 cây chưởng | Bạc | 300 V |
| 27 | so12 | Chép sổ | 12 trang sổ đạt ★ | Đồng | 200 V |
| 28 | soDu | Sổ đủ trang | Cả 36 trang đạt ★★ | Vàng | 1 B · DH "Nhà yêu quái học" |
| 29 | viec7 | Chăm chỉ | Nhận rương ngày 7 lần | Bạc | 3 Đ · DH "Chăm ngoan" |
| 30 | viec30 | Siêng năng | Nhận rương ngày 30 lần | Vàng | 1 B · DH "Con ngoan trò giỏi" |

**Danh hiệu (18)**: 14 danh hiệu từ bảng trên + 3 "Thợ săn Rừng già / Hang biển / Lâu đài cổ" + 3 "Bậc thầy <vùng>" từ Sổ yêu quái
(trừ trùng còn 18, đều chỉ để khoe, **không cộng sức mạnh**). Trang phục trang trí: để sau (Q6).

---

## 2. Dữ liệu lưu thêm

Bản lưu hiện là **một đối tượng JSON** ở máy (khoá `linhkhi_save_v1`) và được đẩy **nguyên chuỗi** lên mây (`linhkhi_users/{uid}.save`,
giới hạn 400 KB). Thêm trường mới vào `G.save` là tự lên mây, **không phải sửa luật Firestore, không đổi đăng nhập** (khách / Google giữ nguyên).

Ba trường mới ở gốc bản lưu, đều **tuỳ chọn** (bản lưu cũ không có thì tự tạo; sai kiểu thì dựng lại theo tiến độ, không làm hỏng phần khác):

| Khoá | Nội dung | Cỡ ước tính |
|---|---|---|
| `so` | `{ v:1, q:{ <mã quái>: { g:1 (đã gặp), h:<số lần hạ>, k:1 (tìm ra điểm yếu), n:<bit đã nhận thưởng nấc 1/2/3> } }, vung:{ <0..2>: <bit đã nhận thưởng vùng ★★ / ★★★> }, bu:1 (đã bù từ bản lưu cũ) }` | ≤ 2 KB |
| `nv` | `{ v:1, hat:<số ngẫu nhiên tạo một lần>, cuoi:'YYYY-MM-DD' (ngày lớn nhất đã thấy), ds:[ { m:<mã mẫu>, x:<tham số: hệ / mã quái / vùng / vũ khí>, can:<số cần>, d:<đã làm>, nhan:0/1 } ×3 ], doi:0/1, ruong:0/1, hom:<mã mẫu hôm qua>, tuan:{ ma:'YYYY-MM-DD' (thứ 2 đầu tuần), ngay:[0..6 đã đóng dấu] }, tuanNhan:0/1, demRuong:<số rương ngày đã nhận> }` | ≤ 1 KB |
| `tt` | `{ v:1, dem:{ quai, tinhAnh, khongBinh, khacChe, ... (bộ đếm trọn đời) }, xong:{ <mã>:1 }, nhan:{ <mã>:1 }, dh:<mã danh hiệu đang đeo>, bu:1 }` | ≤ 1,5 KB |

- Theo cách của `ai_ngay.js`: mỗi tệp mới **bọc `G.fixSave`** để sửa phần của mình mỗi lần nạp (máy và mây đều đi qua `G.fixSave`).
  **Không thêm vào `G.newSave`** các cờ một lần (`bu`) — ghi chú trong `engine.js` đã cảnh báo vòng "thiếu gì thì bù" chép cờ của bản mới sang bản cũ.
- Bộ đếm trong một lượt ải giữ ở bộ nhớ (không ghi mỗi con quái); ghi vào bản lưu khi **kết thúc ải** (cùng lúc `settle` gọi `G.persist()`),
  khi rời ải và khi qua cửa phòng (cùng nhịp với `luu_luot.js`), để iPhone tự tải lại trang cũng không mất nhiều.
- Lưu mây: `cloud.js` đẩy bản lưu sau 4 giây, so tiến độ hai bản bằng sao + ải xa nhất → **không đổi**. Hai máy lệch nhau thì bản được chọn
  thắng nguyên khối (như hiện nay); không gộp từng trường (giữ đơn giản, ít rủi ro).
- Chống chỉnh giờ: như ải ngày, chỉ tiến khi ngày máy > `nv.cuoi`.
- Khôi phục: xoá ba khoá này là game về như trước (cờ quay lui không xoá dữ liệu, chỉ ẩn).

---

## 3. Ảnh cần gen

Phong cách chung: **khung đồng Đông Sơn** giống `gd-khung-bang` — viền gỗ đỏ nâu, nẹp đồng vàng, hoa văn mây cuộn và chữ "回" (meander) ở góc,
huy hiệu tròn **chim Lạc**; lòng nâu sẫm. Nền **#00FF00**, không chữ, theo 5 luật ở `docs/LUAT-VE-CHUNG.md` (viền `#14182e`, sáng từ trên trái,
≤ 16 màu mỗi hình). Ảnh quái trong sổ **dùng lại hình có sẵn**, không gen thêm.

Ảnh mẫu kèm khi gửi (trong repo):
- Khung: `docs/anh-goc/giao-dien/gd-khung-bang.png` (bắt buộc), `docs/anh-goc/giao-dien/dot2/o-con-2-trang-thai.png`, `docs/anh-goc/giao-dien/dot2/the-nho.png`
- Biểu tượng: `docs/anh-goc/ep-do/E8-bieu-tuong-ai-ngay.png`, `docs/anh-goc/ep-do/E1-da-nang-bac.png`
- Hiệu ứng: `docs/anh-goc/ep-do/E4-hu-ep-thanh-cong.png`
- Cổng / vật to: `docs/anh-goc/ep-do/E7-cong-ai-ngay.png`

Đặt ảnh gen ở `docs/anh-goc/buoc-2/` tên `B<số>-<mã>.png`; prompt chép vào `docs/anh-goc/buoc-2/prompt.txt`.

| # | Mã trong game | Dùng ở | Cỡ trong game | Ảnh mẫu kèm | Prompt (tiếng Anh) |
|---|---|---|---|---|---|
| B1 | gd-so-trang | Khung trang sổ (9 mảnh, kéo giãn) | ~300×200 | gd-khung-bang.png | Pixel art UI frame of an old monster journal page: aged parchment interior, bronze Dong Son drum border with meander corners and small Lac bird medallions, red-brown wood edge, empty center, same style as reference frame, flat green #00FF00 background, no text. |
| B2 | gd-so-bia | Nút / biểu tượng Sổ yêu quái | 32×32 | E8 | Pixel art icon of a closed thick book with bronze corner plates and a Dong Son sun-star emblem on the cover, a demon claw mark across it, black outline, 32x32, green #00FF00 background, no text. |
| B3 | gd-so-o | Ô quái trong lưới sổ, 3 trạng thái (chưa gặp / đã gặp / thuần thục) | 30×30 mỗi ô | o-con-2-trang-thai.png | Pixel art: 3 square slots in a row, bronze Dong Son trim: (1) dark locked slot with faint question mark shape, (2) normal bronze slot dark inside, (3) golden glowing slot with tiny sparkles. Empty interiors, slots not touching, green #00FF00 background, no text. |
| B4 | gd-so-dau | Dấu đỏ "đã tìm điểm yếu" (3 dấu: lửa / độc / băng) | 24×24 | E1 | Pixel art: 3 round red ink seal stamps in a row, each with a simple element symbol inside: flame, poison droplet, snowflake; slightly rough stamped edges, green #00FF00 background, no text, not touching. |
| B5 | gd-so-sao | Sao nấc sổ (trống / đồng / bạc / vàng) | 10×10 | E1 | Pixel art: 4 tiny five-point stars in a row: empty dark outline, bronze, silver, gold; Dong Son engraved style, black outline, green #00FF00 background. |
| B6 | gd-bang-viec | Bảng việc làng của Anh Mõ (nền trên bảng Việc hôm nay) | ~200×120 | gd-khung-bang.png, E7 | Pixel art village notice board: wooden board with bronze Dong Son trim, small tiled roof, a wooden gong-stick (mo) hanging on the side, three empty paper slips pinned on it, front view, green #00FF00 background, no text. |
| B7 | gd-the-viec | Thẻ một việc (3 mảnh ngang), 2 trạng thái (đang làm / xong) | 280×34 | the-nho.png | Pixel art: 2 horizontal paper slip bars stacked, bronze end caps with meander pattern: top plain beige slip, bottom same slip with golden glow and a red check seal on the right end, empty middle, green #00FF00 background, no text. |
| B8 | gd-icon-viec | 12 biểu tượng loại việc (tấm 4×3) | 20×20 mỗi cái | E8 | Pixel art sheet of 12 small icons in a 4x3 grid, Dong Son bronze style, black outline: crossed swords, horned elite skull, flag on gate, three stars, crossed-out potion, flame-drop-snowflake trio, burst explosion, rolling dodge swirl, palm energy blast, open treasure chest, anvil with hammer, daily portal arch. Not touching, green #00FF00 background, no text. |
| B9 | gd-ruong-ngay | Rương ngày (đóng / mở) | 32×28 | E1, E7 | Pixel art: 2 frames of a small lacquered red wooden chest with bronze Dong Son bands: closed, and open with golden light and coins inside, side by side not touching, green #00FF00 background, no text. |
| B10 | gd-o-tuan | Ô ngày trong dải tuần (trống / đã đóng dấu trống đồng) | 18×18 | E8 | Pixel art: 2 small square calendar tiles: plain bronze-framed empty tile, and same tile stamped with a red-gold bronze drum sun-star mark, green #00FF00 background, no text. |
| B11 | gd-huy-khung | Khung huy hiệu tròn: đồng / bạc / vàng / khoá | 32×32 | gd-khung-bang.png (medallion góc) | Pixel art: 4 round medallion frames in a row like Dong Son drum faces: bronze, silver, gold, and a dark grey one with a small padlock; empty dark center, meander rim, green #00FF00 background, no text. |
| B12 | gd-huy-hinh | 16 hình nhỏ đặt giữa huy hiệu (tấm 4×4) | 18×18 mỗi cái | E8 | Pixel art sheet of 16 tiny emblems in a 4x4 grid, gold engraved Dong Son style: Lac bird, child silhouette, monster skull, star, potion, two crossed weapons, sprout, awakened glowing sword, three element orbs, anvil, flame, whetstone, open book, sun calendar, treasure chest, crown. Black outline, not touching, green #00FF00 background, no text. |
| B13 | gd-danh-hieu | Dải băng danh hiệu (3 mảnh ngang), 3 màu (đồng / bạc / vàng) | 120×16 | the-nho.png | Pixel art: 3 horizontal ribbon banners stacked, folded tails at both ends, bronze, silver and gold fabric with tiny meander trim, empty middle for text, green #00FF00 background, no text. |
| B14 | gd-the-ong-tu | 3 biểu tượng thẻ (Zed / Sổ / Thành tựu) cho bảng Ông Từ và Anh Mõ "Việc hôm nay" | 16×16 | E8 | Pixel art: 4 tiny tab icons in a row, Dong Son bronze style: child face, monster book, medal, notice board with gong-stick; black outline, green #00FF00 background, no text. |
| B15 | hu-nhan-thuong | Hiệu ứng bấm Nhận (6 khung) | 64×64 mỗi khung | E4 | Pixel art effect, 1 row of 6 frames: a burst of golden light from center, coins and purple crystal shards pop out and fall, sparkles fade. Frames not touching, green #00FF00 background. |
| B16 | hu-dong-dau | Hiệu ứng đóng dấu điểm yếu (5 khung) | 40×40 mỗi khung | E4 | Pixel art effect, 1 row of 5 frames: a red seal stamp drops from above, hits with a small dust ring and ink splash, then settles. Frames not touching, green #00FF00 background. |
| B17 | hu-huy-hieu | Hiệu ứng mở huy hiệu (6 khung) | 48×48 mỗi khung | E4 | Pixel art effect, 1 row of 6 frames: a round bronze medallion spins and flips, rays of golden light, Lac bird glow ring expands. Frames not touching, green #00FF00 background. |

17 ảnh gốc → khoảng 50 hình nhỏ sau khi cắt. Ảnh chưa có thì game **vẽ code tạm** (như các `gd-*` hiện có), nên code không phải chờ ảnh.

---

## 4. Chia việc code (mỗi bước = 1 phiên)

Thứ tự: **Phiên 0** làm trước (nền chung, ngắn) → **Phiên A, B, C chạy song song** → **Phiên D** (ảnh) chạy bất cứ lúc nào có ảnh →
**Phiên E** (cân bằng + dọn) cuối cùng. Mọi phiên: không đụng master, không force push, không PR, không chép apiKey, không làm hỏng đăng nhập
Google / lưu mây / `?cloud=0`, chữ mới có bản dịch tiếng Anh.

### Phiên 0 — Nền chung: "sự kiện" + ngày + bản lưu
- Tệp mới `game/js/su_kien.js` (nạp sau `stage.js`, trước `village.js` trong `index.html`):
  - `G.suKien.on(ten, fn)` / `phat(ten, du_lieu)`: bus nhỏ. Bọc **từ bên ngoài** các hàm có sẵn để phát sự kiện: `G.kill` (hạ quái: mã quái,
    vai, tinh anh/trùm, hệ đòn kết liễu, hiệu ứng đang dính, vũ khí đang cầm), `G.onStageEnd` (qua/thua ải, sao, `starNote`, bình máu, độ khó,
    ải ngày) — **phải gọi tiếp hàm cũ của Bảng vàng**, `G.startStage`, lộn né / đặc biệt / đổi vũ khí / chưởng (đọc thay đổi `P.dodgeT`,
    `P.specCd`, `P.swapCd`, lần bắn chưởng mỗi khung trong `G.tick` để khỏi sửa `combat.js`), mở rương, thắng phòng thử thách,
    phản ứng hệ (bọc `G.moves.onKill`), nâng cấp ở làng (bọc `G.persist` trong làng + so khác biệt cấp/mài/bậc/điểm — hoặc 1 dòng gọi ở mỗi nút).
  - "Gặp quái": khi quái vào phòng (đọc `W.ents` lúc vào phòng).
  - `G.ngay.homNay()`, `G.ngay.dauTuan()` (dùng chung với ải ngày, không sửa `ai_ngay.js`).
  - Bọc `G.fixSave` tạo/sửa `so`, `nv`, `tt` (rỗng, an toàn).
- Cờ quay lui: `?sukien=0` (`G.SU_KIEN_BAT = false`) → không phát sự kiện, ba hệ sau tự ẩn.
- Kiểm: `node --check`, `python3 game/build.py`, bài nhỏ chạy Node (`tests/node_trang.js`): nạp bản lưu cũ, `G.fixSave` không đổi phần cũ;
  giả lập 1 ải thắng → nhận đúng chuỗi sự kiện; bản lưu cũ + mây giả (`tests/fake_firebase.js`, `cloud_save_regression.test.js`) vẫn qua.

### Phiên A — Sổ yêu quái (song song)
- Tệp mới `game/js/so_yeu_quai.js`: bảng 36 trang (mã, vùng, loại, hệ khắc) đặt trong `data.js` (`G.SO_YQ`) + nghe sự kiện + giao diện thẻ
  "Sổ yêu quái" ở Ông Từ + bù bản lưu cũ + thưởng.
- Sửa nhỏ: `village.js` (Ông Từ có hàng thẻ, giống `doTabs` của Cụ Đồ), `village_scene.js` (`checkNews`: chấm đỏ Ông Từ),
  `data.js` (bảng), `index.html` (thêm script), `ngon_ngu_en.js` hoặc `G.ngonNgu.them` trong tệp.
- Cờ quay lui: `?soyq=0`.
- Kiểm: Node: hạ quái đúng hệ → ★★; trùm vùng sao 3 → ★★; bù bản lưu cũ đúng; nhận thưởng 1 lần. Ảnh soát tĩnh `xem-so.png` (Playwright chụp
  bảng ở VI + EN, 480×270). Không chơi thử dài.

### Phiên B — Việc hôm nay (song song)
- Tệp mới `game/js/viec_ngay.js`: 22 mẫu (`G.VIEC_NGAY` trong `data.js`: mẫu, mức, số cần, điều kiện mở, bảng thưởng), chọn 3 việc theo hạt giống,
  đổi việc, rương ngày, dải tuần, tự cộng thưởng quên nhận, giao diện thẻ "Việc hôm nay" ở Anh Mõ, dòng báo trong ải, dòng ở bảng kết quả,
  nút xem ở bảng Tạm dừng.
- Sửa nhỏ: `village.js` (Anh Mõ có hàng thẻ: Việc hôm nay | Cài đặt), `village_scene.js` (chấm đỏ Anh Mõ: hiện `CHU_RO` đang tắt chấm của Anh Mõ —
  cho phép chấm khi có việc chờ nhận), `stage.js` (1 dòng ở bảng kết quả + nút Tạm dừng — hoặc bọc ngoài nếu được), `data.js`, `index.html`.
- Cờ quay lui: `?viecngay=0`.
- Kiểm: Node: đổi ngày giả (đặt `Date`) → ra 3 việc mới, cùng hạt giống ra cùng việc; ngày lùi không ra việc; xong 3 → rương; 5 ngày → rương tuần;
  quên nhận → hôm sau tự cộng. Ảnh soát `xem-viec.png`.

### Phiên C — Thành tựu + danh hiệu (song song)
- Tệp mới `game/js/thanh_tuu.js`: 30 thành tựu (`G.THANH_TUU` trong `data.js`), bộ đếm trọn đời, kiểm đạt (từ sự kiện + đọc bản lưu: sao, cấp,
  bậc ép, cấp vũ khí, bộ đồ, cây chưởng, sổ, rương ngày), bù bản lưu cũ, thẻ "Thành tựu" ở Ông Từ, chọn danh hiệu, hiện danh hiệu ở Hành trang
  và trên đầu Zed ở làng.
- Sửa nhỏ: `hanh_trang.js` (1 dòng danh hiệu + nút "Đến chỗ…"), `village_scene.js` (chữ danh hiệu trên đầu Zed), `data.js`, `index.html`.
- Phụ thuộc nhẹ Phiên A, B (thành tựu 27–30 đọc `so`/`nv`): đọc an toàn, chưa có thì coi như 0.
- Cờ quay lui: `?thanhtuu=0`.
- Kiểm: Node: bản lưu cũ đã hạ Hồ Tinh → thành tựu 2–4 đạt ngay; đếm quái; nhận 1 lần; đổi danh hiệu. Ảnh soát `xem-thanh-tuu.png`.

**Tránh đụng nhau khi chạy song song**: A và C cùng sửa bảng Ông Từ → Phiên 0 dựng sẵn khung thẻ Ông Từ (`Zed | Sổ | Thành tựu`) với hai hàm rỗng
`G.villageApi.PANELS.so` / `.thanhTuu`; A và C chỉ điền hàm của mình. Mỗi phiên thêm khối riêng có chú thích vào `data.js` (cuối tệp), tránh sửa cùng dòng.
Đẩy lên thì `pull --rebase` trước.

### Phiên D — Cắt ảnh và gắn vào game (khi có ảnh)
- `docs/anh-goc/buoc-2/cat_buoc_2.py` (theo mẫu `docs/anh-goc/ep-do/cat_ep_do.py`) → `game/art/custom/gd-*.sprite.json`, `hu-*.sprite.json`;
  ảnh soát `docs/anh-goc/buoc-2/xem-truoc.png`. Thay chỗ vẽ code tạm bằng ảnh; cờ `?khunganh=0` vẫn về vẽ code.
- Ghi dung lượng tải thêm (trần 20 MB).

### Phiên E — Cân bằng + chốt
- Thêm mục 7 vào `tools/can-bang/tinh.js` (xem mục 5), chạy `tests/cay.py --node --ngay=8` có/không có ba hệ, so bảng; chỉnh số trong `data.js` nếu lệch.
- Viết hướng dẫn ngắn vào `game/README.md` (bảng người làng: Anh Mõ, Ông Từ).

---

## 5. Ảnh hưởng cân bằng

Ước tính một ngày chơi bình thường (8 lượt ải, như mô hình `tinh.js`), so với thu nhập hiện tại:

| Nguồn thêm | Vùng 1 / ngày | Vùng 3 / ngày | So với thu nhập 8 lượt ải + ải ngày |
|---|---|---|---|
| 3 việc (vàng) | 270 V | 900 V | vùng 1 ~ +20%, vùng 3 ~ +10% (vùng 3 có Ải Vàng tới 3.300 V/ngày) |
| 3 việc (quặng) | 9 | 18 | ~ +20% (8 lượt ải cho ~60–100 quặng + Ải Đá Mài) |
| Rương ngày | 2 Đ + 8 LK | 4 Đ + 16 LK | đá: ~ +1 lượt Ải Đá Bậc Dễ/ngày; linh khí ~ 1–2 trùm vùng |
| Rương tuần | 1 B + 5 Đ | 1 B + 12 Đ | bùa giữ bậc: hiện 10% trùm vùng / 600 V ở thương nhân |
| Sổ yêu quái (một lần, cả game) | ~2.500 V, ~200 LK, ~45 Đ (gồm thưởng vùng) | | chia ra suốt hành trình, không theo ngày |
| Thành tựu (một lần, cả game) | ~2.000 V, ~150 LK, ~20 Đ, 6 B, 10 quặng | | phần lớn ở cuối game |

Kết luận sơ bộ: thêm khoảng **10–20% vàng/quặng mỗi ngày** và một lượng đá ép đồ đều đặn → bé tới ải sau sớm hơn khoảng 1–2 lượt cày mỗi vùng.
Chấp nhận được với game trẻ con (mục tiêu là đỡ cày). Nếu bot thấy ải vùng 3 hết khó, giảm cột "Mức 3" trước, không đụng `STAGE_K`.

**Cách bot đo lại (Phiên E)**
1. `tools/can-bang/tinh.js` thêm mục 7 "Việc ngày + sổ + thành tựu": mỗi ngày giả (`NGAY_LUOT` = 8 lượt) cộng thưởng kỳ vọng 3 việc
   (giả định bé xong 3/3 ở 80% số ngày, 5/7 ngày), rương tuần mỗi 7 ngày; thưởng sổ cộng khi bot qua ải trùm của vùng (ước tính ★/★★ đủ vùng);
   thành tựu cộng theo mốc (cấp, sao, Thức tỉnh). In cột "Sức mạnh lúc tới ải" và "số lượt cày" **có / không** ba hệ (cờ `--khong-buoc2`).
2. `tests/cay.py --node --ngay=8` (bot thật trong Node): thêm lựa chọn `--viec` để bot tự bấm Nhận (việc, sổ, thành tựu) mỗi lần về làng.
   So số lần chơi mỗi ải với lần đo trước; ngưỡng cảnh báo: ải nào giảm quá 30% số lượt, hoặc vùng 3 trung bình < 2 lượt/ải.
3. Báo cáo ngắn `docs/ke-hoach/buoc-2/can-bang.md` (bảng trước/sau) cho chủ game.

---

## 6. Câu hỏi cần chủ game quyết

(Chữ **đậm** là lựa chọn đề xuất; chưa trả lời thì làm theo đề xuất.)

1. **Mở Việc hôm nay khi nào?** **(a) sau ải Rừng già 2** · (b) sau khi hạ Mộc Tinh (như thiết kế cũ) · (c) ngay từ đầu.
2. **Ai giữ các bảng?** **(a) Anh Mõ: Việc hôm nay; Ông Từ: Sổ + Thành tựu** · (b) thêm một người làng mới (phải vẽ người) · (c) để hết trong Hành trang.
3. **Hệ khắc của quái thường có thật sự gây thêm sát thương không?** **(a) không, chỉ ghi sổ** (giữ cân bằng) · (b) +15% sát thương khi đánh đúng hệ.
4. **Thưởng có to quá / nhỏ quá?** **(a) như bảng mục 1** · (b) giảm một nửa · (c) tăng gấp rưỡi.
5. **Hiện danh hiệu trên Bảng vàng?** **(a) không** (khỏi sửa luật Firestore) · (b) có (phải dán lại luật `linhkhi.rules`, thêm trường `dh`).
6. **Trang phục trang trí từ thành tựu** (như thiết kế cũ "danh hiệu hoặc trang phục")? **(a) để sau, Bước 2 chỉ danh hiệu** · (b) làm 2–3 món (mũ/khăn) — thêm ảnh + 1 phiên.
7. **Quên nhận việc hằng ngày thì sao?** **(a) hôm sau tự cộng** · (b) mất.
8. **Đổi việc mỗi ngày**: **(a) 1 lần miễn phí** · (b) 1 lần miễn phí + thêm lần 50 vàng · (c) không cho đổi.
9. **Rương tuần cần mấy ngày?** **(a) 5/7 ngày** · (b) 7/7 · (c) 3/7.
10. **Tên gọi**: "Việc hôm nay" / "Việc làng" / "Nhiệm vụ hằng ngày" — đề xuất **"Việc hôm nay"** (dễ hiểu với trẻ).

---

## Phụ lục kỹ thuật (cho phiên code)

- **Chỗ móc có sẵn** (không cần sửa sâu):
  - `combat.js` `G.kill(e, o)`: `e.art` = mã quái (trùng mã trang sổ), `e.role` ('elite'…), `e.isBoss` + `e.kind === 'mini'`, `e.add` (quái phụ: bỏ),
    `e.illusion` (bỏ), `o.el` hệ của đòn, `e.st.fire / poisonN / iceN / frozen` + `e.st.ch` (hiệu ứng do chưởng: không tính vào hệ vũ khí).
    Vũ khí đang cầm: `o.w` hoặc vũ khí hiện tại của `W.P`.
  - `stage.js` `settle(win)` gọi `G.onStageEnd(S, R)` (đang do `bang_vang.js` gán) → **bọc, gọi tiếp hàm cũ**. Có: `R.win`, `R.stars`,
    `R.starNote` [qua, không bình, hệ khắc], `S.r`, `S.i`, `S.diff`, `S.usedPotion`, `S.aiNgay`, `S.loot.kills`. Ải ngày `settle` trả sớm,
    **không gọi `G.onStageEnd`** → Phiên 0 bọc thêm `G.aiNgay.thuong` để biết thắng ải ngày.
  - Trùm vùng: `W.boss.layers` (lớp thích nghi đã gặp), `sv.scars[boss]` (vết sẹo).
  - Phòng thử thách: `S.challenge` (đặt ở `stage.js` dòng ~249). Rương: phần chọn rương ở `stage.js` (~dòng 396).
  - Lộn né: `combat.js` đặt `P.dodgeT = 0.27`; đặc biệt: `special(P)`; đổi vũ khí: `inp.swapP` + `P.swapCd`; phản ứng hệ: `G.moves.onKill`.
  - Làng: `G.villageApi` (`PANELS`, `frame`, `npcSide`, `say`, `V`), `G.villageScene.checkNews` (chấm đỏ), `G.theme` (`panel`, `tab`, `btn`, `inset`).
  - Chữ: `G.t('… {0}', x)` cho chuỗi ghép, `G.ngonNgu.them({...})` để thêm bản dịch như `ai_ngay.js`.
  - Ảnh: `G.spriteCustom.gdSan(ma)` / `veGd(...)` — chưa có ảnh thì vẽ code (mẫu ở `ai_ngay.js` `veCong`, `veIcon`).
- **Thứ tự nạp** (`index.html`, `build.py` đọc theo thứ tự này): `… ai_ngay.js, chuong_ui.js, stage.js, su_kien.js, village_scene.js, village.js,
  hanh_trang.js, …, so_yeu_quai.js, viec_ngay.js, thanh_tuu.js` (ba tệp sau `village.js` / `hanh_trang.js` vì cần `G.villageApi`, trước `cloud.js`
  để bọc `G.fixSave` trước khi mây nạp — kiểm lại: `cloud.js` gọi `G.fixSave` lúc kéo bản mây, đã bọc từ trước là được).
- **Hạt giống việc ngày**: `hash(ngay + ':' + nv.hat)` → số ngẫu nhiên có định (không dùng `G.rnd` của trận). `nv.hat` tạo một lần khi chưa có.
- **Hiệu năng**: sự kiện hạ quái chỉ cộng số trong đối tượng bộ nhớ; không vẽ, không ghi `localStorage` mỗi con.
- **Kiểm chung mỗi phiên**: `node --check` mọi tệp sửa, `python3 game/build.py` ra `dist/` không lỗi, bài Node riêng của hệ, `tests/cloud_save_regression.test.js`,
  ảnh soát tĩnh VI + EN. Chủ game chơi thử sau Phiên A–C (bước 2.4 trong `BUOC-2-3-4.md`).
- **Cờ quay lui tổng hợp**: `?sukien=0` (tắt cả ba), `?soyq=0`, `?viecngay=0`, `?thanhtuu=0`, `?khunganh=0` (ảnh mới → vẽ code). Dữ liệu trong bản lưu giữ nguyên khi tắt.
