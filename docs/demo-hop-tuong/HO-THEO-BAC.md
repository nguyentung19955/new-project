# TURRET MERGE — HỌ KỸ NĂNG THEO BẬC (05/11)

Ý người dùng: cùng chức năng thì bậc cao **tối ưu & ấn tượng hơn hẳn** (băng trắng chỉ làm chậm → băng xanh lan làm chậm → … → băng đỏ nổ).
Nguồn trong code: `thap/js/phattrien.js` → `HO` (16 họ, mỗi họ `bac[0..4]` = Trắng/Xanh/Tím/Vàng/Đỏ, `gap` = gợi ý ụ mới từ `TUONG-MOI-20.md`), `HO_MOI` (cơ chế mới mỗi ụ thêm vào họ).
Nấc thang chuẩn: **Trắng** cơ bản 1 mục tiêu · **Xanh** LAN rộng · **Tím** thêm cơ chế mới · **Vàng** combo/điều kiện · **Đỏ** kết WOW (+ kỹ năng chủ động).

| Họ | Trắng | Xanh | Tím | Vàng | Đỏ |
|---|---|---|---|---|---|
| FROST | Frost | Ice Blade, Chiller | Blizzard | — *(Eclipse)* | Cryo Reactor |
| POISON | Venom | Toxic Pool | — | Purifier | — |
| EXPLOSIVE | Cannon, Dice Gun | Mortar | Fifth Shot | Orbital | — *(Wyrm Engine)* |
| ENERGY | Tesla | Laser | Storm Gun | Railgun | Overlord |
| HEAVY SHOT | Revolver, Sniper | Energy Cannon | — *(Lone Ace)* | — *(Nemesis)* | — *(Leviathan)* |
| RAPID FIRE | Gatling, Scatter | Radar | Overclock | — *(Hydra)* | — |
| CRIT | Hammer, Iron Fist | Crit Antenna | Berserker | Werewolf | — |
| DAMAGE AMP | Armor Breaker | Amplifier | Chain Link | Sync Cannon, Rainbow | — |
| PATH TRAPS | Time Bomb | Mine Layer | — *(Chrono Lock)* | Wall Projector | Black Hole |
| EXECUTE | Guillotine | — | Reaper Pillar | — *(Nemesis)* | — |
| MANA | Mana Core | Mana Leech, Mana Doubler | — *(Bounty Beacon)* | — | — |
| MERGE BONUS | — | Drone Bay, Cooldown Horn | Cloner, Lighthouse | Twin Maker | — *(Hive Queen)* |
| STAR | — | — | Star Lift | Merge King, Star Breaker, Star Cannon | — *(Genesis Core)* |
| JOKER | — | Mimic, Fusion Mixer, Teleporter | Scrambler | Copycat | — |
| GUARD | — | — | Shield Gen, Cleanser, Jammer | — *(Mirror Gate)* | Holy Halo |
| TRANSFORM | — | — | Mystery Box | Evolver | — |

## Thay đổi cơ chế phiên này (để bậc cao hơn hẳn, không chỉ số to hơn)
- **Ice Blade (Xanh, Frost)**: mỗi nhát chém **lan lạnh** 20%·2 s sang quái trong 44 px (trừ mục tiêu) → lượt sau chém chúng ×5. Sát thương gốc 18.67 → 16.8 để bù.
- **Blizzard (Tím, Frost)**: ngoài chậm toàn bộ, nay **đóng băng ngắn 0.35 s** quái nhỏ mỗi nhịp (7★ WHITEOUT vẫn 1 s).
- **Cryo Reactor (Đỏ, Frost)**: quái **đang đóng băng mà chết → vỡ vụn & nổ** (50 px, ×3); sau BÃO BĂNG, quái còn sống khi tan băng cũng **vỡ nổ** (×4) lần lượt.
- **Storm Gun (Tím, Energy)**: 20% đòn **nảy sét** sang quái gần nhất (×0.7).
- **Overlord (Đỏ, Energy)**: cú sấm có **dư chấn** — sét nhảy tới 4 quái gần nhất (mỗi con ×2 sát thương gốc).
- **Reaper Pillar (Tím, Execute)**: quái bị gặt **nổ linh hồn** 12% máu tối đa vào quái quanh 44 px (Guillotine Trắng chỉ chém 1 con).
- Giữ nguyên bản sắc DCDW các thẻ còn lại (đã khớp DCDW-WIKI); nấc thang của chúng đã đúng mẫu (vd Explosive: nổ lan → đạn chùm → mỗi phát 5 nổ 3 mũi → ghép gọi pháo kích).

## Giao diện
- Bảng thông tin: `Family: FROST ★ Tier 1/5 → next: Ice Blade / Chiller (…)` + thang 5 ô màu bậc (ô đang xem tô đặc, ô trống nét đứt).
- Màn chọn bộ bài: nút SORT xoay vòng **TIER → FAMILY → NAME**; FAMILY nhóm theo họ, trong họ xếp Trắng → Đỏ, tiêu đề có 5 ô vuông màu bậc.
- Hiệu ứng leo thang theo bậc: `thap/js/tiervfx.js` (xem `TIER-HINH-DANG.md` §5, ảnh `tuvan/tier_vfx_energy.png`).
