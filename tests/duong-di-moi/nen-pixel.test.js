// Bật pixel (?pixel=1): nền pixel của dạng đường mới vẽ ĐỦ mọi nhánh (chianhanh, haicong) + cầu chỗ tự cắt (caucheo).
// Chạy: node tests/duong-di-moi/nen-pixel.test.js — chụp từng dạng ở 844×390 và 1920×934 vào shots/
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');

const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const SHAPES = ['chianhanh', 'haicong', 'caucheo', 'duongtat'];
const pixelOn = (page) => page.addInitScript(() => { window.PIXEL_BAT_EP = true; });

(async () => {
  for (const [w, h] of [[844, 390], [1920, 934]]) {
    const { browser, page, errors } = await open(w, h, { unlocked: 17 }, pixelOn);
    if (w === 844) {
      const res = await page.evaluate(async (shapes) => {
        const out = {};
        const grass = (d) => d[1] > d[0] + 8 && d[1] > d[2];   // ô cỏ: xanh lá trội
        for (const sh of shapes) {
          const id = mapVariant('song1', sh); setMap(id);
          let c;
          for (let i = 0; i < 100; i++) {
            mapLayerCache.key = '';
            c = mapLayer(id, null, null, CONFIG.W, CONFIG.H);
            if (!mapLayerCache.key.endsWith('|cho')) break;
            await new Promise((r) => setTimeout(r, 50));
          }
          const x = c.getContext('2d'), px = (p) => x.getImageData(Math.round(p[0]), Math.round(p[1]), 1, 1).data;
          const r = { pixel: !mapLayerCache.key.endsWith('|cho') && pixelOn(), lanes: CONFIG.paths.length, onGrass: [] };
          // điểm trên mọi nhánh (bỏ hai đầu): không được là cỏ
          CONFIG.paths.forEach((pts, li) => { for (let i = 3; i < pts.length - 3; i += 4) if (grass(px(pts[i]))) r.onGrass.push(`nhánh ${li} điểm ${i}`); });
          // cầu: chỗ tự cắt trên đường nước phải ra màu gỗ (đỏ > xanh dương)
          if (MAPS[id].bridge) r.bridge = pathCrossings(CONFIG.paths[0]).map((p) => { const d = px(p); return d[0] > d[2] + 20; });
          out[sh] = r;
        }
        return out;
      }, SHAPES);
      for (const sh of SHAPES) {
        const r = res[sh];
        ok(r.pixel, `${sh}: nền pixel đã dựng`);
        ok(r.onGrass.length === 0, `${sh}: ${r.lanes} nhánh đều vẽ đường, không điểm nào nằm trên cỏ` + (r.onGrass.length ? ' — ' + r.onGrass.slice(0, 5).join(', ') : ''));
        if (r.bridge) ok(r.bridge.length > 0 && r.bridge.every(Boolean), `${sh}: có cầu ở ${r.bridge.length} chỗ đường tự cắt`);
      }
      ok(res.chianhanh.lanes > 1 && res.haicong.lanes > 1, 'chianhanh / haicong có nhiều nhánh');
      ok(res.caucheo.bridge, 'caucheo có cầu');
    }
    // chụp trong trận: đổi bản đồ sang từng dạng đường
    await page.evaluate(() => setMap('song1'));
    await enter(page, 0);
    for (const sh of SHAPES) {
      await page.evaluate((sh) => { setMap(mapVariant('song1', sh)); mapLayerCache.key = ''; }, sh);
      await page.waitForTimeout(900);
      await page.screenshot({ path: path.join(SHOT, `nen-pixel-${sh}-${w}x${h}.png`) });
    }
    ok(errors.length === 0, `không lỗi JS ở ${w}×${h}` + (errors.length ? ': ' + errors.join(' | ') : ''));
    await browser.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
