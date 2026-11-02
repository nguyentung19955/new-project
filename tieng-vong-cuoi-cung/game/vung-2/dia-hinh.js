'use strict';
/* dia-hinh.js – Vùng 2 "Rotting Roots": nối LOGIC địa hình (dat-muc.js, đúng số khung kế hoạch ChatGPT) vào engine + VẼ bằng ảnh ChatGPT.
   • Gỗ Mục R / Q / P: mỗi khung đồng bộ ô va chạm của engine ('#' khi chắc, '.' khi rơi/mất) – vẽ theo trạng thái (art/vung-2/dat-muc).
   • Gai rễ X / ao bào tử B: ô đặc; chạm → mất 1 mặt nạ, bất tử 60 khung, sau 18 khung về gờ chắc gần nhất (art/vung-2/nguy-hiem).
   • Chốt rễ L: Neo Rễ giữ mở 180 khung (ảnh cổng rễ đan, mở/đóng có hoạt cảnh). Cổng C (lối tắt / niêm trùm): mở 1 lần từ phía `mo_tu`, lưu vào bản lưu.
   • Kỹ năng Neo Rễ (Root Anchor): nhận ở Đền Neo Rễ cuối R206; phím Q (hoặc G) / nút ⚓ cảm ứng; nút xám khi không có nút neo trong tầm.
   KHÔNG vẽ hình bằng code: mọi hình là ảnh ChatGPT; chỉ có ánh sáng (mở bóng tối) và chữ. Thiếu ảnh → không vẽ phần đó. */
(() => {
  const V1 = window.V1, E = DongCoMN, pl = E.pl, G = V1.G, T = 48, PX = 3;
  const A2 = '../../art/vung-2/';
  const IM = V1.IM2 = {}, FX = V1.FX2 = {};
  const napI = (k, f) => new Promise(ok => { const i = new Image(); i.onload = () => { IM[k] = i; ok(); }; i.onerror = () => { V1.LOI.push(f); ok(); }; i.src = A2 + f + '.png'; });

  V1.napDiaHinh = async function(){
    const ds = [];
    for (const loai of ['thuong', 'nhanh']) for (const b of ['trai', 'giua', 'phai']) for (let i = 0; i < 4; i++) ds.push([loai + '_' + b + i, 'dat-muc/' + loai + '/' + b + '-' + i]);
    for (const b of ['trai', 'giua', 'phai']) for (const s of ['ngu', 'nap']) ds.push(['xung_' + b + s, 'dat-muc/xung/' + b + '-' + s]);
    for (let i = 1; i <= 3; i++) ds.push(['gai' + i, 'nguy-hiem/gai-' + i]);
    for (let i = 0; i < 4; i++) ds.push(['ao' + i, 'nguy-hiem/ao-f' + i]);
    ds.push(['nut_ngu', 'neo-re/nut-ngu'], ['nut_hoat', 'neo-re/nut-hoat']);
    for (let i = 0; i < 4; i++) ds.push(['nut_chuyen' + i, 'neo-re/chuyen-f' + i]);
    for (const l of ['truoc', 'sau']){
      ds.push(['rd_dong_' + l, 'cong/re-dan/dong-' + l], ['rd_mo_' + l, 'cong/re-dan/mo-' + l]);
      for (let i = 0; i < 8; i++) ds.push(['rd_mo' + i + '_' + l, 'cong/re-dan/mo-ra-f' + i + '-' + l]);
      ds.push(['nt_dong_' + l, 'cong/niem-trum/dong-' + l], ['nt_mo_' + l, 'cong/niem-trum/mo-' + l]);
      for (let i = 0; i < 12; i++){ const n = String(i).padStart(2, '0'); ds.push(['nt_quan' + i + '_' + l, 'cong/niem-trum/quan-f' + n + '-' + l], ['nt_thao' + i + '_' + l, 'cong/niem-trum/thao-f' + n + '-' + l]); }
    }
    for (const n of ['root-anchor-san-sang', 'root-anchor-hoi-chieu', 'goi-y-nut-neo', 'dau-canh-bao-muc', 'memory-shard', 'manh-tang-hoi-mau', 'bua-giam-hoi-neo', 'warden-knot', 'verdant-ruin-core'])
      ds.push(['bt_' + n.replace(/-/g, '_'), 'bieu-tuong/' + n]);
    await Promise.all(ds.map(([k, f]) => napI(k, f)));
    for (const k of Object.keys(IM)) if (k.startsWith('bt_')) V1.IMG[k] = IM[k];   // ve.js veIcon dùng V1.IMG
    const clip = async (k, dir, n, ms, lap) => { FX[k] = await SpriteMN.napClip(A2, {thu_muc:dir, so_hinh:n, ms, lap}, k); };
    await Promise.all([clip('bui', 'dat-muc/fx/bui', 8, 60, false), clip('manh', 'dat-muc/fx/manh', 8, 50, false), clip('moc', 'dat-muc/fx/moc-lai', 8, 38, false),
      clip('xung', 'dat-muc/fx/xung-bao-tu', 6, 80, false), clip('xung_nhanh', 'dat-muc/fx/xung-nhanh', 6, 60, false),
      clip('neo_dat', 'neo-re/fx/dat', 6, 60, false), clip('neo_giu', 'neo-re/fx/giu', 6, 110, true), clip('neo_het', 'neo-re/fx/het', 6, 70, false), clip('neo_tay', 'neo-re/fx/tay', 6, 50, false),
      clip('den_tho', 'den-tho/den', 8, 130, false), clip('vat_tho', 'den-tho/vat', 8, 120, true)]);
    // memory-shard-f00..f05 nằm phẳng trong bieu-tuong/ (tiền tố "memory-shard-f")
    FX.mem = await SpriteMN.napClip(A2 + 'bieu-tuong/', {thu_muc:'.', tien_to:'memory-shard-f', so_hinh:6, ms:120}, 'mem');
  };

  // khung camera cho engine (quái chỉ ra đòn khi đã hiện trên màn) – như bao-don.js Vùng 1
  const KN = {x:0, y:0, w:960, h:540};
  V1.capNhatKhungNhin = function(){ if (!V1.CAM || !G.phong){ E.khungNhin = null; return; } KN.x = V1.CAM.x; KN.y = V1.CAM.y; E.khungNhin = KN; };

  /* ---------------- NỀN THEO PHÒNG (ChatGPT vẽ) ---------------- */
  V1.nenPhong = function(id){
    const I = V1.IMG;
    if (id === 'R213') return {bg:I.bg_trum, mid:null, suong:null};
    const vuon = ['R206', 'R209', 'RS202'].includes(id), ho = ['R209', 'R210'].includes(id);
    return {bg:vuon ? I.bg_vuon : I.bg_hang, mid:ho ? I.mid_ho : I.mid_vom, suong:(id.charCodeAt(3) & 1) ? I.suong1 : I.suong2};
  };
  V1.vpAn = v => v.loai === 'nut_warden' && !G.luu.tinhAnhHa.includes(G.id);   // Warden Knot chỉ hiện sau khi hạ tinh anh

  /* ---------------- TRẠNG THÁI PHÒNG ---------------- */
  const DH = V1.DH = {dm:null, dong:[], nguy:[], chot:[], cong:[], fx:[], chanThem:[], anToan:null, veAnToan:0, tho:null, thoT:-1, neoFx:null};
  const laDong = ch => 'RQPLC'.includes(ch);
  V1.dhVaoPhong = function(p){
    DH.dm = window.DatMuc ? DatMuc.tao(p, {}) : null;
    DH.dong = []; DH.nguy = []; DH.fx = []; DH.chanThem = []; DH.veAnToan = 0; DH.anToan = null;
    const L = p.luoi;
    for (let r = 0; r < L.length; r++) for (let c = 0; c < L[r].length; c++){
      const ch = L[r][c];
      if (laDong(ch)) DH.dong.push([c, r, ch]);
      if (ch === 'X' || ch === 'B'){ DH.nguy.push([c, r, ch]); E.BD.L[r][c] = '#'; }
    }
    // chốt rễ L: gom cột liền → 1 nhóm (hình cổng đứng 2×3 ô)
    DH.chot = []; const daL = new Set();
    for (const [c, r, ch] of DH.dong) if (ch === 'L' && !daL.has(c + ',' + r)){
      const o = []; let rr = r; while (L[rr] && L[rr][c] === 'L'){ o.push([c, rr]); daL.add(c + ',' + rr); rr++; }
      DH.chot.push({o, mo:false, t:99});
    }
    DH.cong = (p.cong || []).map(g => ({id:g.id, o:g.o, mo_tu:g.mo_tu, loai:g.mo_tu === 'trum' ? 'niem' : 're_dan', mo:false, t:99,
      ngang:g.o.length > 1 && g.o[0][1] === g.o[1][1]}));
    if (DH.dm) DH.dm.datLai(G.luu.congMo || []);
    for (const g of DH.cong){ g.mo = (G.luu.congMo || []).includes(g.id); if (g.mo_tu === 'trum' && G.luu.trumHa){ g.mo = true; DH.dm && DH.dm.moCong(g.id); } }
    DH.tho = p.ky_nang || null; DH.thoT = G.luu.neoRe ? 999 : -1;
    dongBo();
  };
  V1.dhDatLai = function(){ if (DH.dm){ DH.dm.datLai(G.luu.congMo || []); DH.fx.length = 0; dongBo(); } };
  V1.dhKichHoat = cells => { DH.chanThem.push(...cells); };   // trùm / tinh anh kích hoạt cụm gỗ mục

  const hopNV = () => ({x:pl.x, y:pl.y, w:pl.w, h:pl.h});
  const chong = (h, c, r) => h.x < (c + 1) * T && h.x + h.w > c * T && h.y < (r + 1) * T && h.y + h.h > r * T;
  function dongBo(){
    const dm = DH.dm; if (!dm) return;
    const h = hopNV();
    for (const [c, r] of DH.dong){
      const d = dm.dac(c, r); if (d === null) continue;
      const cu = E.BD.L[r][c];
      if (d && cu !== '#' && chong(h, c, r) && !pl.dead) continue;   // không đóng ô lên người đang đứng trong
      E.BD.L[r][c] = d ? '#' : '.';
    }
  }

  /* ---------------- MỖI BƯỚC 60 Hz ---------------- */
  V1.dhBuoc = function(){
    const dm = DH.dm; if (!dm || !G.phong) return;
    const chan = DH.chanThem.splice(0);
    if (pl.onGround && !pl.dead){
      const r = Math.floor((pl.y + pl.h + 1) / T);
      for (let c = Math.floor(pl.x / T); c <= Math.floor((pl.x + pl.w - 1) / T); c++) chan.push([c, r]);
    }
    dm.buoc({chan, hop:hopNV()});
    for (const e of dm.suKien){
      const x = e.c * T + T / 2, y = e.r * T;
      if (e.loai === 'bui') DH.fx.push({k:'bui', x, y:y + T, t:0});
      else if (e.loai === 'roi') DH.fx.push({k:'manh', x, y:y + T, t:0});
      else if (e.loai === 'moc') DH.fx.push({k:'moc', x, y:y + T, t:0});
      else if (e.loai === 'xung_bao_tu') DH.fx.push({k:'xung', x, y:y + T, t:0});
      else if (e.loai === 'neo_het'){ DH.fx.push({k:'neo_het', x, y:y + T / 2 + 24, t:0}); V1.thongBao('The anchor loosens'); }
    }
    dongBo();
    // chốt rễ: theo dõi mở / đóng để chạy hoạt cảnh
    for (const k of DH.chot){ const mo = dm.dac(k.o[0][0], k.o[0][1]) === false; if (mo !== k.mo){ k.mo = mo; k.t = 0; } else k.t++; }
    for (const g of DH.cong) g.t++;
    kiemCong(); kiemNguy(); kiemTho(); kiemNeo();
    for (let i = DH.fx.length - 1; i >= 0; i--){ const f = DH.fx[i]; f.t++; const C = FX[f.k]; if (!C || f.t > (C.tong || 60) + 2) DH.fx.splice(i, 1); }
  };

  /* ---------------- CỔNG RỄ (lối tắt) ---------------- */
  function kiemCong(){
    const cx = pl.x + pl.w / 2, cy = pl.y + pl.h / 2;
    for (const g of DH.cong){
      if (g.mo) continue;
      let duoc = false;
      if (g.mo_tu === 'trum') duoc = G.luu.trumHa;
      else if (!pl.dead){
        const xs = g.o.map(o => o[0]), ys = g.o.map(o => o[1]);
        const x0 = Math.min(...xs) * T, x1 = (Math.max(...xs) + 1) * T, y0 = Math.min(...ys) * T, y1 = (Math.max(...ys) + 1) * T;
        const ngangGan = cy > y0 - T && cy < y1 + T, docGan = cx > x0 - T && cx < x1 + T;
        if (g.mo_tu === 'phai') duoc = ngangGan && cx > x1 && cx < x1 + 3 * T;
        else if (g.mo_tu === 'trai') duoc = ngangGan && cx < x0 && cx > x0 - 3 * T;
        else if (g.mo_tu === 'duoi') duoc = docGan && pl.y > y1 - 4 && pl.y < y1 + 4 * T;
        else if (g.mo_tu === 'tren') duoc = docGan && pl.y + pl.h < y0 + 4 && pl.y + pl.h > y0 - 3 * T;
      }
      if (!duoc) continue;
      g.mo = true; g.t = 0; DH.dm.moCong(g.id);
      if (!(G.luu.congMo || (G.luu.congMo = [])).includes(g.id)) G.luu.congMo.push(g.id);
      V1.ghiLuu(); dongBo();
      if (g.mo_tu !== 'trum') V1.thongBao('The braided roots unwind – a shortcut opens');
      E.S.sht = 8; E.S.shm = 1.5; E.S.shx = 1; E.S.shy = 0.5;
    }
  }

  /* ---------------- GAI / AO: mất 1 mặt nạ, về gờ chắc ---------------- */
  function oChac(c, r){ const ch = E.tile(c, r); if (ch !== '#' && ch !== '=') return false;
    return !DH.dong.some(o => o[0] === c && o[1] === r) && !DH.nguy.some(o => Math.abs(o[0] - c) <= 1 && o[1] === r); }
  function kiemNguy(){
    if (pl.dead) return;
    if (pl.onGround){   // ghi gờ chắc gần nhất (chân đặt trên ô tĩnh, xa gai/ao)
      const r = Math.floor((pl.y + pl.h + 1) / T), c0 = Math.floor(pl.x / T), c1 = Math.floor((pl.x + pl.w - 1) / T);
      if (oChac(c0, r) && oChac(c1, r) && !DH.veAnToan) DH.anToan = {x:pl.x + pl.w / 2, y:pl.y + pl.h};
    }
    if (DH.veAnToan > 0){ if (--DH.veAnToan === 0 && DH.anToan){ V1.datNV(DH.anToan.x, DH.anToan.y); pl.vx = 0; pl.vy = 0; } return; }
    const h = {x:pl.x - 2, y:pl.y, w:pl.w + 4, h:pl.h + 3};
    for (const [c, r] of DH.nguy) if (chong(h, c, r)){
      if (pl.iframes > 0) return;
      E.hurt(0, 1); pl.iframes = Math.max(pl.iframes, 60); pl.nhay = Math.max(pl.nhay, 60);
      if (!pl.dead) DH.veAnToan = 18;
      return;
    }
  }

  /* ---------------- ĐỀN NEO RỄ (R206) ---------------- */
  function kiemTho(){
    const t = DH.tho; if (!t) return;
    if (DH.thoT >= 0 && DH.thoT < 999) DH.thoT++;
    if (G.luu.neoRe || pl.dead) return;
    const x = t.cot * T + T / 2, y = V1.chanO(t.cot, t.hang);
    if (Math.abs(pl.x + pl.w / 2 - x) < 60 && Math.abs(pl.y + pl.h - y) < 80){
      G.luu.neoRe = true; DH.thoT = 0; V1.ghiLuu();
      V1.thongBao('Root Anchor learned – press Q (or the anchor button) near a bronze root node to hold rotwood and root latches');
      G.tbT = 360; E.S.loe = 10; E.S.loeMau = '#E1B85A';
    }
  }

  /* ---------------- NEO RỄ ---------------- */
  const nguoi = () => ({x:pl.x + pl.w / 2, y:pl.y + pl.h * 0.45, huong:pl.face});
  V1.neoSan = () => !!(G.luu && G.luu.neoRe && DH.dm && !DH.dm.neo && DH.dm.hoiChieu <= 0 && DH.dm.coNutGan(nguoi()));
  function kiemNeo(){
    const dm = DH.dm;
    if (!G.luu.neoRe || pl.dead || !V1.bam('n')) return;
    const kq = dm.datNeo(nguoi());
    if (kq.ok){
      if (G.luu.kho.bua_neo_re) dm.hoiChieu = Math.round(dm.hoiChieu * 0.9);
      const n = kq.neo.nut; DH.neoFx = {t:0}; DH.fx.push({k:'neo_dat', x:n.cot * T + T / 2, y:n.hang * T + T / 2 + 24, t:0});
      DH.fx.push({k:'neo_tay', x:pl.x + pl.w / 2 + pl.face * 18, y:pl.y + pl.h * 0.5 + 16, t:0});
      if (navigator.vibrate) try { navigator.vibrate(15); } catch (e){}
    } else if (kq.ly_do === 'khong_co_nut') V1.thongBao('No root node in reach – face a bronze node within 3 tiles');
    else if (kq.ly_do === 'hoi_chieu') V1.thongBao('Root Anchor recharging…');
  }

  /* ---------------- VẼ (thế giới, ctx đã dời camera) ---------------- */
  function anh(c, im, x, y, k, a, lat){ if (!im) return; const w = im.width * k, h = im.height * k;
    c.save(); c.imageSmoothingEnabled = false; if (a !== undefined) c.globalAlpha = Math.max(0, Math.min(1, a));
    if (lat){ c.translate(Math.round(x + w), Math.round(y)); c.scale(-1, 1); c.drawImage(im, 0, 0, w, h); } else c.drawImage(im, Math.round(x), Math.round(y), w, h);
    c.restore(); }
  V1.veAnh2 = anh;
  function bien(c, r, ch){ const L = G.phong.luoi, tr = L[r][c - 1] === ch, ph = L[r][c + 1] === ch; return tr && ph ? 'giua' : !tr && ph ? 'trai' : tr && !ph ? 'phai' : 'giua'; }
  function veClip(c, C, t, x, y, s, a, lat){ if (!C || !C.ok) return; SpriteMN.ve(c, C, SpriteMN.khungTheoBuoc(C, t), x, y, !!lat, s || PX, a); }

  V1.veDiaHinh = function(c){
    const dm = DH.dm; if (!dm || !G.phong) return;
    const f = E.S.frame, pha = dm.phaXung();
    // gỗ mục
    for (const [cc, r, ch] of DH.dong){
      if (ch !== 'R' && ch !== 'Q' && ch !== 'P') continue;
      const s = dm.trangThai(cc, r); if (!s) continue;
      const b = bien(cc, r, ch), X = cc * T, Y = r * T;
      if (s.tt === 'MAT' || s.tt === 'MOC') continue;
      let im;
      if (ch === 'P' && s.tt === 'CHAC') im = IM['xung_' + b + (pha === 'NGU' ? 'ngu' : 'nap')];
      else im = IM[(ch === 'Q' ? 'nhanh_' : 'thuong_') + b + (s.tt === 'CHAC' ? 0 : s.tt === 'ROI' ? 3 : s.buoc_nut)];
      let dy = 0, a;
      if (s.tt === 'ROI'){ const cum = dm.cum.find(k => k.o.some(o => o.c === cc && o.r === r)); const t = cum ? cum.t : 0; dy = t * t * 0.5; a = 1 - t / 12; }
      const rung = s.tt === 'CANH_BAO' && !s.dongBang && s.buoc_nut >= 3 ? ((f >> 1) & 1) * 2 - 1 : 0;
      anh(c, im, X + rung, Y + dy, PX, a);
    }
    // anchor đang giữ cụm: dải rễ đồng (ChatGPT)
    if (dm.neo) for (const k of dm.neo.cum){
      const xs = k.o.map(o => o.c), cx = (Math.min(...xs) + Math.max(...xs) + 1) / 2 * T, y = k.o[0].r * T + 12;
      const C = FX.neo_giu; if (C && C.ok) for (let i = 0; i < k.o.length; i += 1) SpriteMN.ve(c, C, SpriteMN.khungTheoBuoc(C, f), (k.o[i].c + 0.5) * T, y, false, 1.6);
    }
    // gai / ao
    for (const [cc, r, ch] of DH.nguy){
      const im = ch === 'X' ? IM['gai' + (1 + (cc % 3))] : IM['ao' + ((f / 7.2 | 0) % 4)];
      anh(c, im, cc * T, r * T, PX);
    }
    // chốt rễ + cổng: lớp sau
    for (const k of DH.chot) veCong(c, 're_dan', k.o, k.mo, k.t, 'sau', false);
    for (const g of DH.cong) veCong(c, g.loai, g.o, g.mo, g.t, 'sau', g.ngang);
    if (DH.neoFx) DH.neoFx.t++;
    // đền Neo Rễ
    if (DH.tho){
      const x = DH.tho.cot * T + T / 2, y = V1.chanO(DH.tho.cot, DH.tho.hang), C = FX.den_tho;
      if (C && C.ok) SpriteMN.ve(c, C, G.luu.neoRe ? (DH.thoT >= 999 ? C.hinh.length - 1 : SpriteMN.khungTheoBuoc(C, DH.thoT)) : 0, x, y + 6, false, 2);
      if (!G.luu.neoRe) veClip(c, FX.vat_tho, f, x, y - 112 + Math.sin(f / 18) * 4, 2);
    }
    // hiệu ứng địa hình
    for (const e of DH.fx){ const C = FX[e.k]; if (C && C.ok) SpriteMN.ve(c, C, SpriteMN.khungTheoBuoc(C, e.t), e.x, e.y, false, e.k.startsWith('neo') ? 2 : PX); }
  };
  // nút neo vẽ SAU lớp bóng tối (luôn đọc được) – ve.js gọi V1.veSauToi
  V1.veSauToi = function(c){
    const dm = DH.dm; if (!dm || !G.phong) return; const f = E.S.frame;
    // nút neo
    for (const n of dm.nutNeo){
      const x = n.cot * T + T / 2, y = n.hang * T + T / 2, dang = dm.neo && dm.neo.nut.id === n.id;
      let im = IM.nut_ngu;
      if (dang){ const t = DH.neoFx ? DH.neoFx.t : 99; im = t < 20 ? IM['nut_chuyen' + Math.min(3, t / 5 | 0)] : IM.nut_hoat; }
      if (im) anh(c, im, x - im.width, y - im.height, 2);   // 48×48 điểm ảnh ×2 = 2 ô
      if (G.luu.neoRe && !dm.neo && dm.hoiChieu <= 0 && dm.coNutGan(nguoi()) && IM.bt_goi_y_nut_neo){   // gợi ý: nút trong tầm
        const g = IM.bt_goi_y_nut_neo; anh(c, g, x - g.width, y - 64 + Math.sin(f / 10) * 3, 2);
      }
    }
  };
  V1.veDiaHinhTruoc = function(c){
    if (!DH.dm) return;
    for (const k of DH.chot) veCong(c, 're_dan', k.o, k.mo, k.t, 'truoc', false);
    for (const g of DH.cong) veCong(c, g.loai, g.o, g.mo, g.t, 'truoc', g.ngang);
    // cửa phòng trùm bị niêm khi đánh: rễ sống quấn kín (ChatGPT, niem-trum "quan")
    if (G.dongCua && G.trum && G.phong) for (const d of G.phong.cua){
      const o = V1.odCua(d); for (const l of ['sau', 'truoc']) veCong(c, 'niem_dong', o, false, G.dongT || 0, l, d.huong === 'tren' || d.huong === 'duoi');
    }
  };
  // cổng 32×48 điểm ảnh (2×3 ô) – neo giữa nhóm ô; ngang = xoay 90°
  function veCong(c, loai, o, mo, t, lop, ngang){
    let im;
    if (loai === 're_dan'){
      const k = Math.floor(t / 6);   // 8 khung × 100 ms
      im = mo ? (k < 8 ? IM['rd_mo' + k + '_' + lop] : IM['rd_mo_' + lop]) : (k < 8 ? IM['rd_mo' + (7 - k) + '_' + lop] : IM['rd_dong_' + lop]);
      if (!mo && t >= 99 && t < 107) im = IM['rd_dong_' + lop];
    } else if (loai === 'niem'){
      const k = Math.floor(t / 6); im = mo ? (k < 12 ? IM['nt_thao' + k + '_' + lop] : IM['nt_mo_' + lop]) : IM['nt_dong_' + lop];
    } else {   // niem_dong: quấn lại khi bắt đầu đánh trùm
      const k = Math.floor(t / 6); im = k < 12 ? IM['nt_quan' + k + '_' + lop] : IM['nt_dong_' + lop];
    }
    if (!im) return;
    const xs = o.map(a => a[0]), ys = o.map(a => a[1]);
    const cx = (Math.min(...xs) + Math.max(...xs) + 1) / 2 * T, cy = (Math.min(...ys) + Math.max(...ys) + 1) / 2 * T;
    const w = im.width * PX, h = im.height * PX;
    c.save(); c.imageSmoothingEnabled = false; c.translate(Math.round(cx), Math.round(cy)); if (ngang) c.rotate(Math.PI / 2);
    c.drawImage(im, -w / 2, -h / 2, w, h); c.restore();
  }

  /* ---------------- ÁNH SÁNG + HUD ---------------- */
  V1.denThem = function(){
    const ds = [], dm = DH.dm; if (!dm) return ds;
    if (DH.tho) ds.push([DH.tho.cot * T + T / 2, V1.chanO(DH.tho.cot, DH.tho.hang) - 70, 70, 0.8]);
    for (const n of dm.nutNeo) ds.push([n.cot * T + T / 2, n.hang * T + T / 2, dm.neo && dm.neo.nut.id === n.id ? 50 : 30, 0.6]);
    for (const [c, r, ch] of DH.nguy) if (ch === 'B' && c % 2 === 0) ds.push([c * T + T / 2, r * T + 10, 26, 0.45]);
    for (const k of DH.chot) ds.push([k.o[0][0] * T + T / 2, (k.o[0][1] + 1.5) * T, 34, 0.5]);
    for (const g of DH.cong) ds.push([(g.o[0][0] + 0.5) * T, (g.o[0][1] + 1) * T, 34, 0.5]);
    for (const [c, r, ch] of DH.dong) if ('RQP'.includes(ch) && c % 2 === 0){ const s = dm.trangThai(c, r); if (s && s.tt !== 'MAT') ds.push([c * T + T / 2, r * T + 8, 24, s.tt === 'CANH_BAO' ? 0.55 : 0.32]); }
    if (V1.denQuai2) ds.push(...V1.denQuai2());
    return ds;
  };
  V1.veHangNeo = function(X0, y){
    if (!G.luu || !G.luu.neoRe) return;
    const dm = DH.dm, cd = dm ? dm.hoiChieu : 0, san = cd <= 0 && !(dm && dm.neo);
    const im = san ? IM.bt_root_anchor_san_sang : IM.bt_root_anchor_hoi_chieu; if (!im) return;
    const ctx = document.getElementById('cv').getContext('2d');
    ctx.save(); ctx.imageSmoothingEnabled = false; ctx.globalAlpha = san ? 1 : 0.7; ctx.drawImage(im, X0, y - 14, 28, 28); ctx.restore();
    V1.chu(dm && dm.neo ? 'Anchored ' + Math.ceil(dm.neo.con / 60) + 's' : cd > 0 ? 'Anchor ' + Math.ceil(cd / 60) + 's' : 'Anchor ready (Q)', X0 + 36, y + 6, 16, san ? '#ffe08a' : '#c9b48a', 'left');
  };
  // nút cảm ứng ⚓: mờ khi không dùng được
  V1.veHUDThem = function(){
    const b = document.getElementById('b-n'); if (!b) return;
    const co = !!(G.luu && G.luu.neoRe);
    if (b._co !== co){ b._co = co; b.style.display = co ? '' : 'none'; }
    const san = co && V1.neoSan();
    if (b._san !== san){ b._san = san; b.style.opacity = san ? '0.95' : '0.35';
      const ic = b.querySelector('img'); if (ic) ic.src = A2 + 'bieu-tuong/' + (DH.dm && DH.dm.hoiChieu > 0 ? 'root-anchor-hoi-chieu' : 'root-anchor-san-sang') + '.png'; }
  };
})();
