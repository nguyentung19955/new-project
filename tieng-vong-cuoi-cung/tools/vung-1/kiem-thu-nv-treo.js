// Phép thử CHỐNG TÁI PHÁT lỗi "Kiếm Khách quay lưng, xám, lơ lửng giữa không trung" (phiên Font + sửa lỗi, 02/11/2026).
// Nguyên nhân gốc: engine kéo dây leo lên tới trần ở MỌI cột dây, nhưng ảnh phòng vẽ sẵn chỉ có dây một đoạn →
// cột "dây tàng hình" (vd Hollow Stair P02: 14 ô). Bấm ↑ giữa không trung = bám dây vô hình → tư thế treo dây (quay lưng).
// Kiểm: (1) mọi ô dây của engine ở Vùng 1 + Vùng 2 đều có hình dây trong ảnh phòng; (2) ở chỗ dây tàng hình cũ của P02,
//       bấm ↑ trên không KHÔNG bám; (3) đánh nhau với Màn Tang: mọi khung leo/treo đều đúng ô dây, loé trắng hết ≤ 8 bước;
//       (4) lớp sức mạnh thiếu ảnh (mat-na-nut-1/bamtuong, dapdat) không vẽ gì thay.
// Chạy: (cd tieng-vong-cuoi-cung && python3 -m http.server 8765 &) ; node tools/vung-1/kiem-thu-nv-treo.js
const {chromium} = require('playwright');
const GOC = 'http://localhost:8765/game/';
(async () => {
  const b = await chromium.launch(); let hong = 0, dat = 0;
  const ok = (dk, t, x) => { console.log((dk ? 'ĐẠT ' : 'HỎNG ') + t + (dk ? '' : ' – ' + JSON.stringify(x))); if (dk) dat++; else hong++; };
  const loi = [];
  async function moVung(v, them){
    const pg = await b.newPage({viewport:{width:844, height:390}});
    pg.on('pageerror', e => loi.push(v + ': ' + e.message));
    await pg.goto(GOC + v + '/index.html?tu=1&moi=1' + (them || '')); await pg.waitForFunction(() => window.TV && TV.xong, null, {timeout:40000});
    await pg.evaluate(() => TV.choi(true));
    return pg;
  }
  // (1) không còn ô dây tàng hình
  for (const [v, ds] of [['vung-1', ['P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P09', 'P11', 'P12']],
                         ['vung-2', ['R201', 'R202', 'R203', 'R204', 'R205', 'R206', 'R207', 'R208', 'R209', 'R210', 'R211', 'R212', 'R213', 'RS201', 'RS202', 'RS203']]]){
    const pg = await moVung(v);
    const r = await pg.evaluate(async ds => {
      const {V1, E, G} = TV, out = {}, khong = [];
      for (const id of ds){
        let p; try { p = await V1.layPhong(id); } catch (e){ continue; } if (!p) continue;
        V1.vaoPhong(p, null, {x:200, y:200});
        const A = V1.CANH && V1.CANH[G.id]; if (!A || A.meta.cot !== E.BD.COT) { khong.push(id); continue; }
        const f = E.coDayTuAnh(A.canh, A.meta.cot, A.meta.hang); let n = 0, an = [];
        for (let rr = 0; rr < E.BD.HANG; rr++) for (let c = 0; c < E.BD.COT; c++) if (E.tile(c, rr) === 'H'){ n++; if (!f(c, rr)) an.push(c + ',' + rr); }
        out[id] = {day:n, tangHinh:an};
      }
      return {out, khong};
    }, ds);
    const xau = Object.entries(r.out).filter(([, o]) => o.tangHinh.length);
    ok(!xau.length && Object.keys(r.out).length > 0, v + ': mọi ô dây leo đều có hình dây trong ảnh phòng (' + Object.keys(r.out).length + ' phòng có ảnh)', xau);
    await pg.close();
  }
  // (2) P02: bấm ↑ giữa không trung ở cột dây tàng hình cũ → không bám
  let pg = await moVung('vung-1');
  let r = await pg.evaluate(async () => {
    const {V1, E} = TV, pl = E.pl; V1.vaoPhong(await V1.layPhong('P02'), null, {x:200, y:200});
    const T = E.BD.T, c = 18; let rr = 8; while (rr < 14 && E.collide(c * T + 10, rr * T, 28, pl.h)) rr++;
    V1.datNV(c * T + T / 2, rr * T + pl.h); pl.onGround = false;
    const ten = [];
    for (let i = 0; i < 40; i++){ for (const k of V1.KEYS) V1.ep[k] = k === 'u' ? 1 : 0; TV.mot(); ten.push(E.trangThai().ten); }
    return {leo:ten.filter(t => t === 'treoday' || t === 'leoday').length, o:E.tile(c, rr)};
  });
  ok(r.leo === 0, 'P02: bấm ↑ giữa không trung (chỗ dây tàng hình cũ) không bám dây', r);
  // dây thật ở đáy P02 vẫn leo được
  r = await pg.evaluate(() => {
    const {V1, E} = TV, pl = E.pl, T = E.BD.T; let o = null;
    for (let rr = E.BD.HANG - 1; rr >= 0 && !o; rr--) for (let c = 0; c < E.BD.COT; c++) if (E.tile(c, rr) === 'H' && !E.collide(c * T + 10, rr * T - 40, 28, pl.h)){ o = [c, rr]; break; }
    if (!o) return {khongDay:true};
    V1.datNV(o[0] * T + T / 2, o[1] * T + T / 2); pl.onGround = false;
    let leo = 0; for (let i = 0; i < 30; i++){ for (const k of V1.KEYS) V1.ep[k] = k === 'u' ? 1 : 0; TV.mot(); if (pl.leo) leo++; }
    return {leo, o};
  });
  ok(r.leo > 0, 'P02: dây có hình vẫn bám/leo được', r);
  // (3) Màn Tang: đánh nhau ngẫu nhiên, mọi khung leo/treo phải đúng ô dây; loé trắng sau trúng đòn ngắn
  for (const ph of ['P04', 'P09']){
    r = await pg.evaluate(async ph => {
      const {V1, E, G} = TV, pl = E.pl; V1.vaoPhong(await V1.layPhong(ph), null, {x:200, y:200});
      const tang = E.QUAI.filter(q => q.def.id === 'tang'); if (!tang.length) return {khongTang:true};
      let seed = 11; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
      const ks = ['r', 'l', 'r,j', 'l,j', 'u', 'd', 'j', 'a', 's', 'r,u', 'l,u', ''];
      let sai = [], trungDon = 0, trangMax = 0, trang = 0;
      for (let ep = 0; ep < 12; ep++){
        const q = tang[ep % tang.length]; V1.datNV(q.x + (ep % 2 ? 60 : -30), q.y + q.h + 40);
        let k = '';
        for (let i = 0; i < 300 && G.id === ph; i++){
          if (i % 12 === 0) k = ks[Math.floor(rnd() * ks.length)];
          pl.hp = E.P.maxHp; for (const kk of V1.KEYS) V1.ep[kk] = k.split(',').includes(kk) ? 1 : 0; TV.mot();
          const st = E.trangThai();
          if (st.ten === 'trungdon') trungDon++;
          if (E.trangNV()){ trang++; trangMax = Math.max(trangMax, trang); } else trang = 0;
          if ((st.ten === 'treoday' || st.ten === 'leoday') && E.tile(Math.floor((pl.x + pl.w / 2) / E.BD.T), Math.floor((pl.y + pl.h * 0.4) / E.BD.T)) !== 'H') sai.push([i, Math.round(pl.x), Math.round(pl.y)]);
        }
      }
      return {sai:sai.slice(0, 5), trungDon, trangMax};
    }, ph);
    ok(!r.khongTang && r.trungDon > 0, ph + ': có giao tranh thật với Màn Tang (bị trúng đòn)', r);
    ok(!r.khongTang && !r.sai.length, ph + ': không khung leo/treo dây nào ở chỗ không có dây', r);
    ok(!r.khongTang && r.trangMax <= E_TRANG_MAX, ph + ': loé trắng sau trúng đòn ≤ ' + E_TRANG_MAX + ' bước (không để lại màu xám/trắng)', r);
  }
  await pg.close();
  // (4) lớp sức mạnh đã lên cấp 1 (mat-na-nut-1) nhưng clip bamtuong/dapdat chưa có ảnh → không vẽ gì thay
  pg = await moVung('vung-1', '&sucmanh=1');
  r = await pg.evaluate(async () => {
    const L = window.LopTrangBi; if (!L) return {khong:true};
    const c = document.createElement('canvas'); c.width = 300; c.height = 300; const g = c.getContext('2d');
    for (let i = 0; i < 3; i++){ L.veTruoc(g, 'bamtuong', 0, 150, 250, false, 1.5); L.veTruoc(g, 'dapdat', 3, 150, 250, false, 1.5); await new Promise(r => setTimeout(r, 300)); }
    const d = g.getImageData(0, 0, 300, 300).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++;
    return {diem:n, thieu:L.clipThieu('mat-na-nut-1'), hien:L.lopDangHien()};
  });
  ok(!r.khong && r.diem === 0 && r.thieu.includes('bamtuong'), 'Lớp mat-na-nut-1 thiếu ảnh bamtuong/dapdat: bỏ qua lớp, không vẽ gì thay', r);
  await pg.close();
  ok(!loi.length, 'Không lỗi JS', loi);
  console.log('Đạt ' + dat + ' / ' + (dat + hong)); await b.close(); process.exit(hong ? 1 : 0);
})();
const E_TRANG_MAX = 8;   // dừng hình khi bị đánh (5) + loé trắng (2) + 1
