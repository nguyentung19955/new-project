// Kiểm móc Hệ thống tiến triển / Charm vào Vùng 1 (Playwright) – phiên bản 2.
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765 &) ; node tools/he-thong/kiem-thu-vung1.js
// Phần 4 GIẢ LẬP "đã có ảnh" bằng cách chặn đường dẫn ảnh trong trình duyệt kiểm thử (ảnh 1×1 trong bộ nhớ, không ghi vào repo, không hiện trong game thật).
const {chromium} = require('playwright');
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
(async () => {
  const b = await chromium.launch(); let hong = 0;
  const ok = (t, d, c) => { if (!d) hong++; console.log((d ? 'ĐẠT ' : 'LỖI ') + t + (c !== undefined ? ' – ' + JSON.stringify(c) : '')); };
  const URL = 'http://localhost:8765/game/vung-1/index.html?tu=1&moi=1';
  const mo = async (q, giaAnh) => { const pg = await b.newPage({viewport:{width:844, height:390}}); pg.loi = []; pg.on('pageerror', e => pg.loi.push(e.message));
    if (giaAnh) await pg.route(/art\/(giao-dien|hieu-ung)\/he-thong\//, r => r.fulfill({status:200, contentType:'image/png', body:PNG}));
    await pg.goto(URL + q); await pg.waitForFunction(() => window.TV && TV.xong); return pg; };
  const giet = (laTinhAnh, idx) => { const {E, V1} = TV; const q = E.QUAI.find(q => !q.dead) || {def:{mau:30}, x:300, y:300, w:30, h:50};
    E.SUKIEN.length = 0; E.SUKIEN.push({k:'quai-chet', q:Object.assign({}, q, {laTinhAnh, idx})}); V1.suKienTheGioi(); E.SUKIEN.length = 0; };

  // 1) mặc định TẮT – Vùng 1 y hệt cũ
  let pg = await mo('');
  await pg.waitForTimeout(800);
  let r = await pg.evaluate(async () => { await TV.choi(true); TV.buoc(30, ''); return {bat:!!(window.MocHeThong && MocHeThong.bat), nut:!!document.getElementById('b-hethong'), st:TV.E.NV.cap.sat_thuong}; });
  ok('Mặc định tắt: không có nút Lattice, kiếm vẫn 10', !r.bat && !r.nut && r.st === 10, r);
  ok('Mặc định tắt: không lỗi JS', !pg.loi.length, pg.loi); await pg.close();

  // 2) bật thử ?hethong=1 (chưa có ảnh)
  pg = await mo('&hethong=1&hethong_moi=1');
  await pg.waitForFunction(() => window.MocHeThong && MocHeThong.bat);
  r = await pg.evaluate(async (gietS) => {
    const giet = eval(gietS), {E, V1} = TV; await TV.choi(true); TV.buoc(10, '');
    const ht = MocHeThong.ht; giet(true, 0); const sau1 = {cap:ht.cap(), xp:ht.S.diem, cho:ht.S.choChon};
    giet(true, 0); const sau2 = {cap:ht.cap(), xp:ht.S.diem, not:ht.notCon()};
    V1.G.trang = 'chuong'; V1.moChuong(0, true);
    const nut = document.getElementById('b-hethong'), chu = nut && nut.textContent, chonDau = document.getElementById('l-chondau').classList.contains('mo');
    nut.click(); const bang = document.getElementById('l-hethong').classList.contains('mo');
    const tabs = [...document.querySelectorAll('#ht-tab button')].map(x => x.textContent);
    const bt = [...document.querySelectorAll('#ht-ds button, #ht-tab button')], cao = Math.min(...bt.map(x => x.getBoundingClientRect().height));
    const hoc = [...document.querySelectorAll('#ht-ct button')].find(x => x.textContent === 'Learn');
    hoc && hoc.click(); await new Promise(ok => setTimeout(ok, 100));
    const daHoc = document.querySelector('#ht-ds button').textContent;
    document.querySelectorAll('#ht-tab button')[1].click(); const echo = document.querySelector('#ht-ds button').textContent;
    document.querySelectorAll('#ht-tab button')[0].click(); const edge = [...document.querySelectorAll('#ht-ds button')].map(x => x.textContent);
    return {sau1, sau2, chu, chonDau, bang, tabs, cao, coHoc:!!hoc, daHoc, echo, edge, st:E.NV.cap.sat_thuong, charm:!!document.getElementById('b-charm'),
      coDo:MocHeThong.coDo, vfx:Object.keys(MocHeThong.vfx), luu:localStorage.getItem('tvcc-he-thong') !== null};
  }, giet.toString());
  ok('Hạ tinh anh lần đầu → +45 Resonance XP (cấp 1)', r.sau1.cap === 1 && r.sau1.xp === 45, r.sau1);
  ok('Tái đấu tinh anh → +15 → cấp 2, 1 Echo Note', r.sau2.cap === 2 && r.sau2.xp === 60 && r.sau2.not === 1, r.sau2);
  ok('Bảng Chuông Lưu có nút "Lattice · 1 Note"', /Lattice · 1 Note$/.test(r.chu), r.chu);
  ok('Chưa có ảnh Charm → KHÔNG hiện chọn Charm đầu, KHÔNG có nút Charms', !r.chonDau && !r.charm && r.coDo === false);
  ok('Bảng THE RESONANCE LATTICE có 3 tab EDGE/ECHO/VESSEL', r.bang && r.tabs.join() === 'EDGE,ECHO,VESSEL', r.tabs);
  ok('Nút cao ≥ 44px (dễ bấm iPhone)', r.cao >= 44, r.cao);
  ok('Học Keen Edge (cấp 2) → kiếm 10 → 11 (+10%)', r.coHoc && /Learned/.test(r.daHoc) && r.st === 11, {st:r.st, daHoc:r.daHoc});
  ok('Lingering Echo ghi "Requires level 3"', /Requires level 3/.test(r.echo), r.echo);
  ok('Fifth Toll chưa có ảnh → "Art pending"', r.edge.some(x => x.startsWith('Fifth Toll') && x.includes('Art pending')), r.edge);
  ok('Chưa có ảnh VFX → không bật Frostline/Halo', r.vfx.length === 0);
  ok('Lưu riêng khoá tvcc-he-thong', r.luu);
  await pg.screenshot({path:process.env.ANH || '/tmp/he-thong-bang.png'});
  ok('Bật thử: không lỗi JS', !pg.loi.length, pg.loi);

  // 3) tải lại trang: giữ cấp + Keen Edge
  await pg.goto('http://localhost:8765/game/vung-1/index.html?tu=1&hethong=1'); await pg.waitForFunction(() => window.MocHeThong && MocHeThong.bat && window.TV && TV.xong);
  r = await pg.evaluate(async () => { await new Promise(ok => setTimeout(ok, 300)); return {st:TV.E.NV.cap.sat_thuong, cap:MocHeThong.ht.cap()}; });
  ok('Tải lại trang giữ cấp 2 và Keen Edge (kiếm 11)', r.st === 11 && r.cap === 2, r);
  await pg.close();

  // 4) GIẢ LẬP đã có ảnh (chỉ trong trình duyệt kiểm thử) – kiểm luồng Charm + VFX
  pg = await mo('&hethong=1&hethong_moi=1', true);
  await pg.waitForFunction(() => window.MocHeThong && MocHeThong.bat);
  r = await pg.evaluate(async (gietS) => {
    const giet = eval(gietS), {E, V1} = TV; await TV.choi(true); TV.buoc(10, '');
    const ht = MocHeThong.ht, out = {coDo:MocHeThong.coDo, vfx:Object.keys(MocHeThong.vfx).sort()};
    giet(true, 0);
    V1.G.trang = 'chuong'; V1.moChuong(0, true);
    out.chonDau = document.getElementById('l-chondau').classList.contains('mo');
    const lc = [...document.querySelectorAll('#cd-hang button')]; out.luaChon = lc.map(x => x.querySelector('b').textContent);
    out.caoLC = Math.min(...lc.map(x => x.getBoundingClientRect().height));
    lc[1].click(); out.tui = ht.S.tui.map(m => m.mau + ':' + m.hiem);
    document.getElementById('b-charm').click(); out.bangCharm = document.getElementById('l-charm').classList.contains('mo');
    const eq = [...document.querySelectorAll('#ch-ct button')].find(x => x.textContent === 'Equip'); eq.click(); await new Promise(ok => setTimeout(ok, 50));
    out.lap = ht.trangBiDangDung().map(m => m.mau); out.nutCharm = document.getElementById('b-charm').textContent;
    document.querySelector('#l-charm .dong').click(); V1.G.trang = 'choi';
    E.pl.hp = 2; const hp0 = E.pl.hp; giet(false, 3); out.hoiMau = E.pl.hp - hp0;          // Ashen Mercy: kết liễu hồi 1 máu
    E.pl.hp = 2; giet(false, 4); out.hoiLan2 = E.pl.hp - 2;                                   // trong 20 s hồi nội bộ → không hồi
    ht.S.diem = ht.nguongCap(2) - 1; giet(false, 5); out.halo = MocHeThong.fx.some(f => f.id === 'halo');   // lên cấp → Resonance Halo
    // rơi đồ từ trùm (luôn rơi), Faded trùng → Echo Dust
    for (let i = 0; i < 30; i++) ht.roiDo('trum');
    out.dust = ht.S.dust; out.tuiSau = ht.S.tui.length;
    // Frostline Slash sau khi học Keen Edge
    ht.moNut('keen_edge'); await MocHeThong.apDung(); MocHeThong.fx.length = 0;
    E.SUKIEN.length = 0; E.SUKIEN.push({k:'ra-don', ten:'don1'}); V1.suKienTheGioi(); E.SUKIEN.length = 0;
    out.frost = MocHeThong.fx.some(f => f.id === 'frostline');
    return out;
  }, giet.toString());
  ok('Giả lập có ảnh: bật rơi Charm + 2 VFX', r.coDo && r.vfx.join() === 'frostline,halo', r);
  ok('Sau tinh anh đầu: Rest Bell hiện CHỌN Bell\'s Return / Ashen Mercy (không RNG)', r.chonDau && r.luaChon.join() === "Bell's Return,Ashen Mercy" && r.caoLC >= 44, r.luaChon);
  ok('Chọn Ashen Mercy → vào túi (Faded)', r.tui[0] === 'ashen_mercy:faded', r.tui);
  ok('Túi Charm: chọn rồi bấm Equip → cắm vào loadout (2/3 ô)', r.bangCharm && r.lap.join() === 'ashen_mercy' && /2\/3/.test(r.nutCharm), r.nutCharm);
  ok('Ashen Mercy: kết liễu hồi 1 máu, có hồi nội bộ', r.hoiMau === 1 && r.hoiLan2 === 0, {a:r.hoiMau, b:r.hoiLan2});
  ok('Lên cấp → phát Resonance Halo', r.halo);
  ok('Trùm rơi Charm; trùng Faded tự thành Echo Dust (túi không đầy rác)', r.dust > 0 && r.tuiSau < 15, {dust:r.dust, tui:r.tuiSau});
  ok('Học Keen Edge → đòn combo phát Frostline Slash', r.frost);
  await pg.waitForTimeout(200);
  ok('Giả lập có ảnh: không lỗi JS', !pg.loi.length, pg.loi);
  console.log('Hỏng', hong); await b.close(); process.exit(hong ? 1 : 0);
})();
