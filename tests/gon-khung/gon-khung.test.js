// claude/gon-khung: mọi màn trong khung 844×390 — nút hành động chính KHÔNG nằm ngoài khung / trong vùng phải cuộn mới thấy
// (danh sách dài như thẻ tướng, món đồ, công thức được cuộn; nút Khắc / Nâng / Mua / Mở / Hợp thể / Chọn / Đóng… luôn nhìn thấy).
// Chạy: node tests/gon-khung/gon-khung.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const SAVE = { unlocked: 20, owned: ['giong', 'thachsanh', 'caolo', 'lachau', 'llq', 'kimquy', 'antiem'], kho: 50000, tuvi: { giong: 40, llq: 5 }, heroRunes: { giong: { n_dmg: 1 } } };   // có Tu Vi + ấn đã khắc → khung Ấn Phù nhiều chữ nhất
// phần tử là MỤC trong danh sách (được phép nằm trong vùng cuộn)
const LIST = '.ro-card, .rn-node, .bk-card, .boss-card, .hx-card, .hx-card *, .slot, .rc-item, [data-act=recipe], [data-act=tr-it], [data-act=ro-sel], [data-act=bk-sel], .set-list *, .ho-list *, .vt-body *, .es *, .sh-card, .sh-card *, .bt-row *, .lg-sys *, .kvt *, .res-table *, .sec-list *, .cp-scroll *, .rl-filter *, .hs-bar *, .tabs .tab';
const audit = (page, root) => page.evaluate(([root, LIST]) => {
  const g = document.querySelector('#wrap').getBoundingClientRect(), bad = [];
  for (const e of document.querySelectorAll(`${root} [data-act], ${root} button`)) {
    if (!e.offsetParent || e.closest('[hidden]') || getComputedStyle(e).visibility === 'hidden' || e.disabled && !e.matches('.btn-gold')) continue;
    if (e.matches(LIST)) continue;
    const q = e.getBoundingClientRect(); if (!q.width || !q.height) continue;
    let v = { l: g.left, t: g.top, r: g.right, b: g.bottom }, a = e.parentElement;
    let inScroll = false;
    while (a && a.id !== 'wrap') { const cs = getComputedStyle(a); if (/(auto|scroll|hidden)/.test(cs.overflowY + cs.overflowX)) { const r = a.getBoundingClientRect(); v = { l: Math.max(v.l, r.left), t: Math.max(v.t, r.top), r: Math.min(v.r, r.right), b: Math.min(v.b, r.bottom) }; }
      // nằm trong vùng cuộn đang tràn (máy thật chữ to hơn một chút là bị đẩy khuất) → coi như phải cuộn mới thấy
      // kiểm theo CẤU TRÚC (máy thật font khác → chiều cao chữ khác): nút nằm trong khung cuộn được mà ở nửa dưới khung
      // = máy chữ to hơn sẽ bị đẩy khuất → phải ghim ra ngoài vùng cuộn. Nút ở đầu khung cuộn (nhìn thấy ngay) thì được.
      // (khung cuộn cao ≥ 60% khung game và nội dung gần đầy — hộp nhỏ co theo nội dung như đăng nhập thì không tính)
      if (/(auto|scroll)/.test(cs.overflowY) && a.scrollHeight >= a.clientHeight * 0.9 && a.getBoundingClientRect().height >= g.height * 0.6 && q.top - a.getBoundingClientRect().top > a.clientHeight * 0.45) inScroll = true;
      a = a.parentElement; }
    if (inScroll || q.left < v.l - 2 || q.top < v.t - 2 || q.right > v.r + 2 || q.bottom > v.b + 2) bad.push(`${e.dataset.act || e.className}${inScroll ? ' (trong vùng cuộn)' : ''} "${e.textContent.trim().slice(0, 20)}"`);
  }
  return [...new Set(bad)];
}, [root, LIST]);
const inGame = async (page) => { await enter(page, 0, true); await page.evaluate(() => { game.running = false; game.gold = 9999; const s = game.freeSlots()[0]; game.placeHero(s, 'lactuong'); ui.sel = s; ui.sig = {}; }); };
const SCREENS = [
  ['menu', '#menu', async () => {}],
  ['dang-nhap', '#login', (p) => p.evaluate(() => ui.showLogin(true))],
  ['anh-hung', '#roster', (p) => p.evaluate(() => ui.showRoster())],
  ['anh-hung-khoa', '#roster', async (p) => { await p.evaluate(() => ui.showRoster()); await p.waitForTimeout(300); await p.evaluate(() => { const c = [...document.querySelectorAll('#roster [data-act=ro-sel]')].find((x) => /khoá|khóa|lock/i.test(x.className + x.innerHTML)) || document.querySelectorAll('#roster [data-act=ro-sel]')[40]; c && c.click(); }); }],
  ['than-khi', '#roster', async (p) => { await p.evaluate(() => { ui.showRoster(); ui.legacyHero = 'giong'; ui.renderLegacy && ui.renderLegacy(); }); }],
  ['an-phu', '#runes', (p) => p.evaluate(() => ui.showRunes(false, 'giong'))],
  ['kho-bau', '#treasury', (p) => p.evaluate(() => ui.showTreasury())],
  ['bach-khoa', '#screen', (p) => p.evaluate(() => ui.openScreen('codex', { top: true }))],
  ['cai-dat', '#settings', (p) => p.evaluate(() => ui.showSettings())],
  ['gop-y', '#feedback', (p) => p.evaluate(() => ui.showFeedback('menu'))],
  ['cay-ky-nang', '#screen', async (p) => { await inGame(p); await p.evaluate(() => ui.openScreen('skills')); }],
  ['tui-do', '#screen', async (p) => { await inGame(p); await p.evaluate(() => ui.openScreen('bag', { slot: null })); }],
  ['tien-hoa', '#screen', async (p) => { await inGame(p); await p.evaluate(() => ui.openScreen('evo')); }],
  ['lo-duc', '#screen', async (p) => { await inGame(p); await p.evaluate(() => ui.openScreen('forge')); }],
  ['hop-the', '#legends', async (p) => { await inGame(p); await p.evaluate(() => ui.openLegends(true)); }],
  ['sinh-le', '#reward', async (p) => { await inGame(p); await p.evaluate(() => { const o = game.bossRewards('thuongluong'); ui.showReward({ type: 'reward', boss: 'thuongluong', options: o, id: 1 }); }); await p.waitForTimeout(1300); }],
  ['ket-qua', '#result', async (p) => { await inGame(p); await p.evaluate(() => { game.wave = 15; game.lives = 0; game.over = true; game.events.push({ type: 'defeat' }); }); await p.waitForTimeout(1400); }],
];
(async () => {
  for (const [w, h] of [[844, 390], [667, 375]]) {
    const { browser, page, errors } = await open(w, h, SAVE);
    for (const [name, root, f] of SCREENS) {
      await page.evaluate(() => { localStorage.setItem('nuicao.v1', localStorage.getItem('nuicao.v1')); });
      await page.reload(); await page.waitForTimeout(900);
      await f(page); await page.waitForTimeout(600);
      const bad = await audit(page, root);
      await page.screenshot({ path: path.join(SHOT, `${name}-${w}x${h}.png`) });
      ok(!bad.length, `${w}×${h} ${name}: nút hành động nằm trọn khung, không phải cuộn ${bad.slice(0, 4).join(' | ')}`);
    }
    ok(!errors.length, `${w}×${h}: không lỗi JS ${errors.slice(0, 2)}`);
    await browser.close();
  }
  console.log('PASS gon-khung');
})().catch((e) => { console.error(e); process.exit(1); });
