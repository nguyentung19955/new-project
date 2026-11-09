// TURRET MERGE — KIỂM "Ụ KHÔNG BẮN" ĐẦY ĐỦ (09/11, người dùng: "Cổng Ấp Nở là tướng không có dame nên sẽ không bắn được nhé" + "check cả các ụ tương tự").
//   Ụ không bắn = SKILLS[id].dmg = 0, trừ Băng / Độc / Bom Hẹn Giờ / Vệ Tinh (vẫn nhắm quái trên đường; Vệ Tinh thức tỉnh thả bom — thiết kế).
//   1) LOGIC (trận thật trong trình duyệt, đủ file game): mỗi ụ ở 1/4/7★ × Solo/PVP/Co-op × {để trơn, buff dồn (Ép Xung, tăng tốc, Mimic,
//      bản sao Copycat, Cuồng nộ ×2, +500% ST chỉ huy, +100% chí mạng), ghép cùng loại, Wild Link, Mimic, Copycat} → KHÔNG được gây sát thương.
//   2) HIỂN THỊ (EN + VI): trang ụ — Sát thương "—", Tốc bắn "—", Mục tiêu "Không bắn", Tầm bắn/Tầm với KHÔNG BAO GIỜ "Whole path"
//      (không vùng → "—"; ụ hỗ trợ → vùng thật: 4 ô kề / 4 ô chéo / Cả bàn…); bảng chạm ngoài trận không ghi "Base damage 0".
// Chạy (gốc repo): python3 -m http.server 8765 &  ·  NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-u-khong-ban.js  (BASE=… đổi máy chủ)
'use strict';
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const LOI = [];
async function moTrang(b, lang) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 } });
  await c.addInitScript((l) => { try { localStorage.setItem('tm_lang', l); } catch (e) { } }, lang);
  const p = await c.newPage();
  p.on('pageerror', e => LOI.push(lang + ' lỗi trang: ' + e.message));
  await p.goto(BASE + '?notut=1', { waitUntil: 'load' });
  await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length > 0 && window.NN && typeof UP !== 'undefined' && typeof batDau === 'function', null, { timeout: 90000 });
  await p.waitForTimeout(1500);
  return p;
}
(async () => {
  const b = await chromium.launch();
  // ---------- 1) LOGIC ----------
  const p = await moTrang(b, 'en');
  const lg = await p.evaluate(() => {
    const ids = Object.keys(SKILLS).filter(k => upKhongBan(k) && G.rosterMap[k]);
    let dmg = {};
    const _t = trung;
    window.trung = function (E, d, o) { const T = (o && o.T !== undefined) ? o.T : G.dangBan; const h = E.hp; const r = _t(E, d, o); if (T && T.id && upKhongBan(T.id)) dmg[T.id] = (dmg[T.id] || 0) + Math.max(0, h - E.hp); return r; };
    const buoc = (t) => { for (let x = 0; x < t; x += 1 / 30) capNhat(1 / 30); };
    const loi = [];
    for (const id of ids) for (const che of ['solo', 'pvp', 'coop']) for (const kieu of ['tron', 'buff', 'ghep', 'tudo', 'mimic', 'saochep']) for (const s of [1, 4, 7]) {
      if (kieu !== 'tron' && kieu !== 'buff' && s !== 4) continue;
      dmg = {};
      try {
        G.debug = {}; batDau(che, [id, 'lien', 'canon', 'tia', 'set'], 'hero'); G.cho = 0;
        for (const B of G.ban) { B.t.fill(null); B.mana = 500; }
        const B = G.ban[0], T = sinhU(taoU(B, id, s, 7)); B.t[7] = T;
        if (kieu === 'buff') { T.epxung = 0.9; T.tocT = 20; T.tocV = 1; T.aurora = 20; T.banSao = true; B.cuong = 20; T.buf.dmg = 5; T.buf.toc = 5; T.buf.crit = 1; }
        const nguon = { ghep: id, tudo: 'tudo', mimic: 'mimic', saochep: 'saochep' }[kieu];
        if (nguon) { const A = sinhU(taoU(B, nguon, s, 6)); B.t[6] = A; try { ghep(B, A, T); } catch (e) { } }
        buoc(kieu === 'tron' ? 25 : 15);
      } catch (e) { loi.push(id + ' ' + che + '/' + kieu + '/' + s + ' lỗi chạy: ' + e.message); }
      for (const k in dmg) if (dmg[k] > 0) loi.push(k + ' gây ' + Math.round(dmg[k]) + ' sát thương (' + che + '/' + kieu + '/' + s + '★)');
    }
    window.trung = _t;
    return { ids, loi };
  });
  lg.loi.forEach(l => LOI.push('logic: ' + l));
  console.log('  logic: ' + lg.ids.length + ' ụ không bắn × 3 chế độ × 6 kiểu — ' + (lg.loi.length ? lg.loi.length + ' lỗi' : 'không gây sát thương'));
  // ---------- 2) HIỂN THỊ ----------
  for (const lang of ['en', 'vi']) {
    const q = lang === 'en' ? p : await moTrang(b, 'vi');
    const r = await q.evaluate(async () => {
      const T = (s) => (window.NN && NN.vi() ? NN.t(s) : s), loi = [];
      const ids = Object.keys(SKILLS).filter(k => upKhongBan(k) && G.rosterMap[k]);
      for (const id of ids) {
        UP.mo(id); await new Promise(r => setTimeout(r, 80));
        const o = {}; for (const x of document.querySelectorAll('#up .up-spec > *')) { const t = x.innerText.trim().split(/\n+/); o[t[0].trim()] = (t[1] || '').trim(); }
        const ct = UP.chiTiet(id, G.rosterMap[id], TIERS[G.rosterMap[id].bac], SKILLS[id]), reach = (ct.match(/<dt>Reach<\/dt><dd>([^<]*)/) || [])[1];
        const all = Object.values(o).join(' | ');
        if (all.includes(T('Whole path')) || reach === 'Whole path') loi.push(id + ': tầm ghi "Whole path" (' + all + ' · Reach ' + reach + ')');
        if (o[T('Target')] !== T('Does not shoot')) loi.push(id + ': Mục tiêu "' + o[T('Target')] + '"');
        if (o[T('Damage')] !== undefined && o[T('Damage')] !== '—') loi.push(id + ': Sát thương "' + o[T('Damage')] + '"');
        if (o[T('Fire rate')] !== undefined && o[T('Fire rate')] !== '—') loi.push(id + ': Tốc bắn "' + o[T('Fire rate')] + '"');
        UI.moTT(id, null); await new Promise(r => setTimeout(r, 60));
        const tt = document.querySelector('#tt .tt-so').innerText;
        if (/Base damage|ST gốc/.test(tt)) loi.push(id + ': bảng chạm ghi "' + tt.split('\n')[0] + '"');
      }
      UP.dong && UP.dong(); document.querySelector('#tt').hidden = true;
      return { n: ids.length, loi };
    });
    r.loi.forEach(l => LOI.push(lang + ' hiển thị: ' + l));
    console.log('  hiển thị ' + lang.toUpperCase() + ': ' + r.n + ' ụ — ' + (r.loi.length ? r.loi.length + ' lỗi' : 'đạt'));
  }
  await b.close();
  for (const l of LOI) console.log('  ✗ ' + l);
  console.log(LOI.length ? '✗ thap-kt-u-khong-ban: ' + LOI.length + ' lỗi' : '✓ thap-kt-u-khong-ban: đạt');
  process.exit(LOI.length ? 1 : 0);
})().catch(e => { console.log('✗ thap-kt-u-khong-ban: ' + e.message); process.exit(1); });
