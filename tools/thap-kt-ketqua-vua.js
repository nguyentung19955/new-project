// TURRET MERGE — kiểm MÀN KẾT QUẢ "VỪA MỘT MÀN" (06/11: iPhone thua wave 42 phải cuộn mới thấy nút; bỏ "WHAT BROKE THROUGH").
// Mỗi cỡ màn × mỗi chế độ (SOLO / CO-OP / PVP thua+thắng, ONLINE REMATCH·LOBBY·HOME, ONLINE bạn rời, PVP online xử thắng):
//   · mọi nút hiện của .bang-nut nằm TRỌN trong khung nhìn VÀ trong #wrap, không bị nội dung đè (elementFromPoint ở giữa nút)
//   · .bang không tràn (scrollHeight ≤ clientHeight + 1) · hàng thưởng 1 dòng (không xuống dòng)
//   · không còn chữ huấn luyện: WHAT BROKE THROUGH / FIX FOR NEXT RUN / WHAT GOT THROUGH / TRY NEXT / MOST LIVES LOST
//   · không lỗi trang.
// Chạy (gốc repo): python3 -m http.server 8765 &   rồi   node tools/thap-kt-ketqua-vua.js
//   OUT=docs/demo-hop-tuong/tuvan/ketqua_vua/ (ảnh) · SIZES=390x844x3 · KHONG_CHUP=1 (không lưu ảnh) · WEBKIT=1 (thử WebKit nếu có)
const pw = require('playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:8765/thap/';
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/ketqua_vua/';
const SIZES = (process.env.SIZES || '360x640x3,390x844x3,430x932x3,820x1180x2,1280x800x1').split(',').map(s => s.split('x').map(Number));
const KHONG_CHUP = !!process.env.KHONG_CHUP;
const DECK = 'canon,bang,tia,set,lien', DECK2 = 'drone,bao,kiembang,hydra,anhsang';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
if (!KHONG_CHUP) fs.mkdirSync(OUT, { recursive: true });
let hong = 0, dat = 0;
const kt = (dk, s) => { if (dk) dat++; else hong++; console.log((dk ? '  ✓ ' : '  ✗ ') + s); };

// dựng màn kết quả của một ca (trong trang)
const DUNG = ({ thang, onl }) => {
  document.getElementById('ketqua').hidden = true; G.ketThuc = null; G.het = false;
  G.wave = 42;
  if (KQ.m) { KQ.m.trum = 3; const tk = Object.keys(TRUM)[0]; KQ.m.lot = { ['trum:' + tk]: 2, bay: 1 }; }
  if (onl) {
    KQO.ctx = { che: onl.che, code: 'ABCD', host: true, me: 'x', ban: 'y', tenBan: 'Linh', k0: 'k', roi: onl.roi || null, phongMat: false };
  } else KQO.ctx = null;
  if (!thang && !onl) G.ban[0].tim = 0;
  if (onl && onl.tim0) G.ban[0].tim = 0;
  ketThuc(!!thang, thang ? '' : TEXT.end.coreDown);
  if (!KQO._bc) KQO._bc = KQO.banCon; KQO.banCon = KQO._bc;
  if (onl && onl.con) { KQO.banCon = () => true; KQO.sau = KQO.sau || { toiRe: false, banRe: false, banO: 'kq', off: [] }; KQO.sau.banO = 'kq'; KQO.veNut(); }
};
const DO = () => {
  const kq = document.getElementById('ketqua'), bang = kq.querySelector('.bang'), wrap = document.getElementById('wrap').getBoundingClientRect();
  const vis = (e) => e && !e.hidden && e.offsetParent !== null && e.getBoundingClientRect().height > 0;
  const nut = [...kq.querySelectorAll('.bang-nut button')].filter(vis).map(b => {
    const r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, h = document.elementFromPoint(x, y);
    return { t: b.textContent.trim(), top: r.top, bot: r.bottom, l: r.left, r: r.right, trongVp: r.top >= -0.5 && r.bottom <= innerHeight + 0.5 && r.left >= -0.5 && r.right <= innerWidth + 0.5,
      trongWrap: r.top >= wrap.top - 0.5 && r.bottom <= wrap.bottom + 0.5, bam: !!h && (h === b || b.contains(h)) };
  });
  const th = kq.querySelector('.tb-kq-h'), ths = th ? [...th.children].map(c => { const r = c.getBoundingClientRect(); return r.top + r.height / 2; }) : [];
  return { hien: !kq.hidden, nut, tran: bang.scrollHeight - bang.clientHeight, chu: kq.textContent, motDong: !ths.length || Math.max(...ths) - Math.min(...ths) < 6, soThuong: ths.length, ten: (document.getElementById('kq-ten') || {}).textContent };
};

(async () => {
  let bt = pw.chromium, ten = 'chromium';
  if (process.env.WEBKIT) { try { const x = await pw.webkit.launch(); await x.close(); bt = pw.webkit; ten = 'webkit'; } catch (e) { console.log('(WebKit không có — dùng Chromium)'); } }
  const b = await bt.launch();
  const CA = [
    ['solo', 'solo_defeat', { thang: false }], ['solo', 'solo_victory', { thang: true }],
    ['coop', 'coop_defeat', { thang: false }], ['coop', 'coop_victory', { thang: true }],
    ['pvp', 'pvp_defeat', { thang: false }], ['pvp', 'pvp_victory', { thang: true }],
    ['coop', 'online_defeat_rematch', { thang: false, onl: { che: 'coop', con: true, tim0: true } }],
    ['coop', 'online_ban_roi', { thang: false, onl: { che: 'coop', roi: { wave: 30, vinh: true } } }],
    ['pvp', 'online_pvp_xu_thang', { thang: false, onl: { che: 'pvp', roi: { wave: 30, vinh: true } } }],
  ];
  for (const [W, H, D] of SIZES) {
    const co = W + 'x' + H;
    console.log('== ' + co + ' (' + ten + ')');
    const dev = W === 390 && H === 844 && pw.devices['iPhone 13'] ? Object.assign({}, pw.devices['iPhone 13'], { viewport: { width: W, height: H } }) : { viewport: { width: W, height: H }, deviceScaleFactor: D, hasTouch: D > 1, isMobile: D > 1 && W < 800 && ten === 'chromium' };
    if (ten !== 'chromium') delete dev.isMobile;
    let che0 = null, ctx = null, p = null, errs = [];
    for (const [che, ca, o] of CA) {
      if (che !== che0) {
        if (ctx) await ctx.close();
        ctx = await b.newContext(dev); await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true, boQua: true, buoc: {} })); } catch (e) { } });
        p = await ctx.newPage(); errs = [];
        p.on('pageerror', e => errs.push(e.message));
        await p.goto(`${BASE}?mode=${che}&deck=${DECK}&deck2=${DECK2}&mana=0&notut=1&nointro=1`, { waitUntil: 'load' });
        await p.waitForFunction(() => typeof G !== 'undefined' && G.ban && G.ban.length && typeof TAI !== 'undefined' && !TAI.cho && !document.getElementById('cv').hidden, null, { timeout: 45000 });
        await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }).catch(() => { });
        await sleep(800); che0 = che;
      }
      await p.evaluate(DUNG, o); await sleep(1300);
      const m = await p.evaluate(DO);
      const nh = co + ' ' + ca;
      kt(m.hien && m.nut.length >= 2, nh + ': màn kết quả hiện, ' + m.nut.length + ' nút (' + m.nut.map(x => x.t).join(' · ') + ')');
      kt(m.nut.every(x => x.trongVp && x.trongWrap), nh + ': mọi nút nằm trọn trong màn ' + JSON.stringify(m.nut.filter(x => !x.trongVp || !x.trongWrap).map(x => [x.t, Math.round(x.top), Math.round(x.bot)])));
      kt(m.nut.every(x => x.bam), nh + ': không nút nào bị che ' + JSON.stringify(m.nut.filter(x => !x.bam).map(x => x.t)));
      kt(m.tran <= 1, nh + ': bảng không tràn/cuộn (dư ' + m.tran + ' px)');
      kt(m.motDong, nh + ': thưởng 1 dòng (' + m.soThuong + ' mục)');
      kt(!/WHAT BROKE THROUGH|FIX FOR NEXT RUN|WHAT GOT THROUGH|TRY NEXT|MOST LIVES LOST/.test(m.chu), nh + ': không còn chữ huấn luyện');
      if (!KHONG_CHUP) await p.screenshot({ path: OUT + co + '_' + ca + '.png' });
      kt(!errs.length, nh + ': không lỗi trang ' + errs.slice(0, 2).join(' | '));
      errs.length = 0;
    }
    if (ctx) await ctx.close();
  }
  await b.close();
  console.log((hong ? '✗ ' : '✓ ') + 'màn kết quả vừa một màn: ' + dat + ' đạt, ' + hong + ' trượt');
  process.exit(hong ? 1 : 0);
})().catch(e => { console.error('✗ thap-kt-ketqua-vua.js lỗi: ' + e.message); process.exit(1); });
