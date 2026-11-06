// TURRET MERGE — ỤNG MỚI ĐỢT 3 · 4 ụ ĐỎ (docs/demo-hop-tuong/TUONG-MOI-20.md §4 R2–R5):
//   Hive Queen (chuato) · Leviathan (leviathan) · Genesis Core (khoisinh) · Wyrm Engine (ronglua)
// Luật chung Đỏ: tối đa 1 Đỏ / bộ bài (game.js deckNgauNhien + UI), kỹ năng CHỦ ĐỘNG mở ở 3★ (chạm ụ khi nạp đầy, AI tự dùng),
// 3 giai đoạn lớn lên 1–3★ / 4–6★ / 7★ (GROW, vòng 3 cung quanh đầu — growfx.js). Nạp SAU skills4.js.
'use strict';

const sao7r = (T, ds) => ds[clamp(T.sao, 1, 7) - 1];
const gdSao = (T) => (T.sao >= 7 ? 3 : T.sao >= 4 ? 2 : 1);
// nạp kỹ năng chủ động (từ 3★) + AI / người chơi để quá 5–6 s thì tự dùng khi đáng
function napChuDong(G, B, T, dt, cd, sk) {
  if (T.sao < 3) { T.nap = 0; return; }
  T.nap = Math.min(1, T.nap + dt / cd);
  if (T.nap >= 1) { T.napDay = (T.napDay || 0) + dt; if (!B.ai && T.napDay > 6 && sk.aiNen(G, B, T)) sk.chuDong(G, B, T); } else T.napDay = 0;
}

// =====================================================================================================
// R2 · HIVE QUEEN (chuato) — Đỏ TC: mỗi c s đẻ 1 drone mini (tối đa n), drone bay quanh tổ rồi tự săn quái gần nhất (60% sát thương ụ / phát, mỗi 0.5 s).
//      GĐ2 (4★+): drone đậu lên 4 ụ kề → +10% tốc bắn. GĐ3 (7★): cứ 5 drone có 1 drone HOÀNG GIA vàng ×3 sát thương.
//      CHỦ ĐỘNG "SWARM" (3★+, hồi 30 s): cả bầy lao vào chỗ quái đông nhất, mỗi con nổ dmg×3 trong 35 px; bầy đẻ lại từ 0.
//      Tổng drone tối đa 12 / bàn (nhẹ máy). PVP: drone không sang bàn đối thủ.
// =====================================================================================================
SKILLS.chuato = {
  vai: 'tc', dmg: 16, toc: 1, nham: 'dau', napMau: '#ff4a1a',
  c: (T) => sao7r(T, [4, 3.7, 3.4, 3.1, 2.8, 2.5, 2.2]),
  n: (T) => sao7r(T, [3, 4, 5, 6, 7, 8, 10]),
  cd: 30,
  mo: (T) => (T.bay ? T.bay.length : 0) + '/' + SKILLS.chuato.n(T) + ' drones (1 per ' + SKILLS.chuato.c(T) + 's, 60% dmg each)' + (T.sao >= 4 ? ' · while it has drones: N/E/S/W neighbours +10% fire rate' : '') + (T.sao >= 7 ? ' · every 5th drone ROYAL ×3' : '') + ' · ' + (T.sao >= 3 ? 'TAP when full: SWARM kamikaze ×3 (35 px)' : 'SWARM unlocks at 3★'),
  sinh(G, T) { T.bay = []; T.de = 0; T.deDem = 0; },
  hoTro(G, T, N) { if (T.sao >= 4 && T.bay && T.bay.length) N.buf.toc += 0.1; },
  capNhat(G, B, T, dt) {
    if (!T.bay) this.sinh(G, T);
    const tong = B.t.reduce((s, X) => s + (X && X.id === 'chuato' && X.bay ? X.bay.length : 0), 0);
    T.de += dt * (1 + T.buf.toc);
    if (T.de >= this.c(T) && T.bay.length < this.n(T) && tong < 12) {
      T.de = 0; T.deDem++;
      const c = tamU(T), vang = T.sao >= 7 && T.deDem % 5 === 0;
      T.bay.push({ x: c.x, y: c.y, g: Math.random() * 6.28, r: 0, cd: rnd(0.2, 0.6), vang, ra: 0 });
      FX.tiaLua(c.x, c.y, 4, vang ? '#ffd23f' : '#ff6a2a', 90, 6);
      if (!B.ai || G.che === 'pvp') SND.gOng();
    } else if (T.de > this.c(T)) T.de = this.c(T);
    if (!G.hu.some(o => o.k === 'toOng' && o.T === T)) G.hu.push({ k: 'toOng', t: 0, song: 1e9, T, B });
    napChuDong(G, B, T, dt, this.cd, this);
    return false; // ong chúa vẫn bắn ngòi chích như ụ thường
  },
  ban(G, B, T, E) { // ngòi chích: kim cam-mật bay nhanh
    giat(T, 0.6); chopNong(T, 20); SND.tia();
    const dmg = dmgU(T);
    danThang(B, T, E, 'g_ngoi', 620, 18, (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#ffc23a' }); FX.tiaLua(d.x, d.y, 3, '#ffc23a', 110, 6); });
  },
  aiNen: (G, B, T) => T.bay && T.bay.length >= Math.min(4, SKILLS.chuato.n(T)) && dsMucTieu(B).filter(E => !E.chet).length >= 4,
  chuDong(G, B, T) {
    if (T.nap < 1 || T.sao < 3 || !T.bay || !T.bay.length) return false;
    // chỗ quái đông nhất: quái có nhiều quái khác trong 60 px nhất
    const ds = dsMucTieu(B).filter(E => !E.chet); if (!ds.length) return false;
    let tam = ds[0], best = -1;
    for (const E of ds) { const n = ds.reduce((s, Q) => s + (Math.hypot(Q.x - E.x, Q.y - E.y) < 60 ? 1 : 0), 0); if (n > best) { best = n; tam = E; } }
    T.nap = 0; T.napDay = 0; T.sang = 1; giat(T, 1.6);
    const dmg = dmgU(T) * 3;
    T.bay.forEach((d, i) => G.hu.push({ k: 'ongLao', t: -i * 0.05, song: 1.4, x: d.x, y: d.y, E: tam, ds, B, T, dmg: dmg * (d.vang ? 3 : 1), vang: d.vang, vet: [] }));
    T.bay.length = 0; T.de = 0;
    nhanU(T, 'SWARM!', '#ff6a2a', true); SND.gSwarm();
    const c = tamU(T); FX.vong1(c.x, c.y, 10, 50, '#ff6a2a', 0.35, 3);
    return true;
  },
  sangDau: (T) => (T.gd === 3 ? 0.14 + 0.06 * Math.sin(G.t * 7) : T.gd === 2 ? 0.08 : 0),
};
HU.toOng = { // bầy drone của 1 tổ: bay vòng quanh tổ (GĐ2: đậu trên ụ kề), tự săn quái gần nhất ≤150 px, tia chích ngắn
  cap(G, o, dt) {
    const T = o.T; if (!conTren(T) || T.id !== 'chuato') return true;
    const B = o.B, c = tamU(T), dmg = dmgU(T) * 0.6;
    const ke = T.sao >= 4 ? keCan(B, T.o).filter(N => N && !N.st.da) : [];
    T.bay.forEach((d, i) => {
      d.ra = Math.min(1, d.ra + dt * 3);
      // chỗ đứng: drone 0..3 đậu trên ụ kề (GĐ2+), còn lại bay vòng tròn quanh tổ
      let tx, ty;
      if (i < ke.length) { const n = tamU(ke[i]); tx = n.x + 10; ty = n.y - 12 + Math.sin(G.t * 4 + i) * 1.5; d.dau = true; }
      else { d.g += dt * (1.6 + 0.1 * i); const r = 24 + (i % 3) * 5; tx = c.x + Math.cos(d.g) * r; ty = c.y + Math.sin(d.g) * r; d.dau = false; }
      d.x += (tx - d.x) * Math.min(1, dt * 8); d.y += (ty - d.y) * Math.min(1, dt * 8);
      d.cd -= dt * (1 + T.buf.toc);
      if (d.cd <= 0) {
        let M = null, best = 150; for (const E of dsMucTieu(B)) if (!E.chet) { const L = Math.hypot(E.x - d.x, E.y - d.y); if (L < best) { best = L; M = E; } }
        d.cd = M ? Math.max(0, d.cd + 0.5) : 0; // cộng dồn (đúng 2 phát/s ở mọi tốc độ khung hình); không có quái trong 150 px → chờ sẵn
        if (M) {
          G.dangBan = T; trung(M, dmg * (d.vang ? 3 : 1), { B, mau: d.vang ? '#ffd23f' : '#ffb070', phu: false, im: !d.vang && Math.random() < 0.5 });
          G.hu.push({ k: 'chich', t: 0, song: 0.12, x0: d.x, y0: d.y, x1: M.x, y1: M.y, vang: d.vang });
        }
      }
    });
    return false;
  },
  ve(ctx, o, R) {
    const T = o.T; if (!T.bay) return;
    for (const d of T.bay) veDrone(ctx, R, d.x, d.y, 1 + (d.vang ? 0.25 : 0), d.vang, G.t * 40 + d.g, d.ra);
  },
};
function veDrone(ctx, R, x, y, k, vang, pha, al) { // ong máy = ảnh PNG fx_chuato_dan / fx_chuato_hieu (ChatGPT); vỗ cánh = nhịp phóng ảnh
  const ten = vang ? (typeof FXU !== 'undefined' && FXU.co('fx_chuato_dan3') ? 'fx_chuato_dan3' : REN.img('fx_chuato_hieu') ? 'fx_chuato_hieu' : 'fx_chuato_dan') : 'fx_chuato_dan'; // ong chúa vàng = dan3 (tờ G4)
  R.anhGiua(ctx, ten, x, y, 20 * k * (vang ? 1.15 : 1) * (1 + 0.05 * Math.sin(pha * 0.7)), 0.15 * Math.sin(pha * 0.13), al == null ? 1 : al);
}
HU.chich = { ve(ctx, o, R) { const u = o.t / o.song; ctx.globalCompositeOperation = 'lighter'; PX.tia(ctx, o.x0, o.y0, o.x1, o.y1, o.vang ? 2.4 : 1.6, o.vang ? '#ffe680' : '#ff9a50', 1 - u); ctx.globalAlpha = 1 - u; R.anhGiua(ctx, R.cham1(o.vang ? '#ffd23f' : '#ff6a2a'), o.x1, o.y1, 12 * (1 - u)); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; } };
HU.ongLao = { // SWARM: từng drone lao thành vệt sáng vào chỗ đông → nổ 35 px
  cap(G, o, dt) {
    if (o.t < 0) return false;
    if (o.E.chet) { const ds = dsMucTieu(o.B).filter(E => !E.chet); if (!ds.length) return true; o.E = ds[0]; }
    const dx = o.E.x - o.x, dy = o.E.y - o.y, L = Math.hypot(dx, dy) || 1, v = 380 + o.t * 500;
    o.vet.push(o.x, o.y); if (o.vet.length > 12) o.vet.splice(0, 2);
    if (L < v * dt + 6) {
      G.dangBan = o.T; noLan(o.E.x, o.E.y, 35, o.dmg, o.B, { phu: true, mau: o.vang ? '#ffd23f' : '#ff8a4a' });
      FX.no('no_phao', o.E.x, o.E.y, 56, 0.3); FX.vong1(o.E.x, o.E.y, 4, 35, o.vang ? '#ffd23f' : '#ff6a2a', 0.25, 3); FX.tiaLua(o.E.x, o.E.y, 4, '#ffc23a', 160, 7);
      SND.no(0.35); if (TVX.duocLac(0.5)) FX.lac(2);
      return true;
    }
    o.x += dx / L * v * dt; o.y += dy / L * v * dt;
    return false;
  },
  ve(ctx, o, R) {
    if (o.t < 0) return;
    ctx.globalCompositeOperation = 'lighter';
    const pts = []; for (let i = 0; i + 1 < o.vet.length; i += 2) pts.push([o.vet[i], o.vet[i + 1]]); pts.push([o.x, o.y]);
    PX.duong(ctx, pts, 2.4, o.vang ? '#ffdc5a' : '#ff6e32', 0.8); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; // vệt = các đoạn tia PNG
    veDrone(ctx, R, o.x, o.y, 1.15, o.vang, G.t * 60, 1);
  },
};

// =====================================================================================================
// R3 · LEVIATHAN (leviathan) — Đỏ TC: bắn bọt nước nổ 30 px. Mỗi e s NUỐT 1 quái thường (không to, không trùm, GĐ1–2 không nuốt quái bay)
//      trong 120 px → +1 VỰC SÂU (mỗi cộng dồn +4% sát thương, tối đa 100). 4★+: nuốt được quái to (×3 cộng dồn).
//      CHỦ ĐỘNG "TIDAL BREATH" (3★+, hồi 35 s): tia nước quét DỌC cả đường 1.4 s, mỗi quái trúng 1 lần dmg×(4+0.1×cộng dồn), đẩy lùi 20 px.
//      PVP: như solo (không còn luật gửi quái).
// =====================================================================================================
SKILLS.leviathan = {
  vai: 'tc', dmg: 24, toc: 0.9, nham: 'dau', napMau: '#1fb6d9',
  e: (T) => sao7r(T, [9, 8.5, 8, 7, 6, 5.5, 5]),
  cd: 35,
  // dòng bảng ụ: 'ABYSS 56/100 · +224% damage' (VI: '+224% sát thương') = đúng số trên tấm đếm xoáy vực ở đáy ô (demkn.js)
  mo: (T) => 'ABYSS ' + Math.min(100, T.vuc || 0) + '/100 · +' + 4 * Math.min(100, T.vuc || 0) + '% damage · devours a small enemy every ' + SKILLS.leviathan.e(T) + 's (120 px' + (T.sao >= 4 ? ', big ones ×3' : '') + (T.sao >= 7 ? ', flyers too' : '') + ') · bubble splash 30 px · ' + (T.sao >= 3 ? 'TAP when full: TIDAL BREATH ×' + (4 + 0.1 * (T.vuc || 0)).toFixed(1) + ' — an ice dragon breathes along the path' : 'TIDAL BREATH unlocks at 3★'),
  sinh(G, T) { T.vuc = 0; T.nuot = 0; },
  capNhat(G, B, T, dt) {
    T.buf.dmg += 0.04 * (T.vuc || 0);
    T.nuot = (T.nuot || 0) + dt * (1 + T.buf.toc);
    if (T.nuot >= this.e(T) && !G.hu.some(o => o.k === 'xoay' && o.T === T)) {
      const c = tamU(T);
      const ds = dsMucTieu(B).filter(E => !E.chet && !E.trum && !E.nuotHu && (T.sao >= 4 || !E.d.to) && (T.sao >= 7 || !E.d.bay) && Math.hypot(E.x - c.x, E.y - c.y) < 120 + E.d.co * 0.3);
      if (ds.length) {
        ds.sort((a, b) => b.hp - a.hp);
        const E = ds[0]; T.nuot = 0; E.nuotHu = true; E.chan = Math.max(E.chan || 0, 0.6);
        G.hu.push({ k: 'xoay', t: 0, song: 0.6, E, T, B, x: E.x, y: E.y });
        SND.gNuot();
      } else T.nuot = this.e(T);
    }
    napChuDong(G, B, T, dt, this.cd, this);
    return false;
  },
  ban(G, B, T, E) { // bọt nước: quả cầu xanh biển, nổ 30 px
    giat(T, 0.8); chopNong(T, 22); SND.doc();
    const dmg = dmgU(T), gd = T.gd || 1;
    danThang(B, T, E, gd === 3 ? 'g_bot_lon' : 'g_bot', 460, gd === 3 ? 22 : 17, (G, d, M) => {
      if (M) trung(M, dmg, { B, mau: '#9fe8ff' });
      noLan(d.x, d.y, 30, dmg * 0.5, B, { phu: true, mau: '#9fe8ff' });
      FX.vong1(d.x, d.y, 4, gd >= 2 ? 30 : 22, '#7fdcff', 0.25, 2); FX.tiaLua(d.x, d.y, 4, '#dff8ff', 120, 6);
    });
  },
  aiNen: (G, B, T) => dsMucTieu(B).filter(E => !E.chet).length >= 6 || G.quai.some(E => E.trum && !E.chet && banDuocQuai(B, E)),
  chuDong(G, B, T) {
    if (T.nap < 1 || T.sao < 3) return false;
    T.nap = 0; T.napDay = 0; T.sang = 1; giat(T, 2.4);
    const p = G.duong.find(q => q.ban === B.i) || G.duong[0];
    G.hu.push({ k: 'thoThuy', t: 0, song: 1.4, T, B, p, tick: 0, dmg: dmgU(T) * (4 + 0.1 * (T.vuc || 0)), da: new Map() });
    nhanU(T, 'TIDAL BREATH!', '#7fdcff', true); SND.gSongTho(); FX.sang(0.12, '#7fdcff');
    return true;
  },
  sangDau: (T) => (T.gd === 3 ? 0.16 + 0.06 * Math.sin(G.t * 5) : T.gd === 2 ? 0.08 : 0) + Math.min(0.15, (T.vuc || 0) / 600),
  veThem(ctx, T, S, al, R) { // vây gai theo cộng dồn VỰC SÂU 0/40/80 (vạch vàng mảnh trên vòng tròn) + số
    const n = T.vuc || 0, vay = n >= 80 ? 12 : n >= 40 ? 8 : 4;
    ctx.globalCompositeOperation = 'lighter'; // vây = lấp lánh PNG tô vàng trên vòng (thay vạch lineTo vẽ code)
    for (let i = 0; i < vay; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / vay + R.t * 0.2; PX.sao(ctx, Math.cos(a) * S * 0.385, Math.sin(a) * S * 0.385, 7, '#ffd23f', al * 0.55, a); }
    ctx.globalCompositeOperation = 'source-over';
    // số VỰC SÂU: tấm đếm chung ở đáy ô (demkn.js)
  },
};
HU.xoay = { // nuốt: xoáy nước (vòng tròn đồng tâm xoay) hút quái 0.6 s → biến mất, vệt nước bay về Leviathan
  cap(G, o) {
    const E = o.E;
    if (E.chet) { if (E.nuotHu) E.nuotHu = false; return true; }
    o.x = E.x; o.y = E.y; E.chan = Math.max(E.chan || 0, 0.1);
    if (o.t >= o.song * 0.85 && !o.da) {
      o.da = true; const T = o.T, B = o.B;
      const lon = E.d.to ? 3 : 1;
      T.vuc = Math.min(100, (T.vuc || 0) + lon);
      E.hp = 0; chet(E, B);
      if (conTren(T)) { const c = tamU(T); G.hu.push({ k: 'tiaPhep', t: 0, song: 0.4, x0: o.x, y0: o.y, x1: c.x, y1: c.y, mau: '#7fdcff' }); nhanU(T, '+' + lon + ' ABYSS', '#7fdcff'); }
      FX.tiaLua(o.x, o.y, 6, '#bff4ff', 140, 7);
      return true;
    }
    return false;
  },
  ve(ctx, o, R) {
    const u = o.t / o.song, r = 26 * (1 - u * 0.5);
    ctx.save(); ctx.translate(o.x, o.y); ctx.globalCompositeOperation = 'lighter';
    const xo = REN.img('fx_leviathan_hieu'); // xoáy nước ChatGPT: code chỉ xoay + thu nhỏ (thay 3 cung arc vẽ code)
    if (xo) PX.ve(ctx, xo, 0, 0, r * 2.4, r * 2.4 * xo.height / xo.width, -o.t * 9, 0.85 * (u < 0.8 ? 1 : (1 - u) / 0.2));
    ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.thoThuy = { // TIDAL BREATH: điểm cuối tia chạy dọc đường từ lõi về cổng trong 1.4 s (tới hết đường); mỗi 0.1 s đánh quái ≤70 px quanh nó — MỖI QUÁI TRÚNG ĐÚNG 1 LẦN ×(4+0.1×cộng dồn)
  // (QA vàng-đỏ: bản cũ nhịp 0.25 s cách nhau ~173 px > tầm 2×82 → có quái lọt khe; tia hết 1.5 s trước khi tới ~80 px cuối đường → quái gần cổng không bị trúng)
  cap(G, o, dt) {
    if (!conTren(o.T)) return true;
    o.tick -= dt;
    const s = o.p.len * (1 - Math.min(1, o.t / o.song)); [o.x, o.y] = viTri(o.p, s);
    if (o.tick <= 0) {
      o.tick += 0.1; G.dangBan = o.T;
      for (const E of dsMucTieu(o.B)) {
        if (E.chet || o.da.has(E) || Math.hypot(E.x - o.x, E.y - o.y) > 70 + E.d.co * 0.3) continue;
        o.da.set(E, 1);
        trung(E, o.dmg, { B: o.B, mau: '#bff4ff' }); E.s = Math.max(0, E.s - (E.trum ? 7 : 20));
      }
      FX.tiaLua(o.x, o.y, 4, '#dff8ff', 160, 8); FX.vong1(o.x, o.y, 8, 40, '#7fdcff', 0.22, 2);
      if (TVX.duocLac(0.5)) FX.lac(2);
    }
    return false;
  },
  ve(ctx, o, R) {
    if (!conTren(o.T) || o.x == null) return;
    const [x0, y0] = dauNong(o.T), u = o.t / o.song, a = u < 0.1 ? u / 0.1 : u > 0.85 ? (1 - u) / 0.15 : 1, w = 18 + 4 * Math.sin(R.t * 30);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
    R.tia(ctx, 'tia_laser', x0, y0, o.x, o.y, w * 0.6, R.t * 500);
    PX.tia(ctx, x0, y0, o.x, o.y, w * 0.5, '#1fb6d9', a * 0.7); ctx.globalAlpha = a; // quầng = tia PNG tô màu
    R.anhGiua(ctx, R.cham1('#7fdcff'), o.x, o.y, 90); R.anhGiua(ctx, R.cham1('#ffffff'), o.x, o.y, 34);
    for (let i = 0; i < 3; i++) VX.vong(ctx, o.x, o.y, 18 + ((R.t * 120 + i * 20) % 60), 2.5, '#dff8ff', 0.5 * a);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};

// =====================================================================================================
// R4 · GENESIS CORE (khoisinh) — Đỏ ĐB: không bắn. Mỗi g s: +1★ cho ụ SAO THẤP NHẤT trên bàn (không phải chính nó; hoà → ngẫu nhiên;
//      Co-op: chọn ụ của đồng đội nếu thấp hơn). +★ này KHÔNG tính là ghép. GĐ2 (4★+): 4 ô kề +15% sát thương.
//      GĐ3 (7★): mỗi lần nâng sao còn gọi thêm 1 ụ 1★ nếu bàn còn ô trống.
//      CHỦ ĐỘNG "GENESIS" (3★+, hồi 45 s): gọi k ụ (loại ngẫu nhiên trong bộ) ở MỨC SAO TRUNG BÌNH của bàn (làm tròn xuống) vào ô trống.
// =====================================================================================================
SKILLS.khoisinh = {
  vai: 'db', dmg: 0, toc: 0, napMau: '#ff3a6a',
  g: (T) => Math.round(sao7r(T, [30, 28, 26, 24, 22, 20, 16]) * (knThe(G.ban[T.ban], 'khoisinh') || 100)) / 100, // × cấp thẻ (KY_NANG_CAP.khoisinh)
  k: (T) => sao7r(T, [1, 1, 2, 2, 2, 3, 3]),
  cd: 45,
  mo: (T) => '+1★ to your lowest turret every ' + SKILLS.khoisinh.g(T) + 's (next in ' + Math.max(0, SKILLS.khoisinh.g(T) - (T.sinhT || 0)).toFixed(0) + 's)' + (T.sao >= 4 ? ' · neighbours +15% damage' : '') + (T.sao >= 7 ? ' · each raise also summons a free 1★' : '') + ' · ' + (T.sao >= 3 ? 'TAP when full: GENESIS summons ' + SKILLS.khoisinh.k(T) + ' at average ★' : 'GENESIS unlocks at 3★'),
  gocDau: (T, t) => t * (0.25 + 0.5 * (T.sinhT || 0) / SKILLS.khoisinh.g(T)),
  hoTro(G, T, N) { if (T.sao >= 4) N.buf.dmg += 0.15; },
  thapNhat(B, T) {
    const ds = B.t.filter(N => N && N !== T && N.sao < LUAT.saoMax && !N.st.da && N.id !== 'khoisinh');
    if (!ds.length) return null;
    const m = Math.min(...ds.map(N => N.sao)); return pick(ds.filter(N => N.sao === m));
  },
  capNhat(G, B, T, dt) {
    T.sinhT = (T.sinhT || 0) + dt * (1 + T.buf.toc);
    if (T.sinhT >= this.g(T)) {
      let X = B, N = this.thapNhat(B, T);
      if (G.che === 'coop') { const D = banKhac(B), M = D && this.thapNhat(D, T); if (M && (!N || M.sao < N.sao)) { X = D; N = M; } }
      if (N) {
        T.sinhT = 0; T.sang = 1;
        const c = tamU(T), n = X.o[N.o];
        G.hu.push({ k: 'cungSang', t: 0, song: 0.55, x0: c.x, y0: c.y, x1: n.x, y1: n.y });
        VX.hen(0.4, () => { if (X.t[N.o] === N) nangSao(X, N, 1, X === B ? 'GENESIS +1★' : 'ALLY GENESIS'); });
        if (T.sao >= 7 && oTrong(B).length) { const M = trieu(B, true); if (M) nhanU(M, 'GENESIS SEED', '#ff8ab0', true); }
        if (!B.ai || G.che === 'pvp') SND.gHop(0);
      } else T.sinhT = this.g(T);
    }
    napChuDong(G, B, T, dt, this.cd, this);
    return true;
  },
  aiNen: (G, B, T) => oTrong(B).length >= 1,
  chuDong(G, B, T) {
    if (T.nap < 1 || T.sao < 3 || !oTrong(B).length) return false;
    T.nap = 0; T.napDay = 0; T.sang = 1;
    const ts = B.t.filter(N => N && !N.st.da), tb = clamp(Math.floor(ts.reduce((s, N) => s + N.sao, 0) / Math.max(1, ts.length)), 1, 6);
    const c = tamU(T); let n = 0;
    for (let i = 0; i < this.k(T); i++) {
      const tr = oTrong(B); if (!tr.length) break;
      const o = pick(tr), id = pick(deckTru(B, ['khoisinh'])), N = sinhU(taoU(B, id, tb, o));
      B.t[o] = N; VX.trieu(N); n++;
      const q = B.o[o]; G.hu.push({ k: 'cungSang', t: -i * 0.08, song: 0.55, x0: c.x, y0: c.y, x1: q.x, y1: q.y });
    }
    nhanU(T, 'GENESIS ×' + n + ' (' + tb + '★)', '#ff8ab0', true); SND.gHop(1); FX.vong1(c.x, c.y, 10, 60, '#ff8ab0', 0.4, 4); FX.sang(0.1, '#ffd0e0');
    return true;
  },
  sangDau: (T) => (T.gd === 3 ? 0.2 + 0.08 * Math.sin(G.t * 4) : T.gd === 2 ? 0.1 : 0) + T.sang * 0.3,
  veThem(ctx, T, S, al, R) { // GĐ1: 3 vành vàng quay · GĐ2: + 8 cánh sen thép · GĐ3: + ngôi sao trắng ở lõi
    const gd = T.gd || 1, p = (T.sinhT || 0) / SKILLS.khoisinh.g(T);
    ctx.globalCompositeOperation = 'lighter';
    if (!MOT_VONG) for (let i = 0; i < 3; i++) { const rr = S * (0.3 + i * 0.045), vp = PX.mau('fx_vong_trieu', i === 2 ? '#ff8ab0' : '#ffd23f'); if (vp) PX.ve(ctx, vp, 0, 0, rr * 2.3, rr * 2.3, (i % 2 ? -1 : 1) * R.t * (0.4 + 0.2 * i), al * (0.35 + 0.15 * i)); } // vành = vòng phù văn PNG
    if (gd >= 2) for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + R.t * 0.3; PX.sao(ctx, Math.cos(a) * S * 0.34, Math.sin(a) * S * 0.34, S * 0.12, '#ffd23f', al * 0.5, a); } // cánh sen = lấp lánh PNG
    if (gd === 3) { ctx.globalAlpha = al * (0.5 + 0.2 * Math.sin(R.t * 4)); R.anhGiua(ctx, R.cham1('#ff8ab0'), 0, 0, S * 0.7); ctx.globalAlpha = al; vePandora(ctx, 'sao', S * 0.09, '#ffffff'); }
    if (p > 0.9) { ctx.globalAlpha = al * (p - 0.9) * 6 * (0.6 + 0.4 * Math.sin(R.t * 20)); R.anhGiua(ctx, R.cham1('#ffd23f'), 0, 0, S * 0.8); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al;
  },
};
HU.cungSang = { // tia sáng CONG từ lõi sang ụ đích (đầu sáng chạy dọc cung) + hạt sao
  ve(ctx, o, R) {
    if (o.t < 0) return;
    const u = Math.min(1, o.t / o.song), e = 1 - (1 - u) * (1 - u), mx = (o.x0 + o.x1) / 2, my = (o.y0 + o.y1) / 2 - 40;
    const P = (s) => [(1 - s) * (1 - s) * o.x0 + 2 * (1 - s) * s * mx + s * s * o.x1, (1 - s) * (1 - s) * o.y0 + 2 * (1 - s) * s * my + s * s * o.y1];
    ctx.globalCompositeOperation = 'lighter';
    const s0 = Math.max(0, e - 0.45), pts = []; for (let i = 0; i <= 12; i++) pts.push(P(s0 + (e - s0) * i / 12));
    PX.duong(ctx, pts, 3, '#ffd23f', 0.7); // cung sáng = các đoạn tia PNG
    const [hx, hy] = P(e); ctx.globalAlpha = 1 - u * 0.5; R.anhGiua(ctx, R.cham1('#ff8ab0'), hx, hy, 26); R.anhGiua(ctx, R.cham1('#ffffff'), hx, hy, 10);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};

// =====================================================================================================
// R5 · WYRM ENGINE (ronglua) — Đỏ TC: phun lửa HÌNH NÓN liên tục vào quái đầu trong tầm (5 nhịp/s, dmg gốc 10 mỗi nhịp, gắn CHÁY 3 s),
//      để lại VỆT CHÁY trên đường 2 s (đi qua bị cháy). Góc nón ★1→★7: 40…75°, tầm 100…135 px.
//      GĐ2 (4★+): LỬA XANH +30% với quái to/trùm. GĐ3 (7★): LỬA TRẮNG viền xanh, vệt cháy 4 s, nón dài +15%.
//      CHỦ ĐỘNG "DRAGON DIVE" (3★+, hồi 35 s): rồng cơ khí bổ nhào dọc TOÀN BỘ đường từ lõi về cổng: dmg×25 mỗi quái (+5% máu tối đa trùm),
//      để lại vệt cháy trên cả đường 3 s.
// =====================================================================================================
const RONG_MAU = [null, { a: '#ff3b1a', b: '#ffb43a', c: '#fff0b0' }, { a: '#1a5cff', b: '#3aa0ff', c: '#bfe8ff' }, { a: '#2a7aff', b: '#9fd8ff', c: '#ffffff' }];
// VỆT CHÁY / THAN trên đường + quầng DRAGON DIVE: LUÔN màu lửa (than hồng cam/đỏ) ở MỌI dạng — lửa xanh/trắng chỉ là màu NÓN phun
// (06/11 lỗi iPhone: rồng lửa đỏ bổ nhào để lại vệt XANH DA TRỜI vì vetChay/rongBo lấy RONG_MAU[gd] = bảng màu nón xanh)
const RONG_THAN = [null, { a: '#ff3b1a', b: '#ffb43a' }, { a: '#ff4a12', b: '#ffc040' }, { a: '#ff5a1a', b: '#ffd870' }];
SKILLS.ronglua = {
  vai: 'tc', dmg: 10, toc: 5, napMau: '#ff3b1a',
  goc: (T) => sao7r(T, [40, 45, 50, 55, 60, 65, 75]) * Math.PI / 180,
  tam: (T) => sao7r(T, [100, 105, 110, 115, 120, 125, 135]) * (T.sao >= 7 ? 1.15 : 1),
  cd: 35,
  mo: (T) => ['Orange', 'BLUE flame (+30% vs big)', 'WHITE flame (+30% vs big, trails 4s)'][gdSao(T) - 1] + ' · cone ' + Math.round(SKILLS.ronglua.goc(T) * 180 / Math.PI) + '° × ' + Math.round(SKILLS.ronglua.tam(T)) + ' px · burns 3s · ' + (T.sao >= 3 ? 'TAP when full: DRAGON DIVE ×25 down the path' : 'DRAGON DIVE unlocks at 3★'),
  capNhat(G, B, T, dt) {
    const L = this.tam(T), c = tamU(T), E = quaiDauTam(B, T, L);
    xoayDau(T, E, dt);
    T.phun = Math.max(0, (T.phun || 0) - dt);
    T.tick = (T.tick || 0) - dt * (1 + T.buf.toc) * (this.toc / 5);
    if (E && T.tick <= 0) {
      T.tick = Math.max(0, T.tick + 0.2); T.phun = 0.3; T.banLan++; // cộng dồn: đúng 5 nhịp/s ở mọi tốc độ khung hình
      const gd = gdSao(T), a = this.goc(T) / 2, dmg = dmgU(T);
      for (const Q of dsMucTieu(B)) {
        if (Q.chet) continue;
        const dx = Q.x - c.x, dy = Q.y - c.y, d = Math.hypot(dx, dy);
        if (d > L + Q.d.co * 0.3 || Math.abs(gocLech(T.goc, Math.atan2(dy, dx))) > a + 0.08) continue;
        trung(Q, dmg * (gd >= 2 && (Q.d.to || Q.trum) ? 1.3 : 1), { B, mau: gd === 3 ? '#e8f6ff' : gd === 2 ? '#9fd0ff' : '#ffb070', im: Math.random() < 0.6 });
        if (!Q.chet) { Q.chayT = Math.max(Q.chayT || 0, 3); Q.chayD = Math.max(Q.chayD || 0, dmg * 0.6); Q.chayB = B; if (!G.hu.some(o => o.k === 'chay' && o.E === Q)) G.hu.push({ k: 'chay', t: 0, song: 30, E: Q, T }); }
      }
      // vệt cháy trên đường dưới mục tiêu (≤1 vệt / 0.45 s / ụ)
      if (G.t - (T.vetT || -9) > 0.45) { T.vetT = G.t; G.hu.push({ k: 'vetChay', t: 0, song: gd === 3 ? 4 : 2, x: E.x, y: E.y, B, T, dmg: dmg * 0.3, tick: 0, gd }); }
      // hạt lửa dọc nón (giới hạn)
      const [x, y] = dauNong(T), m = RONG_MAU[gd];
      for (let i = 0; i < 3; i++) { const g = T.goc + rnd(-a, a), v = rnd(L * 1.6, L * 2.6); FX.hat1('lua', x, y, Math.cos(g) * v, Math.sin(g) * v, 0.32, 9, i ? m.b : m.c); }
      if (!B.ai || G.che === 'pvp') SND.gLua(gd);
    }
    if (!G.hu.some(o => o.k === 'nonLua' && o.T === T)) G.hu.push({ k: 'nonLua', t: 0, song: 1e9, T });
    napChuDong(G, B, T, dt, this.cd, this);
    return true;
  },
  aiNen: (G, B, T) => dsMucTieu(B).filter(E => !E.chet).length >= 6 || G.quai.some(E => E.trum && !E.chet && banDuocQuai(B, E)),
  chuDong(G, B, T) {
    if (T.nap < 1 || T.sao < 3) return false;
    T.nap = 0; T.napDay = 0; T.sang = 1; giat(T, 2.6);
    const p = G.duong.find(q => q.ban === B.i) || G.duong[0];
    G.hu.push({ k: 'rongBo', t: 0, song: 1.3, T, B, p, dmg: dmgU(T) * 25, da: new Set(), vetT: 0 });
    nhanU(T, 'DRAGON DIVE!', '#ff5a1a', true); SND.gRong(); FX.lac(3);
    return true;
  },
  sangDau: (T) => (T.phun > 0 ? 0.2 : 0) + (T.gd === 3 ? 0.12 : 0),
};
// nón lửa = ảnh PNG fx_ronglua_dan (ChatGPT) — dạng 2/3 tô màu lửa xanh (thay sprite gradient + quadraticCurveTo dựng bằng code)
function anhNon(gd) { if (gd > 1 && typeof FXU !== 'undefined' && FXU.co('fx_ronglua_dan' + gd)) return REN.img('fx_ronglua_dan' + gd); return gd > 1 ? PX.mau('fx_ronglua_dan', RONG_MAU[gd].b) : REN.img('fx_ronglua_dan'); }
const LUA_BD = new WeakMap(); // lúc bắt đầu phun của mỗi ụ (chỉ để chọn khung hình — không nằm trên T, không vào đồng bộ online)
HU.nonLua = { // nón lửa = dải 16 khung ChatGPT fx_wyrm_lua chạy ĐÚNG THỨ TỰ (bắt lửa 1–4 → chảy lặp 5–12 → tàn 13–16) — user 06/11 17:37: bỏ 1 ảnh tĩnh rung/phóng
  // dạng 2/3 (lửa XANH / TRẮNG theo luật) = cùng khung tô màu; chưa có dải → ảnh cũ fx_ronglua_dan (tĩnh, không rung)
  cap(G, o) { return !conTren(o.T) || o.T.id !== 'ronglua'; },
  ve(ctx, o, R) {
    const T = o.T, gd = T.gd || gdSao(T);
    if (!(T.phun > 0)) { LUA_BD.delete(T); return; }
    if (!LUA_BD.has(T)) LUA_BD.set(T, R.t);
    const goc = SKILLS.ronglua.goc(T), [x, y] = dauNong(T); let L = SKILLS.ronglua.tam(T);
    // VFX P0 hitbox: phép trúng đo từ TÂM ụ (tamU) tới L — ảnh bắt đầu ở nòng nên rút phần nòng ra khỏi chiều dài → mũi lửa = đúng tầm thật
    const c0 = tamU(T); L = Math.max(20, L - Math.hypot(x - c0.x, y - c0.y));
    const M = typeof SIG_META !== 'undefined' && SIG_META.fx_wyrm_lua, st = M && typeof SIG !== 'undefined' && REN.img('fx_wyrm_lua');
    if (st) {
      const e = R.t - LUA_BD.get(T), f = T.phun < 0.1 ? 12 + Math.min(3, Math.floor((0.1 - T.phun) / 0.1 * 4)) : e < 0.12 ? Math.floor(e / 0.12 * 4) : 4 + Math.floor(e * 16) % 8;
      const hh = Math.max(L * 0.5, 1.5 * SKILLS.ronglua.tam(T) * Math.tan(goc / 2));
      if (gd === 1) { SIG.k(ctx, 'fx_wyrm_lua', f, x, y, L * 1.04, { g: T.goc, ax: 0.02, h: hh }); return; }
      const im = PX.mau('fx_wyrm_lua', RONG_MAU[gd].b) || st; // tô lửa xanh/trắng: 1 canvas dựng 1 lần
      ctx.save(); ctx.translate(x, y); ctx.rotate(T.goc);
      ctx.drawImage(im, f * M[1], 0, M[1], M[2], -L * 1.04 * 0.02, -hh / 2, L * 1.04, hh);
      if (gd === 3) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35; ctx.drawImage(st, f * M[1], 0, M[1], M[2], -L * 0.02, -hh * 0.3, L * 0.9, hh * 0.6); }
      ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      return;
    }
    const a0 = anhNon(gd); if (!a0) return;
    const al = Math.min(1, T.phun / 0.3), im = REN.mip(a0, L * REN.s * REN.dpr);
    const hh = Math.max(L * a0.height / a0.width, 2 * SKILLS.ronglua.tam(T) * Math.tan(goc / 2));
    ctx.save(); ctx.translate(x, y); ctx.rotate(T.goc); ctx.globalAlpha = al;
    ctx.drawImage(im, -2, -hh / 2, L, hh);
    ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.vetChay = { // vệt cháy trên đường (vòng tròn than hồng mờ, nằm dưới quái): quái đi qua bị cháy
  duoi: true,
  cap(G, o, dt) {
    o.tick -= dt; if (o.tick > 0) return false; o.tick = 0.5;
    for (const E of dsMucTieu(o.B)) if (!E.chet && Math.hypot(E.x - o.x, E.y - o.y) < 18 + E.d.co * 0.25) {
      E.chayT = Math.max(E.chayT || 0, 1.5); E.chayD = Math.max(E.chayD || 0, o.dmg); E.chayB = o.B;
      if (!G.hu.some(q => q.k === 'chay' && q.E === E)) G.hu.push({ k: 'chay', t: 0, song: 30, E, T: o.T });
    }
    return false;
  },
  ve(ctx, o, R) {
    const u = o.t / o.song, a = (u < 0.1 ? u / 0.1 : 1 - Math.max(0, (u - 0.6) / 0.4)) * 0.55, m = RONG_THAN[o.gd || 1];
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
    R.anhGiua(ctx, R.cham1(m.a), o.x, o.y, 40); ctx.globalAlpha = a * 0.6; R.anhGiua(ctx, R.cham1(m.b), o.x, o.y, 20 + 3 * Math.sin(R.t * 9 + o.x));
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.rongBo = { // DRAGON DIVE: bóng rồng bay dọc đường (lõi → cổng), đốt mọi quái nó lướt qua 1 lần, rải vệt cháy
  cap(G, o, dt) {
    const u = Math.min(1, o.t / o.song), s = o.p.len * (1 - u);
    const [x, y, g] = viTri(o.p, s); o.x = x; o.y = y; o.g = g + Math.PI;
    G.dangBan = o.T;
    for (const E of dsMucTieu(o.B)) if (!E.chet && !o.da.has(E) && Math.hypot(E.x - x, E.y - y) < 44 + E.d.co * 0.3) {
      o.da.add(E); trung(E, o.dmg + (E.trum ? E.max * 0.05 : 0), { B: o.B, mau: '#ffb070' });
      FX.no('no_phao', E.x, E.y, 60, 0.3); FX.tiaLua(E.x, E.y, 4, '#ffc070', 160, 8);
    }
    o.vetT -= dt; if (o.vetT <= 0) { o.vetT = 0.08; G.hu.push({ k: 'vetChay', t: 0, song: 3, x, y, B: o.B, T: o.T, dmg: dmgU(o.T) * 0.3, tick: 0, gd: gdSao(o.T) }); }
    if (TVX.duocLac(0.35)) FX.lac(2);
    return false;
  },
  ve(ctx, o, R) {
    if (o.x == null) return;
    const u = o.t / o.song, a = u < 0.08 ? u / 0.08 : u > 0.9 ? (1 - u) / 0.1 : 1, gd = gdSao(o.T), m = RONG_THAN[gd];
    ctx.save(); ctx.translate(o.x, o.y);
    PX.bong(ctx, 6, 10, 60, 60, 0.35 * a); // bóng đổ = PNG tô đen
    ctx.rotate(o.g);
    ctx.globalCompositeOperation = 'lighter'; PX.cham(ctx, 0, 0, 150, m.a, 0.7 * a);
    // thân rồng = ảnh PNG fx_ronglua_no (đầu rồng phun lửa, ChatGPT) — dạng 2/3 tô lửa xanh; vỗ cánh = nhịp phóng
    // (bỏ cánh/đốt thân/đầu/mắt vẽ bằng lineTo + arc). Chờ ảnh thân rồng bay từ trên xuống: raw_p4_fx_1 ô 'rong_bay'.
    const rd = typeof FXU !== 'undefined' && FXU.co('fx_ronglua_dacbiet') && REN.img('fx_ronglua_dacbiet'); // rồng bổ nhào nhìn từ trên (tờ G4, đầu hướng xuống ảnh → xoay −90°)
    const ro = rd || REN.img('fx_ronglua_no'), vo = 1 + 0.06 * Math.sin(R.t * 18);
    ctx.globalCompositeOperation = 'source-over';
    if (ro) PX.ve(ctx, ro, 0, 0, 84 * vo, 84 * vo * ro.height / ro.width, rd ? -Math.PI / 2 : 0, a);
    const non = anhNon(1); ctx.globalCompositeOperation = 'lighter'; // rồng bổ nhào thân ĐỎ → lửa phía trước CAM (không lấy nón xanh dạng 2/3)
    if (non) PX.ve(ctx, non, 50, 0, 60, 60 * non.height / non.width, 0, 0.8 * a);
    ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};

// =====================================================================================================
// đăng ký: họ kỹ năng, mốc sao riêng, grow-up 3 giai đoạn, nhịp hiển thị
// =====================================================================================================
themHo('summon', 4, 'chuato', 'a swarm of hunter drones + SWARM kamikaze (active)');
themHo('heavy', 4, 'leviathan', 'devours enemies for damage stacks (max 100) + TIDAL BREATH (active)');
themHo('star', 4, 'khoisinh', 'raises your weakest turret over time + GENESIS (active)');
themHo('blast', 4, 'ronglua', 'flame cone that burns crowds + DRAGON DIVE (active)');

Object.assign(MOC_RIENG, {
  chuato: { 3: ['SWARM', 'Unlocks the active skill (tap when full; auto-fires if left full)'], 5: ['QUICK BROOD', 'Up to 7 drones, one every 2.8s'], 7: ['ROYAL BROOD', 'Every 5th drone is gold ×3'] },
  leviathan: { 3: ['TIDAL BREATH', 'Unlocks the active skill (tap when full; auto-fires if left full)'], 5: ['DEEP MAW', 'Devours big enemies (×3 stacks) — starts at 4★'], 7: ['ABYSS LORD', 'Devours every 5s, flyers too'] },
  khoisinh: { 3: ['GENESIS', 'Unlocks the active skill (tap when full; auto-fires if left full)'], 5: ['BLOOM', 'Neighbours +15% damage (starts at 4★)'], 7: ['SEED OF LIFE', 'Each raise also summons a free 1★'] },
  ronglua: { 3: ['DRAGON DIVE', 'Unlocks the active skill (tap when full; auto-fires if left full)'], 5: ['BLUE FLAME', '+30% vs big enemies and bosses (starts at 4★)'], 7: ['WHITE FLAME', 'Longer cone, burning trail 4s'] },
});
Object.assign(GROW, {
  chuato: { mau: '#ff6a2a', khongAnh: true, ten: ['NEST', 'HIVE', 'ROYAL HIVE'], dk: '1–3★ / 4–6★ (drones perch on neighbours) / 7★ ROYAL: every 5th drone gold ×3',
    gd: (T) => ({ s: gdSao(T), p: (T.sao - 1) / 6, v: [0.5] }) },
  leviathan: { mau: '#1fb6d9', khongAnh: true, ten: ['HATCHLING', 'DEEP ONE', 'ABYSS LORD'], dk: '1–3★ / 4–6★ (devours big ones) / 7★ ABYSS LORD (devours flyers, every 5s)',
    gd: (T) => ({ s: gdSao(T), p: (T.sao - 1) / 6, v: [0.5] }) },
  khoisinh: { mau: '#ff8ab0', khongAnh: true, ten: ['SEED', 'BLOSSOM', 'LOTUS OF LIFE'], dk: '1–3★ / 4–6★ (neighbours +15% dmg) / 7★ (each raise summons a free 1★)',
    gd: (T) => ({ s: gdSao(T), p: (T.sao - 1) / 6, v: [0.5] }) },
  ronglua: { mau: '#ff5a1a', ten: ['WHELP', 'BLUE WYRM', 'WHITE WYRM'], dk: '1–3★ orange flame / 4–6★ BLUE flame (+30% vs big) / 7★ WHITE flame (longer, trails 4s)',
    gd: (T) => ({ s: gdSao(T), p: (T.sao - 1) / 6, v: [0.5] }) },
});
Object.assign(NHIP, {
  ronglua: () => 'flame 5 ticks/s', khoisinh: (T) => '+1★ every ' + SKILLS.khoisinh.g(T) + 's',
});
