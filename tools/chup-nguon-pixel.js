#!/usr/bin/env node
// claude/pixel-con-lai: chụp HÌNH CŨ (vẽ bằng SVG trong game, tắt pixel) thành ảnh nguồn cho chế độ chuyển ảnh → pixel
//   tools/pixel/nguon/<mã>.png (960×540) — rồi spec "anh": { "tep": "tools/pixel/nguon/<mã>.png" } (tools/pixel/spec/canh.json)
//   node tools/chup-nguon-pixel.js [--chi thang-sontinh,chuong-giong]
// Cần Playwright (/opt/node-tools/node_modules/playwright hoặc playwright cài sẵn). Ảnh nguồn không commit (.gitignore).
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'tools/pixel/nguon');
let chromium; try { ({ chromium } = require('/opt/node-tools/node_modules/playwright')); } catch (e) { ({ chromium } = require('playwright')); }
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const chi = arg('--chi') ? new Set(arg('--chi').split(',')) : null;
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await (await b.newContext({ viewport: { width: 960, height: 540 } })).newPage();
  await p.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  await p.addInitScript(() => { localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 17, storySeen: true, settings: { skipStory: true } })); });
  await p.goto('file://' + path.join(ROOT, 'index.html?pixel=0')); await p.waitForTimeout(1500);
  // danh sách mã cảnh → markup hình cũ (cùng hàm game dùng khi chưa có ảnh)
  const list = await p.evaluate(() => {
    const L = [];
    const svg = (s) => (s || '').replace(/<svg\b/, '<svg width="960" height="540" preserveAspectRatio="xMidYMid slice"');
    for (const ch of CHAPTERS) {
      for (const w of [true, false]) L.push([`${w ? 'thang' : 'thua'}-${ch.id}`, ch.id === 'sontinh' ? sceneArt(w ? 'win' : 'lose') : resultScene(ch.from, w)]);
      L.push([`chuong-${ch.id}`, ch.classic ? sceneArt('campaign') : storyScene({ bg: ch.bg })]);
    }
    L.push(['nen-thang', sceneArt('win')], ['nen-thua', sceneArt('lose')]);
    for (const i of [1, 2, 3]) L.push([`truyen-sontinh-${i}`, sceneArt('story' + i)]);
    for (const bg of ['bien', 'dam', 'dem', 'dong', 'hang', 'nui', 'rung', 'thanh']) L.push([`truyen-nen-${bg}`, storyScene({ bg })]);
    const out = L.map(([k, m]) => [k, /^\s*<img/.test(m || '') ? m.replace(/<img/, '<img style="width:960px;height:540px;object-fit:cover"') : svg(m), 0]);
    // tranh nhỏ (khung vuông 480, nền trong suốt): trống đồng, hũ vua, kho lúa, xoay máy — giao-dien/tranh-*
    for (const [k, a] of [['tranh-trong-dong', 'drum'], ['tranh-hu-vua', 'huvua'], ['tranh-kho-lua', 'kholua'], ['tranh-xoay', 'rotate']]) {
      const m = HAS_ART && ART.scene[a]; if (m) out.push([k, m.replace(/<svg\b/, '<svg width="480" height="480" preserveAspectRatio="xMidYMid meet"'), 1]);
    }
    return out;
  });
  let n = 0;
  for (const [k, m, vuong] of list) {
    if (chi && !chi.has(k)) continue;
    if (!m) { console.log('  — bỏ (không có hình cũ):', k); continue; }
    await p.evaluate(([html, vg]) => {
      let d = document.getElementById('__nguon'); if (!d) { d = document.createElement('div'); d.id = '__nguon'; document.body.appendChild(d); }
      d.style.cssText = `position:fixed;left:0;top:0;width:${vg ? 480 : 960}px;height:${vg ? 480 : 540}px;z-index:2147483647;background:${vg ? 'transparent' : '#000'};overflow:hidden`;
      d.innerHTML = html;
      if (vg) { for (const el of document.body.children) if (el !== d) el.style.visibility = 'hidden'; document.documentElement.style.background = document.body.style.background = 'transparent'; }
    }, [m, vuong]);
    await p.waitForTimeout(250);
    await p.locator('#__nguon').screenshot({ path: path.join(OUT, k + '.png'), omitBackground: !!vuong });
    if (vuong) await p.evaluate(() => { for (const el of document.body.children) el.style.visibility = ''; document.documentElement.style.background = document.body.style.background = ''; });
    n++;
  }
  await b.close();
  console.log(`chup-nguon-pixel: ${n} ảnh → ${path.relative(process.cwd(), OUT)}/`);
})();
