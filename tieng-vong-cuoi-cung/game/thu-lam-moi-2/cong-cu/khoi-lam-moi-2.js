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
   KHÔNG crossfade: mỗi bước vẽ đúng MỘT hình.
   Cờ: ?lam=cu Lam cũ · ?vfx=0 tắt vệt + âm nhận (duyệt tạo dáng) · ?bong=1 Lam bóng đen · ?hitbox=1 hộp đòn · ?cham=4 chậm 4 lần (1–8). ⚙ → "Lam mới 2".
*/
const LM2 = (() => {
  const QS = P0_Q;
  const ST = {moi: QS.get('lam') !== 'cu', vfx: QS.get('vfx') !== '0', bong: QS.get('bong') === '1',
    cham: Math.max(1, Math.min(8, +(QS.get('cham') || 1) || 1)), tuong: QS.get('tuong') === 'mat' ? 'mat' : 'lung'};
  const DUONG = '../../art/huong-moi/lam-tu-the-2/sprite/';
  const SH = {}, SH3 = {};   // thử 2: chay / chem – {meta, img, E (tô ngọc cho bóng Vọng), D (bóng đen)}; SH bản 2x, SH3 bản 3x
  const TU = {};             // nhãn tư thế → [{2: sheet2x, 3: sheet3x}, chỉ số khung]
  const BO3 = [];            // tên sheet bộ 3 đã nạp
  function to(img, mau, a) { const c = document.createElement('canvas'); c.width = img.naturalWidth || img.width; c.height = img.naturalHeight || img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0); g.globalCompositeOperation = 'source-atop'; g.globalAlpha = a; g.fillStyle = mau; g.fillRect(0, 0, c.width, c.height); return c; }
  const goi = (img, meta) => { const o = {meta, img, _E: null, _D: null};
    Object.defineProperty(o, 'E', {get() { return this._E || (this._E = to(img, '#CEF0D6', 0.8)); }});
    Object.defineProperty(o, 'D', {get() { return this._D || (this._D = to(img, '#000000', 1)); }}); return o; };
  async function nap1(ten) {
    const meta = await (await fetch(DUONG + ten + '.json')).json();
    const img = new Image(); img.src = DUONG + meta.anh; await img.decode();
    if (img.naturalWidth !== meta.co_sheet[0] || img.naturalHeight !== meta.co_sheet[1]) throw new Error(meta.anh + ': cỡ ảnh khác co_sheet trong JSON');
    return goi(img, meta);
  }
  const ganNhan = (bo, nhan) => nhan.forEach((n, i) => { TU[n] = [bo, i]; });
  // gốc vệt pogo (px logic so với chân, nhìn phải) theo tư thế: P1 = pha nêm bật (atkT 1–2), P2 = các pha sau. goc = nghiêng mũi vệt về trước (độ).
  // Mặc định = bản trước bộ 3; sheet pogo bộ 3 ghi lại theo mũi dao đo trên ảnh (bang-thu3.json → vet_pogo).
  let VP = {P1: {x: 8, y: 2, goc: 0}, P2: {x: 8, y: 2, goc: 0}};
  async function nap() {
    for (const [k, ten] of [['chay', 'lam-moi2-chay'], ['chem', 'lam-moi2-chem1']]) {
      SH[k] = await nap1(ten + '-2x');
      try { SH3[k] = await nap1(ten + '-3x'); } catch (e) { console.warn('LM2: không nạp được ' + ten + '-3x → dùng 2x', e); }
    }
    ganNhan({2: SH.chay, 3: SH3.chay}, ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8']);
    ganNhan({2: SH.chem, 3: SH3.chem}, ['A', 'B', 'C', 'D']);
    // bộ 3 (PH13 mục 2): chỉ nạp sheet có trong danh sách – chưa có ảnh thì danh sách rỗng → hình tạm
    let ds = [];
    try { ds = (await (await fetch(DUONG + 'thu3-danh-sach.json')).json()).sheets || []; } catch (e) { console.warn('LM2: không đọc được thu3-danh-sach.json → chưa có sheet bộ 3'); }
    for (const d of ds) {
      try { const b = {2: await nap1(d.ten + '-2x')}; if (d.co_3x) try { b[3] = await nap1(d.ten + '-3x'); } catch (e) { console.warn('LM2: ' + d.ten + '-3x lỗi → 2x'); }
        ganNhan(b, b[2].meta.tu_the); BO3.push(d.ten); const mv = b[2].meta;
        if (mv.vet_pogo && mv.vet_pogo.P1) VP = mv.vet_pogo;
        if (mv.vet_chem1) for (const k of ['x', 'y', 'R', 'h', 'T', 'goc', 'tm']) if (typeof mv.vet_chem1[k] === 'number') V1[k] = mv.vet_chem1[k];
        if (mv.vet && mv.vet.n) { const v = {}; for (const k of ['x', 'y', 'R', 'h', 'T', 'goc', 'tm']) v[k] = +mv.vet[k]; VT[mv.vet.n] = v; } }
      catch (e) { console.warn('LM2: không nạp được ' + d.ten, e); }
    }
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
  function nhanBay() {   // trên không (nhảy / rơi / sau nảy)
    if (M.dinh >= 1 && M.dinh <= 4 && pl.vy <= APEX) return 'J3';
    if (pl.vy < 0) return M.upT <= 2 ? 'J1' : 'J2';
    return M.f2 ? 'F2' : 'F1';
  }
  function chonNhan() {
    const a2 = pl.a2;
    if (pl.dead || pl.drawT > 0) return 'tam:' + a2;
    if (a2 === 'hurt') return pl.hurtT >= 13 ? 'BD1' : 'BD2';
    if (a2 === 'dash') { const i = P.dashFrames - pl.dash; return i <= 2 ? 'LU1' : i >= P.dashFrames - 1 ? 'LU3' : 'LU2'; }
    if (LICH[pl.atkN] && a2 === 'atk' + pl.atkN) return nhanDon(pl.atkN, pl.atkT);
    if (a2 === 'run') return 'R' + (Math.min(7, Math.floor((pl.pha || 0) * 8)) + 1);
    if (pl.atkN === 1 && a2 === 'atk1') { const A = ATK[1], t = pl.atkT; return t < A.su ? 'A' : t < A.su + 4 ? 'B' : t < A.su + A.ac ? 'C' : 'D'; }
    if (pl.atkN === 4 && a2 === 'atk4') return M.nay >= 0 ? 'P3' : pl.atkBounced ? nhanBay() : pl.atkT <= 2 ? 'P1' : 'P2';   // sau P3: về J2/J3 theo vy
    if (M.nay >= 0 && !pl.atkN && (a2 === 'jump' || a2 === 'fall')) return 'P3';
    if (a2 === 'wall' && pl.vy < -1) return 'J1';   // bấm nhảy tường: physics đã bật lên ngay bước này → hình bật nhảy, không giữ W2
    if (a2 === 'wall') return pl.wallStickT < P.wallStick ? (M.wT <= 2 ? 'W1' : 'W2') : pl.vy > 0 ? (((M.sT - 1) % 12) < 6 ? 'W3' : 'W4') : 'W2';
    if (a2 === 'walljump') return pl.wjT >= 15 ? 'J1' : nhanBay();
    if (a2 === 'jump' || a2 === 'fall') return nhanBay();
    if (a2 === 'idle' || a2 === 'land') { if (M.datT > 0) return 'L'; const t = (M.idT - 1) % 120; return t < 36 ? 'I1' : t < 60 ? 'I2' : t < 84 ? 'I3' : 'I1'; }
    return 'tam:' + a2;
  }
  function datNhan() { let n = chonNhan();
    if (/^W\d$/.test(n) && ST.tuong === 'lung' && TU['WL' + n[1]]) n = 'WL' + n[1];   // tường LƯNG áp vách (mặc định); ?tuong=mat giữ W1–W4 bộ 3
    pl.m2n = n;
    // lật: W (bộ 3, mẫu vách PHẢI, nhìn vào vách) → lật khi vách trái; WL (bộ 4, mẫu vách TRÁI, lưng áp vách) → lật khi vách phải
    pl.m2l = (n[0] === 'W' && TU[n]) ? (n[1] === 'L' ? pl.lastWall > 0 : pl.lastWall < 0) : null; }
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
        : (nn === 1 && a2 === 'atk1') ? (at < ATK[1].su ? 'A' : at < ATK[1].su + 4 ? 'B' : at < ATK[1].su + ATK[1].ac ? 'C' : 'D')
        : (LICH[nn] && a2 === 'atk' + nn) ? nhanDon(nn, at) : (a2 === 'dash' && TU.LU2) ? 'LU2' : 'tam:' + a2;
    }
    const t = TU[n]; if (t) return [t[0], t[1], false, s.m2l === null || s.m2l === undefined ? s.l2 : s.m2l, n];
    const u = tam(n, a2); return [u[0], u[1], true, s.l2, n];
  }
  { const _lc = lamChon; lamChon = function (chiHinh) { _lc(chiHinh); if (!chiHinh) capNhat(); datNhan(); }; }
  { const _rf = recordFrame; recordFrame = function (hb) { _rf(hb); const s = REC[rec.n - 1]; s.m2n = pl.m2n; s.m2l = pl.m2l; }; }

  /* ---------- vẽ Lam (móc ở đầu drawLam gốc): true = đã vẽ Lam mới ---------- */
  const VQ = [];   // vệt chờ vẽ (sau huVe): [X, Y, f, n, at, độ đục]
  function ve(bo, s, x, y) {
    if (!ST.moi || !SH.chem || !s.a2) return false;
    const [B, i, , lat, n] = khung(s), S2 = (BK > 2 && B[3]) ? B[3] : B[2], M2 = S2.meta, f = M2.frames[i];
    const img = bo === LAM.E ? S2.E : ST.bong ? S2.D : S2.img, sc = 1 / M2.ty_le.px_nguon_moi_px_logic;
    const X = snap(x - ox + pl.w / 2), Y = snap(y - oy + pl.h), ax = M2.diem_neo.x, ay = M2.diem_neo.y;
    const dx = Math.round(-ax * sc * BK) / BK, dy = Math.round(-ay * sc * BK) / BK;   // 3x ở BK 3: đúng 1 điểm sheet = 1 điểm màn
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.save(); ctx.translate(X, Y); if (lat) ctx.scale(-1, 1);
    ctx.drawImage(img, f.x, f.y, f.w, f.h, dx, dy, f.w * sc, f.h * sc);
    ctx.restore();
    if (s === pl && bo === LAM) { LM2.dang = (S2 === SH.chay || S2 === SH3.chay ? 'chay' : S2 === SH.chem || S2 === SH3.chem ? 'chem' : M2.vai) + ':' + i;
      LM2.nhan = n; LM2.bo = M2.ty_le.px_nguon_moi_px_logic + 'x';
      if (coVet(pl.atkN)) VQ.push([X, Y, s.l2 ? -1 : 1, pl.atkN, pl.atkT, 1]); }
    else if (echo && s === echo.cur && bo === LAM.E && !echo.done && coVet(s.n)) VQ.push([X, Y, s.l2 ? -1 : 1, s.n, s.at, 0.5]);
    return true;
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
    g.save(); g.translate(v.x, v.y); g.rotate(Math.PI / 2 - (v.goc || 0) * Math.PI / 180);   // +x cục bộ = hướng XUỐNG (nghiêng goc về trước); h = nửa bề ngang
    if (pha === 0) lop(g, at === 1 ? 17 : 21, at === 1 ? 12 : 14, 9, -1, 1, 1.75, al, 0.9);            // nêm bật: hẹp, sâu, đặc
    else if (pha === 1) { const q = at - 3; lop(g, 22 + q, 21 + q, 8, -1, 1, 1.7, al, 0.75 - 0.1 * q); }  // cung ép: rộng, nông
    else if (pha === 2) { const q = at - 6;
      for (const [a0, a1] of [[-1, -0.4], [-0.25, 0.25], [0.4, 1]]) { g.save(); const m = (a0 + a1) / 2 * 1.7, d = 2 + 2.2 * q; g.translate(Math.cos(m) * d, Math.sin(m) * d * 1.2);
        lop(g, 24, 23, 6 - 1.3 * q, a0, a1, 1.7, al * (0.85 - 0.2 * q), q ? 0 : 0.3, cua(a0, a1)); g.restore(); } }
    else lop(g, 9, 8, 2.6, -1, 1, 1.6, al * 0.35, 0);                                                    // dấu nhỏ gần lưỡi
    g.restore();
  }
  const VONG = [];   // vòng va chạm pogo: {x, y (thế giới), f0}
  function veVQ() {
    if (!ST.moi || !ST.vfx) { VQ.length = 0; return; }
    const g = ctx; g.save(); g.lineJoin = 'round';
    for (const [X, Y, f, n, at, al] of VQ) { g.save(); g.translate(X, Y); g.scale(f, 1); if (n === 4) vePogo(g, at, al); else veChem(g, at, al, n); g.restore(); }
    VQ.length = 0;
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
    const h = document.createElement('p'); h.className = 'big'; h.textContent = 'Lam mới – bộ tư thế 3 + 4 (đứng, chạy, chém 1/2/3, hất, trên không, nhảy/rơi, pogo, lướt, bị đánh, tường lưng áp vách + vệt mẫu)'; box.insertBefore(h, ok);
    const nut = (ten, lay, doi) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'alt';
      const cap = () => { b.textContent = ten + ': ' + lay(); }; cap();
      b.addEventListener('click', e => { e.preventDefault(); doi(); cap(); }); box.insertBefore(b, ok); };
    nut('Lam', () => ST.moi ? 'MỚI' : 'cũ', () => { ST.moi = !ST.moi; });
    nut('Vệt chém + âm nhận', () => ST.vfx ? 'bật' : 'TẮT', () => { ST.vfx = !ST.vfx; });
    nut('Bóng đen', () => ST.bong ? 'BẬT' : 'tắt', () => { ST.bong = !ST.bong; });
    nut('Tốc độ', () => ST.cham > 1 ? 'chậm ×' + ST.cham : 'thường', () => { ST.cham = ST.cham > 1 ? 1 : 4; });
    nut('Hộp đòn', () => HBO.on ? 'BẬT' : 'tắt', () => hbSet(!HBO.on));
    nut('Tường', () => ST.tuong === 'lung' ? 'LƯNG áp vách (mới)' : 'mặt vào vách (bộ 3)', () => { ST.tuong = ST.tuong === 'lung' ? 'mat' : 'lung'; });
  }
  return {ST, M, TU, BO3, nap, ve, khung, veVQ, phaChem, phaPogo, TEN_PHA, V1, VT, nhanDon, get VP() { return VP; }, SH, SH3, dang: '', nhan: '', bo: '', nay: null};
})();
// ?vfx=0: tắt vệt chém (ảnh vet-chem) + âm nhận. Lam MỚI: chém 1 + pogo dùng vệt mẫu PH13 thay vệt ảnh + âm nhận cũ (đòn khác giữ vệt cũ).
// Hộp + sát thương KHÔNG đổi.
// Bộ 4: chém 2/3, hất, trên không cũng thay vệt ảnh + âm nhận cũ bằng vệt mẫu (khi đã có sheet + "vet"); chém vang (7) giữ vệt cũ.
{ const _hv = huVet; huVet = function (n, ox, oy, face, al) { if (!LM2.ST.vfx) return; if (LM2.ST.moi && (n === 4 || LM2.VT[n])) return; _hv(n, ox, oy, face, al); }; }
{ const _an = AD.veAmNhan; AD.veAmNhan = function (...a) { if (!LM2.ST.vfx) return; if (LM2.ST.moi && (a[3] === 4 || LM2.VT[a[3]])) return; return _an(...a); }; }
{ const _hv = huVe; huVe = function () { _hv(); LM2.veVQ(); }; }   // vệt mẫu vẽ SAU hiệu ứng ảnh (như âm nhận cũ)
window.TVLM2 = LM2;
