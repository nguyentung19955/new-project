# MÔ TẢ KỸ NĂNG vs CODE — đối chiếu toàn bộ (93 ụ · 3 chỉ huy · trùm) + clip kỹ năng

Nguyên tắc: **chữ theo code** (sửa mô tả cho đúng số/điều kiện/mục tiêu trong skills*.js, hotro.js, game.js, KY_NANG_CAP, mốc sao);
lỗi code rõ ràng thì ghi riêng. Bản Việt dịch từ bản Anh đã sửa → hai thứ tiếng nói cùng một điều.

Tổng: **43 chỗ lệch mô tả** (46 bản vá chữ; 8 bản vá clip trùng với phần clip bên dưới) · **27 clip kỹ năng** sửa/thêm (19 sửa, 8 thêm mới cho ụ vàng mới).
Sửa thêm trong session này (ngoài 3 bảng dưới):
- `unitpage.js` dòng "Normal merge" của Merge King: ghi "ra ụ ngẫu nhiên" → đúng code: **Merge King + Merge King = Merge King +1★**.
- `unitpage.js` mục tiêu của Frost / Venom / Time Bomb ghi "Does not shoot" → Frost/Venom: quái đầu, Time Bomb: quái ngẫu nhiên.
- `buff.js` nhãn bảng buff của Hammer "Crit chance" nhưng số là ST chí mạng → nhãn chung "Crit".
Còn để ngỏ (cần quyết thiết kế, chưa đổi code): Laser không bao giờ chí mạng (tia luôn `crit:false` → mốc 7★ "+10% crit", Crit Antenna, Hammer vô tác dụng với Laser);
Amplifier bảng buff hiện tổng ×5 vượt trần 35%; Pandora 7★ không mở lại được; Cryo Reactor xếp loại buff "Shots slow".

## Đợt 1 — ụ 1–31

10 text patches in A1.json (all `old` strings verified unique; patched copies pass `node --check`).
Everything else checked and found consistent: text.js skill, SKILLS.mo, HO_MOI, MOC_RIENG / MOC_CHUNG (via loaiMoc / mocBuf / heSoMocDmg / mocBanXong), KY_NANG_CAP rows, HOTRO.K curves (radar 12%→28%, chimang 6%→20%, tron 12% max), SUP chu, SD_K / SD_MO captions. None of these turrets has a growfx ATK or GROW entry.

| id | where | mismatch | fix |
|---|---|---|---|
| lanhgia | text.js skill | Says "max 35%". Code gives 8% at 1★ and 18.8% at 7★ (0.08 × HOTRO.K). 35% is only the shared cap, and Chiller can't reach it (best case 32%). | "(8% at 1★ → 19% at 7★; bosses max 15%)" |
| tron | text.js skill | "+2% per different type". Code is 6% + 2% × (types − 1), so 2 types give 8%. | "+2% per extra different type" |
| bang | skills.js:48 mo | Doesn't mention that big enemies are frozen for only dai × 0.6 (skills.js:67). | "(big enemies ×0.6, bosses 0.6s)" |
| mana | support.js SUP.mana.chu | Fixed "/ 7s", but the interval is 7/6/5s at 1/3/7★. The unit page ★1→★7 table shows this label (unitpage.js:68). | use SKILLS.mana.ky(T) |
| hutmana | support.js SUP.hutmana.chu | toFixed(1) shows 0.3 at 1★ (real 0.35) and 0.9 at 5★ (real 0.95). Shown in the skill demo and the unit-page table. | toFixed(2) |
| kiembang | skilldemo.js SD_K caption | Fixed "×5". Code is ×6 at 3★ and ×8 at 7★. | caption follows the star |
| doc | skilldemo.js SD_K caption | Fixed "+12%". The value is knThe('doc'), 12% → 17.6% by card level. The demo uses the player's card levels. | uses knThe |
| mimic | skilldemo.js SD_MO | Fixed "+50%". The value is knThe('mimic'), 50% → 74% by card level. | uses knThe |
| mimic | skilldemo.js SD_K caption | Same issue: fixed "+50%". | uses knThe |
| mimic | unitpage.js:86 Joker merge | Same issue: fixed "+50%", although the page says values are at your card level. | uses knThe(null,'mimic') |

## Code bugs suspected (not patched)

- **skills.js:185 (laser)**: the beam always calls `trung(..., { crit: false })`, so Laser can never crit. Its 7★ APEX "+10% crit" from MOC_CHUNG.tu, Crit Antenna (including the 7★ sure crit) and Hammer all do nothing for Laser, and the shared MOC text overpromises. Fix this in code, or give Laser a MOC_RIENG[7]. Adding a MOC_RIENG entry would also remove the ×1.3 damage bonus, so it is a logic change.
- **buff.js:25 SUP_GIA.bua**: it returns `bua.cd` (crit damage, uncapped), but SUP_LOAI.bua is 'crit' (label "Crit chance"). The in-battle support panel (hoTroTT) shows "Crit chance +30% (current)" at 1★ and +70% at 7★. The real crit chance is 5%–12%, and crit damage caps at 50%.
- **buff.js:24 SUP_GIA.khuech**: it uses buoc × max, so the panel shows "Damage +45% (current)" at 1★ and +148% at 7★. HOTRO.dkHeSo caps all conditional damage at 35% (CAP.dmg).
- **hotro.js:75 (Amplifier)**: the amp source value is `d.v * 5`. This ignores ampMax (7 stacks at 5★) and the 35% cap. The skilldemo caption "Each gets +X damage" (sdBuf) inherits the wrong 45%.
- **unitpage.js:44 upNham**: `!sk.dmg` returns "Does not shoot". But Frost, Venom and Time Bomb (dmg 0) do fire projectiles at the lead or a random enemy. Only Mana Core and the supports really don't shoot.
- **game.js:576 (Frost on bosses)**: `E.chan` on a boss only halves its speed (`v * 0.5`), so the "freeze (bosses 0.6s)" is really a 0.6s half-speed slow on bosses. This may be intended; if so, the text could say "slows bosses".
- **support.js SUP.mana.chu**: the text is now patched, but note that skilldemo's SD_MO.mana hides it in the demo. Only the unit-page star table showed the wrong value.
- **Minor, data.js:204 KY_NANG_CAP.bua "Crit dmg"**: knHe scales Hammer's whole aura (crit chance too) through HOTRO.kThe. The value shown (30% → 42.6%) is correct for crit damage only.

## Đợt 2 — ụ 32–62 (ụ vàng ưu tiên)

The patches are in `A2.json`: 17 patches covering 14 mismatches. Each `old` string occurs exactly once in its file (checked).

## Mismatches (patched)

| id | where | mismatch | fix |
|---|---|---|---|
| orbital | text.js skill | Says "(23s)". The code uses `dai = knThe(B,'orbital')`, which is 23s at LV9 and rises 1s per card level to 29s | "(23s+, longer with card level)" |
| orbital | growfx.js ATK.orbital[2] | Says "23s … every 1.8s". The duration scales with card level, and 3★ QUICK HANDS makes it `nhip = 1.5s` | "23s+ by card level … every 1.8s (1.5s from 3★)" |
| dongbo | growfx.js ATK.dongbo | All 3 stages say "neighbour(s)". The turret is `toanBan` (whole board). FULL SYNC "the biggest +damage" is false: `v(T)` does not depend on the count. 5★ fire rate needs `dong >= 2`, not 3+ | Reworded to "on the board", "each gets the same +damage", "5★: 2+ matched also +fire rate" |
| sinhdoi | text.js skill | "(10%: one star higher)". `sinhDoi()` uses `knThe('sinhdoi')`, which goes 10% → 16% | "(10%+: …)" |
| sinhdoi | phattrien.js HO_MOI | "(10%: +1★)" | "(10%+: +1★)" |
| saochep | skilldemo.js SD_MO | Fixed at "Copy deals 50% damage". The real value is `heSaoChep` = 50% → 92% by card level | Live value from `heSaoChep(G.ban[T.ban])` |
| saochep | skilldemo.js SD_K caption | "(half damage)" is only true at base level | "(less damage)" |
| saochep | phattrien.js HO_MOI | "copy of any turret". `hopLe` requires the same star | "any same-star turret" |
| epxung | text.js skill | `hopLe` needs a target that shoots (`SKILLS[b.id].dmg`) and is not an Overclock. The bonus is `knThe` 65% → 87.5% and it stacks | "Drag onto a same-star shooting turret: +65%+ fire rate (stacks)" |
| epxung | skilldemo.js SD_MO + SD_K | Fixed at "+65%" | SD_MO shows the live value from `knThe`; SD_K says "+65%+" |
| xaotron | text.js skill | Mentions PVP only. The Co-op/Solo branch turns 1+⌊★/2⌋ lone turrets into mergeable pairs (on the ally's board in Co-op, your own in Solo). Unit-page mode rows are parsed from this text | Added "Co-op: … ; Solo: …" |
| kepha | text.js skill | No Solo. In Solo, `D = banKhac(B) \|\| B`, so it speeds up your own top-star turrets | Added "Solo: speeds your own" |
| min | phattrien.js NHIP.min + skills2.js mo | The interval label is `ky(T)`. The real charge uses `nhipU` (generic 3★ QUICK HANDS +20%), so from 3★ the real interval is ky/1.2 | Divide by `nhip3(T)`, as the overlord/wallgen labels already do |
| tuthan | support.js SUP.tuthan.chu | Shows `tile` without the cap. HOTRO.CAP.chet is 0.15, so 5★ shows 15.2% and 7★ shows 18.8% while the real chance is 15% | Clamp to `Math.min(0.15, …)`, as `mo` and the bua label already do |
| overlord | phattrien.js HO_MOI | "(active-tier finisher)", but it has no `chuDong` | "(Mythic finisher, no active)" |

## Checked and correct (priority turrets)

- **soi**: awaken chance is `min(0.5, knThe('soi')/100)`, so 30% at LV9, +1.5% per level, max 39%. The "30%+" wording, GROW.dk, ATK, MOC_RIENG and SD all match. Awakened always crits and gets +40% fire rate. 7★ howl gives N/E/S/W neighbours +25% fire rate.
- **railgun**: a full row of 5 non-stone Railguns gives +200% damage. A full column of 3 gives +150% fire rate. Both can be active at once. SD/demkn match.
- **wallgen**: on merge it raises a golden wall that lasts 6s, does about ×6 wall damage (scaled to +1★) and has radius 84 vs 58. It works in all modes. mo, HO_MOI and SD match.
- **vughep**: gold chance is `knThe` 10% → 22% ("10%+"). Gold gives +2★ (capped at 7). Merge King + Merge King gives one Merge King +1★ and keeps gold. It also works on stone or frozen turrets (`quaKhoa`).
- **dongbo**: text.js, mo, GROW, SD and SUP value are correct. Only ATK was wrong (patched). PVP rival penalty is −3% to −6%.

## Code / display-logic bugs suspected (not patched)

1. **unitpage.js:89** `upLuatGhep` always adds "Normal merge: Two X of the same star merge into a random turret…". For **vughep** this is wrong: `ghepDacBiet` with `cungLoai` sends Merge King + Merge King to `ghepDB.lam`, which gives Merge King +1★ and never a random turret. The fix needs a conditional, so it is logic.
2. **unitpage.js:386 / chanHTML (l.479)**: support specs say "Buffs: 4 neighbours" and draw a 4-neighbour footprint for every support. **dongbo** is `toanBan` (all 14 cells). It needs a `sk.toanBan` branch.
3. **support.js:77** `SUP.dongbo.ke: true` uses `oKe()`, which covers only the 4 orthogonal cells. The tap-highlight for Sync Cannon therefore shows neighbours, not the same-star turrets across the board. buff.js:91 handles `toanBan` correctly.
4. **phattrien.js:173** GROW.orbital progress uses `B.phao / 20`, but the fallback barrage is `B.phao = 12` (skills.js:266). The stage ring tops out at 60% (cosmetic).
5. **growfx.js:581** `P.dongbo` overrides `ban`, and **growfx.js:432** `P.orbital.ban` exists, but neither turret ever shoots: dongbo has dmg 0 and orbital's `capNhat` returns true. This is dead code, harmless.
6. **skills2.js:854** `soi.sinh` plays `SND.thucTinh()` via `setTimeout` for every board, including AI, rival and online-puppet boards. Other skills guard with `!B.ai` (minor).

## Minor omissions, not patched (judgement call)

- hasao card text describes only PVP. In Co-op/Solo, the first 5★ each wave gives the lowest Attack turret (the ally's in Co-op, your own in Solo) +8% fire rate for 6s. `mo` states this.
- ngoisao: the large bonus applies only when the board total is exactly on a milestone (+100% fire rate / +350% damage). The card says "every 10 → faster", which is broadly right; `mo` shows the live numbers.

## Đợt 3 — ụ 63–93, chỉ huy, trùm

19 text patches in A3.json. Every `old` string occurs exactly once in its file (checked with a script).

| id | where | mismatch | fix |
|---|---|---|---|
| leviathan | text.js TEXT.turret.skill | says "endless stacks", but ABYSS is capped at 100 (`Math.min(100, …)`, HU.xoay) | "damage stacks (max 100)" |
| leviathan | skills5.js HO_MOI (themHo) | same "endless stacks" | same fix |
| leviathan | skilldemo.js SD_GD stage 2 | "Wider splash": the splash damage radius is 30 px at every star. Only the FX ring grows (22 to 30 px) | "Bigger splash ring" |
| pandora | skills3.js mo (5–6★ branch) | a 6★ vault is told its next merge "rolls twice", but a merge into 7★ fires 2 effects | "merging into 6★ rolls twice, into 7★ fires 2 effects" |
| pandora | skills3.js mo (7★ branch) | "OPEN: 2 effects": a 7★ vault can't merge (hopLeGhep needs sao < saoMax), so it never opens again | "its 7★ merge fired 2 effects" |
| pandora | skills3.js MOC_RIENG 7 | "Every opening fires 2 effects": a 7★ vault has no more openings. Only the merge INTO 7★ does this | "The merge into 7★ fires 2 effects" |
| pandora | skills3.js GROW dk, skilldemo.js SD_GD | "7★: every merge fires 2 effects" (same reason) | reworded |
| combo | skilldemo.js SD_MO | "Each combo: +6% damage", but c(T) goes 6→12% by star | "+6–12% damage (by ★)" |
| ngaithoigian | skilldemo.js SD_MO | "slow up to 15%", but sMax goes 15→35% by star | "15–35% (by ★)" |
| lophanung | skilldemo.js SD_K caption | "freeze all": chuDong only freezes enemies within r×1.6 | "freeze nearby" |
| marionette | skills4.js mo | ram damage is min(30% puppet HP, dmg×0.5), and only the first 6 enemies get hit | "rams up to 6 … (capped)" |
| mauhut | text.js skill | "drag onto ANY of your turrets": ghepDB.hopLe excludes another Blood Circuit | "except a Blood Circuit" |
| hero (Reinforce) | unitpage.js UP_MV.hero "Board full" | says "Fills only the empty cells left". Code: each missing slot gives +1★ to your weakest turret (chihuy.js keHoach/yeuNhat) | reworded |
| chuato/leviathan/khoisinh/ronglua/ngaithoigian | unitpage.js upCheDo Mythic line | "Tap it … when charged" does not mention the 3★ unlock (napChuDong / `T.sao < 3`) | "(some unlock it at 3★)" |
| eve (Holy Shield) | text.js TEXT.af.eve, skilldemo.js SD_MV | "Clears debuffs": CH.dung only clears freeze/stone/burn/aim. Clamp/Jam (st.kep) and Hex stay | "Clears freeze, stone & burn" (matches UP_MV.eve) |
| prism (boss) | trum.js TRUM_MOI mo + nguy | "3 different turret types", but it is 4 from wave 40 (`prismCan`) | "(4 from wave 40)" / "3–4" |

Checked and consistent (no change needed): the other turrets' TEXT skill, mo, HO_MOI, MOC_RIENG, GROW, ATK and SD lines. That includes nayda, khoathoigian ("bosses: 50% slow" is correct, since `E.chan` halves boss speed), hydra, cuuvi, luoicheo (HOTRO.K 1.0/1.45/1.9/2.35, ×1.5 resonance), ngaithoigian (mo, MOC, cd 40→28 s), nemesis, docton, thaukinh (cdmg cap 50%, pierce 50/65%), nhieusong, santhuong (+10% via HOTRO.vuln), nhatthuc, loren (f 1/2/3/4, cap 15 = +60%), guongcong (resist 15%×K, cap 35%; 5★ shows 28%), chuato, khoisinh, ronglua, lualien/hopca/luutru/xuonganh (KY_NANG_CAP LV9→15 matches 18/30/4/32%), nguyenrua, thanhdia, bienmau, lophanung (MOC 3/5/7) and haoquang (2/2.5/3.5 s, cd max(28, 40−2★)). Also checked: the generic MOC_CHUNG stages (mocBuf, heSoMocDmg, and mocBanXong called in game.js) and the KY_NANG_CAP labels and bases.
Commanders: costs 30/40/40 ×2 per use, cd 15/25/25 s, Rage ×2 dmg 10 s, Shield 8 s. All match.
Bosses: TEXT.boss and the vaotran NGUY lines match game.js. That includes LUAT_BANG `min(5, 3+floor(w/20))` and 6 s, halved by Halo.

## Code bugs suspected (not patched)
- **buff.js:22 / :26**: `SUP_LOAI.lophanung = 'cham'` ("Shots slow") and `SUP_GIA.lophanung = cham(T)`, which is the aura's slow %. But its neighbour buff is `ra.lanh` (+dmg vs slowed, KY_NANG_CAP "Slowed dmg"). So the buff panel shows the wrong icon, category and value. It should probably be 'dmg' / `k(T)`.
- **skills3.js:308–327 (pandora)**: the 7★ "OPEN VAULT" form can never open again, because a 7★ vault can't merge. If that isn't intended, it is a design bug (the text has been fixed to match the code).
- **data.js:70**: the comment says "40 → 80 → 160", but Reinforce starts at 30 (30 → 60 → 120). Comment only.
- **skills4.js:68**: the comment says the 7★ pierce is 100%, but the code uses 65% (`xuyen100 ? 0.65 : 0.5`). The text follows the code. Comment only.
- **phattrien.js:87 vs skills4.js:403**: thaukinh MOC_RIENG is defined twice. The skills4 Object.assign replaces the phattrien entry, so the "Aura ×1.9/×2.35" text there is dead.

## Clip kỹ năng (skilldemo.js)

I covered 96 demos: the 93 turrets in roster.json and 3 commanders (mv:hero, mv:dahlia, mv:eve).
I ran every demo with Playwright at 390x844 and 3★. I ran the changed ones again at 1★ and 7★.
None of the runs threw a page error or a console error.

- **Fixed:** 19 demos
- **Added:** 8 new demos (the newest gold turrets had none)
- **OK:** 69 demos, omitted from the table below

## Global fixes

| area | problem | fix |
|---|---|---|
| `sdSC` (cleans up every caption) | It deleted the word "awaken/awakened/awakens" from every caption. On screen: "Each Werewolf is Normal or", ": always crits, faster", "Every Orbital on the board", "30% : always crits", and the Stage-3 captions for soi and orbital. | It no longer deletes "awaken". It still removes "grow-up". |
| drag-merge driver (`ks.keo`) | A demo could only do one drag. | `keo` now also accepts a list of drags: `[[t, from, to, so?], ...]`, with ≥1.3 s between drags. An optional per-drag `so` shows a before → after stat. Old single-drag scripts work unchanged. |
| default script kind (`sdKieu`) | Any turret that has a `ghep` hook got the "merge" script. That merged away Attack turrets mid-demo (wallgen, cuuvi, khoathoigian) and inserted a false "Merge two of the same" caption. | These demos now set `kieu` explicitly. |
| helpers added | — | `sdThem` (summon turrets mid-demo and show the main turret's stat before → after), `sdHexTrung` (seeds the real Hex roll), `sdHero` (reads the real Hero-tile value). |

## Per-turret problems

| id | problem | fix |
|---|---|---|
| soi (Werewolf) | The awakened wolf sat in the dimmed edge column (cell 4). The chance was never stated ("Card level raises the Awakened chance"). The captions were mangled by `sdSC`. | The second wolf is now in visible cell 3. Captions: Normal + Awakened side by side, then "Each summon or merge: X% chance to awaken" (X = `SKILLS.soi.tiLe`, card level). The clip forces one Normal and one Awakened wolf, and the caption states the real chance. |
| orbital | The caption was mangled to "Every Orbital on the board". | Now "Every Orbital on the board awakens for {knThe}s". Verified: the two other Orbitals (cells 2 and 12) get `thucT` = 23 s, the merge result is a random turret, and the awakened orbitals fire salvos. |
| railgun | The captions had no numbers. "Other turrets don't count" was text only, nothing showed it. | The captions show +200% damage and +150% fire rate (from `BINGO_DMG` / `BINGO_TOC`). At 3.2 s one row Railgun is replaced by a Cannon. The row bingo is lost and the main gun's damage visibly drops (1191 → 397). |
| wallgen | It was given the merge script by default, so a real merge already raised a Golden Wall at 2.5 s. At 4.6 s it also called `SKILLS.wallgen.ghep(G,B,T,T)` directly — a second, fake Golden Wall from a turret already gone. The captions did not match the timing. | The merge is now a real drag-merge of two Wall Projectors at 4.6 s, so there is exactly one Golden Wall. Caption: "Merging: a Golden Wall, ×6 blast". The fake call is removed. |
| vughep (Merge King) | Only the normal +1★ case was shown. The Golden chance (+2★) was never mentioned. The main King's gold roll was left to the RNG, so the caption could be wrong. | Two drags. A normal King gives +1★. Then a caption "X% chance a Merge King is Golden" (`knThe`). Then a Golden King gives +2★ through the real `ghepDB.lam`. The stats line also shows "X% Golden: target +2★". |
| sinhdoi (Twin Maker) | "Sometimes the twin is +1★" — no chance stated. | Now "X% chance the twin is +1★" (`knThe sinhdoi`), in the caption and in the stats line. |
| dongbo (Sync Cannon) | The board-wide turrets were in dimmed edge columns. The set turret was 1★, which counts as same-star at 1★ (and at 6★ under 7★ loose sync). There were no numbers. | The board is no longer dimmed, since the skill is board-wide. The off-star turret is s±2, so it never matches. Captions: "Each gets +X% damage" (real buff), "A different star gets nothing", "PvP: rival turrets deal −X%" (`giamPvp`). Stats line: "Every N★ Attack turret +X% damage". |
| saochep (Copycat) | "Becomes a copy (half damage)" and "Copy deals 50% damage" were hard-coded. | Now "Becomes a copy at X% power" (`heSaoChep`, card level). The stats line is dynamic too. |
| hasao (Star Breaker) | The caption said "PvP: punishes a rival's first 5★", but the clip showed the solo effect on your own board. At 5★+ nothing happened at all, because the neighbours were already 5★. | Cell 12 is always 4★ and is raised to 5★, which is the real first 5★ of the wave. Caption: "First 5★ of the wave: weakest +8% fire rate". The PvP behaviour gets its own caption. |
| khien (Shield Gen) | The boss (Nightmare) often hit the Shield Gen itself, which is unshielded (tie on highest star). "A shield blocks it" never happened, and at 7★ Nightmare took a star from the Shield Gen. | The boss is now Freezer, which targets several turrets. Neighbour cell 8 is one star higher. Block verified at 1★, 3★ and 7★. |
| doc (Venom) | It waited for a 'hit' event that Venom never fires, since it deals no damage. "+12%" was hard-coded. | The wait for a hit is removed. Caption: "+X%" from `knThe(doc)`. |
| phagiap | It waited for a 'hit' event that a Support turret never fires. | The event wait is removed. |
| kiembang | "×5 damage" was wrong at 3★ (×6) and 7★ (×8). | The multiplier now follows the star milestones, as the skill code does. |
| mimic | "+50% attack" was hard-coded (it scales with card level). | Now from `knThe(mimic)`, in the caption and the stats line. |
| epxung | "+65%" was hard-coded (`knThe(epxung)`). | Now dynamic, in the caption and the stats line. |
| khuech (Amplifier) | "Each gets +65% damage" — wrong. It is a per-hit stack on one enemy, up to that amount. | Now "Repeat hits on one enemy: up to +X% damage". |
| tienhoa | At 5★+ the real 25% chance of +2★ was not mentioned. At 7★ the caption waited for a "new turret" event, but a 7★ Evolver gives mana back instead of becoming a new turret. | At 5★+ the caption reads "Random turret +1★, 25% chance +2★". The event wait is removed. |
| cuuvi (Nine-Tail) | It was given the merge script by default: it merged the Nine-Tail away at 2.5 s and inserted "Merge two of the same". | Now set to the plain Attack script. |
| khoathoigian (Chrono Lock) | Same problem: it merged the Chrono Lock away at 2.5 s, in the middle of the lock/release. | Now set to the plain Attack script. |
| lualien (Ember Relay) | No demo. The fallback showed a truncated caption and merged with no flames visible. | **New:** merge two Relays at cell 8. The Relays above and below (cells 3 and 13) catch a real flame. Cell 13 goes from 4 to 5 flames (full blaze), and its damage shows 143 → 154. Captions use `moiLua`. Stage captions added. |
| hopca (Quantum Choir) | No demo. With no other turrets it showed "0 other 3★ turret(s) → +0%". | **New:** two same-star turrets are summoned and damage goes 100 → 131. Then a different-star turret is added and damage does not change (131 → 131). +X% per match from the skill code. |
| luutru (Fusion Archive) | No demo. The fallback showed "Archive 0/40 → +0%". | **New:** two unrelated merges each add +1 charge (damage 85 → 87 → 89). Then Archive + Archive fires the 3 pulses. Stage captions added. |
| xuonganh (Hero Foundry) | No demo. | **New:** merge two Foundries and the real `VM1.rng` picks a cell for the Hero tile. The caption reads the real `B.hero` value; a first version showed 32% where the real value was 28%. If the tile lands on a turret other than the merge result, the clip shows its fire rate before → after. |
| mauhut (Blood Circuit) | No demo. The fallback was a generic drag onto a lien. | **New:** a same-star drag gives +1 Vamp. A different-star drag spends 2 Vamp on a 220% blood pulse (300% at 5★+). Vamp goes 1 → 2 → 0. |
| nguyenrua (Hex Saboteur) | No demo. The fallback was in solo mode, so it only cursed an enemy, and the caption was cut off. | **New:** a mini rival board (PvP). The real hex flies and the rival Sniper drops 4★ → 3★. The real `SK7.rng` roll is seeded to the lucky case, and the caption says "X% chance: the rival turret loses 1★". A co-op note follows. |
| thanhdia (Sanctum) | No demo. It was already on the board at t = 0, so its on-arrival cleanse happened unseen. | **New:** two neighbours start frozen. Sanctum is summoned at 1.8 s through the real `sinh`, cleanses them and gives 1-hit shields. Then the damage aura +X% shows. |
| bienmau (Prism Thief) | No demo. The fallback merge could pair two different colours, so no combo. | **New:** the colour cycle is shown first. Two thieves are phase-synced (`tuoi`), so the same-colour merge is a real COMBO. The third thief's damage shows 85 → 90. |

## Not fixed — observations

- Several PvP-only effects are stated in a caption but not acted out on screen:
  - cauvong: paints the rival's path instead
  - dongbo: rival turrets deal −X% damage
  - hasao: PvP variant
  - nguyenrua: co-op variant

  The captions match the code. Acting these out would need the mini rival board (`doi`) and more demo time.
- xuonganh: the Hero tile cell is random through `VM1.rng`. It can land on the merge result, as it did in my runs. In that case there is no before → after number; the tile ring itself is still shown.
- Commanders (hero, dahlia, eve): OK. They use real `dungMV`, the numbers match `MAVUONG` and `LUAT_MV`, and the Holy Shield block was confirmed.
