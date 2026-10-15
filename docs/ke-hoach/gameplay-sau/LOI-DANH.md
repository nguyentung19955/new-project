# Lối đánh mới — kế hoạch (Phiên 2, 15/10/2026)

> Chỉ là KẾ HOẠCH, chưa sửa code. Viết theo yêu cầu `YEU-CAU.md` (phần "Phiên 2 — LOI-DANH.md").
> Hai tệp anh em: `VUNG.md` (vùng 5–8, phiên 1) và `LUC-CHIEN.md` (phụ kiện, linh thú, lực chiến, phiên 3).
> Chỗ nào cần khớp với họ thì ghi **[Điểm nối → VUNG]** hoặc **[Điểm nối → LUC-CHIEN]**, tệp này không viết thay.

## Tóm tắt một phút

Cu Tí hiện đánh khá đủ: 4 vũ khí, chuỗi đòn, đòn tích lực, Đặc biệt, Chưởng, Né lộn, 3 hệ (Lửa, Độc, Băng) và phản ứng hệ.
Cái **còn thiếu** là những thứ thưởng cho **tay người chơi giỏi lên** chứ không chỉ cho **đồ mạnh lên**. Kế hoạch thêm:

| # | Thứ mới cho Cu Tí | Một câu |
|---|---|---|
| A1 | **Né Kịp** (né hoàn hảo) | Lộn đúng lúc đòn sắp trúng → thời gian chậm lại một chút, nhát đánh kế tiếp thành **Đòn Đáp** mạnh |
| A2 | **Thanh Choáng** của tinh anh / trùm | Đánh mạnh, Né Kịp, Đòn Đáp làm đầy thanh → quái **choáng** 2 giây, ăn đòn nhiều hơn |
| A3 | **Nhịp Trống + Đòn Trống** (tuyệt kỹ) | Thanh 4 vạch hình mặt trống; đầy thì bấm Chưởng ra **Đòn Trống** riêng mỗi vũ khí |
| A4 | **Đòn Nối** khi đổi vũ khí | Vừa xong nhát kết mà bấm Đổi → vũ khí mới ra ngay một đòn nối |
| A5 | **Hệ Sét** (hệ thứ 4) | Điện lan sang quái đứng gần, tích 3 lần thì giật, phản ứng mới với Băng / Lửa / Độc, cây Chưởng Sét |
| A6 | **2 vũ khí mới**: Gậy Tre, Quạt Mo | Gậy có **thế thủ gạt đòn**; Quạt **thổi bay, hất đạn ngược lại** |
| A7 | **Hợp lực với linh thú** | Đánh cùng thú, đầy thanh Gắn Bó thì ra **Hợp Chiêu** |

Phía quái và trùm: **16 khuôn ra đòn dùng chung** (B1–B16), mỗi khuôn là một "bài học" người chơi phải học một lần rồi gặp lại ở nhiều vùng,
ví dụ: đòn chớp vàng phải Né Kịp, sét đánh theo vết chân, tia nối giữa hai cột, núp sau cột đá, đòn giả, đòn giữ, quái bay chỉ đánh được lúc bổ nhào…

Luật giữ cân bằng: mọi thứ ở phần A là **thưởng cho tay** (không cộng Sức mạnh), có trần số rõ ràng; người chơi **không dùng** chúng vẫn qua ải
như hôm nay. Đo bằng bot với "mức tay" khác nhau (phần C).

---

## 0. Đang có gì (để không làm trùng)

Rút từ code hiện tại (`moves.js`, `combat.js`, `chuong.js`, `bo_skill.js`, `boss.js`, `chieu_trum.js`, `ky_nang_quai.js`, `bao_truoc.js`, `mobs.js`):

- **Nút**: Di chuyển, Đánh (chạm / giữ), Né, Đặc biệt, Chưởng (giữ được để tích), Đổi vũ khí, Bình máu. Không nhảy, không nút tuyệt kỹ.
- **Vũ khí** (4 cố định): Kiếm (3 nhát, Nhát lướt sau Né, Trảm Nguyệt), Thương (4 nhát, Xốc tới, Phi Thương), Búa (nện, tích 2 mức,
  Địa Chấn), Phi tiêu (ném, Ném chùm, Mưa Phi Tiêu). Tự nhắm quái gần nhất.
- **Hệ**: Lửa / Độc / Băng, vòng khắc `G.WEAK` (lửa→băng→độc→lửa), vũ khí 4 bậc (Trắng → Mầm → Thành hình → Thức tỉnh),
  phản ứng Nổ khói (Lửa+Độc), Sốc nhiệt (Lửa+Băng). Cây Chưởng 3 nhánh × 6 nút.
- **Phòng thủ**: Né lộn 0,27 giây, bất tử 0,32 giây, hồi 1 giây. **Không có** đỡ, gạt, né hoàn hảo.
  Gần giống thì có: bộ Lâu đài **Phản đòn** (lộn sát lúc trúng → phản 50% sát thương), bộ Biển **Khiên nước**, nội tại phản 30%.
- **Cửa sổ trừng phạt**: trùm `tire → exposed` (×1,5) sau chiêu lớn; choáng / đóng băng **ngắt chiêu** trùm.
  **Không có thanh choáng** chung cho quái.
- **Tài nguyên trong trận**: chỉ có Mana (Đặc biệt 25, Chưởng 30). Không có nộ, không tuyệt kỹ.
- **Quái**: 8 vai (rusher, swarm, shield, archer, nimble, kami, bomber, spiky) + tinh anh; vùng báo trước 5 hình (tròn, đường, quạt,
  vành khăn có khe, chữ nhật), tường nước có khe, vũng, đạn đuổi, phân thân, nhịp xung (sứa), kéo hút, nảy (vùng 4).
  Sàn báo trước: 0,45 giây (vùng lớn 0,6 giây). Trùm thích nghi (kháng hệ, chống đánh xa / gần / né nhiều).
- **Linh thú**: chưa có (chỉ có Phân thân của bộ ninja).

=> Phần dưới **chỉ thêm cái chưa có**. Chỗ gần giống (Phản đòn của bộ Lâu đài) thì ghi rõ cách sống chung.

---

## Nguyên tắc thiết kế (đọc trước khi làm bất kỳ mục nào)

1. **Trẻ con chơi được**: không thêm tổ hợp phím khó (không "xuống-tới-đấm", không quay cần gạt). Mỗi thứ mới dùng nút đã có, hoặc
   thêm **tối đa 1 nút** (nút Thú, chỉ hiện khi đã có thú).
2. **Tay giỏi được thưởng, tay chưa giỏi không bị phạt**: cơ chế A1–A4 là phần thưởng thêm. Ải vẫn qua được khi không dùng.
3. **Mỗi cơ chế quái mới được dạy một mình trước** (phòng đầu vùng, một con quái thường, không có gì khác đè lên), rồi mới trộn.
4. **Đọc được bằng mắt**: một màu = một nghĩa, dùng chung cả game:
   - đỏ = vùng sát thương thường (như cũ);
   - **vàng** = đòn có thể **Né Kịp** để phản (B1);
   - **tím** = **không lộn xuyên qua được**, phải chạy ra / núp (B2);
   - **xanh lam** = quái đang **thế thủ** (đánh trước mặt bị phản, B12);
   - **trắng nhấp nháy** = đòn giả (B4).
5. **Ngân sách nguy hiểm**: một lúc tối đa **2 nguồn đòn khác loại** đang báo trước trên sân (trùm + 1 loại quái), để không chết oan.
6. **Mọi thứ có cờ quay lui** trong một bảng `G.LOI_DANH` (ví dụ `?loidanh=neKip:0,set:0`), mặc định bật theo đợt đã xong.

---

## Phần A — Cách ra đòn mới của Cu Tí

### A1. Né Kịp (né hoàn hảo) + Đòn Đáp

**Cảm giác**: quái vung rìu, mình lộn sát lúc rìu chạm → tiếng "keng", màn hình chậm lại một nháy, viền Cu Tí loé trắng, nhát đánh
tiếp theo bật ra thật đã.

**Luật**
- Đòn của quái (vùng báo trước nổ, đạn, đòn cận chiến) chạm Cu Tí **trong lúc bất tử do Né** và nút Né được bấm **không quá 0,15 giây
  trước** lúc chạm → **Né Kịp**.
- Thưởng:
  - **Chậm thời gian** 0,3 giây (quái và đạn chạy 40% tốc độ; Cu Tí chạy bình thường). Mỗi 3 giây tối đa 1 lần chậm (né kịp liên tục
    vẫn được thưởng kia nhưng không chậm nữa — tránh chóng mặt).
  - **+8 Mana** (trần: 1 lần mỗi 1,5 giây).
  - Trong 1 giây sau đó, nút Đánh ra **Đòn Đáp** của vũ khí đang cầm (bảng dưới), chỉ 1 lần.
  - Đầy thêm Nhịp Trống (A3) và Thanh Choáng của quái vừa tấn công (A2).
- Cửa sổ 0,15 giây là mức thường. Độ khó 1 (người mới): 0,2 giây. Cài đặt "Dễ" (nếu chủ game muốn) cho 0,25 giây.

| Vũ khí | Đòn Đáp | Số đề xuất |
|---|---|---|
| Kiếm | **Phản Trảm**: lướt xuyên qua quái 40 px, chém ngang | ×2,0, bất tử khi lướt |
| Thương | **Đâm Ngược**: đâm thẳng về hướng quái vừa đánh, đẩy lùi | ×1,8, tầm 70 |
| Búa | **Nện Đáp**: nện ngay không cần tích, choáng 0,6 giây | ×1,6, r 34 |
| Phi tiêu | **Ba Mũi Đáp**: 3 phi tiêu toả quạt, mỗi mũi tự nhắm | 3 × ×0,8 |
| Gậy Tre (A6) | **Quét Đáp**: quét vòng 360° | ×1,5, r 46 |
| Quạt Mo (A6) | **Gió Đáp**: luồng gió đẩy mọi thứ ra xa 60 px | ×1,0 |

**Sống chung với bộ Lâu đài "Phản đòn"**: Phản đòn vẫn giữ nguyên (phản % sát thương). Mặc bộ Lâu đài thì Né Kịp **cũng** phản thêm
→ bộ Lâu đài thành "bộ của người thích né kịp". Không đổi số Phản đòn.

**Sống chung với trùm "chống né" (`antiDodge`)**: một lần Né Kịp chỉ tính **nửa** lần né vào bộ đếm 15 lần né, để người né giỏi
không bị trùm học quá nhanh.

**Gắn vào code (gợi ý cho phiên code)**: `combat.js` chỗ kiểm tra bất tử trước khi nhận đòn (cùng chỗ `bo_skill.js K.phanDon` đang
gọi) → nếu `P.dodgeT` đang chạy và `now - P.neBamLuc <= cuaSo` thì `G.neKip(P, src)`. Chậm thời gian = hệ số `W.tScale` cho quái,
đạn, vùng (không áp lên Cu Tí, không áp lên đồng hồ ải).

### A2. Thanh Choáng (tinh anh, trùm nhỏ, trùm vùng)

Hiện chỉ có "mệt / hở sườn" sau chiêu lớn (do trùm tự quyết). Thêm một **thanh nhỏ dưới thanh máu**, người chơi tự làm đầy được.

- Đầy thanh bằng: mỗi đòn trúng cộng **điểm choáng** = hệ số vũ khí × hệ số đòn.
  - Hệ số vũ khí: Búa 1,6 · Gậy 1,3 · Thương 1,1 · Kiếm 1,0 · Quạt 0,9 · Phi tiêu 0,6.
  - Hệ số đòn: nhát thường 1 · nhát kết / tích lực 2,5 · Đặc biệt 3 · **Đòn Đáp 6** · **gạt đòn (Gậy) 8** · Đòn Trống 10.
  - Hệ Sét "giật" (A5) cộng thêm 4.
- Đầy → **Choáng** 2 giây (trùm vùng 1,6 giây): đứng im, ngắt chiêu đang ra, nhận ×1,4 sát thương (dùng chung cờ `exposed` hiện có,
  không cộng dồn với `exposed` — lấy số lớn hơn).
- Sau choáng: thanh về 0, **khoá 6 giây** không đầy, lần sau cần nhiều hơn 25% (trần ×2). Trùm vùng tối đa 1 lần mỗi pha.
- Thanh tự tụt nếu 4 giây không bị đánh (−10%/giây), để không "đánh lén một nhát mỗi phút".
- Cỡ thanh đề xuất: tinh anh 60 điểm, trùm nhỏ 120, trùm vùng 200 (đủ cho kiếm thường khoảng 25–35 giây đánh liên tục một lần).
- Cách đọc: thanh màu vàng; đầy thì quái có ngôi sao quay trên đầu (ảnh có sẵn kiểu choáng), tiếng "cạch" lớn.

Tại sao cần: Búa, Thương hiện thua Kiếm về tốc độ; thanh choáng cho họ một vai rõ ("đập choáng"), và cho người chơi một mục tiêu nhìn thấy
trong trận trùm dài.

**[Điểm nối → VUNG]** mỗi trùm vùng 5–8 nên có **1 chiêu "đòn vàng"** (B1) trong bộ chiêu để người chơi luyện Né Kịp → Choáng.

### A3. Nhịp Trống + Đòn Trống (tuyệt kỹ)

Gắn với cốt truyện trống đồng: Cu Tí lấy lại mảnh trống nào thì "nghe" được nhịp trống mạnh hơn.

- **Thanh Nhịp Trống**: hình mặt trống tròn cạnh nút Chưởng, **4 vạch** (4 tia mặt trời).
  - Đầy thêm từ: đòn trúng (rất ít), hạ quái, Né Kịp (+½ vạch), Đòn Đáp (+½ vạch), làm quái Choáng (+1 vạch), Đòn Nối (A4, +¼ vạch).
  - Thiết kế: người chơi thường đầy 1 lần mỗi **30–40 giây** đánh; người né giỏi khoảng 20 giây. **Không đầy khi đứng im / khi trong phòng
    không có quái.** Giữ qua phòng trong cùng ải, mất khi về làng.
- **Kích hoạt**: đủ 4 vạch thì nút **Chưởng đổi hình thành mặt trống**; bấm → **Đòn Trống** (thay cho một lần Chưởng, không tốn Mana).
  Muốn bắn Chưởng thường lúc thanh đầy thì **giữ** nút (giữ = tích Chưởng như cũ). Không thêm nút.
- Trong Đòn Trống Cu Tí **bất tử**, mọi vùng báo trước của quái tạm ngưng đếm (không bắt người chơi né lúc đang diễn).

| Vũ khí | Đòn Trống (tên đề xuất) | Diễn ra | Số đề xuất |
|---|---|---|---|
| Kiếm | **Trăm Nhát Trống Đồng** | Lướt qua lại 6 lần giữa các quái trong 90 px | 6 × ×1,2 |
| Thương | **Mũi Tên Chim Lạc** | Lao thẳng xuyên sân 200 px, kéo theo mọi quái trúng | ×4,0 + ×1,0 khi dừng |
| Búa | **Trống Trận Rung Đất** | Nện 3 lần, mỗi lần một vòng sóng to dần (r 40/70/100) | 3 × ×1,5, choáng 1 giây |
| Phi tiêu | **Mưa Sao Đồng** | Ném vọt lên, 16 mũi rơi tự nhắm | 16 × ×0,4 |
| Gậy Tre | **Gậy Tre Vươn Trời** | Gậy dài ra quét 2 vòng | 2 × ×2,0, r 90 |
| Quạt Mo | **Lốc Trống** | Lốc lớn hút quái vào giữa 2 giây rồi tung lên | ×0,5/0,25 giây + ×2,0 |

- **Trần với trùm**: một Đòn Trống gây tối đa **6% máu tối đa của trùm vùng** (trùm nhỏ 9%, tinh anh 20%). Quái thường không giới hạn.
- Hệ của vũ khí áp vào Đòn Trống như đòn Đặc biệt (lửa cháy, độc, băng, sét).
- Mở khoá: sau trùm vùng 4 (Thuồng Luồng làm rơi mảnh trống đầu tiên vào tay Cu Tí) — hoặc vùng 5 nếu chủ game muốn để vùng 4 gọn.
  **[Điểm nối → VUNG]** câu truyện lúc mở khoá (một trang ngắn: "Cu Tí áp tai vào mảnh trống...").
- **[Điểm nối → LUC-CHIEN]** nếu phụ kiện / ấn ký có dòng "tăng sát thương Đòn Trống" thì trần ở trên vẫn giữ (phụ kiện chỉ đẩy tới
  trần nhanh hơn ở quái thường, không vượt trần ở trùm). Đề nghị LUC-CHIEN **không** có dòng "đầy Nhịp Trống nhanh hơn" > 15%.

### A4. Đòn Nối (đổi vũ khí giữa chuỗi)

Hiện đổi vũ khí hồi 0,75 giây và huỷ nhát đang đánh — chỉ để đổi hệ. Thêm:

- Bấm Đổi trong **0,3 giây sau khi nhát kết / đòn tích / Đặc biệt trúng quái** → vũ khí mới ra ngay **Đòn Nối** (không chờ, không mất nhát):

| Đổi sang | Đòn Nối | Số |
|---|---|---|
| Kiếm | Rút kiếm chém chéo | ×1,3 |
| Thương | Đâm lướt 30 px | ×1,3 |
| Búa | Nện liền (không tích) | ×1,4, choáng 0,3 |
| Phi tiêu | Lùi 20 px + ném 2 mũi | 2 × ×0,7 |
| Gậy / Quạt | Quét ngắn / phẩy gió đẩy lùi | ×1,2 / ×0,8 |

- Đòn Nối mang hệ của vũ khí **mới** → cách tự nhiên để ra phản ứng hệ (vd. kiếm Lửa kết, đổi sang búa Băng → Sốc nhiệt).
- Trần: Đòn Nối hồi 2,5 giây (riêng, ngoài hồi Đổi 0,75 giây).
- Có **đếm đòn** hiện số nhỏ góc màn hình ("12 đòn!") chỉ để vui và để dạy; **không** nhân sát thương theo số đòn (tránh lăn cầu tuyết).
  Mốc 10 / 25 / 50 đòn cộng chút Nhịp Trống (¼ vạch, trần 1 lần mỗi 10 giây).

### A5. Hệ Sét (hệ thứ 4) — làm trước vùng 5 (BUOC-2-3-4 mục 4.1)

**Ý tưởng chính**: Lửa = cháy theo thời gian, Độc = cộng dồn, Băng = làm chậm / đóng băng. **Sét = lan sang quái đứng gần, giật ngắt**.
Sét mạnh khi quái **đứng túm tụm**; yếu khi đánh một con trùm đứng một mình (bù lại bằng "giật" ngắt chiêu và cộng Thanh Choáng).

**Trạng thái trên quái — "Tích điện"**
- Mỗi đòn hệ Sét trúng (theo tỉ lệ `G.PROC` như các hệ khác) cộng 1 tích điện, tối đa 3, giữ 4 giây.
- **Đủ 3 → Giật**: choáng 0,4 giây (trùm vùng / trùm nhỏ: không choáng, chỉ **ngắt chiêu đang gồng** nếu chiêu đó chưa tới 50% báo trước,
  và +4 điểm Thanh Choáng), rồi về 0; miễn giật 3 giây.
- Mỗi lần trúng hệ Sét: tia điện **nhảy sang 1 quái gần nhất trong 50 px** gây ×0,3 sát thương gốc (không nhảy tiếp).

**Vũ khí hệ Sét 4 bậc** (cùng giá linh khí, cùng `G.STAGE_MULT` như 3 hệ cũ — không đắt hơn, không mạnh hơn):
- **Đặc tính 1 (Thành hình)** — nhát kết / đòn tích / Đặc biệt cắm **Cột Thu Lôi** nhỏ tại chỗ trúng: 3 lần giật quái trong 40 px,
  mỗi lần ×0,25, cách nhau 0,5 giây. Tối đa 2 cột trên sân. Phi tiêu: mũi Sét nảy sang thêm 1 quái thay vì cắm cột.
- **Đặc tính 2 (Thức tỉnh)** — tia nhảy thành **chuỗi 3 quái** (×0,3 → ×0,2 → ×0,15) và quái chết khi đang tích điện **nổ tia** sang 2 quái gần.

**Phản ứng hệ mới** (cùng luật hiện có: tối đa 2 hệ trên một quái, hồi 0,6 giây):

| Cặp | Tên | Hiệu ứng | Số đề xuất |
|---|---|---|---|
| Sét + Băng | **Băng Dẫn Điện** | Tia nhảy sang **mọi** quái đang có dấu Băng trong 90 px | ×0,8·nguồn mỗi con |
| Sét + Lửa | **Sấm Nổ** | Nổ vòng r 30, đẩy lùi mạnh, xoá cả hai dấu | ×1,6·nguồn |
| Sét + Độc | **Mây Điện** | Đám độc sẵn có trên sàn hoá mây điện 2 giây, giật quái đứng trong | ×0,25 / 0,4 giây |

(Giữ số phản ứng Sét **dưới** Sốc nhiệt ×2,5 để Sét không lấn hệ cũ.)

**Vòng khắc**: không đụng vòng 3 hệ cũ (`G.WEAK` giữ nguyên, tránh cân lại cả vùng 1–3). Đề xuất:
- Quái / trùm **hệ nước** (vùng 2, vùng 4) và quái đang **ướt** (đứng trong nước, vùng 4 có nước sẵn) nhận **×1,3 từ Sét**.
- Quái hệ Sét (vùng 5) **kháng Sét** ×0,75 như quái kháng hệ khác.
- Trùm thích nghi kháng Sét (khi người chơi dùng Sét > 50%) thì **yếu với hệ người chơi dùng ít nhất** trong 3 hệ cũ.
- → Câu hỏi cho chủ game (mục E): có muốn đưa Sét vào vòng khắc thành 4 hệ không.

**Cây Chưởng Sét** (nhánh thứ 4, 6 nút, như 3 nhánh cũ):
- Gốc: **Tia Sét** — đường thẳng tức thì (không bay chậm như cầu lửa), xuyên 1 quái, ×1,1, dài như tầm chưởng hiện tại.
- Nút: `luc` (sát thương) · `nhay` (tia nhảy sang 2 quái) · `sam` (giữ để gọi **sét đánh từ trời** xuống chỗ quái gần nhất, ×2,2) ·
  `cot` (để lại Cột Thu Lôi) · `giat` (+1 tích điện mỗi lần trúng) · `cau` (**Quả Cầu Sét** bay chậm, giật mọi thứ nó đi qua).

**Sét trên người Cu Tí** (khi bị quái Sét đánh): **Tê** 2 giây — hồi Né +0,3 giây, chạy −10%. Không thêm sát thương theo thời gian
(khác Lửa / Độc), để vùng 5 có cảm giác riêng mà không gắt hơn.

**[Điểm nối → VUNG]** vùng 5 Núi Sét mở hệ Sét (Thần Sét được cứu trao "hạt sét" cho vũ khí). Quái vùng 5 nên dùng các khuôn B6, B7, B15.
**[Điểm nối → LUC-CHIEN]** hiệu ứng nhìn thấy: vũ khí Sét có tia lách tách (bậc Thức tỉnh), ảnh danh sách ở mục D.

### A6. Hai vũ khí mới: Gậy Tre và Quạt Mo

Chọn hai món **dân gian Việt**, mỗi món có **vai riêng** chưa vũ khí nào có (không phải "kiếm thứ hai"):

**Gậy Tre** (gậy tre đánh giặc) — vai: **thủ – phản**, tầm trung, quét đông.
- Chuỗi đánh: Quét ngang ×1,0 r 44 (180°) → Quét ngược ×1,0 → Xoay gậy ×0,6 × 3 nhịp quanh người. Sát thương gốc ≈ 10.
- **Giữ Đánh = Thế Thủ**: đứng chống gậy, chạy 30% tốc độ.
  - Đòn cận chiến / đạn từ **phía trước** chạm trong **0,25 giây đầu** của Thế Thủ → **Gạt**: không mất máu, quái choáng 0,8 giây
    (trùm: +8 điểm Thanh Choáng), đạn bị đánh văng xuống đất. Rồi buông nút ra **Đòn Đáp** như A1.
  - Sau 0,25 giây vẫn giữ: chặn **60%** sát thương đòn phía trước, đứng yên lâu thì mỏi (tối đa 2 giây, hồi 1 giây).
  - Không chặn được: đòn tím (B2), vùng nổ dưới chân, đòn từ sau lưng.
- **Đặc biệt — Gậy Chống Nhảy**: chống gậy vọt qua 70 px (bất tử khi bay), đáp xuống nện vòng r 36 ×1,6. Vai: thoát vòng vây,
  vượt qua vật cản thấp / vực nhỏ (không phải nhảy tự do — chỉ là đòn có đường bay cố định).
- Gậy là cách **duy nhất** có "đỡ đòn" trong game → người thích đứng đỡ chọn Gậy, người thích né chọn Kiếm.

**Quạt Mo** (quạt mo của chú Bờm) — vai: **khống chế – gió**, sát thương thấp, đẩy / kéo, hất đạn.
- Chuỗi đánh: Phẩy gió hình quạt r 70, ×0,7, **đẩy lùi** 25 px (quái nhẹ) → Phẩy ngược → Phẩy mạnh ×1,2 đẩy 50 px, đập vào tường thì
  choáng 0,5 giây. Sát thương gốc ≈ 9.
- **Đạn của quái bị gió quạt trúng thì bay ngược lại** (trùm: đổi hướng nhưng không gây sát thương cho trùm quá 3% máu mỗi lần, hồi 2 giây).
- **Giữ Đánh = Gió Cuốn**: lốc nhỏ trước mặt **hút** quái nhẹ vào gom lại (dùng chung mã hút có sẵn của xoáy nước trùm, đổi chiều).
- **Đặc biệt — Bão Quạt**: luồng gió thẳng dài 160 px đi chậm, cuốn mọi quái nhẹ theo, thả ra ở cuối, ×0,4/0,2 giây.
- Hợp với Sét / Độc (gom đám rồi lan), đúng vai vùng 7 Đỉnh mây (gió, quái bay — đòn gió **đánh trúng quái bay**, xem B10).

**Mở khoá đề xuất**: Gậy Tre ở vùng 6 (người được cứu trao), Quạt Mo ở vùng 7. **[Điểm nối → VUNG]** ai trao, ở đâu.
**[Điểm nối → LUC-CHIEN]** hai món dùng **cùng** đường nâng cấp (bậc, mài, ép đồ, linh khí) như 4 món cũ; không thêm tài nguyên riêng.
Bot `balance.py ... vukhi` phải thêm 2 món, ngưỡng thắng ≥ 50% như món cũ.

**Không làm** (đã cân nhắc): Nỏ thần (trùng vai Phi tiêu), Roi (trùng Thương), song kiếm (trùng Kiếm).

### A7. Hợp lực với linh thú (phần đánh nhau)

LUC-CHIEN quyết **có thú bằng cách nào, nâng cấp, tiến hoá, chỉ số**. Tệp này chỉ quy định **thú ra đòn thế nào trong trận**.

- **Thú tự đánh**: đi theo, tự tấn công quái Cu Tí vừa đánh (ưu tiên) hoặc quái gần nhất. Quái **không** nhắm thú (thú không chết,
  đỡ phiền); thú bị đòn vùng trúng thì "choáng mệt" 2 giây cho có cảm giác.
- **Nút Thú** (nút thứ 5, chỉ hiện khi đã có thú): chạm = **Lệnh**: thú lao tới quái Cu Tí đang nhắm và ra **đòn riêng** (hồi 6 giây).
- **Thanh Gắn Bó** (vòng tròn quanh nút Thú): đầy dần khi thú và Cu Tí **đánh cùng một quái trong 1 giây** ("đánh hợp nhau"),
  khi Cu Tí Né Kịp lúc thú đứng gần. Đầy (≈ 45 giây) → nút sáng, chạm ra **Hợp Chiêu** (Cu Tí bất tử trong lúc diễn).
- Ba **kiểu thú đánh** (LUC-CHIEN gắn con thú cụ thể vào kiểu):

| Kiểu | Đòn riêng (Lệnh) | Hợp Chiêu (ví dụ) | Số đề xuất |
|---|---|---|---|
| **Xung** (vd. trâu / chó) | Húc thẳng, đẩy lùi, +điểm choáng | **Cưỡi Húc**: Cu Tí đứng trên lưng thú lao 3 đường chéo sân, vũ khí đánh theo | 3 × ×1,5 |
| **Bay** (vd. chim Lạc) | Bổ nhào xuống quái, đánh được quái bay (B10) | **Cánh Lạc**: thú quắp Cu Tí bay qua sân 1,2 giây (không gì chạm được), thả ném vũ khí xuống | ×2,5 vòng r 50 nơi đáp |
| **Giữ** (vd. rùa vàng) | Đặt khiên mai rùa trước mặt Cu Tí 3 giây, chặn đạn | **Mai Rùa Đồng**: khiên tròn bao quanh 4 giây, đạn chạm thì dội ngược, cuối nổ | ×2,0 r 40 |

- Hợp Chiêu tính chung trần với Đòn Trống (≤ 6% máu trùm vùng mỗi lần). Không ra Hợp Chiêu và Đòn Trống cùng lúc (cái sau chờ cái trước xong).
- **Trần sát thương thú**: tổng sát thương thú tự đánh + Lệnh ≈ **12–15% sát thương Cu Tí** cùng thời gian (đo ở `tinh.js`).
  Cấp thú / tiến hoá do LUC-CHIEN tăng số **trong khung này** (trần 20% khi thú tối đa).
- **[Điểm nối → LUC-CHIEN]** đề nghị: thú đầu tiên (vùng 5) là kiểu **Xung** hoặc **Bay**; chỉ số thú tính vào Sức mạnh theo cách LUC-CHIEN
  chọn, nhưng phần **Hợp Chiêu** (tay) không tính vào Sức mạnh.

---

## Phần B — Kiểu ra đòn mới của quái / trùm (khuôn dùng chung)

Mỗi khuôn viết thành **một hàm dùng chung** (gợi ý `game/js/khuon_don.js`) mà quái nào cũng gọi được với số riêng, giống cách
`addZone` / `bomb` / `summon` đang dùng. Vùng nào dùng khuôn nào là việc của VUNG.md — bảng cuối phần B chỉ là **gợi ý**.

Mỗi khuôn ghi: **Đòn** · **Đọc thế nào** (báo trước) · **Cách xử** (bài học) · **Số đề xuất** · **Gắn code**.

**B1. Đòn Vàng (dạy Né Kịp)**
- Đòn: quái vung đòn lớn; viền quái **loé vàng 0,3 giây trước khi trúng** (ngoài vùng đỏ như thường).
- Cách xử: lộn đúng lúc → Né Kịp ra **Phản Lớn**: quái choáng 1,2 giây (trùm: +25% Thanh Choáng). Không né kịp vẫn né thường được.
- Số: báo trước tổng ≥ 0,7 giây; mỗi trùm tối đa 1 chiêu Vàng; tinh anh 1 đòn Vàng mỗi 8 giây.
- Gắn code: cờ `vang:true` trên vùng; `bao_truoc.js` vẽ viền vàng; A1 đọc cờ này để thưởng thêm.

**B2. Đòn Tím (không lộn xuyên được)**
- Đòn: vùng sát thương **kéo dài** (tường điện, mặt đất rung) mà bất tử khi lộn **không** cứu — phải ra khỏi vùng / núp.
- Cách xử: đọc màu tím → chạy ra, không lộn tại chỗ. Dạy người hay "spam Né".
- Số: báo trước ≥ 0,9 giây; vùng tím luôn chừa **lối thoát ≥ 40 px**; sát thương ≤ 60% đòn đỏ cùng vùng (vì không lộn được).
- Gắn code: cờ `xuyenNe:true` bỏ qua bất tử do Né (vẫn tôn trọng bất tử 0,55 giây sau khi trúng, và Đòn Trống / Hợp Chiêu).

**B3. Đòn Theo Nhịp**
- Đòn: chuỗi 3–6 đợt (sóng vòng, cột đá) **cách đều nhau theo nhịp** có tiếng trống / sấm, vạch nhịp nhấp nháy dưới chân.
- Cách xử: né theo nhịp (đếm "tùng – tùng – TÙNG"); đợt cuối luôn to hơn.
- Số: nhịp 0,6–0,8 giây, không nhanh hơn 0,5 giây; tối đa 6 đợt.
- Gắn code: tổng quát hoá nhịp của sứa (`sua` beats) thành `G.khuon.nhip(src, mau, nhip[], hinh)`. **Dành cho Hắc Long pha 3** và trùm vùng 5.

**B4. Đòn Giả**
- Đòn: quái gồng đòn (có vùng báo trước), tới 60% thì **huỷ**, thân **nháy trắng**, gồng lại nhanh hơn (báo trước 0,5 giây).
- Cách xử: thấy nháy trắng thì chờ thêm nhịp rồi mới né. Phạt người né quá sớm.
- Số: mỗi chuỗi tối đa 1 đòn giả; chỉ từ vùng 6 trở đi; tần suất ≤ 30% số lần ra chiêu đó.
- Gắn code: trạng thái `gia` trong `begin()` của `mobs.js`.

**B5. Đòn Giữ (trễ nhịp)**
- Đòn: báo trước đầy nhưng quái **giữ tay trên cao** thêm 0,3–0,5 giây (tay sáng dần) rồi mới đánh.
- Cách xử: nhìn tay, không nhìn vòng đỏ. Kết hợp tốt với Né Kịp (B1).
- Số: thời gian giữ hiện thanh nhỏ trên đầu quái (cho trẻ con), không dùng chung với B4 trên cùng một đòn.

**B6. Sét Theo Vết (dạy đi liên tục)**
- Đòn: quái đánh dấu **3–5 chỗ Cu Tí vừa đứng** (cách 0,4 giây), mỗi dấu nổ sau 1 giây.
- Cách xử: cứ chạy, đừng đứng; chạy vòng tròn là an toàn.
- Số: r 18 mỗi dấu; tối đa 5 dấu trên sân; không đặt dấu khi Cu Tí đang trong Đòn Trống.
- Gắn code: hàng đợi vị trí `P` + `addZone('circle', …, 1.0)`.

**B7. Tia Nối (hai điểm nối nhau)**
- Đòn: 2 cột / 2 quái nối nhau bằng **tia điện**; chạm tia thì giật (Tê, A5). Tia có thể **quay** quanh một đầu.
- Cách xử: phá một đầu (cột có máu) hoặc đi vòng; tia quay thì chạy theo chiều quay.
- Số: tia dày 8 px; quay ≤ 60°/giây; báo trước 0,8 giây trước khi tia bật.
- Gắn code: hình `line` sống dài (`pool` dạng đường) có hai đầu là thực thể; mới: đầu di động.

**B8. Khiên Hệ**
- Đòn: quái có **khiên màu** (lửa / băng / độc / sét) trên thanh máu, khiên chặn 80% sát thương **trừ** hệ khắc nó.
- Cách xử: đổi vũ khí / Chưởng sang hệ khắc (A4 Đòn Nối rất hợp). Khiên vỡ → choáng 1,5 giây.
- Số: khiên = 25% máu quái; tinh anh tối đa 1 khiên; trùm có thể đổi màu khiên mỗi pha (như Thuồng Luồng đổi hệ).
- Ghi chú cân bằng: người **chỉ có 1 hệ** vẫn phá được (chậm hơn ~2 lần, vẫn qua) — không khoá cứng.

**B9. Trong Bóng Tối**
- Đòn: quái chỉ hiện rõ trong vòng sáng đèn; ngoài vòng sáng chỉ thấy **hai chấm mắt**.
- **Luật công bằng bắt buộc**: vùng báo trước luôn vẽ **sáng** dù trong tối, có tiếng gồng đòn. Không có đòn "vô hình".
- Cách xử: đứng gần đèn / mang đèn (luật vùng 6), Sét / Lửa soi sáng quái 2 giây khi trúng.
- **[Điểm nối → VUNG]** luật đèn của vùng 6 do VUNG.md quyết; khuôn này chỉ lo phần quái.

**B10. Quái Bay (đánh lúc bổ nhào)**
- Đòn: quái bay cao — **bóng đổ trên sàn**; đòn cận chiến không tới (tự nhắm bỏ qua quái đang bay cao), phi tiêu / chưởng / quạt / thú Bay đánh được.
  Quái bổ nhào (vùng báo trước ở bóng) rồi **đậu dưới đất 1–1,5 giây** → lúc đó đánh cận chiến.
- Cách xử: né cú bổ, đánh lúc đậu; hoặc dùng đòn xa.
- Số: tối đa 3 quái bay một lúc; lúc bay không gây sát thương (chỉ lúc bổ / bắn).
- Gắn code: cờ `cao` cho quái; `moves.js` tự nhắm lọc `!e.cao` với đòn cận.

**B11. Luồng Gió**
- Đòn: dải gió ngang sân **đẩy** Cu Tí 40 px/giây theo một hướng; quái đẩy người chơi về phía vũng / mép; đạn bay trong gió nhanh hơn.
- Cách xử: đi ngược gió, đứng sau tảng đá chắn gió; Quạt Mo (A6) đổi hướng gió nhỏ.
- Số: gió đổi hướng có báo trước 1,5 giây (mũi tên lá bay); đẩy ≤ tốc chạy 40%.
- Gắn code: dùng lại dòng nước vùng 4 (`luật dòng chảy ~30 px/s`) với hướng thay đổi.

**B12. Thế Thủ (quái đỡ)**
- Đòn: quái giơ khiên / khoanh tay, **viền xanh lam phía trước**: đòn đánh phía trước bị **phản** (quái phản đòn ngay, báo trước 0,4 giây).
- Cách xử: lộn ra **sau lưng** rồi đánh, hoặc dùng búa tích lực / Đòn Đáp **phá thế** (choáng 1 giây).
- Khác `spiky` (gai phản mọi phía): đây chỉ chặn **phía trước** → bài học "vòng ra sau".
- Số: thế thủ 2 giây, hồi 6 giây; quay mặt chậm (90°/giây) để vòng ra sau được.

**B13. Thủ Lĩnh Hô**
- Đòn: một quái đội mũ / cờ **hô** (biểu tượng loa trên đầu 1 giây) → mọi quái trong phòng **cùng ra đòn** sau 1,2 giây.
- Cách xử: hạ thủ lĩnh trước; nghe tiếng hô thì tìm chỗ trống.
- Số: tối đa 4 quái nghe lệnh; mỗi quái đánh với **70%** sát thương (vì đánh dồn); hô mỗi 10 giây.

**B14. Bám Dính** (đã có kế hoạch ở vùng 4 — `diaTrau`, lưới `raiCaChua`) → **dùng lại**, chỉ ghi để bảng đủ.
  Thêm biến thể: lưới tơ (vùng 6, nhện / Chằn Tinh), dây trói gió (vùng 7). Luôn thoát được bằng bấm Né liên tục (3 lần).

**B15. Núp Sau Vật**
- Đòn: chiêu phủ **cả sân** (sét giáng, tiếng trống, ánh mặt trời), chỉ an toàn **sau cột đá / dưới mái** (vùng bóng sau vật).
- Cách xử: tìm vật che; vật che có thể **vỡ** sau 2 lần → không ỷ mãi một chỗ.
- Số: báo trước ≥ 1,2 giây (cả sân sáng dần + vẽ vùng an toàn xanh lá); mỗi trận tối đa 3 lần; luôn ≥ 2 vật che còn đứng.
- Gắn code: vùng `rect` toàn sân trừ "bóng" sau thực thể vật cản (tính bằng tia từ nguồn qua vật).

**B16. Ký Ức Chiêu (trùm dùng lại chiêu trùm cũ)**
- Đòn: trùm lớn mượn **1 chiêu đặc trưng** của các trùm trước (Mộc Tinh rễ đâm, Ngư Tinh sóng thần, Hồ Tinh phân thân…), có bóng mờ của trùm cũ hiện ra.
- Cách xử: người chơi đã học rồi → cảm giác "mình đã giỏi lên".
- Số: chiêu mượn giữ **nguyên báo trước** của bản gốc, sát thương theo bậc vùng mới.
- Gắn code: gọi lại hàm `SK` / `chieu_trum.js` có sẵn với tham số trùm mới. **Dành cho Hắc Long pha 2** (CHUNG.md đã chốt).

**Gợi ý vùng nào dùng khuôn nào** (VUNG.md quyết; mỗi vùng chỉ **giới thiệu tối đa 3 khuôn mới**):

| Vùng | Khuôn mới gợi ý | Khuôn cũ gặp lại |
|---|---|---|
| 5 Núi Sét | B6 Sét theo vết, B7 Tia nối, B15 Núp sau vật (Thần Sét) | B1 Đòn vàng (từ đây gắn vào mọi trùm), B3 nhịp sấm |
| 6 Rừng đá vôi / hang tối | B9 Bóng tối, B12 Thế thủ, B14 lưới tơ | B5 Đòn giữ, B8 Khiên hệ |
| 7 Đỉnh mây | B10 Quái bay, B11 Luồng gió, B13 Thủ lĩnh hô | B4 Đòn giả (lần đầu, ở trùm Đại Bàng) |
| 8 Đền trống đồng (Hắc Long) | B3 Theo nhịp (pha 3), B16 Ký ức chiêu (pha 2) | B1, B2, B15 |

Ghi thêm cho VUNG.md: B2 Đòn tím, B8 Khiên hệ có thể dùng **từ vùng 5** ở tinh anh nếu cần làm tinh anh "khác" quái thường.

---

## Phần C — Cân bằng: trần, số, cách đo bằng bot

### C1. Ai được tính vào "Sức mạnh"
- **Không tính** (thuần tay): Né Kịp, Đòn Đáp, Thanh Choáng, Nhịp Trống / Đòn Trống, Đòn Nối, Gạt đòn của Gậy, Hợp Chiêu.
- **Có tính** như vũ khí cũ: vũ khí Sét, Gậy Tre, Quạt Mo (dùng `G.wBase` chung, cùng `STAGE_MULT`, cùng giá).
- Chỉ số thú: theo LUC-CHIEN.

### C2. Bảng trần (đề xuất, sửa sau khi đo)

| Thứ | Trần |
|---|---|
| Né Kịp: chậm thời gian | 0,3 giây, 1 lần / 3 giây |
| Né Kịp: Mana | +8, 1 lần / 1,5 giây |
| Đòn Đáp | 1 lần mỗi Né Kịp, ×1,5–2,0 |
| Thanh Choáng | trùm vùng 1 lần / pha; khoá 6 giây; lần sau +25% (trần ×2) |
| Đòn Trống | ≤ 6% máu trùm vùng, ≤ 9% trùm nhỏ, ≤ 20% tinh anh; trung bình 1 lần / 30–40 giây |
| Hợp Chiêu | cùng trần Đòn Trống; ≈ 1 lần / 45 giây |
| Đòn Nối | hồi 2,5 giây, ×1,2–1,4 |
| Sét: tia nhảy | ≤ 3 quái, tổng ≤ ×0,65 nguồn; phản ứng ≤ ×1,6 (dưới Sốc nhiệt ×2,5) |
| Gậy Thế Thủ | gạt 0,25 giây đầu; chặn 60% sau đó, tối đa 2 giây |
| Quạt hất đạn vào trùm | ≤ 3% máu trùm / lần, hồi 2 giây |
| Thú (tự đánh + Lệnh) | 12–15% sát thương Cu Tí (trần 20% khi thú tối đa) |
| DPS vũ khí mới | trong ±8% Kiếm cùng bậc (`au_dps.py`); Quạt được thấp hơn 15–20% vì khống chế |

### C3. Đo bằng bot
Bot hiện tại (`game/tests/bot.js`) né với xác suất 50% khi vùng còn < 0,3 giây, phản xạ 0,2 giây. Thêm **"mức tay"** vào `G.botCfg`:

| Mức tay | Né Kịp | Dùng Đòn Trống | Đòn Nối | Thế Thủ (Gậy) | Ý nghĩa |
|---|---|---|---|---|---|
| `tay:0` | không | không | không | không | người chơi **không học gì mới** |
| `tay:1` (mặc định) | 25% lần né thành Né Kịp | có | 30% | 30% | người chơi thường |
| `tay:2` | 60% | có, chờ trùm choáng | 70% | 70% | người chơi giỏi |

**Ngưỡng chấp nhận** (theo `LUAT-CAN-BANG.md`, chạy **trước / sau** mỗi đợt):
1. `tay:0` sau khi thêm tính năng: tỉ lệ thắng mỗi ải **không giảm quá 3 điểm** so với hôm nay (quái mới không được "bắt buộc phải biết né kịp").
2. `tay:1`: lệch **±5 điểm** so với hôm nay (luật chung).
3. `tay:2`: tăng **tối đa +12 điểm**, thời gian đánh trùm giảm **tối đa 20%** — giỏi thì nhanh hơn, không phải dễ hẳn.
4. Số lần chơi qua 15 ải (`cay.py`) ở `tay:1` **không giảm quá 10%**.
5. Vũ khí mới: `balance.py n - [ải] vukhi` mỗi món ≥ 50% thắng; không món nào thắng hơn Kiếm quá 8 điểm.

**Lệnh đo** (khi code xong mỗi đợt):
- `node tools/can-bang/tinh.js` — thêm mục "Lối đánh": DPS kỳ vọng của Đòn Trống / Đòn Nối / thú trên 60 giây đánh trùm (phải dưới trần C2).
- `cd game && python3 tests/balance.py 20 --node --trum` với `LK_Q=tay=0`, `tay=1`, `tay=2` — bảng 3 cột.
- `cd game && python3 tests/cay.py 12 --node` — số lần chơi.
- `python3 docs/review/ke-hoach-cai-thien/kiem-can-bang/do_ai_chet.py` — chết vì đâu (để biết khuôn quái mới nào gây chết oan).
- Kiểm báo trước: `au_bao_truoc.py` thêm kiểm **vàng / tím / xanh lam / nháy trắng** đủ thời gian sàn.

**Cờ quay lui**: `G.LOI_DANH = { neKip, choang, trong, noi, set, gay, quat, thu }`, tắt từng cái bằng `?loidanh=neKip:0`.

---

## Phần D — Danh sách ảnh cần (chưa viết prompt — chờ chốt phong cách)

Số khung là đề xuất; "hiệu ứng" vẽ trên nền xanh như bước 3. Ảnh thú: LUC-CHIEN liệt kê, ở đây chỉ phần **đánh**.

| Nhóm | Tên ảnh | Số khung |
|---|---|---|
| Né Kịp | Loé trắng quanh Cu Tí + chữ "Kịp!" | 4 |
| Đòn Đáp | Vệt chém Phản Trảm, Đâm Ngược, Nện Đáp (sóng), Ba Mũi Đáp, Quét Đáp, Gió Đáp | 6 hiệu ứng × 4 |
| Thanh Choáng | Thanh vàng dưới máu trùm + sao quay khi choáng | 2 (giao diện) + 4 |
| Nhịp Trống | Mặt trống 4 vạch (rỗng → đầy), nút Chưởng hoá mặt trống | 5 + 2 |
| Đòn Trống | Cu Tí: 1 tư thế mở đầu chung + 4 tư thế riêng (kiếm, thương, búa, phi tiêu) | 1 × 4 + 4 × 4 |
| Đòn Trống | Hiệu ứng: vệt lướt đồng, chim Lạc mũi thương, 3 vòng sóng trống, mưa sao đồng | 4 × 6 |
| Đòn Nối | Chớp đổi vũ khí (vòng sáng) | 3 |
| Hệ Sét | Tia nhảy, Cột Thu Lôi, giật (trên quái), dấu tích điện 1/2/3, Tê (trên Cu Tí) | 4 + 4 + 4 + 3 + 3 |
| Hệ Sét | Phản ứng: Băng Dẫn Điện, Sấm Nổ, Mây Điện | 3 × 5 |
| Chưởng Sét | Tia Sét, sét từ trời, Quả Cầu Sét | 4 + 6 + 4 |
| Vũ khí Sét | Vũ khí 4 loại × 4 bậc nhuốm sét (đổi màu + tia ở bậc Thức tỉnh) | theo cách bước 2 làm hệ cũ |
| Gậy Tre | Vũ khí 4 bậc; Cu Tí: 3 nhát quét, thế thủ, gạt (loé), gậy chống nhảy, Đòn Trống | 4 + 3 + 2 + 2 + 3 + 4 |
| Quạt Mo | Vũ khí 4 bậc; Cu Tí: 3 phẩy, giữ gió cuốn, Bão Quạt, Đòn Trống | 4 + 3 + 2 + 3 + 4 |
| Quạt Mo | Hiệu ứng: gió quạt, lốc nhỏ, luồng bão, lốc trống | 4 + 4 + 6 + 6 |
| Hợp Chiêu | Cu Tí cưỡi (Xung), bị quắp bay (Bay), trong mai rùa (Giữ) | 3 × 4 |
| Giao diện | Nút Thú + vòng Gắn Bó; đếm đòn (chữ số kiểu trống) | 3 + 1 bộ số |
| Khuôn quái | Viền vàng (B1), vùng tím (B2), vạch nhịp (B3), nháy trắng (B4), tay sáng (B5), dấu sét (B6), tia nối (B7), khiên 4 màu (B8), 2 chấm mắt (B9), bóng bay (B10), lá bay chỉ gió (B11), viền xanh lam (B12), loa hô (B13), lưới tơ (B14), vùng an toàn (B15), bóng mờ trùm cũ (B16) | ≈ 1–4 mỗi cái, tổng ≈ 40 |

Ảnh quái cụ thể (con nào dùng khuôn nào) thuộc VUNG.md.

---

## Phần E — Thứ tự làm và câu hỏi

### E1. Thứ tự làm (mỗi đợt ~3 phiên code; mỗi đợt có đo trước / sau)

| Đợt | Phiên 1 | Phiên 2 | Phiên 3 | Vì sao trước |
|---|---|---|---|---|
| **1. Nền tay** | Né Kịp + Đòn Đáp 4 vũ khí + cờ | Thanh Choáng (tinh anh, trùm) + B1 Đòn Vàng gắn vào **1** chiêu mỗi trùm cũ (thử) | Bot `tay:0/1/2`, `tinh.js` mục Lối đánh, đo, chỉnh số | Mọi thứ sau dựa vào hai cái này; dùng được ngay ở vùng 1–4 |
| **2. Hệ Sét** (= BUOC 4.1) | Trạng thái Tích điện, Giật, Tê, phản ứng | Vũ khí Sét 2 đặc tính + cây Chưởng Sét | Ảnh tạm, bot chọn Sét, đo | Vùng 5 cần Sét |
| **3. Khuôn quái I** (cho vùng 5) | B6 + B15 | B7 + B3 | B2 + `au_bao_truoc.py` kiểm màu, đo chết oan | Song song với phiên làm vùng 5 (VUNG.md) |
| **4. Nhịp Trống** | Thanh + nút Chưởng đổi + Đòn Trống Kiếm, Búa | Đòn Trống Thương, Phi tiêu + trần trùm | Đòn Nối + đếm đòn, đo | Cần mảnh trống (sau vùng 4/5 truyện) |
| **5. Thú đánh** | Thú tự đánh + Lệnh (1 kiểu) | Thanh Gắn Bó + Hợp Chiêu | 2 kiểu còn lại, đo trần 12–15% | **Sau** khi LUC-CHIEN làm xong "có thú, đi theo" |
| **6. Khuôn quái II** (vùng 6–7) | B9 + B12 + B14 lưới | B10 + B11 | B13 + B4 + B5, đo | Theo nhịp VUNG.md |
| **7. Vũ khí mới** | Gậy Tre (đánh, Thế Thủ, gạt, Đặc biệt) | Quạt Mo (đánh, hất đạn, hút, Đặc biệt) | Đòn Trống + Đòn Đáp 2 món, `balance.py vukhi` 6 món | Mở ở vùng 6 / 7 |
| **8. Hắc Long** | B16 Ký ức chiêu | B3 nhịp trống pha 3 (khớp nhạc) | Đo cả chiến dịch 8 vùng | Khi chủ game muốn kết |

### E2. Câu hỏi cần chủ game quyết

1. **Né Kịp có làm chậm thời gian không?** A. Có, 0,3 giây (đã cảm), B. Không, chỉ loé + tiếng (gọn, không chóng mặt).
2. **Cửa sổ Né Kịp**: A. 0,15 giây (độ khó 1: 0,2), B. rộng hơn cho trẻ nhỏ 0,2 giây mọi độ khó, C. thêm cài đặt "Dễ" 0,25.
3. **Đòn Trống bấm thế nào?** A. Nút Chưởng đổi thành mặt trống khi đầy (đề xuất), B. bấm Đặc biệt + Chưởng cùng lúc, C. thêm nút riêng.
4. **Đòn Trống mở lúc nào?** A. Sau trùm vùng 4, B. sau trùm vùng 5 cùng hệ Sét, C. ngay bây giờ (vùng 1–3 cũng có).
5. **Hệ Sét vào vòng khắc không?** A. Không — Sét đứng ngoài, mạnh với quái nước / ướt (đề xuất, không cân lại vùng 1–3),
   B. Có — vòng 4 hệ (phải cân lại cả trùm cũ).
6. **Vũ khí mới**: A. cả Gậy Tre và Quạt Mo, B. chỉ Gậy Tre, C. chỉ Quạt Mo, D. món khác (Nỏ thần, Côn…).
7. **Đòn giả (B4) có quá khó với trẻ con không?** A. Giữ, chỉ từ vùng 6 (đề xuất), B. bỏ hẳn.
8. **Nút Thú**: A. thêm nút thứ 5 khi có thú (đề xuất), B. không thêm nút — thú chỉ tự đánh, Hợp Chiêu tự ra khi đầy.
9. **Thanh Choáng có áp lên trùm cũ vùng 1–3 không?** A. Có (đo lại), B. Chỉ từ vùng 5 trở đi.
10. **Đếm đòn hiện trên màn hình?** A. Có, B. Không (màn hình đỡ rối).

---

## Phần F — Điểm nối (tóm lại cho hai phiên kia)

**→ VUNG.md**
- Vùng 5 mở hệ Sét (ai trao, câu truyện); quái vùng 5 nên có quái **kháng Sét** và quái **nước / ướt** để thấy hệ Sét có tác dụng.
- Mỗi trùm vùng 5–8 có **1 chiêu Đòn Vàng** (B1) và **thanh choáng** (A2).
- Gợi ý khuôn theo vùng: bảng cuối phần B. Mỗi vùng ≤ 3 khuôn mới; có **phòng dạy** đầu vùng.
- Gậy Tre mở ở vùng 6, Quạt Mo ở vùng 7 (người trao, nơi trao).
- Luật đèn vùng 6 (B9) và luật gió vùng 7 (B11) do VUNG.md quyết; khuôn ở đây chỉ phần quái.
- Hắc Long: pha 2 dùng B16, pha 3 dùng B3 (đúng CHUNG.md).

**→ LUC-CHIEN.md**
- Thú: ba **kiểu đánh** (Xung / Bay / Giữ) và trần sát thương thú 12–15% (tối đa 20%). Thú cụ thể, cách có, nâng cấp, tiến hoá: LUC-CHIEN.
- Phụ kiện / ấn ký **không** vượt trần Đòn Trống ở trùm; "đầy Nhịp Trống nhanh hơn" ≤ 15%; "cửa sổ Né Kịp" nếu có thì ≤ +0,05 giây.
- Hiệu ứng nhìn thấy: vũ khí Sét (tia lách tách), Gậy / Quạt theo bậc — dùng cùng hệ thống hiệu ứng vũ khí của LUC-CHIEN.
- Gậy Tre, Quạt Mo, vũ khí Sét dùng **chung** đường nâng cấp cũ (linh khí, mài, ép đồ) — không thêm tiền tệ.
