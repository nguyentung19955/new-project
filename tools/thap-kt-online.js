// TURRET MERGE — kiểm CO-OP online bằng 2 trình duyệt (2 Playwright context = 2 người chơi) trên máy chủ GIẢ
// (tools/thap-online-mock-server.js, không dùng Firebase/tài khoản thật).
// Chạy:  DELAY=40 NODE_PATH=<nơi có ws> node tools/thap-online-mock-server.js 8787 &
//        OUT=docs/demo-hop-tuong/tuvan/online/ node tools/thap-kt-online.js
// Kiểm: tạo phòng · vào bằng mã · sảnh 2 bộ bài + READY · cùng vào trận (cùng hạt giống) · chơi ≥ 2 wave (bàn mình do ?auto=1 lái)
//       · hành động bên này hiện ở bàn đồng đội bên kia · 3 tim chung (khách lọt quái → host trừ → cả 2 cùng số)
//       · rớt mạng 6 s → không dừng · tải lại trang → REJOIN MATCH · bạn rời hẳn → tự giao AI (không bảng che) · không lỗi trang.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.env.OUT || 'shots/online/';
const PORT = +(process.env.PORT || 8787);
const URL = `http://localhost:${PORT}/thap/?net=mock&mockws=ws://localhost:${PORT}&nointro=1&notut=1&auto=1`;
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const ok = [], hong = [], errs = [];
const kt = (dk, s) => { (dk ? ok : hong).push(s); console.log((dk ? 'OK   ' : 'FAIL ') + s); };

(async () => {
  const b = await chromium.launch();
  const mo = async (ten, deck) => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    const nghe = (pg) => { pg.on('pageerror', e => errs.push(ten + ' :: ' + e.message)); pg.on('console', x => { if (x.type() === 'error') errs.push(ten + ' :: console ' + x.text()); }); };
    nghe(p); ctx.on('page', nghe);
    await p.goto(URL, { waitUntil: 'load' });
    await p.waitForFunction(() => typeof UI !== 'undefined' && UI.chon && document.querySelector('#onl-nut') && NET.ok, null, { timeout: 30000 });
    await p.evaluate((d) => { UI.chon = d; UI.veBoChon(); }, deck);
    return { ctx, p, ten };
  };
  const A = await mo('A', ['canon', 'bang', 'lien', 'laser', 'doc']);
  const Bp = await mo('B', ['drone', 'bao', 'kiembang', 'hydra', 'anhsang']);
  // hồ sơ: đổi tên + ảnh đại diện + đăng nhập "Google" (giả) bên A
  await A.p.click('#tk-chip'); await A.p.fill('#tk-ten', 'Tung'); await A.p.click('.tk-a[data-av="cuuvi"]');
  await A.p.screenshot({ path: OUT + '01_A_ho_so.png' });
  await A.p.click('#tk-google'); await sleep(300);
  kt(await A.p.evaluate(() => NET.user && !NET.user.anon), 'A: Sign in with Google (giả) → tài khoản không còn ẩn danh, giữ uid');
  await A.p.click('[data-act="tk-dong"]');
  await Bp.p.click('#tk-chip'); await Bp.p.fill('#tk-ten', 'Ban'); await Bp.p.click('.tk-a[data-av="hydra"]'); await Bp.p.click('[data-act="tk-dong"]');
  await sleep(300);
  kt(await A.p.evaluate(() => NET.get('profiles/' + NET.user.uid).then(v => v && v.name === 'Tung' && v.av === 'cuuvi' && v.g === true)), 'Hồ sơ A lưu lên máy chủ (tên, ảnh, g=Google)');

  // 1) tạo phòng / vào phòng
  await A.p.evaluate(() => ONL.moBang()); await A.p.click('[data-act="onl-tao"]');
  await A.p.waitForFunction(() => /^[A-Z]{4}$/.test((document.querySelector('#sanh-ma') || {}).textContent || ''), null, { timeout: 10000 });
  const code = await A.p.textContent('#sanh-ma');
  kt(/^[A-Z]{4}$/.test(code), 'Tạo phòng → mã 4 chữ: ' + code);
  await Bp.p.evaluate(() => ONL.moBang()); await Bp.p.fill('#onl-ma', code); await Bp.p.click('[data-act="onl-vao"]');
  await A.p.waitForFunction(() => document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length === 2, null, { timeout: 10000 });
  await Bp.p.waitForFunction(() => document.querySelectorAll('#sanh-ds .sanh-p:not(.trong)').length === 2, null, { timeout: 10000 });
  const sanh = await Bp.p.evaluate(() => [...document.querySelectorAll('#sanh-ds .sanh-p')].map(e => ({ ten: e.querySelector('b').textContent, u: e.querySelectorAll('.sp-u').length, mv: !!e.querySelector('.sp-mv img') })));
  kt(sanh.length === 2 && sanh.every(x => x.u === 5 && x.mv), 'Sảnh: 2 người, mỗi người 5 thẻ + chỉ huy ' + JSON.stringify(sanh));
  await A.p.screenshot({ path: OUT + '02_A_sanh.png' });
  // người thứ 3 không vào được phòng đầy
  const C = await mo('C', ['canon', 'bang', 'lien', 'laser', 'doc']);
  await C.p.evaluate(() => ONL.moBang()); await C.p.fill('#onl-ma', code); await C.p.click('[data-act="onl-vao"]'); await sleep(800);
  kt(/full/i.test(await C.p.textContent('#onl-loi')), 'Người thứ 3: "Room is full"');
  await C.ctx.close();
  // 2) READY cả 2 → vào trận
  await A.p.click('#sanh-san'); await Bp.p.click('#sanh-san');
  await Bp.p.screenshot({ path: OUT + '03_B_sanh_ready.png' });
  await A.p.waitForFunction(() => ONS.on && G.ban.length === 2, null, { timeout: 15000 });
  await Bp.p.waitForFunction(() => ONS.on && G.ban.length === 2, null, { timeout: 15000 });
  kt(true, 'Cả 2 READY → cả 2 vào trận CO-OP online');
  const deckDoi = await Bp.p.evaluate(() => G.ban[1].deck.join(','));
  kt(deckDoi === 'canon,bang,lien,laser,doc', 'Bàn đồng đội ở máy B dùng đúng bộ bài của A: ' + deckDoi);

  // 3) chơi ≥ 2 wave
  await A.p.waitForFunction(() => G.wave >= 2, null, { timeout: 80000 });
  await Bp.p.waitForFunction(() => G.wave >= 2, null, { timeout: 20000 });
  await sleep(2500);
  const [ta, tb] = await Promise.all([A.p.evaluate(() => ONS.tom()), Bp.p.evaluate(() => ONS.tom())]);
  console.log('A', JSON.stringify(ta)); console.log('B', JSON.stringify(tb));
  kt(ta.wave >= 2 && Math.abs(ta.wave - tb.wave) <= 0, 'Cùng wave: A=' + ta.wave + ' B=' + tb.wave);
  const giong = (x, y) => x.filter((v, i) => v === y[i]).length;
  kt(giong(ta.toi, tb.ban) >= 13, 'Bàn A ↔ bàn đồng đội ở B: ' + giong(ta.toi, tb.ban) + '/15 ô giống');
  kt(giong(tb.toi, ta.ban) >= 13, 'Bàn B ↔ bàn đồng đội ở A: ' + giong(tb.toi, ta.ban) + '/15 ô giống');
  kt(ta.soAct > 3 && tb.soAct > 3, 'Hành động truyền qua lại: A nhận ' + ta.soAct + ', B nhận ' + tb.soAct);
  kt(ta.ping > 0 && ta.ping < 1000, 'Ping hiển thị: ' + ta.ping + ' ms (máy chủ giả trễ DELAY ms/chiều)');
  // cùng hạt giống: quái trên làn của A ở máy A giống làn đồng đội ở máy B (loại quái)
  const lanA = await A.p.evaluate(() => G.quai.filter(E => E.p === 0 && !E.chet).map(E => E.id).sort().join(','));
  const lanAoB = await Bp.p.evaluate(() => G.quai.filter(E => E.p === 1 && !E.chet).map(E => E.id).sort().join(','));
  console.log('làn A @A:', lanA, '| @B:', lanAoB);
  await A.p.screenshot({ path: OUT + '04_A_tran_wave2.png' }); await Bp.p.screenshot({ path: OUT + '05_B_tran_wave2.png' });
  // hành động soi gương: A triệu hồi 1 ụ → trong ≤ 1 s xuất hiện ở bàn đồng đội của B, cùng ô + loại
  const tr = await A.p.evaluate(() => { const B = G.ban[0]; B.mana += 500; const T = trieu(B); return T ? { o: T.o, id: T.id } : null; });
  await sleep(700);
  if (tr) kt(await Bp.p.evaluate((t) => { const T = G.ban[1].t[t.o]; return !!T && T.id === t.id; }, tr), 'A triệu hồi ' + tr.id + ' ô ' + tr.o + ' → B thấy ngay ở bàn đồng đội');
  else kt(false, 'A không triệu hồi được (bàn đầy?)');

  // 4) tim chung: khách (B) để lọt 1 quái trên làn của mình
  const tim0 = await A.p.evaluate(() => G.ban[0].tim);
  await Bp.p.evaluate(() => { const E = sinhQuai('bo', 0, G.duong[0].len - 0.5); E.vao = 1; E.tim = 1; });
  await sleep(1200);
  const [timA, timB] = await Promise.all([A.p.evaluate(() => G.ban[0].tim), Bp.p.evaluate(() => G.ban[0].tim)]);
  kt(timA === tim0 - 1 && timB === timA, 'Tim chung: B lọt 1 quái → A ' + tim0 + '→' + timA + ', B = ' + timB);

  // 5) rớt mạng 6 s bên B → KHÔNG dừng trận bên nào, không bảng che, không giao AI (ân hạn 12 s)
  await Bp.p.evaluate(() => NET._mockNgat(6000));
  await sleep(5200);
  const [ma, mb] = await Promise.all([A.p.evaluate(() => ({ dung: G.dung, modal: !!document.querySelector('#onl-mat:not([hidden])'), thay: !!ONS.thay })), Bp.p.evaluate(() => ({ dung: G.dung, modal: !!document.querySelector('#onl-mat:not([hidden])'), thay: !!ONS.thay }))]);
  kt(!ma.dung && !mb.dung && !ma.modal && !mb.modal && !ma.thay && !mb.thay, 'Rớt mạng 6 s: cả 2 chạy tiếp, không bảng che, không giao AI');
  await A.p.screenshot({ path: OUT + '06_A_ban_mat_mang.png' }); await Bp.p.screenshot({ path: OUT + '07_B_mat_mang.png' });
  await sleep(4500);
  const [ra, rb] = await Promise.all([A.p.evaluate(() => ({ thay: !!ONS.thay, dung: G.dung })), Bp.p.evaluate(() => ({ thay: !!ONS.thay, dung: G.dung }))]);
  kt(!ra.thay && !ra.dung && !rb.thay && !rb.dung, 'Nối lại mạng → cả 2 vẫn chơi chung (không giao AI)');

  // 6) B tải lại trang → REJOIN MATCH
  const wTruoc = await A.p.evaluate(() => G.wave);
  await Bp.p.reload({ waitUntil: 'load' });
  await Bp.p.waitForFunction(() => typeof UI !== 'undefined' && document.querySelector('#onl-nut') && NET.ok, null, { timeout: 30000 });
  await Bp.p.evaluate(() => { UI.chon = ['drone', 'bao', 'kiembang', 'hydra', 'anhsang']; UI.veBoChon(); });
  await Bp.p.evaluate(() => ONL.moBang());
  await Bp.p.waitForSelector('#onl-lai:not([hidden])', { timeout: 8000 });
  await Bp.p.screenshot({ path: OUT + '08_B_rejoin.png' });
  await Bp.p.click('#onl-lai');
  await Bp.p.waitForFunction(() => ONS.on && G.ban.length === 2 && G.wave >= 1, null, { timeout: 15000 });
  await sleep(4000);
  const [ja, jb] = await Promise.all([A.p.evaluate(() => ONS.tom()), Bp.p.evaluate(() => ONS.tom())]);
  kt(!ja.mat && !ja.dung && Math.abs(jb.wave - ja.wave) <= 1 && jb.tim === ja.tim, 'REJOIN: B vào lại wave ' + jb.wave + ' (A ' + ja.wave + ', trước ' + wTruoc + '), tim ' + jb.tim + '=' + ja.tim + ', A chạy tiếp');
  kt(giong(jb.toi, ja.ban) >= 12, 'REJOIN: bàn B khôi phục từ ảnh chụp: ' + giong(jb.toi, ja.ban) + '/15 ô khớp bàn đồng đội ở A');
  await Bp.p.screenshot({ path: OUT + '09_B_sau_rejoin.png' });

  // 6b) hết tim → cả 2 thấy màn kết quả → PLAY AGAIN → về sảnh → READY → trận mới
  await A.p.evaluate(() => { G.ban[0].tim = 1; ONS.ghiState(); });
  await sleep(600);
  await Bp.p.evaluate(() => { const E = sinhQuai('bo', 0, G.duong[0].len - 0.5); E.vao = 1; E.tim = 1; });
  await A.p.waitForFunction(() => !!G.ketThuc, null, { timeout: 8000 });
  await Bp.p.waitForFunction(() => !!G.ketThuc, null, { timeout: 8000 });
  await A.p.waitForSelector('#ketqua:not([hidden])', { timeout: 8000 }); await Bp.p.waitForSelector('#ketqua:not([hidden])', { timeout: 8000 });
  kt(true, 'Hết 3 tim chung → cả 2 máy hiện màn kết quả');
  await Bp.p.screenshot({ path: OUT + '09b_B_ket_qua.png' });
  const hs = await A.p.evaluate(() => TK.ho);
  kt(hs.games >= 1 && hs.bestWave >= 2, 'Hồ sơ cập nhật sau trận: ' + JSON.stringify(hs));
  // hết trận: chủ phòng xoá phòng sau 5 s; khách rời im lặng
  await sleep(6500);
  const conPhong = await A.p.evaluate((c) => NET.get('rooms/' + c + '/meta'), code);
  const kCode = await Bp.p.evaluate(() => ONL.code);
  kt(conPhong === null && kCode === null, 'Hết trận: chủ phòng đã xoá phòng ' + code + ', khách tự rời');
  await A.p.click('#ketqua [data-act="choilai"]'); await Bp.p.click('#ketqua [data-act="choilai"]');
  await A.p.waitForSelector('#onl-bang:not([hidden])', { timeout: 8000 }); await Bp.p.waitForSelector('#onl-bang:not([hidden])', { timeout: 8000 });
  kt(true, 'PLAY ONLINE AGAIN → cả 2 về bảng ONLINE');
  await A.p.click('[data-act="onl-tao"]');
  await A.p.waitForFunction((c) => { const t = (document.querySelector('#sanh-ma') || {}).textContent || ''; return /^[A-Z]{4}$/.test(t) && t !== c && !document.querySelector('#onl-sanh').hidden; }, code, { timeout: 8000 });
  const code2 = await A.p.textContent('#sanh-ma');
  await Bp.p.fill('#onl-ma', code2); await Bp.p.click('[data-act="onl-vao"]');
  await Bp.p.waitForSelector('#onl-sanh:not([hidden])', { timeout: 8000 });
  kt(true, 'Phòng mới ' + code2 + ': cả 2 vào sảnh');
  await sleep(800);
  await A.p.click('#sanh-san'); await Bp.p.click('#sanh-san');
  await A.p.waitForFunction(() => ONS.on && G.ban.length === 2 && !G.ketThuc, null, { timeout: 15000 });
  await Bp.p.waitForFunction(() => ONS.on && G.ban.length === 2 && !G.ketThuc, null, { timeout: 15000 });
  await A.p.waitForFunction(() => G.wave >= 1, null, { timeout: 20000 }); await sleep(2500);
  const [na, nb] = await Promise.all([A.p.evaluate(() => ONS.tom()), Bp.p.evaluate(() => ONS.tom())]);
  kt(na.tim === 3 && nb.tim === 3 && nb.wave === na.wave && na.wave <= 2, 'Trận mới: tim 3/3, wave ' + na.wave + '/' + nb.wave);

  // 7) B đóng hẳn → A KHÔNG bị chặn: sau ân hạn 12 s bàn đồng đội tự giao cho AI (không bảng che, không bấm gì)
  await Bp.ctx.close();
  await sleep(3000);
  kt(await A.p.evaluate(() => !G.dung && !document.querySelector('#onl-mat:not([hidden])')), 'B rời: A không dừng, không bảng che');
  await A.p.waitForFunction(() => ONS.thay && G.ban[1].ai && !G.ban[1].net, null, { timeout: 20000 });
  await A.p.screenshot({ path: OUT + '10_A_ban_roi_AI.png' });
  const ai = await A.p.evaluate(() => ({ dung: G.dung, t: G.t }));
  await sleep(1500);
  const t2 = await A.p.evaluate(() => G.t);
  kt(!ai.dung && t2 > ai.t, 'Bạn rời → tự CHƠI TIẾP VỚI AI, trận chạy tiếp');
  await A.p.screenshot({ path: OUT + '11_A_choi_voi_AI.png' });

  kt(errs.length === 0, 'Không lỗi trang (' + errs.length + ')');
  if (errs.length) console.log(errs.slice(0, 20).join('\n'));
  fs.writeFileSync(OUT + 'ket-qua.txt', ok.map(s => 'OK   ' + s).concat(hong.map(s => 'FAIL ' + s), errs.map(s => 'ERR  ' + s)).join('\n') + '\n');
  await b.close();
  process.exit(hong.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
