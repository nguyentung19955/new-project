// Phép thử LUỒNG KHỞI ĐẦU (phiên "Khởi đầu – đợt 1") theo docs/khoi-dau/tu-van-chatgpt.txt mục 12.
// iPhone ngang 844×390, có cảm ứng. Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765 &) ; node tools/khoi-dau/kiem-thu-luong.js [thư-mục-ảnh-NGOÀI-repo]
const {chromium} = require('playwright');
const GOC = 'http://localhost:8765/game/';
const ANH = process.argv[2] || null;
(async () => {
  const b = await chromium.launch(); let hong = 0, dat = 0;
  const ok = (dk, t, x) => { console.log((dk ? 'ĐẠT ' : 'HỎNG ') + t + (x !== undefined && !dk ? ' – ' + JSON.stringify(x) : '')); if (dk) dat++; else hong++; };
  const ctx = await b.newContext({viewport:{width:844, height:390}, hasTouch:true, isMobile:true, deviceScaleFactor:2});
  const pg = await ctx.newPage(), loi = [];
  pg.on('pageerror', e => loi.push(e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/net::ERR_|favicon|status of 404/.test(m.text())) loi.push(m.text()); });
  const chup = async ten => { if (ANH) await pg.screenshot({path:ANH + '/' + ten + '.png'}); };
  const choTieuDe = async () => { await pg.waitForFunction(() => window.TIEU_DE && TIEU_DE.xong, null, {timeout:20000}); await pg.waitForTimeout(300); };
  const choLang = async () => { await pg.waitForFunction(() => window.LANG && LANG.xong && LANG.S, null, {timeout:30000}); await pg.waitForTimeout(300); };
  const choVung = async () => { await pg.waitForFunction(() => window.TV && TV.xong && TV.G.trang === 'choi', null, {timeout:40000}); await pg.waitForTimeout(400); };
  const hien = sel => pg.evaluate(s => { const e = document.querySelector(s); if (!e) return false; const c = getComputedStyle(e), r = e.getBoundingClientRect(); return c.display !== 'none' && c.visibility !== 'hidden' && r.width > 0 && r.height > 0; }, sel);
  const chuPhim = () => pg.evaluate(() => { const k = document.getElementById('keys'); const t = document.body.innerText; return (k && getComputedStyle(k).display !== 'none') || /Keys:|Z \/ Enter|← → move/.test(t); });

  /* (A) khách mới: tiêu đề chỉ NEW GAME, không đăng nhập, không link vùng / Demo */
  await pg.goto(GOC + 'index.html'); await choTieuDe();
  ok(!(await hien('#b-tiep')) && await hien('#b-moi'), 'A: chưa có lưu → chỉ NEW GAME (không Continue chết)');
  const chuTD = await pg.evaluate(() => document.body.innerText);
  ok(!/Region 1|Region 2|Demo Room|Sign in|Export|Import/.test(chuTD), 'A: tiêu đề không có link vùng / Demo / đăng nhập / xuất-nhập', chuTD);
  const nutTD = await pg.evaluate(() => [...document.querySelectorAll('#cot .kd-nut')].filter(e => e.offsetParent).map(e => { const r = e.getBoundingClientRect(), fs = parseFloat(getComputedStyle(e).fontSize); return {id:e.id, h:r.height, x:r.left, r:r.right, y:r.top, b:r.bottom, fs}; }));
  ok(nutTD.every(n => n.h >= 44 && n.fs >= 19 && n.fs <= 23 && n.x >= 0 && n.r <= 844 - 24 && n.y >= 24 && n.b <= 390 - 24), 'A: nút ≥ 44 px, chữ 19–23 px (hệ font A: 23 nút chính, 21 nút phụ), trong vùng an toàn', nutTD);
  ok(await pg.evaluate(() => { const i = document.getElementById('logo'); return !i.hidden && i.naturalWidth === 800; }), 'A: logo ảnh ChatGPT đã lắp');
  await chup('01-tieu-de-khach');
  /* Options + Account (bảng phủ) */
  await pg.tap('#b-tc'); await pg.waitForTimeout(200);
  ok(await hien('#kd-tc') && await hien('#kd-b-xuat'), 'Options: âm lượng + Export/Import nằm trong Options');
  await pg.evaluate(() => { const i = document.querySelector('#kd-tc input[data-k=master]'); i.value = 40; i.dispatchEvent(new Event('input')); });
  await chup('02-options');
  await pg.tap('#kd-b-tc-dong');
  await pg.tap('#b-tk'); await pg.waitForTimeout(200);
  const ttTk = await pg.evaluate(() => document.getElementById('kd-tk-tt').textContent);
  ok(/^(Guest · On-device save|Signed in · Synced|Offline · Saved on device|Action needed · Choose a save|Syncing…|Sync failed · Saved on device)$/.test(ttTk), 'Account: trạng thái bằng chữ rõ', ttTk);
  await chup('03-account');
  await pg.tap('#kd-b-tk-dong');
  /* (L, chưa lưu) NEW GAME → vào thẳng mở đầu */
  await pg.tap('#b-moi');
  await pg.waitForURL(/lang-chuong/, {timeout:10000}); await choLang();
  ok(await pg.evaluate(() => LANG.S.che === 'canh'), 'A: NEW GAME → phim mở đầu');
  ok(await hien('#b-bo'), 'A: Skip hiện ngay từ tranh 1');
  ok(!(await pg.evaluate(() => /waiting for art/i.test(document.body.innerText))), 'Làng: không còn chữ "waiting for art"');
  await chup('04-mo-dau');
  await pg.tap('#b-bo'); await pg.waitForTimeout(300);
  ok(await pg.evaluate(() => LANG.S.che === 'choi' && LuuChung.daXem('mo-dau')), 'C: bỏ qua mở đầu → vào làng, ghi đã xem');
  const x0 = await pg.evaluate(() => LANG.P.x);
  ok(Math.abs(x0 - 1590) < 200, 'Làng: xuất phát gần Vesper', x0);
  ok(await pg.evaluate(() => !LANG.S.daDi), 'Làng: chưa đi → gợi ý "Drag to move"');
  ok(!(await chuPhim()), 'K: làng không hiện chữ phím trên cảm ứng');
  await chup('05-lang-goi-y');
  // kéo nửa trái màn để đi (cảm ứng thật)
  await pg.evaluate(() => { const c = document.getElementById('cv'), r = c.getBoundingClientRect(), x = r.left + 120, y = r.top + 250;
    c.dispatchEvent(new PointerEvent('pointerdown', {clientX:x, clientY:y, pointerId:7, bubbles:true}));
    dispatchEvent(new PointerEvent('pointermove', {clientX:x + 80, clientY:y, pointerId:7, bubbles:true})); });
  await pg.waitForTimeout(700);
  await pg.evaluate(() => dispatchEvent(new PointerEvent('pointerup', {clientX:0, clientY:0, pointerId:7, bubbles:true})));
  const x1 = await pg.evaluate(() => LANG.P.x);
  ok(x1 > x0 + 20 && await pg.evaluate(() => LANG.S.daDi), 'A: kéo để đi trong làng', [x0, x1]);
  await chup('06-lang-tim-chuong');
  /* tạm dừng thật trong làng */
  await pg.tap('#kd-b-dung'); await pg.waitForTimeout(200);
  const xd = await pg.evaluate(() => [LANG.S.che, LANG.P.x]); await pg.waitForTimeout(400);
  ok(xd[0] === 'tam_dung' && await hien('#kd-dung') && (await pg.evaluate(() => LANG.P.x)) === xd[1], 'N: tạm dừng ở làng dừng thật', xd);
  ok(await pg.evaluate(() => ['kd-b-tiep-choi', 'kd-b-lt', 'kd-b-map', 'kd-b-tc', 'kd-b-nk', 'kd-b-ve'].every(id => document.getElementById(id))), 'Pause: đủ Resume / Map / Journal / Lattice / Options / Return to Title');
  await chup('07-lang-tam-dung');
  await pg.tap('#kd-b-tiep-choi'); await pg.waitForTimeout(100);
  ok(await pg.evaluate(() => LANG.S.che === 'choi'), 'Pause: Resume chơi tiếp');
  /* đi tới chuông, rung → bảng đích */
  await pg.evaluate(() => { for (let i = 0; i < 400 && LANG.S.gan?.id !== 'chuong'; i++) LANG.buoc(1, 'r'); LANG.buoc(1, 'u'); LANG.buoc(80, ''); });
  const menu = await pg.evaluate(() => LANG.S.menu && LANG.S.menu.chon.map(c => c.chu + (c.khoa ? ' [khoa]' : '')));
  ok(menu && menu.includes('Weeping Heartwood — Enter') && menu.includes('Rotting Roots — Defeat the Hollow Bell Mother [khoa]') && !menu.some(c => /Bell Village|First Silence/.test(c)), 'Chuông: bảng đích đúng chữ, Rotting Roots khoá mờ', menu);
  ok(!(await pg.evaluate(() => getComputedStyle(document.getElementById('b-bo')).visibility === 'visible')), 'Chuông: bảng teleport không hiện Skip');
  await chup('08-bang-dich');
  await pg.evaluate(() => LANG.buoc(1, 'ok'));
  await pg.evaluate(() => { for (let i = 0; i < 80; i++) LANG.buoc(1, ''); });
  await pg.waitForURL(/vung-1/, {timeout:15000}); await choVung();
  ok(!(await pg.evaluate(() => !!document.querySelector('.lop.mo'))) && !(await hien('#kd-tai')), 'A: vào Vùng 1 KHÔNG qua menu vùng');
  ok(await pg.evaluate(() => TV.G.id === 'P01'), 'A: Vùng 1 phòng đầu', await pg.evaluate(() => TV.G.id));
  ok(!(await chuPhim()), 'K: Vùng 1 không hiện chữ phím trên cảm ứng');
  await chup('09-vung-1-vao');
  /* tạm dừng thật ở vùng */
  await pg.tap('#kd-b-dung'); await pg.waitForTimeout(150);
  const t0 = await pg.evaluate(() => [TV.G.trang, TV.E.pl.x, TV.E.pl.y, TV.G.luu.giay]); await pg.waitForTimeout(600);
  const t1 = await pg.evaluate(() => [TV.G.trang, TV.E.pl.x, TV.E.pl.y, TV.G.luu.giay]);
  ok(t0[0] === 'tam_dung' && t1[1] === t0[1] && t1[2] === t0[2] && t1[3] === t0[3], 'N: tạm dừng Vùng 1 dừng thật', [t0, t1]);
  await chup('10-vung-1-tam-dung');
  await pg.tap('#kd-b-tiep-choi'); await pg.waitForTimeout(100);
  /* nghỉ Chuông Lưu P05 → Return to Title → CONTINUE về đúng P05 */
  await pg.evaluate(async () => { await TV.V1.batDau(false, 'P05'); TV.V1.nghiChuong(); });
  ok(await pg.evaluate(() => LuuChung.noiCuoi().noi === 'vung-1' && LuuChung.noiCuoi().phong === 'P05'), 'D: nghỉ Chuông Lưu ghi nơi an toàn');
  await pg.evaluate(() => document.getElementById('b-di').click());
  await pg.tap('#kd-b-dung'); await pg.tap('#kd-b-ve'); await pg.waitForTimeout(150);
  ok(await hien('#kd-hop'), 'Pause: Return to Title có xác nhận');
  await pg.tap('#kd-b-ve-ok');
  await pg.waitForURL(/game\/index\.html/, {timeout:10000}); await choTieuDe();
  const tt = await pg.evaluate(() => document.getElementById('tt').innerText);
  ok(await hien('#b-tiep') && /Weeping Heartwood · Rest Bell/.test(tt) && /Saved/.test(tt), 'D: tiêu đề có CONTINUE + "Weeping Heartwood · Rest Bell" + thời gian', tt);
  await chup('11-tieu-de-co-luu');
  await pg.tap('#b-tiep');
  await pg.waitForURL(/vung-1/, {timeout:10000}); await choVung();
  ok(await pg.evaluate(() => TV.G.id === 'P05' && !document.querySelector('.lop.mo')), 'D: CONTINUE về đúng Chuông Lưu P05, không menu', await pg.evaluate(() => TV.G.id));
  /* (E) hạ trùm Vùng 1 (đặt cờ) → cổng P12 → R201 không menu */
  await pg.evaluate(async () => { LuuChung.datCo('ha_trum:vung-1'); TV.G.luu.trumHa = true; TV.G.luu.hetXem = true; TV.V1.ghiLuu(); await TV.V1.batDau(false, 'P12'); });
  await pg.evaluate(() => { TV.V1.datNV(30 * 48, 13 * 48); NoiVung2.moCong(); });
  await pg.evaluate(() => { for (let i = 0; i < 60; i++) TV.mot(); for (let i = 0; i < 200 && !TV.G.chuyen && !LienVung.dangDi; i++){ TV.V1.datNV(Math.min(39.9, 34 + i * 0.1) * 48, 13 * 48); TV.ep.r = 1; TV.mot(); } });
  await pg.waitForURL(/vung-2/, {timeout:15000}); await choVung();
  ok(await pg.evaluate(() => TV.G.id === 'R201' && !document.querySelector('.lop.mo')), 'E: cổng P12 → R201 không menu', await pg.evaluate(() => TV.G.id));
  ok(!(await chuPhim()), 'K: Vùng 2 không hiện chữ phím trên cảm ứng');
  await chup('12-vung-2-qua-cong');
  await pg.goto(GOC + 'lang-chuong/index.html?tiep=1'); await choLang();
  ok(await pg.evaluate(() => LANG.S.che !== 'canh'), 'C: vào lại làng không chiếu lại mở đầu');
  await pg.evaluate(() => { LANG.P.x = 2380; LANG.buoc(2, ''); LANG.buoc(1, 'u'); LANG.buoc(80, ''); });
  const menu2 = await pg.evaluate(() => LANG.S.menu && LANG.S.menu.chon.map(c => c.chu + (c.khoa ? ' [khoa]' : '')));
  ok(menu2 && menu2.includes('Rotting Roots — Enter'), 'E: teleport làng có Rotting Roots', menu2);
  await pg.evaluate(() => LANG.buoc(1, 'bo'));
  /* (L) NEW GAME khi đã có lưu → xác nhận, sao lưu trước khi xoá */
  await pg.goto(GOC + 'index.html'); await choTieuDe();
  await pg.tap('#b-moi'); await pg.waitForTimeout(150);
  ok(await hien('#kd-hop') && /Start a new journey\?/.test(await pg.evaluate(() => document.getElementById('kd-hop').innerText)), 'L: NEW GAME có hộp xác nhận');
  await chup('13-xac-nhan-moi');
  await pg.tap('#b-hop-huy'); await pg.waitForTimeout(100);
  ok(await pg.evaluate(() => !!localStorage.getItem('tvcc-vung1')), 'L: Cancel giữ nguyên hành trình');
  await pg.tap('#b-moi'); await pg.tap('#b-hop-moi');
  await pg.waitForURL(/lang-chuong/, {timeout:10000}); await choLang();
  const sl = await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('tvcc-sao-luu-hanh-trinh') || 'null'); return {sao:!!(s && s.khoa['tvcc-vung1'] && s.khoa['tvcc-vung2']), v1:localStorage.getItem('tvcc-vung1'), v2:localStorage.getItem('tvcc-vung2')}; });
  ok(sl.sao && !sl.v1 && !sl.v2 && await pg.evaluate(() => LANG.S.che === 'canh'), 'L: Start New = sao lưu rồi xoá cả vùng 1/2, mở đầu chiếu lại', sl);
  /* trang vùng mở trơn → về tiêu đề */
  await pg.goto(GOC + 'vung-1/index.html'); await pg.waitForURL(/game\/index\.html/, {timeout:10000});
  ok(true, 'Mở trang vùng trơn → chuyển về màn tiêu đề');
  /* (H) tải vùng lỗi → Retry / Return to Title */
  const p3 = await ctx.newPage();
  await p3.route(/vung-1\/(phong-thu\/)?ban-do\.json/, r => r.abort());
  await p3.goto(GOC + 'vung-1/index.html?tiep=1');
  await p3.waitForFunction(() => window.TV && TV.loi, null, {timeout:20000}).catch(() => {});
  ok(await p3.evaluate(() => /Couldn't load this area/.test(document.body.innerText) && /Retry/.test(document.body.innerText)), 'H: lỗi tải → "Couldn\'t load this area. Retry / Return to Title"');
  if (ANH) await p3.screenshot({path:ANH + '/14-loi-tai.png'});
  await p3.close();
  /* (B) màn dọc */
  const p4 = await b.newPage({viewport:{width:390, height:844}, hasTouch:true, isMobile:true});
  await p4.goto(GOC + 'index.html'); await p4.waitForTimeout(800);
  ok(await p4.evaluate(() => getComputedStyle(document.getElementById('kd-xoay')).display !== 'none'), 'B: màn dọc → "Rotate to Play"');
  if (ANH) await p4.screenshot({path:ANH + '/15-xoay.png'});
  await p4.close();

  ok(loi.length === 0, 'không lỗi JS', loi);
  console.log('\nKẾT QUẢ: ' + dat + '/' + (dat + hong) + ' đạt');
  await b.close(); process.exit(hong ? 1 : 0);
})();
