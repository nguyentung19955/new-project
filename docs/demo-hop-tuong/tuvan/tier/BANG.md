# Tier power table — every turret (auto: `node tools/thap-sim-tier.js`)

Power **P** = value ÷ median of the WHITE units of the same role, same ★ (LV start, no power-up). Attack = solo DPS (geo-mean of 1 giant + a wave-20 crowd); Support = extra damage it gives a standard board (4 white attackers around it, enemies leak); Special = max(standard board, deck test: bot plays SOLO with [Gatling, Cannon, Tesla, Revolver, X], waves → power). Excluded from medians (defensive / manual, not measurable): khien, guongcong, loren, epxung.

## Median P per tier — before → after

| Tier | 1★ | 4★ | 7★ | 4★ vs lower tier |
|---|---|---|---|---|
| White | 1.00 → **1.00** | 1.00 → **1.00** | 1.00 → **1.00** | — |
| Blue | 1.34 → **1.35** | 1.03 → **1.26** | 1.03 → **1.21** | 3% → 26% |
| Purple | 1.39 → **1.60** | 1.53 → **1.59** | 1.44 → **1.48** | 49% → 26% |
| Gold | 1.88 → **2.47** | 1.98 → **2.21** | 1.47 → **1.94** | 29% → 39% |
| Red | 5.23 → **5.23** | 4.49 → **5.93** | 3.25 → **4.75** | 126% → 168% |

### Attack median 4★

| | White | Blue | Purple | Gold | Red |
|---|---|---|---|---|---|
| before | 1.00 | 1.59 | 1.69 | 1.77 | 4.49 |
| after | 1.00 | 1.53 | 1.97 | 2.75 | 5.93 |

### Support median 4★

| | White | Blue | Purple | Gold | Red |
|---|---|---|---|---|---|
| before | 1.00 | 0.97 | 0.73 | 1.00 | 0.71 |
| after | 1.00 | 1.09 | 1.24 | 1.53 | 2.55 |

### Special median 4★

| | White | Blue | Purple | Gold | Red |
|---|---|---|---|---|---|
| before | 1.00 | 1.19 | 2.01 | 2.47 | 5.24 |
| after | 1.00 | 1.13 | 1.59 | 2.06 | 8.66 |

## Every turret, ranked inside its tier (4★)

Flags: ⬆ = beats the 4★ median of a HIGHER tier · ★ = active skill · note = "only bigger numbers" / overlap / weak payoff (redesign proposals: DE-XUAT.md).

### White

| # | Turret | Role | P 1★ | P 4★ | P 7★ | before 4★ | flags |
|---|---|---|---|---|---|---|---|
| 1 | Mana Core `mana` | Special | 1.89 | 1.89 | 1.04 | 1.01 | ⬆Blue ⬆Purple |
| 2 | Cannon `canon` | Attack | 1.42 | 1.45 | 1.28 | 1.54 | ⬆Blue |
| 3 | Sniper `tia` | Attack | 1.72 | 1.39 | 1.33 | 1.48 | ⬆Blue |
| 4 | Guillotine `maychem` | Attack | 1.67 | 1.33 | 1.55 | 1.42 | ⬆Blue |
| 5 | Time Bomb `bomhen` | Special | 1.25 | 1.25 | 1.09 | 1.08 |  |
| 6 | Hammer `bua` | Support | 1.01 | 1.21 | 1.37 | 1.27 |  |
| 7 | Revolver `sungluc` | Attack | 1.06 | 1.01 | 1.00 | 0.95 |  |
| 8 | Gatling `lien` | Attack | 0.83 | 1.00 | 1.06 | 1.06 |  |
| 9 | Tesla `set` | Attack | 0.65 | 0.94 | 0.97 | 1.00 |  |
| 10 | Dice Gun `xucxac` | Attack | 1.00 | 0.88 | 0.81 | 0.84 |  |
| 11 | Scatter `phun` | Attack | 0.78 | 0.81 | 0.80 | 0.86 |  |
| 12 | Armor Breaker `phagiap` | Support | 0.99 | 0.79 | 0.63 | 0.73 |  |
| 13 | Frost `bang` | Special | 0.75 | 0.75 | 0.43 | 0.99 |  |
| 14 | Venom `doc` | Special | 0.64 | 0.64 | 0.96 | 0.67 |  |
| 15 | Iron Fist `nam` | Attack | 0.60 | 0.60 | 0.59 | 0.42 |  |

### Blue

| # | Turret | Role | P 1★ | P 4★ | P 7★ | before 4★ | flags |
|---|---|---|---|---|---|---|---|
| 1 | Mortar `mortar` | Attack | 1.97 | 1.97 | 1.75 | 1.90 | ⬆Purple |
| 2 | Toxic Pool `vungdoc` | Attack | 1.52 | 1.89 | 1.33 | 2.59 | ⬆Purple |
| 3 | Laser `laser` | Attack | 1.70 | 1.74 | 1.51 | 2.13 | ⬆Purple |
| 4 | Mine Layer `min` | Attack | 1.53 | 1.71 | 2.18 | 1.91 | ⬆Purple |
| 5 | Ice Blade `kiembang` | Attack | 1.54 | 1.36 | 1.45 | 1.28 |  |
| 6 | Mimic `mimic` | Special | 1.29 | 1.29 | 0.71 | 1.34 |  |
| 7 | Radar `radar` | Support | 1.79 | 1.29 | 1.89 | 1.03 |  |
| 8 | Drone Bay `drone` | Attack | 1.31 | 1.29 | 1.17 | 0.71 |  |
| 9 | Mana Leech `hutmana` | Attack | 1.28 | 1.26 | 1.17 | 0.87 |  |
| 10 | Fusion Mixer `tron` | Support | 1.74 | 1.26 | 2.25 | 1.03 |  |
| 11 | Cooldown Horn `loa` | Special | 1.25 | 1.25 | 0.69 | 1.08 |  |
| 12 | Energy Cannon `nangluong` | Attack | 1.26 | 1.21 | 1.21 | 0.58 |  |
| 13 | Chiller `lanhgia` | Support | 1.46 | 1.09 | 2.32 | 0.59 |  |
| 14 | Teleporter `dichchuyen` | Special | 1.35 | 1.01 | 0.55 | 1.30 |  |
| 15 | Amplifier `khuech` | Support | 0.52 | 0.94 | 1.16 | 0.97 |  |
| 16 | Mana Doubler `nhanmana` | Special | 0.80 | 0.80 | 0.44 | 0.98 |  |
| 17 | Crit Antenna `chimang` | Support | 1.25 | 0.67 | 0.86 | 0.78 |  |

### Purple

| # | Turret | Role | P 1★ | P 4★ | P 7★ | before 4★ | flags |
|---|---|---|---|---|---|---|---|
| 1 | Berserker `cuongno` | Attack | 1.56 | 2.20 | 1.83 | 1.69 |  |
| 2 | Chrono Lock `khoathoigian` | Special | 2.13 | 2.13 | 1.20 | 2.32 |  |
| 3 | Mystery Box `hopbi` | Special | 2.11 | 2.11 | 1.16 | 13.20 |  |
| 4 | Lone Ace `docton` | Attack | 2.22 | 2.07 | 1.89 | 1.92 |  |
| 5 | Fifth Shot `no5` | Attack | 2.06 | 2.03 | 1.98 | 2.61 |  |
| 6 | Blizzard `baotuyet` | Attack | 1.21 | 1.99 | 4.30 | 1.37 |  |
| 7 | Storm Gun `bao` | Attack | 1.86 | 1.97 | 1.74 | 2.10 |  |
| 8 | Ricochet `nayda` | Attack | 1.31 | 1.96 | 2.41 | 2.08 |  |
| 9 | Cloner `nhanban` | Special | 1.61 | 1.61 | 0.88 | 2.34 |  |
| 10 | Scrambler `xaotron` | Special | 1.59 | 1.59 | 0.87 | 1.34 |  |
| 11 | Combo Core `combo` | Attack | 1.62 | 1.58 | 1.50 | 1.05 |  |
| 12 | Overclock `epxung` | Special | 1.58 | 1.58 | 0.87 | 1.32 | not measured |
| 13 | Lighthouse `anhsang` | Attack | 1.93 | 1.49 | 1.47 | 0.95 |  |
| 14 | Jammer `kepha` | Special | 1.49 | 1.49 | 0.82 | 1.09 |  |
| 15 | Star Lift `nangsao` | Support | 0.41 | 1.46 | 1.31 | 0.55 |  |
| 16 | Bounty Beacon `santhuong` | Special | 1.25 | 1.45 | 0.78 | 1.84 |  |
| 17 | Chain Link `lienket` | Attack | 1.52 | 1.42 | 1.35 | 0.82 |  |
| 18 | Cleanser `taylo` | Support | 2.11 | 1.28 | 1.60 | 0.73 |  |
| 19 | Focus Lens `thaukinh` | Support | 1.67 | 1.19 | 3.86 | 0.72 |  |
| 20 | Reaper Pillar `tuthan` | Support | 1.24 | 1.17 | 2.23 | 0.98 |  |
| 21 | Signal Jammer `nhieusong` | Special | 1.22 | 1.07 | 0.59 | 2.01 |  |
| 22 | Shield Gen `khien` | Support | 0.00 | 0.13 | 0.00 | 0.00 | not measured |

### Gold

| # | Turret | Role | P 1★ | P 4★ | P 7★ | before 4★ | flags |
|---|---|---|---|---|---|---|---|
| 1 | Evolver `tienhoa` | Special | 5.37 | 5.37 | 2.95 | 5.16 |  |
| 2 | Marionette `marionette` | Special | 5.31 | 4.62 | 3.15 | 8.89 |  |
| 3 | Star Cannon `ngoisao` | Attack | 1.82 | 3.55 | 1.67 | 2.03 |  |
| 4 | Nemesis `nemesis` | Attack | 3.27 | 3.47 | 3.11 | 4.79 | overlap: execute = Guillotine (White) / Reaper Pillar (Purple) |
| 5 | Nine-Tail `cuuvi` | Attack | 2.57 | 3.17 | 1.92 | 1.71 |  |
| 6 | Twin Maker `sinhdoi` | Special | 3.13 | 3.13 | 1.72 | 3.23 |  |
| 7 | Orbital `orbital` | Special | 3.09 | 3.09 | 1.70 | 3.03 |  |
| 8 | Quantum Choir `hopca` | Attack | 2.38 | 3.04 | 2.65 | 1.93 | overlap: same-star count = Sync Cannon (Gold) |
| 9 | Purifier `aten` | Attack | 2.92 | 3.03 | 2.74 | 1.05 | numbers: +300% vs poisoned = same trick as Ice Blade (Blue, +400% vs slowed) |
| 10 | Railgun `railgun` | Attack | 3.03 | 2.79 | 2.37 | 2.99 |  |
| 11 | Wall Projector `wallgen` | Attack | 3.03 | 2.75 | 2.69 | 3.13 |  |
| 12 | Prism Thief `bienmau` | Attack | 2.27 | 2.53 | 2.29 | 1.66 |  |
| 13 | Eclipse `nhatthuc` | Attack | 2.97 | 2.49 | 2.64 | 2.64 |  |
| 14 | Copycat `saochep` | Special | 2.35 | 2.29 | 1.26 | 2.19 |  |
| 15 | Werewolf `soi` | Attack | 1.88 | 2.13 | 1.62 | 1.11 |  |
| 16 | Ember Relay `lualien` | Attack | 2.19 | 2.07 | 1.96 | 1.51 |  |
| 17 | Fusion Archive `luutru` | Attack | 2.07 | 1.98 | 1.90 | 1.29 | overlap: merge → permanent damage = Combo Core (Purple) |
| 18 | Blood Circuit `mauhut` | Special | 2.85 | 1.83 | 1.01 | 2.27 |  |
| 19 | Star Breaker `hasao` | Support | 3.30 | 1.82 | 1.60 | 1.00 | numbers: plain +damage support (same as Cleanser/Sanctum) + small merge surge |
| 20 | Hex Saboteur `nguyenrua` | Special | 2.16 | 1.82 | 1.00 | 2.05 | solo: nothing visible (PVP/co-op only) |
| 21 | Hydra `hydra` | Attack | 1.06 | 1.80 | 3.40 | 1.77 |  |
| 22 | Pandora Vault `pandora` | Special | 1.80 | 1.80 | 0.99 | 2.66 |  |
| 23 | Merge King `vughep` | Special | 2.45 | 1.78 | 0.98 | 2.07 |  |
| 24 | Resonance Grid `luoicheo` | Support | 2.07 | 1.68 | 3.02 | 1.06 | numbers: +damage support, only the shape differs (diagonal) |
| 25 | Sanctum `thanhdia` | Support | 2.34 | 1.53 | 1.72 | 1.00 | overlap: cleanse = Cleanser (Purple) + shield = Shield Gen (Purple) + damage buff |
| 26 | Sync Cannon `dongbo` | Support | 2.70 | 1.38 | 2.44 | 0.85 |  |
| 27 | Hero Foundry `xuonganh` | Special | 1.35 | 1.29 | 0.71 | 1.80 | weak payoff: one cell +fire rate 12 s |
| 28 | Rainbow `cauvong` | Support | 2.48 | 1.22 | 2.01 | 1.06 |  |
| 29 | Scrap Forge `loren` | Special | 0.49 | 0.49 | 0.27 | 0.28 | not measured · weak payoff: manual feed only, +60% cap; bot never feeds |
| 30 | Mirror Gate `guongcong` | Support | 0.00 | 0.13 | 0.00 | 0.00 | not measured · weak payoff in PVE (control resist); not measurable here |

### Red

| # | Turret | Role | P 1★ | P 4★ | P 7★ | before 4★ | flags |
|---|---|---|---|---|---|---|---|
| 1 | Genesis Core `khoisinh` | Special ★ | 10.76 | 10.76 | 5.90 | 5.24 |  |
| 2 | Chrono Throne `ngaithoigian` | Special ★ | 8.66 | 8.66 | 4.75 | 9.39 |  |
| 3 | Overlord `overlord` | Attack | 5.71 | 7.25 | 6.06 | 12.15 | Red without an ACTIVE skill (only a bigger charged blast) |
| 4 | Hive Queen `chuato` | Attack ★ | 3.72 | 6.23 | 5.67 | 4.17 |  |
| 5 | Leviathan `leviathan` | Attack ★ | 5.23 | 5.93 | 3.65 | 4.49 |  |
| 6 | Black Hole `blackhole` | Attack | 6.68 | 5.42 | 5.25 | 5.76 | Red without an ACTIVE skill |
| 7 | Wyrm Engine `ronglua` | Attack ★ | 2.73 | 3.14 | 2.43 | 3.34 |  |
| 8 | Cryo Reactor `lophanung` | Support ★ | 0.00 | 2.55 | 3.33 | 0.71 | Red support capped like any support (slow aura = Chiller, Blue) |
| 9 | Holy Halo `haoquang` | Special ★ | 0.42 | 0.42 | 0.23 | 0.69 | weak: short barrier, no damage, no board change |
