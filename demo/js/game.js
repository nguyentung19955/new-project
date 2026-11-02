// DEMO "Thủ thành ghép tướng" — luật chơi (không đụng DOM: chạy được cả trong node để giả lập cân bằng)
'use strict';
(function (root) {
  const C = CAU_HINH, T = TUONG, Q = QUAI, B = BOSS;
  const OX = C.W / 2 - (C.COT * C.O + (C.COT - 1) * C.KHE) / 2;   // góc trái trên sân
  const OY = 66;
  const LE = 22;                                                  // đường quái cách mép sân
  const SW = C.COT * C.O + (C.COT - 1) * C.KHE, SH = C.HANG * C.O + (C.HANG - 1) * C.KHE;
  // đường đi: vào từ hang bên trái (dưới) → vòng lên quanh sân → xuống phải → Thành bên phải
  const L = OX - LE, R = OX + SW + LE, TOP = OY - LE, BOT = OY + SH + LE;
  const DUONG = [[30, BOT], [L, BOT], [L, TOP], [R, TOP], [R, BOT], [C.W - 50, BOT]];
  const DOAN = [];
  let DAI = 0;
  for (let i = 1; i < DUONG.length; i++) {
    const [x0, y0] = DUONG[i - 1], [x1, y1] = DUONG[i];
    const d = Math.hypot(x1 - x0, y1 - y0);
    DOAN.push({ x0, y0, x1, y1, d, tu: DAI });
    DAI += d;
  }
  const viTri = (s) => {
    for (const g of DOAN) if (s <= g.tu + g.d) { const k = Math.max(0, (s - g.tu) / g.d); return [g.x0 + (g.x1 - g.x0) * k, g.y0 + (g.y1 - g.y0) * k]; }
    const g = DOAN[DOAN.length - 1]; return [g.x1, g.y1];
  };
  const oXY = (i) => { const c = i % C.COT, r = (i / C.COT) | 0; return [OX + c * (C.O + C.KHE), OY + r * (C.O + C.KHE)]; };
  const oTam = (i) => { const [x, y] = oXY(i); return [x + C.O / 2, y + C.O / 2]; };
  const ke = (i) => { const c = i % C.COT, r = (i / C.COT) | 0, k = []; if (c > 0) k.push(i - 1); if (c < C.COT - 1) k.push(i + 1); if (r > 0) k.push(i - C.COT); if (r < C.HANG - 1) k.push(i + C.COT); return k; };

  let rnd = Math.random;
  const pick = (a) => a[Math.floor(rnd() * a.length)];

  function moi(deck) {
    const bac = {}; deck.forEach((id) => (bac[id] = 0));
    return {
      deck: deck.slice(), bac, o: new Array(C.COT * C.HANG).fill(null),
      quai: [], dan: [], fx: [], so: [], lk: C.LK_DAU, mang: C.MANG, dot: 0, triệu: 0,
      conSinh: 0, sinhT: 0, choT: 1.5, sauSinh: 0, giet: 0, t: 0, het: false, boss: null, bao: null, nid: 1, tienT: 0,
    };
  }
  const giaTrieu = (S) => C.giaTrieu(S.triệu);
  const giaBac = (S, id) => (S.bac[id] >= C.BAC_MAX ? Infinity : C.giaBac(S.bac[id]));
  const trong = (S) => S.o.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);

  function trieuHoi(S) {
    const tr = trong(S), g = giaTrieu(S);
    if (!tr.length || S.lk < g || S.het) return -1;
    S.lk -= g; S.triệu++;
    const i = pick(tr);
    S.o[i] = { id: pick(S.deck), sao: 1, cd: rnd() * 0.5, da: 0, danh: 0, moi: 0.35, uid: S.nid++ };
    S.fx.push({ k: 'trieu', i, t: 0, T: 0.45 });
    return i;
  }
  const gopDuoc = (S, a, b) => { const A = S.o[a], Bb = S.o[b]; return a !== b && A && Bb && A.id === Bb.id && A.sao === Bb.sao && A.sao < C.SAO_MAX && !A.da && !Bb.da; };
  // kéo a thả lên b: cùng loại cùng sao → b thành sao+1, loại ngẫu nhiên trong bộ; ô trống → chuyển chỗ
  function tha(S, a, b) {
    if (S.het || a === b || !S.o[a] || S.o[a].da) return false;
    if (!S.o[b]) { S.o[b] = S.o[a]; S.o[a] = null; return 'chuyen'; }
    if (!gopDuoc(S, a, b)) return false;
    const sao = S.o[b].sao + 1;
    S.o[a] = null;
    S.o[b] = { id: pick(S.deck), sao, cd: 0.3, da: 0, danh: 0, moi: 0.5, uid: S.nid++ };
    S.fx.push({ k: 'gop', i: b, t: 0, T: 0.6, sao });
    return 'gop';
  }
  function lenBac(S, id) {
    const g = giaBac(S, id);
    if (S.het || S.lk < g) return false;
    S.lk -= g; S.bac[id]++;
    S.o.forEach((v, i) => { if (v && v.id === id) S.fx.push({ k: 'bac', i, t: 0, T: 0.5 }); });
    return true;
  }
  const satThuong = (S, v) => T[v.id].dmg * C.heSoSao(v.sao) * C.heSoBac(S.bac[v.id]);

  function batDauDot(S) {
    S.dot++;
    const w = S.dot, laBoss = w % 10 === 0;
    S.conSinh = laBoss ? 5 : 8 + Math.floor(w * 0.7);
    S.sinhT = laBoss ? 2.2 : 0.6;
    S.khoangSinh = Math.max(0.42, 1.0 - w * 0.015);
    S.laBoss = laBoss;
    if (laBoss) {
      const b = B[(w / 10 - 1) % B.length], vong = Math.floor((w / 10 - 1) / B.length);
      const hp = C.mauDot(w) * 42;
      const q = themQuai(S, 'boss', hp, 26, b.anh, 60);
      q.boss = b; q.knT = 3; q.vong = vong; q.thuong = 60 + 6 * w;
      S.boss = q;
      S.bao = { chu: `Đợt ${w} · Boss ${b.ten}`, phu: `${b.knTen}: ${b.mo}`, t: 0, T: 3.2 };
    } else S.bao = { chu: `Đợt ${w}`, phu: '', t: 0, T: 1.4 };
  }
  function themQuai(S, kind, hp, spd, anh, co) {
    const q = { uid: S.nid++, kind, hp, max: hp, spd, d: 0, x: 30, y: 0, cham: 0, chamT: 0, choang: 0, chay: 0, chayT: 0, anh, co, thuong: 0, khung: rnd() * 4 };
    [q.x, q.y] = viTri(0);
    S.quai.push(q);
    return q;
  }
  function sinh(S) {
    const w = S.dot;
    let k = 'thuong';
    const r = rnd();
    if (w >= 3 && r < 0.28) k = 'nhanh';
    else if (w >= 5 && r > 0.82) k = 'trau';
    const d = Q[k];
    const q = themQuai(S, k, C.mauDot(w) * d.hp, d.spd * (1 + Math.min(0.35, w * 0.006)), d.anh, d.co);
    q.thuong = d.thuong + Math.floor(w / 6);
  }

  // ---- đánh ----
  const sống = (q) => q.hp > 0 && !q.ra;
  const dauTien = (S) => { let b = null; for (const q of S.quai) if (sống(q) && (!b || q.d > b.d)) b = q; return b; };
  function trung(S, q, dmg, v, mau, chiSo) {
    if (!sống(q)) return;
    q.hp -= dmg;
    S.so.push({ x: q.x + (rnd() - 0.5) * 10, y: q.y - q.co * 0.8, v: Math.round(dmg), t: 0, mau, to: chiSo });
    if (q.hp <= 0) chet(S, q, v);
  }
  function chet(S, q, v) {
    q.hp = 0;
    let lk = q.thuong;
    if (v && v.id === 'cdt') lk += v.sao;
    S.lk += lk; S.giet++;
    S.so.push({ x: q.x, y: q.y - q.co, v: '+' + lk + '✦', t: 0, mau: '#ffe27a', lk: 1 });
    S.fx.push({ k: 'no', x: q.x, y: q.y - q.co / 2, t: 0, T: 0.4, r: q.co * 0.6 });
    if (q === S.boss) S.boss = null;
  }
  function ban(S, i, v) {
    const td = T[v.id], h = HANH[td.hanh];
    const dmg = satThuong(S, v);
    const [x, y] = oTam(i);
    let mt = [];
    if (v.id === 'thachsanh') { let b = null; for (const q of S.quai) if (sống(q) && (!b || q.hp > b.hp)) b = q; if (b) mt = [b]; }
    else if (v.id === 'mychau') {
      const n = 1 + Math.floor(v.sao / 2);
      mt = S.quai.filter(sống).sort((a, b) => b.d - a.d).slice(0, n);
    } else { const q = dauTien(S); if (q) mt = [q]; }
    if (!mt.length) return false;
    for (const q of mt) {
      if (v.id === 'llq') {   // sấm lan: đánh ngay, nảy sang quái gần
        let cur = q, dd = dmg; const da = new Set(), pts = [[x, y - 8]];
        for (let n = 0; n <= 1 + Math.ceil(v.sao / 2) && cur; n++) {
          da.add(cur); pts.push([cur.x, cur.y - cur.co / 2]);
          trung(S, cur, dd, v, h.mau);
          dd *= 0.75;
          let nx = null, nd = 120;
          for (const o of S.quai) if (sống(o) && !da.has(o)) { const k = Math.hypot(o.x - cur.x, o.y - cur.y); if (k < nd) { nd = k; nx = o; } }
          cur = nx;
        }
        S.fx.push({ k: 'set', pts, t: 0, T: 0.22, mau: h.mau });
      } else S.dan.push({ x, y: y - 10, q, dmg, v, mau: h.mau, id: v.id, spd: 620 });
    }
    return true;
  }
  function trungDan(S, d) {
    const q = d.q, v = d.v;
    if (!sống(q)) return;
    let dmg = d.dmg;
    if (v.id === 'thachsanh' && q.boss) dmg *= 2.5;
    trung(S, q, dmg, v, d.mau, v.id === 'thachsanh');
    if (v.id === 'giong') { const dps = d.dmg * 0.55; if (dps >= q.chay || q.chayT < 1) { q.chay = Math.max(dps, q.chay); } q.chayT = 3; q.chayV = v; }
    if (v.id === 'sontinh' && rnd() < 0.12 + 0.04 * v.sao) q.choang = Math.max(q.choang, (0.6 + 0.06 * v.sao) * (q.boss ? 0.4 : 1));
    if (v.id === 'thuytinh') {
      const f = Math.min(0.6, 0.3 + 0.03 * v.sao);
      for (const o of S.quai) if (sống(o) && Math.hypot(o.x - q.x, o.y - q.y) < 46) {
        if (o !== q) trung(S, o, d.dmg * 0.6, v, d.mau);
        o.cham = Math.max(o.cham, o.boss ? f * 0.5 : f); o.chamT = 2;
      }
      S.fx.push({ k: 'song', x: q.x, y: q.y - q.co / 3, t: 0, T: 0.35 });
    }
  }

  function buoc(S, dt) {
    if (S.het) return;
    S.t += dt;
    // đợt
    if (S.conSinh > 0) {
      S.sinhT -= dt;
      if (S.sinhT <= 0) { sinh(S); S.conSinh--; S.sinhT = S.khoangSinh; S.sauSinh = 0; }
    } else {
      S.sauSinh += dt;
      const con = S.quai.some(sống);
      if (S.dot === 0 || (!S.boss && (!con || (S.sauSinh > 14 && !S.laBoss)))) {
        S.choT -= dt;
        if (S.choT <= 0) {
          if (S.dot > 0) { const th = 15 + 5 * S.dot; S.lk += th; S.so.push({ x: C.W / 2, y: OY + SH / 2, v: `Qua đợt +${th}✦`, t: 0, mau: '#ffe27a', lk: 1, to: 1 }); }
          batDauDot(S); S.choT = 1.2;
        }
      }
    }
    if (S.bao) { S.bao.t += dt; if (S.bao.t > S.bao.T) S.bao = null; }
    // Chử Đồng Tử sinh Linh khí
    S.tienT += dt;
    if (S.tienT >= 8) {
      S.tienT = 0;
      S.o.forEach((v, i) => {
        if (!v || v.id !== 'cdt' || v.da) return;
        const n = Math.round(2 * v.sao * C.heSoBac(S.bac.cdt));
        S.lk += n; const [x, y] = oTam(i);
        S.so.push({ x, y: y - 20, v: '+' + n + '✦', t: 0, mau: '#ffe27a', lk: 1 });
      });
    }
    // tướng
    S.o.forEach((v, i) => {
      if (!v) return;
      if (v.moi > 0) v.moi -= dt;
      if (v.danh > 0) v.danh -= dt;
      if (v.da > 0) { v.da = Math.max(0, v.da - dt); return; }
      let tang = 0;
      for (const k of ke(i)) { const n = S.o[k]; if (n && n.id === 'auco' && !n.da) tang = Math.max(tang, 0.12 + 0.06 * n.sao + 0.04 * S.bac.auco); }
      v.cd -= dt * (1 + tang);
      if (v.cd <= 0) { if (ban(S, i, v)) { v.cd = T[v.id].cd; v.danh = 0.3; } else v.cd = 0.05; }
    });
    // đạn
    for (const d of S.dan) {
      const q = d.q;
      if (!sống(q)) { d.xong = true; continue; }
      const tx = q.x, ty = q.y - q.co / 2, dx = tx - d.x, dy = ty - d.y, k = Math.hypot(dx, dy), b = d.spd * dt;
      if (k <= b + 6) { d.xong = true; trungDan(S, d); }
      else { d.x += dx / k * b; d.y += dy / k * b; d.goc = Math.atan2(dy, dx); }
    }
    S.dan = S.dan.filter((d) => !d.xong);
    // quái
    for (const q of S.quai) {
      if (!sống(q)) continue;
      q.khung += dt * 7;
      if (q.chayT > 0) { q.chayT -= dt; q.chayDem = (q.chayDem || 0) + q.chay * dt; if (q.chayDem >= 1 || q.hp <= q.chayDem) { const n = q.chayDem; q.chayDem = 0; q.hp -= n; if (q.hp <= 0) chet(S, q, q.chayV); } if (q.chayT <= 0) q.chay = 0; }
      if (!sống(q)) continue;
      if (q.chamT > 0) { q.chamT -= dt; if (q.chamT <= 0) q.cham = 0; }
      if (q.choang > 0) { q.choang -= dt; continue; }
      q.d += q.spd * (1 - q.cham) * dt;
      [q.x, q.y] = viTri(q.d);
      if (q.boss) kyNangBoss(S, q, dt);
      if (q.d >= DAI) {
        q.ra = true;
        const mat = q.boss ? 2 : 1;
        S.mang -= mat;
        S.fx.push({ k: 'thanh', t: 0, T: 0.6 });
        S.so.push({ x: C.W - 40, y: BOT - 50, v: `-${mat}♥`, t: 0, mau: '#ff5a5a', to: 1 });
        if (q === S.boss) S.boss = null;
        if (S.mang <= 0) { S.mang = 0; S.het = true; }
      }
    }
    S.quai = S.quai.filter((q) => sống(q));
    for (const f of S.fx) f.t += dt;
    S.fx = S.fx.filter((f) => f.t < f.T);
    for (const s of S.so) s.t += dt;
    S.so = S.so.filter((s) => s.t < 0.9);
  }
  function kyNangBoss(S, q, dt) {
    q.knT -= dt;
    if (q.knT > 0) return;
    q.knT = q.boss.cd;
    const co = S.o.map((v, i) => (v && !v.da ? i : -1)).filter((i) => i >= 0);
    if (q.boss.kn === 'hoada') {
      const n = Math.min(co.length, 2 + q.vong);
      for (let k = 0; k < n; k++) { const j = co.splice(Math.floor(rnd() * co.length), 1)[0]; S.o[j].da = 4; S.fx.push({ k: 'hoada', i: j, t: 0, T: 0.6 }); }
      S.fx.push({ k: 'tia', x: q.x, y: q.y - q.co / 2, dich: [], t: 0, T: 0.5, mau: '#b9b9b9' });
    } else if (q.boss.kn === 'doicho') {
      for (let k = 0; k < 3 + q.vong; k++) {
        const a = Math.floor(rnd() * S.o.length), b = Math.floor(rnd() * S.o.length);
        if (a === b) continue;
        [S.o[a], S.o[b]] = [S.o[b], S.o[a]];
        S.fx.push({ k: 'xoay', i: a, t: 0, T: 0.5 }, { k: 'xoay', i: b, t: 0, T: 0.5 });
      }
    } else if (q.boss.kn === 'hoimau') {
      const n = q.max * 0.07;
      q.hp = Math.min(q.max, q.hp + n);
      S.so.push({ x: q.x, y: q.y - q.co - 6, v: '+' + Math.round(n), t: 0, mau: '#7dff8a', to: 1 });
      for (const o of S.quai) if (o !== q && sống(o) && Math.hypot(o.x - q.x, o.y - q.y) < 160) o.hp = Math.min(o.max, o.hp + o.max * 0.25);
      S.fx.push({ k: 'hoi', x: q.x, y: q.y - q.co / 2, t: 0, T: 0.7 });
    }
  }

  const API = { moi, buoc, trieuHoi, tha, lenBac, gopDuoc, giaTrieu, giaBac, satThuong, oXY, oTam, ke, viTri, trong,
    DUONG, DAI, OX, OY, SW, SH, BOT, TOP, L, R, setRnd: (f) => (rnd = f) };
  root.GAME = API;
  if (typeof module !== 'undefined') module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
