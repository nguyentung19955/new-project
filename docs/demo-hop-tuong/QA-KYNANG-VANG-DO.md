# QA KỸ NĂNG — ụ VÀNG (Huyền thoại) + ĐỎ (Cổ đại) + GROW-UP / AWAKEN + 3 chỉ huy

Phạm vi: 31 ụ Vàng/Đỏ trong `thap/assets/roster.json`, 15 ụ grow-up (`growfx.js` G_IDS), kỹ năng chủ động Đỏ (3★+), 3 chỉ huy (Reinforce, Rage, Holy Shield).
Star Cannon: chỉ kiểm số kỹ năng (bộ đếm dưới thẻ do phiên khác sửa).

Kiểm bằng: `node tools/thap-kt-kynang-vd.js` (mô phỏng không giao diện = `thap-sim-vaitro.js` + `growfx.js`, đúng như trình duyệt; chí mạng tắt khi đo số, quái đứng yên).
Bảng dưới: `node tools/thap-kt-kynang-vd.js md`. Kết quả: **223 kiểm thử, 0 lỗi**.

## Đã sai gì — đã sửa gì

| # | Ụ | Sai | Sửa |
|---|---|---|---|
| 1 | Overlord | Dư chấn sét gây ×1.5 (chữ hứa ×2) và đánh lại cả quái đã dính nổ | Code: dư chấn ×2, chỉ nhảy sang tối đa 4 quái NGOÀI vùng nổ |
| 2 | Pandora Vault | Mốc 3★ "+20% tốc bắn" không bao giờ áp (bản riêng che mốc chung) | Code: bỏ bản riêng → mốc chung +20% áp thật |
| 3 | Resonance Grid | Mốc 5★ ghi "+15% tốc bắn" (thật +5%×K ≈ 10%), mốc 7★ biến mất | Chữ: dùng lại mốc trong phattrien.js (5★ ×1.9 + tốc chéo, 7★ đủ 4 ô tốc ×1.5); chữ "×1.5 tốc" chỉ hiện khi đủ 4 ô |
| 4 | Scrap Forge | Dạng 3 cần 40 cộng dồn nhưng trần là 15 → không bao giờ tới; mốc sao "+20% speed / +25% / +30%" không làm gì (Forge không bắn) | Code+chữ: dạng 0–4 / 5–14 / 15; mốc sao ghi đúng số cộng dồn mỗi lần ăn (+2/+3/+4) |
| 5 | Orbital | Mốc sao chung chỉ là chữ; giáo trời bị làm tròn theo khung hình (60 thay vì 62 / 20 s); bảng "đòn theo dạng" + điều kiện grow tả đạn/tốc bắn không có (ụ Đặc biệt không bắn) | Code: 3★ +20% nhịp giáo, 5★ +25%, 7★ +30%; hẹn giờ cộng dồn; RAGE ×2 áp lên giáo. Chữ: tả đúng STANDBY / UPLINK / BOMBARDMENT |
| 6 | Sync Cannon | Bảng "đòn theo dạng" tả đạn vàng / tia — ụ Hỗ trợ không bắn | Chữ: tả buff theo số ụ kề cùng sao |
| 7 | Leviathan | TIDAL BREATH nhịp 0.25 s hở khe (~9 px) và tắt trước ~80 px cuối đường → có quái không bị trúng | Code: quét hết đường trong 1.4 s, nhịp 0.1 s, mỗi quái trúng đúng 1 lần ×(4+0.1×cộng dồn) |
| 8 | Hive Queen | Drone 1.08×/s thay vì 1.2×/s (hẹn giờ làm tròn theo khung hình) | Code: hẹn giờ cộng dồn; không có quái trong 150 px thì chờ sẵn |
| 9 | Wyrm Engine | Phun 4.4 nhịp/s thay vì 5 (cùng lỗi hẹn giờ) | Code: hẹn giờ cộng dồn → đúng 5 nhịp/s |
| 10 | Leviathan / Genesis / Wyrm | Nuốt quái to, +15% ụ kề, lửa xanh bắt đầu từ 4★ nhưng ghi dưới mốc 5★ | Chữ: thêm "(starts at 4★)" |
| 11 | Wall / Black Hole / Overlord | Ô thông tin ghi số giây gốc (7.8 / 8.5 / 6.0 s ở 3★) trong khi bắn sớm hơn 20% (mốc 3★) | Chữ: số giây đã tính mốc 3★ (6.5 / 7.1 / 5.0 s) |
| 12 | Pandora Vault | Bom hộp bỏ qua RAGE ×2 | Code: RAGE ×2 áp lên bom |
| 13 | Star Cannon / Mirror Gate | "Star total in 10s" khó hiểu; Mirror Gate thiếu phần Solo | Chữ: "a multiple of 10"; thêm "Solo blocks a boss skill" |
| 14 | REINFORCE | Chữ chỉ nói "gọi 2 ụ 1★" | Chữ: thêm "hết chỗ → +1★ cho ụ yếu nhất" |
| 15 | roster.json / meta.js | Chữ VI của 7 ụ đổi vai (Sync Cannon, Star Breaker, Rainbow, Cryo, Mirror Gate, Scrap Forge, Orbital…) còn tả kỹ năng cũ (vd Star Breaker "−1★ ụ đối thủ") | Chữ EN = TEXT trong game; VI viết lại theo vai mới |

Không sửa (đúng thiết kế, ghi lại): Genesis +15%, Hive Queen +10% tốc, Werewolf 7★ +25% tốc, Scrap Forge +60% là đặc quyền ụ Tấn công/Đặc biệt — cộng NGOÀI trần hỗ trợ 35%/45%.
Cryo Reactor và Holy Halo dùng kỹ năng chủ động từ 1★ (là ụ Hỗ trợ/Đặc biệt có chủ động); 5 ụ Đỏ còn lại mở ở 3★.

## Kiểm tra cuối

- `node tools/thap-kt-kynang-vd.js` → 223 / 223 OK.
- `node tools/thap-sim-vaitro.js deck 8 solo` / `coop` → 5 kiểu deck đều trong ±15% (SOLO −11%…+7%, CO-OP −5%…+10%); `dem` 40/27/18 ✔; `che` không lỗi; `tools/test-chihuy.js` 12/12.
- DPS 1★ (thap-sim-vaitro dps): Mythic trung bình 3.51 → 3.31 × Common (vào ngân sách 2.3–3.3); Overlord 5.78 → 4.95, Wyrm 1.08 → 1.26 (gần ngân sách hơn).
- Trình duyệt (python3 -m http.server + Playwright): 12 trận nhanh SOLO/CO-OP/PVP với cả 31 ụ, bật mọi kỹ năng chủ động → không lỗi trang.
  (Ghi chú: `tools/thap-kt-growfx-ban.js` báo 1 lỗi `drawImage` canvas 0 px — có từ trước, cả khi bỏ thay đổi của phiên này; phần vẽ, không thuộc phạm vi logic.)

## Bảng chi tiết

| Turret | Claim (skill text) | Measured | Status | Note |
|---|---|---|---|---|
| (all) | 31 Legendary + Mythic turrets in roster | 31 | OK |  |
| Purifier | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Sync Cannon | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Railgun | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Merge King | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Twin Maker | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Star Breaker | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Copycat | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Star Cannon | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Werewolf | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Evolver | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Rainbow | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Wall Projector | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Orbital | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Black Hole | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Overlord | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Cryo Reactor | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Holy Halo | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Hydra | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Nine-Tail | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Pandora Vault | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Resonance Grid | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Chrono Throne | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Nemesis | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Eclipse | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Scrap Forge | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Mirror Gate | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Marionette | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Hive Queen | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Leviathan | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Genesis Core | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Wyrm Engine | spawns at 1/3/5/7★, info text builds, no error | ok | OK |  |
| Purifier | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 46.52 / 125.59 / 204.67 / 283.74 (ban) | OK |  |
| Railgun | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 147 / 396.9 / 808.5 / 1457.14 (tu) | OK |  |
| Merge King | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 35.01 / 94.52 / 154.03 / 277.61 (ban) | OK |  |
| Twin Maker | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 16.51 / 44.57 / 72.63 / 130.89 (ban) | OK |  |
| Copycat | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 27.99 / 75.58 / 123.17 / 221.98 (ban) | OK |  |
| Star Cannon | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 26.73 / 72.18 / 117.63 / 211.99 (ban) | OK |  |
| Werewolf | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 30.32 / 81.87 / 133.43 / 184.98 (ban) | OK |  |
| Wall Projector | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 54.6 / 147.42 / 300.3 / 541.22 (tu) | OK |  |
| Black Hole | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 48.6 / 131.22 / 267.3 / 481.75 (tu) | OK |  |
| Overlord | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 75.6 / 204.12 / 415.8 / 749.39 (tu) | OK |  |
| Hydra | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 31.5 / 85.05 / 138.6 / 192.15 (ban) | OK |  |
| Nine-Tail | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 33.6 / 90.72 / 147.84 / 204.96 (ban) | OK |  |
| Pandora Vault | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 21 / 56.7 / 92.4 / 128.1 (ban) | OK |  |
| Chrono Throne | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 43.2 / 116.64 / 190.08 / 263.52 (ban) | OK |  |
| Nemesis | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 54.6 / 147.42 / 240.24 / 333.06 (ban) | OK |  |
| Eclipse | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 31.5 / 85.05 / 138.6 / 192.15 (ban) | OK |  |
| Marionette | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 18.9 / 51.03 / 83.16 / 115.29 (ban) | OK |  |
| Hive Queen | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 43.2 / 116.64 / 190.08 / 263.52 (ban) | OK |  |
| Leviathan | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 64.8 / 174.96 / 285.12 / 395.28 (ban) | OK |  |
| Wyrm Engine | damage = base × rarity × (1+0.85×(★−1)) × star milestone (applied once) | 27 / 72.9 / 118.8 / 164.7 (tu) | OK |  |
| Purifier | DPS rises with stars 1→3→5→7★ (3 enemies) | 30 → 82 → 133 → 184 | OK |  |
| Railgun | DPS rises with stars 1→3→5→7★ (3 enemies) | 103 → 318 → 647 → 1166 | OK |  |
| Star Cannon | DPS rises with stars 1→3→5→7★ (3 enemies) | 29 → 94 → 200 → 350 | OK |  |
| Werewolf | DPS rises with stars 1→3→5→7★ (3 enemies) | 432 → 1167 → 1902 → 2637 | OK |  |
| Wall Projector | DPS rises with stars 1→3→5→7★ (3 enemies) | 38 → 206 → 420 → 758 | OK |  |
| Black Hole | DPS rises with stars 1→3→5→7★ (3 enemies) | 98 → 364 → 1083 → 1951 | OK |  |
| Overlord | DPS rises with stars 1→3→5→7★ (3 enemies) | 240 → 937 → 2470 → 5463 | OK |  |
| Hydra | DPS rises with stars 1→3→5→7★ (3 enemies) | 21 → 203 → 423 → 1614 | OK |  |
| Nine-Tail | DPS rises with stars 1→3→5→7★ (3 enemies) | 40 → 132 → 214 → 505 | OK |  |
| Nemesis | DPS rises with stars 1→3→5→7★ (3 enemies) | 1713 → 3444 → 7256 → 10850 | OK |  |
| Eclipse | DPS rises with stars 1→3→5→7★ (3 enemies) | 47 → 166 → 351 → 880 | OK |  |
| Hive Queen | DPS rises with stars 1→3→5→7★ (3 enemies) | 135 → 453 → 886 → 1805 | OK |  |
| Leviathan | DPS rises with stars 1→3→5→7★ (3 enemies) | 117 → 310 → 458 → 522 | OK |  |
| Wyrm Engine | DPS rises with stars 1→3→5→7★ (3 enemies) | 303 → 810 → 1980 → 2745 | OK |  |
| Purifier | normal hit ×1 | 1 | OK |  |
| Purifier | +300% (×4) vs poisoned | 4 | OK |  |
| Purifier | 7★ PURGE ×6 vs poisoned | 6 | OK |  |
| Purifier | 3★ kill explosion ×2 dmg, radius 70 px | near 2 @60px, far 2 @77px | OK |  |
| Purifier | 5★ TOXIC BLAST: explosion poisons | poison 3s | OK |  |
| Railgun | full row (5) +damage, full column (3) +fire rate | dmg +148% / rate +124% | OK |  |
| Railgun | rail pierces every enemy in line (3 stacked) | 3× per shot | OK |  |
| Merge King | drag onto same-star turret: target +1★, keeps type | canon 4 false | OK |  |
| Merge King | Gold version +2★ | 5★ | OK |  |
| Merge King | Gold version chance 10% | 10% | OK |  |
| Copycat | copies a same-star turret at −50% damage (original stays) | aten 4 true dmg ×0.5 | OK |  |
| Twin Maker | merge two 3★ → 4★ result + an extra 3★ (same star as merged) | 2 · 3,4 | OK |  |
| Twin Maker | Mimic + Twin Maker merge also summons the twin | 2 turrets | OK |  |
| Sync Cannon | 1★: 3 same-star Attack neighbours +13% each, off-star one 0 | 13/13/13/0% | OK |  |
| Sync Cannon | 3★: 3 same-star Attack neighbours +18% each, off-star one 0 | 18/18/18/0% | OK |  |
| Sync Cannon | 5★: 3 same-star Attack neighbours +24% each, off-star one 0 | 24/24/24/0% rate +4% | OK |  |
| Sync Cannon | 7★ LOOSE SYNC: ±1★ counts as matched | 24/24% | OK |  |
| Sync Cannon | GROW: 3+ matched = FULL SYNC (stage 3), 1 matched = SYNCED (stage 2) | 3 → 2 | OK |  |
| Star Breaker | 1★ Attack neighbours +10% damage (not Support/Special) | 10% / non-attack 0% | OK |  |
| Star Breaker | 3★ Attack neighbours +15% damage (not Support/Special) | 14% / non-attack 0% | OK |  |
| Star Breaker | 5★ Attack neighbours +19% damage (not Support/Special) | 19% / non-attack 0% | OK |  |
| Star Breaker | 7★ Attack neighbours +24% damage (not Support/Special) | 24% / non-attack 0% | OK |  |
| Rainbow | 1★: neighbours +13% vs enemies on trail, trail +5% from all | 1 trail(s), +13%, vuln 5%, slow 0% | OK |  |
| Rainbow | 5★: neighbours +25% vs enemies on trail, trail +5% from all, 2 trails | 2 trail(s), +25%, vuln 5%, slow 0% | OK |  |
| Rainbow | 7★: neighbours +31% vs enemies on trail, trail +5% from all, 2 trails, slows 10% | 2 trail(s), +31%, vuln 5%, slow 10% | OK |  |
| Resonance Grid | 1★: 4 diagonals +12% (resonance ×1.5), straight cell 0 | 12/12/12/12% · N/E/S/W 0% | OK |  |
| Resonance Grid | 5★: 4 diagonals +23% (resonance ×1.5), straight cell 0, fire rate +10% | 23/23/23/23% · N/E/S/W 0% · rate +10% | OK |  |
| Resonance Grid | 7★: 4 diagonals +28% (resonance ×1.5), straight cell 0, fire rate +18% | 28/28/28/28% · N/E/S/W 0% · rate +18% | OK |  |
| Resonance Grid | 3 of 4 diagonals: no resonance (+12%) | 12% | OK |  |
| Resonance Grid | star milestone text matches code (5★ +10% fire rate, 7★ full resonance fire rate ×1.5) | 3:Aura ×1.45 of its 1★ value / 5:Aura ×1.9 + diagonal fire rate / 7:Aura ×2.35; full resonance: fire rate ×1.5 | fixed text | 5★ said +15% fire rate (code +5%×K ≈ 10%), 7★ text was missing |
| Cryo Reactor | 1★: slows 15% (boss 15%), radius 115, neighbours +14% vs slowed | 15% / boss 15% / r 115 / +14% / vuln 0% | OK |  |
| Cryo Reactor | 3★: slows 19% (boss 15%), radius 145, neighbours +20% vs slowed | 19% / boss 15% / r 145 / +20% / vuln 0% | OK |  |
| Cryo Reactor | 7★: slows 27% (boss 15%), radius 165, neighbours +33% vs slowed, +10% from all | 27% / boss 15% / r 165 / +33% / vuln 10% | OK |  |
| Cryo Reactor | 3★ active ICE STORM freezes nearby 2.5s (bosses 0.8s) | 2.5 / 0.8s | OK |  |
| Cryo Reactor | 5★ active ICE STORM freezes nearby 4s (bosses 0.8s) | 4 / 0.8s | OK |  |
| Mirror Gate | 1★ neighbours resist control 15%, mirror every 20s | 15% · 20s | OK |  |
| Mirror Gate | 5★ neighbours resist control 28%, mirror every 20s | 28% · 20s | OK |  |
| Mirror Gate | 7★ neighbours resist control 35%, mirror every 15s | 35% · 15s | OK |  |
| Star Breaker | merge result next to it: +20% fire rate for 5s | tocT 4.97s +20% | OK |  |
| Star Breaker | PVP: rival first 5★ each wave −8% fire rate 6s | 5.97s −8% | OK |  |
| Star Cannon | board ★ 9 / 10 / 23 / 50 / 53 → rate +0/+125/+25/+125/+25%, dmg +350% from 50, stage 1/2/2/3/3 | +0%/+0% s1 · +125%/+0% s2 · +25%/+0% s2 · +125%/+350% s3 · +25%/+350% s3 | OK |  |
| Star Cannon | NOVA pair shot = 2 × 0.5 (same damage per attack) | 1 | OK |  |
| Star Cannon | SUPERNOVA: 4 comets ×1 + every 5th a METEOR ×1.2 (+40% splash) | 1.12 | OK |  |
| Werewolf | stage: 1★→Pup, 20 kills/3★→Hunter +40%, 50 kills/5★/born-Alpha→Alpha +100% | s1 +0% · s2 +40% · s2 +40% · s3 +100% · s3 +100% · s3 +100% | OK |  |
| Werewolf | 30% are born Alpha | 30% | OK |  |
| Werewolf | per attack: Pup 1 claw, Hunter 2×0.5, Alpha 2×0.55 always crit (×2) — each +40% splash on target | 1.4 / 1.4 / 3.08 | OK |  |
| Werewolf | 7★ ALPHA HOWL: neighbours +25% fire rate | +25% | OK |  |
| Evolver | 1★ evolves after 26s → 2★; 3★ after (20+18)×0.8 = 30.4s → 4★ | 26s → 2★ aten · 30.4s → 4★ lien | OK |  |
| Evolver | 5★ BREAKTHROUGH 25% chance of +2★; 7★ ASCEND picks highest-tier card | 28% +2★ · 7★→Mythic 50/50 | OK |  |
| Wall Projector | 3★: first wall at (9−1.2)/1.2 (3★ QUICK HANDS) = 6.5s, holds 3.3s, explodes ×7 | 6.53s · 3.3s · ×7 | OK |  |
| Orbital | no shots before merge; 2★ merge → strike 20s, 62 lances (1 per 0.32s) on a single enemy | pre 0 · 20s · ×62 lance-dmg · strike 3★ | fixed code | lance timer dropped frame remainders (60 instead of 62) |
| Black Hole | 1★: first hole at 9.5s, radius 68, 3s drain (~×6) + crush ×8 on one enemy | 9.5s · r 68 · ×13.5 | OK |  |
| Overlord | thunder ×9 on the group (92 px) · aftershock ×2 only to enemies OUTSIDE the blast | 9 / 9 / 9 / 9 / 2 | fixed code | aftershock was ×1.5 and re-hit the blasted enemies |
| Overlord | charge 7s at 1★, (7−1)/1.2 = 5s at 3★ (QUICK HANDS) | 7.03 / 5s | OK |  |
| Overlord | stage 2 (CHARGING): arc ×1.2 every 1.2s | s2 ×1.2 in 1.2s | OK |  |
| Holy Halo | cooldown 38/34/30/28s · barrier 2/2.5/2.5/3.5s · 5★ cleanse · 7★ +30% speed | 38s/2s · 34s/2.5s · 30s/2.5s clean · 28s/3.5s clean +30% | OK |  |
| Holy Halo | during barrier a leaking enemy costs no heart | 3 hearts left of 3 | OK |  |
| Hydra | 1★: 1 barrels × 55% on different enemies | 0.55× per volley | OK |  |
| Hydra | 3★: 3 barrels × 55% on different enemies | 1.65× per volley | OK |  |
| Hydra | 6★: 6 barrels × 55% on different enemies | 3.3× per volley | OK |  |
| Hydra | 7★ FUSED HEAD: ×6 beam pierces the line, 0.6/s (+20% from 3★ QUICK HANDS) | 7 beams in 10s, 18× per beam (3 enemies) | OK |  |
| Hydra | GROW: 4–6★ MANY HEADS, 7★ FUSED HEAD | 2/2/3 | OK |  |
| Nine-Tail | 4 tails +20% fire rate; 9 tails → 9 foxfires ×(2+1.5)=3.5 each, tails reset to 0 | +20% · 9 foxfires · tails 0 · 37.5× dealt | OK |  |
| Nine-Tail | 7★ NINE-TAIL: restarts at 3 tails, foxfires blast | tails 3 · 9 blast foxfires | OK |  |
| Nine-Tail | boss: +1 tail per 8% of its max HP dealt | 17% → 2 tails | OK |  |
| Nine-Tail | 5★ TWIN TAILS: 20% of kills grow 2 tails | 20% | OK |  |
| Pandora Vault | merge into 3★ opens 1 of 6 effects (all 6 seen) | 6 distinct | OK |  |
| Pandora Vault | merge into 7★ fires 2 effects | 2 | OK |  |
| Pandora Vault | effects: mana +10×★, freeze 1.5s, +1★ gift, frenzy +40% fire rate 6s | +40 · 1.5s · 3★ · +40% 6s | OK |  |
| Pandora Vault | 3★ QUICK HANDS: +20% fire rate | +20% | fixed code | the 3★ entry replaced the common +20% but nothing applied it |
| Chrono Throne | 1★: slow +1%/s alive, max 15% (5s → 5%) | 15% / 5% | OK |  |
| Chrono Throne | 3★ REWIND: enemy back 19% (400→324), boss 6.3% (600→562), ×6 damage, cooldown 36s | 324 / 562 · ×6 · 36s | OK |  |
| Chrono Throne | REWIND locked below 3★ | false | OK |  |
| Chrono Throne | 7★ TIME RESTORED: +1 heart once per match | 2 → 2 | OK |  |
| Chrono Throne | 4★ (TWELVE HOURS): clock hand still pierces every enemy on the line | 3× per shot (3 stacked) | OK |  |
| Chrono Throne | 7★ THRONE: TIME ECHO re-hits 40% after 0.3s | 1.4× per shot | OK |  |
| Nemesis | +0.3% (1★) / +1.2% (7★) max HP per hit | 0.30% / 1.20% | OK |  |
| Nemesis | executes normal enemies under 8% (after the hit), never big ones | normal true · big false | OK |  |
| Nemesis | boss JUDGMENT 2% max HP on the 10th hit | 2.00% | OK |  |
| Nemesis | 7★ REAPER LEAP: execution leaps to the nearest enemy | true | OK |  |
| Eclipse | DAY beam ×1.5 (1★) / ×2.5 (7★) + burn 0.4×/s while refreshed (≈ +0.44 / +0.37 per shot) | 1.93 / 2.81 per shot incl. burn | OK |  |
| Eclipse | NIGHT cone ×0.6 + slow 25% for 2s | ×0.6 · 25% · 1.97s | OK |  |
| Eclipse | 7★ TOTAL ECLIPSE: each swap both modes 1.5s + ×4 ring | 1.5s · ×4 | OK |  |
| Eclipse | two Eclipses are always out of phase | true | OK |  |
| Scrap Forge | 3★ (f=2): eat a 1★ +2, eat a 3★ +6 stacks; 4★ food refused; best Attack turret +4%/stack | stacks 2 → 8 · 4★ food false · best +32% · other 0% | OK |  |
| Scrap Forge | max 15 stacks (+60%), two Forges never exceed +60% on one turret | +60% · full feed false | OK |  |
| Scrap Forge | GROW stages reachable with the 15-stack cap (0–4 / 5–14 / 15) | 1/1/2/2/3 | fixed code+text | stages were 15/40 stacks but the cap is 15 → stage 3 unreachable |
| Scrap Forge | star milestones describe what stars really change (stacks per feed 2/3/4) | 3:Each feed +2 stacks (3★ food ×3) / 5:Each feed +3 stacks / 7:Each feed +4 stacks | fixed text | common "+20% speed / +25% effect / +30% effect" did nothing on a non-shooting Forge |
| Marionette | 1★: every 10s grabs a normal enemy (not big), walks it back for 2s | true · true · 2 · 10 | OK |  |
| Marionette | 7★ TWIN PUPPETS: 2 at once, big ones too | 2 puppets | OK |  |
| Marionette | puppet explodes at the end ×8 (60 px) on nearby enemies | puppet dead true · neighbour ×12 | OK |  |
| Hive Queen | 1★: 1st drone after 4s, max 3 · 7★: every 2.2s, max 10, every 5th gold | 4.03s · 3 drones · 0 gold / 2.2s · 10 drones · 2 gold | OK |  |
| Hive Queen | one drone: 60% damage every 0.5s (= 1.2× per second) | 1.2× / s | fixed code | timer reset dropped frame remainders (1.08×/s at 30 fps); waits ready when no enemy in 150 px |
| Hive Queen | 4★+ HIVE: drones give neighbours +10% fire rate | +10% | OK |  |
| Hive Queen | 3★ SWARM: 3 drones kamikaze ×3 each (35 px), swarm resets | true · drones left 0 · lead ×9 | OK |  |
| Leviathan | devour: normal +1 · big only from 4★ (+3) · flyers only at 7★ | 1 / 0 / 3 / 0 / 1 | OK |  |
| Leviathan | 25 stacks = +100% damage | +100% | OK |  |
| Leviathan | bubble ×1 + 30 px splash ×0.5 (single target takes 1.5×) | 1.5 | OK |  |
| Leviathan | TIDAL BREATH at 10 stacks: ×5 to EVERY enemy along the whole path (once each) | ×5 · hits 1–1 | fixed code | 0.25 s ticks left gaps on the path and the breath ended ~80 px before the gate → some enemies were never hit |
| Genesis Core | 1★: every 30s +1★ to the lowest turret | 30s → 3★ / 3★ | OK |  |
| Genesis Core | 4★+ BLOSSOM: 4 neighbours +15% damage | +15% / +15% | OK |  |
| Genesis Core | 7★ SEED OF LIFE: each raise also summons a free 1★ | 3 turrets (was 2) | OK |  |
| Genesis Core | 3★ GENESIS: 2 turrets at the board average ★ (floor(10/3)=3) | 3,3 | OK |  |
| Wyrm Engine | 1★ breathes 5 ticks per second | 5/s | fixed code | timer reset dropped frame remainders (4.4/s at 30 fps) |
| Wyrm Engine | BLUE FLAME +30% vs big enemies from 4★ (3★ ×1) | 1 / 1.3 | OK |  |
| Wyrm Engine | 7★ WHITE FLAME: cone 135 × 1.15 longer | 125 / 155 px | OK |  |
| Wyrm Engine | 3★ DRAGON DIVE ×25 per enemy (+5% max HP on bosses) | ×25 · boss +5.0% | OK |  |
| (Mythic actives) | active skill: locked at 2★, works at 3★ (Cryo / Halo: from 1★ by design) | chuato false/true · leviathan false/true · khoisinh false/true · ronglua false/true · ngaithoigian false/true · lophanung true/true · haoquang true/true | OK |  |
| (Mythic 4★ form) | Leviathan big-devour, Genesis +15% neighbours, Wyrm blue flame start at 4★ (form 2) — milestone text says so | Devours big enemies (×3 stacks) — starts at 4★ / Neighbours +15% damage (starts at 4★) / +30% vs big enemies and bosses (starts at 4★) | fixed text | listed under 5★ with no hint they start at 4★ |
| Orbital | star milestones now real: 3★ Orbitals +20% lance rate, 5★ +25% dmg, 7★ +30% (merge 2×3★ / 2×5★ / 2×6★) | 62 lance-dmg / 75 lance-dmg / 94 lance-dmg | fixed code | common "+20% speed / +25% / +30% effect" was text only |
| (Grow-up) | 15 grow-up turrets registered with 3 named stages + attack-by-stage text | 15 · 15 | OK |  |
| Overlord | grow-up stages 1/2/3 run 3s each without error (damage dealt) | 7348 / 8083 / 7348 | OK |  |
| Mystery Box | grow-up stages 1/2/3 run 3s each without error (damage dealt) | 27 / 64 / 0 | OK |  |
| Evolver | grow-up stages 1/2/3 run 3s each without error (damage dealt) | 34 / 191 / 41 | OK |  |
| Cryo Reactor | grow-up stages 1/2/3 run 3s each without error (damage dealt) | 0 / 0 / 0 | OK |  |
| Werewolf | grow-up stages 1/2/3 run 3s each without error (damage dealt) | 737 / 1179 / 3566 | OK |  |
| Orbital | grow-up stages 1/2/3 run 3s each without error (damage dealt) | 0 / 0 / 0 | OK |  |
| Berserker | grow-up stages 1/2/3 run 3s each without error (damage dealt) | 180 / 144 / 180 | OK |  |
| Star Cannon | grow-up stages 1/2/3 run 3s each without error (damage dealt) | 289 / 289 / 289 | OK |  |
| Chain Link | grow-up stages 1/2/3 run 3s each without error (damage dealt) | 178 / 238 / 267 | OK |  |
| Sync Cannon | grow-up stages 1/2/3 run 3s each without error (damage dealt) | 0 / 0 / 0 | OK |  |
| Hydra | grow-up stages 1/2/3 run 3s each without error (damage dealt) | 69 / 984 / 6917 | OK |  |
| Nine-Tail | grow-up stages 1/2/3 run 3s each without error (damage dealt) | 363 / 363 / 617 | OK |  |
| Chrono Throne | grow-up stages 1/2/3 run 3s each without error (damage dealt) | 233 / 350 / 490 | OK |  |
| Wyrm Engine | grow-up stages 1/2/3 run 3s each without error (damage dealt) | 2734 / 2734 / 2734 | OK |  |
| Resonance Grid | grow-up stages 1/2/3 run 3s each without error (damage dealt) | 0 / 0 / 0 | OK |  |
| Nine-Tail | GROW: tails 0–4 KIT / 5–8 BLAZING TAILS / 7★ NINE-TAIL | 1/2/2/3 | OK |  |
| Nine-Tail | BLAZING TAILS foxfire ×1 (no double damage); 7★ foxfire ×1 + 26 px ring ×0.35 | 1 / 1.35 | OK |  |
| Overlord | GROW: charge 0–35% DORMANT / 35–80% CHARGING / 80%+ OVERCHARGED | 1/2/3 | OK |  |
| Cryo Reactor | GROW: active charge <50% / 50–99% / full | 1/2/3 | OK |  |
| Evolver / Mystery Box | GROW: timer 0–60/60–90/90–100% · box 0–70/70–93/93–100% | 1/2/3/1/2/3 | OK |  |
| Rampage (grow-up) | 1st crit → RAGE +25% fire rate · 2nd crit → FRENZY +(150+15×★)% | s1→2→3 · +25% · +195% | OK |  |
| Chain Link (grow-up) | 4 linked → CHAIN MASTER, +40% per linked twin (+120%) | s3 +120% | OK |  |
| Chain Link (grow-up) | CHAIN MASTER: hit + lash a 2nd enemy ×0.5 | 1.5 | OK |  |
| Resonance Grid | GROW: 4 diagonals RESONANCE / 2–3 HUMMING / 0–1 IDLE | 3/2/1 | OK |  |
| Wyrm Engine / Chrono Throne | GROW: 1–3★ / 4–6★ / 7★ | 1/2/3/1/2/3 | OK |  |
| Orbital | GROW: 1 Orbital STANDBY / 2+ UPLINK / strike running BOMBARDMENT | 1/2/3 | OK |  |
| Orbital / Sync Cannon | attack-by-stage text no longer promises shots they never fire | STANDBY: no normal shots / OFFLINE: no same-star Attack neighbour (no shots — Support) / Uplink: 2+ Orbitals on board (ready to merge) · Bombardment: while its 20s merge strike lasts | fixed text | Orbital (Special) and Sync Cannon (Support) never shoot |
| Commander RAGE | +100% damage for 10s (also Orbital lances), cost 40 → 80 → 160 | ×2 · lance ×2 · cost 80 → 160 · 10s | OK |  |
| Commander REINFORCE | board full-1 → summons 1 free 1★ + raises the weakest +1★ | 15 turrets · weakest 2 | OK |  |
| Commander HOLY SHIELD | clears debuffs + blocks boss skills for 8s | shield 7.93s · frozen 0 · burn 0 | OK |  |
| Commander REINFORCE | text mentions the full-board fallback (+1★ to the weakest) | Instantly summon two 1★ turrets (free); no room → +1★ to your weakest | fixed text | only said "summon two 1★ turrets" |
| (Support caps) | Purifier with 7★ Amplifier + Radar + Star Breaker + Genesis: support +dmg capped 35% (Genesis +15% is a Mythic perk outside the cap), fire rate cap 45% | dmg +39% · rate +28% (incl. 3★ +20%) | OK |  |
| (Support caps) | Hydra with Crit Antenna + Focus Lens: crit ≤ +20 pts, crit dmg ≤ +50% | +20 pts · +43% | OK |  |
| (Support caps) | slow from Chiller + Cryo + hits: ≤35% (bosses ≤15%) | 27% / boss 15% | OK |  |
| (Support caps) | enemy weaken (Cryo 7★ + Rainbow + Venom + Time Bomb) capped 25% | 25% | OK |  |
| (Support caps) | Scrap Forge +60% stacks on top of the 35% support cap (separate, documented) | +60% | OK |  |
| (Special merges) | Mimic + Black Hole (same ★) → 5★ random deck turret | 5 · false | OK |  |
| (Special merges) | Copycat copies a 7★ Wyrm Engine: 7★ copy, −50% damage, WHITE WYRM form | ronglua · 7 · true · 3 | OK |  |
| (Special merges) | Merge King on a 6★ Hydra → 7★ FUSED HEAD | 7 · stage 3 | OK |  |
| (Special merges) | Nine-Tail × Nine-Tail into a Nine-Tail keeps the higher tail count | n/a | OK |  |
| (Special merges) | Merge King cannot push a 7★ past the cap | false | OK |  |
| (all) | SOLO / CO-OP / PVP 60s with each Legendary/Mythic (actives charged, AI plays) — no error | 93 runs ok | OK |  |
| Wall / Black Hole / Overlord | info "every Xs" includes the 3★ QUICK HANDS +20% (3★: wall 6.5s, hole 7.1s, charge 5.0s) | wall every 6.5s / Wall holds 3.3s, then explodes / hole every 7.1s / Black hole radius 76 px / charges 5.0s / Charge 5.0s | fixed text | showed the base seconds (7.8 / 8.5 / 6.0) while the turret really fired 20% sooner |
| Star Cannon / Mirror Gate | skill text: "multiple of 10" (not "in 10s"); Mirror Gate lists its Solo boss block | Board ★ total a multiple of 10 → faster; 50★ → huge damage / Support: neighbours resist control. PVP reflects 1 control / 20s; Co-op copies an ally merge; Solo blocks a boss skill | fixed text |  |
| (VI text) | Vietnamese skill text of the 7 re-roled Legendary/Mythic matches their new role (Support/Special) | 7 updated | fixed text | VI still described the old attack skills (e.g. Star Breaker "−1★ to a rival") |
| Pandora Vault | commander RAGE ×2 also applies to vault bombs | ×2 | fixed code | bombs used a fixed formula that skipped RAGE |
