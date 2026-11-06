# Nhóm chuyển động (archetype) — 93 ụ

Sinh từ `thap/js/anim-meta.js` bằng `node tools/thap-anim-bang.js`. Mọi ụ đều có: thở lõi 1–3% + nhún nhỏ (lệch pha theo ụ), ngắm theo góc ngắn nhất (lò xo tới hạn của luật, vẽ nội suy), muzzle socket xoay theo đầu.

| Nhóm | Số ụ | Chuyển động | Ụ |
|---|---|---|---|
| Cannon (`cannon`) | 14 | thụt nòng ease-out 55 ms → lò xo hồi ~220 ms (vượt nhẹ) · tụ lực 110 ms | Cannon `canon`, Dice Gun `xucxac`, Guillotine `maychem`, Iron Fist `nam`, Fifth Shot `no5`, Purifier `aten`, Ricochet `nayda`, Lone Ace `docton`, Hydra `hydra`, Nine-Tail `cuuvi`, Werewolf `soi`, Berserker `cuongno`, Prism Thief `bienmau`, Energy Cannon `nangluong` |
| Heavy gun (`nang`) | 8 | giật mạnh hơn (đến 8%), hồi chậm 250 ms · tụ lực 170 ms | Railgun `railgun`, Mortar `mortar`, Star Cannon `ngoisao`, Sniper `tia`, Overlord `overlord`, Wyrm Engine `ronglua`, Leviathan `leviathan`, Wall Projector `wallgen` |
| Revolver (`revolver`) | 4 | giật + xoắn nòng ±0,07 rad luân phiên (ổ đạn xoay) · hồi 170 ms | Revolver `sungluc`, Nemesis `nemesis`, Combo Core `combo`, Scrambler `xaotron` |
| Gatling (`gatling`) | 4 | quay nòng tăng/giảm theo phát bắn (τ 0,7 s), rung ngang theo pha quay, chớp nòng so le trái/phải | Gatling `lien`, Scatter `phun`, Storm Gun `bao`, Mana Leech `hutmana` |
| Laser / beam (`beam`) | 4 | không giật mạnh; tụ sáng 180 ms; tia nối socket→quái, alpha dao động rất nhẹ | Laser `laser`, Lighthouse `anhsang`, Eclipse `nhatthuc`, Focus Lens `thaukinh` |
| Tesla / chain (`chain`) | 5 | cuộn sáng tụ 150 ms; sét lan theo danh sách trúng THẬT, ~45 ms/mắt xích (tổng ≤ 160 ms) | Tesla `set`, Chain Link `lienket`, Ember Relay `lualien`, Quantum Choir `hopca`, Bounty Beacon `santhuong` |
| Ice / cryo (`ice`) | 5 | tụ lạnh 140 ms, giật nhẹ, hồi chậm 230 ms | Frost `bang`, Ice Blade `kiembang`, Blizzard `baotuyet`, Cryo Reactor `lophanung`, Chiller `lanhgia` |
| Poison / pool (`poison`) | 5 | giật nhẹ, tụ 100 ms | Venom `doc`, Toxic Pool `vungdoc`, Blood Circuit `mauhut`, Hex Saboteur `nguyenrua`, Mine Layer `min` |
| Support / mana (`support`) | 23 | không ngắm/giật: nạp (phồng 1,2% theo T.nap) → xung lò xo 6% → toả sáng tắt dần | Mana Core `mana`, Mana Doubler `nhanmana`, Armor Breaker `phagiap`, Hammer `bua`, Crit Antenna `chimang`, Radar `radar`, Fusion Mixer `tron`, Amplifier `khuech`, Cooldown Horn `loa`, Cleanser `taylo`, Shield Gen `khien`, Star Lift `nangsao`, Reaper Pillar `tuthan`, Sync Cannon `dongbo`, Star Breaker `hasao`, Rainbow `cauvong`, Resonance Grid `luoicheo`, Mirror Gate `guongcong`, Sanctum `thanhdia`, Overclock `epxung`, Signal Jammer `nhieusong`, Jammer `kepha`, Holy Halo `haoquang` |
| Drone / orbital / hive (`drone`) | 4 | lơ lửng (nhún 0,9 px + phóng ±1,2% “độ sâu”), giật nhẹ | Drone Bay `drone`, Orbital `orbital`, Hive Queen `chuato`, Marionette `marionette` |
| Portal / black hole (`portal`) | 3 | 2 lớp ảnh đầu quay ngược chiều (0,7 / −1,25 rad/s) trên đầu | Black Hole `blackhole`, Teleporter `dichchuyen`, Pandora Vault `pandora` |
| Chrono / rewind (`chrono`) | 3 | 2–3 dư ảnh theo góc đầu đã lưu (45 ms/mẫu), chỉ hiện khi đầu đang xoay | Chrono Lock `khoathoigian`, Chrono Throne `ngaithoigian`, Time Bomb `bomhen` |
| Evolver / transformer (`evolver`) | 11 | mở → khoá theo lớp: phồng ngang/dẹt dọc 4,5% lên 150 ms, lò xo về ~460 ms; neo ô giữ nguyên | Evolver `tienhoa`, Mystery Box `hopbi`, Merge King `vughep`, Twin Maker `sinhdoi`, Copycat `saochep`, Cloner `nhanban`, Scrap Forge `loren`, Genesis Core `khoisinh`, Hero Foundry `xuonganh`, Fusion Archive `luutru`, Mimic `mimic` |

Tổng: 93 ụ.

## Tham số

| Nhóm | kick | kMs | rMs | z | ant ms | thở s | glow | nhún px |
|---|---|---|---|---|---|---|---|---|
| cannon | 0.055 | 55 | 220 | 0.6 | 110 | 3.4 | 0.035 | 0.3 |
| nang | 0.075 | 70 | 250 | 0.62 | 170 | 4.2 | 0.03 | 0.25 |
| revolver | 0.045 | 45 | 170 | 0.58 | 80 | 3 | 0.035 | 0.3 |
| gatling | 0.022 | 30 | 110 | 0.7 | 60 | 2.8 | 0.03 | 0.25 |
| beam | 0.012 | 60 | 200 | 0.75 | 180 | 3.8 | 0.05 | 0.2 |
| chain | 0.03 | 40 | 150 | 0.6 | 150 | 2.6 | 0.05 | 0.25 |
| ice | 0.035 | 50 | 230 | 0.65 | 140 | 4.6 | 0.04 | 0.25 |
| poison | 0.03 | 50 | 200 | 0.6 | 100 | 3.6 | 0.04 | 0.3 |
| support | 0 | 70 | 260 | 0.55 | 0 | 4 | 0.05 | 0.35 |
| drone | 0.02 | 50 | 220 | 0.6 | 90 | 2.4 | 0.035 | 0.9 |
| portal | 0.015 | 60 | 260 | 0.7 | 160 | 5 | 0.05 | 0.2 |
| chrono | 0.03 | 50 | 200 | 0.65 | 120 | 4.4 | 0.04 | 0.25 |
| evolver | 0.03 | 60 | 460 | 0.5 | 100 | 3.8 | 0.04 | 0.3 |
