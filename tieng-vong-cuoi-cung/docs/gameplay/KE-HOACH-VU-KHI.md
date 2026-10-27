# Kế hoạch 4 vũ khí + tiến trình nâng cấp – BẢN SỬA THEO PHẢN HỒI 2 + PHẢN HỒI 3 (27/10/2026)

Trả lời `docs/gameplay/YEU-CAU-KE-HOACH-VU-KHI.md`. **Chưa sửa code, chưa publish.** Mọi con số là **số để thử, chưa cân bằng**.
Chưa chơi thử trên iPhone thật: nhận xét về cảm ứng là suy luận từ code, phải kiểm lại trên máy.

**Trạng thái duyệt (theo `PHAN-HOI-2-KE-HOACH-VU-KHI.md`, gọi tắt PH2):** duyệt hướng 4 vũ khí và 8 cấp, mốc 1/3/6/8. Duyệt **prototype Âm Đao cấp 1–4 sau P0-A**. Chưa duyệt triển khai toàn bộ hệ thống. Bản này đã sửa đủ 14 điểm ở PH2 mục 5 – xem bảng **"Đã sửa theo phản hồi 2"** ở cuối file.

Đọc cùng **`KE-HOACH-GAMEPLAY-V2.md`** (gọi tắt **KHGP2**, bản rút gọn theo PH1; bản cũ `KE-HOACH-GAMEPLAY.md` = **KHGP** chỉ giữ để đối chiếu) và `PHAN-HOI-1-KE-HOACH-GAMEPLAY.md` (**PH1**). Công thức sát thương, luật Thế và giao diện dữ liệu chung được chốt **một chỗ ở KHGP2 mục 5–6**; mục 5 ở đây là phần riêng của vũ khí và phải khớp KHGP2.

Thuật ngữ (giống KHGP):
- **tick**: một bước mô phỏng, 60 tick = 1 giây (1 tick ≈ 16,7 ms).
- **hộp đòn**: vùng vô hình gây sát thương, tính riêng, không đọc từ ảnh.
- **hitstop**: game khựng vài tick khi trúng.
- **Thế**: thanh "đứng vững" của địch (KHGP mục 1). Cạn thì địch choáng.
- **[máu, Thế]**: một đòn trừ bao nhiêu máu và bao nhiêu Thế.
- **mốc**: cấp mở kỹ năng / hành vi mới. **cấp thường**: chỉ tăng sức mạnh.
- **chí mạng**: một nhát được nhân thêm sát thương (máu).

Hai hình minh hoạ vẽ bằng code, đúng tỉ lệ px logic:
- `vu-khi-tam-danh.png`: tầm đánh của 4 vũ khí, đặt cạnh Lam 112 px và Chuông Gỗ 72×108.
- `vu-khi-nhip-danh.png`: nhịp đánh thường và kỹ năng, đếm bằng tick.

---

## 1. Điều đã xác minh trong code và điều đang giả định

Số dòng theo nhánh `tieng-vong-cuoi-cung`, commit `d3181a6`. `game/demo.html` không đổi từ commit `93014ae`, nên số dòng trùng KHGP. Không ghi tên file thì là `game/demo.html`.

### 1a. Đã xác minh

| Điều | Code làm gì | Chỗ |
|---|---|---|
| Nhịp cố định | 60 tick/s, tối đa 4 tick mỗi khung hình. Mọi thời gian trong kế hoạch này đếm bằng tick nên không phụ thuộc FPS | `DT`, `MAX_STEPS`, `loop()` 2200–2216 |
| Chỉ có **1 vũ khí** | Bộ đòn `ATK[1..6]`: combo đất 1–3, chém nảy 4, chém hất 5, chém trên không 6. Mỗi đòn có `su/ac/re` (chuẩn bị / hộp bật / thu), hitstop `hs`, hộp `box [dx,dy,w,h]` tính từ chân | `ATK` 260–267 |
| Hộp đòn tách ảnh | `atkBox()` chỉ đọc `ATK.box`, chỉ có **hộp chữ nhật** | `atkBox` 676–682 |
| Chọn đòn | trên không + xuống = nảy; trên không = 6; đất + lên = hất; còn lại = 1. Nối combo khi `atkT ≥ su+ac` | `updatePlayer()` 786–792 |
| Lướt hủy đòn | Lướt đặt `pl.atkN=0` bất cứ lúc nào | 713–716 |
| **Đọc được "đang giữ nút"** | `I[k]` là trạng thái đang giữ (bàn phím + cảm ứng), `pressed(k)` là vừa bấm. Nên làm được "giữ Chém" mà không đổi cách đọc phím | `readInput` 532, `pressed` 533, `onTouch` 545–574 |
| Bấm Chém | `pressed('a')` → `atkBuf = 8` tick | `step()` 1298 |
| Nút cảm ứng | 4 nút hình thoi trong khung 176×176 (×`--k`): Vọng trên, Chém trái, Lướt phải, Nhảy dưới. **Góc trên-trái và trên-phải của khung đang trống.** Chạm được gán cho nút **gần nhất** trong bán kính 1,2 × r | CSS `#acts` 53, `#b-v` 58, `#b-a` 61, `#b-s` 62, `#b-j` 63; `onTouch` 557 |
| Sát thương là **số nguyên rất nhỏ** | Quái máu 3, boss 18. Một nhát trừ 1, Cộng hưởng trừ 3. Không có chỗ cho "+15 %" | `mkQuai` 610, `boss` 616, `strike()` 935 |
| Đánh nhiều mục tiêu | `applyHits()` duyệt mọi quái + boss chồng lên hộp → một hộp trúng nhiều con được | `applyHits` 964–969 |
| Chống trúng lặp: **1 ô nhớ** | Mỗi mục tiêu chỉ nhớ **mã nhát cuối** của Lam (`swP`) và của bóng (`swE`). Nếu sau này có 2 hộp của Lam cùng sống (xích đang bay + một nhát khác) thì hộp này ghi đè ô nhớ của hộp kia, và xích có thể trúng lại | `strike()` 918 |
| Hitstop không cộng dồn | Mọi chỗ gán đều `Math.max`; trong hitstop mô phỏng (cả bóng) đứng yên | `step()` 1303; `strike()` 930, 947; `resonance()` 951 |
| Cộng hưởng | Lam và bóng trúng cùng mục tiêu cách ≤ 12 tick → ×3, hitstop 8. Đếm bằng `S.frame` | `strike()` 920–922, 935; `resonance()` 950–963 |
| Bóng ghi gì | Mỗi tick ghi **trạng thái** (vị trí, khung, hộp đòn tuyệt đối, số đòn, mã nhát) **của riêng hộp cận chiến**. Không ghi phím, không có chỗ cho đạn / xích | `recordFrame` 898–902; `REC` 310; `step()` 1313 |
| Bóng gây sát thương | Phát lại đúng hộp đã ghi ở toạ độ cũ, trừ 1 máu như Lam | `updateEcho` 903–912; `step()` 1315 |
| Không có đạn / triệu hồi của Lam | Thứ duy nhất "bay" là sóng và mảnh trần của boss, và chúng chỉ đánh Lam | `WAVES` 619, `updateHazards` 1186–1194 |
| **Không có lưu game** | `localStorage` chỉ giữ tắt tiếng (`tv-demo-mute`) và cỡ nút (`tv-demo-btn`). Chuông lưu `S.cp` chỉ nằm trong bộ nhớ. Tải lại trang = chơi lại | 448, 514, 588, 2071; `S.cp` 643, 1222 |
| HUD | Góc trái trên: 5 chuông máu + thanh Vọng + vòng Cộng hưởng ×n. Ảnh "mảnh chuông (tiền)" **đã tách sẵn trong atlas HUD**, chưa dùng | `veHUD` 1680–1693; `game/kiem-thu-lang-hoan-thien/GHI-CHU.md` dòng 36 |
| Thợ Rèn Hòn đã có trong làng | NPC ở Sân chuông (x 2448), có động tác gõ búa và hộp thoại | `game/kiem-thu-lang-hoan-thien/GHI-CHU.md` dòng 40 |
| Lam trong game | Vẫn là **rig-v4**, vẽ bằng sheet đã nướng sẵn | dòng 220–239 |
| Lam mới (`thu-lam-moi`) | Rig **13 mảnh**. **Dao là mảnh con của găng gần** và vẽ **dưới** găng gần để tay che chuôi. Mới có đứng / chạy / chém 1. Mũi dao xa nhất **68,5 px**, mép hộp đòn 95 → thiếu 26,5 px (câu hỏi 1 của ghi chú đó) | `art/huong-moi/lam-rig/lam-chuong-tan.json` (`manh.dao.cha = gang-gan`, `thu_tu_ve`); `game/thu-lam-moi/GHI-CHU.md` mục 4–5 |
| Chi phí ảnh của Lam mới | Sheet nướng sẵn: chém 1 = 26 khung = **8,03 MB bộ nhớ ảnh ước tính** (rộng × cao × 4 byte, không phải số đo RAM Safari); đứng 9,76; chạy 5,55. Tức khoảng **0,3 MB mỗi khung** | `art/huong-moi/lam-rig/so-lieu.json` → `sheet` |
| Vẽ trực tiếp từ mảnh rẻ hơn nhiều (ước tính cùng cách) | Boss: vẽ từ mảnh ≈ 16 MB, sheet 2x ≈ 406 MB. Quái/boss trong game đang vẽ từ mảnh | `game/thu-boss/GHI-CHU.md` mục 1, 3; `game/runtime/quai-boss-runtime.js` `maTran` 113, vẽ 131–140 |
| Khung hình đòn khớp hộp đòn bằng bảng | Mỗi đòn có `khung_theo_atkT` (atk1/atk2: 26 phần tử, atk3: 34) và `vet_chem.bat_dau = 10`. Ghi chú code: "khung TRÚNG bắt đầu đúng atkT = su". Đổi `su` 11 → 7/7/9 thì **phải cắt bảng này**, nếu không hình chém trễ hơn hộp đòn | `art/modular/lam-moi/hanh-dong/sprite/lam-hanh-dong-2x.json` → `atk1..3`; `demo.html` 827, 848, 1307 |
| GDD | Có 6 "Chuông" vũ khí, Đồng Cổ để rèn, Thợ Rèn Hòn, Âm Phù có dòng ngẫu nhiên. **Phần ngẫu nhiên và độ hiếm đi ngược yêu cầu lần này** → kế hoạch này không dùng | `docs/gdd.md` mục 6–7 |
| Hướng mỹ thuật | Teal = Vọng / ký ức. Vàng đồng = chuông. Cam đỏ = nguy hiểm. Dao "ngà xám, vàng chỉ ở chắn tay" | `art/huong-moi/TU-VAN-CHUYEN-GIA-2-CO-TICH-CHUONG-TAN.md` mục 2, 3 |

### 1b. Giả định (chưa kiểm được)

| Giả định | Cách kiểm |
|---|---|
| Một lần chạm thường giữ dưới ~12 tick trên iPhone, nên ngưỡng "giữ" 20 tick không ra nhầm kỹ năng | Log thời gian giữ của mỗi lần chạm Chém trong phòng thử, 3 người |
| Ngón cái giữ Chém 20–24 tick không thấy "ì" vì nhát 1 vẫn ra ngay | Hỏi người thử + log |
| iPhone chịu được thêm 1 lớp vũ khí vẽ trực tiếp + đạn/xích/Vệ Hồn ở 60 tick/s | Nút "Chép số" trên máy thật (thời gian khung). Bộ nhớ chỉ báo **ước tính** từ cỡ ảnh đã nạp, không khẳng định RAM Safari (mục 9a) |
| KHGP P0-A (bấm chờ 1 nhát, `su` 7/7/9, Thế cho quái gác) được làm như PH1 mục 1–2. Tỷ lệ sát thương bóng và lượng Thế Cộng hưởng của tinh anh/boss **chưa chốt** (PH1 mục 3–5) | Kế hoạch này để chúng thành **biến cấu hình**, không gắn số cứng. Kết quả thử P0-B đổi số ở mục 5 |
| Nút đổi vũ khí nhỏ ở góc trên-trái khung nút không bị chạm nhầm | Thử trên iPhone (mục 7) |

### 1c. Chỗ đụng KHGP – đề xuất sửa

| # | Đề xuất sửa KHGP mục … | Vì sao |
|---|---|---|
| S1 | **Đã chốt ở PH1 mục 2–3**: prototype Vọng quá khứ tên **"Vọng Chiến"** (bấm 1 lần, cấu hình B chọn trước khi vào phòng), bỏ chạm đúp. "Dư Âm" chỉ dành cho Âm Đao | Kế hoạch này chỉ cần: Vọng Chiến ghi cùng các trường mới của bản ghi (mục 5d) |
| S2 | **Mục C, 6, I#7: bỏ Búa Chuông Nứt** | Yêu cầu mới bỏ Chùy/Búa. Việc phá Thế chia cho Liềm (dấu vỡ) và Xích (Hồi Chấn) |
| S3 | **Mục 3 (đòn nặng giữ–thả) → "giữ Chém = kỹ năng của vũ khí đang cầm" – CHỈ LÀ PHƯƠNG ÁN THỬ** (PH2 mục 1, 5.2) | Nhát 1 ra ngay khi bấm, giữ tiếp mới tụ. Chưa chốt cho cả 4 món trước khi thử cảm ứng. Luật nhả nút trong lúc đòn thường chưa xong: mục 7a. Phương án dự phòng: nút kỹ năng riêng |
| S4 | **Mục 6: "Dao Giữ Chuông" = Âm Đao cấp 1** | Cùng bộ đòn `ATK[1..6]`. Chỉ thay mảnh dao bằng lưỡi âm thoa và thêm âm nhận. Không tốn clip mới |
| S5 | **Mục F: nhân máu và Thế ×10** (Chuông Gỗ 4 → 40, quái gác 3/6 → 30/60…; bộ quái mới theo KHGP2) | Cần chỗ cho tăng 15–25 % mỗi cấp, và cho **sát thương phụ của bóng** (PH1 mục 3) không bị làm tròn về 0. Số nguyên vẫn đủ |
| S6 | **Mục 4 "không thêm nút thứ năm": cho phép 1 nút phụ đổi vũ khí** (nhỏ, chỉ hiện khi mang 2 vũ khí) | Yêu cầu mới muốn đổi bằng một nút. Nút này không phải nút chiến đấu (mục 7) |
| S7 | **Mục 4 "không proc vô hạn": thay ô nhớ `swP/swE` bằng danh sách "đã trúng" gắn theo từng hộp đòn** | Bắt buộc khi có xích / âm cầu / Vệ Hồn sống cùng lúc với nhát chém (xem 1a) |
| S8 | **Mục 9: Ấn Rèn I đến TRƯỚC boss** (tinh anh / nhiệm vụ Thợ Rèn). Boss thưởng **Xích Chuông + rương Đồng Vụn** (thay "Búa ở P2") | PH2 mục 2: kỹ năng đặc trưng phải xuất hiện trước boss đầu (mục 6b) |

Theo PH1 (không còn là đề xuất của KHGP): bóng **có sát thương phụ thấp** (không phải 0); Cộng hưởng **chỉ phá ngay vỏ cứng**, tinh anh/boss nhận lượng Thế lớn có bảo vệ chống chuỗi choáng; phạm vi chia P0-A/B/C. Tất cả đã đưa vào KHGP2.
Không đổi: thanh Thế + 2 cờ `vo`/`mat`, né sát đòn (P1), khóa Cộng hưởng 45 tick mỗi mục tiêu, ghi chủ động miễn phí, Âm Phù Dư Chấn / Tàn Ảnh / Bóng Chắn.

---

## 2. Bản sắc, ưu/nhược và vòng đánh

### 2a. Phản biện trước khi chốt

| Vấn đề | Ở đâu | Xử lý đề xuất |
|---|---|---|
| **Trùng tên + trùng ý** | Dư Âm (Âm Đao) và "Dư Âm" chạm đúp V (KHGP cũ) đều là "đòn lặp lại" | Tên đã tách ở PH1: bên Vọng là Vọng Chiến (S1). Phân biệt bằng luật: Dư Âm của Âm Đao **chỉ là vết chém**, không có thân, vang **1 lần sau 24 tick**, **không** kích Cộng hưởng. Bóng là thân Lam phát lại cả đoạn |
| **Trùng ý** | Vệ Hồn (Trượng) và bóng Tiếng Vọng đều là "đồng minh ma" | Vệ Hồn màu **đồng tàn**, không teal. Hình người giữ chuông xưa, không phải Lam. Chỉ làm **1 động tác định sẵn**. Không công tắc, không Cộng hưởng, không bị đánh |
| **Ba cách phá Thế chồng nhau** | Cộng hưởng, dấu vỡ (Liềm), Hồi Chấn (Xích) | Mỗi cách một việc. **Cộng hưởng**: vỡ ngay 1 mục tiêu. **Dấu vỡ**: trừ nhiều Thế trên cả nhóm, nhưng không vỡ ngay một mình. **Hồi Chấn**: trừ Thế từ xa, an toàn nhưng phải giữ |
| **Hai vũ khí tầm xa** | Xích và Trượng | **Xích**: nhanh, thẳng, đi rồi về, trúng theo tuyến, Lam đứng neo. **Trượng**: chậm, nổ vùng nhỏ, Lam đi lại tự do |
| **Gần trùng tên** | "Hồi Chấn" (Xích) và Âm Phù "Dư Chấn" | Giữ tên. Biểu tượng khác hẳn (xích giật / sóng tròn). Nếu người thử lẫn thì đổi tên Xích thành "Giật Hồi" |
| **Vệ Hồn chặn đạn** trùng Âm Phù Bóng Chắn (KHGP P1) | | Không cho Vệ Hồn chặn đạn. Mốc 6 của Trượng là **chọn chỗ hiện**, không phải chắn |
| **Tốn công nhất** | Trượng: cần nhân vật mới (Vệ Hồn) + đạn. Xích: vẽ xích, đạn có trạng thái, va tường, kéo địch | Làm cuối (Trượng) và thứ hai (Xích). Bản đầu Vệ Hồn dùng lại rig NPC Thợ Rèn tô màu hồn (mục 9) |
| **Khó trên cảm ứng** | Ngắm xích. Kích dấu đúng con. Đặt Vệ Hồn | Xích chỉ bắn **theo hướng mặt** (cần gạt lên dốc ≥ 0,7 = chéo lên). Dấu vỡ bằng **bất kỳ nhát Liềm nào** trúng con có dấu. Vệ Hồn hiện **cố định trước mặt** (mốc 6: tại âm cầu) |
| **Bấm Chém liên tục với Xích** | Nếu "bấm lại khi xích đang bay = thu về" thì người bấm dồn sẽ không bao giờ phóng hết tầm | Không dùng "bấm lại". Hồi Chấn = **giữ** khi phóng, **thả** để giật. Bấm dồn chỉ phóng thường |
| **Kỹ năng trên không** | Mỗi kỹ năng trên không = thêm clip | Bản đầu **kỹ năng chỉ dùng trên đất** (trên không: giữ Chém không làm gì, nhả = không có gì) |

### 2b. Luật chung cho cả 4 vũ khí

- **Chạm Chém = đánh thường. Giữ Chém = kỹ năng của vũ khí đang cầm** (phương án thử, xem S3 và mục 7a). Bản thử không thêm nút kỹ năng.
- Nhát đầu **luôn ra ngay lúc chạm**. Không có độ trễ chờ phân biệt chạm hay giữ.
- Một vũ khí = **1 bộ đánh thường + 1 kỹ năng**. Các mốc sau chỉ phát triển kỹ năng đó hoặc thêm 1 passive / cách tương tác.
- Kỹ năng dùng **thời gian hồi** (đếm tick, vẽ thành vòng quanh biểu tượng vũ khí trên HUD). Không có thanh tài nguyên mới. Nấc Vọng chỉ dành cho Tiếng Vọng.

### 2c. Bảng so sánh

Số ở cấp 1, thang ×10. Xem `vu-khi-tam-danh.png` và `vu-khi-nhip-danh.png`.

| | **Âm Đao** | **Xích Chuông** | **Liềm Chuông** | **Trượng Vọng** |
|---|---|---|---|---|
| Hình | Kiếm âm thoa, lưỡi 2 nhánh ngà xám | Chuông đồng nhỏ ở đầu xích | Lưỡi liềm cong, gốc là nửa chuông nứt | Trượng gỗ, đầu treo chuông nhỏ |
| Vai trò | Linh hoạt, bám mục tiêu, sát thương trực tiếp | Kiểm soát khoảng cách, đánh theo tuyến | Đánh nhóm, chuẩn bị rồi thu hoạch | Hỗ trợ, triệu hồi, áp lực gián tiếp |
| Đánh thường | Combo 3 + hất + trên không + nảy (= `ATK[1..6]`) | Phóng thẳng 196 px rồi thu về | 2 nhát quét cung 150° | Âm cầu bay chậm, nổ nhỏ |
| Nhịp (1 lần bấm) | 23 tick | 46 tick | 34 / 36 tick | 24 tick (cầu bay riêng) |
| Tầm | ~90 px (lưỡi 68 + âm nhận) | 196 px | bán kính 112 px | 260 px |
| [máu, Thế] | [10,10] / [10,10] / [10,30] | đi [12,10], về [6,5] | [14,10] / [16,20] | nổ [8,5] |
| Kỹ năng | **Dư Âm**: chém, vết vang lại sau 24 tick | **Hồi Chấn**: giữ để treo, thả để giật về mạnh | **Thu Âm**: quét đặt dấu, nhát sau làm dấu vỡ | **Chiêu Hồn**: Vệ Hồn hiện, nện, tan |
| Chí mạng | Ngẫu nhiên 5 % (chỉ vũ khí này) | Điểm ngọt cuối tầm (chắc chắn) | Mũi liềm (chắc chắn) | Không có |
| Ưu | Nhanh, hủy bằng lướt mọi lúc, có pogo, đánh trên không tốt | An toàn, xuyên hàng, kéo địch hạng nhẹ | Trúng nhiều con, trừ Thế nhóm | Đánh từ xa, Lam tự do di chuyển |
| Nhược (giữ lại khi nâng) | Ít Thế, phải đứng gần | Rủi ro nằm ở **thời gian thu + hồi đòn**: hụt là trống tay tới khi xích về. Phóng thường **vẫn đi, nhảy, lướt được** (số giảm tốc chưa chốt). Hạn chế mạnh (đứng neo, không nhảy) **chỉ khi chủ động giữ Chuông Treo**; không pogo | Chậm; không hủy được khi hộp đang bật; đi ×0,5 khi vung; pogo yếu | Sát thương thấp; cầu chậm; không pogo; Vệ Hồn hồi lâu |
| Với bóng | Bóng chém nhiều nhát nhanh → dễ Cộng hưởng | Bóng phóng xích theo đúng tuyến đã ghi | Hộp quét to → bóng dễ trúng | Bóng bắn lại âm cầu (đúng quỹ đạo) |

### 2d. Vòng đánh của từng vũ khí

**Âm Đao.** Áp sát, combo 1-2-3. Nhát 3 trừ Thế. Lướt né rồi vào lại.
Khi có Dư Âm: giữ Chém để chém một nhát vang, lùi ra né. Vết vang lại đúng lúc địch bước vào.
Vết **sinh theo lần dùng kỹ năng**, kể cả khi nhát chém vang hụt (đặt bẫy trước). Đánh thường **không bao giờ** sinh vết.
Âm nhận là phần lưỡi bằng âm, nối dài **+30 %** (68 → ~90 px). **Chỉ sáng trong 8 tick hộp đòn bật**, màu ngà sáng viền đồng (không teal). Mép sáng trùng mép hộp đòn → "thấy trúng mới trúng".
Điều này cũng trả lời câu hỏi 1 trong `thu-lam-moi/GHI-CHU.md`: không cần thu hộp còn 66, vì phần thiếu chính là âm nhận nhìn thấy được. Đổi duy nhất: mép trước hộp 95 → 90.
Không đòn thường nào thành đạn bay.

**Xích Chuông.** Đứng ở tầm 150–200, phóng xích lúc địch lấy đà.
Lượt đi trúng mỗi con 1 lần, lượt về thêm 1 lần nhẹ và kéo địch **hạng nhẹ** lại 32 px. Kéo không ngắt đòn đã vào (đúng luật KHGP mục C).
Có kéo được hay không tính theo **trọng lượng / kháng kéo** của loại địch (bảng ở mục 3, phần Xích), không theo lượng máu. Địch không bị kéo vẫn nhận [máu, Thế]. Chạm tường thì xích dừng và về.
Rủi ro đặt ở **thời gian thu và hồi đòn**: hụt là trống tay khoảng 30 tick tới khi xích về.
Trong lúc phóng thường, Lam **vẫn đi, nhảy và lướt** (có thể giảm tốc nhẹ – số thử, chưa chốt). Lướt thì xích thu về ngay, không gây sát thương, khóa phóng ngắn.
Hạn chế mạnh (đứng neo, không nhảy) **chỉ áp khi chủ động giữ Chuông Treo** (Hồi Chấn / mốc 6). Đó là lựa chọn của người chơi, nên rủi ro có chủ đích.

**Liềm Chuông.** Đứng cạnh nhóm, quét. Mũi liềm (vành ngoài) đánh mạnh hơn, nên giữ khoảng cách vừa đủ.
Khi có Thu Âm: giữ để quét đặt dấu lên cả nhóm, rồi nhát thường làm từng dấu vỡ.
Không hủy được khi hộp đang bật, nên phải chọn lúc vung.

**Trượng Vọng.** Giữ khoảng cách, bắn âm cầu vào đường địch đi tới.
Cầu sinh ở đầu trượng (36 px trước Lam), nên địch sát mặt bị nổ ngay. Không cần đòn cận chiến riêng.
Khi có Chiêu Hồn: đặt Vệ Hồn chắn ở chỗ địch sẽ đến, nó nện một lần rồi tan. Lam lo né.

---

## 3. Bảng tiến trình riêng từng vũ khí

**Đơn vị**: ĐV = **Đồng Vụn** (vật liệu thường). **Ấn I/II/III** = Ấn Rèn (quyền mở mốc, dùng chung cho mọi vũ khí, mục 6).
Giá ĐV giống nhau cho cả 4 vũ khí: cấp 2: 6 · 3: 8 · 4: 10 · 5: 12 · 6: 14 · 7: 16 · 8: 18 (tổng 84).
**Ngoại hình**: chỉ 3 bậc. Bậc 1 = cấp 1–5, bậc 2 = cấp 6–7, bậc 3 = cấp 8. Mỗi bậc chỉ đổi **mảnh vũ khí** (thêm khắc sáng / viền đồng) + màu vệt đòn đậm hơn.
"MỐC" in đậm = có phản hồi lớn: Thợ Rèn gõ búa (đã có), banner tên kỹ năng, âm 2 nốt, lần đầu dùng hiện 1 dòng gợi ý.

### Âm Đao (vũ khí khởi đầu)

| Cấp | Điều kiện / chi phí | Tăng chỉ số hoặc mở | Thay đổi khi chơi | Asset cần thêm |
|---|---|---|---|---|
| **1 – MỐC** | Có sẵn | Đánh thường `ATK[1..6]`, âm nhận +30 %. Chí mạng 5 % ×1,5 | Như dao hiện tại, tầm thấy rõ | Mảnh lưỡi âm thoa bậc 1. Dải âm nhận vẽ bằng code |
| 2 | 6 ĐV | Sát thương đánh thường **+20 %** (10 → 12) | Với quái thường **có thể không đổi số nhát** (Chuông Gỗ 40 vẫn 4 nhát). Thấy rõ ở tinh anh (160 máu: 16 → 14 nhát) và địch có máu trong 31–36. Xem bảng 4b | – |
| **3 – MỐC** | 8 ĐV + Ấn I (**có trước boss đầu**, mục 6b) | **Mở Dư Âm** (giữ ≥ 20 tick → thả): chém [15,20]; **mỗi lần dùng** đặt 1 vết ở chỗ hộp chém vang (kể cả chém hụt), sau 24 tick vết vang [10,10]. Hồi 150 tick | Có đòn "đánh rồi lùi": vết vang lúc địch đuổi theo | Clip tụ (lặp) + chém vang. VFX vết Dư Âm (ảnh gen, ngà sáng). Âm "vang" |
| 4 | 10 ĐV | Vết vang **[10,10] → [16,20]** | Dư Âm thành đòn đáng tính | – |
| 5 | 12 ĐV | Chí mạng **5 → 12 %** | **Điểm phụ**, không phải bước tăng lớn: sát thương trung bình chỉ +3,4 % (×1,025 → ×1,06). Nếu thử thấy nhạt, đổi sang "nhát 3 Thế 30 → 40" | – |
| **6 – MỐC** | 14 ĐV + Ấn II | **Bước Vang**: lướt xuyên qua vết đang treo → vết vang ngay, sát thương ×1,5, hoàn lại thời gian hồi lướt | Lướt vừa né vừa kích đòn. Không cần nút mới | Ngoại hình bậc 2. Vết vang to hơn (dùng lại ảnh, phóng 1,3) |
| 7 | 16 ĐV | Hồi Dư Âm **150 → 110 tick** | Dùng được 2 lần mỗi lượt giao tranh dài | – |
| **8 – MỐC** | 18 ĐV + Ấn III | **Trọn Tiếng**: vết vang **2 lần** (lần 2 = ½ sát thương, cách 18 tick) | Một vết khóa được một lối đi ngắn | Ngoại hình bậc 3. Âm nhận sáng hơn (**không tăng tầm**) |

### Xích Chuông

| Cấp | Điều kiện / chi phí | Tăng chỉ số hoặc mở | Thay đổi khi chơi | Asset cần thêm |
|---|---|---|---|---|
| **1 – MỐC** | **Thưởng boss Chuông Gác Làng** (mục 6b) | Phóng 196 px; đi [12,10], về [6,5]; lượt về kéo địch **hạng nhẹ** 32 px; điểm ngọt 20 % cuối tầm ×1,5 | Đánh từ xa, phải canh điểm ngọt | Mảnh chuông đầu xích bậc 1, 1 mắt xích (lặp bằng code). Clip phóng, phóng trên không, bắt xích |
| 2 | 6 ĐV | Lượt đi **+25 %** (12 → 15) | Phóng trúng cả đi lẫn về: 21/lần thay vì 18 → Chuông Gỗ 40 hết sau 2 lần phóng thay vì 3 | – |
| **3 – MỐC** | 8 ĐV + Ấn I | **Mở Hồi Chấn**: giữ khi phóng → chuông treo ở đầu tối đa 40 tick; thả → giật về 24 px/tick, lượt về [18,25], kéo **hạng nhẹ** về sát Lam, **hạng vừa** 32 px. Trong lúc giữ: Lam đứng neo, không nhảy (hạn chế mạnh chỉ ở đây). Hồi 90 tick | Chọn đúng lúc thả để kéo quái vào combo | Clip giữ xích (lặp) + giật. VFX xích căng sáng. Âm giật |
| 4 | 10 ĐV | Hồi Chấn **[18,25] → [24,35]** | Phá Thế từ xa đáng giá | – |
| 5 | 12 ĐV | Điểm ngọt rộng **20 → 30 %** cuối tầm | Dễ trúng điểm ngọt hơn | – |
| **6 – MỐC** | 14 ĐV + Ấn II | **Chuông Treo**: khi treo, chuông ngân mỗi 12 tick [0,6] lên địch trong 48 px (máu 0 là 0) | Giữ lâu = mài Thế từ xa, nhưng Lam đứng neo, không nhảy (rủi ro do người chơi chọn) | Ngoại hình bậc 2. Vòng sóng nhỏ quanh chuông (vẽ code) |
| 7 | 16 ĐV | Hồi Hồi Chấn **90 → 60 tick** | Dùng gần như mỗi lần phóng | – |
| **8 – MỐC** | 18 ĐV + Ấn III | **Xích Trọn**: tầm **196 → 230** (+17 %), Hồi Chấn kéo **hạng vừa** về sát Lam (hạng nặng / neo vẫn không bị kéo) | Hoàn thiện vai "kéo về" | Ngoại hình bậc 3. Thiết kế màn: kiểm hành lang dài ≥ 230 px |

**Trọng lượng / kháng kéo** (thay giới hạn "máu ≤ 60" cũ). Mỗi loại địch có một trường `nang` trong dữ liệu loại quái (KHGP2 mục 6):

| Hạng | Ví dụ (KHGP2, bộ quái) | Phóng thường (lượt về) | Hồi Chấn | Hồi Chấn cấp 8 |
|---|---|---|---|---|
| nhẹ | Dơi Rễ | kéo 32 px | kéo về sát Lam | kéo về sát Lam |
| vừa | Chuông Gỗ, Phu Đèn Lạc | không kéo | kéo 32 px | kéo về sát Lam |
| nặng | Bọ Vỏ Mộc, tinh anh | không kéo | không kéo | không kéo |
| neo | Nấm Thở (cắm gốc), quái gác, boss | không kéo | không kéo | không kéo |

Không bị kéo vẫn nhận đủ [máu, Thế] của lượt đó, nên Xích vẫn có ích với địch nặng (phá Thế từ xa).

### Liềm Chuông

| Cấp | Điều kiện / chi phí | Tăng chỉ số hoặc mở | Thay đổi khi chơi | Asset cần thêm |
|---|---|---|---|---|
| **1 – MỐC** | Nhặt ở vùng 3 (đề xuất Hồ Ngầm) | 2 nhát quét [14,10] / [16,20]; mũi liềm ×1,5; quét lên; quét trên không (nảy yếu ×0,7) | Đánh nhóm chậm, phải chọn lúc vung | Mảnh liềm bậc 1. Clip quét 1, quét 2, quét lên, quét trên không |
| 2 | 6 ĐV | Đánh thường **+25 %** | Nhóm 3 quái nhỏ chết sau 3 vòng quét | – |
| **3 – MỐC** | 8 ĐV + Ấn I | **Mở Thu Âm** (giữ ≥ 24 → thả): quét 200° [10,10] + đặt Dấu Chuông Nứt (1 dấu/mục tiêu, giữ 360 tick). Nhát Liềm thường trúng con có dấu (dấu đã ≥ 20 tick) → **dấu vỡ** [20,30]. Hồi 180 | Nhịp "đặt – thu hoạch" | Clip tụ + Thu Âm. Ảnh gen dấu chuông nứt 3 trạng thái (đặt / sáng / vỡ). Âm "choang" nhỏ |
| 4 | 10 ĐV | Dấu vỡ **[20,30] → [28,45]** | Dấu vỡ thành nguồn phá Thế chính | – |
| 5 | 12 ĐV | Mũi liềm **×1,5 → ×1,8** | Thưởng giữ đúng khoảng cách | – |
| **6 – MỐC** | 14 ĐV + Ấn II | **Vỡ Lan**: dấu vỡ lan chấn động 80 px [0,15] lên địch xung quanh (không kích dấu khác). **Thu hoạch**: hạ địch mang dấu → hồi Thu Âm −60 tick (tối đa 1 lần / 60 tick) | Đánh nhóm thật sự | Ngoại hình bậc 2. Vòng chấn (dùng lại ảnh `cong-huong` tô đồng, như KHGP mục G) |
| 7 | 16 ĐV | Hồi Thu Âm **180 → 130** | – | – |
| **8 – MỐC** | 18 ĐV + Ấn III | **Gặt Tiếng**: Thu Âm làm vỡ ngay các dấu cũ trong cung rồi mới đặt dấu mới | Vòng "đặt – vỡ – đặt" liền mạch | Ngoại hình bậc 3 |

### Trượng Vọng

| Cấp | Điều kiện / chi phí | Tăng chỉ số hoặc mở | Thay đổi khi chơi | Asset cần thêm |
|---|---|---|---|---|
| **1 – MỐC** | Nhặt ở vùng 4 (đề xuất Vực Lặng) | Âm cầu 6 px/tick, tầm 260, nổ bán kính 28 [8,5], tối đa 2 cầu; bắn chéo lên; bắn trên không (Lam treo 6 tick) | Đánh từ xa an toàn nhưng yếu | Mảnh trượng bậc 1. Âm cầu + nổ (ảnh gen nhỏ). Clip bắn, bắn trên không |
| 2 | 6 ĐV | Âm cầu **+25 %** (8 → 10) | – | – |
| **3 – MỐC** | 8 ĐV + Ấn I | **Mở Chiêu Hồn** (giữ ≥ 24 → thả): Vệ Hồn hiện 72 px trước Lam, 18 tick sau nện 1 lần hộp 120×80 [20,30], rồi tan. Tối đa 1. Hồi 300 | Đặt "bẫy" trước mặt rồi lùi | Clip gõ trượng. **Vệ Hồn**: rig + 3 clip (hiện, nện, tan) – xem mục 9 |
| 4 | 10 ĐV | Vệ Hồn **nện 2 lần** (cách 30 tick) | Vệ Hồn giữ được một chỗ lâu hơn | Clip nện lặp lại (cùng clip) |
| 5 | 12 ĐV | Nổ âm cầu **28 → 40 px** | Dễ trúng nhóm | – |
| **6 – MỐC** | 14 ĐV + Ấn II | **Gọi Về Tiếng**: nếu có âm cầu đang bay (hoặc vừa nổ ≤ 30 tick), Vệ Hồn hiện **tại chỗ cầu mới nhất** | Đặt Vệ Hồn từ xa: bắn trước, gọi sau | Ngoại hình bậc 2 |
| 7 | 16 ĐV | Vệ Hồn nện **[20,30] → [26,40]** | – | – |
| **8 – MỐC** | 18 ĐV + Ấn III | **Hồi Chuông Cuối**: nhát nện cuối tạo 2 sóng đất (5 px/tick, tầm 160) [6,10]; hồi 300 → 240 | Hoàn thiện vai áp lực | Ngoại hình bậc 3. Sóng dùng lại sóng boss (`spawnWave`) tô đồng |

---

## 4. Vì sao 8 cấp, mốc ở 1 / 3 / 6 / 8

| Phương án | Ưu | Nhược |
|---|---|---|
| 10 cấp, mốc 1/4/7/10 (gợi ý trong yêu cầu) | Quen thuộc | 6 cấp thường × 4 vũ khí = 24 lần "chỉ cộng số". Muốn mỗi lần đáng kể (≥ 15 %) thì cuối cùng mạnh gấp 3–4 lần cấp 1 → phải tăng máu địch theo, khó cân bằng. Kỹ năng mở muộn (cấp 4) |
| 5 cấp (như GDD) | Ít vật liệu | Không đủ chỗ: mở kỹ năng → củng cố → biến thể → hoàn thiện cần ít nhất 4 mốc + vài cấp củng cố |
| **8 cấp, mốc 1/3/6/8 (chọn)** | 4 mốc + 4 cấp thường. Cấp thường luôn có số cảm nhận được (+20–25 %, hoặc đổi 1 luật hồi chiêu). **Kỹ năng mở ở lần nâng thứ 2** → người chơi dùng được sớm | Nhảy 3 → 6 xa hơn 1 → 3. Đó là đúng ý: giai đoạn "luyện kỹ năng vừa mở" dài nhất |

Nhịp mỗi vũ khí đúng theo yêu cầu:
- **Mốc đầu (1)**: nhận vũ khí + đánh thường.
- **Cấp 2**: tăng sức mạnh nền vừa đủ.
- **Mốc 3**: mở kỹ năng đặc trưng.
- **Cấp 4–5**: củng cố kỹ năng (4) và bản sắc riêng (5: chí mạng kiểu của vũ khí đó).
- **Mốc 6**: thêm một cách tương tác mới, không thêm nút.
- **Cấp 7**: giảm thời gian hồi.
- **Mốc 8**: hoàn thiện bản sắc + ngoại hình cuối.

Sức mạnh tổng (ước lượng sát thương đánh thường, cấp 8 so với cấp 1): khoảng **×1,25–1,35**. Sức mạnh kỹ năng tăng nhiều hơn (Dư Âm ×1,6 + vang 2 lần).
Nghĩa là **cấp mở rộng cách chơi nhiều hơn là phình số**. Địch vùng sau không cần nhân máu quá ×2.

Những thứ **không bao giờ tăng theo cấp** (giữ nhược điểm và animation):
- Tốc độ vung (`su/ac/re`).
- Tầm đánh thường. Ngoại lệ duy nhất: Xích cấp 8, +17 %, có ghi chú thiết kế màn.
- Tốc độ chạy khi vung, khả năng hủy bằng lướt.

### 4b. Giá trị từng cấp, tính trên đối thủ thật (Âm Đao cấp 1–4)

Máu / Thế lấy theo bộ quái ở KHGP2 (số thử, thang ×10). Không ép mọi cấp phải giảm số nhát giết (PH2 mục 2).

| Đối thủ [máu, Thế] | Cấp 1 (nhát 10) | Cấp 2 (nhát 12) | Cấp 3: mở Dư Âm (chém 15 + vết 10) | Cấp 4 (vết 16, Thế 20) |
|---|---|---|---|---|
| Dơi Rễ [20, –] | 2 nhát | 2 nhát (**không đổi**) | 1 lần Dư Âm (15 + 10) nếu cả chém lẫn vết trúng | như cấp 3 |
| Nấm Thở [30, –] | 3 nhát | 3 nhát (**không đổi**) | Dư Âm 25 + 1 nhát | **1 lần Dư Âm** (15 + 16 = 31) |
| Chuông Gỗ [40, –] | 4 nhát | 4 nhát (**không đổi**) | Dư Âm + 2 nhát | Dư Âm + 1 nhát |
| Quái gác [30, 60, vỏ] – phá vỏ | combo + 1 nhát (Thế 10+10+30+10) | như cấp 1 | nhát 1 + Dư Âm (Thế 10+20+10 = 40) + 2 nhát | nhát 1 + Dư Âm (10+20+20 = 50) + **1 nhát** |
| Tinh anh Chuông Gỗ Gác Lớn [160, 80] | 16 nhát | **14 nhát** (−12 %) | mỗi lần Dư Âm trừ 30 Thế | mỗi lần Dư Âm trừ **40 Thế = ½ thanh** |

Lưu ý: giữ Chém luôn bắt đầu bằng nhát 1 (mục 7a). Hàng Dơi / Nấm / Chuông Gỗ **chưa tính** nhát 1 đó (để thấy riêng giá trị kỹ năng; thực tế nhát 1 thường trúng và giết nhanh hơn một nhát); hàng quái gác **có tính**.

Kết luận trung thực:
- **Cấp 2** gần như không đổi gì với quái thường; thấy được ở tinh anh/boss. Đây là cấp "nền", không bán như bước nhảy lớn.
- Biến thể thử (không bắt buộc): Chuông Gỗ máu **36** → cấp 1 cần 4 nhát, cấp 2 **đúng 1 combo**. Chỉ dùng nếu người thử không nhận ra cấp 2.
- **Cấp 3** là bước nhảy thật (thêm hành động). **Cấp 4** thấy rõ ở Thế: vết thành nửa thanh Thế tinh anh.
- **Cấp 5** (chí mạng 5 → 12 %) chỉ +3,4 % trung bình: ghi là điểm phụ.
- Prototype đo bằng hình nộm và **hỏi người thử có nhận ra khác biệt không cần xem số** (mục 10).

---

## 5. Chí mạng, Cộng hưởng và hiệu ứng phụ

### 5a. Chí mạng: mỗi vũ khí một kiểu

| | Kiểu | Điều kiện | Hệ số | Giới hạn |
|---|---|---|---|---|
| Âm Đao | **Ngẫu nhiên** | Tỷ lệ 5 % (cấp 5: 12 %). P1: đòn đầu tiên trong 60 tick sau né sát đòn = chắc chắn (khi KHGP làm né sát đòn) | ×1,5 | Tỷ lệ ≤ 20 %, hệ số ≤ ×2 |
| Xích | **Có điều kiện: điểm ngọt** | Lượt đi trúng trong 20 % (cấp 5: 30 %) cuối tầm | ×1,5 | Chỉ lượt đi |
| Liềm | **Có điều kiện: mũi liềm** | Trúng bằng hộp vành ngoài (85–112 px tính từ vai) | ×1,5 (cấp 5: ×1,8) | ≤ ×2 |
| Trượng | **Không có** | Sức mạnh nằm ở Vệ Hồn | – | – |

So sánh hai kiểu:
- **Ngẫu nhiên**: dễ làm, cảm giác "bất ngờ". Nhưng không học được và gây tranh cãi khi cân bằng.
- **Có điều kiện**: dạy người chơi đứng đúng chỗ, đúng lúc. Vì vậy 2/3 vũ khí có chí mạng dùng kiểu này. Âm Đao giữ kiểu ngẫu nhiên vì vai "sát thương trực tiếp" và nhịp nhanh làm may rủi trung bình ra.

Luật chung:
- Chí mạng **chỉ nhân máu, không bao giờ nhân Thế**.
- Phá giáp, mở cổng, công tắc **không phụ thuộc may rủi**.
- Bóng, vết Dư Âm, dấu vỡ, Vệ Hồn, sóng **không chí mạng**.
- **Chí mạng ngẫu nhiên gieo 1 lần lúc TẠO đòn** (lúc Lam vung), không gieo lúc trúng. Cả nhát cùng chí mạng trên mọi mục tiêu, vệt chém sáng khác ngay từ lúc vung. Chí mạng có điều kiện (điểm ngọt, mũi liềm) xét theo hình học của chính lần trúng.
- **Không hồi tố**: chí mạng đã tính của một nhát không bao giờ bị bỏ, dù bóng đến trước hay sau (PH2 mục 5.6).
- Không có Âm Phù tăng chí mạng **không điều kiện** ở bản đầu (Âm Phù có điều kiện / đánh đổi: mục 6a).
- Ngẫu nhiên dùng bộ sinh số có hạt giống riêng (ví dụ `mulberry32`, hạt đặt lại mỗi lần vào phòng), **không dùng `Math.random`**. Log phòng thử nhờ đó chạy lại được. Bóng không bị ảnh hưởng vì bóng phát lại trạng thái.

### 5b. Nguồn đòn và cờ chống dây chuyền

`src` chỉ cho biết **ai** gây đòn. Việc đòn được làm gì quyết định bằng **cờ riêng** `co` gắn lúc tạo đòn, không suy ra từ `src` (PH2 mục 5.7):
- `co.ch`: được vào cặp Cộng hưởng.
- `co.duChan`: vỡ Thế / Cộng hưởng do đòn này gây ra **được sinh** sóng Dư Chấn.
- `co.hieuUng`: được sinh hiệu ứng phụ lúc trúng (kéo, đặt dấu).
- `co.kichDau`: được kích dấu vỡ.

| Loại đòn | `src` | Chí mạng | `ch` | `duChan` | `hieuUng` | `kichDau` | Hitstop tối đa |
|---|---|---|---|---|---|---|---|
| Đánh thường của Lam; đầu xích; âm cầu | `'p'` | theo vũ khí | ✓ | ✓ | ✓ | ✓ (Liềm) | theo đòn |
| Đòn chính của kỹ năng (chém vang, giật Hồi Chấn, quét Thu Âm) | `'p'` | theo vũ khí | ✓ | ✓ | ✓ | ✓ | theo đòn |
| Bóng phát lại | `'e'` | – | ✓ | ✓ | – | – | `hs−1` (như code) |
| Vết Dư Âm, dấu vỡ, Vệ Hồn nện | `'k'` | – | – | ✓ | – | – | ≤ 3 (dấu vỡ 5) |
| Sóng Dư Chấn, Vỡ Lan, Chuông Treo ngân, sóng Hồi Chuông Cuối | `'k'` | – | – | **–** | – | – | ≤ 3 |

Trả lời câu hỏi PH2: **Dư Chấn do phá Thế KHÔNG sinh thêm Dư Chấn.** Sóng Dư Chấn mang `duChan = false`, nên Thế vỡ vì sóng thì không có sóng mới. Chuỗi dài nhất có thể: Lam dùng Dư Âm → vết vang làm vỡ Thế → 1 đợt Dư Chấn → dừng.
Mỗi lần trúng sinh **tối đa 1 đợt** Dư Chấn trên một mục tiêu, kể cả khi vỡ Thế và Cộng hưởng xảy ra cùng lúc.
Bóng không rút hồi nấc Vọng (KHGP).

### 5c. Công thức sát thương

**Bản đầy đủ và chốt nằm ở KHGP2 mục 6** (một chỗ duy nhất cho mọi vũ khí). Tóm tắt phần vũ khí cần biết:

**Lúc tạo đòn gốc** (Lam vung, tung kỹ năng, phóng xích, bắn cầu; hoặc vết / dấu / sóng được sinh ra) tạo một đối tượng `D` và **chốt chỉ số tại đây** (PH2 mục 5.4):
- `D.goc = [máu, Thế]` lấy từ `pl.cs` (vũ khí + cấp + Âm Phù đã gộp sẵn ở thời điểm đó).
- `D.chiMang` (nếu kiểu ngẫu nhiên), `D.co`, `D.hs`, mã nhát mới `D.ma`, danh sách `D.daTrung` rỗng.
- Đổi cấp / Âm Phù sau đó **không** sửa `D` đã tạo, và không sửa bản ghi của bóng.

**Mỗi lần `D` trúng mục tiêu `e`:**
1. Trúng nếu hộp chồng `e` và `e` chưa có trong `D.daTrung`.
2. Số của lần trúng: Lam / phụ: `m = goc.máu × (chí mạng ? hệ số : 1)`, `t = goc.Thế`. Bóng: `m = goc.máu × BONG_MAU`, `t = goc.Thế × BONG_THE`, với `goc` là số đã chốt lưu trong bản ghi (5d).
3. Chặn máu, xét theo Thế **trước** lần trúng này: `e` có `vo` và Thế > 0 → `m = 0` ("Keng"); `e` có `mat`, bị đánh từ phía trước và Thế > 0 → `m = 0`. Vì vậy **nhát làm vỡ vỏ không gây máu, từ nhát sau mới gây máu** (luật thử "Keng → vỡ → đánh phần mềm", PH3). Luật này **không** bảo đảm mọi thứ tự trúng cho cùng tổng máu; chỉ bảo đảm 3 điều ở KHGP2 mục 6b (thưởng Cộng hưởng cùng công thức; hit cùng tick gom lại, chặn theo Thế đầu tick, không phụ thuộc thứ tự duyệt; hit khác tick theo trạng thái thực tại).
4. Trừ Thế theo trạng thái Thế của `e` (KHGP2 mục 5: đang choáng không trừ, đang ổn định không xuống dưới 1). Về 0 → vỡ.
5. Làm tròn xuống. **Chỉ khi `goc.máu > 0` và không bị chặn ở bước 3 thì mới áp tối thiểu 1.** `goc.máu = 0` thì luôn ra 0 (PH2 mục 5.5).
6. **Cộng hưởng** (cả hai nhát có `co.ch`, `e` không bị khóa 45 tick): lần trúng này ghép được với nhát của bên kia (Lam ↔ bóng) trúng `e` trong ≤ `resWindow` tick và **chưa ghép lần nào**. Khi đó thêm **một lần trúng cộng thêm**:
   - máu cộng thêm = `floor(CH_MAU × máuCơSở)`, với `máuCơSở` = `goc.máu` **đã lưu** của nhát Lam trong cặp (đã gộp cấp, **chưa nhân chí mạng**). Ai trúng trước cũng dùng đúng số này.
   - Thế: `e` có `vo` hoặc `mat` → **vỡ ngay**. Tinh anh / boss → trừ `CH_THE` (thử 50 % Thế tối đa), qua luật ở bước 4, **không mặc định về 0**. Địch không có Thế: không có phần Thế.
   - Phần cộng thêm **không bị vỏ chặn** (vỏ vừa vỡ hoặc tinh anh không có vỏ).
   - Xóa bản nhớ của cả hai nhát → mỗi nhát ghép **tối đa 1 lần**. Khóa `e` 45 tick. Hitstop 8.
7. Hiệu ứng phụ lúc trúng: chỉ khi `D.co.hieuUng` (kéo theo hạng nặng, đặt dấu); kích dấu chỉ khi `D.co.kichDau`.
8. Dư Chấn (Âm Phù): ở bước 4 hoặc 6 có vỡ Thế / Cộng hưởng **và** `D.co.duChan` → 1 đợt sóng.
9. Hitstop = `Math.max` (như code), không cộng dồn. Rung màn hình lấy đòn lớn nhất trong tick.

**Hiệu ứng KHÔNG sinh lúc trúng mà sinh theo lần dùng kỹ năng** (PH2 mục 5.8). Mỗi hiệu ứng có luật đếm riêng, không dùng chung "1 lần mỗi đòn":

| Hiệu ứng | Sinh khi | Đếm theo | Ghi chú |
|---|---|---|---|
| Vết Dư Âm | Hộp chém vang **bật** (dù trúng hay hụt) | **1 vết / lần dùng kỹ năng** | Quét trúng 3 con vẫn chỉ 1 vết. Đặt ở chỗ hộp chém vang. Tối đa 2 vết trên màn |
| Dấu Thu Âm | Quét Thu Âm trúng | **1 dấu / mục tiêu**, ghi đè dấu cũ | Đặt dấu theo từng mục tiêu |
| Dấu vỡ | Nhát Liềm có `kichDau` trúng con có dấu ≥ 20 tick | 1 lần / dấu | Dấu vỡ là `'k'`, không kích dấu khác |
| Kéo | Lượt xích có `hieuUng` trúng | 1 lần / mục tiêu / lượt | Theo hạng nặng (mục 3) |
| Vệ Hồn | Tung Chiêu Hồn | 1 / lần dùng, 1 toàn cục | Hiện dù không có địch |

Giới hạn proc còn lại: Cộng hưởng 1 lần / 45 tick / mục tiêu (KHGP); 1 dấu / mục tiêu; 1 Vệ Hồn toàn cục; mốc 8 Âm Đao vang 2 lần nhưng vẫn là 1 vết.

### 5d. Bóng Tiếng Vọng dùng chỉ số nào

- **Sát thương phụ của bóng** (PH1 mục 3, chưa chốt tỷ lệ) = `goc` **đã chốt của đòn gốc** × `BONG_MAU` (thử 0,25) và × `BONG_THE` (thử 0,5). Tối thiểu 1 máu **chỉ khi** `goc.máu > 0` (số nhỏ màu teal mờ).
- **Thời điểm chốt = lúc Lam tạo đòn gốc trong đoạn ghi** (PH2 mục 5.4). Bản ghi lưu luôn `goc`, `co`, vũ khí và loại đòn của từng hộp. Bóng **không tra lại** vũ khí hay cấp lúc phát. Trong prototype có nút đổi cấp ở ⚙ giữa trận, nên luật này phải đúng cả khi cấp đổi lúc bóng còn.
- **Mã đòn bền (PH3):** mỗi **lần phát** bóng có bảng `maGoc → maReplay`. Hộp có `maGoc` chưa gặp trong lần phát này → tạo **một** `D` bóng (mã mới, `daTrung` rỗng); các tick sau của cùng hộp dùng lại `D` đó. **Không tạo `D` / `daTrung` mới mỗi tick** (hộp bật 8 tick vẫn trúng mỗi mục tiêu 1 lần). Lần phát sau có bảng mới, nên không "dùng lại" dấu thời gian của lần phát trước để Cộng hưởng thêm. Xích: lượt đi / về là hai `maGoc` khi luật cho trúng cả hai lượt.
- Ba biến **tách riêng** để thử từng cái một (PH1): `BONG_MAU`, `BONG_THE`, `CH_MAU` (mặc định 1 × nhát Lam). Cách so: KHGP2 mục 4.
- **Cộng hưởng** lấy `máuCơSở` của **nhát Lam** (số đã lưu, chưa chí mạng), không lấy của bóng.
- **Bóng không phát lại**: vết Dư Âm, đặt dấu, kéo địch, Vệ Hồn, Chuông Treo. Nó chỉ phát lại hộp đòn (5f).
- Áp cho cả hai cấu hình Vọng (A ghi chủ động, B Vọng Chiến): vòng đệm 90 tick ghi cùng các trường này.

### 5e. Ví dụ tính bằng số

Cấu hình thử dùng trong mọi ví dụ: `BONG_MAU 0,25`, `BONG_THE 0,5`, `CH_MAU 1`, `CH_THE` = 50 % Thế tối đa, `resWindow 12`. Âm Đao nhịp mới `su` 7/7/9, `ac` 8, `re` 8/8/16 (KHGP2 P0-A). t = tick.

**Ví dụ 1 – Âm Đao cấp 5, nhát 1 vào Chuông Gỗ (máu 40, không có Thế).**
- Gốc 10, cấp 2 cộng 20 % → `goc.máu` = **12**, chốt lúc vung. Gieo chí mạng 12 % cũng lúc vung.
  - Không chí mạng: **12**. Chí mạng: 12 × 1,5 = **18**.
- Combo 1-2-3 không chí mạng: 36 → còn 4 máu, cần thêm 1 nhát. Có 1 chí mạng: 18 + 12 + 12 = 42 → chết trong 1 combo.

**Ví dụ 2 – Âm Đao cấp 4, KHÔNG có bóng, phá quái gác (máu 30, Thế 60, `vo`). Đủ hành động và thời gian (PH2 mục 5.9).**

| t | Hành động | Thế | Máu | Ghi chú |
|---|---|---|---|---|
| 0 | Chạm **và giữ** Chém | 60 | 30 | Nhát 1 ra ngay (giữ Chém luôn bắt đầu bằng đánh thường) |
| 7 | Hộp nhát 1 bật, trúng [12,10] | 50 | 30 | Thế trước lần trúng = 60 > 0 → vỏ chặn máu: "Keng". **Không sinh vết** (đánh thường) |
| 20 | Giữ đủ 20 tick | | | Kỹ năng "đã nạp": vòng trên nút đầy + tiếng ngân |
| 22 | **Nhả** Chém (nhát 1 còn 1 tick) | | | Kỹ năng vào hàng chờ, tung ở tick đầu tiên được phép (mục 7a) |
| 23 | Nhát 1 hết → tung Dư Âm | | | Hồi 150 tick bắt đầu |
| 29 | Hộp chém vang bật, trúng [15,20] | 30 | 30 | Keng. **Vết đặt ngay lúc hộp bật** (có trúng hay không) |
| 51 | Chém vang hết. Lam đứng yên (quái gác đang ngủ, không đánh) | | | |
| 53 | Vết vang [16,20] (`'k'`) | 10 | 30 | Keng. Không chí mạng, không Cộng hưởng |
| 55 | Lam chạm Chém → nhát 1 | | | |
| 62 | Nhát 1 trúng [12,10] | 10 → **vỡ** | 30 | Thế trước = 10 > 0 → nhát này vẫn bị chặn máu. Vỏ vỡ, choáng 120 (tới t 182) |
| 77 | Nhát 2 trúng | (choáng) | **18** | Đang choáng: không trừ Thế |
| 94 | Nhát 3 trúng | | **6** | |
| 125 | Combo mới, nhát 1 trúng | | **chết** | Vẫn trong choáng |

Không dùng Dư Âm (chỉ đánh thường) cần combo + 1 nhát để vỡ vỏ (mục 4b), chậm hơn khoảng 1 nhịp combo.

**Ví dụ 3 – phần thưởng Cộng hưởng nhất quán: Âm Đao cấp 5 + bóng vào tinh anh [160, 80] (không có vỏ).** Nhát Lam chí mạng. Bóng phát lại nhát 1 đã ghi cũng ở cấp 5: `goc` = [12,10] → phụ của bóng = [floor(3) = **3**, **5**].

| Thứ tự | Lần trúng 1 | Lần trúng 2 (cách ≤ 12 tick) | Cộng thêm | Tổng |
|---|---|---|---|---|
| Lam trước | Lam [18,10] (chí mạng) | Bóng [3,5] | [12, 40] | **[33, 55]** |
| Bóng trước | Bóng [3,5] | Lam [18,10] (vẫn chí mạng) | [12, 40] | **[33, 55]** |

Cộng thêm = 1 × `máuCơSở` 12 (chưa chí mạng) và `CH_THE` = 40. Thế 80 → 25, **không về 0**.
Cùng tổng ở đây vì tinh anh không có vỏ chặn máu. Với quái có vỏ, hai thứ tự khác tick có thể ra tổng khác (KHGP2 6c ví dụ 4) – điều được bảo đảm là phần thưởng dùng cùng công thức.
Nếu đoạn ghi được tạo lúc Lam còn cấp 1 rồi đổi lên cấp 5 ở ⚙: bóng vẫn dùng `goc` [10,10] đã chốt → phụ [2,5]; cộng thêm vẫn lấy 12 của nhát Lam hiện tại.

**Ví dụ 4 – 0 là 0.** Sóng Dư Chấn [0,15] trúng Chuông Gỗ (không Thế): **0 máu**, không có Thế để trừ, chỉ nhấp nháy viền. Trúng quái gác Thế 60: Thế 45, máu **0** (không phải 1).

**Ví dụ 5 – Liềm cấp 6 vào Người Gác Câm [240, 120] đang mang dấu, cạnh 1 Chuông Gỗ.**
- Nhát 1: `goc.máu` = 14 × 1,25 (cấp 2) = 17,5. Trúng bằng mũi liềm ×1,5 = 26,25 → **26 máu, 10 Thế**.
- Cùng nhát đó có `kichDau` → **dấu vỡ** là một `D` riêng `'k'`: **[28,45]**. Không nhân chí mạng của nhát 1, không vào Cộng hưởng.
- Vỡ Lan [0,15] (`duChan = false`): Chuông Gỗ bên cạnh không có Thế → 0 máu, chỉ nhấp nháy. Không đặt dấu, không kích dấu khác.
- Tổng trên Người Gác: 54 máu, 55 Thế. Nếu nhân chồng (26 × dấu × chí mạng × …) sẽ ra hơn 100; công thức trên chặn điều đó.

**Ví dụ 6 – Xích cấp 1, lượt đi trúng 2 Chuông Gỗ thẳng hàng ở 120 px và 185 px (tầm 196).**
- Con ở 120 px: 12 máu (Chuông Gỗ không có Thế). Con ở 185 px trong 20 % cuối tầm (≥ 157 px) → 12 × 1,5 = **18**.
- Lượt về: mỗi con thêm **6** máu, 1 lần. Chuông Gỗ hạng **vừa** nên **không bị kéo** (Dơi Rễ hạng nhẹ thì bị kéo 32 px).
- Mỗi lượt là một `D` riêng → mỗi con trúng **đúng 2 lần** (1 đi + 1 về).

### 5f. Bóng phát lại vật thể nào, vẽ thế nào (không sát thương vô hình)

Không mặc định "tối đa 2 hộp đạn" (PH2 mục 5.10). Bảng dưới liệt kê **mọi hộp đòn của Lam có thể cùng tồn tại** trong một tick:

| Vũ khí | Hộp đòn của Lam cùng lúc | Tối đa | Bóng phát lại? | Bóng vẽ gì |
|---|---|---|---|---|
| Âm Đao | hộp chém (thường hoặc chém vang) | 1 | có | Thân bóng + vệt chém mờ (đã có: `huVet` cho bóng, dòng 906) |
| | vết Dư Âm (`'k'`) | 2 | **không** | – |
| Xích | đầu xích (lượt đi hoặc về – không cùng lúc) | 1 | có | Thân bóng + **dây xích teal mờ** từ tay bóng tới đầu + chuông đầu xích |
| | Chuông Treo ngân (`'k'`) | 1 | **không** | – |
| Liềm | hộp thân + hộp mũi của cùng nhát | 2 | có | Thân bóng + vệt quét mờ |
| | dấu vỡ, Vỡ Lan (`'k'`) | nhiều | **không** | – |
| Trượng | âm cầu đang bay ≤ 2 + vụ nổ đang bật ≤ 2 | 4 | có | **Âm cầu teal mờ** bay đúng quỹ đạo đã ghi + vòng nổ mờ |
| | Vệ Hồn (`'k'`) | 1 | **không** | – |

Luật kèm theo:
- Bản ghi mỗi tick là **danh sách tối đa 4 hộp** (Trượng là trường hợp lớn nhất). Mỗi hộp ghi: loại vật thể, hộp tuyệt đối `x,y,w,h`, dữ liệu vẽ (góc, điểm đầu xích, bán kính nổ), `goc`, `co`, mã đòn gốc.
- **Đổi vũ khí làm tan đạn của món cũ** (xích thu về như 7c; âm cầu tan, có hiệu ứng tan, không gây sát thương). Nhờ vậy không có tick nào cần 4 hộp Trượng + 2 hộp Liềm.
- **Có hộp thì phải có hình.** Loại vật thể nào chưa có cách vẽ cho bóng thì **không được ghi** (log cảnh báo), nên bóng không bao giờ gây sát thương vô hình.
- Prototype Âm Đao chỉ dùng 1 hộp, nhưng định dạng danh sách 4 hộp được chốt ngay để không phải đổi bản ghi khi thêm Xích / Trượng.

---

## 6. Nguồn tiến triển, vật liệu, bắt kịp

### 6a. Bốn nguồn, không cộng cùng một thứ

| Nguồn | Cho cái gì | Tuyệt đối không cho |
|---|---|---|
| **Nâng vũ khí** (Thợ Rèn Hòn) | Sát thương / Thế của vũ khí đó, kiểu chí mạng riêng, sức mạnh và thời gian hồi kỹ năng, mốc mở | Máu Lam, nấc Vọng, tốc độ di chuyển |
| **Nâng Lam** (Mảnh Tim, Mảnh Âm – KHGP mục 7) | +1 máu tối đa, +1 nấc Vọng | Sát thương, chí mạng |
| **Âm Phù** (2 ô, đổi ở chuông lưu) | Hành vi có đánh đổi (Dư Chấn, Tàn Ảnh, Bóng Chắn). **Được phép** đổi sát thương / hồi chiêu nếu **có điều kiện hoặc đánh đổi** (bảng dưới) | Tăng thuần **không điều kiện** (ví dụ "+10 % sát thương", "−20 % hồi chiêu" không kèm cái giá) |
| **Khám phá / boss** | Vũ khí mới, **Ấn Rèn** (quyền mở mốc), Mảnh Tim / Âm, rương Đồng Vụn cố định | – |

Ví dụ Âm Phù có điều kiện / đánh đổi (PH2 mục 4; **chưa làm ở P0**, chỉ để dữ liệu không khóa đường mở rộng):

| Âm Phù (ví dụ) | Được | Mất / điều kiện |
|---|---|---|
| Dư Âm Nặng | Vết Dư Âm +40 % máu | Hồi Dư Âm +50 % |
| Xích Nhẹ | Xích thu về nhanh hơn 30 % | Lực kéo giảm 1 hạng |
| Hồn Bền | Vệ Hồn tồn tại lâu hơn (thêm 1 lần nện) | Âm cầu −25 % |
| Đòn Lặng | Nhát đầu sau 60 tick không đánh +50 % máu | Chỉ nhát đầu |

Dữ liệu: Âm Phù dùng **cùng định dạng thay đổi** với bảng cấp (`dat` / `cong` / `nhan`, thêm `dieuKien` tùy chọn), áp ở lớp thứ 3 của `chiSo()` (mục 8b). Code không có lệnh cấm cứng; giới hạn nằm ở việc thiết kế từng Âm Phù.

### 6b. Vật liệu

| Vật liệu | Nguồn | Dùng | Ghi chú |
|---|---|---|---|
| **Đồng Vụn (ĐV)** | Chủ yếu **rương đặt cố định** (5–10 mỗi rương) + vật phá (0–1). Quái rơi 1, **nhưng mỗi phòng tối đa 5 ĐV từ quái mỗi lần nghỉ chuông** | Cấp thường và một phần mốc | Không mất khi chết. Biểu tượng dùng lại ảnh "mảnh chuông" đã có trong atlas HUD. Mảnh chuông hồi máu hiện tại giữ riêng, màu khác |
| **Ấn Rèn I / II / III** | **Cố định**: **I = trước boss đầu** (xem dưới). II = boss vùng 2 hoặc tinh anh cuối nhánh. III = boss vùng 3 | Quyền vượt mốc 3 / 6 / 8, **dùng chung mọi vũ khí, không tiêu hao** | Không farm được |

Không có: độ hiếm ngẫu nhiên, đồ rác, reroll, mất cấp khi chết.
Đặt rương sao cho **một lần khám phá kỹ một vùng ≈ 2 cấp** cho 1 vũ khí.

**Mở Dư Âm trước boss đầu** (PH2 mục 2, 5.1). Hai nguồn Ấn Rèn I đã cân nhắc:

| Nguồn Ấn I | Ưu | Nhược |
|---|---|---|
| **A. Tinh anh trên đường chính, trước Điểm lưu (đề xuất)** | Ai cũng có Dư Âm trước boss. Tinh anh là bài thi phá Thế, thưởng đúng thứ vừa cần. Khớp P0-C (tinh anh + một nâng cấp) | Tinh anh phải dễ hơn boss rõ rệt |
| B. Nhiệm vụ Thợ Rèn Hòn (Sân chuông) | Dùng NPC sẵn có, có lời dẫn | Nếu là nhánh phụ, người chơi bỏ qua thì tới boss vẫn chỉ đánh thường |

Chọn **A, có lời dẫn của B**: Thợ Rèn Hòn nhờ Lam lấy "lõi đồng" từ tinh anh; tinh anh rơi Ấn I; mang về Sân chuông thì rèn được Âm Đao cấp 3.
- Đồng Vụn: rương trước tinh anh đủ **≥ 14 ĐV** (cấp 2: 6 + cấp 3: 8), để lấy Ấn xong là mở được Dư Âm ngay.
- **Boss Chuông Gác Làng thưởng: Xích Chuông (cấp 1) + rương ~10 ĐV.** Có sẵn Ấn I nên Xích tới mốc 3 (Hồi Chấn) chỉ cần ĐV (giá bắt kịp, 6c). Phương án thay nếu chưa làm Xích: boss thưởng rương ĐV đủ nâng Âm Đao lên cấp 4.
- Demo nhắm: Âm Đao cấp 3 trước boss, cấp 4 sau boss.

### 6c. Giữ động lực đổi vũ khí – so sánh

| Cách | Mô tả | Ưu | Nhược |
|---|---|---|---|
| Cấp nền chung | Mọi vũ khí cùng 1 cấp | Không bao giờ tụt | Mất cảm giác "nâng món này". Mua 1 được 4 |
| Nâng theo bậc | Vũ khí mới nhặt được đã ở sẵn cấp tương ứng vùng | Món mới mạnh ngay | Mất khoảnh khắc mở mốc. Người chơi không chọn |
| **Giá bắt kịp (chọn)** | Xét theo **cấp đích** của lần nâng: nếu cấp đích **≤ `capMax`** (cấp cao nhất từng đạt ở bất kỳ vũ khí nào) thì giá = `ceil(GIA_DV[cấp đích] / 3)`; cấp đích > `capMax` trả giá thường. Ấn Rèn vốn dùng chung nên không phải tìm lại | Đơn giản: 1 luật. Vẫn có cảm giác tự nâng. Món mới dùng thử được ngay | Cần hiện rõ "giá bắt kịp" trong menu thợ rèn |

Ví dụ: Âm Đao đang cấp 6 (`capMax` = 6), nhặt Xích cấp 1.
- Nâng Xích 1 → 6 giá thường (cấp đích 2…6): 6 + 8 + 10 + 12 + 14 = 50 ĐV.
- Mọi cấp đích 2…6 đều ≤ 6 nên đều được giảm: ceil(6/3) + ceil(8/3) + ceil(10/3) + ceil(12/3) + ceil(14/3) = 2 + 3 + 4 + 4 + 5 = **18 ĐV** (khoảng 2 rương).
- Nâng tiếp Xích 6 → 7: cấp đích 7 > 6 → giá thường **16 ĐV**, và `capMax` thành 7.
- Đã có Ấn I và II nên Xích mở Hồi Chấn và Chuông Treo ngay. Xích bắt kịp sau một lượt ghé thợ rèn.

---

## 7. Điều khiển cảm ứng và đổi vũ khí

### 7a. Giữ Chém mà đòn thường không chậm

**Phương án thử, chưa chốt cho cả 4 món** (PH2 mục 1, 5.2). Dựa trên P0-A của KHGP2 (hàng chờ 1 nhát, `su` 7/7/9).

1. **Chạm** Chém → nhát thường ra **ngay tick đó** (hoặc vào hàng chờ nếu đang đánh, theo luật KHGP2 mục 3).
2. Code đếm `pl.giuT` = số tick nút Chém đang được giữ **kể từ lần chạm cuối**. Nhả là về 0.
3. `giuT` chạm ngưỡng (Âm Đao 20, Xích: xem dưới, Liềm / Trượng 24), Lam trên đất, kỹ năng hết hồi → **"đã nạp" NGAY lúc đó**, kể cả khi đòn thường còn đang chạy: vòng trên nút Chém đầy, ánh nhẹ dọc vũ khí, tiếng "ngân". Đòn đang đánh vẫn chạy hết (không cắt).
4. Khi nhả nút có đúng ba khả năng, **không khả năng nào âm thầm mất lệnh**:

| Lúc nhả | Kết quả | Trễ tối đa | Log |
|---|---|---|---|
| **Trước ngưỡng** | Không có kỹ năng. Chỉ là nhát thường (nút không bao giờ báo "đã nạp") | – | `giu: nha-som` |
| **Sau ngưỡng, đòn thường CHƯA xong** | Kỹ năng vào **hàng chờ 1 chỗ** (thay nhát combo đang chờ nếu có, log `thay-the`). Tung ở **tick đầu tiên đòn hiện tại cho phép** (hết `re`). Vòng trên nút đổi sang "chờ tung" | phần còn lại của đòn: ≤ `ac + re` = 16 tick (nhát 1–2), 24 (nhát 3) | `ky-nang: xep-hang` → `tung` |
| **Sau ngưỡng, đòn đã xong** (đang ở thế tụ) | Tung ngay tick nhả | 0 | `ky-nang: tung` |

5. Kỹ năng đang chờ hoặc thế tụ bị **xóa** khi: bị đánh, chết, đổi phòng, lướt (lướt = hủy chủ động). Mỗi lần xóa ghi log kèm lý do; kỹ năng **không mất thời gian hồi** vì chưa tung.
6. Giữ quá 60 tick ở thế tụ thì tự tung (tránh kẹt), log `tu-tung`.
7. Bấm dồn không bao giờ ra kỹ năng, vì mỗi lần chạm `giuT` về 0.
8. Kỹ năng đang hồi: giữ không làm gì, nút Chém không có vòng sáng.
9. Không có "tung muộn ngoài ý muốn": thời điểm xa nhất kỹ năng có thể ra là hết đòn đang đánh, và người chơi đã thấy vòng "chờ tung" từ lúc nhả.

Prototype phải log đủ ba trường hợp ở bảng trên và đo **tỉ lệ nhả trong lúc đòn chưa xong**. Nếu người thử thấy kỹ năng ra "trễ", thử biến thể: nhả trước khi đòn xong thì **hủy `re`** của đòn thường để tung sớm hơn.
Phương án dự phòng nếu giữ Chém gây nhầm trên cảm ứng: **nút kỹ năng riêng** ở góc trên-trái khung nút (chỗ đang dành cho ⇄, mục 7b).

**Riêng Xích**: lần chạm đầu là phóng. Nếu **vẫn giữ** khi đầu xích đi tới tầm → chuông **treo** chờ (tối đa 40 tick). Nhả → giật về (Hồi Chấn).
- Nhả sớm khi đầu xích chưa đi được 40 % tầm → coi như phóng thường.
- Hồi Chấn đang hồi → xích về tự động như thường.
- **Chỉ trong lúc treo** Lam đứng neo, không nhảy. Lướt = bỏ treo, xích về không gây sát thương. Lúc phóng thường không có hạn chế này (mục 2d).

Không có thao tác nào cùng một lúc mang hai nghĩa khó đoán:
- Chạm = luôn là đánh thường.
- Giữ = luôn là kỹ năng của vũ khí đang cầm (biểu tượng HUD cho biết là món nào).

Phản hồi trên nút: thêm class kiểu `#b-v.rec` (CSS dòng 60) cho nút Chém: `.tu` (đang tụ), `.san` (kỹ năng sẵn sàng, viền sáng nhẹ).

### 7b. Mang 2 vũ khí, đổi bằng 1 nút

**Kiểm UI hiện tại**: khung nút 176×176 có góc **trên-trái** trống (giữa Chém ở trái-giữa và Vọng ở trên) (CSS 53–63).

Đề xuất (S6):
- Nút **⇄** tròn **40 px × `--k`**, độ mờ như nút khác, có biểu tượng vũ khí phụ.
- **Chỉ hiện khi mang 2 vũ khí**, nên Âm Đao một mình không thêm gì lên màn.
- Bàn phím: phím **Q**.
- Tâm nút cách tâm Chém và tâm Vọng ~ 60–70 px. Luật "nút gần nhất" (`onTouch` 557) đủ tách.
- **Phải đo tỉ lệ chạm nhầm trên iPhone**. Nếu > 3 % thì dời lên cạnh HUD trái-trên (ngón trái nhấc khỏi cần thì Lam dừng – chấp nhận vì đổi đồ không cần làm giữa lúc chạy).

Phương án dự phòng không cần nút: chỉ đổi ở chuông lưu (như KHGP). Đơn giản hơn nhưng mất ý "đổi giữa trận".

HUD: cạnh thanh Vọng thêm **biểu tượng vũ khí đang cầm** (nhỏ) + **vòng thời gian hồi kỹ năng**. Vũ khí phụ hiện mờ trên nút ⇄.
**Thay bộ 2 vũ khí**: ở chuông lưu (menu P1). Bản đầu: tự mang theo món mới nhặt.

### 7c. Luật đổi vũ khí

| Tình huống | Luật |
|---|---|
| Đang đánh / thế tụ | Lệnh đổi được **nhớ 1 lần**, thực hiện khi đòn kết thúc hoặc bị lướt hủy. Không cắt đòn. Thế tụ bị hủy |
| Đang phóng xích | Xích **thu về ngay** theo đường thẳng, **không gây sát thương, không kéo**, rồi mới đổi. Không lấy được Hồi Chấn miễn phí |
| Âm cầu đang bay | **Tan ngay** (hiệu ứng tan, không nổ, không sát thương). Giữ giới hạn 4 hộp trong bản ghi bóng (5f) |
| Đang có Vệ Hồn | Vệ Hồn làm nốt động tác định sẵn rồi tan. Không bị xóa, không bị nhân đôi vì luật **1 Vệ Hồn toàn cục** |
| Vết Dư Âm / dấu Thu Âm còn | Vẫn còn và vẫn vang / vỡ theo giờ. Dấu chỉ vỡ bằng nhát Liềm, nên cất Liềm thì dấu chỉ chờ rồi hết hạn |
| Đang ghi / bóng đang phát | Được đổi. Bóng dùng `REC[i].vk` theo từng tick (mục 5d) |
| Thời gian hồi | **Gắn với từng vũ khí và vẫn đếm khi cất.** Đổi qua lại không xóa hay đặt lại |
| Chống spam | Sau mỗi lần đổi khóa **20 tick**. Đổi xong có 6 tick rút vũ khí (dùng lại ý "rút dao" `RUT_T`, bản ngắn) |
| Trên không, đang lướt, đang bị đánh | Lệnh nhớ, đổi khi hết trạng thái đó |
| Đang tạm dừng | Không nhận |

### 7d. Bộ đánh thường theo hướng

| | Đất | Đất + lên (≥ 0,7) | Trên không | Trên không + xuống (nảy) |
|---|---|---|---|---|
| Âm Đao | Combo 3 | Chém hất | Chém trên không | Chém nảy (pogo đủ) |
| Xích | Phóng ngang | Phóng chéo lên 60° | Phóng ngang, trọng lực ×0,5 khi xích đi | **Không có** (tắt `autoPogo`) |
| Liềm | Quét 1–2 | Quét cung trên đầu | Quét trước-dưới | Quét trúng dưới → nảy yếu ×0,7, không hồi nhảy kép |
| Trượng | Âm cầu | Âm cầu chéo lên 45° | Âm cầu ngang, treo 6 tick | **Không có** |

KHGP đã chốt: đường chính không bắt buộc pogo, nên vũ khí không có pogo vẫn đi hết màn.

---

## 8. Cấu trúc dữ liệu (mở rộng code hiện có, không viết lại)

### 8a. Một bảng cấu hình duy nhất

Theo **giao diện dữ liệu chung ở KHGP2 mục 6a** (`DON`, `VK`, `CAP_VK`, `THE`, `LOAI_QUAI`, `CFG`, `D`, `REC`). Mỗi đòn còn có `chiMang`, `co` (cờ 5b); ví dụ dưới chỉ ghi các trường riêng của Âm Đao.

Đặt cạnh `P` và `ATK` (dòng 250–267). `ATK` hiện tại trở thành `VK.amDao.don`.

```js
// [máu, Thế] thang ×10. Mọi thời gian = tick.
const VK = {
  amDao: {
    ten: 'Âm Đao', pogo: true, luotHuy: 'moiLuc',
    don: {                         // = ATK cũ + sát thương
      1: { su:7, ac:8, re:8,  hs:3, box:[4,-97,86,48],   goc:[10,10] },
      3: { su:9, ac:8, re:16, hs:6, box:[-13,-59,99,59], goc:[10,30] },
      // 2, 4, 5, 6 như ATK
    },
    chiMang: { kieu:'ngauNhien', tyLe:0.05, heSo:1.5 },
    kyNang: { id:'duAm', giu:20, hoi:150,
              chem:{ su:6, ac:8, re:14, box:[0,-100,96,56], goc:[15,20] },
              vet:{ tre:24, goc:[10,10], lan:1 } },
    capBac: [1, 1, 1, 1, 1, 2, 2, 3],   // bậc ngoại hình theo cấp
  },
  xich: { /* dau:{w:32,h:32,y:-72}, tam:196, vDi:14, vVe:16, ... */ },
  liem: { /* don[1].hop = [{t:0, box:[...], mui:false}, ...]  hộp theo tick */ },
  truong: { /* cau:{v:6, tam:260, no:28, toiDa:2}, veHon:{...} */ },
};

// Cấp: chỉ ghi THAY ĐỔI, dạng dữ liệu. Code không viết "if(cap>=3)".
const CAP_VK = {
  amDao: [
    null,
    { mo:['danhThuong'] },                         // 1
    { cong:{ 'don.*.goc.0': 0.20 } },             // 2: +20 % máu đánh thường
    { mo:['duAm'], an:1 },                         // 3
    { dat:{ 'kyNang.vet.goc':[16,20] } },          // 4
    { dat:{ 'chiMang.tyLe':0.12 } },               // 5
    { mo:['buocVang'], an:2 },                     // 6
    { dat:{ 'kyNang.hoi':110 } },                  // 7
    { dat:{ 'kyNang.vet.lan':2 }, an:3 },          // 8
  ],
  // xich, liem, truong …
};
const GIA_DV = [0, 0, 6, 8, 10, 12, 14, 16, 18];
```

### 8b. Ba lớp chỉ số, gộp một lần

`chiSo(vk, cap, amPhu)` = **gốc** (`VK`) → áp **cấp** (`CAP_VK` 1..cap) → áp **Âm Phù**. Kết quả lưu vào `pl.cs` khi:
- trang bị hoặc đổi vũ khí,
- nâng cấp,
- đổi Âm Phù.

**Không tính lại mỗi nhát.** Cờ mở kỹ năng là `pl.cs.co.duAm` (đọc cờ, không so cấp).
Mỗi đòn gốc **chép** số cần dùng từ `pl.cs` sang `D.goc` lúc tạo (8c). Sau đó `pl.cs` đổi thì `D` cũ và bản ghi bóng không đổi theo.
Bảng debug trong ⚙ hiện 3 cột riêng (gốc / +cấp / +Âm Phù) để cân bằng.

### 8c. Đòn đánh thành một đối tượng

`strike(e, src, sw, face, n, hb)` (917) đổi thành `strike(e, D)`.

`D = { ma, src, vk, loai, goc:[máu,Thế], chiMang, heSoCM, hs, co:{ch,duChan,hieuUng,kichDau}, nang, hb, daTrung:[] }` – lấy từ pool, không tạo mới mỗi tick. **Sống suốt vòng đời đòn**: Lam tạo 1 lần ở `startAtk`, dùng cho mọi tick hộp bật; bóng tạo 1 lần / `maGoc` / lần phát (8e). **`goc`, `chiMang`, `co` điền một lần lúc tạo đòn gốc**, không đọc lại `pl.cs` khi trúng.

`applyHits(D)` kiểm `D.daTrung` thay cho `swP/swE` (S7).
- Mỗi lượt xích (đi / về), mỗi âm cầu, mỗi vết Dư Âm, mỗi lần nện của Vệ Hồn = **một `D` riêng**.
- Vì vậy "mỗi mục tiêu trúng số lần xác định" là tự nhiên.

Bản nhớ Cộng hưởng trên mục tiêu: `e.chP = {f, ma, mauCoSo}`, `e.chE = {f, ma}`; chỉ ghi khi `D.co.ch`. Ghép xong xóa cả hai (thay `lastP/lastE` dòng 921).

### 8d. Vật thể mới: pool cố định như `PARTS / WAVES / FXS`

| Pool | Cỡ | Cập nhật |
|---|---|---|
| `XICH` | 1 | sau `updatePlayer()` |
| `CAU` (âm cầu) | 4 | cùng chỗ |
| `VET` (Dư Âm) | 2 | cùng chỗ |
| `DAU` (dấu Thu Âm) | gắn trên mục tiêu: `e.dau = {t, tuoi}` | – |
| `VEHON` | 1 | cùng chỗ |

Tất cả cập nhật trong `step()` **sau dòng `if(S.hitstop>0){…return;}` (1303)**:
- Hitstop thì cả đạn, vết, Vệ Hồn cùng đứng (đúng như bóng hiện nay).
- Tạm dừng thì `step()` đã thoát ở 1295.

### 8e. Bản ghi bóng

Mỗi ô `REC` (310) thêm:
- `vk`: vũ khí của tick đó (vẽ đúng thân bóng),
- `hop[0..3]`: **danh sách tối đa 4 hộp** (5f), mỗi hộp `{loai, x, y, w, h, ve:{…}, goc:[máu,Thế], co, maGoc}`,
- `n`: số hộp đang dùng.

`recordFrame()` (898) chép hộp đang bật **cùng `goc` đã chốt** của `D` sinh ra nó. `step()` dòng 1315 gọi `applyHits` cho từng hộp với `D` bóng **tra theo `maGoc` trong bảng của lần phát này** (`src 'e'`, mã mới, `goc` lấy từ bản ghi): chưa có thì tạo, có rồi thì dùng lại – **không** tạo `D` mới mỗi tick (PH3 sửa 1). Loại hộp chưa có hàm vẽ cho bóng thì không ghi (5f).
Vẫn ghi **trạng thái**, không ghi phím → tính xác định giữ nguyên.

### 8f. Lưu game (hiện chưa có)

Khóa `localStorage` **`tv-luu-1`**. Ghi khi chạm chuông lưu và ngay sau khi nâng cấp. Không ghi trong trận.

```js
{ phienBan: 1,
  lam: { mauToiDa: 5, nacVong: 2 },
  vk: { amDao: { cap: 4 }, xich: { cap: 1 } },   // chưa có = không có khóa
  mang: ['amDao', 'xich'], dangCam: 0,
  vatLieu: { dv: 13 }, an: 1,                     // số Ấn cao nhất
  amPhu: { co: ['duChan'], o: ['duChan', null] },
  daMo: ['ruong-rb-1', 'manh-tim-a2'],            // rương / vật cố định đã nhặt
  chuong: 'RB', capMax: 4 }                        // capMax cho giá bắt kịp
```

Tải và kiểm dữ liệu:
- Đọc trong `try`. Lỗi JSON → chép chuỗi gốc sang `tv-luu-hong`, báo một dòng, chơi mới.
- `phienBan` cũ → chạy hàm nâng phiên bản theo thứ tự (1 → 2 → …). `phienBan` mới hơn code → **không ghi đè**, chơi tạm không lưu.
- Từng trường:
  - kẹp `cap` vào 1..8,
  - bỏ mã vũ khí lạ,
  - `mang` tối đa 2 và phải có trong `vk`,
  - `dv` ≥ 0 và ≤ 9999,
  - `an` trong 0..3,
  - `daMo` chỉ giữ mã có trong bản đồ.
- **Save cũ của demo hiện tại**: không có (chỉ có `tv-demo-mute`, `tv-demo-btn`) → không cần chuyển đổi. Hai khóa đó giữ nguyên.

---

## 9. Rủi ro, chi phí animation / VFX, phần nên hoãn

### 9a. Quyết định kỹ thuật cần chốt trước khi làm clip vũ khí

Rig Lam mới đang **nướng sẵn cả người + dao vào sheet** (≈ 0,3 MB bộ nhớ ảnh ước tính mỗi khung). Nhân 4 vũ khí × 3 bậc ngoại hình là không chịu nổi.

Đề xuất:
- **Tách vũ khí + găng gần thành lớp vẽ trực tiếp.**
  - Sheet thân nướng **không có vũ khí và găng gần**.
  - JSON mỗi khung ghi **vị trí + góc của găng gần** (tay cầm).
  - Game vẽ 2 mảnh (vũ khí, rồi găng gần đè lên) bằng `drawImage` có xoay. Giống cách quái/boss đang vẽ từ mảnh (`quai-boss-runtime.js` 131–140).
  - Đổi bậc ngoại hình = đổi **1 ảnh nhỏ**.
  - Chi phí: sửa `sprite.py` xuất thêm rãnh biến đổi (**S–M**).
- **Phương án mạnh hơn, đáng đo**: vẽ **cả Lam** từ 13 mảnh (như boss Cách A: ~16 MB thay ~400 MB, cùng cách ước tính). Clip lưu thành rãnh biến đổi thay vì ảnh. Nếu chọn thì mọi clip vũ khí rẻ hơn nhiều (**M**).

**Bài đo riêng "Lam vẽ từ mảnh so với sheet"** (PH2 mục 1, 5.14) – trang riêng, **không đổi runtime game**:

| Đo | Cách | Ghi chú |
|---|---|---|
| Thời gian khung | `performance.now()` quanh phần cập nhật + vẽ Lam, mỗi khung; báo trung vị, p95, p99 và số khung > 16,7 ms trong 60 s | 2 chế độ chạy cùng clip, cùng cảnh: sheet / mảnh. Thêm cảnh "1, 4, 8 Lam cùng lúc" để thấy độ dốc |
| Bộ nhớ ảnh **ước tính** | Tổng `rộng × cao × 4` byte của mọi ảnh / canvas đã nạp cho Lam ở mỗi chế độ | **Không khẳng định là RAM Safari**: Safari không cho trang đọc bộ nhớ thật, nên chỉ ghi "ước tính". Nếu có Mac + Web Inspector thì chụp thêm số Timeline làm tham khảo |
| Chất lượng | Ảnh chụp 2 chế độ cùng khung, chồng lên nhau | Mảnh xoay có thể lộ mép; ghi lại nếu thấy |
| Máy | iPhone thật, nút "Chép số" xuất bảng trên | Số trên Chromium giả lập không dùng để quyết |

- **Chỉ nạp sheet của 2 vũ khí đang mang.** Đổi bộ ở chuông lưu thì nạp / giải phóng.

### 9b. Chi phí từng vũ khí (rig 13 mảnh, đã tách lớp vũ khí)

Bộ nhớ ảnh ước tính = số khung × ~0,3 MB (thân không vũ khí, sheet 2x). Công sức: **S** ≤ 1 ngày, **M** 2–4 ngày, **L** 1–2 tuần.

| Vũ khí | Clip thân mới | Khung ≈ | Bộ nhớ ảnh ≈ | Ảnh gen | VFX / code | Công sức |
|---|---|---|---|---|---|---|
| Âm Đao | Combo 2, 3, hất, trên không, nảy (**đã nằm trong KHGP P1#6** cho Lam mới) + **tụ (lặp 12) + chém vang (28)** | 40 thêm | +12 MB | 1 ảnh: lưỡi âm thoa × 3 bậc | Dải âm nhận (code), vết Dư Âm (1 ảnh gen 4–6 khung), giữ Chém, `D` / `daTrung` | **M** (riêng phần vũ khí) |
| Xích | Phóng đất (22), phóng trên không (22), giữ / treo (lặp 12), giật + bắt (16). Chéo lên = cùng clip, xoay tay | 72 | +22 MB | 1 ảnh: chuông đầu xích × 3 bậc + 1 mắt xích | Vẽ xích lặp mắt theo đường; trạng thái đi / chờ / về; va tường; kéo; điểm ngọt | **L** (1–1,5 tuần) |
| Liềm | Quét 1 (34), quét 2 (36), quét lên (30), quét trên không (26), tụ (12), Thu Âm (36) | 174 | +52 MB | 1 ảnh: liềm × 3 bậc; 1 ảnh: dấu nứt 3 trạng thái | Bảng hộp đòn theo tick (cung), mũi liềm, dấu trên địch, vỡ, Vỡ Lan | **L** (1,5 tuần) – nhiều clip nhất |
| Trượng | Bắn (24), bắn trên không (20), tụ (12), gõ trượng (20). Chéo lên = cùng clip | 76 | +23 MB | 1 ảnh: trượng × 3 bậc; âm cầu + nổ | Đạn, nổ vùng, **Vệ Hồn: rig ~6 mảnh + 3 clip (hiện 18, nện 8 + thu, tan 20)** | **L+** (2 tuần) |

Giảm chi phí:
- Liềm: quét lên dùng lại quét 2 xoay ngược. Quét trên không dùng lại quét 1 với chân co (−56 khung).
- Vệ Hồn: bản đầu dùng **rig NPC Thợ Rèn Hòn** (đã có mảnh + động tác gõ búa), tô màu đồng hồn, mờ 70 %. Ảnh riêng gen sau khi duyệt luật.
- Vẽ Vệ Hồn bằng mảnh (như NPC) → gần như không tốn bộ nhớ sheet.

### 9c. Rủi ro

| Rủi ro | Mức | Giảm |
|---|---|---|
| Bộ nhớ trên iPhone khi mang 2 vũ khí sheet nặng (Liềm) | Cao | 9a: tách lớp + chỉ nạp 2 món; bài đo riêng (thời gian khung + bộ nhớ ảnh ước tính) |
| Giữ Chém ra nhầm kỹ năng | Trung bình | Ngưỡng 20–24, đo log; vòng sáng trên nút báo trước khi tung |
| Vệ Hồn bị hiểu là bóng | Trung bình | Màu đồng, dáng khác, không công tắc. Hỏi người thử |
| Số liệu nhân chồng | Trung bình | Luật 5c + log mỗi lần trúng: `src`, hệ số được chọn, [máu, Thế] |
| Xích + tường + thiết kế màn (tầm 230) | Trung bình | Va tường là dừng; kiểm phòng có hành lang ngắn |
| Đổi vũ khí lách thời gian hồi | Thấp | Hồi gắn vũ khí, vẫn đếm khi cất; 1 Vệ Hồn toàn cục |
| Phụ thuộc P0-A / P0-B (Thế, bấm chờ, tỷ lệ bóng) | Cao | Prototype Âm Đao dựng trên P0-A; số bóng là biến cấu hình (mục 5d) |

### 9d. Nên hoãn

- Móc địa hình / kéo Lam (theo yêu cầu).
- Vệ Hồn có AI, đi theo, giữ công tắc, Cộng hưởng.
- Kỹ năng trên không.
- Bóng phát lại kỹ năng / hiệu ứng.
- Menu thay bộ ở chuông lưu (P1).
- Âm Phù riêng từng vũ khí.
- Xích bắn chéo xuống.
- Ngoại hình bậc 3 cho đủ 4 món.
- Chí mạng sau né sát đòn (chờ KHGP P1).

---

## 10. Kế hoạch prototype nhỏ: Âm Đao cấp 1–4 (đã duyệt, làm sau P0-A)

**Điều kiện**: dựng **sau P0-A** của KHGP2 (hàng chờ 1 nhát, `su` 7/7/9, ngưỡng cần gạt, Chuông Gỗ + quái gác có Thế). Phần bóng/Cộng hưởng dùng cấu hình **A (ghi chủ động)**; chỉ thử với Vọng Chiến sau khi P0-B có kết quả.

**Trang**: `game/thu-am-dao/`, sinh từ `demo.html` bằng script (cách `thu-re-muc`). `demo.html` không đổi, không publish.
- Lam **rig-v4** (đang chạy trong game). Âm nhận vẽ bằng code nối từ mũi dao.
- Thế tụ dùng khung nhát 1 giữ yên + ánh sáng; chém vang dùng clip nhát 3. **Chưa làm clip mới.**

**Phòng**: phòng B + C của `so-do-phong-thu-v2.png` (2 Chuông Gỗ lệch pha + quái gác vỏ), thêm **1 hình nộm** ở phòng A:
- máu 999, Thế 60,
- hiện số [máu, Thế] mỗi lần trúng,
- hiện tổng sát thương 10 giây.

**Có trong prototype:**
1. `VK.amDao` + `CAP_VK.amDao` (chỉ cấp 1–4) theo giao diện dữ liệu chung (KHGP2 mục 6).
2. Âm nhận nhìn thấy được, hộp mép 90, **chỉ sáng đúng các tick hộp bật**.
3. Giữ Chém → Dư Âm (mốc 3), đủ 3 trường hợp nhả ở bảng 7a; vết sinh theo lần dùng; cấp 4 vết [16,20].
4. `strike(e, D)` + `daTrung`; chỉ số chốt lúc tạo đòn; cờ `co`; công thức 5c; chí mạng 5 % gieo lúc vung, hạt giống cố định.
5. **Chọn cấp 1 / 2 / 3 / 4 bằng nút trong ⚙ và `?cap=`** → so trước/sau trong **cùng phòng, cùng chuỗi thao tác**. Đổi cấp lúc bóng còn → bóng giữ số đã chốt (ví dụ 3).
6. Log: mỗi lần chạm Chém (thời gian giữ, kết cục theo KHGP2 mục 3), mỗi lần ra kỹ năng (trường hợp nhả nào ở 7a), mỗi lần trúng (`src`, `goc`, hệ số, [máu, Thế], mục tiêu, có Cộng hưởng không).

**Không có**: đổi vũ khí, lưu game, vật liệu, menu thợ rèn, Lam mới, cấp 5–8, menu, đủ 4 vũ khí.

### 10a. Ba câu prototype phải trả lời (PH2)

| Câu hỏi | Cách đo | Đạt khi |
|---|---|---|
| **1. Đánh thường có nhạy hơn không?** | So `su` 11 cũ / 7-7-9 mới cùng phòng; log từ chạm → hộp đòn; log kết cục mỗi lần chạm | Chạm → hộp đòn ≤ `su` + 1 tick ở mọi cấp, kể cả khi bật tính năng giữ. **Mọi lần chạm có đúng 1 kết cục theo luật** (không lần nào "biến mất"). 3 người thử: ≥ 2 chọn bản mới, không ai thấy ra đòn ngoài ý muốn |
| **2. Dư Âm có dễ chủ động dùng trên cảm ứng không?** | Log thời gian giữ của mọi lần chạm; đếm kỹ năng ra ngoài ý muốn (hỏi ngay sau lần đó); đếm lần muốn ra mà không ra; tỉ lệ ba trường hợp nhả ở 7a | Trên iPhone thật: ra nhầm < 3 % số lần giữ; muốn mà không ra < 10 %; người thử tự đặt được vết để địch bước vào ≥ 1 lần sau 5 phút |
| **3. Mở skill và nâng skill có khác biệt nhìn thấy, cảm thấy được không?** | 3 video cùng kịch bản: cấp 1 → 3 → 4; số hình nộm 10 s; bảng 4b trên Chuông Gỗ / quái gác | Người thử **không xem số** vẫn nói được cấp 3 khác cấp 1 ở đâu và cấp 4 khác cấp 3 ở đâu. Cấp 2 được phép "khó nhận ra" (4b) – ghi lại kết quả, không tính là trượt |

### 10b. Tiêu chí kỹ thuật

| Tiêu chí | Đạt khi |
|---|---|
| Hình khớp hộp | Khung "trúng" và khung 0 của vệt chém hiện đúng tick hộp bật theo quy ước tick KHGP2 3c (`vetBatDau = su`) sau khi cắt `khung_theo_atkT` (mục 1a); âm nhận chỉ sáng khi hộp bật. Kiểm bằng lớp debug hộp đòn ở tốc độ ¼ |
| Không vỡ luật | Hitstop ≤ 8; mỗi `D` trúng mỗi mục tiêu ≤ 1 lần; mỗi nhát ghép Cộng hưởng ≤ 1 lần; chí mạng không bị bỏ dù bóng trúng trước; `goc.máu = 0` → 0; vết `'k'` không Cộng hưởng; sóng Dư Chấn không sinh sóng |
| Vết theo lần dùng | 10 lần dùng Dư Âm (5 trúng, 5 hụt, 1 lần trúng 2 con) → đúng 10 vết; 0 vết từ đánh thường |
| Replay | Cùng đoạn ghi → bóng đúng vị trí ở 60 / 120 Hz và khi có hitstop. Bóng không sinh vết. Mọi hộp của bóng có hình tương ứng |

**Công sức**: **M** (3–4 ngày).
Sau khi duyệt: **Xích** (L) → **Liềm** (L) → **Trượng** (L+). Mỗi món có cổng duyệt riêng, cùng phòng thử + hình nộm.

---

## Sáu câu hỏi trước – đã có trả lời (PH2 mục 1)

| Câu hỏi | Chủ dự án chốt | Kế hoạch này làm |
|---|---|---|
| 8 hay 10 cấp? | 8 cấp, mốc 1/3/6/8 để thử | Giữ |
| Giữ Chém dùng kỹ năng? | Duyệt prototype, chưa chốt cho cả 4 món | Ghi là phương án thử (S3, 7a) + phương án nút riêng |
| Bóng = sát thương đòn ghi × hệ số? | Đồng ý, chốt chỉ số lúc tạo đòn gốc | 5c, 5d, 8c, 8e |
| Dao hiện tại thành Âm Đao, tầm 90? | Dùng bộ đòn cũ; tầm 90 chỉ duyệt khi âm nhận khớp hộp | Tiêu chí "Hình khớp hộp" ở 10b |
| Nút đổi vũ khí? | Giữ mục tiêu đổi bằng 1 nút, hoãn bố trí tới prototype Xích | 7b giữ là đề xuất, không làm trong prototype Âm Đao |
| Đo Lam vẽ từ mảnh? | Đo riêng, chưa đổi runtime | Bài đo ở 9a |

---

## Đã sửa theo phản hồi 2

| # | Điểm PH2 mục 5 | Đã sửa ở đâu | Tóm tắt |
|---|---|---|---|
| 1 | Mở Dư Âm trước boss đầu; nguồn Ấn Rèn; thưởng boss | S8, 3 (Âm Đao cấp 3, Xích cấp 1), 6b | Ấn I từ tinh anh đường chính (lời dẫn Thợ Rèn Hòn), rương ≥ 14 ĐV trước đó; boss thưởng Xích + ~10 ĐV (thay: ĐV đủ Âm Đao cấp 4) |
| 2 | Giữ Chém chỉ là phương án thử; nhả trước khi đòn thường xong | S3, 2b, 7a | "Đã nạp" ngay lúc đạt ngưỡng; nhả khi đòn chưa xong → kỹ năng vào hàng chờ 1 chỗ, tung khi hết đòn (trễ ≤ 16/24 tick, có vòng báo); xóa khi bị đánh/lướt/chết/đổi phòng; log 3 trường hợp; dự phòng nút riêng |
| 3 | Xích phóng thường linh hoạt, hạn chế mạnh chỉ khi giữ Chuông Treo | 2c, 2d, 3 (Xích), 7a | Bỏ "×0,4, không nhảy" khi phóng thường; rủi ro ở thu + hồi; đứng neo chỉ khi treo; chưa chốt số |
| 4 | Chốt chỉ số lúc tạo đòn gốc | 5c, 5d, 8b, 8c, 8e | `D.goc` chép từ `pl.cs` lúc tạo; bản ghi lưu `goc`; bóng không tra lại cấp |
| 5 | 0 là 0 | 5c bước 5, 5e ví dụ 4, 3 (Chuông Treo) | Tối thiểu 1 chỉ khi `goc.máu > 0` và không bị chặn |
| 6 | Chí mạng / Cộng hưởng đối xứng | 5a, 5c bước 6, 5e ví dụ 3 | Chí mạng gieo lúc vung, không hồi tố; cộng thêm = `máuCơSở` đã lưu chưa chí mạng; chặn vỏ theo Thế trước lần trúng → cùng tổng dù ai trước |
| 7 | Cờ chống proc dây chuyền | 5b, 8c | Cờ `co.ch / duChan / hieuUng / kichDau`; Dư Chấn không sinh Dư Chấn; ≤ 1 đợt / mục tiêu / lần trúng |
| 8 | Vết Dư Âm theo lần dùng skill | 2d, 3, 5c (bảng hiệu ứng) | 1 vết / lần dùng kể cả hụt; dấu theo từng mục tiêu; mỗi hiệu ứng có luật đếm riêng |
| 9 | Sửa ví dụ quái gác | 5e ví dụ 2 | Viết lại đủ hành động + tick; nhát thường không sinh vết; vết chỉ từ lần giữ Chém |
| 10 | Không mặc định 2 hộp đạn; liệt kê vật thể + cách vẽ; không sát thương vô hình | 5f, 7c, 8e | Danh sách tối đa 4 hộp (Trượng); đổi vũ khí làm tan đạn cũ; hộp không có hình thì không ghi |
| 11 | Giá trị cấp theo đối thủ thực tế | 3 (cấp 2, 5), 4b | Bảng số nhát trên 5 loại địch; nói thẳng cấp 2 và cấp 5 là phần phụ |
| 12 | Giá bắt kịp theo cấp đích; trọng lượng thay "máu ≤ 60" | 6c, 3 (Xích + bảng hạng nặng), 2d | `ceil(GIA_DV[cấp đích]/3)` khi cấp đích ≤ `capMax`, ví dụ khớp; 4 hạng nhẹ/vừa/nặng/neo |
| 13 | Âm Phù đổi sát thương / hồi chiêu có điều kiện | 6a | Bỏ lệnh cấm tuyệt đối; bảng ví dụ đánh đổi; cùng định dạng dữ liệu với bảng cấp |
| 14 | Đo riêng Lam vẽ từ mảnh, không khẳng định RAM Safari | 1a, 1b, 9a, 9c | Bài đo thời gian khung + bộ nhớ ảnh **ước tính**; mọi số "MB" trong file là ước tính rộng × cao × 4 |
| + | Ba câu prototype phải trả lời | 10a | Bảng cách đo + tiêu chí đạt cho từng câu |

---

## Đã sửa theo phản hồi 3

| # | Điểm PH3 | Đã sửa ở đâu | Tóm tắt |
|---|---|---|---|
| 1 | Mã đòn replay bền suốt vòng đời đòn | 5d, 8c, 8e | Bảng `maGoc → maReplay` theo từng lần phát; không tạo `D`/`daTrung` mỗi tick; xích tách lượt đi/về bằng hai `maGoc` khi luật cho phép |
| 2 | Không khẳng định luật phá vỏ cho cùng tổng mọi thứ tự | 5c bước 3, 5e ví dụ 3 | Chỉ bảo đảm 3 điều của KHGP2 6b; dòng 6 bảng "Đã sửa theo phản hồi 2" ("cùng tổng dù ai trước") chỉ đúng khi mục tiêu không có vỏ |
| 3 | Quy ước tick | 10b | Theo KHGP2 3c: `vetBatDau = su`, khung 0 vệt hiện cùng tick hộp |
