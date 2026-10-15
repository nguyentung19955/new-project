# Soát độ mượt: hiệu ứng, animation, cảm giác đánh, giao diện

Ngày 15/10/2026, nhánh `khoi-tao-du-an`. Phiên này chỉ đọc code và đo ảnh sprite. Không sửa `game/`, không chạy thử game.

**Cách đo.** Mỗi tấm sprite được cắt thành từng khung để đo cỡ thân, vạch chân, tâm, độ khác giữa hai khung, khung trắng và số khung mỗi giây thật trong game. Có 30 quái thường, 15 tấm trùm (kể cả các pha), 39 động tác của Cu Tí và 166 hiệu ứng `hu-*`.

"Băng hình mô phỏng" (các GIF) được dựng lại từ đúng dữ liệu `dong_tac` cộng với nhịp đang viết trong code. Bên trái là **HIỆN TẠI**, bên phải là **ĐỀ XUẤT**.

Công cụ đo nằm ở `cong-cu/` (cách chạy: `cong-cu/CACH-CHAY.md`).

Ảnh trong thư mục này:

| Tệp | Xem gì |
|---|---|
| `xem-muot.png` | Ảnh tổng hợp: khung/giây thật của 30 quái, trùm, Cu Tí, hiệu ứng; các chỗ nối động tác bị "bật" |
| `noi-dong-tac.png` | 7 chỗ đổi động tác bị nhảy cỡ hoặc nhảy dáng |
| `khung-trang-trum.png` | Khung trúng đòn bị trắng ở trùm (2 chỗ chưa vá) |
| `gif-1-don-danh-bi-cat.gif` | Quái đánh: khung thu đòn bị cắt, bật về đứng |
| `gif-2-bao-don-dai-khung.gif` | Báo đòn dài bị kéo giãn còn 6 khung/giây |
| `gif-3-choang-chop-nhap-nhay.gif` | Quái choáng nhấp nháy viền trắng suốt lúc choáng |
| `gif-4-di-dung-lat-lien-tuc.gif` | Quái đứng sát chỗ dừng: đi↔đứng lật liên tục, giật |
| `gif-5-hieu-ung-tat-phut.gif` | Hiệu ứng hết khung là tắt phụt |
| `gif-6-vung-bao-truoc-nhay-bac.gif` | Vùng báo trước đầy lên theo 7 bậc |
| `gif-7-cu-ti-dung-tho.gif` | Cu Tí đứng thở: đứng im rồi bật về khung đầu |
| `mau/*.png` | Dải khung hiện tại của vài hiệu ứng (để gửi kèm khi gen lại) |

---

## 1. Đánh giá chung

| Mảng | Điểm | Nhận xét ngắn |
|---|---|---|
| Nhân vật Cu Tí | **7,5/10** | Chạy 12 khung (20 khung/giây). Đòn khớp đúng khung chém. Vũ khí xoay mượt. Còn: đứng thở bị khựng; đòn nặng trượt chân khi đang chạy |
| Quái thường (30 con) | **6/10** | Ảnh đẹp, đủ 6 động tác, ít lệch neo. Nhưng **cách phát** làm mất mượt: đòn bị cắt, đi↔đứng giật, báo đòn kéo giãn, choáng nhấp nháy |
| Trùm (6 con, 15 tấm) | **7/10** | Trùm vùng phát đều 12 khung/giây, đưa đi đưa lại khung cuối (rất tốt). Hàng đánh chỉ 3–4 khung; 2 khung trúng đòn trắng chưa vá |
| Hiệu ứng | **6/10** | Chém, đâm, trúng đòn 25–30 khung/giây, đẹp. Nhưng 40/166 tấm dưới 9 khung/giây, hiệu ứng tắt phụt, vùng báo trước nhảy bậc |
| Cảm giác đánh | **6,5/10** | Có dừng hình theo độ nặng, nhớ nút trong lúc dừng, có huỷ đòn, số sát thương nảy đẹp. Thiếu: rung màn đòn thường gần như không thấy, quái không bị đẩy lùi thật, tiếng đánh một kiểu |
| Giao diện | **5,5/10** | Thanh máu có phần "máu trễ" tụt dần (tốt), nút có nảy. Còn: chuyển màn cắt cứng, bảng mở không hiệu ứng, truyện không hoà ảnh, thanh kinh nghiệm nhảy |
| Hiệu năng ảnh hưởng mượt | **6,5/10** | Logic chạy nhịp cố định 60 lần/giây, có bể hạt 400. Nhưng không nội suy khi vẽ: màn 90/120 Hz bị rung. Vài chỗ tốn: viền nhân vật, bộ nhớ thanh máu |

**Tóm lại:** ảnh đã đủ tốt. **Phần lớn chỗ chưa mượt sửa bằng code** (nhịp phát, nối động tác, rung, nội suy). Chỉ một ít chỗ thật sự cần gen ảnh.

### 5 điểm mạnh

1. **Đòn của Cu Tí khớp khung chém.** Bảng `MOC` trong `zed_moi.js` đặt khung chém đúng lúc gây sát thương; tốc độ đánh đổi thì hình giãn theo. Vũ khí xoay mềm giữa các khung (`gocMuot`: vào 0,33, ra 0,18).
2. **Trùm vùng phát đều 12 khung/giây** (`SC.chonTrum`): báo đòn chạy tới đúng lúc nổ, rồi đưa đi đưa lại 3 khung cuối, không bị kéo giãn. Đây là mẫu nên đem dùng cho quái thường.
3. **Dừng hình theo độ nặng đòn**: thường 45 ms, búa 70, nặng 90, giết 100, chí mạng 115, trùm chết 120 (`fx.js:620-648`, `fx.js:1113`). Nút bấm trong lúc dừng được nhớ rồi phát lại.
4. **Số sát thương và thanh máu**:
   - Số nảy 0,55→1 trong 70 ms, rồi lắng; chí mạng vàng có rung nhẹ; gộp số trên cùng một con.
   - Thanh máu có phần máu trễ, giữ 0,42 giây rồi tụt (`ui_theme.js:915-929`).
5. **Nền tảng tốt**:
   - Logic chạy nhịp cố định 1/60 giây.
   - Có bể 400 hạt, trần 72 hiệu ứng.
   - Ảnh chém, đâm 25–30 khung/giây.
   - Cu Tí lộn 6 khung khớp đúng 0,27 giây né.
   - Gần như mọi thay đổi cũ đều có cờ quay lui.

---

## 2. Danh sách vấn đề, xếp từ nặng nhất

Ký hiệu loại sửa: **(A)** sửa bằng code · **(B)** cần GEN ẢNH mới hoặc thêm khung · **(C)** cả hai (code sửa tạm được, ảnh mới thì đẹp hẳn).

Mức nặng: 🔴 nặng (thấy ngay, mọi trận) · 🟠 vừa · 🟡 nhẹ.

### 🔴 1. Hình rung nhẹ khi chạy và lia màn, nhất là điện thoại màn 90/120 Hz — (A)

- **Ở đâu:** `engine.js:681-687` (vòng lặp), `combat.js:1034` (camera đuổi), `combat.js:1058` (camera làm tròn), `zed_moi.js:479` và `sprite_custom.js:531` (nhân vật làm tròn riêng).
- **Vì sao không mượt:**
  - Game tính 60 lần/giây nhưng vẽ theo màn hình. Màn 90 Hz có nhịp vẽ 1-1-0, màn 120 Hz có khung trùng, nên hình đi "khựng nhẹ đều đều".
  - Camera và nhân vật được làm tròn **riêng** từng cái. Khi camera đang đuổi chậm, nhân vật lệch qua lại 1 điểm ảnh game (2 điểm ảnh màn hình) giữa các khung.
- **Cách sửa:**
  - Lưu vị trí trước của người chơi, quái và camera ở đầu mỗi lượt tính.
  - Khi vẽ, lấy `alpha = acc/STEP` và vẽ ở vị trí trung gian.
  - Làm tròn camera và nhân vật **cùng một kiểu**, theo nửa điểm ảnh (`Math.round(v*G.NET)/G.NET`), vì nền vẽ gấp đôi nên không vỡ nét.
  - Thanh máu quái cũng dùng cùng camera đã làm tròn (`stage.js:802` đang dùng camera chưa làm tròn).
- **Cờ đề xuất:** `G.NOI_SUY` / `?noisuy=0`.

### 🔴 2. Quái đánh xong: khung thu đòn không bao giờ hiện, bật thẳng về đứng — (A)

Xem `gif-1-don-danh-bi-cat.gif` và ảnh cuối của `noi-dong-tac.png`.

- **Ở đâu:**
  - `mobs.js:187`: lượt đánh kết thúc ở `T + D×0,75`.
  - `mobs.js:254`: hết lượt thì `loop(e,'idle')` về khung 1.
  - `sprite_custom.js` `chonQuai`: hàng đánh lại chia theo cả D.
- **Vì sao không mượt:**
  - Hàng đánh chỉ chạy tới 75%, nên khung cuối (thu móng, hạ chân) bị bỏ. Đo được (nhịp mặc định): **19/30 quái** có hàng đánh ≥ 4 khung và không bao giờ hiện khung cuối. 9 con hàng 3 khung chỉ hiện khung cuối ~45 ms. Một số kỹ năng trong `ky_nang_quai.js` đặt `end` riêng (24 chỗ) nên dài ngắn khác nhau, có chỗ lại **đứng hình** ở khung cuối nếu `end` dài hơn hàng đánh.
  - Ví dụ Heo Rừng Con dừng ở khung 5, khung 6 không bao giờ hiện.
  - Rồi hình bật sang khung 1 của đứng thở. Mỗi đòn đánh đều "giật một cái" khi kết thúc.
- **Cách sửa:**
  - Trong `chonQuai` nhánh `atk`, chia tiến độ theo đúng quãng thật: `u = t/(act.end − act.T)`.
  - Hoặc mobs.js truyền `D = act.end − act.T` vào.
  - Giữ khung cuối thêm 1 nhịp (~60 ms) rồi mới về đứng.
  - Không đổi luật chơi.
- **Cờ đề xuất:** `G.DON_DU` / `?dondu=0`.

### 🔴 3. Quái bị choáng nhấp nháy viền trắng suốt lúc choáng — (A, một dòng)

Xem `gif-3-choang-chop-nhap-nhay.gif`.

- **Ở đâu:**
  - `mobs.js:888` gửi động tác `'hit'` (trúng đòn) với `t = 0,08 + 0,06·sin(9t)`.
  - `sprite_custom.js:526` bật chớp 0,75 khi `hit` có `u < 0,3`.
- **Vì sao không mượt:** điều kiện chớp đúng khoảng 64% thời gian. Quái choáng (búa, chưởng) trông như **bị đánh liên tục** ~1,4 lần/giây, rối mắt và dễ hiểu nhầm là đang ăn đòn.
- **Cách sửa:** gửi `'stun'` như `boss.js:670` đang làm. `chonQuai` đã có sẵn nhánh `stun`, không chớp.
- **Cờ đề xuất:** `G.CHOANG_YEN` / `?choangcu=1`.

### 🔴 4. Quái đứng sát chỗ dừng: đi↔đứng lật liên tục, mỗi lần về khung 1 — (A)

Xem `gif-4-di-dung-lat-lien-tuc.gif`.

- **Ở đâu:**
  - `mobs.js:264`: `md > 3` không có vùng đệm.
  - `mobs.js:25` và `240` (`loop()`), `boss.js:587` và `647-649`: đổi động tác là đồng hồ về 0.
- **Vì sao không mượt:** quái lượn quanh tầm đánh nên cờ "đang đi" bật tắt vài khung một lần. Mỗi lần đổi, hình về khung 1 của hàng mới. Quái run rẩy tại chỗ, rất hay gặp ở quái đánh xa (`keep()`).
- **Cách sửa:**
  - Vùng đệm thời gian: hết đi 0,12–0,15 giây mới coi là đứng.
  - Vùng đệm khoảng cách: vào >6, ra <2.
  - Mỗi hàng giữ đồng hồ riêng, quay lại trong 0,2 giây thì đi tiếp từ khung cũ.
- **Cờ đề xuất:** `G.DI_DUNG_EM` / `?didung=0`.

### 🔴 5. Rung màn: đòn thường gần như không rung, đòn to rung "nhiễu" — (A)

- **Ở đâu:** `fx.js:2076-2087` (`stepShake`), `combat.js:650`.
- **Vì sao không mượt:**
  - Độ rung = 4 × trauma², rồi **làm tròn**. Đòn thường (trauma ~0,15) ra 0,09 điểm ảnh, làm tròn về 0: không cảm thấy gì.
  - Đòn to thì mỗi khung lấy một số ngẫu nhiên mới, thành nhiễu trắng, trông giật chứ không "nặng".
  - Bị đánh cộng rung hai lần (`hurtPlayer` vừa gọi rung mới vừa đặt `W.shake` cũ).
- **Cách sửa:**
  - Thay ngẫu nhiên bằng nhiễu mượt (tổng 2–3 sóng sin, tần số ~25).
  - Làm tròn theo nửa điểm ảnh.
  - Thêm mức sàn: đòn thường có ít nhất 0,5–1 điểm ảnh, kèm "đá" một phía theo hướng chém (đã có `kx`).
  - Bỏ cộng đôi ở `combat.js:650`.
  - Thêm nút tắt rung trong Cài đặt.
- **Cờ đề xuất:** `G.RUNG_MUOT` / `?rungcu=1`.

### 🟠 6. Báo đòn kéo giãn: 6 khung/giây ở quái báo lâu, 17 khung/giây ở quái báo nhanh — (C)

Xem `gif-2-bao-don-dai-khung.gif` và cột "báo đòn" trong `xem-muot.png`.

- **Ở đâu:** `mobs.js:898` trải 6 khung báo đòn đúng bằng thời gian báo (`bao` trong `ky_nang_quai.js`).
- **Vì sao không mượt:**
  - Báo đòn dài thì mỗi khung đứng ~167 ms, trông như ảnh tĩnh nhảy: Nấm Phồng và Cá Nóc 1,0 giây, Nhím các loại 0,8 giây, tinh anh còn dài hơn.
  - Báo đòn ngắn (Cá Chuồn 0,35 giây) thì 17 khung/giây, khó đọc.
- **Cách sửa:**
  - (A) Làm như trùm: chạy hàng báo ~12 khung/giây một lượt, rồi đưa đi đưa lại 3 khung cuối tới lúc ra đòn (`SC.quaLai` có sẵn).
  - (B, tuỳ chọn) Quái báo ≥0,8 giây gen hàng báo đòn 8 khung, 2 khung cuối "rung tụ lực" để đưa đi đưa lại tự nhiên hơn. Xem prompt **P7**.
- **Cờ đề xuất:** `G.BAO_DEU` / `?baodeu=0`.

### 🟠 7. Quái không bị đẩy lùi thật; đòn kết đẩy "dịch chuyển tức thời" — (A)

- **Ở đâu:**
  - `fx.js:1060` và `1389-1391`: chỉ **vẽ** lệch 2 điểm ảnh (4 với đòn nặng), không di chuyển thật.
  - `moves.js:367-370` và `656`: đòn kết kiếm, quét giáo đẩy 10/8 điểm ảnh trong **một** khung.
  - `mobs.js:889`: động tác trúng đòn chỉ chạy khi quái đang đứng hoặc đi.
- **Vì sao không mượt:** đánh trúng mà quái "dính chặt" xuống đất làm đòn nhẹ. Đòn kết thì quái "nhảy cóc".
- **Cách sửa:**
  - Thêm vận tốc lùi: `e.kbVx = hướng × K` (K ≈ 120 đòn thường, 220 đòn kết).
  - Mỗi lượt: `x += kbVx·dt`, `kbVx *= exp(−12·dt)`.
  - Trùm, quái giáp nhân 0,2.
  - Động tác trúng đòn chạy cùng lúc. Trong `veQuai`, 0,1 giây đầu trúng đòn thêm bẹp nhẹ `scale(1,06; 0,94)` rồi trả về.
- **Cờ đề xuất:** `G.DAY_LUI` / `?dayluicu=1`.

### 🟠 8. Hiệu ứng một lần: hết khung cuối là tắt phụt — (A)

Xem `gif-5-hieu-ung-tat-phut.gif`.

- **Ở đâu:** `fx.js:2238`. Chỉ hiệu ứng có cờ `mr` mới mờ (0,05 giây vào, 0,08 giây ra).
- **Vì sao không mượt:** 9 hiệu ứng một lần còn đậm 90–100% ở khung cuối nên biến mất như bị cắt: `hu-bua-tam-giac`, `hu-tia-mom`, `hu-manh-san-ho`, `hu-vet-dau`, `hu-vet-chay`, `hu-vo-oc`, `hu-nam-con`, `hu-ep-thanh-cong`, `hu-nut-san`. Các hiệu ứng khác cũng không có nảy lúc hiện.
- **Cách sửa:**
  - Mọi hiệu ứng ảnh không lặp: mờ dần ở 25% cuối, giữ khung cuối thêm 0,1–0,15 giây trong lúc mờ.
  - Nổ và trúng đòn: nảy 1,0→1,08 trong 0,12 giây đầu.
- **Cờ đề xuất:** `G.HU_MO` / `?humo=0`.

### 🟠 9. Vùng báo trước đầy lên theo 7 bậc — (C)

Xem `gif-6-vung-bao-truoc-nhay-bac.gif`.

- **Ở đâu:** `bao_truoc.js:652-658`: `fi = floor(u×7)`.
- **Vì sao không mượt:** báo 1 giây thì vùng đỏ nhảy 7 lần (~140 ms một lần) thay vì lan đều. Đây là thứ người chơi nhìn nhiều nhất khi né.
- **Cách sửa:**
  - (A) Hoà khung `fi` và `fi+1` theo phần lẻ của `u×7`, thêm nhịp sáng 0,15 giây cuối trước khi nổ. Code đủ dùng.
  - (B, tuỳ chọn) Gen lại 4 vùng báo trước với 12–16 khung đầy dần. Xem prompt **P8**.
- **Cờ đề xuất:** `G.BT_HOA` / `?bthoa=0`.

### 🟠 10. Đổi động tác bị "bật" cỡ / dáng (vẽ AI không nối nhau) — (C)

Xem `noi-dong-tac.png`.

- **Đo được** (cỡ = diện tích thân khung sau chia khung trước):
  - Cá Nóc Chúa: báo đòn (phồng hết cỡ) → đánh khung 1 **×2,3**, chân lệch 21 điểm ảnh.
  - Cá Nóc: báo đòn → khung đánh đầu **×1,66**.
  - Nhím Gai Độc: cuộn tròn → bung **×1,81**.
  - Nhím Biển: lăn (gai bung) → đứng **×1,78**. Không có khung thu gai.
  - Mộc Tinh pha 3: đánh → đứng ×1,43.
  - Heo Nanh Dài: trúng đòn khung 1 chồm hẳn lên rồi khung 2 đứng thấp. Khung 1 khác dáng hẳn các khung còn lại.
- **Vì sao không mượt:** hai hàng ảnh vẽ riêng, khung cuối hàng này không khớp khung đầu hàng sau, nên con quái "phình xẹp" tức thì.
- **Cách sửa:**
  - (A, tạm) Lúc vào đánh / về đứng của nhóm "phồng / cuộn" (caNoc, caNocChua, nhim, nhimDoc, nhimThan), phát nhanh hàng báo đòn **ngược** trong 0,1–0,15 giây làm khung "xì hơi / thu gai".
  - (B) Gen lại vài hàng cho khớp. Xem **P1–P3**.

### 🟠 11. Hai khung trúng đòn trắng ở trùm pha 2 chưa được vá — (A ngay, B sau)

Xem `khung-trang-trum.png`.

- **Ở đâu:** `sprite_custom.js:88-89` có danh sách `KHUNG_TRANG` vá khung trắng. Danh sách này **thiếu** hai chỗ:
  - `hoLua-p2` hàng trúng đòn khung 2 (23% thân trắng).
  - `namChua-p2` hàng trúng đòn khung 3 (15% thân trắng, loé hồng trắng).
- **Vì sao không mượt:** trúng đòn thì thân loé trắng như bóng ma, đúng lỗi đã sửa cho 6 tấm khác hôm 15/10.
- **Cách sửa:**
  - (A) Thêm `'hoLua-p2': { hit: { 1: 0 } }`, `'namChua-p2': { hit: { 2: 1 } }` (2 dòng, dùng cờ `?khungtrang=1` có sẵn).
  - (B) Về lâu dài gen lại 2 hàng đó. Xem **P4**.

### 🟠 12. Cu Tí đang chạy mà đánh đòn nặng thì trượt chân — (C)

- **Ở đâu:** `moves.js:148-150`.
  - Đòn có ghép thân trên với chân chạy (`ZED_EO.hang`) thì đẹp.
  - Đòn **không** ghép thì cả người đứng tấn trong khi vẫn trôi đi 47–54 điểm ảnh/giây: `kiem_3`, `thuong_quet`, `bua_nen`, `bua_nen_dat`, `bua_giu`.
- **Vì sao không mượt:** chân đứng yên mà người trượt trên sàn ("trượt băng"), rất dễ thấy với búa (0,8 giây).
- **Cách sửa:**
  - (A) Hạ hệ số di chuyển khi đánh các đòn này về 0,15–0,25 (đứng lại ra đòn), thêm bụi chân lúc dừng.
  - (B) Muốn vừa chạy vừa chém nặng thì gen hàng "chạy + chém nặng". Xem **P9**.

### 🟠 13. Tiếng đánh: một tiếng bíp cho mọi đòn — (A)

- **Ở đâu:** `engine.js:225`. `hit` là sóng vuông 220 Hz, 50 ms. Không đổi cao độ ngẫu nhiên, không khác giữa kiếm / giáo / búa / chí mạng.
  - Tiếng vung phát lúc **bấm nút** (`moves.js:350`), không phải lúc vung.
  - Không đặt `latencyHint: 'interactive'`.
- **Vì sao không mượt:** đánh 10 cú nghe y hệt nhau nên tai thấy "máy móc". Búa khởi động 280 ms mà tiếng đã kêu lúc bấm, nghe lệch với hình.
- **Cách sửa:**
  - Cao độ ±8%.
  - Búa / đòn nặng thấp và to hơn, chí mạng thêm lớp cao.
  - Tiếng vung phát ở ~60% đà.
  - AudioContext tạo với `latencyHint:'interactive'`.
  - Sau này có thể thay bằng tệp âm thanh thật. Việc đó là âm thanh, không phải gen ảnh.

### 🟠 14. Giết cả đám: dừng–chạy–dừng; cung không có dừng hình — (A)

- **Ở đâu:** `fx.js:620-648` (giết 100 ms mỗi lần, khoảng nghỉ 70 ms), `fx.js:1111`.
- **Vì sao không mượt:** quét chết 4–5 con liên tiếp thì hình khựng lặp lại như máy lag. Bắn cung trúng thì không có cảm giác gì.
- **Cách sửa:**
  - Trần tổng thời gian dừng 150 ms mỗi 0,5 giây; lần dừng sau giảm dần (×0,6).
  - Mũi tên thường trúng: 20–30 ms.

### 🟠 15. Chuyển màn cắt cứng, bảng mở / đóng không hiệu ứng, truyện không hoà ảnh — (A)

- **Ở đâu:**
  - `engine.js:610` (`setScene`): đổi màn tức thì. Chỉ vào ải có mờ từ đen 0,35 giây (`stage.js:95`). Về làng thì cắt.
  - Bảng hành trang, nâng cấp, chương: không có hiệu ứng mở.
  - `truyen.js:216` và `244`: sang trang truyện thì cắt đen rồi hiện; chữ hiện cả đoạn, không chạy dần.
  - Màn tải bị gỡ đột ngột (`engine.js:696`).
  - Thanh kinh nghiệm nhảy, không chạy (`village.js:438`, `hanh_trang.js:114`).
- **Cách sửa:**
  - Mờ ra / mờ vào 0,2 giây chung trong `setScene`.
  - Bảng mở: phóng 0,94→1 cùng độ hiện trong 0,12 giây (ease-out).
  - Truyện: giữ ảnh cũ, hoà sang ảnh mới 0,4 giây; chữ chạy ~40 chữ/giây, chạm để hiện hết.
  - Màn tải mờ dần 0,3 giây.
  - Thanh kinh nghiệm chạy tới đích trong 0,4 giây.
- **Cờ đề xuất:** `G.UI_MUOT` / `?uimuot=0`.

### 🟡 16. 40 hiệu ứng ảnh dưới 9 khung/giây — (C)

Xem cột "Hiệu ứng ảnh" trong `xem-muot.png`.

- **Đo được:** 11 tấm dưới 6 khung/giây, 29 tấm từ 6 đến 9. Đáng kể nhất là các hiệu ứng **dính trên thân / vùng sàn lặp lại suốt trận**:
  - `hu-bam-bang` / `hu-bam-doc` / `hu-bam-lua` (4 khung, 6–9 khung/giây).
  - `hu-vung-quai-*` (6 khung, 6,7 khung/giây).
  - `hu-may-doc` (5).
  - `hu-cong` (6,7).
- Các hiệu ứng chậm vì cố ý (dây leo, nấm con 2–4 khung/giây) thì để nguyên.
- **Cách sửa:**
  - (A) Với hiệu ứng lặp chậm: hoà nhẹ khung kế (độ hiện 0–35%) cho đỡ nhảy.
  - (B) Gen lại 8 khung cho `hu-bam-*` và `hu-vung-quai-*`. Xem **P5**.

### 🟡 17. Cu Tí đứng thở: đứng im ~0,5 giây rồi bật về khung 1 — (A)

Xem `gif-7-cu-ti-dung-tho.gif`.

- **Đo được:** 4 khung cuối của hàng `dung` gần như giống nhau (độ khác 0,9–1,7% so với 4–6% ở khung đầu). Bước nối vòng (khung 8→1) lớn gấp 1,5 lần bước trung bình.
- **Cách sửa:** phát theo thứ tự 1-2-3-4-5-4-3-2 (đi đi về về) trong `zed_moi.js` hàng `dung`. Không cần ảnh mới.
- Tương tự, `bua_giu` (tụ lực búa) nối vòng cũng bị nhảy (×1,67): phát đi đi về về.

### 🟡 18. Bước chân quái không theo tốc độ đi; quái lùi mà chân bước tới — (A)

- **Ở đâu:** hàng `move` lặp theo `giay` của ảnh, không theo tốc độ thật.
  - Tốc độ thật đổi do băng làm chậm, kỹ năng chậm, trùm đi chậm.
  - Quái đánh xa lùi lại (`keep()`) vẫn chạy hàng đi tới, trông như đi lùi kiểu "moonwalk".
- **Cách sửa:**
  - Đồng hồ hàng đi nhân với (tốc độ thật ÷ tốc độ gốc), trong khoảng 0,5–1,5.
  - Đi ngược hướng mặt thì chạy hàng ngược hoặc chậm còn 0,6.

### 🟡 19. Quái trúng đòn: khung 4 chỉ hiện 37 ms — (A)

- **Ở đâu:** `mobs.js:132` đặt `hitT = 0,3`, nhưng hàng trúng đòn chia theo D = 0,35. Tiến độ không vượt 0,857, nên khung 4 chỉ ~2 lượt tính rồi bật về đứng (đồng hồ đứng lại chạy tiếp giữa chừng).
- **Cách sửa:** `t = (0,3 − hitT)/0,3 × D`, hoặc đặt `hitT` bằng D.

### 🟡 20. Cu Tí: đổi đi↔chạy mất nhịp bước, bắt đầu chạy ở khung bất kỳ — (A)

- **Ở đâu:** `zed_moi.js:114` và `177`.
  - Ngưỡng `diTL < 0,6` không có vùng đệm.
  - Cùng một đồng hồ đem chia cho chu kỳ khác, nên bước chân nhảy.
  - `chayT` không về 0 khi bắt đầu chạy.
  - Lướt kiếm dùng `P.t` thay vì đồng hồ bước.
- **Cách sửa:**
  - Giữ "pha bước" chuẩn hoá 0..1 dùng chung cho đi và chạy.
  - Vùng đệm: vào chạy >0,65, ra đi <0,55.
  - Bắt đầu chạy ở khung chân chạm đất.

### 🟡 21. Phóng to / nhỏ hiệu ứng theo số lẻ: răng cưa lấp lánh — (A)

- **Ở đâu:** `fx_anh.js:178-185` (tỉ lệ `scVet` 0,6–1,8, `r/40`...); đạn xoay `fx_dan.js:230` và `255`.
- **Cách sửa:**
  - Làm tròn tỉ lệ theo bậc 0,5 (nền gấp đôi nên vẫn đúng cỡ).
  - Đạn xoay: dựng sẵn 16 góc.

### 🟡 22. Chỗ tốn sức vẽ có thể làm rơi khung trên máy yếu — (A)

Ước lượng lúc đông nhất: phòng trùm, 9 quái, 6 vùng báo trước, 400 hạt. Khoảng 2.500–4.000 lệnh tô ô, ~120 lệnh vẽ ảnh, **10–18 ms** mỗi khung. Máy Android yếu đang sát mép 60 khung/giây.

| Chỗ | Vấn đề | Sửa |
|---|---|---|
| `fx.js:2456-2483` viền người chơi | Mỗi khung vẽ lại vào 3 tấm phụ, ~18 lần vẽ ảnh | Chỉ dựng lại khi khung Cu Tí đổi; máy yếu tắt |
| `ui_theme.js:29`, `948` | Khoá nhớ thanh máu có cả độ dài máu, nên đầy 700 là xoá sạch → khựng 5–20 ms | Chỉ nhớ khung; phần máu tô bằng `fillRect`; xoá dần (LRU) |
| `bao_truoc.js:696-702` | Hình quạt rộng cắt ~18 lát mỗi khung | Dựng sẵn theo góc |
| `fx.js:971` vệt chém | Đuôi lốm đốm 1 lệnh / điểm ảnh | Dùng độ trong suốt |
| `combat.js:1085-1113`, `stage.js:935`, `1179` | Tạo hàm / mảng mới mỗi khung | Dùng lại mảng |
| `ky_nang_quai.js:139` | `filter` mọi quái mỗi lượt trước khi xét hồi chiêu | Xét hồi chiêu trước |

### 🟡 23. Hàng đánh của trùm ít khung — (B)

- **Đo được:** Hồ Tinh pha 1 đánh chỉ **3 khung**. Các trùm khác 4 khung (pha 3 Hồ Tinh, Nấm Chúa pha 2: 5).
- Phát 12 khung/giây thì đòn chính của trùm xong trong 0,25–0,33 giây rồi đưa đi đưa lại 3 khung. Đòn quan trọng nhất trận lại ít khung nhất.
- **Cách sửa:** gen lại hàng đánh 6 khung. Ưu tiên Hồ Tinh pha 1. Xem **P6**.

### 🟡 24. Lặt vặt — (A)

- Quái đứng thở 6 khung / 1,2 giây (5 khung/giây). Chấp nhận được cho động tác thở, không cần sửa.
- Trùm chết dài 3,2–3,4 giây đã được `chonTrum` xử lý đúng (quằn quại rồi gục 10 khung/giây). Không cần sửa.
- Chớp nhẹ trúng đòn (`CHOP_NHE`) bật / tắt cứng trong 0,07 giây, không mờ dần. Có thể cho mờ 0,07→0 theo bình phương.
- Số sát thương không đi theo rung màn (`drawNums` vẽ ở lớp giao diện). Khi màn rung, số trượt so với quái: cộng thêm độ rung.

---

## 3. Phần cần GEN ẢNH: prompt, ảnh mẫu, số khung, thứ tự

Quy cách chung, như các đợt trước:

- Pixel art, **nền trơn #00FF00**, **1 hàng N khung xếp ngang, các khung cách xa nhau** (khoảng trống ≥ 1 khung).
- Nhìn nghiêng sang PHẢI, cỡ nhân vật bằng nhau mọi khung, chân chạm cùng một đường đất.
- Không chữ, không bóng đổ, không logo.
- Quái: theo 6 động tác `1-dung, 2-di, 3-bao-don, 4-danh, 5-trung-don (4 khung), 6-chet`.
- Gửi kèm: ảnh mẫu phong cách `docs/anh-goc/quai-moi/heoCon-mau-moi.png`, ảnh mẫu đúng con đó, khung que ở `docs/anh-goc/quai-moi/que/`.
- Tách bằng công cụ cũ (`tools/tach-quai`, `tools/tach-hieu-ung`) như mọi lần.

**Thứ tự gen đề xuất** (rẻ và thấy rõ trước):

1. **P4**: 2 hàng trúng đòn trùm. Rẻ; code vá tạm được nhưng ảnh đúng đẹp hơn.
2. **P1**: Cá Nóc Chúa hàng đánh.
3. **P2**: nhóm Nhím (thu gai).
4. **P3**: Heo Nanh Dài hàng trúng đòn.
5. **P6**: Hồ Tinh hàng đánh 6 khung.
6. **P5**: hiệu ứng dính thân / vùng sàn 8 khung.
7. **P8**: vùng báo trước 12–16 khung (chỉ khi code hoà khung chưa đủ).
8. **P9**: Cu Tí chạy + chém nặng (tuỳ chọn, tốn công ghép nhất).
9. **P7**: báo đòn 8 khung cho quái báo lâu (tuỳ chọn).

### P1. Cá Nóc Chúa — hàng 4-danh, 6 khung (thay hàng đánh hiện tại)

- **Cỡ:** cùng cỡ tấm cũ, khung game 97×111. Thân lúc phồng bằng khung 6 của hàng báo đòn.
- **Ảnh mẫu gửi kèm:**
  - `docs/anh-goc/quai-moi/caNocChua-mau-moi.png`
  - `docs/anh-goc/quai-moi/dong-tac/caNocChua-3-bao-don.png` (cỡ phồng)
  - `docs/anh-goc/quai-moi/dong-tac/caNocChua-4-danh.png` (hàng cũ)
  - `docs/anh-goc/quai-moi/que/tron-4-danh.png`
  - `docs/anh-goc/quai-moi/heoCon-mau-moi.png`

```
Redraw exactly the pufferfish king in the attached image (same design, colors, coral crown), pixel art, side view facing RIGHT. One row of 6 frames, frames well separated: frame 1 fully inflated, same size as the last frame of the attached wind-up sheet; frames 2-3 it tucks in and starts rolling forward as a spiky ball, still big; frames 4-5 rolling ball with a white-blue spin streak; frame 6 slightly smaller ball, slowing down. Body size shrinks gradually, never jumps. Same ground line. Plain #00FF00 background, no text, no shadow.
```

Sau khi có ảnh: giữ `lap_tu: 3, lap_den: 4` (vòng lăn), không cần sửa code.

### P2. Nhóm Nhím (Nhím Biển, Nhím Gai Độc, Nhím Than): thêm khung "thu gai / duỗi ra"

**Cách làm:** gen lại hàng 4-danh 6 khung cho từng con. 4 khung đầu như cũ (cuộn, lăn); **2 khung cuối duỗi ra về dáng đứng**. Như vậy về đứng không còn bật ×1,8.

- **Cỡ:** nhim 38×44, nhimDoc 50×40, nhimThan 42×37 (khung game).
- **Ảnh mẫu gửi kèm** (mỗi con):
  - `docs/anh-goc/quai-moi/<ma>-mau-moi.png`
  - `docs/anh-goc/quai-moi/dong-tac/<ma>-4-danh.png`
  - `docs/anh-goc/quai-moi/dong-tac/<ma>-1-dung.png`
  - `docs/anh-goc/quai-moi/que/tron-4-danh.png`

Nhím Biển (`nhim`):

```
Redraw exactly the sea urchin in the attached image, pixel art, side view facing RIGHT. One row of 6 frames, well separated: frames 1-2 spines tuck in, it curls into a tight spiky ball; frames 3-4 rolling ball, spines flared with a light streak; frames 5-6 it uncurls and settles back into the exact standing pose of the attached idle sheet. Same body size in every frame, same ground line. Plain #00FF00 background, no text, no shadow.
```

Nhím Gai Độc (`nhimDoc`):

```
Redraw exactly the poison hedgehog in the attached image, pixel art, side view facing RIGHT. One row of 6 frames, well separated: frames 1-2 curls into a ball, green poison quills bristling; frames 3-4 rolling ball shooting quills forward; frames 5-6 uncurls back to the exact standing pose of the attached idle sheet, quills lowering. Similar body size in all frames, same ground line. Plain #00FF00 background, no text, no shadow.
```

Nhím Than (`nhimThan`): dùng prompt Nhím Gai Độc, đổi "poison hedgehog / green poison quills" thành "ember hedgehog / glowing coal quills".

### P3. Heo Rừng Nanh Dài — hàng 5-trung-don, 4 khung

- **Cỡ:** khung game 95×64.
- **Ảnh mẫu gửi kèm:**
  - `docs/anh-goc/quai-moi/heoNanh-mau-moi.png`
  - `docs/anh-goc/quai-moi/dong-tac/heoNanh-5-trung-don.png` (hàng cũ, khung 1 chồm lên)
  - `docs/anh-goc/quai-moi/que/4chan-5-trung-don.png`
  - `docs/anh-goc/quai-moi/heoCon-mau-moi.png`

```
Redraw exactly the long-tusked boar in the attached image, pixel art, side view facing RIGHT. One row of 4 frames, well separated: hit reaction. Frame 1 head snaps back, body pushed slightly backward, eyes squeezed shut, all four feet still on the ground; frame 2 recoils a bit more, mane flips; frames 3-4 recovers into the idle stance. Do NOT rear up, do NOT turn around. Same size and ground line in all frames. Plain #00FF00 background, no text, no shadow.
```

### P4. Trúng đòn trùm pha 2: Hổ Lửa pha 2, Nấm Chúa pha 2 — mỗi con 4 khung

- **Cỡ:** hoLua-p2 96×99, namChua-p2 79×96.
- **Ảnh mẫu gửi kèm:**
  - Hổ Lửa: `docs/anh-goc/trum-moi/ho-lua-p2.png`, `docs/anh-goc/trum-moi/ho-lua/p2-4-trung-don.png` (hàng cũ, khung 2 trắng).
  - Nấm Chúa: `docs/anh-goc/trum-moi/nam-chua-p2.png`, `docs/anh-goc/trum-moi/nam-chua/p2-4-trung-don.png` (hàng cũ, khung 3 trắng).

```
Redraw exactly the enraged boss in the attached image (same design, colors, flames/spores), pixel art, side view facing RIGHT. One row of 4 frames, well separated: hit reaction. Frame 1 flinches back; frame 2 recoils further, eyes shut; frames 3-4 snaps back to the attached stance, angry. Keep the body's own colors in every frame: NO white flash, NO all-white body, at most a few small white sparks. Same size and ground line. Plain #00FF00 background, no text, no shadow.
```

Nấm Chúa: thêm vào cuối "pink spores puff out a little".

### P5. Hiệu ứng dính thân / vùng sàn: 8 khung lặp

- **Danh sách:** `hu-bam-bang`, `hu-bam-doc`, `hu-bam-lua` (dính thân, khung game ~30×30), `hu-vung-quai-do` (và bản `-bang`, `-doc`, `-lua`, khung 52×52).
- **Ảnh mẫu gửi kèm:** dải hiện tại `docs/review/ke-hoach-cai-thien/soat-muot/mau/<mã>-hien-tai.png`.

Mẫu cho `hu-bam-lua` (đổi màu / chất cho bản băng, độc):

```
Redraw the effect in the attached strip as a smoother loop: pixel art, one row of 8 frames, well separated. Small fire clinging to a body: flames flicker and drift upward, embers rise and fade. Frame 8 must flow seamlessly back into frame 1. Same size every frame, same colors as the attached strip. Plain #00FF00 background, no text, no shadow, no character.
```

Mẫu cho vùng sàn `hu-vung-quai-do`:

```
Redraw the ground zone in the attached strip as a smoother loop: pixel art, top-down, one row of 8 frames, well separated. Glowing red circle on the floor with runes slowly rotating and a soft pulse; frame 8 loops seamlessly into frame 1. Same size and colors as the attached strip. Plain #00FF00 background, no text, no shadow.
```

### P6. Hồ Tinh pha 1 — hàng 4-danh, 6 khung

- **Cỡ:** khung game 166×210.
- **Ảnh mẫu gửi kèm:** `docs/anh-goc/trum-moi/ho-tinh-p1.png`, `docs/anh-goc/trum-moi/ho-tinh/4-danh.png` (3 khung cũ).

```
Redraw exactly the fox spirit boss in the attached image, pixel art, side view facing RIGHT. One row of 6 frames, well separated: frame 1 draws back, tails spread; frame 2 leans in, fox-fire gathers in the hand; frame 3 thrusts the hand forward releasing a fireball; frame 4 follow-through; frames 5-6 recover toward the idle pose. Same size and ground line in every frame. Plain #00FF00 background, no text, no shadow.
```

Sau khi có ảnh: các trùm khác (4 khung) làm sau, cùng mẫu prompt.

### P7. (Tuỳ chọn) Báo đòn 8 khung cho quái báo lâu: Nấm Phồng, Cá Nóc

- **Ảnh mẫu gửi kèm:** `docs/anh-goc/quai-moi/<ma>-mau-moi.png`, `docs/anh-goc/quai-moi/dong-tac/<ma>-3-bao-don.png`, `docs/anh-goc/quai-moi/que/<khung que cùng loại>-3-bao-don.png`.

```
Redraw exactly the monster in the attached image, pixel art, side view facing RIGHT. One row of 8 frames, well separated: wind-up before attacking. Frames 1-5 gradually build up (crouch / swell), frames 6-8 are three nearly identical "trembling at full power" poses that can ping-pong. Size grows smoothly, never jumps. Same ground line. Plain #00FF00 background, no text, no shadow.
```

### P8. (Tuỳ chọn) Vùng báo trước 12–16 khung: tròn, quạt, dải dài, vành khuyên

- **Ảnh mẫu gửi kèm:** `docs/anh-goc/bao-truoc/tron.png` (và `hinh-quat.png`, `dai-thang-doc.png`, `vanh-khuyen.png`).
- **Cỡ:** như tấm cũ (khung 184×184 với hình tròn).

```
Redraw the danger zone in the attached image as a fill-up animation: pixel art, top-down, one row of 14 frames, well separated. Frames 1-13: the red fill grows smoothly from the center outward in equal small steps (the outline ring stays the same in every frame); frame 14: full bright flash of the whole zone. Same size and colors as the attached image. Plain #00FF00 background, no text, no shadow.
```

### P9. (Tuỳ chọn) Cu Tí chạy + chém nặng: thân trên chém trên chân chạy

Chỉ làm nếu muốn giữ lối chơi vừa chạy vừa bổ. Nếu không, sửa code mục 12 là đủ.

- **Hàng:** `kiem_3` (6 khung), `thuong_quet` (6), `bua_nen` (8).
- **Ảnh mẫu gửi kèm:**
  - `docs/anh-goc/zed/moi/00-anh-mau.png`
  - `docs/anh-goc/zed/moi/03-chay-v3.png` (chân chạy)
  - `docs/anh-goc/zed/moi/10-kiem-3.png` (đòn hiện tại)
  - đọc thêm `docs/anh-goc/zed/README-ghep-lop.md` (cách tách lớp vũ khí / nắm tay)
- **Cỡ:** ô 48×48 game, không cầm vũ khí, như các hàng Cu Tí khác.

```
Redraw exactly the boy in the attached image, pixel art, side view facing RIGHT, empty hands (weapon is added later). One row of 6 frames, well separated: he keeps RUNNING (legs copy the attached run sheet frames 1-6) while the upper body does a big overhead two-handed slash: wind up, swing down, follow-through. Same size and ground line in every frame. Plain #00FF00 background, no text, no shadow.
```

---

## 4. Việc code (A) gom thành 3 phiên

Mỗi phiên chạy độc lập; phiên 1 và 2 có thể làm song song. Mỗi mục có cờ quay lui riêng.

| Phiên | Nội dung | Tệp đụng tới | Công | Cờ quay lui |
|---|---|---|---|---|
| **1. Quái động mượt** | Mục 2 (đòn đủ khung + giữ khung cuối) · 3 (choáng không chớp) · 4 (vùng đệm đi↔đứng, giữ đồng hồ) · 6A (báo đòn 12 khung/giây + đưa đi đưa lại) · 10A (xì hơi / thu gai bằng hàng báo đòn ngược) · 11A (2 khung trắng) · 18 (bước theo tốc độ) · 19 (khung trúng đòn 4) | `mobs.js`, `boss.js` (đi/đứng), `sprite_custom.js` | ~1 phiên đầy (5–6 giờ) | `?dondu=0`, `?choangcu=1`, `?didung=0`, `?baodeu=0`, `?xihoi=0`, `?khungtrang=1` (có sẵn), `?buoctoc=0` |
| **2. Cảm giác đánh** | Mục 5 (rung mượt + mức sàn + nút tắt) · 7 (đẩy lùi thật + bẹp nhẹ) · 13 (tiếng đổi cao độ, tiếng theo vũ khí, vung đúng lúc) · 14 (trần dừng hình, cung 25 ms) · 24 (chớp mờ dần, số theo rung) · 12A (đòn nặng đứng lại ra đòn) | `fx.js`, `combat.js`, `moves.js`, `engine.js` (âm), `sprite_custom.js` (bẹp) | ~1 phiên (4–5 giờ) + chơi thử cảm giác | `?rungcu=1`, `?dayluicu=1`, `?amcu=1`, `?dungcu=1`, `?chaydanhnang=0` |
| **3. Vẽ mượt + giao diện + hiệu năng** | Mục 1 (nội suy + làm tròn nửa điểm ảnh) · 8 (hiệu ứng mờ dần + nảy) · 9A (vùng báo trước hoà khung) · 16A (hiệu ứng lặp chậm hoà khung) · 15 (chuyển màn, bảng, truyện, thanh kinh nghiệm) · 17, 20 (nhịp Cu Tí) · 21 (tỉ lệ bậc 0,5) · 22 (viền người chơi, bộ nhớ thanh máu, cấp phát) | `engine.js`, `combat.js`, `stage.js`, `fx.js`, `fx_anh.js`, `bao_truoc.js`, `ui_theme.js`, `truyen.js`, `zed_moi.js` | 1–1,5 phiên (6–8 giờ) | `?noisuy=0`, `?humo=0`, `?bthoa=0`, `?uimuot=0`, `?nhipcuti=0`, `?tile05=0` |

**Lưu ý kiểm thử:**

- Phiên 1 đổi chỉ HÌNH, không đổi luật chơi, nên bot cân bằng không đổi kết quả.
- Phiên 2 có đẩy lùi thật, **đổi vị trí quái**. Cần chạy lại bot cân bằng (tỉ lệ thắng, thời gian giết) và giữ quái giáp / trùm hệ số nhỏ.
- Phiên 3 cần thử trên điện thoại màn 90/120 Hz, và một máy Android yếu với `?pin=1` (30 khung/giây).

Khi có ảnh mới từ mục 3, chỉ cần tách thay tệp `.sprite.json`. Riêng P1, P2, P3, P4 thì tắt luôn phần vá tạm tương ứng của phiên 1 (10A, 11A) cho tệp đó.

---

## 5. Phụ lục: số đo chính

- **Quái thường, khung/giây thật:**
  - Đứng 5.
  - Đi 6–17. Lệch nhiều so với tốc độ: tuongDa 6, cuaTuong 6, oc 6; caCon, chonBong, linhMa 17.
  - Báo đòn theo `bao`: caNoc, namPhong 6; Nhím các loại 7,5; caChuon 17.
  - Đánh: 19/30 con không bao giờ hiện khung cuối vì cắt 75%; 9 con hiện khung cuối ~45 ms.
  - Trúng đòn 11. Chết 4–5 (đã có mờ dần từ 0,6–0,82, ổn).
- **Lệch neo trong một hàng:** hầu hết dưới 3 điểm ảnh, tốt. Các chỗ "nhảy" ≥ 6 điểm ảnh đều là nhảy / bay cố ý (namPhongChua đánh, caChuon bay, caNoc đánh, doiThan) hoặc chết. Không tính là lỗi.
- **Khung trắng:** ngoài 6 tấm đã vá, còn `hoLua-p2` hit k2 (23%) và `namChua-p2` hit k3 (15%). `nguTinh-p3` báo đòn có loé trắng 14%: là hiệu ứng tụ lực, để nguyên.
- **Không có** khung trống, không sót viền xanh #00FF00 trong 45 tấm quái / trùm.
- **Cu Tí:** chạy 20 khung/giây, lộn 22, trúng đòn 20, kiếm 13–17, giáo 11–25, búa 8,6–10, đứng 6,4 (3 khung gần trùng), giữ giáo / ngắm phi tiêu 5,4 (động tác giữ, chấp nhận được).
- **Hiệu ứng (166 tấm):** trung vị 10,5 khung/giây; <6: 11 tấm; 6–9: 29; 9–12: 45; 12–20: 38; ≥20: 43. Chém / đâm / trúng đòn 25–30; nổ 14,5; trăng chém 12,5.
