# Bước 2 — Báo cáo Phiên A: Sổ yêu quái

Làm 15/10/2026 theo `KE-HOACH.md` (mục 1.0, 1.1, 2, 4 "Phiên A", "Tránh đụng nhau"), `bao-cao-phien-0.md`, `QUYET-DINH.md`, `LUAT-CAN-BANG.md`.
Nhánh `khoi-tao-du-an` (commit ghi ở mục 6). Không đụng master, không PR, không đổi đăng nhập Google / lưu mây / `?cloud=0`. Không chơi thử bằng trình duyệt
(chỉ chụp ảnh tĩnh).

## 1. Đã làm gì

| Tệp | Thay đổi |
|---|---|
| `game/js/so_yeu_quai.js` (mới) | Toàn bộ Sổ yêu quái: nghe sự kiện, ghi sổ, bù bản lưu cũ, thưởng, thẻ "Sổ" ở Ông Từ, chữ tiếng Anh (`G.ngonNgu.them`). |
| `game/js/data.js` | Khối riêng **ở cuối tệp** (IIFE có chú thích): `G.SO_YQ` = 36 trang + bảng thưởng. Không sửa dòng nào khác. |
| `game/index.html` | `<script src="js/so_yeu_quai.js">` ngay sau `vk_moi_lang.js` (sau `village.js` / `hanh_trang.js`, trước `cloud.js`). |
| `game/tests/so_yeu_quai.test.js` (mới) | Bài Node 41 điều kiện (mục 4). |
| `game/tests/so_yeu_quai_shots.py` (mới) | Ảnh soát tĩnh `docs/ke-hoach/buoc-2/xem-so.png` (VI + EN) + đếm chữ bị cắt / lệch khung. |
| `game/tests/su_kien.test.js` | Một dòng: bản "thường" của bài Phiên 0 chạy với `?soyq=0&viecngay=0&thanhtuu=0` (bài đó kiểm nền chung: "so rỗng, chưa có cờ bu" — nay Phiên A cố ý bù và đặt `so.bu`). |
| `game/dist/*`, `tools/xuong-sprite/*` | Sinh lại bằng `python3 game/build.py`. |

Chỉ điền `G.villageApi.PANELS.so` (không đụng `PANELS.thanhTuu` của Phiên C, `PANELS.viecNgay` của Phiên B), không sửa `village.js`,
`village_scene.js` (chấm đỏ Ông Từ đã nối sẵn ở Phiên 0 qua `.cham`).

### Người chơi thấy gì
- Ông Từ có thẻ **Cu Tí | Sổ** (Thành tựu hiện khi Phiên C xong). Thẻ Sổ mở **ngay từ đầu** (ghi cả ải hướng dẫn).
- Hàng 3 thẻ vùng (Rừng già · Hang biển · Lâu đài cổ, chấm đỏ nếu vùng có quà). Lưới 4 × 3 ô quái: ô chưa gặp = **bóng đen + "?"**;
  ô đã gặp = hình quái (ảnh AI có sẵn) + 3 sao nhỏ (đồng / bạc / vàng theo nấc), dấu đỏ nhỏ khi đã tìm điểm yếu, chấm đỏ khi có quà; ô thuần thục viền vàng.
- Trang chi tiết bên phải (giấy cũ): hình, tên, loại · vai, 3 sao, "Hạ n/30", "Điểm yếu: Lửa" + **dấu đỏ đóng lên chân dung**,
  mẹo đánh (câu có sẵn ở `ky_nang_quai.js`; tinh anh / trùm nhỏ có câu riêng). Trùm vùng: lớp thích nghi đã gặp, vết sẹo (`save.scars`),
  hạ nhanh nhất (kỷ lục Bảng vàng `save.rec.b`), sao cao nhất ở ải 5. Dòng quà / "Nấc sau", nút **Nhận**.
- Ô "Hoàn thành vùng" dưới lưới: ★★ x/12 · ★★★ y/12, thưởng vùng, nút Nhận.
- Ông Từ nói: "Có trang sổ chép xong rồi, cháu bấm Nhận…", "Hoá ra nó sợ Lửa!", …
- Trong ải: dòng báo nhỏ "Sổ yêu quái: Cá Nóc — trang mới!" / "— tìm ra điểm yếu!" / "— thuần thục!" (chỉ khi **không** có dòng báo khác,
  không đè mẹo lần đầu gặp, tên trùm). Bảng kết quả: "Sổ yêu quái: 3 trang mới", "Sổ yêu quái: Mộc Tinh — tìm ra điểm yếu!".

### Luật đã làm (đúng mục 1.1)
| Nấc | Điều kiện trong code | Thưởng (bấm Nhận, mỗi nấc một lần) |
|---|---|---|
| Đã gặp | `gapQuai` (quái có mặt trong phòng bé đứng) | — |
| ★ Đã hạ | `haQuai` lần đầu | vàng: thường 20/40/60 · tinh anh 50/80/120 · trùm nhỏ 80/120/180 · trùm vùng 150/250/400 |
| ★★ Điểm yếu | quái thường / tinh anh / trùm nhỏ: đòn kết liễu mang hệ khắc (`d.el`), **hoặc** đang dính hiệu ứng hệ đó **do vũ khí** (`d.he`, đã bỏ phần do chưởng). Trùm vùng: `hetAi` thắng, `khacChe` (sao thứ ba) | linh khí 3 / 6 / 10 / 20 |
| ★★★ Thuần thục | hạ đủ 30 / 10 / 5 / 3 con | đá nâng bậc 0 (chỉ viền vàng) / 1 / 2 / 3 |
| Vùng ★★ | mọi trang vùng đạt ★★ | 5 / 8 / 12 đá nâng bậc + danh hiệu "Thợ săn <vùng>" |
| Vùng ★★★ | mọi trang đạt ★★★ | danh hiệu "Bậc thầy <vùng>" |

- Hệ khắc của quái thường **chỉ để ghi sổ, không thêm sát thương** (Q3 = a). Bảng hệ đúng như bảng 36 trang của kế hoạch.
- Quái phụ do trùm gọi (`e.add`), ảo ảnh (`e.illusion`) không tính (Phiên 0 đã lọc). Thua ải vẫn giữ số đã hạ. Ải ngày, độ khó 2 đều tính;
  ải ngày không phải trùm vùng.
- **Bù bản lưu cũ** (một lần, cờ `so.bu`, chạy trong `G.fixSave` nên cả bản máy lẫn bản kéo từ mây): vùng có ải đã qua → quái thường + tinh anh
  "Đã gặp"; qua ải 1–4 của vùng → trùm nhỏ "Đã gặp"; có sao ải 5 (thường hoặc độ khó 2) → trùm vùng "Đã hạ"; sao ải 5 = 3 → "Tìm ra điểm yếu".
  Thưởng của các nấc bù vẫn phải bấm Nhận. Bản lưu chưa qua `G.fixSave` (vd. "Xoá hết": `G.resetSave`) → sổ tự dựng phần `so` khi cần ghi.
- Bản lưu thêm đúng như mục 2: `so.q[mã] = { g, h, k, n }` + trường riêng `l` (bit lớp thích nghi của trùm vùng: kháng Lửa 1 · Độc 2 · Băng 4 ·
  chống đánh xa 8 · chống áp sát 16 · bắt bài lăn né 32), `so.vung[r]` (bit 1 / 2 đã nhận thưởng vùng). Sổ đầy đủ ≈ 1,3 KB.

### API cho phiên sau (ghi ở đầu `so_yeu_quai.js`)
`G.soYQ.dem(sv)` → `{ tong, gap, sao1, sao2, sao3 }` (Thành tựu 27 "Chép sổ" = `sao1 >= 12`, 28 "Sổ đủ trang" = `sao2 === 36`) ·
`G.soYQ.danhHieu(sv)` → `[{ ma: 'thoSan0'…'bacThay2', ten }]` danh hiệu đã nhận từ sổ (**Phiên C gộp vào danh sách danh hiệu**; tên:
`G.soYQ.tenDanhHieu(ma)`, VI "Thợ săn Rừng già", EN "Old Forest Hunter") · `G.soYQ.nac(sv, mã)`, `G.soYQ.BANG`, `G.soYQ.trangVung(r)` (Phiên B: việc
"Hạ 8 con <tên quái đã có trang sổ>", "Tìm ra điểm yếu của 1 quái mới") · `G.soYQ.nhanHet(sv)` (bot Phiên E bấm Nhận hết).

## 2. Cờ quay lui
`?soyq=0` (hoặc `G.SO_YQ_BAT = false` trước khi nạp): không nghe sự kiện, không bọc `G.fixSave`, không bù, thẻ "Sổ" ẩn (Ông Từ y như trước);
dữ liệu `so` có sẵn trong bản lưu giữ nguyên. `?sukien=0` cũng tắt hẳn sổ. Ảnh mới (Phiên D) theo cờ chung `?khunganh=0`.

## 3. Chỗ còn vẽ code tạm (chờ Phiên D cắt ảnh `docs/anh-goc/buoc-2/`)
Mỗi chỗ đã gọi trước `G.spriteCustom.gdSan(mã)`; có ảnh là tự dùng, không phải sửa code:

| Ảnh gốc | Mã game chờ | Chỗ vẽ tạm (hàm trong `so_yeu_quai.js`) |
|---|---|---|
| B1 gd-so-trang | `gd-so-trang` (9 mảnh) | `veKhungTrang`: giấy cũ, viền đồng, đinh góc; ★★★ viền vàng |
| B3 gd-so-o | `gd-so-o-0` / `-1` / `-2` | `veO`: ô tối "?" / ô đồng / ô vàng |
| B4 gd-so-dau | `gd-so-dau-fire` / `-poison` / `-ice` | `veDau`: vòng mực đỏ + ngọn lửa / giọt độc / bông tuyết (trùm vùng: chấm giữa) |
| B5 gd-so-sao | `gd-so-sao-0` … `-3` | `veSao`: sao 5 cánh trống / đồng / bạc / vàng |
| B2 gd-so-bia, B16 hu-dong-dau, B15 hu-nhan-thuong | — | chưa dùng (thẻ Sổ dùng chữ như các thẻ khác; bấm Nhận chỉ có tiếng `evolve` + dòng Ông Từ nói "+20 vàng · …"). Phiên D có thể thêm hiệu ứng. |

Hình quái trong sổ dùng lại ảnh có sẵn (`G.monsterArt.draw`, qua `sprite_custom.js` nếu có ảnh AI); bóng đen = vẽ hình vào tấm phụ rồi phủ đen theo dáng.
Mã ảnh B1 vẽ giấy SÁNG nên chữ trên trang dùng mực tối (#3a2414) — ảnh B1 thật cũng là giấy cũ, hợp màu chữ.

## 4. Cách kiểm (đã chạy)
```
node --check game/js/so_yeu_quai.js game/js/data.js game/tests/so_yeu_quai.test.js
python3 game/build.py                                # ra dist/ không lỗi
node game/tests/so_yeu_quai.test.js                  # PASS — 41 điều kiện (vài giây)
node game/tests/su_kien.test.js                      # PASS — 83 điều kiện (bài Phiên 0)
node game/tests/cloud_save_regression.test.js        # 7 PASS
python3 game/tests/so_yeu_quai_shots.py              # ảnh soát docs/ke-hoach/buoc-2/xem-so.png
```
`so_yeu_quai.test.js` (bản thường + bản `?soyq=0`):
1. Bảng: 36 trang, không trùng, mã nào cũng có hình; mọi quái của `G.MOB_ART` có trang; loại / vùng khớp `monster_art.js`; tổng thưởng 2.640 V · 198 LK · 46 Đ.
2. `G.kill` thật: heoCon hạ bằng đòn Băng → ★ (chưa ★★), đòn Lửa → ★★; độc do chưởng không tính, do vũ khí tính; đóng băng → ★★;
   quái phụ / ảo ảnh không tính; 10 tinh anh / 30 quái thường → ★★★; không ghi mã lạ.
3. Trùm vùng: không sao 3 → ★ + lớp thích nghi; có sao 3 → ★★ + dòng ở bảng kết quả; thua / ải ngày không tính.
   Bot thắng ải 1-5 thật: Mộc Tinh 1 lần hạ (không đếm hai lần), số hạ từng trang = số sự kiện.
4. Bù bản lưu cũ đúng (cả độ khó 2), một lần; 15 bản lưu `cay_luu.json`: `G.fixSave` không đổi gì ngoài `so` so với bản `?soyq=0`.
5. Nhận: Cua Tướng +80 V +6 LK +1 Đ đúng một lần; chấm đỏ thẻ + Ông Từ bật / tắt; thưởng vùng +5 Đ + danh hiệu một lần.
6. Vẽ 36 trang × VI / EN không lỗi; tiếng Anh không còn chuỗi Việt chưa dịch (`G.ngonNgu.thieu`); Ông Từ nhớ thẻ vừa xem.
7. `?soyq=0`: thẻ ẩn, không bọc, không ghi, không bù; không có lỗi ngầm.

Ảnh soát `xem-so.png` (màn 480×270, điểm ảnh ×2; trên: Rừng già / trang Mộc Tinh có quà chờ; dưới: Hang biển / Cua Lính cạnh ô chưa gặp; trái VI, phải EN).
Script còn vẽ cả 36 trang × 2 ngôn ngữ trong trình duyệt và đếm chữ `T.chuTrongKhung`: **0 chỗ cắt "…", 0 chỗ thấp hơn khung, 0 chỗ đệm hẹp**
(mọi chữ trong ô / trang / nút đặt bằng `T.chuTrongKhung` hoặc nút `T.sbtn`), 0 lỗi console.

## 5. Cân bằng (LUAT-CAN-BANG.md)
**Thêm bao nhiêu**: chỉ thưởng một lần cho cả game (không theo ngày, không theo lượt): tối đa 2.640 vàng, 198 linh khí, 46 đá nâng bậc
(gồm 25 đá thưởng vùng). Không đổi sát thương, máu, rơi đồ, không gọi `G.rnd` / `Math.random`.

**Đo bằng bot Node** (`tests/cay.py 12 --node`, 12 lượt chiến dịch mỗi cột). "Sau, bấm Nhận" = bot bấm Nhận hết sổ mỗi lần về làng
(`--pre` bọc `G.botNang` gọi `G.soYQ.nhanHet`). Cột "sau, không nhận" là cùng luật đánh với "trước" — chênh giữa hai cột này là **độ nhiễu** của bot.

| | Trước (không có sổ) | Sau, không nhận | Sau, bấm Nhận |
|---|---|---|---|
| Số lần chơi qua 15 ải (TB) | 38 | 36 | 36 (−5% so với trước, = độ nhiễu) |
| Thời gian qua 15 ải (TB) | 182 phút | 177 phút | 176 phút |
| Lần chơi 1-5 / 2-5 / 3-5 | 3,8 / 4,5 / 6,2 | 3,8 / 4,2 / 4,8 | 3,4 / 5,0 / 4,5 |
| Thua TB ở 1-5 / 2-5 / 3-5 | 0,1 / 0,2 / 1,3 | 0,1 / 0,2 / 0,7 | 0,0 / 0,2 / 0,5 |
| Lúc qua 3-5: cấp · Sức mạnh | 29 · 588 | 29 · 574 | 29 · 579 |
| Lúc qua 3-5: vàng còn · linh khí còn · quặng | 2.081 · 446 · 159 | 1.339 · 454 · 163 | 1.868 · 461 · 170 |

Bot thực nhận trong một chiến dịch (đo riêng 2 lượt): **2.240–2.640 V, 98–137 LK, 14 Đ** (bot hay đánh đúng hệ nhưng không đủ ★★ cả vùng nên chưa có
đá thưởng vùng) ≈ +11–13% vàng, +3–5% linh khí so với thu nhập cả chiến dịch (~21.000 V, ~3.000 LK gồm ải ngày).
Bài `tests/balance.py 3 --node` (bản lưu cố định từng ải, `?soyq=0` / bật): thắng 39/45 và 41/45 — sổ không đổi luật đánh nên chênh là nhiễu.

Kết luận: số lần chơi qua 15 ải giảm 5% (ngưỡng 10%), đúng bằng độ nhiễu; tỉ lệ thắng / thua từng ải chênh trong độ nhiễu; vàng còn lúc qua 3-5
không dư thêm (1.868 < 2.081). **Chưa bù** bằng cách bớt thưởng chỗ khác (luật mục 3) vì: (a) chủ game chốt Q4 = "thưởng như bảng mục 1",
(b) đo chưa thấy lệch vượt ngưỡng, (c) Phiên B, C cũng thêm thưởng song song — bù một lần cho cả ba hệ ở Phiên E (kế hoạch mục 5) đúng chỗ hơn.
Nếu Phiên E thấy cần bù, nút vặn gọn nhất nằm ở `G.SO_YQ` cuối `data.js`: `vang` (★, phần lớn vàng của sổ) và `vungDa`.

## 6. Commit
- `Bước 2 Phiên A: Sổ yêu quái …` — code, bảng, bài kiểm, ảnh soát, báo cáo này (một commit; mã commit xem `git log` nhánh `khoi-tao-du-an`).

## 7. Lưu ý cho phiên sau
- **Phiên C**: gộp `G.soYQ.danhHieu(sv)` vào danh sách danh hiệu (6 danh hiệu sổ); thành tựu 27–28 đọc `G.soYQ.dem(sv)`.
  Bài `su_kien.test.js` đã có `thanhtuu=0` trong cờ của bản "thường" (cờ chưa có thì vô hại).
- **Phiên D**: cắt B1, B3, B4, B5 ra đúng các mã ở mục 3; B3 nên là 3 tệp riêng (`gd-so-o-0/1/2`), B4 3 tệp (`gd-so-dau-<hệ>`), B5 4 tệp (`gd-so-sao-0..3`).
- **Phiên E**: bot bấm Nhận sổ bằng `G.soYQ.nhanHet(G.save)`.
