// Công cụ xem thử (chỉ dùng khi dựng ảnh duyệt, không nằm trong game).
const XEM = {};
(function () {
const M = G.monsterArt, NEN = '#15131d', O = '#201d2b', CHU = '#f3e9d2', MO = '#9a94a8', VANGT = '#ffd27a';
const FONTX = '"Inter","DejaVu Sans",sans-serif';
function mkc(w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; return [cv, c]; }
function chu(c, s, x, y, px, col, bold, al) { c.font = (bold ? '700 ' : '500 ') + px + 'px ' + FONTX; c.fillStyle = col; c.textAlign = al || 'left'; c.textBaseline = 'alphabetic'; c.fillText(s, x, y); }
XEM.chu = chu; XEM.mkc = mkc;
const D = id => M._defs[id];
// Tờ lưới toạ độ: hình gốc phóng s lần, kẻ ô 5 điểm ảnh, tô màu từng bộ phận, đánh dấu khớp.
XEM.luoi = function (id, ph, s) { const B = M._goc(id, ph || 1); s = s || Math.max(4, Math.min(10, Math.floor(1500 / B.w))); const L = 34, [cv, c] = mkc(B.w * s + L + 10, B.h * s + L + 30); c.fillStyle = NEN; c.fillRect(0, 0, cv.width, cv.height);
  const MAUP = ['#ff4d4d', '#4dff6a', '#4da6ff', '#ffd24d', '#ff4dff', '#4dffff', '#ff944d', '#b04dff', '#a8ff4d', '#ff4d9c', '#4d6bff', '#ffffff'];
  for (let y = 0; y < B.h; y++) for (let x = 0; x < B.w; x++) { const col = B.g.d[y * B.w + x]; if (col) { c.fillStyle = col; c.fillRect(L + x * s, L + y * s, s, s); } const o = B.owner[y * B.w + x]; if (o) { c.globalAlpha = .38; c.fillStyle = MAUP[(o - 1) % MAUP.length]; c.fillRect(L + x * s, L + y * s, s, s); c.globalAlpha = 1; } }
  for (let x = 0; x <= B.w; x++) { c.fillStyle = x % 10 === 0 ? 'rgba(255,255,255,.5)' : x % 5 === 0 ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.06)'; c.fillRect(L + x * s, L, 1, B.h * s); if (x % 10 === 0) chu(c, '' + x, L + x * s, L - 6, 13, CHU, false, 'center'); }
  for (let y = 0; y <= B.h; y++) { c.fillStyle = y % 10 === 0 ? 'rgba(255,255,255,.5)' : y % 5 === 0 ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.06)'; c.fillRect(L, L + y * s, B.w * s, 1); if (y % 10 === 0) chu(c, '' + y, L - 5, L + y * s + 5, 13, CHU, false, 'right'); }
  c.fillStyle = '#ff0'; c.fillRect(L, L + B.foot * s, B.w * s, 2); c.fillRect(L + B.cx * s, L, 2, B.h * s);
  B.parts.forEach((p, i) => { const x = L + p.pv[0] * s, y = L + p.pv[1] * s; c.fillStyle = '#000'; c.fillRect(x - 5, y - 5, 10, 10); c.fillStyle = MAUP[i % MAUP.length]; c.fillRect(x - 3, y - 3, 6, 6); chu(c, p.n, x + 7, y + 4, 13, '#fff', true); });
  chu(c, id + (ph ? ' pha ' + ph : '') + '   lưới ' + B.w + 'x' + B.h + '   chân y=' + B.foot + '  tâm x=' + B.cx + '  (vạch vàng)   A=' + B.A, L, cv.height - 8, 15, VANGT, true); return cv; };
// Nền sàn tối của một ô
function nenO(c, x, y, w, h, mau) { c.fillStyle = mau || O; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(255,255,255,.025)'; for (let j = 0; j < h; j += 16) for (let i = (j / 16 % 2) * 16; i < w; i += 32) c.fillRect(x + i, y + j, Math.min(16, w - i), Math.min(16, h - j)); }
XEM.nenO = nenO;
// Dải khung hình của một cử động: n khung cách đều.
XEM.dai = function (id, anim, o) { o = o || {}; const d = D(id), B = M._goc(id, o.phase || 1), an = d.anims[anim], n = o.n || 8, s = o.s || 4, tam = o.le != null ? o.le : Math.max(30, (d.don && d.don.tam || 24) + 6);
  const cw = o.cw || Math.round(B.bw + tam * 2), ch = o.ch || Math.round(B.bh + tam + 30 + (d.bay ? 10 : 0)), [lo, lc] = mkc(cw * n, ch), [cv, c] = mkc(cw * n * s, ch * s + 30); c.fillStyle = NEN; c.fillRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < n; i++) { const t = an.d * (an.lap ? i / n : i / (n - 1)) - (i === n - 1 && !an.lap ? 1e-4 : 0); lc.save(); lc.beginPath(); lc.rect(i * cw, 0, cw, ch); lc.clip(); nenO(lc, i * cw + 1, 0, cw - 2, ch); M.draw(lc, id, i * cw + cw / 2 + (o.ox || 0), ch - (o.day != null ? o.day : Math.min(tam, ch * .3)), { anim, t: Math.max(0, t), dir: o.dir, face: o.face, phase: o.phase }); lc.restore(); }
  c.drawImage(lo, 0, 0, cw * n * s, ch * s); for (let i = 0; i < n; i++) chu(c, (i + 1) + '/' + n, i * cw * s + 6, 16, 13, MO);
  chu(c, d.ten + ' · ' + an.nhan + ' (' + anim + ', ' + an.d + ' giây)' + (o.dir != null ? ' · hướng ' + Math.round(o.dir * 180 / Math.PI) + '°' : ''), 8, cv.height - 9, 16, CHU, true); return cv; };
// Mọi cử động của một con, mỗi cử động một dải (xếp dọc).
XEM.tatCa = function (id, o) { o = o || {}; const d = D(id), ks = (o.anims || Object.keys(d.anims)), cvs = ks.map(k => XEM.dai(id, k, o)); const W = Math.max(...cvs.map(v => v.width)), H = cvs.reduce((a, v) => a + v.height + 4, 0), [cv, c] = mkc(W, H); c.fillStyle = NEN; c.fillRect(0, 0, W, H); let y = 0; for (const v of cvs) { c.drawImage(v, 0, y); y += v.height + 4; } return cv; };
// Bé đứng cạnh để so cỡ (vẽ ở độ phân giải cao)
XEM.be = function (c, x, y, s) { if (typeof put === 'function') put(c, { key: 'smith', weapon: W('sword') }, x, y, s); };

// ---------- tờ ảnh động ----------
// spec: {tieuDe, cols, cw, ch, s, o: [{id, phase, nhan}], doan: [{ten, anims: ['tele','atk'], dir, giay, phase}], chanY, beX}
// Mỗi đoạn: mọi ô chạy lần lượt các cử động trong anims (xong thì đứng thở). Trả về số khung.
XEM.to = function (spec) { XEM.S = spec; const s = spec.s || 3, cols = spec.cols, cw = spec.cw, ch = spec.ch;
  // Ô thường xếp lưới cols cột; ô "to" (con lớn) xếp ở hàng riêng phía dưới, mỗi hàng spec.colsTo ô, cao spec.chTo.
  const nho = spec.o.filter(o => !o.to), lon = spec.o.filter(o => o.to), rN = Math.ceil(nho.length / cols), cT = spec.colsTo || 2, W0 = cols * cw, cwT = Math.floor(W0 / cT), chT = spec.chTo || ch;
  nho.forEach((o, i) => { o._r = [(i % cols) * cw, Math.floor(i / cols) * ch, cw, ch]; });
  lon.forEach((o, i) => { o._r = [(i % cT) * cwT, rN * ch + Math.floor(i / cT) * chT, cwT, chT]; });
  const H0 = rN * ch + Math.ceil(lon.length / cT) * chT; spec.top = 46; spec.W = W0 * s; spec.H = H0 * s + spec.top;
  spec.kh = []; spec.doan.forEach((dn, di) => { let dai = 0; for (const o of spec.o) { const d = D(o.id); let t = 0; for (const a of (dn.rieng && dn.rieng[o.id] || dn.anims)) if (d.anims[a]) t += d.anims[a].lap ? (dn.giay || 2) : d.anims[a].d; dai = Math.max(dai, t); } dai += dn.nghi == null ? .35 : dn.nghi; const n = Math.round(dai * M.fps); for (let i = 0; i < n; i++) spec.kh.push([di, i / M.fps]); });
  [XEM.lo, XEM.lc] = mkc(W0, H0); [XEM.cv, XEM.c] = mkc(spec.W, spec.H); return spec.kh.length; };
XEM.khung = function (k) { const S = XEM.S, [di, t] = S.kh[k], dn = S.doan[di], s = S.s || 3, lc = XEM.lc, c = XEM.c;
  c.fillStyle = NEN; c.fillRect(0, 0, S.W, S.H); lc.clearRect(0, 0, XEM.lo.width, XEM.lo.height);
  S.o.forEach((o, i) => { const d = D(o.id), [cx, cy, ow, oh] = o._r, day = o.day != null ? o.day : (S.day || 26), fx = cx + (o.x != null ? o.x : ow / 2 + (S.lech || 8)), fy = cy + (o.y != null ? o.y : oh - day);
    lc.save(); lc.beginPath(); lc.rect(cx + 1, cy + 1, ow - 2, oh - 2); lc.clip(); nenO(lc, cx + 1, cy + 1, ow - 2, oh - 2, S.mauNen);
    let tt = t, anim = 'idle', ta = t, het = true; for (const a of (dn.rieng && dn.rieng[o.id] || dn.anims)) { const an = d.anims[a]; if (!an) continue; const dd = an.lap ? (dn.giay || 2) : an.d; if (tt < dd) { anim = a; ta = tt; het = false; break; } tt -= dd; if (a === 'die') { anim = null; } else { anim = 'idle'; ta = tt; } }
    const ph = dn.phase || o.phase || 1; o._nhan = anim && !het ? d.anims[anim].nhan : (anim ? d.anims.idle.nhan : '');
    if (anim) M.draw(lc, o.id, fx, fy, { anim, t: ta, dir: dn.dir, face: dn.face || (dn.dir == null ? -1 : 0), phase: typeof ph === 'function' ? ph(anim) : ph });
    lc.restore(); });
  c.drawImage(XEM.lo, 0, S.top, XEM.lo.width * s, XEM.lo.height * s);
  S.o.forEach((o, i) => { const d = D(o.id), cx = o._r[0] * s, cy = o._r[1] * s + S.top, ow = o._r[2], oh = o._r[3], day = o.day != null ? o.day : (S.day || 26); if (S.be !== false) XEM.be(c, cx + (S.beX || 16) * s, cy + (o.y != null ? o.y : oh - day) * s, s);
    chu(c, o.nhan || d.ten, cx + ow * s / 2, cy + oh * s - 9, S.coChu || 17, S.mauChu || CHU, true, 'center'); if (S.nhanO) chu(c, o._nhan || '', cx + ow * s - 8, cy + 20, 14, VANGT, false, 'right'); });
  chu(c, S.tieuDe, 12, 30, 22, VANGT, true); chu(c, dn.ten, S.W - 12, 30, 22, '#ffffff', true, 'right');
  const tot = S.kh.length; c.fillStyle = '#3a3548'; c.fillRect(0, S.top - 5, S.W, 3); c.fillStyle = VANGT; c.fillRect(0, S.top - 5, Math.round(S.W * (k + 1) / tot), 3);
  return XEM.cv; };
// Bảng khung hình tĩnh: mỗi hàng một con (hoặc một cử động), mỗi ô một khung. rows: [{ten, o: [{id, anim, t, dir, phase, nhan}]}]
XEM.bang = function (spec) { const s = spec.s || 2, L = spec.le || 150, R = spec.rows.map(r => ({ r, cw: r.cw || spec.cw, ch: r.ch || spec.ch, day: r.day || spec.day || 16 }));
  const W = L + Math.max(...R.map(q => q.cw * q.r.o.length)) * s, H = R.reduce((a, q) => a + q.ch * s, 0) + 40, [cv, c] = mkc(W, H); c.fillStyle = NEN; c.fillRect(0, 0, W, H); let y = 40;
  for (const q of R) { const r = q.r, cw = q.cw, ch = q.ch, [lo, lc] = mkc(cw * r.o.length, ch);
    r.o.forEach((o, i) => { lc.save(); lc.beginPath(); lc.rect(i * cw + 1, 1, cw - 1, ch - 1); lc.clip(); nenO(lc, i * cw + 1, 1, cw - 1, ch - 1); M.draw(lc, o.id, i * cw + cw / 2 + (spec.lech || 0), ch - q.day, { anim: o.anim, t: o.t, dir: o.dir, face: o.face || (o.dir == null ? -1 : 0), phase: o.phase }); lc.restore(); });
    c.drawImage(lo, L, y, lo.width * s, lo.height * s); chu(c, r.ten, 8, y + ch * s / 2, spec.coChu || 15, CHU, true); if (r.phu) chu(c, r.phu, 8, y + ch * s / 2 + 18, 12, MO);
    r.o.forEach((o, i) => { if (o.nhan) chu(c, o.nhan, L + i * cw * s + 5, y + 14, 12, VANGT); }); y += ch * s; }
  chu(c, spec.tieuDe, 8, 27, 20, VANGT, true); return cv; };
// Bảng khung hình chuẩn cho một tờ quái: mỗi con một hàng, mỗi cử động k khung.
XEM.bangQuai = function (ids, tieuDe, o) { o = o || {}; const k = o.k || 3; o = Object.assign({}, o); const rows = ids.map(id => { const d = D(id), B = M._goc(id, o.phase || 1), r = { ten: d.ten, o: [], cw: Math.max(o.cw || 72, Math.ceil(B.bw * 1.2 + 14)), ch: Math.max(o.ch || 66, Math.ceil(B.bh * 1.25 + (o.day || 18) + 10 + (d.bay ? (d.cao || 8) : 0))) }; const TT = ['spawn', 'intro', 'idle', 'move', 'tele', 'atk', 'hit', 'stun', 'die'], ks = Object.keys(d.anims).sort((p, q) => ((TT.indexOf(p) + 1 || 50) - (TT.indexOf(q) + 1 || 50))); for (const a of (o.anims || ks)) { const an = d.anims[a]; if (!an) continue; for (let i = 0; i < k; i++) { const f = an.lap ? i / k : (i + .5) / k; r.o.push({ id, anim: a, t: an.d * f, dir: o.dir, nhan: i === 0 ? an.nhan : '' }); } } return r; });
  return XEM.bang({ tieuDe, rows, cw: o.cw || 72, ch: o.ch || 66, s: o.s || 2, day: o.day || 18, le: o.le || 150 }); };
})();
