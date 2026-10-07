// claude/can-bang-phan-thuong: bảng thưởng boss cân bằng — 3 ô khác kiểu, giá trị "vàng tương đương" gần nhau,
// kiểu mới (Lâu dài / Rủi ro / Theo hệ / Luyện quân / Phòng thủ) chạy đúng, lưu / nạp, co-op cùng seed, giao diện 3 cỡ.
// Chạy: node tests/sinh-le/can-bang-thuong.test.js
const path = require('path');
const { open, enter, ok } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
require('fs').mkdirSync(SHOT, { recursive: true });

// đội mẫu theo đợt: n tướng, cấp quanh lv, vài món đồ
const setup = async (page, wave, n, lv) => page.evaluate(([wave, n, lv]) => {
  const g = ui.game; g.running = false;
  g.heroes = g.heroes.map(() => null);
  g.gold = 99999; g.summonN = 0;
  for (let i = 0; i < n; i++) { g.ensureMarket(); g.buyCard(i % 4, -1); }
  g.heroes.filter(Boolean).forEach((h, i) => { h.level = Math.min(CONFIG.maxLevel, lv + (i % 4)); });
  g.inventory = [];
  g.gold = 500; g.wave = wave; g.slHist = []; g.rwHist = '';
  g.updateAuras();
}, [wave, n, lv]);

(async () => {
  let { browser, page, errors } = await open(844, 390);
  await enter(page, 2, true);

  // ---- 1. 4 tình huống × 60 bảng thưởng: khác kiểu, khác nhóm, giá trị gần nhau
  const all = [];
  for (const [wave, n, lv] of [[10, 5, 5], [20, 7, 9], [30, 8, 13], [50, 9, 18]]) {
    await setup(page, wave, n, lv);
    const r = await page.evaluate(() => {
      const g = ui.game, out = [];
      for (let k = 0; k < 60; k++) {
        const opts = g.bossRewards(['thuongluong', 'haba', 'thuytinh'][k % 3]);
        const R = g.rwRates();
        out.push({ wave: g.wave, tags: opts.map((o) => o.tag), fams: opts.map((o) => RW_KIND[o.tag].fam), vals: opts.map((o) => g.rewardValue(o, R)),
          bad: opts.filter((o) => !RW_KIND[o.tag] || (o.gold || 0) < 0 || (o.kind === 'item' && !(o.ids || [o.id]).every((id) => ITEMS[id]))).length });
      }
      return out;
    });
    all.push(...r);
  }
  const spread = (v) => (Math.max(...v) - Math.min(...v)) / Math.max(...v);
  const sp = all.map((o) => spread(o.vals));
  const in15 = sp.filter((x) => x <= 0.15).length / sp.length, in25 = sp.filter((x) => x <= 0.25).length / sp.length;
  console.log(`  ${all.length} bảng · chênh ≤15%: ${(in15 * 100).toFixed(0)}% · ≤25%: ${(in25 * 100).toFixed(0)}% · chênh TB ${(100 * sp.reduce((a, b) => a + b, 0) / sp.length).toFixed(1)}%`);
  const cnt = {};
  for (const o of all) for (const t of o.tags) cnt[t] = (cnt[t] || 0) + 1;
  console.log('  kiểu xuất hiện: ' + Object.entries(cnt).map(([k, v]) => `${k} ${v}`).join(' · '));
  ok(all.every((o) => o.tags.length === 3 && o.tags[0] === 'bau'), 'mỗi bảng 3 ô, ô 1 luôn là Sính lễ');
  ok(all.every((o) => new Set(o.tags).size === 3), 'không bảng nào có 2 ô trùng kiểu');
  ok(all.every((o) => o.fams[1] !== o.fams[2]), 'ô 2, 3 luôn thuộc 2 nhóm khác nhau (Sức mạnh / Kinh tế / An nguy)');
  ok(all.every((o) => !o.bad), 'mọi ô hợp lệ (kiểu có nhãn, vàng không âm, món có thật)');
  ok(['do', 'luyen', 'he', 'ngay', 'lau', 'thu', 'ruiro'].every((t) => cnt[t] >= 10), 'cả 7 kiểu ô 2, 3 đều xuất hiện');
  ok(in15 >= 0.85 && in25 >= 0.97, `giá trị 3 ô cân bằng: ${(in15 * 100).toFixed(0)}% bảng chênh ≤15%, ${(in25 * 100).toFixed(0)}% ≤25%`);
  let rep = 0;
  for (let i = 1; i < all.length; i++) if (all[i].wave === all[i - 1].wave && all[i].tags.join() === all[i - 1].tags.join()) rep++;
  ok(rep === 0, 'không lặp đúng bộ kiểu của lần thưởng trước');

  // ---- 2. từng kiểu nhận thưởng chạy đúng
  await setup(page, 20, 7, 9);
  const k = await page.evaluate(() => {
    const g = ui.game, R = g.rwRates(), V = 1200, res = {};
    const heEl = g.rwHeEl();
    // Vàng ngay
    let o = g.rwMake('ngay', V, R); let g0 = g.gold; g.claimReward(o); res.ngay = g.gold - g0 === o.gold && o.gold === V;
    // Phòng thủ
    o = g.rwMake('thu', V, R); const l0 = g.lives; g0 = g.gold; g.claimReward(o); res.thu = g.lives - l0 === o.lives && g.gold - g0 === o.gold && o.lives >= 4;
    // Lâu dài: trả dần o.waves đợt
    o = g.rwMake('lau', V, R); g.claimReward(o); g0 = g.gold;
    let paid = 0; for (let i = 0; i < o.waves + 2; i++) { const a = g.gold; g.rwWaveEnd(); paid += g.gold - a; }
    res.lau = paid === o.per * o.waves && g.incomes.length === 0;
    // Rủi ro thắng / thua
    o = g.rwMake('ruiro', V, R); g.claimReward(o); g0 = g.gold; g.wave++; g.rwWaveEnd(); const win = g.gold - g0; g.wave--;
    g.claimReward(o); g0 = g.gold; g.lostN++; g.wave++; g.rwWaveEnd(); const lose = g.gold - g0; g.wave--;
    res.ruiro = win === o.win && lose === o.lose && o.win > V && o.lose < V && !g.bet;
    // Rủi ro: chưa hết đợt kế thì chưa chốt
    g.claimReward(o); g0 = g.gold; g.rwWaveEnd(); res.ruiroCho = g.gold === g0 && !!g.bet; g.bet = null;
    // Luyện quân: chỉ các tướng được ghi tên lên cấp
    o = g.rwMake('luyen', V, R);
    const lv0 = new Map(g.heroes.filter(Boolean).map((h) => [h.id, h.level]));
    g.claimReward(o);
    res.luyen = g.heroes.filter(Boolean).every((h) => h.level - lv0.get(h.id) === (o.who.includes(h.id) ? o.levels : 0)) && o.who.length >= 1;
    // Theo hệ: tướng đúng hệ mạnh lên, tướng khác hệ không đổi
    if (heEl) {
      o = g.rwMake('he', V, R, 'haba', heEl);
      const hs = g.heroes.filter(Boolean), p0 = hs.map((h) => heroPower(h));
      g.claimReward(o);
      const p1 = hs.map((h) => heroPower(h));
      res.he = o.pct >= RW.heMin && o.pct <= RW.heMax && hs.every((h, i) => (HEROES[h.type].el === heEl ? p1[i] > p0[i] : p1[i] === p0[i]));
    } else res.he = 'không có hệ ≥2 tướng';
    // Hũ: nhận đủ món
    o = g.rwMake('do', V, R, 'thuytinh'); const n0 = g.inventory.length; g.claimReward(o); res.do = g.inventory.length === n0 + o.ids.length;
    // lưu / nạp giữ trạng thái thưởng
    g.claimReward(g.rwMake('lau', V, R)); g.claimReward(g.rwMake('ruiro', V, R));
    const snap = g.snapshot(); const inc = JSON.stringify(g.incomes), bet = JSON.stringify(g.bet), eb = JSON.stringify(g.elBuff);
    g.restore(JSON.parse(JSON.stringify(snap)));
    res.luu = JSON.stringify(g.incomes) === inc && JSON.stringify(g.bet) === bet && JSON.stringify(g.elBuff) === eb && g.incomes.length > 0 && !!g.bet;
    return res;
  });
  for (const [kk, v] of Object.entries(k)) ok(v === true || (kk === 'he' && typeof v === 'string'), `nhận thưởng ${kk}: ${v === true ? 'đúng' : v}`);

  // ---- 3. co-op: cùng seed → cùng bộ thưởng trên 2 máy
  const co = await page.evaluate(() => {
    const g = ui.game;
    const run = (seed) => { SIM.coop = true; SIM.active = true; SIM.seed = seed; g.slHist = []; g.rwHist = ''; const r = [1, 2, 3, 4].map(() => g.bossRewards('haba').map((o) => o.tag + ':' + (o.gold || o.win || o.per || o.pct || o.levels || o.id)).join('|')).join(' / '); SIM.coop = false; SIM.active = false; return r; };
    return [run(77), run(77)];
  });
  ok(co[0] === co[1], 'co-op: cùng seed → cùng bộ thưởng');
  ok(errors.length === 0, 'không lỗi JS: ' + errors.join(' | '));
  await browser.close();

  // ---- 4. giao diện: mọi kiểu có nhãn + con số, không lòi ra ngoài, 3 cỡ màn hình
  for (const [w, h] of [[1920, 934], [844, 390], [667, 375]]) {
    ({ browser, page, errors } = await open(w, h));
    await enter(page, 2, true);
    await setup(page, 20, 7, 9);
    for (const pair of [['do', 'ngay'], ['luyen', 'ruiro'], ['he', 'lau'], ['do', 'thu']]) {
      const info = await page.evaluate((pair) => {
        const g = ui.game, R = g.rwRates();
        const opts = g.bossRewards('haba');
        const el = g.rwHeEl() || HEROES[g.heroes.find(Boolean).type].el;
        const options = [opts[0], ...pair.map((t) => g.rwMake(t, opts[0].val || 1200, R, 'haba', el))];
        ui.showReward({ type: 'reward', boss: 'haba', options, id: 1 });
        const cards = [...document.querySelectorAll('#reward .sl-card')];
        const over = [...document.querySelectorAll('#reward .screen *')].some((e) => { const q = e.getBoundingClientRect(); return q.width && (q.right > innerWidth + 1 || q.left < -1 || q.bottom > innerHeight + 1); });
        const cut = cards.some((c) => { const d = c.querySelector('.sl-desc'); return d && d.scrollHeight > d.clientHeight + 2; });
        return { n: cards.length, over, cut, texts: cards.map((c) => c.innerText), labels: options.slice(1).map((o) => RW_KIND[o.tag].name), nums: cards.slice(1).map((c) => /\d/.test(c.querySelector('.sl-desc').innerText)) };
      }, pair);
      await page.screenshot({ path: path.join(SHOT, `can-bang-${pair.join('-')}-${w}x${h}.png`) });
      ok(info.n === 3 && info.labels.every((l, i) => info.texts[i + 1].toLowerCase().includes(l.toLowerCase())), `${w}×${h} · ${pair.join(' + ')}: có nhãn ${info.labels.join(', ')}`);
      ok(info.nums.every(Boolean), `${w}×${h} · ${pair.join(' + ')}: mỗi ô ghi con số cụ thể`);
      ok(!info.over && !info.cut, `${w}×${h} · ${pair.join(' + ')}: không lòi ra ngoài, chữ không bị cắt`);
    }
    // bộ cuối (Hũ + Phòng thủ): bấm chọn ô Phòng thủ qua nút → mạng tăng, bảng đóng
    await page.waitForTimeout(1300);      // chống bấm nhầm: bảng thưởng khoá 1.2 giây đầu
    const l0 = await page.evaluate(() => ui.game.lives);
    await page.click('#reward [data-i="2"]');
    const got = await page.evaluate((l0) => ui.game.lives > l0 && document.querySelector('#reward').hidden, l0);
    ok(got, `${w}×${h}: bấm chọn ô Phòng thủ → mạng tăng, bảng thưởng đóng`);
    ok(errors.length === 0, 'không lỗi JS: ' + errors.join(' | '));
    await browser.close();
  }
  console.log('OK can-bang-thuong');
})().catch((e) => { console.error(e); process.exit(1); });
