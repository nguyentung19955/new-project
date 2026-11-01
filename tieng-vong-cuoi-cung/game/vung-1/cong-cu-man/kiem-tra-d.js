// kiem-tra-d.js – LUỒNG D: kiểm tra bằng Playwright (chromium có sẵn)
//   1) Chống kẹt dây leo: 5 tình huống × 20 lần (góc, sát trần, sát cửa, khi lướt, đổi phòng khi đang bám)
//   2) Quái: không bắn khi chưa hiện trên camera; đạn không xuyên tường; thời gian báo đòn từng loại
//   3) Lưu / tiến độ: vào lại phòng không mất đồ & quái đã hạ; tải lại trang giữ tiến độ; chết ở P11/P12 hồi sinh đúng chỗ
//   4) Đi tay qua cửa ngược P12 → P11 → P09 → P06 → P05
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765 &) ; node game/vung-1/cong-cu-man/kiem-tra-d.js
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path');
const URL = 'http://localhost:8765/game/vung-1/index.html?tu=1&moi=1';
const RA = path.join(__dirname, 'xem', 'ket-qua-d.json');

(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({viewport:{width:960, height:540}});
  const loiJS = [];
  pg.on('pageerror', e => loiJS.push(e.message));
  pg.on('console', m => { if (m.type() === 'error') loiJS.push(m.text()); });
  await pg.goto(URL);
  await pg.waitForFunction(() => window.TV && (TV.xong || TV.loi), null, {timeout:30000});
  await pg.evaluate(() => TV.choi(true));
  await pg.waitForTimeout(200);

  // ---------- trợ giúp chạy trong trang ----------
  await pg.evaluate(() => {
    const {E, G, V1} = TV, T = 48, pl = E.pl;
    const H = window.HD = {};
    let seed = 1;
    H.rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    H.datSeed = s => { seed = s + 1; };
    H.vao = async (id, cot, hang) => {   // vào phòng, đặt nhân vật đứng ở ô (cot, hang) (chân ở đáy ô)
      const p = await V1.layPhong(id);
      V1.vaoPhong(p, null, {x:cot * T + T / 2, y:(hang + 1) * T});
      G.chuyen = null; G.khoaCuaT = 0; pl.hp = E.P.maxHp; pl.iframes = 99999;
      Object.assign(pl, {vx:0, vy:0, leo:false, dash:0, leoKhoa:0, atk:'', pound:null, hurtT:0});
    };
    // một bước; nếu đang chuyển phòng thì chờ promise xong
    H.buoc = async (phim) => {
      TV.buoc(1, phim);
      if (G.chuyen) for (let k = 0; k < 80 && G.chuyen; k++){ TV.buoc(1, phim); await new Promise(r => setTimeout(r, 0)); }
    };
    H.trongDa = () => E.collide(pl.x, pl.y, pl.w, pl.h);
    // chạy chuỗi [số khung, phím]; đếm khung lọt trong đá
    H.chay = async (ds, tk) => {
      for (const [n, phim] of ds) for (let i = 0; i < n; i++){ await H.buoc(phim); if (H.trongDa()) tk.trongDa++; }
    };
    // thử thoát: bấm nhảy + sang ngang (cả 2 phía), đếm số khung tới khi nhân vật đi được ≥ 24 px hoặc sang phòng khác
    H.thoat = async (tk) => {
      for (const d of (H.rand() < 0.5 ? ['r', 'l'] : ['l', 'r'])){
        const x0 = pl.x, y0 = pl.y, id0 = G.id;
        for (let f = 1; f <= 90; f++){
          await H.buoc(f <= 2 ? 'j,' + d : d);
          if (H.trongDa()) tk.trongDa++;
          if (G.id !== id0 || Math.hypot(pl.x - x0, pl.y - y0) >= 24){ tk.thoatKhung = Math.min(tk.thoatKhung ?? 999, f); return f; }
        }
      }
      tk.thoatKhung = 999; return 999;
    };
  });

  // ---------- 1) DÂY LEO ----------
  const TINH_HUONG = {
    // P01 dây cột 41 xuyên lỗ trần 1 ô (tường cột 40 và 42) – leo lên/xuống qua góc rồi bấm ngang/chéo
    goc: async (i) => {
      await HD.vao('P01', 41, 14);
      const tk = {trongDa:0};
      const lenF = 20 + Math.floor(HD.rand() * 160), d = HD.rand() < 0.5 ? 'l' : 'r';
      const kieu = Math.floor(HD.rand() * 4);
      const ds = [[2, 'u'], [lenF, 'u']];
      if (kieu === 0) ds.push([20, d]);
      else if (kieu === 1) ds.push([20, 'u,' + d]);
      else if (kieu === 2) ds.push([2, 'j,' + d], [30, d]);
      else ds.push([Math.floor(HD.rand() * 60), 'd'], [15, d]);
      await HD.chay(ds, tk); await HD.thoat(tk);
      return tk;
    },
    // P02 dây cột 51 – đỉnh dây sát trần (hàng 5 đặc); P04 dây cột 21 – đỉnh trong vòm thẻ tên
    tran: async (i) => {
      const P = i % 2 ? ['P04', 21, 10] : ['P02', 51, 24];
      await HD.vao(P[0], P[1], P[2]);
      const tk = {trongDa:0};
      const d = HD.rand() < 0.5 ? 'l' : 'r', kieu = Math.floor(HD.rand() * 4);
      const ds = [[2, 'u'], [260, 'u']];   // leo kịch trần
      if (kieu === 0) ds.push([40, 'u']);
      else if (kieu === 1) ds.push([30, 'u,' + d]);
      else if (kieu === 2) ds.push([2, 'j'], [40, '']);
      else ds.push([2, 'j,' + d], [40, d]);
      await HD.chay(ds, tk); await HD.thoat(tk);
      return tk;
    },
    // dây ngay cửa: P03 cột 57 (cửa đáy → P04) & P04 cột 57 (cửa trên → P03); bấm ngang / nhảy sát mép cửa
    cua: async (i) => {
      const P = i % 2 ? ['P04', 57, 12] : ['P03', 57, 24];
      await HD.vao(P[0], P[1], P[2]);
      const tk = {trongDa:0};
      const d = HD.rand() < 0.5 ? 'l' : 'r';
      const ds = i % 2 ? [[2, 'u'], [40 + Math.floor(HD.rand() * 180), 'u']] : [[2, 'd'], [10 + Math.floor(HD.rand() * 80), 'd']];
      ds.push([HD.rand() < 0.5 ? 2 : 0, 'j,' + d], [25, d]);
      await HD.chay(ds, tk); await HD.thoat(tk);
      return tk;
    },
    // lướt khi đang bám dây / lướt ngang vào dây rồi bấm ↑
    luot: async (i) => {
      const tk = {trongDa:0};
      const d = HD.rand() < 0.5 ? 'l' : 'r';
      if (i % 2){
        await HD.vao('P02', 51, 24);
        await HD.chay([[2, 'u'], [Math.floor(HD.rand() * 200), 'u'], [3, 's,' + d], [3, 's'], [20, d]], tk);
      } else {
        // P03: đứng cách dây cột 42 vài ô, lướt vào dây và bấm ↑ ngay khi tới
        const tu = HD.rand() < 0.5 ? -1 : 1, lech = tu < 0 ? 2 + Math.floor(HD.rand() * 3) : 2;   // phía đông cột 45–46 là bệ đúc
        await HD.vao('P03', 42 + tu * lech, 24);
        const huong = tu < 0 ? 'r' : 'l';
        await HD.chay([[3, 's,' + huong], [Math.floor(HD.rand() * 10), huong], [40, 'u'], [3, 's,' + d], [20, 'u,' + d]], tk);
      }
      await HD.thoat(tk);
      return tk;
    },
    // đổi phòng khi đang bám: P02 dây cột 9 xuống P06 (dây cột 31) rồi leo ngược lên; P04 → P03 qua cửa trên
    doiPhong: async (i) => {
      const tk = {trongDa:0, doi:[]};
      if (i % 2){
        await HD.vao('P02', 9, 29);
        await HD.chay([[2, 'd'], [200, 'd']], tk); tk.doi.push(TV.G.id);
        await HD.chay([[Math.floor(HD.rand() * 30), ''], [2, 'u'], [260, 'u']], tk); tk.doi.push(TV.G.id);
      } else {
        await HD.vao('P04', 57, 12);
        await HD.chay([[2, 'u'], [300, 'u']], tk); tk.doi.push(TV.G.id);
        await HD.chay([[Math.floor(HD.rand() * 20), ''], [2, 'd'], [200, 'd']], tk); tk.doi.push(TV.G.id);
      }
      await HD.chay([[HD.rand() < 0.5 ? 2 : 0, 'j,r'], [10, 'r']], tk);
      await HD.thoat(tk);
      return tk;
    },
  };
  const dayLeo = {};
  for (const [ten, fn] of Object.entries(TINH_HUONG)){
    const kq = [];
    for (let i = 0; i < 20; i++){
      await pg.evaluate(s => HD.datSeed(s), i * 7919 + ten.length);
      const tk = await pg.evaluate(`(${fn.toString()})(${i})`);
      kq.push(tk);
    }
    const ket = kq.filter(t => t.thoatKhung > 60 || t.trongDa > 0);
    dayLeo[ten] = {lan:20, ket:ket.length, thoatToiDa:Math.max(...kq.map(t => t.thoatKhung)), trongDa:kq.reduce((a, t) => a + t.trongDa, 0),
      doi:kq.filter(t => t.doi).map(t => t.doi.join('>')).slice(0, 4)};
    console.log('Dây leo –', ten.padEnd(9), JSON.stringify(dayLeo[ten]));
  }

  // ---------- 2) QUÁI ----------
  const quai = await pg.evaluate(async () => {
    const {E, G, V1} = TV, T = 48, pl = E.pl, out = {ngoaiKhung:0, ban:0, baoDon:{}, xuyenTuong:[], camKhongCam:{}};
    // theo dõi đạn sinh ra: điểm nòng có nằm trong khung camera không
    const goc = E.DAN.push.bind(E.DAN);
    E.DAN.push = (d) => { out.ban++; const k = E.khungNhin; if (k && !(d.x > k.x - 8 && d.x < k.x + k.w + 8 && d.y > k.y - 8 && d.y < k.y + k.h + 8)) out.ngoaiKhung++; return goc(d); };
    const PHONG = ['P01', 'P02', 'P03', 'P04', 'P06', 'P09', 'P11'];
    for (const id of PHONG){
      const p = await V1.layPhong(id);
      for (let qi = 0; qi < p.quai.length; qi++){
        const v = p.quai[qi];
        for (let k = -12; k <= 12; k += 2){
          const c = v.cot + k; let r = v.hang;
          // tìm ô đứng gần hàng quái
          let ok = false;
          for (const dr of [0, 1, -1, 2, -2, 3, 4]){ const rr = r + dr;
            if (E.tile && p.luoi[rr] && p.luoi[rr + 1] && '.H'.includes(p.luoi[rr][c] || '#') && '.H'.includes(p.luoi[rr - 1][c] || '#') && '#='.includes(p.luoi[rr + 1][c] || '.')){ r = rr; ok = true; break; } }
          if (!ok) continue;
          await HD.vao(id, c, r);
          pl.iframes = 0;
          let dangDanh = {}, st = {};
          for (let f = 0; f < 240; f++){
            pl.hp = E.P.maxHp; pl.dead = false;
            TV.buoc(1, '');
            for (const q of E.QUAI){
              const ten = q.def.id;
              if (q.st === 'danh' && !dangDanh[q.idx]){ dangDanh[q.idx] = {f, bao:0}; }
              else if (q.st === 'danh' && dangDanh[q.idx]){ const dd = dangDanh[q.idx]; if (q.baoTruoc) dd.bao++;
                // khung gây sát thương / bắn đầu tiên; đo từ khung đầu của đòn (đã cập nhật kDanh)
                const kTrung = (q.def.khung_trung || [])[0] ?? (q.def.chieu && (q.def.chieu.khung_ban ?? q.def.chieu.chan_dong));
                if (dd.toi === undefined && q.kDanh >= kTrung) dd.toi = f - dd.f + 1;
                if (dd.toi !== undefined){ const b = out.baoDon[ten] || (out.baoDon[ten] = {lan:0, minMs:1e9}); if (!dd.ghi){ dd.ghi = 1; b.lan++; b.minMs = Math.min(b.minMs, Math.round(dd.toi * 1000 / 60)); } } }
              if (q.st !== 'danh') dangDanh[q.idx] = null;
            }
            // đạn: không được ở trong ô đặc (xuyên tường)
            for (const d of E.DAN) if (E.solidPt(d.x, d.y)) out.xuyenTuong.push(id + ' ' + Math.round(d.x) + ',' + Math.round(d.y));
          }
        }
      }
    }
    E.DAN.push = goc;
    // P03: Kèn Câm sau bệ đúc – nhân vật đứng ở dây cột 42 (sau bệ) → đạn phải nổ ở bệ, không trúng
    await HD.vao('P03', 43, 24); pl.iframes = 0;
    let trung = 0, no = [];
    const hp0 = () => pl.hp;
    for (let f = 0; f < 600; f++){ const h = pl.hp; TV.buoc(1, ''); if (pl.hp < h) trung++; pl.hp = E.P.maxHp; for (const n of E.NO) if (n.t === 1 && !n.dat) no.push(Math.round(n.x)); }
    out.P03be = {trung, no:[...new Set(no.map(x => Math.floor(x / 48)))]};
    // thử ngược: tắt khung camera (null) – xem quái bay có bắn từ ngoài màn hình không (để so sánh)
    return out;
  });
  console.log('Quái:', JSON.stringify(quai));

  // ---------- 3) LƯU / TIẾN ĐỘ / HỒI SINH ----------
  const luu = await pg.evaluate(async () => {
    const {E, G, V1} = TV, T = 48, pl = E.pl, out = {};
    pl.iframes = 99999;
    // nhặt Mảnh Âm P01-manh-3 (24,17), hạ Khuyết Cẩu P01, sang P02 rồi quay lại
    await HD.vao('P01', 24, 17);
    for (let i = 0; i < 5; i++) await HD.buoc('');
    out.nhat = G.luu.daNhat.includes('P01-manh-3');
    const q = E.QUAI[0]; if (q){ q.hp = 1; E.SUKIEN.length = 0; q.hp = 0; q.st = 'chet'; q.t = 0; E.SUKIEN.push({k:'quai-chet', q}); V1.suKienTheGioi(); }
    const p2 = await V1.layPhong('P02'); V1.vaoPhong(p2, 'P02-tay', null);
    const p1 = await V1.layPhong('P01'); V1.vaoPhong(p1, 'P01-dong', null);
    out.vaoLai = {conManh:G.luu.daNhat.includes('P01-manh-3'), quaiSong:E.QUAI.length};
    // tường nứt P02 cột 13 (hàng 27–29) vỡ → vào lại vẫn vỡ
    G.luu.tuongVo.push('P02:13:27', 'P02:13:28', 'P02:13:29');
    V1.vaoPhong(p2, 'P02-tay', null);
    out.tuongVo = E.tile(13, 28) === '.';
    // nghỉ chuông P05 → lưu; tải lại trang sẽ kiểm ở ngoài
    const p5 = await V1.layPhong('P05'); V1.vaoPhong(p5, 'P05-dong', null);
    G.luu.kho.chuong_vo = 2; G.luu.manh = 50;
    V1.nghiChuong(); G.trang = 'choi';
    out.chuong = G.luu.chuong;
    return out;
  });
  // tải lại trang, "Tiếp tục"
  await pg.goto(URL.replace('moi=1', 'x=1'));
  await pg.waitForFunction(() => window.TV && TV.xong, null, {timeout:30000});
  await pg.evaluate(() => TV.choi(false));
  await pg.waitForTimeout(200);
  luu.taiLai = await pg.evaluate(() => ({phong:TV.G.id, chuong:TV.G.luu.kho.chuong_vo, manh:TV.V1.tongManh(), daNhat:TV.G.luu.daNhat.length, tuongVo:TV.G.luu.tuongVo.length}));
  // chết ở P11 (chưa nghỉ chuông P11) → về P05; nghỉ chuông P11 rồi chết ở P12 → về P11 cạnh chuông, cửa không khoá
  await pg.evaluate(() => { window.HD || 0; });
  await pg.evaluate(() => {   // nạp lại trợ giúp sau khi tải trang
    const {E, G, V1} = TV, T = 48, pl = E.pl, H = window.HD = {};
    H.vao = async (id, cot, hang) => { const p = await V1.layPhong(id); V1.vaoPhong(p, null, {x:cot * T + T / 2, y:(hang + 1) * T}); G.chuyen = null; G.khoaCuaT = 0; };
    H.cho = async (n) => { for (let i = 0; i < n; i++){ TV.buoc(1, ''); if (G.chuyen) await new Promise(r => setTimeout(r, 0)); } };
    H.chet = async () => { E.pl.iframes = 0; E.pl.hp = 1; E.pl.hurtT = 0; E.hurt(1, 5); await H.cho(400); };
  });
  luu.chet = await pg.evaluate(async () => {
    const {E, G, V1} = TV, out = {};
    await HD.vao('P11', 30, 18); await HD.cho(60);
    out.dongCuaKhiDanh = G.dongCua;
    await HD.chet();
    out.chetP11 = {phong:G.id, dongCua:G.dongCua, hp:E.pl.hp};
    G.luu.kho.chuong_vo = 3; G.luu.nvA = true;
    await HD.vao('P11', 50, 18); await HD.cho(5);
    if (G.tinhAnh){ G.tinhAnh.hp = 0; G.tinhAnh.st = 'chet'; G.tinhAnh.t = 0; E.SUKIEN.push({k:'quai-chet', q:G.tinhAnh}); V1.suKienTheGioi(); }
    await HD.cho(150);
    V1.nghiChuong(); G.trang = 'choi';
    await HD.vao('P12', 10, 16); await HD.cho(30);
    await HD.chet();
    out.chetP12 = {phong:G.id, x:Math.round(E.pl.x / 48), dongCua:G.dongCua, cuaKhoa:G.cuaKhoa.length, tinhAnhSong:!!(G.tinhAnh && !G.tinhAnh.dead)};
    // từ P11 đi ngược về P05 qua cửa
    const duong = ['P11', 'P09', 'P06', 'P05'], qua = [G.id];
    for (let i = 0; i < duong.length - 1; i++){
      const p = G.phong, c = p.cua.find(c => c.toi === duong[i + 1]), T = 48, pl = E.pl, n = c.cao;
      let phim = '';
      if (c.huong === 'phai'){ pl.x = c.cot * T - pl.w - 2; pl.y = (c.hang + n) * T - pl.h - 1; phim = 'r'; }
      else { pl.x = 6; pl.y = (c.hang + n) * T - pl.h - 1; phim = 'l'; }
      G.khoaCuaT = 0;
      for (let k = 0; k < 200 && G.id === p.id; k++){ TV.buoc(1, phim); if (G.chuyen) await new Promise(r => setTimeout(r, 0)); }
      await HD.cho(40); qua.push(G.id);
    }
    out.veP05 = qua.join(' → ');
    return out;
  });
  console.log('Lưu/tiến độ:', JSON.stringify(luu));
  console.log('Lỗi JS:', loiJS.length ? loiJS.join(' | ') : 'không');
  fs.writeFileSync(RA, JSON.stringify({dayLeo, quai, luu, loiJS}, null, 1));
  await b.close();
})();
