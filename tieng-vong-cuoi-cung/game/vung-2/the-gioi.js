'use strict';
/* the-gioi.js – Vùng 2 "Rotting Roots" (chép khung Vùng 1; địa hình động + Neo Rễ ở dia-hinh.js): bản đồ nhiều phòng, cửa + chuyển cảnh, vật phẩm, Mảnh Âm, Chuông Lưu, chết/túi rơi, lưu/tải, tinh anh.
   Định dạng phòng: DINH-DANG-PHONG.md. Không vẽ (xem ve.js). */
(() => {
  const V1 = window.V1, E = DongCoMN, pl = E.pl, T = 48;
  const KHOA_LUU = 'tvcc-vung2', PHIEN_BAN_LUU = 1;
  const GIA_MAU = 80;            // nâng cấp +1 máu tối đa tại Chuông Lưu (Mảnh Âm)
  const MAU_GOC = 6, HOI_GOC = 2;
  const G = V1.G = {
    bd:null, thuMuc:'phong/', cache:{}, phong:null, id:'', luu:null,
    trang:'menu',               // menu | choi | ban_do | chuong | het
    chuyen:null,                // {pha:'toi'|'sang', t, sau:fn}
    daHa:{},                    // {phong: {chỉ số quái: true}} – quái đã hạ (tới lần nghỉ Chuông / chết)
    roi:[],                     // Mảnh Âm rơi ra (bay về nhân vật)
    vatRoi:[],                  // vật phẩm rơi từ tinh anh (lõi…)
    nguy:[],                    // sóng đất, mặt nạ rơi, vòng sóng (trum.js)
    cuaKhoa:[], moCong:null, dongCua:false, tinhAnh:null, trum:null, khoaCuaT:0,
    ganChuong:false, tb:'', tbT:0, banner:'', bannerT:0, coThoat:0
  };

  /* ---------------- LƯU / TẢI (localStorage, có số phiên bản, bọc try/catch) ---------------- */
  function luuMoi(){
    return {phien_ban:PHIEN_BAN_LUU, chuong:null, phong:null, manh:0, manhGui:0, maxHp:MAU_GOC, hoiMax:HOI_GOC, nangMau:0,
      daNhat:[], daVao:[], tuongVo:[], tinhAnhHa:[], trumHa:false, hetXem:false, tui:null, kho:{chuong_vo:0, the_ten:0, loi_vong_tan:0, manh_ky_uc:0, manh_hoi:0, bua_neo_re:0, nut_warden:0, verdant_ruin_core:0}, congMo:[], neoRe:false, nvA:false, chet:0, giay:0};
  }
  function docLuu(){
    try {
      const s = localStorage.getItem(KHOA_LUU); if (!s) return null;
      const d = JSON.parse(s);
      if (!d || d.phien_ban !== PHIEN_BAN_LUU) return null;
      if (d.trumHa && d.hetXem === undefined) d.hetXem = true;   // bản lưu cũ (trước luồng F) đã thắng trùm: không hiện lại màn thắng
      return Object.assign(luuMoi(), d, {kho:Object.assign(luuMoi().kho, d.kho || {})});
    } catch (e){ return null; }
  }
  function ghiLuu(){
    try { localStorage.setItem(KHOA_LUU, JSON.stringify(G.luu)); if (window.LuuMay) LuuMay.daGhi(KHOA_LUU); return true; } catch (e){ return false; }   // (firebase) báo lưu mây gửi sớm
  }
  function xoaLuu(){ try { localStorage.removeItem(KHOA_LUU); } catch (e){} }
  V1.coLuu = () => !!docLuu();
  V1.ghiLuu = ghiLuu;

  /* ---------------- NẠP BẢN ĐỒ + PHÒNG ---------------- */
  async function layJson(url){ const r = await fetch(url + '?v=' + Date.now(), {cache:'no-store'}); if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); }
  V1.napBanDo = async function(ep){
    // ưu tiên phòng thật của luồng B (ban-do.json + phong/); chưa có thì dùng phòng thử
    if (ep !== 'thu'){
      try { G.bd = await layJson('ban-do.json'); G.thuMuc = 'phong/'; await layPhong(G.bd.phong_dau || G.bd.phong[0].id); }
      catch (e){ G.bd = null; }
    }
    if (!G.bd){ G.bd = await layJson('phong-thu/ban-do.json'); G.thuMuc = 'phong-thu/'; }
    // nạp sẵn mọi phòng (nhỏ) cho bản đồ + chuyển phòng nhanh; phòng lỗi thì bỏ qua
    await Promise.all(G.bd.phong.map(p => layPhong(p.id).catch(e => V1.LOI.push('room ' + p.id + ': ' + e.message))));
    // ảnh cảnh nướng sẵn cho từng phòng (thiếu thì vẽ ô bằng code)
    if (V1.napCanhPhong) await Promise.all(G.bd.phong.map(p => V1.napCanhPhong(p.id)));
  };
  async function layPhong(id){
    if (G.cache[id]) return G.cache[id];
    let p;
    try { p = await layJson(G.thuMuc + id + '.json'); }
    catch (e){ p = await layJson((G.thuMuc === 'phong/' ? 'phong-thu/' : 'phong/') + id + '.json'); }
    // chuẩn hoá: mọi hàng cùng độ dài
    const w = Math.max(...p.luoi.map(r => r.length));
    p.luoi = p.luoi.map(r => r.padEnd(w, '.'));
    p.cua = p.cua || []; p.quai = p.quai || []; p.vat_pham = p.vat_pham || []; p.den = p.den || [];
    G.cache[id] = p; return p;
  }
  V1.layPhong = layPhong;

  // chân đứng (px) của một ô: ô đặc → mặt trên ô đó (cách phòng demo), ô trống → đáy ô
  function chanO(cot, hang){
    const ch = E.tile(cot, hang);
    return (ch === '#' || ch === 'N' || ch === '=') ? hang * T : (hang + 1) * T;
  }
  V1.chanO = chanO;
  const odCua = c => {   // các ô của lỗ cửa
    const o = [], n = c.cao || 3;
    for (let i = 0; i < n; i++) o.push(c.huong === 'tren' || c.huong === 'duoi' ? [c.cot + i, c.hang] : [c.cot, c.hang + i]);
    return o;
  };
  V1.odCua = odCua;
  // ô bịt khi cửa KHOÁ (can chuong_vo…): ô lỗ cửa + 1 cột ô trống ngay phía trong (cửa ngang trái/phải) – để người chơi dừng
  // trước song rễ của hình cửa khoá (hình rộng ~3 ô, chân trên sàn), không đứng lọt vào trong hình.
  const odKhoa = c => {
    const o = odCua(c); if (c.huong !== 'trai' && c.huong !== 'phai') return o;
    const dx = c.huong === 'phai' ? -1 : 1, L0 = G.phong ? G.phong.luoi : null;
    return o.concat(odCua(c).map(([x, y]) => [x + dx, y]).filter(([x, y]) => L0 && L0[y] && L0[y][x] === '.'));
  };
  V1.odKhoa = odKhoa;

  function demKho(can){ return G.luu.kho[can] || 0; }
  // cổng rễ: khoá tới khi đã MỞ (gắn lõi + rễ co lên xong); đủ điều kiện = đủ k.so vật k.can (+ lõi k.loi nếu có)
  function cuaBiKhoa(p, c){ const k = p.khoa; return !!(k && k.cua === c.id && !(G.luu.congMo || []).includes(c.id) && (k.loi || demKho(k.can) < (k.so || 1))); }
  function duMoCong(k){ return demKho(k.can) >= (k.so || 1) && (!k.loi || demKho(k.loi) >= 1); }
  const MO_CONG_T = 160;   // ~2,7 s: gắn lõi → rễ rung → co lên nóc
  V1.MO_CONG_T = MO_CONG_T;

  /* ---------------- VÀO PHÒNG ---------------- */
  function vaoPhong(p, cuaId, viTri){
    G.phong = p; G.id = p.id;
    const L = p.luoi.map(r => r.split(''));
    for (const k of G.luu.tuongVo){ const [id, c, r] = k.split(':'); if (id === p.id && L[+r]) L[+r][+c] = '.'; }
    E.napBanDo(L.map(r => r.join('')));
    if (V1.dhVaoPhong) V1.dhVaoPhong(p);   // Vùng 2: gỗ mục / gai / ao / chốt rễ / cổng rễ (dia-hinh.js)
    // cửa khoá: bịt bằng ô đặc
    G.cuaKhoa = p.cua.filter(c => cuaBiKhoa(p, c));
    for (const c of G.cuaKhoa) for (const [x, y] of odKhoa(c)) if (E.BD.L[y]) E.BD.L[y][x] = '#';
    G.moCong = null; G.dongCua = false; G.tinhAnh = null; G.trum = null; G.roi.length = 0; G.vatRoi.length = 0; G.nguy.length = 0;
    // quái
    E.QUAI.length = 0;
    const ha = G.daHa[p.id] || {};
    p.quai.forEach((v, i) => {
      const d = V1.QJ.loai[v.loai]; if (!d){ V1.LOI.push(p.id + ': no enemy type ' + v.loai); return; }
      const laTA = p.tinh_anh && (v.loai === 'warden' || d.tinh_anh || v.tinh_anh);
      if (laTA && G.luu.tinhAnhHa.includes(p.id)) return;
      if (ha[i] && !laTA) return;
      const q = E.taoQuai(d, Object.assign({}, v, {cao:caoBay(d, v)}), chanQuai(d, v));
      q.idx = i; q.laTinhAnh = laTA; E.QUAI.push(q);
      if (laTA) G.tinhAnh = q;
    });
    if (p.trum && !G.luu.trumHa && V1.taoTrum){ G.trum = V1.taoTrum(p); E.QUAI.push(G.trum); }
    // đặt nhân vật
    const c = cuaId && p.cua.find(x => x.id === cuaId);
    if (viTri){ datNV(viTri.x, viTri.y); }
    else if (c){
      const o = odCua(c), n = o.length;
      if (c.huong === 'trai'){ datNV((c.cot + 1) * T + T / 2, (c.hang + n) * T); pl.face = 1; }
      else if (c.huong === 'phai'){ datNV(c.cot * T - T / 2 + 6, (c.hang + n) * T); pl.face = -1; }
      else if (c.huong === 'tren'){ datNV((c.cot + n / 2) * T, (c.hang + 1) * T + pl.h + 4); pl.vy = 2; }
      else { datNV((c.cot + n / 2) * T, (c.hang + 1) * T - 4); pl.vy = -E.jumpVel * 1.15; pl.onGround = false; }
      // không đứng lọt trong tường
      for (let k = 0; k < 6 && E.collide(pl.x, pl.y, pl.w, pl.h); k++) pl.y -= T / 2;
    } else if (p.chuong_luu && !p.bat_dau){ datNV(p.chuong_luu.cot * T + T / 2 + 40, chanO(p.chuong_luu.cot, p.chuong_luu.hang)); }
    else { const b = p.bat_dau || {cot:2, hang:p.luoi.length - 2}; datNV(b.cot * T + T / 2, chanO(b.cot, b.hang)); }
    G.khoaCuaT = 40;
    if (!G.luu.daVao.includes(p.id)) G.luu.daVao.push(p.id);
    G.luu.phong = p.id;
    G.banner = p.ten || p.id; G.bannerT = 150;
    if (V1.veNenPhong) V1.veNenPhong();
    if (V1.camDat) V1.camDat();
    if (V1.capNhatKhungNhin) V1.capNhatKhungNhin();   // LUỒNG D: khung camera cho engine (quái không bắn ngoài màn hình)
  }
  function caoBay(d, v){
    if (!d.bay) return v.cao;
    if (d.treo) return 0;
    if (v.cao === undefined) return 120;
    return v.cao <= 12 ? v.cao * T : v.cao;   // ≤12 hiểu là số ô, lớn hơn là px
  }
  function chanQuai(d, v){
    if (d.treo){   // treo dưới trần gần nhất phía trên
      let r = v.hang; while (r > 0 && !E.solidPt(v.cot * T + T / 2, (r - 1) * T + 2)) r--;
      return r * T + d.than[1] * E.TL;
    }
    return chanO(v.cot, v.hang);
  }
  function datNV(x, chanY){
    const hp = pl.hp, luot = pl.luotHoi;
    E.datNV(x, chanY);
    pl.hp = hp > 0 ? hp : E.P.maxHp; pl.luotHoi = luot; pl.daBaoChet = false;
  }

  /* ---------------- BẮT ĐẦU / TIẾP TỤC ---------------- */
  V1.batDau = async function(moi, phongThu){
    G.luu = (!moi && docLuu()) || luuMoi();
    if (moi) xoaLuu();
    apDungChiSo(true);
    let id = G.luu.chuong ? G.luu.chuong.phong : (G.bd.phong_dau || G.bd.phong[0].id), cua = null;
    if (phongThu) id = phongThu;
    else if (!G.luu.chuong && G.bd.cua_dau) cua = G.bd.cua_dau;
    const p = await layPhong(id);
    vaoPhong(p, cua, null);
    if (G.luu.chuong && G.luu.chuong.phong === id && !phongThu) datNV(G.luu.chuong.cot * T + T / 2 + 40, chanO(G.luu.chuong.cot, G.luu.chuong.hang));
    G.trang = 'choi';
    ghiLuu();
    if (window.LuuChung) LuuChung.vaoVung('vung-2');   // (cottruyen) lưu chung: đánh dấu đã vào Vùng 2
    if (G.luu.trumHa && !G.luu.hetXem && V1.thangTrum) V1.thangTrum();   // (luồng F) tải lại lúc trùm đang gục: vẫn hiện màn thắng
  };
  function apDungChiSo(day){
    E.P.maxHp = G.luu.maxHp; E.P.cheDoHoi = 'luot'; E.P.hoiLuong = 2; E.P.tuHoiSinh = false; E.P.quaiHoiSinh = false;
    if (day){ pl.hp = E.P.maxHp; pl.luotHoi = G.luu.hoiMax; }
  }

  /* ---------------- CHUYỂN CẢNH (màn tối) ---------------- */
  function chuyenCanh(sau){ if (G.chuyen) return; G.chuyen = {pha:'toi', t:0, sau}; }
  V1.chuyenCanh = chuyenCanh;
  V1.buocChuyen = function(){
    const c = G.chuyen; if (!c) return 0;
    c.t++;
    if (c.pha === 'toi' && c.t >= 14){ c.pha = 'cho'; c.t = 0; Promise.resolve(c.sau()).then(() => { c.pha = 'sang'; c.t = 0; }).catch(e => { console.error(e); thongBao('Room load error: ' + e.message); c.pha = 'sang'; c.t = 0; }); }
    if (c.pha === 'sang' && c.t >= 16){ G.chuyen = null; return 0; }
    return c.pha === 'toi' ? c.t / 14 : c.pha === 'cho' ? 1 : 1 - c.t / 16;
  };

  /* ---------------- CỬA ---------------- */
  function kiemCua(){
    if (G.khoaCuaT > 0){ G.khoaCuaT--; return; }
    if (pl.dead || G.chuyen) return;
    const p = G.phong, W = E.BD.COT * T, H = E.BD.HANG * T, cx = pl.x + pl.w / 2, cy = pl.y + pl.h / 2;
    for (const c of p.cua){
      const o = odCua(c), n = o.length;
      const khoa = G.cuaKhoa.includes(c) || G.dongCua;
      let cham = false;
      if (c.huong === 'phai') cham = pl.x + pl.w >= W - 3 && pl.y + pl.h > c.hang * T && pl.y < (c.hang + n) * T;
      else if (c.huong === 'trai') cham = pl.x <= 3 && pl.y + pl.h > c.hang * T && pl.y < (c.hang + n) * T;
      else if (c.huong === 'tren') cham = pl.y + pl.h * 0.5 < 2 && cx > c.cot * T && cx < (c.cot + n) * T;
      else cham = pl.y + pl.h >= H - 3 && cx > c.cot * T && cx < (c.cot + n) * T;
      if (!cham) continue;
      if (khoa){
        if (G.dongCua && !G.cuaKhoa.includes(c) && G.tbT <= 0){ const bb = G.tinhAnh || G.trum; thongBao('Roots seal the way – defeat ' + ((bb && bb.def && bb.def.ten) || 'the elite') + ' to open it'); }
        continue;
      }
      if (!c.toi) continue;
      chuyenCanh(async () => { const p2 = await layPhong(c.toi); vaoPhong(p2, c.toi_cua, null); });
      return;
    }
    // tới gần cổng rễ: đủ điều kiện → gắn lõi, rễ từ từ mở; chưa đủ → nhắc
    for (const c of G.cuaKhoa){
      const [x, y] = odCua(c)[0], dx = Math.abs(cx - (x + 0.5) * T), dy = Math.abs(cy - (y + 1) * T);
      if (dx < T * 2.6 && dy < T * 2.5){
        const k = p.khoa, ten = {chuong_vo:'Broken Bells', the_ten:'Name Tags'}[k.can] || k.can;
        if (k.loi && duMoCong(k)){ if (!G.moCong){ G.moCong = {id:c.id, t:0}; thongBao('The Ruin Core fits the gem socket – the roots part…'); } }
        else if (G.tbT <= 0) thongBao(k.loi ? 'Root gate – needs ' + k.so + ' ' + ten + ' (have ' + Math.min(k.so, demKho(k.can)) + ') and the Ruin Core (' + (demKho(k.loi) ? 'found' : 'missing') + ')'
          : 'The gate is silent – needs ' + k.so + ' ' + ten + ' (have ' + demKho(k.can) + ')');
      }
    }
  }
  // khoá cửa khi đánh tinh anh / trùm
  function kiemDongCua(){
    const p = G.phong, boss = G.tinhAnh || G.trum;
    const song = boss && !boss.dead && boss.st !== 'chet';
    if (!G.dongCua && song){
      const W = E.BD.COT * T, cx = pl.x + pl.w / 2, trong = cx > T * 2.5 && cx < W - T * 2.5 && pl.y > 0 && pl.onGround;
      const gan = Math.abs(cx - (boss.x + boss.w / 2)) < 9 * T;
      if (trong && gan){
        G.dongCua = true;
        for (const c of p.cua) if (!G.cuaKhoa.includes(c)) for (const [x, y] of odCua(c)) if (E.BD.L[y]) E.BD.L[y][x] = '#';
        thongBao(boss === G.trum ? 'Living roots seal the chamber – the Mold Mother stirs…' : 'Roots seal the way – ' + (boss.def.ten || 'elite'));
        E.S.sht = 10; E.S.shm = 3; E.S.shx = 1; E.S.shy = 1;
        if (V1.veNenPhong) V1.veNenPhong();
      }
    }
    if (G.dongCua && !song) moCuaLai();
  }
  function moCuaLai(){
    G.dongCua = false;
    for (const c of G.phong.cua) if (!G.cuaKhoa.includes(c)) for (const [x, y] of odCua(c)) if (E.BD.L[y]) E.BD.L[y][x] = '.';
    if (V1.veNenPhong) V1.veNenPhong();
  }
  function buocMoCong(){
    const m = G.moCong; if (!m) return;
    m.t++;
    if (m.t === 40 || m.t === 75 || m.t === 110){ E.S.sht = 12; E.S.shm = 2.2; E.S.shx = 1; E.S.shy = 0.6; }   // rễ giằng co
    if (m.t >= MO_CONG_T){ (G.luu.congMo || (G.luu.congMo = [])).push(m.id); G.moCong = null; moKhoaNeuDu(); ghiLuu(); thongBao('The root gate is open'); }
  }
  V1.buocMoCong = buocMoCong;
  function moKhoaNeuDu(){
    const p = G.phong; let doi = false;
    for (const c of G.cuaKhoa.slice()) if (!cuaBiKhoa(p, c)){
      G.cuaKhoa.splice(G.cuaKhoa.indexOf(c), 1); doi = true;
      if (!G.dongCua) for (const [x, y] of odCua(c)) if (E.BD.L[y]) E.BD.L[y][x] = '.';
      for (const [x, y] of odKhoa(c).slice(odCua(c).length)) if (E.BD.L[y]) E.BD.L[y][x] = '.';   // cột phía trong luôn mở lại
    }
    if (doi && V1.veNenPhong) V1.veNenPhong();
  }

  /* ---------------- VẬT PHẨM ---------------- */
  const TEN_VP = {manh_am:'Echo Shard', chuong_vo:'Broken Bell', hat_vong:'Echo Seed', tang_mau:'Vital Mask', the_ten:'Name Tag', loi_vong_tan:'Ruin Core',
    manh_ky_uc:'Memory Shard', manh_hoi:'Heal Vessel Fragment', bua_neo_re:'Anchor Charm', nut_warden:'Warden Knot', verdant_ruin_core:'Verdant Ruin Core'};
  V1.TEN_VP = TEN_VP;
  V1.viTriVP = v => ({x:v.cot * T + T / 2, y:chanO(v.cot, v.hang)});
  function nhatVatPham(){
    const p = G.phong, hb = {x:pl.x - 6, y:pl.y, w:pl.w + 12, h:pl.h};
    for (const v of p.vat_pham){
      if (G.luu.daNhat.includes(v.id) || (V1.vpAn && V1.vpAn(v))) continue;
      const o = V1.viTriVP(v);
      if (!E.overlap(hb, {x:o.x - 18, y:o.y - 40, w:36, h:40})) continue;
      nhan(v.loai, v.so); G.luu.daNhat.push(v.id); ghiLuu();
      V1.hieuUng && V1.hieuUng('nhat', o.x, o.y - 20);
    }
    for (let i = G.vatRoi.length - 1; i >= 0; i--){
      const v = G.vatRoi[i];
      if (v.t++ < 30 || !E.overlap(hb, {x:v.x - 18, y:v.y - 40, w:36, h:40})) continue;
      nhan(v.loai, v.so); if (v.id) G.luu.daNhat.push(v.id); G.vatRoi.splice(i, 1); ghiLuu();
      V1.hieuUng && V1.hieuUng('nhat', v.x, v.y - 20);
    }
    // túi Mảnh Âm rơi khi chết
    const tui = G.luu.tui;
    if (tui && tui.phong === G.id && E.overlap(hb, {x:tui.x - 22, y:tui.y - 40, w:44, h:40})){
      G.luu.manh += tui.so; thongBao('Pouch recovered: +' + tui.so + ' Echo Shards'); G.luu.tui = null; ghiLuu();
      V1.hieuUng && V1.hieuUng('nhat', tui.x, tui.y - 20);
    }
  }
  function nhan(loai, so){
    const L = G.luu;
    if (loai === 'manh_am'){ L.manh += so || 10; thongBao('+' + (so || 10) + ' Echo Shards'); return; }
    if (loai === 'hat_vong'){ L.hoiMax++; pl.luotHoi = (pl.luotHoi || 0) + 1; thongBao('Echo Seed: +1 heal charge (' + L.hoiMax + ')'); return; }
    if (loai === 'tang_mau'){ L.maxHp++; E.P.maxHp = L.maxHp; pl.hp = Math.min(L.maxHp, pl.hp + 1); thongBao('+1 max health'); return; }
    L.kho[loai] = (L.kho[loai] || 0) + 1;
    if (loai === 'chuong_vo'){
      const n = L.kho.chuong_vo;
      if (n >= 3 && !L.nvA){ L.nvA = true; L.manh += 120; thongBao('All three lost chimes found! The Mute Bell Choir opens · +120 Echo Shards'); G.tbT = 240; }
      else thongBao('Broken Bell ' + n + '/3 – "Three Lost Chimes"');
      moKhoaNeuDu(); return;
    }
    if (loai === 'loi_vong_tan'){ thongBao('Ruin Core – set it in the gem socket of the root gate to open the way'); return; }
    if (loai === 'manh_hoi'){ const n = L.kho.manh_hoi; if (n % 3 === 0){ L.hoiMax++; pl.luotHoi = (pl.luotHoi || 0) + 1; thongBao('Heal Vessel complete: +1 heal charge (' + L.hoiMax + ')'); } else thongBao('Heal Vessel Fragment ' + (n % 3) + '/3'); return; }
    if (loai === 'bua_neo_re'){ thongBao('Anchor Charm – Root Anchor recharges 10% faster'); return; }
    if (loai === 'manh_ky_uc'){ thongBao('Memory Shard – a fragment of a forgotten echo'); return; }
    if (loai === 'nut_warden'){ thongBao('Warden Knot – the nursery keeper\'s braided oath'); return; }
    if (loai === 'verdant_ruin_core'){ thongBao('Verdant Ruin Core – the rot of the roots is stilled'); return; }
    thongBao('Picked up: ' + (TEN_VP[loai] || loai));
  }
  V1.nhan = nhan;

  /* ---------------- MẢNH ÂM RƠI ---------------- */
  function roiManh(x, y, so){
    const n = Math.min(8, Math.max(2, Math.round(so / 5))), moi = so / n;
    for (let i = 0; i < n; i++) G.roi.push({x, y:y - 20, vx:(Math.random() - 0.5) * 6, vy:-3 - Math.random() * 4, so:moi, t:0});
  }
  V1.roiManh = roiManh;
  function buocManh(){
    const cx = pl.x + pl.w / 2, cy = pl.y + pl.h * 0.5;
    for (let i = G.roi.length - 1; i >= 0; i--){
      const m = G.roi[i]; m.t++;
      if (m.t > 24 && !pl.dead){   // bay về nhân vật
        const dx = cx - m.x, dy = cy - m.y, d = Math.hypot(dx, dy) || 1, v = Math.min(14, 2 + m.t * 0.15);
        m.x += dx / d * v; m.y += dy / d * v;
        if (d < 20){ G.luu.dem = (G.luu.dem || 0) + m.so; G.roi.splice(i, 1); }
      } else { m.vy += 0.4; m.x += m.vx; m.y += m.vy; m.vx *= 0.94; if (E.solidPt(m.x, m.y)){ m.y -= m.vy; m.vy *= -0.4; } }
    }
    if (G.luu.dem >= 1){ const k = Math.floor(G.luu.dem); G.luu.manh += k; G.luu.dem -= k; }
  }

  /* ---------------- CHUÔNG LƯU ---------------- */
  function kiemChuong(){
    const c = G.phong.chuong_luu; G.ganChuong = false;
    if (!c || pl.dead) return;
    const x = c.cot * T + T / 2, y = chanO(c.cot, c.hang);
    G.ganChuong = Math.abs(pl.x + pl.w / 2 - x) < 70 && Math.abs(pl.y + pl.h - y) < 60 && pl.onGround;
    if (G.ganChuong && V1.bam('u') && !pl.atk) nghiChuong();
  }
  function nghiChuong(){
    const c = G.phong.chuong_luu, L = G.luu;
    pl.hp = E.P.maxHp; pl.luotHoi = L.hoiMax;
    const gui = L.manh; L.manhGui += L.manh; L.manh = 0;
    L.chuong = {phong:G.id, cot:c.cot, hang:c.hang};
    G.daHa = {};                       // hồi sinh quái
    if (V1.dhDatLai) V1.dhDatLai();    // Vùng 2: chuông lưu đặt lại địa hình (gỗ mục mọc lại hết, cổng lối tắt đã mở giữ mở)
    // dựng lại quái phòng này (trừ tinh anh đã hạ)
    for (const q of E.QUAI) if (!q.laTinhAnh && q !== G.trum){ E.datLaiQuai(q); }
    const ok = ghiLuu();
    G.trang = 'chuong'; V1.moChuong && V1.moChuong(gui, ok);
  }
  V1.nghiChuong = nghiChuong;
  V1.tongManh = () => G.luu.manh + G.luu.manhGui;
  V1.giaMau = GIA_MAU;
  V1.coTheMuaMau = () => G.luu.nangMau < 1 && V1.tongManh() >= GIA_MAU;
  V1.muaMau = function(){
    const L = G.luu;
    if (L.nangMau >= 1) return 'Fully upgraded (1 level for now)';
    if (V1.tongManh() < GIA_MAU) return 'Not enough Echo Shards (need ' + GIA_MAU + ')';
    let can = GIA_MAU; const a = Math.min(L.manhGui, can); L.manhGui -= a; can -= a; L.manh -= can;
    L.nangMau++; L.maxHp++; E.P.maxHp = L.maxHp; pl.hp = L.maxHp; ghiLuu();
    return 'Vitality +1 – max health ' + L.maxHp;
  };

  /* ---------------- CHẾT ---------------- */
  function khiChet(){
    const L = G.luu, mat = Math.floor(L.manh * 0.3);
    L.chet++;
    if (mat > 0){ L.tui = {phong:G.id, x:Math.round(pl.x + pl.w / 2), y:Math.round(timDatDuoi(pl.x + pl.w / 2, pl.y + pl.h)), so:mat}; L.manh -= mat; }
    G.daHa = {};
    ghiLuu();
    chuyenCanh(async () => {
      const c = L.chuong, id = c ? c.phong : (G.bd.phong_dau || G.bd.phong[0].id);
      pl.hp = E.P.maxHp; pl.luotHoi = L.hoiMax;
      const p = await layPhong(id);
      vaoPhong(p, c ? null : G.bd.cua_dau || null, null);
      if (c) datNV(c.cot * T + T / 2 + 40, chanO(c.cot, c.hang));
      pl.iframes = 60; pl.nhay = 60;
      if (L.trumHa && !L.hetXem && V1.thangTrum){ V1.thangTrum(); return; }   // (luồng F) trùm gục cùng lúc người chơi ngã → vẫn tính thắng
      thongBao(mat > 0 ? 'Lost ' + mat + ' Echo Shards – your pouch lies where you fell' : 'You wake beside the Rest Bell');
    });
  }
  function timDatDuoi(x, y){
    let yy = Math.max(0, y);
    for (let i = 0; i < 40; i++){ if (E.datPt(x, yy + 2)) return yy; yy += T / 4; }
    return y;
  }

  /* ---------------- SỰ KIỆN TỪ ENGINE ---------------- */
  V1.suKienTheGioi = function(){
    for (const e of E.SUKIEN){
      if (e.k === 'quai-chet' && e.q){
        const q = e.q, d = q.def;
        if (q.idx !== undefined){ (G.daHa[G.id] || (G.daHa[G.id] = {}))[q.idx] = true; }
        roiManh(q.x + q.w / 2, q.y + q.h / 2, q.laTinhAnh ? 60 : Math.round((d.mau || 30) / 6) + 3);
        if (q.laTinhAnh){
          if (!G.luu.tinhAnhHa.includes(G.id)) G.luu.tinhAnhHa.push(G.id);
          if (V1.khiHaTinhAnh) V1.khiHaTinhAnh(q);   // Vùng 2: cầu rễ bện + lối tắt R211→R208
          thongBao('Defeated ' + (d.ten || 'the elite')); ghiLuu();
        }
      }
      if (e.k === 'vo-tuong'){ G.luu.tuongVo.push(G.id + ':' + e.cot + ':' + e.hang); ghiLuu(); if (V1.veNenPhong) V1.veNenPhong(); thongBao('The cracked wall breaks – a hidden nook!'); }
      if (e.k === 'het-chet') khiChet();
      if (e.k === 'khong-hoi') thongBao('Cannot heal: ' + e.ly);
      if (e.k === 'hoi-mau') thongBao('+' + E.P.hoiLuong + ' health');
    }
  };
  function chanDat(q){ return timDatDuoi(q.x + q.w / 2, q.y + q.h); }

  /* ---------------- MỘT BƯỚC THẾ GIỚI ---------------- */
  V1.buocTheGioi = function(){
    if (!G.phong) return;
    G.luu.giay += 1 / 60;
    if (V1.dhBuoc) V1.dhBuoc();   // Vùng 2: địa hình động + Neo Rễ (trước khi kiểm cửa / va chạm của bước sau)
    if (V1.capNhatKhungNhin) V1.capNhatKhungNhin();
    kiemDongCua(); buocMoCong(); kiemCua(); if (!pl.dead) nhatVatPham(); buocManh(); kiemChuong();
    // rơi khỏi đáy phòng mà không có cửa → về chỗ an toàn
    if (pl.y > E.BD.HANG * T + 200 && !pl.dead){ E.hurt(0, 1); datNV((G.phong.bat_dau ? G.phong.bat_dau.cot : 2) * T, T * 2); }
  };

  function thongBao(s){ G.tb = s; G.tbT = 150; }
  V1.thongBao = thongBao;
  V1.vaoPhong = vaoPhong;
  V1.datNV = datNV;
})();
