// Trận thật (phiên vet-combo): ải 1-1 có quái thật, vòng lặp requestAnimationFrame thật như trên điện thoại.
// Người chơi giả: chạm Đánh mỗi `nhip` nhịp logic, đi tới quái gần nhất khi xa (vừa chạy vừa chém).
// Mỗi nhát (M.hit): hình vệt sinh ra; sau mỗi lần vẽ (G.drawWorld) đếm số lần vẽ mà hình vệt còn sống và được vẽ,
// và vẽ lại một lần có giấu vệt để đo điểm ảnh vệt thấy được (chỉ trong 0,4 giây sau nhát).
(function () {
  const VT = (window.VT = {});
  const VET_ANH = /^hu-(chem|dam|quet|nen-dat|ban-cung)(-|$)/, VET_TY = { cut: 1, cres: 1, slash: 1, thrust: 1, dashline: 1 };
  const laVet = (o) => !!o.pl && (VET_TY[o.ty] === 1 || (o.ty === 'anh' && VET_ANH.test(o.ma || '')));
  VT.bat = function (key, bo, wt, nhip, giuNut) {
    G.testSave({ hero: key, melee: wt === 'bow' ? 'sword' : wt, lvl: 12 });
    if (bo && window.VC) VC.mac(bo);
    G.startStage(0, 1, 0);
    const R = G.getRun(); R.hint = null;
    let P = R.P; if (G.curW(P).type !== wt) { P.cur = 1 - P.cur; P.mv = null; }
    const out = (VT.out = { nhat: [], toiDaE: 0, ve: 0, loiVe: 0 });
    let cur = null, n = 0;
    const M = G.moves, h0 = M.hit;
    M.hit = function (P2) {
      const S = G.fx.state(), truoc = new Set(S ? S.E : []);
      const r = h0.apply(this, arguments);
      if (P2 === G.getRun().P && S) {
        const mv = P2.mv || {}, o = mv.cur || {};
        cur = { t: +G.time.toFixed(3), ten: o.name, kind: o.kind, pose: o.pose, chay: !!P2.moving, aim: P2.aimRel || 0, vet: [], soVe: 0, px: 0, khungThay: 0, E: S.E.length };
        for (const e of S.E) if (!truoc.has(e) && laVet(e)) cur.vet.push(e);
        out.nhat.push(cur);
      }
      return r;
    };
    const dw0 = G.drawWorld;
    G.drawWorld = function (reg) {
      const r = dw0.apply(this, arguments);
      const S = G.fx.state(); if (!S) return r;
      out.ve++; if (S.E.length > out.toiDaE) out.toiDaE = S.E.length;
      if (cur && G.time - cur.t < 0.4) {
        let song = 0; for (const e of cur.vet) if (e.t > 0 && S.E.indexOf(e) >= 0 && !(e.d > 0)) song++;
        if (song) cur.soVe++;
        if (VT.doPx) {
          const W = G.getWorld(), P3 = W.P, cv = G.wx.canvas, sc = cv.width / G.W, ctx = cv.getContext('2d', { willReadFrequently: true }), cam = Math.round(W.cam);
          const x = Math.max(0, Math.floor((P3.x - cam - 70) * sc)), y = Math.max(0, Math.floor((P3.y - 70) * sc)), w = Math.min(cv.width - x, Math.ceil(140 * sc)), h = Math.min(cv.height - y, Math.ceil(100 * sc));
          if (w > 0 && h > 0) {
            const a = ctx.getImageData(x, y, w, h).data, an = [];
            for (const o of S.E) if (laVet(o)) { an.push([o, o.d]); o.d = 1; }
            const tN = S.trN; S.trN = 0;
            try { dw0.apply(this, arguments); } finally { for (const [o, d] of an) o.d = d; S.trN = tN; }
            const b = ctx.getImageData(x, y, w, h).data;
            let k = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 40) k++;
            dw0.apply(this, arguments);
            const px = k / (sc * sc); cur.px += px; if (px >= 15) cur.khungThay++;
          }
        }
      }
      return r;
    };
    G.botInput = function () {
      n++;
      const R2 = G.getRun(), P2 = R2 && R2.P, W = G.getWorld();
      const o = { mx: 0, my: 0, atk: false, atkP: false, dodgeP: false, specialP: false, skillP: false, skill: false, swapP: false, potionP: false, pauseP: false, mapP: false };
      if (!P2 || !W) return o;
      P2.hp = P2.maxhp; // không chết giữa chừng
      let best = null, bd = 1e9; for (const e of G.targets()) { const d = Math.hypot(e.x - P2.x, e.y - P2.y); if (d < bd) { bd = d; best = e; } }
      const tam = wt === 'bow' ? 90 : wt === 'spear' ? 45 : 24;
      if (best && bd > tam) { const d = bd || 1; o.mx = (best.x - P2.x) / d; o.my = (best.y - P2.y) / d; }
      if (giuNut) { o.atk = true; o.atkP = n % 40 === 1; } else if (n % nhip === 0) { o.atk = true; o.atkP = true; }
      return o;
    };
    VT.dung = () => { M.hit = h0; G.drawWorld = dw0; G.botInput = null; };
    return true;
  };
  VT.kq = function () {
    const o = VT.out;
    return { toiDaE: o.toiDaE, ve: o.ve, nhat: o.nhat.map((q) => ({ t: q.t, ten: q.ten, kind: q.kind, pose: q.pose, chay: q.chay, aim: q.aim, vet: q.vet.map((e) => (e.ty === 'anh' ? e.ma : e.ty)), soVe: q.soVe, px: Math.round(q.px), khungThay: q.khungThay, E: q.E })) };
  };
})();
