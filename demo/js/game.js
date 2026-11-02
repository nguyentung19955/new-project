// DEMO "Thủ thành ghép tướng" — luật chơi (không đụng DOM: chạy được cả trong node để giả lập cân bằng)
'use strict';
(function (root) {
  const C = CAU_HINH, T = TUONG, Q = QUAI, B = BOSS;
  const K = C.TL;   // thu nhỏ không gian (bước ô 48/70): tầm bắn + bán kính vùng hiệu ứng
  // hình học 1 bàn (người chơi dưới / AI trên): lưới 5×3 + làn quái dọc riêng bên trái (đầu trên → cuối dưới)
  function taoBan(ai, duong) {
    const by = ai ? C.BAN_AI_Y : C.BAN_NG_Y, OX = C.BAN_X + C.VIEN, OY = by + C.VIEN;
    const DUONG = duong || (ai ? C.LAN_AI : C.LAN_NG), DOAN = [];
    let DAI = 0;
    for (let i = 1; i < DUONG.length; i++) {
      const [x0, y0] = DUONG[i - 1], [x1, y1] = DUONG[i];
      const d = Math.hypot(x1 - x0, y1 - y0);
      DOAN.push({ x0, y0, x1, y1, d, tu: DAI });
      DAI += d;
    }
    return { ai, BX: C.BAN_X, BY: by, OX, OY, SW: C.COT * C.BUOC_X, SH: C.HANG * C.BUOC_Y, DUONG, DOAN, DAI, P: DAI / C.DAI_CU,
      RA: DUONG[DUONG.length - 1] };
  }
  const BAN_NG = taoBan(false), BAN_AI = taoBan(true);
  // CO-OP: đường chung — làn trên (bàn đồng đội) nối thẳng xuống làn dưới (bàn người chơi): làn dưới bắt đầu từ cuối làn trên (qua đường nối)
  const BAN_AI_CO = taoBan(true, C.LAN_AI), BAN_NG_CO = taoBan(false, [C.LAN_AI[C.LAN_AI.length - 1], C.LAN_NG[C.LAN_NG.length - 1]]);
  { const P = (BAN_AI_CO.DAI + BAN_NG_CO.DAI) / (COOP.THOI_GIAN_DUONG * C.DAI_CU); BAN_AI_CO.P = P; BAN_NG_CO.P = P; }   // cùng tốc độ px/giây trên cả đường
  const viTri = (S, s) => {
    for (const g of S.B.DOAN) if (s <= g.tu + g.d) { const k = Math.max(0, (s - g.tu) / g.d); return [g.x0 + (g.x1 - g.x0) * k, g.y0 + (g.y1 - g.y0) * k]; }
    const g = S.B.DOAN[S.B.DOAN.length - 1]; return [g.x1, g.y1];
  };
  const datViTri = (S, q) => { [q.x, q.y] = viTri(S, q.d); q.x += q.lech || 0; };
  // ô i: góc trái trên của ô 46×45 (khe 2) — tâm ô cách nhau 48 ngang, 47.7 dọc
  const oXY = (S, i) => { const c = i % C.COT, r = (i / C.COT) | 0; return [S.B.OX + c * C.BUOC_X + C.KHE / 2, S.B.OY + r * C.BUOC_Y + (C.BUOC_Y - C.OH) / 2]; };
  const oTam = (S, i) => { const [x, y] = oXY(S, i); return [x + C.O / 2, y + C.OH / 2]; };
  const ke = (i) => { const c = i % C.COT, r = (i / C.COT) | 0, k = []; if (c > 0) k.push(i - 1); if (c < C.COT - 1) k.push(i + 1); if (r > 0) k.push(i - C.COT); if (r < C.HANG - 1) k.push(i + C.COT); return k; };

  let rnd = Math.random;
  const pick = (a) => a[Math.floor(rnd() * a.length)];

  // ai: true = bàn AI MIRROR (trên); theo = state người chơi để nhận cùng đợt
  function moi(deck, ai, theo) {
    const bac = {}; deck.forEach((id) => (bac[id] = 0));
    return {
      B: ai ? BAN_AI : BAN_NG, ai: !!ai, theo: theo || null,
      deck: deck.slice(), bac, o: new Array(C.COT * C.HANG).fill(null),
      quai: [], dan: [], fx: [], so: [], vung: [], treo: [], hen: [], bountyDot: 0, lk: C.LK_DAU, mang: C.MANG, dot: 0, triệu: 0,
      conSinh: 0, sinhT: 0, choT: 1.5, sauSinh: 0, giet: 0, t: 0, het: false, boss: null, bao: null, nid: 1, tienT: 0,
      tk: {},   // thống kê sát thương theo loại tướng của bàn này (màn kết quả)
    };
  }
  // CO-OP: S = bàn người chơi (dưới), A = bàn đồng đội AI (trên); dùng chung 1 đối tượng coop (mạng, wave, thắng)
  function moiCoop(deck, boAI) {
    const co = { mang: COOP.MANG, max: COOP.MANG, dot: 0, thang: false, choT: COOP.CHO_DAU };
    const S = moi(deck, false), A = moi(boAI, true);
    S.B = BAN_NG_CO; A.B = BAN_AI_CO;
    S.coop = A.coop = co; S.ban = A; A.ban = S; S.mang = A.mang = co.mang;
    A.nid = 100000;   // uid quái 2 bàn không trùng (quái chuyển từ bàn trên xuống bàn dưới)
    return { S, A };
  }
  const giaTrieu = (S) => C.giaTrieu(S.triệu);
  const giaBac = (S, id) => (S.bac[id] >= C.BAC_MAX ? Infinity : C.giaBac(S.bac[id]));
  const trong = (S) => S.o.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);

  function trieuHoi(S) {
    const tr = trong(S), g = giaTrieu(S);
    if (!tr.length || S.lk < g || S.het) return -1;
    S.lk -= g; S.triệu++;
    const i = pick(tr);
    S.o[i] = { id: pick(S.deck), sao: 1, cd: rnd() * 0.5, da: 0, danh: 0, moi: 0.35, uid: S.nid++, sinhT: S.t, tk: S.tk, hs: heAI(S) };
    S.fx.push({ k: 'trieu', i, t: 0, T: 0.18 });   // phản hồi summon 120–180ms
    return i;
  }
  const gopDuoc = (S, a, b) => { const A = S.o[a], Bb = S.o[b]; return a !== b && A && Bb && A.id === Bb.id && A.sao === Bb.sao && A.sao < C.SAO_MAX && !A.da && !Bb.da; };
  // kéo a thả lên b: cùng loại cùng sao → b thành sao+1, loại ngẫu nhiên trong bộ; ô trống → chuyển chỗ
  function tha(S, a, b) {
    if (S.het || a === b || !S.o[a] || S.o[a].da) return false;
    if (!S.o[b]) { S.o[b] = S.o[a]; S.o[a] = null; return 'chuyen'; }
    if (!gopDuoc(S, a, b)) return false;
    const sao = S.o[b].sao + 1, cu = [S.o[a], S.o[b]];
    S.o[a] = null;
    S.o[b] = { id: pick(S.deck), sao, cd: 0.3, da: 0, danh: 0, moi: 0.5, uid: S.nid++, sinhT: S.t, kieuSinh: 'gop', tk: S.tk, hs: heAI(S) };
    // tu/cu: để render vẽ 2 tướng cũ thu vào tâm ô b rồi tướng mới bật ra (merge 180–260ms)
    S.fx.push({ k: 'gop', i: b, tu: a, cu: cu.map((v) => ({ id: v.id, sao: v.sao, hg: v.hg, goc: v.goc, uid: v.uid })), t: 0, T: 0.6, sao });
    return 'gop';
  }
  function lenBac(S, id) {
    const g = giaBac(S, id);
    if (S.het || S.lk < g) return false;
    S.lk -= g; S.bac[id]++;
    S.o.forEach((v, i) => { if (v && v.id === id) S.fx.push({ k: 'bac', i, t: 0, T: 0.5 }); });
    return true;
  }
  const heAI = (S) => (S.coop && S.ai ? COOP.AI_SAT_THUONG : 1);   // co-op: tướng đồng đội AI mang hệ số giảm sát thương (v.hs)
  const satThuong = (S, v) => T[v.id].dmg * C.heSoSao(v.sao) * C.heSoBac(S.bac[v.id]) * (v.hs || 1);

  function batDauDot(S) {
    S.dot++;
    const w = S.dot, laBoss = w % 10 === 0;
    S.conSinh = (S.theo ? S.conSinh : 0) + (laBoss ? 5 : 8 + Math.floor(w * 0.7));
    S.sinhT = laBoss ? 2.2 : 0.6;
    S.khoangSinh = Math.max(0.42, 1.0 - w * 0.015);
    S.laBoss = laBoss; S.bountyDot = 0;
    if (laBoss) {
      const b = B[(w / 10 - 1) % B.length], vong = Math.floor((w / 10 - 1) / B.length);
      const hp = b.hp * Math.pow(1.8, vong);                    // máu boss theo đề xuất ChatGPT, x1.8 mỗi vòng lặp
      const q = themQuai(S, 'boss', hp, 26 * (1 + Math.min(0.24, 0.08 * vong)), null, 58);
      q.lech = 0; datViTri(S, q);
      q.boss = b; q.vong = vong; q.thuong = 60 + 6 * w; q.songT = 0; q.knCD = b.kn.map(() => 0); q.tele = null; q.linkCap = 0;
      S.boss = q;
      S.bao = { chu: `WAVE ${w} · ${b.ten}`, phu: `${b.knTen} — ${b.mo}`, t: 0, T: 3.2, boss: 1 };
      S.rung = 0.6;
    } else S.bao = { chu: `WAVE ${w}`, phu: '', t: 0, T: 1.4 };
  }
  // ---- CO-OP: wave do bàn đồng đội (trên, nơi quái sinh) điều phối; bàn người chơi chỉ hiện cùng số wave ----
  function batDauDotCoop(A) {
    const co = A.coop, S = A.ban;
    co.dot++; A.dot = S.dot = co.dot;
    const w = co.dot, laBoss = w % 10 === 0, cuoi = w >= COOP.DOT_MAX;
    A.conSinh = laBoss ? COOP.soQuaiBoss(w) : COOP.soQuai(w);
    A.sinhT = laBoss ? 2.2 : 0.6; A.khoangSinh = COOP.khoangSinh(w); A.laBoss = laBoss; A.sauSinh = 0;
    A.bountyDot = 0; S.bountyDot = 0;
    let bao;
    if (laBoss) {
      const n = w / 10 - 1, idx = cuoi ? B.length - 1 : n % B.length, vong = Math.floor(n / B.length), b = B[idx];
      const q = themQuai(A, 'boss', COOP.mauBoss(w, idx, vong, cuoi), 26 * (1 + Math.min(0.24, 0.08 * vong)), null, cuoi ? 66 : 58);
      q.lech = 0; datViTri(A, q);
      q.boss = b; q.vong = vong; q.cuoi = cuoi; q.thuong = 60 + 6 * w; q.songT = 0; q.knCD = b.kn.map(() => 0); q.tele = null; q.linkCap = 0;
      A.boss = q;
      bao = { chu: cuoi ? `WAVE ${w} · FINAL BOSS` : `WAVE ${w} · ${b.ten}`, phu: `${cuoi ? b.ten + ' — ' : ''}${b.knTen} — ${b.mo}`, t: 0, T: 3.2, boss: 1 };
      A.rung = S.rung = 0.6;
    } else bao = { chu: `WAVE ${w}/${COOP.DOT_MAX}`, phu: '', t: 0, T: 1.4 };
    A.bao = bao; S.bao = Object.assign({}, bao);
  }
  function sinhCoop(S) {
    const w = S.dot, tl = COOP.tiLe(w), r = rnd();
    const k = r < tl.nhanh ? 'nhanh' : r < tl.nhanh + tl.trau ? 'trau' : 'thuong', d = Q[k];
    const q = themQuai(S, k, COOP.mauQuai(w) * d.hp, d.spd * COOP.tocQuai(w), null, d.co);
    q.thuong = d.thuong + Math.floor(w / 6);
  }
  function dieuPhoiCoop(A, dt) {   // chạy trên bàn đồng đội (A): sinh quái, chuyển wave, nghỉ, thắng
    const co = A.coop, S = A.ban;
    if (A.conSinh > 0) {
      A.sinhT -= dt;
      if (A.sinhT <= 0) { sinhCoop(A); A.conSinh--; A.sinhT = A.khoangSinh; A.sauSinh = 0; }
      return;
    }
    A.sauSinh += dt;
    const con = A.quai.some(sống) || S.quai.some(sống), boss = A.boss || S.boss;
    if (co.dot >= COOP.DOT_MAX) { if (!con && !boss) { co.thang = true; A.het = S.het = true; } return; }   // dọn sạch wave 70 → thắng
    if (co.dot === 0 || (!boss && (!con || (A.sauSinh > COOP.CHO_TOI_DA && !A.laBoss)))) {
      co.choT -= dt;
      if (co.choT <= 0) {
        if (co.dot > 0) {
          const th = COOP.thuongDot(co.dot);
          for (const X of [A, S]) { X.lk += th; X.so.push({ x: X.B.OX + X.B.SW / 2, y: X.B.OY + X.B.SH / 2, v: `WAVE CLEAR +${th}`, t: 0, mau: '#ffe27a', lk: 1, to: 1 }); }
        }
        batDauDotCoop(A); co.choT = COOP.NGHI;
      }
    }
  }
  // quái đi hết làn trên (bàn đồng đội) → sang đầu làn dưới (bàn người chơi), giữ máu + hiệu ứng trên người
  function chuyenXuong(A, q) {
    const S = A.ban;
    if (q === A.boss) { xongBoss(A); S.boss = q; q.tele = null; }
    q.ra = false; q.d = 0; q.daRa = true; q.linkT = 0; q.ban = S;
    datViTri(S, q);
    S.quai.push(q);
  }
  // spd theo đơn vị cũ (px/giây trên đường ngang dài DAI_CU) → nhân P để thời gian đi hết làn như cũ; co (cỡ hình) nhân K
  function themQuai(S, kind, hp, spd, anh, co) {
    const q = { uid: S.nid++, kind, hp, max: hp, spd: spd * S.B.P, d: 0, x: 30, y: 0, cham: 0, choang: 0, anh, co: co * K, thuong: 0, khung: rnd() * 4,
      lech: (rnd() - 0.5) * 22, sinhT: S.t,
      chill: 0, chillT: 0, voLock: 0, nhietCD: 0, arcCD: 0, focusCD: 0, breachT: 0, breachK: false, breachEmp: 0, giatCD: 0,
      tox: 0, toxT: 0, toxDem: 0, toxLan: 0, toxNhan: 0, bounty: 0, bountyGT: 3, khien: 0, daKhien: 0, nhanhT: 0, nhanhK: 0, linkT: 0,
      luaT: 0, slowBang: 0, slowHut: 0, echo: false, ban: S };
    datViTri(S, q);
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
    const q = themQuai(S, k, C.mauDot(w) * d.hp, d.spd * (1 + Math.min(0.35, w * 0.006)), null, d.co);
    q.thuong = d.thuong + Math.floor(w / 6);
  }

  // ---- đánh (kỹ năng theo docs/demo-hop-tuong/tu-van-chatgpt-ky-nang.txt) ----
  const sống = (q) => q.hp > 0 && !q.ra;
  const nham = (q) => sống(q) && q.daRa;   // vừa ra khỏi cổng (đang hiện hình) thì chưa bắn được   // vừa ra khỏi cổng (đang hiện hình) thì chưa bắn được
  const dauTien = (S) => { let b = null; for (const q of S.quai) if (nham(q) && (!b || q.d > b.d)) b = q; return b; };
  const kc = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const heSo = (S, v) => C.heSoSao(v.sao) * C.heSoBac(S.bac[v.id] || 0) * (v.hs || 1);
  const ganNhau = (S, q, r) => { let n = 0; for (const o of S.quai) if (o !== q && nham(o) && kc(o, q) < r) n++; return n; };
  const trongHut = (S, q) => S.vung.some((z) => z.k === 'hut' && kc(z, q) < z.r);
  function trung(S, q, dmg, v, mau, chiSo, an, treo) {
    if (!sống(q) || !(dmg > 0)) return;
    let k = 1;
    if (q.breachT > 0) k += q.boss ? (q.breachK ? 0.10 : 0.08) : (q.breachK ? 0.20 : 0.15);
    if (v && v.id === 'venom' && v.sao >= 7 && q.tox >= 4) k += 0.15;
    dmg *= k;
    if (v && v.corrT > 0 && !treo) { const p = dmg * 0.25; dmg -= p; S.treo.push({ q, dmg: p, t: 2, v, mau: '#c04dff' }); }
    if (q.khien > 0) { const a = Math.min(q.khien, dmg); q.khien -= a; dmg -= a; }
    if (v && v.tk) v.tk[v.id] = (v.tk[v.id] || 0) + Math.min(dmg, q.hp);   // thống kê sát thương thật (không tính phần tràn)
    q.hp -= dmg;
    if (q.linkT > 0 && S.boss && S.boss.linkCap > 0) { const b = S.boss, h = Math.min(dmg * 0.3, b.linkCap); b.linkCap -= h; b.hp = Math.min(b.max, b.hp + h); }
    if (!an) {   // số sát thương nổi: tối đa 3 số / mục tiêu (bỏ số cũ nhất), đòn chí mạng màu hổ phách
      let n = 0, cu = -1;
      for (let j = 0; j < S.so.length; j++) if (S.so[j].q === q.uid) { if (cu < 0) cu = j; n++; }
      if (n >= 3) S.so.splice(cu, 1);
      S.so.push({ q: q.uid, x: q.x + 8 + (rnd() - 0.5) * 8, y: q.y - q.co * 0.8, v: Math.round(dmg), t: 0, mau, to: chiSo, T: 0.55 });   // sống 0.55s, bay lên 12px
    }
    if (!an) {   // chỉ khi trúng thật: quái chớp trắng 60ms + tia trúng đòn 120ms (tối đa FX_NHO_MAX cùng lúc)
      q.flash = 0.06;
      let n = 0; for (const f of S.fx) if (f.k === 'hit') n++;
      if (n < C.FX_NHO_MAX) S.fx.push({ k: 'hit', x: q.x + (rnd() - 0.5) * 6, y: q.y - q.co / 2 + (rnd() - 0.5) * 6, t: 0, T: 0.12, mau: mau || '#ffffff', to: !!chiSo, id: v ? v.id : null });
    }
    if (q.hp <= 0) chet(S, q, v);
  }
  function chet(S, q, v) {
    q.hp = 0;
    let lk = q.echo ? 0 : q.thuong;
    if (q.bounty > 0 && S.bountyDot < 18) {   // BROKER Bounty Contract (+1 nếu đang Breach), trần 18/đợt
      const n = Math.min(q.bountyGT + (q.breachT > 0 ? 1 : 0), 18 - S.bountyDot);
      lk += n; S.bountyDot += n; S.fx.push({ k: 'tien', x: q.x, y: q.y - q.co / 2, t: 0, T: 0.5 });
    }
    if (lk > 0) { S.lk += lk; S.so.push({ x: q.x, y: q.y - q.co, v: '+' + lk, t: 0, mau: '#ffe27a', lk: 1 }); }
    S.giet++;
    S.fx.push({ k: 'no', x: q.x, y: q.y - q.co / 2, t: 0, T: 0.4, r: q.co * 0.6 });
    if (q.tox >= 4 && !q.toxLan && q.toxV) {   // VENOM Toxic Bloom: lan 2 stack sang quái gần
      const tv = q.toxV, n = tv.sao >= 5 ? 3 : 2;
      const ds = S.quai.filter((o) => o !== q && sống(o) && o.toxNhan <= 0 && kc(o, q) < 50 * K)
        .sort((a, b) => (trongHut(S, b) - trongHut(S, a)) || (kc(a, q) - kc(b, q))).slice(0, n);
      for (const o of ds) { o.tox = Math.min(4, o.tox + 2); o.toxT = tv.sao >= 3 ? 5 : 4; o.toxV = tv; o.toxLan = 1; o.toxNhan = 2; }
      if (ds.length) S.fx.push({ k: 'lan', x: q.x, y: q.y - q.co / 2, pts: ds.map((o) => [o.x, o.y - o.co / 2]), t: 0, T: 0.45 });
    }
    if (q === S.boss) xongBoss(S);
  }
  function xongBoss(S) {   // boss chết / lọt: huỷ mọi hiệu ứng tồn đọng của boss
    S.boss = null;
    for (const v of S.o) if (v) { v.nong = 0; v.corrT = 0; }
    for (const q of S.quai) { q.linkT = 0; q.nhanhT = 0; }
    S.vung = S.vung.filter((z) => z.k !== 'ember');
  }
  function bayDan(S, x, y, q, dmg, v, mau, spd, them) { S.dan.push(Object.assign({ x, y, q, dmg, v, mau, id: v.id, spd, x0: x, y0: y }, them || {})); }
  // điểm phát đạn (muzzle) theo ô: chân ở đáy-giữa ô, tip [x,y] cũ (khung 64, chân y≈57) quy đổi sang hình ~52px
  // v3 top-down: tướng cao 32px, chân cách đáy ô 8px → nòng ở giữa thân, lệch ngang nhẹ theo tip cũ
  const nong = (S, i, v) => { const [ox, oy] = oXY(S, i), tp = T[v.id].tip || [32, 32]; return [ox + C.O / 2 + (tp[0] - 32) * 0.3, oy + C.OH - 8 - 16 + (tp[1] - 38) * 0.15]; };
  // như Defense War: mọi tướng trên bàn bắn được mọi quái trên làn của CHÍNH bàn đó (S.quai chỉ chứa quái làn này) — không giới hạn tầm;
  // vẫn chọn mục tiêu theo kiểu từng tướng (bên dưới). Không có quái thì chờ.
  function chonMuc(S, i, v) {
    const DS = S.quai.filter(nham);
    let q = null;
    if (v.id === 'scorch' || v.id === 'frost') { for (const o of DS) if (!q || o.d > q.d) q = o; }
    else if (v.id === 'arc' || v.id === 'warp') { let bn = -1; for (const o of DS) { const n = ganNhau(S, o, 60 * K); if (n > bn || (n === bn && o.d > q.d)) { q = o; bn = n; } } }
    else if (v.id === 'lance') { for (const o of DS) if (!q || o.hp > q.hp) q = o; }
    else if (v.id === 'miner') { for (const o of DS) if (!q || o.hp < q.hp) q = o; }
    else if (v.id === 'venom') { for (const o of DS) if (!q || o.hp / o.max > q.hp / q.max) q = o; }
    else if (v.id === 'glitch') { for (const o of DS) if (!(o.breachT > 0) && (!q || o.d > q.d)) q = o; if (!q) for (const o of DS) if (!q || o.d > q.d) q = o; }
    return q;
  }
  // ---- HƯỚNG QUAY 8 hướng theo quái (kiểu Destiny Child: Defense War) ----
  // hg: 0=E 1=SE 2=S 3=SW 4=W 5=NW 6=N 7=NE (toạ độ màn hình, y xuống dưới); goc: góc liên tục (rad) cho WARP xoay bằng code
  const HG = { TRE: 0.12, HYS: 10, VE_S: 0.8, LERP: 10, NHIN: 0.05 };
  const gocTo = (S, i, q) => { const [ox, oy] = oXY(S, i); return Math.atan2(q.y - (oy + C.OH - 24), q.x - (ox + C.O / 2)); };   // từ giữa thân tướng tới quái
  function chonHuong(v, a, ep) {   // a: rad; ep = true: đổi ngay (đầu đòn), bỏ hysteresis + cooldown
    const deg = a * 180 / Math.PI, moi = ((Math.round(deg / 45) % 8) + 8) % 8;
    if (v.hg == null) { v.hg = moi; v.hgT = v.tg || 0; return; }
    if (moi === v.hg) return;
    if (!ep) {
      let lech = Math.abs(deg - v.hg * 45) % 360; if (lech > 180) lech = 360 - lech;
      if (lech <= 22.5 + HG.HYS) return;                 // hysteresis ~10° quanh biên sector
      if ((v.tg || 0) - (v.hgT || 0) < HG.TRE) return;   // cooldown đổi hướng ~120ms
    }
    v.hg = moi; v.hgT = v.tg || 0;
  }
  function capNhatHuong(S, i, v, dt) {
    v.tg = S.t;
    if (v.hg == null) { v.hg = 2; v.hgT = S.t; v.goc = Math.PI / 2; v.khongMuc = 0; }
    v.nhin = (v.nhin || 0) - dt;
    if (v.nhin <= 0) { v.nhin = HG.NHIN; v.mucNhin = chonMuc(S, i, v); }   // dò mục tiêu thưa (20 lần/giây)
    const q = v.mucNhin && sống(v.mucNhin) && v.mucNhin.ban === S ? v.mucNhin : null;
    const khoa = v.atkT != null && S.t - v.atkT < C.TAC_DONG + C.GIU_KHUNG + 0.1;   // khoá hướng trong pha ra đòn của attack
    let dich = null;
    if (q) { v.khongMuc = 0; dich = gocTo(S, i, q); }
    else { v.khongMuc = (v.khongMuc || 0) + dt; if (v.khongMuc > HG.VE_S) dich = Math.PI / 2; }   // không có mục tiêu > 0.8s → về S
    if (dich != null && !khoa) chonHuong(v, dich, false);
    if (dich != null) {   // WARP: góc mượt (lerp ~10/s), vẫn quay khi đang đánh
      let d = dich - v.goc; d = Math.atan2(Math.sin(d), Math.cos(d));
      v.goc += d * (1 - Math.exp(-HG.LERP * dt));
    }
  }
  function ban(S, i, v) {
    const td = T[v.id], h = HANH[td.hanh];
    const dmg = satThuong(S, v);
    const [x, y] = nong(S, i, v), [cx] = oTam(S, i);
    const q = chonMuc(S, i, v);
    if (!q) return false;
    v.dem = (v.dem || 0) + 1; v.huong = q.x < cx - 4 ? -1 : 1;
    if (v.id === 'scorch') bayDan(S, x, y, q, dmg, v, h.mau, 900, { burst: v.sao >= 7 && v.dem % 4 === 0 });
    else if (v.id === 'frost') bayDan(S, x, y, q, dmg, v, h.mau, 640);
    else if (v.id === 'warp') bayDan(S, x, y, q, dmg, v, h.mau, 300, { hut: v.dem % 4 === 0 });
    else if (v.id === 'miner') bayDan(S, x, y, q, dmg, v, h.mau, 700);
    else if (v.id === 'glitch') bayDan(S, x, y, q, dmg, v, h.mau, 900);
    else if (v.id === 'venom') { bayDan(S, x, y, q, dmg, v, h.mau, 760); bayDan(S, x - 6, y + 3, q, dmg, v, h.mau, 700, { cap: 1 }); }
    else if (v.id === 'arc') {   // Volt Cut: chém ngay; mỗi đòn thứ 3 nối sét
      trung(S, q, dmg, v, h.mau);
      S.fx.push({ k: 'chem', x: q.x, y: q.y - q.co / 2, t: 0, T: 0.14, mau: h.mau });
      if (v.dem % 3 === 0) {
        S.hitStop = Math.max(S.hitStop || 0, C.HIT_STOP.arc);
        let nhanh = v.sao >= 3 ? 3 : 2; const r = (v.sao >= 5 ? 105 : 85) * K;
        if (q.chill > 0 && q.arcCD <= 0) { nhanh++; q.arcCD = 1.5; }
        const pts = [[q.x, q.y - q.co / 2]], da = new Set([q]); let cur = q;
        for (let n = 0; n < nhanh; n++) {
          const ds = S.quai.filter((o) => nham(o) && !da.has(o) && kc(o, cur) < r).sort((a, b) => ((b.breachT > 0) - (a.breachT > 0)) || (kc(a, cur) - kc(b, cur)));
          if (!ds.length) break;
          cur = ds[0]; da.add(cur); pts.push([cur.x, cur.y - cur.co / 2]);
          trung(S, cur, dmg * 0.35, v, h.mau);
        }
        if (pts.length > 1) S.fx.push({ k: 'set', pts, t: 0, T: 0.22, mau: h.mau });
        if (v.sao >= 7) S.hen.push({ t: 0.18, x: q.x, y: q.y, r, dmg: dmg * 0.2, v, mau: h.mau });
      }
    } else if (v.id === 'lance') {   // Rail Shot xuyên + Focus Lock
      v.focusN = v.lastQ === q.uid ? (v.focusN || 0) + 1 : 1; v.lastQ = q.uid;
      let bonus = 0;
      if (v.focusN >= 2) { bonus = v.sao >= 5 ? 0.5 : 0.35; v.focusN = 0; }
      else if (q.breachT > 0 && q.focusCD <= 0) { bonus = 0.2; q.breachT = 0; q.focusCD = 4; }
      const tx = q.x, ty = q.y - q.co / 2, gx = tx - x, gy = ty - y, L0 = Math.hypot(gx, gy) || 1, ux = gx / L0, uy = gy / L0;
      const ex = x + ux * 900, ey = y + uy * 900;
      const xuyen = (v.sao >= 3 ? 3 : 2) - 1, sau = [];
      for (const o of S.quai) { if (o === q || !nham(o)) continue; const px = o.x - x, py = o.y - o.co / 2 - y, p = px * ux + py * uy; if (p > L0 && Math.abs(px * uy - py * ux) < 16 * K) sau.push([p, o]); }
      sau.sort((a, b) => a[0] - b[0]);
      S.hitStop = Math.max(S.hitStop || 0, C.HIT_STOP.lance); S.rung = Math.max(S.rung || 0, 0.05);   // hit-stop + giật màn ≤2px
      trung(S, q, dmg * (1 + bonus), v, h.mau, true);
      sau.slice(0, xuyen).forEach(([, o], n) => trung(S, o, dmg * (n === 0 ? 0.4 : 0.25), v, h.mau));
      S.fx.push({ k: 'rail', x0: x, y0: y, x1: ex, y1: ey, t: 0, T: 0.2, mau: h.mau, focus: bonus > 0 });
      if (bonus > 0 && v.sao >= 7) S.vung.push({ k: 'tia', x0: x, y0: y, x1: ex, y1: ey, t: 0, T: 0.6, dmg: dmg * 0.15, v, da: new Set() });
    }
    return true;
  }
  function trungDan(S, d) {
    const q = d.q, v = d.v, h = d.mau;
    if (!sống(q)) return;
    trung(S, q, d.dmg, v, h);
    if (!sống(q) && v.id !== 'scorch') return;
    const hs = heSo(S, v);
    if (v.id === 'scorch') {   // Heat Trail + Thermal Shock + Plasma Burst
      S.vung.push({ k: 'lua', x: q.x, y: q.y, r: (v.sao >= 3 ? 27 : 22) * K, t: 0, T: v.sao >= 5 ? 2.7 : 2, dmg: 5 * hs, n: v.sao >= 5 ? 4 : 3, tick: 0, v });
      if (sống(q) && q.chill > 0 && q.nhietCD <= 0) { q.nhietCD = 2.5; q.chill = 0; q.chillT = 0; S.fx.push({ k: 'nhiet', x: q.x, y: q.y - q.co / 2, t: 0, T: 0.18 }); trung(S, q, d.dmg * 0.4, v, '#ffffff'); }
      if (d.burst) { for (const o of S.quai) if (sống(o) && kc(o, q) < 40 * K) trung(S, o, d.dmg * 0.35, v, h); S.fx.push({ k: 'plasma', x: q.x, y: q.y - q.co / 2, r: 40 * K, t: 0, T: 0.3 }); }
    } else if (v.id === 'frost') {   // Chill Meter → Shatter
      if (q.voLock > 0) return;
      q.chill = Math.min(3, q.chill + 1); q.chillT = v.sao >= 3 ? 4 : 3;
      if (q.chill >= 3) {
        const r = (v.sao >= 5 ? 42 : 30) * K;
        q.chill = 0; q.chillT = 0; q.voLock = 1.5;
        for (const o of S.quai) if (sống(o) && kc(o, q) < r) trung(S, o, d.dmg * 0.3, v, h);
        S.fx.push({ k: 'vo', x: q.x, y: q.y - q.co / 2, r, t: 0, T: 0.35 });
        if (v.sao >= 7) S.vung.push({ k: 'bang', x: q.x, y: q.y, r, t: 0, T: 1.5 });
      }
    } else if (v.id === 'warp') {   // Gravity Knot
      if (d.hut) S.vung.push({ k: 'hut', x: q.x, y: q.y, dTam: q.d, r: (v.sao >= 3 ? 75 : 60) * K, t: 0, T: v.sao >= 5 ? 2 : 1.4, no: v.sao >= 7 ? d.dmg * 0.5 : 0, v, lui: new Map(), toi: new Map() });
    } else if (v.id === 'miner') {   // Bounty Contract
      v.trungDem = (v.trungDem || 0) + 1;
      if (v.trungDem % 5 === 0) {
        const n = v.sao >= 7 ? 2 : 1, ds = [];
        if (!(q.bounty > 0)) ds.push(q);
        for (const o of S.quai.filter((o) => nham(o) && !(o.bounty > 0) && o !== q && !o.echo).sort((a, b) => kc(a, q) - kc(b, q))) { if (ds.length >= n) break; ds.push(o); }
        for (const o of ds.slice(0, n)) { o.bounty = v.sao >= 3 ? 7 : 5; o.bountyGT = v.sao >= 5 ? 4 : 3; }
      }
    } else if (v.id === 'glitch') {   // Breach Protocol
      v.trungDem = (v.trungDem || 0) + 1;
      if (v.trungDem % 3 === 0) {
        q.breachT = v.sao >= 3 ? 5.5 : 4; q.breachK = v.sao >= 5; q.breachEmp = v.sao >= 7 ? d.dmg * 0.3 : 0; q.breachV = v;
        if (!q.boss && q.giatCD <= 0) { q.choang = Math.max(q.choang, 0.35); q.giatCD = 5; }
        S.fx.push({ k: 'emp', x: q.x, y: q.y - q.co / 2, r: 22 * K, t: 0, T: 0.2 });
      }
    } else if (v.id === 'venom' && d.cap) {   // mỗi cặp kim: +1 stack Toxin
      q.tox = Math.min(4, q.tox + 1); q.toxT = v.sao >= 3 ? 5 : 4; q.toxV = v; q.toxLan = 0;
    }
  }

  function buoc(S, dt) {
    if (S.het) return;
    if (S.hitStop > 0) { S.hitStop -= dt; return; }   // hit-stop: đứng hình cả bàn 20–35ms sau đòn mạnh
    S.t += dt;
    // đợt (bàn AI: nhận cùng đợt với người chơi — khi người chơi sang đợt mới thì AI cũng sang)
    if (S.coop) { if (S.ai) dieuPhoiCoop(S, dt); else S.dot = S.coop.dot; if (S.het) return; }
    else if (S.theo && S.theo.dot > S.dot) batDauDot(S);
    if (S.coop) { /* co-op: wave do dieuPhoiCoop lo */ }
    else if (S.conSinh > 0) {
      S.sinhT -= dt;
      if (S.sinhT <= 0) { sinh(S); S.conSinh--; S.sinhT = S.khoangSinh; S.sauSinh = 0; }
    } else {
      S.sauSinh += dt;
      const con = S.quai.some(sống);
      if (!S.theo && (S.dot === 0 || (!S.boss && (!con || (S.sauSinh > 14 && !S.laBoss))))) {
        S.choT -= dt;
        if (S.choT <= 0) {
          if (S.dot > 0) { const th = 15 + 5 * S.dot; S.lk += th; S.so.push({ x: S.B.OX + S.B.SW / 2, y: S.B.OY + S.B.SH / 2, v: `WAVE CLEAR +${th}`, t: 0, mau: '#ffe27a', lk: 1, to: 1 }); }
          batDauDot(S); S.choT = 1.2;
        }
      }
    }
    if (S.bao) { S.bao.t += dt; if (S.bao.t > S.bao.T) S.bao = null; }
    if (S.rung > 0) S.rung = Math.max(0, S.rung - dt);
    // tướng
    S.o.forEach((v, i) => {
      if (!v) return;
      if (v.moi > 0) v.moi -= dt;
      if (v.danh > 0) v.danh -= dt;
      if (v.nong > 0) v.nong = Math.max(0, v.nong - dt);
      if (v.corrT > 0) v.corrT = Math.max(0, v.corrT - dt);
      capNhatHuong(S, i, v, dt);
      v.cd -= dt / (v.nong > 0 ? 1.67 : 1);   // FIREWALL Heat Lockdown: bắn chậm 40%
      // đòn đánh theo hoạt ảnh: bắt đầu attack (14fps), đạn/đòn phát ra đúng lúc vào khung ra đòn (khung 3, TAC_DONG)
      if (v.cho > 0) { v.cho -= dt; if (v.cho <= 0) { v.cho = 0; ban(S, i, v); } }
      else if (v.cd <= 0) { const q = chonMuc(S, i, v); if (q) { v.cd = T[v.id].cd; v.danh = 0.3; v.cho = C.TAC_DONG; v.atkT = S.t; v.mucNhin = q; v.khongMuc = 0; chonHuong(v, gocTo(S, i, q), true); } else v.cd = 0.05; }
    });
    // sát thương trễ (CORRUPTOR) + nhịp sét trễ (ARC 7★)
    for (const p of S.treo) { p.t -= dt; if (p.t <= 0) { p.xong = true; trung(S, p.q, p.dmg, p.v, p.mau, false, false, true); } }
    S.treo = S.treo.filter((p) => !p.xong);
    for (const p of S.hen) {
      p.t -= dt; if (p.t > 0) continue; p.xong = true;
      const ds = S.quai.filter((o) => nham(o) && Math.hypot(o.x - p.x, o.y - p.y) < p.r).slice(0, 3);
      for (const o of ds) trung(S, o, p.dmg, p.v, p.mau);
      if (ds.length) S.fx.push({ k: 'set', pts: [[p.x, p.y - 20], ...ds.map((o) => [o.x, o.y - o.co / 2])], t: 0, T: 0.18, mau: p.mau });
    }
    S.hen = S.hen.filter((p) => !p.xong);
    // đạn
    for (const d of S.dan) {
      const q = d.q;
      if (!sống(q) || q.ban !== S) { d.xong = true; continue; }
      const tx = q.x, ty = q.y - q.co / 2, dx = tx - d.x, dy = ty - d.y, k = Math.hypot(dx, dy), b = d.spd * dt;
      if (k <= b + 6) { d.xong = true; trungDan(S, d); }
      else { d.x += dx / k * b; d.y += dy / k * b; d.goc = Math.atan2(dy, dx); }
    }
    S.dan = S.dan.filter((d) => !d.xong);
    // vùng hiệu ứng: vệt lửa, trường hút, băng, tia cháy, dải lửa boss
    for (const z of S.vung) {
      z.t += dt;
      if (z.k === 'lua') {
        z.tick -= dt;
        if (z.tick <= 0) {
          z.tick = 0.5; let n = 0; const r = trongHut(S, z) ? z.r * 1.2 : z.r;
          for (const q of S.quai) { if (n >= z.n) break; if (sống(q) && q.luaT <= S.t && kc(q, z) < r) { q.luaT = S.t + 0.5; n++; trung(S, q, z.dmg, z.v, '#ff9a50', false, true); } }
        }
      } else if (z.k === 'hut') {
        for (const q of S.quai) {
          if (!sống(q) || kc(q, z) >= z.r) continue;
          if (q.boss) { q.slowHut = Math.max(q.slowHut, 0.08); continue; }
          const P = S.B.P, del = z.dTam - q.d, b = Math.min(Math.abs(del), 40 * P * dt);
          if (del < 0) { const da = z.lui.get(q.uid) || 0, m = Math.min(b, 12 * P - da); if (m > 0) { q.d -= m; z.lui.set(q.uid, da + m); } }
          else { const da = z.toi.get(q.uid) || 0, m = Math.min(b, 18 * P - da); if (m > 0) { q.d += m; z.toi.set(q.uid, da + m); } }
        }
        if (z.t >= z.T && z.no > 0) {
          const ds = S.quai.filter((q) => sống(q) && kc(q, z) < z.r).slice(0, 5);
          for (const q of ds) trung(S, q, z.no, z.v, '#d9b8ff');
          S.fx.push({ k: 'boom', x: z.x, y: z.y - 12, r: z.r, t: 0, T: 0.35 });
        }
      } else if (z.k === 'bang') {
        for (const q of S.quai) if (sống(q) && kc(q, z) < z.r) q.slowBang = Math.max(q.slowBang, q.boss ? 0.1 : 0.2);
      } else if (z.k === 'tia') {
        const ux = z.x1 - z.x0, uy = z.y1 - z.y0, L0 = Math.hypot(ux, uy);
        for (const q of S.quai) {
          if (!sống(q) || z.da.has(q)) continue;
          const px = q.x - z.x0, py = q.y - q.co / 2 - z.y0;
          if (Math.abs(px * uy - py * ux) / L0 < 12 * K) { z.da.add(q); trung(S, q, z.dmg, z.v, '#ff3c8e'); }
        }
      } else if (z.k === 'ember') {
        for (const q of S.quai) if (sống(q) && !q.boss && !q.daKhien && q.d >= z.d0 && q.d <= z.d1) { q.daKhien = 1; q.khien = q.max * 0.12; }
      }
    }
    S.vung = S.vung.filter((z) => z.t < z.T);
    // quái
    for (const q of S.quai) {
      if (!sống(q)) continue;
      q.khung += dt * 7;
      if (q.flash > 0) q.flash = Math.max(0, q.flash - dt);
      for (const f of ['chillT', 'voLock', 'nhietCD', 'arcCD', 'focusCD', 'giatCD', 'toxNhan', 'bounty', 'nhanhT', 'linkT']) if (q[f] > 0) q[f] = Math.max(0, q[f] - dt);
      if (q.chillT <= 0) q.chill = 0;
      if (q.breachT > 0) {
        q.breachT -= dt;
        if (q.breachT <= 0 && q.breachEmp > 0) {   // GLITCH 7★: hết Breach → EMP
          for (const o of S.quai.filter((o) => sống(o) && kc(o, q) < 45 * K).slice(0, 3)) trung(S, o, q.breachEmp, q.breachV, '#00ffa3');
          S.fx.push({ k: 'emp', x: q.x, y: q.y - q.co / 2, r: 45 * K, t: 0, T: 0.2 }); q.breachEmp = 0;
        }
      }
      if (q.toxT > 0) {   // Toxin: 3 dmg/giây mỗi stack (theo hệ số sao/bậc của VENOM)
        q.toxT -= dt; q.toxDem += q.tox * 3 * heSo(S, q.toxV) * dt;
        if (q.toxDem >= 1) { const n = q.toxDem; q.toxDem = 0; trung(S, q, n, q.toxV, '#b4ff2a', false, true); }
        if (q.toxT <= 0) { q.tox = 0; q.toxDem = 0; }
      }
      if (!sống(q)) continue;
      if (q.linkT > 0 && (!S.boss || kc(q, S.boss) > 180 * K)) q.linkT = 0;
      const sl = Math.max(q.chill * (q.boss ? 0.05 : 0.10), q.slowBang, q.slowHut);
      q.cham = Math.min(q.boss ? 0.30 : 0.45, sl); q.slowBang = 0; q.slowHut = 0;
      if (q.choang > 0) { q.choang -= dt; continue; }
      q.d += q.spd * (1 - q.cham) * (q.nhanhT > 0 ? 1 + q.nhanhK : 1) * dt;
      datViTri(S, q);
      if (!q.daRa && q.d >= 26 * S.B.P) q.daRa = true;
      if (q.boss) kyNangBoss(S, q, dt);
      if (q.d >= S.B.DAI && S.coop && S.ai) { q.ra = true; (S.chuyen || (S.chuyen = [])).push(q); continue; }   // co-op: hết làn trên → xuống làn dưới
      if (q.d >= S.B.DAI) {
        q.ra = true;
        const mat = S.coop ? (q.boss ? COOP.MAT_BOSS : COOP.MAT_QUAI) : q.boss ? 2 : 1;
        if (S.coop) { const co = S.coop; co.mang = Math.max(0, co.mang - mat); S.mang = S.ban.mang = co.mang; }
        else S.mang -= mat;
        S.fx.push({ k: 'thanh', t: 0, T: 0.6 }); S.rung = Math.max(S.rung || 0, 0.35);
        S.so.push({ x: S.B.RA[0] + 30, y: S.B.RA[1] - 14, v: `CORE -${mat}`, t: 0, mau: '#ff5a5a', to: 1 });
        if (q === S.boss) xongBoss(S);
        if (S.mang <= 0) { S.mang = 0; S.het = true; if (S.coop) S.ban.het = true; }
      }
    }
    S.quai = S.quai.filter((q) => sống(q));
    if (S.chuyen) { for (const q of S.chuyen) chuyenXuong(S, q); S.chuyen = null; }
    for (const f of S.fx) f.t += dt;
    S.fx = S.fx.filter((f) => f.t < f.T);
    for (const s of S.so) s.t += dt;
    S.so = S.so.filter((s) => s.t < (s.T || 0.8));
  }
  // ---- boss: 2 kỹ năng, có cảnh báo (tele) trước khi tung; mỗi lúc chỉ 1 cảnh báo ----
  const dpsO = (S, v) => satThuong(S, v) / T[v.id].cd;
  function kyNangBoss(S, q, dt) {
    q.songT += dt;
    if (q.tele) {
      q.tele.t += dt;
      if (q.tele.t >= q.tele.T) { tungChieu(S, q, q.tele); q.tele = null; }
      return;
    }
    q.knCD = q.knCD.map((c) => c - dt);
    if (q.songT < 4) return;
    const j = q.knCD.findIndex((c) => c <= 0);
    if (j < 0) return;
    const kn = q.boss.kn[j];
    q.knCD[j] = kn.cd;
    const te = { k: kn.k, ten: kn.ten, t: 0, T: kn.tele };
    const co = S.o.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
    if (kn.k === 'lockdown') {   // chọn hàng có tổng DPS cao nhất
      let best = 0, bd = -1;
      for (let r = 0; r < C.HANG; r++) { let s = 0; for (let c2 = 0; c2 < C.COT; c2++) { const v = S.o[r * C.COT + c2]; if (v) s += dpsO(S, v); } if (s > bd) { bd = s; best = r; } }
      te.hang = best;
    } else if (kn.k === 'infect') {
      const ds = co.slice(); te.o = [];
      while (ds.length && te.o.length < 3) te.o.push(ds.splice(Math.floor(rnd() * ds.length), 1)[0]);
    } else if (kn.k === 'link') {
      te.ds = S.quai.filter((o) => sống(o) && !o.boss).sort((a, b) => kc(a, q) - kc(b, q)).slice(0, 2);
    }
    q.tele = te;
    S.fx.push({ k: 'kn', x: q.x, y: q.y - q.co / 2, t: 0, T: 0.7, mau: q.boss.mau });
  }
  function tungChieu(S, q, te) {
    const vg = q.vong;
    S.rung = Math.max(S.rung || 0, 0.25);
    S.fx.push({ k: 'kn', x: q.x, y: q.y - q.co / 2, t: 0, T: 0.7, mau: q.boss.mau });
    if (te.k === 'lockdown') {   // 2 ô có tướng trong hàng: bắn chậm 40% (không câm hẳn)
      const dur = Math.min(3.1, 2.5 + 0.3 * vg);
      let ds = [];
      for (let c2 = 0; c2 < C.COT; c2++) { const i = te.hang * C.COT + c2; if (S.o[i]) ds.push(i); }
      ds.sort((a, b) => dpsO(S, S.o[b]) - dpsO(S, S.o[a]));
      if (ds.length > 2 && ds[0] === q.lastLock) ds.push(ds.shift());
      ds = ds.slice(0, 2);
      for (const i of ds) { S.o[i].nong = dur; S.o[i].dauT = S.t; S.fx.push({ k: 'hoada', i, t: 0, T: 0.6 }); }
      if (ds.length) q.lastLock = ds[0];
    } else if (te.k === 'ember') {
      S.vung.push({ k: 'ember', d0: q.d, d1: q.d + 100 * S.B.P, t: 0, T: 3 });
    } else if (te.k === 'surge') {
      const dur = Math.min(3.9, 3 + 0.3 * vg);
      for (const o of S.quai) if (sống(o)) { o.nhanhT = dur; o.nhanhK = o.boss ? 0.15 : 0.35; }
      S.fx.push({ k: 'xung', x: q.x, y: q.y - q.co / 2, t: 0, T: 0.6 });
    } else if (te.k === 'split') {
      const con = S.quai.filter((o) => sống(o) && o.echo).length;
      for (let n = 0; n < Math.min(2, 4 - con); n++) {
        const hp = Math.min(q.hp * 0.12, q.max * 0.10);
        const e = themQuai(S, 'nhanh', hp, Q.nhanh.spd, null, Q.nhanh.co);
        e.echo = true; e.thuong = 0; e.daRa = true; e.d = Math.max(26 * S.B.P, q.d - (6 + n * 10) * S.B.P); datViTri(S, e);
        S.fx.push({ k: 'xung', x: e.x, y: e.y - 10, t: 0, T: 0.4 });
      }
    } else if (te.k === 'infect') {
      const dur = Math.min(4.6, 4 + 0.3 * vg);
      for (const i of te.o) if (S.o[i]) { S.o[i].corrT = dur; S.o[i].dauT = S.t; S.fx.push({ k: 'hoada', i, t: 0, T: 0.6, mau: '#c04dff' }); }
    } else if (te.k === 'link') {
      q.linkCap = q.max * 0.06;
      for (const o of te.ds) if (sống(o) && kc(o, q) <= 180 * K) o.linkT = 4;
    }
  }

  // ---- bot bàn AI MIRROR: mỗi 2–3 giây triệu hồi nếu đủ Energy, rồi ghép cặp đầu tiên tìm được; dư nhiều thì nâng cấp ----
  function botAI(S, dt) {
    if (S.het) return;
    S.botT = (S.botT == null ? 2 : S.botT) - dt;
    if (S.botT > 0) return;
    S.botT = 2 + rnd();
    if (trong(S).length && S.lk >= giaTrieu(S)) trieuHoi(S);
    for (let a = 0; a < S.o.length; a++) for (let b = a + 1; b < S.o.length; b++) if (gopDuoc(S, a, b)) { tha(S, a, b); return; }
    if (!trong(S).length) { let re = null; for (const id of S.deck) if (S.bac[id] < C.BAC_MAX && (!re || giaBac(S, id) < giaBac(S, re))) re = id; if (re && S.lk >= giaBac(S, re) + 40) lenBac(S, re); }
  }

  // ---- đồng đội AI (co-op): hợp lý hơn bot PVP — mỗi COOP.AI_NHIP giây làm 1 việc:
  // 1) ghép cặp sao thấp nhất nếu có; 2) bàn còn ô (dưới trần COOP.aiOToiDa theo wave) → triệu hồi khi đủ Energy (giữ Energy cho triệu hồi, không nâng cấp);
  // 3) bàn đầy, không ghép được → nâng cấp loại tướng có tổng sao trên bàn cao nhất mà đủ Energy
  function botCoop(S, dt) {
    if (S.het) return;
    S.botT = (S.botT == null ? 1 : S.botT) - dt;
    if (S.botT > 0) return;
    S.botT = COOP.AI_NHIP[0] + rnd() * COOP.AI_NHIP[1];
    let ga = -1, gb = -1;
    for (let a = 0; a < S.o.length; a++) for (let b = a + 1; b < S.o.length; b++) if (gopDuoc(S, a, b) && (ga < 0 || S.o[a].sao < S.o[ga].sao)) { ga = a; gb = b; }
    if (ga >= 0) { tha(S, ga, gb); return; }
    const dang = S.o.filter(Boolean).length;
    if (trong(S).length) { if (dang < COOP.aiOToiDa(Math.max(1, S.dot)) && S.lk >= giaTrieu(S)) trieuHoi(S); return; }   // còn ô: chỉ triệu hồi, không nâng cấp
    const tong = {}; for (const v of S.o) if (v) tong[v.id] = (tong[v.id] || 0) + Math.pow(2, v.sao - 1);
    let re = null;
    for (const id of S.deck) if (S.bac[id] < C.BAC_MAX && S.lk >= giaBac(S, id) && (!re || (tong[id] || 0) > (tong[re] || 0))) re = id;
    if (re) lenBac(S, re);
  }

  const API = { moi, moiCoop, botCoop, buoc, botAI, trieuHoi, tha, lenBac, gopDuoc, giaTrieu, giaBac, satThuong, oXY, oTam, ke, viTri, trong, nong,
    BAN_NG, BAN_AI, K, setRnd: (f) => (rnd = f) };
  root.GAME = API;
  if (typeof module !== 'undefined') module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
