// Test v175: hiệu ứng theo hệ (docs/PROMPT-CAN-GEN.txt phần HIỆU ỨNG) — đạn fx/dan-<hệ>.png, trúng đòn vfx/trung-<hệ>.png,
// vụ nổ vfx/no-<hệ>.png, vòng chiêu vfx/vong-chieu-<hệ>.png, quái / boss chết vfx/chet-quai|chet-boss.png.
// Có ảnh thì vẽ ảnh, không có thì như cũ. Kiểm tra luôn nội dung PROMPT-CAN-GEN.txt.
// Chạy: node tests/hieu-ung/hieu-ung-he.test.js
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const { open, enter, ok, ROOT } = require('../cho-tuong/helpers');
global.ASSET_ALL_TEST = true;   // v189: test giả ảnh chưa có → bỏ qua danh sách js/asset-list.js

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'hieuunghe-'));
execFileSync('python3', ['-c', `
import sys
from PIL import Image, ImageDraw
d = sys.argv[1]
s = Image.new('RGBA', (6 * 64, 64)); g = ImageDraw.Draw(s)
for i in range(6): g.ellipse((i * 64 + 10, 10, i * 64 + 54, 54), fill=(255, 255, 255, 255))
s.save(d + '/strip.png')
o = Image.new('RGBA', (64, 64)); ImageDraw.Draw(o).ellipse((4, 4, 60, 60), fill=(200, 120, 40, 255)); o.save(d + '/one.png')
`, TMP]);
const ELS = ['kim', 'moc', 'thuy', 'hoa', 'tho'];
const RE_STRIP = /assets\/vfx\/((?:trung|no|vong-chieu)-(?:kim|moc|thuy|hoa|tho)|chet-quai|chet-boss)\.png/;
const RE_DAN = /assets\/fx\/(dan-(?:kim|moc|thuy|hoa|tho)|dan_\w+)\.png/;

async function run(withArt) {
  const { browser, page, errors } = await open(844, 390);
  await page.route('**/assets/**', (r) => {
    const u = r.request().url();
    let m = u.match(RE_STRIP);
    if (m) return withArt ? r.fulfill({ path: path.join(TMP, 'strip.png'), contentType: 'image/png' }) : r.fulfill({ status: 404, body: '' });
    m = u.match(RE_DAN);
    // ảnh đạn theo loại (dan_<loại>) luôn 404 để thấy đạn theo hệ được dùng thay
    if (m) return withArt && m[1].startsWith('dan-') ? r.fulfill({ path: path.join(TMP, 'one.png'), contentType: 'image/png' }) : r.fulfill({ status: 404, body: '' });
    return r.continue();
  });
  await page.reload();
  await page.waitForTimeout(700);
  await enter(page, 0);
  await page.evaluate(() => { game.running = false; });
  const drawAll = () => page.evaluate((ELS) => {
    for (const [p, a] of assetMap) { if (a.draw) a.draw.__src = p; a.img.__src = p; }
    const used = new Set();
    const di = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (img, ...r) { if (img && img.__src) used.add(img.__src); return di.call(this, img, ...r); };
    const heroOf = (el) => ({ x: 200, y: 200, type: Object.keys(HEROES).find((t) => HEROES[t].el === el) });
    const boss = Object.keys(ENEMIES).find((k) => ENEMIES[k] && ENEMIES[k].boss), foe = Object.keys(ENEMIES).find((k) => ENEMIES[k] && !ENEMIES[k].boss);
    game.effects.length = 0;
    for (const el of ELS) {
      game.effects.push({ type: 'impact', kind: 'orb', x: 300, y: 200, el, splash: 0, ttl: 0.15, max: 0.3 });
      game.effects.push({ type: 'impact', kind: 'fireball', x: 320, y: 210, el, splash: 40, ttl: 0.15, max: 0.3 });
      game.effects.push({ type: 'cast', x: 200, y: 200, color: '#fff', ult: el === 'hoa', el, ttl: 0.25, max: 0.5 });
    }
    game.effects.push({ type: 'die', x: 300, y: 200, etype: foe, ttl: 0.2, max: 0.4 });
    game.effects.push({ type: 'die', x: 330, y: 200, etype: boss, ttl: 0.2, max: 0.4 });
    for (const f of game.effects) f._vfx = true;
    drawEffects(1);
    for (const el of ELS) drawProjectile({ kind: 'orb', x: 300, y: 200, angle: 0.3, st: {}, hero: heroOf(el) }, 1);
    CanvasRenderingContext2D.prototype.drawImage = di;
    game.effects.length = 0;
    return [...used];
  }, ELS);
  await drawAll();
  await page.waitForTimeout(700);
  const used = new Set((await drawAll()).map((s) => s.replace(/\.png$/, '')));
  return { browser, page, errors, used };
}

async function main() {
  console.log('PROMPT-CAN-GEN.txt:');
  const txt = fs.readFileSync(path.join(ROOT, 'docs/PROMPT-CAN-GEN.txt'), 'utf8');
  ok(/INSTRUCTIONS FOR THE AI/.test(txt) && /CHỈ THỊ CHO AI/.test(txt) && /REPLACES the old/.test(txt) && /#FF00FF/.test(txt), 'có chỉ thị Anh + Việt: vẽ mới thay ảnh cũ, nền #FF00FF');
  const blocks = [...txt.matchAll(/^#(\d+) · .* · lưu tên: (\S+)$/gm)];
  ok(blocks.every((m, i) => +m[1] === i + 1), `${blocks.length} khối đánh số liên tục`);
  const files = blocks.map((m) => m[2]);
  ok(files.filter((f) => /hero12/.test(txt.split(`lưu tên: ${f}`)[1].split('\n')[1])).length === 60, '60 tướng (hero12)');
  ok(files.includes('trieuda.png') && !['tom.png', 'thuytinh.png', 'camap.png', 'chantinh.png', 'hotinh.png'].some((f) => files.includes(f)), 'có boss trieuda, không có quái / boss đã gen');
  const fx = ['dan-he.png', ...ELS.flatMap((e) => [`trung-${e}.png`, `no-${e}.png`, `vong-chieu-${e}.png`]), 'chet-quai.png', 'chet-boss.png'];
  ok(fx.every((f) => files.includes(f)), `đủ ${fx.length} ảnh hiệu ứng`);

  console.log('Có ảnh:');
  let { browser, page, errors, used } = await run(true);
  const need = [...ELS.flatMap((e) => [`vfx/trung-${e}`, `vfx/no-${e}`, `vfx/vong-chieu-${e}`, `fx/dan-${e}`]), 'vfx/chet-quai', 'vfx/chet-boss'];
  const miss = need.filter((n) => !used.has(n));
  ok(!miss.length, `vẽ đủ ${need.length} ảnh theo hệ${miss.length ? ' — thiếu ' + miss : ''}`);
  // trong trận thật: đạn tướng trúng quái mang hệ của tướng
  const el = await page.evaluate(() => {
    const t = Object.keys(HEROES).find((k) => HEROES[k].proj);
    const h = { x: 100, y: 100, type: t, dir: 1 };
    const e = { x: 104, y: 108, dead: true, def: {} };
    game.projectiles.length = 0; game.effects.length = 0;
    game.shoot(h, e, 'orb', 500, {});
    game.updateProjectiles(0.1);
    const f = game.effects.find((x) => x.type === 'impact');
    return f && f.el === HEROES[t].el ? f.el : null;
  });
  ok(!!el, 'đạn trúng tạo hiệu ứng impact mang hệ của tướng: ' + el);
  await page.evaluate(() => { game.running = true; game.gold = 5000; });
  await page.waitForTimeout(1500);
  ok(errors.length === 0, 'không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();

  console.log('Không có ảnh (404):');
  ({ browser, page, errors, used } = await run(false));
  ok(![...used].some((s) => /^vfx\/(trung|no|vong-chieu|chet)-|^fx\/dan-/.test(s)), 'không vẽ ảnh nào → vẽ bằng code như cũ');
  await page.evaluate(() => { game.running = true; });
  await page.waitForTimeout(1500);
  ok(errors.length === 0, 'không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('ĐẠT');
}
main().catch((e) => { console.error(e); process.exit(1); });
