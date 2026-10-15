# Báo cáo — đưa 10 quái Lâu đài cổ vẽ lại (6 động tác) vào game (15/10)

Làm theo `YEU-CAU.md` cùng thư mục, y cách phiên `quai-moi-bien` (và `quai-moi-6-con` / `quai-moi-4-con`). **Không chạy game, không test**: chỉ xử lý ảnh, vẽ ảnh soát tĩnh, `node --check`, `build.py`.
Không đụng đăng nhập Google / lưu mây / `?cloud=0`, không chép apiKey, không đụng master, không PR, không force push.

- Ảnh soát: `xem-lau.png` (mỗi con 6 hàng × khung, cỡ game ×2, vạch đỏ = đường đất / mức neo, vạch xanh = điểm neo, cột đầu = tấm cũ cùng tỉ lệ, cùng điểm neo;
  ghi "không phát" trên cột hàng đánh mà bảng `khung` bỏ qua), `xem-lau.gif` (10 con lần lượt: đứng → đi → báo đòn → [Hũ Lửa: lăn 0,7 s] → đánh → [Tướng Ma / Hũ Chúa: chiêu chieu1
  40% báo đòn + 60% đánh] → trúng đòn → chết, cỡ game ×3).
- Công cụ: `cong-cu/dung-lau.py [--ghi] [--chi <mã>]` chép từ `../quai-moi-bien/cong-cu/dung-bien.py`, nạp lại `../quai-moi-4-con/cong-cu/` (anh_quai.py; `thu` / `luu_png` /
  `ti_le_hang` của dung-quai-moi.py) và `../quai-moi-6-con/cong-cu/dung-6-con.py` (`mat_na` / `do` / `xoa_manh_roi` / `mau_deu` / `tam_tam`) — không sửa các tệp đó.
  `cong-cu/ve-soat.py` chép từ phiên Hang biển, đổi sang 10 con. Chạy: `python3 dung-lau.py --ghi` rồi `python3 ve-soat.py`.

## 1. Dựng lại 10 tấm `game/art/custom/<mã>.sprite.json`

Nguồn: `docs/anh-goc/quai-moi/dong-tac/<mã>-<bước>-cat/<hàng>/khung-NN.png` (6/6/6/6/4/6 khung, đủ 60 bước).
Định dạng như phiên trước: `tam`, `net: 2`, `khung_rong`/`khung_cao`, `goc`, `rong`/`cao` **giữ số cũ** (hộp va chạm không đổi), `dong_tac`, `can_tam`. Tấm cũ → `<mã>-cu.sprite.json`.
Ảnh: LANCZOS trên màu nhân alpha, alpha cắt 0/255, lượng tử không hoà sắc; 32 màu, con nào sau 32 màu còn > 4000 điểm ảnh lệch màu xa thì 48 màu (32 + 16 riêng) —
Đèn Lồng, Mèo Đen, Tướng Ma, Hũ Chúa 48 màu (lửa xanh, đuôi lửa, áo choàng đỏ, lửa trên hũ); 6 con còn lại 32 màu.
Chuẩn cỡ theo thân (SIFT + diện tích, chỉnh riêng khung lệch > 4%, giới hạn 0,88..1,14; trúng đòn đo khung 2–4, chết đo khung 1–2). Các hàng trúng đòn AI vẽ to hơn hẳn
được đưa về cỡ (hệ số 1,23–1,53: Tiểu Yêu 1,53, Lính Ma 1,49, Đèn Lồng 1,49, Hũ Chúa 1,42, Nhím Than 1,38, Hũ Lửa 1,35, Mèo Đen 1,33, Tượng Đá 1,30, Dơi Than 1,29, Tướng Ma 1,23).

Khác phiên Hang biển:
- **Con bay** (Dơi Than — bầy 3 con, Đèn Lồng): căn theo **tâm thân** (trọng tâm mọi điểm ảnh; Dơi: tâm bầy), độ cao bay giữ như tấm cũ (tâm thân trên điểm neo: Dơi 20,5 · Đèn 17,3 điểm game — đo trên tấm cũ).
  **Hàng chết rơi xuống đất**: mục `roi` (mỗi khung: 1 = độ cao bay, 0 = đáy thân trên đường đất `goc[1]`, giữa = nội suy) — Dơi `[1, 1, 0,6, 0, 0, 0]` (khung 4: bầy đã nằm trên đất, cháy thành than),
  Đèn `[1, 0,5, 0, 0, 0, 0]` (khung 3: đèn sụp xuống đất).
- **Dơi Than báo đòn**: AI vẽ bầy dơi nhỏ ở khung 1–2 rồi to dần (~1,5 lần) — mục `deu_co`: đưa từng khung về cùng cỡ theo diện tích (SIFT khớp kém giữa các khung bầy),
  hệ số từng khung `[0,765 · 0,867 · 0,96 · 1,039 · 1,138 · 1,16]`. Các hàng khác của Dơi chỉ cần hệ số hàng (đi 0,835 = dơi vẽ nhỏ hơn, đánh 1,172 / trúng đòn 1,294 / chết 1,114 = vẽ to hơn — "tấm cỡ dơi khác nhau").
- **Khung chết mờ dần** (Lính Ma, Mèo Đen khung 5–6; Đèn Lồng khung 6 — bản mờ của khung trước): alpha đưa về đủ đậm ngay khi đọc (cùng cách `thu()` đã làm) để đo đúng như khung gốc;
  game tự làm mờ theo mục `mo` của hàng chết (Lính Ma, Mèo Đen `mo` 0,67 = từ khung 5; Đèn Lồng 0,83 = từ khung 6).
- **Mảnh rời thừa trong khung cắt** (`xoa_roi`): Lính Ma đánh khung 2, 6 (một chùm chổi thứ hai lạc trong khung), Tướng Ma đánh khung 3, 6 và chết khung 2 (mẩu đao bị cắt ở mép) — xoá.
- Giữ (phần của dáng): vết nứt + bụi khung đập đất Tượng Đá; chớp lửa ở miệng khung 4 Đèn Lồng; tia lửa dưới chân khung 3–4 Nhím Than; vũng dầu khung 4–5 Hũ Chúa; vệt đao đỏ khung 4 Tướng Ma;
  vật rơi hàng chết (khiên nong Tượng Đá, chổi Lính Ma, đao Tướng Ma, mảnh hũ, khói).

| Con | loại | hệ số hàng (gốc / idle): đi · báo đòn · đánh · trúng đòn · chết | thân đứng cũ → mới (cao × rộng) | ô khung cũ → mới | neo `goc` | màu | tệp cũ → mới |
|---|---|---|---|---|---|---|---|
| linhMa | đất | 0,983 · 1,019 · 0,939 · 1,489 · 1,005 | 32×35 → 32×30,1 | 64×40 → 48×45 | [26, 43] | 32 | 19 → 53 KB |
| doiThan | bay (bầy) | 0,835 · 1,032 (từng khung) · 1,172 · 1,294 · 1,114 | 37,5×45 → 37,5×43,5 | 56×48 → 64×48 | [34, 44] | 32 | 28 → 94 KB |
| tuongDa | đất | 1,016 · 1,029 · 0,963 · 1,298 · 0,918 | 35×35 → 35×31,3 | 64×40 → 41×49 | [20, 47] | 32 | 24 → 88 KB |
| denLong | bay | 1,096 · 1,081 · 1,035 · 1,488 · 1,157 | 34×30 → 34×31,8 | 56×40 → 40×43 | [18, 40] | 48 | 18 → 64 KB |
| meoDen | đất | 0,887 · 0,958 · 0,711 · 1,331 · 0,953 | 35×39,5 → 35×32 | 72×44 → 67×53 | [31, 47] | 48 | 25 → 89 KB |
| huLua | đất | 0,952 · 1,101 · 0,968 · 1,349 · 1,027 | 28×34 → 28×26,4 | 40×40 → 37×40 | [19, 37] | 32 | 18 → 51 KB |
| tieuYeu | đất | 0,972 · 1,070 · 1,121 · 1,530 · 0,994 | 33×36,5 → 33×36,6 | 56×40 → 49×50 | [24, 47] | 32 | 23 → 87 KB |
| nhimThan | đất | 0,940 · 0,995 · 0,988 · 1,383 · 1,125 | 29×28 → 29×29 | 40×36 → 42×37 | [25, 35] | 32 | 17 → 56 KB |
| tuongMa | đất, tinh anh | 0,997 · 1,050 · 0,834 · 1,229 · 0,992 | 42×44 → 42×38,5 | 80×52 → 65×66 | [31, 64] | 48 | 33 → 140 KB |
| huChua | đất, tinh anh | 1,044 · 1,055 · 0,981 · 1,424 · 1,031 | 46×45 → 46×40,3 | 72×52 → 55×73 | [28, 68] | 48 | 33 → 136 KB |

Cỡ trong game = chiều cao thân đứng (trung vị hàng idle) của tấm cũ, giữ nguyên. Ô Tướng Ma / Hũ Chúa / Tượng Đá cao hơn vì hàng báo đòn giơ đao / lửa bốc cao / giơ tay.
Hệ số từng khung khác 1 (luật > 4%): xem `tung_khung` khi chạy công cụ (ví dụ Mèo Đen báo đòn `[1,104 · 1,14 · 1 · 1 · 0,946 · 0,941]` — mèo xù to dần; Tướng Ma đánh khung 4–5 0,91–0,92).

## 2. Căn chân, căn tâm

Có đất (Lính Ma, Tượng Đá, Tiểu Yêu, Tướng Ma, Hũ Lửa, Hũ Chúa — 2 chân; Mèo Đen, Nhím Than — 4 chân): đáy thân lên đường đất `goc[1]`, tâm 35% dưới thân trùng `goc[0]`
(mảng rời nhỏ < 20% không tính khi đo: bụi, tàn lửa, khói). Con bay: mục 1. `can_tam` đo lại trên tấm đã dựng (gần như toàn 0):
linhMa atk `[0,0,1,0,0,0]`, die `[0,-1,-1,-1,-1,-1]`; tuongDa atk `[0,0,0,0,1,0]`, die `[0,0,0,-1,-1,-1]`; denLong atk `[0,0,0,1,0,0]`; meoDen hit `[0,1,0,0]`;
huLua hit `[0,1,0,0]`, die `[0,-1,0,1,1,0]`; tieuYeu move `[0,0,0,1,0,0]`; nhimThan idle `[0,0,1,1,1,0]`, tele `[0,0,0,0,1,0]`, hit `[0,0,1,0]`; tuongMa atk `[0,0,0,0,1,0]`;
huChua tele `[0,0,0,0,1,0]`, atk `[0,0,0,0,-1,0]`; doiThan toàn 0; còn lại 0. Đổi hàng không nhảy hình (xem `xem-lau.png`).

## 3. Thời gian (khớp kỹ năng)

Cách game phát (không đổi nhịp): hàng lặp theo `giay` trong tệp; báo đòn trải đúng thời gian báo trước thật (`e.wind / e.act.T`); đánh / trúng đòn / chết theo `MA.dur`
của `monster_art.js` (số trong tệp ghi cùng giá trị). Đi: một vòng 6 khung = 0,5 rộng thân / tốc độ vai (chân không trượt), kẹp 0,35..1,0 s.

| Con · kỹ năng (`ky_nang_quai.js` / `mobs.js`) | đi | báo đòn | đánh | chết (`mo`) |
|---|---|---|---|---|
| linhMa · Chớp chém (hiện sau lưng) | 0,35 | 0,6 s (mờ dần; hiện ra phát lại hàng báo đòn ×4) | 0,55, `khung [2,3,4,5]`: **chổi bổ xuống → quét đúng lúc vùng chém nổ** (bật hàng đánh sau 0,15 s hiện) | 1,3 (0,67 — khung 5–6 mờ sẵn) |
| doiThan · Bổ nhào chữ V | 0,36 | 0,55 s (bầy tụ lại) | 0,6 đủ 6 khung (bổ nhào 0,22 s ngay đầu hàng) | 1,1 (0,82) |
| tuongDa · Đập đất | 1,0 (đi khiên ×0,6) | 0,7 s (giơ tay) | 0,6, `khung [3,4,5]`: **khung nứt đất + bụi đúng lúc sóng vòng nổ** | 1,2 (0,75) |
| denLong · Lửa ma đuổi | 0,42 | 0,7 s (lửa xanh bùng) | 0,55, `khung [3,4,5]`: **chớp ở miệng đúng lúc quả lửa (code vẽ) bay ra** | 1,2 (0,83 — khung 6 mờ sẵn) |
| meoDen · cào + Phân thân | 0,35 | 0,45 s (xù lông) | 0,5, `khung [3,4,5]`: **khung vuốt cào đúng lúc vùng cào nổ**; bóng ảo vẽ lại bằng tấm này (`M.draw(…'meoDen'…)`, nhuộm tím) | 1,2 (0,67 — khung 5–6 mờ sẵn) |
| huLua · Lăn vệt lửa | 0,35 | 0,85 s (cuộn tròn) | **lăn: cử động `lan` lặp cột 2–4 (lăn tròn, `lap_tu 1`, `lap_den 3`)**; vỡ: hàng đánh `khung [4,5]` (đứng lại) trong 0,95 s rồi hàng chết (nứt, bốc lửa) | 1,1 (0,82) |
| tieuYeu · Bùa tam giác | 0,54 | 0,5 s (giơ lá bùa) | 0,75, `khung [2,3,4,5]`: **khung vung tay ném đúng lúc 3 lá bùa (code / `hu-bua-tam-giac`) bay ra** | 1,2 (0,75) |
| nhimThan · Gai trồi | 0,56 | 2,2 s = dựng gai 1,4 + báo 0,8 (than rực, khói dày) | 0,6, `khung [2,3,4,5]`: **tia lửa dưới chân đúng lúc hàng gai lửa (code vẽ) bắt đầu trồi** | 1,1 (0,82) |
| tuongMa · tinh anh | 0,48 | chém thường 0,6 s | 0,6, `khung [3,4,5]`: **khung vệt đao đúng lúc vùng chém nổ** | 1,5 (0,6) |
| huChua · tinh anh | 0,5 | đòn nổ thường 0,7 s | 0,75, `khung [3,4,5]`: **khung rót dầu đúng lúc ra đòn** | 1,4 (0,64) |

Trúng đòn: 4 khung, 0,35 s, như `MA.dur`.

**Hàng game cần mà tấm không có** (tinh anh, `chieu1` — `SC.chonQuai` sẵn có dùng lại hàng gần nhất: 40% đầu = hàng báo đòn, 60% sau = hàng đánh theo bảng `khung`):
- Tướng Ma: chiêu Đao xoáy (`mobs.js thinkElite`, `chieu1` 1,6 s, hai vòng chém ở 0,7 và 1,15 s) → báo đòn (giơ đao) 0,64 s rồi khung vệt đao 0,64–0,96 s (trùng vòng 1), khung 5 0,96–1,28 s (trùng vòng 2).
- Hũ Chúa: chiêu Đổ dầu châm lửa (`chieu_trum.js huDau`, `chieu1` 1,7 s, rót dầu ở 0,7 s) → báo đòn 0,68 s rồi **khung rót dầu 0,68–1,02 s** (vệt dầu thật vẫn là `hu-vet-dau` do code vẽ).
Không thêm hàng, không sửa `chieu_trum.js`.

**Mã đã đổi cho khớp** (chỉ chọn khung, không vẽ code mới; tấm cũ `?quaicu=1` y như trước):
- `js/sprite_custom.js`: `QUAI_MOI` thêm 10 mã (chú thích cử động `lan` thêm Hũ Lửa).
- `js/ky_nang_quai.js` (`T.huLua`): tấm có `lap_tu` (`lanAnh`) → lúc lăn dùng cử động `lan` và **không xoay thân bằng code** (khung lăn đã vẽ hũ đang lăn, xoay thêm thì hình quay lộn);
  lúc vỡ `H.play(q, 'atk')` (khung 5–6 đứng lại) tới khi nổ. Tấm cũ / chưa nạp ảnh: hàng đánh + xoay như trước.

## 4. Cờ `?quaicu=1`

Như phiên trước: 10 mã vào `QUAI_MOI`; tấm cũ trong `game/art/custom/<mã>-cu.sprite.json` (`"cu_cua": "<mã>"`, tên "… (tấm cũ)"). Bình thường tấm cũ bị bỏ ngay ở `SC.add`
(không tải, không tính vào vùng); `?quaicu=1` nạp tấm cũ dưới đúng mã, bỏ tấm mới. `build.py` đã giữ `cu_cua` và không tính tấm cũ vào người chơi tải (không phải sửa).
Ảnh Lâu đài (`"vung": "laudai"`) vẫn ở nhóm tải **Vùng Lâu đài cổ** — chỉ tải khi vào vùng.

## 5. Dung lượng (`build.py --hai-tep`)

| | trước | sau |
|---|---|---|
| **NGƯỜI CHƠI TẢI** | 14,89 MB / trần 20 MB | **15,30 MB** / trần 20 MB (+0,41) — không vượt trần, không phải giảm màu |
| Vùng Lâu đài cổ (48 ảnh) | 3,33 MB | 3,73 MB |
| Trình duyệt không có WebP | 17,53 MB | 18,14 MB |
| Tải trước khi vào vùng đầu | 4,75 MB | 4,75 MB |
| Bản một tệp (trang công cụ) | 25,13 / 30 MB | 25,96 / 30 MB |
| Tấm cũ chỉ tải khi `?quaicu=1` (không tính) | 20 tấm 0,41 MB | 30 tấm 0,56 MB |
| Tổng ảnh trên máy chủ (chỉ để biết) | 30,97 MB | 32,14 MB |

("Trước" đo trên nhánh lúc bắt đầu phiên, cùng số với "sau" của báo cáo `quai-moi-bien`. "Sau" đo trước khi rebase lên các commit mới của phiên khác. Build lại sau rebase
(dist trong commit cuối): người chơi tải **15,31 MB** (trang 0,94 MB nén — mã mới của phiên khác + ảnh 14,37 MB), không WebP 18,15 MB, một tệp 25,97 / 30 MB, Lâu đài 3,73 MB.)

## Tệp đã đổi

- `game/art/custom/{linhMa,doiThan,tuongDa,denLong,meoDen,huLua,tieuYeu,nhimThan,tuongMa,huChua}.sprite.json` (dựng lại), `…-cu.sprite.json` (mới: tấm cũ cho cờ).
- `game/js/sprite_custom.js`, `game/js/ky_nang_quai.js` (mục 3).
- `game/dist/*`, `tools/xuong-sprite/index.html` (build lại).
- Thư mục này: `xem-lau.png`, `xem-lau.gif`, `cong-cu/dung-lau.py`, `cong-cu/ve-soat.py`, báo cáo này.

Kiểm: `node --check` `game/js/sprite_custom.js`, `game/js/ky_nang_quai.js` — đạt. `python3 game/build.py --hai-tep` — đạt (số ở mục 5).

## Còn lưu ý

- Hũ Lửa lăn: khung lăn 0,167 s/khung (giay hàng đánh = `MA.dur` 1,0 s / 6) — 3 khung một vòng ≈ 0,5 s, khớp đà lăn 180 điểm/giây của hũ rộng ~26. Muốn lăn nhanh hơn thì cần mục riêng cho nhịp `lan` (chưa làm).
- Mèo Đen hàng đánh hệ số 0,71 (AI vẽ mèo vồ nhỏ hơn hẳn — hệ số < 1 là phóng to lại): đã đưa về cỡ, xem `xem-lau.png` hàng đánh — cùng cỡ thân với hàng đứng.
- Tướng Ma trúng đòn khung 2 (áo choàng xoè rộng) trông to hơn các khung khác một chút dù đã chỉnh riêng (giới hạn 0,88..1,14 của luật chung).
- Đèn Lồng: tấm cũ vẽ đèn gần sát đất nên "độ cao bay" giữ như cũ cũng thấp (~0 điểm dưới đáy đèn); hàng chết rơi chỉ thấy sụp nhẹ.
- Chưa xem trong game thật (không chạy game theo yêu cầu): nên vào Lâu đài nhìn 10 con, thử Hũ Lửa lăn, Lính Ma chớp chém, bóng ảo Mèo Đen, chiêu Tướng Ma / Hũ Chúa, và `?quaicu=1` để so.
