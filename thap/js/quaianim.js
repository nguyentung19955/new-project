// TURRET MERGE — vẽ QUÁI/TRÙM mượt (ghi đè REN.veQuai).
// Khung ảnh đã "đăng ký" theo thân (docs/demo-hop-tuong/thap-art/dangky_khung.py) → thân đứng yên giữa các khung.
// Lớp code phủ thêm (theo THỜI GIAN THỰC, không theo bước mô phỏng → 2×/3× vẫn êm, không chớp nháy):
//  · nhịp khung theo tốc độ đi, có trần nhịp ở 2×/3×; hoà (cross-fade) 2 khung liền nhau
//  · nhún/nén nhẹ theo bước chân (≤3%), lắc lư nhẹ khi rẽ, cánh rung có vệt mờ cho quái bay
//  · trúng đòn: chớp trắng + giật lùi nhỏ có dịu; chết: nổ "pop" (phóng to + trắng + mờ dần) độc lập thời gian thực
//  · bóng mềm dưới mỗi quái (quái bay: bóng nhỏ/nhạt theo độ cao)
'use strict';

// quái có dải 8 khung mới (quai_<id>_8.png / trum_<id>_8.png) — thêm id khi ảnh có trong assets/
const QUAI8 = new Set(['bo', 'bay', 'bay_bang', 'khong_lo', 'tach', 'que_tach']);
// hệ số cỡ vẽ để thân bản 8 khung to bằng bản 4 khung cũ (đo: trung bình nhân tỉ lệ lõi thân & khung bao)
// 07/11 ảnh "không tay chân" (tools/thap-cat-trum2.py tính): cạnh lớn thân hiển thị = cỡ cũ ×~1.05 (trùm: 80 đơn vị cho cả 12)
const K8 = { bo: 0.708, bay: 0.776, bay_bang: 0.86, khong_lo: 1.175, tach: 0.86, que_tach: 1.108,
  mad_crown: 1.161, freezer: 1.21, janus: 0.993, joker_king: 1.147, nightmare: 1.038, octopus: 1.018,
  hive: 0.993, jammer: 1.024, prism: 1.035, twin_core: 1.008, patcher: 1.039, leech: 1.115 }; // trùm: id = E.id
const TRUM8 = new Set(['freezer', 'mad_crown', 'nightmare', 'octopus', 'janus', 'joker_king']);
// HƯỚNG NHÌN (Pass 5): dải 8 khung NGANG (đi sang phải; trái = lật) / SAU (đi lên) đã có trong assets/ — tools/thap-huong-quai.py tự cập nhật dòng dưới
const HUONG8 = new Set([]); // vd 'quai_bo_side', 'trum_octopus_back'
// vật thể KHÔNG tay chân (ảnh 07/11): mọi hướng (ngang/sau/trái) dùng chính dải đi trước — không lật mặt, không xoay
const HUONG_CHUNG = new Set(['quai_bo', 'quai_bay', 'quai_bay_bang', 'quai_khong_lo', 'quai_tach', 'quai_que_tach',
  'trum_mad_crown', 'trum_freezer', 'trum_janus', 'trum_joker_king', 'trum_nightmare', 'trum_octopus',
  'trum_hive', 'trum_jammer', 'trum_prism', 'trum_twin_core', 'trum_patcher', 'trum_leech']);
// dải TUNG CHIÊU trum_<id>_atk_16.png: 8 khung (1-2 lấy đà, 3-5 tung, 6-7 hồi, 8 trung tính), ô = ô dải đi × ATK_K (hiệu ứng tràn ngoài thân)
const ATK_K = 1.5;
const ATK_SEQ = [0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 6, 7]; // tiến độ chiêu (16 nấc) → khung; dải 16 khung cũ: phát thẳng
const HUONG_NGHIENG = 0.139; // dải chưa có: dùng dải TRƯỚC nghiêng ≤ 8° về phía đi
const HUONG_HOA = 0.12;      // hoà 120 ms khi đổi hướng nhìn ở khúc rẽ
// ---- TRÙM HOẠT ẢNH BẰNG CODE (thử 08/11, tuvan/trum-anim-code) ----
// Dải đi gen từng khung → hoa văn/ngọc đổi hình giữa các khung ("sôi"). Ở đây vẽ 1 ẢNH GỐC trum_<id>_m.png (cắt từ 1 khung dải đi,
// tools/thap-trum-master.py) và chỉ biến đổi nó: hoa văn không thể trôi. Có cấu hình + ảnh gốc đã nạp → dùng; không → dải khung như cũ.
//  kieu 'lan'  quả cầu LĂN: góc = quãng đường / bán kính (r = bán kính / cạnh ô); bóng sáng/tối cố định không xoay (PNG fx_cham_trang, cắt theo thân)
//  kieu 'bay'  LƠ LỬNG: nhấp nhô sin, nghiêng theo hướng đi, giãn/nén khi rẽ, thở; bóng đất nhỏ lại khi lên cao
//  kieu 'nhay' NHẢY (thạch): nhịp = nhip (lần/giây) + quãng đường / (buoc × cạnh ô), nén–giãn neo ở đáy; vương miện rời (vm = điểm neo) trễ nhịp
//  sang: lớp sáng trum_<id>_m_sang.png nhấp nháy ('lighter'), bùng lên lúc lấy đà chiêu. day = đáy thân / cạnh ô (neo nén–giãn).
// Chiêu: lấy đà (nén, ngả ra sau, lõi sáng dần, rung) → tung lúc chiêu nổ (giãn + chớp + lao về bàn rồi lò xo về) → lắng. Trúng đòn: chớp trắng + nén.
// Mọi thứ theo THỜI GIAN THỰC / QUÃNG ĐƯỜNG (không đếm khung) → 30/60 FPS, 1×/3× như nhau. Chỉ hình — mô phỏng không đổi.
const TRUM_ANIM_CODE = {
  hive: { kieu: 'lan', r: 0.457, day: 0.457, sang: 1 },
  prism: { kieu: 'bay', day: 0, sang: 1 },
  mad_crown: { kieu: 'nhay', day: 0.41, buoc: 0.6, nhip: 0.8, vm: [0.607, 0.431], sang: 1 },
};
const TRUM_ANIM_BAT = (() => { try { return new URLSearchParams(location.search).get('trumanim') !== '0'; } catch (e) { return true; } })(); // ?trumanim=0 → dải khung cũ (so sánh)
const eoBack = (u) => { const c = 1.70158; u -= 1; return 1 + (c + 1) * u * u * u + c * u * u; };
const eoIO = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
// nhịp nhảy thạch: u ∈ [0,1) → [độ cao 0..1, nén (+) / giãn (−)]
const nhipNhay = (u) => {
  if (u < 0.2) return [0, Math.sin(Math.PI * u / 0.2) * 0.13];
  if (u < 0.85) { const v = (u - 0.2) / 0.65; return [Math.sin(Math.PI * v), -0.075 * Math.abs(Math.cos(Math.PI * v))]; }
  return [0, Math.sin(Math.PI * (u - 0.85) / 0.15) * 0.2];
};

Object.assign(REN, {
  _xac: [],
  _nut: [], // trùm đang phát dải ĐÁNH tại chỗ chết (TWIN CORE nứt lõi → tách đôi), thời gian thực
  NUT_S: 0.75,
  nutTrum(E) {
    const g = 'trum_' + E.trum + '_atk_16'; if (!this.img(g)) return false;
    E._pop = 1; // thay cho "xác nổ" thường
    this._nut.push({ x: E.x, y: E.y, co: E.d.co * (K8[E.d.anh || E.trum] || 1) * ATK_K, g, t: 0 });
    return true;
  },
  // bóng mềm = ảnh fx_cham_trang tô đen (PNG, không còn gradient vẽ code); chưa nạp → không vẽ bóng
  bong1() { return PX.mau('fx_cham_trang', '#000000'); },
  // tên dải ảnh dùng cho quái: ưu tiên bản 8 khung nếu đã nạp được
  tenQuai(E) {
    const goc = E.trum ? 'trum_' + E.trum : 'quai_' + (E.d.anh || E.id);
    const co8 = E.trum ? TRUM8.has(E.trum) : QUAI8.has(E.d.anh || E.id);
    // trùm mới chỉ có dải 8 hướng (không có trum_<id>.png cũ): chưa nạp xong vẫn trả tên _8 (vẽ bỏ qua 1 khung) — trước đây rơi về tên cũ → tải 404 lặp lại (QA ngâm)
    if (co8) { const a = this.img(goc + '_8'); if (a || (E.trum && typeof TRUM_ANH !== 'undefined' && TRUM_ANH.has(E.trum))) return goc + '_8'; }
    return goc;
  },
  // ảnh hướng nhìn cần nạp trước (ui.js chuẩn bị trận)
  dsHuong() {
    const ds = []; for (const k of HUONG8) ds.push(k + '_8');
    // dải đánh trum_<id>_atk_16 KHÔNG nạp hết ở đây (12 dải lớn → tốn bộ nhớ iPhone): nongskill.js làm nóng trùm sắp tới; chưa nạp → vẽ dải đi
    if (typeof TRUM_FX !== 'undefined') for (const id of TRUM_FX) ds.push('fx_trum_' + id); // hiệu ứng chiêu rời (tải nền cùng ảnh trùm)
    return ds;
  },
  // khung dải chiêu theo tiến độ u (0..1)
  khungDanh(u, nf) { const i = Math.min(15, Math.max(0, Math.floor(u * 16))); return nf === 8 ? ATK_SEQ[i] : Math.min(nf - 1, Math.floor(clamp(u, 0, 1) * nf)); },
  // dải ĐÁNH của trùm (thân tung chiêu, nhìn về BÀN ụ) — chỉ phát trong lúc báo chiêu; chưa có → null
  tenDanh(E) {
    if (!E.trum || typeof TRUM_ATK === 'undefined' || !TRUM_ATK.has(E.trum)) return null;
    const g = 'trum_' + E.trum + '_atk_16'; return this.img(g) ? g : null;
  },
  // chọn hướng nhìn từ hướng đi trên đoạn đường: 'f' trước (xuống) · 's' ngang (lat ±1) · 'b' sau (lên)
  // trễ (hysteresis): chỉ đổi khi một trục trội rõ (×1.25) và đã giữ hướng cũ ≥ 150 ms → không chớp ở góc
  huongQuai(E, t) {
    const dx = Math.cos(E.goc), dy = Math.sin(E.goc), ax = Math.abs(dx), ay = Math.abs(dy);
    let v = E._hv || 'f', l = E._hl || 1;
    if (ax > ay * 1.25) { v = 's'; l = dx < 0 ? -1 : 1; } else if (ay > ax * 1.25) v = dy > 0 ? 'f' : 'b';
    if (E.trum) { if (E._t0 == null) E._t0 = t; if (t - E._t0 < 0.9 || E.bao) v = 'f'; } // trùm: vừa vào / tung chiêu → nhìn ra màn hình
    if (!E._hv) { E._hv = v; E._hl = l; E._hvT = -9; return; }
    if ((v !== E._hv || (v === 's' && l !== E._hl)) && t - E._hvT > 0.15) {
      E._hvCu = E._hv; E._hlCu = E._hl; E._hvT = t; E._hv = v; E._hl = l;
    }
  },
  // dải của hướng v cho quái (ten = dải trước): có ảnh hướng đó → tên dải đó, không → null (dùng dải trước + nghiêng)
  tenHuong(ten, v) {
    if (v === 'f' || !ten.endsWith('_8')) return null;
    if (HUONG_CHUNG.has(ten.slice(0, -2))) return ten; // không tay chân: dải trước cho mọi hướng
    if (!HUONG8.size) return null;
    const g = ten.slice(0, -2) + (v === 's' ? '_side' : '_back');
    return HUONG8.has(g) && this.img(g + '_8') ? g + '_8' : null;
  },
  // dải NGANG quay TRÁI thật (ChatGPT vẽ riêng, cho quái/trùm không đối xứng) — có thì dùng thay vì lật dải phải
  tenTrai(ten) {
    if (!ten.endsWith('_8')) return null; if (HUONG_CHUNG.has(ten.slice(0, -2))) return ten; // không lật (mặt/chữ không bị soi gương)
    const g = ten.slice(0, -2) + '_left';
    return HUONG8.has(g) && this.img(g + '_8') ? g + '_8' : null;
  },
  // vẽ thân 1 hướng nhìn tại gốc toạ độ hiện tại: cánh mờ (quái bay), khung + hoà khung kế, chớp trắng; al = độ mờ chung
  veThan(ctx, daiV, wTen, fV, f1, fr, C, bay, dong, fl, al, chiDai) {
    if (bay && !dong) { ctx.globalAlpha = 0.22 * al; this.khung0(ctx, daiV, fV + 1, C * 1.035); }
    ctx.globalAlpha = al; this.khung0(ctx, daiV, fV, C);
    if (chiDai && f1 >= 0 && fr > 0.01) { ctx.globalAlpha = fr * al; this.khung0(ctx, daiV, f1, C); }
    if (chiDai && fl > 0.02) { const w = this.coDai(wTen.ten, wTen.px, 'trang'); if (w) { ctx.globalAlpha = fl * al; this.khung0(ctx, w, fr > 0.5 && f1 >= 0 ? f1 : fV, C); } }
  },
  // vẽ khung f của dải (đã thu nhỏ sẵn) tại gốc toạ độ hiện tại, cỡ co
  khung0(ctx, dai, f, co) {
    const n = dai.nf, fw = dai.fm, st = dai.fm + dai.gap;
    f = ((f % n) + n) % n;
    ctx.drawImage(dai, f * st, 0, fw, dai.height, -co / 2, -co / 2, co, co);
  },

  // ---- trùm hoạt ảnh bằng code: tính trạng thái (trước khi vẽ bóng) — null nếu không áp dụng / ảnh gốc chưa nạp ----
  cdTinh(E, cf, co, kc, sc, he, t, dt, x, y) {
    const g = 'trum_' + E.trum + '_m';
    if (!this.img(g) || (cf.sang && !this.img(g + '_sang')) || (cf.vm && !this.img(g + '_vm'))) return null;
    const Cb = co * kc, C = Cb * sc;
    // quãng đường thật (vị trí nội suy) + chiều lăn
    if (E._cdX == null) { E._cdX = x; E._cdY = y; E._cdQ = 0; E._cdA = 0; E._cdSg = 1; E._cdW = 0; E._cdG = E.gv != null ? E.gv : E.goc; E._cdL = 0; E._cdT = 0; }
    let dx = x - E._cdX, dy = y - E._cdY, d = Math.hypot(dx, dy); E._cdX = x; E._cdY = y;
    if (d > Cb) d = dx = dy = 0; // nhảy vị trí (kéo lùi / đổi bàn): không quay vọt
    if (Math.abs(dx) > 0.05) E._cdSg = dx > 0 ? 1 : -1;
    E._cdQ += d;
    if (cf.kieu === 'lan') E._cdA += (dx + (d - Math.abs(dx)) * E._cdSg) / (cf.r * Cb);
    // tốc độ rẽ (rad/s, làm mượt) → giãn/nén + nghiêng vào cua
    const gv = E.gv != null ? E.gv : E.goc, kd = 1 - Math.exp(-dt * 10);
    if (dt > 0) E._cdW += (clamp(gocLech(E._cdG, gv) / dt, -6, 6) - E._cdW) * kd;
    E._cdG = gv;
    const R = { g, C, Cb, ox: 0, oy: 0, rot: 0, sx: 1, sy: 1, sang: 0.3, fl: he * he * 0.45, bs: 1, cao: 0 };
    let nen = 0.06 * he; // trúng đòn: nén
    // ---- chiêu: lấy đà → tung (lúc chiêu nổ = E.bao vừa hết) → lắng ----
    const B = G.ban[E.ban], c = B && B.o && B.o[7], gb = c ? Math.atan2(c.y - y, c.x - x) : Math.PI / 2;
    if (E.bao) {
      const u = clamp(E.bao.t / (E.bao.song || 1.4), 0, 1), w = eoIO(Math.min(1, u / 0.9));
      E._cdBao = 1; E._cdGb = gb;
      nen += 0.13 * w; R.sang += 0.9 * w;
      R.ox -= Math.cos(gb) * C * 0.05 * w; R.oy -= Math.sin(gb) * C * 0.05 * w; // lùi lấy đà
      R.rot -= Math.sign(Math.cos(gb) || 1) * 0.1 * w;                          // ngả ra sau
      if (u > 0.7) { const z = (u - 0.7) / 0.3; R.ox += Math.sin(t * 95) * C * 0.008 * z; R.oy += Math.cos(t * 83) * C * 0.006 * z; } // rung trước khi tung
    } else if (E._cdBao) { E._cdBao = 0; E._cdRel = t; }
    if (E._cdRel != null) {
      const r = t - E._cdRel;
      if (r < 0.6) {
        const lx = Math.exp(-7 * r) * Math.cos(17 * r), gb2 = E._cdGb != null ? E._cdGb : gb;
        nen -= 0.17 * lx;                                  // giãn bật ra rồi lò xo về
        const lao = Math.sin(Math.min(1, r / 0.09) * Math.PI / 2) * (1 - eoBack(Math.min(1, r / 0.6))) + Math.exp(-10 * r) * 0.6;
        R.ox += Math.cos(gb2) * C * 0.07 * lao; R.oy += Math.sin(gb2) * C * 0.07 * lao; // lao về bàn rồi giật về
        R.fl = Math.max(R.fl, 0.75 * Math.pow(Math.max(0, 1 - r / 0.25), 2)); R.sang += 1.2 * Math.exp(-6 * r);
      } else E._cdRel = null;
    }
    const st = clamp(Math.abs(E._cdW) * 0.025, 0, 0.07); // rẽ: giãn ngang
    if (cf.kieu === 'bay') {
      const h = 0.5 + 0.5 * Math.sin(t * 2.3 + E.uid);
      R.cao = h; R.oy -= C * (0.03 + 0.05 * h); R.bs = 1 - 0.18 * h;
      E._cdL += (clamp(Math.cos(gv) * 0.09 + E._cdW * 0.03, -0.14, 0.14) - E._cdL) * (1 - Math.exp(-dt * 5));
      R.rot += E._cdL + Math.sin(t * 1.3 + E.uid) * 0.02;
      const tho = 0.018 * Math.sin(t * 1.7 + E.uid);
      R.sx = (1 + tho + st) * (1 + nen * 0.8); R.sy = (1 + tho - st) * (1 - nen);
      R.sang += 0.25 + 0.25 * Math.sin(t * 3.3 + E.uid);
    } else if (cf.kieu === 'nhay') {
      E._cdP = (E._cdP || 0) + (E.bao ? 0.15 : 1) * (dt * (cf.nhip || 0) + d / (cf.buoc * Cb)); // nhịp = nền theo giờ + theo quãng (3× nhảy dồn hơn); lấy đà chiêu: gần như đứng
      const u = E._cdP - Math.floor(E._cdP);
      const [h, q] = nhipNhay(u), [, qL] = nhipNhay((u - 0.08 + 1) % 1);
      R.cao = h; R.oy -= h * C * 0.14; R.bs = 1 - 0.35 * h;
      R.sx = 1 + (q + nen) * 0.85 + st; R.sy = 1 - q - nen;
      R.sxL = 1 + (qL + nen) * 0.85; R.syL = 1 - qL - nen; // vương miện theo nhịp trễ 8% → lắc theo quán tính
      R.vmRot = (qL - q) * 1.6 + Math.sin(t * 2.1 + E.uid) * 0.03;
      R.rot += clamp(E._cdW * 0.03, -0.08, 0.08);
      R.sang += 0.2 + 0.2 * Math.sin(t * 2.6 + E.uid);
    } else { // lan
      R.sx = 1 + nen * 0.85 + st * 0.5; R.sy = 1 - nen;
      R.sang += 0.15 + 0.15 * Math.sin(t * 2.4 + E.uid);
    }
    R.sang = clamp(R.sang, 0, 1.6);
    return R;
  },
  // vẽ trùm code tại (x,y): neo nén–giãn ở đáy thân
  cdVe(ctx, E, cf, R, M, x, y) {
    const C = R.C, Cb = R.Cb, g = R.g, b = cf.day * C;
    const than = this.co(g, Cb), sang = cf.sang && this.co(g + '_sang', Cb); if (!than) return;
    const dat = (rot2, sx, sy) => { ctx.setTransform(M); ctx.translate(x + R.ox, y + R.oy + b); ctx.rotate(R.rot + (rot2 || 0)); ctx.scale(sx, sy); ctx.translate(0, -b); };
    let anh = than;
    if (cf.kieu === 'lan') { // thân quay theo quãng đường trong canvas tạm, phủ bóng sáng/tối CỐ ĐỊNH (cắt theo thân)
      const n = than.width, o = this._cdO || (this._cdO = document.createElement('canvas'));
      if (o.width !== n) { o.width = n; o.height = n; }
      const x2 = o.getContext('2d'); x2.setTransform(1, 0, 0, 1, 0, 0); x2.globalCompositeOperation = 'source-over'; x2.globalAlpha = 1; x2.clearRect(0, 0, n, n);
      x2.translate(n / 2, n / 2); x2.rotate(E._cdA); x2.drawImage(than, -n / 2, -n / 2); x2.setTransform(1, 0, 0, 1, 0, 0);
      x2.globalCompositeOperation = 'source-atop';
      x2.globalAlpha = 0.55; x2.drawImage(this.bong1(), n * 0.12, n * 0.18, n * 1.15, n * 1.15);          // tối dưới-phải
      x2.globalAlpha = 0.3; x2.drawImage(this.cham1('#fff3cf'), n * 0.06, n * 0.02, n * 0.55, n * 0.55);   // bóng sáng trên-trái
      x2.globalCompositeOperation = 'source-over'; x2.globalAlpha = 1;
      anh = o;
    }
    const xoay = cf.kieu === 'lan' ? E._cdA : 0;
    dat(0, R.sx, R.sy); ctx.globalAlpha = 1; ctx.drawImage(anh, -C / 2, -C / 2, C, C);
    if (sang && R.sang > 0.01) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, R.sang);
      if (xoay) ctx.rotate(xoay); ctx.drawImage(sang, -C / 2, -C / 2, C, C);
      if (R.sang > 1) { ctx.globalAlpha = R.sang - 1; ctx.drawImage(sang, -C * 0.55, -C * 0.55, C * 1.1, C * 1.1); }
      ctx.restore();
    }
    if (R.fl > 0.02) { const w = this.co(g, Cb, 'trang'); if (w) { ctx.globalAlpha = R.fl; if (xoay) ctx.rotate(xoay); ctx.drawImage(w, -C / 2, -C / 2, C, C); } }
    if (cf.vm) { // vương miện rời: đặt ở điểm neo đã biến đổi theo nhịp TRỄ, không nén (vật cứng)
      const vm = this.co(g + '_vm', Cb);
      if (vm) {
        const px = (cf.vm[0] - 0.5) * C, py = (cf.vm[1] - 0.5) * C;
        dat(0, 1, 1); ctx.translate(px * R.sxL, b + (py - b) * R.syL); ctx.rotate(R.vmRot);
        ctx.globalAlpha = 1; ctx.drawImage(vm, -C / 2 - px, -C / 2 - py, C, C);
        if (R.fl > 0.02) { const w = this.co(g + '_vm', Cb, 'trang'); if (w) { ctx.globalAlpha = R.fl; ctx.drawImage(w, -C / 2 - px, -C / 2 - py, C, C); } }
      }
    }
    ctx.setTransform(M); ctx.globalAlpha = 1;
  },
  // ảnh chụp thân hiện tại (cho "xác nổ" lúc chết): 1 khung, cùng định dạng dải
  cdChup(E, cf, co, kc) {
    const g = 'trum_' + E.trum + '_m', than = this.co(g, co * kc); if (!than) return null;
    const n = than.width, c = document.createElement('canvas'); c.width = n; c.height = n;
    const x2 = c.getContext('2d'); x2.translate(n / 2, n / 2); if (cf.kieu === 'lan') x2.rotate(E._cdA || 0);
    x2.drawImage(than, -n / 2, -n / 2); x2.setTransform(1, 0, 0, 1, 0, 0);
    const vm = cf.vm && this.co(g + '_vm', co * kc); if (vm) x2.drawImage(vm, 0, 0, n, n);
    c.nf = 1; c.fm = n; c.gap = 0;
    return c;
  },
  // trạng thái trên quái bằng ảnh tờ ST (fx_st_*): danh sách cần vẽ cho quái E
  stV2(E, lanh) {
    const c = (k) => typeof FXU !== 'undefined' && FXU.co('fx_st_' + k) && this.img('fx_st_' + k);
    const s = { n: 0 };
    if (E.chan > 0) { if (lanh && c('dong')) s.dong = 1; else if (c('choang')) s.choang = 1; }
    if (lanh && !s.dong && c('cham')) s.cham = 1;
    if (E.docT > 0 && c('doc')) s.doc = 1;
    if (E.chayT > 0 && c('chay')) s.chay = 1;
    if ((E.cvT > 0 || E.cvPT > 0) && c('cauvong')) s.yeu = 'cauvong'; else if (E.giapT > 0 && c('khienvang')) s.yeu = 'khienvang'; else if (E.yeu > 0 && c('yeu')) s.yeu = 'yeu';
    // VFX P0 (REVIEW-VFX-93 II.I): tối đa 2 dấu trạng thái mỗi quái — ưu tiên khống chế cứng > sát thương theo thời gian > dấu suy yếu > chậm
    //  (mỗi trạng thái 1 hình riêng: đóng băng = khối tinh thể · choáng = sao vàng quay · cháy = lửa · độc = bọt xanh · lộ/dấu = vòng tím nứt / cầu vồng / khiên vàng · chậm = vòng gió lạnh)
    let n = 0;
    for (const k of ['dong', 'choang', 'chay', 'doc', 'yeu', 'cham']) { if (!s[k]) continue; if (n >= 2) s[k] = 0; else n++; }
    s.n = n;
    return s;
  },
  // vẽ: cỡ = co × 1.1, alpha 0.85, thở ±6% 2 Hz; choáng xoay 120°/s trên đầu; đóng băng phủ lên thân
  veStV2(ctx, E, s, x, y, co, t) {
    const tho = 1 + 0.06 * Math.sin(t * 12.6 + E.uid), C = co * 1.02 * tho;
    if (s.cham) this.anhGiua(ctx, 'fx_st_cham', x, y, C, t * 0.4, 0.85);
    if (s.doc) this.anhGiua(ctx, 'fx_st_doc', x, y, C, 0, 0.85);
    if (s.chay) this.anhGiua(ctx, 'fx_st_chay', x, y - co * 0.05, C, 0, 0.85);
    if (s.yeu) this.anhGiua(ctx, 'fx_st_' + s.yeu, x, y, C * 1.05, s.yeu === 'cauvong' ? t * 1.2 : 0, s.yeu === 'khienvang' ? 0.55 : 0.6);
    if (s.dong) this.anhGiua(ctx, 'fx_st_dong', x, y, co * 1.05, 0, 0.8);
    if (s.choang) this.anhGiua(ctx, 'fx_st_choang', x, y - co * 0.42, co * 0.75, 0.12 * Math.sin(t * 6), 0.95);
    ctx.globalAlpha = 1;
  },
  veQuai(ctx) {
    const dt = this.dt || 0, k = G.tocDo || 1, t = this.t;
    // xác đang nổ (thời gian thực) — vẽ dưới quái sống
    for (let i = this._xac.length - 1; i >= 0; i--) {
      const X = this._xac[i]; X.t += dt;
      if (X.t >= 0.3) { this._xac.splice(i, 1); continue; }
      const u = X.t / 0.3, e = 1 - (1 - u) * (1 - u) * (1 - u);
      const sc = 1 + 0.32 * e, al = (1 - u) * (1 - u);
      ctx.save(); ctx.translate(X.x, X.y); if (X.goc) ctx.rotate(X.goc); if (X.lat < 0) ctx.scale(-1, 1);
      ctx.globalAlpha = al; this.khung0(ctx, X.dai, X.f, X.co * sc);
      if (X.w) { ctx.globalAlpha = al * (0.9 - 0.6 * u); this.khung0(ctx, X.w, X.f, X.co * sc); }
      ctx.restore();
      if (X.t - dt <= 0) FX.vong1(X.x, X.y, X.co * 0.2, X.co * 0.9, '#ffffff', 0.25, 3);
    }
    for (let i = this._nut.length - 1; i >= 0; i--) { // dải đánh tại chỗ chết: khung theo tiến độ, mờ 25% cuối
      const N = this._nut[i]; N.t += dt; const u = N.t / this.NUT_S;
      if (u >= 1) { this._nut.splice(i, 1); continue; }
      const d = this.coDai(N.g, N.co); if (!d) continue;
      ctx.save(); ctx.translate(N.x, N.y); ctx.globalAlpha = u < 0.75 ? 1 : 1 - (u - 0.75) / 0.25;
      this.khung0(ctx, d, this.khungDanh(u, d.nf), N.co * (1 + 0.08 * u)); ctx.restore();
    }
    ctx.globalAlpha = 1;
    const bong = this.bong1(), dong = G.quai.length > 30, M = ctx.getTransform();
    for (const E of G.quai) {
      const co = E.d.co, bay = E.d.bay, ten = this.tenQuai(E);
      const kc = ten.endsWith('_8') ? K8[E.d.anh || E.id] || 1 : 1; // bản 8 khung: chỉnh cỡ cho bằng bản cũ
      const dai = this.coDai(ten, co * kc);
      // ---- chết: chuyển thành "xác nổ" chạy theo thời gian thực (lọt cổng thì biến mất luôn) ----
      if (E.chet) {
        if (!E._pop && E.tChet < 0.25 && dai) {
          E._pop = 1;
          // nổ đúng hướng nhìn + đúng dải đang vẽ: chết giữa lúc tung chiêu → dải chiêu ở cỡ ×ATK_K (trước đây vẽ dải chiêu ở cỡ dải đi → trùm co lại 1/1.5 khi chết)
          const cfX = E._cdOn && TRUM_ANIM_CODE[E.trum], sX = cfX && this.cdChup(E, cfX, co, kc); // trùm vẽ bằng code: nổ đúng ảnh đang thấy
          if (sX) { this._xac.push({ x: E.x + (E._cdOx || 0), y: E.y + (E._cdOy || 0), goc: E._gv || 0, lat: 1, co: co * kc * (E._sc || 1), f: 0, t: 0, dai: sX, w: this.toBien(sX, 'trang') }); continue; }
          const kX = E._kHv || 1, tX = E._tHv || ten, dX = this.coDai(tX, co * kc * kX) || dai;
          this._xac.push({ x: E.x, y: E.y + (E._oy || 0), goc: E._gv || 0, lat: E._lat || 1, co: co * kc * kX * (E._sc || 1), f: E._f || 0, t: 0, dai: dX, w: this.coDai(tX, co * kc * kX, 'trang') });
        }
        continue;
      }
      // ---- nhịp khung (thời gian thực): theo tốc độ đi, có trần ở 2×/3× ----
      const n = dai ? dai.nf : 4;
      let v = E.d.v * (1 - (E.d.khangCham ? 0 : E.cham)); if (E.chan > 0) v = E.trum ? v * 0.5 : 0;
      const nhip = (2 + v / 10) / 4; // vòng/giây ở 1× (như cũ: 4 khung)
      const tran = bay ? 3.2 : 2.4;  // trần vòng/giây ở tốc độ cao → không chớp nháy
      if (E._ph == null) E._ph = Math.random();
      E._ph += dt * Math.min(nhip * k, Math.max(nhip, tran));
      // ---- trúng đòn: phát hiện cú đánh mới (flash vừa được đặt lại) ----
      if (E.flash > (E._fl || 0) + 1e-4) E._hitT = t;
      E._fl = E.flash;
      const hk = E._hitT != null ? Math.max(0, 1 - (t - E._hitT) / 0.16) : 0, he = hk * hk;
      // ---- hướng & vị trí ----
      // hướng nhìn theo hướng đi trên đường (DCDW): trước/ngang/sau — KHÔNG xoay cả hình nữa; dải hướng chưa có → dải trước nghiêng ≤ 8°
      this.huongQuai(E, t);
      const ngD = E._hv === 's' ? E._hl * (this.tenHuong(ten, 's') ? 0.035 : HUONG_NGHIENG) : 0;
      E._ng = E._ng == null ? ngD : E._ng + (ngD - E._ng) * Math.min(1, dt * 12);
      const gv = E._ng;
      // độ rẽ (để lắc lư nhẹ vào khúc cua)
      const r = E.trum ? 0 : clamp(gocLech(E.gv != null ? E.gv : E.goc, E.goc), -0.8, 0.8);
      const buoc = Math.sin(E._ph * Math.PI * 2 * 2); // 2 bước / vòng khung
      const hover = bay ? -6 + Math.sin(t * 3.1 + E.uid) * 2.2 : 0;
      const kb = he * Math.min(3, co * 0.06); // giật lùi
      const hx = Math.cos(E.goc), hy = Math.sin(E.goc);
      let x = E.x - (E.trum ? 0 : hx * kb), y = E.y + hover - (E.trum ? kb * 0.4 : hy * kb);
      let sc = 0.6 + 0.4 * (E.vao * E.vao * (3 - 2 * E.vao)); // xuất hiện êm
      sc *= 1 - 0.035 * he; // nén nhẹ khi trúng đòn
      const cf = E.trum && TRUM_ANIM_BAT ? TRUM_ANIM_CODE[E.trum] : null, cd = cf ? this.cdTinh(E, cf, co, kc, sc, he, t, dt, x, y) : null;
      E._cdOn = !!cd; if (cd) { E._cdOx = cd.ox; E._cdOy = cd.oy; }
      // ---- bóng ----
      const bco = co * (bay ? 0.62 : 0.78) * sc * (bay ? 1 - (hover + 6) * 0.02 : 1) * (cd ? cd.bs : 1); // trùm code: bóng nhỏ lại khi nảy/bay lên
      ctx.globalAlpha = (bay ? 0.32 : 0.5) * (cd ? 0.6 + 0.4 * cd.bs : 1);
      if (bong) ctx.drawImage(REN.mip(bong, bco * REN.s * REN.dpr), E.x + 2 - bco / 2, E.y + 4 + (bay ? 8 : 0) - bco * 0.42, bco, bco * 0.84);
      ctx.globalAlpha = 1;
      // ---- quầng báo chiêu của trùm ----
      if (E.bao) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        PX.cham(ctx, x, y, co * 1.8, TRUM[E.trum].mau, 0.6 + 0.4 * Math.sin(t * 20)); ctx.restore(); // quầng = fx_cham_trang tô màu trùm
        ctx.globalAlpha = 1;
      }
      const lanh = E.cham > 0 && !E.d.khangCham;
      const st = this.stV2(E, lanh); // trạng thái v2 (ảnh ChatGPT tờ ST) → vẽ sau thân, bỏ quầng/hạt code
      if (lanh) {
        if (!E._lanhT) { E._lanhT = t; FX.no('bang_vo', x, y, co * 0.8, 0.19); }
        if (!st.cham) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.2;
          this.anhGiua(ctx, this.cham1('#78D9F5'), x, y, co * 0.75); ctx.restore(); ctx.globalAlpha = 1; }
      } else E._lanhT = 0;
      if ((E.yeu > 0 || E.cvT > 0 || E.cvPT > 0 || E.giapT > 0) && !st.yeu) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.28;
        const mm = E.cvT > 0 || E.cvPT > 0 ? ['#ff4b8a', '#ffd23f', '#4bff9a', '#4fb8ff', '#c77dff'][Math.floor(t * 6 + E.uid) % 5] : E.giapT > 0 ? '#ffd23f' : '#c77dff';
        this.anhGiua(ctx, this.cham1(mm), x, y, co * 1.15); ctx.restore(); ctx.globalAlpha = 1;
      }
      // ---- thân ----
      let f0, f1 = -1, fr = 0;
      if (E.trum && n === 4) { // trùm 4 khung: đi 0-1-2-1 (khung 3 = tung chiêu)
        if (E.bao) f0 = 3;
        else {
          const seq = [0, 1, 2, 1], p = E._ph * 4, i = Math.floor(p), q = p - i;
          f0 = seq[i % 4]; f1 = seq[(i + 1) % 4]; fr = q;
        }
      } else {
        const p = E._ph * n, i = Math.floor(p); f0 = i % n; f1 = (i + 1) % n; fr = p - i;
        // 08/11: bỏ dự phòng "khung 3 dải 4 khung cũ" lúc tung chiêu (cắt theo tâm dải đi, cỡ không K8 → thân nhảy lệch + phình/co khi
        //  dải chiêu chưa nạp); nay dải chiêu chưa nạp thì cứ phát dải đi
      }
      // hoà: 4 khung hoà ở 55% cuối, 8 khung hoà ở 45% cuối (đỡ bóng ma), smoothstep
      const nguong = dong ? 0.65 : n >= 8 ? 0.55 : 0.45;
      fr = fr <= nguong ? 0 : (fr - nguong) / (1 - nguong); fr = fr * fr * (3 - 2 * fr);
      if (E.trum) fr = 0; // 08/11: trùm KHÔNG hoà khung — dải trùm đổi hình lớn giữa 2 khung (nảy dẹt mad_crown, xoay janus/twin_core) → hoà ra 2 vương miện/2 thân chồng nhau
      E._f = fr > 0.5 && f1 >= 0 ? f1 : f0; E._gv = gv; E._oy = hover; E._sc = sc;
      if (cd) { this.cdVe(ctx, E, cf, cd, M, x, y); E._tHv = null; E._kHv = 1; E._gv = cd.rot; }
      else if (!dai) { /* ảnh quái chưa nạp: không vẽ chấm thay thế */ }
      else {
        // nhún/nén theo bước (≤3%): dọc hướng đi giãn thì ngang co, gần như giữ diện tích
        const am = E.trum ? 0.018 : (E.d.tach || E.id === 'nho' ? 0.03 : bay ? 0.012 : 0.022);
        const sy = 1 + am * buoc, sx = 1 - am * 0.6 * buoc;
        const lac = E.trum ? Math.sin(E._ph * Math.PI * 2) * 0.025 : r * 0.12 + buoc * 0.015; // lắc lư nhẹ
        const C = co * sc * kc, fl = he * he * (E.trum ? 0.4 : 0.7); // chớp trắng ngắn — trùm bị bắn liên tục không trắng xoá
        const rot = clamp(gv + lac, -HUONG_NGHIENG, HUONG_NGHIENG);
        // trùm có dải ĐÁNH riêng: trong lúc báo chiêu quay về BÀN ụ (nhìn ra màn hình) và phát dải đánh theo tiến độ chiêu
        const tD = E.bao ? this.tenDanh(E) : null, dD = tD && this.coDai(tD, co * kc * ATK_K);
        const lop = (v, l, al) => { // 1 lớp hướng nhìn v (đi sang trái: dải trái thật nếu có, không thì lật dải phải)
          if (dD) {
            const fD = this.khungDanh(E.bao.t / (E.bao.song || 1.4), dD.nf);
            ctx.setTransform(M); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, sy); // cùng góc lắc với dải đi → không giật góc khi đổi dải
            this.veThan(ctx, dD, { ten: tD, px: co * kc * ATK_K }, fD, -1, 0, C * ATK_K, bay, dong, fl, al, true);
            E._tHv = tD; E._lat = 1; E._kHv = ATK_K; E._f = fD; return;
          }
          const tL = v === 's' && l < 0 ? this.tenTrai(ten) : null;
          const tS = tL || this.tenHuong(ten, v), d = tS ? this.coDai(tS, co * kc) : dai; if (!d) return;
          const lat = tS && !tL && v === 's' && l < 0 ? -1 : 1;
          ctx.setTransform(M); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(lat * sx, sy);
          this.veThan(ctx, d, { ten: tS || ten, px: co * kc }, f0, f1, fr, C, bay, dong, fl, al, true);
          E._tHv = tS || ten; E._lat = lat; E._kHv = 1;
        };
        const u = (t - E._hvT) / HUONG_HOA;
        lop(E._hv, E._hl, 1);
        if (u < 1 && E._hvCu && !dD && !HUONG_CHUNG.has(ten.replace(/_8$/, ''))) { const tN = E._tHv, lN = E._lat; lop(E._hvCu, E._hlCu, 1 - u * u * (3 - 2 * u)); E._tHv = tN; E._lat = lN; } // hướng cũ mờ dần 120 ms
        E._gv = rot;
        ctx.setTransform(M); ctx.globalAlpha = 1;
      }
      if (st.n) this.veStV2(ctx, E, st, x, y, co, t);
      if (E.docT > 0 && !st.doc && Math.random() < 0.06) FX.hat1('lua', x + rnd(-8, 8), y, 0, -20, 0.5, 6, '#9dff5a');
      // ---- thanh máu (không lắc theo nhún để dễ đọc) ----
      const yb = E.y + hover;
      if (E.hp < E.max && !E.trum) {
        const w = Math.max(18, co * 0.55), yy = yb - co * 0.42;
        PX.thanh(ctx, E.x - w / 2, yy, w, 3, E.hp / E.max, E.docT > 0 ? '#7cff4a' : (lanh ? '#6fd8ff' : '#ff4a4a'));
      }
      // (bỏ bông tuyết cạnh thanh máu — người dùng 08/11; bị chậm vẫn thấy: thanh máu xanh băng + vòng gió lạnh / băng trên thân)
      if (E.trum) {
        const w = 70, yy = yb - co * 0.6; // 0.55 → 0.6: đỉnh nảy của mad_crown/freezer/joker_king chạm thanh máu
        PX.thanh(ctx, E.x - w / 2, yy, w, 4, E.hp / E.max, TRUM[E.trum].mau);
        if (E.bao) { // dây báo chiêu tới ụ bị nhắm: tia PNG tô màu trùm, lặp + trượt (thay nét đứt vẽ code)
          const B = G.ban[E.ban];
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          for (const T of B.t) if (T && E.bao.muc.includes(T.uid)) { const c = B.o[T.o]; PX.tia(ctx, x, y, c.x, c.y, 2, TRUM[E.trum].mau, 0.7, t * 60); }
          ctx.restore(); ctx.globalAlpha = 1;
        }
      }
    }
  },
});
