# ChatGPT — ICE / SLOW / TIME redesign (07/11/2026)

Hỏi qua Chrome (ChatGPT, thinking High, ~18 phút suy nghĩ). Đầu vào: [BANG-BANG.md](BANG-BANG.md) + `tu-van-game/BRIEF.md` + `cong-huong/KIEM-KE.md` + `cong-huong/BAO-CAO.md` (bản dịch tóm tắt) + 5 ý tưởng gốc của session điều phối (Frost Shatter, Ice Blade Frostbite, Chiller Brittle, Blizzard Snowfall, Cryo Absolute Zero). Câu trả lời đủ cụ thể nên không hỏi thêm. Dưới đây là nguyên văn (chuyển sang markdown). Tóm tắt tiếng Việt: [TOM-TAT.md](TOM-TAT.md).

---

# Turret Merge — ICE / SLOW / TIME Redesign

Design verdict: Keep all 12 relevant units, but remove generic slowing as the main reward from 9 of them. The family should become a set of complementary mechanics: freezing, shattering, consecutive-hit mastery, critical vulnerability, path coverage, crowd counting, elemental sequencing, deferred damage, rewinding, color combinations, anti-healing, and damage echoes.

I reviewed all four supplied documents, including the 93-turret roster and the 361-pair collision audit.

The numbers below are proposed LV9 balance values, not claims about the current implementation. They are designed around the existing 5×3 board, 20-second waves, seven-star progression, deterministic PvP, and the rule that harder conditions must pay more.

## (a) ICE / SLOW / TIME redesign

### Shared state rules

Introduce only four reusable combat states. Keep all specialized progress counters local to their owning mechanic.

| State | Meaning | Creators | Consumers |
| --- | --- | --- | --- |
| CHILL | Movement slow; strongest active percentage wins. | Frost aftermath, Cryo Reactor aura | Cryo Reactor's crowd counter; legacy slowed checks |
| FROZEN | Enemy movement stops temporarily. | Frost, Ice Blade, Blizzard, Cryo Reactor, where eligible | Frost's Shatter; Ice Blade's consecutive-hit opportunity |
| BRITTLE | Adds percentage points to critical-damage multiplier against that enemy. | Chiller | Any eligible critical direct attack |
| TIME-LOCKED | Stops movement; records incoming damage for a delayed secondary burst. | Chrono Lock | Chrono Lock's burst; legacy slowed checks |

Collision precedence: TIME-LOCKED > FROZEN > CHILL for movement. BRITTLE is independent and can coexist with all three.

Additional implementation rules:

- CHILL never adds percentages. Preserve the 90% normal-enemy and 50% boss caps.
- FROZEN and TIME-LOCKED have independent timers. Neither refreshes the other, and their overlapping durations do not add together.
- Propose one shared 3-second re-freeze immunity after thawing, extending Frost's existing protection to all freeze sources. TIME-LOCKED is not blocked by freeze immunity.
- Ice Flyers remain immune to CHILL and FROZEN, but vulnerable to TIME-LOCKED and ordinary damage mechanics.
- BRITTLE adds to crit damage, not crit chance. Crit chance remains capped at 100%; crit damage stays uncapped. Multiple Chillers use the strongest BRITTLE value, not the sum.
- Preserve the existing 35% × tier conditional damage vs slowed bucket for any abilities that still use it. BRITTLE is not that bucket.
- New buffs on frozen/stone/muted turrets do not apply while those states prevent support reception. Preserve de-star effects against frozen/stone turrets.
- Secondary damage (Shatter, Echo, delayed bursts) cannot recursively generate another secondary trigger. RAGE applies exactly once to each resulting damage event, avoiding accidental ×4 scaling.

### Recommended abilities and exact star progression

All values LV9. Percentages labeled × refer to damage multipliers; +CD means additive critical-damage percentage points. Difficulty 1–5 measures how hard it is to activate the main payoff, not how rare the card is.

| Unit / new identity | Difficulty | 1★ | 3★ | 5★ | 7★ |
| --- | --- | --- | --- | --- | --- |
| Frost — Crystal Verdict | 3 | Every 6s freeze lead 2s; first allied crit during freeze triggers Shatter: 60% of triggering hit as 44px splash | Freeze 2.5s; Shatter 80% | CD 4.5s; Shatter 100% | Freeze 2 leads; Shatter 120%; execute eligible small enemies below 15% HP |
| Ice Blade — Frostbite Duelist | 4 | 3 consecutive hits: +50% damage per streak step, finisher ×3, freeze 0.5s | 4 hits; +65%/step, finisher ×4, freeze 0.75s | 5 hits; +75%/step, finisher ×6, freeze 1s; 40% splash | 6 hits; +90%/step, finisher ×10, freeze 1.25s; 65% splash |
| Chiller — Brittle Forge | 4 | 4 adjacent Attack hits apply BRITTLE +25 CD for 3s | 4 hits from at least 2 attacker types: +45 CD | 5 hits from at least 2 types: +75 CD | 6 hits from at least 3 types: +120 CD |
| Blizzard — Snowfall Cartographer | 4 | Cover 5/8 path segments: WHITEOUT ×1.5 damage, freeze 0.5s | 6/8 segments: ×2.5, freeze 0.8s | 7/8 segments: ×4.5, freeze 1s | 8/8 segments: ×7, freeze 1.2s |
| Cryo Reactor — Absolute Zero | 5 | 4 simultaneously CHILLED/FROZEN/LOCKED enemies in aura: automatic pulse, 100% adjacent-base-damage sum, 12s CD | 6 enemies: TAP after 24s charge; 200% burst, freeze 1.5s | 8 enemies: 400% burst, freeze 2.5s; boss skill speed −25% for 4s | 10 enemies: 700% burst, freeze 4s; adjacent Attack turrets +25 CD for 4s |
| Eclipse — Twilight Relay | 4 | 2 DAY hits on same enemy, then NIGHT hit: ×2 damage, +20% personal AS for 3s | 3 DAY marks → ×3, +35% AS | 4 marks → ×5, +55% AS | 5 marks → ×8, +90% AS and +75 CD for 3s; ×4 transition ring on successful combo |
| Chrono Lock — Deferred Verdict | 4 | Every 7.5s lock 1.2s; burst 40% of recorded damage | 6.5s CD; lock 1.6s; 55% stored | 5.5s CD; lock 2s; 75% stored | 4.5s CD; lock 2.5s; 95% stored |
| Chrono Throne — Path Debt | 5 | Enemy alive ≥8s gets one ×2 base-damage AGE hit; no slow | AGE ≥10s; TAP CD 36s: REWIND 15%, ×6 base damage | AGE ≥14s; TAP CD 32s: REWIND 23%, ×9 | AGE ≥18s; TAP CD 28s: REWIND 30%, ×13; restore 1 heart once |
| Prism Thief BLUE — Chromatic Debt | 3 | BLUE applies 5s seal; later RED/GOLD shot consumes it for ×1.6 | Seal 6s; ×2.2 | Seal 7s; ×3 | All three colors as existing 7★ perk; prior-shot BLUE seal gives ×4.5 and GOLD +80 CD for that shot |
| Venom 7★ — Septic Break | 4 | 5s mark: +12% damage taken | 5s mark: +15% | 5s mark: +18% | Mark +22%; if target loses 25% max HP during mark, trigger 15% max-HP poison burst; healing received −60% |
| Rainbow 7★ — Spectrum Echo | 4 | First trail tint crossed: +8% damage taken for 2s | Cross 2 distinct tints within 5s: next hit echoed at 25% | Cross 3 tints: next 2 hits echoed at 45% | Cross 3 tints: next 3 hits echoed at 75%; remove 35% slow |
| Pandora Vault — Snowglass Fortune | 5 | Replace 1-in-6 freeze-all outcome: next 2 allied crits gain +30 CD | Next 3 crits +50 CD | Next 4 crits +85 CD | Next 6 crits +130 CD |

For Chrono Lock, add an additional difficulty-based reward when at least three different Attack turret types damage the locked enemy: increase its stored-damage burst by +20% / +40% / +60% / +100%, at 1★ / 3★ / 5★ / 7★ respectively. These multiply only the stored burst, not the original hits.

### Rules needed to make the numbers implementable

| Mechanic | Precise trigger / limitations |
| --- | --- |
| Frost | One Shatter per freeze application. Execute checks remaining HP after the triggering crit and excludes giants, bosses and Ice Flyers. Giants receive 60% freeze duration; bosses max 0.6s. Shatter splash cannot crit or execute other targets. |
| Ice Blade | Streak belongs to each turret–target pair, resets on target switch, and resets after the finisher. Damage ramp starts from the second consecutive hit. Finisher multiplier replaces, rather than multiplies, that hit's ramp multiplier. Bonus damage still works if freeze is resisted. Base hit remains 16.8 at 0.75 attacks/s before buffs. |
| Chiller | Only its four orthogonally adjacent Attack turrets contribute hits. Diversity means distinct original turret types, not separate copies of one type. Counter expires after 3s without a qualifying hit. BRITTLE lasts 3s. |
| Blizzard | Divide the existing path into 8 fixed logical segments. Each hit marks the target's segment with snow lasting 16s; one mark per segment. WHITEOUT consumes all marks, has 18s CD, deals damage based on Blizzard's existing base 26, and affects enemies currently present. |
| Cryo Reactor | Keep radius 110 + 5×★ px, plus the existing +20px perk at 3★+. Aura CHILL is 20% + 2.5%×★, refreshed every 0.4s. Count unique affected enemy IDs, not slow sources. 3★+ requires a charged active and the crowd threshold simultaneously. Pulse damage uses a snapshot of the four adjacent Attack turrets' unbuffed LV9 base-hit damage. |
| Eclipse | Keep alternating DAY/NIGHT every 8s. DAY retains its 4s burn; NIGHT retains cone damage but loses generic slow. Solar marks last through the next NIGHT window, expire after 12s, and a successful combo clears its marks. The 7★ ×4 ring happens only on a completed combo. |
| Chrono Lock | Recorded damage is actual qualifying hit damage, normalized before RAGE. The burst is noncritical and cannot record itself. On merge, instant-lock still triggers but obeys target immunity. Bosses remain eligible only when alone, receiving 50% slow and half lock duration/burst. Ice Flyers can be locked. |
| Chrono Throne | AGE counts real time alive, including time stopped, but not additional time from moving backward. Rewind does not reset AGE or trigger path-enter effects twice on the same crossing. Boss rewind distance is one-third of the listed percentage. |
| Prism Thief | BLUE seal must exist before the consuming shot begins. The same projectile cannot create and consume its own seal, including at 7★. A seal is consumed once. |
| Venom | At 7★, healing reduction applies while marked. The 25%-HP-loss threshold produces one bonus burst per mark; for bosses, cap that burst at 2% boss max HP. Poison does not slow. |
| Rainbow | Tint identity comes from deterministic path-segment color cycling. Echoes preserve their original attacker's turret-type identity, cannot crit, and cannot trigger other Echoes. 7★ removes the previous trail slow. |
| Pandora Vault | The existing seeded 1-in-6 merge outcome becomes a crit-damage token pool lasting 8s. It triggers only when Pandora's normal merge skill actually executes. No extra merge RNG calls. |

For Cryo Reactor, preserve the existing 7★ passive +10% damage taken by enemies in its aura, independently of the crowd pulse. Its existing boss-freeze duration cap of 0.8s remains in force. Blizzard boss freezes should use a separate 0.6s cap; Ice Blade boss freeze is capped at 0.35s.

These are deliberately not all DPS-equivalent. White units receive smaller standalone payoffs, while Gold/Red units earn their bigger multipliers through timing, board patterns, or rare enemy conditions. That follows the difficulty principle without ignoring the existing White ×1.0 / Blue ×1.3 / Purple ×2.0 / Gold ×2.6 / Red ×2.7 tier budgets.

### Matchups and PvP counterplay

| Mechanic | Strong against | Weak against / PvP counterplay |
| --- | --- | --- |
| Frost | Small enemy swarms, Hive Mother drones, Splitters; excellent with critical decks | Ice Flyers, short boss freezes, loss of nearby crit attackers; Freezer/Janus disabling Frost |
| Ice Blade | Giants, high-HP bosses, Patch Titan between heals | Fast enemies and Twin Core splitting, which reset the streak; Jammer reducing effective attacker speed |
| Chiller | Durable enemies, crit-focused decks, Prism Warden support after shield removal | One-shot waves; decks with only one attacker type; Static Jammer prioritizing supports |
| Blizzard | Hive Mother, Splitters, densely populated paths | Lone bosses, sparse fast waves, insufficient segment coverage; losing a high-star Blizzard before WHITEOUT |
| Cryo Reactor | Hive Mother, high-density waves, multiple simultaneous Splitters | Lone boss waves, Ice Flyers, range limits; Static Jammer disabling the support and active |
| Eclipse | Giants, Patch Titan, other enemies surviving a full day/night cycle | Fast flyers, enemies dying before NIGHT, Star Leech reducing a 7★ combo |
| Chrono Lock | Ice Flyers, single high-HP enemies, lone bosses with half-strength effect | Multi-enemy boss waves, boss control resistance, too few attackers during the lock |
| Chrono Throne | Long-lived bosses, high-HP giants, Patch Titan | Fast kills, short-lived drones, late TAP availability; star loss below 3★ |
| Prism Thief | Durable enemies surviving color changes, crit-support decks | Short-lived waves; 7★ still needs two distinct shot events; colors do not bypass Prism Warden's type requirement |
| Venom 7★ | Patch Titan, regenerating enemies, high-HP giants | Small enemies dying before the 25% damage condition becomes valuable; de-starring below 7★ |
| Rainbow 7★ | Enemies traversing several tinted segments, long-lived bosses | Enemies dying before enough crossings, short path exposure, anti-setup disruption |
| Pandora Vault | Crit-heavy teams, Werewolf, Dice Gun | Low-crit decks, insufficient attacks during the 8s token window, unfavorable seeded merge outcome |

PvP design constraint: None of these enemy-control effects directly slow the rival player's turrets. The opponent counters the strategy indirectly through existing sabotage, boss disruption, star loss, or by outperforming its damage economy. Eve, Mirror Gate and Shield Gen protect against their documented boss/rival effects; they do not cleanse your CHILL or TIME-LOCK from monsters on your own lane.

## (b) Interaction and collision tables

SYN = useful synergy; ANTI = a counter or unfavorable interaction; OVERRIDE = an explicit precedence/replacement rule; – = no direct interaction.

Codes: F Frost · I Ice Blade · C Chiller · B Blizzard · R Cryo Reactor · E Eclipse · L Chrono Lock · T Chrono Throne · P Prism Thief · V Venom · W Rainbow · O Pandora Vault.

### 1. ICE / TIME cross-mechanic interactions

Rows are the source mechanic. Columns are the other mechanic. A row's self-interaction defines how duplicate copies behave.

Matrix A — Frost through Eclipse

| Source | F | I | C | B | R | E |
| --- | --- | --- | --- | --- | --- | --- |
| F | OVERRIDE: thaw immunity | SYN: target held for streak | SYN: crit activates Shatter | OVERRIDE: freeze immunity | SYN: frozen counts once | SYN: holds DAY marks |
| I | SYN: crit finisher shatters | –: private streak | SYN: crit finisher gains CD | SYN: WHITEOUT preserves streak | SYN: finisher freeze counts | –: independent ramps |
| C | SYN: stronger Shatter crit | SYN: finisher crit | OVERRIDE: strongest BRITTLE | SYN: critical wave benefits | SYN: 7★ adjacent CD bonus | SYN: NIGHT crit payoff |
| B | OVERRIDE: shared freeze immunity | SYN: pauses streak target | SYN: critical WHITEOUT | SYN: shared path coverage | SYN: frozen adds to count | SYN: holds heat target |
| R | SYN: Frozen counts as slowed | SYN: CHILL extends streak window | SYN: boosts adjacent crits | SYN: WHITEOUT primes crowd | OVERRIDE: unique enemy IDs | SYN: CHILL extends combo window |
| E | SYN: NIGHT crit can Shatter | –: separate hit counters | SYN: thermal crit benefits | SYN: frozen combo window | SYN: aura holds solar marks | OVERRIDE: marks consumed once |
| L | OVERRIDE: parallel stop timers | SYN: lock holds streak target | SYN: crit damage stored | OVERRIDE: parallel stop timers | SYN: locked counts once | SYN: holds target across swap |
| T | SYN: frozen time builds AGE | SYN: older targets survive streaks | –: AGE not BRITTLE | SYN: WHITEOUT builds AGE | SYN: CHILL prolongs survival | SYN: long fights favor combo |
| P | SYN: GOLD crit Shatters | –: no shared counters | SYN: GOLD crit boosted | SYN: holds BLUE-sealed enemy | SYN: CHILL extends seal window | SYN: independent color cycles |
| V | SYN: Shatter reaches HP threshold | SYN: finisher reaches threshold | SYN: crits cause Septic Break | SYN: WHITEOUT triggers break | SYN: burst triggers break | SYN: burn reaches threshold |
| W | SYN: longer on tinted trail | SYN: finisher can Echo | –: Echo cannot crit | SYN: frozen during crossings | SYN: aura holds enemies | SYN: NIGHT shot can Echo |
| O | SYN: crit makes Shatter | SYN: finisher crit bonus | SYN: additive CD on crit | SYN: critical WHITEOUT | SYN: adjacent crit benefits | SYN: critical thermal combo |

Matrix B — Chrono Lock through Pandora

| Source | L | T | P | V | W | O |
| --- | --- | --- | --- | --- | --- | --- |
| F | OVERRIDE: independent timers | SYN: held time builds AGE | SYN: GOLD crit Shatters | SYN: Shatter triggers rupture | SYN: target stays on tint | SYN: boosted crit Shatters |
| I | SYN: streak during lock | SYN: aged high-HP prey | –: separate attack counters | SYN: finisher reaches rupture | SYN: finisher Echo | SYN: boosted finisher crit |
| C | SYN: stronger stored crits | –: AGE independent | SYN: GOLD crit boosted | SYN: crit reaches rupture | –: Echo noncritical | SYN: CD bonuses combine |
| B | OVERRIDE: parallel timers | SYN: freeze builds AGE | SYN: preserves BLUE seal | SYN: burst reaches rupture | SYN: segment/tint coexist | SYN: WHITEOUT attack can crit |
| R | SYN: lock counts once | SYN: slow extends survival | SYN: seal persists longer | SYN: crowd burst causes rupture | SYN: clusters on trails | SYN: adjacent crit tokens |
| E | SYN: lock holds target across mode | SYN: target survives to age | SYN: two independent sequences | SYN: burn builds HP loss | SYN: direct shots Echo | SYN: Sunset crit boosted |
| L | OVERRIDE: one lock per target | SYN: lock time builds AGE | SYN: BLUE seal retained | SYN: stored hits cause rupture | SYN: held on trail | SYN: critical damage stored |
| T | SYN: locking builds AGE | OVERRIDE: AGE once per enemy | –: distinct timers | SYN: long boss fight/antiheal | OVERRIDE: no rewind tint farming | –: AGE pulse noncritical |
| P | SYN: seal survives lock | –: AGE not color | OVERRIDE: seal consumed once | SYN: color combo reaches rupture | SYN: GOLD shots Echo | SYN: GOLD crit buffed |
| V | SYN: hits during lock count | SYN: antiheal protects long fight | SYN: combo triggers rupture | OVERRIDE: strongest vulnerability | SYN: Echo hits count toward HP loss | SYN: crits meet threshold |
| W | SYN: lock holds tint position | OVERRIDE: rewind cannot farm tint | SYN: GOLD shot echoed | SYN: Echo helps rupture | OVERRIDE: unique tint IDs | –: Echo cannot crit |
| O | SYN: crit damage enters ledger | –: AGE pulse noncritical | SYN: GOLD crit jackpot | SYN: faster rupture | –: Echo cannot consume crit token | OVERRIDE: one token per hit |

Two important anti-exploit decisions: Blizzard snow coverage may be accelerated by multiple Blizzards, but one logical segment still holds only one snow mark. Multiple Chillers never add BRITTLE values together; the strongest active BRITTLE wins.

### 2. Critical-unit interactions

| Mechanic | Hammer | Crit Antenna | Focus Lens | Berserker | Werewolf | Dice Gun |
| --- | --- | --- | --- | --- | --- | --- |
| F | SYN: crit → Shatter | SYN: more crit triggers | SYN: stronger crit-fed splash | SYN: crit bursts Shatter | SYN: awakened guaranteed crit | SYN: max-roll crit splash |
| I | SYN: finisher crit | SYN: finisher frequency of crit | SYN: finisher crit damage | SYN: repeated-hit frenzy | SYN: crit finisher | –: independent dice rolls |
| C | SYN: crit + stagger | SYN: BRITTLE used often | SYN: additive crit damage | SYN: frenzy crit payoff | SYN: awakened jackpot | SYN: maximum-roll jackpot |
| B | SYN: critical WHITEOUT hit | SYN: critical wave chance | SYN: critical wave damage | –: separate attacks | –: separate attacks | –: separate attacks |
| R | SYN: adjacent crits at 7★ | SYN: neighboring crit buff | SYN: crit-damage combination | SYN: adjacent frenzy | SYN: adjacent awakened crit | SYN: adjacent max-roll damage |
| E | SYN: NIGHT critical combo | SYN: more Sunset crits | SYN: ×8 combo crit damage | –: independent attacker | –: independent attacker | –: independent attacker |
| L | SYN: crits stored | SYN: more critical stored hits | SYN: larger stored damage | SYN: frenzy fills ledger | SYN: awakened damage stored | SYN: max-roll damage stored |
| T | –: AGE pulse noncrit | –: AGE pulse noncrit | –: AGE pulse noncrit | ANTI: early kills prevent AGE | ANTI: early kills prevent AGE | ANTI: early kills prevent AGE |
| P | SYN: GOLD critical shot | SYN: more GOLD crits | SYN: GOLD +CD combination | –: independent attacker | –: independent attacker | –: independent attacker |
| V | SYN: critical HP loss | SYN: reaches 25% threshold | SYN: stronger rupture setup | SYN: frenzy crosses threshold | SYN: awakened HP loss | SYN: high roll crosses threshold |
| W | –: Echo noncrit | –: Echo noncrit | –: no Echo CD scaling | SYN: rapid hits consume Echoes | SYN: hits consume Echoes | SYN: original hit can Echo |
| O | SYN: spends crit tokens | SYN: faster token use | SYN: additive CD | SYN: many crit opportunities | SYN: guaranteed crit spending | SYN: crit max roll +CD |

Here, an Echo uses the original hit's pre-critical damage after ordinary damage modifiers. It does not inherit the original hit's critical multiplier. This prevents Rainbow + Werewolf + Focus Lens from duplicating an uncapped critical multiplier at 75% on every Echo.

### 3. Stack / jackpot interactions

| Mechanic | Amplifier | Nine-Tail | Chain Link | Quantum Choir | Star Cannon |
| --- | --- | --- | --- | --- | --- |
| F | SYN: repeat hits on held target | SYN: Shatter helps kills | SYN: linked damage on held target | SYN: stronger hits during freeze | SYN: milestone shot can Shatter |
| I | SYN: repeated-target stacking | SYN: finisher kills build tails | SYN: link damage on finisher | SYN: Choir damage on same target | SYN: milestone pressure |
| C | SYN: repeated adjacent hits | SYN: crit kills accelerate tails | SYN: linked crit payoff | SYN: Choir crit payoff | SYN: Cannon crit payoff |
| B | –: no shared stacking | SYN: swarm kills feed tails | –: no chain formation | –: no shared same-star bonus | –: no milestone change |
| R | SYN: more hits during CHILL | SYN: enemies held for foxfires | SYN: grouped targets take linked DPS | SYN: Choir can attack held targets | SYN: Cannon can attack held targets |
| E | SYN: repeated DAY attacks | SYN: combo kills build tails | –: no shared counter | –: separate counter | –: separate milestone |
| L | SYN: repeated hits stored | SYN: foxfire damage stored | SYN: linked damage stored | SYN: Choir damage stored | SYN: Cannon hit stored |
| T | ANTI: burst kills before AGE | ANTI: foxfires kill too early | ANTI: fast kills prevent AGE | ANTI: early kills prevent AGE | ANTI: burst kills before AGE |
| P | SYN: repeated color-target hits | SYN: combo kills build tails | –: distinct mechanic | –: distinct mechanic | –: distinct mechanic |
| V | SYN: stacked damage reaches 25% | SYN: foxfires reach threshold | SYN: linked damage reaches threshold | SYN: Choir damage reaches threshold | SYN: Cannon burst reaches threshold |
| W | OVERRIDE: Echo not another stack hit | SYN: Echo kill can earn tail | OVERRIDE: Echo doesn't build links | OVERRIDE: no extra Choir count | OVERRIDE: no extra milestone hit |
| O | SYN: stacked critical payoff | SYN: critical kill payoff | SYN: linked critical hit | SYN: Choir critical hit | SYN: Cannon critical hit |

Important distinction: Quantum Choir's +18% per matching-star turret and Chain Link's +40% per additional connected member remain their own damage scaling. An ICE mechanic must not grant those bonuses to itself merely because it happens to be on the same board.

### 4. Support interactions

| Mechanic | Radar | Star Lift | Armor Breaker | Venom |
| --- | --- | --- | --- | --- |
| F | –: no normal attack | –: no normal attack | –: non-damage caster | SYN: marked target takes Shatter |
| I | SYN: faster streaks | SYN: low-star streak speed | SYN: enhanced finisher hit | SYN: mark boosts finisher |
| C | SYN: adjacent Attack hits faster | SYN: adjacent low-star hits | SYN: exposed enemy crit payoff | SYN: marked + BRITTLE target |
| B | SYN: faster snow placement | SYN: faster low-star coverage | SYN: exposed WHITEOUT target | SYN: burst vs marked target |
| R | –: not an Attack turret | –: not an Attack turret | SYN: adjacent Attack damage | SYN: marked pulse damage |
| E | SYN: quicker DAY marks | SYN: quicker low-star combo | SYN: exposed thermal burst | SYN: thermal + mark |
| L | –: lock CD unchanged | –: lock CD unchanged | SYN: exposed damage stored | SYN: marked damage stored |
| T | –: AGE based on real time | –: AGE based on real time | SYN: enhanced TAP damage if applicable | SYN: antiheal supports long fight |
| P | SYN: rapid color hits | SYN: faster low-star RGB | SYN: exposed color combo | SYN: mark + color burst |
| V | –: no normal attack | –: no normal attack | SYN: exposed hits reach threshold | OVERRIDE: strongest active mark |
| W | –: path-triggered support | –: path-triggered support | SYN: exposed original hit echoed | SYN: Echo and mark damage |
| O | SYN: adjacent attackers spend tokens | SYN: adjacent attackers spend tokens | SYN: boosted critical hit | SYN: boosted marked crit |

Radar and Star Lift apply to eligible Attack turrets under their normal adjacency rules. They do not reduce Frost's timer, Chrono Lock's skill CD, or Chrono Throne's AGE threshold merely because those units deal some damage.

### 5. Merge, Copycat, turret states, and PvP

| Mechanic | Copycat | Mimic | FROZEN turret | STONE turret | PvP |
| --- | --- | --- | --- | --- | --- |
| F | SYN: copied freeze; 70% Shatter damage | OVERRIDE: ordinary merge resolution | ANTI: cannot cast | ANTI: cannot cast | ANTI: 3s immunity limits chains |
| I | SYN: separate streak counter | ANTI: merge resets streak | ANTI: cannot attack | ANTI: cannot attack | SYN: precision boss killer |
| C | SYN: copied setup, strongest BRITTLE | ANTI: merge loses adjacency | ANTI: aura disabled | ANTI: aura disabled | ANTI: high-star support targeted |
| B | SYN: shared snow coverage | ANTI: merge removes caster | ANTI: cannot lay snow | ANTI: cannot lay snow | SYN: swarm control, 18s gate |
| R | SYN: copied aura; no double-counted enemy | ANTI: merge may break four-neighbor setup | ANTI: aura/TAP off | ANTI: aura/TAP off | ANTI: sparse boss waves |
| E | SYN: independent solar marks | ANTI: merge loses mode progress | ANTI: no attack output | ANTI: no attack output | ANTI: 8s cycle predictable |
| L | SYN: copied lock with private CD | OVERRIDE: source decides merge proc | ANTI: no skill cast | ANTI: no skill cast | SYN: Ice Flyer control |
| T | SYN: copied damage; AGE globally once | ANTI: merge loses TAP source | ANTI: no AGE/TAP output | ANTI: no AGE/TAP output | ANTI: needs long survivors |
| P | SYN: copied colors; same-type identity | ANTI: merge loses color progress | ANTI: no shots | ANTI: no shots | ANTI: combo target can die |
| V | SYN: copied mark, strongest vulnerability | ANTI: mark source lost on merge | ANTI: cannot apply mark | ANTI: cannot apply mark | SYN: counters Patch Titan |
| W | SYN: copied trail, unique tint checks | ANTI: merge breaks trail source | ANTI: trail off | ANTI: trail off | ANTI: no hard-control lock |
| O | SYN: copied outcome at 70% damage where applicable | OVERRIDE: only source's merge skill runs | ANTI: no ordinary merge skill | ANTI: no ordinary merge skill | ANTI: seeded 1-in-6 outcome |

Copycat's status-duration and trigger behavior is not completely specified in the provided inventory. The table proposes that copies retain the copied ability's normal duration, use private cooldowns, and apply the existing 70% factor only to damage. Copies keep the copied turret's original type identity for Prism Warden and Chiller diversity checks.

For the existing turret-state engine, keep these precedence rules unchanged:

| Collision | Winning rule |
| --- | --- |
| Frozen/stone turret receives new BURN, CLAMP, MUTE, or STONE | OVERRIDE: ignore the new bad state |
| Frozen/stone turret receives Nightmare or Star Leech star loss | OVERRIDE: lose the star; protection does not block de-starring |
| Frozen/stone target receives Merge King / Teleporter / Copycat special drag | OVERRIDE: existing special-drag exception remains; target merge skill does not run |
| MUTE turret receives any merge attempt | OVERRIDE: no merge, including special merges |
| Same-star STONE + STONE | OVERRIDE: STONE +1★; no merge skill |
| Rival sabotage vs board shield | OVERRIDE: board shield blocks; then apply existing unit-shield rules as applicable |
| Rival sabotage vs Mirror Gate and unit shield | OVERRIDE: Mirror resistance first, then shield; reflection cannot chain |
| Pandora and Mimic/Forge merge collision | OVERRIDE: source-driven resolution; preserve audited Mimic + Forge = normal merge |
| Fusion Archive with Teleporter swap | OVERRIDE: swap is not a real merge and adds no charge |
| REINFORCE on frozen units | OVERRIDE: skip frozen units |
| Multiple simultaneous damage procs | OVERRIDE: fixed event order and no recursive Echo/Shatter/burst generation |

### 6. All 12 boss interactions

Boss matrix A — board transformation and control

| Mechanic | Mad Crown | Freezer | Janus Cube | Joker King |
| --- | --- | --- | --- | --- |
| F | ANTI: eligible caster rerolled | ANTI: high-★ freeze disables cast | ANTI: stone disables cast | ANTI: forced merge loses caster |
| I | ANTI: attacker identity rerolled | ANTI: freezes attacker | ANTI: stone stops streak | ANTI: forced merge resets streak |
| C | ANTI: adjacency/type diversity broken | ANTI: support frozen | ANTI: support stone | ANTI: neighbor layout broken |
| B | ANTI: snow caster replaced | ANTI: snow production stops | ANTI: snow production stops | ANTI: snow caster merged |
| R | ANTI: four-neighbor setup | ANTI: aura and TAP off | ANTI: aura and TAP off | ANTI: reactor setup lost |
| E | ANTI: phase source rerolled | ANTI: attacks stop | ANTI: modes cannot output | ANTI: mode progress lost |
| L | ANTI: lock caster replaced | ANTI: lock unavailable | ANTI: lock unavailable | ANTI: lock source lost |
| T | ANTI: AGE caster replaced | ANTI: TAP unavailable | ANTI: TAP unavailable | ANTI: TAP source lost |
| P | ANTI: color caster rerolled | ANTI: no shots | ANTI: no shots | ANTI: RGB progress lost |
| V | ANTI: mark source rerolled | ANTI: no new marks | ANTI: no new marks | ANTI: future mark source lost |
| W | ANTI: trail source replaced | ANTI: support trail off | ANTI: trail off | ANTI: trail source lost |
| O | ANTI: Pandora rerolled | ANTI: cannot merge normally | ANTI: cannot merge normally | ANTI: forced merge not a free jackpot |

Boss matrix B — star loss, swarms, and disabling support

| Mechanic | Nightmare | Octopus Eyes | Hive Mother | Static Jammer |
| --- | --- | --- | --- | --- |
| F | ANTI: 7★ becomes 6★ | ANTI: delayed star loss | SYN: Shatter splashes drones | ANTI: disables if selected |
| I | ANTI: finisher tier reduced | ANTI: lower streak reward | ANTI: drones reset target streak | ANTI: stops attacks if selected |
| C | ANTI: +CD tier reduced | ANTI: delayed star loss | ANTI: weak setup on short-lived drones | ANTI: support targeted first |
| B | ANTI: coverage threshold/tier changes | ANTI: delayed star loss | SYN: many targets, path coverage | ANTI: stops snow placement |
| R | ANTI: TAP can disappear below 3★ | ANTI: delayed star loss | SYN: many slowed enemies charge pulse | ANTI: support targeted first |
| E | ANTI: 7★ combo lost | ANTI: delayed star loss | ANTI: short-lived solar marks | ANTI: disables output if selected |
| L | ANTI: lower lock/burst tier | ANTI: delayed star loss | ANTI: lead drone absorbs lock | ANTI: disables lock if selected |
| T | ANTI: TAP can disappear below 3★ | ANTI: delayed star loss | ANTI: drones die before AGE | ANTI: disables TAP if selected |
| P | ANTI: 7★ all-color perk lost | ANTI: delayed star loss | ANTI: color seals expire on deaths | ANTI: shots disabled if selected |
| V | ANTI: 7★ antiheal lost | ANTI: delayed star loss | ANTI: drones die too quickly | ANTI: marks stop if selected |
| W | ANTI: 7★ Echo lost | ANTI: delayed star loss | SYN: mass trail crossings | ANTI: support targeted first |
| O | ANTI: crit-token count reduced | ANTI: delayed star loss | SYN: more eligible crit targets | ANTI: merge ability off if selected |

Boss matrix C — shields, split targets, healing, and stealing stars

| Mechanic | Prism Warden | Twin Core | Patch Titan | Star Leech |
| --- | --- | --- | --- | --- |
| F | ANTI: one Shatter source ≠ 3–4 types | SYN: 7★ catches 2 cores | ANTI: 0.6s boss freeze | ANTI: removes Shatter perk tier |
| I | SYN: finisher after shield break | ANTI: streak resets on split | SYN: sustained boss damage | ANTI: lowers finisher tier |
| C | SYN: diverse neighbor types help break shield | SYN: crit boosts on both cores | SYN: crit damage vs durable target | ANTI: loses BRITTLE tier |
| B | ANTI: shield absorbs most wave damage | SYN: AoE damages both cores | ANTI: poor lone-boss coverage | ANTI: weakens WHITEOUT |
| R | SYN: burst counts as one damage type | ANTI: only 2 cores for threshold | ANTI: lone boss fails count | ANTI: TAP tier reduced |
| E | SYN: one Eclipse damage type | ANTI: marks reset on split | SYN: long boss survives combo | ANTI: lower Sunset reward |
| L | SYN: delayed burst counts as one type | ANTI: one lead core locked | SYN: lone boss eligible at half effect | ANTI: lowers stored percentage |
| T | SYN: TAP damage is one type | ANTI: new cores reset AGE | SYN: heal extends time to AGE | ANTI: 3★ TAP can be lost |
| P | ANTI: 3 colors count as one turret type | ANTI: seal lost on split | SYN: long-lived combo target | ANTI: 7★ RGB perk lost |
| V | SYN: Septic burst is one damage type | ANTI: mark resets on split | SYN: healing −60%; poison burst | ANTI: 7★ antiheal disappears |
| W | ANTI: Echo keeps original type identity | SYN: both cores may cross trail | SYN: sustained Echo damage | ANTI: 7★ Echo disappears |
| O | ANTI: tokens don't create new turret types | SYN: crit tokens used on both cores | SYN: durable crit target | ANTI: token count reduced |

Prism Warden's shield still needs hits from 3–4 distinct turret types. A 7★ Prism Thief does not count as three types; copying one type does not add another. Separate turret-owned damaging skills such as a Frost Shatter or Cryo pulse may count as their own single type if they deal a qualifying hit.

Boss resistance rule: Freeze resistance changes control duration, not the identity of the underlying damage. Patch Titan healing remains untouched except where Venom 7★ explicitly reduces healing. None of these new mechanics should secretly disable boss abilities except Cryo Reactor's documented 5★ cast-speed modifier.

## (c) Other redundant families in the 93-turret roster

The roster contains several additional clusters where multiple units primarily increase the same number: attack speed, crit chance, crit damage, generic damage, or resource generation. I would not rework all 93. Many already have distinct triggers. The goal is to preserve those identities and replace their most interchangeable rewards.

### Family 1 — Critical damage and execution

| Turret | Distinct identity to retain or strengthen |
| --- | --- |
| Hammer | Impact Crit: neighboring crits build stagger rather than only increasing damage. |
| Crit Antenna | Precision Network: reliable crit chance; at 100% crit chance, excess bonuses may convert to crit damage at 2:1. |
| Focus Lens | Piercing Crit: critical damage becomes valuable through target penetration. |
| Berserker | Rage Momentum: consecutive critical hits unlock a temporary attack-speed frenzy. |
| Werewolf | Awakened Predator: 30% AWAKENED state supplies guaranteed crits during a burst window. |
| Dice Gun | Maximum Roll: crits force the maximum 300% damage roll, producing jackpots even on a cheap unit. |
| Lone Ace | Isolation Sniper: no orthogonal neighbors unlocks massive personal attack-speed/crit bonuses. |
| Guillotine | Lucky Execution: chance-based instant kill against small enemies. |
| Reaper Pillar | Execution Support: adjacent turrets execute normal enemies under 30% HP. |
| Nemesis | Boss Executioner: low-HP finisher against ordinary enemies, max-HP damage against bosses. |

Highest-risk overlap: Crit Antenna and Hammer can both feel like generic crit supporters unless Hammer's stagger is highly visible and Crit Antenna specializes in reliability.

### Family 2 — Attack speed and repeated fire

| Turret | Distinct identity |
| --- | --- |
| Radar | Stable Accelerator: unconditional adjacent Attack speed, useful in every deck. |
| Star Lift | Underdog Accelerator: strongest benefit goes to the lowest-star neighboring Attack. |
| Fusion Mixer | Diversity Engine: attack speed rises with distinct Attack types in its row/column. |
| Overclock | Sacrifice Overdrive: give up a turret to permanently accelerate a selected shooter. |
| Gatling | Heat Engine: sustained firing grows speed; changing target vents accumulated heat. |
| Nine-Tail | Kill Momentum: kills build tails and unlock the nine-foxfire reward. |

Only Radar should be deliberately simple. The others should require a specific board layout, sacrifice, targeting pattern, or kill condition.

### Family 3 — Generic damage support

| Turret | Distinct identity |
| --- | --- |
| Armor Breaker | Priority Expose: designate lead and toughest enemies for enhanced focused damage. |
| Amplifier | Single-Target Investment: repeated attacks on one enemy build damage. |
| Sync Cannon | Star Harmony: matching-star Attack units earn a network bonus. |
| Star Breaker | Offensive Sabotage: strengthen allied Attack turrets while threatening opposing high-star units. |
| Cleanser | Recovery Support: cleanse nearby units; grant fallback damage when there is nothing to cleanse. |
| Sanctum | Protected Formation: combine cleansing, shielding and damage for a stable four-neighbor cluster. |
| Resonance Grid | Diagonal Geometry: reward an arrangement that ordinary adjacency supports cannot cover. |
| Rainbow | Path Memory: replace passive slow with the Spectrum Echo condition from part (a). |

Recommendation: Keep regular Support buffs additive and uncapped as decided, but make conditional jackpot multipliers derive from different events, not simply another unconditional +damage modifier.

### Family 4 — Mana economy

| Turret | Distinct identity |
| --- | --- |
| Mana Core | Stable Income: passive mana generation over time. |
| Mana Doubler | Merge Banking: large immediate mana payout on a real merge. |
| Mana Leech | Combat Economy: attacking enemies generates resources. |
| Bounty Beacon | Marked-Kill Contract: kill a designated enemy to earn extra mana. |
| Energy Cannon | Savings Cannon: retaining mana increases damage, creating a spend-versus-save decision. |

This family is already relatively differentiated. The main risk is that passive mana generation becomes strictly better than more conditional income. Compare their mana earned per 20-second wave, not just their maximum possible output.

### Family 5 — Merge, generation, and star manipulation

| Turret | Distinct identity |
| --- | --- |
| Mimic | Universal Ingredient: merges with any same-star unit but does not guarantee the resulting identity. |
| Copycat | Identity Borrower: produces a same-star functional copy at 70% damage. |
| Cloner | Population Growth: extra 1★ unit on merge; increases board population. |
| Twin Maker | Star Duplication: creates an additional same-star unit, emphasizing immediate star value. |
| Merge King | Controlled Evolution: preserve type while increasing star level, with a 10% GOLDEN jackpot. |
| Evolver | Delayed Evolution: sacrifice time for a random +1★ improvement. |
| Mystery Box | High-Variance Investment: after 58s, earn a random 1–6★ unit. |
| Genesis Core | Weakest-Link Repair: upgrade the lowest-star unit rather than a random target. |
| Lighthouse | Combat Recruitment: generate 1★ units from its orb-based gameplay. |
| Teleporter | Board Engineering: swap positions without creating real merge value. |
| Compass Cannon | Directional Merging: use orientation and merge number as the challenge. |
| Hero Foundry | Terrain Ownership: create the valuable HERO board tile rather than another turret. |

These are not functionally identical, but Cloner, Twin Maker, Evolver, Mystery Box and Lighthouse may all feel like generic free-unit generators. Their identities must differ by timing, star distribution and amount of player control.

### Family 6 — Stacking and jackpot damage

| Turret | Distinct identity |
| --- | --- |
| Ember Relay | Spatial Investment: row/column merges accumulate flame stacks. |
| Fusion Archive | Merge Historian: only genuine completed merges create permanent charges. |
| Combo Core | Self-Merge Ritual: merging two Combo Cores grows the shared COMBO level. |
| Scrap Forge | Selective Sacrifice: feed low-star units into the strongest Attack turret. |
| Leviathan | Devourer: enemy consumption grows permanent ABYSS damage. |
| Chain Link | Connectivity Puzzle: connected group size determines damage. |
| Quantum Choir | Star Choir: same-star board population determines damage. |
| Star Cannon | Board Wealth: total board star count unlocks milestones. |
| Railgun | Bingo Geometry: a full row and a full column reward different stats. |
| Orbital | Merge Timing: merges awaken all Orbitals for a 23-second power window. |

This is the family I would audit immediately after ICE. Especially important: Quantum Choir, Chain Link and Sync Cannon all benefit from keeping similar units or stars, but they should demand different board construction:

- Quantum Choir: matching-star population, regardless of adjacency.
- Chain Link: uninterrupted physical connectivity.
- Sync Cannon: matching-star Attack diversity or formation among eligible supported units.

Do not turn them all into the same +damage-per-matching-unit formula with different percentages.

### Family 7 — PvP disruption and protection

| Turret | Distinct identity |
| --- | --- |
| Jammer | Tempo Sabotage: reduce rival attack speed by 40%. |
| Signal Jammer | Economic Sabotage: increase rival summon costs, blocked by existing shields. |
| Scrambler | Identity Chaos: shuffle rival turret types or positions according to its actual skill. |
| Hex Saboteur | Permanent Star Threat: remove one star from a vulnerable rival unit. |
| Shield Gen | Disposable Protection: block one boss/rival control event. |
| Mirror Gate | Risk Reflection: resist then reflect an eligible hostile effect once, without chains. |
| Holy Halo | Board-Level Protection: reduce boss multi-target exposure and Freezer duration. |

Jammer and Signal Jammer should never share a generic jammed effect if that means the same outcome. One attacks battle tempo; the other attacks summon economy.

### Family 8 — Area damage and path control

| Turret | Distinct identity |
| --- | --- |
| Tesla | Branching Chain: damage multiple separate enemies through lightning jumps. |
| Storm Gun | Instant Arc: lightning damage without travel, but own-kind adjacency penalty. |
| Ricochet | Growing Bounce: each bounce increases damage. |
| Mortar | Cluster Punisher: every third shell rewards grouped enemies. |
| Fifth Shot | Rhythm Burst: every fifth shot releases triple explosive bolts. |
| Toxic Pool | Persistent Territory: damaging puddles punish enemies staying in one region. |
| Mine Layer | Preplanned Trap: place damage before an enemy arrives. |
| Wall Projector | Temporary Obstacle: block movement, then explode. |
| Black Hole | Spatial Compression: pull enemies into a high-damage zone. |
| Time Bomb | Delayed Detonation: five-second bomb with local weakening. |
| Drone Bay | Merge Payload: merge events release explosive drones. |
| Hive Queen | Autonomous Hunters: persistent drones pursue targets; SWARM is its payoff. |
| Wyrm Engine | Cone Commitment: positioning and DRAGON DIVE determine major damage. |
| Overlord | Charge Release: earn a heavy thunder blast by accumulating charge. |
| Iron Fist | Close-Range Brawler: melee punching followed by a ring blast. |

The largest risk here is Tesla / Storm Gun / Ricochet becoming three visual variations of chain attacks. Their optimal targets must differ: multiple separated enemies / immediate close arcs / long bounce sequences.

## (d) Top 5 implementation priorities

| Rank | Change | Cost | Impact | Main risk and required test |
| --- | --- | --- | --- | --- |
| 1 | Chiller → BRITTLE | Low–medium | Very high | Critical damage inflation. Test 2–4 Chillers, 100% crit, Focus Lens and Werewolf. |
| 2 | Ice Blade → consecutive-hit Frostbite | Low | High | 6-hit finisher too rare at base 0.75 attacks/s. Measure actual streak completions against giants and bosses. |
| 3 | Frost → Shatter | Low–medium | Very high | Crit-trigger recursion and instant-execute bugs. Enforce one Shatter per freeze. |
| 4 | Prism BLUE → Chromatic Debt | Low | High | At 7★ all colors exist together; ensure BLUE must come from an earlier shot event. |
| 5 | Venom 7★ → Septic Break | Low–medium | High, especially bosses | Max-HP damage and antiheal scaling. Verify Patch Titan 12% self-heal and 35% lane-heal independently. |

### One important Blizzard implementation refinement

BANG-BANG specifies Blizzard's periodic all-enemy attack, but does not establish a separate ordinary projectile frequency. Therefore, make snow placement a new deterministic action every 1.5 seconds. At each snow-placement tick, choose the lead enemy occupying an uncovered segment, if one exists; otherwise refresh the lead enemy's segment. Tie-break by stable enemy ID. Snow expires after 16s. This makes the 5/8–8/8 WHITEOUT condition testable.

### Regression tests before PvP release

| Test | Expected deterministic result |
| --- | --- |
| Frost freezes a target already under Time Lock | Both timers run; movement remains stopped; one Chrono burst; no extra frozen duration |
| Frost + Blizzard try freezing during 3s immunity | Neither reapplies freeze; their ordinary damage still works |
| Two Chillers apply +75 and +120 CD | Target receives +120 CD, not +195 |
| Prism 7★ fires all 3 colors at once | BLUE seal from this shot cannot be consumed by the same shot |
| Rainbow Echo kills an enemy | One attributed kill, no recursive Echo, no additional Amplifier hit |
| Cryo pulse with RAGE active | Pulse damage is doubled once, not twice through neighboring turret snapshots |
| Chrono Throne rewinds across a mine or trail | Reposition happens, but no duplicate reward from the same already-processed crossing |
| Frozen 7★ Venom receives Nightmare's −1★ | Star falls to 6; new debuffs remain blocked; 7★ antiheal perk is lost |
| Freezer targets a shielded unit | Preserve board shield / Mirror / unit shield priority from KIEM-KE |
| Teleporter swaps repeatedly beside Fusion Archive | No additional merge charges |
| Pandora triggers from a real merge | Exactly one seeded outcome, with no extra RNG consumption |
| Two clients replay the same PvP seed | Identical status timers, targets, damage, star totals and mana on every simulation tick |

For deterministic lockstep, store status expiry and cooldowns as integer simulation ticks (at 60 FPS, 1 second = 60 ticks), process same-tick events using a fixed order, and sort target selection by stable enemy ID whenever two entities have equal priority. New status ticks should never consume RNG.

### Balance acceptance targets (initial test targets)

| Measure | Initial target |
| --- | --- |
| Chiller 3★ BRITTLE uptime on a surviving giant with a properly built cluster | 35–60% |
| Ice Blade 5★ successful finisher rate against surviving giants | At least 1 finisher per 8–12s of continuous engagement |
| Frost Shatter activation with two active critical attackers | At least 50% of eligible freezes |
| Blizzard 7★ WHITEOUT frequency on dense waves | About once per 18–30s, respecting its 18s CD |
| Cryo Reactor 7★ Absolute Zero activation | Rare jackpot: generally no more than once per dense 20s wave |
| Prism 7★ Chromatic Debt on durable targets | One payoff every 2–4 qualifying shots |
| PvP determinism | Zero state divergence across identical seeded replays |

Final recommendation: The first complete deck to test should be Frost + Ice Blade + Chiller + Crit Antenna + Radar: freeze creates an opening, consecutive hits earn the finisher, diverse adjacent attacks unlock BRITTLE, crit chance activates Shatter, and attack speed helps complete the difficult condition.
