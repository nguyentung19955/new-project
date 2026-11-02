// claude/demo-hop-tuong: DEMO "Thủ thành ghép tướng" (demo/index.html, chạy độc lập).
// Chọn bộ 5 tướng → triệu hồi đủ sân → kéo gộp 2 tướng cùng loại cùng sao ra sao+1 → nâng bậc → x2 chạy tới đợt 10 có boss →
// tạm dừng → bỏ trận / kết quả → chơi lại; không lỗi JS; mọi nút nằm trong khung ở 844×390 + 667×375; cầm dọc → màn che.
// Chạy: node tests/demo-hop-tuong/demo-hop-tuong.test.js
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const ROOT = path.resolve(__dirname, '../..');
const URL = 'file://' + path.join(ROOT, 'demo', 'index.html');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const ok = (c, m) => { if (!c) throw new Error('FAIL: ' + m); console.log('  ✓ ' + m); };

async function open(browser, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: false });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|fonts\.g/i.test(m.text())) errors.push(m.text()); });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  await page.goto(URL);
  await page.waitForFunction(() => window.DEMO && document.querySelectorAll('.ct').length === 8);
  await page.waitForTimeout(400);
  return { ctx, page, errors };
}
// mọi nút / bảng đang thấy nằm trọn trong khung #wrap và trong màn hình
const trongKhung = (page) => page.evaluate(() => {
  const g = document.querySelector('#wrap').getBoundingClientRect(), bad = [];
  const inV = g.left >= -1 && g.top >= -1 && g.right <= innerWidth + 1 && g.bottom <= innerHeight + 1;
  for (const e of document.querySelectorAll('#wrap button, #wrap .bang, #wrap .tb-trai, #lk-hop')) {
    if (!e.offsetParent && getComputedStyle(e).position !== 'fixed') continue;
    if (e.closest('[hidden]')) continue;
    const q = e.getBoundingClientRect(); if (!q.width) continue;
    if (q.left < g.left - 1 || q.top < g.top - 1 || q.right > g.right + 1 || q.bottom > g.bottom + 1) bad.push(e.id || e.className || e.textContent.slice(0, 12));
  }
  // nút không chồng lên nhau
  const bs = [...document.querySelectorAll('#wrap button')].filter((e) => e.offsetParent && !e.closest('[hidden]')).map((e) => [e, e.getBoundingClientRect()]);
  for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) { const a = bs[i][1], b = bs[j][1]; if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) bad.push('chồng:' + (bs[i][0].id || bs[i][0].className) + '/' + (bs[j][0].id || bs[j][0].className)); }
  return { inV, bad, s: g.width / 844, scroll: document.documentElement.scrollWidth > innerWidth + 1 || document.documentElement.scrollHeight > innerHeight + 1 };
});

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  try {
    for (const [w, h] of [[844, 390], [667, 375]]) {
      const tag = `${w}x${h}`;
      console.log(tag);
      const { ctx, page, errors } = await open(browser, w, h);
      let k = await trongKhung(page);
      ok(k.inV && !k.bad.length && !k.scroll, `${tag} màn chọn bộ: khung vừa màn (tỉ lệ ${k.s.toFixed(2)}), nút trong khung ${k.bad}`);
      await page.screenshot({ path: path.join(SHOT, `${tag}-1-chon.png`) });
      ok(await page.isDisabled('#nut-vao'), `${tag} chưa đủ 5 tướng thì chưa vào trận được`);
      for (const id of ['giong', 'sontinh', 'thuytinh', 'auco', 'mychau']) await page.click(`.ct[data-id=${id}]`);
      ok((await page.textContent('#chon-dem')) === '5/5' && !(await page.isDisabled('#nut-vao')), `${tag} chọn đủ 5 tướng`);
      await page.click('#nut-vao');
      await page.waitForTimeout(300);
      ok(await page.evaluate(() => DEMO.S && DEMO.S.deck.join() === 'giong,sontinh,thuytinh,auco,mychau'), `${tag} vào trận với đúng bộ đã chọn`);
      // triệu hồi bằng Linh khí đầu trận: giá tăng dần
      const lk0 = await page.evaluate(() => DEMO.S.lk);
      await page.click('#nut-trieu'); await page.click('#nut-trieu');
      let st = await page.evaluate(() => ({ lk: DEMO.S.lk, n: DEMO.S.o.filter(Boolean).length, sao: DEMO.S.o.filter(Boolean).every((v) => v.sao === 1), gia: DEMO.G.giaTrieu(DEMO.S) }));
      const g = await page.evaluate(() => [0, 1, 2].map((n) => CAU_HINH.giaTrieu(n)));
      ok(st.n === 2 && st.sao && st.lk === lk0 - g[0] - g[1] && st.gia === g[2] && g[2] > g[1] && g[1] > g[0], `${tag} triệu hồi 2 lần: 2 tướng 1 sao, tốn ${g[0]} + ${g[1]} Linh khí, giá tăng dần (lần sau ${st.gia})`);
      // triệu hồi đủ sân (cho thêm Linh khí)
      await page.evaluate(() => { DEMO.S.lk = 99999; });
      for (let i = 0; i < 16; i++) await page.click('#nut-trieu');
      st = await page.evaluate(() => ({ n: DEMO.S.o.filter(Boolean).length, ids: DEMO.S.o.every((v) => v && DEMO.S.deck.includes(v.id)), txt: document.querySelector('#gia-trieu').textContent }));
      ok(st.n === 15 && st.ids && /đầy/.test(st.txt), `${tag} triệu hồi đủ 15 ô, toàn tướng trong bộ, nút báo "${st.txt}"`);
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SHOT, `${tag}-2-tran.png`) });
      // gộp: kéo tướng a thả lên tướng b cùng loại cùng sao
      const cap = await page.evaluate(() => { const o = DEMO.S.o; for (let a = 0; a < 15; a++) for (let b = 0; b < 15; b++) if (DEMO.G.gopDuoc(DEMO.S, a, b)) return [a, b]; return null; });
      ok(!!cap, `${tag} có cặp cùng loại cùng sao để gộp (${cap})`);
      const [a, b] = cap;
      const [ax, ay] = await page.evaluate((i) => DEMO.oClient(i), a), [bx, by] = await page.evaluate((i) => DEMO.oClient(i), b);
      await page.mouse.move(ax, ay); await page.mouse.down();
      await page.mouse.move((ax + bx) / 2, (ay + by) / 2, { steps: 4 }); await page.mouse.move(bx, by, { steps: 4 });
      await page.screenshot({ path: path.join(SHOT, `${tag}-3-keo.png`) });
      await page.mouse.up();
      st = await page.evaluate(([a, b]) => ({ a: DEMO.S.o[a], b: DEMO.S.o[b] }), [a, b]);
      ok(!st.a && st.b && st.b.sao === 2, `${tag} kéo gộp ô ${a} → ô ${b}: ô cũ trống, ra tướng 2 sao (${st.b && st.b.id})`);
      await page.waitForTimeout(250);
      await page.screenshot({ path: path.join(SHOT, `${tag}-4-gop.png`) });
      // kéo lên tướng khác loại / khác sao: không gộp
      const sai = await page.evaluate(() => { const o = DEMO.S.o; for (let a = 0; a < 15; a++) for (let b = 0; b < 15; b++) if (o[a] && o[b] && a !== b && !DEMO.G.gopDuoc(DEMO.S, a, b)) return [a, b, o[a].sao, o[b].sao]; });
      const [sx, sy] = await page.evaluate((i) => DEMO.oClient(i), sai[0]), [tx, ty] = await page.evaluate((i) => DEMO.oClient(i), sai[1]);
      await page.mouse.move(sx, sy); await page.mouse.down(); await page.mouse.move(tx, ty, { steps: 5 }); await page.mouse.up();
      st = await page.evaluate((s) => [DEMO.S.o[s[0]] && DEMO.S.o[s[0]].sao, DEMO.S.o[s[1]] && DEMO.S.o[s[1]].sao], sai);
      ok(st[0] === sai[2] && st[1] === sai[3], `${tag} thả lên tướng khác loại/sao: không gộp, tướng về chỗ cũ`);
      // nâng bậc
      const b0 = await page.evaluate(() => ({ lk: DEMO.S.lk, bac: DEMO.S.bac.giong, dmg: DEMO.G.satThuong(DEMO.S, { id: 'giong', sao: 1 }) }));
      await page.click('.the[data-id=giong]');
      const b1 = await page.evaluate(() => ({ lk: DEMO.S.lk, bac: DEMO.S.bac.giong, dmg: DEMO.G.satThuong(DEMO.S, { id: 'giong', sao: 1 }), txt: document.querySelector('.the[data-id=giong] .bac').textContent }));
      ok(b1.bac === b0.bac + 1 && b1.lk === b0.lk - 80 && b1.dmg > b0.dmg && b1.txt === 'Bậc 2', `${tag} nâng bậc Thánh Gióng: tốn 80, sát thương ${b0.dmg} → ${b1.dmg.toFixed(1)}, nút ghi "${b1.txt}"`);
      // x2 + tua nhanh tới đợt 10 có boss
      await page.click('#nut-tocdo');
      ok((await page.textContent('#nut-tocdo')) === 'x2', `${tag} nút tốc độ chuyển x2`);
      await page.evaluate(() => { DEMO.S.mang = 99; DEMO.tua(10); });
      await page.waitForFunction(() => DEMO.S.dot >= 10 && DEMO.S.boss, null, { timeout: 120000 });
      await page.evaluate(() => DEMO.tua(1));
      st = await page.evaluate(() => ({ dot: DEMO.S.dot, boss: DEMO.S.boss && DEMO.S.boss.boss.ten, kn: DEMO.S.boss && DEMO.S.boss.boss.kn, txt: document.querySelector('#tb-boss').textContent, giet: DEMO.S.giet }));
      ok(st.dot === 10 && st.boss === 'Chằn Tinh' && /Boss/.test(st.txt), `${tag} tới đợt 10: boss ${st.boss} xuất hiện (đã hạ ${st.giet} quái)`);
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(SHOT, `${tag}-5-boss.png`) });
      // kỹ năng boss hoá đá tướng
      await page.evaluate(() => DEMO.tua(4));
      await page.waitForFunction(() => DEMO.S.o.some((v) => v && v.da > 0), null, { timeout: 30000 });
      await page.evaluate(() => DEMO.tua(1));
      ok(true, `${tag} Chằn Tinh hoá đá tướng`);
      await page.screenshot({ path: path.join(SHOT, `${tag}-6-hoada.png`) });
      k = await trongKhung(page);
      ok(k.inV && !k.bad.length && !k.scroll, `${tag} trong trận: mọi nút trong khung, không chồng nhau ${k.bad}`);
      // tạm dừng
      await page.click('#nut-dung');
      const t0 = await page.evaluate(() => DEMO.S.t); await page.waitForTimeout(400);
      ok(await page.isVisible('#dung') && (await page.evaluate(() => DEMO.S.t)) === t0, `${tag} tạm dừng: hiện bảng, trận đứng yên`);
      k = await trongKhung(page);
      ok(!k.bad.length, `${tag} bảng tạm dừng trong khung ${k.bad}`);
      await page.click('[data-act=tiep]'); await page.waitForTimeout(300);
      ok(!(await page.isVisible('#dung')) && (await page.evaluate(() => DEMO.S.t)) > t0, `${tag} tiếp tục: trận chạy lại`);
      // thua → kết quả
      await page.evaluate(() => { DEMO.S.mang = 1; DEMO.tua(8); });
      await page.waitForSelector('#ketqua:not([hidden])', { timeout: 120000 });
      await page.evaluate(() => DEMO.tua(1));
      const kq = await page.textContent('#kq-dot');
      ok(/Đợt \d+/.test(kq), `${tag} thua: bảng kết quả "${kq}"`);
      await page.screenshot({ path: path.join(SHOT, `${tag}-7-ketqua.png`) });
      k = await trongKhung(page);
      ok(!k.bad.length, `${tag} bảng kết quả trong khung ${k.bad}`);
      await page.click('[data-act=choilai]'); await page.waitForTimeout(300);
      st = await page.evaluate(() => ({ dot: DEMO.S.dot, n: DEMO.S.o.filter(Boolean).length, mang: DEMO.S.mang, kq: document.querySelector('#ketqua').hidden }));
      ok(st.kq && st.n === 0 && st.mang === 3 && st.dot <= 1, `${tag} chơi lại: trận mới, sân trống, 3 mạng`);
      ok(!errors.length, `${tag} không lỗi JS ${errors.slice(0, 3)}`);
      await ctx.close();
    }
    // ảnh mới người dùng thả vào demo/assets/ được ưu tiên; không có thì dùng ảnh pixel tạm (giả ảnh bằng page.route, không ghi file thật)
    {
      const ctx = await browser.newContext({ viewport: { width: 844, height: 390 } });
      const page = await ctx.newPage();
      const png = fs.readFileSync(path.join(ROOT, 'assets/pixel-muot/tuong/giong-chan-dung.png'));
      await page.route(/demo\/assets\/tuong\/giong\.png$/, (r) => r.fulfill({ status: 200, contentType: 'image/png', body: png }));
      await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
      await page.goto(URL);
      await page.waitForFunction(() => RENDER.ANH['t:giong'].ok && RENDER.ANH['t:sontinh'].ok);
      const a = await page.evaluate(() => [RENDER.ANH['t:giong'].moi, RENDER.ANH['t:sontinh'].moi, RENDER.ANH['t:sontinh'].n]);
      ok(a[0] === true && a[1] === false && a[2] > 1, `ảnh mới demo/assets/tuong/giong.png được dùng; Sơn Tinh chưa có → ảnh tạm (${a[2]} khung)`);
      await ctx.close();
    }
    // cầm dọc → màn che, trận dừng
    {
      const { ctx, page, errors } = await open(browser, 390, 844);
      ok(await page.isVisible('#xoay'), 'dọc 390×844: hiện màn che "Xoay ngang"');
      await page.evaluate(() => DEMO.batDau(['giong', 'sontinh', 'thuytinh', 'llq', 'mychau']));
      await page.waitForTimeout(600);
      ok((await page.evaluate(() => DEMO.S.t)) === 0, 'dọc: trận không chạy khi đang cầm dọc');
      await page.screenshot({ path: path.join(SHOT, '390x844-xoay.png') });
      await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(700);
      ok(!(await page.isVisible('#xoay')) && (await page.evaluate(() => DEMO.S.t)) > 0, 'xoay ngang lại: màn che tắt, trận chạy');
      ok(!errors.length, `dọc: không lỗi JS ${errors}`);
      await ctx.close();
    }
    console.log('OK demo-hop-tuong');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
