# RÀ SOÁT ANIME TỪNG Ụ — 97 ụ (claude/demo-hop-tuong, 09/11)

Đích: phong cách anime fantasy-tech **Royal Twilight** (`huong-anime/BANG-MAU.md`: nền #10162F, viền vàng kem #E9CCA0, cyan #71E4EE…), mẫu đạt: Lucky Slot `cobac`, Compass `canon`, Evolver `tienhoa`, Blood Circuit `mauhut`.

Ảnh soát (xem bằng Read):
- `lienhoan_<bậc>.jpg` — preview thật `?notut=1&preview=<id>&star=1|3|5|7` 390×844 DPR3, cắt quanh ụ chính (Trắng: 1★/3★/5★/7★; bậc khác 1★ và 7★ — 3★/5★ không đổi hình, chỉ thêm sao). `haoquang` (Holy Halo): preview không dựng được ụ chính (SD.T rỗng sau 15 s) → chưa có ô.
- `icon_cu_<bậc>.jpg` — icon thẻ `nho/<id>.png` TRƯỚC khi làm lại (nhìn phong cách nhanh nhất).
- `truoc_sau_trang_a/b.jpg` — trận SOLO 390×844, trái = cũ, phải = mới.

## Tổng kết
| Hạng mục | Số |
|---|---|
| Ụ cần vẽ lại (lệch tông) | **57** — Trắng 14 + Xanh 17 (nặng: kim loại xám công nghiệp, không khung vàng/indigo) · Tím 22 (vừa: thân xám + tím) · Vàng 4 (`dongbo` bánh răng cam phẳng, `orbital` vệ tinh phẳng mảnh, `sinhdoi` trắng đen phẳng, `saochep` lưới cyan trơn) |
| Ụ đạt | 40 (29 Vàng + 11 Đỏ) |
| Thiếu hình biến hình | **11** ụ GROW-UP (`growfx.js` G_IDS): overlord hopbi lophanung orbital cuongno ngoisao lienket dongbo cuuvi ngaithoigian luoicheo — ảnh `_nong_s1..s3` là bộ cũ lệch đầu module v2 nên `artscale.js` cho cả 3 dạng dùng CHUNG 1 đầu + quầng màu. Có hình riêng theo trạng thái (vẽ đầu riêng trong skills): `soi` (đầu thường / thức tỉnh), `tienhoa` (trứng theo sao), `hydra` (số đầu theo sao), `ronglua` (f1–f4), `mauhut` (f2–f4). Mốc 3★/5★/7★ của mọi ụ khác là mốc KỸ NĂNG (hình giữ, thêm sao + quầng tier) |
| Animation | 97/97 có nhóm chuyển động (`anim-meta.js` ANIM_U: thở/nhún/giật nòng/quay/lơ lửng…) — không ụ nào đứng im. Biến hình grow-up có hoạt ảnh ~650 ms (`growfx.js`) |
| Hiệu ứng riêng của ụ | 93/97 có PNG `fx_<id>_*`; 4 ụ dùng ảnh tên khác (`cobac` cb_*, `tudo`, `thacmana`, `congap`) |
| Hiệu ứng còn VẼ TAY (canvas) | 3: `skills2.js` HU.soiLan (Sói — vòng + 3 vết vuốt bằng arc/quadraticCurveTo) · `skills3.js` veThan (thân Hydra — gradient + vòng, dựng sẵn) · `skills7.js` pmVeVet (Prism Thief — vệt vuốt gradient line) |
| Dự phòng vẽ code (chỉ khi thiếu ảnh) | `jackpot.js` 205–252 (ô/viền/vòng Lucky Slot khi ảnh chưa tải) |
| HUD/UI còn vẽ bằng code | `css/sohuu.css` 17/22 (viên đỏ "NEW" linear-gradient + box-shadow, nhấp nháy vô hạn) · `css/demkn.css` 17 (dải tối gradient sau số đếm) · bóng/khử sáng nướng 1 lần: `hud-anime.js` bongKhay/bongDuong (shadowBlur + filter), `hud2.js:189` (quầng sao 7★ shadowBlur), `vangmoi1.js:552` (filter lọc màu, cache) — không chạy mỗi khung |

## Bảng từng ụ
| # | Ụ | Bậc | Sprite (trước) | Mốc biến hình | Ảnh từng mốc | Animation (nhóm) | Hiệu ứng riêng (PNG fx_) | Ưu tiên / trạng thái |
|---|---|---|---|---|---|---|---|---|
| 1 | canon Compass Cannon | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | cannon | 5 | — |
| 2 | xucxac Dice Gun | Trắng | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | cannon | 4 | **ĐÃ LÀM** (raw_anime_u_trang1–4) |
| 3 | lien Gatling | Trắng | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | gatling | 4 | **ĐÃ LÀM** (raw_anime_u_trang1–4) |
| 4 | phun Scatter | Trắng | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | gatling | 4 | **ĐÃ LÀM** (raw_anime_u_trang1–4) |
| 5 | sungluc Revolver | Trắng | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | revolver | 5 | **ĐÃ LÀM** (raw_anime_u_trang1–4) |
| 6 | bang Frost | Trắng | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | ice | 5 | **ĐÃ LÀM** (raw_anime_u_trang1–4) |
| 7 | doc Venom | Trắng | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | poison | 4 | **ĐÃ LÀM** (raw_anime_u_trang1–4) |
| 8 | mana Mana Core | Trắng | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | **ĐÃ LÀM** (raw_anime_u_trang1–4) |
| 9 | tia Sniper | Trắng | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | nang | 6 | **ĐÃ LÀM** (raw_anime_u_trang1–4) |
| 10 | set Tesla | Trắng | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | chain | 6 | **ĐÃ LÀM** (raw_anime_u_trang1–4) |
| 11 | maychem Guillotine | Trắng | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | cannon | 4 | **ĐÃ LÀM** (raw_anime_u_trang1–4) |
| 12 | phagiap Armor Breaker | Trắng | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | **ĐÃ LÀM** (raw_anime_u_trang1–4) |
| 13 | bua Hammer | Trắng | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | **ĐÃ LÀM** (raw_anime_u_trang1–4) |
| 14 | nam Iron Fist | Trắng | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | cannon | 4 | P1 làm lại |
| 15 | bomhen Time Bomb | Trắng | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | chrono | 4 | P1 làm lại |
| 16 | nhanmana Mana Doubler | Xanh | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | **ĐÃ LÀM** (raw_anime_u_xanh1–6) |
| 17 | kiembang Ice Blade | Xanh | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | ice | 4 | **ĐÃ LÀM** (raw_anime_u_xanh1–6) |
| 18 | mimic Mimic | Xanh | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | evolver | 4 | **ĐÃ LÀM** (raw_anime_u_xanh1–6) |
| 19 | chimang Crit Antenna | Xanh | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | **ĐÃ LÀM** (raw_anime_u_xanh1–6) |
| 20 | dichchuyen Teleporter | Xanh | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | portal | 4 | **ĐÃ LÀM** (raw_anime_u_xanh1–6) |
| 21 | radar Radar | Xanh | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | **ĐÃ LÀM** (raw_anime_u_xanh1–6) |
| 22 | drone Drone Bay | Xanh | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | drone | 5 | **ĐÃ LÀM** (raw_anime_u_xanh1–6) |
| 23 | tron Fusion Mixer | Xanh | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | **ĐÃ LÀM** (raw_anime_u_xanh1–6) |
| 24 | nangluong Energy Cannon | Xanh | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | cannon | 4 | **ĐÃ LÀM** (raw_anime_u_xanh1–6) |
| 25 | laser Laser | Xanh | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | beam | 5 | **ĐÃ LÀM** (raw_anime_u_xanh1–6) |
| 26 | lanhgia Chiller | Xanh | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | ice | 4 | **ĐÃ LÀM** (raw_anime_u_xanh1–6) |
| 27 | mortar Mortar | Xanh | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | nang | 5 | **ĐÃ LÀM** (raw_anime_u_xanh1–6) |
| 28 | khuech Amplifier | Xanh | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | **ĐÃ LÀM** (raw_anime_u_xanh1–6) |
| 29 | vungdoc Toxic Pool | Xanh | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | poison | 4 | **ĐÃ LÀM** (raw_anime_u_xanh1–6) |
| 30 | loa Cooldown Horn | Xanh | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | **ĐÃ LÀM** (raw_anime_u_xanh1–6) |
| 31 | hutmana Mana Leech | Xanh | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | gatling | 4 | **ĐÃ LÀM** (raw_anime_u_xanh1–6) |
| 32 | min Mine Layer | Xanh | LỆCH NẶNG: kim loại xám công nghiệp, không khung vàng/indigo | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | poison | 5 | **ĐÃ LÀM** (raw_anime_u_xanh1–6) |
| 33 | cuongno Berserker | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | GROW-UP 3 dạng | **THIẾU** (_s1–s3 cũ lệch đầu v2 → 1 đầu + quầng màu) | cannon | 8 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 34 | baotuyet Blizzard | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | ice | 4 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 35 | nhanban Cloner | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | evolver | 4 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 36 | lienket Chain Link | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | GROW-UP 3 dạng | **THIẾU** (_s1–s3 cũ lệch đầu v2 → 1 đầu + quầng màu) | chain | 8 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 37 | kepha Jammer | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 38 | taylo Cleanser | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 39 | khien Shield Gen | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 40 | hopbi Mystery Box | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | GROW-UP 3 dạng | **ĐÃ CÓ** dạng 1/2/3 (raw_anime_u_dang_hopbi, STAGE_ANIME) | evolver | 8 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 41 | nangsao Star Lift | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 42 | tuthan Reaper Pillar | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 43 | xaotron Scrambler | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | revolver | 4 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 44 | epxung Overclock | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 45 | no5 Fifth Shot | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | cannon | 4 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 46 | bao Storm Gun | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | gatling | 5 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 47 | anhsang Lighthouse | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | beam | 5 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 48 | aten Purifier | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | cannon | 4 | — |
| 49 | dongbo Sync Cannon | Vàng | lệch vừa: phẳng/hoạt hình đơn sắc, thiếu khung vàng | GROW-UP 3 dạng | **ĐÃ CÓ** dạng 1/2/3 (raw_anime_u_dang_dongbo, STAGE_ANIME) | support | 9 | **ĐÃ LÀM** (hình chính = hàng 1 tấm biến hình) |
| 50 | railgun Salvo Battery | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | nang | 5 | — |
| 51 | vughep Merge King | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | evolver | 4 | — |
| 52 | sinhdoi Twin Maker | Vàng | lệch vừa: phẳng/hoạt hình đơn sắc, thiếu khung vàng | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | evolver | 4 | **ĐÃ LÀM** (raw_anime_u_vang2) |
| 53 | hasao Star Breaker | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | — |
| 54 | saochep Copycat | Vàng | lệch vừa: phẳng/hoạt hình đơn sắc, thiếu khung vàng | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | evolver | 4 | **ĐÃ LÀM** (raw_anime_u_vang2) |
| 55 | ngoisao Star Cannon | Vàng | đạt (khung vàng, anime fantasy) | GROW-UP 3 dạng | **ĐÃ CÓ** dạng 1/2/3 (raw_anime_u_dang_ngoisao, STAGE_ANIME) | nang | 8 | — |
| 56 | soi Werewolf | Vàng | đạt (khung vàng, anime fantasy) | GROW-UP 3 dạng + thức tỉnh | có (đầu riêng theo trạng thái trong skills) | cannon | 8 · HU.soiLan vẽ code (vòng + 3 vết vuốt) | — |
| 57 | tienhoa Evolver | Vàng | đạt (khung vàng, anime fantasy) | GROW-UP 3 dạng | có (đầu riêng theo trạng thái trong skills) | evolver | 9 | — |
| 58 | cauvong Rainbow | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | — |
| 59 | wallgen Wall Projector | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | nang | 5 | — |
| 60 | orbital Orbital | Vàng | lệch vừa: phẳng/hoạt hình đơn sắc, thiếu khung vàng | GROW-UP 3 dạng | **ĐÃ CÓ** dạng 1/2/3 (raw_anime_u_dang_orbital, STAGE_ANIME) | drone | 11 | **ĐÃ LÀM** (hình chính = hàng 1 tấm biến hình) |
| 61 | blackhole Black Hole | Đỏ | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | portal | 4 | — |
| 62 | overlord Overlord | Đỏ | đạt (khung vàng, anime fantasy) | GROW-UP 3 dạng | **ĐÃ CÓ** dạng 1/2/3 (raw_anime_u_dang_overlord, STAGE_ANIME) | nang | 9 | — |
| 63 | lophanung Cryo Reactor | Đỏ | đạt (khung vàng, anime fantasy) | GROW-UP 3 dạng | **ĐÃ CÓ** dạng 1/2/3 (raw_anime_u_dang_lophanung, STAGE_ANIME) | ice | 8 | — |
| 64 | haoquang Holy Halo | Đỏ | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 5 | — |
| 65 | nayda Ricochet | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | cannon | 4 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 66 | combo Combo Core | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | revolver | 4 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 67 | khoathoigian Chrono Lock | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | chrono | 4 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 68 | hydra Hydra | Vàng | đạt (khung vàng, anime fantasy) | GROW-UP 3 dạng | có (đầu riêng theo trạng thái trong skills) | cannon | 10 · thân Hydra vẽ code (gradient + vòng) skills3 veThan | — |
| 69 | cuuvi Nine-Tail | Vàng | đạt (khung vàng, anime fantasy) | GROW-UP 3 dạng | **ĐÃ CÓ** dạng 1/2/3 (raw_anime_u_dang_cuuvi, STAGE_ANIME) | cannon | 9 | — |
| 70 | pandora Pandora Vault | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | portal | 4 | — |
| 71 | luoicheo Resonance Grid | Vàng | đạt (khung vàng, anime fantasy) | GROW-UP 3 dạng | **ĐÃ CÓ** dạng 1/2/3 (raw_anime_u_dang_luoicheo, STAGE_ANIME) | support | 8 | — |
| 72 | ngaithoigian Chrono Throne | Đỏ | đạt (khung vàng, anime fantasy) | GROW-UP 3 dạng | **ĐÃ CÓ** dạng 1/2/3 (raw_anime_u_dang_ngaithoigian, STAGE_ANIME) | chrono | 8 | — |
| 73 | nemesis Nemesis | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | revolver | 5 | — |
| 74 | docton Lone Ace | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | cannon | 5 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 75 | thaukinh Focus Lens | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | beam | 4 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 76 | nhieusong Signal Jammer | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 77 | santhuong Bounty Beacon | Tím | lệch vừa: thân xám + tím, chưa Royal Twilight | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | chain | 4 | **ĐÃ LÀM** (raw_anime_u_tim1–7, santhuong: vang1 hàng 1) |
| 78 | nhatthuc Eclipse | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | beam | 5 | — |
| 79 | loren Twin Anvil | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | evolver | 4 | — |
| 80 | guongcong Mirror Gate | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 4 | — |
| 81 | marionette Marionette | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | drone | 7 | — |
| 82 | chuato Hive Queen | Đỏ | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | drone | 8 | — |
| 83 | leviathan Leviathan | Đỏ | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | nang | 5 | — |
| 84 | khoisinh Genesis Core | Đỏ | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | evolver | 5 | — |
| 85 | ronglua Wyrm Engine | Đỏ | đạt (khung vàng, anime fantasy) | GROW-UP 3 dạng | có f1–f4 | nang | 10 | — |
| 86 | lualien Ember Relay | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | chain | 1 | — |
| 87 | hopca Quantum Choir | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | chain | 1 | — |
| 88 | luutru Fusion Archive | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | evolver | 1 | — |
| 89 | xuonganh Hero Foundry | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | evolver | 1 | — |
| 90 | mauhut Blood Circuit | Vàng | đạt (khung vàng, anime fantasy) | mốc Máu 4 dạng | có f2–f4 | poison | 5 | — |
| 91 | nguyenrua Hex Saboteur | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | poison | 1 | — |
| 92 | thanhdia Sanctum | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | support | 1 | — |
| 93 | bienmau Prism Thief | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | cannon | 2 · vệt vuốt hợp thể: **ĐÃ thay** ảnh fx_laser_tia tô màu | — |
| 94 | cobac Lucky Slot | Đỏ | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | cannon | 0 | — |
| 95 | tudo Wild Link | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | evolver | 0 | — |
| 96 | thacmana Arcane Cascade | Đỏ | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | chain | 0 | — |
| 97 | congap Hatchery Gate | Vàng | đạt (khung vàng, anime fantasy) | 3★/5★/7★ (kỹ năng) | chung 1 hình + sao/quầng tier | evolver | 0 | — |

## Thứ tự làm (bước 2)
1. Trắng 14 → **xong** · Xanh 17 → **xong** (`raw_anime_u_xanh1..6`) · Tím 22 → **xong** (`raw_anime_u_tim1..7` + `vang1` hàng 1) (tấm `thap-art/raw_anime_u_trang1..5.png`, cắt `tools/thap-cat-anime-u.py`).
2. Xanh 17 (6 tấm) → Tím 22 (8 tấm) → Vàng 4 (2 tấm).
3. Biến hình 11 ụ grow-up (xong: cuuvi ngoisao luoicheo overlord lophanung ngaithoigian hopbi orbital dongbo): mỗi ụ 1 hàng (dạng 1/2/3 cùng bệ) → `<id>_nong_s1..s3` + trả id về `STAGE_K`.
4. Hiệu ứng vẽ tay: Sói (vuốt), Hydra (thân), Prism (vệt) → PNG nướng sẵn.
