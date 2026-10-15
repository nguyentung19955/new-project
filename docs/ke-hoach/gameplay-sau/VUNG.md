# Kế hoạch các vùng 5–8 (Phiên 1 — VUNG.md)

Lập 15/10/2026. **Chỉ là kế hoạch**: chưa sửa gì trong `game/`, chưa gen ảnh, chưa viết prompt (phong cách ảnh chưa chốt — `docs/ke-hoach/khong-pixel/`).
Khuôn giữ đúng như vùng 4 (`docs/ke-hoach/buoc-3/KE-HOACH.md`): luật riêng · 5 ải · bố cục phòng · 8 quái thường (8 vai) + 2 tinh anh + trùm nhỏ + trùm vùng 3 pha ·
truyện (người cần cứu, mảnh trống, câu móc) · danh sách ảnh · chia việc · câu hỏi.

Đã đọc: `docs/cot-truyen/CHUNG.md`, `docs/ke-hoach/BUOC-2-3-4.md`, `docs/ke-hoach/buoc-3/KE-HOACH.md`, `docs/ke-hoach/LUAT-CAN-BANG.md`,
`docs/ke-hoach/khong-pixel/KE-HOACH.md` (phần dung lượng), `game/js/data.js` (`G.EL`, `G.WEAK`, `G.REGIONS`, `G.ROLES`, `G.MOB_ART`, `G.MAX_LEVEL`,
`G.STAGE_K`, `G.ZED_DAY`), danh sách khung que `docs/anh-goc/quai-moi/que/`, `game/tests/cay.py`, `tools/can-bang/tinh.js`.

Hai phiên song song: **LOI-DANH.md** (cách ra đòn, hệ Sét, né hoàn hảo, chiêu hợp lực…) và **LUC-CHIEN.md** (phụ kiện, linh thú, lực chiến).
Chỗ nào cần họ, tệp này chỉ ghi **🔗 Điểm nối** ngắn — không thiết kế thay.

---

## Tóm tắt một phút

| Vùng | Nơi · mã | Cảm giác | Luật riêng (mới) | Trùm nhỏ | Trùm vùng | Người cứu | Mảnh trống |
|---|---|---|---|---|---|---|---|
| **5** | Núi Sét · `nui` | Núi đá tím than, mây giông, ruộng bậc thang khô nứt | Sét báo trước · Cột đồng thu sét · Vũng mưa (Ướt) | Gấu Ngựa Sấm | **Thần Sét hoá điên** (cứu, không giết) | Thần Sét | Mảnh có **tượng cóc** (mưa về) |
| **6** | Rừng đá vôi, hang tối · `davoi` | Núi tai mèo, thạch nhũ, sông ngầm, đom đóm | Bóng tối + đèn soi · Đuốc thắp bằng Lửa · Thạch nhũ rơi | Rết Đá Trăm Chân | **Chằn Tinh** | Bác Tiều | Mảnh **nhà sàn, người giã gạo** |
| **7** | Đỉnh mây · `may` | Trời sáng chói, mây trắng, đá bay, tổ chim | Gió từng đợt · Quái bay (bóng dưới đất) · Mây mỏng | Yêu Gió Túi Da | **Đại Bàng Tinh** | Bé Diều (bị cắp) | Mảnh **thuyền, người đội mũ lông chim** |
| **8** | Đền trống đồng đáy sông · `den` | Đền đồng cổ dưới nước, rễ cây đa sáng xanh | Nhịp trống · Rễ đa giúp sức · **Ôn lại luật 4 vùng trước** | Trống Méo | **Hắc Long** (Thuồng Luồng hoá rồng) | Hồn Cây Đa | **Mảnh mặt trời** → trống lành |

- **Nhịp cảm xúc 4 vùng**: 5 ồn ào, nhiều ánh chớp → 6 tối, hồi hộp → 7 sáng chói, thoáng đãng (nghỉ mắt sau vùng tối) → 8 trang nghiêm, tổng kết.
- **Mỗi vùng dạy đúng MỘT điều mới** (để trẻ con nhớ): 5 = dùng môi trường + hệ Sét; 6 = nhìn trong tối (đèn, bóng, tiếng); 7 = đánh quái bay (đợi sà / đánh xa); 8 = nghe nhịp + ôn tất cả.
- **Không vùng nào có luật gây chết oan**: mọi vùng đỏ / đạn **luôn sáng, luôn thấy** (kể cả trong tối, trong gió), báo trước ≥ mức vai cũ (`KN.CU`).
- **Ảnh**: ~110–125 ảnh mỗi vùng 5–7; vùng 8 dùng lại 4 quái cũ (bản "ánh đồng" vẽ bằng code) nên ~95. **Dung lượng là rủi ro số 1** — xem mục 7 và Q1.
- **Cân bằng**: số trong tệp này chỉ là số xuất phát; mỗi vùng có phiên bot riêng (`tests/cay.py --node --kd`, `tools/can-bang/tinh.js`) như vùng 4.

---

## 0. Luật chung cho cả 4 vùng

### 0.1 Mã và chỉ số
| Vùng | Chỉ số `G.REGIONS` | Mã ảnh / `vung:` | Ải | Cờ ẩn cả vùng |
|---|---|---|---|---|
| 5 Núi Sét | 4 | `nui` (`gd-nen-nui-*`, `gd-cua-nui-*`, `gd-tt-nui-*`) | 5-1…5-5 (ải số 21–25) | `?vung5=0` |
| 6 Rừng đá vôi | 5 | `davoi` | 6-1…6-5 (26–30) | `?vung6=0` |
| 7 Đỉnh mây | 6 | `may` | 7-1…7-5 (31–35) | `?vung7=0` |
| 8 Đền trống đồng | 7 | `den` | 8-1…8-5 (36–40) | `?vung8=0` |

**Việc kỹ thuật một lần** (đề xuất cho phiên khung vùng 5): vùng 4 phải sửa mọi chỗ "cứng 3 vùng / 15 ải" (KE-HOACH vùng 4 mục 8.1). Khi làm vùng 5 nên sửa luôn
thành **"N vùng"** (đọc độ dài `G.REGIONS`), để vùng 6–8 chỉ còn là thêm dữ liệu + ảnh, không phải soát lại 20 tệp mỗi lần.

### 0.2 Luật an toàn khi thiết kế luật vùng (vừa sức trẻ con)
1. Luật vùng **không bao giờ** tự gây sát thương lớn: mỗi lần trúng luật vùng ≤ 8% máu tối đa của em bé.
2. Mọi thứ hại em bé đều có **báo trước ≥ 0,8 s** và **phát sáng** (thấy được trong tối, không bị mây/gió che).
3. **1,5 s đầu** khi vào phòng: luật vùng không đánh (sét, thạch nhũ, gió) — em bé kịp nhìn.
4. Luật vùng **đánh cả quái** (sét, thạch nhũ, mây mỏng…) → dạy "dụ quái vào bẫy". Nhưng phần sát thương từ môi trường ≤ ~15% tổng sát thương một ải (bot đo),
   để không thay kỹ năng đánh.
5. Mỗi vùng có cờ tắt riêng luật mới (`?setvung=0`, `?toi=0`, `?gio=0`, `?nhip=0`) để chủ game so sánh.
6. Mỗi vùng: 3 luật, không hơn. Vùng 8 không thêm luật lạ mà **ôn lại** luật cũ.

### 0.3 Vai quái giữ nguyên (8 vai `G.ROLES`)
Lính xông · Bầy nhỏ · Khiên · Xạ thủ · Nhanh nhẹn · Cảm tử · Đặt bom · Gai. Đã soát tên với 30 con vùng 1–3 và 11 con vùng 4 — **không trùng loài**
(không dùng lại: lợn, ong, dơi, bọ hung, ốc, cua, sóc, chồn, nhím, mèo, cá, cóc/ếch ở vai cũ, rắn ở quái thường…).
Chỉ vùng 8 cố ý dùng lại 4 quái cũ (mục 4).

### 0.4 🔗 Điểm nối chung
- **LOI-DANH**: bảng khắc hệ khi thêm **Sét** (`G.EL`, `G.WEAK` hiện là vòng Lửa → Băng → Độc → Lửa). Tệp này cần ở mỗi quái/trùm một ô "yếu"; chỗ nào phụ thuộc Sét ghi
  *"theo bảng LOI-DANH"* và có **đường lui** (đề xuất tạm của vùng: quái Sét kháng Sét; Sét đánh mạnh hơn lên quái đang **Ướt** và quái **vảy đồng / kim loại**).
- **LOI-DANH**: nếu có **né hoàn hảo / phản đòn**, mỗi vùng có ít nhất 1 đòn "dạy" nó (ghi ✦ trong bảng chiêu).
- **LUC-CHIEN**: trần cấp / cảnh giới cho vùng 5–8 (hiện `G.MAX_LEVEL = 40`, vùng 4 dùng hết 30 → 40). Mục 6 ghi nhu cầu.
- **LUC-CHIEN**: linh thú đầu tiên ra ở vùng 5 (đề xuất nguồn truyện: quà của Thần Sét). Vùng 7 có chỗ cho linh thú thứ hai (tuỳ họ).

---

## 1. Vùng 5 — Núi Sét (Thần Sét hoá điên)

### 1.1 Tên và cảm giác
- **Tên**: Núi Sét (mã `nui`). Hệ vùng: **Sét** (cần LOI-DANH thêm `set` vào `G.EL`).
- **Cảm giác**: núi đá tím than, mây giông đen sà thấp, chớp loé liên tục ở xa; chân núi là **ruộng bậc thang khô nứt nẻ** (Thần Sét điên → chỉ có sét, không có mưa),
  rừng tre cháy đen, bản đá bỏ hoang, cột đồng cổ cắm trên vách.
- **Dân gian dùng**: *Cóc kiện Trời* (trời hạn, cóc đi kiện, mưa về) — dùng **không khí và hình ảnh** (hạn hán, tượng cóc trên trống gọi mưa), không kể lại chuyện.
- **Bảng màu**: trời `#141026 → #2a2150 → #4a3a7a`, đất `#5a5468`, đất ruộng khô `#9a7a52`, nhấn **vàng chớp `#fff27a`** + **tím điện `#9a8cff`**.
  Khác Lâu đài cổ (đỏ cam) và Sông sâu (xanh rêu) bằng tông **tím + vàng chớp**.

### 1.2 Luật riêng
| Luật | Người chơi thấy | Tác dụng | Dạy ở |
|---|---|---|---|
| **Sét báo trước** | Đám mây đen nhỏ trôi trên sân; bóng tròn dưới đất **sáng vàng dần 1,2 s** + tiếng ù | Sét đánh xuống vòng tròn đó: em bé mất ~6% máu; **quái trúng thì choáng 0,8 s** và mất máu như đòn Sét nhỏ. Tối đa 1 sét / 2,5 s / phòng. | 5-1, phòng 1 có mũi tên + 1 câu mẹo |
| **Cột đồng thu sét** | Cột đồng xanh gỉ trên sàn (2–3 cột / phòng) | Đánh vào cột → cột tích điện 2 s (sáng dần) rồi **bắn tia nối sang cột gần nhất**; tia chỉ hại **quái** đứng trên đường nối. Sét trời gần cột thì rơi vào cột (cột "hút" sét). | 5-2 |
| **Vũng mưa** (trạng thái **Ướt**) | Vũng nước mưa xanh nhạt, có giọt rơi lấm tấm | Lội vào → **Ướt** 4 s (giọt nước trên đầu). Ướt thì dính Sét đau +30% — **cả em bé lẫn quái**. Dụ quái vào vũng rồi dùng Sét / dụ sét trời. | 5-3 (sau khi có hệ Sét) |

🔗 **LOI-DANH**: trạng thái *Ướt* + Sét là phản ứng hệ mới — nếu LOI-DANH chọn tên/số khác thì vùng 5 theo LOI-DANH, chỉ giữ ý "vũng mưa làm Ướt".

### 1.3 Năm ải
| Ải | Tên | Phòng | Có gì mới | Quái chính | Cuối ải |
|---|---|---|---|---|---|
| 5-1 | Ruộng bậc thang khô | 7 | Sét báo trước | Dê Núi, Chuồn Chuồn, Tê Tê, Cầy Hương | Gấu Ngựa Sấm → **mở hệ Sét** (Q4) |
| 5-2 | Rừng tre cháy | 7 | Cột đồng | + Khỉ Đá, Cầu Sét | Gấu Ngựa |
| 5-3 | Bản đá bỏ hoang | 8 (có phòng chọn cửa) | Vũng mưa (Ướt) | + Bù Nhìn, Đá Nam Châm; tinh anh Dê Đầu Đàn | Gấu Ngựa |
| 5-4 | Vách cột đồng | 8 | 2 luật cùng phòng | đủ 8; tinh anh Khỉ Già Trống Ngực | Gấu Ngựa |
| 5-5 | Đỉnh Sét | 8 | Sân trùm trên đỉnh, 4 cột đồng | đủ 8 + 2 tinh anh | **Thần Sét** |

### 1.4 Bố cục phòng
- Giữ bản đồ 8 phòng của `mapgen.js`. Phòng đánh: 2–3 cột đồng (không đặt sát cửa), 0–2 vũng mưa (từ 5-3), đá tảng, bờ ruộng thấp làm vật cản.
- Suối hồi: **miếu Thần Sét nhỏ** có chum nước mưa; bóng trùm hiện trên mặt chum.
- Sân trùm nhỏ: bãi đá trước hang gấu, 2 cột đồng.
- Sân Thần Sét: đỉnh núi bằng phẳng, 4 cột đồng ở 4 góc, mây giông quanh mép (mép = tường).

### 1.5 Tám quái thường
| # | Tên · mã | Vai | Hệ | Tạo hình | Cách đánh | Khắc / né | Khung que |
|---|---|---|---|---|---|---|---|
| 1 | **Dê Núi Sừng Sét** `deNui` | Lính xông | Sét | Dê đen lông xù, sừng cong lấp lánh điện | **Húc nạp điện**: cào đất 0,8 s (sừng sáng, vạch đỏ dài) rồi lao thẳng. Húc trúng tường/cột → choáng 1,2 s. | Né ngang; dụ húc vào cột đồng (cột tích điện luôn) | `4chan` |
| 2 | **Bầy Chuồn Chuồn Điện** `chuonChuon` | Bầy nhỏ | Sét | 4 con chuồn chuồn cánh trong, đuôi sáng | Bay vòng, rồi **xếp hàng lao qua** (vạch đỏ thẳng 0,6 s), đường bay để lại tia nhỏ 1 s. Bay thấp: mọi vũ khí đánh trúng. | Lửa (như bầy cũ) | `ong` có sẵn |
| 3 | **Tê Tê Vảy Đồng** `teTe` | Khiên | — | Tê tê vảy đồng xanh gỉ, mũi dài, mắt hiền | Giáp phía trước. **Cuộn lăn**: cuộn tròn 0,7 s rồi lăn thẳng, nảy tường 1 lần; lăn xong nằm ngửa chóng mặt 1,5 s → đánh bụng. **Vảy đồng hút sét**: trúng sét trời/tia cột → mất giáp 3 s. | Độc (như khiên cũ); hoặc dụ sét | `4chan` |
| 4 | **Khỉ Đá Ném Sấm** `khiDa` | Xạ thủ | Sét | Khỉ lông xám bạc ngồi trên tảng đá, ôm "hòn sấm" | Ném hòn sấm vòng cầu (bóng báo 0,7 s), hòn nảy 2 lần, mỗi chỗ chạm để lại tia điện 1 s. Hay leo lên đá cao (khó với tới bằng búa). | Băng; phi tiêu | `2chan` |
| 5 | **Cầy Hương Chớp** `cayHuong` | Nhanh nhẹn | Sét | Cầy hương đốm, đuôi khoanh, vệt chớp dọc lưng | **Nhảy chớp**: hoá vệt chớp nhảy 3 bước zic-zắc (mỗi chỗ đáp có chấm đỏ nhỏ 0,4 s), cắn ở chỗ thứ 3. | Băng; đứng yên chờ chỗ thứ 3 rồi lăn | `4chan` |
| 6 | **Cầu Sét Lăn** `cauSet` | Cảm tử | Sét | Quả cầu điện mặt ngố (hồn sét đi lạc) | Lăn tới, phình 0,8 s rồi nổ vòng điện. **Nổ trong vũng mưa → điện lan cả vũng** (vũng sáng vàng 1 s trước). | Đánh nổ sớm cạnh quái khác; ra khỏi vũng | `tron` |
| 7 | **Bù Nhìn Cắm Que** `buNhin` | Đặt bom | Lửa | Bù nhìn rơm ruộng khô, nón rách, tay cầm bó que đồng | **Cắm que đồng** xuống đất (2 que): 1,2 s sau **sét trời đánh vào que** (vòng đỏ to). Rơm dễ cháy: trúng Lửa thì bỏ chạy. | Băng (khắc Lửa) | `2chan` |
| 8 | **Đá Nam Châm** `daNamCham` | Gai | — | Khối đá đen có mắt, mạt sắt dựng như gai | **Hút đạn**: phi tiêu / đạn bay gần bị hút lệch vào nó. Bị đánh thì **bắn gai sắt** 8 hướng. → dạy: chỗ có nó thì đánh gần, đánh từ cạnh. | Cận chiến; né gai theo khe 8 hướng | mới `khoi` (khối đá có chân ngắn) |

Hệ mỗi vùng phải có ít nhất 2 hệ khác Sét (ở đây Lửa + 2 con không hệ) để người chơi chưa nâng Sét vẫn có cách khắc.

### 1.6 Hai tinh anh
| Tên · mã | Hệ | Tạo hình | Chiêu | Khung que |
|---|---|---|---|---|
| **Dê Đầu Đàn** `deChua` | Sét | Dê to, sừng xoắn như cột thu sét, râu dài | **Gọi sét**: giơ sừng 1 s → 3 sét đánh tam giác quanh em bé (bóng vàng). **Húc ba lần** nối nhau (vạch đỏ đổi hướng theo em bé). Nổi giận: gọi 2 dê con. | `4chan` |
| **Khỉ Già Trống Ngực** `khiChua` | Sét | Khỉ đột lông bạc, đeo vòng đá, ngực vẽ hoa văn | **Vỗ ngực**: sóng sấm vòng tròn lan ra (vòng sáng chạy, lăn **qua** vòng đúng lúc là né) ✦. **Ném tảng đá** to (bóng tròn), đá nằm lại làm vật cản 4 s. | `2chan` |

### 1.7 Trùm nhỏ: Gấu Ngựa Sấm `gauNgua` (cuối 5-1 → 5-4)
Gấu ngựa đen ngực có vạch trắng hình chữ V (sáng lên như tia chớp), móng to. Hệ Sét.
| Pha | Chiêu |
|---|---|
| Pha 1 (> 50%) | **Đập đất**: sóng điện hình nón trước mặt (0,8 s). **Ôm cột đồng**: ôm cột, cột phóng sét về phía em bé (vạch đỏ). **Lăn tròn**: cuộn lăn qua sân, nảy 2 lần. |
| Pha 2 nổi giận (≤ 50%) | Lông dựng tích điện: mỗi bước để lại vệt điện 1,5 s. Đập đất 2 lần liền. |
| Chống sát mép | Đứng cách mép < 40 điểm ảnh quá 1,5 s → **tát vách**, đá lở dọc mép (báo trước 0,8 s). |
| Điểm yếu | Sau khi ôm cột: cột "giật ngược" làm nó choáng 1,5 s (ngực vạch V tối đi). |
**Lần đầu thua** ở 5-1: nhả ra **"hòn sét"** (một phần sức Thần Sét bị mảnh trống làm loạn) → Cu Tí **mở hệ Sét** (Q4).

### 1.8 Trùm vùng: Thần Sét hoá điên `thanSet` (ải 5-5)
**Tạo hình**: ông thần to lớn nhưng **tròn trịa, ngộ nghĩnh**, râu tóc như mây xám xoăn, cầm **Lưỡi Tầm Sét** (rìu đá có cán gỗ), lưng đeo vòng trống sấm nhỏ.
Khi điên: mắt tím đục xoáy tròn, quanh đầu có vầng sáng tím (linh khí mảnh mặt trời mà Thuồng Luồng để lại). Hệ **Sét suốt trận** (không đổi hệ như Thuồng Luồng —
mỗi trùm một kiểu). Đây là người **cần cứu**: thua thì tỉnh lại, không chết.
Không dùng sóng âm theo nhịp trống (để dành Hắc Long): vòng trống sấm của ông chỉ "nổ" một lần mỗi chiêu, không theo nhịp nhạc.

| Pha | Máu | Chiêu (báo trước 0,6–1 s) | Chỗ né |
|---|---|---|---|
| **1** | 100–66% | **Bổ rìu**: vạch đỏ thẳng dài, cuối vạch rẽ 2 nhánh sét. | Bước ngang khỏi vạch và nhánh. |
| | | **Sét ba chạc**: 3 bóng vàng quanh em bé, đánh lần lượt. | Chạy liên tục, không đứng yên. |
| | | **Vỗ trống sấm**: một vòng sóng lan ra có **1 khe hở**. | Đi vào khe; hoặc lăn qua ✦. |
| | | **Sét dọc vực** (chống sát mép, có ngay pha 1): đứng sát mép > 1,5 s → hàng sét dọc mép. | Vào giữa sân. |
| **2** nổi giận | 66–33% | **Gọi mưa**: 3 vũng mưa lan ra trên sân; 4 s sau ông **đập rìu xuống vũng** → điện lan cả vũng (vũng sáng vàng 1 s trước). | Ra khỏi vũng; **dụ ông đứng vào vũng** thì ông tự giật (điểm yếu 2 s). |
| | | **Ném rìu xoay**: rìu bay vòng ra rồi quay về tay (đường đi vẽ sẵn). | Đứng ngoài đường cong; đánh lúc ông chưa cầm rìu. |
| **3** hoá cuồng | 33–0% | **Sét đuổi**: sét đánh dọc vệt em bé vừa chạy (5 phát). | Chạy vòng, đổi hướng. |
| | | **Bốn cột đồng sáng**: đánh 1 cột → tia sét **đánh ngược vào Thần Sét** → choáng 3 s, mắt tím tan một nửa (điểm yếu lớn). Dạy dùng môi trường lên trùm. | |
| | | **Mưa sét**: 6 bóng vàng một lượt, chừa 1 ô trống sáng xanh. | Đứng ô xanh. |

- **Thích nghi** (luật cũ): áp sát → tia điện quanh người khi bị đánh 3 đòn liền; đánh xa → hút đạn bằng rìu đồng.
- **Sao thứ ba**: hạ ông khi ông đang choáng vì cột đồng (đề xuất), vì ông kháng Sét — "dùng sét của ông để cứu ông".
- 🔗 **LOI-DANH**: ô "yếu hệ" của Thần Sét theo bảng khắc Sét; nếu chưa có thì để trống, sao thứ ba theo cột đồng như trên.
- **Thua**: vầng tím vỡ, ông ngồi bệt, gãi đầu tỉnh lại; trời đổ mưa lần đầu.

### 1.9 Truyện vùng 5
- **Người cần cứu**: **Thần Sét** (chính trùm). Không thêm người bị bắt (vùng 4 vừa có Bé Sen bị bắt — tránh lặp).
- **Mảnh trống thứ 5**: **mảnh có tượng cóc** (trên mặt trống đồng Đông Sơn có tượng cóc — tượng gọi mưa). Mảnh này kẹt trong vòng trống sấm của Thần Sét; trả lại thì mưa về.
- **Quà** (🔗 **LUC-CHIEN**): đề xuất Thần Sét tặng **trứng Gà Lôi Sét** (gà lôi là chim thật của Việt Nam, chữ "Lôi" = sấm) → linh thú đầu tiên.
  Nếu LUC-CHIEN chọn con khác thì chỉ đổi tên vật trong lời truyện.
- **Giới thiệu sớm người vùng 7**: kết vùng 5 thêm **Bé Diều** ngồi thả diều trên đê làng (như cách Bé Sen ra mắt trước vùng 4) — để tới vùng 7 bé bị cắp thì người chơi đã quen.
- **Câu móc vùng 6**: Thần Sét: *"Con rắn đen ấy ngậm mảnh mặt trời trườn qua núi, chui xuống rừng đá vôi. Nó đánh thức thứ gì trong hang tối — ta nghe tiếng gầm rung cả núi."*

**Lời chính** (mẫu, phiên truyện viết đủ + bản tiếng Anh):
- Mở vùng: *(Chú Lái Đò)* "Chú chỉ chở tới chân núi thôi. Trời không mưa ba tháng rồi, mà sét thì đánh cả ngày!"
- Thần Sét ra mắt: *"Đùng! Đoàng! Không ai được lên núi của ta!"* · thua: *"Ơ… ta đang làm gì thế này? Đầu ta ong ong như có ai gõ trống…"*
- Gấu Ngựa: *"Grừ! Mật ong đâu? Không có mật thì có sét!"*
- Câu mốc người làng (7 người, như vùng 4): Ông Từ "*Năm mảnh rồi. Mảnh có con cóc — mưa về là phải.*" · Bà Hàng Xén "*Ruộng có nước rồi, mùa sau có gạo mới!*" …

### 1.10 Ảnh cần (chưa prompt)
| Nhóm | Ảnh | Số tấm |
|---|---|---|
| A. Ảnh mẫu | 8 quái + 2 tinh anh + Gấu Ngựa + Thần Sét (3 pha: thường, nổi giận, cuồng) | 14 |
| B. Khung que mới | `khoi` (Claude làm, không gen) | (6 que) |
| C. Động tác | 11 con × 6 tấm (đứng, đi, báo đòn, đánh, trúng đòn, chết) + Gấu Ngựa pha 2 (4) + Thần Sét 15 (pha 1: 6 · pha 2: 4 · pha 3: 4 · tỉnh lại: 1) | 85 |
| D. Nền / cửa / trang trí / môi trường | mảng nền đá tím, cửa vùng, trang trí (tre cháy, ruộng nứt, bù nhìn đứng), **cột đồng (3 khung: thường, tích điện, phóng)**, **vũng mưa (2 khung)** | 8 |
| E. Hiệu ứng | sét trời (3: báo, đánh, tàn), tia nối cột (2), sóng điện nón (2), hòn sấm (1), vòng trống sấm (2), rìu xoay (2), vệt điện sàn (1), giọt Ướt trên đầu (1) | 14 |
| F. Giao diện, truyện | biểu tượng hệ Sét (🔗 LOI-DANH có thể đã làm), nút vùng 5 bản đồ, cảnh truyện **b8-nui-set** (Thuồng Luồng qua núi), **b9-mua-ve** (mưa về ruộng), Thần Sét chân dung truyện, Bé Diều (mẫu + đứng 6 + ngồi 6 như Bé Sen) | ~17 |
| **Cộng** | | **~138** |

---

## 2. Vùng 6 — Rừng đá vôi, hang tối (Chằn Tinh)

### 2.1 Tên và cảm giác
- **Tên**: Rừng đá vôi (mã `davoi`). Hệ vùng: **Độc** (rêu, nấm hang, nước ngầm đục). Quái mang đủ Độc, Lửa, Băng, vài con Ướt để Sét có đất dùng.
- **Cảm giác**: núi đá tai mèo lởm chởm, rừng dây leo; đi sâu là **hang thạch nhũ**, sông ngầm, miếu cổ trong lòng núi, **nấm phát sáng** và **đom đóm**.
- **Dân gian dùng**: *Thạch Sanh* — Chằn Tinh ở hang, làng phải nộp người mỗi năm. Không đưa Lý Thông vào (truyện phản bội, khó cho trẻ nhỏ).
- **Bảng màu**: tối `#07090c → #10161c → #1c2630`, đá vôi `#bdb6a0`, rêu `#3f5a3a`, **vàng đèn `#ffd27a`**, nấm sáng **xanh ngọc `#6ff0c8`**, mắt quái **đỏ cam `#ff6a3a`**.

### 2.2 Luật riêng
| Luật | Người chơi thấy | Tác dụng | Dạy ở |
|---|---|---|---|
| **Bóng tối + đèn soi** | Phòng tối; quanh Cu Tí có **quầng sáng** (đèn lồng đeo hông) bán kính ~1/3 phòng | Ngoài quầng: quái **chỉ thấy đôi mắt** và nghe tiếng. **Vùng đỏ, đạn, thanh máu quái luôn sáng** (không bao giờ ẩn). Nấm sáng = vùng sáng cố định. | 6-1 (phòng 1 còn sáng, phòng 2 tối dần) |
| **Đuốc vách** | Đuốc tắt trên vách / trên cột (2–4 đuốc / phòng) | Đánh đuốc bằng **đòn Lửa** (vũ khí hoặc chưởng) → đuốc cháy, sáng một vùng lớn tới hết phòng. Thắp **hết** đuốc → phòng sáng hẳn. Một số quái sợ sáng (lùi 0,5 s). | 6-2 |
| **Thạch nhũ** | Thạch nhũ treo trần — thấy **bóng tròn** dưới sàn | Đánh trúng (đạn / chưởng) → rơi sau 0,8 s: trúng quái mất máu lớn + choáng; trúng em bé ~6% máu. Thỉnh thoảng tự rơi khi trùm gầm (bóng báo). | 6-2 |

- Dùng lại **dòng chảy** vùng 4 cho sông ngầm (ải 6-3), tốc chậm hơn (30% tốc chạy) — code có sẵn, không tính là luật mới.
- **Trợ năng**: cờ/tuỳ chọn **"Hang sáng hơn"** (quầng sáng x1,5) trong cài đặt (Q7) — cho bé nhỏ tuổi hay sợ tối.
- 🔗 **LUC-CHIEN**: nếu có phụ kiện/hiệu ứng nhân vật "hào quang", có thể cho hào quang **làm to quầng sáng** chút ít (≤ +15%) — chỉ ở vùng tối, không phải chỉ số.

### 2.3 Năm ải
| Ải | Tên | Phòng | Có gì mới | Quái chính | Cuối ải |
|---|---|---|---|---|---|
| 6-1 | Cửa rừng đá tai mèo | 7 | Bóng tối (sáng dần → tối) | Thằn Lằn, Chuột Hang, Rùa Đèn, Thạch Sùng | Rết Đá |
| 6-2 | Hang thạch nhũ | 7 | Đuốc vách, thạch nhũ | + Nhện Tơ, Ma Trơi | Rết Đá |
| 6-3 | Sông ngầm | 8 (phòng chọn cửa) | Dòng chảy (cũ) trong tối | + Kỳ Đà, Măng Đá; tinh anh Nhện Mẹ | Rết Đá |
| 6-4 | Miếu cổ trong hang | 8 | Nhiều đuốc, phòng tối hẳn | đủ 8; tinh anh Ma Trơi Chúa | Rết Đá |
| 6-5 | Hang Chằn Tinh | 8 | Sân có **giếng trời** rọi sáng ở giữa | đủ 8 + 2 tinh anh | **Chằn Tinh** |

### 2.4 Bố cục phòng
- Phòng đánh: vách đá vôi gồ ghề làm vật cản, 2–4 đuốc, 2–5 thạch nhũ, 0–2 cụm nấm sáng. Cửa phòng luôn có đuốc **đã cháy sẵn** (chỗ an toàn khi vào).
- Suối hồi: **giọt nước từ thạch nhũ rơi vào hồ đá nhỏ**, quanh có nấm sáng; bóng trùm hiện trên vách khi đuốc lay.
- Sân Rết Đá: hang tròn, 4 cụm nấm sáng ở 4 góc.
- Sân Chằn Tinh: hang lớn, **giếng trời** chiếu một vòng sáng tròn giữa sân, 4 đuốc quanh sân, xương thú (vẽ nhẹ, không ghê) và miếu đổ.

### 2.5 Tám quái thường
| # | Tên · mã | Vai | Hệ | Tạo hình | Cách đánh | Khắc / né | Khung que |
|---|---|---|---|---|---|---|---|
| 1 | **Thằn Lằn Đá** `thanLan` | Lính xông | — | Thằn lằn xám vằn đá, mắt lồi | **Bò vách rồi phóng**: bám vách, mắt sáng 0,6 s rồi phóng thẳng ra (vạch đỏ). Hụt thì lật ngửa 1 s. | Né ngang | `4chan` |
| 2 | **Bầy Chuột Hang Mắt Đỏ** `chuotHang` | Bầy nhỏ | Độc | 4 con chuột nhắt lông xám, mắt đỏ to | Ngoài sáng chỉ thấy **8 chấm mắt** chạy ùa. Vào quầng sáng / gần đuốc thì **sợ, lùi 0,5 s**. | Lửa; thắp đuốc đuổi | `4chan` |
| 3 | **Rùa Mai Đèn** `ruaDen` | Khiên | Lửa | Rùa núi mai cao, **đèn dầu nhỏ trên mai** | Giáp phía trước. Đèn mai chiếu **nón sáng** phía trước: thấy em bé trong nón → **phun lửa đèn** theo nón (0,8 s). Sau lưng nó tối và an toàn. | Băng; đi vòng sau | `4chan` |
| 4 | **Nhện Giăng Tơ** `nhenTo` | Xạ thủ | Độc | Nhện bụng tròn sọc vàng, treo trên sợi tơ từ trần | Treo lơ lửng (bóng dưới sàn), **bắn tơ dính** (đường đỏ 0,7 s): trúng thì chậm 40% 2 s, **lăn để giũ**. Tơ cắt bằng đòn Lửa. | Băng; phi tiêu | `cua` có sẵn |
| 5 | **Thạch Sùng Tắc Lưỡi** `thachSung` | Nhanh nhẹn | Độc | Thạch sùng trắng ngà, đuôi dài | Biến vào tối; **tiếng "tắc tắc"** + chữ *"tắc!"* nổi lên đúng chỗ nó (dạy nghe). 1 s sau lao ra cắn (vòng đỏ 0,45 s). | Băng; nhìn chữ "tắc" | `4chan` |
| 6 | **Ma Trơi** `maTroi` | Cảm tử | Lửa | Đốm lửa xanh lơ có mắt ngây ngô — **tự phát sáng** (luôn thấy) | Lượn chậm tới gần, phình 1 s rồi nổ lửa xanh. **Nổ cạnh đuốc → đuốc tự cháy**. | Đánh nổ cạnh quái/đuốc | `tron` |
| 7 | **Kỳ Đà Đẻ Trứng Đá** `kyDa` | Đặt bom | — | Kỳ đà to vằn vàng, lưỡi chẻ | Đẻ **2 trứng đá** (vòng đỏ nhỏ quanh trứng, nứt dần 1,5 s) → nổ vụn đá 4 hướng thẳng. Trứng **tự phát sáng** khi sắp nổ. | Né theo khe chéo | `4chan` |
| 8 | **Măng Đá Sống** `mangDa` | Gai | Băng | Măng đá (cột đá mọc từ sàn) có đôi mắt khép hờ | Đứng yên giả làm măng đá thường; **đèn chiếu vào thì thấy mắt mở**. Em bé tới gần → đâm gai đá quanh chân (vòng đỏ 0,7 s). Bị đánh → vụn băng bắn ngược. | Lửa / Sét (nước nhỏ giọt → Ướt sẵn) | mới `tru` (cột có chân ngắn) |

### 2.6 Hai tinh anh
| Tên · mã | Hệ | Tạo hình | Chiêu | Khung que |
|---|---|---|---|---|
| **Nhện Mẹ Hang** `nhenChua` | Độc | Nhện to lưng có hoa văn mặt nạ, chân sọc | **Giăng lưới**: phủ lưới lên 1/3 sân (vạch báo 1 s), trong lưới chậm 40%; lưới đốt được bằng Lửa. **Thả nhện con** (2 con). Nổi giận: treo lên trần, rơi xuống đè (bóng to dần). | `cua` |
| **Ma Trơi Chúa** `maTroiChua` | Lửa | Ngọn lửa xanh to đội mũ đền rách | **Thổi đèn**: quầng sáng em bé **nhỏ đi một nửa 3 s** (biểu tượng đèn chớp trước 1 s; vùng đỏ vẫn sáng). **Tách 3 đốm** ma trơi tự nổ. Thắp đuốc gần nó → nó co lại, chậm 2 s. | `tron` |

### 2.7 Trùm nhỏ: Rết Đá Trăm Chân `retDa` (cuối 6-1 → 6-4)
Rết dài đốt đá nâu đỏ, chân sáng vàng như dãy đèn (thấy được trong tối). Hệ Độc.
| Pha | Chiêu |
|---|---|
| Pha 1 | **Chạy vòng mép tối**: bò vòng quanh ngoài quầng sáng — chỉ thấy dãy chân sáng — rồi **cắt ngang** sân (vạch đỏ dài theo thân). **Cuộn tròn**: cuộn lại 1 s (lộ bụng = điểm yếu 2 s) rồi bật ra quất đuôi vòng. **Phun độc** 3 hướng. |
| Pha 2 nổi giận | Tách thành 2 nửa ngắn (mỗi nửa nửa máu còn lại), chạy ngược chiều nhau. |
| Chống sát mép | Đứng sát vách > 1,5 s → **thạch nhũ dọc vách rơi** (bóng báo 0,8 s). |

### 2.8 Trùm vùng: Chằn Tinh `chanTinh` (ải 6-5)
**Tạo hình**: yêu tinh khổng lồ **dáng người to bè** (không làm rắn — Thuồng Luồng và Hắc Long đã là rắn), da xám như đá vôi có rêu, hai sừng cong, răng nanh to
nhưng **mắt tròn ngốc nghếch**, cầm gậy sắt, đeo chuỗi hạt bằng xương thú. Ngực có **mảnh trống đồng** cắm như huy hiệu (sáng đồng đỏ trong tối). Hệ **Độc** → yếu **Lửa**
(khớp đuốc, khớp vùng tối: lửa là thứ Chằn Tinh sợ).
| Pha | Máu | Chiêu | Chỗ né / điểm yếu |
|---|---|---|---|
| **1 · Rình trong tối** | 100–66% | **Vồ từ tối**: 2 mắt đỏ hiện ngoài quầng sáng 0,8 s → lao vào (vạch đỏ). | Bước ngang khỏi vạch. |
| | | **Ném tảng đá**: bóng tròn to, đá vỡ thành 3 mảnh lăn. | Ra khỏi bóng, tránh mảnh lăn. |
| | | **Gầm tắt đuốc**: 4 đuốc quanh sân tắt (báo bằng lửa đuốc rung 1 s). Cu Tí **thắp lại bằng Lửa** → mỗi đuốc thắp làm nó **chói mắt 2 s** (điểm yếu). | Dạy: dùng Lửa vừa là khắc hệ vừa là đèn. |
| | | **Thạch nhũ dọc vách** (chống sát mép, có ngay pha 1). | Vào giữa sân / vòng giếng trời. |
| **2 · Biến hoá** | 66–33% | **Ba bóng**: hoá 3 Chằn Tinh, 2 con giả mờ. **Chỉ con thật có bóng đổ** dưới ánh đuốc/giếng trời. Đánh con giả → nó tan khói, không mất máu ai. | Nhìn bóng đổ (thắp đuốc để thấy rõ). |
| | | **Quét gậy vòng**: vòng đỏ to quanh nó, chừa vòng trong sát chân. | Chui vào sát chân hoặc ra ngoài. ✦ |
| **3 · Hiện nguyên hình** | 33–0% | To hơn, hang rung: **thạch nhũ rơi theo hàng** (cả hàng bóng báo, chừa 1 ô). **Dậm đất** làm nấm sáng tắt — chỉ còn giếng trời và đuốc. **Vồ liên hoàn** 3 lần. | Theo ô trống; giữ đuốc cháy. |

- **Sao thứ ba**: hạ bằng Lửa khi cả 4 đuốc đang cháy.
- **Thua** (thay cho chết, hợp lứa tuổi): mảnh trống rơi khỏi ngực, linh khí rút đi → Chằn Tinh **hoá thành một khối đá vôi hình yêu tinh** (giải thích luôn vì sao rừng đá vôi
  có hòn đá hình người — truyện "giải thích tên đất" như dân gian).
- 🔗 **LOI-DANH**: trong *Thạch Sanh*, chàng được bộ **cung tên vàng**. Nếu LOI-DANH có vũ khí mới dạng cung, có thể đặt nguồn ở đây (rơi từ Chằn Tinh lần đầu). Nếu không, bỏ.

### 2.9 Truyện vùng 6
- **Người cần cứu**: **Bác Tiều** (người kiếm củi bản đá — nghề như Thạch Sanh). Năm nay đến lượt bản nộp người cho Chằn Tinh; Bác Tiều tự nguyện đi thay trẻ con trong bản.
  Về làng: ngồi cạnh lò rèn, bán củi; **mở**: đèn lồng to hơn cho các lần chơi lại vùng 6 (chỉ là tầm sáng, không phải sức mạnh) (Q8).
- **Mảnh trống thứ 6**: **mảnh vành có nhà sàn và người giã gạo** (hình quen trên trống Đông Sơn).
- **Câu móc vùng 7**: khi Cu Tí ra khỏi hang, một **bóng chim khổng lồ** che cả mặt trời, sà xuống đê làng và **cắp Bé Diều** cùng con diều. Bác Tiều:
  *"Đại Bàng Tinh! Nó làm tổ trên đỉnh mây. Thuồng Luồng sai nó đấy — nó cần thêm mảnh trống, cháu ạ."*

**Lời chính** (mẫu):
- Mở vùng: *(Thần Sét)* "Ta đánh một tia sáng lên núi đá vôi — cửa hang ở chỗ đó. Cầm cái đèn này, trong hang tối lắm."
- Chằn Tinh ra mắt: *"Hừm hừm! Mùi trẻ con! Năm nay ta được hai đứa!"* · thua: *"Ánh sáng… chói… quá…"* (hoá đá).
- Rết Đá: *"Trăm chân của ta chạy nhanh hơn trăm đứa trẻ!"*

### 2.10 Ảnh cần
| Nhóm | Ảnh | Số tấm |
|---|---|---|
| A. Ảnh mẫu | 8 quái + 2 tinh anh + Rết Đá + Chằn Tinh (3 pha) | 14 |
| B. Khung que mới | `tru`, `ret` (thân dài nhiều đốt) | (12 que) |
| C. Động tác | 11 × 6 + Rết Đá pha 2 (2 nửa: 4) + Chằn Tinh 16 (pha 1: 6 · pha 2: 4 (+ bóng giả = tô mờ bằng code) · pha 3: 5 · hoá đá: 1) | 86 |
| D. Nền / môi trường | mảng nền đá vôi + hang, cửa, trang trí (thạch nhũ, nấm sáng, miếu đổ), **đuốc (3: tắt, cháy, rung)**, **thạch nhũ treo + bóng (2)**, giếng trời | 9 |
| E. Hiệu ứng | quầng sáng (vẽ code — không gen), tơ dính (2), lưới (1), lửa ma trơi (2), vụn đá trứng (1), thạch nhũ vỡ (2), gậy quét (2), khói tan bóng giả (1), mắt trong tối (1) | 12 |
| F. Giao diện, truyện | nút vùng 6, cảnh **b10-dai-bang-cap** (bóng chim cắp Bé Diều), Bác Tiều (mẫu + đứng 6) | ~9 |
| **Cộng** | | **~130** |

Ghi chú kỹ thuật: bóng tối = **một lớp phủ đen có lỗ sáng** vẽ bằng code (không phải ảnh). Vùng đỏ, đạn, thanh máu, số sát thương vẽ **trên** lớp phủ.
Cần đo khung hình trên máy yếu (lớp phủ toàn màn hình mỗi khung).

---

## 3. Vùng 7 — Đỉnh mây (Đại Bàng Tinh)

### 3.1 Tên và cảm giác
- **Tên**: Đỉnh mây (mã `may`). Hệ vùng: **Băng** (gió lạnh trên cao). Quái nhiều con **không hệ** vì vai trò khó là "bay".
- **Cảm giác**: sau vùng tối là **vùng sáng nhất game**: trời xanh, mây trắng bồng bềnh, đá lơ lửng nối bằng **cầu treo dây mây**, rừng thông lùn trên vách, tổ chim to như cái sân.
- **Dân gian dùng**: *Thạch Sanh* — Đại Bàng Tinh cắp người lên tổ. Người bị cắp ở đây là **Bé Diều** (không dùng nhân vật công chúa).
- **Bảng màu**: trời `#7cc4ff → #b8e0ff → #eef8ff`, mây `#f4f8fc`, đá `#8a96a8`, **vàng nắng `#ffd86a`**, lông Đại Bàng **nâu đỏ `#8a3a1a` + vàng đồng**.

### 3.2 Luật riêng
| Luật | Người chơi thấy | Tác dụng | Dạy ở |
|---|---|---|---|
| **Gió từng đợt** | **Lá thông + lông chim bay ngang** báo trước 1,5 s, mũi tên gió ở mép phòng | Gió thổi 2 s, đẩy mọi thứ ≤ 35% tốc chạy; **đạn bay lệch theo gió** (cả đạn của bé lẫn quái). **Nấp sau tảng đá** thì không bị đẩy. | 7-1 |
| **Quái bay** (luật chung cho quái) | Quái bay có **bóng tròn dưới đất**: bóng nhỏ = bay cao, bóng to = sà thấp | Bay cao: **đòn cận chiến không trúng**, chỉ phi tiêu / chưởng / linh thú trúng. Sà xuống tấn công thì mọi đòn trúng; sau cú sà luôn **đậu 1 s**. | 7-1 (con đầu: Chim Cắt) |
| **Mây mỏng** | Mảng mây mờ trên sân | Đứng lên → mờ dần 1,5 s rồi tan 3 s. **Quái đứng trên khi tan → rơi xuống (hạ ngay quái thường, tinh anh mất 20% máu)**. Em bé không rơi: gió nâng về chỗ cũ, mất 5% máu. | 7-2 |

- Luật cứng: **không bao giờ quá 2 quái bay cao cùng lúc** trong một phòng (để người dùng kiếm/búa không bị bí). Phiên bot đo riêng tỉ lệ thắng của bot dùng búa ở vùng 7.
- 🔗 **LOI-DANH**: nếu có chiêu "hất tung" / "kéo xuống" / chiêu hợp lực với linh thú thì đây là vùng cần nó nhất — mỗi kiểu ra đòn nên có **ít nhất một cách** đánh quái bay cao.
- 🔗 **LUC-CHIEN**: linh thú biết bay (nếu có) đánh được quái bay cao — nên giữ sát thương linh thú đủ thấp để không "tự đánh hộ" cả vùng.

### 3.3 Năm ải
| Ải | Tên | Phòng | Có gì mới | Quái chính | Cuối ải |
|---|---|---|---|---|---|
| 7-1 | Vách núi mây | 7 | Gió, quái bay | Chim Cắt, Sẻ Gió, Cú Mèo, Én | Yêu Gió Túi Da |
| 7-2 | Cầu treo mây | 7 | Mây mỏng | + Gõ Kiến, Bồ Công Anh | Yêu Gió |
| 7-3 | Đảo đá bay | 8 (phòng chọn cửa) | Gió + mây mỏng cùng phòng | + Quạ, Mây Gai; tinh anh Diều Hâu Tướng | Yêu Gió |
| 7-4 | Rừng thông trên mây | 8 | Tổ chim nhỏ (vật cản) | đủ 8; tinh anh Quạ Chúa | Yêu Gió |
| 7-5 | Tổ Đại Bàng | 8 | Sân là tổ khổng lồ | đủ 8 + 2 tinh anh | **Đại Bàng Tinh** |

### 3.4 Bố cục phòng
- Phòng đánh: nền là **khối mây/đá phẳng**, quanh mép là trời (như tường). 2–3 tảng đá nấp gió, 0–3 mảng mây mỏng (từ 7-2). Cửa nối bằng cầu treo.
- Suối hồi: **giọt sương trên lá sen núi to**; bóng trùm lướt qua mây.
- Sân Yêu Gió: đỉnh đá tròn, 2 tảng nấp gió.
- Sân Đại Bàng: **tổ khổng lồ** đan bằng cành khô (mép tổ = tường), 3 tảng đá nấp gió, vài lông vũ to nằm rải.

### 3.5 Tám quái thường
| # | Tên · mã | Vai | Hệ | Bay? | Tạo hình | Cách đánh | Khắc / né | Khung que |
|---|---|---|---|---|---|---|---|---|
| 1 | **Chim Cắt Lao** `chimCat` | Lính xông | — | bay cao ↔ sà | Chim cắt xám xanh, mắt sắc nhưng mũm mĩm | **Lao chéo**: bay cao, vạch đỏ chéo 0,7 s, lao xuống cắm mỏ đất **1 s** → đánh lúc đó. | Né ngang; đánh khi cắm mỏ | mới `chim` |
| 2 | **Bầy Sẻ Gió** `seGio` | Bầy nhỏ | Băng | bay thấp (đánh được) | 5 con sẻ nâu béo tròn | Bay vòng; **có gió thì bay nhanh gấp đôi theo chiều gió**. Mổ lấm tấm. | Lửa | `ong` |
| 3 | **Cú Mèo Cánh Khiên** `cuMeo` | Khiên | Băng | đi bộ | Cú mèo to, cánh xoè như khiên, mắt tròn vàng | Cánh che trước (giáp). **Xoay đầu 180°** mỗi 3 s (mắt chớp 0,6 s báo trước) — lúc đó **giáp chuyển ra sau**. Phải canh nhịp. **Rú lạnh**: vòng băng nhỏ quanh nó. | Độc; canh lúc mắt chớp | `chim` |
| 4 | **Chim Gõ Kiến** `goKien` | Xạ thủ | — | đậu trên thông | Gõ kiến mào đỏ, đậu trên cây thông lùn | Bắn **hạt thông** (3 hạt, nảy 1 lần); đạn **bay theo gió**. Gõ vào cây làm rơi quả thông to (bóng báo). | Băng; đứng ngược gió | `chim` |
| 5 | **Én Lượn** `en` | Nhanh nhẹn | — | bay thấp | Chim én đen bụng trắng, đuôi chẻ | Lượn zic-zắc, **cắt qua** em bé (vạch đỏ ngắn 0,45 s), mỗi cú cắt **đáp xuống 0,6 s**. | Băng; đánh lúc đáp | `chim` |
| 6 | **Bồ Công Anh Gió** `boCongAnh` | Cảm tử | Độc | trôi thấp | Quả cầu hạt bồ công anh trắng, mặt ngái ngủ | Trôi **theo gió**, chạm thì nổ hạt làm chậm 2 s. **Dùng gió đẩy chúng về phía quái**. | Đánh nổ khi gần quái | `tron` |
| 7 | **Quạ Thả Đá** `qua` | Đặt bom | — | bay cao | Quạ đen bóng, cổ đeo túi đá | Bay cao, **thả 2 hòn đá** (bóng to dần 1 s), đá nằm lại làm vật cản 3 s. Hết đá thì sà xuống nhặt (đánh được 1,5 s). | Phi tiêu / chưởng; chờ nhặt đá | `chim` |
| 8 | **Mây Gai** `mayGai` | Gai | Băng | trôi | Đám mây nhỏ xám có gai băng, mặt cau có | Trôi chậm theo gió, bị đánh thì **bắn tua băng** 6 hướng; đứng yên thì mưa đá nhỏ dưới nó (vòng đỏ). | Lửa | `tron` |

Quái bay cao chỉ có **Chim Cắt** và **Quạ** (giữ luật ≤ 2 bay cao một lúc).

### 3.6 Hai tinh anh
| Tên · mã | Hệ | Tạo hình | Chiêu | Khung que |
|---|---|---|---|---|
| **Diều Hâu Tướng** `dieuHau` | — | Diều hâu to đội mũ trụ đồng, móng vàng | **Sà quắp**: vòng đỏ đuổi theo em bé 1,2 s rồi khoá 0,6 s; quắp trúng → nhấc em bé lên **thả ở chỗ khác** (không mất máu thêm; bấm lăn liên tục thoát sớm). **Vỗ cánh**: gió mạnh 1 s đẩy lùi. Nổi giận: gọi 2 Chim Cắt. ✦ | `chim` |
| **Quạ Chúa Ba Mắt** `quaChua` | Băng | Quạ to, mắt thứ ba trên trán, lông tím đen | **Mưa đá**: 6 bóng đá rơi quanh em bé. **Gọi bầy quạ** bay ngang sân thành một dải (vạch đỏ ngang 1 s). Bay cao hầu hết thời gian, **đậu ăn đá 2 s** sau mỗi chiêu. | `chim` |

### 3.7 Trùm nhỏ: Yêu Gió Túi Da `yeuGio` (cuối 7-1 → 7-4)
Tiểu yêu béo lùn, má phồng, ôm **túi da** to bằng người (túi gió). Bị Đại Bàng sai giữ cửa. Hệ Băng.
| Pha | Chiêu |
|---|---|
| Pha 1 | **Mở túi**: thả **1 cơn lốc** nhỏ chạy chậm trên sân 4 s (trúng thì bị cuốn 1 vòng, mất máu nhỏ). **Thổi gió đổi chiều**: đổi hướng gió cả phòng (mũi tên đổi trước 1,5 s). **Má phồng bắn**: 3 cục gió lạnh thẳng. |
| Pha 2 nổi giận | 2 cơn lốc cùng lúc; túi bị thủng → **điểm yếu**: sau mỗi lần mở túi nó xẹp lép ngồi thở 2 s. |
| Chống sát mép | Đứng mép > 1,5 s → gió giật dọc mép (dải đỏ). |

### 3.8 Trùm vùng: Đại Bàng Tinh `daiBang` (ải 7-5)
**Tạo hình**: đại bàng khổng lồ lông nâu đỏ, cánh mở rộng gần hết màn hình, mỏ vàng đồng, móng to; **mảnh trống đồng cài trên ngực như cái khiên** (bị linh khí mảnh trống làm to ra).
Hệ **Băng** → yếu **Độc**. Trên sân thấy toàn thân khi đậu; khi bay chỉ thấy **bóng lớn** + thân thu nhỏ ở trên cao.
| Pha | Máu | Chiêu | Chỗ né / điểm yếu |
|---|---|---|---|
| **1 · Trên tổ** | 100–66% | **Quạt cánh**: gió cả sân 2 s (lá bay báo trước 1,5 s). | Nấp sau tảng đá. |
| | | **Mổ ba lần**: 3 vòng đỏ nối nhau theo em bé. | Lăn ngang sau mỗi cú. ✦ |
| | | **Ném lông sắt**: quạt 5 lông như phi tiêu (lông bay theo gió). | Đứng ngoài quạt; ngược gió. |
| | | **Quét cánh dọc mép tổ** (chống sát mép, có ngay pha 1). | Vào giữa tổ. |
| **2 · Bay lên** | 66–33% | Bay cao, chỉ còn bóng. **Sà quắp** (vòng đỏ đuổi 1,5 s, khoá 0,8 s). **Sau mỗi cú sà đậu xuống thở 2 s** = điểm yếu (mảnh trống trên ngực sáng). | Chạy vòng; đánh lúc đậu. Phi tiêu/chưởng đánh được cả lúc bay. |
| | | **Thả đá**: 4 tảng đá rơi thành vật cản mới (che gió được!). | Ra khỏi bóng; dùng đá vừa rơi nấp gió. |
| **3 · Cuồng phong** | 33–0% | **Lốc quanh tổ**: vòng lốc ở mép thu hẹp sân dần (như Mộc Tinh pha 3). **Sà liên hoàn** 3 cú. **Gió xoáy** đổi chiều mỗi 6 s. | Đứng giữa; đánh trong 3 lần đậu ngắn (1 s). |

- **Sao thứ ba**: hạ bằng Độc trong lúc nó đậu thở.
- **Thua**: mảnh trống rơi khỏi ngực → linh khí rút → **nó nhỏ lại thành đại bàng thường**, kêu một tiếng rồi bay đi (không chết).
- 🔗 **LUC-CHIEN**: trong tổ có **một quả trứng đại bàng** bị bỏ lại — chỗ hợp lý cho **linh thú thứ hai** nếu LUC-CHIEN muốn (không bắt buộc).

### 3.9 Truyện vùng 7
- **Người cần cứu**: **Bé Diều** (ra mắt ở đê làng từ cuối vùng 5; bị cắp cuối vùng 6). Bé được giấu trong tổ, dùng con diều để kêu cứu. Về làng: thả diều trên đê, không mở chức năng (Q9).
- **Mảnh trống thứ 7**: **mảnh vành có thuyền và người đội mũ lông chim** (Đại Bàng nhặt về lót tổ vì thấy hình lông chim).
- **Câu móc vùng 8**: từ đỉnh mây nhìn xuống, Cu Tí thấy **giữa sông làng có một xoáy nước đen khổng lồ**, dưới đáy ánh đồng đỏ rực. Cây đa trong làng **rụng lá ào ào**.
  Bé Diều: *"Lúc bị cắp tớ nghe con chim to nói: 'Đủ mảnh rồi, chủ nhân sẽ hoá rồng dưới đền cổ!'"* · Cụ Đồ: *"Đền trống đồng… sách cổ nói nằm ngay dưới đáy sông làng ta."*

**Lời chính** (mẫu):
- Đại Bàng ra mắt: *"Cánh ta che cả mặt trời! Nhóc con leo lên đây làm gì?"* · thua: *"Kéc… nhẹ quá… ta bay… về núi thôi…"*
- Yêu Gió: *"Phù phù! Túi ta đầy gió, thổi bay cả làng ngươi!"*
- Bé Diều (trong tổ): *"Cu Tí! Diều của tớ mắc trên cành kia, cậu thấy không?"*

### 3.10 Ảnh cần
| Nhóm | Ảnh | Số tấm |
|---|---|---|
| A. Ảnh mẫu | 8 quái + 2 tinh anh + Yêu Gió + Đại Bàng (3 pha) | 14 |
| B. Khung que mới | `chim` (đứng, bay, sà, đậu) | (6 que) |
| C. Động tác | 11 × 6 (quái bay: tấm "đi" = vỗ cánh) + Yêu Gió pha 2 (4) + Đại Bàng 16 (pha 1: 6 · pha 2 bay/sà/đậu: 5 · pha 3: 4 · thu nhỏ bay đi: 1) | 86 |
| D. Nền / môi trường | mảng nền mây/đá, cửa cầu treo, trang trí (thông lùn, tổ nhỏ), **tảng đá nấp gió**, **mây mỏng (3: đặc, mờ, tan)**, tổ khổng lồ (sân trùm) | 8 |
| E. Hiệu ứng | gió + lá bay (2), lốc (3), lông sắt (1), hạt thông (1), quả thông rơi (1), mưa đá (1), tua băng (1), bóng bay (vẽ code — không gen) | 10 |
| F. Giao diện, truyện | nút vùng 7, cảnh **b11-xoay-nuoc-den** (từ đỉnh mây nhìn xoáy nước), Bé Diều trong tổ (truyện) | ~4 |
| **Cộng** | | **~122** |

---

## 4. Vùng 8 — Đền trống đồng dưới đáy sông (Hắc Long)

Chỉ làm **khi chủ game muốn kết** (CHUNG.md). Thiết kế để vừa là **trận cuối** vừa là **bài ôn tập**: mỗi ải mang lại một luật vùng cũ, trùm cuối dùng lại chiêu các trùm trước.

### 4.1 Tên và cảm giác
- **Tên**: Đền trống đồng (mã `den`). Hệ vùng: **không cố định** (Hắc Long đổi hệ theo mảnh trống).
- **Đường vào**: Cu Tí đi theo **rễ cây đa** cắm xuống sông (đúng cốt truyện "rễ đa cắm xuống sông") — rễ đa phát sáng xanh, bọc một **bong bóng khí** quanh Cu Tí.
- **Cảm giác**: đền đá cổ phủ rêu dưới nước, cột chạm hoa văn trống đồng, ánh nước gợn trên sàn, cá nhỏ bơi qua; càng sâu càng nhiều **mực đen** của Hắc Long.
- **Bảng màu**: nước `#04161a → #0a2a2e → #12403f`, đá đền `#5a6a5e`, **đồng đỏ `#c8743a`**, **vàng đồng `#f0c060`**, rễ đa **xanh ngọc `#7ff0b0`**, mực **đen tím `#0a0a14`**.

### 4.2 Luật riêng
| Luật | Người chơi thấy | Tác dụng | Dạy ở |
|---|---|---|---|
| **Nhịp trống** | Nhạc nền có **tiếng trống đều** (nhịp ~1,2 s); viền màn hình **gợn sáng nhẹ mỗi nhịp** (cho người tắt tiếng) | **Bẫy đồng theo nhịp**: mũi giáo đồng thò ra khỏi sàn **mỗi 2 nhịp** (ô hoa văn sáng đỏ trước 1 nhịp). Đoán được hoàn toàn. | 8-1 |
| **Rễ đa giúp sức** | Rễ đa xanh sáng cắt qua phòng | Đánh vào rễ → rễ **quất quái** quanh nó (đồng minh). Đứng cạnh rễ **hồi chậm** 1% máu / giây (tối đa 10% mỗi phòng). Mực đen làm rễ héo dần → đánh quái mực để cứu rễ. | 8-1 |
| **Ôn lại luật cũ** | Mỗi ải một luật | 8-1 dòng chảy (vùng 4) · 8-2 sét báo trước + vũng nước (5) · 8-3 bóng tối + đuốc (6) · 8-4 gió + mây mỏng (7) · 8-5 tất cả trong 3 pha trùm. | |

🔗 **LOI-DANH**: nếu có cơ chế **"đánh đúng nhịp"** (combo theo nhịp), vùng 8 dùng nhịp trống này làm nhịp chuẩn — đừng đặt nhịp khác.

### 4.3 Năm ải
| Ải | Tên | Phòng | Luật | Quái chính | Cuối ải |
|---|---|---|---|---|---|
| 8-1 | Đường rễ đa | 7 | Dòng chảy + nhịp trống + rễ | Lính Đồng, Nòng Nọc Mực, Thạp Đồng, Ếch Phình (đồng) | Trống Méo |
| 8-2 | Sân đền ngập | 7 | Sét + vũng nước | + Khỉ Đá (đồng), Sen Đồng Gai | Trống Méo |
| 8-3 | Hành lang tối | 8 | Bóng tối + đuốc đồng | + Thạch Sùng (đồng), Quạ (đồng); tinh anh Võ Sĩ Đồng | Trống Méo |
| 8-4 | Gác chuông gió | 8 | Gió (luồng nước ngầm thay gió) + mây mỏng (bọt khí) | đủ 8; tinh anh Thuồng Luồng Con | Trống Méo |
| 8-5 | Điện trống | 8 | — | đủ 8 + 2 tinh anh | **Hắc Long** |

### 4.4 Bố cục phòng
- Phòng đánh: cột đền, tượng đá đổ, ô sàn hoa văn (bẫy nhịp), 1–2 rễ đa. Mỗi ải thêm vật của luật ôn (cầu tre / cột đồng / đuốc đồng / tảng nấp).
- Suối hồi: **chậu đồng đầy nước trong** dưới một rễ đa; bóng Hắc Long phản chiếu.
- Sân Trống Méo: sân tròn có 4 ô bẫy nhịp.
- Sân Hắc Long: **điện trống** hình tròn (như mặt trống), mép là vành trống, **4 tượng cóc đồng** ở 4 góc, sàn khắc ngôi sao giữa trống.

### 4.5 Quái: 4 mới + 4 "bản đồng" của quái cũ
Để giữ dung lượng (mục 7) và cho cảm giác "cả hành trình quay lại": 4 vai dùng lại quái vùng 4–7, **phủ ánh đồng + vệt mực bằng code** (đổi màu, viền đồng, mắt xanh lam),
giữ chiêu cũ và **thêm một nét theo nhịp** (ra đòn đúng nhịp trống).
| # | Tên · mã | Vai | Hệ | Mới / cũ | Tạo hình | Cách đánh | Khung que |
|---|---|---|---|---|---|---|---|
| 1 | **Lính Đồng Mũ Lông** `linhDong` | Lính xông | — | **mới** | Tượng lính đồng nhỏ, mũ lông chim (như hình trên trống), cầm giáo | **Bước theo nhịp**: đi – dừng theo trống; **đâm giáo đúng nhịp thứ 2** (vạch đỏ 1 nhịp trước). | `2chan` |
| 2 | **Bầy Nòng Nọc Mực** `nongNoc` | Bầy nhỏ | Độc | **mới** | 6 con nòng nọc đen bóng, mắt to ngố | Bơi ùa, **để lại vệt mực** (chậm 20%, héo rễ đa). | `ca3` |
| 3 | **Thạp Đồng Ba Chân** `thapDong` | Khiên | — | **mới** | Thạp đồng (chum đồng có nắp) mọc 3 chân, hoa văn chim | Nắp đóng = giáp toàn thân; **mở nắp phun mực** (nón 0,8 s) — chỉ đánh được lúc mở nắp hoặc từ sau. | mới `thap` (vật 3 chân) |
| 4 | Khỉ Đá Ném Sấm **(đồng)** `khiDa` | Xạ thủ | Sét | cũ vùng 5 | ánh đồng | Ném theo nhịp (mỗi 2 nhịp). | — |
| 5 | Thạch Sùng Tắc Lưỡi **(đồng)** `thachSung` | Nhanh nhẹn | Độc | cũ vùng 6 | ánh đồng | Tiếng "tắc" **đúng nhịp trống** rồi lao. | — |
| 6 | Ếch Phình Hơi **(đồng)** `echPhinh` | Cảm tử | Băng | cũ vùng 4 | ánh đồng | Phình 2 nhịp, nổ nhịp 3. | — |
| 7 | Quạ Thả Đá **(đồng)** `qua` | Đặt bom | — | cũ vùng 7 | ánh đồng | Thả **mảnh đồng** thay đá, rơi đúng nhịp. | — |
| 8 | **Sen Đồng Gai** `senDong` | Gai | Lửa | **mới** | Bông sen đồng, cánh có gai | **Xoè gai theo nhịp** (mỗi 3 nhịp xoè, bắn gai 8 hướng); khép lại thì đánh được. (Gợi nhớ Bé Sen.) | `hoa` có sẵn |

### 4.6 Hai tinh anh
| Tên · mã | Hệ | Tạo hình | Chiêu | Khung que |
|---|---|---|---|---|
| **Võ Sĩ Đồng Múa Khiên** `voSiDong` | — | Tượng võ sĩ đồng to, khiên tròn hoa văn trống, giáo dài | **Múa theo nhịp**: 3 nhịp đâm – xoay – quét (luôn cùng thứ tự — học được). Khiên đỡ đòn phía trước; sau nhịp "quét" hở lưng 1 nhịp. ✦ | `2chan` |
| **Thuồng Luồng Con** `luongCon` | Độc | Rắn nước nhỏ (bằng người) giống Thuồng Luồng thu nhỏ, mắt xanh lam | **Lặn – trồi đớp** (như Rắn Nước nhưng 2 lần), **phun mực** vệt dài. Nổi giận: gọi bầy nòng nọc. | `ran` (vùng 4 làm) |

### 4.7 Trùm nhỏ: Trống Méo `trongMeo` (cuối 8-1 → 8-4)
Thuồng Luồng thử ghép các mảnh trống **sai chỗ** thành một cái trống méo mó **biết đi** (mặt méo, hoa văn lệch). Hệ đổi theo mảnh đang sáng.
Vai trò thiết kế: **bài tập nhịp** trước Hắc Long pha 3.
| Pha | Chiêu |
|---|---|
| Pha 1 | **Đánh trống lệch**: sóng âm vòng lan ra theo **nhịp có lúc nhanh lúc chậm** (vòng mờ báo trước nửa nhịp). **Lăn nghiêng**: lăn như bánh xe méo, đường đi vẽ trước. |
| Pha 2 nổi giận | Rơi 1 mảnh ra sân (vật cản đổi hệ: mảnh lửa / băng / độc làm vũng hệ). Sóng âm 2 vòng liền. |
| Chống sát mép | Đứng mép > 1,5 s → mảnh vỡ bật dọc mép. |

### 4.8 Trùm cuối: Hắc Long `hacLong` (ải 8-5)
**Tạo hình** (theo CHUNG.md): rồng Việt **thân dài không cánh**, thân nước đen như mực thấy xương rắn bên trong; **mảnh trống đồng cắm thay vảy** (chim Lạc, mặt trời, sáng đồng đỏ);
**mảnh mặt trời ốp trán như mắt thứ ba**. Pha 1 là Thuồng Luồng (rắn nước), pha 2 hoá rồng, pha 3 thần trống. Đây là trùm **khó nhất game** nhưng vẫn theo luật cũ: mọi đòn có báo trước.
| Pha | Máu | Chiêu | Chỗ né / điểm yếu |
|---|---|---|---|
| **1 · Thuồng Luồng** | 100–70% | Bộ chiêu Thuồng Luồng vùng 4 **bản mạnh** (quật đuôi, phun nước đen, vòng thân, vỗ sóng bờ) + **mực đen** loang theo vệt phun (chậm, héo rễ đa). | Như vùng 4. Rễ đa ở 2 góc sân: đánh rễ → rễ quất Hắc Long (điểm yếu 1,5 s). |
| **2 · Hoá rồng** | 70–35% | Các mảnh trống bay quanh thân. **Mỗi mảnh sáng một màu = mượn chiêu một trùm cũ**: **Mộc Tinh** (rễ gai mọc theo hàng) · **Ngư Tinh** (nước dâng một nửa sân) · **Hồ Tinh** (cầu lửa) · **Thần Sét** (sét ba chạc) · **Chằn Tinh** (sân tối 4 s) · **Đại Bàng** (gió cả sân). Mỗi lúc chỉ **1 mảnh** sáng. | **Đánh vỡ mảnh đang sáng** (điểm yếu bay quanh thân, to, chậm) → chiêu đó tắt hẳn, mảnh rơi xuống sân = **"lấy lại" mảnh trống** (người chơi thấy rõ mình đang thu hồi trống). Hệ Hắc Long = hệ mảnh đang sáng (biểu tượng cạnh thanh máu). |
| **3 · Thần trống** | 35–0% | **Vành trống khổng lồ** sau đầu như mặt trời đồng. **Đánh trống**: sóng âm vòng lan ra **đúng nhịp nhạc**, mỗi vòng có khe hở đổi chỗ; **3 nhịp nhanh** báo bằng trống dồn. **Mưa mảnh đồng** (bóng tròn). | Né theo nhịp: đi vào khe / lăn qua vòng đúng nhịp ✦. **4 tượng cóc đồng** ở góc: đánh cóc **đúng nhịp** → tiếng trống **của làng** vang đáp → Hắc Long choáng 3 s, mảnh mặt trời trên trán lộ ra (điểm yếu lớn). |

- **Chống sát mép**: vỗ sóng bờ (pha 1), vành trống quét mép (pha 3).
- **Thích nghi**: luật cũ; thêm: dùng một hệ > 60% trận thì mảnh mang hệ đó sáng lâu hơn (nhắc đổi vũ khí).
- **Sao thứ ba**: hạ Hắc Long khi đã đánh vỡ đủ 6 mảnh ở pha 2 (không bỏ sót chiêu nào).
- **Độ dài trận**: mục tiêu 4–6 phút ở Sức mạnh khuyên dùng (trùm vùng cũ ~2–3 phút). Có **điểm lưu giữa pha** (Q12) để trẻ con thua pha 3 không phải đánh lại từ đầu.
- **Kết**: mảnh mặt trời rơi khỏi trán → vành trống rơi xuống, các mảnh bay về **ghép thành trống đồng lành lặn** (cảnh kết). Mực tan, còn lại một **con thuồng luồng bé tí**
  ngơ ngác, bơi đi ra biển (không chết — Q11). Cây đa **nở hoa**.

### 4.9 Truyện vùng 8
- **Người cần cứu**: **Hồn Cây Đa** — một bà cụ tóc trắng như rễ đa, bị trói bằng rễ héo dưới điện trống (Hắc Long hút linh khí cây đa qua rễ). Cứu xong cây đa nở hoa (CHUNG.md).
- **Mảnh trống cuối**: **mảnh mặt trời** (mảnh giữa, lớn nhất) — cùng các mảnh trên thân Hắc Long → **trống lành**.
- **Cảnh kết**: trống đồng đặt lại trên đình; cả làng đánh trống; mọi người đã cứu (Cu Tèo, Cái Bống, Cu Lì, Bé Sen, Thần Sét, Bác Tiều, Bé Diều) đứng quanh.
- **Câu móc (giữ truyện mở, CHUNG.md)**: tùy chủ game — đề xuất *"Tiếng trống vang xa tới tận biển. Ngoài khơi, có tiếng gì đó… đáp lại."* (không nói là gì; không dùng Sơn Tinh – Thủy Tinh).
- Sau kết: **chơi tiếp được** (độ khó 2, ải ngày, sổ yêu quái…) — không khoá game.

### 4.10 Ảnh cần
| Nhóm | Ảnh | Số tấm |
|---|---|---|
| A. Ảnh mẫu | 4 quái mới + 2 tinh anh + Trống Méo + Hắc Long (3 pha) + Hồn Cây Đa | 11 |
| B. Khung que mới | `thap` | (6 que) |
| C. Động tác | 4 × 6 + 2 tinh anh × 6 + Trống Méo 6 + pha 2 (4) + Hắc Long ~20 (pha 1 **dùng lại Thuồng Luồng + phủ mực bằng code**: 2 tấm mới · pha 2 hoá rồng: 8 · pha 3 thần trống: 8 · tan mực / thuồng luồng bé: 2). 4 quái "đồng" = 0 (code). | 66 |
| D. Nền / môi trường | mảng nền đền ngập, cửa đền, trang trí (cột, tượng đổ), **rễ đa (3: khoẻ, héo, quất)**, **ô bẫy nhịp + giáo đồng (2)**, **tượng cóc đồng (2: thường, vang)**, điện trống (sân trùm) | 11 |
| E. Hiệu ứng | mực đen (2), sóng âm trống (3), mảnh trống bay sáng 6 màu (1 tấm + tô màu code), rễ quất (1), mưa mảnh đồng (1), trống ghép lành (cảnh, 1) | 9 |
| F. Giao diện, truyện | nút vùng 8, cảnh **b12-re-da** (xuống theo rễ đa), **b13-trong-lanh**, **b14-cay-da-no-hoa**, **b15-ca-lang** (kết) | ~5 |
| **Cộng** | | **~102** |

---

## 5. Bảng tổng quái mới (soát trùng nhanh)

| Vai | Vùng 5 | Vùng 6 | Vùng 7 | Vùng 8 |
|---|---|---|---|---|
| Lính xông | Dê Núi `deNui` | Thằn Lằn Đá `thanLan` | Chim Cắt `chimCat` | Lính Đồng `linhDong` |
| Bầy nhỏ | Chuồn Chuồn Điện `chuonChuon` | Chuột Hang `chuotHang` | Sẻ Gió `seGio` | Nòng Nọc Mực `nongNoc` |
| Khiên | Tê Tê `teTe` | Rùa Mai Đèn `ruaDen` | Cú Mèo `cuMeo` | Thạp Đồng `thapDong` |
| Xạ thủ | Khỉ Đá `khiDa` | Nhện Tơ `nhenTo` | Gõ Kiến `goKien` | Khỉ Đá (đồng) |
| Nhanh nhẹn | Cầy Hương `cayHuong` | Thạch Sùng `thachSung` | Én `en` | Thạch Sùng (đồng) |
| Cảm tử | Cầu Sét `cauSet` | Ma Trơi `maTroi` | Bồ Công Anh `boCongAnh` | Ếch Phình (đồng) |
| Đặt bom | Bù Nhìn `buNhin` | Kỳ Đà `kyDa` | Quạ `qua` | Quạ (đồng) |
| Gai | Đá Nam Châm `daNamCham` | Măng Đá `mangDa` | Mây Gai `mayGai` | Sen Đồng `senDong` |
| Tinh anh | Dê Đầu Đàn `deChua` · Khỉ Già `khiChua` | Nhện Mẹ `nhenChua` · Ma Trơi Chúa `maTroiChua` | Diều Hâu `dieuHau` · Quạ Chúa `quaChua` | Võ Sĩ Đồng `voSiDong` · Thuồng Luồng Con `luongCon` |
| Trùm nhỏ | Gấu Ngựa Sấm `gauNgua` | Rết Đá `retDa` | Yêu Gió `yeuGio` | Trống Méo `trongMeo` |
| Trùm vùng | Thần Sét `thanSet` | Chằn Tinh `chanTinh` | Đại Bàng Tinh `daiBang` | Hắc Long `hacLong` |

`G.MOB_ART` mở rộng mỗi vai thêm phần tử thứ 5–8 (vùng 8 trỏ lại mã cũ + cờ `dong: 1` để vẽ ánh đồng).
Khung que mới cần: `khoi`, `tru`, `ret`, `chim`, `thap` (5 bộ, Claude làm, không gen) + `ran`, `ran3`, `vo2` của vùng 4.

---

## 6. Cân bằng (số xuất phát — bot chốt)

### 6.1 Sức mạnh khuyên dùng xuất phát
Vùng 4 (kế hoạch): `[540, 565, 595, 630, 690]`. Đề xuất mỗi vùng sau **+~30%** ở ải đầu, trong vùng tăng như vùng 4:
| Vùng | 1 | 2 | 3 | 4 | 5 (trùm) |
|---|---|---|---|---|---|
| 5 | 730 | 765 | 805 | 850 | 930 |
| 6 | 950 | 995 | 1.045 | 1.105 | 1.210 |
| 7 | 1.235 | 1.295 | 1.360 | 1.435 | 1.570 |
| 8 | 1.600 | 1.680 | 1.765 | 1.865 | 2.050 |
Máu / sát thương quái: nối đường tăng của `G.STAGE_K` (mỗi ải ~+13–16% sát thương như vùng 2–3); trùm nhỏ mỗi đòn gốc ~45% máu bé vừa đủ khuyên dùng, trùm vùng ~50% (như luật hiện tại).
`G.DIFF2` (độ khó 2) thêm 4 phần tử, tiếp đà giảm dần: `[1,08 / 1,12]`, `[1,06 / 1,1]`, `[1,05 / 1,08]`, `[1,05 / 1,08]`.

### 6.2 Cấp và nguồn mạnh lên — 🔗 LUC-CHIEN
- Hiện `G.MAX_LEVEL = 40`, vùng 4 dùng hết 30 → 40. **Vùng 5–8 cần một đường mạnh lên ~+30% Sức mạnh mỗi vùng** (để với tới bảng trên).
- Vùng cần: mỗi vùng ~25–35% Sức mạnh mới, đến từ (a) vũ khí Vàng vùng sau (`G.GOLD_MULT` thêm 1,8 · 1,9 · 2,0 · 2,1 — đề xuất), (b) cấp/cảnh giới, (c) phụ kiện, linh thú.
  **Chia phần (b)(c) là việc của LUC-CHIEN**; tệp này chỉ yêu cầu tổng và **có trần** ở mỗi vùng (người cày nhiều nhất cuối vùng N không vượt khuyên dùng ải 5 của vùng N quá ~25%,
  để vùng N+1 không dễ đi đột ngột).

### 6.3 Rơi đồ / kinh tế
- Không thêm nguyên liệu mới cho riêng vùng (như Q2 vùng 4 chọn A) trừ khi LUC-CHIEN cần (mảnh linh thú / mảnh phụ kiện) — khi đó **bớt vàng/quặng** ở cùng ải bằng giá trị tương đương (LUAT-CAN-BANG mục 3).
- Vàng / quặng / đá / linh khí mỗi lượt: nối đường tăng của 4 vùng trước (bảng `ROI_MOI`, `EP_DO.roi` thêm phần tử).
- Luật vùng **không rơi đồ thêm** (thắp hết đuốc, phá cột… không ra rương) — tránh cày phòng.

### 6.4 Cách kiểm bằng bot (mỗi vùng một phiên cân bằng, như phiên 4 vùng 4)
1. `python3 game/tests/cay.py --node --kd=4` mở rộng 20 → 25 / 30 / 35 / 40 ải: tìm Sức mạnh bot thắng ~75% từng ải → chốt khuyên dùng; dãy phải **tăng dần**.
2. Mỗi ải mới: bot kiểu `khuyen` **≤ ~7 lượt cày**, không ải nào > 9 lượt (mã thoát 1 của `cay.py`); tổng thời gian mỗi vùng ≈ vùng trước ± 25%.
3. `node tools/can-bang/tinh.js` mô hình 40 ải: Sức mạnh tối đa cuối vùng N **với tới** khuyên dùng N-5 (không thì thiếu đường mạnh lên → báo LUC-CHIEN), và **không vượt quá ~25%**.
4. Luật vùng: đo 2 kiểu bot — **có** dùng môi trường (đánh cột, thắp đuốc, dụ vào vũng) và **không** dùng. Chênh tỉ lệ thắng ≤ 10 điểm (môi trường là "thưởng cho người khéo", không bắt buộc).
   Phần sát thương từ môi trường ≤ 15%.
5. An toàn: bot đứng yên ngoài vùng đỏ 2 s trong mọi phòng không bao giờ mất > 8% máu vì luật vùng; vùng 6 thêm kiểm "mọi vùng đỏ vẽ trên lớp tối".
6. Vùng 7: bot chỉ dùng **Búa** (`--vk=bua`) vẫn qua được (cày ≤ 9 lượt) — đảm bảo quái bay không khoá người đánh gần.
7. Báo cáo bảng trước/sau, cờ quay lui `?cbv5cu=1` … `?cbv8cu=1` (số xuất phát).

---

## 7. Dung lượng — rủi ro lớn nhất

- Hiện người chơi tải ~15,3–15,6 MB / trần 20 MB; vùng 4 dự kiến lên **~18,5 MB**. Mỗi vùng 5–7 cỡ vùng 4 (**~+3,2 MB**), vùng 8 ~+2,5 MB (dùng lại nhiều) → cộng thẳng **~31 MB**. **Vượt trần.**
- Ảnh vùng đã **tải theo vùng** (chỉ tải khi chọn vùng). Đề xuất (Q1): đổi cách tính trần thành **"lần mở đầu + 1 vùng ≤ 20 MB"** (mỗi vùng ≤ ~3,5 MB), tổng gói trên mạng không giới hạn chặt.
- Cách giảm đã có trong kế hoạch: vùng 8 dùng lại 4 quái + Thuồng Luồng pha 1; quầng sáng, bóng bay, lốc nhỏ, tô màu mảnh trống **vẽ bằng code**; trùm 3 pha nét 1,5 (khong-pixel mục 3.3).
- Bản một tệp (`artifact.html`) đã sát 30 MB từ vùng 4 → vùng 5–8 **chỉ có ở bản web** (giống đề xuất Q9 vùng 4).

---

## 8. Thứ tự làm (đợt, mỗi đợt ~3 phiên song song)

Luật BUOC-2-3-4: **làm xong – chơi thử – chốt một vùng rồi mới sang vùng sau.** Mỗi vùng ~4 đợt, cùng khuôn vùng 4 (phiên 0 → 5).

| Đợt | Phiên A | Phiên B | Phiên C |
|---|---|---|---|
| **5.0** (trước vùng 5) | 🔗 LOI-DANH: hệ Sét lõi (`G.EL`, khắc, Ướt) | 🔗 LUC-CHIEN: linh thú đầu tiên (khung, hình tạm) | Khung que `khoi`; chuyển "cứng N vùng" sang đọc `G.REGIONS` (nếu vùng 4 chưa làm) |
| **5.1** | Khung vùng 5 chạy bằng hình tạm (bảng vùng, bản đồ, lưu 25 ải, `?vung5=0`) | Luật vùng: sét báo trước, cột đồng, vũng mưa (`?setvung=0`) | Truyện + bản đồ + Bé Diều ra mắt ở đê + nhạc vùng |
| **5.2** | 8 quái thường + kỹ năng | 2 tinh anh + Gấu Ngựa (mở hệ Sét) | Thần Sét pha 1 + sân |
| **5.3** | Thần Sét pha 2–3 + tỉnh lại + quà linh thú | Cân bằng bằng bot (mục 6.4) | Đóng gói, dung lượng, ảnh soát → **chủ game chơi thử** |
| **6.1** | Khung vùng 6 | **Lớp tối + đèn soi** (đo khung hình máy yếu) + đuốc + thạch nhũ (`?toi=0`) | Truyện, Bác Tiều, cảnh Đại Bàng cắp Bé Diều |
| **6.2** | 8 quái | 2 tinh anh + Rết Đá | Chằn Tinh pha 1 |
| **6.3** | Chằn Tinh pha 2–3 (bóng giả, hoá đá) | Cân bằng bot | Đóng gói → chơi thử |
| **7.1** | Khung vùng 7 | Gió + **luật quái bay** (bóng, trúng/không trúng) + mây mỏng (`?gio=0`) | Truyện, Bé Diều trong tổ |
| **7.2** | 8 quái (khung que `chim`) | 2 tinh anh + Yêu Gió | Đại Bàng pha 1 |
| **7.3** | Đại Bàng pha 2–3 | Cân bằng bot (+ kiểm `--vk=bua`) | Đóng gói → chơi thử |
| **8.1** (khi chủ game muốn kết) | Khung vùng 8 + quái "ánh đồng" (code) | Nhịp trống + bẫy nhịp + rễ đa (`?nhip=0`) + ghép luật ôn ở 4 ải | Truyện, cảnh rễ đa, Hồn Cây Đa |
| **8.2** | 4 quái mới + 2 tinh anh | Trống Méo | Hắc Long pha 1 (dùng lại Thuồng Luồng) |
| **8.3** | Hắc Long pha 2 (mảnh trống mượn chiêu) | Hắc Long pha 3 (nhịp, tượng cóc) + điểm lưu giữa pha | Cảnh kết (trống lành, cây đa nở hoa) |
| **8.4** | Cân bằng bot toàn 40 ải | Soát dung lượng toàn game | Chơi thử trọn game |

Ảnh: mỗi vùng chủ game gen nhóm A (mẫu) song song đợt x.0/x.1, nhóm C song song x.1–x.2 (như vùng 4). Prompt viết **sau khi** chốt phong cách ảnh.

---

## 9. Câu hỏi cần chủ game quyết
(Chữ **in đậm** là đề xuất.)

1. **Trần dung lượng** khi có 8 vùng: **A. tính "lần mở đầu + 1 vùng ≤ 20 MB"** (mỗi vùng ≤ ~3,5 MB) · B. giữ trần tổng 20 MB (phải cắt ảnh mạnh, mỗi vùng chỉ ~1 MB) · C. nâng trần tổng lên 32 MB.
2. **Thần Sét**: **A. không giết, thua thì tỉnh lại và giúp Cu Tí** · B. đánh như trùm thường.
3. **Nguồn truyện vùng 5**: **A. mượn không khí "Cóc kiện Trời" (hạn hán, tượng cóc gọi mưa)** · B. không dùng.
4. **Lúc mở hệ Sét**: **A. sau trùm nhỏ ải 5-1 (Gấu Ngựa nhả "hòn sét") — để dùng Sét ngay trong vùng 5** · B. sau khi hạ Thần Sét (vùng 5 không có Sét) · C. ngay khi vào vùng 5. (🔗 LOI-DANH)
5. **Linh thú đầu tiên là quà của Thần Sét** (đề xuất Gà Lôi Sét): **A. đồng ý, LUC-CHIEN chọn con** · B. linh thú đến nguồn khác.
6. **Chằn Tinh** dáng gì: **A. yêu tinh khổng lồ dáng người (không làm rắn)** · B. trăn tinh như vài bản kể.
7. **Bóng tối vùng 6** cho trẻ nhỏ: **A. có tuỳ chọn "Hang sáng hơn" trong cài đặt** · B. không, ai cũng như nhau.
8. **Người cứu vùng 6**: **A. Bác Tiều (người mới, như Thạch Sanh kiếm củi)** · B. Anh Mõ (người làng quen, nhưng mất NPC ở làng trong lúc bị bắt).
9. **Người bị cắp vùng 7**: **A. Bé Diều (người mới, ra mắt ở đê làng từ cuối vùng 5)** · B. một trong ba bạn cũ (Cu Tèo / Cái Bống / Cu Lì).
10. **Vùng 8 dùng lại 4 quái cũ bản "ánh đồng"** để đỡ ảnh: **A. đồng ý** · B. 8 quái mới hết (+~1 MB, +24 tấm).
11. **Kết của Thuồng Luồng/Hắc Long**: **A. còn lại con thuồng luồng bé tí bơi ra biển (không chết)** · B. tan biến hẳn.
12. **Hắc Long có điểm lưu giữa pha** (thua pha 3 thì đánh lại từ pha 3): **A. có, ở độ khó 1; độ khó 2 thì không** · B. không.
13. **Câu móc sau kết** (giữ truyện mở): **A. "ngoài khơi có tiếng đáp lại"** · B. kết hẳn, không móc.
14. **Tên ải** (Ruộng bậc thang khô, Rừng tre cháy, Bản đá bỏ hoang…): **A. dùng, hiện trên bản đồ** (như Q12 vùng 4) · B. không hiện.
15. **Số khuyên dùng xuất phát +~30% mỗi vùng** (mục 6.1): **A. dùng làm số xuất phát, bot chốt** · B. muốn mỗi vùng khó hơn ít hơn (+20%).
