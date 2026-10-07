// v149: kiểm tra nút Góp ý — mở từ menu / cài đặt / menu ☰ trong trận, dữ liệu gửi Firestore (CLOUD.db giả),
// hàng đợi khi ngoại tuyến + gửi lại, giới hạn 1 góp ý / 60 giây và 10 / ngày, bố cục không tràn, không lỗi trang.
const path = require('path');
const { open, enter, ok } = require('../cho-tuong/helpers');
const SHOTS = path.join(__dirname, 'shots');
require('fs').mkdirSync(SHOTS, { recursive: true });

// CLOUD giả: ghi nhận mọi lệnh add vào window.__adds; __mode = 'ok' | 'fail'
const fakeCloud = (page, ready) => page.evaluate((ready) => {
  window.__adds = window.__adds || []; window.__mode = window.__mode || 'ok';
  CLOUD.push = () => Promise.resolve();
  CLOUD.user = { uid: 'anonUID123', isAnonymous: true, email: 'nguoichoi@example.com', displayName: '' };
  CLOUD.db = { collection: (name) => ({ add: (doc) => { if (window.__mode !== 'ok') return Promise.reject(new Error('unavailable')); window.__adds.push({ name, doc }); return Promise.resolve({ id: 'x' }); } }) };
  CLOUD.ready = ready;
}, ready);
const store = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('nuicao.feedback') || '{}'));
const unlimit = (page) => page.evaluate(() => { const s = JSON.parse(localStorage.getItem('nuicao.feedback') || '{}'); s.last = Date.now() - 61000; localStorage.setItem('nuicao.feedback', JSON.stringify(s)); });
const toastTxt = (page) => page.evaluate(() => document.querySelector('#toasts').textContent);
// bố cục: bảng nằm trong màn hình, không phần tử nào tràn ngang
const layout = (page) => page.evaluate(() => {
  const box = document.querySelector('.fb-box').getBoundingClientRect();
  const vw = innerWidth, vh = innerHeight;
  const inView = box.left >= -1 && box.top >= -1 && box.right <= vw + 1 && box.bottom <= vh + 1;
  const over = [...document.querySelectorAll('.fb-box, .fb-box *')].filter((e) => e.scrollWidth > e.clientWidth + 2 && !['TEXTAREA', 'INPUT', 'IMG'].includes(e.tagName) && getComputedStyle(e).overflowX !== 'hidden' && !e.classList.contains('fb-box'))
    .map((e) => e.className || e.tagName);
  const b = document.querySelector('.fb-box');
  const send = document.querySelector('[data-act=fb-send]').getBoundingClientRect();
  return { inView, over, hScroll: b.scrollWidth > b.clientWidth + 1, sendVisible: Math.max(send.width, send.height) > 40 && Math.min(send.width, send.height) > 24 };
});
const typeSend = async (page, text, opts = {}) => {
  if (opts.kind) await page.click(`[data-act=fb-kind][data-k=${opts.kind}]`);
  await page.fill('#fb-text', text);
  if (opts.contact !== undefined) await page.fill('#fb-contact', opts.contact);
  await page.click('[data-act=fb-send]');
  await page.waitForTimeout(250);
};

(async () => {
  // ---------- 1. menu: ngoại tuyến → hàng đợi → có mạng thì tự gửi
  {
    const { browser, page, errors } = await open(844, 390);
    await fakeCloud(page, false);
    const nav = await page.evaluate(() => {
      const n = document.querySelector('#menu .mc-nav').getBoundingClientRect();
      return [...document.querySelectorAll('.mc-subs .mc-sub')].map((b) => { const r = b.getBoundingClientRect(); return { t: b.textContent.trim(), inNav: r.left >= n.left - 1 && r.right <= n.right + 1, cut: b.scrollWidth > b.clientWidth + 1 }; });
    });
    ok(nav.length === 3 && nav[2].t.includes('Góp ý'), 'menu: nút Góp ý cạnh Bách khoa / Xếp hạng');
    ok(nav.every((x) => x.inNav && !x.cut), 'menu: 3 liên kết nhỏ nằm gọn trong bảng nút, không bị cắt chữ');
    await page.screenshot({ path: path.join(SHOTS, 'menu-844x390.png') });
    await page.click('#btn-feedback');
    ok(await page.isVisible('#feedback .fb-box'), 'bấm Góp ý trên menu → mở bảng góp ý');
    ok(!(await page.$('.fb-shot')), 'ở menu (không trong trận) không có ô đính kèm ảnh');
    ok(/ngoại tuyến/i.test(await page.textContent('.fb-note')), 'Firebase chưa sẵn sàng → báo đang ngoại tuyến');
    await page.fill('#fb-text', 'ngắn');
    ok((await page.textContent('#fb-count')) === '4/1000', 'đếm ký tự 4/1000');
    await page.click('[data-act=fb-send]');
    ok(/ít nhất 10/.test(await page.textContent('#fb-err')), 'dưới 10 ký tự → báo lỗi, không gửi');
    ok((await page.inputValue('#fb-text')) === 'ngắn', 'giữ nguyên chữ đã gõ sau khi báo lỗi');
    await page.fill('#fb-text', 'x'.repeat(1200));
    ok((await page.inputValue('#fb-text')).length === 1000, 'tối đa 1000 ký tự');
    await typeSend(page, 'Nút Xuất Quân hơi khó bấm trên máy nhỏ', { kind: 'idea', contact: 'zalo 0900' });
    ok(await page.isHidden('#feedback'), 'gửi xong đóng bảng');
    ok(/Đã lưu góp ý.*sẽ gửi khi có mạng/.test(await toastTxt(page)), 'ngoại tuyến → toast "Đã lưu góp ý, sẽ gửi khi có mạng"');
    let s = await store(page);
    ok(s.queue.length === 1 && s.n === 1, 'góp ý nằm trong hàng đợi localStorage');
    ok((await page.evaluate(() => window.__adds.length)) === 0, 'chưa gọi Firestore khi ngoại tuyến');
    // có mạng lại
    await page.evaluate(() => { CLOUD.ready = true; window.dispatchEvent(new Event('online')); });
    await page.waitForTimeout(300);
    const adds = await page.evaluate(() => window.__adds);
    ok(adds.length === 1 && adds[0].name === 'feedback', 'có mạng → tự gửi góp ý đang chờ vào collection feedback');
    const d = adds[0].doc;
    const keys = Object.keys(d).sort().join(',');
    ok(keys === 'at,contact,guest,kind,scr,shot,text,ua,uid,ver,where', 'đúng các trường: ' + keys);
    ok(d.kind === 'idea' && d.text === 'Nút Xuất Quân hơi khó bấm trên máy nhỏ' && d.contact === 'zalo 0900', 'loại / nội dung / liên hệ đúng');
    ok(d.uid === 'anonUID123' && d.guest === true, 'uid ẩn danh, đánh dấu khách');
    ok(!JSON.stringify(d).includes('@example.com'), 'KHÔNG gửi email người dùng');
    ok(/^v\d+$/.test(d.ver) && d.where === 'Menu' && /^844x390@/.test(d.scr) && d.ua.length <= 160 && d.ua.length > 3, `thông tin kỹ thuật: ${d.ver} · ${d.where} · ${d.scr} · ${d.ua}`);
    ok(d.shot === '', 'không kèm ảnh khi gửi từ menu');
    s = await store(page);
    ok(s.queue.length === 0, 'gửi được thì xoá khỏi hàng đợi');
    ok(/Đã gửi 1 góp ý đang chờ/.test(await toastTxt(page)), 'toast báo đã gửi góp ý đang chờ');
    // giới hạn 60 giây
    await page.click('#btn-feedback');
    await typeSend(page, 'Góp ý thứ hai gửi ngay lập tức');
    ok(/đợi \d+ giây/.test(await page.textContent('#fb-err')), 'gửi lại trong 60 giây → bị chặn, báo đợi');
    ok((await page.evaluate(() => window.__adds.length)) === 1, 'không gửi khi bị chặn');
    await unlimit(page);
    await typeSend(page, 'Góp ý thứ hai sau 61 giây', { kind: 'balance' });
    ok((await page.evaluate(() => window.__adds.length)) === 2 && /Cảm ơn bạn đã góp ý/.test(await toastTxt(page)), 'qua 60 giây → gửi thẳng, toast cảm ơn');
    // giới hạn 10 / ngày
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('nuicao.feedback')); s.n = 10; s.last = 0; localStorage.setItem('nuicao.feedback', JSON.stringify(s)); });
    await page.click('#btn-feedback');
    await typeSend(page, 'Góp ý thứ mười một trong ngày');
    ok(/Hôm nay đã gửi 10/.test(await page.textContent('#fb-err')), 'quá 10 góp ý / ngày → bị chặn');
    // sang ngày mới thì đếm lại
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('nuicao.feedback')); s.day = 'Mon Jan 01 2001'; localStorage.setItem('nuicao.feedback', JSON.stringify(s)); });
    await page.click('[data-act=fb-send]'); await page.waitForTimeout(250);
    ok((await page.evaluate(() => window.__adds.length)) === 3, 'sang ngày mới → gửi được tiếp');
    // gửi lỗi (Firestore từ chối) → vào hàng đợi
    await unlimit(page);
    await page.evaluate(() => { window.__mode = 'fail'; });
    await page.click('#btn-feedback');
    await typeSend(page, 'Lỗi mạng giữa chừng khi gửi', { kind: 'bug' });
    s = await store(page);
    ok(s.queue.length === 1 && /sẽ gửi khi có mạng/.test(await toastTxt(page)), 'Firestore báo lỗi → lưu hàng đợi, báo rõ');
    await page.evaluate(() => { window.__mode = 'ok'; });
    await page.click('#btn-feedback');   // mở lại bảng cũng thử gửi hàng đợi
    await page.waitForTimeout(300);
    ok((await store(page)).queue.length === 0 && (await page.evaluate(() => window.__adds.length)) === 4, 'mở lại bảng khi đã có mạng → gửi nốt hàng đợi');
    await page.keyboard.press('Escape');
    ok(await page.isHidden('#feedback'), 'phím Esc đóng bảng');
    ok(!errors.length, 'không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await browser.close();
  }
  // ---------- 2. Cài đặt + trong trận ở nhiều cỡ màn hình
  for (const [w, h] of [[844, 390], [667, 375], [390, 844]]) {
    console.log(`Màn ${w}x${h}`);
    const { browser, page, errors } = await open(w, h);
    await fakeCloud(page, true);
    if (w < h) {
      ok(await page.evaluate(() => document.querySelector('#wrap').classList.contains('rot')), 'cầm dọc: khung game xoay ngang');
      const nav = await page.evaluate(() => [...document.querySelectorAll('.mc-subs .mc-sub')].every((b) => b.scrollWidth <= b.clientWidth + 1));
      ok(nav, 'menu xoay dọc: liên kết nhỏ không bị cắt chữ');
    }
    // Cài đặt (menu)
    await page.click('#btn-settings');
    await page.click('[data-act=set-feedback]');
    ok(await page.isVisible('#feedback .fb-box'), 'Cài đặt → nút Góp ý mở bảng');
    let L = await layout(page);
    ok(L.inView && !L.over.length && !L.hScroll && L.sendVisible, 'bảng góp ý (cài đặt) nằm gọn màn hình, không tràn' + (L.inView && !L.over.length && !L.hScroll && L.sendVisible ? '' : ': ' + JSON.stringify(L)));
    await page.screenshot({ path: path.join(SHOTS, `cai-dat-${w}x${h}.png`) });
    await page.click('.fb-foot [data-act=fb-close]');
    ok(await page.isHidden('#feedback') && await page.isVisible('#settings'), 'Huỷ → về lại Cài đặt');
    await page.click('#settings [data-act=set-close]');
    // trong trận
    await enter(page, 0);
    await page.click('#btn-run');
    await page.waitForTimeout(1500);
    await page.click('#btn-menu');
    ok(await page.isVisible('#drawer [data-k=feedback]'), 'menu ☰ trong trận có mục Góp ý');
    await page.click('#drawer [data-k=feedback]');
    ok(await page.isVisible('#feedback .fb-box'), 'menu ☰ → mở bảng góp ý');
    ok(await page.evaluate(() => !game.running), 'đang gõ góp ý thì trận tạm dừng');
    ok(await page.isVisible('.fb-shot.on'), 'trong trận: có ảnh chụp, mặc định đính kèm');
    L = await layout(page);
    ok(L.inView && !L.over.length && !L.hScroll && L.sendVisible, 'bảng góp ý (trong trận, có ảnh) nằm gọn màn hình' + (L.inView && !L.over.length && !L.hScroll && L.sendVisible ? '' : ': ' + JSON.stringify(L)));
    await page.fill('#fb-text', 'Quái đi xuyên qua tướng ở khúc cua thứ hai');
    await page.screenshot({ path: path.join(SHOTS, `tran-${w}x${h}.png`) });
    // phím tắt không ăn khi đang gõ
    await page.click('[data-act=fb-send]'); await page.waitForTimeout(250);
    const d = await page.evaluate(() => window.__adds[window.__adds.length - 1].doc);
    ok(/^data:image\/jpeg;base64,/.test(d.shot) && d.shot.length <= 150000, `ảnh chụp JPEG ≤ 150KB (${Math.round(d.shot.length / 1024)}KB)`);
    const dim = await page.evaluate((src) => new Promise((r) => { const i = new Image(); i.onload = () => r([i.width, i.height]); i.src = src; }), d.shot);
    ok(dim[0] <= 640 && dim[0] > 100, `ảnh thu nhỏ ≤ 640px rộng (${dim.join('x')})`);
    ok(/^Trong trận · Ải 1 .* · Đợt \d+/.test(d.where), 'ghi màn / ải / đợt: ' + d.where);
    ok(await page.evaluate(() => game.running), 'gửi xong trận chạy tiếp');
    // bỏ chọn ảnh
    await unlimit(page);
    await page.click('#btn-menu'); await page.click('#drawer [data-k=feedback]');
    await page.click('[data-act=fb-shot]');
    ok(await page.isVisible('.fb-shot:not(.on)'), 'bấm ô ảnh → bỏ đính kèm');
    ok((await page.inputValue('#fb-text')) === '', 'gửi xong thì bảng mới để trống');
    await page.fill('#fb-text', 'Lần này không gửi kèm ảnh nhé');
    await page.click('[data-act=fb-send]'); await page.waitForTimeout(250);
    ok((await page.evaluate(() => window.__adds[window.__adds.length - 1].doc.shot)) === '', 'bỏ chọn → không gửi ảnh');
    // Tạm dừng → Góp ý
    await unlimit(page);
    await page.click('#btn-menu'); await page.click('#drawer [data-k=pause]');
    await page.click('[data-act=set-feedback]');
    ok(await page.isVisible('#feedback .fb-box'), 'Tạm dừng → Góp ý mở bảng');
    await page.click('.fb-head [data-act=fb-close]');
    ok(await page.evaluate(() => !game.running) && await page.isVisible('#settings'), 'đóng góp ý khi đang Tạm dừng → trận vẫn dừng');
    ok(!errors.length, 'không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await browser.close();
  }
  // ---------- 3. giống bản thử trên claude.ai: Firebase bật nhưng không tải được thư viện → vẫn mở bảng, lưu hàng đợi, không lỗi
  {
    const { chromium } = require('/opt/node-tools/node_modules/playwright');
    const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
    const page = await (await browser.newContext({ viewport: { width: 844, height: 390 } })).newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.route('**/firebase-config.js*', (r) => r.fulfill({ contentType: 'application/javascript', body: "const FIREBASE_CONFIG={apiKey:'x',projectId:'p'};" }));
    await page.route('**/gstatic.com/**', (r) => r.abort());
    await page.addInitScript(() => localStorage.setItem('nuicao.v1', JSON.stringify({ unlocked: 5, storySeen: true, settings: { skipStory: true } })));
    await page.goto('file://' + path.resolve(__dirname, '../../index.html'));
    await page.waitForTimeout(1200);
    // màn đăng nhập báo lỗi kết nối → chơi ngoại tuyến
    const off = await page.$('[data-act=login-offline]');
    if (off) await off.click();
    await page.click('#btn-feedback');
    ok(await page.isVisible('#feedback .fb-box'), 'không kết nối được Firebase: nút vẫn mở bảng góp ý');
    await typeSend(page, 'Thử gửi khi không có Firebase');
    const s = await store(page);
    ok(s.queue.length === 1 && /sẽ gửi khi có mạng/.test(await toastTxt(page)), 'lưu hàng đợi + báo rõ');
    ok(!errors.length, 'không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await browser.close();
  }
  console.log('XONG');
})().catch((e) => { console.error(e); process.exit(1); });
