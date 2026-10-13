// LƯU LƯỢT ẢI ĐANG CHƠI (Phiên hiệu năng, V9): Safari trên iPhone hay tự tải lại trang khi thiếu bộ nhớ (hoặc người chơi lỡ tay tải lại)
// làm mất cả lượt ải đang chơi. Mỗi lần qua cửa sang phòng khác, game ghi một bản gọn của lượt ải: vùng, ải, độ khó, bản đồ (kiểu + hạt giống),
// phòng đã dọn / đã thấy, máu, mana, bình máu, chưởng đã nhặt trong ải, đồ nhặt được, lời nguyền... vào localStorage (khoá linhkhi_luot_v1).
// Mở lại game, vào tới làng: hỏi "Chơi tiếp ải?". Chơi tiếp thì dựng lại đúng bản đồ, các phòng đã dọn để trống, đứng ở cửa phòng đang tới.
// Phòng đang dở thì đánh lại từ đầu phòng đó (không lưu quái đang đánh). Thắng / thua / bỏ ải / vào ải khác: xoá bản ghi.
// Không đụng js/stage.js: chỉ bọc G.tick, G.startStage và cảnh làng từ bên ngoài. Tắt: G.LUU_LUOT = false hoặc ?luuluot=0.
// Nạp SAU js/stage.js và js/village.js.
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.startStage || !G.Village) return;
  if (G.LUU_LUOT === undefined) {
    let tat = false;
    try { tat = /[?&]luuluot=0(&|$)/.test(location.search || ''); } catch (e) { tat = false; }
    G.LUU_LUOT = !tat;
  }
  const KHOA = 'linhkhi_luot_v1', HAN = 3 * 24 * 3600 * 1000; // bản ghi cũ hơn 3 ngày thì bỏ
  if (G.ngonNgu && G.ngonNgu.them) G.ngonNgu.them({
    'Chơi tiếp ải?': 'Continue the stage?', 'Chơi tiếp': 'Continue', 'Bỏ ải này': 'Abandon it',
    '{0}: ải {1}, đã dọn {2} phòng, máu {3}/{4}': '{0}: stage {1}, {2} rooms cleared, HP {3}/{4}',
    'Lần trước con đang chơi dở một ải.': 'Last time you left a stage unfinished.',
  });
  const doc = () => { try { const r = window.localStorage.getItem(KHOA); return r ? JSON.parse(r) : null; } catch (e) { return null; } };
  const xoa = () => { try { window.localStorage.removeItem(KHOA); } catch (e) { /* bỏ qua */ } };
  const ghi = (o) => { try { window.localStorage.setItem(KHOA, JSON.stringify(o)); } catch (e) { /* bộ nhớ đầy: thôi */ } };
  const sao = (v) => JSON.parse(JSON.stringify(v == null ? null : v));
  const LUU_P = ['hp', 'maxhp', 'mana', 'potions', 'cur'];

  // ---------- ghi khi qua cửa ----------
  let idxCu = null, uidCu = null, trongAi = false;
  function chupLuot(S) {
    const P = S.P, W = S.W, dung = {};
    // vật đã dùng (rương đã mở, suối đã uống, bàn thờ...) theo thứ tự trong phòng: dựng lại phòng thì đánh dấu lại
    for (const id in S.worlds) { const w = S.worlds[id]; if (!w || !w.props) continue; const ds = []; w.props.forEach((p, k) => { if (p && p.act && p.used) ds.push(k); }); if (ds.length) dung[id] = ds; }
    const o = {
      v: 1, luc: Date.now(), hero: G.save.hero, carry: sao(G.save.carry), r: S.r, i: S.i, diff: S.diff, kind: S.map.kind, seed: S.map.seed,
      idx: S.idx, cleared: sao(S.cleared), seen: sao(S.seen), known: sao(S.known), visits: S.visits, dung,
      P: {}, marks: S.marks || 0, marksMult: S.marksMult, haste: S.haste, curse: S.curse || null, usedPotion: !!S.usedPotion, swapped: !!S.swapped,
      stats: sao(S.stats), loot: sao(S.loot), got: sao(S.got),
    };
    for (const k of LUU_P) if (typeof P[k] === 'number') o.P[k] = P[k];
    if (W && W.type) o.loai = W.type;
    return o;
  }
  const t0 = G.tick;
  G.tick = function () {
    t0.apply(this, arguments);
    if (!G.LUU_LUOT) return;
    try {
      const S = G.getRun && G.getRun();
      if (G.scene !== G.StageScene || !S) { if (trongAi && G.scene === G.Village) xoa(); trongAi = false; idxCu = null; return; } // rời ải về làng (bỏ ải): xoá
      trongAi = true;
      if (S.mode === 'result' || S.mode === 'dead' || S.won) { if (uidCu === S.uid) { xoa(); uidCu = null; } return; }
      if (S.tut || S.mode !== 'play' || !S.map || S.idx == null || S.idx < 0) return;
      if (S.idx === idxCu && S.uid === uidCu) return;
      idxCu = S.idx; uidCu = S.uid;
      G.persist(); // đồ nhặt trong ải đã cộng vào bản lưu: ghi luôn để khớp với bản ghi lượt ải
      ghi(chupLuot(S));
    } catch (e) { /* lưu lượt hỏng thì thôi, không làm đứng game */ }
  };

  // ---------- vào ải khác / chơi tiếp ----------
  let dangKhoiPhuc = false;
  const ss0 = G.startStage;
  G.startStage = function () {
    if (!dangKhoiPhuc) { xoa(); hoi = null; }
    return ss0.apply(this, arguments);
  };
  function khoiPhuc(o) {
    dangKhoiPhuc = true;
    try { G.startStage(o.r, o.i, o.diff, { kind: o.kind, seed: o.seed }); } finally { dangKhoiPhuc = false; }
    const S = G.getRun();
    if (!S || S.map.seed !== o.seed) return false;
    // các phòng đã dọn: dựng sẵn, đánh dấu đã dọn (không ra quái), vật đã dùng giữ nguyên trạng thái
    const xong = Object.keys(o.cleared || {}).map(Number).filter((id) => id !== o.idx && S.map.rooms[id]);
    for (const id of xong.concat(Object.keys(o.dung || {}).map(Number).filter((id) => xong.indexOf(id) < 0 && id !== o.idx && S.map.rooms[id]))) {
      G.gotoRoom(id);
      const W = G.getWorld();
      if (o.cleared[id]) { W.cleared = true; W.waves = []; W.spawns = []; for (const e of W.ents) if (!e.isBoss) e.dead = true; W.ents = W.ents.filter((e) => !e.dead); }
      for (const k of (o.dung && o.dung[id]) || []) if (W.props[k]) W.props[k].used = true;
    }
    S.cleared = Object.assign({}, o.cleared); S.seen = Object.assign({}, o.seen); S.known = Object.assign({}, o.known);
    G.gotoRoom(o.idx);
    S.visits = o.visits;
    for (const k of (o.dung && o.dung[o.idx]) || []) { const W = G.getWorld(); if (W.props[k]) W.props[k].used = true; }
    if (o.cleared[o.idx]) { const W = G.getWorld(); W.cleared = true; W.waves = []; W.spawns = []; }
    const P = S.P;
    for (const k in o.P) if (typeof o.P[k] === 'number') P[k] = o.P[k];
    if (P.cur >= P.weapons.length) P.cur = 0;
    S.marks = o.marks || 0; S.marksMult = o.marksMult || S.marksMult; S.haste = o.haste || S.haste; S.curse = o.curse; S.usedPotion = !!o.usedPotion; S.swapped = !!o.swapped;
    if (o.stats) S.stats = o.stats; if (o.loot) S.loot = o.loot;
    // đồ nhặt trong ải: vũ khí trỏ lại đúng món trong bản lưu (đã được cộng vào bản lưu lúc nhặt)
    if (Array.isArray(o.got)) S.got = o.got.map((g) => (g && g.w ? (G.weaponById(g.w.id) ? { s: g.s, w: G.weaponById(g.w.id) } : String(g.s || '')) : g));
    if (S.W) { S.W.marksMult = S.marksMult; S.W.haste = S.haste; S.W.noPotion = S.curse === 'dry'; }
    S.fade = 0.35;
    idxCu = S.idx; uidCu = S.uid;
    return true;
  }
  G.luuLuot = { doc, xoa, chup: () => (G.getRun() ? chupLuot(G.getRun()) : null), khoiPhuc, dangHoi: () => !!hoi }; // cho kiểm thử

  // ---------- hỏi "Chơi tiếp ải?" ở làng ----------
  let hoi = null, daHoi = false;
  function canHoi() {
    if (daHoi || !G.LUU_LUOT) return;
    daHoi = true;
    const o = doc();
    if (!o || o.v !== 1 || !(Date.now() - o.luc < HAN) || o.hero !== G.save.hero || !G.REGIONS[o.r]) { if (o) xoa(); return; }
    hoi = o;
  }
  const V = () => (G.villageApi && G.villageApi.V) || {};
  const vd0 = G.Village.draw, vu0 = G.Village.update;
  G.Village.update = function (dt) {
    if (hoi) return; // đang hỏi: làng đứng yên, chạm không lọt xuống
    return vu0.apply(this, arguments);
  };
  G.Village.draw = function () {
    if (!hoi && !daHoi && V().tab === 'hub' && !V().moi) canHoi();
    if (!hoi) return vd0.apply(this, arguments);
    const c = G.click; G.click = null;
    vd0.apply(this, arguments);
    G.syncTaps = [];
    G.click = c;
    veHoi();
  };
  function veHoi() {
    const T = G.theme, ui = G.ui, o = hoi, x = 120, y = 70, w = 240, h = 116;
    ui.rect(0, 0, 480, 270, 'rgba(0,0,0,0.55)');
    if (T && T.panel) T.panel(x, y, w, h, G.t('Chơi tiếp ải?')); else ui.panel(x, y, w, h, G.t('Chơi tiếp ải?'));
    const reg = G.REGIONS[o.r], n = Object.keys(o.cleared || {}).length;
    ui.text(G.t('Lần trước con đang chơi dở một ải.'), x + w / 2, y + 40, { size: 8, align: 'center', color: '#f0e0c0' });
    ui.text(G.t('{0}: ải {1}, đã dọn {2} phòng, máu {3}/{4}', G.kd ? G.kd(G.t(reg.name)) : reg.name, o.i + 1, n, Math.round(o.P.hp || 0), Math.round(o.P.maxhp || 0)), x + w / 2, y + 56, { size: 7.5, align: 'center', color: '#d8c8a8' });
    const nut = (bx, chu, chinh) => (T && T.btn ? T.btn(bx, y + 74, 100, 26, G.t(chu), { size: 8.5, primary: chinh }) : ui.btn(bx, y + 74, 100, 26, G.t(chu)));
    if (nut(x + 14, 'Chơi tiếp', true)) { const giu = hoi; hoi = null; let ok = false; try { ok = khoiPhuc(giu); } catch (e) { ok = false; console.error('Linh Khí: không dựng lại được lượt ải', e); } if (!ok) { xoa(); G.setScene(G.Village); } }
    else if (nut(x + w - 114, 'Bỏ ải này', false)) { hoi = null; xoa(); }
  }
})();
