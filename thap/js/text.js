// TURRET MERGE — BẢNG CHỮ HIỂN THỊ (tiếng Anh). Mọi chữ người chơi thấy nằm ở đây để dễ sửa.
// id dữ liệu giữ nguyên tiếng Việt; chỉ chữ hiển thị đổi. Dòng chỉ số động của từng kỹ năng nằm cạnh công thức trong skills*.js.
'use strict';

const TEXT = {
  ui: {
    subtitle: 'MERGE · DEFEND · SURVIVE',
    pick5: 'PICK 5 TURRETS',
    sortTier: 'SORT: TIER', sortName: 'SORT: NAME',
    playable: 'playable', maxOneMythic: 'max 1 Mythic',
    soon: 'SOON',
    coopSub: '2 players · 1 leak = defeat', soloSub: '1 board · 3 hearts', pvpSub: 'Kills send enemies to rival',
    random: 'RANDOM', start: 'START',
    paused: 'PAUSED', soundOn: 'SOUND: ON', soundOff: 'SOUND: OFF', sfxOn: 'SFX: ON', sfxOff: 'SFX: OFF', musicOn: 'MUSIC: ON', musicOff: 'MUSIC: OFF', quit: 'QUIT', resume: 'RESUME',
    changeDeck: 'CHANGE DECK', again: 'PLAY AGAIN', pause: 'Pause',
    summon: 'SUMMON',
    deckFull: 'Your deck already has 5 turrets', oneMythic: 'Only 1 Mythic turret per deck',
    bossIn: (n) => 'BOSS IN ' + n + ' WAVES', bossWave: 'BOSS WAVE!',
    coopLeak: '1 LEAK<br>= DEFEAT', rival: 'RIVAL', you: 'YOU', ally: 'ALLY',
    wave: 'WAVE', bossComing: 'BOSS INCOMING!', wave1Hint: 'Summon & merge turrets!',
    victory: 'VICTORY', defeat: 'DEFEAT', reached: (w) => 'Reached <b>WAVE ' + w + '</b>',
    role: { tc: 'Attack', ht: 'Support', db: 'Special' },
    comingSoon: 'Coming in a future update.',
    dmg: 'Damage', baseDmg: (d, hs) => 'Base damage ' + d + ' · ×' + hs + ' from tier',
    stoned: 'STONE (merge with same-star stone)', frozen: 'FROZEN', burning: 'BURNING',
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
  end: { leak: 'An enemy reached the core!', youOut: 'You ran out of hearts', rivalOut: 'Rival ran out of hearts', coreDown: 'The core was destroyed!' },
  tier: {
    trang: 'COMMON', xanh: 'RARE', tim: 'EPIC', vang: 'LEGENDARY', do: 'MYTHIC',
  },
  mob: { bo: 'Crawler', bay: 'Flyer', bay_bang: 'Frost Flyer', khong_lo: 'Giant', tach: 'Splitter', que_tach: 'Big Splitter', nho: 'Spawnling' },
  boss: {
    mad_crown:  { name: 'MAD CROWN',    skill: 'SCRAMBLE',    desc: 'Turns 3 turrets into random types' },
    freezer:    { name: 'FREEZER',      skill: 'FREEZE',      desc: 'Freezes your strongest turret' },
    janus:      { name: 'JANUS CUBE',   skill: 'PETRIFY',     desc: 'Turns 1 turret to stone (stone only merges with same-star stone)' },
    joker_king: { name: 'JOKER KING',   skill: 'FORCE MERGE', desc: 'Throws a Mimic onto 1 turret and forces a same-star merge' },
    nightmare:  { name: 'NIGHTMARE',    skill: 'SNIPE',       desc: 'Snipes your highest-star turret: −1★ (1★ explodes)' },
    octopus:    { name: 'OCTOPUS EYES', skill: 'BURN',        desc: 'Burns 3 turrets: −1★ when the fire ends unless cleansed' },
  },
  // kỹ năng Ma vương (Archfiend)
  af: {
    hero:   { name: 'REINFORCE',   desc: 'Instantly summon two 1★ turrets (free)' },
    dahlia: { name: 'RAGE',        desc: '+100% damage to the whole board for 10s' },
    eve:    { name: 'HOLY SHIELD', desc: 'Clears debuffs + blocks boss skills for 8s' },
  },
  // 64 ụ: name = tên hiển thị, skill = mô tả ngắn. portrait (tuỳ chọn) = đường dẫn ảnh thẻ thay thế (mặc định assets/nho/<id>.png)
  turret: {
    canon:      { name: 'Cannon',        skill: 'Slow explosive shells; stars widen the blast' },
    xucxac:     { name: 'Dice Gun',      skill: 'Random 3–300% damage; crits always roll max' },
    lien:       { name: 'Gatling',       skill: 'Very fast fire; stars raise fire rate' },
    phun:       { name: 'Scatter',       skill: 'Rapid fire at random enemies' },
    sungluc:    { name: 'Revolver',      skill: 'One heavy shot at the lead enemy' },
    bang:       { name: 'Frost',         skill: 'Slows the lead enemy 35% for 4s' },
    doc:        { name: 'Venom',         skill: 'Poison damage over time' },
    mana:       { name: 'Mana Core',     skill: 'Does not shoot; makes mana every 7s' },
    tia:        { name: 'Sniper',        skill: 'Targets the highest-HP enemy; +100% vs big foes' },
    set:        { name: 'Tesla',         skill: 'Chain lightning hits N enemies (N = stars)' },
    maychem:    { name: 'Guillotine',    skill: 'Chance to instantly kill small enemies' },
    phagiap:    { name: 'Armor Breaker',       skill: 'Weakens enemies so they take more damage' },
    bua:        { name: 'Hammer',        skill: 'Critical hits knock enemies back' },
    nam:        { name: 'Iron Fist',     skill: 'Melee: rapid ring blasts all around' },
    bomhen:     { name: 'Time Bomb',     skill: 'Sticks a bomb on a random enemy; boom in 5s' },
    nhanmana:   { name: 'Mana Doubler',  skill: 'On merge: gain lots of mana' },
    kiembang:   { name: 'Ice Blade',     skill: '+400% damage to slowed enemies' },
    mimic:      { name: 'Mimic',         skill: 'Merges with ANY same-star turret; attack buff after' },
    chimang:    { name: 'Crit Antenna',  skill: 'Support: +crit chance for 4 neighbors' },
    dichchuyen: { name: 'Teleporter',    skill: 'Swaps places with a same-star turret' },
    radar:      { name: 'Radar',         skill: 'Support: +fire rate for 4 neighbors (+25% at 1★, grows with ★/LV)' },
    drone:      { name: 'Drone Bay',     skill: 'On merge: launches bomb drones up the path' },
    tron:       { name: 'Fusion Mixer',       skill: 'Merges with any turret; stars = average' },
    nangluong:  { name: 'Energy Cannon', skill: 'Damage grows with your current mana' },
    laser:      { name: 'Laser',         skill: 'Continuous beam that grows stronger' },
    lanhgia:    { name: 'Chiller',       skill: 'Support: neighbors’ shots also slow' },
    mortar:     { name: 'Mortar',        skill: 'Shells random enemies; every 3rd shell is a CLUSTER' },
    khuech:     { name: 'Amplifier',     skill: 'Support: stacking damage for 4 neighbors' },
    vungdoc:    { name: 'Toxic Pool',    skill: 'Throws poison puddles on the path' },
    loa:        { name: 'Cooldown Horn', skill: 'On merge: cuts Archfiend skill cooldown' },
    hutmana:    { name: 'Mana Leech',    skill: 'Gains mana on every hit' },
    min:        { name: 'Mine Layer',    skill: 'Lays mines on the path; some are star mines (×3)' },
    cuongno:    { name: 'Berserker',     skill: 'Crits build RAGE, then a fire-rate FRENZY' },
    baotuyet:   { name: 'Blizzard',      skill: 'Periodically slows ALL enemies' },
    nhanban:    { name: 'Cloner',        skill: 'On merge: summons an extra 1★ turret' },
    lienket:    { name: 'Chain Link',    skill: 'Stronger with more linked turrets of its type' },
    kepha:      { name: 'Jammer',         skill: 'On merge: PVP slows rival turrets; Co-op speeds allies' },
    taylo:      { name: 'Cleanser',      skill: 'On merge: removes debuffs from N turrets' },
    khien:      { name: 'Shield Gen',    skill: 'On merge: one-hit shield for N turrets' },
    hopbi:      { name: 'Mystery Box',   skill: 'After 47s becomes a random 1–7★ turret' },
    nangsao:    { name: 'Star Lift',     skill: 'On merge: +1★ to another turret' },
    tuthan:     { name: 'Reaper Pillar', skill: 'Support: neighbors may instantly kill small enemies' },
    xaotron:    { name: 'Scrambler',     skill: 'On merge: PVP shuffles rival turrets' },
    epxung:     { name: 'Overclock',     skill: 'Drag onto a same-star turret: +65% fire rate' },
    no5:        { name: 'Fifth Shot',    skill: 'Every 5th shot fires 3 exploding bolts' },
    bao:        { name: 'Storm Gun',     skill: 'Instant, very fast hits; slower next to its own kind' },
    anhsang:    { name: 'Lighthouse',    skill: 'Light orbs periodically summon 1★ turrets' },
    aten:       { name: 'Purifier',      skill: '+300% vs poisoned enemies; kills explode' },
    dongbo:     { name: 'Sync Cannon',   skill: 'Stronger for each same-star turret on the board' },
    railgun:    { name: 'Railgun',       skill: 'Bingo: full row +damage, full column +fire rate' },
    vughep:     { name: 'Merge King',    skill: 'Same-star merge: +1★ (Gold version +2★)' },
    sinhdoi:    { name: 'Twin Maker',    skill: 'On merge: summons an extra same-star turret' },
    hasao:      { name: 'Star Breaker',  skill: 'On merge: PVP −1★ to a rival turret; Co-op +★ to an ally' },
    saochep:    { name: 'Copycat',       skill: 'Copies any same-star turret (less damage)' },
    ngoisao:    { name: 'Star Cannon',   skill: 'Star total in 10s → faster; 50★ → huge damage' },
    soi:        { name: 'Werewolf',     skill: 'Melee wolf that GROWS: Pup → Hunter → AWAKENED (always crits)' },
    tienhoa:    { name: 'Evolver',       skill: 'After a while becomes a random turret +1★' },
    cauvong:    { name: 'Rainbow',       skill: 'Paints rainbows on the path that weaken enemies' },
    wallgen:    { name: 'Wall Projector', skill: 'Raises a wall on the path, then it explodes' },
    orbital:    { name: 'Orbital',       skill: 'On merge: sky bombardment 20s; Orbitals awaken while it lasts' },
    blackhole:  { name: 'Black Hole',    skill: 'Pulls enemies in and crushes them' },
    overlord:   { name: 'Overlord',      skill: 'Slow charge, then a massive thunder blast' },
    lophanung:  { name: 'Cryo Reactor',  skill: 'Slowing aura: slower = more damage; active skill' },
    haoquang:   { name: 'Holy Halo',     skill: 'Active skill: board-wide invincibility shield' },
  },
};

// ảnh chân dung thẻ của 1 ụ (đổi ảnh: thêm TEXT.turret[id].portrait)
// chân dung phi công (đã duyệt) — thêm id vào đây khi có ảnh assets/pilot_<id>.png mới
const PILOTS = new Set(['canon', 'xucxac', 'lien', 'phun', 'sungluc', 'bang', 'doc', 'mana', 'tia', 'set', 'maychem', 'phagiap', 'bua', 'nam', 'bomhen', 'nhanmana', 'kiembang', 'mimic', 'chimang', 'dichchuyen', 'radar', 'drone', 'tron', 'nangluong', 'laser', 'lanhgia', 'mortar', 'khuech', 'vungdoc', 'loa', 'hutmana', 'min', 'cuongno', 'baotuyet', 'nhanban', 'lienket', 'kepha', 'taylo', 'khien', 'hopbi', 'nangsao', 'tuthan', 'xaotron', 'epxung', 'no5', 'bao', 'anhsang', 'aten', 'dongbo', 'railgun', 'vughep', 'sinhdoi', 'hasao', 'saochep', 'ngoisao', 'soi', 'tienhoa', 'cauvong', 'wallgen', 'orbital', 'blackhole', 'overlord', 'lophanung', 'haoquang']);
function iconOf(id) { return 'assets/nho/' + id + '.png'; }
function hasPilot(id) { const t = TEXT.turret[id]; return !!((t && t.portrait) || PILOTS.has(id)); }
function portraitOf(id) { const t = TEXT.turret[id]; return (t && t.portrait) || (PILOTS.has(id) ? 'assets/pilot_' + id + '.png' : iconOf(id)); }
// ảnh trên thẻ: chân dung phi công to ở giữa + icon ụ nhỏ ở góc; chưa có phi công → icon ụ to
function cardArt(id) { return hasPilot(id) ? '<img class="anh pilot" src="' + portraitOf(id) + '" alt=""><img class="ic" src="' + iconOf(id) + '" alt="">' : '<img class="anh" src="' + iconOf(id) + '" alt="">'; }
// phủ tên/kỹ năng tiếng Anh lên dữ liệu roster (roster.json giữ bản tiếng Việt ở ten_vi / kyNang_vi)
function applyText(roster) { for (const r of roster) { const t = TEXT.turret[r.id]; if (t) { r.ten = t.name; r.kyNang = t.skill; } } return roster; }
