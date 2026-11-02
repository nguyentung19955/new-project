'use strict';
/* moc-vung-1.js – móc nhỏ "Vật phẩm ẩn + Nhiệm vụ ẩn" (phiên "an") vào Vùng 1.
   MẶC ĐỊNH TẮT: chỉ bật khi game/an/du-lieu.json có "bat_mac_dinh": true hoặc mở trang với ?an=1 (chơi thử; &an_moi=1 xoá tiến độ bí mật).
   Tắt → không làm gì, Vùng 1 y hệt cũ. Chỉ ĐỌC trạng thái Vùng 1 (phòng, vật đã nhặt, tường đã vỡ, trùm) để phát hiện bí mật;
   lưu riêng khoá 'tvcc-an'. Không vẽ gì lên màn chơi: thông báo dùng dòng chữ có sẵn V1.thongBao; nhật ký là bảng chữ trong Chuông Lưu.
   Hình mới (hiệu ứng phát hiện, biểu tượng thành tựu, Mảnh Ký Ức) chỉ dùng khi ảnh ChatGPT đã có (docs/yeu-cau-anh/an/). */
(function(){
  const V1 = window.V1, E = typeof DongCoMN !== 'undefined' ? DongCoMN : null;
  if (!V1 || !E || !window.BiMat) return;
  const Q = new URLSearchParams(location.search), VUNG = 'vung-1', GOC = '../../', T = 48;
  const M = window.MocAn = {bat:false, A:null, anh:{}, hang:[], loi:[]};

  function docLuu(){ try { const s = localStorage.getItem(BiMat.KHOA_LUU); return s ? JSON.parse(s) : null; } catch (e){ return null; } }
  function ghi(){ try { localStorage.setItem(BiMat.KHOA_LUU, JSON.stringify(M.A.luu())); } catch (e){} }
  const thuAnh = p => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = GOC + p; });

  /* ảnh chụp thế giới cho điều kiện */
  function the(){
    const G = V1.G, L = G.luu || {};
    return {kho:Object.assign({}, L.kho), daNhat:(L.daNhat || []).slice(),
      co:ten => (ten === 'ha_trum:' + VUNG && !!L.trumHa) || !!(window.LuuChung && LuuChung.co(ten))};
  }

  async function khoiDong(){
    let D;
    try { const r = await fetch('../an/du-lieu.json', {cache:'no-store'}); D = await r.json(); } catch (e){ M.loi.push('du-lieu.json: ' + e); return; }
    if (!(D.bat_mac_dinh || Q.get('an') === '1')) return;
    if (Q.get('an_moi') === '1'){ try { localStorage.removeItem(BiMat.KHOA_LUU); } catch (e){} }
    const ds = new Set();
    for (const m of [].concat(D.bi_mat || [], D.nhiem_vu || [])){ for (const p of (m.can_anh || [])) ds.add(p); if (m.bieu_tuong) ds.add(m.bieu_tuong); }
    await Promise.all([...ds].map(async p => { const i = await thuAnh(p); if (i) M.anh[p] = i; }));
    M.A = BiMat.tao(D, docLuu(), {coAnh:p => !!M.anh[p], the});
    for (let i = 0; i < 600 && !(window.TV && TV.xong); i++) await new Promise(ok => setTimeout(ok, 50));
    M.bat = true;
    moc();
    taoGiaoDien();
  }

  /* ---- trao thưởng (thiếu hệ thống/hình → giữ lại, trao sau, không mất) ---- */
  function trao(t){
    const G = V1.G;
    if (t.cho_chatgpt || t.cho_tinh_nang) return false;
    if (t.loai === 'thanh_tuu') return true;
    if (t.loai === 'truyen'){
      if (!M.A.moTruyen(t.id)) return false;
      const tr = (M.A.D.truyen || {})[t.id]; if (tr && tr.bao) bao(tr.bao);
      return true;
    }
    if (t.loai === 'manh_am'){ if (!G.luu) return false; G.luu.manh += t.so || 0; V1.ghiLuu(); return true; }
    if (t.loai === 'ky_uc'){ if (!window.LuuChung) return false; LuuChung.nhatKyUc(t.id); return true; }
    if (t.loai === 'am_diem'){
      const H = window.MocHeThong; if (!H || !H.bat || !H.ht) return false;
      H.ht.congDiem(t.nguon || 'bi_mat'); H.ghi && H.ghi(); return true;
    }
    return false;   // Âm Phù, Đồng Cổ (Ancient Bronze)… chờ hệ thống / ChatGPT
  }
  function traoHet(ds){ const xong = []; for (const t of ds || []){ if (trao(t)) xong.push(t); else M.A.giuCho(t); } return xong; }
  function thuTraoCho(){
    const ds = M.A.thuongCho();
    for (let i = ds.length - 1; i >= 0; i--) if (trao(ds[i])) M.A.daTraThuong(i);
  }
  const moTaThuong = ds => ds.filter(t => t.loai === 'manh_am').map(t => '+' + t.so + ' Echo Shards')
    .concat(ds.filter(t => t.loai === 'ky_uc').length ? ['Memory Shard acquired'] : []).join(' · ');

  /* ---- hàng thông báo: không đè chữ nhặt đồ của Vùng 1 ---- */
  function bao(s){ M.hang.push(s); }
  function buocBao(){ const G = V1.G; if (M.hang.length && G.tbT <= 20){ V1.thongBao(M.hang.shift()); G.tbT = 170; } }

  function xuLy(ra, im){
    let doi = false;
    for (const r of ra){
      doi = true;
      if (r.k === 'bi-mat'){
        const d = M.A.dem(VUNG), them = moTaThuong(traoHet(r.thuong));
        if (!im) bao('Secret Found · ' + r.muc.ten + ' · ' + d.timThay + ' / ' + d.tong + ' Discovered' + (them ? ' · ' + them : ''));
      } else if (r.k === 'loi-tat'){
        traoHet(r.thuong);
        if (!im) bao('Passage Opened · ' + r.muc.ten);
      } else if (r.k === 'thanh-tuu'){
        if (!im) bao('Achievement · ' + r.muc.ten);
      } else if (r.k === 'nv-lo'){
        if (!im) bao('Echo Journal: “' + r.muc.ten + '”');
      } else if (r.k === 'tien-do'){
        if (!im) bao(r.muc.ten + ' ' + r.td.da + '/' + r.td.tong);
      } else if (r.k === 'nv-xong'){
        const xong = traoHet(r.thuong), them = moTaThuong(xong);
        const tt = r.thuong.filter(t => t.loai === 'thanh_tuu').map(t => (M.A.D.thanh_tuu || []).find(x => x.id === t.id)).filter(Boolean);
        if (!im) bao('Remembered · ' + r.muc.ten + (them ? ' · ' + them : ''));
        if (!im) for (const x of tt) bao('Achievement · ' + x.ten);
      }
    }
    if (doi){ ghi(); capNhatNut(); }
  }
  const gui = (ev, im) => xuLy(M.A.suKien(Object.assign({vung:VUNG, phong:V1.G.id}, ev), the()), im);

  /* ---- theo dõi Vùng 1 (chỉ đọc, sau mỗi bước thế giới) ---- */
  const TD = {id:null, nhat:0, vo:0, trum:false, imT:0, imO:''};
  function datMoc(){
    const L = V1.G.luu || {};
    TD.nhat = (L.daNhat || []).length; TD.vo = (L.tuongVo || []).length; TD.trum = !!L.trumHa;
  }
  function quetCu(){   // bản lưu đã có từ trước khi bật: tính bù những gì đã làm (không báo ồn ào)
    const L = V1.G.luu || {};
    for (const s of (L.tuongVo || [])){ const [p, c, h] = s.split(':'); gui({k:'vo-tuong', phong:p, cot:+c, hang:+h}, true); }
    for (const id of (L.daNhat || [])) gui({k:'nhat', id, phong:id.split('-')[0]}, true);
    gui({k:'kiem'}, true);
    thuTraoCho(); ghi();
    const d = M.A.dem(VUNG); if (d.timThay) bao('Region 1 secrets found: ' + d.timThay + '/' + d.tong);
  }
  function theoDoi(){
    const G = V1.G, L = G.luu; if (!L || !G.phong) return;
    if (G.id !== TD.id){ TD.id = G.id; TD.imT = 0; gui({k:'vao-phong'}); }
    if (L.daNhat.length > TD.nhat){
      for (const id of L.daNhat.slice(TD.nhat)){
        const tt = (M.A.D.the_ten || {})[id]; if (tt) bao(tt.ten + ' · “' + tt.chu + '”');   // chữ khắc Thẻ Tên (ChatGPT)
        gui({k:'nhat', id});
      }
      TD.nhat = L.daNhat.length;
    }
    if (L.tuongVo.length > TD.vo){ for (const s of L.tuongVo.slice(TD.vo)){ const [p, c, h] = s.split(':'); gui({k:'vo-tuong', phong:p, cot:+c, hang:+h}); } TD.vo = L.tuongVo.length; }
    if (L.trumHa && !TD.trum){ TD.trum = true; gui({k:'ha-trum'}); }
    const pl = E.pl, cx = Math.floor((pl.x + pl.w / 2) / T), cy = Math.floor((pl.y + pl.h / 2) / T);
    if (E.tile(cx, cy) === 'G') gui({k:'cham-o', o:'G', cot:cx, hang:cy});
    // đứng im (cho bí mật kiểu "lắng nghe") – báo mỗi giây
    const o = cx + ',' + cy, im = pl.onGround && Math.abs(pl.vx) < 0.05 && !pl.atk && !pl.dead;
    if (im && o === TD.imO){ TD.imT++; if (TD.imT % 60 === 0) gui({k:'dung-im', cot:cx, hang:cy, giay:TD.imT / 60}); } else { TD.imT = 0; TD.imO = o; }
  }

  function moc(){
    const sk = V1.suKienTheGioi;
    V1.suKienTheGioi = function(){
      let bi = 0; for (const e of E.SUKIEN) if (e.k === 'bi-danh') bi++;
      sk.apply(this, arguments);
      if (M.bat && V1.G.luu && V1.G.phong) for (let i = 0; i < bi; i++) gui({k:'bi-danh'});
    };
    const bt = V1.buocTheGioi;
    V1.buocTheGioi = function(){
      bt.apply(this, arguments);
      if (!M.bat) return;
      if (!M.daQuet && V1.G.luu && V1.G.phong){ M.daQuet = true; TD.id = V1.G.id; datMoc(); quetCu(); gui({k:'vao-phong'}); }
      theoDoi(); buocBao();
    };
    const bd = V1.batDau;   // chơi mới / tải lại: đặt lại mốc theo dõi
    V1.batDau = async function(){ const r = await bd.apply(this, arguments); M.daQuet = false; return r; };
    const mc = V1.moChuong;
    V1.moChuong = function(){ mc.apply(this, arguments); capNhatNut(); };
  }

  /* ---- Nhật Ký Tiếng Vọng: nút trong bảng Chuông Lưu + bảng chữ (nút to, dễ bấm iPhone ngang) ---- */
  const $ = id => document.getElementById(id);
  function taoGiaoDien(){
    const st = document.createElement('style');
    st.textContent = '#l-an .hop{max-width:min(760px,96vw);max-height:92vh;overflow:auto;-webkit-overflow-scrolling:touch;text-align:left}' +
      '#l-an h1{text-align:center}#an-ds{margin-top:8px}' +
      '#an-ds .muc{display:flex;gap:10px;align-items:center;min-height:52px;padding:6px 10px;margin:0 0 6px;border:1px solid var(--line);border-radius:10px;background:#141b24}' +
      '#an-ds .muc img{width:44px;height:44px;image-rendering:pixelated;flex:none}' +
      '#an-ds .muc b{display:block;font-size:15px;color:var(--ink)}#an-ds .muc.xong b{color:#9be7a0}' +
      '#an-ds .muc span{display:block;font-size:12.5px;color:#a9b3bf;line-height:1.35}' +
      '#an-ds .trong{color:#7f8a99;font-size:13px;text-align:center}' +
      '#an-ds h2{font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#CEF0D6;margin:12px 0 6px}' +
      '#an-ds .tt{font-size:11.5px;color:#E1B85A;margin-left:6px;font-weight:normal}' +
      '#an-ds .doan{white-space:pre-line;font-style:italic}';
    document.head.appendChild(st);
    const b = document.createElement('button'); b.id = 'b-an'; b.type = 'button'; b.onclick = moBang;
    const hang = $('b-mua') && $('b-mua').parentNode; if (hang) hang.insertBefore(b, $('b-di'));
    const lop = document.createElement('div'); lop.id = 'l-an'; lop.className = 'lop ui';
    lop.innerHTML = '<div class="hop"><h1>Echo Journal</h1><p id="an-tt" style="text-align:center"></p><div id="an-ds"></div>' +
      '<div class="hang"><button id="b-an-dong" class="chinh" type="button">Back to Rest Bell</button></div></div>';
    $('game').appendChild(lop);
    $('b-an-dong').onclick = () => { lop.classList.remove('mo'); capNhatNut(); };
    capNhatNut();
  }
  function capNhatNut(){
    const b = $('b-an'); if (!b || !M.A) return;
    const d = M.A.dem(VUNG); b.textContent = 'Journal · Secrets ' + d.timThay + '/' + d.tong;
  }
  function moBang(){
    const A = M.A, d = A.dem(VUNG), tt = A.thanhTuu().length, tong = (A.D.thanh_tuu || []).length;
    $('an-tt').innerHTML = 'Region 1 secrets: <b style="color:#78e6e6">' + d.timThay + '/' + d.tong + '</b> · Achievements: <b style="color:#ffe08a">' + tt + '/' + tong + '</b>' +
      (window.LuuChung ? ' · Memory Shards: <b style="color:#CEF0D6">' + LuuChung.soKyUc() + '</b>' : '');
    const lt = A.demLoiTat(VUNG); if (lt.tong) $('an-tt').innerHTML += ' · Passages: <b>' + lt.mo + '/' + lt.tong + '</b>';
    const ds = $('an-ds'), nk = A.nhatKy(VUNG), the = A.theTen(), tr = A.truyenDaMo(); ds.innerHTML = '';
    const muc = (ten, phu, o) => { const el = document.createElement('div'); el.className = 'muc' + (o && o.xong ? ' xong' : '');
      const anh = o && o.anh && M.anh[o.anh];
      el.innerHTML = (anh ? '<img alt="" src="' + anh.src + '">' : '') + '<div><b>' + ten + (o && o.tt ? '<i class="tt">' + o.tt + '</i>' : '') + '</b><span' + (o && o.doan ? ' class="doan"' : '') + '>' + phu + '</span></div>';
      ds.appendChild(el); };
    const muc2 = s => { const h = document.createElement('h2'); h.textContent = s; ds.appendChild(h); };
    if (!nk.length && !the.length) ds.innerHTML = '<p class="trong">No entries yet. The Heartwood still keeps many untold things…</p>';
    // chỉ hiện những gì người chơi đã chạm tới (không "???" cho mục chưa biết – ChatGPT)
    if (nk.length){ muc2('Whispers'); for (const n of nk) muc(n.ten + (n.td && !n.xong ? ' – ' + n.td.da + '/' + n.td.tong : ''), n.goi_y, {xong:n.xong, tt:n.trang_thai, anh:n.bieu_tuong}); }
    if (the.length){ muc2('Name Tags'); for (const t of the) muc(t.ten, '“' + t.chu + '”'); }
    if (tr.length){ muc2('Remembered'); for (const t of tr) muc(t.ten, t.chu, {doan:true, xong:true}); }
    const ttDa = A.thanhTuu().map(id => (A.D.thanh_tuu || []).find(x => x.id === id)).filter(Boolean);
    if (ttDa.length){ muc2('Achievements'); for (const t of ttDa) muc(t.ten, t.mo_ta, {xong:true}); }
    $('l-an').classList.add('mo');
  }
  M.moBang = moBang; M.ghi = ghi; M.gui = gui;
  M.san = khoiDong();
})();
