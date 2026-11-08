// TURRET MERGE — KIỂM BẬC CHỈ HUY (08/11, người dùng: "chỉ huy cũng cần phân cấp trắng xanh tím vàng").
//   Bậc chỉ huy = CHỈ HIỂN THỊ (data.js MAVUONG.<id>.bac, mvBac) — viền o_vien_<bậc> + vương miện, khung the_khung_<bậc>, nhãn TIERS.
//   Kiểm: mọi chỉ huy có bậc hợp lệ (trắng/xanh/tím/vàng), chỉ huy mặc định (hero) là trắng/xanh · luật (giá, hồi chiêu) không đổi
//   · bản lưu cũ (turret_bo không có bậc, id lạ) vẫn nạp đúng · bảng chọn chỉ huy (viền + nhãn + xếp theo bậc) · băng chỉ huy màn bộ bài
//   · thẻ chỉ huy khay trận (cả 3 chỉ huy) · trang chi tiết chỉ huy · dải thông tin #tt · sảnh online (OT.hang) · tiếng Việt
//   · chỉ huy không có trong gacha/cửa hàng (miễn phí) → không có tỉ lệ rơi để kiểm.
//   Ảnh: tests/chi-huy-bac/shots (390×844, 844×390, 667×375).
// Chạy: python3 -m http.server <cổng> ở gốc repo · BASE=http://localhost:<cổng>/thap/ node tools/thap-kt-chi-huy-bac.js
'use strict';
const path = require('path'), fs = require('fs');
let pw; try { pw = require('playwright'); } catch (e) { console.log('SKIP (không có playwright)'); process.exit(0); }
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const SHOTS = process.env.SHOTS || path.join(__dirname, '..', 'tests', 'chi-huy-bac', 'shots');
fs.mkdirSync(SHOTS, { recursive: true });
let loi = 0; const ok = (dk, ten, chi) => { console.log((dk ? '  ✓ ' : '  ✗ ') + ten + (dk || chi == null ? '' : ' — ' + JSON.stringify(chi))); if (!dk) loi++; };
const CO = [[390, 844], [844, 390], [667, 375]];
const LUAT_GOC = { hero: [30, 15], dahlia: [40, 25], eve: [40, 25] }; // giá · hồi chiêu trước khi có bậc — không được đổi
const MOI = { tech: ['trang', 25, 20], tide: ['trang', 30, 24], twin: ['xanh', 35, 22], hawk: ['tim', 45, 28], weaver: ['vang', 50, 30] }; // chỉ huy mới 08/11 (thap-kt-chi-huy-moi.js kiểm luật)

async function mo(br, w, h, url, initLS, vi) {
  const ctx = await br.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(([ls, vi]) => { try { if (ls) for (const k in ls) localStorage.setItem(k, ls[k]); if (vi) localStorage.setItem('tm_lang', 'vi'); } catch (e) { } }, [initLS || null, !!vi]);
  const p = await ctx.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push(e.message));
  try { await p.goto(BASE + url, { waitUntil: 'load', timeout: 90000 }); }
  catch (e) { console.log('SKIP (không mở được ' + BASE + ')'); await br.close(); process.exit(0); }
  await p.waitForFunction(() => typeof G !== 'undefined' && G.roster && G.roster.length > 0 && typeof OT !== 'undefined', null, { timeout: 60000 });
  await p.waitForTimeout(1500);
  return p;
}
const otMV = (sel) => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return null; const v = e.querySelector(':scope > img.ov'); return { b: e.dataset.otb, ov: v ? v.getAttribute('src') : '', mien: !!e.querySelector(':scope > img.ot-mien') }; })()`;

(async () => {
  const br = await pw.chromium.launch();
  // ---------- 1) dữ liệu + bản lưu cũ ----------
  const deck5 = ['tia', 'radar', 'canon', 'soi', 'bang'];
  let p = await mo(br, 390, 844, 'index.html?notut=1', { turret_bo: JSON.stringify({ chon: deck5, mv: 'dahlia', che: 'solo' }) });
  const du = await p.evaluate(() => ({
    ds: Object.keys(MAVUONG).map(id => ({ id, bac: MAVUONG[id].bac, mb: mvBac(id), gia: MAVUONG[id].gia, cd: MAVUONG[id].cd })),
    sx: mvDS(), mv: UI.mv, la: mvBac('khong_co'), tu: mvTuAnh('af_eve'),
    kt: typeof KTC !== 'undefined' ? JSON.stringify(KTC).match(/"(hero|dahlia|eve|af_\w+)"/g) : null,
  }));
  for (const d of du.ds) {
    ok(['trang', 'xanh', 'tim', 'vang'].includes(d.bac) && d.mb === d.bac, d.id + ': bậc hợp lệ (' + d.bac + ')', d);
    const g = LUAT_GOC[d.id]; if (g) ok(d.gia === g[0] && d.cd === g[1], d.id + ': giá/hồi chiêu không đổi (' + d.gia + '/' + d.cd + 's)', d);
  }
  ok(['trang', 'xanh'].includes(du.ds.find(d => d.id === 'hero').bac), 'chỉ huy mặc định (hero) là Trắng/Xanh');
  for (const id in MOI) { const d = du.ds.find(x => x.id === id); ok(d && d.bac === MOI[id][0] && d.gia === MOI[id][1] && d.cd === MOI[id][2], 'chỉ huy mới ' + id + ': bậc ' + MOI[id][0] + ', giá/hồi chiêu đúng thiết kế', d); }
  { const dem = {}; for (const d of du.ds) dem[d.bac] = (dem[d.bac] || 0) + 1; ok(['trang', 'xanh', 'tim', 'vang'].every(b => dem[b] >= 2), 'bậc nào cũng có ≥ 2 chỉ huy (Trắng/Xanh/Tím/Vàng)', dem); }
  ok(du.sx.every((id, i) => i === 0 || TIER_THU(du.ds, du.sx[i - 1]) <= TIER_THU(du.ds, id)), 'mvDS xếp theo bậc', du.sx);
  ok(du.mv === 'dahlia', 'bản lưu cũ turret_bo (không có bậc) nạp đúng chỉ huy', du.mv);
  ok(du.la === 'trang' && du.tu === 'eve', 'id lạ → trắng · ảnh af_eve → eve');
  ok(!du.kt, 'chỉ huy không nằm trong gacha/cửa hàng (miễn phí — không có tỉ lệ rơi)', du.kt);
  await p.context().close();
  p = await mo(br, 390, 844, 'index.html?notut=1', { turret_bo: JSON.stringify({ chon: deck5, mv: 'xyz', che: 'solo' }) });
  ok(await p.evaluate(() => UI.mv) === 'hero', 'bản lưu có chỉ huy lạ → về hero, không lỗi');
  await p.context().close();

  // ---------- 2) màn hình theo cỡ ----------
  for (const [w, h] of CO) {
    const tag = w + 'x' + h;
    for (const mv of ['hero', 'dahlia', 'eve']) {
      // màn bộ bài: băng chỉ huy
      p = await mo(br, w, h, 'index.html?notut=1', { turret_bo: JSON.stringify({ chon: deck5, mv, che: 'solo' }) });
      const bac = await p.evaluate((mv) => mvBac(mv), mv);
      await p.evaluate(() => { HM.di('dk'); }); await p.waitForTimeout(900);
      const band = await p.evaluate(otMV('#dkd-cmd .ot-mini'));
      const nhan = await p.evaluate(() => { const e = document.querySelector('#dkd-cmd .mv-bac'); return e ? e.textContent : null; });
      const tnBac = await p.evaluate((b) => TIERS[b].ten, bac);
      ok(band && band.b === bac && band.ov.includes('o_vien_' + bac) && band.mien, tag + ' ' + mv + ': băng chỉ huy màn bộ bài viền ' + bac + ' + vương miện', band);
      ok(nhan === tnBac, tag + ' ' + mv + ': nhãn bậc ở băng chỉ huy', nhan);
      if (mv === 'eve') await p.screenshot({ path: path.join(SHOTS, tag + '-deck.png') });
      if (mv === 'hero') {
        // bảng chọn chỉ huy
        await p.evaluate(() => HM.moMVs()); await p.waitForTimeout(700);
        const hang = await p.evaluate(() => [...document.querySelectorAll('.hm-mvh')].map(r => { const m = r.querySelector('.ot-mini'), v = m && m.querySelector(':scope > img.ov'); return { id: r.querySelector('[data-id]').dataset.id, b: m && m.dataset.otb, ov: v ? v.getAttribute('src') : '', nh: (r.querySelector('.mv-bac') || {}).textContent }; }));
        const ky = await p.evaluate(() => mvDS().map(id => ({ id, b: mvBac(id), t: TIERS[mvBac(id)].ten })));
        ok(hang.length === ky.length && hang.every((r, i) => r.id === ky[i].id && r.b === ky[i].b && r.ov.includes('o_vien_' + ky[i].b) && r.nh === ky[i].t), tag + ': bảng chọn chỉ huy — viền + nhãn theo bậc, xếp theo bậc', hang);
        await p.screenshot({ path: path.join(SHOTS, tag + '-chon.png') });
        // trang chi tiết chỉ huy
        await p.evaluate(() => { HM.dong(true); UP.moMV('dahlia'); }); await p.waitForTimeout(900);
        const up = await p.evaluate(() => { const el = UP.el; return { m: el.style.getPropertyValue('--m').trim(), b: el.dataset.bac, meta: el.querySelector('.up-meta b').textContent }; });
        ok(up.b === 'tim' && up.m === await p.evaluate(() => TIERS.tim.mau) && up.meta === await p.evaluate(() => String(TIERS.tim.ten).toUpperCase()), tag + ': trang chỉ huy RAGE màu + nhãn Tím', up);
        await p.screenshot({ path: path.join(SHOTS, tag + '-trang.png') });
        // sảnh online / bộ mẫu: hàng ô nhỏ OT.hang
        const hg = await p.evaluate(() => { const d = document.createElement('div'); d.id = 'kt-hang'; d.className = 'ot-hang'; d.innerHTML = OT.hang(['tia'], 'eve'); document.getElementById('wrap').appendChild(d); OT.quet(); const m = d.querySelector('.ot-mv'); const r = { b: m.dataset.otb }; d.remove(); return r; });
        ok(hg.b === 'vang', tag + ': hàng ô nhỏ (sảnh online / bộ mẫu) chỉ huy eve viền vàng', hg);
      }
      ok(!p._errs.length, tag + ' ' + mv + ': không lỗi trang (menu)', p._errs);
      await p.context().close();
      // trận: thẻ chỉ huy khay trận
      p = await mo(br, w, h, '?mode=solo&deck=' + deck5.join(',') + '&af=' + mv + '&notut=1&seed=7&nointro=1', null);
      await p.waitForFunction(() => G.ban && G.ban[0] && document.querySelector('#the-mv.ot'), null, { timeout: 30000 }).catch(() => { });
      await p.waitForTimeout(1500);
      const the = await p.evaluate(otMV('#the-mv'));
      ok(the && the.b === bac && the.ov.includes('o_vien_' + bac) && the.mien, tag + ' ' + mv + ': thẻ chỉ huy khay trận viền ' + bac, the);
      const vis = await p.evaluate(() => { const e = document.querySelector('#the-mv > img.ov'); if (!e) return null; const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), op: getComputedStyle(e).opacity, d: getComputedStyle(e).display }; });
      ok(vis && vis.w > 20 && vis.d !== 'none' && +vis.op > 0.5, tag + ' ' + mv + ': viền bậc hiện thật', vis);
      const gd = await p.evaluate(() => { const B = G.ban[0]; return [B.mv.gia, MAVUONG[B.mv.id].cd]; });
      ok(gd[0] === LUAT_GOC[mv][0] && gd[1] === LUAT_GOC[mv][1], tag + ' ' + mv + ': giá/hồi chiêu trong trận không đổi', gd);
      if (mv === 'hero' || (mv === 'eve' && w === 844)) {
        await p.screenshot({ path: path.join(SHOTS, tag + '-tran-' + mv + '.png') });
      }
      if (mv === 'eve') {
        await p.evaluate(() => UI.moTTMV('eve')); await p.waitForTimeout(500);
        const tt = await p.evaluate(() => ({ t: document.querySelector('#tt .tt-bac').textContent, m: document.querySelector('#tt').style.getPropertyValue('--m').trim() }));
        ok(tt.t === await p.evaluate(() => TIERS.vang.ten) && tt.m === await p.evaluate(() => TIERS.vang.mau), tag + ': dải thông tin chỉ huy #tt — nhãn + màu Vàng', tt);
        if (w === 390) await p.screenshot({ path: path.join(SHOTS, tag + '-tt-eve.png') });
      }
      ok(!p._errs.length, tag + ' ' + mv + ': không lỗi trang (trận)', p._errs);
      await p.context().close();
    }
  }
  // ---------- 2b) chỉ huy mới: thẻ khay trận viền đúng bậc (844×390) ----------
  for (const mv in MOI) {
    p = await mo(br, 844, 390, '?mode=solo&deck=' + deck5.join(',') + '&af=' + mv + '&notut=1&seed=7&nointro=1', null);
    await p.waitForFunction(() => G.ban && G.ban[0] && document.querySelector('#the-mv.ot'), null, { timeout: 30000 }).catch(() => { });
    await p.waitForTimeout(1200);
    const the = await p.evaluate(otMV('#the-mv'));
    ok(the && the.b === MOI[mv][0] && the.ov.includes('o_vien_' + MOI[mv][0]) && the.mien, '844x390 ' + mv + ': thẻ chỉ huy khay trận viền ' + MOI[mv][0], the);
    ok(!p._errs.length, '844x390 ' + mv + ': không lỗi trang (trận)', p._errs);
    await p.context().close();
  }
  // ---------- 3) tiếng Việt: nhãn bậc dịch ----------
  p = await mo(br, 390, 844, 'index.html?notut=1', { turret_bo: JSON.stringify({ chon: deck5, mv: 'eve', che: 'solo' }) }, true);
  await p.evaluate(() => { HM.di('dk'); HM.moMVs(); }); await p.waitForTimeout(900);
  const vi = await p.evaluate(() => [...document.querySelectorAll('.hm-mvh .mv-bac')].map(e => e.textContent));
  ok(vi.length === await p.evaluate(() => Object.keys(MAVUONG).length) && vi.every(s => /[À-ỹđĐ]|THƯỜNG|HIẾM/.test(s)), 'tiếng Việt: nhãn bậc chỉ huy đã dịch', vi);
  await p.screenshot({ path: path.join(SHOTS, '390x844-chon-vi.png') });
  await p.context().close();
  await br.close();
  console.log(loi ? '✗ ' + loi + ' lỗi' : '✓ BẬC CHỈ HUY: đạt');
  process.exit(loi ? 1 : 0);
})();
function TIER_THU(ds, id) { return ['trang', 'xanh', 'tim', 'vang', 'do'].indexOf(ds.find(d => d.id === id).bac); }
