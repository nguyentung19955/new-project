# CHẾ ĐỘ CHƠI THEO DCDW — đối chiếu và thiết kế (phiên điều phối cũ, 11/11)

Người dùng giao (11/11 17:57): rà DCDW có những chế độ nào (nhiều nguồn), rồi làm theo. File này = kết quả rà + đề xuất. CHƯA có code.

## 1. DCDW có gì (nguồn: namu.wiki, thisisgame, gameshot, playforum, xportsnews, gametoc/worktoday, zdnet.co.kr, MobyGames)
| Chế độ DCDW | Luật | Game mình |
|---|---|---|
| Battle (PVP 1v1) | Diệt quái thì đẩy quái sang đối thủ; ai mất 3 tim trước thua; có trùm theo pha; lên Arena theo cúp | CÓ (PVP, đấu máy) |
| Infinite Defense (co-op 2 người) | 2 bàn, đường chữ ㅏ, quái ra từ 2 đầu; trùm mỗi 10 wave, hạ trùm thêm thưởng | CÓ (CO-OP + ONLINE) |
| Raid / Designated Raid (01/2021) | 2 người hạ 1 trùm chung; trùm đứng ở cửa và gọi quái; đường bắt đầu ở vùng chung rồi tách 2 nhánh về mỗi người; vào bằng 20 token (token từ thắng PVP hoặc co-op ≥ wave 30); mở ở cấp tài khoản 6 | CHƯA (Săn Trùm của mình là 1 người, trùm đi trên đường) |
| Race Track (11/2022) | 2 người, 8 phút, chặn càng nhiều quái càng tốt; mỗi con bị diệt làm quái sau trâu dần; thưởng theo ĐIỂM CAO NHẤT, đặt lại thứ Hai hằng tuần; về sau cộng điểm theo clan để xếp hạng clan | CHƯA |
| Push Mode (11/2023, PVP) | Mỗi người bắn 1 trùm để đẩy lùi; hết giờ ai đẩy trùm về gần điểm xuất phát hơn thì thắng | CHƯA |
| Challenge modes (01/2021, theo đợt) | Trận luật riêng: giới hạn mana, bắt buộc có 1 tướng chỉ định trong bộ | GẦN CÓ (Thử thách tuần, Thử thách ngắn) |
| Archfiend Race (06/2021, sự kiện) | Nhóm người chơi cùng làm nhiệm vụ ngẫu nhiên (số lần triệu hồi, vàng, số quái diệt, số trận), thưởng theo mức đạt | CHƯA → thuộc Giai đoạn E (sự kiện xoay vòng) |
| Friendly match + Alliance (clan 50 người: xin/cho thẻ, rủ co-op/raid) | | Phòng bạn bè CÓ; clan CHƯA → Giai đoạn F (cần máy chủ) |
Game mình có thêm mà DCDW không có: Leo Tháp, Săn Trùm, Thử thách ngắn, Vô tận, Bảng xếp hạng.

## 2. Đề xuất làm (thứ tự) — dùng lại khung chedo-c.js / chedo-d.js, TẤT ĐỊNH (rngHat, không Math.random), khoá lưu con mới dưới turret_kt.cd
1. **ĐƯỜNG ĐUA (RACE TRACK)** — khác biệt nhất, rẻ nhất. Bố cục co-op (bạn + đồng đội máy; online sau). Đồng hồ 8:00, không wave: quái ra liên tục theo nhịp; máu quái = nền × (1 + k·số quái đã diệt) → ai dọn nhanh thì quái trâu nhanh (tự cân bằng, không cần bắn lan). Quái lọt: trừ điểm + mất tim (hết 3 tim = dừng sớm, giữ điểm). Điểm = tổng "cân nặng" quái đã diệt. Thưởng: mốc điểm tuyệt đối, 1 lần/tuần, đặt lại thứ Hai (như Vô tận) + thêm 1 bảng trong LB. Khoá: `turret_kt.cd.dd`.
2. **ĐỘT KÍCH (RAID)** — co-op hạ 1 trùm đứng yên ở cửa, trùm gọi quái theo chu kỳ, đường tách 2 nhánh về 2 bàn. 10 bậc máu trùm; thắng = trùm chết trước khi hết giờ/tim. Vé RAID: nhận khi thắng tầng Leo Tháp hoặc co-op ≥ wave 30 (như DCDW), không bán. Thưởng lần đầu mỗi bậc + Tinh thể Đỏ. Khoá: `turret_kt.cd.rd`. Cần bố cục đường mới (ảnh hưởng render) → mức LỚN.
3. **ĐẨY TRÙM (PUSH)** — biến thể PVP đấu máy: mỗi bên 1 trùm đi chậm trên đường, sát thương đẩy lùi (không giết), 3 phút, ai đẩy xa hơn thắng. Hợp nguyên tắc "sát thương đơn mục tiêu có đất dùng". Làm sau khi cân bằng xong (phụ thuộc số ST).
4. Luật "bắt buộc có ụ X trong bộ" → thêm làm 1 kiểu của Thử thách tuần (nhỏ). Archfiend Race → gộp vào Giai đoạn E. Clan → Giai đoạn F.

## 3. Chưa làm vì
Máy phiên cũ còn ~640 MB ổ đĩa (không dựng được bản làm việc + Playwright), và phiên điều phối mới đang sửa cân bằng trên cùng các file (data.js, chedo-c.js). Làm khi: người dùng cho xoá thư mục test cũ trong /tmp của máy này (làm trên nhánh `claude/che-do-dcdw`, phiên mới gộp), HOẶC phiên mới nhận mục 2.1 sau khi xong bảng cân bằng. Trước khi áp số (nhịp ra quái, k, mốc điểm, thưởng) phải gửi bảng cho người dùng.

## 4. ĐÃ LÀM 11/11 (nhánh `claude/che-do-dcdw`) — người dùng chốt 18:05: "bỏ bớt chế độ", "làm y như DCDW"
- **Bỏ khỏi game** (ẩn mọi lối vào; code + bản lưu giữ nguyên): Săn Trùm, Thử thách ngắn (`chedo-c.js: CDC.bo`), Vô tận, Thử thách tuần (`chedo-d.js: CDDC.vt.bat / tw.bat = false`). Thắng tầng 100 = kết thúc bình thường.
- **Đường Đua** (`thap/js/chedo-dd.js`, số ở `DDC` — TẠM): luật + số ghi ở `TAI-LIEU-GOC.md` mục 4. Kiểm: `tools/thap-kt-duong-dua.js`; đo bot: `tools/thap-bot-tran.js --che dd`.
- Khác mục 2.1: quái lọt chỉ mất tim (không trừ điểm); đồng đội máy dùng CÙNG bộ bài của người chơi (điểm không phụ thuộc bộ ngẫu nhiên của máy); máu có thêm thừa số `(1 + (g/270)^4)` để bộ mạnh không dọn hết mọi con; hạt TRẬN vẫn ngẫu nhiên mỗi lượt (chỉ chuỗi quái theo hạt tuần).
- Bot (bộ → điểm · diệt · thời gian, 3 hạt): khởi đầu Trắng cấp 0: 142–344 · 110–226 · 168–287 s | Xanh +2: 440–486 · 273–295 · 327–342 s | Tím +4: 597–622 · 364–374 · 404–410 s | Vàng +6: 622–778 · 375–450 · 399–448 s | Đỏ +8: 889–943 · 503–540 · 480 s (hết giờ, còn 3 tim). Bộ yếu CHƯA trụ đủ 8 phút (hết tim ở phút 3–6).
- **Bảng xếp hạng**: đường mới `turretmerge/lb/dd/{tuần}/{uid}`. Rules hiện tại (`che-do-d/THIET-KE.md` §3.2) có `"$other": { ".validate": false }` dưới `lb` → CHƯA ghi được; tới khi publish thì bảng hiện "NOT CONNECTED · personal best only". ĐỀ XUẤT thêm vào `"lb"` (cạnh `tw`, `vt`, `vtAll`; người dùng tự Publish, phiên này không đổi cấu hình):

```json
"dd": { "$tuan": { ".indexOn": ["k"], "$uid": { ".write": "auth != null && auth.uid === $uid",
    ".validate": "newData.hasChildren(['n','w','t','k','at']) && (!data.exists() || newData.child('k').val() > data.child('k').val())",
    "n":  { ".validate": "newData.isString() && newData.val().length >= 1 && newData.val().length <= 16" },
    "av": { ".validate": "newData.isString() && newData.val().length <= 24" },
    "w":  { ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 999999" },
    "t":  { ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 480" },
    "k":  { ".validate": "newData.isNumber() && newData.val() === newData.parent().child('w').val() * 100000 + 99999 - newData.parent().child('t').val()" },
    "at": { ".validate": "newData.val() === now" },
    "v":  { ".validate": "newData.isNumber()" },
    "$other": { ".validate": false } } } }
```

## 5. BỔ SUNG 11/11 18:41–18:42 — "Leo tháp xoá, làm tutorial 1 bản riêng", "tham khảo thưởng DCDW" (đã làm trên cùng nhánh)
- **Bỏ Leo Tháp**: `CDC.bo.thap` (ẩn GAME MODE, `CD.vao` từ chối, bỏ khoá tính năng); HOME PLAY mặc định = **CO-OP** (`HM.chuan`: Solo / Leo Tháp cũ → CO-OP). Bảng quy đổi tầng → wave: `TAI-LIEU-GOC.md` mục 4.
- **Tiến trình kiểu DCDW**: mốc wave CO-OP đạt lần đầu (`chedo-dd.js: MOCWC`) thay thưởng lần đầu mỗi tầng; thưởng tuần = mốc điểm Đường Đua. Rương Trận mỗi trận CO-OP / PVP (theo wave) GIỮ như cũ.
- **Hướng dẫn riêng**: `huongdan.js` vốn đã là 1 trận độc lập (bàn `solo` ẩn, bộ cố định, xong = hạ trùm wave 10) — thêm mục TUTORIAL trong GAME MODE, xong → PLAY CO-OP.
- **DCDW có, mình CHƯA có (đề xuất, chưa làm — chờ người dùng quyết):** cúp PVP + mốc cúp lần đầu + Crystal Crown cuối mùa · túi thắng PVP rơi theo xác suất, giữ tối đa 4, mở mất thời gian · CO-OP giới hạn 3 lượt/ngày, lọt 1 quái là hết trận (mình: 3 tim chung), wave 30 = 1 túi rồi vàng / vật liệu theo trùm · token Raid · Pass mùa 70 bậc · nhiệm vụ nhóm Archfiend Race · bảo hiểm Huyền thoại túi thứ 7 · mốc số trận THẮNG PVP lần đầu (mình chưa có bộ đếm thắng riêng PVP).
- Bot CO-OP bộ khởi đầu (cấp 0, 3 hạt, cân bằng wave biến thể B): `tia,lien,sungluc,bang,set` + đồng đội bộ ngẫu nhiên: wave 42 / 16 / 49; + đồng đội cùng bộ: 10 / 10 / 17. `lien,set,mana,doc,phagiap` + ngẫu nhiên: 39 / 7 / 43; + cùng bộ: 2 / 2 / 2. → trận CO-OP đầu của tài khoản mới phụ thuộc nặng vào bộ ngẫu nhiên của đồng đội máy.
