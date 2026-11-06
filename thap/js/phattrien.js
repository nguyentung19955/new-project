// TURRET MERGE — PHÁT TRIỂN KỸ NĂNG kiểu DCDW
//   1) HỌ KỸ NĂNG theo BẬC: Trắng cơ bản → Xanh lan rộng → Tím cơ chế mới → Vàng combo → Đỏ bùng nổ WOW (Frost → Ice Blade → Blizzard → … → Cryo Reactor)
//   2) MỐC SAO 3★/5★/7★: nâng cấp kỹ năng thật (không chỉ chỉ số) — hiện trong bảng thông tin, đạt mốc có hiệu ứng 'SKILL UP'
//   3) Ụ GROW-UP / THỨC TỈNH: 10 ụ có 3 dạng đầu súng (assets/<id>_nong_s1..s3.png) đổi theo điều kiện chơi thật,
//      đổi dạng có hoạt ảnh biến hình ~560 ms (hieuung.js), dạng cuối có hào quang lặp.
'use strict';

const ms = (T, n) => !!T && T.sao >= n; // đã đạt mốc n sao chưa

// ===================================================== 1) HỌ KỸ NĂNG =====================================================
// HỌ = chức năng giống nhau; mỗi BẬC (Trắng→Xanh→Tím→Vàng→Đỏ) là 1 nấc thang "mạnh & ấn tượng hơn hẳn", không chỉ số to hơn:
//   TRẮNG = hiệu ứng cơ bản (1 mục tiêu) · XANH = LAN rộng (nhiều quái / ụ kề) · TÍM = thêm 1 CƠ CHẾ mới
//   VÀNG = combo / điều kiện mạnh · ĐỎ = kết "WOW" bùng nổ (+ kỹ năng chủ động)
// bac[i] = danh sách id ở bậc i (0 trắng … 4 đỏ); [] = còn trống → gap[i] gợi ý ụ mới trong docs/demo-hop-tuong/TUONG-MOI-20.md
const HO = {
  frost:     { ten: 'FROST',      mau: '#7fdcff', bac: [['bang'], ['kiembang', 'lanhgia'], ['baotuyet'], [], ['lophanung']], gap: { 3: 'Eclipse (Night: wide slow)' } },
  poison:    { ten: 'POISON',     mau: '#9dff5a', bac: [['doc'], ['vungdoc'], [], ['aten'], []], gap: { 2: 'new idea needed', 4: 'new idea needed' } },
  blast:     { ten: 'EXPLOSIVE',  mau: '#ff8a3a', bac: [['canon', 'xucxac'], ['mortar'], ['no5'], ['orbital'], []], gap: { 4: 'Wyrm Engine' } },
  energy:    { ten: 'ENERGY',     mau: '#9ffcff', bac: [['set'], ['laser'], ['bao'], ['railgun'], ['overlord']] },
  heavy:     { ten: 'HEAVY SHOT', mau: '#6fc8ff', bac: [['sungluc', 'tia'], ['nangluong'], [], [], []], gap: { 2: 'Lone Ace', 3: 'Nemesis', 4: 'Leviathan' } },
  rapid:     { ten: 'RAPID FIRE', mau: '#ffb43a', bac: [['lien', 'phun'], ['radar'], ['epxung'], [], []], gap: { 3: 'Hydra', 4: 'new idea needed' } },
  crit:      { ten: 'CRIT',       mau: '#ff5a64', bac: [['bua', 'nam'], ['chimang'], ['cuongno'], ['soi'], []], gap: { 4: 'new idea needed' } },
  amp:       { ten: 'DAMAGE AMP', mau: '#ffe46b', bac: [['phagiap'], ['khuech'], ['lienket'], ['dongbo', 'cauvong'], []], gap: { 4: 'new idea needed' } },
  trap:      { ten: 'PATH TRAPS', mau: '#ffb35a', bac: [['bomhen'], ['min'], [], ['wallgen'], ['blackhole']], gap: { 2: 'Chrono Lock' } },
  execute:   { ten: 'EXECUTE',    mau: '#ff4b3e', bac: [['maychem'], [], ['tuthan'], [], []], gap: { 1: 'new idea needed', 3: 'Nemesis', 4: 'new idea needed' } },
  mana:      { ten: 'MANA',       mau: '#d9a8ff', bac: [['mana'], ['hutmana', 'nhanmana'], [], [], []], gap: { 2: 'Bounty Beacon', 3: 'new idea needed', 4: 'new idea needed' } },
  summon:    { ten: 'MERGE BONUS', mau: '#fff6c0', bac: [[], ['drone', 'loa'], ['nhanban', 'anhsang'], ['sinhdoi'], []], gap: { 0: 'new idea needed', 4: 'Hive Queen' } },
  star:      { ten: 'STAR',       mau: '#ffd23f', bac: [[], [], ['nangsao'], ['vughep', 'hasao', 'ngoisao'], []], gap: { 0: 'new idea needed', 1: 'new idea needed', 4: 'Genesis Core' } },
  joker:     { ten: 'JOKER',      mau: '#ff6ad5', bac: [[], ['mimic', 'tron', 'dichchuyen'], ['xaotron'], ['saochep'], []], gap: { 0: 'new idea needed', 4: 'new idea needed' } },
  guard:     { ten: 'GUARD',      mau: '#9fe6ff', bac: [[], [], ['khien', 'taylo', 'kepha'], [], ['haoquang']], gap: { 0: 'new idea needed', 1: 'new idea needed', 3: 'Mirror Gate' } },
  transform: { ten: 'TRANSFORM',  mau: '#c77dff', bac: [[], [], ['hopbi'], ['tienhoa'], []], gap: { 0: 'new idea needed', 1: 'new idea needed', 4: 'new idea needed' } },
};
// cơ chế MỚI mà mỗi ụ thêm vào họ của nó (bậc sau không chỉ là bản to hơn của bậc trước)
const HO_MOI = {
  bang: 'freezes the lead enemy (no damage)', kiembang: 'spreads slow + shatters slowed ×5', lanhgia: 'spreads slow through neighbours’ shots',
  baotuyet: 'slows ALL + brief freeze', lophanung: 'slow aura that makes neighbours hit slowed enemies harder',
  doc: 'marks enemies: +12% damage taken', vungdoc: 'poison POOLS hit every enemy on them', aten: 'cashes in poison ×4; kills explode',
  canon: 'splash shells', xucxac: 'gambles damage 3–300%', mortar: 'CLUSTER shells split into bomblets', no5: 'every 5th shot: 3 exploding bolts',
  orbital: 'merging awakens EVERY Orbital on the board: area salvos (no normal shots)',
  set: 'chain lightning', laser: 'beam that ramps up ×4', bao: 'instant hits that ARC to a 2nd enemy', railgun: 'piercing rail + BINGO lines',
  overlord: 'thunder blast + aftershock arcs (active-tier finisher)',
  sungluc: 'one heavy instant shot', tia: 'hunts the toughest enemy', nangluong: 'banked mana → up to +500% shot',
  lien: 'very fast stream', phun: 'very fast at random enemies', radar: 'lends fire rate to neighbours', epxung: 'permanent +90% fire rate (stacks)',
  bua: 'neighbours’ crits hit harder and stagger', nam: 'melee ring blasts', chimang: 'gives crit to neighbours', cuongno: 'crits → RAGE → FRENZY', soi: 'chance to come out AWAKENED: every hit crits',
  phagiap: 'exposes the toughest enemy for its neighbours', khuech: 'boosts neighbours’ damage', lienket: 'stronger per LINKED twin', dongbo: 'buffs EVERY same-star Attack turret on the board',
  cauvong: 'co-op: trail enemies take more · PVP: rival trail enemies take less',
  bomhen: 'timed bomb that weakens a group', min: 'mines across the path', wallgen: 'walls block the path and explode; merge raises a GOLDEN wall', blackhole: 'pulls enemies together and crushes them',
  maychem: 'chance to execute small enemies', tuthan: 'neighbours execute low-HP enemies',
  mana: 'makes mana over time', hutmana: 'leech bolts: damage + capped mana', nhanmana: 'mana burst on merge',
  drone: 'merge launches bomb drones', loa: 'merge cuts Archfiend cooldown', nhanban: 'merge summons a free 1★ (2★ from 3★ merges)', anhsang: 'summons 1★ turrets over time',
  sinhdoi: 'merge summons a SAME-STAR turret (10%: +1★)',
  nangsao: 'speeds up its lowest-star neighbours', vughep: 'drag: +1★ and keeps the type', hasao: 'merge surge for neighbours; punishes rival 5★', ngoisao: 'grows with total board stars',
  mimic: 'merges with any same-star turret', tron: 'fire rate for mixed Attack neighbours', dichchuyen: 'swaps two turrets', xaotron: 'merge scrambles turrets', saochep: 'becomes a copy of any turret',
  khien: 'recharging shields for neighbours', taylo: 'pulses cleanse onto neighbours', kepha: 'merge clamps rivals / speeds allies', haoquang: 'short team-wide barrier (active)',
  hopbi: 'opens into a random 1–6★ turret', tienhoa: 'evolves into a random turret +1★',
};
const HO_CUA = {}; // id → { ho, i (bậc 0..4 trong họ) }
for (const k in HO) HO[k].bac.forEach((ds, i) => ds.forEach(id => { HO_CUA[id] = { ho: k, i }; }));
const HO_THU_TU = Object.keys(HO);
// dòng họ cho bảng thông tin: "Family: FROST ★ Tier 1/5 → next: Ice Blade (spreads slow…)"
function hoTT(id) {
  const h = HO_CUA[id]; if (!h) return null;
  const F = HO[h.ho], ten = (x) => (TEXT.turret[x] ? TEXT.turret[x].name : x);
  let sau = null, sauMoi = '', tu = null;
  for (let i = h.i + 1; i < 5; i++) if (F.bac[i].length) { sau = F.bac[i].map(ten).join(' / '); sauMoi = F.bac[i].map(x => HO_MOI[x]).filter(Boolean)[0] || ''; break; }
  for (let i = h.i - 1; i >= 0; i--) if (F.bac[i].length) { tu = F.bac[i].map(ten).join(' / '); break; }
  const nac = F.bac.map((ds, i) => ({ bac: TIER_LIST[i], ten: ds.map(ten), gap: !ds.length, goiY: (F.gap || {})[i] || '' }));
  return { ten: F.ten, mau: F.mau, bac: h.i + 1, tu, sau, sauMoi, moi: HO_MOI[id] || '', nac };
}

// ===================================================== 2) MỐC SAO 3★/5★/7★ =====================================================
// Ụ có mốc RIÊNG (cơ chế cài trong skills*.js bằng ms(T,n)); ụ khác dùng mốc CHUNG theo loại (cài ở đây + game.js)
const MOC_RIENG = {
  bang:      { 3: ['LONG FREEZE', 'Freeze lasts 2.5s'], 5: ['QUICK FROST', 'Freezes every 4.5s'], 7: ['DOUBLE FREEZE', 'Freezes 2 lead enemies'] },
  kiembang:  { 3: ['SHATTER ×6', 'Slowed enemies take ×6'], 5: ['SPLINTERS', 'Shatter splashes 40% around'], 7: ['GLACIER', 'Slowed enemies take ×8'] },
  baotuyet:  { 3: ['SQUALL', 'Pulses 1.5s sooner'], 5: ['ICE SHARDS', 'Pulse damage ×3'], 7: ['WHITEOUT', 'Pulse freezes small enemies 1s'] },
  lophanung: { 3: ['COLD FRONT', 'Aura +20 px'], 5: ['DEEP COLD', 'Bosses in the aura cast 25% slower; FREEZE lasts 4s'], 7: ['ABSOLUTE ZERO', 'Enemies in the aura take +10% damage from all'] },
  doc:       { 3: ['TWIN MARK', 'Marks 2 enemies at once'], 5: ['CONTAGION', 'The mark jumps on when its target dies'], 7: ['NEUROTOXIN', 'Marked enemies are slowed 15%'] },
  // đợt vai trò — ụ ĐẶC BIỆT mới + mốc 5★/7★ riêng của ụ HỖ TRỢ (3★ = mốc chung ×1.45)
  bomhen:    { 3: ['LONG FUSE', 'Weakness lasts 6s'], 5: ['SHOCKWAVE', 'Blast staggers 0.5s'], 7: ['TWIN BOMBS', 'Throws 2 bombs'] },
  haoquang:  { 3: ['STEADY HALO', 'Barrier 2.5s'], 5: ['PURGE', 'Also cleanses every turret'], 7: ['BLESSING', 'Barrier 3.5s + 30% speed'] },
  radar:     { 5: ['LOCK-ON', 'Aura ×1.9 + neighbours +4% crit'], 7: ['OVERDRIVE', 'Aura ×2.35 + every 8s: +25% fire rate 2s'] },
  chimang:   { 3: ['SHARP EYE', '+11% crit chance'], 5: ['DEADLY EYE', '+15% crit chance, +10% crit damage'], 7: ['CERTAIN STRIKE', '+20% crit; every 6s a sure crit'] },
  lanhgia:   { 5: ['FROSTNIP', 'Aura ×1.9 + damage vs slowed'], 7: ['FLASH FREEZE', 'Aura ×2.35 + every 8s a hit freezes'] },
  khuech:    { 5: ['DEEP STACKS', 'Aura ×1.9, 7 stacks'], 7: ['LOCKED IN', 'Aura ×2.35, stacks last 3s'] },
  tuthan:    { 5: ['DEEP REAP', 'Aura ×1.9, threshold 40% HP'], 7: ['GRIM HARVEST', 'Aura ×2.35, big enemies under 15%'] },
  thaukinh:  { 5: ['DOUBLE PIERCE', 'Aura ×1.9, crits pierce 2'], 7: ['TRUE FOCUS', 'Aura ×2.35, pierce hits 65%'] },
  luoicheo:  { 5: ['RESONANCE LINK', 'Aura ×1.9 + diagonal fire rate'], 7: ['GRAND RESONANCE', 'Aura ×2.35; full resonance: fire rate ×1.5'] },
  phagiap:   { 5: ['DOUBLE EXPOSE', 'Aura ×1.9, exposes 3 enemies'], 7: ['SHATTERED GUARD', 'Aura ×2.35, exposed +8% from all'] },
  bua:       { 5: ['HEAVY HAND', 'Aura ×1.9 (crit damage reaches the 50% cap)'], 7: ['QUAKE', 'Aura ×2.35, stagger 0.35s, big enemies too'] },
  tron:      { 5: ['MIXED FIRE', 'Aura ×1.9; 3+ types: +damage'], 7: ['PERFECT BLEND', 'Aura ×2.35; 4 types: +6% crit'] },
  taylo:     { 5: ['DEEP CLEAN', 'Every 9s, up to 3 turrets'], 7: ['FRESH START', 'Cleansed: +20% fire rate 4s'] },
  khien:     { 3: ['QUICK CHARGE', 'Shields every 16s'], 5: ['FAST CHARGE', 'Shields every 14s'], 7: ['COUNTER SHIELD', 'Every 10s; a block gives +20% fire rate'] },
  nangsao:   { 3: ['LIFT', '+18% fire rate to the 2 lowest'], 5: ['STAR PIP', 'Each wave a star pip (3 pips = +1★)'], 7: ['STAR SURGE', '2 pips = +1★ (max 2★ per match)'] },
  hasao:     { 5: ['BREAK POINT', 'Aura ×1.9, bigger merge surge'], 7: ['STAR SHATTER', 'Aura ×2.35, merge surge +32%'] },
  guongcong: { 5: ['POLISHED', 'Aura ×1.9: resist up to 28%'], 7: ['TRUE MIRROR', 'Resist 35%, mirror every 15s'] },
  dongbo:    { 5: ['PAIRED FIRE', 'Aura ×1.9; 2+ matched: +fire rate'], 7: ['LOOSE SYNC', 'Aura ×2.35; ±1★ counts as matched'] },
  orbital:   { 3: ['QUICK HANDS', 'Salvos 20% faster'], 5: ['HEAVY SALVO', '+25% bomb damage'], 7: ['JUSTICE RAIN', '+30% bomb damage, +1 bomb'] },
  cauvong:   { 5: ['DOUBLE ARC', 'Aura ×1.9, 2 trails'], 7: ['PRISM', 'Aura ×2.35, trail slows 10%'] },
  vungdoc:   { 3: ['TWIN POOLS', 'Throws a second pool'], 5: ['CORROSION', 'Pools weaken: +15% damage taken'], 7: ['TOXIC LAKE', 'Pools 50% wider'] },
  aten:      { 3: ['BIG BANG', 'Kill explosion 70 px'], 5: ['TOXIC BLAST', 'Kill explosion poisons'], 7: ['PURGE', '×6 vs poisoned'] },
  cuongno:   { 3: ['HOT BLOOD', 'Rage lasts 8s'], 5: ['BLOODLUST', 'Frenzy lasts 7s'], 7: ['RAMPAGE', 'Frenzy: +25% crit'] },
  soi:       { 3: ['KEEN FANGS', '+10% crit chance'], 5: ['FERAL', '+25% damage'], 7: ['ALPHA HOWL', 'Neighbours +25% fire rate'] },
  mana:      { 3: ['FAST FLOW', 'Mana every 6s'], 5: ['OVERFLOW', '+25% mana'], 7: ['WELLSPRING', 'Mana every 5s'] },
  hopbi:     { 3: ['QUICK OPEN', 'Opens 10s sooner'], 5: ['LUCKY BOX', 'Result at least 3★'], 7: ['JACKPOT', 'Result at least 5★'] },
  tienhoa:   { 3: ['FAST GROWTH', 'Evolves 20% faster'], 5: ['BREAKTHROUGH', '25% chance of +2★ (never above 7★)'], 7: ['DUD', 'At 7★ the bomb fizzles: no skill, just a 7★ turret (losing a star restarts it)'] },
};
// loại để chọn mốc chung
const KHONG_DOI = new Set(['railgun', 'no5', 'bomhen']); // bắn có nhịp riêng → mốc 5★ chung = OVERCHARGE thay vì DOUBLE TAP
function loaiMoc(id) {
  const sk = SKILLS[id] || {};
  if (sk.vai === 'ht') return 'ht';
  if (!sk.dmg) return 'khac';
  return sk.ban && !KHONG_DOI.has(id) ? 'ban' : 'tu';
}
const MOC_CHUNG = {
  ban:  { 3: ['QUICK HANDS', '+20% fire rate'], 5: ['DOUBLE TAP', 'Every 4th attack fires twice'], 7: ['APEX', '+30% damage, +10% crit'] },
  tu:   { 3: ['QUICK HANDS', '+20% charge/fire speed'], 5: ['OVERCHARGE', '+25% damage'], 7: ['APEX', '+30% damage, +10% crit'] },
  ht:   { 3: ['TUNED AURA', 'Aura ×1.45 of its 1★ value'], 5: ['FIELD PERK', 'Aura ×1.9 + a small extra perk'], 7: ['SIGNATURE', 'Aura ×2.35 + its signature effect'] }, // hotro.js: đường cong chung HOTRO.K
  khac: { 3: ['QUICK HANDS', '+20% speed'], 5: ['OVERCHARGE', '+25% effect'], 7: ['APEX', '+30% effect'] },
};
function mocCua(id) {
  const r = MOC_RIENG[id] || {}, c = MOC_CHUNG[loaiMoc(id)];
  return [3, 5, 7].map(n => { const m = r[n] || c[n]; return { n, ten: m[0], mo: m[1], rieng: !!r[n] }; });
}
// mốc chung có áp dụng cho ụ ở mốc n không (ụ có mốc riêng ở n thì bỏ qua)
const mocChung = (T, n) => T.sao >= n && !(MOC_RIENG[T.id] && MOC_RIENG[T.id][n]);
// gọi mỗi bước cho từng bàn, SAU khi reset buff (game.js capNhatBan)
function mocBuf(B) {
  for (const T of B.t) if (T && mocChung(T, 3) && loaiMoc(T.id) !== 'ht') T.buf.toc += 0.2;
}
// hệ số hào quang hỗ trợ theo mốc chung
const heSoHT = () => 1; // đợt vai trò: mốc sao của ụ hỗ trợ đã nằm trong đường cong HOTRO.K (hotro.js) — không nhân thêm
// ô được hào quang chạm tới (5★: thêm 4 ô chéo)
function oHoTro(B, T) {
  if (loaiMoc(T.id) === 'ht' && typeof HOTRO !== 'undefined') return HOTRO.oDich(T).map(o => B.t[o]); // hỗ trợ: đúng hình ô của nó (không còn ô chéo 5★)
  return keCan(B, T.o);
}
// hệ số sát thương / chí mạng của mốc chung (game.js dmgU / critU)
function heSoMocDmg(T) {
  let k = 1;
  const l = loaiMoc(T.id);
  if ((l === 'tu' || l === 'khac') && mocChung(T, 5)) k *= 1.25;
  if (l !== 'ht' && mocChung(T, 7)) k *= 1.3;
  return k;
}
const themMocCrit = (T) => (loaiMoc(T.id) !== 'ht' && mocChung(T, 7) ? 0.1 : 0);
// DOUBLE TAP: sau phát bắn thứ 4, 8, 12… nạp lại gần như tức thì
function mocBanXong(T) { if (loaiMoc(T.id) === 'ban' && mocChung(T, 5) && T.banLan % 4 === 0) T.cd = Math.min(T.cd, 0.12); }
// sao vừa tăng qua mốc → hiệu ứng SKILL UP (tre: chờ hiệu ứng ghép lộ kết quả)
function mocMoi(T, saoCu, tre) {
  if (!T || typeof VX === 'undefined') return;
  for (const n of [3, 5, 7]) if (saoCu < n && T.sao >= n) { const m = mocCua(T.id).find(q => q.n === n); VX.saoLen(T, n, m ? m.ten : '', tre || 0); }
}

// ===================================================== 3) Ụ GROW-UP / THỨC TỈNH =====================================================
// gd(T) → { s: dạng 1..3, p: tiến độ 0..1 (vòng nhỏ quanh bệ), v: [mốc đổi dạng trên vòng] }
// lap: ụ đổi dạng theo chu kỳ (nạp → bắn → về dạng 1) → không hiện chữ EVOLVE ở dạng 2 cho đỡ rối
const demCungLoai = (B, id) => B.t.reduce((n, X) => n + (X && X.id === id ? 1 : 0), 0);
const GROW = {
  overlord: { mau: '#ff5040', lap: true, ten: ['DORMANT', 'CHARGING', 'OVERCHARGED'], dk: 'Charge 0–35% / 35–80% / 80–100%',
    gd: (T) => ({ s: T.nap >= 0.8 ? 3 : T.nap >= 0.35 ? 2 : 1, p: T.nap, v: [0.35, 0.8] }) },
  hopbi: { mau: '#c77dff', ten: ['SEALED', 'UNSEALING', 'ABOUT TO OPEN'], dk: 'Timer 0–70% / 70–93% / 93–100%, then opens',
    gd: (T) => ({ s: T.nap >= 0.93 ? 3 : T.nap >= 0.7 ? 2 : 1, p: T.nap, v: [0.7, 0.93] }) },
  tienhoa: { mau: '#ffd23f', ten: ['INCUBATING', 'FORGING', 'ASCENDING'], dk: 'Timer 0–60% / 60–90% / 90–100%, then evolves +1★',
    gd: (T) => ({ s: T.nap >= 0.9 ? 3 : T.nap >= 0.6 ? 2 : 1, p: T.nap, v: [0.6, 0.9] }) },
  lophanung: { mau: '#9fe6ff', lap: true, ten: ['IDLE CORE', 'HEATING', 'CRYO STORM READY'], dk: 'Active charge <50% / 50–99% / full (tap to FREEZE)',
    gd: (T) => ({ s: T.nap >= 1 || T.bungT > 0 ? 3 : T.nap >= 0.5 ? 2 : 1, p: T.nap, v: [0.5, 1] }) },
  soi: { mau: '#ff4b3e', ten: ['PUP', 'NORMAL', 'AWAKENED'], dk: 'Form is rolled on summon / merge: Normal, or Awakened by chance (30% at LV9, +1.5% per card level) — no growing',
    dang: [2, 3], dangMo: [null, 'Normal crits · melee double slash', 'Always crits · +40% speed · wide frenzy'],
    gd: (T) => ({ s: T.thuc ? 3 : 2, p: 1, v: [0, 1] }) }, // DCDW Werewolf: 2 bản cố định (dạng 2 = thường, dạng 3 = thức tỉnh), không lớn dần
  orbital: { mau: '#9fe6ff', khongAnh: true, ten: ['STANDBY', 'UPLINK', 'AWAKENED'], dk: 'Uplink: 2+ Orbitals on board · Awakened: merging Orbitals awakens EVERY Orbital on the board (23s at LV9) — each fires area salvos',
    gd: (T) => { const B = G.ban[T.ban], n = B ? demCungLoai(B, 'orbital') : 1, s = T.thucT > 0 || (B && B.phao > 0) ? 3 : n >= 2 ? 2 : 1; return { s, p: s === 3 ? (T.thucT > 0 ? T.thucT / (T.thucMax || 23) : B.phao / 20) : s === 2 ? 0.5 : 0.2, v: [0.5] }; } },
  cuongno: { mau: '#ff5040', lap: true, ten: ['CALM', 'RAGE', 'FRENZY'], dk: '1st crit → Rage (+25% fire rate) · 2nd crit → Frenzy',
    gd: (T) => { const s = T.cuongT > 0 ? 3 : (T.rage || 0) > 0 ? 2 : 1; return { s, p: s === 3 ? T.cuongT / (ms(T, 5) ? 7 : 5) : s === 2 ? 0.5 : 0, v: [0.5] }; } },
  ngoisao: { mau: '#ffe46b', ten: ['SPARK', 'NOVA', 'SUPERNOVA'], dk: 'Board stars ≥10 → Nova · ≥50 → Supernova · every 10★ faster, every 50★ more damage',
    gd: (T) => { const B = G.ban[T.ban], n = B ? SKILLS.ngoisao.tong(B) : 0; return { s: n >= 50 ? 3 : n >= 10 ? 2 : 1, p: Math.min(1, n / 50), v: [0.2, 1], n }; } },
  lienket: { mau: '#c77dff', ten: ['SINGLE', 'LINKED', 'CHAIN MASTER'], dk: '2 linked → Linked · 4+ linked → Chain Master (shots arc to 1 more enemy)',
    gd: (T) => { const n = T.chuoi || 1; return { s: n >= 4 ? 3 : n >= 2 ? 2 : 1, p: Math.min(1, (n - 1) / 3), v: [1 / 3, 1], n }; } },
  dongbo: { mau: '#ffe46b', ten: ['OFFLINE', 'SYNCED', 'FULL SYNC'], dk: '1 same-star Attack turret anywhere on the board → Synced · 3+ → Full Sync',
    gd: (T) => { const n = T.dong || 0; return { s: n >= 3 ? 3 : n >= 1 ? 2 : 1, p: Math.min(1, n / 3), v: [1 / 3, 1], n }; } },
};
const laGrow = (id) => !!(GROW[id] && ((window.STAGE_K && STAGE_K[id]) || GROW[id].khongAnh));
const giaiDoan = (T) => (laGrow(T.id) ? GROW[T.id].gd(T).s : 0);
// gọi mỗi bước cho từng ụ (game.js capNhatU): phát hiện đổi dạng → hoạt ảnh biến hình
function tienHoaCap(B, T) {
  if (!laGrow(T.id) || T.st.da) return;
  const s = GROW[T.id].gd(T).s;
  if (T.gd == null) { T.gd = s; return; } // vừa xuất hiện: vào thẳng dạng hiện tại
  if (s === T.gd) return;
  const tu = T.gd; T.gd = s;
  if (typeof VX !== 'undefined') VX.bien(T, tu, s);
}
// sau khi ụ chết: lây độc (Venom 5★) — gọi từ game.js chet()
function lanDoc(E, B) {
  if (!(E.docLay > 0) || !(E.docT > 0)) return;
  const ds = dsMucTieu(B || G.ban[0]).filter(Q => Q !== E && !Q.chet).sort((a, b) => Math.hypot(a.x - E.x, a.y - E.y) - Math.hypot(b.x - E.x, b.y - E.y)).slice(0, 2);
  for (const Q of ds) if (Math.hypot(Q.x - E.x, Q.y - E.y) < 80) {
    Q.doc = Math.max(Q.doc, E.doc); Q.docT = Math.max(Q.docT, 3); Q.docB = E.docB; Q.docLay = 1;
    if (typeof G !== 'undefined') G.hu.push({ k: 'tiaPhep', t: 0, song: 0.35, x0: E.x, y0: E.y, x1: Q.x, y1: Q.y, mau: '#9dff5a' });
  }
}

// ===================================================== hiển thị tốc bắn =====================================================
// ụ tự quản lý nhịp (không có "phát/giây" cố định): mô tả nhịp riêng
const nhip3 = (T) => (T && T.id && mocChung(T, 3) ? 1.2 : 1); // mốc chung 3★ QUICK HANDS (+20% nạp) — số giây hiển thị = số thật
const NHIP = {
  laser: () => 'continuous beam', overlord: (T) => 'charges ' + ((7 - 0.5 * (T.sao - 1)) / nhip3(T)).toFixed(1) + 's',
  wallgen: (T) => 'wall every ' + (Math.max(5, 9 - 0.4 * T.sao) / nhip3(T)).toFixed(1) + 's', blackhole: (T) => 'hole every ' + (Math.max(6, 10 - 0.5 * T.sao) / nhip3(T)).toFixed(1) + 's',
  vungdoc: (T) => 'pool every ' + SKILLS.vungdoc.ky(T).toFixed(1) + 's', min: (T) => 'mine every ' + SKILLS.min.ky(T).toFixed(1) + 's',
  baotuyet: (T) => 'pulse every ' + SKILLS.baotuyet.ky(T).toFixed(1) + 's', lophanung: () => 'aura 2.5 ticks/s',
};
function tocTT(id, T) {
  const sk = SKILLS[id]; if (!sk || !sk.dmg) return '';
  if (NHIP[id]) return NHIP[id](T || { sao: 1, id });
  const r = T ? tocU(T) : (sk.toc || 1);
  return r.toFixed(r >= 2 ? 1 : 2) + ' shots/s';
}

// ụ hỗ trợ / không nòng: KHÔNG xoay theo quái — chỉ quay chậm đều (góc vẽ); Radar giữ chảo quay riêng, Mana Core đứng yên
for (const id of ['chimang', 'lanhgia', 'khuech', 'tuthan', 'loa', 'haoquang']) if (SKILLS[id]) SKILLS[id].gocDau = (T, t) => (T.pha || 0) + t * (id === 'lanhgia' ? 0.9 : 0.3);
