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
// nhipU(T) (hệ số nhịp cho ụ tự quản nhịp: buff tốc + Ép Xung + Kẹp Phá) khai báo ở skills2.js — Frost / Venom / Laser dùng lúc chạy
function danThang(B, T, E, img, sp, co, trungFn, duoi) {
  const [x, y] = dauNong(T);
  return banDan({ img, x, y, muc: E, px: E.x, py: E.y, sp, co, B, T, trung: trungFn, duoi });
}

// ============ TRẮNG ============
// PHÁO LA BÀN / COMPASS CANNON (canon, Trắng — co-che-moi/DE-XUAT.md §3-A, người dùng chốt 07/11: THAY Cannon, có sóng nổ bù):
//  · Gọi ra: 1 MŨI TÊN cố định (T.huong 0 ↑ · 1 → · 2 ↓ · 3 ←, bốc ngẫu nhiên; online = rngHat hạt giống trận + bàn + ô + số lần) và SỐ T.so = 1.
//  · Ghép Pháo La Bàn vào Pháo La Bàn cùng sao (ghép đặc biệt GIỮ LOẠI như Merge King + Merge King): ụ ĐÍCH +1★, giữ mũi tên của ĐÍCH;
//      cùng hướng → số CỘNG (2+1=3) · vuông góc → giữ số của đích · NGƯỢC hướng → số TRỪ (tối thiểu 1) + SÓNG NỔ bù dọc làn:
//      mọi quái trên làn của mình nhận (số của ụ kéo × 6) lần sát thương 1 phát (không nhân số). Kết quả luôn là ụ THẬT (không phải bản sao).
//  · Mimic + Pháo / ghép thường khác → ụ ngẫu nhiên như luật thường, số mất. Merge King nâng sao: giữ mũi tên + số. Copycat chép: giữ mũi tên + số (× % sao chép).
//  · Sức mạnh: mỗi số +15% sát thương (cấp thẻ +0,43%/cấp → 21% ở LV15); số trên 20 chỉ tính 1/3. Ngắm theo mũi tên (↑ quái cao nhất màn hình, → phải nhất,
//    ↓ thấp nhất, ← trái nhất); đạn XUYÊN: mọi quái trên đường thẳng từ ụ tới mục tiêu nhận 60%, nổ lan ở mục tiêu.
//  · Mốc: 3★ chung (+20% tốc) · 5★ TRUE NORTH: mỗi số tính ×1.5 · 7★ FOUR WINDS: +30% sát thương, mỗi 8 s bắn 1 phát theo CẢ 4 hướng.
SKILLS.canon = {
  vai: 'tc', dmg: 26.5, toc: 0.55, nham: 'dau', // 32.73 → 26.5: ghép giữ loại + số làm Pháo mạnh hơn (sim 07/11 bộ 4 ụ trắng + Pháo: wave 13.1 cũ → ~14.0; 32.73 thì 16.2 = áp đảo)
  MUI: ['↑', '→', '↓', '←'], SONG_K: 6, XUYEN: 0.6,
  banKinh: (T) => 28 + 6 * T.sao,
  huong: (T) => ((T && T.huong) | 0) & 3,
  so: (T) => Math.max(1, (T && T.so) | 0),
  // số thực tính sức mạnh: trần mềm 20, 5★ ×1.5
  soHieu(T) { const n = this.so(T), m = n <= 20 ? n : 20 + (n - 20) / 3; return m * (ms(T, 5) ? 1.5 : 1); },
  moiSo: (T) => (knThe(T && G.ban[T.ban], 'canon') || 15) / 100,
  heSo(T) { return (1 + this.moiSo(T) * this.soHieu(T)) * (ms(T, 7) ? 1.3 : 1); },
  // kết quả ghép a (kéo) vào b (đích): { so, kieu: 'cong' | 'giu' | 'tru', song } — dùng chung cho luật, xem trước khi kéo, AI, bảng chạm
  ketQua(a, b) {
    const ha = this.huong(a), hb = this.huong(b), sa = this.so(a), sb = this.so(b);
    if (ha === hb) return { so: sa + sb, kieu: 'cong', song: 0 };
    if ((ha + 2) % 4 === hb) return { so: Math.max(1, sb - sa), kieu: 'tru', song: sa };
    return { so: sb, kieu: 'giu', song: 0 };
  },
  rng(B, o) {
    if (typeof ONS !== 'undefined' && ONS.on) { B._cmN = (B._cmN || 0) + 1; return rngHat((ONS.seed || 1) * 6151 + B.i * 131 + (o | 0) * 977 + B._cmN * 7919); }
    return Math.random;
  },
  sinh(G, T) { if (T.huong == null) { const B = G.ban[T.ban] || G.ban[0]; T.huong = Math.floor(this.rng(B, T.o)() * 4) & 3; } if (!T.so) T.so = 1; },
  mo(T) {
    const n = this.so(T);
    return 'Arrow ' + this.MUI[this.huong(T)] + ' · number ' + n + ' → +' + Math.round((this.heSo(T) / (ms(T, 7) ? 1.3 : 1) - 1) * 100) + '% damage (each number +' + Math.round(this.moiSo(T) * 100) + '%' + (ms(T, 5) ? ', ×1.5 at 5★' : '') + ') · aims toward its arrow, shells pierce the line, blast ' + this.banKinh(T) + ' px · merge onto a Compass Cannon: same arrow = numbers add, side arrow = target keeps its number, opposite = subtract (min 1) + shockwave on your lane';
  },
  // mục tiêu theo mũi tên: quái xa nhất về phía mũi tên (hoà: quái gần lối ra hơn)
  mucTieu(B, T, h) {
    let m = null, best = -1e9;
    for (const E of dsMucTieu(B)) { if (E.chet) continue; const v = (h === 0 ? -E.y : h === 1 ? E.x : h === 2 ? E.y : -E.x) + E.s * 1e-4; if (v > best) { best = v; m = E; } }
    return m;
  },
  capNhat(G, B, T, dt) {
    const E = this.mucTieu(B, T, this.huong(T)); if (E) T.muc = E;
    if (ms(T, 7) && !biKhoa(T)) { // FOUR WINDS: mỗi 8 s 1 phát theo cả 4 hướng
      T.gio = (T.gio || 0) + dt;
      if (T.gio >= 8) { T.gio = 0; const ds = [0, 1, 2, 3].map(h => this.mucTieu(B, T, h)).filter(Boolean); if (ds.length) { giat(T, 1.2); for (const Q of ds) this.banMot(G, B, T, Q, 0.7); } }
    }
    return false;
  },
  ban(G, B, T, E) {
    const Q = this.mucTieu(B, T, this.huong(T)) || E; if (!Q) return;
    giat(T, 1.4); const [x, y] = chopNong(T, 34); phutKhoi(x, y, 2); SND.phao();
    this.banMot(G, B, T, Q, 1);
  },
  banMot(G, B, T, E, k) {
    const [x, y] = dauNong(T), dmg = dmgU(T) * this.heSo(T) * (k || 1), r = this.banKinh(T), xu = this.XUYEN;
    banDan({ img: 'dan_phao', x, y, muc: E, px: E.x, py: E.y, sp: 300, co: 24 + Math.min(10, this.so(T)), cong: 30, B, T, duoi: true,
      trung(G, d) {
        // xuyên: mọi quái (trừ tâm nổ) trên đoạn thẳng từ nòng tới điểm nổ, lệch ≤ 16 px — xét theo uid tăng dần (tất định)
        const vx = d.x - x, vy = d.y - y, L2 = vx * vx + vy * vy || 1, ds = [];
        for (const M of dsMucTieu(B)) { if (M.chet) continue; const u = ((M.x - x) * vx + (M.y - y) * vy) / L2; if (u < 0 || u > 1) continue; const px = x + vx * u - M.x, py = y + vy * u - M.y; if (px * px + py * py <= (16 + M.d.co * 0.25) ** 2 && Math.hypot(M.x - d.x, M.y - d.y) > r) ds.push(M); }
        ds.sort((p, q) => p.uid - q.uid); for (const M of ds) trung(M, dmg * xu, { B, T, phu: true });
        noLan(d.x, d.y, r, dmg, B); FX.no('no_phao', d.x, d.y, r * 2.5, 0.5); FX.vong1(d.x, d.y, 4, r, '#ffb35a', 0.3, 3); FX.tiaLua(d.x, d.y, 8, '#ffb060', 200); FX.lac(2.5); SND.no(0.35);
        if (ds.length) G.hu.push({ k: 'cmXuyen', t: 0, song: 0.3, x0: x, y0: y, x1: d.x, y1: d.y });
      } });
  },
  ghepDB: {
    cungLoai: true, // Pháo La Bàn + Pháo La Bàn (cùng sao) → ụ ĐÍCH +1★ (không ra ụ ngẫu nhiên)
    hopLe: (a, b) => b.id === 'canon' && a.id === 'canon' && a.sao === b.sao && b.sao < LUAT.saoMax && b.ban === a.ban,
    xemSao: (a, b) => Math.min(LUAT.saoMax, b.sao + 1),
    lam(G, B, a, b) {
      const S = SKILLS.canon, kq = S.ketQua(a, b);
      B.t[a.o] = null;
      G.bay.push({ id: a.id, sao: a.sao, x0: B.o[a.o].x, y0: B.o[a.o].y, x1: B.o[b.o].x, y1: B.o[b.o].y, t: 0, bac: a.bac });
      b.so = kq.so; b.banSao = false; // ghép luôn ra ụ thật (như ghép thường)
      const saoCu = b.sao; b.sao = Math.min(LUAT.saoMax, b.sao + 1); b.sang = 1; b.anim = { k: 'no', t: 0.25 };
      mocMoi(b, saoCu, 0.1);
      const c = B.o[b.o]; FX.tiaLua(c.x, c.y, 14, '#ffb35a', 180, 11); FX.vong1(c.x, c.y, 6, 40, '#ffb35a', 0.4, 3);
      if (typeof buffNo === 'function') buffNo(b, 'dmg', kq.kieu === 'cong' ? 1 : 0.5);
      b.cmKq = { kieu: kq.kieu, t: G.t };
      if (kq.song > 0) S.songNo(G, B, b, kq.song);
      return b;
    },
  },
  // SÓNG NỔ bù (ghép ngược hướng): mọi quái trên làn của mình (uid tăng dần) nhận n × 6 lần sát thương 1 phát (không nhân số)
  songNo(G, B, T, n) {
    const dmg = dmgU(T) * this.SONG_K * n;
    const ds = dsMucTieu(B).filter(E => !E.chet).sort((p, q) => p.uid - q.uid);
    for (const E of ds) trung(E, dmg, { B, T, phu: true });
    for (const pi of G.duong.map((p, i) => i).filter(i => G.duong[i].ban === B.i)) G.hu.push({ k: 'cmSong', t: 0, song: 0.9, p: pi, n });
    FX.lac(5); SND.no(0.8);
  },
};
SKILLS.lien = { // Liên Thanh (Esch): bắn rất nhanh; sao tăng tốc bắn
  vai: 'tc', dmg: 4.5, toc: 4, tocSao: 0.14, nham: 'dau',
  mo: () => 'each ★ +14% fire rate',
  ban(G, B, T, E) {
    giat(T, 0.35); const [x, y] = dauNong(T);
    FX.no('chop_nong', x, y, 22 + Math.random() * 8, 0.07, T.goc + rnd(-0.1, 0.1));
    if (Math.random() < 0.35) FX.khoi(x, y, 8);
    const dmg = dmgU(T); SND.lien();
    danThang(B, T, E, 'dan_lien', 700, 16, (G, d, M) => { if (M) { trung(M, dmg, { B }); FX.tiaLua(d.x, d.y, 2, '#ffd080', 120, 7); } });
  },
};
SKILLS.bang = { // Băng (Liza) — ĐẶC BIỆT (đợt vai trò): định kỳ ĐÓNG BĂNG quái đầu; không gây sát thương; trùm chỉ 0.6 s; không đóng băng nối tiếp (miễn 3 s)
  vai: 'db', dmg: 0, toc: 0, napMau: '#bff4ff',
  ky: (T) => (ms(T, 5) ? 4.5 : 6),          // 5★ QUICK FROST
  dai: (T) => Math.round(((ms(T, 3) ? 0.5 : 0) + knThe(G.ban[T.ban], 'bang')) * 10) / 10, // 3★ LONG FREEZE · cấp thẻ: 2 s → 3 s (+ power-up KY_NANG_CAP.pu)
  so: (T) => (ms(T, 7) ? 2 : 1),            // 7★ DOUBLE FREEZE
  mo: (T) => 'Every ' + SKILLS.bang.ky(T) + 's freezes ' + (SKILLS.bang.so(T) > 1 ? '2 lead enemies ' : 'the lead enemy ') + SKILLS.bang.dai(T) + 's (big ×0.6; bosses only 50% slow 0.6s) + 30% chill (bosses 15%) · 3s freeze immunity · Frost Flyers immune',
  ung: (G, B) => dsMucTieu(B).filter(E => !E.chet && !E.d.khangCham && !(E.bangMien > G.t)).sort((a, b) => (G.duong[a.p].len - a.s) - (G.duong[b.p].len - b.s)),
  capNhat(G, B, T, dt) {
    const ds = this.ung(G, B);
    xoayDau(T, ds[0] || quaiDau(B), dt);
    T.nap = Math.min(1, T.nap + dt * nhipU(T) / this.ky(T));
    if (T.nap < 1 || !ds.length) return true;
    T.nap = 0; giat(T, 0.6); chopNong(T, 20); SND.bang();
    const dai = this.dai(T);
    for (const E of ds.slice(0, this.so(T))) {
      E.bangMien = G.t + 1.2; // giữ chỗ: Frost khác không nhắm cùng con khi đạn đang bay
      danThang(B, T, E, 'dan_bang', 460, 22, (G, d, M) => { FX.no('bang_vo', d.x, d.y, 60, 0.4); if (M) dongBang(M, dai, T); }, 'bang');
    }
    return true;
  },
};
// đóng băng 1 quái (Frost): thường = dai, quái to ×0.6, trùm 0.6 s; sau đó lạnh 30% thêm 2 s (trùm 15% — trần chậm của trùm); miễn đóng băng 3 s (không khoá nối tiếp)
function dongBang(E, dai, T) {
  if (E.chet) return;
  const d = E.trum ? 0.6 : E.d.to ? dai * 0.6 : dai;
  E.chan = Math.max(E.chan, d); E.bangMien = G.t + d + 3;
  E.chamT = Math.max(E.chamT, d + 2); E.cham = Math.max(E.cham, E.trum ? 0.15 : 0.3);
  FX.chu1(E.x, E.y - 22, 'FROZEN', '#bff4ff', 11); FX.no('bang_vo', E.x, E.y, 70, 0.45);
}
SKILLS.doc = { // Độc (Unknown) — ĐẶC BIỆT (đợt vai trò): ĐÁNH DẤU quái đầu 5 s → mọi ụ gây thêm 12% (làm mới thời gian, không cộng dồn giá trị); không tự gây sát thương
  vai: 'db', dmg: 0, toc: 0, napMau: '#9dff5a',
  K: 0.12, ky: 2.5,
  so: (T) => (ms(T, 3) ? 2 : 1), // 3★ TWIN MARK
  k: (T) => knThe(G.ban[T.ban], 'doc') / 100, // cấp thẻ + power-up (KY_NANG_CAP.pu)
  mo: (T) => 'Every 2.5s marks ' + (SKILLS.doc.so(T) > 1 ? '2 lead enemies' : 'the lead enemy') + ' 5s: +' + +(SKILLS.doc.k(T) * 100).toFixed(1) + '% damage taken from all turrets' + (ms(T, 5) ? ' · mark spreads on death' : '') + (ms(T, 7) ? ' · marked slowed 15%' : ''),
  capNhat(G, B, T, dt) {
    const ds = dsMucTieu(B).filter(E => !E.chet && !(E.vmT > 1.2)).sort((a, b) => (G.duong[a.p].len - a.s) - (G.duong[b.p].len - b.s));
    xoayDau(T, ds[0] || quaiDau(B), dt);
    T.nap = Math.min(1, T.nap + dt * nhipU(T) / this.ky);
    if (T.nap < 1 || !ds.length) return true;
    T.nap = 0; giat(T, 0.5); const [x, y] = dauNong(T); SND.doc();
    for (let i = 0; i < 4; i++) FX.hat1('lua', x, y, Math.cos(T.goc + rnd(-0.4, 0.4)) * 120, Math.sin(T.goc + rnd(-0.4, 0.4)) * 120, 0.3, 7, '#9dff5a');
    for (const E of ds.slice(0, this.so(T))) {
      E.vmT = Math.max(E.vmT || 0, 1.3);
      danThang(B, T, E, 'dan_doc', 340, 22, (G, d, M) => { if (M) danhDauDoc(M, T, B); FX.no('khoi_doc', d.x, d.y, 40, 0.3); }, 'doc');
    }
    return true;
  },
};
// dấu độc Venom: suy yếu (HOTRO.vuln) + dấu hiển thị E.yeu. Purifier coi quái mang dấu là "trúng độc" qua biDoc(E).
// KHÔNG đụng E.docT/E.doc nữa: trước đây đặt docT = 5 làm độc CŨ của Toxic Pool (E.doc còn sót) sống lại 5 s.
function biDoc(E) { return !!E && (E.docT > 0 || E.vmT > 0); }
function danhDauDoc(E, T, B) {
  if (E.chet) return;
  if (!(E.vmT > 1.3)) FX.chu1(E.x, E.y - 24, 'MARKED', '#9dff5a', 10);
  E.vmT = 5; E.vmK = T && T.id === 'doc' ? SKILLS.doc.k(T) : knThe(B, 'doc') / 100; E.yeu = Math.max(E.yeu, 5);
  if (ms(T, 5)) E.vmLay = 1;                                                                          // 5★ CONTAGION
  if (ms(T, 7) && !E.d.khangCham) { E.cham = Math.max(E.cham, 0.15); E.chamT = Math.max(E.chamT, 5); } // 7★ NEUROTOXIN
}
SKILLS.tia = { // Bắn Tỉa (Artemis): nhắm quái nhiều máu nhất; +100% vào quái to / trùm
  vai: 'tc', dmg: 69.6, toc: 0.35, nham: 'mau',
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
  vai: 'tc', dmg: 18.21, toc: 0.7, nham: 'dau',
  mo: (T) => 'Chains to ' + T.sao + (T.sao > 1 ? ' enemies (120 px jumps, −12% per jump)' : ' enemy'),
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
  luong: (T) => Math.round(9 * knHe(G.ban[T.ban], 'mana') * T.sao * (1 + 0.25 * ((G.ban[T.ban].lv.mana || 1) - 1)) * TIERS[T.bac].hs * (ms(T, 5) ? 1.25 : 1)), // 5★ OVERFLOW
  ky: (T) => (ms(T, 7) ? 5 : ms(T, 3) ? 6 : 7), // 3★ FAST FLOW · 7★ WELLSPRING
  mo: (T) => '+' + SKILLS.mana.luong(T) + ' mana / ' + SKILLS.mana.ky(T) + ' s',
  capNhat(G, B, T, dt) {
    T.nap += dt / this.ky(T);
    if (T.nap >= 1) {
      T.nap = 0; const n = this.luong(T); B.mana += n; T.sang = 1;
      const c = tamU(T);
      FX.chu1(c.x, c.y - 24, '+' + n, '#d9a8ff', 15, 'mana'); VX.manaRa(B, T);
      for (let i = 0; i < 8; i++) FX.hat1('lua', c.x + rnd(-14, 14), c.y + rnd(-8, 8), rnd(-10, 10), rnd(-60, -30), 0.6, 8, '#c77dff');
      if (!B.ai) SND.mana();
    }
    return true;
  },
};
// ============ XANH ============
SKILLS.radar = { // Radar (Kirinus): HỖ TRỢ — +tốc bắn cho 4 ô thẳng (hotro.js: 12% 1★ → 28% 7★, trần chung 45%)
  vai: 'ht', dmg: 0, toc: 0,
  them: (T) => 0.12 * HOTRO.k(T),
  mo: (T) => '+' + Math.round(Math.min(SKILLS.radar.them(T), HOTRO.tran(T, 'toc')) * 100) + '% fire rate to N/E/S/W neighbours' + (ms(T, 5) ? ' · +4% crit' : '') + (ms(T, 7) ? ' · OVERDRIVE every 8s: +25% for 2s (up to the ' + +(HOTRO.tran(T, 'toc') * 100).toFixed(1) + '% fire-rate cap)' : ''),
  hoTro(G, T, N, ra) { ra.toc = this.them(T) + (T.odCon > 0 ? 0.25 : 0); if (T.odCon > 0) ra.capOD = 0.15; if (ms(T, 5)) ra.crit = 0.04; }, // 7★ OVERDRIVE: +25% trong 2 s — trần tốc +15% trong lúc OVERDRIVE (BAO-CAO gioi-han Mức 3)
  capNhat(G, B, T, dt) {
    T.goc += dt * 1.3; // chảo radar quay đều
    T.nap += dt / 2.2;
    if (T.nap >= 1) { T.nap = 0; const ke = HOTRO.oDich(T).map(o => B.t[o]).filter(N => HOTRO.nhan(T, N)); if (ke.length) G.hu.push({ k: 'ping', t: 0, song: 0.18, T, ke, rgb: '255,180,60' }); }
    if (T.odCon > 0) T.odCon -= dt;
    if (ms(T, 7)) { T.odT = (T.odT || 0) + dt; if (T.odT >= 8) { T.odT = 0; T.odCon = 2; nhanU(T, 'OVERDRIVE', '#ffb43a'); } } // 7★ OVERDRIVE (giá trị cộng ở hoTro → bị kẹp trần chung)
    return true;
  },
};
SKILLS.mimic = { // Mimic (Aurora): ghép với BẤT KỲ ụ cùng sao; ghép xong buff tấn công
  vai: 'db', dmg: 9, toc: 1.2, nham: 'dau', // 6.67 → 9 (đo bậc 06/11)
  mo: (T) => 'Merges with any same-star turret · result +' + Math.round(knThe(T && G.ban[T.ban], 'mimic')) + '% attack 8s',
  ban(G, B, T, E) {
    giat(T, 0.3);
    const dmg = dmgU(T);
    danThang(B, T, E, 'tia_lua', 380, 18, (G, d, M) => { if (M) trung(M, dmg, { B, mau: '#ffd6ff' }); FX.tiaLua(d.x, d.y, 3, pick(['#ff6ad5', '#7fdcff', '#ffe46b']), 100, 7); });
  },
};
SKILLS.laser = { // Laser (Nebula): tia liên tục, giữ càng lâu càng mạnh (đổi mục tiêu thì về 0)
  vai: 'tc', dmg: 12, toc: 1,
  mo: (T) => 'Beam ramps to ×4 over 3s on the lead enemy (resets on switch) · beam never crits',
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
    const dps = dmgU(T) * (1 + 3 * T.las.ramp) * nhipU(T);
    T.las.acc += dps * dt; T.las.so += dt;
    T.rx = -1.5; T.rv = 0; // VFX P3: giật lùi đứng yên khi bắn tia (bỏ rung 40 rad/s)
    if (T.las.so > 0.25) { trung(E, T.las.acc, { B, crit: false, mau: '#ff8af0' }); T.las.acc = 0; T.las.so = 0; }
    if (Math.random() < dt * 20) FX.tiaLua(E.x, E.y, 1, '#ff8af0', 120, 8);
    if (!B.ai) SND.laser(); // tia âm duy trì, tự tắt dần khi ngừng bắn
    return true;
  },
};
SKILLS.mortar = { // Súng Cối (Nade): bắn quái ngẫu nhiên, đạn vòng cao nổ lan
  vai: 'tc', dmg: 27.5, toc: 0.4, nham: 'ngau',
  mo: (T) => 'Splash 46 px · random targets · cluster shell in ' + (3 - (T.banLan % 3)),
  ban(G, B, T, E) {
    giat(T, 1.8); const [x, y] = chopNong(T, 30); phutKhoi(x, y, 3); SND.phao();
    const dmg = dmgU(T), cum = T.banLan % 3 === 0; // mỗi phát thứ 3: đạn CHÙM (cơ chế mới so với Pháo Nổ)
    banDan({ img: 'dan_phao', x, y, muc: E, px: E.x, py: E.y, sp: 190, co: cum ? 26 : 22, cong: 90, B, T, duoi: true, nho: true,
      trung(G, d) {
        noLan(d.x, d.y, 46, dmg, B); FX.no('no_phao', d.x, d.y, 46 * 2.5, 0.5); FX.bui(d.x, d.y, 6, 10); FX.lac(3); SND.no(0.4);
        if (cum) for (let i = 0; i < 3; i++) { const a = i * 2.09 + Math.random(), px = d.x + Math.cos(a) * 30, py = d.y + Math.sin(a) * 30; noLan(px, py, 26, dmg * 0.45, B, { phu: true }); FX.no('no_phao', px, py, 60, 0.35); }
      } });
    if (cum) nhanU(T, 'CLUSTER', '#ffb35a');
  },
};
// ============ VÀNG ============
SKILLS.railgun = { // Railgun (Removal Tee): BINGO — hàng ngang ĐẦY Railgun +sát thương, cột dọc ĐẦY Railgun +tốc bắn; tia xuyên
  vai: 'tc', dmg: 70, toc: 0.33, nham: 'dau', // đợt vai trò: −14% (đơn mục tiêu vượt trần ngách Huyền thoại)
  bingo(B, T) {
    const c = T.o % 5, h = (T.o / 5) | 0; let ngang = 0, doc = 0;
    for (let i = 0; i < 5; i++) { const X = B.t[h * 5 + i]; if (X && X.id === 'railgun' && !X.st.da) ngang++; /* ô ĐÁ không còn là ụ (DCDW: chỉ chiếm ô) → không tính bingo */ }
    for (let i = 0; i < 3; i++) { const X = B.t[i * 5 + c]; if (X && X.id === 'railgun' && !X.st.da) doc++; }
    return { ngang, doc };
  },
  // DCDW Removal Tee: chỉ tính HÀNG/CỘT ĐẦY toàn Railgun (cùng loại ụ; ô đá không tính) — không thưởng hàng dở dang.
  //   HÀNG NGANG đủ 5 Railgun → +200% sát thương · CỘT DỌC đủ 3 Railgun → +150% tốc bắn (cả hai cùng lúc được)
  BINGO_DMG: 2.0, BINGO_TOC: 1.5,
  mo(T) { const b = this.bingo(G.ban[T.ban], T); return 'BINGO counts Railguns only · full row ' + b.ngang + '/5 → +' + Math.round(this.BINGO_DMG * 100) + '% damage · full column ' + b.doc + '/3 → +' + Math.round(this.BINGO_TOC * 100) + '% fire rate'; },
  capNhat(G, B, T) {
    const b = this.bingo(B, T);
    if (b.ngang >= 5) T.buf.dmg += this.BINGO_DMG;
    if (b.doc >= 3) T.buf.toc += this.BINGO_TOC;
    T.bingo = b.ngang >= 5 || b.doc >= 3;
    return false;
  },
  ban(G, B, T, E) {
    G.hu.push({ k: 'rail', t: 0, song: 0.75, nap: 0.38, T, B, goc: T.goc, dmg: dmgU(T), da: false });
    SND.nap();
  },
};
SKILLS.orbital = { // Vệ Tinh (Mafdet) — ĐẶC BIỆT: KHÔNG bắn thường. DCDW Mafdet: GHÉP Vệ Tinh → MỌI Vệ Tinh đang có trên bàn THỨC TỈNH
  //   (23 s ở LV9, +1 s/cấp thẻ → 29 s LV15); mỗi Vệ Tinh thức tỉnh tự bắn LOẠT BOM nổ lan (số bom theo sao). Ghép mà bàn không còn Vệ Tinh nào
  //   (2 Vệ Tinh đem ghép ra ụ khác) → vẫn gọi 1 đợt bắn phá từ trời ngắn hơn (dự phòng cũ, 12 s) để lần ghép không mất trắng.
  vai: 'db', dmg: 0, toc: 0,
  dai: (B) => knThe(B, 'orbital') || 23,                                    // giây thức tỉnh (cấp thẻ)
  soBom: (T) => 2 + Math.ceil(T.sao / 2) + (ms(T, 7) ? 1 : 0),              // 1★ 3 · 3★ 4 · 5★ 5 · 7★ 7 (JUSTICE RAIN +1)
  nhip: (T) => 1.8 / (ms(T, 3) ? 1.2 : 1),                                  // 3★ QUICK HANDS: loạt nhanh 20%
  bomDmg: (B, T) => 30 * TIERS.vang.hs * (1 + 0.85 * (T.sao - 1)) * hsLv(B, 'orbital') * (ms(T, 5) ? 1.25 : 1) * (ms(T, 7) ? 1.3 : 1) * (B && B.cuong > 0 ? 2 : 1) * 0.9 * (T.banSao ? heSaoChep(B) : 1), // bản sao Copycat: bom cũng theo % sao chép (MA-TRAN.md)
  mo: (T) => (T.thucT > 0 ? 'AWAKENED ' + Math.ceil(T.thucT) + 's · ' : '') + 'merging Orbitals awakens EVERY Orbital on the board for ' + SKILLS.orbital.dai(G.ban[T.ban]) + 's: salvo of ' + SKILLS.orbital.soBom(T) + ' bombs every ' + SKILLS.orbital.nhip(T).toFixed(1) + 's (' + Math.round(SKILLS.orbital.bomDmg(G.ban[T.ban], T)) + ' area damage each)',
  gocDau: (T, t) => -Math.PI / 2 + Math.sin(t * (T.thucT > 0 ? 2.2 : 0.6) + (T.pha || 0)) * 0.5,
  sangDau: (T) => (T.thucT > 0 ? 0.3 + 0.12 * Math.sin(G.t * 9) : T.gd === 2 ? 0.1 : 0), // dạng thức tỉnh = ảnh dạng 3 + đầu sáng rực
  capNhat(G, B, T, dt) {
    if (!(T.thucT > 0)) return true;
    T.thucT = Math.max(0, T.thucT - dt); T.salvo = (T.salvo || 0) - dt;
    if (T.salvo > 0) return true;
    const ds = dsMucTieu(B).filter(E => !E.chet); if (!ds.length) { T.salvo = 0.2; return true; }
    T.salvo += this.nhip(T); if (T.salvo < 0) T.salvo = 0.2;
    const n = this.soBom(T), dmg = this.bomDmg(B, T);
    for (let i = 0; i < n; i++) { const E = ds[Math.floor(Math.random() * ds.length)]; G.hu.push({ k: 'vetinh', t: -i * 0.08, song: 0.5, E, x: E.x + rnd(-8, 8), y: E.y, dmg, r: 34, B, da: false, vang: 1 }); }
    T.sang = 1; giat(T, 0.6);
    if (!B.ai) SND.nap();
    return true;
  },
  veThem(ctx, T, S, al, R) { // thức tỉnh: vòng sáng ChatGPT (CAN-VE-3 fx_orbital_thuc) quay quanh đầu, mờ dần 2 s cuối
    if (!(T.thucT > 0) || typeof FXU === 'undefined' || !FXU.co('fx_orbital_thuc')) return;
    ctx.globalCompositeOperation = 'lighter'; R.anhGiua(ctx, 'fx_orbital_thuc', 0, 0, S * 1.3, R.t * 0.8, al * Math.min(1, T.thucT / 2) * (0.75 + 0.2 * Math.sin(R.t * 6)));
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
  thucTinh(G, B) { // gọi sau ghép: đánh thức MỌI Vệ Tinh trên bàn (kể cả ụ vừa ghép ra nếu là Vệ Tinh)
    const dai = this.dai(B), ds = B.t.filter(X => X && X.id === 'orbital' && !X.st.da);
    for (const X of ds) { X.thucT = dai; X.thucMax = dai; X.salvo = 0.4 + 0.15 * (X.o % 5); X.sang = 1; if (typeof VX !== 'undefined' && VX.hu) VX.hu(X); }
    return ds.length;
  },
  phaoDmg: (B, sao) => 30 * TIERS.vang.hs * (1 + 0.85 * (sao - 1)) * hsLv(B, 'orbital') * (B && B.cuong > 0 ? 2 : 1),
  ghep(G, B, a, b) {
    const n = this.thucTinh(G, B);
    if (!n) { B.phao = 12; B.phaoSao = Math.max(a.sao, b.sao) + 1; B.phaoT = 0.2; } // dự phòng: không còn Vệ Tinh nào trên bàn
    const c = B.o[b.o]; FX.vong1(c.x, c.y, 10, 90, '#9fe6ff', 0.5, 4); FX.sang(0.25, '#9fe6ff');
    if (!B.ai) SND.thucTinh(); SND.mv();
  },
  phaoBan(G, B, dt) { // dự phòng (không còn Vệ Tinh): 1 giáo / 0.32 s
    B.phao -= dt; B.phaoT -= dt;
    if (B.phaoT > 0) return;
    B.phaoT = Math.max(0, B.phaoT + 0.32);
    const E = quaiNgauNhien(B); if (!E) return;
    G.hu.push({ k: 'vetinh', t: 0, song: 0.5, E, x: E.x + rnd(-6, 6), y: E.y, dmg: this.phaoDmg(B, B.phaoSao), B, da: false });
  },
};
SKILLS.wallgen = { // Máy Dựng Tường (Cleopatra): định kỳ dựng tường ánh sáng chặn đường rồi nổ;
  //   DCDW Cleopatra: khi GHÉP Máy Dựng Tường → TƯỜNG VÀNG mạnh hơn hẳn (đứng 6 s, nổ ×6 sát thương tường thường, vùng nổ to) trước quái đầu
  vai: 'tc', dmg: 26, toc: 1,
  VANG_SONG: 6, VANG_K: 6,
  mo: (T) => 'Wall holds ' + (2.4 + 0.3 * T.sao).toFixed(1) + 's, then explodes · on merge: GOLDEN WALL holds 6s, explodes ×6',
  ghep(G, B, a, b) { // TƯỜNG VÀNG (mọi chế độ; online: kỹ năng khi ghép chạy y hệt ở 2 máy)
    const T0 = a.id === 'wallgen' ? a : b, E = quaiDau(B);
    let pi, s;
    if (E) { pi = E.p; s = Math.min(G.duong[pi].len - 10, E.s + 34); }
    else { pi = G.duong.findIndex(p => p.ban === B.i); if (pi < 0) pi = 0; s = G.duong[pi].len * 0.55; }
    const [x, y, goc] = viTri(G.duong[pi], s);
    G.hu.push({ k: 'tuong', t: 0, song: this.VANG_SONG, p: pi, s, x, y, goc, T: null, B, vang: true, dmg: dmgU(T0) * 7 * this.VANG_K * (1 + 0.85 * T0.sao) / (1 + 0.85 * (T0.sao - 1)) });
    FX.sang(0.25, '#ffd23f'); FX.vong1(x, y, 10, 70, '#ffd23f', 0.5, 4); if (!B.ai) SND.thucTinh();
  },
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
  mo: (T) => 'Charge ' + ((7 - 0.5 * (T.sao - 1)) / nhip3(T)).toFixed(1) + 's · thunder ×9 in 92 px · aftershock arcs ×2 to 4 more',
  capNhat(G, B, T, dt) {
    const E = quaiDau(B);
    xoayDau(T, E, dt);
    T.nap = Math.min(1, T.nap + dt * (1 + T.buf.toc) / (7 - 0.5 * (T.sao - 1)));
    if (T.nap >= 1 && E) {
      const c = tamU(T);
      if (Math.abs(gocLech(T.goc, Math.atan2(E.y - c.y, E.x - c.x))) > 0.2) return true;
      T.nap = 0; giat(T, 2.2); const [x, y] = chopNong(T, 44); phutKhoi(x, y, 3);
      G.hu.push({ k: 'sam', t: 0, song: 0.7, x: E.x, y: E.y, x0: x, y0: y, r: 92, dmg: dmgU(T) * 9, B, T, da: false, seed: Math.random() * 99 });
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
    for (const E of dsMucTieu(o.B)) if (Math.hypot(E.x - o.x, E.y - o.y) < o.r + 8) {
      E.doc = Math.max(E.doc, o.dps); E.docT = Math.max(E.docT, 1.5); E.docB = o.B;
      if (o.yeu) { E.tpK = 0.15; E.tpT = Math.max(E.tpT || 0, 0.6); E.yeu = Math.max(E.yeu, 0.6); } // Toxic Pool 5★ CORROSION (suy yếu: HOTRO.vuln, E.yeu = dấu hiển thị)
    }
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
    PX.tia(ctx, o.x0, o.y0, o.x1, o.y1, 2 * (1 - u), o.mau, (1 - u) * 0.9); // lõi màu = tia PNG tô màu
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
    if (o.T && G.ban[o.T.ban].t[o.T.o] === o.T) [x0, y0] = typeof AN !== 'undefined' ? AN.muzzle(o.T) : dauNong(o.T); // muzzle socket (anim.js)
    // animation hybrid: sét lan theo DANH SÁCH TRÚNG THẬT, mỗi mắt xích sáng sau ~45 ms (chuỗi dài: tổng ≤ 160 ms) — không vẽ dài hơn chuỗi luật
    const n = o.ds.length, buoc = Math.min(0.045, 0.16 / Math.max(1, n)), tt = o.t;
    for (let i = 0; i < n; i++) {
      const d = o.ds[i], v = (tt - i * buoc) / buoc;
      if (v <= 0.02) break;
      const k = v >= 1 ? 1 : 1 - (1 - v) * (1 - v);
      R.set(ctx, x0, y0, x0 + (d.x - x0) * k, y0 + (d.y - y0) * k, 26 - i * 2, o.seed + nhip * 7 + i);
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
      PX.tia(ctx, ax, ay, bx, by, 2.2, 'rgb(' + rgb + ')', 0.55 * (1 - u * 0.6));
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
      PX.tia(ctx, x, y, x + Math.cos(o.goc) * 600, y + Math.sin(o.goc) * 600, 1 + u * 1.5, '#7ffcff', 0.3 + 0.5 * u, -o.t * 80); // đường ngắm = tia PNG trượt
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
    if (o.t < 0) return false; // loạt bom Vệ Tinh thức tỉnh: rơi so le
    if (!o.E.chet) { o.x = o.E.x; o.y = o.E.y; }
    if (!o.da && o.t > 0.16) {
      o.da = true; noLan(o.x, o.y, o.r || 30, o.dmg, o.B, { mau: '#9fe6ff' });
      FX.no('dien', o.x, o.y, 70, 0.35); FX.no('no_phao', o.x, o.y, 60, 0.4); if (!o.vang || TVX.duocLac && TVX.duocLac(0.5)) FX.lac(2);
    }
  },
  ve(ctx, o, R) {
    if (o.t < 0) return;
    const u = Math.min(1, o.t / 0.16);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = o.da ? Math.max(0, 1 - (o.t - 0.16) / 0.3) : 1;
    const y0 = -20, y1 = y0 + (o.y - y0) * u;
    R.tia(ctx, 'tia_laser', o.x, y0, o.x, y1, 12, o.t * 300);
    R.tia(ctx, 'dan_tia', o.x, y0, o.x, y1, 22, 0, true);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.tuong = { // tường ánh sáng chặn đường rồi nổ · o.vang = TƯỜNG VÀNG (ghép Máy Dựng Tường): to hơn, đứng lâu, nổ lớn
  cap(G, o) {
    for (const E of G.quai) if (!E.chet && E.p === o.p && E.s < o.s && E.s > o.s - 26) { E.s = Math.max(E.s - 0.01, Math.min(E.s, o.s - 14)); E.chan = 0.05; }
    if (o.t >= o.song - 0.02 && !o.no) {
      o.no = true; const r = o.vang ? 84 : 58, mau = o.vang ? '#ffd23f' : '#9ffcff';
      noLan(o.x, o.y, r, o.dmg, o.B, { mau });
      FX.no('dien', o.x, o.y, o.vang ? 170 : 110, 0.4); FX.no('no_phao', o.x, o.y, o.vang ? 170 : 100, 0.5); FX.lac(o.vang ? 8 : 5); FX.vong1(o.x, o.y, 8, r + 2, o.vang ? '#ffe46b' : '#7ffcff', 0.35, 4); SND.no(o.vang ? 1 : 0.7);
      if (o.vang) { FX.vong1(o.x, o.y, 12, r * 1.5, '#ffd23f', 0.55, 6); FX.tiaLua(o.x, o.y, 22, '#ffe46b', 260, 12); FX.sang(0.3, '#ffd23f'); }
    }
    return false;
  },
  ve(ctx, o, R) {
    const u = o.t / o.song, a = Math.min(1, o.t / 0.15) * (u > 0.85 ? (1 - u) / 0.15 * 0.6 + 0.4 : 1); // VFX P3: tắt dần thay nhấp nháy 50 rad/s
    const nx = -Math.sin(o.goc), ny = Math.cos(o.goc), L = DUONG_RONG * (o.vang ? 0.72 : 0.62);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
    if (o.vang && typeof FXU !== 'undefined' && FXU.co('fx_wallgen_vang') && R.img('fx_wallgen_vang')) { // TƯỜNG VÀNG = ảnh ChatGPT (CAN-VE-3.json) dựng ngang đường
      const im = R.img('fx_wallgen_vang'), w = L * 2.3, h = w * im.height / im.width;
      ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.goc + Math.PI / 2); ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(im, -w / 2, -h / 2, w, h); ctx.restore();
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a * 0.3; R.anhGiua(ctx, R.cham1('#ffd23f'), o.x, o.y, L * 2.2);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; return;
    }
    if (o.vang) { // chờ ảnh: tường ánh sáng PNG tô VÀNG, dày hơn, 2 lớp
      const day = 14;
      PX.tia(ctx, o.x - nx * L, o.y - ny * L, o.x + nx * L, o.y + ny * L, day * 1.5, '#ffd23f', a * 0.85, o.t * 60);
      for (let k = -2; k <= 2; k++) { const ox = Math.cos(o.goc) * k * 4, oy = Math.sin(o.goc) * k * 4; R.tia(ctx, 'tia_lua', o.x - nx * L + ox, o.y - ny * L + oy, o.x + nx * L + ox, o.y + ny * L + oy, 18 - Math.abs(k) * 4, o.t * 150 + k * 40); }
      for (const sg of [-1, 1]) R.anhGiua(ctx, R.cham1('#ffd23f'), o.x + nx * L * sg, o.y + ny * L * sg, 34);
      ctx.globalAlpha = a * 0.35; R.anhGiua(ctx, R.cham1('#ffe46b'), o.x, o.y, L * 2);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; return;
    }
    // tia chiếu từ ụ tới tường
    const T = o.T;
    if (T && G.ban[T.ban].t[T.o] === T) { const [x, y] = dauNong(T); ctx.globalAlpha = a * 0.5; R.tia(ctx, 'tia_laser', x, y, o.x, o.y, 6, o.t * 200); ctx.globalAlpha = a; }
    // tấm tường ánh sáng: dải sáng dày + vạch quét + 2 cột phát ở mép đường
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.goc);
    const day = 10;
    ctx.restore(); // tấm tường = tia laser PNG dày tô lục lam (thay dải gradient + vạch fillRect vẽ code)
    PX.tia(ctx, o.x - nx * L, o.y - ny * L, o.x + nx * L, o.y + ny * L, day * 1.3, '#8affff', a * 0.75, o.t * 60);
    for (let k = -1; k <= 1; k++) {
      const ox = Math.cos(o.goc) * k * 4, oy = Math.sin(o.goc) * k * 4;
      R.tia(ctx, 'tia_set', o.x - nx * L + ox, o.y - ny * L + oy, o.x + nx * L + ox, o.y + ny * L + oy, 16 - Math.abs(k) * 5, o.t * 150 + k * 40);
    }
    for (const sg of [-1, 1]) R.anhGiua(ctx, R.cham1('#7ffcff'), o.x + nx * L * sg, o.y + ny * L * sg, 27);
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
      if (Math.random() < dt * 6) FX.hat1('lua', E.x, E.y, (o.x - E.x) * 2, (o.y - E.y) * 2, 0.4, 7, '#c070ff');
    }
    if (o.acc > 0.25) o.acc = 0;
    if (Math.random() < dt * 40) { const a = Math.random() * 6.28, r = o.r * rnd(0.6, 1.1); FX.hat1('lua', o.x + Math.cos(a) * r, o.y + Math.sin(a) * r, -Math.cos(a + 0.9) * r * 2.2, -Math.sin(a + 0.9) * r * 2.2, 0.45, 7, pick(['#9a4bff', '#b04bff', '#ffffff'])); }
    if (o.t >= o.song - 0.02 && !o.no) {
      o.no = true; noLan(o.x, o.y, o.r, o.dmg, o.B, { mau: '#ff6ad5' });
      G.dangBan = o.T; FX.no('laser_trung', o.x, o.y, o.r * 3, 0.5); FX.lac(8); FX.sang(0.25, '#9a4bff'); FX.vong1(o.x, o.y, o.r, 4, '#c070ff', 0.3, 5); // nổ nghiền = ảnh fx_blackhole_trung TÍM của ụ (trước: G.dangBan trống → nổ laser đỏ-hồng chung) SND.no(1);
    }
  },
  ve(ctx, o, R) {
    const u = o.t / o.song, mo = Math.min(1, o.t / 0.3) * (u > 0.9 ? (1 - u) * 10 : 1), r = o.r * (0.55 + 0.1 * Math.sin(o.t * 9));
    ctx.save(); ctx.translate(o.x, o.y);
    const hd = R.co('hu_hoden', o.r * 2); // đĩa xoáy ChatGPT (S4): code chỉ xoay + nhịp
    if (hd) {
      ctx.globalAlpha = mo; ctx.save(); ctx.rotate(-o.t * 4.5); const rr = o.r * 1.03; ctx.drawImage(hd, -rr, -rr, rr * 2, rr * 2); ctx.restore(); // VFX P0 hitbox: mép đĩa nhìn thấy (ảnh lề ~5%) = bán kính hút/nghiền o.r (trước: lệnh vẽ nằm lọt trong chú thích → đĩa không hiện, save() không restore)
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35 * mo; { const lo = typeof FXU !== 'undefined' && FXU.co('fx_blackhole_hieu') && REN.img('fx_blackhole_hieu'); if (lo) PX.ve(ctx, lo, 0, 0, r * 2.2, r * 2.2 * lo.height / lo.width, o.t * 2, 0.35 * mo); else R.khung(ctx, 'fx_laser_trung', 3, 0, 0, r * 2.6, o.t * 2); } // lõi xoáy = ảnh TÍM của Black Hole (trước: khung nổ laser đỏ-hồng)
      ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; return;
    }
    // ảnh đĩa xoáy chưa nạp: không vẽ (bỏ lõi đen + tay xoáy vẽ code)
    ctx.restore(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  },
};
HU.sam = { // overlord: tia sấm khổng lồ + chớp màn hình
  cap(G, o) {
    if (!o.da && o.t > 0.08) {
      o.da = true; noLan(o.x, o.y, o.r, o.dmg, o.B, { mau: '#fff27a' });
      FX.no('dien', o.x, o.y, o.r * 3, 0.55); FX.no('no_phao', o.x, o.y, o.r * 2.2, 0.6); FX.sang(0.7, '#fff6c0'); FX.lac(12);
      FX.vong1(o.x, o.y, 10, o.r, '#fff27a', 0.4, 6); FX.tiaLua(o.x, o.y, 30, '#fff27a', 320, 14);
      // AFTERSHOCK: sét dư chấn nhảy tới 4 quái gần nhất ngoài tâm nổ (×2 mỗi con) — phần "wow" bậc ĐỎ họ Energy
      // (QA vàng-đỏ: trước đây o.dmg/6 = ×1.5 và trúng lại cả quái đã dính nổ — chữ kỹ năng hứa ×2 cho 4 quái KHÁC)
      const ds = dsMucTieu(o.B).filter(E => { const d = Math.hypot(E.x - o.x, E.y - o.y); return !E.chet && d < 240 && d > o.r + E.d.co * 0.25; }).sort((a, b) => Math.hypot(a.x - o.x, a.y - o.y) - Math.hypot(b.x - o.x, b.y - o.y)).slice(0, 4);
      if (ds.length) { for (const E of ds) trung(E, o.dmg * 2 / 9, { B: o.B, mau: '#fff27a', phu: true }); G.hu.push({ k: 'set', t: 0, song: 0.3, x: o.x, y: o.y, ds: ds.map(Q => ({ Q, x: Q.x, y: Q.y })), seed: Math.random() * 999 }); }
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
