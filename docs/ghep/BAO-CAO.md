# Báo cáo đợt ghép 1

Nhánh: `claude/ghep-1`, lấy `claude/chieu-thuc-va-he` làm gốc.

Kết quả chính: đã ghép xong bốn nhánh thành một game chạy được, và đã thêm đủ các luật chủ dự án chốt (bốn bậc màu, trùm vùng rơi Vàng, đặc trưng hệ theo cấp, nút mới, né theo hướng cuối). Mọi bài kiểm tra đều đạt, trừ một bài: đo sát thương trong phòng nhỏ (`dps.py nho`) lệch 17%, vượt ngưỡng 15%. Bài này ở nhánh gốc cũng không đạt (15,1%). Chi tiết ở mục 5 và mục 6.

## Ảnh nên xem (cùng thư mục này)

| Ảnh | Nội dung |
| --- | --- |
| `tran-danh.png` | Thợ Rèn và thanh Gươm Rồng hệ Lửa bậc Tím đang chém nhát kết, bộ nút mới, ô vũ khí viền màu bậc |
| `bon-hero-trong-tran.png` | Bốn em bé tinh linh trong trận: kiếm, cung đang giương (có vòng nạp quanh nút Đánh), giáo quét vòng, búa nện đất |
| `lo-ren-bon-bac.png` | Lò rèn, mục Nâng bậc: trên là lên Vàng bằng mảnh trùm, dưới là Thường lên Lam |
| `kho-do.png` | Trên: màn Trang bị, kho đồ có đủ bốn bậc. Dưới: bảng kết quả khi trùm vùng rơi vũ khí Vàng |
| `mo-dac-trung.png` | Trên: thông báo trong trận khi kiếm lên Thức tỉnh và mở "Nổ lan". Dưới: màn Xem vũ khí ở làng |
| `lang.png` | Trên: làng. Dưới: màn chọn hero có hình bốn em bé |

Ảnh chụp bằng `game/tests/ghep_shots.py`. Máy chụp không tải được phông Be Vietnam Pro nên chữ trong ảnh là phông thay thế.

## 1. Đã ghép gì

| Nhánh | Mang vào | Xung đột |
| --- | --- | --- |
| `claude/chieu-thuc-va-he` (gốc) | Lối đánh riêng bốn vũ khí, hiệu ứng ba hệ | |
| `claude/vu-khi-song` | `game/js/weapon_art.js` (400 hình vũ khí sống, 4 bậc) | Không |
| `claude/hero-tinh-linh-2` | `game/js/hero_tinhlinh.js` (bốn em bé tinh linh) | Không |
| `claude/nut-bam` | `game/js/btn_art.js` (bộ nút) | Không |

`game/index.html` nạp thêm ba file đúng thứ tự: `weapon_art.js` sau `art.js`, `hero_tinhlinh.js` sau `hero_art.js`, `btn_art.js` trước `stage.js`. `weapon_art.js` và `btn_art.js` giữ nguyên từng chữ. `hero_tinhlinh.js` có sửa (mục 7).

## 2. Đã nối gì

**A. Hero mới.** Em bé tinh linh thay hero cũ trong trận, ở làng (hình lớn ở màn chính) và ở màn chọn hero (hình nhỏ trong từng ô). Vũ khí trên tay là vũ khí sống, đúng dòng, nhánh, mốc, bậc của món đang cầm. Mặt vũ khí đổi theo trạng thái: đứng yên, đang đánh, nhăn mặt nửa giây sau khi bé trúng đòn; trong ô vũ khí thì món không cầm đang ngủ. Tư thế ăn theo `P.mv`:

- Kiếm: ba nhát của chuỗi dùng ba tư thế, kiếm vung và kéo bé theo.
- Cung: giữ nút thì bé giương cung dần theo mức đà; cung cao hơn người.
- Giáo: ba nhát đâm, nhát thứ tư quét một vòng ngang quanh người (tư thế mới); giữ nút thì bé thu giáo về sau.
- Búa: giữ nút thì búa giơ dần lên đầu, đầy đà thì rung; thả ra thì nện.

Tầm đánh: kiếm và búa khớp hình sẵn nên giữ nguyên. Giáo sống dài gần 60 điểm ảnh nên tôi nới tầm đâm từ 54 đến 56 lên 60 đến 62, vòng quét từ 40 lên 44.

**B. Vũ khí.** Mỗi món trong bản lưu có `family` (dòng 0 đến 9) và `rarity` (bậc 0 đến 3). Tên lấy từ `G.weaponArt.name`. Mọi biểu tượng vũ khí (ô vũ khí trong trận, lò rèn, kho đồ, màn chính, rương báu, bảng kết quả) vẽ bằng `G.weaponArt.icon`. Khung ô và tên mang màu bậc. Bản lưu cũ được nâng cấp khi mở game: Sắt thành Thường, Bạc thành Lam, Linh thành Tím; dòng bằng số thứ tự của món chia 10 lấy dư; dấu ấn, cấp mài, dòng phụ cũ, danh hiệu được giữ. Mã cũ đọc `w.tier` vẫn chạy (nay là tên khác của `rarity`).

**C. Bốn bậc.** Xem mục 3.

**D. Đặc trưng hệ theo cấp.**

| Cấp | Có gì |
| --- | --- |
| Trắng | Chỉ có chỉ số |
| Mầm | Chỉ số x1,04. Mỗi đòn 20% gây cháy, độc hoặc chậm; vệt chém nhuốm màu hệ. Chưa có luật hệ |
| Thành hình | Chỉ số x1,08. Mở đặc trưng 1: Lửa "Vệt cháy", Độc "Vũng độc", Băng "Gai băng" |
| Thức tỉnh | Chỉ số x1,12. Mở đặc trưng 2: Lửa "Nổ lan", Độc "Lây độc", Băng "Băng vỡ" |

Đặc trưng không còn mạnh dần qua ba cấp: mở là có đủ. Lên Thành hình và Thức tỉnh giữa trận thì hiện thông báo kèm tên đặc trưng vừa mở. Ở làng, chạm một vũ khí đang mang để mở màn Xem vũ khí: có danh sách đặc trưng đã mở và sắp mở.

Ba điều tôi tự quyết, cần chủ dự án biết:

- Luật riêng của tên (tên Lửa nổ, tên Độc tách mảnh, tên Băng xuyên thêm) tính vào đặc trưng 1, nên Mầm chưa có.
- Bản gốc có sẵn ba luật cũ ở Thức tỉnh nằm trong `combat.js` (Băng: đòn thứ ba cộng 2 tầng; Lửa: đòn trúng làm cháy lan; Độc: quái chết để lại vũng). Tôi bỏ cả ba, để mỗi cấp chỉ có đúng một đặc trưng như đã chốt.
- Bản gốc cho quái đang cháy chết thì lửa lan sang con bên cạnh ở mọi cấp. Nay đó là "Nổ lan", chỉ có từ Thức tỉnh, và có thêm sát thương 0,5 lần chỉ số vũ khí.

**E. Nút bấm.** Thay đủ: Đánh, Đặc biệt, kỹ năng hero, Né, bình máu, tạm dừng, hai ô vũ khí, cần điều khiển. Nút Đánh có vòng nạp khi giữ (búa có 2 nấc). Mũi tên trên nút Né chỉ đúng hướng sẽ lộn. Nút kỹ năng nhích lên 4 đơn vị theo gợi ý của nhánh nút bấm.

**F. Né.** Không đẩy cần thì lộn theo hướng di chuyển gần nhất. Chưa đi bước nào thì mới theo hướng mặt. Hình lộn nghiêng theo hướng lộn (5 kiểu: lên hẳn, chếch lên, ngang, chếch xuống, xuống hẳn), lộn dọc thì nảy thấp hơn, vũ khí chĩa theo hướng lộn. Bóng mờ phía sau nằm đúng trên đường lộn.

**G.** Đã cập nhật `game/README.md`.

## 3. Con số bậc cuối cùng

| Bậc | Sát thương gốc | Tiến hóa cao nhất | Dòng phụ | Dòng mạnh |
| --- | --- | --- | --- | --- |
| Thường | x1 | Thành hình | 0 | không |
| Lam | x1,15 | Thức tỉnh | 1 | không |
| Tím | x1,3 | Thức tỉnh | 2 | không |
| Vàng | x1,5 (vùng 1), x1,6 (vùng 2), x1,7 (vùng 3) | Thức tỉnh | 2 | 1 |

Tôi giữ đúng các con số khởi điểm, vì bot không cho thấy lệch đáng kể (mục 5).

- Dòng phụ: ba dòng sẵn có (hồi thêm 1 mana khi trúng, 10% gấp đôi sát thương, tầm xa hơn 15%), không trùng nhau trên một món.
- Dòng mạnh của bậc Vàng, mỗi món một dòng ngẫu nhiên. Tên và tác dụng là tôi đặt, chủ dự án có thể đổi:
  - Diệt yêu: thêm 20% sát thương lên tinh anh và trùm.
  - Thấm hệ: tỉ lệ gây hiệu ứng hệ tăng thêm 25%.
  - Mở màn: đòn đầu lên quái còn đầy máu gây gấp đôi.
- Rương và tinh anh, tỉ lệ Thường / Lam / Tím: vùng 1 là 72 / 24 / 4; vùng 2 là 52 / 38 / 10; vùng 3 là 36 / 44 / 20. Không bao giờ ra Vàng. Dòng ngẫu nhiên, đủ 10 dòng ở mọi bậc.
- Tinh anh có 35% rơi một vũ khí. Qua một ải thường có 50% nhận một vũ khí, như trước.
- Trùm vùng: lần đầu hạ chắc chắn rơi 1 vũ khí Vàng của vùng đó. Đánh lại: 12% Vàng, còn lại Tím. Người chơi cũ đã hạ trùm từ trước vẫn được món Vàng ở lần hạ kế tiếp.
- Lò rèn: Thường lên Lam tốn 150 vàng, 4 quặng, 6 gỗ linh. Lam lên Tím tốn 450 vàng, 1 đá tôi, 8 vảy cá. Tím lên Vàng tốn 4 mảnh trùm, 2 đá tôi và 800, 1100 hoặc 1400 vàng; dùng mảnh trùm vùng nào thì nhận hệ số Vàng của vùng đó. Vàng vùng thấp luyện tiếp lên vùng cao được. Nâng bậc không mất dấu ấn và tiến hóa.
- Giá bán: 20, 60, 150, 400 vàng theo bậc, cộng 15 mỗi cấp mài.
- Rương đồ đầy 12 món thì vũ khí rơi đổi thành vàng như trước, riêng vũ khí Vàng luôn được giữ.

## 4. Chỗ đã sửa ở file dùng chung

Số dòng theo bản mới. Phần cho đợt ghép sau (`claude/phong-vuong` sửa `stage.js`, `combat.js`; `claude/quai-va-trum` thêm `monster_art.js`): tôi không đụng phần biên phòng, cửa, sinh quái, bản đồ.

**`game/js/combat.js`** (bớt 24 dòng, thêm 41 dòng)

- 18: `G.wStage` đọc mốc cao nhất từ `G.RARITY`.
- 20 đến 23: thêm `G.wRar`, `G.wHas`.
- 25 đến 30: `G.wName` lấy tên từ `G.weaponArt`.
- 32 đến 35: thêm `G.wRarMult`; `G.wBase` nhân hệ số bậc và hệ số mốc.
- 36 đến 41: `nameWeapon` chỉ còn đặt danh hiệu (`w.title`, `w.named`).
- 52 đến 57: `G.addMarks` thêm tên đặc trưng vào thông báo.
- 297: trong `G.kill`, bỏ đoạn lửa lan khi chết và vũng độc của Thức tỉnh; chỉ còn gọi `G.moves.onKill`.
- 303: tinh anh gục thì gọi `G.onEliteDown`.
- 321 đến 324: `playerHit` dùng `G.wHas`, thêm hai dòng mạnh Diệt yêu, Mở màn.
- 340 đến 342: thêm dòng mạnh Thấm hệ; bỏ hai luật cũ của Thức tỉnh.
- 394, 415, 421, 751: `w.affix === ...` đổi thành `G.wHas(...)`.
- 576: nhớ hướng di chuyển gần nhất (`P.ldx`, `P.ldy`).
- 581 đến 582: né không đẩy cần thì theo hướng đó.

**`game/js/stage.js`** (bớt 47 dòng, thêm 106 dòng)

- 7 đến 31: `G.giveWeapon` nhận thêm dòng và vùng; thêm `G.rollRarity`, `G.bossDrop`, `G.onEliteDown`.
- 197 đến 201: `chestOptions` dùng bậc và dòng ngẫu nhiên.
- 250 đến 253: trong `finish`, vũ khí rơi theo luật mới.
- 276: dòng "Trong ải" mang theo vũ khí để vẽ hình.
- 285: nút kỹ năng nhích lên 4.
- 404 đến 405: `markInfo` dùng `G.RARITY`.
- 417 đến 421: bình máu và nút dừng vẽ bằng `G.btnArt`.
- 438 đến 446: khung ô vũ khí bằng `G.btnArt.slot`, hình vũ khí sống, chữ bậc mang màu bậc.
- 514 đến 550: cần điều khiển và bốn nút tròn vẽ bằng `G.btnArt`, có vòng nạp và hướng Né.
- 560 đến 576: bảng rương báu có hình vũ khí và màu bậc.
- 580 đến 585: `weaponLine` có ô hình viền màu bậc.
- 679 đến 682: bảng kết quả vẽ hình vũ khí nhận được.
- Vị trí và vùng chạm của nút không đổi, trừ nút kỹ năng.

**File khác**

- `game/js/data.js`: `G.RARITY` thay `G.TIERS` (tên `G.TIERS` vẫn trỏ tới bảng mới); thêm `G.GOLD_MULT`, `G.FAMILIES`, `G.STAGE_MULT`, `G.POWER`, `G.HE_FEATURES`, `G.heFeatures`, `G.DROP`, `G.goldCost`; `G.TIER_UP` đổi giá; `G.NAME_WORDS` khớp chữ của vũ khí sống; `G.WTYPES.spear.reach` từ 50 lên 56; thêm 2 dòng gợi ý.
- `game/js/engine.js`: `G.newWeapon` nhận thêm tham số thứ tư và tạo `family`, `rarity`, `gold`, `affixes`, `power`, `title`; thêm `G.linkTier`, `G.fitAffixes`; `G.fixSave` nâng cấp bản lưu cũ; bản lưu có thêm `bossGold`.
- `game/js/moves.js`: bảng `G.HE` viết lại theo đặc trưng (bỏ `G.HE.k` và các số tăng theo cấp); `finish`, `M.onHit`, `M.onKill`, `M.arrowHit`, `M.special` kiểm tra cấp; thêm "Nổ lan"; tầm giáo; `w.affix` đổi thành `G.wHas`.
- `game/js/fx_he.js`: thêm hình "Nổ lan" (`heBoom`), 9 dòng, và 2 dòng ghi chú đầu file.
- `game/js/art.js`: `A.weaponLook` lấy màu từ `G.RARITY`; `A.weaponIcon` gọi `G.weaponArt.icon` và nhận thêm cỡ, tâm trạng.
- `game/js/hero_tinhlinh.js` (thêm 56 dòng, sửa 5 dòng): gọi `G.weaponArt` đúng dòng và bậc; thêm tư thế lấy đà (`hold`) và quét vòng (`sweep`); tư thế lộn theo hướng; chọn tư thế theo `P.mv`; vũ khí nhăn mặt sau khi bé trúng đòn.
- `game/js/village.js`: màn Xem vũ khí mới; mục Nâng bậc bốn nấc; hình hero ở màn chọn hero; nút Xem ở Trang bị; thêm trang hướng dẫn thứ ba; lưới lò rèn xếp món đang mang và bậc cao lên đầu.
- `game/tests/setup.js`: bản lưu thử không có dòng phụ ngẫu nhiên. `game/tests/moves.py`: sửa 9 mục theo luật mới, thêm 1 mục. `game/tests/ghep.py`, `game/tests/ghep_shots.py`: mới.
- Không sửa: `weapon_art.js`, `btn_art.js`, `boss.js`, `fx.js`, `env_art.js`, `hero_art.js`, `main.js`, `build.py`, `bot.js`.

## 5. Kết quả từng bài kiểm tra (lần chạy cuối)

| Bài | Kết quả |
| --- | --- |
| `rules.py` | 82/82 đạt |
| `moves.py` | 89/89 đạt (9 mục đã sửa theo luật mới: Mầm không còn luật hệ, số của đặc trưng đổi) |
| `ghep.py` (mới) | 109/109 đạt |
| `fuzz.py` | 0 lỗi |
| `fx_check.py` | 0 lỗi |
| `ui_input.py all` | 93/93, 93/93, 84/84, 93/93 đạt |
| `ui_robust.py` | 17/17, 1/1, 16/16 đạt |
| `ui_build.py` | đạt; `dist/linh-khi.html` và `dist/artifact.html` nạp được và chơi được (93/93) |
| `env_rooms.py` | 90 phòng, 0 lỗi |
| `anim_smoke.py` | không lỗi |
| `smoke.py` | không lỗi game; chỉ báo không tải được phông chữ từ mạng, như trước |
| `dps.py 90 16` (phòng dài) | đạt: bốn vũ khí lệch 3%, ba hệ lệch 9% |
| `dps.py 90 16 nho` (phòng nhỏ) | KHÔNG đạt: bốn vũ khí lệch 17% (ngưỡng 15%), ba hệ lệch 13% |
| `perf.py --so` (so với nhánh gốc) | đạt: trung bình bằng 99% đến 102% bản gốc qua hai lần đo; trường hợp chậm nhất bằng 113% đến 119% |
| `campaign.py`, 9 lượt | 1 lần thua trong 9 lượt; trung bình 50 phút mỗi lượt (nhánh gốc: 2 lần thua, 53 phút) |

`ghep.py` kiểm tra: nâng cấp bản lưu cũ (15 mục), bốn bậc (hệ số, mốc cao nhất, dòng phụ, dòng mạnh, nâng bậc giữ tiến hóa), vũ khí rơi (rương không ra Vàng, trùm ba vùng rơi Vàng lần đầu với 6 hạt giống mỗi vùng, đánh lại ra Tím hoặc Vàng), đặc trưng theo cấp cho cả ba hệ (Mầm chưa có luật, Thành hình có đặc trưng 1 và chưa có đặc trưng 2, Thức tỉnh có cả hai, bậc Thường dừng ở Thành hình), thông báo khi mở, né theo hướng cuối, hình hero và nút mới.

Đo sát thương phòng dài (sát thương mỗi giây, hero cấp 10, vũ khí Lam mài +3):

| | Chưa có hệ | Lửa | Độc | Băng |
| --- | --- | --- | --- | --- |
| Kiếm | 47,4 | 60,9 | 66,4 | 53,8 |
| Cung | 49,3 | 77,2 | 82,4 | 71,1 |
| Giáo | 47,1 | 62,3 | 69,8 | 56,7 |
| Búa | 46,7 | 55,3 | 53,6 | 47,7 |

## 6. Chỗ còn yếu

1. **Phòng nhỏ: cung yếu hơn ba vũ khí kia.** Trong sân 208 điểm ảnh, cung 54,3 so với trung bình 65,9. Nhánh gốc đã lệch 15,1%; nay 17% vì giáo được nới tầm. Nên chỉnh khi ghép `claude/phong-vuong`, lúc đã có phòng thật.
2. **Game dễ hơn một chút.** Bot qua 15 ải nhanh hơn khoảng 5% và thua ít hơn (1 so với 2 trong 9 lượt). Lý do: món Vàng x1,5 có từ trùm vùng 1, và mốc tiến hóa cộng thêm chỉ số. Mức lệch nhỏ và dao động giữa các lượt lớn (44 đến 60 phút), nên tôi chưa chỉnh số.
3. **Cung có hệ vẫn mạnh nhất, búa Băng yếu nhất**, như nhánh gốc đã báo.
4. **Mầm nay yếu hơn trước** vì mất phần luật hệ 50% cũ. Đây là đúng cách chia đã chốt, nhưng người chơi sẽ thấy quãng 30 đến 120 dấu ấn ít thay đổi hơn.
5. **Lưới vũ khí ở lò rèn chỉ hiện 12 món.** Khi rương đầy mà nhận thêm vũ khí Vàng thì có món thứ 13; món bậc thấp nhất sẽ không hiện ở lò rèn (vẫn hiện ở Trang bị, có lật trang).
6. **Giáo quét vòng** dùng cách ép bẹt hình vũ khí theo chiều ngang. Nhìn được ở tốc độ thật nhưng vài khung hình mặt vũ khí bị méo.
7. **Tư thế giữ giáo lấy đà** gần giống tư thế đứng; chỉ có vòng nạp và vạch trên đầu cho biết đang lấy đà.
8. **Vạch lấy đà trên đầu** có lúc đè lên đầu búa đang giơ cao.
9. **Chữ "Né" ở ải hướng dẫn** chạm nhẹ vào thẻ giá của nút Đặc biệt. Ải thường không hiện chữ nên không sao.
10. **Biểu tượng vũ khí nhỏ** (17 điểm ảnh trong danh sách, 11 trong bảng kết quả) mất bớt nét, nhất là giáo và cung.
11. **Hình nút chưa theo từng dòng vũ khí**, chỉ theo loại và hệ, như nhánh nút bấm đã báo.
12. **Chưa thử trên điện thoại thật.** Mọi thứ mới chạy trên Chromium của máy kiểm tra.
13. Cánh và đồ đeo lưng của em bé chưa có chỗ lưu trong bản lưu, như nhánh hero đã báo. Tôi không thêm.
