// TURRET MERGE — kiểm MÀN KẾT QUẢ trận ONLINE (máy chủ GIẢ, 2 trình duyệt 390×844).
// Chạy:  NODE_PATH=<nơi có ws> node tools/thap-online-mock-server.js 8787 &
//        OUT=docs/demo-hop-tuong/tuvan/ketqua_onl/ node tools/thap-kt-ketqua-onl.js
// Kiểm: bạn rời giữa trận → không DEFEAT (AI chơi tiếp) · hết trận do rời khi còn tim → MATCH ENDED trung tính + nút đúng
//       · thua thật cả 2 còn trong phòng → REMATCH / BACK TO LOBBY / HOME, không RETRY SAME DECK · REMATCH: chờ → bạn đồng ý → trận mới cả 2
//       · BACK TO LOBBY → cùng phòng · bạn đã đi → REMATCH ẩn, FIND NEW PARTNER / PLAY SOLO · PVP đối thủ rời → VICTORY · SOLO thua không đổi.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || 'shots/ketqua_onl/';
const PORT = +(process.env.PORT || 8787);
const URL = `http://localhost:${PORT}/thap/?net=mock&mockws=ws://localhost:${PORT}&nointro=1&notut=1&auto=1`;
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const ok = [], hong = [], errs = [];
const kt = (dk, s) => { (dk ? ok : hong).push(s); console.log((dk ? 'OK   ' : 'FAIL ') + s); };
const man = (p) => p.evaluate(() => {
  const kq = document.getElementById('ketqua'), vis = (e) => e && !e.hidden && e.offsetParent !== null;
  return {
    hien: !kq.hidden, ten: (document.getElementById('kq-ten') || {}).textContent, phu: (document.getElementById('kq-phu') || {}).textContent,
    so: (document.getElementById('kq-so') || {}).textContent, thua: kq.classList.contains('thua'), trung: kq.classList.contains('trung'), thang: kq.classList.contains('thang'),
    nut: [...kq.querySelectorAll('.bang-nut button')].filter(vis).map(b => b.textContent.trim()),
    tt: (document.getElementById('kqo-tt') || {}).textContent || '', meo: (kq.querySelector('.kq-meo') || {}).textContent || '',
    ic: (kq.querySelector('.kq-ic') || {}).getAttribute && kq.querySelector('.kq-ic').getAttribute('src'),
  };
});
const cho = (p, f, a, ms) => p.waitForFunction(f, a, { timeout: ms || 15000 });
const chup = (p, ten) => p.screenshot({ path: OUT + ten + '.png' });

(async () => {
  const b = await chromium.launch();
  const mo = async (ten, deck, dat) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(ten + ' :: ' + e.message + ' @ ' + String(e.stack || '').split('\n').slice(1, 4).join(' < ')));
    p.on('console', x => { if (x.type() === 'error') errs.push(ten + ' :: console ' + x.text()); });
    await p.goto(URL, { waitUntil: 'load' });
    await cho(p, () => typeof UI !== 'undefined' && UI.chon && document.querySelector('#onl-nut') && NET.ok, null, 30000);
    await p.evaluate(([d, t]) => { UI.chon = d; UI.veBoChon(); if (t) { TK.ho.name = t; TK.luuMay2 && TK.luuMay2(); } }, [deck, dat]);
    return { ctx, p, ten };
  };
  const vaoTran = async (A, B) => {
    await A.p.evaluate(() => ONL.moBang()); await A.p.click('[data-act="onl-tao"]');
    await cho(A.p, () => /^[A-Z]{4}$/.test((document.querySelector('#sanh-ma') || {}).textContent || ''));
    const code = await A.p.textContent('#sanh-ma');
    await B.p.evaluate(() => ONL.moBang()); await B.p.fill('#onl-ma', code); await B.p.click('[data-act="onl-vao"]');
    await cho(A.p, () => document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length === 2);
    await sleep(500);
    await A.p.click('#sanh-san'); await B.p.click('#sanh-san');
    for (const X of [A, B]) await cho(X.p, () => ONS.on && G.ban.length === 2);
    await cho(A.p, () => G.wave >= 2, null, 90000); await cho(B.p, () => G.wave >= 2, null, 30000);
    return code;
  };
  const thuaThat = (H) => H.p.evaluate(() => { ONS.truTim(G.ban[0].tim); });

  const CHI = process.env.CHI || '1234';
  if (CHI.includes('1')) {
  // ===== 1) bạn rời giữa trận → không DEFEAT; thua thật sau đó → nút "bạn đã đi"
  let A, B, m, s;
  if (false) {}
  A = await mo('A1', ['canon', 'bang', 'lien', 'laser', 'doc'], 'Tung');
  B = await mo('B1', ['drone', 'bao', 'kiembang', 'hydra', 'anhsang'], 'Linh');
  await vaoTran(A, B);
  await B.p.evaluate(() => document.querySelector('[data-act="dung"]').click()); await sleep(300);
  await B.p.evaluate(() => { const q = document.querySelector('#dung [data-act="bo"]'); q.click(); }); // B bấm QUIT
  await sleep(4000);
  s = await A.p.evaluate(() => ({ kt: !!G.ketThuc, thay: ONS.thay && ONS.thay.vinh, kq: !document.getElementById('ketqua').hidden }));
  kt(!s.kt && !s.kq && s.thay, 'Bạn (B) rời giữa trận → A chơi tiếp với AI, KHÔNG ra màn kết quả / DEFEAT ' + JSON.stringify(s));
  await chup(A.p, '01_A_ban_roi_AI_choi_tiep');
  await sleep(2000);
  await A.p.evaluate(() => ketThuc(false, 'Online match ended')); // đường cũ END MATCH khi còn tim
  await cho(A.p, () => !document.getElementById('ketqua').hidden); await sleep(900);
  m = await man(A.p);
  kt(m.ten === 'MATCH ENDED' && m.trung && !m.thua && /Partner left/.test(m.phu) && /Reached/.test(m.so), 'Hết trận do bạn rời, còn tim → MATCH ENDED · Partner left · Reached WAVE (không khiên đỏ) ' + JSON.stringify([m.ten, m.phu, m.so]));
  kt(/Linh left at wave \d+/.test(m.meo) && !/FIX FOR NEXT RUN|Upgrade/.test(m.meo), 'Thẻ WHAT HAPPENED: "' + m.meo + '" (không mẹo nâng cấp)');
  kt(m.nut.join('|') === 'FIND NEW PARTNER|PLAY SOLO|HOME' && !m.nut.some(x => /RETRY/.test(x)), 'Bạn đã đi: FIND NEW PARTNER · PLAY SOLO · HOME, không RETRY/REMATCH: ' + m.nut.join(', '));
  await chup(A.p, '02_A_match_ended_partner_left');
  await A.p.click('#ketqua [data-act="kqo-solo"]'); await sleep(1500);
  s = await A.p.evaluate(() => ({ che: G.che, ban: G.ban.length, on: ONS.on, code: ONL.code, kq: !document.getElementById('ketqua').hidden }));
  kt(s.che === 'solo' && s.ban === 1 && !s.on && !s.code && !s.kq, 'PLAY SOLO → trận SOLO cùng bộ, đã rời phòng ' + JSON.stringify(s));
  // SOLO thua: không đổi (DEFEAT + RETRY SAME DECK)
  await A.p.evaluate(() => { G.ban[0].tim = 0; ketThuc(false, TEXT.end.coopOut); });
  await cho(A.p, () => !document.getElementById('ketqua').hidden); await sleep(900);
  m = await man(A.p);
  kt(m.ten === 'DEFEAT' && m.thua && m.nut.includes('RETRY SAME DECK') && m.nut.includes('EDIT DECK') && !m.nut.includes('HOME'), 'SOLO thua không đổi: DEFEAT · RETRY SAME DECK · EDIT DECK ' + m.nut.join(', '));
  await chup(A.p, '03_solo_defeat_khong_doi');
  // PVP online (đối thủ rời) — luật áp sẵn cho PVP online
  await A.p.evaluate(() => { document.getElementById('ketqua').hidden = true; batDau('pvp', UI.chon, UI.mv); });
  await sleep(1500);
  await A.p.evaluate(() => { KQO.ctx = { che: 'pvp', code: null, host: true, me: 'x', ban: 'y', tenBan: 'Linh', k0: 'k', roi: { wave: G.wave || 3, vinh: true }, phongMat: false }; ketThuc(false, 'Online match ended'); });
  await cho(A.p, () => !document.getElementById('ketqua').hidden); await sleep(900);
  m = await man(A.p);
  kt(m.ten === 'VICTORY' && m.thang && /forfeit/.test(m.phu) && !m.nut.some(x => /RETRY/.test(x)), 'PVP đối thủ rời → VICTORY · ' + m.phu + ' · nút ' + m.nut.join(', '));
  await chup(A.p, '04_pvp_doi_thu_roi_victory');
  await A.ctx.close(); await B.ctx.close();

  }
  if (CHI.includes('2')) {
  // ===== 2) thua thật, cả 2 còn trong phòng → REMATCH (chờ → đồng ý → trận mới) · BACK TO LOBBY
  A = await mo('A2', ['canon', 'bang', 'lien', 'laser', 'doc'], 'Tung');
  B = await mo('B2', ['drone', 'bao', 'kiembang', 'hydra', 'anhsang'], 'Linh');
  const code = await vaoTran(A, B);
  const k0 = await A.p.evaluate(() => ONL.meta.k0);
  await thuaThat(A);
  for (const X of [A, B]) { await cho(X.p, () => !document.getElementById('ketqua').hidden && document.querySelector('#ketqua .kqo-nut')); }
  await sleep(1200);
  const [ma, mb] = [await man(A.p), await man(B.p)];
  kt(ma.ten === 'DEFEAT' && mb.ten === 'DEFEAT' && /0\/3/.test(await A.p.textContent('#kq-chi')), 'Tim chung về 0 → DEFEAT thật ở cả 2 máy');
  kt(ma.nut.join('|') === 'REMATCH|BACK TO LOBBY|HOME' && mb.nut.join('|') === 'REMATCH|BACK TO LOBBY|HOME', 'Bạn còn trong phòng: REMATCH · BACK TO LOBBY · HOME (A: ' + ma.nut.join(', ') + ' / B: ' + mb.nut.join(', ') + ')');
  await chup(A.p, '05_A_defeat_online_ca_hai_con');
  await A.p.click('#ketqua [data-act="kqo-re"]');
  await cho(B.p, () => /ACCEPT REMATCH/.test(document.querySelector('#ketqua .kqo-nut').textContent));
  m = await man(A.p);
  kt(/WAITING FOR LINH/.test(m.nut.join()) && /Rematch request sent/.test(m.tt), 'A bấm REMATCH → trạng thái chờ: ' + m.nut[0] + ' · ' + m.tt);
  await chup(A.p, '06_A_rematch_dang_cho');
  m = await man(B.p);
  kt(/Tung wants a rematch/.test(m.tt), 'B thấy lời mời: ' + m.tt + ' · ' + m.nut[0]);
  await chup(B.p, '07_B_loi_moi_rematch');
  s = await A.p.evaluate(() => ({ kt: !!G.ketThuc, kq: !document.getElementById('ketqua').hidden }));
  kt(s.kt && s.kq, 'Một người bấm thì chưa bắt đầu (cả 2 phải đồng ý)');
  await B.p.click('#ketqua [data-act="kqo-re"]');
  for (const X of [A, B]) await cho(X.p, () => ONS.on && G.ban.length === 2 && !G.ketThuc && document.getElementById('ketqua').hidden, null, 15000);
  const k1 = await A.p.evaluate(() => ONL.meta.k0);
  await cho(A.p, () => G.wave >= 1, null, 60000); await cho(B.p, () => G.wave >= 1, null, 30000);
  await sleep(2500);
  const [ta, tb] = [await A.p.evaluate(() => ONS.tom()), await B.p.evaluate(() => ONS.tom())];
  kt(k1 !== k0 && ta.on && tb.on && ta.tim === 3 && ta.wave >= 1 && Math.abs(ta.wave - tb.wave) <= 1 && ta.soAct > 0 && tb.soAct > 0, 'Cả 2 đồng ý → trận mới với cả 2 (wave A=' + ta.wave + ' B=' + tb.wave + ', tim ' + ta.tim + ', act ' + ta.soAct + '/' + tb.soAct + ')');
  await chup(B.p, '08_B_tran_dau_lai');
  // thua lần 2 → B về sảnh → A thấy "đang chờ ở sảnh" → A về sảnh → cả 2 cùng phòng
  await thuaThat(A);
  for (const X of [A, B]) await cho(X.p, () => !document.getElementById('ketqua').hidden && document.querySelector('#ketqua .kqo-nut'));
  await sleep(1200);
  await B.p.click('#ketqua [data-act="kqo-sanh"]');
  await cho(A.p, () => /waiting in the lobby/.test((document.getElementById('kqo-tt') || {}).textContent || ''));
  m = await man(A.p);
  kt(m.nut.join('|') === 'BACK TO LOBBY|HOME' && !m.nut.includes('REMATCH'), 'B về sảnh → A: "' + m.tt + '" · nút ' + m.nut.join(', '));
  await chup(A.p, '09_A_ban_o_sanh');
  await A.p.click('#ketqua [data-act="kqo-sanh"]');
  for (const X of [A, B]) await cho(X.p, () => !document.getElementById('onl-sanh').hidden && document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length === 2);
  s = await B.p.evaluate(() => ({ code: ONL.code, st: ONL.meta && ONL.meta.st }));
  kt(s.code === code && s.st === 'cho', 'BACK TO LOBBY → cả 2 ở sảnh CÙNG phòng ' + code + ' (st=' + s.st + ')');
  await chup(B.p, '10_B_sanh_cung_phong');
  // lại vào trận từ sảnh, thua, rồi B về HOME → A: REMATCH ẩn, FIND NEW PARTNER / PLAY SOLO
  await A.p.click('#sanh-san'); await B.p.click('#sanh-san');
  for (const X of [A, B]) await cho(X.p, () => ONS.on && G.ban.length === 2 && !G.ketThuc, null, 20000);
  await cho(A.p, () => G.wave >= 1, null, 60000); await sleep(2000);
  await thuaThat(A);
  for (const X of [A, B]) await cho(X.p, () => !document.getElementById('ketqua').hidden && document.querySelector('#ketqua .kqo-nut'));
  await sleep(1200);
  await B.p.click('#ketqua [data-act="kqo-nha"]');
  await cho(A.p, () => /FIND NEW PARTNER/.test(document.querySelector('#ketqua .kqo-nut').textContent));
  m = await man(A.p);
  kt(!m.nut.includes('REMATCH') && m.nut.join('|') === 'FIND NEW PARTNER|PLAY SOLO|HOME', 'B về HOME → A: REMATCH ẩn · ' + m.nut.join(', ') + ' · "' + m.tt + '"');
  s = await B.p.evaluate(() => ({ chon: !document.getElementById('chon').hidden, code: ONL.code }));
  kt(s.chon && !s.code, 'B: HOME → menu, đã rời phòng');
  await chup(A.p, '11_A_ban_da_di');
  await A.p.click('#ketqua [data-act="kqo-moi"]'); await sleep(800);
  s = await A.p.evaluate(() => ({ bang: !(document.getElementById('onl-bang') || { hidden: true }).hidden, code: ONL.code }));
  kt(s.bang && !s.code, 'FIND NEW PARTNER → bảng ONLINE (tạo / vào phòng mới) ' + JSON.stringify(s));
  await chup(A.p, '12_A_tim_ban_moi');
  await A.ctx.close(); await B.ctx.close();

  }
  if (CHI.includes('3')) {
  // ===== 3) mất mạng khi còn tim → MATCH ENDED · Connection lost
  A = await mo('A3', ['canon', 'bang', 'lien', 'laser', 'doc'], 'Tung');
  B = await mo('B3', ['drone', 'bao', 'kiembang', 'hydra', 'anhsang'], 'Linh');
  await vaoTran(A, B);
  await A.p.evaluate(() => { NET._mockNgat(4000); setTimeout(() => ketThuc(false, 'Online match ended'), 300); });
  await cho(A.p, () => !document.getElementById('ketqua').hidden); await sleep(900);
  m = await man(A.p);
  kt(m.ten === 'MATCH ENDED' && /Connection lost/.test(m.phu) && !m.thua, 'Mất mạng, còn tim → MATCH ENDED · ' + m.phu);
  await chup(A.p, '13_A_match_ended_mat_mang');
  await A.ctx.close(); await B.ctx.close();
  }
  if (CHI.includes('4')) {
  // ===== 4) bạn rời → AI chơi tiếp → tim về 0 → DEFEAT thật + dòng "AI took over", nút "bạn đã đi"
  A = await mo('A4', ['canon', 'bang', 'lien', 'laser', 'doc'], 'Tung');
  B = await mo('B4', ['drone', 'bao', 'kiembang', 'hydra', 'anhsang'], 'Linh');
  await vaoTran(A, B);
  await B.ctx.close(); // B đóng hẳn ứng dụng
  await cho(A.p, () => ONS.thay, null, 30000); await sleep(1500);
  s = await A.p.evaluate(() => ({ kt: !!G.ketThuc, ai: G.ban[1].ai }));
  kt(!s.kt && s.ai, 'B đóng ứng dụng → sau ân hạn AI lái bàn B, trận A chạy tiếp (không DEFEAT)');
  await thuaThat(A);
  await cho(A.p, () => !document.getElementById('ketqua').hidden && document.querySelector('#ketqua .kqo-nut')); await sleep(1200);
  m = await man(A.p);
  kt(m.ten === 'DEFEAT' && /Linh left at wave \d+ — AI took over/.test(m.meo) && m.nut.join('|') === 'FIND NEW PARTNER|PLAY SOLO|HOME', 'Tim về 0 sau khi AI thay → DEFEAT thật · "' + m.meo.slice(0, 60) + '…" · ' + m.nut.join(', '));
  await chup(A.p, '14_A_defeat_sau_khi_AI_thay');
  await A.ctx.close();
  }
  await b.close();
  const loi = errs.filter(e => !/favicon|ERR_|net::/.test(e));
  kt(!loi.length, 'Không lỗi trang (' + loi.length + ')' + (loi.length ? ': ' + loi.slice(0, 5).join(' | ') : ''));
  fs.writeFileSync(OUT + 'ket-qua.txt', ok.map(x => 'OK   ' + x).concat(hong.map(x => 'FAIL ' + x)).join('\n') + '\n');
  console.log('\n' + ok.length + ' OK, ' + hong.length + ' FAIL');
  process.exit(hong.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
