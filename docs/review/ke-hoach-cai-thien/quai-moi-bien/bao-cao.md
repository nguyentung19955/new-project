# Báo cáo — đưa 10 quái Hang biển vẽ lại (6 động tác) vào game (15/10)

Làm theo `YEU-CAU.md` cùng thư mục, y cách phiên `quai-moi-6-con` / `quai-moi-4-con`. **Không chạy game, không test**: chỉ xử lý ảnh, vẽ ảnh soát tĩnh, `node --check`, `build.py`.
Không đụng đăng nhập Google / lưu mây / `?cloud=0`, không chép apiKey, không đụng master, không PR, không force push.

- Ảnh soát: `xem-bien.png` (mỗi con 6 hàng × khung, cùng tỉ lệ game ×2, vạch đỏ = đường đất / mức neo, vạch xanh = điểm neo, cột đầu = tấm cũ cùng tỉ lệ, cùng điểm neo;
  mỗi con cao theo ô của nó cho ảnh không quá dài), `xem-bien.gif` (10 con lần lượt: đứng → đi → báo đòn → đánh → [Ốc: trong vỏ 1,5 s · Cá Nóc Chúa: Phồng lăn 1,9 s] →
  trúng đòn → chết, cỡ game ×3; Nhím chạy hàng đánh 1,4 s để thấy lặp xoay).
- Công cụ: `cong-cu/dung-bien.py [--ghi] [--chi <mã>]` nạp `../quai-moi-4-con/cong-cu/` (anh_quai.py; `thu` / `luu_png` / `ti_le_hang` của dung-quai-moi.py) và
  `../quai-moi-6-con/cong-cu/dung-6-con.py` (`mat_na` / `do` / `xoa_manh_roi` / `mau_deu` / `tam_tam`) — tệp này chỉ thêm `if __name__ == '__main__':` quanh phần dựng
  6 con (chạy thẳng vẫn như cũ). `cong-cu/ve-soat.py` chép từ phiên trước, đổi sang 10 con. Chạy: `python3 dung-bien.py --ghi` rồi `python3 ve-soat.py`.

## 1. Dựng lại 10 tấm `game/art/custom/<mã>.sprite.json`

Nguồn: `docs/anh-goc/quai-moi/dong-tac/<mã>-<bước>-cat/<hàng>/khung-NN.png` (6/6/6/6/4/6 khung). Bản dự phòng `cuaTuong-3-bao-don-b`, `cuaTuong-4-danh-b`, `haiQuy-4-danh-b` không dùng.
Định dạng như phiên trước: `tam`, `net: 2`, `khung_rong`/`khung_cao`, `goc`, `rong`/`cao` **giữ số cũ** (hộp va chạm không đổi), `dong_tac`, `can_tam`. Tấm cũ → `<mã>-cu.sprite.json`.
Ảnh: LANCZOS trên màu nhân alpha, alpha cắt 0/255 (viền sắc), lượng tử không hoà sắc; 32 màu, con nào sau 32 màu còn > 4000 điểm ảnh lệch màu xa thì 48 màu (32 + 16 riêng)
như phiên trước — 9/10 con 48 màu (ảnh biển nhiều sắc: lá, thìa, cờ, xúc tu, điện), Cá Nóc 32 màu.
Chuẩn cỡ theo thân (SIFT + diện tích, chỉnh riêng khung lệch > 4%, giới hạn 0,88..1,14; trúng đòn đo khung 2–4, chết đo khung 1–2) — các hàng trúng đòn AI vẽ to hơn hẳn
được đưa về cỡ (hệ số 1,28–1,57: Cá Chuồn 1,53, Cá Nóc Chúa 1,50, Cua Tướng 1,37, Nhím 1,31, Ốc 1,57).

Khác phiên trước:
- **Con bơi** (Cá Con, Cá Chuồn, Cá Nóc, Cá Nóc Chúa, Sứa — theo YEU-CAU, dù `khung.js` ghi Sứa là `mem`): như Ong Vò — không đường đất, căn theo **tâm thân**
  (trọng tâm mọi điểm ảnh; Cá Con: tâm bầy 3 con), độ cao bơi giữ như tấm cũ (tâm thân trên điểm neo: Cá Con 16,4 · Cá Chuồn 15,3 · Cá Nóc 12,7 · Sứa 18,8 · Cá Nóc Chúa 31,5 điểm game — đo trên tấm cũ).
- **Có đất** (Cua, Ốc, Cua Tướng, Hải Quỳ, Nhím): đáy thân lên đường đất `goc[1]`, tâm 35% dưới thân trùng `goc[0]`. **Hải Quỳ**: tâm đo ở 15% dưới cùng (tảng đá) như Hoa Bào Tử → đá không trượt giữa các khung / hàng.
- **Phồng có chủ ý** (`giu_co`): hàng báo đòn của Cá Nóc và Cá Nóc Chúa phồng to dần — hệ số hàng đo ở khung 1 (chưa phồng), không chỉnh riêng từng khung (không thì khung phồng bị ép nhỏ lại).
- **Hàng đứng thở** cũng chỉnh riêng khung lệch cỡ (> 4%, cùng luật): Cá Nóc Chúa khung 3–4 AI vẽ to hơn ~10% (nay `[0,946 · 1 · 1,097 · 1,089 · 1 · 0,946]`), Sứa, Cá Nóc khung 3. Các con khác không đổi.
- **Ốc trúng đòn**: lúc bắt đầu phiên chưa có `oc-5-trung-don`, đã dựng tạm (khung 1–2 báo đòn + khung 1–2 đứng thở, mục `hit_ghep`). Giữa phiên, phiên khác đẩy ảnh thật
  (`2c822afd Quai moi Hang bien: Oc trung don (4 khung)`) → đã bỏ `hit_ghep`, dựng lại riêng Ốc (`dung-bien.py --ghi --chi oc`) bằng ảnh thật. **Hiện tấm Ốc dùng ảnh trúng đòn thật.**
- Vật bay do code vẽ: các ảnh cắt không còn vật bay rời (tia nước, gai, vũng điện, vệt nhớt). Khung phun của Hải Quỳ có **bọt nước dính đầu xúc tu** (một mảng liền thân) — giữ, như viên bào tử dính miệng Hoa phiên trước. Hàng chết giữ vật rơi (mũ dừa + thìa Cua, cờ + mũ Cua Tướng, vương miện san hô Cá Nóc Chúa, mảnh vò Ốc). Mảng rời nhỏ không tính khi đo (bụi, gai văng, bọt).

| Con | loại | hệ số hàng (gốc / idle): đi · báo đòn · đánh · trúng đòn · chết | thân đứng cũ → mới (cao × rộng) | ô khung cũ → mới | neo `goc` | màu | tệp cũ → mới |
|---|---|---|---|---|---|---|---|
| cua | đất | 0,934 · 0,945 · 0,871 · 1,277 · 0,961 | 33×45 → 33×48,8 | 60×44 → 80×48 | [30, 45] | 48 | 27 → 117 KB |
| caCon | bơi (bầy) | 0,908 · 0,987 · 0,841 · 1,359 · 0,936 | 35×38 → 35×35,1 | 48×44 → 58×43 | [29, 37] | 48 | 25 → 85 KB |
| oc | đất | 1,015 · 1,139 · 0,991 · 1,569 · 1,132 | 41×46 → 41×53,6 | 64×52 → 72×58 | [28, 49] | 48 | 40 → 163 KB |
| haiQuy | đất (đá) | 1,023 · 1,034 · 0,955 · 1,446 · 1,069 | 44×46 → 44×40,7 | 56×52 → 56×50 | [27, 48] | 48 | 39 → 133 KB |
| caChuon | bơi | 0,988 · 0,996 · 1,014 · 1,532 · 0,878 | 33×41 → 33×42,3 | 68×44 → 54×56 | [28, 44] | 48 | 26 → 90 KB |
| caNoc | bơi | 0,921 · 0,816 (khung 1) · 0,941 · 1,432 · 0,896 | 27×33 → 27×30,6 | 44×36 → 50×49 | [26, 38] | 32 | 19 → 59 KB |
| sua | bơi | 0,966 · 0,975 · 0,951 · 1,308 · 0,865 | 43×37 → 43×32,7 | 52×48 → 48×52 | [25, 47] | 48 | 29 → 101 KB |
| nhim | đất | 1,018 · 0,966 · 0,950 · 1,308 · 1,058 | 25×26,5 → 25×25,2 | 40×32 → 38×44 | [19, 38] | 48 | 15 → 52 KB |
| cuaTuong | đất, tinh anh | 0,975 · 0,937 · 0,914 · 1,371 · 0,912 | 65,5×73 → 65,5×79 | 104×72 → 114×101 | [57, 97] | 48 | 69 → 344 KB |
| caNocChua | bơi, tinh anh | 1,033 · 0,854 (khung 1) · 1,001 · 1,505 · 1,018 | 65×62 → 65×67,2 | 80×72 → 97×111 | [51, 87] | 48 | 65 → 283 KB |

Cỡ trong game = chiều cao thân đứng (trung vị hàng idle) của tấm cũ, giữ nguyên. Ô Cua Tướng cao hơn vì hàng báo đòn / đánh giơ càng cao; Cá Nóc Chúa vì hàng báo đòn phồng.

## 2. Căn chân, căn tâm

Mọi khung căn như mục 1; `can_tam` đo lại trên tấm đã dựng (gần như toàn 0):
cua atk `[0,0,-1,0,0,0]`, die `[0,0,0,0,1,0]`; caCon move `[1,0,0,0,0,0]`, hit `[0,1,0,0]`; oc idle `[0,-1,0,0,0,0]`, atk `[0,0,0,1,0,0]`; haiQuy die `[1,0,0,0,0,0]`;
caChuon idle `[0,0,0,1,0,0]`; caNoc move `[0,0,0,0,1,0]`; sua die `[0,0,0,0,1,0]`; nhim tele `[1,0,0,0,0,0]`, hit `[1,0,1,0]`, die `[0,0,0,1,0,0]`;
cuaTuong idle `[1,0,0,0,0,0]`, tele `[0,0,1,0,1,0]`, atk `[0,0,0,-3,0,0]` (khung đập càng có tia lửa lệch phải), hit `[-1,0,-1,0]`; caNocChua toàn 0; còn lại 0.
Đổi hàng không nhảy hình (xem `xem-bien.png`: cột tấm cũ và các khung mới cùng đường đất / cùng độ cao bơi).

## 3. Thời gian (khớp kỹ năng)

Cách game phát (không đổi nhịp): hàng lặp theo `giay` trong tệp; báo đòn trải đúng thời gian báo trước thật (`mobs.js`: `e.wind / e.act.T`); đánh / trúng đòn / chết theo
`MA.dur` của `monster_art.js` (số trong tệp ghi cùng giá trị). Đi: một vòng 6 khung = 0,5 rộng thân / tốc độ vai (chân không trượt), kẹp 0,35..1,0 s.

| Con · kỹ năng (`ky_nang_quai.js`) | đi | báo đòn | đánh | chết (`mo`) |
|---|---|---|---|---|
| cua · Lướt ngang kẹp | 0,56 | 0,6 s (giơ càng) | lướt dùng hàng đi; hàng đánh bật lúc kẹp, `khung [1..5]`: **khung duỗi càng + thìa trùng lúc vùng kẹp nổ** (0,12 s sau khi bật) | 1,2 (0,75) |
| caCon · Đàn sóng | 0,35 | 0,6 s (bầy cuộn lại); lượt quay về hàng báo đòn ×1,4 | lượn sóng dùng hàng đi (code); hàng đánh 0,6 s đủ 6 khung | 1,1 (0,67 — khung 5–6 mờ sẵn) |
| oc · Đập càng + Rút vỏ | 1,0 | 0,6 s (rút vào vỏ) | 0,55, `khung [2,3,4,5]`: **càng thò ra đập đúng lúc ra đòn** (quái giáp: game giữ khung lâu hơn) | 1,2 (0,75) |
| haiQuy · Quạt 3 tia nước | 0,9 (đung đưa, đá đứng yên) | 0,7 s (co xúc tu) | 0,9, `khung [3,4,5]`: **khung phun hiện đúng lúc 3 tia nước (code) bay ra**; game cắt hàng ở 0,45 s | 1,3 (0,69) |
| caChuon · Vọt đáp | 0,35 | 0,35 s (cong đuôi nhún) | bay dùng hàng đi (code nâng `k.bay`); lúc đáp hàng đánh `khung [3,4,5]`: **khung bổ nhào đúng lúc đáp** | 1,1 (0,82) |
| caNoc · Hút rồi nổ gai | 0,35 | 1,0 s (phồng to dần) | 0,55, `khung [2,3,4,5]`: **khung nổ gai (tia vàng) đúng lúc 8 gai (code) bắn ra** | 1,1 (0,67 — khung 5–6 mờ sẵn) |
| sua · Vũng điện | 0,48 | 0,5 s (tích điện) | 0,55, `khung [1..5]`: **phóng điện đúng lúc thả vũng điện** (trước đây kỹ năng này phát hàng đứng — xem mục mã) | 1,1 (0,82) |
| nhim · Gai xoắn ốc | 0,48 | 2,2 s = dựng gai 1,4 + báo 0,8 | `khung [0..4]` một lượt 0,55 s rồi **lặp cột 2–5 (xoay, `lap_tu 1`, `lap_den 4`) suốt 1,1 s bắn gai** | 1,1 (0,82) |
| cuaTuong · tinh anh | 0,99 | đòn chém 0,6 s | 0,55, `khung [3,4,5]`: **khung đập càng (tia lửa) đúng lúc vùng chém nổ** | 1,1 (0,82) |
| caNocChua · tinh anh | 0,84 | đòn gai 0,7 s | 0,55 đủ 6 khung (đòn gai thường); **Phồng lăn: lặp cột 3–4 (lăn tròn) suốt lúc lăn** (`lap_tu 2`, `lap_den 3`, cử động `lan`) | 1,1 (0,82) |

Trúng đòn: 4 khung, 0,35 s (Ốc 0,4 s), như `MA.dur`.

**Ốc trong vỏ** (`ocRut`, 1,5 s miễn sát thương): cử động mới `vo` — chạy hàng báo đòn (rút vào vỏ) trong 0,3 s rồi **giữ khung cuối (vỏ rỗng)** suốt lúc trong vỏ.
Trước đây phát hàng trúng đòn chạy chậm (×0,12). Không vẽ code mới, chỉ chọn khung.

**Hàng game cần mà tấm không có** (tinh anh, `chieu1` — `SC.chonQuai` sẵn có dùng lại hàng gần nhất: 40% đầu = hàng báo đòn, 60% sau = hàng đánh, theo bảng `khung`):
- Cua Tướng: chiêu Kẹp chéo (nhánh cũ `mobs.js thinkElite`, `chieu1` 1,4 s) → báo đòn (giơ càng) rồi đánh (đập càng). Không thêm hàng.
- Cá Nóc Chúa: chiêu Phồng lăn (`chieu_trum.js caNocLan`) — lúc báo trước dùng `chieu1` (báo đòn phồng → đánh), lúc lăn dùng cử động `lan` ở trên.

**Mã đã đổi cho khớp** (chỉ chọn khung, không vẽ code mới; tấm cũ `?quaicu=1` y như trước):
- `js/sprite_custom.js`: `QUAI_MOI` thêm 10 mã; mục `"lap_den"` của hàng đánh (cột cuối đoạn lặp, mặc định cột cuối — Nhím Độc phiên trước không đổi);
  `SC.chonQuai` thêm hai cử động `lan` (lặp `lap_tu..lap_den` hàng đánh) và `vo` (hàng báo đòn rồi giữ khung cuối). Tấm không có các mục này: `lan` = đứng thở, `vo` = trúng đòn.
- `js/ky_nang_quai.js`: hàm `anhMoi(q)` (con quái đang dùng tấm vẽ lại — có `can_tam`; tấm cũ không có). `ocRut`: tấm mới → cử động `vo`; tấm cũ → hàng trúng đòn ×0,12 như cũ.
  `T.sua`: tấm mới → hàng đánh lúc thả vũng điện; tấm cũ → đứng thở như cũ.
- `js/chieu_trum.js` (`caNocLan`): tấm có `lap_tu` → cử động `lan` và **không xoay thân bằng code** (khung lăn đã vẽ vệt xoáy, xoay nữa thì vệt quay tròn theo); phồng (×1,35) giữ.
  Tấm cũ: đứng thở + xoay như trước.

## 4. Cờ `?quaicu=1`

Như phiên trước: 10 mã vào `QUAI_MOI`; tấm cũ trong `game/art/custom/<mã>-cu.sprite.json` (`"cu_cua": "<mã>"`, tên "… (tấm cũ)"). Bình thường tấm cũ bị bỏ ngay ở `SC.add`
(không tải, không tính vào vùng); `?quaicu=1` nạp tấm cũ dưới đúng mã, bỏ tấm mới. `build.py` đã giữ `cu_cua` và không tính tấm cũ vào người chơi tải (không phải sửa).
Ảnh Hang biển (`"vung": "bien"`) vẫn ở nhóm tải **Vùng Hang biển** — chỉ tải khi vào vùng biển.

## 5. Dung lượng (`build.py --hai-tep`)

| | trước | sau |
|---|---|---|
| **NGƯỜI CHƠI TẢI** | 14,20 MB / trần 20 MB | **14,89 MB** / trần 20 MB (+0,69) — không vượt trần, không phải giảm màu |
| Vùng Hang biển (51 ảnh) | 2,65 MB | 3,35 MB |
| Trình duyệt không có WebP | 16,76 MB | 17,53 MB |
| Tải trước khi vào vùng đầu | 4,75 MB | 4,75 MB |
| Bản một tệp (trang công cụ) | 24,10 / 30 MB | 25,13 / 30 MB |
| Tấm cũ chỉ tải khi `?quaicu=1` (không tính) | 10 tấm (Rừng già) | 20 tấm 0,41 MB |
| Tổng ảnh trên máy chủ (chỉ để biết) | 29,50 MB | 30,97 MB |

("Trước" đo trên nhánh lúc bắt đầu phiên — đã có thay đổi của các phiên khác nên khác số 13,28 MB của báo cáo `quai-moi-6-con`.)

## Tệp đã đổi

- `game/art/custom/{cua,caCon,oc,haiQuy,caChuon,caNoc,sua,nhim,cuaTuong,caNocChua}.sprite.json` (dựng lại), `…-cu.sprite.json` (mới: tấm cũ cho cờ).
- `game/js/sprite_custom.js`, `game/js/ky_nang_quai.js`, `game/js/chieu_trum.js` (mục 3).
- `game/dist/*`, `tools/xuong-sprite/index.html` (build lại).
- `docs/review/ke-hoach-cai-thien/quai-moi-6-con/cong-cu/dung-6-con.py` (chỉ thêm `if __name__ == '__main__':` để dùng lại hàm).
- Thư mục này: `xem-bien.png`, `xem-bien.gif`, `cong-cu/dung-bien.py`, `cong-cu/ve-soat.py`, báo cáo này.

Kiểm: `node --check` `game/js/sprite_custom.js`, `game/js/ky_nang_quai.js`, `game/js/chieu_trum.js` — đạt. `python3 game/build.py --hai-tep` — đạt (số ở mục 5).

## Còn lưu ý

- Cá Nóc Chúa Phồng lăn: lúc báo trước (`chieu1`) ảnh đã phồng (hàng báo đòn) mà code vẫn phóng to thêm ×1,35 → phồng gấp đôi trong ~0,7 s. Muốn bớt thì giảm `phong`
  của `caNocLan` trong `chieu_trum.js` khi có ảnh mới — chưa làm vì ngoài yêu cầu.
- Cua Tướng chiêu Kẹp chéo: nhánh cũ phát `chieu1` hai lần (một lần lúc báo trước, một lần lúc ra đòn) nên đầu chiêu thấy báo đòn → đánh → báo đòn lại. Có từ trước, không đổi.
- Cá Con, Cá Chuồn, Cua: phần lướt / bơi / bay của kỹ năng do code dùng hàng đi (như cũ); Cá Con hàng đánh không được kỹ năng gọi.
- Hải Quỳ khung phun còn bọt nước dính đầu xúc tu (giữ, xem mục 1).
- 9/10 con 48 màu (32 + 16) thay vì 32, tệp nặng hơn chút; vẫn dưới trần.
- Chưa xem trong game thật (không chạy game theo yêu cầu): nên vào Hang biển nhìn 10 con, thử Ốc rút vỏ, Cá Nóc Chúa Phồng lăn, và `?quaicu=1` để so.
