# ChatGPT — làm lại kỹ năng theo QUYẾT ĐỊNH người chơi (07/11/2026)

Nguồn: ChatGPT (Chrome của người dùng, chế độ Thinking High), chat "Design Merge Mechanics". Đầu vào: [DS-LAP.md](DS-LAP.md), luật nguyên văn Pháo La Bàn + Ember Relay (thap/js/skills.js, vangmoi1.js). Nguyên văn tiếng Anh, chỉ đổi định dạng bảng. CHƯA ÁP DỤNG.

## Câu hỏi 1 (tóm tắt)
Thiết kế ≥15 cơ chế cùng tinh thần Pháo La Bàn (thuộc tính từng bản + phép tính khi ghép) và Ember Relay (hiệu ứng toả theo hàng/cột từ ô ghép), rồi gán cho 21 ụ lặp trong DS-LAP.md; mỗi ụ: trục, luật chính xác, mốc sao, độ khó, thưởng theo nguyên tắc, quyết định, PvP, ≤3 dấu hiệu trên điện thoại.

## Trả lời 1

TURRET MERGE — Radical Mechanics Redesign

21 turrets • 17 mechanics-library concepts • 4 additional decision systems • LV9 balancing

#### Design philosophy

The two reference mechanics establish what makes a merge-TD unit strategically interesting:

Compass Cannon: Two copies of the same turret are not interchangeable. Their attributes and the direction of the merge change the outcome.

Ember Relay: The cell where a merge happens changes the value of other units already on the board.

The redesign will preserve four principles:

A stronger turret is something the player engineers, not simply something the player summons.

Source → target matters. Dragging A onto B can produce a different result from dragging B onto A.

Board space is an economic resource. An empty cell, a particular column, or an intact pair of turrets can be worth more than an immediate merge.

Difficult conditions pay substantially more. A successful three-unit formation or precise merge should produce a visibly stronger reward than an unconditional stat bonus.

I would eliminate passive, always-on slow stacking as the main identity of these 21 units. Control effects may remain, but they serve the new puzzle mechanics.

#### Shared implementation contract

The following conventions apply throughout both parts.

| System | Exact rule |
|---|---|
| Board | 5 columns × 3 rows; coordinates (c,r), top-left (1,1), bottom-right (5,3) |
| Source / target | S = dragged unit; T = destination unit |
| Native merge | Two identical redesigned turrets of the same star k, where k < 7, produce that same turret at k+1 in T's cell |
| Normal merge | Existing random-deck result remains available through the game's other merge interactions |
| Attributes | Rolled from seeded RNG on ordinary summons; native merges use their explicit formulas |
| Persistent counters | No hard maximum; counters are inherited only as specified |
| Buffs | Damage %, attack rate %, and crit damage percentage points are additive to existing bonuses before the normal damage pipeline |
| Overlapping effects | Multiple applications of the same named formation bonus use the strongest one, not multiplicative copies |
| PvP | All rolls, decisions, expirations, and geometrical checks resolve through deterministic simulation ticks |

Unless specified otherwise, special merge rewards occur only on player-initiated native merges. Boss FORCE MERGE, Mimic, and other external transformations do not accidentally generate free summons or trigger merge jackpots. Merge King preserves the destination's state without performing a new native merge operation.

Copycat can reproduce an attribute and its persistent combat counter, but cannot duplicate stored production charges, pending rewards, or elapsed economy timers.

For non-attacking Support and Special turrets, an attack-stat reward applies to the explicitly named allied Attack units, not to the Support itself.

#### PART 1 — Mechanics library

These are 17 distinct mechanics built from per-copy variables, merge arithmetic, directional choices, board geometry, and formation puzzles. Each has a proposed roster assignment, but the mechanic itself is reusable.

### M01. Polar Seam — polarity and merge alignment

Proposed: Frost · Difficulty 3/5

Per-copy attribute: North or South polarity, 50/50.

Merge arithmetic: Same polarity gives the result +1 Stitch. Opposite polarity gives +2 Stitches when merging in the same column, otherwise +1. Result keeps T's polarity; its Stitch count becomes max(S,T) + gained.

Geometry/reward: Opposite-polarity, same-column merge activates a 6-second Polar Seam. Allied Attack turrets in the destination column gain +70% damage, +25% attack rate, +90% crit damage. Every persistent Stitch adds +4% damage against Frost-controlled enemies for attackers in that column.

Star 3/5/7: Seam lasts 8 seconds / +20% damage to its active bonus / every second perfect Seam also influences both adjacent columns for 3 seconds.

Decision: Search for opposite-polarity copies, then decide whether to preserve their column alignment or merge immediately.

Counterplay: SCRAMBLE or PETRIFY can destroy the prepared alignment; merge promptly before the boss.

Phone indicators: N/S badge, Stitch count, thin highlighted column.

### M02. Fang Parity — arithmetic with odd and even numbers

Proposed: Ice Blade · Difficulty 4/5

Attribute: An integer Tooth value rolled from 1, 2, or 3.

Merge arithmetic: Opposite parity: new Tooth = T + S. Same parity: new Tooth = |T − S| + 2. Tooth values are uncapped.

Geometry/reward: A merge of opposite parity achieves Perfect Edge if the resulting Tooth parity equals (column + row) mod 2 of T's cell. For 7 seconds, the resulting attacker gains +115% damage, +35% rate, +140% crit damage. Additionally, each Tooth permanently adds +3% damage against chilled targets.

Star 3/5/7: +20% additional Perfect Edge damage / one extra piercing target / +40% crit damage while Perfect Edge is active.

Decision: Merge for a big number or deliberately reduce the Tooth value to manipulate parity; target-cell color becomes important.

Counterplay: FORCE MERGE removes copies before a perfect combination; retain an alternate pair.

Indicators: Tooth number, two-tone tile-parity outline, active blade glow.

### M03. Tone Triad — completing three distinct variants

Proposed: Chiller · Difficulty 4/5

Attribute: Tone A, B, or C.

Merge arithmetic: Equal tones preserve the tone and add one Overtone; two different tones produce the missing third tone and add two Overtones. The result inherits max(S,T) Overtones before the increment.

Geometry/reward: Three Chillers with A+B+C in one row create a Triad. Attack turrets in that row receive +120% damage, +35% rate, +145% crit damage. Only two distinct tones give a smaller +25% damage/+8% rate. Each Overtone on the weakest contributing Chiller adds +4% damage to the full Triad.

Star 3/5/7: +8 percentage points crit chance / Triad additionally covers orthogonally adjacent Attack cells / +40% crit damage to Triad recipients.

Decision: Decide which tone to eliminate and which new tone to construct, while spending three of five row cells on Supports.

Counterplay: Losing any one tone to PETRIFY or SCRAMBLE breaks the Triad.

Indicators: A/B/C badge, three-node row line, Overtone number.

### M04. Wind Shear — constructing a storm through two coordinates

Proposed: Blizzard · Difficulty 4/5

Attribute: North, East, South, or West wind direction.

Merge arithmetic: Perpendicular directions rotate T's wind one 90° step clockwise. Parallel or opposite directions retain T's wind.

Geometry/reward: Perpendicular wind merge with S.row ≠ T.row and S.column ≠ T.column creates an L-shaped storm front along S's row and T's column for 8 seconds. Blizzard gains +110% damage, +35% rate, +140% crit damage, and emits three damaging storm pulses at 0, 2, and 4 seconds; each pulse deals 150% of its normal hit to enemies in the corresponding projected path zones. An imperfect merge gives one 100% pulse only.

Star 3/5/7: Fourth storm pulse at 6 seconds / front lasts 10 seconds / +40% crit damage during the front.

Decision: Select both wind relationship and the two cell coordinates. The destination alone does not determine the storm.

Counterplay: FREEZER suppresses Blizzard's attack-rate reward; a boss shuffle can remove the pair before the merge.

Indicators: Arrow, L-shaped targeting trace, duration ring.

### M05. Zero Hour — exact-subtraction merge

Proposed: Chrono Lock · Difficulty 4/5

Attribute: Dial value 1, 2, or 3.

Merge arithmetic: new Dial = |T.dial − S.dial|; zero is a valid permanent Dial value. Combine stored damage from both materials.

Geometry/reward: Equal Dial values merged from the same row, with at least one cell between S and T, trigger Perfect Zero Hour: immediately release 3× combined stored damage against the current lead enemy. For 6 seconds, attacks against that marked enemy gain +120% damage, +35% rate, +140% crit damage. A zero outside this alignment releases only 1.5× stored damage and +25% damage on the target.

Counter: Each Perfect Zero adds one Echo, providing +5% additional future release damage per Echo.

Star 3/5/7: Base lock becomes 2 seconds / perfect release multiplier becomes 4× / +40% crit damage against the marked enemy.

Decision: Match equal values and correct positions, or merge different values now to create the Dial needed for a later zero.

Counterplay: SNIPE disrupts equal-star merging; PETRIFY can remove a prepared Dial.

Indicators: Dial digit, zero-hour ring, Echo count.

### M06. Mirror Equinox — sacrificing a mirrored pair

Proposed: Eclipse · Difficulty 5/5

Attribute: Birth Aspect = Sun or Moon. This is separate from Eclipse's existing automatic Day/Night combat cycle.

Merge arithmetic: Same Aspect: result keeps T's Aspect and gains one Horizon stack. Opposite Aspect: keeps T's Aspect and gains two Horizon stacks. Stack inheritance uses max(S,T).

Geometry/reward: Merge opposite Aspects at horizontal mirror positions in the same row, where S.column + T.column = 6. This triggers a 10-second Equinox: +200% damage, +50% attack rate, +230% crit damage. Opposite Aspects without a mirrored placement give +55%/+20%/+60% for 8 seconds.

Persistent reward: Each Horizon stack grants +5% damage and +3% crit damage.

Star 3/5/7: Day burn lasts +2 seconds / Equinox beams gain one extra path target / during Equinox, the unit fires Day and Night attacks simultaneously every 8 seconds.

Decision: Preserve a mirrored Sun–Moon pair for sustained coverage or consume that pair to produce a huge temporary spike.

Counterplay: SCRAMBLE, FORCE MERGE, or PETRIFY can ruin one mirror cell.

Indicators: Sun/Moon crest, mirror tether, Horizon number.

### M07. Anvil Corner — making an L-shaped stat puzzle

Proposed: Hammer · Difficulty 4/5

Attribute: Stamp 1, 2, or 3.

Merge arithmetic: new Stamp = |T.stamp − S.stamp| + 1. Heat inherits max(S,T) and increases by 2 for a same-row merge exactly two columns apart, otherwise by 1.

Geometry/reward: Hammer must have two Attack neighbours forming a 90° L: one horizontal and one vertical. Their star difference must equal Hammer's Stamp. Both gain +115% damage, +35% rate, +145% crit damage; each Heat adds +4% crit damage to these two units. If several pairs qualify, choose the pair with lowest ordered cell IDs.

Star 3/5/7: +8 percentage points crit chance / each Heat becomes +6% crit damage / +30% damage to the two chosen attackers.

Decision: Work backward from neighbouring units' star difference, then manufacture the right Stamp.

Counterplay: Boss star theft changes the equation; a petrified neighbour removes one arm of the L.

Indicators: Stamp digit, illuminated L, Heat number.

### M08. Frequency Bridge — matching antennas across an attacker

Proposed: Crit Antenna · Difficulty 3/5

Attribute: Frequency 1, 2, or 3.

Merge arithmetic: Same frequency retains it and adds one Signal stack. Different frequencies produce the missing frequency among 1/2/3 and add two Signals. Inheritance is max(S,T).

Geometry/reward: Two Antennas of equal frequency, exactly two columns apart in the same row, with an Attack turret between them, establish a bridge. The middle attacker gains +75% damage, +20% rate, +95% crit damage, +12 percentage points crit chance. Each Signal on the weaker contributing Antenna adds +3% crit damage.

Star 3/5/7: +4 points crit chance / also permits endpoints four columns apart, giving +120% damage/+30% rate/+140% crit damage to the central attacker / +40% crit damage on a successful bridge.

Decision: Maintain equal-frequency endpoints rather than simply surrounding an attacker with more Supports.

Counterplay: PETRIFY either endpoint or the center; SNIPE can lower an Antenna below its useful star perk.

Indicators: Frequency digit, one bridge line, Signal number.

### M09. Reagent Sandwich — a two-sided chemistry recipe

Proposed: Fusion Mixer · Difficulty 4/5

Attribute: Reagent A, B, or C.

Merge arithmetic: Identical reagents retain their letter and add one Catalyst. Different reagents produce the missing third letter and add two Catalysts. Inheritance uses max(S,T).

Geometry/reward: Two Mixers must directly bracket a single Attack turret horizontally or vertically. Different reagents activate a recipe: the Attack receives +105% damage, +30% rate, +140% crit damage. Matching reagents give only +25%/+10%/+30%. Each Catalyst on the weaker Mixer adds +2% attack rate.

Star 3/5/7: Successful recipe receives +10% damage / Attack gains one additional projectile at 30% normal damage / +60% crit damage.

Decision: Build the correct bracketing formation, then decide which reagent to retain and which to synthesize through merging.

Counterplay: A stone or forced merge in the middle breaks the recipe; losing a Mixer removes the bonus.

Indicators: Reagent letter, two-sided bracket line, Catalyst count.

### M10. Counterweight — matching a star-sum equation

Proposed: Star Lift · Difficulty 4/5

Attribute: Weight 1, 2, or 3.

Merge arithmetic: new Weight = |T.weight − S.weight| + 1. Leverage inherits max(S,T) and increases by two for a same-column merge, otherwise by one.

Geometry/reward: Select exactly two orthogonally adjacent Attack turrets whose stars satisfy A.star + B.star = Lift.star + Weight. These two receive +110% damage, +35% rate, +140% crit damage. Each Leverage adds +3% attack rate. Resolve multiple pairs by lowest ordered cell IDs.

Star 3/5/7: +10 percentage points crit chance / +30% damage on a balanced pair / a third neighbour with star equal to Weight receives half the pair's damage/rate/crit-damage bonus.

Decision: Choose whether to upgrade Star Lift or its neighbours, because either action can break the equality.

Counterplay: SNIPE or Star Leech changes a neighbouring star total; a stone prevents that unit from participating.

Indicators: Weight number, two balance arms, Leverage count.

### M11. Double Focus — two equal-star targets on opposite rays

Proposed: Focus Lens · Difficulty 5/5

Attribute: Facet orientation: horizontal, vertical, diagonal /, or diagonal \.

Merge arithmetic: Same facet: T retains its direction and gains one Polish. Different facets: T takes S's direction and gains two Polish. Inheritance uses max(S,T).

Geometry/reward: The first occupied cell along each opposite ray must contain an active Attack turret, and both attackers must have equal star level. Empty cells transmit the ray; any stone or different turret blocks it. Both attackers gain +185% damage, +45% rate, +220% crit damage and crits pierce one additional enemy. Each Polish adds +4% crit damage.

Star 3/5/7: +10 points crit chance / a star difference of exactly one also activates a half-strength damage/rate/crit-damage bonus, without the piercing effect / +60% crit damage on a perfect equal-star pair.

Decision: Choose the facet through merge direction and invest in two equal-star guns rather than upgrading one independently.

Counterplay: SNIPE breaks equality; PETRIFY or a strategically placed obstruction cuts a ray.

Indicators: Facet icon, two rays, Polish number.

### M12. Target Gene — programmable cloning

Proposed: Cloner · Difficulty 3/5

Attribute: Gene 1–5, corresponding exactly to a position in the player's five-card deck.

Merge arithmetic: The result's Gene becomes S's Gene. The offspring type is determined by T's original Gene. Imprint becomes max(S,T)+1 if Genes differ; otherwise max(S,T).

Geometry/reward: A native merge opens a 3-second placement window. Select an empty cell in T's row or column to spawn a 1-star turret of the encoded deck type. When Genes differ and the chosen destination is at least two grid steps from T, the newborn Attack receives +65% damage, +20% rate, +85% crit damage for 8 seconds, plus +3% damage per Imprint.

Star 3/5/7: Placement window 5 seconds / qualifying offspring spawns at 2 stars / +30% crit damage to qualifying offspring.

Decision: Choose which Gene is the target, which is dragged, where to place the child, and whether to hold the merge until a better cell opens.

Counterplay: Block available cells, scramble a Gene-bearing unit, or petrify the Cloner before merging.

Indicators: Deck-slot glyph, placement-ray preview, Imprint number.

### M13. Mirror Cast — cloning through a positional sacrifice

Proposed: Twin Maker · Difficulty 5/5

Attribute: Left or Right Seal.

Merge arithmetic: Opposite-Seal native merges at horizontally mirrored cells, with S.column + T.column = 6 and the same row, unlock Mirror Cast. Other merges still keep the Twin Maker type and increase its star but yield no offspring. The result retains T's Seal.

Geometry/reward: Within 3 seconds, choose an existing Attack turret of the same star k as the consumed Twin Makers, at Manhattan distance ≤2 from T. Create a new k-star copy of that Attack in the vacated S cell. Re-roll the clone's attributes and reset its counters. Both original and clone gain +200% damage, +50% rate, +240% crit damage for 8 seconds.

Star 3/5/7: Selection window 5 seconds / eligible donor distance extends to 3 / a successful 6→7-star native merge also gives allied Attack turrets +20% rate for 8 seconds.

Decision: Position two rare same-star supports symmetrically, find an eligible donor, and choose which valuable attacker to duplicate.

Counterplay: FORCE MERGE, SNIPE, or PETRIFY can break the three-unit setup.

Indicators: L/R Seal, mirror line, pending clone outline.

### M14. Growth Transfer — deterministic evolution by timing

Proposed: Evolver · Difficulty 3/5

Attribute: Season 1, 2, or 3.

Merge arithmetic: Result retains T's Season. new Growth = T.Growth + floor(S.Growth/2) + bonus, where the bonus is 10 for matching Seasons, 20 for different Seasons merged across different rows, or zero otherwise.

Geometry/reward: Growth increases by 1 per active second, with +1 additional per second if at least one Attack unit of equal star shares its column. At 45 Growth, choose a deck slot and transform into that turret at +1 star (maximum 7). A chosen Attack receives +65% damage, +20% rate, +80% crit damage for 8 seconds. Growth is uncapped until spent.

Star 3/5/7: Growth threshold becomes 40 / 35 / 30. At star 7, transformation retains star 7.

Decision: Determine which unit to evolve into, when to cash out, and whether a merge that transfers stored growth is worth consuming two copies.

Counterplay: PETRIFY or freeze pauses growth; SCRAMBLE removes the Evolver and its banked progress.

Indicators: Season number, growth gauge, chosen-output selector.

### M15. Safe Code — unlocking a calculated rarity

Proposed: Mystery Box · Difficulty 5/5

Attribute: Dial digit 1–6.

Merge arithmetic: new Dial = ((T.dial + 2×S.dial − 1) mod 6) + 1. Its timer inherits T.elapsed + floor(S.elapsed/2), up to the current opening threshold.

Geometry/reward: After 58 seconds, choose one occupied key cell in the same row or column. Let B be the number of occupied cells strictly between Box and key. Calculate Score = Dial + Key.star + B. Output deck slot ((Dial + Key.star − 2) mod 5)+1 at star max(Box.star, min(6, 1 + floor(Score/3))), never exceeding 7. At Score ≥15, a produced Attack gets +220% damage, +55% rate, +250% crit damage for 10 seconds.

Star 3/5/7: Opening threshold becomes 52 / 46 / 40 seconds.

Decision: Choose target Dial through ordered merges, select the key unit, and arrange occupied intervening cells to increase the reward.

Counterplay: SNIPE the key to reduce Score; petrification pauses the timer; SCRAMBLE can erase a Box entirely.

Indicators: Dial digit, countdown ring, key/Score preview.

### M16. Beam Post — targeted production along a ray

Proposed: Lighthouse · Difficulty 3/5

Attribute: Signal deck slot 1–5 plus a bearing N/E/S/W.

Merge arithmetic: Result keeps T's Signal and adopts S's bearing. Stored Orbs become max(S.Orbs,T.Orbs)+2 if S's bearing points directly toward T in the same row or column; otherwise max(S.Orbs,T.Orbs)+1.

Geometry/reward: Lighthouse is still an Attack turret. Every 24 seconds of active operation it accumulates one Orb. Spend one to spawn a chosen-location 1-star turret of its Signal deck type in an empty cell along its bearing ray, with stones blocking the ray. A qualifying Attack child spawned at distance ≥2 receives +65% damage, +20% rate, +80% crit damage for 8 seconds.

Star 3/5/7: Orb accumulation time becomes 20 seconds / spend two Orbs to make a 2-star child / +40% crit damage to a distance-≥2 Attack child.

Decision: Set the production type by destination choice, set the firing direction by source choice, and leave future deployment spaces open.

Counterplay: PETRIFY a ray cell or fill it with stone; FREEZER pauses Lighthouse's active-operation clock.

Indicators: Signal+bearing badge, Orb count, projected ray.

### M17. Reverse Current — polarity-dependent circuit construction

Proposed: Tesla · Difficulty 3/5

Attribute: Positive or Negative polarity.

Merge arithmetic: Matching polarities preserve T's polarity and give max(Capacitors)+1. Opposite polarities switch the result to S's polarity and give max(Capacitors)+3.

Geometry/reward: Two opposite-polarity Teslas in the same row or column, with every cell between them empty, form a Circuit. Both gain +70% damage, +25% rate, +85% crit damage while the connection exists. Each Capacitor adds +2% chain damage. Base Tesla attacks up to 3 + Capacitors distinct enemies, with successive jumps dealing 70% of the previous hit.

Star 3/5/7: +1 initial chain target / secondary 35%-strength chain every 4 seconds / +40% crit damage while a Circuit is active.

Decision: Build a complementary pair without filling the connecting gap, or sacrifice one copy to manufacture a higher-Capacitor Tesla.

Counterplay: Stones break the path; SCRAMBLE changes the turret type; FREEZER disables the frozen endpoint while active.

Indicators: +/- polarity, thin Circuit tether, Capacitor count.

#### Part 1 — Difficulty and payoff comparison

These are the intended full-condition LV9 bonuses, before star perks and persistent counters. Each row describes a distinct condition, not a freely stackable passive buff.

| Mechanic | Difficulty | Damage | Attack rate | Crit damage |
|---|---|---|---|---|
| Polar Seam | 3 | +70% | +25% | +90% |
| Fang Parity | 4 | +115% | +35% | +140% |
| Tone Triad | 4 | +120% | +35% | +145% |
| Wind Shear | 4 | +110% | +35% | +140% |
| Zero Hour | 4 | +120% | +35% | +140% |
| Mirror Equinox | 5 | +200% | +50% | +230% |
| Anvil Corner | 4 | +115% | +35% | +145% |
| Frequency Bridge | 3 | +75% | +20% | +95% |
| Reagent Sandwich | 4 | +105% | +30% | +140% |
| Counterweight | 4 | +110% | +35% | +140% |
| Double Focus | 5 | +185% | +45% | +220% |
| Target Gene | 3 | +65% | +20% | +85% |
| Mirror Cast | 5 | +200% | +50% | +240% |
| Growth Transfer | 3 | +65% | +20% | +80% |
| Safe Code | 5 | +220% | +55% | +250% |
| Beam Post | 3 | +65% | +20% | +80% |
| Reverse Current | 3 | +70% | +25% | +85% |

Important distinction: A 5/5 mechanic does not merely receive higher percentages. It demands a significantly harder condition: matching attributes, correct star values, spatial alignment, or the deliberate sacrifice of board capacity.

For example, Mirror Cast's +200% damage reward is attached to duplicating a specific same-star attacker through a mirrored three-unit setup. It is not a passive +200% damage bonus on every Twin Maker.

#### PART 2 — Exact assignments to all 21 turrets

The 17 library concepts are assigned once each. Four additional mechanics—Thermal Triangle, Paradox Mirror, Knight Surge, and Bankshot Corridor—complete the roster.

Each turret has exactly one primary design axis. The maximum is four turrets per axis.

A. Ice / slow / time family
### 1. Frost (White, Special) — POLAR SEAM

Axis: Merge choices — opposite-polarity merges aligned in one column. Uses M01.

Exact rule (LV9 numbers, durations, stacks, what breaks it): Frost retains its 2-second lead-enemy freeze every 6 seconds. N/S polarity is seeded on summon. Native merges give +1 Stitch for matching polarity, +2 for opposite polarity in the same column, and +1 for opposite polarity elsewhere. The result keeps T's polarity and max(S,T) Stitches plus the earned increment. Every Stitch gives allied Attack turrets in its column +4% damage against Frost-controlled targets. A perfect opposite-polarity same-column merge activates a 6-second Seam.

Star perks 3/5/7: Seam lasts 8 seconds / +20% Seam damage / every second perfect Seam spreads its bonus to adjacent columns for 3 seconds.

Difficulty 3/5 and reward: +70% damage, +25% attack speed, +90% crit damage to allied Attack turrets in the Seam column.

What the player must think about: Is it better to keep two Frosts freezing targets independently or combine their polarities at the correct destination?

PvP counterplay: SCRAMBLE removes the planned merge material; FREEZER pauses Frost's regular freeze timer. Protect by preserving an alternate polarity copy.

Phone readability: N/S badge, Stitch number, glowing column.

### 2. Ice Blade (Blue, Attack) — FANG PARITY

Axis: Merge choices — integer arithmetic and checkerboard parity. Uses M02.

Exact rule: Every copy starts with Tooth 1–3. Opposite parity adds the two Tooth values; matching parity produces |T−S|+2. A merge with opposite parity gains Perfect Edge only when the result's parity matches (column+row) mod 2 at T. It lasts 7 seconds. Every Tooth adds +3% permanent damage against chilled enemies. Its old slowed-target multiplier is replaced with a modest unconditional +30% damage against slowed targets so control is useful but not the primary strategy.

Star perks 3/5/7: +20% Perfect Edge damage / +1 pierced enemy / +40% Perfect Edge crit damage.

Difficulty 4/5 and reward: Perfect Edge grants +115% damage, +35% attack speed, +140% crit damage.

What the player must think about: A larger Tooth number is not automatically optimal. Sometimes subtracting down to a smaller value makes the next merge's parity work.

PvP counterplay: Star reduction can block the intended merge; SCRAMBLE destroys Tooth preparation. An independently prepared odd/even pair offers insurance.

Phone readability: Large Tooth number, subtle light/dark checkerboard cue on target cells, sword glow.

### 3. Chiller (Blue, Support) — TONE TRIAD

Axis: Per-copy variants — three-tone synthesis. Uses M03.

Exact rule: Chillers spawn A/B/C. Different-tone native merges synthesize the missing tone and add two Overtones; same-tone merges retain tone and add one. Overtones inherit by maximum. A row containing all three active tones provides a Triad bonus to allied Attack turrets in that row, plus +4% damage per Overtone on the lowest-stack contributing Chiller. Two distinct tones provide only +25% damage and +8% rate. Its old 12–28% slow application is retained as a minor status effect and obeys the global strongest-slow rule.

Star perks 3/5/7: +8 points crit chance / Triad reaches orthogonally adjacent Attack cells / +40% crit damage.

Difficulty 4/5 and reward: Complete A+B+C Triad grants +120% damage, +35% attack speed, +145% crit damage.

What the player must think about: Three Supports consume most of a row. The player must judge when their boost to the remaining attackers justifies the space.

PvP counterplay: PETRIFY one Chiller and the Triad disappears. Keep differently toned copies outside the critical row until the construction is ready.

Phone readability: A/B/C badges, continuous three-node line, Overtone number.

### 4. Blizzard (Purple, Attack) — WIND SHEAR

Axis: Placement — source-row and target-column geometry. Uses M04.

Exact rule: Each Blizzard rolls one cardinal wind direction. A perpendicular native merge rotates T's direction clockwise. If the merging cells differ in both row and column, the result projects an L-shaped front across S's row and T's column for 8 seconds. It deals three 150%-strength area pulses at 0, 2, and 4 seconds and receives a temporary offensive boost. Nonqualifying merges give one 100% pulse. Blizzard also retains a 30% area slow for 1 second on pulse hits, without stacking with stronger slow.

Star perks 3/5/7: Fourth pulse at 6 seconds / 10-second front / +40% crit damage while the front exists.

Difficulty 4/5 and reward: Qualifying front gives Blizzard +110% damage, +35% attack speed, +140% crit damage.

What the player must think about: The source and destination form two different coordinates. A good merge can attack enemy traffic in two parts of the U-path.

PvP counterplay: FREEZER temporarily suppresses attack output; scrambling one direction prevents precise front construction.

Phone readability: Cardinal arrow, L-shaped board trace, active timer ring.

### 5. Chrono Lock (Purple, Special) — ZERO HOUR

Axis: Merge choices — exact-subtraction arithmetic with stored damage. Uses M05.

Exact rule: Copies roll Dial 1–3. Every 8 seconds, Chrono Lock holds the lead enemy for 1.6 seconds and records actual incoming damage during the hold. On native merge, result Dial becomes |T−S| and stored damage is combined. An equal-Dial merge in the same row separated by at least one cell releases 3× stored damage, marks the lead enemy for 6 seconds, and increments Echo by one. Each Echo increases subsequent release damage by 5%. An equal-Dial merge without that geometry releases only 1.5× and grants the lesser +25% damage mark. After either release, stored damage resets to zero.

Star perks 3/5/7: Lock becomes 2 seconds / perfect burst becomes 4× / +40% crit damage against marked enemies.

Difficulty 4/5 and reward: Perfect Zero Hour marks the target for +120% allied damage, +35% allied attack speed, +140% allied crit damage for 6 seconds.

What the player must think about: Wait for greater stored damage and exact Dial equality, or spend the merge now before a dangerous boss?

PvP counterplay: SNIPE makes a planned same-star merge illegal; PETRIFY removes stored damage from combat. The player can prebuild an equal-Dial backup.

Phone readability: Dial number, stored-damage ring, Echo number.

### 6. Eclipse (Gold, Attack) — MIRROR EQUINOX

Axis: Links — mirrored Sun/Moon pairs and sacrificial merging. Uses M06.

Exact rule: Each Eclipse spawns with immutable Sun or Moon Birth Aspect and continues alternating Day and Night attacks every 8 seconds. Same-Aspect native merges add one Horizon; opposite Aspects add two, with maximum counter inheritance. Each Horizon permanently adds +5% damage and +3% crit damage. Merging opposite Aspects from horizontally mirrored cells of the same row activates a 10-second Equinox. Nonmirrored opposite-Aspect merges trigger only the lesser 8-second bonus.

Star perks 3/5/7: Day burn +2 seconds / Equinox beam hits one extra path target / every 8 seconds during Equinox, fire both Day and Night attacks instead of just the current phase.

Difficulty 5/5 and reward: Perfect Equinox +200% damage, +50% attack speed, +230% crit damage. Imperfect opposite merge +55%/+20%/+60%.

What the player must think about: Two powerful mirrored units may be worth keeping. Consuming them trades sustained fire for a boss-killing window.

PvP counterplay: SCRAMBLE one Eclipse or PETRIFY one mirror cell. The defender can deliberately merge immediately before the next boss activation.

Phone readability: Sun/Moon symbol, mirror tether, Horizon number.

### 7. Cryo Reactor (Red, Support) — THERMAL TRIANGLE

Additional mechanic · Not duplicated from Part 1

Axis: Placement — socket orientation plus an exact star-sum puzzle.

Exact rule (LV9 numbers, durations, stacks, what breaks it): Each Reactor spawns with a seeded socket pointing NE, NW, SE, or SW. The socket identifies two orthogonally adjacent cells forming an L, for example NE means the cells directly north and east. If both cells contain active Attack turrets and AttackA.star + AttackB.star = Reactor.star + 3, the socket is Balanced. Native merging identical socket orientations retains T's orientation and adds two Coolant; merging different orientations adopts S's orientation and adds one Coolant. Coolant inherits by maximum. Each Coolant increases rate for a Balanced pair by 3%, uncapped. At star 3+, a tap on a 24-second cooldown freezes the nearby enemy area for 1.5 seconds. When Balanced, it freezes for 2 seconds and grants the pair the full offensive reward for 8 seconds. Otherwise, it gives only +20% damage against frozen enemies for 6 seconds. Its former 28% slow aura remains as minor utility and does not stack with stronger slow.

Star perks 3/5/7: Tap ability unlocks / Balanced bonus gains +20% damage / +45% crit damage and +0.5-second freeze on Balanced tap.

Difficulty 5/5 and reward: The two Balanced attackers receive +180% damage, +50% attack speed, +230% crit damage for 8 seconds, plus their Coolant contribution.

What the player must think about: Reactor position, socket orientation, two adjacent attacker stars, and tap timing. Upgrading one attacker can ruin the equation; upgrading another may restore it.

PvP counterplay: SNIPE or Star Leech changes a required star value; FREEZER disables a participating Attack unit. A safe player sets up two possible sockets before committing the high-star Reactor.

Phone readability: L-shaped socket chevron, balance tick/cross, combined Coolant/cooldown badge.

Why this is different from Chiller: Chiller wants three different identities along a row. Cryo Reactor wants an exact numeric equation between two specific adjacent Attack turrets, selected by a rotated socket variant.

### 8. Chrono Throne (Red, Special) — PARADOX MIRROR

Additional mechanic · Not duplicated from Part 1

Axis: Board-state puzzles — mirrored anchor selection, star arithmetic, and temporal timing.

Exact rule: Each Throne rolls a Phase from 0–3. Native merge computes new Phase = (T.phase + 2×S.phase) mod 4; Echo Charges inherit by maximum and increase by two if Phases match or one otherwise. At star 3+, tap Throne, then select an occupied active Attack cell (c,r); its required partner is the cell (6−c,4−r), a 180° board mirror. A Perfect Paradox requires both selected units to be active Attacks, A.star+B.star = Throne.star+3, and (c+r+Throne.phase) mod 2 = 0. On activation, the Throne rewinds affected enemies by 15% of total path length normally, or 30% on Perfect Paradox. A perfect tap also deals 6× the actual damage received by the lead enemy during the previous 2 seconds, plus 4% per stored Echo Charge, and buffs attackers inside the rectangular area spanned by the mirror pair for 8 seconds. Cooldown 32 seconds. Its former accumulating slow remains +1 percentage point per second up to 35% as secondary utility.

Star perks 3/5/7: Rewind tap unlocks / cooldown becomes 28 seconds / Perfect Paradox bonus lasts 11 seconds and gains +40% crit damage.

Difficulty 5/5 and reward: +220% damage, +60% attack speed, +260% crit damage to attackers within the anchor rectangle, plus the perfect rewind and damage release.

What the player must think about: Which mirrored pair best satisfies the equation, whether to preserve it before a boss, and whether rewinding now is better than accumulating damage for a bigger release.

PvP counterplay: SNIPE or Star Leech changes the mirror equation; PETRIFY removes an anchor; SCRAMBLE may remove the Throne. An alternative anchor pair protects the setup.

Phone readability: Phase/Echo badge, selectable mirror tether, rewind cooldown ring.

Why this is not simply a stronger Chrono Lock: Chrono Lock engineers a precise merge to release stored damage. Chrono Throne engineers a whole-board anchor pair and chooses when to cash in recent combat damage.

B. Support-clone family
### 9. Hammer (White, Support) — ANVIL CORNER

Axis: Placement — two neighbours forming an L with a star-difference equation. Uses M07.

Exact rule (LV9 numbers, durations, stacks, what breaks it): Every Hammer has a seeded Stamp 1–3. Native merge calculates |T.stamp−S.stamp|+1, adds two Heat for same-row, two-column separation, or one otherwise, and inherits the larger existing Heat. A valid Anvil Corner requires one horizontal and one vertical adjacent Attack unit satisfying |A.star−B.star|=Stamp. Only the lowest-cell-ID qualifying pair receives the bonus. Each Heat adds +4% crit damage for the chosen pair.

Star perks 3/5/7: +8 points crit chance / Heat value becomes +6% crit damage per stack / +30% damage to the valid pair.

Difficulty 4/5 and reward: Two designated Attack turrets receive +115% damage, +35% attack speed, +145% crit damage continuously while the formation holds.

What the player must think about: Choosing Hammer's Stamp and star levels of two attackers. An upgrade can improve one turret yet remove both bonuses.

PvP counterplay: SNIPE changes the star difference; PETRIFY destroys one L arm. The defender can keep a second possible pair adjacent to Hammer.

Phone readability: Stamp digit, glowing L, Heat badge.

### 10. Crit Antenna (Blue, Support) — FREQUENCY BRIDGE

Axis: Links — tuned endpoints on opposite sides of one attacker. Uses M08.

Exact rule: Each Antenna rolls frequency 1–3. Same-frequency merges add one Signal; different-frequency merges produce the missing frequency and add two Signals. Stacks inherit by maximum. Two equal-frequency Antennas two columns apart with one Attack turret between them establish a Bridge. The middle turret receives the full buff, with +3% crit damage per Signal on the weaker endpoint. The bonus disappears instantly when one endpoint is frozen, petrified, transformed, or otherwise inactive.

Star perks 3/5/7: +4 points crit chance / four-column bridge permitted, granting +120% damage/+30% rate/+140% crit damage / +40% crit damage on the active bridge.

Difficulty 3/5 and reward: Ordinary Bridge +75% damage, +20% attack speed, +95% crit damage, +12 points crit chance.

What the player must think about: Preserve two matching-frequency Supports rather than merge them away, and decide which Attack unit deserves the middle slot.

PvP counterplay: PETRIFY an endpoint, FREEZER an endpoint, or SCRAMBLE the middle attacker. Keep the main damage dealer away from predictable boss targeting when possible.

Phone readability: Frequency number, thin horizontal Bridge line, Signal counter.

### 11. Fusion Mixer (Blue, Support) — REAGENT SANDWICH

Axis: Per-copy variants — synthesizing reagents to activate two-sided recipes. Uses M09.

Exact rule: Each Mixer has A, B, or C. Same-letter merges retain the reagent and add one Catalyst; different letters produce the missing third reagent and add two Catalysts. Two Mixers must occupy the immediate opposite horizontal or vertical neighbours of one Attack turret. Different reagents activate the full Recipe. Matching reagents give only +25% damage, +10% rate, +30% crit damage. Each Catalyst on the weaker contributing Mixer adds +2% rate. Effects end whenever the bracket is broken.

Star perks 3/5/7: Full Recipe +10% damage / beneficiary fires an additional 30%-strength projectile each attack / +60% crit damage.

Difficulty 4/5 and reward: Full Recipe +105% damage, +30% attack speed, +140% crit damage to the central attacker.

What the player must think about: Which reagents should be on the two sides, and whether to merge them to create a new reagent at the cost of breaking the recipe.

PvP counterplay: PETRIFY a Mixer, FORCE MERGE a bracket member, or transform the central Attack unit. Protect the position using redundant candidate attackers.

Phone readability: A/B/C reagent label, bracket line, Catalyst number.

### 12. Star Lift (Purple, Support) — COUNTERWEIGHT

Axis: Board-state puzzles — exact star sums on two adjacent Attack units. Uses M10.

Exact rule: Each Lift rolls Weight 1–3. Native merge produces |T.weight−S.weight|+1 and increases inherited Leverage by two for same-column merges or one otherwise. Exactly two of its orthogonally adjacent Attack turrets are selected whenever their star sum equals StarLift.star + Weight; use lowest ordered cell IDs for ties. Each Leverage adds +3% rate to the selected pair. Changes in star values recalculate the formation immediately.

Star perks 3/5/7: +10 points crit chance / +30% balanced-pair damage / a third adjacent Attack whose star equals Weight gains half the two-unit damage/rate/crit-damage package.

Difficulty 4/5 and reward: Balanced pair +110% damage, +35% attack speed, +140% crit damage.

What the player must think about: Whether to increase Star Lift's star, increase the two attackers' combined stars, or change the Weight through a merge. Each decision changes the equation.

PvP counterplay: Nightmare SNIPE and Star Leech can break equality. Keep multiple adjacent candidates when the boss sequence threatens star changes.

Phone readability: Weight digit, short balance beam linking the chosen pair, Leverage number.

### 13. Focus Lens (Purple, Support) — DOUBLE FOCUS

Axis: Links — matching equal-star Attack units on opposite rays. Uses M11.

Exact rule: Each Lens rolls H/V///\ direction. Native merge with the same facet grants one Polish and retains T's orientation; differing facets give S's orientation and two Polish, inheriting maximum existing Polish. From the Lens, scan each opposite ray to its first occupied cell. Both endpoints must be active Attack turrets of equal star; stones and other units obstruct. While valid, both attackers receive the complete Double Focus buff and crits pierce one additional target. Each Polish contributes +4% crit damage.

Star perks 3/5/7: +10 points crit chance / endpoints differing by one star may receive half bonuses but no pierce / +60% crit damage for a perfect equal-star pair.

Difficulty 5/5 and reward: Perfect Double Focus +185% damage, +45% attack speed, +220% crit damage to both Attack units.

What the player must think about: Which directional facet to create, how to keep both rays clear, and whether to upgrade both attackers simultaneously.

PvP counterplay: SNIPE destroys star equality; PETRIFY creates a blocker; SCRAMBLE can replace an endpoint with a nonattacking unit.

Phone readability: Facet icon, two thin focusing rays, Polish number.

C. Free-turret / economy family

These five turrets must stop being random production machines. Each will require the player to select an output, manage an attribute, or prepare the board before collecting a reward.

### 14. Cloner (Purple, Special) — TARGET GENE

Axis: Merge choices — source/target Gene inheritance. Uses M12.

Exact rule (LV9 numbers, durations, stacks, what breaks it): Each Cloner spawns with Gene 1–5, identifying one deck slot. Native merging S onto T produces a higher-star Cloner whose new Gene is S's Gene, but the offspring type is determined by T's old Gene. The player has 3 seconds to choose an empty cell in T's row or column for the free 1-star offspring; otherwise the reward expires. Differing-Gene merges increase Imprint by one from the higher existing count. When Genes differ and the offspring cell is at least two grid steps from T, an Attack offspring receives a combat bonus for 8 seconds, plus +3% damage per Imprint.

Star perks 3/5/7: Selection window becomes 5 seconds / qualifying children spawn at 2 stars / qualifying Attack children get +30% crit damage.

Difficulty 3/5 and reward: One deterministic, chosen-type offspring; qualifying Attack child gets +65% damage, +20% rate, +85% crit damage for 8 seconds.

What the player must think about: Drag Gene 4 onto Gene 2 to produce deck slot 2 now and retain Gene 4 for future production. Reversing that merge produces deck slot 4 now. The player must also reserve a suitable deployment cell.

PvP counterplay: Forced merges and SCRAMBLE can remove prepared Genes; stone or board congestion blocks placement. The defender can open a cell immediately before merging.

Phone readability: Gene/deck-slot badge, highlighted legal spawn cells, Imprint number.

Example: the exact same pair produces different results

| Source | Target | Spawn | Result keeps |
|---|---|---|---|
| G4 | G2 | deck slot 2 | G4 |
| G2 | G4 | deck slot 4 | G2 |

This is the clearest Compass-like redesign of the economy group: merge direction determines both the immediate production outcome and the next production opportunity.

### 15. Twin Maker (Gold, Special) — MIRROR CAST

Axis: Board-state puzzles — mirrored merge plus donor selection. Uses M13.

Exact rule: Each copy has Left or Right Seal. Opposite-Seal copies of equal star k must be placed in horizontally mirrored cells of the same row. Merge one onto the other; the result stays Twin Maker at k+1 and retains T's Seal. The vacated source cell is reserved for up to 3 seconds. Choose an existing Attack unit at star k, within Manhattan distance 2 of T. A fresh k-star clone of that donor appears in the source cell, with a new seeded attribute roll and zero accumulated counters. If any requirement fails, the Twin Maker merge still occurs but produces no clone.

Star perks 3/5/7: Donor selection window 5 seconds / donor distance can be 3 / a successful merge from 6 to 7 stars additionally gives all allied Attack units +20% rate for 8 seconds.

Difficulty 5/5 and reward: Chosen same-star duplication, with original and clone receiving +200% damage, +50% attack speed, +240% crit damage for 8 seconds.

What the player must think about: Which mirrored Twin Maker should receive the merge, which high-value attacker can be duplicated, and whether sacrificing the mirrored setup now is strategically justified.

PvP counterplay: SNIPE the donor or Twin Maker; PETRIFY one mirror; FORCE MERGE one prepared unit. The defender can preposition a second same-star donor.

Phone readability: Left/Right Seal, highlighted mirror cells, ghost outline of the pending copy.

This should be much rarer than Cloner's production. Cloner manufactures a low-star chosen turret; Twin Maker duplicates an already-developed attacker through a difficult spatial requirement.

### 16. Evolver (Gold, Special) — GROWTH TRANSFER

Axis: Timing — transferring accumulated progress before choosing a transformation. Uses M14.

Exact rule: Evolvers roll Season 1–3 and gain one Growth per active second. They gain an extra +1 Growth per second if at least one same-star Attack unit occupies their column. A native merge keeps T's Season and combines Growth as T.Growth + floor(S.Growth/2) + SeasonBonus; the bonus is +10 for matching Seasons, +20 for different Seasons merged across different rows, zero otherwise. At 45 Growth, the player chooses one of the five deck units and transforms the Evolver into that type at +1 star, capped at 7. Growth does not expire while waiting for the choice and is consumed on transformation.

Star perks 3/5/7: Transformation requirement becomes 40 / 35 / 30 Growth; star-7 evolution retains star 7 rather than attempting an eighth star.

Difficulty 3/5 and reward: A deliberately chosen evolution, with +65% damage, +20% attack rate, +80% crit damage for 8 seconds if the result is Attack.

What the player must think about: Whether to evolve now into a missing damage dealer, keep the Evolver to accumulate Growth, or merge two partly charged copies for a faster higher-star evolution.

PvP counterplay: FREEZER pauses Growth; SCRAMBLE wipes the stored progress; PETRIFY disables the same-column acceleration. The defender can bank enough Growth before a boss wave, then transform after its disruptive skill.

Phone readability: Season badge, Growth gauge, ready-to-evolve symbol.

### 17. Mystery Box (Purple, Special) — SAFE CODE

Axis: Timing — delayed opening combined with a numerical board puzzle. Uses M15.

Exact rule: Each Box rolls Dial 1–6. Native merge calculates ((T.dial+2×S.dial−1) mod 6)+1 and preserves T.elapsed+floor(S.elapsed/2) toward its 58-second timer. When ready, the player chooses any active non-stone key turret in its row or column. Let B count active, non-stone allied units strictly between Box and key. Calculate Score = Dial+Key.star+B. The Box transforms into deck slot ((Dial+Key.star−2) mod 5)+1 at star max(Box.star, min(6,1+floor(Score/3))), subject to the global seven-star maximum. Opening consumes the Box; a perfect score requires 15 or more.

Star perks 3/5/7: Opening time decreases to 52 / 46 / 40 seconds.

Difficulty 5/5 and reward: Exact output type and calculated star, potentially 6 stars from a lower-star Box. At Score ≥15, an Attack output receives +220% damage, +55% attack speed, +250% crit damage for 10 seconds.

What the player must think about: Preserve a strong key unit, construct a useful Dial through ordered merges, fill intervening cells deliberately, and choose when to open the Box.

PvP counterplay: SNIPE or Star Leech reduces the key's star; PETRIFY an intervening ally lowers B; SCRAMBLE can destroy the Box before opening. The player may choose a different key if one becomes invalid.

Phone readability: Dial number, ready/countdown ring, selectable key with Score preview.

Example: A Mystery Box with Dial 6, a 6-star key, and three intervening allied units gets Score 15. It opens into a 6-star output at minimum (unless the Box already has 7 stars), with the perfect reward.

The game no longer rolls a random 1–6-star prize. The player builds the odds-free prize through board construction.

### 18. Lighthouse (Purple, Attack) — BEAM POST

Axis: Timing — charging production and choosing a deployment lane. Uses M16.

Exact rule: Each Lighthouse rolls Signal 1–5 and bearing N/E/S/W. It attacks normally and generates one Orb every 24 seconds of active operation. Same-type native merging keeps T's Signal but adopts S's bearing; resulting Orb count is max(S,T)+2 if S's bearing points directly toward T along their shared row or column, otherwise max(S,T)+1. The player spends an Orb to place a 1-star turret of its Signal deck slot into any empty cell along that bearing ray, stopping at stone. A distance-≥2 Attack offspring gets its temporary combat reward. Orbs do not have a hard cap.

Star perks 3/5/7: Orb interval 20 seconds / spending two Orbs can produce a 2-star child / +40% crit damage to qualifying offspring.

Difficulty 3/5 and reward: Chosen-type, chosen-cell production; qualifying Attack offspring gains +65% damage, +20% rate, +80% crit damage for 8 seconds.

What the player must think about: Which Signal type to retain, which bearing to inherit, whether to save Orbs for a 2-star summon, and which cells must remain open.

PvP counterplay: FREEZER pauses the active timer; PETRIFY a unit in the ray can obstruct it; SCRAMBLE removes the Lighthouse. The player should avoid filling every launch cell while saving Orbs.

Phone readability: Combined Signal/arrow badge, Orb number, beam-ray preview.

D. Chain-attack family
### 19. Tesla (White, Attack) — REVERSE CURRENT

Axis: Links — opposite-polarity straight-line circuits. Uses M17.

Exact rule: Copies roll + or −. Native merging matching polarities retains T's polarity and gives max(Capacitors)+1; opposite polarities produce S's polarity and give max(Capacitors)+3. Tesla chains through up to 3+Capacitors distinct enemies, with each subsequent hit dealing 70% of the previous hit. Capacitors add +2% chain damage per count. Two opposite-polarity Teslas form a Circuit when aligned in the same row or column with all intervening cells empty. The Circuit stays active only while both endpoints are available and the gap is unobstructed.

Star perks 3/5/7: +1 initial chain target / every 4 seconds a secondary chain hits at 35% normal damage / +40% crit damage while Circuited.

Difficulty 3/5 and reward: Both endpoints gain +70% damage, +25% attack rate, +85% crit damage while connected.

What the player must think about: Preserve two different-polarity Teslas and the cells between them, or merge one away to accumulate more Capacitors on the survivor.

PvP counterplay: PETRIFY or FREEZER a Tesla endpoint; SCRAMBLE a connected turret; board congestion makes restoration harder.

Phone readability: +/- badge, straight Circuit tether, Capacitor number.

### 20. Storm Gun (Purple, Attack) — KNIGHT SURGE

Additional mechanic · Not duplicated from Part 1

Axis: Per-copy variants — phase matching on a chess-knight offset.

Exact rule (LV9 numbers, durations, stacks, what breaks it): Every Storm Gun spawns with Phase 0, 1, or 2. Native merge produces (T.phase+2×S.phase) mod 3. It inherits the higher Spark count and adds one Spark for matching phases, two for different phases. Two Storm Guns create a Knight Surge if their grid displacement is (|Δcolumn|,|Δrow|)=(2,1) and their phases are different with (PhaseA+PhaseB) mod 3=2. Therefore, at base, the matching phase pair is exactly 0+2, in either order. Both guns gain the full bonus while the formation holds, and each Spark on the weaker contributing unit adds +3% crit damage. Each Storm Gun fires instant arcs at up to three distinct enemies per attack. Orthogonally adjacent Storm Guns still suffer a minor −15% attack-rate penalty to discourage clustering; that penalty is independent of the Surge bonus.

Star perks 3/5/7: Active Knight Surge gains one extra chain target / +25% Surge damage / every third Surge attack emits an additional 70%-strength arc to up to two other enemies.

Difficulty 4/5 and reward: Both Surge partners receive +130% damage, +40% attack speed, +150% crit damage while connected.

What the player must think about: Two copies two columns and one row apart, with exact complementary phase values. This rewards deliberate staggered placement rather than bunching up chain attackers.

PvP counterplay: SCRAMBLE either member, FREEZER one endpoint, or PETRIFY a turret. Keep an alternate Phase 0/2 candidate for replacement.

Phone readability: Phase digit, bent dotted knight-move tether, Spark number.

This differs fundamentally from Tesla: Tesla requires opposite polarities along an unobstructed straight line. Storm Gun requires an exact staggered displacement and compatible phases, independent of cells between the two units.

### 21. Ricochet (Purple, Attack) — BANKSHOT CORRIDOR

Additional mechanic · Not duplicated from Part 1

Axis: Placement — using deliberately empty cells as part of the attack build.

Exact rule (LV9 numbers, durations, stacks, what breaks it): Each Ricochet spawns with a Bank Side (Left or Right) and Incidence value 1–3. On native merge, identical Bank Sides retain T's side, while different sides adopt S's side. Result Incidence becomes ((2×T.incidence+S.incidence−1) mod 3)+1. Bank counters inherit by maximum and gain two when S and T occupy opposite outside columns in the same row; otherwise gain one. Ricochet fires an initial shot that may rebound through up to 3+Incidence+Bank distinct enemies. Each successive hit deals 125% of the previous hit, and each Bank adds +5% damage to all hits after the first. A Clean Bank requires Ricochet to stand in the middle row r=2 with at least two completely empty cells between it and the board boundary in its Bank Side direction; all cells from turret to that boundary must be empty. While true, it receives its full offensive bonus. Any newly occupied cell, including stone, breaks the corridor immediately.

Star perks 3/5/7: +1 rebound target / +30% Clean Bank damage / +45% crit damage during Clean Bank.

Difficulty 5/5 and reward: A valid corridor gives +185% damage, +50% attack speed, +220% crit damage, continuously until the space is blocked.

What the player must think about: Is leaving two or three valuable board slots empty worth an exceptionally powerful attacking turret? The player can rotate its Bank Side through a source/target merge, but might sacrifice the desired cell to do so.

PvP counterplay: PETRIFY or FREEZER the Ricochet, SCRAMBLE its type, or force an inconvenient merge that changes its Bank Side. Its main vulnerability is self-inflicted: filling the reserved corridor to summon or merge other units.

Phone readability: Left/Right arrow, dotted empty-cell corridor, Bank counter.

This is deliberately unlike the approved Lone Ace. Lone Ace rewards having no immediate neighbours. Ricochet rewards preserving a specific directional corridor, even if it is surrounded vertically by friendly units.

#### Balance and implementation safeguards

Before implementation, I would enforce five system-level rules:

1. Recalculate formations only after discrete board events: summon, merge, transformation, stone creation/removal, freeze start/end, or star change. Do not search every possible formation every animation frame.

2. Use fixed simulation ticks: at 60 FPS, a 6-second buff lasts exactly 360 ticks. Charge timers, recent-damage windows, and status expiration must be deterministic. Resolve simultaneous events by action sequence, then ascending cell ID.

3. Protect the damage pipeline: all permanent counters remain uncapped, but crit chance is clamped to 100%. Different offensive bonuses add rather than multiply with each other. An effect cannot activate itself recursively through bonus projectiles.

4. Separate gameplay hits from presentation: Lightning chains, repeated Ricochet hits, and Blizzard pulses can produce many damage events. Calculate all gameplay damage deterministically, but combine nearby visual effects and limit simultaneously audible hit sounds so phone performance and clarity survive large waves.

5. Preserve Merge King's purpose: these native type-keeping merges belong only to explicitly redesigned units. Merge King remains the general-purpose method for retaining type elsewhere, and can upgrade a redesigned turret without automatically earning its special native-merge payout.

For tuning, I would measure the percentage of matches where each difficulty-5 condition is achieved. A good initial target is 5–15% of matches for an intended fully completed 5/5 puzzle, rather than expecting every player to complete it routinely. If a mechanic never triggers despite deliberate play, improve its setup opportunities before reducing the promised reward.

#### Final roster comparison

| Turret | Old identity | New decision | Difficulty |
|---|---|---|---|
| 1. Frost | Periodic freeze | Opposite-polarity merge in correct column | 3 |
| 2. Ice Blade | Damage vs slow | Number arithmetic + tile parity | 4 |
| 3. Chiller | Slow aura | Synthesize A+B+C across one row | 4 |
| 4. Blizzard | Global slow pulse | Construct L-shaped storm from two merge coordinates | 4 |
| 5. Chrono Lock | Hold + stored damage | Equal-Dial subtraction at precise spacing | 4 |
| 6. Eclipse | Day/Night cycling | Sacrifice mirrored Sun/Moon pair | 5 |
| 7. Cryo Reactor | Slow + damage support | Correct L socket and adjacent star sum | 5 |
| 8. Chrono Throne | Tap rewind | Select matching mirror anchors before rewinding | 5 |
| 9. Hammer | Flat crit support | Build exact star-difference L | 4 |
| 10. Crit Antenna | Flat crit chance | Equal-frequency bridge across attacker | 3 |
| 11. Fusion Mixer | Flat rate + diversity | Two-sided reagent recipe | 4 |
| 12. Star Lift | Rate per star | Balance two attackers' star sum | 4 |
| 13. Focus Lens | Crit damage + pierce | Match equal-star attackers on opposite rays | 5 |
| 14. Cloner | Random extra 1-star | Source/target Gene determines chosen output | 3 |
| 15. Twin Maker | Extra same-star unit | Mirrored merge copies a selected donor | 5 |
| 16. Evolver | Random timer evolution | Transfer Growth and select output type | 3 |
| 17. Mystery Box | Random 1–6-star prize | Build Safe Score and choose key | 5 |
| 18. Lighthouse | Random orb summons | Configure output Signal and launch direction | 3 |
| 19. Tesla | Ordinary chain damage | Preserve opposite-polarity open circuit | 3 |
| 20. Storm Gun | Arc damage + adjacency penalty | Complementary phases at knight-move spacing | 4 |
| 21. Ricochet | Increasing bounce damage | Preserve directional empty-cell corridor | 5 |

Primary axis distribution: Merge choices 4 · Placement 4 · Links 4 · Per-copy variants 3 · Timing 3 · Board-state puzzles 3.

The strongest changes are Target Gene, Safe Code, Thermal Triangle, Mirror Equinox, and Bankshot Corridor. Together they introduce five genuinely different player questions: which copy should receive the merge, what output can I construct, which star equation should I solve, when should I sacrifice an established formation, and which cells should deliberately remain empty?

That is the type of decision variety I would prioritize over adding more slow effects, random generators, or unconditional support percentages.

---

## Câu hỏi 2 (phản biện, tóm tắt)
Phản biện: (1) gần như mọi ụ cùng một khuôn "giá trị 1–3, |T−S|+1, bộ đếm max+1, đội hình cho +110/+35/+140"; 4 ụ là phương trình tổng/hiệu sao; bỏ hết modulo/chẵn lẻ, tối đa 1 con số/ụ. (2) Quá ít hiệu ứng TOẢ kiểu Ember Relay đổi ụ khác đã đặt — thưởng chủ yếu là cửa sổ 6–10 s. (3) Biến thể từng bản phải đổi HÀNH VI (như Sói thường/thức tỉnh), A lên B khác B lên A. Yêu cầu: A) bảng 21 ụ sửa lại (≥6 ụ toả, ≥5 ụ biến thể hành vi, ≤2 ụ phương trình sao); B) 10 nguyên mẫu cơ chế mới; C) bảng tương tác (jackpot, hỗ trợ, Copycat/Mimic, Merge King, ô đá/đóng băng, chiêu trùm, PvP); D) top 5 + 3 bẫy cân bằng.

## Trả lời 2

TURRET MERGE — Redesign V2

Agreed with all three criticisms. The previous design had too many arithmetic puzzles disguised as different turrets. This revision makes the visible interaction the mechanic, rather than a formula or a temporary stat window.

Three changes are fundamental:

Radiation changes existing board units permanently, including their firing modes, counters, or production resources. Not merely a 6-second buff on the merged turret.

Variants change actual behaviour: attack pattern, target selection, freeze versus cleanse, or production method. Dragging A onto B frequently differs from B onto A.

One-second readability: one variant icon, at most one counter number, and a spatial preview on drag. No modulo, parity, coordinate calculations, or star-sum equations.

#### PART A — Revised 21-turret roster
Shared rules

S → T means dragging source S onto target T. A native merge of two same-type, same-star redesigned turrets retains the type, increases T by one star, and resolves its special effect. Maximum star remains 7.

For compactness, D / AS / CD means damage % / attack-speed % / crit-damage percentage points. Unless noted, these are additive bonuses.

Permanent stacks: uncapped, retained by surviving recipients. When two stack-bearing native units merge, T inherits the higher stack count, not the sum, before the specified reward.

Radiating merge: evaluated from T's cell after consumption. It affects other eligible, already-placed turrets of the specified type, plus T when stated. Straight rays pass through ordinary units and empty cells but stop at stone. Mirror and knight-offset effects jump directly.

Non-attacking units: their reward benefits the specified allied attackers. Buffs tied to a Support or Special stop applying when that provider is inactive or removed; accumulated counters remain on the provider.

UI: existing star display, one mechanic icon, optional one numeric counter, and a spatial effect/preview. No second numeric display.

Radiating mechanics are marked ✳; true behaviour variants are marked ◆. These are design annotations, not additional in-game indicators.

| Turret | Per-copy attribute (icon) | Merge rule — plain words | Geometry / radiating effect | Reward at LV9 (D / AS / CD) | Difficulty | One decision |
|---|---|---|---|---|---|---|
| 1. Frost ✳ ◆ | 🔒 Pin: freezes lead foe 1.5s every 8s; 🔓 Purge: cleanses oldest frozen ally every 10s | Opposite forms: T keeps its form. Pin target sends a row pulse; Purge target sends a column pulse. Same forms only strengthen T | Every Frost hit by the pulse, plus T, gains 1 permanent Crystal | Each Crystal gives adjacent allied Attacks +5/+1/+7, while Frost is active | 3 | Pin→Purge for column cleansing and growth, or Purge→Pin for row growth and enemy lockdown? |
| 2. Ice Blade ◆ | ⚔ Cleave: single 280%-strength hit; 🌀 Spin: three 90%-strength hits. Each copy has an Edge number starting at 1–3 | Same form: Edge numbers ADD. Mixed forms: retain larger Edge number and T's attack form; produce one 350% shatter hit | No formation requirement; accumulate Edge 6+ through careful merges | At Edge ≥6: +135/+30/+160 permanent while threshold holds; every Edge adds +4% damage | 4 | Merge matching forms for a big number, or mixed forms to preserve a useful attack mode? |
| 3. Chiller ✳ ◆ | 🧊 Rime: neighbours apply 20% slow; ♨ Steam: neighbours gain rate against slowed enemies | Opposite-form merge keeps T's form and broadcasts it. Same-form merge only adds 1 Coil to T | All other Chillers along both diagonals switch to T's form and gain 1 permanent Coil; T also gains 1 | Each Coil grants adjacent Attacks +6/+2/+9, while that Chiller is active | 4 | Which mode should dominate the diagonals? |
| 4. Blizzard ✳ ◆ | ☁ Wide: 130% area pulse every 10s; 🎯 Lance: three focused 130% shots every 10s | Opposite-form merge keeps T's mode; other Blizzards touched adopt it and gain a Gale. T gains 1 Gale | Wide target radiates along its entire row; Lance target along its column | Each Gale gives its Blizzard +10/+2/+12 permanently; opposite merge also fires one 240% area pulse | 4 | Build a row of area storms or a column of boss killers? |
| 5. Chrono Lock ◆ | ⏳ Bank: locks enemy and stores incoming damage; 💥 Release: detonates stored damage | Bank→Release detonates combined stored damage ×2; Release→Bank retains combined stored damage and adds 1 Echo. T keeps form | Releases mark the lead enemy for 8s; no positional equation | On marked enemy, allied Attacks +95/+20/+125 for 8s; each Echo adds +5% future detonation damage | 4 | Cash out stored damage now or keep banking? |
| 6. Eclipse ✳ ◆ | ☀ Sun: piercing beam and burn; 🌙 Moon: wide cone and slow | Opposite-form merge keeps T's form, grants T 1 Horizon, and transmits that form to a mirrored Eclipse, granting it 2 Horizons | Sun affects the left–right mirror cell; Moon affects the top–bottom mirror cell | Each Horizon gives Eclipse +14/+4/+18 permanently | 4 | Which mirror partner should inherit which attack behaviour? |
| 7. Cryo Reactor ✳ ◆ | 🔥 Furnace: adjacent Attack hits expose armour; ❄ Condenser: adjacent Attack hits occasionally freeze | Opposite forms: T keeps its form, T gains 1 Coolant, other Reactors on the relevant paths gain 1. Same forms: T gains 1 only | Furnace radiates row + column; Condenser radiates both diagonals | Each Coolant gives adjacent Attacks +7/+3/+10, while Reactor is active | 4 | Cross-shaped damage amplification or diagonal freeze infrastructure? |
| 8. Chrono Throne ✳ ◆ | ⏪ Rewind: tap sends foes 20% backward; ⏩ Rush: tap accelerates allied attacks for 5s | Opposite forms: T keeps its mode, gains 1 Epoch; an existing Throne at T's vertical mirror gains 2 Epochs. Matching forms do not radiate | Vertical-mirror transfer; Rewind buffs T's column, Rush buffs T's row | Each Epoch gives allied Attacks in the relevant line +10/+4/+13, while Throne is active; tap cooldown 32s | 5 | Preserve a mirrored pair to amplify rewind or firepower? |
| 9. Hammer | ↖ ↗ ↙ ↘ L-socket orientation | Native merge installs S's socket orientation into T | The two socket cells must contain orthogonally adjacent Attacks of equal star; no arithmetic beyond matching visible stars | Both attackers +80/+18/+125 continuously while aligned | 3 | Which corner should the Hammer support? |
| 10. Crit Antenna | 🟣 or 🟡 frequency | Native merge installs S's frequency in T; matching does not create an extra stack | Two equal-frequency Antennas on opposite immediate sides of one Attack, horizontally or vertically | Middle Attack +35/+10/+185, plus 12 percentage points crit chance, while linked | 3 | Keep the correct matching pair instead of merging it? |
| 11. Fusion Mixer ◆ | ⛽ Fuel: gives neighbour rate; 🧪 Acid: makes neighbour hits corrode armour | Opposite-form merge preserves T's form; same-form merge keeps that form without additional output | Fuel and Acid Mixers on opposite sides of the same Attack activate a two-part recipe | Middle Attack +90/+38/+115 while the recipe remains intact | 3 | Which mode is missing on the other side of the attacker? |
| 12. Star Lift ✳ ◆ | ⬆ Lift: buffs lower-star neighbours; ⬇ Press: buffs higher-star neighbours | Opposite-form merge broadcasts T's mode down its column; every Star Lift hit, including T, gains 1 permanent Lift stack | Column propagation switches other Star Lifts to T's behaviour | Each stack gives qualifying adjacent Attacks +8/+4/+9 while Lift is active | 3 | Should this column amplify weaker guns or stronger guns? |
| 13. Focus Lens | ↔ ↕ ◢ ◣ focusing orientation | Native merge installs S's orientation; T retains its existing Polish count, if any | First occupied cell on each opposite ray must contain an active Attack of a different turret type; stones block rays | Both Attack endpoints +155/+35/+205, and crits pierce one extra target while linked | 5 | Which direction connects two different high-value Attack types? |
| 14. Cloner | One of five deck-card icons | S→T produces one 1-star turret of T's original Gene; resulting Cloner inherits S's Gene | Offspring appears in the vacated S cell; same pair reversed changes the output type | Chosen offspring; if S was at least 2 grid steps from T, Attack child gets +55/+15/+70 for 8s | 3 | Which Gene do I spend now, and which do I keep? |
| 15. Twin Maker | ◀ Left Seal / ▶ Right Seal | Opposite-Seal same-star merge keeps T's Seal; player selects one eligible same-star Attack donor within 2 steps of T | S and T must occupy horizontally mirrored cells; a fresh copy of the donor appears in S's old cell | Donor and copy +180/+45/+220 for 10s, plus chosen same-star production | 5 | Which attacker deserves a costly mirrored duplication? |
| 16. Evolver ◆ | 🌱 Seed: +1 Growth per active second; 🔧 Graft: +3 Growth per allied native merge in its row | T keeps its Growth method and gains half of S's stored Growth, rounded down | At 35 Growth, player chooses any deck unit as its transformation at +1 star, capped at 7 | Chosen Attack output +65/+20/+90 for 12s | 3 | Passive patience or positioning for frequent merges? |
| 17. Mystery Box | ⚔ Attack / 🛡 Support / ⚙ Special output category | Native merge keeps T's category and reduces the opening timer by 12s if S had a different category | At 45s, select an exact deck unit of the displayed category; if two orthogonal neighbours already have that same turret type, output gains +2 stars instead of +1 | Chosen output; perfect Attack result +120/+35/+175 for 12s | 5 | Which type am I preparing, and should I delay opening for the matching neighbours? |
| 18. Lighthouse ✳ | Deck-card glyph + ↑→↓← bearing | Result retains T's deck-card glyph but takes S's bearing; gains 1 Orb. Every other Lighthouse on the outgoing ray also gains 1 Orb | Ray from T along its new bearing, blocked by stone; spend an Orb to place that card in a chosen empty cell on its ray. Independently generates 1 Orb every 22 active seconds | Chosen Attack child +40/+16/+70 for 10s; Orb stock is uncapped | 4 | Which output and launch direction make the most valuable production network? |
| 19. Tesla ✳ ◆ | ➕ Fork: chains across 3 enemies; ➖ Lance: concentrated long-range hit | Opposite-polarity merge retains T's polarity. All Teslas hit by the pulse adopt T's polarity and gain 1 Coil; T gains 1 | Positive target radiates its row; Negative target radiates its column | Each Coil gives that Tesla +8/+2/+11 permanently | 3 | Turn a row into chain guns or a column into concentrated finishers? |
| 20. Storm Gun ✳ ◆ | ⚡ Bolt: one 300% hit; ⛓ Fork: 3 arcs at 70% each | Opposite-form merge keeps T's mode. Each other Storm Gun at a knight offset adopts the opposite of T's mode and gains 1 Surge; T gains 1 | Chess-knight offsets: 2 columns + 1 row, or 1 column + 2 rows | Each Surge gives its Storm Gun +12/+3/+14 permanently | 4 | Where will a merge reconfigure the most staggered Storm Guns? |
| 21. Ricochet ◆ | ◀ Left Bank: prioritizes rearmost enemy; ▶ Right Bank: prioritizes lead enemy | Same-bank merge adds 1 Bounce; mixed-bank merge adopts S's bank and adds 2 Bounces | In middle row, two or more empty consecutive cells must extend from Ricochet to its selected board boundary, without interruption | Clean corridor +170/+40/+210 while intact; each Bounce adds +6% rebound damage permanently | 5 | Keep a powerful empty corridor or occupy those cells with useful turrets? |

#### Design checks
10
Radiating mechanics
13
Behaviour-variant units
0
Star-sum equations

The ten radiating cases are Frost, Chiller, Blizzard, Eclipse, Cryo Reactor, Chrono Throne, Star Lift, Lighthouse, Tesla, and Storm Gun.

The strongest distinction is that radiation can reprogram other existing copies. A Tesla merge can switch an entire line from chain attacks into focused attacks; a Blizzard merge can convert a row into area bombardment; a Chiller merge can change the support behaviour of Chillers on both diagonals. These are board-state transformations, not just bonus counters.

One deliberate economy adjustment: native Cloner and Twin Maker outputs occupy the vacated source cell, never an extra arbitrary cell. Their outputs reset stored production resources, temporary buffs, and counters. This prevents the previous design's ability to generate arbitrary reward-bearing clones repeatedly.

#### PART B — 10 brand-new mechanic archetypes

These are additional concepts, not replacements for the 21 in Part A. They explore mechanics not covered by the approved roster or the revised assignments.

| Family / archetype | Exact rule and numbers | Example | Difficulty | One decision | PvP / boss counterplay |
|---|---|---|---|---|---|
| Radiating — 1. Cell Engraver | A native merge engraves every currently empty cell in T's row until stone. The next paid Attack summon occupying an engraved cell consumes its mark and gains permanent +50% D, +12% AS, +70pp CD. One mark maximum per cell. | Purple Support | 3 | Engrave empty future deployment cells now, or summon into them first? | PETRIFY creates a blocking stone; forced placement into a marked cell consumes the mark without a reward if the result is non-Attack. |
| Radiating — 2. Synchro Sweep | A native merge selects the first active Attack turret in each of four cardinal rays. If at least two qualify, their next regular attacks are synchronized within 1s, each gaining +130% D and +60pp CD. No additional attack events are created. | Gold Attack | 4 | Where will one merge coordinate the most strong guns? | FREEZER cancels a queued participant; PETRIFY blocks a ray. |
| Attribute arithmetic — 3. High–Low Bid | Copies roll one visible Bid 1–4. Merge larger S onto smaller T: result inherits S's Bid and fires (S−T) bolts at 320% damage each. Otherwise result retains T's Bid and gains +65% AS for its next five attacks. | Blue Attack | 3 | Do I spend the larger Bid as burst, or preserve it as the target? | SNIPE prevents the intended equal-star merge; SCRAMBLE resets Bid. |
| Attribute arithmetic — 4. Shell Auction | Copies hold 1–4 visible Shells. Native merging releases exactly S's Shell count as 160%-strength bonus shots, alternating between the two nearest active Attack turrets in T's row. Result inherits T's Shell count. S with 3+ Shells also grants recipients +120pp CD on their next regular shot. | White Special | 3 | Which stockpile should be sacrificed, and where should it fire? | FREEZER makes a candidate recipient ineligible; PETRIFY blocks targeting paths. |
| Behaviour variants — 5. Twin-Track Pursuit | 🐺 Hunter attacks the highest-HP enemy; 🎯 Executioner attacks the lowest-HP enemy. Hunter→Executioner grants three 200%-strength armour-piercing attacks; Executioner→Hunter grants three attacks with 80%-strength splash to nearby enemies. T keeps its attack behaviour. | Gold Attack | 4 | High-HP boss removal or finishing low-HP enemies? | Boss untargetability wastes committed shots; FREEZER delays the burst. |
| Behaviour variants — 6. Mine Steward | 🪤 Planter creates a path mine every fifth normal shot; 💣 Detonator detonates nearby mines for 250% area damage every fifth shot. Planter→Detonator detonates mines in its attack sector plus one 500% blast; reverse order plants two mines immediately. | Purple Attack | 4 | Stockpile mines or convert them into immediate path damage? | Enemy speed and route changes can bypass prepared mines; a freeze pauses planting or detonation. |
| Links — 7. Recoil Tether | Select two allied Attacks within 3 Manhattan steps. Every normal hit by the first stores 40% of its dealt damage into the second's next normal hit; the second attacks 10% slower. A unit may join only one tether. Bonus damage cannot feed another tether. | Red Attack | 4 | Which two weapons justify trading speed for transferred damage? | Shuffle can break distance; PETRIFY either endpoint disconnects it. |
| Placement — 8. One-Tile Portal | Two different Attack types in one row with exactly one empty cell between them create a portal. Every sixth alternating normal attack from the pair fires one 600%-strength portal projectile. The count resets when the empty cell is occupied. | Purple Support | 4 | Keep a valuable centre cell permanently empty to unlock crossfire? | PETRIFY fills the gap; FORCE MERGE removes an endpoint. |
| Chosen economy — 9. Two-Card Draft | Each native merge draws two seeded deck cards; the player selects one to replace the next paid summon at +1 star, capped at 7. A new Draft replaces any unspent Draft; no extra turret is produced. | Gold Special | 3 | Which deterministic option best fixes my current deck? | A summon-block prevents cash-out; SCRAMBLE before drafting removes the producer. |
| Chosen economy — 10. Layaway Beacon | Pay 20 mana to reserve a chosen card in one empty cell. After 18s continuously empty, it becomes a 2-star turret of that type. Occupancy or producer loss cancels it and refunds 10 mana. Only one reservation per player. | Purple Special | 4 | Spend mana and reserve space now for a specific future unit? | Boss stone/forced occupancy cancels the reservation; the opponent can pressure the timing. |

The most promising novel concept here is Cell Engraver. Unlike Ember Relay, it permanently prepares empty board cells, making the next summon-location decision consequential. Synchro Sweep is also promising because it changes attack scheduling without adding another counter or formula.

For these archetypes, preview labels such as BURST, HOLD, 2 SHOTS, READY, or BLOCKED are preferable to exposing internal arithmetic.

#### PART C — Interaction contracts

The tables below specify proposed integration rules, not changes to the already-approved jackpot algorithms. They are split into three matrices to keep them readable on mobile.

#### Event priority

For deterministic lockstep, use this order whenever several systems affect the same simulation tick:

Apply earlier-sequenced boss/PvP status changes and validate the player action.

If legal, consume S, upgrade/create T, and resolve type/attribute inheritance.

Execute one native-merge ability belonging to that merge's turret type.

Apply its radiation or geometry changes in ascending recipient cell order.

Recalculate ongoing links, support buffs, and placement conditions.

Queue extra attacks, economy outputs, and visual effects with unique event IDs.

Important: an effect caused by a merge is not another merge. A radiating pulse, extra projectile, cloned output, or copied unit does not recursively trigger a second native-merge ability.

For compatibility, use six primary mechanic families:

| Family | Assigned examples |
|---|---|
| R — Radiating merge | Frost, Chiller, Blizzard, Eclipse, Cryo Reactor, Chrono Throne, Star Lift, Lighthouse, Tesla, Storm Gun, Cell Engraver, Synchro Sweep |
| A — Attribute arithmetic | Ice Blade, Chrono Lock, High–Low Bid, Shell Auction |
| V — Behaviour variants | Fusion Mixer, Evolver, Twin-Track Pursuit, Mine Steward |
| L — Links / tethers | Crit Antenna, Focus Lens, Twin Maker, Recoil Tether |
| P — Placement corridors | Hammer, Ricochet, One-Tile Portal |
| E — Chosen-output economy | Cloner, Mystery Box, Two-Card Draft, Layaway Beacon |

Several turrets span multiple families conceptually; this classification determines which native-merge handler owns their primary effect.

#### C1. New mechanics × approved jackpots

| New family | Masterwork | Orbital Cascade | Chromatic Heist | Chain Reactor |
|---|---|---|---|---|
| R | Scrap Forge feed can consume a marked unit; its counters are lost. No ray emitted. | A pulse never counts as an Orbital merge or refreshes its 23s Awakened window. | Broadcast colours/modes do not count as Prism's red→gold→blue merges. | Radiated buffs can increase actual Chain Link attack damage/rate; radiation itself counts as zero hits. |
| A | Feeding a numbered unit discards its number without calculating an arithmetic merge. | Number additions and subtractions never advance Cascade. | Numbers are not Prism colour states; Heist sequence unchanged. | High–Low bolts and Shell Auction bonus shots are tagged procs, not qualifying Chain Link normal hits. |
| V | Feeding a variant unit destroys its form. No form interaction fires. | A mode switch does not activate or extend Awakened. | Variant switches cannot advance the RGB merge order. | Only actual normal attacks made by Chain Link members count; another turret's variant attack does not. |
| L | Consuming a tether endpoint immediately breaks its link. | Tether damage can amplify an Orbital's next normal shot, but does not extend Cascade. | A linked Prism still needs its own approved colour-merge sequence. | A linked Chain Link's normal hits count; transferred tether damage creates no separate hit credit. |
| P | Feeding a corridor endpoint removes it, immediately ending its formation. | Portal projectiles are not Orbital bombs and do not count as Orbital merges. | A gap, portal, or Ricochet rebound contributes no Prism merge event. | Portal hits are extra procs; they do not count toward individual Chain Link hit requirements. |
| E | An eligible produced turret may later be fed at its current star; its stored state is then destroyed. | A produced Orbital becomes a valid Orbital body; only later actual Orbital merges advance Cascade. | A produced Prism receives a fresh seeded colour; only later Prism merges advance Heist. | A produced Chain Link can join the connected group and contribute real normal hits after spawning. |

| New family | Blood Eclipse | True North | Grand Chorus | Six Seals |
|---|---|---|---|---|
| R | Radiating stacks are not Blood Circuit VAMP spending. No Eclipse progress. | New directions are not Compass arrows; no effect on its three same-arrow merges within 45s. | Radiated counters do not create additional Quantum Choir bodies. | Pulses do not draw, spend, or reset Pandora seals. |
| A | Bid, Edge, and Shell values never convert into VAMP. | Arithmetic on Ice Blade or Bid units does not count as Compass arithmetic. | Numbered units count as Choir members only if their actual type is Quantum Choir. | Arithmetic results never consume a Pandora draw. |
| V | Changing a form does not spend VAMP. | Sun/Moon or other form changes do not advance or break the Compass same-arrow streak. | Changing behaviour never changes a turret into an additional Choir. | Switching forms creates no Six Seals event. |
| L | Transferred tether damage is damage, not a VAMP transaction. | A Compass endpoint retains its approved arrow/number; linking it does not trigger True North. | An actual linked Choir still counts once at its current star; its tether counts zero. | Linked Pandora units draw only through their original Pandora actions. |
| P | Corridor or portal damage does not spend VAMP. | An empty corridor contributes no Compass merge event. | An empty gap contributes zero Choir units; placing a Choir in it recalculates both systems. | Corridor creation and destruction do not alter the Six Seals bag. |
| E | Producing Blood Circuit creates a fresh unit; production is not VAMP spending. | Producing Compass gives its ordinary seeded arrow and starting number 1; later qualifying merges count normally. | A new actual Choir contributes immediately to the same-star population. | Producing Pandora creates a new unit with its normal fresh seal state; no immediate draw. |

Chain Reactor distinction: its approved condition remains at least four connected Chain Links, with three members each landing three hits within five seconds. Only those actual member-hit events count. A 600%-strength portal proc, radiating effect, or transferred tether damage must not masquerade as another Chain Link attack.

#### C2. New mechanics × other systems

For this table, synthetic means a zero-cost produced turret or a Copycat-generated copy. Its type, visible attributes, and combat state may exist normally, but its first subsequent native merge cannot generate additional persistent counters, free outputs, or bonus merge-hit events. That first merge clears the synthetic restriction on its result. This prevents Copycat and free-producer loops without changing the approved Compass/Copycat behaviour.

| Family | Other new mechanics | Existing support buffs | Copycat | Mimic |
|---|---|---|---|---|
| R | One merge emits only its own radiator's effect. Cell engraving is attached to cells, not recipients; Synchro Sweep schedules existing attacks only. | Bonuses add to eligible Attack stats. Frozen radiating Supports supply zero active buff. | Copies icon and visible counter at its normal 70% damage coefficient; no copied board engravings. Its first synthetic native merge emits no new persistent marks. | Random-deck merge; no radiation and no counter inheritance. |
| A | Different turret types cannot combine their numbers. Each native merge runs exactly its own number rule once. | Arithmetic-proc damage uses the attacker's post-support stats once; additional procs do not retrigger support-hit abilities. | Copies the visible number. On its first synthetic native merge, the result keeps the larger input number but emits no arithmetic bonus shots or added stacks. | Random-deck result; original number is discarded. No arithmetic payoff. |
| V | Modes only change through their own native rule; an unrelated radiator cannot change another turret's behaviour unless explicitly named as its recipient. | Recalculate outgoing support effect immediately when mode changes. An inactive variant provides zero buff. | Copies the current behaviour icon. First synthetic native merge may set the result's mode but generates no once-per-merge bonus. | Both old modes discarded; new random type gets its ordinary seeded state. |
| L | Recoil Tether allows only one chosen tether per unit. Automatic Bridges and Focus rays can coexist; transferred bonus damage never enters another tether. | Apply Support bonuses to real endpoint attacks before calculating transferred damage. Do not apply them again to transferred damage. | Copy becomes a new physical node, eligible for formations at 70% combat damage; it does not inherit an existing tether assignment. | Consumed endpoint loses its link; new random result is checked for eligible automatic formations. |
| P | A cell engraving does not occupy a portal gap. A paid summon there consumes the engraving and simultaneously breaks the gap if it fills it. | Only active endpoint attacks receive Support bonuses; portal proc gets no duplicate application. | A copy occupies a real cell and immediately recalculates every corridor and portal using that cell. | Recalculate gaps after the random result appears. No portal shot from the merge event itself. |
| E | One pending Draft and one pending Layaway per player. A single native merge cannot collect rewards from two different producer types. | Produced Attacks receive active spatial Support buffs after spawning; no retroactive benefits before arrival. | Copies Gene/output icon, but not Growth, Orbs, production timers, stored choices, or reservations. First synthetic native merge yields no free child. | Random result; Gene, stock, pending producer action, and unspent production progress are erased. |

| Family | Merge King | Stone cells | Frozen cells | PvP sabotage |
|---|---|---|---|---|
| R | T keeps type, form, counter and gains star; no radiator fires. Golden +2 uses existing rule. | Blocks straight rays; never receives a mark. Mirror/knight jumps ignore intervening stone but cannot affect a stone destination. | May receive a stored mark from another unit, but cannot emit, support, or activate that mark until thawed. | Jammer preventing merge stops the pulse; positional shuffle retains counters but changes future ray geometry; Hex preserves counters. |
| A | T keeps its number unchanged. No addition, subtraction, bonus shells, or detonation. | Stone conversion makes number dormant; stone-to-stone merging destroys it. | Number stays stored; no native merge involving that frozen copy until allowed by existing exceptions. | Jammer prevents payout; shuffle keeps number with the turret; Hex changes star only. |
| V | T keeps its behaviour icon; no opposite-form bonus. | Mode is dormant until cleansed; merging stones destroys original mode. | Mode retained but attacks/support disabled while frozen. | Shuffle retains mode; Hex retains mode but may disable star perks; Jammer blocks mode-changing merges. |
| L | T survives at higher star; recalculate automatic links. No extra link payout. | Stone endpoint disconnects; a stone between Lens endpoints blocks the ray. | Inactive endpoints suspend automatic links; Recoil Tether's pending transferred damage is discarded on freeze. | Shuffle recalculates geometric links and breaks manually selected Recoil Tethers if moved; Hex may break a star-match condition. |
| P | Removing S creates a vacancy; re-evaluate corridors after T's star increase. No bonus projectile from Merge King itself. | Stone is occupied and blocks clean corridors/portal gaps. | Frozen turret still occupies its cell, blocking gaps; frozen Attack endpoints cannot maintain an active portal. | Shuffle may create/remove gaps; Hex retains spatial pattern but rechecks star perks; Jammer blocks intended merge setup. |
| E | T keeps its Gene, production stock, and timer, gains star; no free child or timer acceleration. | Cannot place products in stone cells. Stone on reserved Layaway cell cancels it with 10-mana refund. | Producer timers pause while frozen; reservations remain if their designated cell stays empty. | Jammer blocks new special merges; shuffle retains unit-owned stock but reservations stay at their original coordinates; Hex retains stock. |

The synthetic restriction is deliberately narrower than deleting copied attributes. Copycat still copies Compass Cannon's approved arrow and number, and approved mechanics retain their existing Copycat exceptions. For newly redesigned counters, the restriction prevents the first copied merge from producing extra value again.

#### C3. New mechanics × boss skills

| Family | Star-down / Star Leech | PETRIFY | Shuffle / SCRAMBLE | FORCE MERGE | Merge-block |
|---|---|---|---|---|---|
| R | −1 star; keep variant and all counters. Recalculate 3/5/7-star perks. | Marks and form stored but inactive. Stone blocks subsequent straight rays. | Position-only shuffle keeps form/counters; SCRAMBLE rerolls type and deletes old state. | Random output; both old states lost; zero radiation. | Merge rejected, no materials consumed, no pulse emitted. |
| A | Keep number and Chrono bank; future equal-star merge eligibility changes. | Number and bank dormant until cleanse; stone merge destroys both. | Shuffle keeps number/bank; SCRAMBLE resets both. | Random output, no number inheritance or burst. | Arithmetic merge denied; existing independent banking continues if active. |
| V | Behaviour unchanged; lost star perks deactivate immediately. | Behaviour saved but inactive until cleanse. | Shuffle keeps behaviour; SCRAMBLE generates new type and seeded variant. | Random result with fresh variant; no opposite-form bonus. | No mode-changing merge, but normal unfrozen attack behaviour continues. |
| L | Recalculate Hammer's equal-star match and other star-dependent conditions; other valid links persist. | Automatic links involving stone deactivate; selected Recoil Tether breaks and loses pending transfer. | Shuffle rebuilds automatic geometry and breaks any manually selected tether whose endpoint moved; SCRAMBLE removes affected endpoints. | Consumed endpoint breaks link; random result may establish a new automatic link after resolution. | Existing links continue; blocked merge cannot create a new one. |
| P | Spatial formation remains if type/position still qualify; lost star perks deactivate. | Stone immediately breaks an occupied corridor or portal gap. | Shuffle recalculates all gaps; SCRAMBLE may change required endpoint types. | S becomes empty, T gets random type; recalculate after merge, with no immediate proc. | Corridors continue normal attacks; no merge-created spatial changes. |
| E | Keep current Gene/stock; future output rules use the updated star. Fixed 2-star Layaway output remains fixed. | Producer production pauses; reserved cell becoming stone cancels Layaway and refunds 10 mana. | Position shuffle keeps stock but may invalidate cell reservation; SCRAMBLE resets producer state. Completed player-owned Draft selection remains queued. | No offspring. Producer stock lost. Queued Draft survives; Layaway tied to consumed producer cancels with 10-mana refund. | New native economy merges blocked; existing countdowns and already-paid deliveries can continue if their cells remain legal. |

Two important resolutions:

First, a frozen turret cannot shoot, use skills, or provide Support effects, but may retain stored counters until thaw. Existing Merge King, Teleporter, and Copycat exceptions for interacting with frozen units remain intact.

Second, distinguish a position shuffle from type SCRAMBLE. Moving a unit preserves its identity and stored progression. Replacing its type does not. That single distinction should prevent many difficult bugs in PvP lockstep and boss interactions.

The jackpot tables define when the new mechanics may influence existing jackpot outcomes and when they do not trigger them. They do not replace unknown internal thresholds of Chromatic Heist, Blood Eclipse, Grand Chorus, or Six Seals.

#### PART D — Top 5 to implement first

I would test the changes on a small group before touching all 21. These five exercise different kinds of decision-making and are reasonably easy to evaluate in a real match.

| Priority | Turret | Why implement now | Main validation |
|---|---|---|---|
| 1 | Tesla — Reverse Current | Clear +/− behaviour, row/column radiation, permanent growth. Strongest immediate test of whether radiation is enjoyable. | Players deliberately choose T polarity and align multiple copies. |
| 2 | Ice Blade — Edge Arithmetic | Closest to the Compass design philosophy without copying its directional aiming. One visible number and two genuinely different attack modes. | Players choose merge direction and preserve a preferred mode rather than always merging as soon as possible. |
| 3 | Frost — Pin / Purge | Replaces a basic freeze-only Special with two opposite decisions: enemy control versus protecting friendly turrets from boss freeze. | The Purge form is valued even when the enemy is not vulnerable to slow. |
| 4 | Ricochet — Bankshot Corridor | Tests whether empty cells can become valuable resources. Visually simple and strategically unusual. | Players intentionally preserve a corridor rather than filling every available cell. |
| 5 | Cloner — Target Gene | Tests the most important economy redesign: chosen output through source/target merge direction instead of random production. | Players understand S→T versus T→S and successfully plan future deck output. |

A useful success metric is not simply higher win rate. In controlled matches with the same seed, measure how often players intentionally delay, reverse, or reposition a possible merge because doing so improves their intended outcome.

For instance, a Cloner redesign is successful when two equally skilled players can use the same initial board to construct meaningfully different decks through their merge decisions.

#### Three balance exploits to avoid

1. Recursive free-unit production

Cloner → Copycat → Cloner, or Twin Maker copying another producer, could generate zero-cost chains.

Rule: Free offspring and copied new-mechanic turrets are synthetic for one native merge. That merge can increase star and preserve visible traits but creates no additional production or permanent-merge payout. Paid Draft and prepaid Layaway outputs are exempt.

2. Exponential radiation and counter duplication

Several overlapping rays could accidentally credit the same unit multiple times, while merging high-counter copies by addition would amplify the issue.

Rule: At most one counter increment per recipient per emitter merge event. Native merge inheritance uses max(S,T) except where an explicit arithmetic mechanic says otherwise. Bonuses add, never multiply each other. Counters stay uncapped; if live data shows runaway growth, scale marginal benefit above 20 stacks to one-third, as Compass already does.

3. Proc explosions involving Chain Reactor and jackpot attacks

Bonus shells, portal shots, Tesla arcs, and synchronized hits could accidentally count as new qualifying attack events and trigger more proc effects.

Rule: Every event carries normal_attack, bonus_hit, or merge_effect identity. Only qualifying real normal attacks advance Chain Reactor's hit requirement. Bonus events cannot generate additional merge events or recursively trigger their own bonus-shot producer. Damage calculations remain deterministic; rendering and audio can be rate-limited independently.

#### Final design direction

The next prototype should not add another system of hidden counters. It should demonstrate these three visible outcomes:

Merging changes distant units, sometimes permanently changing their behaviour.

Two visibly different copies have different strategic values, and the direction of the merge genuinely matters.

The location of a merge or an empty cell can be more valuable than an immediate star upgrade.

If those three behaviours work at real phone speed on the 5×3 board, the redesign will have moved beyond slow stacking, passive Support clones, and random free-turret production.
