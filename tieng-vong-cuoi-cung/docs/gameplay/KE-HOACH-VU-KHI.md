# Kế hoạch 4 vũ khí + tiến trình nâng cấp – BẢN ĐỂ DUYỆT (27/10/2026)

Trả lời `docs/gameplay/YEU-CAU-KE-HOACH-VU-KHI.md`. **Chưa sửa code, chưa publish.** Mọi con số là **số để thử, chưa cân bằng**.
Chưa chơi thử trên iPhone thật: nhận xét về cảm ứng là suy luận từ code, phải kiểm lại trên máy.
Đọc cùng `KE-HOACH-GAMEPLAY.md` (gọi tắt **KHGP**). Chỗ nào kế hoạch này muốn đổi KHGP thì ghi **"Đề xuất sửa KHGP mục …"** (gom lại ở cuối mục 1).

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
| Chi phí ảnh của Lam mới | Sheet nướng sẵn: chém 1 = 26 khung = **8,03 MB RAM**; đứng 9,76; chạy 5,55. Tức khoảng **0,3 MB mỗi khung** | `art/huong-moi/lam-rig/so-lieu.json` → `sheet` |
| Vẽ trực tiếp từ mảnh rẻ hơn nhiều | Boss: vẽ từ mảnh ≈ 16 MB, sheet 2x ≈ 406 MB. Quái/boss trong game đang vẽ từ mảnh | `game/thu-boss/GHI-CHU.md` mục 1, 3; `game/runtime/quai-boss-runtime.js` `maTran` 113, vẽ 131–140 |
| GDD | Có 6 "Chuông" vũ khí, Đồng Cổ để rèn, Thợ Rèn Hòn, Âm Phù có dòng ngẫu nhiên. **Phần ngẫu nhiên và độ hiếm đi ngược yêu cầu lần này** → kế hoạch này không dùng | `docs/gdd.md` mục 6–7 |
| Hướng mỹ thuật | Teal = Vọng / ký ức. Vàng đồng = chuông. Cam đỏ = nguy hiểm. Dao "ngà xám, vàng chỉ ở chắn tay" | `art/huong-moi/TU-VAN-CHUYEN-GIA-2-CO-TICH-CHUONG-TAN.md` mục 2, 3 |

### 1b. Giả định (chưa kiểm được)

| Giả định | Cách kiểm |
|---|---|
| Một lần chạm thường giữ dưới ~12 tick trên iPhone, nên ngưỡng "giữ" 20 tick không ra nhầm kỹ năng | Log thời gian giữ của mỗi lần chạm Chém trong phòng thử, 3 người |
| Ngón cái giữ Chém 20–24 tick không thấy "ì" vì nhát 1 vẫn ra ngay | Hỏi người thử + log |
| iPhone chịu được thêm 1 lớp vũ khí vẽ trực tiếp + đạn/xích/Vệ Hồn ở 60 tick/s | Nút "Chép số" trên máy thật |
| Mọi hệ thống KHGP P0 (Thế, bấm chờ, `su` 7/7/9, chạm đúp Vọng) sẽ được duyệt như đề xuất | Kế hoạch này dựa trên chúng. Nếu P0 đổi thì phải xem lại mục 5 |
| Nút đổi vũ khí nhỏ ở góc trên-trái khung nút không bị chạm nhầm | Thử trên iPhone (mục 7) |

### 1c. Chỗ đụng KHGP – đề xuất sửa

| # | Đề xuất sửa KHGP mục … | Vì sao |
|---|---|---|
| S1 | **Mục C, 4, D, E, F – đổi tên "Dư Âm" của Tiếng Vọng (chạm đúp V) thành "Hồi Vọng"** | "Dư Âm" nay là kỹ năng của Âm Đao. Hai thứ cùng tên mà khác luật sẽ rối. Luật Hồi Vọng giữ nguyên |
| S2 | **Mục C, 6, I#7: bỏ Búa Chuông Nứt** | Yêu cầu mới bỏ Chùy/Búa. Việc phá Thế chia cho Liềm (dấu vỡ) và Xích (Hồi Chấn) |
| S3 | **Mục 3 (đòn nặng giữ–thả) → "giữ Chém = kỹ năng của vũ khí đang cầm"** | Dùng đúng cách KHGP đã chọn: nhát 1 ra ngay khi bấm, giữ tiếp mới tụ. Không còn đòn nặng riêng |
| S4 | **Mục 6: "Dao Giữ Chuông" = Âm Đao cấp 1** | Cùng bộ đòn `ATK[1..6]`. Chỉ thay mảnh dao bằng lưỡi âm thoa và thêm âm nhận. Không tốn clip mới |
| S5 | **Mục F: nhân máu và Thế ×10** (Chuông Gỗ 4 → 40, Mẹ Nấm 24/12 → 240/120, bóng [0,1] → [0,10]…) | Cần chỗ cho tăng 15–25 % mỗi cấp. Số nguyên vẫn đủ |
| S6 | **Mục 4 "không thêm nút thứ năm": cho phép 1 nút phụ đổi vũ khí** (nhỏ, chỉ hiện khi mang 2 vũ khí) | Yêu cầu mới muốn đổi bằng một nút. Nút này không phải nút chiến đấu (mục 7) |
| S7 | **Mục 4 "không proc vô hạn": thay ô nhớ `swP/swE` bằng danh sách "đã trúng" gắn theo từng hộp đòn** | Bắt buộc khi có xích / âm cầu / Vệ Hồn sống cùng lúc với nhát chém (xem 1a) |
| S8 | **Mục 9: thưởng boss = Ấn Rèn I** (thay "Búa ở P2") | Mốc lớn gắn với boss (mục 6) |

Không đổi: thanh Thế + 2 cờ `vo`/`mat`, né sát đòn (P1), bóng một mình chỉ trừ Thế, Cộng hưởng "Thế về 0 + máu ×2 nhát của Lam", khóa 45 tick, 2 nấc Vọng, ghi chủ động miễn phí, Âm Phù Dư Chấn / Tàn Ảnh / Bóng Chắn.

---

## 2. Bản sắc, ưu/nhược và vòng đánh

### 2a. Phản biện trước khi chốt

| Vấn đề | Ở đâu | Xử lý đề xuất |
|---|---|---|
| **Trùng tên + trùng ý** | Dư Âm (Âm Đao) và "Dư Âm" chạm đúp V (KHGP) đều là "đòn lặp lại" | Đổi tên bên Vọng (S1). Phân biệt bằng luật: Dư Âm của Âm Đao **chỉ là vết chém**, không có thân, vang **1 lần sau 24 tick**, **không** kích Cộng hưởng. Bóng là thân Lam phát lại cả đoạn |
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

- **Chạm Chém = đánh thường. Giữ Chém = kỹ năng của vũ khí đang cầm.** Không thêm nút kỹ năng.
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
| Ưu | Nhanh, hủy bằng lướt mọi lúc, có pogo, đánh trên không tốt | An toàn, xuyên hàng, kéo quái nhỏ | Trúng nhiều con, trừ Thế nhóm | Đánh từ xa, Lam tự do di chuyển |
| Nhược (giữ lại khi nâng) | Ít Thế, phải đứng gần | Hụt thì phải chờ thu xích; khi xích bay Lam đi ×0,4, không nhảy; không pogo | Chậm; không hủy được khi hộp đang bật; đi ×0,5 khi vung; pogo yếu | Sát thương thấp; cầu chậm; không pogo; Vệ Hồn hồi lâu |
| Với bóng | Bóng chém nhiều nhát nhanh → dễ Cộng hưởng | Bóng phóng xích theo đúng tuyến đã ghi | Hộp quét to → bóng dễ trúng | Bóng bắn lại âm cầu (đúng quỹ đạo) |

### 2d. Vòng đánh của từng vũ khí

**Âm Đao.** Áp sát, combo 1-2-3. Nhát 3 trừ Thế. Lướt né rồi vào lại.
Khi có Dư Âm: giữ Chém để chém một nhát vang, lùi ra né. Vết vang lại đúng lúc địch bước vào.
Âm nhận là phần lưỡi bằng âm, nối dài **+30 %** (68 → ~90 px). **Chỉ sáng trong 8 tick hộp đòn bật**, màu ngà sáng viền đồng (không teal). Mép sáng trùng mép hộp đòn → "thấy trúng mới trúng".
Điều này cũng trả lời câu hỏi 1 trong `thu-lam-moi/GHI-CHU.md`: không cần thu hộp còn 66, vì phần thiếu chính là âm nhận nhìn thấy được. Đổi duy nhất: mép trước hộp 95 → 90.
Không đòn thường nào thành đạn bay.

**Xích Chuông.** Đứng ở tầm 150–200, phóng xích lúc địch lấy đà.
Lượt đi trúng mỗi con 1 lần, lượt về thêm 1 lần nhẹ và kéo quái nhỏ (không có Thế) lại 32 px. Kéo không ngắt đòn đã vào (đúng luật KHGP mục C).
Địch lớn (có Thế) chỉ mất Thế, không bị kéo. Chạm tường thì xích dừng và về.
Rủi ro: hụt là phải chờ khoảng 30 tick xích về. Lướt được, nhưng xích bị bỏ (về ngay, không gây sát thương) và khóa phóng 20 tick.

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
| 2 | 6 ĐV | Sát thương đánh thường **+20 %** (10 → 12) | Chuông Gỗ (40) chết sau 4 nhát thay vì 4 nhát có lẻ → combo 3 + 1 | – |
| **3 – MỐC** | 8 ĐV + Ấn I | **Mở Dư Âm** (giữ ≥ 20 tick → thả): chém [15,20], để lại vết, sau 24 tick vang [10,10]. Hồi 150 tick | Có đòn "đánh rồi lùi": vết vang lúc địch đuổi theo | Clip tụ (lặp) + chém vang. VFX vết Dư Âm (ảnh gen, ngà sáng). Âm "vang" |
| 4 | 10 ĐV | Vết vang **[10,10] → [16,20]** | Dư Âm thành đòn đáng tính | – |
| 5 | 12 ĐV | Chí mạng **5 → 12 %** | Thêm "nhát may" thỉnh thoảng | – |
| **6 – MỐC** | 14 ĐV + Ấn II | **Bước Vang**: lướt xuyên qua vết đang treo → vết vang ngay, sát thương ×1,5, hoàn lại thời gian hồi lướt | Lướt vừa né vừa kích đòn. Không cần nút mới | Ngoại hình bậc 2. Vết vang to hơn (dùng lại ảnh, phóng 1,3) |
| 7 | 16 ĐV | Hồi Dư Âm **150 → 110 tick** | Dùng được 2 lần mỗi lượt giao tranh dài | – |
| **8 – MỐC** | 18 ĐV + Ấn III | **Trọn Tiếng**: vết vang **2 lần** (lần 2 = ½ sát thương, cách 18 tick) | Một vết khóa được một lối đi ngắn | Ngoại hình bậc 3. Âm nhận sáng hơn (**không tăng tầm**) |

### Xích Chuông

| Cấp | Điều kiện / chi phí | Tăng chỉ số hoặc mở | Thay đổi khi chơi | Asset cần thêm |
|---|---|---|---|---|
| **1 – MỐC** | Nhặt ở vùng sau boss (đề xuất Rễ Mục) | Phóng 196 px; đi [12,10], về [6,5]; kéo quái nhỏ 32 px; điểm ngọt 20 % cuối tầm ×1,5 | Đánh từ xa, phải canh điểm ngọt | Mảnh chuông đầu xích bậc 1, 1 mắt xích (lặp bằng code). Clip phóng, phóng trên không, bắt xích |
| 2 | 6 ĐV | Lượt đi **+25 %** (12 → 15) | Quái nhỏ chết sau 3 lần phóng | – |
| **3 – MỐC** | 8 ĐV + Ấn I | **Mở Hồi Chấn**: giữ khi phóng → chuông treo ở đầu tối đa 40 tick; thả → giật về 24 px/tick, lượt về [18,25], kéo quái nhỏ về sát Lam. Hồi 90 tick | Chọn đúng lúc thả để kéo quái vào combo | Clip giữ xích (lặp) + giật. VFX xích căng sáng. Âm giật |
| 4 | 10 ĐV | Hồi Chấn **[18,25] → [24,35]** | Phá Thế từ xa đáng giá | – |
| 5 | 12 ĐV | Điểm ngọt rộng **20 → 30 %** cuối tầm | Dễ trúng điểm ngọt hơn | – |
| **6 – MỐC** | 14 ĐV + Ấn II | **Chuông Treo**: khi treo, chuông ngân mỗi 12 tick [0,6] lên địch trong 48 px | Giữ lâu = mài Thế từ xa, nhưng Lam đứng neo (rủi ro) | Ngoại hình bậc 2. Vòng sóng nhỏ quanh chuông (vẽ code) |
| 7 | 16 ĐV | Hồi Hồi Chấn **90 → 60 tick** | Dùng gần như mỗi lần phóng | – |
| **8 – MỐC** | 18 ĐV + Ấn III | **Xích Trọn**: tầm **196 → 230** (+17 %), Hồi Chấn kéo cả quái vừa (không Thế, máu ≤ 60) | Hoàn thiện vai "kéo về" | Ngoại hình bậc 3. Thiết kế màn: kiểm hành lang dài ≥ 230 px |

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
- Không có Âm Phù tăng chí mạng ở bản đầu.
- Ngẫu nhiên dùng bộ sinh số có hạt giống riêng (ví dụ `mulberry32`, hạt đặt lại mỗi lần vào phòng), **không dùng `Math.random`**. Log phòng thử nhờ đó chạy lại được. Bóng không bị ảnh hưởng vì bóng phát lại trạng thái.

### 5b. Ba loại nguồn đòn

Đặt tên trong code bằng trường `src`:

| `src` | Là gì | Chí mạng | Cộng hưởng | Sinh hiệu ứng phụ (vết, dấu, kéo) | Rút hồi nấc Vọng (−20 tick, KHGP) | Hitstop tối đa |
|---|---|---|---|---|---|---|
| `'p'` Lam | Đánh thường + đòn chính của kỹ năng (nhát chém vang, giật Hồi Chấn, quét Thu Âm). Đầu xích / âm cầu do Lam phóng cũng là `'p'` | có | có | có | có | theo đòn |
| `'e'` bóng | Hộp đòn bóng phát lại | không | có | **không** | không | `hs−1` (như code) |
| `'k'` phụ | Vết Dư Âm, dấu vỡ, Vỡ Lan, Chuông Treo, Vệ Hồn, sóng | không | **không** | **không** (không dây chuyền) | không | ≤ 3 (dấu vỡ 5) |

### 5c. Thứ tự tính sát thương (một lần trúng)

1. **Trúng?** Hộp đòn chồng mục tiêu, và mục tiêu **chưa nằm trong danh sách "đã trúng" của hộp này** (S7).
2. **Số gốc [máu, Thế]** = bảng đòn của vũ khí **đã gộp cấp** (tính sẵn lúc trang bị, không tính lại mỗi nhát).
3. **Âm Phù**: chỉ chỉnh **Thế** hoặc hành vi, **không cộng máu** (mục 6c).
4. **Hệ số đặc biệt: chọn MỘT** – cái lớn nhất trong {Cộng hưởng, chí mạng}.
   - Có Cộng hưởng thì **không gieo chí mạng**.
   - Cộng hưởng: máu ×2 và Thế về 0 (KHGP).
5. **Trừ Thế**. Thế về 0 → vỡ, choáng (KHGP mục F).
6. **Cờ vỏ / mặt** (KHGP mục 1): địch có `vo` mà Thế còn → máu = 0 ("Keng"). Địch có `mat` bị đánh từ trước → máu = 0. Bước 5 đi trước bước 6, nên đòn vừa làm vỡ Thế thì được tính máu luôn.
7. **Làm tròn xuống**, tối thiểu 1 nếu không bị chặn ở bước 6.
8. **Hiệu ứng phụ** (chỉ khi `src='p'`): mỗi loại tối đa **1 lần mỗi đòn**. Đặt hẹn giờ vết Dư Âm, đặt dấu, kéo, kích dấu vỡ.
9. **Hitstop** = `Math.max` (như code). Rung màn hình chỉ lấy đòn lớn nhất trong tick.

**Giới hạn proc** (chặn vòng lặp):
- 1 vết Dư Âm mỗi lần dùng kỹ năng. Mốc 8: vang 2 lần, nhưng vẫn là 1 vết.
- 1 dấu mỗi mục tiêu.
- Dấu vỡ do `'k'` không kích được dấu khác.
- 1 Vệ Hồn trên màn, toàn cục.
- Cộng hưởng: 1 lần / 45 tick / mục tiêu (KHGP).
- Sóng Dư Chấn không sinh sóng mới (KHGP).
- Dư Chấn chỉ sinh từ Cộng hưởng hoặc vỡ Thế. Vỡ Thế do `'k'` gây ra **có** sinh Dư Chấn, nhưng sóng đó là `'k'` nên dừng ở đó.

### 5d. Bóng Tiếng Vọng dùng chỉ số nào

- **Bóng có chỉ số cố định [0 máu, 10 Thế]** cho mọi vũ khí, mọi cấp (KHGP "bóng một mình chỉ trừ Thế", ×10). Nhờ vậy không cần "chốt cấp" cho bóng, và nâng cấp không làm bóng thành máy cắt máu.
- **Hình dạng hộp đòn của bóng** = hộp đã ghi ở từng tick, gồm hộp cận chiến + tối đa **2 hộp đạn** (đầu xích, âm cầu). Hiện REC chỉ có 1 hộp → thêm 2 ô.
- **Vũ khí của bóng** = vũ khí **ghi trong từng tick** (`REC[i].vk`), chỉ để vẽ đúng hình. Đổi vũ khí giữa lúc ghi thì bóng cũng đổi đúng tick đó.
- **Cộng hưởng** lấy sát thương **nhát của Lam tại lúc Lam trúng** (vũ khí + cấp hiện tại), không lấy của bóng.
- **Bóng không phát lại**: vết Dư Âm, đặt dấu, kéo địch, Vệ Hồn, Chuông Treo. Nó chỉ phát lại hộp đòn.
- Áp cho cả Hồi Vọng (S1): vòng đệm 90 tick ghi cùng các trường này.

### 5e. Ví dụ tính bằng số

**Ví dụ 1 – Âm Đao cấp 5, nhát 1 vào Chuông Gỗ (máu 40, không có Thế).**
- Gốc: 10. Cấp 2 cộng 20 % → **12**.
- Gieo chí mạng 12 %.
  - Không trúng: **12**.
  - Trúng: 12 × 1,5 = **18**.
- Combo 1-2-3 không chí mạng: 12 + 12 + 12 = 36. Còn 4 máu, phải thêm 1 nhát.
- Có 1 chí mạng: 18 + 12 + 12 = 42 ≥ 40 → chết trong 1 combo.

**Ví dụ 2 – Âm Đao cấp 4 + bóng, phá quái gác (máu 30, Thế 60, cờ `vo`).**

| Bước | Thế | Máu | Ghi chú |
|---|---|---|---|
| Bóng trúng | 60 → 50 | 30 | Bóng [0,10] |
| Lam nhát 3 trong 12 tick → Cộng hưởng | 50 → **0**, vỡ, choáng 120 | 30 − 24 = **6** | Nhát 3 = [12,30]. Cộng hưởng: máu 12 × 2 = 24. **Không gieo chí mạng.** Thế vỡ trước (bước 5) nên vỏ không chặn (bước 6) |
| 24 tick sau, vết Dư Âm vang | – | 6 − 16 → **chết** | Vết [16,20], `src='k'`: không chí mạng, không Cộng hưởng lần 2 |

Không có Cộng hưởng: nhát 3 chỉ trừ 30 Thế, máu = 0 ("Keng"). Cần nhát 3 thứ hai để vỡ → vẫn qua được, chỉ chậm hơn (đúng KHGP: bóng là đường tắt, không bắt buộc).

**Ví dụ 3 – Liềm cấp 6 vào Mẹ Nấm Mốc (máu 240, Thế 120) đang mang dấu, cạnh 1 Chuông Gỗ.**
- Nhát 1: 14 × 1,25 (cấp 2) = 17,5. Trúng bằng mũi liềm ×1,5 = 26,25 → **26 máu, 10 Thế**.
- Cùng nhát đó kích **dấu vỡ** là một lần trúng `'k'` riêng: **[28,45]**. Không nhân chí mạng của nhát 1. Không thành Cộng hưởng.
- Vỡ Lan: Chuông Gỗ bên cạnh nhận **[0,15]**. Chuông Gỗ không có Thế nên chỉ nhấp nháy. Không đặt dấu, không kích dấu khác.
- Tổng trên Mẹ Nấm: 54 máu, 55 Thế.
- Nếu **nhân chồng** (26 × dấu × chí mạng × …) sẽ ra hơn 100. Luật 5c chặn điều đó.

**Ví dụ 4 – Xích cấp 1, lượt đi trúng 2 Chuông Gỗ đứng thẳng hàng ở 120 px và 185 px (tầm 196).**
- Con ở 120 px: [12,10].
- Con ở 185 px nằm trong 20 % cuối tầm (≥ 157 px) → 12 × 1,5 = **18**.
- Lượt về: mỗi con thêm **[6,5]** 1 lần và bị kéo 32 px.
- Hộp đầu xích trúng **mỗi con đúng 2 lần** (1 đi + 1 về) nhờ danh sách "đã trúng" riêng của từng lượt.

---

## 6. Nguồn tiến triển, vật liệu, bắt kịp

### 6a. Bốn nguồn, không cộng cùng một thứ

| Nguồn | Cho cái gì | Tuyệt đối không cho |
|---|---|---|
| **Nâng vũ khí** (Thợ Rèn Hòn) | Sát thương / Thế của vũ khí đó, kiểu chí mạng riêng, sức mạnh và thời gian hồi kỹ năng, mốc mở | Máu Lam, nấc Vọng, tốc độ di chuyển |
| **Nâng Lam** (Mảnh Tim, Mảnh Âm – KHGP mục 7) | +1 máu tối đa, +1 nấc Vọng | Sát thương, chí mạng |
| **Âm Phù** (2 ô, đổi ở chuông lưu) | Hành vi có đánh đổi (Dư Chấn, Tàn Ảnh, Bóng Chắn) | Cộng máu-sát thương, chí mạng, giảm thời gian hồi kỹ năng vũ khí |
| **Khám phá / boss** | Vũ khí mới, **Ấn Rèn** (quyền mở mốc), Mảnh Tim / Âm, rương Đồng Vụn cố định | – |

### 6b. Vật liệu

| Vật liệu | Nguồn | Dùng | Ghi chú |
|---|---|---|---|
| **Đồng Vụn (ĐV)** | Chủ yếu **rương đặt cố định** (5–10 mỗi rương) + vật phá (0–1). Quái rơi 1, **nhưng mỗi phòng tối đa 5 ĐV từ quái mỗi lần nghỉ chuông** | Cấp thường và một phần mốc | Không mất khi chết. Biểu tượng dùng lại ảnh "mảnh chuông" đã có trong atlas HUD. Mảnh chuông hồi máu hiện tại giữ riêng, màu khác |
| **Ấn Rèn I / II / III** | **Cố định**: I = boss Chuông Gác Làng (S8). II = boss vùng 2 hoặc tinh anh cuối nhánh. III = boss vùng 3 | Quyền vượt mốc 3 / 6 / 8, **dùng chung mọi vũ khí, không tiêu hao** | Không farm được |

Không có: độ hiếm ngẫu nhiên, đồ rác, reroll, mất cấp khi chết.
Đặt rương sao cho **một lần khám phá kỹ một vùng ≈ 2 cấp** cho 1 vũ khí. Demo hiện tại (1 vùng + boss) nhắm: Âm Đao tới cấp 3–4 (cần 6 + 8 + 10 = 24 ĐV + Ấn I).

### 6c. Giữ động lực đổi vũ khí – so sánh

| Cách | Mô tả | Ưu | Nhược |
|---|---|---|---|
| Cấp nền chung | Mọi vũ khí cùng 1 cấp | Không bao giờ tụt | Mất cảm giác "nâng món này". Mua 1 được 4 |
| Nâng theo bậc | Vũ khí mới nhặt được đã ở sẵn cấp tương ứng vùng | Món mới mạnh ngay | Mất khoảnh khắc mở mốc. Người chơi không chọn |
| **Giá bắt kịp (chọn)** | Cấp nào **thấp hơn cấp cao nhất bạn từng đạt ở bất kỳ vũ khí nào** thì giá ĐV chỉ còn **⅓** (làm tròn lên). Ấn Rèn vốn dùng chung nên không phải tìm lại | Đơn giản: 1 luật. Vẫn có cảm giác tự nâng. Món mới dùng thử được ngay | Cần hiện rõ "giá bắt kịp" trong menu thợ rèn |

Ví dụ: Âm Đao đang cấp 6, nhặt Xích cấp 1.
- Nâng Xích 1 → 6 giá thường: 6 + 8 + 10 + 12 + 14 = 50 ĐV.
- Với giá bắt kịp: 2 + 3 + 4 + 4 + 5 = **18 ĐV** (khoảng 2 rương).
- Đã có Ấn I và II nên Xích mở Hồi Chấn và Chuông Treo ngay. Xích bắt kịp sau một lượt ghé thợ rèn.

---

## 7. Điều khiển cảm ứng và đổi vũ khí

### 7a. Giữ Chém mà đòn thường không chậm

Dựa trên KHGP mục 3 (bấm chờ 1 lần, `su` 7/7/9):

1. **Chạm** Chém → nhát thường ra **ngay tick đó**, như hiện tại.
2. Code đếm `pl.giuT` = số tick nút Chém đang được giữ **kể từ lần chạm cuối**. Nhả là về 0.
3. `giuT` chạm ngưỡng (Âm Đao 20, Xích: xem 4, Liềm / Trượng 24) và Lam đang trên đất, kỹ năng hết hồi:
   - Đòn đang đánh vẫn chạy hết (không cắt).
   - Xong đòn thì Lam vào **thế tụ**. Nút Chém có **vòng sáng chạy đầy**, Lam có ánh nhẹ dọc vũ khí, có tiếng "ngân".
   - Giữ quá 60 tick thì tự tung (tránh kẹt).
4. **Nhả** trong thế tụ → tung kỹ năng. Nhả trước ngưỡng → không có gì thêm (chỉ là nhát thường).
5. Bấm dồn không bao giờ ra kỹ năng, vì mỗi lần chạm `giuT` về 0.
6. Kỹ năng đang hồi: giữ không làm gì, nút Chém không có vòng sáng.
7. **Lướt hủy thế tụ** (về trạng thái thường, không mất thời gian hồi).

**Riêng Xích**: lần chạm đầu là phóng. Nếu **vẫn giữ** khi đầu xích đi tới tầm → chuông **treo** chờ (tối đa 40 tick). Nhả → giật về (Hồi Chấn).
- Nhả sớm khi đầu xích chưa đi được 40 % tầm → coi như phóng thường.
- Hồi Chấn đang hồi → xích về tự động như thường.

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

Đặt cạnh `P` và `ATK` (dòng 250–267). `ATK` hiện tại trở thành `VK.amDao.don`.

```js
// [máu, Thế] thang ×10. Mọi thời gian = tick.
const VK = {
  amDao: {
    ten: 'Âm Đao', pogo: true, luotHuy: 'moiLuc',
    don: {                         // = ATK cũ + sát thương
      1: { su:7, ac:8, re:8,  hs:3, box:[4,-97,86,48],   dmg:[10,10] },
      3: { su:9, ac:8, re:16, hs:6, box:[-13,-59,99,59], dmg:[10,30] },
      // 2, 4, 5, 6 như ATK
    },
    chiMang: { kieu:'ngauNhien', tyLe:0.05, heSo:1.5 },
    kyNang: { id:'duAm', giu:20, hoi:150,
              chem:{ su:6, ac:8, re:14, box:[0,-100,96,56], dmg:[15,20] },
              vet:{ tre:24, dmg:[10,10], lan:1 } },
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
    { cong:{ 'don.*.dmg.0': 0.20 } },             // 2: +20 % máu đánh thường
    { mo:['duAm'], an:1 },                         // 3
    { dat:{ 'kyNang.vet.dmg':[16,20] } },          // 4
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
Bảng debug trong ⚙ hiện 3 cột riêng (gốc / +cấp / +Âm Phù) để cân bằng.

### 8c. Đòn đánh thành một đối tượng

`strike(e, src, sw, face, n, hb)` (917) đổi thành `strike(e, D)`.

`D = { src, vk, loai, dmg:[máu,Thế], hs, chiMang, mui, keo, hb, daTrung:[] }` – lấy từ pool, không tạo mới mỗi tick.

`applyHits(D)` kiểm `D.daTrung` thay cho `swP/swE` (S7).
- Mỗi lượt xích (đi / về), mỗi âm cầu, mỗi vết Dư Âm, mỗi lần nện của Vệ Hồn = **một `D` riêng**.
- Vì vậy "mỗi mục tiêu trúng số lần xác định" là tự nhiên.

`lastP / lastE` (Cộng hưởng) chỉ cập nhật khi `src` là `'p'` / `'e'`.

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
- `vk`: vũ khí của tick đó (vẽ đúng hình),
- `h1x, h1y, h1w, h1h`, `h2…`: tối đa 2 hộp đạn,
- `s1, s2`: mã đòn của 2 hộp đạn.

`recordFrame()` (898) ghi thêm các ô này. `step()` dòng 1315 gọi `applyHits` cho 3 hộp, mỗi hộp một `D` của bóng.
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

Rig Lam mới đang **nướng sẵn cả người + dao vào sheet** (0,3 MB RAM mỗi khung). Nhân 4 vũ khí × 3 bậc ngoại hình là không chịu nổi.

Đề xuất:
- **Tách vũ khí + găng gần thành lớp vẽ trực tiếp.**
  - Sheet thân nướng **không có vũ khí và găng gần**.
  - JSON mỗi khung ghi **vị trí + góc của găng gần** (tay cầm).
  - Game vẽ 2 mảnh (vũ khí, rồi găng gần đè lên) bằng `drawImage` có xoay. Giống cách quái/boss đang vẽ từ mảnh (`quai-boss-runtime.js` 131–140).
  - Đổi bậc ngoại hình = đổi **1 ảnh nhỏ**.
  - Chi phí: sửa `sprite.py` xuất thêm rãnh biến đổi (**S–M**).
- **Phương án mạnh hơn, đáng đo**: vẽ **cả Lam** từ 13 mảnh (như boss Cách A: ~16 MB thay ~400 MB). Clip lưu thành rãnh biến đổi thay vì ảnh. Nếu chọn thì mọi clip vũ khí rẻ hơn nhiều. Cần thử hiệu năng trên iPhone trước (**M**).
- **Chỉ nạp sheet của 2 vũ khí đang mang.** Đổi bộ ở chuông lưu thì nạp / giải phóng.

### 9b. Chi phí từng vũ khí (rig 13 mảnh, đã tách lớp vũ khí)

RAM ước tính = số khung × ~0,3 MB (thân không vũ khí, sheet 2x). Công sức: **S** ≤ 1 ngày, **M** 2–4 ngày, **L** 1–2 tuần.

| Vũ khí | Clip thân mới | Khung ≈ | RAM ≈ | Ảnh gen | VFX / code | Công sức |
|---|---|---|---|---|---|---|
| Âm Đao | Combo 2, 3, hất, trên không, nảy (**đã nằm trong KHGP P1#6** cho Lam mới) + **tụ (lặp 12) + chém vang (28)** | 40 thêm | +12 MB | 1 ảnh: lưỡi âm thoa × 3 bậc | Dải âm nhận (code), vết Dư Âm (1 ảnh gen 4–6 khung), giữ Chém, `D` / `daTrung` | **M** (riêng phần vũ khí) |
| Xích | Phóng đất (22), phóng trên không (22), giữ / treo (lặp 12), giật + bắt (16). Chéo lên = cùng clip, xoay tay | 72 | +22 MB | 1 ảnh: chuông đầu xích × 3 bậc + 1 mắt xích | Vẽ xích lặp mắt theo đường; trạng thái đi / chờ / về; va tường; kéo; điểm ngọt | **L** (1–1,5 tuần) |
| Liềm | Quét 1 (34), quét 2 (36), quét lên (30), quét trên không (26), tụ (12), Thu Âm (36) | 174 | +52 MB | 1 ảnh: liềm × 3 bậc; 1 ảnh: dấu nứt 3 trạng thái | Bảng hộp đòn theo tick (cung), mũi liềm, dấu trên địch, vỡ, Vỡ Lan | **L** (1,5 tuần) – nhiều clip nhất |
| Trượng | Bắn (24), bắn trên không (20), tụ (12), gõ trượng (20). Chéo lên = cùng clip | 76 | +23 MB | 1 ảnh: trượng × 3 bậc; âm cầu + nổ | Đạn, nổ vùng, **Vệ Hồn: rig ~6 mảnh + 3 clip (hiện 18, nện 8 + thu, tan 20)** | **L+** (2 tuần) |

Giảm chi phí:
- Liềm: quét lên dùng lại quét 2 xoay ngược. Quét trên không dùng lại quét 1 với chân co (−56 khung).
- Vệ Hồn: bản đầu dùng **rig NPC Thợ Rèn Hòn** (đã có mảnh + động tác gõ búa), tô màu đồng hồn, mờ 70 %. Ảnh riêng gen sau khi duyệt luật.
- Vẽ Vệ Hồn bằng mảnh (như NPC) → gần như không tốn RAM sheet.

### 9c. Rủi ro

| Rủi ro | Mức | Giảm |
|---|---|---|
| RAM iPhone khi mang 2 vũ khí sheet nặng (Liềm) | Cao | 9a: tách lớp + chỉ nạp 2 món; đo bằng "Chép số" |
| Giữ Chém ra nhầm kỹ năng | Trung bình | Ngưỡng 20–24, đo log; vòng sáng trên nút báo trước khi tung |
| Vệ Hồn bị hiểu là bóng | Trung bình | Màu đồng, dáng khác, không công tắc. Hỏi người thử |
| Số liệu nhân chồng | Trung bình | Luật 5c + log mỗi lần trúng: `src`, hệ số được chọn, [máu, Thế] |
| Xích + tường + thiết kế màn (tầm 230) | Trung bình | Va tường là dừng; kiểm phòng có hành lang ngắn |
| Đổi vũ khí lách thời gian hồi | Thấp | Hồi gắn vũ khí, vẫn đếm khi cất; 1 Vệ Hồn toàn cục |
| Phụ thuộc KHGP P0 (Thế, bấm chờ) | Cao | Prototype Âm Đao dựng trên P0 (mục 10) |

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

## 10. Kế hoạch prototype nhỏ: Âm Đao trước

**Điều kiện**: dựng **sau** KHGP P0 #1–#2 (bấm chờ, `su` 7/7/9, Thế). Nếu P0 chưa xong thì chỉ thêm Thế cho hình nộm và quái gác trong trang thử.

**Trang**: `game/thu-am-dao/`, sinh từ `demo.html` bằng script (cách `thu-re-muc`). `demo.html` không đổi tới khi duyệt.
- Lam **rig-v4** (đang chạy trong game). Âm nhận vẽ bằng code nối từ mũi dao.
- Thế tụ dùng khung nhát 1 giữ yên + ánh sáng; chém vang dùng clip nhát 3. **Chưa làm clip mới.**

**Phòng**: phòng B + C của `so-do-phong-thu.png` (2 Chuông Gỗ lệch pha + quái gác vỏ), thêm **1 hình nộm chuông** đứng yên:
- máu 999, Thế 60,
- hiện số [máu, Thế] mỗi nhát,
- hiện tổng sát thương 10 giây.

**Có trong prototype:**
1. `VK.amDao` + `CAP_VK.amDao` (chỉ cấp 1–4) trong một bảng cấu hình.
2. Âm nhận nhìn thấy được, hộp mép 90.
3. Giữ Chém → Dư Âm (mốc 3); vết vang [10,10] → cấp 4 [16,20].
4. `strike(e, D)` + `daTrung`; nguồn `'p' / 'e' / 'k'`; thứ tự tính 5c; chí mạng 5 % hạt giống cố định.
5. **Chọn cấp 1 / 2 / 3 / 4 bằng nút trong ⚙ và `?cap=`** → so trước/sau trong **cùng phòng, cùng chuỗi thao tác**.
6. Log: lần chạm Chém (thời gian giữ), lần ra kỹ năng, mỗi lần trúng (`src`, [máu, Thế], hệ số, mục tiêu).

**Không có**: đổi vũ khí, lưu game, vật liệu, menu thợ rèn, Lam mới, cấp 5–8.

**Đối chiếu để duyệt**:
- 3 video cùng kịch bản: cấp 1 → cấp 3 → cấp 4.
- Bảng số từ hình nộm.

| Tiêu chí | Đạt khi |
|---|---|
| Đòn thường không chậm | Từ chạm → hộp đòn ≤ `su` + 1 tick ở mọi cấp, kể cả khi có tính năng giữ |
| Không ra nhầm | Kỹ năng ra ngoài ý muốn < 3 % số lần giữ (log + hỏi). Trên iPhone thật |
| Thấy rõ | 3 người chưa chơi tự nói được "phần sáng nối dài cũng trúng" và "vết sẽ vang lại" |
| Cấp có ý nghĩa | Hình nộm 10 s: cấp 2 ≈ +20 % đánh thường. Cấp 4 so cấp 3: Dư Âm trừ thêm ≈ 60 % ở vết. Người thử nhận ra khác biệt **không cần xem số** |
| Không vỡ luật | Hitstop ≤ 8; mỗi `D` trúng mỗi mục tiêu ≤ 1 lần; Cộng hưởng không có chí mạng; vết `'k'` không Cộng hưởng |
| Replay | Cùng đoạn ghi → bóng đúng vị trí ở 60 / 120 Hz và khi có hitstop. Bóng không sinh vết Dư Âm |

**Công sức**: **M** (3–4 ngày).
Sau khi duyệt: **Xích** (L) → **Liềm** (L) → **Trượng** (L+). Mỗi món có cổng duyệt riêng, cùng phòng thử + hình nộm.

---

## Câu hỏi cần anh quyết

1. Đồng ý **8 cấp, mốc 1/3/6/8**, hay vẫn muốn 10 cấp?
2. **Giữ Chém = kỹ năng** cho cả 4 vũ khí (không thêm nút kỹ năng)?
3. Đổi tên tính năng chạm đúp Vọng thành **"Hồi Vọng"** (S1)?
4. Âm Đao **chính là** dao hiện tại (S4), và mép hộp đòn 90 thay vì thu về 66?
5. Nút đổi **⇄** nhỏ ở góc trên-trái khung nút (S6), hay chỉ đổi ở chuông lưu?
6. Trước khi làm clip vũ khí: cho đo thử **vẽ Lam từ mảnh** (9a) không?
