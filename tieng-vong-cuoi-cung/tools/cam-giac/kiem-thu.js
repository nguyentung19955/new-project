// (camgiac) Kiểm thử CẢM GIÁC CHƠI: chạy mượt + hộp trúng khớp hình.
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765) rồi node tools/cam-giac/kiem-thu.js
// 1) Đồng hồ khung hình giả kiểu iPhone/Safari (mốc thời gian làm tròn 1 ms, 60 Hz và 120 Hz), giữ chạy phải ở Vùng 1 P06 và Làng:
//    - mỗi khung 60 Hz chạy đúng 1 bước logic (không còn 0/2 bước xen kẽ);
//    - nền trôi đều (lệch chuẩn bước trôi ≤ 0,6 điểm ảnh, không khung nào đứng yên);
//    - vị trí vẽ nhân vật trên màn KHÔNG lệch so với camera (đứng yên trên màn khi camera đã bám, rung ≤ 1 điểm ảnh).
// 2) Hộp trúng mọi đòn (đặc biệt đập đất) không vượt phần hình nhìn thấy: python3 tools/cam-giac-hop-trung.py --kiem
// 3) Đập đất vẫn trúng quái đứng sát hai bên, không trúng quái ở xa 150 px (trước đây 191 px vẫn trúng).
const {chromium} = require('playwright'); const {execFileSync} = require('child_process'); const path = require('path');
const GOC = 'http://localhost:8765/game/';
let soLoi = 0, soDat = 0; const ok = (ten, dk, ct) => { console.log((dk ? 'ĐẠT ' : 'LỖI ') + ten + (ct !== undefined ? ' – ' + JSON.stringify(ct) : '')); dk ? soDat++ : soLoi++; };

async function doChay(b, noi, hz, lech){
  const pg = await b.newPage({viewport:{width:844, height:390}, deviceScaleFactor:3, hasTouch:true, isMobile:true});
  const loi = []; pg.on('pageerror', e => loi.push(e.message));
  await pg.addInitScript(() => { let now = 0; const q = []; performance.now = () => now; window.requestAnimationFrame = cb => { q.push(cb); return q.length; };
    window.__pump = t => { now = t; for (const c of q.splice(0)) c(t); }; });
  await pg.goto(noi === 'lang' ? GOC + 'lang-chuong/index.html' : GOC + 'vung-1/index.html?moi=1');
  let t = lech; const P = 1000 / hz; const bom = async n => { for (let i = 0; i < n; i++){ t += P; await pg.evaluate(tt => window.__pump(Math.round(tt)), t); } };
  for (let i = 0; i < 300; i++){
    await bom(1);
    if (await pg.evaluate(n => n === 'lang' ? !!(window.LANG && LANG.xong && LANG.S && LANG.S.che === 'choi') : !!(window.TV && TV.xong && TV.G.trang === 'choi'), noi)) break;
    await pg.waitForTimeout(10);
  }
  await pg.evaluate(noi => {
    window.__cur = null; const ve0 = SpriteMN.ve;
    if (noi === 'lang'){ const d0 = CanvasRenderingContext2D.prototype.drawImage;
      CanvasRenderingContext2D.prototype.drawImage = function(im, ...a){ if (im && im.width >= 900 && a.length === 4 && !window.__bgSet){ const m = this.getTransform(); window.__bg = Math.round(m.e + m.a * a[0]); window.__bgSet = 1; } return d0.call(this, im, ...a); }; }
    SpriteMN.ve = function(g, C, k, fx){ if (C && (C.ten === 'troi' || C.ten === 'dung')){ const m = g.getTransform(); window.__cur = {k, bg:noi === 'lang' ? window.__bg : m.e, x:Math.round(m.e + m.a * fx)}; } return ve0.apply(this, arguments); };
  }, noi);
  if (noi === 'lang') await pg.evaluate(() => { if (LANG.S.che !== 'choi') LANG.S.che = 'choi'; window.dispatchEvent(new KeyboardEvent('keydown', {key:'ArrowRight', code:'ArrowRight'})); });
  else { await pg.evaluate(async () => { const V1 = TV.V1, p = await V1.layPhong('P06'); V1.vaoPhong(p, null, {x:4 * 48 + 24, y:32 * 48}); V1.camDat();
      for (const q of TV.E.QUAI){ q.dead = true; q.hp = 0; q.x = -9999; } }); await bom(20); await pg.evaluate(() => { TV.V1.ep.r = 1; }); }
  const rec = [];
  for (let i = 0; i < 3 * hz; i++){
    t += P;
    rec.push(await pg.evaluate(([tt, noi]) => { const b0 = noi === 'lang' ? LANG.S.tg * 60 : TV.E.S.frame; window.__cur = null; window.__bgSet = 0; window.__pump(Math.round(tt));
      const b1 = noi === 'lang' ? LANG.S.tg * 60 : TV.E.S.frame; return {n:Math.round(b1 - b0), c:window.__cur}; }, [t, noi]));
  }
  await pg.close();
  const nua = rec.slice(Math.round(rec.length / 2)).filter(r => r.c), dBg = [], dNv = [];
  for (let i = 1; i < nua.length; i++){ dBg.push(nua[i].c.bg - nua[i - 1].c.bg); dNv.push(nua[i].c.x - nua[i - 1].c.x); }
  const tb = a => a.reduce((x, y) => x + y, 0) / a.length, lc = a => { const m = tb(a); return Math.sqrt(tb(a.map(v => (v - m) ** 2))); };
  const buoc = {}; rec.forEach(r => buoc[r.n] = (buoc[r.n] || 0) + 1);
  return {buoc, bgTB:+tb(dBg).toFixed(2), bgLech:+lc(dBg).toFixed(2), bgDung:dBg.filter(v => v === 0).length, nvRungMax:Math.max(...dNv.map(Math.abs)), loi};
}

(async () => {
  // 2) hộp trúng ≤ hình
  try { execFileSync('python3', [path.join(__dirname, '..', 'cam-giac-hop-trung.py'), '--kiem'], {stdio:'pipe'}); ok('Hộp trúng mọi đòn nằm trong phần hình kiếm + hiệu ứng (đập đất không vượt hình)', true); }
  catch (e){ ok('Hộp trúng mọi đòn nằm trong phần hình nhìn thấy', false, String(e.stdout).slice(-400)); }
  const b = await chromium.launch();
  // 1) chạy mượt
  for (const [noi, hz, lech] of [['vung', 60, 0], ['vung', 60, 0.4], ['vung', 120, 0], ['lang', 60, 0], ['lang', 60, 0.4], ['lang', 120, 0]]){
    const r = await doChay(b, noi, hz, lech), ten = (noi === 'lang' ? 'Làng' : 'Vùng 1 P06') + ' ' + hz + ' Hz (lệch pha ' + lech + ' ms)';
    if (hz === 60) ok(ten + ': mỗi khung đúng 1 bước logic', !r.buoc[0] && !r.buoc[2], r.buoc);
    ok(ten + ': nền trôi đều, không khung nào đứng yên', r.bgLech <= 0.6 && r.bgDung === 0 && Math.abs(r.bgTB) > 3, r);
    ok(ten + ': nhân vật không rung so với camera (≤ 1 điểm ảnh)', typeof r.nvRungMax === 'number' && r.nvRungMax <= 1, r.nvRungMax);
    ok(ten + ': không lỗi JS', !r.loi.length, r.loi);
  }
  // 3) đập đất trúng quái sát bên, không trúng quái xa
  const pg = await b.newPage({viewport:{width:960, height:540}}); const loi = []; pg.on('pageerror', e => loi.push(e.message));
  await pg.goto(GOC + 'vung-1/index.html?tu=1&moi=1'); await pg.waitForFunction(() => window.TV && TV.xong, null, {timeout:20000});
  await pg.evaluate(() => TV.choi(true)); await pg.waitForTimeout(300);
  const dap = async kc => pg.evaluate(async kc => {
    const {E, V1} = TV, pl = E.pl, p = await V1.layPhong('P06'); V1.vaoPhong(p, null, {x:12 * 48 + 24, y:32 * 48}); V1.camDat();
    for (const q of E.QUAI){ q.dead = true; q.x = -9999; }
    const loai = Object.keys(V1.QJ.loai).find(k => !V1.QJ.loai[k].bay) || Object.keys(V1.QJ.loai)[0];
    const fx = pl.x + pl.w / 2, mk = (dx) => { const q = E.taoQuai(V1.QJ.loai[loai], {loai, cot:12, tu:0, den:60}, pl.y + pl.h); q.x = fx + dx - q.w / 2; q.y = pl.y + pl.h - q.h; q.cd = 9999; q.hp = 999; E.QUAI.push(q); return q; };
    const qa = mk(kc), qb = mk(-kc); const h0 = [qa.hp, qb.hp];
    pl.y -= 100; for (let i = 0; i < 3; i++) TV.buoc(1, '');
    TV.buoc(1, 'd,a'); for (let i = 0; i < 120; i++){ TV.buoc(1, 'd'); qa.cd = qb.cd = 9999; qa.st = qb.st = 'dung'; }
    return [h0[0] - qa.hp, h0[1] - qb.hp];
  }, kc).catch(e => 'lỗi ' + e.message);
  const gan = await dap(40), xa = await dap(150);
  ok('Đập đất trúng quái sát hai bên (cách 40 px)', Array.isArray(gan) && gan[0] > 0 && gan[1] > 0, gan);
  ok('Đập đất KHÔNG trúng quái cách 150 px (hình sóng chỉ ~70 px)', Array.isArray(xa) && xa[0] === 0 && xa[1] === 0, xa);
  ok('Không lỗi JS (đập đất)', !loi.length, loi);
  await b.close();
  console.log('\nKẾT QUẢ: ' + soDat + '/' + (soDat + soLoi) + ' đạt'); process.exit(soLoi ? 1 : 0);
})();
