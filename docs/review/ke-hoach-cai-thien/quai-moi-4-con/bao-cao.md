# Báo cáo — đưa 4 quái Rừng già vẽ lại (đủ 6 động tác) vào game (14/10)

Làm theo `YEU-CAU.md` cùng thư mục. **Không chạy game, không test**: chỉ xử lý ảnh, vẽ ảnh soát tĩnh, `node --check`, `build.py`.
Không đụng đăng nhập Google / lưu mây / `?cloud=0`, không chép apiKey, không đụng master.

- Ảnh soát: `xem-4-con.png` (mỗi con 6 hàng × khung, cùng tỉ lệ game ×3, vạch đỏ = đường đất, vạch xanh = điểm neo, cột đầu là tấm cũ cùng tỉ lệ để so cỡ),
  `xem-4-con.gif` (cả 4 con lần lượt: đứng thở → đi → báo đòn → đánh → trúng đòn → chết, cỡ game ×3, nhịp theo `dong_tac`).
- Công cụ: `cong-cu/dung-quai-moi.py` (dựng 4 tấm; chạy không `--ghi` thì chỉ ghi ra `cong-cu/ra/` để xem), `cong-cu/ve-soat.py` (vẽ 2 ảnh soát),
  `cong-cu/anh_quai.py` (đọc khung, đo thân, khớp SIFT).

## 1. Dựng lại 4 tấm `game/art/custom/<mã>.sprite.json`

Nguồn: `docs/anh-goc/quai-moi/dong-tac/<mã>-<bước>-cat/<hàng>/khung-NN.png` (6 / 6 / 6 / 6 / 4 / 6 khung, đều quay phải).
Định dạng giữ như các tấm quái hiện có: `tam`, `khung_rong`/`khung_cao`, `goc` (điểm neo chân), `rong`/`cao` (giữ đúng số cũ: không đổi hộp va chạm),
`dong_tac` (hang/so/giay/lap, `mo` ở hàng chết), thêm `net: 2` (ảnh gấp đôi như trùm nhỏ — canvas thế giới nét ×2) và `can_tam` (như phiên `trum-chet-pha3`).
Ảnh: thu nhỏ **LANCZOS** trên màu nhân alpha, alpha cắt 0/255 (viền sắc), lượng tử **32 màu** không hoà sắc (như các tấm quái thường; đã thử 64 màu — nhìn không khác, tệp nặng hơn ~20%).

**Chuẩn cỡ theo thân** (mỗi bước AI vẽ một cỡ khác): mỗi hàng một hệ số so với hàng đứng thở = trung bình nhân của
(a) khớp đặc trưng SIFT với 6 khung đứng thở (biến đổi đồng dạng RANSAC, trung vị) và (b) căn bậc hai tỉ lệ diện tích thân trung vị.
Hàng trúng đòn đo khung 2–4 (khung 1 chồm lên giữ dáng thật, cao hơn), hàng chết đo khung 1–2 (khung sau nằm xuống, thấp hơn — dáng thật).
Thêm chỉnh từng khung: ảnh AI vẽ to nhỏ dần ngay trong một hàng (ví dụ Heo Nanh báo đòn khung 1 to hơn khung 6 ~15%) → khung nào khớp SIFT chắc mà lệch hệ số hàng quá 4% thì đưa về đúng cỡ (giới hạn 0,88–1,14).

Hệ số hàng (ảnh gốc của hàng / ảnh gốc idle) và cỡ thân sau chuẩn (trung vị cao / rộng so với idle; báo đòn, đánh thấp hơn vì cúi / chồm, chết thấp hơn vì nằm):

| Con | đi | báo đòn | đánh | trúng đòn | chết |
|---|---|---|---|---|---|
| heoCon | 1,013 (cao 1,01 · rộng 1,01) | 0,826 (0,88 · 1,05) | 0,842 (0,89 · 1,05) | 1,414 (1,04 · 0,96) | 0,893 (0,69 · 0,98) |
| heoNanh | 1,003 (1,07 · 1,00) | 0,883 (0,96 · 0,98) | 0,791 (0,95 · 1,05) | 1,357 (1,06 · 0,97) | 0,908 (0,81 · 1,00) |
| chonBong | 1,013 (1,01 · 1,01) | 0,782 (0,84 · 1,13) | 0,760 (0,86 · 1,10) | 1,420 (0,90 · 1,00) | 0,834 (0,53 · 1,08) |
| boHung | 1,142 (0,99 · 1,09) | 0,892 (0,86 · 1,05) | 0,791 (0,85 · 1,24) | 1,395 (0,95 · 1,01) | 0,904 (0,64 · 1,11) |

**Cỡ trong game** = chiều cao thân đứng (trung vị hàng idle) đo trên tấm cũ, giữ nguyên:

| Con | thân đứng cũ (cao × rộng, điểm game) | thân đứng mới | ô khung (cũ → mới) | neo `goc` | tệp (cũ → mới) |
|---|---|---|---|---|---|
| heoCon | 35 × 52 | 35 × 47,5 | 64×40 → 65×48 | [32, 45] | 18 KB → 108 KB |
| heoNanh | 49 × 71 | 49 × 69,6 | 100×56 → 95×64 | [49, 61] | 50 KB → 210 KB |
| chonBong | 34 × 53,5 | 34 × 37,4 | 76×40 → 52×40 | [28, 37] | 27 KB → 84 KB |
| boHung | 30 × 49 | 30 × 40,9 | 64×44 → 62×44 | [30, 41] | 23 KB → 79 KB |

Chồn Bóng mới gọn hơn (đuôi dựng đứng thay vì đuôi dài nằm ngang) nên cùng chiều cao thì hẹp hơn tấm cũ — đúng ảnh mẫu `chonBong-mau-moi.png`. Ô khung cao hơn cũ vì khung 1 trúng đòn (chồm lên) cao hơn dáng đứng.

## 2. Căn chân, căn tâm

Mọi khung đặt **đáy thân lên cùng đường đất** (`goc[1]`) và **tâm thân trên sàn** (trung bình x phần thân đặc ở 35% dưới — cùng cách đo của game và `can_tam`) **trùng điểm neo** `goc[0]`,
ngay lúc dựng tấm (bỏ điểm hiệu ứng rực màu như mắt đỏ, vệt cào khi đo). Khung chỉ còn bụi tan (chết, khung cuối) đặt theo mép dưới / giữa ảnh cắt.
Sau đó đo lại trên tấm đã dựng và ghi `can_tam` từng khung (độ lệch còn lại, điểm game): gần như toàn 0, lớn nhất ±2 —

- heoCon: idle/move/tele/atk/hit toàn 0, die `[1,0,0,0,0,0]`
- heoNanh: idle `[0,0,0,1,0,1]`, move `[0,0,1,1,1,1]`, tele 0, atk `[0,-1,0,2,0,0]`, hit `[0,1,0,0]`, die `[0,-1,-1,-1,-1,0]`
- chonBong: idle `[0,1,0,0,0,0]`, atk `[0,0,0,-1,0,0]`, hit `[0,0,1,0]`, còn lại 0
- boHung: tele `[0,0,0,0,-1,-1]`, hit `[1,0,0,1]`, die `[0,0,-1,0,0,0]`, còn lại 0

Đổi hàng không còn nhảy (xem cột vạch xanh / đỏ trong `xem-4-con.png`). `js/sprite_custom.js`: `can_tam` của 4 con này luôn dùng (trước đây `can_tam` chỉ chạy khi không có `?trumcu=1` vì chỉ trùm có).

## 3. Thời gian

Cách game phát (đọc code, không đổi code nhịp): hàng lặp (idle, move) theo `giay` của tệp; hàng một lần chạy theo thời lượng cử động của game —
báo đòn trải **đúng theo thời gian báo trước thật** (`js/mobs.js` A.enemy: `e.wind / e.act.T`, khung cuối rơi đúng lúc ra đòn), đánh / trúng đòn / chết theo `MA.dur` của `js/monster_art.js`.

| Con | idle | move | tele (báo trước kỹ năng) | atk | hit | die |
|---|---|---|---|---|---|---|
| heoCon · Húc thẳng | 1,2 s lặp | 0,54 s | 0,6 s (`bao`) | 0,6 s — cú lao (300 điểm/s) bắt đầu đúng lúc ra đòn | 0,35 | 1,1 s, mờ từ 0,9 s (`mo` 0,82) |
| heoNanh · tinh anh | 1,2 | 0,87 | chiêu húc ba lần 0,45 s; đòn thường 0,6 s | 0,65 s; trong chiêu mỗi lần húc phát lại hàng đánh ×1,4 (≈0,46 s) đúng lúc vùng nổ + lao 0,15 s | 0,35 | 1,4 s, mờ từ 0,9 s (`mo` 0,64) |
| chonBong · Lẩn bóng | 1,2 | 0,35 | mờ dần 0,35 s (hàng báo đòn), hiện ra sau lưng báo 0,45 s (hàng báo đòn ×1,5 ≈ 0,47 s) | 0,55 s — đúng lúc vùng quạt nổ | 0,35 | 1,1 s, mờ từ 0,9 s |
| boHung · Lăn cầu đất | 1,2 | 0,79 | 0,6 s (`bao`) | 0,55 s — cục đất lăn ra đúng lúc ra đòn | 0,35 | 1,1 s, mờ từ 0,9 s |

- **move theo tốc độ đi của vai** (`js/data.js` G.ROLES: lính xông 44, tinh anh 40, nhanh nhẹn 78, khiên 26 điểm/s): một vòng 6 khung = 0,5 chiều rộng thân → `giay` = quãng / tốc độ (chân không trượt).
  Chồn Bóng tính ra 0,24 s (25 khung/giây, rối mắt) → giữ sàn 0,35 s (17 khung/giây): chân hơi trượt khi chồn chạy hết tốc.
- **Hàng đánh khớp mốc ra đòn**: khung 1 của mọi hàng đánh AI là thế đứng (giống đứng thở, sau thế cúi của báo đòn sẽ "bật" lên một nhịp) → `"khung": [1,2,3,4,5]` (bảng phát sẵn có, `G.KHUNG_TRUNG`):
  hàng đánh mở bằng cú bật / lao ngay lúc ra đòn, khung chạm (cột 2) tới ở u ≈ 0,2 (heoCon ~0,12 s; tinh anh còn được game giữ đúng khung này lâu hơn, `js/mobs.js` "ra đòn nặng"). Ảnh khung 1 vẫn nằm trong tấm (`?khungtrung=0` phát đủ 6).
- **hit** ~0,35 s (game 0,3 s trúng đòn trên cử động 0,35 → đủ 4 khung). Choáng: game lắc giữa khung 1–2 hàng trúng đòn (như cũ).
- **die** ~0,9 s rồi mờ: hàng chết 6 khung trải theo thời lượng gục của game (1,1 s; tinh anh 1,4 s), `mo` đặt để bắt đầu mờ ở 0,9 s. Hai khung cuối là thân tan thành bụi (ảnh AI). Bọ Hung khung 5–6 trong ảnh gốc đang mờ dần (alpha < 128) → đưa về đủ đậm khi dựng (không thì mất hẳn khi cắt alpha), game tự làm mờ.
- **Hàng game cần mà tấm chưa có**: tinh anh Heo Nanh **không cần `chieu1`** — chiêu húc ba lần trong `js/mobs.js` (thinkElite) đặt `anim0 = 'tele'`, `anim1 = 'atk'`
  (`js/chieu_trum.js` không thay chiêu của Heo Nanh). Nếu có chỗ nào gọi `chieu1`, `SC.chonQuai` sẵn có đã dùng lại hàng gần nhất: 40% đầu hàng báo đòn, 60% sau hàng đánh.
  (Danh sách động tác đọc từ tệp — `ANIMS` — vốn không có `chieu1`, nên cũng không thể thêm hàng riêng.) `spawn` = hàng đứng thở mờ vào (như cũ). **Không vẽ code gì thêm.**

## 4. Cờ `?quaicu=1`

Tấm cũ giữ nguyên ảnh trong `game/art/custom/<mã>-cu.sprite.json` (mã `<mã>-cu`, tên "… (tấm cũ)", thêm mục `"cu_cua": "<mã>"`; `build.py` giữ mục này — RUNTIME_KEYS).
`js/sprite_custom.js` (`G.QUAI_CU`, khai cạnh các cờ khác đầu tệp):
- bình thường: tệp có `cu_cua` bị bỏ ngay ở `SC.add` (không tạo ảnh → **không tải**, không tính vào thanh "Đang tải…" của vùng, không thêm vào danh sách quái);
- `?quaicu=1`: nạp tấm cũ dưới đúng mã con quái, bỏ tấm mới (bản ảnh rời: hàng chờ tải cũng mang mã con quái) → y như trước phiên này.

Chọn cách này thay vì để trong lịch sử git: cờ vẫn chạy được trên bản web mà ảnh người chơi tải không phình (tấm cũ chỉ nằm trên máy chủ, 0,07 MB).
Bản một tệp (chỉ dùng cho trang công cụ / GitHub Pages) có nhúng thêm 4 tấm cũ (~0,09 MB).

## 5. Dung lượng (`build.py --hai-tep`)

| | trước | sau |
|---|---|---|
| **NGƯỜI CHƠI TẢI** (trang nén + ảnh, WebP khi có) | 12,76 MB / trần 20 MB | **12,99 MB** / trần 20 MB (+0,23) |
| Vùng Rừng già (46 ảnh) | 2,68 MB | 2,90 MB |
| Trình duyệt không có WebP | 14,73 MB | 15,08 MB |
| Tải trước khi vào vùng đầu (lõi + trang) | 4,73 MB | 4,73 MB |
| Bản một tệp (trang công cụ) | 21,36 / 30 MB | 21,82 / 30 MB |
| Tổng ảnh trên máy chủ (chỉ để biết) | 25,66 MB | 26,31 MB |

`build.py` in riêng dòng "(không tính) 4 tấm cũ chỉ tải khi mở ?quaicu=1: 0,07 MB" và không cộng chúng vào người chơi tải.

## Tệp đã đổi

- `game/art/custom/{heoCon,heoNanh,chonBong,boHung}.sprite.json` (dựng lại), `game/art/custom/{…}-cu.sprite.json` (mới: tấm cũ cho cờ).
- `game/js/sprite_custom.js` (cờ `?quaicu=1`, `can_tam` của 4 con luôn dùng), `game/build.py` (giữ `cu_cua`, không tính tấm cũ vào người chơi tải).
- `game/dist/*`, `tools/xuong-sprite/index.html` (build lại).
- `docs/review/ke-hoach-cai-thien/quai-moi-4-con/`: `xem-4-con.png`, `xem-4-con.gif`, `cong-cu/*.py`, báo cáo này.

Kiểm: `node --check game/js/sprite_custom.js` — đạt. `python3 game/build.py --hai-tep` — đạt (số ở mục 5).

## Còn lưu ý

- Chồn Bóng: move 0,35 s là sàn cho khỏi rối mắt; ở tốc độ 78 điểm/s chân hơi trượt.
- Cỡ hàng chuẩn theo SIFT + diện tích; ảnh AI mỗi bước tỉ lệ thân hơi khác nhau (ví dụ Chồn báo đòn đuôi to hơn, đầu nhỏ hơn) nên không thể khớp tuyệt đối mọi chi tiết — xem cột tấm cũ / các hàng trong `xem-4-con.png`.
- Chưa xem trong game thật (không chạy game theo yêu cầu): nên mở Rừng già nhìn 4 con, và thử `?quaicu=1` để so.
