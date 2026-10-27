/* ======================= RỄ MỤC – khối thêm vào bản THỬ game/thu-re-muc/thu-re-muc.html (sinh từ demo.html) =======================
   Phần GHÉP (nếu duyệt, đưa vào demo.html – xem GHI-CHU.md mục "cách ghép"):  bản đồ phòng RM (dungBanDoRM), nạp asset Rễ Mục (napRM,
   napTTGop), nền cuộn 2 chiều (veNenRM), camera dọc (camYRM), tường mục (MUC), đồ vật + hiệu ứng lặp (RMV).
   Phần THỬ (không ghép): ?vao=remuc, ?gan=sau, bot kịch bản, API TVTHU (chụp / quay).

   SỐ GAMEPLAY TẠM (chủ dự án chỉnh ở đây):                                                          */
const MUC_SO = {
  GAY: 120,        // bám liên tục bao nhiêu BƯỚC (60 bước = 1 giây) thì tường gãy  → 2 giây
  HOI: 0.25,       // mỗi bước KHÔNG bám, đồng hồ bám giảm bấy nhiêu (0,25 = buông 4 bước mới "quên" 1 bước bám; nhảy qua lại nhanh vẫn tích dần)
  NUT: 60,         // từ bước này hiện vết nứt
  NUT2: 100,       // từ bước này nứt rộng + mẻ + rung mạnh
  MAT: 180,        // gãy xong: mất collider bấy nhiêu bước (3 giây) rồi mọc lại
  MOC: 40,         // mọc lại: hiện dần trong bấy nhiêu bước (collider có ngay từ đầu mọc, trừ khi Lam đang đứng trong ô)
  RUNG: 2.5        // biên độ rung tối đa (px) lúc sắp gãy
};
const RM_SO = { CAM_CHAN: 0.62, CAM_MUOT: 0.1, BAO_TU_GAN: 70, BAO_TU_LAI: 180, GIOT_CHU_KY: 150 };
// CAM_CHAN: chân Lam ở 62 % chiều cao màn khi camera dọc tự do (cuối hành lang bị kẹp đáy → chân ở 76 %); CAM_MUOT: độ mượt camera dọc

/* ---------- tham số URL (THỬ) ---------- */
const THU = (() => { let q; try { q = new URLSearchParams(location.search); } catch (e) { q = new Map(); }
  return {vao: q.get('vao') || '', ghi: q.get('ghi') === '1', ganSau: q.get('gan') === 'sau', quai: q.get('quai') !== '0'}; })();

/* ---------- bản đồ phòng Rễ Mục (gọi ngay sau khi dựng 6 phòng cũ; chỉ dùng fill/G/RM/ROWS) ---------- */
function dungBanDoRM() {
  fill(RM, 0, 0, RM.w - 1, ROWS - 1, '.');
  fill(RM, 0, 0, RM.w - 1, 1, 'R');              // trần
  fill(RM, 0, 14, 8, ROWS - 1, 'R');             // khối trái: sàn vào hàng 14 (= FLOOR phòng boss) + thân xuống đáy
  fill(RM, 13, 14, RM.w - 1, 22, 'R');           // khối phải: mặt trên hàng 14 (tầng trên, ngõ cụt), đáy hàng 22 = trần hành lang
  fill(RM, RM.w - 1, 0, RM.w - 1, ROWS - 1, 'R');   // tường phải
  fill(RM, 9, 32, RM.w - 1, ROWS - 1, 'R');      // sàn hành lang (hàng 32)
  fill(RM, 8, 18, 8, 31, 'M');                   // TƯỜNG MỤC trái giếng (lộ bên phải) – 14 ô, tới sát sàn hành lang (gãy → hốc ở chân tường, không có chỗ đứng lơ lửng)
  fill(RM, 13, 15, 13, 21, 'M');                 // TƯỜNG MỤC phải giếng (lộ bên trái) – 7 ô
  fill(RM, 24, 29, 26, 29, '=');                 // bệ ván treo 3 ô (trang trí van-day của v3) – mặt y 928, cao 96 trên sàn (nhảy 112 tới được)
  fill(RM, 30, 30, 32, 31, 'R');                 // bậc 2 ô cao giữa hành lang
}

/* ---------- camera dọc: phòng có h (số hàng) > 17 thì theo Lam; phòng cũ giữ như demo ---------- */
function camYMucTieu(r) {
  if (!r.h) return touchMode ? 28 : 0;
  return clamp(pl.y + pl.h - H * RM_SO.CAM_CHAN + (touchMode ? 28 : 0), 0, r.h * T - H);
}
function camYRM(r) {
  const t = camYMucTieu(r);
  if (!r.h) return approach(S.camy, t, 1);
  let y = S.camy + (t - S.camy) * RM_SO.CAM_MUOT; if (Math.abs(t - y) < 0.02) y = t; return y;
}

/* ---------- nạp asset Rễ Mục (nền 3 lớp, atlas gạch rm-*, đồ vật) + gộp atlas gạch với Làng Chuông ---------- */
const RM_NAP = {nen: null, lop: [], gachMeta: null, gachImg: null, dv: {}, dvMeta: null, so: null};
async function napRM() {
  const t0 = performance.now();
  async function js(rel) { const r = await fetch(SRC.rm + rel, {cache: 'no-cache'}); if (!r.ok) throw new Error('lỗi mạng ' + r.status + ' khi tải ' + rel); return r.json(); }
  async function anh(rel, co) { const im = await loadImgDecode(SRC.rm + rel); if (!im) throw new Error('không tải được ảnh ' + rel);
    if (co && (im.naturalWidth !== co[0] || im.naturalHeight !== co[1])) throw new Error('ảnh ' + rel + ' cỡ ' + im.naturalWidth + '×' + im.naturalHeight + ' ≠ ' + co.join('×')); return im; }
  const nen = await js('nen/nen.json'), gm = await js('gach/rm-atlas.json'), dvm = await js('do-vat/do-vat.json');
  const tenNen = ['re-muc-xa.png', 're-muc-giua.png', 're-muc-gan.png'];
  const imgs = await Promise.all(tenNen.map(t => anh('nen/' + t, nen.lop[t].co_anh)));
  RM_NAP.lop = tenNen.map((t, i) => { const L = nen.lop[t]; return {img: imgs[i], k: L.he_so_cuon, kd: L.he_so_cuon_doc, w: L.co_logic[0], h: L.co_logic[1], lapDoc: !!L.lap_doc, ten: t}; });
  const gimg = await anh('gach/' + gm.anh, null);
  const dvTen = Object.keys(dvm.do_vat);
  const dimgs = await Promise.all(dvTen.map(t => anh('do-vat/' + t + '.png', dvm.do_vat[t].co_anh)));
  dvTen.forEach((t, i) => RM_NAP.dv[t] = {img: dimgs[i], w: dimgs[i].naturalWidth / 2, h: dimgs[i].naturalHeight / 2, neo: dvm.do_vat[t].neo});
  RM_NAP.dvMeta = dvm; RM_NAP.nen = nen; RM_NAP.gachRM = {meta: gm, img: gimg};
  let px = 0; for (const im of [...imgs, gimg, ...dimgs]) px += im.naturalWidth * im.naturalHeight;
  RM_NAP.so = {ms: Math.round(performance.now() - t0), mb_anh: +(px * 4 / 1048576).toFixed(1), so_anh: imgs.length + 1 + dimgs.length, o_gach: Object.keys(gm.o).length};
  return RM_NAP;
}
/* gộp atlas gạch Làng Chuông + Rễ Mục thành 1 canvas + 1 bảng ô (keoMepGach của demo chỉ nhận 1 atlas) */
function gopGach(lc) {
  const A = lc.gach.meta, B = RM_NAP.gachRM.meta, ia = lc.gach.img, ib = RM_NAP.gachRM.img;
  const cv = document.createElement('canvas'); cv.width = Math.max(ia.naturalWidth, ib.naturalWidth); cv.height = ia.naturalHeight + ib.naturalHeight;
  const g = cv.getContext('2d'); g.drawImage(ia, 0, 0); g.drawImage(ib, 0, ia.naturalHeight);
  const o = Object.assign({}, A.o);
  for (const [k, v] of Object.entries(B.o)) { const kh = v.khung.slice(); kh[1] += ia.naturalHeight; o[k] = Object.assign({}, v, {khung: kh}); }
  RM_NAP.gachMeta = Object.assign({}, A, {o}); RM_NAP.gachImg = cv;
}
/* gộp JSON trang trí cong-lang-v3 + re-muc-tt rồi nạp 1 lần qua TT.nap(nhung) (tên tệp atlas → URL) */
async function napTTGop(onTien) {
  const N = window.TV && TV.NHUNG && TV.NHUNG.tt;
  const [a, b] = await Promise.all([N ? N.json : fetch(SRC.tt, {cache: 'no-cache'}).then(r => { if (!r.ok) throw new Error('lỗi mạng ' + r.status + ' khi tải ' + SRC.tt); return r.json(); }),
    fetch(SRC.rmtt, {cache: 'no-cache'}).then(r => { if (!r.ok) throw new Error('lỗi mạng ' + r.status + ' khi tải ' + SRC.rmtt); return r.json(); })]);
  const gocA = SRC.tt.replace(/[^/]*$/, ''), gocB = SRC.rmtt.replace(/[^/]*$/, '');
  const anh = {};
  for (const v of Object.values(a.anh)) anh[v.tep] = N ? N.anh[v.tep] : gocA + v.tep;
  for (const v of Object.values(b.anh)) anh[v.tep] = gocB + v.tep;
  const json = {boi: 2, anh: Object.assign({}, a.anh, b.anh), o: Object.assign({}, a.o, b.o)};
  return TT.nap(null, {json, anh}, onTien);
}

/* ---------- nền Rễ Mục: 3 lớp cuộn ngang + dọc cùng hệ số; chuyển mờ với nền Làng Chuông khi đổi phòng ---------- */
const RMV = {pha: 0, dv: [], giotT: 0, manh: [], tt: 0};
function veLopRM(L, cx, cy, al) {
  const K = BK, w = L.w, h = L.h; let x = -(((cx * L.k) % w) + w) % w; const y0 = -cy * (L.kd || L.k);
  ctx.globalAlpha = al;
  for (; x < W; x += w) {
    const X = Math.round(x * K) / K, X1 = Math.round((x + w) * K) / K;
    for (let y = y0, i = 0; y < H && i < 4; y += h, i++) {
      if (!L.lapDoc && i > 0) break;
      const Y = Math.round(y * K) / K, Y1 = Math.round((y + h) * K) / K;
      ctx.drawImage(L.img, 0, 0, L.img.naturalWidth, L.img.naturalHeight, X, Y, X1 - X + 0.02, Y1 - Y + 0.02);
    }
  }
  ctx.globalAlpha = 1;
}
function veNenRM(ox, oy) {
  const p = RMV.pha;
  if (p < 1) for (const L of NEN.lop) veLop(L, ox, oy);
  if (p > 0) { ctx.fillStyle = 'rgba(14,16,18,' + p.toFixed(3) + ')'; ctx.fillRect(0, 0, W, H);
    for (const L of RM_NAP.lop) { if (THU.ganSau && L.ten === 're-muc-gan.png') continue; veLopRM(L, ox, oy, p); } }
}
RMV.tienCanh = function () {   // trả true = đang ở Rễ Mục (không vẽ tiền cảnh rễ treo Làng Chuông); ?gan=sau → vẽ lớp gần SAU gameplay
  if (RMV.pha <= 0) return false;
  if (THU.ganSau) { const L = RM_NAP.lop[2]; if (L) veLopRM(L, ox, oy, RMV.pha); }
  return RMV.pha >= 1;
};

/* ---------- TƯỜNG MỤC (ô 'M'): bám/trượt được; bám liên tục MUC_SO.GAY bước thì gãy (ô → 'r' không chặn, mảnh rơi), MAT bước sau mọc lại ---------- */
const MUC = {seg: [], o: {}};
MUC.dung = function () {   // gom các cột ô 'M' liền nhau thành đoạn; lộ bên nào = bên có ô trống
  MUC.seg.length = 0; MUC.o = {};
  for (let tx = RM.x0; tx < RM.x0 + RM.w; tx++) for (let ty = 0; ty < ROWS; ty++) {
    if (tile(tx, ty) !== 'M' || (ty > 0 && tile(tx, ty - 1) === 'M')) continue;
    let y1 = ty; while (tile(tx, y1 + 1) === 'M') y1++;
    const s = {tx, y0: ty, y1, lat: !solidC(tile(tx - 1, ty)), t: 0, st: 'lanh', tt: 0, bam: -1, id: MUC.seg.length};
    MUC.seg.push(s); for (let y = ty; y <= y1; y++) MUC.o[y * WW + tx] = s;
  }
};
MUC.bam = function () {   // gọi mỗi bước Lam đang bám / trượt tường
  const wd = pl.wallDir || pl.lastWall; if (!wd) return;
  const tx = wd > 0 ? Math.floor((pl.x + pl.w + 1) / T) : Math.floor((pl.x - 1) / T);
  const y0 = Math.floor(pl.y / T), y1 = Math.floor((pl.y + pl.h - 0.001) / T);
  for (let ty = y0; ty <= y1; ty++) { const s = MUC.o[ty * WW + tx]; if (s && s.st !== 'gay' && s.st !== 'moc') { s.t++; s.bam = S.frame; if (s.t >= MUC_SO.GAY) MUC.gay(s); return; } }
};
MUC.gay = function (s) {
  s.st = 'gay'; s.tt = 0; s.t = 0;
  for (let y = s.y0; y <= s.y1; y++) { G[y][s.tx] = 'r';
    const X = s.tx * T, Y = y * T, h = (s.lat ? -1 : 1), cho = (y - s.y0) * 2;   // mảnh ở trên rơi trước (dây chuyền 2 bước / ô)
    for (let i = 1; i <= 4; i++) RMV.manh.push({k: i, x: X + (i % 2 ? 8 : 24), y: Y + (i > 2 ? 24 : 8), vx: h * (0.8 + Math.random() * 2.2), vy: -1.5 - Math.random() * 2.5,
      r: (Math.random() - 0.5) * 0.6, vr: (Math.random() - 0.5) * 0.4, t: -cho, lat: s.lat});
    for (let i = 0; i < 3; i++) part(X + Math.random() * T, Y + Math.random() * T, h * Math.random() * 1.2, -Math.random(), 18 + Math.random() * 10 | 0, i ? '#5a4a3c' : '#4e8a76', 2, 0.06);
  }
  shake(s.lat ? -1 : 1, 0.3, 2); sfx.thud(); noise(0.18, 0.09, 'lowpass', 500);
  if (pl.wallDir && Math.sign(pl.wallDir) === (s.lat ? -1 : 1) && pl.x + pl.w / 2 >= (s.tx - 1) * T && pl.x + pl.w / 2 <= (s.tx + 2) * T) { pl.wallStickT = 99; pl.wallCoy = 0; }
};
MUC.buoc = function () {
  for (const s of MUC.seg) {
    if (s.st === 'gay') { if (++s.tt >= MUC_SO.MAT) {   // mọc lại – chỉ khi Lam / quái không đứng trong ô
        let ok = true; const X = s.tx * T, Y = s.y0 * T, Hh = (s.y1 - s.y0 + 1) * T;
        if (pl.x < X + T && pl.x + pl.w > X && pl.y < Y + Hh && pl.y + pl.h > Y) ok = false;
        for (const q of Q) if (!q.gone && q.x < X + T && q.x + q.w > X && q.y < Y + Hh && q.y + q.h > Y) ok = false;
        if (ok) { for (let y = s.y0; y <= s.y1; y++) G[y][s.tx] = 'M'; s.st = 'moc'; s.tt = 0; } } }
    else if (s.st === 'moc') { if (++s.tt >= MUC_SO.MOC) { s.st = 'lanh'; s.t = 0; s.tt = 0; } }
    else { if (s.bam !== S.frame && s.t > 0) s.t = Math.max(0, s.t - MUC_SO.HOI);
      s.st = s.t >= MUC_SO.NUT2 ? 'nut2' : s.t >= MUC_SO.NUT ? 'nut' : 'lanh'; }
  }
  for (let i = RMV.manh.length - 1; i >= 0; i--) { const m = RMV.manh[i]; m.t++; if (m.t <= 0) continue; m.vy = Math.min(m.vy + 0.35, 9); m.x += m.vx; m.y += m.vy; m.r += m.vr; m.vx *= 0.985;
    if (m.t > 80 || m.y > ROWS * T + 40) RMV.manh.splice(i, 1); }
};
MUC.ve = function (tx, ty, x0, y0, x1, y1) {   // vẽ thay ô gạch nếu là tường mục; trả true khi đã xử lý
  const c = G[ty] && G[ty][tx]; if (c !== 'M' && c !== 'r') return false;
  const s = MUC.o[ty * WW + tx]; if (!s) return false;
  ctx.fillStyle = '#17120f'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);   // hốc tối bên trong tường (gãy / đang mọc lại)
  if (s.st === 'gay') return true;
  const ten = s.st === 'nut2' ? 'rm-muc-nut-2' : s.st === 'nut' ? 'rm-muc-nut' : 'rm-muc-lanh';
  const q = GCH.k[GCH.o[ten]]; if (!q) return false;
  let dx = 0, al = 1;
  if (s.st === 'moc') al = Math.min(1, s.tt / MUC_SO.MOC);
  else if (s.t > 0) { const k = Math.min(1, s.t / MUC_SO.GAY); dx = Math.sin(S.frame * 1.9 + ty) * MUC_SO.RUNG * k * k; }
  ctx.globalAlpha = al;
  if (s.lat) { ctx.save(); ctx.translate(x1 + dx, y0); ctx.scale(-1, 1); ctx.drawImage(GCH.cv, q[0], q[1], 64, 64, 0, 0, x1 - x0, y1 - y0); ctx.restore(); }
  else ctx.drawImage(GCH.cv, q[0], q[1], 64, 64, x0 + dx, y0, x1 - x0, y1 - y0);
  ctx.globalAlpha = 1;
  return true;
};
MUC.veCollider = function (ox, oy) {   // overlay duyệt: đoạn tường mục = khung xanh ngọc (đứt = đang gãy, không chặn) + đồng hồ bám
  ctx.save(); ctx.lineWidth = 2; ctx.font = 'bold 10px ui-monospace,Menlo,monospace'; ctx.textBaseline = 'top';
  for (const s of MUC.seg) { const X = s.tx * T - ox, Y = s.y0 * T - oy, Hh = (s.y1 - s.y0 + 1) * T; if (X < -40 || X > W + 40) continue;
    ctx.strokeStyle = '#4fe3c0'; ctx.setLineDash(s.st === 'gay' ? [4, 4] : []); ctx.strokeRect(X + 1, Y + 1, T - 2, Hh - 2); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(12,15,20,.75)'; ctx.fillRect(X + (s.lat ? T + 2 : -70), Y + 2, 68, 13); ctx.fillStyle = '#4fe3c0';
    ctx.fillText('mục ' + s.st + ' ' + Math.round(s.t) + '/' + MUC_SO.GAY, X + (s.lat ? T + 4 : -68), Y + 3); }
  ctx.restore();
};
MUC.veManh = function (ox, oy) {
  for (const m of RMV.manh) { if (m.t <= 0) continue; const ten = 'rm-muc-manh-' + m.k, i = GCH.o[ten]; if (i === undefined) continue; const q = GCH.k[i], kh = RM_NAP.gachMeta.o[ten].khung;
    ctx.save(); ctx.globalAlpha = m.t > 60 ? Math.max(0, 1 - (m.t - 60) / 20) : 1; ctx.translate(m.x - ox, m.y - oy); ctx.rotate(m.r); if (m.lat) ctx.scale(-1, 1);
    ctx.drawImage(GCH.cv, q[0], q[1], kh[2], kh[3], -kh[2] / 4, -kh[3] / 4, kh[2] / 2, kh[3] / 2); ctx.restore(); }
  ctx.globalAlpha = 1;
};

/* ---------- đồ vật Rễ Mục + 2 hiệu ứng lặp nhỏ (giọt nước → vũng; bào tử kín → nổ khi Lam tới gần) ---------- */
RMV.dungDoVat = function () {
  const X = c => (RM.x0 + c) * T, Y = r => r * T;
  RMV.dv = [
    {ten: 'nam-nho', x: X(4) + 10, y: Y(14)},
    {ten: 'goc-re', x: X(17) + 20, y: Y(14)},                 // tầng trên (mặt khối phải) – ngõ cụt trang trí
    {ten: 'nam-nho', x: X(22), y: Y(14)},
    {ten: 'ken', x: X(20) + 8, y: Y(23), lac: 1},            // kén treo dưới trần hành lang, đung đưa nhẹ
    {ten: 'nam-lon', x: X(15) + 20, y: Y(32)},
    {ten: 'bao-tu', x: X(21) + 16, y: Y(32), kin: true, t: 0, bong: []},
    {ten: 'giot', x: X(27) + 24, y0: Y(23), y: Y(32)},        // giọt rơi từ trần (y0) xuống vũng trên sàn (y)
    {ten: 'nam-nho', x: X(31) + 16, y: Y(30)},                // trên bậc
    {ten: 'bao-tu', x: X(35) + 4, y: Y(32), kin: true, t: 0, bong: []},
    {ten: 'chuong-vo', x: X(40) - 6, y: Y(32)}                // sát tường phải cuối màn
  ];
};
RMV.buoc = function () {
  RMV.pha = clamp(RMV.pha + (S.room === RM.i ? 1 : -1) / 30, 0, 1);
  MUC.buoc();
  RMV.giotT = (RMV.giotT + 1) % RM_SO.GIOT_CHU_KY;
  for (const d of RMV.dv) {
    if (d.ten === 'bao-tu') {
      if (d.kin) { if (!pl.dead && Math.abs(pl.x + pl.w / 2 - d.x) < RM_SO.BAO_TU_GAN && Math.abs(pl.y + pl.h - d.y) < 90) { d.kin = false; d.t = 0;
          for (let i = 1; i <= 3; i++) d.bong.push({k: i, x: d.x + 10 + i * 8, y: d.y - 40 - i * 6, vx: 0.25 + i * 0.1, vy: -0.6 - i * 0.15, t: 0});
          noise(0.1, 0.05, 'bandpass', 900); } }
      else { if (++d.t >= RM_SO.BAO_TU_LAI) { d.kin = true; d.t = 0; d.bong.length = 0; } }
      for (const b of d.bong) { b.t++; b.x += b.vx + Math.sin(b.t * 0.1) * 0.3; b.y += b.vy; }
      d.bong = d.bong.filter(b => b.t < 90);
    }
  }
};
function veDV(ten, x, y, al, rot) {
  const o = RM_NAP.dv[ten]; if (!o) return;
  const ax = o.w / 2, ay = o.neo === 'dinh' ? 0 : o.neo === 'giua' ? o.h / 2 : o.h;
  if (al !== undefined) ctx.globalAlpha = al;
  if (rot) { ctx.save(); ctx.translate(x - ox, y - oy); ctx.rotate(rot); ctx.drawImage(o.img, -ax, -ay, o.w, o.h); ctx.restore(); }
  else ctx.drawImage(o.img, x - ox - ax, y - oy - ay, o.w, o.h);
  ctx.globalAlpha = 1;
}
RMV.ve = function (ox, oy) {   // vẽ SAU gạch + trang trí 'mat', TRƯỚC quái / Lam
  if (RMV.pha <= 0 || !RM_NAP.dv) return;
  ctx.imageSmoothingEnabled = true;
  for (const d of RMV.dv) {
    if (d.x - ox < -120 || d.x - ox > W + 120 || d.y - oy < -140 || d.y - oy > H + 140) continue;
    if (d.ten === 'bao-tu') { veDV(d.kin ? 'bao-tu-kin' : 'bao-tu-no', d.x, d.y);
      for (const b of d.bong) veDV('bong-' + b.k, b.x, b.y, Math.max(0, 1 - b.t / 90)); }
    else if (d.ten === 'giot') {
      const t = RMV.giotT, cham = 44;                       // chu kỳ 150: 0–10 giọt nhỏ đọng, 10–20 vừa, 20–cham rơi, cham–cham+10 bắn
      if (t < 10) veDV('giot-2', d.x, d.y0); else if (t < 20) veDV('giot-3', d.x, d.y0);
      else if (t < cham) { const k = (t - 20) / (cham - 20); veDV('giot-1', d.x, d.y0 + (d.y - 8 - d.y0) * k * k); }
      veDV(t >= cham && t < cham + 10 ? 'vung' : 'vung-yen', d.x, d.y + 2);
    }
    else if (d.lac) veDV(d.ten, d.x, d.y, 1, Math.sin(S.frame * 0.03 + d.x) * 0.035);
    else veDV(d.ten, d.x, d.y);
  }
  MUC.veManh(ox, oy);
};
function vaoRM() {   // ?vao=remuc: vào thẳng Rễ Mục (coi như boss đã hạ: không thức dậy; điểm lưu Rễ Mục sáng)
  boss.dead = true; boss.st = 'sleep';
  const b = BELLS[3]; for (const o of BELLS) o.on = false; b.on = true; S.cp = b;
  placePlayer((RM.x0 + 2) * T + 8, FLOOR - pl.h); pl.drawT = 0;
}
HINT.remuc = 'Tường mục: bám được nhưng giữ quá 2 giây sẽ GÃY (mọc lại sau 3 giây)';

/* ======================= THỬ (không ghép vào demo.html) ======================= */
const _newGame = newGame;
newGame = function () { _newGame(); if (THU.vao === 'remuc') vaoRM(); if (!THU.quai) for (const q of Q) { q.gone = true; q.dead = true; } for (const q of Q) q.H = null; boss.H = null; };

/* bot kịch bản (quay video): 'tha' = từ sàn vào chạy phải rơi xuống giếng, bám tường mục trái tới khi gãy, rơi xuống hành lang;
   'leo' = từ sàn vào nhảy xuống giếng bám tường phải rồi nhảy qua lại 2 tường mục (mỗi lần bám 12 bước → không gãy) LEO NGƯỢC LÊN sàn vào;
   'hanh-lang' = chạy phải hết hành lang (nhảy bậc, lên bệ ván treo), dừng ở chuông vỡ. Số ghi ở từng đoạn. */
const BOT = {on: false, s: '', t: 0, xong: false, giuJ: false, giuT: 0, pha: 0, x1: 0, n: 0};
function botTha() { for (const k of KEYS) kb[k] = 0; }
function botNhay() { if (!BOT.giuJ) { BOT.giuJ = true; BOT.giuT = 0; } }
function botGiu() { if (!BOT.giuJ) return; kb.j = 1; BOT.giuT++; if ((BOT.giuT > 2 && pl.vy >= 0 && !pl.onGround) || BOT.giuT > 30) BOT.giuJ = false; }   // giữ nút tới đỉnh nhảy (bước 1 nhảy chưa xảy ra → chưa xét vy)
function botBuoc() {
  if (!BOT.on || pl.dead) return; botTha(); BOT.t++; botGiu();
  const fx = pl.x + pl.w / 2, fy = pl.y + pl.h, X = c => (RM.x0 + c) * T;
  const dac = (x, y) => solidC(tile(Math.floor(x / T), Math.floor(y / T)));
  if (BOT.s === 'tha') {
    if (BOT.pha === 0) { kb.r = 1; if (fx > X(9) + 24) BOT.pha = 1; }
    else if (BOT.pha === 1) { kb.l = 1; const s = MUC.seg[0]; if (s && s.st === 'gay') { BOT.pha = 2; BOT.n = BOT.t; } }
    else { if (BOT.t - BOT.n < 10) kb.r = 1; if (pl.onGround && fy >= 32 * T - 1 && BOT.t - BOT.n > 40) { BOT.xong = true; BOT.on = false; botTha(); } }
    if (BOT.t > 900) { BOT.xong = true; BOT.on = false; botTha(); }
  } else if (BOT.s === 'leo') {
    const s0 = MUC.seg[0], s1 = MUC.seg[1];
    if (BOT.pha === 0) { kb.r = 1; if (fx > X(10)) BOT.pha = 1; }
    else if (BOT.pha === 1) {   // rơi xuống, bám tường phải (cột 13)
      kb.r = 1; if (pl.st === 'wall' && pl.wallDir > 0) { BOT.pha = 2; BOT.n = 0; } }
    else if (BOT.pha === 2) {   // nhảy qua lại 4 lần: mỗi lần chạm tường thì giữ 12 bước rồi nhảy sang tường kia
      const wd = pl.wallDir || pl.lastWall;
      if (pl.st === 'wall') { BOT.giuT2 = (BOT.giuT2 || 0) + 1; if (wd > 0) kb.r = 1; else kb.l = 1;
        if (BOT.giuT2 >= 12) { BOT.giuT2 = 0; BOT.n++; botNhay(); BOT.huong = -wd; } }   // giữ nút nhảy (botGiu) để không bị cắt nhảy
      else { BOT.giuT2 = 0; if (BOT.huong) { if (BOT.huong > 0) kb.r = 1; else kb.l = 1; } else kb.r = 1; }
      if (pl.onGround) { BOT.pha = 9; BOT.n = BOT.t; }   // lên tới sàn vào (hoặc rơi xuống hành lang) → xong
    }
    else if (BOT.pha === 3) {   // giữ bám cho tới khi gãy
      const wd = pl.wallDir || pl.lastWall; if (wd > 0) kb.r = 1; else kb.l = 1;
      if ((s0 && s0.st === 'gay') || (s1 && s1.st === 'gay')) { BOT.pha = 9; BOT.n = BOT.t; }
      if (pl.onGround) { BOT.pha = 9; BOT.n = BOT.t; }
    }
    else { if (pl.onGround && BOT.t - BOT.n > 50) { BOT.xong = true; BOT.on = false; botTha(); } }
    if (BOT.t > 1200) { BOT.xong = true; BOT.on = false; botTha(); }
  } else if (BOT.s === 'hanh-lang') {
    kb.r = 1;
    const vatCan = dac(fx + 50, fy - 4) || dac(fx + 50, fy - 40);
    const beX = X(24), beY = 29 * T;
    if (pl.onGround && !pl.jumping && vatCan) botNhay();
    if (pl.onGround && !pl.jumping && fx > beX - 150 && fx < beX - 40 && fy > beY + 10) botNhay();   // nhảy lên bệ ván treo
    if (fx >= BOT.x1 || BOT.t > 900) { BOT.xong = true; BOT.on = false; botTha(); }
  }
}
const _step = step;
step = function () { botBuoc(); _step(); };

/* ---------- API chụp / quay (TVTHU) ---------- */
if (THU.ghi) loop = function () {};
window.TVTHU = {
  thu: THU, bot: BOT, muc: MUC, rm: RMV,
  async batDau() { while (!(window.TVDEMO && TVDEMO.ready && loadEl.hidden)) await wait(50); audioInit(); startEl.hidden = true; S.paused = false; document.getElementById('warn').hidden = true; },
  /* đặt Lam đứng tại (x, y chân) thế giới, camera (camx, camy) kẹp trong phòng, đi 2 bước, vẽ 1 khung */
  datCam(x, y, camx, camy) { placePlayer(x, y - pl.h); pl.drawT = 0; pl.face = 1; const r = ROOMS[S.room];
    const cx = clamp(camx, r.x0 * T, (r.x0 + r.w) * T - W), cy = clamp(camy || 0, 0, (r.h || 17) * T - H);
    S.camx = S.pcx = cx; S.camy = S.pcy = cy; for (let i = 0; i < 2; i++) { savePrev(); step(); } S.camx = S.pcx = cx; S.camy = S.pcy = cy; RMV.pha = S.room === RM.i ? 1 : 0; render(1);
    return {camx: S.camx, camy: S.camy, ox, oy, x: pl.x, y: pl.y, room: S.room}; },
  khung(n) { for (let i = 0; i < (n || 1); i++) { savePrev(); step(); } render(1);
    return {f: S.frame, x: +pl.x.toFixed(1), y: +pl.y.toFixed(1), ox, oy, room: S.room, xong: BOT.xong, bot: BOT.s, pha: BOT.pha, st: pl.st, hp: pl.hp,
      muc: MUC.seg.map(s => [s.st, Math.round(s.t), s.tt])}; },
  batBot(s, x0, y0, x1) { if (x0 !== undefined) { placePlayer(x0, (y0 === undefined ? FLOOR : y0) - pl.h); pl.drawT = 0; } RMV.pha = S.room === RM.i ? 1 : 0;
    Object.assign(BOT, {on: true, s, t: 0, xong: false, giuJ: false, pha: 0, n: 0, x1: x1 || 0, huong: 0, giuT2: 0}); },
  tocMau() { pl.hp = P.maxHp; },
  hb(v) { hbSet(!!v); },
  mocLai() { for (const s of MUC.seg) if (s.st === 'gay') s.tt = MUC_SO.MAT; MUC.buoc(); for (const s of MUC.seg) { s.st = 'lanh'; s.t = 0; s.tt = 0; } },
  xam(v) { document.getElementById('cv').style.filter = v ? 'grayscale(1)' : ''; },
  so() { return {rm: RM_NAP.so, tt: TT.so, lc: LC_SO, qbr: QBR.so, bk: BK, seg: MUC.seg.map(s => ({tx: s.tx - RM.x0, y0: s.y0, y1: s.y1, lat: s.lat}))}; }
};
(function hienSo() { if (!(window.TVDEMO && TVDEMO.ready)) { setTimeout(hienSo, 100); return; } const p = document.createElement('p');
  p.style.cssText = 'font-size:13px;color:var(--soft)'; p.textContent = 'Bản THỬ Rễ Mục (sinh từ demo.html) – ?vao=remuc vào thẳng Rễ Mục · H bật collider · ?gan=sau vẽ lớp gần SAU Lam · ' +
    'Rễ Mục: ' + (RM_NAP.so ? RM_NAP.so.so_anh + ' ảnh, ' + RM_NAP.so.o_gach + ' ô gạch, nạp ' + RM_NAP.so.ms + ' ms, bộ nhớ ảnh ≈ ' + RM_NAP.so.mb_anh + ' MB' : 'chưa nạp');
  document.querySelector('#start .box').insertBefore(p, document.getElementById('btn-start')); })();
