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
  end: { coopOut: 'Your shared lives ran out!', youOut: 'Your rival outlasted you on the same waves', rivalOut: 'You outlasted your rival on the same waves', coreDown: 'The core was destroyed!' },
  tier: {
    trang: 'COMMON', xanh: 'RARE', tim: 'EPIC', vang: 'LEGENDARY', do: 'MYTHIC',
  },
  mob: { bo: 'Crawler', bay: 'Flyer', bay_bang: 'Frost Flyer', khong_lo: 'Giant', tach: 'Splitter', que_tach: 'Big Splitter', nho: 'Spawnling' },
  boss: {
    mad_crown:  { name: 'MAD CROWN',    skill: 'SCRAMBLE',    desc: 'Turns 3 turrets into random types' },
    freezer:    { name: 'FREEZER',      skill: 'DEEP FREEZE', desc: 'Freezes your 3 strongest turrets for 6 s (+1 every 20 waves, max 5)', descN: (n) => 'Freezes your ' + n + ' strongest turrets for 6 s' },
    janus:      { name: 'JANUS CUBE',   skill: 'PETRIFY',     desc: 'Turns 1 turret to stone (stone only merges with same-star stone)' },
    joker_king: { name: 'JOKER KING',   skill: 'FORCE MERGE', desc: 'Throws a Mimic onto 1 turret and forces a same-star merge' },
    nightmare:  { name: 'NIGHTMARE',    skill: 'SNIPE',       desc: 'Snipes your highest-star turret: −1★ (1★ explodes)' },
    octopus:    { name: 'OCTOPUS EYES', skill: 'BURN',        desc: 'Burns 3 turrets: −1★ when the fire ends unless cleansed' },
  },
  // kỹ năng Ma vương (Archfiend)
  af: {
    hero:   { name: 'REINFORCE',   desc: 'Instantly summon two 1★ turrets (free); no room → +1★ to your weakest' },
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
    bang:       { name: 'Frost',         skill: 'Special: every 6s freezes the lead enemy 2s (bosses 0.6s); no chain-freeze' },
    doc:        { name: 'Venom',         skill: 'Special: marks the lead enemy 5s — it takes +12% damage from all turrets' },
    mana:       { name: 'Mana Core',     skill: 'Does not shoot; makes mana every 7s' },
    tia:        { name: 'Sniper',        skill: 'Targets the highest-HP enemy; +100% vs big foes' },
    set:        { name: 'Tesla',         skill: 'Chain lightning hits N enemies (N = stars)' },
    maychem:    { name: 'Guillotine',    skill: 'Chance to instantly kill small enemies' },
    phagiap:    { name: 'Armor Breaker',       skill: 'Support: every 3s exposes the lead + toughest enemy; Attack neighbours hit them +22%' },
    bua:        { name: 'Hammer',        skill: 'Support: Attack neighbours get crit chance + crit damage; their crits stagger' },
    nam:        { name: 'Iron Fist',     skill: 'Melee: rapid ring blasts all around' },
    bomhen:     { name: 'Time Bomb',     skill: 'Special: 5s bomb on a random enemy; the blast weakens nearby enemies 10%' },
    nhanmana:   { name: 'Mana Doubler',  skill: 'On merge: gain lots of mana' },
    kiembang:   { name: 'Ice Blade',     skill: '+400% vs slowed; each hit chills nearby enemies' },
    mimic:      { name: 'Mimic',         skill: 'Merges with ANY same-star turret; attack buff after' },
    chimang:    { name: 'Crit Antenna',  skill: 'Support: +crit chance for N/E/S/W neighbours (6% at 1★ → 20% at 7★)' },
    dichchuyen: { name: 'Teleporter',    skill: 'Swaps places with a same-star turret' },
    radar:      { name: 'Radar',         skill: 'Support: +fire rate for N/E/S/W neighbours (12% at 1★ → 28% at 7★)' },
    drone:      { name: 'Drone Bay',     skill: 'On merge: launches bomb drones up the path' },
    tron:       { name: 'Fusion Mixer',       skill: 'Support: +6% fire rate to Attack neighbours, +2% per different type (max 12% at 1★)' },
    nangluong:  { name: 'Energy Cannon', skill: 'Damage grows with your current mana' },
    laser:      { name: 'Laser',         skill: 'Continuous beam that grows stronger' },
    lanhgia:    { name: 'Chiller',       skill: 'Support: neighbours’ hits also slow (max 35%, bosses 15%)' },
    mortar:     { name: 'Mortar',        skill: 'Shells random enemies; every 3rd shell is a CLUSTER' },
    khuech:     { name: 'Amplifier',     skill: 'Support: Attack neighbours stack damage on repeated hits to one target (per enemy)' },
    vungdoc:    { name: 'Toxic Pool',    skill: 'Throws poison puddles on the path' },
    loa:        { name: 'Cooldown Horn', skill: 'On merge: cuts Archfiend skill cooldown' },
    hutmana:    { name: 'Mana Leech',    skill: 'Leech bolts at the lead enemy; each hit restores a little mana (capped per second)' },
    min:        { name: 'Mine Layer',    skill: 'Lays mines on the path; some are star mines (×3)' },
    cuongno:    { name: 'Berserker',     skill: 'Crits build RAGE, then a fire-rate FRENZY' },
    baotuyet:   { name: 'Blizzard',      skill: 'Slows ALL enemies and briefly freezes small ones' },
    nhanban:    { name: 'Cloner',        skill: 'On merge: summons an extra 1★ turret' },
    lienket:    { name: 'Chain Link',    skill: 'Stronger with more linked turrets of its type' },
    kepha:      { name: 'Jammer',         skill: 'On merge: PVP slows rival turrets; Co-op speeds allies' },
    taylo:      { name: 'Cleanser',      skill: 'Support: every 12s cleanses 2 neighbours; nothing to clean = +8% damage' },
    khien:      { name: 'Shield Gen',    skill: 'Support: neighbours get a 1-hit control shield, recharging every 18s' },
    hopbi:      { name: 'Mystery Box',   skill: 'After 47s becomes a random 1–7★ turret' },
    nangsao:    { name: 'Star Lift',     skill: 'Support: the 2 lowest-star neighbours fire faster (6% per ★); 5★ grants star pips' },
    tuthan:     { name: 'Reaper Pillar', skill: 'Support: neighbours may execute normal enemies under 30% HP' },
    xaotron:    { name: 'Scrambler',     skill: 'On merge: PVP shuffles rival turrets' },
    epxung:     { name: 'Overclock',     skill: 'Drag onto a same-star turret: +65% fire rate' },
    no5:        { name: 'Fifth Shot',    skill: 'Every 5th shot fires 3 exploding bolts' },
    bao:        { name: 'Storm Gun',     skill: 'Instant hits that can arc; slower next to its own kind' },
    anhsang:    { name: 'Lighthouse',    skill: 'Light orbs periodically summon 1★ turrets' },
    aten:       { name: 'Purifier',      skill: '+300% vs poisoned enemies; kills explode' },
    dongbo:     { name: 'Sync Cannon',   skill: 'Support: same-star Attack neighbours deal more damage (capped)' },
    railgun:    { name: 'Railgun',       skill: 'Bingo: full row +damage, full column +fire rate' },
    vughep:     { name: 'Merge King',    skill: 'Same-star merge: +1★ (Gold version +2★) · Merge King + Merge King → Merge King +1★' },
    sinhdoi:    { name: 'Twin Maker',    skill: 'On merge: also summons a random turret of the same ★ (needs an empty cell; the merge frees one)' },
    hasao:      { name: 'Star Breaker',  skill: 'Support: Attack neighbours +damage, merge surge. PVP: first rival 5★ each wave −8% fire rate' },
    saochep:    { name: 'Copycat',       skill: 'Copies any same-star turret (less damage)' },
    ngoisao:    { name: 'Star Cannon',   skill: 'Board ★ total: every 10 → faster; every 50 → more damage' },
    soi:        { name: 'Werewolf',     skill: 'Melee wolf that GROWS: Pup → Hunter → Alpha (always crits)' },
    tienhoa:    { name: 'Evolver',       skill: 'After a while becomes a random turret +1★' },
    cauvong:    { name: 'Rainbow',       skill: 'Support: paints a rainbow trail; Attack neighbours hit enemies on it harder' },
    wallgen:    { name: 'Wall Projector', skill: 'Raises a wall on the path, then it explodes' },
    orbital:    { name: 'Orbital',       skill: 'Special: on merge, a 20s sky bombardment (no normal shots)' },
    blackhole:  { name: 'Black Hole',    skill: 'Pulls enemies in and crushes them' },
    overlord:   { name: 'Overlord',      skill: 'Slow charge, massive thunder blast + aftershock arcs' },
    lophanung:  { name: 'Cryo Reactor',  skill: 'Support: slowing aura; Attack neighbours hit slowed enemies harder. Active: FREEZE' },
    haoquang:   { name: 'Holy Halo',     skill: 'Special: active 2s team barrier — leaks cost no hearts; boss skills only weakened' },
    // ụng mới (TUONG-MOI-20.md) — skills3.js / skills4.js
    nayda:        { name: 'Ricochet',       skill: 'Disc bounces to N enemies (N = stars), stronger each bounce' },
    combo:        { name: 'Combo Core',     skill: 'Every Combo Core merge permanently powers up all Combo Cores' },
    khoathoigian: { name: 'Chrono Lock',    skill: 'Freezes the lead enemy in time; stored damage bursts on release' },
    hydra:        { name: 'Hydra',          skill: 'One barrel per star, each hits a different enemy; 7★ fuses into a giant beam' },
    cuuvi:        { name: 'Nine-Tail',      skill: 'Kills grow fire tails; 9 tails unleash 9 homing foxfires' },
    pandora:      { name: 'Pandora Vault',  skill: 'On merge: opens the vault for 1 of 6 big effects' },
    luoicheo:     { name: 'Resonance Grid', skill: 'Support: buffs the 4 DIAGONAL cells (not N/E/S/W); all 4 filled = RESONANCE' },
    ngaithoigian: { name: 'Chrono Throne',  skill: 'Enemies slow over time. Active (3★+): REWIND pushes all enemies back' },
    nemesis:      { name: 'Nemesis',        skill: 'Executes low-HP enemies; % max-HP judgment on bosses' },
    docton:       { name: 'Lone Ace',       skill: 'No N/E/S/W neighbours: +100% fire rate and bonus crit' },
    thaukinh:     { name: 'Focus Lens',     skill: 'Support: neighbours deal more crit damage; crits pierce' },
    nhieusong:    { name: 'Signal Jammer',  skill: 'On merge: PVP jams rival turrets; Co-op gives ally a free summon' },
    santhuong:    { name: 'Bounty Beacon',  skill: 'Marks enemies; marked kills give bonus mana' },
    nhatthuc:     { name: 'Eclipse',        skill: 'Day: burning beam. Night: slowing wave. Swaps every 8s' },
    loren:        { name: 'Scrap Forge',    skill: 'Special: drag a 1–3★ turret onto it — your best Attack turret gains permanent damage (max +60%)' },
    guongcong:    { name: 'Mirror Gate',    skill: 'Support: neighbours resist control. PVP reflects 1 control / 20s; Co-op copies an ally merge; Solo blocks a boss skill' },
    marionette:   { name: 'Marionette',     skill: 'Takes control of an enemy, walks it backward, then boom' },
    // đợt 3 — 4 ụ Đỏ (skills5.js)
    chuato:       { name: 'Hive Queen',     skill: 'Breeds hunter drones. Active (3★+): SWARM kamikaze' },
    leviathan:    { name: 'Leviathan',      skill: 'Devours enemies for endless stacks. Active (3★+): TIDAL BREATH sweeps the path' },
    khoisinh:     { name: 'Genesis Core',   skill: 'Raises your lowest turret +1★ over time. Active (3★+): GENESIS summons turrets' },
    ronglua:      { name: 'Wyrm Engine',    skill: 'Flame cone burns crowds. Active (3★+): DRAGON DIVE down the path' },
  },
};

// ảnh chân dung thẻ của 1 ụ (đổi ảnh: thêm TEXT.turret[id].portrait)
// chân dung phi công (đã duyệt) — thêm id vào đây khi có ảnh assets/pilot_<id>.png mới
const PILOTS = new Set(['canon', 'xucxac', 'lien', 'phun', 'sungluc', 'bang', 'doc', 'mana', 'tia', 'set', 'maychem', 'phagiap', 'bua', 'nam', 'bomhen', 'nhanmana', 'kiembang', 'mimic', 'chimang', 'dichchuyen', 'radar', 'drone', 'tron', 'nangluong', 'laser', 'lanhgia', 'mortar', 'khuech', 'vungdoc', 'loa', 'hutmana', 'min', 'cuongno', 'baotuyet', 'nhanban', 'lienket', 'kepha', 'taylo', 'khien', 'hopbi', 'nangsao', 'tuthan', 'xaotron', 'epxung', 'no5', 'bao', 'anhsang', 'aten', 'dongbo', 'railgun', 'vughep', 'sinhdoi', 'hasao', 'saochep', 'ngoisao', 'soi', 'tienhoa', 'cauvong', 'wallgen', 'orbital', 'blackhole', 'overlord', 'lophanung', 'haoquang',
  'nayda', 'combo', 'khoathoigian', 'hydra', 'cuuvi', 'pandora', 'luoicheo', 'ngaithoigian',
  'nemesis', 'docton', 'thaukinh', 'nhieusong', 'santhuong', 'nhatthuc', 'loren', 'guongcong', 'marionette',
  'chuato', 'leviathan', 'khoisinh', 'ronglua']);
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
