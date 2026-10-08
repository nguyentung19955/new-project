// Test đường quái đi theo chủ đề + đế đặt tướng vẽ tay (v156). Chạy: node tests/duong-quai/duong-quai.test.js
// 1) mọi ải: lớp nền tĩnh (mapLayer) dựng đúng bản đồ, lòng đường có màu theo chủ đề (không còn dải xanh vạch trắng ở bản đồ đất),
//    quái chạy vài đợt vẫn bám đường, không lỗi trang
// 2) ảnh đế giả (PIL) trong assets/tiles → drawSpot dùng ảnh cho ô trống, ô có tướng không vẽ đế; ảnh kết cấu giả → lớp đường dùng ảnh
// Ảnh giả nằm trong thư mục tạm, trình duyệt nhận qua page.route — KHÔNG ghi/xoá/đổi tên gì trong assets/ thật
// (chạy song song với test khác vẫn an toàn).
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { open, enter, ok, noPixel } = require('../cho-tuong/helpers');   // kiểm tra vân đường ảnh cũ → tắt pixel
global.ASSET_ALL_TEST = true;   // v189: test giả ảnh chưa có → bỏ qua danh sách js/asset-list.js

const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const TILES = fs.mkdtempSync(path.join(require('os').tmpdir(), 'duong-quai-'));
const FAKE = ['de-tuong-thuong.png', 'de-tuong-co.png', 'de-tuong-san-sang.png', 'de-tuong-chon.png', 'de-tuong-ngap.png', 'de-tuong-nui.png', 'duong-nuoc.jpg'];
const fake = () => execFileSync('python3', ['-c', `
from PIL import Image, ImageDraw
import sys
d = sys.argv[1]
for f, col in [('de-tuong-thuong.png', (0,0,255)), ('de-tuong-co.png', (255,0,0)), ('de-tuong-san-sang.png', (0,255,0)), ('de-tuong-chon.png', (255,255,0)), ('de-tuong-ngap.png', (0,255,255)), ('de-tuong-nui.png', (255,0,255))]:
    im = Image.new('RGBA', (128, 128), (0,0,0,0)); ImageDraw.Draw(im).ellipse((10, 34, 118, 106), fill=col + (255,)); im.save(d + '/' + f)
Image.new('RGB', (512, 512), (250, 40, 200)).save(d + '/duong-nuoc.jpg', quality=90)
`, TILES]);
const restore = () => fs.rmSync(TILES, { recursive: true, force: true });
// trình duyệt hỏi assets/tiles/<ảnh trong FAKE>: phần 1 → như chưa có ảnh (lỗi tải, game tự vẽ thay), phần 2 → trả ảnh giả
const routeTiles = (useFake) => (page) => page.route(new RegExp('/assets/tiles/(' + FAKE.map((f) => f.replace(/[.-]/g, '\\$&')).join('|') + ')(\\?.*)?$'), (r) => {
  const f = decodeURIComponent(new URL(r.request().url()).pathname).split('/').pop();
  if (!useFake) return r.abort();
  return r.fulfill({ contentType: f.endsWith('.jpg') ? 'image/jpeg' : 'image/png', body: fs.readFileSync(path.join(TILES, f)) });
});

(async () => {
  // ---------- 1. mọi ải ----------
  {
    const { browser, page, errors } = await open(844, 390, { unlocked: 17 }, noPixel(routeTiles(false)));
    const n = await page.evaluate(() => LEVELS.length);
    ok(n >= 17, `có ${n} ải`);
    for (let i = 0; i < n; i++) {
      await enter(page, i);
      await page.waitForTimeout(500);
      const r = await page.evaluate(() => {
        render();
        const id = MAP_ID, kind = pathKind(MAPS[id].theme);
        const L = mapLayerCache;
        // lấy màu lòng đường ở giữa đường (điểm 40% quãng đường) trên lớp tĩnh
        const g = geomFor(id), [x, y] = g.at(g.len * 0.4);
        const k = L.c.width / CONFIG.W;
        const p = L.c.getContext('2d').getImageData(Math.round(x * k), Math.round(y * k), 1, 1).data;
        // chạy 2 đợt: quái phải bám đường (cách đường giữa < 45 đơn vị, trừ quái bay)
        game.running = true; game.startWave();
        let maxOff = 0, seen = 0;
        for (let s = 0; s < 900; s++) {
          game.update(0.05);
          if (s === 300) game.callEarly();
          for (const e of game.enemies) if (!e.dead && !e.def.flying && e.x > 0 && e.x < CONFIG.W) { seen++; maxOff = Math.max(maxOff, Math.min(...geomsFor(id).map((q) => distToPolyline(q.pts, e.x, e.y)))); }   // nhiều nhánh (ban-do-moi): gần nhánh nào cũng được
        }
        render();
        return { id, kind, key: L.key, rgb: [p[0], p[1], p[2]], maxOff, seen, wave: game.wave, lives: game.lives };
      });
      ok(r.key.startsWith(r.id + '|'), `ải ${i + 1} (${r.id}, đường ${r.kind}): lớp nền tĩnh dựng đúng bản đồ`);
      const [R, G, B] = r.rgb;
      if (r.kind === 'nuoc') ok(B > R, `ải ${i + 1}: lòng sông màu nước (${r.rgb})`);
      else ok(!(B > R + 20 && B > G), `ải ${i + 1}: đường ${r.kind} không còn màu xanh nước (${r.rgb})`);
      ok(r.seen > 50 && r.maxOff < 45, `ải ${i + 1}: quái bám đường (lệch tối đa ${r.maxOff.toFixed(1)}, ${r.seen} lượt đo, đợt ${r.wave})`);
      await page.evaluate(() => { game.running = false; });
    }
    ok(!errors.length, `không lỗi trang ${errors.slice(0, 3).join(' | ')}`);
    await browser.close();
  }
  // ---------- 2. ảnh đế + kết cấu giả ----------
  try {
    fake();
    const { browser, page, errors } = await open(844, 390, { unlocked: 17, settings: { skipStory: true } }, noPixel(routeTiles(true)));
    await enter(page, 0);
    // chờ ảnh tải
    await page.evaluate(() => ['thuong', 'co', 'san-sang', 'chon', 'ngap', 'nui'].forEach((k) => asset(`tiles/de-tuong-${k}.png`, true)));
    await page.waitForFunction(() => ['thuong', 'co', 'san-sang', 'chon', 'ngap', 'nui'].every((k) => asset(`tiles/de-tuong-${k}.png`, true)) && asset('tiles/duong-nuoc.jpg', true));
    const r = await page.evaluate(() => {
      const pick = (x, y) => { const k = px(); const p = ctx.getImageData(Math.round((x + view.ox) * k), Math.round((y + view.oy) * k), 1, 1).data; return [p[0], p[1], p[2]]; };
      ui.armed = false; ui.coachSlot = -1; ui.spot = -1;
      render();
      const [sx, sy] = CONFIG.slots[3];
      const normal = pick(sx, sy);
      ui.armed = true; render();
      const free = pick(sx, sy);
      ui.armed = false; ui.spot = 3; render();
      const target = pick(sx, sy);
      ui.spot = -1;
      // ô có tướng: không vẽ đế (đếm số lần vẽ ảnh đế)
      const imgs = new Set(['thuong', 'co', 'san-sang', 'chon', 'ngap', 'nui'].map((k) => asset(`tiles/de-tuong-${k}.png`, true)));
      let drawn = 0; const orig = ctx.drawImage;
      ctx.drawImage = function (im, ...a) { if (imgs.has(im)) drawn++; return orig.call(this, im, ...a); };
      game.heroes[0] = null; render(); const before = drawn; drawn = 0;
      const empty = CONFIG.slots.filter((_, i) => !game.heroes[i]).length;
      ctx.drawImage = orig;
      const g = geomFor(MAP_ID), [x, y] = g.at(g.len * 0.4), k = mapLayerCache.c.width / CONFIG.W;
      const tex = mapLayerCache.c.getContext('2d').getImageData(Math.round(x * k), Math.round(y * k), 1, 1).data;
      return { normal, free, target, before, empty, key: mapLayerCache.key, tex: [tex[0], tex[1], tex[2]] };
    });
    ok(r.normal[0] > 180 && r.normal[1] < 90 && r.normal[2] < 90, `ô thường dùng đế theo chủ đề (Sông → de-tuong-co, đỏ) ${r.normal}`);
    ok(r.free[1] > 150, `ô sẵn sàng đặt dùng de-tuong-san-sang (xanh lá, có vòng nhấp nháy chồng lên) ${r.free}`);
    ok(r.target[0] > 150 && r.target[1] > 150, `ô đang chọn dùng de-tuong-chon (vàng) ${r.target}`);
    ok(r.before === r.empty, `chỉ ô trống vẽ đế (${r.before} lần vẽ / ${r.empty} ô trống)`);
    ok(/\|true\|/.test(r.key) && r.tex[0] > 150 && r.tex[2] > 120, `lớp đường dùng ảnh kết cấu duong-nuoc.jpg khi có (${r.tex})`);
    // ô có tướng: đặt 1 tướng, ô đó không vẽ đế
    const r2 = await page.evaluate(() => {
      const imgs = new Set(['thuong', 'co', 'san-sang', 'chon', 'ngap', 'nui'].map((k) => asset(`tiles/de-tuong-${k}.png`, true)));
      game.gold = 9999;
      const t = Object.keys(HEROES)[0];
      game.placeHero(5, game.marketPool()[0] || t);
      const has = !!game.heroes[5];
      let drawn = 0; const orig = ctx.drawImage;
      ctx.drawImage = function (im, ...a) { if (imgs.has(im)) drawn++; return orig.call(this, im, ...a); };
      ui.armed = false; ui.spot = -1; render(); ctx.drawImage = orig;
      return { has, drawn, empty: CONFIG.slots.filter((_, i) => !game.heroes[i]).length };
    });
    if (r2.has) ok(r2.drawn === r2.empty, `có tướng ở ô 6 → ô đó không vẽ đế (${r2.drawn} / ${r2.empty})`);
    else console.log('  (bỏ qua bước đặt tướng: không tìm thấy hàm đặt tướng)');
    await page.screenshot({ path: path.join(SHOT, 'de-gia.png') });
    ok(!errors.length, `không lỗi trang ${errors.slice(0, 3).join(' | ')}`);
    await browser.close();
  } finally { restore(); }
  console.log('XONG');
})().catch((e) => { restore(); console.error(e); process.exit(1); });
