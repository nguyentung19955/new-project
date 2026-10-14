# Báo cáo: Mộc Tinh + Hồ Tinh mới, phân thân, 9 hiệu ứng chiêu trùm, nền Hang biển + Lâu đài — 14/10

Commit: **`db861c2b`** (nhánh `khoi-tao-du-an`). Không chạy game, không Playwright. Chỉ xử lý ảnh, làm ảnh soát tĩnh, `node --check` 8 tệp JS đã sửa, chạy `python3 game/build.py` (cả `--hai-tep`). Không đổi số cân bằng. Không đụng `firebase-config.js`, đăng nhập, lưu mây, `?cloud=0`.

## 1. Mộc Tinh + Hồ Tinh mới (`cong-cu/dung-moc-ho.py`)
- Làm cùng cách Ngư Tinh. Đã thay 6 tệp `mocTinh*.sprite.json` và `hoTinh*.sprite.json`.
  - Pha 1 có 6 hàng (idle, move, tele, atk, hit, die). Pha 2 và 3 có 4 hàng.
  - Nét ×2, mỗi pha một bảng 128 màu. Giữ `rong`/`cao`, không đụng hộp va chạm.
- **Co cỡ**: mỗi hàng dùng một hệ số chung.
  - Trong một pha: đo bằng SIFT so với hàng đứng.
  - Hàng ít điểm khớp: đo theo chiều cao khung tư thế trung tính. Gồm Mộc trúng đòn p1, báo đòn p2, đánh p2. Ở các hàng khớp tốt, cách đo này cho cùng kết quả với SIFT.
  - Giữa các pha:
    - Mộc: theo chiều cao đứng, nên cả 3 pha cao bằng nhau như con cũ.
    - Hồ: pha 2 = 0,88 (SIFT 0,91, đo tay 0,81); pha 3 = 0,85 (đo tay).
- **Cỡ đứng pha 1**: Mộc 131, Hồ 119 điểm game, bằng con cũ.
- **Đất**: theo trung vị chân của hàng. Neo ngang theo giữa dải chân, đã bỏ các điểm hiệu ứng rực màu.
- **Nhịp đòn**: hàng atk bắt đầu từ khung chạm (khung tính từ 0). Các khung trước khung chạm được nối vào cuối hàng tele.
  - Mộc: khung 2 ở cả 3 pha (gai, lửa, độc trồi lên).
  - Hồ: pha 1 khung 3 (bắn cầu lửa), pha 2 khung 2 (nổ), pha 3 khung 1 (vuốt).
- **Cắt bớt hiệu ứng**: phần cao quá 1,8 lần chiều cao đứng bị cắt. Gồm ngọn cột bào tử của Mộc pha 3 và mép cầu lửa của Hồ báo đòn pha 1.
- **Cỡ tệp**:
  - Mộc: 1,24 / 0,90 / 0,89 MB (cũ 0,78 / 0,38 / 0,36 MB).
  - Hồ: 1,27 / 1,06 / 1,18 MB (cũ 1,38 / 0,41 / 0,38 MB).

## 2. Phân thân Hồ Tinh pha 2
- **Nguyên nhân**: khi thân là ảnh AI, bút giả coi lệnh vẽ đầu tiên là thân. Hai bóng ma vẽ trước thân nên bị nuốt, và bản sao không hiện.
- **Cách sửa**:
  - Bóng ma có cờ `phanThan` gửi lệnh riêng `drawImage('bongMa', dx, dy, độ đậm, màu)`.
  - `sprite_custom.js` vẽ chính ảnh Hồ Tinh đúng khung động tác, lệch ±46. Độ trong 0,5 ± 0,06, nhuộm tím hồng `#d468e0` 60%.
  - Các bóng ma khác (vệt lao) vẫn không vẽ như trước.
- Cờ tắt: `?phanthan=0`.

## 3. Chín hiệu ứng chiêu trùm (`cong-cu/dung-hieu-ung-trum.py`)
Tạo 9 tệp `game/art/custom/hu-*.sprite.json`. Cờ tắt chung `?hutrum=0` (`G.huTrum`). Thiếu ảnh thì vẽ bằng code như cũ. Không đổi vùng, sát thương, thời gian.

| Mã | Móc vào | Cỡ |
|---|---|---|
| hu-song-than | `mobs.js drawWall`: xếp nối mỗi 14 điểm dọc tường thật, chừa khe, chỉ trong phòng, giữ chấm đỏ mép trước. Thêm `monster_art` Ngư c2 | sóng cao ~30 |
| hu-bang-nhon-roi | `boss.js` Ngư c4: đặt tại 7 vùng thật, khung chạm trùng lúc nổ. Thêm vòng cột băng lúc sang pha 3 | vùng r16 |
| hu-xoay-nuoc | Ngư c5 | phủ tới r112 |
| hu-phun-bang | Ngư c3: từ miệng, xoay theo hướng phun | dài 125 = tầm nón |
| hu-gai-re | `boss.js` Mộc c2: tại các vùng thật. Mộc c5: theo đúng ba vòng thật (bán kính, khe, lúc nổ truyền qua `o.vongGai`) | vùng r14 |
| hu-qua-doc-roi | `boss.js` Mộc c3: tại các vùng thật | vùng r18 |
| hu-la-chem | Mộc c1: xoay theo hướng chém | nón r118 |
| hu-cau-lua-ma | `fx_dan.js`: đạn lửa của Hồ Tinh (c1, c5). Thêm cầu lửa trang trí ở c1 | ~25 điểm |
| hu-doi-pha | `TRUM.doiPha` (cả 3 trùm): nhuộm theo màu pha | 2,6 × bán kính thân |

- Hiệu ứng vẽ trong cử động trùm dùng bút thật (`c.__that`), nên bút giả không nuốt mất ảnh.
- Trong trận, hình trang trí quanh trùm của Ngư c4, Mộc c2 và Mộc c3 bị bỏ, để không vẽ hai lần.

## 4. Nền Hang biển + Lâu đài (`cong-cu/cat-nen-bien-lau.py`)
Tạo 18 tệp `gd-nen-bien-*` và `gd-nen-lau-*`, cùng tên đuôi với bộ Rừng.
- **Lâu đài**:
  - Sàn cắt đúng 4 chu kỳ ron, nên lát vẫn nối ron đều. Mảng gốc hơi bẹt nên bị co vuông.
  - Tường sau cắt từ giữa cột đỏ 1 tới giữa cột đỏ 3, bỏ hai đầu mái cong.
  - Lan can được lót màu tối cho kín.
  - Thảm `gd-tt-lau-tham-*` giữ nguyên, trải lên sàn tile theo kiểu phòng.
- **Hang biển**:
  - Sàn lấy 3 vùng của `hang-bien-san-lien.png`.
  - san0 được làm liền mép bằng trộn mép. san1 và san2 lấy viền chung của san0, nên ghép mảng nào với nhau cũng liền.
  - Vì vậy sàn Hang biển **không lật ngang** (`TRV.bien.lat = false`).
  - san-nhan lấy lòng ô 4 (vũng nước + san hô), đã bỏ viền đá.
- **Code**: `room_art.js` thêm `tileVung` cho Cave/Castle: nền ngoài, sàn, tường sau, tường bên, tường trước, phủ mép.
  - Bộ Rừng giữ nguyên. Lớp lối mòn không vẽ cho hai vùng này.
  - Cờ `?nentile=0` (`G.NEN_TILE`) chỉ tắt hai vùng mới; Rừng vẫn theo `?tile=0`.
  - Thiếu tệp bắt buộc thì vẽ bằng code.

## Ảnh soát (thư mục này)
- `xem-moc-ho.png`: mọi hàng × 3 pha × 2 trùm, cùng tỉ lệ, có hàng đứng của con cũ ở trên để so.
- `xem-hieu-ung-trum.png`: 9 hiệu ứng ở cỡ dùng trong game, kèm vòng vùng sát thương.
- `xem-nen.png`: lát thử một phòng trùm mỗi vùng bằng script (chưa có ánh sáng, cửa, đồ trang trí).

## Cần chủ dự án xem khi chơi
1. **Phân thân Hồ Tinh pha 2**: hai bản sao mờ tím hồng hai bên. Xem độ đậm 0,5 có hợp không, và có che trận không.
2. **Mộc Tinh**:
   - Pha 2: hàng báo đòn và đánh trông to ngang hơn hàng đứng (tư thế khom).
   - Pha 3: bào tử bị cắt ngọn.
   - Hàng đứng pha 2 đỏ hơn các hàng khác (đã chấp nhận).
3. **Nhịp đòn**: khung chạm của Mộc và Hồ có trùng lúc vùng đỏ nổ không. Nửa sau cảnh chuyển pha hiện các khung vung đòn nối vào cuối hàng tele.
4. **Hướng và vị trí hiệu ứng**:
   - Khi trùm quay trái, lá chém và phun băng bị xoay 180° (lật dọc).
   - Ảnh phun băng neo ở điểm miệng của hình code cũ, có thể lệch với miệng con mực mới.
   - Sóng thần lúc tường chạy dọc (trên ↔ dưới) trông thế nào.
5. **Đổi pha**: ảnh khá to (2,6 × bán kính thân), màu nhuộm theo màu pha.
6. **Nền**:
   - Hang biển: tường bên có mép trong suốt, nên lộ nền nước ngoài.
   - Lâu đài: tường sau có cột đỏ riêng, các cột đá code vẫn vẽ đè lên.
   - Sàn Hang biển không lật nên đôi khi thấy hai mảng giống nhau cạnh nhau.
7. **Dung lượng**:
   - Ảnh trên máy chủ (bản `--hai-tep`) là 31,7 / 26 MB, **vượt trần**. Trần đã bị vượt từ trước đợt này. Đợt này thêm khoảng 2,2 MB, chủ yếu do tấm Mộc/Hồ to hơn.
   - Bản một tệp 29,35 / 30 MB.
   - Có thể giảm bằng cách hạ số màu xuống 96, hoặc cắt hiệu ứng thấp hơn.
