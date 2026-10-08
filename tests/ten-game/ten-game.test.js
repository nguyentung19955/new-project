// v145: kiểm tra đổi tên game "Thần Thoại Việt" — tựa menu, không tràn chữ, tiến trình cũ vẫn đọc được, logo ảnh có/không
const path = require('path');
const { open, ok } = require('../cho-tuong/helpers');
const SHOTS = path.join(__dirname, 'shots');
require('fs').mkdirSync(SHOTS, { recursive: true });

(async () => {
  for (const [w, h] of [[844, 390], [667, 375], [800, 360]]) {
    console.log(`Màn ${w}x${h}`);
    const { browser, page, errors } = await open(w, h, { gold: 4321, unlocked: 5 });
    const r = await page.evaluate(() => {
      const t = document.querySelector('#menu .title'), h1 = t.querySelector('h1');
      const tr = t.getBoundingClientRect(), nav = document.querySelector('#menu .mc-nav').getBoundingClientRect();
      const kids = [...t.querySelectorAll('.logo-txt, p')].map((e) => { const rg = document.createRange(); rg.selectNodeContents(e); return rg.getBoundingClientRect(); });   // khung chữ thật (h1/p là khối rộng 700px)
      const wrap = document.querySelector('#wrap').getBoundingClientRect();
      return { title: document.title, h1: h1.textContent.trim(), sub: t.querySelector('.sub').textContent, manifestTitle: document.querySelector('meta[name=apple-mobile-web-app-title]').content,
        h1Over: h1.scrollWidth > h1.clientWidth + 1, overlapNav: kids.some((k) => k.right > nav.left + 2 && k.left < nav.right - 2 && k.bottom > nav.top + 2 && k.top < nav.bottom - 2),
        inWrap: kids.every((k) => k.left >= wrap.left - 1 && k.right <= wrap.right + 1), lines: Math.round(h1.getBoundingClientRect().height / parseFloat(getComputedStyle(h1).fontSize)),
        unlocked: ui.save.unlocked, rot: document.querySelector('#wrap').classList.contains('rot'), rotateTxt: document.querySelector('#rotate').textContent, legacy: document.body.textContent.includes('Núi Cao Nước Dâng') };
    });
    ok(r.title === 'Thần Thoại Việt', 'tiêu đề trang = Thần Thoại Việt');
    ok(r.h1 === 'Thần Thoại Việt' && /Văn Lang/.test(r.sub), 'tựa menu + dòng phụ mới');
    ok(!r.legacy, 'không còn chữ "Núi Cao Nước Dâng" trên trang');
    ok(r.unlocked === 5, 'tiến trình cũ (nuicao.v1) vẫn đọc được');
    
    ok(/Thần Thoại Việt/.test(r.rotateTxt), 'thông báo xoay màn hình dùng tên mới');
    ok(!r.h1Over && r.inWrap, 'tựa không tràn khỏi khung');
    ok(!r.overlapNav, 'chữ tựa không đè bảng nút menu');
    await page.screenshot({ path: path.join(SHOTS, `menu-${w}x${h}.png`) });
    ok(!errors.length, 'không lỗi trang' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await browser.close();
  }
  // logo ảnh: giả lập có file logo-tua.png → ẩn chữ HTML; không có → giữ chữ
  {
    const { browser, page } = await open(844, 390);
    const r = await page.evaluate(() => new Promise((res) => {
      const h1 = document.querySelector('#menu-logo');
      const c = document.createElement('canvas'); c.width = 1024; c.height = 384; const x = c.getContext('2d'); x.fillStyle = '#C9963A'; x.fillRect(100, 100, 824, 184);
      h1.insertAdjacentHTML('afterbegin', `<img class="logo-img" src="${c.toDataURL()}" hidden onload="this.hidden=false;this.parentNode.classList.add('has-img')" onerror="this.remove()">`);
      const before = !document.querySelector('#menu-logo img[src^="assets"]');
      setTimeout(() => res({ noMissing: before, hasImg: h1.classList.contains('has-img'), txtHidden: getComputedStyle(h1.querySelector('.logo-txt')).display === 'none', w: h1.querySelector('.logo-img:not([hidden])')?.getBoundingClientRect().width }), 300);
    }));
    ok(r.noMissing, 'thiếu assets/ui/logo-tua.png → ảnh tự gỡ, giữ chữ HTML');
    ok(r.hasImg && r.txtHidden && r.w > 100, 'có ảnh logo → hiện ảnh, ẩn chữ');
    await page.screenshot({ path: path.join(SHOTS, 'menu-logo-gia-lap.png') });
    await browser.close();
  }
  console.log('XONG');
})().catch((e) => { console.error(e); process.exit(1); });
