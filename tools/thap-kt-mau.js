// TURRET MERGE — KIỂM MÀU NGUYÊN TỐ (06/11, lỗi iPhone: Wyrm Engine rồng lửa đỏ để lại vệt XANH DA TRỜI trên đường).
// Với MỖI ụ (93) + chỉ huy (MAVUONG) + DRAGON DIVE: dựng cảnh không đầu (iPhone 13, DPR 3) — 1 ụ ở ô giữa, 8 quái đứng yên (máu vô hạn)
// trên đường — chạy mô phỏng 6,2 s (1★ đánh thường; 4★ + kỹ năng chủ động nếu có), chụp canvas ở 3 thời điểm và so với cảnh GỐC
// y hệt nhưng KHÔNG có ụ → các điểm ảnh khác nhau nằm trên DẢI ĐƯỜNG (ngoài ô ụ) = vệt / dấu trên đường / nổ trúng / biểu tượng trạng thái.
// Lấy sắc độ (hue) trội của các điểm ảnh đó (bỏ điểm xám/trắng/tối) và so với BẢNG NGUYÊN TỐ bên dưới (nguyên tố → dải hue).
// Ngoài ra: kiểm riêng vệt cháy Wyrm Engine 1/4/7★ + DRAGON DIVE (phải là màu lửa) và preset EFFECTS Full/Balanced/Minimal + REDUCE FLASH
// (cùng ụ phải ra cùng hue trội).
// Chạy (gốc repo): python3 -m http.server 8765 &  rồi  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-mau.js
//   CHI=ronglua,bang  chỉ kiểm vài ụ · OUT=thư mục ảnh (mặc định docs/demo-hop-tuong/hoiquy/mau/) · thoát mã 1 nếu có ụ sai màu.
'use strict';
const fs = require('fs');
const { chromium, devices } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/hoiquy/mau/';
const CHI = process.env.CHI ? process.env.CHI.split(',') : null;
fs.mkdirSync(OUT, { recursive: true });

// ---------- nguyên tố → dải hue (độ, có thể vòng qua 0) ----------
const HUE = {
  fire: [[340, 360], [0, 64]],                 // lửa / nổ: đỏ → cam → hổ phách (lõi lửa vàng)
  ice: [[160, 235]],                           // băng / sương: lam nhạt – trắng xanh
  water: [[185, 245]],                         // nước sâu: lam đậm
  poison: [[62, 170]],                         // độc: xanh lá
  energy: [[160, 300], [40, 82]],              // điện / năng lượng: lam điện – tím, hoặc vàng / vàng chanh sét
  gold: [[20, 72]],                            // sao / vàng / thánh quang / tiền thưởng hổ phách
  laser: [[295, 360], [0, 35]],                // tia laser đỏ – hồng (ảnh fx_laser_* / fx_overlord_*)
  eclipse: [[340, 360], [0, 55]],              // nhật thực: quầng mặt trời đỏ – cam (ảnh fx_nhatthuc_*)
  blood: [[330, 360], [0, 40]],                // chí mạng / máu: đỏ
  arcane: [[245, 345]],                        // mana / huyền bí: tím – hồng tím
  void: [[240, 330]],                          // hố đen / thời gian: tím
  rainbow: null, neutral: null,                // không ràng buộc (đa sắc / không có nguyên tố) — chỉ ghi lại
};
// ---------- ụ → nguyên tố khai báo (theo tên/kỹ năng; họ kỹ năng phattrien.js) ----------
const NT = {
  // EXPLOSIVE / lửa
  canon: 'fire', xucxac: 'neutral', mortar: 'fire', no5: 'fire', orbital: 'fire', ronglua: 'fire', lualien: 'fire', cuuvi: 'fire', bomhen: 'fire', min: 'fire',
  // FROST
  bang: 'ice', kiembang: 'ice', lanhgia: 'ice', baotuyet: 'ice', lophanung: 'ice', nhatthuc: 'eclipse',
  // POISON
  doc: 'poison', vungdoc: 'poison', aten: 'poison',
  // ENERGY / điện
  set: 'energy', laser: 'laser', bao: 'energy', railgun: 'energy', overlord: 'laser', nayda: 'energy', nangluong: 'energy',
  // nước
  leviathan: 'water',
  // CRIT / máu
  cuongno: 'blood', soi: 'neutral', maychem: 'neutral', tuthan: 'neutral', nemesis: 'neutral', bienmau: 'rainbow', mauhut: 'blood',
  // MANA
  mana: 'arcane', nhanmana: 'arcane', hutmana: 'arcane', santhuong: 'gold',
  // STAR / vàng
  nangsao: 'gold', vughep: 'gold', hasao: 'gold', ngoisao: 'gold', khoisinh: 'neutral', hopca: 'neutral', loren: 'fire',
  // thời gian / hố đen
  blackhole: 'void', khoathoigian: 'neutral', ngaithoigian: 'neutral',
  // còn lại: đạn vật lý / hỗ trợ / joker — không nguyên tố
  cauvong: 'rainbow', pandora: 'rainbow',
};
const ntCua = (id) => NT[id] || 'neutral';
const hop = (h, ds) => ds.some(([a, b]) => h >= a && h <= b);

// ---------- đo trong trang ----------
function DUNG_CANH() {
  // dựng 1 lần: mặt nạ dải đường (toạ độ điểm ảnh canvas)
  const k = REN.s * REN.dpr, cw = REN.cv.width, ch = REN.cv.height, mask = new Uint8Array(cw * ch), r = (DUONG_RONG / 2 + 14) * k;
  for (const p of G.duong.filter(q => q.ban === 0 || q.ban == null).slice(0, 1)) {
    for (let s = 70; s <= p.len - 70; s += 3) { // bỏ 70 px đầu/cuối: cổng quái + lõi (quầng động, không phải hiệu ứng ụ)
      const [x, y] = viTri(p, s), cx = x * k, cy = y * k;
      for (let yy = Math.max(0, Math.floor(cy - r)); yy < Math.min(ch, cy + r); yy++) for (let xx = Math.max(0, Math.floor(cx - r)); xx < Math.min(cw, cx + r); xx++) if ((xx - cx) ** 2 + (yy - cy) ** 2 < r * r) mask[yy * cw + xx] = 1;
    }
  }
  // ô ụ = ô gần đường nhất (mọi ụ đều với tới quái)
  const p0 = G.duong[0]; let OU = 7, dmin = 1e9;
  G.ban[0].o.forEach((c, i) => { for (let s = 80; s < p0.len - 80; s += 6) { const [x, y] = viTri(p0, s), d = Math.hypot(x - c.x, y - c.y); if (d < dmin) { dmin = d; OU = i; } } });
  window.__OU = OU;
  // bỏ vùng ô ụ (đạn / thân ụ / nòng)
  const c = G.ban[0].o[OU], rr = Math.max(G.ban[0].cw, G.ban[0].ch) * 1.05 * k; // cả chớp nòng / hào quang quanh ụ
  for (let yy = 0; yy < ch; yy++) for (let xx = 0; xx < cw; xx++) if ((xx - c.x * k) ** 2 + (yy - c.y * k) ** 2 < rr * rr) mask[yy * cw + xx] = 0;
  window.__MK = mask;
  window.__CANH = function (id, sao, coU, chuDong, noHu) {
    const B = G.ban[0], p0 = G.duong[0]; B.tim = 1e9; B.mana = 1e6; G.dung = true;
    G.quai.length = 0; G.hang.length = 0; G.hu.length = 0; G.dan && (G.dan.length = 0); FX.reset(); if (typeof SIG !== 'undefined') SIG.ds.length = 0; G.cho = 0; G.tWave = 3; G.t = 100;
    for (let i = 0; i < B.t.length; i++) B.t[i] = null;
    const OU = window.__OU; let T = null; if (coU) { T = sinhU(taoU(B, id, sao, OU)); B.t[OU] = T; if (!chuDong) T.nap = 0.95; } // ụ nạp-rồi-bắn (Black Hole, Overlord…) bắn ngay trong cửa sổ đo
    // quái quanh điểm đường gần ô ụ nhất (trong tầm mọi ụ)
    const c7 = B.o[OU]; let s0 = 0, dm = 1e9; for (let s = 80; s < p0.len - 80; s += 4) { const [x, y] = viTri(p0, s), d = Math.hypot(x - c7.x, y - c7.y); if (d < dm) { dm = d; s0 = s; } }
    for (let i = 0; i < 8; i++) { const E = sinhQuai('bo', 0, s0 + (i - 3.5) * 20, 60); E.vao = 1; E.max = E.hp = 1e12; E.d = Object.assign({}, E.d, { v: 0 }); [E.x, E.y, E.goc] = viTri(p0, E.s); }
    const out = [], dt = BUOC; let t = 0, iSnap = 0; const SNAP = [0.8, 1.6, 2.4, 3.6, 4.8, 6.2]; // ụ kích định kỳ (Frost 6 s, Venom 2,5 s) cũng được chụp
    let daCD = false;
    while (iSnap < SNAP.length) {
      if (T && chuDong && !daCD && t >= 0.4) { daCD = true; T.nap = 1; T.napDay = 0; try { SKILLS[id].chuDong(G, B, T); } catch (e) { } }
      for (const E of G.quai) { E.hp = E.max; E.chet = false; }
      chupTruoc(); capNhat(dt); t += dt;
      if (t >= SNAP[iSnap]) {
        FX.rungX = FX.rungY = 0; FX.chop = 0; if (noHu) G.hu = G.hu.filter(noHu);
        const Q = G.quai, C = FX.chu; G.quai = []; FX.chu = []; REN.t = 50 + iSnap; try { REN.ve(0.016, 1); } finally { G.quai = Q; FX.chu = C; } const im = REN.ctx.getImageData(0, 0, REN.cv.width, REN.cv.height).data; out.push(im); iSnap++; // ẩn thân quái + chữ số sát thương khi chụp (quái trúng đòn nháy/giật, số vàng → không lẫn vào phép đo)
      }
    }
    return out;
  };
  window.__HUE = function (goc, coU, luu) {
    const M = window.__MK, H = new Float64Array(36); let n = 0;
    for (let f = 0; f < coU.length; f++) {
      const a = goc[f], b = coU[f];
      for (let i = 0, j = 0; j < M.length; i += 4, j++) {
        if (!M[j]) continue;
        const d = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) + Math.abs(a[i + 3] - b[i + 3]);
        if (d < 70 || b[i + 3] < 60) continue;
        const r = b[i] / 255, g = b[i + 1] / 255, bb = b[i + 2] / 255, mx = Math.max(r, g, bb), mn = Math.min(r, g, bb), v = mx, s = mx ? (mx - mn) / mx : 0;
        if (s < 0.35 || v < 0.35) continue;
        let h = mx === r ? ((g - bb) / (mx - mn)) % 6 : mx === g ? (bb - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4; h = (h * 60 + 360) % 360;
        H[Math.floor(h / 10) % 36] += (b[i + 3] / 255) * s; n++;
      }
    }
    // cửa sổ 30° trội
    let best = -1, bi = 0, tong = 0; for (let i = 0; i < 36; i++) { tong += H[i]; const w = H[(i + 35) % 36] + H[i] + H[(i + 1) % 36]; if (w > best) { best = w; bi = i; } }
    let sx = 0, sy = 0; for (const q of [(bi + 35) % 36, bi, (bi + 1) % 36]) { const g = (q * 10 + 5) * Math.PI / 180; sx += Math.cos(g) * H[q]; sy += Math.sin(g) * H[q]; }
    const hue = Math.round((Math.atan2(sy, sx) * 180 / Math.PI + 360) % 360);
    let anh = null;
    if (luu) { // ảnh khung cuối (chỉ vùng có hiệu ứng) để soi
      const b = coU[coU.length - 1], c = document.createElement('canvas'); c.width = REN.cv.width; c.height = REN.cv.height; const x = c.getContext('2d'); const id = x.createImageData(c.width, c.height); id.data.set(b); x.putImageData(id, 0, 0); anh = c.toDataURL('image/png');
    }
    return { n, hue, tile: tong ? best / tong : 0, anh };
  };
}

(async () => {
  const b = await chromium.launch(), errs = [];
  const p = await b.newPage({ ...devices['iPhone 13'] });
  p.on('pageerror', e => errs.push(e.message));
  const moi = async (cg) => {
    if (cg) await p.addInitScript((c) => { try { localStorage.setItem('tm_camgiac', c); } catch (e) { } }, cg);
    await p.goto(BASE + '?mode=solo&deck=ronglua,canon,tia,set,lien&wave=6&fill=5&mana=99999&notut=1', { waitUntil: 'load' });
    await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && !TAI.cho, null, { timeout: 30000 });
    await p.waitForTimeout(4500);
    await p.evaluate(DUNG_CANH);
  };
  await moi();
  const ids = (await p.evaluate(() => G.roster.map(u => u.id))).filter(id => !CHI || CHI.includes(id));
  // nạp trước ảnh fx_<id>_* để khung chụp không thiếu ảnh
  await p.evaluate((ids) => { for (const id of ids) for (const s of ['_dan', '_trung', '_no', '_hieu', '_dan2', '_dan3', '_trung3', '_dacbiet', '_tia']) if (REN.anh && REN.anh['fx_' + id + s]) REN.img('fx_' + id + s); }, ids);
  await p.waitForTimeout(2500);
  const goc = async () => p.evaluate(() => { window.__G0 = window.__CANH(null, 1, false, false); return 1; });
  const do1 = async (id, sao, cd, luu, noHu) => p.evaluate(([id, sao, cd, luu, noHu]) => {
    const f = noHu ? new Function('o', 'return ' + noHu) : null;
    const g0 = f ? window.__CANH(null, 1, false, false, f) : window.__G0;
    const a = window.__CANH(id, sao, true, cd, f); return window.__HUE(g0, a, luu);
  }, [id, sao, cd, luu, noHu || null]);
  await goc();
  const KQ = [], SAI = [];
  const xet = (ten, nt, r, ghi) => {
    const ds = HUE[nt]; let ok = true, ly = '';
    if (r.n < 150) ly = 'không có hiệu ứng trên đường (bỏ qua)';
    else if (ds && !hop(r.hue, ds)) { ok = false; ly = 'hue ' + r.hue + '° ∉ ' + nt; }
    const dong = { ten, nt, hue: r.hue, n: r.n, tile: +r.tile.toFixed(2), ok, ly, ghi: ghi || '' };
    KQ.push(dong); if (!ok) SAI.push(dong);
    if (r.anh && (!ok || /ronglua/.test(ten))) fs.writeFileSync(OUT + ten.replace(/★/g, 's').replace(/[^\w@-]/g, '_') + '.png', Buffer.from(r.anh.split(',')[1], 'base64'));
    console.log((ok ? '✓ ' : '✗ ') + ten.padEnd(22) + ' ' + nt.padEnd(8) + ' hue ' + String(r.hue).padStart(3) + '°  n=' + r.n + ' ' + ly);
  };
  for (const id of ids) {
    const nt = ntCua(id);
    xet(id + '@1★', nt, await do1(id, 1, false, true));
    const coCD = await p.evaluate((id) => !!SKILLS[id].chuDong, id);
    if (coCD) xet(id + '@4★+active', nt, await do1(id, 4, true, true));
  }
  // ---- Wyrm Engine: VỆT CHÁY trên đường (chỉ lớp vetChay) ở mọi dạng + DRAGON DIVE ----
  if (!CHI || CHI.includes('ronglua')) {
    for (const s of [1, 4, 7]) xet('ronglua-vetChay@' + s + '★', 'fire', await do1('ronglua', s, s >= 3, true, "o.k === 'vetChay'"));
    for (const s of [4, 7]) xet('ronglua-dive@' + s + '★', 'fire', await do1('ronglua', s, true, true, "o.k === 'rongBo' || o.k === 'vetChay'"));
  }
  // ---- chỉ huy (MAVUONG): kích kỹ năng, đo dải đường ----
  const mvs = await p.evaluate(() => Object.entries(MAVUONG).map(([k, v]) => [k, v.mau]));
  const hueCua = (hex) => { const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, bb = parseInt(hex.slice(5, 7), 16) / 255, mx = Math.max(r, g, bb), mn = Math.min(r, g, bb); if (mx === mn) return 0; let h = mx === r ? ((g - bb) / (mx - mn)) % 6 : mx === g ? (bb - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4; return (h * 60 + 360) % 360; };
  for (const [k, mau] of mvs) {
    if (CHI && !CHI.includes(k)) continue;
    const r = await p.evaluate((k) => {
      // khoảnh khắc chỉ huy (vòng sóng + hiệu ứng trên ô) vẽ trên BÀN, không trên đường → đo cả canvas, 3 khung ngay sau khi dùng (0,15/0,3/0,45 s)
      const B = G.ban[0], chay = (dung) => { window.__CANH(null, 1, false, false); const out = []; B.mv = B.mv || {}; B.mv.id = k; B.mv.cd = 0; B.mv.lan = 0; B.mana = 1e6; if (dung) try { dungMV(B); } catch (e) { }
        for (let i = 0; i < 3; i++) { for (let j = 0; j < Math.round(0.15 / BUOC); j++) { for (const E of G.quai) { E.hp = E.max; E.chet = false; } chupTruoc(); capNhat(BUOC); } FX.rungX = FX.rungY = 0; FX.chop = 0; const Q = G.quai, C = FX.chu; G.quai = []; FX.chu = []; REN.t = 80 + i; try { REN.ve(0.016, 1); } finally { G.quai = Q; FX.chu = C; } out.push(REN.ctx.getImageData(0, 0, REN.cv.width, REN.cv.height).data); }
        return out; };
      const g0 = chay(false), a = chay(true), M = window.__MK, k2 = REN.s * REN.dpr, cw = REN.cv.width, ch = REN.cv.height, M2 = new Uint8Array(M.length).fill(1);
      if (k === 'hero') for (const c of B.o) { const rr = Math.max(B.cw, B.ch) * 0.62 * k2; for (let yy = Math.max(0, Math.floor(c.y * k2 - rr)); yy < Math.min(ch, c.y * k2 + rr); yy++) for (let xx = Math.max(0, Math.floor(c.x * k2 - rr)); xx < Math.min(cw, c.x * k2 + rr); xx++) M2[yy * cw + xx] = 0; } // bỏ thân ụ (Hero triệu ụ mới: màu thân ụ ≠ màu chỉ huy)
      window.__MK = M2;
      try { return window.__HUE(g0, a, true); } finally { window.__MK = M; }
    }, k);
    // Hero triệu ụ: vòng triệu hồi mang MÀU BẬC của ụ mới (thiết kế) → chấp nhận cả màu chỉ huy lẫn màu bậc
    const tiers = await p.evaluate(() => Object.values(TIERS).map(t => t.mau));
    const lechH = (hx) => { const h0 = hueCua(hx); return Math.min(Math.abs(r.hue - h0), 360 - Math.abs(r.hue - h0)); };
    const lech = Math.min(lechH(mau), ...(k === 'hero' ? tiers.map(lechH) : []));
    const dong = { ten: 'MV ' + k, nt: mau, hue: r.hue, n: r.n, ok: r.n < 150 || lech <= 45, ly: r.n < 150 ? 'không có hiệu ứng (bỏ qua)' : 'hue ' + r.hue + '° lệch ' + Math.round(lech) + '° so với màu chỉ huy ' + mau };
    if (r.anh && !dong.ok) fs.writeFileSync(OUT + 'MV_' + k + '.png', Buffer.from(r.anh.split(',')[1], 'base64'));
    KQ.push(dong); if (!dong.ok) SAI.push(dong); console.log((dong.ok ? '✓ ' : '✗ ') + dong.ten.padEnd(22) + ' ' + dong.ly);
  }
  // ---- preset EFFECTS / REDUCE FLASH: cùng ụ → cùng hue trội ----
  const MAU_PRESET = ['ronglua', 'bang', 'doc', 'set', 'canon', 'leviathan', 'baotuyet', 'vungdoc'].filter(id => !CHI || CHI.includes(id));
  const goc1 = {}; for (const d of KQ) if (/@1★$/.test(d.ten)) goc1[d.ten.split('@')[0]] = d;
  for (const cg of ['{"fx":"can","flash":false}', '{"fx":"gon","flash":true}']) {
    await moi(cg); await goc();
    for (const id of MAU_PRESET) {
      const r = await do1(id, 1, false, false), g = goc1[id]; if (!g || g.n < 150 || r.n < 150) continue;
      const lech = Math.min(Math.abs(r.hue - g.hue), 360 - Math.abs(r.hue - g.hue)), nt = ntCua(id), ds = HUE[nt];
      const ok = ds ? hop(r.hue, ds) : lech <= 40; // Minimal bớt hạt → tỉ lệ màu xê dịch (Tesla lam/vàng sét), nhưng phải còn trong dải nguyên tố
      const dong = { ten: id + ' preset ' + cg, nt, hue: r.hue, n: r.n, ok, ly: ok ? '' : 'preset đổi màu: ' + g.hue + '° → ' + r.hue + '°' };
      KQ.push(dong); if (!ok) SAI.push(dong); console.log((ok ? '✓ ' : '✗ ') + dong.ten.padEnd(40) + ' hue ' + r.hue + '° (Full ' + g.hue + '°)');
    }
  }
  fs.writeFileSync(OUT + 'ket-qua.json', JSON.stringify({ SAI, KQ, errs }, null, 1));
  console.log('\n' + (SAI.length ? '✗ ' + SAI.length + ' mục SAI MÀU: ' + SAI.map(d => d.ten + ' (' + d.ly + ')').join(' · ') : '✓ màu nguyên tố khớp (' + KQ.length + ' mục)') + (errs.length ? '\nlỗi trang: ' + errs.slice(0, 5).join(' | ') : ''));
  await b.close();
  process.exit(SAI.length || errs.length ? 1 : 0);
})();
