# Ảnh mịn trên màn 3× (iPhone DPR 3) — 05/11/2026

Người dùng: "Sao nhìn không mượt mà mịn mà trông có vẻ vỡ vỡ nhỉ". Nguyên nhân: nhiều PNG thu về "2× DPR" của cỡ hiển thị,
iPhone vẽ 3× (canvas còn nhân R.s) → ảnh bị phóng 1.3–4× → mềm nhoè / răng cưa.

## Đo (tools/thap-kt-min3x.js, 430×932 DPR 3, ép `?dpr=3`, 18 màn: menu + 17 trận phủ 85 ụ)
Tỉ lệ = điểm ảnh màn lớn nhất / điểm ảnh PNG (> 1.05 = bị phóng). Trước → sau (ảnh đã cắt lại):

| ảnh | trước | sau | ghi chú |
|---|---|---|---|
| fxb_* (8 hào quang buff) | 1.41 | 1.01 | khung 224 → 312 |
| h2_sao / h2_sao_sang (huy hiệu sao trên bàn) | 2.88 | 0.79 / 1.0 | 64 → 205 |
| hud_ten_ban | 1.71 | 1.00 | |
| trum_*_8 (octopus, freezer, mad_crown, janus) | 1.40–1.75 | 1.00–1.33 | mad_crown giới hạn bởi raw |
| trum_* (6 dải 4 khung) | 1.36 | 1.07–1.11 | raw chỉ đủ 1.22–1.28× |
| quai_khong_lo_8 | 1.81 | 1.09 | |
| fx_vong_lv, pandora_dia, hu_khoa, hu_trangkhuyet | 1.8–2.6 | ≈1.0 | |
| fx_awaken, fx_starup | 1.55–1.64 | ≈1.0 | |
| fx_no_phao, fx_dien, fx_bang_vo, fx_khoi_doc, fx_summon, fx_merge, fx_link | 1.3–5.9 | 1.2–3.7 | raw_fx chỉ ~207 px/khung (giới hạn 1.6×); nổ to hiếm khi hiện tới 540 px |
| the_khung_* (khung thẻ, DOM) | 1.41 / 2.05 (mv) | ≤ 1.0 | 132×160 → 271×328 |
| af_hero/af_dahlia/af_eve (cut-in) | 1.83 | ≤ 1.0 | 256 → 474 |
| h2_trieu_*, h2_phim_*, h2_burst, h2_vfx_cong/ghep, nhan_kn (chiều cao) | 1.5–2.0 | ≤ 1.2 | |
| nen_menu.jpg | 2.87 | 1.68 | raw chỉ có 1024×1536 (nền cover) |

Giữ nguyên (raw không nét hơn / lệch khi cắt lại): hu_hoden (raw 1.08×), hat_tuyet, h2_ngoc, h2_vai_*, trum_joker_king_8 (khung 7 lấy từ dải cũ),
trum_nightmare_8, fx_laser_trung (khớp nhầm khung), khoi_* (không có trong raw). HUD trên (h2_rail, loi_khuc_day, seg_sang, h2_ic_tim) và ảnh
border-image (bang_*_nen, nen_hud_duoi, nut_lon_*, h2_lcd, h2_chip — số slice CSS tính theo điểm ảnh) để phiên HUD xử lý.
Ảnh hiệu ứng đánh v2 (fx_<ụ>_dan/_no/_trung/_tia, fx_st_*) của phiên FX đang làm cũng bị phóng 1.1–9.6× (CO 96/128 trong tools/thap-cat-fxv2.py)
→ nên cắt ở 3× cỡ vẽ lớn nhất theo QUY-TAC-HINH mục 5.

## Cách cắt lại (tools/thap-cat-3x.py)
So mẫu từng khung ảnh cũ trong tấm raw (cv2, nhiều tỉ lệ, dưới 1 điểm ảnh) → cắt đúng vùng cũ ở độ phân giải cao hơn, giữ khung/canh tâm/đăng ký;
alpha học từ ảnh cũ (độ lệch khỏi nền magenta/đen → alpha), tách trộn màu nền, viền σ≈0.5 px, khử hồng dư ở viền; Lanczos nhân-trước-alpha;
kiểm IoU + tương quan màu với ảnh cũ. Ảnh có phép cắt riêng chạy lại đúng script gốc ở cỡ lớn hơn (thap-cat-s89 khung thẻ, cut_fx_buff, hud2 day()/#07).
`tools/thap-cat-3x.json` ghi cỡ cũ → mới (chạy lại không phóng thêm).

## Bộ nhớ giải mã (canvas + ảnh, cùng hạt giống, 6 trận, ?dpr=3)
Trận TB 125.5 → 139.3 MB (+11 %, cao nhất +21 %); menu 46.6 → 51.4 MB (+10 %). Ảnh tình huống (fxb_*, hu_*, pandora_dia, fx_dien/laser_trung/
khoi_doc/bang_vo/link/awaken) không còn bắt màn tải giải mã trước trận — tải khi vẽ lần đầu (REN.LUOI / REN.boLuoi).

## Ảnh trong thư mục
- `anh-truoc-sau-dpr3.png`: từng ảnh ở cỡ hiển thị 3× — trái: ảnh cũ bị phóng (như iPhone), phải: ảnh mới thu nhỏ.
- `<430|390>-<solo|coop>-<loi-vong|u-hao-quang|khung-the|quai|dan|no-trung>.png`: cắt 1:1 điểm ảnh từ ảnh chụp DPR 3 (không phóng), trước | sau.
- `toan-<w>-solo-<truoc|sau>.jpg`: toàn màn.
