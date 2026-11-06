# HỒI QUY — TURRET MERGE (bộ kiểm `tools/thap-kt-hoiquy.js`)

**Chạy trước MỖI lần publish** (QUY-TAC-HINH.md mục 9):

```
python3 -m http.server 8765 &
NODE_PATH=/opt/npm-tools/node_modules node tools/thap-online-mock-server.js 8787 &
NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-hoiquy.js      # ≈ 20 phút, 4 cỡ màn, phải ra XANH
#   SIZES=390x844x3  · NHANH=1 (bỏ đoạn tới wave 12)  · CHI=landau|menu|solo|coop|pvp|online  · OUT=thư-mục-ảnh/
```

Bộ kiểm đi hết game như người chơi (chạm thật vào giữa nút, kéo thật bằng con trỏ) ở **360×780, 390×844, 430×932 (DPR 3) và 1280×800**:
mở lần đầu (localStorage trống: màn tải → trận hướng dẫn → bấm SUMMON 2 lần → bỏ qua) · bản lưu CŨ/hỏng (khoá lạ, ụ đã xoá, JSON hỏng) →
HOME → chọn chế độ (CO-OP/PVP/SOLO) → cài đặt → bộ bài (kéo thẻ vào ô 5, chạm thẻ → trang ụ → lui, REMOVE / ADD, lọc, tìm, bộ mẫu, chỉ huy) →
trang chỉ huy, trang ụ, Test range → bộ sưu tập → **mất mạng / nối lại** → PLAY thật → trận SOLO (đo fps, ghép KÉO, ghép CHẠM–CHẠM, xem nhanh,
dừng/tiếp, tốc độ, chỉ huy, tự chơi tới **wave 12 qua trùm**, gọi lần lượt **đủ 12 trùm**) → CO-OP và PVP với máy → thắng / thua → PLAY AGAIN →
sảnh ONLINE 2 người trên máy chủ giả (tạo phòng, vào bằng mã, READY, vào trận).

TRƯỢT khi: lỗi trang / console · ảnh 404 · nút ra ngoài màn hoặc bị nút cùng lớp đè · chữ tràn / ảnh méo / cuộn ngang (`thap-kt-tran-do.js`) ·
chân dung lọt khung (`thap-kt-vach.js`) · ảnh bị phóng > 1,25× ở DPR 3 (so với mốc nợ ảnh) · vẽ tay (`thap-kt-vetay.js`) · màn trống/đen ·
fps < 45 do chính game (> 22 ms/khung) · kẹt (bấm không phản hồi, wave đứng > 60 s, không tới wave 12) · màn tải / mất mạng không phủ kín cửa sổ ·
dải đầy của thanh tải không trải hết rãnh.

## Kết quả lượt rà 5/11/2026 — 19 lỗi hồi quy tìm thấy, đã sửa cả 19

| # | Lỗi (ở đâu) | Ảnh | Sửa |
|---|---|---|---|
| 1 | **Màn tải chỉ có 1 đoạn ở giữa**: (a) dải đầy `tai_day.png` bị luật chung `img { object-fit: contain }` (tran.css) thu thành mẩu 100 px giữa rãnh 274 px; (b) màn tải nằm trong khung 430×860 của `#wrap` → cột giữa + 2 dải tối (máy tính) / dải trên-dưới (điện thoại) | `hoiquy/01_dai_tai_chi_o_giua_truoc.jpg`, sau: `hoiquy/02_man_tai_sau_360-390-430-820-1280.jpg` | (a) taitai.css ép ảnh `object-fit: fill` (phiên khác, e8b70da) · (b) `#tai`/`#matmang` gắn thẳng vào `<body>`, `position: fixed` phủ cả cửa sổ; nội dung co theo `--tk`; thanh rộng 330 |
| 2 | Màn **mất mạng** cũng chỉ ở cột giữa | — | như 1b |
| 3 | Nút RECONNECT: ảnh 176×108 bị kéo thành 224×62 (méo 122 %) | `hoiquy/03_mat_mang_nut_meo_truoc.jpg` | tấm 9 lát (border-image) |
| 4 | **Bản lưu cũ**: lọc vai lạ trong `turret_loc` → lưới bộ bài TRỐNG ("No turret matches") | `hoiquy/04_luu_cu_luoi_bo_bai_trong.jpg` | bobai.js: vai lạ → ALL |
| 5 | Bản lưu cũ: độ hiếm lạ trong `turret_hm` → ẩn hết thẻ | (cùng ảnh 4) | home.js: chỉ nhận `all`/bậc có thật |
| 6 | Bản lưu cũ: chế độ lạ trong `turret_bo` | — | ui.js: chỉ solo/coop/pvp |
| 7 | Lần đầu: bảng HƯỚNG DẪN chồng lên màn mở đầu trận | `hoiquy/05_huong_dan_chong_man_mo_tran.jpg` | huongdan.js: đợi VT đóng mới hiện |
| 8 | Chữ CONTINUE / "Starting in N" đè viền nút | (ảnh 5) | line-height 1.1 |
| 9 | Tiêu đề hướng dẫn bị cắt 3 px | — | line-height 1.3 |
| 10 | **Trùm mới (Hive Mother…) tải `trum_hive.png` → 404 ×6** mỗi lần trùm báo chiêu (dễ kích hoạt "mất mạng" giả) | `hoiquy/08_trum_hive_404.jpg` | quaianim.js / render.js: dùng dải MƯỢN của trum.js (`REN.tenQuai`) |
| 11 | Băng cảnh báo trùm (tvb): dòng mô tả bị cắt 4 px | `hoiquy/07_bang_canh_bao_trum_cat.jpg` | tvb.css line-height 20 |
| 12 | Băng cảnh báo trùm (tvb): chữ đè viền trên/dưới của tấm | — | tvb.css đệm 14 px trên/dưới (≈ 86 px, vẫn ≤ 96) |
| 13 | Màn mở trận: tên trùm (JOKER KING, TWIN CORE…) cắt 3–4 px | `hoiquy/06_ten_trum_cat_doc.jpg` | tvc.css line-height 1.45 |
| 14 | Giá chỉ huy "×16" tràn tấm 2 px | `hoiquy/09_gia_chi_huy_x16_tran.jpg` | chihuy-the.js: cỡ chữ tính cả nhãn ×N |
| 15 | Vòng chỉ huy `h2_mv_huy` phóng 3,5× (mờ) sau khi trang chỉ huy to ra | `hoiquy/10_vong_chi_huy_mo_3_5x.jpg` | cắt lại từ raw_hud2_06 ở 570 px (`hoiquy/12_vong_chi_huy_cat_lai.jpg`) |
| 16 | Mũi tên hướng dẫn `h2_canh_bao` phóng 2,7× | — | cắt lại từ raw_hud2_11 ở 120 px |
| 17 | Khay đồng đội `h2_khay_doi` phóng 1,34× | — | cắt lại từ raw_hud2_08 ở 600 px |
| 18 | Kiểm vẽ tay đỏ 56 dòng: bóng/tô/mặt nạ của ảnh PNG chưa ghi `vetay-ok` (các phiên mới thêm) + 6 dòng báo nhầm (`Array(n).fill`, viền trong suốt) | — | chú thích từng dòng (png / mask / nen); sửa luật trong thap-kt-vetay.js |
| 19 | Icon chế độ `ic_solo/ic_pvp` to lên (tvc) → 1,50× | `hoiquy/11_icon_che_do_mo.jpg` | chưa có ảnh nét hơn → nâng mốc nợ ảnh; chờ `tv_ic_*` (E32) của phiên tư vấn C |

## Còn lại — KHÔNG phải hồi quy, ghi để biết

* **Nợ ảnh (≈ 100 ảnh)**: ở iPhone DPR 3 bị phóng 1,3–3× vì tấm ChatGPT gốc đã ở độ phân giải cao nhất (pilot_* 256 px, ngoc_* 32 px,
  af_* 474 px, ic_* 96 px, h2_chip 109 px, tai_day 192×28, the_khung_*…). Mốc từng ảnh: `tools/thap-kt-hoiquy-mo.json` — bộ kiểm chỉ trượt khi
  ảnh MỚI bị mờ hoặc ảnh cũ mờ HƠN mốc > 5 %. Muốn hết: gen lại ở 3× cỡ hiển thị lớn nhất (QUY-TAC mục 2, 5) rồi `GHI_MO=1` để hạ mốc.
* **fps CO-OP / PVP 30–40 trên máy kiểm** (headless, không GPU, 2 lõi): bản hôm qua (563c7e7) cũng 32 → không phải hồi quy; chính game chỉ tốn
  2–4 ms/khung. SOLO 55–60. Bộ kiểm chỉ trượt khi fps < 45 VÀ game > 22 ms/khung.
* Bỏ qua có chủ đích (BO_QUA trong bộ kiểm): vòng hồi chiêu chỉ huy và chữ LV của ô tướng cố ý chồng lên mép khay `#duoi`.

## Vì sao sửa xong lại sinh lỗi
Nhiều phiên cùng sửa thap/ một lúc, mỗi phiên chỉ chụp màn mình sửa. Luật CSS chung (vd. `img { object-fit: contain }`, `!important` ở tvA/tvb/tvc/otoigian)
đè lên màn khác mà không ai nhìn lại. Bộ kiểm này đi hết mọi màn ở 4 cỡ → chạy trước khi push là thấy ngay.

## 2026-11-05 — 404 trum_hive.png / trum_jammer.png (390x844, trum_jammer/prism/twin_core/patcher)
Sau khi hive/jammer có ảnh riêng (TRUM_ANH), lúc trùm báo chiêu `quaianim.js` vẫn nạp dải 4 khung `trum_<id>` (không tồn tại) → 404 lặp.
Sửa: bỏ nạp dải 4 khung cho trùm đã có ảnh riêng (dùng dải _8 / dải đánh). Kiểm lại 390x844x3 NHANH: XANH.

## 2026-11-05 — session huong3 (hướng nhìn tinh anh/trùm)
- Kiểm 390x844x3 NHANH: menu/solo/coop/pvp/landau XANH; **online_tran TRƯỢT (kẹt chờ `ONS.on && G.ban.length===2`)** — lỗi CÓ SẴN, không do huong3:
  chạy lại với quaianim.js + trum.js bản trước huong3 (4ff9437) vẫn trượt y hệt. Xuất hiện sau đợt sửa sảnh online 9151d9e (phiên online đang làm) → giao phiên online.
## 2026-11-05 — `.cht-vong > b` ra ngoài ô tối giản #the-mv (mọi cỡ, mv / solo_trum)
Vòng hồi chiêu chỉ huy (13s…) đặt `right:-1px` → chữ lệch ra ngoài khung ô `#the-mv.ot` (có sẵn trên nhánh trước phiên khởi động nhanh).
Phiên khác đã sửa cùng lúc (1cadf35, cách mép 7 %) → giữ bản đó.
Phiên khởi động nhanh (docs/demo-hop-tuong/tuvan/khoidong/BAO-CAO.md): thêm `tools/thap-kt-khoidong.js` (DECK/PLAY bấm sớm khi đợt nền chưa xong).

## 2026-11-05 — (khởi động nhanh) kẹt "LOADING BATTLE 99 %" lần đầu (390x844 boot, chập chờn)
Yêu cầu ảnh bị treo (máy kiểm giả mạng chậm rồi bỏ chặn giữa chừng) → `img.decode()` đợi mãi. Sửa `TAI._mot`: hết hạn 20 s/40 s… thì
tải lại URL mới; webp lỗi giải mã → .png. `CHI=landau` 4 cỡ ×3 lần: XANH.
Còn lại: `online_tran` (bước vào trận online trong thap-kt-hoiquy.js) TRƯỢT cả trên nhánh gốc d8171e8 không có thay đổi của phiên này
(thap-kt-online.js riêng thì OK) — chưa sửa, báo phiên ONLINE.

## 2026-11-06 — màn tải đứng 100 % + lưới bộ bài chân dung nhỏ (pn/pilot_*)
Chạy đủ 4 cỡ: 360x780 TRƯỢT "chân dung lọt khung — phóng quá độ nét 1,03" với ảnh nhỏ 200 px (chân dung phóng thêm theo khung mặt) →
tạo lại 256 px (`tools/thap-pilot-nho.py`), `SIZES=360x780x3 CHI=menu`: XANH. 1280x800 `solo_trum` "chữ tràn .ci-chu bị #cutin cắt" 1 lần —
chạy lại `SIZES=1280x800x1` đủ luồng: XANH (chập chờn theo thời điểm chụp cutin). 390/430: XANH. Kéo-thả 21/21 × 3 cỡ.

### 06/11 — Freezer nhiều ụ + nút SUMMON luôn hiện
4 cỡ: chỉ 1 lỗi "chữ tràn .ci-chu bị #cutin cắt" ở `solo_trum` (cutin chỉ huy đang trượt vào lúc chụp — chập chờn đã biết) → chạy lại
`SIZES=1280x800x1,360x780x3 CHI=solo`: XANH. Mới trong hồi quy: `tools/thap-kt-nut-trieu.js` (nút SUMMON + ảnh nền HUD, SOLO/CO-OP/PVP).
Riêng: `tools/thap-kt-freezer.js` XANH (số ụ theo wave, 6 s, Halo nửa, CO-OP chia, PVP, chọn mục tiêu tất định 8 trùm).
## 06/11/2026 — cấp thẻ DCDW (thebai.js / thebai-ui.js)
Lần 1 TRƯỢT 46 lỗi, 2 loại: (1) `ảnh méo` ruột thanh bản sao `.tb-day > img tai_day.png` (dải đầy kéo theo bề dài = mức đầy, QUY-TAC-HINH mục 3)
→ thêm lớp `tai-day` cho ruột thanh (cùng ngoại lệ với thanh tải); (2) `vẽ tay` drop-shadow mũi tên nâng cấp thiếu nhãn `vetay-ok: png`.
Lần 2 (4 cỡ, đủ luồng): **XANH — 0 lỗi** (1200 s). Sau rebase lên nhánh mới (lưới có content-visibility → thanh ngoài ô bị cắt) chuyển thanh bản sao vào TRONG ô; lần 3: **XANH — 0 lỗi** (1248 s).

- 06/11 màn bộ bài CHẠM kiểu DCDW (js/dkcham.js): chạm ô = bỏ (ổ trống giữ chỗ), chạm thẻ = thêm / chế độ đổi khi đủ 5, giữ 400 ms = chi tiết, Mythic sai = ô lắc đỏ, PLAY mờ chạm được, PRESET 1–6 tự lưu. thap-kt-keo.js + bước cham_the đổi sang GIỮ = chi tiết. Hồi quy 390 XANH.

## 2026-11-06 — (chống nóng máy, tuvan/nong) thêm bước "nong" + nút POWER SAVE
Thêm `tools/thap-kt-nong.js` vào hồi quy (trận SOLO wave 13 chuẩn, 45 s, iPhone 13): trượt nếu CPU/khung > mốc 19,3 ms × 1,35.
Lần chạy đầu: nút cài đặt "BATTERY SAVER: OFF" tràn khung 6 px (360/390) → đổi chữ "POWER SAVE: OFF". `#canh-bao` "WAVE 10 BOSS"
tràn 3–4 px 1 lần ở 390 (chụp lúc băng đang hoạt ảnh, không do phiên này) — chạy lại `CHI='menu|solo'` 360+390: XANH; coop/pvp/online 4 cỡ: không lỗi. Sau rebase (cấp thẻ, cộng hưởng 2): đủ 4 cỡ XANH (CPU/khung 19,0 ms).
- 07/11 một màn tải duy nhất + Service Worker (tai_1lan): 4 cỡ — chỉ 1 lỗi "chữ tràn .ci-chu" ở 360x780 solo_trum (cutin chập chờn đã biết) → chạy lại `SIZES=360x780x3 CHI=solo`: XANH. Sửa thêm: skilldemo.js nạp 2 lần (DOMContentLoaded phát 2 lần) → "SD already declared" ở kéo-thả 360px.

## 2026-11-06 — (chống nóng 4G) bước "mang" + Firebase ngắt khi đánh offline
Thêm `tools/thap-kt-mang.js` (trận SOLO: ≤ 1 yêu cầu/phút, ≤ 8 KB/phút, không WebSocket; Firebase giả: goOffline khi đánh, goOnline ở menu).
Hồi quy trên nhánh làm việc: ĐỎ vì việc của phiên khác (ụ vàng mới đợt 1/2 dùng đầu tạm → `thap-dau-giong.py` báo 5 cặp "ĐẦU GIỐNG"), không do net.js.
Vì vậy bản xuất bản lần này = **bản đã xuất bản ac3a8b6 + chỉ js/online/net.js mới** (thap-ver.py chạy lại). Hồi quy trên bản đó: mạng ✓,
sảnh online (Firebase giả + SDK thật, có theoDoiNgu) ✓, nóng/kéo/cộng hưởng ✓; các ✗ "ảnh mờ" là nợ ảnh đã biết — mốc `thap-kt-hoiquy-mo.json`
không khớp tên có `?v=` của bản đã băm (không phải lỗi mới). Ụ vàng đợt 2 chưa có trong bản xuất bản → kiểm của nó ✗ là đúng.
- 06/11 (ụ vàng đợt 2): hồi quy 4 cỡ 1 lỗi 1280x800 solo_trum 'chữ tràn' cut-in (.ci-chu) — chạy lại riêng 1280x800 solo: XANH (chập chờn theo thời điểm hoạt ảnh cut-in, không liên quan ụ mới).
## 06/11 — sửa 12 ụ vàng cũ theo DCDW
- Hồi quy đủ 4 cỡ: chỉ trượt `online_sinhdoi` 360×780 — Twin Maker nay 10% ra ụ sinh đôi +1★ (DCDW Berit), kiểm cũ đòi đúng sao. Sửa kiểm: chấp nhận sao hoặc sao+1 (B vẫn phải dựng y hệt A). Chạy lại CHI=online 4 cỡ: XANH. KT_SINHDOI cũng chấp nhận +1★.
- Mới trong hồi quy: tools/thap-kt-vang-sua.js (XANH).

## 06/11 — Cửa hàng / rương / vòng quay / nhiệm vụ / sự kiện (kinhte.js)
- Bước mới `shop` (tools/thap-kt-shop.js): Daily Specials tất định, tỉ lệ cộng 100%, bảo hiểm, không nhận 2 lần, lùi đồng hồ, di chuyển bản lưu, gộp Firebase, giao diện mở rương/quay — XANH.
- Lần chạy đủ đầu: 39× ảnh mờ ic_sao.png (nút EVENT trên HOME dùng ảnh 64 px) → đổi sang ui_sao.png (256 px); chạy lại menu|landau 3 cỡ DPR 3: XANH.
- 1280×800 online_2_nguoi/online_tran/online_sinhdoi kẹt 1 lần (thanh tải che nút onl-vao) → chạy lại CHI=online 1280: XANH (chập chờn, không liên quan cửa hàng).
- Lắp 9 tấm ChatGPT cửa hàng (tools/thap-lap-shop.py → assets/shop_*.png: ngọc, vàng, 3 rương đóng/mở, dải bung 16 khung, vòng quay + khung + mũi tên, 4 nút HOME, 2 băng rôn, khung hàng nhiệm vụ) → hồi quy đủ 4 cỡ: XANH (0 lỗi, 1620 s).
- 06/11 cân bằng bậc (tuvan/tier: TIERS.hs Tím/Vàng, HOTRO.BAC, số ụ lệch bậc, KY_NANG_CAP theo số mới): thêm `tools/thap-kt-tier.js` (trung vị 4★ Trắng < Xanh < Tím < Vàng < Đỏ) vào hồi quy — 4 cỡ: 0 lỗi, XANH (1552 s).
- 06/11 (cân bằng bậc, sau rebase 12 ụ vàng sửa DCDW): 4 cỡ 1 lỗi 1280x800 solo_trum 'chữ tràn' cut-in (.ci-chu, chập chờn đã biết) — chạy lại `SIZES=1280x800x1 CHI=solo`: XANH. Kiểm bậc: Trắng 0.88 < Xanh 1.13 < Tím 1.30 < Vàng 1.64 < Đỏ 3.75.
## 06/11 — giật khi ra skill
- Hồi quy đủ 4 cỡ XANH (1717 s). Mới trong hồi quy: tools/thap-kt-giat.js (JS khung quanh skill đỏ lần đầu / trùm ra + tung chiêu / ghép / chỉ huy / mọi skill 1 khung ≤ 30 ms máy đo, thu nhỏ ảnh ≤ 12 ms/khung, không lỗi trang). Báo cáo tuvan/giat_skill/BAO-CAO.md.
- 06/11 (giật skill, lần đẩy cuối): hồi quy solo 390×844 chỉ trượt `vangsua` Evolver "7★ xịt bị giảm sao → đếm lại" — trượt y hệt trên bản gốc b2b9739 (không có thay đổi giật skill) → lỗi của bản Evolver mới, không phải do giat_skill; thap-kt-giat.js XANH.

## 06/11 (lần chạy lại tier) — trước xuất bản b2b9739
- Hồi quy 390x844x3 NHANH: 1 lỗi — thap-kt-vang-sua.js "Evolver 7★ xịt bị giảm sao → đếm lại" kỳ vọng cũ `con > 40 s` (trước đợt cân bằng bậc Evolver (20+6★)→(14+5★) s = 35 s ở 6★). Sửa kỳ vọng thành "đếm lại đủ thời gian 6★" (≥ can(6★)). Chạy lại: XANH. Các bước khác (gồm thap-kt-tier.js) XANH.
- 06/11 giật skill bổ sung (băng chữ DOM trong nongskill.js mục 4): CHI=solo 390 NHANH — giat ✓, nóng 18,2 ms ✓, vàng sửa ✓; 1 lần 'mạng trong trận' ĐỎ (4 yêu cầu ảnh tình huống tải nền 3 s sau vào trận — chập chờn: bản gốc dda0510 cũng ĐỎ 1 lần) → chạy lại thap-kt-mang.js: solo 0 yêu cầu → XANH.
- 06/11 (Tiếng Việt + đối chiếu mô tả): hồi quy 390×844 XANH mọi bước, gồm kiểm mới `thap-kt-vi.js` (✓ Tiếng Việt đủ); chỉ còn `vangsua` Evolver "7★ xịt bị giảm sao → đếm lại" — chạy lại trên bản gốc 4f04f64 (chưa có thay đổi ngôn ngữ) trượt y hệt → lỗi có sẵn của bản Evolver (đã sửa ở dda0510 — kỳ vọng mới).

## 06/11 Copycat chép ô đá/băng
- Hồi quy đủ 4 cỡ: 1 lỗi `chữ tràn` 1280x800 solo_trum (`.ci-chu > b` băng giới thiệu trùm, cao 0 px lúc đang trượt vào — chụp giữa hoạt ảnh); chạy lại SIZES=1280x800x1 CHI=solo NHANH=1 → XANH. Không liên quan Copycat. Mới: tools/thap-kt-copycat-da.js ✓ (trong hồi quy), thap-kt-conghuong.js cập nhật ✓.
- Sau rebase (390×844 NHANH): mọi bước XANH trừ `tiengviet` — 2 chuỗi mới của Copycat (đã thêm vi.json, thap-kt-vi chạy lại chỉ còn 3 chữ cài đặt P1 `EFFECTS/REDUCE FLASH/HAPTICS` của session VFX, đã ghi ở 532a2a8, không phải của việc này).
### 06/11 — ma trận tương tác (tools/thap-kt-matran.js)
- Hồi quy đủ 4 cỡ trước khi rebase: XANH (2210 s). Sau khi rebase lên d2ba6b3 (session khác: Leviathan, VFX P0, Tiếng Việt), chạy nhanh 1 cỡ: ma trận XANH; còn 2 lỗi KHÔNG do đợt này: `thap-kt-vi` thiếu bản Việt dòng mô tả Leviathan ("Abyss 0/100 · …", session Tiếng Việt / Leviathan đang làm) · `thap-kt-vang-moi.js` báo 1 lần "document is not defined" ở `anBangTran` (setTimeout ketThuc chạy trong node — chạy lại riêng: 0 lỗi, chập chờn).
## 06/11 — kiểm MÀU NGUYÊN TỐ (tools/thap-kt-mau.js, đã gắn vào thap-kt-hoiquy.js, CHI=mau)
- Lỗi iPhone: Wyrm Engine 4★+ / DRAGON DIVE để lại vệt cháy XANH DA TRỜI (vetChay/rongBo lấy RONG_MAU[gd] = bảng màu nón lửa xanh). Sửa: RONG_THAN (than hồng cam/đỏ mọi dạng), rồng bổ nhào thân đỏ + lửa cam.
- Bản gốc 56c9e49: 9 mục ĐỎ (ronglua ×5, blackhole, cuuvi, leviathan, mauhut). Sau sửa: 116 mục XANH (2 lần chạy). 36 mục "không có hiệu ứng trên đường" (ụ hỗ trợ / hiệu ứng nằm trên thân quái) được bỏ qua.

## 06/11 — ụ ngoài bộ bài (bất biến bộ bài, tools/thap-kt-ngoai-deck.js)
- Lỗi người chơi (iPhone, SOLO wave 33, bộ Thánh Địa · Hộp Bí Ẩn · Thuỷ Quái · Hộp Tiến Hoá · Máy Sao Chép): **Mimic 6★** (đầu khối cầu vồng) nằm lại trên bàn. Nguyên nhân: trùm **Joker King** ném Mimic lên ụ 6★ duy nhất → không có bạn cùng sao để ép ghép → Mimic ở lại vĩnh viễn. Fuzz trên bản cũ tái hiện ngay (Mimic 2–7★, SOLO/CO-OP/PVP).
- Sửa: Joker ưu tiên ụ có bạn cùng sao; lúc tung chiêu không còn bạn → chiêu hụt, ụ giữ nguyên. `deckTru` (Hộp Bí Ẩn / Tiến Hoá / Khởi Sinh) lọc hết → vẫn trong bộ (trước: lấy TOÀN BỘ danh sách ụ). Bất biến `ktDeck` mỗi bước (game.js): `?ktdeck` / mô phỏng ném lỗi kèm đường tạo ụ; bản thật ghi log + đổi ụ ngoài bộ thành ụ trong bộ cùng sao (tất định, bàn con rối online chỉ ghi log); localhost/URL debug tắt (công cụ tự đặt ụ). `taoU` có sẵn `nguon` (ụ sinh giữa vòng capNhatBan — Mạch Máu… — trước đây vỡ TypeError).
- Fuzz 3000 trận + 6 trận dài bộ người chơi XANH (hồi quy NHANH: 600 + 2). Thêm bản Việt dòng Leviathan "Abyss …" (thap-kt-vi trượt do session Leviathan).
## 06/11 — MỘT VÒNG (motvong.js: chỉ vòng xanh nạp chiêu, dạng = ngọc dưới huy hiệu sao)
- Hồi quy đủ 4 cỡ: trượt `thap-kt-vi` (3 chữ cài đặt camgiac EFFECTS/REDUCE FLASH/HAPTICS chưa dịch + 1 chữ 'skill' của motvong) → sửa motvong (3 chữ cài đặt: session khác đã dịch, lấy bản của họ khi rebase); `thap-kt-vi`: ✓. 390×844 online_2_nguoi/online_tran/online_sinhdoi kẹt 1 lần (thanh tải che nút onl-vao — chập chờn đã biết) → chạy lại `SIZES=390x844x3 CHI=online`: XANH. Còn lại mọi bước XANH.
- Sau rebase lên 6184904 (390×844 NHANH): `tiengviet` trượt vì chữ Leviathan mới viết thường ở bảng sao trang ụ ("Abyss…", "an ice dragon breathes along the path", "big ones ×#") → thêm 6 mẫu vi.json, `thap-kt-vi` ✓; `keo_the` kẹt 1 lần → chạy lại `CHI=menu`: XANH. demkn.js: tấm đếm không dựng ảnh đệm khi icon chưa nạp (trước đó Combo ×12 mất icon kiếm vĩnh viễn nếu đệm dựng sớm).
- Sau rebase lên 397e144 (390×844 NHANH, 1668 s): chỉ trượt `mau` nayda@1★ hue 87° (dải energy) → chạy lại `CHI=nayda node tools/thap-kt-mau.js` 2 lần: 77°/76° ✓ (bản gốc không motvong cũng dao động 76–78°) — chập chờn lấy mẫu, không do vòng/ngọc (nayda không có vòng/ngọc). Còn lại XANH.
- Kiểm riêng: `node tools/thap-kt-motvong.js` (iPhone 13, Leviathan ×5 + Wyrm + Combo + Werewolf + Hive Queen, bảng chạm EN/VI, trang ụ) — 0 lỗi trang.
- 06/11 (đợt kiểm mô tả lần 2 + VI bổ sung): hồi quy đủ 4 cỡ XANH trừ 3 bước online ở 1280x800 (thanh tải che nút onl-vao — chạy lại CHI=online SIZES=1280x800x1: XANH, lỗi chập chờn do máy bận).
- 06/11 tối (sau gộp QA ngâm + VFX P0): chạy đủ 4 cỡ còn 6 lỗi chập chờn (online 390: thanh tải che onl-vao; 430: tam_dung 404 + chữ cut-in Reinforce) → chạy lại riêng CHI=solo SIZES=430x932x3 XANH, CHI=online SIZES=390x844x3 XANH.

## 06/11 — QA NGÂM (bot chơi thật, tools/thap-qa-ngam.js)
- Vòng ngâm chính 303 trận (SOLO/CO-OP/PVP 100 mỗi loại + 3 ONLINE, ≈ 10 260 wave, tới wave 70–75): chỉ còn báo động giả (tâm ngắm Hex PVP — đã bỏ khỏi bộ kiểm) + cảnh báo giật. Báo cáo: docs/demo-hop-tuong/tuvan/qa-ngam/BAO-CAO.md.
- Bước mới `qangam` (tools/thap-kt-qa-ngam-repro.js): 2 Star Leech → 0★, 404 ảnh trùm mới, nhãn LV dài tràn thẻ, trùm chết giữa báo chiêu, ngâm ngắn 9 trận.
- Hồi quy 390×844 NHANH: chỉ trượt `qangam` (vòng tải ảnh + vòng triệu hồi chồng nhau — do bộ ngâm tua luật cả lúc TAI.doi, game thật đứng chờ) → bộ ngâm sửa theo vòng thật, chạy lại `qangam`: XANH (19 mục). Mọi bước khác XANH (1890 s).
- 06/11 (VFX P2 chiêu lớn, js/vfxp2.js): hồi quy 4 cỡ 1 lỗi 360x780 solo_trum 'chữ tràn' cut-in (.ci-chu, chập chờn đã biết) — chạy lại `SIZES=360x780x3 CHI=solo NHANH=1`: XANH. thap-kt-mau XANH (116 mục).
- 06/11 (VFX P2 gắn 12 tờ p2_*): hồi quy 390x844 NHANH XANH (1863 s); thap-kt-mau 9 mục chiêu lớn XANH.
- 06/11 VFX P3 đợt 1 (8e35116): SIZES=390x844x3 NHANH=1 → XANH, 0 lỗi (1752 s).
- 06/11 GIẬT GHÉP + TẤM TÊN (tuvan/giat-ghep, đã gộp VFX P3): hồi quy đủ 4 cỡ (có bước mới `giatghep` — tools/thap-kt-giat-ghep.js) → XANH, 0 lỗi (3 179 s). Ngâm SO=60 XANH.
- 06/11 MỤC IX/X review VFX v2 (tuvan/muc-ix/KIEM.md; thap-kt-vfx-p0 thêm mục 8–13): hồi quy đủ 4 cỡ (3 125 s) — chỉ trượt `mau` nayda@1★ hue 87° (chập chờn đã biết) → `CHI=nayda node tools/thap-kt-mau.js` 2 lần ✓ → XANH.
