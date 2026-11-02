// Luồng F – kiểm thử P0 (duyệt vòng 2): thân chắn trùm, báo đòn, tiến độ, HUD điện thoại.
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765) rồi node tools/vung-1/kiem-thu-f.js [thư mục ảnh]
// Ảnh chụp ghi vào tools/vung-1/xem/f/ (mặc định).
const {chromium} = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = process.argv[2] || path.join(__dirname, 'xem', 'f'); fs.mkdirSync(OUT, {recursive:true});
const URL = 'http://localhost:8765/game/vung-1/index.html';
const KQ = []; let soLoi = 0;
const ok = (ten, dk, ct) => { const s = (dk ? 'ĐẠT ' : 'LỖI ') + ten + (ct !== undefined ? ' – ' + (typeof ct === 'string' ? ct : JSON.stringify(ct)) : ''); if (!dk) soLoi++; console.log(s); KQ.push(s); };

// helper cài vào trang
const CAI = () => {
  const {E, V1, G} = TV, pl = E.pl, T = 48;
  window.H = {
    chay(n, phim, moiBuoc){ for (let i = 0; i < n; i++){ for (const k of V1.KEYS) V1.ep[k] = 0;
        const ks = typeof phim === 'function' ? phim(i) : phim; if (ks) ks.split(',').forEach(k => k && (V1.ep[k] = 1));
        TV.mot(); if (moiBuoc && moiBuoc(i) === true) return i; } return n; },
    async vao(id, x, chanY){ const p = await V1.layPhong(id);
      if (chanY == null){ V1.vaoPhong(p, null, null); pl.x = x - pl.w / 2; for (let k = 0; k < 8 && E.collide(pl.x, pl.y, pl.w, pl.h); k++) pl.y -= T / 2; }
      else V1.vaoPhong(p, null, {x, y:chanY});
      V1.camDat(); TV.mot(); },
    than(){ return Object.assign({}, V1.thanTrum(G.trum)); },
    // giữ trùm đứng yên (không ra đòn) để thử va chạm
    yen(){ const q = G.trum; if (q && q.st !== 'chet' && q.st !== 'chuyen_pha'){ q.st = 'dung'; q.cd = 9999; } },
    chong(){ const B = V1.thanTrum(G.trum); return E.overlap({x:pl.x, y:pl.y, w:pl.w, h:pl.h}, B); },
    lan(){ const B = V1.thanTrum(G.trum); if (!H.chong()) return 0; return Math.min(pl.x + pl.w - B.x, B.x + B.w - pl.x); },
    trongDa(){ return E.collide(pl.x, pl.y, pl.w, pl.h); },
    // chạy 1 kịch bản va chạm, thu số liệu từng khung
    kb(n, phim){ const s = {lanMax:0, nhayMax:0, trongDa:0, duoiSan:0, hpMat:0, khung:0}; let x0 = pl.x, hp0 = pl.hp; const san = G.trum.y + G.trum.h;
      H.chay(n, phim, () => { H.yen(); pl.iframes = 0; const d = Math.abs(pl.x - x0); x0 = pl.x;
        s.lanMax = Math.max(s.lanMax, H.lan()); s.nhayMax = Math.max(s.nhayMax, d); if (H.trongDa()) s.trongDa++;
        if (pl.y + pl.h > san + 0.5) s.duoiSan++; if (pl.hp < hp0) s.hpMat += hp0 - pl.hp; hp0 = pl.hp; s.khung++; });
      s.cuoiChong = H.chong(); s.cuoiDat = pl.onGround; s.ben = Math.sign(pl.x + pl.w / 2 - (H.than().x + 50)); return s; },
    // sau kịch bản: còn đi ra được không (không kẹt)
    diRa(huong){ const x0 = pl.x; H.chay(70, huong, () => { H.yen(); }); return Math.abs(pl.x - x0); }
  };
};

(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({viewport:{width:960, height:540}}); const loiJS = [];
  pg.on('pageerror', e => loiJS.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) loiJS.push(m.text()); });
  const moTrang = async q => { await pg.goto(URL + '?tu=1' + (q || '')); await pg.waitForFunction(() => window.TV && (TV.xong || TV.loi), null, {timeout:20000}); await pg.evaluate(CAI); };
  const ev = (f, a) => pg.evaluate(f, a);
  const chup = async ten => { await ev(() => TV.V1.ve(TV.G.mo || 0)); await pg.screenshot({path:path.join(OUT, ten + '.png')}); };

  /* ================= 1. THÂN CHẮN TRÙM – ma trận va chạm ================= */
  await moTrang('&moi=1&hitbox=1'); await ev(() => TV.choi(true)); await pg.waitForTimeout(200);
  const datTran = async (xTrum, xNV, chanNV) => ev(async ([xT, xN, cN]) => {
    const {G, E, V1} = TV; G.luu.kho.chuong_vo = 3; G.luu.trumHa = false;
    await H.vao('P12', xN, cN || 13 * 48); const q = G.trum; q.x = xT - q.w / 2; G.dongCua = true; q.st = 'dung'; q.cd = 9999; q.hp = 300; q.pha = 1;
    E.pl.hp = E.P.maxHp; E.pl.x = xN - E.pl.w / 2; if (cN) E.pl.y = cN - E.pl.h; H.chay(2, '', () => H.yen()); return H.than();
  }, [xTrum, xNV, chanNV]);
  const MEM_MAX = 10 + 4.2 + 1;   // lấn tối đa cho phép: MEM 10 px + 1 bước chạy
  // a) chạy vào từ trái / phải
  let B = await datTran(1500, 1300);
  let s = await ev(() => H.kb(90, 'r'));
  ok('Chạy vào thân từ TRÁI: bị chặn mềm, không xuyên', s.lanMax <= MEM_MAX && s.ben < 0 && !s.trongDa && !s.duoiSan, s);
  ok('  …đi ra lại được (không kẹt)', await ev(() => H.diRa('l')) > 100);
  await chup('va-cham-chay-trai');
  B = await datTran(1500, 1700); s = await ev(() => H.kb(90, 'l'));
  ok('Chạy vào thân từ PHẢI: bị chặn mềm, không xuyên', s.lanMax <= MEM_MAX && s.ben > 0 && !s.trongDa, s);
  // b) lướt vào
  B = await datTran(1500, 1330); s = await ev(() => H.kb(40, i => 'r' + (i === 3 ? ',s' : '')));
  ok('Lướt (dash) vào thân: không lướt xuyên, không giật (≤ 14 px/khung ngoài tốc lướt)', s.ben < 0 && s.lanMax <= 26 && !s.trongDa, s);
  B = await datTran(1500, 1670); s = await ev(() => H.kb(40, i => 'l' + (i === 3 ? ',s' : '')));
  ok('Lướt vào thân từ phải', s.ben > 0 && s.lanMax <= 26 && !s.trongDa, s);
  // c) nhảy đôi qua đầu (giữ phải) – được phép bay qua, nhưng không kẹt / không đứng trong thân
  B = await datTran(1500, 1330);
  s = await ev(() => H.kb(140, i => 'r' + ((i < 12 || (i >= 22 && i < 34)) ? ',j' : '')));
  ok('Nhảy đôi qua trùm: không kẹt trong thân, đáp đất', !s.cuoiChong && s.cuoiDat && !s.trongDa && !s.duoiSan, s);
  // d) đáp sát 2 bên (rơi từ trên xuống mép thân)
  for (const [ten, dx] of [['mép trái', -52], ['mép phải', 52], ['giữa đầu', 0], ['lệch trái 20', -20]]){
    B = await datTran(1500, 1500 + dx, 13 * 48 - 260);
    s = await ev(() => H.kb(90, ''));
    ok('Rơi xuống ' + ten + ' thân trùm: trượt xuống một bên, không đứng trên đầu, không lọt nền', !s.cuoiChong && s.cuoiDat && !s.trongDa && !s.duoiSan && s.nhayMax <= 6.5, s);
    if (dx === 0) await chup('va-cham-roi-giua-dau');
  }
  // e) trùm áp sát tường PHẢI (hộp trùm chạm tường – vị trí sát nhất trùm có thể tới): chạy vào, rơi vào khe, thoát ra
  const XT = 38 * 48 - 88;   // tâm trùm khi hộp 176 px chạm tường phải (cột 38 – phòng trùm gọn 40×16) → thân chắn cách tường 38 px
  B = await datTran(XT, XT - 260);
  r = await ev(() => { const s = H.kb(120, 'r'); return [s, TV.G.trum.x | 0]; });
  ok('Chạy vào trùm đang áp tường: bị chặn mềm, không kẹt trong đá, không lọt nền', !r[0].trongDa && !r[0].duoiSan && r[0].lanMax <= MEM_MAX, r);
  for (const [ten, dx] of [['khe tường–trùm', 69], ['sát mép thân trong khe', 56]]){
    B = await datTran(XT, XT + dx, 13 * 48 - 220);
    r = await ev(() => { const s = H.kb(100, 'l'); const tt = Object.assign({}, TV.V1.TT); return [s, TV.G.trum.x | 0, tt.lanKep, tt.lanQua]; });
    // (giữ ← khi rơi thì có thể đáp lên đầu thân → trượt xuống phía tường; yêu cầu: không giật > 6,5 px/khung, kết thúc không chồng)
    ok('Rơi vào ' + ten + ' (giữ ← ép vào trùm): không kẹt trong đá, không lọt nền, trượt ra không giật', !r[0].trongDa && !r[0].duoiSan && r[0].cuoiDat && !r[0].cuoiChong && r[0].nhayMax <= 6.5, r);
    r = await ev(() => { const {E} = TV; H.chay(160, i => 'l' + ((i < 12 || (i >= 20 && i < 30)) ? ',j' : ''), () => H.yen()); return [E.pl.x + E.pl.w / 2 < H.than().x, E.pl.onGround, H.trongDa()]; });
    ok('  …thoát ra được (nhảy đôi qua trùm sang trái)', r[0] && r[1] && !r[2], r);
  }
  await chup('va-cham-ap-tuong');
  r = await ev(async () => { const {E, G} = TV; await H.vao('P12', 2 * 48 + 20, 13 * 48); const q = G.trum; G.dongCua = true; q.st = 'dung'; q.cd = 9999;
    q.x = 2 * 48 + 30; const s = H.kb(60, ''); return [s, (q.x | 0), E.pl.x | 0, TV.V1.TT.lanKep, TV.V1.TT.lanQua]; });
  ok('Đặt người chơi KẸP sẵn giữa tường và trùm: trùm bị đẩy lùi / cho đi xuyên, không kẹt', !r[0].trongDa && !r[0].cuoiChong && r[0].hpMat === 0, r);
  // f) đánh khi đang chồng thân
  B = await datTran(1500, 1300);
  r = await ev(() => { const {E, G} = TV; H.kb(60, 'r'); const hp0 = G.trum.hp, mau0 = E.pl.hp; let lan = 0;
    H.chay(80, i => (i % 12 < 2 ? 'a,r' : 'r'), () => { H.yen(); E.pl.iframes = 0; lan = Math.max(lan, H.lan()); }); return [hp0 - G.trum.hp, mau0 - E.pl.hp, lan]; });
  ok('Đánh khi đang chồng thân: trúng trùm, không mất máu vì chạm thân', r[0] > 0 && r[1] === 0, r);
  // g) chuyển pha khi đang chồng
  B = await datTran(1500, 1300);
  r = await ev(() => { const {E, G} = TV; const q = G.trum; H.kb(40, 'r'); const mau0 = E.pl.hp; q.hp = 150; q.flash = 6; q.def.trung(q, 1, 1); const st = q.st; let lan = 0, lot = 0;
    H.chay(130, 'r', () => { E.pl.iframes = 0; lan = Math.max(lan, H.lan()); if (H.trongDa()) lot++; }); return [st, q.pha, mau0 - E.pl.hp, lan, lot]; });
  ok('Chuyển pha khi đang chồng thân: không mất máu, vẫn chặn, không lọt đá', r[0] === 'chuyen_pha' && r[1] === 2 && r[2] === 0 && r[3] <= MEM_MAX && !r[4], r);

  /* ================= 2. BÁO ĐÒN – trận thật với “người chơi máy” ================= */
  const tranDau = async (phong, x, y, so) => ev(async ([phong, x, y, so]) => {
    const {E, G, V1} = TV, pl = E.pl; const kq = {hurtKhongBao:0, hurtTongBao:0, hpMatLa:0, nguy:[], chieu:{go:0, tha:0, quet:0}, matNa:0, pha:[], bat:{}, gamHurt:0, phaHurt:0, quaThan:0};
    G.luu.kho.chuong_vo = 3; G.luu.trumHa = false; G.luu.hetXem = false;
    await H.vao(phong, x, y);
    const q = G.trum; let baoRun = 0, trongNguy = false;
    const push0 = Array.prototype.push;
    G.nguy.push = function(n){ kq.nguy.push({loai:n.loai, st:q.st, pha:q.pha, baoRun, bao:n.bao || 0}); return push0.call(this, n); };
    const hurt0 = E.hurt; E.hurt = function(dir, dmg){ if (!trongNguy) kq.hurtKhongBao++; else kq.hurtTongBao++; if (q.st === 'gam') kq.gamHurt++; if (q.st === 'chuyen_pha') kq.phaHurt++; return hurt0.call(E, dir, dmg); };
    const bn0 = V1.buocNguy; V1.buocNguy = function(){ trongNguy = true; try { bn0(); } finally { trongNguy = false; } };
    let stT = '', hp0 = pl.hp, hurtTruoc = 0;
    for (let i = 0; i < 9000 && !q.dead; i++){
      const dx = q.x + q.w / 2 - (pl.x + pl.w / 2), xa = Math.abs(dx);
      // người chơi máy: áp sát, chém; thỉnh thoảng nhảy / lướt lùi; có lúc đứng xa
      const che = (i >> 7) % 3 === 2 ? 320 : 70;
      let k = '';
      if (xa > che + 30) k = dx > 0 ? 'r' : 'l'; else if (xa < che - 30 && che > 100) k = dx > 0 ? 'l' : 'r';
      if (i % 11 < 2) k += ',a';
      if (i % 97 === 50) k += ',j'; if (i % 151 === 80) k += ',s';
      const hurt1 = kq.hurtKhongBao + kq.hurtTongBao;
      H.chay(1, k);
      if (pl.hp < hp0 && kq.hurtKhongBao + kq.hurtTongBao === hurt1) kq.hpMatLa++;   // mất máu mà không qua E.hurt của trùm → nguồn lạ
      if (pl.hp < 3){ pl.hp = 6; } hp0 = pl.hp;
      if (pl.dead){ pl.dead = false; pl.hp = 6; }
      baoRun = q.baoTruoc ? baoRun + 1 : 0;
      if (q.st !== stT){ if (kq.chieu[q.st] !== undefined) kq.chieu[q.st]++; if (q.st === 'chuyen_pha') kq.pha.push(i); stT = q.st; }
      if (q.st !== 'chet' && H.chong()) kq.quaThan = Math.max(kq.quaThan, H.lan());   // lúc trùm gục (mờ dần) thân chắn tắt – có chủ ý
      if (so && i % 25 === 0 && q.st !== 'chet' && !q.batTu){ q.hp -= so; q.flash = 6; q.def.trung(q, so, 1); }
    }
    kq.matNa = kq.nguy.filter(n => n.loai === 'mat_na').length;
    kq.dead = q.dead; kq.phaCuoi = q.pha; kq.trumHa = G.luu.trumHa;
    E.hurt = hurt0; V1.buocNguy = bn0; delete G.nguy.push;
    return kq;
  }, [phong, x, y, so]);
  const xetBao = (kq, ten) => {
    const song = kq.nguy.filter(n => n.loai === 'song' && n.st === 'go'), quet = kq.nguy.filter(n => n.loai === 'quet'), mat = kq.nguy.filter(n => n.loai === 'mat_na');
    const songMin = Math.min(...song.map(n => n.baoRun)), quetBao = [...new Set(quet.map(n => n.baoRun))], matMin = Math.min(...mat.map(n => n.bao));
    ok(ten + ': Gõ Không Tiếng – sóng nào cũng có báo trước ≥ 0,4 s', song.length > 0 && songMin >= 24, {soSong:song.length, baoNganNhat:songMin + ' khung'});
    ok(ten + ': Quét Chuông – kéo ngược 0,35–0,5 s trước mỗi cú quét', quet.length === 0 || quetBao.every(v => v >= 21 && v <= 30), {soQuet:quet.length, baoKhung:quetBao});
    ok(ten + ': Mưa Mặt Nạ có xuất hiện, mỗi mặt nạ báo ≥ 0,5 s', kq.chieu.tha > 0 && mat.length > 0 && matMin >= 30, {lanTha:kq.chieu.tha, soMatNa:mat.length, baoNganNhat:matMin});
    ok(ten + ': không có cú trúng nào ngoài đòn có báo trước (chạm thân / gầm / chuyển pha = 0)', kq.hurtKhongBao === 0 && kq.hpMatLa === 0 && kq.gamHurt === 0 && kq.phaHurt === 0,
      {trungTuDonBao:kq.hurtTongBao, trungKhac:kq.hurtKhongBao, matMauLa:kq.hpMatLa, luc_gam:kq.gamHurt, luc_chuyen_pha:kq.phaHurt});
    ok(ten + ': chuyển pha đúng 1 lần, hạ được trùm', kq.pha.length === 1 && kq.phaCuoi === 2 && kq.dead, {pha:kq.pha, chieu:kq.chieu});
    ok(ten + ': người chơi máy áp sát cả trận không lọt vào thân (lấn ≤ ' + Math.round(MEM_MAX) + ' px)', kq.quaThan <= MEM_MAX + 2, kq.quaThan);
  };
  for (let lan = 1; lan <= 3; lan++){
    await moTrang('&moi=1'); await ev(() => TV.choi(true)); await pg.waitForTimeout(150);
    const kq = await tranDau('P12', 30 * 48, 13 * 48, 6); xetBao(kq, 'P12 trận ' + lan);
  }
  // phòng thử T3 (?thu=1) – nơi trước đây có lần không thấy Mưa Mặt Nạ
  for (let lan = 1; lan <= 3; lan++){
    await moTrang('&moi=1&thu=1'); await ev(() => TV.choi(true)); await pg.waitForTimeout(150);
    const kq = await tranDau('T3', 6 * 48, null, 6).catch(e => ({loi:String(e)}));
    if (kq.loi){ ok('T3 trận ' + lan, false, kq.loi); continue; }
    const mat = kq.nguy.filter(n => n.loai === 'mat_na');
    ok('Phòng thử T3 trận ' + lan + ': Mưa Mặt Nạ có ra + không trúng ngoài báo trước', kq.chieu.tha > 0 && mat.length > 0 && kq.hurtKhongBao === 0 && kq.dead, {tha:kq.chieu.tha, matNa:mat.length, trungKhac:kq.hurtKhongBao, chieu:kq.chieu});
  }
  // ảnh báo đòn
  await moTrang('&moi=1'); await ev(() => TV.choi(true)); await pg.waitForTimeout(150);
  await ev(async () => { const {G, E} = TV; G.luu.kho.chuong_vo = 3; await H.vao('P12', 33 * 48, 13 * 48); G.dongCua = true; H.chay(1, ''); H.chay(30, ''); });
  await chup('bao-gam');
  for (const [st, n, ten] of [['quet', 20, 'bao-quet-keo-nguoc'], ['go', 18, 'bao-go'], ['tha', 18, 'bao-mua-mat-na']]){
    await ev(([st, n]) => { const {G, E} = TV, q = G.trum; H.chay(90, '', () => { q.cd = 999; if (q.st !== 'chuyen_pha') q.st = 'dung'; E.pl.hp = 6; }); G.nguy.length = 0;
      q.face = E.pl.x < q.x ? -1 : 1; q.st = st; q.t = 0; H.chay(n, '', () => { E.pl.hp = 6; }); }, [st, n]);
    await chup(ten);
  }
  await ev(() => { const {G} = TV, q = G.trum; q.st = 'dung'; q.hp = 140; q.def.trung(q, 1, 1); H.chay(40, ''); }); await chup('bao-chuyen-pha');

  /* ================= 3. TIẾN ĐỘ ================= */
  // a) chết cùng khung trùm chết
  await moTrang('&moi=1'); await ev(() => TV.choi(true)); await pg.waitForTimeout(150);
  r = await ev(async () => { const {G, E, V1} = TV; G.luu.kho.chuong_vo = 3; G.luu.chuong = {phong:'P11', cot:50, hang:18}; G.luu.manh = 40; V1.ghiLuu();
    await H.vao('P12', 33 * 48, 13 * 48); G.dongCua = true; H.chay(2, ''); const q = G.trum;
    // CÙNG MỘT KHUNG: người chơi trúng đòn chết + trùm hết máu
    E.pl.iframes = 0; E.pl.hp = 1; E.hurt(1, 5); q.hp = 0; q.def.trung(q, 10, 1);
    const luu = JSON.parse(localStorage.getItem('tvcc-vung1')); return [E.pl.dead, q.st, luu.trumHa]; });
  ok('Chết cùng khung trùm chết: trùm được ghi "đã hạ" ngay vào bản lưu', r[0] && r[1] === 'chet' && r[2] === true, r);
  await pg.waitForFunction(() => { H.chay(10, ''); return TV.G.trang === 'het' || (TV.G.id === 'P11' && !TV.G.chuyen && TV.G.trang === 'het'); }, null, {timeout:20000, polling:50}).catch(() => {});
  await pg.waitForTimeout(1200);
  r = await ev(() => [TV.G.trang, TV.G.id, !!TV.G.trum, TV.G.luu.trumHa, TV.G.luu.hetXem, TV.G.luu.tui && TV.G.luu.tui.so, document.getElementById('l-het').classList.contains('mo')]);
  ok('  …hồi sinh ở Chuông Lưu, vẫn hiện màn "Hết Vùng 1", trùm không sống lại', r[0] === 'het' && r[1] === 'P11' && r[3] && r[4] && r[6], r);
  await chup('tien-do-chet-cung-luc');
  // b) lưu/tải giữa trận
  await moTrang('&moi=1'); await ev(() => TV.choi(true)); await pg.waitForTimeout(150);
  await ev(async () => { const {G, E, V1} = TV; G.luu.kho.chuong_vo = 3; G.luu.chuong = {phong:'P11', cot:50, hang:18}; G.luu.manhGui = 25; V1.ghiLuu();
    await H.vao('P12', 33 * 48, 13 * 48); G.dongCua = true; H.chay(60, ''); const q = G.trum; q.hp = 120; q.pha = 2; G.luu.manh = 33; });
  await moTrang(''); await ev(() => TV.choi(false)); await pg.waitForTimeout(200);
  r = await ev(() => [TV.G.id, TV.G.luu.trumHa, TV.G.luu.kho.chuong_vo, TV.G.luu.manhGui]);
  ok('Tải lại GIỮA trận: về Chuông Lưu P11, trùm chưa tính hạ, giữ 3 Chuông Vỡ + Mảnh Âm đã gửi', r[0] === 'P11' && r[1] === false && r[2] === 3 && r[3] === 25, r);
  r = await ev(async () => { await H.vao('P12', 33 * 48, 13 * 48); const q = TV.G.trum; return [!!q, q && q.hp, q && q.pha, q && q.st, TV.V1.TRUM_DEF.mau]; });
  ok('  …vào lại P12: trùm đủ máu (= mau trong TRUM_DEF), pha 1, đang ngủ chờ', r[0] && r[1] === r[4] && r[2] === 1 && r[3] === 'cho', r);
  // tải lại lúc trùm đang gục (trước khi hiện màn thắng)
  await ev(() => { const {G} = TV, q = G.trum; G.dongCua = true; H.chay(2, ''); q.hp = 0; q.def.trung(q, 1, 1); H.chay(30, ''); });
  await moTrang(''); await ev(() => TV.choi(false)); await pg.waitForTimeout(1300);
  r = await ev(() => [TV.G.luu.trumHa, TV.G.trang, TV.G.luu.hetXem]);
  ok('Tải lại lúc trùm đang gục: vẫn tính thắng, hiện màn "Hết Vùng 1" 1 lần', r[0] && r[1] === 'het' && r[2], r);
  await moTrang(''); await ev(() => TV.choi(false)); await pg.waitForTimeout(1300);
  r = await ev(() => [TV.G.trang]);
  ok('  …tải thêm lần nữa: không hiện lại màn thắng (không nhân đôi)', r[0] === 'choi', r);
  // c) túi Mảnh Âm khi ngã trong phòng trùm
  await moTrang('&moi=1'); await ev(() => TV.choi(true)); await pg.waitForTimeout(150);
  r = await ev(async () => { const {G, E, V1} = TV; G.luu.kho.chuong_vo = 3; G.luu.chuong = {phong:'P11', cot:50, hang:18}; V1.ghiLuu();
    await H.vao('P12', 20 * 48, 13 * 48); G.dongCua = true; H.chay(2, ''); G.luu.manh = 50; E.pl.iframes = 0; E.pl.hp = 1; E.hurt(1, 1); return [G.luu.manh]; });
  await pg.waitForFunction(() => { H.chay(10, ''); return TV.G.id === 'P11' && !TV.G.chuyen; }, null, {timeout:20000, polling:50});
  r = await ev(async () => { const {G, E, V1} = TV, t = G.luu.tui; const o = [G.luu.manh, t && t.phong, t && t.so];
    await H.vao('P12', 3 * 48, 13 * 48); const dat = E.datPt(t.x, t.y + 2), trongDa = E.solidPt(t.x, t.y - 10);
    // đi tới túi (trùm ngủ, thân chắn có thể nằm trên túi → vẫn nhặt được nhờ hộp nhặt rộng)
    const n = H.chay(900, () => (E.pl.x + E.pl.w / 2 < t.x ? 'r' : 'l'), () => { E.pl.hp = 6; return !G.luu.tui; });
    return o.concat([dat, trongDa, G.luu.manh, G.luu.tui, n]); });
  ok('Ngã trong phòng trùm: mất 30% (15) vào túi ở P12, túi nằm trên sàn, nhặt lại đủ 50', r[0] === 35 && r[1] === 'P12' && r[2] === 15 && r[3] && !r[4] && r[5] === 50 && !r[6], r);
  // d) cửa trùm không vượt được khi thiếu Chuông Vỡ
  r = await ev(async () => { const {G, E, V1} = TV; G.luu.kho.chuong_vo = 2; const kq = [];
    const thu = [['chạy', i => 'r'], ['lướt liên tục', i => 'r' + (i % 25 === 0 ? ',s' : '')], ['nhảy đôi + lướt', i => 'r' + (i % 40 < 10 || (i % 40 >= 18 && i % 40 < 24) ? ',j' : '') + (i % 40 === 20 ? ',s' : '')],
      ['đập đất / chém', i => 'r' + (i % 30 < 8 ? ',j' : '') + (i % 30 === 14 ? ',d,a' : '') + (i % 9 === 0 ? ',a' : '')]];
    for (const [ten, f] of thu){ for (const x0 of [44, 50, 53]){ await H.vao('P11', x0 * 48, 19 * 48); let xMax = 0;
      H.chay(500, f, () => { E.pl.hp = 6; xMax = Math.max(xMax, E.pl.x + E.pl.w); return G.chuyen || G.id !== 'P11'; });
      kq.push([ten, x0, G.id, !!G.chuyen, Math.round(xMax)]); } }
    return kq; });
  ok('Cửa trùm KHÔNG vượt được khi mới có 2 Chuông Vỡ (chạy/lướt/nhảy đôi/đập đất, 12 lần thử)', r.every(k => k[2] === 'P11' && !k[3] && k[4] <= 54 * 48 + 1), r.map(k => k.join(' ')).join(' · '));
  r = await ev(async () => { const {G, E} = TV; G.luu.kho.chuong_vo = 3; G.luu.kho.loi_vong_tan = 0; G.luu.congMo = []; await H.vao('P11', 50 * 48, 19 * 48); H.chay(260, 'r', () => G.chuyen); return [!!G.chuyen, !!G.moCong]; });
  ok('  …3 Chuông Vỡ mà chưa có Lõi Vọng Tàn thì cổng rễ chưa mở', !r[0] && !r[1], r);
  r = await ev(async () => { const {G, E} = TV; G.luu.kho.chuong_vo = 3; G.luu.kho.loi_vong_tan = 1; G.luu.congMo = []; await H.vao('P11', 50 * 48, 19 * 48);
    let thayMo = false; H.chay(420, 'r', () => { if (G.moCong) thayMo = true; return G.chuyen; }); return [!!G.chuyen, thayMo, (G.luu.congMo || []).includes('P11-dong')]; });
  ok('  …đủ 3 Chuông Vỡ + Lõi Vọng Tàn: gắn lõi, rễ từ từ mở (có hoạt cảnh), rồi qua được', r[0] && r[1] && r[2], r);

  /* ================= 4. ĐIỆN THOẠI NGANG (844×390, 932×430, có vùng an toàn) ================= */
  for (const [w, h] of [[844, 390], [932, 430]]){
    const ctx = await b.newContext({viewport:{width:w, height:h}, deviceScaleFactor:3, isMobile:true, hasTouch:true});
    const p2 = await ctx.newPage(); p2.on('pageerror', e => loiJS.push(e.message));
    await p2.goto(URL + '?tu=1&moi=1&safe=47,0,47,21'); await p2.waitForFunction(() => window.TV && TV.xong);
    await p2.evaluate(CAI); await p2.evaluate(() => TV.choi(true)); await p2.waitForTimeout(150);
    for (const [ten, fn] of [['p01', async () => { const {G, V1} = TV; G.luu.manh = 37; G.luu.kho.chuong_vo = 1; await H.vao('P01', 10 * 48, null); H.chay(60, ''); }],
      ['trum', async () => { const {G, E} = TV; G.luu.kho.chuong_vo = 3; await H.vao('P12', 30 * 48, 13 * 48); G.dongCua = true; H.chay(1, ''); H.chay(80, '', () => { E.pl.hp = 4; E.pl.iframes = 5; }); G.trum.hp = 190; H.chay(3, ''); }]]){
      await p2.evaluate(fn); await p2.evaluate(() => TV.V1.ve(0)); await p2.waitForTimeout(80);
      await p2.screenshot({path:path.join(OUT, 'dien-thoai-' + w + 'x' + h + '-' + ten + '.png')});
      const d = await p2.evaluate(() => {
        const R = id => { const e = document.getElementById(id), r = e.getBoundingClientRect(); return {l:r.left, t:r.top, r:r.right, b:r.bottom}; };
        const cv = R('cv'), k = (cv.r - cv.l) / 960, K = TV.V1.HUD_KHUNG, ra = o => o && {l:cv.l + o.x * k, t:cv.t + o.y * k, r:cv.l + (o.x + o.w) * k, b:cv.t + (o.y + o.h) * k};
        const nut = ['b-a', 'b-h', 'b-s', 'b-j'].map(R).concat([R('dpad')]);
        return {cv, k, map:R('b-map'), nut, hud:ra(K.panel), trum:ra(K.trum), mau:ra(K.mau), w:innerWidth, h:innerHeight};
      });
      const cat = (a, c) => a && c && a.l < c.r && a.r > c.l && a.t < c.b && a.b > c.t;
      const kc = (a, c) => Math.max(0, Math.max(a.l - c.r, c.l - a.r), Math.max(a.t - c.b, c.t - a.b));
      const trongAnToan = o => o.l >= 47 - 0.5 && o.r <= d.w - 47 + 0.5 && o.b <= d.h - 0 + 0.5;
      const pre = w + '×' + h + ' ' + ten + ': ';
      ok(pre + 'khung game + HUD nằm trong vùng an toàn (tai thỏ 47 px mỗi bên)', trongAnToan(d.cv) && trongAnToan(d.hud), {cv:d.cv, hud:d.hud});
      ok(pre + 'ô máu đủ to (≥ 17 px thật/ô)', 24 * d.k >= 17, (24 * d.k).toFixed(1) + ' px');
      ok(pre + 'nút Bản đồ ≥ 44 px, trong vùng an toàn, không đè HUD / thanh trùm', d.map.b - d.map.t >= 44 && d.map.r - d.map.l >= 70 && trongAnToan(d.map) && !cat(d.map, d.hud) && !cat(d.map, d.trum), d.map);
      ok(pre + 'HUD và thanh máu trùm không chạm nút cảm ứng (cách ≥ 40 px)', d.nut.every(n => kc(n, d.hud) >= 40 && (!d.trum || kc(n, d.trum) >= 40)),
        d.nut.map(n => Math.round(Math.min(kc(n, d.hud), d.trum ? kc(n, d.trum) : 999))));
    }
    await ctx.close();
  }
  ok('Không có lỗi JS', loiJS.length === 0, loiJS.join(' | ') || 'không');
  console.log('\n==== TỔNG: ' + (KQ.length - soLoi) + '/' + KQ.length + ' đạt ====');
  fs.writeFileSync(path.join(OUT, 'ket-qua.txt'), KQ.join('\n') + '\n');
  await b.close();
})();
