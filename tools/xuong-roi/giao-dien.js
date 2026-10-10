// XƯỞNG RỐI: giao diện 6 bước. Bộ vẽ và động tác dùng chung với game: G.chibi (game/js/chibi_rig.js).
(function () {
  'use strict';
  const XR = window.XR, G = (window.G = window.G || {});
  const $ = (id) => document.getElementById(id);
  const KHOA = 'xuong-roi-nhap-v1';
  const VUNG = { rung: 'Rừng già', bien: 'Hang biển', laudai: 'Lâu đài cổ' };
  const DOI = { 'em-be': 'Em bé', quai: 'Quái' };
  // PHIÊN BẢN: tăng số mỗi lần sửa công cụ, ghi ngày sửa. Mã bản (6 ký tự) do game/build.py tính từ nội dung mã nguồn.
  const PHIEN_BAN = { so: '1.8', ngay: '10/10/2026' };
  XR.PHIEN_BAN = PHIEN_BAN;
  const TEN_BUOC = ['Loại', 'Nạp ảnh', 'Gán vai', 'Ráp', 'Động tác', 'Xuất'];
  const dpr = () => Math.min(3, window.devicePixelRatio || 1);
  let demId = 0;
  const idMoi = () => 'm' + (++demId) + '_' + Date.now().toString(36);

  // ---------- trạng thái ----------
  const S = {
    buoc: 1, khung: 'nguoi', doi_tuong: 'em-be', ten: '', ma: '', maTay: false, thay_cho: '',
    anhGoc: null, nguong: 45, lem: 1, vun: 3,
    manh: [], chon: new Set(), chonRap: null,
    goc: [0, 0], cao: 40, dong_tac: {},
    khungDoan: null, canRap: true,
    anhMo: null, mo: { co: 1, x: 0, y: 0, do: 0.35 }, keoMo: false,
    view: null, dt: 'idle', quay: false, toiSau: true,
  };
  XR.S = S;

  // ---------- tiện ích ----------
  let henBao = 0;
  function bao(s, ms) {
    const b = $('bao'); b.textContent = s; b.classList.add('hien');
    clearTimeout(henBao); henBao = setTimeout(() => b.classList.remove('hien'), ms || 2800);
  }
  function el(tag, attrs, kids) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) { if (k === 'text') e.textContent = attrs[k]; else if (k === 'cls') e.className = attrs[k]; else if (k.startsWith('on')) e[k] = attrs[k]; else e.setAttribute(k, attrs[k]); }
    (kids || []).forEach((c) => c && e.appendChild(c));
    return e;
  }
  function anhNho(cv, lat) {
    const c = el('canvas'); c.width = cv.width; c.height = cv.height;
    c.getContext('2d').drawImage(cv, 0, 0);
    if (lat) c.style.transform = 'scaleX(-1)';
    return c;
  }
  const manhTheoId = (id) => S.manh.find((p) => p.id === id);
  const conChau = (id) => { const out = []; const di = (k) => { for (const p of S.manh) if (p.cha === k) { out.push(p); di(p.id); } }; di(id); return out; };

  // ---------- lưu bản làm dở ----------
  let henLuu = 0;
  function luu() {
    clearTimeout(henLuu);
    henLuu = setTimeout(() => {
      try {
        const d = {
          khung: S.khung, doi_tuong: S.doi_tuong, ten: S.ten, ma: S.ma, maTay: S.maTay, thay_cho: S.thay_cho, nguong: S.nguong, lem: S.lem, vun: S.vun,
          goc: S.goc, cao: S.cao, toiSau: S.toiSau, dong_tac: S.dong_tac, khungDoan: S.khungDoan, canRap: S.canRap, buoc: S.buoc,
          daXoa: S.daXoa || [],
          manh: S.manh.map((p) => ({ id: p.id, lat: !!p.lat, daToi: !!p.daToi, vai: p.vai, cha: p.cha, sx: p.sx, sy: p.sy, w: p.w, h: p.h, dat: p.dat, truc: p.truc, lop: p.lop, src: p.cv.toDataURL('image/png') })),
        };
        localStorage.setItem(KHOA, JSON.stringify(d));
      } catch (e) { /* đầy bộ nhớ hoặc trình duyệt chặn: bỏ qua */ }
    }, 700);
  }
  function docNhap() { try { const s = localStorage.getItem(KHOA); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function xoaNhap() { try { localStorage.removeItem(KHOA); } catch (e) { /* bỏ qua */ } }
  async function napNhap(d) {
    const ds = [];
    for (const m of d.manh || []) {
      try {
        const img = await XR.tuDataUrl(m.src), cv = XR.taoCanvas(img.width, img.height);
        cv.getContext('2d').drawImage(img, 0, 0);
        ds.push({ id: m.id, lat: !!m.lat, daToi: !!m.daToi, vai: m.vai, cha: m.cha, sx: m.sx, sy: m.sy, w: cv.width, h: cv.height, dat: m.dat, truc: m.truc, lop: m.lop, cv });
      } catch (e) { /* mảnh hỏng: bỏ */ }
    }
    Object.assign(S, {
      khung: d.khung || 'nguoi', doi_tuong: d.doi_tuong || 'em-be', ten: d.ten || '', ma: d.ma || '', maTay: !!d.maTay, thay_cho: d.thay_cho || '',
      nguong: d.nguong || 45, lem: d.lem == null ? 1 : d.lem, vun: d.vun == null ? 3 : d.vun, goc: d.goc || [0, 0], cao: d.cao || 40,
      toiSau: d.toiSau !== false, daXoa: d.daXoa || [], dong_tac: d.dong_tac || {}, khungDoan: d.khungDoan || null, canRap: d.canRap !== false, manh: ds,
    });
    S.chon.clear(); S.chonRap = null; S.view = null; XR.tinhToi(S.manh, S.toiSau); doiRig();
  }

  // ---------- các bước ----------
  function veThanhBuoc() {
    const nav = $('thanhBuoc'); nav.innerHTML = '';
    TEN_BUOC.forEach((t, i) => {
      const b = el('button', { cls: S.buoc === i + 1 ? 'on' : '', onclick: () => sangBuoc(i + 1) });
      b.appendChild(el('b', { text: String(i + 1) })); b.appendChild(document.createTextNode(t));
      nav.appendChild(b);
    });
  }
  function sangBuoc(n) {
    n = Math.max(1, Math.min(6, n));
    if (n >= 3 && !S.manh.length) { bao('Hãy nạp ảnh tách bộ phận ở Bước 2 trước.'); n = 2; }
    if (n >= 3) chuanBiVai();
    if (n >= 4) chuanBiRap();
    S.buoc = n;
    document.querySelectorAll('section.trang').forEach((s) => s.classList.toggle('on', +s.dataset.buoc === n));
    veThanhBuoc();
    $('nutTruoc').disabled = n === 1; $('nutTiep').textContent = n === 6 ? 'Xuất tệp' : 'Bước tiếp ›';
    ({ 1: veBuoc1, 2: veBuoc2, 3: veBuoc3, 4: veBuoc4, 5: veBuoc5, 6: veBuoc6 })[n]();
    window.scrollTo(0, 0);
    luu();
  }

  // ===== BƯỚC 1 =====
  function nutChon(hop, ds, giaTri, doi) {
    hop.innerHTML = '';
    for (const [k, t] of ds) hop.appendChild(el('button', { cls: 'nut' + (k === giaTri ? ' on' : ''), text: t, onclick: () => doi(k) }));
  }
  function veBuoc1() {
    nutChon($('chonKhung'), Object.entries(XR.KHUNG), S.khung, (k) => { S.khung = k; doiRig(); veBuoc1(); luu(); });
    nutChon($('chonDoi'), Object.entries(DOI), S.doi_tuong, (k) => { S.doi_tuong = k; if (k === 'em-be') S.thay_cho = ''; veBuoc1(); luu(); });
    $('oTen').value = S.ten; $('oMa').value = S.ma;
    $('khuThay').classList.toggle('an', S.doi_tuong !== 'quai');
    const ds = window.XR_QUAI || [];
    const sel = $('chonQuai'), o = $('oQuai');
    if (ds.length) {
      sel.classList.remove('an'); o.classList.add('an');
      sel.innerHTML = '';
      sel.appendChild(el('option', { value: '', text: '— Chưa chọn (quái mới) —' }));
      for (const v of Object.keys(VUNG)) {
        const g = el('optgroup', { label: VUNG[v] });
        for (const q of ds.filter((x) => x.vung === v)) g.appendChild(el('option', { value: q.id, text: q.ten + ' (' + q.id + ')' }));
        if (g.children.length) sel.appendChild(g);
      }
      const khac = ds.filter((x) => !VUNG[x.vung]);
      for (const q of khac) sel.appendChild(el('option', { value: q.id, text: q.ten + ' (' + q.id + ')' }));
      if (S.thay_cho && !ds.some((q) => q.id === S.thay_cho)) sel.appendChild(el('option', { value: S.thay_cho, text: S.thay_cho }));
      sel.value = S.thay_cho || '';
    } else { sel.classList.add('an'); o.classList.remove('an'); o.value = S.thay_cho || ''; }
    const nhap = docNhap(), hop = $('nhapCu');
    hop.classList.add('an');
    if (nhap && nhap.manh && nhap.manh.length && !S.manh.length) {
      hop.innerHTML = ''; hop.classList.remove('an');
      hop.appendChild(el('div', { text: 'Có bản đang làm dở: ' + (nhap.ten || 'chưa đặt tên') + ' (' + nhap.manh.length + ' mảnh).' }));
      const h = el('div', { cls: 'hang', style: 'margin-top:8px' });
      h.appendChild(el('button', { cls: 'nut chinh', text: 'Làm tiếp', onclick: async () => { await napNhap(nhap); sangBuoc(Math.max(2, Math.min(6, nhap.buoc || 4))); bao('Đã mở lại bản đang làm.'); } }));
      h.appendChild(el('button', { cls: 'nut', text: 'Bỏ, làm con mới', onclick: () => { xoaNhap(); hop.classList.add('an'); } }));
      hop.appendChild(h);
    }
  }
  $('oTen').addEventListener('input', () => {
    S.ten = $('oTen').value;
    if (!S.maTay) { S.ma = XR.taoMa(S.ten); $('oMa').value = S.ma; }
    luu();
  });
  $('oMa').addEventListener('input', () => {
    const v = XR.taoMa($('oMa').value.replace(/_/g, '-')) || '';
    S.maTay = !!$('oMa').value; S.ma = v; luu();
  });
  $('oMa').addEventListener('change', () => { $('oMa').value = S.ma; });
  $('chonQuai').addEventListener('change', () => { S.thay_cho = $('chonQuai').value; luu(); });
  $('oQuai').addEventListener('input', () => { S.thay_cho = $('oQuai').value.trim().replace(/[^A-Za-z0-9_-]/g, ''); luu(); });
  $('nutMoi').onclick = () => {
    if (S.manh.length && !$('nutMoi').dataset.hoi) { $('nutMoi').dataset.hoi = '1'; $('nutMoi').textContent = 'Bấm lần nữa để xoá hết'; setTimeout(() => { delete $('nutMoi').dataset.hoi; $('nutMoi').textContent = 'Xoá hết, làm lại từ đầu'; }, 3000); return; }
    delete $('nutMoi').dataset.hoi; $('nutMoi').textContent = 'Xoá hết, làm lại từ đầu';
    Object.assign(S, { ten: '', ma: '', maTay: false, thay_cho: '', anhGoc: null, manh: [], goc: [0, 0], dong_tac: {}, khungDoan: null, canRap: true, anhMo: null, view: null, chonRap: null });
    S.chon.clear(); xoaNhap(); doiRig(); $('anhGoc').classList.add('an'); veBuoc1(); bao('Đã xoá. Bắt đầu con mới.');
  };

  // ===== BƯỚC 2 =====
  function veBuoc2() {
    $('trNguong').value = S.nguong; $('gtNguong').textContent = S.nguong;
    $('trLem').value = S.lem; $('gtLem').textContent = S.lem + ' điểm';
    $('trVun').value = S.vun; $('gtVun').textContent = S.vun + '%';
    const l = $('luoiManh'); l.innerHTML = '';
    if (!S.manh.length) l.appendChild(el('p', { cls: 'nho', text: 'Chưa có mảnh nào.' }));
    S.manh.forEach((p, i) => {
      const t = el('div', { cls: 'the' + (S.chon.has(p.id) ? ' chon' : '') });
      t.appendChild(anhNho(p.cv));
      t.appendChild(el('div', { cls: 'nhan', text: 'Mảnh ' + (i + 1) + ' · ' + p.w + '×' + p.h }));
      t.onclick = () => { if (S.chon.has(p.id)) S.chon.delete(p.id); else S.chon.add(p.id); veBuoc2(); };
      l.appendChild(t);
    });
    const n = S.chon.size;
    $('soChon').textContent = n;
    $('nutGop').disabled = n < 2; $('nutLat').disabled = n < 1; $('nutXoa').disabled = n < 1;
  }
  async function napAnhTach(file) {
    if (!file || !/^image\//.test(file.type)) { bao('Tệp này không phải ảnh.'); return; }
    bao('Đang đọc ảnh…', 8000);
    try {
      S.anhGoc = await XR.docTepAnh(file);
      $('anhGoc').src = S.anhGoc.toDataURL('image/jpeg', 0.7); $('anhGoc').classList.remove('an');
      S.manh = []; S.daXoa = [];
      catLai();
    } catch (e) { bao(e.message || 'Không đọc được ảnh.'); }
  }
  // Phần chung của hai ô chữ nhật (toạ độ ảnh gốc) chia cho diện tích ô a
  function phuLen(a, b) {
    const w = Math.min(a.sx + a.w, b.sx + b.w) - Math.max(a.sx, b.sx), h = Math.min(a.sy + a.h, b.sy + b.h) - Math.max(a.sy, b.sy);
    return w > 0 && h > 0 ? (w * h) / Math.max(1, a.w * a.h) : 0;
  }
  // Cắt lại từ ảnh gốc nhưng GIỮ phần đã làm: mảnh mới trùng chỗ mảnh cũ thì nhận lại vai, khớp, phép lật;
  // các mảnh mới cùng nằm trong một mảnh đã gộp thì gộp lại; mảnh nằm ở chỗ đã xoá thì bỏ.
  function catLai() {
    if (!S.anhGoc) return;
    const ds = XR.tachManh(S.anhGoc, { nguong: S.nguong, lem: S.lem, vun: S.vun });
    const cu = S.manh, nhom = new Map(), moi = [];
    let boDi = 0;
    for (const n of ds) {
      let tot = null, diem = 0.5;
      for (const o of cu) { const d = phuLen(n, o); if (d > diem) { diem = d; tot = o; } }
      if (!tot && (S.daXoa || []).some((r) => phuLen(n, r) > 0.5)) { boDi++; continue; }
      if (tot) { if (!nhom.has(tot.id)) nhom.set(tot.id, []); nhom.get(tot.id).push(n); }
      else moi.push(Object.assign(n, { id: idMoi() }));
    }
    const ra = [];
    let doi = moi.length > 0;
    for (const o of cu) {
      const g = nhom.get(o.id);
      if (!g) { doi = true; continue; }
      const m = g.length > 1 ? XR.gopManh(g) : g[0];
      const p = Object.assign(m, { id: o.id, vai: o.vai, cha: o.cha, lop: o.lop, lat: false, so: null, _a: null });
      if (o.dat) { p.dat = o.dat.slice(); p.truc = o.truc.slice(); }
      if (o.lat) { p.cv = XR.latCanvas(p.cv); p.lat = true; }
      ra.push(p);
    }
    S.manh = ra.concat(moi);
    const con = new Set(S.manh.map((p) => p.id));
    for (const p of S.manh) if (p.cha && !con.has(p.cha)) p.cha = null;
    for (const id of Array.from(S.chon)) if (!con.has(id)) S.chon.delete(id);
    if (!cu.length || doi) { S.canRap = true; S.view = null; }
    if (!cu.length) S.khungDoan = null;
    doiRig(); veBuoc2(); luu();
    bao(!S.manh.length ? 'Không thấy mảnh nào. Thử giảm ngưỡng nền trắng.'
      : cu.length ? 'Đã cắt lại: ' + S.manh.length + ' mảnh, giữ phần đã gộp/xoá/lật' + (moi.length ? ' (có ' + moi.length + ' mảnh mới)' : '') + '.'
        : 'Đã tách được ' + S.manh.length + ' mảnh.');
  }
  let henCat = 0;
  const catSau = () => { clearTimeout(henCat); henCat = setTimeout(catLai, 250); };
  $('trNguong').oninput = () => { S.nguong = +$('trNguong').value; $('gtNguong').textContent = S.nguong; if (S.anhGoc) catSau(); };
  $('trLem').oninput = () => { S.lem = +$('trLem').value; $('gtLem').textContent = S.lem + ' điểm'; if (S.anhGoc) catSau(); };
  $('trVun').oninput = () => { S.vun = +$('trVun').value; $('gtVun').textContent = S.vun + '%'; if (S.anhGoc) catSau(); };
  if (!S.anhGoc) { /* chưa có ảnh: thanh trượt chỉ ghi lại giá trị */ }
  const oTha = $('oTha');
  oTha.onclick = () => $('tepAnh').click();
  $('tepAnh').onchange = () => { const f = $('tepAnh').files[0]; $('tepAnh').value = ''; if (f) napAnhTach(f); };
  ['dragenter', 'dragover'].forEach((k) => oTha.addEventListener(k, (e) => { e.preventDefault(); oTha.classList.add('vao'); }));
  ['dragleave', 'drop'].forEach((k) => oTha.addEventListener(k, (e) => { e.preventDefault(); oTha.classList.remove('vao'); }));
  oTha.addEventListener('drop', (e) => { const f = e.dataTransfer && e.dataTransfer.files[0]; if (f) napAnhTach(f); });
  // thả ảnh vào bất kỳ đâu khi đang ở bước 2
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => {
    e.preventDefault();
    const f = e.dataTransfer && e.dataTransfer.files[0]; if (!f) return;
    if (/json/.test(f.type) || /\.json$/i.test(f.name)) moTepRig(f);
    else if (S.buoc === 2 && e.target !== oTha && !oTha.contains(e.target)) napAnhTach(f);
  });
  $('nutGop').onclick = () => {
    const ds = S.manh.filter((p) => S.chon.has(p.id)); if (ds.length < 2) return;
    const latHet = ds.every((p) => p.lat);
    const m = Object.assign(XR.gopManh(ds.map((p) => (p.lat ? Object.assign({}, p, { cv: XR.latCanvas(p.cv) }) : p))), { id: idMoi(), lat: false });
    if (latHet) { m.cv = XR.latCanvas(m.cv); m.lat = true; }
    const i = S.manh.indexOf(ds[0]);
    S.manh = S.manh.filter((p) => !S.chon.has(p.id)); S.manh.splice(Math.min(i, S.manh.length), 0, m);
    for (const p of S.manh) if (S.chon.has(p.cha)) p.cha = null;
    S.chon.clear(); S.chon.add(m.id); S.khungDoan = null; S.canRap = true; doiRig(); veBuoc2(); luu(); bao('Đã gộp thành một mảnh.');
  };
  $('nutXoa').onclick = () => {
    const n = S.chon.size; if (!n) return;
    S.daXoa = (S.daXoa || []).concat(S.manh.filter((p) => S.chon.has(p.id)).map((p) => ({ sx: p.sx, sy: p.sy, w: p.w, h: p.h })));
    S.manh = S.manh.filter((p) => !S.chon.has(p.id));
    for (const p of S.manh) if (S.chon.has(p.cha)) p.cha = null;
    S.chon.clear(); S.canRap = true; doiRig(); veBuoc2(); luu(); bao('Đã xoá ' + n + ' mảnh.');
  };
  $('nutLat').onclick = () => {
    for (const p of S.manh) if (S.chon.has(p.id)) latManh(p);
    doiRig(); veBuoc2(); luu(); bao('Đã lật ngang.');
  };
  function latManh(p) {
    p.cv = XR.latCanvas(p.cv); p.so = null; p._a = null; p.lat = !p.lat; p.cv0 = null; p.a = 0; p.m = [0, 0];
    if (p.dat && p.truc) p.truc = [p.dat[0] + p.w - (p.truc[0] - p.dat[0]), p.truc[1]];
  }
  $('nutChonHet').onclick = () => { if (S.chon.size === S.manh.length) S.chon.clear(); else S.manh.forEach((p) => S.chon.add(p.id)); veBuoc2(); };

  // ===== BƯỚC 3 =====
  function chuanBiVai() {
    const thieu = S.manh.filter((p) => !p.vai);
    if (S.khungDoan !== S.khung || thieu.length === S.manh.length) {
      XR.doanVai(S.khung, S.manh); S.khungDoan = S.khung; S.canRap = true;
    } else if (thieu.length) { thieu.forEach((p) => (p.vai = 'phu-kien')); S.canRap = true; }
    const ok = new Set((XR.VAI[S.khung] || []).map((v) => v[0]));
    for (const p of S.manh) if (!ok.has(p.vai)) { p.vai = 'phu-kien'; S.canRap = true; }
    XR.tinhToi(S.manh, S.toiSau);
  }
  let chonVai = null;
  function veBuoc3() {
    const l = $('luoiVai'); l.innerHTML = '';
    const vai = XR.VAI[S.khung];
    if (!chonVai || !manhTheoId(chonVai)) chonVai = S.manh[0] && S.manh[0].id;
    for (const p of S.manh) {
      const t = el('div', { cls: 'the' + (p.id === chonVai ? ' chon' : '') });
      t.appendChild(anhNho(XR.anhVe(p)));
      t.appendChild(el('div', { cls: 'nhan', text: XR.tenVai(S.khung, p.vai) }));
      const s = el('select');
      for (const [k, ten] of vai) s.appendChild(el('option', { value: k, text: ten }));
      s.value = p.vai;
      s.onclick = (e) => e.stopPropagation();
      s.onchange = () => { datVai(p, s.value); };
      t.appendChild(s);
      t.onclick = () => { chonVai = p.id; veBuoc3(); };
      l.appendChild(t);
    }
    const h = $('nutVai'); h.innerHTML = '';
    const p0 = manhTheoId(chonVai);
    for (const [k, ten] of vai) h.appendChild(el('button', { cls: 'nut' + (p0 && p0.vai === k ? ' on' : ''), text: ten, onclick: () => { if (p0) datVai(p0, k); } }));
    // vai còn thiếu / bị trùng
    const dem = {}; S.manh.forEach((p) => (dem[p.vai] = (dem[p.vai] || 0) + 1));
    const can = { nguoi: ['dau', 'than'], 'bon-chan': ['dau', 'than'], cua: ['than'] }[S.khung] || ['than'];
    const loi = [];
    for (const k of can) if (!dem[k]) loi.push('Chưa có ' + XR.tenVai(S.khung, k) + '.');
    for (const k in dem) if (dem[k] > 1 && k !== 'phu-kien') loi.push('Có ' + dem[k] + ' mảnh cùng là ' + XR.tenVai(S.khung, k) + '.');
    $('thieuVai').textContent = loi.join(' ') || 'Đủ các bộ phận chính.';
    $('nutToi').classList.toggle('on', S.toiSau);
    $('nutToi').textContent = S.toiSau ? 'Tô tối tay/chân phía sau: BẬT' : 'Tô tối tay/chân phía sau: TẮT';
  }
  $('nutToi').onclick = () => { S.toiSau = !S.toiSau; XR.tinhToi(S.manh, S.toiSau); doiRig(); veBuoc3(); luu(); };
  function datVai(p, k) {
    if (p.vai === k) return;
    p.vai = k; S.canRap = true; XR.tinhToi(S.manh, S.toiSau); doiRig();
    // chọn sang mảnh kế tiếp cho nhanh
    const i = S.manh.indexOf(p); if (S.manh[i + 1]) chonVai = S.manh[i + 1].id;
    veBuoc3(); luu();
  }
  $('nutDoanLai').onclick = () => { XR.doanVai(S.khung, S.manh); XR.tinhToi(S.manh, S.toiSau); S.khungDoan = S.khung; S.canRap = true; doiRig(); veBuoc3(); luu(); bao('Máy đã đoán lại.'); };

  // ===== BƯỚC 4: ráp =====
  function chuanBiRap() {
    if (S.canRap || S.manh.some((p) => !p.dat)) {
      S.goc = XR.tuRap(S.khung, S.manh); S.canRap = false; S.view = null; S.chonRap = null; doiRig();
      if (S.anhMo) datAnhMoTuDong();
    }
  }
  const cvRap = $('cvRap');
  function coCanvas(cv) {
    const r = cv.getBoundingClientRect(), k = dpr();
    const w = Math.max(50, Math.round(r.width * k)), h = Math.max(50, Math.round(r.height * k));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; return true; }
    return false;
  }
  function vuaKhung() {
    const b = XR.khungRap(S.manh);
    const x0 = Math.min(b.x0, S.goc[0] - 10), x1 = Math.max(b.x1, S.goc[0] + 10), y0 = b.y0, y1 = Math.max(b.y1, S.goc[1] + 10);
    const w = x1 - x0, h = y1 - y0, m = 0.12;
    const s = Math.min(cvRap.width / (w * (1 + 2 * m)), cvRap.height / (h * (1 + 2 * m)));
    S.view = { s, ox: cvRap.width / 2 - (x0 + w / 2) * s, oy: cvRap.height / 2 - (y0 + h / 2) * s };
  }
  const raMan = (x, y) => [x * S.view.s + S.view.ox, y * S.view.s + S.view.oy];
  const vaoRap = (x, y) => [(x - S.view.ox) / S.view.s, (y - S.view.oy) / S.view.s];
  function veRap() {
    if (S.buoc !== 4) return;
    coCanvas(cvRap);
    if (!S.view) vuaKhung();
    const c = cvRap.getContext('2d'), k = dpr();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#0c1d1f'; c.fillRect(0, 0, cvRap.width, cvRap.height);
    // ô caro mờ
    c.fillStyle = 'rgba(255,255,255,.03)';
    const o = 24 * k;
    for (let y = 0; y < cvRap.height; y += o) for (let x = (y / o) % 2 ? o : 0; x < cvRap.width; x += o * 2) c.fillRect(x, y, o, o);
    c.setTransform(S.view.s, 0, 0, S.view.s, S.view.ox, S.view.oy);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    // mặt đất
    c.strokeStyle = 'rgba(111,193,168,.5)'; c.lineWidth = 2 / S.view.s;
    c.beginPath(); c.moveTo(-1e5, S.goc[1]); c.lineTo(1e5, S.goc[1]); c.stroke();
    // ảnh mờ
    if (S.anhMo) {
      c.globalAlpha = S.mo.do;
      c.drawImage(S.anhMo, S.mo.x, S.mo.y, S.anhMo.width * S.mo.co, S.anhMo.height * S.mo.co);
      c.globalAlpha = 1;
    }
    XR.veTinh(c, S.manh);
    // khung mảnh đang chọn
    const p0 = manhTheoId(S.chonRap);
    if (p0) {
      c.setLineDash([6 / S.view.s, 4 / S.view.s]); c.strokeStyle = '#f6dc92'; c.lineWidth = 2 / S.view.s;
      c.strokeRect(p0.dat[0], p0.dat[1], p0.w, p0.h); c.setLineDash([]);
      const cha = manhTheoId(p0.cha);
      if (cha) { // đường nối khớp với cha
        c.strokeStyle = 'rgba(246,220,146,.6)'; c.beginPath(); c.moveTo(p0.truc[0], p0.truc[1]); c.lineTo(cha.truc[0], cha.truc[1]); c.stroke();
      }
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
    // chấm khớp đỏ
    for (const p of S.manh) {
      const [x, y] = raMan(p.truc[0], p.truc[1]), to = p.id === S.chonRap;
      c.beginPath(); c.arc(x, y, (to ? 11 : 7) * k, 0, Math.PI * 2);
      c.fillStyle = to ? '#ff3b2f' : 'rgba(230,50,40,.85)'; c.fill();
      c.lineWidth = (to ? 3 : 2) * k; c.strokeStyle = '#fff'; c.stroke();
    }
    // điểm chân (xanh lá)
    const [gx, gy] = raMan(S.goc[0], S.goc[1]);
    c.beginPath(); c.arc(gx, gy, 10 * k, 0, Math.PI * 2); c.fillStyle = '#3fd36a'; c.fill(); c.lineWidth = 2 * k; c.strokeStyle = '#fff'; c.stroke();
    if (S.keoMo) { c.fillStyle = '#f6dc92'; c.font = (16 * k) + 'px system-ui, sans-serif'; c.fillText('Đang kéo ảnh mờ', 12 * k, 26 * k); }
  }
  // chạm trúng mảnh nào (từ lớp trên xuống, xét điểm có hình)
  function trungManh(x, y) {
    const ds = S.manh.slice().sort((a, b) => b.lop - a.lop);
    for (const p of ds) {
      const lx = Math.floor(x - p.dat[0]), ly = Math.floor(y - p.dat[1]);
      if (lx < 0 || ly < 0 || lx >= p.w || ly >= p.h) continue;
      if (!p._a) p._a = p.cv.getContext('2d').getImageData(0, 0, p.w, p.h).data;
      if (p._a[(ly * p.w + lx) * 4 + 3] > 40) return p;
    }
    return null;
  }
  let keo = null;
  cvRap.addEventListener('pointerdown', (e) => {
    if (!S.view) return;
    const r = cvRap.getBoundingClientRect(), k = dpr(), mx = (e.clientX - r.left) * k, my = (e.clientY - r.top) * k;
    const [x, y] = vaoRap(mx, my), gan = (px, py, rr) => Math.hypot(px - mx, py - my) <= rr * k;
    keo = null;
    if (S.keoMo && S.anhMo) keo = { loai: 'mo', x0: x, y0: y, v: [S.mo.x, S.mo.y] };
    else {
      const [gx, gy] = raMan(S.goc[0], S.goc[1]);
      if (gan(gx, gy, 18)) keo = { loai: 'goc', x0: x, y0: y, v: S.goc.slice() };
      if (!keo) { // chấm đỏ: ưu tiên mảnh đang chọn
        const ds = S.manh.slice().sort((a, b) => (b.id === S.chonRap) - (a.id === S.chonRap));
        for (const p of ds) { const [px, py] = raMan(p.truc[0], p.truc[1]); if (gan(px, py, 16)) { keo = { loai: 'khop', p, x0: x, y0: y, v: p.truc.slice() }; S.chonRap = p.id; break; } }
      }
      if (!keo) {
        const p = trungManh(x, y);
        if (p) {
          S.chonRap = p.id;
          const ds = [p].concat(conChau(p.id));
          keo = { loai: 'manh', ds, x0: x, y0: y, v: ds.map((q) => [q.dat.slice(), q.truc.slice()]) };
        }
      }
    }
    if (keo) { cvRap.setPointerCapture(e.pointerId); e.preventDefault(); }
    veBenRap(); veRap();
  });
  cvRap.addEventListener('pointermove', (e) => {
    if (!keo) return;
    const r = cvRap.getBoundingClientRect(), k = dpr();
    const [x, y] = vaoRap((e.clientX - r.left) * k, (e.clientY - r.top) * k), dx = Math.round(x - keo.x0), dy = Math.round(y - keo.y0);
    if (keo.loai === 'mo') { S.mo.x = keo.v[0] + dx; S.mo.y = keo.v[1] + dy; }
    else if (keo.loai === 'goc') S.goc = [keo.v[0] + dx, keo.v[1] + dy];
    else if (keo.loai === 'khop') keo.p.truc = [keo.v[0] + dx, keo.v[1] + dy];
    else keo.ds.forEach((q, i) => { q.dat = [keo.v[i][0][0] + dx, keo.v[i][0][1] + dy]; q.truc = [keo.v[i][1][0] + dx, keo.v[i][1][1] + dy]; });
    veRap();
  });
  const thaKeo = () => { if (keo) { keo = null; doiRig(); luu(); } };
  cvRap.addEventListener('pointerup', thaKeo);
  cvRap.addEventListener('pointercancel', thaKeo);

  function veBenRap() {
    const p = manhTheoId(S.chonRap), sel = $('chonCha');
    $('tenChon').textContent = p ? XR.tenVai(S.khung, p.vai) : '(chạm một mảnh)';
    sel.innerHTML = ''; sel.disabled = !p; $('nutLen').disabled = !p; $('nutXuong').disabled = !p;
    ['nutXoayTrai', 'nutXoayPhai', 'nutXoayThang'].forEach((k) => ($(k).disabled = !p));
    $('gtGoc').textContent = p ? XR.gocManh(p) + '°' : '';
    if (!p) return;
    sel.appendChild(el('option', { value: '', text: '(không có — đây là mảnh gốc)' }));
    for (const q of S.manh) {
      if (q === p || XR.laConChau(S.manh, q.id, p.id)) continue;
      sel.appendChild(el('option', { value: q.id, text: XR.tenVai(S.khung, q.vai) }));
    }
    sel.value = p.cha || '';
  }
  $('chonCha').onchange = () => {
    const p = manhTheoId(S.chonRap); if (!p) return;
    const v = $('chonCha').value || null;
    if (!v) { // chỉ một mảnh gốc: mảnh gốc cũ gắn vào mảnh này
      for (const q of S.manh) if (q !== p && q.cha == null) q.cha = p.id;
    }
    p.cha = v; doiRig(); veRap(); luu();
  };
  function doiLop(d) {
    const p = manhTheoId(S.chonRap); if (!p) return;
    const ds = S.manh.slice().sort((a, b) => a.lop - b.lop), i = ds.indexOf(p), j = Math.max(0, Math.min(ds.length - 1, i + d));
    ds.splice(i, 1); ds.splice(j, 0, p); ds.forEach((q, k) => (q.lop = k));
    doiRig(); veRap(); luu();
    bao(d > 0 ? 'Đã đưa mảnh lên trước.' : 'Đã đưa mảnh ra sau.', 1200);
  }
  XR.chonManh = (id) => { S.chonRap = id; veBenRap(); veRap(); }; // dùng khi thử tự động
  function xoay(doXoay) {
    const p = manhTheoId(S.chonRap); if (!p) return;
    XR.xoayManh(S.manh, p, doXoay);
    doiRig(); veBenRap(); veRap(); luu();
  }
  $('nutXoayTrai').onclick = () => xoay(-5);
  $('nutXoayPhai').onclick = () => xoay(5);
  $('nutXoayThang').onclick = () => { const p = manhTheoId(S.chonRap); if (p && p.a) xoay(-XR.gocManh(p)); };
  $('nutLen').onclick = () => doiLop(1);
  $('nutXuong').onclick = () => doiLop(-1);
  // Ra giữa khung: đưa cả nhân vật vào giữa vùng ráp, vừa cỡ màn
  $('nutVua').onclick = () => { S.view = null; veRap(); bao('Đã đưa nhân vật ra giữa khung.', 1200); };
  // Chấm xanh (điểm chân) về giữa nhân vật theo chiều ngang, nằm ở đáy chân thấp nhất: nhân vật đứng giữa chỗ đặt trong game
  $('nutGiuaChan').onclick = () => {
    if (!S.manh.length) return;
    const ch = S.manh.filter((p) => /^chan/.test(p.vai)), ds = ch.length ? ch : S.manh, b = XR.khungRap(ds), tat = XR.khungRap(S.manh);
    S.goc = [Math.round(ch.length ? (b.x0 + b.x1) / 2 : (tat.x0 + tat.x1) / 2), Math.round(b.y1)];
    S.view = null; doiRig(); veRap(); luu(); bao('Chấm xanh đã về giữa chân.', 1500);
  };
  $('nutRapLai').onclick = () => {
    const b = $('nutRapLai');
    if (!b.dataset.hoi) { b.dataset.hoi = '1'; b.textContent = 'Bấm lần nữa (mất phần đã chỉnh)'; setTimeout(() => { delete b.dataset.hoi; b.textContent = 'Ráp lại tự động'; }, 3000); return; }
    delete b.dataset.hoi; b.textContent = 'Ráp lại tự động';
    S.canRap = true; chuanBiRap(); veBuoc4(); luu(); bao('Đã ráp lại.');
  };
  // ảnh cả con
  $('nutAnhMo').onclick = () => $('tepAnhMo').click();
  $('tepAnhMo').onchange = async () => {
    const f = $('tepAnhMo').files[0]; $('tepAnhMo').value = ''; if (!f) return;
    try { S.anhMo = XR.xoaNenDon(await XR.docTepAnh(f), S.nguong); datAnhMoTuDong(); veBuoc4(); bao('Đã nạp ảnh cả con. Bấm "Kéo ảnh mờ" để dời cho khớp.'); }
    catch (e) { bao(e.message || 'Không đọc được ảnh.'); }
  };
  function datAnhMoTuDong() {
    if (!S.anhMo || !S.manh.length) return;
    const b = XR.khungRap(S.manh), cao = Math.max(10, S.goc[1] - b.y0);
    S.mo.co = cao / S.anhMo.height;
    S.mo.x = Math.round((b.x0 + b.x1) / 2 - S.anhMo.width * S.mo.co / 2); S.mo.y = Math.round(S.goc[1] - S.anhMo.height * S.mo.co);
  }
  $('nutKeoMo').onclick = () => { if (!S.anhMo) { bao('Chưa nạp ảnh cả con.'); return; } S.keoMo = !S.keoMo; $('nutKeoMo').classList.toggle('on', S.keoMo); veRap(); };
  $('nutBoMo').onclick = () => { S.anhMo = null; S.keoMo = false; $('nutKeoMo').classList.remove('on'); veRap(); };
  $('trMoCo').oninput = () => {
    if (!S.anhMo) return;
    const co = +$('trMoCo').value * (S.mo.co0 || S.mo.co), cx = S.mo.x + S.anhMo.width * S.mo.co / 2, day = S.mo.y + S.anhMo.height * S.mo.co;
    S.mo.co = co; S.mo.x = cx - S.anhMo.width * co / 2; S.mo.y = day - S.anhMo.height * co;
    $('gtMoCo').textContent = Math.round(+$('trMoCo').value * 100) + '%'; veRap();
  };
  $('trMoDo').oninput = () => { S.mo.do = +$('trMoDo').value; $('gtMoDo').textContent = Math.round(S.mo.do * 100) + '%'; veRap(); };
  // ----- khung mẫu (lưu trên máy này) -----
  const KHOA_MAU = 'xuong-roi-khung-mau-v1';
  const docMau = () => { try { return JSON.parse(localStorage.getItem(KHOA_MAU) || '[]'); } catch (e) { return []; } };
  const ghiMau = (ds) => { try { localStorage.setItem(KHOA_MAU, JSON.stringify(ds)); return true; } catch (e) { return false; } };
  function veMau() {
    const sel = $('chonMau'), ds = docMau().filter((m) => m.khung === S.khung);
    const cu = sel.value; sel.innerHTML = '';
    if (!ds.length) sel.appendChild(el('option', { value: '', text: '(chưa có mẫu cho khung ' + XR.KHUNG[S.khung] + ')' }));
    ds.forEach((m) => sel.appendChild(el('option', { value: m.ten, text: m.ten + ' · ' + Object.keys(m.vai).length + ' mảnh' })));
    if (ds.some((m) => m.ten === cu)) sel.value = cu;
    $('nutRapMau').disabled = !ds.length; $('nutXoaMau').disabled = !ds.length;
  }
  function themMau(m) {
    const ds = docMau().filter((x) => !(x.ten === m.ten && x.khung === m.khung)); ds.push(m);
    if (!ghiMau(ds)) { bao('Máy này không cho lưu (bộ nhớ trình duyệt bị chặn).'); return; }
    veMau(); $('chonMau').value = m.ten;
  }
  $('nutLuuMau').onclick = () => {
    if (!S.manh.length) return;
    themMau(XR.layKhungMau(S.khung, S.manh, S.goc, S.ten || 'Mẫu ' + XR.KHUNG[S.khung]));
    bao('Đã lưu khung mẫu "' + (S.ten || 'Mẫu ' + XR.KHUNG[S.khung]) + '".');
  };
  $('nutRapMau').onclick = () => {
    const m = docMau().find((x) => x.khung === S.khung && x.ten === $('chonMau').value); if (!m) return;
    S.goc = XR.rapTheoMau(S.khung, S.manh, m); S.view = null; S.chonRap = null;
    XR.tinhToi(S.manh, S.toiSau); doiRig(); veBenRap(); veRap(); luu();
    const thieu = S.manh.filter((p) => !m.vai[p.ten]).length;
    bao('Đã ráp theo mẫu "' + m.ten + '"' + (thieu ? ' (' + thieu + ' mảnh mẫu không có, máy tự đặt)' : '') + '.');
  };
  $('nutXoaMau').onclick = () => {
    const ten = $('chonMau').value; if (!ten) return;
    ghiMau(docMau().filter((x) => !(x.khung === S.khung && x.ten === ten))); veMau(); bao('Đã xoá mẫu.');
  };
  $('nutMauTep').onclick = () => $('tepMau').click();
  $('tepMau').onchange = async () => {
    const f = $('tepMau').files[0]; $('tepMau').value = ''; if (!f) return;
    try {
      const m = XR.mauTuTep(JSON.parse(await f.text()));
      if (m.khung !== S.khung) { bao('Tệp này là khung ' + XR.KHUNG[m.khung] + ', con đang ráp là khung ' + XR.KHUNG[S.khung] + '.', 4000); return; }
      themMau(m); bao('Đã lấy mẫu từ ' + f.name + '. Bấm "Ráp theo mẫu".');
    } catch (e) { bao(e.message || 'Tệp hỏng.'); }
  };

  function veBuoc4() {
    veMau();
    S.mo.co0 = S.mo.co; $('trMoCo').value = 1; $('gtMoCo').textContent = '100%';
    $('trMoDo').value = S.mo.do; $('gtMoDo').textContent = Math.round(S.mo.do * 100) + '%';
    $('nutKeoMo').classList.toggle('on', S.keoMo);
    veBenRap();
    requestAnimationFrame(veRap);
  }

  // ===== BƯỚC 5: động tác (G.chibi) =====
  let rig = null, rigCu = true;
  function doiRig() { rigCu = true; }
  const MA_XEM = '_xuong-roi-xem';
  function layRig() {
    if (!G.chibi || !G.chibi.add) return null;
    if (rigCu || !rig) {
      if (!S.manh.length || S.manh.some((p) => !p.dat)) return null;
      XR.datTen(S.manh);
      const { cv, o } = XR.xepAnh(S.manh, 1);
      const ten = {}; S.manh.forEach((p) => (ten[p.id] = p.ten));
      rig = G.chibi.add({
        loai: 'linh-khi-rig', phien_ban: 1, ma: MA_XEM, ten: S.ten || 'xem', doi_tuong: S.doi_tuong, khung: S.khung, anhCanvas: cv, cao: +S.cao || 40, goc: S.goc.slice(),
        manh: S.manh.map((p) => ({ ten: p.ten, vai: p.vai, cha: p.cha ? ten[p.cha] : null, o: o[p.id], dat: p.dat, truc: p.truc, lop: p.lop })),
        dong_tac: S.dong_tac,
      });
      rigCu = false;
    }
    return rig;
  }
  // thời lượng một lần chạy (giây) của động tác một lần, thêm lúc nghỉ
  const THOI = { tele: [0.7, 0.5], atk: [0.55, 0.6], hit: [0.4, 0.6], die: [1.3, 0.8] };
  let dangChay = false, t0 = 0;
  // ĐI THỬ: giữ ←/→ hoặc A/D (hay nút trên màn) thì nhân vật đi qua lại, thả ra thì đứng thở.
  // Giống trong game: game đọc cùng phím và gọi cùng G.chibi.draw với động tác 'move' / 'idle'.
  const PHIM = { ArrowLeft: -1, KeyA: -1, ArrowRight: 1, KeyD: 1 };
  const diGiu = new Set(); // phím / nút đang giữ
  const di = { x: 0.5, huong: 1, tDi: 0, last: 0, coDi: false };
  const laO = (e) => /^(INPUT|SELECT|TEXTAREA)$/.test((e.target && e.target.tagName) || '');
  window.addEventListener('keydown', (e) => { if (S.buoc !== 5 || laO(e) || !(e.code in PHIM)) return; e.preventDefault(); diGiu.add(e.code); });
  window.addEventListener('keyup', (e) => { if (e.code in PHIM) diGiu.delete(e.code); });
  window.addEventListener('blur', () => diGiu.clear());
  [['nutDiTrai', 'ArrowLeft'], ['nutDiPhai', 'ArrowRight']].forEach(([id, k]) => {
    const b = $(id);
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (er) { /* bỏ qua */ } diGiu.add('nut' + k); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => b.addEventListener(ev, () => diGiu.delete('nut' + k)));
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  });
  // Chuyển động tác mượt: trong 0,25 giây đầu sau khi đổi (đứng ↔ đi), trộn dần tư thế cũ sang tư thế mới (nội suy, có làm mềm),
  // nên bấm/thả phím không bị giật cục.
  const CHUYEN = 0.25;
  const tron = { anim: null, tuThe: null, tu: null, k: 1 };
  function tronTuThe(A, B, k) {
    const e = k * k * (3 - 2 * k), P = { g: {}, m: {} };
    for (const n in B.g) P.g[n] = (A.g[n] == null ? B.g[n] : A.g[n]) + (B.g[n] - (A.g[n] == null ? B.g[n] : A.g[n])) * e;
    const ten = new Set(Object.keys(A.m).concat(Object.keys(B.m)));
    for (const n of ten) {
      const a = A.m[n] || { a: 0, dx: 0, dy: 0 }, b = B.m[n] || { a: 0, dx: 0, dy: 0 };
      P.m[n] = { a: a.a + (b.a - a.a) * e, dx: a.dx + (b.dx - a.dx) * e, dy: a.dy + (b.dy - a.dy) * e };
    }
    return P;
  }
  function tuTheMuot(r, anim, u, t, dtg) {
    const P = G.chibi.pose(r, anim, u, t);
    if (tron.anim !== anim) { tron.tu = tron.tuThe || P; tron.anim = anim; tron.k = 0; }
    if (tron.k < 1) { tron.k = Math.min(1, tron.k + dtg / CHUYEN); tron.tuThe = tronTuThe(tron.tu, P, tron.k); }
    else tron.tuThe = P;
    return tron.tuThe;
  }
  function huongDi() { let h = 0; for (const k of diGiu) h += PHIM[k.replace(/^nut/, '')] || 0; return Math.sign(h); }
  function khungHinh(ts) {
    if (S.buoc !== 5) { dangChay = false; diGiu.clear(); return; }
    requestAnimationFrame(khungHinh);
    let t = (ts - t0) / 1000;
    const dtg = Math.min(0.05, di.last ? (ts - di.last) / 1000 : 0); di.last = ts;
    const h = huongDi();
    let dtac = S.dt, quay = S.quay;
    if (h) {
      // đang đi: động tác 'move', mặt quay theo hướng đi, chạy ngang qua màn rồi vòng lại
      di.coDi = true; di.huong = h; di.tDi += dtg;
      di.x += h * dtg * 0.22; if (di.x > 1.08) di.x = -0.08; if (di.x < -0.08) di.x = 1.08;
      dtac = 'move'; t = di.tDi; quay = h < 0;
    } else if (di.coDi) {
      // vừa thả phím: đứng thở tại chỗ, giữ hướng mặt
      if (S.dt === 'move' || S.dt === 'idle') dtac = 'idle';
      quay = di.huong < 0;
    }
    let u = 0;
    if (!XR.LAP[dtac]) { const [d, nghi] = THOI[dtac] || [0.6, 0.5], k = t % (d + nghi); u = Math.min(1, k / d); }
    const r = layRig();
    const pose = r && r.ready && G.chibi.pose ? tuTheMuot(r, dtac, u, t, dtg) : undefined;
    // cỡ to
    const cv = $('cvTo'); coCanvas(cv);
    const c = cv.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0c1d1f'; c.fillRect(0, 0, cv.width, cv.height);
    const nenY = cv.height * 0.84;
    c.fillStyle = '#20393a'; c.fillRect(0, nenY, cv.width, cv.height - nenY);
    if (!r) {
      c.fillStyle = '#f6dc92'; c.font = (18 * dpr()) + 'px system-ui, sans-serif'; c.textAlign = 'center';
      c.fillText(G.chibi ? 'Chưa ráp xong (Bước 4)' : 'Thiếu bộ động tác chibi_rig.js', cv.width / 2, cv.height / 2); c.textAlign = 'left';
    } else if (r.ready) {
      const cao = cv.height * 0.62;
      G.chibi.draw(c, r, di.coDi ? di.x * cv.width : cv.width / 2, nenY, { anim: dtac, u, t, cao, flip: quay, bong: true, pose });
    }
    // cỡ thật: canvas 480×270 = đúng một màn game
    const ct = $('cvThat'), x = ct.getContext('2d');
    x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = '#2c5234'; x.fillRect(0, 0, 480, 270);
    x.fillStyle = '#3d5a2a'; x.fillRect(0, G.GY0 || 142, 480, (G.GY1 || 236) - (G.GY0 || 142));
    if (r && r.ready) {
      if (di.coDi) G.chibi.draw(x, r, di.x * 480, 200, { anim: dtac, u, t, cao: +S.cao || 40, flip: quay, bong: true, pose });
      else {
        G.chibi.draw(x, r, 200, 200, { anim: dtac, u, t, cao: +S.cao || 40, flip: quay, bong: true, pose });
        G.chibi.draw(x, r, 300, 200, { anim: 'idle', t, cao: +S.cao || 40, flip: true, bong: true });
      }
    }
  }
  function veBuoc5() {
    const h = $('nutDongTac'); h.innerHTML = '';
    for (const [k, ten] of XR.DONG_TAC) h.appendChild(el('button', { cls: 'nut' + (S.dt === k ? ' on' : ''), text: ten, onclick: () => { S.dt = k; t0 = performance.now(); di.coDi = false; di.x = 0.5; veBuoc5(); } }));
    const d = S.dong_tac[S.dt] || {};
    $('trBienDo').value = d.bien_do == null ? 1 : d.bien_do; $('trTocDo').value = d.toc_do == null ? 1 : d.toc_do;
    hienSo();
    $('oCao').value = S.cao;
    $('nutQuay').classList.toggle('on', S.quay);
    if (!dangChay) { dangChay = true; t0 = performance.now(); requestAnimationFrame(khungHinh); }
  }
  function hienSo() { $('gtBienDo').textContent = Math.round(+$('trBienDo').value * 100) + '%'; $('gtTocDo').textContent = Math.round(+$('trTocDo').value * 100) + '%'; }
  function ghiDongTac() {
    const b = +$('trBienDo').value, tdo = +$('trTocDo').value;
    if (b === 1 && tdo === 1) delete S.dong_tac[S.dt]; else S.dong_tac[S.dt] = { bien_do: b, toc_do: tdo };
    if (rig && rig.dt) rig.dt[S.dt] = { bien_do: b, toc_do: tdo };
    hienSo(); luu();
  }
  $('trBienDo').oninput = ghiDongTac; $('trTocDo').oninput = ghiDongTac;
  $('nutDatLaiDT').onclick = () => { $('trBienDo').value = 1; $('trTocDo').value = 1; ghiDongTac(); };
  $('oCao').oninput = () => { const v = +$('oCao').value; if (v >= 5 && v <= 400) { S.cao = v; if (rig) rig.cao = v; luu(); } };
  $('nutQuay').onclick = () => { S.quay = !S.quay; $('nutQuay').classList.toggle('on', S.quay); };

  // ===== BƯỚC 6: xuất =====
  function veBuoc6() {
    const t = $('tomTat'); t.innerHTML = '';
    const dong = (a, b) => t.appendChild(el('div', {}, [el('span', { cls: 'nho', text: a + ': ' }), el('b', { text: b })]));
    dong('Tên', S.ten || '(chưa đặt)'); dong('Mã', S.ma || '(chưa có)'); dong('Khung', XR.KHUNG[S.khung]); dong('Loại', DOI[S.doi_tuong]);
    if (S.doi_tuong === 'quai') dong('Thay cho', S.thay_cho || '(quái mới)');
    dong('Số mảnh', String(S.manh.length)); dong('Cao trong game', String(S.cao));
    const loi = kiemTra(); if (loi.length) t.appendChild(el('p', { cls: 'hd', style: 'margin-top:10px;border-color:#b8452f;background:#3a1a12', text: loi.join(' ') }));
  }
  function kiemTra() {
    const loi = [];
    if (!S.ma) loi.push('Chưa có tên/mã (Bước 1).');
    if (!S.manh.length) loi.push('Chưa có mảnh nào (Bước 2).');
    if (S.manh.length && !S.manh.some((p) => p.vai === 'than')) loi.push('Chưa có mảnh Thân (Bước 3).');
    return loi;
  }
  function taiVe(ten, blob) {
    const a = el('a', { href: URL.createObjectURL(blob), download: ten });
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  $('nutXuat').onclick = () => {
    const loi = kiemTra(); if (loi.length) { bao(loi[0]); return; }
    chuanBiVai(); chuanBiRap();
    const kq = XR.xuat(S);
    const s = JSON.stringify(kq.tep);
    taiVe(kq.tep.ma + '.rig.json', new Blob([s], { type: 'application/json' }));
    $('kqXuat').textContent = 'Đã tải về ' + kq.tep.ma + '.rig.json (' + Math.round(s.length / 1024) + ' KB, ảnh ' + kq.cv.width + '×' + kq.cv.height + (kq.k < 1 ? ', thu nhỏ còn ' + Math.round(kq.k * 100) + '%' : '') + ').';
    $('anhXuat').src = kq.tep.anh; $('anhXuat').classList.remove('an');
    bao('Đã xuất tệp. Gửi tệp .rig.json cho Claude.', 4000);
  };
  $('nutTaiPng').onclick = () => {
    if (!S.manh.length) { bao('Chưa có mảnh nào.'); return; }
    chuanBiVai(); chuanBiRap();
    const kq = XR.xuat(S);
    kq.cv.toBlob((b) => b && taiVe((S.ma || 'cac-manh') + '.png', b), 'image/png');
  };

  // mở tệp .rig.json
  async function moTepRig(f) {
    try {
      const tep = JSON.parse(await f.text());
      const d = await XR.moTep(tep);
      Object.assign(S, d, { maTay: true, khungDoan: d.khung, canRap: false, view: null, chonRap: null, anhGoc: null });
      XR.tinhToi(S.manh, S.toiSau);
      S.chon.clear(); doiRig(); luu();
      sangBuoc(4); bao('Đã mở ' + (d.ten || d.ma) + '. Sửa tiếp rồi xuất lại.');
    } catch (e) { bao(e.message || 'Tệp hỏng, không mở được.', 4000); }
  }
  $('nutMoTep1').onclick = $('nutMoTep6').onclick = () => $('tepRig').click();
  $('tepRig').onchange = () => { const f = $('tepRig').files[0]; $('tepRig').value = ''; if (f) moTepRig(f); };

  // ---------- điều hướng ----------
  $('nutTruoc').onclick = () => sangBuoc(S.buoc - 1);
  $('nutTiep').onclick = () => { if (S.buoc === 6) $('nutXuat').click(); else sangBuoc(S.buoc + 1); };
  window.addEventListener('resize', () => { if (S.buoc === 4) { S.view = null; veRap(); } });

  (function () {
    const e = $('phienBan'), ma = window.XR_MA_BAN;
    e.innerHTML = '';
    e.appendChild(el('b', { text: 'Phiên bản ' + PHIEN_BAN.so }));
    e.appendChild(document.createTextNode(' · ' + PHIEN_BAN.ngay + (ma ? ' · mã ' + ma : '')));
    e.title = 'Xưởng Rối phiên bản ' + PHIEN_BAN.so;
  })();
  sangBuoc(1);
})();
