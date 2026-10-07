// Test bộ nhiều khung chuyển động (v151): tấm giả → tools/cat-sheet.py hero12 / enemy6 / boss9 → game phát đúng khung,
// thiếu khung thì dùng bộ cũ, không lỗi trang. Chạy: node tests/khung-chuyen-dong/khung-chuyen-dong.test.js
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const { open, enter, ok, ROOT } = require('../cho-tuong/helpers');
global.ASSET_ALL_TEST = true;   // v189: test giả ảnh chưa có → bỏ qua danh sách js/asset-list.js

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'khung-'));
const PACKS = path.join(TMP, 'packs');
const RENDER = path.join(TMP, 'render.js');
fs.copyFileSync(path.join(ROOT, 'js/render.js'), RENDER);
const py = (args, env = {}) => execFileSync('python3', args, { cwd: ROOT, env: { ...process.env, CAT_SHEET_PACKS: PACKS, CAT_SHEET_RENDER: RENDER, ...env } }).toString();

function cut(code, kind, cols, rows, cell) {
  const sheet = path.join(TMP, `${code}.png`);
  py([path.join(__dirname, 'tam-gia.py'), sheet, cols, rows, cell].map(String));
  return py(['tools/cat-sheet.py', sheet, code, kind]);
}

async function main() {
  // ---------- 1. công cụ cắt
  console.log('Cắt tấm giả:');
  cut('tre', 'hero12', 4, 3, 192);
  const tre = fs.readdirSync(path.join(PACKS, 'tre'));
  const want = ['idle_1', 'idle_2', 'idle_3', 'head', 'attack_1', 'attack_2', 'attack_3', 'attack_4', 'cast_1', 'cast_2', 'cast_3', 'hurt'];
  ok(want.every((n) => tre.includes(n + '.png')), 'hero12 → idle_1..3 · head · attack_1..4 · cast_1..3 · hurt');
  ok(['idle', 'front', 'wind', 'strike', 'cast'].every((n) => tre.includes(n + '.png')), 'hero12 chép khung đại diện sang tên cũ (idle / front / wind / strike / cast)');
  ok(tre.includes('.v2'), 'hero12 tự tạo .v2 (ẩn prompt vẽ lại)');
  cut('kybinh', 'enemy6', 3, 2, 192);
  const kb = fs.readdirSync(path.join(PACKS, 'kybinh'));
  ok(['walk_1', 'walk_2', 'walk_3', 'walk_4', 'attack_1', 'attack_2', 'walk1', 'walk2', 'attack'].every((n) => kb.includes(n + '.png')), 'enemy6 → walk_1..4 · attack_1..2 (+ walk1 / walk2 / attack)');
  cut('anvuong', 'boss9', 3, 3, 256);
  const av = fs.readdirSync(path.join(PACKS, 'anvuong'));
  ok(['walk_4', 'attack_3', 'rage_1', 'rage_2', 'rage'].every((n) => av.includes(n + '.png')), 'boss9 → walk_1..4 · attack_1..3 · rage_1..2 (+ rage)');
  const line = fs.readFileSync(RENDER, 'utf8').match(/^const PACK_FRAMES = (\{.*\});/m);
  const PF = JSON.parse(line[1]);
  ok(JSON.stringify(PF.tre) === JSON.stringify({ idle: 3, attack: 4, cast: 3, hurt: 1 }), 'PACK_FRAMES.tre = ' + JSON.stringify(PF.tre));
  ok(PF.kybinh.walk === 4 && PF.kybinh.attack === 2 && PF.anvuong.attack === 3 && PF.anvuong.rage === 2, 'PACK_FRAMES quái / boss đúng số khung');
  // chân cùng đường đáy: mọi khung toàn thân cùng chiều cao (cắt chung khung dọc)
  const hs = execFileSync('python3', ['-c', `from PIL import Image;import sys;print(*[Image.open(f'${PACKS}/tre/{n}.png').height for n in sys.argv[1:]])`, ...want.filter((n) => n !== 'head')]).toString().trim().split(' ');
  ok(new Set(hs).size === 1, 'mọi khung toàn thân cùng chiều cao (chân cùng đường đáy): ' + hs[0] + ' px');
  ok(!/^const PACK_FRAMES = \{.+\};/m.test(fs.readFileSync(path.join(ROOT, 'js/render.js'), 'utf8').replace('const PACK_FRAMES = {};', '')), 'js/render.js thật không bị đổi khi chạy test');

  // ---------- 2. game phát đúng khung (ảnh giả phục vụ qua route, không chép vào assets/)
  console.log('Game:');
  const { browser, page, errors } = await open(844, 390);
  await page.route('**/assets/packs/**', (r) => {
    const m = r.request().url().match(/assets\/packs\/(tre|kybinh|anvuong)\/([\w-]+\.png)/);
    if (m && fs.existsSync(path.join(PACKS, m[1], m[2]))) return r.fulfill({ path: path.join(PACKS, m[1], m[2]), contentType: 'image/png' });
    if (/assets\/packs\/lucsi\/(idle|attack|cast)_\d|lucsi\/hurt/.test(r.request().url())) return r.fulfill({ status: 404, body: '' });   // giả thiếu khung
    return r.continue();
  });
  await page.reload();
  await page.waitForTimeout(800);
  await page.evaluate((pf) => { Object.assign(PACK_FRAMES, pf, { lucsi: { idle: 3, attack: 4, cast: 3, hurt: 1 } }); }, PF);
  // ghi lại ảnh nào được vẽ: bọc drawBent (hàm toàn cục trong render.js)
  await page.evaluate(() => {
    const orig = window.drawBent;
    window.__drawn = [];
    window.drawBent = function (c, img, ...rest) { window.__drawn.push((img && (img.src || (img.__src))) || ''); return orig.call(this, c, img, ...rest); };
    // ảnh thu nhỏ (canvas) không có src: gắn lại đường dẫn khi tải xong
    for (const [p, a] of assetMap) if (a.draw) a.draw.__src = p;
  });
  const frames = (type, o) => page.evaluate(([type, o]) => {
    for (const [p, a] of assetMap) if (a.draw && !a.draw.__src) a.draw.__src = p;
    const c = document.createElement('canvas').getContext('2d');
    const h = { type, id: 1, tier: 1, _anim: {}, equip: {} };
    window.__drawn = [];
    drawHeroSprite(c, h, 100, 200, Object.assign({ px: 1 }, o));
    return window.__drawn.map((s) => (s.match(/([\w-]+)\.png/) || [])[1]).filter(Boolean);
  }, [type, o]);
  // gọi một lượt cho mọi động tác để bắt đầu tải lười, rồi đợi tải xong
  for (const o of [{ t: 0 }, { swing: 0.5 }, { castT: 0.3 }, { hurt: 0.1 }, { win: true }]) { await frames('tre', o); await frames('lucsi', o); }
  await page.waitForTimeout(800);

  const idleSeq = [];
  for (let i = 0; i < 12; i++) idleSeq.push((await frames('tre', { t: i / 5.5 + 0.01 }))[0]);
  ok(['idle_1', 'idle_2', 'idle_3'].every((n) => idleSeq.includes(n)), 'đứng yên: lần lượt idle_1..3 — ' + idleSeq.join(' '));
  ok(idleSeq.every((n, i) => !i || n !== idleSeq[i - 1]) && !idleSeq.some((n, i) => i > 0 && n === 'idle_1' && idleSeq[i - 1] === 'idle_3'), 'đi qua lại 1-2-3-2 (~5,5 khung/giây, không nhảy 3 → 1)');
  const atk = [];
  for (let sw = 1; sw > 0; sw -= 0.04) { const f = (await frames('tre', { t: 1, swing: sw })).find((n) => /^attack_/.test(n)); if (f && f !== atk[atk.length - 1]) atk.push(f); }
  ok(atk.join(' ') === 'attack_1 attack_2 attack_3 attack_4', 'đánh: chuẩn bị → vung → trúng → thu về: ' + atk.join(' '));
  const cast = new Set();
  for (let i = 0; i < 9; i++) for (const n of await frames('tre', { t: i / 9 + 0.01, castT: 0.3 })) if (/^cast_/.test(n)) cast.add(n);
  ok(cast.size === 3, 'tung chiêu: cast_1..3 — ' + [...cast].join(' '));
  ok((await frames('tre', { t: 1, hurt: 0.15 })).includes('hurt'), 'trúng đòn: khung hurt');
  ok((await frames('tre', { t: 1, win: true })).some((n) => /^cast_/.test(n)), 'thắng trận (chưa có win.png): dùng khung tung chiêu');

  // thiếu khung (404) → bộ cũ
  ok((await frames('lucsi', { t: 1 })).includes('idle'), 'thiếu idle_* → dùng idle.png cũ');
  ok((await frames('lucsi', { t: 1, swing: 0.5 })).some((n) => n === 'strike' || n === 'wind'), 'thiếu attack_* → dùng wind / strike cũ');
  ok((await frames('lucsi', { t: 1, castT: 0.3 })).includes('cast'), 'thiếu cast_* → dùng cast.png cũ');
  const lh = await frames('lucsi', { t: 1, hurt: 0.15 });
  ok(lh.includes('idle') && !lh.includes('hurt'), 'thiếu hurt.png → vẫn vẽ dáng đứng');

  // quái / boss
  const enemy = (type, o) => page.evaluate(([type, o]) => {
    const img = enemyPackImg(Object.assign({ type, id: 0 }, o), o.t);
    const src = img && (img.src || img.__src || [...assetMap].find(([, a]) => a.draw === img || a.img === img)[0]);
    return src && src.match(/([\w-]+)\.png/)[1];
  }, [type, o]);
  for (const o of [{ t: 0 }, { t: 0, atkT: 0.3 }, { t: 0, enraged: true }]) { await enemy('kybinh', o); await enemy('anvuong', o); }
  await page.waitForTimeout(600);
  const walk = new Set();
  for (let i = 0; i < 8; i++) walk.add(await enemy('kybinh', { t: i / 8 + 0.01 }));
  ok(['walk_1', 'walk_2', 'walk_3', 'walk_4'].every((n) => walk.has(n)), 'quái đi: walk_1..4 — ' + [...walk].join(' '));
  ok(await enemy('kybinh', { t: 1, atkT: 0.4 }) === 'attack_1' && await enemy('kybinh', { t: 1, atkT: 0.1 }) === 'attack_2', 'quái đánh: attack_1 → attack_2');
  const rage = new Set();
  for (let i = 0; i < 6; i++) rage.add(await enemy('anvuong', { t: i / 8 + 0.01, enraged: true }));
  ok(rage.has('rage_1') && rage.has('rage_2'), 'boss nổi giận: rage_1..2');
  ok(await enemy('anvuong', { t: 1, atkT: 0.05 }) === 'attack_3', 'boss đánh: tới attack_3');

  // chơi thật vài giây với bộ khung mới: không lỗi trang
  await page.evaluate(() => { PACK_FRAMES.lactuong = { idle: 3, attack: 4, cast: 3, hurt: 1 }; });   // ảnh không có → phải tự dùng bộ cũ
  await enter(page, 0);
  await page.evaluate(() => { game.gold = 5000; for (let i = 0; i < 4; i++) { const s = game.freeSlots()[0]; if (s !== undefined) game.placeHero ? game.placeHero(s, ['tre', 'lucsi', 'lactuong', 'tre'][i]) : 0; } game.startWave && game.startWave(); });
  await page.waitForTimeout(3000);
  ok(await page.evaluate(() => game.heroes.filter(Boolean).length) >= 3, 'trận thật có tướng dùng bộ khung mới / thiếu khung trên sân');
  await page.screenshot({ path: path.join(TMP, 'tran.png') });
  ok(errors.length === 0, 'không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await browser.close();
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('ĐẠT');
}
main().catch((e) => { console.error(e); process.exit(1); });
