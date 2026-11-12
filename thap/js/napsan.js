// TURRET MERGE — NẠP SẴN texture theo BẢNG ẢNH THỰC DÙNG (tuvan/webgl/KE-HOACH.md mục 15). Chỉ HÌNH / nạp ảnh — không đọc-ghi gì của luật trận ngoài việc ĐỌC bộ bài, wave, tim.
// Vì sao: trên iPhone mỗi lần tải texture giữa trận (Image → texture: giải mã + tải; canvas → texture 3–50 ms) là 1 lần khựng. Sau mục 12–14 phần còn lại là ảnh hiệu ứng
//   "không đoán trước được từ bộ bài" (ảnh riêng của từng ụ nạp rải rác trong mô-đun của nó), tờ ký tự của cỡ chữ gặp lần đầu, ảnh của trùm / quái theo chủ đề.
// Bảng NONG_META (js/nong-meta.js — SINH bằng tools/thap-nong-meta.py từ các trận bot ghi ảnh thực vẽ, KHÔNG sửa tay):
//   k = REN.s × REN.dpr lúc đo (tầng trong bảng đúng cho k đó; máy khác đổi theo tỉ lệ) · u[id ụ] · mv[id chỉ huy] · trum[id trùm] · dau (dùng chung, nạp ở màn mở đầu) ·
//   nen (dùng chung, nạp nền giữa trận theo thứ tự ưu tiên) · kq (màn kết quả) · chu (tờ ký tự theo cỡ chữ trận hay dùng).
//   Mỗi danh sách = chuỗi 'tên:tầng,tên,…' (không ghi tầng = 0; '~' trong tên = id của mục).
// Khi nào nạp:
//   · MÀN MỞ ĐẦU TRẬN (trận đứng, lớp GL tải không giới hạn): ụ của CẢ HAI bộ bài + chỉ huy + 'dau' + tờ ký tự. Ảnh chưa có trong bộ nhớ → gọi tải (mạng / bộ đệm) ngay, về lúc nào nạp lúc đó.
//   · TRÙM: cùng lúc nongskill.js làm nóng trùm (từ "BOSS IN 3") → thêm trum[id] (ảnh chiêu / quái nó gọi), xếp ĐẦU hàng.
//   · QUÁI THEO CHỦ ĐỀ: mỗi lần đổi wave → dải của các loại quái wave kế + wave sau đó được GLR.nap lại (đã có texture thì thôi).
//   · NỀN: trận chạy ≥ 3 s → mỗi NEN_NHIP khung thêm 1 tên của 'nen'; atlas gần đầy thì ngừng (giữ bộ nhớ như cũ).
//   · KẾT QUẢ: khi 1 bàn còn ≤ 1 tim → 'kq'.
//   Giữa trận mọi thứ đi qua hàng "nạp trước" của GLR (≤ 1 texture / khung, chỉ khung nhẹ — ngân sách cũ không đổi); ở đây mỗi khung chỉ đưa ≤ 1 tên khi hàng của GLR gần trống.
//   · MẤT / CÓ LẠI NGỮ CẢNH: đợi qua 30 khung đầu của ngữ cảnh mới (GLR tải không giới hạn trong 20 khung đó) rồi mới đưa lại cả danh sách, ≤ 1 tên / khung.
// ?gl=0 / ?gla=0 / WebGL1 / 2D dự phòng: không chạy (bảng chỉ có nghĩa với ẢNH ẢO). ?nap=0: tắt riêng để so.
'use strict';
(() => {
  if (typeof NS === 'undefined' || typeof REN === 'undefined' || !NS.am || typeof NONG_META === 'undefined' || !NONG_META) return;
  let TAT = false; try { TAT = new URLSearchParams(location.search).get('nap') === '0'; } catch (e) { }
  const M = NONG_META, AM = NS.am, NEN_NHIP = 12, NEN_DAY = 0.9;
  const chay = () => !TAT && typeof _GLA === 'function' && _GLA() && NS.glChay();
  const laTQ = (t) => /^(fx_)?trum_|^quai_/.test(t);
  const NP = NS.np = { ten: new Map(), hang: [], the: -1, fDoi: -999, fBat: 0, iNen: 0, kq: false, wave: -1, lap: false, toLai: [], chuCho: null, chuGhi: [], _chuDa: new Set(), dem: { dua: 0, mang: 0, nen: 0, trum: 0, quai: 0, chu: 0, lai: 0 } };
  // 'tên:tầng,tên' → [[tên, tầng ở k của máy này]]
  const doiL = (L) => { const k = REN.s * REN.dpr; if (!(M.k > 0) || !(k > 0)) return L; return Math.max(0, L - Math.ceil(Math.log2(k / M.k) - 0.01)); };
  const doc = (s, id) => { const r = []; if (!s) return r; for (const p of s.split(',')) { if (!p) continue; const i = p.lastIndexOf(':'); let t = i > 0 ? p.slice(0, i) : p; if (id) t = t.split('~').join(id); r.push([t, doiL(i > 0 ? +p.slice(i + 1) : 0)]); } return r; };
  // danh sách của màn mở đầu: bảng theo bộ bài của mọi bàn + chỉ huy + phần chung đầu trận (thêm vào danh sách cũ của nongskill.js: VXM.U + ảnh đã học trong phiên)
  const dsGoc = NS.dsHieuUng;
  NS.dsHieuUng = function () {
    const m = dsGoc.apply(this, arguments); if (TAT) return m;
    const them = (ds) => { for (const [t, L] of ds) if (!m.has(t) || m.get(t) == null) m.set(t, L); };
    try {
      for (const B of G.ban) { for (const id of B.deck || []) if (M.u && M.u[id]) them(doc(M.u[id], id)); if (B.mv && M.mv && M.mv[B.mv.id]) them(doc(M.mv[B.mv.id], B.mv.id)); }
      them(doc(M.dau));
    } catch (e) { }
    return m;
  };
  // thêm tên vào danh sách nạp của trận (truoc: lên đầu hàng)
  NP.them = function (ds, truoc) {
    if (!NS._napDs) return 0; let n = 0;
    for (const [t, L] of ds) { if (NP.ten.has(t)) continue; NP.ten.set(t, L); if (!NS._napDs.has(t) || NS._napDs.get(t) == null) NS._napDs.set(t, L); if (truoc) NP.hang.unshift(t); else NP.hang.push(t); n++; }
    return n;
  };
  // trận mới: AM.lap vừa lập NS._napDs (đã gọi tải mọi ảnh chưa có)
  const lapGoc = AM.lap;
  AM.lap = function () {
    const r = lapGoc.apply(this, arguments);
    try {
      NP.lap = false; NP.ten = new Map(); NP.hang = []; NP.toLai = []; NP.iNen = 0; NP.kq = false; NP.wave = -1; NP.chuCho = null;
      if (chay() && NS._napDs) { NP.lap = true; NP.the = GLR.the; NP.fDoi = -999; NP.fBat = -1; for (const [t, L] of NS._napDs) if (!laTQ(t)) { NP.ten.set(t, L); NP.hang.push(t); } NP.chuCho = (M.chu || []).concat(NP.chuGhi).slice(0, 80); }
    } catch (e) { }
    return r;
  };
  // trùm sắp ra (nongskill.js gọi mỗi 0,5 s tới khi đủ ảnh): thêm ảnh chiêu của trùm theo bảng
  const ntGoc = NS.nongTrum;
  NS.nongTrum = function (id) {
    const r = ntGoc.apply(this, arguments);
    try { if (NP.lap && chay() && id && M.trum && M.trum[id]) NP.dem.trum += NP.them(doc(M.trum[id], id), true); } catch (e) { }
    return r;
  };
  // quái của wave w theo chủ đề (hàm thuần của data.js; r cố định → không đụng bộ sinh số của trận)
  const quaiWave = (w) => {
    const ds = new Set(); if (typeof dsQuaiChuDe !== 'function' || !(w > 0)) return ds;
    for (const x of [0.05, 0.25, 0.35, 0.6, 0.95]) { try { for (const id of dsQuaiChuDe(w, () => x)) ds.add(id); } catch (e) { } }
    if (ds.has('tach') || ds.has('que_tach')) ds.add('nho');
    return ds;
  };
  NP.nongQuai = function () {
    if (typeof QUAI === 'undefined') return;
    const ids = new Set(); for (const w of [G.wave + 1, G.wave + 2]) for (const id of quaiWave(w)) ids.add(id);
    for (const id of ids) {
      const d = QUAI[id]; if (!d) continue;
      const E = { id, d }, t0 = REN.tenQuai ? REN.tenQuai(E) : 'quai_' + (d.anh || id);
      const kc = t0.endsWith('_8') && typeof K8 !== 'undefined' ? K8[d.anh || id] || 1 : 1, co = d.co * kc;
      const ten = [t0]; for (const v of ['s', 'b']) { const t = REN.tenHuong && REN.tenHuong(t0, v); if (t) ten.push(t); }
      const tl = REN.tenTrai && REN.tenTrai(t0); if (tl) ten.push(tl);
      for (const t of ten) { const a = REN.anh[t]; if (!a || !a._cv) continue; const c = REN.coDai(t, co); if (c && (c._ao || c._goc) && !GLR.coTex(c)) { GLR.nap(c); NP.dem.quai++; } }
    }
  };
  // ---------- tờ ký tự (chugl.js): ghi cỡ chữ đã dùng trong phiên (theo đơn vị logic → máy / cỡ màn khác tính lại) + dựng lại ở màn mở đầu trận sau; bảng M.chu = phần ghi sẵn từ trận bot ----------
  const BO = typeof CHU !== 'undefined' ? [CHU.SO, 'ACDEFGHIJLNOPQRSTUVWXYZ?\'()', 'abcdefghijklmnopqrstuvwxyz'] : [];
  const r4 = (v) => Math.round(v * 1e4) / 1e4;
  let ctxChu = null;
  if (typeof CHU !== 'undefined' && CHU.kyTu && !CHU.tat) {
    const kt = CHU.kyTu, vl = CHU.veLenh, va = CHU.veAnh;
    CHU.kyTu = function (Mt, ch, net, noi) {
      const n = Mt.to.length, r = kt.apply(this, arguments);
      if (Mt.to.length > n && !NP._dangChu) { try {
        const bo = BO.findIndex(b => b.indexOf(ch) >= 0), kR = REN.s * REN.dpr; let e = null;
        if (bo >= 0 && kR > 0) {
          if (ctxChu && ctxChu[0] === 'L') { const X = ctxChu[1], s = X._s, F = CHU.font(s.font); if (F) e = ['L', F.dau, F.duoi, r4(F.px * X.a / kR), net ? r4(s.lineWidth * X.a / kR) : 0, noi || '', bo]; }
          else if (ctxChu && ctxChu[0] === 'A') e = ['A', ctxChu[1], net ? 1 : 0, bo];
          if (!e) { const q = Mt.key.split('|'); e = ['K', q[0], q[1], r4(Mt.P / kR), net ? r4(net / kR) : 0, noi || '', bo]; }
          const kk = e.join('|'); if (!NP._chuDa.has(kk) && NP.chuGhi.length < 120) { NP._chuDa.add(kk); NP.chuGhi.push(e); }
        }
      } catch (e) { } }
      return r;
    };
    CHU.veLenh = function (X) { const cu = ctxChu; ctxChu = ['L', X]; try { return vl.apply(this, arguments); } finally { ctxChu = cu; } };
    CHU.veAnh = function (ctx, im) { const cu = ctxChu; ctxChu = ['A', im && im.px]; try { return va.apply(this, arguments); } finally { ctxChu = cu; } };
  }
  // dựng 1 tờ theo mục đã ghi; trả các canvas tờ mới
  const dungChu = (e) => {
    const k = REN.s * REN.dpr, lam = (Mt, bo, net, noi) => { const n = Mt.to.length; CHU.kyTu(Mt, BO[bo][0], net, noi); return Mt.to.slice(n).map(T => T.c); };
    if (e[0] === 'A') { const P = Math.round(e[1] * k * 100) / 100, Mt = CHU.layMat('900 ', ' ' + FONT.display, P); return lam(Mt, e[3], e[2] ? Math.round(3.5 * k * 100) / 100 : 0, e[2] ? 'round' : ''); }
    if (e[0] === 'K') { const Mt = CHU.layMat(e[1], e[2], Math.round(e[3] * k * 100) / 100); return lam(Mt, e[6], e[4] ? Math.round(e[4] * k * 100) / 100 : 0, e[5]); }
    const Pd = e[3] * k; if (!(Pd >= 3 && Pd <= 200)) return [];
    let Mt = CHU.mat.get(e[1] + '|' + e[2] + '|' + Math.round(Pd * 100) / 100), q = 1; if (!Mt) { const Pb = CHU.bac(Pd); q = Pd / Pb; Mt = CHU.layMat(e[1], e[2], Pb); }
    return lam(Mt, e[6], e[4] ? (q === 1 ? Math.round(e[4] * k * 100) / 100 : CHU.bacNet(e[4] * k / q)) : 0, e[5]);
  };
  NP.nongChu = function () {
    const ds = NP.chuCho; if (!ds || typeof CHU === 'undefined' || CHU.tat || CHU._cho()) return;
    NP.chuCho = null; NP._dangChu = true;
    try { // cỡ chính xác ('A' / 'K') trước — lệnh 'L' dùng mặt đúng cỡ nếu đã có (như CHU.veLenh)
      for (const e of ds.filter(e => e[0] !== 'L').concat(ds.filter(e => e[0] === 'L'))) { if (CHU.mat.size >= 24) break; try { for (const c of dungChu(e)) { GLR.nap(c); NP.dem.chu++; } } catch (er) { } }
    } finally { NP._dangChu = false; }
  };
  // ---------- mỗi khung (sau khi vẽ): đưa tên trong hàng sang hàng nạp của GLR ----------
  NP.chay = function () {
    if (!NP.lap || !chay() || !NS._napDs || !G.ban || !G.ban.length || G.ketThuc) return;
    const mo = NS.moDau(), f = GLR.f;
    if (GLR.the !== NP.the) { // ngữ cảnh GL mới (mất rồi có lại): mọi texture đã mất → đưa lại cả danh sách + các tờ ký tự, từ từ
      NP.the = GLR.the; NP.fDoi = f; NP.hang = [...NP.ten.keys()]; NP.dem.lai++;
      NP.toLai = []; if (typeof CHU !== 'undefined' && CHU.mat) for (const Mt of CHU.mat.values()) for (const T of Mt.to) NP.toLai.push(T.c);
    }
    if (mo) { if (NP.chuCho) NP.nongChu(); }
    else {
      if (f - NP.fDoi < 30) return;
      if (NP.fBat < 0) NP.fBat = f;
      if (NP.chuCho && f - NP.fBat > 20) NP.nongChu(); // (bỏ qua màn mở đầu: phông về muộn → dựng sau)
      if (!G.dung) {
        if (G.wave !== NP.wave) { NP.wave = G.wave; try { NP.nongQuai(); } catch (e) { } }
        if (!NP.kq && M.kq && G.ban.some(B => B.tim <= 1)) { NP.kq = true; NP.them(doc(M.kq)); }
        if (M.nen && f - NP.fBat > 180 && f % NEN_NHIP === 0 && NP.hang.length < 6) { // nạp nền: atlas gần đầy → ngừng (không đẩy ảnh đang dùng ra)
          if (!NP._nen) NP._nen = doc(M.nen);
          if (NP.iNen < NP._nen.length) { const b = GLR.boNho && GLR.boNho(); if (!b || b.atlasTrang < 5 || b.atlasDay < NEN_DAY) { NP.dem.nen += NP.them([NP._nen[NP.iNen++]]); } }
        }
      }
    }
    let n = mo ? 48 : (GLR._napDs.length < 3 ? 1 : 0); if (!n) return;
    if (!mo && NP.toLai.length) { const c = NP.toLai.shift(); if (c && c.width) GLR.nap(c); return; }
    for (let i = 0, len = NP.hang.length; i < len && n > 0; i++) {
      const t = NP.hang.shift(); let a = REN.anh[t];
      if (!a) { REN.img(t); NP.dem.mang++; a = REN.anh[t]; if (!a) continue; } // chưa từng tải: gọi tải (về sau mới nạp)
      if (a._loi) continue;
      if ((!a._cv && !(a.complete && a.naturalWidth)) || a._chuaGiai) { NP.hang.push(t); continue; } // đang tải / đang giải mã: để cuối hàng
      NS.napGL(t);
      const c = REN.anh[t] && REN.anh[t]._cv; if (!c) { NP.hang.push(t); continue; } // hết ngân sách chép của khung (REN.img hoãn): thử lại
      NP.dem.dua++; n--;
    }
  };
  // màn mở đầu còn việc? ảnh ĐÃ về mà chưa đưa lên GPU mới tính (ảnh còn đang tải không giữ màn mở đầu — mạng chậm thì nạp nốt giữa trận)
  const cnGoc = NS.conNong;
  NS.conNong = function () {
    if (cnGoc.apply(this, arguments)) return true;
    if (!NP.lap || !NS.moDau() || !chay()) return false;
    if (NP.chuCho && typeof CHU !== 'undefined' && !CHU.tat && !CHU._cho()) return true;
    for (const t of NP.hang) { const a = REN.anh[t]; if (a && !a._loi && !a._chuaGiai && (a._cv || (a.complete && a.naturalWidth))) return true; }
    return false;
  };
  const veGoc = REN.ve;
  REN.ve = function () { const r = veGoc.apply(this, arguments); try { NP.chay(); } catch (e) { } return r; };
})();
