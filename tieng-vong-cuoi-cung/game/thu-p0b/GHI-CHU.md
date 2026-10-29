# Trang thử P0-B – hai cách gọi bóng: A ghi chủ động / B Vọng Chiến (28/10/2026 · sinh lại từ Âm Đao PH8 · ĐÓNG BĂNG theo phản hồi 10 · đóng băng lần 2 sau nhận xét iPhone 28/10 · đóng băng lần 3: camera kiểu Dead Cells 28/10 · đóng băng lần 4: chém trên không không treo 29/10 · đóng băng lần 5: cổng dọc 29/10 · đóng băng lần 6: PH14 cổng mở + snapshot runtime)

> **PHIÊN BẢN ĐÓNG BĂNG cho buổi thử iPhone: `p0b-2910-6941b504` – đóng băng lần 6 ngày 29/10/2026 (PH14: cổng mở bỏ khung giữa; mã phiên băm cả runtime dùng chung, danh sách file + sha1 trong `dong-bang/p0b-2910-6941b504.json` – xem mục "PH14" cuối file). Lần 5 `p0b-2910-91572dd6` (cổng dọc) đã thay.**
> (Lần 5: cổng dọc; giữ mọi thứ của lần 4: chém trên không không treo, lần 3: camera kiểu Dead Cells, lần 2: kiếm to, vệt chém mềm, nhảy mềm; Vọng giữ nguyên.)
> In trên màn bắt đầu ("… · p0b-2910-6941b504 · bản ĐÓNG BĂNG 29/10/2026 lần 6 (PH14: cổng mở …; lần 5: cổng dọc; …)") và ở dòng đầu log (`phien`, `dongBang`). Link có cờ thử khác (kể cả `?cam=phong`, `?roi=cu`, `?cong=cu`, `?congmo=cu`) → màn bắt đầu ghi **"BIẾN THỂ (không phải bản đóng băng: …)"**.
> Từ giờ tới hết buổi thử: **không đổi số, không đổi luật, không sinh lại** trang (sinh lại sẽ đổi mã băm). Phiên lần 5 `p0b-2910-91572dd6`, lần 4 `p0b-2910-e8aa09dc`, lần 3 `p0b-2810-d219ca3a`, lần 2 `p0b-2810-8210801c` và lần 1 `p0b-2810-cceea180` đã thay (xem mục "Sửa iPhone 29/10", "Camera kiểu Dead Cells 28/10" và "Sửa theo nhận xét iPhone 28/10").

Viết cho người không rành kỹ thuật. Làm theo `docs/gameplay/PHAN-HOI-7-AM-DAO-BO-P0B.md` (mục 4 + "P0-B"), `KE-HOACH-GAMEPLAY-V2.md` mục 4, 4a, 6, 7,
`PHAN-HOI-1` mục 2 (không chạm đúp), `PHAN-HOI-3` mục 5, **`PHAN-HOI-9-P0B.md`** (mục 1, 2, 3 và "5. GỬI CLAUDE" điểm 1–8)
và **`PHAN-HOI-10-P0C-AMDAO-P0B-DEF.md`** (mục 3, 4 và "6. ĐOẠN GỬI CLAUDE" – phần P0-B).
**Trang riêng**, chưa ghép game chính. **Không sửa** `game/thu-p0a/`, `game/thu-p0c/`, `game/thu-bo-vo-moc/`, `game/thu-phong-b/`, `game/demo.html`, `build-demo.py`, `docs/gameplay/`.
Không publish. Không có bộ kiểm thử tự động – chỉ công cụ quay + ghi số.

> **Mọi số dưới đây đo trong Chromium headless trên máy chủ, do bot bấm.** Chưa ai chơi trên iPhone. **Không kết luận điều khiển / trải nghiệm đạt từ Chromium.**
> Chưa chọn A hay B (PH9). Số bot chỉ là kiểm chức năng / kịch bản.

## Link chơi thử

| Link | Dùng để |
|---|---|
| https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-p0b/index.html | **BẢN ĐÓNG BĂNG – người chơi thử trên iPhone.** Màn bắt đầu có 2 nút **A – Ghi chủ động** / **B – Vọng Chiến** và hướng dẫn riêng từng cách. Log nền LUÔN thu; hộp đòn TẮT |
| …/index.html?nhay=cu | **Biến thể so nhảy (28/10)**: nhảy CŨ – không phải bản đóng băng |
| …/index.html?cam=phong | **Biến thể so camera (28/10)**: camera CŨ khoá theo phòng – không phải bản đóng băng |
| …/index.html?vong=a · …?vong=b | Vào thẳng A / B – vẫn là **bản đóng băng** (cả hai **miễn phí**, bóng xong đứng **nghỉ**) |
| *Các link dưới đây là BIẾN THỂ – không dùng trong lượt so A/B (màn bắt đầu ghi "BIẾN THỂ")* | |
| …/index.html?vong=b2 | **B2 – biến thể, TẮT mặc định**: phát từ lúc bắt đầu nhát chém gần nhất (chỉ thử SAU A và B gốc) |
| …/index.html?vong=b&nac=1 | **Lượt tài nguyên**: B tốn nấc – 2 nấc, hồi 1 nấc / 150 tick mô phỏng |
| …/index.html?vong=b&nac=1&suc=1 | Lượt tài nguyên – **1 nấc** / 150 tick (chuẩn bị thử sau, TẮT mặc định; chỉ đổi sức chứa) |
| …&tan=1 | Biến thể bóng **tan** khi phát xong (TẮT mặc định, áp cho cả A và B; thử riêng, sau khi so cách gọi) |
| …/index.html?vong=a&debug=vong&hitbox=1 | Bảng log Vọng trên màn + lớp hộp đòn (teal = hộp bóng). **Không cần** để đọc log – log nền đã thu sẵn. (`debug` / `hitbox` chỉ để xem – vẫn tính là bản đóng băng) |

Trong game, ⚙ (tạm dừng, không che lúc chơi):
- **"Chép log lượt này (dán vào tin nhắn)"** – **CHÉP** toàn bộ log (tóm tắt + JSON) vào bộ nhớ tạm; ô ở đầu bảng ⚙ ghi **"✓ ĐÃ CHÉP LOG (… KB)"** + tóm tắt → mở tin nhắn, **dán**.
  Nếu Safari từ chối chép: ô ghi **"✗ Không chép tự động được"** + một ô chữ chứa TOÀN BỘ log (đã chọn sẵn) → giữ ngón tay → Chọn tất cả → Copy; tệ nhất thì copy đoạn tóm tắt.
  **Không tải file, không bảng Chia sẻ** (app Claude / artifact không cho tải file – đã bỏ hẳn phần tải). Màn kết thúc cũng có nút **"Chép log lượt này"** (kết quả hiện ngay ở màn đó).
- **"Chơi lại từ đầu"** – đặt lại máu, quái, lịch sử, nấc như nhau (dùng khi bắt đầu mỗi lượt).
- **"Vọng: A/B – đổi"** – lưu log lượt này vào máy (bộ nhớ trình duyệt) rồi tải lại trang với cấu hình kia; lần chép log sau sẽ **kèm lượt trước** (`luotTruoc`).
  Nếu trình duyệt chặn bộ nhớ (vd. duyệt riêng tư) thì không kèm được → **chép log TRƯỚC khi đổi** cho chắc.

Đường đi: phòng A (hình nộm) → **B** (2 Chuông Gỗ) → **C** (quái gác có vỏ) → **D** (2 Bọ Vỏ Mộc). HUD dưới máu ghi cấu hình; B có thanh lịch sử + chữ trạng thái (và ô nấc ở lượt tài nguyên).

## Đất mới 28/10 – KHÔNG áp vào P0-B, phiên đóng băng giữ nguyên `p0b-2810-d219ca3a`

- Kiểm trước khi làm: **P0-B không dùng bộ đất "Cổ tích chuông tàn"**. Trang sinh từ `thu-p0a/am-dao.html` + khối Bọ + `khoi-p0b.js`, không có
  `dia-hinh-huong-moi.js` / khoá đất nào (0 chỗ `DHM`) – đất P0-B vẫn là gạch cũ. Đất mới (góc lõm, biến thể sàn, bệ mỏng) vì vậy **không hiện ở P0-B**.
- Đã chạy `tao-p0b.py`: ra **đúng từng byte** file cũ (mã băm không đổi) → **không tăng nhãn đóng băng** (ghi "đất mới" lên nhãn sẽ sai: trang không đổi gì).
- Muốn P0-B có đất mới thì phải ghép cả bộ đất phòng A–F (như P0-C lấy từ `thu-phong-b/cong-cu/tao-tu-p0a.py`) – đổi hình nền / đất của bản đang đóng băng
  và phòng D của P0-B (trần 8 ô) khác phòng D của bộ đất. **Chờ chủ dự án quyết** (nên làm sau buổi thử iPhone).

## Camera kiểu Dead Cells 28/10 – ĐÓNG BĂNG LẦN 3 (`p0b-2810-d219ca3a`)

Người dùng thấy **"màn hình bị kéo"** khi sang phòng → **camera kiểu Dead Cells**. Sửa ở nguồn Âm Đao (`game/thu-p0a/cong-cu/camera-dead-cells.js` + `tao-am-dao.py`),
sinh lại trang này bằng `cong-cu/tao-p0b.py`. Cách chạy + số đầy đủ: `game/thu-p0a/GHI-CHU-AM-DAO.md` mục **"Camera kiểu Dead Cells 28/10"**.

| Đổi | Nội dung |
|---|---|
| Camera ngang | Đi theo Lam **liên tục A → D** (không khoá theo phòng), chỉ kẹp ở mép thế giới (tường trái A, cuối D) – không lộ ngoài bản đồ. Bám 11 % / bước |
| Nhìn trước | Đứng 24 px → chạy hết tốc 120 px, tăng / giảm mượt; quay đầu đổi dần ≈ 1 s; phải giữ hướng mới 8 bước mới đổi (bấm qua lại không rung) |
| Camera dọc | Vùng chết: nhảy thường không kéo; đứng lên mặt đất lệch > 44 px hoặc rơi > 120 px mới theo; rơi nhanh nhìn xuống 48 px; **giữ lệch +28 cảm ứng** (thế giới chỉ cao hơn màn 4 px → dọc dịch trong 0 → 28 px) |
| Nền | Nền lớp lặp của trang này vốn theo camera → cuộn liên tục, không chỉnh thêm |
| **Giữ nguyên** | Cấu hình Vọng A / B, Bọ, phòng, quái, luật đổi phòng (log đổi phòng, xoá bóng Vọng B khi đổi phòng gameplay, huỷ kỹ năng…), log nền, nút chép log |

- Nhãn **"28/10/2026 lần 3 (camera kiểu Dead Cells; lần 2: kiếm to, vệt chém mềm, nhảy mềm)"** (khối `khoi-p0b.js` chỉ đổi dòng nhãn `VB_DONG_BANG`). Cấu hình khác giữ nguyên.
- Kiểm Chromium: 0 lỗi trang; `?cam=phong` so từng bước với bản lần 2 (900 bước cùng đầu vào: vị trí Lam, camx, camy, trục nền) → **0 khác**;
  bản mới: camera chạy liền mép A (6272) → … không vượt mép thế giới. Video qua các ranh: trên P0-C (`game/thu-p0c/video/camera-dead-cells-2810.mp4`, cùng code camera).
  **Số Vọng mục 3 không quay lại** (Vọng không đổi; camera không đụng logic). Chưa thử iPhone.

## Sửa theo nhận xét iPhone 28/10 – ĐÓNG BĂNG LẦN 2 (`p0b-2810-8210801c`)

Nhận xét iPhone (trên P0-C, chung nguồn Âm Đao): **kiếm quá bé**, **cuối đường chém có vạch kẻ thẳng**, **nhảy hơi cứng, nặng**. Sửa ở nguồn `game/thu-p0a/` rồi sinh lại trang này bằng `cong-cu/tao-p0b.py`.
Chi tiết + số đo + ảnh: `game/thu-p0a/GHI-CHU-AM-DAO.md` mục **"Sửa theo nhận xét iPhone 28/10"**.

| Đổi | Nội dung |
|---|---|
| Kiếm to | Lưỡi Âm Đao ×1,48 (17,8 → 26,3 px). **Chỉ hình** – hộp đòn, sát thương, nhịp **không đổi** |
| Vệt chém | Hết vạch thẳng ở mép hộp (bỏ lớp sáng bị cắt chữ nhật, vệt tan mềm). Vị trí vệt như PH8 |
| Nhảy | Nhảy mềm: lên nhanh hơn, treo đỉnh lâu hơn, rơi mượt; đỉnh 118,4 → 127,8 px. `?nhay=cu` = nhảy cũ |
| **Giữ nguyên** | Cấu hình Vọng A / B (miễn phí, bóng nghỉ, 180 / 90 tick, …), Bọ, phòng, quái, log nền, nút chép log |

- Phiên đóng băng mới: **`p0b-2810-8210801c`**, nhãn **"28/10/2026 lần 2 (kiếm to, vệt chém mềm, nhảy mềm)"** (khối `khoi-p0b.js` chỉ đổi dòng nhãn `VB_DONG_BANG`). Màn bắt đầu ghi "… · p0b-2810-8210801c · bản ĐÓNG BĂNG 28/10/2026 lần 2 (…)".
- Phiên cũ `p0b-2810-cceea180` (đóng băng lần 1) **thay bằng phiên này** – log có `phien` cũ là bản kiếm nhỏ / nhảy cũ.
- `?nhay=cu`, `?quet=1` → trang tự ghi **BIẾN THỂ** (không phải bản đóng băng), như mọi cờ thử khác.
- Đã tải trong Chromium (`?vong=a`, mặc định và `?nhay=cu`): 0 lỗi trang; bậc / tường các phòng như trước. **Số Vọng mục 3 không quay lại** (Vọng không đổi; nhảy cao hơn có thể làm bot nhảy khác vài tick). Chưa thử iPhone.

## Phản hồi 10: sinh lại từ Âm Đao PH8, kiểm lại, đóng băng (28/10/2026)

### 1. Phiên bản – đã sinh từ `am-dao.html` bản PH8
- `index.html` sinh bằng `cong-cu/tao-p0b.py` từ `game/thu-p0a/am-dao.html` **sau commit `b61e392` (Âm Đao sửa theo PH8)** – lần sinh đầu từ PH8 là commit `870df34`
  (phiên `p0b-2810-6477fef2`, chạy lại script ra đúng file đó). Commit này sửa `khoi-p0b.js` (nút chép log, nhãn đóng băng) rồi sinh lại → **phiên mới `p0b-2810-cceea180`**.
  Mã băm gồm `am-dao.html` + `khoi-bo.js` + `khoi-p0b.js` + `tao-p0b.py`; số `2810` = ngày sinh.
- Đọc thẳng trong trang đang chạy (Chromium, link mặc định): hộp nhát 2 **[−10, −100, 90, 48]** · hộp hất **[−9, −140, 87, 60]** (mép trước **78**) ·
  hộp nảy **[−26, −24, 64, 82] = pogo cũ** (`?pogo=moi` không bật) · Âm Đao **cấp 1**, **không Dư Âm**, `?giu` tắt (0). Log ván ghi "hộp nảy [-26,-24,64,82] (mặc định)".
- Phiên bản hiện ở **màn bắt đầu** và trong log (`phien`, `cfg` đuôi `…|cap1|p0b-2810-cceea180`, `dongBang`).
- ~~"chưa nhận PH8, phiên p0b-2810-e58986fc"~~ – đã thay. Phiên `e58986fc` là bản trước PH8 (số cũ ở `video/truoc-ph8/`).

### 2. Kiểm lại trên bản sinh mới (Chromium headless, bot – `video/kiem-code.json`, video ngắn `video/kiem-lai-PH8-A.mp4` · `-B.mp4`)
Mỗi ca một trang mới: hình nộm phòng A đặt lại, Lam cách nộm 60 px, mặt phải. A: bấm V ghi → đứng 11 tick → chém → dừng ghi đúng lúc cần. B: đứng 30 tick → chém → bấm V.
(Vị trí mẫu khác số cũ 1 tick vì script kiểm lần này bấm khác – **không** phải do PH8: hộp vẫn ra **6 tick sau lúc chém** như trước.)

| Ca | A (số mới) | B (số mới) | Số cũ (trước PH8, `truoc-ph8/kiem-code.json`) |
|---|---|---|---|
| Đoạn hợp lệ ngắn nhất | ghi 3 → **không phát**, "ghi quá ngắn" 1 · ghi 4 → phát đủ 4 mẫu rồi nghỉ | vòng đệm 3 → **không phát**, thiếu lịch sử 1 · 4 → phát đủ 4 | như vậy |
| **Mẫu cuối** – đòn chỉ ở mẫu cuối | đoạn 19, hộp chỉ ở mẫu **18** → hộp bóng bật **1 tick**, trúng **1**, "trúng ở mẫu cuối" | đoạn 41, hộp chỉ ở mẫu **40** → **1 tick**, trúng **1**, "trúng ở mẫu cuối" | A: 18 / mẫu 17 · B: 37 / mẫu 36 – 1 tick, trúng 1 |
| Hết đoạn khi có hitstop | trúng mẫu cuối gây khựng **2 bước**; bóng chỉ kết thúc **sau** khựng, không thêm tick có hộp | như A (2 bước) | khựng 4 bước, cùng kết quả |
| **Chống hit lặp** – nhiều mẫu active cùng mã | 8 mẫu hộp (18–25), **1 mã** → hộp bóng bật **8 tick**, trúng **1** lần | 8 mẫu (40–47), 1 mã → 8 tick, trúng **1** | 8 tick, trúng 1 |
| **Cộng hưởng ở mẫu cuối** (Lam chém để trúng nộm ≤ 12 tick trước) | Cộng hưởng **1**, "Cộng hưởng ở tick mẫu cuối", bóng trúng **1** (khựng 8 bước, không trúng lặp) | như A | Cộng hưởng 1 ở mẫu cuối |
| Bóng sau khi phát | `idle`, lật trái theo hướng cuối, không hộp; 30 tick sau vẫn thế | như A | như vậy |
| `?tan=1` | bóng mất sau 30 tick | như A | như vậy |
| B: lịch sử / nút | – | 3 tick "chưa" (nút `vb-chua`) · 4 "sẵn sàng" (`vb-motphan`, viền đứt) · 90 "đầy" | như vậy |
| B: đổi phòng | – | có bóng → sang phòng khác: bóng xoá, lần phát xếp "bị huỷ khi đổi phòng", vòng đệm **0** | như vậy |
| Lỗi trang | **0** | **0** | 0 |

**Trận bot + tình huống ngắn chạy lại trên bản mới** (`quay-p0b.py luot1 luot2 tinh-huong --khong-video` → `video/ket-qua.json`, log `video/luot*-log-*.txt`):
**mọi số trùng khít số cũ** (so từng trường của `ket-qua.json` mới với `truoc-ph8/ket-qua.json`: chỉ khác chuỗi phiên bản; log trận chỉ khác dòng phiên bản / dòng "hộp nảy … (mặc định)").
Lý do: PH8 chỉ thu **phía sau** nhát 2 (−36 → −10) và **mép trước của hất** (88 → 78); bot chạm Chém không kèm hướng (không ra hất) và quái luôn ở phía trước Lam; pogo giữ hộp cũ.
Vì vậy bảng mục 3 giữ nguyên số – nay đã xác nhận trên bản PH8. Hai video dài cũ (bản trước PH8, cùng đường đi) chuyển sang `video/truoc-ph8/` có đuôi `-truoc-PH8`; không quay lại video dài.

### 3. Đường lấy log trên iPhone: CHÉP vào bộ nhớ tạm
- Nút trong ⚙ = **"Chép log lượt này (dán vào tin nhắn)"**; màn kết thúc = **"Chép log lượt này"**. Bấm → chép **tóm tắt + toàn bộ JSON** (có phiên bản, cấu hình, máy, từng lần phát, sự kiện, log).
- Thứ tự: `navigator.clipboard.writeText` (ngay trong lần chạm) → nếu bị từ chối thì `execCommand('copy')` → nếu vẫn không được: hiện ô chữ chứa **toàn bộ** log, đã chọn sẵn, để giữ ngón tay → Copy; kèm tóm tắt chọn-copy được.
  Kết quả chép ghi vào log ("chép log: ĐƯỢC (clipboard)" / "BỊ TỪ CHỐI").
- **Đã bỏ phần tải file / bảng Chia sẻ** (app Claude – artifact – không cho tải; bảng Chia sẻ còn đè chữ "đã chép"). Không thêm hệ thống log mới.
- Kiểm Chromium: cho quyền chép → bộ nhớ tạm có gói `tieng-vong-p0b-log` đúng phiên `p0b-2810-cceea180`, `dongBang.dung = true`; chặn chép → hiện ô chữ ~3,5 KB đã chọn hết 0…cuối, có JSON. **Chưa kiểm trên Safari thật** (xem checklist).

### 4. Cấu hình ĐÓNG BĂNG cho buổi thử – phiên `p0b-2810-cceea180`, ngày 28/10/2026
| Mục | Mặc định (đóng băng) | Biến thể – TẮT, chỉ bật bằng cờ, không ghép vào lượt so A/B |
|---|---|---|
| Cách gọi bóng | **A / B** chọn ở màn bắt đầu (hoặc `?vong=a` / `?vong=b`) | B2 (`?vong=b2`) |
| Tài nguyên | **miễn phí** (cả A và B) | `?nac=1` (2 nấc / 150), `&suc=1` (1 nấc) |
| Âm Đao | **cấp 1, không Dư Âm** (`?cap=` bị bỏ qua), hộp PH8 | `?giu=16` (không có tác dụng ở cấp 1) |
| Pogo | **hộp cũ** [−26, −24, 64, 82] | `?pogo=moi` |
| Bóng phát xong | **nghỉ** (mờ 0,24, không hộp) | `?tan=1` |
| Quái | Chuông Gỗ 40 ×2, quái gác [30, vỏ 60], Bọ [40, mai 40] ×2 | `?cg=36` |

Trang tự nhận: chỉ có `vong=a|b` (+ `debug`, `hitbox` để xem) → "bản ĐÓNG BĂNG 28/10/2026"; mọi cờ khác → "BIẾN THỂ (…)" trên màn bắt đầu và trong log (`dongBang.coThu`).
Chưa chọn B vì ít lần bấm hơn, chưa loại B vì bot phát chậm (PH10 mục 4).

### 5. Checklist kiểm nhanh trên Safari THẬT (iPhone, xoay ngang) – người dùng làm trước buổi thử
Mở link mặc định. Mỗi dòng: làm → nhìn đúng điều ghi → đánh dấu.
1. ☐ **Phiên bản**: màn bắt đầu ghi `p0b-2810-8210801c · bản ĐÓNG BĂNG 28/10/2026 lần 2 (…)` (đóng băng lần 2 – trước là `cceea180`) (không có chữ "BIẾN THỂ"). Có 2 nút A / B.
2. ☐ **Đa chạm**: chọn A. Giữ nút di chuyển (phải) + chạm **Chém** + chạm **Lướt** cùng lúc → Lam vừa chạy vừa chém / lướt, không nút nào "kẹt".
   Giữ di chuyển + chạm **V** (bắt đầu ghi) + chém + chạm V lần nữa → bóng phát. Bấm V cùng lúc chém / lướt vài lần: có lần nào V không ăn, hoặc chạm nhầm nút bên cạnh không. Ghi lại.
3. ☐ **Mất focus / chuyển app**: đang chơi (có bóng đang phát) → vuốt về màn chính / mở app khác 5 giây → quay lại. Game chạy tiếp **từ đúng chỗ cũ** (trình duyệt ngừng
   khung hình khi ẩn; trang không chạy bù) – Lam không mất máu trong lúc vắng, nút không kẹt (không tự chạy / tự chém khi quay lại). Thử thêm: kéo Trung tâm điều khiển xuống rồi đóng; khoá màn rồi mở.
   Log sẽ có "mất focus" / "trang bị ẩn" – xem ở bước 5.
4. ☐ **Đổi A/B**: ⚙ → "Vọng: A – đổi A↔B" → trang tải lại, màn bắt đầu ghi **cấu hình B** và vẫn "bản ĐÓNG BĂNG". Vào chơi: máu, quái như lúc đầu; HUD ghi "B · Vọng Chiến".
5. ☐ **Chép log rồi dán**: ⚙ → "Chép log lượt này" → thấy **"✓ ĐÃ CHÉP LOG (… KB)"**. Mở Ghi chú / tin nhắn → dán: phải ra đoạn bắt đầu bằng "P0-B · cấu hình B|…" rồi một khối JSON dài
   có `"luotTruoc"` (lượt A trước đó). Nếu thấy "✗ Không chép tự động được": giữ ngón tay trong ô chữ → Chọn tất cả → Copy → dán thử; báo lại trường hợp này.
6. ☐ (nếu dùng app Claude) mở trang trong app, chép log, dán vào ô chat – có dán được không, có bị cắt không.
Báo kết quả từng dòng (đạt / không + mô tả). **Chưa dòng nào được đánh dấu đạt** – Chromium không thay được Safari thật.

## Sửa theo phản hồi 9

### Đã làm (điểm 1–8 của "GỬI CLAUDE")

1. **Replay mẫu cuối (cả A và B)** – `updateEcho` dùng chung cho A và B: trước đây bước lấy mẫu cuối đặt luôn `done`, nên hộp đòn của mẫu cuối không bao giờ bật
   (đúng lỗi JSON A lần phát id=4: n=7, hop0=6, tHop=-1). Giờ: bước lấy mẫu cuối xử lý **đủ** hình + hộp + hit của tick đó (thu hộp → gom trúng → Cộng hưởng),
   **bước sau** mới kết thúc phát → tư thế nghỉ. Không có tick nào được phát hai lần. Sửa bằng `tao-p0b.py` trên bản sinh (không sửa `thu-p0a/`).
2. **Vòng đệm B**: giữ xoá bóng + vòng đệm khi đổi **phòng gameplay**. Gọi được khi đoạn **> 3 tick** – không đợi đầy. Ba trạng thái lịch sử:
   ≤ 3 tick **chưa sẵn sàng** (nút Vọng mờ) · > 3 và < 90 **sẵn sàng, lịch sử chưa đầy** (nút sáng bình thường + viền gạch đứt, HUD "sẵn sàng") · ≥ 90 **đầy** ("sẵn sàng · đầy").
   Trạng thái **nấc tách riêng**: hết nấc = nút xám viền cam + số "0" ở góc, ô nấc riêng trên HUD (không dùng độ mờ của lịch sử).
3. **B2** (`?vong=b2`, tắt mặc định): trong vòng đệm tìm lần bắt đầu đòn gần nhất **đã có hộp** (đòn đang chuẩn bị chưa ra hộp → bỏ qua, lấy đòn trước);
   phát từ tick bắt đầu đòn (gồm chuẩn bị) tới cuối bản ghi. Không bắt đầu giữa tick active (luôn từ đầu đòn); giữ mã đòn gốc (`maGoc` → mã replay, chống trúng lặp như A/B).
   Đầu đòn nằm ngoài vòng đệm → bỏ đòn đó. Không có đòn hợp lệ → toast **"Chưa có đòn để vọng"**, không phát, **không tốn nấc, không xoá bóng cũ**.
   Toạ độ gốc, không kéo tới Lam / quái, không chọn đòn từng trúng. Log đo riêng: số nhát, sát thương, Cộng hưởng, nhịp gọi, số tick bỏ đầu vòng đệm.
4. **Bóng phát xong (A và B)**: tư thế **nghỉ** (khung thở đầu) theo **hướng cuối**, không còn hộp đòn nào, độ mờ 0,24 cố định (trước: 0,36–0,50 nhấp nháy),
   thanh Vọng không nhấp nháy. `?tan=1`: mờ dần 30 tick rồi mất (cả A và B). Game chính chưa đổi gì (câu đố giữ công tắc không đụng tới).
5. **Tài nguyên**: lượt chính miễn phí; `?nac=1` = 2 nấc / 150 tick; `?nac=1&suc=1` = 1 nấc / 150 tick (tắt mặc định). Thiếu nấc / thiếu lịch sử / B2 chưa có đòn:
   không trừ, không xoá bóng cũ. Nấc hồi theo **tick mô phỏng** (bước sau khựng) – tạm dừng / tab ẩn không chạy bước nên không hồi.
   Lượt 2 so **B miễn phí / B 2 nấc / B 1 nấc**; A chỉ tham chiếu.
6. **Đo**: độ trễ có **mẫu số** (thành công / tổng), tách **tick mô phỏng**, **bước có khựng** (mốc = trước bước bấm, nên bước ≥ tick; chênh = bước khựng) và **ms thật**
   (ms thật chỉ có khi người chơi – công cụ tự bước không có đồng hồ thật). Chỉ số đổi tên thành **"không gây hit / ảnh hưởng chiến đấu"**, tách:
   *không có đòn* · *có đòn nhưng hụt* · *mục tiêu đã chết* (hộp bóng chạm xác, hoặc không còn địch sống trong phòng lúc bấm / lúc hộp bật) ·
   *bị huỷ khi đổi phòng* · *bị huỷ khi thay bóng* · *huỷ khác* (chết / chơi lại). Thêm đếm: mẫu cuối có hộp, trúng ở mẫu cuối, Cộng hưởng ở mẫu cuối.
   Thêm **4 tình huống ngắn** trạng thái đầu giống nhau (mục 3c).
7. **Log nền** từ đầu (không cần `?debug`): mọi lần bấm V, ghi / ghi quá ngắn / thiếu lịch sử / B2 chưa có đòn / hết nấc, mỗi lần phát (đoạn, nhát, trễ, trúng, máu, Thế, Cộng hưởng,
   lý do không gây hit), thay bóng, đổi phòng, chết, chơi lại, **tạm dừng / mất focus / tab ẩn / xoay màn**. Gói JSON có: phiên bản game (`p0b-ddmm-mãbăm`), cấu hình,
   máy (UA, iOS, Safari?, cỡ màn, dpr, hướng), giờ bắt đầu, tóm tắt, số tổng, từng lần phát, sự kiện, log Vọng + log trúng P0. Màn bắt đầu: A **"bấm Vọng để GHI, đánh,
   bấm Vọng lần nữa để PHÁT"**; B **"bấm Vọng một lần để gọi lại 1,5 giây vừa qua"**. Gợi ý trên màn cũng theo từng cấu hình.
8. **Lỗi `sx` của Bọ**: đã sửa tại nguồn `thu-bo-vo-moc/cong-cu/khoi-bo.js` (commit `0836a73`, phiên khác). `tao-p0b.py` **bỏ bản vá trên bản chép**, thêm kiểm: nếu nguồn còn lỗi thì
   script dừng. Kiểm: đặt Bọ vào trạng thái sụp choáng với `?hitbox=1&debug=vong` → 0 lỗi trang; trận quay debug (cả A, B) → 0 lỗi trang.

**Âm Đao PH8**: ĐÃ NHẬN – sinh lại từ `am-dao.html` bản PH8 và kiểm lại (xem "Phản hồi 10" ở trên). Phiên đóng băng `p0b-2810-cceea180`.

### Kiểm bằng code – SỐ CŨ, bản trước PH8 (phiên `e58986fc`, nay ở `video/truoc-ph8/kiem-code.json`; số mới trên bản PH8: mục "Phản hồi 10" ở trên)

| Ca (PH9 mục 1.3) | A | B |
|---|---|---|
| Đoạn hợp lệ ngắn nhất | ghi 3 tick → không phát ("ghi quá ngắn"); ghi 4 → phát đủ 4 mẫu rồi nghỉ | vòng đệm 3 tick → không phát; 4 tick → phát đủ 4 mẫu |
| Đòn **chỉ ở mẫu cuối** (hộp ở mẫu 17/18 · 36/37) | hộp bóng bật **1 tick**, trúng **1**, "trúng ở mẫu cuối" | như A (trước sửa: hộp không bật, 0 trúng) |
| Nhiều mẫu active cùng mã (8 mẫu hộp, 1 mã) | hộp bóng bật **8 tick** = 8 mẫu, trúng **1** lần | như A |
| Mẫu cuối trùng Cộng hưởng (Lam chém trước ≤ 12 tick) | Cộng hưởng **1**, ghi "Cộng hưởng ở tick mẫu cuối" | như A |
| Hết đoạn khi có hitstop | hit mẫu cuối gây khựng 4 bước; bóng chỉ kết thúc **sau** khựng, không thêm tick có hộp | như A |
| Bóng sau khi phát | tư thế `idle`, lật theo hướng cuối (Lam đi trái → lật), không hộp; 30 tick sau vẫn thế | như A |
| `?tan=1` | bóng mất sau 30 tick | như A |

| Ca khác | Kết quả |
|---|---|
| B: trạng thái lịch sử / nút | 3 tick: "chưa sẵn sàng", nút mờ · 4 tick: "sẵn sàng, chưa đầy", viền đứt · 90: "đầy" |
| B: đổi phòng | có bóng → sang phòng: không còn bóng, vòng đệm **0** |
| B `?nac=1` | nấc 2 → 1 → 0; bấm khi 0 nấc: không phát, **bóng cũ còn nguyên**; 300 bước tạm dừng: **không hồi**; 150 tick chơi: +1 nấc |
| B `?nac=1&suc=1` | sức chứa 1; lần 2 → "hết nấc" |
| B2: chưa chém | "chưa có đòn để vọng", không phát; nếu đang có bóng → **bóng cũ còn nguyên** |
| B2: có 1 nhát trong vòng | phát từ tick đầu đòn (mẫu 0: `atkN=1, atkT=1`), bỏ 30 tick đầu vòng đệm, trễ tới hộp **7 tick** (= chuẩn bị) |
| B2: nhát mới đang chuẩn bị (chưa ra hộp) | bỏ qua, phát nhát trước |
| B2: đầu đòn trôi khỏi vòng đệm | "đòn gần nhất bắt đầu NGOÀI vòng đệm – bỏ", không phát |
| Link mặc định | chưa chọn → 2 nút A/B + hướng dẫn hai cách; log nền đã thu; debug / hộp đòn tắt; nút Xuất log (nay: **Chép log**) + Chơi lại có trong ⚙ |
| Lỗi trang | **0** ở mọi trang kiểm / quay; "lần bấm Chém thiếu kết cục" **0** |

### Cần thử iPhone (chưa làm – KHÔNG đánh dấu đạt)
- Người chơi có hiểu A "ghi – đánh – phát" và B "gọi lại 1,5 s vừa qua" chỉ từ màn bắt đầu không.
- Nút Vọng B: mờ / viền đứt / đầy có đọc được trên nút ảnh không; "hết nấc" (xám + số 0) có lẫn với "chưa sẵn sàng" không.
- Bóng nghỉ mờ 0,24 có còn bị tưởng là đang đánh không; có cần `?tan=1` không (thử riêng, sau).
- Độ trễ thật (ms), cảm ứng, bấm Vọng cùng lúc chém / lướt có trượt nút không, hiệu năng Safari – chỉ đo được trên máy (log có ms thật + sự kiện tạm dừng / focus).
- Nút **Chép log** trên Safari iOS: chép được không, dán ra đủ JSON không; đổi cấu hình qua ⚙ có giữ log lượt trước không (checklist mục "Phản hồi 10" → 5).

## Hướng dẫn buổi thử (theo PH9 mục 3)

**Trước buổi**: ĐÃ đóng băng – phiên **`p0b-2810-8210801c`** (lần 2, 28/10/2026, sau nhận xét iPhone: kiếm to, vệt chém, nhảy; lần 1 `cceea180` sinh từ Âm Đao PH8). Kiểm màn bắt đầu ghi đúng phiên + "bản ĐÓNG BĂNG"; làm checklist Safari thật (mục "Phản hồi 10" → 5).
Cấp 1, không Dư Âm, pogo cũ, không đổi quái / tầm / VFX giữa A và B; **không đổi số giữa buổi, không ghép biến thể vào cùng lượt**. Ghi máy, iOS, trình duyệt, hướng màn (log tự ghi), **không** bật `?battu`.

**Thứ tự**: mỗi người chơi **cả A và B**, thời gian tương đương. Chia **A→B** và **B→A** (4 người: 2 người mỗi thứ tự; 3 người: dùng để phát hiện vấn đề, không làm thống kê).
1. Tập di chuyển / đánh / né ở phòng A (hình nộm) vài phút.
2. Lượt 1: cấu hình đầu (link mặc định, chọn A hoặc B trên màn bắt đầu) – **miễn phí**, B+C rồi phòng Bọ, vài phút. Cuối lượt: ⚙ → **Chép log lượt này** → dán vào tin nhắn / Ghi chú.
3. Lượt 2: ⚙ → "Vọng: đổi" (log lượt 1 được lưu, vào lại từ đầu – **máu, quái, lịch sử, nấc như nhau**). Chơi tương đương, chép log (gói này kèm luôn lượt 1 – `luotTruoc`).
4. Chỉ sau đó, nếu thấy cần: thử **B2** (`?vong=b2`). Sau nữa mới tới lượt tài nguyên (`?vong=b` vs `?vong=b&nac=1`). Không bắt một người thử hết mọi biến thể.
5. Nếu được: một lượt ngắn **không gọi bóng** để hỏi bóng có làm trận hay hơn không.
Câu dẫn chung: "chém, lướt, nút Vọng gọi bóng" + đúng câu hướng dẫn của cấu hình đó trên màn bắt đầu. **Hỏi người chơi trước khi giải thích số.**

**Bốn câu hỏi ngắn** (sau mỗi cấu hình, câu 4 cuối buổi):
1) Bạn định làm gì lúc bấm V, bóng có làm đúng điều bạn nghĩ không?
2) Có phải chờ quá lâu không? Chỉ đúng khoảnh khắc đó.
3) Bạn có chủ động phối hợp được một Cộng hưởng, hay chỉ thấy nó tự xảy ra?
4) Bạn muốn dùng kiểu nào tiếp, và vì sao?

**Số đo** (có sẵn trong log đã chép): số lần bấm; đoạn huỷ / ghi quá ngắn / thiếu lịch sử; độ trễ bấm → hộp và → hit (thành công / tổng; tick mô phỏng, bước có khựng, ms thật);
thay bóng; hết nấc; phát khi không có đòn; gọi sau khi mục tiêu đã chết; có đòn nhưng hụt; Cộng hưởng có bóng; tạm dừng / mất focus / tab ẩn.
Ghi tay thêm: trúng trước / sau lúc người chơi muốn, trượt nút khi bấm cùng lúc, lỗi cảm ứng, hiệu năng (báo riêng).

## 1. Đã làm (từ đầu P0-B)

- **Trang `index.html`** sinh bằng `cong-cu/tao-p0b.py` từ `game/thu-p0a/am-dao.html` + khối Bọ (`game/thu-bo-vo-moc/cong-cu/khoi-bo.js`, đọc rồi chỉnh trên **bản chép**: phòng thử → phòng D)
  + khối Vọng `cong-cu/khoi-p0b.js`. Mỗi chỗ thay phải khớp đúng số lần, lệch thì script dừng. Ảnh Âm Đao lấy thẳng từ `../thu-p0a/am-dao/`.
- **Âm Đao khoá cấp 1** (không Dư Âm, nút đổi cấp ẩn, `?cap=` bị bỏ qua). Nhịp P0-A (su 7/7/9, hàng chờ 1 nhát) giữ nguyên.
- **Nút V có một nghĩa theo cấu hình đã chọn** – không chạm đúp. A = code ghi của trang (bắt đầu ghi / dừng → phát, tối đa 180 tick, ≤ 3 tick không phát).
  B = vòng đệm 90 tick luôn ghi trạng thái Lam bằng **đúng `recordFrame` của trang** (dừng trong hitstop), bấm V → chép sâu sang bảng phát của bóng (cùng định dạng, mã đòn bền, công thức).
  Không cắt phần đứng yên đầu đoạn (PH3 mục 5) – chỉ đo.
- **Chung A và B**: 1 bóng; gọi bóng mới thì bóng cũ mất; đổi phòng xoá bóng (B xoá luôn vòng đệm, A huỷ đoạn đang ghi); chết xoá bóng.
- **Phòng D** (30 ô, trần 8 ô): 2 Bọ Vỏ Mộc thang ×10 (máu 40, Thế mai 40), dùng `CFG` chung của P0-A (bóng 0,25 / 0,5; Cộng hưởng +10); đòn Lam và bóng vào Bọ qua mã đòn bền.

## 2. Thông số (giống hệt ở A, B, B2)

| Số | A | B / B2 |
|---|---|---|
| Âm Đao | cấp 1, không Dư Âm (nhát thường [10 máu, 10 Thế], nhát 3 [10, 30]) | giống |
| `BONG_MAU` / `BONG_THE` · `CH_MAU` / `CH_THE` | 0,25 / 0,5 · 1 / 0,5 | giống |
| Quái | Chuông Gỗ 40 ×2, quái gác [30, vỏ 60], Bọ [40, mai 40] ×2 | giống |
| Gọi bóng | bấm V ghi, bấm V phát; ghi tối đa 180 tick | bấm V một lần; vòng đệm 90 tick (B2: từ đầu nhát gần nhất trong vòng) |
| Bóng phát xong | nghỉ, không hộp, mờ (`?tan=1`: tan) | giống |
| Tài nguyên | miễn phí | lượt chính miễn phí · `?nac=1` 2 nấc / 150 · `&suc=1` 1 nấc / 150 |

Sửa số: khối `VB_SO` đầu `cong-cu/khoi-p0b.js` rồi chạy lại `python3 game/thu-p0b/cong-cu/tao-p0b.py`.

## 3. Kết quả – KIỂM BẰNG CODE (bot, mỗi hình video = 1 bước logic) – SAU SỬA PH9 · ĐÃ CHẠY LẠI TRÊN BẢN PH8: số trùng khít

Số mục 3a–3c đo lại trên bản PH8 (`video/ket-qua.json`, phiên `p0b-2810-cceea180`) – **giống hệt** số trước PH8 (`video/truoc-ph8/ket-qua.json`), xem "Phản hồi 10" → 2.
Kịch bản trận (video cũ `video/truoc-ph8/1-sach-A-vs-B-truoc-PH8.mp4`, `ket-qua.json → luot1`) **không đổi** so với lần trước: trạng thái đầu giống nhau, đặt một lần; bot đi tới mục tiêu gần nhất,
trong 62 px chém mỗi 14 tick, **gọi sau mỗi nhóm 3 nhát** (A bấm ghi ở nhát đầu nhóm). B2 chạy cùng bot, cùng cách bấm như B. **Nhịp gọi này thuận cho A** (PH9 2B) –
xem thêm tình huống ngắn ở 3c. Bước = 1/60 s logic (kể cả khựng); tick = tick mô phỏng.

### 3a. Lượt chính (cả hai MIỄN PHÍ)

| | **A – Ghi chủ động** | **B – Vọng Chiến** | B2 (biến thể, tham khảo) |
|---|---|---|---|
| Xong trận (bước bot) | 1555 | 1581 | 1529 |
| Chết lúc: Chuông Gỗ #1 / #2 · gác · Bọ #1 / #2 | 172 / 418 · 744 · 1237 / 1555 | 167 / 419 · 784 · 1261 / 1581 | 166 / 441 · 772 · 1236 / 1529 |
| Lam bị trúng | 2 | 4 | 3 |
| Bấm V / lần phát | 16 (9 ghi + 7 dừng) / 7 | 6 / 6 | 11 / 10 (1 lần "chưa có đòn": đầu đòn ngoài vòng) |
| **Bấm V → hộp bóng đầu** | **7/7** có hộp · TB **6,1 tick** (1–7) · 9,6 bước (khựng 3,4) | **6/6** · TB **43,7 tick** (5–61) · 52 bước (khựng 8,3) | 10/10 · 7 tick · 10,6 bước |
| Bấm V → trúng đầu | 5/7 trúng · TB 7 tick | 6/6 · TB 43,7 tick | 5/10 · 7 tick |
| A: bấm **bắt đầu ghi** → hộp bóng | TB 51 bước (18–79) | – | – |
| Đoạn phát TB · mở đầu chưa có hộp TB · đứng yên TB | 35,9 · 5,1 · 0 tick | 90 · 42,7 · 0,8 tick | 18,2 · 6 · 0 tick |
| **Không gây hit / ảnh hưởng chiến đấu** | **2/7** – cả 2 **mục tiêu đã chết** (gác chết giữa nhóm; Bọ #1 vừa chết) | **0/6** | 5/10 – cả 5 mục tiêu đã chết (phát lại đúng nhát kết liễu) |
| … không có đòn · có đòn hụt · bị huỷ | 0 · 0 · 0 | 0 · 0 · 0 | 0 · 0 · 0 |
| Số nhát trong đoạn (tổng · TB) | 13 · 1,9 | 11 · 1,8 | 10 · 1 |
| Bóng trúng (lần) · máu · Thế (chỉ phần bóng) | 10 · 18 · 5 | 6 · 12 · 0 | 5 · 8 · 5 |
| Cộng hưởng có bóng (phần thêm của Cộng hưởng KHÔNG cộng vào máu bóng) | 4 | 5 | 3 |
| Nhịp gọi TB (min), bước | 225 (63) | 276 (206) | 157 (53) |
| Mẫu cuối có hộp · trúng ở mẫu cuối | 2 · 0 | 0 · 0 | 3 · 0 |

**Tách theo phòng** (phát · không gây hit · Cộng hưởng · máu bóng · trễ tới hộp, tick):

| Phòng | A | B | B2 |
|---|---|---|---|
| B (2 Chuông Gỗ) | 2 · 0 · 1 · 8 · 7, 7 | 2 · 0 · 2 · 4 · 37, 39 | 4 · 2 · 0 · 4 · 7×4 |
| C (quái gác) | 2 · 1 · 1 · 2 (+Thế 5) · 7, 7 | 2 · 0 · 1 · 4 · 59, 5 | 2 · 1 · 1 · 0 (+Thế 5) · 7, 7 |
| D (2 Bọ) | 3 · 1 · 2 · 8 · 7, 1, 7 | 2 · 0 · 2 · 4 · 61, 61 | 4 · 2 · 2 · 4 · 7×4 |

**So với TRƯỚC SỬA** (`video/truoc-sua/ket-qua-truoc-sua-PH9.json`, log cũ `video/truoc-sua/log/`):
- A lần phát id=4 (n=7, hộp ở mẫu 6 = mẫu cuối): trước **không bật hộp** (tHop=-1) và bị tính "có đòn nhưng không trúng"; giờ hộp bật (7/7 lần có hộp).
  Nó vẫn không trúng vì quái gác **đã chết** → giờ xếp đúng loại "mục tiêu đã chết". Lần hụt thứ hai cũng vậy (Bọ vừa chết). Không còn lần nào "có đòn nhưng hụt" ở A.
- Máu / Thế / Cộng hưởng / thời điểm chết của A và B **không đổi** ở kịch bản này (nhát bị mất trước đây không trúng ai). B không có đoạn nào kết thúc bằng hộp nên không bị ảnh hưởng.
- Đơn vị: số cũ "8,3 bước" (A) / "51 bước" (B) tính từ mốc sau bước bấm, chỉ trên các lần có hộp (A 6/7). Số mới: mốc trước bước bấm (+1 bước), mẫu số ghi rõ, tách tick / bước khựng.
  Đọc theo tick mô phỏng: A 6,1 tick (7/7), B 43,7 tick (6/6).

**Đọc số (một kịch bản bot, chưa phải cảm nhận – không suy A tốt hơn, PH9 2F):** chênh thời gian 26 bước ≈ 0,43 s; Lam bị trúng 2 / 4 không đủ nói gì về an toàn;
A "trễ ngắn" vì đã bấm ghi trước ~51 bước. B2 cắt trễ tới hộp xuống 7 tick nhưng đổi **nội dung**: mỗi lần chỉ 1 nhát, và với nhịp "gọi sau nhóm 3 nhát / khi mục tiêu vừa chết"
của bot nó hay phát lại đúng nhát kết liễu → 5/10 lần không gây hit. Đó là tương tác giữa luật B2 và nhịp bot, không phải kết luận về B2.

### 3b. Lượt TÀI NGUYÊN (`ket-qua.json → luot2`, cùng bot, không video)

| | A (tham chiếu, miễn phí) | B miễn phí | B 2 nấc / 150 | B 1 nấc / 150 |
|---|---|---|---|---|
| Bấm V / phát | 16 / 7 | 6 / 6 | 6 / 6 | 6 / 6 |
| Bấm khi hết nấc | – | – | **0** | **0** |
| Mọi số còn lại | = lượt chính | = lượt chính | = B miễn phí | = B miễn phí |

Bot gọi thưa (khoảng cách nhỏ nhất 206 bước > 150) nên cả 1 nấc cũng không cạn → kịch bản này **không chạm giới hạn**; không chứng minh tài nguyên vô ích (PH9 1.5).

### 3c. Tình huống ngắn – trạng thái đầu giống nhau (`ket-qua.json → tinh_huong`)

Mỗi ô một trang mới: hình nộm phòng A đặt lại, Lam cách nộm (200 px cho "áp sát", 60 px cho còn lại), mặt phải, **đứng 100 tick** (vòng đệm B đầy cảnh đứng), không bóng.
Cùng chuỗi phím cho A / B / B2; A bấm ghi **cùng lúc** bắt đầu hành động. Sau khi gọi: Lam chém tại chỗ mỗi 14 tick nếu còn trong 62 px.

| Tình huống | A: đoạn · nhát · bấm→hộp (tick) · trúng · máu · CH | B: đoạn · nhát · bấm→hộp · trúng · máu · CH | B2: đoạn · nhát · bấm→hộp · trúng · máu · CH |
|---|---|---|---|
| **Vừa áp sát** (đi tới, chém 1, 14 tick sau gọi) | 47 · 1 · 43 · 1 · 2 · 1 (từ lúc bấm ghi: 103 bước) | 90 · 1 · **86** (43 tick đứng đầu đoạn) · 1 · 2 · 1 | 11 · 1 · **7** · 1 · 2 · 1 |
| **Đánh tại chỗ** (5 nhát, gọi) | 57 · 3 · 7 · 3 · 6 · 1 | 90 · 3 · 40 · 3 · 6 · 1 | 27 · 1 · 9 · 1 · 2 · 1 |
| **Né / lùi rồi gọi** (2 nhát, lướt + chạy lùi 20 tick) | 43 · 2 · 7 · 2 · 4 · 0 | 90 · 2 · 54 · 2 · 4 · 0 | 28 · 1 · 7 · 1 · 2 · 0 |
| **Gọi khi chưa có đòn** | 30 · 0 · – · 0 → **không có đòn** | 90 · 0 · – · 0 → **không có đòn** | **không phát** – "chưa có đòn để vọng", không tốn gì |

Ghi chú: "áp sát" của B phải đi lại cả cảnh đứng + đi tới (86 tick); A cũng phải đi lại đoạn đi tới vì bấm ghi từ lúc bắt đầu đi (43 tick); B2 chỉ phát nhát chém.
"Tại chỗ": A và B có cả 3 nhát cuối còn trong đoạn; B2 chỉ nhát cuối (đổi nội dung, không chỉ giảm trễ – PH9 1.1). Thế khác nhau giữa các ô do nộm vỡ Thế ở thời điểm khác – không so.

## 4. Câu hỏi / việc chờ chủ dự án
1. Bot B2 hay phát lại nhát kết liễu khi gọi ngay lúc mục tiêu chết (5/10). Nếu người thử cũng gặp, có cân nhắc luật "bỏ nhát đã giết mục tiêu" không? (Hiện **không** làm – PH9 cấm tự chọn đòn từng trúng.)
2. ~~Khi bản Âm Đao PH8 lên nhánh: sinh lại P0-B và quay lại số~~ – **xong** (PH10): sinh lại, kiểm lại, đóng băng `p0b-2810-cceea180`.
3. Chờ kết quả checklist Safari thật ("Phản hồi 10" → 5) trước buổi thử người chơi.

## 5. Video và số (`video/`, 60 hình/s, H.264 `-preset veryfast`)

| File | Nội dung |
|---|---|
| `kiem-lai-PH8-A.mp4` · `kiem-lai-PH8-B.mp4` | **VIDEO NGẮN KIỂM LẠI trên bản PH8** (960×540, ~3,5 s / ~5,5 s, `?hitbox=1&debug=vong`): đòn chỉ ở mẫu cuối → nhiều mẫu cùng mã (chống hit lặp) → mẫu cuối trùng Cộng hưởng |
| `luot1-log-*.txt`, `luot2-log-*.txt` | (bản PH8) Log Vọng + log trúng / Cộng hưởng P0 cho từng trang (có B2, B 1 nấc / 2 nấc) |
| `ket-qua.json` | (bản PH8) Số mục 3a–3c (từng lần phát: phòng, đoạn, nhát, hộp đầu, đứng yên, trễ tick / bước, trúng, máu, Thế, Cộng hưởng, lý do không gây hit, mẫu cuối) |
| `kiem-code.json` | (bản PH8) Số kiểm lại mục "Phản hồi 10" → 2 + kiểm nút chép log / nhãn đóng băng (`xuat_log_dong_bang`) |
| `truoc-ph8/` | **TRƯỚC PH8** (sau sửa PH9, phiên `e58986fc`): `1-sach-A-vs-B-truoc-PH8.mp4` (video sạch 1920×540, trái A / phải B, phòng B → C → D), `2-debug-A-vs-B-truoc-PH8.mp4`, `ket-qua.json`, `kiem-code.json`, `log/` |
| `truoc-sua/` | **TRƯỚC SỬA PH9**: `ket-qua-truoc-sua-PH9.json`, `kiem-code-truoc-sua-PH9.json`, `log/` |

Quay lại: `python3 -B game/thu-p0b/cong-cu/quay-p0b.py [luot1 luot2 tinh-huong] [--khong-video]` (cần playwright, Chromium, ffmpeg, Pillow; ≈ 10 phút). Chỉ quay + ghi số, không phải bộ kiểm thử.
`--khong-video`: chỉ đo số + log (lần này dùng cờ này – không quay lại video dài).

## 6. Chưa làm
- Chưa thử trên iPhone (checklist Safari thật chưa ai làm). Không kết luận điều khiển / trải nghiệm đạt từ Chromium.
- Chưa chọn A / B / B2, chưa chốt chi phí, chưa ghép game chính, chưa đổi cách giữ công tắc trong game chính.
- P0-C (tinh anh Chuông Gỗ, Ấn Rèn, đe mở Dư Âm) – làm riêng, không trong trang này.

## Sửa iPhone 29/10 – đóng băng lần 4 `p0b-2910-e8aa09dc`

- **Chém trên không không treo** (sửa ở nguồn Âm Đao `game/thu-p0a/cong-cu/khoi-am-dao.js`, chi tiết + số: `game/thu-p0a/GHI-CHU-AM-DAO.md` mục "Sửa iPhone 29/10"):
  bấm Chém liên tục khi đang rơi trên quái / hình nộm trước đây biến thành pogo tự động nảy mãi; nay pogo tự động chỉ 1 lần mỗi lần rời đất / nhảy tường,
  giữ ↓ + Chém vẫn pogo như cũ. Bot chém liên tục trên hình nộm: trước không bao giờ chạm đất → nay chạm đất sau 53 bước. `?roi=cu` = cũ (biến thể).
- **Cạnh đất bo mềm: KHÔNG áp vào P0-B** – trang này vẫn dùng đất cũ (xem mục "Đất mới 28/10" bên dưới), không dùng bộ đất mới nên không có mép mới.
  Nhãn đóng băng vì vậy chỉ ghi "chém trên không không treo" (ghi thêm "cạnh đất bo mềm" sẽ sai với trang này).
- Nhãn mới (khối `khoi-p0b.js`, dòng `VB_DONG_BANG`): **"29/10/2026 lần 4 (chém trên không không treo; lần 3: camera kiểu Dead Cells; lần 2: kiếm to, vệt chém mềm, nhảy mềm)"**.
  Vọng A / B, số, luật khác giữ nguyên. Kiểm Chromium: 0 lỗi trang. Chưa thử iPhone thật.

## Móc, vệt gen, cổng dọc 29/10 – P0-B chỉ nhận CỔNG DỌC (đóng băng lần 5, phiên `p0b-2910-91572dd6`)

- **Cổng dọc** thay hình cổng rễ ngang ở mọi cổng (cổng nằm trong file dùng chung `game/runtime/trang-tri-dia-hinh.js`, ảnh `art/the-gioi-moi/dia-hinh-v4/cong-doc-3x.png`).
  **Hộp chặn 183 × 159 và luật đóng/mở KHÔNG đổi** (mở > 60 % là đi xuyên). Cổng dọc gen hẹp nên ghép 3 khối dọc (giữa có khoá chuông, hai bên rễ đan) phủ đủ bề ngang hộp chặn –
  không có "tường vô hình". Đóng → mở ≈ 15 bước: cánh giữa tách đôi, hai khối bên rút xuống đất, lối tối hiện dần. Đèn báo = loé xanh ngọc ở khoá chuông.
  Chi tiết + ảnh / GIF: `game/thu-lam-moi-2/GHI-CHU.md` mục "Móc, vệt gen, cổng dọc 29/10", ảnh `game/thu-lam-moi-2/xem-thu/moc-vet-cong/cong-trong-p0b.png`.
- `?cong=cu` = cổng rễ ngang cũ → tính là **BIẾN THỂ** (màn bắt đầu ghi rõ).
- **Không đổi** trong P0-B: Lam cũ, vệt chém cũ, Vọng A/B, mọi số / luật. Móc tường + vệt gen chỉ có ở trang Lam mới (`thu-lam-moi-2`).
- Sinh lại `index.html` bằng `tao-p0b.py` (khoi-p0b.js chỉ đổi nhãn đóng băng → mã băm phiên đổi). Chưa thử trên iPhone thật.


## PH14 (29/10) – ĐÓNG BĂNG LẦN 6 (`p0b-2910-6941b504`): snapshot gồm cả runtime + ảnh + JSON

PH14 mục 7: *"Bản đóng băng phải gồm cả runtime, ảnh và JSON … không gọi là giữ nguyên chỉ vì index.html giống cũ."* Đúng vậy: lần 5 cổng dọc vào P0-B qua runtime dùng chung
dù file trang không đổi. Từ lần này:

- **Mã phiên băm cả runtime dùng chung**: `tao-p0b.py` băm thêm mọi `../runtime/*.js` trang nạp (`lang-hoan-thien.js`, `quai-boss-runtime.js`, `trang-tri-dia-hinh.js`,
  `trang-tri/cong-lang.js`, `trang-tri/phong-boss.js`, `trang-tri/san-chuong.js`) + dữ liệu cổng / đất runtime đọc (`art/the-gioi-moi/dia-hinh-v4/cong-doc.json`, `cong-doc-3x.png`,
  `dia-hinh-v4.json`) → runtime đổi thì **phiên đổi**.
- **Danh sách đầy đủ**: `cong-cu/ghi-dong-bang.py` mở trang trong Chromium, ghi MỌI file trang tải + sha1 + cỡ, chia "riêng trang" / "dùng chung" →
  **`dong-bang/p0b-2910-6941b504.json`** (101 file, trong đó 21 file `game/runtime/…`). Đối chiếu sau này: chạy lại script, so sha1 – khác là không còn đúng bản đóng băng.
- **Bản giữ nguyên tuyệt đối** = bản đóng gói (`game/dong-goi-trang-thu.py game/thu-p0b/index.html`) – nhúng đúng các file trong danh sách vào một HTML. (Không đóng gói / đăng ở phiên này.)
- Lần 6 đổi gì so với lần 5: chỉ **cổng mở** (bỏ khung hẹp giữa, 2 trụ ngoài, đèn đồng / ngà thay xanh ngọc) – qua `runtime/trang-tri-dia-hinh.js`. P0-B **không nạp**
  `dia-hinh-huong-moi.js` nên mép đất PH14 **không** vào P0-B. Lam cũ, Vọng, luật giữ nguyên. Cờ `?congmo=cu` → BIẾN THỂ.
- **Thay đổi luật**: lần 1–3 (`p0b-2810-*`) là **LUẬT-RƠI v1**; lần 4 trở đi **LUẬT-RƠI v2** (pogo tự động 1 lần / lần rời đất, xuống + Chém, kẹp rơi lần chém đầu) – **không gộp
  log hai bên**. Chi tiết: mục "Thay đổi luật" trong `game/thu-p0a/GHI-CHU-AM-DAO.md`.
- P0-B **vẫn Lam cũ** (PH14: chưa thay mặc định A/B). Khi Lam mới đạt trên iPhone sẽ dùng **cùng một bản Lam mới cho cả A và B**, bắt đầu lượt so mới.
