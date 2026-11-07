# CÂN BẰNG VAI TRÒ — TURRET MERGE (đợt 5/11/2026)

Nguyên tắc (người dùng 07/11): điều kiện càng khó đạt → thưởng sát thương / tốc đánh / sát thương chí mạng càng cao; tỉ lệ chí mạng tối đa 100%, sát thương chí mạng không trần.

Nguồn thiết kế: `docs/demo-hop-tuong/thap-art/TU-VAN-VAI-TRO.txt` (tư vấn ChatGPT, người dùng đã duyệt).
Công cụ: `node tools/thap-sim-vaitro.js dem | dps | hotro | deck [n] [solo|coop|pvp] | che` (mô phỏng không giao diện, RNG có hạt giống).

## 1. Tỉ lệ vai trò — 51/27/7 → **40 / 27 / 18**

| Rarity | Attack | Special | Support | Target | OK |
|---|---|---|---|---|---|
| Common | 9 | 4 | 2 | 9 / 4 / 2 | ✔ |
| Rare | 8 | 4 | 5 | 8 / 4 / 5 | ✔ |
| Epic | 9 | 8 | 5 | 9 / 8 / 5 | ✔ |
| Legendary | 9 | 8 | 5 | 9 / 8 / 5 | ✔ |
| Mythic | 5 | 3 | 1 | 5 / 3 / 1 | ✔ |
| **Total** | **40** | **27** | **18** | 40 / 27 / 18 | ✔ |

**20 ụ đổi vai** (giữ nguyên hình / đầu súng, chỉ đổi cơ chế + chữ):

| Ụ | Bậc | Cũ → Mới | Kỹ năng mới (tóm tắt) |
|---|---|---|---|
| Frost | Thường | Tấn công → Đặc biệt | 6 s đóng băng quái đầu 2 s (trùm 0.6 s), miễn đóng băng 3 s, không sát thương |
| Venom | Thường | Tấn công → Đặc biệt | Dấu độc 5 s: quái nhận +12% từ mọi ụ (làm mới thời gian, không cộng giá trị) |
| Time Bomb | Thường | Tấn công → Đặc biệt | Bom 5 s; nổ không sát thương, làm yếu +10% quanh đó |
| Armor Breaker | Thường | Tấn công → Hỗ trợ | Mỗi 3 s LỘ quái đầu + quái trâu nhất; ụ Tấn công kề +22% vào quái bị lộ |
| Hammer | Thường | Tấn công → Hỗ trợ | Ụ Tấn công kề +chí mạng / +sát thương chí mạng; chí mạng làm choáng ngắn |
| Mana Leech | Hiếm | Đặc biệt → Tấn công | Tia hút: sát thương vừa phải + mana mỗi phát (trần mana/giây) |
| Fusion Mixer (Blender) | Hiếm | Đặc biệt → Hỗ trợ | Ụ Tấn công kề +6% tốc, +2%/loại Tấn công khác nhau (tối đa 12% ở 1★) |
| Cleanser | Sử thi | Đặc biệt → Hỗ trợ | 12 s tẩy 2 ụ kề; không có gì để tẩy → ụ kề +8% sát thương |
| Shield Gen | Sử thi | Đặc biệt → Hỗ trợ | Ụ kề có khiên chặn 1 khống chế, sạc lại 18 s, không cộng dồn |
| Star Lift | Sử thi | Đặc biệt → Hỗ trợ | 2 ụ kề sao thấp nhất +6%/★ tốc (≤30%); 5★: nấc sao mỗi wave (3 nấc = +1★, tối đa 2★/trận) |
| Star Breaker | Huyền thoại | Tấn công → Hỗ trợ | Ụ Tấn công kề +sát thương; ghép cạnh nó → bùng tốc 5 s; PVP: ụ đối thủ đầu tiên lên 5★ mỗi wave −8% tốc 6 s; CO-OP: ụ thấp nhất của đồng đội +8% |
| Mirror Gate | Huyền thoại | Đặc biệt → Hỗ trợ | Ụ kề kháng khống chế 15%→35%; 20 s: PVP phản 1 hiệu ứng, chặn 1 chiêu trùm, CO-OP chép 1 hiệu ứng ghép ½ sao |
| Sync Cannon | Huyền thoại | Tấn công → Hỗ trợ | Ụ Tấn công kề CÙNG SAO +sát thương theo số cặp khớp (trần) |
| Rainbow | Huyền thoại | Tấn công → Hỗ trợ | Vệt cầu vồng (+5% từ mọi ụ); ụ Tấn công kề +13% vào quái trên vệt |
| Orbital | Huyền thoại | Tấn công → Đặc biệt | Không bắn thường; ghép → 20 s bắn phá từ trời |
| Scrap Forge | Huyền thoại | Tấn công → Đặc biệt | Không bắn; ăn ụ 1–3★ → ụ Tấn công mạnh nhất +4%/cộng dồn (tối đa +60%) |
| Holy Halo | Cổ đại | Tấn công → Đặc biệt | Không bắn; chủ động: rào chắn cả đội 2 s (quái thường lọt không mất tim), chiêu trùm chỉ bị giảm |
| Cryo Reactor | Cổ đại | Tấn công → Hỗ trợ | Hào quang chậm 15%→27% (trùm 15%); ụ Tấn công kề +14% vào quái chậm; chạm: đóng băng (không sát thương) |

## 2. Hệ thống hỗ trợ chung (`thap/js/hotro.js`, đối tượng `HOTRO`)

- Ụ Hỗ trợ **không bao giờ bắn**; buff 4 ô thẳng (Resonance Grid: 4 ô chéo). Không tự buff, không buff ụ Hỗ trợ khác; một số chỉ buff ụ Tấn công (`chiTC`).
- Đường cong sao chung `HOTRO.K` = 1.00 / 1.20 / **1.45 (3★)** / 1.65 / **1.90 (5★)** / 2.10 / **2.35 (7★)** × cấp nâng (+6%/LV). 5★ = tiện ích phụ, 7★ = chiêu riêng (bảng mốc `MOC_RIENG`).
- Nhiều bản cùng loại → lấy bản mạnh nhất; khác loại cùng nhóm → cộng rồi kẹp trần: tốc bắn 45%, sát thương 35% (gồm sát thương có điều kiện), chí mạng +20 điểm, sát thương chí mạng +50%, chậm 35% (trùm 15%), giết ngay 15%/đòn.
- Suy yếu quái (Venom, Time Bomb, Rainbow, Breaker 7★, Toxic Pool, Cryo 7★…) cộng mọi nguồn, **trần 25%**.
- ~~Sàn Tấn công~~ (ĐÃ BỎ 2026-11-06 theo DCDW): Triệu hồi, kết quả Ghép, Twin Maker… chọn đều ngẫu nhiên trong 5 thẻ bộ bài, không thiên vị vai trò. Bộ nhiều Hỗ trợ/Đặc biệt có thể yếu — đúng DCDW; gợi ý "≥ 2 ụ Tấn công" chỉ còn ở màn bộ bài.
- Hiển thị: hào quang buff dùng hệ có sẵn `buffvfx.js` (ảnh ChatGPT BUFF1/BUFF2); sát thương có điều kiện hiện ở hào quang DAMAGE, kháng khống chế = bong bóng SHIELD mờ. Chạm ụ hỗ trợ: tô đúng ô tác dụng + ghi "CAP reached" khi trần đã đầy. Không thêm hình vẽ bằng code.
- PVP / CO-OP: Star Breaker, Mirror Gate, Clamp, Scrambler, Signal Jammer chạy trong mô hình cùng-wave (kiểm `che`: solo/coop/pvp 90 s không lỗi).

## 3. Ngân sách DPS theo bậc (mục 6A) — ụ Tấn công 1★, không buff

Common Attack 1★ mean DPS = 18.3
| Rarity | mean ×Common | budget (sustained → niche) | units outside |
|---|---|---|---|
| Common | 1.00 | 0.85–1.25 | Iron Fist 0.16 |
| Rare | 1.30 | 1.2–1.7 | Energy Cannon 0.84, Laser 3.27, Toxic Pool 0.89 |
| Epic | 1.69 | 1.45–2.1 | Blizzard 0.08, Lone Ace 3.24 |
| Legendary | 3.48 | 1.8–2.6 | Werewolf 0.72, Hydra 1.26, Nemesis 16.73 |
| Mythic | 3.51 | 2.3–3.3 | Overlord 5.78, Leviathan 5.13, Wyrm Engine 1.08 |

Cột "units outside" = lệch >25% khỏi khoảng ngân sách. Phần lớn là ngách có chủ ý (Nemesis %máu tối đa vs quái trâu, Laser dồn tia, Lone Ace khi đứng một mình, Blizzard = khống chế, Iron Fist/Werewolf cận chiến không với tới ô đo). Đợt này chỉ chỉnh 3 ụ lệch rõ: **Dice Gun** 21.4→16 sát thương gốc, **Railgun** 81→70, **Overlord** sấm ×12→×9. Các ụ Tấn công khác giữ nguyên số (để đợt sau theo dữ liệu chơi thật).

<details><summary>Bảng đầy đủ (đơn mục tiêu / đám đông ≤10 quái)</summary>

| Turret | Rarity | single ×Common | crowd ×Common |
|---|---|---|---|
| Cannon | Common | 1.01 | 0.95 |
| Dice Gun | Common | 1.32 | 0.42 |
| Gatling | Common | 1.04 | 0.32 |
| Scatter | Common | 1.04 | 0.30 |
| Revolver | Common | 1.32 | 0.34 |
| Sniper | Common | 1.52 | 0.48 |
| Tesla | Common | 0.76 | 0.23 |
| Guillotine | Common | 0.83 | 5.62 |
| Iron Fist | Common | 0.16 | 0.35 |
| Ice Blade | Rare | 0.95 | 1.29 |
| Drone Bay | Rare | 1.01 | 0.29 |
| Energy Cannon | Rare | 0.84 | 0.23 |
| Laser | Rare | 3.27 | 0.94 |
| Mortar | Rare | 1.01 | 1.79 |
| Toxic Pool | Rare | 0.89 | 3.07 |
| Mana Leech | Rare | 1.28 | 0.32 |
| Mine Layer | Rare | 1.19 | 1.77 |
| Berserker | Epic | 2.28 | 0.50 |
| Blizzard | Epic | 0.08 | 0.26 |
| Chain Link | Epic | 1.12 | 0.34 |
| Fifth Shot | Epic | 2.34 | 1.79 |
| Storm Gun | Epic | 2.26 | 0.78 |
| Lighthouse | Epic | 1.24 | 0.50 |
| Purifier | Legendary | 1.78 | 0.59 |
| Railgun | Legendary | 2.94 | 1.86 |
| Star Cannon | Legendary | 1.70 | 0.52 |
| Werewolf | Legendary | 0.72 | 0.60 |
| Wall Projector | Legendary | 1.39 | 3.82 |
| Black Hole | Mythic | 2.39 | 6.81 |
| Overlord | Mythic | 5.78 | 13.66 |
| Ricochet | Epic | 1.16 | 0.72 |
| Combo Core | Epic | 1.53 | 0.43 |
| Hydra | Legendary | 1.26 | 0.35 |
| Nine-Tail | Legendary | 2.63 | 0.71 |
| Nemesis | Legendary | 16.73 | 1.08 |
| Lone Ace | Epic | 3.24 | 0.86 |
| Eclipse | Legendary | 2.20 | 1.72 |
| Hive Queen | Mythic | 3.18 | 1.13 |
| Leviathan | Mythic | 5.13 | 2.66 |
| Wyrm Engine | Mythic | 1.08 | 1.96 |

</details>

## 4. Giá trị ụ Hỗ trợ (mục 6B)

Ụ hỗ trợ ở ô giữa, 4 ụ Tấn công Thường khác loại kề bên cùng số sao, quái vào 2/s (≤10 trên đường), máu quái chỉnh để nhóm giết ~1.6 con/s. Số = % DPS nhóm tăng thêm. Mục tiêu: 15–25% ở 3–5★, 25–35% ở 7★.

| Support | Rarity | 3★ | 5★ | 7★ | note |
|---|---|---|---|---|---|
| Armor Breaker | Common | +9% | +18% | +16% |  |
| Hammer | Common | +17% | +20% | +29% |  |
| Crit Antenna | Rare | +7% | +20% | +24% |  |
| Radar | Rare | +21% | +33% | +35% |  |
| Fusion Mixer | Rare | +21% | +30% | +27% |  |
| Chiller | Rare | +5% | +19% | +30% |  |
| Amplifier | Rare | +6% | +18% | +26% |  |
| Cleanser | Epic | +8% | +10% | +19% | defensive (boss / rival control) |
| Shield Gen | Epic | +3% | -3% | +5% | defensive (boss / rival control) |
| Star Lift | Epic | +13% | +20% | +23% | buffs 2 lowest only |
| Reaper Pillar | Epic | +7% | +24% | +31% |  |
| Sync Cannon | Legendary | +22% | +35% | +32% |  |
| Star Breaker | Legendary | +12% | +23% | +33% |  |
| Rainbow | Legendary | +16% | +31% | +40% |  |
| Cryo Reactor | Mythic | +28% | +35% | +27% |  |
| Resonance Grid | Legendary | +16% | +34% | +37% |  |
| Focus Lens | Epic | +13% | +30% | +38% |  |
| Mirror Gate | Legendary | +0% | -3% | -3% | defensive (boss / rival control) |

Nhiễu đo ±5%. Shield Gen / Cleanser / Mirror Gate là hỗ trợ **phòng thủ** (chặn chiêu trùm / khống chế đối thủ) — giá trị không nằm ở DPS. Star Lift chỉ buff 2 ụ sao thấp nhất (+ nấc sao).

## 5. Năm kiểu bộ bài (mục 6C)

Bot người chơi (chỉ trong mô phỏng: nâng cấp ụ Tấn công trước, ghép sao cho kết quả rơi cạnh ụ Hỗ trợ), 3 họ bộ bài cùng độ hiếm (Thường / Hiếm / Sử thi), mỗi bộ chạy nhiều lần. Chỉ số = wave trung bình đạt được.

**SOLO** (8 lần × 3 họ):

| Deck archetype | mean wave | vs mean | within ±15% |
|---|---|---|---|
| 3A+1Sup+1Sp (default) | 17.2 | -3% | ✔ |
| 2A+2Sup+1Sp | 16.7 | -6% | ✔ |
| 3A+2Sp | 17.5 | -2% | ✔ |
| 4A+1Sp | 20.2 | +14% | ✔ |
| 2A+1Sup+2Sp | 17.2 | -3% | ✔ |

**CO-OP** (5 lần × 3 họ, đồng đội = AI game):

| Deck archetype | mean wave | vs mean | within ±15% |
|---|---|---|---|
| 3A+1Sup+1Sp (default) | 14.3 | -10% | ✔ |
| 2A+2Sup+1Sp | 14.4 | -9% | ✔ |
| 3A+2Sp | 17.5 | +10% | ✔ |
| 4A+1Sp | 17.3 | +9% | ✔ |
| 2A+1Sup+2Sp | 15.9 | -0% | ✔ |

**PVP** (5 lần × 3 họ, đối thủ = AI game — nhiễu lớn vì kết quả phụ thuộc bộ đối thủ ngẫu nhiên):

| Deck archetype | mean wave | vs mean | within ±15% |
|---|---|---|---|
| 3A+1Sup+1Sp (default) | 12.3 | +10% | ✔ |
| 2A+2Sup+1Sp | 13.3 | +19% | ✘ |
| 3A+2Sp | 9.7 | -13% | ✔ |
| 4A+1Sp | 10.8 | -3% | ✔ |
| 2A+1Sup+2Sp | 9.7 | -13% | ✔ |

Kết luận: SOLO và CO-OP cả 5 kiểu trong ±15%, không kiểu nào áp đảo (4A+1Sp hơi nhỉnh — đúng vai "lối chơi đơn giản cho người mới"). PVP 5 lần/họ còn nhiễu (lần chạy trước: 4A+1Sp +25%, lần này 2A+2Sup+1Sp +19%) → cần thêm dữ liệu chơi thật.

## 6. Bộ khởi đầu & giao diện

- 6 bộ khởi đầu ghi rõ cơ cấu: BOSS HUNTER 3A·1Sup·1Sp · BLAST ZONE 4A·1Sp · DEEP FREEZE 2A·2Sup·1Sp · MANA ENGINE 3A·2Sp · CHAIN COMBO 2A·1Sup·2Sp · SHIELD WALL 2A·2Sup·1Sp. Bộ hướng dẫn giữ nguyên (Frost giờ là Đặc biệt → 4A+1Sp).
- Màn chọn bộ: chip lọc vai có số đếm (ALL 85 · ATTACK 40 · SUPPORT 18 · SPECIAL 27).
- Bảng chạm / trang ụ: chữ kỹ năng mới (tiếng Anh), mô tả vai Hỗ trợ "Never attacks…", mốc 3/5/7★ mới; Test range có kịch bản mới cho mọi ụ đổi vai.

## 7. Chưa làm trong đợt này

- Trần mana/summon cho các ụ Đặc biệt kinh tế khác (Mana Core, Bounty Beacon, Cloner, Twin Maker…) theo mục 4/6D — giữ nguyên số.
- Chỉnh DPS toàn bộ 40 ụ Tấn công theo ngân sách — mới chỉnh 3 ụ lệch rõ.
- "Ô được chạm tới" của ụ hỗ trợ khi chọn dùng lại khung tô có sẵn (không có hình mới).
