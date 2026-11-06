// TURRET MERGE — QA 1 VÒNG ĐẦY ĐỦ (iPhone 13) + HỖN LOẠN MẠNG. Báo cáo: docs/demo-hop-tuong/tuvan/qa/BAO-CAO-QA.md
// Chạy (gốc repo): NODE_PATH=/opt/npm-tools/node_modules node tools/thap-online-mock-server.js 8787 &
//                  TAG=sau NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-qa-mang.js
// BASE mặc định = máy chủ giả (phục vụ cả tệp tĩnh + WebSocket) ở cổng 8787. Ảnh (JPEG cỡ CSS, nhẹ): docs/demo-hop-tuong/tuvan/qa/<TAG>_*.jpg
// Kiểm: tải nguội → menu · bộ bài (chạm bỏ/đổi) · Turret File nhiều ụ (cả ụ vàng mới, Test range chạy, chữ khớp kỹ năng) · cài đặt ·
//   tắt/bật mạng ở menu / Test range / trận SOLO / sảnh online / trận CO-OP online · 1 trận SOLO (triệu, ghép, nâng cấp, ụ vàng/đỏ, trùm,
//   màn kết quả 1 màn không cuộn) · xoay / đổi cỡ · ẩn/hiện app · chạm đôi · nút Back dồn · mở lại màn nhiều lần (không tăng
//   listener / timer / bộ nhớ) · lỗi console.  TRƯỢT (exit 1) nếu có lỗi.
'use strict';
const { chromium, devices } = require('playwright');
const fs = require('fs');
const PORT = +(process.env.PORT || 8787);
const BASE = process.env.BASE || `http://localhost:${PORT}/thap/`;
const MOCK = `?net=mock&mockws=ws://localhost:${PORT}&nointro=1&notut=1`;
const OUT = process.env.OUT || 'docs/demo-hop-tuong/tuvan/qa/', TAG = process.env.TAG || 'sau';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });
const BUG = [], OK = [];
const ok = (s) => { OK.push(s); console.log('OK   ' + s); };
const bug = async (p, muc, s, anh) => { let f = ''; if (p && anh) { f = OUT + TAG + '_' + anh + '.jpg'; await p.screenshot({ path: f, type: 'jpeg', quality: 78, scale: 'css' }).catch(() => { }); } BUG.push({ muc, s, anh: f }); console.log('BUG  [' + muc + '] ' + s + (f ? ' → ' + f : '')); };
const kt = async (p, dk, muc, s, anh) => { if (dk) ok(s); else await bug(p, muc, s, anh); };
const cham = (p, sel) => p.tap(sel, { timeout: 3000 }).catch(() => { }); // bị bảng che → bỏ qua (bước sau sẽ báo lỗi)
const chup = (p, ten) => p.screenshot({ path: OUT + TAG + '_' + ten + '.jpg', type: 'jpeg', quality: 78, scale: 'css' }).catch(() => { });

// đếm listener + timer đang sống (đo rò rỉ khi mở lại màn)
const DEM = () => {
  const L = { win: 0, doc: 0 }, T = new Set();
  const aw = window.addEventListener, rw = window.removeEventListener, ad = document.addEventListener, rd = document.removeEventListener;
  window.addEventListener = function () { L.win++; return aw.apply(this, arguments); }; window.removeEventListener = function () { L.win--; return rw.apply(this, arguments); };
  document.addEventListener = function () { L.doc++; return ad.apply(this, arguments); }; document.removeEventListener = function () { L.doc--; return rd.apply(this, arguments); };
  const si = window.setInterval, ci = window.clearInterval;
  window.setInterval = function () { const id = si.apply(this, arguments); T.add(id); return id; };
  window.clearInterval = function (id) { T.delete(id); return ci.apply(this, arguments); };
  window.__dem = () => ({ win: L.win, doc: L.doc, timer: T.size });
};
const overlay = (p) => p.evaluate(() => {
  const st = (d) => { const m = d && d.getElementById('matmang'); return m && !m.hidden ? m.querySelector('.mm-ten').textContent : null; };
  const out = { top: st(document), ifr: null };
  const f = document.querySelector('iframe.up-ifr'); try { out.ifr = st(f && f.contentDocument); } catch (e) { }
  return out;
});
const vaoMenu = async (p, q) => {
  await p.goto(BASE + (q || MOCK));
  await p.waitForFunction(() => typeof HM !== 'undefined' && TAI.daBoot && document.getElementById('tai').hidden && !document.getElementById('chon').hidden, null, { timeout: 60000 });
  await sleep(1200);
};
const frameXem = (p) => p.frames().find(f => /preview=/.test(f.url()));
const demoChay = async (p) => { const f = frameXem(p); if (!f) return { ok: false, ly: 'không có iframe' }; try { const a = await f.evaluate(() => G.t); await sleep(1500); const b = await f.evaluate(() => ({ t: G.t, ban: G.ban.length, mat: TAI.mat })); return { ok: b.t > a && b.ban > 0 && !b.mat, a, ...b }; } catch (e) { return { ok: false, ly: e.message }; } };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  await ctx.addInitScript(DEM);
  await ctx.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true })); } catch (e) { } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });

  // ---------- 1) tải nguội ----------
  const t0 = Date.now();
  await p.goto(BASE + MOCK); await sleep(400); await chup(p, '01_tai');
  await p.waitForFunction(() => typeof HM !== 'undefined' && TAI.daBoot && document.getElementById('tai').hidden, null, { timeout: 60000 });
  const tMenu = Date.now() - t0; await sleep(1500); await chup(p, '02_menu');
  await kt(p, tMenu < 20000, 'Trung bình', `Tải nguội tới menu trong ${(tMenu / 1000).toFixed(1)} s`, 'tai_cham');

  // ---------- 2) bộ bài ----------
  // người chơi mới (bỏ qua hướng dẫn) có bộ bài trống → đặt 5 ụ như người chơi thật
  await p.evaluate(() => { if (UI.chon.length < 5) { UI.chon = ['canon', 'bang', 'tia', 'set', 'lien']; UI.veBoChon(); HM.ve(); } });
  await p.click('#hm-deck', { timeout: 5000 }).catch(() => p.evaluate(() => HM.di('dk'))); await sleep(700); await chup(p, '03_bo_bai');
  const bo0 = await p.evaluate(() => UI.chon.slice());
  const o = p.locator('#chon-bo .o-bo[data-id]').first();
  if (await o.count()) { await o.click(); await sleep(500); await chup(p, '04_bo_bai_cham'); }
  const bo1 = await p.evaluate(() => ({ chon: UI.chon.slice(), armed: HM.armed }));
  await kt(p, bo1.chon.length === 4 || bo1.armed >= 0, 'Trung bình', 'Chạm ô bộ bài: bỏ/đổi ụ phản hồi (' + JSON.stringify(bo1) + ')', 'bo_bai_cham');
  await p.evaluate((d) => { UI.chon = d; HM.armed = -1; UI.veBoChon(); HM.ve && HM.ve(); }, bo0);

  // ---------- 3) Turret File nhiều ụ + Test range ----------
  for (const id of ['mauhut', 'nguyenrua', 'thanhdia', 'bienmau', 'canon']) {
    await p.evaluate((id) => { UP.mo(id); }, id); await sleep(700);
    const t = await p.evaluate((id) => ({ so: (document.querySelector('#up .up-so') || {}).textContent, kn: (document.querySelector('#up .up-kn-chu') || {}).textContent || '', ten: G.rosterMap[id] && G.rosterMap[id].ten, skill: TEXT.units && TEXT.units[id] && TEXT.units[id].skill }), id);
    await p.evaluate(() => UP.moTam('ts')); await sleep(4500);
    const d = await demoChay(p); const ov = await overlay(p);
    await chup(p, '05_tf_' + id);
    await kt(p, d.ok, 'Cao', `Turret File ${t.ten} (${t.so}): Test range chạy (${JSON.stringify(d)})`, 'tf_' + id + '_den');
    await kt(p, !ov.top && !ov.ifr, 'Cao', `Turret File ${t.ten}: không có bảng mạng lạc chỗ`, 'tf_' + id + '_bang');
    await kt(p, !!t.kn && t.kn.length > 5, 'Thấp', `Turret File ${t.ten}: có chữ kỹ năng ("${(t.kn || '').slice(0, 50)}…")`, 'tf_' + id + '_chu');
    await p.evaluate(() => { UP.dongTam(true); UP.dong(); }); await sleep(300);
  }

  // ---------- 4) cài đặt ----------
  await p.evaluate(() => HM.di('hm')); await sleep(400);
  await p.click('[data-act="hm-cai"]', { timeout: 5000 }).catch(() => p.evaluate(() => HM.moCai())); await sleep(600); await chup(p, '06_cai_dat');
  await kt(p, await p.evaluate(() => !document.getElementById('hm-tam').hidden || !!document.querySelector('#hm-tam:not([hidden])')), 'Trung bình', 'Mở Cài đặt', 'cai_dat');
  await p.evaluate(() => HM.dong(true)); await sleep(300);

  // ---------- 4b) cửa hàng / vòng quay / nhiệm vụ / sự kiện (js/kinhte-ui.js) — có mạng, tắt mạng, mở lại nhiều lần ----------
  if (await p.evaluate(() => !!document.querySelector('[data-act="kt-mo"]'))) {
    const dk0 = await p.evaluate(() => window.__dem());
    for (const tab of ['shop', 'vq', 'nv', 'sk']) {
      await p.evaluate(() => HM.di('hm')); await sleep(300);
      await p.click('[data-act="kt-mo"][data-tab="' + tab + '"]', { timeout: 5000 }).catch(() => { });
      await sleep(900);
      const st = await p.evaluate(() => { const k = document.getElementById('kt'), t = document.getElementById('kt-than'); return { mo: k && !k.hidden, noi: t ? t.children.length : 0, tde: (document.getElementById('kt-tde') || {}).textContent }; });
      await chup(p, '06b_kt_' + tab);
      await kt(p, st.mo && st.noi > 0, 'Trung bình', 'Mở ' + tab.toUpperCase() + ' (' + JSON.stringify(st) + ')', 'kt_' + tab);
      if (tab === 'shop') { await ctx.setOffline(true); await sleep(1500); const o = await overlay(p); await chup(p, '06c_kt_mat_mang'); await ctx.setOffline(false); await sleep(2500); const o2 = await overlay(p); await kt(p, !o.top && !o2.top, 'Nghiêm trọng', 'Tắt/bật mạng trong Cửa hàng: không bảng mất mạng', 'kt_mat_mang'); }
      await p.click('[data-act="kt-dong"]', { timeout: 3000 }).catch(() => p.evaluate(() => KTUI.dong()));
      await sleep(400);
    }
    for (let i = 0; i < 10; i++) { await p.evaluate(() => { const b = document.querySelector('[data-act="kt-mo"][data-tab="vq"]'); b && b.click(); }); await sleep(120); await p.evaluate(() => KTUI.dong()); await sleep(80); }
    await sleep(800); const dk1 = await p.evaluate(() => window.__dem());
    await kt(p, dk1.timer - dk0.timer <= 1 && dk1.win - dk0.win <= 2 && dk1.doc - dk0.doc <= 2, 'Cao', `Mở/đóng Cửa hàng 14 lần: timer ${dk0.timer}→${dk1.timer}, listener ${dk0.win}/${dk0.doc}→${dk1.win}/${dk1.doc}`, 'kt_ro_ri');
    await p.evaluate(() => HM.di('hm')); await sleep(300);
  } else ok('Cửa hàng: chưa có trong bản này');

  // ---------- 5) hỗn loạn mạng: MENU ----------
  await ctx.setOffline(true); await sleep(2000);
  let ov = await overlay(p); await chup(p, '07_menu_mat_mang');
  await kt(p, !ov.top, 'Nghiêm trọng', 'Tắt mạng ở MENU: không hiện bảng CONNECTION LOST (' + JSON.stringify(ov) + ')', 'menu_mat_mang');
  await ctx.setOffline(false); await sleep(4000);
  ov = await overlay(p);
  await kt(p, !ov.top, 'Nghiêm trọng', 'Bật lại mạng ở MENU: không có bảng BACK ONLINE dính lại', 'menu_back_online');
  // ---------- 5b) báo lỗi người dùng: tắt/bật mạng rồi mở Blood Circuit ----------
  await p.evaluate(() => { HM.di('dk'); UP.mo('mauhut'); }); await sleep(700); await p.evaluate(() => UP.moTam('ts')); await sleep(5000);
  ov = await overlay(p); let d = await demoChay(p); await chup(p, '08_blood_circuit_sau_mat_mang');
  await kt(p, !ov.top && !ov.ifr && d.ok, 'Nghiêm trọng', 'Lỗi báo cáo: sau tắt/bật mạng, Turret File Blood Circuit 81/93 — Test range chạy, KHÔNG có "BACK ONLINE" (' + JSON.stringify({ ov, d }) + ')', 'blood_circuit_back_online');
  // ---------- 5c) mất mạng NGAY trong Test range ----------
  await ctx.setOffline(true); await sleep(3000); ov = await overlay(p); d = await demoChay(p); await chup(p, '09_demo_mat_mang');
  await kt(p, !ov.top && !ov.ifr && d.ok, 'Nghiêm trọng', 'Tắt mạng trong Test range: không bảng, demo vẫn chạy (' + JSON.stringify({ ov, d }) + ')', 'demo_mat_mang');
  await ctx.setOffline(false); await sleep(4000); ov = await overlay(p); d = await demoChay(p);
  await kt(p, !ov.top && !ov.ifr && d.ok, 'Nghiêm trọng', 'Bật lại mạng trong Test range: không bảng, demo vẫn chạy', 'demo_co_mang');
  // đổi ụ khác sau khi có mạng lại (ảnh mới phải tải được)
  await cham(p, '#up .up-ts .up-x'); await sleep(500); await cham(p, '#up [data-up="sau"]'); await sleep(700); await cham(p, '#up .up-hang-ts'); await sleep(5000);
  d = await demoChay(p); await chup(p, '10_demo_doi_u_sau_mang');
  await kt(p, d.ok, 'Cao', 'Đổi sang ụ khác sau khi có mạng lại: Test range chạy', 'demo_doi_u');
  await p.evaluate(() => { UP.dongTam(true); UP.dong(); HM.di('hm'); }); await sleep(400);

  // ---------- 6) mở lại màn nhiều lần: listener / timer / bộ nhớ ----------
  const cdp = await ctx.newCDPSession(p); await cdp.send('HeapProfiler.enable').catch(() => { });
  const heap = async () => { await cdp.send('HeapProfiler.collectGarbage').catch(() => { }); return (await cdp.send('Runtime.getHeapUsage')).usedSize; };
  const vong = async (n) => { for (let i = 0; i < n; i++) { await p.evaluate((i) => { HM.di('dk'); UP.mo(['canon', 'mauhut', 'bang'][i % 3]); UP.moTam('ts'); }, i); await sleep(250); await p.evaluate(() => { UP.dongTam(true); UP.dong(); HM.di('hm'); HM.moCai(); HM.dong(true); }); await sleep(150); } };
  await vong(3); const d0 = await p.evaluate(() => window.__dem()), h0 = await heap();
  await vong(20); await sleep(1500); const d1 = await p.evaluate(() => window.__dem()), h1 = await heap();
  await kt(p, d1.win - d0.win <= 2 && d1.doc - d0.doc <= 2 && d1.timer - d0.timer <= 1, 'Cao', `Mở lại Bộ bài/Turret File/Cài đặt 20 lần: listener cửa sổ ${d0.win}→${d1.win}, tài liệu ${d0.doc}→${d1.doc}, timer ${d0.timer}→${d1.timer}`, 'ro_ri_listener');
  await kt(p, h1 - h0 < 15e6, 'Trung bình', `Bộ nhớ JS sau 20 vòng: ${(h0 / 1e6).toFixed(1)} → ${(h1 / 1e6).toFixed(1)} MB`, 'ro_ri_bo_nho');
  const nap = await p.evaluate(() => performance.getEntriesByType('navigation').length);
  await kt(p, nap === 1, 'Cao', 'Không nạp lại cả game khi đổi màn', 'nap_lai');

  // ---------- 7) chạm đôi / Back dồn ----------
  await p.evaluate(() => HM.di('dk')); await sleep(300);
  await p.locator('#chon-luoi .c').first().dblclick().catch(() => { }); await sleep(800);
  const up2 = await p.evaluate(() => document.querySelectorAll('#up').length);
  await kt(p, up2 <= 1, 'Trung bình', 'Chạm đôi thẻ ụ: chỉ 1 trang Turret File', 'cham_doi_the');
  // nút Back (vuốt lùi iPhone) dồn: mở hồ sơ ụ → Back, lặp nhanh 3 lần
  await p.evaluate(() => { try { UP.dong(); } catch (e) { } }); await sleep(300);
  for (let i = 0; i < 3; i++) { const con = await p.evaluate((i) => { if (typeof UP === 'undefined') return false; UP.mo(['canon', 'bang', 'tia'][i]); return true; }, i).catch(() => false); if (!con) break; await sleep(80); await p.goBack({ timeout: 1500 }).catch(() => { }); await sleep(60); }
  await sleep(1000);
  const sauBack = await p.evaluate(() => ({ url: location.href.slice(0, 40), trong: typeof HM === 'object', chon: !!document.getElementById('chon') && !document.getElementById('chon').hidden, upAn: (document.getElementById('up') || { hidden: true }).hidden })).catch(e => ({ loi: e.message }));
  await chup(p, '10b_back_don');
  await kt(p, sauBack.trong && sauBack.chon && sauBack.upAn, 'Cao', 'Back dồn (mở hồ sơ → Back ×3 nhanh): vẫn trong game, hồ sơ đóng (' + JSON.stringify(sauBack) + ')', 'back_don');
  if (!sauBack.trong) { await vaoMenu(p); await p.evaluate(() => { UI.chon = ['canon', 'bang', 'tia', 'set', 'lien']; UI.veBoChon(); HM.ve(); }); }
  await p.evaluate(() => { try { UP.dong(); } catch (e) { } HM.dong && HM.dong(true); HM.di('hm'); }); await sleep(400);

  // ---------- 8) xoay / đổi cỡ ----------
  await p.setViewportSize({ width: 844, height: 390 }); await sleep(900); await chup(p, '11_xoay_ngang');
  const kh = await p.evaluate(() => { const r = document.getElementById('wrap').getBoundingClientRect(); return [r.left, r.top, r.width, r.height, innerWidth, innerHeight]; });
  await kt(p, kh[2] <= kh[4] + 1 && kh[3] <= kh[5] + 1 && kh[0] >= -1, 'Trung bình', 'Xoay ngang: khung game nằm gọn trong màn (' + kh.map(Math.round) + ')', 'xoay_ngang');
  await p.setViewportSize({ width: 390, height: 664 }); await sleep(900);

  // ---------- 9) TRẬN SOLO đầy đủ ----------
  await p.evaluate(() => { UI.chon = ['canon', 'mauhut', 'thanhdia', 'bang', 'tia']; UI.veBoChon(); HM.che = 'solo'; HM.ve(); });
  await p.locator('#hm-choi').dblclick({ timeout: 5000 }).catch(() => p.evaluate(() => HM.choi())); // chạm đôi PLAY: chỉ được 1 trận
  await p.waitForFunction(() => G.ban && G.ban.length && !TAI.cho && !document.getElementById('cv').hidden, null, { timeout: 45000 });
  await p.waitForFunction(() => typeof VT === 'undefined' || !VT.mo, null, { timeout: 20000 }).catch(() => { });
  await sleep(1200); await chup(p, '12_solo_bat_dau');
  await kt(p, await p.evaluate(() => G.ban.length === 1 && G.che === 'solo'), 'Cao', 'Chạm đôi PLAY: vào đúng 1 trận SOLO', 'play_doi');
  // triệu
  await p.evaluate(() => { G.ban[0].mana = 600; });
  for (let i = 0; i < 8; i++) { await p.click('#nut-trieu').catch(() => { }); await sleep(150); }
  const so = await p.evaluate(() => G.ban[0].t.filter(Boolean).length);
  await kt(p, so >= 5, 'Cao', 'Triệu ụ: ' + so + ' ụ trên bàn', 'trieu');
  // ghép (chạm–chạm) + nâng cấp
  const gh = await p.evaluate(() => { const B = G.ban[0]; for (let i = 0; i < 15; i++) B.t[i] = null; B.t[0] = sinhU(taoU(B, 'canon', 1, 0)); B.t[1] = sinhU(taoU(B, 'canon', 1, 1)); const r = ghep(B, B.t[0], B.t[1]); return { r: !!r, con: B.t.filter(Boolean).map(T => T.id + T.sao) }; });
  await kt(p, gh.con.length === 1 && /2$/.test(gh.con[0]), 'Cao', 'Ghép 2 ụ 1★ → 1 ụ 2★ (' + JSON.stringify(gh) + ')', 'ghep');
  const nc = await p.evaluate(() => { const B = G.ban[0]; B.mana = 9999; const a = B.lv && B.lv.canon != null ? B.lv.canon : JSON.stringify(B.lv); const r = nangCap(B, 'canon'); return { r: !!r, a, b: B.lv && B.lv.canon }; });
  await kt(p, nc.r, 'Cao', 'Nâng cấp (power-up) Canon (' + JSON.stringify(nc) + ')', 'nang_cap');
  // ụ vàng/đỏ: đặt rồi cho chạy
  await p.evaluate(() => { const B = G.ban[0]; const put = (o, id, s) => { B.t[o] = sinhU(taoU(B, id, s, o)); }; put(3, 'mauhut', 3); put(4, 'mauhut', 3); put(5, 'thanhdia', 4); put(6, 'bang', 3); put(7, 'tia', 3); G.debug.auto = true; G.tocDo = 2; });
  await sleep(4000); await chup(p, '13_solo_u_vang');
  // mất mạng giữa trận SOLO
  const ts0 = await p.evaluate(() => G.t);
  await ctx.setOffline(true); await sleep(3000); ov = await overlay(p);
  const ts1 = await p.evaluate(() => ({ t: G.t, ban: G.ban.length, dung: G.dung }));
  await chup(p, '14_solo_mat_mang');
  await kt(p, !ov.top && ts1.ban === 1 && ts1.t > ts0 && !ts1.dung, 'Nghiêm trọng', 'Tắt mạng giữa trận SOLO: trận vẫn chạy, không bảng (' + JSON.stringify({ ov, ts0, ts1 }) + ')', 'solo_mat_mang');
  await ctx.setOffline(false); await sleep(2500); ov = await overlay(p);
  await kt(p, !ov.top && await p.evaluate(() => G.ban.length === 1), 'Nghiêm trọng', 'Bật lại mạng giữa trận SOLO: không bảng, trận vẫn còn', 'solo_co_mang');
  // ẩn / hiện app
  await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
  await sleep(1500);
  await p.evaluate(() => { delete document.hidden; delete document.visibilityState; Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' }); document.dispatchEvent(new Event('visibilitychange')); dispatchEvent(new Event('pageshow')); });
  await sleep(1500);
  const vis = await p.evaluate(() => ({ ban: G.ban.length, t: G.t, dung: G.dung, dungHien: !document.getElementById('dung').hidden }));
  await kt(p, vis.ban === 1, 'Cao', 'Ẩn rồi mở lại app giữa trận: trận còn (' + JSON.stringify(vis) + ')', 'an_hien');
  if (vis.dungHien) await p.evaluate(() => { const b = document.querySelector('#dung [data-act="tiep"]'); b && b.click(); });
  // tới trùm
  await p.evaluate(() => { G.wave = Math.max(G.wave, 9); G.tocDo = 3; G.ban[0].mana = 5000; G.tim = 99; G.ban[0].tim = 99; });
  let trum = false; const tt = Date.now();
  while (Date.now() - tt < 120000) { await sleep(1000); const s = await p.evaluate(() => ({ w: G.wave, trum: G.quai.some(q => q.trum), ket: !!G.ketThuc })); if (s.trum) { trum = true; await sleep(1200); await chup(p, '15_solo_trum'); break; } if (s.ket) break; }
  await kt(p, trum, 'Cao', 'Trùm xuất hiện (wave ' + await p.evaluate(() => G.wave) + ')', 'trum');
  // kết thúc tự nhiên: hết tim
  await p.evaluate(() => { G.debug.auto = false; G.tim = 1; if (G.ban[0]) G.ban[0].tim = 1; });
  await p.waitForFunction(() => G.ketThuc && !document.getElementById('ketqua').hidden, null, { timeout: 90000 }).catch(() => p.evaluate(() => ketThuc(false, TEXT.end.coreDown)));
  await sleep(2000); await chup(p, '16_ket_qua');
  const kq = await p.evaluate(() => { const k = document.getElementById('ketqua'); const r = k.getBoundingClientRect(); const cuon = [...k.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(e).overflowY)).map(e => e.className); const nut = [...k.querySelectorAll('button')].filter(e => e.offsetParent).map(e => { const q = e.getBoundingClientRect(); return [e.dataset.act, Math.round(q.bottom)]; }); return { h: r.height, top: r.top, bottom: r.bottom, vh: innerHeight, cuon, nut, doc: document.scrollingElement.scrollHeight > innerHeight + 1, bangTrum: !document.getElementById('canh-bao').hidden }; });
  await kt(p, !kq.bangTrum, 'Trung bình', 'Màn kết quả: băng BOSS INCOMING không nằm đè (' + kq.bangTrum + ')', 'ket_qua_bang_trum');
  await kt(p, !kq.cuon.length && !kq.doc && kq.nut.every(n => n[1] <= kq.vh + 1), 'Cao', 'Màn kết quả vừa 1 màn, không cuộn (' + JSON.stringify(kq) + ')', 'ket_qua_cuon');
  // offline sau trận (màn kết quả): không bảng
  await ctx.setOffline(true); await sleep(2000); ov = await overlay(p); await ctx.setOffline(false); await sleep(2500);
  const ov2 = await overlay(p);
  await kt(p, !ov.top && !ov2.top, 'Cao', 'Tắt/bật mạng ở màn kết quả: không bảng', 'ket_qua_mang');
  // về menu
  await p.evaluate(() => { const b = document.querySelector('#ketqua [data-act="doibo"]'); b && b.click(); }); await sleep(1500);
  await kt(p, await p.evaluate(() => !document.getElementById('chon').hidden && !G.ban.length), 'Cao', 'Màn kết quả → về menu', 've_menu');
  await chup(p, '17_ve_menu');

  // ---------- 10) ONLINE: sảnh + trận CO-OP (máy chủ giả, 2 máy) ----------
  const ctxB = await b.newContext({ ...devices['iPhone 13'] });
  await ctxB.addInitScript(() => { try { localStorage.setItem('turret_hd', JSON.stringify({ xong: true })); } catch (e) { } });
  const q = await ctxB.newPage(); q.on('pageerror', e => errs.push('B pageerror: ' + e.message));
  const sanSang = (x) => x.waitForFunction(() => typeof ONL !== 'undefined' && NET.ok && document.querySelector('#onl-nut'), null, { timeout: 30000 });
  let coOnl = true;
  try { await sanSang(p); await vaoMenu(q); await sanSang(q); await q.evaluate(() => { UI.chon = ['drone', 'bao', 'kiembang', 'hydra', 'anhsang']; UI.veBoChon(); HM.ve(); }); } catch (e) { coOnl = false; await bug(p, 'Thấp', 'Không vào được online với máy chủ giả: ' + e.message, 'online_khong_vao'); }
  if (coOnl) {
    await p.evaluate(() => ONL.moBang()); await sleep(500);
    // mất mạng khi đang ở bảng ONLINE (vào trận online)
    await ctx.setOffline(true); await sleep(2000); ov = await overlay(p); await chup(p, '18_sanh_mat_mang');
    await kt(p, !ov.top, 'Cao', 'Tắt mạng ở bảng ONLINE (chưa vào trận): không bảng mất mạng của trận', 'sanh_mat_mang');
    await ctx.setOffline(false); await sleep(4000);
    await p.click('[data-act="onl-tao"]');
    const coMa = await p.waitForFunction(() => /^[A-Z]{4}$/.test((document.querySelector('#sanh-ma') || {}).textContent || ''), null, { timeout: 15000 }).then(() => true, () => false);
    if (!coMa) { await bug(p, 'Trung bình', 'Sau khi mất mạng ở bảng online, tạo phòng không được (máy chủ giả)', 'sanh_tao_phong'); }
    else {
      const code = await p.textContent('#sanh-ma');
      await q.evaluate(() => ONL.moBang()); await q.fill('#onl-ma', code); await q.click('[data-act="onl-vao"]');
      const du = await p.waitForFunction(() => document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length === 2, null, { timeout: 15000 }).then(() => true, () => false);
      if (!du) { const ta = await p.evaluate(() => ({ noi: NET.noi, code: ONL.code, n: document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length })), tb = await q.evaluate(() => ({ noi: NET.noi, code: ONL.code, loi: (document.querySelector('#onl-loi,.onl-loi') || {}).textContent })); await chup(q, '18b_B_vao_phong'); throw new Error('B không vào được phòng của A sau khi A mất/có mạng: A ' + JSON.stringify(ta) + ' B ' + JSON.stringify(tb)); }
      await sleep(400); await p.click('#sanh-san'); await q.click('#sanh-san');
      const vao = await p.waitForFunction(() => ONS.on && G.ban.length === 2, null, { timeout: 30000 }).then(() => true, () => false);
      if (!vao) await bug(p, 'Cao', 'Không vào được trận CO-OP online (máy chủ giả)', 'coop_vao');
      else {
        await p.waitForFunction(() => G.wave >= 1, null, { timeout: 60000 }).catch(() => { });
        await sleep(1500);
        await ctx.setOffline(true); await sleep(2500); ov = await overlay(p); await chup(p, '19_coop_mat_mang');
        await kt(p, ov.top === 'CONNECTION LOST', 'Cao', 'Trận CO-OP online mất mạng: hiện bảng CONNECTION LOST (đúng chỗ của nó) — ' + JSON.stringify(ov), 'coop_mat_mang');
        await ctx.setOffline(false); await sleep(5000); ov = await overlay(p); await chup(p, '20_coop_back_online');
        await kt(p, ov.top === 'BACK ONLINE', 'Trung bình', 'Trận CO-OP có mạng lại: bảng chuyển BACK ONLINE', 'coop_back_online');
        if (ov.top) { await p.click('#mm-nut'); await sleep(2000); }
        const sau = await p.evaluate(() => ({ an: document.getElementById('matmang').hidden, mat: TAI.mat, menu: !document.getElementById('chon').hidden, ons: ONS.on, ban: G.ban.length }));
        await chup(p, '21_coop_ve_menu');
        await kt(p, sau.an && !sau.mat && sau.menu && !sau.ons && !sau.ban, 'Cao', 'BACK TO MENU: về menu sạch, bảng không dính (' + JSON.stringify(sau) + ')', 'coop_ve_menu');
        // sau trận online: mở Turret File + tắt/bật mạng → không bảng
        await ctx.setOffline(true); await sleep(1500); await ctx.setOffline(false); await sleep(3000);
        await p.evaluate(() => { HM.di('dk'); UP.mo('mauhut'); }); await sleep(700); await p.evaluate(() => UP.moTam('ts')); await sleep(5000);
        ov = await overlay(p); d = await demoChay(p); await chup(p, '22_tf_sau_tran_online');
        await kt(p, !ov.top && !ov.ifr && d.ok, 'Nghiêm trọng', 'Sau trận online + tắt/bật mạng: Turret File sạch, demo chạy (' + JSON.stringify({ ov, d }) + ')', 'tf_sau_online');
      }
    }
  }
  const loi = errs.filter(e => !/\[NET\]|WebSocket|mockws|net::/.test(e));
  await kt(p, !loi.length, 'Cao', 'Không lỗi JS / console (' + loi.slice(0, 5).join(' | ') + ')', 'loi_console');
  fs.writeFileSync(OUT + TAG + '_ket_qua.json', JSON.stringify({ ok: OK, bug: BUG, errs: errs.slice(0, 30) }, null, 1));
  console.log(`\n${OK.length} đạt, ${BUG.length} lỗi`);
  await b.close();
  process.exit(BUG.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
