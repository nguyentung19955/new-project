// v181: sính lễ ngẫu nhiên có trọng số (bảng thưởng boss) + chống trùng + mốc lớn + co-op seed chung
// Chạy: node tests/sinh-le/sinh-le.test.js   (in phân bố mô phỏng 1000 lần, chụp màn nhận thưởng 3 cỡ)
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = path.resolve(__dirname, '../..');
const URL = 'file://' + path.join(ROOT, 'index.html');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const ok = (cond, msg) => { if (!cond) throw new Error('FAIL: ' + msg); console.log('  ✓ ' + msg); };

async function open(w, h) {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
  await page.goto(URL);
  await page.waitForTimeout(800);
  return { browser, page, errors };
}

(async () => {
  let { browser, page, errors } = await open(844, 390);

  // ---- 1. mô phỏng 1000 lần (rng có seed để kết quả ổn định)
  const sim = await page.evaluate(() => {
    const mk = (seed) => () => { let t = (seed = (seed + 0x6D2B79F5) | 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const run = (big, owned, seed) => {
      const rng = mk(seed), cnt = {}, hist = [];
      let run3 = 0;
      for (const id of Object.keys(SINH_LE)) cnt[id] = 0;
      for (let i = 0; i < 1000; i++) {
        const id = rollSinhLe({ hist, owned, big }, rng);
        cnt[id]++;
        if (hist.length >= 2 && hist[hist.length - 1] === id && hist[hist.length - 2] === id) run3++;
        hist.push(id);
      }
      return { cnt, run3 };
    };
    const seq = (seed) => { const rng = mk(seed), hist = []; for (let i = 0; i < 30; i++) hist.push(rollSinhLe({ hist }, rng)); return hist.join(','); };
    return {
      ids: Object.keys(SINH_LE), tiers: Object.fromEntries(Object.entries(SINH_LE).map(([k, v]) => [k, v.tier])),
      normal: run(false, [], 12345), big: run(true, [], 12345), owned: run(false, ['voi_chin_nga', 'ga_chin_cua'], 777),
      sameSeed: seq(42) === seq(42), diffSeed: seq(42) !== seq(43),
      names: Object.fromEntries(Object.keys(SINH_LE).map((k) => [k, ITEMS[k].name])),
    };
  });
  console.log('  Phân bố 1000 lần:');
  for (const k of ['normal', 'big', 'owned']) console.log(`   ${k}: ` + sim.ids.map((id) => `${sim.names[id]} ${sim.normal && sim[k].cnt[id]}`).join(' · ') + ` | 3 lần liền: ${sim[k].run3}`);
  const N = sim.normal.cnt, B = sim.big.cnt, O = sim.owned.cnt;
  ok(sim.ids.every((id) => N[id] > 0), 'cả 4 sính lễ đều ra được');
  ok(N.voi_chin_nga > N.ngua_hong_mao && N.ga_chin_cua > N.ngua_hong_mao && N.ngua_hong_mao > N.ngoc_hoi_sinh, 'Thường nhiều hơn Hiếm, Hiếm nhiều hơn Quý hiếm');
  ok(sim.normal.run3 === 0 && sim.big.run3 === 0 && sim.owned.run3 === 0, 'không món nào ra 3 lần liền');
  ok(B.ngoc_hoi_sinh > N.ngoc_hoi_sinh * 1.6 && B.ngua_hong_mao > N.ngua_hong_mao, 'mốc lớn: món Hiếm / Quý hiếm ra nhiều hơn');
  ok(O.voi_chin_nga < N.voi_chin_nga * 0.8 && O.ngua_hong_mao > N.ngua_hong_mao, 'món đã có ra ít hơn, ưu tiên món chưa có');
  ok(sim.sameSeed && sim.diffSeed, 'cùng seed → cùng chuỗi sính lễ (co-op 2 máy ra giống nhau)');

  // ---- 2. bảng thưởng boss trong trận: ngẫu nhiên, ghi lịch sử, lưu / nạp, co-op seed chung
  await page.evaluate(() => ui.playLevel(0, false));
  await page.waitForTimeout(600);
  const g2 = await page.evaluate(() => {
    const g = ui.game;
    g.wave = 10;
    const seen = new Set(); let rep3 = 0;
    for (let i = 0; i < 60; i++) {
      const o = g.bossRewards('thuongluong')[0];
      seen.add(o.id);
      const h = g.slHist, n = h.length;
      if (n >= 3 && h[n - 1] === h[n - 2] && h[n - 2] === h[n - 3]) rep3++;
      if (!o.sinhLe || o.kind !== 'item' || !ITEMS[o.id].bossOnly) return { bad: o };
    }
    const snap = g.snapshot();
    // co-op: cùng seed → cùng sính lễ
    const coop = (seed) => { SIM.coop = true; SIM.active = true; SIM.seed = seed; g.slHist = []; const r = [1, 2, 3, 4, 5].map(() => g.bossRewards('haba')[0].id).join(','); SIM.coop = false; SIM.active = false; return r; };
    const a = coop(99), b = coop(99);
    g.wave = 20;
    const big = g.bossRewards('thuytinh')[0].big;
    return { seen: [...seen], rep3, snapHist: Array.isArray(snap.slHist) && snap.slHist.length > 0, a, b, big };
  });
  ok(!g2.bad, 'ô Sính lễ luôn là một món sính lễ');
  ok(g2.seen.length >= 3, `boss Thuồng Luồng không còn tặng cố định: ra ${g2.seen.length} món khác nhau`);
  ok(g2.rep3 === 0, 'trong trận không món nào ra 3 lần liền');
  ok(g2.snapHist, 'lịch sử sính lễ được lưu theo trận');
  ok(g2.a === g2.b, 'co-op: cùng seed → 2 máy ra cùng sính lễ ' + g2.a);
  ok(g2.big === true, 'đợt 20 là mốc lớn');
  ok(errors.length === 0, 'không lỗi JS: ' + errors.join(' | '));
  await browser.close();

  // ---- 3. màn nhận thưởng: ảnh + tên + độ hiếm, 3 cỡ màn hình
  for (const [w, h] of [[1920, 934], [844, 390], [667, 375]]) {
    ({ browser, page, errors } = await open(w, h));
    await page.evaluate(() => { ui.playLevel(0, false); document.querySelector('[data-act=prep-go]').click(); });
    await page.waitForTimeout(600);
    for (const [id, wave] of [['ngoc_hoi_sinh', 20], ['voi_chin_nga', 10], ['ngua_hong_mao', 30]]) {
      await page.evaluate(([id, wave]) => {
        const g = ui.game; g.wave = wave;
        const options = g.bossRewards('thuongluong');
        options[0] = Object.assign({}, options[0], { id, title: 'Sính lễ ' + ITEMS[id].name });
        ui.showReward({ type: 'reward', boss: 'thuongluong', options, id: 1 });
      }, [id, wave]);
      await page.waitForTimeout(400);
      const info = await page.evaluate((id) => {
        const c = document.querySelector('#reward .sl-card.gift');
        const im = c.querySelector('.sl-well img, .sl-well svg');
        const r = c.querySelector('.sl-well').getBoundingClientRect(), ir = im && im.getBoundingClientRect();
        return { text: c.innerText, img: !!im && (im.tagName !== 'IMG' || im.naturalWidth > 0) && ir.width > 20 && ir.height > 20, inside: !!ir && ir.left >= r.left - 1 && ir.right <= r.right + 1 && ir.bottom <= r.bottom + 1,
          tier: SL_TIER[SINH_LE[id].tier].name, name: ITEMS[id].name, head: document.querySelector('#reward .scr-head').innerText,
          over: [...document.querySelectorAll('#reward .screen *')].some((e) => { const q = e.getBoundingClientRect(); return q.width && (q.right > innerWidth + 1 || q.left < -1 || q.bottom > innerHeight + 1); }) };
      }, id);
      await page.screenshot({ path: path.join(SHOT, `nhan-thuong-${id}-${w}x${h}.png`) });
      ok(info.text.includes(info.name) && info.text.includes(info.tier) && info.img && info.inside, `${w}×${h} · ${info.name}: có ảnh, tên, độ hiếm ${info.tier}`);
      ok(!info.over, `${w}×${h}: không phần nào lòi ra ngoài màn hình`);
      if (wave === 20) ok(/Mốc lớn/.test(info.head), `${w}×${h}: đợt 20 hiện chip Mốc lớn`);
    }
    // chọn sính lễ → vào túi, báo tên + độ hiếm
    const got = await page.evaluate(() => { const n = ui.game.inventory.length; ui.pickReward(0); return ui.game.inventory.length === n + 1 && ui.game.inventory[n].id === 'ngua_hong_mao'; });
    ok(got, `${w}×${h}: chọn sính lễ → món vào túi đồ`);
    ok(errors.length === 0, 'không lỗi JS: ' + errors.join(' | '));
    await browser.close();
  }
  console.log('OK sinh-le');
})().catch((e) => { console.error(e); process.exit(1); });
