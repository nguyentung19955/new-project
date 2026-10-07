// v163: màn "Góp ý nhận được" — chỉ tài khoản quản trị (đăng nhập, email ly230595@gmail.com, đã xác minh) thấy nút.
// CLOUD.db giả trả danh sách góp ý mẫu: phân trang 20, lọc loại / trạng thái, đổi trạng thái, ghi chú, xoá có xác nhận,
// ảnh thu nhỏ → xem to, chấm báo số góp ý Mới; tài khoản khác / khách / email chưa xác minh → không có nút; bố cục 3 cỡ màn hình.
const path = require('path');
const { open, ok } = require('../cho-tuong/helpers');
const SHOTS = path.join(__dirname, 'shots');
require('fs').mkdirSync(SHOTS, { recursive: true });

// CLOUD giả: 25 góp ý mẫu (mới nhất trước theo at), ghi lại mọi lệnh vào window.__calls; __deny = true → permission-denied
const fake = (page, user) => page.evaluate((user) => {
  const kinds = ['bug', 'idea', 'balance', 'other'];
  const c = document.createElement('canvas'); c.width = 320; c.height = 180;
  const x = c.getContext('2d'); x.fillStyle = '#2a6'; x.fillRect(0, 0, 320, 180); x.fillStyle = '#fff'; x.fillRect(40, 40, 120, 60);
  const shot = c.toDataURL('image/jpeg', 0.6);
  const base = Date.UTC(2026, 9, 7, 3, 0, 0);   // 10:00 giờ Việt Nam
  window.__fb = Array.from({ length: 25 }, (_, i) => ({ id: 'fb' + i, kind: kinds[i % 4], text: `Góp ý số ${i}: ` + (i === 0 ? 'quái đi xuyên tướng ở khúc cua <b>thứ hai</b>, rất khó chịu khi chơi lâu' : 'nội dung mẫu đủ dài'),
    contact: i % 3 === 0 ? 'zalo 0900' + i : '', shot: i % 5 === 0 ? shot : '', ver: 'v16' + (i % 3), where: i % 2 ? 'Trong trận · Ải 2 Sông · Đợt 7' : 'Menu',
    scr: '844x390@2.0', ua: 'Android 14 · Chrome/120', uid: 'u' + i, guest: i % 2 === 0, at: base - i * 3600e3,
    ...(i === 1 ? { shot: 'data:image/jpeg;base64,x" onerror="window.__xss=1' } : {}),
    ...(i % 4 === 3 ? { status: 'seen' } : i === 5 ? { status: 'done', note: 'đã sửa ở v160' } : {}) }));
  window.__calls = []; window.__deny = false;
  const deny = () => { const e = new Error('Missing or insufficient permissions.'); e.code = 'permission-denied'; return Promise.reject(e); };
  const query = (st) => ({
    orderBy: (f, dir) => { window.__calls.push(['orderBy', f, dir]); return query(st); },
    startAfter: (cur) => query({ ...st, after: cur }),
    limit: (n) => query({ ...st, n }),
    get: () => {
      window.__calls.push(['get', st.n, st.after ? st.after.id : null]);
      if (window.__deny) return deny();
      const all = window.__fb.slice().sort((a, b) => b.at - a.at);
      const from = st.after ? all.findIndex((d) => d.id === st.after.id) + 1 : 0;
      const docs = all.slice(from, from + st.n).map((d) => ({ id: d.id, data: () => { const { id, ...r } = d; return JSON.parse(JSON.stringify(r)); } }));
      return Promise.resolve({ docs });
    },
  });
  CLOUD.push = () => Promise.resolve();
  CLOUD.db = { collection: (name) => ({ ...query({}), add: () => Promise.resolve({ id: 'x' }),
    doc: (id) => ({
      update: (d) => { window.__calls.push(['update', name, id, d]); if (window.__deny) return deny(); Object.assign(window.__fb.find((f) => f.id === id), d); return Promise.resolve(); },
      delete: () => { window.__calls.push(['delete', name, id]); if (window.__deny) return deny(); window.__fb = window.__fb.filter((f) => f.id !== id); return Promise.resolve(); },
    }) }) };
  if (user) Object.assign(user, { sendEmailVerification: () => { window.__verifySent = true; return Promise.resolve(); }, reload: () => Promise.resolve(), getIdToken: () => Promise.resolve('t') });
  CLOUD.user = user; CLOUD.signedIn = !!(user && !user.isAnonymous); CLOUD.ready = !!user;
  CLOUD._emit();
}, user);
const ADMIN = { uid: 'adminUID', isAnonymous: false, email: 'ly230595@gmail.com', emailVerified: true, displayName: 'Ly' };
const calls = (page) => page.evaluate(() => window.__calls);
const settingsBtn = (page) => page.$('#settings [data-act=fba-open]');
const layout = (page) => page.evaluate(() => {
  const vw = innerWidth, vh = innerHeight;
  const sc = document.querySelector('#fbadmin .screen').getBoundingClientRect();
  const over = [...document.querySelectorAll('#fbadmin .fba-item, #fbadmin .fba-item *, #fbadmin .scr-head, #fbadmin .fba-filters')]
    .filter((e) => e.scrollWidth > e.clientWidth + 2 && !['INPUT', 'IMG'].includes(e.tagName) && !e.classList.contains('cp-tabs') && getComputedStyle(e).overflowX !== 'hidden').map((e) => e.className || e.tagName);
  const list = document.querySelector('#fbadmin .fba-list');
  const items = [...document.querySelectorAll('#fbadmin .fba-item')].map((e) => e.getBoundingClientRect());
  return { inView: sc.width <= vw + 1 && sc.height <= vh + 1, over, hScroll: list.scrollWidth > list.clientWidth + 1,
    listH: list.clientHeight, itemsOk: items.every((r) => r.right <= list.getBoundingClientRect().right + 1) };
});

(async () => {
  // ---------- 1. tài khoản không phải quản trị → không thấy gì
  for (const [name, user] of [['khách ẩn danh', { uid: 'g1', isAnonymous: true, email: null, emailVerified: false }],
    ['tài khoản Google khác', { uid: 'o1', isAnonymous: false, email: 'nguoikhac@gmail.com', emailVerified: true }],
    ['email quản trị nhưng ẩn danh (giả mạo trường email)', { uid: 'g2', isAnonymous: true, email: 'ly230595@gmail.com', emailVerified: true }],
    ['chưa đăng nhập', null]]) {
    const { browser, page, errors } = await open(844, 390);
    await fake(page, user);
    await page.click('#btn-settings');
    ok(!(await settingsBtn(page)), `${name}: Cài đặt không có nút "Góp ý nhận được"`);
    ok(!(await page.evaluate(() => document.querySelector('#btn-settings').classList.contains('fba-has'))), `${name}: không có chấm báo trên nút Cài Đặt`);
    ok(!(await page.$('[data-act=fba-verify]')), `${name}: không có nút xác minh email quản trị`);
    await page.evaluate(() => ui.showFbAdmin());
    ok(await page.isHidden('#fbadmin'), `${name}: gọi thẳng ui.showFbAdmin() cũng không mở màn`);
    ok(!(await calls(page)).some((c) => c[0] === 'get'), `${name}: không đọc collection feedback`);
    ok(!errors.length, 'không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await browser.close();
  }
  // ---------- 2. email quản trị chưa xác minh → chỉ có nút "Xác minh email", không có màn xem
  {
    const { browser, page, errors } = await open(844, 390);
    await fake(page, { uid: 'a2', isAnonymous: false, email: 'LY230595@gmail.com', emailVerified: false });
    await page.click('#btn-settings');
    ok(!(await settingsBtn(page)), 'email chưa xác minh: không có nút "Góp ý nhận được"');
    ok(await page.isVisible('[data-act=fba-verify]'), 'email chưa xác minh: có nút "Xác minh email"');
    await page.click('[data-act=fba-verify]'); await page.waitForTimeout(200);
    ok(await page.evaluate(() => window.__verifySent === true), 'bấm → gửi thư xác minh');
    // đã xác minh (giả lập) → bấm lại → nạp lại tài khoản, hiện nút
    await page.evaluate(() => { CLOUD.user.reload = () => { CLOUD.user.emailVerified = true; return Promise.resolve(); }; });
    await page.click('[data-act=fba-verify]'); await page.waitForTimeout(300);
    ok(!!(await settingsBtn(page)), 'xác minh xong bấm lại → hiện nút "Góp ý nhận được"');
    ok(!errors.length, 'không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await browser.close();
  }
  // ---------- 3. quản trị: đầy đủ chức năng
  {
    const { browser, page, errors } = await open(844, 390);
    await fake(page, ADMIN);
    await page.waitForTimeout(200);
    ok(await page.evaluate(() => document.querySelector('#btn-settings').classList.contains('fba-has')), 'quản trị: chấm báo đỏ trên nút Cài Đặt ở menu');
    await page.click('#btn-settings');
    const b = await settingsBtn(page);
    ok(!!b, 'quản trị: Cài đặt có nút "📥 Góp ý nhận được"');
    // 25 mẫu, 50 mục gần nhất: seen = i%4==3 (6 cái), done = fb5 → mới = 25 - 6 - 1 = 18
    ok((await page.textContent('#settings .fba-dot')) === '18', 'chấm báo trên nút = số góp ý Mới (18)');
    await page.screenshot({ path: path.join(SHOTS, 'cai-dat-844x390.png') });
    await b.click(); await page.waitForTimeout(300);
    ok(await page.isVisible('#fbadmin .screen'), 'bấm → mở màn Góp ý nhận được');
    let cs = await calls(page);
    ok(cs.some((c) => c[0] === 'orderBy' && c[1] === 'at' && c[2] === 'desc'), 'truy vấn orderBy at desc');
    ok(cs.filter((c) => c[0] === 'get').pop()[1] === 20, 'trang đầu 20 mục');
    let n = await page.$$eval('#fbadmin .fba-item', (e) => e.length);
    ok(n === 20, '20 góp ý hiện ra');
    const first = await page.$eval('#fbadmin .fba-item', (e) => ({ id: e.dataset.id, txt: e.textContent, html: e.querySelector('.fba-txt').innerHTML, kind: e.querySelector('.fba-kind').textContent,
      kc: getComputedStyle(e.querySelector('.fba-kind')).backgroundColor }));
    ok(first.id === 'fb0', 'mới nhất trước (fb0)');
    ok(first.kind === 'Lỗi' && first.kc !== 'rgba(0, 0, 0, 0)', 'loại "Lỗi" có màu riêng');
    ok(first.txt.includes('10:00') && first.txt.includes('07/10/2026'), 'thời gian theo giờ Việt Nam (10:00 07/10/2026)');
    ok(first.html.includes('&lt;b&gt;') && !first.html.includes('<b>thứ'), 'nội dung được thoát HTML (không chèn mã)');
    ok(first.txt.includes('zalo 0900') && first.txt.includes('v160') && first.txt.includes('Menu') && first.txt.includes('844x390@2.0') && first.txt.includes('Android 14 · Chrome/120') && first.txt.includes('Khách'),
      'hiện liên hệ, phiên bản, màn, cỡ màn hình, UA rút gọn, khách');
    ok((await page.$eval('[data-id=fb1]', (e) => e.textContent)).includes('Đã đăng nhập'), 'góp ý người đã đăng nhập ghi "Đã đăng nhập"');
    ok(!/@[a-z-]+\.[a-z]{2,}/i.test(await page.textContent('#fbadmin')), 'không lộ email nào');
    ok((await page.textContent('#fbadmin .scr-head')).includes('20+ góp ý · 18 mới'), 'tiêu đề: số đã tải + số mới');
    await page.screenshot({ path: path.join(SHOTS, 'man-844x390.png') });
    // ảnh thu nhỏ → xem to → đóng
    ok(await page.isVisible('[data-id=fb0] .fba-thumb img'), 'có ảnh thu nhỏ');
    ok(!(await page.$('[data-id=fb2] .fba-thumb')), 'góp ý không ảnh thì không có ô ảnh');
    ok(!(await page.$('[data-id=fb1] .fba-thumb')) && !(await page.evaluate(() => window.__xss)), 'ảnh không đúng dạng JPEG base64 (chèn mã) → bỏ qua, không chạy mã');
    await page.click('[data-id=fb0] .fba-thumb');
    ok(await page.isVisible('#fbadmin .fba-big img'), 'bấm ảnh → xem to');
    await page.screenshot({ path: path.join(SHOTS, 'anh-to-844x390.png') });
    await page.click('#fbadmin .fba-big');
    ok(!(await page.$('#fbadmin .fba-big')), 'chạm → đóng ảnh to');
    // tải thêm
    await page.click('[data-act=fba-more]'); await page.waitForTimeout(200);
    cs = await calls(page);
    const g2 = cs.filter((c) => c[0] === 'get').pop();
    ok(g2[1] === 20 && g2[2] === 'fb19', 'Tải thêm → trang kế tiếp sau mục cuối (startAfter fb19)');
    n = await page.$$eval('#fbadmin .fba-item', (e) => e.length);
    ok(n === 25, 'đã tải đủ 25 góp ý');
    ok(!(await page.$('[data-act=fba-more]')), 'hết dữ liệu → ẩn nút Tải thêm');
    // lọc loại
    await page.click('[data-act=fba-kind][data-k=idea]');
    let kinds = await page.$$eval('#fbadmin .fba-kind', (e) => [...new Set(e.map((x) => x.textContent))]);
    ok(kinds.length === 1 && kinds[0] === 'Ý tưởng', 'lọc "Ý tưởng" → chỉ còn Ý tưởng');
    ok((await page.$$('#fbadmin .fba-item')).length === 6, '6 góp ý Ý tưởng (fb1, fb5, …, fb21)');
    await page.click('[data-act=fba-kind][data-k=all]');
    // lọc trạng thái
    await page.click('[data-act=fba-stf][data-k=seen]');
    ok((await page.$$('#fbadmin .fba-item')).length === 6, 'lọc "Đã xem" → 6 mục');
    await page.click('[data-act=fba-stf][data-k=done]');
    let ids = await page.$$eval('#fbadmin .fba-item', (e) => e.map((x) => x.dataset.id));
    ok(ids.join() === 'fb5' && (await page.textContent('[data-id=fb5]')).includes('đã sửa ở v160'), 'lọc "Đã xử lý" → fb5 kèm ghi chú');
    await page.click('[data-act=fba-stf][data-k=new]');
    ok((await page.$$('#fbadmin .fba-item')).length === 18, 'lọc "Mới" → 18 mục');
    // đổi trạng thái
    await page.click('[data-id=fb0] [data-act=fba-st][data-k=seen]'); await page.waitForTimeout(150);
    cs = await calls(page);
    let u = cs.filter((c) => c[0] === 'update').pop();
    ok(u && u[1] === 'feedback' && u[2] === 'fb0' && JSON.stringify(u[3]) === '{"status":"seen"}', 'đổi trạng thái → update feedback/fb0 {status:"seen"}');
    ok(!(await page.$('[data-id=fb0]')), 'đang lọc "Mới" → fb0 rời danh sách');
    ok((await page.$$('#fbadmin .fba-item')).length === 17, 'còn 17 mục Mới');
    await page.click('[data-act=fba-stf][data-k=all]');
    await page.click('[data-act=fba-close]');
    ok((await page.textContent('#settings .fba-dot')) === '17', 'chấm báo giảm còn 17');
    await page.click('#settings [data-act=fba-open]'); await page.waitForTimeout(300);
    ok(await page.isVisible('[data-id=fb0] [data-act=fba-st][data-k=seen].on'), 'mở lại: fb0 hiện "Đã xem"');
    // ghi chú
    await page.click('[data-id=fb2] [data-act=fba-note]');
    ok(await page.isVisible('#fba-note-in'), 'bấm Ghi chú → ô nhập ghi chú');
    await page.fill('#fba-note-in', 'để bản sau');
    await page.click('[data-act=fba-note-ok]'); await page.waitForTimeout(150);
    u = (await calls(page)).filter((c) => c[0] === 'update').pop();
    ok(u[2] === 'fb2' && u[3].note === 'để bản sau' && u[3].status === 'new', 'lưu ghi chú → update {status, note}');
    ok((await page.textContent('[data-id=fb2]')).includes('📝 để bản sau'), 'ghi chú hiện trên mục');
    // xoá: xác nhận trong giao diện
    let dialogs = 0; page.on('dialog', (d) => { dialogs++; d.dismiss(); });
    await page.click('[data-id=fb3] [data-act=fba-del]');
    ok(await page.isVisible('[data-id=fb3] [data-act=fba-del-ok]') && (await page.textContent('[data-id=fb3]')).includes('Xoá hẳn'), 'bấm Xoá → hỏi xác nhận ngay trong mục');
    ok(!(await calls(page)).some((c) => c[0] === 'delete'), 'chưa xác nhận thì chưa xoá');
    await page.click('[data-id=fb3] [data-act=fba-del-x]');
    ok(!(await page.$('[data-id=fb3] [data-act=fba-del-ok]')), 'bấm Không → huỷ');
    await page.click('[data-id=fb3] [data-act=fba-del]');
    await page.click('[data-id=fb3] [data-act=fba-del-ok]'); await page.waitForTimeout(150);
    const del = (await calls(page)).filter((c) => c[0] === 'delete').pop();
    ok(del && del[1] === 'feedback' && del[2] === 'fb3', 'xác nhận → delete feedback/fb3');
    ok(!(await page.$('[data-id=fb3]')), 'mục đã xoá biến mất');
    ok(dialogs === 0, 'không dùng confirm() / alert()');
    // lỗi quyền: tài khoản quản trị nhưng máy chủ chưa đăng luật
    await page.evaluate(() => { window.__deny = true; });
    await page.click('[data-id=fb4] [data-act=fba-st][data-k=done]'); await page.waitForTimeout(150);
    ok(/Máy chủ chưa đăng luật mới/.test(await page.textContent('#fbadmin .fba-err')), 'permission-denied (quản trị) → "Máy chủ chưa đăng luật mới"');
    ok(!(await page.isVisible('[data-id=fb4] [data-act=fba-st][data-k=done].on')), 'lỗi thì không đổi trạng thái trên màn');
    await page.click('[data-act=fba-reload]'); await page.waitForTimeout(200);
    ok(/Máy chủ chưa đăng luật mới/.test(await page.textContent('#fbadmin')), 'tải lại bị từ chối → báo rõ');
    await page.evaluate(() => { window.__deny = false; });
    await page.keyboard.press('Escape');
    ok(await page.isHidden('#fbadmin') && await page.isVisible('#settings'), 'Esc → đóng màn, về Cài đặt');
    // đăng xuất → nút biến mất
    await page.evaluate(() => { CLOUD.user = { uid: 'g9', isAnonymous: true }; CLOUD.signedIn = false; CLOUD._emit(); });
    await page.waitForTimeout(100);
    ok(!(await settingsBtn(page)) && !(await page.evaluate(() => document.querySelector('#btn-settings').classList.contains('fba-has'))), 'đổi sang khách → mất nút + chấm báo');
    ok(!errors.length, 'không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await browser.close();
  }
  // ---------- 4. không phải quản trị nhưng gọi thẳng CLOUD.listFeedback → máy chủ từ chối → báo "không có quyền"
  {
    const { browser, page, errors } = await open(844, 390);
    await fake(page, { uid: 'o2', isAnonymous: false, email: 'khac@gmail.com', emailVerified: true });
    const msg = await page.evaluate(async () => { window.__deny = true; try { await CLOUD.listFeedback(); return 'ok'; } catch (e) { return e.message; } });
    ok(msg === 'Tài khoản này không có quyền xem góp ý', 'permission-denied (không phải quản trị) → "Tài khoản này không có quyền xem góp ý"');
    ok(!errors.length, 'không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await browser.close();
  }
  // ---------- 5. bố cục ở nhiều cỡ màn hình
  for (const [w, h] of [[844, 390], [667, 375], [390, 844]]) {
    console.log(`Màn ${w}x${h}`);
    const { browser, page, errors } = await open(w, h);
    await fake(page, ADMIN);
    await page.click('#btn-settings');
    await page.$eval('#settings [data-act=fba-open]', (e) => e.scrollIntoView({ block: 'center' }));
    const row = await page.evaluate(() => {
      const el = document.querySelector('#settings [data-act=fba-open]'), b = el.getBoundingClientRect(), tg = el.closest('.tg').getBoundingClientRect();
      const r = document.createRange(); r.selectNodeContents(el.firstChild); const t = r.getBoundingClientRect();
      // (khi cầm dọc, khung game xoay 90° nên so cả hai trục; chiều cao nút đo bằng offsetHeight)
      const inside = (i, o) => i.left >= o.left - 1 && i.right <= o.right + 1 && i.top >= o.top - 1 && i.bottom <= o.bottom + 1;
      return { inRow: inside(b, tg), cut: !inside(t, b) || el.offsetHeight > 44, h: el.offsetHeight };
    });
    ok(row.inRow && !row.cut, 'Cài đặt: nút "Góp ý nhận được" nằm gọn trong dòng, không cắt chữ' + (row.inRow && !row.cut ? '' : ': ' + JSON.stringify(row)));
    await page.screenshot({ path: path.join(SHOTS, `cai-dat-${w}x${h}.png`) });
    await page.click('#settings [data-act=fba-open]'); await page.waitForTimeout(300);
    let L = await layout(page);
    const good = L.inView && !L.over.length && !L.hScroll && L.itemsOk && L.listH > 120;
    ok(good, 'màn Góp ý nhận được nằm gọn, không tràn ngang, vùng danh sách đủ cao' + (good ? '' : ': ' + JSON.stringify(L)));
    await page.screenshot({ path: path.join(SHOTS, `man-${w}x${h}.png`) });
    await page.click('[data-id=fb0] [data-act=fba-del]');
    await page.click('[data-id=fb1] [data-act=fba-note]');
    L = await layout(page);
    ok(!L.over.length && !L.hScroll, 'đang sửa ghi chú vẫn không tràn' + (L.over.length ? ': ' + JSON.stringify(L.over) : ''));
    await page.click('[data-id=fb0] [data-act=fba-del]');
    L = await layout(page);
    ok(!L.over.length && !L.hScroll, 'đang hỏi xoá vẫn không tràn' + (L.over.length ? ': ' + JSON.stringify(L.over) : ''));
    await page.screenshot({ path: path.join(SHOTS, `xoa-${w}x${h}.png`) });
    ok(!errors.length, 'không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await browser.close();
  }
  console.log('XONG');
})().catch((e) => { console.error(e); process.exit(1); });
