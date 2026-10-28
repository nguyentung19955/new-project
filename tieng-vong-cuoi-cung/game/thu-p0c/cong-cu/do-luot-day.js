/* ĐO (không phải kiểm thử tự động – không có đạt / trượt, chỉ ghi số): lướt xuyên thân tinh anh + đẩy chạm thân. PH10 mục 3.
   Chạy trong trang P0-C (?ghi=1&vao=e) bởi quay-p0c.py → video/do-luot-day.json. Dùng biến toàn cục của trang (TA, pl, step…).
   Tường giả: tô tạm cột 0–2 của E thành đá ('S') rồi trả lại '.' (E thật KHÔNG có tường trong tầm thân tinh anh – sân cột 3–27).
   doiDau: tinh anh cột 16 lao trái; Lam đứng cách d0 (tâm–tâm), LƯỚT về phía nó khi khe hở (mép hộp húc – mép vùng ăn đòn Lam) ≤ g;
     giu = sau khi lướt giữ phím tiến. kq: 'qua' (ra khỏi thân, không trúng) · 'TRÚNG' · 'không lướt (quá muộn)' (húc dừng trước khi tới / đã chồng).
     trongThan = số tick chồng thân; giuThem = số tick miễn ĐƯỢC GIỮ THÊM sau khi miễn của lướt lẽ ra đã hết (0 = lướt tự đủ). */
(() => {
  const BX = () => ({x: TA.x - 4, w: TA.w + 8, y: TA.y + TA.h - 150, h: 120});
  const tuong = (on) => { fill(PE, 0, 0, 2, 13, on ? 'S' : '.'); };
  const datTA = (cot, ta, dir) => { TA.x = TA.px = (PE.x0 + cot) * T; TA.y = TA.py = FLOOR - TA.h; TA.ta = TA.st = ta; TA.t = 0; TA.hucDir = dir; TA.face = dir; TA.cdHuc = 9999; TA.cdDap = 9999; TA.dapLien = 0; TA.T.lastHit = S.frame; };
  // một lần húc đối đầu: tinh anh ở cột cot lao về hướng dir; Lam đứng cách d0 (tâm–tâm); lướt về phía tinh anh khi khe hở ≤ g
  function huc(cot, dir, d0, g, giu, lamX) {
    newGame(); datTA(cot, 'hucBao', dir); const ec = TA.x + TA.w / 2;
    TVP0.datLam((lamX !== undefined ? lamX : ec + dir * d0) - pl.w / 2, -dir); pl.hp = 5; pl.iframes = 0;
    const toi = dir < 0 ? 'r' : 'l';
    let da = false, kq = {cot, d0: Math.round(Math.abs(pl.x + pl.w / 2 - ec)), g, giu}, f0 = S.frame, tIn = -1, tOut = -1, maxIn = 0, run = 0;
    for (let i = 0; i < 200; i++) {
      const hb = hurtBox(), B = BX(), gap = dir < 0 ? B.x - (hb.x + hb.w) : hb.x - (B.x + B.w);
      let ph = '';
      if (!da && TA.ta === 'huc' && gap <= g) { ph = toi + 's'; da = true; kq.khe = Math.round(gap); }
      else if (da && giu) ph = toi;
      TVP0.datPhim(ph); savePrev(); step();
      const ov = overlap(hurtBox(), BX());
      if (ov) { if (tIn < 0) tIn = S.frame - f0; run++; maxIn = Math.max(maxIn, run); } else run = 0;
      if (!ov && tIn >= 0 && tOut < 0) tOut = S.frame - f0;
      if (pl.hp < 5) { kq.kq = 'TRÚNG'; kq.tickTrung = S.frame - f0 - tIn; kq.luc = TA.ta; break; }
      if (kq.hetHuc === undefined && TA.ta === 'hucHoi') kq.hetHuc = S.frame - f0; if (TA.ta !== 'huc' && TA.ta !== 'hucBao' && TA.ta !== 'hucHoi') break;
    }
    if (!kq.kq) kq.kq = !da ? 'không lướt (quá muộn)' : tIn < 0 ? 'không chạm' : tOut < 0 ? 'KẸT trong thân' : 'qua';
    kq.trongThan = tIn >= 0 ? (tOut >= 0 ? tOut - tIn : 'còn') : 0; kq.xuyen = P0C_TK().xuyen; kq.giuThem = P0C_TK().xuyenGiu;
    return kq;
  }
  const P0C_TK = () => TVP0C.P0C.TK;
  const out = {doiDau: [], mepSan: [], tuongSauLam: [], tuongSauTinhAnh: [], cham: {}};
  for (const d0 of [150, 250, 400]) for (const g of [160, 140, 120, 100, 80, 60, 40, 20, 8, 3, 0]) for (const giu of [true, false]) out.doiDau.push(huc(16, -1, d0, g, giu));
  // mép sân: tinh anh lao về mép trái sân (cột 3); Lam đứng sát mép (tâm ở cột 3 + 30 px)
  for (const g of [100, 60, 20, 5]) out.mepSan.push(huc(10, -1, 0, g, true, (PE.x0 + 3) * T + 30));
  // tường giả cột 0–2 (sau lưng Lam), Lam dựa tường; tinh anh lao từ cột 12
  for (const g of [100, 60, 20, 5]) { const k = (tuong(true), huc(9, -1, 0, g, true, (PE.x0 + 3) * T + 11)); tuong(false); out.tuongSauLam.push(k); }
  // tường giả ngay sau tinh anh: tinh anh đứng (hồi húc) sát tường cột 3, Lam lướt vào từ phải → không ra phía tường được
  for (const giu of [true, false]) {
    newGame(); tuong(true); datTA(3, 'hucHoi', -1); TA.t = 0; TVP0.datLam(TA.x + TA.w + 60 - pl.w / 2, -1); pl.hp = 5;
    const f0 = S.frame; let tIn = -1, tOut = -1;
    for (let i = 0; i < 90; i++) { TVP0.datPhim(i === 0 ? 'ls' : giu ? 'l' : ''); savePrev(); step(); const ov = overlap(hurtBox(), BX()); if (ov && tIn < 0) tIn = S.frame - f0; if (!ov && tIn >= 0 && tOut < 0) tOut = S.frame - f0; }
    out.tuongSauTinhAnh.push({giu, vao: tIn, ra: tOut, hp: pl.hp, lamCach: Math.round(pl.x + pl.w / 2 - (TA.x + TA.w / 2)), log: TVP0C.P0C.LOG.filter(r => r.loai === 'xuyen').map(r => r.ngan)});
    tuong(false);
  }
  // CHẠM THÂN (không lướt): đi vào thân tinh anh đang đứng
  const dung = cot => { datTA(cot, 'di', -1); };
  const chay = (n, ph) => { const xs = []; for (let i = 0; i < n; i++) { TVP0.datPhim(ph); savePrev(); step(); xs.push(+(pl.x + pl.w / 2 - (TA.x + TA.w / 2)).toFixed(1)); } return xs; };
  const doi = xs => { let s = 0; for (let i = 2; i < xs.length; i++) { const a = xs[i - 1] - xs[i - 2], b = xs[i] - xs[i - 1]; if (a * b < 0 && Math.abs(a) > 0.05 && Math.abs(b) > 0.05) s++; } return s; };
  newGame(); dung(14); TVP0.datLam(TA.x - 100, 1); let xs = chay(120, 'r');
  out.cham.giuaSan = {dau: xs[0], cuoi: xs[xs.length - 1], doiChieu: doi(xs), min: Math.min(...xs.map(Math.abs)), mau: xs.filter((_, i) => i % 10 === 0)};
  newGame(); dung(14); TVP0.datLam(TA.x + TA.w + 60, -1); xs = chay(120, 'l');
  out.cham.giuaSanTuPhai = {dau: xs[0], cuoi: xs[xs.length - 1], doiChieu: doi(xs), mau: xs.filter((_, i) => i % 10 === 0)};
  // Lam bị ép giữa tường giả và thân: đặt Lam CHỒNG lên nửa trái thân, tường ngay sau lưng
  newGame(); tuong(true); dung(3); TVP0.datLam((PE.x0 + 3) * T + 2, 1); pl.hp = 5;
  const a = chay(40, ''), b = chay(60, 'r'), c = chay(40, 'l');
  out.cham.epTuong = {dungYen: {mau: a.filter((_, i) => i % 8 === 0), doiChieu: doi(a)}, giuPhai: {mau: b.filter((_, i) => i % 6 === 0), doiChieu: doi(b), raKhoiThan: b.findIndex(v => Math.abs(v) >= 64)},
    giuTrai: {mau: c.filter((_, i) => i % 8 === 0), doiChieu: doi(c)}, hp: pl.hp};
  tuong(false);
  return out;
})()
