we picked ruby-red core with gold rim)?
…
Show more
Worked for 2m 9s
ChatGPT said:
1. Corrections to Section B

Confirmed. I will treat your supplied rules as authoritative. The 16×16 interaction matrix remains valid, but the following rows and assumptions change:

B row / interaction

	

Correction




B0 — Supports

	

Sync Cannon = damage; Star Breaker = fire rate; Rainbow = trail; Resonance Grid = diagonal; Mirror Gate = resistance; Sanctum = cleanse. Keep their existing targeting rules, including Resonance Grid's diagonal behavior. Remove invented crit/echo mechanics.




B2 — All Attack units × Supports

	

Apply actual support effects, not the provisional ones. Trail effects do not automatically count as direct hits for personal stacks or Judgement.




B2 — Merge King × all units

	

Drag onto same-star target → same type, +1★; golden proc → +2★, capped at 7★. No real merge, no Archive stack.




B2 — Twin Maker × all units

	

Its real merge generates exactly 1 Archive event and also summons one random same-star unit, with the existing 10%+ higher-star chance. The extra summon is not another merge.




B2 — Copycat × all units

	

Same-star drag, 70% copy at LV9; includes stone/frozen. Copying is a transformation, not a real merge. Retain the existing fresh-instance counter rules.




B2 — Star Cannon × all units

	

Recalculate live-board star total after summon, merge, copy, hatch, consumption or star changes. Every 10 total stars triggers fire-rate milestone; every 50 triggers damage milestone. Do not count consumed entities twice.




B2 — Choir / Bingo × Twin Maker

	

The additional summoned unit immediately affects adjacency, matching-star relationships and board occupancy. It counts as its actual resulting turret type.




B2 — Orbital

	

Special, no normal shooting. Orbital merge awakens bomb mode for 23 s; second merge while awakened triggers Cascade. Use Special LV scaling, not invented continuous Attack stats.




B2 — Pandora Vault

	

Replace all invented seals with mana rain, freeze all 1.5 s, +1★ gift, 3 bombs, shield ×3, and +40% fire rate for 6 s. Keep the six-merge Royal jackpot.




B2/B3 — Purifier

	

Attack turret, +300% damage versus poisoned enemies (4× normal damage), kills cause explosions. Remove all invented ally-cleansing behavior.




B3 — Boss skills

	

Sanctum handles its existing cleanse mechanics; Mirror Gate provides resistance. Purifier cannot automatically cleanse BURN, FREEZE, JAM or PETRIFY.




B4 — PvP / Co-op

	

Twin Maker's additional spawn, Pandora effect rolls and Merge King's golden roll use seeded RNG. Star Cannon sums only its own board. All effects follow existing board-local rules unless explicitly shared.

For all these unchanged units, use the original LV9 mechanics and the agreed LV10–17 role table. No invented cooldowns, target selection or new actives.

2. Compass — no guaranteed Compass merge

My preferred alternative is Directional Imprint.

A Compass+Compass merge still creates a random deck turret, but leaves a directional imprint on the destination cell for 30 seconds.

The imprint inherits the destination Compass's arrow.

The turret occupying that cell gains +40% damage against enemies in the selected quarter of the U-path.

The bonus works even when the random result is not Compass.

Player may rotate the destination Compass before merging for 15 mana.

Three qualifying same-direction Compass merges still trigger True North.

This makes arrow selection valuable even when the Compass disappears.

3. Ember Relay

Confirmed exactly.

Read both consumed Relays' flame values.

Calculate total = min(cap, flameA + flameB).

Consume both Relays and create the random merge result.

Find every surviving Relay in the destination row OR column.

Set each recipient's flames to max(existing, total).

If no Relay survives in that cross, the flame total is lost. No banking, no global redistribution.

If the random result itself is an Ember Relay, it qualifies as a recipient.

4. Railgun rename

Name

	

Character




Volley Cannon

	

Fast synchronized firing




Salvo Battery

	

Heavy multi-barrel artillery




Storm Battery

	

Sustained projectile barrage

My pick: Salvo Battery.

Top-down art: a compact navy-and-gold rotating artillery platform with four parallel brass barrels, a central ammunition drum and rapid alternating muzzle flashes, keeping the existing Railgun's recognizable design motifs.

5. Hive Mother — corrected cooldown formula

Let s = stars (1–7), n = actual drones released (1–s), and L = card level.

𝐶
𝐷
(
𝑠
,
𝑛
,
𝐿
)
=
2
𝑠
[
1
+
0.15
(
𝑛
−
1
)
]
 
[
1
+
0.02
(
𝐿
−
9
)
]
CD(s,n,L)=
[1+0.15(n−1)][1+0.02(L−9)]
2s
	​


At LV9:

Stars

	

Drones released

	

Base cooldown

	

Actual cooldown




1★

	

1

	

2 s

	

2.00 s




3★

	

3

	

6 s

	

4.62 s




5★

	

5

	

10 s

	

6.25 s




7★

	

3 (partial)

	

14 s

	

10.77 s




7★

	

7 (full)

	

14 s

	

7.37 s

Damage proposal:

𝑇
𝑜
𝑡
𝑎
𝑙
𝐷
𝑎
𝑚
𝑎
𝑔
𝑒
=
𝑛
𝐷
(
0.70
+
0.15
𝑠
)
[
1
+
0.08
(
𝑛
−
1
)
]
TotalDamage=nD(0.70+0.15s)[1+0.08(n−1)]

At 7★, releasing 7 drones produces 18.13D total damage, before other buffs.

Thus, releasing more drones means both greater total damage and a shorter cooldown. The 2–14 s progression remains the underlying base.

6. Hydra — art recommendation

Confirmed: 1–6★ visibly has exactly s heads.

I recommend one shared body sprite plus one reusable animated head module, positioned in a fan by code.

Body: 64×64.

Head module: 16×16, reusable with pixel-snapped offsets.

Code maintains seven fixed attachment positions.

1–6★ shows exactly the corresponding head count.

7★ displays a full seven-head formation and switches to the machine-gun firing animation during activation.

This is easier to animate and maintain than seven complete head-count sprite sheets.

7. Star badges at 40 px

Yes, keep the ruby-red core with gold rim for 7★. It gives the maximum star a distinct visual identity.

I recommend:

1–4★: one horizontal row, each small star 6×6 px.

5★: 3 upper + 2 lower.

6★: 3 upper + 3 lower.

7★: one large 12×12 px ruby-red star with gold rim and dark outline.

Keep at least 1 px separation between small stars and make the 7★ silhouette noticeably wider.

No number labels needed. The existing geometry works at a 40 px turret footprint, provided the 5–6★ badges use two rows rather than squeezing all stars into one.

ChatGPT can make mistakes. Check important info.
Latest response




Thinking effort
High
Turret Merge Abc Design Spec
