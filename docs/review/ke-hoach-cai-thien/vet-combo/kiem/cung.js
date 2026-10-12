// Cung vệt (js/fx.js cungVk) so với đường vung thật của mũi kiếm, từng nhát combo. Nạp sau setup.js, au_lib.js, do_vet.js.
// CV.do(key, bo): mỗi nhát (comboI 0, 1, 2) quét tiến độ đòn 0..1 (41 mẫu, như cungVk), trong cửa sổ WIN.atk.sword [0.2, 0.66]:
// đếm mẫu, mẫu bị bỏ vì G.KIEM_KHOP (kiếm chĩa ra sau), vì G.KIEM_MUOT (front === false); góc đầu/cuối của đường vung thật và của phần còn lại.
(function () {
  const CV = (window.CV = {});
  const TAU = Math.PI * 2;
  CV.do = function (key, bo, wt) {
    wt = wt || 'sword';
    const ts0 = G.testSave;
    G.testSave = function (o) { const sv = ts0(o); if (bo) VC.mac(bo); return sv; };
    let r; try { r = AU.room({ hero: key, melee: wt, lvl: 10 }); } finally { G.testSave = ts0; }
    const { P } = r; AU.want(P, wt); P.face = 1; AU.run(2, true);
    const TL = G.tinhLinh, out = [], win = { sword: [0.2, 0.66], hammer: [0.26, 0.64], spear: [0.42, 0.66] }[wt];
    const nhat = wt === 'sword' ? [0, 1, 2] : wt === 'spear' ? [0, 1, 2] : [0];
    for (const c of nhat) {
      P.comboI = c; P.atkDur = 0.3; P.atkT = 0.15;
      if (P.mv) { P.mv.cur = { kind: wt === 'hammer' ? 'nen' : wt === 'spear' ? 'dam' : 'chem', pose: c, step: c }; }
      const o = G.heroArgs(P);
      const all = [], giu = [], huong = []; let boKhop = 0, boSau = 0;
      for (let i = 0; i <= 40; i++) {
        o.atk = i / 40;
        const q = TL.tip(o);
        if (!q || q.anim !== 'atk' || q.u < win[0] || q.u > win[1]) continue;
        const a = (Math.atan2(q.dy, q.dx) * 180) / Math.PI;
        all.push(+a.toFixed(0));
        const khop = G.KIEM_KHOP && q.wt === 'sword' && q.dx < -0.25 * Math.hypot(q.dx, q.dy);
        if (!khop) huong.push(+a.toFixed(0));
        if (khop) { boKhop++; continue; }
        if (G.KIEM_MUOT && q.wt === 'sword' && q.front === false) { boSau++; continue; }
        giu.push(+a.toFixed(0));
      }
      // độ dài cung (độ) theo góc liền
      const span = (arr) => { if (arr.length < 2) return 0; let s = 0; for (let i = 1; i < arr.length; i++) { let d = arr[i] - arr[i - 1]; while (d > 180) d -= 360; while (d < -180) d += 360; s += Math.abs(d); } return Math.round(s); };
      const moi = huong.length >= 3 ? huong : all; // G.VET_TRON: chỉ né mặt theo hướng lưỡi, quá ít mẫu thì cả đường vung
      out.push({ nhat: c, mau: all.length, boKhop, boSau, con: giu.length, cungThat: span(all), cungVet: span(giu), conMoi: moi.length, cungMoi: span(moi), gocThat: all, gocVet: giu });
    }
    return out;
  };
})();
