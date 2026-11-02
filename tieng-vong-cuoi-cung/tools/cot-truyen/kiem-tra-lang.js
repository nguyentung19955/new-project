// Kiểm trình duyệt LÀNG CHUÔNG + móc Vùng 1 (phiên cottruyen).
// Chạy: (python3 -m http.server 8765 &) ; node tools/cot-truyen/kiem-tra-lang.js <thư-mục-NGOÀI-repo>
// Ảnh còn CHỜ (nền làng, NPC trong cảnh, tranh mở đầu…) được thay bằng ẢNH GIẢ một màu CHỈ TRONG PHÉP THỬ (chặn mạng của Playwright),
// sinh vào thư mục ngoài repo – không bao giờ nằm trong game. Mục đích: kiểm logic đi lại, nói chuyện, mở đầu, teleport.
const {chromium} = require('playwright'), fs = require('fs'), path = require('path'), {execFileSync} = require('child_process');
const RA = process.argv[2]; if (!RA) { console.log('cần thư mục ngoài repo'); process.exit(2); }
const GIA = path.join(RA, 'anh-gia'); fs.mkdirSync(GIA, {recursive:true});
const PY = "import sys\nfrom PIL import Image,ImageDraw\nf,w,h,m,t=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),sys.argv[4],sys.argv[5]=='1'\nim=Image.new('RGBA',(w,h),(0,0,0,0) if t else m)\nd=ImageDraw.Draw(im)\nd.rectangle([0,h-30,w,h] if t else [0,int(h*0.867),w,h],fill=m if t else '#1a1410')\nim.save(f)";
const taoAnh = (ten, w, h, mau, trong) => { const f = path.join(GIA, ten); if (!fs.existsSync(f)) execFileSync('python3', ['-c', PY, f, w, h, mau, trong ? '1' : '0'].map(String)); return f; };
const GIA_ANH = {};
for (let i = 1; i <= 5; i++){ GIA_ANH['art/lang-chuong/nen-' + i + '.png'] = taoAnh('nen' + i + '.png', 960, 540, ['#1d2633', '#22303a', '#2a2a3a', '#20302a', '#302a22'][i - 1]);
  GIA_ANH['art/lang-chuong/truoc-' + i + '.png'] = taoAnh('truoc' + i + '.png', 960, 540, '#0a0d10', true); }
for (const [id, w, h, n] of [['vesper', 128, 160, 4], ['tock', 96, 96, 4], ['morrow', 128, 128, 4], ['kaelith', 96, 128, 4]])
  GIA_ANH['art/lang-chuong/npc/' + id + '.png'] = taoAnh('npc-' + id + '.png', w * n, h, '#8a6a9a', true);
GIA_ANH['art/lang-chuong/bia-tuong-niem.png'] = taoAnh('bia.png', 128, 160, '#5a5a5a', true);
GIA_ANH['art/cot-truyen/chan-dung/kaelith-noi.png'] = taoAnh('kaelith-noi.png', 768, 256, '#6a8a9a', true);
for (let i = 1; i <= 7; i++) GIA_ANH['art/cot-truyen/mo-dau/0' + i + '.png'] = taoAnh('md' + i + '.png', 960, 540, '#3a2a1a');
const KHUNG_CHON = taoAnh('khung-chon.png', 640, 420, '#3a3020');

(async () => {
  const b = await chromium.launch(), loi = []; let hong = 0;
  const ok = (dk, t, x) => { console.log((dk ? 'ĐẠT ' : 'HỎNG ') + t + (x !== undefined ? ' – ' + JSON.stringify(x) : '')); if (!dk) hong++; };
  async function trang(url, gia, coKhungChon){
    const p = await b.newPage({viewport:{width:960, height:540}});
    p.on('pageerror', e => loi.push(url + ': ' + e.message));
    if (gia) await p.route('**/art/**', r => {
      const u = new URL(r.request().url()).pathname.split('/tieng-vong-cuoi-cung/').pop().replace(/^\//, '');
      const k = Object.keys(GIA_ANH).find(x => u.endsWith(x));
      if (k && !fs.existsSync(path.join(__dirname, '../..', k))) return r.fulfill({path: GIA_ANH[k], contentType:'image/png'});
      if (coKhungChon && u.endsWith('art/cot-truyen/teleport/khung-chon.png')) return r.fulfill({path: KHUNG_CHON, contentType:'image/png'});
      return r.continue();
    });
    await p.goto('http://localhost:8765/' + url);
    return p;
  }
  // 1. thiếu ảnh thật → làng tắt (nếu ảnh nền làng đã có thật thì bỏ qua mục này)
  const coNenThat = fs.existsSync(path.join(__dirname, '../../art/lang-chuong/nen-1.png'));
  if (!coNenThat){
    const p = await trang('game/lang-chuong/index.html?thu=1');
    await p.waitForFunction(() => window.LANG && LANG.xong, null, {timeout:20000});
    const s = await p.evaluate(() => ({s:LANG.sanSang, t:LANG.thieu, lm:LuuChung.co('lang_mo')}));
    ok(!s.s && s.t.some(x => x.includes('nen-1')) && !s.lm, 'thiếu ảnh nền → làng tắt, không đặt cờ lang_mo', s.t);
    await p.screenshot({path: path.join(RA, 'lang-tat.png')}); await p.close();
  }
  // 2. đủ ảnh (giả) → chơi luồng đầy đủ
  const p = await trang('game/lang-chuong/index.html?thu=1', true);
  await p.evaluate(() => { localStorage.removeItem('tvcc-chung'); });
  await p.reload(); await p.waitForFunction(() => window.LANG && LANG.xong, null, {timeout:20000});
  let t = await p.evaluate(() => ({s:LANG.sanSang, thieu:LANG.thieu, npc:LANG.npc, tt:LANG.tt(), lm:LuuChung.co('lang_mo')}));
  ok(t.s && t.lm, 'đủ ảnh → làng mở, đặt cờ lang_mo', t.thieu);
  ok(t.npc.join() === 'morrow,vesper,tock,kaelith', 'đủ 4 nhân vật phụ', t.npc);
  ok(t.tt.che === 'canh' && t.tt.canh === 0, 'lần đầu: chiếu mở đầu', t.tt);
  await p.evaluate(() => LANG.buoc(60 * 4.2)); await p.screenshot({path: path.join(RA, 'mo-dau-2.png')});
  ok((await p.evaluate(() => LANG.tt().canh)) === 1, 'mở đầu tự sang tranh 2');
  await p.evaluate(() => LANG.buoc(1, 'bo')); t = await p.evaluate(() => LANG.tt());
  ok(t.che === 'choi' && (await p.evaluate(() => LuuChung.daXem('mo-dau'))), 'Skip → vào làng, ghi đã xem', t);
  await p.evaluate(() => LANG.buoc(20, 'r')); t = await p.evaluate(() => LANG.tt());
  ok(t.gan === 'vesper', 'đi phải tới gần Vesper', t);
  await p.screenshot({path: path.join(RA, 'lang-gan-vesper.png')});
  await p.evaluate(() => LANG.buoc(1, 'u')); t = await p.evaluate(() => LANG.tt());
  ok(t.che === 'thoai' && /forgotten/.test(t.thoai), 'nói chuyện Vesper (lần đầu)', t.thoai);
  await p.evaluate(() => LANG.buoc(30)); await p.screenshot({path: path.join(RA, 'hop-thoai-vesper.png')});
  for (let i = 0; i < 6 && (await p.evaluate(() => !/carry/.test(LANG.tt().thoai || ''))); i++){ await p.evaluate(() => { LANG.buoc(1, 'ok'); LANG.buoc(1); LANG.buoc(1, 'ok'); LANG.buoc(1); }); }
  await p.evaluate(() => LANG.buoc(200)); await p.screenshot({path: path.join(RA, 'hop-thoai-chon.png')});
  await p.evaluate(() => LANG.buoc(1, 'ok')); t = await p.evaluate(() => LANG.tt());
  ok(t.che === 'choi' && (await p.evaluate(() => LuuChung.co('vesper_nghe') && LuuChung.co('gap:vesper'))), 'chọn "I will listen." → cờ vesper_nghe', t);
  // bia tưởng niệm (vật tương tác cho phiên "an")
  await p.evaluate(() => LANG.buoc(105, 'r')); t = await p.evaluate(() => LANG.tt());
  ok(t.gan === 'bia-tuong-niem', 'tới bia tưởng niệm', t);
  await p.evaluate(() => { window._ev = null; document.addEventListener('lang-tuong-tac', e => { window._ev = e.detail.id; }); LANG.buoc(1, 'u'); });
  ok(await p.evaluate(() => window._ev === 'bia-tuong-niem' && LuuChung.co('cham:bia-tuong-niem')), 'Examine bia → sự kiện + cờ');
  await p.evaluate(() => LANG.buoc(77, 'r'));
  // tới chuông teleport
  t = await p.evaluate(() => LANG.tt());
  ok(t.gan === 'chuong' && t.chuongK === 1, 'tới chuông: chuông sáng nhẹ', t);
  await p.screenshot({path: path.join(RA, 'lang-chuong-teleport.png')});
  await p.evaluate(() => LANG.buoc(1, 'u')); await p.evaluate(() => LANG.buoc(30));
  t = await p.evaluate(() => LANG.tt()); ok(t.che === 'kich' && t.chuongK > 2, 'rung chuông: hoạt cảnh kích hoạt', t);
  await p.screenshot({path: path.join(RA, 'chuong-kich-hoat.png')});
  await p.evaluate(() => LANG.buoc(40)); t = await p.evaluate(() => LANG.tt());
  // đã có ảnh khung chọn (yêu cầu 009 XONG) → menu riêng; chưa có thì dùng khung hộp thoại
  const coKhungChonThat = fs.existsSync(path.join(__dirname, '../../art/cot-truyen/teleport/khung-chon.png'));
  ok(coKhungChonThat ? t.che === 'menu' && t.chuongK === 9 : t.che === 'thoai' && /Rootbound/.test(t.thoai), 'mở menu chọn vùng (' + (coKhungChonThat ? 'khung chọn riêng, chuông giữ khung 9' : 'khung hộp thoại') + ')', t);
  const chon = await p.evaluate(() => (LANG.S.menu && LANG.S.menu.chon || HopThoai.dongHienTai().chon).map(c => c.chu + (c.khoa ? ' [khoa]' : '')));
  // (khoidau) bảng đích theo tư vấn: "Weeping Heartwood — Enter", Vùng 2 khoá hiện mờ kèm điều kiện, Stay; không còn "xem lại mở đầu" (mở đầu không chiếu lại)
  ok(chon[0] === 'Weeping Heartwood — Enter' && chon[1] === 'Rotting Roots — Defeat the Hollow Bell Mother [khoa]' && chon.includes('Stay') && chon.length === 3, 'menu: Vùng 1 (Enter) + Vùng 2 khoá mờ + Stay', chon);
  await p.evaluate(() => LANG.buoc(60)); await p.screenshot({path: path.join(RA, 'menu-teleport.png')});
  await p.evaluate(() => LANG.buoc(1, 'ok')); await p.evaluate(() => LANG.buoc(25));
  t = await p.evaluate(() => LANG.tt()); ok(t.an, 'dịch chuyển: nhân vật tan vào ánh sáng', t);
  await p.screenshot({path: path.join(RA, 'dich-chuyen.png')});
  await p.evaluate(() => LANG.buoc(60)); t = await p.evaluate(() => LANG.tt());
  ok(t.diToi === 'vung-1' && t.che === 'da_di', 'dịch chuyển xong → đi Vùng 1', t);
  await p.close();
  // 3. sau khi hạ trùm Vùng 1: thoại "sau Vùng 1", vào từ vùng có hiệu ứng ngược, khung chọn riêng nếu có
  const p3 = await trang('game/lang-chuong/index.html?thu=1&tu=vung-1&bo_mo_dau=1', true, true);
  await p3.waitForFunction(() => window.LANG && LANG.xong, null, {timeout:20000});
  await p3.evaluate(() => { LuuChung.datCo('ha_trum:vung-1'); });
  t = await p3.evaluate(() => LANG.tt()); ok(t.che === 'choi' && t.an && t.x === 2300, 'về từ Vùng 1: hiện ở chuông, đang dịch chuyển vào', t);
  await p3.evaluate(() => LANG.buoc(70)); t = await p3.evaluate(() => LANG.tt()); ok(!t.an, 'hiện ra sau hiệu ứng', t);
  await p3.evaluate(() => LANG.buoc(160, 'l')); await p3.evaluate(() => LANG.buoc(1)); t = await p3.evaluate(() => LANG.tt());
  ok(t.gan === 'vesper', 'đi trái về Vesper', t);
  await p3.evaluate(() => LANG.buoc(1, 'u')); t = await p3.evaluate(() => LANG.tt());
  ok(/Mother has fallen/.test(t.thoai || ''), 'Vesper nói thoại sau Vùng 1', t.thoai);
  for (let i = 0; i < 8 && (await p3.evaluate(() => LANG.tt().che === 'thoai')); i++) await p3.evaluate(() => { LANG.buoc(1, 'ok'); LANG.buoc(1); });
  await p3.evaluate(() => LANG.buoc(182, 'r')); await p3.evaluate(() => LANG.buoc(1, 'u')); await p3.evaluate(() => LANG.buoc(80));
  t = await p3.evaluate(() => LANG.tt()); ok(t.che === 'menu', 'có ảnh khung chọn → menu riêng', t);
  await p3.screenshot({path: path.join(RA, 'menu-khung-chon.png')});
  await p3.evaluate(() => LANG.buoc(1, 'bo')); t = await p3.evaluate(() => LANG.tt()); ok(t.che === 'choi', 'Esc/Skip đóng menu', t);
  await p3.close();
  // 4. Vùng 1: nút về làng chỉ hiện khi có cờ lang_mo
  const v = await trang('game/vung-1/index.html?tu=1&moi=1');
  await v.waitForFunction(() => window.TV && (TV.xong || TV.loi), null, {timeout:30000});
  await v.evaluate(() => { localStorage.removeItem('tvcc-chung'); LuuChung.napLai(); TV.choi(true); V1.moChuong(0, true); });
  ok(await v.evaluate(() => !document.getElementById('b-lang') || document.getElementById('b-lang').hidden), 'Vùng 1: chưa mở làng → không có nút về làng');
  await v.evaluate(() => { LuuChung.datCo('lang_mo'); V1.moChuong(0, true); });
  ok(await v.evaluate(() => { const b = document.getElementById('b-lang'); return !!b && !b.hidden && b.offsetParent !== null; }), 'Vùng 1: đã mở làng → có nút "Return to Bell Village"');
  await v.screenshot({path: path.join(RA, 'vung1-rest-bell.png')});
  await v.evaluate(() => document.getElementById('b-lang').click());
  ok(await v.evaluate(() => MocCotTruyen.ve === 1 && LuuChung.diemVe().vung === 'vung-1'), 'bấm nút: ghi điểm quay về');
  await v.close();
  ok(loi.length === 0, 'không lỗi JS', loi);
  await b.close(); process.exit(hong ? 1 : 0);
})();
