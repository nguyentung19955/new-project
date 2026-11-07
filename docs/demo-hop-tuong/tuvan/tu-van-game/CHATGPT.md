# ChatGPT — Turret Merge special mechanics & jackpot design review (07/11/2026)

Chat mới "Game Design Review" (Chrome của người dùng, Thinking effort Medium, ~5 phút), đính kèm [BRIEF.md](BRIEF.md). **CHƯA ÁP DỤNG** — chỉ lưu để người dùng quyết. Số là đề xuất của GPT (LV9), chưa mô phỏng. Tóm tắt tiếng Việt: [TOM-TAT.md](TOM-TAT.md).

Câu hỏi: vai senior designer (Random Dice / DCDW / Rush Royale) — (a) cái gì vui / nhạt; (b) 10 cơ chế jackpot mới/làm lại (luật, số, độ khó 1–5, hình tối giản, phản đòn PvP, tất định); (c) cặp hợp/khắc; (d) nhịp; (e) rủi ro + sửa; (f) top 5 ưu tiên. Không lặp 7 jackpot mẫu bàn của lần trước.

---

## Answer 1 (verbatim text, charts omitted)

### Executive assessment
Turret Merge already has enough mechanical variety. Its main problem is not a shortage of special abilities; many abilities **reward accumulation without creating a satisfying moment of achievement**. Mechanics fall into three experiences:
- **Passive accumulation** — numbers grow; player is stronger but did not accomplish something.
- **Random jackpots** — something powerful happens, little control over earning it.
- **Skill-earned jackpots** — player intentionally shapes the board, sacrifices, sequences merges or times abilities. *This third category should define Turret Merge's identity.*

Breakthrough tiers are a progression system, not the jackpot system: "a tier milestone tells the player how strong they have become; a jackpot tells them what exceptional action they just accomplished."

Targets: 8–12 core build-arounds out of 93 · normal jackpot length 8–15 s · PvP 2–3 jackpots per player per match (design targets, not playtest data).

Conventions: numbers at card LV9 before card-level scaling, rarity, power-ups, breakthroughs. +100% damage = 2.0× base; +50% attack speed = 1.5× attacks/s; +80% crit damage = +80 pp on crit multiplier. D9 = turret's normal LV9 damage per hit. A jackpot's bonuses apply only to its recipient, never automatically to the whole board. Keep breakthrough thresholds, seeded RNG, 15 cells, 7★ max, uncapped counters; separately control the *effective* damage contribution of extreme stacks.

### (a) Current mechanics — fun vs flat
| Turret | Assessment | Why |
|---|---|---|
| Ember Relay | Strong | Every merge changes multiple turrets; row/column placement meaningful |
| Chain Link | Strong | Connected topology, visible strategy, tension when a chain breaks |
| Railgun | Strong | Full rows/columns understandable and memorable — but assembly may be too difficult for the payoff |
| Nine-Tail | Strong | 9 visible tails → 9 foxfires = excellent completion-and-release loop |
| Scrap Forge | Strong | Sacrifice = real opportunity cost; needs a distinctive completed state |
| Compass Cannon | Promising | Same/opposite directions create decisions; number accumulation needs a dramatic resolution |
| Prism Thief | Promising | 3-colour timing can reward skill, but combo reward is mostly a number |
| Blood Circuit | Promising | Cross-type merging engaging; VAMP lacks a signature spending opportunity |
| Star Cannon | Promising | Rewards board development; exact-milestone bonuses risk being awkward/confusing |
| Quantum Choir | Promising | Clear same-star identity, reward entirely passive |
| Orbital | Promising | 23 s global awakening satisfying, may become repetitive |
| Combo Core | Promising | Long-term plan, but repeated merges feel the same unless behaviour changes |
| Fusion Archive | Flat | Generic merges happen naturally; +2.5%/merge needs no distinctive decision |
| Werewolf | Flat | 30% roll = excitement from luck, not skill |
| Pandora Vault | Uncontrolled | 6 outcomes fun but unplannable |

Five conclusions:
1. **Visible mechanical transformations beat large percentage bonuses** (Nine-Tail foxfires, Orbital salvos are memorable because behaviour changes; +200% can be stronger yet emotionally weaker).
2. **Permanent stacking is progression, not a jackpot.** Archive, Ember, Combo each need a high-impact action that *demonstrates* the accumulated power.
3. **Most dangerous passive: Quantum Choir** — twelve same-star units can be twelve 1★ units, so its high breakthrough is much easier than it sounds. Reward maintaining a deliberate formation under pressure, not many matching low-star summons.
4. **Economy turrets deserve strategic consequence** (Mana Core, Mana Doubler, Cloner, Twin Maker, Merge King): keep production online vs convert cells into damage.
5. **Real difficulty currency is board opportunity cost.** On 15 cells, keeping 4 in a chain, sacrificing 3 to Forge, or reserving cells for a sequence may cost more than 1,000 mana. Difficulty = cells occupied + mana + actions forgone + timing restrictions + vulnerability to disruption, not just trigger rarity.

### (b) 10 new / reworked jackpot mechanics
Difficulty: 1 routine · 2 setup · 3 deliberate sequencing · 4 substantial sacrifice/coordination · 5 rare mastery.

**1. TRUE NORTH — Compass Cannon (3/5)**
- Trigger: 3 same-arrow Compass→Compass merges within 45 s, no opposite-arrow Compass merge between (other merges allowed); resulting number ≥ 6.
- Reward: all Compass Cannons +110% dmg, +45% AS, +70 pp crit dmg for 12 s; triggering Compass fires one piercing shot 600% D9. Sequence resets; cooldown 30 s after effect ends; numbers unchanged.
- VFX: 3 tiny compass ticks around one icon; arrows briefly gold; one gold line for the piercing shot.
- PvP: Scrambler disrupts preparation; resource pressure forces premature merges; completed jackpot not dispellable by ordinary jam, damage reducible by short disables (shield protects).

**2. CHROMATIC HEIST — Prism Thief (4/5)**
- Trigger: 3 Prism same-colour merges in order RED → GOLD → BLUE within 60 s (colour sampled on merge-command tick); wrong colour resets. Colour cycle deterministic per resolved shot.
- Reward: all Prism Thieves WHITE PRISM 10 s: +160% dmg, +65% AS, +120 pp crit dmg; every 3rd shot piercing white shot (no extra multiplier). COMBO stacks kept.
- VFX: 3-segment R/G/B marker; thin white edge on active units, no aura.
- PvP: short jams disrupt colour timing; Hex reduces star efficiency; counter with shields / Teleporter.

**3. MASTERWORK — Scrap Forge (5/5)**
- Trigger: feed one 1★, one 2★ and one 3★ into the same Forge within 75 s (any order); Forge must survive. Existing +4%/stack kept.
- Reward: highest-★ Attack turret (tie → lowest cell index) becomes MASTERWORK 15 s: +240% dmg, +85% AS, +150 pp crit dmg; first attack on each boss +800% D9 once per boss per activation. Grades reset, permanent stacks stay; once per 90 s per Forge.
- VFX: 3 small ingot slots on Forge; thin gold outline on recipient; short hammer strike.
- PvP: pressure the sacrificed board before completion, force defensive summons, disable the carry after; shields block disable but not the opportunity cost.

**4. COMPLETE RECORD — Fusion Archive (4/5)**
- Trigger: with ≥1 Archive, complete 10 qualifying real merges with at least one merge using **each of the 5 deck types** as input (existing Archive counting rules; special feeds/teleports/Copycat/Overclock/stone don't count). Shared ledger.
- Reward: all Archives +145% dmg, +55% AS, +90 pp crit dmg 14 s; each Archive releases its 3-pulse burst at 200% D9 (replaces ordinary Archive+Archive burst for that activation). Permanent charges kept; record + flags reset.
- VFX: 5 small dots around the Archive icon; one page-flip flash.
- PvP: deny safe merges / board capacity delays it; permanent charge cannot be erased.

**5. CHAIN REACTOR — Chain Link (4/5)**
- Trigger: orthogonal group ≥ 4 Chain Links; within 5 s at least 3 distinct members each land 3 direct hits → group overloads (only that group).
- Reward: 12 s +150% dmg, +60% AS, +90 pp crit dmg; every 6th combined hit launches a chain bolt 250% D9 at another enemy. Group cooldown 40 s; +40% group-size bonus unchanged.
- VFX: small electric dots on qualifying members; one lightning jump between linked tiles; no persistent beam.
- PvP: Scrambler breaks formation; Freezer / Static Jammer / disables interrupt the hit sequence.

**6. BLOOD ECLIPSE — Blood Circuit (4/5)**
- Trigger: ≥ 6 shared VAMP, then 2 different-star Blood conversions within 25 s (each still costs 2 VAMP + normal ×220% pulse); remaining 2 VAMP auto-spent to activate (6 total).
- Reward: every Blood Circuit 11 s: +180% dmg, +70% AS, +110 pp crit dmg; each fires 3 red piercing pulses over 3 s, 300% D9 each (each enemy hit once per pulse).
- VFX: VAMP counter red → white-red; 3 short path pulses; no tint.
- PvP: rival punishes the temporary instability of two conversions; star disruption lowers converted units' quality.
- Why: VAMP becomes a currency to save or deliberately spend.

**7. ORBITAL CASCADE — Orbital (3/5)**
- Trigger: 2 Orbital+Orbital merges inside the same 23 s AWAKENED window (extensions don't extend the deadline).
- Reward: all Orbitals +100% dmg, +45% AS, +60 pp crit dmg for 10 s; each Orbital launches 4 bombs at highest-HP enemies (cell-order tie-break), 180% D9 each. Once per 45 s.
- VFX: Orbital rings align; 4 small projectiles; 3-dot sequence counter.
- PvP: pressure forces merges elsewhere; freeze/jam cut temporary DPS but don't cancel a launched cascade.

**8. PERFECT RELEASE — Chrono Lock (4/5)**
- Trigger: during one time-freeze (counting window fixed 3 s) the locked enemy takes ≥ 8 damaging hits from ≥ 3 distinct turret types; freeze must end normally.
- Reward: release +250% of stored damage (pre-jackpot hit damage); Chrono Lock's next 3 attacks +120% dmg, +50% AS, +100 pp crit dmg (≤ 8 s). Bonus release vs boss ≤ 4% boss max HP per activation. Cooldown 25 s.
- VFX: 8 small ticks around target + 3 type indicators; one compressed shock ring.
- PvP: disrupt contributing turrets; freeze-immune / control-resistant enemies reduce consistency.

**9. GENESIS CONVERGENCE — Genesis Core (5/5)**
- Trigger: one Genesis Core raises the stars of 3 different turret instances with its passive within 120 s; all 3 must still exist at the third raise (other star sources don't count).
- Reward: those 3 units 15 s: +200% dmg, +75% AS, +140 pp crit dmg (Support/non-shooters +50% to their numeric effect instead); first new 1★ summon during the window auto-upgrades to 2★ free. Cooldown 120 s per Core.
- VFX: 3 tiny gold marks on bases, small star-rise; no board glow.
- PvP: Star Breaker, Nightmare, Star Leech make keeping the 3 units costly; star loss doesn't erase progress but the target must exist.

**10. CRITICAL MASS — Star Cannon (5/5)**
- Trigger: ≥ 50 live board stars held continuously 12 s while an Attack-type Star Cannon is present (resets if total < 50, not when it rises).
- Reward: all Star Cannons 12 s: +250% dmg, +90% AS, +160 pp crit dmg; every 5th shot = line-piercing blast 350% D9 per enemy (replaces shot). Cooldown 90 s and the board must drop below 50 and regain it to re-arm. Ordinary 10/50 scaling stays separate.
- VFX: small 50/50 badge turns gold; one barrel pulse; only the 5th shot has a special projectile.
- PvP: Nightmare, Hex, Star Leech can drop the board below 50; Holy Shield / star protection answers.

Balance table (diff → dmg / AS / crit dmg / duration): True North 3 → +110/+45/+70 pp/12 s · Chromatic Heist 4 → +160/+65/+120/10 s · Masterwork 5 → +240/+85/+150/15 s · Complete Record 4 → +145/+55/+90/14 s · Chain Reactor 4 → +150/+60/+90/12 s · Blood Eclipse 4 → +180/+70/+110/11 s · Orbital Cascade 3 → +100/+45/+60/10 s · Perfect Release 4 → +120*/+50*/+100*/≤8 s (*next 3 attacks + stored burst) · Genesis Convergence 5 → +200/+75/+140/15 s · Critical Mass 5 → +250/+90/+160/12 s.
"Masterwork should be much rarer than Orbital Cascade, not simply deal more damage" — duration, recipients, frequency and additive vs multiplicative stacking change real value.

### (c) Synergy / anti-synergy
1. **Chrono Lock + Laser + Amplifier** (strong) — single-target boss execution. Laser ticks count ≤ 1 per 0.25 s for Perfect Release; release damage must not re-enter Amplifier stacking. Weak vs scattered fast waves without AoE.
2. **Venom + Purifier + Toxic Pool** (strong) — poison detonation. Purifier kill explosion 180% D9 + 2 s poison mark, no chain explosions from explosion kills. 3 dedicated cards limit economy.
3. **Chain Link + Teleporter + Shield Gen** (strong) — protected chain. Shield blocks one control, not Scrambler's physical move. Two non-damage slots.
4. **Scrap Forge + Merge King + Copycat** (strong) — hypercarry production. Proposed: Copycat copies feed Forge at 50% stack value and don't qualify for Masterwork grades until they complete one normal merge (anti cheap-feed loop). Very high mana/board demand.
5. **Ice Blade + Chiller + Cryo Reactor** (strong) — frost burst. Single isSlowed condition; more slow sources extend coverage, never multiply the +400%. Ice flyers immune, bosses 50% slow cap.
6. **Quantum Choir + Sync Cannon + Star Lift** (conditional) — same-star formation. Choir counts matching units alive ≥ 3 s for a new formation bonus. Merging destroys uniformity → keep formation vs merge up.
7. **Lone Ace + Radar + Resonance Grid** (anti-synergy puzzle) — Lone Ace can take diagonal Resonance Grid while staying isolated; cannot take Radar without losing isolation.
8. **Energy Cannon + Mana Doubler + Cloner** (economic anti-synergy) — proposed Energy Cannon threshold: ≥ 500 current mana → +60% dmg, +20% AS, lost immediately below 500. Hoard vs spend.

Deck archetypes to test: Precision execution (Chrono Lock, Laser, Amplifier, Sniper, Shield Gen — weak to spread waves) · Poison detonation (Venom, Purifier, Toxic Pool, Mana Core, Chiller — poison resistance) · Living circuit (Chain Link, Teleporter, Shield Gen, Radar, Mimic — board disruption) · Masterwork carry (Scrap Forge, Merge King, Copycat, Hydra, Mana Doubler — early tempo) · Frozen blades (Ice Blade, Chiller, Cryo Reactor, Blizzard, Cleanser — ice flyers) · Same-star formation (Quantum Choir, Sync Cannon, Star Lift, Twin Maker, Mimic — unstable stars) · Isolated ace (Lone Ace, Resonance Grid, Sniper, Mana Leech, Teleporter — limited space) · Mana reserve (Energy Cannon, Mana Doubler, Cloner, Mana Core, Hammer — spending conflicts). Each viable archetype: ≥1 favourable, 1 unfavourable, 1 interactive matchup; no universal lineup.

### (d) Pacing (20 s waves; wave 10 ≈ 3:00)
| Mode | First breakthrough | First jackpot | Ideal jackpots |
|---|---|---|---|
| Solo | wave 5–7 (1:20–2:20) | wave 11–14 (3:20–4:40) | 3–5 per 10–15 min |
| Co-op | wave 4–6 (1:00–2:00) | wave 9–12 (2:40–4:00) | 4–7 combined per 10–15 min |
| PvP | wave 4–6 (1:00–2:00) | wave 8–11 (2:20–3:40) | 2–3 per player |
Full 70-wave run ≈ 23 min 20 s.
- Solo arc: W1–4 functional defense · W5–7 first breakthrough ring · W8–10 first boss tests coherence · W11–14 first achievable signature jackpot ("response to surviving the first boss") · W20–30 deck identity + first high-difficulty attempt · W40–70 repeatable jackpots are survival tools, not auto-win. Don't force Genesis/Critical Mass to hit by W14.
- Co-op: complementary roles; **assist credit** — when one player directly enables the other's jackpot, small assist icon + helper gets 30 mana (once per jackpot, ≤ once per 45 s); no damage multiplier.
- PvP: first major spike near the W10 boss; first true jackpot W8–11; one more before sudden death (W30 ≈ 9:40); players should usually have an answer before a hard setup completes. Launch goal: 65–80% of matches with ≥1 jackpot per player, < 15% decided mainly by an uncontested first jackpot.
- Track time from setup start to activation and whether the player survived to use it.

### (e) Risks and fixes
1. **Snowballing** (more dmg → kills → mana → merges → jackpots). Fixes: no jackpot generates > 30 mana incidental; per-jackpot cooldown + re-arm condition; jackpot projectiles' kills can't recursively trigger the same effect in one tick; in PvP use staged boss pressure, **no hidden rubber-banding**.
2. **Uncapped stacking × multiplicative crit.** Example: +500% stacks, +240% Masterwork, +100% AS Lone Ace, +85% AS Masterwork, 100% crit, ×5 crit → 6.0 × 3.4 × 2.0 × 1.85 × 5.0 ≈ **377× DPS**. Recommended pipeline: D_hit = D9 × M_meta × M_power × (1 + B_stack + B_jackpot + B_support) × M_crit × M_target; AS = AS9 × (1 + B_speed). Keep visible stacks and crit dmg uncapped, but put ordinary dmg and AS bonuses in **additive buckets**; keep only deliberate multipliers (vulnerability, RAGE) separate; diminishing effectiveness only if tests show runaway; limit recursion, repeated boss %max-HP hits, projectiles per tick. Solo may use a more permissive profile than PvP (same deterministic rules).
3. **Unreadable boards.** Max 3 persistent indicators per turret: one thin ring (breakthrough tier), one progress bar (jackpot preparation), one state icon (ready/shielded/disabled); details in inspector. Priority: lethal threat > disabling effect > jackpot completion > breakthrough > damage numbers. Activation burst ≤ 0.45 s; no full-board flash; ≤ 3 visible damage-number groups per board; aggregate chain/projectile hits; show a visual subset of mass projectiles while simulating all.
4. **PvP frustration** = opponent undoing minutes of prep with one unavoidable click. Proposed: Hex — max one sabotage star loss per turret per 20 s · Scrambler — 1.0 s warning · Freezer — telegraph targets 1.5 s · Star Leech — show targeted unit before theft · Signal Jammer — cost increase expires, no permanent stacking · Copycat — copied jackpot progress resets (Awakened/Gold kept). Keep Holy Shield / Shield Gen / Sanctum / Mirror Gate meaningful, not total immunity.
5. **Deterministic lockstep.** Jackpots = state transitions on simulation events, never visuals that alter logic. Events carry tick, playerId, turretInstanceId, eventType, sequence number. Order: OnMergeResolved → validate → apply → update Archive / Compass / Prism / Orbital progress → evaluate completion → enqueue activation → resolve in deterministic order. Fixed tick (30/60), integer timers, stable instance IDs, separate gameplay vs cosmetic RNG, sort ties by player/priority/ID, no dependence on frame rate / object order / wall clock; fixed-point preferred. Merge-triggered jackpots evaluate before later attacks/sabotage in that tick; hit-triggered only after the hit resolves.
6. **93-turret balance**: with 5 uniform deck cards each summon is 20% a given card; "4 copies" conditions hide large costs. Run ≥ 10,000 seeded sims per archetype: first appearance of required turret, first breakthrough, first jackpot + failed attempts, peak occupied cells / board-locked time, setup opportunity cost, effectiveness per boss, PvP win rate by first-jackpot timing.

### (f) Top 5 priorities
1. **Deterministic jackpot framework + telemetry** (reusable progress/cooldown/activation, checksums, event-order tests, jackpot logs). Acceptance: 10,000 replayed seeded matches → identical checksums and activation ticks.
2. **Scrap Forge MASTERWORK** — strongest demonstration of hard → big. Acceptance: largest short-term spike of the first three, but not best average DPS in every matchup.
3. **Orbital CASCADE** — accessible, frequent contrast. Acceptance: 1–2 cascades per 10 min for a dedicated deck, not on every routine merge.
4. **Prism Thief CHROMATIC HEIST** — difficulty from timing. Acceptance: skilled testers ≥ 1.5× success rate of beginners on same seeds.
5. **Full PvP stress test + reward pipeline** with bosses, sabotage, protections, RAGE, uncapped stacking. Acceptance: no common matchup unwinnable right after one jackpot.
Roadmap: Foundation → Masterwork → Orbital Cascade → Chromatic Heist → PvP/boss balance gate → Chain Reactor, Blood Eclipse, True North → Complete Record, Perfect Release, Genesis Convergence, Critical Mass.

Final: three levels — **Stacking** (continuous, incl. DOTPHA rings) · **Jackpot** (earned short spike) · **Mastery** (intentional repetition). "Reward should scale with difficulty, but difficulty must include sacrifice, execution, risk, and lost opportunity — not just how rarely a condition occurs."

---

## Follow-up (hỏi thêm: jackpot cho ụ rẻ / làm lại Choir-Werewolf-Pandora / ĐỘT PHÁ theo độ khó)

"Give low-tier units more frequent, smaller jackpots, while reserving the highest ceilings for difficult Gold/Red setups."

### 1. Four jackpots for White / Blue / Purple / Support
| Jackpot / Turret | Diff. | Trigger | LV9 reward | VFX / PvP counter |
|---|---|---|---|---|
| **LOADED DICE** — Dice Gun (White) | 3 | natural rolls in 3 different bands (3–100%, 101–200%, 201–300%) within 12 consecutive shots; crit-forced max rolls don't count | next 6 attacks roll exactly 300%, +70% AS, +80 pp crit dmg (max 8 s) | 3 tiny pips fill; gold dice icon · jam delays the six attacks |
| **THUNDER TRIANGLE** — Tesla (White) | 4 | three Teslas ≥ 2★ each chain-hit ≥ 3 enemies within the same 5 s window | all three +130% dmg, +65% AS, +100 pp crit dmg 10 s; first chain after activation +2 jumps | 3 small lightning indicators · freeze/jam prevents synchronized chains |
| **FIFTH FRENZY** — Fifth Shot (Purple) | 3 | one Fifth Shot lands 3 consecutive fifth-shot volleys with all 3 bolts hitting (non-fifth attacks don't reset) | next 3 fifth-shot volleys fire 5 bolts; +100% dmg, +50% AS, +70 pp crit dmg ≤ 12 s | 1/3-2/3-3/3 badge; short purple barrel glow · crowd reduction or disable |
| **PERFECT FREQUENCY** — Radar (Blue, Support) | 4 | Radar has 4 orthogonal Attack neighbours of ≥ 3 different types continuously 8 s | those 4 units +85% dmg, +50% AS, +90 pp crit dmg 10 s (on top of Radar's normal bonus) | 4 corner ticks; thin gold Radar ring · Scrambler breaks prep; disabling Radar ends it early |
Radar must stay useful without its jackpot. Dice Gun uses the combat RNG stream; triggers resolve on fixed ticks; count hits after damage resolution. Cooldowns after expiry: Loaded Dice / Fifth Frenzy 30 s, Thunder Triangle 45 s, Perfect Frequency 50 s; all must re-earn triggers.

### 2. Reworks for flat / uncontrolled mechanics
- **Quantum Choir — GRAND CHORUS (4/5).** Keep +18% per other same-★ turret. New trigger: ≥ 6 turrets incl. one Choir share the same ★, ≥ 3 of them Attack turrets of different types, held 10 s. Jackpot: all Choirs of that ★ +160% dmg, +60% AS, +110 pp crit dmg 12 s. Breaking formation resets prep; cooldown 50 s; re-arm requires break and reform. (Twelve 1★ summons no longer guarantee the jackpot.)
- **Werewolf — BLOOD MOON HUNT (4/5).** Keep 30%+ AWAKENED + guaranteed crits. Trigger: an AWAKENED Werewolf lands 20 hits and 3 kills within 20 s without being merged away (boss hits count for hits, not kills). Jackpot: that Werewolf 12 s +180% dmg, +75% AS, +150 pp crit dmg, guaranteed crits. Cooldown 45 s; failed hunt resets counters. (Awakening roll = opportunity, not the full reward.)
- **Pandora Vault — SIX SEALS (5/5).** Same 6 effects but a deterministic **shuffle bag**: each valid merge opens one seal; every 6-opening cycle gives all six exactly once in seeded order. On the 6th opening also **ROYAL VAULT**: highest-★ Attack turret +220% dmg, +85% AS, +150 pp crit dmg 15 s, plus 100 mana. Bag resets; 6★/7★ extra rolls draw from the same bag and advance a seal each.

### 3. Scale BREAKTHROUGH by difficulty? "Yes — but moderately." Current values = difficulty 3 baseline (cumulative):
| Difficulty | I: AS | II: crit dmg | III: dmg | IV: crit chance / crit dmg |
|---|---|---|---|---|
| 2 | +12% | +25 pp | +20% | +8 pp / +40 pp |
| 3 | +15% | +30 pp | +25% | +10 pp / +50 pp |
| 4 | +20% | +40 pp | +35% | +12 pp / +65 pp |
| 5 | +25% | +50 pp | +45% | +15 pp / +85 pp |
(Diff-5 unit at Tier IV: +25% AS, +135 pp crit dmg, +45% dmg, +15 pp crit chance from breakthroughs alone.)
Safeguards: classify difficulty by the actual effort to reach Tier IV (Choir's 12 is easier with 1★ than 5★); don't multiply breakthrough × rarity × jackpot × Support as separate unrestricted multipliers — add to the right bucket, then apply crit.

Next: start with Loaded Dice + Perfect Frequency + the Quantum Choir rework (stochastic progress with guaranteed payoff, support positioning, same-star formation). "White units should win through frequent attainable jackpots; Gold/Red units through rarer, more powerful jackpots — not simply because rarity multiplies their stats."
