// Tạo ảnh mẫu docs/review/vk-cap-he/mau-<hệ>.png bằng chính game đóng gói (game/dist/linh-khi.html) + tools/vk-cap-he/cap_he.js.
// Chạy: NODE_PATH=$(npm root -g) node tools/vk-cap-he/tao_anh.js [fire|ice|poison ...]
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '../..');
const HE = process.argv.slice(2).length ? process.argv.slice(2) : ['fire', 'ice', 'poison'];
const TEN = { fire: 'Lửa', ice: 'Băng', poison: 'Độc' };

(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 800, height: 600 } });
  pg.on('pageerror', (e) => console.log('lỗi trang:', e.message));
  await pg.goto('file://' + path.join(ROOT, 'game/dist/linh-khi.html'));
  await pg.waitForFunction(() => window.G && G.spriteCustom && G.spriteCustom.do && G.spriteCustom.do['vk-sword-0'] && G.spriteCustom.do['vk-sword-0'].ready && G.art && G.art.hero && G.weaponArt, null, { timeout: 30000 });
  await pg.addScriptTag({ path: path.join(__dirname, 'cap_he.js') });
  for (const el of HE) {
    const url = await pg.evaluate(([el, tenHe]) => {
      const SC = G.spriteCustom, WA = G.weaponArt, VC = G.vkCapHe;
      if (!WA._mau) { // vẽ vũ khí trong em bé: có window.__mau thì dùng mẫu cấp hệ
        WA._mau = true; const d0 = WA.draw;
        WA.draw = function (c, o, x, y, a, p) { const sp = SC.timVuKhi(o); if (window.__mau && sp) return VC.ve(c, sp, window.__mau, o, x, y, a, p); return d0.apply(this, arguments); };
      }
      G.RARITY.forEach((r) => (r.maxStage = 3));
      const cot = ['Gốc (chưa hệ)', 'Cấp 1 · Nhiễm', 'Cấp 2 · Cường hoá', 'Cấp 3 · Thức tỉnh', 'Đang có trong game (cấp 3)'];
      const cv = document.createElement('canvas'), W = 2000; cv.width = W; cv.height = 2350;
      const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
      c.fillStyle = '#20232b'; c.fillRect(0, 0, W, cv.height);
      const chu = (s, x, y, sz, col, al) => { c.font = (sz || 22) + 'px DejaVu Sans, sans-serif'; c.fillStyle = col || '#e8e4d8'; c.textAlign = al || 'left'; c.fillText(s, x, y); };
      const mk = (marks) => ({ fire: 0, poison: 0, ice: 0, ...marks });
      const ve1 = (c2, ma, kieu, x, y, ang, t) => { // kieu: 0 gốc, 1..3 mẫu, 'game' bản hiện tại cấp 3
        const sp = SC.do[ma];
        if (kieu === 'game') { const ty = ma.split('-')[1], f = +ma.split('-')[2]; SC.veVuKhi(c2, sp, { type: ty, family: f, branch: el, stage: 3, rarity: 0, t }, x, y, ang, 0); }
        else if (!kieu) SC.veVuKhi(c2, sp, { rarity: 0, t }, x, y, ang, 0);
        else VC.ve(c2, sp, { el, cap: kieu }, { rarity: 0, t }, x, y, ang, 0);
      };
      const KIEU = [0, 1, 2, 3, 'game'];
      let Y = 50;
      chu('Mẫu vũ khí theo cấp hệ ' + tenHe + ' — giữ dáng gốc, màu hệ tăng dần ở lưỡi/rãnh/mũi, cấp 3 có họa tiết riêng', 30, Y, 28, '#ffd27a');
      Y += 20;
      const cw = W / 5;
      cot.forEach((s, i) => chu(s, cw * i + cw / 2, Y + 30, 24, i === 4 ? '#9aa3b5' : '#ffffff', 'center'));
      Y += 50;
      // Hàng 1: cỡ thật (2 điểm ảnh màn hình cho 1 điểm ảnh game, như canvas thế giới) — em bé cầm kiếm đứng nghỉ
      chu('① Cỡ thật trong game (em bé đứng nghỉ cầm Kiếm Rèn)', 30, Y + 20, 22, '#9fd0f5'); Y += 30;
      KIEU.forEach((k, i) => {
        c.save(); c.translate(cw * i + cw / 2 - 20, Y + 110); c.scale(2, 2);
        window.__mau = k && k !== 'game' ? { el, cap: k } : null;
        const w = { type: 'sword', family: 0, rarity: 0, marks: mk(k === 'game' ? { [el]: 999 } : {}), branch: k === 'game' ? el : null, sharpen: 0 };
        G.art.hero(c, { x: 0, y: 0, face: 1, key: 'smith', t: 0.3, move: false, atk: -1, dodge: -1, weapon: w, noShadow: true });
        c.restore();
      });
      window.__mau = null;
      Y += 140;
      // Hàng 2: kiếm phóng to 4 lần so với cỡ thật (8 điểm ảnh màn hình / điểm ảnh game)
      chu('② Kiếm Rèn phóng to 4× (để thấy từng điểm ảnh)', 30, Y + 20, 22, '#9fd0f5'); Y += 30;
      KIEU.forEach((k, i) => { c.save(); c.translate(cw * i + 36, Y + 120); c.scale(8, 8); ve1(c, 'vk-sword-0', k, 0, 0, 0, 0.3); c.restore(); });
      Y += 230;
      // Hàng 3-5: các loại khác (cùng mã), phóng 3×
      for (const [ma, ten, ang, dy, sx] of [['vk-spear-0', 'Giáo Tre Vót (giáo)', 0, 110, 6], ['vk-hammer-0', 'Búa Lò Rèn (búa)', 0, 150, 6], ['vk-bow-0', 'Cung Rồng Rắn (cung, có dây)', 0, 200, 6]]) {
        chu('③ ' + ten + ' — phóng to', 30, Y + 20, 22, '#9fd0f5'); Y += 30;
        KIEU.forEach((k, i) => { c.save(); c.translate(cw * i + (ma.includes('bow') ? cw / 2 - 40 : 60), Y + dy); c.scale(sx, sx); ve1(c, ma, k, 0, 0, ang, 0.3); c.restore(); });
        Y += dy * 2 + (ma.includes('bow') ? 30 : 0);
      }
      // Hàng cuối: em bé đứng / chạy / đánh với 3 cấp (cỡ 3×)
      chu('④ Em bé cầm kiếm: đứng · chạy · đánh (3 khung) — cỡ 3×', 30, Y + 20, 22, '#9fd0f5'); Y += 40;
      const tuThe = [['đứng', { move: false, atk: -1, t: 0.3 }], ['chạy', { move: true, atk: -1, t: 0.25 }], ['đánh 1', { move: false, atk: 0.15, t: 0.3 }], ['đánh 2', { move: false, atk: 0.45, t: 0.3 }], ['đánh 3', { move: false, atk: 0.75, t: 0.3 }]];
      [1, 2, 3].forEach((k, r) => {
        chu('Cấp ' + k, 30, Y + 90, 22, '#ffffff');
        tuThe.forEach(([ten, o], i) => {
          const x = 260 + i * 345;
          if (r === 0) chu(ten, x, Y - 2, 20, '#c9c3b0', 'center');
          c.save(); c.translate(x - 10, Y + 150); c.scale(3, 3);
          window.__mau = { el, cap: k };
          G.art.hero(c, Object.assign({ x: 0, y: 0, face: 1, key: 'smith', dodge: -1, weapon: { type: 'sword', family: 0, rarity: 0, marks: mk({}), branch: null, sharpen: 0 }, noShadow: true }, o));
          c.restore();
        });
        Y += 185;
      });
      window.__mau = null;
      const out = document.createElement('canvas'); out.width = W; out.height = Y + 20; out.getContext('2d').drawImage(cv, 0, 0);
      return out.toDataURL('image/png');
    }, [el, TEN[el]]);
    const f = path.join(ROOT, 'docs/review/vk-cap-he', ({ fire: 'mau-lua', ice: 'mau-bang', poison: 'mau-doc' })[el] + '.png');
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
    console.log('Đã ghi', path.relative(ROOT, f));
  }
  await b.close();
})();
