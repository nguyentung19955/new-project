'use strict';
/* moc-vung-1.js – móc nhỏ "Vật phẩm ẩn + Nhiệm vụ ẩn" (phiên "an") vào Vùng 1.
   MẶC ĐỊNH TẮT: chỉ bật khi game/an/du-lieu.json có "bat_mac_dinh": true hoặc mở trang với ?an=1 (chơi thử; &an_moi=1 xoá tiến độ bí mật).
   Tắt → không làm gì, Vùng 1 y hệt cũ. Chỉ ĐỌC trạng thái Vùng 1 (phòng, vật đã nhặt, tường đã vỡ, trùm) để phát hiện bí mật;
   lưu riêng khoá 'tvcc-an'. Hình CHỈ là ảnh ChatGPT (docs/yeu-cau-anh/an/, XONG 02/11): khung nhật ký 760×320 + tab + dòng + ô chi tiết + nút đóng
   + thanh cuộn + Thẻ Tên (006–009, 013–015, 019), thông báo góc trên phải (010, 011) + biểu tượng (012) + hiệu ứng lộ nhiệm vụ (018, khung 64×64),
   Mảnh Ký Ức (005), dấu hiệu Ashen Lullaby trong phòng (016, 017), bóng tiếng vọng ở P01 (020). Thiếu ảnh nhóm nào → nhóm đó về kiểu chữ cũ. */
(function(){
  const V1 = window.V1, E = typeof DongCoMN !== 'undefined' ? DongCoMN : null;
  if (!V1 || !E || !window.BiMat) return;
  const Q = new URLSearchParams(location.search), VUNG = 'vung-1', GOC = '../../', T = 48;
  const M = window.MocAn = {bat:false, A:null, anh:{}, hang:[], loi:[]};

  function docLuu(){ try { const s = localStorage.getItem(BiMat.KHOA_LUU); return s ? JSON.parse(s) : null; } catch (e){ return null; } }
  function ghi(){ try { localStorage.setItem(BiMat.KHOA_LUU, JSON.stringify(M.A.luu())); } catch (e){} }
  const thuAnh = p => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = GOC + p; });
  const GD = 'art/an/giao-dien/', BT = 'art/an/bieu-tuong/';
  const ANH_NK = ['khung-nhat-ky', 'tab-bat', 'tab-tat', 'dong-thuong', 'dong-chon', 'dong-xong', 'o-chi-tiet', 'dong-thuong-nut', 'dong-an-nut',
    'cuon-thuong', 'cuon-keo', 'the-ten-trong', 'the-ten-co', 'tt-discovered', 'tt-unfinished', 'tt-remembered'].map(x => GD + x + '.png');
  const ANH_TB = [GD + 'toast-bi-mat.png', GD + 'toast-thanh-tuu.png'].concat(['root', 'bell', 'mask', 'memory', 'bronze', 'echo'].map(x => BT + x + '.png'));
  const PH = Array.from({length:6}, (_, i) => 'art/an/phat-hien/f' + i + '.png'), BONG = Array.from({length:8}, (_, i) => 'art/an/bong-tieng-vong/f' + i + '.png');
  const KU = 'art/an/manh-ky-uc/icon.png', DH = {rung:'art/an/dau-hieu/rung-thap.png', vong:'art/an/dau-hieu/vong-tien-do.png', khe:'art/an/dau-hieu/khe-nut-sang.png'};
  const du = ds => ds.every(p => M.anh[p]);

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
    for (const p of [].concat(ANH_NK, ANH_TB, PH, BONG, [KU], Object.values(DH))) ds.add(p);
    await Promise.all([...ds].map(async p => { const i = await thuAnh(p); if (i) M.anh[p] = i; }));
    M.A = BiMat.tao(D, docLuu(), {coAnh:p => !!M.anh[p], the});
    for (let i = 0; i < 600 && !(window.TV && TV.xong); i++) await new Promise(ok => setTimeout(ok, 50));
    M.coNK = du(ANH_NK); M.coTB = du(ANH_TB); M.coPH = du(PH); M.coBong = du(BONG); M.coKU = !!M.anh[KU];
    M.bat = true;
    moc();
    mocVe();
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
  // mỗi mục hàng: chuỗi (dòng chữ Vùng 1) hoặc {chu, tb:{loai, tieu, phu, icon, phatHien}} (khung thông báo ChatGPT; chu = bản chữ dự phòng)
  function bao(s, tb){ M.hang.push(tb && M.coTB ? {chu:s, tb, toString(){ return this.chu; }} : s); }
  const TB = {t:0};
  function buocBao(){
    const G = V1.G; if (TB.t > 0 && --TB.t === 0) anToast();
    if (!M.hang.length) return;
    const h = M.hang[0];
    // khung thông báo và dòng chữ Vùng 1 lần lượt (không hiện cùng lúc để khỏi đè nhau)
    if (typeof h === 'object'){ if (TB.t <= 0 && G.tbT <= 20){ M.hang.shift(); hienToast(h.tb); TB.t = 170; } }   // ~2,8 s (ChatGPT: 2,5–3 s)
    else if (G.tbT <= 20 && TB.t <= 0){ V1.thongBao(M.hang.shift()); G.tbT = 170; }
  }
  function hienToast(o){
    const el = $('an-toast'); if (!el) return;
    const lon = o.loai === 'thanh-tuu';
    el.className = lon ? 'lon' : ''; el.style.backgroundImage = 'url(' + GOC + GD + (lon ? 'toast-thanh-tuu.png' : 'toast-bi-mat.png') + ')';
    el.innerHTML = (o.icon && M.anh[o.icon] ? '<img class="ic" alt="" src="' + GOC + o.icon + '">' : '') + (o.phatHien && M.coPH ? '<img class="ph" alt="" src="' + GOC + PH[0] + '">' : '') +
      '<b>' + o.tieu + '</b><span>' + o.phu + '</span>';
    el.hidden = false; M.toast = o;
    const ph = el.querySelector('.ph'); if (ph){ let k = 0; const id = setInterval(() => { if (++k >= PH.length || !ph.isConnected){ clearInterval(id); if (ph.isConnected) ph.remove(); return; } ph.src = GOC + PH[k]; }, 70); }   // 018: 6 khung 70 ms, không lặp
  }
  function anToast(){ const el = $('an-toast'); if (el) el.hidden = true; M.toast = null; }

  function xuLy(ra, im){
    let doi = false;
    for (const r of ra){
      doi = true;
      if (r.k === 'bi-mat'){
        const d = M.A.dem(VUNG), them = moTaThuong(traoHet(r.thuong));
        if (!im) bao('Secret Found · ' + r.muc.ten + ' · ' + d.timThay + ' / ' + d.tong + ' Discovered' + (them ? ' · ' + them : ''),
          {loai:'bi-mat', tieu:'Secret Found', phu:d.timThay + ' / ' + d.tong + ' Discovered', icon:r.muc.bieu_tuong || iconThuong(r.thuong)});
        if (!im && them && M.coTB) bao(them);   // phần thưởng: dòng chữ riêng (khung 270 px chỉ đủ 1 dòng phụ ngắn)
      } else if (r.k === 'loi-tat'){
        traoHet(r.thuong);
        if (!im) bao('Passage Opened · ' + r.muc.ten, {loai:'loi-tat', tieu:'Passage Opened', phu:r.muc.ten, icon:BT + 'root.png'});
      } else if (r.k === 'thanh-tuu'){
        if (!im) bao('Achievement · ' + r.muc.ten, {loai:'thanh-tuu', tieu:'Achievement', phu:r.muc.ten, icon:BT + 'bronze.png'});
      } else if (r.k === 'nv-lo'){
        if (!im) bao('Echo Journal: “' + r.muc.ten + '”', {loai:'nv-lo', tieu:'Echo Journal', phu:'“' + r.muc.ten + '”', icon:r.muc.bieu_tuong, phatHien:true});
      } else if (r.k === 'tien-do'){
        if (!im) bao(r.muc.ten + ' ' + r.td.da + '/' + r.td.tong, {loai:'tien-do', tieu:r.muc.ten, phu:r.td.da + ' / ' + r.td.tong, icon:r.muc.bieu_tuong});
      } else if (r.k === 'nv-xong'){
        const xong = traoHet(r.thuong), them = moTaThuong(xong);
        const tt = r.thuong.filter(t => t.loai === 'thanh_tuu').map(t => (M.A.D.thanh_tuu || []).find(x => x.id === t.id)).filter(Boolean);
        if (!im) bao('Remembered · ' + r.muc.ten + (them ? ' · ' + them : ''), {loai:'nv-xong', tieu:'Remembered', phu:r.muc.ten + (them ? ' · ' + them : ''),
          icon:xong.some(t => t.loai === 'ky_uc') && M.coKU ? KU : r.muc.bieu_tuong});
        if (!im) for (const x of tt) bao('Achievement · ' + x.ten, {loai:'thanh-tuu', tieu:'Achievement', phu:x.ten, icon:BT + 'bronze.png'});
        if (r.muc.anh_bong && M.coBong && !im) M.bong = {t:0, x:E.pl.x + E.pl.w / 2 + 150 * (E.pl.face || 1), y:E.pl.y + E.pl.h, id:V1.G.id};   // 020: bóng tiếng vọng đứng lặng rồi tan
      }
    }
    if (doi){ ghi(); capNhatNut(); }
  }
  const iconThuong = ds => (ds || []).some(t => t.loai === 'ky_uc') && M.coKU ? KU : BT + 'root.png';
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
    if (G.id !== TD.id){ const tu = TD.id; TD.id = G.id; TD.imT = 0; gui({k:'vao-phong', tu}); }
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

  /* ---- vẽ trong phòng (chỉ ảnh ChatGPT + mờ dần/mặt nạ cung): dấu hiệu Ashen Lullaby (016, 017) + bóng tiếng vọng P01 (020) ---- */
  function mocVe(){
    const veGoc = V1.ve, cv = $('cv'), ctx = cv && cv.getContext('2d'), W = 960, PX = 3, T = 48;
    if (!ctx) return;
    const ru = (M.A.D.bi_mat || []).find(m => m.dieu_kien && m.dieu_kien.dung_im);
    const ruBat = ru && !ru.cho_tinh_nang && !ru.cho_chatgpt && (ru.can_anh || []).every(p => M.anh[p]) && M.anh[DH.khe];
    V1.ve = function(mo){
      veGoc.apply(this, arguments);
      const G = V1.G; if (!G.phong || G.trang !== 'choi' || G.chuyen || (mo || 0) > 0.05) return;
      const coRu = ruBat && G.id === ru.dieu_kien.dung_im.phong, coBong = M.bong && M.bong.id === G.id;
      if (!coRu && !coBong) return;
      const Mx = cv.width / W, cam = Math.round(V1.CAM.x / PX) * PX, camY = Math.round(V1.CAM.y / PX) * PX, f = (E.S && E.S.frame) || 0;
      ctx.save(); ctx.setTransform(Mx, 0, 0, Mx, 0, 0); ctx.imageSmoothingEnabled = false; ctx.translate(-cam, -camY);
      const veDay = (im, x, y, k, a, lat) => { const w = Math.round(im.width * k), h = Math.round(im.height * k); ctx.save(); ctx.globalAlpha = a; ctx.translate(Math.round(x), Math.round(y)); if (lat) ctx.scale(-1, 1); ctx.drawImage(im, -w >> 1, -h, w, h); ctx.restore(); };
      if (coRu){
        const d = ru.dieu_kien.dung_im, x = d.cot * T + T / 2, day = (d.hang + 1) * T;   // chuông vùi tro (trang trí P04-chuong-do) đứng trên gờ hàng d.hang+1
        if (M.A.daTim(ru.id)) veDay(M.anh[DH.khe], x, day - 58, 1.5, 0.75 + 0.25 * Math.sin(f / 20));          // khe nứt sáng trên mặt chuông khi xong
        else {
          veDay(M.anh[DH.rung], x, day - 150, 1.5, 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(f / 18)));             // 1 vạch sóng thấp phía trên chuông, mờ dần theo nhịp
          const pl = E.pl, cx = Math.floor((pl.x + pl.w / 2) / T), cy = Math.floor((pl.y + pl.h / 2) / T);
          const tien = Math.min(1, TD.imT / (d.giay * 60));
          if (tien > 0 && Math.abs(cx - d.cot) <= d.ban_kinh && Math.abs(cy - d.hang) <= d.ban_kinh){   // vòng tiến độ: cắt cung theo thời gian đứng yên
            const im = M.anh[DH.vong], r = im.width * 1.5, cxv = x, cyv = day - 70;   // chuông nằm cao ~140 px trên gờ
            ctx.save(); ctx.beginPath(); ctx.moveTo(cxv, cyv); ctx.arc(cxv, cyv, r, -Math.PI / 2, -Math.PI / 2 + tien * Math.PI * 2); ctx.closePath(); ctx.clip();
            ctx.drawImage(im, Math.round(cxv - r / 2), Math.round(cyv - r / 2), Math.round(r), Math.round(r)); ctx.restore();
          }
        }
      }
      if (coBong){   // 4 khung đứng thở (140 ms, lặp ~2,8 s) rồi 4 khung tan (90 ms); gốc quay TRÁI → lật khi Kiếm Khách ở bên phải
        const b = M.bong; b.t += 1000 / 60;
        const k = b.t < 2800 ? Math.floor(b.t / 140) % 4 : 4 + Math.floor((b.t - 2800) / 90);
        if (k > 7) M.bong = null;
        else veDay(M.anh[BONG[k]], b.x, b.y, E.TL * E.CO * 0.75, 0.9, E.pl.x + E.pl.w / 2 > b.x);
      }
      ctx.restore();
    };
  }

  /* ---- Nhật Ký Tiếng Vọng: nút trong bảng Chuông Lưu + bảng chữ (nút to, dễ bấm iPhone ngang) ---- */
  const $ = id => document.getElementById(id);
  function taoGiaoDien(){
    const st = document.createElement('style');
    st.textContent = M.coNK ? '' : '#l-an .hop{max-width:min(760px,96vw);max-height:92vh;overflow:auto;-webkit-overflow-scrolling:touch;text-align:left}' +
      '#l-an h1{text-align:center}#an-ds{margin-top:8px}' +
      '#an-ds .muc{display:flex;gap:10px;align-items:center;min-height:52px;padding:6px 10px;margin:0 0 6px;border:1px solid var(--line);border-radius:10px;background:#141b24}' +
      '#an-ds .muc img{width:44px;height:44px;image-rendering:pixelated;flex:none}' +
      '#an-ds .muc b{display:block;font-size:15px;color:var(--ink)}#an-ds .muc.xong b{color:#9be7a0}' +
      '#an-ds .muc span{display:block;font-size:12.5px;color:#a9b3bf;line-height:1.35}' +
      '#an-ds .trong{color:#7f8a99;font-size:13px;text-align:center}' +
      '#an-ds h2{font:700 18px/1 var(--ui-pixel);letter-spacing:.07em;text-transform:uppercase;color:#CEF0D6;margin:12px 0 6px;text-shadow:var(--ui-shadow-outline)}' +
      '#an-ds .tt{font-size:11.5px;color:#E1B85A;margin-left:6px;font-weight:normal}' +
      '#an-ds .doan{white-space:pre-line;font-style:italic}';
    document.head.appendChild(st);
    const b = document.createElement('button'); b.id = 'b-an'; b.type = 'button'; b.onclick = moBang;
    const hang = $('b-mua') && $('b-mua').parentNode; if (hang) hang.insertBefore(b, $('b-di'));
    if (M.coTB){   // thông báo góc trên phải (dưới hàng nút #top), trong safe area – 010 / 011
      st.textContent += '#an-toast{position:absolute;z-index:5;top:calc(var(--sat) + 112px);right:max(8px,calc(var(--sar) + 8px));width:270px;height:58px;box-sizing:border-box;padding:11px 14px 0 74px;' +
        'background:center/100% 100% no-repeat;pointer-events:none;image-rendering:pixelated;font-family:inherit}#an-toast.lon{width:300px;height:66px;padding:13px 18px 0 82px}' +
        '#an-toast b{display:block;font:700 19px/18px var(--ui-pixel);letter-spacing:.015em;text-shadow:var(--ui-shadow-outline);color:#CEF0D6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#an-toast.lon b{color:#E1B85A}' +
        '#an-toast span{display:block;font-size:12px;line-height:16px;color:#c9d0d8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
        '#an-toast .ic{position:absolute;left:30px;top:15px;width:28px;height:28px;image-rendering:pixelated}#an-toast.lon .ic{left:30px;top:15px;width:36px;height:36px}' +
        '#an-toast .ph{position:absolute;left:12px;top:-3px;width:64px;height:64px;image-rendering:pixelated}';
      const t = document.createElement('div'); t.id = 'an-toast'; t.hidden = true; $('game').appendChild(t);
    }
    const lop = document.createElement('div'); lop.id = 'l-an'; lop.className = 'lop ui';
    if (M.coNK) taoNhatKy(st, lop);
    else lop.innerHTML = '<div class="hop"><h1>Echo Journal</h1><p id="an-tt" style="text-align:center"></p><div id="an-ds"></div>' +
      '<div class="hang"><button id="b-an-dong" class="chinh" type="button">Back to Rest Bell</button></div></div>';
    $('game').appendChild(lop);
    $('b-an-dong').onclick = () => { lop.classList.remove('mo'); capNhatNut(); };
    capNhatNut();
  }
  /* Nhật ký bằng ảnh ChatGPT: khung 760×320 phóng đều ×1,11 → 844×356 (vừa iPhone ngang 844×390). Lòng khung ≈ x 52–794, y 58–314:
     cột tab 148 · danh sách 250 (+ rãnh cuộn 16) · ô chi tiết 340×272 thu ×0,935 → 318×254 (ChatGPT mục 6). */
  function taoNhatKy(st, lop){
    const u = x => 'url(' + GOC + GD + x + '.png)';
    st.textContent += '#l-an .nk{position:relative;width:844px;height:356px;flex:none;background:' + u('khung-nhat-ky') + ' center/100% 100% no-repeat;image-rendering:pixelated;transform-origin:center;text-align:left;color:#c9d0d8}' +
      '#l-an h1{position:absolute;left:66px;top:6px;margin:0;font:750 23px/1.05 var(--ui-pixel);color:var(--ui-gold);letter-spacing:.04em;text-shadow:var(--ui-shadow-header)}' +
      '#b-an-dong{position:absolute;right:62px;top:2px;width:44px;height:44px;min-width:0;padding:0;border:0;border-image:none;background:' + u('dong-thuong-nut') + ' center/100% 100% no-repeat}' +
      '#b-an-dong:active{background-image:' + u('dong-an-nut') + '}' +
      '#an-tab{position:absolute;left:52px;top:58px;width:148px;display:flex;flex-direction:column;gap:4px}' +
      '#an-tab button{width:148px;height:44px;min-width:0;padding:0;margin:0;border:0;border-image:none;background:' + u('tab-tat') + ' center/100% 100% no-repeat;color:var(--ui-parchment);font:700 18px/1 var(--ui-pixel);letter-spacing:.06em;text-shadow:var(--ui-shadow-outline);text-transform:uppercase}' +
      '#an-tab button.chon{background-image:' + u('tab-bat') + ';color:#CEF0D6}' +
      '#an-tt{position:absolute;left:58px;top:252px;width:142px;margin:0;font-size:10.5px;line-height:14px;color:#a9b3bf}#an-tt b{color:#CEF0D6}#an-tt img{width:14px;height:14px;vertical-align:-3px;image-rendering:pixelated}' +
      '#an-ds{position:absolute;left:204px;top:58px;width:250px;height:256px;overflow-y:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}#an-ds::-webkit-scrollbar{display:none}' +
      '#an-ds .muc{position:relative;width:250px;height:56px;margin:0 0 4px;box-sizing:border-box;padding:9px 30px 0 58px;background:' + u('dong-thuong') + ' center/100% 100% no-repeat;cursor:pointer}' +
      '#an-ds .muc.chon{background-image:' + u('dong-chon') + '}#an-ds .muc.xong{background-image:' + u('dong-xong') + '}#an-ds .muc.xong.chon{background-image:' + u('dong-chon') + '}' +
      '#an-ds .muc .ic{position:absolute;left:17px;top:12px;width:32px;height:32px;image-rendering:pixelated}#an-ds .muc .tt{position:absolute;right:10px;top:8px;width:20px;height:20px;image-rendering:pixelated}' +
      '#an-ds .muc b{display:block;font-size:13px;line-height:18px;color:#F3E6C8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#an-ds .muc span{display:block;font-size:11.5px;line-height:15px;color:#a9b3bf;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '#an-ds .muc.the{width:250px;height:58px;padding:0;background:' + u('the-ten-trong') + ' -40px 0/180px 58px no-repeat}#an-ds .muc.the.co{background-image:' + u('the-ten-co') + '}#an-ds .muc.the.chon{outline:2px solid #78e6e6;outline-offset:-3px}' +
      '#an-ds .muc.the b{position:absolute;left:104px;top:19px;width:140px;font-size:14px;line-height:20px;color:#F3E6C8;letter-spacing:.06em}#an-ds .muc.the.chon b{color:#78e6e6}#an-ds .muc.the.chon{outline:0}' +
      '#an-ds .trong{padding:20px 12px;font-size:13px;color:#7f8a99;text-align:center}' +
      '#an-cuon{position:absolute;left:458px;top:58px;width:16px;height:48px;image-rendering:pixelated;touch-action:none;cursor:grab}' +
      '#an-ct{position:absolute;left:476px;top:58px;width:318px;height:254px;box-sizing:border-box;padding:24px 26px 20px;background:' + u('o-chi-tiet') + ' center/100% 100% no-repeat;overflow-y:auto;font-size:13px;line-height:1.4}' +
      '#an-ct h2{margin:0 0 6px;font:750 20px/1.05 var(--ui-pixel);letter-spacing:.03em;color:var(--ui-gold);text-shadow:var(--ui-shadow-outline)}#an-ct p{margin:0 0 8px;white-space:pre-line}#an-ct .doan{font-style:italic;color:#F3E6C8}#an-ct small{color:#7f8a99}';
    lop.innerHTML = '<div class="nk" id="an-nk"><h1>Echo Journal</h1><button id="b-an-dong" type="button" aria-label="Close"></button><div id="an-tab"></div><p id="an-tt"></p>' +
      '<div id="an-ds"></div><img id="an-cuon" alt="" src="' + GOC + GD + 'cuon-thuong.png"><div id="an-ct"></div></div>';
    const ds = lop.querySelector('#an-ds'), cu = lop.querySelector('#an-cuon');
    const datCuon = () => { const max = ds.scrollHeight - ds.clientHeight; cu.hidden = max <= 1; cu.style.top = (58 + (max > 0 ? ds.scrollTop / max : 0) * (256 - 48)) + 'px'; };
    ds.addEventListener('scroll', datCuon); M.datCuon = datCuon;
    let keo = null;   // kéo tay nắm cuộn (015: thường / đang kéo)
    cu.addEventListener('pointerdown', e => { keo = {y:e.clientY, s:ds.scrollTop}; cu.setPointerCapture(e.pointerId); cu.src = GOC + GD + 'cuon-keo.png'; e.preventDefault(); });
    cu.addEventListener('pointermove', e => { if (!keo) return; const k = (ds.scrollHeight - ds.clientHeight) / (256 - 48), z = cu.getBoundingClientRect().height / 48 || 1; ds.scrollTop = keo.s + (e.clientY - keo.y) / z * k; });
    const tha = () => { keo = null; cu.src = GOC + GD + 'cuon-thuong.png'; };
    cu.addEventListener('pointerup', tha); cu.addEventListener('pointercancel', tha);
    const vua = () => { const nk = lop.querySelector('#an-nk'), k = Math.min(1, innerWidth / 844, innerHeight / 356); nk.style.transform = k < 1 ? 'scale(' + k + ')' : ''; };
    addEventListener('resize', vua); M.vuaNK = vua;
  }
  function capNhatNut(){
    const b = $('b-an'); if (!b || !M.A) return;
    const d = M.A.dem(VUNG); b.textContent = 'Journal · Secrets ' + d.timThay + '/' + d.tong;
  }
  const NK = {tab:'whispers', chon:null};
  function moBang(){ if (M.coNK) return moNhatKy(); moBangChu(); }
  function moNhatKy(){
    const A = M.A, d = A.dem(VUNG), ttDa = A.thanhTuu(), tong = (A.D.thanh_tuu || []).length, lt = A.demLoiTat(VUNG), img = p => '<img alt="" src="' + GOC + p + '">';
    $('an-tt').innerHTML = img(BT + 'root.png') + ' Secrets <b>' + d.timThay + '/' + d.tong + '</b><br>' + img(BT + 'bronze.png') + ' Achievements <b>' + ttDa.length + '/' + tong + '</b>' +
      (window.LuuChung ? '<br>' + (M.coKU ? img(KU) : '') + ' Memory Shards <b>' + LuuChung.soKyUc() + '</b>' : '') + (lt.tong ? '<br><span style="margin-left:17px">Passages</span> <b>' + lt.mo + '/' + lt.tong + '</b>' : '');
    const nk = A.nhatKy(VUNG), the = A.theTen(), tr = A.truyenDaMo(), ttMuc = ttDa.map(id => (A.D.thanh_tuu || []).find(x => x.id === id)).filter(Boolean);
    const nvThe = nk.find(n => n.td && ((A.NV.find(x => x.id === n.id) || {}).tien_do || {}).dem === 'the_ten');
    // mục mỗi tab: {id, ten, phu, icon, tt (dấu trạng thái), xong, the?, ct (HTML chi tiết)}
    const ttAnh = n => n.xong ? 'tt-remembered' : n.td && n.td.da > 0 ? 'tt-unfinished' : 'tt-discovered';   // 013 – không hiện "unknown"/"???" (ChatGPT)
    const TAB = {
      whispers:{ten:'Whispers', ds:nk.map(n => ({id:n.id, ten:n.ten, phu:n.xong ? 'Remembered' : n.td ? n.td.da + ' / ' + n.td.tong : 'Discovered', icon:n.bieu_tuong, tt:ttAnh(n), xong:n.xong,
        ct:'<h2>' + n.ten + '</h2><p>' + n.goi_y + '</p><small>' + (n.xong ? 'Remembered' : n.td ? 'Progress ' + n.td.da + ' / ' + n.td.tong : 'Discovered') + '</small>'}))},
      names:{ten:'Name Tags', ds:the.map(t => ({id:t.id, the:true, co:true, ten:(t.ten.split('—')[1] || t.ten).trim(), ct:'<h2>' + t.ten + '</h2><p class="doan">“' + t.chu + '”</p>'}))
        .concat(nvThe && !nvThe.xong ? Array.from({length:Math.max(0, nvThe.td.tong - the.length)}, (_, i) => ({id:'trong-' + i, the:true, co:false, ten:'—',
          ct:'<h2>An empty hook</h2><p>' + nvThe.goi_y + '</p>'})) : [])},
      remembered:{ten:'Remembered', ds:tr.map(t => ({id:t.id, ten:t.ten, phu:'Memory', icon:BT + 'memory.png', tt:'tt-remembered', xong:true, ct:'<h2>' + t.ten + '</h2><p class="doan">' + t.chu + '</p>'}))},
      achievements:{ten:'Achievements', ds:ttMuc.map(t => ({id:t.id, ten:t.ten, phu:t.mo_ta, icon:BT + 'bronze.png', tt:'tt-remembered', xong:true, ct:'<h2>' + t.ten + '</h2><p>' + t.mo_ta + '</p>'}))}
    };
    const tab = $('an-tab'); tab.innerHTML = '';
    for (const [k, v] of Object.entries(TAB)){ const b = document.createElement('button'); b.type = 'button'; b.textContent = v.ten; b.dataset.tab = k; if (k === NK.tab) b.className = 'chon';
      b.onclick = () => { NK.tab = k; NK.chon = null; moNhatKy(); }; tab.appendChild(b); }
    const cur = TAB[NK.tab], ds = $('an-ds'); ds.innerHTML = '';
    if (!cur.ds.some(m => m.id === NK.chon)) NK.chon = cur.ds[0] && cur.ds[0].id;
    for (const m of cur.ds){
      const el = document.createElement('div'); el.className = 'muc' + (m.the ? ' the' + (m.co ? ' co' : '') : '') + (m.xong ? ' xong' : '') + (m.id === NK.chon ? ' chon' : '');
      el.innerHTML = m.the ? '<b>' + m.ten + '</b>' : (m.icon && M.anh[m.icon] ? '<img class="ic" alt="" src="' + GOC + m.icon + '">' : '') + (m.tt ? '<img class="tt" alt="" src="' + GOC + GD + m.tt + '.png">' : '') +
        '<b>' + m.ten + '</b><span>' + m.phu + '</span>';
      el.onclick = () => { NK.chon = m.id; moNhatKy(); }; ds.appendChild(el);
    }
    if (!cur.ds.length) ds.innerHTML = '<p class="trong">No entries yet. The Heartwood still keeps many untold things…</p>';
    const c = cur.ds.find(m => m.id === NK.chon); $('an-ct').innerHTML = c ? c.ct : '';
    $('l-an').classList.add('mo'); M.vuaNK(); M.datCuon();
  }
  M.NK = NK;
  function moBangChu(){
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
