// ASTRAL ARSENAL — QUYỀN ADMIN (người dùng chốt 10/11). Ghi chú + giới hạn: docs/demo-hop-tuong/tuvan/admin/ADMIN.md · kiểm tools/thap-kt-admin.js
//  · ADMIN.la(): true khi tài khoản Google đang đăng nhập có email đã xác minh (emailVerified) = EMAIL (so chữ thường).
//  · Admin: BỎ MỌI KHOÁ (chế độ, màn, cửa hàng, vòng quay, lò rèn, Ấn Vàng/Ấn Đỏ, Leo Tháp, Săn Trùm, Thử thách, Vô tận, thử thách tuần,
//    online, chỉ huy) + SỞ HỮU ẢO đủ 97 ụ: các chỗ kiểm khoá chỉ thêm `|| ADMIN.la()` — KHÔNG ghi đè dữ liệu thật (đăng xuất → như cũ),
//    cấp thẻ / bản sao / vàng / ngọc / vé giữ theo dữ liệu thật, không cộng tài nguyên.
//  · Cache khoá turret_admin = { uid } để mở ngoại tuyến vẫn nhận; xoá khi đăng xuất / đổi sang tài khoản khác / khách.
//  · ĐÂY LÀ KIỂM PHÍA MÁY KHÁCH (ai sửa JS cũng bật được) — quyền thật kiểm ở server: giai đoạn F.
//  Nạp sớm (trước data.js) để mọi file sau gọi ADMIN.la() được; nghe tài khoản qua NET.khiDoiTK khi net.js đã nạp.
'use strict';
const ADMIN = {
  EMAIL: 'ly230595@gmail.com',
  KEY: 'turret_admin',
  _v: null,
  la() {
    if (this._v === null) { try { const o = JSON.parse(localStorage.getItem(this.KEY) || 'null'); this._v = !!(o && o.uid); } catch (e) { this._v = false; } }
    return this._v;
  },
  // u = NET.user ({ uid, anon, email, ev }) — gọi mỗi lần đổi tài khoản
  xet(u) {
    if (!u) return;
    const ok = !!(!u.anon && u.ev === true && String(u.email || '').trim().toLowerCase() === this.EMAIL);
    try { if (ok) localStorage.setItem(this.KEY, JSON.stringify({ uid: u.uid })); else localStorage.removeItem(this.KEY); } catch (e) { }
    if (ok !== this.la()) { this._v = ok; this.apDung(); } else this.nhan();
  },
  // vẽ lại những gì phụ thuộc khoá (lưới bộ bài, nút tính năng, HOME, chấm đỏ)
  apDung() {
    const thu = (f) => { try { f(); } catch (e) { } };
    thu(() => { if (G.roster && G.roster.length) UI.veChon(); });
    thu(() => TTUI.capTn()); thu(() => TTUI.capLuoi()); thu(() => KTUI.capNhat()); thu(() => HM.ve());
    this.nhan();
  },
  // nhãn nhỏ "ADMIN" trên chip phi công (HOME) + bảng hồ sơ phi công
  nhan() {
    const la = this.la();
    for (const s of document.querySelectorAll('#tk-chip small, #tk-bang #tk-loai')) {
      let i = s.parentNode.querySelector(':scope > .adm-nhan');
      if (!la) { if (i) i.remove(); continue; }
      if (!i) { i = document.createElement('em'); i.className = 'adm-nhan'; i.textContent = 'ADMIN'; s.insertAdjacentElement('afterend', i); }
    }
  },
};
// NHÃN ĐO KHUNG HÌNH (chỉ admin, chỉ ở màn trận): "GL 60 · min 48" = kiểu vẽ (GL / 2D) + FPS hiện tại + FPS thấp nhất trong 10 giây gần nhất.
// Đếm khung requestAnimationFrame theo cửa sổ 0,5 s; chỉ hiển thị, không đụng luật trận. Về trang sau khi ẩn / rời trận → đo lại từ đầu.
const gl0 = () => typeof GLR !== 'undefined' && GLR.bat && !GLR.mat;
ADMIN.fps = {
  el: null, t0: 0, n: 0, ds: [], cu: 0, sv: [], dv: [], vs: 0, vn: 0, vm: 0, tm: 0, boc: 0,
  hien() { try { const c = document.getElementById('cv'); return ADMIN.la() && typeof G !== 'undefined' && G.ban && G.ban.length > 0 && !!c && c.offsetParent !== null && !document.hidden; } catch (e) { return false; } },
  khung(t) {
    const F = ADMIN.fps; requestAnimationFrame(F.khung);
    if (t - F.cu > 1000) { F.t0 = t; F.n = 0; F.ds.length = 0; } // ngắt quãng (ẩn trang, treo) → bỏ mẫu cũ
    F.cu = t; F.n++;
    if (t - F.t0 < 500) return;
    const fps = F.n * 1000 / (t - F.t0); F.t0 = t; F.n = 0;
    if (!F.hien()) { if (F.el) F.el.style.display = 'none'; F.ds.length = 0; F.dv.length = 0; return; }
    F.ds.push(fps); if (F.ds.length > 20) F.ds.shift();
    if (!F.el) { F.el = document.createElement('div'); F.el.id = 'adm-fps'; document.body.appendChild(F.el); F.el.style.pointerEvents = 'auto'; F.el.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); const N = ADMIN.nk; N.che = ({ 2: 0, 0: 1, 1: 3, 3: 2 })[N.che | 0]; N.an = N.che === 2; document.documentElement.classList.toggle('adm-nf', N.che === 1); /* 3 = 'LO': thử vẽ NỬA ĐỘ NÉT (canvas trận 1×) — FPS tăng vọt = nghẽn ở GPU (tô điểm ảnh) */ try { if (N.che === 3) G.debug.dpr = 1; else if (G.debug) delete G.debug.dpr; REN.coLai(); } catch (er) { } N.ve(); }, true); }
    const gl = typeof GLR !== 'undefined' && GLR.bat && !GLR.mat;
    // chẩn đoán: "ve a/b" = ms của REN.ve (trung bình / lớn nhất 10 s) — FPS thấp mà ve nhỏ → nghẽn NGOÀI phần vẽ trận (sự kiện chạm, DOM, ghép lớp);
    //   "t" = số texture GL tải lớn nhất trong 1 khung (10 s)
    //   "d a x b h c" = số ảnh dựng vào kho đệm (REN.cSet) trong đúng khung vẽ chậm nhất 10 s · số lần kho xoay thế hệ từ đầu · ms lớn nhất 1 lần dựng lại ảnh đã thả (GL)
    if (!F.boc && typeof REN !== 'undefined' && REN.ve) { F.boc = 1; const g = REN.ve; REN.ve = function () { const t0 = performance.now(), d0 = this.dungN | 0; try { return g.apply(this, arguments); } finally { const d = performance.now() - t0; F.vs += d; F.vn++; if (d > F.vm) { F.vm = d; F.dm = (this.dungN | 0) - d0; } if (gl0() && GLR.dem && GLR.dem.tai > F.tm) F.tm = GLR.dem.tai; } }; }
    F.dv.push([F.vn ? F.vs / F.vn : 0, F.vm, F.tm, F.dm | 0]); if (F.dv.length > 20) F.dv.shift(); F.vs = F.vn = F.vm = F.tm = F.dm = 0;
    const tb = F.dv.reduce((a, x) => a + x[0], 0) / F.dv.length, mx = Math.max.apply(null, F.dv.map(x => x[1])), tx = Math.max.apply(null, F.dv.map(x => x[2])), dx = F.dv.reduce((a, x) => (x[1] > a[1] ? x : a), F.dv[0])[3];
    // bộ nhớ (5 s đo 1 lần): "m a+b" = MB canvas đệm đang sống (REN.boNho) + MB texture GL — iPhone hay thu hồi trang giữa trận khi tổng quá lớn
    F.mn = (F.mn | 0) + 1; if (F.mn % 10 === 1) { try { const r = REN.boNho(), g = gl && GLR.thongTin().boNho; F.mt = ' · m' + Math.round(r.canvasMB) + (g ? '+' + Math.round(g.tong / 1048576) : ''); } catch (e) { F.mt = ''; } }
    F.sv.push([REN._sim || 0, REN._simN || 0]); if (F.sv.length > 20) F.sv.shift(); // mẫu ms tính toán trận (khung gần nhất mỗi 0,5 s)
    const smx = Math.max.apply(null, F.sv.map(x => x[0])), stb = F.sv.reduce((a, x) => a + x[0], 0) / F.sv.length, sbn = Math.max.apply(null, F.sv.map(x => x[1]));
    F.el.textContent = (ADMIN.nk.che === 1 ? 'NF ' : ADMIN.nk.che === 3 ? 'LO ' : '') + (gl ? (GLR.aoOn ? 'GLa ' : 'GL ') : '2D ') + Math.round(fps) + ' · min ' + Math.round(Math.min.apply(null, F.ds)) + ' · ve ' + Math.round(tb) + '/' + Math.round(mx) + ' · sim ' + Math.round(stb) + '/' + Math.round(smx) + 'x' + sbn + (gl ? ' · t' + tx : '') + ' · d' + dx + 'x' + (REN.xoayN | 0) + (gl && GLR.bn ? 'h' + Math.round(GLR.bn.hoiMax) : '') + (F.mt || '');
    F.el.style.display = '';
  },
};
requestAnimationFrame(ADMIN.fps.khung);
// NHẬT KÝ KHUNG CHẬM trên màn (chỉ admin; chạm nhãn FPS để đổi: nhật ký → nhật ký + "NF" (thử TẮT mọi CSS filter của giao diện trận: html.adm-nf) → ẩn): mỗi khung cách khung trước > 80 ms ghi 1 dòng
//   "+giây  khoảng-cách | raf = tổng ms mọi hàm requestAnimationFrame | ve = REN.ve | gl = GLR.xong (phát lệnh GPU) | up n/ms WxH = số lần tải texture / ms / canvas lớn nhất
//    | ev n/ms = số sự kiện chạm / ms xử lý | dom n id:n = số lần đổi DOM trong khung + phần tử đổi nhiều nhất". gpu = ms chờ GPU vẽ xong (gl.finish, chỉ khi bảng đang hiện); L = lệnh vẽ GL; v = cụm vector. raf nhỏ mà khoảng cách lớn → nghẽn ở trình duyệt (ghép lớp, dọn rác, DOM), không phải code vẽ.
ADMIN.nk = {
  el: null, ds: [], an: true, che: 2, k: null, t0: 0, // 11/11 tối: nhật ký mặc định ẨN (đã tìm ra lỗi giật) — chạm nhãn FPS: hiện nhật ký → NF → ẩn
  moi() { return { raf: 0, ve: 0, gl: 0, gpu: 0, lenh: 0, vec: 0, un: 0, um: 0, uw: 0, uh: 0, en: 0, em: 0, dom: 0, noi: null }; },
  bat() {
    if (this._bat || !ADMIN.la()) return; this._bat = 1; const N = this; N.k = N.moi();
    const now = () => performance.now();
    const R = window.requestAnimationFrame; let cu = 0;
    window.requestAnimationFrame = function (f) { return R.call(window, function (t) { const a = now(); try { return f(t); } finally { N.k.raf += now() - a; } }); };
    const vong = (t) => { R.call(window, vong); if (cu && t - cu > 80 && ADMIN.fps.hien()) N.ghi(t, t - cu); cu = t; N.k = N.moi(); N.boc(); };
    R.call(window, vong);
    // đổi DOM trong khung (HUD vẽ lại → Safari phải bố cục + tô lại ngoài code vẽ trận): đếm + phần tử đổi nhiều nhất
    try { new MutationObserver((ds) => { const k = N.k, m = k.noi || (k.noi = {}); k.dom += ds.length; for (const d of ds) { let e = d.target; if (e && e.nodeType !== 1) e = e.parentNode; let id = ''; for (let i = 0; e && i < 4 && !id; i++, e = e.parentNode) id = e.id || ''; id = id || '?'; m[id] = (m[id] || 0) + 1; } }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true }); } catch (e) { }
    let e0 = 0;
    for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'touchstart', 'touchmove', 'touchend', 'click']) {
      window.addEventListener(ev, () => { e0 = now(); N.k.en++; }, { capture: true, passive: true });
      window.addEventListener(ev, () => { if (e0) { N.k.em += now() - e0; e0 = 0; } }, { passive: true });
    }
  },
  // bọc REN.ve, GLR.xong và 2 hàm tải texture của ngữ cảnh GL (bọc lại khi ngữ cảnh đổi)
  boc() {
    const N = this, now = () => performance.now();
    if (!N._ve && typeof REN !== 'undefined' && REN.ve) { N._ve = 1; const g = REN.ve; REN.ve = function () { const a = now(); try { return g.apply(this, arguments); } finally { N.k.ve += now() - a; } }; }
    if (typeof GLR === 'undefined') return;
    if (!N._xong && GLR.xong) { N._xong = 1; const g = GLR.xong; GLR.xong = function () { const a = now(), ve = this.dangVe; try { return g.apply(this, arguments); } finally { const b = now(); N.k.gl += b - a; if (ve && this.gl && !N.an) { try { this.gl.finish(); } catch (e) { } N.k.gpu += now() - b; if (this.dem) { N.k.lenh = this.dem.lenh; N.k.vec = this.dem.vec; } } } }; }
    const gl = GLR.gl; if (!gl || gl._nk) return; gl._nk = 1;
    for (const f of ['texImage2D', 'texSubImage2D']) { const g = gl[f]; gl[f] = function () { const im = arguments[arguments.length - 1], a = now(); try { return g.apply(this, arguments); } finally { if (im && im.width) { const d = now() - a; N.k.un++; N.k.um += d; if (im.width * im.height > N.k.uw * N.k.uh) { N.k.uw = im.width; N.k.uh = im.height; } } } }; }
  },
  ghi(t, kc) {
    const k = this.k, r = Math.round; if (!this.t0) this.t0 = t;
    this.ds.push('+' + ((t - this.t0) / 1000).toFixed(1) + 's ' + r(kc) + 'ms | raf' + r(k.raf) + ' ve' + r(k.ve) + (k.lenh || k.un ? ' gl' + r(k.gl) + ' gpu' + r(k.gpu) + ' L' + k.lenh + ' v' + k.vec + ' up' + k.un + '/' + r(k.um) + (k.un ? ' ' + k.uw + 'x' + k.uh : '') : '') + ' | ev' + k.en + '/' + r(k.em) + ' | dom' + k.dom + (k.noi ? ' ' + Object.entries(k.noi).sort((a, b) => b[1] - a[1]).slice(0, 2).map(x => x[0] + ':' + x[1]).join(' ') : ''));
    if (this.ds.length > 9) this.ds.shift(); this.ve();
  },
  ve() {
    if (!this.el) {
      this.el = document.createElement('div'); this.el.id = 'adm-nk'; document.body.appendChild(this.el);
    }
    this.el.style.display = this.an || !ADMIN.fps.hien() ? 'none' : ''; this.el.textContent = this.ds.join('\n');
  },
};
ADMIN.nk.bat();
document.addEventListener('DOMContentLoaded', () => {
  if (ADMIN._noi || typeof NET === 'undefined') return; ADMIN._noi = 1; // DOMContentLoaded có thể phát 2 lần (thật + bộ nạp phát lại sau script cuối)
  if (typeof NET !== 'undefined' && NET.khiDoiTK) NET.khiDoiTK((u) => ADMIN.xet(u));
  if (typeof TK !== 'undefined') for (const f of ['veChip', 'veBang']) if (TK[f]) { const g = TK[f]; TK[f] = function () { const x = g.apply(this, arguments); ADMIN.nhan(); return x; }; }
  ADMIN.nhan();
});
