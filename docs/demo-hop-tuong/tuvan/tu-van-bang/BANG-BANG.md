# ICE / SLOW / FREEZE / TIME family — current rules (from code, 07/11/2026, LV9)

Global rules: "slowed" (`biCham`) = has an active slow timer with slow > 0, OR is frozen/locked. Slow sources do NOT add up — each enemy keeps the MAX slow value. Caps: normal enemies ≤90%, bosses ≤50%. Ice Flyers immune to slow (not to Time Lock). Frost has a 3 s re-freeze immunity. Support "+dmg vs slowed" (Cryo Reactor, Chiller 5★) is a conditional bucket with its own cap 35% × tier. Frozen/stone TURRETS (from bosses) ignore new debuffs but still lose stars.

| id | Name | Tier | Role | Current rule (numbers) | Star perks |
|---|---|---|---|---|---|
| bang | Frost | W | Spc | no damage; every 6 s freezes the lead enemy 2 s (card LV → 3 s), giants ×0.6, bosses only 0.6 s; then 30% chill +2 s; 3 s freeze immunity; Ice Flyers immune | 3★ +0.5 s · 5★ every 4.5 s · 7★ freezes 2 lead enemies |
| kiembang | Ice Blade | B | Atk | dmg 16.8, fire 0.75/s, prefers slowed targets; ×5 dmg vs slowed; every hit chills enemies within 44 px 20% / 2 s | 3★ ×6 · 5★ splinters 40% splash · 7★ ×8 |
| lanhgia | Chiller | B | Sup | neighbours' hits slow 8%×k (shown 12%→28%) 2 s, bosses ≤50% | 5★ +5%k dmg vs slowed · 7★ every 8 s a neighbour hit freezes 0.8 s |
| baotuyet | Blizzard | P | Atk | dmg 26; every max(4, 11−0.6★) s: ALL enemies slowed 30%+3%/★ (≤60%) 3 s + hit 150% + small enemies frozen 0.35 s | 3★ −1.5 s · 5★ hit 450% · 7★ freeze 1 s |
| lophanung | Cryo Reactor | R | Sup (no shot) | aura r=110+5★ px, slow 20%+2.5%/★ (≤40%) tick 0.4 s; Attack neighbours +12%k vs slowed; charge 24 s → TAP: freeze all in 1.6r for 2.5 s (bosses 0.8 s) | 3★ +20 px · 5★ freeze 4 s, bosses cast skills 25% slower · 7★ enemies in aura take +10% from all |
| nhatthuc | Eclipse | G | Atk | swaps every 8 s. DAY: beam ×1.5→2.5 + burn 4 s (40%/s). NIGHT: 100 px cone ×0.6, slows 25% | 7★ each swap: both modes 1.5 s + ×4 ring |
| khoathoigian | Chrono Lock | P | Spc | dmg 10; every 7.5→4.5 s locks lead non-boss 1.2→2.5 s; stores damage taken, bursts 40→95% of it (40 px); boss only if alone: 50% slow, half time/burst; locked counts as slowed; on merge: instant lock | – |
| ngaithoigian | Chrono Throne | R | Spc | dmg 16; every enemy slows 1%/s alive up to 15→35% (bosses 20%) (does NOT count as "slowed" for Ice Blade); 3★ TAP (cd 40−2(★−1) s): REWIND 15→30% of path (bosses ⅓) + ×6 dmg | 7★ rewind restores 1 heart once |
| bienmau | Prism Thief (blue) | G | Atk | colour every 3 s; BLUE shots slow 25% | 7★ all 3 colours |
| doc | Venom 7★ | W | Spc | marked enemy also slowed 15% | – |
| cauvong | Rainbow 7★ | G | Sup | trail slows ≤35% | – |
| Pandora | Pandora Vault | G | Spc | 1/6 outcome: freeze all 1.5 s | – |
| Freezer boss | DEEP FREEZE | boss | – | freezes 3 highest-★ turrets 6 s (+1 per 20 waves, max 5); Holy Halo halves; Eve/Cleanser/Sanctum remove; frozen turret: no shoot, no skill, no support, only MK/Teleporter/Copycat can merge onto it | – |

## Interactions now
- **Overlap problem**: Frost, Chiller, Blizzard, Cryo, Eclipse night, Prism blue, Chrono Throne all just "set slow = max(…)". Because slow does not stack, two slow units are worth barely more than one. Only Ice Blade and the "+dmg vs slowed" supports *consume* slow.
- Crit units (Hammer, Crit Antenna, Focus Lens, Berserker, Werewolf, Dice Gun): no interaction with frozen/slowed today.
- Execute (Guillotine, Reaper Pillar <30%, Nemesis): no interaction; frozen enemies are just easier to keep in range.
- Stack units (Amplifier same-target stacks, Nine-Tail kills, Chain Link): slow keeps targets in range longer → indirect only.
- Bosses: freeze → 0.6–0.8 s or 50% slow; Prism Warden needs 3–4 different turret types (ice units help count); Patch Titan heal unaffected; Twin Core fast cores (slow helpful); Star Leech must be killed (slow helps).
- PvP: control affects only your own path enemies; Freezer boss and Jammer are the "freeze turret" counters; Mirror Gate / Shield Gen / Eve block boss freeze.
