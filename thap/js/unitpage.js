// TURRET MERGE — TRANG HỒ SƠ Ụ (ngoài trận, kiểu màn chi tiết thẻ của DCDW)
// Mở từ màn chọn bộ bài: chạm thẻ = mở hồ sơ; nút nhỏ góc thẻ = thêm/bỏ nhanh khỏi bộ bài.
// Toàn bộ nội dung đọc từ dữ liệu sẵn có (roster, TEXT, SKILLS, SUP, HO, MOC, GROW, STAGE_K…) → ụ mới tự có trang.
// Xem trước TRỰC TIẾP = iframe chạy chính game ở chế độ ?preview=<id> (đúng hiệu ứng thật), cắt khung quanh bàn.
'use strict';

const UP_Q = new URLSearchParams(location.search);
const UP_XEM = UP_Q.get('preview');

// ===================================================== chữ hiển thị =====================================================
// sentence case: từ IN HOA ≥2 chữ → thường (giữ PvP, HP, LV…), viết hoa chữ đầu câu
const UP_GIU = { PVP: 'PvP', HP: 'HP', LV: 'LV', AI: 'AI', ID: 'ID', OK: 'OK', BINGO: 'bingo' };
for (const h of ['NS', 'NW', 'NE', 'SW', 'SE', 'WE', 'NSW', 'NSE', 'NWE', 'SWE', 'NSWE']) UP_GIU[h] = h; // Pháo La Bàn: tên tổ hợp hướng giữ chữ HOA
function upSC(s) {
  if (s == null) return '';
  s = String(s).replace(/(^|[^\p{L}\p{N}])(\p{Lu}[\p{Lu}'’]+)(?![\p{L}\p{N}])/gu, (m, a, w) => a + (UP_GIU[w] || w.toLowerCase()));
  return s.replace(/^([^\p{L}\p{N}]*)(\p{Ll})/u, (m, a, b) => a + b.toUpperCase()); // \p{L}: chữ Việt có dấu (Đạn) không bị viết hoa giữa từ
}
const upEsc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const upTen = (id) => (TEXT.turret[id] && TEXT.turret[id].name) || (G.rosterMap[id] && G.rosterMap[id].ten) || id;
const upCo = (id) => !!(SKILLS[id] && G.rosterMap[id]);

const UP_TXT = {
  back: 'Back', file: (i, n) => 'File ' + i + ' / ' + n,
  add: 'Add to deck', remove: 'Remove from deck', deck: (n) => 'Deck ' + n + '/5', locked: 'Not playable yet',
  role: { tc: 'Attack', ht: 'Support', ctl: 'Control', db: 'Special' },
  roleMo: {
    tc: 'Deals the damage. Build your deck around 2 or more of these.',
    ht: 'Never attacks. Boosts the turrets next to it (up, down, left, right unless stated); stronger at 3/5/7★. Copies of the same Support don’t stack.' /* rà phần đã bỏ: hết trần hỗ trợ (07/11) */,
    ctl: 'Its merge hits the rival in PvP, or helps your ally in co-op.',
    db: 'Bends the rules: freezes, marks, mana, odd merges, swaps or transformations. Little or no direct damage.',
  },
  target: { dau: 'Lead enemy', mau: 'Toughest enemy', ngau: 'Random enemy', tu: 'Own pattern', khong: 'Does not shoot' },
  sec: { skill: 'Skill', test: 'Test range', stars: 'Star levels', grow: 'Forms', foot: 'Buff footprint', merge: 'Merge rules', modes: 'Modes and deck', family: 'Family ladder', pair: 'Partners and counters' },
};

// ===================================================== dữ liệu suy ra =====================================================
function upVai(id) {
  const sk = SKILLS[id]; if (!sk) return null;
  if (sk.vai === 'db' && /PVP|rival/i.test((TEXT.turret[id] || {}).skill || '')) return 'ctl';
  return UP_TXT.role[sk.vai] ? sk.vai : 'db';
}
function upNham(id) {
  const sk = SKILLS[id] || {};
  if (!sk.dmg) return UP_TXT.target[{ bang: 'dau', doc: 'dau', bomhen: 'ngau', orbital: 'tu' }[id] || 'khong']; // Vệ Tinh: không bắn thường nhưng thức tỉnh thả bom → kiểu riêng
  if (sk.chonMuc || NHIP[id]) return UP_TXT.target.tu;
  return UP_TXT.target[sk.nham] || UP_TXT.target.dau;
}
// ụ KHÔNG BẮN (dmg 0, trừ Băng/Độc/Bom Hẹn Giờ/Vệ Tinh — các ụ này vẫn nhắm quái trên đường): tầm = VÙNG tác dụng thật, không bao giờ "Whole path"
//   (09/11 người dùng: "Cổng Ấp Nở không có dame nên không bắn được" — trang ụ ghi Tầm bắn "Toàn đường đi" là vô lý). Không có vùng → "—".
const UP_NHAM_QUAI = { bang: 1, doc: 1, bomhen: 1, orbital: 1 };
function upKhongBan(id) { const sk = SKILLS[id]; return !!sk && !sk.dmg && !UP_NHAM_QUAI[id]; }
function upVung(id) {
  const sk = SKILLS[id] || {};
  if (sk.toanBan) return 'Whole board';
  if (upCheo(id)) return '4 diagonals';
  if (id === 'cauvong') return '4 neighbours + path'; // Cầu Vồng: ụ Tấn công kề + vệt cầu vồng trên đường
  if (sk.hoTro || id === 'khoisinh') return '4 neighbours'; // Lõi Khởi Sinh: tặng sao ụ kề (trên/dưới/trái/phải)
  return '—'; // Máy Mana, Hộp Bí Ẩn, Trứng Tiến Hoá, Đe Rèn, Cổng Ấp Nở…: không bắn, không vùng
}
function upTam(id) { const sk = SKILLS[id] || {}; if (upKhongBan(id)) return upVung(id); return typeof sk.tam === 'number' ? 'Melee · ' + sk.tam + ' px' : 'Whole path'; }

// chạy fn(B) trên một bàn tạm (màn chọn không có trận) — mọi công thức chỉ số dùng G.ban[T.ban]
function upBanTam(id, fn) {
  const cu = G.ban;
  try { const B = taoBan(boCuc('solo').ban[0], 0, [id], 'hero'); G.ban = [B]; return fn(B); }
  catch (e) { return null; }
  finally { G.ban = cu; }
}
// bảng ★1→★7: sát thương · tốc bắn · dòng kỹ năng
function upBangSao(id) {
  const sk = SKILLS[id]; if (!sk) return [];
  return upBanTam(id, (B) => {
    const ra = [];
    for (let s = 1; s <= 7; s++) {
      const T = taoU(B, id, s, 7); B.t.fill(null); B.t[7] = T; T.nguon = [];
      try { mocBuf(B); } catch (e) { }
      let dmg = null, toc = '', kn = '';
      try { if (sk.dmg) dmg = Math.round(dmgU(T)); } catch (e) { }
      try { toc = tocTT(id, T) || ''; } catch (e) { }
      try { kn = SUP[id] ? SUP[id].chu(T) : sk.mo ? sk.mo(T) : ''; } catch (e) { kn = ''; }
      ra.push({ s, dmg, toc, kn: upSC(kn) });
    }
    return ra;
  }) || [];
}
// ô được buff (lệch [cột, hàng] so với ụ) ở 1–4★ và từ 5★
// ụ chỉ buff ô CHÉO (Resonance Grid) — Sanctum có sk.huong nhưng là 4 ô thẳng (5★: 8 ô)
function upCheo(id) { const sk = SKILLS[id]; if (!sk || !sk.huong) return false; const h = sk.huong({ id, sao: 1 }); return h.every(([a, b]) => a && b); }
function upDauChan(id) {
  const sk = SKILLS[id]; if (!sk || !sk.hoTro || !SUP_LOAI[id] || sk.toanBan) return null; // toanBan (Sync Cannon): cả bàn — không vẽ sơ đồ 4 ô kề
  const ke = [[0, -1], [1, 0], [0, 1], [-1, 0]], cheo = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  // hình ô theo ĐÚNG sk.huong(T) ở 1★ và 5★ (Sanctum: 4 ô thẳng → 5★ đủ 8 ô; Resonance Grid: 4 ô chéo) — VFX P0
  const goc = sk.huong ? sk.huong({ id, sao: 1 }) : ke, goc5 = sk.huong ? sk.huong({ id, sao: 5 }) : null;
  const co5 = loaiMoc(id) === 'ht' && !(MOC_RIENG[id] && MOC_RIENG[id][5]) && !sk.huong;
  return { k: SUP_LOAI[id], a: goc, b: co5 ? ke.concat(cheo) : goc5 && goc5.length !== goc.length ? goc5 : null };
}
// ghép: luật chung + luật riêng
function upLuatGhep(id) {
  const sk = SKILLS[id] || {}, ten = upTen(id), L = [];
  const mo1 = upBanTam(id, (B) => { const T = taoU(B, id, 1, 7); B.t[7] = T; return sk.mo ? sk.mo(T) : ''; }) || '';
  if (id === 'canon') { // Pháo La Bàn: luật TỔ HỢP HƯỚNG (người dùng 08/11)
    L.push(['Directions', 'Each Compass Cannon gets 1 random direction: N, S, W or E. Each direction fires 1 homing rocket.']);
    L.push(['Combine', 'Drag a Compass onto another Compass: the result has both directions (N + S = NS, NS + W = NSW, NSW + E = NSWE). Stars can be different.']);
    L.push(['Star', 'Result star = average of the two, rounded up (3★ + 4★ = 4★). No +1★.']);
    L.push(['Same directions', 'Same or fewer directions can merge too (N + N = N, NS + N = NS): the directions stay, star = average.']);
    L.push(['NSWE', 'An NSWE Compass cannot merge with a Compass that is not NSWE.']);
    L.push(['Stack', 'NSWE + NSWE = NSWE + 1 stack (both stacks are kept). Each stack +' + Math.round(knThe(null, 'canon')) + '% damage. No limit.']);
    L.push(['Other merges', 'Mimic merges give a random turret as usual. Merge King raises the star and keeps the directions + stacks. A Copycat copy keeps them too.']);
    return L.concat([['Stone', 'If Janus Cube petrifies it, it only merges with stone of the same star (result: a higher-star stone).']]);
  }
  if (id === 'bienmau') { // Prism Thief: HỢP THỂ (08/11 lần 2) — skills7.js, docs/demo-hop-tuong/tuvan/prism/THIET-KE.md
    L.push(['Colour', 'Each Prism Thief gets 1 random colour when it appears: red kills, gold gives mana, blue freezes, green crits.']);
    L.push(['Fusion', 'Put 4 Prisms of 4 different colours side by side and swipe one line through all 4. They fuse into ONE 4-colour Spectrum Prism on the last tile. The other 3 tiles become empty. This counts as a merge.']);
    L.push(['Spectrum Prism', 'Has all 4 effects on every hit. Each fusion: +' + Math.round(SKILLS.bienmau.HOP_DMG * 100) + '% damage, +' + Math.round(SKILLS.bienmau.HOP_TOC * 100) + '% fire rate and higher chances. Stacks of all 4 Prisms add up. Star = the highest star of the 4.']);
    L.push(['Fuse again', 'Swipe the mask with 3 Prisms of different colours (the mask counts as any colour), or drag a Spectrum Prism onto another one. The fusion number adds up. No limit.']);
    L.push(['Other merges', 'A Spectrum Prism does not merge normally (no Mimic, no random turret). Merge King raises its star and keeps the fusion. A Copycat copy is a new Prism with a new random colour.']);
    return L.concat([['Stone', 'If Janus Cube petrifies it, it cannot fuse until the stone is broken.']]);
  }
  if (id === 'tudo') { // Wild Link: ghép tự do (game.js laTuDo / saoGhep) — 08/11
    L.push(['Wild merge', 'Drag it onto ANY turret, or any turret onto it: any type, any star. The result is a random turret from your deck.']);
    L.push(['Star', 'Result star = average of the two, rounded up (1★ + 2★ = 2★, 3★ + 4★ = 4★, 2★ + 6★ = 4★). No +1★. While you drag, the star badge shows the result; a −★ note means you lose stars.']);
    L.push(['Bonus', Math.round(tdThuong(null) * 100) + '% chance the result gets +1★ (higher with card level).']);
    L.push(['Real merge', 'It counts as a merge: merge counters, Fusion Archive, Star Breaker and merge skills all work. Twin Maker also summons a turret at the average star.']);
    L.push(['Locked turrets', 'It also merges with Stone and Frozen turrets: the result is a normal, unlocked turret.']);
    L.push(['Special turrets', 'Compass Cannon, Prism Thief (even a Spectrum mask) and Lucky Slot also give a random new turret: their directions, fusion or stacks are not kept. The new turret rolls its own random traits.']);
    L.push(['Other skills', 'Merge King on it raises its star in place (not a merge). Copycat can copy it.']);
    return L.concat([['Stone', 'If Wild Link itself is stone or frozen, it cannot use its skill: a stone Wild Link only merges with stone of the same star.']]);
  }
  if (id === 'mimic') L.push(['Joker merge', 'Merges with any turret of the same star. The result gets +' + Math.round(knThe(null, 'mimic')) + '% damage for 8s.']);
  else if (sk.ghepDB) L.push([sk.ghepDB.laGhep ? 'Special merge' : 'Drag skill', upSC(mo1 || (TEXT.turret[id] || {}).skill) + '.']);
  if (sk.ghep) L.push(['Merge trigger', upSC((TEXT.turret[id] || {}).skill || mo1) + '.']);
  L.push(['Normal merge', sk.ghepDB && sk.ghepDB.cungLoai ? 'Two ' + ten + ' of the same star become one ' + ten + ' at +1★ (Golden is kept). Max 7★.' : 'Two ' + ten + ' of the same star merge into a random turret from your deck at +1★. Max 7★.']);
  L.push(['Stone', 'If Janus Cube petrifies it, it only merges with stone of the same star (result: a higher-star stone). Merge King can still raise a stone\'s star; Copycat can still copy it (the copy is a normal turret); Cleanser or Eve breaks the stone.']);
  return L;
}
function upCheDo(id) {
  const t = (TEXT.turret[id] || {}).skill || '', L = [], sk = SKILLS[id] || {}, r = G.rosterMap[id];
  const pv = t.match(/PVP:?\s*([^;.]*)/i), co = t.match(/Co-op:?\s*([^;.]*)/i), so = t.match(/Solo:?\s*([^;.]*)/i);
  if (pv) L.push(['PvP', upSC(pv[1].trim()) || 'Affects the rival board.']);
  if (co) L.push(['Co-op', upSC(co[1].trim()) || 'Helps your ally.']);
  if (so) L.push(['Solo', upSC(so[1].trim())]);
  if (!L.length) L.push(['All modes', 'Works the same in solo, co-op and PvP.']);
  if (r && r.bac === 'do') L.push(['Mythic', 'Max 1 Mythic per deck.' + (sk.chuDong ? (typeof laTuKich === 'function' && laTuKich(id) ? ' Its active skill fires by itself when charged (some unlock it at 3★).' : ' Tap it on the board when charged to fire its active skill (only Black Hole and Arcane Cascade; others fire by themselves).') : '')]);
  if (sk.vai === 'tc') L.push(['Deck tip', 'Take at least 2 attack turrets.']);
  return L;
}
// gợi ý cặp đôi theo họ / loại buff (chỉ chọn ụ đang chơi được)
const UP_HOP = {
  frost: ['kiembang', 'lanhgia', 'aten'], poison: ['aten', 'vungdoc', 'khuech'], blast: ['khuech', 'radar', 'chimang'], energy: ['radar', 'khuech', 'dongbo'],
  heavy: ['khuech', 'chimang', 'phagiap'], rapid: ['radar', 'tuthan', 'chimang'], crit: ['chimang', 'thaukinh', 'radar'], amp: ['tia', 'sungluc', 'railgun'],
  trap: ['bang', 'baotuyet', 'khuech'], execute: ['radar', 'lien', 'phun'], mana: ['nangluong', 'loa', 'nhanban'], summon: ['vughep', 'mimic', 'dongbo'],
  star: ['dongbo', 'ngoisao', 'mimic'], joker: ['vughep', 'nangsao', 'dongbo'], guard: ['soi', 'tia', 'overlord'], transform: ['nangsao', 'vughep', 'mimic'],
};
const UP_HT_HOP = { toc: ['lien', 'phun', 'cuongno'], crit: ['soi', 'bua', 'cuongno'], cham: ['kiembang', 'lophanung', 'bang'], dmg: ['tia', 'sungluc', 'railgun'], chet: ['phun', 'lien', 'maychem'], mana: ['nangluong', 'hutmana', 'loa'], khien: ['soi', 'overlord', 'tia'], taylo: ['soi', 'tia', 'overlord'] };
function upCapDoi(id) {
  const h = HO_CUA[id], k = SUP_LOAI[id];
  let ds = (k ? UP_HT_HOP[k] : null) || (h ? UP_HOP[h.ho] : null) || ['khuech', 'radar', 'mimic'];
  if (h) for (const b of HO[h.ho].bac) ds = ds.concat(b);
  const ra = [];
  for (const x of ds) if (x !== id && upCo(x) && !ra.includes(x)) ra.push(x);
  return ra.slice(0, 3).map(x => {
    let ly = 'Good pair';
    if (SUP_LOAI[x] && !SUP_LOAI[id]) ly = 'Gives it ' + BUFF[SUP_LOAI[x]].ten.toLowerCase();
    else if (k && !SUP_LOAI[x]) ly = 'Uses your ' + BUFF[k].ten.toLowerCase();
    else if (h && HO_CUA[x] && HO_CUA[x].ho === h.ho) ly = 'Same family';
    return { id: x, ly };
  });
}
function upKhac(id) {
  const h = HO_CUA[id], sk = SKILLS[id] || {}, tot = [], so = [];
  const T = { blast: 'Swarms and splitters', energy: 'Groups (hits chain)', heavy: 'Giants and bosses', frost: 'Fast runners', poison: 'Tanky waves', rapid: 'Steady streams',
    crit: 'Single tough targets', trap: 'Crowded paths', execute: 'Small enemies', amp: 'Bosses (they take more damage)', mana: 'Long games', summon: 'Filling the board fast',
    star: 'Late waves', joker: 'Fixing bad merges', guard: 'Boss skills', transform: 'Lucky streaks' };
  if (h && T[h.ho]) tot.push(T[h.ho]);
  if (sk.nham === 'mau' && !tot.includes(T.heavy)) tot.push(T.heavy);
  if (/\bslows\b|freez|chill/i.test((TEXT.turret[id] || {}).skill || '') || (h && h.ho === 'frost') || SUP_LOAI[id] === 'cham') so.push('Frost Flyers ignore slow.');
  if (typeof sk.tam === 'number') so.push('Only hits enemies close to it: place it next to the path.');
  if (sk.ghep || sk.ghepDB) so.push('Joker King can force a merge before you are ready.');
  if (sk.hoTro && SUP_LOAI[id]) so.push('Freezer and Janus Cube can lock it: keep a Cleanser or Shield Gen.');
  if (G.rosterMap[id] && G.rosterMap[id].bac === 'do') so.push('Nightmare snipes a random turret: −1★.');
  if (!so.length) so.push('Octopus Eyes burns turrets: −1★ unless cleansed.');
  if (!tot.length) tot.push('Most waves');
  return { tot, so: so.slice(0, 2) };
}
// ===================================================== CẤP THẺ KẾ TIẾP (07/11) =====================================================
// Chạy ụ ở 1★ với cấp thẻ k (hiện tại) và k+1 bằng CHÍNH hàm trận (dmgU, tocTT, knThe, THATSO.capThe, SUP.chu / sk.mo — đọc B.capThe)
//  → chỉ giữ con số thay đổi. Không chép công thức: đổi cân bằng ở data.js/skills*.js là trang tự đúng.
const UP_SO = /[-−+]?\d+(?:\.\d+)?(?:%|s\b)?/g;
const upSoV = (x) => parseFloat(String(x).replace('−', '-'));
const upSoGon = (v) => String(+(Math.round(v * 100) / 100));
const upHieu = (d, dv) => (d < 0 ? '−' : '+') + upSoGon(Math.abs(d)) + (dv || '');
// bỏ phần tự xem trước cấp sau trong mô tả ('(LV9 → LV10: +10.8%)', ', LV9 → LV10: +2.8%') — hàng cấp sau đã nói việc đó
function upBoLv(s) {
  return String(s || '').replace(/,?\s*LV\d+(?:\s*→\s*LV\d+)?(?::\s*[^,)·]*)?/g, '').replace(/\(\s*,\s*/g, '(').replace(/\s*\(\s*\)/g, '');
}
function upChup(id, k) {
  const sk = SKILLS[id], r0 = Math.random; let s = 12345;
  Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; // cùng hạt cho k và k+1 → dạng ngẫu nhiên lúc sinh (Sói, Vua Ghép vàng) không lệch
  try {
    return upBanTam(id, (B) => {
      B.capThe = Object.assign({}, B.capThe, { [id]: k });
      const T = taoU(B, id, 1, 7); B.t.fill(null); B.t[7] = T; T.nguon = [];
      try { mocBuf(B); } catch (e) { }
      const o = { dmg: null, toc: '', kn: '', the: null };
      try { o.the = knThe(B, id); } catch (e) { }
      try { if (sk.dmg) o.dmg = dmgU(T); } catch (e) { }
      try { o.toc = tocTT(id, T) || ''; } catch (e) { }
      try { o.kn = SUP[id] ? SUP[id].chu(T) : sk.mo ? sk.mo(T) : ''; } catch (e) { }
      return o;
    });
  } finally { Math.random = r0; }
}
// { max, lv, ds: [{k, ten, a, b, d}] (số có nhãn: sát thương · tốc bắn · chỉ số kỹ năng thẻ · trần), seg: [{chu, so}] (đoạn mô tả kỹ năng có số đổi) }
function upCapSau(id) {
  if (typeof THEBAI === 'undefined' || !SKILLS[id] || !G.rosterMap[id]) return null;
  const t = THEBAI.the(id);
  if (t.max) return { max: true, lv: t.lv, ds: [], seg: [] };
  const a = upChup(id, t.k), b = upChup(id, t.k + 1); if (!a || !b) return null;
  const ds = [], seg = [], e = KY_NANG_CAP[id];
  if (a.dmg != null && b.dmg != null && b.dmg - a.dmg > 1e-6) {
    const x = Math.round(a.dmg), y = Math.round(b.dmg), le = x === y; // chênh < 1: hiện 1 số lẻ để thấy tăng
    const f = (v) => le ? upSoGon(Math.round(v * 10) / 10) : String(Math.round(v));
    ds.push({ k: 'dmg', ten: 'Damage', a: f(a.dmg), b: f(b.dmg), d: upHieu(le ? Math.round((b.dmg - a.dmg) * 10) / 10 : y - x) });
  }
  const ta = a.toc.match(UP_SO), tb = b.toc.match(UP_SO);
  if (ta && tb && ta[0] !== tb[0]) ds.push({ k: 'toc', ten: 'Fire rate', a: ta[0], b: tb[0], d: upHieu(upSoV(tb[0]) - upSoV(ta[0]), /s$/.test(tb[0]) ? 's' : '') });
  if (e && a.the != null && b.the != null && Math.abs(b.the - a.the) > 1e-9) {
    // 1 số lẻ như hàng CARD LV (TBUI.knV); bước nhỏ hơn 0.1 → 2 số lẻ để vẫn thấy tăng
    const le = Math.round(a.the * 10) === Math.round(b.the * 10) ? 100 : 10, r = (v) => String(Math.round(v * le) / le);
    const f = (v) => (e.tien || '') + r(v) + (e.dv || '');
    ds.push({ k: 'the', ten: e.ten, a: f(a.the), b: f(b.the), d: upHieu(+r(b.the) - +r(a.the), e.dv) /* hiệu của 2 số đang hiện → khớp mắt nhìn */, va: a.the, vb: b.the });
  }
  try {
    const c = typeof THATSO !== 'undefined' && THATSO.capThe ? THATSO.capThe(id, t) : '', m = /cap ([\d.]+%) → ([\d.]+%)/.exec(c || '');
    if (m && m[1] !== m[2]) ds.push({ k: 'tran', ten: 'Cap', a: m[1], b: m[2], d: upHieu(upSoV(m[2]) - upSoV(m[1]), '%') });
  } catch (er) { }
  // đoạn mô tả: so từng đoạn ' · ' — cùng khung chữ (số thay bằng #) thì liệt kê số đổi; đoạn chỉ lặp lại chỉ số kỹ năng thẻ thì bỏ (đã có ở trên)
  const tho = ds.find(x => x.k === 'the');
  const khop = (tok, v) => { const dp = (String(tok).split('.')[1] || '').replace(/\D/g, '').length; return Math.abs(Math.abs(upSoV(tok)) - Math.abs(v)) <= 0.5 * Math.pow(10, -dp) + 1e-6; };
  const sa = upBoLv(a.kn).split(' · '), sb = upBoLv(b.kn).split(' · ');
  if (sa.length === sb.length) for (let i = 0; i < sa.length; i++) {
    if (sa[i] === sb[i]) continue;
    const na = sa[i].match(UP_SO) || [], nb = sb[i].match(UP_SO) || [];
    if (na.length !== nb.length || sa[i].replace(UP_SO, '#') !== sb[i].replace(UP_SO, '#')) continue;
    const doi = []; for (let j = 0; j < na.length; j++) if (na[j] !== nb[j]) doi.push(j);
    if (!doi.length) continue;
    const con = tho ? doi.filter(j => !(khop(na[j], tho.va) && khop(nb[j], tho.vb))) : doi; // số đã có ở dòng chỉ số kỹ năng thẻ thì không nhắc lại
    if (!con.length) continue;
    seg.push({ chu: upSC(sb[i]), so: con.map(j => na[j] + ' → ' + nb[j] + ' (' + upHieu(upSoV(nb[j]) - upSoV(na[j]), (/%|s$/.exec(nb[j]) || [''])[0]) + ')').join(' · ') });
  }
  return { max: false, lv: t.lv, ds, seg };
}
function upSoSeri(id) { const i = G.roster.findIndex(r => r.id === id); return 'TM-' + String(i + 1).padStart(3, '0'); }

// ===================================================== trang =====================================================
// trang chỉ huy: thời lượng + giải thích (tiếng Anh như phần còn lại của giao diện)
const UP_MV = {
  hero: { lau: 'Instant', vai: 'Tempo · fills the board fast', dl: [['Effect', 'Summons two free 1★ turrets from your deck into empty cells'], ['Board full', 'Each missing cell gives +1★ to your weakest turret instead'], ['Best with', 'Merge-trigger turrets: more copies to merge']] },
  dahlia: { lau: '10s', vai: 'Burst · save it for a boss', dl: [['Effect', 'Every turret on your board deals double damage'], ['Stacks with', 'Stars, card levels and support buffs'], ['Best with', 'Cast it as a boss arrives']] },
  eve: { lau: '8s', vai: 'Counter · blocks boss skills', dl: [['Effect', 'Clears freeze, stone and burn from every turret'], ['Shield', 'Blocks every boss skill for 8 seconds'], ['Best with', 'Boss waves that lock your turrets']] },
  // chỉ huy mới (08/11) — chữ tiếng Anh đơn giản
  tech: { lau: '10s', vai: 'Early game · fast and simple', dl: [['Effect', 'Your 1★ and 2★ Attack turrets fire 40% faster'], ['Who gets it', 'Turrets on the board when you cast. Frozen or stone turrets miss out'], ['Best with', 'Early waves, when most turrets are 1★ or 2★']] },
  tide: { lau: '6s', vai: 'Defense · buys time', dl: [['Effect', 'Enemies on your path move 25% slower (bosses 12%)'], ['Stacks with', 'Frost slows. Total slow is capped at 90% (bosses 50%)'], ['Best with', 'A big group close to your exit']] },
  twin: { lau: '12s', vai: 'Choice · keep the pair or merge it', dl: [['How to cast', 'Tap the card, then tap an Attack turret that has a twin (same type and star)'], ['Effect', 'Both twins deal +60% damage'], ['Merging', 'Merging either twin ends the buff. Merge King stars and swaps do not'], ['Best with', 'A strong pair you can keep for a while']] },
  hawk: { lau: '10s', vai: 'Formation · mix your row and column', dl: [['How to cast', 'Tap the card, then tap any cell'], ['Effect', 'Attack turrets in that row and column get +20% damage for each different turret type there'], ['Max', '+100% (5 types)'], ['Best with', 'A cross of many different turrets']] },
  weaver: { lau: '11s', vai: 'Puzzle · build a support cross', dl: [['How to cast', 'Tap the card, then tap your main Attack turret'], ['Links', 'Up to 3 Support turrets in the same row or column, not next to it (closest first)'], ['Each link', '+15% damage, +5% per Support star, and +10% speed'], ['Breaks', 'A link breaks if its Support moves, freezes or merges. Merging the main turret ends it'], ['Best with', 'Your best turret where Support rows and columns meet']] },
};
const UP = {
  id: null, ds: [], sao: 3, dungXem: false,
  giam: () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches),

  // HUD mượt C (TU-VAN-HUD-MUOT §3C): 1 màn không cuộn — hero tràn viền (phi công + đầu súng) · tên + 1 dòng meta · 4 thông số 2×2 ·
  //  thẻ kỹ năng 1–2 dòng (chạm = bảng CHI TIẾT trượt lên: mọi mục cũ) · hàng TEST RANGE (chạm = bảng thử bắn trượt lên) · nút Add/Remove dính đáy.
  //  iframe Test range nằm cố định trong bảng thử bắn (không bao giờ chuyển chỗ trong DOM — chuyển chỗ = nạp lại); chỉ chạy khi bảng mở.
  dung() {
    if (this.el) return this.el;
    const el = document.createElement('div'); el.id = 'up'; el.className = 'man up7'; el.hidden = true;
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Turret file');
    const x = '<button class="up-x" data-up="dongtam" aria-label="Close"><img src="assets/ic_lui.webp?v=002747c0" alt=""></button>';
    el.innerHTML =
      '<div class="up-nen" aria-hidden="true"></div>' +
      '<div class="up-dau"><button class="up-lui" data-up="dong" aria-label="Back"><img src="assets/ic_lui.webp?v=002747c0" alt=""></button>' +
      '<div class="up-so"></div><span class="up-mui"><button data-up="truoc" aria-label="Previous"><img class="lat" src="assets/mui_tiep.png" alt=""></button>' +
      '<button data-up="sau" aria-label="Next"><img src="assets/mui_tiep.png" alt=""></button></span></div>' +
      '<div class="up-than"><div class="up-noi"><div class="up-a"></div></div></div>' +
      '<div class="up-cuoi"><button class="up-nut" data-up="bo"><b class="up-nut-chu"></b><small class="up-nut-so"></small></button></div>' +
      '<div class="up-man" data-up="dongtam" aria-hidden="true"></div>' +
      '<section class="up-tam up-ct" aria-label="Details"><div class="up-tam-dau"><b class="up-tam-ten"></b>' + x + '</div><div class="up-tam-than"><div class="up-b"></div></div></section>' +
      '<section class="up-tam up-ts" aria-label="Test range"><div class="up-tam-dau"><b class="up-ts-ten">Test range</b>' + x + '</div><div class="up-tam-than">' + this.tvHTML() + '</div></section>';
    document.getElementById('wrap').appendChild(el);
    el.addEventListener('click', (e) => this.bam(e));
    this.vuot(el.querySelector('.up-than'));
    addEventListener('popstate', () => { if (!el.hidden) this.dong(true); });
    addEventListener('keydown', (e) => {
      if (el.hidden) return;
      if (e.key === 'Escape') { if (this.tam) this.dongTam(); else this.dong(); }
      else if (!this.tam && e.key === 'ArrowRight') this.buoc(1); else if (!this.tam && e.key === 'ArrowLeft') this.buoc(-1);
    });
    this.el = el; return el;
  },
  // danh sách theo đúng thứ tự đang hiện trên màn chọn (xếp theo bậc / họ / tên)
  danhSach() {
    const ds = [...document.querySelectorAll('#chon-luoi .c')].map(c => c.dataset.id).filter(Boolean);
    return ds.length ? ds : G.roster.map(r => r.id);
  },
  mo(id, tu) {
    const el = this.dung();
    this.ds = this.danhSach();
    // đang trượt ra (Back vừa đóng, 190 ms chưa ẩn hẳn) = coi như đã đóng → mở lại phải ghi lại 1 mục lịch sử; trước đây chạm thẻ
    // ngay sau Back không ghi → lần Back kế tiếp THOÁT KHỎI GAME
    const moi = el.hidden || el.classList.contains('ra');
    this.ve(id, 0);
    if (moi) this.hien(el);
    try { SND.nut(); } catch (e) { }
  },
  hien(el) {
    clearTimeout(this._ra); el.classList.remove('ra');
    el.hidden = false; el.querySelector('.up-than').scrollTop = 0;
    try { history.pushState({ up: 1 }, ''); this._ls = true; } catch (e) { this._ls = false; }
    if (!this.giam()) { el.classList.remove('vao'); void el.offsetWidth; el.classList.add('vao'); }
  },
  dong(tuLS) {
    if (!this.el || this.el.hidden) return;
    const el = this.el;
    this.dongTam(true); this.id = null;
    if (this.ifr) this.guiXem({ dung: true });
    if (!tuLS && this._ls) { this._ls = false; try { history.back(); } catch (e) { } }
    this._ls = false;
    const an = () => { el.hidden = true; el.classList.remove('ra', 'vao'); };
    if (this.giam()) an(); else { el.classList.remove('vao'); el.classList.add('ra'); clearTimeout(this._ra); this._ra = setTimeout(an, 190); }
    this._an = true; setTimeout(() => { this._an = false; }, 0);
    if (typeof UI !== 'undefined' && UI.veBoChon) UI.veBoChon();
  },
  buoc(d) {
    if (this.mv) { const ds = typeof mvDS === 'function' ? mvDS() : Object.keys(MAVUONG), j = (ds.indexOf(this.mv) + d + ds.length) % ds.length; this.veMV(ds[j], d); return; }
    if (!this.ds.length) return;
    const i = this.ds.indexOf(this.id), j = (i + d + this.ds.length) % this.ds.length;
    this.ve(this.ds[j], d);
  },
  // bảng trượt lên: 'ct' = chi tiết · 'ts' = Test range
  moTam(k) {
    if (!this.el) return;
    this.tam = k;
    this.el.classList.toggle('mo-ct', k === 'ct'); this.el.classList.toggle('mo-ts', k === 'ts');
    if (k === 'ct') this.el.querySelector('.up-ct .up-tam-than').scrollTop = 0;
    if (k === 'ts') { this.khungXem(); requestAnimationFrame(() => this.khungXem()); }
    this.guiXem({ dung: this.canDung() }); this.nutPhat();
    try { SND.nut(); } catch (e) { }
  },
  dongTam(im) {
    if (!this.el || !this.tam) return;
    this.tam = null; this.el.classList.remove('mo-ct', 'mo-ts');
    this.guiXem({ dung: true });
    if (!im) try { SND.nut(); } catch (e) { }
  },
  bam(e) {
    const b = e.target.closest('[data-up]'); if (!b) return;
    const a = b.dataset.up;
    if (a === 'dong') this.dong();
    else if (a === 'truoc') this.buoc(-1);
    else if (a === 'sau') this.buoc(1);
    else if (a === 'more') this.moTam('ct');
    else if (a === 'capsau') { // hàng "Next level" → bảng chi tiết, cuộn tới mục cấp thẻ kế tiếp
      this.moTam('ct');
      const th = this.el.querySelector('.up-ct .up-tam-than'), neo = this.el.querySelector('.up-ct .up-sau-neo'), mc = neo && neo.closest('.up-muc');
      if (th && mc) th.scrollTop = Math.max(0, mc.offsetTop - th.offsetTop - 8);
    }
    else if (a === 'test') this.moTam('ts');
    else if (a === 'dongtam') this.dongTam();
    else if (a === 'mo') { this.dongTam(true); this.ve(b.dataset.id, 1); }
    else if (a === 'sao') { this.chonSao(+b.dataset.s); if (b.dataset.mo) this.moTam('ts'); }
    else if (a === 'gd') this.chonGd(+b.dataset.g);
    else if (a === 'phat') { this.dungXem = !this.dungXem; this.guiXem({ dung: this.canDung() }); this.nutPhat(); }
    else if (a === 'bo' && this.mv) { UI.mv = this.mv; if (UI.veChon) UI.veChon(); this.capNutBo(); this.nhay(b); try { SND.nut(); } catch (e) { } }
    else if (a === 'bo') {
      if (!upCo(this.id)) return;
      UI.chonU(this.id); this.capNutBo(); this.nhay(b);
    }
  },
  // nút chính: chớp vàng tại chỗ 90 ms (ảnh nút, không vẽ)
  nhay(b) { if (this.giam()) return; b.classList.remove('nhay'); void b.offsetWidth; b.classList.add('nhay'); },
  // vuốt ngang ở thân trang → ụ trước / sau
  vuot(el) {
    let x0 = null, y0 = 0, t0 = 0;
    el.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; t0 = performance.now(); });
    el.addEventListener('pointerup', (e) => {
      if (x0 == null) return; const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6 && performance.now() - t0 < 700) this.buoc(dx < 0 ? 1 : -1);
    });
    el.addEventListener('pointercancel', () => { x0 = null; });
  },
  capNutBo() {
    const nut = this.el.querySelector('.up-nut'), chu = nut.querySelector('.up-nut-chu'), so = nut.querySelector('.up-nut-so');
    if (this.mv) { // trang chỉ huy: dùng chỉ huy này
      if (typeof mvCo === 'function' && !mvCo(this.mv)) { const m = MAVUONG[this.mv].mo2; chu.textContent = UP_TXT.locked; so.textContent = 'Wave ' + m.wave + ' or ' + m.ngoc + ' gems'; nut.disabled = true; nut.classList.remove('bo'); return; } // chưa mở (08/11)
      const dang = UI.mv === this.mv;
      chu.textContent = dang ? 'Selected' : 'Use commander'; so.textContent = dang ? '' : 'Current: ' + upSC(String((MAVUONG[UI.mv] || MAVUONG.hero).ten).toLowerCase());
      nut.disabled = false; nut.classList.toggle('bo', dang); return;
    }
    const gl = this.el.querySelector('.up-gl');
    if (gl && typeof ND !== 'undefined' && ND.url && typeof GLYPH !== 'undefined') { // biểu tượng nhận diện (glyph.js): màu khoá = ô trong bộ bài
      gl.hidden = true; // (bỏ huy hiệu vai trò tròn — vai trò chỉ là chữ ở dòng meta)
    }
    const id = this.id, co = upCo(id), trong = UI.chon.includes(id);
    chu.textContent = !co ? UP_TXT.locked : trong ? UP_TXT.remove : UP_TXT.add;
    so.textContent = co ? UP_TXT.deck(UI.chon.length) : '';
    nut.disabled = !co; nut.classList.toggle('bo', trong);
  },

  // ---------- dựng nội dung 1 ụ ----------
  ve(id, huong) {
    const r = G.rosterMap[id]; if (!r) return;
    this.id = id; this.mv = null;
    const el = this.el, tier = TIERS[r.bac] || TIERS.trang, sk = SKILLS[id], co = !!sk;
    el.style.setProperty('--m', tier.mau); el.style.setProperty('--m2', tier.mau2); el.dataset.bac = r.bac; el.classList.remove('la-mv');
    const i = this.ds.indexOf(id);
    el.querySelector('.up-so').innerHTML = 'Turret file <span>' + (i + 1) + ' / ' + this.ds.length + '</span>';
    const noi = el.querySelector('.up-noi');
    noi.querySelector('.up-a').innerHTML = this.html(id, r, tier, sk);
    el.querySelector('.up-b').innerHTML = this.chiTiet(id, r, tier, sk);
    el.querySelector('.up-tam-ten').textContent = upTen(id);
    el.querySelector('.up-ts-ten').textContent = upTen(id) + ' · test range';
    el.querySelector('.up-tv').classList.toggle('tat', !co); el.querySelector('.up-sd-sao').hidden = !co;
    const sb = el.querySelector('.up-tv-sao'); if (sb) sb.hidden = false;
    el.querySelector('.up-than').scrollTop = 0;
    if (huong && !this.giam()) { noi.classList.remove('trai', 'phai'); void noi.offsetWidth; noi.classList.add(huong > 0 ? 'phai' : 'trai'); }
    this.capNutBo();
    // xem trước = clip minh hoạ kỹ năng (skilldemo.js): mặc định 4★; ụ đổi dạng có thêm nút Stage
    this.sao = co ? 4 : 1; this.gd = 0;
    const gdc = el.querySelector('.up-sd-gd');
    if (gdc) {
      const coGd = co && typeof laGrow === 'function' && laGrow(id);
      gdc.hidden = !coGd;
      const dg = coGd && GROW[id].dang; // ụ chỉ có vài dạng CỐ ĐỊNH (Sói: Thường / Thức tỉnh — quay lúc sinh, không lớn dần)
      gdc.innerHTML = !coGd ? '' : dg ? [[0, 'All']].concat(dg.map(g => [g, upSC(GROW[id].ten[g - 1])])).map(([g, t]) => '<button data-up="gd" data-g="' + g + '"' + (g === 0 ? ' class="chon"' : '') + '>' + t + '</button>').join('')
        : ['All', 'Stage 1', 'Stage 2', 'Stage 3'].map((t, g) => '<button data-up="gd" data-g="' + g + '"' + (g === 0 ? ' class="chon"' : '') + '>' + t + '</button>').join('');
    }
    this.ganXem(id);
    this.chonSao(this.sao, true);
    requestAnimationFrame(() => fitText(noi.querySelector('.up-ten'), 30, 18));
  },

  // ---------- trang CHỈ HUY (chạm thẻ chỉ huy ở màn chọn): cùng khuôn với trang ụ ----------
  moMV(id, tu) {
    if (!MAVUONG[id]) return;
    const el = this.dung(), moi = el.hidden;
    this.veMV(id, 0);
    if (moi) this.hien(el);
  },
  veMV(id, huong) {
    const d = MAVUONG[id]; if (!d) return;
    this.mv = id; this.id = null;
    const el = this.el, ds = typeof mvDS === 'function' ? mvDS() : Object.keys(MAVUONG), i = ds.indexOf(id);
    const bac = typeof mvBac === 'function' ? mvBac(id) : 'trang', tier = TIERS[bac]; // bậc chỉ huy (08/11): màu trang = màu bậc, như trang ụ
    el.style.setProperty('--m', tier.mau); el.style.setProperty('--m2', tier.mau2); el.dataset.bac = bac; el.classList.add('la-mv');
    el.querySelector('.up-so').innerHTML = 'Commander <span>' + (i + 1) + ' / ' + ds.length + '</span>';
    const noi = el.querySelector('.up-noi');
    const tt = UP_MV[id] || {}, ten = upSC(String(d.ten).toLowerCase());
    noi.querySelector('.up-a').innerHTML =
      '<section class="up-hero"><div class="up-pi"><img src="' + heroOf('af_' + id) + '" alt="" onerror="this.onerror=null;this.src=\'assets/' + d.anh + '.png\'"></div><span class="up-seri">CMD-0' + (i + 1) + '</span></section>' +
      '<div class="up-bien"><div class="up-ten">' + upEsc(ten) + '</div><div class="up-meta"><b>' + upEsc(String(tier.ten).toUpperCase()) + '</b> • <span>COMMANDER</span> • ' + upEsc(tt.vai || 'ACTIVE SKILL').toUpperCase() + '</div>' +
      '<span class="up-bn-ic"><img class="ic" src="' + mvIcURL(id) + '" alt=""></span></div>' +
      // tư vấn C §B15: 3 thuộc tính kỹ năng (mana · hồi chiêu · thời gian) thay lưới 4 ô của trang ụ — giá ×2 mỗi lần dùng ghi ngay trong ô mana
      '<div class="up-spec ba">' + this.o('Mana cost', d.gia + ' · ×2 next') + this.o('Cooldown', d.cd + 's') + this.o('Duration', tt.lau || '—') + '</div>' +
      this.theKN('Commander skill', upSC(d.mo) + '.', '') + this.hangTest(true);
    el.querySelector('.up-b').innerHTML =
      this.muc(1, 'Skill', '<p class="up-mo">' + upEsc(upSC(d.mo)) + '.</p><p class="up-phu"><b>How to cast.</b> ' + (d.chon ? 'Tap the commander button, then tap a cell on your board.' : 'Tap the commander button during a battle.') + ' The mana cost doubles after each use.</p>' + (d.mo2 ? '<p class="up-phu"><b>Unlock.</b> Reach wave ' + d.mo2.wave + ', or pay ' + d.mo2.ngoc + ' gems in the commander list.</p>' : '')) +
      this.muc(2, 'How it works', '<dl class="up-dl">' + (tt.dl || []).map(([a, b]) => '<dt>' + upEsc(a) + '</dt><dd>' + upEsc(b) + '</dd>').join('') + '</dl>');
    el.querySelector('.up-tam-ten').textContent = ten;
    el.querySelector('.up-ts-ten').textContent = ten + ' · test range';
    el.querySelector('.up-tv').classList.remove('tat');
    el.querySelectorAll('.up-sao-chon').forEach(e => { e.hidden = true; });
    const sb = el.querySelector('.up-tv-sao'); if (sb) sb.hidden = true;
    el.querySelector('.up-than').scrollTop = 0;
    if (huong && !this.giam()) { noi.classList.remove('trai', 'phai'); void noi.offsetWidth; noi.classList.add(huong > 0 ? 'phai' : 'trai'); }
    this.capNutBo();
    this.ganXem('mv:' + id);
    requestAnimationFrame(() => fitText(noi.querySelector('.up-ten'), 30, 18));
  },

  // thẻ kỹ năng (1–2 dòng) — chạm = bảng chi tiết
  theKN(nhan, chu, them) {
    return '<button class="up-kn" data-up="more"><small>' + upEsc(nhan) + them + '</small><span class="up-kn-chu">' + upEsc(chu) + '</span>' +
      '<em>More<img src="assets/mui_tiep.png" alt=""></em></button>';
  },
  hangTest(mv) {
    return '<button class="up-hang-ts" data-up="test"><img class="ic" src="assets/ic_phat.png" alt=""><b>' + (mv ? 'Skill preview' : 'Test range') + '</b><span>' + (mv ? 'Watch it cast' : 'Watch it fire') + '</span><img class="mt" src="assets/mui_tiep.png" alt=""></button>';
  },
  // màn chính trang ụ
  html(id, r, tier, sk) {
    const ten = upTen(id), vai = upVai(id), h = hoTT(id), grow = sk && laGrow(id);
    const kd = Math.min(1.3, (REN.kDau ? REN.kDau(id) : 0.8) / 0.714); // tỉ lệ đầu so với bệ (bệ = 71.4% cạnh ô)
    const P = [];
    // HERO: CHỈ ảnh phi công nét (hero_<id>.jpg = 3× cỡ hiển thị), không huy hiệu ụ đè lên ảnh (user); ụ nhỏ nằm cạnh tên
    P.push('<section class="up-hero"><div class="up-pi"><img src="' + heroOf(id) + '" alt="" onerror="this.onerror=null;this.src=\'' + portraitOf(id) + '\'"></div>' +
      '<span class="up-seri">' + upSoSeri(id) + '</span></section>');
    // tên + MỘT dòng meta (độ hiếm • vai trò • bậc họ)
    const meta = ['<b>' + upEsc(String(tier.ten).toUpperCase()) + '</b>'];
    if (vai) meta.push(UP_TXT.role[vai].toUpperCase());
    if (h) meta.push('TIER ' + h.bac);
    if (grow) meta.push('GROW-UP');
    if (sk && sk.chuDong) meta.push('ACTIVE');
    if (!sk) meta.push('COMING SOON');
    const tenVi = typeof NN !== 'undefined' && NN.vi() ? NN.tenVi(id) : ''; // Tiếng Việt: tên Việt nhỏ dưới tên riêng tiếng Anh
    // rà soát 09/11: Tiếng Việt → tiêu đề = tên Việt, tên riêng tiếng Anh nhỏ bên dưới (trước đây ngược lại → tiêu đề còn tiếng Anh)
    P.push('<div class="up-bien"><div class="up-ten"' + (tenVi ? ' data-nn-giu="1"' : '') + '>' + upEsc(tenVi || ten) + '</div>' + (tenVi && tenVi !== ten ? '<div class="up-tenvi" data-nn-giu="1">' + upEsc(ten) + '</div>' : '') + '<div class="up-meta">' + meta.join(' • ') + '</div>' +
      '<span class="up-bn-ic"><img class="ic" src="' + iconOf(id) + '" alt=""><img class="up-gl" alt="" hidden></span></div>');
    // 4 thông số 2×2
    const bs = sk ? upBangSao(id) : [];
    const s1 = bs[0] || {};
    const tam = !sk ? '—' : upKhongBan(id) ? upVung(id) : typeof sk.tam === 'number' ? 'Melee' : 'Whole path';
    const ht = sk && !sk.dmg && SUP_LOAI[id] && BUFF[SUP_LOAI[id]]; // ụ hỗ trợ: thay sát thương/tốc bắn bằng loại buff + ô được buff
    // cấp thẻ kế tiếp: hàng "Next level" ngay dưới hàng CARD LV (thebai-ui.js chèn hàng đó trước .up-sau) + số tăng nhỏ trong ô thông số
    const cs = sk ? upCapSau(id) : null, dd = (k) => { const x = cs && cs.ds.find(y => y.k === k); return x ? x.d : ''; };
    P.push(this.sauHTML(cs));
    P.push('<div class="up-spec">' + (ht
      ? this.o('Boosts', upSC(BUFF[SUP_LOAI[id]].ten), dd('the')) + this.o('Buffs', upVung(id)) + this.o('From 5★', upVung(id) === '—' ? '—' : (upDauChan(id) || {}).b ? '+ diagonals' : 'Same cells') + this.o('Target', upNham(id))
      : this.o('Damage', s1.dmg != null ? s1.dmg : '—', dd('dmg')) + this.oToc(s1.toc, dd('toc')) +
        this.o('Range', tam) + this.o('Target', sk ? upNham(id) : '—')) + '</div>');
    // kỹ năng 1 dòng + Test range
    P.push(this.theKN(SUP_LOAI[id] ? 'Support skill' : 'Skill', upSC(r.kyNang || '') + '.', grow ? ' · ' + ((GROW[id] && GROW[id].hinh) ? GROW[id].hinh.length : 3) + ' forms' : ''));
    if (sk) P.push(this.hangTest());
    return P.join('');
  },
  // bảng CHI TIẾT: mọi thông tin cũ (không xoá, chỉ để sau 1 chạm)
  chiTiet(id, r, tier, sk) {
    const vai = upVai(id), h = hoTT(id), grow = sk && laGrow(id), P = [];
    const bs = sk ? upBangSao(id) : [], s1 = bs[0] || {}, moi = HO_MOI[id];
    let n = 1;
    P.push(this.muc(n++, UP_TXT.sec.skill,
      '<p class="up-mo">' + upEsc(upSC(r.kyNang || '')) + '.</p>' +
      (vai ? '<p class="up-phu"><b>' + UP_TXT.role[vai] + '.</b> ' + UP_TXT.roleMo[vai] + '</p>' : '') +
      (moi ? '<p class="up-phu"><b>Its twist:</b> ' + upEsc(upSC(moi)) + '.</p>' : '') +
      (s1.kn ? '<div class="up-so1">' + s1.kn.split(/\s·\s/).map(x => '<span>' + upEsc(x) + '</span>').join('') + '</div>' : '') +
      (sk ? '<dl class="up-dl"><dt>Reach</dt><dd>' + upEsc(upTam(id)) + '</dd><dt>Target</dt><dd>' + upEsc(upNham(id)) + '</dd>' +
        (h ? '<dt>Family</dt><dd>' + upEsc(upSC(h.ten)) + ' · tier ' + h.bac + ' of 5</dd>' : '') + '</dl>' : '')));
    if (sk) { const sm = this.sauMuc(upCapSau(id)); if (sm) P.push(this.muc(n++, 'Next card level', sm)); }
    if (sk) {
      const moc = {}; for (const m of mocCua(id)) moc[m.n] = m;
      P.push(this.muc(n++, UP_TXT.sec.stars,
        '<div class="up-bang"><div class="up-hang dau"><span>★</span><span>Damage</span><span>Rate</span><span>Effect</span></div>' +
        bs.map(x => '<button class="up-hang' + (moc[x.s] ? ' moc' : '') + '" data-up="sao" data-mo="1" data-s="' + x.s + '"><span class="s">' + x.s + '</span><span>' + (x.dmg != null ? x.dmg : '—') + '</span><span>' + upEsc(x.toc ? x.toc.replace(' shots/s', '/s') : '—') + '</span><span class="kn">' + upEsc(x.kn || '—') + '</span>' +
          (moc[x.s] ? '<em><b>' + x.s + '★ unlock · ' + upEsc(upSC(moc[x.s].ten)) + '.</b> ' + upEsc(upSC(moc[x.s].mo)) + '.</em>' : '') + '</button>').join('') +
        '</div><p class="up-ghi">' + ((typeof THATSO !== 'undefined' && THATSO.chuPU(id)) || 'Values at your card level, before power-ups and buffs. Each in-battle power-up adds +25% base damage (+1 → MAX). Tap a row to test it.') + '</p>'));
      if (grow) P.push(this.muc(n++, UP_TXT.sec.grow, this.growHTML(id)));
      const dc = upDauChan(id);
      if (dc) P.push(this.muc(n++, UP_TXT.sec.foot, this.chanHTML(id, dc)));
      P.push(this.muc(n++, UP_TXT.sec.merge, '<dl class="up-dl">' + upLuatGhep(id).map(([a, b]) => '<dt>' + upEsc(a) + '</dt><dd>' + upEsc(b) + '</dd>').join('') + '</dl>'));
      P.push(this.muc(n++, UP_TXT.sec.modes, '<dl class="up-dl">' + upCheDo(id).map(([a, b]) => '<dt>' + upEsc(a) + '</dt><dd>' + upEsc(b) + '</dd>').join('') + '</dl>'));
      if (h) P.push(this.muc(n++, UP_TXT.sec.family, this.hoHTML(id, h)));
      const cd = upCapDoi(id), kh = upKhac(id);
      P.push(this.muc(n++, UP_TXT.sec.pair,
        (cd.length ? '<div class="up-cap">' + cd.map(x => this.theNho(x.id, x.ly)).join('') + '</div>' : '') +
        '<dl class="up-dl"><dt>Strong vs</dt><dd>' + upEsc(kh.tot.join(' · ')) + '</dd><dt>Watch out</dt><dd>' + kh.so.map(upEsc).join('<br>') + '</dd></dl>'));
    } else {
      P.push(this.muc(n++, 'Status', '<p class="up-phu">This turret is designed but not in the game yet. It will unlock in a future update.</p>' + (h ? this.hoHTML(id, h) : '')));
    }
    return P.join('');
  },
  tvHTML() {
    return '<div class="up-tv"><div class="up-tv-khung"></div><i class="g tl"></i><i class="g tr"></i><i class="g bl"></i><i class="g br"></i>' +
      '<div class="up-tv-chu"><span class="rec">Live</span></div><b class="up-tv-sao"></b>' +
      '<button class="up-phat" data-up="phat" aria-label="Pause preview"></button><div class="up-tv-tat">No test footage yet</div></div>' +
      '<div class="up-sao-chon up-sd-sao" role="group" aria-label="Preview star level">' + [1, 4, 7].map(s => '<button data-up="sao" data-s="' + s + '" class="moc">' + s + '★</button>').join('') + '</div>' +
      '<div class="up-sao-chon up-sd-gd" role="group" aria-label="Preview stage" hidden></div>';
  },
  o(k, v, d) { return '<div><small>' + k + '</small><b>' + upEsc(v) + '</b>' + (d ? '<i class="up-tang" title="Next card level">' + upEsc(d) + '</i>' : '') + '</div>'; },
  // hàng "Next level" (dưới nút LEVEL UP): tối đa 2 số có nhãn, còn lại → "+N more" mở bảng chi tiết
  sauHTML(cs) {
    if (!cs) return '';
    if (cs.max) return '<div class="up-sau max"><small>Next level</small><span><b>MAX</b></span></div>';
    const n = cs.ds.length + cs.seg.length; if (!n) return '';
    const hien = cs.ds.slice(0, 2), con = n - hien.length;
    return '<button class="up-sau" data-up="capsau" aria-label="Next card level: details"><small>Next level</small><span>' +
      hien.map(x => '<span class="m"><i>' + upEsc(x.ten) + '</i> <b>' + upEsc(x.a + ' → ' + x.b) + '</b> <em>(' + upEsc(x.d) + ')</em></span>').join('') +
      (con ? '<span class="them">+' + con + ' more</span>' : '') + '</span></button>';
  },
  // mục "Next card level" trong bảng chi tiết: mọi số đổi
  sauMuc(cs) {
    if (!cs) return '';
    if (cs.max) return '<p class="up-phu"><b>MAX.</b> Card is at max level.</p>';
    if (!cs.ds.length && !cs.seg.length) return '';
    return '<p class="up-ghi up-sau-neo">LV ' + cs.lv + ' → LV ' + (cs.lv + 1) + '</p><ul class="up-sau-ds">' +
      cs.ds.map(x => '<li><span>' + upEsc(x.ten) + '</span><b>' + upEsc(x.a + ' → ' + x.b) + '</b> <em>(' + upEsc(x.d) + ')</em></li>').join('') +
      cs.seg.map(x => '<li class="seg"><b>' + upEsc(x.so) + '</b><span>' + upEsc(x.chu) + '</span></li>').join('') +
      '</ul><p class="up-ghi">At 1★, before power-ups and buffs.</p>';
  },
  // tư vấn C §B14: nhịp bắn dài ("Hole every 9.5s") có nhãn riêng — ô số chỉ giữ con số, không nhét câu vào ô "Fire rate"
  oToc(toc, d) {
    if (!toc) return this.o('Fire rate', '—', d);
    const t = upSC(toc).replace(' shots/s', '/s'); let m;
    if ((m = t.match(/^(\w+) every ([\d.]+s)$/i))) return this.o(upSC(m[1]) + ' interval', m[2], d);
    if ((m = t.match(/^Charges ([\d.]+s)$/i))) return this.o('Charge time', m[1], d);
    if ((m = t.match(/^([\d.]+) volleys\/s/i))) return this.o('Volleys', (+m[1]) + '/s', d);
    if ((m = t.match(/^(\w+) ([\d.]+) ticks\/s$/i))) return this.o(upSC(m[1]) + ' ticks', m[2] + '/s', d);
    if (/^continuous/i.test(t)) return this.o('Fire rate', 'Continuous', d);
    return this.o('Fire rate', t, d);
  },
  muc(n, ten, noi) { return '<section class="up-muc"><h3>' + ten + '</h3>' + noi + '</section>'; },
  theNho(id, ly) {
    const r = G.rosterMap[id], m = r ? TIERS[r.bac].mau : '#9aa6b4';
    return '<button class="up-the" data-up="mo" data-id="' + id + '" style="--c:' + m + '"><img src="' + portraitOf(id) + '" alt=""><b>' + upEsc(upTen(id)) + '</b><span>' + upEsc(ly) + '</span></button>';
  },
  growHTML(id) {
    // ụ module (claude/u-module): bệ riêng + đầu mới = icon nho/<id> dựng sẵn (không ghép đầu mới lên bệ chung); ảnh dạng _s riêng thì giữ như cũ
    const upGdAnh = (id, k, anh) => !anh && window.DE_RIENG && DE_RIENG[id] && !window.UCU
      ? '<img class="dau nho s' + (k + 1) + ' loc" src="' + iconOf(id) + '" alt="">'
      : '<img class="de" src="assets/de_chung.webp?v=5b0cfbfb" alt=""><img class="dau s' + (k + 1) + (anh ? '' : ' loc') + '" src="assets/' + anhTen(id + '_nong' + (anh ? '_s' + (k + 1) : '')) + '.png" alt="" onerror="this.onerror=null;this.src=\'' + iconOf(id) + '\'">';
    const g = GROW[id], anh = !!(window.STAGE_K && STAGE_K[id]);
    // dạng HÌNH riêng (Rồng Máy 4 dạng — skills5.js GROW.ronglua.hinh): icon dựng sẵn nho/<ảnh> mỗi dạng; ảnh lỗi → icon thẻ
    if (g.hinh) return '<div class="up-gd up-gd4">' + g.hinh.map((h, k) =>
      '<div class="up-gd1" style="--g:' + (h.mau || g.mau) + '"><div class="anh"><img class="dau nho" src="assets/' + h.anh + '.png" alt="" onerror="this.onerror=null;this.src=\'' + iconOf(id) + '\'"></div>' +
      '<b>' + upEsc(upSC(h.sao)) + ' · ' + upEsc(upSC(h.ten)) + '</b><span>' + upEsc(upSC(h.mo)) + '</span></div>').join('<img class="up-mt" src="assets/mui_tiep.png" alt="›">') + '</div>' +
      '<p class="up-phu">' + upEsc(upSC(g.dk)) + '.</p>';
    // điều kiện chia theo dạng nếu chuỗi tách được thành 3 phần
    let ph = String(g.dk).split(/\s+\/\s+|\s+·\s+/);
    if (ph.length === 2) ph = ['Starting form'].concat(ph);
    if (ph.length !== 3) ph = null;
    if (g.dang) { // dạng cố định (không lớn dần): chỉ hiện các dạng có thật, nối bằng "or"
      return '<div class="up-gd">' + g.dang.map((k1) => { const k = k1 - 1, t = g.ten[k];
        return '<div class="up-gd1" style="--g:' + g.mau + '"><div class="anh">' + upGdAnh(id, k, anh) + '</div>' +
          '<b>' + upEsc(upSC(t)) + '</b>' + (g.dangMo && g.dangMo[k] ? '<span>' + upEsc(upSC(g.dangMo[k])) + '</span>' : '') + '</div>'; }).join('<b class="up-hoac">or</b>') + '</div>' +
        '<p class="up-phu">' + upEsc(upSC(g.dk)) + '.</p>';
    }
    return '<div class="up-gd">' + g.ten.map((t, k) =>
      '<div class="up-gd1" style="--g:' + g.mau + '"><div class="anh">' + upGdAnh(id, k, anh) + '</div>' +
      '<b>' + (k + 1) + ' · ' + upEsc(upSC(t)) + '</b>' + (ph && ph[k] ? '<span>' + upEsc(upSC(ph[k])) + '</span>' : '') + '</div>').join('<img class="up-mt" src="assets/mui_tiep.png" alt="›">') + '</div>' +
      '<p class="up-phu">' + upEsc(upSC(g.dk)) + '.</p>' + (g.lap ? '<p class="up-ghi">Cycles back to stage 1 after it fires.</p>' : '');
  },
  chanHTML(id, dc) {
    const anh = REN.kyHieuURL ? REN.kyHieuURL(dc.k) : '', mau = (BUFF[dc.k] || {}).mau || '#fff';
    const luoi = (ds) => {
      let s = '<div class="up-luoi">';
      for (let hh = 0; hh < 3; hh++) for (let c = 0; c < 5; c++) {
        const dx = c - 2, dy = hh - 1, la = dx === 0 && dy === 0, co = ds.some(([a, b]) => a === dx && b === dy);
        s += '<i class="' + (la ? 'u' : co ? 'b' : '') + '">' + (la ? '<img src="' + iconOf(id) + '" alt="">' : co && anh ? '<img src="' + anh + '" alt="">' : '') + '</i>';
      }
      return s + '</div>';
    };
    let tam = 'the 4 cells next to it (up, down, left, right)';
    if (upCheo(id)) tam = 'only the 4 diagonal cells';
    let v1 = '', v7 = '';
    const bs = upBangSao(id); if (bs.length) { v1 = bs[0].kn; v7 = bs[6].kn; }
    return '<div class="up-chan" style="--b:' + mau + '"><figure>' + luoi(dc.a) + '<figcaption>1–4★</figcaption></figure>' +
      (dc.b ? '<figure>' + luoi(dc.b) + '<figcaption>5★ and up</figcaption></figure>' : '') + '</div>' +
      '<p class="up-phu"><b style="color:' + mau + '">' + upEsc(BUFF[dc.k].ten) + '</b> for ' + tam + (dc.b ? '. From 5★ it also reaches the diagonals' : '') + '.' +
      (v1 ? ' ' + upEsc(v1) + ' at 1★, ' + upEsc(v7) + ' at 7★.' : '') + '</p>';
  },
  hoHTML(id, h) {
    const F = HO[HO_CUA[id].ho];
    return '<div class="up-thang">' + F.bac.map((ds, k) => {
      const c = TIERS[TIER_LIST[k]].mau;
      if (!ds.length) return '<div class="nac gap" style="--c:' + c + '"><small>' + upSC(TIERS[TIER_LIST[k]].ten) + '</small><span>Open slot</span></div>';
      return '<div class="nac" style="--c:' + c + '"><small>' + upSC(TIERS[TIER_LIST[k]].ten) + '</small>' + ds.map(x =>
        x === id ? '<span class="cur"><img src="' + iconOf(x) + '" alt="">' + upEsc(upTen(x)) + '</span>' : '<button data-up="mo" data-id="' + x + '"><img src="' + iconOf(x) + '" alt="">' + upEsc(upTen(x)) + '</button>').join('') + '</div>';
    }).join('') + '</div>' + (h.sau ? '<p class="up-phu">Next up: <b>' + upEsc(h.sau) + '</b>' + (h.sauMoi ? ' — ' + upEsc(upSC(h.sauMoi)) : '') + '.</p>' : '<p class="up-phu">Top of its family.</p>');
  },

  // ---------- xem trước trực tiếp (iframe = chính game ở chế độ preview) ----------
  // dừng clip khi: người xem bấm dừng · khung ra khỏi màn hình · tab ẩn · trang hồ sơ đóng (iframe nạp sẵn lúc ẩn)
  canDung() { return !!(this.dungXem || this.tam !== 'ts' || document.hidden || !this.el || this.el.hidden); },
  // NẠP SẴN Test range: khi màn chọn rảnh, dựng khung trang hồ sơ (ẩn) + iframe → ảnh trận tải trước, mở trang ụ là chạy ngay
  //  (iframe KHÔNG bao giờ bị chuyển chỗ trong DOM — chuyển chỗ = trình duyệt nạp lại từ đầu).
  chuanBi() {
    if (this.ifr || UP_XEM) return;
    try { if (navigator.connection && navigator.connection.saveData) return; } catch (e) { }
    const el = this.dung(); if (!el.hidden) return;
    const id = ((typeof UI !== 'undefined' && UI.chon) || []).find(x => SKILLS[x] && G.rosterMap[x]) || (G.roster || []).map(r => r.id).find(x => SKILLS[x]);
    if (!id) return;
    if (!this.sao) this.sao = 4;
    this.ganXem(id);
  },
  ganXem(id) {
    const tv = this.el.querySelector('.up-tv'); if (!tv) return;
    if (!SKILLS[id] && !/^mv:/.test(id)) { this.guiXem({ dung: true }); return; }
    this._xemId = id;
    if (!this.ifr) {
      const f = document.createElement('iframe');
      f.className = 'up-ifr'; f.title = 'Live preview'; f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1;
      f.src = this.srcXem(id); this._ifrT = Date.now(); this._ssOK = false;
      this.ifr = f;
    } else { this.cuuXem(); this.guiXem({ id, sao: this.sao, gd: this.gd }); }
    if (!this.ifr.parentNode) { tv.querySelector('.up-tv-khung').appendChild(this.ifr); this.theoDoiXem(tv); }
    this.khungXem(); requestAnimationFrame(() => this.khungXem());
    if (this.giam() && this._lanDau !== false) { this.dungXem = true; this._lanDau = false; }
    this.guiXem({ dung: this.canDung() }); this.nutPhat();
  },
  srcXem(id) { return 'index.html?preview=' + encodeURIComponent(id) + '&star=' + this.sao + '&notut=1'; },
  // iframe nạp sẵn lúc MẤT MẠNG (trang lỗi của trình duyệt, không bao giờ báo tmXemSS) → Test range đen mãi. Có mạng lại /
  // mở Test range mà iframe chưa từng báo "đã nghe" sau 5 s → nạp lại iframe (cùng chỗ trong DOM, chỉ đổi src).
  cuuXem() {
    if (!this.ifr || this._ssOK || !navigator.onLine || Date.now() - (this._ifrT || 0) < 5000) return;
    this._ifrT = Date.now(); this.ifr.src = this.srcXem(this._xemId || this.id);
  },
  // khung cắt: số sát thương + đường trên + bàn 3×3 + đường dưới + dải chú thích ở đáy (toạ độ logic y 112…532), co theo bề rộng khung
  khungXem() {
    const kh = this.el && this.el.querySelector('.up-tv-khung'); if (!kh || !this.ifr) return;
    const k = (kh.clientWidth || 344) / 430;
    kh.style.setProperty('--k', k.toFixed(4)); kh.style.height = Math.round(420 * k) + 'px'; this.ifr.style.top = (-112 * k) + 'px'; // khớp SD_Y0/SD_CAO (skilldemo.js)
  },
  // ra khỏi màn hình / ẩn tab → dừng clip (đỡ tốn pin); quay lại → chạy tiếp (trừ khi người xem đã bấm dừng)
  theoDoiXem(tv) {
    if (this._io) return;
    const cap = () => this.guiXem({ dung: this.canDung() });
    this._thay = true;
    if ('IntersectionObserver' in window) { this._io = new IntersectionObserver((es) => { this._thay = es[es.length - 1].isIntersecting; cap(); }, { threshold: 0.05 }); this._io.observe(tv); }
    else this._io = true;
    document.addEventListener('visibilitychange', cap);
    addEventListener('resize', () => this.khungXem());
    const kh = tv.querySelector('.up-tv-khung');
    if (kh && 'ResizeObserver' in window) new ResizeObserver(() => this.khungXem()).observe(kh);
  },
  chonGd(g) {
    this.gd = g || 0;
    this.el.querySelectorAll('[data-up="gd"]').forEach(b => b.classList.toggle('chon', +b.dataset.g === this.gd));
    this.guiXem({ id: this.id, sao: this.sao, gd: this.gd });
    if (this.dungXem) { this.dungXem = false; this.guiXem({ dung: false }); this.nutPhat(); }
  },
  guiXem(d) { try { if (this.ifr && this.ifr.contentWindow) this.ifr.contentWindow.postMessage({ tmXem: d }, '*'); } catch (e) { } },
  nutPhat() { const b = this.el.querySelector('.up-phat'); if (b) { b.classList.toggle('dung', this.dungXem); b.setAttribute('aria-label', this.dungXem ? 'Play preview' : 'Pause preview'); } },
  chonSao(s, lanDau) {
    if (!SKILLS[this.id]) return;
    this.sao = s;
    this.el.querySelectorAll('[data-up="sao"]').forEach(b => b.classList.toggle('chon', +b.dataset.s === s));
    const t = this.el.querySelector('.up-tv-sao'); if (t) t.textContent = s + '★';
    if (!lanDau) { this.guiXem({ id: this.id, sao: s, gd: this.gd }); if (this.dungXem) { this.dungXem = false; this.guiXem({ dung: false }); this.nutPhat(); } }
  },
};

// ===================================================== móc vào màn chọn =====================================================
if (!UP_XEM) {
  // iframe xem trước báo "đã nghe" → gửi lại trạng thái hiện tại (tin gửi lúc iframe còn đang nạp bị mất → trước đây khung đứng đen)
  addEventListener('message', (e) => {
    if (!e.data || !e.data.tmXemSS || !UP.ifr || e.source !== UP.ifr.contentWindow) return;
    UP._ssOK = true;
    UP.guiXem({ id: UP._xemId, sao: UP.sao, gd: UP.gd || 0, dung: UP.canDung() });
  });
  addEventListener('online', () => { UP._ifrT = 0; UP.cuuXem(); }); // có mạng lại → cứu iframe nạp hỏng lúc mất mạng
  // nạp sẵn Test range ~1.5 s sau khi màn chọn hiện (đã tải xong menu, không trong trận)
  let rnh = 0; const hen = setInterval(() => {
    const c = document.getElementById('chon');
    const ok = typeof TAI !== 'undefined' && TAI.daBoot && TAI.nenXong !== false && !TAI.cho && c && !c.hidden && !(G.ban && G.ban.length); // đợi cả đợt nạp nền (khởi động nhanh)
    rnh = ok ? rnh + 1 : 0;
    if (UP.ifr) clearInterval(hen); else if (rnh >= 3) { clearInterval(hen); try { UP.chuanBi(); } catch (e) { console.warn('UP.chuanBi', e); } }
  }, 500);
  // thẻ chỉ huy ở màn chọn: chạm = chọn (như cũ) + mở trang chỉ huy
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act="mv-chon"]'); if (!el) return;
    const r = el.getBoundingClientRect(), id = el.dataset.id;
    setTimeout(() => UP.moMV(id, r), 0);
  }, true);
  // thẻ ở màn chọn: chạm = mở hồ sơ; nút nhỏ góc phải = thêm/bỏ nhanh
  const _theChonGoc = UI.theChon;
  UI.theChon = function (r) {
    const c = _theChonGoc.call(this, r);
    c.dataset.act = 'xem-u';
    c.setAttribute('role', 'button'); c.setAttribute('aria-label', r.ten + ': open file');
    if (SKILLS[r.id]) { const q = document.createElement('button'); q.className = 'up-q'; q.dataset.act = 'chon-u'; q.dataset.id = r.id; q.setAttribute('aria-label', 'Add or remove ' + r.ten); c.appendChild(q); }
    return c;
  };
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]'); if (!el || el.dataset.act !== 'xem-u') return;
    UP.mo(el.dataset.id, el);
  });
}

// ===================================================== chế độ XEM TRƯỚC (bên trong iframe) =====================================================
if (UP_XEM) {
  document.documentElement.classList.add('up-xem');
  G.debug.nointro = true;
  // khung xem trước KHÔNG dựng lưới 85 thẻ của màn chọn (85 chân dung ≈ 6 MB tải thừa → Test range đen rất lâu trên 4G)
  //  (khoá bằng getter/setter: các file nạp sau — bobai… — bọc UI.veChon cũng không dựng lại được → không tải thêm ~30 icon)
  // trang hồ sơ ẩn (display:none) → iframe co về 0×0 → REN.coLai dựng canvas 0×0 (lỗi drawImage, mở lại trang vẫn ĐEN).
  //  Khung xem trước luôn 430×860 → bỏ qua lần đổi cỡ về 0.
  { const coLaiGoc = REN.coLai; REN.coLai = function () { if (!innerWidth || !innerHeight) return; return coLaiGoc.apply(this, arguments); }; }
  Object.defineProperty(UI, 'veChon', { configurable: true, get() { return function () { }; }, set() { } });
  for (const k in SND) if (typeof SND[k] === 'function') SND[k] = function () { };
  for (const k of ['bangWave', 'canhBaoTrum', 'ketQua', 'cutIn', 'nhac']) UI[k] = function () { };
  ketThuc = function () { };
  lot = function (E) { E.chet = true; E.tChet = 1; };   // quái lọt: chỉ biến mất, không mất tim
  try { Storage.prototype.setItem = function () { }; } catch (e) { } // không ghi đè lựa chọn / âm thanh của người chơi
  const UPX = {
    id: null, sao: 3, t: 0, tq: 0, tk: 0, tr: 0,
    bat(id, sao) {
      if (!SKILLS[id] || !G.rosterMap[id]) return;
      this.id = id; this.sao = clamp(sao || 3, 1, 7);
      const deck = [id].concat(['lien', 'canon', 'set', 'bang', 'sungluc'].filter(x => x !== id && SKILLS[x])).slice(0, 5);
      batDau('solo', deck, 'hero');
      G.ktDeck = false; // bàn demo đặt ụ tuỳ ý — tắt bất biến bộ bài (game.js ktDeck)
      G.cho = 1e9; G.wave = 6; G.tocDo = 1; G.dung = !!this.dungMuon;
      this.xep(); G.quai.length = 0; this.tq = 0.2; this.tk = 0; this.tr = 0;
    },
    kieu(id) {
      const sk = SKILLS[id];
      if (sk.hoTro && SUP_LOAI[id]) return 'ht';
      if (id === 'mimic' || id === 'tudo' || sk.ghepDB || sk.ghep) return 'ghep';
      if (sk.chuDong) return 'chu';
      if (!sk.dmg) return 'phu';
      return 'tc';
    },
    // xếp bàn theo kiểu ụ
    xep() {
      const B = G.ban[0], id = this.id, s = this.sao, k = this.kieu(id);
      B.t.fill(null); G.dan.length = 0; G.hu.length = 0; UI.xemHT = null; UI.xemU = null; B.mana = 999; B.gia = 10; FX.reset(); VX.reset();
      const dat = (o, x, sao) => { const T = sinhU(taoU(B, x, sao, o)); B.t[o] = T; return T; };
      this.T = dat(7, id, s);
      if (k === 'ht') {
        const ke = upCheo(id) ? [1, 3, 11, 13] : [2, 6, 8, 12];
        ke.forEach((o, i) => dat(o, i % 2 ? 'canon' : 'lien', Math.max(1, s - 1)));
      } else if (k === 'ghep') {
        const ms = Math.min(s, 6); this.T.sao = ms;
        let p = (id === 'mimic' || id === 'tudo' || SKILLS[id].ghepDB) ? 'lien' : id;
        this.P = dat(8, p, id === 'tudo' ? Math.min(7, ms + 1) : ms); // Wild Link: bạn ghép KHÁC sao (+1★) — kết quả = sao cao hơn
        if (!hopLeGhep(this.T, this.P)) this.P = dat(8, id, ms);
        dat(2, 'lien', 2); dat(12, 'canon', 2);
      } else if (k === 'phu') { dat(6, 'lien', s); dat(8, 'canon', s); }
      for (const T of B.t) if (T) T.gd = null;
      // máu quái theo sức bắn của bàn → mỗi quái chịu vài phát (thấy rõ hiệu ứng, không chết tức thì)
      let dps = 0; for (const T of B.t) if (T) { try { const sk = SKILLS[T.id]; if (sk.dmg) dps += dmgU(T) * Math.min(4, tocU(T)); } catch (e) { } }
      this.hp = Math.max(60, dps * 3.2);
      this.k = k;
    },
    tick(dt) {
      if (!this.id || !G.ban.length) return;
      const B = G.ban[0];
      this.tq -= dt; this.tk += dt; this.tr += dt;
      const song = G.quai.filter(E => !E.chet).length;
      if (this.tq <= 0 && song < 12) {
        this.tq = 0.8 + Math.random() * 0.5; this.n = (this.n || 0) + 1;
        const loai = this.n % 7 === 0 ? 'khong_lo' : this.n % 3 === 0 ? 'bay' : 'bo';
        const E = sinhQuai(loai, 0, 50 + Math.random() * 40, 1); E.max = E.hp = Math.round(this.hp * QUAI[loai].hp);
      }
      if (this.k === 'ghep' && this.tk > 3.6) {
        this.tk = -2.4; // ghép → xem kết quả ~2.4 s → xếp lại
        const a = this.T, b = this.P;
        if (a && b && B.t[a.o] === a && B.t[b.o] === b && hopLeGhep(a, b)) ghep(B, a, b); else this.xep();
        this._xepLai = true;
      } else if (this.k === 'ghep' && this._xepLai && this.tk > 0) { this._xepLai = false; this.xep(); this.tk = 0; }
      if (this.k === 'chu' && this.tk > 5) {
        this.tk = 0; const T = B.t[7];
        if (T && T.id === this.id) { T.nap = 1; try { SKILLS[this.id].chuDong(G, B, T); } catch (e) { } }
      }
      if (this.k === 'ht' && this.tk > 3.4) {
        this.tk = 0; const T = B.t[7], n = performance.now();
        if (T && T.id === this.id) UI.xemHT = { T, t0: n, giu: false, het: n + 2400 };
      }
      if (this.tr > 26) { this.tr = 0; this.xep(); } // ụ biến hình / tiến hoá: định kỳ về lại ban đầu
    },
  };
  const _capNhatGoc = capNhat;
  capNhat = function (dt) { _capNhatGoc(dt); if (!window.SD) try { UPX.tick(dt); } catch (e) { } };
  // clip minh hoạ kỹ năng (skilldemo.js) — nạp sau mọi script của trang; lỗi nạp → giữ cảnh thử bắn cũ (UPX)
  // chỉ nạp 1 lần: DOMContentLoaded có thể phát 2 lần (bản gốc của trình duyệt + bản phát lại của bộ nạp index.html) → 'SD' khai báo 2 lần
  const napSD = () => { if (window.__napSD) return; window.__napSD = 1; const sc = document.createElement('script'); sc.src = 'js/skilldemo.js'; document.body.appendChild(sc); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', napSD); else napSD();
  const batXem = (id, sao, gd) => (window.SD ? SD.bat(id, sao, gd) : UPX.bat(id, sao));
  // UI.init có thể đã chạy trước khi file này nạp (phông sẵn) → chờ roster + canvas sẵn sàng rồi dựng cảnh
  //  yêu cầu đến TRƯỚC khi sẵn sàng (trang mẹ đã chuyển ụ) → giữ lại, chạy ụ đó thay ụ trong URL
  let san = false, choYC = null;
  const cho = setInterval(() => {
    const q = choYC || { id: UP_XEM, sao: +UP_Q.get('star') || 4, gd: +UP_Q.get('gd') || 0 };
    if (G.rosterMap && (G.rosterMap[q.id] || /^mv:/.test(q.id)) && REN.cv && (window.SD || performance.now() > 4000)) {
      clearInterval(cho); san = true;
      if (window.SD) SD.dungMuon = !!UPX.dungMuon;
      if (!UPX.id && !(window.SD && SD.id)) batXem(q.id, q.sao || 4, q.gd || 0);
    }
  }, 60);
  addEventListener('message', (e) => {
    const d = e.data && e.data.tmXem; if (!d) return;
    if (d.dung != null) { UPX.dungMuon = !!d.dung; if (window.SD) SD.dungMuon = !!d.dung; if (G.ban.length) G.dung = !!d.dung; }
    if (d.id) { if (san) batXem(d.id, d.sao, d.gd); else choYC = d; }
  });
  try { if (parent !== window) parent.postMessage({ tmXemSS: 1 }, '*'); } catch (e) { }
}
