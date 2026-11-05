// TURRET MERGE — ỤNG MỚI ĐỢT 1 (docs/demo-hop-tuong/TUONG-MOI-20.md §5.3): Ricochet · Combo Core · Chrono Lock · Hydra ·
// Nine-Tail · Pandora Vault · Resonance Grid · Chrono Throne. Nạp SAU artscale.js (cần SKILLS, HU, GROW, HO, MOC_RIENG, STAGE_K).
// Quy ước như skills.js / skills2.js: SKILLS['<id>'] = { vai, dmg, toc, ban / capNhat / hoTro / ghep / chuDong … }, HU['<k>'] = hiệu ứng trên sân.
'use strict';

// ---------- tiện ích riêng ----------
const sao7 = (T, ds) => ds[clamp(T.sao, 1, 7) - 1];                 // giá trị theo bảng ★1→★7
const quaiTheoDau = (B) => dsMucTieu(B).filter(E => !E.chet).sort((a, b) => (G.duong[a.p].len - a.s) - (G.duong[b.p].len - b.s));
const gocXa = (x, y, E) => Math.hypot(E.x - x, E.y - y);
// mọi quái trong tầm của bàn B nằm gần đoạn thẳng (x0,y0)→(x1,y1)
function quaiTrenDoan(B, x0, y0, x1, y1, rong) {
  const L = Math.hypot(x1 - x0, y1 - y0) || 1, ux = (x1 - x0) / L, uy = (y1 - y0) / L, ds = [];
  for (const E of dsMucTieu(B)) {
    const t = (E.x - x0) * ux + (E.y - y0) * uy; if (t < -8 || t > L + 8) continue;
    if (Math.hypot(E.x - (x0 + ux * t), E.y - (y0 + uy * t)) < rong + E.d.co * 0.25) ds.push(E);
  }
  return ds;
}
// 4 ô CHÉO của ô o (có kiểm biên)
function oCheo(o) { const c = o % 5, h = (o / 5) | 0, ds = []; for (const [dc, dh] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const cc = c + dc, hh = h + dh; if (cc >= 0 && cc < 5 && hh >= 0 && hh < 3) ds.push(hh * 5 + cc); } return ds; }

// =====================================================================================================
// P3 · RICOCHET (nayda) — Tím TC: đĩa răng cưa nảy sang quái gần nhất (≤90 px), không trúng lại quái cũ, mỗi lần nảy MẠNH hơn
// =====================================================================================================
SKILLS.nayda = {
  vai: 'tc', dmg: 11, toc: 1.1, nham: 'dau',
  nay: (T) => T.sao,                                                       // số lần nảy ★1→★7: 1…7
  them: (T) => sao7(T, [0.15, 0.15, 0.18, 0.18, 0.2, 0.22, 0.25]),         // +sát thương mỗi lần nảy
  mo: (T) => 'Bounces ' + SKILLS.nayda.nay(T) + '× (90 px, never the same enemy) · +' + Math.round(SKILLS.nayda.them(T) * 100) + '% per bounce → last hit ×' + (1 + SKILLS.nayda.them(T) * SKILLS.nayda.nay(T)).toFixed(2),
  ban(G, B, T, E) {
    giat(T, 0.6); const [x, y] = chopNong(T, 22); SND.nay(0);
    G.hu.push({ k: 'dia', t: 0, song: 6, x, y, E, B, T, dmg: dmgU(T), n: 0, max: this.nay(T), b: this.them(T), da: [], vet: [], goc: 0 });
  },
};
HU.dia = { // đĩa nảy: bay đuổi mục tiêu, trúng → tìm quái gần nhất chưa trúng → nảy tiếp, to & sáng dần
  cap(G, o, dt) {
    if (!o.E || o.E.chet) { // mục tiêu chết giữa đường: nhảy sang quái gần nhất chưa trúng (≤90 px), không có → tắt
      const N = this.ke(o, o.x, o.y); if (!N) return true; o.E = N;
    }
    const v = 520 + o.n * 40, dx = o.E.x - o.x, dy = o.E.y - o.y, L = Math.hypot(dx, dy);
    o.goc += dt * 26; o.vet.push(o.x, o.y); if (o.vet.length > 10) o.vet.splice(0, 2);
    if (L > v * dt + 6) { o.x += dx / L * v * dt; o.y += dy / L * v * dt; return false; }
    // TRÚNG
    o.x = o.E.x; o.y = o.E.y;
    const k = 1 + o.b * o.n;
    trung(o.E, o.dmg * k, { B: o.B, T: o.T, mau: o.n ? '#e8ff8a' : '#d6ff3a' });
    o.da.push(o.E);
    FX.vong1(o.x, o.y, 4, 14 + o.n * 3, '#d6ff3a', 0.22, 2); FX.tiaLua(o.x, o.y, 3 + o.n, '#d6ff3a', 150, 7);
    if (o.n >= o.max) { FX.no('dien', o.x, o.y, 30 + o.n * 3, 0.2); return true; }
    const N = this.ke(o, o.x, o.y); if (!N) return true;
    o.n++; o.E = N; SND.nay(o.n);
    if (o.n >= 3 && o.n === o.max) nhanU(o.T, 'RICOCHET ×' + o.n, '#d6ff3a');
    return false;
  },
  ke(o, x, y) { let m = null, best = 90; for (const Q of dsMucTieu(o.B)) if (!Q.chet && !o.da.includes(Q)) { const d = Math.hypot(Q.x - x, Q.y - y); if (d < best) { best = d; m = Q; } } return m; },
  ve(ctx, o, R) {
    const r = 6 + o.n * 0.9;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i + 1 < o.vet.length; i += 2) { const a = (i + 2) / o.vet.length; ctx.globalAlpha = a * 0.5; R.anhGiua(ctx, R.cham1('#d6ff3a'), o.vet[i], o.vet[i + 1], r * 2.2 * a); }
    ctx.globalAlpha = 0.55 + 0.05 * o.n; R.anhGiua(ctx, R.cham1('#d6ff3a'), o.x, o.y, r * 4);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    // lưỡi cưa tròn: đĩa xám + răng + vành vàng chanh (tròn tuyệt đối)
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.goc);
    const cua = R.co('hu_luoicua', r * 2.76); // lưỡi cưa ChatGPT (S4)
    if (cua) { ctx.drawImage(cua, -r * 1.38, -r * 1.38, r * 2.76, r * 2.76); ctx.restore(); return; }
    ctx.fillStyle = '#2a2f36'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
    ctx.fillStyle = '#d6ff3a';
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); ctx.lineTo(Math.cos(a + 0.28) * r * 1.38, Math.sin(a + 0.28) * r * 1.38); ctx.lineTo(Math.cos(a + 0.5) * r, Math.sin(a + 0.5) * r); ctx.fill(); }
    ctx.strokeStyle = '#efffb0'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, 7); ctx.stroke();
    ctx.fillStyle = '#efffb0'; ctx.beginPath(); ctx.arc(0, 0, r * 0.22, 0, 7); ctx.fill();
    ctx.restore();
  },
};

// =====================================================================================================
// P2 · COMBO CORE (combo) — Tím TC: COMBO = số lần GHÉP 2 Combo Core (hoặc Mimic + Combo Core) trong trận
//      mọi Combo Core +c% sát thương × COMBO (c theo sao của chính ụ; sau COMBO 20 mỗi combo chỉ còn ½)
// =====================================================================================================
SKILLS.combo = {
  vai: 'tc', dmg: 15, toc: 1, nham: 'dau',
  c: (T) => sao7(T, [0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12]),
  hl: (n) => Math.min(n, 20) + Math.max(0, n - 20) * 0.5,               // COMBO hiệu lực (giảm ½ sau 20)
  hieuLuc(B) { // co-op: cả 2 cùng mang Combo Core → cộng thêm ½ COMBO của đồng đội
    let n = this.hl(B.combo || 0);
    if (G.che === 'coop') { const D = banKhac(B); if (D && D.deck.includes('combo')) n += 0.5 * this.hl(D.combo || 0); }
    return n;
  },
  mo(T) { const B = G.ban[T.ban], n = B.combo || 0; return 'COMBO ×' + n + ' → +' + Math.round(this.c(T) * this.hieuLuc(B) * 100) + '% damage (' + Math.round(this.c(T) * 100) + '% per combo' + (n > 20 ? ', halved after 20' : '') + ')'; },
  capNhat(G, B, T) { T.buf.dmg += this.c(T) * this.hieuLuc(B); return false; },
  ban(G, B, T, E) { // nòng đôi: 2 viên cam liền nhau
    giat(T, 0.5); SND.lien();
    const dmg = dmgU(T) * 0.5, [x, y] = dauNong(T), nx = -Math.sin(T.goc) * 4, ny = Math.cos(T.goc) * 4;
    FX.no('chop_nong', x, y, 20, 0.07, T.goc);
    for (const s of [-1, 1]) banDan({ img: 'tia_lua', x: x + nx * s, y: y + ny * s, muc: E, px: E.x, py: E.y, sp: 560 + s * 30, co: 13, B, T, trung: (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#ffb36a' }); } });
  },
  ghep(G, B, a, b, ra) {
    if (!((a.id === 'combo' || a.id === 'mimic') && (b.id === 'combo' || b.id === 'mimic'))) return; // chỉ Combo+Combo / Mimic+Combo
    B.combo = (B.combo || 0) + 1;
    const n = B.combo, c = B.o[b.o];
    const hien = () => { FX.chu1(c.x, c.y - 44, 'COMBO ×' + n, '#ff8a2a', Math.min(26, 17 + n * 0.4), 'to'); FX.vong1(c.x, c.y, 8, 46, '#ff8a2a', 0.35, 3); if (!B.ai || G.che === 'pvp') SND.combo(n); };
    if (G._treNhan && typeof VX !== 'undefined') VX.hen(G._treNhan, hien); else hien();
    for (const X of B.t) if (X && X.id === 'combo' && X !== ra) { X.sang = 1; nhanU(X, '+' + Math.round(this.c(X) * 100) + '%', '#ff8a2a'); }
  },
  sangDau: (T) => (T.gd === 3 ? 0.28 + 0.12 * Math.sin(G.t * 9) : T.gd === 2 ? 0.1 : 0),
  veThem(ctx, T, S, al, R, B) { // vòng số quay theo giai đoạn + nhãn ×N dưới bệ
    const n = (B && B.combo) || 0, gd = T.gd || 1;
    ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 1.6;
    for (let i = 0; i < Math.min(2, gd); i++) {
      ctx.globalAlpha = al * 0.55; ctx.strokeStyle = gd === 3 ? '#ff5a1a' : '#ff8a2a'; ctx.setLineDash([3, 5]); ctx.lineDashOffset = (i ? -1 : 1) * R.t * 18;
      ctx.beginPath(); ctx.arc(0, 0, S * (0.43 + i * 0.05), 0, 7); ctx.stroke();
    }
    ctx.setLineDash([]);
    if (gd === 3) { ctx.globalAlpha = al * (0.3 + 0.12 * Math.sin(R.t * 8)); R.anhGiua(ctx, R.cham1('#ff5a1a'), 0, 0, S * 0.75); }
    ctx.globalCompositeOperation = 'source-over';
    if (n > 0) {
      const s = '×' + n; ctx.globalAlpha = al; ctx.font = '900 9px ' + FONT.display; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const w = ctx.measureText(s).width + 8, y = S * 0.44;
      ctx.fillStyle = 'rgba(20,12,6,.9)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-w / 2, y - 6, w, 12, 6) : ctx.rect(-w / 2, y - 6, w, 12); ctx.fill();
      ctx.strokeStyle = '#ff8a2a'; ctx.lineWidth = 1; ctx.stroke(); ctx.fillStyle = '#ffd0a0'; ctx.fillText(s, 0, y + 0.5);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    }
  },
};

// =====================================================================================================
// P1 · CHRONO LOCK (khoathoigian) — Tím ĐB: mỗi chu kỳ khoá quái ĐẦU (không trùm) trong ô thời gian, đứng yên t s;
//      sát thương nhận trong lúc khoá DỒN LẠI, mở khoá nổ x% lượng dồn vào quái đó + quái trong 40 px.
//      Trùm: chậm 50% trong t/2 s, nổ 50%. Frost Flyer miễn chậm nhưng KHÔNG miễn khoá. Khi GHÉP: khoá ngay 1 quái.
// =====================================================================================================
SKILLS.khoathoigian = {
  vai: 'db', dmg: 10, toc: 0.8, nham: 'dau', napMau: '#45e0c8',
  ky: (T) => sao7(T, [9, 8.5, 8, 7.5, 7, 6.5, 6]),
  dai: (T) => sao7(T, [1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.5]),
  no: (T) => sao7(T, [0.3, 0.35, 0.4, 0.45, 0.5, 0.6, 0.75]),
  mo: (T) => 'Every ' + SKILLS.khoathoigian.ky(T) + 's locks the lead enemy ' + SKILLS.khoathoigian.dai(T) + 's · release bursts ' + Math.round(SKILLS.khoathoigian.no(T) * 100) + '% of stored damage (40 px) · bosses: 50% slow, half time · on merge: lock now',
  capNhat(G, B, T, dt) {
    if (G.hu.some(o => o.k === 'khoa' && o.T === T)) return false; // tối đa 1 quái bị khoá / ụ
    T.nap = Math.min(1, T.nap + dt * (1 + T.buf.toc) / this.ky(T));
    if (T.nap >= 1 && this.khoa(G, B, T, T.sao)) T.nap = 0;
    return false;
  },
  khoa(G, B, T, sao) {
    const ds = quaiTheoDau(B).filter(E => !E.khoaHu);
    const E = ds.find(E => !E.trum) || ds[0]; if (!E) return false;
    const S = { sao }, trum = !!E.trum, dai = this.dai(S) * (trum ? 0.5 : 1);
    const o = { k: 'khoa', t: 0, song: dai, E, B, T, hp: E.hp, don: 0, pct: this.no(S) * (trum ? 0.5 : 1), x: E.x, y: E.y, trum };
    E.khoaHu = o; E.chan = Math.max(E.chan || 0, dai); E.chamT = Math.max(E.chamT, dai); // bị khoá = "đang chậm" (Ice Blade ×5)
    G.hu.push(o);
    if (conTren(T)) { const [x, y] = dauNong(T); tiaPhep(x, y, E.x, E.y, '#45e0c8'); }
    FX.vong1(E.x, E.y, 30, 10, '#45e0c8', 0.3, 3); SND.tich();
    return true;
  },
  ghep(G, B, a, b, ra) { if (this.khoa(G, B, ra, Math.min(7, a.sao + 1))) nhanU(ra, 'TIME LOCK!', '#45e0c8', true); },
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'dan_bang', co: 15, mau: '#9ff5e6', sp: 520 }); },
};
HU.khoa = { // ô thời gian lục giác trong suốt quanh quái + đồng hồ đếm ngược; hết giờ → kính vỡ, nổ phần sát thương đã dồn
  cap(G, o, dt) {
    const E = o.E;
    o.don += Math.max(0, o.hp - Math.max(0, E.hp)); o.hp = Math.max(0, E.hp);
    if (!E.chet) { o.x = E.x; o.y = E.y; E.chan = Math.max(E.chan || 0, o.song - o.t); }
    if (E.chet) { this.no(G, o); return true; }
    return false;
  },
  het(G, o) { this.no(G, o); },
  no(G, o) {
    if (o.daNo) return; o.daNo = true; if (o.E.khoaHu === o) o.E.khoaHu = null;
    const dmg = o.don * o.pct;
    G.dangBan = o.T;
    if (dmg > 0) noLan(o.x, o.y, 40, dmg, o.B, { phu: true, crit: false, mau: '#45e0c8' });
    FX.no('bang_vo', o.x, o.y, 74, 0.35); FX.vong1(o.x, o.y, 6, 40, '#45e0c8', 0.32, 3); FX.tiaLua(o.x, o.y, 10, '#bff8ee', 190, 8);
    if (dmg >= 1) FX.chu1(o.x, o.y - 30, 'TIME BURST ' + Math.round(dmg), '#45e0c8', 13, 'to');
    SND.kinhVo();
  },
  ve(ctx, o, R) {
    const E = o.E, x = E.chet ? o.x : E.x, y = E.chet ? o.y : E.y, r = (E.d.co || 40) * 0.58 + 4, vao = Math.min(1, o.t / 0.12), con = Math.max(0, o.song - o.t);
    ctx.save(); ctx.translate(x, y);
    const kinh = R.co('hu_khoa', r * 2.1); // kính bát giác + mặt đồng hồ ChatGPT (S4); vành tiến độ + kim + số giây vẽ đè bằng code
    if (kinh) { const rr = r * (0.8 + 0.2 * vao) * 1.05; ctx.globalAlpha = 0.82 * vao; ctx.drawImage(kinh, -rr, -rr, rr * 2, rr * 2); }
    else {
    // kính lục giác
    ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6, rr = r * (0.8 + 0.2 * vao); i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath();
    ctx.globalAlpha = 0.22 * vao; ctx.fillStyle = '#45e0c8'; ctx.fill();
    ctx.globalAlpha = 0.9 * vao; ctx.strokeStyle = '#9ff5e6'; ctx.lineWidth = 2; ctx.stroke();
    }
    // kim đồng hồ quay + vành tiến độ (tròn)
    ctx.globalAlpha = 0.85 * vao; ctx.strokeStyle = '#45e0c8'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.62, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (con / o.song)); ctx.stroke();
    const a = o.t * 5; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a - Math.PI / 2) * r * 0.48, Math.sin(a - Math.PI / 2) * r * 0.48); ctx.stroke();
    ctx.restore();
    // số giây + sát thương đang dồn
    ctx.font = '900 11px ' + FONT.display; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.globalAlpha = vao;
    const s = con.toFixed(1); ctx.strokeText(s, x, y - r - 3); ctx.fillStyle = '#9ff5e6'; ctx.fillText(s, x, y - r - 3);
    ctx.globalAlpha = 1; ctx.textAlign = 'left';
  },
};

// =====================================================================================================
// G2 · HYDRA (hydra) — Vàng TC: số nòng = số sao (tối đa 6), mỗi nòng bắn 1 quái KHÁC (ưu tiên gần lối ra), 55% sát thương/nòng.
//      7★ "HỢP ĐẦU": 6 nòng nhập 1 → tia khổng lồ xuyên toàn bộ quái trên 1 đường, ×6, 0.6 lần/s. Forms: 1–3★ / 4–6★ / 7★.
// =====================================================================================================
SKILLS.hydra = {
  vai: 'tc', dmg: 15, toc: 1.2, nham: 'dau',
  nong: (T) => Math.min(6, T.sao),
  mo: (T) => T.sao >= 7 ? 'FUSED HEAD: piercing beam ×6 through every enemy in line · ' + (0.6 * (1 + T.buf.toc)).toFixed(2) + '/s' : SKILLS.hydra.nong(T) + ' barrels · each hits a different enemy for 55% · 7★: barrels fuse into a ×6 piercing beam',
  capNhat(G, B, T, dt) {
    if (T.sao < 7) return false;
    const E = quaiDau(B); xoayDau(T, E, dt);
    T.nap = Math.min(1, T.nap + dt * 0.6 * (1 + T.buf.toc));
    if (T.nap >= 1 && E) {
      const c = tamU(T); if (Math.abs(gocLech(T.goc, Math.atan2(E.y - c.y, E.x - c.x))) > 0.15) return true;
      T.nap = 0; T.banLan++; giat(T, 2.4); const [x, y] = chopNong(T, 44);
      const x1 = x + Math.cos(T.goc) * 720, y1 = y + Math.sin(T.goc) * 720, dmg = dmgU(T) * 6;
      for (const Q of quaiTrenDoan(B, x, y, x1, y1, 18)) trung(Q, dmg, { B, mau: '#2ee89a' });
      G.hu.push({ k: 'hydraTia', t: 0, song: 0.45, x0: x, y0: y, x1, y1 });
      FX.lac(4); FX.sang(0.15, '#2ee89a'); SND.rail();
      if (T.banLan % 4 === 1) nhanU(T, 'FUSED BEAM', '#2ee89a');
    }
    return true;
  },
  ban(G, B, T, E) {
    const n = this.nong(T), ds = quaiTheoDau(B).slice(0, n), dmg = dmgU(T) * 0.55, c = tamU(T), R0 = REN.coDau(T) * 0.4;
    if (!ds.includes(E)) ds[0] = E;
    giat(T, 0.5 + 0.1 * n); SND.lien();
    ds.forEach((Q, i) => {
      const lech = n > 1 ? (i / (n - 1) - 0.5) * 1.1 : 0, g = T.goc + lech, x = c.x + Math.cos(g) * R0, y = c.y + Math.sin(g) * R0;
      trung(Q, dmg, { B, mau: '#7dffc4' });
      G.hu.push({ k: 'tiaTia', t: 0, song: 0.16, x0: x, y0: y, x1: Q.x, y1: Q.y, mau: '#2ee89a' });
      FX.no('chop_nong', x, y, 16, 0.07, Math.atan2(Q.y - y, Q.x - x)); FX.tiaLua(Q.x, Q.y, 2, '#7dffc4', 110, 6);
    });
  },
  sangDau: (T) => (T.gd === 2 ? 0.12 + 0.04 * Math.sin(G.t * 4) : T.gd === 3 ? 0.08 + T.nap * 0.3 : 0),
};
HU.hydraTia = { // tia hợp đầu: lõi trắng + quầng xanh ngọc + vạch rung, mờ dần
  ve(ctx, o, R) {
    const u = o.t / o.song, w = 30 * (1 - u * 0.6);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - u;
    R.tia(ctx, 'tia_laser', o.x0, o.y0, o.x1, o.y1, w, o.t * 500);
    ctx.strokeStyle = 'rgba(46,232,154,.75)'; ctx.lineWidth = w * 0.9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(o.x0, o.y0); ctx.lineTo(o.x1, o.y1); ctx.stroke();
    ctx.strokeStyle = 'rgba(235,255,245,.95)'; ctx.lineWidth = w * 0.28; ctx.beginPath(); ctx.moveTo(o.x0, o.y0); ctx.lineTo(o.x1, o.y1); ctx.stroke();
    ctx.lineCap = 'butt'; R.anhGiua(ctx, R.cham1('#2ee89a'), o.x0, o.y0, 60 * (1 - u));
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};

// =====================================================================================================
// G8 · NINE-TAIL (cuuvi) — Vàng TC: mỗi quái ụ này GIẾT → +1 đuôi lửa (tối đa 9, mỗi đuôi +5% tốc bắn; 5★+: 20% được +2);
//      đủ 9 → xả 9 cầu lửa hồ ly tự dẫn (mỗi quả dmg×(2+0.5×sao)), về 0 đuôi (7★: về 3, cầu lửa nổ lan 40 px).
//      Trùm: mỗi 8% máu tối đa trùm ụ này gây ra = +1 đuôi. Ghép giữ số đuôi cao hơn.
// =====================================================================================================
SKILLS.cuuvi = {
  vai: 'tc', dmg: 16, toc: 1.2, nham: 'dau',
  sinh(G, T) { T.duoi = 0; T.trumAcc = 0; },
  heSo: (T) => 2 + 0.5 * T.sao,
  mo: (T) => 'Tails ' + (T.duoi || 0) + '/9 (+' + 5 * (T.duoi || 0) + '% fire rate) · at 9: 9 homing foxfires ×' + SKILLS.cuuvi.heSo(T).toFixed(1) + (T.sao >= 5 ? ' · 20% double tail' : '') + (T.sao >= 7 ? ' · NINE-TAIL: blasts 40 px, restarts at 3 tails' : '') + ' · bosses: +1 tail per 8% HP dealt',
  them(T, n) {
    T.duoi = Math.min(9, (T.duoi || 0) + n);
    if (T.duoi >= 9) this.xa(T);
  },
  xa(T) {
    const B = G.ban[T.ban]; if (!B || !conTren(T)) return;
    const c = tamU(T), dmg = dmgU(T) * this.heSo(T), thuc = T.sao >= 7;
    const ds = dsMucTieu(B).filter(E => !E.chet).sort((a, b) => b.hp - a.hp);
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 9;
      G.hu.push({ k: 'hoHoa', t: -i * 0.05, song: 3, x: c.x + Math.cos(a) * 18, y: c.y + Math.sin(a) * 18, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160, E: ds.length ? ds[i % ds.length] : null, B, T, dmg, thuc, vet: [] });
    }
    T.duoi = thuc ? 3 : 0; T.sang = 1;
    nhanU(T, 'NINE-TAIL FOXFIRE!', thuc ? '#9fe8ff' : '#ffa020', true); FX.vong1(c.x, c.y, 10, 60, thuc ? '#9fe8ff' : '#ffa020', 0.4, 4); SND.hoLy();
  },
  capNhat(G, B, T) { T.buf.toc += 0.05 * (T.duoi || 0); return false; },
  khiGiet(G, T, E) { if (!E.trum) this.them(T, 1 + (T.sao >= 5 && Math.random() < 0.2 ? 1 : 0)); },
  khiTrung(G, T, E, dmg) {
    if (!E.trum) return;
    T.trumAcc = (T.trumAcc || 0) + dmg; let n = 0;
    while (T.trumAcc >= E.max * 0.08) { T.trumAcc -= E.max * 0.08; n++; }
    if (n) this.them(T, n);
  },
  ghep(G, B, a, b, ra) { if (ra.id === 'cuuvi') { ra.duoi = Math.max(a.id === 'cuuvi' ? a.duoi || 0 : 0, b.id === 'cuuvi' ? b.duoi || 0 : 0); if (ra.duoi >= 9) ra.duoi = 8; } },
  ban(G, B, T, E) {
    const thuc = T.sao >= 7; giat(T, 0.6); chopNong(T, 22); SND.lien();
    const dmg = dmgU(T);
    danThang(B, T, E, 'tia_lua', 520, 16, (G, d, M) => { if (M) trung(M, dmg, { B, mau: thuc ? '#cff4ff' : '#ffc070' }); FX.tiaLua(d.x, d.y, 2, thuc ? '#9fe8ff' : '#ffa020', 110, 6); });
  },
  sangDau: (T) => (T.gd === 2 ? 0.14 + 0.06 * Math.sin(G.t * 6) : 0),
  veThem(ctx, T, S, al, R) { // 9 ngọn đuôi lửa trên vòng TRÒN quanh bệ: sáng = đã có
    const n = T.duoi || 0, thuc = T.sao >= 7, mau = thuc ? '#9fe8ff' : '#ffa020', r = S * 0.47;
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 9, x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i < n) {
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.75 + 0.25 * Math.sin(R.t * 8 + i)); R.anhGiua(ctx, R.cham1(mau), x, y, S * 0.2);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al; ctx.fillStyle = thuc ? '#eaffff' : '#fff0c0'; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 7); ctx.fill();
      } else { ctx.globalAlpha = al * 0.55; ctx.fillStyle = '#1b1d22'; ctx.beginPath(); ctx.arc(x, y, 2, 0, 7); ctx.fill(); ctx.strokeStyle = mau; ctx.lineWidth = 0.8; ctx.stroke(); }
    }
    ctx.globalAlpha = al; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.hoHoa = { // cầu lửa hồ ly: bung ra theo vòng rồi tự dẫn đường vào mục tiêu
  cap(G, o, dt) {
    if (o.t < 0) return false;
    if (!o.E || o.E.chet) { const ds = dsMucTieu(o.B).filter(E => !E.chet); o.E = ds.length ? pick(ds) : null; if (!o.E) return o.t > 0.8; }
    const dx = o.E.x - o.x, dy = o.E.y - o.y, L = Math.hypot(dx, dy) || 1, lai = Math.min(1, o.t * 2.2);
    const v = 260 + o.t * 260;
    o.vx += ((dx / L) * v - o.vx) * Math.min(1, dt * (2 + lai * 10)); o.vy += ((dy / L) * v - o.vy) * Math.min(1, dt * (2 + lai * 10));
    o.x += o.vx * dt; o.y += o.vy * dt;
    o.vet.push(o.x, o.y); if (o.vet.length > 12) o.vet.splice(0, 2);
    if (L < 10 + o.E.d.co * 0.25) {
      G.dangBan = o.T;
      if (o.thuc) noLan(o.x, o.y, 40, o.dmg, o.B, { phu: true, mau: '#cff4ff' }); else trung(o.E, o.dmg, { B: o.B, phu: true, mau: '#ffc070' });
      FX.no(o.thuc ? 'dien' : 'no_phao', o.x, o.y, o.thuc ? 60 : 40, 0.3); FX.tiaLua(o.x, o.y, 6, o.thuc ? '#9fe8ff' : '#ffa020', 160, 8);
      if (o.thuc) FX.vong1(o.x, o.y, 6, 40, '#9fe8ff', 0.3, 3);
      return true;
    }
    return false;
  },
  ve(ctx, o, R) {
    if (o.t < 0) return;
    const mau = o.thuc ? '#9fe8ff' : '#ffa020';
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i + 1 < o.vet.length; i += 2) { const a = (i + 2) / o.vet.length; ctx.globalAlpha = a * 0.6; R.anhGiua(ctx, R.cham1(mau), o.vet[i], o.vet[i + 1], 14 * a); }
    ctx.globalAlpha = 1; R.anhGiua(ctx, R.cham1(mau), o.x, o.y, 22); R.anhGiua(ctx, R.cham1('#ffffff'), o.x, o.y, 8);
    ctx.globalCompositeOperation = 'source-over';
  },
};

// =====================================================================================================
// G4 · PANDORA VAULT (pandora) — Vàng ĐB: khi GHÉP mở hộp, quay 1 trong 6 (đều nhau; 6★+ quay 2 lần lấy cái tốt hơn; 7★ luôn 2 hiệu ứng)
//   1 MANA RAIN +10×sao · 2 FREEZE toàn bộ quái 1.5 s (trùm 0.5; PVP: gửi kèm 1 quái nhỏ sang đối thủ) · 3 STAR GIFT +1★ 1 ụ ngẫu nhiên
//   4 VAULT BOMBS 3 quả vào 3 quái đầu dmg×(3+sao) · 5 SHIELD chặn 1 lần cho 3 ụ · 6 FRENZY toàn bàn +40% tốc bắn 6 s
//   Co-op: 3/5/6 áp cả đồng đội. +★ từ hộp KHÔNG tính là ghép (không kích hoạt hiệu ứng ghép).
// =====================================================================================================
const PANDORA = [
  { k: 'mana', ten: 'MANA RAIN', mau: '#58D9AD' }, { k: 'dong', ten: 'FREEZE', mau: '#78D9F5' }, { k: 'sao', ten: 'STAR GIFT', mau: '#ffe46b' },
  { k: 'bom', ten: 'VAULT BOMBS', mau: '#ff7654' }, { k: 'khien', ten: 'SHIELD ×3', mau: '#73A9FF' }, { k: 'cuong', ten: 'FRENZY', mau: '#FFB547' },
];
const PANDORA_TOT = ['sao', 'cuong', 'bom', 'mana', 'dong', 'khien']; // 6★: quay 2 lần → giữ cái đứng trước trong danh sách này
SKILLS.pandora = {
  vai: 'db', dmg: 10, toc: 0.9, nham: 'dau',
  mo: (T) => 'On merge: opens the vault — 1 of 6 (mana rain · freeze all · +1★ gift · 3 bombs · 3 shields · frenzy)' + (T.sao >= 7 ? ' · OPEN: 2 effects' : T.sao >= 5 ? ' · next merge (6★+) rolls twice, keeps the better' : ''),
  ban(G, B, T, E) { banNhe(B, T, E, { img: 'tia_lua', co: 15, mau: '#ffd86a', sp: 480 }); },
  ghep(G, B, a, b, ra) {
    const sao = Math.min(7, a.sao + 1), lay = () => rint(6);
    let ds;
    if (sao >= 7) { const x = lay(); let y = lay(); while (y === x) y = lay(); ds = [x, y]; }
    else if (sao >= 6) { const x = lay(), y = lay(); ds = [PANDORA_TOT.indexOf(PANDORA[x].k) <= PANDORA_TOT.indexOf(PANDORA[y].k) ? x : y]; }
    else ds = [lay()];
    G.hu.push({ k: 'pandora', t: 0, song: 1.5, B, o: b.o, T: ra, chon: ds, sao, da: false });
    if (!B.ai || G.che !== 'coop') SND.quay();
  },
  lam(G, B, k, sao, c) {
    const D = G.che === 'coop' ? banKhac(B) : null, cacBan = D ? [B, D] : [B];
    if (k === 'mana') { const n = 10 * sao; B.mana += n; B.manaNay += n; FX.chu1(c.x, c.y - 30, '+' + n, '#58D9AD', 18, 'mana'); for (let i = 0; i < 14; i++) FX.hat1('lua', c.x + rnd(-30, 30), c.y - rnd(30, 60), rnd(-10, 10), rnd(40, 90), 0.6, 7, '#58D9AD'); if (!B.ai) SND.mana(); }
    if (k === 'dong') {
      for (const E of dsMucTieu(B)) if (!E.chet) { E.chan = Math.max(E.chan || 0, E.trum ? 0.5 : 1.5); FX.no('bang_vo', E.x, E.y, 44, 0.3); }
      FX.sang(0.18, '#bff4ff'); SND.bang();
      if (G.che === 'pvp') { const dich = G.duong.findIndex(p => p.ban !== B.i); if (dich >= 0) { G.hang.push({ t: G.t + 0.65, id: 'nho', p: dich, gui: true }); const [px, py] = G.duong[dich].pts[0]; G.hu.push({ k: 'gui', t: 0, song: 0.6, x0: c.x, y0: c.y, x1: px, y1: py }); } }
    }
    if (k === 'sao') for (const X of cacBan) { const ds = X.t.filter(N => N && N.sao < LUAT.saoMax && !N.st.da); if (ds.length) { const N = pick(ds), n = X.o[N.o]; tiaPhep(c.x, c.y, n.x, n.y, '#ffe46b'); nangSao(X, N, 1, X === B ? 'VAULT STAR' : 'ALLY STAR'); } }
    if (k === 'bom') {
      const dmg = hsU('pandora', sao, B) * (3 + sao), ds = quaiTheoDau(B).slice(0, 3);
      for (const E of ds) banDan({ img: 'dan_phao', x: c.x, y: c.y, muc: E, px: E.x, py: E.y, sp: 300, co: 18, cong: 60, B, T: null, duoi: true,
        trung(G, d) { noLan(d.x, d.y, 30, dmg, B, { phu: true, mau: '#ff7654' }); FX.no('no_phao', d.x, d.y, 70, 0.4); FX.vong1(d.x, d.y, 4, 30, '#ffb35a', 0.3, 3); SND.no(0.5); } });
    }
    if (k === 'khien') for (const X of cacBan) { const ds = X.t.filter(N => N && !(N.khien > 0)).sort((p, q) => q.sao - p.sao).slice(0, 3); for (const N of ds) { N.khien = 1; const n = X.o[N.o]; tiaPhep(c.x, c.y, n.x, n.y, '#73A9FF'); FX.vong1(n.x, n.y, 30, 10, '#73A9FF', 0.4, 3); } }
    if (k === 'cuong') for (const X of cacBan) for (const N of X.t) if (N && SKILLS[N.id].dmg) { N.tocT = Math.max(N.tocT, 6); N.tocV = Math.max(N.tocV, 0.4); }
  },
  sangDau: (T) => (T.gd === 2 ? 0.1 : T.gd === 3 ? 0.22 + 0.08 * Math.sin(G.t * 5) : 0),
  veThem(ctx, T, S, al, R) { // 4–6★: tia 6 màu lọt khe nắp · 7★: quả cầu cầu vồng lơ lửng (tròn)
    const gd = T.gd || 1; if (gd < 2) return;
    ctx.globalCompositeOperation = 'lighter';
    PANDORA.forEach((p, i) => { const a = R.t * 0.6 + i * Math.PI / 3, L = S * (gd === 3 ? 0.62 : 0.5); ctx.globalAlpha = al * (gd === 3 ? 0.45 : 0.28); ctx.strokeStyle = p.mau; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * S * 0.2, Math.sin(a) * S * 0.2); ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L); ctx.stroke(); });
    if (gd === 3) { const k = Math.floor(R.t * 2) % 6, y = -S * 0.06 + Math.sin(R.t * 3) * 2; ctx.globalAlpha = al * 0.8; R.anhGiua(ctx, R.cham1(PANDORA[k].mau), 0, y, S * 0.5); ctx.globalAlpha = al; R.anhGiua(ctx, R.cham1('#ffffff'), 0, y, S * 0.16); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = al;
  },
};
// biểu tượng 6 phép (vẽ bằng code, nét như ký hiệu buff)
const PANDORA_IC = { mana: 'ic_mana', dong: 'ic_cham', sao: 'ic_sao', bom: 'ic_bom', khien: 'ic_khien', cuong: 'ic_toc' }; // icon ChatGPT (S2)
function vePandora(ctx, k, r, mau) {
  const ic = PANDORA_IC[k] && REN.co(PANDORA_IC[k], r * 2.6);
  if (ic) { ctx.drawImage(ic, -r * 1.3, -r * 1.3, r * 2.6, r * 2.6); return; }
  if (k === 'mana') return veKyHieu(ctx, 'mana', r, mau);
  if (k === 'dong') return veKyHieu(ctx, 'cham', r, mau);
  if (k === 'khien') return veKyHieu(ctx, 'khien', r, mau);
  if (k === 'cuong') return veKyHieu(ctx, 'toc', r, mau);
  ctx.fillStyle = mau; ctx.strokeStyle = mau; ctx.lineWidth = r * 0.3; ctx.beginPath();
  if (k === 'sao') { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
  else { ctx.arc(0, r * 0.15, r * 0.7, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(r * 0.35, -r * 0.4); ctx.quadraticCurveTo(r * 0.6, -r * 0.95, r, -r * 0.8); ctx.stroke(); }
}
HU.pandora = { // vòng quay 6 biểu tượng trên ô ụ vừa ghép (0.8 s, chậm dần) → dừng ở phép trúng → phép nổ ra
  cap(G, o) {
    if (!o.da && o.t >= 0.8) {
      o.da = true; const c = o.B.o[o.o];
      for (const i of o.chon) this.lam(o, PANDORA[i], c);
    }
    return false;
  },
  lam(o, p, c) {
    G.dangBan = null;
    SKILLS.pandora.lam(G, o.B, p.k, o.sao, c);
    FX.chu1(c.x, c.y - 52, p.ten + '!', p.mau, 15, 'to'); FX.vong1(c.x, c.y, 10, 56, p.mau, 0.4, 4);
    if (!o.B.ai) SND.ghep(o.sao);
  },
  ve(ctx, o, R) {
    const c = o.B.o[o.o]; if (!c) return;
    const quay = Math.min(1, o.t / 0.8), e = 1 - Math.pow(1 - quay, 3);
    const hien = o.t < 0.12 ? o.t / 0.12 : o.t > 1.25 ? Math.max(0, 1 - (o.t - 1.25) / 0.25) : 1;
    const cx = c.x, cy = c.y - 40, r = 25;
    const dich = o.chon[0], vong = 3 * Math.PI * 2 + (-dich * Math.PI / 3);
    const g0 = -Math.PI / 2 + vong * e; // ô trúng dừng ở đỉnh vòng
    const dia = R.co('pandora_dia', (r + 13) * 2); // đĩa quay ChatGPT (S4): 6 hốc xoay theo icon
    ctx.save(); ctx.globalAlpha = hien * (dia ? 1 : 0.9);
    if (dia) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(g0 + Math.PI / 2); ctx.drawImage(dia, -(r + 13), -(r + 13), (r + 13) * 2, (r + 13) * 2); ctx.restore(); }
    else { ctx.fillStyle = 'rgba(14,10,24,.88)'; ctx.beginPath(); ctx.arc(cx, cy, r + 13, 0, 7); ctx.fill(); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 1.6; ctx.stroke(); }
    PANDORA.forEach((p, i) => {
      const a = g0 + i * Math.PI / 3, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r, trungo = quay >= 1 && o.chon.includes(i);
      ctx.save(); ctx.translate(x, y); ctx.globalAlpha = hien * (quay >= 1 ? (trungo ? 1 : 0.3) : 0.85);
      if (trungo) { ctx.globalCompositeOperation = 'lighter'; R.anhGiua(ctx, R.cham1(p.mau), 0, 0, 30 + 6 * Math.sin(o.t * 20)); ctx.globalCompositeOperation = 'source-over'; }
      vePandora(ctx, p.k, trungo ? 8 : 6, p.mau); ctx.restore();
    });
    // kim chỉ ở đỉnh
    ctx.globalAlpha = hien; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(cx, cy - r - 9); ctx.lineTo(cx - 4, cy - r - 15); ctx.lineTo(cx + 4, cy - r - 15); ctx.closePath(); ctx.fill();
    ctx.restore(); ctx.globalAlpha = 1;
  },
};

// =====================================================================================================
// G05 · RESONANCE GRID (luoicheo) — Vàng HT: chỉ buff 4 ô CHÉO (không buff ô thẳng): +(7+1.6×sao+LV−1)% × hệ số bậc Vàng 2.1 sát thương.
//      Đủ cả 4 ô chéo có ụ (chỉ ô giữa hàng 2) → RESONANCE ×1.5. 5★ RESONANCE LINK: ụ chéo thêm +15% tốc bắn. Ô ở mép: ít ô chéo, không bù.
// =====================================================================================================
SKILLS.luoicheo = {
  vai: 'ht', dmg: 0, toc: 0,
  goc: (T) => (0.07 + 0.016 * T.sao + 0.01 * (lvU(T) - 1)) * TIERS.vang.hs,
  them(T) { return this.goc(T) * (this.du(T) ? 1.5 : 1); },
  du(T) { const B = G.ban[T.ban]; if (!B) return false; const ds = oCheo(T.o); return ds.length === 4 && ds.every(o => B.t[o] && !B.t[o].st.da); },
  dem(T) { const B = G.ban[T.ban]; return B ? oCheo(T.o).filter(o => B.t[o] && !B.t[o].st.da).length : 0; },
  tamChu: '4 DIAGONAL cells only (not N/E/S/W)',
  huong: () => [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  mo: (T) => '+' + Math.round(SKILLS.luoicheo.them(T) * 100) + '% damage to the 4 DIAGONAL cells (never N/E/S/W) · ' + SKILLS.luoicheo.dem(T) + '/4 filled' + (SKILLS.luoicheo.du(T) ? ' · RESONANCE ×1.5' : ' · fill all 4 (middle row) for RESONANCE ×1.5') + (T.sao >= 5 ? ' · +15% fire rate' : ''),
  hoTro(G, T, N) { N.buf.dmg += this.them(T); if (T.sao >= 5) N.buf.toc += 0.15; },
  gocDau: (T, t) => (T.gd === 3 ? 0.06 * Math.sin(t * 6) : 0), // chữ X luôn chỉ 4 góc chéo
  capNhat(G, B, T, dt) {
    T.nhip = (T.nhip || 0) + dt / (T.gd === 3 ? 1.2 : 2.4);
    if (T.nhip >= 1) { T.nhip = 0; const ke = oCheo(T.o).map(o => B.t[o]).filter(N => N && !N.st.da); if (ke.length) G.hu.push({ k: 'ping', t: 0, song: 0.18, T, ke, rgb: '69,224,200' }); }
    return true;
  },
  sangDau: (T) => (T.gd === 2 ? 0.1 : 0),
};

// =====================================================================================================
// R1 · CHRONO THRONE (ngaithoigian) — Đỏ ĐB: nội tại: mọi quái trên đường bạn chậm thêm 1%/s còn sống (tối đa s%, trùm ≤20%);
//      bắn kim đồng hồ XUYÊN. CHỦ ĐỘNG "REWIND" (mở ở 3★, hồi 40 s → 7★ 28 s): mọi quái lùi r% quãng đã đi (trùm r/3), nhận dmg×6.
//      7★: Rewind hoàn 1 tim (1 lần/trận); Co-op: cứu 1 lần lọt (tự tua ngược). PVP: không ảnh hưởng đối thủ; Co-op: cả 2 đường.
// =====================================================================================================
SKILLS.ngaithoigian = {
  vai: 'db', dmg: 16, toc: 0.8, nham: 'dau', napMau: '#ff2a3a',
  sMax: (T) => sao7(T, [0.15, 0.18, 0.21, 0.24, 0.27, 0.3, 0.35]),
  r: (T) => sao7(T, [0.15, 0.17, 0.19, 0.21, 0.23, 0.26, 0.3]),
  cd: (T) => 40 - 2 * (T.sao - 1),
  mo: (T) => 'Enemies slow 1%/s alive, up to ' + Math.round(SKILLS.ngaithoigian.sMax(T) * 100) + '% (bosses 20%) · piercing hands · ' + (T.sao >= 3 ? 'TAP when full: REWIND ' + Math.round(SKILLS.ngaithoigian.r(T) * 100) + '% of path (bosses ⅓) + ×6 dmg, every ' + SKILLS.ngaithoigian.cd(T) + 's' : 'REWIND unlocks at 3★') + (T.sao >= 7 ? ' · restores 1 heart once' : ''),
  capNhat(G, B, T, dt) {
    // nội tại: chậm dần theo tuổi (không bật "đang chậm" cho Ice Blade — chỉ tốc độ đi)
    const sm = this.sMax(T);
    for (const E of dsMucTieu(B)) {
      if (E.sinhT == null) E.sinhT = G.t;
      const v = Math.min(E.trum ? 0.2 : sm, (G.t - E.sinhT) * 0.01);
      if (!E.d.khangCham && v > (E.thr || 0)) E.thr = v;
      if (!E.d.khangCham && E.cham < v) E.cham = v;
    }
    if (!G.hu.some(o => o.k === 'thrAura' && o.T === T)) G.hu.push({ k: 'thrAura', t: 0, song: 1e9, T, B, sm });
    if (T.sao >= 3) T.nap = Math.min(1, T.nap + dt / this.cd(T));
    if (T.nap >= 1) { T.napDay = (T.napDay || 0) + dt; if (!B.ai && T.napDay > 5 && this.aiNen(G, B, T)) this.chuDong(G, B, T); } else T.napDay = 0;
    return false;
  },
  aiNen: (G, B, T) => dsMucTieu(B).some(E => !E.chet && (E.trum || G.duong[E.p].len - E.s < G.duong[E.p].len * 0.3)),
  chuDong(G, B, T) {
    if (T.nap < 1 || T.sao < 3) return false;
    T.nap = 0; T.napDay = 0; T.sang = 1; giat(T, 2);
    const r = this.r(T), dmg = dmgU(T) * 6;
    const ds = G.che === 'coop' ? G.quai.filter(E => !E.chet && E.vao >= 1) : dsMucTieu(B).filter(E => !E.chet);
    const keo = [];
    G.dangBan = T;
    for (const E of ds) { const s1 = E.s * (1 - (E.trum ? r / 3 : r)); keo.push({ E, s0: E.s, s1 }); trung(E, dmg, { B, mau: '#ff6a6a' }); }
    G.hu.push({ k: 'rewind', t: 0, song: 0.6, keo, T, B });
    const BT = G.che === 'coop' ? G.ban[0] : B; // co-op: hồi 1 tim CHUNG
    if (T.sao >= 7 && !B.daHoiTim) {
      const max = G.che === 'pvp' ? LUAT.timPvp : G.che === 'coop' ? LUAT.timCoop : LUAT.timSolo;
      if (BT.tim < max) { BT.tim++; B.daHoiTim = true; const c = tamU(T); FX.chu1(c.x, c.y - 50, '+1♥ TIME RESTORED', '#ff6a8a', 16, 'to'); }
    }
    const c = tamU(T);
    FX.vong1(c.x, c.y, 60, 8, '#ff2a3a', 0.4, 5); FX.sang(0.25, '#ff2a3a'); FX.lac(5); SND.tua(); SND.mv();
    nhanU(T, '◀◀ REWIND!', '#ff4b5a', true);
    return true;
  },
  ban(G, B, T, E) { // kim đồng hồ xuyên: trúng mọi quái trên đoạn tới mục tiêu + 60 px phía sau
    giat(T, 1); const [x, y] = chopNong(T, 28); SND.tia();
    const g = Math.atan2(E.y - y, E.x - x), L = Math.hypot(E.x - x, E.y - y) + 60, x1 = x + Math.cos(g) * L, y1 = y + Math.sin(g) * L, dmg = dmgU(T);
    for (const Q of quaiTrenDoan(B, x, y, x1, y1, 10)) trung(Q, dmg, { B, mau: '#ffb0a0' });
    G.hu.push({ k: 'tiaTia', t: 0, song: 0.22, x0: x, y0: y, x1, y1, mau: '#ff2a3a' });
  },
  sangDau: (T) => (T.gd === 2 ? 0.1 : 0),
  veThem(ctx, T, S, al, R) { if (T.nap >= 1 && T.sao >= 3) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = al * (0.3 + 0.2 * Math.sin(R.t * 6)); R.anhGiua(ctx, R.cham1('#ff2a3a'), 0, 0, S * 1.5); ctx.globalCompositeOperation = 'source-over'; } },
};
HU.thrAura = { // cung tròn mảnh dưới mỗi quái: độ dài = độ chậm hiện tại / tối đa (tròn tuyệt đối, nằm dưới quái)
  duoi: true,
  cap(G, o) { return !conTren(o.T) || o.T.id !== 'ngaithoigian'; },
  ve(ctx, o, R) {
    const sm = SKILLS.ngaithoigian.sMax(o.T);
    ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (const E of dsMucTieu(o.B)) {
      if (E.chet || !(E.thr > 0.02)) continue;
      const r = (E.d.co || 40) * 0.42, p = Math.min(1, E.thr / (E.trum ? 0.2 : sm));
      ctx.globalAlpha = 0.35; ctx.strokeStyle = '#000'; ctx.beginPath(); ctx.arc(E.x, E.y, r, 0, 7); ctx.stroke();
      ctx.globalAlpha = 0.75; ctx.strokeStyle = p >= 1 ? '#ff4b5a' : '#ffb0a0'; ctx.beginPath(); ctx.arc(E.x, E.y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); ctx.stroke();
    }
    ctx.lineCap = 'butt'; ctx.globalAlpha = 1;
  },
};
HU.rewind = { // tua ngược 0.6 s: quái chạy lùi (nội suy) + sọc VHS + vòng đồng hồ quay ngược quanh ngai
  cap(G, o) {
    const u = Math.min(1, o.t / o.song), e = 1 - Math.pow(1 - u, 2);
    for (const q of o.keo) if (!q.E.chet) { q.E.s = q.s0 + (q.s1 - q.s0) * e; if (u < 1) q.E.chan = Math.max(q.E.chan || 0, 0.05); }
    return false;
  },
  ve(ctx, o, R) {
    const u = o.t / o.song, a = u < 0.15 ? u / 0.15 : 1 - Math.max(0, (u - 0.7) / 0.3);
    ctx.save();
    ctx.globalAlpha = 0.14 * a; ctx.fillStyle = '#ff2a3a'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 16; i++) { const y = (i * 57 + o.t * 1400) % H; ctx.globalAlpha = 0.3 * a; ctx.fillStyle = i % 2 ? '#7ff0ff' : '#ff4b6b'; ctx.fillRect(0, y, W, 3); ctx.globalAlpha = 0.12 * a; ctx.fillRect(0, y + 5, W, 8); }
    ctx.globalAlpha = 0.9 * a; ctx.font = '900 22px ' + FONT.display; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = '#000';
    const tx = '◀◀ REWIND', ty = (o.B ? o.B.y - 18 : H / 2); ctx.strokeText(tx, W / 2, ty); ctx.fillStyle = '#ff6a7a'; ctx.fillText(tx, W / 2, ty); ctx.textAlign = 'left';
    if (conTren(o.T)) {
      const c = tamU(o.T), r = 30 + 30 * a;
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.8 * a; ctx.strokeStyle = '#ff6a6a'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, 7); ctx.stroke();
      for (let k = 0; k < 12; k++) { const g = k * Math.PI / 6; ctx.beginPath(); ctx.moveTo(c.x + Math.cos(g) * r * 0.86, c.y + Math.sin(g) * r * 0.86); ctx.lineTo(c.x + Math.cos(g) * r, c.y + Math.sin(g) * r); ctx.stroke(); }
      const g = -o.t * 18; ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x + Math.cos(g) * r * 0.75, c.y + Math.sin(g) * r * 0.75); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
    // vệt lùi của từng quái (đường thẳng mờ từ chỗ cũ)
    ctx.lineWidth = 2;
    for (const q of o.keo) if (!q.E.chet) { const p = G.duong[q.E.p], [x0, y0] = viTri(p, q.s0); ctx.globalAlpha = 0.35 * a; ctx.strokeStyle = '#ff9aa0'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(q.E.x, q.E.y); ctx.stroke(); }
    ctx.restore(); ctx.globalAlpha = 1;
  },
};
// 7★ CO-OP: cứu 1 lần lọt mỗi trận — quái sắp lọt bị tua ngược (Rewind tự bật, kể cả đang hồi chiêu)
const _lotGoc = lot;
lot = function (E) {
  if (G.che === 'coop' && !G.daCuuThoiGian) {
    for (const B of G.ban) for (const T of B.t) if (T && T.id === 'ngaithoigian' && T.sao >= 7 && !T.st.da) {
      G.daCuuThoiGian = true; T.nap = 1; E.s = G.duong[E.p].len * 0.6;
      SKILLS.ngaithoigian.chuDong(G, B, T);
      const c = tamU(T); FX.chu1(c.x, c.y - 66, 'TIME SAVE!', '#ff6a8a', 18, 'to');
      return;
    }
  }
  return _lotGoc(E);
};
const _batDauGoc = batDau;
batDau = function (che, deck, mv) { G.daCuuThoiGian = false; return _batDauGoc(che, deck, mv); };

// =====================================================================================================
// đăng ký: ô hỗ trợ CHÉO, họ kỹ năng, mốc sao riêng, grow-up, nhịp hiển thị
// =====================================================================================================
const _oHoTroGoc = oHoTro;
oHoTro = function (B, T) { if (SKILLS[T.id] && SKILLS[T.id].huong) return oCheo(T.o).map(o => B.t[o]); return _oHoTroGoc(B, T); };

function themHo(ho, bac, id, moi) { const F = HO[ho]; if (!F.bac[bac].includes(id)) F.bac[bac].push(id); if (F.gap) delete F.gap[bac]; HO_CUA[id] = { ho, i: bac }; if (moi) HO_MOI[id] = moi; }
themHo('energy', 2, 'nayda', 'bounces that grow STRONGER each hop');
themHo('summon', 2, 'combo', 'every same-type merge powers up the whole line forever');
themHo('trap', 2, 'khoathoigian', 'time-locks the lead enemy, stored damage bursts');
themHo('rapid', 3, 'hydra', 'one barrel per star, 7★ fuses into a giant beam');
themHo('blast', 3, 'cuuvi', 'kills grow tails → 9 homing foxfires');
themHo('joker', 3, 'pandora', 'merge spins a 6-way jackpot');
themHo('amp', 3, 'luoicheo', 'DIAGONAL support; full grid = RESONANCE');
themHo('trap', 4, 'ngaithoigian', 'everything slows with age + REWIND (active)');

Object.assign(MOC_RIENG, {
  luoicheo: { 5: ['RESONANCE LINK', 'Diagonal turrets also +15% fire rate'] },
  cuuvi: { 5: ['TWIN TAILS', '20% of kills grow 2 tails'], 7: ['NINE-TAIL', 'White-blue foxfires blast 40 px; restarts at 3 tails'] },
  hydra: { 7: ['FUSED HEAD', 'Barrels fuse: ×6 piercing beam, 0.6/s'] },
  pandora: { 3: ['QUICK HANDS', '+20% fire rate'], 5: ['LUCKY SPIN', 'Merges into 6★+ roll twice, keep the better'], 7: ['OPEN VAULT', 'Every opening fires 2 effects'] },
  ngaithoigian: { 3: ['REWIND', 'Unlocks the active skill (tap when full)'], 7: ['TIME RESTORED', 'Rewind restores 1 heart once (Co-op: 1 shared heart)'] },
});

Object.assign(GROW, {
  hydra: { mau: '#2ee89a', ten: ['HATCHLING', 'MANY HEADS', 'FUSED HEAD'], dk: '1–3★ / 4–6★ (more barrels, glow) / 7★: barrels fuse into a ×6 piercing beam',
    gd: (T) => ({ s: T.sao >= 7 ? 3 : T.sao >= 4 ? 2 : 1, p: (T.sao - 1) / 6, v: [0.5] }) },
  cuuvi: { mau: '#ffa020', lap: true, ten: ['KIT', 'BLAZING TAILS', 'NINE-TAIL'], dk: 'Tails 0–4 / 5–8 (fire glow) · 7★: white-blue foxfires, blast 40 px',
    gd: (T) => ({ s: T.sao >= 7 ? 3 : (T.duoi || 0) >= 5 ? 2 : 1, p: T.sao >= 7 ? 1 : (T.duoi || 0) / 9, v: [5 / 9] }) },
  luoicheo: { mau: '#45e0c8', lap: true, ten: ['IDLE', 'HUMMING', 'RESONANCE'], dk: 'Diagonal turrets 0–1 / 2–3 / all 4 (only the 3 middle-row centre cells) = RESONANCE ×1.5',
    gd: (T) => { const n = SKILLS.luoicheo.dem(T); return { s: n >= 4 ? 3 : n >= 2 ? 2 : 1, p: n / 4, v: [0.5] }; } },
  ngaithoigian: { mau: '#ff2a3a', ten: ['DIAL', 'TWELVE HOURS', 'THRONE OF TIME'], dk: '1–3★ / 4–6★ / 7★ (restores a heart) · ring = REWIND charge (from 3★)',
    gd: (T) => ({ s: T.sao >= 7 ? 3 : T.sao >= 4 ? 2 : 1, p: T.sao >= 3 ? T.nap : (T.sao - 1) / 2, v: [] }) },
  combo: { mau: '#ff8a2a', khongAnh: true, ten: ['WARM-UP', 'ON A ROLL', 'OVERDRIVE'], dk: 'COMBO 0–9 / 10–19 (2 spinning rings) / 20+ (red-hot core)',
    gd: (T) => { const n = SKILLS.combo.hieuLuc(G.ban[T.ban] || { combo: 0 }); return { s: n >= 20 ? 3 : n >= 10 ? 2 : 1, p: Math.min(1, n / 20), v: [0.5] }; } },
  pandora: { mau: '#ffd23f', khongAnh: true, ten: ['LOCKED', 'AJAR', 'OPEN VAULT'], dk: '1–3★ locked / 4–6★ lid ajar (6 colours leak) / 7★ open: every merge fires 2 effects',
    gd: (T) => ({ s: T.sao >= 7 ? 3 : T.sao >= 4 ? 2 : 1, p: (T.sao - 1) / 6, v: [0.5] }) },
});
Object.assign(NHIP, { hydra: (T) => (T.sao >= 7 ? 'fused beam 0.6/s' : (SKILLS.hydra.toc * (1 + 0.2 * (T.sao >= 3))).toFixed(2) + ' volleys/s × ' + Math.min(6, T.sao) + ' barrels') });

// ---------- luật bộ bài (§5.1): tối đa 2 ụ "thao túng sao", ≥2 ụ Tấn công (nhắc, không chặn) ----------
const THAO_TUNG_SAO = new Set(['vughep', 'sinhdoi', 'nangsao', 'hasao', 'tienhoa', 'loren', 'khoisinh', 'pandora']);
const _deckNNGoc = deckNgauNhien;
deckNgauNhien = function (tru) { for (let i = 0; i < 20; i++) { const d = _deckNNGoc(tru); if (d.filter(id => THAO_TUNG_SAO.has(id)).length <= 2) return d; } return _deckNNGoc(tru); };
