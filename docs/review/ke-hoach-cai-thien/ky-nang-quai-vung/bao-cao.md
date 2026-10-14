# Báo cáo: kỹ năng riêng 24 quái con (8 vai × 3 vùng)

Ngày 14/10/2026 · nhánh `khoi-tao-du-an` · yêu cầu: `YEU-CAU.md` cùng thư mục.

**Không chạy thử game, không chạy bài kiểm.** Đã soát bằng: `node --check` mọi tệp JS đã sửa, `python3 game/build.py` (đóng gói được, vẫn 461 hình như trước — không thêm ảnh), `python3 tools/ngon-ngu/kiem.py ky-nang-quai game/js/ky_nang_quai.js` (0 chuỗi thiếu), và ảnh soát tĩnh `xem-ky-nang.png` (vẽ bằng Pillow từ đúng bảng số trong code, công cụ `ve_xem.py`). Vì chưa ai chơi thử, cảm giác tay và độ khó thật cần chủ dự án / bot thử lại.

## Đã làm

- **`game/js/ky_nang_quai.js` (mới)**: cách đánh riêng của 24 con, chọn theo mã hình `e.art` (G.MOB_ART). Mỗi con thay trọn phần đi + ra đòn của vai. Bảng số `SO` (JSON thuần) và bảng vai cũ `CU` để so; lời mẹo `MEO` cho từng con.
- **Giữ nguyên**: vai (chia đợt, `cost` ở stage.js), máu, `e.dmg`, tốc độ, giáp phía trước của quái giáp (Bọ Hung, Ốc, Tượng Đá) và việc hồi máu bạn, việc gọi bầy của quái bắn xa (Hoa Bào Tử, Hải Quỳ, Đèn Lồng). Tinh anh, trùm nhỏ, trùm vùng: không đụng.
- **Báo trước**: mọi đòn mới đều có vùng đỏ trên sàn qua hệ `bao_truoc.js` (ảnh `gd-bt-*`): vùng đánh thật, hoặc vùng chỉ để báo (`dmg 0`, cờ `knBao`, không rải chớp nổ) khi đòn do thân quái / vật bay gây. Trước đây đòn thường của quái là `quiet` (không có vùng đỏ). Quái bị choáng / đóng băng thì vùng chưa nổ bị huỷ như vai cũ (`knHuy`); vật đã ném ra thì không (`knGiu`).
- **`js/mobs.js`**: 4 chỗ móc (khởi tạo, bị đánh, `think`, `G.mob.H` chia hàm dùng chung), `cancelZones` chừa vùng `knGiu`, quả bom vẽ được đường nảy (`B.nx/ny/f1`) và ảnh riêng (`B.anh`).
- **`js/combat.js`**: khoá nguồn mất máu theo từng con (`hurtKey` → mã con + tên con); vệt nhớt làm chậm 40% (`P.knCham`).
- **Lời chỉ dẫn**: bảng thua (`stage.js hurtInfo`) hiện tên con + mẹo riêng của con đó; lần đầu gặp một con trong phiên chơi, dòng mẹo hiện 5 giây ở lề trái (không đè thông báo đang có); mục **Các loại quái** ở Cụ Đồ viết lại. Bản tiếng Anh: `tools/ngon-ngu/tu-dien/ky-nang-quai.json` (28 câu) và đã chèn vào cuối `game/js/ngon_ngu_en.js` (không chạy `gop.py` lại cả tệp vì tệp đang có 5 câu nhập tay không nằm trong `tu-dien`, chạy lại sẽ làm mất).
- **Cờ `?kynangcu=1`**: `G.knQuai.on = false` → mọi chỗ móc trả về đường cũ, mục hướng dẫn và bảng thua dùng lời cũ.
- `index.html`: nạp `js/ky_nang_quai.js` ngay sau `js/bao_truoc.js`. `game/dist/*`, `tools/xuong-sprite/*` build lại.
- Đăng nhập Google, lưu mây, `?cloud=0`: không đụng (`cloud*.js`, `firebase-config.js` giữ nguyên, không chép apiKey).

## Từng con

Báo trước = từ lúc vùng đỏ / tư thế báo đầu tiên hiện tới lúc đòn trúng. ST = hệ số × `e.dmg` một lần trúng. Vai cũ: lính xông 0,58 s ×1 · bầy 0,5 s ×1 · khiên 0,6 s ×1 · xạ thủ 0,7 s ×1 (không có vùng đỏ) · nhanh nhẹn 0,45 s ×1 · cảm tử 0,85 s ×1,3 · đặt bom 0,5 + 1,7 s ×1,2 · gai 2,2 s dựng gai, gai ×0,8.

### Rừng già

| Con | Đã làm | Báo trước (cũ) | ST (cũ) | Ảnh |
|---|---|---|---|---|
| Heo Rừng Con · Húc thẳng | cào chân 0,6 s (vạch đỏ dài 150), lao 300/s trượt quá chỗ bé, chạm thân trúng 1 lần; đâm tường choáng 1 s | 0,6 (0,58) | ×1 (×1) | dùng hình quái + `lunge` |
| Bầy Ong Vò Vẽ · Vòng vây chích | bay vòng r 46 trong 0,9 s, rồi 3 nhát bổ thẳng xuyên qua bé, mỗi nhát một vạch đỏ 0,5 s, cách 0,6 s | 0,5 mỗi nhát (0,5) | ×0,34 mỗi nhát, đủ 3 = ×1,02 (×1) | — |
| Bọ Hung · Lăn cầu đất | giáp trước + hồi máu bạn giữ; vạch đỏ 0,6 s rồi cục đất r 8 lăn 80/s tới tường (≤170) | 0,6 (0,6) | ×1 (×1) | **thiếu** `hu-cau-dat-lan` (vẽ tạm) |
| Hoa Phun Bào Tử · Mưa bào tử | gọi bầy giữ; ngắm 0,7 s, 3 hạt bay cong 0,75 s xuống 3 vòng đỏ r 14 (giữa + hai bên lệch 26), đáp thành vũng độc r 12 trong 2 s | 0,7 + 0,75 (0,7) | ×1 mỗi hạt; vũng 0,15/nhịp (×1) | `hu-dan-bao-tu` có sẵn |
| Chồn Bóng · Lẩn bóng | mờ 0,35 s, ẩn 1 s (không đánh trúng được), vòng đỏ ở chỗ sẽ hiện (sau lưng bé 30), hiện ra cào quạt r 34 sau 0,45 s, rồi lùi | 1,35 + 0,45 (0,45) | ×1 (×1) | — |
| Nấm Phồng · Nổ bào tử | phồng 1 s (vòng đỏ r 40) rồi nổ, mây độc r 34 trong 3 s | 1 (0,85) | ×1,3 (×1,3); mây 0,18/nhịp (vũng cũ 0,18/nhịp, 4 s) | `hu-may-doc` có sẵn |
| Sóc Ném Quả Nổ · Ném hạt dẻ | ném 0,5 s; hạt dẻ bay cong 0,5 s tới chỗ bé, nảy thêm 26 (0,4 s), ngòi 0,8 s, nổ r 22 (vũng độc như cũ) | 0,5 + 1,7 (0,5 + 1,7) | ×1,2 (×1,2) | `hu-dan-qua-no` có sẵn |
| Nhím Gai Độc · Cuộn lăn | cuộn 1,4 s (vòng đỏ quanh thân) + vạch đường lăn 0,8 s, lăn 190/s, chạm tường bật lại 1 lần (tổng ≤220); bỏ cầu gai và phản đòn | 2,2 (2,2) | ×0,9 độc (gai ×0,8 / cào ×1) | thân quái xoay; ảnh cuộn riêng chưa có (không bắt buộc) |

### Hang biển

| Con | Đã làm | Báo trước (cũ) | ST (cũ) | Ảnh |
|---|---|---|---|---|
| Cua Lính · Lướt ngang kẹp | căn thẳng hàng ngang (lệch Y < 10, cách 34–120), vạch đỏ ngang, lướt trục X 260/s tới sát bé, kẹp quạt hẹp r 30 xoè 0,8 | 0,6 vạch, quạt kẹp 0,85+ (0,58) | ×1 (×1) | — |
| Bầy Cá Con · Đàn sóng | đường hình sin biên 16 bước 70 qua khỏi bé 90 (vạch đỏ 0,6 s), bơi 150/s; tới đầu kia báo lại 0,5 s rồi bơi về | 0,6 / 0,5 (0,5) | ×1 mỗi lượt (×1) | — |
| Ốc Mượn Hồn · Rút vỏ | bị đánh: rút vỏ 1,5 s miễn sát thương (hồi 5 s), bò ra 3 s để vệt nhớt r 12 (3 s) làm chậm 40%; đòn đập trước giữ, nay có vùng đỏ | 0,6 (0,6) | ×1 (×1) | **thiếu** `hu-vet-nhot`, `hu-vo-oc` (vẽ tạm) |
| Hải Quỳ · Quạt tia nước | gọi bầy giữ; 3 vạch đỏ hình quạt ±0,32 rad dài 130 rồi 3 tia nước 140/s; bé sát (< 44) thì quét xúc tu vòng r 40 | 0,7 (0,7) | ×1 (×1) | `hu-dan-bot` có sẵn |
| Cá Chuồn · Vọt đáp | nhún 0,35 s, vọt 0,85 s (cao 46, không đánh trúng được), vòng đỏ r 26 dưới chân bé, đáp tạo vòng nước | 1,2 (0,45 / lặn 0,75) | ×1 (×1) | `hu-cot-nuoc` có sẵn |
| Cá Nóc · Hút rồi nổ gai | phồng 1 s, hút bé 26/s (không hút khi đang lộn), 8 vạch đỏ toả ra; nổ 8 gai 110/s | 1 (0,85) | ×1,3 mỗi gai (×1,3) | — |
| Sứa Bom · Vũng điện | thả vũng r 26; 3 nhịp vòng đỏ đầy 1,6 · 1,2 · 1,2 s, sáng lên mới giật + tê 0,3 s | 0,5 + 1,6 (0,5 + 1,6) | ×1,2 mỗi nhịp sáng (×1,2, đóng băng 0,65) | **thiếu** `hu-vung-dien` (vẽ tạm) |
| Nhím Biển · Gai xoắn ốc | dựng gai 1,4 s + 2 vạch hướng cánh 0,8 s; 2 cánh × 16 lượt, mỗi lượt xoay 0,28 rad, 85/s; khe giữa hai cánh để luồn | 2,2 (2,2) | ×0,8 (×0,8) | — |

### Lâu đài cổ

| Con | Đã làm | Báo trước (cũ) | ST (cũ) | Ảnh |
|---|---|---|---|---|
| Lính Ma Giáp Gỉ · Chớp chém | vòng đỏ nhỏ sau lưng bé (34) + vạch chém dài 56; mờ dần, hiện ở đó, chém sau 0,15 s | 0,75 (0,58) | ×1 (×1) | — |
| Bầy Dơi Than · Bổ nhào chữ V | hai vạch đỏ từ hai cánh (±22) chụm sau lưng bé 36; cả bầy bổ qua 0,22 s; trúng thì dơi hồi 20% máu | 0,55 (0,5) | ×1 (×1) | — |
| Tượng Đá Cầm Khiên · Đập đất | đứng im (chỉ đi khi xa > 170), giáp trước giữ; bé < 64 thì đập, sóng tròn r 30 → vành 28–52 → 50–74 cách 0,25 s | 0,7 (0,6) | ×1 (×1) | `hu-nut-dat` có sẵn |
| Đèn Lồng Ma · Lửa ma đuổi | gọi bầy giữ; vạch đỏ ngắn 0,7 s rồi quả lửa 62/s đuổi bé 3 s; bé đang chém trúng (gần 26, phía trước) thì tan | 0,7 (0,7) | ×1 (×1) | `hu-dan-lua` có sẵn |
| Mèo Đen Hai Đuôi · Phân thân | mỗi 7 s tạo 2 bóng ảo (5 s) chạy theo bé; bóng tới gần 30 thì vạch đỏ 0,45 s, lao vào rồi tan; con thật vẫn cào (nay có vùng đỏ) rồi lùi; chỉ con thật ăn đòn | 0,45 (0,45) | thật ×1; bóng ×0,35 (×1) | `hu-phan-than` có sẵn |
| Hũ Lửa Sống · Lăn vệt lửa | vạch đường lăn + vòng đỏ r 40 cuối đường; lăn 180/s (không đánh trúng được), vỡ, vệt lửa r 10 mỗi 14 trong 2 s | 0,85 (0,85) | ×1,3 lửa (×1,3); vệt 0,15/nhịp | `hu-vung-quai-lua` có sẵn |
| Tiểu Yêu Ném Pháo · Bùa tam giác | ném 0,5 s; 3 lá bùa bay 0,4 s thành tam giác R 36 quanh bé (3 cạnh vạch đỏ, lòng đỏ đậm dần), 1,3 s sau nổ cả tam giác | 0,5 + 1,7 (0,5 + 1,7) | ×1,2 lửa (×1,2) | **thiếu** `hu-bua-tam-giac` (vẽ tạm) |
| Nhím Than Hồng · Gai trồi | dựng gai 1,4 s; 7 vòng đỏ r 12 thành hàng về phía bé (từ 22, cách 18), trồi lần lượt mỗi 0,12 s | 2,2 → 2,92 (2,2) | ×0,85 (×0,8) | `hu-cot-lua` có sẵn |

## Chênh so với yêu cầu, cần chủ dự án xem

- **Ong Vò Vẽ**: bảng ghi "3 nhát nhỏ" nên mỗi nhát ×0,34 (đủ 3 nhát ×1,02), lệch luật "một lần trúng ≈ vai cũ" theo từng nhát; tính cả lượt thì khớp.
- **Mèo Đen**: bóng gây ×0,35 là đòn phụ thêm vào (bảng ghi "sát thương nhỏ").
- **Nhím Gai Độc** ×0,9: giữa gai cũ ×0,8 và cào cũ ×1 (lệch +12,5% / −10%).
- **Sứa**: tê 0,3 s thay cho đóng băng 0,65 s (nhẹ hơn). **Cá Nóc**: gai không đóng băng như nổ băng cũ (nhẹ hơn).
- Tần suất: hầu hết con có vòng đánh dài hơn vai cũ một chút (thêm thời gian báo / di chuyển), nên nhìn chung dễ hơn hoặc bằng. Chưa đo bằng bot.
- Bảng thua: khoá nguồn mất máu đổi từ tên vai sang mã con (`heoCon`…); `?kynangcu=1` trở lại khoá vai.

## Ảnh còn thiếu

5 ảnh, prompt ở `PROMPT-ANH.md`: `hu-cau-dat-lan`, `hu-vet-nhot`, `hu-vung-dien`, `hu-bua-tam-giac`, `hu-vo-oc`. Đang vẽ tạm bằng code, game chạy được không cần chúng.

## Tệp

`game/js/ky_nang_quai.js` (mới), `game/js/mobs.js`, `game/js/combat.js`, `game/js/stage.js`, `game/js/village.js`, `game/js/ngon_ngu_en.js`, `game/index.html`, `game/dist/*`, `tools/xuong-sprite/thu.html`, `tools/ngon-ngu/tu-dien/ky-nang-quai.json`, thư mục này (`ve_xem.py`, `xem-ky-nang.png`, `PROMPT-ANH.md`, `bao-cao.md`).
