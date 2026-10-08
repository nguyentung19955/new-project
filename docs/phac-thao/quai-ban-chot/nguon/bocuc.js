// Bố cục các tờ bản chốt: ba tờ vùng, tờ sáu trùm, tờ tổng hợp.
// Hình quái lấy từ các file khác (Q2, QR, QL, QT, QH). Thiếu hình nào thì vẽ ô xám giữ chỗ đúng cỡ dự kiến.
'use strict';
const BC_V = {
  bien: { ten: 'Hang biển', he: 'Băng', mau: '#7cc4ee', nen: 'bien' },
  rung: { ten: 'Rừng già', he: 'Độc', mau: '#a8e08a', nen: 'rung' },
  laudai: { ten: 'Lâu đài cổ', he: 'Lửa', mau: '#ff9d6a', nen: 'laudai' },
};
const BC_BE = { key: 'smith', weapon: W('sword') };

// ---------- hình giữ chỗ và lấy hình an toàn ----------
function BC_cho(w, h) { const g = S(w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) g.d[y * w + x] = (x === 0 || y === 0 || x === w - 1 || y === h - 1) ? '#b4b0bc' : ((x + y) % 8 === 0 ? '#6c6874' : '#56525e'); g.cho = true; return g; }
function BC_lay(fn, w, h) { try { const g = fn(); if (g && g.d && g.d.some(Boolean)) return g; } catch (e) { } return BC_cho(w, h); }
function BC_Q(v) { return v === 'bien' ? Q2 : v === 'rung' ? QR : QL; }
// Khoảng lấn của một hình tính từ điểm chân (đơn vị: điểm ảnh lưới): trái, phải, lên, xuống.
function BC_ext(it) {
  if (it.bom && !it.g) return { l: 14, r: 14, up: 18, dn: 3 };
  const g = it.g, b = g.bb || (g.bb = bbox(g)); const cx = g.cx != null ? g.cx : (b.x0 + b.x1 + 1) / 2, fy = g.foot != null ? g.foot : b.y1 + 1;
  const e = { l: cx - b.x0, r: b.x1 + 1 - cx, up: fy - b.y0, dn: Math.max(0, b.y1 + 1 - fy) };
  if (it.bom) { e.l = Math.max(e.l, 14); e.r = Math.max(e.r, 14); e.dn = Math.max(e.dn, 3); }
  return e;
}
// Vẽ lưới với tỉ lệ bất kỳ (tỉ lệ lẻ thì vẽ qua ảnh tạm, vẫn giữ điểm ảnh sắc).
function BC_luoi(c, g, x, y, s) {
  if (s === Math.round(s)) { draw(c, g, x, y, s); return; }
  const [t, tc] = mk(g.w, g.h); for (let j = 0; j < g.h; j++) for (let i = 0; i < g.w; i++) { const col = g.d[j * g.w + i]; if (col) { tc.fillStyle = col; tc.fillRect(i, j, 1, 1); } }
  const b = g.bb || (g.bb = bbox(g)); const cx = g.cx != null ? g.cx : (b.x0 + b.x1 + 1) / 2, fy = g.foot != null ? g.foot : b.y1 + 1;
  c.imageSmoothingEnabled = false; c.drawImage(t, Math.round(x - cx * s), Math.round(y - fy * s), Math.round(g.w * s), Math.round(g.h * s));
}
function BC_ve(c, it, x, y, s) {
  if (it.bom) {
    if (!it.g && typeof bomSan2 !== 'undefined') { bomSan2(c, x, y, s); return; }
    c.strokeStyle = 'rgba(255,90,70,.35)'; c.lineWidth = s; c.beginPath(); c.ellipse(x, y - s, 13 * s, 4 * s, 0, 0, 7); c.stroke();
    c.strokeStyle = '#ff5a46'; c.beginPath(); c.ellipse(x, y - s, 13 * s, 4 * s, 0, -1.2, 2.6); c.stroke();
  }
  BC_luoi(c, it.g || BC_cho(14, 14), x, y, s);
}
// Tỉ lệ lớn nhất (không quá sMax) để hình vừa khung maxW x maxH. buoc: bước làm tròn (1 = số nguyên).
function BC_fit(it, maxW, maxH, sMax, buoc) { const e = BC_ext(it); buoc = buoc || 1; let s = Math.min(sMax, maxW / (e.l + e.r), maxH / (e.up + e.dn)); s = Math.floor(s / buoc) * buoc; return Math.max(buoc, s); }
// Xếp một hàng hình trong khoảng [x0, x1], khe đều nhau. Trả về tâm chân của từng hình.
function BC_xep(its, x0, x1, s) { let sum = 0; const es = its.map(BC_ext); for (const e of es) sum += (e.l + e.r) * s; const gap = (x1 - x0 - sum) / its.length; let x = x0 + gap / 2; return es.map(e => { const px = x + e.l * s; x += (e.l + e.r) * s + gap; return Math.round(px); }); }

// ---------- nền dải "cỡ thật" ----------
function BC_nen(c, x, y, w, h, fl, kieu) {
  if (kieu === 'bien' && typeof caveBg !== 'undefined') { caveBg(c, x, y, w, h, fl); return; }
  const m = kieu === 'laudai' ? ['#170a0d', '#3a1512', '#3c1b17', '#9a4424', '#27100e'] : kieu === 'rung' ? ['#0b1a12', '#15381f', '#1c4426', '#3f8436', '#12301a'] : ['#0f2038', '#173a55', '#1d4a63', '#2a6a80', '#163a50'];
  c.save(); c.beginPath(); c.roundRect(x, y, w, h, 14); c.clip(); const gr = c.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, m[0]); gr.addColorStop(1, m[1]); c.fillStyle = gr; c.fillRect(x, y, w, h);
  c.fillStyle = m[2]; c.fillRect(x, y + fl, w, h - fl); c.fillStyle = m[3]; c.fillRect(x, y + fl, w, 6); c.fillStyle = m[4]; for (let i = 0; i < w; i += 54) c.fillRect(x + i + (i * 7 % 23), y + fl + 18 + (i * 5 % 30), 24, 6); c.restore();
}
function BC_bong(c, it, x, fy, s) { if (it.bom) return; const e = BC_ext(it), w = Math.round((e.l + e.r) * .6); if (w <= 70) shadow(c, x, fy + s, Math.max(8, w), s); }
// Một dải nền có sàn, em bé đứng đầu, rồi các hình phóng 3 lần. Trả về chiều cao dải.
function BC_dai(c, x, y, w, its, kieu) {
  let up = 30; for (const it of its) up = Math.max(up, BC_ext(it).up); const h = Math.max(240, Math.round(up * 3) + 40 + 60), fl = h - 60, fy = y + fl + 6;
  BC_nen(c, x, y, w, h, fl, kieu); put(c, BC_BE, x + 74, fy, 3);
  const xs = BC_xep(its, x + 140, x + w - 10, 3); its.forEach((it, i) => { BC_bong(c, it, xs[i], fy, 3); BC_ve(c, it, xs[i], fy, 3); });
  return h;
}

// ---------- dữ liệu từng vùng ----------
function BC_cfg(v) {
  const o = Object.assign({ khoa: v }, BC_V[v]); const vh = o.ten + ' · hệ ' + o.he; const info = typeof TM_INFO !== 'undefined' ? TM_INFO : {};
  let ds = null, ta = null;
  if (v === 'bien') {
    if (typeof DS2 !== 'undefined') ds = DS2;
    ta = [['cuaTuong', 'Cua Tướng', 'Tinh anh của Cua Lính. Vương miện san hô, mắt đỏ rực, càng răng cưa, vai vắt lưới rách.', '#7cc4ee'], ['caNocChua', 'Cá Nóc Chúa', 'Tinh anh của Cá Nóc. Vương miện băng, nanh dài, sẹo qua mắt, hào quang lạnh.', '#8ff0d8']];
  } else if (v === 'rung') { if (typeof R_DS !== 'undefined') ds = R_DS; if (typeof R_TA !== 'undefined') ta = R_TA; }
  else { if (typeof LD_DS !== 'undefined') ds = LD_DS; if (typeof LD_TA !== 'undefined') ta = LD_TA; }
  if (!ds) ds = Array.from({ length: 8 }, (_, i) => ['_', 'Quái ' + (i + 1), 'Chưa có hình. Đây là ô giữ chỗ.', o.mau, i === 5 ? 'puff' : i === 6 ? 'bom' : i === 7 ? 'xu' : undefined]);
  if (!ta) ta = [['_', 'Tinh anh 1', 'Chưa có hình. Đây là ô giữ chỗ.', o.mau], ['_', 'Tinh anh 2', 'Chưa có hình. Đây là ô giữ chỗ.', o.mau]];
  o.thuong = ds.map(d => { const it = { ten: d[1], mota: d[2], mau: d[3] || o.mau, g: BC_lay(() => BC_Q(v)[d[0]](), 40, 28) };
    if (d[4] === 'puff' || d[4] === 'xu') it.g2 = { g: BC_lay(() => BC_Q(v)[d[0]](true), 46, 32) };
    if (d[4] === 'bom') it.g2 = { bom: true, g: v === 'bien' ? null : BC_lay(() => BC_Q(v).bom(), 14, 14) };
    return it; });
  o.ta = ta.slice(0, 2).map(d => ({ ten: d[1], mota: d[2], mau: d[3] || o.mau, g: BC_lay(() => BC_Q(v)[d[0]](), 60, 42) }));
  const pha = a => { let p = (a || []).slice(3); if (p.length === 1 && Array.isArray(p[0]) && Array.isArray(p[0][0])) p = p[0]; return p.length >= 3 ? p : null; };
  if (v === 'bien') {
    o.trumNho = { ten: 'Cua Đá', vh, mota: 'Trùm nhỏ. Thân và hai càng bằng đá nứt, càng có răng, lưng mọc tinh thể và cắm một mỏ neo gỉ. Mắt và vết nứt phát sáng xanh ngọc. Đập càng xuống đất làm rung cả sàn.', mau: '#9db0cc', g: BC_lay(() => Q2.cuaDa(), 90, 60) };
    o.trum = { ten: 'Ngư Tinh', vh, mota: 'Trùm vùng. Rộng gấp năm lần em bé. Răng nanh lởm chởm, mắt sâu rực sáng, lưng còn cắm cây lao cũ. Sóng nước lúc nào cũng cuộn quanh thân.', mau: '#7cc4ee',
      pha: [['Pha 1: rình mồi', 'Bơi chậm, gai nằm xuôi, nước lặng, mắt cam.'], ['Pha 2: giận dữ', 'Gai dựng đỏ, mắt đỏ rực, râu quất lên, nước dâng cao.'], ['Pha 3: hóa băng', 'Mắt rực sáng, toàn thân phủ băng, sàn đóng băng.']],
      g: [1, 2, 3].map(p => BC_lay(() => Q2.nguTinh(p), 130, 110)) };
  } else if (v === 'rung') {
    const a = info.namChua || [], b = info.mocTinh || [];
    o.trumNho = { ten: a[0] || 'Nấm Chúa', vh: a[1] || vh, mota: a[2] || 'Trùm nhỏ gác giữa rừng.', mau: '#c9a0f0', g: BC_lay(() => QT.namChua(), 90, 60) };
    o.trum = { ten: b[0] || 'Mộc Tinh', vh: b[1] || vh, mota: b[2] || 'Trùm vùng Rừng già.', mau: o.mau, pha: pha(b) || [['Pha 1', ''], ['Pha 2', ''], ['Pha 3', '']], g: [1, 2, 3].map(p => BC_lay(() => QT.mocTinh(p), 130, 120)) };
  } else {
    const a = info.hoLua || [], b = info.hoTinh || [];
    o.trumNho = { ten: a[0] || 'Hổ Lửa', vh: a[1] || vh, mota: a[2] || 'Trùm nhỏ gác giữa lâu đài.', mau: '#ffb070', g: BC_lay(() => QT.hoLua(), 100, 60) };
    o.trum = { ten: b[0] || 'Hồ Tinh', vh: b[1] || vh, mota: b[2] || 'Trùm vùng. Cáo tinh chín đuôi ngự trong lâu đài cổ, bắn lửa ma, biết phân thân rồi hóa cuồng.', mau: o.mau,
      pha: pha(b) || [['Pha 1: kiêu kỳ', 'Ngồi nhìn xuống, đuôi phe phẩy, bắn lửa ma.'], ['Pha 2: phân thân', 'Bóng cáo mờ quanh mình, thật giả lẫn lộn.'], ['Pha 3: hóa cuồng', 'To gấp rưỡi, lửa trùm toàn thân.']],
      g: [1, 2, 3].map(p => BC_lay(() => QH.hoTinh(QH.chon, p), p === 3 ? 200 : 140, p === 3 ? 175 : 120)) };
  }
  o.trum.g1 = { g: o.trum.g[0] };
  return o;
}

// ---------- tờ một vùng ----------
function BC_vung(v) {
  const o = BC_cfg(v), Wd = 1080, M = 16, pw = 516;
  const r = page(Wd, 9000, 'Bản chốt: vùng ' + o.ten + ' (hệ ' + o.he + ')', 'Tám quái thường, hai tinh anh, một trùm nhỏ và một trùm vùng. Hình trên vẽ to để xem chi tiết. Cuối tờ là cỡ thật cạnh em bé.');
  const cv = r[0], c = r[1]; let y = r[2];
  const dau = s => { text(c, s, 22, y + 36, 36, GOLDT, true); y += 56; };
  // tám quái thường, hai cột
  const AW = pw - 36, AHmax = 250; let AH = 170;
  const ks = o.thuong.map(it => { let s1 = BC_fit(it, it.g2 ? AW * .46 : AW, AHmax, 6), s2 = 0;
    if (it.g2) { s2 = BC_fit(it.g2, AW * .42, AHmax, it.g2.bom ? Math.min(6, s1) : 5); }
    AH = Math.max(AH, (BC_ext(it).up) * s1 + 24, it.g2 ? BC_ext(it.g2).up * s2 + 24 : 0); return [s1, s2]; });
  AH = Math.round(AH); const ph = AH + 138;
  o.thuong.forEach((it, i) => { const x = M + (i % 2) * (pw + M), py = y + Math.floor(i / 2) * (ph + M); panel(c, x, py, pw, ph); const fy = py + AH; floor(c, x + 12, fy, pw - 24);
    const s1 = ks[i][0], s2 = ks[i][1], e = BC_ext(it);
    if (!it.g2) BC_ve(c, it, Math.round(x + pw / 2 + (e.l - e.r) * s1 / 2), fy, s1);
    else { const e2 = BC_ext(it.g2), w1 = (e.l + e.r) * s1, w2 = (e2.l + e2.r) * s2, kh = 76, x0 = x + (pw - w1 - kh - w2) / 2;
      BC_ve(c, it, Math.round(x0 + e.l * s1), fy, s1); const ay = fy - Math.min(70, Math.round(e.up * s1 / 2)); arrow(c, x0 + w1 + 16, ay, x0 + w1 + kh - 14, ay, GOLDT, 6); BC_ve(c, it.g2, Math.round(x0 + w1 + kh + e2.l * s2), fy, s2); }
    text(c, it.ten, x + pw / 2, py + AH + 52, 38, it.mau, true, 'center'); para(c, it.mota, x + pw / 2, py + AH + 86, pw - 40, 23, CREAM, 30, 'center'); });
  y += 4 * (ph + M) + 10;
  // tinh anh
  dau('Tinh anh');
  { let ah = 200; const ss = o.ta.map(it => { const s = BC_fit(it, pw - 40, 330, 5); ah = Math.max(ah, BC_ext(it).up * s + 30); return s; }); ah = Math.round(ah); const h = ah + 170;
    o.ta.forEach((it, i) => { const x = M + i * (pw + M), e = BC_ext(it); panel(c, x, y, pw, h); floor(c, x + 12, y + ah, pw - 24); BC_ve(c, it, Math.round(x + pw / 2 + (e.l - e.r) * ss[i] / 2), y + ah, ss[i]);
      text(c, it.ten, x + pw / 2, y + ah + 52, 38, it.mau, true, 'center'); para(c, it.mota, x + pw / 2, y + ah + 86, pw - 30, 23, CREAM, 30, 'center'); });
    y += h + 26; }
  // ô rộng có em bé đứng cạnh: dùng cho trùm nhỏ và trùm vùng
  const oRong = (t, it, sMax, maxH) => { const w = Wd - 2 * M, s = BC_fit(it, w - 300, maxH, sMax), e = BC_ext(it), ah = Math.round(Math.max(e.up * s, 27 * s) + 36);
    c.font = '500 23px ' + FONT; const n = wrap(c, t.mota, w - 70, 23, false).length, h = ah + 118 + n * 30 + 8;
    panel(c, M, y, w, h); const fy = y + ah; floor(c, M + 12, fy, w - 24); put(c, BC_BE, M + 30 + 15 * s, fy, s); text(c, 'Em bé', M + 30 + 15 * s, fy + 36, 22, SOFT, false, 'center');
    const x0 = M + 60 + 34 * s, x1 = M + w - 20; BC_ve(c, it, Math.round((x0 + x1) / 2 + (e.l - e.r) * s / 2), fy, s);
    text(c, t.ten, Wd / 2, fy + 60, 42, t.mau, true, 'center'); text(c, t.vh, Wd / 2, fy + 92, 24, o.mau, false, 'center'); para(c, t.mota, Wd / 2, fy + 126, w - 70, 23, CREAM, 30, 'center');
    y += h + 26; };
  dau('Trùm nhỏ'); oRong(o.trumNho, o.trumNho, 5, 420);
  dau('Trùm vùng'); oRong(o.trum, o.trum.g1, 5, 660);
  // ba pha, cùng tỉ lệ
  dau('Ba pha của trận đánh');
  { const w = 338, st = 355; let s = 3, ah = 150; const ps = o.trum.g.map(g => ({ g })); for (const it of ps) s = Math.min(s, BC_fit(it, w - 16, 420, 3, .25)); for (const it of ps) ah = Math.max(ah, BC_ext(it).up * s + 26); ah = Math.round(ah);
    let nl = 1; o.trum.pha.forEach(d => { nl = Math.max(nl, wrap(c, d[1] || '', w - 30, 21, false).length); }); const h = ah + 60 + nl * 28 + 14;
    ps.forEach((it, i) => { const x = M + i * st, e = BC_ext(it), d = o.trum.pha[i] || ['Pha ' + (i + 1), '']; panel(c, x, y, w, h); floor(c, x + 10, y + ah, w - 20); BC_ve(c, it, Math.round(x + w / 2 + (e.l - e.r) * s / 2), y + ah, s);
      text(c, d[0], x + w / 2, y + ah + 44, 28, i === 0 ? o.mau : i === 1 ? '#ff9d8a' : '#fff0c0', true, 'center'); para(c, d[1] || '', x + w / 2, y + ah + 78, w - 30, 21, CREAM, 28, 'center'); });
    y += h + 26; }
  // cỡ thật
  dau('Cỡ thật đứng cạnh em bé (phóng 3 lần)');
  const w = Wd - 2 * M;
  for (const nhom of [o.thuong.slice(0, 4), o.thuong.slice(4, 8), o.ta.concat([o.trumNho]), [o.trum.g1]]) y += BC_dai(c, M, y, w, nhom, o.nen) + 16;
  return cut(cv, y + 6);
}
TO['vung-bien'] = () => BC_vung('bien');
TO['vung-rung'] = () => BC_vung('rung');
TO['vung-lau-dai'] = () => BC_vung('laudai');

// ---------- tờ sáu trùm ----------
TO['tat-ca-trum'] = function () {
  const Wd = 1760, M = 16, cw = Math.floor((Wd - 4 * M) / 3), S3 = 3; const vs = ['rung', 'bien', 'laudai'].map(BC_cfg);
  const r = page(Wd, 3000, 'Sáu trùm của ba vùng', 'Hàng trên là ba trùm vùng, hàng dưới là ba trùm nhỏ. Tất cả vẽ cùng một tỉ lệ (phóng 3 lần), có em bé đứng cạnh để so cỡ.');
  const cv = r[0], c = r[1]; let y = r[2];
  const hang = (tieuDe, lay) => { text(c, tieuDe, 22, y + 36, 36, GOLDT, true); y += 56;
    const ts = vs.map(lay); let up = 30, nl = 1; ts.forEach(t => { up = Math.max(up, BC_ext(t.it).up); nl = Math.max(nl, wrap(c, t.mota, cw - 40, 23, false).length); });
    const bh = Math.round(up * S3) + 40 + 56, fl = bh - 56, h = bh + 118 + nl * 30 + 14;
    ts.forEach((t, i) => { const x = M + i * (cw + M), o = vs[i], e = BC_ext(t.it); panel(c, x, y, cw, h); BC_nen(c, x + 6, y + 10, cw - 12, bh, fl, o.nen); const fy = y + 10 + fl + 6;
      const x0 = x + 108, x1 = x + cw - 8; let px = (x0 + x1) / 2 + (e.l - e.r) * S3 / 2; px = Math.max(px, x + 6 + e.l * S3); px = Math.min(px, x1 - e.r * S3);
      c.save(); c.beginPath(); c.rect(x + 6, y + 10, cw - 12, bh); c.clip(); BC_bong(c, t.it, px, fy, S3); BC_ve(c, t.it, Math.round(px), fy, S3); c.restore(); put(c, BC_BE, x + 46, fy, S3);
      const ty = y + 10 + bh; text(c, t.ten, x + cw / 2, ty + 52, 40, t.mau, true, 'center'); text(c, t.vh, x + cw / 2, ty + 86, 25, o.mau, true, 'center'); para(c, t.mota, x + cw / 2, ty + 122, cw - 40, 23, CREAM, 30, 'center'); });
    y += h + 22; };
  hang('Ba trùm vùng', o => ({ it: o.trum.g1, ten: o.trum.ten, vh: o.trum.vh, mota: o.trum.mota, mau: o.trum.mau }));
  hang('Ba trùm nhỏ', o => ({ it: o.trumNho, ten: o.trumNho.ten, vh: o.trumNho.vh, mota: o.trumNho.mota, mau: o.trumNho.mau }));
  return cut(cv, y + 4);
};

// ---------- tờ tổng hợp: cả game trên một tờ ----------
TO['ban-chot-tong-hop'] = function () {
  const M = 16, S3 = 3, LB = 210, KHE = 12; const vs = ['bien', 'rung', 'laudai'].map(BC_cfg);
  const hangs = vs.map(o => { const its = o.thuong.concat(o.ta, [o.trumNho], [Object.assign({ ten: o.trum.ten, mau: o.trum.mau }, o.trum.g1)]); let sum = 0, up = 130; for (const it of its) { const e = BC_ext(it); sum += (e.l + e.r) * S3; up = Math.max(up, e.up); } return { o, its, sum, up }; });
  let Wd = 2400, up = 130; for (const h of hangs) { Wd = Math.max(Wd, Math.ceil(2 * M + LB + 100 + h.sum + 12 * KHE + 20)); up = Math.max(up, h.up); }
  const r = page(Wd, 2600, 'Linh Khí: bản chốt toàn bộ quái và trùm', 'Ba vùng, mỗi vùng tám quái thường, hai tinh anh, một trùm nhỏ và một trùm vùng. Tất cả vẽ cùng một tỉ lệ (phóng 3 lần), đứng cùng mặt sàn với em bé.');
  const cv = r[0], c = r[1]; let y = r[2]; const FLH = 92, bh = 64 + Math.round(up * S3) + FLH, fl = bh - FLH, w = Wd - 2 * M;
  for (const h of hangs) { const o = h.o, fy = y + fl + 6; BC_nen(c, M, y, w, bh, fl, o.nen);
    c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(M, y + fl + 22, w, FLH - 22);
    text(c, o.ten, M + 26, y + fl / 2 - 6, 46, o.mau, true); text(c, 'hệ ' + o.he, M + 26, y + fl / 2 + 38, 32, CREAM, false);
    const bx = M + LB + 40; put(c, BC_BE, bx, fy, S3); text(c, 'Em bé', bx + 6, fy + 42, 20, SOFT, false, 'center');
    const xs = BC_xep(h.its, M + LB + 100, M + w - 14, S3); const cuoi = [-1e9, -1e9];
    h.its.forEach((it, i) => { BC_bong(c, it, xs[i], fy, S3); BC_ve(c, it, xs[i], fy, S3);
      c.font = '700 20px ' + FONT; const tw = c.measureText(it.ten).width; const t = (xs[i] - tw / 2 < cuoi[0] + 12 && xs[i] - tw / 2 >= cuoi[1] + 12) ? 1 : (xs[i] - tw / 2 < cuoi[0] + 12 ? (cuoi[0] <= cuoi[1] ? 0 : 1) : 0);
      text(c, it.ten, xs[i], fy + 42 + t * 26, 20, it.mau || CREAM, true, 'center'); cuoi[t] = xs[i] + tw / 2; });
    const nhom = [['Quái thường', 0, 7], ['Tinh anh', 8, 9], ['Trùm nhỏ', 10, 10], ['Trùm vùng', 11, 11]];
    for (const n of nhom) { const ea = BC_ext(h.its[n[1]]), eb = BC_ext(h.its[n[2]]); const xa = xs[n[1]] - ea.l * S3, xb = xs[n[2]] + eb.r * S3;
      c.fillStyle = 'rgba(255,210,122,.45)'; c.fillRect(xa, y + 42, xb - xa, 3); c.fillRect(xa, y + 42, 3, 10); c.fillRect(xb - 3, y + 42, 3, 10); text(c, n[0], (xa + xb) / 2, y + 32, 24, GOLDT, true, 'center'); }
    y += bh + 18; }
  return cut(cv, y + 4);
};
