// TURRET MERGE kiểm thử Playwright — đầu ụ grow-up dạng 1/2/3 trên bàn (390×844 DPR 3): không bị cắt đầu, không lỗi trang.
// Chạy: python3 -m http.server 8765 (ở gốc repo) rồi OUT=thu-muc/ node tools/thap-kt-growcut.js [anh_s]
//   không tham số: cấu hình thật (đầu v2 + quầng theo dạng) · 'anh_s': ép dùng ảnh dạng _s1/_s2/_s3 (STAGE_K = STAGE_K_CHO) để soi ảnh cắt lại
// Mỗi ảnh chụp: 5 ụ (cột) × 3 dạng (hàng 1 = dạng 1, hàng 2 = dạng 2, hàng 3 = dạng 3).
const { chromium } = require('playwright');
const OUT = process.env.OUT || 'shots/';
const ANH_S = process.argv[2] === 'anh_s';
const IDS = ['overlord', 'hopbi', 'tienhoa', 'lophanung', 'soi', 'orbital', 'cuongno', 'ngoisao', 'lienket', 'dongbo', 'hydra', 'cuuvi', 'ngaithoigian', 'ronglua', 'luoicheo'];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  const thieu = []; p.on('response', (r) => { if (r.status() >= 400) thieu.push(r.url()); });
  if (ANH_S) await p.route('**/js/artscale.js*', async (route) => {
    const r = await route.fetch(); let t = await r.text();
    t += '\n;window.STAGE_K = Object.assign({}, window.STAGE_K_CHO); window.STAGE_TIP = Object.assign({}, window.STAGE_TIP_CHO); window.STAGE_DAU_MOI = {};\n';
    route.fulfill({ response: r, body: t, headers: { ...r.headers(), 'content-type': 'application/javascript' } });
  });
  await p.goto('http://localhost:8765/thap/?mode=solo&notut=1&nointro&deck=lien,canon,bang,tia,set&wave=3&mana=99999&dpr=3', { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  const kq = [];
  for (let g = 0; g < 3; g++) {
    const ids = IDS.slice(g * 5, g * 5 + 5);
    const box = await p.evaluate((ids) => {
      G.hang.length = 0; G.quai.length = 0; G.hu.length = 0; G.dan.length = 0; G.cho = 1e9; G.dung = false;
      const B = G.ban[0]; B.tim = 1e9; B.t.fill(null); B.deck = ids.slice();
      for (const id of ids) B.lv[id] = B.lv[id] || 1;
      for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
        const id = ids[c], o = r * 5 + c;
        const T = sinhU(taoU(B, id, r === 2 ? 7 : r === 1 ? 4 : 1, o)); T._epGd = r + 1; T.gd = r + 1; T.goc = 0; B.t[o] = T;
      }
      const xs = B.o.map((q) => q.x), ys = B.o.map((q) => q.y), cv = document.getElementById('cv').getBoundingClientRect();
      return { x: cv.left + Math.min(...xs) - B.cw * 0.62, y: cv.top + Math.min(...ys) - B.ch * 1.15, w: Math.max(...xs) - Math.min(...xs) + B.cw * 1.24, h: Math.max(...ys) - Math.min(...ys) + B.ch * 1.24, cw: B.cw };
    }, ids);
    await p.waitForTimeout(1400); // qua khoảnh khắc biến hình
    await p.evaluate(() => { G.dung = true; for (const T of G.ban[0].t) if (T) { T.vxB = null; T.goc = 0; } });
    await p.waitForTimeout(150);
    const f = OUT + 'ban_' + (ANH_S ? 'anh_s_' : 'that_') + (g + 1) + '.png';
    await p.screenshot({ path: f, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.min(390, box.w), height: box.h } });
    // đo: ảnh đầu đã nạp đủ + cỡ vẽ / cỡ điểm ảnh PNG (QUY-TAC-HINH mục 5: ≤ 1.05)
    const do_ = await p.evaluate((ids) => ids.map((id) => [1, 2, 3].map((gd) => {
      const ten = REN.dauTen(id, gd), a = REN.anh[ten], C = Math.min(G.ban[0].cw, G.ban[0].ch), D = C * REN.dauK(id, gd) * (REN.dpr || 1);
      return { ten, nap: !!(a && a.complete && (a.naturalWidth || a.width)), png: a ? (a.naturalWidth || a.width) : 0, tiLe: a ? +(D / (a.naturalWidth || a.width)).toFixed(2) : null };
    })), ids);
    kq.push(...do_.flat());
    await p.evaluate(() => { G.dung = false; });
  }
  console.log(JSON.stringify({ anh_s: ANH_S, errs, thieu, kq }, null, 0));
  await b.close();
})();
