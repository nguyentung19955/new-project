/* ======================= LAM MỚI THỬ 2 – khối thêm vào trang game/thu-lam-moi-2/index.html =======================
   Theo docs/gameplay/PHAN-HOI-11, 12, 13 ("Gửi Claude"). Trang sinh bằng cong-cu/tao-thu-lam-moi-2.py từ game/thu-p0a/am-dao.html
   (KHÔNG sửa am-dao.html, P0-B, P0-C, demo.html). Gameplay giữ NGUYÊN: startup / hộp / tốc độ / miễn sát thương không đổi – chỉ đổi HÌNH Lam
   và VỆT (hình vẽ) của chém 1 + pogo.

   Sheet thử 2: art/huong-moi/lam-tu-the-2/sprite/lam-moi2-chay (8 tư thế) + lam-moi2-chem1 (A/B/C/D), bản 2x và 3x (BK ≤ 2 → 2x, lớn hơn → 3x).
   Sheet bộ 3 (PH13 mục 2 – ĐÃ CÓ ẢNH 29/10, dựng bằng dung_thu3.py, game ưu tiên bản bộ 3): sprite/thu3-danh-sach.json liệt kê sheet lam-moi3-* đã dựng bằng
   code/dung_thu3.py (pogo P1–P3, tường W1–W4, nhảy/rơi J1 J2 J3 F1 F2 L, đứng I1–I3, chạy sửa R1–R8, chém 1 sửa A–D).
   Có nhãn trong sheet bộ 3 → dùng; không có → HÌNH TẠM như trước (D hồi / ô chạy 4 / ô chạy 8).

   QUY ƯỚC TICK (engine thật, PH13 mục 1.4): startAtk đặt atkT = 0 rồi CÙNG bước cộng 1 → bước đầu vẽ ra màn là atkT 1.
     Chém 1 (su 7, ac 8, re 8): A atkT 1–6 (6 bước) · B 7–10 · C 11–14 (hộp bật đúng atkT 7–14) · D 15–22 · atkT 23 đòn hết.
     Pogo (ATK[4] su 0, ac 11, re 4): hộp bật NGAY atkT 1 → 10; nảy (pogoBounce) đặt atkT = 11 → hộp tắt. KHÔNG thêm tick startup.
   MÁY HÌNH (chạy một lần mỗi bước logic, trong lamChon; hitstop không cộng bước → hình đứng yên; ghi nhãn vào pl → bản ghi Vọng):
     chạy    R1–R8 = floor(pha × 8) – pha cộng theo quãng đường thật (132 px/vòng)
     chém 1  A/B/C/D theo đúng điều kiện hộp (atkT < su → A; < su+4 → B; < su+ac → C; còn lại D)
     pogo    P1 atkT 1–2 (NGAY tick pogo, cùng tick hộp bật) · P2 từ atkT 3 tới hết trạng thái · P3 NGAY sự kiện nảy (đặt trong pogoBounce,
             cùng bước), 3 bước rồi về J2/J3/F theo vy; pogo mới → P1 ngay; chạm đất / tường → ngắt
     tường   W1 2 bước đầu bám (vy = 0) · W2 4 bước sau / giữ khi đứng yên trên vách · trượt: W3 6 bước + W4 6 bước lặp. Mẫu vách PHẢI
             (Lam nhìn vào vách) → vách trái lật cả hình. Hình tạm (D) giữ hướng cũ.
     nhảy    J1 tối đa 2 bước đầu sau khi physics đã bật (cả nhảy tường: wjT 16–15) · J2 khi còn lên · J3 quanh đỉnh: từ lúc vy ≥ −0,8,
             tối đa 4 bước, chỉ khi vy ≤ 1,8 (= P.apexThreshold – vùng game giảm trọng lực ở đỉnh)
     rơi     F1 / F2 có trễ: vào F2 khi vy > 7, về F1 khi vy < 5,5 (maxFall 10,4)
     tiếp đất L tối đa 3 bước khi đứng yên sau khi rơi (vy trước chạm > 2); chạy / đánh → bỏ L ngay. Không khoá điều khiển, collider không đổi.
     đứng    I1 36 → I2 24 → I3 24 → I1 36 bước (vòng 120 bước = 2 s), đếm từ lúc vào đứng
   VỆT MẪU PH13 (path Canvas, chưa gen ảnh) – chỉ khi Lam MỚI; ?lam=cu giữ vệt ảnh + âm nhận cũ:
     chém 1: lưỡi liềm NGANG thấp, mở về trái, bụng cong phía trước phải, hai đầu mảnh kéo về vùng tay; tâm theo đường quét đo trên B/C.
             8 bước active atkT 7–14 chia 1/3/2/2: nét mảnh → cung đầy → vỡ → mảnh tắt. Ngoài atkT 7–14 không vẽ gì (không còn lõi sáng).
     pogo  : nêm/cung ngắn RỘNG, THUÔN, mũi xuống dưới bàn tay + mũi dao: nêm bật (atkT 1–2) → cung ép (3–5) → mảnh tách (6–8) → dấu nhỏ (9–10);
             nảy / hết hộp → tắt ngay. Trúng → vòng va chạm nhỏ TẠI ĐIỂM TRÚNG (giữa phần giao hộp ↔ mục tiêu), 7 bước rồi tắt.
   BỘ TƯ THẾ 4 (29/10, sheet lam-moi4-*, cùng danh sách thu3-danh-sach.json) – lịch đọc từ ATK THẬT lúc chạy (su/ac/re), không viết cứng số tick:
     chém 2  C2A lấy đà (atkT 1 … su−1) · C2B chém (đúng các tick hộp bật su … su+ac−1) · C2C kết thúc / C2D hồi (nửa đầu / nửa sau recovery)
     chém 3  C3A lấy lực (5/8 đầu startup) · C3B đỉnh (3/8 cuối) · C3C bổ (tick hộp) · C3D kết thúc / C3E hồi (chia đôi recovery)
     hất     H1 nén (startup) · H2 chém lên (tick hộp) · H3 kết thúc cao / H4 hồi (chia đôi recovery)
     trên không K1 lấy đà (startup) · K2 cắt ngang (tick hộp) · K3 kết thúc (recovery)
     nối combo: đòn mới bắt đầu (startAtk) → hình đòn mới NGAY bước đó (máy hình đọc atkN/atkT mỗi bước), cửa sổ nối giữ nguyên luật P0.
     lướt    LU1 vào (bước lướt 1–2) · LU2 giữ (3–6) · LU3 ra (7–8; pl.st 'dash' gồm bước pl.dash vừa về 0); đổi trạng thái → hình mới ngay
     bị đánh BD1 ngay khi trúng (hurt() gọi lamChon → cùng bước) tới hurtT 13 (gồm 6 bước khựng) · BD2 hurtT 12 → 1 (hết đẩy lùi / khựng
             theo luật cũ 17–13 / 12–1). Không thêm khoá điều khiển: hết hurtT 8 người chơi ra đòn được như cũ → hình đòn.
     tường   MẶC ĐỊNH = sheet tường LƯNG áp vách (WL1–WL4, mẫu vách TRÁI, Lam nhìn PHẢI – ra khỏi vách); cùng nhịp W1 2 → W2 4 → W3/W4 6/6.
             Vách phải → lật cả hình. ?tuong=mat → sheet bộ 3 (mặt vào vách) để so. Nhảy tường: J1 nhìn theo pl.face = hướng bật ra.
     vệt     chém 2/3, hất, trên không: liềm/cung PH13 vẽ bằng code theo đường quét đo trên tư thế (JSON sheet → "vet") – VỆT MẪU CHỜ DUYỆT.
   MÓC TƯỜNG + VỆT GEN (29/10, bộ 5):
     tường   MẶC ĐỊNH = bám BẰNG MÓC (sheet lam-moi5-tuong_moc WM1–WM4, mẫu vách PHẢI, Lam nhìn vào vách, đầu móc = mép collider); cùng nhịp
             W1 2 → W2 4 → W3/W4 6/6; vách trái lật cả hình; nhảy tường → BM1 (tick nhảy) → BM2 → J1 2 tick → J2 (29/10: WM4 + móc rút bằng code). Trượt (WM3/WM4): bụi + tia nhỏ ở đầu móc (code, buiMoc).
             ?tuong=lung = lưng áp vách (bộ 4), ?tuong=mat = mặt vào vách (bộ 3); ⚙ "Tường" đổi vòng.
     vệt     MẶC ĐỊNH = VỆT GEN (sprite/vet-gen-{2x,3x}, code/dung_vet.py): chém 1 + trên không = liềm ngang, chém 2 = chéo lên, hất = cung dọc lên,
             chém 3 = bổ xuống, pogo = nêm/cung ép/mảnh. Cùng nhịp tick hộp (1/3/2/2; pogo 2/3/3+2 mờ, nảy → tắt). Phép đặt trong JSON (lõi sáng
             trong hộp đòn). ?vet=code = vệt mẫu code để so; ⚙ "Vệt chém".
   KHÔNG crossfade: mỗi bước vẽ đúng MỘT hình.
   Cờ: ?tuong=lung|mat · ?vet=code · ?lam=cu Lam cũ · ?vfx=0 tắt vệt + âm nhận (duyệt tạo dáng) · ?bong=1 Lam bóng đen · ?hitbox=1 hộp đòn · ?cham=4 chậm 4 lần (1–8). ⚙ → "Lam mới 2".
*/
/* ======================= PH15 bước 1 mục 1.5 – ĐỒNG HỒ KHUNG HÌNH (đo Safari thật) =======================
   Ẩn mặc định. Bật: ⚙ → "Đồng hồ khung hình" hoặc ?fps=1. Hiện trên màn: hình/giây, khung chậm nhất, số khung > 20 ms / > 34 ms, thời gian vẽ,
   bước logic mỗi khung, số canvas tạo mới / ảnh nạp / giải nén / tô màu / đọc điểm ảnh MỖI KHUNG (phải = 0 trong lúc chơi).
   Ghi log mỗi giây + sự kiện (đổi phòng, đổi BK / xoay màn, nạp ảnh giữa trận, chết) + 15 khung chậm nhất có ngữ cảnh + cỡ vẽ cuối ra màn của từng tư thế
   Lam + bù móc từng tick → ⚙ → "Chép log khung hình" (chép vào bộ nhớ tạm; không chép được thì hiện ô chữ để bấm giữ → Chép).
   Chỉ ĐO + 2 sửa vẽ (không đổi physics / timestep): khựng (hitstop) vẽ đúng vị trí bước hiện tại (không nội suy giữa 2 bước); nhảy vị trí > 48 px trong
   1 bước (hồi sinh / đổi phòng / dịch chuyển) không nội suy. */
const DO15 = (() => {
  const O = {on: P0_Q.get('fps') === '1', dem: {cv: 0, gid: 0, img: 0, dec: 0, to: 0, di: 0, rs: 0}, boi: 0, giay: [], su: [], cham: [], tuThe: {}, moc: [],
    _t: -1, _b: null, _n: 0, buoc: 0, txt: '', bat: 0};
  const D = O.dem;
  // đếm (luôn gắn, rất rẻ): canvas tạo mới, đọc điểm ảnh, gán src ảnh, decode, đổi cỡ cửa sổ
  try { const _ce = document.createElement; document.createElement = function (t, o) { if (String(t).toLowerCase() === 'canvas') D.cv++; return _ce.call(this, t, o); }; } catch (e) {}
  try { const P = CanvasRenderingContext2D.prototype, _g = P.getImageData; P.getImageData = function (...a) { D.gid++; return _g.apply(this, a); }; } catch (e) {}
  try { const P = HTMLImageElement.prototype, ds = Object.getOwnPropertyDescriptor(P, 'src');
    if (ds && ds.set) Object.defineProperty(P, 'src', {configurable: true, enumerable: ds.enumerable, get: ds.get, set(v) { D.img++; ds.set.call(this, v); }});
    const _d = P.decode; if (_d) P.decode = function () { D.dec++; return _d.call(this); }; } catch (e) {}
  let _di = null;
  function demVe(bat) { const P = CanvasRenderingContext2D.prototype;
    if (bat && !_di) { _di = P.drawImage; P.drawImage = function (...a) { D.di++; return _di.apply(this, a); }; }
    else if (!bat && _di) { P.drawImage = _di; _di = null; } }
  let bkCu = 0;
  addEventListener('resize', () => { D.rs++; });
  const ms = v => Math.round(v * 10) / 10;
  O.su = []; O.ghiSu = (t) => { if (O.on) O.su.push({t: ms(performance.now() / 1000), f: S.frame, su: t}); if (O.su.length > 300) O.su.shift(); };
  const ghiSu = O.ghiSu;
  O.batDau = () => { O.boi = O.boi || (BK > 2 ? 3 : 2); bkCu = BK; if (O.on) { demVe(true); O.bat = performance.now(); ghiSu('bật đồng hồ (?fps=1) · BK ' + BK.toFixed(3) + ' · nạp sheet ' + O.boi + 'x'); } };
  O.doi = (bat) => { O.on = bat; demVe(bat); if (bat) { O.giay = []; O.cham = []; O.su = []; O.moc = []; O.tuThe = {}; O._b = null; O._t = -1; O.bat = performance.now();
    ghiSu('bật đồng hồ · BK ' + BK.toFixed(3) + ' · sheet ' + O.boi + 'x'); } };
  // gọi từ LM2.ve mỗi khung cho Lam người chơi: cỡ vẽ cuối (px logic) + scale ra màn (điểm sheet → điểm màn) + bù móc
  O.lam = (n, w, h, sc, hc, boi, vai) => { if (!O.on) return;
    if (!O.tuThe[n]) O.tuThe[n] = {vai, sheet: boi + 'x', rong_logic: ms(w), cao_logic: ms(h), diem_sheet_ra_diem_man: +(sc * BK).toFixed(4), BK: +BK.toFixed(3)};
    if (/^WM/.test(n) && S.frame !== O._mf) { O._mf = S.frame; O.moc.push([S.frame, n, ms(hc[0]), ms(hc[1]), ms(pl.y + pl.h)]); if (O.moc.length > 400) O.moc.shift(); } };
  O.buocDem = () => { O.buoc++; };
  O.khung = (t0, t1) => {
    if (BK !== bkCu) { ghiSu('BK đổi ' + bkCu.toFixed(3) + ' → ' + BK.toFixed(3) + ' (xoay màn / thanh địa chỉ / thu phóng) · cv ' + cv.width + '×' + cv.height); bkCu = BK; }
    if (!O.on) { O.buoc = 0; return; }
    const dt = O._t < 0 ? 16.7 : t0 - O._t; O._t = t0; const rv = t1 - t0, b = O.buoc; O.buoc = 0;
    if (S.paused) { O._b = null; return; }
    if (!O._b) O._b = {t0, n: 0, max: 0, r: 0, rmax: 0, c20: 0, c34: 0, b0: 0, b2: 0, d: Object.assign({}, D)};
    const B = O._b; B.n++; B.max = Math.max(B.max, dt); B.r += rv; B.rmax = Math.max(B.rmax, rv); if (dt > 20) B.c20++; if (dt > 34) B.c34++; if (b === 0) B.b0++; if (b >= 2) B.b2++;
    if (dt > 20) { O.cham.push({ms: ms(dt), ve_ms: ms(rv), buoc: b, f: S.frame, phong: S.room, lam: pl.m2n || '', a2: pl.a2 || '', vong: !!(typeof echo !== 'undefined' && echo && !echo.done),
        quai: (typeof Q !== 'undefined') ? Q.filter(q => !q.dead && !q.gone).length : 0, khung: S.hitstop > 0 ? 'khựng' : ''});
      O.cham.sort((a, c) => c.ms - a.ms); if (O.cham.length > 15) O.cham.length = 15; }
    if (t0 - B.t0 >= 1000) {
      const dd = {}; for (const k in D) dd[k] = D[k] - B.d[k];
      O.giay.push({t: ms((t0 - O.bat) / 1000), fps: ms(B.n * 1000 / (t0 - B.t0)), cham_nhat_ms: ms(B.max), khung_tren_20ms: B.c20, khung_tren_34ms: B.c34,
        ve_tb_ms: ms(B.r / B.n), ve_max_ms: ms(B.rmax), khung_0_buoc: B.b0, khung_2_buoc: B.b2, canvas_moi: dd.cv, doc_diem_anh: dd.gid, gan_src_anh: dd.img, giai_nen: dd.dec,
        to_mau: dd.to, drawImage_moi_khung: ms(dd.di / B.n), doi_co: dd.rs, phong: S.room, BK: +BK.toFixed(3)});
      if (O.giay.length > 600) O.giay.shift();
      O.txt = (O.giay[O.giay.length - 1].fps).toFixed(0) + ' hình/s · chậm nhất ' + ms(B.max) + ' ms · >20ms ' + B.c20 + ' · >34ms ' + B.c34 + ' · vẽ ' + ms(B.r / B.n) + '/' + ms(B.rmax) + ' ms'
        + ' · 0 bước ' + B.b0 + ' · 2+ bước ' + B.b2 + ' | canvas mới ' + dd.cv + ' · ảnh ' + dd.img + ' · giải nén ' + dd.dec + ' · tô ' + dd.to + ' · đọc ảnh ' + dd.gid + ' · vẽ ảnh/khung ' + ms(dd.di / B.n);
      O._b = null;
    }
  };
  O.ve = () => { if (!O.on) return; ctx.setTransform(BK, 0, 0, BK, 0, 0); ctx.globalAlpha = 1; ctx.font = '10px monospace';
    const t = O.txt || 'đồng hồ khung hình: đang đo 1 giây đầu…'; const w = Math.min(940, ctx.measureText(t).width + 10);
    ctx.fillStyle = 'rgba(10,12,16,0.78)'; ctx.fillRect((960 - w) / 2, 2, w, 15); ctx.fillStyle = '#F3E6C8'; ctx.textBaseline = 'top'; ctx.fillText(t, (960 - w) / 2 + 5, 5); };
  O.log = () => {
    const G = O.giay, all = G.length ? G : [], n = all.length, sum = (k) => all.reduce((a, g) => a + (g[k] || 0), 0);
    return JSON.stringify({ten: 'Đồng hồ khung hình PH15 – Tiếng Vọng', trang: location.pathname.split('/').slice(-2).join('/'), phien: (typeof P0 !== 'undefined' && P0.PHIEN) || '',
      luc: new Date().toISOString(), ua: navigator.userAgent, dpr: devicePixelRatio, BK: +BK.toFixed(3), canvas: [cv.width, cv.height], css: [innerWidth, innerHeight], sheet_lam: O.boi + 'x', lam_moi: LM2.ST.moi,
      vfx: LM2.ST.vfx, tom_tat: {giay: n, fps_tb: n ? ms(sum('fps') / n) : 0, khung_tren_20ms: sum('khung_tren_20ms'), khung_tren_34ms: sum('khung_tren_34ms'),
        cham_nhat_ms: n ? Math.max(...all.map(g => g.cham_nhat_ms)) : 0, canvas_moi: sum('canvas_moi'), gan_src_anh: sum('gan_src_anh'), giai_nen: sum('giai_nen'), to_mau: sum('to_mau'), doc_diem_anh: sum('doc_diem_anh'), doi_co: sum('doi_co')},
      su_kien: O.su, khung_cham_nhat: O.cham, tu_the_lam_co_ve: O.tuThe, moc_bu_tung_tick: {cot: ['bước', 'tư thế', 'dời x', 'dời y (âm = nâng)', 'chân y'], dong: O.moc.slice(-200)}, moi_giay: G}, null, 0);
  };
  return O;
})();
const LM2 = (() => {
  const QS = P0_Q;
  const ST = {moi: QS.get('lam') !== 'cu', vfx: QS.get('vfx') !== '0', bong: QS.get('bong') === '1',
    cham: Math.max(1, Math.min(8, +(QS.get('cham') || 1) || 1)),
    tuong: QS.get('tuong') === 'mat' ? 'mat' : QS.get('tuong') === 'lung' ? 'lung' : 'moc',   // 29/10: mặc định BÁM BẰNG MÓC; ?tuong=lung bộ 4, ?tuong=mat bộ 3
    vet: QS.get('vet') === 'code' ? 'code' : 'gen',                                           // 29/10: mặc định VỆT GEN; ?vet=code = vệt mẫu vẽ bằng code (PH13)
    songPogo: QS.get('song') !== '0',                                                         // PH14: sóng tầm sâu của pogo (?song=0 tắt để so)
    chinhMoc: QS.get('moc') !== 'cu'};                                                        // PH14: móc chạm mặt nhìn thấy + áo không xuyên sàn (?moc=cu = như trước)
  const DUONG = '../../art/huong-moi/lam-tu-the-2/sprite/';
  const SH = {}, SH3 = {};   // thử 2: chay / chem – {meta, img, E (tô ngọc cho bóng Vọng), D (bóng đen)}; SH bản 2x, SH3 bản 3x
  const TU = {};             // nhãn tư thế → [{2: sheet2x, 3: sheet3x}, chỉ số khung]
  const BO3 = [];            // tên sheet bộ 3 đã nạp
  /* PH15 bước 1 – ĐO KHUNG HÌNH SAFARI: trước đây bóng Vọng (E) / bóng đen (D) tạo MỘT CANVAS TÔ CẢ SHEET lúc dùng lần đầu – tức là giữa trận, lần đầu
     Vọng phát một tư thế mới thì tạo canvas cỡ cả sheet (3x tới 1758 × 516) → khựng + thêm ~50 MB. Nay: tô ĐÚNG MỘT KHUNG vào canvas nháp DÙNG LẠI
     (như tintKhung của Lam cũ) – không tạo canvas mới trong trận. */
  let TKM = null, TKMg = null;
  function toKhung(img, f, mau, a) {
    if (!TKM) { TKM = document.createElement('canvas'); TKMg = TKM.getContext('2d'); }
    if (TKM.width < f.w || TKM.height < f.h) { TKM.width = Math.max(TKM.width, f.w); TKM.height = Math.max(TKM.height, f.h); }
    const g = TKMg; g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, f.w, f.h); g.drawImage(img, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
    g.globalCompositeOperation = 'source-atop'; g.globalAlpha = a; g.fillStyle = mau; g.fillRect(0, 0, f.w, f.h); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    DO15.dem.to++; return TKM;
  }
  const goi = (img, meta) => ({meta, img});
  async function nap1(ten) {
    const meta = await (await fetch(DUONG + ten + '.json')).json();
    const img = new Image(); img.src = DUONG + meta.anh; await img.decode();
    if (img.naturalWidth !== meta.co_sheet[0] || img.naturalHeight !== meta.co_sheet[1]) throw new Error(meta.anh + ': cỡ ảnh khác co_sheet trong JSON');
    return goi(img, meta);
  }
  /* PH15: chỉ nạp MỘT cỡ (BK > 2 → 3x, còn lại 2x) thay vì cả 2x + 3x (~73 MB ảnh giải nén trên iPhone → Safari dễ bỏ ảnh khỏi bộ nhớ rồi giải nén lại
     giữa trận = khựng). Đổi hướng màn làm BK sang phía kia → nạp cỡ kia NỀN (vẫn vẽ cỡ cũ tới khi xong; ghi vào đồng hồ khung hình). */
  const BOI = () => BK > 2 ? 3 : 2;
  const BOS = [];            // [{ten, b: {2, 3}}] mọi bộ sheet đã đăng ký (để nạp nốt cỡ còn thiếu)
  let NAP_CO = null;
  async function napBo(ten, boi) {
    const b = {}; BOS.push({ten, b});
    try { b[boi] = await nap1(ten + '-' + boi + 'x'); } catch (e) { console.warn('LM2: ' + ten + '-' + boi + 'x lỗi → cỡ kia', e); b[5 - boi] = await nap1(ten + '-' + (5 - boi) + 'x'); }
    return b;
  }
  function canCo(boi) {   // gọi trong ve khi bộ chưa có cỡ boi: nạp nền MỘT lần
    if (NAP_CO === boi) return; NAP_CO = boi; DO15.ghiSu('nạp cỡ ' + boi + 'x giữa trận (BK đổi → ' + BK.toFixed(2) + ')');
    (async () => { for (const o of BOS) if (!o.b[boi]) try { o.b[boi] = await nap1(o.ten + '-' + boi + 'x'); } catch (e) { } })();
  }
  const VG = {};             // vệt gen: {2: sheet 2x, 3: sheet 3x}
  const ganNhan = (bo, nhan) => nhan.forEach((n, i) => { TU[n] = [bo, i]; });
  // gốc vệt pogo (px logic so với chân, nhìn phải) theo tư thế: P1 = pha nêm bật (atkT 1–2), P2 = các pha sau. goc = nghiêng mũi vệt về trước (độ).
  // Mặc định = bản trước bộ 3; sheet pogo bộ 3 ghi lại theo mũi dao đo trên ảnh (bang-thu3.json → vet_pogo).
  let VP = {P1: {x: 8, y: 2, goc: 0}, P2: {x: 8, y: 2, goc: 0}};
  async function nap() {
    const boi = BOI(); DO15.boi = boi;
    for (const [k, ten] of [['chay', 'lam-moi2-chay'], ['chem', 'lam-moi2-chem1']]) {
      const b = await napBo(ten, boi); SH[k] = b; SH3[k] = b;   // SH / SH3 giữ tên cũ: cùng một bộ {2, 3}
    }
    ganNhan(SH.chay, ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8']);
    ganNhan(SH.chem, ['A', 'B', 'C', 'D']);
    // bộ 3 (PH13 mục 2): chỉ nạp sheet có trong danh sách – chưa có ảnh thì danh sách rỗng → hình tạm
    let ds = [];
    try { ds = (await (await fetch(DUONG + 'thu3-danh-sach.json')).json()).sheets || []; } catch (e) { console.warn('LM2: không đọc được thu3-danh-sach.json → chưa có sheet bộ 3'); }
    for (const d of ds) {
      try { const b = await napBo(d.ten, d.co_3x ? boi : 2), mv = (b[2] || b[3]).meta;
        ganNhan(b, mv.tu_the); BO3.push(d.ten);
        if (mv.vet_pogo && mv.vet_pogo.P1) VP = mv.vet_pogo;
        if (mv.vet_chem1) for (const k of ['x', 'y', 'R', 'h', 'T', 'goc', 'tm']) if (typeof mv.vet_chem1[k] === 'number') V1[k] = mv.vet_chem1[k];
        if (mv.vet && mv.vet.n) { const v = {}; for (const k of ['x', 'y', 'R', 'h', 'T', 'goc', 'tm']) v[k] = +mv.vet[k]; VT[mv.vet.n] = v; } }
      catch (e) { console.warn('LM2: không nạp được ' + d.ten, e); }
    }
    // vệt chém GEN (29/10, code/dung_vet.py): sprite/vet-gen-{2x,3x} – thiếu → vệt mẫu code
    try { const b = await napBo('vet-gen', boi); VG[2] = b[2]; VG[3] = b[3]; VG.b = b; } catch (e) { console.warn('LM2: không nạp được vet-gen', e); }
    datKhungChet(); DO15.batDau();
    const a = ATK[1]; if (a.su !== 7 || a.ac !== 8 || a.re !== 8) console.warn('LM2: ATK[1] = ' + a.su + '/' + a.ac + '/' + a.re + ' – lịch A/B/C/D tính theo hộp thật, số bước mỗi hình sẽ khác 6/4/4/8');
    dungNut();
  }

  /* ---------- MÁY HÌNH (mỗi bước logic, sau lamChon gốc) ---------- */
  const J3_V = 0.8, APEX = P.apexThreshold, F2_VAO = 7, F2_RA = 5.5;
  const M = {wT: 0, sT: 0, upT: 0, dinh: 0, f2: false, datT: 0, tren: false, vyT: 0, nay: -1, idT: 0};
  function capNhat() {
    const a2 = pl.a2, tren = !pl.onGround;
    M.wT = a2 === 'wall' ? M.wT + 1 : 0;
    M.sT = a2 !== 'wall' ? 0 : (pl.wallStickT >= P.wallStick && pl.vy > 0) ? M.sT + 1 : M.sT;
    M.upT = (tren && pl.vy < 0) ? M.upT + 1 : 0;
    M.dinh = (!tren || a2 === 'wall' || pl.vy < -J3_V) ? 0 : M.dinh + 1;
    M.f2 = (tren && pl.vy > 0 && a2 !== 'wall') ? (M.f2 ? pl.vy > F2_RA : pl.vy > F2_VAO) : false;
    if (pl.onGround && M.tren && M.vyT > 2) M.datT = 3; else if (M.datT > 0) M.datT--;
    if (a2 !== 'idle' && a2 !== 'land') M.datT = 0;   // chạy / đánh / … → bỏ L ngay
    M.tren = tren; M.vyT = pl.vy;
    if (pl.atkN === 4 && !pl.atkBounced) M.nay = -1;   // đang bổ (pogo mới ngắt P3 ngay)
    if (M.nay >= 0) { M.nay++; if (M.nay >= 3 || pl.onGround || a2 === 'wall' || pl.dead) M.nay = -1; }
    M.idT = ((a2 === 'idle' || a2 === 'land') && M.datT === 0) ? M.idT + 1 : 0;
  }
  // bộ 4: [hình lấy đà…], [tỉ trọng chia startup], hình đánh (đúng tick hộp), [hình kết thúc/hồi…] (chia đều recovery)
  const LICH = {2: [['C2A'], [1], 'C2B', ['C2C', 'C2D']], 3: [['C3A', 'C3B'], [5, 3], 'C3C', ['C3D', 'C3E']],
    5: [['H1'], [1], 'H2', ['H3', 'H4']], 6: [['K1'], [1], 'K2', ['K3']]};
  function nhanDon(n, t) {
    const A = ATK[n], L = LICH[n];
    if (t < A.su) { const w = L[1], tong = w.reduce((a, b) => a + b, 0), vt = (Math.max(1, t) - 1) / Math.max(1, A.su - 1); let c = 0;
      for (let i = 0; i < w.length; i++) { c += w[i] / tong; if (vt < c - 1e-9) return L[0][i]; } return L[0][L[0].length - 1]; }
    if (t < A.su + A.ac) return L[2];
    const k = L[3].length; return L[3][Math.min(k - 1, Math.floor((t - A.su - A.ac) * k / A.re))];
  }
  /* CHÉM 1: 4 hình (A/B/C/D – sheet hiện có, nay ảnh SỬA 3 thu7) hoặc 6 hình khi có sheet chem1_6 (nhãn C1A C1T C1U C1V C1W C1G – PH15 mục 2).
     Lịch 6 hình đọc từ ATK[1] THẬT (su/ac/re), chia theo tỉ lệ PH15: startup A 4 : T 2 · active U 2 : V 3 : W 3 · recovery W 3 : G 5. Với su 7 / ac 8 / re 8
     (engine hiện tại): atkT 1–4 A · 5–6 T · 7–8 U · 9–11 V · 12–14 W (hộp bật 7–14) · 15–17 W · 18–22 G. Không đổi hộp / startup / cancel; vệt tắt theo hộp
     dù còn giữ W. Hitstop không cộng atkT → hình đứng yên. Nối nhát 2 sớm → hình đòn mới ngay (máy hình đọc atkN mỗi bước). */
  const CHIA = (n, w) => { const tg = w.reduce((a, b) => a + b, 0); let c = 0; return w.map(x => (c += x, Math.round(n * c / tg))); };
  function nhanChem1(t) {
    const A = ATK[1];
    if (!(TU.C1A && TU.C1U && TU.C1V && TU.C1W && TU.C1G)) return t < A.su ? 'A' : t < A.su + 4 ? 'B' : t < A.su + A.ac ? 'C' : 'D';
    const su = CHIA(A.su - 1, [4, 2]), ac = CHIA(A.ac, [2, 3, 3]), re = CHIA(A.re, [3, 5]);
    if (t < A.su) return (t - 1) < su[0] ? 'C1A' : (TU.C1T ? 'C1T' : 'C1A');
    if (t < A.su + A.ac) { const j = t - A.su; return j < ac[0] ? 'C1U' : j < ac[1] ? 'C1V' : 'C1W'; }
    return (t - A.su - A.ac) < re[0] ? 'C1W' : 'C1G';
  }
  function nhanBay() {   // trên không (nhảy / rơi / sau nảy)
    if (M.dinh >= 1 && M.dinh <= 4 && pl.vy <= APEX) return 'J3';
    if (pl.vy < 0) return M.upT <= 2 ? 'J1' : 'J2';
    return M.f2 ? 'F2' : 'F1';
  }
  function chonNhan() {
    const a2 = pl.a2;
    if (pl.dead) return 'CHET';   // PH14 mục 1D: chết = khuỵu / tan đơn giản dựng từ hình bị đánh (code, xem veChet) – tạm tới khi có hình gen
    if (pl.drawT > 0) return 'tam:' + a2;
    if (a2 === 'hurt') return pl.hurtT >= 13 ? 'BD1' : 'BD2';
    if (a2 === 'dash') { const i = P.dashFrames - pl.dash; return i <= 2 ? 'LU1' : i >= P.dashFrames - 1 ? 'LU3' : 'LU2'; }
    if (LICH[pl.atkN] && a2 === 'atk' + pl.atkN) return nhanDon(pl.atkN, pl.atkT);
    if (a2 === 'run') return 'R' + (Math.min(7, Math.floor((pl.pha || 0) * 8)) + 1);
    if (pl.atkN === 1 && a2 === 'atk1') return nhanChem1(pl.atkT);
    if (pl.atkN === 4 && a2 === 'atk4') return M.nay >= 0 ? 'P3' : pl.atkBounced ? nhanBay() : pl.atkT <= 2 ? 'P1' : 'P2';   // sau P3: về J2/J3 theo vy
    if (M.nay >= 0 && !pl.atkN && (a2 === 'jump' || a2 === 'fall')) return 'P3';
    // 29/10 BẬT VÁCH BẰNG HÌNH CÓ SẴN (người dùng chọn, không gen): bám móc → tick nhảy BM1, tick kế BM2 (WM4 với móc rút về bằng code,
    // code/dung_bat_moc.py; vẫn nhìn vào vách như WM) → lật nhìn ra phòng: J1 2 tick (wjT 14–13) → J2/J3/F như thường. Không thêm chờ.
    const bm = ST.tuong === 'moc' && TU.BM1 && TU.BM2;
    if (a2 === 'wall' && pl.vy < -1) return bm ? 'BM1' : TU.BV1 ? 'BV1' : 'J1';   // PH14 mục 2: tháo móc / bật khỏi vách NGAY tick nhảy (sheet bat_vach khi có)   // bấm nhảy tường: physics đã bật lên ngay bước này → hình bật nhảy, không giữ W2
    if (a2 === 'wall') return pl.wallStickT < P.wallStick ? (M.wT <= 2 ? 'W1' : 'W2') : pl.vy > 0 ? (((M.sT - 1) % 12) < 6 ? 'W3' : 'W4') : 'W2';
    // PH14 mục 2 "nhảy tường": BV1 (tay xa thu móc, chân đẩy vách) 1–2 tick đầu → BV2 (đã rời vách, áo kéo về phía vách) 2–3 tick → J2 (nhanBay).
    // Chạy SAU impulse (physics đã bật cùng bước) – không thêm thời gian chờ. Chưa có sheet → J1 như cũ.
    if (a2 === 'walljump' && bm) return pl.wjT >= 16 ? 'BM1' : pl.wjT === 15 ? 'BM2' : pl.wjT >= 13 ? 'J1' : nhanBay();
    if (a2 === 'walljump') return TU.BV1 ? (pl.wjT >= 15 ? 'BV1' : pl.wjT >= 12 && TU.BV2 ? 'BV2' : nhanBay()) : pl.wjT >= 15 ? 'J1' : nhanBay();
    if (a2 === 'jump' || a2 === 'fall') return nhanBay();
    // 29/10: tick nối giữa hết chém 1 và vào thế tụ (Dư Âm đã nạp, còn giữ Chém, game chưa kịp đặt 'tu') → TV1 luôn, không nháy I1 1 tick. Chỉ hình.
    if (a2 === 'idle' && TU.TV1 && typeof AD !== 'undefined' && AD.KN && AD.KN.nap && AD.KN.giu) return 'TV1';
    if (a2 === 'idle' || a2 === 'land') { if (M.datT > 0) return 'L'; const t = (M.idT - 1) % 120; return t < 36 ? 'I1' : t < 60 ? 'I2' : t < 84 ? 'I3' : 'I1'; }
    // Sửa iPhone 29/10: giữ Chém tụ Dư Âm – trước dùng D (dao chúc xuống trước chân, đọc như "lưỡi dao thứ hai") → A (rút dao thấp sau hông = lấy đà)
    // PH14 mục 1D: tụ Dư Âm / chém vang. Sheet tu_vang (thu6-tu-vang-3o.png: TV1 tụ thấp · TV2 thả chém vang · TV3 kết) khi có;
    // chưa có → TẠM: tụ = A (lấy đà), chém vang = A (lấy đà) → B (cắt, đúng tick hộp) → C → D (đọc như một nhát chém, không đứng D suốt)
    if (a2 === 'tu') return TU.TV1 ? 'TV1' : TU.A ? 'A' : 'tam:tu';
    if (pl.atkN === 7 && a2 === 'atk7') { const A = ATK[7], t = pl.atkT;
      if (TU.TV1) return t < A.su ? 'TV1' : t < A.su + A.ac ? 'TV2' : 'TV3';
      return t < A.su ? 'A' : t < A.su + Math.ceil(A.ac / 2) ? 'B' : t < A.su + A.ac ? 'C' : 'D'; }
    return 'tam:' + a2;
  }
  function datNhan() { let n = chonNhan();
    if (/^W\d$/.test(n) && ST.tuong === 'moc' && TU['WM' + n[1]]) n = 'WM' + n[1];        // 29/10: bám tường BẰNG MÓC (mặc định, bộ 5)
    else if (/^W\d$/.test(n) && ST.tuong === 'lung' && TU['WL' + n[1]]) n = 'WL' + n[1];  // ?tuong=lung: LƯNG áp vách (bộ 4); ?tuong=mat giữ W1–W4 bộ 3
    pl.m2n = n;
    // lật: W (bộ 3, mẫu vách PHẢI, nhìn vào vách) và WM (bộ 5 móc, mẫu vách PHẢI, nhìn vào vách) → lật khi vách trái;
    //      WL (bộ 4, mẫu vách TRÁI, lưng áp vách) → lật khi vách phải
    pl.m2l = (n[0] === 'W' && TU[n]) ? (n[1] === 'L' ? pl.lastWall > 0 : pl.lastWall < 0)
      : (n === 'BM1' || n === 'BM2') && TU[n] ? (pl.wjDir || pl.lastWall) < 0 : null; }   // BM: mẫu vách PHẢI như WM; vách = wjDir (hướng tường vừa bật)
  // hình TẠM khi chưa có nhãn trong sheet (như trước PH13): tường / pogo / đứng / tiếp đất / chém khác → D; nhảy → ô chạy 4; rơi → ô chạy 8
  function tam(n, a2) {
    if (n[0] === 'J' || a2 === 'jump' || a2 === 'walljump' || a2 === 'dash') return TU.R4;
    if (n[0] === 'F' || a2 === 'fall') return TU.R8;
    return TU.D;
  }
  function khung(s) {   // → [bộ sheet, chỉ số, có phải tạm, lật]
    let n = s.m2n, a2 = s.a2;
    if (!n) {   // vệt lướt (TRAIL) không ghi nhãn → suy từ trạng thái đã ghi
      const la = s === pl, at = la ? pl.atkT : s.at, nn = la ? pl.atkN : s.n;
      n = a2 === 'run' ? 'R' + (Math.min(7, Math.floor(((la ? pl.pha : s.p2) || 0) * 8)) + 1)
        : (nn === 1 && a2 === 'atk1') ? nhanChem1(at)
        : (LICH[nn] && a2 === 'atk' + nn) ? nhanDon(nn, at) : (a2 === 'dash' && TU.LU2) ? 'LU2' : 'tam:' + a2;
    }
    if (n === 'CHET') { const c = chonChet(); return [c[0], c[1], false, s.l2, n]; }
    const t = TU[n]; if (t) return [t[0], t[1], false, s.m2l === null || s.m2l === undefined ? s.l2 : s.m2l, n];
    const u = tam(n, a2); return [u[0], u[1], true, s.l2, n];
  }
  { const _lc = lamChon; lamChon = function (chiHinh) { _lc(chiHinh); if (!chiHinh) capNhat(); datNhan(); if (!chiHinh) buiMoc(); }; }
  /* ---------- BỤI / TIA Ở ĐẦU MÓC khi trượt (bộ 5, code, kín đáo): mỗi bước logic; vẽ trong veVQ ----------
     Đầu móc = dau_moc_logic của khung (đo lúc dựng sheet, so với chân; = mép collider phía vách). Trượt (WM3/WM4): cứ 3 bước 1 hạt bụi đất nhỏ
     rơi + dạt khỏi vách, cứ 10 bước 1 tia ngà rất ngắn; mỗi hạt sống 10–16 bước. Đứng yên trên vách (WM1/WM2) không rắc. ?vfx=0 tắt. */
  const BUI = [];
  const bamS = (a, b) => { let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; return (h >>> 0) % 1000 / 1000; };
  function buiMoc() {
    for (let i = BUI.length - 1; i >= 0; i--) { const b = BUI[i]; b.t++; b.x += b.vx; b.y += b.vy; b.vy += b.tia ? 0 : 0.06; if (b.t >= b.song) BUI.splice(i, 1); }
    const n = pl.m2n; if (!ST.moi || !ST.vfx || (n !== 'WM3' && n !== 'WM4') || !TU[n]) return;
    const so = (TU[n][0][2] || TU[n][0][3]).meta.so_do[TU[n][1]], dm = so && so.dau_moc_logic; if (!dm) return;
    const l = pl.m2l ? -1 : 1, x = pl.x + pl.w / 2 + dm[0] * l, y = pl.y + pl.h + dm[1], f = S.frame, r1 = bamS(f, 1), r2 = bamS(f, 2);
    if (f % 3 === 0) BUI.push({x: x - l * 1.5, y: y + r1 * 3, vx: -l * (0.25 + 0.35 * r2), vy: 0.4 + 0.6 * r1, t: 0, song: 12 + Math.floor(r2 * 5), r: 0.9 + 0.8 * r1, tia: false});
    if (f % 10 === 0) BUI.push({x: x - l, y: y + 1, vx: -l * (0.9 + 0.5 * r1), vy: -0.5 - 0.4 * r2, t: 0, song: 6, r: 0, tia: true});
  }
  function veBui(g) {
    for (const b of BUI) { const X = b.x - ox, Y = b.y - oy, a = 1 - b.t / b.song;
      if (b.tia) { g.globalAlpha = 0.85 * a; g.strokeStyle = MAU.than; g.lineWidth = 1; g.beginPath(); g.moveTo(X, Y); g.lineTo(X - b.vx * 2.2, Y - b.vy * 2.2); g.stroke(); }
      else { g.globalAlpha = 0.7 * a; g.fillStyle = '#5a4a36'; g.beginPath(); g.arc(X, Y, b.r, 0, 7); g.fill(); } }
    g.globalAlpha = 1;
  }
  { const _rf = recordFrame; recordFrame = function (hb) { _rf(hb); const s = REC[rec.n - 1]; s.m2n = pl.m2n; s.m2l = pl.m2l; }; }

  /* ---------- vẽ Lam (móc ở đầu drawLam gốc): true = đã vẽ Lam mới ---------- */
  const VQ = [];   // vệt chờ vẽ (sau huVe): [X, Y, f, n, at, độ đục]
  function ve(bo, s, x, y) {
    if (!ST.moi || !SH.chem || !s.a2) return false;
    const [B, i, , lat, n] = khung(s), want = BOI(), S2 = B[want] || B[5 - want], M2 = S2.meta, f = M2.frames[i];
    if (!B[want]) canCo(want);
    // bóng Vọng (E) / bóng đen (D): tô MỘT khung vào canvas nháp dùng lại (PH15) → nguồn vẽ là (0, 0, f.w, f.h) của canvas nháp
    const to = bo === LAM.E ? ['#CEF0D6', 0.8] : ST.bong ? ['#000000', 1] : null;
    const img = to ? toKhung(S2.img, f, to[0], to[1]) : S2.img, fx = to ? 0 : f.x, fy = to ? 0 : f.y, sc = 1 / M2.ty_le.px_nguon_moi_px_logic;
    // PH15: MỘT cách làm tròn cho mọi thứ – toạ độ thế giới (đã nội suy) − camera (đã làm tròn theo pixel thật) rồi snap() theo pixel thật; offset
    // trong khung cũng làm tròn theo pixel thật. Không làm tròn riêng sprite theo px logic.
    const X = snap(x - ox + pl.w / 2), Y = snap(y - oy + pl.h), ax = M2.diem_neo.x, ay = M2.diem_neo.y;
    const dx = Math.round(-ax * sc * BK) / BK, dy = Math.round(-ay * sc * BK) / BK;   // 3x ở BK 3: đúng 1 điểm sheet = 1 điểm màn
    const hc = (ST.chinhMoc && /^WM\d$/.test(n)) ? chinhMoc(s, x, y, M2) : [0, 0];   // PH14/PH15: móc chạm mặt nhìn thấy + bù gần sàn LIÊN TỤC
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.save(); ctx.translate(snap(X + hc[0]), snap(Y + hc[1])); if (lat) ctx.scale(-1, 1);
    if (n === 'CHET') veChet(s, img, {x: fx, y: fy, w: f.w, h: f.h}, dx, dy, sc, lat, B, i);
    else ctx.drawImage(img, fx, fy, f.w, f.h, dx, dy, f.w * sc, f.h * sc);
    ctx.restore();
    if (s === pl && bo === LAM) { LM2.moc = hc; DO15.lam(n, f.w * sc, f.h * sc, sc, hc, S2.meta.ty_le.px_nguon_moi_px_logic, M2.vai); }
    if (s === pl && bo === LAM) { LM2.dang = (B === SH.chay ? 'chay' : B === SH.chem ? 'chem' : M2.vai) + ':' + i;
      LM2.nhan = n; LM2.bo = M2.ty_le.px_nguon_moi_px_logic + 'x';
      if (coVet(pl.atkN)) VQ.push([X, Y, s.l2 ? -1 : 1, pl.atkN, pl.atkT, 1]); }
    else if (echo && s === echo.cur && bo === LAM.E && !echo.done && coVet(s.n)) VQ.push([X, Y, s.l2 ? -1 : 1, s.n, s.at, 0.5]);
    return true;
  }

  /* ---------- PH14 mục 2: MÓC CHẠM MẶT NHÌN THẤY + ÁO KHÔNG XUYÊN SÀN (chỉ hình, collider không đổi) ----------
     (a) đầu móc (dau_moc_logic, = mép collider phía vách) so với MẶT ĐẤT NHÌN THẤY tại đúng độ cao đó (DHM.mepNhin – mép hữu cơ đã gặm nông
         ≤ 4,5 px từ mép vẽ): nếu mặt đất lùi sau collider → dời hình về phía vách cho đầu móc cắm ≥ 1 px vào đất nhìn thấy (tối đa 3 px).
     (b) áo thòng dưới chân (cao − đỉnh trên chân, đo trên ảnh) gần sàn: nâng CẢ HÌNH theo điểm tiếp xúc – gấu áo vừa chạm mặt sàn, không
         xuyên; không cắt cứng gấu. (Chưa có hình gấu gom → nâng hình; khi có sheet gấu gom thì đổi hình ở đây.) Đầu móc đi lên theo, vẫn trên vách. */
  /* PH15 bước 1 mục 3: BỎ bù nâng theo TỪNG KHUNG. Trước: mỗi khung nâng theo độ thòng áo CỦA KHUNG ĐÓ (WM3 ~22 px, WM4 ngắn hơn) → WM3 ↔ WM4 đổi
     khung là cả người nhảy lên xuống tới 17,7 px dù physics trượt đều. Nay: MỘT đường bù LIÊN TỤC theo khoảng cách chân → sàn, dùng độ thòng LỚN NHẤT
     của cả sheet (một số cho mọi khung): nâng = max(0, thòng_max − khoảng cách tới sàn) – chỉ đổi khi Lam trượt, không đổi khi đổi khung.
     Sau khi sửa tỉ lệ sheet móc (k × 0,81) thòng_max còn ~8–9 px (trước 22+). Đầu móc chạm mặt nhìn thấy: đo ở ĐỘ CAO MÓC TRUNG BÌNH của sheet (không theo
     khung) → cũng liên tục. Khi có hình "gấu gom" (PH15 mục 3) thì đổi hình ở đây, bỏ nâng. ?moc=cu = như trước PH14. */
  function chinhMoc(s, x, y, M2) {
    const c = M2._c15 || (M2._c15 = (() => { let du = 0, my = 0, k = 0;
      for (const so of M2.so_do) { du = Math.max(du, (so.cao_logic || 0) - (so.dinh_tren_neo_logic || 0)); if (so.dau_moc_logic) { my += so.dau_moc_logic[1]; k++; } }
      return {du, my: k ? my / k : null}; })());
    const w = s.m2l ? -1 : 1, xa = x + pl.w / 2, yc = y + pl.h; let ex = 0, ey = 0;
    if (c.du > 0) { let san = null;
      for (let yy = Math.floor(yc); yy <= yc + c.du + 2; yy++) if (solidPt(xa, yy) || solidPt(xa - w * 8, yy)) { san = yy; break; }
      if (san !== null && yc + c.du > san) ey = -(yc + c.du - san); }
    if (c.my !== null && typeof DHM !== 'undefined' && DHM.mepNhin) {
      const xc = w > 0 ? x + pl.w : x, o = DHM.mepNhin(xc, yc + ey + c.my, w > 0 ? -1 : 1);
      if (o !== null) ex = w * Math.min(3, Math.max(0, 1 - o));
    }
    return [ex, ey];
  }
  /* ---------- PH15 bước 1 mục 5: CHẾT MỚI (tạm, code) – BỎ squash 0,6 / nở ngang, BỎ cắt ngang từ trên xuống, BỎ hạt ngà dày ----------
     Nhịp (tick sau khi CHẠM ĐẤT, pl.dD): D1 mất lực 4 · D2 quỳ 6 · D3 gục 10 · D4 áo tan 10 · D5 áo rỗng 12 · D6 vụn 6 = 48 tick (~0,8 s), nằm trong cửa sổ
     hồi sinh CÓ SẴN (màn tối từ deadT 80, hồi sinh deadT 104 – không kéo dài). Chạm đất muộn (chết trên không, rơi lâu) → chia lại lịch trong phần còn lại
     tới deadT 80 (tối thiểu 24 tick), không giữ xác lơ lửng: trên không = dáng MẤT LỰC (CH1 khi có, tạm = hình bị đánh BD2) theo physics rơi.
     CHƯA có sheet chết (sắp gen: art/huong-moi/nguon/lam-tu-the/thu8-chet-6o.png → nhãn CH1–CH6, dung_thu3.py chet) → TẠM: hình bị đánh BD2, HẠ THẤP NHẸ
     bằng DỊCH (không scale): D1 0 → 1,5 px, D2 → 4 px, D3 giữ 5 px (cắt ở mặt đất – chân không xuyên sàn); D4 + D5 TAN bằng MẶT NẠ ALPHA NHIỄU CỐ ĐỊNH
     (tạo một lần lúc nạp, mép ngoài tan trước, thành mảng bất quy tắc – không nhiễu mới mỗi tick, không crossfade sang hình khác) + vài hạt bụi than
     thưa (7 than + 2 đồng mờ, vị trí băm cố định); D6 chỉ còn hạt. Có sheet: 6 hình → D1…D6 đúng hình, mặt nạ tan chỉ ở D6; 4 hình (mất lực / quỳ / gục /
     áo rỗng) → D4–D6 dùng hình 4 + mặt nạ tan. Lam mới tự tan → bỏ mờ toàn hình chetAlpha() của game. Âm: xem sfx.die (cuối khối). */
  const NHIP_CHET = [4, 6, 10, 10, 12, 6], CHET_TOI = 80;   // CHET_TOI = deadT game bắt đầu tối màn (S.fadeDir = 1)
  function chetPha() {
    const t = pl.deadT, d = pl.dD;
    if (d < 0) return {p: 0, u: 0, k: 0};
    const con = Math.max(24, Math.min(48, CHET_TOI - d)), tt = (t - d) * 48 / con; let c = 0;
    for (let i = 0; i < 6; i++) { if (tt < c + NHIP_CHET[i]) return {p: i + 1, u: (tt - c) / NHIP_CHET[i], k: tt}; c += NHIP_CHET[i]; }
    return {p: 7, u: 1, k: tt};
  }
  const soCH = () => ['CH1', 'CH2', 'CH3', 'CH4', 'CH5', 'CH6'].filter(k => TU[k]).length;
  function chonChet() {
    const so = soCH(), p = chetPha().p;
    if (so >= 4) { const m = so >= 6 ? [1, 1, 2, 3, 4, 5, 6, 6] : [1, 1, 2, 3, 4, 4, 4, 4]; const t = TU['CH' + m[p]]; if (t) return t; }
    return TU.BD2 || TU.BD1 || TU.D;
  }
  const MN = 16, MW = 48, MH = 40; const MASK15 = []; let OCH = null, OCHg = null, OCH_BK = 0;
  function datKhungChet() {   // gọi lúc nạp (và khi BK đổi): canvas nháp tan + 16 mức mặt nạ – KHÔNG tạo trong lúc chết
    if (!MASK15.length) {
      const nz = (x, y, s0) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sm = t => t * t * (3 - 2 * t),
          h = (a, b) => bamS(a * 7919 + s0, b * 104729 + s0);
        const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1), u = sm(fx), v = sm(fy);
        return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
      const V = new Float32Array(MW * MH);
      for (let j = 0; j < MH; j++) for (let i = 0; i < MW; i++) {
        const x = i / MW, y = j / MH, n = 0.65 * nz(x * 4, y * 3.5, 11) + 0.35 * nz(x * 9, y * 8, 37);
        const r = Math.min(1, Math.hypot((x - 0.5) / 0.5, (y - 0.7) / 0.6));   // mép ngoài (vạt áo, chóp mũ) tan trước
        // + nghiêng nhẹ theo chiều cao: phần trên tan sớm hơn phần sát đất (khối áo sụp thấp dần, không còn mảng mũ lơ lửng) – vẫn là mảng nhiễu, không phải đường cắt
        V[j * MW + i] = 0.48 * n + 0.32 * (1 - r) + 0.2 * y; }   // giá trị THẤP = bị khoét TRƯỚC: mép ngoài + phía trên thấp, lõi sát đất cao
      let lo = 1, hi = 0; for (const v of V) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
      for (let k = 1; k <= MN; k++) { const c = document.createElement('canvas'); c.width = MW; c.height = MH; const g = c.getContext('2d'), id = g.createImageData(MW, MH);
        for (let q = 0; q < V.length; q++) id.data[q * 4 + 3] = (V[q] - lo) / (hi - lo + 1e-6) < k / MN ? 255 : 0;
        g.putImageData(id, 0, 0); MASK15.push(c); }
    }
    if (!OCH || OCH_BK !== BK) { OCH = document.createElement('canvas'); OCH.width = Math.ceil(260 * BK); OCH.height = Math.ceil(200 * BK); OCHg = OCH.getContext('2d'); OCH_BK = BK; }
  }
  const VUN = Array.from({length: 9}, (_, i) => ({bd: 24 + bamS(i, 3) * 20, x: 0.28 + 0.44 * bamS(i, 5), y: 0.22 + 0.7 * bamS(i, 9), song: 14 + bamS(i, 13) * 8,
    vx: (bamS(i, 17) - 0.5) * 0.35, r: 0.8 + 0.45 * bamS(i, 19), dong: i >= 7}));
  function veChet(s, img, f, dx, dy, sc, lat) {
    const P = chetPha(), so = soCH(), w = f.w * sc, h = f.h * sc;
    ctx.globalAlpha = 1;   // tự tan bằng mặt nạ (không mờ cả hình theo chetAlpha)
    let ha = 0, tan = 0;
    if (!so && P.p > 0) { const e = t => t * t * (3 - 2 * t); ha = P.p === 1 ? 1.5 * e(P.u) : P.p === 2 ? 1.5 + 2.5 * e(P.u) : 5; }
    if (so >= 6) tan = P.p === 6 ? P.u : P.p > 6 ? 1 : 0;
    else tan = P.p === 4 ? P.u * 10 / 22 : P.p === 5 ? (10 + P.u * 12) / 22 : P.p > 5 ? 1 : 0;
    ctx.save(); ctx.beginPath(); ctx.rect(-400, -400, 800, 400.5); ctx.clip();   // cắt ở mặt đất: dịch xuống không làm chân xuyên sàn
    if (tan <= 0) ctx.drawImage(img, f.x, f.y, f.w, f.h, dx, dy + ha, w, h);
    else if (tan < 1 && OCH) {
      if (OCH_BK !== BK) datKhungChet();
      const g = OCHg, cw = Math.min(w, 260), ch = Math.min(h, 200);
      g.setTransform(BK, 0, 0, BK, 0, 0); g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, 260, 200);
      g.imageSmoothingEnabled = true; g.drawImage(img, f.x, f.y, f.w, f.h, 0, 0, w, h);
      g.globalCompositeOperation = 'destination-out'; g.drawImage(MASK15[Math.min(MN - 1, Math.floor(tan * MN))], 0, 0, w, h); g.globalCompositeOperation = 'source-over';
      ctx.drawImage(OCH, 0, 0, Math.ceil(cw * BK), Math.ceil(ch * BK), dx, dy + ha, cw, ch);
    }
    ctx.restore();
    if (P.p >= 4 && ST.vfx) {   // bụi than thưa từ thân (vị trí / nhịp băm cố định)
      for (const v of VUN) { const a0 = P.k - v.bd; if (a0 < 0 || a0 > v.song) continue; const q = a0 / v.song;
        const x = dx + w * v.x + v.vx * a0, y = dy + ha + h * v.y - 0.32 * a0;
        ctx.globalAlpha = (v.dong ? 0.45 : 0.62) * (1 - q); ctx.fillStyle = v.dong ? '#8A6A3E' : '#2B2520';
        ctx.fillRect(x - v.r, y - v.r, 2 * v.r, 2 * v.r * 0.8); }
      ctx.globalAlpha = 1; }
    LM2.chet = {p: P.p, k: +P.k.toFixed(1), ha: +ha.toFixed(2), tan: +tan.toFixed(3)};
  }

  /* ---------- VỆT MẪU PH13 (path Canvas) ---------- */
  // màu: ngà, lõi sáng vừa, cạnh đồng trầm, viền than mảnh – KHÔNG vàng neon, KHÔNG teal
  const MAU = {canh: '#8C6C3C', than: '#E8DCBC', loi: '#FFF2D2', vien: 'rgba(36,30,24,0.42)'};
  // chém 1: đo trên sheet thử 2 (px logic so với chân, nhìn phải): B tay (−8, −59) mũi (48, −52); C tay (31, −61) mũi (86, −56)
  //   → dải quét y ≈ −52…−61. Hộp atk1 [4, −97, 91, 48] = x 4…95, y −97…−49.
  //   Liềm: hai đầu ở x 14 (giữa tay B và C), bụng ở x 88; y tâm −60, nửa cao 12,5 → dài:cao = 74 : 25 ≈ 3 : 1; nghiêng xuống 4° (theo C).
  // Bộ tư thế 3 (sheet chém 1 sửa): ghi đè bằng vet_chem1 trong JSON sheet – B tay (10, −47) mũi (57, −48); C tay (−2, −34) mũi (47, −20).
  const V1 = {x: 14, y: -60, R: 74, h: 12.5, T: 10, goc: 4, tm: 1.83};   // tm = nửa góc quét của tham số (rad, > 90° → đầu cong về sau)
  // bộ 4 – VỆT MẪU CHỜ DUYỆT: chém 2 / 3 / hất / trên không, đọc từ JSON sheet ("vet", đo trên tư thế, kiem/thu4-do-dao.png). R = h → cung tròn
  // quanh vai (x, y) – bụng hướng goc (độ, + = xuống), nửa góc tm (rad). Chưa có sheet → không vẽ (giữ vệt ảnh cũ).
  const VT = {1: V1};
  const coVet = n => n === 4 || !!VT[n];
  // pogo: gốc VP (dưới bàn tay / mũi dao), mũi hướng XUỐNG. Hộp atk4 [−26, −24, 64, 82] = x −26…38, y −24…58.
  function liem(g, R, h, T, a0, a1, tm, mo) {   // đường bao lưỡi liềm (gốc = điểm hai đầu, bụng ở +x), tham số θ ∈ [a0, a1] (đơn vị tm)
    const N = 22, p = 1.7, w = u => T * Math.max(0, 1 - Math.pow(Math.abs(u), p)) * (mo ? mo(u) : 1);
    g.beginPath();
    for (let k = 0; k <= N; k++) { const u = a0 + (a1 - a0) * k / N, th = u * tm; const x = R * Math.cos(th), y = h * Math.sin(th); k ? g.lineTo(x, y) : g.moveTo(x, y); }
    for (let k = N; k >= 0; k--) { const u = a0 + (a1 - a0) * k / N, th = u * tm, c = Math.cos(th), sn = Math.sin(th);   // mép trong = mép ngoài lùi theo PHÁP TUYẾN một đoạn w
      let nx = c / R, ny = sn / h; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l; const ww = w(u); g.lineTo(R * c - nx * ww, h * sn - ny * ww); }
    g.closePath();
  }
  function lop(g, R, h, T, a0, a1, tm, al, loi, mo) {   // cạnh đồng → thân ngà → lõi (tuỳ) → viền than
    g.globalAlpha = al; g.fillStyle = MAU.canh; liem(g, R, h, T, a0, a1, tm, mo); g.fill();
    g.strokeStyle = MAU.vien; g.lineWidth = 0.8; g.stroke();
    g.fillStyle = MAU.than; liem(g, R - 1.3, h - 1, T * 0.72, a0, a1, tm, mo); g.fill();
    if (loi > 0) { g.globalAlpha = al * loi; g.fillStyle = MAU.loi; liem(g, R - 2.2, h - 1.6, T * 0.34, Math.max(a0, -0.62), Math.min(a1, 0.62), tm, mo); g.fill(); }
  }
  const cua = (a0, a1) => u => { const t = (u - a0) / (a1 - a0); return Math.min(1, Math.sin(Math.PI * Math.max(0, Math.min(1, t))) * 1.6); };   // thuôn hai đầu mảnh
  function phaChem(at, n) { const A = ATK[n || 1], j = at - A.su, q = A.ac / 8;   // 1/3/2/2 trong 8 bước active (ac khác 8 → co giãn)
    return j < 0 || j >= A.ac ? -1 : j < q ? 0 : j < 4 * q ? 1 : j < 6 * q ? 2 : 3; }
  function phaPogo(at) { return at < 1 || at > 10 ? -1 : at <= 2 ? 0 : at <= 5 ? 1 : at <= 8 ? 2 : 3; }
  const TEN_PHA = {chem: ['nét mảnh', 'cung đầy', 'vỡ', 'mảnh tắt'], pogo: ['nêm bật', 'cung ép', 'mảnh tách', 'dấu nhỏ']};
  function veChem(g, at, al, n) {
    n = n || 1; const V1 = VT[n]; if (!V1) return;
    const pha = phaChem(at, n); if (pha < 0) return; const j = Math.min(7, Math.floor((at - ATK[n].su) * 8 / ATK[n].ac));
    g.save(); g.translate(V1.x, V1.y); g.rotate(V1.goc * Math.PI / 180);
    if (pha === 0) lop(g, V1.R * 0.9, V1.h * 0.92, 3, -1, 1, V1.tm, al, 0);
    else if (pha === 1) { const k = [0.94, 0.98, 1][j - 1]; lop(g, V1.R * k, V1.h * (0.96 + 0.04 * (j - 1) / 2), V1.T, -1, 1, V1.tm, al, [0.9, 0.82, 0.72][j - 1]); }
    else if (pha === 2) { const q = j - 4, T = V1.T * (q ? 0.6 : 0.78), d = 1.6 * (q + 1);
      for (const [a0, a1] of [[-1, -0.56], [-0.44, -0.06], [0.06, 0.44], [0.56, 1]]) { g.save(); const m = (a0 + a1) / 2 * V1.tm; g.translate(Math.cos(m) * d, Math.sin(m) * d * 0.6);
        lop(g, V1.R, V1.h, T, a0, a1, V1.tm, al * (q ? 0.72 : 0.9), q ? 0 : 0.35, cua(a0, a1)); g.restore(); } }
    else { const q = j - 6;
      for (const [a0, a1] of [[-0.86, -0.62], [-0.16, 0.1], [0.5, 0.72]]) { g.save(); const m = (a0 + a1) / 2 * V1.tm, d = 4 + 2.5 * q; g.translate(Math.cos(m) * d, Math.sin(m) * d * 0.6);
        lop(g, V1.R, V1.h, q ? 2.2 : 3.2, a0, a1, V1.tm, al * (q ? 0.28 : 0.5), 0, cua(a0, a1)); g.restore(); } }   // không lõi sáng
    g.restore();
  }
  function vePogo(g, at, al) {
    const pha = phaPogo(at); if (pha < 0) return;
    const v = at <= 2 ? VP.P1 : VP.P2;   // P1 hiện atkT 1–2, P2 từ atkT 3 (cùng lịch tư thế)
    songPogo(g, at, al, v);
    g.save(); g.translate(v.x, v.y); g.rotate(Math.PI / 2 - (v.goc || 0) * Math.PI / 180);   // +x cục bộ = hướng XUỐNG (nghiêng goc về trước); h = nửa bề ngang
    if (pha === 0) lop(g, at === 1 ? 17 : 21, at === 1 ? 12 : 14, 9, -1, 1, 1.75, al, 0.9);            // nêm bật: hẹp, sâu, đặc
    else if (pha === 1) { const q = at - 3; lop(g, 22 + q, 21 + q, 8, -1, 1, 1.7, al, 0.75 - 0.1 * q); }  // cung ép: rộng, nông
    else if (pha === 2) { const q = at - 6;
      for (const [a0, a1] of [[-1, -0.4], [-0.25, 0.25], [0.4, 1]]) { g.save(); const m = (a0 + a1) / 2 * 1.7, d = 2 + 2.2 * q; g.translate(Math.cos(m) * d, Math.sin(m) * d * 1.2);
        lop(g, 24, 23, 6 - 1.3 * q, a0, a1, 1.7, al * (0.85 - 0.2 * q), q ? 0 : 0.3, cua(a0, a1)); g.restore(); } }
    else lop(g, 9, 8, 2.6, -1, 1, 1.6, al * 0.35, 0);                                                    // dấu nhỏ gần lưỡi
    g.restore();
  }
  /* PH14 mục 3 "Pogo": BIỂU DIỄN TẦM SÂU. Hộp pogo xuống tới 58 px dưới chân (mũi dao ~11 px) – vệt nêm nhỏ sát người không giải thích tầm đó.
     Thêm SÓNG ÂM NGẮN: 2 cung rộng, mỏng, đi XUỐNG từ mũi dao xuyên vùng đánh trong các tick active (atkT 1 → 6 đi hết, 7–10 mờ dần ở đáy hộp)
     + đoạn nối mờ từ mũi dao. KHÔNG trì hoãn hit (hit vẫn theo hộp như cũ, hộp bật ngay atkT 1); trúng → nảy (atkT 11) → sóng tắt ngay cùng bước,
     vòng va chạm hiện NGAY tại điểm trúng. Sóng không đi quá đáy hộp (không phải đạn bay). Không kéo dài dao, không đổi hộp. */
  function songPogo(g, at, al, v) {
    if (at < 1 || at > 10 || !ST.songPogo) return;
    const day = 56;   // đáy hộp pogo (so với chân): −24 + 82 = 58 → sóng dừng ở 56
    const y0 = v.y + 6, x0 = v.x;
    g.save(); g.lineCap = 'round';
    // đoạn nối mờ từ mũi dao xuống mặt sóng đầu (đọc "tầm" thay vì vệt lơ lửng)
    const t1 = Math.min(1, at / 6), yA = y0 + (day - y0) * t1;
    g.globalAlpha = al * 0.22 * (at <= 6 ? 1 : (11 - at) / 5); g.strokeStyle = MAU.than; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, yA - 4); g.stroke();
    for (const [tre, w0] of [[0, 1], [2, 0.8]]) {   // 2 mặt sóng, mặt sau trễ 2 bước
      const t = Math.min(1, Math.max(0, (at - tre) / 6)); if (at - tre < 1) continue;
      const y = y0 + (day - y0) * t, rong = (16 + 16 * t) * w0, cao = 4 + 2 * t;
      const a = al * (at - tre <= 6 ? 0.75 - 0.25 * t : 0.5 * (11 - at) / 5) * w0;
      if (a <= 0.02) continue;
      g.globalAlpha = a; g.strokeStyle = MAU.canh; g.lineWidth = 3;
      g.beginPath(); g.ellipse(x0, y - cao, rong, cao, 0, 0.12 * Math.PI, 0.88 * Math.PI); g.stroke();
      g.globalAlpha = a; g.strokeStyle = MAU.than; g.lineWidth = 1.3; g.stroke();
    }
    g.restore();
  }
  // PH14 mục 3 "Chém 3": DẤU ĐƯỜNG DAO mảnh / mờ khi vung (từ mũi dao C3B trên đầu xuống tới mép trên hộp thấp) – chỉ là chuyển động trang trí,
  // không sáng, không lõi; cung âm SÁNG có sát thương (vệt gen) nằm trong hộp thấp. Hiện atkT 9–11 (đầu active), mờ dần.
  function dauDuongDao(g, at, al) {
    const j = at - ATK[3].su; if (j < 0 || j > 2) return;
    g.save(); g.lineCap = 'round'; g.globalAlpha = al * (0.32 - 0.09 * j); g.strokeStyle = MAU.than; g.lineWidth = 1.4 - 0.3 * j;
    g.beginPath(); g.moveTo(10, -131); g.quadraticCurveTo(62, -118, 72, -62); g.stroke();
    g.globalAlpha = al * (0.18 - 0.05 * j); g.strokeStyle = MAU.canh; g.lineWidth = 0.8; g.beginPath(); g.moveTo(4, -124); g.quadraticCurveTo(52, -112, 62, -62); g.stroke();
    g.restore();
  }
  /* VỆT GEN (29/10, sprite/vet-gen-*.json do code/dung_vet.py dựng): cùng nhịp với vệt mẫu – chém: 8 bước active 1/3/2/2 → ô 1/2/3/4;
     pogo: atkT 1–2 ô 1 (nêm, gốc P1 nghiêng theo lưỡi) · 3–5 ô 2 (cung ép, gốc P2) · 6–8 ô 3 (mảnh) · 9–10 ô 3 mờ; nảy / hết hộp → tắt.
     Phép đặt (dat[n]: co s + dời x, y – lõi sáng nằm trong hộp đòn) tính sẵn trong JSON, game chỉ vẽ. Trả false nếu chưa có → vệt mẫu code. */
  function veGen(g, n, at, al) {
    const VB = VG.b; if (!VB) return false; const S2 = VB[BOI()] || VB[5 - BOI()]; if (!S2) return false;
    const M2 = S2.meta, d = M2.dat[n]; if (!d) return false;
    const H = M2.hang[d.hang], k = H.px_atlas_moi_px_gen, s = d.s;
    let j, a = al;
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    if (n === 4) {
      const p = phaPogo(at); if (p < 0) return true; j = Math.min(2, p); if (p === 3) a *= 0.4;
      const v = at <= 2 ? VP.P1 : VP.P2, f = H.khung[j]; songPogo(g, at, al, v); g.translate(v.x, v.y); g.rotate(-(v.goc || 0) * Math.PI / 180);
      g.globalAlpha = a; g.drawImage(S2.img, f.x, f.y, f.w, f.h, s * (f.ox - d.goc_gen[0]), s * (f.oy - d.goc_gen[1]), f.w * s / k, f.h * s / k);
    } else {
      const p = phaChem(at, n); if (p < 0) return true; j = p; const f = H.khung[j];
      // PH14: co không đều (sx, sy) + dời riêng từng khung (khung_doi) – số tính sẵn trong JSON (code/dung_vet.py), lõi từng khung vẫn trong hộp
      const sx = d.sx || s, sy = d.sy || s, kd = (d.khung_doi && d.khung_doi[j]) || [0, 0];
      if (n === 3) dauDuongDao(g, at, al);   // PH14: chém 3 – dấu đường dao mảnh / mờ phía trên (không sát thương), cung sáng chỉ trong hộp thấp
      g.globalAlpha = a; g.drawImage(S2.img, f.x, f.y, f.w, f.h, d.x + kd[0] + sx * f.ox, d.y + kd[1] + sy * f.oy, f.w * sx / k, f.h * sy / k);
    }
    g.globalAlpha = 1; return true;
  }
  const VONG = [];   // vòng va chạm pogo: {x, y (thế giới), f0}
  function veVQ() {
    if (!ST.moi || !ST.vfx) { VQ.length = 0; return; }
    const g = ctx; g.save(); g.lineJoin = 'round';
    for (const [X, Y, f, n, at, al] of VQ) { g.save(); g.translate(X, Y); g.scale(f, 1);
      if (!(ST.vet === 'gen' && veGen(g, n, at, al))) { if (n === 4) vePogo(g, at, al); else veChem(g, at, al, n); } g.restore(); }
    VQ.length = 0; veBui(g);
    for (let i = VONG.length - 1; i >= 0; i--) { const v = VONG[i], t = S.frame - v.f0; if (t >= 7) { VONG.splice(i, 1); continue; }
      const x = v.x - ox, y = v.y - oy, r = 5 + 1.6 * t, a = 1 - t / 7;
      g.globalAlpha = a * 0.9; g.strokeStyle = MAU.canh; g.lineWidth = 3.2 - 0.3 * t; g.beginPath(); g.ellipse(x, y, r * 1.25, r * 0.8, 0, 0, 7); g.stroke();
      g.globalAlpha = a; g.strokeStyle = MAU.than; g.lineWidth = 1.6 - 0.15 * t; g.stroke(); }
    g.restore();
  }
  // nảy pogo: P3 NGAY bước này (cùng bước trúng, trước khi ghi bóng / vẽ) + vòng tại điểm trúng; Lam mới bỏ tia 'trung_don' ảnh cũ dưới chân
  { const _pb = pogoBounce; pogoBounce = function (hb) {
      let px = pl.x + pl.w / 2, py = Math.min(hb.y + hb.h - 12, pl.y + pl.h + 20);
      const ds = Q_LIST().filter(q => overlap(hb, q));
      if (ds.length) { const e = ds[0]; px = (Math.max(hb.x, e.x) + Math.min(hb.x + hb.w, e.x + e.w)) / 2; py = (Math.max(hb.y, e.y) + Math.min(hb.y + hb.h, e.y + e.h)) / 2; }
      if (ST.moi) { const _hu = hu; hu = () => null; try { _pb(hb); } finally { hu = _hu; } VONG.push({x: px, y: py, f0: S.frame}); }
      else _pb(hb);
      M.nay = 0; datNhan(); LM2.nay = {f: S.frame, x: +px.toFixed(1), y: +py.toFixed(1)}; }; }
  const Q_LIST = () => { const L = []; for (const q of Q) if (!q.dead && q.st !== 'die') L.push(q); if (boss.hittable && !boss.dead) L.push(boss); return L; };

  /* ---------- nút trong ⚙ ---------- */
  function dungNut() {
    const box = document.querySelector('#set .box'), ok = document.getElementById('btn-set-ok'); if (!box || !ok) return;
    const h = document.createElement('p'); h.className = 'big'; h.textContent = 'Lam mới – bộ tư thế 3 + 4 + móc tường (đứng, chạy, chém 1/2/3, hất, trên không, nhảy/rơi, pogo, lướt, bị đánh, bám tường bằng móc + vệt chém gen)'; box.insertBefore(h, ok);
    const nut = (ten, lay, doi) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'alt';
      const cap = () => { b.textContent = ten + ': ' + lay(); }; cap();
      b.addEventListener('click', e => { e.preventDefault(); doi(); cap(); }); box.insertBefore(b, ok); };
    nut('Lam', () => ST.moi ? 'MỚI' : 'cũ', () => { ST.moi = !ST.moi; });
    nut('Vệt chém + âm nhận', () => ST.vfx ? 'bật' : 'TẮT', () => { ST.vfx = !ST.vfx; });
    nut('Bóng đen', () => ST.bong ? 'BẬT' : 'tắt', () => { ST.bong = !ST.bong; });
    nut('Tốc độ', () => ST.cham > 1 ? 'chậm ×' + ST.cham : 'thường', () => { ST.cham = ST.cham > 1 ? 1 : 4; });
    nut('Hộp đòn', () => HBO.on ? 'BẬT' : 'tắt', () => hbSet(!HBO.on));
    nut('Tường', () => ST.tuong === 'moc' ? 'BÁM MÓC (mới)' : ST.tuong === 'lung' ? 'lưng áp vách (bộ 4)' : 'mặt vào vách (bộ 3)',
      () => { ST.tuong = ST.tuong === 'moc' ? 'lung' : ST.tuong === 'lung' ? 'mat' : 'moc'; });
    nut('Vệt chém', () => ST.vet === 'gen' ? 'GEN (mới)' : 'mẫu vẽ code', () => { ST.vet = ST.vet === 'gen' ? 'code' : 'gen'; });
    // PH15 bước 1: đồng hồ khung hình + chép log (để chạy 1 tuyến trên iPhone rồi gửi)
    nut('Đồng hồ khung hình', () => DO15.on ? 'BẬT' : 'tắt', () => DO15.doi(!DO15.on));
    const o = document.createElement('textarea'); o.readOnly = true; o.hidden = true; o.style.cssText = 'width:100%;height:5em;font:10px monospace;margin:4px 0';
    nut('Chép log khung hình', () => DO15.giay.length ? DO15.giay.length + ' giây đã đo' : (DO15.on ? 'đang đo…' : 'bật đồng hồ trước'), () => {
      const t = DO15.log(); o.value = t; o.hidden = false;
      const xong = (ok) => { try { banner(ok ? 'Đã chép log khung hình – dán gửi Claude' : 'Không chép tự động được: bấm giữ ô chữ → Chọn tất cả → Chép'); } catch (e) {} };
      try { navigator.clipboard.writeText(t).then(() => xong(true), () => { o.focus(); o.select(); xong(false); }); } catch (e) { o.focus(); o.select(); xong(false); } });
    box.insertBefore(o, ok);
  }
  return {ST, M, TU, BO3, VG, BUI, nap, ve, khung, veVQ, phaChem, phaPogo, TEN_PHA, V1, VT, nhanDon, nhanChem1, chetPha, get VP() { return VP; }, SH, SH3, BOS,
    dang: '', nhan: '', bo: '', nay: null, chet: null, moc: [0, 0]};
})();
// ?vfx=0: tắt vệt chém (ảnh vet-chem) + âm nhận. Lam MỚI: chém 1 + pogo dùng vệt mẫu PH13 thay vệt ảnh + âm nhận cũ (đòn khác giữ vệt cũ).
// Hộp + sát thương KHÔNG đổi.
// Bộ 4: chém 2/3, hất, trên không cũng thay vệt ảnh + âm nhận cũ bằng vệt mẫu (khi đã có sheet + "vet"); chém vang (7) giữ vệt cũ.
{ const _hv = huVet; huVet = function (n, ox, oy, face, al) { if (!LM2.ST.vfx) return; if (LM2.ST.moi && (n === 4 || LM2.VT[n])) return; _hv(n, ox, oy, face, al); }; }
// Sửa iPhone 29/10 ("vạch thừa"): âm nhận và ánh lưỡi lúc tụ Dư Âm tính theo LƯỠI CỦA SHEET LAM CŨ (luoiKhung) → với Lam mới thành một vạch trắng
// sáng lơ lửng ngang ngực, không trùng dao. Lam mới: tắt âm nhận MỌI đòn (kể cả chém vang 7) và bỏ ánh lưỡi lúc tụ; GIỮ vòng nạp trên đầu (báo đã tụ).
{ const _an = AD.veAmNhan; AD.veAmNhan = function (...a) { if (!LM2.ST.vfx) return; if (LM2.ST.moi) return; return _an(...a); }; }
{ const _vt = AD.veTu; AD.veTu = function (s, X, Y) { if (!LM2.ST.moi) return _vt(s, X, Y); const h = s.h2; s.h2 = false;   // luoiKhung → null: chỉ vẽ vòng nạp
    try { _vt(s, X, Y); } finally { s.h2 = h; } }; }
{ const _hv = huVe; huVe = function () { _hv(); LM2.veVQ(); }; }
// PH14 (chết tạm): dao văng lúc chết (veDao) vẽ bằng sheet Lam CŨ → với Lam mới thành lưỡi dao thứ hai cạnh hình khuỵu. Lam mới: bỏ (dao vẫn trong tay hình khuỵu).
{ const _vd = veDao; veDao = function (...a) { if (LM2.ST.moi) return; return _vd(...a); }; }   // vệt mẫu vẽ SAU hiệu ứng ảnh (như âm nhận cũ)
window.TVLM2 = LM2;
// PH15 bước 1 – vẽ: (1) khựng (hitstop) → vẽ đúng vị trí bước hiện tại, không nội suy giữa 2 bước (trước: bước bật khựng còn vẽ lửng giữa 2 vị trí rồi
// nhảy); (2) vị trí nhảy > 48 px trong 1 bước (hồi sinh, đổi phòng, dịch chuyển) → không nội suy. Physics / timestep KHÔNG đổi. + đồng hồ khung hình.
{ const _r = render; render = function (al) { const t0 = performance.now();
    if (S.hitstop > 0) al = 1;
    if (Math.abs(pl.x - pl.px) > 48 || Math.abs(pl.y - pl.py) > 48) { pl.px = pl.x; pl.py = pl.y; }
    _r(al); DO15.ve(); DO15.khung(t0, performance.now()); }; }
{ const _s = step; let ph = -1, chet = false; step = function () { _s(); DO15.buocDem();
    if (S.room !== ph) { if (ph >= 0) DO15.ghiSu('đổi phòng ' + ph + ' → ' + S.room); ph = S.room; }
    if (pl.dead !== chet) { chet = pl.dead; DO15.ghiSu(chet ? 'chết' : 'hồi sinh'); } }; }
// PH15 mục 5 – âm chết (Lam mới): MỘT tiếng chuông thấp ngắn, hơi lệch (2 nhánh lệch 0,7 % → rung nhẹ), phần cao tắt nhanh, đuôi nhỏ; không tiếng rơi / nổ.
// Chỉ khi âm thanh ĐÃ được người chơi mở (AudioContext đang chạy) – không tự mở. ?lam=cu giữ âm cũ.
{ const _die = sfx.die; sfx.die = function () {
    if (!LM2.ST.moi) return _die();
    if (!SND.ac || SND.ac.state !== 'running') return;
    const P = [[1, 1, 1], [2.03, 0.28, 0.32], [2.71, 0.16, 0.2], [4.9, 0.06, 0.1], [0.5, 0.2, 1.15]];
    bell(146.8, 1.9, 0.15, 0, P); bell(146.8 * 1.007, 1.5, 0.05, 0.012, [[1, 1, 1]]); }; }
