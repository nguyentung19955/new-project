// v166: chỉ còn Vô tận — màn kết quả (hết mạng) theo chương của bản đồ; không còn màn thắng ải
// v163: rà chủ đề cũ — màn thắng / thua, lời nhắc đầu trận, phần thưởng hạ boss theo CHƯƠNG (không còn gắn cứng
// "Phong Châu thất thủ / Nước ngập thành" cho mọi ải), Vô tận chữ trung tính; khung / nút / tranh vẽ tay dùng khi có file.
const path = require('path');
const fs = require('fs');
const { open, enter, ok, ROOT } = require('../cho-tuong/helpers');
global.ASSET_ALL_TEST = true;   // v187: test giả ảnh chưa có → bỏ qua danh sách js/asset-list.js
const SHOTS = path.join(__dirname, 'shots');
fs.mkdirSync(SHOTS, { recursive: true });

// ải đại diện mỗi chương: [ải (0-based), mã chương, chữ phải có ở tựa thua]
const CASES = [[1, 'sontinh', 'Phong Châu thất thủ'], [8, 'thachsanh', 'Yêu quái tràn vào làng'], [11, 'giong', 'Giặc Ân chiếm làng Phù Đổng'],
  [13, 'llq', 'Yêu tinh biển hoành hành'], [15, 'adv', 'Cổ Loa thất thủ']];

async function result(page, lv, win, endless) {
  await enter(page, lv, endless);
  return page.evaluate(([w, e]) => {
    game.wave = e ? 47 : w ? game.levelWaves : 18;
    ui.finishLevel();
    const r = document.querySelector('#result');
    const t = r.querySelector('.res-title'), body = r.querySelector('.res-body'), main = r.querySelector('.res-main');
    const over = [...r.querySelectorAll('.res-title, .res-main > div, .scr-head .ttl')].filter((el) => el.scrollWidth > el.clientWidth + 2).map((el) => el.className);
    const mb = main.getBoundingClientRect(), bb = body.getBoundingClientRect();
    return { title: t.textContent.trim(), tag: r.querySelector('.res-art .tg2').textContent.trim(), head: r.querySelector('.scr-head').textContent,
      text: r.textContent, over, mainOut: mb.right > bb.right + 2 || mb.left < bb.left - 2, art: !!r.querySelector('.res-art svg, .res-art img'),
      ch: r.querySelector('.res-art').dataset.ch || '' };
  }, [win, endless]);
}

(async () => {
  for (const [w, h] of [[844, 390], [667, 375], [390, 844]]) {
    console.log(`Màn ${w}x${h}`);
    for (const [lv, id, lose] of CASES) {
      const { browser, page, errors } = await open(w, h, { unlocked: 17 });
      const r = await result(page, lv, false, false);
      ok(r.title.includes(lose), `bản đồ ${lv + 1} (${id}) thua: "${r.title}"`);
      if (id !== 'sontinh') ok(!/Phong Châu|NƯỚC NGẬP|💧/.test(r.text), `  không còn "Phong Châu / Nước ngập / 💧" ở chương ${id}`);
      else ok(r.tag === 'NƯỚC NGẬP THÀNH', '  chương Sơn Tinh – Thủy Tinh giữ "Nước ngập thành"');
      ok(r.art && !r.over.length && !r.mainOut, '  có tranh, chữ không tràn' + (r.over.length ? ': ' + r.over.join(',') : ''));
      if (w === 844) await page.screenshot({ path: path.join(SHOTS, `thua-${id}.png`) });
      ok(!errors.length, '  không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
      await browser.close();
    }
    // v166: qua đợt cuối cũ không thắng ải; giữ tới đợt 47 rồi thua → kết quả vô tận theo chương của bản đồ
    {
      const { browser, page, errors } = await open(w, h, { unlocked: 17 });
      const e = await result(page, 4, false, true);
      const nm = await page.evaluate(() => LEVELS[4].name);
      ok(e.title.includes("Phong Châu thất thủ") && e.head.includes(nm) && /Vô tận · /.test(e.head) && !/47\/|Chiến thắng|Ải /.test(e.text), `Vô tận: "${e.title}", đầu "${e.head.trim().slice(0, 30)}"`);
      ok(/Giữ được tới đợt\s*47/.test(e.text) && !e.over.length && !e.mainOut, '  "Giữ được tới đợt 47", không tràn');
      if (w === 844) await page.screenshot({ path: path.join(SHOTS, 'thua-vo-tan.png') });
      ok(!errors.length, '  không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
      await browser.close();
    }
  }
  // lời nhắc đầu trận, hướng dẫn, phần thưởng boss theo chương
  {
    const { browser, page, errors } = await open(844, 390, { unlocked: 17 });
    await enter(page, 11);
    const r = await page.evaluate(() => {
      const toasts = document.querySelector('#toasts').textContent;
      ui.showReward({ boss: 'anvuong', options: game.bossRewards('anvuong') });
      const rw = document.querySelector('#reward').textContent;
      const coach = themeOf(game.level).foe;
      ui.renderScreen && 0;
      return { toasts, rw, coach, sched: (ui.render_bestiary ? '' : '') };
    });
    ok(/giữ làng Phù Đổng/.test(r.toasts) && !/Phong Châu/.test(r.toasts), 'lời nhắc đầu trận bản đồ Làng Phù Đổng: "giữ làng Phù Đổng"');
    ok(/Chọn phần thưởng/.test(r.rw) && !/Chọn sính lễ/.test(r.rw), 'màn phần thưởng hạ boss chương Gióng: "Chọn phần thưởng"');
    ok(r.coach === 'giặc Ân', 'hướng dẫn "Bấm ▶ để giặc Ân tràn tới"');
    await page.screenshot({ path: path.join(SHOTS, 'phan-thuong-giong.png') });
    await enter(page, 2);
    const s = await page.evaluate(() => { ui.showReward({ boss: 'haba', options: game.bossRewards('haba') }); return document.querySelector('#reward').textContent; });
    ok(/Chọn sính lễ/.test(s) && /Vua Hùng ban thưởng/.test(s), 'chương Sơn Tinh giữ "Chọn sính lễ · Vua Hùng ban thưởng"');
    ok(!errors.length, 'không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await browser.close();
  }
  // ảnh vẽ tay: giả lập có file khung / nút / tranh → game dùng ảnh; không có → giữ CSS cũ
  {
    const png = fs.readFileSync(path.join(ROOT, 'assets/ui/nut-vang.png'));
    const frames = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/ui-frames.json'), 'utf8'));
    const files = Object.values(frames).flatMap((v) => v.files);
    const plain = await open(844, 390, { unlocked: 17 });
    const before = await plain.page.evaluate(() => document.documentElement.className);
    // v180: ảnh huy hiệu ải ui/ai-*.png đã có thật → sk-huy-hieu bật sẵn; các khung khác chưa có ảnh thì không bật
    const real = fs.existsSync(path.join(ROOT, 'assets/ui/ai-mo.png')) ? ['sk-huy-hieu'] : [];
    ok(before.split(/\s+/).filter((c) => /^sk-/.test(c)).every((c) => real.includes(c)), `chưa có ảnh khung → không bật lớp sk-… (giữ hình CSS) [${before}]`);
    await plain.browser.close();
    const { chromium } = require('/opt/node-tools/node_modules/playwright');
    const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
    const page = await (await browser.newContext({ viewport: { width: 844, height: 390 } })).newPage();
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:''};" }));
    await page.route(/assets\/(ui\/(khung-bang|nut-|thanh-mau|khung-thanh-day|the-cho|ai-|dai-thong-bao)[\w-]*|scenes\/(thua|thang|chuong)-\w+|scenes\/nen-man-phu)\.png/, (r) => r.fulfill({ contentType: 'image/png', body: png }));
    await page.addInitScript(() => { window.ASSET_ALL = true; });   // v187: ảnh giả không có trong js/asset-list.js
    await page.addInitScript(() => localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 17, storySeen: true, settings: { skipStory: true } })));
    await page.goto('file://' + path.join(ROOT, 'index.html'));
    await page.waitForTimeout(1200);
    const cls = await page.evaluate(() => document.documentElement.className);
    ok(['sk-khung-bang', 'sk-nut-vang', 'sk-nut-dong', 'sk-nut-tron', 'sk-thanh-mau-boss', 'sk-thanh-day', 'sk-the-cho', 'sk-nut-doi-cho', 'sk-huy-hieu', 'sk-nen-man-phu'].every((c) => cls.includes(c)), 'có ảnh → bật đủ lớp khung / nút / thanh');
    ok(files.length === 22, 'tools/ui-frames.json: 8 tấm, 22 file');
    await page.evaluate(() => ui.showCampaign(9));
    await page.waitForTimeout(400);
    const cp = await page.evaluate(() => { const im = document.querySelector('.cp-bgimg'); return im && im.complete && im.naturalWidth > 0 && /chuong-thachsanh/.test(im.src); });
    ok(cp, 'màn chọn bản đồ chương Thạch Sanh dùng scenes/chuong-thachsanh.png');
    await page.screenshot({ path: path.join(SHOTS, 'gia-lap-chon-ai.png') });
    await page.evaluate(() => ui.playLevel(11, false));
    await page.waitForSelector('#prep:not([hidden])');
    await page.click('[data-act=prep-go]');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SHOTS, 'gia-lap-tran.png') });
    const r = await page.evaluate(() => { game.wave = 18; ui.finishLevel(false); const im = document.querySelector('#result .res-art img'); return im && /thua-giong/.test(im.src); });
    ok(r, 'màn thua chương Gióng dùng scenes/thua-giong.png khi có ảnh');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SHOTS, 'gia-lap-ket-qua.png') });
    ok(!errors.length, 'không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await browser.close();
  }
  console.log('XONG');
})().catch((e) => { console.error(e); process.exit(1); });
