# Vùng 4 Sông sâu — Phiên 3C: Thuồng Luồng pha 2 (Băng), pha 3 (Lửa), cảnh bỏ trốn

16/10/2026. Làm theo `docs/ke-hoach/buoc-3/KE-HOACH.md` mục 1.4, 2.4, mục 5 hàng "3C", mục 8.3; báo cáo `vung-4-3b` (mục "Việc cho phiên sau"),
`vung-4-3a`, `vung-4-2c` (lời trùm, câu đổi pha — giữ nguyên); `docs/cot-truyen/CHUNG.md` (Thuồng Luồng sau này hoá Hắc Long → **bỏ trốn, không chết hẳn**);
`QUYET-DINH.md` (Q1 = A đổi hệ theo pha). Không chơi thử bằng trình duyệt: chỉ `node --check`, bài Node, bot Node, `build.py`, ảnh soát tĩnh.

## Tóm tắt

- **Thay chiêu Ngư Tinh tạm** (`n1`, `n2`, `c4`, `c5` và hàm `chon` trong `G.bossSK.thuong`) bằng 6 chiêu riêng đúng bảng mục 2.4:
  pha 2 Băng **Xoáy nước**, **Lặn – trồi đớp**, **Dòng nước đổi chiều**; pha 3 Lửa **Mưa mảnh đồng**, **Siết sân**, **Đớp liên hoàn**.
  Dùng lại đồ của 3B: `lanDoi` / `b.tl.lan` (lặn), `dop` (đớp), `datHe` / `b.doiPha` (hệ theo pha), `W.tlSan` (Siết sân thu `W.x0..y1`, hạ xong tự trả),
  `sk.anim` (chiêu mượn cử động ảnh Ngư Tinh), `S.nghi`.
- **Mọi đòn có vùng đỏ báo trước**, né được bằng **chạy với tốc nhân vật chậm nhất** (Cu Lì: 64,8 điểm ảnh/giây ngang, 48,6 dọc) hoặc lăn — bài Node đo từng chiêu.
  **Không đòn một phát chết** ở Sức mạnh khuyên dùng: nhát mạnh nhất của chiêu mới ≤ 72% máu tối đa (Quật đuôi pha 1 của 3B: 73%).
- **Cảnh bỏ trốn** thay cho chết: gục → khựng lại, **nhả một mảnh trống nhỏ (vành chim Lạc)** rơi xuống đá, **ngoạm mảnh mặt trời** sáng rực, **chìm xuống nước
  lặn mất** (vây lưng rẽ nước bơi về phía phải). Không nổ tung, không chớp trắng. Dòng chữ *"Thuồng Luồng ngoạm mảnh trống lớn nhất rồi lặn mất!"*;
  bong bóng lời gục của 2C (*"Hừ... Mảnh này ta mang đi. Lên núi rồi ngươi sẽ biết!"*) vẫn hiện. **Thắng ải như hạ trùm thường** (`G.kill`, phần thưởng, sao,
  đồ rơi, cổng — không đổi gì), cổng mở sau cảnh (3,7 giây — bản 3B chờ cử động chết của ảnh Ngư Tinh 3,6 giây, gần bằng).
- **Sao thứ ba** (kết liễu bằng Băng ở pha 3) đã tự đúng từ 3B (`b.weak` lúc gục); lời đổi pha của 2C giữ nguyên; khung truyện không đụng (không tự chuyển trang).
- **Cân bằng**: bot 60 lượt mỗi hệ, thắng trung bình **49,7% → 49,3%** (từng hệ lệch +2 / +1 / −4 điểm, trong ±5).
- **Hình tạm vẽ code** như 3B (ảnh Ngư Tinh nhuộm theo hệ; xoáy, gợn, dải nước, tảng băng / gỗ cháy, mảnh đồng, thân siết, cảnh bỏ trốn vẽ code).
- Không thêm phần thưởng, không đổi bản lưu; không đụng đăng nhập Google / lưu mây / `?cloud=0`.

## Cờ quay lui

| Cờ | Tác dụng |
|---|---|
| `?tl3c=0` (`G.TL_3C = false`) | **Về bản 3B**: pha 2, 3 mượn chiêu Ngư Tinh (Bổ rìu, Sóng thần, Cột nước đuổi; pha 3 + Xoáy hút), không dải dòng nước, sát thương pha 2, 3 theo bảng nổi giận chung, trùm nổ như cũ. Dùng làm "trước" khi đo. |
| `?tldoihe=0`, `?tlrieng=0`, `?vung4=0` | Như 3B (một hệ Độc / tắt cả 3B + 3C / không có vùng 4). |

## Chiêu mới (số trong `G.thuongLuong.CFG`: `xoay`, `troi`, `dong`, `manh`, `siet`, `lienHoan`, `satPha`, `tron`)

| Pha · chiêu | Người chơi thấy | Vùng đỏ / báo trước | Né (tốc chậm nhất) | Sát thương (× b.dmg) |
|---|---|---|---|---|
| 2 · **Xoáy nước** | 2 xoáy (pha 3: 3) mọc **cách em bé ≥ 72**, trôi chậm (16 điểm ảnh/giây) dần về phía em bé 6 giây, **kéo nhẹ** em bé trong bán kính 62 về lõi; lõi là vũng Băng | Vòng đỏ chỗ xoáy mọc, **0,8 giây** | Đứng yên bị kéo ~15–18 điểm ảnh/giây (< nửa tốc chạy dọc) → chạy ngược chiều kéo là thoát; lăn không bị kéo. Kéo **không bao giờ** đưa em bé vào vùng đỏ / vũng khác | mọc 1,4; lõi 0,5 mỗi 0,5 giây |
| 2 · **Lặn – trồi đớp** | Đầu lặn hẳn (không nhắm / đánh trúng được), gợn nước bơi tới cách em bé 70 rồi **đuổi 2 giây** chậm (42 điểm ảnh/giây), dừng → trồi đớp. Đầu **nằm trên đá giữa sân, lộ điểm yếu 1,2 giây**, rồi lặn về mép phải. Pha 2, 3 trồi đớp **2 lần** (lần 1 nằm 0,5 giây rồi lặn đuổi tiếp 1 giây) | Vòng đỏ r 30 ở chỗ gợn dừng, **0,66 giây** | Chạy thẳng ra xa: gợn không đuổi kịp; vòng đỏ: đi ngang ra mất 0,52 giây | 1,8 |
| 2 · **Dòng nước đổi chiều** | Từ đầu pha 2: **một dải nước ngang** qua bãi đá (cao 34, lệch giữa ±18) đẩy em bé 28 điểm ảnh/giây theo mũi tên (dùng chung luật dòng chảy của vùng — `js/song_luat.js`: không mất máu, không đẩy vào vùng đỏ). **Mỗi 10 giây đổi chiều**; trước 1,5 giây mũi tên lớn ngược chiều nhấp nháy + chữ *"Dòng nước sắp đổi chiều!"*. Chiêu: ép đổi chiều ngay + **tảng băng (pha 3: gỗ cháy) trôi quét cả dải** | Cả dải đỏ, **1,5 giây** | Bước lên đá ngoài dải: 0,43 giây | 1,6 |
| 3 · **Mưa mảnh đồng** | 6 mảnh trống nóng đỏ rơi (một bóng ngay chỗ em bé), **3 đợt** (đợt sau nhắm lại chỗ em bé, cách 0,8 giây); rơi xong **nằm lại 4 giây làm vật cản nóng** (đẩy em bé ra, vũng nóng quanh mảnh) | Bóng tròn r 18: đợt đầu **0,9 giây**, đợt sau **0,6 giây** | Ra khỏi bóng 0,45 giây. Các mảnh cách nhau ≥ 46 (khe ≥ 20 — không kẹt), không rơi đè lên mảnh đang nằm | 1,7; vũng 0,4 mỗi 0,5 giây |
| 3 · **Siết sân** | Thân cuộn quanh mép sân: quét **dải mép trong** (trên, dưới, trái dày 24 + dải hẹp 20 sau lưng đầu), rồi **sân hẹp lại** (trái 8, trên 7, dưới 7; tối đa 2 lần → còn 226 × 126). Từ đó **mỗi 5 giây quét lại** dải mép trong | **1,2 giây** (quét lại: **1,0 giây**) | Đứng giữa sân (luôn an toàn); từ sát mép đi vào mất 0,58 giây | 1,6 |
| 3 · **Đớp liên hoàn** | **4 cú đớp thẳng** nối nhau (cách 0,7 giây), mỗi cú **nhắm lại chỗ em bé**, đầu chồm tới 40 điểm ảnh mỗi cú (không quá 56 điểm ảnh từ mép trái); xong nằm mệt 1 giây (lộ điểm yếu) rồi trườn về mép phải | Vạch rộng 34: **0,75 / 0,58 / 0,58 / 0,58 giây** | Bước vuông góc vạch 22 điểm ảnh: 0,45 giây; lăn ngang sau mỗi cú | 1,7 |

Chọn chiêu (`chon3C`): pha 1 như 3B; pha 2 `Quật đuôi, Phun nước đen ×2, Vòng thân, Xoáy nước, Lặn – trồi đớp, Dòng nước đổi chiều`; pha 3 `Quật đuôi, Phun nước đen ×2,
Xoáy nước, Lặn – trồi đớp, Mưa mảnh đồng, Siết sân, Đớp liên hoàn` (dải dòng nước vẫn chạy và tự đổi chiều). Em bé đứng sát đầu (< 84): pha 2 thêm Đớp ×3, pha 3 Đớp ×2 + Đớp liên hoàn ×2.
Vỗ sóng bờ (chống đứng sát mép) vẫn chạy mọi pha như 3B. Đổi pha giữa chiêu: xoáy tan, đầu đang lặn – trồi về mép, mảnh đồng đang nằm thì giữ.

Khác kế hoạch / ghi để chủ game biết:
- **Lặn – trồi đớp**: kế hoạch "gợn đuổi 2 giây"; gợn đuổi chậm từ đầu thì không bao giờ tới chỗ em bé ở xa (đầu ở mép phải, cách ~270) → gợn **bơi nhanh tới cách 70** rồi mới
  đuổi chậm 2 giây. Pha 2, 3 trồi **2 lần** (thêm theo bot: một lần thì bot không bao giờ bị trúng).
- **Xoáy nước** trôi dần về phía em bé (kế hoạch "chạy chậm trên sân"): trôi ngẫu nhiên thì không bao giờ tới gần em bé.
- **Siết sân** quét cả **dải hẹp sau lưng đầu** (mép phải): bot (và người chơi) đứng nép sau đầu ở mép phải gần như không bị chiêu nào chạm; "thân cuộn quanh mép sân" thì cả bốn mép.
  Sân chỉ hẹp ở trái / trên / dưới (mép phải là chỗ đầu). Kế hoạch ghi "mỗi 6 giây" — để 5 giây theo bot.
- **Mưa mảnh đồng** 3 đợt, **Đớp liên hoàn** 4 cú (kế hoạch: 1 đợt, 3 cú) — theo bot (mục Cân bằng).
- Bóng trùm 3 màu ở suối hồi (mục 8.3) **chưa làm** (như 3B ghi: giếng suối là phần nền của 2B, để phiên ảnh D).

## Cảnh bỏ trốn (`CFG.tron`, hàm `boTron`, `veTron`)

| Giây sau khi gục | Thấy |
|---|---|
| 0 – 0,5 | Đầu khựng lại (cử động `phase3` của ảnh mượn), bọt tung; không nổ, không chớp trắng màn hình |
| 0,5 – 1,0 | Nhả **mảnh vành chim Lạc** (mảnh nhỏ, đồng vàng có hình chim) bay vòng cung rơi xuống đá trước mặt, lấp lánh |
| 1,0 – 1,8 | **Mảnh mặt trời** sáng rực trong miệng (quầng vàng, tia quay) |
| 1,8 – 3,0 | Đầu **chìm dần** xuống nước (cắt phần dưới mặt nước), mảnh mặt trời chìm theo, còn quầng sáng dưới nước; gợn nước loang to dần |
| 3,0 – 3,4 | Chỉ còn vây lưng rẽ nước bơi về phía phải, gợn nước |
| 3,7 | Cổng mở, đồ rơi, nước rút (trả sàn cũ), dải dòng nước tan |

Cài: bọc `G.mobOnKill` (đặt `w.tlTron`, `w.bossDieT = 3,7` — `js/stage.js` chờ đúng chừng đó mới mở cổng, như chờ cử động chết của trùm có ảnh) và
`G.fx.death` (Thuồng Luồng: bỏ chuỗi nổ của trùm, chỉ vài bọt). Vẽ bằng đồ vật `tlTron` (xếp theo chiều sâu), ảnh đầu = bản chụp trùm lúc gục.
Phần thưởng, sao, bảng vàng không đi qua đường này nên không đổi. Có ảnh thật `p3-5-bo-tron` (C) thì thay phần vẽ đầu trong `veTron`.
Cảnh truyện b7 (kết vùng, 2C) vẫn chiếu khi về làng như cũ.

## Tệp đã sửa

| Tệp | Thay đổi |
|---|---|
| `game/js/thuong_luong.js` | Khối **"PHIÊN 3C"** (chiêu, mỗi khung `tick3C`, cảnh bỏ trốn), `chon3C` + 6 khoá chiêu mới trong `G.bossSK.thuong` (giữ `chon3B`, `n1`, `n2`, `c4`, `c5` cho `?tl3c=0`), cờ `G.TL_3C`, `CFG` mới, `G.NOI_GIAN.vung.satTrum.thuong` (mục Cân bằng), vẽ (`veDong`, `veXoay`, `veManh`, `veSiet`, `veTron`; gợn lặn – trồi dùng chung hình lặn của 3B), chữ tiếng Anh. `TL.di` không kéo đầu về mép khi đầu đang ở ngoài sân (`b.tl.raKhoi`). |
| `game/tests/thuong_luong_3c.test.js` (mới) | 34 điều kiện (dưới). |
| `game/tests/thuong_luong.test.js` | Chạy trên `?tl3c=0` (bài của bản 3B: pha 2, 3 mượn chiêu Ngư Tinh); 38 điều kiện như cũ. |
| `docs/review/ke-hoach-cai-thien/vung-4-3c/` | `do_trum.py` (chép 3B + `BAN`, `OUT`, `PRE`, `TOP`, máu mất theo chiêu **và pha**), `do_trum.txt`, `so-lieu-do-trum_*.json`, `anh_soat.py`, `cac-luc.png`, `bo-tron.png`, `truoc-sau.png`, báo cáo này. |
| `game/dist/*` | Dựng lại. |

**Không sửa** `boss.js`, `chieu_trum.js`, `combat.js`, `env_art.js`, `fx.js`, `stage.js`, `truyen.js`, `song_luat.js` (chỉ bọc hàm / dùng móc có sẵn từ tệp riêng).

## Cân bằng (docs/ke-hoach/LUAT-CAN-BANG.md)

**Không thêm** vàng / quặng / đá / mảnh / linh khí / Sức mạnh nào; phần thưởng hạ Thuồng Luồng không đổi (cảnh bỏ trốn chỉ là hình). Trận dài thêm ~0–2 giây ở lượt thắng.

`do_trum.py 60` (cách đo như 3B: bot chơi thật chỉ phòng trùm 4-5, bản lưu `kiem-can-bang/luu-A.json` nâng tới Sức mạnh khuyên dùng **662 / 690**, hai vũ khí
**ép cùng một hệ**, cùng 60 hạt). Trước = `?tl3c=0` (bản 3B), sau = 3C.

| Hệ bot | trước: thắng · tg hạ · đòn trúng/phút · máu còn khi thắng | sau |
|---|---|---|
| Lửa | 45% · 34 giây · 12,4 · 45% | **47%** · 36 giây · 5,1 · 72% |
| Độc | 52% · 31 giây · 10,5 · 48% | **53%** · 31 giây · 5,4 · 68% |
| Băng | 52% · 34 giây · 10,8 · 49% | **48%** · 36 giây · 5,8 · 68% |
| **Trung bình** | **49,7%** | **49,3% (−0,4)** |

Thời gian mỗi pha / % máu mất mỗi phút:

| Hệ bot | trước: pha 1 · 2 · 3 | sau: pha 1 · 2 · 3 |
|---|---|---|
| Lửa | 5 giây / 119 · 11 / 325 · 13 / 340 | 5 / 120 · 10 / 283 · 11 / 158 |
| Độc | 11 / 281 · 6 / 328 · 8 / 293 | 11 / 281 · 6 / 177 · 8 / 181 |
| Băng | 8 / 235 · 13 / 310 · 7 / 237 | 8 / 233 · 14 / 191 · 7 / 214 |

Đọc bảng:
- Thắng từng hệ lệch **+2 / +1 / −4 điểm** (trong ±5), trung bình gần như bằng. Pha 1 không đổi (cùng mã 3B).
- Bot bị trúng **ít lần hơn hẳn** (5 so với 10–12 đòn/phút) nhưng **mỗi đòn nặng hơn** → thua với cùng tỉ lệ, còn thắng thì còn nhiều máu hơn (68–72% so với 45–49%).
  Lý do: bot (né sau 0,2 giây, luôn chạy ra khỏi vùng đỏ) gần như né hết vùng đỏ báo 0,6–1,5 giây của chiêu mới; Sóng thần của Ngư Tinh (tường chạy dài, bot né kém)
  là nguồn mất máu chính của bản 3B. Chiêu mới "đọc là né được" đúng mục đích vừa sức trẻ con.
- Bản đầu (chiêu như kế hoạch, sát thương pha 2, 3 theo bảng nổi giận chung × 0,5 / × 0,45) cho bot thắng **90–95%**, pha 3 chỉ mất 20–44% máu/phút; chiêu mới gần như
  không chạm bot. Đã chỉnh theo bot (đo 20–40 lượt mỗi bước, số trong `do_trum.txt` cuối là bản sau cùng):
  1. tăng sức ép mà vẫn né được: xoáy trôi về phía em bé, trồi đớp 2 lần, mảnh đồng 3 đợt, Đớp liên hoàn 4 cú, Siết sân quét cả dải sau lưng đầu và mỗi 5 giây,
     thêm Phun nước đen vào túi chiêu pha 2, 3 (thắng còn ~83%);
  2. **sát thương pha 2, 3 riêng của Thuồng Luồng**: `G.NOI_GIAN.vung.satTrum.thuong = [1, 0,8, 0,8]` (trùm khác [1, 0,5, 0,45]; khoá `satTrum` đã có sẵn trong bảng,
     "hiện không dùng") — chiêu riêng ít đòn hơn chiêu Ngư Tinh mượn nên mỗi đòn nặng hơn. Đặt trong `thuong_luong.js`, chỉ khi bật 3C (`?tl3c=0`: như cũ).
     Thử [1, 0,7, 0,65] → 55 / 58 / 65% (dễ hơn); [1, 0,8, 0,72] → 50 / 45 / 55% với pha 3 vẫn nhẹ → chốt [1, 0,8, 0,8].
  3. Hạ Đớp liên hoàn, Mưa mảnh đồng 1,8 → 1,7 để nhát mạnh nhất không vượt Quật đuôi pha 1 (76% → 72%); đo lại 60 lượt: không đổi số thắng.
- **Không đòn một phát chết** (bài Node mục 4, bản lưu khuyên dùng 662 / 690, em bé đủ máu, đứng trong vùng): Quật đuôi (pha 1) 73%, Lặn – trồi đớp 65%,
  Dòng nước đổi chiều 57%, Đớp liên hoàn 72%, Mưa mảnh đồng 72%, Siết sân 59% máu tối đa.
- Không bế tắc: bot bất tử hạ được ở cả 3 hạt thử; thua thì trùm còn 37–46% máu (trước 20–42%).
- `tests/cay.py 12 --node` (15 ải vùng 1–3, mã mới không chạy ở đó): trước (mã 3B, worktree `d3cde904`) **195 phút** TB, sau **186 phút** (−4,6%, ≤ ±10%: đạt — chỉ là
  nhiễu ngẫu nhiên của bot cày); 17 luật "đạt" cả hai bản, không lượt nào kẹt.

## Ảnh soát tĩnh

`anh_soat.py` (trình duyệt không giao diện chỉ để có canvas thật; ép chiêu, vẽ **một** khung `G.drawWorld` + lớp trận, chép PNG — không chơi).
Chấm vàng là chỗ em bé đứng (trình duyệt không giao diện không vẽ em bé, như 2B / 3B).
- `cac-luc.png` (13 lúc): pha 2 có dải dòng nước; Xoáy nước lúc báo (2 vòng đỏ xa em bé) và lúc trôi; gợn đuổi; đầu trồi giữa bãi đá (mảnh trống trên trán sáng);
  Dòng nước lúc báo (cả dải đỏ + mũi tên ngược chiều vàng nhấp nháy) và tảng băng trôi; pha 3 Lửa; Mưa mảnh đồng lúc báo và mảnh nằm lại; Siết sân lúc báo
  (khung đỏ bốn mép) và sân hẹp lại 2 lần (thân cuộn viền quanh); Đớp liên hoàn (đầu chồm ra giữa sân, vạch đỏ).
- `bo-tron.png` (6 lúc: 0,3 / 0,8 / 1,3 / 2,1 / 2,7 / 3,3 giây): khựng → mảnh chim Lạc trên đá → mảnh mặt trời trong miệng → chìm → vây + gợn.
  Vạch xanh lá chéo trong ảnh là hiệu ứng linh khí bay về thanh vũ khí lúc hạ trùm (có từ trước, khung tĩnh nên thành vạch).
- `truoc-sau.png`: pha 3 bản 3B (`?tl3c=0`) và 3C (mảnh đồng, dải dòng nước).

Nhận xét khi soát: vùng đỏ, dải nước, mũi tên đổi chiều, mảnh đồng, thân siết đọc rõ trên nền đá; ảnh Ngư Tinh tạm vẫn to (như 3B ghi). Đã sửa sau khi soát:
quầng mảnh mặt trời vẽ cả dưới mặt nước lúc đầu chìm → còn quầng mờ dưới nước.

## Cách kiểm (đã chạy)

- `node --check game/js/*.js`: sạch.
- `node game/tests/thuong_luong_3c.test.js` — **PASS 34 điều kiện** (3 bản: thường, `?tl3c=0`, `?vung4=0`):
  1. chọn chiêu theo pha (không còn `n1`, `n2`, `c4`, `c5`); pha 2 mở một dải dòng nước, còn ở pha 3; dải đẩy 28 điểm ảnh/giây, ngoài dải không trôi;
  2. Xoáy nước (2 vòng báo 0,78 giây, cách em bé ≥ 72; lõi vũng Băng; kéo 15 điểm ảnh/giây < nửa tốc chạy dọc chậm nhất, chạy ngược là thoát; tự tan);
     Lặn – trồi đớp (không nhắm được lúc lặn; gợn đuổi 41 < 48,6; vòng đỏ r 30 ngay chỗ em bé báo 0,64 > 0,52; trồi 2 lần, đầu nằm giữa bãi đá lộ điểm yếu 1,2 giây
     rồi về mép phải; chạy ra xa thì gợn không đuổi kịp); Dòng nước (tự đổi chiều, báo trước 1,5 giây; chiêu phủ cả dải, báo 1,48 > 0,43, ngoài dải không trúng, đổi chiều lúc nổ);
  3. Mưa mảnh đồng (6 bóng, một ở chỗ em bé, báo 0,88 > 0,45; 3 đợt; vật cản 4 giây đẩy em bé ra; khe ≥ 20); Siết sân (4 dải, báo 1,18 > 0,58, giữa sân an toàn;
     sân hẹp 8 / 7 / 7, tối đa 2 lần còn 226 × 126; quét lại sau ~5 giây báo 0,98); Đớp liên hoàn (4 vạch nhắm lại, báo 0,73 / 0,56 ×3 > 0,45; đầu chồm 121, không quá mép trái, trườn về);
  4. không đòn một phát chết (bảng trên);
  5. cảnh bỏ trốn (không nổ, `tlTron`, chữ; cổng mở sau 3,72 giây; đồ rơi như cũ; nước rút, dải tan); `?tl3c=0` không có cảnh;
  6. bot bất tử hạ Thuồng Luồng 3 / 3 hạt, không NaN, gặp đủ 6 chiêu mới, không còn chiêu Ngư Tinh, em bé luôn trong bãi đá (cả lúc sân hẹp);
  7. vẽ mọi lúc + 6 lúc cảnh bỏ trốn (VI + EN) không lỗi; chữ mới có tiếng Anh: *Whirlpool, Dive Ambush, Turning Current, Bronze Shard Rain, Coil Squeeze, Snap Frenzy,
     "The current is turning!", "{0} snatches the biggest drum shard and dives away!"*;
  8. `?tl3c=0` = bản 3B (chọn chiêu cũ, không dải); `?vung4=0` không có gì; không lỗi ngầm.
- `node game/tests/thuong_luong.test.js` (bản 3B qua `?tl3c=0`): PASS 38.
- Bài cũ: `vung4` 38, `song_luat` 40, `vung4_truyen` 20 (lời ra mắt → đổi pha → gục vẫn đúng), `trum_song` 39, `quai_song` 69, `so_yeu_quai` 41, `thanh_tuu` 35,
  `viec_ngay` 36, `su_kien` 83, `cloud_save_regression`, `bo_do_mua` 22, `cam_giac_danh` 15, `thuong_b2` 9: đạt.
- `python3 game/build.py`: một tệp **28,40 / 30 MB**. `LK_ANH_ROI=1 python3 game/build.py --hai-tep`: **người chơi tải 16,30 / 20 MB** (trước 16,29), trang chính nén
  1,12 / 1,50 MB. Phiên này **không thêm ảnh**; mã mới ≈ 29 KB chưa nén (`thuong_luong.js` 36 → 66 KB).
- Đăng nhập Google / lưu mây / `?cloud=0`: không đụng (không trường bản lưu mới; trạng thái chiêu chỉ sống trong phòng).

## Commit

- `135d196e` chiêu pha 2, 3, cảnh bỏ trốn, cờ `?tl3c=0`, bài Node
- `cb76a71a` chỉnh theo bot, `satTrum.thuong`, `do_trum.py` + số liệu, ảnh soát
- `bf9d54e2` hạ Đớp liên hoàn / Mưa mảnh đồng 1,7, quầng dưới nước, đo lại 60 lượt, dựng lại dist
- (commit cuối) ghi chú đầu tệp, ảnh soát mới, dựng lại dist, báo cáo này

## Việc cho phiên sau

- **4 (cân bằng)**: trận 4-5 nay ngang 3B với bot "một hệ" (49%); bot chưa biết đổi vũ khí theo pha (như 3B ghi). Chỗ chỉnh nhanh: `CFG.satPha` (sát thương pha 2, 3),
  `CFG.*.sat`, số đợt `manh.dot`, `troi.lan`, `lienHoan.so`. Nếu người chơi thật thấy pha 2, 3 dễ hơn bot đo (chiêu "đọc là né") thì nâng `satPha` thay vì rút ngắn báo trước.
- **Ảnh**: C (TL p2, p3, tấm `6-lan` cho lặn – trồi, `p3-5-bo-tron` cho cảnh bỏ trốn) → thay phần vẽ đầu trong `veTron` và gợn lặn; E2 / E4 (xoáy, gợn), E13 (mảnh đồng rơi
  `hu-manh-dong-roi`) → thay `veXoay`, `veManh` (giữ nguyên luật). `sk.anim` của 6 chiêu mới đang mượn `c2`, `c4`, `c5`, `atk` của Ngư Tinh — có ảnh thật thì đổi theo tấm động tác.
- Bóng trùm 3 màu ở suối hồi (mục 8.3) vẫn chưa làm.
