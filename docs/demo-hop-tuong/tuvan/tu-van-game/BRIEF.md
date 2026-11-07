# TURRET MERGE — Design Brief for a Special-Skill Consultation (Nov 2026)

Mobile (portrait + landscape) **merge tower defense**, modeled on *Dice Cats Dice Wars* (DCDW) / *Random Dice*. Web build (HTML5 canvas), solo dev. 93 turrets implemented. We want the **special/stacking mechanics** to create memorable "jackpot" moments and build-around decks while staying readable on a phone.

**Owner's design PRINCIPLE:** *"The harder a condition is to achieve, the higher the reward in damage, attack speed and crit damage."*

## 1. Core loop
- **Board 5×3 = 15 cells.** Enemies walk a U-shaped path around the board. Default target = lead enemy.
- **Mana** (only currency, per match): start 100, earned from kills (+ Mana Core / Mana Doubler / Mana Leech / Bounty Lamp). Resets each match.
- **SUMMON**: 10 mana, +10 each time → random **1★** turret from your 5-card deck.
- **MERGE**: drag a turret onto one of the **same type + same ★** → a **random deck turret at +1★** (max **7★**). Star = dice-face pips on the base. Some turrets have *special merges* (drag onto other types): Mimic, Merge King, Teleporter, Copycat, Overclock, Scrap Forge, Blood Circuit, Compass Cannon.
- **In-battle POWER-UP** (per card type, this match): 100 / 200 / 400 / 700 mana → +1 / +2 / +3 / **MAX**; +25% base damage per step to every copy (non-damage units get skill value steps instead).
- **Card level** (meta, LV1–15, LV9 = baseline numbers below): raises damage and skill values.
- **Waves:** 20 s each, max 70 (Solo/Co-op). **Boss every 10 waves.** Enemy types: normal, fast flyer, ice flyer (immune to slow), giant (2 hearts), splitter (→5), split-stick (wave 30+).
- **Commander (Archfiend) active**, pick 1 before match, cost ×2 each cast:
  - Hero **REINFORCE** (30 mana, cd 15 s): two free 1★ turrets; no room → +1★ to weakest.
  - Dahlia **RAGE** (40, cd 25 s): ×2 damage to the whole board for 10 s.
  - Eve **HOLY SHIELD** (40, cd 25 s): cleanse freeze/stone/burn + block boss skills and rival merge effects 8 s.
- Red (Mythic) turrets have a **tap-to-cast active** at 3★+ when charged.

## 2. Modes
- **Solo**: 3 hearts; giant/boss leak = 2 hearts.
- **Co-op**: 2 boards, 2 gates → shared zone → 1 core, 3 shared hearts; many "sabotage" skills become "help ally".
- **PvP**: same seeded waves; 3 hearts; from wave 30 **SUDDEN DEATH** (boss every wave, rising HP). Sabotage skills on merge: Jammer (−40% fire rate), Scrambler (shuffle), Signal Jammer (+mana cost), Hex Saboteur (−1★), Star Breaker, Rainbow (buffs rival's path). Defenses: Shield Gen, Mirror Gate, Sanctum, Holy Shield.
- **Online** (Firebase, deterministic lockstep: all RNG seeded; skills must be deterministic from board state).

## 3. Tiers and roles
- Tiers & power multiplier: **White ×1.0 · Blue ×1.3 · Purple ×2.0 · Gold ×2.6 · Red ×2.7**.
- Roles (40/27/18 design split, actual 44 Attack / 19 Support / 30 Special):
  - **Attack** – shoots.
  - **Support** – never shoots; buffs 4 orthogonal neighbours (Resonance Grid: 4 diagonals). Several only buff Attack units.
  - **Special** – utility / economy / merge-manipulation / **control** (freeze, slow, time lock, rewind) / PvP sabotage. "Control" is folded into Special.
- Summon and merge results are uniformly random among your 5 deck cards (no role weighting) — like DCDW.

## 4. Current special / stacking mechanics (LV9 numbers)
All stacking counters are **uncapped** (owner decision 07/11).

| Mechanic | Rule now | Difficulty (prev. GPT 1–5) |
|---|---|---|
| **Ember Relay** | merging a Relay gives +1 flame to every Relay in the same row AND column; flames kept through merges; +12% dmg +2% crit per flame | 3 |
| **Quantum Choir** | +18% dmg per other turret on your board with the same ★; 7★ +fire rate | 3 |
| **Fusion Archive** | +1 permanent charge per real merge (any type) → +2.5% dmg each; Archive+Archive = 3 pulses ×160% | 2 |
| **Scrap Forge** | FEED it a 1–3★ turret → stacks; your best Attack turret +4%/stack while Forge stays | 4 |
| **Leviathan** (Red) | devours a normal enemy every 5–9 s in range → +1 ABYSS (+4% dmg each, shared by all Leviathans); 4★+ eats giants ×3. Active TIDAL BREATH: sweeps whole path, dmg ×(4+0.1×ABYSS) | 3 |
| **Chain Link** | +40% dmg per extra Chain Link in its orthogonally connected group | 4 |
| **Combo Core** | each Combo+Combo merge → COMBO+1 for all Combo Cores: +6–12% dmg per COMBO (by ★), halved after 20 | 4 |
| **Nine-Tail** | kills grow tails (+5% fire rate each, max 9); at 9 tails: 9 homing foxfires ×(2+0.5×★), tails reset | 4 |
| **Railgun bingo** | full ROW (5) of Railguns: +200% dmg; full COLUMN (3): +150% fire rate; stones don't count | 5 / 4 |
| **Merge King** | same-star merge onto anything: +1★ keeping the type; 10% (+2%/card LV) GOLDEN = +2★ | 3 |
| **Orbital** | merging Orbitals AWAKENS every Orbital on board for 23 s: bomb salvos instead of shots | 3 |
| **Werewolf** | each summon/merge 30% AWAKENED: always crits | 2 |
| **Star Cannon** | live board ★ total: each 10 = fire-rate milestone (+100% exactly on a milestone, +10% per passed), each 50 = damage milestone (+350% exactly on, +50% per passed); drops if stars fall | 3–5 |
| **Copycat** | drag onto same-star unit → copy at 70% stats, keeps Awakened/Gold form, works on stone/frozen | – |
| **Mimic** | merges with ANY same-star turret; +50% attack 8 s after | – |
| **Blood Circuit** | drag onto ANY of your turrets → both become 1 random deck turret at the higher ★; same star = +1 VAMP (+6% dmg per VAMP to all Blood Circuits, max 10); different star: spend 2 VAMP → blood pulse ×220% | – |
| **Pandora Vault** | on merge: 1 of 6 (Mana rain / Freeze all 1.5 s / Star gift +1★ / 3 Vault bombs / Shield ×3 / Frenzy +40% fire rate 6 s); 6★ rolls twice keeps better; 7★ gets 2 | – |
| **Prism Thief** | shots cycle red/gold/blue; merging two of the SAME colour → COMBO (+6% dmg, max 10; 15 with a 5★) | – |
| **Compass Cannon** | arrow + number badge; same-arrow merge adds numbers, opposite subtracts + shockwave; +15% dmg per number | – |
| **Lone Ace** | no adjacent turrets → ×2 fire rate + crit | – |
| **Evolver / Mystery Box** | timer then becomes random turret +1★ / random 1–6★ | – |
| **Hero Foundry** | merge 2 → random HERO cell 12 s (+fire rate to unit on it) | – |

**BREAKTHROUGH tiers** (DOTPHA, for the 8 stacking units): when the counter passes a threshold, cumulative bonus — I +15% fire rate · II +30% crit dmg · III +25% damage · IV +10% crit chance & +50% crit dmg. Thresholds: Ember 5/10/20/40 flames · Choir 3/5/8/12 units · Archive 10/25/50/100 · Forge 6/15/30/60 (bonus goes to receiving unit) · Leviathan 25/50/100/200 · Chain Link 3/5/8/12 · Combo 5/10/20/40 · Nine-Tail 1/3/6/10 foxfire salvos. Shown as a thin coloured ring under the turret (orange→yellow→blue→purple→rainbow) + one-time burst + floating text.

## 5. Bosses (12, limbless robots/creatures; every 10 waves)
Old six (from wave 10): **Mad Crown** SCRAMBLE (turns 3 units into random deck types, same ★) · **Freezer** DEEP FREEZE (freezes 3 highest-★ units 6 s, +1 per 20 waves, max 5) · **Janus Cube** PETRIFY (1 unit to stone; stone merges only with same-★ stone) · **Joker King** FORCE MERGE (throws a Mimic onto 1 unit, forces a merge) · **Nightmare** SNIPE (highest-★ unit −1★; 1★ explodes) · **Octopus Eyes** BURN (3 units 6 s: −1★ unless cleansed).
New six: **Hive Mother** (wave 10+) launches 4–6 drones · **Static Jammer** (20+) jams 2 units, supports first, 6 s · **Prism Warden** (20+) −90% damage until hit by 3–4 different turret types, re-shields ~8 s · **Twin Core** (30+) splits into 2 fast cores · **Patch Titan** (30+) heals self 12% + lane 35% · **Star Leech** (40+) steals 1★ from your top unit; kill it to return the stars.

## 6. Recent rules decisions
- **No caps** on stacking counters or Support buffs. Only natural limits: crit chance ≤100%, instant-kill / control-resist ≤100%, slow ≤90% (bosses ≤50%). Crit damage uncapped.
- Frozen/stone units **ignore new debuffs** (burn, jam, slow, stun…) but **still lose stars** when sniped/burned.
- Special merges (Teleporter, Copycat, Overclock, Forge) do NOT count as "merges" for Archive. Merge-trigger skills run once per merge; never on stone+stone.
- RAGE ×2 applies to every damage source incl. merge-time bombs.
- **Clean-board VFX rule**: no full-screen flashes/tints; stacking turrets show only one thin tier ring (no big auras/gem stacks); one-shot bursts on tier-up only; PNG effects only, code-drawn fallbacks.
- A previous consultation already proposed a difficulty→reward budget table, per-unit retuning and 7 board-pattern jackpots (Perfect Harmony 15 same-★, Triple Bingo, Crossfire Crown, Perfect Circuit, Inferno Nexus, Golden Sacrifice, Celestial Alignment). **Please go beyond that** — new mechanics, deck decisions, pacing, PvP.

## 7. Roster (93) — Tier W/B/P/G/R · Role Atk/Sup/Spc
| Turret | Tier | Role | Skill |
|---|---|---|---|
| Compass Cannon | W | Atk | Arrow + number: merge onto a Compass Cannon — same arrow adds number… |
| Dice Gun | W | Atk | Random 3–300% damage; crits always roll max |
| Gatling | W | Atk | Very fast fire; stars raise fire rate |
| Scatter | W | Atk | Rapid fire at random enemies |
| Revolver | W | Atk | One heavy shot at the lead enemy |
| Frost | W | Spc | every 6s freezes the lead enemy 2s (bosses: 50% slow 0.6s); no chain… |
| Venom | W | Spc | marks the lead enemy 5s — it takes +12% damage from all units |
| Mana Core | W | Spc | Does not shoot; makes mana every 7s |
| Sniper | W | Atk | Targets the highest-HP enemy; +100% vs big foes |
| Tesla | W | Atk | Chain lightning hits N enemies (N = stars) |
| Guillotine | W | Atk | Chance to instantly kill small enemies |
| Armor Breaker | W | Sup | every 3s exposes the lead + toughest enemy; Atk nbrs hit them +13% |
| Hammer | W | Sup | Atk nbrs get crit chance + crit damage; their crits stagger |
| Iron Fist | W | Atk | Melee: rapid punches; each blasts a ring around the target |
| Time Bomb | W | Spc | 5s bomb on a random enemy; the blast weakens nearby enemies 10% |
| Mana Doubler | B | Spc | On merge: gain lots of mana |
| Ice Blade | B | Atk | +400% vs slowed; each hit chills nearby enemies |
| Mimic | B | Spc | Merges with ANY same-star unit; attack buff after |
| Crit Antenna | B | Sup | +crit chance for N/E/S/W nbrs (6.8% at 1★ → 22.5% at 7★) |
| Teleporter | B | Spc | Swaps places with a same-star unit (stone/frozen too) |
| Radar | B | Sup | +fire rate for N/E/S/W nbrs (18% at 1★ → 42% at 7★) |
| Drone Bay | B | Atk | On merge: 1 bomb drone per cell dragged + 1 per 3★ (max 8) — drag fr… |
| Fusion Mixer | B | Sup | +9% fire rate to Atk nbrs, +3% per extra Attack type in its row + co… |
| Energy Cannon | B | Atk | Damage grows with your current mana |
| Laser | B | Atk | Continuous beam that grows stronger |
| Chiller | B | Sup | nbrs’ hits also slow (12% at 1★ → 28% at 7★; bosses max 50%) |
| Mortar | B | Atk | Shells random enemies; every 3rd shell is a CLUSTER |
| Amplifier | B | Sup | Atk nbrs stack damage on repeated hits to one target (per enemy) |
| Toxic Pool | B | Atk | Throws poison puddles on the path |
| Cooldown Horn | B | Spc | On merge: cuts Archfiend skill cooldown |
| Mana Leech | B | Atk | Leech bolts at the lead enemy; each hit restores a little mana (capp… |
| Mine Layer | B | Atk | Lays mines on the path; some are star mines (×3) |
| Berserker | P | Atk | Crits build RAGE, then a fire-rate FRENZY |
| Blizzard | P | Atk | Slows ALL enemies and briefly freezes small ones |
| Cloner | P | Spc | On merge: summons an extra 1★ unit (2★ from 3★ merges) |
| Chain Link | P | Atk | Stronger with more linked units of its type (stones break the chain) |
| Jammer | P | Spc | On merge: PVP slows rival units; Co-op speeds allies; Solo speeds yo… |
| Cleanser | P | Sup | every 12s cleanses up to 2 nbrs; nothing to clean = +18% damage |
| Shield Gen | P | Sup | nbrs get a 1-hit control shield, recharging every 18s |
| Mystery Box | P | Spc | After 58s becomes a random 1–6★ unit |
| Star Lift | P | Sup | all 4 nbrs fire faster (+10% per ★, lowest-star one ×1.5, max +50%)… |
| Reaper Pillar | P | Sup | nbrs may execute normal enemies under 30% HP |
| Scrambler | P | Spc | On merge: PVP shuffles rival units; Co-op: makes lone ally units mer… |
| Overclock | P | Spc | Drag onto a same-star shooting unit: +90%+ fire rate (stacks) |
| Fifth Shot | P | Atk | Every 5th shot fires 3 exploding bolts |
| Storm Gun | P | Atk | Instant hits that can arc; slower next to its own kind |
| Lighthouse | P | Atk | Light orbs periodically summon 1★ units |
| Ricochet | P | Atk | Disc hits, then bounces N more times (N = stars), stronger each bounce |
| Combo Core | P | Atk | Every Combo Core merge permanently powers up all Combo Cores; Co-op:… |
| Chrono Lock | P | Spc | Freezes the lead enemy in time; stored damage bursts on release |
| Lone Ace | P | Atk | No N/E/S/W nbrs: +100% fire rate and bonus crit |
| Focus Lens | P | Sup | nbrs deal more crit damage; crits pierce |
| Signal Jammer | P | Spc | On merge: PVP jams rival units; Co-op gives ally a free summon |
| Bounty Beacon | P | Spc | Marks enemies; marked kills give bonus mana |
| Purifier | G | Atk | +300% vs poisoned enemies; kills explode |
| Sync Cannon | G | Sup | EVERY same-star Attack unit on the board deals more damage; PVP: riv… |
| Railgun | G | Atk | Bingo: a full ROW of Railguns +200% damage, a full COLUMN of Railgun… |
| Merge King | G | Spc | Same-star merge: +1★ keeping the type; 10%+ come out GOLDEN (+2★) ·… |
| Twin Maker | G | Spc | On merge: also summons a random same-star unit (10%+: one star higher) |
| Star Breaker | G | Sup | Atk nbrs +damage, merge surge. PVP: first rival 5★ each wave −8% fir… |
| Copycat | G | Spc | Copies any same-star unit, even stone or frozen (less damage), keeps… |
| Star Cannon | G | Atk | Live board ★ total: every 10 → faster; every 50 → more damage (drops… |
| Werewolf | G | Atk | Melee wolf: each summon/merge is Normal or AWAKENED by chance (30%+)… |
| Evolver | G | Spc | Time bomb counts down, then becomes a random unit +1★ (higher stars… |
| Rainbow | G | Sup | rainbow trail. Solo: enemies on it take more damage; Co-op: the same… |
| Wall Projector | G | Atk | Raises walls that block, then explode; merging it raises a much stro… |
| Orbital | G | Spc | merging Orbitals AWAKENS every Orbital on the board (23s+, longer wi… |
| Hydra | G | Atk | One barrel per star, each hits a different enemy; 7★ fuses into a gi… |
| Nine-Tail | G | Atk | Kills grow fire tails; 9 tails unleash 9 homing foxfires |
| Pandora Vault | G | Spc | On merge: opens the vault for 1 of 6 big effects; Co-op: star gift… |
| Resonance Grid | G | Sup | buffs the DIAGONAL cells (not N/E/S/W); every diagonal filled = RESO… |
| Nemesis | G | Atk | Executes low-HP enemies; % max-HP judgment on bosses |
| Eclipse | G | Atk | Day: burning beam. Night: slowing wave. Swaps every 8s |
| Scrap Forge | G | Spc | FEED it a 1–3★ unit — your best Attack unit gains damage while the F… |
| Mirror Gate | G | Sup | nbrs resist control. Every 20s: PVP reflects 1 control; Co-op copies… |
| Marionette | G | Spc | Takes control of an enemy, walks it backward, then boom |
| Ember Relay | G | Atk | Merging a Relay gives +1 flame to every Relay in the same row and co… |
| Quantum Choir | G | Atk | +damage for every other unit on your board with the same ★ (no cap)… |
| Fusion Archive | G | Atk | Every merge you make adds a permanent archive charge (+damage); Arch… |
| Hero Foundry | G | Spc | Merge 2 Foundries: a random cell becomes a HERO tile for 12s (+fire… |
| Blood Circuit | G | Spc | drag onto ANY of your units except a Blood Circuit — both become a r… |
| Hex Saboteur | G | Spc | On merge: PVP hexes a rival unit −1★; Co-op gives an ally unit +1★… |
| Sanctum | G | Sup | on arrival cleanses + shields nbrs; Atk nbrs +damage, shields recharge |
| Prism Thief | G | Atk | Shots cycle red (burn) / gold (crit) / blue (slow); merging two of t… |
| Black Hole | R | Atk | Pulls enemies in and crushes them |
| Overlord | R | Atk | Slow charge, massive thunder blast + aftershock arcs |
| Cryo Reactor | R | Sup | slowing aura; Atk nbrs hit slowed enemies harder. Active: FREEZE |
| Holy Halo | R | Spc | active 3s team barrier — leaks cost no hearts; boss skills only weak… |
| Chrono Throne | R | Spc | Enemies slow over time. Active (3★+): REWIND pushes all enemies back… |
| Hive Queen | R | Atk | Breeds hunter drones. Active (3★+): SWARM kamikaze |
| Leviathan | R | Atk | Devours enemies for ABYSS points (shared by all your Leviathans) — w… |
| Genesis Core | R | Spc | Raises your lowest unit +1★ over time. Active (3★+): GENESIS summons… |
| Wyrm Engine | R | Atk | Flame cone burns crowds. Active (3★+): DRAGON DIVE down the path |