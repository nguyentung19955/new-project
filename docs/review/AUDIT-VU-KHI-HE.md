# AUDIT VŨ KHÍ, HỆ, NHỊP ĐÁNH VÀ TRÙM — Linh Khí

Phiên `au-vu-khi-he`, ngày 10/10/2026, trên nhánh `khoi-tao-du-an` (sau commit `7d4774d` + các audit khác).
**Phiên này chỉ kiểm tra, không sửa một dòng nào trong `game/js`, `index.html`, `build.py`.**
Phiên này lấp chỗ trống giữa hai phiên khác: không làm lại phòng, tiến triển, cấp, cây kỹ năng, linh khí theo thời gian chơi, bốn em bé, bảng vàng (đã có ở `AUDIT-VONG-LAP.md`); không đo độ trễ nút, bất tử khi né, tự ngắm, "báo trước so với thời gian chạy thoát", "trùm học theo bạn" (phần của `au-chien-dau`). Các số st/giây (sát thương mỗi giây) dưới đây là **đo riêng của phiên này**, không thay số của `tests/dps.py` hay của phiên `au-chien-dau`.

## 0. Đọc nhanh (cho chủ dự án)

- **Đánh trúng, đánh hụt, chí mạng, kết liễu nhìn khác nhau rõ** (đã chụp ảnh). Chỗ còn thiếu là **âm thanh**: chí mạng, đánh vào khiên và đánh thường cùng một tiếng "bộp"; đánh vào mặt khiên chỉ hiện số màu xám nhỏ.
- **Đứng một chỗ bấm đánh liên tục KHÔNG thắng được trùm**: bot "không né" thua 0 trên 8 lượt ở cả 6 trận trùm đã thử, bot có né thắng phần lớn. Ở phòng quái thường, đứng đánh nhanh hơn khoảng 20–25% nhưng mất máu gấp 3–5 lần. Tức là game **đã thưởng cho việc né**, bằng cách phạt nặng việc không né.
- **Phần thưởng riêng cho cú né thì gần như không có**: "Nhát lướt" của kiếm (đánh ngay sau khi né) chỉ thêm khoảng 3% sát thương; giáo, cung, búa không có gì.
- **Búa chưa đúng vai "nện cả đám"**: đánh một con thì búa mạnh ngang kiếm, nhưng giữa đám quái búa yếu nhất (kém kiếm khoảng 30%) vì **gần một nửa nhát búa bị bỏ dở** khi phải lăn né giữa lúc đang giơ búa (kiếm chỉ 11%).
- **Kiếm và giáo cho số gần như giống hệt nhau**; khác nhau ở tầm đánh và chiêu riêng. Cung yếu nhất là có chủ ý (an toàn nhất).
- **Ba hệ chơi khác nhau thật**, không chỉ khác màu: Độc cộng dồn và lây (mạnh nhất về sát thương), Băng làm chậm rồi đóng băng (quái gần như đứng yên, bé ít mất máu nhất), Lửa đốt và nổ dây chuyền. Nhưng **Lửa yếu nhất cả khi đánh đám đông**, trái với câu gợi ý trong game "Lửa hợp với bầy quái".
- **Ba mốc tiến hoá cảm nhận được**: so với vũ khí chưa có hệ, Mầm mạnh thêm 4–14%, Thành hình 22–50%, Thức tỉnh 47–77% (đánh đám 5 quái).
- **Trùm nhỏ ở vùng Lâu đài cổ đánh mạnh hơn cả Hồ Tinh**: mỗi đòn của trùm nhỏ ải 3-1 đến 3-4 (Hổ Lửa) mạnh gấp 1,5–2,2 lần đòn của Hồ Tinh, và **một đòn giết bé từ đầy máu** khi bé vừa đủ Sức mạnh khuyên dùng. Nguyên nhân nằm ở bảng số trong `data.js`.
- **"Sau chiêu lớn trùm choáng một lúc"** (hướng dẫn ở Cụ Đồ nói vậy) **chỉ xảy ra ở pha cuối** (dưới 1/3 máu); hai pha đầu và cả ba trùm nhỏ không bao giờ choáng. Giữa các chiêu vẫn có khoảng an toàn trung bình 1,2–2,3 giây.
- **Thua trùm thì bảng thua không nói trùm đang kháng hệ gì, yếu hệ gì, và chiêu nào hạ bé** — dù game đã có sẵn các thông tin này.

Ba việc nên sửa trước nằm ở phần 6.

## Cách đã đo

Mọi số đo đều chạy game thật trong Chromium không màn hình (Playwright), bot của `tests/bot.js` tự chơi, có hạt giống ngẫu nhiên nên chạy lại ra đúng số. **Thời gian là thời gian trong game.** Bot phản xạ đều và hay né hơn người thường, nên số dùng để **so sánh** giữa các vũ khí, hệ, kiểu chơi, không phải để đoán chính xác người chơi thật.

| Bài (mới, trong `game/tests/`) | Đo gì | Lệnh (chạy trong thư mục `game`) |
|---|---|---|
| `au_vu_khi.py` | Bảng từng đòn trên giấy; mỗi vũ khí: st/giây vào đám 5 quái và 1 quái máu dày, số quái trúng mỗi nhịp, % thời gian đang ra đòn, số lần né, % nhát bị bỏ dở, dấu ấn mỗi phút | `python3 tests/au_vu_khi.py 60 8` |
| `au_he.py` | Ba hệ ở bốn mốc: st/giây (tách đòn trực tiếp / cháy-độc theo nhịp / phản ứng hệ), máu mất, % quái bị khống chế, tốc độ quái, dấu ấn mỗi phút | `python3 tests/au_he.py 60 6` (thêm `VK=sword` để đo riêng một vũ khí, `MOT=1` để đánh 1 quái) |
| `au_spam.py` | Bot thường (có né) so với bot "mù nguy hiểm, không bao giờ né" trên 3 phòng quái, 2 trùm nhỏ, 3 trùm vùng | `python3 tests/au_spam.py 8` |
| `au_ne_thuong.py` | Nhát lướt của kiếm và bộ Hồ Tinh (sau né đòn kế +60%) đáng bao nhiêu | `python3 tests/au_ne_thuong.py 60 8` |
| `au_trum.py` | Chiêu của 6 trùm (độ dài, lúc vùng đỏ nổ), mô phỏng 60 giây mỗi pha: cửa sổ an toàn, % thời gian trùm "mệt", thứ tự chiêu | `python3 tests/au_trum.py 60` |
| `au_phan_hoi_shots.py` | Ảnh phản hồi đòn (hụt, thường, chí mạng, khiên, vỡ giáp, kết liễu, búa, cung) | `python3 tests/au_phan_hoi_shots.py` → `docs/review/anh/vu-khi-he/` |

Các bài chỉ đọc số. Riêng `au_ne_thuong.py` tạm tắt Nhát lướt **trong bộ nhớ trang thử** (không đụng file game) để so. Kết quả thô lưu cạnh bài: `au_*_ketqua.json`.

---

## 1. Bảng audit

Trạng thái: **A** đã xác nhận bằng code hoặc số đo · **B** có nguy cơ, cần người thật thử tay · **C** không áp dụng / không có lỗi.
Ưu tiên: **P0** chơi không được · **P1** ảnh hưởng lớn tới cảm giác đánh, cân bằng, độ rõ · **P2** đánh bóng. Độ khó: **S** vài giờ · **M** 1–2 ngày · **L** lớn.

| # | Vấn đề | TT | Bằng chứng | Ảnh hưởng người chơi | Ưu tiên | Khó | Cách sửa tối thiểu (file + hàm) | Rủi ro hồi quy | Tiêu chí xác nhận sau khi sửa |
|---|---|---|---|---|---|---|---|---|---|
| 1.1 | Phản hồi **trúng / hụt / chí mạng / kết liễu** có phân biệt bằng hình không | A (tốt) | `fx.js` `api('hit')` (dòng 605–661): 3 mức thường/nặng/chí mạng (chớp, nghiêng, nảy, tia), khựng 45/70/90/100/115 ms (dòng 659); chí mạng chớp vàng to + số vàng có "!" (`api('dmg')`); đánh hụt chỉ có vệt vung, không chớp, không số, không khựng (`moves.js` `gain` chỉ kêu khi trúng). Kết liễu: khựng 100 ms + cử động chết riêng (`api('death')` 1378). Ảnh: `phan-hoi-hut.png`, `phan-hoi-thuong.png`, `phan-hoi-chimang.png`, `phan-hoi-ketlieu.png` | Nhìn là biết trúng hay hụt, chí mạng rất nổi | — | — | — | — | — |
| 1.2 | Âm thanh không phân biệt chí mạng, khiên chặn, kết liễu | A | `engine.js` `SFX` (dòng 182–188) chỉ có một tiếng `hit`; `playerHit`/`gain` gọi `G.sfx('hit')` cho mọi loại trúng; kết liễu dùng tiếng `die` chung cho mọi quái | Trên điện thoại, mắt bận nhìn vùng đỏ: tai không giúp nhận ra chí mạng hay đánh vào khiên | P2 | S | `engine.js` thêm 2 tiếng `crit`, `block` vào `SFX`; `moves.js` `gain` và `combat.js` `playerHit` chọn tiếng theo `crit` và theo `G.mobArmor(t)>0` | Nhiều tiếng cùng nhịp khi đánh đám: giữ một tiếng mỗi nhịp như hiện nay | Nghe thử: chí mạng và đánh vào mặt khiên phát tiếng khác đánh thường; `tests/smoke.py` đạt |
| 1.3 | Đánh vào **mặt khiên** (giáp chặn 45%) chỉ có số màu xám nhỏ, cùng tia lửa như trúng thường; **vỡ giáp** thì rõ | A | `fx.js` `api('dmg')` dòng 391 (`o.m < 0.8` → số xám cỡ 7); `mobs.js` `mobOnHit` dòng 140–142 ("Vỡ giáp!" chữ vàng + mảnh văng + tiếng nổ). Ảnh `phan-hoi-giap.png` | Người mới không biết mình đang đánh vào khiên (nên vòng ra sau) | P2 | S | `fx.js` `api('hit')`: khi mục tiêu có giáp đang che (truyền cờ `blocked` từ `combat.js` `playerHit` qua `G.mobArmor`), thay tia lửa bằng một tia trắng xám bật ngược + khựng ngắn hơn | Không đổi số liệu | Ảnh `au_phan_hoi_shots.py` cảnh "giáp" thấy tia bật ngược khác cảnh "thường" |
| 1.4 | Đẩy lùi theo vũ khí | A | Đẩy thật (dời chỗ quái): chỉ **Nhát kết** của kiếm 10 điểm ảnh và **Quét vòng** của giáo 8 (`moves.js` `M.hit` dòng 534, 555). Búa **không đẩy** mà làm **choáng 0,4 giây mỗi nhát** (`combat.js` `playerHit` dòng 402) — choáng huỷ luôn đòn quái đang báo trước (`mobs.js` `G_mob.update`). Cung không đẩy. Còn lại chỉ là giật hình lúc vẽ 2–4 điểm ảnh (`fx.js` `e.fxD`) | Đây là nét riêng thật của búa ("đánh gãy đòn quái") nhưng game **không nói** ở đâu | P2 | S | `moves.js` `G.MOVE_TIPS.hammer`: thêm "mỗi nhát búa làm quái khựng, cắt ngang đòn nó đang lấy đà" | Không | Đọc dòng chỉ dẫn khi cầm búa |
| 2.1 | Đứng yên spam đánh có hơn di chuyển + né không | A (không, ở trùm) / B (phòng thường vùng 1–2) | `au_spam.py`, 8 lượt mỗi ô, bản lưu vừa đủ Sức mạnh khuyên dùng, không bình máu. **Trùm: bot không né thắng 0/8 ở cả 6 trận** (Cua Đá, Hổ Lửa, Mộc Tinh, Ngư Tinh, Hồ Tinh × kiếm và búa); bot có né thắng 2–8/8. **Phòng quái**: không né nhanh hơn 13–25% nhưng mất máu 3–25 lần nhiều hơn; ở 3-3 không né thì thua (kiếm 0/8, búa 4/8). Xem phần 5 | Người chơi bắt buộc phải né ở trùm và vùng 3; ở vùng 1–2 có thể "đánh lì" qua phòng thường rồi hồi máu ở suối | P2 | — | Không cần sửa thêm (đã đúng hướng) | — | Giữ nguyên: chạy lại `au_spam.py` sau mỗi lần đổi cân bằng, spam vẫn 0/8 ở trùm |
| 2.2 | Phần thưởng **riêng** cho cú né (đánh sau né, phản công) yếu | A | `au_ne_thuong.py` (60 giây × 8): kiếm có Nhát lướt 75,4 st/giây, **tắt Nhát lướt 72,9** (chỉ +3%) dù bot dùng 33 lần/phút; giáo, cung, búa không có cơ chế nào sau né. Bộ Hồ Tinh (sau né đòn kế +60%, `combat.js` dòng 636) cho +15% kiếm, +13% búa nhưng là đồ trang phục cuối game. `moves.js` `glide` dòng 42: x1,4, cửa sổ 0,35 giây, lướt 30 điểm ảnh | Né chỉ là "để khỏi chết", không có khoảnh khắc "né đẹp rồi đánh trả" | P2 | S | `moves.js` `G.MOVES.sword.glide`: mult 1,4 → 2,0 và tính là đòn nặng (khựng, chớp) — chỉ đổi số; muốn mở rộng cho vũ khí khác thì làm sau khi có người thật thử | Kiếm mạnh lên chút: chạy `tests/dps.py` (cận chiến lệch ≤ 15%) | `au_ne_thuong.py`: có/không Nhát lướt chênh ≥ 8%; `tests/dps.py` vẫn đạt |
| 3.1 | **Búa yếu nhất khi đánh đám** vì nhát búa bị bỏ dở | A | `au_vu_khi.py`: 1 quái: búa 43,4 = kiếm 43,5; **đám 5 quái: búa 56,1, kiếm 80,1 (−30%)** dù búa trúng nhiều quái nhất (2,22 quái mỗi nhịp, kiếm 1,67). **49% nhát búa bị huỷ trước lúc chạm** ở đám (kiếm 11%, giáo 15%, cung 18%): nhát búa dài 0,8 giây, chạm ở 0,36 giây (`combat.js` `updatePlayer` dòng 683: chạm khi còn 55% thời gian); lăn né huỷ nhát đang vung (`combat.js` dòng 650 `P.atkT = 0`). Lấy đà nấc 2 còn chậm hơn: 1,7 giây/nhát, 15,6 st/giây mỗi quái so với nện thường 26,6 | Đúng chỗ búa nên toả sáng (đám đông) thì cảm giác búa "cứ vung mà không trúng" | P1 | S | Cho riêng búa chạm sớm hơn trong động tác: `moves.js` `hammerTap` truyền `hitAt: 0.35` vào `begin`, `combat.js` `updatePlayer` dòng 683 dùng `P.hitAt` (mặc định 0,55 như cũ). Không đổi thời lượng và sát thương trên giấy | Hình nện phải khớp lúc chạm mới (`hero_art.js` giữ khung trúng 43–53% động tác): cần xem ảnh; `tests/dps.py` | `au_vu_khi.py`: búa đám %huỷ ≤ 30%, st/giây đám ≥ 85% kiếm; 1 quái không vượt kiếm quá 10%; `tests/dps.py` đạt |
| 3.2 | Kiếm và giáo cho số gần như trùng nhau | A (số) / B (cảm giác) | `au_vu_khi.py`: đám 80,1 vs 72,5; 1 quái 43,5 vs 41,0; quái/nhịp 1,67 vs 1,71; % ra đòn 57% vs 62%. Khác nhau thật ở cơ chế: tầm 32–40 vs 60–62; giáo có Quét vòng 3/4 vòng + Xốc tới **bất tử 0,16 giây** (`moves.js` `spearLunge` dòng 426) + Phi Thương ghim quái; kiếm có Nhát lướt sau né + Trảm Nguyệt | Người chơi có thể thấy hai món "na ná", chỉ khác dài ngắn | P2 | — | Chưa cần đổi số; nếu người thật thấy giống nhau, đẩy giáo về "giữ khoảng cách": tăng tầm Đâm 60 → 66 hoặc thêm đẩy lùi nhẹ ở nhát đâm thứ 3 | — | Hỏi 3–5 người chơi thử: tả được khác nhau giữa kiếm và giáo không |
| 3.3 | Tích dấu ấn nhanh chậm khác nhau 2,3 lần theo loại vũ khí | A | `au_vu_khi.py`, vũ khí Mầm Lửa, đánh đám: kiếm **9,5** dấu ấn/phút, giáo 7,8, cung 5,9, **búa 4,1**. Lý do: tỉ lệ gây hệ tính **mỗi nhát** (`combat.js` `playerHit` dòng 404–410, `G.PROC` 20% ở Mầm) nên vũ khí chậm gây hệ ít, ít quái chết khi đang dính hệ | Cầm búa lên Thành hình chậm hơn kiếm hơn gấp đôi thời gian đánh quái thường | P2 | S | `combat.js` `playerHit`: nhân tỉ lệ gây hệ theo nhịp vũ khí, ví dụ `chance *= T.cd / 0.36` kẹp tối đa 1 (búa x2,2, giáo x1,2, cung x1,4) | Búa có hệ mạnh lên (hệ gây thêm sát thương): chạy `tests/dps.py`, `tests/linhkhi.py` | `au_vu_khi.py`: dấu ấn/phút Mầm Lửa của búa ≥ 70% kiếm |
| 3.4 | Vũ khí **Trắng** không nhận dấu ấn từ đánh thường | A (có chủ ý) / C | `combat.js` `G.activeEl` dòng 137–141: Trắng không có hệ, nên quái thường bị kết liễu không cho dấu ấn (`au_vu_khi.py`: 0,0 dấu ấn/phút khi Trắng). 30 dấu ấn đầu đến từ tinh anh (5), trùm (10/20), vật mang hệ trong phòng, bùa hệ ở rương. Hướng dẫn đã ghi "Đây là cách gây hệ khi vũ khí còn trắng" (`village.js` mục "Vật trong phòng") | Vòng "đánh thường → dấu ấn" chưa chạy ở 1–2 ải đầu của mỗi vũ khí mới; nối với 5.4b của AUDIT-VONG-LAP (đổi vũ khí về 0) | — | — | Không đề xuất riêng; xem đề xuất 5.4b của AUDIT-VONG-LAP | — | — |
| 4.1 | Ba hệ khác nhau về **cách chơi** hay chỉ khác màu | A (khác thật) | Xem phần 3. Lửa: cháy 3 giây không cộng dồn, nổ dây chuyền khi quái cháy chết. Độc: cộng dồn tới 5 tầng, mỗi tầng quái nhận thêm 4% sát thương và mất 9% giáp, lây khi chết. Băng: mỗi tầng chậm 15%, đủ 5 tầng **đóng băng 1,5 giây** (quái đóng băng bị huỷ đòn đang lấy đà), rồi miễn 5 giây; Băng còn làm Độc tan chậm một nửa (`combat.js` `tickStatus` dòng 321) — tương tác ẩn, không ghi ở đâu | Có lý do để chọn hệ theo đối thủ | — | — | — | — | — |
| 4.2 | **Lửa yếu nhất, kể cả khi đánh đám** — trái với gợi ý "Lửa hợp với bầy quái" | A | `au_he.py` đám 5 quái, Thức tỉnh, trung bình 4 vũ khí: **Độc 119,4, Lửa 104,1, Băng 99,2** (Băng bù bằng khống chế 63% và mất máu ít nhất). Riêng từng vũ khí, Lửa thua Độc ở **cả 4** (kiếm 112 vs 124, cung 91 vs 110, giáo 112 vs 127, búa 102 vs 111). 1 quái: Độc 64,6, Băng 60,2, Lửa 54,6. Gợi ý ở `data.js` `G.HINTS[4]` dòng 332 | Người chơi chọn Lửa để đánh bầy theo lời khuyên lại nhận hệ yếu nhất | P1 | S | `moves.js` `G.HE.fire`: Nổ lan `boom` 0,5 → 0,7 và `boomR` 34 → 42 (chỉ đặc trưng 2, chỉ lan khi quái chết đang cháy — đúng vai "bầy") ; HOẶC sửa câu `G.HINTS[4]` cho đúng số đo | `tests/dps.py` (ba hệ lệch ≤ 15%), `tests/cay.py` (đổi số cân bằng) | `au_he.py` đám 5 quái Thức tỉnh: Lửa ≥ Độc; `MOT=1` (1 quái): Lửa vẫn < Độc; `tests/dps.py` đạt |
| 4.3 | Băng trên búa yếu | A | `VK=hammer python3 tests/au_he.py 60 6`: búa Băng Thức tỉnh 79,6 (búa Độc 110,8; cung Băng 107,2), khống chế 52% (vũ khí khác 65–76%). Búa ít nhát nên ít tầng Băng | Ít người chọn; ổn nếu coi là "không hợp" | P2 | S | Đi cùng 3.3 (tỉ lệ gây hệ theo nhịp) | Như 3.3 | Búa Băng Thức tỉnh ≥ 90% búa Độc |
| 4.4 | Phản ứng hệ (Nổ khói, Sốc nhiệt) gần như không xảy ra khi chơi một hệ | A | `au_he.py` cột "phản" = 0 ở mọi dòng: phản ứng cần **hai hệ trên cùng con quái**, mà chưởng **không** kết hợp với vũ khí (`combat.js` `applyStatus` dòng 258–260, `chuong.js` đầu tệp). Muốn có phản ứng phải mang 2 vũ khí khác nhánh rồi đổi qua lại, hoặc đánh vỡ vật mang hệ khác | Câu "Lửa gặp Độc gây Nổ khói" dễ hiểu là Hỏa chưởng + vũ khí Độc cũng được; hướng dẫn mục Chưởng có ghi "không kết hợp hệ với vũ khí" nhưng nằm ở trang khác | P2 | S | `data.js` `G.HINTS[5]`: thêm "(giữa hai vũ khí khác hệ, đổi vũ khí khi quái còn dính hệ cũ)" | Không | Đọc trang "Ba hệ" ở Cụ Đồ |
| 4.5 | Mốc tiến hoá 30/120/300 có cảm nhận được không | A (có) | `data.js` `G.STAGE_MULT` [1; 1,04; 1,08; 1,12], `G.PROC` [0; 20%; 50%; 100%] (dòng 46–47); đặc trưng 1 mở ở Thành hình, đặc trưng 2 ở Thức tỉnh (`moves.js` `G.HE`). Đo `au_he.py` (đám): so với Trắng 67,6 → Mầm +4% đến +14%, Thành hình +22% đến +50%, Thức tỉnh +47% đến +77%; Băng: khống chế 37% → 57% → 63%. Có chữ báo "đạt mốc ... Mở đặc trưng ..." (`combat.js` `G.addMarks` dòng 54–59) | Mầm hơi nhạt (Băng Mầm chỉ +4%), Thành hình là bước nhảy rõ | P2 | — | Không cần sửa | — | — |
| 5.1 | "Trùm choáng sau chiêu lớn" chỉ có ở pha 3; trùm nhỏ không bao giờ choáng | A | `boss.js`: `tire()` chỉ gọi trong chiêu `c5` (dòng 146, 171, 205), mà `c5` chỉ mở khi pha ≥ 2 (dòng 216). Trùm nhỏ (`thinkMini`) không có `tire`. `au_trum.py`: % thời gian trùm "mệt" = 0% ở pha 1, 2 của cả 3 trùm vùng và mọi pha của 3 trùm nhỏ; 9–12% ở pha 3. Hướng dẫn `village.js` dòng 625 nói "sau chiêu lớn trùm choáng một lúc, đó là lúc đánh mạnh nhất" | Hai phần ba trận trùm không có khoảnh khắc "trùm hở, xông vào đánh"; người chơi đọc hướng dẫn rồi chờ mà không thấy | P1 | S | `boss.js` `SK`: thêm `later(b, D, () => tire(b, 1.0))` vào một chiêu dài có từ pha 1 của mỗi trùm vùng (Mộc Tinh `c3` Mưa quả độc, Ngư Tinh `c2` Sóng thần, Hồ Tinh `c4` Vòng lửa ma); `thinkMini`: `tire(b, 0.8)` sau `chieu1` | Trận trùm ngắn lại chút: `tests/campaign.py`, `tests/cay.py` | `au_trum.py`: % mệt 5–12% ở mọi pha của trùm vùng, > 0 ở trùm nhỏ; `tests/cay.py` vẫn đạt |
| 5.2 | **Trùm nhỏ vùng 3 (và ải 2-1) đánh mạnh hơn trùm vùng; một đòn giết bé** | A (số) / B (người thật) | `data.js` `G.STAGE_K.boss` (dòng 216) **giống hệt** `G.STAGE_K.mob`, mà sát thương trùm = sát thương quái thường của ải × hệ số `boss` (`boss.js` `makeBoss` dòng 59) → hệ số bị nhân hai lần. Sát thương gốc mỗi đòn (đo): Hồ Tinh 3-5 **232**; trùm nhỏ 3-1 **371**, 3-2 357, 3-3 **412**, 3-4 **506**; ở vùng 2, trùm nhỏ 2-1 (104) mạnh hơn trùm nhỏ 2-2 (71) và gần Ngư Tinh (155). Bé vừa đủ khuyên dùng ở 3-3 có ~341–355 máu, giảm 6–18% (`AUDIT-VONG-LAP` 3.2 và đo riêng) → đòn thường của Hổ Lửa ×1,2–1,4 = **chết ngay từ đầy máu**. `au_spam.py`: bot không né ở Hổ Lửa 3-3 trúng **đúng 1 đòn** là gục (8/8 lượt) | Người chơi thua trùm nhỏ vì một đòn, khó hiểu "sao trùm nhỏ ác hơn trùm vùng" | P1 | S | `data.js` `G.STAGE_K.boss`: đặt riêng cột sát thương cho trùm nhỏ vùng 3 để đòn gốc ≈ Hồ Tinh hoặc thấp hơn (ví dụ 4,54 → 2,6; 4,28 → 2,6; 4,43 → 2,7; 4,74 → 2,9), và 2-1 2,95 → 2,0. Giữ cột máu | Ải 3-1..3-4 dễ hơn: chạy `tests/cay.py` (đổi số cân bằng) và cập nhật `G.STAGE_REC` nếu cần | Đòn gốc trùm nhỏ ≤ đòn gốc trùm vùng cùng vùng; ở Sức mạnh khuyên dùng, đòn gốc ≤ 45% máu bé; `au_spam.py` bot không né ở Hổ Lửa cần ≥ 2 đòn mới gục; `tests/cay.py` đạt |
| 5.3 | Ngư Tinh, Hồ Tinh: mỗi đòn mất ~50–60% máu | A (số) / B | Đo riêng (bản lưu vừa đủ khuyên dùng, chưa có trang phục): đòn gốc Ngư Tinh = 49% máu bé, Hồ Tinh 61%, Mộc Tinh 20%. `au_spam.py` bot có né: Ngư Tinh thắng 2–3/8, mất 70–82% máu sau trung bình 1,5–1,8 lần trúng | Hai lần sơ ý là thua; trùm vùng 2 khó hơn vùng 3 với bot | P2 | — | Chưa đổi: phiên `au-chien-dau` đo "báo trước so với thời gian chạy thoát"; nếu đòn né được thì giữ, nếu không thì giảm đòn chính chứ không giảm báo trước | — | Đợi kết quả AUDIT-CHIEN-DAU |
| 5.4 | Mẫu chiêu: học được hay ngẫu nhiên | A (cân bằng tốt) | `boss.js` `choose` (dòng 100): bốc ngẫu nhiên, **không lặp chiêu vừa dùng**. Trùm vùng: pha 1 có 3 chiêu → luôn đoán được "một trong hai"; pha 2 có 4, pha 3 có 5. Trùm nhỏ đứng xa chỉ có 2 chiêu nên **luân phiên đúng chiêu 1 ↔ chiêu 2** (`au_trum.py` thứ tự chiêu), lại gần thì thêm đòn vồ. Mỗi chiêu có cử động riêng và vùng đỏ | Đủ để học; trùm nhỏ hơi dễ đoán | — | — | Không cần sửa | — | — |
| 5.5 | Có đòn trùm **không đọc được / không có báo trước** không | C (trong phạm vi phiên này) | Mọi đòn trùm đi qua vùng đỏ có thời gian (`G.mobZone`, `G.zoneCircle` với `t` > 0) hoặc đạn có chớp đỏ lúc rời tay (`fx.js` `stepProjs`). Thân trùm lao (`lunge`) không gây sát thương riêng. Bùa bay, hồ hoả đuổi theo bay chậm hơn bé (44 và 40 so với bé 72 điểm ảnh/giây). Ngắn nhất: Hồ Tinh "Vồ mồi" báo trước 0,44 giây (pha 3: 0,37 giây). Việc **chạy thoát kịp không** thuộc phiên `au-chien-dau` | — | — | — | — | — | — |
| 6.1 | Thua trùm: bảng thua không nói trùm kháng hệ gì, yếu hệ gì, chiêu nào hạ bé | A | `stage.js` `panelLose` (dòng 1156–1185): chỉ có Sức mạnh, gợi ý nâng cấp, khối linh khí. Thông tin có sẵn: `S.layers` + `G.layerText` (đang hiện lúc vào phòng trùm, dòng 268), `b.weak`, tên chiêu trong `boss.js` `SK[...].name`. Bổ sung cho đề xuất 4.5b của AUDIT-VONG-LAP (nguồn mất máu) | Không biết nên đổi sang vũ khí hệ nào, né chiêu nào | P1 | S–M | `boss.js` `thinkBig`/`thinkMini`: ghi `b.skillName`; `combat.js` `G.hurtPlayer`: nếu `src === W.boss` hoặc vùng có `src` là trùm thì ghi `W.lastHurt = { name: b.skillName, amt }`; `stage.js` `panelLose`: thêm một dòng "Trùm kháng Lửa, yếu Băng · Bé gục vì: Vồ mồi (Hồ Tinh)" | Chữ dài trên bảng nhỏ: dùng `ui.wrap` 1 dòng | Ảnh bảng thua sau khi thua Hồ Tinh có dòng tên chiêu và hệ kháng/yếu |

---

## 2. Bốn vũ khí

Số "trên giấy" là sát thương gốc của loại vũ khí (chưa tính cấp, bậc, mài). Số "đo" là bot, Thợ Rèn cấp 10, vũ khí Lam +3, chưa có hệ, phòng thường, quái mới (máu ×2,5), 60 giây × 8 hạt giống (`au_vu_khi.py`). "Bị huỷ" = nhát đã bắt đầu vung mà bị bỏ dở trước lúc chạm (gần như luôn do lăn né).

| | Kiếm | Cung | Giáo | Búa |
|---|---|---|---|---|
| Vai trò thật (theo code + số đo) | Nhanh, tầm ngắn, ít cam kết; đánh liên tục, né thoải mái | An toàn, đánh xa, yếu nhất có chủ ý | Tầm dài cận chiến, quét vòng, lao bất tử | Chậm, nặng, **mỗi nhát làm quái khựng 0,4 giây** (cắt đòn quái) |
| Nhịp đòn thường | 0,30 / 0,30 / 0,46 giây (chuỗi 3) | 0,38 giây đứng yên, 0,45 vừa chạy | 0,38 / 0,34 / 0,34 / 0,52 (3 đâm + quét) | 0,80 giây |
| Lúc chạm trong động tác | 0,135 / 0,135 / 0,21 giây | tên rời dây 0,17 giây | 0,15–0,23 giây | **0,36 giây** |
| Sát thương mỗi nhát (giấy) | 9 / 9,5 / 16,2 | 11,4 (tên xuyên: con sau 35%) | 11,8 ×3 / 19,8 | 21,3 |
| Tầm (điểm ảnh) | 32–40 | 180 (tên mạnh 250) | 60–62, quét vòng 44 | 32 |
| Khoá người khi ra đòn | Đi chậm còn 40% trong lúc vung (mọi vũ khí, `combat.js` dòng 640); **Né huỷ được mọi đòn thường bất cứ lúc nào**, trừ lúc đang lướt/lao (Nhát lướt, Xốc tới) (dòng 589–611, 648–650) | như trái | như trái | như trái; giữ lấy đà đi chậm còn 45% |
| Đòn giữ rồi thả | không có (giữ = chuỗi liên tục) | Tên mạnh 34,2, xuyên 2 | Xốc tới 23,5, **bất tử 0,16 giây** | Nện đất nấc 1: 21,3 vòng 30 + sóng; nấc 2: 26,6 vòng 38, choáng 0,7 + sóng |
| Đẩy lùi | Nhát kết 10 | không | Quét vòng 8 | không (thay bằng khựng 0,4 giây) |
| Đòn Đặc biệt (25 mana) | Trảm Nguyệt: vệt xuyên mọi quái, 18 → mỗi con sau ×0,7 | Mưa Tên: 3,9 × ~6 đợt vòng 40 | Phi Thương: 17,1 xuyên hàng, ghim con cuối choáng 1 giây, giáo bay về trúng lần nữa (trong lúc đó nút Đánh là cú đấm yếu) | Địa Chấn: vòng chấn 21,3 + vệt nứt 44,7 choáng 0,9 |
| Sau né | **Nhát lướt** ×1,4 (cửa sổ 0,35 giây) | — | — | — |
| **Đo:** st/giây đám 5 quái | **80,1** | 55,7 | 72,5 | 56,1 |
| **Đo:** st/giây 1 quái | 43,5 | 35,0 | 41,0 | **43,4** |
| **Đo:** số quái trúng mỗi nhịp | 1,67 | 1,77 | 1,71 | **2,22** |
| **Đo:** % nhát bị huỷ (đám / 1 quái) | 11% / 9% | 18% / 10% | 15% / 8% | **49%** / 18% |
| **Đo:** máu mất mỗi giây (đám) | 2,75 | 2,06 | 2,64 | 2,32 |
| **Đo:** dấu ấn/phút ở Mầm Lửa (đám) | **9,5** | 5,9 | 7,8 | **4,1** |

**Kết luận.**
- Vòng đánh của 4 vũ khí **khác nhau thật về cơ chế** (chuỗi nhanh + lướt; bắn xa xuyên; tầm dài + lao bất tử + ném giáo; khựng quái + nện vòng), không chỉ khác số. Kiếm và giáo cho **số** gần như trùng nhau, khác ở tầm và chiêu.
- **Kiếm đang lấn át** khi đánh đám (cao nhất, ít bị huỷ nhất, tích dấu ấn nhanh nhất). **Búa bị thiệt** đúng ở chỗ nó nên mạnh, vì nhát búa chạm muộn nên hay bị huỷ khi phải né. Cung thấp nhất là chủ ý của thiết kế (an toàn), máu mất ít nhất xác nhận điều đó.
- Chỉ đề xuất hai thay đổi cần thiết: **búa chạm sớm hơn trong động tác** (3.1) và **tỉ lệ gây hệ theo nhịp vũ khí** (3.3). Không đề xuất đổi sát thương trên giấy.

---

## 3. Hệ và mốc tiến hoá

### 3.1. Đánh thường → dấu ấn → tiến hoá → chưởng (sơ đồ chữ)

```
 Nút Đánh / Đặc biệt (vũ khí đang cầm)
   │  mỗi nhát trúng: tỉ lệ gây hệ của vũ khí = 0% (Trắng) / 20% (Mầm) / 50% (Thành hình) / 100% (Thức tỉnh)
   │  (bùa hệ ở rương: 100% trong 60 giây; vật mang hệ trong phòng: gây hệ cho quái đứng gần)
   ▼
 Quái dính hệ (Cháy / Độc n tầng / Băng n tầng, đóng băng)
   │  quái thường CHẾT khi đang dính hệ do vũ khí gây  → +1 dấu ấn hệ đó cho vũ khí kết liễu
   │  tinh anh +5, trùm nhỏ +10, trùm vùng +20 (luôn có; không dính hệ thì theo hệ của vùng)
   │  Thợ Rèn ×1,2 · Lời nguyền ×2
   ▼
 Dấu ấn của TỪNG vũ khí:  30 → khoá nhánh hệ, Mầm   │ 120 → Thành hình (mở đặc trưng 1)   │ 300 → Thức tỉnh (đặc trưng 2)
   │  sát thương gốc ×1,04 / ×1,08 / ×1,12             │ Lửa: Vệt cháy · Độc: Vũng độc · Băng: Gai băng (nhát kết, đòn giữ-thả, Đặc biệt)
   │  (bậc Thường dừng ở Thành hình)                   │ Thức tỉnh: Nổ lan · Lây độc · Băng vỡ
   ▼
 Phản ứng hệ: chỉ khi HAI hệ do vũ khí gây nằm trên cùng con quái (Lửa+Độc = Nổ khói, Lửa+Băng = Sốc nhiệt)

 Nút Chưởng (cây Hỏa / Độc / Băng, điểm chưởng theo cấp) ── chạy SONG SONG, tách rời:
   không cho dấu ấn, không gây phản ứng với hệ của vũ khí, không kích đặc trưng Thức tỉnh của vũ khí
```

### 3.2. Hiệu ứng thật trong code

| Hệ | Khi quái dính | Đặc trưng 1 (Thành hình) | Đặc trưng 2 (Thức tỉnh) | Tên (cung) | Nguồn |
|---|---|---|---|---|---|
| Lửa | Cháy 3 giây, **không cộng dồn** (lấy mạnh nhất), 20% sát thương đòn mỗi giây | Nổ nhỏ 30% vòng 28 + **vệt cháy** 2,4 giây (quái đi qua bị cháy) | **Nổ lan**: quái cháy chết thì nổ 50% vòng 34, làm cháy quái gần, nổ tiếp dây chuyền | Nổ vòng 20 khi trúng | `combat.js` `applyStatus`, `tickStatus`; `moves.js` `G.HE.fire`, `finish`, `M.onKill` |
| Độc | **Cộng dồn tới 5 tầng**, 5 giây; mỗi tầng 12% sát thương đòn mỗi giây, quái nhận thêm 4% sát thương và mất 9% giáp | **Vũng độc** 3,2 giây, +1 tầng mỗi giây | **Lây độc**: chết khi trúng độc thì lây 2 tầng sang quái quanh 34 | Tách mảnh độc | như trên, `G.damage` dòng 221–226 |
| Băng | Mỗi tầng chậm 15% (thấp nhất còn 40%), 4 giây; **đủ 5 tầng đóng băng 1,5 giây** (trùm: choáng 0,5 giây), miễn 5 giây; đóng băng/choáng **huỷ đòn quái đang lấy đà**; Băng làm Độc tan chậm một nửa | **Gai băng** mọc theo hướng đánh 55% + 1 tầng | **Băng vỡ**: quái đóng băng bị đánh thì vỡ: 70% lên nó, 90% lên quái quanh 36 + 1 tầng | Xuyên thêm 1 quái | như trên, `M.onHit`; `mobs.js` `G_mob.update` |

### 3.3. Số đo (đám 5 quái, trung bình 4 vũ khí, `au_he.py 60 6`)

| Hệ | Mốc | st/giây | trong đó: đòn / theo nhịp (cháy, độc) | máu bé mất/giây | % quái bị khống chế | tốc độ quái | dấu ấn/phút |
|---|---|---|---|---|---|---|---|
| Không hệ | Trắng | 67,6 | 66,9 / 0,2 | 2,38 | 4% | 0,96 | 0 |
| Lửa | Mầm / Thành hình / Thức tỉnh | 77,3 / 93,3 / 104,1 | 86,1 / 17,6 (ở Thức tỉnh) | 2,07 / 2,32 / 2,13 | 4% | 0,96 | 7,0 / 15,2 / 18,7 |
| Độc | Mầm / Thành hình / Thức tỉnh | 75,8 / 101,7 / **119,4** | 86,2 / **32,8** | 2,66 / 2,20 / 1,89 | 3% | 0,97 | 9,5 / 19,0 / 23,2 |
| Băng | Mầm / Thành hình / Thức tỉnh | 70,3 / 82,3 / 99,2 | 98,5 / 0,3 | 2,25 / 2,13 / **1,76** | **37% / 57% / 63%** | **0,87 / 0,72 / 0,65** | 6,8 / 12,8 / 18,3 |

Đánh 1 quái máu dày (`MOT=1`), Thức tỉnh: Trắng 40,6 · Lửa 54,6 · **Độc 64,6** · Băng 60,2 (quái bị khống chế 97% thời gian, tốc độ còn 0,30).

**Mốc tiến hoá có cảm nhận được không:** có. Mầm nhạt (+4% đến +14% st/giây, chỉ thêm 20% cơ hội gây hệ, vệt chém nhuốm màu), **Thành hình là bước nhảy rõ** (+22% đến +50%, có thứ hiện trên sân), Thức tỉnh +47% đến +77%. Có chữ báo khi lên mốc kèm tên đặc trưng mới.

**Đề xuất chọn MỘT hệ làm mẫu hoàn thiện trước: BĂNG.**
- Vì sao: Băng là hệ duy nhất **đổi cách chơi** chứ không chỉ cộng sát thương: làm chậm thấy bằng mắt, đóng băng **huỷ đòn quái** (nối thẳng vào chủ đề "đọc đòn — phản công"), bé mất máu ít nhất (1,76/giây so với 2,13 của Lửa), Băng vỡ thưởng cho việc đánh đúng lúc. Số đã gần cân (99 st/giây, kém Độc 17% nhưng bù bằng khống chế 63%).
- Cần thêm tối thiểu (không thêm hệ thống mới):
  1. **Báo "sắp đóng băng"**: game đã vẽ số tầng Băng trên đầu quái từ 2 tầng (`fx.js` dòng 915) và tinh thể quanh thân; chỉ thêm cho con số chớp trắng khi đạt 4/5 tầng để người chơi biết đánh thêm một nhát là đóng băng (`fx.js`, cùng chỗ vẽ số).
  2. **Búa Băng** đang yếu (4.3): sửa chung với tỉ lệ gây hệ theo nhịp (3.3).
  3. Ghi tương tác ẩn "Băng làm Độc tan chậm một nửa" vào trang "Ba hệ" (`data.js` `G.HINTS[5]`), hoặc bỏ nó đi cho dễ hiểu.
  4. Một dòng ở bảng thua/kết quả: "Băng: X lần đóng băng, Y đòn quái bị huỷ" (đếm trong `combat.js` `applyStatus` và `mobs.js` chỗ huỷ `e.act`) để người chơi **thấy** giá trị khống chế.
- Sau khi Băng làm mẫu xong, áp cách đo tương tự để sửa **Lửa** (hệ có bản sắc yếu nhất theo số đo, 4.2).

---

## 4. Trùm

Số trên giấy đọc từ `G.monsterArt` (thời lượng cử động, mốc "hết báo trước") và `boss.js`. "Báo trước" = từ lúc trùm bắt đầu chiêu tới lúc vùng đỏ đầu tiên nổ, ở pha 1 (pha 2 nhanh ×1,1, pha 3 ×1,2 với trùm vùng; trùm nhỏ ×1,08, ×1,16). "Nghỉ" = thời gian chờ sau khi chiêu xong (`b.cd`). **Cửa sổ an toàn** đo bằng `au_trum.py`: bé bất tử đứng yên, mỗi khung kiểm tra có vùng đỏ đang báo, tường nước, đạn của trùm hay trùm đang lao không; vũng nằm lại trên sàn không tính.

| Trùm | Chiêu (pha mở) | Báo trước (giây, pha 1) | Dài cả chiêu | Nghỉ sau chiêu (pha 1/2/3) | Cửa sổ an toàn trung bình (pha 1/2/3) | % thời gian an toàn | Trùm "mệt" (choáng, nhận ×1,5) |
|---|---|---|---|---|---|---|---|
| **Mộc Tinh** (máu 3.710, đòn gốc 39) | Quật cành (quạt rộng, cận) · Rễ đâm (hàng gai nối nhau, pha 2 thêm hàng) · Mưa quả độc (5–6 quả, để vũng độc) · Bùa bay (từ pha 2: 5 lá đuổi theo, chậm hơn bé) · Rừng gai (từ pha 3: 3 vòng có khe) | 0,84 · 0,55 (+0,09 mỗi gai) · 0,92 (+0,1 mỗi quả) · 0,88 · 0,91 (+0,38 mỗi vòng) | 2,0–2,6 | 1,3 / 1,0 / 0,8 | 2,31 / 1,97 / 2,00 | 69% / 56% / 53% | chỉ sau Rừng gai (pha 3), 1,5 giây |
| **Ngư Tinh** (7.419, 155) | Đớp (lao thẳng) · Sóng thần (tường nước có khe, pha 2 thêm tường) · Phun băng (quạt + gai làm chậm) · Mưa băng nhọn (từ pha 2: 7 chỗ quanh bé) · Xoáy nước (từ pha 3: tròn rồi vành) | 0,76 · 0,87 · 0,88 · 0,84 (+0,08 mỗi chỗ) · 0,78 (vành +0,55) | 1,9–2,6 | như trên | 1,63 / 1,86 / 1,92 | 49% / 44% / 58% | chỉ sau Xoáy nước, 1,5 giây |
| **Hồ Tinh** (8.620, 232) | Hồ hoả (5–8 cầu lửa đuổi) · **Vồ mồi** (vồ 2 lần, lần 2 nhắm lại, báo 0,5 giây) · Quạt đuôi (3 lớp trăng khuyết) · Vòng lửa ma (từ pha 2: 2 vòng cột lửa) · Bão hồ hoả (từ pha 3: 3 đợt 10 cầu, lệch khe) | 0,86 · **0,44** · 0,92 · 0,75 / 1,25 · 0,84 (+0,32 mỗi đợt) | 2,0–2,5 | như trên | **1,60 / 1,57 / 1,19** | 46% / 45% / 40% | chỉ sau Bão hồ hoả, 1,4 giây |
| Nấm Chúa (trùm nhỏ 1-3: 1.614, 28) | Hàng nấm độc · Bão bào tử (2 đợt 9 viên + vòng độc) · Phun gần (khi bé < 70) | 0,85 · 0,9 · 0,75 | 1,7–1,8 | 1,4 / 1,15 / 0,9 | 2,22 / 1,88 / 1,65 | 55% / 60% / 50% | không bao giờ |
| Cua Đá (2-3: 4.731, 90) | Đập càng (vòng 80, pha 2 thêm vành) · Mưa tinh thể (5–7 chỗ) · Kẹp gần | 0,8 · 0,9 · 0,75 | 1,6–1,8 | như trên | 1,98 / 1,48 / 1,17 | 69% / 59% / 53% | không bao giờ |
| Hổ Lửa (3-3: 10.375, **412**) | Vồ lửa (đường dài + vệt lửa) · Gầm phun lửa (quạt 112) · Vồ gần | 0,75 · 0,85 · 0,75 | 1,5–1,7 | như trên | 1,90 / 1,60 / 1,41 | 70% / 67% / 66% | không bao giờ |

- **Cửa sổ phản công có, nhưng là cửa sổ "chen giữa"**: trung bình 1,2–2,3 giây không có gì đe doạ giữa hai chiêu (gồm phần cuối cử động + thời gian nghỉ), đủ cho 3–6 nhát kiếm hoặc 1–2 nhát búa. Cửa sổ **thưởng** (trùm choáng, nhận ×1,5) chỉ có ở pha 3 (vấn đề 5.1).
- **Thứ tự chiêu**: ngẫu nhiên nhưng không lặp chiêu vừa dùng (vấn đề 5.4). Ví dụ Mộc Tinh pha 1: `c3 c1 c2 c3 c1 c2 c3 c2 c1 …`; trùm nhỏ ở xa: `chieu2 chieu1 chieu2 …`.
- **Đòn không né được / không đọc được**: không thấy trong code (5.5). Hồ Tinh "Vồ mồi" có báo trước ngắn nhất (0,44 giây, pha 3 còn 0,37) — để phiên `au-chien-dau` kết luận chạy thoát kịp không.
- **Sức nặng mỗi đòn**: một đòn gốc của Hổ Lửa (3-3) ≈ 100% máu bé vừa đủ khuyên dùng, Hồ Tinh ≈ 61%, Ngư Tinh ≈ 49%, Cua Đá ≈ 33%, Mộc Tinh ≈ 20%, Nấm Chúa ≈ 18% (vấn đề 5.2, 5.3).

---

## 5. Số đo: đứng spam so với di chuyển + né

`au_spam.py 8`: 8 lượt mỗi ô, cùng hạt giống cho hai kiểu bot; bản lưu Thợ Rèn được dựng tự động tới khi Sức mạnh vừa đạt khuyên dùng của ải (riêng Hồ Tinh chỉ đạt 488/620 vì bản lưu thử không có trang phục; bot có né vẫn thắng). Không bình máu. "spam" = bot không thấy vùng đỏ, đạn, không bao giờ bấm Né.

| Cảnh | Vũ khí | Có né: thắng · giây · % máu mất | Spam: thắng · giây · % máu mất | Spam: trùm còn lại khi bé gục |
|---|---|---|---|---|
| Phòng quái 1-3 | Kiếm | 8/8 · 34,1 · 14% | 8/8 · 26,4 · 63% | — |
| | Búa | 8/8 · 34,3 · 12% | 8/8 · 25,4 · 41% | — |
| Phòng quái 2-3 | Kiếm | 8/8 · 30,8 · 3% | 7/8 · 24,4 · 69% | — |
| | Búa | 8/8 · 25,4 · 1% | 8/8 · 21,4 · 25% | — |
| Phòng quái 3-3 | Kiếm | 8/8 · 39,3 · 28% | **0/8** · — · 99% | — |
| | Búa | 8/8 · 31,2 · 13% | 4/8 · 24,2 · 86% | — |
| Trùm nhỏ Cua Đá 2-3 | Kiếm / Búa | 8/8 · 45 / 42 giây · 16–24% | **0/8** · 100% | 69% / 55% |
| Trùm nhỏ Hổ Lửa 3-3 | Kiếm / Búa | 8/8 · 63 / 56 giây · 0–29% | **0/8**, gục sau **1 đòn** | 94% / 92% |
| Mộc Tinh 1-5 | Kiếm / Búa | kiếm 8/8 · 64 giây · 59%; búa 5/8 · 60 giây · 69% | **0/8** | 48% / 51% |
| Ngư Tinh 2-5 | Kiếm / Búa | kiếm 2/8, búa 3/8 · 46–48 giây · 70–82% | **0/8** | 79% / 78% |
| Hồ Tinh 3-5 | Kiếm / Búa | kiếm 7/8, búa 5/8 · 53–55 giây · 56–60% | **0/8** | 88% / 84% |

**Cơ chế thưởng cho né / di chuyển đang có (và đáng bao nhiêu):**
- Bất tử 0,32 giây khi lăn, hồi 1 giây (`combat.js` dòng 649) — giá trị lớn nhất: là thứ làm "có né" thắng còn "spam" thua.
- Nhát lướt của kiếm (đánh trong 0,35 giây sau né, ×1,4): **+3% st/giây** (`au_ne_thuong.py`). Rất nhỏ.
- Xốc tới của giáo: bất tử 0,16 giây khi lao — một cách "né bằng đòn đánh", chỉ giáo có.
- Bộ trang phục Hồ Tinh (sau né đòn kế +60%): +15% kiếm, +13% búa. Chỉ có cuối game.
- Trùm có lớp thích nghi "Bắt bài lăn né" khi bé né > 15 lần (`boss.js` `computeLayers`) — **phạt** việc né nhiều; phần này phiên `au-chien-dau` đánh giá.

Kết luận: game **không** để đứng spam thắng ở chỗ quan trọng (trùm, vùng 3). Chỗ thiếu là **niềm vui chủ động** sau cú né (2.2), không phải cân bằng.

---

## 6. Ba việc nên sửa trước (trong phạm vi phiên này)

1. **Sửa sát thương trùm nhỏ vùng 3 (và ải 2-1)** — vấn đề 5.2, P1, khó S.
   Một đòn của trùm nhỏ giết bé từ đầy máu ở đúng Sức mạnh khuyên dùng, và mạnh hơn cả trùm cuối. Đây là kiểu thua "không hiểu vì sao" nặng nhất mà phiên này tìm được, và sửa chỉ là đổi vài con số trong một bảng (`data.js` `G.STAGE_K.boss`). Xác nhận bằng `au_spam.py` (không né phải chịu ≥ 2 đòn) và `tests/cay.py`.

2. **Cho trùm "mệt" (choáng, nhận thêm sát thương) từ pha 1, và cho trùm nhỏ mệt ngắn** — vấn đề 5.1, P1, khó S.
   Hướng dẫn đã hứa "sau chiêu lớn trùm choáng, đó là lúc đánh mạnh nhất", nhưng 2/3 trận không có. Thêm đúng một dòng `later(b, D, () => tire(b, 1.0))` vào một chiêu mỗi trùm tạo nhịp "né → chờ → xông vào" rõ ràng, đúng tinh thần "đọc đòn — phản công" mà không thêm hệ thống. Xác nhận bằng `au_trum.py` (% mệt > 0 ở mọi pha).

3. **Búa chạm sớm hơn trong động tác + tỉ lệ gây hệ theo nhịp vũ khí** — vấn đề 3.1 và 3.3, P1/P2, khó S.
   Búa là vũ khí có bản sắc rõ nhất (khựng quái, nện vòng) nhưng đang yếu nhất đúng ở đám đông và tích linh khí chậm gấp đôi. Hai thay đổi nhỏ, không đổi sát thương trên giấy, xác nhận bằng `au_vu_khi.py` (%huỷ của búa ≤ 30%, st/giây đám ≥ 85% kiếm, dấu ấn/phút ≥ 70% kiếm) và `tests/dps.py`.

(Ngay sau ba việc này: 6.1 bảng thua ghi chiêu và hệ của trùm, và 4.2 Lửa — sửa số Nổ lan hoặc sửa câu gợi ý.)

---

## 7. Chưa xác minh được (ghi thật)

- **Chưa thử trên điện thoại thật, chưa có người thật chơi.** Mọi số là bot trong trình duyệt không màn hình. Bot né nhiều hơn người (khoảng 37–40 lần/phút khi đánh đám), nên tỉ lệ nhát búa bị huỷ ở người thật có thể thấp hơn 49% — nhưng người thật cũng phải né giữa đám quái, nên chiều hướng vẫn đúng.
- **Âm thanh**: chỉ đọc code (`engine.js` `SFX`), không nghe thử trên máy (chạy không màn hình tắt âm).
- **Ảnh phản hồi đòn** chụp ở 960×540 trên máy tính; chưa xem trên màn hình điện thoại nhỏ (số xám của đòn vào khiên có thể còn khó thấy hơn).
- **Bản lưu thử** dựng bằng `G.testSave` (cấp, bậc, mài, áo, mũ đơn giản, không trang phục 5 ô mới, không cây chưởng đầy). Số máu bé vì vậy hơi thấp hơn người chơi thật; tỉ lệ thắng trùm vùng 2 (Ngư Tinh 2–3/8) có thể thấp hơn thực tế. Kết luận "spam thua mọi trùm" không phụ thuộc điều này.
- **Phản ứng hệ (Nổ khói, Sốc nhiệt) khi mang hai vũ khí khác nhánh** chưa đo tần suất: các bài chỉ dùng một vũ khí mỗi lượt.
- **Không đo** độ trễ nút, cửa sổ bất tử, tự ngắm, "báo trước so với thời gian chạy thoát", "trùm học theo bạn": thuộc phiên `au-chien-dau`. Bảng trùm ở phần 4 chỉ ghi thời gian báo trước trên giấy để tiện đối chiếu.
- **Các con số đề xuất** (ví dụ hệ số trùm nhỏ 2,6–2,9; Nổ lan 0,7; Nhát lướt ×2,0; búa chạm ở 35% động tác) là điểm khởi đầu để thử, **chưa** chạy `tests/cay.py` với số mới (phiên này không sửa code game).
