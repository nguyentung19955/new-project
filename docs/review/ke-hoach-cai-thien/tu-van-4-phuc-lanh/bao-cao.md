# Tư vấn 4 — Phúc lành giữa ải (16/10)

Theo QUYET-DINH-TU-VAN-16-10.md mục 8 ("Thử: phúc lành giữa ải, chọn 1 trong 3, chỉ có tác dụng trong lượt ải đó, cờ tắt, đo bot") và
TU-VAN-CHATGPT-TOAN-BO-16-10.md mục 1 (5:00–5:30 của mười phút đầu: "chọn một trong ba phúc lành") và mục 6 (vô tận sau này: cứ hai đợt chọn một phúc lành).
Làm sau phiên "Vũ khí B" (đã gộp bao-cao-B: khựng hình, đẩy lùi, đòn nối) — không sửa combat.js / moves.js.

## Tóm tắt

| Việc | Đã làm |
|---|---|
| Lúc nào | Mỗi lượt ải thường (không tính ải ngày): dọn xong **phòng quái thứ 2 hoặc 3** (theo hạt giống bản đồ) thì sau 0,9 giây trận dừng, hiện bảng 3 thẻ. **Ải 1 Rừng già luôn là phòng thứ 2.** |
| Cách chọn sinh bản đồ | **Không đụng** `mapgen.js`, không thêm loại phòng "Miếu thờ": đếm phòng quái đã dọn (`fight` + `elite`) như điều kiện Suối hồi. Ít đụng nhất. |
| 3 thẻ | 1 thẻ **Vũ khí** (hợp món đang mang), 1 thẻ **Né**, 1 thẻ **Hệ** (hợp hệ đang có; chưa có hệ thì Than hồng). |
| Người mới | Ải 1 lần đầu (chưa từng chọn — `G.save.tut.phucLanh`): 3 thẻ dễ hiểu cố định (vũ khí cận chiến đang cầm · Ngựa sắt · Than hồng) và dòng dạy "Phúc lành đổi cách đánh tới hết ải này. Chạm một thẻ để chọn." |
| Tồn tại | Nằm trên lượt ải (`S.pl`), hết ải là hết. Không ghi vào bản lưu (chỉ cờ một lần ở `tut`). Bảng Tạm dừng nhắc phúc lành đang có ở lề trái. |
| Giao diện | Lớp giao diện: `G.theme.card` (khung thẻ có sẵn), biểu tượng có sẵn `gd-nut-danh-<vũ khí>` / `gd-nut-ne` / `gd-he-<hệ>`, tên + 1 câu, phím 1/2/3. Có ảnh `gd-phuc-lanh-<khoá>` thì tự dùng (prompt ở cuối). |
| Trong trận | Không thêm hình vẽ bằng code: hiệu ứng dùng lại vệt trăng Trảm Nguyệt (`W.mvSp`), phi tiêu (`W.projs`), sóng chấn búa (`W.mvWaves`), vũng cháy / độc (`W.zones` kiểu `pool`), hạt `G.burst`, `G.applyStatus`. |
| Cờ tắt | `?phuclanh=0` (`G.PHUC_LANH_BAT = false`): không bọc hàm nào, trận y như trước. |
| Tệp | `game/js/phuc_lanh.js` (mới, nạp sau `hinh_thai.js`), `index.html` (1 thẻ script), `tests/bot.js` (bot chọn thẻ), `tests/phuc_lanh.py` (đo), từ điển Anh `tools/ngon-ngu/tu-dien/phuc-lanh.json` + chép vào `js/ngon_ngu_en.js`. |

## Bảng phúc lành (14)

Số nằm ở `G.PHUC_LANH_SO` đầu `js/phuc_lanh.js`.

| # | Loại | Tên (dân gian) | 1 câu trên thẻ | Đổi cách chơi | Số |
|---|---|---|---|---|---|
| 1 | Vũ khí · Kiếm | Gươm Hồ Gươm (Lê Lợi, Rùa vàng) | Nhát kết của kiếm phóng thêm một vệt trăng nhỏ bay xuyên quái. | Kiếm có tầm xa ở nhát 3 → đánh hết chuỗi thay vì chém 2 nhát rồi né | 0,7 lần, bay 105 điểm ảnh (Trảm Nguyệt: 2,0 / 170) |
| 2 | Vũ khí · Phi tiêu | Nỏ thần Kim Quy (An Dương Vương) | Phi tiêu trúng quái thì nảy sang con gần nhất một lần. | Ném vào giữa bầy có lợi hơn ném con lẻ | 0,7 lần, tìm trong 85 điểm ảnh |
| 3 | Vũ khí · Thương | Gậy tre Thánh Gióng | Nhát đâm thứ 3 và Quét vòng của thương kéo quái về sát chân. | Thương thành món gom bầy (đâm 3 kéo vào → Quét vòng trúng cả bầy) thay vì giữ khoảng cách | kéo 75% khoảng cách, tối đa 30 |
| 4 | Vũ khí · Búa | Rìu Thạch Sanh | Nện búa xong, một dư chấn chạy ngược ra sau lưng. | Đứng giữa bầy mà nện, không sợ bị đánh sau lưng | sau 0,35 giây; nện đất 0,6 lần sóng gốc, nện thường sóng 60 điểm ảnh 0,6 lần |
| 5 | Vũ khí · mọi món | Trống đồng Đông Sơn | Tung đòn Đặc biệt xong, 3 giây sau mọi nhát thường làm quái choáng. | Nhịp "Đặc biệt → dồn đòn"; không lên trùm | choáng 0,35 giây; mỗi con nghỉ 1,2 giây; không choáng quái đang che kín đòn (giáp ≥ 0,9) |
| 6 | Né | Ngựa sắt Thánh Gióng | Lướt né để lại vệt lửa đốt quái trên đường đi. | Né xuyên bầy thành đòn tấn công | ≤ 3 vũng / lần né, 1,6 giây |
| 7 | Né | Sơn Tinh dời núi | Né xong thì đẩy bật quái quanh mình ra xa. | Né vào giữa bầy để mở chỗ thở | 38 điểm ảnh, choáng 0,35 giây (không lên trùm) |
| 8 | Né | Sóng Thủy Tinh | Được né liền hai lần rồi mới phải chờ hồi. | Né dồn hai nhịp qua đòn trùm dài | lần 2 chờ 0,3 giây |
| 9 | Né | Cá chép Ông Táo | Lướt né xuyên đạn của quái làm đạn tan, hồi chút năng lượng. | Né VÀO đạn thay vì né ra; nạp năng lượng cho Đặc biệt / Chưởng | 18 điểm ảnh, +4 năng lượng / viên |
| 10 | Né | Áo lá Mẫu Thượng Ngàn | Lướt né xuyên qua quái làm chúng chậm lại. | Né xuyên quái để làm chậm cả hàng | 1 tầng Băng, 16 điểm ảnh |
| 11 | Hệ · Lửa (luôn có) | Than hồng Ông Táo | Cứ đòn trúng thứ 3 lại gây Cháy, kể cả vũ khí chưa có hệ. | Người chưa có hệ được nếm Cháy (dạy hệ) | mỗi 3 đòn trúng |
| 12 | Hệ · Lửa | Hỏa long Lạc Long Quân | Quái đang cháy mà chết thì nổ, làm cháy quái đứng gần. | Ưu tiên đốt cả bầy rồi hạ con yếu nhất để nổ dây chuyền | 30 điểm ảnh, 0,5 lần |
| 13 | Hệ · Độc | Nọc Chằn tinh (Thạch Sanh) | Quái dính đủ 3 tầng Độc thì toả một vũng độc dưới chân. | Dồn độc một con giữa bầy → vũng lan sang bầy | vũng 20, 2,4 giây, mỗi con 1 lần |
| 14 | Hệ · Băng | Sương Mẫu Thoải | Quái vừa bị đóng băng truyền hơi lạnh sang quái đứng cạnh. | Đóng băng một con để làm chậm cả cụm | +1 tầng Băng, 34 điểm ảnh, không lan dây chuyền |

Chọn thẻ:
- Thẻ Vũ khí: trong các phúc lành hợp **4 món đang mang** (luật mới mang cả 4) + Trống đồng (mọi món).
- Thẻ Hệ: Than hồng luôn có; Hỏa long / Nọc / Sương chỉ khi một món đang mang có hệ đó (từ Mầm).
- Ngẫu nhiên theo hạt giống bản đồ (`G.ngay.ngauNhien`), **không dùng `G.rnd`**: mở bảng không làm đổi dãy ngẫu nhiên của trận (quái, tinh anh, đồ rơi) — bài kiểm theo hạt giống (`tests/trum_song.test.js`) giữ đúng.

## Số bot

`tests/phuc_lanh.py` (Node, bản lưu thật `tests/cay_luu.json` lúc vừa đủ Sức mạnh khuyên dùng từng ải). So **theo cặp**: cùng ải, cùng hạt giống `G.rnd`; "không" = bot mở bảng rồi gỡ phúc lành ngay; "có" = bot chọn 1 trong 3 thẻ (theo hạt giống bản đồ, như người chọn bừa).

| Ải | Không: thắng | Không: giây (lượt thắng) | Có: thắng | Có: giây | Khác (âm = nhanh hơn) |
|---|---|---|---|---|---|
| 1-1 | 30/30 | 168 | 30/30 | 166 | -1% |
| 1-2 | 30/30 | 204 | 30/30 | 202 | -1% |
| 1-3 | 29/30 | 276 | 30/30 | 276 | +0% |
| 1-4 | 29/30 | 308 | 29/30 | 303 | -2% |
| 1-5 | 51/60 | 324 | 52/60 | 323 | -0% |
| 2-1 | 29/30 | 252 | 29/30 | 248 | -2% |
| 2-2 | 25/30 | 268 | 24/30 | 261 | -3% |
| 2-3 | 28/30 | 271 | 29/30 | 270 | -0% |
| 2-4 | 26/30 | 290 | 25/30 | 285 | -1% |
| 2-5 | 50/60 | 296 | 52/60 | 293 | -1% |
| 3-1 | 28/30 | 277 | 28/30 | 275 | -1% |
| 3-2 | 28/30 | 269 | 28/30 | 268 | -0% |
| 3-3 | 24/30 | 323 | 26/30 | 328 | +2% |
| 3-4 | 27/30 | 365 | 27/30 | 362 | -1% |
| 3-5 | 35/60 | 343 | 38/60 | 343 | +0% |

**Gộp 15 ải (so theo cặp, 458 cặp cùng thắng): có phúc lành nhanh hơn +0,6%** (ngưỡng ≤ 10%). Thắng 477/540 (88%) so với 469/540 (87%).

**Trùm vùng** (60 lượt mỗi trùm):
- vùng 1: không 51/60 → có 52/60
- vùng 2: không 50/60 → có 52/60
- vùng 3: không 35/60 → có 38/60
- gộp: 76% → 79% (+3 điểm)

→ không vọt (+3 điểm, trong nhiễu).

Lệnh: `python3 tests/phuc_lanh.py 30 - --tron=60` (1.080 lượt, ~5 phút với 2 tiến trình Node).

### Đo riêng từng phúc lành (ép phúc lành, 6 ải × 10 hạt giống; Nỏ thần / Gậy tre / Rìu đo với đúng món đó làm món chính, so với đối chứng cùng món)

| Phúc lành | Thắng (đối chứng) | Nhanh hơn (theo cặp) |
|---|---|---|
| guom | 93% (93%) | +1,6% (55 cặp) |
| no | 90% (88%) | +1,7% (51 cặp) |
| tre | 65% (65%) | +0,4% (39 cặp) |
| riu | 68% (68%) | +0,7% (41 cặp) |
| trong | 95% (93%) | +2,1% (55 cặp) |
| ngua | 97% (93%) | +1,3% (56 cặp) |
| nui | 90% (93%) | -0,0% (53 cặp) |
| song | 93% (93%) | +1,3% (54 cặp) |
| ca | 93% (93%) | +0,6% (54 cặp) |
| ngan | 88% (93%) | +1,4% (52 cặp) |
| than | 95% (93%) | +4,5% (56 cặp) |
| hoa | 95% (93%) | +0,2% (56 cặp) |
| noc | 92% (93%) | +0,5% (55 cặp) |
| suong | 93% (93%) | +0,4% (56 cặp) |

Lệnh: `python3 tests/phuc_lanh.py 10 1,3,6,8,11,13 --rieng`. Cao nhất Than hồng +4,5% (có hiệu lực ở mọi món, mọi người chơi); không phúc lành nào vượt 5%.

Ghi chú:
- Bot không biết tận dụng phúc lành (không cố né vào đạn, không cố gom bầy), nên số trên là "người chọn bừa, chơi như cũ". Người chơi tận dụng sẽ nhanh hơn — còn rất nhiều chỗ trước ngưỡng 10%.
- Gậy tre lần đo đầu không tác động: bot thương gần như không đánh tới nhát Quét vòng (nhát 4). Đã thêm nhát đâm thứ 3 (nhát có đẩy lùi) vào phúc lành.
- Số đo ở trên chạy trước khi thêm "mỗi con nghỉ 1,2 giây" cho Trống đồng (chỉ làm Trống đồng yếu đi, không làm nhanh thêm).
- Lần đo đầu (số nhỏ hơn) phúc lành chỉ làm ải nhanh ~0,7%; đã nâng số (Gươm, Nỏ 0,55 → 0,7; Rìu 0,45–0,5 → 0,6; Trống đồng choáng 0,25 → 0,35; Ngựa sắt 0,35 → 0,5; Than hồng mỗi 4 → mỗi 3 đòn; Hỏa long 0,35 → 0,5).

## Kiểm tra

- `node --check` mọi `js/*.js`, `tests/*.js`: đạt. `python3 build.py` và `python3 build.py --hai-tep`: đạt (dist dựng lại).
- `tests/smoke.py`: 0 lỗi.
- `tests/*.test.js`: đạt bo_do_mua, cam_giac_danh, cam_giac_vk, cloud_save_regression, quai_song (69), song_luat, thuong_b2, thuong_luong, thuong_luong_3c, vung4, vung4_truyen; `may_luat` bỏ qua (thiếu thư viện, như trước).
  **5 bài đang hỏng trên nhánh hiện tại cả khi gỡ hết thay đổi của phiên này** (đã chạy lại trên mã gốc, cùng lỗi): so_yeu_quai, su_kien ("hết ải ngày phát hetAi"), thanh_tuu, trum_song ("cả hai tinh anh mới"), viec_ngay. Lúc 12:47 (trước khi kéo về các commit mới) su_kien 83 và trum_song 39 đều đạt với mã phúc lành.
- Lỗi tìm ra khi kiểm và đã sửa: Trống đồng làm Trai Sông Gai choáng liên tục → không bao giờ há vỏ → bot kẹt ải 4-1 (quai_song mục 5). Nay mỗi con nghỉ 1,2 giây và không choáng quái đang che kín đòn.
- Quét kẹt: ép từng phúc lành (14) × 5 ải (1-3, 2-4, 3-2, 4-2, 4-5), bot bất tử: 70/70 qua ải, không NaN.
- Ảnh headless (`chup_soat.py`, không chơi tay; cảnh trận là bot có sẵn tự đánh với phúc lành ép sẵn):
  - `anh-soat/bang-ai1.png` — Ải 1 lần đầu (dòng dạy, 3 thẻ cố định)
  - `anh-soat/bang-ai.png` — ải sau, có hệ Độc (Nọc Chằn tinh hiện)
  - `anh-soat/bang-en.png` — tiếng Anh
  - `anh-soat/tam-dung.png` — bảng Tạm dừng nhắc phúc lành
  - `anh-soat/tran-ghep.png` — 4 cảnh trận: vệt trăng của Gươm Hồ Gươm, vệt lửa Ngựa sắt, dư chấn Rìu Thạch Sanh, phi tiêu nảy Nỏ thần
- `?phuclanh=0`: `G.phucLanh` không có bảng, không bọc hàm nào.

## Rủi ro / để ý

- Bảng mở sau 0,9 giây khi dọn xong phòng quái: nếu người chơi đang nhặt đồ rơi, đồ vẫn nằm đó sau khi chọn (trận dừng hẳn lúc chọn).
- Lớp bọc ngoài `G.kill`, `G.applyStatus`, `G.updatePlayer`, `G.moves.hit / onHit / arrowHit / special`, `G.StageScene.update / draw`, `G.startStage`: giữ lại dấu của lớp bọc trước (`suKienBoc`…). Phiên sau đổi tên `mv.cur.kind` ('chem', 'dam', 'quet', 'nen', 'nenDat') hay `m.finish` / `m.day` thì Gươm / Gậy tre / Rìu ngừng tác dụng (không lỗi) — bài `tests/phuc_lanh.py --rieng` sẽ thấy "+0%".
- Vô tận / thử thách tuần (TU-VAN mục 6) dùng lại được: gọi `G.phucLanh.moi(S)` rồi đặt `S.mode = 'phuclanh'`.
- Chưa có biểu tượng riêng: đang dùng biểu tượng nút đánh / nút né / hệ có sẵn (ba thẻ cùng loại trông giống nhau). Prompt ảnh ở dưới.

## Prompt ảnh biểu tượng (tuỳ chọn)

Mỗi ảnh một biểu tượng vuông, đặt tên `gd-phuc-lanh-<khoá>` (khoá ở đầu mỗi khối) khi nhập qua Xưởng ảnh như các `gd-*` khác; game tự dùng khi có, chưa có thì dùng biểu tượng hiện tại.

`gd-phuc-lanh-guom`
```
Pixel art game icon, a short bronze Vietnamese sword with a small golden turtle on the hilt, a thin white crescent arc flying off the blade. Centered, single object, bold dark outline, warm folk Vietnamese style, 64x64, no text, no frame, flat solid #00FF00 background.
```

`gd-phuc-lanh-no`
```
Pixel art game icon, a golden crossbow decorated with a turtle shell pattern, one small dart bouncing off in a zigzag arc. Centered, single object, bold dark outline, warm folk Vietnamese style, 64x64, no text, no frame, flat solid #00FF00 background.
```

`gd-phuc-lanh-tre`
```
Pixel art game icon, a green bamboo pole with a few leaves, curved motion lines pulling inward toward its center. Centered, single object, bold dark outline, warm folk Vietnamese style, 64x64, no text, no frame, flat solid #00FF00 background.
```

`gd-phuc-lanh-riu`
```
Pixel art game icon, a heavy woodcutter axe with a dark iron head, two cracked ground shockwave arcs, one in front and one behind. Centered, single object, bold dark outline, warm folk Vietnamese style, 64x64, no text, no frame, flat solid #00FF00 background.
```

`gd-phuc-lanh-trong`
```
Pixel art game icon, a Dong Son bronze drum seen from above, sun-star pattern with radiating rays and flying birds on the rim. Centered, single object, bold dark outline, warm folk Vietnamese style, 64x64, no text, no frame, flat solid #00FF00 background.
```

`gd-phuc-lanh-ngua`
```
Pixel art game icon, a dark iron horse head breathing a small flame, orange fire trail below. Centered, single object, bold dark outline, warm folk Vietnamese style, 64x64, no text, no frame, flat solid #00FF00 background.
```

`gd-phuc-lanh-nui`
```
Pixel art game icon, a small brown mountain peak with a burst of dust pushing outward on both sides. Centered, single object, bold dark outline, warm folk Vietnamese style, 64x64, no text, no frame, flat solid #00FF00 background.
```

`gd-phuc-lanh-song`
```
Pixel art game icon, two curling blue water waves side by side, white foam tips. Centered, single object, bold dark outline, warm folk Vietnamese style, 64x64, no text, no frame, flat solid #00FF00 background.
```

`gd-phuc-lanh-ca`
```
Pixel art game icon, an orange and red carp fish leaping in an arc, small sparkles where it passes. Centered, single object, bold dark outline, warm folk Vietnamese style, 64x64, no text, no frame, flat solid #00FF00 background.
```

`gd-phuc-lanh-ngan`
```
Pixel art game icon, a cloak made of green forest leaves with a light blue frost shimmer on the edges. Centered, single object, bold dark outline, warm folk Vietnamese style, 64x64, no text, no frame, flat solid #00FF00 background.
```

`gd-phuc-lanh-than`
```
Pixel art game icon, glowing red hot charcoal embers in a small clay stove, tiny sparks rising. Centered, single object, bold dark outline, warm folk Vietnamese style, 64x64, no text, no frame, flat solid #00FF00 background.
```

`gd-phuc-lanh-hoa`
```
Pixel art game icon, a coiled red-gold Vietnamese dragon head breathing a round fire burst. Centered, single object, bold dark outline, warm folk Vietnamese style, 64x64, no text, no frame, flat solid #00FF00 background.
```

`gd-phuc-lanh-noc`
```
Pixel art game icon, a green python head with fangs dripping purple-green venom drops. Centered, single object, bold dark outline, warm folk Vietnamese style, 64x64, no text, no frame, flat solid #00FF00 background.
```

`gd-phuc-lanh-suong`
```
Pixel art game icon, a light blue snowflake inside a swirl of mist, small ice crystals around it. Centered, single object, bold dark outline, warm folk Vietnamese style, 64x64, no text, no frame, flat solid #00FF00 background.
```
