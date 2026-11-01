// Kiểm thử Vùng 1 (luồng A). Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765) rồi node game/tools/kiem-thu-vung-1.js
const {chromium} = require('playwright');
const KQ = [];
// phép thử này viết cho phòng THỬ (T1–T3) → mặc định thêm &thu=1 (đặt TV_Q='' để bỏ)
const THEM = process.env.TV_Q ?? '&thu=1';
const ok = (ten, dk, ct) => { console.log((dk ? 'ĐẠT ' : 'LỖI ') + ten + (ct ? ' – ' + ct : '')); KQ.push((dk ? 'ĐẠT ' : 'LỖI ') + ten + (ct ? ' – ' + ct : '')); };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:720}});
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('http://localhost:8765/game/vung-1/index.html?tu=1&moi=1' + THEM);
  await p.waitForFunction(() => window.TV && (TV.xong || TV.loi), null, {timeout:20000});
  await p.evaluate(() => TV.choi(true)); await p.waitForTimeout(300);
  // helper trong trang
  await p.evaluate(() => {
    window.H = {
      chay(n, phim, batTu){ const {E, V1} = TV; for (let i = 0; i < n; i++){ for (const k of V1.KEYS) V1.ep[k] = 0;
          const ks = typeof phim === 'function' ? phim(i) : phim; if (ks) ks.split(',').forEach(k => V1.ep[k] = 1);
          if (batTu){ E.pl.iframes = Math.max(E.pl.iframes, 2); if (E.pl.hp < 2) E.pl.hp = E.P.maxHp; } TV.mot(); } V1.ve(TV.G.mo || 0); },
      dat(cot, hang){ const {E, V1} = TV; V1.datNV(cot * 48 + 24, V1.chanO(cot, hang)); V1.camDat(); },
      cho(fn, n, phim, batTu){ for (let i = 0; i < n; i++){ if (fn()) return i; H.chay(1, phim, batTu); } return -1; }
    };
  });
  const ev = f => p.evaluate(f);
  const doi = async (dk, phim, khongBatTu) => { for (let i = 0; i < 60; i++){ const x = await p.evaluate(([dk, phim, bt]) => { const f = new Function('return ' + dk); for (let j = 0; j < 15; j++){ if (f()) return true; H.chay(1, phim, bt); } return f(); }, [dk, phim || '', !khongBatTu]); if (x) return true; await p.waitForTimeout(60); } return false; };
  // a) nhặt Mảnh Âm
  let r = await ev(() => { H.dat(13, 10); H.chay(20, 'r', true); return [TV.G.luu.manh, TV.G.luu.daNhat]; });
  ok('Nhặt Mảnh Âm', r[0] >= 40, JSON.stringify(r));
  // b) chuông lưu
  r = await ev(() => { H.dat(5, 10); H.chay(5, ''); H.chay(2, 'u'); return [TV.G.trang, TV.G.luu.chuong, TV.G.luu.manhGui]; });
  ok('Nghỉ ở Chuông Lưu (lưu + gửi Mảnh Âm)', r[0] === 'chuong' && r[1] && r[2] >= 40, JSON.stringify(r));
  await p.screenshot({path:'s-chuong.png'});
  r = await ev(() => { document.getElementById('b-di').click(); return TV.G.trang; });
  ok('Rời menu chuông', r === 'choi');
  // c) tường nứt N (hốc trái trên): đứng trên gờ hàng 7, chém trái
  r = await ev(() => { H.dat(5, 6); H.chay(10, ''); TV.E.pl.face = -1;
    H.chay(200, i => (i % 24 < 2 ? 'a,l' : ''), true); return [TV.E.tile(3, 4), TV.E.tile(3, 5), TV.E.tile(3, 6), TV.G.luu.tuongVo]; });
  ok('Chém tường nứt 3 phát → vỡ', r.slice(0, 3).some(x => x === '.'), JSON.stringify(r));
  r = await ev(() => { H.chay(60, 'l', true); H.chay(40, 'l', true); return [TV.G.luu.kho.chuong_vo, TV.E.pl.x | 0]; });
  ok('Vào hốc nhặt Chuông Vỡ 1', r[0] === 1, JSON.stringify(r));
  await p.screenshot({path:'s-hoc.png'});
  // d) sàn mỏng: đứng trên '=' hàng 8, nhặt chuông 2 rồi ↓+nhảy rơi xuống
  r = await ev(() => { H.dat(19, 7); H.chay(10, ''); const y0 = TV.E.pl.y, g0 = TV.E.pl.onGround; H.chay(25, 'r'); const kho = TV.G.luu.kho.chuong_vo;
     H.chay(2, 'd'); H.chay(2, 'd,j'); H.chay(40, ''); return [g0, kho, y0 | 0, TV.E.pl.y | 0]; });
  ok('Đứng trên sàn mỏng + ↓+Nhảy rơi xuống', r[0] && r[3] > r[2] + 100, JSON.stringify(r));
  ok('Nhặt Chuông Vỡ 2 trên sàn mỏng', r[1] === 2, JSON.stringify(r));
  // e) leo dây
  r = await ev(() => { H.dat(10, 10); H.chay(5, ''); H.chay(3, 'u'); const leo = TV.E.pl.leo; H.chay(50, 'u'); return [leo, TV.E.pl.y | 0]; });
  ok('Bám + leo dây', r[0] && r[1] < 400, JSON.stringify(r));
  // f) qua cửa sang T2
  await ev(() => H.dat(29, 10)); await doi("TV.G.chuyen", 'r'); await doi("TV.G.id === 'T2' && !TV.G.chuyen", '');
  r = await ev(() => { return [TV.G.id, TV.E.pl.x | 0, TV.E.pl.y | 0, TV.E.pl.onGround]; });
  ok('Đi qua cửa phải T1 → T2 (màn tối chuyển cảnh)', r[0] === 'T2' && r[1] < 150, JSON.stringify(r));
  await p.screenshot({path:'s-t2.png'});
  // g0) nhịp giả: Vọng Tàn còn 40% máu, nhân vật đứng gần (bất tử, không đánh)
  r = await ev(() => { const q = TV.G.tinhAnh; const hp0 = q.hp; q.hp = 60; H.dat(19, 10); let gia = 0, that = 0, seq = []; let truoc = '';
     for (let i = 0; i < 900; i++){ H.chay(1, '', true); if (q.st === 'danh' && truoc !== 'danh') seq.push(q._gia ? 'giả' : 'thật'); truoc = q.st; }
     q.hp = hp0; return seq; });
  ok('Vọng Tàn <50%: nhịp giả rồi nhịp thật', r.includes('giả') && r[r.indexOf('giả') + 1] === 'thật', r.join(' → '));
  await ev(() => { TV.G.dongCua = false; });
  // g) tinh anh Vọng Tàn
  r = await ev(() => { const q = TV.G.tinhAnh; H.dat(16, 8); H.cho(() => TV.G.dongCua, 200, 'r', true); const dong = TV.G.dongCua; let song = 0, gia = 0;
     for (let i = 0; i < 4000 && !q.dead; i++){ const dx = q.x + q.w / 2 - (TV.E.pl.x + TV.E.pl.w / 2);
       H.chay(1, (i % 10 < 2 ? 'a' : '') + (Math.abs(dx) > 90 ? (dx > 0 ? ',r' : ',l') : ''), true);
       song = Math.max(song, TV.G.nguy.filter(n => n.loai === 'song').length); if (q._gia) gia++; }
     return [dong, q.dead, song, gia, TV.G.luu.tinhAnhHa, TV.G.vatRoi.map(v => v.loai), TV.G.dongCua]; });
  ok('Vào phòng tinh anh → khoá cửa', r[0], JSON.stringify(r));
  ok('Vọng Tàn tạo sóng đất', r[2] > 0, 'tối đa ' + r[2] + ' sóng');
  ok('Hạ Vọng Tàn → mở cửa', r[1] && !r[6], JSON.stringify(r));
  r = await ev(() => { const v = TV.G.vatRoi[0]; if (v){ TV.V1.datNV(v.x, v.y); } H.chay(60, '', true); return [TV.G.luu.kho.loi_vong_tan, TV.G.luu.manh]; });
  ok('Nhặt Lõi Vọng Tàn + Mảnh Âm rơi bay về', r[0] === 1 && r[1] > 0, JSON.stringify(r));
  // h) cửa khoá T2-dong (mới 2 chuông)
  r = await ev(() => { H.dat(27, 10); H.chay(80, 'r', true); return [TV.G.id, TV.G.tb]; });
  ok('Cửa trùm bị khoá khi chưa đủ 3 Chuông Vỡ', r[0] === 'T2', JSON.stringify(r));
  // tường giả G: đi xuyên được
  r = await ev(() => { H.dat(17, 10); H.chay(5, ''); H.dat(17, 8); TV.E.pl.y = 8 * 48 + 48 - TV.E.pl.h - 1; H.chay(1, ''); return TV.E.collide(19 * 48 + 4, 7 * 48, 20, 70); });
  ok('Tường giả G không chặn', r === false);
  r = await ev(() => { H.dat(10, 4); H.chay(30, '', true); return [TV.G.luu.kho.chuong_vo, TV.G.cuaKhoa.length, TV.G.luu.nvA]; });
  ok('Đủ 3 Chuông Vỡ → mở khoá cửa trùm + thưởng', r[0] === 3 && r[1] === 0 && r[2], JSON.stringify(r));
  // i) lưu/tải: tải lại trang
  await p.goto('http://localhost:8765/game/vung-1/index.html?tu=1' + THEM); await p.waitForFunction(() => window.TV && TV.xong, null, {timeout:20000});
  r = await ev(() => [document.getElementById('b-tiep').disabled, TV.V1.coLuu()]);
  ok('Tải lại trang: có bản lưu, nút Tiếp tục bật', !r[0] && r[1], JSON.stringify(r));
  await ev(() => TV.choi(false)); await p.waitForTimeout(300);
  r = await ev(() => [TV.G.id, TV.G.luu.kho.chuong_vo, TV.G.luu.kho.loi_vong_tan, TV.G.luu.tinhAnhHa, TV.G.luu.tuongVo.length, TV.E.tile(3, 5)]);
  ok('Tiếp tục: về Chuông Lưu, giữ vật phẩm/tinh anh/tường vỡ', r[0] === 'T1' && r[1] === 3 && r[2] === 1 && r[4] > 0, JSON.stringify(r));
  await p.evaluate(() => {
    window.H = {
      chay(n, phim, batTu){ const {E, V1} = TV; for (let i = 0; i < n; i++){ for (const k of V1.KEYS) V1.ep[k] = 0;
          const ks = typeof phim === 'function' ? phim(i) : phim; if (ks) ks.split(',').forEach(k => V1.ep[k] = 1);
          if (batTu){ E.pl.iframes = Math.max(E.pl.iframes, 2); if (E.pl.hp < 2) E.pl.hp = E.P.maxHp; } TV.mot(); } V1.ve(TV.G.mo || 0); },
      dat(cot, hang){ const {E, V1} = TV; V1.datNV(cot * 48 + 24, V1.chanO(cot, hang)); V1.camDat(); },
      cho(fn, n, phim, batTu){ for (let i = 0; i < n; i++){ if (fn()) return i; H.chay(1, phim, batTu); } return -1; }
    };
  });
  // j) chết → về chuông, mất 30% Mảnh Âm chưa gửi, rơi túi
  await ev(() => { const L = TV.G.luu; L.manh = 100; H.dat(20, 10); H.chay(3, ''); TV.E.pl.hp = 1; TV.E.pl.iframes = 0; TV.E.hurt(1, 1); });
  await doi("TV.G.chuyen", '', true); await doi("!TV.G.chuyen", '', true);
  r = await ev(() => { const L = TV.G.luu; return [L.manh, L.tui, TV.G.id, TV.E.pl.hp, TV.E.P.maxHp]; });
  ok('Chết → về Chuông Lưu, mất 30% Mảnh Âm chưa gửi, rơi túi', r[0] === 70 && r[1] && r[1].so === 30 && r[3] === r[4], JSON.stringify(r));
  r = await ev(() => { const t = TV.G.luu.tui; TV.V1.datNV(t.x, t.y); H.chay(5, '', true); return [TV.G.luu.manh, TV.G.luu.tui]; });
  ok('Nhặt lại túi', r[0] === 100 && !r[1], JSON.stringify(r));
  // k) mua nâng cấp máu
  r = await ev(() => { H.dat(5, 10); H.chay(3, ''); H.chay(2, 'u'); const t = TV.G.trang; H.chay(1, ''); H.chay(1, 'a'); const mx = TV.E.P.maxHp; H.chay(1, ''); H.chay(1, 'j'); return [t, mx, TV.G.luu.nangMau, TV.G.trang]; });
  ok('Mua Sinh lực +1 tại Chuông Lưu', r[1] === 7 && r[2] === 1 && r[3] === 'choi', JSON.stringify(r));
  // l) bản đồ
  r = await ev(() => { H.chay(1, 'm'); const t = TV.G.trang; H.chay(1, ''); H.chay(1, 'm'); return [t, TV.G.trang]; });
  ok('Bản đồ nhỏ M bật/tắt', r[0] === 'ban_do' && r[1] === 'choi', JSON.stringify(r));
  await ev(() => { H.chay(1, ''); H.chay(1, 'm'); }); await p.screenshot({path:'s-map.png'}); await ev(() => { H.chay(1, ''); H.chay(1, 'm'); H.chay(1, ''); });
  // m) đi tới trùm
  await ev(() => H.dat(29, 10)); await doi("TV.G.chuyen", 'r'); await doi("!TV.G.chuyen", '');
  await ev(() => H.dat(27, 10)); await doi("TV.G.chuyen", 'r'); await doi("!TV.G.chuyen", '');
  r = await ev(() => { return [TV.G.id, !!TV.G.trum]; });
  ok('Qua cửa đã mở vào phòng trùm', r[0] === 'T3' && r[1], JSON.stringify(r));
  r = await ev(() => { const q = TV.G.trum; H.cho(() => TV.G.dongCua, 300, 'r', true); const dong = TV.G.dongCua; const thay = {go:0, tha:0, chuyen_pha:0, song:0, mat:0, bao:99}; let tTruoc = '';
     for (let i = 0; i < 9000 && !q.dead; i++){ const dx = q.x + q.w / 2 - (TV.E.pl.x + TV.E.pl.w / 2);
       H.chay(1, (i % 10 < 2 ? 'a' : '') + (Math.abs(dx) > 80 ? (dx > 0 ? ',r' : ',l') : ''), true);
       if (q.st !== tTruoc){ if (thay[q.st] !== undefined) thay[q.st]++; tTruoc = q.st; }
       thay.song = Math.max(thay.song, TV.G.nguy.filter(n => n.loai === 'song').length); thay.mat = Math.max(thay.mat, TV.G.nguy.filter(n => n.loai === 'mat_na').length);
       if (i === 400) window.__shot = 1; if (window.__shot === 1){ window.__shot = 2; return ['chup', thay]; } }
     return [dong, q.dead, q.pha, thay, TV.G.trang]; });
  if (r[0] === 'chup'){ await p.screenshot({path:'s-trum.png'});
    r = await ev(() => { const q = TV.G.trum; const thay = {go:0, tha:0, chuyen_pha:0, song:0, mat:0}; let tTruoc = '';
     for (let i = 0; i < 9000 && !q.dead; i++){ const dx = q.x + q.w / 2 - (TV.E.pl.x + TV.E.pl.w / 2);
       H.chay(1, (i % 10 < 2 ? 'a' : '') + (Math.abs(dx) > 80 ? (dx > 0 ? ',r' : ',l') : ''), true);
       if (q.st !== tTruoc){ if (thay[q.st] !== undefined) thay[q.st]++; tTruoc = q.st; }
       thay.song = Math.max(thay.song, TV.G.nguy.filter(n => n.loai === 'song').length); thay.mat = Math.max(thay.mat, TV.G.nguy.filter(n => n.loai === 'mat_na').length); }
     return [TV.G.dongCua || true, q.dead, q.pha, thay, TV.G.trang]; }); }
  ok('Trùm: Gõ Không Tiếng + Mưa Mặt Nạ + chuyển pha', r[3].go > 0 && r[3].tha > 0 && r[3].chuyen_pha > 0 && r[2] === 2, JSON.stringify(r));
  ok('Thắng trùm', r[1], JSON.stringify(r));
  await p.waitForTimeout(1200);
  r = await ev(() => [TV.G.trang, document.getElementById('l-het').classList.contains('mo'), TV.G.luu.trumHa]);
  ok('Màn "Hết Vùng 1"', r[0] === 'het' && r[1] && r[2], JSON.stringify(r));
  await p.screenshot({path:'s-het.png'});
  KQ.push('Lỗi JS: ' + (errs.length ? errs.join(' | ') : 'không có'));
  console.log(KQ.join('\n'));
  await b.close();
})();
function TV_MAX(r){ return r[3]; }
