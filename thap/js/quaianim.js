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
      // ---- bóng ----
      const bco = co * (bay ? 0.62 : 0.78) * sc * (bay ? 1 - (hover + 6) * 0.02 : 1);
      ctx.globalAlpha = bay ? 0.32 : 0.5;
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
      if (!dai) { /* ảnh quái chưa nạp: không vẽ chấm thay thế */ }
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
      if (lanh) { ctx.globalAlpha = 0.85; const kh = this.kyHieu('cham', 8); ctx.drawImage(kh, E.x - Math.max(18, co * 0.55) / 2 - 10, yb - co * 0.42 - 3, 8, 8); ctx.globalAlpha = 1; }
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
