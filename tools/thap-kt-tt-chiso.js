// TURRET MERGE — KIỂM KHỐI CHỈ SỐ TRONG DẢI XEM Ụ (trận) — người dùng: "Chi tiết ụ trong trận không rõ cả tốc đánh nhỉ"
//   Chạm ụ trong trận → dải #tt có 4 ô DMG · SPD /s · CRIT · CRIT DMG (số THẬT: chiSoTT → dmgU/tocU/critU/nhipU/SKILLS.canon.dmgMoi),
//   buff → số xanh (.len) + số gốc gạch; ụ hỗ trợ / không bắn → "Does not shoot". Chỉ hiển thị, không đổi luật.
//   Kiểm: số khớp hàm game · tăng khi buff (Radar kề, ngăn quả Lucky Slot, Overclock, stack Pháo La Bàn) · Sói thức tỉnh 3× + 100% chí mạng
//   · vừa khung không tràn ở 390×844 / 844×390 / 667×375 · không lấn lên làn đường dưới bàn · tiếng Việt (TỐC / ST CHÍ MẠNG).
// Chạy: python3 -m http.server <cổng> ở gốc repo · BASE=http://localhost:<cổng>/thap/ node tools/thap-kt-tt-chiso.js
//   (SHOTS=thư mục ảnh, mặc định tests/tt-chiso/shots)
'use strict';
const path = require('path'), fs = require('fs');
let pw; try { pw = require('playwright'); } catch (e) { console.log('SKIP (không có playwright)'); process.exit(0); }
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS || path.join(__dirname, '..', 'tests', 'tt-chiso', 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
let loi = 0; const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (dk || chi == null ? '' : ' — ' + chi)); if (!dk) loi++; };

async function moTran(br, w, h, vi) {
  const ctx = await br.newContext({ viewport: { width: w, height: h } });
  if (vi) await ctx.addInitScript(() => { try { localStorage.setItem('tm_lang', 'vi'); } catch (e) { } });
  const p = await ctx.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push(e.message));
  try { await p.goto(BASE + '?mode=solo&deck=tia,radar,cobac,canon,soi&notut=1&seed=4242', { waitUntil: 'load', timeout: 90000 }); }
  catch (e) { console.log('SKIP (không mở được ' + BASE + ')'); await br.close(); process.exit(loi ? 1 : 0); }
  await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban[0] && G.duong && G.duong.length && typeof chiSoTT === 'function', null, { timeout: 60000 });
  await p.waitForTimeout(6000);
  await p.evaluate(() => { const B = G.ban[0]; G.cho = 1e9; G.quai.length = 0; B.t.fill(null); B.cb = [0, 0, 0];
    window._dat = (o, id, s) => { const T = sinhU(taoU(B, id, s, o)); B.t[o] = T; return T; }; });
  return p;
}
// chạm ụ ô o thật (chuột) rồi đọc dải
async function cham(p, o) {
  const xy = await p.evaluate((o) => { const r = document.querySelector('#cv').getBoundingClientRect(), c = G.ban[0].o[o]; return [r.left + c.x / W * r.width, r.top + c.y / H * r.height]; }, o);
  await p.mouse.click(5, 5); await p.waitForTimeout(250);
  for (let lan = 0; lan < 3; lan++) { // ụ vừa đặt còn đang hiện ra / chạm đóng dải cũ: chạm lại tới khi dải mở
    await p.mouse.click(xy[0], xy[1]); await p.waitForTimeout(700);
    if (await p.evaluate((o) => !document.querySelector('#tt').hidden && UI.xemU && UI.xemU.T === G.ban[0].t[o], o)) break;
  }
  return doc(p);
}
const doc = (p) => p.evaluate(() => {
  const tt = document.querySelector('#tt'), r = tt.getBoundingClientRect(), cv = document.querySelector('#cv').getBoundingClientRect();
  const o = {}; for (const c of tt.querySelectorAll('.hb-so .cs')) { const k = c.querySelector('img').src.match(/ic_(\w+)\.png/)[1]; o[k] = { len: c.classList.contains('len'), xau: c.classList.contains('xau'), b: c.querySelector('b').textContent, s: (c.querySelector('s') || {}).textContent || '', nhan: c.querySelector('small').textContent }; }
  const tran = [...tt.querySelectorAll('.cs, .cs small, .cs b, .tt-ten, .hb-so, .tt-than')].filter(e => e.offsetParent && e.scrollWidth > e.clientWidth + 1).map(e => e.className || e.tagName);
  const B = G.ban[0], yLan = Math.max(...G.duong[0].pts.map(q => q[1])), sy = cv.height / H;
  const khay = document.querySelector('#duoi'), kr = khay ? khay.getBoundingClientRect() : null;
  const X = UI.xemU && UI.xemU.T;
  return { hien: !tt.hidden, cs: tt.classList.contains('hb-cs'), o, kb: (tt.querySelector('.cs-kb') || {}).textContent || '', tran, r: [r.left, r.top, r.right, r.bottom],
    lanDuoi: cv.top + yLan * sy, oCuoi: cv.top + (B.o[14].y + B.ch / 2) * sy, khayTren: kr ? kr.top : null, trongKhung: r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1,
    so: X ? (() => { const c = chiSoTT(X); return c.ban ? { dmg: ST.so(c.dmg), toc: c.toc.toFixed(2), crit: Math.round(c.crit * 100) + '%', cdmg: Math.round(c.cMul * 100) + '%', dmgU: ST.so(dmgU(X)), tocU: tocU(X).toFixed(2) } : null; })() : null };
});

(async () => {
  const br = await pw.chromium.launch();
  try {
    console.log('1 · số thật + buff (390×844)');
    let p = await moTran(br, 390, 844);
    await p.evaluate(() => { _dat(6, 'tia', 3); });
    let a = await cham(p, 6);
    ok(a.hien && a.cs, 'chạm ụ bắn → dải có khối chỉ số', JSON.stringify(a).slice(0, 200));
    ok(a.o.toc && /^SPD/.test(a.o.toc.nhan) && a.o.toc.b === a.so.tocU + '/s', 'SPD = tocU (phát/giây)', JSON.stringify([a.o.toc, a.so]));
    ok(a.o.dmg && a.o.dmg.b === a.so.dmgU, 'DMG = dmgU', JSON.stringify([a.o.dmg, a.so]));
    ok(a.o.crit && a.o.crit.b === '10%' && a.o.cdmg && a.o.cdmg.b === '200%', 'CRIT 10% · CRIT DMG 200% (chưa buff)', JSON.stringify([a.o.crit, a.o.cdmg]));
    ok(!a.o.crit.len && !a.o.cdmg.len && a.o.dmg.len === !!a.o.dmg.s && a.o.toc.len === !!a.o.toc.s, 'chưa buff chí mạng → không xanh; xanh ⇔ có số gốc gạch (cấp thẻ tính là buff)', JSON.stringify(a.o));
    const toc0 = parseFloat(a.o.toc.b);
    await p.evaluate(() => { _dat(7, 'radar', 3); }); await p.waitForTimeout(300);
    a = await cham(p, 6);
    ok(parseFloat(a.o.toc.b) > toc0 && a.o.toc.len && parseFloat(a.o.toc.s) <= toc0, 'Radar kề → SPD tăng, xanh, số gốc gạch', JSON.stringify(a.o.toc));
    await p.evaluate(() => { G.ban[0].t[6].epxung = 0.65; }); await p.waitForTimeout(300);
    let b = await cham(p, 6);
    ok(parseFloat(b.o.toc.b) > parseFloat(a.o.toc.b), 'Overclock → SPD tăng tiếp', b.o.toc.b + ' vs ' + a.o.toc.b);
    await p.screenshot({ path: path.join(SHOTS, '390x844-tia-buff.png') });
    a = await cham(p, 7);
    ok(a.hien && /Does not shoot/.test(a.kb) && !Object.keys(a.o).length, 'ụ hỗ trợ (Radar) → "Does not shoot", không ô số', JSON.stringify([a.kb, a.o]));
    await p.screenshot({ path: path.join(SHOTS, '390x844-radar.png') });
    // Lucky Slot: ngăn quả → DMG / SPD / CRIT DMG
    await p.evaluate(() => { const T = _dat(8, 'cobac', 3); T.cbQuay = 0; T.cbS = 3; G.ban[0].cb = [0, 0, 0]; }); await p.waitForTimeout(300);
    a = await cham(p, 8);
    await p.evaluate(() => { G.ban[0].cb = [10, 10, 10]; }); await p.waitForTimeout(400);
    b = await cham(p, 8);
    ok(parseFloat(b.o.dmg.b) > parseFloat(a.o.dmg.b) && b.o.dmg.len, 'Lucky Slot: Cam → DMG tăng, xanh', a.o.dmg.b + ' → ' + b.o.dmg.b);
    ok(b.o.cdmg.b === '370%' && b.o.cdmg.len, 'Lucky Slot: Nho 10 → CRIT DMG 370% (200% + 10 × 17%, số mỗi điểm 08/11 sau tăng)', JSON.stringify(b.o.cdmg));
    ok(parseFloat(b.o.toc.b) > parseFloat(a.o.toc.b), 'Lucky Slot: Dưa → SPD tăng', a.o.toc.b + ' → ' + b.o.toc.b);
    await p.screenshot({ path: path.join(SHOTS, '390x844-cobac.png') });
    // Pháo La Bàn NSWE + stack: DMG = dmgMoi (mỗi tên lửa), SPD = tocU × số hướng
    await p.evaluate(() => { const T = _dat(11, 'canon', 4); T.hb = 15; T.cmC = 0; }); await p.waitForTimeout(300);
    a = await cham(p, 11);
    const ca = await p.evaluate(() => { const T = G.ban[0].t[11], S = SKILLS.canon; return { d: ST.so(S.dmgMoi(T, 4, 1)), t: (tocU(T) * 4).toFixed(2) }; });
    ok(a.o.dmg.b === '4×' + ca.d && a.o.toc.b === ca.t + '/s', 'La Bàn NSWE: DMG 4×dmgMoi, SPD = tocU×4', JSON.stringify([a.o.dmg.b, a.o.toc.b, ca]));
    await p.evaluate(() => { G.ban[0].t[11].cmC = 3; }); await p.waitForTimeout(300);
    b = await cham(p, 11);
    ok(parseFloat(b.o.dmg.b.split('×')[1]) > parseFloat(a.o.dmg.b.split('×')[1]) && b.o.dmg.len, 'stack → DMG tăng, xanh', a.o.dmg.b + ' → ' + b.o.dmg.b);
    await p.screenshot({ path: path.join(SHOTS, '390x844-canon.png') });
    // Sói thức tỉnh
    await p.evaluate(() => { const T = _dat(12, 'soi', 3); T.thuc = true; }); await p.waitForTimeout(300);
    a = await cham(p, 12);
    const so = await p.evaluate(() => { const T = G.ban[0].t[12]; return { d: ST.so(dmgU(T) * 0.5), t: (nhipU(T) * 3 / SKILLS.soi.KY_TT).toFixed(2) }; });
    ok(a.o.dmg.b === '3×' + so.d && a.o.toc.b === so.t + '/s' && a.o.crit.b === '100%', 'Sói thức tỉnh: 3×(50% DMG), nhịp loạt, CRIT 100%', JSON.stringify([a.o, so]));
    await p.screenshot({ path: path.join(SHOTS, '390x844-soi.png') });
    // đóng băng → SPD 0, đỏ
    await p.evaluate(() => { G.ban[0].t[6].st.bang = 30; }); await p.waitForTimeout(300);
    a = await cham(p, 6);
    ok(a.o.toc && a.o.toc.b === '0.00/s' && a.o.toc.xau, 'đóng băng → SPD 0, đỏ', JSON.stringify(a.o.toc));
    await p.evaluate(() => { G.ban[0].t[6].st.bang = 0; });
    ok(!p._errs.length, 'không lỗi trang', p._errs.join(' | '));
    await p.context().close();

    console.log('2 · vừa khung, không lấn làn đường (3 cỡ màn) + tiếng Việt');
    for (const [w, h, vi] of [[390, 844], [844, 390], [667, 375], [390, 844, 1]]) {
      const tag = w + 'x' + h + (vi ? '-vi' : '');
      p = await moTran(br, w, h, vi);
      await p.evaluate(() => { _dat(6, 'tia', 3); _dat(7, 'radar', 3); const c = _dat(8, 'cobac', 3); c.cbQuay = 0; c.cbS = 3; G.ban[0].cb = [6, 4, 5]; const k = _dat(11, 'canon', 4); k.hb = 15; k.cmC = 2; _dat(12, 'soi', 3).thuc = true; });
      await p.waitForTimeout(400);
      for (const o of [6, 7, 8, 11, 12]) {
        const d = await cham(p, o);
        const ten = tag + ' ô ' + o;
        ok(d.hien && d.trongKhung && !d.tran.length, ten + ': dải hiện, trong khung, không chữ tràn', JSON.stringify([d.r, d.tran]));
        ok(d.r[1] >= d.lanDuoi - 1 && d.r[1] > d.oCuoi, ten + ': không lấn lên làn đường / ô bàn', JSON.stringify([d.r[1], d.lanDuoi, d.oCuoi]));
        if (d.khayTren != null) ok(d.r[3] <= d.khayTren + 2, ten + ': không đè khay dưới', JSON.stringify([d.r[3], d.khayTren]));
        if (vi && d.o.toc) ok(/TỐC/.test(d.o.toc.nhan) && /CHÍ MẠNG/.test(d.o.cdmg.nhan), ten + ': nhãn tiếng Việt', JSON.stringify([d.o.toc.nhan, d.o.cdmg.nhan]));
        if (vi && o === 7) ok(/Không bắn/.test(d.kb), ten + ': "Không bắn"', d.kb);
        await p.screenshot({ path: path.join(SHOTS, tag + '-o' + o + '.png') });
      }
      ok(!p._errs.length, tag + ': không lỗi trang', p._errs.join(' | '));
      await p.context().close();
    }
  } finally { await br.close(); }
  console.log(loi ? 'TRƯỢT ' + loi : 'ĐẠT');
  process.exit(loi ? 1 : 0);
})();
