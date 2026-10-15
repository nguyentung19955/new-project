# Vùng 4 Sông sâu — Phiên 2A: 8 quái thường + kỹ năng riêng (hình tạm)

16/10/2026. Làm theo `docs/ke-hoach/buoc-3/KE-HOACH.md` mục 2.1 và mục 5 hàng "2A", `QUYET-DINH.md` (làm code ngay bằng hình tạm), báo cáo phiên 1
(`../vung-4-1/bao-cao.md`). Không chơi thử bằng trình duyệt: chỉ `node --check`, bài Node, `build.py`, ảnh soát tĩnh. Không sửa tinh anh / trùm (phiên 3A / 3B),
không sửa tệp của 2B (`song_luat.js`, `room_art.js`, `env_art.js`, `stage.js`) và 2C (`truyen.js`, `village_scene.js`, `nhac.js`, `vung4.js`).

## Tóm tắt

- Vùng 4 nay có **8 quái thường riêng** thay cho 8 con mượn Hang biển: Rái Cá Cầm Sào `raiCa`, Bầy Đỉa Trâu `diaTrau`, Ba Ba Mai Đồng `baBa`,
  Cóc Tía Phun Bọt `cocTia`, Rắn Nước Sọc `ranNuoc`, Ếch Phình Hơi `echPhinh`, Ma Da Tóc Rong `maDa`, Trai Sông Gai `traiGai` — mỗi con một kỹ năng riêng
  đúng bảng mục 2.1 (bảng số `SO`, lời mẹo `MEO` lần đầu gặp / bảng thua), có tiếng Anh.
- **Hình tạm** (chưa có ảnh): mỗi mã mượn **ảnh AI của con gần giống nhất** rồi **nhuộm màu** (`ctx.filter`); hình vẽ code của mã mới cũng đổi màu
  theo đúng phép lọc đó (khi ảnh con mượn chưa tải / trình duyệt không có `ctx.filter`). Ảnh soát: `xem-hinh-tam.png`.
- **Chỗ chờ ảnh**: `../vung-4-quai/cong-cu/dung-song.py` (chép `dung-lau.py`). Có khung cắt thì `--ghi` → ảnh thật tự thay hình tạm, không phải sửa mã.
- Tinh anh, trùm nhỏ, trùm vùng 4 **vẫn mượn Hang biển** (phiên 3A / 3B), `G.VUNG4_MUON` giữ `1`.
- **Cờ quay lui**: `?quaisong=0` (`G.QUAI_SONG = false`) → 8 vai vùng 4 mượn Hang biển y như phiên 1; `?vung4=0` → không có vùng 4.
- 3 vùng cũ **không đổi gì** (bài Node so mã quái, số `SO`, lời mẹo, `KN.CU` giữa bản thường và `?vung4=0`).

## 1. Tám quái và kỹ năng (`js/ky_nang_quai.js`, khối "SÔNG SÂU")

Mọi đòn có **vùng đỏ báo trước** ≥ báo trước của vai cũ (`KN.CU`), trừ ghi chú ở cột cuối. "Hệ" là hệ của đòn (vùng / đạn gây hiệu ứng hệ lên bé).

| Con · vai · hệ | Hình tạm ← con mượn (nhuộm) | Kỹ năng (như KE-HOACH mục 2.1) | Báo trước (vai cũ) |
|---|---|---|---|
| Rái Cá Cầm Sào · Lính xông · — | Heo Rừng Con (nâu đỏ) | **Chống sào nhảy**: vòng đỏ r 22 ở chỗ bé đứng; 0,6 s lấy đà rồi vọt lên (không nhắm được lúc bay) đáp xuống đập sào. Đáp **hụt** → "Ngẩn ra!" choáng 1 s. Đứng sát quá thì lùi lấy đà. | 1,05 s (0,58) |
| Bầy Đỉa Trâu · Bầy nhỏ · Độc | Bầy Cá Con (nâu rêu) | **Bám chân**: bò ngoằn ngoèo; gần thì nhổm (vạch đỏ 0,5 s) rồi lao; hụt thì nhổm lại lao lần 2 (vạch đỏ mới 0,45 s). Dính: "Bị bám!" — đòn Độc (ngấm độc), đỉa bám theo chân tới 2,5 s, bé **đi chậm** (cơ chế vệt nhớt sẵn có, 40%). **Lăn** → "Giũ ra!" đỉa văng ra, choáng 0,6 s. | 0,5 / 0,45 s (0,5) |
| Ba Ba Mai Đồng · Khiên · Băng | Bọ Hung Mai Cứng (xanh xám) | Giáp mai phía trước + hồi máu bạn (giữ của vai Khiên). **Vươn cổ đớp**: rụt cổ 0,6 s (vạch đỏ thẳng 70, chỉ về phía trước ±60°) rồi phóng cổ. Đớp xong cổ còn duỗi 1 s: đứng im, **không quay lại được** → lúc vòng ra sau lưng. | 0,6 s (0,6) |
| Cóc Tía Phun Bọt · Xạ thủ · Độc | Hoa Phun Bào Tử (tím) | **Phun 3 bọt** bay vòng cung (bóng tròn r 15 báo chỗ rơi 0,7 s) nhắm chỗ bé **sắp tới** (vận tốc bé × 0,8), vỡ thành vũng độc nhỏ 2 s. Bé lại gần (< 56) thì **nhảy lùi** 60 (không gây sát thương, 3 s một lần). Gọi bầy như vai Xạ thủ. | 0,7 s (0,7) |
| Rắn Nước Sọc · Nhanh nhẹn · Độc | Chồn Bóng (xanh lá) | **Lặn – trồi đớp**: trườn xuống 0,3 s, vô hình + không nhắm được, chỉ thấy **gợn nước** chạy ra sau lưng bé (1 s); trồi lên (hiện hình) với vòng đỏ r 24 trong 0,45 s rồi đớp. Chỗ "không có nước" (hàm `G.vung4Nuoc(x, y)` nếu phiên sau cài) thì không lặn, chỉ cắn thường (quạt ngắn, báo 0,45 s). | 0,45 s (0,45) |
| Ếch Phình Hơi · Cảm tử · Băng | Cá Nóc (xanh lá chấm tím) | **Phình rồi nổ**: phình 1 s (vòng đỏ r 42 đầy dần ở chỗ sẽ nổ — chỗ bé sắp tới × 0,6, tối đa 56 trước mặt), 0,3 s cuối nảy tới rồi nổ Băng, để lại **vũng nước lạnh** 2 s (đứng trong đi chậm). **Bị đánh chết trước khi nổ** → vẫn nổ, trúng **quái** đứng gần (mỗi con mất 35% máu tối đa; trùm không tính; không trúng bé). | 1,0 s (0,85) |
| Ma Da Tóc Rong · Đặt bom · Băng | Tiểu Yêu Ném Pháo (xanh nhạt) | **Ném bầu nước**: vòng đỏ r 28 từ lúc ném; bầu rơi (0,55 s) thành **xoáy nước** 1,3 s kéo bé vào tâm 28 điểm ảnh/giây (chưa tới nửa tốc chạy), hết giờ bắn nước cả vòng (đòn Băng, đóng băng ngắn như bom Băng). Vẽ code ngộ nghĩnh (Q4 = A). | 1,85 s từ lúc ném (vai cũ 2,2 tính cả lúc cắm bom; + 0,5 s vung tay = 2,35) |
| Trai Sông Gai · Gai · — | Ốc Mượn Hồn (nâu xám) | **Khép vỏ**: đòn đánh từ phía trước **không ăn** (giáp 100%, Độc trên thân vẫn mòn giáp như quái giáp cũ), quay chậm như quái giáp. **Há vỏ** (vòng đỏ quanh thân 1,4 s) → 5 vạch đỏ hình quạt 0,8 s → bắn 5 viên ngọc lăn theo vạch, **nảy lên một lần** giữa đường (lúc ngọc đang bay cao không trúng). Đang há và 0,6 s sau khi bắn: trước mặt cũng ăn đòn. | 1,4 + 0,8 = 2,2 s (2,2) |

Khác kế hoạch (ghi để chủ game biết):
- Đỉa làm chậm **40%** (không phải 20%): dùng lại cơ chế vệt nhớt của Ốc trong `js/combat.js` (không sửa `combat.js` — tệp của 3B). Bù lại: bám tối đa 2,5 s, lăn là gỡ.
- Trai Gai há vỏ **1,4 s** (kế hoạch 0,8 s) cho đủ luật "báo trước ≥ vai cũ" (vai Gai 2,2 s); ngọc "nảy trên sàn" = bay thành hai vòng cung (không nảy tường).
- "Trên sàn đá Rắn Nước không lặn được": phòng thường vùng 4 là bùn / cỏ nên lặn được mọi chỗ; chừa móc `G.vung4Nuoc(x, y)` (true = có nước / bùn) để
  phiên 3B (bãi đá phòng trùm) hay phiên sau cài — có móc thì rắn chỉ lặn ở đó, chỗ khô thì cắn thường.
- Luật dòng chảy của phiên 2B (`js/song_luat.js`) đọc `e.troiDong`: Đỉa, Ếch đặt `e.troiDong = 2` (trôi gấp đôi, như kế hoạch "dụ chúng xuống nước").

Lời mẹo (`MEO`, hiện lần đầu gặp và ở bảng thua, có tiếng Anh): xem `js/ky_nang_quai.js` — ví dụ Ma Da: *"Ma Da ném bầu nước, chỗ rơi thành xoáy nước kéo bạn vào rồi bắn nước: chạy ngược ra ngoài vòng đỏ."*

## 2. Hình tạm (`js/monster_art.js` khối "song", `js/ky_nang_quai.js` `KN.veTam`)

- `MA.hinhTam[mã] = { muon, loc }` — một nguồn số cho cả game và ảnh soát. `loc`: các phép lọc lần lượt (`hue`, `sat`, `bri`, `sep`, `con`).
- Khai báo 8 mã (`def`): chép def của con mượn (bộ phận, cử động, cỡ / hộp va chạm, kiểu đòn), tên mới, `vung: 'song'`; lưới hình code đổi màu từng điểm
  bằng **cùng ma trận** với `ctx.filter` (W3C Filter Effects), bộ phận chọn theo màu (`mau` / `kmau`) đổi theo.
- Trong trận: mã chưa có tệp ảnh riêng mà con mượn đã có ảnh → vẽ ảnh con mượn qua `ctx.filter`; bỏ lớp nhuộm nước đục chung của `js/vung4.js`
  cho riêng 8 con này (đã có màu riêng). Chọn vùng 4 trên bản đồ thì tải luôn ảnh 8 con mượn (Rừng / Lâu đài / Hang biển, ~0,6 MB, đã nằm trong gói
  người chơi tải — không thêm byte).
- Có tệp `game/art/custom/<mã>.sprite.json` → nhánh hình tạm tự thôi (cả nhuộm). Safari cũ không có `ctx.filter`: ảnh con mượn không nhuộm (vẫn chơi được).
- Bảng `MA._xong` xếp vùng `song` sau Lâu đài; nổ cảm tử vùng `song` dùng ảnh nổ Băng.

Ảnh soát `xem-hinh-tam.png` (`python3 ve_soat.py`): mỗi con một hàng — 3 khung con mượn gốc (đứng / báo đòn / đánh) | cùng 3 khung đã nhuộm.

## 3. Chỗ dựng ảnh thật: `../vung-4-quai/cong-cu/dung-song.py`

- Nguồn: `docs/anh-goc/quai-moi/dong-tac/<mã>-<bước>-cat/<hàng>/khung-NN.png` (như các vùng cũ). Thiếu khung thì in "CHƯA CÓ ẢNH — cần …" và bỏ qua.
- Cỡ trong game = chiều cao thân đứng của **con mượn** (đúng cỡ hình tạm đang chạy, cùng `rong` / `cao`), đổi được bằng `cao` trong `CFG`; thời lượng
  báo đòn = báo trước thật trong `SO`; đánh / chết = thời lượng def; `khung` hàng đánh đề xuất sẵn; Đỉa / Ếch căn như con bơi (bỏ `bay` nếu ảnh vẽ đứng đất).
- `--thu`: chạy thử công cụ trên khung của con mượn (chỉ ghi `ra/`, không đụng game) — đã chạy đủ 8 con: tấm ra khớp tấm gốc (vd Heo Rừng Con ô 68×48
  neo [35, 45] so với tấm gốc 65×48 [32, 45]; Bầy Cá Con 58×43 [29, 37] đúng như gốc).
- Có ảnh rồi: `python3 dung-song.py --ghi`, `node game/tests/quai_song.test.js`, `python3 game/build.py --hai-tep` (ảnh `vung: 'song'` vào nhóm tải vùng 4).

## 4. Cân bằng (docs/ke-hoach/LUAT-CAN-BANG.md)

**Không thêm thưởng nào** (vàng / quặng / đá / linh khí / sức mạnh): máu, sát thương gốc, tốc độ theo vai giữ nguyên (`G.ROLES`, số vùng 4 của phiên 1);
chỉ đổi cách đánh. 3 vùng cũ không đổi (mã quái, số kỹ năng, lời mẹo giống hệt — bài Node mục 1).

Đo bằng bot Node (`do_quai_song.py`, kết quả `do-truoc-sau.txt`): mỗi ải 20 lượt, Sức mạnh ≈ khuyên dùng (bản lưu 3-5 của `kiem-can-bang/luu-A.json`
lên cấp), cùng hạt ngẫu nhiên; **trước** = `?quaisong=0` (8 con mượn Hang biển, phiên 1), **sau** = bản này.

| Ải | Sức mạnh / khuyên dùng | Thắng: trước → sau | Thời gian TB (giây) | Máu mất do quái thường (% máu tối đa / lượt) | Đòn quái thường trúng / lượt |
|---|---|---|---|---|---|
| 4-1 | 562 / 540 | 90% → 100% | 238 → 233 | 90% → 25% | 7,5 → 2,4 |
| 4-2 | 571 / 565 | 90% → 100% | 246 → 251 | 94% → 35% | 7,3 → 3,0 |
| 4-3 | 599 / 595 | 60% → 95% | 254 → 288 | 150% → 61% | 11,8 → 5,2 |
| 4-4 | 636 / 630 | 15% → 85% | 218 → 369 | 188% → 81% | 14,4 → 7,5 |
| 4-5 | 662 / 690 | 0% → 10% | 251 → 384 | 191% → 109% | 15,3 → 9,3 |

Máu mất theo vai (% máu tối đa / lượt, cả 5 ải): Xạ thủ 37,3 → 8,7 · Gai 45,3 → 35,9 · Bầy 33,1 → 2,9 · Cảm tử 21,2 → 0,9 · Nhanh 0,5 → 6,1 · Khiên 0,4 → 4,7 · Bom 4,2 → 1,9 · Lính xông 0,7 → 0,7.

So với ba vùng cũ cùng bot, cùng cách đo (Sức mạnh ≈ khuyên dùng, 12 lượt / ải): Hang biển 2-1 … 2-4 thắng 67–92%, máu mất do quái thường **81–120%**;
Lâu đài 3-1 … 3-4 thắng 67–92%, **77–145%**.

Đọc bảng:
- Tỉ lệ thắng vùng 4 **lệch quá ±5 điểm** so với "trước". Lý do: "trước" không phải mức đã cân bằng — 8 con Hang biển chạy với số vùng 4 (phiên 1, "số
  xuất phát") đánh mạnh hơn hẳn ba vùng cũ (máu mất 150–190% ở 4-3 … 4-5, thắng 0–15% ở 4-4 / 4-5); 8 con mới đánh nhẹ hơn ba vùng cũ một chút
  (25–81% ở 4-1 … 4-4). Bot né vùng đỏ rất giỏi (phản xạ 0,2 s) nhưng hay trúng đạn bay; quái cũ gây sát thương chủ yếu bằng đạn (Hải Quỳ, Nhím Biển,
  Cá Nóc), quái mới gần như đòn nào cũng là vùng đỏ (đúng kế hoạch: nhìn là né được) nên bot thấy dễ. Trẻ con không né giỏi như bot.
- Đã chỉnh trong phiên để bớt chênh (vẫn công bằng, vẫn báo trước): Cóc và Ếch nhắm chỗ bé **sắp tới**, Đỉa lao 2 lần, Cóc bắn 2,2 s một lần, xoáy Ma Da kéo
  28, ngọc Trai bay 150 — máu mất ở 4-3 / 4-4 từ 52 / 63% lên 61 / 81%.
- Không tăng sát thương / máu (để phiên 4 cân bằng — kế hoạch mục 5: "số xuất phát, bot đo rồi mới chốt"). Gợi ý cho phiên 4: nhắm "máu mất do quái
  thường" ≈ 80–140% như ba vùng cũ thì sát thương gốc vùng 4 (`DMG_RANGE[3]` [24, 30]) có thể tăng, hoặc giữ và hạ khuyên dùng; 4-5 thua chủ yếu ở
  trùm (Thuồng Luồng tạm = Ngư Tinh) và cấp 40 chưa với tới khuyên dùng 690 (Q3) — việc của 3B / 3C / phiên 4.
- Sổ yêu quái: trước đây quái vùng 4 mượn mã Hang biển nên được đếm vào trang Hang biển (lỗi phiên 1 đã ghi). Nay 8 con mới **chưa có trang** → hạ chúng
  không đếm vào sổ (không thêm thưởng sổ). Đề xuất khi làm (cần quyết thưởng + bù, thành tựu "Sổ đủ trang"): thêm 8 dòng `G.SO_YQ.trang` vùng 3 với hệ khắc
  theo quy tắc cũ — Bầy (Đỉa) → Lửa, Khiên (Ba Ba) → Độc, Xạ thủ (Cóc) / Nhanh (Rắn) → Băng, vai khác → khắc hệ vùng (Độc → Lửa): Rái Cá, Ếch, Ma Da, Trai → Lửa.

## 5. Tệp đã đổi

| Tệp | Thay đổi |
|---|---|
| `game/js/data.js` | Cờ `G.QUAI_SONG` (`?quaisong=0`); `G.MOB_ART` vai thường vùng 4 = 8 mã mới (chỉ khi `G.VUNG4`). |
| `game/js/monster_art.js` | Khối "song": `MA.hinhTam`, `MA.locCss`, đổi màu lưới, `def` 8 mã; `TT` thêm `song`; nổ cảm tử vùng `song`. (Tệp ghép tự động: ghép lại thì chép khối này theo — ghi ở đầu khối.) |
| `game/js/ky_nang_quai.js` | `SO` + `MEO` 8 con, 8 hàm kỹ năng + vật (gợn nước, xoáy, vũng lạnh, ngọc nảy), bọc `G.mobArmor` (vỏ Trai), `G.mobOnKill` (Ếch nổ sớm), vận tốc bé cho `duDoan`, `e.troiDong`, `KN.veTam` + tải ảnh con mượn khi chọn vùng 4. |
| `game/js/ngon_ngu_en.js`, `tools/ngon-ngu/tu-dien/quai.json`, `ky-nang-quai.json` | 8 tên, 8 lời mẹo, "Ngẩn ra!", "Bị bám!", "Giũ ra!" (thêm tay vào cuối `ngon_ngu_en.js` như phiên khác — chạy `gop.py` sẽ mất vài mục người khác thêm tay nên không chạy). |
| `game/tests/quai_song.test.js` (mới) | 69 điều kiện (mục 6). |
| `game/tests/so_yeu_quai.test.js` | Điều kiện "mọi quái có trang" chỉ đòi 3 vùng đầu (Sổ chưa có trang vùng 4 — mục 4). |
| `docs/review/ke-hoach-cai-thien/vung-4-quai/cong-cu/dung-song.py` (mới) | Công cụ dựng ảnh thật (mục 3). |
| Thư mục này | `bao-cao.md`, `xem-hinh-tam.png`, `ve_soat.py`, `do_quai_song.py`, `do-truoc-sau.txt`. |
| `game/dist/*`, `tools/xuong-sprite/index.html` | Dựng lại. |

Không đụng: tinh anh / trùm nhỏ / trùm vùng (vẫn mượn), `G.VUNG4_MUON`, tệp của 2B / 2C, `combat.js`, `boss.js`, `chieu_trum.js`, đăng nhập Google / lưu mây / `?cloud=0`.

## 6. Cách kiểm (đã chạy)

- `node --check game/js/*.js`: sạch.
- `node game/tests/quai_song.test.js` — **PASS 69 điều kiện** (ba bản game trong Node: thường, `?quaisong=0`, `?vung4=0`):
  1. `G.MOB_ART` vùng 4 = 8 mã mới; tinh anh / trùm vẫn mượn; `?quaisong=0` = phiên 1; `?vung4=0` 3 vùng; mã + `SO` + `MEO` + `KN.CU` 24 con cũ giống hệt;
  2. 8 mã có hình (vùng `song`, tên, cỡ, con mượn), số, mẹo, tiếng Anh tên + mẹo;
  3. từng con một mình trong phòng, bé đứng yên: ra trận đúng mã, có kỹ năng, không NaN, trúng được bé, báo trước ≥ vai cũ; cơ chế riêng: Rái Cá bay (không nhắm được)
     + đáp hụt thì ngẩn; Đỉa bám → chậm, bám theo, Độc; lăn giũ ra; Ba Ba cổ duỗi không quay; Cóc nhảy lùi; Rắn lặn vô hình / không nhắm được, Độc; `G.vung4Nuoc`
     sàn khô → không lặn; Ếch chết sớm nổ −35% máu quái gần; Ếch nảy, nổ Băng; Ma Da xoáy kéo bé lệch tâm, Băng; Trai khép vỏ giáp 1 phía trước, 0 sau lưng / lúc há;
  4. bot thật chỉ né (không đánh) mất ít máu hơn đứng yên với cả 8 con (đòn né được);
  5. bot bất tử qua đủ 4-1 … 4-5, gặp cả 8 con mới mỗi ải, không NaN; `?quaisong=0` chạy, không có con mới;
  6. vẽ 8 mã × 7 cử động không lỗi; nhánh ảnh mượn đặt đúng `ctx.filter` từng con rồi trả lại; không lỗi ngầm.
- `vung4.test.js` 38, `song_luat.test.js` 40 (của 2B), `so_yeu_quai` 41, `su_kien` 83, `thanh_tuu` 35, `viec_ngay` 36, `cam_giac_danh` 15, `bo_do_mua` 22,
  `cloud_save_regression`: đạt.
- `python3 game/build.py` và `LK_ANH_ROI=1 python3 game/build.py --hai-tep`: số ở mục 7.

## 7. Dung lượng

Phiên này **không thêm ảnh** (hình tạm dùng ảnh có sẵn, mã mới ~25 KB chưa nén).

| | trước (dist gần nhất, phiên 2C) | sau |
|---|---|---|
| **NGƯỜI CHƠI TẢI** | 16,23 / 20 MB | **16,27 / 20 MB** (trang 1,09 MB nén + ảnh 15,02 MB + bìa 0,15 MB; chênh = mã mới của 2A, và của 2B chưa dựng dist) |
| Trình duyệt không có WebP | — | 18,67 MB |
| Bản một tệp (trang công cụ) | 28,20 / 30 MB | 28,31 / 30 MB |

Nhóm "Vùng Sông sâu" chưa có ảnh nên chưa hiện trong bảng của `build.py`. Ảnh thật 8 con dự kiến +0,7 MB (KE-HOACH mục 6).

## Việc còn lại / cho phiên sau

- **Ảnh** (nhóm A, C — 8 con, E1–E6 của KE-HOACH mục 4): gen → cắt khung → `dung-song.py --ghi`. Hiệu ứng chiêu (gợn nước, xoáy, vũng lạnh, ngọc, bọt) đang vẽ code;
  có ảnh `hu-*` thì thay ở các hàm `ve` cùng khối.
- **3A / 3B**: tinh anh, Cá Trê, Thuồng Luồng thật rồi đặt `G.VUNG4_MUON = null` (khi đó 8 con này vẫn tự lo màu, không cần sửa). 3B có bãi đá phòng trùm:
  cài `G.vung4Nuoc` nếu muốn Rắn Nước không lặn trên đá.
- **Phiên 4**: cân bằng vùng 4 (mục 4 có số đo và gợi ý); Sổ yêu quái vùng 4 (mục 4).
