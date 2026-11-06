# Redesign proposals — Gold / Red turrets (AWAITING USER APPROVAL — not implemented)

Source: `node tools/thap-sim-tier.js` → [BANG.md](BANG.md) + reading every gold/red skill (06/11).
Only the **number rebalance** is live (see BANG.md / `CB_BAC` in `thap/js/data.js`). The ideas below change mechanics, so they wait for approval.
Rules kept in every idea: deterministic online (seeded RNG by board + cell, state sent in the cell snapshot), no in-battle text popups (PNG effects only),
art = ChatGPT strips (prompt goes to `HINH-VE-CODE-AUDIT.md`, magenta, 3× size) — until then reuse existing strips.

DCDW feel: **Gold** = one game-changing mechanic (stars / merges / whole board / transformation / awaken) with a big visible payoff. **Red** = signature ultimate + ACTIVE skill (tap when full), the strongest, decides fights.

## Gold

| # | Turret | Problem now | Proposal (mechanic · numbers) | Visual |
|---|---|---|---|---|
| G1 | **Purifier** `aten` | +300% vs poisoned = Ice Blade's (Blue) trick with a bigger number; needs another card to work | **PURGE CHAIN**: every 6th shot (−1 per 2★) purges a target: deals 250% and *consumes* every debuff on it (poison, slow, mark, expose) — each consumed debuff = +60% and splashes 70 px. Kills by purge refund 1 s of its cooldown. Keeps "+300% vs poisoned" as +150% | white-gold beam + debuff icons sucked into the shot (strip `fx_aten_purge`, 12 frames) |
| G2 | **Star Breaker** `hasao` | Plain +damage support (Cleanser / Sanctum do the same) | **STAR SHATTER**: when a neighbour merges, the result gets **+1★ "shard" for 15 s** (max 1 per 20 s, never past 7★; the ★ falls back after). PVP: the first rival 6★+ each wave loses 1★ for 8 s (cap once per wave). Damage buff stays (+10% curve) | cracked star badge on the boosted cell (PNG), shard burst on merge |
| G3 | **Resonance Grid** `luoicheo` | +damage support, only the shape differs | **RESONANCE PULSE**: with all 4 diagonals filled, every 8 s the 4 diagonals fire a linked pulse (each = 120% of its own hit) that crosses the board in an X; 7★: the X also hits the lead boss for 1% max HP | glowing X lines between the 4 cells (strip `fx_luoicheo_x`) |
| G4 | **Nemesis** `nemesis` | Execute = Guillotine (White) / Reaper Pillar (Purple); now only bigger % | **VERDICT**: marks the toughest enemy each 10 s; when the mark ends (5 s) the enemy takes 40% of all damage it took during the mark again (bosses 20%). Executes stay (<8–15%) but only on marked enemies | crimson scale-of-justice sigil over the marked enemy (PNG) |
| G5 | **Sanctum** `thanhdia` | Cleanse = Cleanser (Purple) + shield = Shield Gen (Purple) + damage buff | **HOLY GROUND**: its cell + 4 neighbours become sanctified; a turret merged *onto* holy ground keeps the **higher** of the two types' damage multiplier and gets +1 card level (in this match) for 20 s. Shield/cleanse kept but only on arrival | golden floor tiles under the 5 cells (PNG overlay) |
| G6 | **Fusion Archive** `luutru` | Merge → permanent damage = Combo Core (Purple) | **ARCHIVE RECALL**: every 10 merges stores a "page"; Archive + Archive spends all pages to re-summon your last merged turret at its star −1 (max 2 per match). Damage stacks halved | book pages flying into the turret (strip `fx_luutru` already exists — reuse frames 0–7) |
| G7 | **Quantum Choir** `hopca` | Same-star count = Sync Cannon (Gold) | **CHORD**: counts *distinct* star levels on the board (1★…7★): each distinct ★ +8% damage, all 7 present = **FULL CHORD** for 10 s: every turret +15% fire rate (1 / 40 s) | 7 note-orbs around the head, lit per ★ present (PNG) |
| G8 | **Hero Foundry** `xuonganh` | Payoff too small (one cell +fire rate 12 s) | **HERO CELL** becomes permanent until the next Foundry merge; the turret standing on it counts as **+2★ for damage** (not for merging). Merging onto the hero cell keeps the hero cell | gold frame + banner on the hero cell (PNG) |
| G9 | **Mirror Gate** `guongcong` | Control resist — no visible payoff in solo / PVE | **MIRROR COPY**: every 20 s copies the last *active* skill used on your board (Red actives included) at 50% power; PVP: reflects 1 control as now | mirror shards orbit, flash on copy (existing `veThem` + PNG) |
| G10 | **Scrap Forge** `loren` | Manual feed only, +60% cap, bot/AI never feeds | **AUTO-SMELT**: at the end of each wave it eats your lowest 1–2★ duplicate automatically (toggle in the turret panel) and gives the **whole board** +3% damage per feed (max +45%); manual feed = +6% | sparks + molten ingot fly to the board centre (strip `fx_loren`) |
| G11 | **Hex Saboteur** `nguyenrua` | Solo: nothing visible (PVP/Co-op only) | **SOLO/CO-OP: HEX**: each merge curses the lead enemy: −1 "star" = takes +12% damage and moves 12% slower for 6 s; cursed elites drop 2× mana. PVP unchanged (rival −1★) | broken-star sigil on the enemy (strip `fx_nguyenrua_sk` frames 6–15) |

## Red

| # | Turret | Problem now | Proposal (mechanic · numbers · active) | Visual |
|---|---|---|---|---|
| R1 | **Overlord** `overlord` | Red **without an active** — only a bigger charged blast (damage cut to ×0.54 in this pass) | **ACTIVE (3★+) — STORMCROWN**: tap when full (40 s): 6 s of thunder on the whole path, every 0.5 s strikes the 3 toughest enemies for 150% (bosses 1.5% max HP). Passive blast unchanged | full-screen lightning strip `fx_overlord_ult` (cut-in like other reds) |
| R2 | **Black Hole** `blackhole` | Red **without an active** | **ACTIVE (3★+) — SINGULARITY**: tap (35 s): a giant hole at the densest spot pulls *all* non-boss enemies 2.5 s, then collapses for 300% + 3% max HP to everything pulled; bosses pulled 40 px | big vortex strip `fx_blackhole_ult` |
| R3 | **Cryo Reactor** `lophanung` | Red support capped like any support; slow aura = Chiller (Blue) | **ABSOLUTE ZERO field**: enemies frozen by its active are **shattered** when they take ≥20% max HP while frozen (non-boss) — shatter splashes 50% of the hit 60 px. Its neighbour bonus gets its own cap (+40% vs slowed, outside the 35% damage cap). Active freeze 2.5 s → 3.5 s | ice-crack strip on frozen enemies (`bang_vo` reuse), shatter shards |
| R4 | **Holy Halo** `haoquang` | Short barrier, no damage, no board change (even after 2 s → 4 s buff) | **ACTIVE — SANCTUARY**: 6 s barrier (leaks cost no hearts) **and** every turret on the board +1★ for damage for the same 6 s; when it ends, enemies that leaked during it are sent back to the path start (once, non-boss). Cooldown 30 s | halo ring over the board + golden ★ glints on every turret (PNG) |

Not flagged (already unique, keep): Sync Cannon, Railgun, Merge King, Twin Maker, Copycat, Star Cannon, Werewolf, Evolver, Rainbow, Wall Projector, Orbital, Hydra, Nine-Tail, Pandora, Eclipse, Marionette, Ember Relay, Blood Circuit, Prism Thief · Red: Chrono Throne, Genesis Core, Hive Queen, Leviathan, Wyrm Engine.
