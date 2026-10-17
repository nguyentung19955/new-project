// HIỆU ỨNG HỆ MỚI (17/10, phiên hieu-ung-he — docs/review/ke-hoach-cai-thien/hieu-ung-he/bao-cao.md).
// Chủ game: "Các hiệu ứng độc quẹt qua: nhanh quá, rối; không biết có gây sát thương vào quái không." — áp cho cả 3 hệ Lửa, Độc, Băng, mọi bậc.
// CHỈ ĐỔI HÌNH và tín hiệu báo trúng. Không đọc / ghi sát thương, vùng trúng, thời lượng đòn, cộng dồn trạng thái, luật chơi
// (js/combat.js, js/moves.js giữ nguyên). Mọi hình mới là ẢNH có sẵn (hu-*, gd-tt-*); số tầng / số nhịp là chữ như số sát thương.
// Cách làm: sau mỗi lần js/fx.js cập nhật (G.fx.update / G.fx.frozen), duyệt các hình MỚI của Cu Tí (o.pl) trong G.fx.state().E và chỉnh
// thuộc tính VẼ của chúng (thời lượng, nhuộm, viền, cỡ) hoặc bỏ hình trùng; bọc G.fx.hit / dotTint / entity / dmg / drawUI để báo trúng.
// Cờ chung: ?hemoi=0 (G.HE_MOI = false) → y hệt trước (không bọc gì). Cờ riêng (mỗi mục tắt riêng):
//   ?hecham=0 (G.HE_CHAM = false) mục 1: vệt hiện lâu hơn ×1,6 nhưng tối đa 2 lớp vệt cùng lúc; vệt nhuộm màu chủ đạo của hệ;
//                                       bỏ lớp "giọt hệ" chồng lên vệt (trùng màu với vệt đã nhuộm); bớt chùm hạt (chỉ khi trúng, 1 chùm / nhịp)
//   ?hebac=0  (G.HE_BAC = false)  mục 2: bậc cao rõ hơn bằng VIỀN SÁNG của chính vệt (Thành hình mảnh, Thức tỉnh dày hơn), không thêm hạt
//   ?hetam=0  (G.HE_TAM = false)  mục 3: vệt đòn thường (kiếm, thương đâm, búa nện) không vẽ xa hơn tầm trúng thật theo hướng đánh
//   ?hebao=0  (G.HE_BAO = false)  mục 4: TRÚNG → quái chớp màu hệ một lần + dấu bám thân (bọt độc / lửa nhỏ / tinh thể băng);
//                                       biểu tượng trạng thái cạnh thanh máu (độc: số tầng; lửa: đang cháy; băng: số tầng chậm / đóng băng);
//                                       mỗi nhịp độc / cháy hiện số nhỏ màu hệ (gộp khi dày). TRƯỢT → không có gì.
(function () {
  'use strict';
  const G = window.G, fx = G && G.fx;
  if (!G || !fx || !fx.state || !fx.update) return;
  const coTat = (ten) => { try { return typeof location !== 'undefined' && new RegExp('[?&]' + ten + '=0(&|$)').test(location.search || ''); } catch (e) { return false; } };
  if (G.HE_MOI == null) G.HE_MOI = !coTat('hemoi');
  if (G.HE_CHAM == null) G.HE_CHAM = !coTat('hecham');
  if (G.HE_BAC == null) G.HE_BAC = !coTat('hebac');
  if (G.HE_TAM == null) G.HE_TAM = !coTat('hetam');
  if (G.HE_BAO == null) G.HE_BAO = !coTat('hebao');
  const HM = (G.heMoi = {});
  HM.bat = (k) => G.HE_MOI !== false && (!k || G[k] !== false);
  if (G.HE_MOI === false) return; // ?hemoi=0: không bọc gì cả

  // ---------- số (chỉ là hình) ----------
  const SO = (HM.SO = {
    cham: 1.6,       // vệt chính hiện lâu gấp ngần này (phát chậm lại, không đổi đòn)
    lop: 2,          // tối đa số lớp vệt chính cùng lúc khi đánh liên tục (vệt cũ hơn tắt nhanh 0,06 giây)
    tatNhanh: 0.06,
    hatSauTrung: 0.1, // chùm hạt (hu-hat-no) chỉ giữ khi vừa trúng trong ngần này giây; tối đa 1 chùm mỗi nhịp
    khoiCach: 0.25,   // khói tròn (hu-khoi-tron) của Cu Tí: tối đa 1 lần mỗi ngần này giây
    tamDu: 4,         // mục 3: vệt được vượt tầm trúng (mép gần thân quái) tối đa ngần này điểm game
    coMin: 0.45,      // mục 3: thu vệt không nhỏ hơn ngần này lần cỡ cũ
    chop: 0.2,        // mục 4: chớp màu hệ dài ngần này giây (sau chớp trắng 0,07 giây có sẵn)
    chopMuc: 0.6,
    dau: 0.5,         // dấu bám thân: thời lượng (giây); cùng một con không ra dấu mới trong 0,3 giây
    dauCach: 0.3,
    giotSan: 3,       // giọt độc / mảnh băng trên sàn của Cu Tí cùng lúc
    soGop: 0.6,       // số nhịp độc / cháy: cùng con trong ngần này giây thì cộng vào số đang hiện
  });
  // màu chủ đạo của từng hệ (độc xanh lá, lửa cam đỏ, băng xanh nhạt) để nhuộm vệt; viền sáng; số nhịp
  const MAU = (HM.MAU = {
    fire: { vet: '#ff6a24', vien: '#ffb050', so: '#ff9a4a', chop: '#ff6a24' },
    poison: { vet: '#58d63a', vien: '#b6ff6a', so: '#8fe04a', chop: '#58d63a' },
    ice: { vet: '#8fd8ff', vien: '#d8f4ff', so: '#a8e2ff', chop: '#7fd4ff' },
  });
  // Dải màu nhuộm vệt theo độ sáng (tối → chủ đạo → sáng → lõi): vệt ảnh trắng-xanh của kiếm / thương / búa thành đúng màu hệ, giữ nét sáng tối.
  const DAI = {
    fire: ['#7a1e08', '#d8481a', '#ff7a2a', '#ffb24a', '#fff0b8'],
    poison: ['#14460c', '#2f8f22', '#58d63a', '#a8f060', '#effcc8'],
    ice: ['#173f6e', '#2f7fc0', '#6cc4f4', '#bfeaff', '#ffffff'],
  };
  const DAU = { fire: 'hu-lua-bung', poison: 'hu-bot-doc', ice: 'hu-tuong-tinh-the' }; // dấu bám thân khi trúng (ảnh có sẵn)
  const TT = { fire: 'gd-tt-chay', poison: 'gd-tt-doc', ice: 'gd-tt-bang' };          // biểu tượng trạng thái (ảnh có sẵn, 9×9)
  const FA = () => G.fxAnh;
  // Vệt CHÍNH của một đòn (ảnh vệt vũ khí / chiêu). Hình trùng lặp: lớp "giọt hệ" (fx_he.js drawFlames / drawDrips / drawIce: ảnh hu-giot-he-*).
  const VET = /^hu-(chem-kiem|chem-luot|chem-bua|dam-giao|quet-giao|nen-dat|ban-cung|phi-tieu-chum|ra-chieu|tram-nguyet|ra-chuong)(-|$)/;
  const VET_TAM = /^hu-(chem-kiem|chem-bua|dam-giao|quet-giao)(-|$)/; // mục 3: vệt đòn thường cận chiến (có tầm trúng là một hộp trước mặt)
  const GIOT = { drawFlames: 1, drawDrips: 1, drawIce: 1 };
  const coHe = (ma) => /-(fire|poison|ice)$/.test(ma || '');
  const tenHinh = (o) => (o.ty === 'anh' ? o.ma : o.ty === 'he' ? 'he:' + ((o.draw && o.draw.name) || '') : o.ty);
  HM.tenHinh = tenHinh;

  // ---------- khung chứa phần có hình của một ảnh (gộp mọi khung), tính một lần ----------
  const BB = new Map();
  function bbAnh(a) {
    if (!a || !a.img) return null;
    let b = BB.get(a.img);
    if (b !== undefined) return b;
    b = null;
    try {
      const n = a.net || 1, cw = a.fw * n, ch = a.fh * n, cv = document.createElement('canvas');
      cv.width = cw; cv.height = ch;
      const g = cv.getContext('2d', { willReadFrequently: true });
      let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
      for (let f = 0; f < a.so; f++) {
        g.clearRect(0, 0, cw, ch);
        g.drawImage(a.img, (f % a.cot) * cw, Math.floor(f / a.cot) * ch, cw, ch, 0, 0, cw, ch);
        const d = g.getImageData(0, 0, cw, ch).data;
        for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (d[(y * cw + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
      if (x1 >= x0) b = { x0: x0 / n - a.ax, x1: (x1 + 1) / n - a.ax, y0: y0 / n - a.ay, y1: (y1 + 1) / n - a.ay };
    } catch (e) { b = null; }
    BB.set(a.img, b);
    return b;
  }
  HM.bbAnh = bbAnh;
  // Bốn góc phần có hình của hình o trên màn (điểm game), theo đúng cách js/fx.js vẽ (vệt bám vũ khí o.xg; ảnh thường; xoay theo hướng nhắm o.rot).
  function gocHinh(o) {
    const A = FA(), a = A && A.ds[o.ma], bb = bbAnh(a);
    if (!bb) return null;
    const s = a.co * (o.sc > 0 ? o.sc : 1), th = o.theo;
    let X, Y, rot = 0, flip = o.f < 0;
    if (o.xg != null) { X = (th ? th.x : o.x - (o.tdx || 0)) + (o.tdx || 0); Y = (th ? th.y : o.y - (o.tdy || 0)) + (o.tdy || 0); rot = o.xg; }
    else { X = th ? th.x : o.x; Y = th ? th.y : o.y; if (o.goc) { if (a.xoay) rot = o.goc; else if (Math.cos(o.goc) < 0) flip = !flip; } }
    const cs = Math.cos(rot), sn = Math.sin(rot), out = [];
    for (const [u, v] of [[bb.x0, bb.y0], [bb.x1, bb.y0], [bb.x0, bb.y1], [bb.x1, bb.y1]]) {
      const px = (flip ? -u : u) * s, py = v * s;
      let x = X + px * cs - py * sn, y = Y + px * sn + py * cs;
      if (o.rot) { const c2 = Math.cos(o.rot), s2 = Math.sin(o.rot), dx = x - o.px, dy = y - o.py; x = o.px + dx * c2 - dy * s2; y = o.py + dx * s2 + dy * c2; }
      out.push([x, y]);
    }
    return { goc: out, X, Y };
  }
  HM.gocHinh = gocHinh;

  // ---------- vũ khí đang cầm: hệ, bậc, tầm của nhát đang ra ----------
  function vkNay(P) {
    try {
      const w = G.curW(P);
      if (!w) return null;
      return { w, el: G.activeEl(P, w), st: G.wStage(w), type: w.type };
    } catch (e) { return null; }
  }
  // Tầm trúng (điểm game, từ chân Cu Tí theo hướng đánh) của đòn thường đang ra, đúng số ở js/moves.js / js/combat.js; null: không giới hạn.
  function tamDon(P, v) {
    const M = G.MOVES, T = G.WTYPES[v.type];
    if (!M || !T) return null;
    const mo = G.wHas && G.wHas(v.w, 'reach') ? 1.15 : 1;
    const cur = P.mv && P.mv.cur;
    if (v.type === 'sword') { const ch = M.sword.chain[((P.comboI | 0) % 3 + 3) % 3]; return (cur && cur.reach ? cur.reach : ch ? ch.reach : T.reach) * mo; }
    if (v.type === 'spear') { if (cur && cur.sweep) return cur.r || 44; return (cur && cur.reach ? cur.reach : M.spear.chain[0].reach) * mo; } // quét vòng: bán kính vòng
    if (v.type === 'hammer') return (M.hammer.swing.reach || T.reach) * mo;
    return null;
  }

  // ---------- duyệt hình mới của Cu Tí sau mỗi lần cập nhật ----------
  const S0 = () => fx.state();
  let lanTrung = -9, hatNhip = -1, khoiLan = -9, trungNhip = -1;
  function xuLy() {
    const S = S0();
    if (!S || !S.W || !S.W.P || !S.E) return;
    const E = S.E, P = S.W.P, now = S.t;
    let v; // vũ khí, tính lười
    const cham = HM.bat('HE_CHAM'), bac = HM.bat('HE_BAC'), tam = HM.bat('HE_TAM');
    let moi = false;
    for (let i = E.length - 1; i >= 0; i--) {
      const o = E[i];
      if (o.hm) break; // hình mới luôn nằm cuối mảng
      o.hm = 1;
      if (!(o.t > 0)) continue;
      const ten = tenHinh(o);
      // độc: bỏ vòng TÍM (lẫn màu với hệ Độc xanh lá) lúc vừa dính độc và vòng "nhói" mỗi nhịp (đã có số nhịp màu hệ + chớp màu hệ).
      // Hai hình này do js/fx_ky_nang.js thêm NGOÀI lời gọi có chủ nên không mang o.pl — xét trước khi lọc theo chủ.
      if (cham && ((o.ty === 'ring' && o.c === '#b98af0') || ten === 'he:drawThrob')) { an(o); continue; }
      if (!o.pl) continue;
      if (cham) {
        if (o.ty === 'he' && GIOT[(o.draw && o.draw.name) || '']) { an(o); continue; } // lớp giọt hệ trùng với vệt đã nhuộm
        // nhiều quái trúng cùng một nhịp: chớp trúng to ở con đầu, các con sau nhỏ lại (0,6) cho đỡ chói
        if (/^hu-(trung|trung-nang|chi-mang)$/.test(ten)) { if (trungNhip === now) { o.sc = (o.sc > 0 ? o.sc : 1) * 0.6; } trungNhip = now; continue; }
        if (ten === 'hu-hat-no') { if (now - lanTrung > SO.hatSauTrung || hatNhip === now) { an(o); continue; } hatNhip = now; }
        else if (ten === 'hu-khoi-tron') { if (now - khoiLan < SO.khoiCach) { an(o); continue; } khoiLan = now; }
      }
      if (o.ty !== 'anh' || !VET.test(o.ma || '')) continue;
      if (v === undefined) v = vkNay(P);
      const el = v && v.el;
      if (cham) {
        keoDai(o, SO.cham);
        if (el && !coHe(o.ma) && !o.mau && DAI[el]) { o.mau = el; o.kieu = 'hemoi'; } // nhuộm theo dải màu hệ (FA.nhuom kiểu 'hemoi' bên dưới)
        o.hmVet = 1; moi = true;
      }
      if (bac && el && v.st >= 2 && DAI[el]) { o.vien = v.st - 1; o.vienMau = el; } // viền: cùng ảnh nhuộm dải màu hệ, cộng sáng
      if (tam && v && VET_TAM.test(o.ma)) khopTam(o, P, v);
    }
    if (moi) gioiHanLop(E);
    if (cham) giotSan(S);
  }
  // Giọt độc / mảnh băng rơi trên sàn (hạt loại 12 hu-giot-doc-san / hu-ray-bang của Cu Tí): tối đa SO.giotSan cái cùng lúc (bớt vệt chấm dọc sàn).
  function giotSan(S) {
    const PT = fx.parts && fx.parts();
    if (!PT) return;
    let n = 0;
    // mục 3 (cờ HE_TAM): giọt / mảnh rơi trên sàn của Cu Tí không nằm xa hơn tầm trúng của đòn đang ra (theo hướng mặt)
    const P = S.W.P, v = HM.bat('HE_TAM') && P.atkT > 0 ? vkNay(P) : null, L = v ? tamDon(P, v) : null, f = (P.aimUx != null ? P.aimUx : P.face) < 0 ? -1 : 1;
    for (let i = 0; i < S.np; i++) {
      const q = PT[i];
      if (q.k !== 12 || !q.pl || !(q.t > 0) || (q.ma !== 'hu-giot-doc-san' && q.ma !== 'hu-ray-bang')) continue;
      if (L > 0 && (q.x - P.x) * f > L + SO.tamDu) { q.t = 0; continue; }
      if (++n > SO.giotSan) q.t = 0;
    }
  }
  function an(o) { o.t = 0.0001; o.d = 0; o.ly = -9; o.hmAn = 1; } // ly -9: không lớp vẽ nào nhận (js/fx.js drawFx lọc theo o.ly), nhịp sau tự bỏ
  // Phát chậm lại k lần: kéo dài đời hình (cả phần giữ khung cuối), js/fx.js chia thời gian đã chạy cho o.cham khi chọn khung.
  function keoDai(o, k) {
    if (o.cham) return;
    o.t *= k; o.t0 *= k; if (o.hold) o.hold *= k;
    o.cham = k;
  }
  // Tối đa SO.lop vệt chính cùng lúc: vệt cũ hơn tắt nhanh (mờ trong SO.tatNhanh giây — hình ảnh có giữ khung thì mờ dần theo phần giữ).
  function gioiHanLop(E) {
    let n = 0;
    for (let i = E.length - 1; i >= 0; i--) {
      const o = E[i];
      if (!o.hmVet || !(o.t > 0) || o.hmAn) continue;
      n++;
      if (n > SO.lop && o.t > SO.tatNhanh) { o.t = SO.tatNhanh; o.hmCat = 1; }
    }
  }
  // Mục 3: phần có hình của vệt không vượt quá tầm trúng theo hướng đánh: thu cỡ quanh điểm neo (tay / chuôi), không nhỏ hơn SO.coMin.
  function khopTam(o, P, v) {
    const L = tamDon(P, v);
    if (!(L > 0)) return;
    const ux = P.aimUx != null ? P.aimUx : P.face || 1, uy = P.aimUy || 0;
    if (Math.abs(uy) > 0.35) return; // chỉ hướng gần ngang (đường chéo: hình đã xoay theo góc vũ khí, để nguyên)
    const f = ux < 0 ? -1 : 1, g = gocHinh(o);
    if (!g) return;
    let xa = -1e9;
    for (const [x] of g.goc) xa = Math.max(xa, (x - P.x) * f);
    const neo = (g.X - P.x) * f, gioi = L + SO.tamDu;
    xa = neo + (xa - neo) * (1 + VIEN_CO * (o.vien || 0)); // tính cả viền sáng (vẽ to hơn một chút)
    o.hmTam = { xa: Math.round(xa), gioi: Math.round(gioi) }; // cho bài đo
    if (xa <= gioi || xa - neo < 1) return;
    const k = Math.max(SO.coMin, Math.min(1, (gioi - neo) / (xa - neo)));
    o.sc = (o.sc > 0 ? o.sc : 1) * k;
    o.hmTam.k = +k.toFixed(2);
  }
  const VIEN_CO = 0.03; // viền to hơn vệt chính 3 % mỗi bậc (đủ thấy viền, không làm vệt dài thêm quá tầm)
  // Viền sáng theo bậc (js/fx.js gọi trước khi vẽ ảnh chính, cùng khung, cùng chỗ): to hơn một chút, cộng sáng, nhuộm màu sáng của hệ.
  HM.vien = function (c, o, ma, x, y, t, goc, co, lat, mo) {
    const A = FA();
    if (!A || !(o.vien > 0) || !HM.bat('HE_BAC')) return;
    const n = o.vien;
    c.save();
    try {
      c.globalCompositeOperation = 'lighter';
      A.ve(c, ma, x, y, t, goc, (co > 0 ? co : 1) * (1 + VIEN_CO * n), lat, (mo == null ? 1 : mo) * (n >= 2 ? 0.55 : 0.38), o.vienMau || null, o.vienMau && DAI[o.vienMau] ? 'hemoi' : '');
    } finally { c.restore(); }
  };
  // FA.nhuom kiểu 'hemoi' (mau = tên hệ): đổi từng điểm ảnh theo độ sáng sang dải màu DAI của hệ (giữ độ trong). Làm một lần mỗi (ảnh, hệ).
  const A0 = FA(), nhuom0 = A0 && A0.nhuom, NH = new Map();
  const hex3 = (m) => { const v = parseInt(m.slice(1), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; };
  if (nhuom0) A0.nhuom = function (a, mau, kieu) {
    if (kieu !== 'hemoi' || !DAI[mau]) return nhuom0.apply(this, arguments);
    if (!a || !a.img || typeof document === 'undefined') return a && a.img;
    const key = a.ma + '|' + mau + '|' + (a.net || 1);
    const o = NH.get(key);
    if (o && o.img === a.img) return o.cv;
    try {
      const cv = document.createElement('canvas'); cv.width = a.img.width; cv.height = a.img.height;
      const g = cv.getContext('2d'); g.drawImage(a.img, 0, 0);
      const d = g.getImageData(0, 0, cv.width, cv.height), px = d.data, R = DAI[mau].map(hex3), n = R.length - 1;
      for (let i = 0; i < px.length; i += 4) {
        if (!px[i + 3]) continue;
        const L = Math.min(1, (px[i] * 0.3 + px[i + 1] * 0.55 + px[i + 2] * 0.15) / 255) * n, j = Math.min(n - 1, Math.floor(L)), u = L - j;
        px[i] = R[j][0] + (R[j + 1][0] - R[j][0]) * u; px[i + 1] = R[j][1] + (R[j + 1][1] - R[j][1]) * u; px[i + 2] = R[j][2] + (R[j + 1][2] - R[j][2]) * u;
      }
      g.putImageData(d, 0, 0);
      NH.set(key, { img: a.img, cv });
      return cv;
    } catch (e) { NH.set(key, { img: a.img, cv: a.img }); return a.img; }
  };
  const up0 = fx.update, fr0 = fx.frozen;
  fx.update = function (dt) { const r = up0.apply(this, arguments); if (!G.noRender) { try { xuLy(); } catch (e) { HM.loi = String(e && e.stack || e); } } return r; };
  if (fr0) fx.frozen = function (dt, inp) { const r = fr0.apply(this, arguments); if (!G.noRender) { try { xuLy(); } catch (e) { HM.loi = String(e && e.stack || e); } } return r; };

  // ---------- mục 4: báo trúng ----------
  const hit0 = fx.hit;
  if (hit0) fx.hit = function (e, o) {
    const r = hit0.apply(this, arguments);
    try {
      const S = S0();
      if (S && e && o && !o.rain) {
        lanTrung = S.t;
        const el = o.el;
        if (el && MAU[el] && HM.bat('HE_BAO') && !e.isPlayer) {
          e.heChopT = S.t; e.heChopEl = el;
          if (!e.heDau || S.t - e.heDau.t > SO.dauCach || e.heDau.el !== el) {
            const h = Math.min(30, (e.h || 24) * (e.scale || 1)), dir = o.dir || 1;
            e.heDau = { t: S.t, el, ma: DAU[el], dx: -dir * Math.min(e.r || 8, 10) * 0.4, dy: -h * 0.42 };
          }
        }
      }
    } catch (err) { HM.loi = String(err && err.stack || err); }
    return r;
  };
  // Chớp màu hệ: nhuộm thân quái (cùng đường với nhịp độc / cháy, js/mobs.js / js/boss.js đọc G.fx.dotTint) ngay sau chớp trắng của đòn.
  const tint0 = fx.dotTint, CHOP = ['', 0];
  if (tint0) fx.dotTint = function (e) {
    const r = tint0.apply(this, arguments);
    if (r || !e || e.heChopT == null || !HM.bat('HE_BAO')) return r;
    const S = S0();
    if (!S) return r;
    const age = S.t - e.heChopT;
    if (!(age >= 0 && age < SO.chop)) return r;
    CHOP[0] = MAU[e.heChopEl] ? MAU[e.heChopEl].chop : '#ffffff'; CHOP[1] = SO.chopMuc * (1 - age / SO.chop);
    return CHOP;
  };
  // Dấu bám thân: vẽ ngay sau thân quái (cùng lớp sâu với quái, đi theo quái khi bị đẩy lùi), một lần, SO.dau giây.
  const ent0 = fx.entity;
  if (ent0) fx.entity = function (c, e) {
    const r = ent0.apply(this, arguments);
    try {
      const d = e && e.heDau;
      if (d && HM.bat('HE_BAO') && !e.dead && !e.isPlayer) {
        const S = S0(), A = FA(), a = A && A.get(d.ma);
        const age = S ? S.t - d.t : 9;
        if (!a || !(age >= 0) || age >= SO.dau) { if (age >= SO.dau) e.heDau = null; }
        else {
          const k = age / SO.dau, f = Math.min(a.so - 1, Math.floor(k * a.so));
          const sc = Math.max(0.7, Math.min(1.2, ((e.h || 24) * (e.scale || 1)) / 26));
          A.veK(c, d.ma, Math.round(e.x + d.dx), Math.round(e.y + d.dy), f, 0, sc, false, k > 0.7 ? (1 - k) / 0.3 : 1);
        }
      }
    } catch (err) { HM.loi = String(err && err.stack || err); }
    return r;
  };
  // Số nhịp độc / cháy: luôn hiện (không bị số khác đẩy mất), màu chủ đạo của hệ, cùng con trong SO.soGop giây thì cộng dồn vào số đang hiện.
  const dmg0 = fx.dmg;
  if (dmg0) fx.dmg = function (t, d, o) {
    const S = S0();
    if (!S || !o || !o.dot || !t || !HM.bat('HE_BAO') || !(G.DO_DOC_TRAN === true && G.theme && G.theme.DOC)) return dmg0.apply(this, arguments);
    try {
      const v = Math.max(1, Math.round(d));
      for (let i = S.N.length - 1; i >= 0; i--) {
        const q = S.N[i];
        if (q.chu === t && q.dot && q.hmSo != null && S.t - q.hmSo < SO.soGop && q.t > 0) {
          q.val += v; q.s = String(q.val); q.nay = S.t; q.t = Math.max(q.t, q.t0 * 0.7);
          if (!(S.t - (t.fxHitAt == null ? -9 : t.fxHitAt) < 0.1)) t.flash = 0; // như bản cũ: nhịp độc / cháy nhuộm màu hệ thay cho chớp trắng
          t.fxDotAt = S.t; t.fxDotEl = o.el || null;
          return undefined;
        }
      }
      const D = G.theme.DOC, n0 = S.N.length, m0 = D.soToiDa;
      D.soToiDa = m0 + 2; // chỗ cho số nhịp (luật cũ: chỉ ra khi còn chỗ)
      let r;
      try { r = dmg0.apply(this, arguments); } finally { D.soToiDa = m0; }
      for (let i = S.N.length - 1; i >= 0 && i >= n0 - 1; i--) {
        const q = S.N[i];
        if (q.chu === t && q.dot && q.hmSo == null) { q.hmSo = S.t; if (MAU[o.el]) q.col = MAU[o.el].so; q.mo = 1; q.edge = 'rgba(10,8,6,0.95)'; break; }
      }
      return r;
    } catch (err) { HM.loi = String(err && err.stack || err); return undefined; }
  };
  // Biểu tượng trạng thái cạnh thanh máu (lớp giao diện, trên mọi hình trong trận): độc + số tầng 1–5; lửa: đang cháy; băng: số tầng chậm 1–4,
  // đóng băng: biểu tượng to hơn, sáng nhấp nháy. Quái thường: bên phải thanh máu nhỏ; trùm: dưới hàng biểu tượng có sẵn trên đầu (thêm số tầng).
  const ui0 = fx.drawUI;
  function chu(c, s, x, y, mau) {
    c.font = '700 6px "Be Vietnam Pro", system-ui, sans-serif';
    c.textAlign = 'left'; c.lineJoin = 'round'; c.lineWidth = 1.8; c.strokeStyle = 'rgba(10,8,6,0.95)';
    c.strokeText(s, x, y); c.fillStyle = mau; c.fillText(s, x, y);
  }
  HM.oTrangThai = function (e) { // cho bài đo: danh sách biểu tượng đang vẽ cho quái e
    const st = e && e.st;
    if (!st) return [];
    const ds = [];
    if (st.poisonN > 0) ds.push({ el: 'poison', so: Math.min(5, st.poisonN | 0) });
    if (st.fire > 0) ds.push({ el: 'fire', so: 0 });
    if (st.frozen > 0) ds.push({ el: 'ice', dong: true, so: 0 });
    else if (st.iceN > 0) ds.push({ el: 'ice', so: Math.min(4, st.iceN | 0) });
    return ds;
  };
  if (ui0) fx.drawUI = function (cam) {
    const r = ui0.apply(this, arguments);
    try {
      const S = S0(), SC = G.spriteCustom;
      if (!S || !S.W || !HM.bat('HE_BAO') || !SC || !SC.gdSan || !SC.veGd) return r;
      const W = S.W, c = G.ux, cm = G.camVe && G.NOI_SUY !== false ? G.camVe(W) : W.cam || 0, now = G.time || 0;
      const list = W.ents.slice();
      if (W.boss && !W.boss.dead) list.push(W.boss);
      const ga = c.globalAlpha;
      for (const e of list) {
        if (!e || e.dead || e.hidden || e.dying != null || e.illusion) continue;
        const ds = HM.oTrangThai(e);
        if (!ds.length) continue;
        if (e.isBoss) { // trùm: hàng biểu tượng có sẵn (js/art.js A.status: lửa, độc, băng giữa đầu) — chỉ thêm số tầng độc / băng cạnh biểu tượng
          const st = e.st, hang = [st.fire > 0 ? 'fire' : null, st.poisonN > 0 ? 'poison' : null, st.iceN > 0 || st.frozen > 0 ? 'ice' : null].filter(Boolean);
          const top = Math.round(e.y - e.h - 6) - 6;
          hang.forEach((el, i) => {
            const q = ds.find((d) => d.el === el), xi = Math.round(e.x - cm - (hang.length * 10 - 1) / 2 + i * 10);
            if (q && q.so > 0) chu(c, String(q.so), xi + 8, top + 9, MAU[el].so);
          });
          continue;
        }
        const bw = e.role === 'elite' ? 26 : 16;
        let x = Math.round(e.x - cm + bw / 2 + 2);
        const y = Math.round(e.y - (e.h || 24) * (e.art ? 1 : e.scale || 1) - 4 - 3);
        for (const q of ds) {
          const g = SC.gdSan(TT[q.el]);
          if (!g) continue;
          const to = q.dong ? 9 : 7, nh = q.dong && ((now * 4) | 0) % 2 ? 1 : 0;
          SC.veGd(c, g, x, y - (to - 7), to, to);
          if (nh) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = ga * 0.5; SC.veGd(c, g, x, y - (to - 7), to, to); c.restore(); }
          if (q.so > 0) chu(c, String(q.so), x + to, y + 6, MAU[q.el].so);
          x += to + (q.so > 0 ? 5 : 1);
        }
      }
      c.globalAlpha = ga;
    } catch (err) { HM.loi = String(err && err.stack || err); }
    return r;
  };
})();
