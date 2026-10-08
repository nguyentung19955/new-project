// Test hào quang bậc tướng (claude/hao-quang-tim-vang). Chạy: node tests/hao-quang/hao-quang.test.js
// 1. Tím (thachsanh) / Vàng (giong): có viền màu bậc bám dáng + hạt sáng bay quanh; Thường (lucsi): không có — cả ?pixel=0 lẫn pixel bật (PIXEL_BAT_EP)
// 2. viền / hạt (điểm đậm) không lên quá đỉnh hình + 1 ô (không che thanh máu / sao)
// 3. 20 tướng Tím / Vàng: thời gian vẽ thêm do hào quang nhỏ
// 4. chụp trận Thường / Tím / Vàng cạnh nhau 844×390 + 1920×934 → tests/hao-quang/shots/ (xem tận mắt)
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const ok = (c, m) => { if (!c) throw new Error('FAIL: ' + m); console.log('  ✓ ' + m); };
let chromium;
try { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); } catch (e) { console.log('SKIP: không có playwright'); process.exit(0); }
const LINE = ['lucsi', 'thachsanh', 'giong', 'xathu', 'caolo', 'auco', 'sodua', 'melua'];

async function open(w, h, px) {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route('**/firebase-config.js*', (rr) => rr.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  await page.addInitScript((px) => { if (px) window.PIXEL_BAT_EP = true; localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 17, storySeen: true, settings: { skipStory: true } })); }, px);
  await page.goto('file://' + path.join(ROOT, 'index.html') + (px === 'tat' ? '?muot=0' : px ? '?muot=1' : '?pixel=0'));
  await page.waitForTimeout(800);
  await page.evaluate(() => ui.playLevel(0, false));
  await page.waitForSelector('#prep:not([hidden])');
  await page.click('[data-act=prep-go]');
  await page.waitForTimeout(400);
  // đặt tướng (tướng Tím / Vàng: đặt tướng Thường rồi đổi loại như sau hợp thể)
  await page.evaluate((T) => {
    game.gold = 99999;
    T.forEach((t, k) => { game.placeHero(2 + k, 'lucsi'); const h = game.heroes[2 + k]; h.type = t; if (HEROES[t].legend) { h.from = 'lucsi'; h.baseTier = 3; } });
  }, LINE);
  await page.waitForTimeout(1600);
  await page.evaluate(() => { game.paused = true; });
  return { browser, page, errors };
}
// vẽ một tướng lên canvas riêng (có / không hào quang) → số điểm ảnh khác nhau, số điểm gần màu bậc, đỉnh vùng khác (y nhỏ nhất)
async function probe(page, type) {
  return page.evaluate((type) => {
    const h = game.heroes.find((x) => x && x.type === type);
    const W = 260, H = 300;
    const draw = (no) => {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d');
      let r = null;
      for (let i = 0; i < 3; i++) { x.clearRect(0, 0, W, H); r = drawHeroSprite(x, h, W / 2, H - 20, { t: 1.3, scale: 0.6, noShadow: true, noRankFx: no }); }
      return { d: x.getImageData(0, 0, W, H).data, r };
    };
    const a = draw(false), b = draw(true);
    const rk = rankFxOf(HEROES[type]);
    const rgb = rk && [1, 3, 5].map((i) => parseInt(rk.c.slice(i, i + 2), 16));
    let diff = 0, col = 0, top = H;
    for (let i = 0; i < a.d.length; i += 4) {
      if (Math.abs(a.d[i] - b.d[i]) + Math.abs(a.d[i + 1] - b.d[i + 1]) + Math.abs(a.d[i + 2] - b.d[i + 2]) + Math.abs(a.d[i + 3] - b.d[i + 3]) > 24) {
        diff++;
        if (rgb && a.d[i + 3] > 60 && Math.abs(a.d[i] - rgb[0]) + Math.abs(a.d[i + 1] - rgb[1]) + Math.abs(a.d[i + 2] - rgb[2]) < 110) {
          col++;
          if (a.d[i + 3] > 200) top = Math.min(top, Math.floor(i / 4 / W));   // viền / hạt đậm (quầng mờ nhạt thì bỏ qua: thanh máu vẽ đè lên)
        }
      }
    }
    return { diff, col, top, spriteTop: b.r ? b.r.top : 0, seen: RANK_SEEN.has(type) };
  }, type);
}

// đo như TRONG TRẬN: cỡ vẽ thật (scale 0.285 × view.scale × dpr) ở các trạng thái đứng / đánh / tung chiêu / trúng đòn
async function probeTran(page, type) {
  return page.evaluate((type) => {
    const hh = game.heroes.find((x) => x && x.type === type), cv = document.getElementById('game'), k = view.scale * (cv.width / cv.clientWidth);
    const rk = rankFxOf(HEROES[type]), rgb = [1, 3, 5].map((i) => parseInt(rk.c.slice(i, i + 2), 16)), out = {};
    const S = { dung: {}, danh: { swing: 0.5 }, chieu: { castT: 0.3 }, trung: { hurt: 0.1 } };
    for (const [nm, s] of Object.entries(S)) {
      const W = Math.ceil(120 * k), H = Math.ceil(150 * k);
      const draw = (no) => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.setTransform(k, 0, 0, k, 0, 0);
        for (let i = 0; i < 2; i++) { x.clearRect(0, 0, 999, 999); drawHeroSprite(x, hh, 60, 135, { scale: 0.285, t: 1.3, dir: 1, smooth: true, noRankFx: no, ...s }); }
        return x.getImageData(0, 0, W, H).data; };
      const a = draw(false), b = draw(true); let col = 0;
      for (let i = 0; i < a.length; i += 4) {
        const df = Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) + Math.abs(a[i + 3] - b[i + 3]);
        if (df > 24 && a[i + 3] > 60 && Math.abs(a[i] - rgb[0]) + Math.abs(a[i + 1] - rgb[1]) + Math.abs(a[i + 2] - rgb[2]) < 110) col++;
      }
      out[nm] = col;
    }
    return out;
  }, type);
}

(async () => {
  const COL = {};   // claude/ve-lai-pixel: số điểm viền màu bậc theo chế độ — làm mượt không được làm mất viền (tester: 295 → 81)
  for (const px of [false, true, 'tat']) {
    const mode = px === 'tat' ? 'pixel, tắt làm mượt' : px ? 'pixel bật (làm mượt)' : '?pixel=0';
    console.log(`— ${mode}`);
    const { browser, page, errors } = await open(844, 390, px);
    if (px) ok(await page.evaluate(() => pixelOn() && PX.seen.has('tuong/giong')), `[${mode}] Gióng vẽ bằng pixel`);
    if (px) ok(await page.evaluate((m) => PX_MUOT === m, px === true), `[${mode}] chế độ làm mượt đúng (${px === true ? 'bật' : 'tắt'})`);
    const n = await probe(page, 'lucsi');
    ok(n.diff === 0, `[${mode}] Thường (lucsi): không viền, không hạt (khác ${n.diff} điểm)`);
    for (const t of ['thachsanh', 'giong']) {
      const r = await probe(page, t);
      COL[mode + t] = r.col;
      ok(r.col > 40, `[${mode}] ${t}: viền + hạt màu bậc (${r.col} điểm đúng màu / ${r.diff} điểm khác)`);
      ok(r.top >= r.spriteTop - 8, `[${mode}] ${t}: hào quang không lên quá đỉnh hình (đỉnh ${r.top} · hình ${r.spriteTop.toFixed(0)}) — không che thanh máu`);
    }
    if (px) for (const t of ['sodua', 'thachsanh', 'melua']) {
      const r = await probeTran(page, t);
      for (const nm in r) COL[mode + t + '|' + nm] = r[nm];
      console.log(`    [${mode}] ${t} trong trận: ${JSON.stringify(r)}`);
    }
    // hạt bay: ở hai thời điểm khác nhau vùng hạt khác nhau (đang chuyển động), Vàng nhiều hạt hơn Tím
    const mov = await page.evaluate(() => {
      const h = game.heroes.find((x) => x && x.type === 'giong');
      const shot = (t) => { const c = document.createElement('canvas'); c.width = c.height = 260; const x = c.getContext('2d'); drawRankOrbit(x, RANK_FX.legendary, 130, 240, 180, 3, t, 0, true); drawRankOrbit(x, RANK_FX.legendary, 130, 240, 180, 3, t, 0, false); return x.getImageData(0, 0, 260, 260).data; };
      const a = shot(0), b = shot(0.7); let d = 0, n = 0;
      for (let i = 3; i < a.length; i += 4) { if (a[i] !== b[i]) d++; if (a[i]) n++; }
      return { d, n, h: !!h, nV: RANK_FX.legendary.n, nT: RANK_FX.epic.n };
    });
    ok(mov.n > 0 && mov.d > 0, `[${mode}] hạt sáng có vẽ và chuyển động (${mov.n} điểm)`);
    ok(mov.nV > mov.nT && mov.nT >= 3 && mov.nV <= 6, `[${mode}] Vàng ${mov.nV} hạt > Tím ${mov.nT} hạt`);
    // hiệu năng: 20 tướng Tím / Vàng, có và không hào quang
    const perf = await page.evaluate(() => {
      const hs = game.heroes.filter((x) => x && HEROES[x.type].legend);
      const c = document.createElement('canvas'); c.width = 1600; c.height = 800; const x = c.getContext('2d');
      const run = (no) => { const t0 = performance.now(); for (let f = 0; f < 60; f++) { x.clearRect(0, 0, 1600, 800); for (let i = 0; i < 20; i++) drawHeroSprite(x, hs[i % hs.length], 60 + (i % 10) * 150, 300 + Math.floor(i / 10) * 300, { t: f / 60, noRankFx: no }); } return (performance.now() - t0) / 60; };
      run(false); run(true);
      return { on: run(false), off: run(true) };
    });
    ok(perf.on - perf.off < 4, `[${mode}] 20 tướng Tím/Vàng: ${perf.on.toFixed(2)} ms/khung (không hào quang ${perf.off.toFixed(2)}) — thêm < 4 ms`);
    ok(!errors.length, `[${mode}] không lỗi trang ${errors.join(' | ')}`);
    await browser.close();
  }
  // ảnh: trận có Thường / Tím / Vàng cạnh nhau
  for (const t of ['thachsanh', 'giong']) {
    const a = COL['pixel bật (làm mượt)' + t], b = COL['pixel, tắt làm mượt' + t];
    ok(a >= b * 0.85 && a <= b * 1.15, `${t}: viền màu bậc khi làm mượt ${a} điểm ≈ khi tắt (${b}) ±15% — viền đậm như nhau`);
  }
  for (const t of ['sodua', 'thachsanh', 'melua']) for (const nm of ['dung', 'danh', 'chieu', 'trung']) {
    const a = COL['pixel bật (làm mượt)' + t + '|' + nm], b = COL['pixel, tắt làm mượt' + t + '|' + nm];
    ok(b > 40 && a >= b * 0.85 && a <= b * 1.15, `${t} trong trận (${nm}): viền bật ${a} ≈ tắt ${b} ±15%`);
  }
  for (const [w, h] of [[844, 390], [1920, 934]]) for (const px of [false, true]) {
    const { browser, page } = await open(w, h, px);
    await page.evaluate(() => { game.paused = false; });
    await page.waitForTimeout(300);
    const clip = await page.evaluate(() => {
      game.paused = true;
      const s = game.heroes.filter(Boolean), xs = s.map((q) => q.x), ys = s.map((q) => q.y), k = view.scale;
      const x0 = Math.max(0, (Math.min(...xs) - 50 + view.ox) * k), y0 = Math.max(0, (Math.min(...ys) - 110 + view.oy) * k);
      return { x: x0, y: y0, width: (Math.max(...xs) + 50 + view.ox) * k - x0, height: (Math.max(...ys) + 25 + view.oy) * k - y0 };
    });
    const f = path.join(SHOT, `hao-quang_${w}x${h}_${px ? 'pixel' : 'cu'}.png`);
    await page.screenshot({ path: f, clip });
    console.log('  📷 ' + path.relative(ROOT, f));
    await browser.close();
  }
  console.log('OK hao-quang');
})().catch((e) => { console.error(e.message || e); process.exit(1); });
