/* ======================= PHÒNG B HƯỚNG MỚI – khối của trang thử game/thu-phong-b/index.html =======================
   Tư vấn 3 (art/huong-moi/TU-VAN-CHUYEN-GIA-3-MOI-TRUONG-PHONG-A-F.md), "THỨ TỰ THỰC HIỆN" bước đầu: chỉ PHÒNG B (Sân hai chuông).
   Code địa hình / nền / HUD nằm ở module riêng: game/runtime/dia-hinh-huong-moi.js (DHM), game/runtime/giao-dien-huong-moi.js (GDHM).
   Khối này chỉ: số đặt cho phòng B (PB_SO), móc vẽ (bọc hàm cũ, không sửa thân hàm), vào thẳng phòng B, API quay / chụp / đo (TVPB).
   Màu đồ cũ: khối HM của game/thu-huong-moi (chèn ngay trước khối này) – gạch cũ, ván, đá, đèn, điểm lưu đã chỉnh màu.

   Bước 2 (28/10): bộ đất MỚI (ảnh gen chủ dự án: bo-dat-3x3, canh-day-re, van-mot-chieu) cho CẢ A–C, điểm lưu + hình nộm mới ở A.

   Cờ URL:  ?moi=0  tắt bộ mới (nền, đất, đèn, HUD, nút, điểm lưu, hình nộm) – vẫn giữ màu HM   ?hm=0 tắt màu HM   ?hud=0 HUD + nút cũ
            ?nen=0 nền cũ   ?dat=0 đất cũ   ?bo=cu đất bước 1 (thân mới + mép cũ chỉnh màu)   ?dv=0 điểm lưu + hình nộm cũ
            ?vao=a  vào phòng A như thu-p0a   ?vao=c vào đầu phòng C (mặc định vào thẳng phòng B)   + mọi cờ của thu-p0a (?ghi=1 ?battu=1 ?hitbox=1 ?debug=input …) */

/* ---------- SỐ ĐẶT PHÒNG A / B / C (chỉnh ở đây rồi chạy lại cong-cu/tao-tu-p0a.py) ---------- */
// Bước 2 (28/10): bộ đất mới (ảnh gen chủ dự án) cho CẢ A–C; nền giữa / đèn / trang trí theo từng phòng. A ấm, an toàn; B–C sàn thoáng.
const PB_SO = {
  json: '../../art/huong-moi/dia-hinh/dia-hinh.json',
  cot: () => [[PA.x0, PC.x0 + PC.w - 1]],                       // cột vẽ bằng bộ mới: phòng A, B, C (đá 'S' trong các cột này cũng vẽ bằng đất mới)
  // nền giữa: dùng THƯA; x = mép trái mảnh trên màn khi camera ở giữa phòng (logic). Hai cây đặt sát mép màn, ngoài vùng tuần tra
  // của 2 Chuông Gỗ (cột 4–13 và 19–28 → màn 64–456 và 544–904 khi camera giữa phòng); tháp giữa đứng sau ván một chiều (cột 15–18).
  nen: {sanY: FLOOR, catDuoi: 22, giua: [{m: 'cay-trai', x: -104}, {m: 'thap', x: 380}, {m: 'cay-phai', x: 820}]},
  den: [{x: (PB.x0 + 1) * T + 20, y: 156, ph: 0.4}, {x: (PB.x0 + 32) * T + 8, y: 148, ph: 2.1}],   // y = đáy đèn; xa đầu quái (đầu ≥ y 300)
  denCao: 34,                                                    // cao đèn (tư vấn: 24–40)
  denMau: 'den-tron-sang',
  trangTri: () => [{o: 'nam-0', x: (PB.x0 + 1) * T + 2, y: FLOOR, lun: 2}, {o: 'nam-1', x: (PB.x0 + 31) * T + 14, y: FLOOR, lun: 2}]   // 2 nấm nhỏ ở 2 mép phòng (sau nhân vật)
};
// A (Khởi đầu, 24 cột < màn 960 → camera dính mép trái phòng): ẤM, AN TOÀN – tháp có cửa sổ vàng sau khoảng trống giữa hình nộm và cuối phòng,
// 3 đèn sáng hơn, quầng ấm rất nhẹ sau điểm lưu; 2 nấm cạnh điểm lưu. Điểm lưu mới (cột 2) + hình nộm mới (cột 10): xem móc vẽ bên dưới.
const PA_SO = {
  nen: {sanY: FLOOR, catDuoi: 22, giua: [{m: 'cay-trai', x: -150}, {m: 'thap', x: 470}]},
  den: [{x: (PA.x0 + 6) * T + 4, y: 150, ph: 1.1, sang: 0.32, r: 58}, {x: (PA.x0 + 15) * T + 20, y: 136, ph: 2.7, sang: 0.3, r: 54},
        {x: (PA.x0 + 21) * T + 6, y: 160, ph: 0.2, sang: 0.28, r: 52}],
  am: {x: 140, y: 380, r: 430, al: 0.14},                        // quầng ấm nền (toạ độ màn khi camera ở mép trái phòng A)
  trangTri: () => [{o: 'nam-1', x: (PA.x0 + 5) * T + 4, y: FLOOR, lun: 2}, {o: 'nam-0', x: (PA.x0 + 16) * T + 10, y: FLOOR, lun: 2}]
};
// C (Hành lang gác, trần đá hàng 0–5): THOÁNG – 1 cây nền ở mép trái (ngọn khuất sau trần), 1 đèn treo từ trần, không trang trí sàn
const PC_SO = {
  nen: {sanY: FLOOR, catDuoi: 22, giua: [{m: 'cay-trai', x: -90}]},
  den: [{x: (PC.x0 + 9) * T + 16, y: 262, ph: 0.9, tran: 6 * T}],
  trangTri: () => []
};
const PHONG_SO = [[PA, PA_SO], [PB, PB_SO], [PC, PC_SO]];
const DEN_ABC = [...PA_SO.den, ...PB_SO.den, ...PC_SO.den];
// nền giữa 3 phòng: mỗi mảnh mang trục giữa phòng của nó (rc) + trọng số theo phần màn phòng đó chiếm (đổi phòng → hoà dần, không nhảy)
const NEN_ABC = {sanY: FLOOR, catDuoi: 22, giua: []};
for (const [r, so] of PHONG_SO) for (const p of so.nen.giua) NEN_ABC.giua.push(Object.assign({}, p, {phong: r, rc: r.x0 * T + r.w * T / 2 - W / 2, w: 0}));
function nenTrongSo(ox) {
  for (const p of NEN_ABC.giua) { const r = p.phong, a = Math.max(0, Math.min(ox + W, (r.x0 + r.w) * T) - Math.max(ox, r.x0 * T)) / W;
    p.w = Math.max(0, Math.min(1, (a - 0.25) / 0.5)); }
}

const PBK = (() => {
  let q; try { q = new URLSearchParams(location.search); } catch (e) { q = new Map(); }
  const moi = q.get('moi') !== '0';
  return {q, moi, nen: moi && q.get('nen') !== '0', dat: moi && q.get('dat') !== '0', hud: moi && q.get('hud') !== '0', vaoA: q.get('vao') === 'a' || q.get('vao') === 'lang',
    vaoC: q.get('vao') === 'c', dv: moi && q.get('dv') !== '0', boCu: q.get('bo') === 'cu',
    loi: '', so: {}};
})();

/* ---------- nạp + dựng (gọi trong boot, sau HM.chuanBi) ---------- */
PBK.chuanBi = async function () {
  if (!PBK.moi) return;
  const t0 = performance.now();
  try { await DHM.nap(PB_SO.json); } catch (e) { PBK.loi = String(e && e.message || e); PBK.nen = PBK.dat = false; warn('Không nạp được địa hình hướng mới: ' + PBK.loi); }
  if (DHM.bat) {
    DHM.dung(PBK.optThat());
    if (lhOn() && LHT.O[PB_SO.denMau]) DHM.taoDen(LHT.O[PB_SO.denMau], PB_SO.denCao);
  }
  if (PBK.hud) GDHM.ap();
  PBK.so.ms_chuan_bi = Math.round(performance.now() - t0);
};
PBK.optThat = () => ({T, ROWS, rows: GCH.rows, WW, cot: PB_SO.cot(), tile, cuIdx: (tx, ty) => GCH.map[ty * WW + tx], cuK: GCH.k, cuTen: GCH.o, cuImg: GCH.cv,
  trangTri: [...PA_SO.trangTri(), ...PB_SO.trangTri(), ...PC_SO.trangTri()], boCu: PBK.boCu});

/* ---------- móc vẽ (bọc hàm cũ) ---------- */
const _pbNen = drawNen;
const laABC = r => r === PA || r === PB || r === PC;
drawNen = function () {
  const r = ROOMS[roomAt(ox + W / 2)];
  if (PBK.nen && laABC(r)) { nenTrongSo(ox);
    if (DHM.veNen(ctx, ox, oy, BK, W, H, ox, S.rc, NEN_ABC)) {
      const a = PA_SO.am, wa = NEN_ABC.giua[0].w;   // phòng A: quầng ấm rất nhẹ (lớp nền, sau địa hình / nhân vật)
      if (wa > 0) { const x = a.x + (PA.x0 * T - ox), g = ctx.createRadialGradient(x, a.y - oy, 0, x, a.y - oy, a.r);
        g.addColorStop(0, 'rgba(255,196,120,' + (a.al * wa).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,170,90,0)');
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x - a.r, a.y - oy - a.r, a.r * 2, a.r * 2); ctx.restore(); }
      DHM.veDen(ctx, ox, oy, DEN_ABC, S.frame);   // đèn + quầng nhỏ ở lớp nền (sau địa hình, sau mọi nhân vật / đòn)
      return;
    }
  }
  _pbNen();
};
const _pbGach = drawGach;
drawGach = function () {
  if (!PBK.dat || !DHM.bat) return _pbGach();
  const M = GCH.map, cv = GCH.cv, K = BK; if (!M) return;
  TT.ve('sau', ox, oy);
  const tx0 = Math.max(0, Math.floor(ox / T)), tx1 = Math.min(WW - 1, Math.floor((ox + W) / T)), ty0 = Math.max(0, Math.floor(oy / T)), ty1 = Math.min(GCH.rows - 1, Math.floor((oy + H) / T));
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  for (let ty = ty0; ty <= ty1; ty++) { const y0 = Math.round((ty * T - oy) * K) / K, y1 = Math.round(((ty + 1) * T - oy) * K) / K;
    for (let tx = tx0; tx <= tx1; tx++) { if (DHM.coCot(tx)) continue; const v = M[ty * WW + tx]; if (v < 0) continue; const qq = GCH.k[v];
      const x0 = Math.round((tx * T - ox) * K) / K, x1 = Math.round(((tx + 1) * T - ox) * K) / K;
      ctx.drawImage(cv, qq[0], qq[1], 64, 64, x0, y0, x1 - x0, y1 - y0); } }
  DHM.veDat(ctx, ox, oy, K, W, H, cv);   // phòng B: thân + mặt trên + đầu + mép cũ chỉnh màu + ván / đá cũ
  TT.ve('than', ox, oy); drawRe(); TT.ve('mat', ox, oy);
};
const _pbTien = drawTienCanh;
drawTienCanh = function () { if (PBK.nen && DHM.bat && laABC(ROOMS[roomAt(ox + W / 2)])) return; _pbTien(); };   // A–C: CHƯA thêm lớp gần (tư vấn mục 3) → bỏ rễ treo tiền cảnh cũ
const _pbHud = veHUD;
veHUD = function () {
  if (!PBK.hud) return _pbHud();
  let vong = 'san', day = 1;
  if (rec) { vong = 'ghi'; day = 1 - rec.n / P.echoFrames; } else if (echo && !echo.done) { vong = 'phat'; day = echo.i / echo.n; } else if (echo && echo.done) { vong = 'giu'; day = 1; }
  GDHM.veHUD(ctx, {hp: pl.hp, maxHp: P.maxHp, vong, day, ch: S.resCount, chPulse: LH.chPulse / 40, frame: S.frame});
};
// "Nói chuyện": ẩn ngay khi rời vùng NPC (80 px), hộp thoại đang mở cũng đóng khi rời vùng đó (cũ: 150 px)
const _pbTh = thBuoc;
thBuoc = function () {
  _pbTh(); if (!PBK.hud) return;
  if (TH.on && TH.n && Math.abs(pl.x + pl.w / 2 - TH.n.x) > 80) thDong();
  if (!TH.gan && !noiBtn.hidden) { noiBtn.hidden = true; TH.nutHien = false; }
};
/* ---------- ĐIỂM LƯU MỚI (phòng A): vòm rễ sau Lam + chuông rời lắc khi lưu; đã lưu = dấu ngà trên chuông + quầng ấm nhỏ.
   Vùng kích hoạt / hồi máu GIỮ NGUYÊN (logic cũ: |Lam − b.x| < 40). ?dv=0: điểm lưu + hình nộm cũ. ---------- */
const dvMoi = () => PBK.dv && DHM.coDoVat();
const _pbSave = drawSaveBell;
drawSaveBell = function (b) {
  if (!dvMoi() || !DHM.coCot(Math.floor(b.x / T))) return _pbSave(b);
  const X = b.x - ox, Y = b.y - oy + 1; if (X < -90 || X > W + 90) return;
  const rot = b.ring > 0 ? Math.sin(b.ring * 0.32) * 0.3 * b.ring / 70 : Math.sin(S.frame * 0.025 + b.x) * 0.02;
  if (b.on) { const pz = 0.8 + 0.2 * Math.sin(S.frame * 0.05) + (b.ring > 0 ? b.ring / 70 * 0.5 : 0);   // quầng ấm nhỏ sau vòm (không quầng teal)
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(X, Y - 52, 4, X, Y - 52, 70);
    g.addColorStop(0, 'rgba(255,214,140,' + (0.2 * pz).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,190,100,0)'); ctx.fillStyle = g; ctx.fillRect(X - 72, Y - 124, 144, 144); ctx.restore(); }
  DHM.veDiemLuu(ctx, X, Y, b.on, rot);
};
/* ---------- HÌNH NỘM MỚI (phòng A): cùng lớp quái (sau Lam, trước nền), neo giữa đáy hộp va chạm 72×108 (KHÔNG đổi), cao 108, rộng 56.
   Giữ hành vi cũ: lắc + sáng khi trúng (q.flash), bảng số trên đầu (y như P0.veNom), thanh Thế (P0.veQuai). ---------- */
const _pbQ = drawQuai;
drawQuai = function (q, al) {
  if (!q.nom || !dvMoi()) return _pbQ(q, al);
  const x = q.x + q.w / 2 - ox, y = q.y + q.h - oy; if (x < -120 || x > W + 120) { P0.veQuai(q, al); return; }
  const lac = q.flash > 0 ? Math.sin(q.flash * 1.7) * 3 : 0;
  ctx.save(); bong(x, y - 1, 30, 0.3); DHM.veNomMoi(ctx, x, y + 1, lac, q.flash > 0 ? Math.min(1, q.flash / 6) * 0.7 : 0);
  ctx.font = 'bold 11px ui-monospace,Menlo,monospace'; ctx.textAlign = 'center';
  const dong = ['HÌNH NỘM  máu ' + q.hp + '/' + q.max];
  if (q.nomS && q.nomS.length) dong.push('vừa rồi: ' + q.nomS.join(' + ') + ' = ' + q.nomTong);
  if (pl.D && pl.D.treBam !== undefined && pl.D.src === 'p') dong.push('chạm → hộp: ' + pl.D.treBam + ' tick' + (pl.D.treBam > ATK[pl.D.loai].su ? ' (gồm lúc chờ)' : ''));
  dong.forEach((t, i) => { const w = ctx.measureText(t).width; ctx.fillStyle = 'rgba(12,15,20,.7)'; ctx.fillRect(x - w / 2 - 3, y - 190 + i * 13, w + 6, 13); ctx.fillStyle = '#F3E6C8'; ctx.fillText(t, x, y - 180 + i * 13); });
  ctx.textAlign = 'left'; ctx.restore();
  P0.veQuai(q, al);
};
// vào thẳng phòng B (mốc hồi sinh ẩn ở đầu phòng B – không vẽ chuông lưu mới)
const _pbNG = newGame;
newGame = function () {
  _pbNG(); if (PBK.vaoA) return;
  if (PBK.vaoC) { placePlayer((PC.x0 + 2) * T + 6, FLOOR - pl.h); pl.face = 1; pl.drawT = 0; S.cp = {x: (PC.x0 + 2) * T + 16, y: FLOOR, on: true, ring: 0, cd: 0}; return; }
  placePlayer((PB.x0 + 3) * T + 6, FLOOR - pl.h); pl.face = 1; pl.drawT = P0_SO.ghi ? 0 : RUT_T;
  S.cp = {x: (PB.x0 + 3) * T + 16, y: FLOOR, on: true, ring: 0, cd: 0};
};
(document.getElementById('start-p0') || {}).textContent += ' · Trang thử PHÒNG B hướng mới – bước 2: bộ đất mới (ảnh gen) cho A–C, điểm lưu + hình nộm mới, HUD / nút vẽ bằng code. ?moi=0: tắt bộ mới.';

/* ======================= THỬ: API chụp / quay / đo (chỉ dùng với ?ghi=1) ======================= */
window.TVPB = {
  PBK, PB_SO, DHM,
  /* trạng thái gọn cho bot quay video */
  tt() { const f = q => ({x: +(q.x + q.w / 2).toFixed(1), st: q.st, t: q.t, dead: qDown(q), face: q.face});
    return {f: S.frame, x: +(pl.x + pl.w / 2).toFixed(1), face: pl.face, atkN: pl.atkN, hp: pl.hp, g: pl.onGround, q3: f(Q[3]), q4: f(Q[4]), camx: S.camx, room: S.room}; },
  doVe(n) { DO.reset(); for (let i = 0; i < n; i++) { savePrev(); step(); render(1); } const a = DO.ds.slice().sort((p, q) => p - q);
    return {n: a.length, tb: +(DO.tong / DO.n).toFixed(3), p50: +a[a.length >> 1].toFixed(3), p95: +a[Math.floor(a.length * 0.95)].toFixed(3), max: +DO.max.toFixed(3)}; },
  so() { return {pbk: PBK.so, dhm: DHM.SO, hm: typeof HM !== 'undefined' ? HM.SO : null, vien: DHM.SO.vien_mau, loi: PBK.loi}; },
  /* ẢNH KIỂM LIỀN MÉP: dựng lưới giả bằng chính DHM.dung + DHM.veDat (cùng code với game), vẽ ra canvas riêng → data URL.
     kieu: 'hang-dai' | 'mang-4x4' | 'goc-lom' | 'be-don' | 'hanh-lang-tran';  k: phóng (1 = logic, 2 = cỡ ảnh 2x); vien: vẽ nét collider (đỏ = mặt trên, cam = cạnh) */
  kiemMep(kieu, k, vien) {
    const LUOI = {
      'hang-dai': ['........................................', '........................................', '........................................',
        '########################################', '########################################', '########################################', '########################################'],
      'mang-4x4': ['............', '............', '....####....', '....####....', '....####....', '....####....', '............', '............'],
      'goc-lom': ['##..........###', '##..........###', '##..........###', '##.......######', '##.......######', '###############', '###############', '###############', '###############'],
      'be-don': ['..............', '..............', '.######.......', '..............', '.......######.', '.......######.', '..............', '..#.....====..', '..............'],
      // hành lang trần kiểu phòng C: trần 4 hàng, cột treo 3 ô (trên cổng), tường phải, sàn; ván một chiều giữa hành lang
      'hanh-lang-tran': ['########################', '########################', '########################', '########################',
        '...............#.......#', '...............#.......#', '...............#.......#', '.......====............#', '.......................#', '.......................#',
        '########################', '########################']
    }[kieu];
    if (!LUOI) return null;
    const R = LUOI.length, C = LUOI[0].length, KK = k || 2, cvT = document.createElement('canvas'); cvT.width = C * T * KK; cvT.height = R * T * KK;
    const g = cvT.getContext('2d'); g.setTransform(KK, 0, 0, KK, 0, 0);
    g.fillStyle = '#5f7680'; g.fillRect(0, 0, C * T, R * T);   // nền xám xanh sáng: lộ mọi chỗ hở / viền sáng
    const tileG = (tx, ty) => (tx < 0 || tx >= C || ty >= R) ? (ty >= R ? LUOI[R - 1][Math.max(0, Math.min(C - 1, tx))] : '.') : (ty < 0 ? '#' : LUOI[ty][tx]);
    DHM.dung({T, ROWS: R, rows: R, WW: C, cot: [[0, C - 1]], tile: tileG, cuIdx: () => -1, cuK: GCH.k, cuTen: GCH.o, cuImg: GCH.cv, trangTri: []});
    DHM.veDat(g, 0, 0, KK, C * T, R * T, GCH.cv);
    if (vien) { g.lineWidth = 1 / KK * 1.5;
      for (let ty = 0; ty < R; ty++) for (let tx = 0; tx < C; tx++) {
        if (LUOI[ty][tx] === '=') { g.strokeStyle = '#ff3b3b'; g.setLineDash([3, 2]); g.beginPath(); g.moveTo(tx * T, ty * T); g.lineTo((tx + 1) * T, ty * T); g.stroke(); g.setLineDash([]); continue; }
        if (LUOI[ty][tx] !== '#') continue;
        const o = (a, b) => tileG(a, b) !== '#';
        if (o(tx, ty - 1) && ty > 0) { g.strokeStyle = '#ff3b3b'; g.beginPath(); g.moveTo(tx * T, ty * T); g.lineTo((tx + 1) * T, ty * T); g.stroke(); }
        g.strokeStyle = '#ffb02e';
        if (o(tx - 1, ty)) { g.beginPath(); g.moveTo(tx * T, ty * T); g.lineTo(tx * T, (ty + 1) * T); g.stroke(); }
        if (o(tx + 1, ty)) { g.beginPath(); g.moveTo((tx + 1) * T, ty * T); g.lineTo((tx + 1) * T, (ty + 1) * T); g.stroke(); }
        if (ty + 1 < R && o(tx, ty + 1)) { g.beginPath(); g.moveTo(tx * T, (ty + 1) * T); g.lineTo((tx + 1) * T, (ty + 1) * T); g.stroke(); } } }
    DHM.dung(PBK.optThat());   // dựng lại lưới thật
    return cvT.toDataURL('image/png');
  }
};
