/* ======================= TRANG TRÍ ĐỊA HÌNH (TT) – game/runtime/trang-tri-dia-hinh.js =======================
   Vẽ các mảnh trang trí (ảnh gen đã tách nền, 2x) ĐÈ lên / SAU gạch địa hình, cùng hệ toạ độ camera với collider
   (không parallax; trừ lớp tiền cảnh cuộn 1,05). Chỉ là HÌNH: không có va chạm, không đổi bản đồ / gameplay.

   Dữ liệu đặt theo màn (vd. game/runtime/trang-tri/cong-lang.js) gọi TT.them(tenMan, {...}) với:
     an_o:   [[tx,ty], …]        ô gạch KHÔNG vẽ hình (collider giữ nguyên) – vd. 3 ô ván của bệ đã thay bằng bệ có neo
     dat:    [ {lop, o, x, y, lat, cat, …}, … ]   mảnh đặt; toạ độ THẾ GIỚI logic (px), neo của mảnh ghi trong JSON atlas
        lop:  'sau'  = vẽ TRƯỚC gạch (bị gạch che phần chồng lên gạch: chân bệ lún dưới sàn, cửa sau tường…)
              'than' = vẽ SAU gạch, TRƯỚC mảng rễ rong-re (mảng gỗ lớn phủ thân)
              'mat'  = vẽ SAU rong-re, TRƯỚC Lam / quái / đồ vật (mép đất rễ, chân rễ, cửa nhà…)
        o:    tên ô trong atlas, hoặc tên HỌ + '*' (vd. 'mang-go*') → chọn biến thể theo băm vị trí (cố định, không random mỗi khung)
        lat:  1 = lật ngang (neo góc trái: hộp giữ nguyên, hình lật; neo khác: lật quanh neo)
        cat:  'dac' = chỉ vẽ trong vùng ô ĐẶC của bản đồ (chỉ ô GỖ nếu khoiTao có `go`; không lan sang ô đá), lùi 1,5 px ở cạnh lộ
              (giữ viền đen gạch, không bao giờ thò ra ngoài collider)
              [x0,y0,x1,y1] = cắt theo hộp thế giới
        giai: 'mep' → DẢI mép đất: x0, x1 (mép collider), y (mặt đứng), bo (1|2|0 = băm), trai/phai (true = đầu thật có nắp cuộn,
              false = cắt phẳng vì sàn chạy tiếp vào tường/bậc)
        giai: 'van-day' → bệ VÁN TREO DÂY thay bệ một chiều lơ lửng: x0, x1 (mép collider, rộng 2 hoặc 3 ô), y (mặt bệ = mặt ván);
              ván 'be-van-day-<số ô>' + 2 dây 'day-treo' xếp từ nút buộc lên quá mép trên màn (cùng hệ toạ độ camera, không parallax)
     tien_canh: [ {x0, x1, tren, k}, … ]   mỗi phòng: cụm rễ-đá mép trái ở x0, mép phải ở x1 (thế giới), dời lên `tren` px, thu `k`
              (mặc định 1; phòng boss 0,6 để không che boss); cuộn 1,05

   API:
     TT.khoiTao({ctx, W, H, T, rows, tile, solid, go})   tile(tx,ty)→ký tự ô, solid(c)→đặc?, go(c)→ô gỗ? (tuỳ chọn), rows = số hàng (gọi 1 lần)
     await TT.nap(srcJson, nhung, onTien)            nạp JSON + CHỈ các atlas mà dữ liệu đang dùng, decode sẵn; trả số đo
     TT.anO(map, WW)                                  xoá hình các ô an_o trong bảng gạch (sau dungGach)
     TT.nuong()                                       nướng sẵn các mảnh cắt theo ô đặc vào canvas riêng (ở màn nạp; số đo SO.mb_nuong)
     TT.ve(lop, ox, oy)                               vẽ 1 lớp ('sau' | 'than' | 'mat') với camera (ox, oy)
     TT.veTienCanh(ox, oy)                            lớp tiền cảnh rễ-đá (vẽ SAU nhân vật)
     TT.veCollider(ox, oy, extra)                     overlay collider: ô chặn, bệ một chiều (+ hộp thêm do game đưa) – để duyệt
     TT.bat (true/false), TT.so (số đo nạp / bộ nhớ), TT.bam(x,y) băm 0..1 cố định theo vị trí
   ============================================================================================================ */
'use strict';
const TT = (() => {
  const M = {ctx: null, W: 960, H: 540, T: 32, rows: 17, tile: null, solid: null, go: null};
  const DL = {};                     // tên màn → dữ liệu
  const O = {};                      // tên ô → {img, sx, sy, sw, sh, w, h, ax, ay}  (w,h,ax,ay: logic)
  const HO = {};                     // họ → [tên ô…] (cho 'ho*')
  let META = null;
  const SO = {ms: 0, mb_anh: 0, so_anh: 0, o: 0, tep: []};
  let bat = true;

  function bam(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) % 1000 / 1000; }

  function khoiTao(o) { Object.assign(M, o); }
  function them(ten, d) { DL[ten] = d; return d; }

  function loadImg(src) { return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; }); }
  async function decode(src, ten) {
    const im = await loadImg(src); if (!im) throw new Error('không tải được ảnh trang trí ' + ten);
    if (im.decode) { try { await im.decode(); } catch (e) {} }
    return im;
  }

  /* nạp: srcJson = đường dẫn cong-lang-v3.json (atlas cùng thư mục) hoặc nhung = {json, anh:{tên tệp: data URI}} (bản build) */
  async function nap(srcJson, nhung, onTien) {
    const t0 = performance.now();
    let meta, goc = '';
    if (nhung) meta = nhung.json;
    else { const r = await fetch(srcJson, {cache: 'no-cache'}); if (!r.ok) throw new Error('lỗi mạng ' + r.status + ' khi tải ' + srcJson); meta = await r.json(); goc = srcJson.replace(/[^/]*$/, ''); }
    META = meta;
    // atlas cần nạp = atlas của các ô mà dữ liệu đặt đang dùng (họ '-kho' không nạp)
    const can = new Set();
    const oCua = ten => { if (ten.endsWith('*')) { const h = ten.slice(0, -1); return Object.keys(meta.o).filter(k => k.startsWith(h)); } return [ten]; };
    for (const d of Object.values(DL)) {
      for (const it of d.dat || []) for (const k of (it.giai === 'mep' ? ['mep-1-trai', 'mep-1-giua', 'mep-1-phai', 'mep-2-trai', 'mep-2-giua', 'mep-2-phai']
                                                : it.giai === 'van-day' ? ['be-van-day-' + Math.round((it.x1 - it.x0) / M.T), 'day-treo'] : oCua(it.o)))
        { if (!meta.o[k]) throw new Error('trang trí: thiếu ô ' + k + ' trong atlas'); can.add(meta.o[k].anh); }
      if ((d.tien_canh || []).length) { can.add(meta.o['tien-canh-trai'].anh); can.add(meta.o['tien-canh-phai'].anh); }
    }
    const tep = [...can]; let i = 0; const IMG = {}; let px = 0;
    for (const t of tep) {
      const co = Object.values(meta.anh).find(a => a.tep === t); if (!co) throw new Error('trang trí: JSON không có atlas ' + t);
      const im = await decode(nhung ? nhung.anh[t] : goc + t, t);
      if (im.naturalWidth !== co.co_anh[0] || im.naturalHeight !== co.co_anh[1]) throw new Error('ảnh ' + t + ' cỡ ' + im.naturalWidth + '×' + im.naturalHeight + ' ≠ ' + co.co_anh.join('×'));
      if (t.startsWith('tien-canh')) {   // tiền cảnh: thu ½ vào canvas (bóng rễ tối, đỡ bộ nhớ) – vẽ ở cỡ logic
        const c = document.createElement('canvas'); c.width = im.naturalWidth / 2 | 0; c.height = im.naturalHeight / 2 | 0;
        const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(im, 0, 0, c.width, c.height);
        IMG[t] = {img: c, k: 0.5}; px += c.width * c.height;
      } else { IMG[t] = {img: im, k: 1}; px += im.naturalWidth * im.naturalHeight; }
      if (onTien) onTien(++i / tep.length);
    }
    const B = meta.boi || 2;
    for (const [ten, v] of Object.entries(meta.o)) {
      const A = IMG[v.anh]; if (!A) continue;
      const [sx, sy, sw, sh] = v.khung, k = A.k;
      O[ten] = {img: A.img, sx: sx * k, sy: sy * k, sw: sw * k, sh: sh * k, w: sw / B, h: sh / B, ax: v.neo[0] / B, ay: v.neo[1] / B,
        day: v.day ? v.day.map(d => [d[0] / B, d[1] / B]) : null};
      const h = ten.replace(/-\d+(?=-|$)/, ''); (HO[h] = HO[h] || []).push(ten);   // 'mang-go-3' → họ 'mang-go'; 'chan-re-1-thap' → 'chan-re-thap'
    }
    Object.assign(SO, {ms: Math.round(performance.now() - t0), mb_anh: +(px * 4 / 1048576).toFixed(2), so_anh: tep.length, o: Object.keys(O).length, tep});
    return SO;
  }

  function anO(map, WW) { for (const d of Object.values(DL)) for (const [tx, ty] of d.an_o || []) map[ty * WW + tx] = -1; }

  /* chọn ô: 'ten' | 'ho*' (biến thể theo băm (x,y) ô) */
  function chon(ten, x, y) {
    if (!ten.endsWith('*')) return O[ten];
    const ds = HO[ten.slice(0, -1)]; if (!ds || !ds.length) return null;
    return O[ds[Math.floor(bam(Math.floor(x / M.T), Math.floor(y / M.T)) * ds.length) % ds.length]];
  }

  /* vẽ 1 ô tại neo (x,y) thế giới; lat = lật ngang: neo ở góc trái (ax = 0) → hộp giữ nguyên, hình lật trong hộp (mảng gỗ);
     neo khác (giữa đáy, khung cửa…) → lật quanh neo (cửa: khung đứng yên, đèn + cờ đổi bên) */
  function veO(o, x, y, lat, ox, oy) {
    const ctx = M.ctx, X = x - ox, Y = y - oy, ax = lat && o.ax === 0 ? o.w : o.ax;
    if (X + (lat ? ax : o.w - ax) < 0 || X - (lat ? o.w - ax : ax) > M.W || Y + (o.h - o.ay) < 0 || Y - o.ay > M.H) return;
    if (lat) { ctx.save(); ctx.translate(X, Y); ctx.scale(-1, 1); ctx.drawImage(o.img, o.sx, o.sy, o.sw, o.sh, -ax, -o.ay, o.w, o.h); ctx.restore(); }
    else ctx.drawImage(o.img, o.sx, o.sy, o.sw, o.sh, X - ax, Y - o.ay, o.w, o.h);
  }

  /* vùng cắt = hợp các ô ĐẶC (ô GỖ nếu có M.go – mảng gỗ không lan sang khối đá) trong hộp (x0,y0,x1,y1) thế giới,
     lùi 1,5 px ở cạnh LỘ (cạnh giáp ô trống) → hình không bao giờ ra ngoài collider; cạnh giáp ô đá không lùi (không có cạnh lộ) */
  function catDac(x0, y0, x1, y1, ox, oy) {
    const T = M.T, ctx = M.ctx, I = 1.5, R = M.solid, t = M.tile, G = M.go || M.solid;
    const tx0 = Math.floor(x0 / T), tx1 = Math.floor((x1 - 0.01) / T), ty0 = Math.max(0, Math.floor(y0 / T)), ty1 = Math.floor((y1 - 0.01) / T);
    const dac = (tx, ty) => R(t(tx, Math.min(ty, M.rows - 1)));
    ctx.beginPath(); let n = 0;
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      if (!G(t(tx, Math.min(ty, M.rows - 1)))) continue; n++;
      const l = dac(tx - 1, ty) ? 0 : I, r = dac(tx + 1, ty) ? 0 : I, u = (ty === 0 || dac(tx, ty - 1)) ? 0 : I, d = dac(tx, ty + 1) ? 0 : I;
      ctx.rect(tx * T + l - ox, ty * T + u - oy, T - l - r, T - u - d);
    }
    if (n) ctx.clip(); else ctx.rect(0, 0, 0, 0), ctx.clip();
  }

  /* dải mép đất rễ-rêu: nắp trái / giữa / nắp phải xếp kề (đầu đã mờ dần); nắp chỉ đặt ở đầu THẬT (trai/phai = true),
     đầu cắt phẳng dùng ô giữa; toàn dải cắt theo hộp [x0-8, y-2, x1+8, y+50] để không bao giờ cao hơn mặt đứng 2 px */
  function veMep(it, ox, oy) {
    const ctx = M.ctx, B = it.bo || (bam(Math.floor(it.x0 / M.T), Math.floor(it.y / M.T)) < 0.5 ? 1 : 2);
    const L = O['mep-' + B + '-trai'], G = O['mep-' + B + '-giua'], R = O['mep-' + B + '-phai'];
    const x0 = it.x0, x1 = it.x1, y = it.y, w = x1 - x0;
    if (x1 - ox < -20 || x0 - ox > M.W + 20 || y - oy > M.H || y + 60 - oy < 0) return;
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10 - ox, y - 2 - oy, w + 20, 60); ctx.clip();
    const lw = it.trai ? L.w - L.ax : 0, rw = it.phai ? R.ax : 0;   // bề rộng phần nắp nằm TRÊN mặt (từ neo tới đầu trong)
    if (it.trai && it.phai && lw + rw >= w) {                       // ngắn: 2 nắp gối nhau, cắt mỗi nắp ở giữa dải
      ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10 - ox, y - 2 - oy, w / 2 + 3 + 10, 60); ctx.clip(); veO(L, x0, y, 0, ox, oy); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(x0 + w / 2 - 3 - ox, y - 2 - oy, w / 2 + 3 + 10, 60); ctx.clip(); veO(R, x1, y, 0, ox, oy); ctx.restore();
    } else {
      let x = x0;
      if (it.trai) { veO(L, x0, y, 0, ox, oy); x = x0 + lw - 3; }
      const xe = it.phai ? x1 - rw + 3 : x1;
      ctx.save(); ctx.beginPath(); ctx.rect(x - ox, y - 2 - oy, xe - x, 60); ctx.clip();
      for (let i = 0; x < xe; x += G.w - 4, i++) veO(G, x, y, i & 1, ox, oy);
      ctx.restore();
      if (it.phai) veO(R, x1, y, 0, ox, oy);
    }
    ctx.restore();
  }

  /* bệ ván treo dây: ván 'be-van-day-<n>' neo (mép trái collider, mặt ván); từ chân mỗi dây (o.day) xếp ô 'day-treo' (lặp dọc liền)
     đi LÊN tới quá mép trên màn. Mặt ván = đúng mặt collider '='; nút buộc 2 đầu nhô lên ~9 px là DÂY (không phải mặt đứng). */
  function veVanDay(it, ox, oy) {
    const n = Math.round((it.x1 - it.x0) / M.T), o = O['be-van-day-' + n], D = O['day-treo']; if (!o || !D) return;
    if (it.x1 - ox < -20 || it.x0 - ox > M.W + 20 || it.y - oy > M.H + 40) return;
    const ctx = M.ctx;
    for (const [dx, dy] of o.day || []) {
      let y = it.y + dy;                                         // chân dây (nút buộc)
      for (let i = 0; i < 40 && y - oy > -2; i++, y -= D.h - 0.5) ctx.drawImage(D.img, D.sx, D.sy, D.sw, D.sh, it.x0 + dx - D.ax - ox, y - D.h - oy, D.w, D.h);
    }
    veO(o, it.x0, it.y, 0, ox, oy);
  }

  /* mảnh cắt theo ô đặc ('dac'): vùng cắt chỉ phụ thuộc bản đồ (tĩnh) → NƯỚNG SẴN 1 lần vào canvas 2x riêng (đã cắt),
     lúc chơi chỉ drawImage, không clip mỗi khung (clip nhiều hình chữ nhật tốn thời gian trên máy không GPU) */
  function nuongDac(it, o) {
    const ax = it.lat && o.ax === 0 ? o.w : o.ax, X0 = it.x - ax, Y0 = it.y - o.ay, B = 2;
    const c = document.createElement('canvas'); c.width = Math.ceil(o.w * B); c.height = Math.ceil(o.h * B);
    const g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.scale(B, B);
    const ctx0 = M.ctx; M.ctx = g;
    catDac(X0 - 2, Y0 - 2, X0 + o.w + 2, Y0 + o.h + 2, X0, Y0);
    veO(o, it.x, it.y, it.lat, X0, Y0);
    M.ctx = ctx0;
    SO.mb_nuong = +((SO.mb_nuong || 0) + c.width * c.height * 4 / 1048576).toFixed(2);
    return {img: c, sx: 0, sy: 0, sw: c.width, sh: c.height, w: o.w, h: o.h, ax: 0, ay: 0, X0, Y0};
  }

  function ve(lop, ox, oy) {
    if (!bat || !M.ctx) return;
    const ctx = M.ctx;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    for (const d of Object.values(DL)) for (const it of d.dat || []) {
      if (it.lop !== lop) continue;
      if (it.giai === 'mep') { veMep(it, ox, oy); continue; }
      if (it.giai === 'van-day') { veVanDay(it, ox, oy); continue; }
      const o = chon(it.o, it.x, it.y); if (!o) continue;
      const X = it.x - ox; if (X + o.w < -4 || X - o.w > M.W + 4) continue;
      if (it.al !== undefined) ctx.globalAlpha = it.al;
      if (it.cat === 'dac') { if (!it.nuong) it.nuong = nuongDac(it, o); const n = it.nuong; veO(n, n.X0, n.Y0, 0, ox, oy); }
      else if (Array.isArray(it.cat)) { ctx.save(); ctx.beginPath(); ctx.rect(it.cat[0] - ox, it.cat[1] - oy, it.cat[2] - it.cat[0], it.cat[3] - it.cat[1]); ctx.clip(); veO(o, it.x, it.y, it.lat, ox, oy); ctx.restore(); }
      else veO(o, it.x, it.y, it.lat, ox, oy);
      ctx.globalAlpha = 1;
    }
  }
  /* nướng sẵn mọi mảnh 'dac' (gọi ở màn nạp, sau khoiTao, để lần vẽ đầu không khựng) */
  function nuong() { for (const d of Object.values(DL)) for (const it of d.dat || []) if (it.cat === 'dac' && !it.nuong) { const o = chon(it.o, it.x, it.y); if (o) it.nuong = nuongDac(it, o); } }

  /* tiền cảnh rễ-đá: cuộn 1,05 so với camera, neo theo mép trái / phải của phòng; vẽ SAU nhân vật */
  function veTienCanh(ox, oy) {
    if (!bat || !M.ctx) return;
    const L = O['tien-canh-trai'], R = O['tien-canh-phai']; if (!L || !R) return;
    const ctx = M.ctx, K = 1.05; ctx.imageSmoothingEnabled = true;
    for (const d of Object.values(DL)) for (const p of d.tien_canh || []) {
      const Y = (p.tren || 0) - oy * K, k = p.k || 1, LW = L.w * k, LH = L.h * k, RW = R.w * k, RH = R.h * k;
      const XL = (p.x0 - ox) * K;                                   // mép trái phòng
      if (XL < M.W && XL + LW > 0) ctx.drawImage(L.img, L.sx, L.sy, L.sw, L.sh, XL, Y, LW, LH);
      const XR = M.W + (p.x1 - M.W - ox) * K;                        // mép phải phòng (khi camera ở cuối phòng thì sát mép phải màn)
      if (XR - RW < M.W && XR > 0) ctx.drawImage(R.img, R.sx, R.sy, R.sw, R.sh, XR - RW, Y, RW, RH);
    }
  }

  /* overlay collider địa hình (để duyệt): ô chặn = vàng đặc mờ + viền; bệ một chiều = vạch lục dày ở mép trên */
  function veCollider(ox, oy) {
    const ctx = M.ctx, T = M.T, t = M.tile, R = M.solid;
    const tx0 = Math.max(0, Math.floor(ox / T)), tx1 = Math.floor((ox + M.W) / T), ty0 = Math.max(0, Math.floor(oy / T)), ty1 = Math.floor((oy + M.H) / T);
    ctx.save(); ctx.lineWidth = 1;
    for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
      const c = t(tx, ty), X = tx * T - ox, Y = ty * T - oy;
      if (R(c)) {
        ctx.globalAlpha = 0.22; ctx.fillStyle = c === 'S' ? '#9ec8ff' : '#ffd25a'; ctx.fillRect(X, Y, T, T); ctx.globalAlpha = 0.55;
        ctx.strokeStyle = c === 'S' ? '#9ec8ff' : '#ffd25a'; ctx.strokeRect(X + 0.5, Y + 0.5, T - 1, T - 1);
        // cạnh lộ: nét đậm (mặt có thể đứng / tường)
        ctx.globalAlpha = 1; ctx.lineWidth = 2; ctx.strokeStyle = '#ff7a1a'; ctx.beginPath();
        if (!R(t(tx, ty - 1)) && ty > 0) { ctx.moveTo(X, Y + 1); ctx.lineTo(X + T, Y + 1); }
        if (!R(t(tx, ty + 1))) { ctx.moveTo(X, Y + T - 1); ctx.lineTo(X + T, Y + T - 1); }
        if (!R(t(tx - 1, ty))) { ctx.moveTo(X + 1, Y); ctx.lineTo(X + 1, Y + T); }
        if (!R(t(tx + 1, ty))) { ctx.moveTo(X + T - 1, Y); ctx.lineTo(X + T - 1, Y + T); }
        ctx.stroke(); ctx.lineWidth = 1;
      } else if (c === '=') {
        ctx.globalAlpha = 0.35; ctx.fillStyle = '#7dffb0'; ctx.fillRect(X, Y, T, 11); ctx.globalAlpha = 1;
        ctx.lineWidth = 3; ctx.strokeStyle = '#19e36a'; ctx.beginPath(); ctx.moveTo(X, Y + 1.5); ctx.lineTo(X + T, Y + 1.5); ctx.stroke(); ctx.lineWidth = 1;
      }
    }
    ctx.restore();
  }

  return {khoiTao, them, nap, anO, nuong, ve, veTienCanh, veCollider, bam, chon, O, DL, HO,
    get so() { return SO; }, get meta() { return META; }, get bat() { return bat; }, set bat(v) { bat = !!v; }};
})();
