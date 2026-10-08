// Nền vẽ tay của bản đồ ĐƯỜNG GỐC (không có m.shape) không bị tô màu đất đè (lỗi hồi quy @7d1446b).
// Chạy: node tests/duong-di-moi/nen-goc.test.js — chụp Sông Đà + Biển Đông ở 844×390 và 1920×934 vào shots/
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');

const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });

(async () => {
  for (const [w, h] of [[844, 390], [1920, 934]]) {
    const { browser, page, errors } = await open(w, h, { unlocked: 17 });
    // mọi bản đồ gốc có ảnh nền: lớp tĩnh mapLayer phải còn ảnh (nhiều màu), không đồng một màu đất
    if (w === 844) {
      const res = await page.evaluate(async () => {
        const out = {};
        for (const id of [...new Set(LEVELS.map((l) => l.map))]) {
          if (MAPS[id].shape) continue;
          setMap(id);
          const bg = mapBg(); if (!bg) continue;
          for (let i = 0; i < 100 && !(bg.img && bg.img.complete && bg.img.naturalWidth); i++) await new Promise((r) => setTimeout(r, 50));
          const img = mapBg().img; if (!img) { out[id] = 'chưa nạp ảnh'; continue; }
          mapLayerCache.key = '';
          const c = mapLayer(id, img, null, 422, 195), x = c.getContext('2d');
          // góc trên trái (không có đường): đếm số màu khác nhau
          const d = x.getImageData(0, 0, 80, 40).data, set = new Set();
          for (let i = 0; i < d.length; i += 4) set.add((d[i] >> 3) + ',' + (d[i + 1] >> 3) + ',' + (d[i + 2] >> 3));
          out[id] = set.size;
        }
        return out;
      });
      console.log('  số màu góc nền:', JSON.stringify(res));
      for (const [id, n] of Object.entries(res)) ok(typeof n === 'number' && n > 5, `${id}: nền còn ảnh vẽ tay (${n} màu)`);
      ok(Object.keys(res).length >= 2, 'kiểm tra ≥ 2 bản đồ gốc có ảnh nền');
    }
    // chụp Sông Đà (ải 0) và Biển Đông (ải 13)
    for (const [lv, name] of [[0, 'song-da'], [13, 'bien-dong']]) {
      await enter(page, lv);
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(SHOT, `nen-goc-${name}-${w}x${h}.png`) });
      await page.evaluate(() => { game.state = 'menu'; });
    }
    ok(errors.length === 0, `không lỗi JS ở ${w}×${h}` + (errors.length ? ': ' + errors.join(' | ') : ''));
    await browser.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
