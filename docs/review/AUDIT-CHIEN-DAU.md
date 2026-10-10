# AUDIT chiến đấu và cảm giác đánh (phiên au-chien-dau, 10/10/2026)

Làm theo **BƯỚC A, B** ở mục 11 của `docs/review/GOP-Y-CHATGPT.md`, phạm vi: mục **2.5** (mật độ hiệu ứng), toàn bộ mục **3** (3.1–3.7) và phần âm thanh trúng/hụt của mục **2.6**.
Phiên này **chỉ kiểm tra, không sửa code game** (`game/js`, `index.html`, `build.py` không đổi). Chỉ thêm tài liệu này, ảnh trong `docs/review/anh-chien-dau/` và các bài đo `game/tests/au_*.py`.

## Tóm tắt cho chủ dự án (đọc 1 phút)

- **Phần lớn nền móng đánh đấm đã tốt**: bấm kiếm hoặc Né là em bé phản ứng ngay trong 1 khung hình (~11 mi-li-giây); đòn trúng có tiếng, chớp, khựng, rung đúng khung gây sát thương; đòn hụt chỉ có tiếng vung; lộn né bất tử 1/3 giây và mọi đòn chém/đâm/nện/bắn đều huỷ được bằng Né; số hạt, thời gian khựng, độ rung mỗi đòn nằm đúng dải góp ý đề xuất.
- **Ba chỗ đáng sửa nhất** (chi tiết ở mục 3):
  1. **Tự ngắm kéo em bé quay ngược**: Nhát lướt (sau Né), Xốc tới của giáo, Trảm Nguyệt và cung luôn nhắm quái **gần nhất mọi hướng**, bỏ qua hướng cần đang đẩy. Đo được: đang chạy khỏi trùm mà có quái nhỏ sau lưng, Xốc tới lao ngược 33 điểm ảnh về phía trùm.
  2. **Đòn thường của quái khó đọc**: quái xông, bầy nhỏ, khiên, gai, nhanh nhẹn không có vùng đỏ (chủ ý), chỉ có tư thế lấy đà — nhưng tư thế này dài hơn thời gian báo thật, nên phần "chớp trắng" cuối cùng **không bao giờ hiện** ở bầy nhỏ và cá chuồn, các con khác chỉ chớp 10–100 mi-li-giây. Thêm vào đó Hồ Tinh lao thẳng chỉ báo 0,44 giây, đi bộ ra mất ít nhất 0,33 giây: chỉ còn cách lộn.
  3. **Nút Né bị nuốt**: bấm Né sớm hơn lúc hồi xong dù chỉ 1 khung, hoặc bấm trong lúc đang lướt / bị đóng băng, thì lượt bấm mất hẳn (nút Đánh thì có bộ nhớ 0,25 giây).
- Ngoài ra: đòn mạnh nhất (Nhát lướt, Xốc tới, Trảm Nguyệt, Phi Thương, Địa Chấn) **trúng mà không có tiếng trúng**; cung/giáo/búa chỉ ra đòn khi **nhấc ngón**, nên trễ thêm đúng bằng thời gian giữ ngón (~100 mi-li-giây); số sát thương được vẽ **đè lên** vùng báo đỏ; cảnh đông nhất (12 quái, nổ dây chuyền) thì em bé gần như mất hút.
- Không có lỗi nào làm hỏng game (không có P0).

## Cách đo và giới hạn

- Đo bằng mô phỏng từng khung 1/60 giây của chính game (G.sim, G.tick) trong Chromium không màn hình, và một phần chạy thật có vẽ với cảm ứng giả lập (Chrome DevTools, màn 844×390 như điện thoại ngang). Các bài đo **không sửa luật chơi**: dựng phòng trống, đặt bia đứng yên, bơm nút bấm theo kịch bản, tạm bọc `G.damage` / `G.hurtPlayer` để đếm rồi trả lại.
- Bài đo (chạy trong thư mục `game`):

| Bài | Đo gì | Thời gian chạy |
|---|---|---|
| `python3 tests/au_dps.py [giây]` | DPS 4 vũ khí (1 bia, cụm 6 bia; có/không khựng hình), số đòn hạ từng quái ở 3 mốc ải, thời gian khoá, khung huỷ được bằng Né | ~10 phút |
| `python3 tests/au_ne.py` | cửa sổ bất tử, quãng lộn 8 hướng, bấm Né sớm, Nhát lướt, nút bấm trong lúc khựng | ~1 phút |
| `python3 tests/au_tu_ngam.py` | tự ngắm khi đang chạy khỏi trùm, quái nhỏ ở 8 góc | ~1 phút |
| `python3 tests/au_bao_truoc.py` | mọi vùng báo của 27 quái + 3 trùm nhỏ + 3 trùm vùng, thời gian đi bộ ra khỏi vùng 8 hướng | ~3 phút |
| `python3 tests/au_input.py` | độ trễ chạm → động tác → sát thương, 3 ngón cùng lúc, đổi vũ khí giữa đòn, giữ lấy đà, âm thanh trúng/hụt | ~3 phút |
| `python3 tests/au_hieu_ung.py [giây]` | hạt/khựng/rung mỗi đòn; cảnh xấu nhất (12 quái) và phòng thường (4 quái), chụp ảnh | ~2 phút |
| `python3 tests/au_hitbox_shots.py` | ảnh dừng đúng khung gây sát thương, vẽ khung tím = vùng trúng thật | ~1 phút |
| `python3 tests/au_trum_hoc.py [lượt]` | bot chơi trọn ải 2-5 và 1-2 với 4 lối chơi, ghi trùm học được gì | ~5 phút |

- **Giới hạn** (không giả vờ đã thấy):
  - Máy đo là máy chủ không có GPU: thời gian khung chỉ để so tương đối, **không** phải số của điện thoại thật.
  - **Chưa nghe** âm thanh (chỉ kiểm tra lúc nào hàm `G.sfx` được gọi và với tên gì).
  - Ảnh đã tự xem: `anh-chien-dau/hieu-ung-day-nhat*.png`, `hieu-ung-phong-thuong*.png`, `hitbox-*.png`. Kết luận về hình chỉ dựa trên các ảnh này; chỗ nào chưa chụp thì ghi (B).
  - Cảm ứng giả lập qua DevTools không thay được ngón tay thật trên Safari iOS / Chrome Android.

## 1. Bảng vấn đề (BƯỚC A + B)

Trạng thái: **(A)** đã xác nhận bằng code/số đo/ảnh · **(B)** có nguy cơ, cần thử trên máy thật · **(C)** không áp dụng.
Ưu tiên: **P0** hỏng game · **P1** ảnh hưởng lớn tới cảm giác đánh, độ đọc trận, điều khiển · **P2** đánh bóng. Độ khó: **S** nhỏ (vài dòng) · **M** vừa · **L** lớn.
Các dòng "tốt" (không cần sửa) để ở cuối bảng, đánh dấu "—".

| # | Mục | Vấn đề | TT | Bằng chứng | Ảnh hưởng người chơi | Ưu tiên | Khó | Cách sửa tối thiểu | Rủi ro hồi quy | Cách kiểm thử |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 3.4, 3.3 | Tự ngắm chọn quái **gần nhất mọi hướng**, bỏ qua hướng cần đang đẩy. Đòn có lướt thân (Nhát lướt, Xốc tới) kéo em bé quay ngược. | A | `moves.js` `aimM()` dòng 195–211 (chỉ dùng hướng cần khi KHÔNG có quái trong tầm); cung `bowTarget()` 333–340; mưa tên `bowSpot`. `au_tu_ngam.py`: đẩy cần sang tây, trùm ở đông, quái nhỏ sau lưng (0°) → Nhát lướt lao về đông, Xốc tới lao 33 điểm ảnh **về phía trùm**; Trảm Nguyệt bắn về trùm phía sau dù không có quái nhỏ; cung bắn quái gần sau lưng, bỏ quái ở hướng cần. Lộn né thì KHÔNG tự xoay (đúng). | Chạy khỏi trùm, bấm đánh để "chém đường thoát" thì bị lao ngược vào nguy hiểm; mất máu mà không hiểu vì sao. | P1 | M | Trong `aimM`/`bowTarget`: khi đang đẩy cần (P.stickX khác null) chỉ xét quái trong nón ±60° quanh hướng cần, ưu tiên khoảng cách; không có thì đánh theo hướng cần. Ít nhất áp dụng cho Nhát lướt và Xốc tới (hai đòn dời thân). Không đẩy cần thì giữ như cũ. | Bot (`tests/bot.js`) có đẩy cần khi đánh → cân bằng có thể đổi; `moves.py` có bài tám hướng. | `au_tu_ngam.py` (không còn "QUAY NGƯỢC" ở góc 0°/±45° khi đang đẩy cần), `moves.py`, `cay.py` (đổi cách đánh). |
| 2 | 3.6, 3.1 | Đòn thường của quái **không vẽ vùng đỏ** (chủ ý, `quiet`) nên tín hiệu duy nhất là tư thế lấy đà — nhưng hoạt ảnh lấy đà **dài hơn thời gian báo thật**, phần chớp trắng (từ 70% hoạt ảnh) không kịp hiện. | A | `mobs.js` `strikeZone` dòng 172–173 (`quiet: true`), `begin` 185–191 phát `'tele'` tốc độ 1 bất kể T; `monster_art.js` 1336 `tele` chớp khi u > 0,7. Đo `monsterArt.dur(...,'tele')`: bầy nhỏ (Ong Vò Vẽ, Cá Con, Dơi Than) báo 0,42 s / hoạt ảnh 0,70 s → tới 60% là đã đánh (không chớp); Cá Chuồn 64% (không chớp); lính xông 77–83%, khiên 71–80%, gai 80–86%, nhanh nhẹn 75%. | Người mới không phân biệt được "con này sắp cắn" với "con này đang lắc"; bị trúng đòn mà không thấy báo. | P1 | S | Trong `begin()` của `mobs.js`: nếu không truyền `spd0` thì phát `'tele'` với tốc độ `dur(art,'tele') / T` để hoạt ảnh (và phần chớp) kết thúc đúng lúc ra đòn. Một dòng. | Quái lấy đà trông nhanh hơn một chút; không đổi luật, vùng, sát thương. | `quai.py`, `quai_shots.py` (xem ảnh lấy đà), thêm kiểm tra: khi `e.act.fired` thì `e.an.t/dur ≥ 0,98`. |
| 3 | 3.6 | Một số đòn báo trước **không đủ thời gian đi bộ ra** sau khi kịp phản xạ (~0,25 s): chỉ còn cách Lộn. | A | `au_bao_truoc.py` (đi bộ tốc độ Thợ Rèn, từ đúng chỗ đứng lúc vùng sinh ra, 8 hướng, có tường): Hồ Tinh c1/c2 (lao thẳng) báo 0,44 s, ra nhanh nhất 0,33 s (Đô Vật 0,37) → dư 0,07–0,11 s; bầy nhỏ (Ong Vò Vẽ / Cá Con / Dơi Than) 0,42 s, dư 0,12–0,17 s; Heo Rừng Nanh Dài húc 0,45 s dư 0,20–0,22; Mèo Đen Hai Đuôi 0,45 s dư 0,20. Còn lại dư ≥ 0,28 s. Lộn thì luôn kịp (bất tử 20 khung, xem #6). | Ở Hồ Tinh, ai chưa quen Lộn sẽ thấy "không né kịp". Bầy nhỏ đánh nhanh lại không có vùng đỏ (#2) nên càng khó. | P1 | S | Hồ Tinh c1/c2: tăng mốc ra đòn (moc của hoạt ảnh) để T ≈ 0,6 s; bầy nhỏ 0,42 → 0,5 s (`mobs.js` dòng 365 `melee(e, a, role === 'swarm' ? 0.42 : …)`). | Đổi độ khó: chạy `cay.py`. | `au_bao_truoc.py` (mọi dòng "dư" ≥ 0,25), `cay.py`. |
| 4 | 3.1, 3.3 | **Nút Né không có bộ nhớ**: bấm khi Né còn hồi (dù chỉ 1 khung sớm), hoặc trong lúc Nhát lướt (8 khung) / Xốc tới (10 khung) / bị đóng băng (0,65 s) → lượt bấm mất hẳn. | A | `combat.js` 648 (`inp.dodgeP && P.dodgeCd <= 0`, không nhớ), 589–612 (đang lướt thì `return` trước phần Né), 579 (đóng băng `return`). `au_ne.py`: bấm lại ở khung 50, 54, 57, 59 (hồi 60) → "MẤT lượt bấm"; bấm giữa Nhát lướt → không lộn sau đó. Nút Đánh thì có `pressBuf` 0,25 s (`moves.js` 162). | Trên điện thoại hay bấm Né liên tục khi hoảng: lần bấm "hơi sớm" không ra gì, người chơi tưởng nút không ăn. | P1 | S | Thêm bộ nhớ Né ~0,15–0,2 s giống `pressBuf`: lưu `P.dodgeBuf` khi bấm, trừ dần, lộn ngay khi được phép. | Lộn "trễ" ngoài ý muốn nếu bộ nhớ quá dài; giữ ≤ 0,2 s. | `au_ne.py` mục 3 (bấm ở khung 50–59 phải lộn ngay ở khung 60), `ui_input.py`. |
| 5 | 2.6 | **Đòn mạnh trúng mà im lặng**: Nhát lướt, Xốc tới, Trảm Nguyệt, Phi Thương, Địa Chấn, sóng búa gây sát thương nhưng không phát tiếng "trúng" (trúng hay hụt nghe y nhau). | A | Tiếng "trúng" chỉ phát trong `gain()` (`moves.js` 264–268) và `doHit`; đường lướt (`combat.js` 596–606), `sweepSeg`/`stepSpecials` (`moves.js` 746–836), sóng búa (861–871) chỉ gọi `playerHit` (không có tiếng). `au_input.py` B5: glide/lunge/special/specialSpear/specialHammer "trúng" → không có `hit`. | Đòn đặc biệt tốn mana lại thiếu phản hồi âm thanh; khó biết đã trúng. | P1 | S | Phát `G.sfx('hit', …)` một lần mỗi khung khi các đường trên trúng ít nhất 1 quái (có thể cao độ khác cho chiêu). | Không đổi luật. Ồn hơn khi trúng nhiều: giới hạn 1 lần/khung. | `au_input.py` B5 (mọi dòng "trúng" có khung tiếng = khung sát thương). |
| 6 | 3.3 | Cửa sổ bất tử khi Né **333 ms** (20 khung, từ đúng khung bấm), dài hơn dải đề xuất 180–240 ms; cú lộn chỉ 17 khung (0,28 s), 3 khung cuối em bé nháy. | A | `combat.js` 649 (`P.dodgeT = 0,27; P.inv = 0,32`). `au_ne.py` mục 1: vùng nổ ở khung 0…19 sau khi bấm đều không trúng. Đòn của quái chỉ tính trúng **đúng 1 khung lúc nổ** (`combat.js` 862–870), nên né rất dễ. | Né dễ, công bằng (không có chuyện đã lộn mà vẫn dính). Nhưng làm giảm giá trị "đọc đòn" — tuỳ thiết kế. | P2 | S | Quyết định thiết kế: giữ 0,32 cho người mới, hoặc 0,24 nếu muốn khó hơn. Không sửa trước khi thử tay. | Đổi độ khó toàn game. | `au_ne.py`, `cay.py`. |
| 7 | 3.3 | **Nhát lướt không bất tử và không huỷ được**: lướt 8 khung, chỉ còn 0–2 khung bất tử dư từ cú lộn; Xốc tới của giáo thì có bất tử (`P.inv = ch.t`). Cộng với #1, Nhát lướt có thể lao vào đòn. | A | `moves.js` `swordGlide` 304–314 (không đặt `P.inv`), `spearLunge` 426 có. `au_ne.py` mục 4: bất tử lúc lướt [0,02; 0,003; rồi âm]. `au_dps.py`: glide 8 khung, Xốc tới 10 khung không Né được. | Thưởng "Né xong đánh ngay" lại có rủi ro không ngờ. | P2 | S | Cho Nhát lướt bất tử bằng thời gian lướt (`P.inv = max(P.inv, g.t)`) như Xốc tới. | Kiếm mạnh hơn chút trong tay người giỏi. | `au_ne.py` mục 4, `cay.py`. |
| 8 | 3.1 | **Cung, giáo, búa chỉ ra đòn khi nhấc ngón** (để phân biệt bấm/giữ lấy đà) → trễ thêm đúng bằng thời gian giữ ngón. | A | `moves.js` 162–165, 517–523 (đòn bấm chạy từ `mv.buf` đặt lúc thả). `au_input.py` A1 (trình duyệt thật): kiếm/Né vào động tác **11 ms** sau khi chạm; cung/giáo/búa **112 ms** khi giữ ngón 100 ms, **161 ms** khi giữ 150 ms (luôn ~10 ms sau lúc nhấc). Sát thương: kiếm 161 ms, giáo 279 ms, cung 445 ms, búa 479 ms sau khi chạm. | Ba vũ khí này "dính" hơn kiếm; nhịp bấm nhanh trên điện thoại cảm thấy trễ. | P1 | M | Lúc chạm xuống, cho em bé vào ngay tư thế "giương/lấy đà" (chỉ hình, không gây sát thương) để có phản hồi tức thì; nếu nhấc trước 0,16 s thì tung đòn bấm từ tư thế đó. Không đổi luật đòn. | Phải giữ đúng thời lượng đòn để không đổi DPS; `moves.py` kiểm tra lối đánh. | `au_input.py` A1 ("vào động tác" ≤ 20 ms cho mọi vũ khí), `moves.py`, `ui_input.py`. |
| 9 | 2.5 | **Số sát thương vẽ đè lên vùng báo đỏ** (ngược với góp ý "vùng báo phải nổi hơn số"). | A | `combat.js` 1020–1024: `baoTruoc.draw` trước, rồi chữ `W.texts`, rồi `fx.drawUI` (số sát thương). Ảnh `hieu-ung-phong-thuong-bao-truoc.png`: số 55/55/33 nằm trên vòng đỏ. | Vùng nguy hiểm bị chữ che đúng lúc cần nhìn. | P1 | S | Vẽ `G.baoTruoc.draw` sau `fx.drawUI`, hoặc làm mờ số nằm trong vùng báo đang hoạt động. | Số có thể bị vùng đỏ phủ mờ: chấp nhận được. | Chụp lại `au_hieu_ung.py`, `bao_truoc_shots.py`, `vfx_ky_nang.py`. |
| 10 | 2.5 | **Cảnh đông nhất quá rối**: 12 quái + búa Lửa Thức tỉnh (nổ lan dây chuyền) + Địa Chấn + chưởng: hạt chạm trần 400 ở 10–14% số khung, hình hiệu ứng chạm trần 72 ở 5–7% khung; em bé gần như không thấy, vùng báo đỏ không phân biệt được với vệt cháy. Phòng thường (tối đa 4 quái) thì chỉ chạm trần ~1% khung và còn đọc được. | A | `au_hieu_ung.py`, ảnh `hieu-ung-day-nhat*.png` (đã tự xem) và `hieu-ung-phong-thuong*.png`. Trần ở `fx.js` 7; hết chỗ thì ghi đè hạt cũ (`fx.js` 189), bỏ hình cũ nhất (`add`, 302). Phòng trùm không giới hạn số quái sống (`stage.js` 174). | Phòng trùm có quái gọi thêm + chiêu lớn: người chơi mất dấu em bé và đòn trùm. | P1 | M | (1) Khi số hạt > ~300, bỏ bớt hạt trang trí (khói, tàn lửa của nổ lan) trước, giữ hạt phản hồi trúng; (2) vụ nổ dây chuyền thứ 3 trở đi giảm nửa hạt; (3) vẽ viền sáng/bóng cho em bé lúc bị che (đã có `mobHeroOver` cho quái to). Thuộc phần hình ảnh — phối hợp phiên dt-nhan-vat. | Mất bớt "đã mắt". | `au_hieu_ung.py` (số khung chạm trần, xem ảnh), `perf.py --so`. |
| 11 | 3.6, 2.5 | Nhiều vùng báo cùng lúc (tới 5–6) đều **một màu đỏ, không có thứ tự ưu tiên**; vùng báo của trùm pha màu theo hệ (lửa → đỏ cam) dễ lẫn vệt cháy lửa của chính mình. | B | `bao_truoc.js` 23–30 (pha màu theo hệ), không có trường ưu tiên. Ảnh `hieu-ung-day-nhat-bao-truoc.png`: không nhận ra vùng đỏ giữa vệt cháy. Chưa chụp riêng phòng trùm Lâu đài. | Khó biết đòn nào nổ trước. | P2 | M | Vùng sắp nổ nhất (t nhỏ nhất) viền dày hơn; vùng của trùm luôn có viền trắng nhấp nháy (hình dạng, không chỉ màu). Thuộc phiên dt-nhan-vat (đã có việc "phân biệt vùng sắp nguy hiểm"). | Thấp. | Chụp phòng trùm Hồ Tinh với vệt cháy của người chơi. |
| 12 | 3.5 | **Đổi vũ khí giữa đòn không nhất quán**: đổi đúng khung chạm thì nhát kiếm gây sát thương bằng **vũ khí mới** (đo được: nhát chém tính sát thương cung); đổi trước khung chạm thì nhát bị bỏ (0 sát thương, nhất quán) nhưng hoạt ảnh vẫn chạy tiếp 10 khung với **hình vũ khí mới**. | A (luật) / B (hình) | `combat.js` 667–674 (đổi vũ khí) nằm trước kiểm tra trúng 683; `moves.js` 173 chỉ đặt `hitDone` ở khung SAU. `au_input.py` B3: `hitWith: 'bow'`, `animFramesWithNewWeapon: 10, drawnAs: 'bow'`. | Hiếm (cửa sổ 1 khung) nhưng "hoạt ảnh vũ khí cũ, sát thương vũ khí mới" đúng như góp ý lo. Hình cung vung kiểu chém trông lạ. | P2 | S | Trong đoạn đổi vũ khí của `combat.js`: đặt luôn `P.atkT = 0; P.hitDone = true; P.cdT = min(P.cdT, 0,1)` (huỷ đòn đang vung, quay về đứng). | Đổi vũ khí giữa chuỗi sẽ "cắt" động tác ngay — đúng ý "cho phép và reset combo". | `au_input.py` B3 (hits = 0, không còn khung vẽ vũ khí mới trong động tác cũ), `moves.py`. |
| 13 | 3.2 | **"Hồi đòn" trong `data.js` không phải số đang dùng**: `G.WTYPES.cd` (kiếm 0,36, cung 0,5, giáo 0,44, búa 0,8) chỉ dùng cho lối đánh cũ khi thiếu `moves.js`. Thời gian thật là thời lượng từng nhát trong `G.MOVES`: kiếm 0,30 + 0,30 + 0,46; giáo 0,38/0,34/0,34 + quét 0,52; búa 0,8; cung 0,38 (đứng yên) / 0,45 (vừa chạy). Đòn mới chỉ bắt đầu khi nhát trước xong hẳn (`cdT = atkT`). | A | `combat.js` 469–478 (`startAttack` dùng `T.cd`, chỉ gọi khi `G.moves` không có), `moves.js` 33–81, 257–263. `au_dps.py` (bảng thời gian động tác, mục 2.3). | Tài liệu thiết kế/góp ý tính DPS theo số cũ nên ra kết luận sai. | P2 | S | Ghi rõ trong `data.js` và tài liệu thiết kế rằng `cd` là số dự phòng; nhịp thật ở `G.MOVES`. Không đổi số. | Không. | Đọc lại. |
| 14 | 3.2 | **DPS thật**: một bia, theo đồng hồ (có khựng hình): kiếm 46,6 · giáo 51,4 · búa 42,2 · cung 51,8 sát thương/giây. Khựng hình chỉ làm chậm cận chiến (−11 đến −15%), cung không khựng nên **ngang hoặc hơn** cận chiến khi bắn một con đứng yên. Đánh cụm thì cận chiến gấp 3–4 lần cung. | A | `au_dps.py` (bảng mục 2.1). Khựng: `fx.js` 637–639 (tên thường không khựng). Lưu ý: khựng làm **cả thế giới** đứng, quái cũng dừng, nên độ an toàn không đổi; chỉ thời gian dọn phòng theo đồng hồ khác. `tests/dps.py` (bot, không vẽ) đo cung thấp hơn kiếm 19–32% — đúng khi không tính khựng. | Không phải lỗi; là chỗ cân bằng nên biết: "cung yếu nhất" chỉ đúng khi đánh cụm. | P2 | — | Giữ. Nếu muốn cung luôn thấp hơn: tính khựng vào `dps.py` hoặc thêm khựng nhỏ cho tên. | — | `au_dps.py`. |
| 15 | 3.2 | **Đòn giữ-thả có DPS thấp hơn bấm thường** ở mọi trường hợp đo, trừ cung đánh cụm: búa lấy đà nấc 2 34,8 so với nện thường 47,2 (1 bia) và 208 so với 236 (cụm sát); giáo Xốc tới 35,7 so với 59,2; cung giương đầy 43,8 so với 51,8 (cụm: 85,9 so với 69,5 nhờ xuyên). | A | `au_dps.py`. Ở cụm sát, nện thường của búa đã trúng cả 6 bia nên lấy đà không lời thêm. | Người chơi giữ nút vì "trông mạnh" nhưng thật ra chậm hơn; lấy đà chỉ đáng khi cần choáng/sóng xa/xuyên. | P2 | S | Quyết định thiết kế: hoặc tăng hệ số đòn lấy đà (búa nấc 2 1,25 → ~1,6), hoặc chấp nhận đó là đòn "tiện ích" và nói rõ trong mẹo vũ khí. | Cân bằng. | `au_dps.py`, `dps.py`, `cay.py`. |
| 16 | 3.2 | **Né huỷ nhát búa nhưng không trả lại thời gian chờ**: Né đặt `atkT = 0` nhưng không đụng `cdT`, nên huỷ nhát nện ở khung 5 rồi lộn xong còn phải chờ thêm ~0,43 s mới đánh lại được (kiếm/giáo đánh lại ngay khi lộn xong). | A | `combat.js` 649–650. Đo nhanh (bấm Đánh liên tục sau khi Né): kiếm đánh lại sau 17 khung (= lúc lộn xong), giáo 18, **búa 43**. | Búa vốn chậm, huỷ bằng Né còn bị phạt thêm — cảm giác "bấm không ăn". | P2 | S | Khi Né: `P.cdT = Math.min(P.cdT, 0,1)`. | Búa linh hoạt hơn; chạy `cay.py` nếu muốn chắc. | Lặp lại phép đo (búa ≤ 20 khung). |
| 17 | 3.1 | **Phản ứng mục tiêu**: hình đã phân cấp thường/nặng/chí mạng (chớp, nghiêng, nảy). Nhưng **luật đẩy lùi** chỉ có ở Nhát kết (10 điểm ảnh) và Quét vòng (8), và **tinh anh bị đẩy y như quái nhỏ** (chỉ trùm không bị). Mỗi nhát búa thường làm quái thường **choáng 0,4 s** (khá mạnh). Đánh khiên mặt trước: số xám nhỏ + mòn giáp + chữ "Vỡ giáp!", không có tiếng/tia "keng" riêng. | A | `moves.js` `push` 279–282 (`!e.isBoss`); `combat.js` 401–402 (`T.stagger` 0,4); `fx.js` 600–604 (phân cấp hình), 372 (số xám khi hệ số < 0,8); `mobs.js` 138–142. | Tinh anh to mà văng như quái nhỏ thì thiếu "nặng"; đánh khiên khó biết là đang đánh vào giáp nếu không để ý số xám. | P2 | S | Đẩy lùi tinh anh × 0,4; thêm tiếng `block` (cao, ngắn) khi hệ số giáp < 0,8. | Thấp. | `quai.py`, `au_input.py` (thêm khiên). |
| 18 | 3.1 | Nút Đánh bấm **ngay đầu cú lộn** (khung 0–3) bị nuốt: bộ nhớ nút 0,25 s ngắn hơn cú lộn 0,28 s. | A | `moves.js` 19 (`buffer: 0,25`), `combat.js` 618–638 (đang lộn không gọi `act`). `au_ne.py` mục 4: k = 0, 2 → không ra gì; k = 4…38 → Nhát lướt. | Bấm "Né rồi Đánh" thật nhanh thì mất đòn. | P2 | S | Không trừ `pressBuf` khi đang lộn (giữ tới lúc lộn xong). | Thấp. | `au_ne.py` mục 4 (k = 0 → Nhát lướt). |
| 19 | 3.6 | **Xạ thủ**: lấy đà 0,7 s, bắn mỗi 3 s, đạn 118 điểm ảnh/giây, nhắm lại vào chỗ em bé **đúng lúc bắn** (không theo hướng lúc lấy đà); đường ngắm đã bị tắt theo ý chủ dự án. Né dễ (đi ngang 8 điểm ảnh mất ~0,15 s). | A (luật) / B (hình) | `data.js` 186, `mobs.js` 288–294 (`angTo` lúc `fire`), 689 (`if (false && …)` đường ngắm). | Hướng con quái chĩa lúc lấy đà có thể khác hướng đạn bay nếu em bé đang chạy — cần xem trên máy. | P2 | — | Giữ; nếu thấy lệch thì cho quái xoay theo em bé trong lúc lấy đà. | — | Thử tay (checklist). |
| 20 | 3.5 | **Đóng băng do nổ Băng** (0,65 s): mọi nút bị bỏ qua và không nhớ. | A | `combat.js` 579 (`return` trước mọi xử lý nút), `mobs.js` 166. | Bấm Né lúc đang đóng băng không có tác dụng gì, kể cả khi vừa hết băng. | P2 | S | Cho bộ nhớ Né (#4) chạy cả lúc đóng băng. | Thấp. | `au_ne.py` (thêm trường hợp đóng băng). |
| 21 | 3.3 | Máu vẫn tụt vì cháy/độc trong lúc lộn bất tử. | A | `combat.js` 569–577 (`P.dot` không xét `P.inv`). | Dễ hiểu nhầm là "né rồi vẫn dính". | P2 | S | Giữ luật; cho số sát thương cháy/độc trên người em bé màu hệ (đã có hạt độc/cháy trên người) — kiểm tra trên máy xem có rõ không. | — | Thử tay. |
| 22 | 3.7 | **Trùm học gì thật** (`boss.js` `computeLayers` 14–28, gọi 1 lần lúc vào phòng trùm `stage.js` 105): đếm sát thương **vũ khí** (chưởng không tính) cả ải → tối đa 1 lớp (trùm nhỏ, trùm vùng lần đầu) hoặc 2 lớp, theo thứ tự: **Kháng hệ** (hệ chiếm > 50%: giảm 30%/50%, hệ khắc chế +30%, phòng trùm đặt sẵn 2 vật nổ hệ khắc chế) → **Chống đánh xa** (> 60% sát thương xa) hoặc **Chống áp sát** (> 60% gần) → **Bắt bài lăn né** (> 15 lần né cả ải). Độ khó 2: thêm **vết sẹo** = hệ đã kết liễu trùm lần trước. Không tăng máu/sát thương. | A | `au_trum_hoc.py` (bot): kiếm không hệ → "Chống áp sát" (+ "Bắt bài lăn né" ở trùm vùng, bot né 87 lần); cung → "Chống đánh xa"; búa Lửa → "Kháng Lửa" (+ "Chống áp sát"); cung Băng → "Kháng Băng" (+ "Chống đánh xa"). Không đổi giữa trận. | Cơ chế có thật, dễ đoán, có phản công (vật nổ hệ khắc chế, "Lộ điểm yếu" khi trùm mệt). | — | — | Giữ. | — | `au_trum_hoc.py`. |
| 23 | 3.7 | **"Chống đánh xa" rất nặng**: tên từ xa hơn 120 điểm ảnh chỉ còn **30%** sát thương (tầm cung 180–250); Hồ Tinh còn dịch chuyển ra sau lưng vồ mỗi lần trúng tên (hồi 4,5 s). Người chơi không được báo "xa quá, tên yếu". | A | `combat.js` 233; `boss.js` 64, 70–83. | Người chơi cung bị phạt 70% mà không hiểu vì sao — đúng nỗi lo "bị phạt vì chơi tốt". | P1 | S | Báo khi bị giảm (số sát thương xám + chữ "Xa quá!" lần đầu), và/hoặc 0,3 → 0,5. | Cân bằng trùm khi chơi cung: `cay.py` với `prefer: 'bow'`. | `au_trum_hoc.py`, `cay.py`. |
| 24 | 3.7 | **"Chống áp sát" ở trùm nhỏ chỉ là nhãn**: chỉ trùm vùng mới chọn chiêu gần ×3 và Hồ Tinh nhảy lùi; trùm nhỏ hiện chữ "Chống áp sát" nhưng không đổi gì (gai chỉ vẽ ở Mộc Tinh). | A | `boss.js` 218 (`thinkBig`), 292 (Hồ Tinh); `thinkMini` 232–281 không đọc `antiMelee`; `art.js` 2032 (gai). | Lời hứa "trùm học theo bạn" thành chữ suông ở trùm nhỏ. | P2 | S | Trùm nhỏ có `antiMelee`: thêm `'chieu1'` (đòn quanh mình) vào lựa chọn khi em bé đứng gần, hoặc bỏ lớp này khỏi trùm nhỏ. | Thấp. | `au_trum_hoc.py`, `chitiet_shots.py`. |
| 25 | 3.7 | **Giải thích sự thích nghi còn mỏng**: có băng chữ 4 s lúc vào phòng trùm, hàng thẻ dưới thanh máu trùm, và phòng Suối hồi xem trước "Trùm đã học…"; Cụ Đồ chỉ giải thích Kháng hệ; **không có lời gợi ý sau trận** theo lớp đã gặp; "Bắt bài lăn né" ngưỡng 15 lần/ải nên gần như ai né cũng gặp. | A | `stage.js` 268, 823, 847; `village.js` 622 + `data.js` 330–331 (`G.HINTS`); `boss.js` 27. | Người chơi thấy trùm "khó lên" mà không biết làm gì khác. | P2 | S | Màn kết quả: 1 dòng theo lớp đã gặp ("Trùm kháng Lửa — thử vũ khí Băng / đập vật nổ xanh"). | Không. | Chụp màn kết quả. |
| 26 | 2.6 | Tiếng vung phát **lúc bắt đầu lấy đà**, sớm 135–360 ms so với lúc lưỡi vung qua. Âm thanh là sóng đơn tự tổng hợp; tiếng "trúng" giống nhau mọi vũ khí (cung cao hơn); chỉ có bật/tắt, không chỉnh âm lượng. | A (code) / B (nghe) | `moves.js` 262 (`begin` phát `swing`), `engine.js` 182–203 (`SFX`, `G.save.sound`). | Nghe "thiếu lực", tiếng vung không khớp cú vung. | P2 | S | Dời tiếng vung tới ~35% động tác; thêm tiếng trúng riêng cho búa (thấp, dài) và khiên. | Không. | `au_input.py` B5; nghe trên máy. |
| — | 3.1 | Độ trễ kiếm/Né: vào động tác ~11 ms sau khi chạm (1 khung). | A tốt | `au_input.py` A1; vòng lặp `engine.js` 456–463 đọc nút ở khung kế tiếp. | — | — | — | Giữ. | — | `au_input.py`. |
| — | 3.1 | Hình vũ khí khớp vùng trúng ở khung gây sát thương (kiếm, Nhát kết, đâm, quét, nện, chém chéo). Sát thương ở 45% động tác, tư thế "trúng" giữ ở 43–53%. | A tốt | Ảnh `hitbox-*.png` (khung tím = vùng trúng thật ở mặt sàn; lưỡi vũ khí vẽ ngang ngực theo góc nhìn từ trên). `combat.js` 683. | — | — | — | Giữ. | — | `au_hitbox_shots.py`. |
| — | 3.1, 2.6 | Trúng/hụt phân biệt rõ: hụt chỉ có tiếng vung + vệt; trúng có tiếng "trúng" **đúng khung** gây sát thương, chớp, khựng, rung, số. | A tốt | `au_input.py` B5 (chém, đâm, nện, bắn, búa lấy đà: khung tiếng = khung sát thương). | — | — | — | Giữ. | — | `au_input.py`. |
| — | 3.1 | Khựng hình không làm mất nút: Né bấm trong lúc khựng được nhớ và lộn ngay khi hết khựng. | A tốt | `fx.js` 323–337; `au_ne.py` mục 5 (lộn sau 5 khung = 70 ms khựng + 1). | — | — | — | Giữ. | — | `au_ne.py`. |
| — | 3.2 | Không khoá cứng: Né huỷ được mọi khung của chém, đâm, quét, nện, bắn, lấy đà; Đặc biệt và chưởng không khoá. Chỉ Nhát lướt (8 khung) và Xốc tới (10 khung) không Né được. Lúc đang ra đòn đi chậm còn 40%. | A tốt | `au_dps.py` (bảng 2.3). | — | — | — | Giữ (xem #7). | — | `au_dps.py`. |
| — | 3.3 | Né ra khỏi đòn đã báo luôn được: vùng chỉ gây sát thương đúng khung nổ, đạn quái bay xuyên khi đang bất tử; lộn không tự xoay về quái; lộn 56 (ngang) / 50 (chéo) / 42 (dọc) điểm ảnh — bằng 0,78 s đi bộ. | A tốt | `au_ne.py` mục 1–2; `combat.js` 845, 862–870. | — | — | — | Giữ. | — | `au_ne.py`. |
| — | 3.3 | Cửa sổ Nhát lướt 350 ms sau khi lộn xong (trong dải đề xuất 250–400). | A tốt | `moves.js` 42 (`win: 0,35`), `au_ne.py` mục 4. | — | — | — | Giữ. | — | `au_ne.py`. |
| — | 3.5 | Giữ/thả/đổi vũ khí khi đang lấy đà nhất quán: bị đánh không huỷ đà; lộn huỷ đà (còn giữ thì nạp lại); đổi vũ khí huỷ đà và chuyển sang lấy đà của vũ khí mới; đầy đà giữ thêm 0,8 s thì tự tung. | A tốt | `moves.js` 173–176, 514; `au_input.py` B4. Chưa thấy tín hiệu hình khi bị đánh mà vẫn giữ đà (B). | — | — | — | Giữ. | — | `au_input.py` B4. |
| — | 3.5 | Đa chạm: giữ cần + giữ Đánh + chạm Né + chạm Đặc biệt đều được nhận (3 ngón); nhấc một ngón không làm rơi ngón khác. | A tốt (giả lập) / B (máy thật) | `au_input.py` A2; `tests/ui_input.py` (hai ngón, huỷ ngón, dùng lại mã ngón). `engine.js` 109–151 (mỗi ngón một mã, `setPointerCapture`). | — | — | — | Giữ. | — | `au_input.py`, thử tay. |
| — | 2.5 | Hạt/khựng/rung mỗi đòn trong dải đề xuất: thường 5 hạt / 45 ms / rung 1 điểm ảnh; búa 5 / 70 / 1; nặng 8 / 90 / 3; chí mạng 14 / 115 / 2; kết liễu 8 / 100 / 3; tên mạnh 9 / 50. | A tốt | `au_hieu_ung.py` mục 1. | — | — | — | Giữ. | — | `au_hieu_ung.py`. |
| — | 2.5 | Không có tuỳ chọn "giảm rung / giảm hạt / giảm chớp" cho người chơi (chỉ có `G.VFX` trong code). | A | `vfx_cfg.js`; bảng cài đặt Anh Mõ chỉ có âm thanh, toàn màn hình, mây. | Người nhạy cảm ánh chớp không tắt được. | P2 | S | Một nút "Giảm hiệu ứng" đặt `G.VFX.rung = 0,4; hat = 0,5` (giữ khựng). Thuộc giao diện — để phiên giao diện làm. | — | `ui_input.py`. |

## 2. Bảng số đo

### 2.1 DPS thực tế (sát thương/giây), bia đứng yên, 15 giây

Em bé Thợ Rèn cấp 10, vũ khí Lam +3, không hệ, không dùng Đặc biệt/chưởng (đo riêng nút Đánh). "Logic" = mô phỏng không vẽ (như bot); "Thật" = chạy như lúc có vẽ, mỗi đòn trúng làm cả thế giới khựng 45–115 ms. Cụm = 6 bia đứng sát nhau trước mặt.

| Lối đánh | 1 bia logic | 1 bia thật | Cụm 6 logic | Cụm 6 thật | St mỗi lần trúng |
|---|---|---|---|---|---|
| Kiếm (giữ = chuỗi 3 nhát; bấm liên tục ra y hệt) | 54,6 | 46,6 | 297,8 | 253,6 | 20,0 |
| Giáo (bấm: 3 đâm + quét) | 59,2 | 51,4 | 215,9 | 187,0 | 24,0 |
| Giáo Xốc tới (giữ 0,7 s, thả) | 35,7 | 32,9 | 214,0 | 197,5 | 41,1 |
| Búa (bấm: nện) | 47,2 | 42,2 | 235,8 | 211,0 | 37,2 |
| Búa lấy đà nấc 2 | 34,8 | 34,8 | 208,5 | 208,5 | 32,6 |
| Cung (bấm) | 51,8 | 51,8 | 69,5 | 69,5 | 19,9 |
| Cung giương đầy | 43,8 | 43,8 | 85,9 | 85,9 | 59,8 |

Nhóm quái thật (bot đánh 5 quái mới mọc liên tục, `tests/dps.py 20 3 khonghe quaimoi`, 20 giây × 3 hạt giống, không vẽ): kiếm 87,1 · giáo 84,2 · búa 75,0 · cung 59,1. (Bài gốc dùng 60 giây × 8 hạt giống; lượt ngắn này chỉ để tham khảo.)

### 2.2 Số lần trúng để hạ một con (quái thật đứng yên, đánh mặt trước, không chí mạng)

Cấp "tương đương" chọn gần "Sức mạnh khuyên dùng" của ải; chưa mặc trang phục nên ải 3-1 chỉ đạt 83%.

| Quái | Ải 1-1 (cấp 1, Thường +0, SM 98/100) máu · kiếm · giáo · búa · cung | Ải 2-1 (cấp 22, Tím +6, SM 225/245) | Ải 3-1 (cấp 40, Vàng +10, SM 353/425) |
|---|---|---|---|
| Lính xông | 67 · 6 · 6 · 4 · 6 | 172 · 6 · 5 · 3 · 6 | 425 · 8 · 7 · 5 · 8 |
| Bầy nhỏ | 60 · 6 · 5 · 3 · 6 | 154 · 6 · 5 · 3 · 5 | 383 · 7 · 6 · 4 · 7 |
| Khiên (mặt trước) | 114 · 12 · 11 · 7 · 13 | 292 · 12 · 10 · 7 · 12 | 723 · 16 · 13 · 9 · 16 |
| Xạ thủ | 47 · 5 · 4 · 3 · 5 | 120 · 5 · 4 · 3 · 4 | 298 · 6 · 5 · 3 · 6 |
| Nhanh nhẹn | 47 · 5 · 4 · 3 · 5 | 120 · 5 · 4 · 3 · 4 | 298 · 6 · 5 · 3 · 6 |
| Cảm tử | 37 · 4 · 4 · 2 · 4 | 94 · 3 · 3 · 2 · 4 | 234 · 5 · 4 · 3 · 5 |
| Đặt bom | 50 · 5 · 4 · 3 · 5 | 129 · 5 · 4 · 3 · 5 | 319 · 6 · 5 · 4 · 6 |
| Gai | 74 · 7 · 6 · 4 · 7 | 189 · 6 · 6 · 4 · 7 | 468 · 9 · 8 · 5 · 9 |
| Tinh anh | 336 · 30 · 25 · 16 · 30 | 858 · 28 · 24 · 15 · 28 | 2125 · 38 · 32 · 21 · 38 |

Nhận xét: quái thường chết sau 2 chuỗi kiếm (5–8 nhát), ổn. Tinh anh cần 28–38 nhát kiếm (khoảng 10–14 giây đánh liên tục) — dài, nên tinh anh cần có chiêu/nhịp để không chỉ là "bao cát".

### 2.3 Thời gian động tác, bị khoá và chỗ huỷ bằng Né

| Động tác | Thời lượng (đi chậm 40%) | Chờ ra đòn kế | Mất điều khiển hẳn | Khung KHÔNG Né được |
|---|---|---|---|---|
| Kiếm nhát 1 / 2 | 0,30 s | 0,30 s | 0 | không |
| Kiếm Nhát kết | 0,47 s | 0,47 s | 0 | không |
| Kiếm Nhát lướt | 0,13 s | 0,20 s | 0,13 s | 8 khung (toàn bộ) |
| Giáo đâm | 0,38 s | 0,38 s | 0 | không |
| Giáo quét vòng | 0,53 s | 0,53 s | 0 | không |
| Giáo Xốc tới | 0,17 s | 0,37 s | 0,17 s | 10 khung (toàn bộ) |
| Búa nện | 0,80 s | 0,80 s (Né không trả lại, xem #16) | 0 | không |
| Búa nện đất (sau lấy đà) | 0,45 s | 0,45 s | 0 | không |
| Cung bắn | 0,38 s | 0,38 s | 0 | không |
| Cung tên mạnh (sau giương) | 0,28 s | 0,28 s | 0 | không |
| Đặc biệt, chưởng | 0 | 0 | 0 | không |

Một chuỗi kiếm 3 nhát: 1,06 s theo luật, ~1,24 s theo đồng hồ khi có khựng (45 + 45 + 90 ms).

### 2.4 Né

| Số đo | Giá trị |
|---|---|
| Bất tử | 20 khung = 333 ms, từ đúng khung bấm |
| Cú lộn | 17 khung (0,28 s); 56 điểm ảnh ngang, 50 chéo, 42 dọc (= 0,78 s đi bộ) |
| Hồi Né | 1 s (0,75 s nếu có điểm Thủ cấp 2) — bấm sớm dù 1 khung là mất |
| Nhát lướt | bấm Đánh từ khung 4 tới khung 38 sau khi bấm Né (cửa sổ 350 ms sau khi lộn xong); khung 0–3 bị nuốt |
| Bất tử khi Nhát lướt | 0–2 khung (dư của cú lộn) trên 8 khung lướt |

### 2.5 Độ trễ đầu vào (trình duyệt thật, cảm ứng giả lập, 16 lần mỗi dòng, số giữa)

| Thao tác | Chạm → vào động tác | Chạm → gây sát thương |
|---|---|---|
| Kiếm, chạm 100 ms | 11 ms | 161 ms |
| Né | 11 ms | — |
| Giáo, chạm 100 ms / 150 ms | 111 ms / 161 ms (≈ 10 ms sau khi nhấc) | 279 ms / 344 ms |
| Búa, chạm 100 ms | 112 ms | 479 ms |
| Cung, chạm 100 ms / 150 ms | 112 ms / 161 ms | 445 ms / 494 ms (tên bay 70 điểm ảnh) |

### 2.6 Báo trước so với thời gian đi bộ ra khỏi vùng

Đi bộ tốc độ Thợ Rèn (72 điểm ảnh/giây, chiều dọc × 0,75) theo 8 hướng, từ đúng chỗ em bé đứng lúc vùng sinh ra, có tính tường phòng. "Dư" = thời gian báo − thời gian ra nhanh nhất. Phản xạ người chơi trên điện thoại khoảng 0,25 s, nên **dư dưới 0,25 s nghĩa là không đi bộ kịp, phải Lộn** (Lộn luôn kịp nếu bấm trước lúc nổ).

| Đòn | Báo (s) | Ra nhanh nhất / Đô Vật (s) | Dư (s) | Vùng đỏ? |
|---|---|---|---|---|
| Hồ Tinh c1, c2 (lao thẳng) | 0,44 | 0,33 / 0,37 | **0,07–0,11** | có |
| Bầy nhỏ (Ong Vò Vẽ, Cá Con, Dơi Than) | 0,42 | 0,25–0,27 / 0,28–0,30 | **0,12–0,17** | không |
| Heo Rừng Nanh Dài (tinh anh, húc 3 lần) | 0,45 | 0,23 / 0,25 | **0,20–0,22** | có |
| Mèo Đen Hai Đuôi (nhanh nhẹn) | 0,45 | 0,22 / 0,25 | **0,20–0,23** | không |
| Cá Chuồn, Chồn Bóng (nhanh nhẹn) | 0,45 | 0,15–0,17 | 0,28–0,30 | không |
| Cua Lính, Heo Con, Linh Ma (lính xông) | 0,58 | 0,15–0,27 | 0,31–0,43 | không |
| Hũ Lửa Chúa (tinh anh, vòng cầu lửa) | 0,70 | 0,37–0,38 | 0,32–0,33 | có |
| Hồ Tinh c2 (đòn lao thứ hai) | 0,50 | 0,15 | 0,35 | có |
| Ngư Tinh c1, c2 (đường thẳng) | 0,76 | 0,38 | 0,38 | có |
| Mộc Tinh c4 (quạt) | 0,84 | 0,45 | 0,39 | có |
| Hổ Lửa (trùm nhỏ) chiêu 1 | 0,75 | 0,37 | 0,38 | có |
| Ốc (khiên) | 0,60 | 0,18–0,22 | 0,38–0,42 | không |
| Các đòn còn lại (khiên khác, gai, cảm tử, bom, mưa trái, gai trồi, vành gai…) | 0,55–1,70 | 0–0,45 | ≥ 0,45 | đòn thường thì không, chiêu thì có |

Toàn bộ 124 vùng đã đo nằm trong `/tmp/au_bao_truoc.json` khi chạy lại `au_bao_truoc.py`. Không có hướng nào bị kẹt (luôn có ít nhất một hướng ra được); chạy dọc theo đường lao thì lâu (tới 1,6 s) — đúng hình dạng.

### 2.7 Hiệu ứng trong cảnh đông (20 giây chạy thật có vẽ)

| Cảnh | Hạt nhiều nhất (trần 400) | Khung chạm trần hạt | Hình (trần 72) | Khung chạm trần hình | Số sát thương (trần 28) | Vùng báo cùng lúc |
|---|---|---|---|---|---|---|
| Xấu nhất: 12 quái, búa Lửa Thức tỉnh, Địa Chấn mỗi 2,5 s, chưởng mỗi 1,7 s | 400 | 124–183 / ~1280 (10–14%) | 72 | 64–94 (5–7%) | 28 | 5–6 |
| Phòng thường: 4 quái cùng lúc | 400 | 14 / ~1300 (1%) | 71 | 0 | 12 | 2 |

## 3. Ba việc nên sửa trước nhất (trong phạm vi chiến đấu)

1. **Tự ngắm tôn trọng hướng cần (#1, kèm #7).** Đây là lỗi "game đánh sai ý mình" rõ nhất và trực tiếp làm mất máu oan: Nhát lướt và Xốc tới dời cả thân em bé về phía quái gần nhất, kể cả sau lưng. Sửa gọn trong một hàm (`aimM` / `bowTarget` của `moves.js`): khi đang đẩy cần chỉ chọn quái trong nón ±60° quanh hướng cần, không có thì đánh theo hướng cần; không đẩy cần thì giữ như cũ nên người chơi hiện tại không bị đổi thói quen. Cho Nhát lướt bất tử như Xốc tới để "Né xong đánh ngay" không thành bẫy. Đúng tiêu chí đạt của ƯU TIÊN 1: "Sửa hành vi auto-aim nếu làm nhân vật quay sai hướng".
2. **Đòn của quái đọc được trước khi trúng (#2, #3).** Một dòng trong `mobs.js` (cho hoạt ảnh lấy đà chạy vừa đúng thời gian báo) làm phần chớp trắng hiện ra ở mọi quái thường — đây là tín hiệu duy nhất vì đòn thường không có vùng đỏ. Cộng thêm nới thời gian báo cho Hồ Tinh lao thẳng (0,44 → ~0,6 s) và bầy nhỏ (0,42 → 0,5 s) để người mới đi bộ ra được. Hiệu quả lớn, công nhỏ, không đổi hình vẽ; đúng tiêu chí "người mới sau 1–2 phút phân biệt được đòn nguy hiểm".
3. **Nút Né không bao giờ bị nuốt (#4, kèm #18, #20).** Né là nút cứu mạng; bấm hơi sớm mà không ra gì là cảm giác "nút không ăn" tệ nhất trên điện thoại. Thêm bộ nhớ ~0,15–0,2 s giống nút Đánh, áp dụng cả lúc đang lướt và lúc bị đóng băng; đồng thời giữ lượt bấm Đánh trong suốt cú lộn. Vài dòng trong `combat.js`/`moves.js`, kiểm chứng ngay bằng `au_ne.py`.

Kế tiếp nếu còn thời gian: tiếng trúng cho đòn lướt/chiêu (#5, rất nhỏ), vẽ vùng báo trên số sát thương (#9, rất nhỏ), phản hồi tức thì khi chạm cho cung/giáo/búa (#8), báo "Xa quá!" khi trùm Chống đánh xa (#23).

## 4. Checklist thử tay trên điện thoại (phần chiến đấu)

Cầm ngang, độ sáng 30–40%, âm thanh bật. Ghi lại máy, trình duyệt, kết quả từng dòng.

**Đánh và cảm giác**
- [ ] Kiếm: chạm nút Đánh thật nhanh 10 lần — lần nào em bé cũng vung ngay khi ngón chạm (không đợi nhấc ngón).
- [ ] Cung, giáo, búa: chạm nhanh — có thấy trễ hơn kiếm không? Chạm chậm (~0,2 s) có vô tình thành lấy đà không?
- [ ] Chém hụt (không có quái) và chém trúng: nghe và nhìn có khác nhau rõ không (tiếng "cộp", chớp, khựng, số)?
- [ ] Nhát lướt, Xốc tới, Trảm Nguyệt, Phi Thương, Địa Chấn trúng quái: có nghe tiếng trúng không (hiện tại: không).
- [ ] Đánh quái khiên từ phía trước rồi vòng ra sau: có nhận ra mặt trước "đỡ" đòn không (số xám nhỏ)?
- [ ] Búa đánh quái thường: quái có khựng lại rõ không; tinh anh bị Nhát kết có văng xa như quái nhỏ không.

**Né**
- [ ] Bấm Né liên tục thật nhanh: có lần bấm nào "không ăn" không (hiện tại: lần bấm trước khi hồi xong bị mất).
- [ ] Đứng trong vòng đỏ, đợi tới lúc vòng sáng gần đầy rồi mới lộn: có bao giờ đã lộn mà vẫn mất máu không (trừ cháy/độc đang có trên người).
- [ ] Né rồi bấm Đánh ngay: ra Nhát lướt; bấm Đánh ngay lúc vừa chạm Né thì có ra gì không (hiện tại: mất).
- [ ] Bị nổ Băng đóng băng: bấm Né trong lúc đóng băng có tác dụng khi hết băng không (hiện tại: không).

**Tự ngắm**
- [ ] Đứng sát trùm, có một quái nhỏ đuổi sau lưng: đẩy cần chạy ra xa, Né rồi bấm Đánh — em bé lướt về hướng nào? (hiện tại: về phía quái nhỏ, tức là quay lại gần trùm).
- [ ] Giáo: giữ Đánh lấy đà trong lúc chạy khỏi trùm, thả ra — em bé lao về đâu?
- [ ] Cung: có quái ở hướng cần đang đẩy (xa) và quái khác gần sau lưng — tên bay về đâu?
- [ ] Không có quái trong tầm: đòn đi theo hướng cần đang đẩy, không đẩy thì theo hướng vừa đi.

**Đọc đòn của quái**
- [ ] Bầy ong/cá con/dơi: trước khi cắn có thấy con quái chớp trắng không (hiện tại: không kịp chớp).
- [ ] Lính xông, khiên, gai, nhanh nhẹn: nhìn tư thế lấy đà có đoán được lúc nào bị đánh không.
- [ ] Hồ Tinh lao thẳng: thấy vùng đỏ rồi có đi bộ ra kịp không, hay bắt buộc phải lộn.
- [ ] Đòn chéo (quái ở góc trên-phải, dưới-trái…): vùng đỏ và chỗ thật sự trúng có khớp không.
- [ ] Nhiều vùng đỏ cùng lúc ở phòng trùm: biết vùng nào nổ trước không; vùng đỏ có lẫn với vệt cháy lửa của chính mình không.
- [ ] Số sát thương có che vùng đỏ không.

**Giữ, thả, đổi vũ khí, đa chạm**
- [ ] Giữ cần + giữ Đánh + chạm Né + chạm Đặc biệt cùng lúc: tất cả đều ăn, nhân vật không đứng khựng.
- [ ] Đang giữ lấy đà (búa) thì bị quái đánh: đà còn không, có thấy rõ không.
- [ ] Đổi vũ khí đúng lúc đang chém: hình vũ khí và đòn có kỳ không.
- [ ] Ngón giữ cần trượt ra khỏi màn hình rồi quay lại: nhân vật có tự dừng đúng không.

**Trùm học theo bạn**
- [ ] Chơi một ải chỉ bằng cung: vào phòng trùm có đọc được "Chống đánh xa" không, có hiểu là phải đứng gần (tên từ xa chỉ còn 30%) không.
- [ ] Chơi một ải chỉ bằng vũ khí Lửa: trùm "Kháng Lửa" — có thấy hai vật nổ hệ khắc chế trong phòng và biết dùng không.
- [ ] Đánh trùm nhỏ có lớp "Chống áp sát": có cảm thấy khác gì không (hiện tại: không khác).

**Cảnh đông**
- [ ] Phòng trùm có quái gọi thêm + chiêu lớn + nổ dây chuyền: lúc nào cũng thấy em bé ở đâu không; máy có giật không.
