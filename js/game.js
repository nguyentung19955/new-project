'use strict';

// ============================================================
//  LOGIC GAME: đợt quái theo dòng sông, tướng tấn công, nâng cấp
//  bằng vàng, kỹ năng, hào quang, Nước Dâng & Mọc Núi, boss,
//  Lò đúc đồng, túi đồ (cường hóa, thăng phẩm, đổi vàng)
// ============================================================

let nextId = 1;
// id mới cho tướng / quái / đồ. Co-op: giao diện tạo đồ để xem trước (ngoài mô phỏng) dùng id âm tạm, không làm lệch id chung
function newId() { return SIM.coop && !SIM.active ? -(++SIM.tmpId) : nextId++; }

// --- Đường quái đi: lấy mẫu đường cong SVG của bản đồ đang chơi (MAPS, data.js)
let RIVER_D = MAPS.song1.d;
function sampleSvgPath(d, steps = 26) {
  const tok = d.match(/[MCS]|-?\d*\.?\d+/g);
  const pts = [];
  let i = 0, cx = 0, cy = 0, lastC = null, cmd = '';
  const num = () => parseFloat(tok[i++]);
  const cubic = (x1, y1, x2, y2, x, y) => {
    for (let k = 1; k <= steps; k++) {
      const t = k / steps, u = 1 - t;
      pts.push([u * u * u * cx + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x,
                u * u * u * cy + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y]);
    }
    lastC = [x2, y2]; cx = x; cy = y;
  };
  while (i < tok.length) {
    if (/[MCS]/.test(tok[i])) cmd = tok[i++];
    if (cmd === 'M') { cx = num(); cy = num(); pts.push([cx, cy]); lastC = null; }
    else if (cmd === 'C') cubic(num(), num(), num(), num(), num(), num());
    else if (cmd === 'S') {
      const [rx, ry] = lastC ? [2 * cx - lastC[0], 2 * cy - lastC[1]] : [cx, cy];
      cubic(rx, ry, num(), num(), num(), num());
    }
  }
  return pts;
}

function distToPolyline(pts, x, y) {
  let best = Infinity;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const dx = bx - ax, dy = by - ay;
    const k = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(ax + dx * k - x, ay + dy * k - y));
  }
  return best;
}
const distToPath = (x, y) => distToPolyline(CONFIG.path, x, y);

// --- Đường đi: độ dài từng đoạn để quái di chuyển theo quãng đường (dựng lại khi đổi bản đồ)
const PATH = {
  total: 0, segs: [],
  build() {
    this.segs = []; this.total = 0;
    for (let i = 1; i < CONFIG.path.length; i++) {
      const [ax, ay] = CONFIG.path[i - 1], [bx, by] = CONFIG.path[i];
      const len = Math.hypot(bx - ax, by - ay);
      this.segs.push({ ax, ay, bx, by, len, start: this.total });
      this.total += len;
    }
  },
  at(d) {
    const segs = this.segs;
    const s = segs.find((g) => d <= g.start + g.len) || segs[segs.length - 1];
    const k = Math.max(0, Math.min(1, (d - s.start) / s.len));
    return { x: s.ax + (s.bx - s.ax) * k, y: s.ay + (s.by - s.ay) * k, dx: s.bx - s.ax };
  },
  // quãng đường gần nhất với một điểm (để đặt vệt lửa, thành chặn...)
  distOf(x, y) {
    let best = 0, bd = Infinity;
    for (const s of this.segs) {
      const dx = s.bx - s.ax, dy = s.by - s.ay;
      const k = Math.max(0, Math.min(1, ((x - s.ax) * dx + (y - s.ay) * dy) / (dx * dx + dy * dy || 1)));
      const d = Math.hypot(s.ax + dx * k - x, s.ay + dy * k - y);
      if (d < bd) { bd = d; best = s.start + s.len * k; }
    }
    return best;
  },
};

// --- Ô đặt tướng dọc hai bên đường (sinh lại theo bản đồ), tránh vùng giao diện và thành cuối đường
function buildSpots(map) {
  const { sx, sy, minD, maxD } = CONFIG.buildGrid;
  const [ex, ey] = map.end;
  const zones = CONFIG.hudZones.filter((z) => !z.castle).concat([[ex - 54, ey - 64, ex + 54, ey + 50]]);
  const out = [];
  let row = 0;
  for (let y = 60; y <= 336; y += sy, row++) {
    for (let x = 20 + (row % 2 ? sx / 2 : 0); x <= 912; x += sx) {
      const d = distToPath(x * DK, y * DK) / DK;
      if (d < minD || d > maxD) continue;
      if (zones.some(([x1, y1, x2, y2]) => x >= x1 && x <= x2 && y >= y1 && y <= y2)) continue;
      out.push({ x: Math.round(x * DK), y: Math.round(y * DK), d });
    }
  }
  // thưa bớt ô (giữ ô cách nhau ≥ spacing)
  if (CONFIG.buildGrid.spacing) {
    const sp = CONFIG.buildGrid.spacing * DK;
    const pick = [];
    const cand = out.slice().sort((a, b) => (a.x - b.x) || (a.y - b.y));
    for (const c of cand) if (pick.every((q) => Math.hypot(q.x - c.x, q.y - c.y) >= sp)) pick.push(c);
    out.length = 0;
    out.push(...pick);
  }
  const order = out.map((s, i) => i).sort((a, b) => out[a].d - out[b].d);
  CONFIG.slots = out.map((s) => [s.x, s.y]);
  CONFIG.slotRank = [];
  order.forEach((idx, rank) => { CONFIG.slotRank[idx] = rank; });
  CONFIG.slotTier = out.map(() => 1);
  // ô gợi ý cho người mới: gần giữa bản đồ
  let best = -1;
  out.forEach((s, i) => {
    if (best < 0 || Math.hypot(s.x - 560, s.y - 230) < Math.hypot(out[best].x - 560, out[best].y - 230)) best = i;
  });
  CONFIG.coachSlot = Math.max(0, best);
}

// Đổi bản đồ: đường đi, ô đặt tướng (gọi khi vào ải)
let MAP_ID = '';
function setMap(id) {
  const map = MAPS[id] || MAPS.song1;
  if (MAP_ID === id && CONFIG.slots.length) return map;
  MAP_ID = MAPS[id] ? id : 'song1';
  RIVER_D = map.d;
  CONFIG.path = sampleSvgPath(map.d).map(([x, y]) => [x * DK, y * DK]);
  CONFIG.mapEnd = [map.end[0] * DK, map.end[1] * DK];
  PATH.build();
  buildSpots(map);
  return map;
}
setMap('song1');

// ------------------------------------------------------------
//  ĐỒ: mỗi món trong túi là một bản riêng { uid, id, rarity, plus, locked, spent }
// ------------------------------------------------------------
// Đồ trang phục mang 1 hành (đồ bộ: hành của bộ). o.drop: đồ rơi / trong hũ
// có thêm dòng phụ ngẫu nhiên. Đồ Sử thi / Huyền thoại có 1 hiệu ứng ẩn theo hành.
const pick = (arr) => arr[Math.floor(srand() * arr.length)];
function makeItem(id, rarity, o = {}) {
  const it = ITEMS[id];
  const inst = { uid: newId(), id, rarity: rarity || it.rarity, plus: 0, locked: false, spent: 0 };
  if (GEAR_SLOTS.includes(it.slot)) {
    inst.el = it.set ? SETS[it.set].el : pick(EL_ORDER);
    inst.aff = o.drop ? rollAffixes([], AFFIX_COUNT[inst.rarity]) : [];
    inst.temper = 0;
    inst.rerolls = 0;
    rollHidden(inst);
  }
  return inst;
}
function rollAffixes(keep, n) {
  const out = keep.slice();
  const pool = Object.keys(AFFIXES).filter((k) => !out.includes(k));
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(srand() * pool.length), 1)[0]);
  return out;
}
// hiệu ứng ẩn của món (đồ bộ dùng hiệu ứng ẩn của bộ)
function rollHidden(inst) {
  if (inst.hid || ITEMS[inst.id].set || RARITY_ORDER.indexOf(inst.rarity) < 2) return;
  inst.hid = `i.${inst.el}${1 + Math.floor(srand() * 2)}`;
}
function itemHiddens(inst) {
  const out = [];
  if (inst.hid) out.push(inst.hid);
  if (inst.hid && inst.temper >= 10) out.push(inst.hid.endsWith('1') ? inst.hid.slice(0, -1) + '2' : inst.hid.slice(0, -1) + '1');
  if (SECRETS['r.' + inst.id]) out.push('r.' + inst.id);
  return out;
}

// Chỉ số của một món: chỉ số gốc theo độ hiếm hiện tại, mỗi cấp cường hóa +10%,
// mỗi lần Tôi luyện +3%, hành của món so với hành tướng ±%
function itemStats(inst, heroType) {
  const it = ITEMS[inst.id];
  const rel = heroType ? itemRelation(inst.el, HEROES[heroType].el) : null;
  const k = (RARITY[inst.rarity].mult / RARITY[it.rarity].mult) * (1 + 0.1 * inst.plus) * (1 + 0.03 * (inst.temper || 0))
    * (1 + (rel ? ELEM.item[rel] : 0) / 100);
  const out = {};
  for (const s in it.stats) out[s] = Math.round(it.stats[s] * k * 10) / 10;
  return out;
}
// giá trị dòng phụ (Tôi luyện ✦5: dòng phụ mạnh thêm 50%)
const affixVal = (inst, key) => AFFIXES[key].val * ((inst.temper || 0) >= 5 ? 1.5 : 1);
const enhanceCost = (inst) => (inst.plus + 1) * COSTS.enhance[inst.rarity];
const promoteCost = (inst) => COSTS.promote[inst.rarity] || 0;
const scrapValue = (inst) => COSTS.scrap[inst.rarity] + Math.floor(inst.spent * 0.6);

// Phả hệ thăng thần: [{ type, skillLv, tier }] từ tướng Thường tới bậc ngay trước.
// Bản lưu cũ (v20–v26) chỉ có h.from / skillLvFrom / baseTier: đổi sang 1 bậc.
function heroLineage(h) {
  if (h.lineage) return h.lineage;
  return h.from ? [{ type: h.from, skillLv: h.skillLvFrom || {}, tier: h.baseTier ?? 3 }] : [];
}
// tướng này (hoặc một bậc trước của nó) là `t`
const hasLine = (h, t) => h.type === t || heroLineage(h).some((a) => a.type === t);

function heroAttrs(h) {
  const def = HEROES[h.type];
  const out = {};
  for (const a of Object.keys(ATTRS)) out[a] = def.attrs[a] + def.gain[a] * (h.level - 1);
  // Thăng thần: kế thừa thuộc tính của mọi bậc trước (lấy bên cao nhất)
  for (const anc of heroLineage(h)) {
    const fd = HEROES[anc.type];
    for (const a of Object.keys(ATTRS)) out[a] = Math.max(out[a], fd.attrs[a] + fd.gain[a] * (h.level - 1));
  }
  // Luyện thể (cấp 25): mỗi lần +3 thuộc tính chính, +1 mỗi thuộc tính phụ
  if (h.train) for (const a of Object.keys(ATTRS)) out[a] += h.train * (a === heroMain(def) ? 3 : 1);
  if (h.statPts) out[heroMain(def)] += h.statPts * COSTS.statPt;     // điểm kỹ năng thừa
  return out;
}

// Cấp hiện tại của kỹ năng thứ i (0 = chưa mở khóa)
function skillLevel(h, i) {
  return h.skillLv[HEROES[h.type].skills[i].id] || 0;
}

// --- Chỉ số cuối = gốc + thuộc tính theo cấp + kỹ năng + đồ + bộ + hào quang
function heroStats(h) {
  const def = HEROES[h.type];
  const base = heroAttrs(h);
  const b = h.buff || {};
  const line = heroLineage(h);
  const s = {
    damage: def.base.damage, range: def.base.range, baseCooldown: def.base.cooldown,
    haste: 0, crit: 5, critMult: 2, cleave: 0, arrows: 1, poison: 0,
    splash: def.base.splash || 0, slow: def.base.slow || 0, stench: 0, bonusDmgPct: 0,
    str: base.str, agi: base.agi, int: base.int, hp: 0, regen: 0, cdr: 0, dr: 0,
    pierce: hasLine(h, 'caolo') ? 50 : 0, mpen: 0, canAir: def.attack !== 'melee', airMult: 1,
    goldOnKill: 0, stunChance: 0,
    hpPct: 0, rangePct: 0, skillPct: 0, bossPct: 0, floodPct: 0, shred: 0, spread: 0, magicRes: 0,
    thorns: 0, noHeal: 0, netSlow: 0, hitAir: 0, touchSlow: 0, drumAura: 0, fireTrail: 0, curve: 0, airPct: 0,
    hid: {}, sets: {}, elMana: 0, el: {}, lg: {},
    ...line.reduce((o, a) => inheritBase(def, HEROES[a.type], o), null),
  };
  // Thăng thần: giữ nội tại của mọi bậc trước (cấp kỹ năng lúc hóa thân) rồi cộng nội tại bậc hiện tại.
  // Số tia bắn lấy bên nhiều nhất giữa các bậc, không cộng dồn.
  let arrowsMax = 1;
  for (const [d, lvMap] of [...line.map((a) => [HEROES[a.type], a.skillLv || {}]), [def, null]]) {
    s.arrows = 1;
    d.skills.forEach((sk, i) => {
      const lv = lvMap ? lvMap[sk.id] || 0 : skillLevel(h, i);
      if (!lv || !sk.apply) return;
      const before = { ...s };
      sk.apply(s, skillN(h.level));
      const m = skillMult(lv);
      if (m > 1) {
        for (const k in s) {
          const b0 = typeof before[k] === 'number' ? before[k] : 0;
          if (typeof s[k] === 'number' && s[k] !== b0) s[k] += (s[k] - b0) * (m - 1);
        }
        s.arrows = Math.min(5, Math.round(s.arrows));
      }
    });
    arrowsMax = Math.max(arrowsMax, s.arrows);
  }
  s.arrows = arrowsMax;
  for (const slot of SLOTS) {
    const inst = h.equip[slot];
    if (!inst) continue;
    const it = ITEMS[inst.id];
    const st = itemStats(inst, h.type);
    for (const k in st) s[k] += st[k];
    if (it.stunChance) s.stunChance += it.stunChance;
    if (it.fx) for (const k in it.fx) s[k] += it.fx[k];
    for (const a of inst.aff || []) {
      const v = affixVal(inst, a);
      if (a === 'haste') s.haste += v;
      else if (a === 'boss') s.bossPct += v;
      else if (a === 'air') s.airPct += v;
      else if (a === 'cdr') s.cdr += v;
      else if (a === 'gold') s.goldOnKill += v;
      else if (a === 'flood') s.bonusDmgPct += v;       // v36: dòng phụ "nước" thành +% sát thương
      else if (a === 'range') s.rangePct += v;
      else if (a === 'crit') s.crit += v;
      else if (a === 'pen') s.pierce += v;
      else if (a === 'mpen') s.mpen += v;
    }
    for (const k of itemHiddens(inst)) s.hid[k] = 1;
  }
  // bộ đồ: 2 món / đủ 3 món; đủ bộ cùng hành với tướng = Thiên mệnh (+50%)
  const sc = setCounts(h.equip);
  for (const set in sc) {
    if (!SETS[set] || sc[set] < 2) continue;
    const n = Math.min(3, sc[set]);
    const k = n >= 3 && SETS[set].el === def.el ? 1.5 : 1;
    SETS[set].apply(s, n, k);
    s.sets[set] = n;
    if (n >= 3) s.hid['s.' + set] = 1;
    if (k > 1) s.thienMenh = set;
  }
  // v92: hệ ngũ hành của tướng
  if (ELEM_TRAIT[def.el]) ELEM_TRAIT[def.el].apply(s);
  if (def.traitApply) def.traitApply(s, h);          // v94: nội tại riêng của tướng mới
  // v92: Thần khí của tướng Vàng (3 hệ, mỗi hệ 5 cấp)
  const LV = legacyOf(h), LG = LV && LEGACY[h.type] && LV[h.type];
  if (LG) for (const sys of LEGACY[h.type]) {
    const lv = LG[sys.id] || 0;
    if (!lv) continue;
    for (const k in sys.per) s[k] += sys.per[k] * lv;
    for (const m of sys.ms) if (lv >= m.lv) { if (m.stat) s[m.stat] += m.v; else s.lg[m.fx] = Math.max(s.lg[m.fx] || 0, m.v); }
  }
  // v91: Ấn Phù tài khoản
  const RFX = runeFx(h);           // v95: ấn riêng của loại tướng này
  if (RFX) {
    for (const k in RFX.stat) s[k] += RFX.stat[k];
    if (h.windT > 0 && RFX.sk.g_frenzy) s.haste += RFX.sk.g_frenzy * (h.windN || 0);
  }
  // hiệu ứng ẩn và hào quang có điều kiện
  if (s.hid['r.gay_tam_gioi'] && b.tamGioi) { s.str += 5; s.agi += 5; s.int += 5; }
  if (s.hid['i.hoa2'] && h.hp < (h.hpMaxLast || 1) * 0.5) s.haste += 20;
  if (s.hid['r.cung_mat_chim'] && b.airWave) s.haste += 20;
  if (h.rageT > 0) s.haste += 5 * (h.rageN || 0);        // Song Rìu Cuồng Nộ
  if (h.warT > 0) s.haste += 20;                           // Trống Đồng gõ đầu đợt
  if (s.hid['i.moc2'] && (h.still || 0) >= 10) s.bonusDmgPct += 15;
  if (s.hid['i.thuy1'] && b.thuyAdj) s.bonusDmgPct += 10;   // đứng kề tướng hành Thủy
  if (b.vt) for (const k in b.vt) s[k] += b.vt[k];        // v182: cộng hưởng vai trò
  s.bonusDmgPct += (b.sinh || 0) * ELEM.sinh + (b.full ? ELEM.full : 0) + (b.drum || 0) - (b.llqPen ? 10 : 0) + (b.elPct || 0);
  s.hpPct += b.elPct || 0;                                 // thưởng boss Theo hệ: +% sát thương và máu
  s.airMult += s.airPct / 100;
  if (s.hitAir) s.canAir = true;
  if (h.huntT > 0) s.haste += 30;
  if (h.rallyT > 0) s.haste += h.rallyPct || 25;           // Trống Hiệu Triệu
  if (h.feastT > 0) s.bonusDmgPct += 20;                   // Bánh Chưng
  if (h.volleyT > 0 && def.attack !== 'melee') s.arrows = Math.min(6, s.arrows + 1);   // Lũy Nỏ Cổ Loa                          // ẩn Thần Săn Ba Vì
  if (h.type === 'xathu' && h.airKills) s.rangePct += Math.min(10, Math.floor(h.airKills / 10));

  // sao tiến hoá: tướng Thường theo bậc hiện tại; tướng thần giữ sao của mọi bậc trước + bậc Thần tinh
  // (Thần tinh Huyền thoại nhân ASC_EVO_MULT nên mạnh hơn)
  // tướng thần: sao Thường lấy bậc cao nhất trong các tướng Thường đã ghép; Thần tinh của mỗi
  // thần tím đã ghép giữ một nửa; cộng Thần tinh hiện tại (vàng mạnh hơn tím)
  const baseTier = line.filter((a) => !HEROES[a.type].legend).reduce((m, a) => Math.max(m, a.tier ?? 3), 0);
  const evos = line.length
    ? [[EVO_BONUS.base[baseTier], 1], ...line.filter((a) => HEROES[a.type].legend).map((a) => [EVO_BONUS.asc[a.tier || 0], 0.5]),
      [EVO_BONUS.asc[h.tier || 0], ASC_EVO_MULT[def.legend] || 1]]
    : [];      // tướng Thường: sức mạnh sao tính bằng MERGE_MULT (ghép), không cộng EVO_BONUS
  let evoHp = 0, evoSkill = 0;
  for (const [e, m] of evos) {
    s.bonusDmgPct += (e.dmg || 0) * m; evoHp += (e.hp || 0) * m; s.haste += (e.haste || 0) * m; evoSkill += (e.skill || 0) * m;
  }
  // quy đổi thuộc tính như Dota
  s.damage += s[heroMain(def)];
  s.haste += s.agi + (b.haste || 0);
  const grow = 1 + (h.grow || 0) * 0.05;             // Thánh Gióng: Vươn Vai
  s.hpMax = Math.round((150 + s.str * 18 + s.hp) * grow * (1 + ((b.hpPct || 0) + s.hpPct) / 100));
  s.range *= 1 + s.rangePct / 100;
  s.regen += 0.5 + s.str * 0.06 + (b.regen || 0);
  s.skillPower = (1 + s.int * 0.015) * (1 + s.skillPct / 100) * (1 + evoSkill / 100);
  s.hpMax = Math.round(s.hpMax * (1 + evoHp / 100));
  s.cdr = Math.min(50, s.cdr + s.int * 0.3);
  s.cleave = Math.min(1, s.cleave);
  s.pierce = Math.min(100, s.pierce + (b.pierce || 0));
  s.mpen = Math.min(100, s.mpen);
  if (h.type === 'llq' && h.hp < (h.hpMaxLast || 1) * 0.5) s.bonusDmgPct += 30;   // Con Rồng: rồng nổi giận khi bị thương
  if (def.dmgType === 'magic') s.bonusDmgPct += b.magicPct || 0;
  s.bonusDmgPct += b.forest || 0;                          // Mẫu Thượng Ngàn: Mẹ Rừng
  s.damage *= (1 + s.bonusDmgPct / 100) * grow;
  // Sao ghép (v34): mỗi sao mạnh gấp ~2 lần, để ghép 2 con thành 1 luôn đáng.
  // Tướng thần mang theo sức mạnh ★★★ của các tướng Thường đã ghép thành nó.
  const mk = line.length ? MERGE_MULT[3] * (FUSE_MULT[def.legend] || 1) * (FUSE_ADJ[h.type] || 1) : MERGE_MULT[h.tier || 0];
  if (mk !== 1) {
    s.damage *= mk;
    s.hpMax = Math.round(s.hpMax * (1 + (mk - 1) * 0.6));
    s.skillPower *= 1 + (mk - 1) * 0.5;
  }
  // Thần lực: tướng đã thăng thần mạnh hơn hẳn tướng gốc
  if (h.from) {
    const k = ASCEND_POWER[def.legend] || 1;
    s.damage *= k;
    s.hpMax = Math.round(s.hpMax * k);
    s.skillPower *= 1 + (k - 1) / 2;
  }
  s.maxMana = Math.round(80 + s.int * 12 + (RFX ? RFX.fx.maxMana || 0 : 0));
  s.manaRegen = (1.5 + s.int * 0.08) * (1 + ((b.manaPct || 0) + s.elMana + (RFX ? RFX.fx.manaRegen || 0 : 0)) / 100);
  s.dr = Math.min(80, s.dr);
  s.cooldown = s.baseCooldown / Math.max(0.2, 1 + s.haste / 100);
  if (h.bogged) { s.cooldown *= 2; s.manaRegen = 0; }   // sa lầy: -50% tốc đánh, không hồi năng lượng
  if (def.attack === 'melee' && s.spread) { s.cleave = Math.min(1, s.cleave + s.spread / 100); s.spread = 0; }
  // co-op: giao diện gọi heroStats (ngoài mô phỏng) không được ghi vào trạng thái chung
  if (!SIM.coop || SIM.active) h.hpMaxLast = s.hpMax;
  return s;
}

// Lực chiến: một con số để so đồ (sát thương mỗi giây, máu, tầm, sức mạnh kỹ năng)
function heroPower(h) {
  const st = heroStats(h);
  const dps = st.damage * (1 + (Math.min(100, st.crit) / 100) * ((st.critMult || 2) - 1)) / st.cooldown
    * (1 + st.cleave * 0.6 + (HEROES[h.type].attack === 'melee' ? 0 : Math.min(4, st.arrows - 1) * 0.2) + (st.splash ? 0.5 : 0));
  return Math.round(dps * 6 + st.hpMax / 8 * (1 + st.dr / 100) + (st.skillPower - 1) * 220 + st.range * 0.4 + st.regen * 4);
}
// lực chiến nếu mặc thử món inst vào ô slot (không đổi trạng thái thật)
function powerWith(h, slot, inst) {
  const old = h.equip[slot];
  const hp = h.hp, mx = h.hpMaxLast;
  h.equip[slot] = inst;
  const p = heroPower(h);
  h.equip[slot] = old;
  h.hp = hp; h.hpMaxLast = mx;
  return p;
}
// ô hợp với món (phụ kiện: ô trống đầu tiên, hết ô thì ô có món yếu nhất)
function slotFor(h, inst) {
  const it = ITEMS[inst.id];
  if (it.slot !== 'acc') return it.slot;
  const free = ACC_SLOTS.find((s) => !h.equip[s]);
  if (free) return free;
  let worst = null, wp = Infinity;
  for (const s of ACC_SLOTS) { const p = powerWith(h, s, null); if (-p < wp) { wp = -p; worst = s; } }
  return worst;
}
// món trong túi mặc vào thì lực chiến tăng bao nhiêu (0 nếu không mặc được / không tốt hơn)
function upgradeGain(h, inst) {
  if (!h || !canEquip(h.type, inst.id)) return 0;
  const slot = slotFor(h, inst);
  return Math.max(0, powerWith(h, slot, inst) - heroPower(h));
}

// chỉ số gốc của tướng thăng thần: lấy bên tốt hơn giữa tướng gốc và tướng thần
function inheritBase(def, fd0, prev) {
  // tốc đánh giữ theo tướng thần (nét riêng của tướng), sát thương / tầm lấy bên cao hơn
  // base.heir: chỉ số truyền lại cho tướng hợp thể (tướng đổi kiểu đánh theo ảnh vẫn truyền như cũ — không đổi cân bằng tướng con)
  const fd = fd0.base.heir ? { base: { ...fd0.base, ...fd0.base.heir } } : fd0;
  const p = prev || { damage: def.base.damage, range: def.base.range };
  const out = { ...p, damage: Math.max(p.damage, fd.base.damage), range: Math.max(p.range, fd.base.range) };
  if (fd.base.splash && !def.base.splash) out.splash = Math.max(out.splash || 0, fd.base.splash);
  if (fd.base.slow && !def.base.slow) out.slow = Math.max(out.slow || 0, fd.base.slow);
  return out;
}

// quái bay (Bùa Chim Lạc đánh rơi xuống đất 1 giây)
const isFlying = (e) => e.def.flying && !(e.groundT > 0);

function setCounts(equip) {
  const counts = {};
  for (const slot of GEAR_SLOTS) {
    const it = equip[slot] && ITEMS[equip[slot].id];
    if (it && it.set) counts[it.set] = (counts[it.set] || 0) + 1;
  }
  return counts;
}

function activeSets(equip) {
  const c = setCounts(equip);
  return Object.keys(c).filter((k) => SETS[k] && c[k] >= SETS[k].pieces);
}

function canEquip(heroType, itemId) {
  const it = ITEMS[itemId];
  if (!it) return false;
  return it.slot !== 'weapon' || it.wclass === HEROES[heroType].wclass;
}

// Đồ rơi / trong hũ: chỉ đồ trang phục (phụ kiện mua ở Lò đúc)
function rollItem(minRarity) {
  const min = RARITY_ORDER.indexOf(minRarity || 'common');
  const pool = Object.keys(ITEMS).filter((id) =>
    GEAR_SLOTS.includes(ITEMS[id].slot) && !ITEMS[id].bossOnly && !ITEMS[id].set && RARITY_ORDER.indexOf(ITEMS[id].rarity) >= min);
  const total = pool.reduce((a, id) => a + RARITY[ITEMS[id].rarity].weight, 0);
  let r = srand() * total;
  for (const id of pool) {
    r -= RARITY[ITEMS[id].rarity].weight;
    if (r <= 0) return id;
  }
  return pool[pool.length - 1];
}

// Đồ bộ: chỉ rơi từ quái tinh anh, boss và Hũ Vua Hùng
function rollSetItem() {
  const set = pick(SET_ORDER);
  return pick(Object.values(SETS[set].ids));
}

// ------------------------------------------------------------
//  KỸ NĂNG CHỦ ĐỘNG. Trả về true nếu đã dùng (để tính hồi chiêu).
//  Mỗi chiêu đẩy hiệu ứng vào game.effects (vẽ ở main.js).
// ------------------------------------------------------------
const SKILL_COLOR = {
  bash: '#F2D27A', judgement: '#C8A8FF', pierce: '#7bed9f', arrowrain: '#7FC24A',
  firepillar: '#ff7f50', meteor: '#F28A2E', hook: '#8BC34A', devour: '#B9A274',
  shadowstep: '#7FC24A', assassinate: '#E25A3A', nova: '#BDEBFA', blizzard: '#9EDDF2',
  bamboo: '#D4DC70', firetrail: '#FF8A2E', skyride: '#FFB04A',
  claw: '#7FE0F0', seawave: '#5AB4D6', dragonbeam: '#BFF0FF',
  goldshell: '#F2D27A', quake: '#C8A040', guardcity: '#FFD66B',
  chop: '#E8C070', lute: '#FFE08A', slayer: '#FF6B4A',
  triple: '#F2D27A', turtlearrow: '#9EDDF2', divinebow: '#FFF1C4',
  melon: '#3EDC4E', birds: '#F2E6C8', melonrain: '#3EDC4E',
  flowerheal: '#FF9EC4', mothermountain: '#B9A274', hundredeggs: '#F2E6C8',
  staffheal: '#9EDDF2', redriver: '#E07050', nightcastle: '#C8A878',
  fan: '#FFC8E0', lotus: '#FF9EC4', flowerrain: '#FFB8D8',
  banhchung: '#7FC24A', ricefield: '#E8D070', ancestor: '#FFE08A',
};

function healHeroes(game, x, y, r, pct, color) {
  let n = 0;
  for (const o of game.heroes) {
    if (!o || o.dead || Math.hypot(o.x - x, o.y - y) > r) continue;
    const mx = heroStats(o).hpMax;
    if (o.hp >= mx) continue;
    o.hp = Math.min(mx, o.hp + mx * pct);
    game.effects.push({ type: 'heal', x: o.x, y: o.y, r: 26, color, ttl: 0.7, max: 0.7 });
    n++;
  }
  return n;
}
const hurtNear = (game, x, y, r, below = 0.8) => game.heroes.some((o) =>
  o && !o.dead && Math.hypot(o.x - x, o.y - y) <= r && o.hp < heroStats(o).hpMax * below);
function shieldHeroes(game, x, y, r, pct, color) {
  for (const o of game.heroes) {
    if (!o || o.dead || Math.hypot(o.x - x, o.y - y) > r) continue;
    o.shield = Math.max(o.shield || 0, heroStats(o).hpMax * pct);
    o.shieldT = 8;
    game.effects.push({ type: 'ring', x: o.x, y: o.y - 22, r: 30, color, ttl: 0.6, max: 0.6 });
  }
}
// đẩy lùi quái dọc dòng sông
function knockback(e, dist) {
  if (e.def.boss) dist *= 0.3;
  e.pullT = 0.3;
  e.pullSpeed = dist / 0.3;
}

const SKILL_CASTS = {

  // ===== v96: chiêu hành Hỏa mới =====
  // Cô Thả Đèn Trời: 3 đèn trời rơi xuống 3 quái
  lanterns(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.2).sort((a, b) => b.hp - a.hp).slice(0, 3);
    if (!list.length) return false;
    for (const e of list) {
      game.effects.push({ type: 'lob', kind: 'den', x: e.x, y: e.y - 120, x2: e.x, y2: e.y, color: '#FFD66B', ttl: 0.4, max: 0.4 });
      game.effects.push({ type: 'ring', x: e.x, y: e.y, r: 34, color: '#FFB04A', ttl: 0.4, max: 0.4 });
      game.hit(e, (st.damage * 1.5 + n * 0.6) * st.skillPower, h, { big: true, color: '#FFD66B' });
      if (!e.dead) game.dot(e, st.damage * 0.4 * st.skillPower, h, '#E0452C', 'magic', 3);
    }
    return true;
  },
  // Bà Hỏa: khói mù — chậm + câm lặng
  smokecloud(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.1);
    if (!t) return false;
    game.effects.push({ type: 'nova', x: t.x, y: t.y, r: 80, ttl: 0.6, max: 0.6 });
    game.effects.push({ type: 'ring', x: t.x, y: t.y, r: 80, color: '#4A4040', ttl: 0.7, max: 0.7 });
    for (const e of game.enemiesInRange(t.x, t.y, 80)) {
      game.slow(e, 30, 2.5); e.silenceT = Math.max(e.silenceT || 0, e.def.boss ? 1 : 2);
      game.hit(e, (st.damage * 1.5 + n) * st.skillPower, h, { color: '#C8A090' });
    }
    return true;
  },
  // Bà Hỏa / Viêm Đế: biển lửa trong tầm
  firestorm(game, h, st, n) {
    const r = st.range * 1.3, list = game.enemiesInRange(h.x, h.y, r, false);
    if (!list.length) return false;
    game.effects.push({ type: 'banner', str: st.skName || 'Biển Lửa', color: '#FF8A3A', ttl: 1.4, max: 1.4 });
    game.effects.push({ type: 'wave', x: h.x, y: h.y, r, color: '#FF6A3A', ttl: 0.8, max: 0.8 });
    for (const e of list) {
      game.hit(e, (st.damage * 2 + n * 2) * st.skillPower, h, { big: true, color: '#FF8A3A' });
      if (!e.dead) game.dot(e, st.damage * 0.8 * st.skillPower, h, '#E0452C', 'magic', 4);
    }
    return true;
  },

  // ===== v94: chiêu của tướng dân gian mới =====
  // Thợ Rèn / Ông Táo: búa (kẹp) nung đỏ — đòn lớn + thiêu đốt
  forgehammer(game, h, st, n) {
    const e = game.findTarget(h.x, h.y, st.range * 1.1, false);
    if (!e) return false;
    game.effects.push({ type: 'bash', x: e.x, y: e.y - 8, ttl: 0.45, max: 0.45 });
    game.effects.push({ type: 'ring', x: e.x, y: e.y - 8, r: 30, color: '#FF7A3A', ttl: 0.4, max: 0.4 });
    game.hit(e, (st.damage * 2.2 + n * 0.8) * st.skillPower, h, { big: true, color: '#FF9A4A' });
    if (!e.dead) game.dot(e, st.damage * 0.5 * st.skillPower, h, '#E0452C', 'magic', 3);
    return true;
  },
  forgeblast(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, 130, false);
    if (!list.length) return false;
    game.effects.push({ type: 'nova', x: h.x, y: h.y, r: 130, ttl: 0.5, max: 0.5 });
    game.effects.push({ type: 'ring', x: h.x, y: h.y, r: 130, color: '#FF7A3A', ttl: 0.6, max: 0.6 });
    game.shake = Math.max(game.shake, 4);
    for (const e of list) { game.hit(e, (st.damage * 4 + n * 2) * st.skillPower, h, { big: true, color: '#FF7A3A' }); if (!e.dead) game.dot(e, st.damage * 0.6 * st.skillPower, h, '#E0452C', 'magic', 3); }
    return true;
  },
  // Ngư Phủ: quăng chài trói chân
  netthrow(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.3, false).sort((a, b) => b.dist - a.dist).slice(0, n >= 15 ? 5 : 4);
    if (!list.length) return false;
    for (const e of list) {
      game.effects.push({ type: 'lob', kind: 'chai', x: h.x, y: h.y - 30, x2: e.x, y2: e.y, color: '#D8C8A0', ttl: 0.35, max: 0.35 });
      game.stun(e, 1.2, 'net');
      game.hit(e, (st.damage * 1.2 + n * 0.5) * st.skillPower, h, { color: '#D8C8A0' });
    }
    return true;
  },
  // Thợ Gốm: bình gốm nổ, choáng
  potbomb(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.1);
    if (!t) return false;
    game.effects.push({ type: 'lob', kind: 'gom', x: h.x, y: h.y - 30, x2: t.x, y2: t.y, color: '#C99A3C', ttl: 0.45, max: 0.45 });
    game.effects.push({ type: 'ring', x: t.x, y: t.y, r: 70, color: '#C99A3C', ttl: 0.5, max: 0.5 });
    for (const e of game.enemiesInRange(t.x, t.y, 70)) { game.hit(e, (st.damage * 2 + n * 0.8) * st.skillPower, h, { big: true, color: '#E8C27A' }); game.stun(e, 0.6, 'stun'); }
    return true;
  },
  // Thầy Lang: thuốc nam
  herbheal(game, h, st, n) {
    let best = null;
    for (const o of game.heroes) {
      if (!o || o.dead || Math.hypot(o.x - h.x, o.y - h.y) > 220) continue;
      const r = o.hp / heroStats(o).hpMax;
      if (r < 0.9 && (!best || r < best.r)) best = { o, r };
    }
    if (!best) return false;
    const pct = (0.2 + n * 0.003) * skillMult(st.lv || 1);
    const om = heroStats(best.o).hpMax;
    best.o.hp = Math.min(om, best.o.hp + om * pct);
    game.text(best.o.x, best.o.y - 60, '+' + Math.round(om * pct), '#6AE06A', 0.8, 14);
    healHeroes(game, best.o.x, best.o.y, 120, 0.08, '#7FE07A');
    return true;
  },
  // Thần Trống Đồng: sấm đồng — choáng diện rộng
  drumquake(game, h, st, n) {
    const r = st.range * 1.4, list = game.enemiesInRange(h.x, h.y, r, false);
    if (!list.length) return false;
    game.effects.push({ type: 'banner', str: st.skName || 'Sấm Đồng', color: '#F2D27A', ttl: 1.4, max: 1.4 });
    game.effects.push({ type: 'ring', x: h.x, y: h.y, r, color: '#F2D27A', ttl: 0.7, max: 0.7 });
    game.effects.push({ type: 'wave', x: h.x, y: h.y, r, color: '#F2D27A', ttl: 0.7, max: 0.7 });
    game.shake = Math.max(game.shake, 6);
    for (const e of list) { game.stun(e, 1.5, 'stun'); game.hit(e, (st.damage * 3 + n * 2) * st.skillPower, h, { big: true, color: '#F2D27A' }); }
    return true;
  },
  // Thần Cá Ông: phun vòi nước
  whalespout(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.2, false);
    if (!list.length) return false;
    game.effects.push({ type: 'gust', x: h.x, y: h.y - 30, r: st.range * 1.2, color: '#9EDDF2', ttl: 0.6, max: 0.6 });
    for (const e of list) { game.slow(e, 40, 2); game.hit(e, (st.damage * 1.6 + n * 0.6) * st.skillPower, h, { color: '#9EDDF2' }); }
    return true;
  },
  // Mẫu Thoải: mở cửa Thủy Cung — cuốn ngược quái
  tidegate(game, h, st, n) {
    const r = st.range * 1.5, list = game.enemiesInRange(h.x, h.y, r, false);
    if (!list.length) return false;
    game.effects.push({ type: 'banner', str: st.skName || 'Long Cung Mở Cửa', color: '#9EDDF2', ttl: 1.6, max: 1.6 });
    game.effects.push({ type: 'wave', x: h.x, y: h.y, r, color: '#5AB4D6', ttl: 0.9, max: 0.9 });
    for (const e of list) {
      if (!e.def.boss) e.dist = Math.max(0, e.dist - 60);
      game.slow(e, 50, 3);
      game.hit(e, (st.damage * 3 + n * 2) * st.skillPower, h, { big: true, color: '#9EDDF2' });
    }
    return true;
  },
  // Thần Trụ Trời: cột đá trồi lên
  pillar(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.3, false);
    if (!t) return false;
    game.effects.push({ type: 'ring', x: t.x, y: t.y, r: 70, color: '#C99A3C', ttl: 0.6, max: 0.6 });
    game.effects.push({ type: 'bash', x: t.x, y: t.y - 8, ttl: 0.45, max: 0.45 });
    game.shake = Math.max(game.shake, 4);
    for (const e of game.enemiesInRange(t.x, t.y, 70, false)) { game.stun(e, 1.5, 'stun'); game.hit(e, (st.damage * 3 + n * 2) * st.skillPower, h, { big: true, color: '#E8C27A' }); }
    return true;
  },
  // Chúa Sơn Lâm: tiếng gầm — choáng + câm lặng
  tigerroar(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.3);
    if (!list.length) return false;
    game.effects.push({ type: 'ring', x: h.x, y: h.y, r: st.range * 1.3, color: '#E8843A', ttl: 0.7, max: 0.7 });
    game.text(h.x, h.y - 80, 'GẦM!', '#FFB04A', 1, 18);
    for (const e of list) { game.stun(e, e.def.boss ? 0.4 : 1, 'stun'); e.silenceT = Math.max(e.silenceT || 0, e.def.boss ? 1.5 : 3); }
    return true;
  },
  // ----- 6 tướng cơ bản
  bash(game, h, st, n) {
    const e = game.findTarget(h.x, h.y, st.range, false);
    if (!e) return false;
    game.effects.push({ type: 'bash', x: e.x, y: e.y - 8, ttl: 0.45, max: 0.45 });
    // ẩn: đứng kề Lực Sĩ Núi thì choáng thêm 0,5 giây
    const pal = hasLine(h, 'lactuong') && game.adjacent(h).some((o) => o.type === 'lucsi');
    if (pal) game.discover('h.lactuong', h.x, h.y);
    game.stun(e, (e.def.boss ? 0.4 : 1) + (pal ? 0.5 : 0), 'stun');
    game.hit(e, (st.damage * 2 + n * 0.6) * st.skillPower, h, { big: true, color: '#F2D27A' });
    game.shake = Math.max(game.shake, 3);
    return true;
  },
  judgement(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.3);
    if (!list.length) return false;
    const e = list.reduce((a, b) => (b.hp > a.hp ? b : a));
    game.effects.push({ type: 'dim', ttl: 0.35, max: 0.35 });
    game.effects.push({ type: 'bolt', x: e.x, y: e.y, ttl: 0.45, max: 0.45 });
    game.effects.push({ type: 'scorch', x: e.x, y: e.y, ttl: 1.2, max: 1.2 });
    game.sparks(e.x, e.y - 8, '#E0D0FF', 12);
    game.hit(e, (st.damage * 4 + n * 2) * st.skillPower, h, { big: true, color: '#C8A8FF', dt: 'magic' });
    game.shake = Math.max(game.shake, 6);
    return true;
  },
  pierce(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range);
    if (!t) return false;
    game.lineHit(h, t, st.range * 1.6, (st.damage * 2 + n * 0.8) * st.skillPower, { color: '#7bed9f' });
    return true;
  },
  arrowrain(game, h, st, n) {
    const target = game.findTarget(h.x, h.y, st.range);
    if (!target) return false;
    const { x, y } = target;
    game.effects.push({ type: 'volley', x: h.x, y: h.y - 30, ttl: 0.35, max: 0.35 });
    game.effects.push({ type: 'warn', x, y, r: 90, color: '#7FC24A', ttl: 0.35, max: 0.35 });
    game.effects.push({
      type: 'rain', x, y, r: 90, ttl: 0.7, max: 0.7, delay: 0.3,
      onEnd: () => {
        for (const e of game.enemiesInRange(x, y, 90)) game.hit(e, (st.damage * 2 + n * 0.5) * st.skillPower, h, { color: '#7FC24A' });
      },
    });
    return true;
  },
  firepillar(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range);
    if (!t) return false;
    const { x, y } = t;
    game.effects.push({ type: 'pillar', x, y, ttl: 0.8, max: 0.8 });
    for (const e of game.enemiesInRange(x, y, 48)) {
      game.hit(e, (st.damage * 1.8 + n * 0.8) * st.skillPower, h, { big: true, color: '#ff7f50' });
      if (!e.dead) game.dot(e, Math.max(st.poison, 5 + n * 0.1), h, '#e67e22', 'magic');
    }
    return true;
  },
  meteor(game, h, st, n) {
    const target = game.findTarget(h.x, h.y, st.range * 1.3);
    if (!target) return false;
    const { x, y } = target;
    game.effects.push({ type: 'warn', x, y, r: 110, color: '#E25A3A', ttl: 0.8, max: 0.8 });
    game.effects.push({
      type: 'meteor', x, y, ttl: 0.8, max: 0.8,
      onEnd: () => {
        game.effects.push({ type: 'explosion', x, y, r: 110, ttl: 0.6, max: 0.6 });
        game.effects.push({ type: 'scorch', x, y, r: 60, ttl: 1.6, max: 1.6 });
        game.sparks(x, y - 10, '#ffbe76', 16);
        game.shake = Math.max(game.shake, 9);
        for (const e of game.enemiesInRange(x, y, 110)) game.hit(e, (st.damage * 5 + n * 2) * st.skillPower, h, { big: true, color: '#F28A2E' });
      },
    });
    return true;
  },
  hook(game, h, st, n) {
    const e = game.findTarget(h.x, h.y, st.range * 1.8, false);
    if (!e) return false;
    game.effects.push({ type: 'hook', hero: h, target: e, color: '#6A8A2A', ttl: 0.55, max: 0.55 });
    game.effects.push({
      type: 'none', ttl: 0.2, max: 0.2,
      onEnd: () => {
        if (e.dead) return;
        if (!e.def.boss) { e.pullT = 0.3; e.pullSpeed = 120 / 0.3; }
        game.hit(e, (40 + n * 1.5) * st.skillPower, h, { big: true, color: '#8BC34A' });
      },
    });
    return true;
  },
  devour(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.2, false);
    if (!list.length) return false;
    const normal = list.filter((e) => !e.def.boss && !e.champion);
    game.effects.push({ type: 'vortex', x: h.x, y: h.y - 22, color: '#B9A274', ttl: 0.6, max: 0.6 });
    if (normal.length) {
      // ẩn: đứng ô bậc Cao thì chôn 2 quái
      const two = hasLine(h, 'lucsi') && game.adjacent(h).some((o) => o.type === 'lactuong') && normal.length > 1;
      if (two) game.discover('h.lucsi', h.x, h.y);
      for (const e of normal.sort((a, b) => b.hp - a.hp).slice(0, two ? 2 : 1)) {
        game.effects.push({ type: 'rockfall', x: e.x, y: e.y, ttl: 0.6, max: 0.6 });
        game.text(e.x, e.y - 30, 'VÙI ĐÁ!', '#E8D8B0', 0.9, 18);
        game.hit(e, e.hp + (e.shield || 0) + 1, h, { dt: 'pure' });
      }
    } else {
      game.hit(list[0], (st.damage * 6 + n * 2) * st.skillPower, h, { big: true, color: '#B9A274' });
    }
    return true;
  },
  shadowstep(game, h, st, n) {
    const e = game.findTarget(h.x, h.y, st.range * 2, false);
    if (!e) return false;
    game.effects.push({ type: 'afterimage', x: h.x, y: h.y, x2: e.x, y2: e.y, color: '#7FC24A', ttl: 0.45, max: 0.45 });
    game.effects.push({ type: 'xslash', x: e.x, y: e.y - 10, color: '#C8F0A0', ttl: 0.35, max: 0.35 });
    game.hit(e, (st.damage * 2 + n * 0.5) * st.skillPower, h, { st, big: true, color: '#C8F0A0' });
    return true;
  },
  assassinate(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 2.5, false);
    if (!list.length) return false;
    const e = list.reduce((a, b) => (b.hp > a.hp ? b : a));
    game.effects.push({ type: 'mark', target: e, ttl: 0.45, max: 0.45,
      onEnd: () => {
        if (e.dead) return;
        game.effects.push({ type: 'afterimage', x: h.x, y: h.y, x2: e.x, y2: e.y, color: '#E25A3A', ttl: 0.35, max: 0.35 });
        game.effects.push({ type: 'xslash', x: e.x, y: e.y - 10, color: '#ff6b6b', ttl: 0.4, max: 0.4, big: true });
        game.sparks(e.x, e.y - 8, '#c0392b', 12);
        game.shake = Math.max(game.shake, 5);
        game.hit(e, (st.damage * 6 + n * 3) * st.skillPower, h, { big: true, color: '#E25A3A' });
        // ẩn: hạ gục mục tiêu thì hồi ngay 50% năng lượng
        if (e.dead && !h.dead && hasLine(h, 'thosan')) {
          h.mana = Math.min(heroStats(h).maxMana, h.mana + heroStats(h).maxMana * 0.5);
          game.discover('h.thosan', h.x, h.y);
        }
      } });
    return true;
  },
  nova(game, h, st, n) {
    const target = game.findTarget(h.x, h.y, st.range);
    if (!target) return false;
    const { x, y } = target;
    game.effects.push({ type: 'nova', x, y, r: 80, ttl: 0.55, max: 0.55 });
    for (const e of game.enemiesInRange(x, y, 80)) {
      game.hit(e, (60 + n) * st.skillPower, h, { color: '#BDEBFA' });
      if (!e.dead) game.slow(e, 60, 2.5);
    }
    return true;
  },
  blizzard(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range);
    if (!list.length) return false;
    game.effects.push({ type: 'snow', x: h.x, y: h.y, r: st.range, ttl: 2, max: 2 });
    for (const e of list) {
      game.stun(e, e.def.boss ? 1 : 2, 'ice');
      game.hit(e, (st.damage * 3 + n) * st.skillPower, h, { color: '#BDEBFA' });
    }
    game.shake = Math.max(game.shake, 3);
    return true;
  },

  // ----- Thánh Gióng
  bamboo(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range, false);
    if (!list.length) return false;
    game.effects.push({ type: 'sweep', x: h.x, y: h.y - 20, r: st.range, dir: h.dir, color: '#D4DC70', ttl: 0.4, max: 0.4 });
    for (const e of list) {
      game.stun(e, e.def.boss ? 0.25 : 0.6, 'stun');
      game.hit(e, (st.damage * 1.6 + n) * st.skillPower, h, { color: '#D4DC70' });
    }
    game.shake = Math.max(game.shake, 3);
    return true;
  },
  firetrail(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.4, false);
    if (!t) return false;
    const d0 = t.dist;
    game.zones.push({ kind: 'fire', d1: Math.max(0, d0 - 160), d2: d0 + 60, ttl: 4, max: 4,
      dps: (10 + n * 0.5) * st.skillPower * (1 + st.int * 0.01), hero: h, dt: 'magic' });
    game.effects.push({ type: 'horse', x: h.x, y: h.y, x2: t.x, y2: t.y, ttl: 0.5, max: 0.5 });
    return true;
  },
  skyride(game, h, st, n) {
    // cưỡi ngựa sắt bay dọc cả dòng sông: đánh mọi quái trên bản đồ (cả quái bay)
    const list = game.enemies.filter((e) => !e.dead);
    if (list.length < 3 && !list.some((e) => e.def.boss)) return false;
    game.effects.push({ type: 'skyride', d1: 0, d2: PATH.total, ttl: 1.1, max: 1.1 });
    game.effects.push({ type: 'banner', str: st.skName || 'Bay Về Trời', color: '#FFB04A', ttl: 1.6, max: 1.6 });
    game.effects.push({ type: 'flash', color: '#FFE0A0', ttl: 0.3, max: 0.3 });
    game.shake = Math.max(game.shake, 8);
    for (const e of list) {
      // ngựa chạy từ cửa sông về thành: quái càng gần thành bị đánh càng sau
      const delay = 0.05 + 0.85 * (e.dist / PATH.total);
      game.effects.push({ type: 'none', ttl: delay, max: delay,
        onEnd: () => { if (!e.dead) game.hit(e, (st.damage * 4 + n * 2) * st.skillPower, h, { big: true, color: '#FFB04A' }); } });
    }
    return true;
  },
  // ----- Lạc Long Quân
  claw(game, h, st, n) {
    const e = game.findTarget(h.x, h.y, st.range, false);
    if (!e) return false;
    game.effects.push({ type: 'claw', x: e.x, y: e.y - 10, color: '#7FE0F0', ttl: 0.4, max: 0.4 });
    for (let i = 0; i < 2; i++) game.hit(e, (st.damage * 1.5 + n * 0.5) * st.skillPower, h, { st, big: i === 1, color: '#7FE0F0' });
    return true;
  },
  seawave(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.2, false);
    if (!list.length) return false;
    game.effects.push({ type: 'wave', x: h.x, y: h.y, r: st.range * 1.2, color: '#5AB4D6', ttl: 0.7, max: 0.7 });
    for (const e of list) {
      knockback(e, 90);
      game.hit(e, (st.damage * 1.5 + n) * st.skillPower, h, { color: '#9EDDF2' });
    }
    return true;
  },
  dragonbeam(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.3);
    if (!t) return false;
    game.effects.push({ type: 'banner', str: st.skName || 'Hóa Rồng', color: '#7FE0F0', ttl: 1.6, max: 1.6 });
    game.lineHit(h, t, st.range * 2.2, (st.damage * 5 + n * 2) * st.skillPower,
      { color: '#BFF0FF', width: 26, dt: 'magic', stun: 0.5, bolt: true });
    game.shake = Math.max(game.shake, 7);
    return true;
  },
  // ----- Thần Kim Quy
  goldshell(game, h, st, n) {
    if (!hurtNear(game, h.x, h.y, 170, 0.95) && !game.enemiesInRange(h.x, h.y, 200).length) return false;
    shieldHeroes(game, h.x, h.y, 170, (0.2 + n * 0.0025) * skillMult(st.lv || 1), '#F2D27A');
    game.effects.push({ type: 'dome', x: h.x, y: h.y, r: 170, color: '#F2D27A', ttl: 0.8, max: 0.8 });
    return true;
  },
  quake(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range, false);
    if (!list.length) return false;
    game.effects.push({ type: 'ring', x: h.x, y: h.y, r: st.range, color: '#C8A040', ttl: 0.6, max: 0.6 });
    game.effects.push({ type: 'cracks', x: h.x, y: h.y, r: st.range, ttl: 1, max: 1 });
    game.shake = Math.max(game.shake, 6);
    for (const e of list) {
      game.stun(e, e.def.boss ? 0.5 : 1.2, 'stun');
      game.hit(e, (st.damage * 1.5 + n) * st.skillPower, h, { color: '#E8C070' });
    }
    return true;
  },
  guardcity(game, h, st) {
    const danger = game.enemies.some((e) => !e.dead && e.dist > PATH.total - 170);
    if (!danger) return false;
    game.guardT = 5;
    game.effects.push({ type: 'banner', str: st.skName || 'Kim Quy Hộ Thành', color: '#FFD66B', ttl: 1.6, max: 1.6 });
    game.effects.push({ type: 'flash', color: '#FFE08A', ttl: 0.3, max: 0.3 });
    return true;
  },
  // ----- Thạch Sanh
  chop(game, h, st, n) {
    const e = game.findTarget(h.x, h.y, st.range, true);
    if (!e) return false;
    game.effects.push({ type: 'bash', x: e.x, y: e.y - 8, ttl: 0.45, max: 0.45 });
    game.hit(e, (st.damage * 3 + n) * st.skillPower, h, { st, big: true, color: '#E8C070' });
    return true;
  },
  lute(game, h, st) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.2);
    if (list.length < 2) return false;
    game.effects.push({ type: 'notes', x: h.x, y: h.y, r: st.range * 1.2, ttl: 1.5, max: 1.5 });
    for (const e of list) game.stun(e, e.def.boss ? 0.6 : 1.5, 'music');
    return true;
  },
  slayer(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.3);
    if (!list.length) return false;
    const e = list.reduce((a, b) => (b.hp > a.hp ? b : a));
    game.effects.push({ type: 'banner', str: st.skName || 'Diệt Chằn Tinh', color: '#FF6B4A', ttl: 1.6, max: 1.6 });
    game.effects.push({ type: 'xslash', x: e.x, y: e.y - 10, color: '#FFB04A', ttl: 0.45, max: 0.45, big: true });
    game.shake = Math.max(game.shake, 8);
    const boss = e.def.boss || e.champion ? 3 : 1;
    game.hit(e, (st.damage * 8 + n * 3) * st.skillPower * boss, h, { big: true, color: '#FF6B4A' });
    return true;
  },
  // ----- Cao Lỗ
  triple(game, h, st, n) {
    const list = game.enemies.filter((e) => !e.dead && Math.hypot(e.x - h.x, e.y - h.y) <= st.range)
      .sort((a, b) => b.dist - a.dist).slice(0, 3);
    if (!list.length) return false;
    for (const e of list) game.shoot(h, e, 'bolt', 620, { ...st, damage: (st.damage * 1.5 + n * 0.5) * st.skillPower });
    return true;
  },
  turtlearrow(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.2);
    if (!list.length) return false;
    const e = list.reduce((a, b) => (b.armor > a.armor || (b.armor === a.armor && b.hp > a.hp) ? b : a));
    game.effects.push({ type: 'streak', x: h.x, y: h.y - 28, x2: e.x, y2: e.y - 8, color: '#9EDDF2', ttl: 0.35, max: 0.35 });
    game.hit(e, (st.damage * 3 + n) * st.skillPower, h, { big: true, color: '#9EDDF2', dt: 'pure' });
    return true;
  },
  divinebow(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.2);
    if (!t) return false;
    game.effects.push({ type: 'banner', str: st.skName || 'Nỏ Thần', color: '#FFF1C4', ttl: 1.6, max: 1.6 });
    // ẩn: Thần Kim Quy cùng trên sân thì Nỏ Thần x2
    const turtle = hasLine(h, 'caolo') && game.heroes.some((o) => o && !o.dead && o.type === 'kimquy');
    if (turtle) game.discover('h.caolo', h.x, h.y);
    game.lineHit(h, t, st.range * 2.6, (st.damage * 6 + n * 2) * st.skillPower * (turtle ? 2 : 1), { color: '#FFF1C4', width: 18, dt: 'pure' });
    game.shake = Math.max(game.shake, 5);
    return true;
  },
  // ----- Mai An Tiêm
  melon(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range);
    if (!t) return false;
    game.effects.push({ type: 'lob', kind: 'dua', x: h.x, y: h.y - 30, x2: t.x, y2: t.y, color: '#3EDC4E', ttl: 0.45, max: 0.45,
      onEnd: () => {
        game.effects.push({ type: 'splat', x: t.x, y: t.y, r: 70, color: '#E04848', ttl: 0.6, max: 0.6 });
        for (const e of game.enemiesInRange(t.x, t.y, 70)) {
          game.hit(e, (st.damage * 1.5 + n) * st.skillPower, h, { color: '#3EDC4E' });
          if (!e.dead) game.slow(e, 50, 2.5);
        }
      } });
    return true;
  },
  birds(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.2);
    if (!list.length) return false;
    for (let i = 0; i < 6; i++) {
      const e = list[i % list.length];
      game.effects.push({ type: 'bird', x: h.x, y: h.y - 40, target: e, ttl: 0.4 + i * 0.08, max: 0.4 + i * 0.08,
        onEnd: () => { if (!e.dead) game.hit(e, (st.damage + n * 0.5) * st.skillPower, h, { color: '#F2E6C8' }); } });
    }
    return true;
  },
  melonrain(game, h, st, n) {
    const list = game.enemies.filter((e) => !e.dead);
    if (list.length < 4) return false;
    game.effects.push({ type: 'banner', str: st.skName || 'Mưa Dưa', color: '#3EDC4E', ttl: 1.6, max: 1.6 });
    for (const e of list) {
      game.effects.push({ type: 'lob', kind: 'dua', x: e.x - 40, y: e.y - 220, x2: e.x, y2: e.y, color: '#3EDC4E', ttl: 0.4 + srand() * 0.5, max: 0.9,
        onEnd: () => {
          game.effects.push({ type: 'splat', x: e.x, y: e.y, r: 30, color: '#E04848', ttl: 0.4, max: 0.4 });
          if (!e.dead) { game.hit(e, (st.damage * 2 + n) * st.skillPower, h, { color: '#3EDC4E' }); if (!e.dead) game.slow(e, 40, 2); }
        } });
    }
    return true;
  },
  // ----- Âu Cơ
  flowerheal(game, h, st, n) {
    if (!hurtNear(game, h.x, h.y, 180)) return false;
    const pct = (0.25 + n * 0.003) * skillMult(st.lv || 1);
    healHeroes(game, h.x, h.y, 180, pct, '#FF9EC4');
    // ẩn: đứng ô bậc Cao thì hồi thêm cho 1 tướng ở xa hơn
    if (hasLine(h, 'auco') && game.adjacent(h).length >= 2) {
      const far = game.heroes.filter((o) => o && !o.dead && Math.hypot(o.x - h.x, o.y - h.y) > 180 && o.hp < heroStats(o).hpMax)
        .sort((a, b) => a.hp / heroStats(a).hpMax - b.hp / heroStats(b).hpMax)[0];
      if (far) {
        far.hp = Math.min(heroStats(far).hpMax, far.hp + heroStats(far).hpMax * pct);
        game.effects.push({ type: 'heal', x: far.x, y: far.y, r: 36, color: '#FF9EC4', ttl: 0.8, max: 0.8 });
        game.discover('h.auco', h.x, h.y);
      }
    }
    game.effects.push({ type: 'petals', x: h.x, y: h.y, r: 180, color: '#FF9EC4', ttl: 1, max: 1 });
    return true;
  },
  mothermountain(game, h, st, n) {
    // đá núi trồi lên hất tung quái: choáng 1 giây, rồi để lại bãi đá làm chậm
    const t = game.findTarget(h.x, h.y, st.range * 1.2, false);
    if (!t) return false;
    for (const e of game.enemiesInRange(t.x, t.y, 80, false)) {
      game.stun(e, e.def.boss ? 0.4 : 1, 'stun');
      game.hit(e, (st.damage * 2 + n) * st.skillPower, h, { color: '#C8A070' });
    }
    game.zones.push({ kind: 'rock', x: t.x, y: t.y, r: 80, ttl: 3.5, max: 3.5, slow: 35, dps: (6 + n * 0.2) * st.skillPower, hero: h, dt: 'magic' });
    game.shake = Math.max(game.shake, 4);
    return true;
  },
  hundredeggs(game, h, st) {
    const t = game.findTarget(h.x, h.y, st.range * 2, false);
    if (!t) return false;
    // ẩn: Lạc Long Quân cùng trên sân thì nở thêm 50% Lạc Tử (chặn lâu hơn)
    const dad = hasLine(h, 'auco') && game.heroes.some((o) => o && !o.dead && o.type === 'llq');
    if (dad) game.discover('h.llq', h.x, h.y);
    game.blocks.push({ kind: 'eggs', dist: Math.min(PATH.total - 40, t.dist + 50), ttl: dad ? 9 : 6, max: dad ? 9 : 6 });
    game.effects.push({ type: 'banner', str: st.skName || 'Bọc Trăm Trứng', color: '#F2E6C8', ttl: 1.6, max: 1.6 });
    return true;
  },
  // ----- Chử Đồng Tử
  staffheal(game, h, st, n) {
    let best = null;
    for (const o of game.heroes) {
      if (!o || o.dead || Math.hypot(o.x - h.x, o.y - h.y) > 200) continue;
      const r = o.hp / heroStats(o).hpMax;
      if (r < 0.75 && (!best || r < best.r)) best = { o, r };
    }
    if (!best) return false;
    const mx = heroStats(best.o).hpMax;
    // ẩn Chử Đồng Tử: tướng sắp gục (dưới 25% máu) được hồi gấp đôi
    const dbl = hasLine(h, 'cdt') && best.r < 0.25;
    if (dbl) game.discover('h.cdt', h.x, h.y);
    best.o.hp = Math.min(mx, best.o.hp + mx * (0.35 + n * 0.003) * skillMult(st.lv || 1) * (dbl ? 2 : 1));
    game.effects.push({ type: 'heal', x: best.o.x, y: best.o.y, r: 40, color: '#9EDDF2', ttl: 0.8, max: 0.8 });
    game.effects.push({ type: 'streak', x: h.x, y: h.y - 40, x2: best.o.x, y2: best.o.y - 30, color: '#9EDDF2', ttl: 0.3, max: 0.3 });
    return true;
  },
  redriver(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range, false);
    if (!list.length) return false;
    game.effects.push({ type: 'wave', x: h.x, y: h.y, r: st.range, color: '#C8604A', ttl: 0.7, max: 0.7 });
    for (const e of list) {
      game.hit(e, (st.damage * 1.5 + n) * st.skillPower, h, { color: '#E07050' });
      if (!e.dead) game.slow(e, 50, 3);
    }
    return true;
  },
  nightcastle(game, h, st) {
    const t = game.findTarget(h.x, h.y, st.range * 2, false);
    if (!t) return false;
    game.blocks.push({ kind: 'wall', dist: Math.min(PATH.total - 40, t.dist + 40), ttl: 6, max: 6 });
    game.effects.push({ type: 'banner', str: st.skName || 'Thành Một Đêm', color: '#C8A878', ttl: 1.6, max: 1.6 });
    game.shake = Math.max(game.shake, 4);
    return true;
  },
  // ----- Tiên Dung
  fan(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range, false);
    if (!list.length) return false;
    game.effects.push({ type: 'gust', x: h.x, y: h.y - 20, r: st.range, color: '#FFC8E0', ttl: 0.6, max: 0.6 });
    for (const e of list) {
      knockback(e, 70);
      game.hit(e, (st.damage * 1.2 + n) * st.skillPower, h, { color: '#FFC8E0' });
    }
    return true;
  },
  lotus(game, h, st, n) {
    // sen hồng nở trên tướng yếu nhất: hồi dần trong 5 giây
    let best = null;
    for (const o of game.heroes) {
      if (!o || o.dead || Math.hypot(o.x - h.x, o.y - h.y) > 200) continue;
      const r = o.hp / heroStats(o).hpMax;
      if (r < 0.8 && (!best || r < best.r)) best = { o, r };
    }
    if (!best) return false;
    best.o.hotT = 5;
    best.o.hotPct = (0.06 + n * 0.0006) * skillMult(st.lv || 1);
    game.effects.push({ type: 'petals', x: best.o.x, y: best.o.y, r: 40, color: '#FF9EC4', ttl: 1, max: 1 });
    return true;
  },
  flowerrain(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.3);
    if (!t) return false;
    game.effects.push({ type: 'banner', str: st.skName || 'Mưa Hoa Tiên', color: '#FFB8D8', ttl: 1.6, max: 1.6 });
    game.effects.push({ type: 'petals', x: t.x, y: t.y, r: 130, color: '#FFB8D8', ttl: 1.4, max: 1.4 });
    for (const e of game.enemiesInRange(t.x, t.y, 130)) game.hit(e, (st.damage * 4 + n * 2) * st.skillPower, h, { big: true, color: '#FFB8D8' });
    healHeroes(game, h.x, h.y, 200, 0.3, '#FFB8D8');
    // ẩn: Chử Đồng Tử được hồi gấp đôi
    const hus = hasLine(h, 'tiendung') && game.heroes.find((o) => o && !o.dead && o.type === 'cdt' && Math.hypot(o.x - h.x, o.y - h.y) <= 200);
    if (hus) {
      hus.hp = Math.min(heroStats(hus).hpMax, hus.hp + heroStats(hus).hpMax * 0.3);
      game.discover('h.tiendung', hus.x, hus.y);
    }
    return true;
  },
  // ===== v29: bộ chiêu riêng cho 4 tướng thần mới + tách các chiêu trùng =====
  // ----- Lạc Hầu
  rally(game, h, st, n) {
    if (!game.enemiesInRange(h.x, h.y, st.range * 1.5).length) return false;
    const pct = Math.round(25 + n * 0.15);
    for (const o of game.heroes) {
      if (!o || o.dead || Math.hypot(o.x - h.x, o.y - h.y) > 180) continue;
      o.rallyT = 5; o.rallyPct = Math.max(o.rallyT > 0 ? o.rallyPct || 0 : 0, pct);
      game.effects.push({ type: 'ring', x: o.x, y: o.y - 22, r: 28, color: '#E25A3A', ttl: 0.6, max: 0.6 });
    }
    game.effects.push({ type: 'ring', x: h.x, y: h.y - 10, r: 180, color: '#D9A84E', ttl: 0.7, max: 0.7 });
    game.text(h.x, h.y - 80, 'Hiệu triệu!', '#FFB04A', 1, 14);
    return true;
  },
  boulder(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.3, false);
    if (!t) return false;
    // tảng đá lăn ngược dòng từ quái đầu tiên về phía cửa sông, đè và đẩy lùi cả hàng
    const d2 = t.dist + 30, d1 = Math.max(0, t.dist - 300);
    game.effects.push({ type: 'skyride', d1: d2, d2: d1, ttl: 0.7, max: 0.7, rock: true });
    for (const e of game.enemies) {
      if (e.dead || isFlying(e) || e.dist < d1 || e.dist > d2) continue;
      game.effects.push({ type: 'none', ttl: 0.1 + 0.5 * (d2 - e.dist) / 330, max: 0.6, onEnd: () => {
        if (e.dead) return;
        knockback(e, 60);
        game.hit(e, (st.damage * 2 + n) * st.skillPower, h, { color: '#C8A070' });
      } });
    }
    game.shake = Math.max(game.shake, 5);
    return true;
  },
  oath(game, h, st, n) {
    const hurt = game.heroes.some((o) => o && !o.dead && o.hp < heroStats(o).hpMax * 0.8);
    if (!hurt && game.enemies.filter((e) => !e.dead).length < 6) return false;
    game.oathT = 6;
    game.effects.push({ type: 'banner', str: st.skName || 'Lời Thề Bộ Lạc', color: '#D9A84E', ttl: 1.6, max: 1.6 });
    for (const o of game.heroes) if (o && !o.dead) game.effects.push({ type: 'dome', x: o.x, y: o.y, r: 34, color: '#D9A84E', ttl: 0.8, max: 0.8 });
    return true;
  },
  // ----- Thần Săn Ba Vì
  venomspear(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.6);
    if (!list.length) return false;
    const e = list.reduce((a, b) => (b.dist > a.dist ? b : a));
    game.effects.push({ type: 'streak', x: h.x, y: h.y - 30, x2: e.x, y2: e.y - 10, color: '#8BD44A', ttl: 0.3, max: 0.3 });
    game.hit(e, (st.damage * 1.5 + n) * st.skillPower, h, { st, big: true, color: '#8BD44A' });
    if (!e.dead) { game.dot(e, (6 + n * 0.25) * st.skillPower, h, '#7FC24A', 'phys', 6); game.slow(e, 35, 3); }
    return true;
  },
  tiger(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.5, false).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp).slice(0, 3);
    if (!list.length) return false;
    list.forEach((e, i) => game.effects.push({ type: 'tiger', x: h.x, y: h.y, target: e, ttl: 0.35 + i * 0.12, max: 0.35 + i * 0.12,
      onEnd: () => {
        if (e.dead) return;
        game.effects.push({ type: 'claw', x: e.x, y: e.y - 10, color: '#F2A23A', ttl: 0.4, max: 0.4 });
        // quái thường dưới 20% máu: hổ vồ chết ngay
        if (!e.def.boss && !e.champion && e.hp < e.maxHp * 0.2) { game.text(e.x, e.y - 30, 'Hổ vồ!', '#F2A23A', 0.9, 15); game.hit(e, e.hp + (e.shield || 0) + 1, h, { dt: 'pure' }); }
        else game.hit(e, (st.damage * 2 + n) * st.skillPower, h, { st, big: true, color: '#F2A23A' });
      } }));
    return true;
  },
  greathunt(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 2);
    if (list.length < 2 && !list.some((e) => e.def.boss)) return false;
    game.effects.push({ type: 'banner', str: st.skName || 'Cuộc Săn Lớn', color: '#E25A3A', ttl: 1.6, max: 1.6 });
    for (const e of list) { e.huntT = 8; game.effects.push({ type: 'mark', target: e, ttl: 0.45, max: 0.45 }); }
    return true;
  },
  // ----- An Dương Vương
  ricochet(game, h, st, n) {
    let e = game.findTarget(h.x, h.y, st.range);
    if (!e) return false;
    const hitList = [];
    let x = h.x, y = h.y - 30, dmg = (st.damage * 1.3 + n * 0.5) * st.skillPower;
    for (let i = 0; i < 5 && e; i++) {
      const tgt = e, dd = dmg, delay = 0.08 + i * 0.09;
      game.effects.push({ type: 'streak', x, y, x2: tgt.x, y2: tgt.y - 10, color: '#FFE08A', ttl: delay + 0.1, max: delay + 0.1,
        onEnd: () => { if (!tgt.dead) game.hit(tgt, dd, h, { st, color: '#FFE08A' }); } });
      hitList.push(e); x = e.x; y = e.y - 10; dmg *= 0.9;
      const from = e;
      e = game.enemies.filter((o) => !o.dead && !hitList.includes(o) && Math.hypot(o.x - from.x, o.y - from.y) <= 160)
        .sort((a, b) => Math.hypot(a.x - from.x, a.y - from.y) - Math.hypot(b.x - from.x, b.y - from.y))[0];
    }
    return true;
  },
  volley(game, h, st, n) {
    if (!game.enemiesInRange(h.x, h.y, st.range).length) return false;
    for (const o of game.heroes) {
      if (!o || o.dead || HEROES[o.type].attack === 'melee' || Math.hypot(o.x - h.x, o.y - h.y) > 220) continue;
      o.volleyT = 6;
      game.effects.push({ type: 'ring', x: o.x, y: o.y - 22, r: 30, color: '#FFE08A', ttl: 0.6, max: 0.6 });
    }
    game.effects.push({ type: 'volley', x: h.x, y: h.y - 30, ttl: 0.35, max: 0.35 });
    game.text(h.x, h.y - 80, 'Lũy nỏ Cổ Loa!', '#FFE08A', 1, 14);
    return true;
  },
  linhquang(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.2);
    if (!t) return false;
    game.effects.push({ type: 'banner', str: st.skName || 'Linh Quang Thần Nỏ', color: '#FFF1C4', ttl: 1.6, max: 1.6 });
    // ba phát xuyên hàng theo hình quạt
    const a0 = Math.atan2(t.y - h.y, t.x - h.x);
    for (const da of [-0.32, 0, 0.32]) {
      const fake = { x: h.x + Math.cos(a0 + da) * 100, y: h.y + Math.sin(a0 + da) * 100 };
      game.lineHit(h, fake, st.range * 2.4, (st.damage * 4 + n * 1.5) * st.skillPower, { color: '#FFF1C4', width: 16, dt: 'pure' });
    }
    game.shake = Math.max(game.shake, 6);
    return true;
  },
  // ----- Mẫu Thượng Ngàn
  vines(game, h, st, n) {
    const list = game.enemiesInRange(h.x, h.y, st.range * 1.2, false).sort((a, b) => b.dist - a.dist).slice(0, 4);
    if (!list.length) return false;
    for (const e of list) {
      game.stun(e, e.def.boss ? 0.5 : 1.6, 'root');
      game.hit(e, (st.damage + n * 0.5) * st.skillPower, h, { color: '#5FD06A' });
    }
    return true;
  },
  sacredtree(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.2, false);
    if (!t && !hurtNear(game, h.x, h.y, 200)) return false;
    const x = t ? (t.x + h.x) / 2 : h.x, y = t ? (t.y + h.y) / 2 : h.y;
    game.zones.push({ kind: 'tree', x, y, r: 110, ttl: 6, max: 6, slow: 30, dps: (4 + n * 0.15) * st.skillPower, hero: h, dt: 'magic',
      heal: { r: 170, pct: 0.03 + n * 0.0003 } });
    return true;
  },
  forestwrath(game, h, st, n) {
    const list = game.enemies.filter((e) => !e.dead && !isFlying(e));
    if (list.length < 3 && !list.some((e) => e.def.boss)) return false;
    game.effects.push({ type: 'banner', str: st.skName || 'Rừng Thiêng Nổi Giận', color: '#5FD06A', ttl: 1.6, max: 1.6 });
    game.effects.push({ type: 'flash', color: '#BFF0A0', ttl: 0.3, max: 0.3 });
    for (const e of list) {
      game.stun(e, e.def.boss ? 0.6 : 1.8, 'root');
      game.hit(e, (st.damage * 2 + n) * st.skillPower, h, { color: '#5FD06A' });
    }
    healHeroes(game, h.x, h.y, 2000, 0.2, '#5FD06A');
    return true;
  },
  // ----- chiêu cũ tách cho khác nhau
  feast(game, h, st, n) {
    if (!game.enemiesInRange(h.x, h.y, 220).length && !hurtNear(game, h.x, h.y, 170)) return false;
    const pct = (0.12 + n * 0.0015) * skillMult(st.lv || 1);
    for (const o of game.heroes) {
      if (!o || o.dead || Math.hypot(o.x - h.x, o.y - h.y) > 170) continue;
      const mx = heroStats(o).hpMax;
      o.hp = Math.min(mx, o.hp + mx * pct);
      o.feastT = 6;
      game.effects.push({ type: 'heal', x: o.x, y: o.y, r: 26, color: '#7FC24A', ttl: 0.7, max: 0.7 });
    }
    game.text(h.x, h.y - 80, 'Bánh chưng!', '#7FC24A', 1, 14);
    return true;
  },
  // ----- Lang Liêu
  banhchung(game, h, st, n) {
    if (!hurtNear(game, h.x, h.y, 170, 0.95) && !game.enemiesInRange(h.x, h.y, 200).length) return false;
    shieldHeroes(game, h.x, h.y, 170, (0.2 + n * 0.0025) * skillMult(st.lv || 1), '#7FC24A');
    game.effects.push({ type: 'dome', x: h.x, y: h.y, r: 170, color: '#7FC24A', ttl: 0.8, max: 0.8 });
    return true;
  },
  ricefield(game, h, st, n) {
    const t = game.findTarget(h.x, h.y, st.range * 1.2, false);
    if (!t) return false;
    game.zones.push({ kind: 'rice', x: t.x, y: t.y, r: 80, ttl: 4, max: 4, slow: 40,
      dps: (8 + n * 0.3) * st.skillPower, hero: h, dt: 'magic' });
    return true;
  },
  ancestor(game, h, st) {
    if (!game.heroes.some((o) => o && !o.dead && o.hp < heroStats(o).hpMax * 0.5)) return false;
    game.effects.push({ type: 'banner', str: st.skName || 'Lễ Tổ Tiên', color: '#FFE08A', ttl: 1.6, max: 1.6 });
    game.effects.push({ type: 'flash', color: '#FFF1C4', ttl: 0.4, max: 0.4 });
    for (const o of game.heroes) {
      if (!o || o.dead) continue;
      o.hp = heroStats(o).hpMax;
      o.invulnT = 2;
      game.effects.push({ type: 'heal', x: o.x, y: o.y, r: 36, color: '#FFE08A', ttl: 0.9, max: 0.9 });
    }
    return true;
  },
};

// mỗi lần Thủy Tinh dâng nước: số ô sát sông nhất bị ngập thêm
const FLOOD_PER_RISE = 2;

// ------------------------------------------------------------
//  TRẠNG THÁI TRẬN
// ------------------------------------------------------------
// chiêu tối thượng (R) xuyên thêm 30% giáp và kháng phép
const ULT_PEN = 30;
// mỗi 10 đợt: quái +1 giáp, +3% kháng phép (quái vốn có kháng phép), tối đa 80%
const ENEMY_GROW = { every: 10, armor: 1, mr: 3, mrCap: 80 };
// hoạt ảnh đánh: swing chạy 1 → 0 với tốc độ này (≈ 0,38 giây); sát thương rơi lúc ra đòn
const SWING_RATE = 2.6;
const STRIKE_DELAY = { melee: 0.13, arrow: 0.12, magic: 0.14, frost: 0.14 };
const IDLE_FX = new Set(['levelup', 'evolve', 'equipflash', 'promote', 'ring', 'summon', 'text', 'proc', 'coin']);

class Game {
  constructor(notify) {
    this.notify = notify || (() => {});
    this.known = new Set();      // hiệu ứng ẩn đã khám phá (lưu vĩnh viễn, UI nạp từ save)
    this.reset(0);
  }

  // Lần đầu một hiệu ứng ẩn xảy ra: hiện "Đã khám phá!" và ghi vào Bí truyền
  discover(key, x, y) {
    if (!SECRETS[key] || this.known.has(key)) return;
    this.known.add(key);
    this.events.push({ type: 'secret', key });
    if (x !== undefined) this.text(x, y - 86, 'Đã khám phá!', '#FFD66B', 1.6, 15);
  }

  // chớp sáng khi hiệu ứng của đồ kích hoạt (giới hạn mỗi nguồn 0,35 giây cho đỡ rối)
  proc(who, key, x, y, color, r = 22) {
    who.procT = who.procT || {};
    if (who.procT[key] > this.time) return;
    who.procT[key] = this.time + 0.35;
    this.effects.push({ type: 'proc', x, y, color, r, ttl: 0.4, max: 0.4 });
  }

  // tướng còn sống đứng kề (cách một ô)
  adjacent(h) {
    return this.heroes.filter((o) => o && o !== h && !o.dead && Math.hypot(o.x - h.x, o.y - h.y) <= ELEM.adj);
  }

  // hệ số hành: tướng đánh quái thuộc hành mình khắc +30%, bị khắc −20%
  elemMult(hero, e) {
    const el = HEROES[hero.type].el;
    if (!el || !e.el) return 0;
    if (EL_KHAC[el] === e.el || (e.el2 && EL_KHAC[el] === e.el2)) return ELEM.khac;
    if (EL_KHAC[e.el] === el) return ELEM.biKhac;
    return 0;
  }

  reset(level) {
    this.offer = null;
    this.market = null;     // v143: chợ tướng (4 thẻ)
    this.level = level || 0;
    this.lv = LEVELS[this.level];
    setMap(this.lv.map || 'song1');
    this.gold = CONFIG.startGold;
    this.lives = CONFIG.startLives;
    this.maxLives = CONFIG.startLives;   // v169: mạng tối đa của trận (hiện "còn/tối đa")
    this.wave = 0;
    this.heroes = CONFIG.slots.map(() => null);
    this.summonN = 0;         // số lần triệu hồi trong ải (giá tăng dần)
    this.enemies = [];
    this.projectiles = [];
    this.effects = [];
    this.zones = [];          // vùng đất có hiệu ứng (vệt lửa, ruộng lúa, đá núi)
    this.blocks = [];         // vật chặn đường (Lạc Tử, Thành Một Đêm)
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.waveActive = false;
    this.over = false;
    this.time = 0;
    this.started = false;
    this.flags = { equipped: false, shopOpened: false };
    this.running = false;
    this.nextWaveT = 0;
    this.nextWave = buildWave(1, this.level);
    this.shake = 0;
    this.bossesKilled = 0;
    this.slHist = [];         // v181: sính lễ đã ra trong trận (chống trùng liên tiếp)
    this.rwHist = '';         // claude/can-bang-phan-thuong: cặp kiểu ô 2, 3 lần thưởng trước
    this.incomes = [];        // Lâu dài: [{ per, left }]
    this.bet = null;          // Rủi ro: { until, lost0, win, lose }
    this.elBuff = {};         // Theo hệ: { hệ: +% sát thương & máu }
    this.lostN = 0; this.lostWave = 0; this.lossLog = [];   // số mạng đã mất (đếm lần lọt), lịch sử đợt có mất mạng
    this.seen = {};
    this.endless = true;      // v166: chỉ còn chế độ vô tận (đơn và nhóm)
    this.won = false;
    this.guardT = 0;
    this.oathT = 0;
    // Nước Dâng
    this.water = 0;           // số bậc đã ngập (0..3)
    this.raised = CONFIG.slots.map(() => false);   // ô đã Mọc Núi (khô vĩnh viễn)
    this.tempFlood = CONFIG.slots.map(() => 0);    // ngập tạm tới thời điểm
    this.moc = 1;                                   // lượt Mọc Núi còn lại
    // Núi Tản Viên
    this.mountain = { growth: 0, soiled: false, herbs: 0 };
    this.xpLog = {};          // v95: Tu Vi kiếm trong trận này (theo loại tướng)
    this.stats = { kills: 0, goldEarned: 0, goldRefund: 0 };
    this.khoRun = 0;          // v103: Ngân khố nhận giữa trận (vô tận)
    this.events = [];
    // Đồ khởi đầu để thử ngay việc thay đổi hình dạng
    this.inventory = ['mu_long_chim', 'ao_vai', 'riu_dong', 'no_tre', 'gay_mo'].map((id) => makeItem(id));
    this.jarCount = 0;
    this.rollShop();
  }

  get levelWaves() { return this.lv.waves; }

  // ẩn khi thành nguy: Thánh Gióng Vươn Vai tối đa (≤ 5 mạng), Kim Quy tự hộ thành (1 mạng)
  // v169: cộng mạng — hồi phần đã mất trước, phần dư nâng luôn mạng tối đa (20/20 +1 → 21/21; 18/20 +1 → 19/20)
  gainLives(n) {
    this.lives += n;
    this.maxLives = Math.max(this.maxLives || CONFIG.startLives, this.lives);
  }
  livesLost() {
    for (const h of this.heroes) {
      if (!h || h.dead) continue;
      if (h.type === 'giong' && this.lives <= 5 && this.lives > 0 && h.grow < 10) {
        h.grow = 10;
        this.text(h.x, h.y - 80, 'Vươn Vai!', '#FFB04A', 1.2, 17);
        this.discover('h.giong', h.x, h.y);
      }
      if (h.type === 'kimquy' && this.lives === 1 && !h.autoGuard) {
        h.autoGuard = true;
        this.guardT = 5;
        this.effects.push({ type: 'banner', str: 'Kim Quy Hộ Thành', color: '#FFD66B', ttl: 1.6, max: 1.6 });
        this.discover('h.kimquy', h.x, h.y);
      }
    }
  }

  // ---------- Nước Dâng
  isFlooded(slot) {
    return false;      // v36: bỏ cơ chế ngập ô
  }
  // ô sẽ ngập ở lần nước dâng tới (nhấp nháy xanh)
  floodNext(slot) {
    const r = CONFIG.slotRank[slot];
    return this.floodSoon() >= 0 && r >= this.water * FLOOD_PER_RISE && r < (this.water + 1) * FLOOD_PER_RISE;
  }
  // lần dâng nước sắp tới (đợt boss) hoặc -1
  floodSoon() {
    const boss = this.waveActive ? bossAt(this.wave, this.level) : bossAt(this.wave + 1, this.level);
    return -1;
  }
  mocMax() { return this.mountainStage() >= 4 ? 2 : 1; }
  canRaise(slot) {
    return !this.raised[slot];
  }
  raiseSpot(slot) {
    if (this.moc <= 0) return 'Hết lượt Mọc Núi (mỗi đợt nạp lại)';
    if (this.raised[slot]) return 'Ô này đã là núi';
    this.raised[slot] = true;
    this.tempFlood[slot] = 0;
    this.moc--;
    const [x, y] = CONFIG.slots[slot];
    this.effects.push({ type: 'raise', x, y, ttl: 0.9, max: 0.9 });
    this.effects.push({ type: 'ring', x, y, r: 40, color: '#F2D27A', ttl: 0.6, max: 0.6 });
    this.shake = Math.max(this.shake, 3);
    return true;
  }
  riseWater() {
    return;            // v36: bỏ nước dâng ngập ô (mực nước chỉ còn là hình nền)
    this.water++;
    this.effects.push({ type: 'floodrise', ttl: 1.6, max: 1.6 });
    this.events.push({ type: 'flood', level: this.water });
    this.notify(`Thủy Tinh dâng nước! ${FLOOD_PER_RISE} ô sát sông nhất bị ngập (dùng Mọc Núi để cứu)`, '#5AB4D6');
  }

  // ---------- hành động của người chơi
  legendCount() {
    return this.heroes.filter((h) => h && HEROES[h.type].legend === 'legendary').length;   // số tướng Vàng (Huyền thoại) trên sân — không giới hạn
  }
  canPlace(slot, type) {
    const def = HEROES[type];
    if (this.heroes[slot]) return 'Ô đã có tướng';
    if (this.isFlooded(slot)) return 'Ô đang ngập: dùng Mọc Núi để cứu ô này';
    if (def.legend) return 'Tướng huyền thoại có được bằng Thăng thần từ tướng cơ bản ★★★';
    if (this.gold < def.cost) return `Cần ${def.cost} vàng`;
    return true;
  }
  placeHero(slot, type) {
    if (this.canPlace(slot, type) !== true) return false;
    const def = HEROES[type];
    this.gold -= def.cost;
    const [x, y] = CONFIG.slots[slot];
    const h = {
      id: newId(), type, slot, x, y, kills: 0, level: 1, cd: 0, swing: 0, dir: 1,
      dead: false, respawnT: 0, stunT: 0, hp: 0, mana: 0, skillLv: { [def.skills[0].id]: 1 }, skillPts: 0,
      tier: 0, spent: def.cost, grow: 0, shield: 0, shieldT: 0, invulnT: 0, reviveCd: 0,
      equip: { weapon: null, helmet: null, armor: null, acc1: null, acc2: null, acc3: null },
      skillCd: {}, buff: {}, summonT: 0.5, notice: {},
    };
    this.heroes[slot] = h;
    this.updateAuras();
    h.hp = heroStats(h).hpMax;
    h.mana = heroStats(h).maxMana * 0.5;
    this.effects.push({ type: 'summon', x, y, ttl: 0.6, max: 0.6 });
    return true;
  }

  // ---------- TRIỆU HỒI NGẪU NHIÊN · GHÉP SAO · HỢP THỂ (v34)
  summonCost() { return COSTS.summon(this.summonN || 0); }
  freeSlots() { return CONFIG.slots.map((_, i) => i).filter((i) => !this.heroes[i] && !this.isFlooded(i) && (!this.co || this.co.canAct(this.co.actor, i))); }
  canSummon() {
    if (this.gold < this.summonCost()) return `Cần ${this.summonCost()} vàng`;
    if (!this.freeSlots().length) return 'Hết ô trống: ghép, hoặc kéo tướng vào 🗑 để hủy';
    return true;
  }
  // v143: CHỢ TƯỚNG — luôn mở 4 thẻ (v180: rút từ mọi tướng Thường đã mở; claude/bo-chon-doi: bỏ đội ưu tiên). Chạm thẻ = mua & đặt ngay, kéo thẻ = đặt đúng ô.
  // Mua thẻ nào thì chỗ đó ra thẻ mới; đầu mỗi đợt cả hàng làm mới miễn phí (trừ khi đang 🔒 khoá); ↻ đổi cả hàng tốn vàng (tăng dần trong đợt).
  // v180: rút có trọng số theo nhu cầu (xem MARKET_W / MARKET_PITY / MARKET_CAP trong data.js).
  // số bản sao ★ quy đổi của loại t trên sân người đang chơi (★ = 1, ★★ = 2, ★★★ = 4)
  marketCopies(t) {
    let n = 0;
    for (const h of this.heroes) if (h && h.type === t && !h.from && (!this.co || this.co.canAct(this.co.actor, h.slot))) n += Math.pow(2, Math.max(0, (h.tier || 1) - 1));
    return n;
  }
  // nhu cầu từng loại: ghep = đang có trên sân, chưa đủ bản sao; hop = nguyên liệu còn thiếu của công thức hợp thể
  // gần xong (bên kia đã đủ ★★ quy đổi, đã sở hữu tướng đích); top = loại bảo hiểm nhắm tới
  // claude/bo-chon-doi: hết đội ưu tiên để lọc → chỉ giữ MARKET_HOP.max công thức gần xong nhất (không thì nhiều công thức
  // "gần xong" cùng lúc, loãng): bên thiếu đã có trên sân → bên kia nhiều bản sao hơn → bên thiếu nhiều bản sao hơn → thứ tự trong FUSION
  // v185: chỉ tướng Thường đã mở khoá bằng Ngân khố (owned = null: bot mô phỏng → mọi tướng)
  marketPool() { return openCommons(this.owned); }
  marketNeeds() {
    const pool = this.marketPool(), cp = {}, ghep = new Set(), hop = new Set(), cand = [];
    for (const t of pool) cp[t] = this.marketCopies(t);
    for (const t of pool) if (cp[t] > 0 && cp[t] < MARKET_CAP) ghep.add(t);
    // v186: hợp thể cần ★★★ (4 bản sao) — vẫn bắt đầu ưu tiên khi bên kia đã ★★ (2 bản sao), ưu tiên bên thiếu tới khi đủ ★★★
    const need = Math.pow(2, COSTS.ascendTier - 1), half = Math.min(2, need);
    for (const f of FUSION) {
      if (!pool.includes(f.a) || !pool.includes(f.b) || !this.ownsHero(f.to)) continue;
      for (const [x, y] of [[f.a, f.b], [f.b, f.a]]) if (cp[x] >= half && cp[y] < need && cp[y] <= cp[x]) cand.push({ y, k: (cp[y] > 0 ? 100 : 0) + cp[x] * 8 + cp[y], i: cand.length });
    }
    cand.sort((a, b) => b.k - a.k || a.i - b.i);
    let off = 0;
    for (const c of cand) {
      if (hop.size >= MARKET_HOP.max || hop.has(c.y) || (cp[c.y] === 0 && off >= MARKET_HOP.off)) continue;
      hop.add(c.y); if (cp[c.y] === 0) off++;
    }
    const w = {};
    for (const t of pool) w[t] = cp[t] >= MARKET_CAP ? 0 : hop.has(t) ? MARKET_W.hop : ghep.has(t) ? MARKET_W.ghep : 1;
    if (pool.every((t) => !w[t])) for (const t of pool) w[t] = 1;     // đủ hết bản sao: rút đều như cũ
    const top = hop.size ? hop : ghep;
    return { pool, w, ghep, hop, top };
  }
  // nhãn gợi ý trên thẻ: 'hop' = nguyên liệu hợp thể còn thiếu
  marketHint(t, nd = this.marketNeeds()) { return nd.hop.has(t) ? 'hop' : null; }
  rollCard(rng = srand, nd = this.marketNeeds(), only = null) {
    const list = only ? nd.pool.filter((t) => only.has(t) && nd.w[t] > 0) : nd.pool.filter((t) => nd.w[t] > 0);
    const sum = list.reduce((a, t) => a + nd.w[t], 0);
    let r = rng() * sum;
    for (const t of list) { r -= nd.w[t]; if (r < 0) return t; }
    return list[list.length - 1];
  }
  // rút cả hàng (đầu đợt / ↻): đủ MARKET_PITY lần liền không có tướng cần nhất thì thẻ đầu chắc chắn là nó
  rollMarket(rng = srand) {
    const old = this.market || {}, nd = this.marketNeeds();
    const types = Array.from({ length: MARKET_SIZE }, () => this.rollCard(rng, nd));
    let dry = old.dry || 0;
    if (nd.top.size) {
      if (dry >= MARKET_PITY && !types.some((t) => nd.top.has(t))) types[Math.floor(rng() * MARKET_SIZE)] = this.rollCard(rng, nd, nd.top);
      dry = types.some((t) => nd.top.has(t)) ? 0 : dry + 1;
    } else dry = 0;
    this.market = { types, rr: old.rr || 0, dry, lock: false };
    return this.market;
  }
  ensureMarket() {
    const m = this.market, pool = this.marketPool();
    if (SIM.coop && !SIM.active && m) return m;     // co-op: giao diện không được tự rút lại chợ (lệch seed)
    if (!m || !Array.isArray(m.types) || m.types.length !== MARKET_SIZE || m.types.some((t) => !pool.includes(t))) this.rollMarket();
    return this.market;
  }
  // đầu đợt mới: làm mới cả hàng miễn phí (hàng đang 🔒 khoá thì giữ nguyên một lượt rồi mở khoá), giá ↻ về lại từ đầu
  freshMarket() {
    const one = () => {
      const m = this.market, pool = this.marketPool();
      if (m && m.lock && Array.isArray(m.types) && m.types.length === MARKET_SIZE && m.types.every((t) => pool.includes(t))) { m.lock = false; m.rr = 0; return; }
      this.rollMarket(); this.market.rr = 0;
    };
    // co-op: mỗi người một hàng chợ riêng (rút theo tướng đã mở và sân của mình) — làm mới cả hai
    if (this.co) {
      const a = this.co.actor;
      for (let p = 0; p < this.co.pl.length; p++) { this.co.actor = p; one(); }
      this.co.actor = a;
      return;
    }
    one();
  }
  // v180: 🔒 khoá chợ — giữ nguyên 4 thẻ sang đợt sau (đổi ↻ thì mở khoá)
  toggleMarketLock() {
    const m = this.ensureMarket();
    m.lock = !m.lock;
    return true;
  }
  rerollCost() { return 10 + 10 * ((this.market && this.market.rr) || 0); }
  rerollMarket(rng = srand) {
    this.ensureMarket();
    const c = this.rerollCost();
    if (this.gold < c) return `Cần ${c} vàng để đổi`;
    this.gold -= c;
    const rr = this.market.rr + 1;
    this.rollMarket(rng);
    this.market.rr = rr;
    return true;
  }
  // tướng ★ trên sân ghép được với thẻ loại `type` (mua về là ghép ngay được)
  marketTwin(type) { return this.heroes.find((h) => h && h.type === type && (h.tier || 0) === 1 && !h.from && !HEROES[h.type].legend && (!this.co || this.co.canAct(this.co.actor, h.slot))) || null; }
  // mua thẻ i: slot bỏ trống = tự chọn ô trống ngẫu nhiên (hết ô thì ghép vào tướng ★ cùng loại nếu có).
  // slot là ô trống = đặt đúng ô; slot có tướng ★ cùng loại = ghép luôn. Trả về ô của tướng nhận, hoặc chuỗi lỗi.
  buyCard(i, slot, rng = srand) {
    const m = this.ensureMarket(), type = m.types[i];
    if (!type) return 'Không có thẻ';
    const c = this.summonCost();
    if (this.gold < c) return `Cần ${c} vàng`;
    let target = null;
    if (slot == null || slot < 0) {
      const free = this.freeSlots();
      if (free.length) slot = free[Math.floor(rng() * free.length)];
      else { target = this.marketTwin(type); if (!target) return 'Hết ô trống: ghép, hoặc kéo tướng vào 🗑 để hủy'; slot = target.slot; }
    } else if (this.heroes[slot]) {
      target = this.heroes[slot];
      if (!(target.type === type && (target.tier || 0) === 1 && !target.from)) return target.type === type ? 'Chỉ ghép thẻ ★ với tướng ★ cùng loại' : 'Ô đã có tướng';
    } else if (this.isFlooded(slot) || !CONFIG.slots[slot]) return 'Không đặt được ở ô này';
    this.gold -= c;
    this.summonN = (this.summonN || 0) + 1;
    m.types[i] = null;
    if (!target) { this.spawnHero(slot, type, { tier: 1, spent: c }); m.types[i] = this.rollCard(rng); return slot; }
    // ghép thẳng vào tướng ★ cùng loại: tạo tướng tạm ở chỗ thừa cuối mảng rồi ghép như kéo thả
    const k = this.heroes.length;
    const a = this.spawnHero(k, type, { tier: 1, spent: c }, target);
    this.merge(k, target.slot);
    this.heroes.length = CONFIG.slots.length;
    this.updateAuras();
    m.types[i] = this.rollCard(rng);     // thẻ bù rút theo sân mới (vừa mua xong)
    return target.slot;
  }
  // gọi 1 tướng Thường ngẫu nhiên (★) vào 1 ô trống ngẫu nhiên; trả về ô vừa đặt
  summonRandom(rng = srand) {
    const ok = this.canSummon();
    if (ok !== true) return ok;
    const free = this.freeSlots();
    const slot = free[Math.floor(rng() * free.length)];
    const pool = this.marketPool();
    const type = pool[Math.floor(rng() * pool.length)];
    const c = this.summonCost();
    this.gold -= c;
    this.summonN = (this.summonN || 0) + 1;
    this.spawnHero(slot, type, { tier: 1, spent: c });
    return slot;
  }
  // tạo tướng ở ô (không trừ vàng)
  spawnHero(slot, type, o = {}, at = null) {
    const def = HEROES[type];
    const [x, y] = at ? [at.x, at.y] : CONFIG.slots[slot];
    const h = {
      id: newId(), type, slot, x, y, kills: 0, level: 1, cd: 0, swing: 0, dir: 1,
      dead: false, respawnT: 0, stunT: 0, hp: 0, mana: 0, skillLv: { [def.skills[0].id]: 1 }, skillPts: 0,
      tier: o.tier || 0, spent: o.spent || 0, grow: 0, shield: 0, shieldT: 0, invulnT: 0, reviveCd: 0,
      equip: { weapon: null, helmet: null, armor: null, acc1: null, acc2: null, acc3: null },
      skillCd: {}, buff: {}, summonT: 0.5, notice: {},
    };
    this.heroes[slot] = h;
    this.updateAuras();
    h.hp = heroStats(h).hpMax;
    h.mana = heroStats(h).maxMana * 0.5;
    this.effects.push({ type: 'summon', x, y, ttl: 0.6, max: 0.6 });
    return h;
  }
  // ghép đồ của tướng bị ghép vào tướng còn lại (ô trống thì mặc vào, còn lại cất túi)
  absorbGear(keep, gone) {
    for (const s of SLOTS) {
      const it = gone.equip[s];
      if (!it) continue;
      if (!keep.equip[s] && (!ITEMS[it.id].wclass || ITEMS[it.id].wclass === HEROES[keep.type].wclass)) keep.equip[s] = it;
      else this.addItem(it, true);
      gone.equip[s] = null;
    }
  }
  // gộp cấp / điểm / kỹ năng: lấy bên cao hơn
  absorbProgress(keep, gone) {
    if (gone.level > keep.level) { keep.level = gone.level; keep.skillPts = gone.skillPts; }
    keep.statPts = Math.max(keep.statPts || 0, gone.statPts || 0);
    keep.train = Math.max(keep.train || 0, gone.train || 0);
    keep.kills = (keep.kills || 0) + (gone.kills || 0);
    keep.spent = (keep.spent || 0) + (gone.spent || 0);
  }
  // 2 tướng cùng loại cùng sao → lên 1 sao
  canMerge(a, b) {
    if (!a || !b || a === b) return 'Chọn 2 tướng';
    if (a.type !== b.type) return 'Chỉ ghép được 2 tướng cùng loại';
    if (a.from || b.from || HEROES[a.type].legend) return 'Tướng thần lên sao bằng Thần tinh';
    if ((a.tier || 0) !== (b.tier || 0)) return 'Chỉ ghép 2 tướng cùng số sao';
    if ((a.tier || 0) >= 3) return 'Đã ★★★: hợp thể với tướng khác để lên thần';
    return true;
  }
  merge(fromSlot, toSlot) {
    const a = this.heroes[fromSlot], b = this.heroes[toSlot];
    const ok = this.canMerge(a, b);
    if (ok !== true) return ok;
    const before = heroStats(b).hpMax;
    for (const sk of HEROES[b.type].skills) b.skillLv[sk.id] = Math.max(b.skillLv[sk.id] || 0, a.skillLv[sk.id] || 0) || undefined;
    for (const k in b.skillLv) if (!b.skillLv[k]) delete b.skillLv[k];
    this.absorbProgress(b, a);
    this.absorbGear(b, a);
    this.heroes[fromSlot] = null;
    b.tier = (b.tier || 0) + 1;
    b.evoT = 1.2;
    if (!b.dead) b.hp = Math.min(heroStats(b).hpMax, b.hp + heroStats(b).hpMax - before + heroStats(b).hpMax * 0.3);
    this.effects.push({ type: 'evolve', hero: b, x: b.x, y: b.y, color: ELEMENTS[HEROES[b.type].el].color, ttl: 1.2, max: 1.2 });
    this.effects.push({ type: 'streak', x: a.x, y: a.y - 30, x2: b.x, y2: b.y - 30, color: '#FFE08A', ttl: 0.35, max: 0.35 });
    this.notify(`${HEROES[b.type].name} lên ${'★'.repeat(b.tier)}!${b.tier >= 3 && COSTS.lvDisc3 < 1 ? ` Lên cấp giảm ${Math.round((1 - COSTS.lvDisc3) * 100)}%` : ''}`, '#F2D27A');
    b.notice.evo = b.tier >= 3;
    return true;
  }
  // ghép tự động mọi cặp cùng loại cùng sao (★ trước), trả về số lần ghép
  autoMerge() {
    let n = 0, again = true;
    while (again) {
      again = false;
      const hs = this.heroes.filter((h) => h && !h.from && (h.tier || 0) < 3).sort((a, b) => (a.tier || 0) - (b.tier || 0) || b.level - a.level);
      for (const a of hs) {
        const b = hs.find((o) => o !== a && this.canMerge(o, a) === true);
        if (b) { this.merge(b.slot, a.slot); n++; again = true; break; }
      }
    }
    return n;
  }
  // tiến độ một công thức hợp thể (0..1) và cặp tốt nhất hiện có
  fusionProgress(f) {
    const score = (type) => {
      const hs = this.heroes.filter((h) => h && h.type === type);
      if (!hs.length) return { p: 0, h: null };
      const best = hs.slice().sort((x, y) => (y.tier || 0) - (x.tier || 0) || y.level - x.level)[0];
      const need = this.ascendNeed(best);
      // sao: tướng Thường cộng dồn theo số ★ quy đổi (★★★ = 4 con ★); tướng thần theo Thần tinh
      const starP = best.from ? (best.tier || 0) / need : Math.min(1, hs.reduce((a, h) => a + Math.pow(2, Math.max(0, (h.tier || 1) - 1)), 0) / Math.pow(2, need - 1));
      const sk = HEROES[type].skills.reduce((a, s, i) => a + Math.min(SKILL_MAX[i], skillLevel(best, i)), 0) / SKILL_MAX.reduce((a, b) => a + b, 0);
      const ready = this.fusionReady(best) === true;
      // v180: cả tướng Thường lẫn tướng thần đều tính kỹ năng (hợp thể cần kỹ năng tối đa)
      return { p: ready ? 1 : Math.min(0.99, starP * 0.7 + sk * 0.3), h: best };
    };
    const A = score(f.a), B = score(f.b);
    return { p: (A.p + B.p) / 2, a: A.h, b: B.h };
  }

  // 2 tướng ★★★ đúng công thức (đủ kỹ năng) → thần mới
  fusionReady(h) {
    if ((h.tier || 0) < this.ascendNeed(h)) return h.from ? `${HEROES[h.type].name} cần Thần tinh ${'★'.repeat(COSTS.ascendTier2)}` : `${HEROES[h.type].name} cần ${'★'.repeat(COSTS.ascendTier)}`;
    // v180: bỏ ngoại lệ v136 — ra tướng Tím cũng phải nâng hết kỹ năng cả 2 tướng Thường
    const left = this.skillsLeft(h);
    if (left.length) return `${HEROES[h.type].name} còn thiếu ${this.skillGap(h)} cấp kỹ năng: ${left.map(([k, lv, mx]) => `${k} ${lv}/${mx}`).join(', ')}`;
    return true;
  }
  // số cấp kỹ năng còn thiếu tới tối đa (0 = đã nâng hết)
  skillGap(h) { return this.skillsLeft(h).reduce((a, [, lv, mx]) => a + mx - lv, 0); }
  // tài khoản đã mua tướng này chưa (owned = null: không giới hạn, ví dụ bot mô phỏng)
  ownsHero(t) { return !this.owned || !HEROES[t].legend || this.owned.has(t); }
  canFuse(a, b) {
    if (!a || !b || a === b) return 'Chọn 2 tướng';
    const f = fusionFor(a.type, b.type);
    if (!f) return 'Hai tướng này không có công thức hợp thể';
    if (!this.ownsHero(f.to)) return `Chưa sở hữu ${HEROES[f.to].name} — mua ở Anh Hùng (menu ≡)`;
    for (const h of [a, b]) { const r = this.fusionReady(h); if (r !== true) return r; }
    const d = HEROES[f.to];
    const c = COSTS.ascend[d.legend];
    if (this.gold < c) return `Cần ${c} vàng`;
    return f;
  }
  fusePreview(a, b) {
    const f = fusionFor(a.type, b.type);
    if (!f) return 0;
    const lineage = [...heroLineage(a), { type: a.type, skillLv: { ...a.skillLv }, tier: a.tier || 0 },
      ...heroLineage(b), { type: b.type, skillLv: { ...b.skillLv }, tier: b.tier || 0 }];
    return heroPower({ ...b, level: Math.max(a.level, b.level), lineage, from: b.type, tier: 0, type: f.to, skillLv: { [HEROES[f.to].skills[0].id]: 1 }, buff: b.buff || {} });
  }
  fuse(fromSlot, toSlot) {
    const a = this.heroes[fromSlot], b = this.heroes[toSlot];
    const f = this.canFuse(a, b);
    if (typeof f === 'string') return f;
    const d = HEROES[f.to];
    const c = COSTS.ascend[d.legend];
    const fromName = `${HEROES[a.type].name} + ${HEROES[b.type].name}`;
    const before = heroStats(b).hpMax;
    this.gold -= c;
    b.spent = (b.spent || 0) + c;
    b.lineage = [...heroLineage(a), { type: a.type, skillLv: { ...a.skillLv }, tier: a.tier || 0 },
      ...heroLineage(b), { type: b.type, skillLv: { ...b.skillLv }, tier: b.tier || 0 }];
    delete b.skillLvFrom;
    b.from = b.type;
    b.baseTier = 3;
    b.tier = 0;
    b.type = f.to;
    b.skillLv = { [d.skills[0].id]: 1 };
    b.skillCd = {};
    b.grow = 0;
    b.shotN = 0;
    this.absorbProgress(b, a);
    // đổi hệ vũ khí (ví dụ rìu + gậy → gậy): đồ không hợp thì cất túi
    for (const s of SLOTS) { const it = b.equip[s]; if (it && ITEMS[it.id].wclass && ITEMS[it.id].wclass !== d.wclass) { this.addItem(it, true); b.equip[s] = null; } }
    this.absorbGear(b, a);
    this.heroes[fromSlot] = null;
    if (!b.dead) b.hp = Math.max(1, Math.min(heroStats(b).hpMax, b.hp + heroStats(b).hpMax - before));
    b.evoT = 1.2;
    b.notice.evo = false;
    this.shake = Math.max(this.shake, d.legend === 'legendary' ? 9 : 6);
    this.effects.push({ type: 'streak', x: a.x, y: a.y - 30, x2: b.x, y2: b.y - 30, color: d.color || '#FFE08A', ttl: 0.45, max: 0.45 });
    this.effects.push({ type: 'evolve', hero: b, x: b.x, y: b.y, color: d.color || ELEMENTS[d.el].color, big: true, ttl: 1.2, max: 1.2 });
    this.events.push({ type: 'ascend', from: fromName, to: d.name, hero: b });
    return true;
  }

  // Kéo tướng sang ô khác: ô trống thì chuyển, ô có tướng thì đổi chỗ
  moveHero(from, to) {
    if (this.heroes[from]) this.heroes[from].still = 0;
    if (from === to || !this.heroes[from]) return false;
    const a = this.heroes[from], b = this.heroes[to];
    this.heroes[to] = a;
    this.heroes[from] = b;
    for (const [h, slot] of [[a, to], [b, from]]) {
      if (!h) continue;
      h.slot = slot;
      [h.x, h.y] = CONFIG.slots[slot];
      this.effects.push({ type: 'ring', x: h.x, y: h.y - 15, r: 34, color: '#9dffc4', ttl: 0.4, max: 0.4 });
    }
    return true;
  }

  sellValue(h) { return Math.floor(h.spent * CONFIG.sellRatio); }
  sellHero(slot) {
    const h = this.heroes[slot];
    if (!h) return;
    for (const s of SLOTS) if (h.equip[s]) this.addItem(h.equip[s], true);
    const back = this.sellValue(h);
    this.gold += back;
    this.stats.goldRefund += back;
    this.heroes[slot] = null;
  }

  // Nâng cấp tướng bằng vàng: +1 cấp, +1 điểm kỹ năng
  levelCost(h) { return Math.round(COSTS.level(h.level) * (!h.from && (h.tier || 0) >= 3 ? COSTS.lvDisc3 : 1)); }
  levelUp(h) {
    if (h.level >= CONFIG.maxLevel) return 'Tướng đã đạt cấp tối đa';
    const c = this.levelCost(h);
    if (this.gold < c) return `Cần ${c} vàng`;
    const before = heroStats(h).hpMax;
    this.gold -= c;
    h.spent += c;
    h.level++;
    h.skillPts++;
    if (!h.dead) h.hp += heroStats(h).hpMax - before;
    this.levelFx(h, 1);
    return true;
  }

  // Hiệu ứng lên cấp: vòng trống đồng dưới chân, nảy 4px, chữ "Cấp N" (0,6 giây).
  // Lên nhiều cấp liền thì gộp một hiệu ứng, chữ "+N cấp". Không dừng đòn đánh.
  levelFx(h, n) {
    h.bounceT = 0.3;
    const f = this.effects.find((e) => e.type === 'levelup' && e.hero === h);
    if (f) { f.count += n; f.lv = h.level; f.ttl = f.max; }
    else this.effects.push({ type: 'levelup', hero: h, x: h.x, y: h.y, count: n, lv: h.level, ttl: 0.6, max: 0.6 });
    // vừa đủ cấp mở E/R hoặc tiến hoá: nhắc trên nút ⋯
    const from = h.level - n;
    const hit = (lv) => lv > from && lv <= h.level;
    if (COSTS.unlockReq.some((lv, i) => lv > 1 && hit(lv) && !skillLevel(h, i))) h.notice.skills = true;
    const t = h.tier || 0;
    if (t < 3 && hit(evoReq(h, t))) h.notice.evo = true;
  }

  // Lóe sáng màu độ hiếm tại chỗ món đồ (tay, đầu, thân)
  gearFx(h, slot, color, type) {
    const at = slot === 'weapon' ? [h.x + 10 * (h.dir || 1), h.y - 34] : slot === 'helmet' ? [h.x, h.y - 60] : [h.x, h.y - 36];
    this.effects.push({ type, hero: h, x: at[0], y: at[1], color, ttl: type === 'promote' ? 0.6 : 0.3, max: type === 'promote' ? 0.6 : 0.3 });
  }

  // Luyện thể (tướng cấp 25): +3 thuộc tính chính, +1 thuộc tính phụ mỗi lần
  trainCost(h) { return COSTS.train(h.train || 0); }
  trainHero(h) {
    if (h.level < CONFIG.maxLevel) return `Cần tướng cấp ${CONFIG.maxLevel}`;
    const c = this.trainCost(h);
    if (this.gold < c) return `Cần ${c} vàng`;
    const before = heroStats(h).hpMax;
    this.gold -= c;
    h.spent += c;
    h.train = (h.train || 0) + 1;
    if (!h.dead) h.hp += heroStats(h).hpMax - before;
    h.bounceT = 0.3;
    this.text(h.x, h.y - 70, `Luyện thể ✦${h.train}`, '#FFD66B', 1, 15);
    this.effects.push({ type: 'levelup', hero: h, x: h.x, y: h.y, count: 1, lv: h.level, train: h.train, ttl: 0.6, max: 0.6 });
    return true;
  }

  // Mở khóa kỹ năng W/E/R bằng vàng
  unlockSkill(h, i) {
    const sk = HEROES[h.type].skills[i];
    if (skillLevel(h, i)) return 'Kỹ năng đã mở';
    if (h.level < COSTS.unlockReq[i]) return `Cần tướng cấp ${COSTS.unlockReq[i]}`;
    const c = unlockCost(h, i);
    if (this.gold < c) return `Cần ${c} vàng`;
    this.gold -= c;
    h.spent += c;
    h.skillLv[sk.id] = 1;
    h.unlockFx = { i, at: this.time };
    if (i >= 2) h.notice.skills = false;
    this.effects.push({ type: 'ring', x: h.x, y: h.y - 20, r: 50, color: '#A86CE0', ttl: 0.6, max: 0.6 });
    return true;
  }

  // Nâng kỹ năng bằng điểm kỹ năng
  upgradeSkill(h, i) {
    const sk = HEROES[h.type].skills[i];
    const lv = skillLevel(h, i);
    if (!lv) return 'Mở khóa kỹ năng trước';
    if (lv >= SKILL_MAX[i]) return 'Kỹ năng đã đạt cấp tối đa';
    if (h.level < skillReqLevel(i, lv + 1)) return `Cần tướng cấp ${skillReqLevel(i, lv + 1)}`;
    if (h.from) {
      // tướng đã thăng thần: nâng kỹ năng bằng vàng
      const c = COSTS.skillGold(i, lv);
      if (this.gold < c) return `Cần ${c} vàng`;
      this.gold -= c;
      h.spent += c;
    } else {
      if (h.skillPts <= 0) return 'Chưa có điểm kỹ năng (nâng cấp tướng để nhận)';
      h.skillPts--;
    }
    h.skillLv[sk.id] = lv + 1;
    this.effects.push({ type: 'ring', x: h.x, y: h.y - 20, r: 40, color: '#F2D27A', ttl: 0.5, max: 0.5 });
    return true;
  }

  // Điểm kỹ năng thừa đổi thành thuộc tính chính (+2 mỗi điểm)
  spendStat(h) {
    if (h.skillPts <= 0) return 'Chưa có điểm kỹ năng';
    const before = heroStats(h).hpMax;
    h.skillPts--;
    h.statPts = (h.statPts || 0) + 1;
    if (!h.dead) h.hp += Math.max(0, heroStats(h).hpMax - before);
    this.text(h.x, h.y - 70, `+${COSTS.statPt} ${ATTRS[heroMain(HEROES[h.type])].short}`, ELEMENTS[HEROES[h.type].el].color, 0.9, 14);
    return true;
  }
  // còn kỹ năng nào nâng được bằng điểm không (để gợi ý dùng điểm vào chỉ số)
  canSpendSkillPts(h) {
    if (h.from) return false;
    return HEROES[h.type].skills.some((sk, i) => { const lv = skillLevel(h, i); return lv && lv < SKILL_MAX[i] && h.level >= skillReqLevel(i, lv + 1); });
  }

  // Tiến hoá bằng vàng, lần lượt từng bậc
  evolve(h) {
    if (!h.from) return 'Ghép 2 tướng giống nhau cùng sao để lên sao';
    const t = h.tier || 0;
    if (t >= 3) return 'Đã đạt bậc cao nhất';
    if (h.level < evoReq(h, t)) return `Cần tướng cấp ${evoReq(h, t)}`;
    const c = evoCost(h, t);
    if (this.gold < c) return `Cần ${c} vàng`;
    this.gold -= c;
    h.spent += c;
    h.tier = t + 1;
    this.notify(`${HEROES[h.type].name} ${h.from ? 'đạt Thần tinh' : 'tiến hoá lên'} ${'★'.repeat(h.tier)}!`, h.from ? '#FF8A4A' : '#F2D27A');
    h.evoT = 1.2;
    h.notice.evo = this.ascendReady(h) === true;   // nhắc Thăng thần
    this.effects.push({ type: 'evolve', hero: h, x: h.x, y: h.y, color: ELEMENTS[HEROES[h.type].el].color, ttl: 1.2, max: 1.2 });
    return true;
  }

  // Thăng thần: tướng Thường ★★★ hóa thân thần Sử thi; thần Sử thi Thần tinh ★★ hóa thân Huyền thoại
  ascendNeed(h) { return h.from ? COSTS.ascendTier2 : COSTS.ascendTier; }
  // kỹ năng chưa đạt tối đa (điều kiện thăng thần; nâng chỉ số bằng điểm thừa thì không bắt buộc)
  skillsLeft(h) {
    return HEROES[h.type].skills.map((sk, i) => [SKILL_KEYS[i], skillLevel(h, i), SKILL_MAX[i]]).filter(([, lv, mx]) => lv < mx);
  }
  // đủ sao + đủ kỹ năng để thăng thần (chưa tính vàng / giới hạn Huyền thoại)
  ascendReady(h) {
    if (!ASCEND[h.type]) return 'Đã là bậc cao nhất';
    if ((h.tier || 0) < this.ascendNeed(h)) return h.from ? `Cần Thần tinh ${'★'.repeat(COSTS.ascendTier2)} trước` : `Cần tiến hoá ${'★'.repeat(COSTS.ascendTier)} trước`;
    const left = this.skillsLeft(h);
    if (left.length) return `Cần nâng tối đa kỹ năng: ${left.map(([k, lv, mx]) => `${k} ${lv}/${mx}`).join(', ')}`;
    return true;
  }
  canAscend(h, to) {
    if (!(ASCEND[h.type] || []).includes(to)) return 'Không thể thăng thần theo nhánh này';
    if (!this.ownsHero(to)) return `Chưa sở hữu ${HEROES[to].name} — mua ở Anh Hùng (menu ≡)`;
    const ready = this.ascendReady(h);
    if (ready !== true) return ready;
    const d = HEROES[to];
    const c = COSTS.ascend[d.legend];
    if (this.gold < c) return `Cần ${c} vàng`;
    return true;
  }
  // bản sao tướng sau khi hóa thân thành `to` (dùng cho ascend và xem trước lực chiến)
  ascendState(h, to) {
    const lineage = [...heroLineage(h), { type: h.type, skillLv: { ...h.skillLv }, tier: h.tier || 0 }];
    return { lineage, from: h.type, baseTier: lineage[0].tier, tier: 0, type: to, skillLv: { [HEROES[to].skills[0].id]: 1 } };
  }
  // lực chiến nếu thăng thần thành `to` (để so trước khi bấm)
  ascendPreview(h, to) {
    return heroPower({ ...h, ...this.ascendState(h, to), buff: h.buff || {} });
  }
  ascend(h, to) {
    const ok = this.canAscend(h, to);
    if (ok !== true) return ok;
    const from = HEROES[h.type], d = HEROES[to];
    const c = COSTS.ascend[d.legend];
    const before = heroStats(h).hpMax;
    this.gold -= c;
    h.spent += c;
    // Q cấp 1, W/E/R mở khóa và nâng bằng vàng; Thần tinh tiến hoá lại từ đầu
    Object.assign(h, this.ascendState(h, to));
    delete h.skillLvFrom;
    h.skillCd = {};
    h.grow = 0;
    h.shotN = 0;
    if (!h.dead) h.hp = Math.max(1, h.hp + heroStats(h).hpMax - before);
    h.evoT = 1.2;
    h.notice.evo = false;
    this.shake = Math.max(this.shake, d.legend === 'legendary' ? 9 : 6);
    this.effects.push({ type: 'evolve', hero: h, x: h.x, y: h.y, color: d.color || ELEMENTS[d.el].color, big: true, ttl: 1.2, max: 1.2 });
    this.events.push({ type: 'ascend', from: from.name, to: d.name, hero: h });
    return true;
  }

  // ---------- túi đồ
  addItem(inst, silent) {
    if (typeof inst === 'string') inst = makeItem(inst, null, { drop: true });
    if (this.inventory.length >= CONFIG.bagSize) {
      const v = scrapValue(inst);
      this.addGold(v);
      if (!silent) this.notify(`Túi đầy: ${ITEMS[inst.id].name} tự đổi ra ${v} vàng`, '#E8E0CC');
      return null;
    }
    this.inventory.push(inst);
    return inst;
  }
  invIndex(uid) { return this.inventory.findIndex((i) => i.uid === uid); }

  // Trả về true nếu mặc được, ngược lại là câu báo lỗi
  equip(h, uid, forceSlot) {
    const idx = this.invIndex(uid);
    if (idx < 0) return 'Không tìm thấy món đồ';
    const inst = this.inventory[idx];
    const it = ITEMS[inst.id];
    if (!canEquip(h.type, inst.id)) return `Vũ khí này dành cho tướng dùng ${WCLASS_NAMES[it.wclass]}`;
    let slot = it.slot;
    if (slot === 'acc') {
      slot = forceSlot || ACC_SLOTS.find((s) => !h.equip[s]);
      if (!slot) return 'Hết ô phụ kiện. Tháo bớt một món trước';
    }
    const before = heroStats(h).hpMax;
    const hadSets = activeSets(h.equip);
    this.inventory.splice(idx, 1);
    if (h.equip[slot]) this.inventory.push(h.equip[slot]);
    h.equip[slot] = inst;
    if (!h.dead) h.hp += Math.max(0, heroStats(h).hpMax - before);
    this.flags.equipped = true;
    this.gearFx(h, slot, RARITY[inst.rarity].color, 'equipflash');
    const done = activeSets(h.equip).find((k) => !hadSets.includes(k));
    if (done) {
      // vừa đủ bộ: hiệu ứng sau lưng bung ra, rung nhẹ, chữ giữa màn (1,5 giây)
      h.wingT = 1.5;
      this.shake = Math.max(this.shake, 4);
      this.events.push({ type: 'setDone', name: SETS[done].name + (SETS[done].el === HEROES[h.type].el ? ' · Thiên mệnh' : ''), hero: h });
    }
    return true;
  }

  // Tự mặc đồ tốt nhất từ túi (lặp tới khi không còn món nào làm tăng lực chiến)
  autoEquip(h) {
    let changed = 0;
    for (let guard = 0; guard < 12; guard++) {
      let best = null, bg = 0;
      for (const inst of this.inventory) {
        const g = upgradeGain(h, inst);
        if (g > bg) { bg = g; best = inst; }
      }
      if (!best || this.equip(h, best.uid, slotFor(h, best)) !== true) break;
      changed++;
    }
    return changed;
  }
  // Mặc đồ cả đội: tướng mạnh trước (Vàng → Tím → nhiều sao → lực chiến cao) chọn món hợp nhất;
  // đồ bị thay ra trả về túi để tướng yếu hơn dùng tiếp.
  autoEquipAll() {
    const rank = { legendary: 2, epic: 1 };
    const list = this.heroes.filter((h) => h && !h.dead)
      .sort((a, b) => (rank[HEROES[b.type].legend] || 0) - (rank[HEROES[a.type].legend] || 0)
        || (b.tier || 0) - (a.tier || 0) || heroPower(b) - heroPower(a));
    let items = 0, heroes = 0;
    for (const h of list) {
      const n = this.autoEquip(h);
      if (n) { items += n; heroes++; }
    }
    return { items, heroes };
  }
  // Nâng đồ tự động: dùng vàng cường hóa / thăng phẩm đồ đang mặc, ưu tiên tướng mạnh (Vàng → Tím → sao)
  // và món tăng lực chiến nhiều nhất trên mỗi đồng vàng. Chừa lại đủ vàng cho 1 lần triệu hồi.
  autoUpgradeGear(keep) {
    const reserve = keep ?? COSTS.summon(this.summonN || 0);
    const rank = { legendary: 3, epic: 2 };
    let n = 0, spent = 0;
    for (let guard = 0; guard < 60; guard++) {
      let best = null, bs = 0;
      for (const h of this.heroes) {
        if (!h || h.dead) continue;
        const pri = (rank[HEROES[h.type].legend] || 1) + (h.tier || 0) * 0.3;
        const p0 = heroPower(h);
        for (const sl of SLOTS) {
          const inst = h.equip[sl];
          if (!inst) continue;
          let c, act;
          if (inst.plus < 5) { c = enhanceCost(inst); act = 'enhance'; }
          else if (RARITY_ORDER.indexOf(inst.rarity) < RARITY_ORDER.length - 1) { c = promoteCost(inst); act = 'promote'; }
          else continue;
          if (this.gold - c < reserve) continue;
          // thử tạm để đo lực chiến tăng thêm
          const save = [inst.plus, inst.rarity];
          if (act === 'enhance') inst.plus++; else { inst.rarity = RARITY_ORDER[RARITY_ORDER.indexOf(inst.rarity) + 1]; inst.plus = 0; }
          const gain = heroPower(h) - p0;
          [inst.plus, inst.rarity] = save;
          const score = (gain * pri) / c;
          if (gain > 0 && score > bs) { bs = score; best = { inst, act, c }; }
        }
      }
      if (!best) break;
      const r = best.act === 'enhance' ? this.enhance(best.inst.uid) : this.promote(best.inst.uid);
      if (r !== true) break;
      n++; spent += best.c;
    }
    return { n, spent };
  }
  // tướng nào trên sân mặc món này lợi nhất
  bestHeroFor(inst) {
    let best = null, bg = 0;
    for (const h of this.heroes) {
      if (!h) continue;
      const g = upgradeGain(h, inst);
      if (g > bg) { bg = g; best = h; }
    }
    return best ? { hero: best, gain: bg } : null;
  }

  unequip(h, slot) {
    if (!h.equip[slot]) return 'Ô trống';
    if (this.inventory.length >= CONFIG.bagSize) return 'Túi đầy';
    this.inventory.push(h.equip[slot]);
    h.equip[slot] = null;
    h.hp = Math.min(h.hp, heroStats(h).hpMax);
    return true;
  }

  // tìm món theo uid trong túi hoặc trên tướng
  findItem(uid) {
    const inv = this.inventory.find((i) => i.uid === uid);
    if (inv) return { inst: inv, hero: null };
    for (const h of this.heroes) {
      if (!h) continue;
      for (const s of SLOTS) if (h.equip[s] && h.equip[s].uid === uid) return { inst: h.equip[s], hero: h, slot: s };
    }
    return null;
  }

  enhance(uid) {
    const f = this.findItem(uid);
    if (!f) return 'Không tìm thấy món đồ';
    const inst = f.inst;
    if (inst.plus >= 5) return 'Đã cường hóa tối đa +5';
    const c = enhanceCost(inst);
    if (this.gold < c) return `Cần ${c} vàng`;
    this.gold -= c;
    inst.spent += c;
    inst.plus++;
    return true;
  }

  promote(uid) {
    const f = this.findItem(uid);
    if (!f) return 'Không tìm thấy món đồ';
    const inst = f.inst;
    if (inst.plus < 5) return 'Cần cường hóa đủ +5 để thăng phẩm';
    const nextR = RARITY_ORDER[RARITY_ORDER.indexOf(inst.rarity) + 1];
    if (!nextR) return 'Đồ Huyền thoại +5 là tối đa';
    const c = promoteCost(inst);
    if (this.gold < c) return `Cần ${c} vàng`;
    this.gold -= c;
    inst.spent += c;
    inst.rarity = nextR;
    inst.plus = 0;
    rollHidden(inst);
    if (inst.aff && inst.aff.length && inst.aff.length < AFFIX_COUNT[nextR]) inst.aff = rollAffixes(inst.aff, AFFIX_COUNT[nextR]);
    if (f.hero) this.gearFx(f.hero, f.slot, RARITY[nextR].color, 'promote');
    return true;
  }

  // Tôi luyện: đồ Huyền thoại +5, mỗi lần +3% chỉ số gốc. ✦5: dòng phụ +50%; ✦10: hiệu ứng ẩn thứ hai
  temper(uid) {
    const f = this.findItem(uid);
    if (!f) return 'Không tìm thấy món đồ';
    const inst = f.inst;
    if (inst.rarity !== 'legendary' || inst.plus < 5) return 'Chỉ đồ Huyền thoại +5 mới Tôi luyện được';
    const c = COSTS.temper(inst.temper || 0);
    if (this.gold < c) return `Cần ${c} vàng`;
    this.gold -= c;
    inst.spent += c;
    inst.temper = (inst.temper || 0) + 1;
    if (f.hero) this.gearFx(f.hero, f.slot, '#FFD66B', 'promote');
    return true;
  }

  // Tẩy luyện: rút lại dòng phụ. 50 vàng, mỗi lần sau gấp đôi, tối đa 400
  reroll(uid) {
    const f = this.findItem(uid);
    if (!f) return 'Không tìm thấy món đồ';
    const inst = f.inst;
    if (!inst.aff || !inst.aff.length) return 'Món này không có dòng phụ';
    if (inst.locked) return 'Mở khóa món đồ trước khi tẩy luyện';
    const c = COSTS.reroll(inst.rerolls || 0);
    if (this.gold < c) return `Cần ${c} vàng`;
    this.gold -= c;
    inst.spent += c;
    inst.rerolls = (inst.rerolls || 0) + 1;
    inst.aff = rollAffixes([], inst.aff.length);
    return true;
  }

  toggleLock(uid) {
    const f = this.findItem(uid);
    if (f) f.inst.locked = !f.inst.locked;
  }

  scrap(uid) {
    const idx = this.invIndex(uid);
    if (idx < 0) return 'Chỉ đổi được đồ trong túi';
    const inst = this.inventory[idx];
    if (inst.locked) return 'Món đồ đang khóa';
    const v = scrapValue(inst);
    this.inventory.splice(idx, 1);
    this.addGold(v);
    return v;
  }

  // Đổi hàng loạt theo bộ lọc chất lượng
  scrapList(filter) {
    return this.inventory.filter((i) => filter.rarities.includes(i.rarity) && !i.locked &&
      !(filter.skipUpgraded && i.spent > 0));
  }
  scrapMany(filter) {
    const list = this.scrapList(filter);
    let total = 0;
    for (const inst of list) {
      total += scrapValue(inst);
      this.inventory.splice(this.inventory.indexOf(inst), 1);
    }
    this.addGold(total);
    return { count: list.length, gold: total };
  }

  sortBag() {
    const r = (i) => -RARITY_ORDER.indexOf(i.rarity);
    const s = (i) => ['weapon', 'helmet', 'armor', 'acc'].indexOf(ITEMS[i.id].slot);
    this.inventory.sort((a, b) => r(a) - r(b) || s(a) - s(b) || b.plus - a.plus || a.id.localeCompare(b.id));
  }

  // Hũ báu: kind = 'small' | 'big' | 'king'. Mở đủ JAR_PITY hũ thì hũ kế chắc chắn Sử thi+
  buyChest(kind = 'small') {
    const j = JARS.find((x) => x.id === kind) || JARS[0];
    if (this.gold < j.cost) return null;
    if (this.inventory.length >= CONFIG.bagSize) return null;
    this.gold -= j.cost;
    this.jarCount = (this.jarCount || 0) + 1;
    let min = j.min;
    if (this.jarCount >= JAR_PITY && RARITY_ORDER.indexOf(min) < 2) { min = 'epic'; }
    const id = j.set && srand() < j.set ? rollSetItem() : rollItem(min);
    const inst = makeItem(id, null, { drop: true });
    if (RARITY_ORDER.indexOf(inst.rarity) >= 2) this.jarCount = 0;
    return this.addItem(inst);
  }

  // ---------- Cửa hàng: 6 món, làm mới mỗi đợt
  rollShop(prep) {
    const w = prep ? SHOP.prepWeights : SHOP.weights(this.wave);
    const total = w.reduce((a, b) => a + b, 0);
    const out = [];
    for (let i = 0; i < SHOP.slots; i++) {
      if (srand() < SHOP.accChance) {
        const accs = Object.keys(ITEMS).filter((id) => ITEMS[id].price);
        const id = pick(accs);
        out.push({ inst: makeItem(id), price: ITEMS[id].price * (prep ? 2 : 1) });
        continue;
      }
      let r = srand() * total, k = 0;
      while (k < 3 && r > w[k]) { r -= w[k]; k++; }
      const rar = RARITY_ORDER[k];
      const pool = Object.keys(ITEMS).filter((id) => GEAR_SLOTS.includes(ITEMS[id].slot) && !ITEMS[id].set && !ITEMS[id].bossOnly
        && RARITY_ORDER.indexOf(ITEMS[id].rarity) <= k);
      const inst = makeItem(pick(pool), rar, { drop: true });
      out.push({ inst, price: (prep ? SHOP.prepPrice : SHOP.price)[rar] });
    }
    this.shop = out;
    this.shopRerolls = 0;
  }
  rerollShop() {
    const c = SHOP.reroll(this.shopRerolls || 0);
    if (this.gold < c) return `Cần ${c} vàng`;
    this.gold -= c;
    const n = (this.shopRerolls || 0) + 1;
    this.rollShop();
    this.shopRerolls = n;
    return true;
  }
  buyShop(i) {
    const o = this.shop && this.shop[i];
    if (!o || o.sold) return 'Món này đã bán';
    if (this.gold < o.price) return `Cần ${o.price} vàng`;
    if (this.inventory.length >= CONFIG.bagSize) return 'Túi đầy';
    this.gold -= o.price;
    o.sold = true;
    return this.addItem(o.inst) || 'Túi đầy';
  }

  // Ghép nhanh: mua phụ kiện còn thiếu rồi đúc luôn
  quickCraftCost(id) {
    const miss = this.missingParts(id);
    if (miss.some((p) => !ITEMS[p].price)) return null;
    return miss.reduce((a, p) => a + ITEMS[p].price, 0) + ITEMS[id].recipe.cost;
  }
  quickCraft(id) {
    const c = this.quickCraftCost(id);
    if (c === null) return 'Thiếu nguyên liệu không mua được';
    if (this.gold < c) return `Cần ${c} vàng`;
    const miss = this.missingParts(id);
    if (this.inventory.length + miss.length > CONFIG.bagSize) return 'Túi đầy';
    for (const p of miss) this.buy(p);
    return this.craft(id) || 'Không ghép được';
  }

  buy(id) {
    const it = ITEMS[id];
    if (!it.price || this.gold < it.price) return false;
    if (this.inventory.length >= CONFIG.bagSize) return false;
    this.gold -= it.price;
    return this.addItem(id);
  }

  // Ghép đồ: cần đủ nguyên liệu trong túi (không tính món đã khóa) + vàng
  countOwned(id) { return this.inventory.filter((i) => i.id === id && !i.locked).length; }
  missingParts(id) {
    const left = this.inventory.filter((i) => !i.locked).map((i) => i.id);
    const missing = [];
    for (const p of ITEMS[id].recipe.parts) {
      const i = left.indexOf(p);
      if (i < 0) missing.push(p); else left.splice(i, 1);
    }
    return missing;
  }

  craft(id) {
    const r = ITEMS[id].recipe;
    if (this.missingParts(id).length || this.gold < r.cost) return false;
    for (const p of r.parts) {
      // ưu tiên dùng món chưa nâng cấp
      const cands = this.inventory.filter((i) => i.id === p && !i.locked).sort((a, b) => a.spent - b.spent);
      this.inventory.splice(this.inventory.indexOf(cands[0]), 1);
    }
    this.gold -= r.cost;
    return this.addItem(id);
  }

  startWave() {
    if (this.waveActive || this.over) return;
    this.wave++;
    this.freshMarket();   // v143: đầu đợt mới chợ tướng làm mới miễn phí
    this.spawnQueue = this.nextWave;
    this.waveTotal = this.spawnQueue.length;
    this.nextWave = buildWave(this.wave + 1, this.level);
    this.spawnTimer = 0;
    this.waveActive = true;
    // ẩn Trống Đồng: gõ trống đầu đợt, mọi tướng +20% tốc đánh 5 giây
    const drummer = this.heroes.find((h) => h && !h.dead && ACC_SLOTS.some((sl) => h.equip[sl] && h.equip[sl].id === 'trong_dong'));
    if (drummer) {
      for (const h of this.heroes) if (h) h.warT = 5;
      this.effects.push({ type: 'ring', x: drummer.x, y: drummer.y, r: 220, color: '#F2D27A', ttl: 0.8, max: 0.8 });
      this.discover('r.trong_dong', drummer.x, drummer.y);
    }
    for (const h of this.heroes) if (h) { h.blockUsed = false; h.gbdUsed = false; h.lgRevUsed = false; }
    // Thần khí: khiên đầu đợt
    for (const h of this.heroes) if (h && !h.dead && LEGACY[h.type] && legacyOf(h)) {
      const st = heroStats(h);
      if (st.lg.waveShield) { h.shield = Math.max(h.shield || 0, st.hpMax * st.lg.waveShield / 100); h.shieldT = 8; }
    }
    // Ấn Giáp Đá: khiên đầu đợt
    for (const h of this.heroes) if (h && !h.dead && runeFx(h) && runeFx(h).sk.n_shield) {
      h.shield = Math.max(h.shield || 0, heroStats(h).hpMax * runeFx(h).sk.n_shield / 100); h.shieldT = 8;
      this.effects.push({ type: 'ring', x: h.x, y: h.y - 22, r: 30, color: '#D9844A', ttl: 0.6, max: 0.6 });
    }
  }

  // Gọi sớm: giữa hai đợt thì bắt đầu ngay; đang trong đợt thì dồn đợt kế vào luôn
  earlyBonus() {
    if (this.wave === 0) return 0;
    return this.waveActive ? 30 + this.wave * 3 : 10 + Math.round(Math.max(0, this.nextWaveT) * 4);
  }

  callEarly() {
    if (this.over || (this.wave >= this.levelWaves && !this.endless)) return 0;
    const bonus = this.earlyBonus();
    this.addGold(bonus);
    if (this.waveActive) {
      this.wave++;
      this.freshMarket();
      this.spawnQueue = this.spawnQueue.concat(this.nextWave);
      this.waveTotal += this.nextWave.length;
      this.nextWave = buildWave(this.wave + 1, this.level);
    } else {
      this.startWave();
    }
    return bonus;
  }

  addGold(n) {
    // co-op: vàng do trận sinh ra (hạ quái, xong đợt, núi…) chia đôi; vàng từ lệnh (bán đồ, gọi sớm) về người ra lệnh
    if (this.co && !this.co.inCmd) this.co.split(n);
    else this.gold += n;
    this.stats.goldEarned += n;
  }

  // ---------- Núi Tản Viên
  mountainStage() {
    return Math.min(MOUNTAIN.stages.length, 1 + Math.floor(this.mountain.growth / MOUNTAIN.stageWaves));
  }
  mountainProgress() {
    if (this.mountainStage() >= MOUNTAIN.stages.length) return 1;
    return (this.mountain.growth % MOUNTAIN.stageWaves) / MOUNTAIN.stageWaves;
  }

  soilMountain() {
    if (this.mountain.soiled) return 'Đợt này đã bồi đất (mỗi đợt 1 lần)';
    if (this.gold < MOUNTAIN.soilCost) return `Cần ${MOUNTAIN.soilCost} vàng`;
    if (this.mountainStage() >= MOUNTAIN.stages.length) return 'Núi đã cao tối đa';
    this.gold -= MOUNTAIN.soilCost;
    this.mountain.soiled = true;
    this.mountain.growth++;
    return true;
  }

  harvestHerbs() {
    const n = this.mountain.herbs;
    if (!n) return 0;
    this.mountain.herbs = 0;
    this.stats.herbs = (this.stats.herbs || 0) + n;
    this.addGold(n * MOUNTAIN.herbGold);
    for (const h of this.heroes) {
      if (h && !h.dead) h.hp = Math.min(heroStats(h).hpMax, h.hp + heroStats(h).hpMax * 0.25 * n);
    }
    return n;
  }

  // v163: chữ "núi cao" (Sơn Tinh dời non) chỉ hợp chương Sơn Tinh – Thủy Tinh; chương khác / vô tận dùng chữ trung tính
  sonTinh() { return !this.endless && (typeof chapterOf !== 'function' || chapterOf(this.level).id === 'sontinh'); }

  growMountain() {
    const m = this.mountain;
    m.growth++;
    m.soiled = false;
    const st = this.mountainStage();
    const gold = st * MOUNTAIN.goldPerStage;
    this.addGold(gold);
    if (st >= 2 && this.wave % 3 === 0) { this.gainLives(1); this.notify(this.sonTinh() ? 'Núi cao che thành: +1 mạng' : 'Thành vững thêm: +1 mạng', '#6AE06A'); }
    // v92: bỏ màn Núi Tản Viên — núi tự cao theo đợt (vàng, mạng, thêm lượt Mọc Núi), không còn Linh Chi
    return gold;
  }

  // ---------- truy vấn
  enemiesInRange(x, y, r, air = true) {
    return this.enemies.filter((e) => !e.dead && (air || !isFlying(e)) && Math.hypot(e.x - x, e.y - y) <= r);
  }

  // Ưu tiên quái đi xa nhất (gần thành nhất)
  findTarget(x, y, r, air = true) {
    let best = null;
    for (const e of this.enemies) {
      if (e.dead || (!air && isFlying(e)) || Math.hypot(e.x - x, e.y - y) > r) continue;
      if (!best || e.dist > best.dist) best = e;
    }
    return best;
  }

  get boss() {
    return this.enemies.find((e) => (e.def.boss || e.champion) && !e.dead) || null;
  }

  // Sát thương theo đường thẳng từ tướng qua mục tiêu
  lineHit(h, t, len, dmg, o) {
    const d = Math.hypot(t.x - h.x, t.y - h.y) || 1;
    const dx = (t.x - h.x) / d, dy = (t.y - h.y) / d;
    const x1 = h.x, y1 = h.y - 28, x2 = h.x + dx * len, y2 = h.y - 28 + dy * len;
    this.effects.push({ type: o.bolt ? 'beam' : 'streak', x: x1, y: y1, x2, y2, color: o.color, w: o.width, ttl: 0.45, max: 0.45 });
    const w = o.width || 18;
    for (const e of this.enemies) {
      if (e.dead) continue;
      const k = Math.max(0, Math.min(1, ((e.x - x1) * (x2 - x1) + (e.y - 8 - y1) * (y2 - y1)) / (len * len)));
      if (Math.hypot(x1 + (x2 - x1) * k - e.x, y1 + (y2 - y1) * k - (e.y - 8)) < w) {
        if (o.stun) this.stun(e, e.def.boss ? o.stun / 2 : o.stun, 'stun');
        this.hit(e, dmg, h, { big: true, color: o.color, dt: o.dt });
      }
    }
  }

  // ---------- hào quang & đặc trưng tướng (tính lại mỗi khung hình)
  updateAuras() {
    const list = this.heroes.filter((h) => h);
    const owns = new Map();
    for (const h of list) {
      h.buff = {};
      h.flooded = this.isFlooded(h.slot);
      h.bogged = false;
      owns.set(h, heroStatsNoAura(h));
    }
    const near = (a, b, r) => a !== b && Math.hypot(a.x - b.x, a.y - b.y) <= r;
    // Ngũ hành: tương sinh khi đứng kề, đủ 5 hành trên sân
    const alive = list.filter((h) => !h.dead);
    const els = new Set(alive.map((h) => HEROES[h.type].el));
    const full = els.size >= 5;
    if (full && !this.fullEl) this.notify('Ngũ hành tề tựu! Toàn quân +10% sát thương', '#FFD66B');
    this.fullEl = full;
    // v182: cộng hưởng vai trò (2 / 4 tướng khác loại cùng vai trò chính)
    const tiers = typeof roleTiers === 'function' ? roleTiers(roleCounts(alive)) : {};
    for (const r in tiers) if (tiers[r] > ((this.vtTiers || {})[r] || 0)) this.notify(`Cộng hưởng ${ROLES[r].name} ${tiers[r] * 2}: ${ROLE_SYN[r].t[tiers[r] - 1]}`, ROLES[r].color);
    this.vtTiers = tiers;
    const airWave = this.waveActive && waveKind(this.wave, this.level) === 'air';
    for (const h of alive) {
      const el = HEROES[h.type].el;
      h.buff.sinh = Math.min(ELEM.sinhMax, alive.filter((o) => near(h, o, ELEM.adj) && EL_SINH[HEROES[o.type].el] === el).length);
      h.buff.full = full;
      if (this.elBuff && this.elBuff[el]) h.buff.elPct = this.elBuff[el];   // claude/can-bang-phan-thuong: thưởng Theo hệ
      h.buff.vt = typeof roleSynStats === 'function' ? roleSynStats(h.type, tiers) : null;
      h.buff.tamGioi = els.size >= 3;
      h.buff.airWave = airWave;
      const own = owns.get(h);
      if (own.hid['r.gay_tam_gioi'] && els.size >= 3) this.discover('r.gay_tam_gioi', h.x, h.y);
      if (own.hid['r.cung_mat_chim'] && airWave) this.discover('r.cung_mat_chim', h.x, h.y);
      if (own.hid['i.moc2'] && (h.still || 0) >= 10) this.discover('i.moc2', h.x, h.y);
      h.buff.thuyAdj = alive.some((o) => near(h, o, ELEM.adj) && HEROES[o.type].el === 'thuy');
      if (own.hid['i.thuy1'] && h.buff.thuyAdj) this.discover('i.thuy1', h.x, h.y);
      // ẩn Lạc Long Quân: đứng kề Âu Cơ thì cả hai −10% sát thương
      if ((h.type === 'llq' || h.type === 'auco') && alive.some((o) => o.type === (h.type === 'llq' ? 'auco' : 'llq') && near(h, o, ELEM.adj))) {
        h.buff.llqPen = true;
        this.discover('h.llq', h.x, h.y);
      }
    }
    for (const src of list) {
      if (src.dead) continue;
      const t = src.type;
      const own = owns.get(src);
      // Bộ Trống Đồng: hào quang +10% sát thương trong 2 ô (gấp đôi 5 giây khi có tướng dùng R)
      if (own.drumAura) {
        const v = own.drumAura * (src.drumBoostT > 0 ? 2 : 1);
        for (const o of alive) if (o === src || near(src, o, 140)) o.buff.drum = Math.max(o.buff.drum || 0, v);
      }
      // ẩn đồ hành Thổ "Núi che chở": đứng ô Cao, tướng kề giảm 10% sát thương nhận
      if (own.hid['i.tho2'] && (src.still || 0) >= 10) {
        for (const o of alive) if (near(src, o, ELEM.adj)) { o.buff.dr = Math.max(o.buff.dr || 0, 10); this.discover('i.tho2', src.x, src.y); }
      }
      for (const o of list) {
        if (o.dead) continue;
        const b = o.buff;
        // Trống Đồng: +20% tốc đánh cho tướng xung quanh (cả bản thân)
        if (own.hasteAura && (o === src || near(src, o, 170))) b.haste = Math.max(b.haste || 0, own.hasteAura);
        if (t === 'kinhduong') b.drum = Math.max(b.drum || 0, 8);                       // Vua Xích Quỷ: toàn quân +8% sát thương
        if (t === 'kylan') b.pierce = Math.max(b.pierce || 0, 15);                      // Điềm Lành: toàn quân +15% xuyên giáp
        if (!near(src, o, 170)) continue;
        if (t === 'kimquy' && near(src, o, 110)) b.dr = Math.max(b.dr || 0, 30);
        if (t === 'lachau' && near(src, o, ELEM.adj)) {
          const high = this.adjacent(src).length >= 2;
          b.dr = Math.max(b.dr || 0, high ? 25 : 15);
          if (high) this.discover('h.lachau', src.x, src.y);
        }
        if (t === 'mau') {
          // ẩn: đứng kề tướng hành Mộc thì hào quang gấp đôi
          const k = alive.some((x) => x !== src && HEROES[x.type].el === 'moc' && near(src, x, ELEM.adj)) ? 2 : 1;
          if (k > 1) this.discover('h.mau', src.x, src.y);
          b.forest = Math.max(b.forest || 0, 10 * k);
          b.regen = Math.max(b.regen || 0, 2 * k);
        }
        if (t === 'trongdong') b.haste = Math.max(b.haste || 0, 10);                    // Hồi Trống Thiêng
        if (t === 'mauthoai') b.manaPct = Math.max(b.manaPct || 0, 15);                 // Thủy Cung Thánh Mẫu
        if (t === 'thocong') b.dr = Math.max(b.dr || 0, 10);                            // Giữ Đất Giữ Nhà
        if (t === 'melua') b.forest = Math.max(b.forest || 0, 10);                      // Mùa Vàng
        if (t === 'maudia') b.hpPct = Math.max(b.hpPct || 0, 10);                       // Địa Tiên Thánh Mẫu
        if (t === 'longnu') { b.magicPct = Math.max(b.magicPct || 0, 10); b.manaPct = Math.max(b.manaPct || 0, 10); }   // Ngọc Long Nữ
        if (t === 'caong' && o !== src && near(src, o, ELEM.adj)) b.dr = Math.max(b.dr || 0, 10);   // Hộ Ngư Dân
        if (own.pierceAura) b.pierce = Math.max(b.pierce || 0, own.pierceAura);
        if (t === 'thachsanh') b.manaPct = Math.max(b.manaPct || 0, 50);
        if (t === 'auco') b.healPct = Math.max(b.healPct || 0, 2);
        if (own.magicAura) b.magicPct = (b.magicPct || 0) + own.magicAura;
        if (t === 'langlieu') b.hpPct = Math.max(b.hpPct || 0, 10);
        if (own.regenAura) b.regen = Math.max(b.regen || 0, own.regenAura);
        if (own.blockAura) b.block = Math.max(b.block || 0, own.blockAura);
      }
      // Đôi Uyên Ương
      if ((t === 'tiendung' || t === 'cdt') && list.some((o) => !o.dead && o.type === (t === 'cdt' ? 'tiendung' : 'cdt') && near(src, o, 140))) {
        src.buff.magicPct = (src.buff.magicPct || 0) + 20;
        src.buff.pair = true;
      }
    }
  }

  // ---------- vòng lặp
  update(dt) {
    if (this.over) return;
    this.time += dt;
    this.shake = Math.max(0, this.shake - dt * 30);
    if (this.guardT > 0) this.guardT -= dt;
    if (this.oathT > 0) this.oathT -= dt;
    if (!this.waveActive && (this.wave < this.levelWaves || this.endless)) {
      this.nextWaveT -= dt;
      if (this.nextWaveT <= 0) this.startWave();
    }
    this.updateAuras();
    this.updateSpawns(dt);
    this.updateZones(dt);
    this.auraBosses = this.enemies.filter((e) => !e.dead && e.def.speedAura);
    for (const e of this.enemies.slice()) this.updateEnemy(e, dt);
    for (const h of this.heroes) if (h) this.updateHero(h, dt);
    this.updateProjectiles(dt);
    this.updateEffects(dt);
    this.enemies = this.enemies.filter((e) => !e.dead);
    this.blocks = this.blocks.filter((b) => (b.ttl -= dt) > 0);

    if (this.waveActive && !this.spawnQueue.length && !this.enemies.length) this.waveComplete();
  }

  waveComplete() {
    this.waveActive = false;
    this.nextWaveT = CONFIG.waveBreak;
    const bonus = 20 + this.wave * 5;
    this.addGold(bonus);
    const mGold = this.growMountain();
    let extra = 0;
    for (const h of this.heroes) {
      if (!h) continue;
      if (h.type === 'giong' && h.grow < 10) { h.grow++; this.text(h.x, h.y - 80, 'Vươn Vai!', '#FFB04A', 1.2); }
      if (h.type === 'antiem') extra += 20;
      // ẩn: sau đợt 20, 10% mỗi đợt "dưa vàng" / "bồ lúa vàng" +100 vàng
      if (this.wave > 20 && h.type === 'antiem' && srand() < 0.1) {
        extra += 100; this.text(h.x, h.y - 80, 'Dưa vàng! +100', '#FFD66B', 1.4, 15); this.discover('h.antiem', h.x, h.y);
      }
      if (this.wave > 20 && ACC_SLOTS.some((sl) => h.equip[sl] && h.equip[sl].id === 'bo_lua') && srand() < 0.1) {
        extra += 100; this.text(h.x, h.y - 80, 'Bồ lúa vàng! +100', '#FFD66B', 1.4, 15); this.discover('r.bo_lua', h.x, h.y);
      }
    }
    if (extra) this.addGold(extra);
    this.rwWaveEnd();
    this.lossLog = (this.lossLog || []).concat((this.lostN || 0) > (this.lostWave || 0)).slice(-6);   // đợt này có mất mạng không
    this.lostWave = this.lostN || 0;
    this.moc = this.mocMax();
    this.rollShop();      // cửa hàng nhập hàng mới
    this.notify(`Hoàn thành đợt ${this.wave}! +${bonus + extra} vàng · ${this.sonTinh() ? 'núi cao' : 'giữ vững'} +${mGold} vàng`, '#F2D27A');
    if (this.bossKho) { this.events.push({ type: 'kho', n: this.bossKho, why: `hạ ${this.bossKhoName}` }); this.bossKho = 0; }
    // v104: Tu Vi cho mọi tướng còn trên sân mỗi đợt (tướng hỗ trợ / hồi máu ít hạ quái vẫn lên bậc)
    const log = this.xpLog || (this.xpLog = {});
    for (const h of this.heroes) if (h) { log[h.type] = (log[h.type] || 0) + 1; for (const a of heroLineage(h)) log[a.type] = (log[a.type] || 0) + 0.5; }
    // v103: Vô tận — mỗi 10 đợt cộng Ngân khố (tài khoản) ngay
    if (this.endless && this.wave % PREP.endlessEvery === 0) this.events.push({ type: 'kho', n: Math.round(PREP.endlessMilestone * (1 + Math.floor(this.wave / 50) * 0.5) * (this.hard ? 1.5 : 1)), why: `mốc đợt ${this.wave}` });
    if (bossAt(this.wave, this.level)) this.riseWater();
    this.events.push({ type: 'checkpoint' });   // v74: lưu màn đang chơi giữa hai đợt
    if (this.wave >= this.levelWaves && !this.endless && !this.won) {
      this.won = true;
      this.running = false;
      this.events.push({ type: 'victory' });
    }
  }

  // v74: lưu / nạp màn đang chơi (giữa hai đợt). Bỏ trạng thái tạm (hiệu ứng, đạn, quái đang đi).
  snapshot() {
    const skip = new Set(['_anim', 'target', 'tgt', 'notice', 'unlockFx', 'procT', 'strike', '_va']);   // v131: strike giữ hàm (đòn đang vung) — không lưu được
    const heroes = JSON.parse(JSON.stringify(this.heroes, (k, v) => (skip.has(k) ? undefined : v)));
    const o = { v: 1, at: Date.now(), heroes };
    for (const k of ['level', 'hard', 'endless', 'won', 'gold', 'lives', 'maxLives', 'wave', 'summonN', 'bossesKilled', 'slHist', 'rwHist', 'incomes', 'bet', 'elBuff', 'lostN', 'lostWave', 'lossLog', 'seen', 'water', 'raised', 'moc',
      'mountain', 'stats', 'inventory', 'jarCount', 'shop', 'time', 'flags', 'runId', 'guardT', 'oathT', 'xpLog', 'market']) o[k] = this[k];
    return JSON.parse(JSON.stringify(o));
  }
  restore(o) {
    this.reset(o.level);
    // claude/bo-chon-doi: bản lưu cũ còn đội ưu tiên / Nghỉ chân (deck, rest, restWave) — bỏ qua
    const old = new Set(['heroes', 'v', 'at', 'offer', 'deck', 'rest', 'restWave']);
    for (const k of Object.keys(o)) if (!old.has(k)) this[k] = o[k];
    // v143: bản lưu cũ đang mở bảng chọn 1 trong 3 (đã trả vàng) → hoàn lại vàng, chuyển sang chợ tướng
    if (o.offer && o.offer.cost) { this.gold += o.offer.cost; this.summonN = Math.max(0, (this.summonN || 0) - 1); }
    this.offer = null;
    this.maxLives = Math.max(o.maxLives || CONFIG.startLives, this.lives);   // v169: bản lưu cũ chưa có mạng tối đa
    this.ensureMarket();
    this.heroes = CONFIG.slots.map((_, i) => {
      const h = o.heroes && o.heroes[i];
      if (!h) return null;
      const [x, y] = CONFIG.slots[i];
      return Object.assign(h, { slot: i, x, y, _anim: {}, notice: {}, procT: {}, summonT: 0, swing: 0, cd: 0, dead: false, respawnT: 0, stunT: 0, strike: null, castT: 0, _va: null });
    });
    for (const h of this.heroes) if (h) h.hp = heroStats(h).hpMax;
    this.started = true; this.running = false; this.over = false;
    this.waveActive = false; this.enemies = []; this.spawnQueue = [];
    this.nextWaveT = 0;
    this.nextWave = buildWave(this.wave + 1, this.level);
    this.updateAuras();
  }

  spawn(type, dist, elite) {
    const def = ENEMIES[type];
    // boss tăng máu chậm hơn quái thường để không đột biến ở cuối chiến dịch
    const ew = effWave(this.wave, this.level);
    let hp = def.hp * (def.boss ? Math.pow(waveHpMult(ew), 0.85) : waveHpMult(ew)) * this.lv.hp;
    if (elite) hp *= 1.8;
    if (this.hard) hp *= HARD.hp(this.level);
    const p = PATH.at(dist);
    const e = {
      id: newId(), type, def, hp, maxHp: hp, dist, x: p.x, y: p.y, dir: 1,
      slowT: 0, slowPct: 0, stunT: 0, poisonT: 0, poisonDps: 0, poisonBy: null, dotColor: '#2ecc71', dotType: 'pure',
      atkCd: 1, slamCd: 4, summonCd: 6, healCd: 2, burnT: 0, dead: false, stunKind: 'stun', pullT: 0, pullSpeed: 0,
      elite: elite || null, armor: (def.armor || 0) + (elite === 'armored' ? 10 : 0), mr: def.mr || 0,
      shield: elite === 'shield' ? hp * 0.4 : 0, phase: 0, reborn: false, enraged: false, hitT: 0, zoneSlow: 0,
      el: def.el || pick(EL_ORDER), el2: null, shredN: 0, noHealT: 0, groundT: 0,
    };
    // giáp và kháng phép tăng dần theo đợt (xuyên giáp / xuyên kháng của tướng có đất dụng võ)
    const gw = Math.floor(ew / ENEMY_GROW.every);
    e.armor += gw * ENEMY_GROW.armor;
    if (e.mr > 0) e.mr = Math.min(ENEMY_GROW.mrCap, e.mr + gw * ENEMY_GROW.mr);
    e.baseArmor = e.armor;
    if (type === 'giaolong') this.discover('e.giaolong');
    this.enemies.push(e);
    if (!def.minion && !this.seen[type]) {
      this.seen[type] = true;
      if (this.wave > 1 || def.boss) this.events.push({ type: 'newEnemy', enemy: type });
    }
    return e;
  }

  updateSpawns(dt) {
    if (!this.spawnQueue.length) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    const next = this.spawnQueue.shift();
    this.spawnTimer = next.gap;
    const e = this.spawn(next.type, 0, next.elite);
    if (next.champion) {
      e.champion = true;
      e.hp = e.maxHp = e.maxHp * 3;
      e.armor += 15;
      e.baseArmor = e.armor;
      // ẩn: 30% mang thêm một hành phụ, chịu khắc từ cả hai hành
      if (srand() < 0.3) { e.el2 = pick(EL_ORDER.filter((x) => x !== e.el)); this.discover('e.elite'); }
      this.events.push({ type: 'boss', name: `${e.def.name} khổng lồ`, armor: e.armor, champion: true });
    }
    if (e.def.boss) this.events.push({ type: 'boss', name: e.def.name, armor: e.armor, enemy: e.type });
  }

  // vùng đất có hiệu ứng: gây sát thương và làm chậm quái đứng trong vùng
  updateZones(dt) {
    for (const z of this.zones) {
      z.ttl -= dt;
      for (const e of this.enemies) {
        if (e.dead || isFlying(e)) continue;
        const inside = z.d1 !== undefined ? e.dist >= z.d1 && e.dist <= z.d2 : Math.hypot(e.x - z.x, e.y - z.y) <= z.r;
        if (!inside) continue;
        this.hit(e, z.dps * dt, z.hero, { silent: true, dt: z.dt });
        if (z.slow) e.zoneSlow = Math.max(e.zoneSlow, z.slow);
      }
      if (z.heal) for (const o of this.heroes) {
        if (!o || o.dead || Math.hypot(o.x - z.x, o.y - z.y) > z.heal.r) continue;
        const mx = heroStats(o).hpMax;
        o.hp = Math.min(mx, o.hp + mx * z.heal.pct * dt);
      }
    }
    this.zones = this.zones.filter((z) => z.ttl > 0);
  }

  slow(e, pct, t) {
    e.slowT = Math.max(e.slowT, t);
    e.slowPct = Math.max(e.slowT > 0 ? e.slowPct : 0, pct);
  }

  updateEnemy(e, dt) {
    if (e.dead) return;
    const d = e.def;
    if (e.hitT > 0) e.hitT -= dt;
    if (e.atkT > 0) e.atkT -= dt;
    if (e.slowT > 0) e.slowT -= dt; else e.slowPct = 0;
    if (e.poisonT > 0) {
      e.poisonT -= dt;
      this.hit(e, e.poisonDps * dt, e.poisonBy, { silent: true, dt: e.dotType });
      if (e.dead) return;
    }
    if (e.reviveT > 0) {
      // Hà Bá lặn xuống nước rồi trồi lên
      e.reviveT -= dt;
      e.hp = Math.min(e.maxHp * d.reincarnate.pct, e.hp + (e.maxHp * d.reincarnate.pct / d.reincarnate.delay) * dt);
      return;
    }
    if (e.noHealT > 0) e.noHealT -= dt;
    if (e.silenceT > 0) e.silenceT -= dt;
    const mute = e.silenceT > 0;          // v93: câm lặng — không dùng được kỹ năng
    if (e.huntT > 0) e.huntT -= dt;
    if (e.kbT > 0) e.kbT -= dt;
    if (e.groundT > 0) e.groundT -= dt;
    if (e.elite === 'regen' && !(e.noHealT > 0)) e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.03 * dt);
    if (d.enrage && !e.enraged && e.hp < e.maxHp * d.enrage.below) {
      e.enraged = true;
      this.text(e.x, e.y - 30, d.boss ? 'HÓA ĐIÊN!' : 'Điên!', '#ff4d4d', 0.9, d.boss ? 18 : 13);
    }
    // hồi máu đồng đội (Sứa Tinh)
    if (d.heal && !mute) {
      e.healCd -= dt;
      if (e.healCd <= 0) {
        e.healCd = d.heal.cd;
        const hurt = this.enemies.filter((o) => !o.dead && o !== e && o.hp < o.maxHp && !(o.noHealT > 0) && Math.hypot(o.x - e.x, o.y - e.y) <= d.heal.radius);
        if (hurt.length) {
          this.effects.push({ type: 'heal', x: e.x, y: e.y, r: d.heal.radius, color: '#5AB4D6', ttl: 0.6, max: 0.6 });
          for (const o of hurt) {
            o.hp = Math.min(o.maxHp, o.hp + o.maxHp * d.heal.pct);
            this.text(o.x, o.y - 26, '+', '#3EDC4E', 0.6, 16);
          }
        }
      }
    }
    // hô mưa gọi gió: gây sát thương tướng đứng gần (Thủy Tinh)
    if (d.burnAura && !mute) {
      e.burnT -= dt;
      if (e.burnT <= 0) {
        e.burnT = 1;
        for (const h of this.heroes) {
          if (h && !h.dead && Math.hypot(h.x - e.x, h.y - e.y) <= d.burnAura.radius) {
            this.damageHero(h, d.burnAura.dps * (1 + effWave(this.wave, this.level) * 0.06), false, true);
          }
        }
      }
    }
    // mỗi khi mất 25% máu: gọi Giao Long Con, làm ngập tạm vài ô
    if (d.phaseSummon) {
      const ph = Math.floor((1 - e.hp / e.maxHp) / 0.25);
      while (e.phase < Math.min(3, ph)) {
        e.phase++;
        for (let i = 0; i < d.phaseSummon.count; i++) this.spawn(d.phaseSummon.type, Math.max(0, e.dist - 8 - i * 16));
        this.effects.push({ type: 'ring', x: e.x, y: e.y, r: 70, color: '#5AB4D6', ttl: 0.6, max: 0.6 });
        this.text(e.x, e.y - 60, 'Nước dâng lên!', '#9EDDF2', 1.2, 15);
        this.shake = Math.max(this.shake, 4);
        if (d.tempFlood) this.tempFloodSpots(d.tempFlood.count, d.tempFlood.time);
      }
    }

    // quái tầm xa phun nước bắn tướng
    if (d.ranged && !mute) {
      e.atkCd -= dt;
      if (e.atkCd <= 0) {
        const h = this.nearestHero(e.x, e.y, d.ranged.range);
        if (h) {
          e.atkCd = d.ranged.cd; e.atkT = 0.4;
          this.projectiles.push({
            kind: 'evil', x: e.x, y: e.y - 14, target: h, tx: h.x, ty: h.y - 20, speed: 260,
            dmg: d.ranged.dmg * (1 + effWave(this.wave, this.level) * 0.08),
          });
        }
      }
    }
    // boss: quẫy đuôi làm choáng tướng
    if (d.slam && !mute) {
      e.slamCd -= dt;
      if (e.slamCd <= 0 && this.nearestHero(e.x, e.y, d.slam.range)) {
        e.slamCd = d.slam.cd * (e.enraged ? 0.65 : 1); e.atkT = 0.45;
        this.shake = Math.max(this.shake, 4);
        this.effects.push({ type: 'ring', x: e.x, y: e.y, r: d.slam.range, color: '#5AB4D6', ttl: 0.6, max: 0.6 });
        this.effects.push({ type: 'wave', x: e.x, y: e.y, r: d.slam.range, color: '#5AB4D6', ttl: 0.6, max: 0.6 });
        for (const h of this.heroes) {
          if (!h || h.dead || Math.hypot(h.x - e.x, h.y - e.y) > d.slam.range) continue;
          h.stunT = d.slam.stun;
          this.damageHero(h, d.slam.dmg * (1 + effWave(this.wave, this.level) * 0.06));
        }
      }
    }
    // boss: gọi quân theo chu kỳ
    if (d.summon && !mute) {
      e.summonCd -= dt;
      if (e.summonCd <= 0) {
        e.summonCd = d.summon.cd;
        for (let i = 0; i < d.summon.count; i++) this.spawn(d.summon.type, Math.max(0, e.dist - 10 - i * 18));
        this.effects.push({ type: 'ring', x: e.x, y: e.y, r: 40, color: '#5AB4D6', ttl: 0.4, max: 0.4 });
      }
    }

    // ---------- v49: cơ chế boss mới
    // gầm (roar): tướng trong tầm bị câm — không dùng được chiêu một lúc
    if (d.roar && !mute) {
      e.roarCd = (e.roarCd ?? d.roar.cd * 0.6) - dt;
      if (e.roarCd <= 0 && this.nearestHero(e.x, e.y, d.roar.radius)) {
        e.roarCd = d.roar.cd;
        this.effects.push({ type: 'ring', x: e.x, y: e.y, r: d.roar.radius, color: '#C85AFF', ttl: 0.7, max: 0.7 });
        this.text(e.x, e.y - 70, d.roar.name || 'GẦM!', '#C85AFF', 1.1, 17);
        for (const h of this.heroes) if (h && !h.dead && Math.hypot(h.x - e.x, h.y - e.y) <= d.roar.radius) h.silenceT = d.roar.silence;
      }
    }
    // lao tới (dash): chạy nhanh gấp nhiều lần trong chốc lát
    if (d.dash && !mute) {
      e.dashCd = (e.dashCd ?? d.dash.cd) - dt;
      if (e.dashT > 0) e.dashT -= dt;
      else if (e.dashCd <= 0) {
        e.dashCd = d.dash.cd; e.dashT = d.dash.dur;
        this.text(e.x, e.y - 60, d.dash.name || 'Xông lên!', '#FF8A3A', 0.9, 15);
        this.effects.push({ type: 'gust', x: e.x, y: e.y, r: 60, color: '#FF8A3A', ttl: 0.4, max: 0.4 });
      }
    }
    // sà xuống bắt người (swoop): tướng mạnh nhất trong tầm bị choáng
    if (d.swoop && !mute) {
      e.swoopCd = (e.swoopCd ?? d.swoop.cd) - dt;
      if (e.swoopCd <= 0) {
        const near = this.heroes.filter((h) => h && !h.dead && Math.hypot(h.x - e.x, h.y - e.y) <= d.swoop.range);
        if (near.length) {
          e.swoopCd = d.swoop.cd;
          const h = near.sort((a, b) => heroPower(b) - heroPower(a))[0];
          h.stunT = Math.max(h.stunT || 0, d.swoop.stun);
          this.damageHero(h, d.swoop.dmg * (1 + effWave(this.wave, this.level) * 0.06));
          this.effects.push({ type: 'streak', x: e.x, y: e.y - 40, x2: h.x, y2: h.y - 30, color: '#E8B83A', ttl: 0.4, max: 0.4 });
          this.text(h.x, h.y - 70, d.swoop.name || 'Bị cắp!', '#E8B83A', 1.1, 15);
        }
      }
    }
    // ảo ảnh (blink): mỗi mốc máu biến mất rồi hiện ra xa hơn trên đường
    if (d.blink && !mute) {
      e.blinkN = e.blinkN || 0;
      const next = d.blink.at[e.blinkN];
      if (next !== undefined && e.hp < e.maxHp * next) {
        e.blinkN++;
        this.effects.push({ type: 'ring', x: e.x, y: e.y, r: 50, color: '#C85AFF', ttl: 0.5, max: 0.5 });
        e.dist = Math.min(PATH.total - 60, e.dist + d.blink.dist);
        const p = PATH.at(e.dist); e.x = p.x; e.y = p.y;
        this.effects.push({ type: 'ring', x: e.x, y: e.y, r: 50, color: '#C85AFF', ttl: 0.5, max: 0.5 });
        this.text(e.x, e.y - 60, d.blink.name || 'Ảo ảnh!', '#C85AFF', 1.1, 16);
      }
    }
    // tráo lẫy nỏ (disarm): một lần, khi còn nửa máu — tướng mạnh nhất trên sân bị choáng lâu
    if (d.disarm && !e.disarmed && e.hp < e.maxHp * d.disarm.at) {
      e.disarmed = true;
      const h = this.heroes.filter((x) => x && !x.dead).sort((a, b) => heroPower(b) - heroPower(a))[0];
      if (h) {
        h.stunT = Math.max(h.stunT || 0, d.disarm.dur);
        this.text(h.x, h.y - 70, d.disarm.name || 'Bị tráo vũ khí!', '#FF4D4D', 1.6, 16);
        this.effects.push({ type: 'ring', x: h.x, y: h.y, r: 40, color: '#FF4D4D', ttl: 0.6, max: 0.6 });
      }
    }

    if (e.pullT > 0) {
      // bị kéo / đẩy lùi
      e.pullT -= dt;
      e.dist = Math.max(0, e.dist - e.pullSpeed * dt);
      const p = PATH.at(e.dist);
      e.x = p.x; e.y = p.y;
      return;
    }
    if (e.stunT > 0) { e.stunT -= dt; e.zoneSlow = 0; return; }
    const slowPct = Math.max(e.slowT > 0 ? e.slowPct : 0, e.zoneSlow);
    e.zoneSlow = 0;
    const slow = (slowPct / 100) * (1 - (d.slowResist || 0));
    let aura = 1;
    if (!d.boss && this.auraBosses && this.auraBosses.length) {
      for (const b of this.auraBosses) if (!b.dead && Math.hypot(b.x - e.x, b.y - e.y) <= b.def.speedAura.radius) { aura = 1 + b.def.speedAura.pct; break; }
    }
    const speed = d.speed * (1 - slow) * (e.enraged ? d.enrage.speed : 1) * (e.elite === 'swift' ? 1.4 : 1)
      * (e.dashT > 0 ? d.dash.mult : 1) * aura;
    let nd = e.dist + speed * dt;
    // vật chặn đường (Lạc Tử, Thành Một Đêm): quái đi bộ phải dừng lại
    if (!d.flying) {
      for (const b of this.blocks) {
        if (e.dist <= b.dist && nd > b.dist) { nd = b.dist; e.blocked = true; }
      }
    }
    e.dist = nd;
    if (e.dist >= PATH.total) {
      e.dead = true;
      if (this.guardT > 0) {
        this.effects.push({ type: 'ring', x: e.x, y: e.y, r: 40, color: '#FFD66B', ttl: 0.5, max: 0.5 });
        this.text(e.x, e.y - 30, 'Kim Quy chặn!', '#FFD66B', 0.9, 14);
        return;
      }
      this.lives -= d.lives || 1;
      this.lostN = (this.lostN || 0) + 1;
      this.effects.push({ type: 'flash', ttl: 0.3, max: 0.3 });
      this.livesLost();
      if (this.lives <= 0) {
        this.lives = 0;
        this.over = true;
        this.running = false;
        this.events.push({ type: 'defeat' });
      }
      return;
    }
    const p = PATH.at(e.dist);
    if (Math.abs(p.dx) > 0.1) e.dir = p.dx > 0 ? 1 : -1;
    e.x = p.x;
    e.y = p.y;
  }

  tempFloodSpots(count, time) {
    return;            // v36: bỏ ngập tạm
    const dry = CONFIG.slots.map((s, i) => i).filter((i) => !this.isFlooded(i));
    for (let k = 0; k < count && dry.length; k++) {
      const i = dry.splice(Math.floor(srand() * dry.length), 1)[0];
      this.tempFlood[i] = this.time + time;
      const [x, y] = CONFIG.slots[i];
      this.effects.push({ type: 'ring', x, y, r: 30, color: '#5AB4D6', ttl: 0.6, max: 0.6 });
    }
  }

  nearestHero(x, y, r) {
    let best = null, bd = r;
    for (const h of this.heroes) {
      if (!h || h.dead) continue;
      const d = Math.hypot(h.x - x, h.y - y);
      if (d <= bd) { best = h; bd = d; }
    }
    return best;
  }

  damageHero(h, amount, ranged, magic) {
    if (h.dead || h.invulnT > 0) return;
    const b = h.buff || {};
    if (ranged && b.block && srand() * 100 < b.block) {
      this.text(h.x, h.y - 50, 'Chặn!', '#9EDDF2', 0.6, 13);
      return;
    }
    const st = heroStats(h);
    // hệ Thổ: chặn hẳn đòn đánh
    if (st.el.block && srand() * 100 < st.el.block) { this.text(h.x, h.y - 50, 'Chặn!', '#E8C27A', 0.6, 13); return; }
    amount *= (1 - st.dr / 100) * (1 - (b.dr || 0) / 100);
    if (magic && st.magicRes) { amount *= 1 - st.magicRes / 100; this.proc(h, 'scale', h.x, h.y - 26, '#5AB4D6', 26); }
    // ẩn đồ hành Thổ "Đất lành chim đậu": máu dưới 30% thì giảm 30% sát thương 4 giây (hồi 20 giây)
    if (st.hid['i.tho1'] && h.hp < st.hpMax * 0.3 && !(h.earthCd > 0)) {
      h.earthT = 4; h.earthCd = 20;
      this.proc(h, 'earth', h.x, h.y - 24, '#C99A3C', 34);
      this.discover('i.tho1', h.x, h.y);
    }
    if (h.earthT > 0) amount *= 0.7;
    if (st.lg.lowHpDr && h.hp < st.hpMax * 0.4) amount *= 1 - st.lg.lowHpDr / 100;     // Thần khí
    if (this.oathT > 0) amount *= 0.7;             // Lạc Hầu: Lời Thề Bộ Lạc
    // Lạc Hầu: Giáp Da Tê Gai phản sát thương lên quái gần nhất
    if (st.thorns && amount > 0) {
      const foe = this.enemiesInRange(h.x, h.y, 260).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
      if (foe) { this.hit(foe, amount * st.thorns / 100 * (1 + st.str * 0.02), h, { dt: 'pure', color: '#C8A070', big: true }); this.proc(h, 'thorns', h.x, h.y - 26, '#C8A070', 26); }
    }
    // ẩn đủ Bộ Sơn Tinh: mỗi đợt chặn hoàn toàn 1 đòn đánh gây chết
    if (st.hid['s.sontinh'] && !h.blockUsed && amount >= h.hp + (h.shield || 0)) {
      h.blockUsed = true;
      this.text(h.x, h.y - 60, 'Núi chặn!', '#C99A3C', 1, 15);
      this.effects.push({ type: 'ring', x: h.x, y: h.y - 20, r: 40, color: '#C99A3C', ttl: 0.6, max: 0.6 });
      this.discover('s.sontinh', h.x, h.y);
      return;
    }
    if (h.shield > 0) {
      const a = Math.min(h.shield, amount);
      h.shield -= a;
      amount -= a;
      if (amount <= 0) return;
    }
    h.hp -= amount;
    h.hurtT = 0.2;
    this.text(h.x, h.y - 50, '-' + Math.round(amount), '#ff6b6b', 0.7);
    if (h.hp > 0) return;
    const def = HEROES[h.type];
    const badge = ACC_SLOTS.find((s) => h.equip[s] && ITEMS[h.equip[s].id].revive);
    if (badge) {
      h.equip[badge] = null;
      h.hp = st.hpMax;
      this.effects.push({ type: 'revive', x: h.x, y: h.y, ttl: 0.9, max: 0.9 });
      this.notify(`${def.name} hồi sinh nhờ Ngọc Hồi Sinh!`, '#F0A030');
      return;
    }
    // Thần khí: gục lần đầu mỗi đợt thì đứng dậy
    if (st.lg.reviveOnce && !h.lgRevUsed) {
      h.lgRevUsed = true;
      h.hp = st.hpMax * st.lg.reviveOnce / 100;
      this.effects.push({ type: 'revive', x: h.x, y: h.y, ttl: 0.9, max: 0.9 });
      this.text(h.x, h.y - 70, 'Thần khí hồi sinh!', '#FFD66B', 1, 14);
      return;
    }
    // ẩn Giáp Đồng Bất Diệt: gục lần đầu mỗi đợt thì hồi sinh ngay với 30% máu
    if (st.hid['r.giap_bat_diet'] && !h.gbdUsed) {
      h.gbdUsed = true;
      h.hp = st.hpMax * 0.3;
      this.effects.push({ type: 'revive', x: h.x, y: h.y, ttl: 0.9, max: 0.9 });
      this.discover('r.giap_bat_diet', h.x, h.y);
      return;
    }
    h.dead = true;
    h.hp = 0;
    h.respawnT = 4 + h.level * 0.8;
    h.fallT = 0.6;
    // ẩn Thạch Sanh: đứng gần tướng vừa gục, tướng đó hồi sinh nhanh hơn 50%
    const ts = this.heroes.find((o) => o && o !== h && !o.dead && o.type === 'thachsanh' && Math.hypot(o.x - h.x, o.y - h.y) <= 170);
    if (ts) { h.respawnT *= 0.5; this.discover('h.thachsanh', ts.x, ts.y); }
    // ẩn đồ hành Thủy "Nước chảy về chỗ trũng": tướng kề gục, hồi 20% máu cho các tướng kề còn lại
    for (const w of this.adjacent(h)) {
      if (!heroStats(w).hid['i.thuy2']) continue;
      for (const o of [w, ...this.adjacent(w)]) {
        if (o === h) continue;
        const mx = heroStats(o).hpMax;
        o.hp = Math.min(mx, o.hp + mx * 0.2);
        this.effects.push({ type: 'heal', x: o.x, y: o.y, r: 30, color: '#5AB4D6', ttl: 0.7, max: 0.7 });
      }
      this.discover('i.thuy2', w.x, w.y);
    }
    this.notify(`${def.name} đã gục! Hồi sinh sau ${Math.ceil(h.respawnT)} giây`, '#E25A3A');
  }

  reviveHero(h) {
    h.dead = false;
    h.hp = heroStats(h).hpMax;
    this.effects.push({ type: 'revive', x: h.x, y: h.y, ttl: 0.9, max: 0.9 });
  }

  updateHero(h, dt) {
    const def = HEROES[h.type];
    const st = heroStats(h);
    if (h.summonT > 0) h.summonT -= dt;
    if (h.hurtT > 0) h.hurtT -= dt;
    if (h.bounceT > 0) h.bounceT -= dt;
    if (h.evoT > 0) h.evoT -= dt;
    if (h.wingT > 0) h.wingT -= dt;
    if (h.dead) {
      if (h.fallT > 0) h.fallT -= dt;
      h.respawnT -= dt;
      if (h.respawnT <= 0) this.reviveHero(h);
      return;
    }
    if (h.invulnT > 0) h.invulnT -= dt;
    if (h.shieldT > 0) { h.shieldT -= dt; if (h.shieldT <= 0) h.shield = 0; }
    for (const k of ['rallyT', 'feastT', 'hotT', 'volleyT', 'huntT', 'rageT', 'warT', 'earthT', 'earthCd', 'drumBoostT', 'trailCd', 'breathCd', 'windT']) if (h[k] > 0) h[k] -= dt;
    // Thần khí: hồi máu đồng đội mỗi 5 giây
    if (legacyOf(h) && LEGACY[h.type] && !h.dead) {
      h.lgHealT = (h.lgHealT || 5) - dt;
      if (h.lgHealT <= 0) {
        h.lgHealT = 5;
        const v = heroStats(h).lg.healAura;
        if (v) for (const o of this.heroes) if (o && !o.dead && Math.hypot(o.x - h.x, o.y - h.y) <= 160) {
          const om = heroStats(o).hpMax; o.hp = Math.min(om, o.hp + om * v / 100);
          this.effects.push({ type: 'ring', x: o.x, y: o.y - 20, r: 22, color: '#7FE08A', ttl: 0.5, max: 0.5 });
        }
      }
    }
    if (!(h.rageT > 0)) h.rageN = 0;
    h.still = (h.still || 0) + dt;
    if (st.hid['r.ao_vay_ca'] && h.hp < st.hpMax * 0.5) {
      h.hp = Math.min(st.hpMax, h.hp + st.hpMax * 0.02 * dt);
      if (h.hp < st.hpMax) this.discover('r.ao_vay_ca', h.x, h.y);
    }
    // Bộ Sơn Tinh: quái chạm vào bị chậm
    if (st.touchSlow) for (const e of this.enemiesInRange(h.x, h.y, 60, false)) this.slow(e, st.touchSlow, 0.5);
    const heal = ((h.buff.healPct || 0) / 100 + (h.hotT > 0 ? h.hotPct || 0 : 0) + (this.oathT > 0 ? 0.03 : 0)) * st.hpMax;
    h.hp = Math.min(st.hpMax, h.hp + (st.regen + heal) * dt);
    h.mana = Math.min(st.maxMana, h.mana + st.manaRegen * dt);
    h.swing = Math.max(0, h.swing - dt * (h.swingRate || SWING_RATE));
    // đòn đánh thường rơi đúng lúc hoạt ảnh ra đòn (sau pha lấy đà)
    if (h.strike) {
      h.strike.t -= dt;
      if (h.strike.t <= 0) { const tg = h.strike.target; h.strike = null; this.heroAttack(h, tg); }
    }
    if (h.castT > 0) h.castT -= dt;
    for (const sk of def.skills) {
      if (sk.active) h.skillCd[sk.id] = (h.skillCd[sk.id] || 0) - dt;
    }
    // Chử Đồng Tử: hồi sinh tướng gục gần nhất
    if (h.type === 'cdt') {
      h.reviveCd -= dt;
      if (h.reviveCd <= 0) {
        let best = null, bd = 280;
        for (const o of this.heroes) {
          if (!o || !o.dead || o === h) continue;
          const d = Math.hypot(o.x - h.x, o.y - h.y);
          if (d < bd) { bd = d; best = o; }
        }
        if (best) {
          this.reviveHero(best);
          h.reviveCd = 40;
          this.text(best.x, best.y - 70, 'Gậy Thần hồi sinh!', '#9EDDF2', 1.2, 15);
          this.effects.push({ type: 'streak', x: h.x, y: h.y - 40, x2: best.x, y2: best.y - 30, color: '#9EDDF2', ttl: 0.4, max: 0.4 });
        }
      }
    }
    if (h.silenceT > 0) h.silenceT -= dt;
    if (h.stunT > 0) { h.stunT -= dt; return; }
    h.cd -= dt;

    // bụi đá quanh mình (Lực Sĩ Núi)
    if (st.stench) {
      for (const e of this.enemiesInRange(h.x, h.y, 95, false)) this.hit(e, st.stench * dt, h, { silent: true, dt: 'magic' });
    }

    // ưu tiên chiêu lớn (R rồi E): khi chiêu lớn đã hồi xong thì để dành năng lượng cho nó
    let reserve = 0;
    for (let i = 3; i >= 1; i--) {
      const sk = def.skills[i];
      if (sk.active && skillLevel(h, i) && h.skillCd[sk.id] <= 0) { reserve = sk.active.mana; break; }
    }
    for (let i = 3; i >= 0; i--) {
      const sk = def.skills[i];
      const lv = skillLevel(h, i);
      if (!sk.active || !lv || h.skillCd[sk.id] > 0 || h.mana < sk.active.mana || h.silenceT > 0) continue;
      if (sk.active.mana < reserve && h.mana - sk.active.mana < reserve) continue;
      const cst = { ...st, skillPower: st.skillPower * skillMult(lv), lv, skName: sk.name };
      this.ultCast = i === 3;
      const castOk = SKILL_CASTS[sk.active.cast](this, h, cst, skillN(h.level));
      this.ultCast = false;
      if (castOk) {
        // ẩn Gậy Thời Không: 10% dùng chiêu không tốn năng lượng
        if (st.hid['r.gay_thoi_khong'] && srand() < 0.1) {
          this.text(h.x, h.y - 84, 'Không tốn năng lượng!', '#4a90e2', 1, 13);
          this.discover('r.gay_thoi_khong', h.x, h.y);
        } else if (runeFx(h) && runeFx(h).fx.freeCast && srand() * 100 < runeFx(h).fx.freeCast) {
          this.text(h.x, h.y - 84, 'Phúc Thần!', '#7FA8F0', 1, 13);
        } else {
          h.mana -= sk.active.mana;
          if (runeFx(h) && runeFx(h).sk.s_echo && srand() * 100 < runeFx(h).sk.s_echo) { h.mana += sk.active.mana * 0.5; this.text(h.x, h.y - 84, 'Vang Vọng!', '#7FA8F0', 0.8, 12); }
        }
        h.skillCd[sk.id] = sk.active.cooldown * (1 - st.cdr / 100);
        // ẩn Lang Liêu: đợt có Thủy Tinh, Lễ Tổ Tiên giảm 50% hồi chiêu
        if (sk.active.cast === 'ancestor' && this.enemies.some((e) => !e.dead && e.type === 'thuytinh')) {
          h.skillCd[sk.id] *= 0.5;
          this.discover('h.langlieu', h.x, h.y);
        }
        // ẩn đủ Bộ Trống Đồng: tướng trong hào quang dùng R thì hào quang gấp đôi 5 giây
        if (i === 3 && h.buff.drum) {
          for (const o of this.heroes) {
            if (!o || o.dead || Math.hypot(o.x - h.x, o.y - h.y) > 140 || !heroStats(o).hid['s.drum']) continue;
            o.drumBoostT = 5;
            this.discover('s.drum', o.x, o.y);
          }
        }
        h.swing = 1;
        h.swingRate = SWING_RATE;
        const color = SKILL_COLOR[sk.active.cast] || '#fff';
        h.castT = i === 3 ? 0.9 : 0.5;
        h.castColor = color;
        h.castUlt = i === 3;
        this.effects.push({ type: 'cast', x: h.x, y: h.y, color, ult: i === 3, el: HEROES[h.type].el, ttl: 0.5, max: 0.5 });
        this.text(h.x, h.y - 66, sk.name + '!', color, 1.1, 17);
        break;   // mỗi lần chỉ tung một chiêu
      } else {
        h.skillCd[sk.id] = 0.4;   // chưa có mục tiêu: thử lại sau
      }
    }

    const target = this.findTarget(h.x, h.y, st.range, st.canAir);
    if (!target) return;
    h.dir = target.x >= h.x ? 1 : -1;
    if (h.cd > 0 || h.strike) return;
    h.cd = st.cooldown;
    // hoạt ảnh đánh co theo tốc đánh: đánh nhanh thì vung nhanh, không bị giật về tư thế lấy đà
    h.swingRate = Math.max(SWING_RATE, 1 / (st.cooldown * 0.92));
    h.swing = 1;
    h.strike = { t: (STRIKE_DELAY[def.attack] || 0.12) * (SWING_RATE / h.swingRate), target };   // v141: không giữ hàm (lưu / đồng bộ co-op được)
  }

  // đòn đánh thường (gọi khi hoạt ảnh tới lúc ra đòn)
  heroAttack(h, target) {
    if (h.dead || !this.heroes.includes(h)) return;
    const def = HEROES[h.type];
    const st = heroStats(h);
    if (target.dead) target = this.findTarget(h.x, h.y, st.range, st.canAir);
    if (!target) return;

    if (def.attack === 'melee') {
      this.effects.push({ type: 'slash', x: target.x, y: target.y - 10, dir: h.dir, ttl: 0.2, max: 0.2 });
      this.sparks(target.x, target.y - 12, '#FFF1C4', 4);
      this.hit(target, st.damage, h, { st });
      if (st.cleave > 0) {
        for (const e of this.enemiesInRange(h.x, h.y, st.range, false)) {
          if (e !== target) this.hit(e, st.damage * st.cleave, h, { st });
        }
      }
    } else if (h.type === 'adv' && (h.shotN = (h.shotN || 0) + 1) % 4 === 0) {
      // Nỏ Linh Quang: phát thứ 4 xuyên cả hàng (ẩn: Kim Quy cùng trên sân thì x3)
      const turtle = this.heroes.some((o) => o && !o.dead && o.type === 'kimquy');
      if (turtle) this.discover('h.adv', h.x, h.y);
      this.lineHit(h, target, st.range * 1.6, st.damage * (turtle ? 3 : 2), { color: '#FFE08A', width: 14 });
      this.sparks(h.x + h.dir * 14, h.y - 30, '#FFE08A', 6);
    } else if (st.arrows > 1) {
      const targets = this.enemies
        .filter((e) => !e.dead && Math.hypot(e.x - h.x, e.y - h.y) <= st.range)
        .sort((a, b) => b.dist - a.dist)
        .slice(0, st.arrows);
      for (const e of targets) this.shoot(h, e, def.proj, 520, st);
    } else {
      const speed = def.proj === 'arrow' || def.proj === 'bolt' ? 520 : def.proj === 'frostbolt' ? 360 : 320;
      this.shoot(h, target, def.proj, speed, st);
    }
  }

  shoot(h, target, kind, speed, st) {
    this.projectiles.push({
      kind, x: h.x + h.dir * 10, y: h.y - 30, sx: h.x, sy: h.y - 30, target, tx: target.x, ty: target.y,
      speed, hero: h, st: { ...st }, curve: st.curve ? 1 : 0,
    });
  }

  updateProjectiles(dt) {
    for (const p of this.projectiles) {
      if (!p.target.dead) {
        p.tx = p.target.x;
        p.ty = p.target.y - (p.kind === 'evil' ? 20 : p.target.def && p.target.def.flying ? 30 : 8);
      }
      const dx = p.tx - p.x, dy = p.ty - p.y;
      const d = Math.hypot(dx, dy);
      const step = p.speed * dt;
      p.angle = Math.atan2(dy, dx);
      if (d > step) {
        p.x += (dx / d) * step;
        p.y += (dy / d) * step;
        continue;
      }
      p.done = true;
      // chỉ để vẽ: hạt nổ khi đạn trúng (js/vfx.js)
      // v175: el / splash để vẽ ảnh trúng đòn / vụ nổ theo hệ (vfx/trung-<hệ>.png, vfx/no-<hệ>.png) nếu có — docs/PROMPT-CAN-GEN.txt
      const pel = p.hero && HEROES[p.hero.type] ? HEROES[p.hero.type].el : null;
      this.effects.push({ type: 'impact', kind: p.kind === 'fireball' || !p.kind ? 'fireball' : p.kind, x: p.tx, y: p.ty, el: pel, splash: p.st && p.st.splash > 0 ? p.st.splash : 0, ttl: pel ? 0.3 : 0.12, max: pel ? 0.3 : 0.12 });
      const { st, hero } = p;
      if (p.kind === 'evil') {
        if (!p.target.dead) this.damageHero(p.target, p.dmg, true, true);
      } else if (st.splash > 0) {
        this.effects.push({ type: 'ring', x: p.tx, y: p.ty, r: st.splash, color: p.kind === 'melon' ? '#3EDC4E' : '#F28A2E', ttl: 0.3, max: 0.3 });
        for (const e of this.enemiesInRange(p.tx, p.ty, Math.max(st.splash, 14))) {
          this.hit(e, st.damage, hero, { st });
          if (!e.dead && st.poison > 0) this.dot(e, st.poison, hero, '#e67e22', 'magic');
        }
      } else {
        if (p.target.dead) continue;
        this.hit(p.target, st.damage, hero, { st });
        // Rìu Quét Sông (tướng đánh xa): lan sát thương ra quái xung quanh
        if (st.spread) {
          this.proc(p.target, 'spread', p.tx, p.ty, '#5AB4D6', 40);
          for (const o of this.enemiesInRange(p.tx, p.ty, 50)) if (o !== p.target) this.hit(o, st.damage * st.spread / 100, hero, { silent: true });
        }
        if (p.target.dead) continue;
        if (st.poison > 0) this.dot(p.target, st.poison, hero, '#7FC24A', 'pure');
        if (st.slow > 0) this.slow(p.target, st.slow, 1.5);
      }
    }
    this.projectiles = this.projectiles.filter((p) => !p.done);
  }

  stun(e, t, kind) {
    t *= 1 - (e.def.stunResist || 0);
    e.stunT = Math.max(e.stunT, t);
    e.stunKind = kind;
  }

  sparks(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      this.effects.push({ type: 'spark', x, y, a: srand() * 6.28, color, ttl: 0.5, max: 0.5, d: 20 + srand() * 25 });
    }
  }

  dot(e, dps, hero, color, type, t) {
    e.poisonT = t || 3;
    // ẩn Thầy Mo Lửa: lửa đốt quái hành Kim kéo dài gấp đôi
    if (hero && hero.type === 'thaymo' && (e.el === 'kim' || e.el2 === 'kim')) {
      e.poisonT *= 2;
      this.discover('h.thaymo', hero.x, hero.y);
    }
    e.poisonDps = dps * (runeFx(hero) && runeFx(hero).fx.dot ? 1 + runeFx(hero).fx.dot / 100 : 1);
    e.poisonBy = hero;
    e.dotColor = color;
    e.dotType = type || 'pure';
  }

  // Khi chưa bấm ▶ hoặc đang dừng: chỉ chạy hiệu ứng phản hồi thao tác của người chơi
  // (lên cấp, tiến hoá, mặc đồ, triệu hồi...) để không bị đứng hình.
  updateIdle(dt) {
    this.shake = Math.max(0, this.shake - dt * 30);
    for (const h of this.heroes) {
      if (!h) continue;
      for (const k of ['bounceT', 'evoT', 'wingT', 'summonT']) if (h[k] > 0) h[k] -= dt;
    }
    for (const f of this.effects) {
      if (!IDLE_FX.has(f.type) || f.delay > 0) continue;
      f.ttl -= dt;
      if (f.vy) f.y += f.vy * dt;
    }
    this.effects = this.effects.filter((f) => f.ttl > 0);
  }

  updateEffects(dt) {
    for (const f of this.effects.slice()) {
      if (f.delay > 0) { f.delay -= dt; continue; }
      f.ttl -= dt;
      if (f.vy) f.y += f.vy * dt;
      if (f.ttl <= 0 && f.onEnd) { f.onEnd(); f.onEnd = null; }
    }
    this.effects = this.effects.filter((f) => f.ttl > 0);
  }

  // ---------- sát thương & hạ gục
  // Vật lý bị giáp giảm (xuyên giáp bỏ qua một phần), phép bị kháng phép giảm,
  // chuẩn (pure) không bị giảm. Màng Nước hút sát thương trước.
  hit(e, amount, hero, o = {}) {
    if (e.dead || e.reviveT > 0) return;
    const def = hero ? HEROES[hero.type] : null;
    const type = o.dt || (def ? def.dmgType : 'phys');
    let dmg = amount;
    const st = o.st;
    const hid = st ? st.hid : {};
    let crit = st && srand() * 100 < st.crit;
    let critMult = st ? st.critMult || 2 : 2;
    const RF = st && hero ? runeFx(hero) : null;
    // Ấn Mắt Ưng: đòn đầu tiên trúng mỗi quái luôn chí mạng
    if (RF && RF.sk.g_eye !== undefined && !o.silent && !e.eyeHit) { e.eyeHit = 1; crit = true; critMult += RF.sk.g_eye / 100; }
    if (crit && e.elite && hid['r.luoi_hai']) { critMult = 3; this.discover('r.luoi_hai', hero.x, hero.y); }
    if (crit) dmg *= critMult;
    if (st && e.def.flying && st.airMult > 1) dmg *= st.airMult;
    if (st && e.def.boss && st.bossPct) dmg *= 1 + st.bossPct / 100;
    if (e.huntT > 0) dmg *= 1.25;                  // Cuộc Săn Lớn
    if (st && st.execPct && e.hp < e.maxHp * 0.3) dmg *= 1 + st.execPct / 100;   // Chúa Sơn Lâm
    if (st && st.burnAmp && e.poisonT > 0) dmg *= 1 + st.burnAmp / 100;              // Bà Hỏa: Hỏa Hoạn
    if (st && st.vsThuy && (e.el === 'thuy' || e.el2 === 'thuy')) dmg *= 1 + st.vsThuy / 100;   // Sơn Tinh: Núi Cao Nước Dâng
    if (st && st.markHit && !o.silent) e.huntT = Math.max(e.huntT || 0, st.markHit);            // Mỵ Châu: lông ngỗng đánh dấu
    if (RF) {
      if (RF.fx.eliteDmg && (e.elite || e.champion || e.def.general)) dmg *= 1 + RF.fx.eliteDmg / 100;
      if (RF.fx.ccDmg && (e.slowT > 0 || e.stunT > 0)) dmg *= 1 + RF.fx.ccDmg / 100;
    }
    // Thần Săn Ba Vì: Mắt Rừng
    if (hero && hero.type === 'thansan' && (e.slowT > 0 || e.stunT > 0 || e.zoneSlow > 0)) dmg *= 1.25;
    // Ngũ hành: khắc +30%, bị khắc −20% (hành của đòn đánh là hành của tướng)
    const em = hero ? this.elemMult(hero, e) : 0;
    dmg *= 1 + em / 100;
    // ẩn đồ hành Kim: đòn thứ 5 liên tiếp vào cùng một quái +50%
    if (st && !o.silent && hid['i.kim2']) {
      hero.streak = hero.streakId === e.id ? (hero.streak || 0) + 1 : 1;
      hero.streakId = e.id;
      if (hero.streak % 5 === 0) { dmg *= 1.5; this.discover('i.kim2', hero.x, hero.y); }
    }
    if (type === 'phys') {
      let pierce = st ? st.pierce : hero ? heroStats(hero).pierce : 0;
      if (this.ultCast) pierce += ULT_PEN;     // chiêu tối thượng xuyên thêm
      if (hid['i.kim1'] && e.hp < e.maxHp * 0.3) { pierce = Math.min(100, pierce + 30); this.discover('i.kim1', hero.x, hero.y); }
      const armor = e.armor * (1 - Math.min(100, pierce) / 100);
      dmg *= 1 - (0.06 * armor) / (1 + 0.06 * armor);
    } else if (type === 'magic') {
      // xuyên kháng phép: bỏ qua một phần kháng phép của quái
      const mpen = (st ? st.mpen : hero ? heroStats(hero).mpen : 0) + (this.ultCast ? ULT_PEN : 0);
      dmg *= 1 - (e.mr * (1 - Math.min(100, mpen) / 100)) / 100;
    }
    if (st && st.stunChance && srand() * 100 < st.stunChance) { this.stun(e, 0.5, 'stun'); this.proc(e, 'tusk', e.x, e.y - 16, '#C8A040', 22); }
    if (st && !o.silent) this.onHitFx(e, hero, st, crit, dmg);
    if (!o.silent) {
      e.hitT = 0.12;
      if (st && hero) { e.kbT = 0.14; e.kbDir = e.x >= hero.x ? 1 : -1; }
    }
    // số sát thương: khắc chế hiện vàng, bị khắc hiện xám
    const numColor = em > 0 ? '#FFD66B' : em < 0 ? '#9A968C' : null;
    if (crit) this.text(e.x, e.y - 30, Math.round(dmg) + '!', numColor || '#FFD66B', 0.7);
    else if (o.big) this.text(e.x, e.y - 30, Math.round(dmg), numColor || o.color || '#fff', 0.8);
    if (e.shield > 0) {
      const a = Math.min(e.shield, dmg);
      e.shield -= a;
      dmg -= a;
      if (e.shield <= 0) this.effects.push({ type: 'ring', x: e.x, y: e.y - 10, r: 26, color: '#5AB4D6', ttl: 0.4, max: 0.4 });
    }
    // Ấn Núi Đè: hạ gục ngay quái thường còn ít máu
    if (RF && RF.sk.n_exec && !e.def.boss && !e.elite && !e.champion && !e.def.general && e.hp - dmg > 0 && e.hp - dmg < e.maxHp * RF.sk.n_exec / 100) {
      dmg = e.hp; this.text(e.x, e.y - 40, 'Trảm!', '#D9844A', 0.6, 13);
    }
    // Ấn Hút Sinh Lực
    if (RF && RF.fx.leech && !hero.dead && dmg > 0) hero.hp = Math.min(hero.hpMaxLast || hero.hp, hero.hp + Math.min(dmg, e.hp) * RF.fx.leech / 100);
    e.hp -= dmg;
    if (e.hp > 0) return;
    if (e.def.reincarnate && !e.reborn) {
      // Hà Bá lặn xuống nước rồi trồi lên một lần
      e.reborn = true;
      e.hp = 1;
      e.reviveT = e.def.reincarnate.delay;
      this.effects.push({ type: 'dive', x: e.x, y: e.y, ttl: e.def.reincarnate.delay, max: e.def.reincarnate.delay });
      this.text(e.x, e.y - 70, 'HÀ BÁ LẶN XUỐNG!', '#9EDDF2', 1.6, 18);
      e.el = 'kim';      // ẩn: trồi lên với vảy hóa đồng (hành Kim)
      this.discover('e.haba');
      this.shake = Math.max(this.shake, 5);
      return;
    }
    this.kill(e, hero);
  }

  // hiệu ứng theo đòn đánh thường của tướng (đồ ghép, đồ bộ, hiệu ứng ẩn)
  onHitFx(e, hero, st, crit, dmg) {
    const hid = st.hid || {};
    if (st.shred && e.shredN < 3) {
      e.shredN++;
      this.proc(e, 'shred', e.x, e.y - 14, '#E8D8B0', 16);
      e.armor = Math.max(0, e.baseArmor - st.shred * e.shredN);
      if (e.type === 'rua' && e.armor <= 0 && hid['r.mui_sung'] && !e.cracked) {
        e.cracked = true;
        this.stun(e, 1, 'stun');
        this.text(e.x, e.y - 34, 'Vỡ mai!', '#E8D8B0', 0.9, 14);
        this.discover('r.mui_sung', hero.x, hero.y);
      }
    }
    if (st.noHeal) { if (!(e.noHealT > 0)) this.proc(e, 'jade', e.x, e.y - 18, '#3EC08A', 14); e.noHealT = st.noHeal; }
    if (st.netSlow) {
      if (!(e.slowT > 0)) this.proc(e, 'net', e.x, e.y - 10, '#D8C8A0', 14);
      this.slow(e, st.netSlow, 1);
      if (e.type === 'casau' && e.enraged && !e.netted && hid['r.luoi_ca']) {
        e.netted = true;
        this.stun(e, 1, 'net');
        this.discover('r.luoi_ca', hero.x, hero.y);
      }
    }
    if (e.def.flying && hid['r.bua_chim_lac'] && !(e.groundT > 0)) {
      e.groundT = 1;
      this.proc(e, 'ground', e.x, e.y - 30, '#FFE08A', 20);
      this.discover('r.bua_chim_lac', hero.x, hero.y);
    }
    if (st.el) this.elemOnHit(e, hero, st);
    if (crit && hid['i.hoa1']) {
      this.proc(e, 'burn', e.x, e.y - 14, '#E0452C', 18); this.dot(e, dmg * 0.2, hero, '#E0452C', 'magic', 2); this.discover('i.hoa1', hero.x, hero.y); }
    // ẩn đủ Bộ Lạc Long: đứng ô ngập, 10% phóng sét lan 3 quái
    if (hid['s.laclong'] && srand() < 0.1) {
      const near = this.enemiesInRange(e.x, e.y, 130).filter((o) => o !== e).slice(0, 3);
      for (const o of near) {
        this.effects.push({ type: 'streak', x: e.x, y: e.y - 14, x2: o.x, y2: o.y - 14, color: '#BFF0FF', w: 4, ttl: 0.3, max: 0.3 });
        this.hit(o, st.damage * 0.6, hero, { dt: 'magic', silent: true });
      }
      if (near.length) this.discover('s.laclong', hero.x, hero.y);
    }
    if (runeFx(hero)) this.runeOnHit(e, hero, st, crit);
    if (st.lg) this.legacyOnHit(e, hero, st);
    // Bộ Ngựa Sắt: đòn đánh để lại vệt lửa trên sông 2 giây
    if (st.fireTrail && !isFlying(e) && !(hero.trailCd > 0)) {
      hero.trailCd = 0.5;
      this.zones.push({ kind: 'fire', d1: Math.max(0, e.dist - 30), d2: e.dist + 30, ttl: 2, max: 2,
        dps: st.damage * st.fireTrail, hero, dt: 'magic' });
    }
  }

  // v93: hiệu ứng trạng thái theo hành của tướng (đòn đánh thường)
  elemOnHit(e, hero, st) {
    const E = st.el, R = () => srand() * 100;
    if (E.burn && !(e.poisonT > 0) && R() < E.burn) { this.dot(e, st.damage * 0.3, hero, '#E0452C', 'magic', 3); this.proc(e, 'burn', e.x, e.y - 14, '#E0452C', 16); }
    if (E.slow) this.slow(e, E.slow, 1.5);
    if (E.freeze && R() < E.freeze && !e.def.boss) { this.stun(e, 1, 'ice'); this.proc(e, 'ice', e.x, e.y - 14, '#BFEFFF', 18); }
    if (E.stun && R() < E.stun) { this.stun(e, e.def.boss ? 0.3 : 0.6, 'stun'); this.proc(e, 'tusk', e.x, e.y - 16, '#C99A3C', 18); }
    if (E.silence && R() < E.silence) {
      if (!(e.silenceT > 0)) this.text(e.x, e.y - 34, 'Câm!', '#C8C8D8', 0.6, 12);
      e.silenceT = Math.max(e.silenceT || 0, e.def.boss ? 1 : 2);
    }
    if (E.heal && R() < E.heal) {
      const amt = (hero.hpMaxLast || 0) * 0.02;
      for (const o of this.heroes) if (o && !o.dead && Math.hypot(o.x - hero.x, o.y - hero.y) <= 120) o.hp = Math.min(o.hpMaxLast || o.hp, o.hp + amt);
      this.proc(hero, 'moc1', hero.x, hero.y - 24, '#5FB84A', 16);
    }
  }

  // v92: hiệu ứng Thần khí khi đánh trúng
  legacyOnHit(e, hero, st) {
    const L = st.lg;
    if (L.burnHit && !(e.poisonT > 0)) this.dot(e, st.damage * L.burnHit / 100, hero, '#E0452C', 'magic', 3);
    if (L.slowHit) this.slow(e, L.slowHit, 1);
    if (L.manaOnHit) hero.mana = Math.min(st.maxMana, hero.mana + L.manaOnHit);
    if (L.stunEvery) {
      hero.lgHitN = (hero.lgHitN || 0) + 1;
      if (hero.lgHitN >= L.stunEvery) { hero.lgHitN = 0; this.stun(e, 0.8, 'stun'); this.proc(e, 'tusk', e.x, e.y - 16, '#F2D27A', 20); }
    }
    if (L.splashHit) {
      for (const o of this.enemiesInRange(e.x, e.y, 70)) if (o !== e) this.hit(o, st.damage * L.splashHit / 100, hero, { silent: true });
    }
    if (L.chainHit && srand() * 100 < L.chainHit) {
      let px = e.x, py = e.y - 14;
      for (const o of this.enemiesInRange(e.x, e.y, 140).filter((o) => o !== e).slice(0, 3)) {
        this.effects.push({ type: 'streak', x: px, y: py, x2: o.x, y2: o.y - 14, color: '#BFE8FF', w: 4, ttl: 0.3, max: 0.3 });
        this.hit(o, st.damage * 0.5, hero, { dt: 'magic', silent: true });
        px = o.x; py = o.y - 14;
      }
    }
  }

  // v91: Ấn Phù kỹ năng khi đánh trúng
  runeOnHit(e, hero, st, crit) {
    const RF = runeFx(hero);
    if (RF.fx.slow) this.slow(e, RF.fx.slow, 1);
    if (crit && RF.sk.g_storm) {
      const near = this.enemiesInRange(e.x, e.y, 150).filter((o) => o !== e && !o.dead).slice(0, RF.sk.g_storm);
      for (const o of near) {
        this.effects.push({ type: 'streak', x: e.x, y: e.y - 14, x2: o.x, y2: o.y - 14, color: '#B8F0C8', w: 3, ttl: 0.25, max: 0.25 });
        this.hit(o, st.damage * 0.6, hero, { silent: true });
      }
    }
    if (RF.sk.n_quake) {
      hero.quakeN = (hero.quakeN || 0) + 1;
      if (hero.quakeN >= RF.sk.n_quake) {
        hero.quakeN = 0;
        this.effects.push({ type: 'ring', x: e.x, y: e.y, r: 80, color: '#D9844A', ttl: 0.4, max: 0.4 });
        for (const o of this.enemiesInRange(e.x, e.y, 80)) { if (o !== e) this.hit(o, st.damage * 0.6, hero, { silent: true }); this.slow(o, 30, 1.5); }
      }
    }
    if (RF.sk.s_chain && srand() * 100 < RF.sk.s_chain) {
      const near = this.enemiesInRange(e.x, e.y, 140).filter((o) => o !== e && !o.dead).slice(0, 3);
      let px = e.x, py = e.y - 14;
      for (const o of near) {
        this.effects.push({ type: 'streak', x: px, y: py, x2: o.x, y2: o.y - 14, color: '#BFD8FF', w: 4, ttl: 0.3, max: 0.3 });
        this.hit(o, st.damage * 0.5, hero, { dt: 'magic', silent: true });
        px = o.x; py = o.y - 14;
      }
    }
  }

  kill(e, hero) {
    e.dead = true;
    const eliteMult = e.elite ? 2.5 : 1;
    let gold = Math.round(e.def.gold * (1 + this.wave * 0.04) * eliteMult);
    if (hero && this.heroes[hero.slot] === hero) gold += Math.round(heroStats(hero).goldOnKill);
    if (e.huntT > 0) gold += 3;
    this.addGold(gold);
    this.stats.kills++;
    this.text(e.x, e.y - 20, '+' + gold, '#F2D27A', 0.7);
    for (let i = 0; i < 6; i++) {
      this.effects.push({ type: 'spark', x: e.x, y: e.y - 8, a: srand() * 6.28, color: e.def.color, ttl: 0.4, max: 0.4 });
    }
    this.effects.push({ type: 'die', x: e.x, y: e.y, etype: e.type, dir: e.dir, ttl: 0.4, max: 0.4 });
    // xác quái: chớp trắng, ngã nghiêng, co lại và chìm xuống nước (0,45 giây) thay vì biến mất ngay
    this.effects.push({ type: 'corpse', x: e.x, y: e.y, enemy: { ...e, hitT: 0, kbT: 0, stunT: 0, reviveT: 0 }, dir: (e.kbDir || e.dir || 1), ttl: 0.45, max: 0.45 });
    if (hero && this.heroes[hero.slot] === hero) {
      hero.kills++;
      // v95: Tu Vi — ghi công cho loại tướng (tướng ghép chia 50% cho tướng nguyên liệu)
      const xp = e.def.boss ? TUVI_KILL.boss : e.champion || e.def.general ? TUVI_KILL.big : e.elite ? TUVI_KILL.elite : TUVI_KILL.normal;
      const log = this.xpLog || (this.xpLog = {});
      log[hero.type] = (log[hero.type] || 0) + xp;
      for (const a of heroLineage(hero)) log[a.type] = (log[a.type] || 0) + xp * 0.5;
      this.onKillFx(e, hero);
      if (hero.type === 'viemde') healHeroes(this, hero.x, hero.y, 9999, 0.02, '#FFB04A');   // Lửa Nuôi Muôn Dân
      const RF = runeFx(hero);
      if (RF) {
        if (RF.fx.killMana) hero.mana = Math.min(heroStats(hero).maxMana, hero.mana + RF.fx.killMana);
        if (RF.sk.g_frenzy) { hero.windN = hero.windT > 0 ? Math.min(5, (hero.windN || 0) + 1) : 1; hero.windT = 3; }
        if (RF.sk.s_soul) {
          const near = this.enemiesInRange(e.x, e.y, 80).filter((o) => o !== e && !o.dead);
          if (near.length) {
            this.effects.push({ type: 'nova', x: e.x, y: e.y, r: 80, ttl: 0.4, max: 0.4 });
            for (const o of near) this.hit(o, e.maxHp * RF.sk.s_soul / 100, hero, { dt: 'magic', silent: true });
          }
        }
      }
    }
    // ẩn Thần Sương Núi: quái chết khi đang đóng băng thì vỡ băng, làm chậm quái xung quanh
    if (e.stunT > 0 && e.stunKind === 'ice') {
      const near = this.enemiesInRange(e.x, e.y, 90).filter((o) => o !== e);
      for (const o of near) this.slow(o, 50, 1.5);
      if (near.length) {
        this.effects.push({ type: 'nova', x: e.x, y: e.y, r: 90, ttl: 0.45, max: 0.45 });
        const ice = this.heroes.find((h) => h && h.type === 'thansuong');
        if (ice) this.discover('h.thansuong', ice.x, ice.y);
      }
    }

    if (e.def.split) {
      for (let i = 0; i < e.def.split.count; i++) this.spawn(e.def.split.type, Math.max(0, e.dist - 6 + i * 8));
      this.effects.push({ type: 'ring', x: e.x, y: e.y, r: 30, color: e.def.color, ttl: 0.4, max: 0.4 });
    }

    // v103/v104: Vô tận — hạ boss được Ngân khố, trả khi XONG ĐỢT (tải lại giữa đợt không nhận lại được)
    if (e.def.boss && this.endless) { this.bossKho = (this.bossKho || 0) + Math.round(PREP.endlessBoss * (this.hard ? 1.5 : 1)); this.bossKhoName = e.def.name; }
    if (e.def.boss) {
      this.bossesKilled++;
      this.notify(`Đã hạ ${e.def.name}!`, '#F0A030');
      this.shake = Math.max(this.shake, 8);
      this.sparks(e.x, e.y - 20, '#F2D27A', 24);
      const options = this.bossRewards(e.type);
      if (this.co) this.co.reward = { id: e.id, options, taken: -1 };   // co-op: ai chọn trước thì nhận (lệnh 'reward')
      this.events.push({ type: 'reward', boss: e.type, options, id: e.id });
    }
    if (srand() < e.def.drop * (e.elite ? 3 : 1)) {
      // quái tinh anh, boss, tướng địch: 25% rơi một món đồ bộ. v82: quái biến thể / ghép rơi từ Hiếm trở lên
      const id = (e.elite || e.def.boss || e.champion || e.def.general) && srand() < 0.25 ? rollSetItem()
        : rollItem(e.def.boss || e.elite || e.def.variant || e.def.chimera || e.def.general ? 'rare' : 'common');
      const inst = this.addItem(makeItem(id, null, { drop: true }));
      if (inst) {
        const it = ITEMS[id];
        this.notify(`Rơi đồ: ${it.name} (${RARITY[it.rarity].name})`, RARITY[it.rarity].color);
        this.effects.push({ type: 'drop', x: e.x, y: e.y, color: RARITY[it.rarity].color, ttl: 1, max: 1 });
      }
    }
  }

  // hiệu ứng khi tướng hạ quái (đồ ghép, đồ bộ, hiệu ứng ẩn)
  onKillFx(e, h) {
    const st = heroStats(h);
    const hid = st.hid;
    if (st.goldOnKill) this.effects.push({ type: 'coin', x: e.x, y: e.y - 16, ttl: 0.6, max: 0.6 });
    if (hid['i.moc1'] && !h.dead) {
      this.proc(h, 'moc1', h.x, h.y - 24, '#5FB84A');
      h.hp = Math.min(st.hpMax, h.hp + st.hpMax * 0.03);
      this.discover('i.moc1', h.x, h.y);
    }
    if (h.type === 'thansan' && e.def.flying && !h.dead) {
      h.huntT = 3;
      this.proc(h, 'hunt', h.x, h.y - 24, '#7FC24A');
      this.discover('h.thansan', h.x, h.y);
    }
    if (hid['r.song_riu']) {
      h.rageT = 3;
      h.rageN = Math.min(5, (h.rageN || 0) + 1);
      this.proc(h, 'rage', h.x, h.y - 24, '#E74C3C');
      if (h.rageN >= 2) this.discover('r.song_riu', h.x, h.y);
    }
    if (e.type === 'tom' && hid['r.riu_quet']) {
      h.tomKills = (h.tomKills || []).filter((t) => this.time - t < 0.6);
      h.tomKills.push(this.time);
      if (h.tomKills.length >= 5) {
        h.tomKills = [];
        this.addGold(10);
        this.text(h.x, h.y - 80, 'Quét sạch! +10', '#FFD66B', 1, 14);
        this.discover('r.riu_quet', h.x, h.y);
      }
    }
    if (e.type === 'phuthuy' && hid['r.ngoc_tran_thuy']) {
      for (const o of this.enemiesInRange(e.x, e.y, 110)) if (!o.def.boss) this.hit(o, o.maxHp * 0.1, h, { dt: 'pure', silent: true });
      this.effects.push({ type: 'ring', x: e.x, y: e.y, r: 110, color: '#2F6FB0', ttl: 0.5, max: 0.5 });
      this.discover('r.ngoc_tran_thuy', h.x, h.y);
    }
    if (h.type === 'xathu' && e.def.flying) {
      h.airKills = (h.airKills || 0) + 1;
      if (h.airKills % 10 === 0 && h.airKills <= 100) {
        this.text(h.x, h.y - 80, 'Mắt quen trời: +1% tầm', '#9EDDF2', 1.2, 13);
        this.discover('h.xathu', h.x, h.y);
      }
    }
    if (e.type === 'chimbao' && hid['s.chimlac'] && srand() < 0.2) {
      const t = this.findTarget(e.x, e.y, 400);
      if (t) {
        this.effects.push({ type: 'bird', kind: 'lac', x: e.x, y: e.y - 30, target: t, ttl: 0.6, max: 0.6,
          onEnd: () => this.hit(t, st.damage * 1.5, h, { big: true, color: '#F2E6C8' }) });
        this.discover('s.chimlac', h.x, h.y);
      }
    }
    if (hid['s.nguasat'] && !(h.breathCd > 0)) {
      h.killTimes = (h.killTimes || []).filter((t) => this.time - t < 2);
      h.killTimes.push(this.time);
      if (h.killTimes.length >= 3) {
        h.killTimes = [];
        h.breathCd = 6;
        const t = this.findTarget(h.x, h.y, st.range * 2, false) || e;
        this.lineHit(h, t, 320, st.damage * 2.5, { color: '#FF8A2E', width: 20, dt: 'magic' });
        this.discover('s.nguasat', h.x, h.y);
      }
    }
  }

  // Vua Hùng ban thưởng: chọn 1 trong 3
  // claude/can-bang-phan-thuong: ô 1 Sính lễ (bốc ngẫu nhiên như v181); ô 2, 3 hai kiểu thuộc 2 nhóm khác nhau
  // (RW_KIND: Sức mạnh / Kinh tế / An nguy). Cả 3 ô chỉnh số theo "vàng tương đương" cho gần ngân sách V.
  bossRewards(bossType) {
    // v181: sính lễ bốc ngẫu nhiên có trọng số (rollSinhLe trong data.js), mốc lớn tăng tỉ lệ món hiếm
    const big = slBigWave(this.wave);
    const owned = this.inventory.map((i) => i.id);
    for (const h of this.heroes) if (h) for (const s of SLOTS) if (h.equip[s]) owned.push(h.equip[s].id);
    this.slHist = this.slHist || [];
    const sl = rollSinhLe({ hist: this.slHist, owned, big });
    this.slHist = this.slHist.concat(sl).slice(-6);
    const rates = this.rwRates();
    const gift = { kind: 'item', id: sl, title: `Sính lễ ${ITEMS[sl].name}`, sinhLe: true, big, tag: 'bau' };
    const base = RW.budget(this.wave);
    const V = Math.round(Math.min(base * RW.slMax, Math.max(base * RW.slMin, this.rewardValue(gift, rates))));
    const opts = [this.rwFit(gift, V, rates)];
    // 2 kiểu cho ô 2, 3: 2 nhóm khác nhau, không lặp đúng cặp của lần trước
    const heEl = this.rwHeEl();
    const fams = { suc: ['do', 'luyen'].concat(heEl ? ['he'] : []), kinh: ['ngay', 'lau'], an: ['thu', 'ruiro'] };
    const pick = (a) => a[Math.floor(srand() * a.length)];
    let pair;
    for (let k = 0; k < 6; k++) {
      const fs = Object.keys(fams), f1 = fs.splice(Math.floor(srand() * 3), 1)[0], f2 = pick(fs);
      pair = [pick(fams[f1]), pick(fams[f2])].sort((a, b) => (RW_KIND[a].fam === 'suc' ? -1 : 0) - (RW_KIND[b].fam === 'suc' ? -1 : 0));
      if (pair.join() !== (this.rwHist || '')) break;
    }
    this.rwHist = pair.join();
    for (const tag of pair) opts.push(this.rwMake(tag, V, rates, bossType, heEl));
    return opts;
  }

  // ---------- "vàng tương đương" (claude/can-bang-phan-thuong)
  // vàng cần để tăng 1 điểm lực chiến của tướng h bằng cách lên cấp (tướng cấp tối đa: trung vị các tướng khác)
  rwRates() {
    const m = new Map(), all = [];
    for (const h of this.heroes) {
      if (!h || h.level >= CONFIG.maxLevel) continue;
      const p0 = heroPower(h); h.level++; const p1 = heroPower(h); h.level--; heroStats(h);
      if (p1 > p0) { const r = this.levelCost(h) / (p1 - p0); m.set(h, r); all.push(r); }
    }
    all.sort((a, b) => a - b);
    m.mid = all.length ? all[all.length >> 1] : 5;
    return m;
  }
  rwPowGold(h, dp, rates) { return dp * (rates.get(h) || rates.mid); }
  // đồ: gán lần lượt từng món cho tướng lợi nhất (món sau tính trên đồ đã mặc thử của món trước)
  rwItemsGold(ids, rates) {
    const tried = [];
    let sum = 0;
    for (const id of ids) {
      const inst = makeItem(id);
      let best = null, bg = 0;
      for (const h of this.heroes) { if (!h) continue; const gn = this.rwPowGold(h, upgradeGain(h, inst), rates); if (gn > bg) { bg = gn; best = h; } }
      if (!best) continue;
      const sl = slotFor(best, inst);
      tried.push([best, sl, best.equip[sl]]);
      best.equip[sl] = inst;
      sum += bg;
    }
    for (const [h, sl, old] of tried.reverse()) h.equip[sl] = old;
    for (const h of this.heroes) if (h) heroStats(h);
    return sum;
  }
  rwLevelGold(o) {
    let v = 0;
    for (const h of this.heroes) {
      if (!h || (o.who && !o.who.includes(h.id))) continue;
      const L = h.level;
      for (let i = 0; i < o.levels && h.level < CONFIG.maxLevel; i++) { v += this.levelCost(h); h.level++; }
      h.level = L;
    }
    return v;
  }
  rwHeGold(el, pct, rates) {
    let v = 0;
    for (const h of this.heroes) {
      if (!h || HEROES[h.type].el !== el) continue;
      const b = h.buff, p0 = heroPower(h);
      h.buff = Object.assign({}, b, { elPct: ((b && b.elPct) || 0) + pct });
      v += this.rwPowGold(h, heroPower(h) - p0, rates);
      h.buff = b; heroStats(h);
    }
    return v;
  }
  // hệ có nhiều lực chiến nhất trên sân (cần ít nhất 2 tướng cùng hệ)
  rwHeEl() {
    const n = {}, p = {};
    for (const h of this.heroes) if (h) { const el = HEROES[h.type].el; n[el] = (n[el] || 0) + 1; p[el] = (p[el] || 0) + heroPower(h); }
    const els = Object.keys(n).filter((el) => n[el] >= 2).sort((a, b) => p[b] - p[a]);
    return els[0] || null;
  }
  rwSafeP() {
    const L = (this.lossLog || []).slice(-3);
    return L.length ? L.filter((x) => !x).length / L.length : RW.betP;
  }
  rewardValue(o, rates = this.rwRates()) {
    let v = (o.gold || 0) + (o.lives || 0) * RW.mangG;
    if (o.kind === 'item') {
      v += this.rwItemsGold(o.ids || [o.id], rates);
      if (ITEMS[o.id] && ITEMS[o.id].revive) v += RW.reviveG(this.wave);
    } else if (o.kind === 'levelup') v += this.rwLevelGold(o);
    else if (o.kind === 'income') v += o.per * o.waves * RW.lauDisc;
    else if (o.kind === 'elbuff') v += this.rwHeGold(o.el, o.pct, rates);
    else if (o.kind === 'bet') { const p = this.rwSafeP(); v = (o.lives || 0) * RW.mangG + p * o.win + (1 - p) * o.lose; }
    return Math.round(v);
  }
  // ô thiếu so với V thì kèm vàng cho đủ
  rwFit(o, V, rates) {
    const v = this.rewardValue(o, rates);
    if (v < V * (1 - RW.bal / 2)) o.gold = (o.gold || 0) + Math.round((V - v) / 10) * 10;
    o.val = this.rewardValue(o, rates);
    return o;
  }
  rwMake(tag, V, rates, bossType, heEl) {
    const r10 = (x) => Math.max(10, Math.round(x / 10) * 10);
    if (tag === 'ngay') return { kind: 'treasure', tag, gold: r10(V), lives: 0, title: 'Kho lúa', val: r10(V) };
    if (tag === 'lau') {
      const per = Math.max(5, Math.round(V * RW.lauMul / RW.lauN / 5) * 5);
      return this.rwFit({ kind: 'income', tag, per, waves: RW.lauN, title: 'Ruộng công điền' }, V, rates);
    }
    if (tag === 'thu') {
      const lives = RW.thuLives(V);
      return this.rwFit({ kind: 'treasure', tag, gold: 0, lives, title: 'Đắp thành' }, V, rates);
    }
    if (tag === 'ruiro') return this.rwFit({ kind: 'bet', tag, win: r10(V * RW.betWin), lose: r10(V * RW.betLose), title: 'Cược với thần sông' }, V, rates);
    if (tag === 'he') {
      let pct = RW.heMin;
      while (pct < RW.heMax && this.rwHeGold(heEl, pct + 5, rates) <= V * (1 + RW.bal / 2)) pct += 5;
      return this.rwFit({ kind: 'elbuff', tag, el: heEl, pct, title: `Hệ ${ELEMENTS[heEl].name} hưng thịnh` }, V, rates);
    }
    if (tag === 'luyen') {
      // chọn số tướng mạnh nhất (K) và số cấp (1–3) cho tổng vàng lên cấp gần V nhất
      const top = this.heroes.filter((h) => h && h.level < CONFIG.maxLevel).sort((a, b) => heroPower(b) - heroPower(a));
      let best = null;
      for (let lv = 1; lv <= 3; lv++) for (let k = 1; k <= top.length; k++) {
        const o = { kind: 'levelup', tag, levels: lv, who: top.slice(0, k).map((h) => h.id), title: 'Hội làng mừng thắng' };
        const v = this.rwLevelGold(o), d = v > V * (1 + RW.bal / 2) ? (v - V) * 3 : V - v;
        if (!best || d < best.d) best = { o, d };
      }
      if (!best) return this.rwMake('ngay', V, rates);
      best.o.names = this.heroes.filter((h) => h && best.o.who.includes(h.id)).map((h) => HEROES[h.type].name);
      return this.rwFit(best.o, V, rates);
    }
    // Hũ Vua Hùng (v37): nhiều món, chọn món hợp với các tướng mạnh nhất trên sân; dư so với V thì bớt món
    const lvl = { thuongluong: 0, haba: 1, thuytinh: 2 }[bossType] || 0;
    const plan = [['epic', 'epic'], ['set', 'epic', 'epic'], ['set', 'set', 'epic']][lvl];
    const ids = [];
    for (const r of plan) ids.push(this.jarPick(r, ids));
    const o = { kind: 'item', tag: 'do', id: ids[0], ids, title: 'Hũ Vua Hùng', jar: true };
    while (o.ids.length > 1 && this.rewardValue(o, rates) > V * (1 + RW.bal / 2)) o.ids.pop();
    return this.rwFit(o, V, rates);
  }

  // bốc tối đa 10 món cùng độ hiếm (bỏ món đã có trong hũ), lấy món tăng lực chiến nhiều nhất cho 3 tướng mạnh nhất
  jarPick(rarity, taken = []) {
    const top = this.heroes.filter(Boolean).sort((a, b) => heroPower(b) - heroPower(a)).slice(0, 3);
    let best = null, bg = -1;
    for (let i = 0; i < 10; i++) {
      const id = rarity === 'set' || rarity === 'legendary' ? rollSetItem() : rollItem(rarity);
      if (taken.includes(id)) continue;          // không ra 2 món trùng trong một hũ
      const inst = makeItem(id);
      const gain = top.reduce((m, h) => Math.max(m, upgradeGain(h, inst)), 0);
      if (gain > bg) { bg = gain; best = id; }
    }
    return best || (rarity === 'set' || rarity === 'legendary' ? rollSetItem() : rollItem(rarity));
  }

  claimReward(o) {
    if (o.kind === 'item') {
      for (const id of o.ids || [o.id]) this.addItem(id);
    } else if (o.kind === 'levelup') {
      for (const h of this.heroes) {
        if (!h || (o.who && !o.who.includes(h.id))) continue;
        let n = 0;
        for (let i = 0; i < o.levels && h.level < CONFIG.maxLevel; i++) {
          const before = heroStats(h).hpMax;
          h.level++;
          h.skillPts++;
          n++;
          if (!h.dead) h.hp += heroStats(h).hpMax - before;
        }
        if (n) this.levelFx(h, n);
      }
    } else if (o.kind === 'income') {
      // Lâu dài: nhận o.per vàng khi xong mỗi đợt, o.waves đợt (cộng dồn nếu chọn nhiều lần)
      this.incomes = (this.incomes || []).concat({ per: o.per, left: o.waves });
    } else if (o.kind === 'elbuff') {
      this.elBuff = Object.assign({}, this.elBuff);
      this.elBuff[o.el] = (this.elBuff[o.el] || 0) + o.pct;
      this.updateAuras();
    } else if (o.kind === 'bet') {
      // Rủi ro: tới hết đợt kế mà không mất mạng nào → o.win, mất mạng → o.lose
      this.bet = { until: this.wave + 1, lost0: this.lostN || 0, win: o.win, lose: o.lose };
    }
    if (o.gold) this.addGold(o.gold);
    if (o.lives) this.gainLives(o.lives);
  }
  // xong đợt: trả vàng Lâu dài, chốt cược Rủi ro
  rwWaveEnd() {
    let pay = 0;
    for (const x of this.incomes || []) if (x.left > 0) { pay += x.per; x.left--; }
    if (this.incomes) this.incomes = this.incomes.filter((x) => x.left > 0);
    if (pay) { this.addGold(pay); this.notify(`Ruộng công điền: +${pay} vàng`, '#E8C070'); }
    const b = this.bet;
    if (b && this.wave >= b.until) {
      const ok = (this.lostN || 0) === b.lost0;
      this.addGold(ok ? b.win : b.lose);
      this.notify(ok ? `Thắng cược thần sông! +${b.win} vàng` : `Thua cược (thành mất mạng): chỉ +${b.lose} vàng`, ok ? '#FFD66B' : '#FF8A6A');
      this.bet = null;
    }
  }

  text(x, y, str, color, ttl, size) {
    this.effects.push({ type: 'text', x, y, str: String(str), color, ttl, max: ttl, vy: -40, size: size || 15 });
  }
}

// Chỉ số không tính hào quang (dùng khi tính hào quang để tránh vòng lặp)
function heroStatsNoAura(h) {
  const saved = h.buff;
  h.buff = {};
  const s = heroStats(h);
  h.buff = saved;
  let hasteAura = 0;
  for (const slot of ACC_SLOTS) {
    const inst = h.equip[slot];
    if (inst && ITEMS[inst.id].hasteAura) hasteAura = Math.max(hasteAura, ITEMS[inst.id].hasteAura);
  }
  s.hasteAura = hasteAura;
  return s;
}
