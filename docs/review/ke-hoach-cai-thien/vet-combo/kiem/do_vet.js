// Đo vệt đòn từng nhát combo (phiên vet-combo 12/10). Nạp sau tests/bot.js, setup.js, au_lib.js.
// VC.chay(key, bo, wt, dichuyen, chup): bấm Đánh liên tục (chạm nhả mỗi 5 khung) 150 khung, mỗi khung:
//  - vẽ thật (G.drawWorld) rồi vẽ lại lần hai có giấu vệt đòn của bé (S.E có o.vd, dải vệt code TR, tên của bé với cung)
//  - hiệu điểm ảnh hai lần vẽ trong khung quanh bé = số điểm ảnh vệt THẤY ĐƯỢC (đơn vị điểm ảnh thế giới).
// Mỗi nhát (lúc M.hit / doHit gọi): ghi tên đòn, nhát thứ mấy, số hình vệt sinh ra (theo ty / ảnh), cộng điểm ảnh thấy được
// từ nhát đó tới nhát kế.
(function () {
  const VC = (window.VC = {});
  const BO = { rung: ['mu_sung', 'ao_vo_cay', 'gui_tre', 'bua_nanh'], bien: ['ao_vay'], lau: ['ao_long'] };
  VC.mac = function (bo) {
    const sv = G.save, O = G.outfit; if (!bo || !O) return [];
    const I = O.ITEMS || O.I || {}; const ds = [];
    for (const id in I) if (I[id].set === bo && I[id].slot !== 'wing') ds.push(id);
    if (!ds.length) for (const id of BO[bo]) ds.push(id);
    for (const id of ds) { const it = O.add(sv, id, 1, { quiet: true }); if (it) O.wear(sv, it); }
    return ds;
  };
  // chỉ hình VỆT của đường vung (không tính chớp trúng đòn trên bia, vòng sóng, vết nứt, hạt)
  const VET_ANH = /^hu-(chem|dam|quet|nen-dat|ban-cung)(-|$)/, VET_TY = { cut: 1, cres: 1, slash: 1, thrust: 1, dashline: 1 };
  VC.laVet = (o) => !!o.pl && (VET_TY[o.ty] === 1 || (o.ty === 'anh' && VET_ANH.test(o.ma || '')));
  VC.chay = function (key, bo, wt, dichuyen, chup, soKhung) {
    const ts0 = G.testSave;
    G.testSave = function (o) { const sv = ts0(o); VC.mac(bo); return sv; };
    let r;
    try { r = AU.room({ hero: key, melee: wt === 'bow' ? 'sword' : wt, lvl: 10 }); } finally { G.testSave = ts0; }
    const { W, P } = r;
    AU.want(P, wt);
    P.face = 1;
    AU.run(2, true);
    const S = G.fx.state();
    const KX = wt === 'bow' ? 70 : wt === 'spear' ? 40 : 26;
    const bia = [AU.dummy(P.x + KX, P.y, { hp: 1e8 }), AU.dummy(P.x - KX, P.y, { hp: 1e8 })];
    const nhat = []; let cur = null, khung = 0;
    const M = G.moves, h0 = M.hit, d0 = G.cb.doHit;
    const sinh = new Set(S.E);
    const ghi = (P2) => {
      if (P2 !== P) return;
      const mv = P.mv || {}, o = mv.cur || {};
      cur = { k: khung, ten: o.name || '?', kind: o.kind || '?', pose: o.pose != null ? o.pose : P.comboI, step: o.step || 0, chay: !!P.moving, hinh: [], px: 0, kThay: 0, kCo: 0, tr: 0, mx: 0, my: 0, mn: 0, qx: null, qy: null };
      // tâm vùng lưỡi quét qua (đường vung thật, cả đoạn sau thân): điểm 0,75 dài lưỡi tính từ chỗ cầm, trung bình trong cửa sổ vệt
      const TL = G.tinhLinh, WIN = { sword: [0.2, 0.66], hammer: [0.26, 0.64], spear: [0.42, 0.66] }[wt];
      if (TL && TL.tip && WIN) { const a = G.heroArgs(P); let sx = 0, sy = 0, n = 0; for (let i = 0; i <= 40; i++) { a.atk = i / 40; const q = TL.tip(a); if (!q || q.anim !== 'atk' || q.u < WIN[0] || q.u > WIN[1]) continue; const l = q.L * 0.75; sx += q.gx + q.dx * l - P.x; sy += q.gy + q.dy * l - P.y; n++; } if (n) { cur.qx = sx / n; cur.qy = sy / n; } }
      nhat.push(cur);
    };
    M.hit = function (P2) { ghi(P2); return h0.apply(this, arguments); };
    G.cb.doHit = function (P2) { if (!(P.mv && P.mv.cur)) ghi(P2); return d0.apply(this, arguments); };
    const cv = G.wx.canvas, sc = cv.width / G.W, ctx = cv.getContext('2d', { willReadFrequently: true });
    const anh = [];
    const vung = () => {
      const cam = Math.round(W.cam); const x = Math.max(0, Math.floor((P.x - cam - 70) * sc)), y = Math.max(0, Math.floor((P.y - 70) * sc));
      return [x, y, Math.min(cv.width - x, Math.ceil(140 * sc)), Math.min(cv.height - y, Math.ceil(100 * sc))];
    };
    const ve = () => { G.drawWorld(G.getRun().r); };
    const doKhung = () => {
      // hình mới sinh ra trong khung này, của em bé
      for (const o of S.E) if (!sinh.has(o)) { sinh.add(o); if (cur && o.pl) if (VC.laVet(o)) cur.hinh.push((o.ty === 'anh' ? o.ma : o.ty) + ':' + (+o.t.toFixed(2))); else cur.khac = (cur.khac || 0) + 1; }
      ve();
      const v = vung(), a = ctx.getImageData(v[0], v[1], v[2], v[3]).data;
      // giấu vệt
      const an = [];
      for (const o of S.E) if (VC.laVet(o)) { an.push([o, o.d]); o.d = 1; }
      const trN = S.trN; S.trN = 0;
      const pj = []; if (wt === 'bow') for (const q of W.projs) if (q.team === 'player') { pj.push(q); }
      if (pj.length) W.projs = W.projs.filter((q) => q.team !== 'player');
      try { ve(); } finally { for (const [o, d] of an) o.d = d; S.trN = trN; if (pj.length) W.projs = W.projs.concat(pj); }
      const b = ctx.getImageData(v[0], v[1], v[2], v[3]).data;
      let n = 0, cx = 0, cy = 0; const camX = Math.round(W.cam);
      for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 40) { n++; const j = i >> 2; cx += v[0] + (j % v[2]); cy += v[1] + Math.floor(j / v[2]); }
      if (cur && n) { cur.mx += cx / sc + (camX - P.x) * n; cur.my += cy / sc - P.y * n; cur.mn += n; }
      const px = n / (sc * sc);
      if (cur) { cur.px += px; if (px >= 15) cur.kThay++; if (px > 0) cur.kCo++; }
      ve();
      if (chup && khung % 2 === 0) {
        const CW = 96, CH = 76, K = 3, cam = Math.round(W.cam);
        const c = document.createElement('canvas'); c.width = CW * K; c.height = CH * K; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
        x.drawImage(cv, (P.x - cam - CW / 2) * sc, (P.y - CH + 16) * sc, CW * sc, CH * sc, 0, 0, CW * K, CH * K);
        anh.push(c.toDataURL());
      }
      return px;
    };
    const N = soKhung || 150, theoKhung = [];
    try {
      AU.run(N, true, (i) => {
        khung = i;
        const bam = i % 5 === 0;
        const mx = dichuyen ? (Math.floor(i / 45) % 2 ? -1 : 1) : 0;
        AU.press({ atkP: bam, atk: bam, mx });
        AU.pin([{ e: bia[0], x: P.x + KX, y: P.y }, { e: bia[1], x: P.x - KX, y: P.y }]);
        if (i) theoKhung.push(+doKhung().toFixed(1));
      });
    } finally { M.hit = h0; G.cb.doHit = d0; AU.inp.atk = false; AU.inp.mx = 0; }
    const sp = G.spriteCustom && G.spriteCustom.cuaEmBe ? G.spriteCustom.cuaEmBe(key, { key, p: P, outfit: P.outfit }) : null;
    return { nhat: nhat.map((q) => ({ k: q.k, ten: q.ten, kind: q.kind, pose: q.pose, step: q.step, chay: q.chay, hinh: q.hinh, px: Math.round(q.px), kThay: q.kThay, kCo: q.kCo, vx: q.mn ? +(q.mx / q.mn).toFixed(1) : null, vy: q.mn ? +(q.my / q.mn).toFixed(1) : null, qx: q.qx != null ? +q.qx.toFixed(1) : null, qy: q.qy != null ? +q.qy.toFixed(1) : null, lech: q.mn && q.qx != null ? +Math.hypot(q.mx / q.mn - q.qx, q.my / q.mn - q.qy).toFixed(1) : null })), theoKhung, anh, than: sp && sp.ma, don: sp && sp.donMa };
  };
})();
