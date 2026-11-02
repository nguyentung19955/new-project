'use strict';
/* giao-dien-chung.js – GIAO DIỆN CHUNG cho màn tiêu đề, Làng Chuông, Vùng 1, Vùng 2 (phiên "Khởi đầu – đợt 1",
   theo docs/khoi-dau/tu-van-chatgpt.txt mục 3–8). Kiểu dáng: giao-dien-chung.css (mọi khung/nút là ảnh ChatGPT art/khoi-dau/).
   window.KhoiDau = {
     camUng,                         // máy cảm ứng → ẩn mọi chữ phím (html.kd-cam-ung)
     tai.mo(), tai.dong(), tai.loi(thuLai)   // màn tải + "Couldn't load this area. Retry / Return to Title"
     tenVung(ten, phu)               // tên vùng hiện mờ dần ~2 s
     diToi(url)                      // tối dần ~250 ms rồi chuyển trang
     hop({tieu, chu, nut:[{chu, chinh, bam}]})  // hộp xác nhận (bảng vừa)
     tuyChon.mo(sauDong), cai()      // Options: âm lượng Master/Music/SFX + Mute (lưu máy), SAVE DATA (Export / Import)
     taiKhoan.mo(), xungDot.mo(o), trangThaiMay()   // Account + hộp "Two journeys were found"
     tamDung.gan(cfg)                // nút + menu tạm dừng: Resume / Map / Journal / Lattice / Options / Return to Title
   }
   Các phần tử đều có lớp "ui" để bộ điều khiển cảm ứng của vùng không nuốt chạm. */
(function(W){
  const D = document;
  const GOC = (() => { try { return new URL('../', D.currentScript.src).href; } catch (e){ return '../'; } })();   // .../tieng-vong-cuoi-cung/
  const TRANG_TIEU_DE = GOC + 'game/index.html';
  const camUng = !!(W.matchMedia && matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in W || (navigator.maxTouchPoints || 0) > 0;
  if (camUng) D.documentElement.classList.add('kd-cam-ung');
  if (!D.querySelector('link[data-kd]')){
    const l = D.createElement('link'); l.rel = 'stylesheet'; l.href = GOC + 'game/giao-dien-chung.css'; l.dataset.kd = '1'; D.head.appendChild(l);
  }
  const KD = W.KhoiDau = {camUng, GOC, TRANG_TIEU_DE};
  const tao = (tag, thuoc, html) => { const e = D.createElement(tag); if (thuoc) for (const k in thuoc){ if (k === 'class') e.className = thuoc[k]; else e.setAttribute(k, thuoc[k]); } if (html !== undefined) e.innerHTML = html; return e; };
  const nut = (chu, lop, bam) => { const b = tao('button', {type:'button', class:'kd-nut ui ' + (lop || '')}); b.textContent = chu; if (bam) b.onclick = bam; return b; };
  const than = () => D.body || D.documentElement;
  KD.nut = nut;

  /* ---------- tỉ lệ bảng cho vừa màn (luôn trong vùng an toàn) ---------- */
  function vua(){
    const w = innerWidth - 24, h = innerHeight - 16;
    D.documentElement.style.setProperty('--kd-k', String(Math.min(1, w / 572, h / 338)));
  }
  addEventListener('resize', vua); vua();

  /* ---------- lớp phủ dùng chung ---------- */
  const lopMo = [];
  function lop(id, cls){
    let l = D.getElementById(id);
    if (!l){ l = tao('div', {id, class:'kd-lop ui'}); l.appendChild(tao('div', {class:'kd-bang ' + (cls || '')})); than().appendChild(l); }
    return l;
  }
  function moLop(l){ l.classList.add('mo'); if (!lopMo.includes(l)) lopMo.push(l); }
  function dongLop(l){ l.classList.remove('mo'); const i = lopMo.indexOf(l); if (i >= 0) lopMo.splice(i, 1); }
  KD.dangMo = () => lopMo.length > 0;
  addEventListener('keydown', e => {
    if (e.code !== 'Escape' || !lopMo.length) return;
    const l = lopMo[lopMo.length - 1], b = l.querySelector('[data-thoat]'); if (b){ e.preventDefault(); e.stopPropagation(); b.click(); }
  }, true);

  /* ---------- hộp xác nhận ---------- */
  KD.hop = function(o){
    const l = lop('kd-hop', 'vua'), b = l.firstChild;
    b.innerHTML = '';
    b.appendChild(tao('h1', null, o.tieu || ''));
    if (o.chu) b.appendChild(tao('p', null, o.chu));
    const hang = tao('div', {class:'kd-hang'});
    const dong = () => dongLop(l);
    (o.nut || [{chu:'OK'}]).forEach((x, i) => {
      const n = nut(x.chu, 'phu' + (x.chinh ? ' chinh' : ''), () => { dong(); if (x.bam) x.bam(); });
      if (x.id) n.id = x.id;
      if (x.thoat) n.dataset.thoat = '1';
      hang.appendChild(n);
    });
    b.appendChild(hang);
    moLop(l);
    return dong;
  };

  /* ---------- màn tối + chuyển trang ---------- */
  function toi(){ let t = D.getElementById('kd-toi'); if (!t){ t = tao('div', {id:'kd-toi', class:'ui'}); than().appendChild(t); } return t; }
  KD.diToi = function(url){
    const t = toi(); void t.offsetWidth; t.classList.add('mo');
    setTimeout(() => { location.href = url; }, 260);
  };
  // quay lại bằng nút Back (bfcache): bỏ màn tối
  addEventListener('pageshow', e => { if (e.persisted){ const t = D.getElementById('kd-toi'); if (t) t.classList.remove('mo'); } });
  KD.veTieuDe = () => KD.diToi(TRANG_TIEU_DE);

  /* ---------- màn tải ---------- */
  function manTai(){
    let m = D.getElementById('kd-tai');
    if (!m){ m = tao('div', {id:'kd-tai', class:'ui'}); than().appendChild(m); }
    if (!m.querySelector('.kd-chuong')) m.innerHTML = '<div class="kd-chuong"></div><div class="kd-chu-tai">Loading…</div>';
    return m;
  }
  KD.tai = {
    mo(){ const m = manTai(); m.classList.remove('loi'); const b = m.querySelector('.kd-bang'); if (b) b.remove(); m.classList.add('mo'); },
    dong(){ const m = D.getElementById('kd-tai'); if (m) m.classList.remove('mo', 'loi'); },
    loi(thuLai){
      const m = manTai(); m.classList.add('mo', 'loi');
      let b = m.querySelector('.kd-bang'); if (b) b.remove();
      b = tao('div', {class:'kd-bang vua'}, '<h1>The bells fell silent</h1><p>Couldn\'t load this area.</p>');
      const h = tao('div', {class:'kd-hang'});
      h.append(nut('Retry', 'phu chinh', thuLai || (() => location.reload())), nut('Return to Title', 'phu', KD.veTieuDe));
      b.appendChild(h); m.appendChild(b);
    }
  };

  /* ---------- tên vùng ---------- */
  KD.tenVung = function(ten, phu){
    let e = D.getElementById('kd-ten'); if (!e){ e = tao('div', {id:'kd-ten'}); than().appendChild(e); }
    e.innerHTML = (phu ? '<small>' + phu + '</small>' : '') + ten;
    e.classList.remove('chay'); void e.offsetWidth; e.classList.add('chay');
  };

  /* ---------- tuỳ chọn (lưu máy) ---------- */
  const KHOA_TC = 'tvcc-tuy-chon';
  const MAC_DINH = {master:80, nhac:70, sfx:80, tat:false};
  KD.cai = () => { try { return Object.assign({}, MAC_DINH, JSON.parse(localStorage.getItem(KHOA_TC) || '{}')); } catch (e){ return Object.assign({}, MAC_DINH); } };
  const ghiCai = c => { try { localStorage.setItem(KHOA_TC, JSON.stringify(c)); } catch (e){} };
  KD.tuyChon = {
    mo(sauDong){
      const l = lop('kd-tc'), b = l.firstChild, c = KD.cai();
      b.innerHTML = '<h1>Options</h1><div class="kd-hai"><div><h2>AUDIO</h2>' +
        [['master', 'Master'], ['nhac', 'Music'], ['sfx', 'SFX']].map(([k, t]) => '<label><span>' + t + '</span><input class="ui" type="range" min="0" max="100" step="5" data-k="' + k + '" value="' + c[k] + '"></label>').join('') +
        '<label><input class="ui" type="checkbox" data-k="tat"' + (c.tat ? ' checked' : '') + '> Mute all sound</label></div>' +
        '<div class="kd-cot1"><h2>SAVE DATA</h2></div></div>';
      b.querySelectorAll('input').forEach(i => i.oninput = i.onchange = () => { const x = KD.cai(); x[i.dataset.k] = i.type === 'checkbox' ? i.checked : +i.value; ghiCai(x); });
      const cot = b.querySelector('.kd-cot1'), LM = W.LuuMay;
      const bx = nut('Export save', 'phu', () => { if (!(LM && LM.taiXuat && LM.taiXuat())) KD.hop({tieu:'Export', chu:'Could not export (no save yet, or the browser blocked storage).', nut:[{chu:'OK', thoat:true}]}); });
      const bn = nut('Import save', 'phu', () => {
        if (!(LM && LM.chonNhap)) return;
        KD.hop({tieu:'Import save?', chu:'Your current journey on this device will be replaced by the file.', nut:[{chu:'Cancel', thoat:true}, {chu:'Choose file', chinh:true, bam:() =>
          LM.chonNhap().then(r => { if (r.ok) location.reload(); else if (r.loi) KD.hop({tieu:'Import failed', chu:String(r.loi), nut:[{chu:'OK', thoat:true}]}); })}]});
      });
      bx.id = 'kd-b-xuat'; bn.id = 'kd-b-nhap';
      if (!(LM && LM.xuat)){ bx.disabled = bn.disabled = true; }
      cot.append(bx, bn, tao('p', {class:'kd-ghi'}, 'A save file lets you move your journey to another device.'));
      const h = tao('div', {class:'kd-hang'});
      const bk = nut('Back', 'phu chinh', () => { dongLop(l); if (sauDong) sauDong(); }); bk.dataset.thoat = '1'; bk.id = 'kd-b-tc-dong';
      h.appendChild(bk); b.appendChild(h);
      moLop(l);
    }
  };

  /* ---------- trạng thái lưu mây bằng chữ rõ (mục 4) ---------- */
  KD.trangThaiMay = function(){
    const L = W.LuuMay;
    if (!L || !L.coMay || !L.coMay()) return {chu:'Guest · On-device save', loai:'khach'};
    const t = L.trangThai, d = L.dongBo;
    if (d === 'xung-dot') return {chu:'Action needed · Choose a save', loai:'xung-dot'};
    if (t === 'ngoai-tuyen') return {chu:'Offline · Saved on device', loai:'offline'};
    if (t === 'loi') return {chu:'Sync failed · Saved on device', loai:'loi'};
    if (t === 'dang-ket-noi' || d === 'dang-gui' || d === 'cho') return {chu:'Syncing…', loai:'dong-bo'};
    if (d === 'moi-hon') return {chu:'Newer cloud save · Reload to apply', loai:'moi-hon'};
    if (t === 'google') return {chu:'Signed in · Synced', loai:'google'};
    return {chu:'Guest · On-device save', loai:'khach'};
  };

  /* ---------- tài khoản ---------- */
  KD.taiKhoan = {
    mo(sauDong){
      const l = lop('kd-tk'), b = l.firstChild, L = W.LuuMay;
      b.innerHTML = '<h1>Account</h1><p class="kd-tt" id="kd-tk-tt"></p><div id="kd-tk-dn"></div><p class="kd-ghi" id="kd-tk-ghi"></p>';
      const tt = b.querySelector('#kd-tk-tt'), ghi = b.querySelector('#kd-tk-ghi');
      const h = tao('div', {class:'kd-hang'});
      const bxd = nut('Review saves', 'phu', () => { dongLop(l); KD.xungDot.mo({sauDong:() => KD.taiKhoan.mo(sauDong)}); }); bxd.id = 'kd-b-tk-xd';
      const bthu = nut('Retry sync', 'phu', () => { if (L && L.guiNgay) L.guiNgay(); }); bthu.id = 'kd-b-tk-thu';
      const bk = nut('Back', 'phu chinh', () => { huy(); dongLop(l); if (sauDong) sauDong(); }); bk.dataset.thoat = '1'; bk.id = 'kd-b-tk-dong';
      h.append(bxd, bthu, bk); b.appendChild(h);
      if (W.DangNhap && L && L.coMay && L.coMay()) W.DangNhap.gan(b.querySelector('#kd-tk-dn'), {xungDot:false, sauDangNhap:() => { if (L.dongBo === 'moi-hon') location.reload(); }});
      const ve = () => {
        const s = KD.trangThaiMay(); tt.textContent = s.chu;
        bxd.hidden = s.loai !== 'xung-dot'; bthu.hidden = s.loai !== 'loi';
        ghi.textContent = !L || !L.coMay || !L.coMay() ? 'Your journey is saved on this device. Cloud save is not available here.'
          : s.loai === 'google' ? 'Your journey is backed up to your Google account.' : 'Sign in to keep your journey safe and play on other devices. You can always keep playing as a guest.';
      };
      let huy = () => {};
      if (L && L.nghe) huy = L.nghe(ve); else ve();
      moLop(l);
    }
  };

  /* ---------- xung đột: "Two journeys were found" ---------- */
  function docMay(){
    const L = W.LuuMay, DB = L && L._dongBo, xd = DB && DB.meta ? (DB.meta().xd || {}) : {};
    return k => (k in xd ? xd[k].du : (() => { try { return localStorage.getItem(k); } catch (e){ return null; } })());
  }
  const docMayNay = k => { try { return localStorage.getItem(k); } catch (e){ return null; } };
  function theTomTat(tieu, doc){
    const H = W.HanhTrinh; if (!H) return '<div><b>' + tieu + '</b></div>';
    const s = H.tomTat(doc);
    return '<div><b>' + tieu + '</b>' + (s.t ? new Date(s.t).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : 'Unknown time') +
      '<br>' + H.chuNoi(s) + '<br>Played ' + H.chuGio(s.giay) + '<br>Bosses defeated: ' + s.trum + '</div>';
  }
  KD.xungDot = {
    mo(o){
      o = o || {};
      const l = lop('kd-xd'), b = l.firstChild, L = W.LuuMay;
      b.innerHTML = '<h1>Two journeys were found</h1><div class="kd-the">' + theTomTat('THIS DEVICE', docMayNay) + theTomTat('CLOUD', docMay()) + '</div>' +
        '<p class="kd-ghi">Your other save will be kept as a recovery copy first.</p>';
      const xong = ben => {
        if (W.HanhTrinh) W.HanhTrinh.saoLuu(localStorage, 'tvcc-sao-luu-xung-dot');   // bản sao trên máy trước khi chọn
        const p = L && L.chonTatCa ? L.chonTatCa(ben) : Promise.resolve();
        p.then(() => { dongLop(l); if (ben === 'may-chu') location.reload(); else if (o.sauChon) o.sauChon(ben); });
      };
      const h = tao('div', {class:'kd-hang'});
      const a = nut('Use this device', 'phu', () => xong('thiet-bi')); a.id = 'kd-b-xd-tb';
      const c = nut('Use cloud', 'phu', () => xong('may-chu')); c.id = 'kd-b-xd-may';
      const n = nut('Not now', 'phu chinh', () => { dongLop(l); if (o.sauDong) o.sauDong(); }); n.dataset.thoat = '1'; n.id = 'kd-b-xd-sau';
      h.append(a, c, n); b.appendChild(h);
      moLop(l);
    }
  };

  /* ---------- menu tạm dừng (giống nhau ở Làng, Vùng 1, Vùng 2) ----------
     cfg = {coThe():bool (đang chơi, được dừng), dung(), tiep(), ban_do:fn|null, nhat_ky:fn|null, lattice:fn|null, truocVe():void} */
  KD.tamDung = {
    gan(cfg){
      const bd = nut('Menu', 'phu', () => KD.tamDung.mo()); bd.id = 'kd-b-dung'; bd.setAttribute('aria-label', 'Pause');
      than().appendChild(bd);
      const anh = new Image(); anh.onload = () => bd.classList.add('anh'); anh.src = GOC + 'art/khoi-dau/nut-tam-dung.png';   // A19 (chờ ảnh) – có thì dùng biểu tượng
      const l = lop('kd-dung'), b = l.firstChild;
      KD.tamDung.cfg = cfg; KD.tamDung.dangDung = false;
      const muc = (chu, id, fn, lopThem) => { const x = nut(chu, 'phu ' + (lopThem || ''), fn); x.id = id; return x; };
      b.innerHTML = '<h1>Paused</h1>';
      const cot = tao('div', {class:'kd-cot'});
      const tiep = muc('Resume', 'kd-b-tiep-choi', () => KD.tamDung.dong(), 'chinh'); tiep.dataset.thoat = '1';
      const bMap = muc('Map', 'kd-b-map', () => { KD.tamDung.dong(true); cfg.ban_do(); });
      const bNk = muc('Journal', 'kd-b-nk', () => { KD.tamDung.dong(true); cfg.nhat_ky(); });
      const bLt = muc('Lattice', 'kd-b-lt', () => { KD.tamDung.dong(true); cfg.lattice(); });
      const bTc = muc('Options', 'kd-b-tc', () => { dongLop(l); KD.tuyChon.mo(() => moLop(l)); });
      const bVe = muc('Return to Title', 'kd-b-ve', () => KD.hop({tieu:'Return to Title?', chu:'Your journey is kept. You will continue from your last safe place.',
        nut:[{chu:'Cancel', thoat:true, bam:() => moLop(l)}, {chu:'Return', chinh:true, id:'kd-b-ve-ok', bam:() => { try { if (cfg.truocVe) cfg.truocVe(); } catch (e){} KD.veTieuDe(); }}]}));
      cot.append(tiep, bLt, bMap, bTc, bNk, bVe);
      b.appendChild(cot);
      KD.tamDung.capNhat = () => {
        bMap.disabled = !cfg.ban_do || (cfg.coMap && !cfg.coMap());
        bNk.disabled = !(cfg.nhat_ky && (!cfg.coNhatKy || cfg.coNhatKy()));
        bLt.disabled = !(cfg.lattice && (!cfg.coLattice || cfg.coLattice()));
      };
      KD.tamDung.lop = l;
      // nút chỉ hiện khi đang chơi; tự dừng khi ẩn tab (điện thoại khoá màn / chuyển app)
      setInterval(() => { bd.classList.toggle('hien', !!(cfg.hienNut ? cfg.hienNut() : cfg.coThe())); }, 200);
      D.addEventListener('visibilitychange', () => { if (D.visibilityState === 'hidden' && !KD.tamDung.dangDung && cfg.coThe()) KD.tamDung.mo(); });
      return bd;
    },
    mo(){
      const T = KD.tamDung, cfg = T.cfg; if (!cfg || T.dangDung || !cfg.coThe()) return false;
      T.dangDung = true; cfg.dung(); T.capNhat(); moLop(T.lop); return true;
    },
    dong(giuDung){
      const T = KD.tamDung; if (!T.dangDung) return;
      for (const id of ['kd-dung', 'kd-tc', 'kd-hop']){ const x = D.getElementById(id); if (x) dongLop(x); }
      T.dangDung = false; if (!giuDung) T.cfg.tiep();
    }
  };
})(window);
