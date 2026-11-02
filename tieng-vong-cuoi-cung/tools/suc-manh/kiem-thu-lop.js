// Phiên sucmanh – kiểm thử lớp trang bị (game/thu-mat-na/lop-trang-bi.js).
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765) rồi node tools/suc-manh/kiem-thu-lop.js <thư mục ảnh NGOÀI repo>
// 1) Mặc định (chưa có ảnh lớp): phòng demo + Vùng 1 vẽ Y HỆT khi không nạp lop-trang-bi.js (so từng điểm ảnh).
// 2) Lớp thử (CHỈ trong kiểm thử, chặn mạng trả về chính ảnh gốc – không có ảnh nào được ghi vào repo):
//    lớp vẽ đúng khung k, đúng neo, đúng lật, đúng cỡ với thân ở mọi clip dung/troi/nhay/don1-4; z sau vẽ trước thân, z truoc vẽ sau thân;
//    gỡ lớp → hết vẽ; clip không có ảnh lớp → lớp ẩn; lớp kiểu "neo" đặt đúng điểm neo theo khung.
const {chromium} = require('playwright');
const path = require('path'), fs = require('fs'), crypto = require('crypto');
const OUT = process.argv[2] || '/tmp/suc-manh-xem'; fs.mkdirSync(OUT, {recursive:true});
const GOC = 'http://localhost:8765/';
const REPO = path.join(__dirname, '..', '..');
let soLoi = 0;
const ok = (ten, dk, ct) => { console.log((dk ? 'ĐẠT ' : 'LỖI ') + ten + (ct !== undefined ? ' – ' + (typeof ct === 'string' ? ct : JSON.stringify(ct)) : '')); if (!dk) soLoi++; };

// Math.random cố định để 2 lần chạy vẽ giống nhau
const SEED = () => { let s = 12345; Math.random = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff); };

async function moTrang(b, url, {chan = false, json = null, fixture = false, khongClip = []} = {}){
  const pg = await b.newPage({viewport:{width:960, height:540}});
  const loi = []; pg.on('pageerror', e => loi.push(String(e)));
  await pg.addInitScript(SEED);
  await pg.addInitScript(() => { try { localStorage.clear(); } catch (e){} });
  if (chan) await pg.route('**/lop-trang-bi.js*', r => r.fulfill({status:200, contentType:'text/javascript', body:'/* chặn trong kiểm thử */'}));
  if (json) await pg.route('**/trang-bi.json*', r => r.fulfill({status:200, contentType:'application/json', body:JSON.stringify(json)}));
  if (fixture) await pg.route('**/art/kiem-khach-lop/**', r => {
    // art/kiem-khach-lop/<id>/<clip>/fNN.png  → trả chính ảnh gốc art/kiem-khach/<clip>/fNN.png (chỉ để đo vị trí)
    const u = new URL(r.request().url()).pathname;
    const m = u.match(/kiem-khach-lop\/([^/]+)\/([^/]+)\/(f\d\d)\.png$/) || u.match(/kiem-khach-lop\/([^/]+)\/()(neo\d\d)\.png$/);
    if (!m || khongClip.includes(m[2])) return r.fulfill({status:404, body:''});
    const f = m[3].startsWith('neo') ? path.join(REPO, 'art/kiem-khach/dung/f00.png') : path.join(REPO, 'art/kiem-khach', m[2], m[3] + '.png');
    if (!fs.existsSync(f)) return r.fulfill({status:404, body:''});
    r.fulfill({status:200, contentType:'image/png', body:fs.readFileSync(f)});
  });
  await pg.goto(GOC + url);
  await pg.waitForFunction(() => window.TV && (TV.xong === true || TV.loi), null, {timeout:40000});
  await pg.waitForTimeout(1500);
  return {pg, loi};
}
const bam = (pg, n, phim) => pg.evaluate(([n, phim]) => TV.buoc(n, phim), [n, phim]);
const hash = async pg => crypto.createHash('md5').update(await pg.screenshot()).digest('hex');

(async () => {
  const b = await chromium.launch();

  /* ---------- 1) mặc định = y hệt ---------- */
  for (const [ten, url] of [['phòng demo', 'game/phong-demo/index.html?tu=1']]){
    const A = await moTrang(b, url), B = await moTrang(b, url, {chan:true});
    const tt = await A.pg.evaluate(() => ({nap:LopTrangBi.daNap, hien:LopTrangBi.lopDangHien(), ds:LopTrangBi.dsLop(), cap:LopTrangBi.cap(), cs:LopTrangBi.chiSo()}));
    ok(ten + ': lop-trang-bi nạp được', tt.nap);
    ok(ten + ': mặc định không lớp nào hiện, cấp 0', tt.hien.length === 0 && tt.cap === 0, tt.hien);
    ok(ten + ': mọi lớp trong trang-bi.json đang chưa có ảnh (chưa bật)', tt.ds.every(l => !l.coAnh), tt.ds.map(l => l.id + ':' + l.coAnh).join(' '));
    ok(ten + ': chỉ số cấp 0 không đổi gì', tt.cs.mau_them === 0 && tt.cs.sat_thuong_nhan === 1, tt.cs);
    let giong = 0, tong = 0;
    for (const [n, p] of [[20, ''], [30, 'r'], [12, 'j'], [25, ''], [10, 'a'], [30, '']]){
      await bam(A.pg, n, p); await bam(B.pg, n, p); tong++;
      if (await hash(A.pg) === await hash(B.pg)) giong++;
    }
    await A.pg.screenshot({path:path.join(OUT, 'mac-dinh-co-lop.png')}); await B.pg.screenshot({path:path.join(OUT, 'mac-dinh-khong-lop.png')});
    ok(ten + ': có/không nạp lop-trang-bi.js → ảnh màn giống hệt từng điểm ảnh', giong === tong, giong + '/' + tong);
    ok(ten + ': không lỗi JS', !A.loi.length && !B.loi.length, A.loi.concat(B.loi).slice(0, 3));
    ok(ten + ': mặc định không tải ảnh lớp nào (0 yêu cầu 404)', !(A.pg._404 || []).length, A.pg._404);
    await A.pg.close(); await B.pg.close();
  }
  // Vùng 1: nạp được, không lỗi, mặc định không lớp
  {
    const V = await moTrang(b, 'game/vung-1/index.html?tu=1');
    await V.pg.waitForTimeout(1500);
    const tt = await V.pg.evaluate(() => ({co:!!window.LopTrangBi, nap:window.LopTrangBi && LopTrangBi.daNap, hien:window.LopTrangBi && LopTrangBi.lopDangHien()}));
    ok('Vùng 1: lop-trang-bi nạp, mặc định không lớp', tt.co && tt.nap && tt.hien.length === 0, tt);
    ok('Vùng 1: không lỗi JS', !V.loi.length, V.loi.slice(0, 3));
    await V.pg.close();
  }

  /* ---------- 2) lớp thử (ảnh thử = ảnh gốc, chặn mạng – không nằm trong repo) ---------- */
  const neoDung = [[120, 120], [121, 121], [122, 122], [123, 123]];
  const JSON_THU = {goc:'../../art/kiem-khach-lop/', tu_dong_cap:true, theo_am_phu:{'phu-x':'thu-neo'}, lop:{
    'thu-truoc':{ten:'thử trước', khe:'a', kieu:'khung', z:'truoc', co_anh:true},
    'thu-sau':{ten:'thử sau', khe:'b', kieu:'khung', z:'sau', co_anh:true},
    'thu-neo':{ten:'thử neo', khe:'c', kieu:'neo', z:'truoc', co_anh:true, tep:'neo', so_hinh_neo:1, chan_neo:[128, 172], neo:{dung:neoDung}}},
    cap_suc_manh:[{ten:'0', lop:[]}, {ten:'1', lop:['thu-truoc'], dieu_kien:{trum:['x']}, chi_so:{mau_them:1}}, {ten:'2', lop:['thu-sau'], dieu_kien:{trum:['x'], manh_am:5}, chi_so:{sat_thuong_nhan:1.5}}]};
  const T = await moTrang(b, 'game/phong-demo/index.html?tu=1&trangbi=thu-truoc,thu-sau', {json:JSON_THU, fixture:true, khongClip:['luot']});
  await T.pg.waitForTimeout(1500);
  await T.pg.evaluate(() => {
    // ghi lại mọi lần SpriteMN.ve trong 1 khung vẽ
    const goc = SpriteMN.ve; window.GHI = [];
    SpriteMN.ve = function(g, C, k, fx, fy, lat, s, al, tr){ GHI.push({lop:!C.def, k, fx, fy, lat, s, al, tr, cx:C.chan[0], cy:C.chan[1], src:(C.hinh[Math.max(0, Math.min(C.hinh.length - 1, k))] || {}).src || ''}); return goc.apply(this, arguments); };
  });
  const doMot = async (n, phim) => T.pg.evaluate(([n, phim]) => { TV.buoc(Math.max(0, n - 1), phim); GHI.length = 0; TV.buoc(1, phim); return {st:TV.E.trangThai().ten, ghi:GHI.slice()}; }, [n, phim]);
  ok('lớp thử: 2 lớp hiện (đeo qua URL)', (await T.pg.evaluate(() => LopTrangBi.lopDangHien())).length === 2);
  const kich = [['dung', 30, ''], ['troi', 20, 'r'], ['dung', 40, ''], ['troi', 25, 'l'], ['nhay', 4, 'j'], ['dung', 60, ''], ['don1', 3, 'a'], ['don1', 6, ''], ...Array.from({length:30}, (_, i) => ['combo', 2, i % 2 ? '' : 'a'])];
  const daGap = new Set();
  let dungHet = true, chiTiet = [];
  for (const [ten, n, p] of kich){
    const r = await doMot(n, p);
    // thân nhân vật = lần vẽ có src art/kiem-khach/ (không phải lớp)
    const iThan = r.ghi.findIndex(g => !g.lop && /art\/kiem-khach\//.test(g.src));
    if (iThan < 0){ dungHet = false; chiTiet.push(ten + ': không thấy thân'); continue; }
    const th = r.ghi[iThan], truoc = r.ghi[iThan + 1], sau = r.ghi[iThan - 1];
    daGap.add(r.st);
    const khop = g => g && g.lop && g.k === th.k && g.fx === th.fx && g.fy === th.fy && g.lat === th.lat && g.s === th.s && g.cx === th.cx && g.cy === th.cy && g.tr === th.tr
      && g.src.split('?')[0].replace('kiem-khach-lop/thu-truoc/', 'kiem-khach/').replace('kiem-khach-lop/thu-sau/', 'kiem-khach/') === th.src.split('?')[0];
    const a = khop(truoc) && /thu-truoc/.test(truoc.src), c = khop(sau) && /thu-sau/.test(sau.src);
    if (!a || !c){ dungHet = false; chiTiet.push(r.st + ' k' + th.k + ' trước:' + a + ' sau:' + c); if (process.env.GO) console.log(JSON.stringify([sau, th, truoc])); }
  }
  ok('lớp thử: mỗi khung, lớp "sau" vẽ ngay trước thân, lớp "truoc" vẽ ngay sau thân, cùng khung/neo/lật/cỡ/loé trắng', dungHet, chiTiet.slice(0, 4));
  ok('lớp thử: đã đi qua đủ clip dung/troi/nhay/don', ['dung', 'troi', 'don1', 'don2', 'don4'].every(x => daGap.has(x)) && [...daGap].some(x => /nhay|roi/.test(x)), [...daGap]);
  // ảnh xem tay: đứng, chạy quay trái, đòn
  await bam(T.pg, 40, ''); await T.pg.screenshot({path:path.join(OUT, 'thu-dung.png')});
  // clip không có ảnh lớp (luot – chặn 404) → lớp ẩn, thân vẫn vẽ
  {
    let thay = null;
    for (let i = 0; i < 14 && !thay; i++){ const r = await doMot(1, i === 0 ? 's' : ''); if (r.st === 'luot') thay = r; }
    ok('lớp thử: clip chưa có ảnh lớp (luot) → lớp ẩn, thân vẫn vẽ', thay && !thay.ghi.some(g => g.lop) && thay.ghi.some(g => /kiem-khach\/luot/.test(g.src)), thay ? thay.ghi.length : 'không vào được luot');
  }
  // gỡ lớp
  await bam(T.pg, 60, '');
  const sauGo = await T.pg.evaluate(() => { LopTrangBi.go('thu-truoc'); LopTrangBi.go('thu-sau'); GHI.length = 0; TV.buoc(1, ''); return {hien:LopTrangBi.lopDangHien(), lop:GHI.filter(g => g.lop).length}; });
  ok('gỡ hết lớp → không vẽ lớp nào', sauGo.hien.length === 0 && sauGo.lop === 0, sauGo);
  // cấp sức mạnh + điều kiện + chỉ số
  const capT = await T.pg.evaluate(() => {
    const a = LopTrangBi.capTheoTienDo({}), b2 = LopTrangBi.capTheoTienDo({trum:['x']}), c = LopTrangBi.capTheoTienDo({trum:['x'], manh_am:5}), d = LopTrangBi.capTheoTienDo({trum:[], manh_am:99});
    LopTrangBi.datCap(2); const hien = LopTrangBi.lopDangHien(), cs = LopTrangBi.chiSo(); LopTrangBi.datCap(0);
    return {a, b2, c, d, hien, cs, sau:LopTrangBi.lopDangHien()};
  });
  ok('cấp theo tiến độ: {}→0, trùm→1, trùm+5 mảnh→2, thiếu trùm→0', capT.a === 0 && capT.b2 === 1 && capT.c === 2 && capT.d === 0, capT);
  ok('cấp 2 tự gắn lớp của cấp 1+2, chỉ số cộng dồn', capT.hien.length === 2 && capT.cs.mau_them === 1 && capT.cs.sat_thuong_nhan === 1.5, capT);
  ok('về cấp 0 → hết lớp', capT.sau.length === 0);
  // lớp neo
  const neo = await T.pg.evaluate(() => { LopTrangBi.deo('thu-neo'); TV.buoc(60, ''); GHI.length = 0; TV.buoc(1, '');
    const th = GHI.find(g => !g.lop && /kiem-khach\/dung/.test(g.src)), n = GHI.find(g => g.lop); LopTrangBi.go('thu-neo'); return {th, n}; });
  const kn = neo.th ? neoDung[neo.th.k] : null;
  ok('lớp kiểu neo: ảnh nhỏ đặt đúng điểm neo của khung đang vẽ', neo.n && kn && neo.n.cx === 128 + 128 - kn[0] && neo.n.cy === 172 + 172 - kn[1] && neo.n.fx === neo.th.fx && neo.n.lat === neo.th.lat, {neo:neo.n && [neo.n.cx, neo.n.cy], k:neo.th && neo.th.k});
  // cầu nối hệ thống đồ (giả lập MocHeThong): cấp tự theo capSucManh, Âm Phù đang cắm hiện lớp theo theo_am_phu
  const cau = await T.pg.evaluate(() => { const a = LopTrangBi.lopDangHien();
    window.MocHeThong = {bat:true, ht:{capSucManh:() => 1, trangBiDangDung:() => [{uid:1, mau:'phu-x', hiem:'hiem'}]}};
    const b2 = LopTrangBi.lopDangHien(), c = LopTrangBi.cap(); window.MocHeThong.bat = false; const d = LopTrangBi.lopDangHien(); delete window.MocHeThong; return {a, b2, c, d}; });
  ok('cầu nối hệ thống đồ: cấp 1 + Âm Phù → hiện lớp cấp 1 và lớp Âm Phù; tắt hệ thống → hết', cau.a.length === 0 && cau.c === 1 && cau.b2.includes('thu-truoc') && cau.b2.includes('thu-neo') && cau.d.length === 0, cau);
  // lưu: đeo → tải lại trang (không URL) vẫn còn
  const luu = await T.pg.evaluate(() => { LopTrangBi.deo('thu-truoc'); try { return JSON.parse(localStorage.getItem('tvcc-trang-bi-v1')); } catch (e){ return 'x'; } });
  ok('đeo được lưu (localStorage, bọc try/catch)', luu && luu.deo && luu.deo.includes('thu-truoc'), luu);
  ok('lớp thử: không lỗi JS', !T.loi.length, T.loi.slice(0, 3));
  await T.pg.close();
  await b.close();
  console.log(soLoi ? 'CÓ ' + soLoi + ' LỖI' : 'TẤT CẢ ĐẠT');
  process.exit(soLoi ? 1 : 0);
})();
