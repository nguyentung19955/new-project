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
  mo: (T) => 'Vùng nổ ' + SKILLS.canon.banKinh(T) + ' px',
  ban(G, B, T, E) {
    giat(T, 1.4); const [x, y] = chopNong(T, 34); phutKhoi(x, y, 2); SND.phao();
    const dmg = dmgU(T), r = this.banKinh(T);
    banDan({ img: 'dan_phao', x, y, muc: E, px: E.x, py: E.y, sp: 280, co: 24, cong: 30, B, T, duoi: true,
      trung(G, d) { noLan(d.x, d.y, r, dmg, B); FX.no('no_phao', d.x, d.y, r * 2.5, 0.5); FX.vong1(d.x, d.y, 4, r, '#ffb35a', 0.3, 3); FX.tiaLua(d.x, d.y, 8, '#ffb060', 200); FX.lac(2.5); SND.no(0.35); } });
  },
};
SKILLS.lien = { // Liên Thanh (Esch): bắn rất nhanh; sao tăng tốc bắn
  vai: 'tc', dmg: 6, toc: 3.0, tocSao: 0.14, nham: 'dau',
  mo: (T) => 'Tốc bắn ' + tocU(T).toFixed(1) + '/s',
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
  mo: (T) => 'Làm chậm ' + Math.round(SKILLS.bang.cham(T) * 100) + '% · 4 s',
  ban(G, B, T, E) {
    giat(T, 0.6); chopNong(T, 20); SND.bang();
    const dmg = dmgU(T), c = this.cham(T);
    danThang(B, T, E, 'dan_bang', 430, 22, (G, d, M) => {
      FX.no('bang_vo', d.x, d.y, 46, 0.35);
      if (M) { trung(M, dmg, { B, mau: '#bff4ff' }); if (!M.d.khangCham) { M.cham = Math.max(M.cham, c); M.chamT = 4; } else FX.chu1(M.x, M.y - 20, 'MIỄN', '#7fdcff', 11); }
    }, 'bang');
  },
};
SKILLS.doc = { // Độc (Unknown): gây độc theo thời gian + đám mây độc đọng lại
  vai: 'tc', dmg: 6, toc: 0.9, nham: 'dau',
  mo: (T) => 'Độc ' + Math.round(dmgU(T) * 1.6) + '/s · 4 s',
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
  mo: () => '+100% vào quái to & trùm',
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
  mo: (T) => 'Sét chuỗi ' + T.sao + ' quái',
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
  mo: (T) => '+' + Math.round(SKILLS.radar.them(T) * 100) + '% tốc bắn ô kề',
  hoTro(G, T, N) { N.buf.toc += this.them(T); },
  capNhat(G, B, T, dt) {
    T.goc += dt * 1.3; // chảo radar quay đều
    T.nap += dt / 2.2;
    if (T.nap >= 1) { T.nap = 0; const ke = keCan(B, T.o).filter(Boolean); if (ke.length) G.hu.push({ k: 'ping', t: 0, song: 0.7, T, ke }); }
    return true;
  },
};
SKILLS.mimic = { // Mimic (Aurora): ghép với BẤT KỲ ụ cùng sao; ghép xong buff tấn công
  vai: 'db', dmg: 8, toc: 1.0, nham: 'dau',
  mo: () => 'Ghép với mọi ụ cùng sao · ụ mới +50% công 8 s',
  ban(G, B, T, E) {
    giat(T, 0.3);
    const dmg = dmgU(T);
    danThang(B, T, E, 'tia_lua', 380, 18, (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#ffd6ff' }); FX.tiaLua(d.x, d.y, 3, pick(['#ff6ad5', '#7fdcff', '#ffe46b']), 100, 7); });
  },
};
SKILLS.laser = { // Laser (Nebula): tia liên tục, giữ càng lâu càng mạnh (đổi mục tiêu thì về 0)
  vai: 'tc', dmg: 12, toc: 1,
  mo: (T) => 'Tia tăng tới ×4 sau 3 s',
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
    if (!B.ai && Math.random() < dt * 4) SND.laser();
    return true;
  },
};
SKILLS.mortar = { // Súng Cối (Nade): bắn quái ngẫu nhiên, đạn vòng cao nổ lan
  vai: 'tc', dmg: 20, toc: 0.55, nham: 'ngau',
  mo: () => 'Nổ lan 46 px · mục tiêu ngẫu nhiên',
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
  mo(T) { const b = this.bingo(G.ban[T.ban], T); return 'Hàng ngang ' + b.ngang + '/5 · hàng dọc ' + b.doc + '/3'; },
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
  mo: () => 'Khi ghép: bắn phá từ vệ tinh 20 s',
  ban(G, B, T, E) {
    giat(T, 0.5); chopNong(T, 22); SND.lien();
    const dmg = dmgU(T);
    danThang(B, T, E, 'dan_tia', 560, 22, (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#9fe6ff' }); FX.no('dien', d.x, d.y, 26, 0.2); });
  },
  ghep(G, B, a, b) {
    B.phao = 20; B.phaoSao = Math.max(a.sao, b.sao) + 1; B.phaoT = 0.2;
    const c = B.o[b.o]; FX.chu1(c.x, c.y - 40, 'VỆ TINH KHAI HOẢ!', '#9fe6ff', 16, 'to');
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
  mo: (T) => 'Tường chặn ' + (2.4 + 0.3 * T.sao).toFixed(1) + ' s rồi nổ',
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
  mo: (T) => 'Hố đen bán kính ' + (64 + 4 * T.sao) + ' px · nghiền ×8',
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
  mo: (T) => 'Nạp ' + (7 - 0.5 * (T.sao - 1)).toFixed(1) + ' s · sấm ×12 vùng 92 px',
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
    const u = o.t / o.song, nhip = Math.floor(o.t / 0.05);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - u * 0.6;
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
HU.ping = { // radar: vòng ping lan tới ụ được buff
  ve(ctx, o, R) {
    const c = tamU(o.T), u = o.t / o.song;
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(90,255,230,' + (1 - u) * 0.8 + ')'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(c.x, c.y, 10 + u * 40, 0, Math.PI * 2); ctx.stroke();
    for (const N of o.ke) {
      const n = tamU(N);
      const px = c.x + (n.x - c.x) * Math.min(1, u * 1.6), py = c.y + (n.y - c.y) * Math.min(1, u * 1.6);
      R.anhGiua(ctx, 'tia_lua', px, py, 16 * (1 - u * 0.5), 0, 0.9 * (1 - u));
      if (u > 0.55) { ctx.strokeStyle = 'rgba(90,255,230,' + (1 - u) * 1.6 + ')'; ctx.beginPath(); ctx.arc(n.x, n.y, 26, 0, Math.PI * 2); ctx.stroke(); }
    }
    ctx.globalCompositeOperation = 'source-over';
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
    for (let k = -1; k <= 1; k++) {
      const ox = Math.cos(o.goc) * k * 4, oy = Math.sin(o.goc) * k * 4;
      R.tia(ctx, 'tia_set', o.x - nx * L + ox, o.y - ny * L + oy, o.x + nx * L + ox, o.y + ny * L + oy, 16 - Math.abs(k) * 5, o.t * 150 + k * 40);
    }
    const g = ctx.createRadialGradient(o.x, o.y, 2, o.x, o.y, L * 1.1);
    g.addColorStop(0, 'rgba(120,255,255,.5)'); g.addColorStop(1, 'rgba(120,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, L * 1.1, 0, Math.PI * 2); ctx.fill();
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
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, o.r);
    g.addColorStop(0, 'rgba(0,0,0,' + 0.95 * mo + ')'); g.addColorStop(0.35, 'rgba(20,0,30,' + 0.8 * mo + ')'); g.addColorStop(0.7, 'rgba(120,20,90,' + 0.25 * mo + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, o.r, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 3; k++) { ctx.globalAlpha = 0.55 * mo; R.khung(ctx, 'fx_laser_trung', 3 + k % 2, 0, 0, r * (2.2 - k * 0.45), -o.t * (3 + k * 2) + k); }
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
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - u;
    const nhip = Math.floor(o.t / 0.05);
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
