// TURRET MERGE — BẢNG CHỮ HIỂN THỊ (tiếng Anh). Mọi chữ người chơi thấy nằm ở đây để dễ sửa.
// id dữ liệu giữ nguyên tiếng Việt; chỉ chữ hiển thị đổi. Dòng chỉ số động của từng kỹ năng nằm cạnh công thức trong skills*.js.
'use strict';

const TEXT = {
  ui: {
    subtitle: 'Merge · defend · survive',
    pick5: 'Pick 5 turrets',
    sortTier: 'Sort: tier', sortName: 'Sort: name', sortFamily: 'Sort: family',
    family: 'Family', tierOf: (i) => 'Tier ' + i + '/5', next: 'next', top: 'top of the line', gap: 'gap', planned: 'planned',
    playable: 'playable', maxOneMythic: 'max 1 Mythic',
    soon: 'SOON',
    coopSub: '2 players · 3 shared lives', soloSub: '1 board · 3 hearts', pvpSub: 'Outlast your rival on the same waves',
    random: 'Random', start: 'Start',
    paused: 'Paused', soundOn: 'Sound: on', soundOff: 'Sound: off', sfxOn: 'SFX: on', sfxOff: 'SFX: off', musicOn: 'Music: on', musicOff: 'Music: off', quit: 'Quit', resume: 'Resume',
    changeDeck: 'Change deck', again: 'Play again', pause: 'Pause',
    summon: 'Summon',
    deckFull: 'Your deck already has 5 turrets', oneMythic: 'Only 1 Mythic turret per deck',
    need2Atk: 'Tip: take at least 2 Attack turrets',
    bossIn: (n) => 'Boss in ' + n, bossWave: 'Boss wave',
    rival: 'Rival', you: 'You', ally: 'Ally',
    wave: 'Wave', bossComing: 'BOSS INCOMING!', wave1Hint: 'Summon & merge turrets!',
    victory: 'VICTORY', defeat: 'DEFEAT', reached: (w) => 'Reached <b>WAVE ' + w + '</b>',
    role: { tc: 'Attack', ht: 'Support', db: 'Special' }, // đợt vai trò: 40 / 18 / 27
    comingSoon: 'Coming in a future update.',
    dmg: 'Damage', baseDmg: (d, hs) => 'Base damage ' + d + ' · ×' + hs + ' from tier',
    stoned: 'STONE (merge with same-star stone → higher stone)', frozen: 'FROZEN', burning: 'BURNING',
    readyTap: 'READY: TAP TO USE', charge: (p) => 'charging ' + p + '%',
    max: 'MAX',
  },
  // chữ nổi trên sân
  fx: {
    frozen: 'FROZEN', diffStar: 'STARS DIFFER', diffType: 'TYPE DIFFERS',
    reaper: 'REAPED', bossDown: 'BOSS DOWN!', destroyed: 'DESTROYED!',
    blocked: 'BLOCKED', shieldBlock: 'SHIELD BLOCK',
  },
  // lý do kết trận
  end: { coopOut: 'Your shared lives ran out!', youOut: 'Your rival outlasted you on the same waves', rivalOut: 'You outlasted your rival on the same waves', coreDown: 'The core was destroyed!' },
  tier: {
    trang: 'COMMON', xanh: 'RARE', tim: 'EPIC', vang: 'LEGENDARY', do: 'MYTHIC',
  },
  mob: { bo: 'Crawler', bay: 'Flyer', bay_bang: 'Frost Flyer', khong_lo: 'Giant', tach: 'Splitter', que_tach: 'Big Splitter', nho: 'Spawnling' },
  boss: {
    mad_crown:  { name: 'MAD CROWN',    skill: 'SCRAMBLE',    desc: 'Turns 3 random turrets into random deck types (same star)' },
    freezer:    { name: 'FREEZER',      skill: 'DEEP FREEZE', desc: 'Freezes 3 random turrets for 6 s (+1 every 20 waves, max 5; co-op: split across both boards)', descN: (n) => 'Freezes ' + n + ' random turrets for 6 s' },
    janus:      { name: 'JANUS CUBE',   skill: 'PETRIFY',     desc: 'Turns 1 turret to stone (stone only merges with same-star stone → a higher stone)' },
    joker_king: { name: 'JOKER KING',   skill: 'FORCE MERGE', desc: 'Throws a Mimic onto 1 turret and forces a same-star merge' },
    nightmare:  { name: 'NIGHTMARE',    skill: 'SNIPE',       desc: 'Snipes a random turret: −1★ (1★ explodes)' },
    octopus:    { name: 'OCTOPUS EYES', skill: 'BURN',        desc: 'Burns 3 turrets for 6 s: −1★ when the fire ends unless cleansed (1★ is destroyed)' },
  },
  // kỹ năng Ma vương (Archfiend)
  af: {
    hero:   { name: 'REINFORCE',   desc: 'Instantly summon two 1★ turrets (free); no room → +1★ to your weakest' },
    dahlia: { name: 'RAGE',        desc: '+100% damage to the whole board for 10s' },
    eve:    { name: 'HOLY SHIELD', desc: 'Clears freeze, stone & burn + blocks boss skills and rival merge effects for 8s' },
    tech:   { name: 'QUICK TUNE',  desc: 'Your 1★ and 2★ Attack turrets fire 40% faster for 10s' },
    tide:   { name: 'DRAG NET',    desc: 'Enemies on your path move 25% slower for 6s (bosses 12%)' },
    twin:   { name: 'TWIN SIGNAL', desc: 'Tap a turret that has a twin (same type and star): both deal +60% damage for 12s. Merging either twin ends the buff' },
    hawk:   { name: 'CROSSFIRE',   desc: 'Tap a cell: Attack turrets in its row and column get +20% damage for each different turret type there (max +100%) for 10s' },
    weaver: { name: 'NEXUS LINK',  desc: 'Tap an Attack turret: links up to 3 Support turrets in its row or column (not next to it). Each link gives +15% damage (+5% per Support star) and +10% speed for 11s' },
  },
  // 64 ụ: name = tên hiển thị, skill = mô tả ngắn. portrait (tuỳ chọn) = đường dẫn ảnh thẻ thay thế (mặc định assets/nho/<id>.png)
  turret: {
    canon:      { name: 'Compass Cannon', skill: 'Gets 1 random direction (N, S, W or E). Merge two Compasses to combine their directions (N + S = NS). Result star = average of the two, rounded up. Each direction fires 1 homing rocket. Full NSWE only merges with NSWE: adds a damage stack' },
    xucxac:     { name: 'Dice Gun',      skill: 'Each shot deals random damage: 3% to 300%. A crit always deals 300%. Tip: add crit chance' },
    lien:       { name: 'Gatling',       skill: 'Shoots very fast at the first enemy. Each ★ makes it shoot faster. Tip: put a Radar next to it' },
    phun:       { name: 'Scatter',       skill: 'Shoots very fast at random enemies. Good against groups. Each ★ makes it shoot faster' },
    sungluc:    { name: 'Revolver',      skill: 'One big shot at the first enemy. The bullet hits at once. Tip: add crit or damage support' },
    bang:       { name: 'Frost',         skill: 'Special: every 6s it Freezes the first enemy for 2s (no damage). Bosses do not Freeze: they slow 50% for 0.6s. The same enemy can\'t be Frozen again for 3s' },
    doc:        { name: 'Venom',         skill: 'Special: marks the first enemy for 5s. A marked enemy takes +12% damage from all turrets. Higher ★ marks 2 enemies' },
    mana:       { name: 'Mana Core',     skill: 'Does not shoot. Makes mana every 7s (faster and more at higher ★). Tip: use the mana to Summon' },
    tia:        { name: 'Sniper',        skill: 'Shoots the enemy with the most HP. +100% damage to big enemies and Bosses' },
    set:        { name: 'Tesla',         skill: 'Lightning hits 1 enemy, then jumps to the next. It hits as many enemies as its ★ (4★ = 4 enemies)' },
    maychem:    { name: 'Guillotine',    skill: 'Each shot has a small chance to kill a small enemy at once. Tip: good when many small enemies come' },
    phagiap:    { name: 'Armor Breaker',       skill: 'Support: every 3s it breaks the armor of the first enemy and the enemy with the most HP. Attack Neighbours (4 sides) deal more damage to them' },
    bua:        { name: 'Hammer',        skill: 'Support: Attack Neighbours (4 sides) get more crit chance and crit damage. Their crits also stop the enemy for a moment' },
    nam:        { name: 'Iron Fist',     skill: 'Melee: punches enemies close to it, very fast. Each punch blasts the enemies around the target. Tip: place it next to the path' },
    bomhen:     { name: 'Time Bomb',     skill: 'Special: sticks a bomb on a random enemy. The bomb blows up after 5s. Enemies near the blast take +10% damage for a few seconds' },
    nhanmana:   { name: 'Mana Doubler',  skill: 'Merge 2 Mana Doublers: you get a lot of mana at once. Higher ★ gives more mana' },
    kiembang:   { name: 'Ice Blade',     skill: 'Deals ×5 damage to slowed enemies (×6 at 3★, ×8 at 7★). Each hit also slows enemies near the target' },
    mimic:      { name: 'Mimic',         skill: 'Merges with ANY turret of the same ★. The new turret gets +attack for 8s. Tip: use it to fix a bad board' },
    chimang:    { name: 'Crit Antenna',  skill: 'Support: Neighbours (4 sides) get more crit chance (+6.8% at 1★, +22.5% at 7★). A crit deals double damage' },
    dichchuyen: { name: 'Teleporter',    skill: 'Drag it onto a same-star turret: the two swap places. Works on Stone and Frozen turrets too. Tip: move a melee turret next to the path' },
    radar:      { name: 'Radar',         skill: 'Support: Neighbours (4 sides) shoot faster (+19.5% at 1★, +45% at 7★)' },
    drone:      { name: 'Drone Bay',     skill: 'Merge 2 Drone Bays: bomb drones fly out. 1 drone for each cell you drag, +1 per 3★ (max 8). Tip: drag from far away (corner to corner = 7)' },
    tron:       { name: 'Fusion Mixer',       skill: 'Support: Attack Neighbours (4 sides) shoot faster. More different Attack turrets in its Row and Column = bigger bonus' },
    nangluong:  { name: 'Energy Cannon', skill: 'The more mana you have, the more damage it deals (+100% per 120 mana, max +500%). Tip: save mana' },
    laser:      { name: 'Laser',         skill: 'Keeps a beam on 1 enemy. The beam gets stronger, up to ×4 in 3s. A new target starts again from ×1' },
    lanhgia:    { name: 'Chiller',       skill: 'Support: hits from Neighbours (4 sides) also slow the enemy (12% at 1★ → 28% at 7★; Bosses max 50%)' },
    mortar:     { name: 'Mortar',        skill: 'Fires shells at random enemies; each shell blasts an area. Every 3rd shell splits into small bombs (CLUSTER)' },
    khuech:     { name: 'Amplifier',     skill: 'Support: each time an Attack Neighbour (4 sides) hits the same enemy again, it deals more damage. Stacks up to 5 hits on each enemy' },
    vungdoc:    { name: 'Toxic Pool',    skill: 'Throws poison pools on the path. Enemies that walk through take damage over time' },
    loa:        { name: 'Cooldown Horn', skill: 'Merge 2 Cooldown Horns: your Archfiend skill is ready sooner (−12s at 4★). If it is already ready, it costs less mana' },
    hutmana:    { name: 'Mana Leech',    skill: 'Shoots the first enemy. Each hit gives you a little mana (limit per second)' },
    min:        { name: 'Mine Layer',    skill: 'Lays mines on the path. An enemy that steps on a mine makes it explode. Some are star mines (×3 damage)' },
    cuongno:    { name: 'Berserker',     skill: 'Each crit adds 1 RAGE. At 2 RAGE it goes into FRENZY: it shoots much faster for 5s. Tip: add crit chance' },
    baotuyet:   { name: 'Blizzard',      skill: 'Every few seconds a blizzard slows ALL enemies on the path for 3s and Freezes small ones for a moment' },
    nhanban:    { name: 'Cloner',        skill: 'Merge 2 Cloners: you also get a free 1★ turret (2★ if the Merge makes 3★ or more)' },
    lienket:    { name: 'Chain Link',    skill: 'Chain Links that touch (4 sides) make a chain. Each extra link: +40% damage. Stone breaks the chain. Breakthrough at 3 / 5 / 8 / 12 links' },
    kepha:      { name: 'Jammer',         skill: 'Merge 2 Jammers. PvP: rival turrets shoot 40% slower. Co-op: your ally\'s turrets shoot faster. Solo: your turrets shoot faster' },
    taylo:      { name: 'Cleanser',      skill: 'Support: every 12s it cleans up to 2 Neighbours (4 sides): removes Freeze, Stone and burn. Nothing to clean: Neighbours get +18% damage' },
    khien:      { name: 'Shield Gen',    skill: 'Support: Neighbours (4 sides) get a shield. It blocks 1 Boss skill or rival attack, then comes back after 18s' },
    hopbi:      { name: 'Mystery Box',   skill: 'Does not shoot. After 58s (46s from 3★) it opens and becomes a random turret of 1–6★, never lower than its own ★' },
    nangsao:    { name: 'Star Lift',     skill: 'Support: all 4 Neighbours shoot faster (+10% per ★). The lowest-star Neighbour gets ×1.5. From 5★: every 2 waves a star pip (3 pips = +1★)' },
    tuthan:     { name: 'Reaper Pillar', skill: 'Support: Neighbours (4 sides) may kill a normal enemy at once when its HP is under 30%' },
    xaotron:    { name: 'Scrambler',     skill: 'Merge 2 Scramblers. PvP: rival turrets are shuffled into other types. Co-op: lone ally turrets become mergeable. Solo: your lone turrets become mergeable' },
    epxung:     { name: 'Overclock',     skill: 'Drag it onto a same-star shooting turret: that turret shoots +90% faster. You can do it again: it Stacks' },
    no5:        { name: 'Fifth Shot',    skill: 'Counts its shots. Every 5th shot fires 3 bolts that explode' },
    bao:        { name: 'Storm Gun',     skill: 'Hits at once, very fast. Some hits jump to a 2nd enemy. Shoots slower next to another Storm Gun' },
    anhsang:    { name: 'Lighthouse',    skill: 'Light orbs fill up over time. When full, it Summons a free 1★ turret' },
    aten:       { name: 'Purifier',      skill: 'Deals ×4 damage to poisoned enemies. Enemies it kills explode and hit enemies nearby. Tip: pair with Venom or Toxic Pool' },
    dongbo:     { name: 'Sync Cannon',   skill: 'Support: EVERY Attack turret with the same ★ anywhere on your board deals more damage (no need to touch). PvP: rival turrets deal less damage' },
    railgun:    { name: 'Salvo Battery', skill: 'Bingo: more Salvo Batteries in a Row = more damage (3/5 +25%, 4/5 +65%, full row +200%). More in a Column = faster (2/3 +35%, full column +150%). Stones break the line' },
    vughep:     { name: 'Merge King',    skill: 'Drag it onto a same-star turret: that turret +1★ and keeps its type. 10% of Merge Kings are GOLDEN: +2★. Merge King + Merge King = Merge King +1★' },
    sinhdoi:    { name: 'Twin Maker',    skill: 'Merge 2 Twin Makers: you also get a random turret of the same ★ (10%: one ★ higher)' },
    hasao:      { name: 'Star Breaker',  skill: 'Support: Attack Neighbours (4 sides) deal more damage. First 5★ each wave: Solo: your weakest Attack turret +8% fire rate. Co-op: your ally\'s weakest +8%. PvP: the rival\'s first 5★ −8% fire rate' },
    saochep:    { name: 'Copycat',       skill: 'Drag it onto a same-star turret: it becomes a copy with 70% damage. Works on Stone turrets too, but not on Frozen. Random traits roll anew; the Copycat\'s own buffs are lost. Special same-type merges (Compass, Anvil, Merge King, Prism fusion) follow the target: into a copy stays a copy. A normal merge always makes a new real turret' },
    ngoisao:    { name: 'Star Cannon',   skill: 'Counts all ★ on your board now. Every 10★: it shoots faster and hits harder. Every 50★: much more damage. If your stars go down, the bonus goes down' },
    soi:        { name: 'Werewolf',     skill: 'Wolf gun. Normal: one barrel, a shot every 1.2s. Every hit splashes 70% damage to enemies within 1 tile. Each Summon or Merge has a 30% chance to come out AWAKENED: the mouth opens 3 barrels, a 3-shot volley every 0.8s that always crits, splash 85% within 1.2 tile' },
    tienhoa:    { name: 'Evolver',       skill: 'Does not shoot. An egg that hatches into a random turret +1★ after 10s + 2s per ★. A 6★ egg burns into a 7★ egg that never hatches: tap it for +20 mana' },
    cauvong:    { name: 'Rainbow',       skill: 'Support: paints a rainbow on the path. Solo: enemies on it take more damage. Co-op: the same, on your path. PvP: paints the rival\'s path; enemies there take less damage' },
    wallgen:    { name: 'Wall Projector', skill: 'Puts a wall on the path. The wall stops enemies, then explodes. Merge 2 Wall Projectors: a GOLDEN WALL (holds 6s, ×6 blast)' },
    orbital:    { name: 'Orbital',       skill: 'Special: no normal shots. Merge 2 Orbitals: EVERY Orbital on your board wakes up for 23s and drops bombs on enemies' },
    blackhole:  { name: 'Black Hole',    skill: 'Opens a black hole where enemies crowd. It holds them in place, then crushes them. From 3★, tap (30 mana): SINGULARITY COLLAPSE makes the next hole bigger and stronger' },
    overlord:   { name: 'Overlord',      skill: 'Charges slowly, then fires a huge thunder blast on a group. Small sparks then jump to more enemies' },
    lophanung:  { name: 'Cryo Reactor',  skill: 'Support: cold air slows enemies near it. Attack Neighbours (4 sides) deal more damage to slowed enemies. Tap when full: FREEZE enemies near it' },
    haoquang:   { name: 'Holy Halo',     skill: 'Special: does not shoot. Tap when full: a barrier for 3s. Enemies that get through cost no hearts. Boss skills are weaker' },
    // ụng mới (TUONG-MOI-20.md) — skills3.js / skills4.js
    nayda:        { name: 'Ricochet',       skill: 'A disc hits 1 enemy, then bounces to more. Bounces = its ★. Each bounce hits harder' },
    combo:        { name: 'Combo Core',     skill: 'Merge 2 Combo Cores: EVERY Combo Core gets +damage for good (Stacks, no cap). Breakthrough at 5 / 10 / 20 / 40 combos. Co-op: half of your ally\'s combos count too' },
    khoathoigian: { name: 'Chrono Lock',    skill: 'Locks the first enemy in time. Damage it takes is saved. When the lock ends, the saved damage bursts out' },
    hydra:        { name: 'Hydra',          skill: '1 head per ★. The heads fire a chain of shots, then rest. No mana power-up. Tap the Hydra card: ALL Hydras of 3★ or more fire twice as fast; 7★ ones become a MACHINE GUN (10 shots/s for 7.5s, longer with card level). Cost: 40 mana, doubles each use' },
    cuuvi:        { name: 'Nine-Tail',      skill: 'Each kill grows a fire tail. At 9 tails it fires 9 foxfires that chase enemies. Breakthrough at 1 / 3 / 6 / 10 foxfire attacks' },
    pandora:      { name: 'Pandora Vault',  skill: 'Merge 2 Pandora Vaults: the vault opens 1 of 6 big effects (mana, Freeze all, +1★, bombs, shields, frenzy). Co-op: some effects also help your ally' },
    luoicheo:     { name: 'Resonance Grid', skill: 'Support: buffs the 4 DIAGONAL cells (corners), not the 4 sides. All 4 diagonals filled = RESONANCE (bigger bonus)' },
    ngaithoigian: { name: 'Chrono Throne',  skill: 'Enemies on the path get slower over time. From 3★, tap when full: REWIND pushes all enemies back. Co-op: Rewind hits both paths' },
    nemesis:      { name: 'Nemesis',        skill: 'Each hit deals +0.5% of max HP (more per ★). Every 10 hits gives a VERDICT. More normal enemies hit: +4% fire rate forever (max +60%). More elites or bosses, or a tie: +6% damage forever (max +100%)' },
    docton:       { name: 'Lone Ace',       skill: 'Alone is best: with no Neighbours (4 sides empty) it shoots ×2 faster and crits more' },
    thaukinh:     { name: 'Focus Lens',     skill: 'Support: Neighbours (4 sides) deal more crit damage. Their crits go through to the enemy behind' },
    nhieusong:    { name: 'Signal Jammer',  skill: 'Merge 2 Signal Jammers. PvP: rival turrets shoot 40% slower for a few seconds. Co-op: your ally\'s next Summon is free. Solo: all enemies slow 20%' },
    santhuong:    { name: 'Bounty Beacon',  skill: 'Marks an enemy (big ones first). When a marked enemy dies, you get bonus mana' },
    nhatthuc:     { name: 'Eclipse',        skill: 'Day: a beam that burns. Night: a wave that slows. Changes every 8s' },
    loren:        { name: 'Twin Anvil',     skill: 'Special: each Anvil is a Damage or a Speed type. Drag onto an Anvil of the SAME type to add stacks (max 14, risky: it can fail and lose the dragged one). Drag onto any other turret: it gets +3% damage or +2% fire rate per stack for good (lost if that turret merges)' },
    guongcong:    { name: 'Mirror Gate',    skill: 'Support (original): Neighbours (4 sides) resist control. Every 20s: Solo: blocks 1 Boss skill. PvP: sends 1 rival attack back. Co-op: copies 1 ally Merge effect' },
    marionette:   { name: 'Marionette',     skill: 'Grabs an enemy and makes it walk back. It hits other enemies on the way, then explodes' },
    // đợt 3 — 4 ụ Đỏ (skills5.js)
    chuato:       { name: 'Hive Queen',     skill: 'Drones circle the hive (1 per star). When the brood is full they all fly out; more drones hit harder. From 3★, tap when full: SWARM — release them all now, +35% damage' },
    leviathan:    { name: 'Leviathan',      skill: 'Eats small enemies to get ABYSS points: +4% damage each (no cap). Killing an elite gives +3, a Boss +10. Each Leviathan keeps its own; a new one (merges too) starts at 0. From 3★, tap when full: TIDAL BREATH — water rains on the whole path' },
    khoisinh:     { name: 'Genesis Core',   skill: 'Every 12s gives +1★ to the lowest-star turret next to it (up, down, left, right). It has as many gifts as its stars when it appeared; with none left it breaks. From 3★, tap (30 mana): GENESIS summons a 1★ into an empty cell next to it' },
    // đợt vàng mới 1 (vangmoi1.js)
    lualien: { name: 'Ember Relay', skill: 'When an Ember leaves the board for any reason (merged, sold, destroyed), its flames pass to every Ember in its row and column. Merging two Embers: every other Ember in the merge tile\'s row and column gains both Embers\' flames. Embers that stay (stone, frozen, transformed, lost a star) keep their flames. Each flame: +8% damage, +0.4% crit (crit max 100%), +4% crit damage. Flames also raise fire rate (soft cap, max +200%). No flame limit. Breakthrough at 10 / 30 / 50 / 70 flames' },
    hopca: { name: 'Quantum Choir', skill: 'HARMONY: each touching turret (up, down, left, right) with the same ★ gives +35% damage and +8% crit damage. 2: hits a 2nd enemy. 3: +30% fire rate. 4: +50% crit damage and an echo hit' },
    luutru: { name: 'Fusion Archive', skill: 'Every real merge on your board gives +1 charge to ONE random Archive. Each charge +2% damage. Rewards at 10 / 20 / 30 / 40 charges (max 40, more at card LV11/13/15)' },
    xuonganh: { name: 'Hero Foundry', skill: 'Merge 2 Hero Foundries: that cell becomes a HERO tile for 25s. The turret on it gets +80% fire rate and +30% crit damage' },
    ronglua:      { name: 'Wyrm Engine',    skill: 'HEAT REACTOR: breathes a thin FIRE BEAM at the front enemy that pierces every enemy on the line and burns them; every beam tick that hits adds Heat (no cap, cools 2%/s); real merges in its row or column add +5 × ★ heat. Each heat +0.2% damage · 100 heat: +25% breath speed · 250 heat: +100% crit damage. From 3★ a HEART CORE makes the beam longer and thicker and hits the front enemy harder; tap when full: DRAGON DIVE burns ALL heat for ×(1 + heat/100) down the whole path. 4 forms: Hatchling · Winged Wyrm · Armored (blue flame) · Inferno (white flame, twin beams)' },
    // ụ vàng mới đợt 2 (skills7.js)
    mauhut:       { name: 'Blood Circuit',  skill: 'Attack: shoots blood bolts at the front enemy. Drag onto one of your turrets to MARK it: after 5s + 3s per ★ it is eaten, +5 Blood per ★ (higher card level: faster). Each Blood gives it +5% damage, +0.6% fire rate, +0.2% crit and +3% crit damage, no limit. At 20 / 50 / 100 Blood it changes into a stronger form; from 20 Blood every 10th shot is a blood nova (50 / 100 / 200: every 6th / 5th / 4th). New Blood Circuits start with 0 Blood' },
    nguyenrua:    { name: 'Hex Saboteur',   skill: 'Merge 2 Hex Saboteurs: a hex flies out. PvP: a rival turret may lose 1★. Co-op: an ally turret may get +1★. Solo: the first enemy is slowed and takes more damage' },
    thanhdia:     { name: 'Sanctum',        skill: 'Support: when it arrives, it cleans and shields its Neighbours (4 sides). Attack Neighbours get +damage. Shields come back over time' },
    // ụ cờ bạc Đỏ (jackpot.js, 08/11)
    // ụ ghép tự do VÀNG (game.js laTuDo, 08/11)
    tudo:         { name: 'Wild Link',      skill: 'Merges with ANY turret: any type, any star. Result: a random turret, star = average of the two, rounded up (3 + 4 stars = 4 stars, no bonus star). Counts as a real merge (triggers Twin Maker etc.). Works on Stone and Frozen turrets too: the result is unlocked' },
    cobac:        { name: 'Lucky Slot',     skill: 'Spins 3 fruit reels when it appears (summon or merge). A pair = +1 point to that fruit; 3 of a kind = JACKPOT: +2 to all fruits. No match = spin again. Points are shared by all Lucky Slots. Orange = damage, Watermelon = speed, Grape = crit damage. Raising its star in place (like Merge King) doesn\'t spin again.' },
    bienmau:      { name: 'Prism Thief',    skill: 'Each one has 1 colour: red kills, gold gives mana, blue freezes, green crits. Put 4 different colours side by side and swipe through all 4: they FUSE into one 4-colour Spectrum Prism with all 4 effects. Fuse it again to make it stronger, no limit' },
  },
};

// ảnh chân dung thẻ của 1 ụ (đổi ảnh: thêm TEXT.turret[id].portrait)
// chân dung phi công (đã duyệt) — thêm id vào đây khi có ảnh assets/pilot_<id>.png mới
const PILOTS = new Set(['canon', 'xucxac', 'lien', 'phun', 'sungluc', 'bang', 'doc', 'mana', 'tia', 'set', 'maychem', 'phagiap', 'bua', 'nam', 'bomhen', 'nhanmana', 'kiembang', 'mimic', 'chimang', 'dichchuyen', 'radar', 'drone', 'tron', 'nangluong', 'laser', 'lanhgia', 'mortar', 'khuech', 'vungdoc', 'loa', 'hutmana', 'min', 'cuongno', 'baotuyet', 'nhanban', 'lienket', 'kepha', 'taylo', 'khien', 'hopbi', 'nangsao', 'tuthan', 'xaotron', 'epxung', 'no5', 'bao', 'anhsang', 'aten', 'dongbo', 'railgun', 'vughep', 'sinhdoi', 'hasao', 'saochep', 'ngoisao', 'soi', 'tienhoa', 'cauvong', 'wallgen', 'orbital', 'blackhole', 'overlord', 'lophanung', 'haoquang',
  'nayda', 'combo', 'khoathoigian', 'hydra', 'cuuvi', 'pandora', 'luoicheo', 'ngaithoigian',
  'nemesis', 'docton', 'thaukinh', 'nhieusong', 'santhuong', 'nhatthuc', 'loren', 'guongcong', 'marionette',
  'chuato', 'leviathan', 'khoisinh', 'ronglua', 'mauhut', 'nguyenrua', 'thanhdia', 'bienmau', 'cobac', 'tudo']);
// ?ucu=1: nạp lại BỘ ĐẦU CŨ (trước bộ u2) — ảnh <ten>_v1.png (danh sách DAU_V1 + số cỡ ART_V1 trong artscale.js)
window.UCU = /[?&]ucu=1(&|$)/.test(location.search);
let _dauV1 = null;
function anhTen(ten) {
  if (!window.UCU || !window.DAU_V1) return ten;
  if (!_dauV1) _dauV1 = new Set(window.DAU_V1);
  return _dauV1.has(ten) ? ten + '_v1' : ten;
}
function iconOf(id) { const t = anhTen('nho/' + id); return typeof anhUrl === 'function' ? anhUrl(t) : 'assets/' + t + '.png'; }
function hasPilot(id) { const t = TEXT.turret[id]; return !!((t && t.portrait) || PILOTS.has(id)); }
// ảnh LỚN cho trang ụ/chỉ huy (3× cỡ hiển thị, tools/thap-hero.py); thẻ/thanh bài vẫn dùng pilot_<id>.png nhỏ
function heroOf(id) { return 'assets/hero/hero_' + id + (id.indexOf('af_') === 0 ? '.webp' : '.jpg'); } // chỉ huy: nền trong suốt (webp)
// ảnh NHỎ 256 px (assets/pn/pilot_<id>.png — tools/thap-pilot-nho.py) cho lưới 85 ô, 5 ô bộ bài, khay trận, dải đối thủ: ô hiện ≤ 195 px thật
// (trước: tải + giải mã 85 ảnh 427 px ≈ 37 MB → cuộn màn bộ bài giật trên iPhone). Ảnh to (trang chi tiết, bóng kéo) vẫn portraitOf.
function thumbOf(id) { const t = TEXT.turret[id]; return (t && t.portrait) || (PILOTS.has(id) ? (typeof anhUrl === 'function' ? anhUrl('pn/pilot_' + id) : 'assets/pn/pilot_' + id + '.png') : iconOf(id)); }
function portraitOf(id) { const t = TEXT.turret[id]; return (t && t.portrait) || (PILOTS.has(id) ? (typeof anhUrl === 'function' ? anhUrl('pilot_' + id) : 'assets/pilot_' + id + '.png') : iconOf(id)); }
// ảnh trên thẻ: chỉ chân dung phi công (KHÔNG huy hiệu/icon tròn nhỏ cạnh mặt — người dùng yêu cầu bỏ; độ hiếm = màu khung); chưa có phi công → icon ụ to
// lưới 85 thẻ được dựng sẵn lúc khởi động (màn bộ bài đang ẩn): trước khi HOME hiện, ảnh để ở data-tm-src (trình duyệt KHÔNG
// tải 85 chân dung trước HOME); taitai.js tải chúng ở đợt nền rồi gán src (lấy từ bộ đệm). Mở bộ bài sớm → cổng bấm đợi đợt nền.
function cardArt(id) {
  const a = typeof srcTai === 'function' ? srcTai() : 'src';
  return hasPilot(id) ? '<img class="anh pilot" decoding="async" ' + a + '="' + thumbOf(id) + '" alt="">' : '<img class="anh" decoding="async" ' + a + '="' + iconOf(id) + '" alt="">';
}
// phủ tên/kỹ năng tiếng Anh lên dữ liệu roster (roster.json giữ bản tiếng Việt ở ten_vi / kyNang_vi)
function applyText(roster) { for (const r of roster) { const t = TEXT.turret[r.id]; if (t) { r.ten = t.name; r.kyNang = t.skill; } } return roster; }
