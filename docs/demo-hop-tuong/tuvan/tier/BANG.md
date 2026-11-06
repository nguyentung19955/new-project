# ĐO SỨC MẠNH THEO BẬC — 85 ụ + 8 ụ vàng mới (06/11/2026)

Công cụ: `node tools/thap-sim-tier.js do` (đo) · `bang truoc.json sau.json` (bảng này) · `bac` (bộ bài cùng bậc) · kiểm hồi quy `tools/thap-kt-tier.js` (trong `thap-kt-hoiquy.js`).
Số đo thô: `do-truoc.json` (code trước đợt này) · `do-sau.json` (sau). Đề xuất làm lại kỹ năng Vàng/Đỏ (chưa làm, chờ duyệt): `DE-XUAT.md`.

**Cách đo** (wave 20, cấp thẻ = LV đầu của bậc, không power-up, 1★/4★/7★): Tấn công = DPS 1 ụ (trung bình nhân đơn mục tiêu × đám đông), ụ Đỏ tự dùng chủ động · Hỗ trợ = 4 × % DPS tăng cho bàn 4 ụ Tấn công Trắng (= "đáng giá N ụ Trắng") · Đặc biệt + ụ hạ gục tức thì (Guillotine, Nemesis — bài thử quái trâu làm phồng ảo) = quy từ wave đạt được khi thêm vào bộ cố định [Gatling, Cannon, Tesla, Revolver] (20 trận, AI của game; hồi quy cố định 1 wave ≈ +25%). Chỉ số ×trung vị Tấn công Trắng.

## Kết quả ngắn

| Bậc | Trung vị 4★ TRƯỚC | bước | Trung vị 4★ SAU | bước | Tấn công trước → sau | Bộ bài cùng bậc (wave, trung vị các bộ) trước → sau |
|---|---|---|---|---|---|---|
| Trắng | 0.95 | — | 0.83 | — | 1.05 → 1.01 | 10.0 → 10.0 |
| Xanh | **0.93** (thấp hơn Trắng ✗) | −2% | 1.10 | +33% | 1.72 → 1.72 | 14.6 → 15.9 |
| Tím | 0.97 | +4% | 1.34 | +22% | 1.78 → 2.16 | **13.2** (thấp hơn Xanh ✗) → 19.4 |
| Vàng | 1.35 | +39% | 1.95 (22 ụ cũ) · 1.78 (cả 8 ụ vàng mới đợt 1/2) | +45% · +33% | 1.83 → 2.83 (22 cũ) · 2.31 (30) | 19.8 → 25.9 |
| Đỏ | 3.89 | +188% | 3.03 | +56% | 4.75 → 4.75 | 37.4 → 36.8 |

Bỏ 6 ụ chỉ có tác dụng ở PVP/CO-OP hoặc phòng thủ (Shield Gen, Reaper Pillar, Jammer, Scrambler, Signal Jammer, Mirror Gate — bài đo SOLO chấm ~0): trung vị SAU = Trắng 0.83 · Xanh 1.10 · Tím 1.43 (+30%) · Vàng 2.04 (+43%) · Đỏ 3.64.
Độ khó: 5 kiểu bộ bài Trắng/Xanh/Tím (`thap-sim-vaitro.js deck 6`) trung bình 16.6 → 17.6 wave (+1), mọi kiểu vẫn trong ±15% → **không đổi máu quái**. Bộ toàn Tím/Vàng mạnh lên rõ — đúng ý "bậc cao phải mạnh hẳn".

## Đã chỉnh (số, đã làm)

- **Hệ số bậc** `TIERS.hs` (data.js): Tím 1.65 → **2.0**, Vàng 2.1 → **2.6** (Trắng 1.0 · Xanh 1.3 · Đỏ 2.7 giữ). Trước đó Tấn công Tím/Vàng chỉ ngang Xanh.
- **Hỗ trợ theo bậc** (hotro.js `HOTRO.BAC`, nhân vào mọi % hỗ trợ): Trắng ×1 · Xanh ×1.5 · Tím ×2.0 · Vàng ×2.3 · Đỏ ×2.8; **trần nhóm nới theo nguồn bậc cao nhất** `HOTRO.CAP_BAC` ×1 / 1.1 / 1.3 / 1.5 / 1.7 (cả trần sát thương có điều kiện). Trước: Hỗ trợ Trắng (Hammer) mạnh hơn mọi hỗ trợ Xanh/Tím/Vàng.
- Trắng: Hammer crit-dmg 0.30 → 0.18, crit 0.05 → 0.04.
- Xanh: Mana Leech dmg 11 → 15 · Drone Bay 8.67 → 13 · Energy Cannon 15.43 → 23 · Mimic 6.67 → 9 · Mana Doubler 32 → 44 mana/★ · Cooldown Horn 3+1.5★ → 4+2★ s · Crit Antenna ×1.5 (6→9% … 20→30%).
- Tím: Mystery Box 47/37 s → 58/46 s và 1–7★ → **1–6★** (7★ hộp: 5–7★) — trước đó Tím mà mạnh hơn trung vị Đỏ · Blizzard dmg 9 → 20 · Chain Link 13.33 → 18 · Lighthouse 9.6 → 12 · Combo Core 15 → 18 · Cloner ghép ra 3★+ → bản sao **2★** · Overclock +65% → **+90%** · Jammer (solo/co-op) +40% → +70% tốc, 6+★ → 8+★ s · Scrambler dmg 6.67 → 11 · Signal Jammer 11 → 18 · Chrono Lock nhịp 9→6 s ⇒ 7.5→4.5 s, nổ +30% · Bounty Beacon +1 mana, quái truy nã nhận +15% (từ +10%) · Cleanser +8% → +9%×bậc (18% ở 1★) · Star Lift 6% → 9%×bậc (18%/★) · Focus Lens 0.14 → 0.22 · Reaper Pillar tỉ lệ 0.08 → 0.12.
- Vàng: Purifier 22.15 → 36 · Werewolf 14.44 → 24 · Star Cannon 12.73 → 21 · Hydra 15 → 19 · Nine-Tail 16 → 20 · Evolver (20+6★) → (14+5★) s · Copycat bản sao −50% → **−30%** · Merge King bản vàng 10% → 20% · Pandora: mưa mana 10 → 25×★, đóng băng 1.5 → 2.5 s, 3 → 5 bom, 3 → 5 khiên, cuồng 6 s +40% → 10 s +60%.
- Đỏ: Holy Halo khiên 2 → 3 s, hồi 40−2★ (≥28) → 30−2★ (≥20) s · Cryo Reactor chậm 15%+2%/★ → 20%+2.5%/★, +sát thương vào quái chậm 0.14 → 0.2.
- Chữ trang ụ / bảng thông tin (text.js, meta.js, roster.json, skilldemo.js, phattrien.js) đã sửa theo số mới. Online: chỉ đổi số dùng chung 2 máy → tất định giữ nguyên.

## Bộ bài cùng bậc (SOLO, AI game, 9 trận/bộ)

| Bậc | Bộ | Trước | Sau |
|---|---|---|---|
| Trắng | canon, xucxac, lien, phagiap, bang | 10.0 | 10.0 |
| Xanh | kiembang, drone, nangluong, chimang, nhanmana | 8.9 | 12.3 |
| Xanh | laser, mortar, min, radar, mimic | 16.6 | 16.1 |
| Xanh | vungdoc, hutmana, kiembang, lanhgia, loa | 14.6 | 15.9 |
| Tím | cuongno, baotuyet, lienket, taylo, nhanban | 11.9 | 21.0 |
| Tím | no5, nayda, bao, thaukinh, khoathoigian | 21.4 | 22.4 |
| Tím | docton, combo, anhsang, nangsao, santhuong | 13.6 | 18.8 |
| Tím | cuongno, lienket, baotuyet, mana, nhanban | 13.2 | 19.4 |
| Vàng | aten, railgun, ngoisao, dongbo, vughep | 18.6 | 25.1 |
| Vàng | hydra, cuuvi, nhatthuc, luoicheo, marionette | 21.0 | 23.9 |
| Vàng | soi, wallgen, nemesis, cauvong, tienhoa | 14.6 | 26.6 |
| Vàng | railgun, hydra, soi, hasao, sinhdoi | 21.4 | 28.1 |
| Đỏ | blackhole, overlord, chuato, lophanung, haoquang | 37.4 | 36.8 |

## Còn lệch (ghi nhận)

- **8 ụ vàng mới đợt 1/2** (session khác vừa lắp, có kiểm riêng `thap-kt-vang-moi*.js`) — đo SAU: Ember Relay 1.95, Fusion Archive 1.79, Quantum Choir 1.72 (Tấn công Vàng mà dưới trung vị Tấn công Tím 2.16), Hex Saboteur 1.24, Blood Circuit 1.21, Hero Foundry 1.02, Sanctum ~0 trong bài DPS (giá trị là tẩy/khiên). Prism Thief 2.25. Không đổi số các ụ này trong đợt này (đang có session riêng cân); chỉ áp hệ số hỗ trợ bậc Vàng cho Sanctum (+10% → +23% ở 1★, như mọi hỗ trợ Vàng). Đề nghị session ụ vàng mới nâng Relay/Archive/Choir ~+25%.

- Ụ chỉ có tác dụng PVP/CO-OP hoặc phòng thủ (Shield Gen, Reaper Pillar, Jammer, Scrambler, Signal Jammer, Mirror Gate) — bài đo SOLO chấm thấp; giữ đơn giản (Tím) / đề xuất làm lại (Mirror Gate, V7).
- Ụ Tấn công Tím có cơ chế phụ thuộc bàn (Chain Link, Lighthouse, Combo Core, Blizzard) thấp ở bài DPS 1 ụ nhưng mạnh trong bộ bài (Lighthouse 19.8 wave bộ cố định).
- Vàng/Đỏ "chỉ là số" hoặc trùng mẹo bậc thấp → `DE-XUAT.md` (12 đề xuất, chờ duyệt): Purifier, Nemesis, Orbital, Evolver, Star Breaker, Sync Cannon, Mirror Gate, Scrap Forge, Black Hole, Overlord, Holy Halo, Cryo Reactor.
- Hỗ trợ Vàng có cờ ⚑ vì so với trung vị Hỗ trợ Đỏ (chỉ 1 ụ: Cryo Reactor, đang yếu → đề xuất Đ4).

## Ảnh trận (390×844)

`tran_solo_vang_do.png` (SOLO bộ Vàng+Overlord) · `tran_coop_tim.png` (CO-OP bộ Tím) · `tran_pvp_xanh_vang.png` (PVP Xanh vs Vàng) · `bang_u_radar.png` (bảng ụ Radar, số mới) — `node tools/thap-chup-tier.js`, không lỗi trang.

## Median power per tier (index ×White Attack, 4★, LV start)

| Tier | n | median 1★ | median 4★ | median 7★ | Attack 4★ | Support 4★ | Special 4★ | deck wave | step vs prev (4★) | AFTER 4★ | AFTER step | AFTER deck wave |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| White | 15 | 0.88 | 0.95 | 0.98 | 1.05 | 1.20 | 0.74 | 12.8 | — | 0.83 | — | 12.8 |
| Blue | 17 | 0.95 | 0.93 | 1.29 | 1.72 | 0.61 | 0.84 | 13.1 | +-2% | 1.10 | +33% | 13.8 |
| Purple | 22 | 1.02 | 0.97 | 1.01 | 1.78 | 0.45 | 0.97 | 13.8 | +4% | 1.34 | +22% | 15.0 |
| Gold | 22 | 1.37 | 1.35 | 1.40 | 1.83 | 0.79 | 1.37 | 14.8 | +39% | 1.78 | +32% | 15.4 |
| Red | 9 | 3.72 | 3.89 | 2.54 | 4.75 | 0.50 | 2.12 | 18.5 | +188% | 3.03 | +71% | 18.2 |

## Every turret (AFTER rebalance), ranked per tier

Index (×White Attack median): Attack = solo DPS (geo-mean single×crowd); Support = 4 × DPS gain on a 4-White board ("worth N White attackers"); Special and instant-kill units (Guillotine, Nemesis) = from deck waves (fixed regression, 1 wave ≈ +25%). Flags (vs the SAME ROLE’s tier medians): ▲ above next tier · ▼ below previous tier · ⚑ above Gold (White/Blue/Purple) or above Red (Gold).

| Tier | Turret | role | 1★ | 4★ | 7★ | deck wave | flag | before 4★ |
|---|---|---|---|---|---|---|---|---|
| White | Cannon (`canon`) | Attack | 1.55 | 1.59 | 1.59 | 15.5 |  | 1.59 |
| White | Hammer (`bua`) | Support | 1.31 | 1.46 | 2.03 | 8.5 | ▲ | 1.71 |
| White | Gatling (`lien`) | Attack | 0.94 | 1.14 | 1.27 | 12.8 |  | 1.14 |
| White | Sniper (`tia`) | Attack | 1.41 | 1.09 | 0.98 | 13.8 |  | 1.09 |
| White | Tesla (`set`) | Attack | 0.65 | 1.05 | 1.06 | 13.8 |  | 1.05 |
| White | Revolver (`sungluc`) | Attack | 1.32 | 1.01 | 1.00 | 14.0 |  | 1.01 |
| White | Scatter (`phun`) | Attack | 0.88 | 0.95 | 0.98 | 12.3 |  | 0.95 |
| White | Dice Gun (`xucxac`) | Attack | 1.20 | 0.83 | 0.64 | 13.5 |  | 0.83 |
| White | Mana Core (`mana`) | Special | 0.81 | 0.81 | 0.81 | 12.8 | ▲ | 0.75 |
| White | Guillotine (`maychem`) | Attack | 0.74 | 0.74 | 0.74 | 12.3 |  | 1.07 |
| White | Venom (`doc`) | Special | 0.70 | 0.70 | 0.70 | 12.1 |  | 0.72 |
| White | Time Bomb (`bomhen`) | Special | 0.70 | 0.70 | 0.70 | 12.1 |  | 0.79 |
| White | Frost (`bang`) | Special | 0.68 | 0.68 | 0.68 | 11.9 |  | 0.68 |
| White | Armor Breaker (`phagiap`) | Support | 0.48 | 0.57 | 0.64 | 11.5 |  | 0.68 |
| White | Iron Fist (`nam`) | Attack | 0.41 | 0.39 | 0.40 | 13.3 |  | 0.39 |
| Blue | Laser (`laser`) | Attack | 2.68 | 2.30 | 1.86 | 14.5 | ▲ | 2.30 |
| Blue | Toxic Pool (`vungdoc`) | Attack | 2.37 | 2.28 | 1.68 | 15.8 | ▲ | 2.28 |
| Blue | Mine Layer (`min`) | Attack | 2.04 | 2.01 | 2.56 | 16.8 |  | 2.01 |
| Blue | Mortar (`mortar`) | Attack | 2.30 | 1.95 | 1.72 | 16.8 |  | 1.95 |
| Blue | Chiller (`lanhgia`) | Support | 2.72 | 1.92 | 2.38 | 11.5 | ▲ ⚑ | 1.60 |
| Blue | Amplifier (`khuech`) | Support | 1.31 | 1.61 | 1.44 | 14.0 | ▲ ⚑ | 1.37 |
| Blue | Ice Blade (`kiembang`) | Attack | 1.94 | 1.50 | 1.39 | 13.8 |  | 1.50 |
| Blue | Mana Leech (`hutmana`) | Attack | 1.47 | 1.26 | 1.08 | 14.5 |  | 0.93 |
| Blue | Drone Bay (`drone`) | Attack | 1.24 | 1.10 | 0.99 | 14.5 |  | 0.73 |
| Blue | Energy Cannon (`nangluong`) | Attack | 1.14 | 0.99 | 0.78 | 15.0 | ▼ | 0.66 |
| Blue | Radar (`radar`) | Support | 0.55 | 0.95 | 1.81 | 11.3 | ▲ ▼ | 0.61 |
| Blue | Mana Doubler (`nhanmana`) | Special | 0.94 | 0.94 | 0.94 | 13.4 |  | 0.79 |
| Blue | Crit Antenna (`chimang`) | Support | 0.27 | 0.85 | 0.95 | 9.5 | ▲ ▼ | 0.58 |
| Blue | Fusion Mixer (`tron`) | Support | 0.82 | 0.85 | 2.41 | 13.0 | ▲ ▼ | 0.51 |
| Blue | Cooldown Horn (`loa`) | Special | 0.80 | 0.80 | 0.80 | 12.7 |  | 0.81 |
| Blue | Mimic (`mimic`) | Special | 0.77 | 0.77 | 0.77 | 12.5 |  | 0.87 |
| Blue | Teleporter (`dichchuyen`) | Special | 0.71 | 0.71 | 0.71 | 12.2 |  | 0.95 |
| Purple | Fifth Shot (`no5`) | Attack | 4.09 | 3.38 | 2.98 | 17.8 | ▲ ⚑ | 2.78 |
| Purple | Ricochet (`nayda`) | Attack | 1.83 | 2.74 | 3.58 | 15.8 | ▲ ⚑ | 2.26 |
| Purple | Lone Ace (`docton`) | Attack | 3.20 | 2.73 | 2.28 | 14.0 | ▲ ⚑ | 2.25 |
| Purple | Storm Gun (`bao`) | Attack | 2.68 | 2.63 | 2.48 | 16.3 | ▲ ⚑ | 2.17 |
| Purple | Mystery Box (`hopbi`) | Special | 2.27 | 2.27 | 2.27 | 17.4 | ▲ ⚑ | 9.20 |
| Purple | Berserker (`cuongno`) | Attack | 2.33 | 2.16 | 1.82 | 15.5 |  | 1.78 |
| Purple | Combo Core (`combo`) | Attack | 1.87 | 1.58 | 1.46 | 17.0 | ▼ | 1.08 |
| Purple | Lighthouse (`anhsang`) | Attack | 1.44 | 1.47 | 1.52 | 21.3 | ▼ | 1.01 |
| Purple | Chain Link (`lienket`) | Attack | 1.68 | 1.43 | 1.27 | 15.8 | ▼ | 0.87 |
| Purple | Jammer (`kepha`) | Special | 1.41 | 1.41 | 1.41 | 15.3 | ▲ ⚑ | 0.90 |
| Purple | Chrono Lock (`khoathoigian`) | Special | 1.36 | 1.36 | 1.36 | 15.1 |  | 1.31 |
| Purple | Bounty Beacon (`santhuong`) | Special | 1.32 | 1.32 | 1.32 | 14.9 |  | 1.05 |
| Purple | Cloner (`nhanban`) | Special | 1.21 | 1.21 | 1.21 | 14.6 |  | 1.01 |
| Purple | Signal Jammer (`nhieusong`) | Special | 1.21 | 1.21 | 1.21 | 14.6 |  | 0.93 |
| Purple | Scrambler (`xaotron`) | Special | 1.18 | 1.18 | 1.18 | 14.4 |  | 0.72 |
| Purple | Cleanser (`taylo`) | Support | 0.51 | 1.04 | 1.70 | 12.0 |  | 0.54 |
| Purple | Blizzard (`baotuyet`) | Attack | 0.76 | 0.94 | 1.78 | 18.8 | ▼ | 0.35 |
| Purple | Overclock (`epxung`) | Special | 0.71 | 0.71 | 0.71 | 12.2 | ▼ | 0.76 |
| Purple | Star Lift (`nangsao`) | Support | 0.44 | 0.70 | 0.76 | 9.3 | ▼ | 0.49 |
| Purple | Focus Lens (`thaukinh`) | Support | 0.50 | 0.69 | 3.08 | 9.0 | ▼ | 0.45 |
| Purple | Shield Gen (`khien`) | Support | 0.02 | 0.02 | 0.02 | 12.5 | ▼ | 0.06 |
| Purple | Reaper Pillar (`tuthan`) | Support | 0.02 | 0.02 | 0.02 | 11.5 | ▼ | 0.02 |
| Gold | Wall Projector (`wallgen`) | Attack | 6.10 | 4.46 | 5.39 | 18.8 |  | 3.60 |
| Gold | Railgun (`railgun`) | Attack | 5.03 | 4.15 | 3.84 | 21.3 |  | 3.35 |
| Gold | Eclipse (`nhatthuc`) | Attack | 3.84 | 3.76 | 3.91 | 16.8 |  | 3.04 |
| Gold | Marionette (`marionette`) | Special | 3.05 | 3.05 | 3.05 | 18.8 | ▲ ⚑ | 2.17 |
| Gold | Hydra (`hydra`) | Attack | 1.70 | 2.90 | 6.09 | 15.3 |  | 1.85 |
| Gold | Nine-Tail (`cuuvi`) | Attack | 3.11 | 2.83 | 1.39 | 18.0 |  | 1.83 |
| Gold | Star Cannon (`ngoisao`) | Attack | 3.16 | 2.82 | 2.45 | 17.5 |  | 1.38 |
| Gold | Werewolf (`soi`) | Attack | 2.42 | 2.31 | 2.91 | 20.5 |  | 1.12 |
| Gold | Prism Thief (`bienmau`) | Attack | 2.59 | 2.25 | 1.58 | 15.5 |  | — |
| Gold | Purifier (`aten`) | Attack | 3.02 | 2.22 | 1.06 | 17.5 |  | 1.10 |
| Gold | Nemesis (`nemesis`) | Attack | 2.19 | 2.19 | 2.19 | 17.3 |  | 1.61 |
| Gold | Sync Cannon (`dongbo`) | Support | 1.31 | 2.07 | 2.78 | 13.0 | ▲ ⚑ | 0.84 |
| Gold | Ember Relay (`lualien`) | Attack | 2.32 | 1.95 | 1.80 | 14.8 | ▼ | — |
| Gold | Resonance Grid (`luoicheo`) | Support | 1.24 | 1.85 | 4.28 | 12.8 | ▲ ⚑ | 0.79 |
| Gold | Fusion Archive (`luutru`) | Attack | 2.00 | 1.79 | 1.51 | 15.0 | ▼ | — |
| Gold | Orbital (`orbital`) | Special | 1.76 | 1.76 | 1.76 | 16.3 |  | 1.66 |
| Gold | Quantum Choir (`hopca`) | Attack | 2.05 | 1.72 | 1.68 | 16.0 | ▼ | — |
| Gold | Rainbow (`cauvong`) | Support | 0.92 | 1.71 | 1.86 | 15.8 | ▲ ⚑ | 0.83 |
| Gold | Twin Maker (`sinhdoi`) | Special | 1.59 | 1.59 | 1.59 | 15.8 |  | 1.43 |
| Gold | Evolver (`tienhoa`) | Special | 1.59 | 1.59 | 1.59 | 15.8 |  | 1.70 |
| Gold | Star Breaker (`hasao`) | Support | 0.94 | 1.50 | 2.15 | 12.5 | ▲ ⚑ | 0.55 |
| Gold | Merge King (`vughep`) | Special | 1.41 | 1.41 | 1.41 | 15.3 |  | 1.26 |
| Gold | Copycat (`saochep`) | Special | 1.40 | 1.40 | 1.40 | 15.2 |  | 1.32 |
| Gold | Hex Saboteur (`nguyenrua`) | Special | 1.24 | 1.24 | 1.24 | 14.7 | ▼ | — |
| Gold | Blood Circuit (`mauhut`) | Special | 1.21 | 1.21 | 1.21 | 14.6 | ▼ | — |
| Gold | Pandora Vault (`pandora`) | Special | 1.20 | 1.20 | 1.20 | 14.5 | ▼ | 0.94 |
| Gold | Hero Foundry (`xuonganh`) | Special | 1.02 | 1.02 | 1.02 | 13.8 | ▼ | — |
| Gold | Scrap Forge (`loren`) | Special | 0.40 | 0.40 | 0.40 | 9.6 | ▼ | 0.34 |
| Gold | Mirror Gate (`guongcong`) | Support | 0.02 | 0.15 | 0.02 | 13.3 | ▼ | 0.13 |
| Gold | Sanctum (`thanhdia`) | Support | 0.07 | 0.02 | 2.22 | 12.3 | ▼ | — |
| Red | Overlord (`overlord`) | Attack | 12.25 | 13.16 | 16.09 | 17.3 |  | 13.16 |
| Red | Black Hole (`blackhole`) | Attack | 5.65 | 6.03 | 7.19 | 21.8 |  | 6.03 |
| Red | Leviathan (`leviathan`) | Attack | 5.92 | 4.75 | 2.44 | 23.3 |  | 4.75 |
| Red | Hive Queen (`chuato`) | Attack | 3.72 | 4.54 | 3.93 | 19.8 |  | 4.54 |
| Red | Wyrm Engine (`ronglua`) | Attack | 2.50 | 3.03 | 2.54 | 21.3 |  | 3.03 |
| Red | Chrono Throne (`ngaithoigian`) | Special | 2.70 | 2.70 | 2.70 | 18.2 |  | 3.89 |
| Red | Genesis Core (`khoisinh`) | Special | 2.29 | 2.29 | 2.29 | 17.4 |  | 2.12 |
| Red | Cryo Reactor (`lophanung`) | Support | 0.20 | 0.64 | 1.31 | 15.8 | ▼ | 0.50 |
| Red | Holy Halo (`haoquang`) | Special | 0.63 | 0.63 | 0.63 | 11.6 | ▼ | 0.72 |


## TRƯỚC — từng ụ (code cũ)


Index (×White Attack median): Attack = solo DPS (geo-mean single×crowd); Support = 4 × DPS gain on a 4-White board ("worth N White attackers"); Special and instant-kill units (Guillotine, Nemesis) = from deck waves (fixed regression, 1 wave ≈ +25%). Flags (vs the SAME ROLE’s tier medians): ▲ above next tier · ▼ below previous tier · ⚑ above Gold (White/Blue/Purple) or above Red (Gold).

| Tier | Turret | role | 1★ | 4★ | 7★ | deck wave | flag |
|---|---|---|---|---|---|---|---|
| White | Hammer (`bua`) | Support | 1.45 | 1.71 | 2.10 | 9.8 | ▲ ⚑ |
| White | Cannon (`canon`) | Attack | 1.55 | 1.59 | 1.59 | 15.8 |  |
| White | Gatling (`lien`) | Attack | 0.94 | 1.14 | 1.27 | 12.8 |  |
| White | Sniper (`tia`) | Attack | 1.41 | 1.09 | 0.98 | 17.5 |  |
| White | Guillotine (`maychem`) | Attack | 1.07 | 1.07 | 1.07 | 14.0 |  |
| White | Tesla (`set`) | Attack | 0.65 | 1.05 | 1.06 | 13.0 |  |
| White | Revolver (`sungluc`) | Attack | 1.32 | 1.01 | 1.00 | 14.8 |  |
| White | Scatter (`phun`) | Attack | 0.88 | 0.95 | 0.98 | 12.3 |  |
| White | Dice Gun (`xucxac`) | Attack | 1.20 | 0.83 | 0.64 | 12.8 |  |
| White | Time Bomb (`bomhen`) | Special | 0.79 | 0.79 | 0.79 | 12.6 |  |
| White | Mana Core (`mana`) | Special | 0.75 | 0.75 | 0.75 | 12.4 |  |
| White | Venom (`doc`) | Special | 0.72 | 0.72 | 0.72 | 12.2 |  |
| White | Armor Breaker (`phagiap`) | Support | 0.50 | 0.68 | 0.68 | 13.3 | ▲ |
| White | Frost (`bang`) | Special | 0.68 | 0.68 | 0.68 | 11.9 |  |
| White | Iron Fist (`nam`) | Attack | 0.41 | 0.39 | 0.40 | 12.5 |  |
| Blue | Laser (`laser`) | Attack | 2.68 | 2.30 | 1.86 | 14.5 | ▲ ⚑ |
| Blue | Toxic Pool (`vungdoc`) | Attack | 2.37 | 2.28 | 1.68 | 19.0 | ▲ ⚑ |
| Blue | Mine Layer (`min`) | Attack | 2.04 | 2.01 | 2.56 | 16.3 | ▲ ⚑ |
| Blue | Mortar (`mortar`) | Attack | 2.30 | 1.95 | 1.72 | 17.0 | ▲ ⚑ |
| Blue | Chiller (`lanhgia`) | Support | 1.52 | 1.60 | 1.89 | 10.8 | ▲ ⚑ |
| Blue | Ice Blade (`kiembang`) | Attack | 1.94 | 1.50 | 1.39 | 16.8 |  |
| Blue | Amplifier (`khuech`) | Support | 1.00 | 1.37 | 1.36 | 11.0 | ▲ ⚑ |
| Blue | Teleporter (`dichchuyen`) | Special | 0.95 | 0.95 | 0.95 | 13.4 |  |
| Blue | Mana Leech (`hutmana`) | Attack | 1.08 | 0.93 | 0.79 | 12.5 | ▼ |
| Blue | Mimic (`mimic`) | Special | 0.87 | 0.87 | 0.87 | 13.1 |  |
| Blue | Cooldown Horn (`loa`) | Special | 0.81 | 0.81 | 0.81 | 12.8 |  |
| Blue | Mana Doubler (`nhanmana`) | Special | 0.79 | 0.79 | 0.79 | 12.6 |  |
| Blue | Drone Bay (`drone`) | Attack | 0.83 | 0.73 | 0.66 | 14.3 | ▼ |
| Blue | Energy Cannon (`nangluong`) | Attack | 0.76 | 0.66 | 0.52 | 14.0 | ▼ |
| Blue | Radar (`radar`) | Support | 0.61 | 0.61 | 1.29 | 11.0 | ▲ ▼ |
| Blue | Crit Antenna (`chimang`) | Support | 0.24 | 0.58 | 0.84 | 11.3 | ▲ ▼ |
| Blue | Fusion Mixer (`tron`) | Support | 0.39 | 0.51 | 1.55 | 9.8 | ▲ ▼ |
| Purple | Mystery Box (`hopbi`) | Special | 9.20 | 9.20 | 9.20 | 23.8 | ▲ ⚑ |
| Purple | Fifth Shot (`no5`) | Attack | 3.37 | 2.78 | 2.46 | 15.5 | ▲ ⚑ |
| Purple | Ricochet (`nayda`) | Attack | 1.51 | 2.26 | 2.95 | 13.3 | ▲ ⚑ |
| Purple | Lone Ace (`docton`) | Attack | 2.64 | 2.25 | 1.89 | 16.0 | ▲ ⚑ |
| Purple | Storm Gun (`bao`) | Attack | 2.21 | 2.17 | 2.05 | 15.0 | ▲ ⚑ |
| Purple | Berserker (`cuongno`) | Attack | 1.92 | 1.78 | 1.50 | 14.8 |  |
| Purple | Chrono Lock (`khoathoigian`) | Special | 1.31 | 1.31 | 1.31 | 14.9 |  |
| Purple | Combo Core (`combo`) | Attack | 1.29 | 1.08 | 1.00 | 15.0 | ▼ |
| Purple | Bounty Beacon (`santhuong`) | Special | 1.05 | 1.05 | 1.05 | 13.9 |  |
| Purple | Cloner (`nhanban`) | Special | 1.01 | 1.01 | 1.01 | 13.8 |  |
| Purple | Lighthouse (`anhsang`) | Attack | 1.07 | 1.01 | 1.02 | 15.0 | ▼ |
| Purple | Signal Jammer (`nhieusong`) | Special | 0.93 | 0.93 | 0.93 | 13.3 |  |
| Purple | Jammer (`kepha`) | Special | 0.90 | 0.90 | 0.90 | 13.2 |  |
| Purple | Chain Link (`lienket`) | Attack | 1.03 | 0.87 | 0.77 | 14.5 | ▼ |
| Purple | Overclock (`epxung`) | Special | 0.76 | 0.76 | 0.76 | 12.4 | ▼ |
| Purple | Scrambler (`xaotron`) | Special | 0.72 | 0.72 | 0.72 | 12.2 | ▼ |
| Purple | Cleanser (`taylo`) | Support | 0.59 | 0.54 | 0.77 | 8.5 | ▼ |
| Purple | Star Lift (`nangsao`) | Support | 0.18 | 0.49 | 0.66 | 9.8 | ▼ |
| Purple | Focus Lens (`thaukinh`) | Support | 0.55 | 0.45 | 1.91 | 11.3 | ▼ |
| Purple | Blizzard (`baotuyet`) | Attack | 0.28 | 0.35 | 0.66 | 18.3 | ▼ |
| Purple | Shield Gen (`khien`) | Support | 0.24 | 0.06 | 0.02 | 9.5 | ▼ |
| Purple | Reaper Pillar (`tuthan`) | Support | 0.02 | 0.02 | 0.02 | 10.3 | ▼ |
| Gold | Wall Projector (`wallgen`) | Attack | 4.93 | 3.60 | 4.36 | 17.3 |  |
| Gold | Railgun (`railgun`) | Attack | 4.07 | 3.35 | 3.10 | 18.3 |  |
| Gold | Eclipse (`nhatthuc`) | Attack | 3.10 | 3.04 | 3.16 | 17.3 |  |
| Gold | Marionette (`marionette`) | Special | 2.17 | 2.17 | 2.17 | 17.2 | ▲ ⚑ |
| Gold | Hydra (`hydra`) | Attack | 1.08 | 1.85 | 3.88 | 14.5 |  |
| Gold | Nine-Tail (`cuuvi`) | Attack | 2.01 | 1.83 | 0.90 | 17.3 |  |
| Gold | Evolver (`tienhoa`) | Special | 1.70 | 1.70 | 1.70 | 16.1 |  |
| Gold | Orbital (`orbital`) | Special | 1.66 | 1.66 | 1.66 | 16.0 |  |
| Gold | Nemesis (`nemesis`) | Attack | 1.61 | 1.61 | 1.61 | 15.8 | ▼ |
| Gold | Twin Maker (`sinhdoi`) | Special | 1.43 | 1.43 | 1.43 | 15.3 |  |
| Gold | Star Cannon (`ngoisao`) | Attack | 1.55 | 1.38 | 1.20 | 13.5 | ▼ |
| Gold | Copycat (`saochep`) | Special | 1.32 | 1.32 | 1.32 | 14.9 |  |
| Gold | Merge King (`vughep`) | Special | 1.26 | 1.26 | 1.26 | 14.8 |  |
| Gold | Werewolf (`soi`) | Attack | 1.18 | 1.12 | 1.41 | 11.5 | ▼ |
| Gold | Purifier (`aten`) | Attack | 1.50 | 1.10 | 0.52 | 17.8 | ▼ |
| Gold | Pandora Vault (`pandora`) | Special | 0.94 | 0.94 | 0.94 | 13.4 | ▼ |
| Gold | Sync Cannon (`dongbo`) | Support | 0.51 | 0.84 | 1.38 | 12.8 | ▲ ⚑ |
| Gold | Rainbow (`cauvong`) | Support | 0.38 | 0.83 | 1.21 | 14.0 | ▲ ⚑ |
| Gold | Resonance Grid (`luoicheo`) | Support | 0.52 | 0.79 | 1.77 | 10.3 | ▲ ⚑ |
| Gold | Star Breaker (`hasao`) | Support | 0.47 | 0.55 | 0.95 | 10.5 | ▲ ⚑ |
| Gold | Scrap Forge (`loren`) | Special | 0.34 | 0.34 | 0.34 | 8.8 | ▼ |
| Gold | Mirror Gate (`guongcong`) | Support | 0.02 | 0.13 | 0.02 | 11.0 | ▼ |
| Red | Overlord (`overlord`) | Attack | 12.25 | 13.16 | 16.09 | 22.0 |  |
| Red | Black Hole (`blackhole`) | Attack | 5.65 | 6.03 | 7.19 | 24.5 |  |
| Red | Leviathan (`leviathan`) | Attack | 5.92 | 4.75 | 2.44 | 20.8 |  |
| Red | Hive Queen (`chuato`) | Attack | 3.72 | 4.54 | 3.93 | 17.3 |  |
| Red | Chrono Throne (`ngaithoigian`) | Special | 3.89 | 3.89 | 3.89 | 19.9 |  |
| Red | Wyrm Engine (`ronglua`) | Attack | 2.50 | 3.03 | 2.54 | 18.5 |  |
| Red | Genesis Core (`khoisinh`) | Special | 2.12 | 2.12 | 2.12 | 17.1 |  |
| Red | Holy Halo (`haoquang`) | Special | 0.72 | 0.72 | 0.72 | 12.2 | ▼ |
| Red | Cryo Reactor (`lophanung`) | Support | 0.28 | 0.50 | 0.86 | 13.8 | ▼ |
