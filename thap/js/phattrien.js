// TURRET MERGE — PHÁT TRIỂN KỸ NĂNG kiểu DCDW
//   1) HỌ KỸ NĂNG: cùng loại kỹ năng ở bậc cao hơn phải THÊM cơ chế mới (Frost → Chiller/Ice Blade → Blizzard → Cryo Reactor…)
//   2) MỐC SAO 3★/5★/7★: nâng cấp kỹ năng thật (không chỉ chỉ số) — hiện trong bảng thông tin, đạt mốc có hiệu ứng 'SKILL UP'
//   3) Ụ GROW-UP / THỨC TỈNH: 10 ụ có 3 dạng đầu súng (assets/<id>_nong_s1..s3.png) đổi theo điều kiện chơi thật,
//      đổi dạng có hoạt ảnh biến hình ~560 ms (hieuung.js), dạng cuối có hào quang lặp.
'use strict';

const ms = (T, n) => !!T && T.sao >= n; // đã đạt mốc n sao chưa

// ===================================================== 1) HỌ KỸ NĂNG =====================================================
// buoc: các bậc tiến hoá (mỗi bậc 1 mảng id cùng tầng) — bậc sau "phát triển từ" bậc trước
const HO = {
  frost:   { ten: 'FROST',      mau: '#7fdcff', buoc: [['bang'], ['lanhgia', 'kiembang'], ['baotuyet'], ['lophanung']] },
  poison:  { ten: 'POISON',     mau: '#9dff5a', buoc: [['doc'], ['vungdoc'], ['aten']] },
  crit:    { ten: 'CRIT',       mau: '#ff5a64', buoc: [['bua', 'nam'], ['chimang'], ['cuongno'], ['soi']] },
  rapid:   { ten: 'RAPID FIRE', mau: '#ffb43a', buoc: [['lien', 'phun'], ['radar'], ['bao']] },
  blast:   { ten: 'EXPLOSIVE',  mau: '#ff8a3a', buoc: [['canon', 'xucxac'], ['mortar', 'drone'], ['no5'], ['overlord']] },
  heavy:   { ten: 'HEAVY SHOT', mau: '#6fc8ff', buoc: [['sungluc', 'tia'], ['railgun']] },
  trap:    { ten: 'TRAPS',      mau: '#ffb35a', buoc: [['bomhen'], ['min'], ['wallgen']] },
  energy:  { ten: 'ENERGY',     mau: '#ff8af0', buoc: [['set'], ['laser'], ['orbital']] },
  control: { ten: 'CONTROL',    mau: '#c77dff', buoc: [['phagiap'], ['cauvong'], ['blackhole']] },
  execute: { ten: 'EXECUTE',    mau: '#ff4b3e', buoc: [['maychem'], ['tuthan']] },
  mana:    { ten: 'MANA',       mau: '#d9a8ff', buoc: [['mana'], ['hutmana', 'nhanmana', 'loa', 'nangluong']] },
  synergy: { ten: 'SYNERGY',    mau: '#ffe46b', buoc: [['khuech'], ['lienket'], ['dongbo']] },
  summon:  { ten: 'SUMMON',     mau: '#fff6c0', buoc: [['nhanban', 'anhsang'], ['sinhdoi']] },
  star:    { ten: 'STAR',       mau: '#ffd23f', buoc: [['nangsao'], ['vughep', 'hasao', 'ngoisao']] },
  joker:   { ten: 'JOKER',      mau: '#ff6ad5', buoc: [['mimic', 'tron', 'dichchuyen'], ['epxung', 'xaotron'], ['saochep']] },
  guard:   { ten: 'GUARD',      mau: '#9fe6ff', buoc: [['khien', 'taylo', 'kepha'], ['haoquang']] },
  box:     { ten: 'TRANSFORM',  mau: '#c77dff', buoc: [['hopbi'], ['tienhoa']] },
};
// cơ chế MỚI mà mỗi ụ thêm vào họ của nó (bậc sau không chỉ là bản to hơn của bậc trước)
const HO_MOI = {
  bang: 'Slows one enemy', lanhgia: 'Spreads slow through neighbours’ shots', kiembang: 'Shatters slowed enemies for ×5',
  baotuyet: 'Pulses a slow over the WHOLE path', lophanung: 'Freezing aura: slower = harder hits + active FREEZE',
  doc: 'Poison over time + lingering cloud', vungdoc: 'Leaves poison POOLS on the path', aten: 'Cashes in poison: +300%, kills explode',
  bua: 'Crits knock enemies back', nam: 'Melee ring blasts', chimang: 'Gives crit chance to neighbours',
  cuongno: 'Crits build RAGE, then FRENZY', soi: 'Grows into an AWAKENED wolf: every hit crits',
  lien: 'Very fast stream, stars add speed', phun: 'Very fast at random enemies', radar: 'Lends fire rate to neighbours',
  bao: 'Instant hits with no travel time',
  canon: 'Splash shells', xucxac: 'Gambles damage 3–300%', mortar: 'Lobs CLUSTER shells at random enemies',
  drone: 'Merge launches bomb drones', no5: 'Every 5th shot: 3 exploding bolts', overlord: 'Charges up into a thunder blast',
  sungluc: 'One heavy instant shot', tia: 'Hunts the toughest enemy', railgun: 'Piercing rail + BINGO lines',
  bomhen: 'Sticks a timed bomb', min: 'Mines wait on the path', wallgen: 'Walls block the path, then explode',
  set: 'Chain lightning', laser: 'Beam that ramps up while it holds', orbital: 'Merge calls a sky bombardment',
  phagiap: 'Weakens the enemy it hits', cauvong: 'Weakens EVERY enemy on a painted stretch', blackhole: 'Pulls enemies together and crushes them',
  maychem: 'Chance to execute small enemies', tuthan: 'Neighbours gain the execute chance',
  mana: 'Makes mana over time', hutmana: 'Mana on every hit', nhanmana: 'Mana burst on merge', loa: 'Merge cuts Archfiend cooldown',
  nangluong: 'Turns banked mana into damage',
  khuech: 'Boosts neighbours’ damage', lienket: 'Stronger per linked turret of its type', dongbo: 'Stronger per turret of its star level',
  nhanban: 'Merge summons a free 1★', anhsang: 'Summons 1★ turrets over time', sinhdoi: 'Merge summons a free SAME-STAR turret',
  nangsao: 'Merge gives +1★ to another turret', vughep: 'Drag: +1★ and keeps the type', hasao: 'Merge: rival −1★ / ally +1★',
  ngoisao: 'Grows with the total stars on the board',
  mimic: 'Merges with any same-star turret', tron: 'Merges with ANY turret', dichchuyen: 'Swaps two turrets',
  epxung: 'Gives +65% fire rate for good', xaotron: 'Merge scrambles turrets', saochep: 'Becomes a copy of any turret',
  khien: 'Merge shields turrets', taylo: 'Merge cleanses turrets', kepha: 'Merge clamps rivals / speeds allies',
  haoquang: 'Board-wide invincible shield (active)',
  hopbi: 'Opens into a random 1–7★ turret', tienhoa: 'Evolves into a random turret +1★',
};
const HO_CUA = {}; // id → { ho, i (bậc trong họ) }
for (const k in HO) HO[k].buoc.forEach((ds, i) => ds.forEach(id => { HO_CUA[id] = { ho: k, i }; }));
// dòng họ cho bảng thông tin
function hoTT(id) {
  const h = HO_CUA[id]; if (!h) return null;
  const F = HO[h.ho], ten = (x) => (TEXT.turret[x] ? TEXT.turret[x].name : x);
  const tu = h.i > 0 ? F.buoc[h.i - 1].map(ten).join(' / ') : null;
  const sau = h.i < F.buoc.length - 1 ? F.buoc[h.i + 1].map(ten).join(' / ') : null;
  return { ten: F.ten, mau: F.mau, tu, sau, moi: HO_MOI[id] || '', chuoi: F.buoc.map(ds => ds.map(ten).join('/')).join(' → ') };
}

// ===================================================== 2) MỐC SAO 3★/5★/7★ =====================================================
// Ụ có mốc RIÊNG (cơ chế cài trong skills*.js bằng ms(T,n)); ụ khác dùng mốc CHUNG theo loại (cài ở đây + game.js)
const MOC_RIENG = {
  bang:      { 3: ['LONG CHILL', 'Slow lasts 6s'], 5: ['FROSTBITE', 'Slowed enemies take +15% damage from everything'], 7: ['DEEP FREEZE', 'Every 4th shot freezes the target 0.8s'] },
  kiembang:  { 3: ['SHATTER ×6', 'Slowed enemies take ×6'], 5: ['SPLINTERS', 'Shatter splashes 40% around'], 7: ['GLACIER', 'Slowed enemies take ×8'] },
  baotuyet:  { 3: ['SQUALL', 'Pulses 1.5s sooner'], 5: ['ICE SHARDS', 'Pulse damage ×3'], 7: ['WHITEOUT', 'Pulse freezes small enemies 1s'] },
  lophanung: { 3: ['COLD FRONT', 'Aura +20 px'], 5: ['PERMAFROST', 'Active FREEZE lasts 4s'], 7: ['ABSOLUTE ZERO', 'Enemies in the aura take +25% damage from all'] },
  doc:       { 3: ['THICK CLOUD', 'Poison cloud lasts 50% longer'], 5: ['CONTAGION', 'Poisoned enemies spread poison when they die'], 7: ['NEUROTOXIN', 'Its poison also slows 15%'] },
  vungdoc:   { 3: ['TWIN POOLS', 'Throws a second pool'], 5: ['CORROSION', 'Pools weaken: +15% damage taken'], 7: ['TOXIC LAKE', 'Pools 50% wider'] },
  aten:      { 3: ['BIG BANG', 'Kill explosion 70 px'], 5: ['TOXIC BLAST', 'Kill explosion poisons'], 7: ['PURGE', '×6 vs poisoned'] },
  cuongno:   { 3: ['HOT BLOOD', 'Rage lasts 8s'], 5: ['BLOODLUST', 'Frenzy lasts 7s'], 7: ['RAMPAGE', 'Frenzy: +25% crit'] },
  soi:       { 3: ['HUNTER', 'Grow-up stage 2: +40% fire rate'], 5: ['AWAKEN', 'Stage 3: every hit crits, ×2 speed'], 7: ['ALPHA HOWL', 'Neighbours +25% fire rate'] },
  mana:      { 3: ['FAST FLOW', 'Mana every 6s'], 5: ['OVERFLOW', '+25% mana'], 7: ['WELLSPRING', 'Mana every 5s'] },
  hopbi:     { 3: ['QUICK OPEN', 'Opens 10s sooner'], 5: ['LUCKY BOX', 'Result at least 3★'], 7: ['JACKPOT', 'Result at least 5★'] },
  tienhoa:   { 3: ['FAST GROWTH', 'Evolves 20% faster'], 5: ['BREAKTHROUGH', '25% chance of +2★'], 7: ['ASCEND', 'Picks your highest-tier card'] },
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
  ht:   { 3: ['WIDE AURA', 'Aura +25% stronger'], 5: ['DIAGONAL AURA', 'Also buffs the 4 diagonal cells'], 7: ['APEX AURA', 'Aura +60% stronger'] },
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
const heSoHT = (T) => (mocChung(T, 7) ? 1.6 : mocChung(T, 3) ? 1.25 : 1);
// ô được hào quang chạm tới (5★: thêm 4 ô chéo)
function oHoTro(B, T) {
  const ds = keCan(B, T.o);
  if (loaiMoc(T.id) === 'ht' && mocChung(T, 5)) {
    const c = T.o % 5, h = (T.o / 5) | 0;
    for (const [dc, dh] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const cc = c + dc, hh = h + dh; if (cc >= 0 && cc < 5 && hh >= 0 && hh < 3) ds.push(B.t[hh * 5 + cc]); }
  }
  return ds;
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
  soi: { mau: '#ff4b3e', ten: ['PUP', 'HUNTER', 'AWAKENED'], dk: 'Hunter: 3★ or 20 kills · Awakened: 5★ or 50 kills (30% are born awakened)',
    gd: (T) => {
      const k = T.giet || 0, s = T.thuc || T.sao >= 5 || k >= 50 ? 3 : T.sao >= 3 || k >= 20 ? 2 : 1;
      return { s, p: s === 3 ? 1 : Math.max(k / 50, (T.sao - 1) / 4), v: [0.4, 1] };
    } },
  orbital: { mau: '#9fe6ff', ten: ['STANDBY', 'UPLINK', 'BOMBARDMENT'], dk: 'Uplink: 2+ Orbitals on board (+20% fire rate) · Bombardment: while its merge strike lasts (×2 fire rate)',
    gd: (T) => { const B = G.ban[T.ban], n = B ? demCungLoai(B, 'orbital') : 1, s = B && B.phao > 0 ? 3 : n >= 2 ? 2 : 1; return { s, p: s === 3 ? B.phao / 20 : s === 2 ? 0.5 : 0.2, v: [0.5] }; } },
  cuongno: { mau: '#ff5040', lap: true, ten: ['CALM', 'RAGE', 'FRENZY'], dk: '1st crit → Rage (+25% fire rate) · 2nd crit → Frenzy',
    gd: (T) => { const s = T.cuongT > 0 ? 3 : (T.rage || 0) > 0 ? 2 : 1; return { s, p: s === 3 ? T.cuongT / (ms(T, 5) ? 7 : 5) : s === 2 ? 0.5 : 0, v: [0.5] }; } },
  ngoisao: { mau: '#ffe46b', ten: ['SPARK', 'NOVA', 'SUPERNOVA'], dk: 'Board stars ≥10 → Nova (+25% fire rate) · ≥50 → Supernova (+350% damage)',
    gd: (T) => { const B = G.ban[T.ban], n = B ? SKILLS.ngoisao.tong(B) : 0; return { s: n >= 50 ? 3 : n >= 10 ? 2 : 1, p: Math.min(1, n / 50), v: [0.2, 1], n }; } },
  lienket: { mau: '#c77dff', ten: ['SINGLE', 'LINKED', 'CHAIN MASTER'], dk: '2 linked → Linked · 4+ linked → Chain Master (shots arc to 1 more enemy)',
    gd: (T) => { const n = T.chuoi || 1; return { s: n >= 4 ? 3 : n >= 2 ? 2 : 1, p: Math.min(1, (n - 1) / 3), v: [1 / 3, 1], n }; } },
  dongbo: { mau: '#ffe46b', ten: ['OFFLINE', 'SYNCED', 'FULL SYNC'], dk: '3+ other turrets at its ★ → Synced · 6+ → Full Sync (+15% crit)',
    gd: (T) => { const n = T.dong || 0; return { s: n >= 6 ? 3 : n >= 3 ? 2 : 1, p: Math.min(1, n / 6), v: [0.5, 1], n }; } },
};
const laGrow = (id) => !!(GROW[id] && window.STAGE_K && STAGE_K[id]);
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
const NHIP = {
  laser: () => 'continuous beam', overlord: (T) => 'charges ' + (7 - 0.5 * (T.sao - 1)).toFixed(1) + 's',
  wallgen: (T) => 'wall every ' + Math.max(5, 9 - 0.4 * T.sao).toFixed(1) + 's', blackhole: (T) => 'hole every ' + Math.max(6, 10 - 0.5 * T.sao).toFixed(1) + 's',
  vungdoc: (T) => 'pool every ' + SKILLS.vungdoc.ky(T).toFixed(1) + 's', min: (T) => 'mine every ' + SKILLS.min.ky(T).toFixed(1) + 's',
  baotuyet: (T) => 'pulse every ' + SKILLS.baotuyet.ky(T).toFixed(1) + 's', lophanung: () => 'aura 2.5 ticks/s',
};
function tocTT(id, T) {
  const sk = SKILLS[id]; if (!sk || !sk.dmg) return '';
  if (NHIP[id]) return NHIP[id](T || { sao: 1, id });
  const r = T ? tocU(T) : (sk.toc || 1);
  return r.toFixed(r >= 2 ? 1 : 2) + ' shots/s';
}
