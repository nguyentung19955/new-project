# Báo cáo: lối đánh riêng của từng vũ khí và hiệu ứng riêng của từng hệ

Nhánh: `claude/chieu-thuc-va-he`, tách từ `khoi-tao-du-an` (commit b68089b).

Kết quả chính: cả hai yêu cầu đã làm xong và chơi được. Bốn vũ khí có bốn lối đánh khác nhau, ba hệ có ba kiểu ra chiêu khác nhau. Hai luật cốt lõi (vũ khí tiến hóa theo dấu ấn, trùm học thói quen người chơi) vẫn chạy như cũ. Có bốn điểm còn yếu cần chủ dự án biết, ghi ở mục 6.

Ảnh để xem nhanh (cùng thư mục này):

- `kieu-danh-bon-vu-khi.png`: mỗi vũ khí một hàng, các khung liên tiếp của lối đánh.
- `hieu-ung-ba-he.png`: cùng một chuỗi kiếm ở bốn trạng thái: chưa có hệ, Lửa, Độc, Băng.
- `kiem-ba-he.png`, `cung-ba-he.png`, `giao-ba-he.png`, `bua-ba-he.png`: mỗi vũ khí một lưới, mỗi hàng một hệ ở mốc Thức tỉnh, hai khung cuối là đòn Đặc biệt.

## 1. Mỗi vũ khí đánh thế nào

Vẫn chỉ dùng các nút cũ. Khác nhau ở cách bấm nút Đánh: bấm, bấm liên tiếp, giữ rồi thả.

| Vũ khí | Bấm | Bấm liên tiếp | Giữ rồi thả | Khác |
| --- | --- | --- | --- | --- |
| Kiếm | Chém ngang | Chuỗi 3 nhát: chém ngang, chém ngược, nhát kết. Nhát kết mạnh gần gấp đôi, với xa và rộng hơn, đẩy lùi quái. Ngừng bấm 0,45 giây thì chuỗi về đầu. | Giữ nút thì chuỗi tự nối tiếp | Đánh ngay sau khi Né (trong 0,35 giây) ra nhát lướt: trượt tới 30 điểm ảnh, chém mạnh hơn nhát thường |
| Cung | Bắn một mũi tên thường, bay khoảng 215 điểm ảnh | Bắn liên tục | Giữ để giương cung, có vạch lấy đà trên đầu. Đầy sau khoảng 0,9 giây. Thả ra bắn tên mạnh gấp 3, xuyên qua 4 quái (trúng tối đa 5 con). | Đứng yên bắn nhanh hơn (0,40 giây một phát so với 0,47 giây khi đang chạy). Đang giương thì đi chậm lại. |
| Giáo | Đâm thẳng, xa (54 điểm ảnh), hẹp, nhanh | Ba nhát đâm rồi một cú quét vòng quanh người, trúng cả quái sau lưng | Giữ 0,5 giây rồi thả: xốc tới tối đa 58 điểm ảnh, xuyên qua quái | |
| Búa | Nện chậm, nặng, làm quái khựng 0,4 giây | Nện liên tục | Giữ để lấy đà 2 nấc (0,5 giây và 1,1 giây), có vạch nấc. Thả ra nện đất và có sóng chấn động chạy trên mặt đất (60 hoặc 96 điểm ảnh). Nấc 2 làm choáng. | Đang lấy đà thì đi chậm còn 45% |

Mấy điều cần biết thêm:

- Lấy đà đầy rồi mà vẫn giữ quá 0,8 giây thì đòn tự tung ra. Nhờ vậy giữ mãi nút Đánh vẫn đánh được, chỉ chậm hơn.
- Lăn né, đổi vũ khí, dùng đòn Đặc biệt hay kỹ năng thì phần đà đang lấy bị bỏ.
- Dòng chỉ dẫn: khi vào ải và lần đầu đổi sang một vũ khí, màn hình hiện một dòng trong 5 giây, ví dụ "Cung: bấm để bắn nhanh. Giữ Đánh để giương cung, thả ra bắn tên mạnh xuyên quái."
- Mọi tầm đánh tính bằng điểm ảnh vừa phải, lao sát tường thì dừng ở tường, nên chạy được trong phòng nhỏ. Đòn nào cũng có bề rộng theo chiều sâu (kiếm 20 đến 30, giáo đâm 12, quét vòng và nện đất là hình tròn, sóng chấn động 26).
- Đòn Đặc biệt của bốn vũ khí (Chém lướt, Mưa tên, Lao tới, Nện đất) giữ nguyên luật cũ. Tôi không sửa chúng, chỉ thêm phần hiệu ứng hệ.

## 2. Mỗi hệ có gì

Áp dụng khi vũ khí đã có nhánh hệ (hoặc đang được phủ hệ, tính như mốc Mầm). Mạnh dần theo mốc: Mầm 50%, Thành hình 75%, Thức tỉnh 100%.

| | Nhát thường | Nhát kết chuỗi, đòn giữ rồi thả, đòn Đặc biệt | Tên | Luật mới |
| --- | --- | --- | --- | --- |
| Lửa | Lưỡi lửa cam đỏ bám dọc vệt đòn, tàn lửa bay | Nổ nhỏ lan ra, để lại vệt cháy trên đất 2 đến 3 giây | Nổ khi trúng; tên mạnh đầy đà nổ to và để lại vệt cháy | Quái đi vào vệt cháy thì bị đốt |
| Độc | Vệt xanh lục viền tím, nhỏ giọt xuống đất | Để lại màn khói độc lơ lửng 2,6 đến 3,8 giây | Tách ra mảnh độc bay chéo ra sau khi trúng | Quái đứng trong màn khói mỗi giây thêm 1 tầng Độc. Quái chết khi đang trúng độc thì lây sang quái gần (1 tầng, Thức tỉnh 2 tầng). |
| Băng | Vệt trắng xanh gãy góc, có gai nhọn, mảnh băng văng | Gai băng mọc từ đất theo hướng đánh | Xuyên thêm 1 quái; tên mạnh đầy đà chắc chắn làm chậm | Gai băng gây sát thương và thêm tầng Băng. Quái đang đóng băng bị đánh thì lớp băng vỡ, mảnh văng trúng quái quanh đó (mỗi lần đóng băng vỡ một lần). |
| Chưa có hệ | Vệt trắng như cũ | Không có gì thêm | Tên thường | |

Mọi sát thương mới của hệ vẫn đi qua `G.damage`, `G.applyStatus` và `G.kill` của `combat.js`. Vì vậy kết liễu quái đang dính trạng thái vẫn cho dấu ấn, và sát thương vẫn được cộng vào thống kê hệ, đánh xa hay đánh gần mà trùm dùng để kháng. Lao tới của giáo không tính là lăn né. Các điều này có bài kiểm tra riêng.

## 3. Con số cân bằng

Đo bằng `tests/dps.py`: bot đánh 90 giây trong sân tập có quái hồi sinh liên tục, 16 hạt giống ngẫu nhiên, hero Thợ Rèn cấp 10, bỏ thưởng vũ khí ưa thích. Đơn vị: sát thương mỗi giây.

**Bốn vũ khí, chưa có hệ, phòng dài như hiện nay**

| | Kiếm | Cung | Giáo | Búa | Lệch nhiều nhất so với trung bình |
| --- | --- | --- | --- | --- | --- |
| Trước | 44,3 | 54,5 | 41,0 | 52,6 | 15% |
| Sau | 49,7 | 51,7 | 48,6 | 45,9 | 6% |

**Bốn vũ khí, chưa có hệ, phòng nhỏ 208 điểm ảnh (chuẩn bị cho phòng mới)**

| | Kiếm | Cung | Giáo | Búa | Lệch nhiều nhất |
| --- | --- | --- | --- | --- | --- |
| Trước | 67,4 | 66,2 | 57,9 | 89,5 | 27% |
| Sau | 70,3 | 57,2 | 67,7 | 74,6 | 15% |

**Ba hệ ở mốc Thức tỉnh (trung bình bốn vũ khí, phòng dài)**

| | Lửa | Độc | Băng | Lệch nhiều nhất |
| --- | --- | --- | --- | --- |
| Trước | 54,8 | 64,1 | 49,3 | 14% |
| Sau | 59,0 | 67,5 | 58,8 | 9% |

**Từng vũ khí ở mốc Thức tỉnh, sau khi sửa (phòng dài)**

| | Lửa | Độc | Băng |
| --- | --- | --- | --- |
| Kiếm | 57,3 | 62,6 | 58,1 |
| Cung | 66,4 | 83,4 | 71,7 |
| Giáo | 57,7 | 66,0 | 58,8 |
| Búa | 54,5 | 57,9 | 46,6 |

**Bot chơi hết 15 ải (`tests/campaign.py`), 9 lượt mỗi bản**

| | Số lần thua (cả 9 lượt) | Thời gian trung bình | Tổng sao trung bình | Dấu ấn nhặt được trung bình |
| --- | --- | --- | --- | --- |
| Trước | 2 | 55,9 phút | 26,0 | 386 |
| Sau | 2 | 53,1 phút | 27,8 | 479 |

Độ khó chung không đổi. Số dấu ấn dao động rất mạnh giữa các lượt (từ khoảng 200 đến 700 ở cả hai bản).

## 4. Tốc độ khung hình

Đo bằng `tests/perf.py --so <bản cũ>`: 14 con quái không chết đứng dồn một chỗ, bot đánh liên tục, 900 khung cho mỗi trường hợp, tính thời gian cập nhật cộng vẽ một khung.

| | Trước | Sau |
| --- | --- | --- |
| Trung bình 16 trường hợp (4 vũ khí x không hệ và 3 hệ) | 1,17 ms | 1,38 ms (bằng 117%) |
| Trường hợp chậm nhất | | Kiếm hệ Độc: 1,45 ms so với 1,01 ms (bằng 144%) |

Trung bình nằm trong mức cho phép (không chậm hơn quá 20%). Riêng vài trường hợp có hệ thì vượt mức đó, xem mục 6. Sau lần đo này tôi thêm một giới hạn hiệu ứng khi một đòn trúng quá 5 quái; đo lại thì trung bình còn 1,36 ms.

Những việc đã làm để giữ tốc độ: dùng chung kho hạt có trần 400 của `fx.js`; hình vệt cháy và màn khói được vẽ sẵn một lần rồi dán lại mỗi khung; số vệt cháy và màn khói trên sân có trần là 6; một đòn trúng cả đám thì chỉ 5 con đầu có đủ tia lửa.

## 5. Bài kiểm tra đã chạy (lần chạy cuối, trên mã của commit này)

| Bài | Kết quả |
| --- | --- |
| `tests/rules.py` (luật cốt lõi cũ) | 82/82 đạt |
| `tests/moves.py` (mới: chuỗi kiếm, giữ thả cung, lao giáo, lấy đà búa, luật Lửa, Độc, Băng, dấu ấn và thống kê trùm) | 88/88 đạt |
| `tests/fuzz.py` (bấm loạn, 15 giây và 30 giây mỗi phòng) | 0 lỗi |
| `tests/fx_check.py` (có vẽ; đã thêm kiểm tra `fx_he.js`) | 0 lỗi |
| `tests/ui_input.py all` (4 cỡ màn hình) | 93/93, 93/93, 84/84, 93/93 đạt |
| `tests/ui_robust.py` | 17/17, 1/1, 16/16 đạt |
| `tests/ui_build.py` (đóng gói rồi chơi thử) | đạt |
| `tests/env_rooms.py`, `tests/anim_smoke.py`, `tests/smoke.py` | 90 phòng 0 lỗi; không lỗi (smoke chỉ báo không tải được phông chữ từ mạng, giống trước khi sửa) |
| `tests/dps.py 90 16` phòng dài | đạt (vũ khí lệch 6%, hệ lệch 9%) |
| `tests/dps.py 90 16 nho` phòng nhỏ | KHÔNG đạt ngưỡng của bài: vũ khí lệch 15,1% (ngưỡng 15%), hệ lệch 15% |
| `tests/perf.py --so` | đạt ngưỡng trung bình (117%) |
| `tests/campaign.py` 9 lượt | 2 lần thua trong 9 lượt, bằng bản cũ |

Bài kiểm tra cũ đã sửa vì luật đổi có chủ ý (hai chỗ trong `tests/ui_input.py`): giữ nút Đánh khi cầm cung nay là giương cung chứ không bắn liên tục, nên bài "hai ngón" chấp nhận trạng thái đang giương và kiểm tra thêm là thả ra thì tên bay; bài "phím J" chờ thêm 0,12 giây sau khi nhả phím.

Bot (`tests/bot.js`) đã biết: giữ nút với kiếm; bấm nhịp với cung, giáo, búa; giữ lấy đà khi có từ hai quái trong tầm đòn mạnh (hoặc quái còn xa đối với cung); trong phòng nhỏ thì cung đứng gần hơn.

## 6. Chỗ còn yếu

1. **Vài trường hợp có hệ chậm hơn mức 20%.** Trong cảnh thử 14 quái không chết, kiếm hệ Độc chậm hơn 44%, giáo có hệ chậm hơn khoảng 40%. Lý do chính: quái không chết nên dính trạng thái dồn lại rất nhiều, phần vẽ trạng thái trên từng con (có sẵn từ trước) tốn thêm. Con số tuyệt đối vẫn nhỏ trên máy đo (dưới 2 ms mỗi khung), nhưng tôi chưa đo trên điện thoại thật.
2. **Cung có hệ vẫn mạnh nhất, búa hệ Băng yếu nhất.** Ở Thức tỉnh, cung cao hơn trung bình bốn vũ khí khoảng 19% (bản cũ cũng cao hơn khoảng 18%), búa Băng thấp nhất bảng. Đây là lệch có từ trước; tôi đã giảm phần cộng thêm của cung nhưng không sửa tận gốc vì phải đụng tới tỉ lệ gây hiệu ứng trong `data.js`.
3. **Trong phòng nhỏ cung yếu hơn ba vũ khí kia khoảng 15%.** Khi phòng mới (208x196) làm xong cần đo lại bằng `tests/dps.py nho` và chỉnh số ở đầu `moves.js`.
4. **Vũ khí có thể tiến hóa nhanh hơn một chút.** Các luật hệ mới làm nhiều quái dính trạng thái hơn, nên số dấu ấn bot nhặt được tăng khoảng 24% (386 lên 479, dao động lớn). Luật dấu ấn không đổi, nhưng nếu muốn giữ nhịp tiến hóa cũ thì nên nâng nhẹ các mốc 30, 120, 300.
5. Giáo có hai đòn lao (giữ rồi thả "Xốc tới" và đòn Đặc biệt "Lao tới"), kiếm có hai đòn lướt (nhát lướt sau khi né và đòn Đặc biệt "Chém lướt"). Tôi phân biệt bằng độ dài, sức mạnh và mana, không đổi đòn Đặc biệt. Nếu thấy trùng thì nên thiết kế lại đòn Đặc biệt.
6. Sóng chấn động của búa khi chưa có hệ hơi khó thấy trên nền tối.
7. Ngưỡng phân biệt bấm và giữ là 0,16 giây, chưa thử bằng ngón tay trên điện thoại thật. Lời chỉ dẫn ải đầu "Giữ nút Đánh để ra đòn" vẫn đúng với kiếm (vũ khí của ải đầu) nên tôi không sửa `stage.js`.
8. Hình hero: lúc lấy đà dùng lại một khung có sẵn của động tác đánh; giáo quét vòng có thêm một tư thế mới làm ở mức tối thiểu. Hero sắp thay bằng sprite nên tôi không làm kỹ hơn.
9. Dòng chỉ dẫn vũ khí hiện lại ở mỗi ải (chưa lưu vào bản lưu là đã xem).

## 7. Ghi chú để ghép với các phiên khác

**File mới (phần lớn mã nằm ở đây)**

- `game/js/moves.js` (537 dòng): lối đánh và luật hệ. Mọi con số cân bằng nằm ở đầu file trong `G.MOVES` và `G.HE`, lời chỉ dẫn trong `G.MOVE_TIPS`.
- `game/js/fx_he.js` (521 dòng): hình ảnh theo lối đánh và theo hệ, vạch lấy đà.
- `game/tests/moves.py`, `dps.py`, `perf.py`, `chieu_shots.py`.

**Dòng đã sửa trong file dùng chung** (số dòng theo bản mới)

- `game/index.html`: thêm 2 thẻ script (`moves.js` sau `combat.js`, `fx_he.js` sau `fx.js`).
- `game/build.py`: KHÔNG sửa. File này không có danh sách tệp riêng, nó đọc thứ tự script từ `index.html`.
- `game/js/combat.js` (thêm 15 dòng, sửa 4 dòng, không đổi tên hay sắp xếp lại gì):
  - 296: trong `G.kill`, gọi `G.moves.onKill`.
  - 330: trong `playerHit`, gọi `G.moves.onHit`.
  - 428 đến 429: xuất `G.cb = { playerHit, meleeBox, hitProps, nearest, startAttack, doHit }`.
  - 455: cuối `special`, gọi `G.moves.special`.
  - 532 đến 533: đầu `G.updatePlayer`, gọi `G.moves.input`.
  - 547: đòn lướt nhận thêm tuỳ chọn `P.dashOpt`.
  - 573: tốc độ đi nhân với `G.moves.speed`.
  - 592 đến 593: nút Đánh chuyển sang `G.moves.act` (thiếu `moves.js` thì vẫn đánh kiểu cũ).
  - 613: thời điểm đòn chạm chuyển sang `G.moves.hit`.
  - 751: tên trúng quái thì gọi `G.moves.arrowHit`.
  - 795: vũng của người chơi có thể đặt nhịp riêng (`z.every`).
  - 808: mỗi khung gọi `G.moves.update` (sóng chấn động, mảnh tên, đòn hẹn giờ).
  - Tôi không đụng phần biên phòng và cửa. `moves.js` chỉ đọc `W.x0, W.x1, W.y0, W.y1` và `P.face` là 1 hoặc -1.
- `game/js/fx.js` (thêm 4 dòng, sửa 1 dòng): 1339 gọi `fx.heStep`; 1481 cho hiệu ứng có hàm vẽ riêng (`o.draw`); 1550 đến 1551 xuất bộ đồ nghề `fx.kit`.
- `game/js/hero_art.js` (thêm 11 dòng, sửa 2 dòng): 934 đến 939 tư thế giáo quét vòng; 982 bỏ tia đâm khi quét vòng; 1103 đến 1107 khung đứng yên lúc lấy đà; 1110 cho phép tư thế số 3.
- `game/README.md`: thêm cách đánh của từng vũ khí, hai file mới, bốn bài kiểm tra mới.
- `game/tests/bot.js`, `game/tests/ui_input.py`, `game/tests/fx_check.py`: như mục 5.
- `game/dist/`: đã đóng gói lại. Khi ghép nhánh nếu xung đột ở hai tệp này thì chỉ cần chạy lại `python3 build.py`.
- Không sửa `stage.js`, `env_art.js`, `village.js`, `data.js`, `boss.js`, `engine.js`, `art.js`.

**Trạng thái đòn đánh xuất trên người chơi (`P.mv`) cho lớp vẽ hero mới**

| Trường | Ý nghĩa |
| --- | --- |
| `name` | Tên đòn đang ra bằng tiếng Việt ("Chém ngang", "Nhát kết", "Tên mạnh", "Quét vòng", "Nện đất mạnh"...), chuỗi rỗng khi nghỉ |
| `kind` | Mã đòn: `chem`, `luot`, `ban`, `banManh`, `dam`, `quet`, `xoc`, `nen`, `nenDat`, `layDa` (đang lấy đà), rỗng khi nghỉ |
| `step` | Nhịp trong chuỗi, tính từ 0 (kiếm 0 đến 2, giáo 0 đến 3) |
| `chain` | Đã đánh mấy nhịp của chuỗi hiện tại |
| `charge` | Tỉ lệ lấy đà, từ 0 đến 1 |
| `level` | Nấc lấy đà (cung và giáo: 0 hoặc 1; búa: 0, 1, 2) |
| `prog` | Tiến độ đòn đang ra, từ 0 đến 1 |
| `holding` | Đang giữ nút để lấy đà |

Các trường cũ `P.atkT`, `P.atkDur`, `P.comboI` (tư thế 0 đến 3), `P.dashT`, `P.specT`, `P.castT` vẫn được đặt như trước.
