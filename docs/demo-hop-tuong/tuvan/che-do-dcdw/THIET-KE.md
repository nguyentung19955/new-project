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
- **19:06 người dùng duyệt** 3 bảng (tầng → wave, nguồn thưởng, số Đường Đua); thưởng một lần của Săn Trùm + 6 Thử thách ngắn BỎ HẲN.
- **Bỏ Leo Tháp**: `CDC.bo.thap` (ẩn GAME MODE, `CD.vao` từ chối, bỏ khoá tính năng); HOME PLAY mặc định = **CO-OP** (`HM.chuan`: Solo / Leo Tháp cũ → CO-OP). Bảng quy đổi tầng → wave: `TAI-LIEU-GOC.md` mục 4.
- **Tiến trình kiểu DCDW**: mốc wave CO-OP đạt lần đầu (`chedo-dd.js: MOCWC`) thay thưởng lần đầu mỗi tầng; thưởng tuần = mốc điểm Đường Đua. Rương Trận mỗi trận CO-OP / PVP (theo wave) GIỮ như cũ.
- **Hướng dẫn riêng**: `huongdan.js` vốn đã là 1 trận độc lập (bàn `solo` ẩn, bộ cố định, xong = hạ trùm wave 10) — thêm mục TUTORIAL trong GAME MODE, xong → PLAY CO-OP.
- **DCDW có, mình CHƯA có (đề xuất, chưa làm — chờ người dùng quyết):** cúp PVP + mốc cúp lần đầu + Crystal Crown cuối mùa · túi thắng PVP rơi theo xác suất, giữ tối đa 4, mở mất thời gian · CO-OP giới hạn 3 lượt/ngày, lọt 1 quái là hết trận (mình: 3 tim chung), wave 30 = 1 túi rồi vàng / vật liệu theo trùm · token Raid · Pass mùa 70 bậc · nhiệm vụ nhóm Archfiend Race · bảo hiểm Huyền thoại túi thứ 7 · mốc số trận THẮNG PVP lần đầu (mình chưa có bộ đếm thắng riêng PVP).
- Bot CO-OP bộ khởi đầu (cấp 0, 3 hạt, cân bằng wave biến thể B): `tia,lien,sungluc,bang,set` + đồng đội bộ ngẫu nhiên: wave 42 / 16 / 49; + đồng đội cùng bộ: 10 / 10 / 17. `lien,set,mana,doc,phagiap` + ngẫu nhiên: 39 / 7 / 43; + cùng bộ: 2 / 2 / 2. → trận CO-OP đầu của tài khoản mới phụ thuộc nặng vào bộ ngẫu nhiên của đồng đội máy.

## 6. BỔ SUNG 11/11 19:06–19:08 — "thêm đủ" (đã làm): cúp PVP, túi thắng, bảo hiểm rương, người mới
| Thứ | Số | Ở đâu |
|---|---|---|
| Cúp | thắng +30 · thua −20 · không âm (chưa chỉnh theo chênh lệch: đối thủ là máy, không có cúp) | `CUPC.thang / thua` |
| Mốc cúp lần đầu | 100 / 200 / 300 / 500 / 700 / 1 000 / 1 300 / 1 600 / 2 000 / 2 500 (thưởng: `TAI-LIEU-GOC.md` mục 4, hàng PVP) | `CUPC.moc` |
| Đối thủ máy theo cúp | 0: Trắng / Xanh, cấp 0, mana ×0,6 · 200: tới Tím, cấp ≤ 2, ×0,8 · 500: tới Vàng · 1 000: mọi bậc · 2 000: cấp +1 | `CUPC.doKho` |
| Túi thắng | thắng PVP → Rương Trận rơi 60% (tất định theo hạt trận); thua / trượt: chỉ vàng | `CUPC.pRuong`, `CUP.roi` |
| Bảo hiểm | Rương Vàng (500 ngọc — rương cao nhất có TỈ LỆ ra Huyền thoại; Rương Thần thoại vốn bảo đảm sẵn): 6 liên tiếp không ra → thứ 7 chắc chắn (trước 10) | `KTC.ruong.vang.pityV` |
| Người mới | CO-OP cấp phi công ≤ 5: đồng đội máy bộ cố định Sniper, Gatling, Tesla, Revolver, Laser | `MOIC` |
- **KHÔNG làm (người dùng bác 19:08):** giới hạn 3 lượt co-op có thưởng / ngày → CO-OP không giới hạn; PLAY mặc định vẫn CO-OP, PVP vẫn mở ở cấp phi công 2.
- **Chưa làm (đề xuất):** khe rương hẹn giờ + trần 4 rương chưa mở (game chưa có cơ chế hẹn giờ mở rương — rương mở ngay); mùa cúp + Crystal Crown; cúp theo chênh lệch; token Raid; Pass mùa; nhiệm vụ nhóm.
- Bot người mới (cấp 0): CO-OP với đồng đội cố định: bộ A `tia,lien,sungluc,bang,set` wave 17 / 17 / 17 · bộ B `lien,set,mana,doc,phagiap` 13 / 10 / 13 (trước: 2–49 tuỳ bộ ngẫu nhiên). PVP 0 cúp (6 hạt): A thắng 4/6 · B thắng 2/6 (B tự thua ở wave 2 trong 3/6 trận — do bộ, không do đối thủ).

## 7. ĐỘT KÍCH (RAID) — đã làm 12/11 (`thap/js/chedo-rd.js`, kiểm `tools/thap-kt-raid.js`, đo `tools/thap-bot-tran.js --che rd --bac N`)
- Luật + số: `TAI-LIEU-GOC.md` mục 4. Khác DCDW: dùng lại bàn + đường CO-OP (chưa dựng đường "vùng chung rồi tách 2 nhánh"); trùm đứng ở cổng làn của người chơi.
- **Đã tự quyết:** (1) không dựng đường tách nhánh mới (đụng bố cục + render — rủi ro lớn); (2) bậc = máu trùm tuyệt đối, và sát thương theo % máu tính trên máu trùm chuẩn của chặng (không thì Nemesis một mình hạ bậc 10 trong ~1 phút — đã đo); (3) chiêu trùm thưa hơn trùm wave (40 s đầu không niệm, nghỉ thêm 12 s) vì trùm đứng suốt trận; (4) thắng lại vẫn có thưởng nhỏ; thua mất vé.
- Bot (cấp thẻ như bảng cân bằng, 2 hạt mỗi bậc): Trắng/Xanh +1: bậc 1–3 đều thua (còn 3–68% máu — bộ này ít khi dọn kịp quái để bắn trùm; bậc 1–2 đã hạ máu sau đợt đo) · Tím +4: bậc 3 thắng 1/2, bậc 4 thắng 1/2 (271 s), bậc 5 thua (còn 55–77%) · Vàng +6: bậc 6 thắng 2/2 (302 s), bậc 7 thắng 2/2 (~285 s), bậc 8 thua (còn 5–12%) · Đỏ +8: bậc 8 thắng 2/2, bậc 9 thắng 2/2 (~340 s), bậc 10 thắng 2/2 (~356 s, sát giờ).
- Cần ảnh: icon RAID cho GAME MODE (đang mượn `ua_ic_trum`).

## 8. ĐẨY TRÙM (PUSH) — đã làm 12/11 (`thap/js/chedo-pu.js`, kiểm `tools/thap-kt-push.js`, đo `tools/thap-bot-tran.js --che pu --cup N`)
- Luật + số: `TAI-LIEU-GOC.md` mục 4.
- **Đã tự quyết:** (1) mở ở cấp phi công 4 (sau PVP cấp 2); (2) không có quái thường nên mana cấp theo giây; (3) hoà quãng đường thì so tổng sát thương (2 bộ mạnh đều ghìm trùm ở cổng); (4) không khoá lưu riêng — dùng chung cúp PVP; (5) Rương Trận / XP tính như trận tới wave 10 cố định; (6) trùm có dùng chiêu (cùng trùm cho 2 bên).
- Bot tỉ lệ thắng (4 hạt): Trắng/Xanh +1: 0 cúp 4/4 · 500 cúp 1/4 · 1 000 cúp 0/4 | Tím +4: 4/4 · 3/4 · 0/4 | Vàng +6: 4/4 · 4/4 · 2/4 | Đỏ +8: 4/4 · 4/4 · 3/4.
- Điểm yếu đã biết: 2 bộ mạnh thường cùng ghìm trùm ở ~97% → thắng thua do chênh 0,1% hoặc tổng sát thương; nhãn PUSH trong trận nằm đè dải thẻ đối thủ ở mép trên. Cần ảnh: icon PUSH cho GAME MODE (đang mượn `ua_ic_trum`).

## 9. KHE RƯƠNG kiểu DCDW — đã làm 12/11 (`thap/js/khe.js`, kiểm `tools/thap-kt-khe.js`)

- **Luật:** thắng PVP / PUSH + trúng túi thắng (60%, tất định theo hạt trận như cũ) → **Rương Trận vào 1 trong 4 khe** thay vì mở ngay; vàng trận vẫn phát ngay. Đầy 4 khe → không rơi, màn kết quả báo `CHEST SLOTS FULL`. **Mỗi lúc 1 rương đếm 15 phút** (giờ máy `Date.now`, không dính gameplay trận); xong thì chạm `OPEN`. Mở ngay bằng ngọc: ⌈phút còn lại / 3⌉ ngọc (đủ 15 phút = 5, tối thiểu 1). Thẻ sinh **lúc mở** bằng đúng bộ sinh Rương Trận cũ (wave + bộ bài ghi lúc rơi).
- **Không vào khe (mở ngay như cũ):** rương từ mốc, nhiệm vụ, SHOP, RAID, Đường Đua và **Rương Trận CO-OP**.
- **Lưu:** khoá mới `turret_kt.khe { o: [ {w, d, at} | null ×4 ] }`. Không đổi khoá cũ.
- **Phạm vi sửa:** `khe.js` (mới), 1 đoạn bọc `THEBAI.thuong` + 1 dòng kết quả trong `chedo-dd.js`, CSS, thẻ script — không đụng kinhte.js / thebai.js / sohuu.js.
- **Đã tự quyết:** (1) chỉ loại **Rương Trận** vào khe (đề bài nêu Thường 1 giờ / Vàng 3 giờ nhưng hiện không nguồn thắng trận nào rơi 2 loại đó) — thêm loại sau chỉ cần thêm trường; (2) **CO-OP wave 30 KHÔNG đưa vào khe**: CO-OP đang phát Rương Trận mỗi trận, người dùng đã chốt "CO-OP nhận thưởng không giới hạn như cũ" — đưa vào khe là giảm thưởng CO-OP, cần người dùng quyết; (3) rương đầu hàng **tự bắt đầu đếm** (không cần bấm "start"); rương đã xong chưa mở không chặn rương sau; (4) giá ngọc 1 ngọc / 3 phút.
- **Chưa làm / cần quyết:** đồng bộ `khe` lên Firebase (hiện đi theo cách gộp chung của `turret_kt`, chưa kiểm 2 máy); chống chỉnh giờ máy (không có); ảnh khung khe riêng (đang dùng khung CSS + ảnh Rương Trận sẵn có).
- Ảnh: `anh/b4-khe-home.jpg`, `anh/b4-khe-ngoc.jpg`, `anh/b4-khe-mo.jpg`.

## 10. SỬA LƯỢT 2 (12/11) — Push ép cuối trận, mốc cúp, Raid bậc 2, rương ×N

- **PUSH ép cuối trận:** `K(t)` nhân thêm `2^((t − 110) / 12)` khi t > 110 s (`PUC.tang0`, `PUC.tangDoi`; tới hết giờ ≈ ×57), tất định theo đồng hồ. Bot 4 hạt (bạn % còn lại · thắng · chênh % trung bình so với đối thủ):

| Bộ | 0 cúp | 500 cúp | 1 000 cúp |
|---|---|---|---|
| Trắng/Xanh +1 | 4/4 · chênh 29,3 | 1/4 · 20,8 | 0/4 · 35,9 |
| Tím +4 | 4/4 · 50,5 | 3/4 · 12,8 | 1/4 · 15,7 |
| Vàng +6 | 4/4 · 78,1 | 4/4 · 39,7 | 3/4 · 20,1 |
| Đỏ +8 | 4/4 · 85,6 | 4/4 · 51,5 | 4/4 · 32,4 |

  Vị trí cuối trận của người chơi: Trắng/Xanh 10–53% · Tím 33–77% · Vàng 72–87% · Đỏ 86–93% (97% chỉ còn khi đối thủ chết trước giây 130). 6/48 trận chênh < 5 điểm. Còn lại: bộ khởi đầu ở 500–1 000 cúp chỉ còn ~10% (sát lõi).
- **Nhãn PUSH:** đưa lên trên dải bộ bài đối thủ (`#pu-chip { top: 10px }`).
- **"next prize" của PVP:** KHÔNG phải lỗi luật — tài khoản thử được bơm cúp (cúp tăng không qua trận nên mốc 100–500 chưa phát). Đổi: `CUP.ke()` = mốc CHƯA ĐẠT kế tiếp; mốc đã vượt chưa nhận được **phát bù** khi vào HOME (`CUP.bu()`, mở rương như thường) và ở kết quả trận như cũ.
- **Rương ×N (lỗi thật, đã sửa):** thưởng `{ ruong: 'thuong' | 'vang', n: 2 }` trước chỉ phát 1 rương dù bảng ghi ×2 (mốc cúp 300 / 1 000, CO-OP wave 20 / 40, Raid bậc 3). Nay phát đủ N rương; kết quả hiện `OPEN ×N`.
- **RAID bậc 1–3, bộ Trắng/Xanh +1 (4 hạt):** bậc 1 (5 000) thắng 4/4 trong 35–58 s · bậc 2 nâng 14 000 → **22 000**: thắng 3/4 (124–164 s; 1 trận thua còn 3%) · bậc 3 (45 000) thua 4/4 (còn 9–44%).
- **Icon:** `ic_raid` / `ic_push` hiện đúng ở GAME MODE và bảng RAID (PUSH không có bảng riêng, EVENT không dùng; game không có danh sách tải trước cho icon chế độ — `ic_cup`, `ic_tutorial` cũng tải khi mở). Huy hiệu song sinh thêm quầng = chính ảnh huy hiệu vẽ to 0,66 ô, cộng sáng.

## 11. RÀ HÌNH Ụ KHI KÉO / BAY / GHÉP (12/11) — `tools/thap-kt-hinh-keo.js`

| Ụ / dạng | (1) đứng yên | (2) bản nhấc khi kéo | (3) bóng ô gốc | (4) ụ bay vào đích | (5) bản chụp lúc ghép |
|---|---|---|---|---|---|
| Merge King vàng (`vughepvang_nong`) | đúng | SAI → đã sửa | đúng | SAI → đã sửa | SAI → đã sửa |
| Twin Anvil Tốc (`lorentoc_nong`) | đúng | SAI → đã sửa | đúng | SAI → đã sửa | SAI → đã sửa |
| Twin Anvil ST | đúng | đúng | đúng | đúng | đúng |
| Evolver (trứng theo sao / cháy) | đúng | SAI → đã sửa | đúng | SAI → đã sửa | SAI → đã sửa |
| Blood Reaver dạng 2–4 (đầu + bệ) | đúng | SAI → đã sửa | đúng | SAI → đã sửa | SAI → đã sửa |
| Prism Thief (mặt nạ màu / hợp thể) | đúng | đúng | đúng | SAI → đã sửa | SAI → đã sửa |
| Rồng Máy theo dạng, Werewolf, Hydra (tự vẽ đầu) | đúng | SAI → đã sửa (Hydra vốn đúng) | đúng | SAI → đã sửa | SAI → đã sửa |
| 20 ụ grow 3 dạng (`_nong_s1..3`) | đúng | SAI (về hình gốc) → đã sửa | đúng | SAI → đã sửa | SAI → đã sửa |
| Pháo La Bàn, Eclipse, Lucky Slot, Copycat | đúng | đầu + bệ đúng; lớp vẽ thêm (mũi tên, vòng nạp, quầng) vốn KHÔNG vẽ ở bản nhấc — giữ nguyên | đúng | như (2) | như (2) |

Cả 2D (`?gl=0`) và WebGL (`?gl=1`) cho cùng kết quả. (6) Dải thông tin / thẻ khi chạm dùng ảnh thẻ theo id (không theo dạng) — không đổi; bàn đồng đội / con rối vẽ bằng `veU` thường nên theo trạng thái đồng bộ sẵn có. Ụ đá / băng / xích: lớp phủ không vẽ ở bản nhấc (ụ đang đá / băng không kéo được).
