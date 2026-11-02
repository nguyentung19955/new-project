'use strict';
/* moc-vung-1.js – móc nối nhỏ Hệ thống tiến triển / Charm / cây kỹ năng vào Vùng 1 (phiên "do"), phiên bản 2 theo tư vấn ChatGPT.
   MẶC ĐỊNH TẮT: chỉ bật khi du-lieu.json có "bat_mac_dinh": true hoặc mở trang với ?hethong=1 (chơi thử; &hethong_moi=1 xoá tiến độ).
   Tắt → không làm gì cả, Vùng 1 y hệt cũ. Không sửa engine, không sửa bản lưu Vùng 1 (lưu riêng khoá 'tvcc-he-thong').
   LUẬT HÌNH: thứ cần hình (Charm rơi ra + túi Charm, Frostline Slash, Resonance Halo, Fifth Toll, khung giao diện) chỉ hoạt động khi ảnh
   ChatGPT đã có đúng đường dẫn trong du-lieu.json. Không vẽ tạm bằng code: thiếu ảnh = tính năng đó tắt / bảng giữ kiểu chữ có sẵn. */
(function(){
  const V1 = window.V1, E = typeof DongCoMN !== 'undefined' ? DongCoMN : null;
  if (!V1 || !E || !window.HeThong) return;
  const Q = new URLSearchParams(location.search);
  const GOC = '../../', VUNG = 'vung-1', FPS = 60;
  const M = window.MocHeThong = {bat:false, ht:null, anh:{}, loi:[], vfx:{}, fx:[]};

  function docLuu(){ try { const s = localStorage.getItem(HeThong.KHOA_LUU); return s ? JSON.parse(s) : null; } catch (e){ return null; } }
  function ghi(){ try { localStorage.setItem(HeThong.KHOA_LUU, JSON.stringify(M.ht.luu())); } catch (e){} }
  const thuAnh = p => new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = GOC + p; });
  const f2 = i => 'f' + String(i).padStart(2, '0') + '.png';
  const co = p => !!(p && M.anh[p]);

  async function khoiDong(){
    let D;
    try { const r = await fetch('../he-thong/du-lieu.json', {cache:'no-store'}); D = await r.json(); } catch (e){ M.loi.push('du-lieu.json: ' + e); return; }
    if (!(D.bat_mac_dinh || Q.get('hethong') === '1')) return;
    if (Q.get('hethong_moi') === '1'){ try { localStorage.removeItem(HeThong.KHOA_LUU); } catch (e){} }
    // dò ảnh – thiếu ảnh thì tính năng đó tự tắt
    const ds = new Set();
    for (const n of D.cay) for (const p of (n.can_anh || [])) ds.add(p);
    for (const m of D.charm) ds.add(m.anh);
    for (const h of D.do_hiem){ ds.add(h.khung); ds.add(h.bieu_tuong); }
    const gd = D.giao_dien || {};
    for (const v of Object.values(gd)) if (typeof v === 'string' && v.endsWith('.png')) ds.add(v); else if (v && typeof v === 'object') for (const p of Object.values(v)) ds.add(p);
    await Promise.all([...ds].map(async p => { const i = await thuAnh(p); if (i) M.anh[p] = i; }));
    // VFX: chỉ dùng khi ĐỦ mọi khung
    for (const [id, v] of Object.entries(D.vfx || {})){
      const hinh = await Promise.all(Array.from({length:v.khung}, (_, i) => thuAnh(v.thu_muc + '/' + f2(i))));
      if (hinh.every(Boolean)) M.vfx[id] = Object.assign({hinh}, v);
    }
    const hiemV1 = D.do_hiem.filter((h, i) => ((D.trong_so_hiem || {})[VUNG] || [])[i] > 0);
    M.coDo = D.charm.every(m => co(m.anh)) && hiemV1.every(h => co(h.khung));   // đủ biểu tượng Charm + ô độ hiếm mới cho rơi / hiện túi Charm
    M.ht = HeThong.tao(D, docLuu(), {coAnh:co, vung:VUNG, coChe:[],
      coCo:c => c === 'ha_trum:' + VUNG ? !!(V1.G.luu && V1.G.luu.trumHa) : !!(window.LuuChung && LuuChung.co && LuuChung.co(c)),
      soKyUc:() => (window.LuuChung && LuuChung.soKyUc) ? LuuChung.soKyUc() : 0});
    for (let i = 0; i < 600 && !(window.TV && TV.xong); i++) await new Promise(ok => setTimeout(ok, 50));   // chờ Vùng 1 nạp xong nhân vật
    M.bat = true;
    await apDung();
    moc();
    mocVe();
    taoGiaoDien();
  }

  /* ---- áp chỉ số vào nhân vật (chỉ đổi DỮ LIỆU, không sửa engine) ---- */
  async function apDung(){
    const c = M.ht.chiSo(), base = V1.CAP[Math.min(c.cap_kiem, V1.CAP.length - 1)] || V1.CAP[0];
    if (base){
      const cap = Object.assign({}, base, {sat_thuong:Math.round(base.sat_thuong * (1 + c.sat_thuong / 100))});
      E.NV.cap = cap; E.NV.capClip = cap.clip;
      E.NV.chuoi = (cap.chuoi || V1.NVJ.chuoi || ['don1', 'don2', 'don4']).slice();
    }
    // nhát combo thêm (Fifth Toll → don5) – chỉ khi ảnh đã có
    for (const ten of c.them_nhat){
      const n = M.ht.D.cay.find(n => n.hieu_ung && n.hieu_ung.them_nhat === ten);
      if (!n || !n.clip) continue;
      if (!E.NV.capClip[ten]) E.NV.capClip[ten] = await SpriteMN.napClip(V1.NVJ.goc, n.clip, ten);
      if (E.NV.capClip[ten].ok && !E.NV.chuoi.includes(ten)) E.NV.chuoi.push(ten);
    }
    M.chiSo = c;
  }

  /* ---- móc sự kiện: XP khi hạ quái, Mảnh Âm thêm, bất tử thêm, Charm, rơi đồ ---- */
  const H = {dem:0, hoanT:-1e9, ketT:-1e9};   // bộ đếm hiệu ứng Charm
  const khung = () => (E.S && E.S.frame) || 0;
  function loaiQuai(q){
    if (q === V1.G.trum || q.laTrum || (q.def && q.def.ai)) return 'trum';
    if (q.laTinhAnh) return 'tinh_anh';
    return ((q.def && q.def.mau) || 0) >= M.ht.D.diem.nguong_quai_manh ? 'quai_manh' : 'quai_thuong';
  }
  function thongBaoCap(r){
    if (r.lenCap <= 0) return;
    const n = M.ht.notCon(), D = M.ht.D.diem;
    V1.thongBao('Level ' + M.ht.cap() + ' · ' + n + ' ' + (n === 1 ? D.ten_not : D.ten_not_nhieu) + ' – learn at a Rest Bell');
    phatFx('halo');
  }
  M.congDiem = function(nguon, o){ const r = M.ht.congDiem(nguon, o); thongBaoCap(r); ghi(); return r; };   // cho phiên khác (vd "an") gọi
  function moc(){
    const goc = V1.suKienTheGioi;
    V1.suKienTheGioi = function(){
      const c = M.chiSo, pl = E.pl, giet = [];
      for (const e of E.SUKIEN){
        if (e.k === 'quai-chet' && e.q) giet.push(e.q);
        if (e.k === 'bi-danh' && !e.chet){
          if (c.khang > 0) pl.iframes += c.khang;
          if (c.tren_khong_khang > 0 && (!pl.onGround || pl.leo)) pl.iframes += c.tren_khong_khang;   // Rootbound Oath
        }
        if (e.k === 'trung' && c.hoan_hoi){   // Bell's Return
          H.dem++;
          const L = V1.G.luu, han = c.hoan_hoi.hoi_noi_bo_giay * FPS;
          if (H.dem >= c.hoan_hoi.so_don && khung() - H.hoanT >= han && L && (pl.luotHoi || 0) < L.hoiMax){
            pl.luotHoi = (pl.luotHoi || 0) + 1; H.dem = 0; H.hoanT = khung(); V1.thongBao("Bell's Return: +1 heal charge");
          }
        }
        if (e.k === 'hoi-mau' && c.hoi_mau > 0 && Math.random() * 100 < c.hoi_mau * (E.P.hoiLuong || 1)){   // Gentle Reprieve (máu là số nguyên → xác suất)
          pl.hp = Math.min(E.P.maxHp, pl.hp + 1);
        }
        if (e.k === 'ra-don' && c.vfx_chem && M.vfx[c.vfx_chem] && (M.vfx[c.vfx_chem].ap_cho || []).includes(e.ten)) phatFx(c.vfx_chem);
      }
      goc.apply(this, arguments);
      for (const q of giet){
        const loai = loaiQuai(q);
        const r = M.ht.congDiem(loai, loai === 'tinh_anh' ? {khoa:V1.G.id + ':' + q.idx} : undefined);
        thongBaoCap(r);
        if (c.ket_lieu_hoi && khung() - H.ketT >= c.ket_lieu_hoi.hoi_noi_bo_giay * FPS && E.pl.hp < E.P.maxHp && !E.pl.dead){   // Ashen Mercy
          E.pl.hp = Math.min(E.P.maxHp, E.pl.hp + c.ket_lieu_hoi.mau); H.ketT = khung();
        }
        if (c.manh_am > 0){
          const so = q.laTinhAnh ? 60 : Math.round(((q.def && q.def.mau) || 30) / 6) + 3, them = Math.round(so * c.manh_am / 100);
          if (them > 0) V1.roiManh(q.x + q.w / 2, q.y + q.h / 2, them);
        }
        if (M.coDo && !r.moChon){
          const x = M.ht.roiDo(loai === 'tinh_anh' && !r.laDau ? 'tinh_anh_tai_dau' : loai);
          if (x){
            const ten = (M.ht.HIEM[x.mon.hiem] || {}).ten + ' ' + (M.ht.MAU[x.mon.mau] || {}).ten;
            V1.thongBao(x.phanRa ? ten + ' (duplicate) → +' + x.dust + ' ' + M.ht.D.echo_dust.ten : 'Charm found: ' + ten);
          }
        }
        if (M.coDo && r.moChon) V1.thongBao('A Charm answers your victory – choose it at a Rest Bell');
        ghi();
      }
    };
    const moChuong = V1.moChuong;
    V1.moChuong = function(){ moChuong.apply(this, arguments); capNhatNut(); if (M.coDo && M.ht.S.choChon) moChonDau(); };
  }

  /* ---- VFX ChatGPT vẽ (lớp riêng, KHÔNG sửa pixel nhân vật) – chỉ khi đủ khung ảnh ---- */
  function phatFx(id){ const v = M.vfx[id]; if (!v) return; if (id === 'halo') M.fx = M.fx.filter(f => f.id !== 'halo'); M.fx.push({id, t0:performance.now()}); }
  function mocVe(){
    const veGoc = V1.ve, cv = document.getElementById('cv'), ctx = cv && cv.getContext('2d'), W = 960, PX = 3;
    if (!ctx) return;
    V1.ve = function(mo){
      veGoc.apply(this, arguments);
      if (!M.fx.length) return;
      const now = performance.now();
      M.fx = M.fx.filter(f => { const v = M.vfx[f.id]; return v && now - f.t0 < v.khung * v.ms; });
      const G = V1.G; if (!G.phong || G.trang !== 'choi' || G.chuyen || (mo || 0) > 0.05 || !M.fx.length) return;
      const pl = E.pl, Mx = cv.width / W, cam = Math.round(V1.CAM.x / PX) * PX, camY = Math.round(V1.CAM.y / PX) * PX, s = E.TL * E.CO;
      ctx.save(); ctx.setTransform(Mx, 0, 0, Mx, 0, 0); ctx.imageSmoothingEnabled = false; ctx.translate(-cam, -camY);
      for (const f of M.fx){
        const v = M.vfx[f.id], k = Math.min(v.khung - 1, Math.floor((now - f.t0) / v.ms)), im = v.hinh[k];
        ctx.save(); ctx.translate(Math.round(pl.x + pl.w / 2), Math.round(pl.y + pl.h)); if (pl.face < 0) ctx.scale(-1, 1);
        ctx.drawImage(im, Math.round(-v.chan[0] * s), Math.round(-v.chan[1] * s), Math.round(im.width * s), Math.round(im.height * s));
        ctx.restore();
      }
      ctx.restore();
    };
  }

  /* ---- giao diện (iPhone ngang 844×390, nút ≥ 44 px): The Resonance Lattice + túi Charm ---- */
  const $ = id => document.getElementById(id);
  const src = p => GOC + p;
  function taoGiaoDien(){
    const gd = M.ht.D.giao_dien || {}, st = document.createElement('style');
    st.textContent =
      '#l-hethong .hop,#l-charm .hop{width:min(820px,calc(100vw - env(safe-area-inset-left) - env(safe-area-inset-right) - 16px));max-width:none;max-height:94vh;overflow:auto;-webkit-overflow-scrolling:touch;text-align:left;box-sizing:border-box}' +
      '.ht-tab{display:flex;gap:8px;margin:6px 0}.ht-tab button{min-width:96px;min-height:44px;margin:0}.ht-tab button.chon{border-color:var(--bell);color:#ffe08a}' +
      '#ht-cay{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:10px}' +
      '#ht-ds button,#ch-ds button{display:block;width:100%;height:auto;min-height:48px;margin:0 0 6px;padding:6px 10px;text-align:left;font-size:14px;line-height:1.25}' +
      '#ht-ds button small,#ch-ds button small{display:block;font-size:12px;color:#a9b3bf;font-weight:600}' +
      '#ht-ds button.da{border-color:#9be7a0;color:#9be7a0}#ht-ds button.duoc{border-color:var(--bell);color:#ffe08a}#ht-ds button.chon,#ch-ds button.chon{outline:2px solid #78e6e6}' +
      '#ht-ct,#ch-ct{font-size:14px;line-height:1.35;white-space:normal;overflow-wrap:anywhere;min-width:0}#ht-ct button,#ch-ct button,#ch-lo button{min-height:48px;min-width:120px;margin:6px 6px 0 0}' +
      '#ch-bo{display:grid;grid-template-columns:minmax(0,240fr) minmax(0,300fr) minmax(0,160fr);gap:8px}' +
      '#ch-ds button{display:flex;align-items:center;gap:8px}.ch-o{position:relative;width:56px;height:56px;flex:none}.ch-o img{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated}' +
      '#l-chondau .hang button{height:auto;min-height:120px;width:220px;min-width:0;padding:10px 12px;display:inline-flex;flex-direction:column;align-items:center;gap:4px;white-space:normal}' +
      '#l-chondau .ch-o{width:72px;height:72px}#l-chondau small{display:block;margin:0;font-size:11.5px;line-height:1.3;color:#d8cfbd;font-weight:600}#l-chondau p{margin:4px 0}' +
      '@media (max-width:640px){#ht-cay,#ch-bo{grid-template-columns:1fr}}' +
      // khung-chinh.png 844×390, viền ~30 px + mặt nạ ở 4 góc → lề trong 30/52 px; bỏ khung 9 mảnh của Chuông Lưu (border-image) để không vẽ chồng
      (co(gd.khung_chinh) ? '#l-hethong .hop,#l-charm .hop{border:0;border-image:none;padding:34px 92px 30px;background:url(' + src(gd.khung_chinh) + ') center/100% 100% no-repeat}#l-hethong .hop::before,#l-charm .hop::before{display:none}' : '') +
      // tooltip.png 320×170, viền ~22 px, 2 chuông treo trong 2 góc trên → lề trong 24/46 px
      // tooltip 320×170 cắt 9 mảnh (mặt nạ + chuông 2 góc trên ≈ 62×78, viền dưới ≈ 30) thu ×0,6 → góc giữ nguyên hình khi ô cao/thấp khác nhau
      (co(gd.tooltip) ? '#ht-ct,#ch-ct{padding:0 4px;border:solid transparent;border-width:47px 37px 18px 37px;border-image:url(' + src(gd.tooltip) + ') 78 62 30 62 fill / 47px 37px 18px 37px stretch;min-height:102px;box-sizing:border-box}' : '') +
      (co(gd.khung_chinh) ? '#l-hethong h1,#l-charm h1{text-align:center}' : '') +
      // tab 96×40 giữ đúng cỡ ảnh (nút cao 44 để dễ bấm)
      (co(gd.tab) && co(gd.tab_chon) ? '.ht-tab button{width:96px;min-width:96px;height:44px;padding:0;border:0;border-image:none;background:url(' + src(gd.tab) + ') center/96px 40px no-repeat}.ht-tab button.chon{background-image:url(' + src(gd.tab_chon) + ')}' : '') +
      (co(gd.nut) ? '#ht-ct button,#ch-ct button{height:48px;padding:0 16px;white-space:nowrap;font-size:14px;border:0;border-image:none;background:url(' + src(gd.nut) + ') center/100% 100% no-repeat}' : '') +
      (co(gd.nut_khoa) ? '#ht-ct button.khoa{border:0;border-image:none;background:url(' + src(gd.nut_khoa) + ') center/100% 100% no-repeat;color:#8b8f96;opacity:1}' : '') +
      '#ch-lo button{height:auto;min-width:0;padding:2px;border:0;border-image:none;background:none}.ch-cam{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 8px}.ch-cam img{width:40px;height:40px;image-rendering:pixelated}' +
      '.ch-hiem{width:24px;height:24px;vertical-align:-6px;margin-right:4px;image-rendering:pixelated}';
    document.head.appendChild(st);
    const hang = $('b-mua') && $('b-mua').parentNode;
    const b = document.createElement('button'); b.id = 'b-hethong'; b.type = 'button'; b.onclick = () => moBang();
    if (hang) hang.insertBefore(b, $('b-di'));
    if (M.coDo){ const b2 = document.createElement('button'); b2.id = 'b-charm'; b2.type = 'button'; b2.onclick = () => moCharm(); if (hang) hang.insertBefore(b2, $('b-di')); }
    const lop = (id, html) => { const l = document.createElement('div'); l.id = id; l.className = 'lop ui'; l.innerHTML = '<div class="hop">' + html + '</div>'; $('game').appendChild(l); return l; };
    lop('l-hethong', '<h1>THE RESONANCE LATTICE</h1><p id="ht-tt"></p><div class="ht-tab" id="ht-tab"></div><div id="ht-cay"><div id="ht-ds"></div><div id="ht-ct"></div></div>' +
      '<div class="hang"><button class="chinh dong" type="button">Back to Rest Bell</button></div>' +
      '<small>Defeat enemies, find secrets and fell elites for Resonance XP. Each level grants 1 Echo Note. Movement skills come from the story, never from this lattice.</small>');
    lop('l-charm', '<h1>CHARMS</h1><p id="ch-tt"></p><div id="ch-bo"><div id="ch-ds"></div><div id="ch-ct"></div><div id="ch-lo"></div></div>' +
      '<div class="hang"><button class="chinh dong" type="button">Back to Rest Bell</button></div>');
    lop('l-chondau', '<h1>A CHARM ANSWERS</h1><p>Choose one. The other stays silent for now.</p><div class="hang" id="cd-hang"></div>');
    for (const d of document.querySelectorAll('#l-hethong .dong, #l-charm .dong')) d.onclick = () => { d.closest('.lop').classList.remove('mo'); capNhatNut(); };
    capNhatNut();
  }
  function capNhatNut(){
    const b = $('b-hethong'); if (!b || !M.ht) return;
    const n = M.ht.notCon(); b.textContent = 'Lattice · ' + n + ' ' + (n === 1 ? 'Note' : 'Notes');
    const b2 = $('b-charm'); if (b2) b2.textContent = 'Charms · ' + M.ht.oDaDung() + '/' + M.ht.oToiDa();
  }
  const CHU = {da_mo:'Learned', mo_duoc:'Learn', thieu_not:'Need Echo Notes', thieu_cap:'Requires level ', thieu_nut_truoc:'Learn the previous node first',
    thieu_dieu_kien:'Requires the Region 1 guardian to fall', thieu_thu_thach:'Requires a trial', chua_co_che:'Later region', cho_anh:'Art pending'};
  const hiemIcon = h => co(h.bieu_tuong) ? '<img class="ch-hiem" src="' + src(h.bieu_tuong) + '" alt="">' : '';   // biểu tượng độ hiếm 24×24
  const chuTT = (n, t) => CHU[t] + (t === 'thieu_cap' ? n.cap : '');
  const gdA = () => M.ht.D.giao_dien || {};
  const icon = k => { const p = (gdA().tien_te || {})[k]; return co(p) ? '<img src="' + src(p) + '" alt="" style="width:24px;height:24px;vertical-align:-6px;margin-right:3px;image-rendering:pixelated">' : ''; };
  let tabChon = null, nutChon = null;
  function moBang(){
    const ht = M.ht, D = ht.D, sau = ht.diemCapSau();
    $('ht-tt').innerHTML = 'Level <b style="color:#78e6e6">' + ht.cap() + '</b> · ' + icon('xp') + D.diem.ten + ' ' + ht.S.diem + (sau ? ' / ' + sau : ' (max)') +
      ' · ' + icon('note') + 'Notes: <b style="color:#ffe08a">' + ht.notCon() + '</b>';
    tabChon = tabChon || D.nhanh[0].id;
    const tab = $('ht-tab'); tab.innerHTML = '';
    for (const nh of D.nhanh){ const b = document.createElement('button'); b.type = 'button'; b.textContent = nh.tab; b.title = nh.ten;
      if (nh.id === tabChon) b.className = 'chon'; b.onclick = () => { tabChon = nh.id; nutChon = null; moBang(); }; tab.appendChild(b); }
    const ds = $('ht-ds'); ds.innerHTML = '<b>' + D.nhanh.find(x => x.id === tabChon).ten + '</b>';
    const nut = D.cay.filter(n => n.nhanh === tabChon);
    if (!nut.some(n => n.id === nutChon)) nutChon = nut[0] && nut[0].id;
    for (const n of nut){
      const t = ht.trangThaiNut(n.id), b = document.createElement('button'); b.type = 'button';
      b.className = (t === 'da_mo' ? 'da' : t === 'mo_duoc' ? 'duoc' : '') + (n.id === nutChon ? ' chon' : '');
      const anhNut = (gdA().nut_ky_nang || {})[t === 'da_mo' ? 'da_hoc' : t === 'mo_duoc' ? 'mo_duoc' : 'khoa'];
      b.innerHTML = (co(anhNut) ? '<img src="' + src(anhNut) + '" alt="" style="float:left;width:48px;height:48px;margin:-4px 8px 0 -4px;image-rendering:pixelated">' : '') +
        n.ten + '<small>Lv ' + n.cap + ' · ' + chuTT(n, t) + '</small>';
      b.onclick = () => { nutChon = n.id; moBang(); };
      ds.appendChild(b);
    }
    const n = D.cay.find(x => x.id === nutChon), ct = $('ht-ct');
    if (n){
      const t = ht.trangThaiNut(n.id);
      ct.innerHTML = '<b style="font-size:16px">' + n.ten + '</b><br>' + n.mo_ta + '<br>Cost: ' + n.gia + ' ' + (n.gia === 1 ? D.diem.ten_not : D.diem.ten_not_nhieu) +
        ' · Level ' + n.cap + '<br><span style="color:#a9b3bf">' + chuTT(n, t) + '</span><br>';
      if (t === 'mo_duoc'){ const b = document.createElement('button'); b.type = 'button'; b.className = 'chinh'; b.textContent = 'Learn';
        b.onclick = async () => { if (ht.moNut(n.id).ok){ ghi(); await apDung(); phatFx('halo'); V1.thongBao('Learned: ' + n.ten); } moBang(); }; ct.appendChild(b); }
      else if (t !== 'da_mo' && co(gdA().nut_khoa)){ const b = document.createElement('button'); b.type = 'button'; b.className = 'khoa'; b.disabled = true; b.textContent = 'Locked'; ct.appendChild(b); }
    } else ct.innerHTML = '';
    $('l-hethong').classList.add('mo');
  }
  /* túi Charm 3 vùng: danh sách trái · thông tin giữa · loadout phải; chọn rồi bấm Equip (không chỉ kéo thả) */
  let charmChon = null;
  const oCharm = m => '<span class="ch-o"><img src="' + src(M.ht.HIEM[m.hiem].khung) + '" alt=""><img src="' + src(M.ht.MAU[m.mau].anh) + '" alt="" style="inset:11.11%;width:77.78%;height:77.78%"></span>';   // ô 72×72, lòng lề 8 px
  function moCharm(){
    if (!M.coDo) return;
    const ht = M.ht, S = ht.S;
    $('ch-tt').innerHTML = 'Slots: <b>' + ht.oDaDung() + ' / ' + ht.oToiDa() + '</b> · ' + icon('dust') + ht.D.echo_dust.ten + ': <b>' + S.dust + '</b>';
    const ds = $('ch-ds'); ds.innerHTML = '';
    if (!S.tui.some(m => m.uid === charmChon)) charmChon = S.tui[0] && S.tui[0].uid;
    for (const m of S.tui){
      const h = ht.HIEM[m.hiem], b = document.createElement('button'); b.type = 'button'; if (m.uid === charmChon) b.className = 'chon';
      b.innerHTML = oCharm(m) + '<span>' + ht.MAU[m.mau].ten + '<small style="color:' + h.mau_chu + '">' + hiemIcon(h) + h.ten + (S.lap.includes(m.uid) ? ' · equipped' : '') + '</small></span>';
      b.onclick = () => { charmChon = m.uid; moCharm(); }; ds.appendChild(b);
    }
    if (!S.tui.length) ds.innerHTML = '<small>No Charms yet. Elites and guardians carry them.</small>';
    const m = ht.tim(charmChon), ct = $('ch-ct'); ct.innerHTML = '';
    if (m){
      const g = ht.MAU[m.mau], h = ht.HIEM[m.hiem], lap = S.lap.includes(m.uid);
      ct.innerHTML = '<b style="font-size:16px">' + g.ten + '</b> <span style="color:' + h.mau_chu + '">' + hiemIcon(h) + h.ten + '</span><br>' + g.loai + ' · ' + g.o + (g.o === 1 ? ' slot' : ' slots') +
        '<br>' + g.mo_ta + (m.dong.length ? '<br>' + m.dong.map(ht.moTaDong).join('<br>') : '') + '<br>';
      const nut = (chu, fn, chinh) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = chu; if (chinh) b.className = 'chinh'; b.onclick = fn; ct.appendChild(b); };
      if (lap) nut('Unequip', async () => { ht.go(m.uid); ghi(); await apDung(); moCharm(); capNhatNut(); });
      else nut('Equip', async () => { const r = ht.lap(m.uid); if (!r.ok) V1.thongBao(r.ly === 'het_o' ? 'Not enough slots' : r.ly === 'trung_mau' ? 'That Charm is already equipped' : 'Cannot equip'); ghi(); await apDung(); moCharm(); capNhatNut(); }, true);
      nut('Dismantle (+' + ((ht.D.echo_dust.phan_ra || {})[m.hiem] || 0) + ' Dust)', async () => { ht.phanRa(m.uid); ghi(); await apDung(); moCharm(); capNhatNut(); });
    }
    const lo = $('ch-lo'), oc = gdA().o_cam || {};   // ô cắm 40×40: trống / đã cắm theo số ô đang dùng
    lo.innerHTML = '<b>Loadout</b>' + (co(oc.trong) && co(oc.day) ? '<div class="ch-cam">' + Array.from({length:ht.oToiDa()}, (_, i) => '<img src="' + src(i < ht.oDaDung() ? oc.day : oc.trong) + '" alt="">').join('') + '</div>' : '<br>');
    for (const u of S.lap){ const x = ht.tim(u); if (!x) continue; const b = document.createElement('button'); b.type = 'button'; b.innerHTML = oCharm(x);
      b.title = ht.MAU[x.mau].ten; b.onclick = () => { charmChon = u; moCharm(); }; lo.appendChild(b); }
    $('l-charm').classList.add('mo');
  }
  function moChonDau(){
    const ht = M.ht, hang = $('cd-hang'); if (!hang || !ht.S.choChon) return;
    hang.innerHTML = '';
    for (const id of ht.S.choChon){
      const g = ht.MAU[id], b = document.createElement('button'); b.type = 'button';
      const h = ht.D.charm_dau.do_hiem;   // Charm đầu là Faded → hiện trong ô Charm Faded 72×72 (003) như trong túi
      b.innerHTML = (co(ht.HIEM[h] && ht.HIEM[h].khung) ? oCharm({mau:id, hiem:h}) : '<img src="' + src(g.anh) + '" alt="" style="width:72px;height:72px;image-rendering:pixelated">') + '<b>' + g.ten + '</b><small>' + g.mo_ta + '</small>';
      b.onclick = () => { ht.chonCharmDau(id); ghi(); $('l-chondau').classList.remove('mo'); V1.thongBao('Charm gained: ' + g.ten + ' – equip it under Charms'); capNhatNut(); };
      hang.appendChild(b);
    }
    $('l-chondau').classList.add('mo');
  }
  M.moBang = moBang; M.moCharm = moCharm; M.moChonDau = moChonDau; M.apDung = apDung; M.ghi = ghi; M.phatFx = phatFx;
  M.san = khoiDong();
})();
