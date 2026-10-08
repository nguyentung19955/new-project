// Test bảng Hợp thể trong trận + màn Tiến hoá làm lại (v170); v180: ra Tím cũng phải nâng hết kỹ năng. Chạy: node tests/hop-the/hop-the.test.js
const path = require('path');
const fs = require('fs');
const { open, enter, ok } = require('../cho-tuong/helpers');
const SHOT = path.join(__dirname, 'shots');
fs.mkdirSync(SHOT, { recursive: true });
const SAVE = new Set(['844x390']);   // chỉ lưu ảnh một cỡ cho nhẹ repo
const OWNED = ['thachsanh', 'lachau', 'thansan', 'caolo', 'antiem', 'tiendung', 'langlieu', 'cdt', 'trongdong', 'caong', 'ongtao', 'potaoapui', 'baahoa', 'lyngu', 'truongchi', 'ongdung', 'thocong', 'nghedong', 'mychau', 'kimquy', 'kylan'];

// đặt tướng thẳng lên sân (bỏ qua giá), tier = số sao; mặc định nâng hết kỹ năng (extra.noSkill: giữ kỹ năng gốc)
const put = (page, type, tier, extra = {}) => page.evaluate(([t, tier, ex]) => {
  const s = game.freeSlots()[0]; game.gold += 9999; game.placeHero(s, t); const h = game.heroes[s]; h.tier = tier;
  if (!ex.noSkill) { h.level = 16; HEROES[h.type].skills.forEach((sk, i) => { h.skillLv[sk.id] = SKILL_MAX[i]; }); }
  delete ex.noSkill; Object.assign(h, ex); ui.sig = {}; return s;
}, [type, tier, extra]);
// chờ phần tử hiện (tối đa 5 giây) thay cho đợi cố định — màn vẽ lại theo khung hình, máy bận / chạy song song thì chậm hơn
const seen = (loc) => loc.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
const maxSkills = (page, slot) => page.evaluate((s) => { const h = game.heroes[s]; h.level = 16; HEROES[h.type].skills.forEach((sk, i) => { h.skillLv[sk.id] = SKILL_MAX[i]; }); ui.sig = {}; }, slot);
// chữ tràn: phần tử có chữ mà scrollWidth > clientWidth (trừ chỗ cố ý cắt "…") hoặc lòi ra ngoài khung cha `root`
const overflow = (page, root) => page.evaluate((root) => {
  const R = document.querySelector(root); if (!R) return ['không thấy ' + root];
  const rb = R.getBoundingClientRect(), bad = [];
  for (const el of R.querySelectorAll('*')) {
    if (!el.childNodes.length || el.closest('svg')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (hasText && el.scrollWidth > el.clientWidth + 1 && cs.textOverflow !== 'ellipsis' && el.clientWidth > 0 && cs.overflowX !== 'auto') bad.push(`${el.className || el.tagName} (${el.scrollWidth}>${el.clientWidth}) "${el.textContent.trim().slice(0, 30)}"`);
    const b = el.getBoundingClientRect();
    // khung xoay dọc (ROT): trục ngang của giao diện là trục dọc màn hình
    const [lo, hi, rlo, rhi] = ROT ? [b.top, b.bottom, rb.top, rb.bottom] : [b.left, b.right, rb.left, rb.right];
    if (b.width && hasText && (lo < rlo - 1 || hi > rhi + 1)) bad.push(`ra ngoài khung: ${el.className || el.tagName} "${el.textContent.trim().slice(0, 30)}"`);
  }
  return bad;
}, root);

async function legendsCase(w, h) {
  const { browser, page, errors } = await open(w, h, { owned: OWNED });
  await enter(page, 0);
  await page.evaluate(() => { game.running = false; game.gold = 5000; });
  const tag = `${w}x${h}`;
  const ic = await page.evaluate(() => [...document.querySelectorAll('#deck .mk-card')].map((c) => { const C = c.getBoundingClientRect(), e = c.querySelector('.eli').getBoundingClientRect(), im = c.querySelector(':scope > img').getBoundingClientRect(); return { small: e.width <= 20 * (C.width / 76) + 1, inside: e.left >= C.left - 1 && e.top >= C.top - 1, face: im.width > e.width * 2 }; }));
  ok(ic.length && ic.every((x) => x.small && x.inside && x.face), `${tag}: icon hệ trên thẻ chợ nhỏ gọn trong góc, không phóng to đè avatar (v180)`);
  // --- chưa có nguyên liệu trên sân
  await page.click('#deck [data-act=legend-open]'); await page.waitForTimeout(200);
  let st = await page.evaluate(() => {
    const L = document.querySelector('#legends').getBoundingClientRect(), D = document.querySelector('#deck');
    return { open: !document.querySelector('#legends').hidden, deckVis: getComputedStyle(D).visibility, inView: L.top >= 0 && L.bottom <= innerHeight + 1 && L.left >= -1 && L.right <= innerWidth + 1, cards: document.querySelectorAll('#legends .hx-card').length, tab: ui.lg.tab };
  });
  ok(st.open && st.deckVis === 'hidden', `${tag}: mở bảng Hợp thể → thanh chợ ẩn (không đè bảng)`);
  ok(st.inView, `${tag}: bảng nằm trọn trong màn hình`);
  ok(st.cards > 5 && st.tab === 'epic', `${tag}: tab Tím mặc định, ${st.cards} thẻ`);
  ok(await page.locator('#legends [data-act=hx-flt], #legends .hx-fs').count() === 0, `${tag}: không còn thanh lọc Làm được / Thiếu 1 / Tất cả (v180)`);
  const hb = await page.evaluate(() => { const L = document.querySelector('#legends .hx-hd'), q = document.querySelector('#legends .hx-q'), x = document.querySelector('#legends .hx-x'); return { right: L.clientWidth - (x.offsetLeft - L.offsetLeft * (x.offsetParent === L ? 0 : 1) + x.offsetWidth), gap: x.offsetLeft - (q.offsetLeft + q.offsetWidth), same: Math.abs(q.offsetTop - x.offsetTop) < 2 }; });
  ok(hb.right < 4 && hb.gap >= 0 && hb.gap < 12 && hb.same, `${tag}: nút ? và ✕ gọn ở góc phải (lệch ${Math.round(hb.right)}px, cách ${Math.round(hb.gap)}px)`);
  await page.click('#legends [data-act=hx-close]'); await page.waitForTimeout(80);
  ok(await page.evaluate(() => document.querySelector('#legends').hidden && getComputedStyle(document.querySelector('#deck')).visibility === 'visible'), `${tag}: nút ✕ đóng bảng, thanh chợ hiện lại`);

  // --- có nguyên liệu: Lạc Tướng ★★★ + Thầy Chuông Đồng ★★★ (→ Thần Trống Đồng), Thầy Mo ★★★ (thiếu Đèn Rồi)
  await put(page, 'lactuong', 3); await put(page, 'chuongdong', 3); await put(page, 'thaymo', 3); await put(page, 'denroi', 1);
  await page.click('#deck [data-act=legend-open]'); await page.waitForTimeout(200);
  const first = await page.evaluate(() => { const c = document.querySelector('#legends .hx-card'); return { to: FUSION[+c.dataset.i].to, ready: c.classList.contains('ready'), btn: !!c.querySelector('[data-act=hx-fuse]'), oks: c.querySelectorAll('.hx-m.ok').length }; });
  ok(first.to === 'trongdong' && first.ready && first.btn && first.oks === 2, `${tag}: thẻ làm được lên đầu (Thần Trống Đồng, 2 ✓, nút Hợp thể)`);
  ok((await page.locator('#legends .hx-card').first().locator('.hx-go').innerText()).includes('300'), `${tag}: giá 300 hiện trên nút`);
  const oks = await page.evaluate(() => [...document.querySelectorAll('#legends .hx-card')].map((c) => c.querySelectorAll('.hx-m.ok').length));
  ok(oks.length > 5, `${tag}: luôn hiện tất cả công thức của tab (${oks.length} thẻ)`);
  ok(oks.every((n, i) => i === 0 || n <= oks[i - 1]) && oks.filter((n) => n === 1).length >= 2, `${tag}: sắp gần xong lên đầu (số ✓ giảm dần: ${oks.slice(0, 5).join(',')}…)`);
  await page.click('#legends [data-act=hx-tab][data-k=legendary]'); await page.waitForTimeout(80);
  ok(await page.evaluate(() => [...document.querySelectorAll('#legends .hx-card')].every((c) => HEROES[FUSION[+c.dataset.i].to].legend === 'legendary') && document.querySelectorAll('#legends .hx-card').length > 5), `${tag}: tab Vàng chỉ có tướng Vàng`);
  await page.click('#legends [data-act=hx-tab][data-k=epic]'); await page.waitForTimeout(80);
  const marks = await page.evaluate(() => [...document.querySelectorAll('#legends .hx-m')].map((m) => m.querySelector('i').textContent).filter(Boolean));
  ok(marks.length >= 4 && marks.every((t) => t === '✓' || /^\d\/3★$/.test(t)), `${tag}: tab Tím nguyên liệu hiện ✓ hoặc sao hiện tại/cần (${[...new Set(marks)].join(' ')})`);
  await page.click('#legends [data-act=hx-tab][data-k=legendary]'); await page.waitForTimeout(80);
  await page.click('#legends [data-act=hx-help]'); await page.waitForTimeout(60);
  ok((await page.locator('#legends .hx-sub').innerText()).includes('Kéo 2 tướng'), `${tag}: nút ? hiện giải thích ngắn`);
  const ov = await overflow(page, '#legends');
  ok(!ov.length, `${tag}: không chữ tràn trong bảng Hợp thể ${ov.slice(0, 3).join(' | ')}`);
  await page.click('#legends [data-act=hx-tab][data-k=epic]'); await page.waitForTimeout(80);
  await page.mouse.move(1, 1); await page.evaluate(() => { document.querySelector('#toasts').innerHTML = ''; });
  if (SAVE.has(tag)) await page.screenshot({ path: path.join(SHOT, `bang-hop-the-${tag}.png`) });
  // chạm thẻ "thiếu 1" (Tiên Dung: Thầy Mo ✓ + Đèn Rồi ★) → đánh dấu trên sân, đóng bảng
  const iTD = await page.evaluate(() => FUSION.findIndex((f) => f.to === 'tiendung'));
  await page.click(`#legends .hx-card[data-i="${iTD}"]`); await page.waitForTimeout(100);
  const ff = await page.evaluate(() => ({ i: ui.fuseFocus && ui.fuseFocus.i, closed: document.querySelector('#legends').hidden }));
  ok(ff.i === iTD && ff.closed, `${tag}: chạm thẻ → fuseFocus đánh dấu nguyên liệu, bảng đóng`);
  // hợp thể thật từ bảng
  await page.click('#deck [data-act=legend-open]'); await page.waitForTimeout(150);
  await page.click('#legends .hx-card .hx-go'); await page.waitForTimeout(250);
  ok(await page.evaluate(() => game.heroes.some((h) => h && h.type === 'trongdong') && !game.heroes.some((h) => h && h.type === 'chuongdong')), `${tag}: bấm Hợp thể trên thẻ → ra Thần Trống Đồng`);
  ok(!errors.length, `${tag}: không lỗi JS ${errors.join(' | ')}`);
  await browser.close();
}

// v180: thiếu kỹ năng thì không hợp thể ra Tím (mọi đường gọi), nâng hết thì được
async function skillCase(w, h) {
  const { browser, page, errors } = await open(w, h, { owned: OWNED });
  await enter(page, 0);
  await page.evaluate(() => { game.running = false; game.gold = 5000; });
  const tag = `${w}x${h}`;
  const a = await put(page, 'lactuong', 3, { noSkill: true }), b = await put(page, 'chuongdong', 3);
  let r = await page.evaluate(([a, b]) => ({ c: game.canFuse(game.heroes[a], game.heroes[b]), gap: game.skillGap(game.heroes[a]), f: game.fuse(a, b), still: game.heroes[a] && game.heroes[a].type }), [a, b]);
  ok(typeof r.c === 'string' && /Lạc Tướng còn thiếu \d+ cấp kỹ năng/.test(r.c) && r.gap > 0, `${tag}: Lạc Tướng ★★★ chưa nâng kỹ năng → canFuse báo "${r.c.slice(0, 40)}…"`);
  ok(typeof r.f === 'string' && r.still === 'lactuong', `${tag}: game.fuse bị chặn, tướng vẫn còn`);
  ok(await page.evaluate(() => game.fusionProgress(FUSION.find((f) => f.to === 'trongdong')).p < 1), `${tag}: tiến độ (dải gợi ý) < 100% khi thiếu kỹ năng`);
  r = await page.evaluate(([a, b]) => { const h = game.heroes[b]; h.tier = 2; const c = game.canFuse(h, game.heroes[a]); h.tier = 3; return c; }, [a, b]);
  ok(typeof r === 'string' && /Thầy Chuông Đồng cần ★★★/.test(r), `${tag}: ★★ dù đủ kỹ năng vẫn chưa hợp thể được ("${r}")`);
  // v181: tướng Thường ★★★ lên cấp nửa giá (★★ nguyên giá, tướng thần nguyên giá)
  // claude/sao3-re-nhanh: ★★★ lên cấp ⅓ giá, mở kỹ năng miễn phí (★★ nguyên giá)
  r = await page.evaluate((a) => { const h = game.heroes[a], full = COSTS.level(h.level), c3 = game.levelCost(h), u3 = [1, 2, 3].map((i) => unlockCost(h, i)); h.tier = 2; const c2 = game.levelCost(h), u2 = [1, 2, 3].map((i) => unlockCost(h, i)); h.tier = 3; return { full, c3, c2, u3, u2 }; }, a);
  ok(r.c3 === Math.round(r.full / 3) && r.c2 === r.full, `${tag}: ★★★ lên cấp ⅓ giá (${r.c3} thay vì ${r.full}), ★★ nguyên giá`);
  ok(r.u3.every((c) => c === 0) && r.u2.join() === '60,150,300', `${tag}: ★★★ mở W/E/R miễn phí (${r.u3}), ★★ nguyên giá (${r.u2})`);
  // bảng Hợp thể: thẻ Thần Trống Đồng có huy hiệu KN, nút khoá, chạm → toast nêu rõ tướng thiếu
  await page.click('#deck [data-act=legend-open]'); await page.waitForTimeout(200);
  const iTD = await page.evaluate(() => FUSION.findIndex((f) => f.to === 'trongdong'));
  const card = page.locator(`#legends .hx-card[data-i="${iTD}"]`);
  const info = await card.evaluate((c) => ({ ready: c.classList.contains('ready'), lock: !!c.querySelector('.hx-go.off'), sk: [...c.querySelectorAll('.hx-sk')].map((x) => x.textContent), oks: c.querySelectorAll('.hx-m.ok').length }));
  ok(!info.ready && info.lock, `${tag}: thẻ không "ready", nút Hợp thể bị khoá`);
  ok(info.sk.length === 1 && /^−\d+$/.test(info.sk[0]) && info.oks === 1, `${tag}: nguyên liệu đủ hiện ✓, nguyên liệu thiếu kỹ năng hiện ⚡${info.sk[0]}`);
  const fs = await card.evaluate((c) => ({ sk: parseFloat(getComputedStyle(c.querySelector('.hx-sk')).fontSize), lock: !!c.querySelector('.hx-go.off svg.svlk') }));
  ok(fs.sk >= 10 && fs.lock, `${tag}: huy hiệu kỹ năng chữ ${fs.sk}px, nút khoá có icon ổ khoá SVG`);
  await page.evaluate(() => { document.querySelector('#toasts').innerHTML = ''; });
  await card.locator('.hx-go.off').click({ force: true }); await page.waitForTimeout(150);
  const t = await page.evaluate((i) => ({ txt: document.querySelector('#legends .hx-sub').textContent, toast: document.querySelector('#toasts').textContent, mark: document.querySelector(`#legends .hx-card[data-i="${i}"]`).classList.contains('why'), open: !document.querySelector('#legends').hidden, td: game.heroes.some((h) => h && h.type === 'trongdong') }), iTD);
  ok(/Lạc Tướng còn thiếu \d+ cấp kỹ năng/.test(t.txt) && !t.toast && t.mark && t.open && !t.td, `${tag}: chạm nút khoá → lý do dưới tiêu đề bảng "${t.txt.slice(0, 50)}…", không toast, thẻ đánh dấu, không hợp thể`);
  const ov2 = await overflow(page, '#legends');
  ok(!ov2.length, `${tag}: dòng lý do không tràn ${ov2.slice(0, 3).join(' | ')}`);
  // kéo thả cũng bị chặn
  await page.evaluate(([a, b]) => ui.dropOn(a, b), [a, b]); await page.waitForTimeout(100);
  ok(await page.evaluate(() => !game.heroes.some((h) => h && h.type === 'trongdong')), `${tag}: kéo thả thiếu kỹ năng → không hợp thể`);
  // màn Tiến hoá: ✗ Kỹ năng tối đa (còn N), nút khoá chạm ra toast
  await page.evaluate((s) => { ui.openLegends(false); ui.sel = s; ui.openScreen('evo'); }, a); await page.waitForTimeout(250);
  const ev = await page.evaluate(() => [...document.querySelectorAll('#screen .ho-cond .n')].map((x) => x.textContent));
  ok(ev.some((x) => /Kỹ năng tối đa \(còn \d+\)/.test(x)), `${tag}: Tiến hoá hiện ✗ Kỹ năng tối đa (còn N)`);
  await page.evaluate(() => { document.querySelector('#toasts').innerHTML = ''; });   // toast của lần kéo thả ở trên
  // chờ màn Tiến hoá dựng xong (nút hiện thật) rồi mới bấm — đợi cố định 250 ms đôi khi chưa đủ (chập chờn)
  const lockBtn = page.locator('#screen .ho .hx-go.off').first();
  // màn Tiến hoá có thể vẽ lại đúng lúc bấm (nút cũ bị thay) → bấm lại, tối đa 5 lần
  for (let k = 0; ; k++) {
    try { await lockBtn.waitFor({ state: 'visible' }); await lockBtn.click({ force: true, timeout: 2000 }); break; } catch (e) { if (k >= 4) throw e; await page.waitForTimeout(200); }
  }
  await page.waitForTimeout(150);
  const ew = await page.evaluate(() => ({ why: (document.querySelector('#screen .ho-why.err') || {}).textContent || '', toast: document.querySelector('#toasts').textContent }));
  ok(/còn thiếu \d+ cấp kỹ năng/.test(ew.why) && !ew.toast, `${tag}: chạm nút khoá ở Tiến hoá → lý do ngay trong thẻ "${ew.why.trim().slice(0, 40)}…", không toast`);
  // claude/r-cap-12: R tối đa ở tướng cấp 12 (R2 cấp 9, R3 cấp 12) — trước là 11/16
  r = await page.evaluate((a) => {
    const h = game.heroes[a], ri = 3, id = HEROES[h.type].skills[ri].id, keep = { ...h.skillLv }, kl = h.level, kp = h.skillPts;
    const out = { req: [skillReqLevel(ri, 1), skillReqLevel(ri, 2), skillReqLevel(ri, 3)] };
    h.skillLv[id] = 2; h.skillPts = 5; h.level = 11; out.at11 = game.upgradeSkill(h, ri);
    h.level = 12; out.at12 = game.upgradeSkill(h, ri); out.lv = h.skillLv[id];
    h.skillLv = keep; h.level = kl; h.skillPts = kp; return out;
  }, a);
  ok(r.req.join() === '6,9,12' && r.at11 === 'Cần tướng cấp 12' && r.at12 === true && r.lv === 3, `${tag}: R cần tướng cấp ${r.req.join('/')}; cấp 11 bị chặn ("${r.at11}"), cấp 12 nâng R3 được`);
  // nâng hết kỹ năng → hợp thể được
  await maxSkills(page, a); await page.waitForTimeout(300);
  const btn = page.locator('#screen .ho.ready .hx-go:not(.off)');
  await seen(btn);
  ok(await btn.count() === 1, `${tag}: nâng hết kỹ năng → nút Hợp thể bật`);
  await btn.click(); await page.waitForTimeout(250);
  ok(await page.evaluate(() => game.heroes.some((h) => h && h.type === 'trongdong')), `${tag}: đủ kỹ năng → ra Thần Trống Đồng`);
  ok(!errors.length, `${tag}: không lỗi JS ${errors.join(' | ')}`);
  await browser.close();
}

async function evoCase(w, h) {
  const { browser, page, errors } = await open(w, h, { owned: OWNED });
  await enter(page, 0);
  await page.evaluate(() => { game.running = false; game.gold = 5000; });
  const tag = `${w}x${h}`;
  const s1 = await put(page, 'lactuong', 3); await put(page, 'chuongdong', 3);
  const openEvo = async (slot) => { await page.evaluate((s) => { ui.closeScreen && ui.screen && ui.closeScreen(); ui.sel = s; ui.openScreen('evo'); }, slot); await page.waitForTimeout(250); await seen(page.locator('#screen .ev2-body')); };
  // --- Thường
  await openEvo(s1);
  let n = await page.evaluate(() => ({ cv: document.querySelectorAll('#screen canvas[data-hero]').length, steps: document.querySelectorAll('#screen .es').length, ho: document.querySelectorAll('#screen .ho').length, done: document.querySelectorAll('#screen .es.done').length }));
  ok(n.cv === 1 && n.steps === 3, `${tag} Thường: ảnh tướng 1 lần, 3 mốc sao`);
  ok(n.done === 3 && n.ho >= 2, `${tag} Thường: ★ ★★ ★★★ "Đã đạt", ${n.ho} thẻ hợp thể`);
  ok(await page.locator('#screen .note').count() === 0, `${tag}: bỏ đoạn "Cách khác…" dài`);
  let ov = await overflow(page, '#screen .ev2-body');
  ok(!ov.length, `${tag} Thường: không chữ tràn ${ov.slice(0, 3).join(' | ')}`);
  await page.mouse.move(1, 1); await page.evaluate(() => { document.querySelector('#toasts').innerHTML = ''; });
  if (SAVE.has(tag)) await page.screenshot({ path: path.join(SHOT, `tien-hoa-thuong-${tag}.png`) });
  const btn = page.locator('#screen .ho.ready .hx-go');
  ok(await btn.count() === 1 && await btn.isEnabled(), `${tag}: nút Hợp thể · 300 bật khi đủ điều kiện`);
  ok(await page.locator('#screen .ho:not(.ready) .hx-go.off').count() >= 1, `${tag}: hướng thiếu nguyên liệu → nút khoá, có ✗`);
  await btn.click(); await page.waitForTimeout(250);
  const td = await page.evaluate(() => { const h = game.heroes.find((x) => x && x.type === 'trongdong'); return h ? h.slot : -1; });
  ok(td >= 0, `${tag}: bấm Hợp thể trong màn Tiến hoá → ra Thần Trống Đồng`);
  // --- Tím (Thần tinh, có hướng lên Vàng); hạ cấp để mốc hiện tại là nút Lên cấp
  await page.evaluate((s) => { game.heroes[s].level = 1; }, td);
  await openEvo(td);
  n = await page.evaluate(() => ({ cv: document.querySelectorAll('#screen canvas[data-hero]').length, ho: document.querySelectorAll('#screen .ho').length, n: document.querySelectorAll('#screen .ho-cond .n').length, lv: !!document.querySelector('#screen .es.cur [data-act=sk-level]') }));
  ok(n.cv === 1 && n.ho >= 1 && n.n >= 1 && n.lv, `${tag} Tím: 1 ảnh, ${n.ho} hướng lên Vàng có điều kiện ✗, mốc hiện tại có nút Lên cấp`);
  ov = await overflow(page, '#screen .ev2-body');
  ok(!ov.length, `${tag} Tím: không chữ tràn ${ov.slice(0, 3).join(' | ')}`);
  await page.mouse.move(1, 1); await page.evaluate(() => { document.querySelector('#toasts').innerHTML = ''; });
  if (SAVE.has(tag)) await page.screenshot({ path: path.join(SHOT, `tien-hoa-tim-${tag}.png`) });
  // đủ điều kiện lên Vàng: Thần Trống Đồng + Thần Kim Quy (Thần tinh ★★★, kỹ năng tối đa)
  const pair = await page.evaluate(() => { const f = FUSION.find((x) => (x.a === 'trongdong' || x.b === 'trongdong') && HEROES[x.to].legend === 'legendary' && game.ownsHero(x.to)); return f && { pt: f.a === 'trongdong' ? f.b : f.a, to: f.to }; });
  if (pair) {
    await page.evaluate(([td, pt]) => {
      const maxSk = (h) => { HEROES[h.type].skills.forEach((sk, i) => { h.skillLv[sk.id] = SKILL_MAX[i]; }); };
      const a = game.heroes[td]; a.tier = 3; a.level = 25; maxSk(a);
      const s = game.freeSlots()[0]; game.placeHero(s, pt) || (game.heroes[s] = null); let b = game.heroes[s];
      if (!b) { game.heroes[s] = { ...a, id: 'x' + s, type: pt, slot: s, x: CONFIG.slots[s][0], y: CONFIG.slots[s][1], skillLv: {}, equip: { ...a.equip } }; b = game.heroes[s]; }
      b.tier = 3; b.from = b.from || ['x']; b.level = 25; maxSk(b); game.gold = 9999; ui.sig = {};
    }, [td, pair.pt]);
    await page.waitForTimeout(350);
    const b2 = page.locator('#screen .ho.ready .hx-go');
    await seen(b2);
    ok(await b2.count() >= 1 && await b2.first().isEnabled(), `${tag} Tím: đủ điều kiện → nút Hợp thể · 1200 bật`);
    await b2.first().click(); await page.waitForTimeout(250);
    const lg = await page.evaluate((to) => { const h = game.heroes.find((x) => x && x.type === to); return h ? h.slot : -1; }, pair.to);
    ok(lg >= 0, `${tag}: hợp thể lên Vàng (${pair.to}) thành công`);
    // --- Vàng: không còn hướng hợp thể → bảng bộ đồ, vẫn gọn
    await openEvo(lg);
    n = await page.evaluate(() => ({ cv: document.querySelectorAll('#screen canvas[data-hero]').length, steps: document.querySelectorAll('#screen .es').length, set: !!document.querySelector('#screen .set-panel') }));
    ok(n.cv === 1 && n.steps === 3 && n.set, `${tag} Vàng: 1 ảnh, 3 mốc Thần tinh, bảng bộ đồ`);
    ov = await overflow(page, '#screen .ev2-body');
    ok(!ov.length, `${tag} Vàng: không chữ tràn ${ov.slice(0, 3).join(' | ')}`);
    await page.mouse.move(1, 1); await page.evaluate(() => { document.querySelector('#toasts').innerHTML = ''; });
    if (SAVE.has(tag)) await page.screenshot({ path: path.join(SHOT, `tien-hoa-vang-${tag}.png`) });
  }
  ok(!errors.length, `${tag}: không lỗi JS ${errors.join(' | ')}`);
  await browser.close();
}

(async () => {
  for (const [w, h] of [[1920, 1000], [844, 390], [667, 375], [390, 844]]) {
    console.log(`— ${w}x${h}`);
    await legendsCase(w, h);
    await evoCase(w, h);
    await skillCase(w, h);
  }
  console.log('XONG: tất cả test Hợp thể / Tiến hoá đạt');
})().catch((e) => { console.error(e); process.exit(1); });
