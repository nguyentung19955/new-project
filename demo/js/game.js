// DEMO "Thủ thành ghép tướng" — luật chơi (không đụng DOM: chạy được cả trong node để giả lập cân bằng)
'use strict';
(function (root) {
  const C = CAU_HINH, T = TUONG, Q = QUAI, B = BOSS;
  const K = C.TL;   // thu nhỏ không gian (bước ô 48/70): tầm bắn + bán kính vùng hiệu ứng
  // hình học 1 bàn (người chơi dưới / AI trên): lưới 5×3 + làn quái dọc riêng bên trái (đầu trên → cuối dưới)
  // Các đối tượng bàn được SỬA TẠI CHỖ khi đổi chiều cao màn (boCuc) nên state trận (S.B) luôn trỏ đúng.
  function dungBan(B, ai, duong) {
    const by = ai ? C.BAN_AI_Y : C.BAN_NG_Y, OX = C.BAN_X + C.VIEN, OY = by + C.VIEN;
    const DUONG = duong || (ai ? C.LAN_AI : C.LAN_NG), DOAN = [];
    let DAI = 0;
    for (let i = 1; i < DUONG.length; i++) {
      const [x0, y0] = DUONG[i - 1], [x1, y1] = DUONG[i];
      const d = Math.hypot(x1 - x0, y1 - y0);
      DOAN.push({ x0, y0, x1, y1, d, tu: DAI });
      DAI += d;
    }
    return Object.assign(B, { ai, BX: C.BAN_X, BY: by, OX, OY, SW: C.COT * C.BUOC_X, SH: C.HANG * C.BUOC_Y, DUONG, DOAN, DAI, P: DAI / C.DAI_CU,
      RA: DUONG[DUONG.length - 1] });
  }
  const BAN_NG = {}, BAN_AI = {}, BAN_AI_CO = {}, BAN_NG_CO = {};
  // BỐ CỤC kiểu DCDW theo chiều cao logic H: 2 bàn SÁT NHAU (khe GAP + nhãn), chiều cao dư → ô cao hơn (bàn to hơn),
  // phần dư còn lại (khi ô đã chạm trần OH_MAX_TL) chia đều trên/dưới cụm 2 bàn — không để khoảng trống lớn giữa 2 bàn.
  // Cỡ tướng theo chiều cao ô: TUONG_CAO = TUONG_TL × OH, chân cách đáy ô CHAN.
  function boCuc(H) {
    H = Math.max(C.H_MIN, Math.round(H));
    C.H = H;
    C.DUOI_Y = H - C.DUOI_DAY - C.DUOI_H;                  // đỉnh HUD dưới (Energy/SUMMON + thẻ)
    const avail = C.DUOI_Y - C.TOP_H - 2 * C.NHAN - C.GAP - 8;
    const maxBY = Math.round(C.O * C.OH_MAX_TL) + C.KHE;
    C.BUOC_Y = Math.max(52, Math.min(maxBY, Math.floor((avail / 2 - 2 * C.VIEN) / 3)));
    C.OH = C.BUOC_Y - C.KHE;
    C.BAN_H = C.HANG * C.BUOC_Y + 2 * C.VIEN;
    const du = Math.max(0, avail - 2 * C.BAN_H);
    C.BAN_AI_Y = C.TOP_H + C.NHAN + Math.floor(du / 2);
    C.BAN_NG_Y = C.BAN_AI_Y + C.BAN_H + C.GAP + C.NHAN;
    C.TUONG_CAO = Math.round(C.OH * C.TUONG_TL);
    C.TUONG_RONG = C.O + 8;
    C.CHAN = Math.max(3, Math.round(C.OH * 0.07));
    const lx = (C.LAN_X0 + C.LAN_X1) / 2, T = C.LAN_THUA, Tg = C.LAN_GIUA;
    C.LAN_AI = [[lx, C.BAN_AI_Y - T], [lx, C.BAN_AI_Y + C.BAN_H + Tg]];
    C.LAN_NG = [[lx, C.BAN_NG_Y - Tg], [lx, C.BAN_NG_Y + C.BAN_H + T]];
    C.GIUA_Y = C.BAN_AI_Y + C.BAN_H + (C.GAP + C.NHAN) / 2;   // giữa 2 bàn (dải thông báo wave phủ tạm lên)
    dungBan(BAN_NG, false); dungBan(BAN_AI, true);
    // CO-OP: đường chung — làn trên (bàn đồng đội) nối thẳng xuống làn dưới (bàn người chơi): làn dưới bắt đầu từ cuối làn trên (qua đường nối)
    dungBan(BAN_AI_CO, true, C.LAN_AI); dungBan(BAN_NG_CO, false, [C.LAN_AI[C.LAN_AI.length - 1], C.LAN_NG[C.LAN_NG.length - 1]]);
    const P = (BAN_AI_CO.DAI + BAN_NG_CO.DAI) / (COOP.THOI_GIAN_DUONG * C.DAI_CU); BAN_AI_CO.P = P; BAN_NG_CO.P = P;   // cùng tốc độ px/giây trên cả đường
    return H;
  }
  boCuc(C.H);
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
  // tham số theo sao: số, hoặc { 1: a, 3: b, 5: c } → giá trị của mốc sao cao nhất ≤ sao
  function theoSao(p, sao) {
    if (p == null || typeof p !== 'object') return p;
    let v; for (const k of Object.keys(p).map(Number).sort((a, b) => a - b)) if (sao >= k) v = p[k];
    return v == null ? p[Object.keys(p)[0]] : v;
  }

  // ai: true = bàn AI (trên); theo = state người chơi để nhận cùng đợt; af = id Archfiend (ARCHFIEND)
  function moi(deck, ai, theo, af) {
    const bac = {}; deck.forEach((id) => (bac[id] = 0));
    return {
      B: ai ? BAN_AI : BAN_NG, ai: !!ai, theo: theo || null,
      deck: deck.slice(), bac, o: new Array(C.COT * C.HANG).fill(null),
      quai: [], dan: [], fx: [], so: [], vung: [], treo: [], hen: [], bountyDot: 0, lk: C.LK_DAU, mang: C.MANG, dot: 0, triệu: 0,
      conSinh: 0, sinhT: 0, choT: 1.5, sauSinh: 0, giet: 0, t: 0, het: false, boss: null, bao: null, nid: 1, tienT: 0,
      af: ARCHFIEND[af] ? { id: af, n: 0, cdT: 0, T: 0 } : null,   // Archfiend: n = số lần đã dùng, cdT = hồi chiêu còn lại, T = thời gian hiệu lực còn lại
      tk: {},   // thống kê sát thương theo loại tướng của bàn này (màn kết quả)
    };
  }
  // CO-OP: S = bàn người chơi (dưới), A = bàn đồng đội AI (trên); dùng chung 1 đối tượng coop (mạng, wave, thắng)
  function moiCoop(deck, boAI, af, afAI) {
    const co = { mang: COOP.MANG, max: COOP.MANG, dot: 0, thang: false, choT: COOP.CHO_DAU };
    const S = moi(deck, false, null, af), A = moi(boAI, true, null, afAI);
    S.B = BAN_NG_CO; A.B = BAN_AI_CO;
    S.coop = A.coop = co; S.ban = A; A.ban = S; S.mang = A.mang = co.mang;
    A.nid = 100000;   // uid quái 2 bàn không trùng (quái chuyển từ bàn trên xuống bàn dưới)
    return { S, A };
  }
  const giaTrieu = (S) => C.giaTrieu(S.triệu);
  const giaBac = (S, id) => (S.bac[id] >= C.BAC_MAX ? Infinity : C.giaBac(S.bac[id]));
  const trong = (S) => S.o.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  const taoTuong = (S, id, sao, them) => Object.assign({ id, sao, cd: rnd() * 0.5, da: 0, danh: 0, moi: 0.35, uid: S.nid++, sinhT: S.t, tk: S.tk, hs: heAI(S) }, them || {});

  // TRIỆU HỒI như DCDW: ngẫu nhiên ĐỀU nhau trong 5 tướng của bộ (bậc không ảnh hưởng), vào ô trống ngẫu nhiên; giá tăng mỗi lần
  function trieuHoi(S) {
    const tr = trong(S), g = giaTrieu(S);
    if (!tr.length || S.lk < g || S.het) return -1;
    S.lk -= g; S.triệu++;
    const i = pick(tr);
    S.o[i] = taoTuong(S, pick(S.deck), 1);
    S.fx.push({ k: 'trieu', i, t: 0, T: 0.18 });   // phản hồi summon 120–180ms
    return i;
  }
  const gopDuoc = (S, a, b) => { const A = S.o[a], Bb = S.o[b]; return a !== b && A && Bb && A.id === Bb.id && A.sao === Bb.sao && A.sao < C.SAO_MAX && !A.da && !Bb.da; };
  const dacBiet = (id) => (T[id] && T[id].dac) || null;
  // kéo a thả lên b: cùng loại cùng sao → b thành sao+1, loại ngẫu nhiên trong bộ (như DCDW); ô trống → chuyển chỗ
  function tha(S, a, b) {
    if (S.het || a === b || !S.o[a] || S.o[a].da) return false;
    if (!S.o[b]) { S.o[b] = S.o[a]; S.o[a] = null; return 'chuyen'; }
    if (!gopDuoc(S, a, b)) return false;
    const sao = S.o[b].sao + 1, cu = [S.o[a], S.o[b]], dac = dacBiet(S.o[b].id);
    if (dac && DAC_BIET[dac.k] && DAC_BIET[dac.k].khiGop) { const kq = DAC_BIET[dac.k].khiGop(S, a, b, dac); if (kq) return kq; }   // VÀNG: ghép đặc biệt
    S.o[a] = null;
    const kq = pick(S.deck);
    S.o[b] = taoTuong(S, kq, sao, { cd: 0.3, moi: 0.5, kieuSinh: 'gop' });
    // tu/cu: để render vẽ 2 tướng cũ thu vào tâm ô b rồi tướng mới bật ra (merge 180–260ms)
    S.fx.push({ k: 'gop', i: b, tu: a, cu: cu.map(chup), t: 0, T: 0.6, sao });
    sauGop(S, b, kq);
    return 'gop';
  }
  // ---- sau khi ghép ở ô b: GLITCH PACKET SWAP (★5, kề ô b) cho chọn 1 trong 2 kết quả; BROKER CHỐT LỜI (★7, kề ô b) hoàn Energy ----
  function tuongKe(S, b, f) { for (const j of ke(b)) { const o = S.o[j]; if (o && f(o, j)) return j; } return -1; }
  function sauGop(S, b, kq) {
    if (!S.ai) {
      const j = tuongKe(S, b, (o) => { const d = T[o.id].dac; return d && d.packetSwap && o.sao >= d.packetSwap.tuSao && !(o.khoaT > 0); });
      if (j >= 0) {
        const g = S.o[j], d = T[g.id].dac;
        S.choGop = { i: b, uid: S.o[b].uid, lua: [kq, pick(S.deck)], g: g.uid, t0: S.t,
          reroll: !!(d.reroll && g.sao >= d.reroll.tuSao && (g.daReroll || 0) < d.reroll.lan) };
        baoSkill(S, j, d.packetSwap.ten);
      }
    }
    const jb = tuongKe(S, b, (o) => { const d = T[o.id].dac; return d && d.chotLoi && o.sao >= d.chotLoi.tuSao && !(o.khoaT > 0) && (o.chotT || 0) <= S.t; });
    if (jb >= 0) {
      const o = S.o[jb], cf = T[o.id].dac.chotLoi, n = Math.round(cf.hoan * C.giaTrieu(Math.max(0, S.triệu - 1)));
      o.chotT = S.t + cf.nghi; S.lk += n; baoSkill(S, jb, cf.ten);
      const [x, y] = oTam(S, jb); S.so.push({ x: x + 12, y: y + 8, v: '+' + n, t: 0, mau: '#ffe27a', lk: 1 });
    }
  }
  // PACKET SWAP: người chơi chọn kết quả n (0/1); REROLL (GLITCH ★7, 1 lần) rút lại cả 2 lựa chọn
  function chonGop(S, n) {
    const c = S.choGop; if (!c) return false;
    const v = S.o[c.i];
    if (v && v.uid === c.uid && c.lua[n] && v.id !== c.lua[n]) v.id = c.lua[n];
    S.choGop = null; return true;
  }
  function rerollGop(S) {
    const c = S.choGop; if (!c || !c.reroll) return false;
    const g = S.o.find((o) => o && o.uid === c.g); if (g) g.daReroll = (g.daReroll || 0) + 1;
    c.lua = [pick(S.deck), pick(S.deck)]; c.reroll = false; return true;
  }
  // ---- KỸ NĂNG CHỦ ĐỘNG THEO Ô (VÀNG): chạm tướng → chọn kỹ năng → chọn ô hợp lệ ----
  function kyCo(S, i) {   // [{ n, cf, cd }] các kỹ năng đã mở (theo sao) của tướng ở ô i
    const v = S.o[i]; if (!v) return [];
    const d = T[v.id].dac; if (!d || !d.ky) return [];
    return d.ky.map((cf, n) => ({ n, cf, cd: (v.kyCD && v.kyCD[n]) || 0 })).filter((x) => v.sao >= x.cf.tuSao);
  }
  function oHopLe(S, i, n) {
    const v = S.o[i]; if (!v) return [];
    const cf = T[v.id].dac.ky[n];
    if (cf.chon === 'ke') return ke(i).filter((j) => S.o[j] && !S.o[j].da);
    if (cf.chon === 'cungSao') return S.o.map((o, j) => j).filter((j) => j !== i && S.o[j] && S.o[j].sao === v.sao && !S.o[j].da);
    return [];
  }
  const KY = {
    giaoDich(S, i, v, j, cf) { const o = S.o[j]; o.giaoT = cf.T; o.giaoThem = theoSao(cf.them, v.sao); S.fx.push({ k: 'noi', a: i, b: j, t: 0, T: 0.5, mau: '#ffc93a' }); },
    hoanDoi(S, i, v, j) { const o = S.o[j]; S.o[j] = v; S.o[i] = o; S.fx.push({ k: 'noi', a: i, b: j, t: 0, T: 0.5, mau: '#ffc93a' }); return j; },
    copyBuffer(S, i, v, j, cf) { const o = S.o[j]; o.buffT = cf.T; o.buffK = cf.he; S.fx.push({ k: 'noi', a: i, b: j, t: 0, T: 0.5, mau: '#00ffa3' }); },
  };
  function dungKy(S, i, n, j) {
    const v = S.o[i]; if (!v || S.het || v.khoaT > 0) return false;
    const ds = kyCo(S, i), x = ds.find((k) => k.n === n);
    if (!x || x.cd > 0 || !oHopLe(S, i, n).includes(j) || !KY[x.cf.k]) return false;
    const moiO = KY[x.cf.k](S, i, v, j, x.cf);
    (v.kyCD || (v.kyCD = {}))[n] = x.cf.cd;
    baoSkill(S, moiO != null ? moiO : i, x.cf.ten);
    return true;
  }
  const chup = (v) => ({ id: v.id, sao: v.sao, hg: v.hg, goc: v.goc, uid: v.uid });
  // NÂNG CẤP bằng Energy: áp dụng cho CẢ LOẠI tướng (mọi bản sao trên bàn, kể cả triệu hồi sau)
  function lenBac(S, id) {
    const g = giaBac(S, id);
    if (S.het || S.lk < g) return false;
    S.lk -= g; S.bac[id]++;
    S.o.forEach((v, i) => { if (v && v.id === id) S.fx.push({ k: 'bac', i, t: 0, T: 0.5 }); });
    return true;
  }
  const heAI = (S) => (S.coop && S.ai ? COOP.AI_SAT_THUONG : 1);   // co-op: tướng đồng đội AI mang hệ số giảm sát thương (v.hs)
  const satThuong = (S, v) => T[v.id].dmg * C.heSoSao(v.sao) * C.heSoBac(S.bac[v.id]) * (v.hs || 1);

  // ---- ARCHFIEND: kỹ năng chủ động (Energy, giá tăng sau mỗi lần dùng, có hồi chiêu) ----
  const giaAF = (S) => (S.af ? ARCHFIEND[S.af.id].gia(S.af.n) : Infinity);
  const afBat = (S, k) => !!(S.af && S.af.T > 0 && ARCHFIEND[S.af.id].k === k);   // hiệu lực đang chạy?
  function dungAF(S) {
    const a = S.af; if (!a || S.het || a.cdT > 0) return false;
    const cfg = ARCHFIEND[a.id], g = giaAF(S);
    if (S.lk < g) return false;
    S.lk -= g; a.n++; a.cdT = cfg.cd; a.T = cfg.T;
    if (cfg.k === 'tuongLua') for (const v of S.o) if (v) { v.nong = 0; v.corrT = 0; v.khoaT = 0; }   // FIREWALL: xoá hiệu ứng trùm trên tướng
    S.fx.push({ k: 'af', t: 0, T: 0.6, ten: cfg.ten, mau: cfg.mau });
    return true;
  }

  function batDauDot(S) {
    S.dot++;
    const w = S.dot, laBoss = w % 10 === 0;
    const moi = laBoss ? 5 : 8 + Math.floor(w * 0.7);
    S.conSinh = (S.theo ? S.conSinh : 0) + moi;
    S.eliteLich = laBoss ? [] : lichElite(w, moi);
    S.sinhT = laBoss ? 2.2 : 0.6;
    S.khoangSinh = Math.max(0.42, 1.0 - w * 0.015);
    S.laBoss = laBoss; S.bountyDot = 0;
    if (laBoss) {
      const b = B[(w / 10 - 1) % B.length], vong = Math.floor((w / 10 - 1) / B.length);
      const hp = b.hp * Math.pow(1.8, vong);                    // máu boss theo đề xuất ChatGPT, x1.8 mỗi vòng lặp
      const q = themQuai(S, 'boss', hp, 26 * (1 + Math.min(0.24, 0.08 * vong)), null, 50);
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
    A.eliteLich = laBoss ? [] : lichElite(w, A.conSinh);
    A.sinhT = laBoss ? 2.2 : 0.6; A.khoangSinh = COOP.khoangSinh(w); A.laBoss = laBoss; A.sauSinh = 0;
    A.bountyDot = 0; S.bountyDot = 0;
    let bao;
    if (laBoss) {
      const n = w / 10 - 1, idx = cuoi ? B.length - 1 : n % B.length, vong = Math.floor(n / B.length), b = B[idx];
      const q = themQuai(A, 'boss', COOP.mauBoss(w, idx, vong, cuoi), 26 * (1 + Math.min(0.24, 0.08 * vong)), null, cuoi ? 56 : 50);
      q.lech = 0; datViTri(A, q);
      q.boss = b; q.vong = vong; q.cuoi = cuoi; q.thuong = 60 + 6 * w; q.songT = 0; q.knCD = b.kn.map(() => 0); q.tele = null; q.linkCap = 0;
      A.boss = q;
      bao = { chu: cuoi ? `WAVE ${w} · FINAL BOSS` : `WAVE ${w} · ${b.ten}`, phu: `${cuoi ? b.ten + ' — ' : ''}${b.knTen} — ${b.mo}`, t: 0, T: 3.2, boss: 1 };
      A.rung = S.rung = 0.6;
    } else bao = { chu: `WAVE ${w}/${COOP.DOT_MAX}`, phu: '', t: 0, T: 1.4 };
    A.bao = bao; S.bao = Object.assign({}, bao);
  }
  // loại quái kế tiếp: TINH ANH đúng lịch (S.eliteLich = các giá trị conSinh), còn lại bọ theo trọng số (QUAI.nang, mở từ wave QUAI.tu)
  function chonQuai(S) {
    const w = Math.max(1, S.dot);
    if (S.eliteLich && S.eliteLich.includes(S.conSinh)) return pick(ELITE_IDS);
    const ds = BO_IDS.filter((k) => Q[k].tu <= w); let tong = 0; for (const k of ds) tong += Q[k].nang;
    let r = rnd() * tong; for (const k of ds) { r -= Q[k].nang; if (r < 0) return k; }
    return ds[0];
  }
  const lichElite = (w, N) => { const n = Math.min(N, ELITE.so(w)), ds = []; for (let j = 0; j < n; j++) ds.push(Math.max(1, Math.round(N * (j + 1) / (n + 1)))); return ds; };
  function sinhCoop(S) {
    const w = S.dot, k = chonQuai(S), d = Q[k];
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
    q.ra = false; q.d = 0; q.daRa = true; q.linkT = 0; q.ban = S; q.jamO = -1;
    datViTri(S, q);
    S.quai.push(q);
  }
  // spd theo đơn vị cũ (px/giây trên đường ngang dài DAI_CU) → nhân P để thời gian đi hết làn như cũ; co (cỡ hình) nhân K
  function themQuai(S, kind, hp, spd, anh, co) {
    const q = { uid: S.nid++, kind, hp, max: hp, spd: spd * S.B.P, d: 0, x: 30, y: 0, cham: 0, choang: 0, anh, co, thuong: 0, khung: rnd() * 4,
      lech: (rnd() - 0.5) * 14, sinhT: S.t,
      chill: 0, chillT: 0, voLock: 0, nhietCD: 0, arcCD: 0, focusCD: 0, breachT: 0, breachK: false, breachEmp: 0, giatCD: 0,
      tox: 0, toxT: 0, toxDem: 0, toxLan: 0, toxNhan: 0, bounty: 0, bountyGT: 3, khien: 0, daKhien: 0, nhanhT: 0, nhanhK: 0, linkT: 0,
      luaT: 0, slowBang: 0, slowHut: 0, echo: false, ban: S };
    const e = Q[kind] && Q[kind].tinhAnh ? Q[kind] : null;
    if (e) {   // TINH ANH: hẹn giờ cơ chế riêng (lệch pha ngẫu nhiên để không đồng loạt)
      q.elite = e; q.lech = 0; q.tatT = 0;
      q.phanCD = e.chuKy ? e.chuKy * (0.5 + rnd() * 0.5) : 0; q.phanSan = false; q.lechT = 0; q.jamO = -1;
    }
    datViTri(S, q);
    S.quai.push(q);
    return q;
  }
  // ---- TINH ANH: cơ chế theo dữ liệu (QUAI[k].tinhAnh). phanCD = đếm ngược chu kỳ chung ----
  const TINH_ANH = {
    phanXa(S, q, e) {     // PRISM MANTIS: hết chu kỳ → sẵn sàng phản 1 đòn bắn (báo trước e.bao giây)
      if (!q.phanSan && q.phanCD <= 0) { q.phanSan = true; }
      q.bao = !q.phanSan && q.phanCD < e.bao;
    },
    gayNhieu(S, q, e) {   // JAMMER BEETLE: báo trước (đường đứt nét tới ô) rồi khoá kỹ năng 1 tướng e.T giây
      if (q.jamO < 0 && q.phanCD < e.bao) {
        const ds = S.o.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
        if (ds.length) q.jamO = pick(ds);
      }
      if (q.phanCD <= 0) {
        q.phanCD = e.chuKy;
        const v = q.jamO >= 0 ? S.o[q.jamO] : null;
        if (v) {
          if (afBat(S, 'tuongLua')) S.fx.push({ k: 'chan', t: 0, T: 0.5 });
          else { v.khoaT = e.T; S.fx.push({ k: 'hoada', i: q.jamO, t: 0, T: 0.5, mau: '#ff4d6d' }); }
        }
        q.jamO = -1;
      }
      q.bao = q.jamO >= 0;
    },
    apTrung() {},         // BROOD CARRIER: xử lý khi chết (chet)
    lechPha(S, q, e, dt) {   // PHASE CICADA: báo trước e.bao giây rồi lệch pha e.T giây (né đòn trực tiếp, vẫn dính DoT)
      if (q.lechT > 0) { q.lechT = Math.max(0, q.lechT - dt); q.bao = false; return; }
      if (q.phanCD <= 0) { q.phanCD = e.chuKy; q.lechT = e.T; }
      q.bao = q.phanCD < e.bao;
    },
  };
  function capNhatTinhAnh(S, q, dt) {
    const e = q.elite;
    if (q.tatT > 0) { q.tatT = Math.max(0, q.tatT - dt); q.bao = false; q.jamO = -1; q.phanSan = false; return; }   // GLITCH khoá: tắt cơ chế
    if (!q.phanSan && !(q.lechT > 0)) q.phanCD -= dt;
    const f = TINH_ANH[e.tinhAnh]; if (f) f(S, q, e, dt);
  }
  function sinh(S) {
    const w = S.dot, k = chonQuai(S), d = Q[k];
    const q = themQuai(S, k, C.mauDot(w) * d.hp, d.spd * (1 + Math.min(0.35, w * 0.006)), null, d.co);
    q.thuong = d.thuong + Math.floor(w / 6);
  }

  // ======== ĐÁNH: ghép từ các LOẠI HÀNH VI có tham số (dữ liệu trong TUONG ở data.js) ========
  const sống = (q) => q.hp > 0 && !q.ra;
  const nham = (q) => sống(q) && q.daRa;   // vừa ra khỏi cổng (đang hiện hình) thì chưa bắn được
  const kc = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const heSo = (S, v) => C.heSoSao(v.sao) * C.heSoBac(S.bac[v.id] || 0) * (v.hs || 1);
  const ganNhau = (S, q, r) => { let n = 0; for (const o of S.quai) if (o !== q && nham(o) && kc(o, q) < r) n++; return n; };
  const trongHut = (S, q) => S.vung.some((z) => z.k === 'hut' && kc(z, q) < z.r);
  // quái đang mang hiệu ứng k? (dùng cho mục tiêu 'chuaHieu' + biểu tượng trạng thái)
  const coHieu = (q, k) => (k === 'chill' ? q.chill > 0 : k === 'hack' ? q.breachT > 0 : k === 'doc' ? q.tox > 0 : k === 'chay' ? q.chayT > 0 : false);
  const lonNhat = (DS, f) => { let b = null, bv = -Infinity; for (const o of DS) { const x = f(o); if (x > bv) { bv = x; b = o; } } return b; };

  // MUC — cách chọn mục tiêu (DCDW: mỗi tướng một kiểu: đi đầu / ngẫu nhiên / máu cao...)
  const MUC = {
    dau: (S, DS) => lonNhat(DS, (o) => o.d),                                             // quái đi đầu
    cuoi: (S, DS) => lonNhat(DS, (o) => -o.d),                                           // quái đi cuối (xa đích nhất)
    gan: (S, DS, v, td, i) => { const [x, y] = oTam(S, i); return lonNhat(DS, (o) => -Math.hypot(o.x - x, o.y - y)); },   // gần tướng nhất
    dongQuai: (S, DS) => lonNhat(DS, (o) => ganNhau(S, o, 60 * K) * 1e5 + o.d),          // giữa đám đông nhất
    mauCao: (S, DS) => lonNhat(DS, (o) => o.hp),                                          // máu cao nhất (ưu tiên trùm)
    mauThap: (S, DS) => lonNhat(DS, (o) => -o.hp),                                        // máu thấp nhất
    mauDay: (S, DS) => lonNhat(DS, (o) => o.hp / o.max * 1e3 + o.d * 1e-3),              // còn nhiều % máu nhất
    chuaHieu: (S, DS, v, td) => lonNhat(DS.filter((o) => !coHieu(o, td.mucHieu)), (o) => o.d) || lonNhat(DS, (o) => o.d),   // đi đầu chưa dính hiệu ứng
    ngauNhien: (S, DS, v) => (v.mucNN && DS.includes(v.mucNN) ? v.mucNN : (v.mucNN = pick(DS))),   // ngẫu nhiên (giữ tới khi mục tiêu chết)
  };
  // như Defense War: mọi tướng trên bàn bắn được mọi quái trên làn của CHÍNH bàn đó (S.quai chỉ chứa quái làn này) — không giới hạn tầm
  function chonMuc(S, i, v) {
    const DS = S.quai.filter(nham); if (!DS.length) return null;
    const td = T[v.id], f = MUC[td.muc] || MUC.dau;
    return f(S, DS, v, td, i);
  }

  function trung(S, q, dmg, v, mau, chiSo, an, treo) {
    if (!sống(q) || !(dmg > 0)) return;
    let k = 1;
    if (q.breachT > 0) k += q.boss ? q.breachThem * 0.5 : q.breachThem;   // HACK: lộ điểm yếu, nhận thêm sát thương (trùm một nửa)
    dmg *= k;
    if (q.khien > 0) { const a = Math.min(q.khien, dmg); q.khien -= a; dmg -= a; }
    if (q.kenHp > 0) {   // CORRUPTOR COCOON: phá kén trước khi hết giờ, không thì trùm hồi máu
      const a = Math.min(q.kenHp, dmg); q.kenHp -= a; dmg -= a;
      if (q.kenHp <= 0) { q.kenT = 0; S.fx.push({ k: 'vo', x: q.x, y: q.y - q.co / 2, r: q.co * 0.7, t: 0, T: 0.35 }); S.so.push({ x: q.x + 14, y: q.y - q.co, v: 'COCOON BROKEN', t: 0, mau: '#e2ccff', to: 1 }); }
    }
    if (v && v.tk) v.tk[v.id] = (v.tk[v.id] || 0) + Math.min(dmg, q.hp);   // thống kê sát thương thật (không tính phần tràn)
    q.hp -= dmg;
    if (q.linkT > 0 && S.boss && S.boss.linkCap > 0) { const b = S.boss, h = Math.min(dmg * 0.3, b.linkCap); b.linkCap -= h; b.hp = Math.min(b.max, b.hp + h); }
    if (!an) {   // số sát thương nổi: tối đa 3 số / mục tiêu (bỏ số cũ nhất), đòn mạnh màu hổ phách
      let n = 0, cu = -1;
      for (let j = 0; j < S.so.length; j++) if (S.so[j].q === q.uid) { if (cu < 0) cu = j; n++; }
      if (n >= 3) S.so.splice(cu, 1);
      S.so.push({ q: q.uid, x: q.x + 8 + (rnd() - 0.5) * 8, y: q.y - q.co * 0.8, v: Math.round(dmg), t: 0, mau, to: chiSo, T: 0.55 });
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
    if (q.bounty > 0 && S.bountyDot < 18) {   // hành vi truyNa: thưởng thêm Energy, trần 18/đợt
      const n = Math.min(q.bountyGT + (q.breachT > 0 ? 1 : 0), 18 - S.bountyDot);
      lk += n; S.bountyDot += n; S.fx.push({ k: 'tien', x: q.x, y: q.y - q.co / 2, t: 0, T: 0.5 });
    }
    if (v && v.giaoT > 0 && !q.echo) lk += v.giaoThem || 0;   // BROKER TRADE: tướng được giao dịch hạ quái → thêm Energy
    if (!q.echo) S.o.forEach((o, j) => {   // BROKER: quái chết trong vùng quanh ô → Energy (nghỉ ngắn giữa 2 lần)
      const d = o && T[o.id].dac; if (!d || d.k !== 'moiGioi' || o.khoaT > 0 || (o.mgT || 0) > S.t) return;
      const [x, y] = oTam(S, j); if (Math.hypot(q.x - x, q.y - y) > d.vung * C.BUOC_X) return;
      o.mgT = S.t + d.nghi; const n = theoSao(d.luong, o.sao); lk += n; S.fx.push({ k: 'tien', x: q.x, y: q.y - q.co / 2, t: 0, T: 0.5 });
    });
    if (lk > 0) { S.lk += lk; S.so.push({ x: q.x, y: q.y - q.co, v: '+' + lk, t: 0, mau: '#ffe27a', lk: 1 }); }
    S.giet++;
    if (q.elite && q.elite.tinhAnh === 'apTrung') {   // BROOD CARRIER: chết tách DART máu thấp
      const d = Q.dart, goc = q.max / q.elite.hp;
      for (let n = 0; n < q.elite.con; n++) {
        const e = themQuai(S, 'dart', goc * d.hp * q.elite.conHp, d.spd * (q.spd / S.B.P) / q.elite.spd, null, d.co);
        e.thuong = 1; e.daRa = true; e.d = Math.max(0, q.d - n * 8 * S.B.P); e.lech = (n - 1) * 7; datViTri(S, e);
      }
      S.fx.push({ k: 'xung', x: q.x, y: q.y - 10, t: 0, T: 0.4 });
    }
    S.fx.push({ k: 'no', x: q.x, y: q.y - q.co / 2, t: 0, T: 0.4, r: q.co * 0.6 });
    if (q.tox >= 3 && !q.toxLan && q.toxV && q.toxCfg) {   // hành vi doc: quái chết khi còn ≥3 tầng độc → lan sang quái gần
      const tv = q.toxV, cf = q.toxCfg, n = theoSao(cf.lan, tv.sao) || 0;
      const ds = S.quai.filter((o) => o !== q && sống(o) && o.toxNhan <= 0 && kc(o, q) < 50 * K)
        .sort((a, b) => (trongHut(S, b) - trongHut(S, a)) || (kc(a, q) - kc(b, q))).slice(0, n);
      for (const o of ds) { o.tox = Math.min(theoSao(cf.max, tv.sao), o.tox + 2); o.toxT = theoSao(cf.T, tv.sao); o.toxV = tv; o.toxCfg = cf; o.toxLan = 1; o.toxNhan = 2; }
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
  // đòn TRỰC TIẾP bị chặn? PHASE CICADA lệch pha (né mọi đòn trực tiếp), PRISM MANTIS phản xạ 1 đòn BẮN (đạn/tia) mỗi chu kỳ.
  // DoT / vùng / nảy sét không bị chặn. Không phản sát thương về tướng.
  function chanTruc(S, q, chem) {
    if (!q.elite || q.tatT > 0) return false;
    if (q.lechT > 0) { S.so.push({ q: q.uid, x: q.x + 10, y: q.y - q.co, v: 'MISS', t: 0, mau: '#c9a2ff', T: 0.45 }); return true; }
    if (q.phanSan && !chem) {
      q.phanSan = false; q.phanCD = q.elite.chuKy;
      S.fx.push({ k: 'phan', x: q.x, y: q.y - q.co / 2, r: q.co * 0.6, t: 0, T: 0.3 });
      S.so.push({ q: q.uid, x: q.x + 10, y: q.y - q.co, v: 'REFLECT', t: 0, mau: '#bff6ff', T: 0.55 });
      return true;
    }
    return false;
  }
  function bayDan(S, x, y, q, dmg, v, mau, spd, them) { S.dan.push(Object.assign({ x, y, q, dmg, v, mau, id: v.id, spd, x0: x, y0: y, goc: Math.atan2(q.y - q.co / 2 - y, q.x - x) }, them || {})); }
  // ---- HIỂN THỊ TƯỚNG (dùng chung với render.js để đạn ra ĐÚNG đầu nòng trong ảnh) ----
  // hg: 0=E 1=SE 2=S 3=SW 4=W 5=NW 6=N 7=NE → [hướng ảnh vẽ, lật gương]; thiếu hướng → hướng gần nhất có ảnh (GLITCH: sw→s, nw→n)
  const HG_ANH = [['w', true], ['sw', true], ['s', false], ['sw', false], ['w', false], ['nw', false], ['n', false], ['nw', true]];
  const LUI = { s: ['s', 'sw', 'w'], sw: ['sw', 's', 'w'], w: ['w', 'sw', 'nw', 's'], nw: ['nw', 'n', 'w'], n: ['n', 'nw', 'w'] };
  function huongAnh(id, hg) {
    const td = T[id], [g, lat] = HG_ANH[hg == null ? 2 : hg];
    const d = LUI[g].find((h) => !td.nong || td.nong[h]) || 's';
    return [d, lat];
  }
  // tỉ lệ hiển thị ảnh 112×112: phần hình hướng S cao TUONG_CAO × co (× 1.00–1.06 theo sao), không vượt đỉnh ô
  const KHUNG_MD = [26, 22, 85, 104];
  function tiLeHien(v) {
    const td = T[v.id], k = td.khung || KHUNG_MD, cao = Math.min(C.OH - C.CHAN - 1, C.TUONG_CAO * (td.co || 1) * (1 + 0.01 * ((v.sao || 1) - 1)));
    return Math.min(cao / (k[3] - k[1] + 1), C.TUONG_RONG / (k[2] - k[0] + 1));
  }
  // điểm chân + giữa thân tướng trong ô
  const chanY = (oy) => oy + C.OH - C.CHAN;
  const thanY = (oy) => chanY(oy) - C.TUONG_CAO / 2;
  // ĐIỂM ĐẦU NÒNG (toạ độ logic): bảng TUONG[id].nong (ảnh 112, đáy phần hình y=104 = chân), hướng lật gương đối xứng x
  function nong(S, i, v) {
    const [ox, oy] = oXY(S, i), cx = ox + C.O / 2, ch = chanY(oy), td = T[v.id];
    if (td.xoay) {   // drone: đầu nòng cách tâm r × cạnh hình theo góc bắn
      const h = C.TUONG_CAO * (td.co || 1), g = v.goc == null ? Math.PI / 2 : v.goc, r = ((td.nong && td.nong.r) || 0.4) * h;
      return [cx + Math.cos(g) * r, ch - h / 2 + Math.sin(g) * r];
    }
    const [d, lat] = huongAnh(v.id, v.hg), m = (td.nong && td.nong[d]) || [56, 60], sc = tiLeHien(v);
    return [cx + (m[0] - 56) * sc * (lat ? -1 : 1), ch - (105 - m[1]) * sc];
  }
  // ---- HƯỚNG QUAY 8 hướng theo quái (kiểu Destiny Child: Defense War) ----
  // hg: 0=E 1=SE 2=S 3=SW 4=W 5=NW 6=N 7=NE (toạ độ màn hình, y xuống dưới); goc: góc liên tục (rad) cho tướng xoay bằng code
  const HG = { TRE: 0.12, HYS: 10, VE_S: 0.8, LERP: 10, NHIN: 0.05 };
  const gocTo = (S, i, q) => { const [ox, oy] = oXY(S, i); return Math.atan2(q.y - thanY(oy), q.x - (ox + C.O / 2)); };   // từ giữa thân tướng tới quái
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
    if (dich != null) {   // tướng xoay bằng code: góc mượt (lerp ~10/s), vẫn quay khi đang đánh
      let d = dich - v.goc; d = Math.atan2(Math.sin(d), Math.cos(d));
      v.goc += d * (1 - Math.exp(-HG.LERP * dt));
    }
  }
  // tên skill VÀNG/ĐỎ khi kích hoạt: chớp vòng ngắn + chữ tên 0.6s (render 'ky')
  const baoSkill = (S, i, ten) => S.fx.push({ k: 'ky', i, ten, t: 0, T: 0.6 });

  // DON — kiểu ra đòn. (S, i, v, q, dmg, cfg) — cfg = TUONG[id].don
  const DON = {
    dan(S, i, v, q, dmg, cfg) {   // đạn bay (so viên; hiệu ứng khi trúng chỉ gắn ở viên cuối)
      const [x, y] = nong(S, i, v), so = cfg.so || 1, mau = HANH[T[v.id].hanh].mau;
      for (let n = 0; n < so; n++) bayDan(S, x - n * 5, y + n * 3, q, dmg, v, mau, (cfg.toc || 800) * (n ? 0.92 : 1), { hieu: n === so - 1 });
    },
    chem(S, i, v, q, dmg) {       // đánh ngay (cận chiến / tia điện tức thời), không đạn
      const mau = HANH[T[v.id].hanh].mau;
      if (chanTruc(S, q, true)) return;
      trung(S, q, dmg, v, mau);
      S.fx.push({ k: 'chem', x: q.x, y: q.y - q.co / 2, t: 0, T: 0.14, mau });
      apHieu(S, q, dmg, v);
    },
    tia(S, i, v, q, dmg, cfg, he) {   // tia tức thời DỪNG Ở MỤC TIÊU; xuyên = số quái kế sau trên làn (đi sau mục tiêu) nhận 40% / 25%
      const [x, y] = nong(S, i, v), mau = HANH[T[v.id].hanh].mau, xuyen = theoSao(cfg.xuyen, v.sao) || 0, manh = he > 1;
      S.hitStop = Math.max(S.hitStop || 0, C.HIT_STOP.tia); S.rung = Math.max(S.rung || 0, 0.05);
      const chan = chanTruc(S, q);
      if (!chan) trung(S, q, dmg * (he || 1), v, mau, true);
      const sau = S.quai.filter((o) => o !== q && nham(o) && o.d < q.d).sort((a, b) => b.d - a.d).slice(0, xuyen);
      sau.forEach((o, n) => trung(S, o, dmg * (he || 1) * (manh ? 0.6 : n === 0 ? 0.4 : 0.25), v, mau, manh));
      S.fx.push({ k: 'rail', x0: x, y0: y, x1: q.x, y1: q.y - q.co / 2, t: 0, T: manh ? 0.18 : 0.12, mau, focus: manh, sau: sau.map((o) => [o.x, o.y - o.co / 2]) });
      if (!chan) apHieu(S, q, dmg, v);
    },
  };
  // HIEU — hiệu ứng khi trúng (TRẮNG/LAM/TÍM dùng lại được). (S, q, dmg, v, cfg, hs) — cfg = 1 mục trong TUONG[id].hieu
  const HIEU = {
    chay(S, q, dmg, v, cf, hs) {   // LỬA: để lại vệt cháy trên làn, đốt n quái / 0.5s
      S.vung.push({ k: 'lua', x: q.x, y: q.y, r: theoSao(cf.r, v.sao) * K, t: 0, T: theoSao(cf.T, v.sao), dmg: cf.dps * 0.5 * hs, n: theoSao(cf.n, v.sao), tick: 0, v });
    },
    bang(S, q, dmg, v, cf) {       // BĂNG: tích tầng lạnh (chậm cham × tầng); đủ max tầng → vỡ băng gây sát thương vùng
      if (q.voLock > 0) return;
      q.chill = Math.min(cf.max, q.chill + 1); q.chillT = theoSao(cf.T, v.sao); q.chillK = theoSao(cf.cham, v.sao);
      if (q.chill >= cf.max) {
        const r = theoSao(cf.voR, v.sao) * K;
        q.chill = 0; q.chillT = 0; q.voLock = 1.5;
        for (const o of S.quai) if (sống(o) && kc(o, q) < r) trung(S, o, dmg * cf.voDmg, v, HANH[T[v.id].hanh].mau);
        S.fx.push({ k: 'vo', x: q.x, y: q.y - q.co / 2, r, t: 0, T: 0.35 });
      }
    },
    doc(S, q, dmg, v, cf) {        // ĐỘC: cộng tầng độc (dps mỗi tầng), quái chết khi ≥3 tầng → lan (xem chet)
      q.tox = Math.min(theoSao(cf.max, v.sao), q.tox + (cf.moi || 1)); q.toxT = theoSao(cf.T, v.sao); q.toxV = v; q.toxCfg = cf; q.toxLan = 0;
    },
    hack(S, q, dmg, v, cf) {       // HACK: mỗi `moi` đòn → lộ điểm yếu (nhận thêm sát thương) + choáng ngắn (quái thường)
      v.trungDem = (v.trungDem || 0) + 1;
      if (v.trungDem % cf.moi) return;
      q.breachT = theoSao(cf.T, v.sao); q.breachThem = theoSao(cf.them, v.sao); q.breachV = v;
      if (!q.boss && q.giatCD <= 0) { q.choang = Math.max(q.choang, cf.choang || 0); q.giatCD = 5; }
      S.fx.push({ k: 'emp', x: q.x, y: q.y - q.co / 2, r: 22 * K, t: 0, T: 0.2 });
    },
    chuoi(S, q, dmg, v, cf) {      // SÉT: mỗi `moi` đòn → nảy sang `nhay` quái gần (he × sát thương)
      if ((v.dem || 0) % cf.moi) return;
      S.hitStop = Math.max(S.hitStop || 0, C.HIT_STOP.chuoi);
      const nhay = theoSao(cf.nhay, v.sao), r = theoSao(cf.r, v.sao) * K, mau = HANH[T[v.id].hanh].mau;
      const pts = [[q.x, q.y - q.co / 2]], da = new Set([q]); let cur = q;
      for (let n = 0; n < nhay; n++) {
        const ds = S.quai.filter((o) => nham(o) && !da.has(o) && kc(o, cur) < r).sort((a, b) => kc(a, cur) - kc(b, cur));
        if (!ds.length) break;
        cur = ds[0]; da.add(cur); pts.push([cur.x, cur.y - cur.co / 2]);
        trung(S, cur, dmg * cf.he, v, mau);
      }
      if (pts.length > 1) S.fx.push({ k: 'set', pts, t: 0, T: 0.22, mau });
    },
    hut(S, q, dmg, v, cf) {        // HÚT: mỗi `moi` đòn → mở trường hút gom quái về một điểm
      v.hutDem = (v.hutDem || 0) + 1;
      if (v.hutDem % theoSao(cf.moi, v.sao)) return;
      S.vung.push({ k: 'hut', x: q.x, y: q.y, dTam: q.d, r: theoSao(cf.r, v.sao) * K, t: 0, T: theoSao(cf.T, v.sao), no: 0, v, lui: new Map(), toi: new Map() });
    },
    khoa(S, q, dmg, v, cf) {       // GLITCH: mỗi đòn ĐÁNH DẤU (nhận thêm danhDau sát thương T giây); mỗi `moi` đòn KHOÁ 1 quái không phải trùm
      const da = q.breachT > 0; q.breachThem = da ? Math.max(q.breachThem || 0, cf.danhDau) : cf.danhDau; q.breachT = Math.max(q.breachT, cf.T); q.breachV = v;
      v.khoaDem = (v.khoaDem || 0) + 1;
      if (v.khoaDem % cf.moi || q.boss) return;
      q.choang = Math.max(q.choang, theoSao(cf.choang, v.sao));
      if (q.elite) q.tatT = Math.max(q.tatT || 0, cf.tatElite || 0);   // tinh anh: tắt cơ chế riêng vài giây
      S.fx.push({ k: 'emp', x: q.x, y: q.y - q.co / 2, r: 22 * K, t: 0, T: 0.25 });
      S.so.push({ q: q.uid, x: q.x + 10, y: q.y - q.co, v: 'LOCK', t: 0, mau: '#00ffa3', T: 0.6 });
    },
    truyNa(S, q, dmg, v, cf) {     // TRUY NÃ: mỗi `moi` đòn → gắn thưởng (quái chết trong thời hạn cho thêm Energy)
      v.naDem = (v.naDem || 0) + 1;
      if (v.naDem % cf.moi) return;
      if (!q.echo) { q.bounty = theoSao(cf.T, v.sao); q.bountyGT = theoSao(cf.gt, v.sao); }
    },
  };
  function apHieu(S, q, dmg, v) {
    if (!sống(q) || v.khoaT > 0) return;   // bị JAMMER khoá kỹ năng: chỉ còn đòn thường
    const hs = heSo(S, v);
    for (const cf of T[v.id].hieu || []) if (HIEU[cf.k]) HIEU[cf.k](S, q, dmg, v, cf, hs);
  }
  // DAC_BIET — skill riêng VÀNG/ĐỎ. Mỗi loại có thể có: moiDon (thay đòn thường khi tới lượt, trả true), capNhat (mỗi khung), khiGop (khi ghép 2 tướng loại này)
  const DAC_BIET = {
    taoMana: {   // (Syrinx DCDW) tạo Energy mỗi chuKy giây: luong theo sao × (1 + theoLv × cấp nâng)
      capNhat(S, i, v, dt, cf) {
        v.manaT = (v.manaT || 0) + dt;
        if (v.manaT < cf.chuKy) return;
        v.manaT = 0;
        const n = Math.round(theoSao(cf.luong, v.sao) * (1 + (cf.theoLv || 0) * (S.bac[v.id] || 0)));
        S.lk += n; baoSkill(S, i, cf.ten);
        const [x, y] = oTam(S, i); S.so.push({ x: x + 14, y: y + 10, v: '+' + n, t: 0, mau: '#ffe27a', lk: 1 });
      },
    },
    cayGhep: {   // (Brownie DCDW) ghép 2 tướng này: cả 2 biến mất, 1 đồng minh KHÁC LOẠI cùng sao được +1 sao (giữ nguyên loại); không có thì ghép thường
      khiGop(S, a, b, cf) {
        const sao = S.o[b].sao, id = S.o[b].id;
        const ds = S.o.map((v, j) => j).filter((j) => S.o[j] && j !== a && j !== b && S.o[j].id !== id && S.o[j].sao === sao && sao < C.SAO_MAX && !S.o[j].da);
        if (!ds.length) return false;
        const j = pick(ds), cu = S.o[j];
        S.fx.push({ k: 'gop', i: j, tu: b, cu: [chup(S.o[b]), chup(cu)], t: 0, T: 0.6, sao: sao + 1 });
        S.fx.push({ k: 'gop', i: b, tu: a, cu: [chup(S.o[a]), null], t: 0, T: 0.3, sao: 0, an: true });
        S.o[a] = null; S.o[b] = null;
        S.o[j] = taoTuong(S, cu.id, sao + 1, { cd: 0.3, moi: 0.5, kieuSinh: 'gop', hg: cu.hg, goc: cu.goc });
        baoSkill(S, j, cf.ten);
        return 'gop';
      },
    },
    phatNap: {   // (ĐỎ) mỗi `moi` đòn: phát nạp he × sát thương, xuyên `xuyen` quái, kết liễu quái thường dưới ketLieu % máu
      moiDon(S, i, v, q, dmg, cf) {
        if (cf.tuSao && v.sao < cf.tuSao) return false;
        if ((v.dem || 0) % cf.moi) return false;
        const he = theoSao(cf.he, v.sao), kl = theoSao(cf.ketLieu, v.sao) || 0;
        DON.tia(S, i, v, q, dmg, { xuyen: cf.xuyen }, he);
        if (kl > 0) for (const o of S.quai) if (sống(o) && !o.boss && o.hp / o.max < kl) { const mau = HANH[T[v.id].hanh].mau; trung(S, o, o.hp + 1, v, mau, true); }
        baoSkill(S, i, cf.ten);
        return true;
      },
    },
  };
  function ban(S, i, v) {
    const td = T[v.id], dmg = satThuong(S, v);
    const q = chonMuc(S, i, v);
    if (!q) return false;
    const [cx] = oTam(S, i);
    v.dem = (v.dem || 0) + 1; v.huong = q.x < cx - 4 ? -1 : 1; v.banT = S.t;   // banT: render giật lùi + chớp nòng + ảnh atk
    const dac = td.dac, db = dac && DAC_BIET[dac.k];
    if (db && db.moiDon && !(v.khoaT > 0) && db.moiDon(S, i, v, q, dmg, dac)) return true;
    (DON[td.don && td.don.k] || DON.dan)(S, i, v, q, dmg, td.don || {});
    return true;
  }
  function trungDan(S, d) {
    const q = d.q;
    if (!sống(q) || chanTruc(S, q)) return;
    trung(S, q, d.dmg, d.v, d.mau);
    if (d.hieu) apHieu(S, q, d.dmg, d.v);
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
    if (S.af) { if (S.af.cdT > 0) S.af.cdT = Math.max(0, S.af.cdT - dt); if (S.af.T > 0) S.af.T = Math.max(0, S.af.T - dt); }
    const tocAF = afBat(S, 'tocDanh') ? 1 + ARCHFIEND[S.af.id].he : 1;   // Archfiend OVERCLOCK: cả bàn đánh nhanh hơn
    // tướng
    S.o.forEach((v, i) => {
      if (!v) return;
      if (v.moi > 0) v.moi -= dt;
      if (v.danh > 0) v.danh -= dt;
      if (v.nong > 0) v.nong = Math.max(0, v.nong - dt);
      if (v.corrT > 0) v.corrT = Math.max(0, v.corrT - dt);
      for (const f of ['khoaT', 'giaoT', 'buffT']) if (v[f] > 0) v[f] = Math.max(0, v[f] - dt);
      if (v.kyCD) for (const n in v.kyCD) if (v.kyCD[n] > 0) v.kyCD[n] = Math.max(0, v.kyCD[n] - dt);
      capNhatHuong(S, i, v, dt);
      const dac = T[v.id].dac, db = dac && DAC_BIET[dac.k];
      if (db && db.capNhat && !(v.khoaT > 0)) db.capNhat(S, i, v, dt, dac);   // skill riêng chạy theo thời gian (vd. tạo Energy)
      // trùm FIREWALL FIRE ROW (nong) / CORRUPTOR INFECTION (corrT): bắn chậm 40%; GLITCH COPY: +buffK tốc đánh
      v.cd -= dt * tocAF * (v.buffT > 0 ? 1 + (v.buffK || 0) : 1) / (v.nong > 0 || v.corrT > 0 ? 1.67 : 1);
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
          for (const q of S.quai) { if (n >= z.n) break; if (sống(q) && q.luaT <= S.t && kc(q, z) < r) { q.luaT = S.t + 0.5; q.chayT = 0.6; n++; trung(S, q, z.dmg, z.v, '#ff9a50', false, true); } }
        }
      } else if (z.k === 'hut') {
        for (const q of S.quai) {
          if (!sống(q) || kc(q, z) >= z.r) continue;
          if (q.boss) { q.slowHut = Math.max(q.slowHut, 0.08); continue; }
          const P = S.B.P, del = z.dTam - q.d, b = Math.min(Math.abs(del), 40 * P * dt) * (1 - ((Q[q.kind] && Q[q.kind].chongDay) || 0));   // SHELL chống đẩy
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
      for (const f of ['chayT', 'chillT', 'voLock', 'nhietCD', 'arcCD', 'focusCD', 'giatCD', 'toxNhan', 'bounty', 'nhanhT', 'linkT']) if (q[f] > 0) q[f] = Math.max(0, q[f] - dt);
      if (q.chillT <= 0) q.chill = 0;
      if (q.breachT > 0) q.breachT = Math.max(0, q.breachT - dt);
      if (q.toxT > 0) {   // ĐỘC: dps mỗi tầng (theo hệ số sao/cấp của tướng gây độc)
        q.toxT -= dt; q.toxDem += q.tox * ((q.toxCfg && q.toxCfg.dps) || 3) * heSo(S, q.toxV) * dt;
        if (q.toxDem >= 1) { const n = q.toxDem; q.toxDem = 0; trung(S, q, n, q.toxV, '#b4ff2a', false, true); }
        if (q.toxT <= 0) { q.tox = 0; q.toxDem = 0; }
      }
      if (!sống(q)) continue;
      if (q.linkT > 0 && (!S.boss || kc(q, S.boss) > 180 * K)) q.linkT = 0;
      const sl = Math.max(q.chill * (q.chillK || 0.10) * (q.boss ? 0.5 : 1), q.slowBang, q.slowHut);
      q.cham = Math.min(q.boss ? 0.30 : 0.45, sl); q.slowBang = 0; q.slowHut = 0;
      if (q.choang > 0) { q.choang -= dt; continue; }
      q.d += q.spd * (1 - q.cham) * (q.nhanhT > 0 ? 1 + q.nhanhK : 1) * dt;
      datViTri(S, q);
      if (!q.daRa && q.d >= 26 * S.B.P) q.daRa = true;
      if (q.boss) kyNangBoss(S, q, dt);
      if (q.elite) capNhatTinhAnh(S, q, dt);
      if (q.khienT > 0) { q.khienT -= dt; if (q.khienT <= 0) q.khien = 0; }   // FIREWALL SHIELD WALL hết giờ
      if (q.kenT > 0) {   // CORRUPTOR COCOON: hết giờ mà kén chưa vỡ → hồi máu
        q.kenT -= dt;
        if (q.kenT <= 0 && q.kenHp > 0) { const h = q.max * (q.kenHoi || 0.08); q.hp = Math.min(q.max, q.hp + h); q.kenHp = 0; S.so.push({ x: q.x + 14, y: q.y - q.co, v: '+' + Math.round(h), t: 0, mau: '#7dff9a', to: 1 }); }
      }
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
    const te = { k: kn.k, ten: kn.ten, t: 0, T: kn.tele, kn };
    const co = S.o.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
    if (kn.k === 'lockdown') {   // chọn hàng có tổng DPS cao nhất
      let best = 0, bd = -1;
      for (let r = 0; r < C.HANG; r++) { let s = 0; for (let c2 = 0; c2 < C.COT; c2++) { const v = S.o[r * C.COT + c2]; if (v) s += dpsO(S, v); } if (s > bd) { bd = s; best = r; } }
      te.hang = best;
    } else if (kn.k === 'infect') {
      const ds = co.slice(); te.o = [];
      while (ds.length && te.o.length < (kn.so || 3)) te.o.push(ds.splice(Math.floor(rnd() * ds.length), 1)[0]);
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
    const kn = te.kn || {};
    if (te.k === 'khien') {   // FIREWALL SHIELD WALL: khiên trước thân kn.T giây (đòn xuyên / độc vẫn có ích)
      q.khien = q.max * (kn.luong || 0.12); q.khienT = kn.T || 4;
    } else if (te.k === 'tangToc') {   // OVERCLOCK OVERDRIVE: tự tăng tốc
      q.nhanhT = kn.T || 4; q.nhanhK = kn.he || 0.5;
      S.fx.push({ k: 'xung', x: q.x, y: q.y - q.co / 2, t: 0, T: 0.6 });
    } else if (te.k === 'ken') {   // CORRUPTOR COCOON: kén (máu kn.hp × max) — không phá trong kn.T giây thì hồi kn.hoi × max
      q.kenHp = q.max * (kn.hp || 0.05); q.kenMax = q.kenHp; q.kenT = kn.T || 4; q.kenHoi = kn.hoi || 0.08;
    } else if (te.k === 'lockdown') {   // 2 ô có tướng trong hàng: bắn chậm 40% (không câm hẳn)
      const dur = Math.min(3.1, 2.5 + 0.3 * vg);
      let ds = [];
      for (let c2 = 0; c2 < C.COT; c2++) { const i = te.hang * C.COT + c2; if (S.o[i]) ds.push(i); }
      ds.sort((a, b) => dpsO(S, S.o[b]) - dpsO(S, S.o[a]));
      if (ds.length > 2 && ds[0] === q.lastLock) ds.push(ds.shift());
      ds = ds.slice(0, 2);
      if (afBat(S, 'tuongLua')) { S.fx.push({ k: 'chan', t: 0, T: 0.5 }); ds = []; }   // Archfiend FIREWALL đang bật: chặn
      for (const i of ds) { S.o[i].nong = dur; S.o[i].dauT = S.t; S.fx.push({ k: 'hoada', i, t: 0, T: 0.6 }); }
      if (ds.length) q.lastLock = ds[0];
    } else if (te.k === 'ember') {
      S.vung.push({ k: 'ember', d0: q.d, d1: q.d + 100 * S.B.P, t: 0, T: 3 });
    } else if (te.k === 'surge') {
      const dur = kn.T || Math.min(3.9, 3 + 0.3 * vg);
      for (const o of S.quai) if (sống(o) && !o.boss) { o.nhanhT = dur; o.nhanhK = 0.35; }   // CLOCK PULSE: chỉ tăng tốc bọ con
      S.fx.push({ k: 'xung', x: q.x, y: q.y - q.co / 2, t: 0, T: 0.6 });
    } else if (te.k === 'split') {
      const con = S.quai.filter((o) => sống(o) && o.echo).length;
      for (let n = 0; n < Math.min(2, 4 - con); n++) {
        const hp = Math.min(q.hp * 0.12, q.max * 0.10);
        const e = themQuai(S, 'dart', hp, Q.dart.spd, null, Q.dart.co);
        e.echo = true; e.thuong = 0; e.daRa = true; e.d = Math.max(26 * S.B.P, q.d - (6 + n * 10) * S.B.P); datViTri(S, e);
        S.fx.push({ k: 'xung', x: e.x, y: e.y - 10, t: 0, T: 0.4 });
      }
    } else if (te.k === 'infect') {
      const dur = kn.T || Math.min(4.6, 4 + 0.3 * vg);
      if (afBat(S, 'tuongLua')) { S.fx.push({ k: 'chan', t: 0, T: 0.5 }); return; }   // Archfiend FIREWALL đang bật: chặn
      for (const i of te.o) if (S.o[i]) { S.o[i].corrT = dur; S.o[i].dauT = S.t; S.fx.push({ k: 'hoada', i, t: 0, T: 0.6, mau: '#c04dff' }); }
    } else if (te.k === 'link') {
      q.linkCap = q.max * 0.06;
      for (const o of te.ds) if (sống(o) && kc(o, q) <= 180 * K) o.linkT = 4;
    }
  }

  // ---- bot dùng Archfiend: FIREWALL khi ≥2 tướng dính hiệu ứng trùm (hoặc trùm sắp tung chiêu lên tướng); OVERCLOCK khi có trùm / ≥8 quái ----
  function botAF(S) {
    const a = S.af; if (!a || a.cdT > 0 || a.T > 0 || S.lk < giaAF(S)) return false;
    const cfg = ARCHFIEND[a.id], te = S.boss && S.boss.tele;
    const nen = cfg.k === 'tuongLua' ? S.o.filter((v) => v && (v.nong > 0 || v.corrT > 0)).length >= 2 || !!(te && (te.k === 'lockdown' || te.k === 'infect'))
      : !!S.boss || S.quai.filter(sống).length >= 8;
    return nen && dungAF(S);
  }
  // ---- bot bàn AI MIRROR: mỗi 2–3 giây triệu hồi nếu đủ Energy, rồi ghép cặp đầu tiên tìm được; dư nhiều thì nâng cấp ----
  function botAI(S, dt) {
    if (S.het) return;
    S.botT = (S.botT == null ? 2 : S.botT) - dt;
    if (S.botT > 0) return;
    S.botT = 2 + rnd();
    if (botAF(S)) return;
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
    if (botAF(S)) return;
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
    giaAF, dungAF, afBat, coHieu, theoSao, boCuc, MUC, DON, HIEU, DAC_BIET, TINH_ANH,
    huongAnh, tiLeHien, chanY, kyCo, oHopLe, dungKy, chonGop, rerollGop,
    BAN_NG, BAN_AI, K, setRnd: (f) => (rnd = f) };
  root.GAME = API;
  if (typeof module !== 'undefined') module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
