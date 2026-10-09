// XƯỞNG SPRITE: bản game thử (trang xuong-sprite-thu.html). Nạp SAU toàn bộ mã game.
// Nhận tệp sprite đang làm từ công cụ (postMessage, hoặc localStorage "xuongSprite.thu" khi mở riêng),
// rồi vào thẳng một phòng đánh có quái dùng hình mới. Chỉ có trong trang thử: bản game chính không chứa tệp này.
// Trang thử KHÔNG ghi bản lưu của game (G.persist bị tắt) và không dùng lưu mây (?cloud=0).
(function () {
  'use strict';
  const G = window.G, SC = G.spriteCustom;
  G.persist = function () { /* trang thử không ghi đè bản lưu thật */ };
  G.XUONG_THU = true;
  let tep = null, cho = null, tuDanh = false, lanCuoi = 0;

  function vaiCua(ma) { // tìm vai và vùng của quái trong game
    const M = G.MOB_ART;
    for (const vai of Object.keys(M)) {
      const v = M[vai];
      if (vai === 'boss') { for (const k in v) if (v[k] === ma) return { vai: 'boss', r: ['moc', 'ngu', 'ho'].indexOf(k) }; continue; }
      for (let r = 0; r < v.length; r++) { if (v[r] === ma) return { vai, r }; if (Array.isArray(v[r]) && v[r].includes(ma)) return { vai, r }; }
    }
    return null;
  }
  function luuThu() {
    const s = G.newSave();
    s.sound = false; s.tut = Object.assign(s.tut || {}, { done: true });
    for (const k of G.HKEYS) { s.heroes[k].unlocked = true; s.heroes[k].lvl = 12; }
    G.save = s;
  }
  const DO = { 'vu-khi': 1, 'trang-phuc': 1, 'vat-pham': 1 };
  function thaVatPham() { // vật phẩm: thả mấy món quanh em bé
    const W = G.getWorld && G.getWorld(), S = G.getRun && G.getRun(); if (!W || !S || !G.doRoi) return;
    const k = tep.vat_pham, it = /^linhkhi-/.test(k) ? { kind: 'linhkhi', el: k.split('-')[1] } : { kind: k };
    for (let i = 0; i < 4; i++) { const o = G.doRoi.tha(W, S.P.x + 30 + i * 12, S.P.y - 10 + (i % 2) * 20, it); if (o) o.got = null; }
  }
  // Em bé mặc món đồ tự vẽ: món có trong kho đồ thì thêm và mặc; đồ khởi đầu của em bé thì chọn em bé có món đó;
  // còn lại (không ai mặc) thì cho hình tự vẽ tạm thay hình khởi đầu của em bé để xem.
  function macDo(t) {
    const sv = G.save, O = G.outfit, SLOT = { hats: 'hat', robes: 'robe', backs: 'back', hands: 'hand', wings: 'wing', masks: 'mask' }, slot = SLOT[t.o];
    if (O && slot !== 'mask') for (const k in O.ITEMS) { const T = O.ITEMS[k]; if (T.slot === slot && T.look === t.look) { const it = O.add(sv, k, 1, { lv: 2, quiet: true }); if (it) O.wear(sv, it); return null; } }
    const st = G.heroLooks.starter || {};
    for (const key of G.HKEYS) if (st[key] && st[key][slot] === t.look) { sv.hero = key; return null; }
    for (const key of G.HKEYS) if (st[key] && st[key][slot]) { sv.hero = key; return st[key][slot]; }
    return null;
  }
  function goiQuai() {
    if (!tep) return;
    const W = G.getWorld && G.getWorld(), S = G.getRun && G.getRun();
    if (!W || !S) return;
    if (tep.doi_tuong === 'vat-pham') thaVatPham();
    if (tep.doi_tuong === 'em-be' || DO[tep.doi_tuong]) {
      for (let i = 0; i < 3; i++) { const e = G.spawnEnemy(i === 2 ? 'archer' : 'rusher', G.rr(W.x0 + 90, W.x1), G.rr(W.y0, W.y1), {}); e.inside = true; }
      return;
    }
    const dich = SC.ds[tep.ma] && G.monsterArt._defs[tep.ma] ? tep.ma : tep.thay_cho, v = vaiCua(dich);
    if (!v || v.vai === 'boss' || v.vai === 'mini') return;
    const n = v.vai === 'elite' ? 1 : v.vai === 'swarm' ? 2 : 3;
    for (let i = 0; i < n; i++) { const e = G.spawnEnemy(v.vai, G.rr(W.x0 + 80, W.x1), G.rr(W.y0, W.y1), { art: dich }); e.inside = true; }
  }
  function batDau() {
    if (!tep || !G.scene) return;
    SC.clear();
    luuThu();
    let tepDung = tep;
    if (tep.doi_tuong === 'vu-khi') { // cầm đúng loại, dòng, hệ, giai đoạn của vũ khí tự vẽ
      const V = tep.vu_khi, sv = G.save; sv.weapons = []; sv.nextId = 1;
      const w = G.newWeapon(sv, V.loai, V.he ? 3 : 1, { family: V.dong });
      if (V.he) { w.branch = V.he; w.marks[V.he] = G.MARKS[Math.max(0, (V.gd || 1) - 1)]; }
      const w2 = G.newWeapon(sv, V.loai === 'bow' ? 'sword' : 'bow', 0, { family: 0 });
      sv.carry = [w.id, w2.id];
    } else if (tep.doi_tuong === 'trang-phuc') {
      const thay = macDo(tep.trang_phuc);
      if (thay) tepDung = Object.assign({}, tep, { trang_phuc: Object.assign({}, tep.trang_phuc, { look: thay }) });
    }
    const sp = SC.add(tepDung);
    if (!sp) { baoLoi('Tệp hỏng: ' + SC.loi.join('; ')); return; }
    let dich = null;
    if (tep.doi_tuong === 'quai') {
      dich = G.monsterArt._defs[tep.ma] ? tep.ma : tep.thay_cho;
      if (dich && dich !== tep.ma) SC.ds[dich] = sp; // quái mới: tạm mượn chỗ của một quái có sẵn
    }
    const v = dich ? vaiCua(dich) : { vai: 'rusher', r: 0 };
    if (tep.doi_tuong === 'em-be') { const k = tep.ma.replace(/^em-be-?/, ''); if (G.save.heroes[k]) G.save.hero = k; }
    G.rnd = G.srand(7);
    const r = v ? Math.max(0, v.r) : 0;
    G.pointers && G.pointers.clear && G.pointers.clear();
    if (v && (v.vai === 'boss' || v.vai === 'mini')) {
      G.startStage(r, v.vai === 'boss' ? 4 : 2, 0);
      const S = G.getRun(), id = S.map.rooms.findIndex((x) => x.type === 'boss');
      G.gotoRoom(id);
    } else {
      G.startStage(r, 2, 0);
      const W = G.getWorld();
      W.waves = []; W.spawns = []; W.props = W.props.filter((p) => p.type === 'roomFore'); W.banner = null;
      goiQuai();
    }
    const S = G.getRun(); S.hint = null;
    if (S.P.mv) { S.P.mv.tips = { sword: 1, bow: 1, spear: 1, hammer: 1 }; S.P.mv.tipWait = null; }
    lanCuoi = Date.now();
  }
  function baoLoi(chu) { try { window.parent.postMessage({ kieu: 'xuong-sprite-loi', chu }, '*'); } catch (e) { /* bỏ qua */ } if (window.console) console.warn(chu); }
  // Bé tự đánh: đi tới con quái gần nhất và chém, thỉnh thoảng né.
  function botDon(S) {
    const W = S.W, P = S.P, inp = { mx: 0, my: 0, atk: false, atkP: false, dodgeP: false, specialP: false, skillP: false, swapP: false, potionP: false, pauseP: false };
    let gan = null, kc = 1e9;
    for (const e of W.ents) { if (e.dead || e.dying != null || e.hidden) continue; const d = Math.hypot(e.x - P.x, e.y - P.y); if (d < kc) { kc = d; gan = e; } }
    if (W.boss && !W.boss.dead) { const d = Math.hypot(W.boss.x - P.x, W.boss.y - P.y); if (d < kc) { kc = d; gan = W.boss; } }
    if (!gan) return inp;
    const dx = gan.x - P.x, dy = gan.y - P.y, L = Math.hypot(dx, dy) || 1;
    if (kc > 26) { inp.mx = dx / L; inp.my = dy / L; } else { inp.atk = true; inp.atkP = Math.floor(G.time * 4) % 2 === 0; inp.mx = dx / L * 0.01; }
    if (gan.wind > 0 && kc < 40 && Math.random() < 0.04) inp.dodgeP = true;
    return inp;
  }
  // Giữ trận đánh chạy mãi: bé không chết, hết quái thì gọi thêm, ải kết thúc thì vào lại.
  setInterval(() => {
    if (!tep) return;
    const S = G.getRun && G.getRun();
    if (!S || !S.P) return;
    const P = S.P, W = S.W;
    if (P.hp < P.maxhp * 0.4) P.hp = P.maxhp;
    if (S.mode !== 'play' || P.dead || G.scene !== G.StageScene) { if (Date.now() - lanCuoi > 1500) batDau(); return; }
    if (W && !W.boss && !W.ents.some((e) => !e.dead && e.dying == null) && Date.now() - lanCuoi > 1800) { lanCuoi = Date.now(); goiQuai(); }
  }, 400);
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.kieu === 'xuong-sprite-thu' && d.tep) { tep = d.tep; if (G.scene) batDau(); }
    if (d.kieu === 'xuong-sprite-lenh') {
      if (d.lenh === 'lai') { if (G.getRun && G.getRun() && G.getRun().W && !G.getRun().W.boss) goiQuai(); else batDau(); }
      if (d.lenh === 'tu-danh') { tuDanh = !!d.bat; G.botInput = tuDanh ? botDon : null; }
    }
  });
  try { const s = localStorage.getItem('xuongSprite.thu'); if (s) tep = JSON.parse(s); } catch (e) { tep = null; }
  cho = setInterval(() => {
    if (!G.scene) return;
    clearInterval(cho);
    if (tep) batDau();
    try { window.parent.postMessage({ kieu: 'xuong-sprite-san-sang' }, '*'); } catch (e) { /* bỏ qua */ }
  }, 60);
  G.xuongThu = { batDau, goiQuai, dat: (t) => { tep = t; batDau(); } };
})();
