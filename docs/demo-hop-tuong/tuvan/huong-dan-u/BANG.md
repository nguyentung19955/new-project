# Rà soát hướng dẫn kỹ năng 93 ụ (clip "Test range" + chữ kỹ năng) — 07/11

Người dùng (20:24): clip hướng dẫn có đủ/đúng không; chữ phải dễ hiểu cho người yếu tiếng Anh, nếu không thì clip phải cụ thể hơn.

## Lỗi chung tìm thấy (áp cho cả 93 clip)
- **Băng chú thích đè lên quái**: khung cắt cũ y 150…530, băng chữ ở y 175 = đúng đường trên nơi quái đi → quái + số sát thương bị che/cắt ở MỌI clip ("Look at the damage numbers" mà không thấy số). Sửa: khung y 112…532 (unitpage.js khungXem + css), chú thích chuyển xuống ĐÁY khung, chữ 19 px, câu dài xuống 2 dòng, nằm gọn giữa nút "4★" và nút dừng.
- Ô mana / hồi chiêu lên góc trên-phải (trên đường), "Slow-mo" giữa trên.
- Mốc sao cuối vòng "Aura ×1.45 of its 1★ value" (bị cắt còn "Aura ×1.45") → "Buff ×1.45 vs 1★"; "lead" → "first"; "exposed" → "broken armor".
- Chữ kỹ năng (TEXT.turret.skill) viết lại cả 93 câu theo mẫu LÀM GÌ → KHI NÀO/CÁCH KÍCH → MẸO, từ khoá thống nhất (Merge, Summon, Neighbours (4 sides), Row, Column, ★, Stack, Breakthrough, Freeze, Stone, Boss), bỏ aura/proc/exposes/puppet; bản Việt trong vi.json.

Kiểm: `tools/thap-chup-huongdan.js` chụp mọi chú thích của 93 clip ở 390×844 (4★): **93/93 chạy không lỗi trang, 0 sự kiện bị trượt** (trước sửa: santhuong trượt). Ảnh đối chiếu: `anh/`.

## Bảng
| id | Tên | Clip chạy? | Khớp luật hiện tại? | Chữ dễ hiểu? (trước) | Sửa |
|---|---|---|---|---|---|
| xucxac | Dice Gun | Có | Có | Tạm được | Chữ A2: "Each shot deals random damage: 3% to 300%. A crit always deals 300%. Tip: add crit chance" |
| canon | Compass Cannon | Có | Clip: câu chèn sẵn "Merge two of the same" sai (phải cùng Pháo + cùng sao); mũi tên/số quá nhỏ không thấy phép cộng/trừ; xem 7★ thì lần ghép 2 hỏng (13 lên 7★) | Dài/nhiều ký hiệu | Clip: Số TO trên mỗi Pháo + câu phép tính "2 + 1 = 3", "3 − 1 = 2", "3 × 15% = +45%"; giới hạn ụ chính ≤5★ · Chữ A2: "Each Cannon has an arrow and a number. Each number = +15% damage. Drag a Cannon onto a sam…" |
| lien | Gatling | Có | Có | Tạm được | Chữ A2: "Shoots very fast at the first enemy. Each ★ makes it shoot faster. Tip: put a Radar next t…" |
| phun | Scatter | Có | Có | Khó: peppered | Chữ A2: "Shoots very fast at random enemies. Good against groups. Each ★ makes it shoot faster" |
| sungluc | Revolver | Có | Có | Tạm được | Chữ A2: "One big shot at the first enemy. The bullet hits at once. Tip: add crit or damage support" |
| bang | Frost | Có | "no chain-freeze" mơ hồ → miễn đóng băng 3 s | Tạm được | Chữ A2: "Special: every 6s it Freezes the first enemy for 2s (no damage). Bosses do not Freeze: the…" |
| doc | Venom | Có | Chữ "marks the lead enemy" — sao cao đánh dấu 2 quái | Tạm được | Clip: Dòng cuối "Marks N enemies, every Xs" · Chữ A2: "Special: marks the first enemy for 5s. A marked enemy takes +12% damage from all turrets. …" |
| mana | Mana Core | Có | Có | Tạm được | Chữ A2: "Does not shoot. Makes mana every 7s (faster and more at higher ★). Tip: use the mana to Su…" |
| tia | Sniper | Có | Có | Tạm được | Chữ A2: "Shoots the enemy with the most HP. +100% damage to big enemies and Bosses" |
| set | Tesla | Có | Số thứ tự 1-2-3-4 chỉ hiện 0,45 s → khung chụp không thấy sét nối | Tạm được | Clip: Số thứ tự 0,8 s, chữ 17 px · Chữ A2: "Lightning hits 1 enemy, then jumps to the next. It hits as many enemies as its ★ (4★ = 4 e…" |
| maychem | Guillotine | Có | Có | Tạm được | Chữ A2: "Each shot has a small chance to kill a small enemy at once. Tip: good when many small enem…" |
| phagiap | Armor Breaker | Có | Chữ ghi +13% cố định — thật ra theo sao (4★ +21%) | Khó: exposes | Chữ A2: "Support: every 3s it breaks the armor of the first enemy and the enemy with the most HP. A…" |
| bua | Hammer | Có | Có | Khó: stagger | Chữ A2: "Support: Attack Neighbours (4 sides) get more crit chance and crit damage. Their crits als…" |
| nam | Iron Fist | Có | Có | Tạm được | Chữ A2: "Melee: punches enemies close to it, very fast. Each punch blasts the enemies around the ta…" |
| bomhen | Time Bomb | Có | Có | Tạm được | Chữ A2: "Special: sticks a bomb on a random enemy. The bomb blows up after 5s. Enemies near the bla…" |
| nhanmana | Mana Doubler | Có | Có | Tạm được | Chữ A2: "Merge 2 Mana Doublers: you get a lot of mana at once. Higher ★ gives more mana" |
| kiembang | Ice Blade | Có | Có | Tạm được | Chữ A2: "Deals ×5 damage to slowed enemies (×6 at 3★, ×8 at 7★). Each hit also slows enemies near t…" |
| mimic | Mimic | Có | Có | Khó: Joker | Chữ A2: "Merges with ANY turret of the same ★. The new turret gets +attack for 8s. Tip: use it to f…" |
| chimang | Crit Antenna | Có | Có | Tạm được | Chữ A2: "Support: Neighbours (4 sides) get more crit chance (+6.8% at 1★, +22.5% at 7★). A crit dea…" |
| dichchuyen | Teleporter | Có | Có | Tạm được | Chữ A2: "Drag it onto a same-star turret: the two swap places. Works on Stone and Frozen turrets to…" |
| radar | Radar | Có | Có | Tạm được | Chữ A2: "Support: Neighbours (4 sides) shoot faster (+18% at 1★, +42% at 7★)" |
| drone | Drone Bay | Có | Dòng cuối bị cắt "1 drone per cell dragged +" | Tạm được | Clip: Dòng cuối ngắn "1 drone per cell, +N bonus" · Chữ A2: "Merge 2 Drone Bays: bomb drones fly out. 1 drone for each cell you drag, +1 per 3★ (max 8)…" |
| tron | Fusion Mixer | Có | Chữ ghi 9%/+3%/tối đa 18% — code 6%/+2%/12% × hệ số sao; bỏ số cố định | Tạm được | Chữ A2: "Support: Attack Neighbours (4 sides) shoot faster. More different Attack turrets in its Ro…" |
| nangluong | Energy Cannon | Có | Có | Tạm được | Chữ A2: "The more mana you have, the more damage it deals (+100% per 120 mana, max +500%). Tip: sav…" |
| laser | Laser | Có | Có | Khó: ramps | Chữ A2: "Keeps a beam on 1 enemy. The beam gets stronger, up to ×4 in 3s. A new target starts again…" |
| lanhgia | Chiller | Có | Có | Tạm được | Chữ A2: "Support: hits from Neighbours (4 sides) also slow the enemy (12% at 1★ → 28% at 7★; Bosses…" |
| mortar | Mortar | Có | Có | Tạm được | Chữ A2: "Fires shells at random enemies; each shell blasts an area. Every 3rd shell splits into sma…" |
| khuech | Amplifier | Có | Có | Khó: repeat hits… | Chữ A2: "Support: each time an Attack Neighbour (4 sides) hits the same enemy again, it deals more …" |
| vungdoc | Toxic Pool | Có | Có | Tạm được | Chữ A2: "Throws poison pools on the path. Enemies that walk through take damage over time" |
| loa | Cooldown Horn | Có | Có | Tạm được | Chữ A2: "Merge 2 Cooldown Horns: your Archfiend skill is ready sooner (−12s at 4★). If it is alread…" |
| hutmana | Mana Leech | Có | Có | Tạm được | Chữ A2: "Shoots the first enemy. Each hit gives you a little mana (limit per second)" |
| min | Mine Layer | Có | Có | Tạm được | Chữ A2: "Lays mines on the path. An enemy that steps on a mine makes it explode. Some are star mine…" |
| cuongno | Berserker | Có | Có | Tạm được | Chữ A2: "Each crit adds 1 RAGE. At 2 RAGE it goes into FRENZY: it shoots much faster for 5s. Tip: a…" |
| baotuyet | Blizzard | Có | Có | Tạm được | Chữ A2: "Every few seconds a blizzard slows ALL enemies on the path for 3s and Freezes small ones f…" |
| nhanban | Cloner | Có | Có | Tạm được | Chữ A2: "Merge 2 Cloners: you also get a free 1★ turret (2★ if the Merge makes 3★ or more)" |
| lienket | Chain Link | Có | Có | Tạm được | Chữ A2: "Chain Links that touch (4 sides) make a chain. Each extra link: +40% damage. Stone breaks …" |
| kepha | Jammer | Có | Có | Khó: clamped | Clip: "slows" thay "clamps", số ít/nhiều · Chữ A2: "Merge 2 Jammers. PvP: rival turrets shoot 40% slower. Co-op: your ally's turrets shoot fas…" |
| taylo | Cleanser | Có | Có | Tạm được | Chữ A2: "Support: every 12s it cleans up to 2 Neighbours (4 sides): removes Freeze, Stone and burn.…" |
| hopbi | Mystery Box | Có | Clip + dòng cuối ghi "1–6★" ở 4★ — luật: sàn = sao của hộp → 4–6★ | Tạm được | Clip: Khoảng sao đúng luật (sdHop) · Chữ A2: "Does not shoot. After 58s (46s from 3★) it opens and becomes a random turret of 1–6★, neve…" |
| khien | Shield Gen | Có | "1-hit control shield" mơ hồ → chặn 1 chiêu Trùm / đòn đối thủ | Tạm được | Chữ A2: "Support: Neighbours (4 sides) get a shield. It blocks 1 Boss skill or rival attack, then c…" |
| nangsao | Star Lift | Có | Chữ còn "max +50%" (trần đã bỏ 07/11) | Tạm được | Chữ A2: "Support: all 4 Neighbours shoot faster (+10% per ★). The lowest-star Neighbour gets ×1.5. …" |
| tuthan | Reaper Pillar | Có | Có | Khó: execute / reaped | Chữ A2: "Support: Neighbours (4 sides) may kill a normal enemy at once when its HP is under 30%" |
| xaotron | Scrambler | Có | Có | Tạm được | Chữ A2: "Merge 2 Scramblers. PvP: rival turrets are shuffled into other types. Co-op: lone ally tur…" |
| epxung | Overclock | Có | Có | Tạm được | Chữ A2: "Drag it onto a same-star shooting turret: that turret shoots +90% faster. You can do it ag…" |
| no5 | Fifth Shot | Có | Có | Tạm được | Chữ A2: "Counts its shots. Every 5th shot fires 3 bolts that explode" |
| bao | Storm Gun | Có | Có | Tạm được | Chữ A2: "Hits at once, very fast. Some hits jump to a 2nd enemy. Shoots slower next to another Stor…" |
| anhsang | Lighthouse | Có | Có | Tạm được | Chữ A2: "Light orbs fill up over time. When full, it Summons a free 1★ turret" |
| aten | Purifier | Có | Có | Khó: punishes | Chữ A2: "Deals ×4 damage to poisoned enemies. Enemies it kills explode and hit enemies nearby. Tip:…" |
| dongbo | Sync Cannon | Có | Có | Tạm được | Chữ A2: "Support: EVERY Attack turret with the same ★ anywhere on your board deals more damage (no …" |
| railgun | Railgun | Có | Có | Tạm được | Chữ A2: "Bingo: a full Row of only Railguns = +200% damage. A full Column of only Railguns = +150% …" |
| vughep | Merge King | Có | Có | Tạm được | Chữ A2: "Drag it onto a same-star turret: that turret +1★ and keeps its type. 10% of Merge Kings ar…" |
| sinhdoi | Twin Maker | Có | Có | Tạm được | Chữ A2: "Merge 2 Twin Makers: you also get a random turret of the same ★ (10%: one ★ higher)" |
| hasao | Star Breaker | Có | Có | Dài/nhiều ký hiệu | Chữ A2: "Support: Attack Neighbours (4 sides) deal more damage. First 5★ each wave: Solo: your weak…" |
| saochep | Copycat | Có | Có | Tạm được | Chữ A2: "Drag it onto a same-star turret: it becomes a copy with 70% damage. Works on Stone or Froz…" |
| ngoisao | Star Cannon | Có | Có | Tạm được | Chữ A2: "Counts all ★ on your board now. Every 10★: it shoots faster. Every 50★: more damage. If yo…" |
| soi | Werewolf | Có | Có | Tạm được | Chữ A2: "Melee wolf. Each Summon or Merge has a 30% chance to come out AWAKENED. Awakened: always c…" |
| tienhoa | Evolver | Có | Có | Tạm được | Chữ A2: "Does not shoot. A time bomb counts down, then it becomes a random turret +1★. Higher ★ tak…" |
| cauvong | Rainbow | Có | Có | Dài/nhiều ký hiệu | Chữ A2: "Support: paints a rainbow on the path. Solo: enemies on it take more damage. Co-op: the sa…" |
| orbital | Orbital | Có | Có | Khó: salvos | Chữ A2: "Special: no normal shots. Merge 2 Orbitals: EVERY Orbital on your board wakes up for 23s a…" |
| wallgen | Wall Projector | Có | Có | Tạm được | Chữ A2: "Puts a wall on the path. The wall stops enemies, then explodes. Merge 2 Wall Projectors: a…" |
| blackhole | Black Hole | Có | Có | Tạm được | Chữ A2: "Opens a black hole on the path. It pulls enemies to the middle and crushes them" |
| overlord | Overlord | Có | Có | Tạm được | Chữ A2: "Charges slowly, then fires a huge thunder blast on a group. Small sparks then jump to more…" |
| lophanung | Cryo Reactor | Có | Có | Khó: aura | Chữ A2: "Support: cold air slows enemies near it. Attack Neighbours (4 sides) deal more damage to s…" |
| haoquang | Holy Halo | Có | Có | Tạm được | Chữ A2: "Special: does not shoot. Tap when full: a barrier for 3s. Enemies that get through cost no…" |
| nayda | Ricochet | Có | Số nảy chỉ hiện 0,45 s (tăng 0,8 s) | Tạm được | Clip: như Tesla · Chữ A2: "A disc hits 1 enemy, then bounces to more. Bounces = its ★. Each bounce hits harder" |
| combo | Combo Core | Có | Có | Tạm được | Chữ A2: "Merge 2 Combo Cores: EVERY Combo Core gets +damage for good (Stacks, no cap). Breakthrough…" |
| khoathoigian | Chrono Lock | Có | Dòng cuối bị cắt "Every 6.0s locks the lead non-boss" | Tạm được | Clip: Dòng cuối "Lock Xs, every Ys" · Chữ A2: "Locks the first enemy in time. Damage it takes is saved. When the lock ends, the saved dam…" |
| hydra | Hydra | Có | Số thứ tự nòng chỉ hiện 0,45 s (tăng 0,8 s) | Tạm được | Clip: như Tesla · Chữ A2: "1 barrel per ★. Each barrel shoots a different enemy. At 7★ the barrels join into one big …" |
| cuuvi | Nine-Tail | Có | Có | Khó: homing | Chữ A2: "Each kill grows a fire tail. At 9 tails it fires 9 foxfires that chase enemies. Breakthrou…" |
| pandora | Pandora Vault | Có | Có | Tạm được | Chữ A2: "Merge 2 Pandora Vaults: the vault opens 1 of 6 big effects (mana, Freeze all, +1★, bombs, …" |
| luoicheo | Resonance Grid | Có | Có | Tạm được | Chữ A2: "Support: buffs the 4 DIAGONAL cells (corners), not the 4 sides. All 4 diagonals filled = R…" |
| ngaithoigian | Chrono Throne | Có | Có | Tạm được | Chữ A2: "Enemies on the path get slower over time. From 3★, tap when full: REWIND pushes all enemie…" |
| nemesis | Nemesis | Có | Có | Khó: executes | Chữ A2: "Kills normal enemies at once when their HP is low. On Bosses, every 10 hits takes a % of t…" |
| docton | Lone Ace | Có | Có | Tạm được | Chữ A2: "Alone is best: with no Neighbours (4 sides empty) it shoots ×2 faster and crits more" |
| thaukinh | Focus Lens | Có | Có | Tạm được | Chữ A2: "Support: Neighbours (4 sides) deal more crit damage. Their crits go through to the enemy b…" |
| nhieusong | Signal Jammer | Có | Có | Tạm được | Chữ A2: "Merge 2 Signal Jammers. PvP: rival turrets shoot 40% slower for a few seconds. Co-op: your…" |
| santhuong | Bounty Beacon | Có | Clip trượt sự kiện mana (quái to quá trâu, không chết kịp) | Tạm được | Clip: Quái to 2 phát, nạp 95% · Chữ A2: "Marks an enemy (big ones first). When a marked enemy dies, you get bonus mana" |
| nhatthuc | Eclipse | Có | Có | Tạm được | Chữ A2: "Day: a beam that burns. Night: a wave that slows. Changes every 8s" |
| loren | Scrap Forge | Có | Có | Khó: gun | Chữ A2: "Special (original): FEED it a 1–3★ turret (drag onto it). Your best Attack turret gets +da…" |
| guongcong | Mirror Gate | Có | Có | Khó: Clamp | Chữ A2: "Support (original): Neighbours (4 sides) resist control. Every 20s: Solo: blocks 1 Boss sk…" |
| marionette | Marionette | Có | Có | Khó: takes control | Chữ A2: "Grabs an enemy and makes it walk back. It hits other enemies on the way, then explodes" |
| chuato | Hive Queen | Có | Có | Tạm được | Chữ A2: "Makes hunter drones that attack enemies. From 3★, tap when full: SWARM — all drones dive a…" |
| leviathan | Leviathan | Có | Dòng cuối bị cắt "Whirlpool tag under the cell =" | Khó: whirlpool tag | Clip: Dòng cuối "ABYSS: +4% damage each, no cap"; câu "Each eat: ABYSS +1" · Chữ A2: "Eats small enemies to get ABYSS points: +4% damage each (no cap). Each Leviathan keeps its…" |
| khoisinh | Genesis Core | Có | Có | Tạm được | Chữ A2: "Gives your lowest turret +1★ every 30s. From 3★, tap when full: GENESIS Summons new turret…" |
| ronglua | Wyrm Engine | Có | Có | Tạm được | Chữ A2: "Breathes a cone of fire that burns groups. From 3★, tap when full: DRAGON DIVE flies down …" |
| lualien | Ember Relay | Có | Clip không chỉ rõ hàng/cột nào nhận lửa, ô lệch hàng không có gì | Tạm được | Clip: Mũi tên chạy dọc hàng + cột, "+1" xanh trên Relay nhận lửa, "✗" đỏ trên Relay lệch, số lửa TO mỗi Relay · Chữ A2: "Merge 2 Ember Relays: EVERY Relay in the same Row and Column +1 flame. Each flame: +damage…" |
| hopca | Quantum Choir | Có | Có | Tạm được | Chữ A2: "+damage for each other turret on your board with the same ★ (no cap). Other ★ don't count.…" |
| xuonganh | Hero Foundry | Có | Có | Tạm được | Chữ A2: "Merge 2 Hero Foundries: a random cell becomes a HERO tile for 12s. The turret on it shoots…" |
| luutru | Fusion Archive | Có | Có | Tạm được | Chữ A2: "Every Merge you make adds 1 charge: +damage for good (no cap). Archive + Archive fires 3 b…" |
| mauhut | Blood Circuit | Có | Có | Dài/nhiều ký hiệu | Chữ A2: "Special: drag it onto ANY of your turrets (not a Blood Circuit). Both become 1 random turr…" |
| nguyenrua | Hex Saboteur | Có | Có | Tạm được | Chữ A2: "Merge 2 Hex Saboteurs: a hex flies out. PvP: a rival turret may lose 1★. Co-op: an ally tu…" |
| bienmau | Prism Thief | Có | Có | Tạm được | Chữ A2: "Shots change colour: red burns, gold crits, blue slows. Merge 2 Prism Thieves of the same …" |
| thanhdia | Sanctum | Có | Có | Tạm được | Chữ A2: "Support: when it arrives, it cleans and shields its Neighbours (4 sides). Attack Neighbour…" |

## Còn lại / chưa làm
- Dòng chi tiết `SKILLS[id].mo(T)` (skills*.js) CHƯA viết lại: các tệp này đang có thay đổi chưa commit của session jackpot → để sau (vd "VS EXPOSED", "lead enemy", "Aura ×…"). Clip đã lọc "lead/exposed/Aura" khi hiện.
- Clip vẫn hơi khó thấy: Overlord (đòn sấm ra trễ hơn câu), Marionette (quái bị tóm nhỏ), Dice Gun (lúc chí mạng 300%), Mortar (đạn chùm). Màn ngang 844×390 khung Test range nhỏ (bố cục trang, không đổi).
- Chữ jackpot / Pháo La Bàn lên Vàng do session jackpot viết — chỉ đổi câu kỹ năng Pháo La Bàn (luật mũi tên + số, không đụng phần jackpot).
