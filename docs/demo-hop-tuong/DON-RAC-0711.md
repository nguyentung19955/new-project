# Dọn rác Turret Merge — 07/11 (rà soát + xoá)

Mọi file xoá vẫn còn trong lịch sử git (khôi phục: `git checkout <commit>^ -- <đường dẫn>`). Nguyên tắc: không chắc thì GIỮ.
Không đụng: demo/, firebase.json, .firebaserc, .github/workflows, file thêm trong 6 giờ gần nhất.

## A1. Ảnh game `thap/assets/` — 54 file, ~2,3 MB

Cách tìm: (a) grep tĩnh tên/đường dẫn trong thap/js, thap/css, index.html, sw.js, manifest; (b) xét các tên ghép động
(`trum_<id>_8/_atk_16/_portrait`, `fx_trum_<id>`, `fx_<id>_sk`, `<id>_nong[_sN]`, `<id>_de/_vien/_phu`, `nho/<id>`, `pn/pilot_<id>`,
`pilot_<id>`, `hero/hero_<id>`, `o_vien_<bậc>`, `the_khung_<bậc>`, `tier_ring_<bậc>` (taitai), `quai_<id>[_8]`, `ngoc_<bậc>`…);
(c) chạy thật bằng Playwright (390×844): menu, BUILD DECK, COLLECTION (cuộn hết), trang chi tiết 93 ụ + 3 chỉ huy, trận
solo/co-op/pvp với cả 93 ụ đặt 1★/4★/7★, 12 trùm + quái thường — cả bản thường lẫn `?ucu=1`; ghi mọi URL `assets/`
(1 765/2 121 tên được gọi). Ứng viên = không thấy tĩnh, không khớp mẫu động, KHÔNG được gọi lúc chạy (0/54 bị gọi).

| Nhóm | Số file | Dung lượng | Lý do |
|---|---|---|---|
| `*_nong_v2old.png`, `nho/*_v2old.png` | 18 | 889 KB | bản lưu đầu ụ cũ do tools/thap-dau-u3.py cất; game không nạp (chỉ tools/thap-kt-copycat.js OLD=1 dùng để so) |
| `de_chung_1…6.png` | 6 | 510 KB | biến thể bệ chung — game chỉ dùng `de_chung.png` |
| `vong_nap_0…7.png` | 8 | 138 KB | không còn code nào gọi |
| `tier_card_*.png` | 5 | 270 KB | khung thẻ bậc cũ (đã thay bằng the_khung_<bậc>) |
| `p7_ic_{chep,chiase,dung,loa,nhac,phai,toc,xuong}`, `p7_tien`, `p7_o_chon` | 10 | 424 KB | cắt từ raw_p7 nhưng không dùng (đang dùng p7_ic_dong/xong, p7_o_trong/doi) |
| `h2_bulong, h2_dam, h2_vong_tim, loi_khuc_rong, loi_mau_khung, loi_thanh_khung, ui_bang_wave` | 7 | 109 KB | cắt thừa, không còn tham chiếu |

Danh sách: tron_nong_v2old.png, h2_vong_tim.png, de_chung_2.png, p7_ic_chep.png, de_chung_6.png, vong_nap_2.png, de_chung_1.png, vong_nap_7.png, tier_card_xanh.png, vong_nap_5.png, nayda_nong_v2old.png, p7_ic_toc.png, p7_ic_phai.png, p7_ic_dung.png, vong_nap_3.png, nhanban_nong_v2old.png, loi_khuc_rong.png, h2_bulong.png, loi_mau_khung.png, vong_nap_4.png, de_chung_5.png, p7_ic_chiase.png, lanhgia_nong_v2old.png, p7_ic_nhac.png, tier_card_tim.png, p7_ic_xuong.png, p7_ic_loa.png, tier_card_vang.png, tier_card_do.png, vong_nap_6.png, de_chung_3.png, p7_o_chon.png, vong_nap_0.png, pandora_nong_v2old.png, guongcong_nong_v2old.png, taylo_nong_v2old.png, combo_nong_v2old.png, h2_dam.png, de_chung_4.png, loi_thanh_khung.png, vong_nap_1.png, p7_tien.png, tier_card_trang.png, ui_bang_wave.png, saochep_nong_v2old.png, nho/combo_v2old.png, nho/nhanban_v2old.png, nho/tron_v2old.png, nho/lanhgia_v2old.png, nho/guongcong_v2old.png, nho/taylo_v2old.png, nho/pandora_v2old.png, nho/saochep_v2old.png, nho/nayda_v2old.png

GIỮ (dù grep tĩnh không thấy): `*_v1.png` (bộ đầu cũ `?ucu=1` — DAU_V1/ART_V1 còn sống, chạy thật có gọi), `<id>_vien/_de/_phu`
(ghép động), ảnh trùm 12 con, `fx_<id>_sk`, `o_vien_*`, `the_khung_*`, `tier_ring_*` (taitai nạp trước), `quai_*_8`, `hero/*`
(gồm chỉ huy af_*), `nho/`, `pn/`, `pilot_*`, `icon/*` (manifest/app store).

## A2. Tài liệu `docs/demo-hop-tuong/` — 1367 file, ~1286 MB (trên 3,58 GB)

- Ảnh chụp màn hình game (1352 file, 1284 MB): nhận theo kích thước đúng cỡ màn (390×844, 360×780, 430×932, 844×390,
  1280×800, 1920×934… ×1/1,5/2/3), nằm trong `tuvan/`, `hoiquy/`, `hud-redesign/`, KHÔNG được tool nào nhắc tên và KHÔNG
  được file chữ nào (GAMEPLAY.md, BAN-GIAO, KET-QUA/README/*.md, *.json, *.txt) nhắc tên — tức ảnh trước/sau, ảnh test của các đợt đã xong.
- Bản trùng y hệt trong `tuvan/` (15 file, 1.6 MB): giữ bản được nhắc / bản trong thap-art.

| Thư mục | File xoá | MB |
|---|---|---|
| tuvan/tvB | 72 | 296.3 |
| tuvan/hudmuot | 165 | 190.9 |
| tuvan/bopopup | 29 | 115.6 |
| tuvan/shop | 39 | 92.9 |
| tuvan/vetay | 87 | 52.4 |
| tuvan/toigian | 102 | 51.0 |
| tuvan/tuong_vang | 12 | 44.4 |
| tuvan/freezer | 11 | 39.4 |
| tuvan/ketqua_vua | 27 | 38.6 |
| tuvan/tran | 201 | 34.6 |
| tuvan/kynang_cap | 10 | 33.5 |
| tuvan/inspect2 | 7 | 29.7 |
| tuvan/tvC | 138 | 25.6 |
| tuvan/bo2hang | 48 | 25.1 |
| tuvan/tangsucmanh | 13 | 22.1 |
| tuvan/loading | 10 | 17.5 |
| tuvan/ketqua_onl | 14 | 17.0 |
| tuvan/tvA | 40 | 16.2 |
| tuvan/chon | 8 | 13.1 |
| tuvan/hudv2 | 66 | 13.0 |
| tuvan/buffvfx | 7 | 12.9 |
| tuvan/vachtren | 5 | 12.1 |
| tuvan/ngonngu | 30 | 11.6 |
| tuvan/fxv2 | 54 | 9.8 |
| tuvan/ngoisao | 5 | 8.8 |
| tuvan/vfx | 6 | 7.5 |
| tuvan/tuong-tac | 3 | 5.8 |
| tuvan/lobbyket | 12 | 5.5 |
| tuvan/tai2 | 2 | 4.7 |
| tuvan/tai_giua | 6 | 4.5 |
| tuvan/the-tran | 1 | 3.7 |
| tuvan/tai_1lan | 28 | 3.6 |
| tuvan/growfx | 2 | 3.2 |
| tuvan/coop2 | 11 | 2.6 |
| tuvan/muotghep | 17 | 2.6 |
| tuvan/min3x | 4 | 2.2 |
| tuvan/nhandien | 1 | 1.9 |
| tuvan/skilldemo2 | 2 | 1.8 |
| tuvan/deck_cham | 4 | 1.8 |
| tuvan/chonthe | 8 | 1.7 |
| tuvan/keotha | 7 | 1.6 |
| tuvan/dauu | 2 | 1.3 |
| hoiquy | 3 | 1.0 |
| tuvan/demsao | 3 | 0.9 |
| tuvan/vfx-ra-soat | 5 | 0.8 |
| tuvan/online | 12 | 0.8 |
| tuvan/marionette | 4 | 0.6 |
| tuvan/vong_hoichieu | 4 | 0.5 |
| tuvan/trummoi | 2 | 0.4 |
| tuvan/audit | 5 | 0.3 |
| tuvan/huongquai | 3 | 0.2 |
| tuvan/trum | 3 | 0.2 |
| thap-art | 1 | 0.1 |
| tuvan/f5fix | 1 | 0.1 |
| tuvan/motoc | 3 | 0.0 |
| tuvan/qa | 1 | 0.0 |
| tuvan/vach | 1 | 0.0 |

GIỮ: toàn bộ `thap-art/`, `nguon-tuong/`, `nguon-chatgpt/`, `tham-chieu/` (ảnh gốc để cắt lại, ảnh tham chiếu người dùng);
mọi ảnh ChatGPT/thiết kế (không đúng cỡ màn); 94 ảnh chụp có file chữ nhắc tên (73 MB); 72 ảnh chụp mới (< 6 giờ);
mọi GIF (130 MB — đa số được KET-QUA mô tả theo mẫu `gif/HO-*.gif`, trum-moi đang làm); toàn bộ file chữ, json, âm thanh.
Ứng viên "raw bị thay bằng _v2/2" (16 file, 21 MB: raw_mod_canon, raw_trum2_janus_chieu, cd_overlord/cd_set, TRUOC-SAU-abyss/swarm/wyrm.gif…)
— CHƯA xoá, chờ người dùng xác nhận.

## A3. tools/thap-* (chỉ liệt kê, không xoá)

- `thap-do-giat-goi.js` — chế độ GHI_AM ghi `thap/js/muotkn-am.js` cho `muotkn.js` đã bỏ (phần đo vẫn chạy).
- `thap-kt-copycat.js` OLD=1 — dựa vào `saochep*_v2old.png` vừa xoá (lấy lại từ lịch sử nếu cần so).
- `thap-kt-mau.js` mặc định ghi ảnh vào `docs/demo-hop-tuong/hoiquy/mau/` → dễ lọt ảnh test vào commit; nên đổi OUT sang /tmp.
- Không thấy script nào trỏ tới js/tool đã xoá ngoài 2 mục trên (các "thiếu" khác là .json hợp lệ).

## A4. Worktree trên đĩa

| Worktree | Nhánh | Kiểm | Kết quả |
|---|---|---|---|
| /home/claude/wt-roi | demo-hop-tuong (dòng cũ) | 837 thay đổi trong index: mọi nội dung đều đã có trong lịch sử origin, trừ `sigfx.js` (bản CŨ hơn origin) | đã gỡ |
| /home/claude/wt-trum | trum-quai-moi | HEAD đã nằm trong origin/demo-hop-tuong; chỉ còn ảnh test `hoiquy/mau/` | đã gỡ |
| /home/claude/wt-umod | vien-bac | commit 7f428b1b chưa push nhưng toàn bộ nội dung đã có trong origin (viền bậc gộp rồi); 1 GIF chưa commit | đã gỡ (nhánh local claude/vien-bac vẫn giữ commit) |
| /home/claude/new-project | kiem-nhan-dien | đồng bộ origin, 1 file sửa chưa commit (tuvan/trum-moi/PROMPT.md) | chỉ báo, không gỡ |

File không có trong git được cất ở `/home/claude/giu-tu-worktree/` (3,5 MB: ảnh hoiquy/mau, 7-U-MOI.gif, diff sigfx bản cũ).
Đĩa trống: 2,7 GB → 15 GB (giải phóng ~12 GB).

## B. Kiểm sau khi xoá (bản xuất từ nhánh, đã bỏ 54 ảnh, 390×844 DPR 3)

- Playwright: BUILD DECK, COLLECTION, 10 trang ụ (canon, bang, tia, set, lien, ronglua, leviathan, saochep, xuonganh, overlord),
  trận solo + triệu hồi + 3 trùm (freezer, hive, janus) wave 20: 0 yêu cầu 404, 0 lỗi trang; đã xem ảnh chụp, hiển thị bình thường.
- Đợt chạy thật toàn bộ (93 ụ × 1/4/7★, solo/co-op/pvp, 12 trùm, ?ucu=1): 0/54 ảnh xoá được gọi.
- thap-kt-khong-ban ✓ (25 ụ) · thap-kt-vfx-p0 ✓ · thap-kt-vi ✓ · thap-kt-mau: 1 lỗi `overlord@1★ hue 74° ∉ laser` — lỗi CÓ SẴN
  (chạy lại trên bản chưa xoá cũng ra y vậy), không liên quan dọn rác.
