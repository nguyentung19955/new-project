// XƯỞNG SPRITE: giao diện năm bước (chọn, đưa hình, khung cơ thể, chuyển động, xuất tệp), lưu nháp, mở tệp, xem trong game.
(function () {
  'use strict';
  const XS = window.XS, G = window.G, MA = G.monsterArt, SC = G.spriteCustom;
  const $ = (id) => document.getElementById(id);
  const VUNG = { rung: 'Rừng già', bien: 'Hang biển', laudai: 'Lâu đài cổ', moi: 'Quái mới' };
  const VUNG_SO = { rung: 0, bien: 1, laudai: 2 };
  const LOAI = { thuong: 'Quái thường', tinhanh: 'Tinh anh', trumnho: 'Trùm nhỏ', trum: 'Trùm vùng' };
  const EM_BE = [
    { ma: 'em-be', ten: 'Em bé (cả bốn)', key: 'smith' }, { ma: 'em-be-smith', ten: 'Thợ Rèn', key: 'smith' }, { ma: 'em-be-hunter', ten: 'Thợ Săn', key: 'hunter' },
    { ma: 'em-be-healer', ten: 'Thầy Lang', key: 'healer' }, { ma: 'em-be-wrestler', ten: 'Đô Vật', key: 'wrestler' }];
  // Thời lượng động tác của em bé trong game (động tác một lần do game quyết định theo tiến độ).
  const GOC_EM_BE = { idle: 1.23, move: 0.62, tele: 0.4, atk: 0.4, hit: 0.2, die: 0.6, ne: 0.27 };
  const OL_QUAI = XS.hex('#14182e'), OL_EM_BE = XS.hex('#1b1118'), OL_NL = XS.hex('#1a1420');
  const olCua = (doi) => (doi === 'em-be' ? OL_EM_BE : doi === 'nguoi-lang' ? OL_NL : OL_QUAI);
  const NHAP = 'xuongSprite.nhap.', THU = 'xuongSprite.thu';
  const THU_URL = window.XS_THU_URL || 'thu.html';
  const VU_KHI = { type: 'sword', family: 0, rarity: 1, marks: { fire: 0, poison: 0, ice: 0 }, sharpen: 0 };

  // ---------- trạng thái ----------
  const S = {
    buoc: 1, muc: null, nguon: null, sua: null, lichSu: [], mat: null, R: null, kh: null, tam: null, sp: null, tamCu: true,
    tach: { nguong: 40, kieu: 'mep', boDom: true, lat: false, cao: 36, soMau: 12, vien: true },
    dong_tac: {}, thay_cho: null, chiAnh: false,
    xem: { goc: true, cu: '', zoom3: 0, che: 'khop', boChon: 0, coTo: 2, ten: 'idle', t: 0, face: 1, nen: true, emBe: true, soGoc: false, lap: true, zoom: 2, lanLuot: false },
  };
  window.XS_S = S; // để bài kiểm tra đọc
  let XD = null; // phần đồ (do.js): vũ khí, trang phục, vật phẩm
  const laDo = () => !!(XD && XD.laDo());

  // ---------- tiện ích ----------
  let tbHen = 0;
  function bao(chu, loi) { const e = $('thongBao'); e.textContent = chu; e.className = 'hien' + (loi ? ' loi' : ''); clearTimeout(tbHen); tbHen = setTimeout(() => { e.className = ''; }, loi ? 4200 : 2600); }
  const hen = {};
  function cho(ten, ms, f) { clearTimeout(hen[ten]); hen[ten] = setTimeout(f, ms); }
  function luuMay(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function docMay(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function xoaMay(k) { try { localStorage.removeItem(k); } catch (e) { /* bỏ qua */ } }
  function oCanvas(cv) { // cỡ canvas theo khung chứa (nét theo điểm ảnh màn hình)
    const r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1, w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; return { c, w, h, d };
  }
  function oCo(c, x, y, w, h, s) { // nền ô cờ (chỗ trong suốt)
    s = s || 8; c.fillStyle = '#1d3436'; c.fillRect(x, y, w, h); c.fillStyle = '#244244';
    for (let j = 0; j * s < h; j++) for (let i = (j & 1); i * s < w; i += 2) c.fillRect(x + i * s, y + j * s, Math.min(s, w - i * s), Math.min(s, h - j * s));
  }
  function taiXuong(ten, blob) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = ten; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
  const chonChip = (nhom, el) => { for (const b of nhom.querySelectorAll('.chip')) b.classList.toggle('chon', b === el); };

  // ---------- chim Lạc trên dải đầu ----------
  (function chimLac() {
    const LAC = ['.....aa........', '....aaa....a...', 'a..aaaa...aaa..', 'aaaaaaaaaaaaaaa', '.aaaaaaaa......', '...aa.aa.......', '...a...a.......'];
    const cv = $('chimLac');
    const ve = () => { const { c, w, h, d } = oCanvas(cv); c.clearRect(0, 0, w, h); const s = Math.max(1, Math.round(2 * d)), bw = 15 * s + 18 * d;
      c.fillStyle = 'rgba(217,164,65,.55)';
      for (let k = 0; k * bw < w; k++) for (let j = 0; j < LAC.length; j++) for (let i = 0; i < 15; i++) if (LAC[j][i] === 'a') c.fillRect(Math.round(k * bw + i * s), Math.round((h - 7 * s) / 2 + j * s + (k % 2 ? s : 0)), s, s); };
    ve(); window.addEventListener('resize', ve);
  })();

  // ---------- danh sách để chọn ----------
  function thongTinGoc(ma) { return MA.list.find((m) => m.id === ma) || null; }
  function gocDongTac(muc) {
    if (!muc) return null;
    if (muc.doi === 'em-be') return GOC_EM_BE;
    const m = thongTinGoc(muc.ma); if (!m) return null;
    const o = {}; for (const a of m.anims) if (XS.DONG_TAC[a.id]) o[a.id] = a.d; return o;
  }
  function veQuaiCode(c, ma, x, y, t, anim, face) {
    try { (MA.drawCode || MA.draw).call(MA, c, ma, x, y, { anim: anim || 'idle', t: t || 0, face: face || -1, bao: false }); } catch (e) { /* bỏ qua */ }
  }
  function veEmBeCode(c, key, x, y, t, face, o) {
    try { (G.art.heroCode || G.art.hero).call(G.art, c, Object.assign({ x, y, face: face || 1, key: key || 'smith', move: false, t: t || 0, atk: -1, dodge: -1, weapon: VU_KHI }, o || {})); } catch (e) { /* bỏ qua */ }
  }
  // Vẽ một thứ (quái hoặc em bé bằng code) vừa vào ô (w, h) của canvas đích.
  function veVuaO(cv, ve, cw, ch) {
    const tam = XS.taoCanvas(cw, ch), c = tam.getContext('2d'); c.imageSmoothingEnabled = false;
    ve(c, cw / 2, ch - 4);
    const d = c.getImageData(0, 0, cw, ch), m = new Uint8Array(cw * ch); for (let i = 0; i < m.length; i++) m[i] = d.data[i * 4 + 3] > 20 ? 1 : 0;
    const bb = XS.khung(m, cw, ch), x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.clearRect(0, 0, cv.width, cv.height);
    if (!bb) return;
    let k = Math.min((cv.width - 4) / bb.w, (cv.height - 4) / bb.h); if (k >= 1) k = Math.floor(k);
    x.drawImage(tam, bb.x0, bb.y0, bb.w, bb.h, Math.round((cv.width - bb.w * k) / 2), Math.round((cv.height - bb.h * k) / 2), Math.round(bb.w * k), Math.round(bb.h * k));
  }
  // ---------- người làng (js/village_scene.js) ----------
  const VSC = G.villageScene;
  function dsNguoiLang() {
    if (!VSC || !VSC.NPCS) return [];
    return VSC.ORDER.map((k) => ({ ma: 'nl-' + k, ten: VSC.NPCS[k].ten, doi: 'nguoi-lang', nl: k, vung: 'rung', phu: VSC.NPCS[k].viec }));
  }
  function veNguoiLangCode(c, k, x, y, f, o) {
    try { if (VSC && VSC.npcCode) { const sp = VSC.npcCode(k, f || 0, o || {}); c.imageSmoothingEnabled = false; c.drawImage(sp.cv, Math.round(x - sp.ox), Math.round(y - sp.oy)); } } catch (e) { /* bỏ qua */ }
  }
  function caoNguoiLang(k) { // chiều cao hình người làng gốc (điểm ảnh, không tính viền)
    try { const sp = VSC.npcCode(k, 0, {}), d = sp.cv.getContext('2d').getImageData(0, 0, sp.cv.width, sp.cv.height).data; let y0 = -1, y1 = -1;
      for (let y = 0; y < sp.cv.height; y++) for (let x = 0; x < sp.cv.width; x++) if (d[(y * sp.cv.width + x) * 4 + 3] > 20) { if (y0 < 0) y0 = y; y1 = y; }
      return y0 < 0 ? 34 : Math.max(16, y1 - y0 - 1); } catch (e) { return 34; }
  }
  function dsNhap() { const o = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(NHAP) === 0) o.push(k.slice(NHAP.length)); } } catch (e) { /* bỏ qua */ } return o; }
  // Các nhóm ở trang chọn. Mỗi lần chỉ hiện một nhóm cho gọn; thẻ nào cũng có hình hiện tại (vẽ bằng code) để so.
  const NHOM = [['em-be', 'Em bé'], ['quai', 'Quái'], ['vu-khi', 'Vũ khí'], ['trang-phuc', 'Trang phục'], ['do', 'Đồ và tài nguyên'], ['nguoi-lang', 'Người làng']];
  function nhomCua(m) {
    if (!m) return null;
    if (m.doi === 'vat-pham') return 'do';
    return m.doi === 'em-be' || m.doi === 'vu-khi' || m.doi === 'trang-phuc' || m.doi === 'nguoi-lang' ? m.doi : 'quai';
  }
  const nhomCuaMa = (ma) => (/^em-be/.test(ma) ? 'em-be' : /^vk-/.test(ma) ? 'vu-khi' : /^tp-/.test(ma) ? 'trang-phuc' : /^vp-/.test(ma) ? 'do' : /^nl-/.test(ma) ? 'nguoi-lang' : 'quai');
  S.xem.nhom = docMay('xuongSprite.nhom') || 'em-be';
  function moNhom(k) {
    if (!NHOM.some((n) => n[0] === k)) k = 'em-be';
    S.xem.nhom = k; luuMay('xuongSprite.nhom', k);
    for (const b of document.querySelectorAll('#nhomChon .chip')) b.classList.toggle('chon', b.dataset.nhom === k);
    for (const g of document.querySelectorAll('#dsChon [data-nhom]')) g.classList.toggle('an', g.dataset.nhom !== k);
    for (const cv of document.querySelectorAll('#dsChon [data-nhom="' + k + '"] canvas[data-cho]')) { const f = cv._ve; cv.removeAttribute('data-cho'); if (f) requestAnimationFrame(f); }
  }
  function dungDanhSach() {
    const box = $('dsChon'); box.innerHTML = '';
    const nhap = new Set(dsNhap()), dem = {};
    const khoi = {};
    for (const n of NHOM) { const k = document.createElement('div'); k.dataset.nhom = n[0]; box.appendChild(k); khoi[n[0]] = k; dem[n[0]] = 0; }
    const nhom = (ten, k) => { const h = document.createElement('div'); h.className = 'vung-ten'; h.textContent = ten; khoi[k].appendChild(h); const l = document.createElement('div'); l.className = 'luoi'; khoi[k].appendChild(l); l._nhom = k; return l; };
    const the = (l, muc, ve, phu) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'the'; b.dataset.ma = muc.ma;
      const cv = XS.taoCanvas(192, 144); b.appendChild(cv);
      const t = document.createElement('b'); t.textContent = muc.ten; b.appendChild(t);
      const s = document.createElement('small'); s.textContent = phu; b.appendChild(s);
      if (nhap.has(muc.ma)) { const n = document.createElement('span'); n.className = 'nhan'; n.textContent = 'Đang làm'; b.appendChild(n); }
      b.onclick = () => chonMuc(muc);
      l.appendChild(b); dem[l._nhom]++;
      cv._ve = () => veVuaO(cv, ve, 260, 200); cv.dataset.cho = '1'; // vẽ khi nhóm được mở
    };
    const l0 = nhom('Em bé', 'em-be');
    for (const e of EM_BE) the(l0, { ma: e.ma, ten: e.ten, doi: 'em-be', key: e.key, vung: 'rung' }, (c, x, y) => veEmBeCode(c, e.key, x, y, 0, 1), e.ma === 'em-be' ? 'thay cả 4 em bé' : e.ma);
    for (const v of ['rung', 'bien', 'laudai']) {
      const l = nhom(VUNG[v], 'quai');
      for (const m of MA.list) if (m.vung === v && !m.tuVe) the(l, { ma: m.id, ten: m.ten, doi: 'quai', vung: v }, (c, x, y) => veQuaiCode(c, m.id, x, y, 0), (LOAI[m.loai] || '') + ' · ' + m.id);
    }
    const l4 = nhom('Quái mới (chưa có trong game)', 'quai');
    for (const ma of nhap) if (!thongTinGoc(ma) && !/^(em-be|vk-|tp-|vp-|nl-)/.test(ma)) {
      let ten = ma; try { ten = JSON.parse(docMay(NHAP + ma)).ten || ma; } catch (e) { /* bỏ qua */ }
      the(l4, { ma, ten, doi: 'quai', vung: 'moi', moi: true }, () => {}, ma);
    }
    const b = document.createElement('button'); b.type = 'button'; b.className = 'the moi'; b.id = 'theMoi';
    b.innerHTML = '<span class="cong">+</span><b>Quái mới</b><small>đặt mã và tên</small>';
    b.onclick = moHopMoi; l4.appendChild(b);
    for (const n of XD.cacNhom()) { const l = nhom(n.ten, n.nhom); for (const m of n.ds) the(l, m, (c) => XD.veCode(c, m, 130, 100, 64), m.phu); }
    const l6 = nhom('Người làng (thay hình trong làng và khung nói chuyện)', 'nguoi-lang');
    for (const m of dsNguoiLang()) the(l6, m, (c, x, y) => veNguoiLangCode(c, m.nl, x, y, 0), m.phu);
    const bar = $('nhomChon'); bar.innerHTML = '';
    for (const n of NHOM) {
      const e = document.createElement('button'); e.type = 'button'; e.className = 'chip'; e.dataset.nhom = n[0];
      e.textContent = n[1]; const sm = document.createElement('small'); sm.textContent = dem[n[0]]; e.appendChild(sm);
      e.onclick = () => moNhom(n[0]); bar.appendChild(e);
    }
    moNhom(S.muc ? nhomCua(S.muc) : S.xem.nhom);
  }
  function moHopMoi() {
    let hop = $('hopMoi');
    if (!hop) {
      hop = document.createElement('div'); hop.className = 'hop'; hop.id = 'hopMoi';
      hop.innerHTML = '<div class="khung" style="max-width:440px;height:auto"><div class="thanh"><b class="ghi" style="color:var(--hi);font-size:16px">Quái mới</b></div>' +
        '<div class="noi-dung"><p class="ghi">Mã chỉ gồm chữ không dấu, số, gạch ngang (ví dụ: rongDat). Tên là tên tiếng Việt.</p>' +
        '<div class="dong"><label>Mã</label><input type="text" id="moiMa" maxlength="40" placeholder="rongDat"></div>' +
        '<div class="dong"><label>Tên</label><input type="text" id="moiTen" maxlength="40" placeholder="Rồng Đất"></div>' +
        '<div class="dong"><label>Vùng (để xem nền phòng)</label><select id="moiVung"><option value="rung">Rừng già</option><option value="bien">Hang biển</option><option value="laudai">Lâu đài cổ</option></select></div>' +
        '<p class="ghi" id="moiLoi" style="color:#ff9a7a"></p></div>' +
        '<div class="thanh" style="justify-content:flex-end"><button class="nut nho phu" id="moiHuy" type="button">Thôi</button><button class="nut nho" id="moiTao" type="button">Tạo</button></div></div>';
      document.body.appendChild(hop);
      $('moiHuy').onclick = () => hop.classList.remove('hien');
      $('moiTao').onclick = () => {
        const ma = $('moiMa').value.trim(), ten = $('moiTen').value.trim() || ma;
        if (!/^[A-Za-z][A-Za-z0-9-]{1,39}$/.test(ma) || /^em-be/.test(ma)) { $('moiLoi').textContent = 'Mã chưa đúng: bắt đầu bằng chữ, chỉ chữ không dấu, số, gạch ngang.'; return; }
        if (thongTinGoc(ma)) { $('moiLoi').textContent = 'Mã này trùng quái có sẵn. Hãy chọn quái đó trong danh sách.'; return; }
        hop.classList.remove('hien');
        chonMuc({ ma, ten, doi: 'quai', vung: $('moiVung').value, moi: true });
      };
    }
    $('moiLoi').textContent = ''; hop.classList.add('hien'); $('moiMa').focus();
  }

  // ---------- chọn một thứ ----------
  function datLaiCongViec() {
    S.nguon = null; S.sua = null; S.lichSu = []; S.mat = null; S.R = null; S.kh = null; S.tam = null; S.sp = null; S.tamCu = true; S.chiAnh = false;
    S.dong_tac = {}; S.thay_cho = null; S.dd = null; S._anhDo = null;
    if (XD) XD.boDangKy();
  }
  async function chonMuc(muc) {
    datLaiCongViec();
    S.muc = muc;
    const g = thongTinGoc(muc.ma);
    S.tach = { nguong: 40, kieu: 'mep', boDom: true, lat: false, cao: muc.doi === 'em-be' ? 28 : muc.doi === 'nguoi-lang' ? caoNguoiLang(muc.nl) : g ? g.h : XD.laDo(muc) ? XD.caoGoc(muc) : 36, soMau: 12, vien: true };
    if (!muc.vung && g) muc.vung = g.vung;
    const raw = docMay(NHAP + muc.ma);
    if (raw) { try { await khoiPhuc(JSON.parse(raw), true); bao('Đã mở bản nháp đang làm của ' + muc.ten); return; } catch (e) { bao('Bản nháp hỏng, làm mới từ đầu', true); } }
    capNhatDau(); hienSlider(); veBuoc2(); denBuoc(2);
  }
  function capNhatDau() {
    const m = S.muc;
    $('dangLam').innerHTML = m ? 'Đang làm: <b></b> (' + m.ma + ')' : 'Chưa chọn gì';
    if (m) $('dangLam').querySelector('b').textContent = m.ten;
    for (const b of document.querySelectorAll('.the')) b.classList.toggle('chon', !!m && b.dataset.ma === m.ma);
  }
  function denBuoc(n) {
    if (n >= 2 && !S.muc) return;
    if (n >= 3 && !S.R) { bao('Hãy đưa hình vào trước', true); n = 2; }
    if (n === 3 && S.muc.doi === 'vat-pham') n = S.buoc === 4 ? 2 : 4; // vật phẩm không cần bước khung
    S.buoc = n;
    if (n >= 3 && !S.kh && !laDo()) chonMau(XS.goiYMau(S.muc.ma, (thongTinGoc(S.muc.ma) || {}).bay));
    if (!laDo()) { $('bang3Vk').classList.add('an'); $('bang3Tp').classList.add('an'); $('bang3Quai').classList.remove('an'); $('khoiChinhDT').classList.remove('an'); $('khoiBac').classList.add('an'); $('khoiBe4').classList.add('an'); for (const id of ['coEmBe', 'lapLai']) $(id).parentNode.classList.remove('an'); }
    for (let i = 1; i <= 5; i++) $('b' + i).classList.toggle('hien', i === n);
    for (const b of document.querySelectorAll('#cacBuoc button')) {
      const k = +b.dataset.b;
      b.disabled = (k >= 2 && !S.muc) || (k >= 3 && !S.R) || (k === 3 && S.muc && S.muc.doi === 'vat-pham');
      b.classList.toggle('dang', k === n); b.classList.toggle('xong', k < n);
    }
    if (n === 1) dungDanhSach();
    if (n === 2) { veBuoc2(); }
    if (n === 3 && laDo()) XD.dungBuoc3();
    else if (n === 3) { if (!S.kh) chonMau(XS.goiYMau(S.muc.ma, (thongTinGoc(S.muc.ma) || {}).bay)); dungBuoc3(); veBuoc3(); }
    if (n === 4 && laDo()) { XD.dungBuoc4(); S.xem.t = 0; }
    else if (n === 4) { dungBuoc4(); lamTam(true); S.xem.t = 0; }
    if (n === 5) { if (!laDo()) lamTam(true); else XD.dangKy(); dungBuoc5(); veBuoc5(); }
    capNhatDau();
  }
  for (const b of document.querySelectorAll('#cacBuoc button')) b.onclick = () => denBuoc(+b.dataset.b);

  // ================= BƯỚC 2: đưa hình =================
  const cv2 = $('cv2');
  function hienSlider() {
    const t = S.tach;
    $('nguong').value = t.nguong; $('oNguong').textContent = t.nguong;
    $('caoPx').value = t.cao; $('oCao').textContent = t.cao + ' px';
    $('soMau').value = t.soMau; $('oSoMau').textContent = t.soMau;
    $('boDom').checked = t.boDom; $('latAnh').checked = t.lat; $('vienToi').checked = t.vien;
    for (const b of document.querySelectorAll('[data-kieu]')) b.classList.toggle('chon', b.dataset.kieu === t.kieu);
    const g = S.muc && thongTinGoc(S.muc.ma);
    $('ghiCo').textContent = laDo() ? (S.muc.doi === 'vu-khi' ? 'Vũ khí gốc dài khoảng ' + XD.caoGoc(S.muc) + ' điểm ảnh (vẽ nằm ngang hay dựng đứng thì thanh trượt đều là chiều dài).' : 'Hình gốc cao khoảng ' + XD.caoGoc(S.muc) + ' điểm ảnh.') : S.muc && S.muc.doi === 'em-be' ? 'Em bé trong game cao khoảng 26 đến 31 điểm ảnh (cả mũ).' : S.muc && S.muc.doi === 'nguoi-lang' ? 'Người làng gốc cao khoảng ' + caoNguoiLang(S.muc.nl) + ' điểm ảnh. Khung nói chuyện tự phóng to gấp ba.' : g ? 'Quái gốc: rộng ' + g.w + ', cao ' + g.h + ' điểm ảnh.' : 'Quái thường cao khoảng 25 đến 40, tinh anh 45 đến 60, trùm 65 đến 120 điểm ảnh.';
    for (const id of ['nguong', 'boDom', 'latAnh', 'caoPx', 'soMau', 'vienToi']) $(id).disabled = S.chiAnh;
    $('vungTha').classList.toggle('an', !!S.nguon || S.chiAnh);
    $('nutSang3').disabled = !S.R;
  }
  // Vũ khí vẽ nằm ngang: thanh trượt là chiều dài (cạnh dài) của vũ khí, đổi ra chiều cao thật để thu cỡ.
  function caoThat(cao) {
    if (!S.muc || S.muc.doi !== 'vu-khi' || !S.mat || !S.nguon) return cao;
    const bb = XS.khung(S.mat, S.nguon.w, S.nguon.h);
    return bb && bb.w > bb.h ? Math.max(3, Math.round((cao * bb.h) / bb.w)) : cao;
  }
  function tinhLai() {
    if (!S.nguon) return;
    const t = S.tach;
    S.mat = XS.tachNen(S.nguon, { nguong: t.nguong, kieu: t.kieu, boDom: t.boDom, sua: S.sua });
    const Rmoi = XS.pixelHoa(S.nguon, S.mat, { cao: caoThat(t.cao), soMau: t.soMau, lat: t.lat });
    datHinh(Rmoi);
    veBuoc2(); hienSlider(); luuNhap();
  }
  // Đặt hình pixel mới; giữ khớp và bộ phận đã chỉnh bằng cách đổi theo cỡ mới.
  function datHinh(Rmoi) {
    const cu = S.R, kh = S.kh;
    S.R = Rmoi; S.tamCu = true;
    if (laDo()) { if (Rmoi) { XD.doiCo(); XD.dangKy(); } return; }
    if (!Rmoi || !kh) return;
    if (cu && cu.w === Rmoi.w && cu.h === Rmoi.h) { const bo = kh.bo; for (let i = 0; i < bo.length; i++) if (Rmoi.px[i] && bo[i] === 255) { kh.bo = XS.doiCoBoPhan({ w: cu.w, h: cu.h, bo }, Rmoi, kh.mau, kh.khop); break; } return; }
    const kx = Rmoi.w / (cu ? cu.w : Rmoi.w), ky = Rmoi.h / (cu ? cu.h : Rmoi.h), khop = {};
    for (const n in kh.khop) khop[n] = [kh.khop[n][0] * kx, kh.khop[n][1] * ky];
    kh.bo = cu ? XS.doiCoBoPhan({ w: cu.w, h: cu.h, bo: kh.bo }, Rmoi, kh.mau, khop) : XS.tuDoan(Rmoi, kh.mau, khop);
    kh.khop = khop;
  }
  async function nhanAnh(file) {
    if (!file || !/^image\//.test(file.type)) { bao('Tệp này không phải ảnh', true); return; }
    try {
      const A = await XS.docTep(file);
      S.nguon = A; S.sua = new Uint8Array(A.w * A.h); S.lichSu = []; S.chiAnh = false;
      tinhLai();
      S.xem.goc = true; chonChip(cv2.parentNode.previousElementSibling, $('xemGoc'));
      bao(S.R ? 'Đã tách nền và pixel hoá. Kiểm tra lại rồi bấm Tiếp.' : 'Không thấy hình: thử giảm ngưỡng tách nền', !S.R);
    } catch (e) { bao(e.message || 'Không đọc được ảnh', true); }
  }
  $('nutChonAnh').onclick = () => $('chonAnh').click();
  $('nutDoiAnh').onclick = () => $('chonAnh').click();
  $('chonAnh').onchange = (e) => { nhanAnh(e.target.files[0]); e.target.value = ''; };
  for (const el of [$('san2'), $('vungTha')]) {
    el.addEventListener('dragover', (e) => { e.preventDefault(); $('vungTha').classList.add('keo'); });
    el.addEventListener('dragleave', () => $('vungTha').classList.remove('keo'));
    el.addEventListener('drop', (e) => { e.preventDefault(); $('vungTha').classList.remove('keo'); const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) nhanAnh(f); });
  }
  const datTach = (k, v, ms) => { S.tach[k] = v; cho('tinh', ms == null ? 60 : ms, tinhLai); };
  $('nguong').oninput = (e) => { $('oNguong').textContent = e.target.value; datTach('nguong', +e.target.value, 90); };
  $('caoPx').oninput = (e) => { $('oCao').textContent = e.target.value + ' px'; datTach('cao', +e.target.value); };
  $('soMau').oninput = (e) => { $('oSoMau').textContent = e.target.value; datTach('soMau', +e.target.value); };
  $('boDom').onchange = (e) => datTach('boDom', e.target.checked, 0);
  $('latAnh').onchange = (e) => datTach('lat', e.target.checked, 0);
  $('vienToi').onchange = (e) => { S.tach.vien = e.target.checked; S.tamCu = true; veBuoc2(); luuNhap(); };
  for (const b of document.querySelectorAll('[data-kieu]')) b.onclick = () => { chonChip(b.parentNode, b); datTach('kieu', b.dataset.kieu, 0); };
  for (const b of document.querySelectorAll('[data-cu]')) b.onclick = () => { chonChip(b.parentNode, b); S.xem.cu = b.dataset.cu; if (S.xem.cu && !S.xem.goc) { S.xem.goc = true; chonChip($('xemGoc').parentNode, $('xemGoc')); } veBuoc2(); };
  $('coBut').oninput = (e) => { $('oCoBut').textContent = e.target.value; };
  $('xemGoc').onclick = () => { S.xem.goc = true; chonChip($('xemGoc').parentNode, $('xemGoc')); veBuoc2(); };
  $('xemPixel').onclick = () => { S.xem.goc = false; chonChip($('xemGoc').parentNode, $('xemPixel')); veBuoc2(); };
  $('nutHoanTac').onclick = () => { if (!S.lichSu.length) { bao('Không còn gì để hoàn tác'); return; } S.sua = S.lichSu.pop(); tinhLai(); };
  $('nutXoaSua').onclick = () => { if (!S.sua) return; S.lichSu.push(S.sua.slice()); S.sua.fill(0); tinhLai(); };
  $('nutSang3').onclick = () => denBuoc(3);

  let bo2 = null; // vị trí vẽ ảnh nguồn trên canvas bước 2
  function veBuoc2() {
    if (S.buoc !== 2 && S.buoc !== 0) { /* vẫn vẽ để sẵn */ }
    const { c, w, h, d } = oCanvas(cv2);
    c.fillStyle = '#0d1c1d'; c.fillRect(0, 0, w, h);
    const gy = $('goiY2');
    if (!S.nguon && !S.R) { gy.textContent = ''; return; }
    if (S.xem.goc && S.nguon) {
      const A = S.nguon, k = Math.min((w - 20 * d) / A.w, (h - 30 * d) / A.h), dw = A.w * k, dh = A.h * k, x0 = (w - dw) / 2, y0 = (h - dh) / 2;
      bo2 = { x0, y0, k };
      oCo(c, x0, y0, dw, dh, 10 * d);
      if (!S._cvNguon || S._cvNguonSrc !== A) { S._cvNguon = XS.raCanvas(A.w, A.h, A.px); S._cvNguonSrc = A; }
      // ảnh đã tách nền: chỗ bị xoá làm mờ có sọc đỏ để dễ thấy
      const m = S.mat, out = new Uint32Array(A.w * A.h);
      for (let i = 0; i < out.length; i++) out[i] = m && m[i] ? A.px[i] : (S.sua && S.sua[i] === 2 ? 0x55303cff : (A.px[i] & 0x00ffffff) | 0x26000000);
      c.imageSmoothingEnabled = true;
      c.drawImage(XS.raCanvas(A.w, A.h, out), x0, y0, dw, dh);
      c.imageSmoothingEnabled = false;
      gy.textContent = S.xem.cu ? (S.xem.cu === 'but' ? 'Bút giữ lại: tô lên chỗ bị xoá nhầm.' : 'Cục tẩy: tô lên chỗ nền còn sót.') : 'Chỗ mờ là nền đã tách. Sai thì dùng Bút giữ lại hoặc Cục tẩy.';
      if (vtBut) { c.strokeStyle = S.xem.cu === 'tay' ? '#ff7a5c' : '#9be05a'; c.lineWidth = 2 * d; c.beginPath(); c.arc(vtBut[0], vtBut[1], (+$('coBut').value) * d, 0, Math.PI * 2); c.stroke(); }
      return;
    }
    // hình pixel: so cạnh hình code cùng cỡ
    const R = S.R; if (!R) { gy.textContent = 'Chưa có hình: thử giảm ngưỡng tách nền.'; return; }
    const vien = S.tach.vien ? (laDo() ? OL_EM_BE : olCua(S.muc.doi)) : 0, P = XS.noi(R.px, R.w, R.h, 1), px = vien ? XS.themVien(P.px, P.w, P.h, vien) : P.px;
    const goc = XS.taoCanvas(Math.max(8, R.w * 2 + 8), Math.max(8, R.h + 8)), gc = goc.getContext('2d'); gc.imageSmoothingEnabled = false;
    if (laDo()) XD.veCode(gc, S.muc, goc.width / 2, goc.height / 2, Math.min(goc.width, goc.height) - 4);
    else if (S.muc.doi === 'em-be') veEmBeCode(gc, S.muc.key, goc.width / 2, goc.height - 3, 0, 1); else if (S.muc.doi === 'nguoi-lang') veNguoiLangCode(gc, S.muc.nl, goc.width / 2, goc.height - 3, 0); else if (!S.muc.moi) veQuaiCode(gc, S.muc.ma, goc.width / 2, goc.height - 3, 0, 'idle', 1);
    const gd = gc.getImageData(0, 0, goc.width, goc.height), gm = new Uint8Array(goc.width * goc.height); for (let i = 0; i < gm.length; i++) gm[i] = gd.data[i * 4 + 3] > 20 ? 1 : 0;
    const gb = XS.khung(gm, goc.width, goc.height);
    const totalW = P.w + (gb ? gb.w + 10 : 0), totalH = Math.max(P.h, gb ? gb.h : 0);
    const z = Math.max(1, Math.floor(Math.min((w - 30 * d) / totalW, (h - 40 * d) / totalH)));
    const x0 = Math.round((w - totalW * z) / 2), yb = Math.round((h + totalH * z) / 2);
    if (gb) { c.drawImage(goc, gb.x0, gb.y0, gb.w, gb.h, x0, yb - gb.h * z, gb.w * z, gb.h * z); }
    const xr = x0 + (gb ? (gb.w + 10) * z : 0);
    oCo(c, xr, yb - P.h * z, P.w * z, P.h * z, Math.max(4, z * 2));
    c.drawImage(XS.raCanvas(P.w, P.h, px), xr, yb - P.h * z, P.w * z, P.h * z);
    c.fillStyle = '#a9c2b4'; c.font = Math.round(12 * d) + 'px "Be Vietnam Pro", sans-serif'; c.textAlign = 'center';
    if (gb) c.fillText('Hình code', x0 + gb.w * z / 2, yb + 16 * d);
    c.fillText('Hình của bạn', xr + P.w * z / 2, yb + 16 * d);
    gy.textContent = 'Hình pixel: rộng ' + R.w + ', cao ' + R.h + ' điểm ảnh, ' + XS.soMau(R.px) + ' màu. Phóng to ×' + z + '.';
  }
  // bút và cục tẩy trên ảnh nguồn
  let vtBut = null, dangTo2 = false;
  function to2(e) {
    if (!bo2 || !S.nguon || !S.xem.cu) return;
    const r = cv2.getBoundingClientRect(), d = window.devicePixelRatio || 1, x = (e.clientX - r.left) * d, y = (e.clientY - r.top) * d;
    vtBut = [x, y];
    if (dangTo2) {
      const A = S.nguon, cx = (x - bo2.x0) / bo2.k, cy = (y - bo2.y0) / bo2.k, rr = (+$('coBut').value) * d / bo2.k, v = S.xem.cu === 'but' ? 1 : 2;
      for (let yy = Math.max(0, Math.floor(cy - rr)); yy <= Math.min(A.h - 1, cy + rr); yy++) for (let xx = Math.max(0, Math.floor(cx - rr)); xx <= Math.min(A.w - 1, cx + rr); xx++) if ((xx + 0.5 - cx) ** 2 + (yy + 0.5 - cy) ** 2 <= rr * rr) S.sua[yy * A.w + xx] = v;
      cho('tinh', 40, tinhLai);
    } else veBuoc2();
  }
  cv2.addEventListener('pointerdown', (e) => { if (!S.xem.cu || !S.nguon || !S.xem.goc) return; cv2.setPointerCapture(e.pointerId); S.lichSu.push(S.sua.slice()); if (S.lichSu.length > 25) S.lichSu.shift(); dangTo2 = true; to2(e); });
  cv2.addEventListener('pointermove', to2);
  cv2.addEventListener('pointerup', () => { dangTo2 = false; });
  cv2.addEventListener('pointerleave', () => { vtBut = null; if (S.buoc === 2) veBuoc2(); });

  // ================= BƯỚC 3: khung cơ thể =================
  const cv3 = $('cv3');
  function chonMau(mau) {
    const R = S.R; if (!R) return;
    const khop = XS.datKhop(R, mau);
    S.kh = { mau, khop, bo: XS.tuDoan(R, mau, khop) };
    S.xem.boChon = 0; S.tamCu = true; luuNhap();
  }
  function bieuTuongMau(mau) { // hình que nhỏ của mẫu xương
    const cv = XS.taoCanvas(36, 26), c = cv.getContext('2d'), M = XS.MAU[mau];
    c.lineCap = 'round';
    M.bo.forEach((b, k) => { const a = M.khop[b.a], e = M.khop[b.b]; c.strokeStyle = XS.MAU_BO[k % 8]; c.lineWidth = b.w > 1.5 ? 4 : 2.2; c.beginPath(); c.moveTo(3 + a[0] * 30, 2 + a[1] * 22); c.lineTo(3 + e[0] * 30, 2 + e[1] * 22); c.stroke(); });
    return cv;
  }
  function dungBuoc3() {
    const box = $('dsMau'); box.innerHTML = '';
    const goiY = XS.goiYMau(S.muc.ma, (thongTinGoc(S.muc.ma) || {}).bay);
    $('goiYMau').textContent = 'Gợi ý: ' + XS.MAU[goiY].ten + (S.muc.moi ? '.' : ' (theo kiểu di chuyển của ' + (S.muc.doi === 'em-be' ? 'em bé' : S.muc.doi === 'nguoi-lang' ? 'người làng' : 'quái gốc') + ').');
    for (const id of XS.MAU_THU_TU) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (S.kh && S.kh.mau === id ? ' chon' : ''); b.dataset.mau = id;
      b.appendChild(bieuTuongMau(id)); b.appendChild(document.createTextNode(XS.MAU[id].ten + (id === goiY ? ' ★' : '')));
      b.onclick = () => { chonMau(id); chonChip(box, b); dungBoPhan(); veBuoc3(); bao('Đã đặt khung ' + XS.MAU[id].ten + ' và tự chia bộ phận'); };
      box.appendChild(b);
    }
    dungBoPhan();
  }
  function dungBoPhan() {
    const box = $('dsBoPhan'); box.innerHTML = '';
    if (!S.kh) return;
    XS.MAU[S.kh.mau].bo.forEach((b, k) => {
      const e = document.createElement('button'); e.type = 'button'; e.className = 'chip' + (S.xem.che === 'to' && S.xem.boChon === k ? ' chon' : ''); e.dataset.bo = k;
      e.innerHTML = '<i style="background:' + XS.MAU_BO[k % 8] + '"></i>'; e.appendChild(document.createTextNode(b.ten));
      e.onclick = () => { S.xem.boChon = k; if (S.xem.che !== 'to') datChe('to'); chonChip(box, e); };
      box.appendChild(e);
    });
    $('dongCoTo').classList.toggle('an', S.xem.che !== 'to');
  }
  function datChe(che) {
    S.xem.che = che;
    for (const b of document.querySelectorAll('[data-che]')) b.classList.toggle('chon', b.dataset.che === che);
    $('ghiChe').textContent = che === 'khop' ? 'Kéo các chấm tròn (khớp) vào đúng chỗ vai, hông, cổ… rồi bấm "Tự đoán bộ phận".' : 'Chọn một bộ phận bên dưới rồi tô lên hình. Chỗ tô sẽ cử động theo bộ phận đó.';
    dungBoPhan(); veBuoc3();
  }
  for (const b of document.querySelectorAll('[data-che]')) b.onclick = () => datChe(b.dataset.che);
  $('coTo').oninput = (e) => { $('oCoTo').textContent = e.target.value; S.xem.coTo = +e.target.value; };
  $('nutTuDoan').onclick = () => { if (!S.kh) return; S.kh.bo = XS.tuDoan(S.R, S.kh.mau, S.kh.khop); S.tamCu = true; veBuoc3(); luuNhap(); bao('Đã chia lại bộ phận theo khớp'); };
  $('nutDatLaiKhop').onclick = () => { if (!S.kh) return; chonMau(S.kh.mau); veBuoc3(); bao('Đã đặt lại khớp theo mẫu'); };
  $('hienMau').onchange = () => veBuoc3();
  $('nutSang4').onclick = () => denBuoc(4);

  let bo3 = null;
  function veBuoc3() {
    if (laDo()) { XD.ve3(); return; }
    const { c, w, h, d } = oCanvas(cv3);
    c.fillStyle = '#0d1c1d'; c.fillRect(0, 0, w, h);
    const R = S.R, kh = S.kh; if (!R || !kh) return;
    const z = Math.max(1, Math.floor(Math.min((w - 40 * d) / R.w, (h - 40 * d) / R.h))), x0 = Math.round((w - R.w * z) / 2), y0 = Math.round((h - R.h * z) / 2);
    bo3 = { x0, y0, z };
    oCo(c, x0, y0, R.w * z, R.h * z, Math.max(4, z));
    c.drawImage(XS.raCanvas(R.w, R.h, R.px), x0, y0, R.w * z, R.h * z);
    const M = XS.MAU[kh.mau];
    if ($('hienMau').checked) {
      const ov = new Uint32Array(R.w * R.h), mau = XS.MAU_BO.map((hx) => XS.hex(hx));
      for (let i = 0; i < ov.length; i++) if (R.px[i] && kh.bo[i] !== 255) ov[i] = (mau[kh.bo[i] % 8] & 0x00ffffff) | 0x80000000;
      c.drawImage(XS.raCanvas(R.w, R.h, ov), x0, y0, R.w * z, R.h * z);
    }
    const P = (p) => [x0 + p[0] * z, y0 + p[1] * z];
    c.lineCap = 'round';
    M.bo.forEach((b, k) => { const a = P(kh.khop[b.a]), e = P(kh.khop[b.b]); c.strokeStyle = '#1a120a'; c.lineWidth = 6 * d; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(e[0], e[1]); c.stroke(); c.strokeStyle = XS.MAU_BO[k % 8]; c.lineWidth = 3 * d; c.stroke(); });
    for (const n in kh.khop) {
      const p = P(kh.khop[n]), chan = n === 'chan', r = (chan ? 7 : 6) * d;
      c.fillStyle = chan ? '#ffffff' : '#f6dc92'; c.strokeStyle = '#1a120a'; c.lineWidth = 2 * d;
      c.beginPath(); if (chan) { c.moveTo(p[0], p[1] - r); c.lineTo(p[0] + r, p[1]); c.lineTo(p[0], p[1] + r); c.lineTo(p[0] - r, p[1]); c.closePath(); } else c.arc(p[0], p[1], r, 0, Math.PI * 2);
      c.fill(); c.stroke();
      if (keoKhop === n) { c.strokeStyle = '#ff5a46'; c.beginPath(); c.arc(p[0], p[1], r + 4 * d, 0, Math.PI * 2); c.stroke(); }
    }
    $('goiY3').textContent = S.xem.che === 'khop' ? 'Chấm tròn: khớp xoay. Hình thoi trắng: điểm chân chạm đất. Màu: bộ phận.' : 'Đang tô: ' + M.bo[S.xem.boChon].ten;
  }
  let keoKhop = null;
  function toaDo3(e) { const r = cv3.getBoundingClientRect(), d = window.devicePixelRatio || 1; return [((e.clientX - r.left) * d - bo3.x0) / bo3.z, ((e.clientY - r.top) * d - bo3.y0) / bo3.z]; }
  function to3(e) {
    const p = toaDo3(e), R = S.R, rr = S.xem.coTo - 0.5;
    for (let y = Math.floor(p[1] - rr); y <= p[1] + rr; y++) for (let x = Math.floor(p[0] - rr); x <= p[0] + rr; x++) {
      if (x < 0 || y < 0 || x >= R.w || y >= R.h) continue;
      if ((x + 0.5 - p[0]) ** 2 + (y + 0.5 - p[1]) ** 2 > (rr + 0.5) ** 2) continue;
      const i = y * R.w + x; if (R.px[i]) S.kh.bo[i] = S.xem.boChon;
    }
    S.tamCu = true; veBuoc3();
  }
  cv3.addEventListener('pointerdown', (e) => {
    if (XD && XD.nhan3(e)) return;
    if (!bo3 || !S.kh) return;
    cv3.setPointerCapture(e.pointerId);
    const p = toaDo3(e);
    if (S.xem.che === 'khop') {
      let best = null, bv = (14 / bo3.z) * (window.devicePixelRatio || 1);
      for (const n in S.kh.khop) { const q = S.kh.khop[n], dd = Math.hypot(q[0] - p[0], q[1] - p[1]); if (dd < bv) { bv = dd; best = n; } }
      keoKhop = best; veBuoc3();
    } else { dangTo3 = true; to3(e); }
  });
  let dangTo3 = false;
  cv3.addEventListener('pointermove', (e) => {
    if (XD && XD.keo3(e)) return;
    if (keoKhop) { const p = toaDo3(e); S.kh.khop[keoKhop] = [Math.max(-2, Math.min(S.R.w + 2, p[0])), Math.max(-2, Math.min(S.R.h + 2, p[1]))]; S.tamCu = true; veBuoc3(); }
    else if (dangTo3) to3(e);
  });
  const tha3 = () => { if (XD && XD.tha3()) return; if (keoKhop || dangTo3) luuNhap(); keoKhop = null; dangTo3 = false; veBuoc3(); };
  cv3.addEventListener('pointerup', tha3); cv3.addEventListener('pointercancel', tha3);

  // ================= TẤM SPRITE =================
  function cauHinh() {
    return { mau: S.kh.mau, khop: S.kh.khop, bo: S.kh.bo, vien: S.tach.vien ? olCua(S.muc.doi) : 0, doi: S.muc.doi, dong_tac: S.dong_tac };
  }
  function lamTam(ngay) {
    if (!S.R || !S.kh) return null;
    if (!S.tamCu && S.tam) return S.tam;
    const f = () => {
      const T = XS.dungTam(S.R, cauHinh(), gocDongTac(S.muc));
      if (!T) return;
      S.tam = T; S.tamCu = false;
      const img = XS.raCanvas(T.w, T.h, T.px), dt = {};
      for (const k in T.dong_tac) dt[k] = Object.assign({}, T.dong_tac[k]);
      S.sp = { ma: S.muc.ma, ten: S.muc.ten, doi: S.muc.doi, fw: T.fw, fh: T.fh, ax: T.ax, ay: T.ay, rong: S.R.w, cao: S.R.h, bong: Math.max(6, S.R.w * 0.62), dt, img, ready: true, mau: {} };
      if (S.buoc === 5) veBuoc5();
    };
    if (ngay) f(); else cho('tam', 120, f);
    return S.tam;
  }

  // ================= BƯỚC 4: chuyển động =================
  const cv4 = $('cv4'), buf4 = XS.taoCanvas(480, 270);
  const PHONG = {};
  function phong(vung) {
    const r = VUNG_SO[vung] != null ? VUNG_SO[vung] : 0;
    if (!PHONG[r] && G.roomArt) {
      try { const W = { uid: 900 + r, region: r, type: 'fight', seed: 7 + r, geo: G.roomArt.geo(false), doors: [{ dir: 'left', open: true }, { dir: 'right', open: false }] }; PHONG[r] = G.roomArt.get(W).base; } catch (e) { PHONG[r] = null; }
    }
    return PHONG[r];
  }
  let NEN_LANG = null;
  function nenLang() { // nền sân làng đơn giản: cỏ, đường đất (người làng đứng trong làng, không ở trong phòng)
    if (NEN_LANG) return NEN_LANG;
    const cv = XS.taoCanvas(480, 270), c = cv.getContext('2d'); let r = 7;
    const rnd = () => { r = (r * 1103515245 + 12345) & 0x7fffffff; return r / 0x7fffffff; };
    c.fillStyle = '#3f6a3a'; c.fillRect(0, 0, 480, 270); c.fillStyle = '#8a6a48'; c.fillRect(0, 150, 480, 46); c.fillStyle = '#a07e58'; c.fillRect(0, 156, 480, 34);
    for (let i = 0; i < 260; i++) { const x = Math.floor(rnd() * 480), y = Math.floor(rnd() * 270); if (y > 146 && y < 198) continue; c.fillStyle = rnd() > 0.5 ? '#5a8a4a' : '#2f5a30'; c.fillRect(x, y, 1, 2); }
    return (NEN_LANG = cv);
  }
  function dungBuoc4() {
    const box = $('dsDongTac'); box.innerHTML = '';
    for (const ten of XS.dsDongTac(S.muc.doi)) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (S.xem.ten === ten ? ' chon' : ''); b.dataset.dt = ten; b.textContent = XS.DONG_TAC[ten].ten;
      b.onclick = () => { S.xem.lanLuot = false; datDongTac(ten); };
      box.appendChild(b);
    }
    if (!XS.dsDongTac(S.muc.doi).includes(S.xem.ten)) S.xem.ten = 'idle';
    datDongTac(S.xem.ten);
  }
  function datDongTac(ten) {
    S.xem.ten = ten; S.xem.t = 0;
    for (const b of document.querySelectorAll('#dsDongTac .chip')) b.classList.toggle('chon', b.dataset.dt === ten);
    const d = S.dong_tac[ten] || {}, goc = gocDongTac(S.muc), lap = XS.DONG_TAC[ten].lap, coDinh = !lap && goc && goc[ten];
    $('tenDongTac').textContent = XS.DONG_TAC[ten].ten;
    $('bien').value = d.bien == null ? 100 : d.bien; $('oBien').textContent = $('bien').value + '%';
    $('toc').value = d.toc || 100; $('oToc').textContent = $('toc').value + '%';
    $('dongToc').classList.toggle('an', !!coDinh);
    $('ghiToc').textContent = coDinh ? 'Động tác này dài ' + String(goc[ten]).replace('.', ',') + ' giây do game quyết định (theo ' + (S.muc.doi === 'em-be' ? 'đòn của em bé' : 'quái gốc') + ').' : 'Dài ' + String(XS.giayCua(ten, cauHinh(), goc)).replace('.', ',') + ' giây.';
  }
  const doiDT = (k, v) => { const d = S.dong_tac[S.xem.ten] || (S.dong_tac[S.xem.ten] = {}); d[k] = v; S.tamCu = true; lamTam(false); luuNhap(); };
  $('bien').oninput = (e) => { $('oBien').textContent = e.target.value + '%'; doiDT('bien', +e.target.value); };
  $('toc').oninput = (e) => { $('oToc').textContent = e.target.value + '%'; doiDT('toc', +e.target.value); setTimeout(() => datDongTacGhi(), 140); };
  function datDongTacGhi() { const t = S.xem.ten, goc = gocDongTac(S.muc); if (XS.DONG_TAC[t].lap || !(goc && goc[t])) $('ghiToc').textContent = 'Dài ' + String(XS.giayCua(t, cauHinh(), goc)).replace('.', ',') + ' giây.'; }
  $('nutMacDinh').onclick = () => { delete S.dong_tac[S.xem.ten]; S.tamCu = true; lamTam(false); datDongTac(S.xem.ten); luuNhap(); };
  $('nutLanLuot').onclick = () => { S.xem.lanLuot = true; datDongTac('idle'); bao('Xem lần lượt mọi động tác'); };
  for (const b of document.querySelectorAll('[data-huong]')) b.onclick = () => { chonChip(b.parentNode, b); S.xem.face = +b.dataset.huong; };
  for (const b of document.querySelectorAll('[data-zoom]')) b.onclick = () => { chonChip(b.parentNode, b); S.xem.zoom = +b.dataset.zoom; };
  $('coNen').onchange = (e) => { S.xem.nen = e.target.checked; };
  $('coEmBe').onchange = (e) => { S.xem.emBe = e.target.checked; };
  $('coGoc').onchange = (e) => { S.xem.soGoc = e.target.checked; };
  $('lapLai').onchange = (e) => { S.xem.lap = e.target.checked; S.xem.t = 0; };
  $('nutSang5').onclick = () => denBuoc(5);

  // Vẽ hình tự làm vào cảnh (dùng đúng bộ vẽ của game: js/sprite_custom.js)
  function veTuVe(c, x, y, ten, t, face) {
    const sp = S.sp; if (!sp) return;
    if (S.muc.doi === 'nguoi-lang') { // đúng đường vẽ người làng của game
      c.fillStyle = 'rgba(10,8,20,0.35)'; c.fillRect(Math.round(x - 8), Math.round(y - 1), 16, 3); c.fillRect(Math.round(x - 6), Math.round(y + 2), 12, 1);
      SC.veNguoiLang(c, sp, x, y, { anim: ten, t, face });
      return;
    }
    if (S.muc.doi === 'em-be') {
      const a = sp.dt[ten] || sp.dt.idle, D = a.giay, u = Math.min(1, t / D);
      const i = a.lap ? SC.khungLap(a, t) : SC.khungMot(a, u);
      c.save(); c.translate(Math.round(x), Math.round(y));
      c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(-6, -1, 12, 1); c.fillRect(-8, 0, 16, 1); c.fillRect(-6, 1, 12, 1);
      if (face < 0) c.translate(1, 0);
      SC.veKhung(c, sp, sp.dt[ten] ? ten : 'idle', i, face, { tint: ten === 'hit' && u < 0.6 ? ['#ffffff', 0.6] : null });
      c.restore();
      return;
    }
    const goc = gocDongTac(S.muc), D = (goc && goc[ten]) || (sp.dt[ten] && sp.dt[ten].giay) || 0.6;
    SC.veQuai(c, sp, x, y, { anim: ten, t, face }, true, D);
  }
  let tPrev = 0;
  function khung4(now) {
    requestAnimationFrame(khung4);
    const dt = Math.min(0.1, (now - tPrev) / 1000 || 0); tPrev = now;
    if (S.buoc !== 4 || (!S.sp && !laDo())) return;
    if (laDo()) {
      S.xem.t += dt; G.time = now / 1000;
      const c = buf4.getContext('2d'); c.imageSmoothingEnabled = false;
      const r = XD.ve4(c, S.xem.t, phong(S.muc.vung || 'rung')), X = S.xem;
      const { c: o, w, h } = oCanvas(cv4); o.fillStyle = '#000'; o.fillRect(0, 0, w, h);
      const zm = X.ten === 'tam' ? 1 : X.zoom, vw = 480 / zm, vh = 270 / zm, cx = Math.max(vw / 2, Math.min(480 - vw / 2, r[0])), cy = Math.max(vh / 2, Math.min(270 - vh / 2, r[1]));
      const k = Math.min(w / vw, h / vh), dw = vw * k, dh = vh * k;
      o.drawImage(buf4, cx - vw / 2, cy - vh / 2, vw, vh, (w - dw) / 2, (h - dh) / 2, dw, dh);
      $('goiY4').textContent = r[2];
      return;
    }
    const X = S.xem, ten = X.ten, a = S.sp.dt[ten] || S.sp.dt.idle, lap = XS.DONG_TAC[ten].lap;
    X.t += dt;
    const goc = gocDongTac(S.muc), D = lap ? a.giay : (S.muc.doi === 'em-be' ? a.giay : (goc && goc[ten]) || a.giay);
    if (!lap && X.t > D + 0.6) {
      if (X.lanLuot) { const ds = XS.dsDongTac(S.muc.doi), i = ds.indexOf(ten); datDongTac(ds[(i + 1) % ds.length]); }
      else if (X.lap) X.t = 0; else X.t = D + 0.6;
    } else if (lap && X.lanLuot && X.t > Math.max(2, a.giay * 2)) { const ds = XS.dsDongTac(S.muc.doi), i = ds.indexOf(ten); datDongTac(ds[(i + 1) % ds.length]); }
    const c = buf4.getContext('2d'); c.imageSmoothingEnabled = false; G.time = now / 1000;
    const vung = S.muc.vung && VUNG_SO[S.muc.vung] != null ? S.muc.vung : 'rung', bg = X.nen ? (S.muc.doi === 'nguoi-lang' ? nenLang() : phong(vung)) : null;
    if (bg) c.drawImage(bg, 0, 0); else { c.fillStyle = '#17363a'; c.fillRect(0, 0, 480, 270); c.fillStyle = '#12292a'; c.fillRect(0, 170, 480, 100); }
    const em = S.muc.doi === 'em-be', yS = 172;
    const xT = em ? 232 : 258, xB = em ? 196 : 206, f = X.face;
    if (X.emBe && !em) veEmBeCode(c, 'smith', xB, yS, G.time, 1);
    if (X.soGoc) { if (em) veEmBeCode(c, S.muc.key, xT + 40, yS, G.time, f); else if (S.muc.doi === 'nguoi-lang') veNguoiLangCode(c, S.muc.nl, xT + S.R.w + 18, yS, Math.floor(G.time * 2.4) % 3, ten === 'noi' ? { look: f } : {}); else if (!S.muc.moi) veQuaiCode(c, S.muc.ma, xT + S.R.w + 18, yS, X.t, ten === 'ne' ? 'idle' : ten, f); }
    if (X.emBe && em) veEmBeCode(c, S.muc.key || 'smith', xB, yS, G.time, 1);
    veTuVe(c, xT, yS, ten, X.t, f);
    const { c: o, w, h, d } = oCanvas(cv4);
    o.fillStyle = '#000'; o.fillRect(0, 0, w, h);
    const vw = 480 / X.zoom, vh = 270 / X.zoom, cx = Math.max(vw / 2, Math.min(480 - vw / 2, X.soGoc ? xT + 20 : xT - 12)), cy = Math.max(vh / 2, Math.min(270 - vh / 2, yS - Math.min(60, S.R.h * 0.6)));
    const k = Math.min(w / vw, h / vh), dw = vw * k, dh = vh * k;
    o.drawImage(buf4, cx - vw / 2, cy - vh / 2, vw, vh, (w - dw) / 2, (h - dh) / 2, dw, dh);
    const giay = lap ? a.giay : D;
    $('goiY4').textContent = XS.DONG_TAC[ten].ten + ' · ' + a.so + ' khung · ' + String(+giay.toFixed(2)).replace('.', ',') + ' giây' + (X.emBe ? ' · bên trái là em bé thật để so cỡ' : '');
  }
  requestAnimationFrame(khung4);

  // ================= BƯỚC 5: xuất tệp =================
  const cv5 = $('cv5');
  function dungBuoc5() {
    const moi = !!S.muc.moi && S.muc.doi === 'quai';
    $('khoiThayCho').classList.toggle('an', !moi);
    if (moi) {
      const sel = $('thayCho'); sel.innerHTML = '';
      const mau = S.kh && S.kh.mau;
      let goiY = null;
      for (const v of ['rung', 'bien', 'laudai']) {
        const og = document.createElement('optgroup'); og.label = VUNG[v];
        for (const m of MA.list) if (m.vung === v && !m.tuVe) {
          const op = document.createElement('option'); op.value = m.id; op.textContent = m.ten + ' (' + (LOAI[m.loai] || '') + ')'; og.appendChild(op);
          if (!goiY && v === (S.muc.vung || 'rung') && m.loai === 'thuong' && XS.goiYMau(m.id, m.bay) === mau) goiY = m.id;
        }
        sel.appendChild(og);
      }
      if (!S.thay_cho) S.thay_cho = goiY || (MA.list.find((m) => m.vung === (S.muc.vung || 'rung')) || MA.list[0]).id;
      sel.value = S.thay_cho;
      sel.onchange = () => { S.thay_cho = sel.value; luuNhap(); };
    }
    if (laDo()) S.muc.ma = XD.maHienTai();
    $('tenTep').textContent = S.muc.ma + '.sprite.json';
    $('nutTaiVe').textContent = 'Tải về ' + S.muc.ma + '.sprite.json';
    $('nutTaiAnh').textContent = 'Tải ảnh ' + S.muc.ma + '.png';
  }
  function veBuoc5() {
    const { c, w, h, d } = oCanvas(cv5);
    c.fillStyle = '#0d1c1d'; c.fillRect(0, 0, w, h);
    if (laDo()) { $('tomTat').textContent = XD.ve5(c, w, h, d); $('goiY5').textContent = 'Bên trái: hình món đồ. Bên phải: trong ô đồ.'; return; }
    const T = S.tam; if (!T) return;
    const nh = Object.keys(T.dong_tac).length, nmax = T.w / T.fw, lw = 110 * d;
    let z = Math.min((w - lw - 20 * d) / T.w, (h - 20 * d) / T.h); z = z >= 1 ? Math.floor(z) : z;
    const x0 = lw + 10 * d, y0 = Math.round((h - T.h * z) / 2);
    oCo(c, x0, y0, T.w * z, T.h * z, Math.max(4, 6 * d));
    c.drawImage(S.sp.img, x0, y0, T.w * z, T.h * z);
    c.fillStyle = '#f1e6c6'; c.font = Math.round(12 * d) + 'px "Be Vietnam Pro", sans-serif'; c.textAlign = 'right'; c.textBaseline = 'middle';
    for (const k in T.dong_tac) { const a = T.dong_tac[k]; c.fillText(XS.DONG_TAC[k].ten, lw, y0 + (a.hang + 0.5) * T.fh * z); }
    let tong = 0; for (const k in T.dong_tac) tong += T.dong_tac[k].so;
    $('tomTat').textContent = 'Mã ' + S.muc.ma + ' · ' + nh + ' động tác · ' + tong + ' khung hình · mỗi khung ' + T.fw + '×' + T.fh + ' điểm ảnh.';
    $('goiY5').textContent = 'Tấm sprite: mỗi hàng là một động tác (tối đa ' + nmax + ' khung).';
  }
  // Nội dung tệp .sprite.json. Phần cong_cu chỉ để mở lại sửa tiếp (game không dùng).
  function taoTep(coTam, coNguon) {
    if (laDo()) {
      const R = S.R, t = Object.assign({ loai: 'linh-khi-sprite', phien_ban: 1, vung: S.muc.vung || 'rung' }, R ? XD.phanTep(false) : { ma: S.muc.ma, ten: S.muc.ten, doi_tuong: S.muc.doi });
      t.cong_cu = { anh: R ? XS.pngCua(R.w, R.h, R.px) : null, rong: R ? R.w : 0, cao: R ? R.h : 0, tach: S.tach, diem: XD.phanSua(),
        nguon: coNguon && S.nguon ? XS.pngCua(S.nguon.w, S.nguon.h, S.nguon.px) : null, sua: coNguon && S.sua ? XS.nenDoan(S.sua) : null };
      t.ngay = new Date().toISOString().slice(0, 10);
      return t;
    }
    const T = coTam ? lamTam(true) : null, R = S.R, m = S.muc;
    const tep = { loai: 'linh-khi-sprite', phien_ban: 1, ma: m.ma, ten: m.ten, doi_tuong: m.doi, vung: m.vung || (thongTinGoc(m.ma) || {}).vung || 'moi' };
    if (m.moi && m.doi === 'quai') tep.thay_cho = S.thay_cho || null;
    if (T) Object.assign(tep, { tam: XS.pngCua(T.w, T.h, T.px), khung_rong: T.fw, khung_cao: T.fh, goc: [T.ax, T.ay], rong: R.w, cao: R.h, bong: Math.round(Math.max(6, R.w * 0.62)), dong_tac: T.dong_tac });
    else if (S.tam) tep.dong_tac = S.tam.dong_tac;
    tep.cong_cu = {
      anh: R ? XS.pngCua(R.w, R.h, R.px) : null, rong: R ? R.w : 0, cao: R ? R.h : 0,
      mau_xuong: S.kh ? S.kh.mau : null, khop: S.kh ? S.kh.khop : null, bo_phan: S.kh ? XS.nenDoan(S.kh.bo) : null,
      tach: S.tach, chinh: S.dong_tac,
      nguon: coNguon && S.nguon ? XS.pngCua(S.nguon.w, S.nguon.h, S.nguon.px) : null,
      sua: coNguon && S.sua ? XS.nenDoan(S.sua) : null,
    };
    tep.ngay = new Date().toISOString().slice(0, 10);
    return tep;
  }
  function tepChoGame() { const t = taoTep(true, false); delete t.cong_cu; return t; }
  $('nutTaiVe').onclick = () => {
    if (!S.R || (!S.kh && !laDo())) { bao('Chưa có hình để xuất', true); return; }
    const tep = taoTep(true, true);
    taiXuong(S.muc.ma + '.sprite.json', new Blob([JSON.stringify(tep)], { type: 'application/json' }));
    luuNhap(true);
    bao('Đã tải về ' + S.muc.ma + '.sprite.json');
  };
  $('nutTaiAnh').onclick = () => {
    if (laDo()) { const A = XD.anh(); if (A) A.cv.toBlob((b) => { if (b) taiXuong(S.muc.ma + '.png', b); }, 'image/png'); return; }
    const T = lamTam(true); if (!T) return;
    XS.raCanvas(T.w, T.h, T.px).toBlob((b) => { if (b) taiXuong(S.muc.ma + '.png', b); }, 'image/png');
  };

  // ---------- lưu nháp và mở lại ----------
  let baoDay = false;
  function luuNhap(ngay) {
    if (!S.muc) return;
    const f = () => {
      if (!S.R && !S.nguon) return;
      let tep = taoTep(false, true);
      if (!luuMay(NHAP + S.muc.ma, JSON.stringify(tep))) {
        tep = taoTep(false, false);
        if (!luuMay(NHAP + S.muc.ma, JSON.stringify(tep))) { if (!baoDay) { baoDay = true; bao('Bộ nhớ máy đã đầy: chưa lưu được nháp. Hãy tải tệp về để giữ bài.', true); } return; }
        if (!baoDay) { baoDay = true; bao('Bộ nhớ máy gần đầy: nháp chỉ giữ hình pixel, không giữ ảnh gốc.'); }
      }
    };
    if (ngay) f(); else cho('nhap', 700, f);
  }
  async function khoiPhuc(tep, tuNhap) {
    if (!tep || tep.loai !== 'linh-khi-sprite' || typeof tep.ma !== 'string') throw new Error('Không phải tệp của Xưởng Sprite');
    const g = thongTinGoc(tep.ma), em = EM_BE.find((e) => e.ma === tep.ma), nl = /^nl-(\w+)$/.exec(tep.ma), doMoi = /^(vu-khi|trang-phuc|vat-pham)$/.test(tep.doi_tuong);
    datLaiCongViec();
    if (doMoi) XD.khoiPhuc(tep, tep.cong_cu || {});
    else if (nl && tep.doi_tuong === 'nguoi-lang') { const q = dsNguoiLang().find((x) => x.ma === tep.ma); if (!q) throw new Error('Không nhận ra người làng ' + tep.ma); S.muc = q; }
    else S.muc = em ? { ma: em.ma, ten: em.ten, doi: 'em-be', key: em.key, vung: 'rung' } : { ma: tep.ma, ten: tep.ten || (g && g.ten) || tep.ma, doi: 'quai', vung: g ? g.vung : (tep.vung || 'rung'), moi: !g };
    if (S.muc.vung === 'moi') S.muc.vung = 'rung';
    const cc = tep.cong_cu || {};
    S.tach = Object.assign({ nguong: 40, kieu: 'mep', boDom: true, lat: false, cao: g ? g.h : doMoi ? XD.caoGoc(S.muc) : S.muc.doi === 'nguoi-lang' ? caoNguoiLang(S.muc.nl) : 36, soMau: 12, vien: true }, cc.tach || {});
    S.dong_tac = cc.chinh || {};
    if (!cc.chinh && tep.dong_tac) for (const k in tep.dong_tac) S.dong_tac[k] = { bien: tep.dong_tac[k].bien, toc: tep.dong_tac[k].toc };
    S.thay_cho = tep.thay_cho || null;
    let R = null;
    if (cc.anh) { const A = await XS.docPng(cc.anh); R = { w: A.w, h: A.h, px: A.px.map((c) => (c >>> 24 > 127 ? (c | 0xff000000) >>> 0 : 0)) }; }
    if (cc.nguon) {
      S.nguon = await XS.docPng(cc.nguon); S.sua = cc.sua ? XS.moDoan(cc.sua, S.nguon.w * S.nguon.h) : new Uint8Array(S.nguon.w * S.nguon.h);
      S.mat = XS.tachNen(S.nguon, { nguong: S.tach.nguong, kieu: S.tach.kieu, boDom: S.tach.boDom, sua: S.sua });
      if (!R) R = XS.pixelHoa(S.nguon, S.mat, { cao: caoThat(S.tach.cao), soMau: S.tach.soMau, lat: S.tach.lat });
    } else S.chiAnh = !!R;
    if (!R && tep.tam) throw new Error('Tệp chỉ có tấm sprite, thiếu phần để sửa tiếp');
    S.R = R;
    if (doMoi) { if (R) { if (!S.dd || !S.dd.w) XD.datMacDinh(); XD.dangKy(); } hienSlider(); capNhatDau(); if (!tuNhap) luuNhap(true); denBuoc(R ? 4 : 2); return; }
    if (R && cc.mau_xuong && XS.MAU[cc.mau_xuong] && cc.khop) S.kh = { mau: cc.mau_xuong, khop: cc.khop, bo: cc.bo_phan ? XS.moDoan(cc.bo_phan, R.w * R.h) : XS.tuDoan(R, cc.mau_xuong, cc.khop) };
    S.tamCu = true;
    hienSlider(); capNhatDau();
    if (!tuNhap) luuNhap(true);
    denBuoc(S.kh ? 4 : R ? 3 : 2);
  }
  $('nutMoTep').onclick = () => $('chonTep').click();
  $('chonTep').onchange = async (e) => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try { const tep = JSON.parse(await f.text()); await khoiPhuc(tep, false); bao('Đã mở ' + f.name); } catch (err) { bao('Không mở được tệp: ' + (err.message || err), true); }
  };

  // ---------- xem trong game ----------
  let tuDanh = false;
  function guiGame(msg) { try { $('khungGame').contentWindow.postMessage(msg, '*'); } catch (e) { /* bỏ qua */ } }
  function moGame() {
    if (!S.R || (!S.kh && !laDo())) { bao('Chưa có hình', true); return; }
    if (S.muc.moi && S.muc.doi === 'quai' && !S.thay_cho) { dungBuoc5(); }
    const tep = tepChoGame();
    luuMay(THU, JSON.stringify(tep)); // trang thử đọc khi mở (nếu cùng nguồn), còn lại gửi qua postMessage
    const ifr = $('khungGame');
    ifr.onload = () => { guiGame({ kieu: 'xuong-sprite-thu', tep }); };
    ifr.src = THU_URL + '?cloud=0&t=' + Date.now();
    $('hopGame').classList.add('hien');
    tuDanh = false; $('nutTuDanh').textContent = 'Cho bé tự đánh';
    const nl = S.muc.doi === 'nguoi-lang';
    $('nutTuDanh').classList.toggle('an', nl);
    const GHI = { 'nguoi-lang': 'người làng tự vẽ đứng trong làng, quay sang nói chuyện, vẫy tay khi em bé đứng gần; có cả ở dải khuôn mặt và khung nói chuyện.', 'vu-khi': 'em bé cầm vũ khí tự vẽ đánh nhau thật (game tự xoay theo tám hướng, thêm vệt chém).', 'trang-phuc': 'em bé mặc món đồ tự vẽ đánh nhau thật.', 'vat-pham': 'đồ tự vẽ rơi quanh em bé; bấm "Xem ở làng" để thấy biểu tượng ở dải tài nguyên góc trên.' };
    $('ghiGame').textContent = 'Bản game thử: ' + (GHI[S.muc.doi] || 'quái tự vẽ đánh nhau thật trong phòng.') + ' Không ghi vào bản lưu của game.';
    $('nutLaiGame').textContent = nl ? 'Mở / đóng khung nói chuyện' : S.muc.doi === 'vat-pham' ? 'Xem ở làng / trong trận' : 'Gọi quái lại';
    window._xsTepThu = tep;
  }
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (d && d.kieu === 'xuong-sprite-san-sang' && window._xsTepThu) guiGame({ kieu: 'xuong-sprite-thu', tep: window._xsTepThu });
  });
  $('nutXemGame4').onclick = moGame; $('nutXemGame5').onclick = moGame;
  $('nutDongGame').onclick = () => { $('hopGame').classList.remove('hien'); $('khungGame').src = 'about:blank'; };
  $('nutLaiGame').onclick = () => guiGame({ kieu: 'xuong-sprite-lenh', lenh: 'lai' });
  $('nutTuDanh').onclick = () => { tuDanh = !tuDanh; $('nutTuDanh').textContent = tuDanh ? 'Thôi tự đánh' : 'Cho bé tự đánh'; guiGame({ kieu: 'xuong-sprite-lenh', lenh: 'tu-danh', bat: tuDanh }); };
  $('nutHuongDan').onclick = () => $('hopHuongDan').classList.add('hien');
  $('nutDongHD').onclick = () => $('hopHuongDan').classList.remove('hien');

  window.addEventListener('resize', () => { if (S.buoc === 2) veBuoc2(); if (S.buoc === 3) veBuoc3(); if (S.buoc === 5) veBuoc5(); });
  // Cho bài kiểm tra gọi thẳng
  window.XS_UI = { moNhom, nhomCuaMa, denBuoc, chonMuc, nhanAnh, khoiPhuc, taoTep, tepChoGame, lamTam, chonMau, datDongTac, moGame, luuNhap };

  XD = XS.taoDo({ S, $, bao, cho, oCanvas, oCo, chonChip, luuNhap: () => luuNhap(), denBuoc: (n) => denBuoc(n), capNhatDau: () => capNhatDau() });
  dungDanhSach();
  denBuoc(1);
})();
