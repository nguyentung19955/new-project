'use strict';
/* lang.js – LÀNG CHUÔNG (Bell Village): điểm khởi đầu + trạm teleport. Phiên cottruyen.
   Theo kế hoạch ChatGPT docs/cot-truyen/ke-hoach-chatgpt.txt (mục 2, 3, 5). Bố cục: lang.json.
   LUẬT HÌNH: chỉ vẽ ảnh ChatGPT (nền, tiền cảnh, nhân vật phụ, chuông, hiệu ứng, khung) + chữ + làm tối/mờ.
   Thiếu ảnh bắt buộc (nền 5 màn, chuông, khung hộp thoại, Kiếm Khách) → làng KHÔNG mở (chỉ báo chữ).
   Thiếu ảnh của một nhân vật phụ (dáng đứng hoặc chân dung) → riêng nhân vật đó ẩn. Thiếu tranh mở đầu → bỏ qua mở đầu.
   Cổng kiểm thử: window.LANG = {sanSang, thieu, tram, buoc(n, 'l,r,u,ok,bo'), tt()}; ?thu=1 = không tự chạy vòng lặp, không rời trang; ?tu=<vùng> = vừa dịch chuyển từ vùng về. */
(async function(){
  const GOC = '../../', Q = new URLSearchParams(location.search), LC = window.LuuChung;
  const $ = id => document.getElementById(id);
  const LANG = window.LANG = {sanSang:false, thieu:[], tram:[], xong:false};
  if (window.LuuMay && LuuMay.coMay()){ await LuuMay.cho(2500); if (LC) LC.napLai(); }   // (firebase) lấy bản lưu mây trước khi đọc
  const napAnh = u => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = GOC + u; });

  try { if (window.CHU) await CHU.cho(2500); } catch (e){}   // phông hệ A trước khi vẽ chữ canvas
  let L; try { L = await (await fetch('lang.json', {cache:'no-store'})).json(); } catch (e){ LANG.thieu = ['lang.json']; return xongNap(); }
  const nen = await Promise.all(L.nen.map(napAnh)), truoc = await Promise.all(L.truoc.map(napAnh));
  const anhChuong = await napAnh(L.chuong.anh), anhDC = await napAnh(L.dich_chuyen.anh), anhChon = await napAnh(L.khung_chon.anh);
  // Kiếm Khách: dùng đúng sheet đã chốt (game/thu-mat-na/nhan-vat.json), chỉ đứng + chạy
  let NV = null, clip = {};
  try {
    NV = await SpriteMN.napJson('../thu-mat-na/nhan-vat.json');
    for (const t of ['dung', 'troi']) clip[t] = await SpriteMN.napClip(NV.goc, NV.clip[t], t);
  } catch (e){}
  // hộp thoại + cảnh
  const HT = window.HopThoai, CT = window.CanhTruyen, TM_HT = '../cot-truyen/hoi-thoai/';
  const ids = [...new Set(L.npc.flatMap(n => n.hoi_thoai))];
  await Promise.all(ids.map(id => HT.nap(TM_HT, id, GOC)));
  await CT.nap('../cot-truyen/canh/', 'mo-dau', GOC);
  const KHUNG_HT = 'art/cot-truyen/hop-thoai/khung.png', khungHT = await napAnh(KHUNG_HT);

  LANG.thieu = [];
  L.nen.forEach((u, k) => { if (!nen[k]) LANG.thieu.push(u); });
  if (!anhChuong) LANG.thieu.push(L.chuong.anh);
  if (!khungHT) LANG.thieu.push(KHUNG_HT);
  if (!clip.dung || !clip.dung.ok || !clip.troi || !clip.troi.ok) LANG.thieu.push('art/kiem-khach/ (dung, chay)');
  LANG.tram = await TramDichChuyen.nap(GOC);
  if (LANG.thieu.length) return xongNap();

  // nhân vật phụ: chỉ hiện khi có dáng đứng + đoạn thoại đủ ảnh
  const NPC = [];
  for (const n of L.npc){
    const im = await napAnh(n.anh), ok = n.hoi_thoai.every(id => HT.sanSang(id));
    if (im && ok) NPC.push(Object.assign({im}, n));
    else LANG.anTam = (LANG.anTam || []).concat(n.id + (im ? ' (portrait/dialogue art missing)' : ' (sprite missing)'));
  }
  LANG.npc = NPC.map(n => n.id);
  // vật tương tác trong làng (vd bia tưởng niệm cho nhiệm vụ ẩn "A Name Returned" của phiên "an") – thiếu ảnh thì không có
  const VAT = [];
  for (const v of L.vat || []){ const im = await napAnh(v.anh); if (im) VAT.push(Object.assign({im, vat: true}, v)); }
  LANG.vat = VAT.map(v => v.id);
  LANG.sanSang = true;
  if (LC) LC.datCo('lang_mo');   // Vùng 1 chỉ hiện nút "Return to Bell Village" khi cờ này có

  /* ---------------- trạng thái ---------------- */
  const W = 960, H = 540, RONG = L.rong_man * L.nen.length, MD = L.mat_dat;
  const tu = Q.get('tu'), THU = Q.get('thu') === '1';
  const P = {x: tu ? L.ve_tu_vung_x : L.bat_dau_x, mat: 1, chay: false, t: 0, an: false};
  const S = {che: 'choi', cam: 0, chuongK: L.chuong.khung_ngu, chuongT: 0, dc: null, gan: null, tg: 0, menu: null, dich: null};
  // vào từ vùng: phát hiệu ứng dịch chuyển ngược (9→0)
  if (tu && anhDC){ S.dc = {t: 0, nguoc: true}; P.an = true; }
  // lần đầu: mở đầu (nếu đủ tranh), sau đó Vesper tự chào khi lại gần
  if (LC && !LC.daXem('mo-dau') && CT.sanSang('mo-dau') && !Q.has('bo_mo_dau')) { CT.bat('mo-dau', () => { S.che = 'choi'; }); S.che = 'canh'; }

  /* ---------------- vào/ra ---------------- */
  const KM = {ArrowLeft:'l', KeyA:'l', ArrowRight:'r', KeyD:'r', ArrowUp:'u', KeyW:'u', KeyE:'u', ArrowDown:'d', KeyS:'d',
    Enter:'ok', KeyZ:'ok', Space:'ok', Escape:'bo', KeyX:'bo'};
  const giu = {}, bam = {}, ep = {};
  addEventListener('keydown', e => { const k = KM[e.code]; if (!k) return; if (!giu[k]) bam[k] = 1; giu[k] = 1; e.preventDefault(); document.body.classList.remove('touch'); });
  addEventListener('keyup', e => { const k = KM[e.code]; if (k) giu[k] = 0; });
  addEventListener('blur', () => { for (const k in giu) giu[k] = 0; });
  // cảm ứng: kéo nửa trái = đi; nút chữ bên phải = nói/xác nhận; Skip khi chiếu cảnh
  let cham = null;
  const cv = $('cv');
  addEventListener('touchstart', () => document.body.classList.add('touch'), {passive:true, once:true});
  cv.addEventListener('pointerdown', e => { if (e.clientX < innerWidth / 2){ cham = {id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0}; } else bam.ok = 1; });
  addEventListener('pointermove', e => { if (cham && e.pointerId === cham.id){ cham.dx = e.clientX - cham.x0; cham.dy = e.clientY - cham.y0; } });
  // vuốt dọc ở nửa trái = chọn lên/xuống trong hộp thoại / menu
  addEventListener('pointerup', e => { if (cham && e.pointerId === cham.id){ if (Math.abs(cham.dy) > 30 && Math.abs(cham.dy) > Math.abs(cham.dx)) bam[cham.dy < 0 ? 'u' : 'd'] = 1; cham = null; } });
  $('b-noi').addEventListener('pointerdown', e => { e.stopPropagation(); bam[S.che === 'choi' ? 'u' : 'ok'] = 1; });
  $('b-bo').addEventListener('pointerdown', e => { e.stopPropagation(); bam.bo = 1; });
  const docPhim = () => {
    const I = {};
    for (const k of ['l', 'r', 'u', 'd', 'ok', 'bo']){ I[k] = !!(giu[k] || ep[k]); I['b_' + k] = !!(bam[k] || (ep[k] && !docPhim.cu[k])); }
    if (cham && Math.abs(cham.dx) > Math.abs(cham.dy)){ I.l = I.l || cham.dx < -24; I.r = I.r || cham.dx > 24; }
    docPhim.cu = Object.assign({}, ep); for (const k in bam) bam[k] = 0;
    return I;
  };
  docPhim.cu = {};

  /* ---------------- teleport ---------------- */
  function moMenu(){
    // (khoidau) bảng đích: vùng mở "— Enter"; vùng đã dựng nhưng còn khoá thì hiện mờ kèm điều kiện; làng không nằm trong danh sách
    const di = LANG.tram.filter(v => v.di_duoc);
    const chon = [];
    for (const v of LANG.tram.filter(v => v.duong_dan).reverse()){
      if (v.di_duoc) chon.push({chu: v.ten + ' — Enter', gt: 'vung:' + v.id});
      else chon.push({chu: v.ten + ' — ' + (v.id === 'vung-2' ? 'Defeat the Hollow Bell Mother' : 'Sealed'), gt: 'khoa', khoa: true});
    }
    chon.push({chu: 'Stay', gt: 'o-lai'});
    const khoa = LANG.tram.length - di.length;
    const d = {id: 'tram-menu', khung: KHUNG_HT, nguoi: {}, dong: [{ai: '', chu: 'The Rootbound Bell hums.' + (khoa ? ' ' + khoa + ' paths still sleep.' : ''), chon}]};
    HT._DS['tram-menu'] = Object.assign(d, {_goc: GOC});
    S.menu = {chon, i: Math.max(0, chon.findIndex(c => !c.khoa))};
    if (anhChon){ S.che = 'menu'; return; }               // khung chọn riêng (yêu cầu ảnh 009)
    HT.bat('tram-menu', ketQuaMenu); S.che = 'thoai';      // chưa có → dùng khung hộp thoại (ảnh ChatGPT 001)
  }
  function ketQuaMenu(gt){
    S.menu = null; S.che = 'choi';
    if (gt === 'khoa'){ return; }
    if (typeof gt === 'string' && gt.startsWith('vung:')){
      const v = LANG.tram.find(x => 'vung:' + x.id === gt); if (!v || !v.di_duoc) return;
      S.dich = v; S.dc = {t: 0, nguoc: false}; S.che = 'dich';
    } else if (gt === 'mo-dau'){ CT.bat('mo-dau', () => { S.che = 'choi'; }); S.che = 'canh'; }
    else S.chuongK = L.chuong.khung_sang;
  }
  function diToi(v){
    LANG.diToi = v.id;
    if (LC){ LC.datCo('lang_da_dich_chuyen'); }
    if (THU) return;                                      // kiểm thử: không rời trang
    const url = GOC + v.duong_dan + '?tu_lang=1';
    if (window.KhoiDau) KhoiDau.diToi(url); else location.href = url;   // (khoidau) tối dần ~250 ms → màn tải của vùng
  }

  /* ---------------- bước 60 Hz ---------------- */
  const DT = 1 / 60;
  function buoc(I){
    S.tg += DT;
    if (S.che === 'canh'){ CT.capNhat(DT, {xac_nhan: I.b_ok, bo_qua: I.b_bo}); if (!CT.dangChieu()) S.che = 'choi'; return; }
    if (S.che === 'thoai'){ HT.capNhat(DT, {xac_nhan: I.b_ok, len: I.b_u, xuong: I.b_d}); return; }
    if (S.che === 'menu'){
      const m = S.menu, n = m.chon.length;
      const buocChon = d => { for (let k = 0; k < n; k++){ m.i = (m.i + d + n) % n; if (!m.chon[m.i].khoa) break; } };
      if (I.b_u) buocChon(-1); if (I.b_d) buocChon(1);
      if (I.b_bo) return ketQuaMenu('o-lai');
      if (I.b_ok) return m.chon[m.i].khoa ? undefined : ketQuaMenu(m.chon[m.i].gt);
      return;
    }
    if (S.che === 'kich'){            // chuông kích hoạt: khung 2→9, 90 ms/khung, rồi mở menu
      S.chuongT += DT * 1000; const [a, b] = L.chuong.kich_hoat;
      S.chuongK = Math.min(b, a + Math.floor(S.chuongT / L.chuong.ms));
      if (S.chuongK >= b && S.chuongT >= (b - a + 1) * L.chuong.ms) moMenu();
      return;
    }
    if (S.dc){                         // hiệu ứng dịch chuyển (vào làng: ngược; đi: xuôi rồi rời trang)
      S.dc.t += DT * 1000; const n = L.dich_chuyen.khung, k = Math.floor(S.dc.t / L.dich_chuyen.ms);
      if (k >= n){ const di = !S.dc.nguoc; S.dc = null; P.an = false; if (di && S.dich){ diToi(S.dich); S.che = 'da_di'; } return; }
      S.dcK = S.dc.nguoc ? n - 1 - k : k; P.an = S.dc.nguoc ? S.dcK >= L.dich_chuyen.an_tu : S.dcK >= L.dich_chuyen.an_tu;
      return;
    }
    if (S.che !== 'choi') return;
    if (I.b_bo && window.KhoiDau){ KhoiDau.tamDung.mo(); return; }   // (khoidau) Esc = tạm dừng
    // đi trái/phải
    const v = (I.r ? 1 : 0) - (I.l ? 1 : 0);
    P.chay = v !== 0; if (v) P.mat = v;
    if (v && !S.daDi){ S.daDi = true; S.goiYT = 0; }                  // (khoidau) gợi ý "Drag to move" tắt khi đã đi được
    if (S.daDi) S.goiYT += DT;
    P.x = Math.max(L.bien[0], Math.min(L.bien[1], P.x + v * L.toc_do));
    P.t = P.chay ? (S.chayCu ? P.t + 1 : 0) : (S.chayCu ? 0 : P.t + 1); S.chayCu = P.chay;
    P.quang = P.chay ? (P.quang || 0) + Math.abs(v * L.toc_do) : 0;   // (camgiac) khung chạy theo quãng đường
    // vật gần nhất để tương tác
    S.gan = null; let best = 1e9;
    const xet = (o, r) => { const d = Math.abs(o.x - P.x); if (d < r && d < best){ best = d; S.gan = o; } };
    for (const n of NPC) xet(n, 80);
    for (const v of VAT) xet(v, 70);
    xet({id: 'chuong', x: L.chuong.x}, 100);
    // chuông sáng nhẹ khi lại gần (khung 0↔1)
    S.chuongK = S.gan && S.gan.id === 'chuong' ? L.chuong.khung_sang : L.chuong.khung_ngu;
    if (S.gan && (I.b_u || I.b_ok)) tuongTac(S.gan);
    S.cam = Math.max(0, Math.min(RONG - W, P.x - W / 2));
  }
  function tuongTac(o){
    if (o.id === 'chuong'){ S.che = 'kich'; S.chuongT = 0; P.chay = false; return; }
    if (o.vat){   // báo cho hệ thống khác (phiên "an" nghe sự kiện này), ghi cờ 'cham:<id>'
      if (LC) LC.datCo('cham:' + o.id);
      LANG.chamCuoi = o.id; document.dispatchEvent(new CustomEvent('lang-tuong-tac', {detail: {id: o.id}})); return;
    }
    const sau = LC && LC.co('ha_trum:vung-1') && o.hoi_thoai[1];
    const id = sau ? o.hoi_thoai[1] : o.hoi_thoai[0];
    P.mat = o.x >= P.x ? 1 : -1; P.chay = false;
    if (HT.bat(id, () => { S.che = 'choi'; if (LC) LC.datCo('gap:' + o.id); })) S.che = 'thoai';
  }

  /* ---------------- vẽ ---------------- */
  const g = cv.getContext('2d');
  function ve(){
    g.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#05080d'; g.fillRect(0, 0, W, H);
    if (S.che === 'canh'){ CT.ve(g, W, H); return; }
    const kx = cv.width / W, cx = Math.round(S.cam * kx) / kx;   // (camgiac) làm tròn theo điểm ảnh thật (trước: 1 px logic = 2,17 điểm iPhone)
    const ve5 = ds => ds.forEach((im, k) => { const x = k * L.rong_man - cx; if (im && x < W && x + L.rong_man > 0) g.drawImage(im, x, 0, L.rong_man, H); });
    ve5(nen);
    // chuông teleport (dải ô ngang, neo đáy-giữa)
    { const C = L.chuong, [ow, oh] = C.o, s = C.ti_le; g.drawImage(anhChuong, S.chuongK * ow, 0, ow, oh, Math.round(C.x - cx - C.tam * s), MD - oh * s, ow * s, oh * s); }
    for (const v of VAT){ const [ow, oh] = v.o; g.drawImage(v.im, 0, 0, ow, oh, Math.round(v.x - cx - ow / 2), MD - oh, ow, oh); }
    // nhân vật phụ (nhìn trái gốc; lật khi Kiếm Khách ở bên phải)
    for (const n of NPC){
      const [ow, oh] = n.o, k = Math.floor(S.tg * 1000 / n.ms) % n.khung, x = Math.round(n.x - cx);
      if (x < -ow || x > W + ow) continue;
      if (P.x > n.x){ g.save(); g.translate(x, 0); g.scale(-1, 1); g.drawImage(n.im, k * ow, 0, ow, oh, -ow / 2, MD - oh, ow, oh); g.restore(); }
      else g.drawImage(n.im, k * ow, 0, ow, oh, x - ow / 2, MD - oh, ow, oh);
    }
    // Kiếm Khách
    if (!P.an){
      const C = P.chay ? clip.troi : clip.dung, s = (NV.ti_le || 1) * (NV.co || 1) * 0.85;
      const k = P.chay && C.def.quang_chu_ky ? SpriteMN.khungTheoQuang(C, P.quang || 0) : SpriteMN.khungTheoBuoc(C, P.t);
      SpriteMN.ve(g, C, k, P.x - S.cam, MD, P.mat < 0, s);   // (camgiac) theo camera chưa làm tròn → nhân vật không rung 1 điểm so với nền
    }
    // hiệu ứng dịch chuyển (đáy ở chân)
    if (S.dc && anhDC){ const D = L.dich_chuyen, [ow, oh] = D.o, k = Math.max(0, Math.min(D.khung - 1, S.dcK || 0));
      g.drawImage(anhDC, k * ow, 0, ow, oh, Math.round(P.x - cx - ow / 2), MD - oh + 6, ow, oh); }
    ve5(truoc);
    // gợi ý tương tác (chữ)
    if (S.che === 'choi' && S.gan){
      const t = S.gan.id === 'chuong' ? 'Ring the bell' : S.gan.vat ? 'Examine' : 'Talk', x = S.gan.x - cx, y = MD - (S.gan.id === 'chuong' ? 330 : (S.gan.o[1] + 24));
      g.font = CHU.f(700, 23); g.textAlign = 'center'; g.textBaseline = 'middle';   // A7 gợi ý (Handjet, bóng S1)
      CHU.vien(g, (document.body.classList.contains('touch') ? '' : '▲ ') + t, x, y, CHU.GOLD, '#160D19', 1.5); g.textAlign = 'left';
    }
    // (khoidau) hướng dẫn một dòng: "Drag to move" tới khi đi được, rồi "Find the Rootbound Bell" (tới khi rung chuông lần đầu)
    if (S.che === 'choi'){
      const cham = document.body.classList.contains('touch'), daRung = LC && LC.co('lang_da_dich_chuyen');
      const goiY = !S.daDi ? (cham ? 'Drag to move' : 'Move with ← →') : (!daRung && !(S.gan && S.gan.id === 'chuong') && S.goiYT < 12 ? 'Find the Rootbound Bell' : '');
      if (goiY){ g.font = CHU.f(700, 27); g.textAlign = 'center'; g.textBaseline = 'middle';   // A7 gợi ý: Handjet 700 19px CSS ≈ 27px canvas
        g.globalAlpha = 0.8 + 0.2 * Math.sin(S.tg * 3); CHU.vien(g, goiY, W / 2, 92, CHU.BONE, '#160D19', 1.5); g.globalAlpha = 1; g.textAlign = 'left'; }
    }
    if (S.che === 'thoai') HT.ve(g, W, H);
    if (S.che === 'menu') veMenu();
  }
  function veMenu(){
    const im = anhChon, s = Math.min(640 / im.width, 420 / im.height), w = im.width * s, h = im.height * s, x = (W - w) / 2, y = (H - h) / 2;
    g.fillStyle = 'rgba(5,6,10,.55)'; g.fillRect(0, 0, W, H);
    g.imageSmoothingEnabled = true; g.drawImage(im, x, y, w, h);
    const [qx, qy, qw] = L.khung_chon.chu, tx = x + qx * w, fs = 22;
    g.textBaseline = 'top'; g.textAlign = 'left';
    g.font = CHU.f(750, 30); g.textAlign = 'center'; CHU.vien(g, 'The Rootbound Bell', tx + qw * w / 2, y + qy * h, CHU.GOLD, '#120B16', 1.5); g.textAlign = 'left';   // A3 tiêu đề   // giữa vùng chữ: tránh 2 chuông treo ở góc trên
    S.menu.chon.forEach((c, k) => { g.font = CHU.f(700, fs + 3);   // A3 mục (Handjet)
      CHU.vien(g, (k === S.menu.i ? '› ' : '  ') + c.chu, tx, y + qy * h + 44 + k * fs * 1.45, c.khoa ? '#9D8991' : k === S.menu.i ? CHU.GOLD : CHU.BONE, '#160D19', 1, qw * w); });
  }

  /* ---------------- khung hình + nút ---------------- */
  function vua(){
    const k = Math.min(innerWidth / W, innerHeight / H), dpr = devicePixelRatio || 1;
    cv.style.width = Math.round(W * k) + 'px'; cv.style.height = Math.round(H * k) + 'px';
    cv.width = Math.round(W * k * dpr); cv.height = Math.round(H * k * dpr);
  }
  addEventListener('resize', vua); vua();
  cv.style.display = 'block';
  if (LC) LC.datNoiCuoi('lang');                                  // (khoidau) CONTINUE trên tiêu đề → làng
  try { const u = new URL(location.href); if (u.searchParams.has('moi') || u.searchParams.has('tiep')){ u.searchParams.delete('moi'); u.searchParams.delete('tiep'); history.replaceState(null, '', u.pathname + u.search + u.hash); } } catch (e){}
  if (window.KhoiDau){ KhoiDau.tai.dong(); if (S.che !== 'canh') KhoiDau.tenVung('Bell Village'); }
  function capNhatNut(){
    const nut = $('b-noi'), bo = $('b-bo');
    const txt = S.che === 'canh' ? 'Next' : S.che === 'thoai' || S.che === 'menu' ? 'OK' : S.che === 'choi' && S.gan ? (S.gan.id === 'chuong' ? 'Ring' : S.gan.vat ? 'Examine' : 'Talk') : '';
    nut.textContent = txt; nut.style.visibility = txt ? 'visible' : 'hidden';
    bo.style.visibility = S.che === 'canh' ? 'visible' : 'hidden';   // (khoidau) Skip chỉ khi chiếu mở đầu (bảng teleport có 'Stay')
  }
  function mot(I){ buoc(I || docPhim()); }
  Object.assign(LANG, {
    xong: true, S, P,
    buoc(n, phim){ const ds = (phim || '').split(',').filter(Boolean); for (const k of ['l', 'r', 'u', 'd', 'ok', 'bo']) ep[k] = ds.includes(k) ? 1 : 0;
      for (let i = 0; i < n; i++) mot(); for (const k in ep) ep[k] = 0; ve(); capNhatNut(); },
    tt: () => ({che: S.che, x: Math.round(P.x), gan: S.gan && S.gan.id, chuongK: S.chuongK, thoai: HT.dangMo() && HT.dongHienTai() && HT.dongHienTai().chu,
      canh: CT.tranhHienTai(), diToi: LANG.diToi || null, an: P.an})
  });
  // (camgiac) bắt nhịp màn hình + nội suy vị trí nhân vật/camera khi vẽ (game/muot-khung.js)
  const dongHo = window.MuotKhung ? MuotKhung.taoDongHo() : null, CAMO = {get x(){ return S.cam; }, set x(v){ S.cam = v; }}, DSN = [P, CAMO], dsn = () => DSN;
  let cu = 0, du = 0;
  function vong(t){
    requestAnimationFrame(vong);
    if (dongHo){ const r = dongHo(t, mot, dsn); MuotKhung.noiSuy(DSN, r.a, ve); capNhatNut(); return; }
    du += Math.min(100, t - (cu || t)); cu = t;
    let n = 0; while (du >= 1000 / 60 && n < 4){ mot(); du -= 1000 / 60; n++; } if (n === 4) du = 0;
    ve(); capNhatNut();
  }
  if (!THU) requestAnimationFrame(vong); else { ve(); capNhatNut(); }
  // (khoidau) menu tạm dừng chung (Map / Journal / Lattice chưa có ở làng → mờ)
  if (window.KhoiDau) KhoiDau.tamDung.gan({
    coThe: () => S.che === 'choi', hienNut: () => S.che === 'choi' || S.che === 'tam_dung',
    dung: () => { S.che = 'tam_dung'; P.chay = false; cham = null; }, tiep: () => { if (S.che === 'tam_dung') S.che = 'choi'; },
    ban_do: null, nhat_ky: null, lattice: null
  });

  function xongNap(){
    LANG.xong = true;
    $('thieu').textContent = 'Missing art: ' + LANG.thieu.join(', ');
    $('keys').style.display = 'none';
    if (window.KhoiDau) KhoiDau.tai.loi();   // (khoidau) không bao giờ hiện chữ "waiting for art" cho người chơi
  }
})();
