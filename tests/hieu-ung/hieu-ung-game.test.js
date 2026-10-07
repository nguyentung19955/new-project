// Test v153: game dùng ảnh hiệu ứng phần D (docs/PROMPT-HIEU-UNG.txt) khi có, vẽ bằng code khi không có.
// Ảnh giả phục vụ qua route (không chép vào assets/). Chạy: node tests/hieu-ung/hieu-ung-game.test.js
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const { open, enter, ok } = require('../cho-tuong/helpers');
global.ASSET_ALL_TEST = true;   // v189: test giả ảnh chưa có → bỏ qua danh sách js/asset-list.js

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'hieuung-'));
execFileSync('python3', ['-c', `
import sys
from PIL import Image, ImageDraw
d = sys.argv[1]
s = Image.new('RGBA', (6 * 64, 64)); g = ImageDraw.Draw(s)
for i in range(6): g.ellipse((i * 64 + 10, 10, i * 64 + 54, 54), fill=(255, 255, 255, 255))
s.save(d + '/strip.png')
o = Image.new('RGBA', (64, 48)); ImageDraw.Draw(o).ellipse((4, 4, 60, 44), fill=(200, 120, 40, 255)); o.save(d + '/one.png')
`, TMP]);

const STRIPS = ['vortex', 'sweep', 'meteor', 'revive', 'volley', 'rain', 'ring', 'streak', 'mark', 'warn', 'afterimage', 'hook'];
const SINGLES = ['trieu-hoi_ngua-sat', 'trieu-hoi_giong-bay', 'hieu-ung_den-troi', 'hieu-ung_chai', 'hieu-ung_binh-gom', 'hieu-ung_dua-hau'];
const PROJ = ['fireball', 'frostbolt', 'arrow', 'bolt', 'orb', 'feather', 'petal', 'melon', 'rice', 'evil'];

async function run(withArt) {
  const { browser, page, errors } = await open(844, 390);
  await page.route('**/assets/**', (r) => {
    const u = r.request().url();
    let m = u.match(/assets\/vfx\/([\w-]+)\.png/);
    if (m && STRIPS.includes(m[1])) return withArt ? r.fulfill({ path: path.join(TMP, 'strip.png'), contentType: 'image/png' }) : r.fulfill({ status: 404, body: '' });
    m = u.match(/assets\/(?:fx\/dan_(\w+)|([\w-]+))\.png/);
    if (m && (PROJ.includes(m[1]) || SINGLES.includes(m[2]))) return withArt ? r.fulfill({ path: path.join(TMP, 'one.png'), contentType: 'image/png' }) : r.fulfill({ status: 404, body: '' });
    return r.continue();
  });
  await page.reload();
  await page.waitForTimeout(700);
  await enter(page, 0);
  await page.evaluate(() => { game.running = false; });
  // ghi lại ảnh nào được vẽ (theo đường dẫn asset) và dải nào được tô màu
  const drawAll = () => page.evaluate(() => {
    for (const [p, a] of assetMap) { if (a.draw) a.draw.__src = p; a.img.__src = p; }
    const used = new Set(), tinted = new Set();
    const di = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (img, ...r) { if (img && img.__src) used.add(img.__src); return di.call(this, img, ...r); };
    const ts = window.tintSheet;
    window.tintSheet = (img, c) => { const o = ts(img, c); if (o !== img) { tinted.add(img.__src); o.__src = img.__src; } return o; };
    const e = { x: 400, y: 200, dead: false, hp: 10 }, h = { x: 200, y: 200, type: 'tre' };
    const base = { x: 300, y: 220, x2: 500, y2: 200, r: 60, ttl: 0.3, max: 0.6, color: '#E25A3A' };
    game.effects.length = 0;
    for (const type of ['vortex', 'sweep', 'meteor', 'revive', 'volley', 'rain', 'ring', 'streak', 'mark', 'warn', 'afterimage', 'hook', 'horse'])
      game.effects.push(Object.assign({}, base, { type, target: e, hero: h, dir: 1 }));
    for (const kind of ['den', 'chai', 'gom', 'dua']) game.effects.push(Object.assign({}, base, { type: 'lob', kind }));
    game.effects.push({ type: 'skyride', d1: 0, d2: PATH.total, ttl: 0.5, max: 1.1 });
    for (const f of game.effects) f._vfx = true;
    drawEffects(1);
    for (const kind of ['fireball', 'frostbolt', 'arrow', 'bolt', 'orb', 'feather', 'petal', 'melon', 'rice', 'evil'])
      drawProjectile({ kind, x: 300, y: 200, angle: 0.3, st: {} }, 1);
    CanvasRenderingContext2D.prototype.drawImage = di; window.tintSheet = ts;
    game.effects.length = 0;
    return { used: [...used], tinted: [...tinted] };
  });
  await drawAll();                     // lần đầu: bắt đầu tải ảnh
  await page.waitForTimeout(700);
  const r = await drawAll();
  return { browser, page, errors, r };
}

async function main() {
  console.log('Có ảnh:');
  let { browser, page, errors, r } = await run(true);
  const used = new Set(r.used.map((s) => s.replace(/\.png$/, '')));
  const missS = STRIPS.filter((n) => !used.has('vfx/' + n));
  ok(!missS.length, `12 dải phần D được vẽ (assets/vfx/<loại>.png)${missS.length ? ' — thiếu ' + missS : ''}`);
  const miss1 = SINGLES.filter((n) => !used.has(n));
  ok(!miss1.length, `ngựa sắt, Gióng bay, đèn trời, chài, bình gốm, dưa hấu dùng ảnh rời${miss1.length ? ' — thiếu ' + miss1 : ''}`);
  const missP = PROJ.filter((n) => !used.has('fx/dan_' + n));
  ok(!missP.length, `10 loại đạn dùng ảnh assets/fx/dan_<loại>.png${missP.length ? ' — thiếu ' + missP : ''}`);
  ok(['ring', 'streak', 'warn', 'afterimage'].every((n) => r.tinted.includes('vfx/' + n + '.png')) && !r.tinted.includes('vfx/vortex.png'),
    'ring / streak / warn / afterimage được tô theo màu hiệu ứng, dải có màu (vortex…) giữ nguyên: ' + r.tinted.join(' '));
  await page.evaluate(() => { game.running = true; game.gold = 5000; });
  await page.waitForTimeout(1500);
  ok(errors.length === 0, 'không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();

  console.log('Không có ảnh (404):');
  ({ browser, page, errors, r } = await run(false));
  ok(!r.used.some((s) => /^vfx\/|dan_|hieu-ung_(den|chai|binh|dua)|ngua-sat|giong-bay/.test(s)), 'không vẽ ảnh nào của phần D → vẽ bằng code như cũ');
  await page.evaluate(() => { game.running = true; });
  await page.waitForTimeout(1500);
  ok(errors.length === 0, 'không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('ĐẠT');
}
main().catch((e) => { console.error(e); process.exit(1); });
