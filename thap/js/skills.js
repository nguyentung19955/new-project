// TURRET MERGE — BẢNG KỸ NĂNG Ụ SÚNG (đăng ký theo id trong roster.json)
// Phiên sau chỉ cần thêm SKILLS['<id>'] = {...} là ụ đó chơi được (bảng chọn tự mở khoá).
// Trường: vai ('tc' tấn công | 'ht' hỗ trợ | 'db' đặc biệt), dmg (sát thương gốc), toc (phát/giây), tocSao (+% tốc mỗi sao),
//   nham ('dau' quái đầu | 'mau' máu nhiều nhất | 'ngau' ngẫu nhiên), ban(G,B,T,E) bắn, capNhat(G,B,T,dt) tự quản lý (trả true = bỏ bắn mặc định),
//   hoTro(G,T,N) buff ô kề, ghep(G,B,a,b,ra) khi ghép, mo(T) dòng chỉ số cho bảng thông tin.
'use strict';

const SKILLS = {};
const HU = {}; // hiệu ứng kỹ năng trên sân: HU[k] = { cap(G,o,dt) → true để xoá, ve(ctx,o,R) }

// --- tiện ích chung cho kỹ năng ---
function chopNong(T, co) { const [x, y] = dauNong(T); FX.no('chop_nong', x, y, co || 30, 0.12, T.goc); return [x, y]; }
function phutKhoi(x, y, n) { for (let i = 0; i < (n || 1); i++) FX.khoi(x + rnd(-3, 3), y + rnd(-3, 3), rnd(12, 18), rnd(-8, 8), rnd(-24, -10)); }
function danThang(B, T, E, img, sp, co, trungFn, duoi) {
  const [x, y] = dauNong(T);
  return banDan({ img, x, y, muc: E, px: E.x, py: E.y, sp, co, B, T, trung: trungFn, duoi });
}

// ============ TRẮNG ============
SKILLS.canon = { // Pháo Nổ (Joan of Arc): bắn chậm, nổ lan; sao tăng vùng nổ
  vai: 'tc', dmg: 24, toc: 0.75, nham: 'dau',
  banKinh: (T) => 28 + 6 * T.sao,
  mo: (T) => 'Blast radius ' + SKILLS.canon.banKinh(T) + ' px',
  ban(G, B, T, E) {
    giat(T, 1.4); const [x, y] = chopNong(T, 34); phutKhoi(x, y, 2); SND.phao();
    const dmg = dmgU(T), r = this.banKinh(T);
    banDan({ img: 'dan_phao', x, y, muc: E, px: E.x, py: E.y, sp: 280, co: 24, cong: 30, B, T, duoi: true,
      trung(G, d) { noLan(d.x, d.y, r, dmg, B); FX.no('no_phao', d.x, d.y, r * 2.5, 0.5); FX.vong1(d.x, d.y, 4, r, '#ffb35a', 0.3, 3); FX.tiaLua(d.x, d.y, 8, '#ffb060', 200); FX.lac(2.5); SND.no(0.35); } });
  },
};
SKILLS.lien = { // Liên Thanh (Esch): bắn rất nhanh; sao tăng tốc bắn
  vai: 'tc', dmg: 6, toc: 3.0, tocSao: 0.14, nham: 'dau',
  mo: (T) => 'Fire rate ' + tocU(T).toFixed(1) + '/s',
  ban(G, B, T, E) {
    giat(T, 0.35); const [x, y] = dauNong(T);
    FX.no('chop_nong', x, y, 22 + Math.random() * 8, 0.07, T.goc + rnd(-0.1, 0.1));
    if (Math.random() < 0.35) FX.khoi(x, y, 8);
    const dmg = dmgU(T); SND.lien();
    danThang(B, T, E, 'dan_lien', 700, 16, (G, d, M) => { if (M) { trung(M, dmg, { B }); FX.tiaLua(d.x, d.y, 2, '#ffd080', 120, 7); } });
  },
};
SKILLS.bang = { // Băng (Liza): làm chậm quái đầu 35% trong 4 s
  vai: 'tc', dmg: 9, toc: 1.1, nham: 'dau',
  cham: (T) => Math.min(0.55, 0.35 + 0.03 * (T.sao - 1)),
  mo: (T) => 'Slow ' + Math.round(SKILLS.bang.cham(T) * 100) + '% · 4s',
  ban(G, B, T, E) {
    giat(T, 0.6); chopNong(T, 20); SND.bang();
    const dmg = dmgU(T), c = this.cham(T);
    danThang(B, T, E, 'dan_bang', 430, 22, (G, d, M) => {
      FX.no('bang_vo', d.x, d.y, 46, 0.35);
      if (M) { trung(M, dmg, { B, mau: '#bff4ff' }); if (!M.d.khangCham) { M.cham = Math.max(M.cham, c); M.chamT = 4; } else FX.chu1(M.x, M.y - 20, 'IMMUNE', '#7fdcff', 11); }
    }, 'bang');
  },
};
SKILLS.doc = { // Độc (Unknown): gây độc theo thời gian + đám mây độc đọng lại
  vai: 'tc', dmg: 6, toc: 0.9, nham: 'dau',
  mo: (T) => 'Poison ' + Math.round(dmgU(T) * 1.6) + '/s · 4s',
  ban(G, B, T, E) {
    giat(T, 0.5); const [x, y] = dauNong(T); SND.doc();
    for (let i = 0; i < 4; i++) FX.hat1('lua', x, y, Math.cos(T.goc + rnd(-0.4, 0.4)) * 120, Math.sin(T.goc + rnd(-0.4, 0.4)) * 120, 0.3, 7, '#9dff5a');
    const dmg = dmgU(T);
    danThang(B, T, E, 'dan_doc', 320, 22, (G, d, M) => {
      if (M) { trung(M, dmg, { B, mau: '#9dff5a' }); M.doc = Math.max(M.doc, dmg * 1.6); M.docT = 4; M.docB = B; }
      G.hu.push({ k: 'may', t: 0, song: 2.4, x: d.x, y: d.y, r: 24 + T.sao * 2, dps: dmg * 0.8, B, tick: 0 });
    }, 'doc');
  },
};
SKILLS.tia = { // Bắn Tỉa (Artemis): nhắm quái nhiều máu nhất; +100% vào quái to / trùm
  vai: 'tc', dmg: 58, toc: 0.42, nham: 'mau',
  mo: () => '+100% vs big enemies & bosses',
  ban(G, B, T, E) {
    giat(T, 1.6); const [x, y] = chopNong(T, 34); phutKhoi(x, y, 1); SND.tia();
    let dmg = dmgU(T); if (E.d.to || E.trum) dmg *= 2;
    trung(E, dmg, { B });
    G.hu.push({ k: 'tiaTia', t: 0, song: 0.28, x0: x, y0: y, x1: E.x, y1: E.y, mau: '#6fc8ff' });
    FX.tiaLua(E.x, E.y, 6, '#9fdcff', 160, 9);
  },
};
SKILLS.set = { // Tesla (Arges): sét chuỗi N quái = số sao
  vai: 'tc', dmg: 15, toc: 0.85, nham: 'dau',
  mo: (T) => 'Chains to ' + T.sao + ' enemies',
  ban(G, B, T, E) {
    giat(T, 0.4); const [x, y] = dauNong(T); SND.set();
    const dmg = dmgU(T), chuoi = [E], ds = dsMucTieu(B);
    while (chuoi.length < T.sao) {
      const cu = chuoi[chuoi.length - 1]; let m = null, best = 120;
      for (const Q of ds) if (!chuoi.includes(Q)) { const dd = Math.hypot(Q.x - cu.x, Q.y - cu.y); if (dd < best) { best = dd; m = Q; } }
      if (!m) break; chuoi.push(m);
    }
    chuoi.forEach((Q, i) => { trung(Q, dmg * Math.pow(0.88, i), { B, mau: '#fff27a' }); FX.no('dien', Q.x, Q.y, 46, 0.3); });
    G.hu.push({ k: 'set', t: 0, song: 0.24, x, y, ds: chuoi.map(Q => ({ Q, x: Q.x, y: Q.y })), seed: Math.random() * 1000, T });
    FX.no('dien', x, y, 30, 0.2);
  },
};
SKILLS.mana = { // Máy Mana (Syrinx): không bắn; sinh mana mỗi 7 s
  vai: 'db', dmg: 0, toc: 0,
  luong: (T) => Math.round(9 * T.sao * (1 + 0.25 * ((G.ban[T.ban].lv.mana || 1) - 1)) * TIERS[T.bac].hs),
  mo: (T) => '+' + SKILLS.mana.luong(T) + ' mana / 7 s',
  capNhat(G, B, T, dt) {
    T.nap += dt / 7;
    if (T.nap >= 1) {
      T.nap = 0; const n = this.luong(T); B.mana += n; T.sang = 1;
      const c = tamU(T);
      FX.chu1(c.x, c.y - 24, '+' + n, '#d9a8ff', 15, 'mana');
      for (let i = 0; i < 8; i++) FX.hat1('lua', c.x + rnd(-14, 14), c.y + rnd(-8, 8), rnd(-10, 10), rnd(-60, -30), 0.6, 8, '#c77dff');
      if (!B.ai) SND.mana();
    }
    return true;
  },
};
// ============ XANH ============
SKILLS.radar = { // Radar (Kirinus): hỗ trợ +tốc bắn cho 4 ô kề
  vai: 'ht', dmg: 0, toc: 0,
  them: (T) => 0.2 + 0.05 * T.sao + 0.03 * ((G.ban[T.ban].lv.radar || 1) - 1),
  mo: (T) => '+' + Math.round(SKILLS.radar.them(T) * 100) + '% fire rate to neighbors',
  hoTro(G, T, N) { N.buf.toc += this.them(T); },
  capNhat(G, B, T, dt) {
    T.goc += dt * 1.3; // chảo radar quay đều
    T.nap += dt / 2.2;
    if (T.nap >= 1) { T.nap = 0; const ke = keCan(B, T.o).filter(Boolean); if (ke.length) G.hu.push({ k: 'ping', t: 0, song: 0.18, T, ke, rgb: '255,180,60' }); }
    return true;
  },
};
SKILLS.mimic = { // Mimic (Aurora): ghép với BẤT KỲ ụ cùng sao; ghép xong buff tấn công
  vai: 'db', dmg: 8, toc: 1.0, nham: 'dau',
  mo: () => 'Merges with any same-star turret · result +50% attack 8s',
  ban(G, B, T, E) {
    giat(T, 0.3);
    const dmg = dmgU(T);
    danThang(B, T, E, 'tia_lua', 380, 18, (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#ffd6ff' }); FX.tiaLua(d.x, d.y, 3, pick(['#ff6ad5', '#7fdcff', '#ffe46b']), 100, 7); });
  },
};
SKILLS.laser = { // Laser (Nebula): tia liên tục, giữ càng lâu càng mạnh (đổi mục tiêu thì về 0)
  vai: 'tc', dmg: 12, toc: 1,
  mo: (T) => 'Beam ramps to ×4 over 3s',
  capNhat(G, B, T, dt) {
    const E = quaiDau(B);
    if (E !== (T.las && T.las.E)) T.las = E ? { E, ramp: 0, acc: 0, so: 0 } : null;
    xoayDau(T, E, dt);
    if (!E) return true;
    const c = tamU(T);
    const lech = Math.abs(gocLech(T.goc, Math.atan2(E.y - c.y, E.x - c.x)));
    if (lech > 0.15) { T.las.on = false; return true; }
    T.las.on = true;
    T.las.ramp = Math.min(1, T.las.ramp + dt / 3);
    const dps = dmgU(T) * (1 + 3 * T.las.ramp) * (1 + T.buf.toc);
    T.las.acc += dps * dt; T.las.so += dt;
    T.rx = -1.2 - Math.sin(G.t * 40) * 0.6; T.rv = 0;
    if (T.las.so > 0.25) { trung(E, T.las.acc, { B, crit: false, mau: '#ff8af0' }); T.las.acc = 0; T.las.so = 0; }
    if (Math.random() < dt * 20) FX.tiaLua(E.x, E.y, 1, '#ff8af0', 120, 8);
    if (!B.ai) SND.laser(); // tia âm duy trì, tự tắt dần khi ngừng bắn
    return true;
  },
};
SKILLS.mortar = { // Súng Cối (Nade): bắn quái ngẫu nhiên, đạn vòng cao nổ lan
  vai: 'tc', dmg: 20, toc: 0.55, nham: 'ngau',
  mo: () => 'Splash 46 px · random targets',
  ban(G, B, T, E) {
    giat(T, 1.8); const [x, y] = chopNong(T, 30); phutKhoi(x, y, 3); SND.phao();
    const dmg = dmgU(T);
    banDan({ img: 'dan_phao', x, y, muc: E, px: E.x, py: E.y, sp: 190, co: 22, cong: 90, B, T, duoi: true, nho: true,
      trung(G, d) { noLan(d.x, d.y, 46, dmg, B); FX.no('no_phao', d.x, d.y, 46 * 2.5, 0.5); FX.bui(d.x, d.y, 6, 10); FX.lac(3); SND.no(0.4); } });
  },
};
// ============ VÀNG ============
SKILLS.railgun = { // Railgun (Removal Tee): BINGO — đủ hàng ngang +sát thương, đủ hàng dọc +tốc bắn; tia xuyên
  vai: 'tc', dmg: 64, toc: 0.42, nham: 'dau',
  bingo(B, T) {
    const c = T.o % 5, h = (T.o / 5) | 0; let ngang = 0, doc = 0;
    for (let i = 0; i < 5; i++) { const X = B.t[h * 5 + i]; if (X && X.id === 'railgun') ngang++; }
    for (let i = 0; i < 3; i++) { const X = B.t[i * 5 + c]; if (X && X.id === 'railgun') doc++; }
    return { ngang, doc };
  },
  mo(T) { const b = this.bingo(G.ban[T.ban], T); return 'Row ' + b.ngang + '/5 · Column ' + b.doc + '/3'; },
  capNhat(G, B, T) {
    const b = this.bingo(B, T);
    T.buf.dmg += (b.ngang - 1) * 0.12 + (b.ngang >= 5 ? 1 : 0);
    T.buf.toc += (b.doc - 1) * 0.12 + (b.doc >= 3 ? 1 : 0);
    T.bingo = b.ngang >= 5 || b.doc >= 3;
    return false;
  },
  ban(G, B, T, E) {
    G.hu.push({ k: 'rail', t: 0, song: 0.75, nap: 0.38, T, B, goc: T.goc, dmg: dmgU(T), da: false });
    SND.nap();
  },
};
SKILLS.orbital = { // Vệ Tinh (Mafdet): bắn thường; khi GHÉP → toàn bàn bị vệ tinh bắn phá từ trời 20 s
  vai: 'tc', dmg: 14, toc: 1.1, nham: 'dau',
  mo: () => 'On merge: orbital strike for 20s',
  ban(G, B, T, E) {
    giat(T, 0.5); chopNong(T, 22); SND.lien();
    const dmg = dmgU(T);
    danThang(B, T, E, 'dan_tia', 560, 22, (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#9fe6ff' }); FX.no('dien', d.x, d.y, 26, 0.2); });
  },
  ghep(G, B, a, b) {
    B.phao = 20; B.phaoSao = Math.max(a.sao, b.sao) + 1; B.phaoT = 0.2;
    const c = B.o[b.o]; FX.chu1(c.x, c.y - 40, 'ORBITAL STRIKE!', '#9fe6ff', 16, 'to');
    SND.mv();
  },
  phaoBan(G, B, dt) { // gọi từ vòng cập nhật bàn khi B.phao > 0
    B.phao -= dt; B.phaoT -= dt;
    if (B.phaoT > 0) return;
    B.phaoT = 0.32;
    const E = quaiNgauNhien(B); if (!E) return;
    const dmg = 30 * TIERS.vang.hs * (1 + 0.85 * (B.phaoSao - 1)) * (1 + 0.18 * ((B.lv.orbital || 1) - 1));
    G.hu.push({ k: 'vetinh', t: 0, song: 0.5, E, x: E.x + rnd(-6, 6), y: E.y, dmg, B, da: false });
  },
};
SKILLS.wallgen = { // Máy Dựng Tường (Cleopatra): dựng tường ánh sáng chặn đường rồi nổ
  vai: 'tc', dmg: 26, toc: 1,
  mo: (T) => 'Wall holds ' + (2.4 + 0.3 * T.sao).toFixed(1) + 's, then explodes',
  capNhat(G, B, T, dt) {
    const tg = G.hu.find(o => o.k === 'tuong' && o.T === T);
    if (tg) { xoayDau(T, null, dt, tg.x, tg.y); return true; }
    const E = quaiDau(B);
    xoayDau(T, E, dt);
    T.nap += dt * (1 + T.buf.toc) / Math.max(5, 9 - 0.4 * T.sao);
    if (T.nap >= 1 && E) {
      const p = G.duong[E.p], s = Math.min(p.len - 10, E.s + 30);
      const [x, y, goc] = viTri(p, s);
      T.nap = 0; giat(T, 0.8); chopNong(T, 26); SND.nap();
      G.hu.push({ k: 'tuong', t: 0, song: 2.4 + 0.3 * T.sao, p: E.p, s, x, y, goc, T, B, dmg: dmgU(T) * 7 });
    }
    return true;
  },
};
// ============ ĐỎ ============
SKILLS.blackhole = { // Hố Đen: hút quái lại rồi nghiền nát
  vai: 'tc', dmg: 18, toc: 1,
  mo: (T) => 'Black hole radius ' + (64 + 4 * T.sao) + ' px · crush ×8',
  capNhat(G, B, T, dt) {
    const ho = G.hu.find(o => o.k === 'hoden' && o.T === T);
    if (ho) { xoayDau(T, null, dt, ho.x, ho.y); return true; }
    const ds = dsMucTieu(B);
    // chọn chỗ quái đông nhất
    let E = null, best = -1;
    for (const Q of ds) { let n = 0; for (const R of ds) if (Math.hypot(Q.x - R.x, Q.y - R.y) < 70) n++; if (n > best || (n === best && Q.s > E.s)) { best = n; E = Q; } }
    xoayDau(T, E, dt);
    T.nap += dt * (1 + T.buf.toc) / Math.max(6, 10 - 0.5 * T.sao);
    if (T.nap >= 1 && E) {
      T.nap = 0; giat(T, 1.2); chopNong(T, 30);
      G.hu.push({ k: 'hoden', t: 0, song: 3, p: E.p, s: E.s + 10, x: E.x, y: E.y, r: 64 + 4 * T.sao, T, B, dps: dmgU(T), dmg: dmgU(T) * 8, acc: 0 });
      SND.hoden();
    }
    return true;
  },
};
SKILLS.overlord = { // Overlord (Jacheongbi): nạp chậm, đầy thì bắn siêu sấm nổ diện rộng
  vai: 'tc', dmg: 28, toc: 1,
  mo: (T) => 'Charge ' + (7 - 0.5 * (T.sao - 1)).toFixed(1) + 's · thunder ×12 in 92 px',
  capNhat(G, B, T, dt) {
    const E = quaiDau(B);
    xoayDau(T, E, dt);
    T.nap = Math.min(1, T.nap + dt * (1 + T.buf.toc) / (7 - 0.5 * (T.sao - 1)));
    if (T.nap >= 1 && E) {
      const c = tamU(T);
      if (Math.abs(gocLech(T.goc, Math.atan2(E.y - c.y, E.x - c.x))) > 0.2) return true;
      T.nap = 0; giat(T, 2.2); const [x, y] = chopNong(T, 44); phutKhoi(x, y, 3);
      G.hu.push({ k: 'sam', t: 0, song: 0.7, x: E.x, y: E.y, x0: x, y0: y, r: 92, dmg: dmgU(T) * 12, B, da: false, seed: Math.random() * 99 });
      SND.sam();
    }
    return true;
  },
};

// ================= HIỆU ỨNG TRÊN SÂN =================
HU.may = { // đám mây độc đọng lại
  duoi: true,
  cap(G, o, dt) {
    o.tick -= dt; if (o.tick > 0) return;
    o.tick = 0.3;
    for (const E of dsMucTieu(o.B)) if (Math.hypot(E.x - o.x, E.y - o.y) < o.r + 8) { E.doc = Math.max(E.doc, o.dps); E.docT = Math.max(E.docT, 1.5); E.docB = o.B; }
  },
  ve(ctx, o, R) {
    const u = o.t / o.song, a = u < 0.15 ? u / 0.15 : 1 - Math.max(0, (u - 0.6) / 0.4);
    ctx.globalAlpha = a * 0.75; ctx.globalCompositeOperation = 'lighter';
    R.khung(ctx, 'fx_khoi_doc', 2 + Math.floor((o.t * 6) % 3), o.x, o.y, o.r * 2.6, o.t * 0.3);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  },
};
HU.tiaTia = { // vệt đạn tỉa mờ dần
  ve(ctx, o, R) {
    const u = o.t / o.song;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 1 - u;
    R.tia(ctx, 'dan_tia', o.x0, o.y0, o.x1, o.y1, 18 * (1 - u * 0.6), 0, true);
    ctx.globalAlpha = (1 - u) * 0.9; ctx.strokeStyle = o.mau; ctx.lineWidth = 2 * (1 - u); ctx.beginPath(); ctx.moveTo(o.x0, o.y0); ctx.lineTo(o.x1, o.y1); ctx.stroke();
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  },
};
HU.set = { // sét chuỗi: đoạn sét rung mỗi ~50 ms
  cap(G, o) { for (const d of o.ds) if (!d.Q.chet) { d.x = d.Q.x; d.y = d.Q.y; } },
  ve(ctx, o, R) {
    // rung sét đổi theo đồng hồ thật (~22 lần/giây) — không phụ thuộc tốc độ khung/tốc độ game; hiện nhanh, tắt mềm
    const u = Math.min(1, o.t / o.song), nhip = Math.floor(R.t / 0.045);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, u / 0.08 + 0.35) * (1 - u * u);
    let x0 = o.x, y0 = o.y;
    if (o.T && G.ban[o.T.ban].t[o.T.o] === o.T) [x0, y0] = dauNong(o.T);
    for (let i = 0; i < o.ds.length; i++) {
      const d = o.ds[i];
      R.set(ctx, x0, y0, d.x, d.y, 26 - i * 2, o.seed + nhip * 7 + i);
      x0 = d.x; y0 = d.y;
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  },
};
HU.ping = { // ụ hỗ trợ kích hoạt buff: 1 xung năng lượng ngắn (~180 ms) chạy tới ụ được buff — không quầng, không vòng to
  ve(ctx, o, R) {
    const c = tamU(o.T), u = Math.min(1, o.t / o.song), e = 1 - (1 - u) * (1 - u);
    const rgb = o.rgb || '255,180,60';
    ctx.globalCompositeOperation = 'lighter';
    for (const N of o.ke) {
      const n = tamU(N), dx = n.x - c.x, dy = n.y - c.y, L = Math.hypot(dx, dy) || 1;
      const p0 = Math.max(0, e - 0.35), r0 = 14;
      const ax = c.x + dx * (r0 / L) + (dx * (1 - 2 * r0 / L)) * p0, ay = c.y + dy * (r0 / L) + (dy * (1 - 2 * r0 / L)) * p0;
      const bx = c.x + dx * (r0 / L) + (dx * (1 - 2 * r0 / L)) * e, by = c.y + dy * (r0 / L) + (dy * (1 - 2 * r0 / L)) * e;
      ctx.strokeStyle = 'rgba(' + rgb + ',' + (0.55 * (1 - u * 0.6)) + ')'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      ctx.globalAlpha = 0.7 * (1 - u * 0.5); R.anhGiua(ctx, R.cham1('rgb(' + rgb + ')'), bx, by, 9); ctx.globalAlpha = 1;
    }
    ctx.lineCap = 'butt'; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.rail = { // railgun: vạch nạp → tia xuyên
  cap(G, o, dt) {
    const T = o.T;
    if (G.ban[T.ban].t[T.o] !== T) return true;
    if (!o.da && o.t >= o.nap) {
      o.da = true; giat(T, 2.4); const [x, y] = chopNong(T, 40); phutKhoi(x, y, 2); FX.lac(3); SND.rail();
      o.x0 = x; o.y0 = y; o.x1 = x + Math.cos(o.goc) * 700; o.y1 = y + Math.sin(o.goc) * 700;
      for (const E of dsMucTieu(o.B)) {
        const t = ((E.x - x) * Math.cos(o.goc) + (E.y - y) * Math.sin(o.goc));
        if (t < 0) continue;
        const px = x + Math.cos(o.goc) * t, py = y + Math.sin(o.goc) * t;
        if (Math.hypot(E.x - px, E.y - py) < 14 + E.d.co * 0.25) { trung(E, o.dmg, { B: o.B, mau: '#9ffcff' }); FX.no('dien', E.x, E.y, 34, 0.25); }
      }
    }
    if (!o.da) { const E = T.muc; if (E && !E.chet) { const c = tamU(T); o.goc = Math.atan2(E.y - c.y, E.x - c.x); } }
    return false;
  },
  ve(ctx, o, R) {
    const T = o.T;
    ctx.globalCompositeOperation = 'lighter';
    if (!o.da) {
      const [x, y] = dauNong(T), u = o.t / o.nap;
      ctx.globalAlpha = 0.3 + 0.5 * u;
      ctx.strokeStyle = '#7ffcff'; ctx.lineWidth = 1 + u * 1.5; ctx.setLineDash([6, 6]); ctx.lineDashOffset = -o.t * 80;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(o.goc) * 600, y + Math.sin(o.goc) * 600); ctx.stroke(); ctx.setLineDash([]);
      R.anhGiua(ctx, 'tia_lua', x, y, 14 + u * 22, o.t * 8, 1);
    } else {
      const u = (o.t - o.nap) / (o.song - o.nap);
      ctx.globalAlpha = 1 - u;
      R.tia(ctx, 'tia_laser', o.x0, o.y0, o.x1, o.y1, 22 * (1 - u * 0.7), o.t * 400);
      R.tia(ctx, 'dan_tia', o.x0, o.y0, o.x1, o.y1, 30 * (1 - u), 0, true);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.vetinh = { // tia bắn phá từ đỉnh màn hình
  cap(G, o) {
    if (!o.E.chet) { o.x = o.E.x; o.y = o.E.y; }
    if (!o.da && o.t > 0.16) {
      o.da = true; noLan(o.x, o.y, 30, o.dmg, o.B, { mau: '#9fe6ff' });
      FX.no('dien', o.x, o.y, 70, 0.35); FX.no('no_phao', o.x, o.y, 60, 0.4); FX.lac(2);
    }
  },
  ve(ctx, o, R) {
    const u = Math.min(1, o.t / 0.16);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = o.da ? Math.max(0, 1 - (o.t - 0.16) / 0.3) : 1;
    const y0 = -20, y1 = y0 + (o.y - y0) * u;
    R.tia(ctx, 'tia_laser', o.x, y0, o.x, y1, 12, o.t * 300);
    R.tia(ctx, 'dan_tia', o.x, y0, o.x, y1, 22, 0, true);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.tuong = { // tường ánh sáng chặn đường rồi nổ
  cap(G, o) {
    const T = o.T;
    for (const E of G.quai) if (!E.chet && E.p === o.p && E.s < o.s && E.s > o.s - 26) { E.s = Math.max(E.s - 0.01, Math.min(E.s, o.s - 14)); E.chan = 0.05; }
    if (o.t >= o.song - 0.02 && !o.no) {
      o.no = true; noLan(o.x, o.y, 58, o.dmg, o.B, { mau: '#9ffcff' });
      FX.no('dien', o.x, o.y, 110, 0.4); FX.no('no_phao', o.x, o.y, 100, 0.5); FX.lac(5); FX.vong1(o.x, o.y, 8, 60, '#7ffcff', 0.35, 4); SND.no(0.7);
    }
    return G.ban[T.ban].t[T.o] !== T && o.t > 0.2 && false;
  },
  ve(ctx, o, R) {
    const u = o.t / o.song, a = Math.min(1, o.t / 0.15) * (u > 0.85 ? 0.5 + 0.5 * Math.sin(o.t * 50) : 1);
    const nx = -Math.sin(o.goc), ny = Math.cos(o.goc), L = DUONG_RONG * 0.62;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
    // tia chiếu từ ụ tới tường
    const T = o.T;
    if (G.ban[T.ban].t[T.o] === T) { const [x, y] = dauNong(T); ctx.globalAlpha = a * 0.5; R.tia(ctx, 'tia_laser', x, y, o.x, o.y, 6, o.t * 200); ctx.globalAlpha = a; }
    // tấm tường ánh sáng: dải sáng dày + vạch quét + 2 cột phát ở mép đường
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.goc);
    const day = 9 + 2 * Math.sin(o.t * 30);
    const g = ctx.createLinearGradient(-day * 2, 0, day * 2, 0);
    g.addColorStop(0, 'rgba(80,255,255,0)'); g.addColorStop(0.5, 'rgba(150,255,255,.75)'); g.addColorStop(1, 'rgba(80,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(-day * 2, -L, day * 4, L * 2);
    for (let i = -3; i <= 3; i++) { const yy = ((o.t * 60 + i * 12) % (L * 2)) - L; ctx.fillStyle = 'rgba(210,255,255,.5)'; ctx.fillRect(-day, yy, day * 2, 1.5); }
    ctx.restore();
    for (let k = -1; k <= 1; k++) {
      const ox = Math.cos(o.goc) * k * 4, oy = Math.sin(o.goc) * k * 4;
      R.tia(ctx, 'tia_set', o.x - nx * L + ox, o.y - ny * L + oy, o.x + nx * L + ox, o.y + ny * L + oy, 16 - Math.abs(k) * 5, o.t * 150 + k * 40);
    }
    for (const sg of [-1, 1]) R.anhGiua(ctx, R.cham1('#7ffcff'), o.x + nx * L * sg, o.y + ny * L * sg, 26 + 4 * Math.sin(o.t * 20));
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.hoden = { // hố đen: kéo quái về tâm, rút máu, cuối cùng nghiền
  cap(G, o, dt) {
    o.acc += dt;
    for (const E of dsMucTieu(o.B)) {
      const dd = Math.hypot(E.x - o.x, E.y - o.y);
      if (dd > o.r) continue;
      if (E.p === o.p) E.keo = clamp((o.s - E.s) * 2.2, -120, 120) * (E.trum ? 0.3 : 1) - E.d.v * (E.trum ? 0.3 : 0.85);
      if (o.acc > 0.25) trung(E, o.dps * 0.25 * 2, { B: o.B, crit: false, im: true, mau: '#ff6ad5' });
      if (Math.random() < dt * 6) FX.hat1('lua', E.x, E.y, (o.x - E.x) * 2, (o.y - E.y) * 2, 0.4, 7, '#ff5a8a');
    }
    if (o.acc > 0.25) o.acc = 0;
    if (Math.random() < dt * 40) { const a = Math.random() * 6.28, r = o.r * rnd(0.6, 1.1); FX.hat1('lua', o.x + Math.cos(a) * r, o.y + Math.sin(a) * r, -Math.cos(a + 0.9) * r * 2.2, -Math.sin(a + 0.9) * r * 2.2, 0.45, 7, pick(['#ff3b6b', '#b04bff', '#ffffff'])); }
    if (o.t >= o.song - 0.02 && !o.no) {
      o.no = true; noLan(o.x, o.y, o.r, o.dmg, o.B, { mau: '#ff6ad5' });
      FX.no('laser_trung', o.x, o.y, o.r * 3, 0.5); FX.lac(8); FX.sang(0.25, '#ff3b6b'); FX.vong1(o.x, o.y, o.r, 4, '#ff5a8a', 0.3, 5); SND.no(1);
    }
  },
  ve(ctx, o, R) {
    const u = o.t / o.song, mo = Math.min(1, o.t / 0.3) * (u > 0.9 ? (1 - u) * 10 : 1), r = o.r * (0.55 + 0.1 * Math.sin(o.t * 9));
    ctx.save(); ctx.translate(o.x, o.y);
    // vành bồi tụ mờ + lõi đen đặc
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, o.r);
    g.addColorStop(0, 'rgba(0,0,0,' + mo + ')'); g.addColorStop(0.28, 'rgba(8,0,14,' + 0.95 * mo + ')'); g.addColorStop(0.42, 'rgba(150,20,90,' + 0.55 * mo + ')'); g.addColorStop(0.7, 'rgba(90,10,120,' + 0.2 * mo + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    // tay xoáy quay (vòng cung sáng cuộn vào tâm)
    for (let k = 0; k < 4; k++) {
      const a0 = -o.t * 4.5 + k * Math.PI / 2;
      ctx.strokeStyle = k % 2 ? 'rgba(255,90,170,' + 0.7 * mo + ')' : 'rgba(190,110,255,' + 0.7 * mo + ')';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i <= 16; i++) { const u = i / 16, rr = r * (1.35 - u * 0.95), a = a0 + u * 2.6; const px = Math.cos(a) * rr, py = Math.sin(a) * rr; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
    }
    ctx.globalAlpha = 0.5 * mo; R.khung(ctx, 'fx_laser_trung', 3, 0, 0, r * 2.6, o.t * 2);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = mo;
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,150,220,' + 0.9 * mo + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, r * 0.34, 0, Math.PI * 2); ctx.stroke();
    ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.sam = { // overlord: tia sấm khổng lồ + chớp màn hình
  cap(G, o) {
    if (!o.da && o.t > 0.08) {
      o.da = true; noLan(o.x, o.y, o.r, o.dmg, o.B, { mau: '#fff27a' });
      FX.no('dien', o.x, o.y, o.r * 3, 0.55); FX.no('no_phao', o.x, o.y, o.r * 2.2, 0.6); FX.sang(0.7, '#fff6c0'); FX.lac(12);
      FX.vong1(o.x, o.y, 10, o.r, '#fff27a', 0.4, 6); FX.tiaLua(o.x, o.y, 30, '#fff27a', 320, 14);
    }
  },
  ve(ctx, o, R) {
    const u = o.t / o.song;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.max(0, 1 - u) * (1.15 - 0.15 * Math.cos(R.t * 40));
    const nhip = Math.floor(R.t / 0.045);
    R.set(ctx, o.x0, o.y0, o.x, o.y, 40, o.seed + nhip);
    R.set(ctx, o.x + 14, -30, o.x, o.y, 60, o.seed + nhip * 3 + 1);
    R.set(ctx, o.x - 18, -30, o.x, o.y, 34, o.seed + nhip * 5 + 2);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.chieuTrum = { // tia phép của trùm tới ụ bị nhắm
  ve(ctx, o, R) {
    const u = o.t / o.song;
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - u;
    R.tia(ctx, 'tia_laser', o.x0, o.y0, o.x0 + (o.x1 - o.x0) * Math.min(1, u * 3), o.y0 + (o.y1 - o.y0) * Math.min(1, u * 3), 10, o.t * 300);
    R.anhGiua(ctx, 'tia_lua', o.x1, o.y1, 50 * (1 - u), o.t * 5, 1);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.gui = { // PVP: quái đã giết bay sang cổng đối thủ (vệt tím)
  ve(ctx, o, R) {
    const u = o.t / o.song, e = u * u * (3 - 2 * u);
    const x = o.x0 + (o.x1 - o.x0) * e, y = o.y0 + (o.y1 - o.y0) * e - Math.sin(u * Math.PI) * 60;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) { const v = Math.max(0, e - i * 0.03); const xx = o.x0 + (o.x1 - o.x0) * v, yy = o.y0 + (o.y1 - o.y0) * v - Math.sin(Math.max(0, u - i * 0.03) * Math.PI) * 60; R.anhGiua(ctx, R.cham1('#c77dff'), xx, yy, 18 - i * 3, 0, 0.9 - i * 0.15); }
    R.anhGiua(ctx, 'tia_lua', x, y, 20, o.t * 8, 1);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
