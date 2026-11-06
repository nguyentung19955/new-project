// TURRET MERGE — KIỂM DỌN BÁO CHIÊU TRÙM (lỗi iPhone SOLO wave 11: trùm chết rồi dấu đỏ nhấp nháy vẫn ở lại trên 3 ô ụ).
// Mỗi trùm (12) × mỗi pha báo chiêu (vừa bắt đầu / giữa / sắp nổ) × mỗi cách kết thúc:
//   chet (giết trùm) · lot (trùm lọt) · ketThuc (hết trận: thắng/thua/bỏ) · dongbo (online dựng lại: G.quai thay mới)
//   · banU (ụ bị nhắm bị bán/thay) · batDau (chơi lại / về menu rồi vào trận)
// + chiêu bị CHẶN (khiên ụ / khiên bàn / Mirror Gate) và trùm bị choáng → để chiêu nổ rồi chờ 0,6 s.
// Khẳng định: TVF.ds = 0, không còn pop của trùm, mọi ụ st.ngam = 0 & ngamK = null, không trùm nào giữ E.bao, và
// ẢNH: khung vẽ hiện tại == khung vẽ sau khi xoá cưỡng bức mọi nguồn báo chiêu (diff điểm ảnh trên vùng bàn = 0).
// SOLO + CO-OP + PVP. Chạy (gốc repo): python3 -m http.server 8765 &  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-trum-don.js [BASE]
//   CHE=solo,coop → chỉ vài chế độ · CHI=freezer,leech → chỉ vài trùm · MO_LOI=1 → tắt bản sửa (bài kiểm phải TRƯỢT)
'use strict';
const { chromium } = require('playwright');
const BASE = process.argv[2] || process.env.BASE || 'http://localhost:8765/thap/';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const TRUM12 = ['mad_crown', 'freezer', 'janus', 'joker_king', 'nightmare', 'octopus', 'hive', 'jammer', 'prism', 'twin_core', 'patcher', 'leech'];
const CHI = (process.env.CHI || '').split(',').filter(Boolean);
const CHE = (process.env.CHE || 'solo,coop,pvp').split(',').filter(Boolean);
const PHA = [0.05, 0.7, 1.35];
const KET = ['chet', 'lot', 'ketThuc', 'dongbo', 'batDau', 'banU'];   // banU: ụ bị nhắm bị bán → chiêu nổ vào khoảng không, không để dấu
const CHAN = ['khien', 'banKhien', 'guong', 'choang'];
const LOI = [];
let dem = 0;

// ----- chạy trong trang -----
function PG() {
  window.KTD = {
    buoc(s) { const n = Math.round(s / BUOC); for (let i = 0; i < n && !G.ketThuc; i++) { chupTruoc(); capNhat(BUOC); } },
    dat() { // bàn đầy ụ, không wave, không quái
      G.ketThuc = null; G.dung = true; G.quai.length = 0; G.hang.length = 0; G.dan.length = 0; G.hu.length = 0; G.cho = 1e9; G.wave = 20;
      for (const B of G.ban) {
        for (let i = 0; i < 15; i++) { B.t[i] = sinhU(taoU(B, B.deck[i % 4], 1 + (i * 7) % 3, i)); B.t[i].vxA = null; B.t[i].anim = null; }
        B.t[6].sao = 5; B.t[2].sao = 4; B.khien = 0; B.halo = 0; B.cuong = 0; B.tim = 99;
      }
      TVF.xoaHet();
    },
    sinh(id, pi) {
      const E = sinhTrum(id, pi); E.s = 70; E.vao = 1; E.knT = 0.02; E.hp = E.max = 1e9;
      if (id === 'prism' && E.khien) { E.khien.on = false; E.khien.be = 0; }
      return E;
    },
    // chờ tới pha u (giây) của báo chiêu; true nếu trùm có báo chiêu
    toiPha(E, u) {
      for (let i = 0; i < 600 && !E.bao; i++) { chupTruoc(); capNhat(BUOC); }
      if (!E.bao) return false;
      this.buoc(Math.max(0, u - E.bao.t));
      return !!E.bao;
    },
    sach(E) { // còn gì của báo chiêu không?
      const r = [];
      if (TVF.ds.length) r.push('TVF.ds=' + TVF.ds.length);
      const p = TVF.pop.filter(p => (E && p.E === E) || TRUM_POP.includes(p.k)); if (p.length) r.push('TVF.pop=' + p.map(p => p.k).join('+'));
      for (const B of G.ban) for (const T of B.t) if (T && (T.st.ngam > 0 || T.st.ngamK)) { r.push('ngam ô ' + B.i + ':' + T.o + '=' + (+T.st.ngam).toFixed(2) + (T.st.ngamK ? '/' + T.st.ngamK : '')); break; }
      for (const Q of G.quai) if (Q.trum && Q.bao && (Q.chet || Q === E)) r.push('E.bao còn (' + Q.trum + (Q.chet ? ' chết' : '') + ')');
      return r;
    },
    // ảnh vùng bàn: hiện tại vs sau khi xoá cưỡng bức mọi nguồn báo chiêu (cùng REN.t, dt 0) → số điểm ảnh khác
    anh() {
      const cv = document.getElementById('cv'), cx = cv.getContext('2d');
      const pn = performance.now, dn = Date.now, mr = Math.random, t0 = pn.call(performance), d0 = dn();
      const dong = () => { let h = 7; performance.now = () => t0; Date.now = () => d0; Math.random = () => ((h = (h * 16807) % 2147483647) / 2147483647); }; // đóng băng thời gian + ngẫu nhiên lúc vẽ
      FX.reset(); // hạt / chữ nổi / rung màn tạm thời (chạy theo thời gian thực, tự tan ≤ 0,45 s) — không phải báo chiêu
      const F = ['hat1', 'no', 'no1', 'vong1', 'chu1', 'lac', 'sang'], goc = F.map(k => FX[k]);
      const lay = () => { dong(); F.forEach(k => { FX[k] = () => null; }); try { REN.ve(0, 1); REN.ve(0, 1); } finally { performance.now = pn; Date.now = dn; Math.random = mr; F.forEach((k, i) => { FX[k] = goc[i]; }); } const o = []; for (const B of G.ban) { const k = cv.width / W, x0 = (B.o[0].x - B.cw * 0.6) * k, y0 = (B.o[0].y - B.ch * 0.6) * k, x1 = (B.o[14].x + B.cw * 0.6) * k, y1 = (B.o[14].y + B.ch * 0.6) * k; o.push(cx.getImageData(x0 | 0, y0 | 0, (x1 - x0) | 0, (y1 - y0) | 0).data); } return o; };
      // A = vẽ trạng thái thật · B = vẽ sau khi xoá cưỡng bức mọi nguồn báo chiêu. Vẽ xen kẽ 3 lượt (bộ đệm ảnh/mip dựng dần) rồi so lượt cuối.
      const t = REN.t, giu = [], giuBao = G.quai.map(Q => [Q, Q.bao]), ds = TVF.ds.slice(), pop = TVF.pop.slice();
      for (const B of G.ban) for (const T of B.t) if (T) giu.push([T, T.st.ngam, T.st.ngamK]);
      const xoa = () => { for (const B of G.ban) for (const T of B.t) if (T) { T.st.ngam = 0; T.st.ngamK = null; } for (const Q of G.quai) if (Q.trum) Q.bao = null; TVF.ds.length = 0; TVF.pop.length = 0; for (const p of pop) if (!TRUM_POP.includes(p.k)) TVF.pop.push(p); }; // giữ hiệu ứng chỉ huy (REINFORCE) của bàn AI
      const tra = () => { for (const [T, n, k] of giu) { T.st.ngam = n; T.st.ngamK = k; } for (const [Q, v] of giuBao) Q.bao = v; TVF.ds.length = 0; TVF.ds.push(...ds); TVF.pop.length = 0; TVF.pop.push(...pop); };
      let a, b;
      // dấu thật hiện ở MỌI lượt; nhiễu vẽ lẻ tẻ (bộ đệm ảnh dựng dần…) → lấy lượt ít khác nhất trong 3 lượt
      const so = (a, b) => { let k = 0; for (let i = 0; i < a.length; i++) { const A = a[i], B = b[i]; for (let j = 0; j < A.length; j += 4) if (Math.abs(A[j] - B[j]) + Math.abs(A[j + 1] - B[j + 1]) + Math.abs(A[j + 2] - B[j + 2]) > 24) k++; } return k; };
      let khac = 1e9;
      for (let l = 0; l < 3 && khac > 0; l++) { tra(); REN.t = t; a = lay(); xoa(); REN.t = t; b = lay(); khac = Math.min(khac, so(a, b)); }
      tra(); REN.t = t;
      return khac;
    },
    chay(id, pi, u, ket) {
      this.dat(); const E = this.sinh(id, pi);
      const co = this.toiPha(E, u);
      const truoc = { bao: !!E.bao, ds: TVF.ds.length, ngam: G.ban.reduce((s, B) => s + B.t.filter(T => T && T.st.ngam > 0).length, 0) };
      const B = G.ban[E.ban];
      if (ket === 'chet') chet(E, B);
      else if (ket === 'lot') { E.s = G.duong[E.p].len; lot(E); }
      else if (ket === 'ketThuc') { const st = window.setTimeout; window.setTimeout = () => 0; try { ketThuc(false, 'kt'); } finally { window.setTimeout = st; } }
      else if (ket === 'dongbo') { G.quai = []; }
      else if (ket === 'banU') { if (E.bao) for (const X of G.ban) for (let i = 0; i < 15; i++) if (X.t[i] && ((E.bao.muc || []).includes(X.t[i].uid) || (E.bao.muc2 || []).includes(X.t[i].uid))) X.t[i] = null; }
      else if (ket === 'batDau') { const st = window.setTimeout; window.setTimeout = () => 0; try { batDau(G.che, G.ban[0].deck, G.ban[0].mv && G.ban[0].mv.id || 'hero'); } finally { window.setTimeout = st; } this.dat(); }
      else if (ket === 'khien') { for (const X of G.ban) for (const T of X.t) if (T) T.khien = 1; }
      else if (ket === 'banKhien') { for (const X of G.ban) X.khien = 99; }
      else if (ket === 'guong') { for (const X of G.ban) { X.t[12] = sinhU(taoU(X, 'guongcong', 3, 12)); X.t[12].nap = 1; } }
      else if (ket === 'choang') { E.chan = 3; }
      if (CHAN_DS.includes(ket)) { G.ketThuc = null; this.buoc(1.4 + 0.6); } // để chiêu nổ (bị chặn / trúng) + 0,6 s
      else if (!G.ketThuc) this.buoc(0.6);
      if (ket === 'chet' || ket === 'lot') this.buoc(0.3); // xác trùm đã dọn
      const r = this.sach(ket === 'dongbo' || ket === 'batDau' ? null : E), px = this.anh();
      G.ketThuc = null;
      return { co, truoc, r, px };
    },
  };
  window.TRUM_POP = ['trung', 'chan', 'vong', 'noi'];
  window.CHAN_DS = ['khien', 'banKhien', 'guong', 'choang', 'banU'];
}

(async () => {
  const b = await chromium.launch();
  for (const che of CHE) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const loiTrang = [];
    p.on('pageerror', e => loiTrang.push(e.message));
    await p.goto(BASE + '?mode=' + che + '&deck=canon,bang,tia,set,khien&deck2=canon,bang,tia,set,khien&mana=0&notut=1&seed=12345&af=hero', { waitUntil: 'load', timeout: 90000 });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && typeof TVF !== 'undefined' && typeof huyBaoTrum === 'function', null, { timeout: 60000 });
    await sleep(4000);
    await p.evaluate(PG);
    if (process.env.MO_LOI) await p.evaluate(() => { huyBaoTrum = () => {}; donNgam = () => {}; huyMoiBaoTrum = () => {}; TVF.don = () => {}; TVF.conChu = (d) => d.E && !d.E.chet && d.E.bao === d.bao && d.B.t[d.o] === d.T && d.T.st.ngam > 0; }); // tự kiểm: bỏ bản sửa → phải TRƯỢT
    // trùm trên mọi bàn (CO-OP / PVP: cả bàn đồng đội / đối thủ)
    const lan = await p.evaluate(() => { const o = []; const da = new Set(); G.duong.forEach((d, i) => { if (!da.has(d.ban)) { da.add(d.ban); o.push(i); } }); return o; });
    let n = 0, hong = 0;
    for (const id of TRUM12) {
      if (CHI.length && !CHI.includes(id)) continue;
      for (const pi of lan) {
        for (const u of PHA) for (const ket of KET.concat(u === PHA[1] ? CHAN : [])) {
          const r = await p.evaluate(([id, pi, u, ket]) => KTD.chay(id, pi, u, ket), [id, pi, u, ket]);
          n++; dem++;
          const bad = r.r.length || r.px > 0;
          if (bad) { hong++; LOI.push(che + ' ' + id + ' làn ' + pi + ' pha ' + u + ' ' + ket + ': ' + r.r.join(', ') + (r.px ? ' · ' + r.px + ' điểm ảnh báo chiêu còn trên bàn' : '')); }
          // sanity: trùm nhắm ụ phải thật sự đã báo chiêu (không thì kiểm rỗng)
          if (u === PHA[1] && ket === 'chet' && id !== 'twin_core' && !r.truoc.bao) LOI.push(che + ' ' + id + ': không vào được báo chiêu (kiểm rỗng)');
        }
      }
    }
    if (loiTrang.length) LOI.push(che + ': lỗi trang — ' + loiTrang.slice(0, 3).join(' | '));
    console.log((hong ? '  ✗ ' : '  ✓ ') + che + ': ' + n + ' tình huống, ' + hong + ' còn dấu báo chiêu');
    await ctx.close();
  }
  await b.close();
  for (const l of LOI.slice(0, 30)) console.log('    ' + l);
  console.log(LOI.length ? 'TRƯỢT — dọn báo chiêu trùm (' + LOI.length + ' lỗi / ' + dem + ')' : 'XANH — dọn báo chiêu trùm: ' + dem + ' tình huống, 0 dấu sót');
  process.exit(LOI.length ? 1 : 0);
})();
