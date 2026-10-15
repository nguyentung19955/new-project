# Bước 3 — Kế hoạch chi tiết vùng 4 Sông sâu (Thuồng Luồng)

Lập 15/10/2026. Đây **chỉ là kế hoạch**: chưa sửa gì trong `game/`, chưa gen ảnh nào. Chủ game duyệt (nhất là mục 7 "Câu hỏi") rồi mới làm.
Đã đọc: `docs/cot-truyen/CHUNG.md`, `docs/thiet-ke-game.md`, `docs/ke-hoach/BUOC-2-3-4.md`, code 3 vùng hiện có (`data.js`, `monster_art.js`,
`boss.js`, `chieu_trum.js`, `ky_nang_quai.js`, `mapgen.js`, `room_art.js`, `env_art.js`, `truyen.js`, `sprite_custom.js`, `build.py`…) và quy trình ảnh
cũ (`quai-moi-bien`, `quai-moi-lau`, `hieu-ung-ky-nang`, `docs/anh-goc/quai-moi/que`, `docs/anh-goc/trum-moi`).

## Tóm tắt một phút

- **Vùng 4 Sông sâu**: ngược dòng sông từ bến làng lên vực sâu nơi Thuồng Luồng ở. Nước đục, lau sậy, làng chài bỏ hoang, đèn dầu thuyền chài.
- **Luật riêng (dễ hiểu cho trẻ con)**: *dòng nước chảy* đẩy nhẹ mọi thứ theo mũi tên (đứng trên cầu tre thì không trôi); vùng có **đủ cả ba nguồn hệ**
  (lục bình độc, nước sâu lạnh, đèn dầu cháy) vì trùm **đổi hệ theo pha** → dạy người chơi đổi vũ khí giữa trận.
- **8 quái mới** (Rái Cá, Đỉa, Ba Ba, Cóc, Rắn Nước, Ếch, Ma Da, Trai), **2 tinh anh** (Rái Cá Thủ Lĩnh, Cóc Tía Chúa), **trùm nhỏ Cá Trê Râu Roi**,
  **trùm vùng Thuồng Luồng 3 pha** (Độc → Băng → Lửa), có chiêu chống đứng sát mép ngay từ pha 1.
- **Truyện**: Bé Sen, con gái Chú Lái Đò, bị bắt; lấy được **mảnh trống thứ 4 (mảnh vành chim Lạc)**; Thuồng Luồng ôm **mảnh mặt trời** (mảnh lớn nhất)
  bỏ trốn lên Núi Sét → móc sang vùng 5. Cần **1 cảnh truyện mới** (dùng lại ảnh "bóng dưới sông" cho lời mở vùng).
- **Ảnh**: 15 ảnh mẫu → 85 tấm động tác → 5 tấm nền / cửa / trang trí / môi trường → 13 tấm hiệu ứng → 6 ảnh giao diện, truyện, Bé Sen. Tổng **~124 ảnh**
  (đã tính dùng lại ảnh cũ chỗ nào được). Prompt từng ảnh ở mục 4.
- **Code**: 10 phiên (phiên 0 chuẩn bị, phiên 1 làm khung trước, sau đó 2–3 phiên song song), mọi thứ sau cờ `?vung4=0` (ẩn cả vùng).
- **Dung lượng**: người chơi tải ~15,3 → **~18,5 MB** (trần 20 MB). Còn chỗ nhưng **vùng 5 sẽ chật** — xem mục 6.

---

## 1. Thiết kế vùng

### 1.1 Tên và cảm giác
- **Tên**: Sông sâu (mã code `song`, chỉ số vùng 3). Tên ảnh: `gd-nen-song-*`, `gd-cua-song-*`, `gd-tt-song-*`, quái `vung: 'song'`.
- **Cảm giác**: chiều tối trên sông, nước xanh đen đục, sương mù thấp, lau sậy, cọc tre, thuyền úp, nhà sàn đổ của làng chài bỏ hoang,
  ánh đèn dầu vàng ấm lác đác. Càng vào sâu (ải 4, 5) càng tối, có đá rêu và mảnh gốm cổ dưới đáy.
- **Bảng màu**: trời `#0b1a1c → #123034 → #1b4a4c`, đất `#3e5148`, điểm nhấn vàng đèn dầu `#ffc878`, mắt Thuồng Luồng xanh lam `#5ff0ff`.
  Khác Hang biển (xanh lam lạnh, đá xám) bằng tông **xanh rêu + nâu bùn + vàng đèn**.
- **Hệ vùng**: trong bảng vùng ghi `el: 'poison'` (nước đục, bùn, lục bình), nhưng quái mang đủ 3 hệ và **Thuồng Luồng đổi hệ theo pha** (câu hỏi Q1).

### 1.2 Luật riêng của vùng (vừa sức trẻ con: nhìn là hiểu, không gây chết oan)
| Luật | Người chơi thấy | Tác dụng | Dạy ở |
|---|---|---|---|
| **Dòng nước chảy** | Dải nước có mũi tên trắng trôi, rộng ~1/4 phòng, ngang hoặc dọc | Đẩy em bé và quái theo mũi tên ~30 điểm ảnh/giây (≈ 40% tốc chạy). Không mất máu. Lăn né xuôi dòng đi xa hơn. Đứng trên **cầu tre** thì không trôi. Quái nhẹ (Đỉa, Ếch) trôi nhanh gấp đôi → dụ chúng xuống nước cho trôi xa. | Ải 4-1, phòng 1 có mũi tên lớn nhấp nháy + 1 câu mẹo |
| **Lục bình độc** (nguồn Độc) | Cụm lục bình tím trên mép nước | Đánh vỡ → vũng độc 3 giây (như nấm nổ Rừng già) | Ải 4-2 |
| **Nước sâu lạnh** (nguồn Băng) | Vũng nước xanh thẫm có bọt trắng | Lội vào chậm 25%; quái đứng trong vũng bị Băng 1 tầng mỗi giây | Ải 4-1 trở đi |
| **Đèn dầu thuyền chài** (nguồn Lửa) | Đèn dầu treo trên cọc | Đánh đổ → vệt lửa dầu loang trên mặt nước 3 giây | Ải 4-3 |

Không làm "nước dâng" ở phòng thường (đã là chiêu của Ngư Tinh, trẻ con dễ thấy lặp). Dòng chảy **không bao giờ** đẩy em bé vào vùng đỏ đang nổ
nhanh hơn em bé tự chạy ra được (tốc dòng < 40% tốc chạy; phiên code kiểm bằng bot: không có lượt nào chết vì đứng yên trong dòng).

### 1.3 Năm ải
| Ải | Tên (chỉ để hình dung, hiện trên bản đồ nếu muốn) | Phòng | Có gì mới | Quái chính | Cuối ải |
|---|---|---|---|---|---|
| 4-1 | Bến đò hoang | 7 | Dạy dòng chảy, cầu tre, nước sâu | Rái Cá, Đỉa, Ba Ba, Rắn Nước | Cá Trê (trùm nhỏ) |
| 4-2 | Đầm lục bình | 7 | Lục bình độc | + Cóc Tía, Ếch Phình | Cá Trê |
| 4-3 | Làng chài bỏ hoang | 8 (có phòng chọn cửa) | Đèn dầu, nhà sàn đổ | + Ma Da, Trai Gai; tinh anh Rái Cá Thủ Lĩnh | Cá Trê |
| 4-4 | Thác ngầm | 8 | Dòng chảy mạnh hơn (2 dải / phòng) | đủ 8 con; tinh anh Cóc Tía Chúa | Cá Trê |
| 4-5 | Vực Thuồng Luồng | 8 | Phòng trùm là bãi đá giữa sông | đủ 8 con + 2 tinh anh | **Thuồng Luồng** |

Cấp hero dự kiến **30 → 40** (vùng 3 kết thúc quanh cấp 30–32). Số máu / sát thương chỉ là số xuất phát, **bot đo rồi mới chốt** (mục 5, phiên 8).

### 1.4 Bố cục phòng
- Giữ nguyên bản đồ ải 8 phòng vuông của `mapgen.js` (kiểu A / B / C ngẫu nhiên) — không đổi luật bản đồ.
- **Phòng đánh quái**: 0–1 dải dòng chảy (ải 4-4, 4-5: tới 2 dải) cắt ngang hoặc dọc phòng, luôn có **1–2 cầu tre** bắc qua; vật cản: thuyền úp,
  chum, cọc tre, bó lau. Không để dòng chảy chạy sát cửa (chừa 2 ô quanh cửa).
- **Rương báu / suối hồi**: suối hồi là **giếng nước trong cạnh miếu nhỏ ven sông**; bóng trùm hiện trên mặt nước giếng (thay cho vách).
- **Phòng trùm nhỏ (Cá Trê)**: bãi bùn rộng, giữa có 2 vũng nước sâu.
- **Phòng trùm vùng (Thuồng Luồng)**: **bãi đá giữa sông** chiếm ~70% phòng, xung quanh là nước sâu (không đi được, như tường).
  Thân Thuồng Luồng trồi lên từ nước ở **mép trên và mép dưới**, đầu ở mép phải. Sân rộng ~1,5 màn hình như trùm cũ.

---

## 2. Quái, tinh anh, trùm

Không trùng 30 con cũ (đã soát: không có rái cá, đỉa, ba ba, cóc, rắn, ếch, ma da, trai, cá trê). Mỗi con một vai như 3 vùng cũ
(`G.MOB_ART`). "Khung que" = tấm người que gửi kèm khi gen 6 động tác (`docs/anh-goc/quai-moi/que/`).
Mọi đòn mới đều có **vùng đỏ báo trước** dài ít nhất bằng báo trước của vai cũ (`ky_nang_quai.js` bảng `KN.CU`), né được bằng chạy hoặc lăn.

### 2.1 Tám quái thường
| # | Tên · mã | Vai | Hệ | Tạo hình | Cách đánh (kỹ năng riêng) | Khung que |
|---|---|---|---|---|---|---|
| 1 | **Rái Cá Cầm Sào** `raiCa` | Lính xông | — | Rái cá nâu đứng 2 chân, cầm sào tre, buộc khăn đỏ | **Chống sào nhảy**: chống sào lấy đà 0,6 s (vòng đỏ ở chỗ đáp, ngay chỗ em bé đứng), vọt tới đập sào. Đáp trượt thì đứng ngẩn 1 s → đánh. | `2chan` có sẵn |
| 2 | **Bầy Đỉa Trâu** `diaTrau` | Bầy nhỏ | Độc | 3 con đỉa béo sọc vàng, mắt to dễ thương | **Bám chân**: bò ngoằn ngoèo, tới gần thì nhổm lên (0,5 s) rồi lao bám; dính thì em bé chậm 20% và mất máu nhỏ 3 giây, **lăn né để giũ ra**. | **mới `ran3`** |
| 3 | **Ba Ba Mai Đồng** `baBa` | Khiên | Băng | Ba ba mai dẹt xanh xám, hoa văn trống đồng mờ, mũi ống, cổ dài | Mai chắn phía trước (giáp như quái khiên cũ). **Vươn cổ đớp**: rụt cổ vào mai 0,6 s (mắt loé) rồi phóng cổ thẳng 70 điểm ảnh. Đánh vào **sau lưng** khi nó vừa đớp xong. | `4chan` có sẵn |
| 4 | **Cóc Tía Phun Bọt** `cocTia` | Xạ thủ | Độc | Cóc tím nâu lưng sần, bụng vàng, ngồi trên lá sen nhỏ | **Phun 3 bọt** theo vòng cung (bóng tròn báo chỗ rơi 0,7 s), bọt vỡ thành vũng độc nhỏ 2 s. Hay nhảy lùi khi em bé lại gần. | `nam` có sẵn (ngồi, nhún) |
| 5 | **Rắn Nước Sọc** `ranNuoc` | Nhanh nhẹn | Độc | Rắn xanh sọc vàng, mắt to | **Lặn – trồi đớp**: trườn vào nước/bùn, chỉ thấy **gợn nước** chạy vòng ra sau lưng em bé (1 s), rồi trồi đớp (vòng đỏ 0,45 s). Trên sàn đá không lặn được → dụ ra chỗ khô. | **mới `ran`** |
| 6 | **Ếch Phình Hơi** `echPhinh` | Cảm tử | Băng | Ếch tròn xanh chấm lam, phình bụng như bóng | **Phình rồi nổ**: phình to 1 s (vòng đỏ to dần), nảy tới nổ tung → vũng nước lạnh làm chậm 2 s. Đánh nổ sớm khi nó còn xa quái khác thì nổ trúng quái. | `tron` có sẵn |
| 7 | **Ma Da Tóc Rong** `maDa` | Đặt bom | Băng | Tiểu yêu sông da xanh nhạt, tóc rong dài che một mắt, mắt tròn ngơ ngác — **ngộ nghĩnh, không đáng sợ** | **Ném bầu nước**: ném bầu nước, chỗ rơi thành **xoáy nước nhỏ** 1,3 s kéo nhẹ em bé vào tâm rồi bắn nước (vòng đỏ). Chạy ngược ra ngoài là thoát. | `2chan` có sẵn |
| 8 | **Trai Sông Gai** `traiGai` | Gai | — | Con trai to vỏ sần gai, viên ngọc sáng bên trong | **Bắn ngọc nảy**: há vỏ (0,8 s, ngọc sáng dần), bắn 5 viên ngọc theo hình quạt, ngọc nảy 1 lần trên sàn. Lúc khép vỏ: miễn sát thương phía trước, đánh từ sau. | **mới `vo2`** |

Hệ khắc chế theo vai (dạy như cũ): Bầy → Lửa, Khiên → Độc, Xạ thủ / Nhanh nhẹn → Băng.

### 2.2 Hai tinh anh (phòng đánh quái cuối mỗi ải, như cũ)
| Tên · mã | Hệ | Tạo hình | Chiêu | Khung que |
|---|---|---|---|---|
| **Rái Cá Thủ Lĩnh** `raiCaChua` | Lửa | Rái cá to đội nón lá rách, vai khoác lưới chài, tay cầm **đuốc tre soi cá** | **Quăng lưới chài**: vòng đỏ to 1 s ở chỗ em bé; trúng thì bị lưới giữ 1 s (bấm lăn né liên tục để thoát nhanh). Ngay sau đó **quét đuốc** hình nón (vệt lửa). Pha nổi giận: gọi 2 Rái Cá con. | `2chan` |
| **Cóc Tía Chúa** `cocChua` | Độc | Cóc tím khổng lồ mụn vàng, mào như vương miện, ngồi trên lá sen lớn | **Lưỡi kéo**: đường đỏ thẳng 0,7 s, trúng thì bị kéo về sát cóc (không mất máu thêm) → ngay sau là **dậm lá sen** vòng tròn (né bằng lăn ra). **Mưa bọt**: 6 bọt độc rơi quanh em bé. | `nam` |

Dấu hiệu ngẫu nhiên của tinh anh (`G.ELITE_TRAITS`: nhanh, giáp, nổ, hút) giữ nguyên.

### 2.3 Trùm nhỏ: Cá Trê Râu Roi `caTre` (cuối ải 4-1 → 4-4)
Dân gian: chuyện *Trê Cóc* (cá trê và cóc tranh con) — ăn khớp với Cóc Tía trong vùng. Cá trê đen bò bằng bụng trên bùn, đầu bẹt, **4 râu dài như roi**.
| Pha | Chiêu |
|---|---|
| Pha 1 (máu > 50%) | **Quất râu**: 4 vạch đỏ hình chữ X quanh thân (0,7 s) — đứng giữa hai vạch là né. **Phun bùn**: 3 cục bùn rơi thành vũng trơn (lội vào chậm). **Lặn bùn**: chui xuống bùn, gợn bùn đuổi theo em bé 1,5 s, trồi lên ở chỗ gợn (vòng đỏ). |
| Pha 2 nổi giận (≤ 50%) | Râu sáng cam, **quất râu xoay tròn** (vòng đỏ hình bánh xe 4 nan quay chậm — đi theo khe giữa nan). Lặn bùn 2 lần liền. |
| Chống đứng sát mép | Em bé đứng cách mép < 40 điểm ảnh quá 1,5 s → **bùn phụt dọc chân tường** mép đó (5 cột bùn nối nhau, báo trước 0,8 s, bước vào trong là né) — giống đá rơi của Cua Đá. |
| Lớp thích nghi | 1 lớp (luật cũ). Điểm yếu: bụng trắng lộ ra 1,5 s sau khi trồi khỏi bùn. |

### 2.4 Trùm vùng: Thuồng Luồng `thuongLuong` (ải 4-5)
**Tạo hình** (khớp ảnh `b2b-bong-duoi-song.png` chủ game đã chọn): rắn nước khổng lồ thân xanh đen, **không cánh**, vây lưng răng cưa, bụng nhạt,
**mắt xanh lam phát sáng**, **một mảnh trống đồng cắm trên trán**. Trên sân chỉ thấy phần thân trồi lên khỏi nước thành chữ S, cao ~110 điểm ảnh.
Đây là "kẻ cầm đầu" nhưng **chưa phải trùm cuối** (Hắc Long mới là), nên không dùng sóng âm theo nhịp trống (để dành cho Hắc Long).

**Đổi hệ theo pha** (đề xuất Q1): Thuồng Luồng đã hút linh khí của 3 yêu tinh cũ, nên mỗi pha mang hệ của một con: thân đổi màu rõ + biểu tượng hệ
cạnh thanh máu. Người chơi thấy "pha 2 nó xanh băng → đổi vũ khí Độc".
- Pha 1 **Độc** (nước đen, bùn) → yếu **Lửa**. Pha 2 **Băng** (sương giá) → yếu **Độc**. Pha 3 **Lửa** (mảnh trống đỏ rực) → yếu **Băng**.
- Luật thích nghi cũ vẫn chạy (kháng thêm hệ bạn dùng > 50%). **Sao thứ ba**: kết liễu bằng Băng (khắc pha 3).

| Pha | Máu | Chiêu (mỗi chiêu có vùng đỏ báo trước 0,6–1 s) | Chỗ né |
|---|---|---|---|
| **1 · Độc** | 100–66% | **Quật đuôi**: đuôi trồi lên ở mép trên hoặc dưới, quét ngang **nửa sân** đó. | Sang nửa kia. |
| | | **Phun nước đen**: tia nước thẳng từ đầu tới chỗ em bé, để lại vệt độc 3 s. | Bước ngang khỏi vạch. |
| | | **Vòng thân**: 3 khúc thân trồi lên thành 3 vòm trên sân (chắn đường, chắn đạn) 2 s, rồi siết lại — đứng **trong** vòm bị trúng. | Đứng ngoài vòm. Lúc vòm trồi là lúc đầu nằm trên đá: **điểm yếu** (mảnh trống trên trán sáng) lộ 2 s. |
| | | **Vỗ sóng bờ** (chống đứng sát mép, có **ngay từ pha 1**): em bé đứng cách mép < 40 điểm ảnh quá 1,5 s → thân quẫy dưới nước mép đó, sóng tạt phủ dải mép. | Bước vào giữa sân. |
| **2 · Băng** (nổi giận) | 66–33% | Giữ chiêu pha 1 (nhanh hơn theo bảng `G.NOI_GIAN.vung`) + **Xoáy nước**: 2 xoáy chạy chậm trên sân, kéo nhẹ em bé vào. | Chạy ngược chiều kéo, lăn né. |
| | | **Lặn – trồi đớp**: lặn hẳn (gợn nước đuổi theo em bé 2 s), trồi đớp ở chỗ gợn. | Chạy vòng khi gợn tới gần, lăn đúng lúc vòng đỏ sáng. |
| | | **Dòng nước đổi chiều**: sân có 1 dải dòng chảy, mỗi 10 s đổi chiều (mũi tên đổi trước 1,5 s). | Đứng trên đá ngoài dải. |
| **3 · Lửa** (hoá cuồng) | 33–0% | **Mưa mảnh đồng**: mảnh trống nóng đỏ rơi xuống 6 chỗ (bóng tròn báo trước), rơi xong nằm lại làm vật cản nóng 4 s. | Ra khỏi bóng tròn; đừng đứng kẹt giữa các mảnh. |
| | | **Siết sân**: thân cuộn quanh mép sân, sân hẹp dần (như Mộc Tinh pha 3) — mỗi 6 s vòng thân **quét mép trong** một lượt. | Đứng giữa sân. |
| | | **Đớp liên hoàn**: 3 cú đớp nối nhau theo hướng em bé. | Lăn ngang sau mỗi cú. |

**Thua** (thay cho chết): Thuồng Luồng **nhả một mảnh trống nhỏ**, ngoạm mảnh to sáng rực rồi **lặn mất** (tấm `p3-5-bo-tron`). Thắng ải như hạ trùm bình thường.
**Chống áp sát / chống đánh xa** (luật thích nghi cũ): áp sát → vảy dựng gai khi đầu nằm trên đá; đánh xa → lặn rồi trồi ngay dưới chân em bé.

---

## 3. Truyện vùng 4

### 3.1 Mạch
Sau khi hạ Hồ Tinh, đoạn kết cũ đã nói "*mặt sông lại gợn sóng, như có gì dưới đáy chưa ngủ*" → **giữ nguyên** đoạn kết đó (người chơi cũ đã xem) và
nối thẳng vào vùng 4.
- **Người cần cứu**: **Bé Sen**, con gái Chú Lái Đò (nhân vật làng sẵn có, nên trẻ con thấy thân). Về làng ngồi ở bến đò cạnh bố.
- **Mảnh trống thứ 4**: **mảnh vành có hình chim Lạc bay** (Thuồng Luồng nhả ra khi thua).
- **Câu móc vùng 5**: Thuồng Luồng ôm **mảnh mặt trời** (giữa trống, mảnh lớn nhất) bơi ngược lên nguồn, tới Núi Sét — từ đó sấm nổ không ngớt.
  (Khớp Hắc Long sau này: "mặt sao trống ốp trán như mắt thứ ba".)

### 3.2 Lời các trang (tiếng Việt; bản tiếng Anh phiên code thêm vào từ điển `tools/ngon-ngu/tu-dien/truyen-am-thanh.json`)
**Mở vùng** (khối mới `MO_VUNG[3]`, chiếu một lần khi người chơi chạm vùng 4 trên bản đồ lần đầu; nền dùng lại ảnh `song` = b2b):
1. *(nền song)* Ba yêu tinh ngủ rồi, nhưng nước sông vẫn đục ngầu. Bé Sen, con gái Chú Lái Đò, ra bến giặt áo rồi không thấy về.
2. *(nền song, Chú Lái Đò)* Cu Tí ơi, cái bóng dài dưới sông bắt Sen đi rồi! Chú chèo đò đưa cháu ngược lên Sông sâu. Bám chắc mạn đò nhé!

**Kết vùng** (`VUNG_MOI[3]`, chiếu khi về làng sau lần đầu hạ Thuồng Luồng; khung đầu dùng **ảnh mới b7**):
1. *(nền b7)* Thuồng Luồng nhả ra một mảnh trống, ngoạm mảnh to nhất sáng như mặt trời, rồi lặn mất về phía núi xa.
2. *(Bé Sen)* Cu Tí ơi! Con rắn to ơi là to giấu tớ trong hang dưới thác. Đêm nào nó cũng lẩm bẩm "trống... trống..."!
3. *(Chú Lái Đò)* Sen ơi, con về rồi! Cảm ơn Cu Tí. Mảnh trống thứ tư đây, có đàn chim Lạc đang bay.
4. *(Cụ Đồ)* Nó mang đi mảnh mặt trời, mảnh lớn nhất. Trên Núi Sét, sấm nổ suốt từ đêm qua... Chắc chắn có chuyện rồi.
5. Bé Sen đã về làng, ngồi ở bến đò với bố. *(nếu Q5 chọn mở thêm gì thì ghi ở đây)*

**Lời trùm** (bảng `TRUM`):
- Thuồng Luồng ra mắt: *"Trống đồng im rồi, cả dòng sông là của ta! Linh khí cây đa ngọt lắm, nhóc con!"* — khi thua: *"Hừ... Mảnh này ta mang đi. Lên núi rồi ngươi sẽ biết!"*
- Đổi pha (bong bóng lời ngắn, không dừng trận): pha 2 *"Lạnh buốt như hang Ngư Tinh!"* · pha 3 *"Mảnh trống ơi, cháy lên!"*
- Cá Trê (`mini3`): *"Ục ục! Râu ta quất một cái là bùn bay khắp sông!"* — *"Ối... lặn xuống bùn trốn thôi..."*

**Người làng — câu mốc thứ 4** (bảng `LANG`, nói một lần sau khi hạ Thuồng Luồng):
| Người | Câu |
|---|---|
| Chú Lái Đò | Sen về rồi, đò chú nhẹ hẳn! Muốn lên Núi Sét thì chú chở tới chân núi thôi nhé, sấm to lắm. |
| Ông Thợ Rèn | Vảy Thuồng Luồng cứng hơn cả sắt. Ông tôi lưỡi bằng nước sông, bén ngọt! |
| Bà Hàng Xén | Sông trong lại rồi, cá tôm về chợ đầy rổ. |
| Cô Thợ May | Bé Sen ướt hết áo, cô may cho cái áo mới màu sen. |
| Cụ Đồ | Thuồng Luồng chưa chết đâu, nó chỉ trốn. Lão ghi vào sách: "mảnh thứ tư, chim Lạc bay". |
| Ông Từ | Bốn mảnh trống đặt trên đình rồi. Còn thiếu mảnh giữa... |
| Anh Mõ | Cốc cốc! Bé Sen về làng rồi, làng nước ơi! |

### 3.3 Có cần cảnh truyện mới không?
**Cần 1 cảnh**: `b7-thuong-luong-bo-tron` (Thuồng Luồng ngoạm mảnh mặt trời lặn đi, xa xa núi có sét). Lời mở vùng dùng lại `b2b-bong-duoi-song`.
Không bắt buộc: `b8-nui-set` (cảnh móc vùng 5) — đề xuất để dành làm ở vùng 5 (Q10).

---

## 4. Danh sách ảnh cần gen (theo đúng thứ tự làm)

**Cách gửi**: mỗi ảnh một tin nhắn ChatGPT, dán prompt trong khung + gửi kèm các tệp ghi ở dòng "Gửi kèm" (đường dẫn trong repo).
Lưu ảnh về đúng tên tệp ghi ở đầu mục. Ảnh nào hỏng thì gen lại, đặt tên `-b.png` như cũ.
Luật nền: **quái, trùm, hiệu ứng nền xanh `#00FF00`**; **mảng nền phòng / cửa / trang trí nền hồng `#FF00FF`** (như các vùng cũ).
Thứ tự: **A ảnh mẫu → (chủ game duyệt tạo hình) → B khung que mới (Claude làm) → C 6 động tác → D nền / cửa / trang trí → E hiệu ứng → F giao diện, truyện, Bé Sen.**
Ảnh dùng lại, **không gen**: `hu-vung-quai-doc`, `hu-vung-quai-bang`, `hu-vung-quai-lua` (vũng hệ), `hu-nut-dat` (Rái Cá đập sào),
`hu-cot-nuoc` (Ếch nổ, phụ), khung giao diện đồng chung (không cần khung riêng vùng).

### A. Ảnh mẫu (15 ảnh) — gen xong gửi chủ game xem tạo hình trước, chưa gen động tác
**A1. `docs/anh-goc/quai-moi/raiCa-mau-moi.png`** · Rái Cá Cầm Sào  
Gửi kèm: `docs/anh-goc/quai-moi/heoCon-mau-moi.png`, `docs/anh-goc/quai-moi/linhMa-mau-moi.png`
```
Pixel art game monster in the exact style, outline and shading of the first attached sample. A chubby brown river otter standing on two legs, holding a long bamboo pole, small red cloth headband, white chest. Side view facing right, full body, cute and a little spooky, for kids. Flat #00FF00 background, no text, no shadow.
```

**A2. `docs/anh-goc/quai-moi/diaTrau-mau-moi.png`** · Bầy Đỉa Trâu  
Gửi kèm: `docs/anh-goc/quai-moi/heoCon-mau-moi.png`, `docs/anh-goc/quai-moi/caCon-mau-moi.png`
```
Pixel art game monster in the exact style, outline and shading of the first attached sample. A group of three fat dark-olive leeches with yellow side stripes, round sucker mouths, big cute eyes, crawling on the ground. Side view facing right, full body, cute and a little spooky, for kids. Flat #00FF00 background, no text, no shadow.
```

**A3. `docs/anh-goc/quai-moi/baBa-mau-moi.png`** · Ba Ba Mai Đồng  
Gửi kèm: `docs/anh-goc/quai-moi/heoCon-mau-moi.png`, `docs/anh-goc/quai-moi/boHung-mau-moi.png`
```
Pixel art game monster in the exact style, outline and shading of the first attached sample. A softshell river turtle, flat green-grey shell with a faint bronze drum swirl pattern, long snorkel nose, long neck, webbed feet. Side view facing right, full body, cute and a little spooky, for kids. Flat #00FF00 background, no text, no shadow.
```

**A4. `docs/anh-goc/quai-moi/cocTia-mau-moi.png`** · Cóc Tía Phun Bọt  
Gửi kèm: `docs/anh-goc/quai-moi/heoCon-mau-moi.png`, `docs/anh-goc/quai-moi/hoaBaoTu-mau-moi.png`
```
Pixel art game monster in the exact style, outline and shading of the first attached sample. A fat purple-brown toad with a warty back and yellow belly, sitting on a small lily pad, cheeky face. Side view facing right, full body, cute and a little spooky, for kids. Flat #00FF00 background, no text, no shadow.
```

**A5. `docs/anh-goc/quai-moi/ranNuoc-mau-moi.png`** · Rắn Nước Sọc  
Gửi kèm: `docs/anh-goc/quai-moi/heoCon-mau-moi.png`, `docs/anh-goc/quai-moi/chonBong-mau-moi.png`
```
Pixel art game monster in the exact style, outline and shading of the first attached sample. A slim green water snake with yellow stripes, big friendly eyes, small forked tongue, low to the ground. Side view facing right, full body, cute and a little spooky, for kids. Flat #00FF00 background, no text, no shadow.
```

**A6. `docs/anh-goc/quai-moi/echPhinh-mau-moi.png`** · Ếch Phình Hơi  
Gửi kèm: `docs/anh-goc/quai-moi/heoCon-mau-moi.png`, `docs/anh-goc/quai-moi/caNoc-mau-moi.png`
```
Pixel art game monster in the exact style, outline and shading of the first attached sample. A round green frog with icy blue spots that can inflate its belly like a balloon, tiny legs, wide grin. Side view facing right, full body, cute and a little spooky, for kids. Flat #00FF00 background, no text, no shadow.
```

**A7. `docs/anh-goc/quai-moi/maDa-mau-moi.png`** · Ma Da Tóc Rong  
Gửi kèm: `docs/anh-goc/quai-moi/heoCon-mau-moi.png`, `docs/anh-goc/quai-moi/tieuYeu-mau-moi.png`
```
Pixel art game monster in the exact style, outline and shading of the first attached sample. A tiny goofy river imp with pale teal skin, long dripping waterweed hair covering one eye, round silly eyes, holding a small water gourd. Funny, not scary. Side view facing right, full body, cute and a little spooky, for kids. Flat #00FF00 background, no text, no shadow.
```

**A8. `docs/anh-goc/quai-moi/traiGai-mau-moi.png`** · Trai Sông Gai  
Gửi kèm: `docs/anh-goc/quai-moi/heoCon-mau-moi.png`, `docs/anh-goc/quai-moi/oc-mau-moi.png`
```
Pixel art game monster in the exact style, outline and shading of the first attached sample. A large river mussel with a dark ridged shell covered in short spikes, a glowing pearl inside, tiny eyes peeking from the gap. Side view facing right, full body, cute and a little spooky, for kids. Flat #00FF00 background, no text, no shadow.
```

**A9. `docs/anh-goc/quai-moi/raiCaChua-mau-moi.png`** · Rái Cá Thủ Lĩnh (tinh anh)  
Gửi kèm: `docs/anh-goc/quai-moi/heoCon-mau-moi.png`, `docs/anh-goc/quai-moi/tuongMa-mau-moi.png`
```
Pixel art game monster in the exact style, outline and shading of the first attached sample. A big otter chief standing on two legs, torn conical straw hat (non la), a cast fishing net over one shoulder and a burning bamboo fishing torch in one hand. Side view facing right, full body, cute and a little spooky, for kids. Flat #00FF00 background, no text, no shadow.
```

**A10. `docs/anh-goc/quai-moi/cocChua-mau-moi.png`** · Cóc Tía Chúa (tinh anh)  
Gửi kèm: `docs/anh-goc/quai-moi/heoCon-mau-moi.png`, `docs/anh-goc/quai-moi/namPhongChua-mau-moi.png`
```
Pixel art game monster in the exact style, outline and shading of the first attached sample. A huge purple toad with golden warts and a small crown-like crest, sitting on a giant lotus leaf, long sticky tongue. Side view facing right, full body, cute and a little spooky, for kids. Flat #00FF00 background, no text, no shadow.
```

**A11. `docs/anh-goc/quai-moi/caTre-mau-moi.png`** · Cá Trê Râu Roi (trùm nhỏ)  
Gửi kèm: `docs/anh-goc/quai-moi/heoCon-mau-moi.png`, `docs/anh-goc/quai-moi/cua-mau-moi.png`
```
Pixel art game monster in the exact style, outline and shading of the first attached sample. A big dark catfish moving on its belly over mud, flat wide head, four very long whip-like whiskers, small fins used like legs, muddy belly. Side view facing right, full body, cute and a little spooky, for kids. Flat #00FF00 background, no text, no shadow.
```

**A12. `docs/anh-goc/trum-moi/ca-tre-p2.png`** · Cá Trê pha 2 (nổi giận)  
Gửi kèm: `docs/anh-goc/trum-moi/ca-tre-p1.png (= caTre-mau-moi.png đã duyệt)`
```
Redraw the exact catfish in the attached image, same side view facing right, but ANGRY: red glowing eyes, whiskers glowing orange, mud bubbling around its body, spikier fins. Full body. Flat #00FF00 background, no text, no shadow.
```

**A13. `docs/anh-goc/trum-moi/thuong-luong-p1.png`** · Thuồng Luồng pha 1  
Gửi kèm: `docs/anh-goc/trum-moi/ngu-tinh-p1.png`, `docs/anh-goc/truyen/b2b-bong-duoi-song.png`
```
Pixel art boss in the exact style of the first attached image. A giant Vietnamese river serpent (thuong luong) like the coiled shadow in the second image: no wings, thick black-green body rising from a ring of dark water in a tall S-curve, ridged back fin, pale belly, glowing cyan eyes, a bronze drum shard stuck on its forehead. Side view facing right, whole visible body, about twice as tall as wide. Flat #00FF00 background, no text, no shadow.
```

**A14. `docs/anh-goc/trum-moi/thuong-luong-p2.png`** · Thuồng Luồng pha 2 (Băng)  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p1.png`
```
Redraw the exact serpent in the attached image, same pose, but in its ICE phase: eyes and belly glowing icy blue, frost crystals on the scales, cold mist and swirling water around the body. Flat #00FF00 background, no text, no shadow.
```

**A15. `docs/anh-goc/trum-moi/thuong-luong-p3.png`** · Thuồng Luồng pha 3 (Lửa, mảnh trống rực)  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p1.png`
```
Redraw the exact serpent in the attached image, same pose, but in its last FIRE phase: the bronze drum shard on its forehead glows red-hot, ember cracks along the body, steam rising from the water, eyes orange. Flat #00FF00 background, no text, no shadow.
```


### B. Khung que mới (Claude làm, KHÔNG gen) — Phiên 0, trước nhóm C
Khung que có sẵn dùng được: `2chan` (Rái Cá, Ma Da, Rái Cá Thủ Lĩnh), `4chan` (Ba Ba), `nam` (Cóc Tía, Cóc Tía Chúa), `tron` (Ếch Phình), `ca` (Cá Trê).
Cần vẽ thêm bằng script (chép kiểu `docs/anh-goc/quai-moi/que/que4.py`: ô 300×230, cách 40, vạch đất y=150, nét đen trên nền trắng, nét đỏ là hiệu ứng;
tấm 6 khung 2080×320, tấm trúng đòn 4 khung 1400×320), mỗi loại 6 tấm `-1-dung … -6-chet`:
- **`ran`** — rắn trườn sát đất: đứng = cuộn, đầu ngóc · đi = uốn chữ S · báo đòn = rụt đầu thành S chặt · đánh = phóng đầu thẳng · trúng = gập thân · chết = duỗi thẳng mờ dần.
- **`ran3`** — ba con nhỏ của `ran` xếp so le (cho Bầy Đỉa).
- **`vo2`** — vỏ hai mảnh (con trai): khép · lết chân · há rộng (tia đỏ chỗ ngọc) · bật mở bắn 5 chấm đỏ · khép chặt rung · vỡ vỏ.
Thuồng Luồng và Cá Trê pha 2 gen theo kiểu trùm cũ (chỉ gửi ảnh pha, không cần khung que — như `docs/anh-goc/trum-moi/prompt-dong-tac.txt`).
Phiên 0 cũng xuất sẵn vài **ảnh mẫu từ game** để gửi kèm (ảnh trong game đang nằm trong `.sprite.json`, ChatGPT không đọc được):
`docs/anh-goc/vung-4/mau/cua-bien.png` (6 cửa Hang biển ghép một hàng), `docs/anh-goc/vung-4/mau/icon-manh.png` (`vp-shard0..2` + `vp-mat0..2` ghép),
`docs/anh-goc/vung-4/mau/hieu-ung.png` (vài hiệu ứng cũ: `hu-vung-quai-bang`, `hu-cot-nuoc`, `hu-manh-san-ho`).

### C. Sáu động tác (85 tấm) — 11 con × 6 tấm + Cá Trê pha 2 (4) + Thuồng Luồng (15)
Mỗi con làm lần lượt 1 → 6. Tấm `5-trung-don` là **4 khung**, còn lại 6 khung. Thuồng Luồng: tấm `6-lan` (lặn xuống nước) dùng cho chiêu lặn – trồi,
không có tấm chết; pha 3 có thêm tấm `p3-5-bo-tron` (bỏ trốn).

#### Rái Cá Cầm Sào `raiCa` — khung que `2chan`

**C1. `docs/anh-goc/quai-moi/dong-tac/raiCa-1-dung.png`** · động tác 1-dung  
Gửi kèm: `docs/anh-goc/quai-moi/raiCa-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-1-dung.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: breathing, pole resting on shoulder, tail swaying. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C2. `docs/anh-goc/quai-moi/dong-tac/raiCa-2-di.png`** · động tác 2-di  
Gửi kèm: `docs/anh-goc/quai-moi/raiCa-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-2-di.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: waddling forward, pole bobbing. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C3. `docs/anh-goc/quai-moi/dong-tac/raiCa-3-bao-don.png`** · động tác 3-bao-don  
Gửi kèm: `docs/anh-goc/quai-moi/raiCa-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-3-bao-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: crouches low and plants the pole behind, body coiled. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C4. `docs/anh-goc/quai-moi/dong-tac/raiCa-4-danh.png`** · động tác 4-danh  
Gửi kèm: `docs/anh-goc/quai-moi/raiCa-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-4-danh.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: pole-vaults forward and slams the pole down. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C5. `docs/anh-goc/quai-moi/dong-tac/raiCa-5-trung-don.png`** · động tác 5-trung-don (4 khung)  
Gửi kèm: `docs/anh-goc/quai-moi/raiCa-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-5-trung-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 4 frames, poses follow the attached stick sheet: jerks back, eyes squeezed shut, then recovers. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C6. `docs/anh-goc/quai-moi/dong-tac/raiCa-6-chet.png`** · động tác 6-chet  
Gửi kèm: `docs/anh-goc/quai-moi/raiCa-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-6-chet.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: spins, drops the pole, flops down and fades out. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

#### Bầy Đỉa Trâu `diaTrau` — khung que `ran3`

**C7. `docs/anh-goc/quai-moi/dong-tac/diaTrau-1-dung.png`** · động tác 1-dung  
Gửi kèm: `docs/anh-goc/quai-moi/diaTrau-mau-moi.png`, `docs/anh-goc/quai-moi/que/ran3-1-dung.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: three leeches pulsing gently on the ground. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C8. `docs/anh-goc/quai-moi/dong-tac/diaTrau-2-di.png`** · động tác 2-di  
Gửi kèm: `docs/anh-goc/quai-moi/diaTrau-mau-moi.png`, `docs/anh-goc/quai-moi/que/ran3-2-di.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: three leeches inching forward in waves, low to the ground. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C9. `docs/anh-goc/quai-moi/dong-tac/diaTrau-3-bao-don.png`** · động tác 3-bao-don  
Gửi kèm: `docs/anh-goc/quai-moi/diaTrau-mau-moi.png`, `docs/anh-goc/quai-moi/que/ran3-3-bao-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: three leeches rear up, mouths open. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C10. `docs/anh-goc/quai-moi/dong-tac/diaTrau-4-danh.png`** · động tác 4-danh  
Gửi kèm: `docs/anh-goc/quai-moi/diaTrau-mau-moi.png`, `docs/anh-goc/quai-moi/que/ran3-4-danh.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: three leeches leap forward and latch on. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C11. `docs/anh-goc/quai-moi/dong-tac/diaTrau-5-trung-don.png`** · động tác 5-trung-don (4 khung)  
Gửi kèm: `docs/anh-goc/quai-moi/diaTrau-mau-moi.png`, `docs/anh-goc/quai-moi/que/ran3-5-trung-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 4 frames, poses follow the attached stick sheet: three leeches flinch and squash flat, then recover. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C12. `docs/anh-goc/quai-moi/dong-tac/diaTrau-6-chet.png`** · động tác 6-chet  
Gửi kèm: `docs/anh-goc/quai-moi/diaTrau-mau-moi.png`, `docs/anh-goc/quai-moi/que/ran3-6-chet.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: three leeches shrivel, curl up and fade out. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

#### Ba Ba Mai Đồng `baBa` — khung que `4chan`

**C13. `docs/anh-goc/quai-moi/dong-tac/baBa-1-dung.png`** · động tác 1-dung  
Gửi kèm: `docs/anh-goc/quai-moi/baBa-mau-moi.png`, `docs/anh-goc/quai-moi/que/4chan-1-dung.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: breathing slowly, head bobbing. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C14. `docs/anh-goc/quai-moi/dong-tac/baBa-2-di.png`** · động tác 2-di  
Gửi kèm: `docs/anh-goc/quai-moi/baBa-mau-moi.png`, `docs/anh-goc/quai-moi/que/4chan-2-di.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: crawling forward slowly, shell low. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C15. `docs/anh-goc/quai-moi/dong-tac/baBa-3-bao-don.png`** · động tác 3-bao-don  
Gửi kèm: `docs/anh-goc/quai-moi/baBa-mau-moi.png`, `docs/anh-goc/quai-moi/que/4chan-3-bao-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: pulls its head deep into the shell, eyes glowing. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C16. `docs/anh-goc/quai-moi/dong-tac/baBa-4-danh.png`** · động tác 4-danh  
Gửi kèm: `docs/anh-goc/quai-moi/baBa-mau-moi.png`, `docs/anh-goc/quai-moi/que/4chan-4-danh.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: shoots its long neck far forward and bites. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C17. `docs/anh-goc/quai-moi/dong-tac/baBa-5-trung-don.png`** · động tác 5-trung-don (4 khung)  
Gửi kèm: `docs/anh-goc/quai-moi/baBa-mau-moi.png`, `docs/anh-goc/quai-moi/que/4chan-5-trung-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 4 frames, poses follow the attached stick sheet: shell rattles, head ducks in, then peeks out. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C18. `docs/anh-goc/quai-moi/dong-tac/baBa-6-chet.png`** · động tác 6-chet  
Gửi kèm: `docs/anh-goc/quai-moi/baBa-mau-moi.png`, `docs/anh-goc/quai-moi/que/4chan-6-chet.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: flips over onto its back, legs wiggle, then fades out. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

#### Cóc Tía Phun Bọt `cocTia` — khung que `nam`

**C19. `docs/anh-goc/quai-moi/dong-tac/cocTia-1-dung.png`** · động tác 1-dung  
Gửi kèm: `docs/anh-goc/quai-moi/cocTia-mau-moi.png`, `docs/anh-goc/quai-moi/que/nam-1-dung.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: sitting, throat puffing in and out. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C20. `docs/anh-goc/quai-moi/dong-tac/cocTia-2-di.png`** · động tác 2-di  
Gửi kèm: `docs/anh-goc/quai-moi/cocTia-mau-moi.png`, `docs/anh-goc/quai-moi/que/nam-2-di.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: small hops forward with the lily pad. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C21. `docs/anh-goc/quai-moi/dong-tac/cocTia-3-bao-don.png`** · động tác 3-bao-don  
Gửi kèm: `docs/anh-goc/quai-moi/cocTia-mau-moi.png`, `docs/anh-goc/quai-moi/que/nam-3-bao-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: throat swells into a big bubble. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C22. `docs/anh-goc/quai-moi/dong-tac/cocTia-4-danh.png`** · động tác 4-danh  
Gửi kèm: `docs/anh-goc/quai-moi/cocTia-mau-moi.png`, `docs/anh-goc/quai-moi/que/nam-4-danh.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: spits three bubbles in an arc. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C23. `docs/anh-goc/quai-moi/dong-tac/cocTia-5-trung-don.png`** · động tác 5-trung-don (4 khung)  
Gửi kèm: `docs/anh-goc/quai-moi/cocTia-mau-moi.png`, `docs/anh-goc/quai-moi/que/nam-5-trung-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 4 frames, poses follow the attached stick sheet: squints and wobbles back, then recovers. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C24. `docs/anh-goc/quai-moi/dong-tac/cocTia-6-chet.png`** · động tác 6-chet  
Gửi kèm: `docs/anh-goc/quai-moi/cocTia-mau-moi.png`, `docs/anh-goc/quai-moi/que/nam-6-chet.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: deflates, rolls over on the lily pad, fades out. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

#### Rắn Nước Sọc `ranNuoc` — khung que `ran`

**C25. `docs/anh-goc/quai-moi/dong-tac/ranNuoc-1-dung.png`** · động tác 1-dung  
Gửi kèm: `docs/anh-goc/quai-moi/ranNuoc-mau-moi.png`, `docs/anh-goc/quai-moi/que/ran-1-dung.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: coiled, head raised, tongue flicking. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C26. `docs/anh-goc/quai-moi/dong-tac/ranNuoc-2-di.png`** · động tác 2-di  
Gửi kèm: `docs/anh-goc/quai-moi/ranNuoc-mau-moi.png`, `docs/anh-goc/quai-moi/que/ran-2-di.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: slithering forward in an S shape. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C27. `docs/anh-goc/quai-moi/dong-tac/ranNuoc-3-bao-don.png`** · động tác 3-bao-don  
Gửi kèm: `docs/anh-goc/quai-moi/ranNuoc-mau-moi.png`, `docs/anh-goc/quai-moi/que/ran-3-bao-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: pulls head back into a tight S, mouth opening. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C28. `docs/anh-goc/quai-moi/dong-tac/ranNuoc-4-danh.png`** · động tác 4-danh  
Gửi kèm: `docs/anh-goc/quai-moi/ranNuoc-mau-moi.png`, `docs/anh-goc/quai-moi/que/ran-4-danh.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: strikes forward fast and snaps. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C29. `docs/anh-goc/quai-moi/dong-tac/ranNuoc-5-trung-don.png`** · động tác 5-trung-don (4 khung)  
Gửi kèm: `docs/anh-goc/quai-moi/ranNuoc-mau-moi.png`, `docs/anh-goc/quai-moi/que/ran-5-trung-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 4 frames, poses follow the attached stick sheet: recoils, body kinks, then straightens. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C30. `docs/anh-goc/quai-moi/dong-tac/ranNuoc-6-chet.png`** · động tác 6-chet  
Gửi kèm: `docs/anh-goc/quai-moi/ranNuoc-mau-moi.png`, `docs/anh-goc/quai-moi/que/ran-6-chet.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: goes limp, uncoils flat and fades out. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

#### Ếch Phình Hơi `echPhinh` — khung que `tron`

**C31. `docs/anh-goc/quai-moi/dong-tac/echPhinh-1-dung.png`** · động tác 1-dung  
Gửi kèm: `docs/anh-goc/quai-moi/echPhinh-mau-moi.png`, `docs/anh-goc/quai-moi/que/tron-1-dung.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: sitting, belly puffing a little. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C32. `docs/anh-goc/quai-moi/dong-tac/echPhinh-2-di.png`** · động tác 2-di  
Gửi kèm: `docs/anh-goc/quai-moi/echPhinh-mau-moi.png`, `docs/anh-goc/quai-moi/que/tron-2-di.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: hopping forward. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C33. `docs/anh-goc/quai-moi/dong-tac/echPhinh-3-bao-don.png`** · động tác 3-bao-don  
Gửi kèm: `docs/anh-goc/quai-moi/echPhinh-mau-moi.png`, `docs/anh-goc/quai-moi/que/tron-3-bao-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: inflates into a big round balloon, blue spots glowing. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C34. `docs/anh-goc/quai-moi/dong-tac/echPhinh-4-danh.png`** · động tác 4-danh  
Gửi kèm: `docs/anh-goc/quai-moi/echPhinh-mau-moi.png`, `docs/anh-goc/quai-moi/que/tron-4-danh.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: bounces forward and bursts in a splash of icy water. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C35. `docs/anh-goc/quai-moi/dong-tac/echPhinh-5-trung-don.png`** · động tác 5-trung-don (4 khung)  
Gửi kèm: `docs/anh-goc/quai-moi/echPhinh-mau-moi.png`, `docs/anh-goc/quai-moi/que/tron-5-trung-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 4 frames, poses follow the attached stick sheet: deflates a bit and wobbles, then puffs back. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C36. `docs/anh-goc/quai-moi/dong-tac/echPhinh-6-chet.png`** · động tác 6-chet  
Gửi kèm: `docs/anh-goc/quai-moi/echPhinh-mau-moi.png`, `docs/anh-goc/quai-moi/que/tron-6-chet.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: pops flat like a pancake and fades out. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

#### Ma Da Tóc Rong `maDa` — khung que `2chan`

**C37. `docs/anh-goc/quai-moi/dong-tac/maDa-1-dung.png`** · động tác 1-dung  
Gửi kèm: `docs/anh-goc/quai-moi/maDa-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-1-dung.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: bobbing in place, hair dripping. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C38. `docs/anh-goc/quai-moi/dong-tac/maDa-2-di.png`** · động tác 2-di  
Gửi kèm: `docs/anh-goc/quai-moi/maDa-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-2-di.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: tiptoeing forward, gourd swinging. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C39. `docs/anh-goc/quai-moi/dong-tac/maDa-3-bao-don.png`** · động tác 3-bao-don  
Gửi kèm: `docs/anh-goc/quai-moi/maDa-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-3-bao-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: raises the gourd over its head, water swirling inside. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C40. `docs/anh-goc/quai-moi/dong-tac/maDa-4-danh.png`** · động tác 4-danh  
Gửi kèm: `docs/anh-goc/quai-moi/maDa-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-4-danh.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: throws the gourd forward. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C41. `docs/anh-goc/quai-moi/dong-tac/maDa-5-trung-don.png`** · động tác 5-trung-don (4 khung)  
Gửi kèm: `docs/anh-goc/quai-moi/maDa-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-5-trung-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 4 frames, poses follow the attached stick sheet: hair flies up, startled face, then settles. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C42. `docs/anh-goc/quai-moi/dong-tac/maDa-6-chet.png`** · động tác 6-chet  
Gửi kèm: `docs/anh-goc/quai-moi/maDa-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-6-chet.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: melts into a puddle with its hair, fades out. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

#### Trai Sông Gai `traiGai` — khung que `vo2`

**C43. `docs/anh-goc/quai-moi/dong-tac/traiGai-1-dung.png`** · động tác 1-dung  
Gửi kèm: `docs/anh-goc/quai-moi/traiGai-mau-moi.png`, `docs/anh-goc/quai-moi/que/vo2-1-dung.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: shell closed, breathing slightly open and shut. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C44. `docs/anh-goc/quai-moi/dong-tac/traiGai-2-di.png`** · động tác 2-di  
Gửi kèm: `docs/anh-goc/quai-moi/traiGai-mau-moi.png`, `docs/anh-goc/quai-moi/que/vo2-2-di.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: shuffling forward on a small foot. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C45. `docs/anh-goc/quai-moi/dong-tac/traiGai-3-bao-don.png`** · động tác 3-bao-don  
Gửi kèm: `docs/anh-goc/quai-moi/traiGai-mau-moi.png`, `docs/anh-goc/quai-moi/que/vo2-3-bao-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: shell opens wide, pearl glowing bright. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C46. `docs/anh-goc/quai-moi/dong-tac/traiGai-4-danh.png`** · động tác 4-danh  
Gửi kèm: `docs/anh-goc/quai-moi/traiGai-mau-moi.png`, `docs/anh-goc/quai-moi/que/vo2-4-danh.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: snaps open and shoots pearls forward. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C47. `docs/anh-goc/quai-moi/dong-tac/traiGai-5-trung-don.png`** · động tác 5-trung-don (4 khung)  
Gửi kèm: `docs/anh-goc/quai-moi/traiGai-mau-moi.png`, `docs/anh-goc/quai-moi/que/vo2-5-trung-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 4 frames, poses follow the attached stick sheet: shell clamps shut and shakes, then opens a little. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C48. `docs/anh-goc/quai-moi/dong-tac/traiGai-6-chet.png`** · động tác 6-chet  
Gửi kèm: `docs/anh-goc/quai-moi/traiGai-mau-moi.png`, `docs/anh-goc/quai-moi/que/vo2-6-chet.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: shell cracks open, pearl rolls out, fades out. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

#### Rái Cá Thủ Lĩnh (tinh anh) `raiCaChua` — khung que `2chan`

**C49. `docs/anh-goc/quai-moi/dong-tac/raiCaChua-1-dung.png`** · động tác 1-dung  
Gửi kèm: `docs/anh-goc/quai-moi/raiCaChua-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-1-dung.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: breathing, torch flickering, net on shoulder. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C50. `docs/anh-goc/quai-moi/dong-tac/raiCaChua-2-di.png`** · động tác 2-di  
Gửi kèm: `docs/anh-goc/quai-moi/raiCaChua-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-2-di.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: striding forward, torch held high. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C51. `docs/anh-goc/quai-moi/dong-tac/raiCaChua-3-bao-don.png`** · động tác 3-bao-don  
Gửi kèm: `docs/anh-goc/quai-moi/raiCaChua-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-3-bao-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: swings the net back over its head. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C52. `docs/anh-goc/quai-moi/dong-tac/raiCaChua-4-danh.png`** · động tác 4-danh  
Gửi kèm: `docs/anh-goc/quai-moi/raiCaChua-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-4-danh.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: throws the net forward then swings the torch down. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C53. `docs/anh-goc/quai-moi/dong-tac/raiCaChua-5-trung-don.png`** · động tác 5-trung-don (4 khung)  
Gửi kèm: `docs/anh-goc/quai-moi/raiCaChua-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-5-trung-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 4 frames, poses follow the attached stick sheet: staggers back, hat tilts, then fixes it. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C54. `docs/anh-goc/quai-moi/dong-tac/raiCaChua-6-chet.png`** · động tác 6-chet  
Gửi kèm: `docs/anh-goc/quai-moi/raiCaChua-mau-moi.png`, `docs/anh-goc/quai-moi/que/2chan-6-chet.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: drops the torch, falls on its back, fades out. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

#### Cóc Tía Chúa (tinh anh) `cocChua` — khung que `nam`

**C55. `docs/anh-goc/quai-moi/dong-tac/cocChua-1-dung.png`** · động tác 1-dung  
Gửi kèm: `docs/anh-goc/quai-moi/cocChua-mau-moi.png`, `docs/anh-goc/quai-moi/que/nam-1-dung.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: sitting, throat pulsing, crest shining. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C56. `docs/anh-goc/quai-moi/dong-tac/cocChua-2-di.png`** · động tác 2-di  
Gửi kèm: `docs/anh-goc/quai-moi/cocChua-mau-moi.png`, `docs/anh-goc/quai-moi/que/nam-2-di.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: heavy hops forward with the lotus leaf. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C57. `docs/anh-goc/quai-moi/dong-tac/cocChua-3-bao-don.png`** · động tác 3-bao-don  
Gửi kèm: `docs/anh-goc/quai-moi/cocChua-mau-moi.png`, `docs/anh-goc/quai-moi/que/nam-3-bao-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: leans back, mouth opening, tongue ready. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C58. `docs/anh-goc/quai-moi/dong-tac/cocChua-4-danh.png`** · động tác 4-danh  
Gửi kèm: `docs/anh-goc/quai-moi/cocChua-mau-moi.png`, `docs/anh-goc/quai-moi/que/nam-4-danh.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: shoots its long tongue straight forward and pulls back. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C59. `docs/anh-goc/quai-moi/dong-tac/cocChua-5-trung-don.png`** · động tác 5-trung-don (4 khung)  
Gửi kèm: `docs/anh-goc/quai-moi/cocChua-mau-moi.png`, `docs/anh-goc/quai-moi/que/nam-5-trung-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 4 frames, poses follow the attached stick sheet: flinches, eyes shut, belly wobbles. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C60. `docs/anh-goc/quai-moi/dong-tac/cocChua-6-chet.png`** · động tác 6-chet  
Gửi kèm: `docs/anh-goc/quai-moi/cocChua-mau-moi.png`, `docs/anh-goc/quai-moi/que/nam-6-chet.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: flops over, deflates, fades out. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

#### Cá Trê Râu Roi (trùm nhỏ) `caTre` — khung que `ca`

**C61. `docs/anh-goc/quai-moi/dong-tac/caTre-1-dung.png`** · động tác 1-dung  
Gửi kèm: `docs/anh-goc/quai-moi/caTre-mau-moi.png`, `docs/anh-goc/quai-moi/que/ca-1-dung.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: resting on the mud, whiskers swaying. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C62. `docs/anh-goc/quai-moi/dong-tac/caTre-2-di.png`** · động tác 2-di  
Gửi kèm: `docs/anh-goc/quai-moi/caTre-mau-moi.png`, `docs/anh-goc/quai-moi/que/ca-2-di.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: wriggling forward on its belly. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C63. `docs/anh-goc/quai-moi/dong-tac/caTre-3-bao-don.png`** · động tác 3-bao-don  
Gửi kèm: `docs/anh-goc/quai-moi/caTre-mau-moi.png`, `docs/anh-goc/quai-moi/que/ca-3-bao-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: lifts its head, whiskers raised like whips. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C64. `docs/anh-goc/quai-moi/dong-tac/caTre-4-danh.png`** · động tác 4-danh  
Gửi kèm: `docs/anh-goc/quai-moi/caTre-mau-moi.png`, `docs/anh-goc/quai-moi/que/ca-4-danh.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: lashes all four whiskers forward. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C65. `docs/anh-goc/quai-moi/dong-tac/caTre-5-trung-don.png`** · động tác 5-trung-don (4 khung)  
Gửi kèm: `docs/anh-goc/quai-moi/caTre-mau-moi.png`, `docs/anh-goc/quai-moi/que/ca-5-trung-don.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 4 frames, poses follow the attached stick sheet: jerks back, whiskers curl, then recovers. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C66. `docs/anh-goc/quai-moi/dong-tac/caTre-6-chet.png`** · động tác 6-chet  
Gửi kèm: `docs/anh-goc/quai-moi/caTre-mau-moi.png`, `docs/anh-goc/quai-moi/que/ca-6-chet.png`
```
Redraw the exact creature in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames, poses follow the attached stick sheet: rolls over, whiskers droop, sinks into mud and fades. Same size every frame, feet on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

#### Cá Trê pha 2 `caTre-p2` — 4 tấm (như trùm nhỏ cũ)

**C67. `docs/anh-goc/trum-moi/ca-tre/ca-tre-p2-1-dung.png`** · Cá Trê p2-1-dung  
Gửi kèm: `docs/anh-goc/trum-moi/ca-tre-p2.png`
```
Redraw the exact catfish in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames: resting angrily, whiskers twitching, mud bubbling. Same size every frame, belly on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C68. `docs/anh-goc/trum-moi/ca-tre/ca-tre-p2-2-bao-don.png`** · Cá Trê p2-2-bao-don  
Gửi kèm: `docs/anh-goc/trum-moi/ca-tre-p2.png`
```
Redraw the exact catfish in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames: rears up, glowing whiskers spread wide. Same size every frame, belly on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C69. `docs/anh-goc/trum-moi/ca-tre/ca-tre-p2-3-danh.png`** · Cá Trê p2-3-danh  
Gửi kèm: `docs/anh-goc/trum-moi/ca-tre-p2.png`
```
Redraw the exact catfish in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames: spins and lashes whiskers in a full circle. Same size every frame, belly on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C70. `docs/anh-goc/trum-moi/ca-tre/ca-tre-p2-4-trung-don.png`** · Cá Trê p2-4-trung-don  
Gửi kèm: `docs/anh-goc/trum-moi/ca-tre-p2.png`
```
Redraw the exact catfish in the attached image (same design and colors). Pixel art, side view facing right. One row of 4 frames: jerks back, eyes squeezed, then recovers. Same size every frame, belly on one ground line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

#### Thuồng Luồng `thuongLuong` — 15 tấm (pha 1: 6 · pha 2: 4 · pha 3: 5)

**C71. `docs/anh-goc/trum-moi/thuong-luong/thuong-luong-1-dung.png`** · Thuồng Luồng 1-dung  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p1.png`
```
Redraw the exact serpent in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames: coils swaying, head bobbing above the water. Same size every frame, waterline at the same height, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C72. `docs/anh-goc/trum-moi/thuong-luong/thuong-luong-2-di.png`** · Thuồng Luồng 2-di  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p1.png`
```
Redraw the exact serpent in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames: swimming forward, body rolling through the water. Same size every frame, waterline at the same height, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C73. `docs/anh-goc/trum-moi/thuong-luong/thuong-luong-3-bao-don.png`** · Thuồng Luồng 3-bao-don  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p1.png`
```
Redraw the exact serpent in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames: rears its head back, mouth opening, eyes flaring. Same size every frame, waterline at the same height, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C74. `docs/anh-goc/trum-moi/thuong-luong/thuong-luong-4-danh.png`** · Thuồng Luồng 4-danh  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p1.png`
```
Redraw the exact serpent in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames: lunges its head forward and bites down. Same size every frame, waterline at the same height, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C75. `docs/anh-goc/trum-moi/thuong-luong/thuong-luong-5-trung-don.png`** · Thuồng Luồng 5-trung-don  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p1.png`
```
Redraw the exact serpent in the attached image (same design and colors). Pixel art, side view facing right. One row of 4 frames: recoils, eyes squeezed, then rises again. Same size every frame, waterline at the same height, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C76. `docs/anh-goc/trum-moi/thuong-luong/thuong-luong-6-lan.png`** · Thuồng Luồng 6-lan  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p1.png`
```
Redraw the exact serpent in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames: dives down into the water until only ripples remain. Same size every frame, waterline at the same height, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C77. `docs/anh-goc/trum-moi/thuong-luong/thuong-luong-p2-1-dung.png`** · Thuồng Luồng p2-1-dung  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p2.png`
```
Redraw the exact serpent in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames: coils swaying, frost mist around. Same size every frame, waterline at the same height, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C78. `docs/anh-goc/trum-moi/thuong-luong/thuong-luong-p2-2-bao-don.png`** · Thuồng Luồng p2-2-bao-don  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p2.png`
```
Redraw the exact serpent in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames: rears back, icy breath gathering in the mouth. Same size every frame, waterline at the same height, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C79. `docs/anh-goc/trum-moi/thuong-luong/thuong-luong-p2-3-danh.png`** · Thuồng Luồng p2-3-danh  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p2.png`
```
Redraw the exact serpent in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames: lunges and bites, frost burst. Same size every frame, waterline at the same height, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C80. `docs/anh-goc/trum-moi/thuong-luong/thuong-luong-p2-4-trung-don.png`** · Thuồng Luồng p2-4-trung-don  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p2.png`
```
Redraw the exact serpent in the attached image (same design and colors). Pixel art, side view facing right. One row of 4 frames: recoils, frost cracks, then rises. Same size every frame, waterline at the same height, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C81. `docs/anh-goc/trum-moi/thuong-luong/thuong-luong-p3-1-dung.png`** · Thuồng Luồng p3-1-dung  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p3.png`
```
Redraw the exact serpent in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames: coils swaying, drum shard pulsing red. Same size every frame, waterline at the same height, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C82. `docs/anh-goc/trum-moi/thuong-luong/thuong-luong-p3-2-bao-don.png`** · Thuồng Luồng p3-2-bao-don  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p3.png`
```
Redraw the exact serpent in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames: rears high, drum shard blazing. Same size every frame, waterline at the same height, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C83. `docs/anh-goc/trum-moi/thuong-luong/thuong-luong-p3-3-danh.png`** · Thuồng Luồng p3-3-danh  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p3.png`
```
Redraw the exact serpent in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames: slams its head down, sparks fly. Same size every frame, waterline at the same height, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C84. `docs/anh-goc/trum-moi/thuong-luong/thuong-luong-p3-4-trung-don.png`** · Thuồng Luồng p3-4-trung-don  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p3.png`
```
Redraw the exact serpent in the attached image (same design and colors). Pixel art, side view facing right. One row of 4 frames: recoils, embers scatter, then rises. Same size every frame, waterline at the same height, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**C85. `docs/anh-goc/trum-moi/thuong-luong/thuong-luong-p3-5-bo-tron.png`** · Thuồng Luồng p3-5-bo-tron  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p3.png`
```
Redraw the exact serpent in the attached image (same design and colors). Pixel art, side view facing right. One row of 6 frames: spits out a small drum piece, grabs the big shining drum piece in its mouth, and dives away into the water. Same size every frame, waterline at the same height, frames far apart. Flat #00FF00 background, no text, no shadow.
```


### D. Nền phòng, sân trùm, cửa, trang trí, vật môi trường (5 tấm, nền hồng `#FF00FF`)

**D1. `docs/anh-goc/nen-phong/song-sau-9-mang.png`** · 9 mảng nền phòng (cắt ra `gd-nen-song-san0/1/2, san-nhan, ngoai, tuong-sau, tuong-truoc, mep, tuong-ben`)  
Gửi kèm: `docs/anh-goc/nen-phong/hang-bien-9-mang.png`, `docs/anh-goc/nen-phong/lau-dai-9-mang.png`
```
One 3:2 pixel-art sheet on flat #FF00FF, same layout and style as the attached sheets: a 3x3 grid of 9 separate tiles for a top-down tilted room in a dark Vietnamese river region at dusk. 1-3: seamless 64x64 floors (wet river pebbles / dark mud with puddles / old bamboo planks), 4: accent floor (lily pads on shallow water), 5: outside floor (deep dark green water), 6: back wall 64x49 (muddy riverbank with reeds and bamboo stakes), 7: front wall 64x12, 8: bottom edge 64x12 (reeds), 9: side wall 14x64. Seamless edges, muted moss-green and mud-brown, no bright lime green, no text.
```

**D2. `docs/anh-goc/nen-phong/song-sau-san-trum.png`** · sân Thuồng Luồng (4 mảng: nước sâu lặp, bờ đá ngang, bờ đá dọc, sàn đá giữa sông)  
Gửi kèm: `docs/anh-goc/nen-phong/song-sau-9-mang.png` (D1 đã duyệt), `docs/anh-goc/nen-phong/hang-bien-san-lien.png`
```
One square pixel-art sheet on flat #FF00FF, same style as the first attached sheet: a 2x2 grid of 4 separate 64x64 tiles seen from top-down tilted view: 1 seamless deep river water, black-green with faint ripples; 2 horizontal rocky shore edge (stone on top, water below); 3 vertical rocky shore edge; 4 seamless flat mossy river rock floor. No text.
```

**D3. `docs/anh-goc/nen-phong/song-sau-cua.png`** · 6 cửa (`gd-cua-song-tren/duoi/ben` mở và `-khoa`)  
Gửi kèm: `docs/anh-goc/vung-4/mau/cua-bien.png`, `docs/anh-goc/nen-phong/song-sau-9-mang.png`
```
One row of 6 pixel-art doors on flat #FF00FF, same sizes and layout as the first attached sheet, for the dark river region of the second sheet: top door, bottom door, side door OPEN, then the same three LOCKED. Doors are bamboo-and-rope river gates with a woven reed curtain; locked ones are barred with crossed wet logs and a bronze lock. Far apart, no text.
```

**D4. `docs/anh-goc/nen-phong/song-sau-trang-tri.png`** · ~14 món trang trí (`gd-tt-song-*`)  
Gửi kèm: `docs/anh-goc/2026-10-12/trang-tri-lau-dai.png`, `docs/anh-goc/nen-phong/song-sau-9-mang.png`
```
One pixel-art sheet on flat #FF00FF, same style as the first attached sheet, about 14 separate props for a dark Vietnamese river region, top-down tilted view, far apart: upside-down fishing boat, bamboo stakes, reed clump, big clay water jar, fishing net on poles, broken stilt-house corner, bamboo raft, mossy river boulder, small riverside shrine, round basket boat (thuyen thung), old stone stele, floating lotus leaves, driftwood log, small stone lantern. No text.
```

**D5. `docs/anh-goc/nen-phong/song-sau-moi-truong.png`** · vật môi trường (dòng chảy lặp 4 khung, cầu tre, lục bình nguyên / vỡ, đèn dầu cháy 4 khung / đổ, vũng nước sâu)  
Gửi kèm: `docs/anh-goc/nen-phong/song-sau-9-mang.png`, `docs/anh-goc/hieu-ung-ky-nang/vet-nhot.png`
```
One pixel-art sheet on flat #FF00FF, same style as the first attached sheet, top-down tilted view, items far apart in 4 rows. Row 1: 4 frames of a seamless 64x32 strip of flowing river water with white current arrows moving right. Row 2: a bamboo footbridge 64x24, and a clump of purple water hyacinth whole and smashed. Row 3: 4 frames of a hanging oil lamp burning, then the lamp knocked over. Row 4: a deep cold water puddle with white foam. No text.
```

### E. Hiệu ứng chiêu (13 tấm, nền xanh `#00FF00`)
Mọi tấm: dải khung xếp NGANG một hàng, cách xa nhau, nhìn từ trên chếch xuống, viền ngoài một nét tối `#14182e`. Gửi kèm ảnh mẫu
`docs/anh-goc/vung-4/mau/hieu-ung.png` (hiệu ứng cũ để bắt nét) + ảnh con quái liên quan.

**E1. `docs/anh-goc/hieu-ung-ky-nang/vung-4/hu-bot-doc.png`** · bọt độc Cóc Tía (bay rồi vỡ)  
Gửi kèm: `docs/anh-goc/vung-4/mau/hieu-ung.png`, `docs/anh-goc/quai-moi/cocTia-mau-moi.png`
```
Pixel art effect, one row of 6 frames far apart, flat #00FF00 background: a purple-green poison bubble about 12 px, frames 1-3 flying and wobbling, frames 4-6 popping into droplets. Dark outline #14182e, no text, no shadow.
```

**E2. `docs/anh-goc/hieu-ung-ky-nang/vung-4/hu-gon-nuoc.png`** · gợn nước khi lặn / trồi (Rắn Nước, Cá Trê, Thuồng Luồng)  
Gửi kèm: `docs/anh-goc/vung-4/mau/hieu-ung.png`
```
Pixel art effect, one row of 6 looping frames far apart, flat #00FF00 background, top-down view: a V-shaped ripple wake on dark water about 24 px wide moving right, small bubbles, frame 6 loops to frame 1. Dark outline #14182e, no text, no shadow.
```

**E3. `docs/anh-goc/hieu-ung-ky-nang/vung-4/hu-no-nuoc.png`** · Ếch Phình nổ nước lạnh  
Gửi kèm: `docs/anh-goc/vung-4/mau/hieu-ung.png`, `docs/anh-goc/quai-moi/echPhinh-mau-moi.png`
```
Pixel art effect, one row of 6 frames far apart, flat #00FF00 background: an icy blue water splash explosion about 40 px wide, burst, spray, then a fading ring of cold droplets. Dark outline #14182e, no text, no shadow.
```

**E4. `docs/anh-goc/hieu-ung-ky-nang/vung-4/hu-xoay-nuoc.png`** · xoáy nước (Ma Da nhỏ; Thuồng Luồng phóng to)  
Gửi kèm: `docs/anh-goc/vung-4/mau/hieu-ung.png`
```
Pixel art effect, one row of 8 looping frames far apart, flat #00FF00 background, top-down view: a flat oval whirlpool about 40x22 px, dark teal water spiraling inward with white foam lines, frame 8 loops to frame 1. Dark outline #14182e, no text, no shadow.
```

**E5. `docs/anh-goc/hieu-ung-ky-nang/vung-4/hu-dan-ngoc.png`** · ngọc trai bắn nảy  
Gửi kèm: `docs/anh-goc/vung-4/mau/hieu-ung.png`, `docs/anh-goc/quai-moi/traiGai-mau-moi.png`
```
Pixel art effect, one row of 4 frames far apart, flat #00FF00 background: a glowing white-pink pearl about 8 px spinning, with a small shine trail. Dark outline #14182e, no text, no shadow.
```

**E6. `docs/anh-goc/hieu-ung-ky-nang/vung-4/hu-dia-bam.png`** · đỉa bám chân em bé (dấu trạng thái nhỏ)  
Gửi kèm: `docs/anh-goc/quai-moi/diaTrau-mau-moi.png`
```
Pixel art effect, one row of 4 looping frames far apart, flat #00FF00 background: two tiny dark-olive leeches about 8 px wiggling as if stuck to an ankle, no character drawn. Dark outline #14182e, no text, no shadow.
```

**E7. `docs/anh-goc/hieu-ung-ky-nang/vung-4/hu-luoi-chai.png`** · lưới chài Rái Cá Thủ Lĩnh  
Gửi kèm: `docs/anh-goc/vung-4/mau/hieu-ung.png`, `docs/anh-goc/quai-moi/raiCaChua-mau-moi.png`
```
Pixel art effect, one row of 6 frames far apart, flat #00FF00 background, top-down view: a round fishing cast net about 44 px, frames 1-3 spreading open in the air, frames 4-6 lying flat on the ground with lead weights, slowly fading. Dark outline #14182e, no text, no shadow.
```

**E8. `docs/anh-goc/hieu-ung-ky-nang/vung-4/hu-bun-phun.png`** · bùn phụt (Cá Trê phun bùn và cột bùn chống mép)  
Gửi kèm: `docs/anh-goc/vung-4/mau/hieu-ung.png`, `docs/anh-goc/quai-moi/caTre-mau-moi.png`
```
Pixel art effect, one row of 6 frames far apart, flat #00FF00 background: a column of brown mud bursting up from the ground about 20 px wide, splashing, then falling into a mud puddle. Dark outline #14182e, no text, no shadow.
```

**E9. `docs/anh-goc/trum-moi/hieu-ung/hu-duoi-tl.png`** · đuôi Thuồng Luồng trồi lên quét  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p1.png`
```
Pixel art effect, one row of 6 frames far apart, flat #00FF00 background: the tail of the attached serpent rising out of dark water, sweeping sideways with a big water spray, then sinking back. Same colors as the serpent. Dark outline, no text, no shadow.
```

**E10. `docs/anh-goc/trum-moi/hieu-ung/hu-vong-than.png`** · khúc thân trồi thành vòm  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p1.png`
```
Pixel art effect, one row of 6 frames far apart, flat #00FF00 background: one coil of the attached serpent's body rising out of the ground as an arch about 48 px wide, holding, then squeezing tight and sinking with splashes. Same colors as the serpent. No text, no shadow.
```

**E11. `docs/anh-goc/trum-moi/hieu-ung/hu-tia-nuoc-den.png`** · tia nước đen  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p1.png`, `docs/anh-goc/vung-4/mau/hieu-ung.png`
```
Pixel art effect, one row of 6 frames far apart, flat #00FF00 background: a straight horizontal jet of black-green poison water about 80 px long, starting thin, full blast, then breaking into drips. Dark outline #14182e, no text, no shadow.
```

**E12. `docs/anh-goc/trum-moi/hieu-ung/hu-song-bo.png`** · sóng tạt bờ (chống đứng sát mép)  
Gửi kèm: `docs/anh-goc/vung-4/mau/hieu-ung.png`
```
Pixel art effect, one row of 6 frames far apart, flat #00FF00 background, top-down view: a long low wave about 64x20 px crashing onto a shore, white foam curling then draining away. Dark outline #14182e, no text, no shadow.
```

**E13. `docs/anh-goc/trum-moi/hieu-ung/hu-manh-dong-roi.png`** · mảnh trống đồng nóng rơi  
Gửi kèm: `docs/anh-goc/trum-moi/thuong-luong-p3.png`, `docs/anh-goc/truyen/b2b-bong-duoi-song.png`
```
Pixel art effect, one row of 6 frames far apart, flat #00FF00 background: a red-hot bronze drum fragment about 18 px with engraved patterns, frames 1-2 falling, frame 3 impact with sparks, frames 4-6 lying on the ground glowing and cooling. Dark outline #14182e, no text, no shadow.
```

### F. Giao diện, cảnh truyện, Bé Sen (6 ảnh)

**F1. `docs/anh-goc/nen-phong/ban-do-chon-ai-v4.png`** · bản đồ vùng thêm Sông sâu (thay `gd-ban-do-vung`)  
Gửi kèm: `docs/anh-goc/nen-phong/ban-do-chon-ai.png`
```
Redraw the attached pixel-art world map exactly, same size and style, but clear the fog from the river valley upstream of the waterfall on the left and show a new region there: a dark winding deep river with reeds, a ruined fishing village on stilts and a misty whirlpool. Keep the other locked areas as they are. No text.
```

**F2. `docs/anh-goc/truyen/b7-thuong-luong-bo-tron.png`** · cảnh kết vùng 4 (16:9)  
Gửi kèm: `docs/anh-goc/truyen/b2b-bong-duoi-song.png`, `docs/anh-goc/trum-moi/thuong-luong-p3.png`
```
Same painting style as the first attached image, 16:9. Night river: the giant serpent from the second image swims away upstream with a big glowing bronze sun-shaped drum piece in its mouth, leaving a small drum piece with flying Lac birds floating near the shore. Far away a dark mountain is struck by lightning. No text.
```

**F3. `docs/anh-goc/npc-moi/em-be-sen-mau.png`** · Bé Sen ảnh mẫu  
Gửi kèm: `docs/anh-goc/npc-moi/em-cai-bong-mau.png`
```
Same pixel-art style and size as the attached child. A little Vietnamese girl, daughter of a ferryman: short hair with a lotus-pink ribbon, brown ao ba ba, rolled-up trousers, barefoot, holding a small paddle. Side view facing right, full body. Flat #00FF00 background, no text, no shadow.
```

**F4. `docs/anh-goc/npc-moi/em-be-sen-1-dung.png`** · Bé Sen đứng (6 khung)  
Gửi kèm: `docs/anh-goc/npc-moi/em-be-sen-mau.png`, `docs/anh-goc/npc-moi/em-cai-bong-1-dung.png`
```
Redraw the exact girl in the first attached image, same poses as the second attached sheet: one row of 6 frames standing idle, breathing, swinging the paddle a little. Same size every frame, feet on one line, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**F5. `docs/anh-goc/npc-moi/em-be-sen-2-ngoi.png`** · Bé Sen ngồi ở bến (6 khung)  
Gửi kèm: `docs/anh-goc/npc-moi/em-be-sen-mau.png`, `docs/anh-goc/npc-moi/em-cai-bong-2-ngoi.png`
```
Redraw the exact girl in the first attached image, same poses as the second attached sheet: one row of 6 frames sitting, swinging her feet, paddle on her lap. Same size every frame, frames far apart. Flat #00FF00 background, no text, no shadow.
```

**F6. `docs/anh-goc/giao-dien/vp-vung-4.png`** · biểu tượng mảnh trống thứ 4 (+ nguyên liệu mới nếu Q2 chọn B)  
Gửi kèm: `docs/anh-goc/vung-4/mau/icon-manh.png`
```
Same pixel-art icon style and size as the attached icons, on flat #00FF00, far apart: 1) a bronze drum rim fragment engraved with flying Lac birds; 2) a dark green river serpent scale with a teal shine. No text, no shadow.
```

**Tổng: A 15 + C 85 + D 5 + E 13 + F 6 = 124 ảnh.** Nếu thiếu thời gian, cắt theo thứ tự: E6 (vẽ code), F1 (thêm biểu tượng lên bản đồ cũ), F4–F5 (Bé Sen vẽ bằng code như dân làng).

---

## 5. Chia việc code (mỗi bước 1 phiên)

Nguyên tắc: **mọi thứ của vùng 4 nằm sau cờ `G.VUNG4`** (`?vung4=0` → game y hệt hôm nay: 3 vùng, bản đồ cũ). Mỗi phiên có cờ quay lui riêng,
chạy `game/tests` liên quan + `python3 game/build.py --hai-tep`, ghi `bao-cao.md` trong `docs/review/ke-hoach-cai-thien/vung-4-<phiên>/`.
Phiên song song không cùng sửa một tệp (bảng dưới ghi rõ). Không phiên nào sửa ảnh/quái/trùm của 3 vùng cũ.

| Phiên | Làm gì | Tệp chính | Cờ quay lui | Cần ảnh | Chạy song song với |
|---|---|---|---|---|---|
| **0** | Khung que mới `ran`, `ran3`, `vo2`; xuất ảnh mẫu từ game (`docs/anh-goc/vung-4/mau/`); thêm vùng `song` vào trang cắt ảnh `tools/tach-quai`, `tools/tach-phong`, `tools/tach-hieu-ung`, `tools/xuong-sprite` | `docs/anh-goc/quai-moi/que/que5.py`, `tools/*` | (không đụng game) | — | chủ game gen nhóm A |
| **1** | **Khung vùng 4 chạy được bằng hình tạm**: thêm vùng thứ 4 vào bảng vùng, mở rộng mọi chỗ đang "cứng 3 vùng / 15 ải" (danh sách ở mục 8), bản đồ có nút vùng 4, quái vùng 4 tạm dùng hình code đổi màu, lưu bản / lưu mây / bảng vàng nhận 20 ải. **Làm một mình, trước các phiên khác.** | `data.js`, `engine.js`, `village.js`, `village_scene.js`, `upgrade.js`, `vk_moi.js`, `ep_do.js`, `stage.js`, `mobs.js`, `nhac.js`, `truyen.js` (chỉ chỗ đếm vùng), `sprite_custom.js`, `cloud.js`, `bang_vang.js`, `hanh_trang.js`, `build.py`, `firebase/linhkhi.rules`, `tests/*` | `?vung4=0` | — | không |
| **2A** | 8 quái thường + kỹ năng riêng (bảng `SO`, lời mẹo `MEO`), dựng sprite từ tấm động tác (script `dung-song.py` theo `dung-lau.py`) | `monster_art.js`, `ky_nang_quai.js`, `game/art/custom/<mã>.sprite.json`, `docs/review/.../vung-4-quai/cong-cu/` | `?kynangcu=1` (sẵn có) + `?vung4=0` | A, C (8 con), E1–E6 | 2B, 2C |
| **2B** | Nền vùng + luật riêng: theme phòng thứ 4, mảng nền, cửa, trang trí, dòng chảy + cầu tre, lục bình, nước sâu, đèn dầu; bố cục dải dòng chảy trong phòng | `room_art.js`, `env_art.js`, `stage.js` (chỗ đặt vật), `art/custom/gd-*-song-*` | `?dongchay=0` (tắt dòng chảy), `?vung4=0` | D1–D5 | 2A, 2C |
| **2C** | Truyện + bản đồ + làng: `MO_VUNG[3]`, `VUNG_MOI[3]`, lời trùm, 7 câu người làng, Bé Sen ở bến (ảnh F3–F5 hoặc vẽ code), cảnh b7, bản đồ mới, nhạc vùng 4 (`B.vung3` vẽ bằng code như 3 bài cũ), từ điển tiếng Anh | `truyen.js`, `village_scene.js` (chỉ phần Bé Sen + ảnh bản đồ), `nhac.js` (chỉ bài mới), `ngon_ngu_en.js` + `tools/ngon-ngu/tu-dien/*` | `?truyencu=1` (sẵn có), `?vung4=0` | F1–F5 | 2A, 2B |
| **3A** | 2 tinh anh + trùm nhỏ Cá Trê (2 pha, chống mép) | `boss.js` (khối mini), `chieu_trum.js`, `monster_art.js` (chỉ def 3 con) | `?vung4=0` | A, C (3 con + Cá Trê p2), E7, E8 | 3B |
| **3B** | Thuồng Luồng pha 1 + sân bãi đá giữa sông + vỗ sóng bờ + đổi hệ theo pha (khung) | `boss.js` (khối `thuong`), `chieu_trum.js`, `env_art.js` (sân trùm), `combat.js` (nếu cần đổi hệ giữa trận) | `?vung4=0`; `?tldoihe=0` (một hệ Độc suốt trận) | A, C (TL p1), D2, E9–E12 | 3A |
| **3C** | Thuồng Luồng pha 2, 3, cảnh bỏ trốn, lời trùm đổi pha, sao thứ ba theo pha 3 | như 3B | như 3B | C (TL p2, p3), E2, E4, E13 | không (sau 3B) |
| **4** | **Cân bằng bằng bot**: số máu / sát thương 5 ải mới, sức mạnh khuyên dùng, độ khó 2, kinh nghiệm, rơi đồ (vàng, quặng, đá, linh khí, mảnh trùm), ải ngày bậc 4 (nếu chọn) | `data.js` (bảng số), `tests/cay.py`, `tools/can-bang/tinh.js` | `?cbv4cu=1` (số xuất phát) | — | — |
| **5** | Đóng gói + dung lượng + soát toàn vùng (ảnh soát, gif), dọn | `build.py`, `tests/*` | — | — | — |

Thứ tự thời gian gợi ý: **0** (song song chủ game gen A) → chủ game duyệt A → **1** (song song gen C) → **2A · 2B · 2C** → **3A · 3B** → **3C** → **4** → **5** → chủ game chơi thử.

**Cân bằng (phiên 4) — cách đo**: dùng bot cũ `tests/cay.py --node --kd=4` mở rộng 15 → 20 ải.
- *Khuyên dùng*: lấy Sức mạnh bot thắng ~75% ở từng ải (như đợt 5), dãy phải tăng dần từ 3-5 (520).
- *Cày*: mỗi ải vùng 4 bot không cày tối đa ~7 lượt, tổng thời gian vùng 4 ≈ vùng 3 (± 25%).
- *Kinh nghiệm*: cấp 30 → 40 trong vùng 4 (cấp hiện tối đa 40). **Kiểm**: cấp 40 + đồ tốt nhất có với tới khuyên dùng 4-5 không — nếu không thì Q3.
- *Rơi đồ*: thêm phần tử thứ 4 cho các bảng rơi (`ROI_MOI`, `EP_DO.roi`), vàng/quặng theo đường tăng của 3 vùng cũ; bot đo lại kinh tế (như bước 2).
- *Số xuất phát* (bot sửa sau): máu quái 390 → 520, sát thương gốc 24 → 30; hệ số ải `[1,3; 3,0]`; khuyên dùng `[540, 565, 595, 630, 690]`; độ khó 2 ×1,1 máu ×1,15 sát thương.

## 6. Dung lượng dự kiến

Hiện tại (báo cáo gần nhất): **người chơi tải 15,30 MB / trần 20 MB** (ảnh WebP, tải theo vùng: ảnh vùng chỉ tải khi chọn vùng đó).
| Phần thêm | Ước tính (WebP) | Căn cứ |
|---|---|---|
| 8 quái + 2 tinh anh | +0,7 MB | quái mới Hang biển +0,69 MB |
| Cá Trê 2 pha | +0,4 MB | trùm nhỏ cũ 0,7–1 MB PNG |
| Thuồng Luồng 3 pha | +1,3 MB | trùm vùng cũ 0,8–1,5 MB PNG mỗi pha |
| Nền, cửa, trang trí, môi trường | +0,2 MB | gd-nen/cua/tt Lâu đài 0,16 MB |
| Hiệu ứng 13 tấm | +0,3 MB | |
| Bản đồ, Bé Sen, biểu tượng, cảnh b7 | +0,3 MB | ảnh truyện tải lười |
| **Cộng** | **≈ +3,2 MB → ~18,5 MB / 20 MB** | |

- Người chơi chỉ tải phần vùng 4 khi chọn vùng 4 (luồng tải theo vùng sẵn có, phiên 1 mở rộng cho vùng 4).
- **Rủi ro**: còn ~1,5 MB cho vùng 5. Cách giảm khi cần: Thuồng Luồng 48 → 32 màu; bỏ tấm sheet cũ `-cu` khỏi gói tải; WebP chất lượng thấp hơn cho tấm trúng đòn.
- **Bản một tệp** (`dist/artifact.html`) đang **28,8 / 30 MB** → thêm vùng 4 sẽ vượt (~34 MB). Xem Q9.

## 7. Câu hỏi cần chủ game quyết
(Chữ **in đậm** là đề xuất.)

1. **Hệ của Thuồng Luồng**: **A. đổi hệ theo pha Độc → Băng → Lửa** (dạy đổi vũ khí) · B. một hệ Độc suốt trận (đơn giản hơn).
2. **Nguyên liệu vùng 4**: **A. không thêm nguyên liệu mới**, vùng 4 rơi cả 3 loại cũ (ít rủi ro bản lưu) · B. thêm "Vảy Thuồng Luồng" (phải sửa lò rèn, bản lưu, thêm biểu tượng).
3. **Trần cấp hero 40**: **A. giữ 40, chờ bot phiên 4 đo**; nếu không với tới thì nâng 45 · B. nâng 50 ngay.
4. **Ma Da** (dân gian là ma kéo chân người dưới sông): **A. giữ, vẽ ngộ nghĩnh, đòn là "ném bầu nước"** · B. đổi tên "Thủy Yêu Tóc Rong".
5. **Bé Sen về làng mở gì**: **A. không mở chức năng mới, chỉ ngồi ở bến** (vùng 5 mở thú đồng hành) · B. mở thêm bình máu thứ 4.
6. **Trang phục Cu Tí vùng 4** (`zed-song`): **A. để sau** (đỡ ~0,3 MB và ~10 ảnh) · B. làm cùng vùng 4.
7. **Bản đồ**: **A. vẽ lại ảnh bản đồ (F1)** · B. giữ ảnh cũ, thêm nút vùng 4 vẽ bằng code.
8. **Độ khó 2 vùng 4**: **A. mở khi hạ Thuồng Luồng** (Độ khó 2 ba vùng cũ vẫn mở khi hạ Hồ Tinh như hôm nay — người chơi cũ không mất gì) · B. mở cùng lúc với vùng cũ.
9. **Bản một tệp (artifact.html) vượt 30 MB**: **A. bản một tệp chỉ chứa 3 vùng cũ, vùng 4 chỉ có ở bản web** · B. nâng trần lên 36 MB.
10. **Cảnh truyện**: **A. 1 cảnh mới (b7)** · B. thêm b8 Núi Sét ngay bây giờ.
11. **Ải ngày (bước 2)** thêm bậc vùng 4: **A. có, sau khi cân bằng xong** · B. không.
12. **Tên 5 ải** (Bến đò hoang, Đầm lục bình, Làng chài bỏ hoang, Thác ngầm, Vực Thuồng Luồng): **A. dùng, hiện trên bản đồ** · B. không hiện tên ải.

---

## 8. Phần kỹ thuật (cho phiên code)

### 8.1 Chỗ đang cứng "3 vùng / 15 ải" (phiên 1 phải sửa hết; soát bằng grep, số dòng lúc lập kế hoạch)
- **`data.js`**: `G.REGIONS` (thêm vùng `{ name: 'Sông sâu', el: 'poison', boss: 'thuong', bossName: 'Thuồng Luồng', mini: 'Cá Trê', rescue: null, … }` —
  `rescue` của 3 hero đã dùng hết; `engine.js:423`, `stage.js:483/504` đã có chặn khi `rescue` rỗng); `G.MOB_ART` (thêm phần tử thứ 4 cho mọi vai, `elite`,
  `mini`, `boss.thuong`); `HP_RANGE`, `DMG_RANGE`, `G.DIFF2`, `G.DIFF2_REC` (+1); `G.STAGE_K.mob/boss`, `G.STAGE_REC` (15 → 20); `G.BOSS_HP_OF`;
  `G.ROI_MOI` (`vk.vang`, `vk.lk`, `ruong.lk`, `ao.vang`, `aoTrum.vang`); `G.EP_DO.roi` (`mini`, `miniDau`, `vung`, `vungDau`); `G.LK_THUA_MAT`
  (Q2 = A: không thêm; hệ Độc → nguyên liệu 0 như cũ); `G.AI_NGAY.muc` (Q11); khối số chiêu trùm mới (cạnh `mocQuat`, `nguRiu`…); `G.NOI_GIAN.chieu` thêm khoá chiêu Thuồng Luồng.
- **`engine.js:356-360` `arr3`** cắt mảng `mats/shards` về 3 phần tử khi sửa bản lưu → nếu Q2 = B **phải** đổi theo số vùng, nếu không mất nguyên liệu thứ 4. `engine.js:298` bản lưu mới.
- **`village.js`** 30/31/37/38/111/129/140/164/404 (`r<3`, `i<3`); 102/120 `stars.length < 15` mở Độ khó 2 → **giữ điều kiện "hạ Hồ Tinh"** (đổi thành kiểm `stars['2-4']`), không đổi thành 20 (Q8);
  132 đường nối bản đồ (`r===2`) → thêm nối vùng 4 từ trùm vùng 3.
- **`village_scene.js` 1199-1213 `VS.MAP`**: thêm hàng 5 nút vùng 4, `from`, `names`, `bossLab`; bỏ một ô "sắp có" (`soon`) chỗ vùng 4; 1272 biểu tượng trùm;
  1143-1144 thanh tài nguyên `mat0-2/shard0-2` (thêm `shard3`).
- **`upgrade.js`** 21/81/97/102/108-110/214/220; **`vk_moi.js`** 100/128 (`kep(r,0,2)`)/350/352/410-411; **`ep_do.js`** 127/149/154; **`hanh_trang.js`** 245.
- **`stage.js`** 190 (màu nổ theo vùng), 397 (`clamp(S.r,0,2)`); 1400 đã dùng `REGIONS.length`.
- **`mobs.js:93`** `clamp(w.region,0,2)` → `REGIONS.length-1` (nếu không, vùng 4 lặng lẽ dùng quái vùng 3).
- **`nhac.js`** 163-178 bài `B.vung0..2` + 254 `clamp(S.r,0,2)`.
- **`truyen.js`** 113 `soVung` (`n<3`), 120 `clamp(t.v,0,3)` → 0..4, 407 `Math.min(3,…)`, 457 `'mini'+clamp(S.r,0,2)`; 382 `KET` gắn với `r===2` → **giữ** (đoạn kết Hồ Tinh đã móc vào vùng 4), thêm khối vùng 4 riêng;
  người chơi cũ có `t.v = 3` không bị chiếu lại gì; thêm `MO_VUNG` (chiếu khi chạm vùng 4 lần đầu, khoá mới `t.mv`).
- **`sprite_custom.js`** (tải theo vùng) 1586 `moVung=[0,0,0]`, 1606 `Math.min(2,r)`, 1617, 1673 `k<=2`, 1677 `r>2`, 1715 `choVung` kẹp 0..2.
- **`build.py`** 200 `TRUM_VUNG` (+`thuongLuong`), 242 `thu_tu_sau` (+`song: 6`), 318 `VUNG_SO` (+`song: 3`), 324 `VUNG_TEN_GD` (+`song: 3`), 331 regex `gd-(nen|cua|tt)-(rung|bien|lau|song)-`, 459-461 nhóm báo cáo.
- **`cloud.js:15`** `BOSSES` (+`thuong`); **`firebase/linhkhi.rules`** 27 `hasOnly(... 'b_thuong')`, 31 `far <= 20`, 33 `stars <= 120`, 37/42 `okBoss` → **phải triển khai lại luật Firestore**, nếu không bảng vàng từ chối ghi.
  **`bang_vang.js`** 135/143 chia cột theo 3 trùm.
- **Hình vẽ code dự phòng** (`art.js` 423/427/1197/1457/3011, `env_art.js` `TH[3]` 117 + nhánh `R.reg===…`, `room_art.js` 1347 `THEMES` + 1353 `ma:'song'` + 1238 `DECOR` + 1560 `FG`):
  thêm bản thứ 4; chú ý `room_art.js:1710` `THEMES[W.region] || Castle` đang **lặng lẽ** dùng Lâu đài khi thiếu theme → đổi thành báo lỗi trong bài kiểm.
- **`monster_art.js`** `def(..., { vung: 'song' })`, 1494 `TT`, 1331 bảng nổ theo vùng. **`ky_nang_quai.js`** thêm 8 khoá vào `SO` + `MEO`.
- **`boss.js`** 49 `SPEED`, khối chiêu `SK.thuong` + `mini3`, 70/575-589/675-684 nhánh riêng `ho/moc`; **`chieu_trum.js`** 694-698 bảng chiêu mới; **`combat.js`** 1032/1102 (đổi hệ giữa trận: `b.el` đổi theo pha, biểu tượng hệ trên thanh máu).
- **Bài kiểm** cứng 15 ải / 3 vùng: `cay.py` 44/176/233/259, `cd_lib.py:212`, `campaign.py`, `au_tien_trien.py` 49/69, `may_luat.test.js` 64-73, `may.py` 162/324,
  `quai.py`, `quai_shots.py:9`, `au_hinh.py:18`, `au_pha_trum*.py`, `balance.py:39`, `dps.py:37`, `do_roi.py:11`, `quai_tam.py:8`, `env_rooms.py`, `chitiet_shots.py` …;
  **`tools/can-bang/tinh.js`** 8/143/221/226/289.

### 8.2 Bản lưu và tương thích
- Khoá sao `"3-0" … "3-4"` (vùng chỉ số 3) là khoá mới, bản lưu cũ không có → không đụng gì cũ. Không đổi cách đăng nhập, lưu mây giữ đủ trường.
- `G.save.truyen`: thêm `mv` (đã xem mở vùng 4), `v` cho phép tới 4. Bản lưu cũ `v = 3` giữ nguyên.
- Thứ tự mở khoá: vùng 4 mở khi hạ Hồ Tinh (`stars['2-4']`), như vùng 3 mở khi hạ Ngư Tinh.

### 8.3 Đổi hệ theo pha (Q1 = A) — gợi ý cài
- `b.el` của trùm đặt theo pha khi đổi pha (`'poison' → 'ice' → 'fire'`); bảng thích nghi tính kháng trên hệ của pha **cộng** lớp thích nghi cũ.
- Bóng trùm ở suối hồi hiện **3 màu** xếp chồng (báo trước cả 3 pha). Sao thứ ba: đòn kết liễu mang hệ Băng.
- Bot phiên 4 đo riêng "người chơi chỉ dùng 1 hệ" để chắc trận vẫn qua được (chậm hơn, không bế tắc).

### 8.4 Dựng ảnh
- Quái: chép `docs/review/ke-hoach-cai-thien/quai-moi-lau/cong-cu/dung-lau.py` → `dung-song.py` (`--ghi`, `--chi <mã>`); cắt bằng `docs/anh-goc/zed/cat-diem-anh.py`
  (`--cat-tay` khi khung dính nhau); chuẩn cỡ theo thân; 32 màu (48 nếu cần); `vung: 'song'`.
- Trùm: chép `docs/review/ke-hoach-cai-thien/trum-moi/cong-cu/dung-trum-nho.py` (Cá Trê), `dung-ngu-tinh.py` (Thuồng Luồng — cũng là trùm "trong nước"), `dung-hieu-ung-trum.py`.
- Nền: `trum-moi/cong-cu/cat-nen-bien-lau.py` (thêm `song`) hoặc trang `tools/tach-phong` sau phiên 0. Hiệu ứng: `hieu-ung-ky-nang/cong-cu/dung-hieu-ung.py`.
- Cảnh truyện: `tools/anh-truyen/dung.py` (thêm khoá `ANH.b7`).
- Mọi phiên dựng ảnh: ghi "người chơi tải" trước/sau trong `bao-cao.md`.
