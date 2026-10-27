# Thử 4 quái hướng mới "Cổ tích chuông tàn" (27/10/2026) – BẢN DUYỆT HÌNH

Viết cho người không rành kỹ thuật. Đây là **trang xem riêng**, chỉ để duyệt **hình dáng, cỡ, màu và 2 chuyển động cơ bản**
của Phu Đèn Lạc, Dơi Rễ, Nấm Thở, Người Gác Câm. **Chưa có luật chơi, chưa có đòn đánh** (chờ kế hoạch gameplay V2 quyết số).
Không sửa `game/demo.html`, `build-demo.py`, runtime hay Bọ Vỏ Mộc. **Chưa thử trên iPhone thật** – ảnh, video, số đo đều lấy
trong Chromium headless trên máy chủ Linux không có GPU.

**Xem:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-quai-huong-moi/index.html

- Hàng nút trên: chọn **Phu Đèn Lạc / Dơi Rễ / Nấm Thở / Người Gác Câm / Cả 4**. Lam mới (112 px) luôn đứng bên trái để so cỡ.
- Hàng nút dưới: **Đứng / thở** và **Di chuyển** (Dơi: Treo trần / Bay · Nấm: Thở nhẹ / Phồng ↔ xẹp), **Chậm ×4** để xem kỹ.
- Bàn phím: 1–5 chọn con, D = đứng, M = di chuyển. Cờ thêm vào link: `?con=gaccam&che=di`, `?quang=0` (tắt quầng sáng sau lưng), `?hud=0` (ẩn nút).

## 1. Xem gì trước
| File | Nội dung |
|---|---|
| **`xem-thu/4-quai-60fps.mp4`** | 25 s, 60 hình/s (mỗi hình = 1 bước game): lần lượt từng con đứng rồi di chuyển cạnh Lam, cuối cùng cả 4 |
| `xem-thu/man-hinh-ca4-dung.jpg`, `-di.jpg` | cả 4 con + Lam trên cảnh chuẩn |
| `art/huong-moi/quai-rig/<con>/xem-thu/` | GIF lớn, GIF **đúng cỡ chơi** (không phóng), ảnh so cỡ cạnh Lam 1× và 2× |
| `art/huong-moi/quai-rig/<con>/kiem/rap-so-chong*.png` | ảnh gốc · ráp lại từ mảnh · so chồng bóng · khác màu – chứng minh mảnh ráp lại trùng ảnh |

## 2. Cỡ (px logic, màn 960×540; Lam mới cao 112)
| Quái | Cao | Rộng | Đề xuất | Mảnh |
|---|---|---|---|---|
| Phu Đèn Lạc | **112** (đỉnh mũ trùm → đất) | 122 kể cả đèn kéo phía sau | ≈ Lam | 7: mũ trùm, áo choàng, tay, cán, đèn, 2 giày |
| Dơi Rễ | **56** khi treo (chân → chóp) · 55 khi bay | sải cánh 71 | ≈ ½ Lam | 4: thân, cánh xa, cánh gần + dáng treo nguyên khối |
| Nấm Thở | **84** | 91 (túi phồng ra ~10 px nữa) | ≈ ¾ Lam | 4: gốc, mũ nấm, túi xẹp, túi phồng |
| Người Gác Câm | **168** (đỉnh mũ → đất) · 172 tới đỉnh trượng | 115 | 1,5× Lam | 7: mũ, thân (chuông bịt), 2 tay, 2 chân, trượng |

Các "hộp thân đề xuất" ghi trong JSON chỉ là gợi ý theo hình, **không phải số gameplay**.

## 3. Đã làm gì
- **Tách nền trắng**: tô loang vùng trắng nối mép ảnh + lỗ trắng kín (lỗ thủng cánh dơi), khử ám trắng ở mép → không quầng trắng.
- **Cắt mảnh theo hình nguyên con**: phần nhìn thấy lấy đúng điểm ảnh của hình nguyên con; phần bị che (dưới mũ, sau tay, đùi dưới váy…)
  được lấp màu của chính mảnh đó (mờ, tối hơn chút) để khi mảnh xoay/dời không lộ lỗ. Mép cắt bên trong có viền mờ vài px nên ráp lại
  **trùng ảnh gốc**: IoU (độ trùng bóng) Phu Đèn **0,999** · Dơi bay **0,9999**, treo **1,000** · Nấm xẹp **0,9999**, phồng **0,990** ·
  Gác Câm **0,9995** (yêu cầu ≥ 0,97). Giày Phu Đèn và trượng Gác Câm lấy từ **mảnh rời trong bảng**, dò tỉ lệ/góc cho khớp hình nguyên con.
- **Rig + clip**: cây nút, điểm neo ở khớp tự nhiên (cổ, vai, chỗ nắm, vòng treo đèn, cổ túi nấm, chân bám trần…). Chuyển động dùng mốc
  khoá + **nội suy Hermite** tuần hoàn và **lò xo tắt dần** cho mảnh phụ (đèn, mũ) – cùng cách của pipeline đã duyệt. Clip đi **phát theo
  quãng đường** (giày/chân chống không trượt). JSON **cùng định dạng** quái mới đang có → vẽ bằng `game/runtime/quai-boss-runtime.js`
  (`QBR.napThem`), không cần sửa runtime.
- **Màu + viền sáng**: ảnh gốc đã trầm nên chỉ tô nhẹ về dải màu hướng mới; giữ nguyên lõi đèn vàng, mắt hổ phách, khe teal của nấm, khe mắt
  cam của Người Gác. **Vệt sáng mép vẽ sẵn** (#F2D69A) chỉ ở mép bóng ngoài (mạnh phía trên–trước, rất mảnh quanh thân) + **quầng sáng mờ sau
  lưng vẽ sẵn 1 lần** (giống trang thử Lam) + quầng ấm quanh đèn Phu Đèn. **Không dùng shadowBlur**, không xử lý ảnh mỗi khung.
- **Số đo** (máy chủ không GPU, chưa phải số iPhone): 22 PNG = 348 KB; bộ nhớ ảnh 4,6 MB (gồm ảnh trắng/tối/vàng runtime tự cache);
  nạp 4 gói 17–51 ms mỗi gói; vẽ cả 4 con + Lam: ~0,1 ms/khung (chỉ thời gian ra lệnh vẽ).

## 4. Cái chưa đẹp / cần biết
- **Phu Đèn Lạc**: áo choàng là 1 mảnh – khi đi chỉ nhún, lắc, nghiêng; vạt áo không bay riêng. Giày chỉ ló ra dưới vạt, giày sau gần như
  khuất. Đèn lắc trễ nhịp rõ, nhưng cán cứng (không cong).
- **Dơi Rễ**: cánh là mảnh cứng xoay quanh vai + co ngắn theo phối cảnh, màng cánh không gập. Lúc đập xuống lộ hẳn cái tai phải nhọn và mép
  rách dưới cánh xa (đúng ảnh gốc nhưng hơi rối ở cỡ lớn). **Treo → bay chưa có động tác chuyển** (đổi tức thì; trang thử cho dơi hạ dần
  xuống đường bay). Mép trên dáng treo là đường cắt ngang chỗ bỏ phiến đá trần – cần cành/mép trần trong cảnh che.
- **Nấm Thở**: xẹp ↔ phồng là **2 ảnh hoà mờ** + co giãn; giữa lúc chuyển (~0,3 s) thấy túi phồng hiện đè lên túi xẹp. Vân thân/mũ của hình
  phồng gen hơi khác hình xẹp nên dùng chung thân/mũ của hình xẹp (lệch màu 9/255 so với ảnh phồng, bóng vẫn trùng 0,99). Khe teal hơi xỉn ở cỡ chơi.
- **Người Gác Câm**: chân là 1 mảnh (không gập gối) nên dáng đi là **lê bước nặng**, nhún thân mạnh khi đặt chân; váy không đung đưa riêng;
  chuông ngực dính liền thân (chưa tách được để "lộ lõi").
- Phần lấp (chỗ bị che) chỉ là màu mờ: thấy được nếu sau này cho mảnh xoay lớn (> 10°) – khi làm đòn đánh cần mảnh vẽ đầy đủ (mục 5).
- Viền sáng vẽ sẵn theo hướng quay trái; khi lật sang phải vệt sáng lật theo (ánh sáng "đổi phía") – chấp nhận được ở cỡ chơi.

## 5. Mảnh cần gen thêm cho đòn đánh (khi có kế hoạch gameplay V2)
Gửi kèm ảnh nguyên con đã duyệt mỗi lần gen; yêu cầu nền trắng, các mảnh tách xa nhau, cùng tỉ lệ.

| Quái | Đòn (theo đề xuất) | Cần thêm | Prompt ngắn |
|---|---|---|---|
| Phu Đèn Lạc | vung đèn theo cung, mất thăng bằng sau cú hụt | tay áo giơ cao nắm cán; đèn **cháy bùng** (báo trước); áo choàng **chúi tới** mất thăng bằng | *Use the attached Lost Lantern Porter exactly. Separate cutout parts, side view facing left: raised sleeve arm gripping the pole overhead; the same lantern burning brightly with a flared amber flame; the robe body leaning far forward off-balance. Same scale, muted colors, restrained dark contours, pure white background, no text.* |
| Dơi Rễ | báo trước rồi lao theo đường cố định, hạ thấp | dáng **lao** (cánh xếp ra sau, thân duỗi); dáng **bung cánh từ tư thế treo**; dáng rơi/chết | *Use the attached Root Bat exactly. Three separate full poses, side view facing left: diving with leaf wings folded back and body stretched forward; upside-down hanging bat half-opening its wings; limp falling bat. Same scale and palette, pure white background, no text.* |
| Nấm Thở | phun một cụm bào tử chậm, giữ khu vực | **cụm bào tử** (3 cỡ) + vài hạt rời; túi **đang thở ra** (miệng túi mở, co lại) | *Matching the attached Breathing Mushroom, separate sprites on white: a slow drifting spore cloud in three sizes, dusty grey-olive with faint teal glow; six loose spore motes; the spore sac mid-exhale, shrunken with its nozzle open. Soft edges, muted colors, no text.* |
| Người Gác Câm | đòn nặng, có Thế, lộ lõi sau số đòn | **2 tay giơ trượng qua đầu**; **chuông ngực tách riêng** 2 bản (bịt vải / vải rách lộ lõi sáng); chân tách **đùi + ống chân** để gập gối khi giậm | *Use the attached Mute Warden exactly. Separate cutout parts, side view facing left: both arms raised overhead holding the bell staff; the chest bell alone wrapped in cloth; the same bell with torn wrappings revealing a glowing amber core; each leg split into thigh and shin-with-boot. Same scale, muted bronze-wood palette, pure white background, no labels.* |

## 6. File
| Đường dẫn | Là gì |
|---|---|
| `game/thu-quai-huong-moi/index.html` | trang xem (một file, nạp cảnh chuẩn + Lam mới + 4 gói quái bằng `QBR.napThem`) |
| `game/thu-quai-huong-moi/cong-cu/quay-video.js` | quay video 60 fps (`python3 -m http.server 8765` ở `tieng-vong-cuoi-cung/`, rồi `node game/thu-quai-huong-moi/cong-cu/quay-video.js`) |
| `art/huong-moi/quai-rig/{phu-den-lac,doi-re,nam-tho,nguoi-gac-cam}/` | `*-rig.json`, `manh/`, `kiem/`, `xem-thu/`, `code/dung.py`, `README.md` |
| `art/huong-moi/quai-rig/code-chung/` | code dùng chung 4 con (tách nền, cắt mảnh, rig, clip, xuất) |
