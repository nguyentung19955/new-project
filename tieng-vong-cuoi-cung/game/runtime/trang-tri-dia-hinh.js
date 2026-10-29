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
              ván 'be-van-day-<số ô>' + 2 dây 'day-treo' xếp từ nút buộc lên quá mép trên màn (cùng hệ toạ độ camera, không parallax);
              xa: tên ô XÀ MÓC DÂY (v4, 'xa-day-<số ô>', 2 dây cách đúng 2 dây ván), xa_y: y thế giới của đáy đoạn dây xà → dây chỉ xếp
              tới đó rồi vẽ xà đè lên (nối dây vào dây rủ của xà; xà bám mép trên màn, không phải mặt đứng)
        giai 'mep' + kieu: 'da' → dùng bộ mép ĐÁ rêu v4 ('mep-da-<bộ>-…', cho khối đá) thay mép đất
     cong: true   → màn có cổng: nạp thêm 5 ô cổng rễ cây 'cong-re-*' (game gọi TT.veCong thay cổng gỗ)
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
     TT.veCong(px, yChan, o, lvl, ox, oy)             CỔNG RỄ CÂY (v4): px = tâm cổng, yChan = sàn, o = tiến độ mở 0..1 (0 = đóng: rễ đan
                                                      + 2 trụ; 0<o<1: rễ giữa bóp ngang về 2 trụ + mờ dần, trụ bản đóng mờ dần lộ trụ đơn;
                                                      1 = chỉ 2 trụ đơn), lvl = độ sáng mắt ngọc 0..1 (đèn báo). Trả false nếu chưa có ô
     MÀN RỄ RỦ (PH15, 29/10): nếu cạnh JSON atlas có man-re.json (+ man-re-3x.png, art/huong-moi/dia-hinh/code/tao-man-re.py) thì TT.veCong vẽ
                                                      MÀN RỄ RỦ TỪ TRẦN (xem veManRe) – ưu tiên hơn cổng dọc. ?cong=cu = cổng dọc · ?cong=ngang = cổng rễ ngang.
     CỔNG DỌC (29/10): nếu cạnh JSON atlas có cong-doc.json (+ cong-doc-3x.png, art/huong-moi/dia-hinh/code/tao-cong-doc.py) thì TT.veCong
                                                      vẽ CỔNG DỌC thay cổng rễ ngang: giữa = cánh rễ đan + khoá chuông (mở: khung rễ + lối tối), hai bên =
                                                      khối rễ đan không khoá (phủ đủ bề ngang hộp chặn 183 – không có "tường vô hình"). Đóng → mở (o 0 → 1, game
                                                      cộng 0,07/bước ≈ 15 bước): cánh giữa TÁCH ĐÔI, mỗi nửa bóp về mép ngoài + mờ; hai khối bên RÚT XUỐNG ĐẤT; lối
                                                      tối hiện dần; hết ở o = 0,7 (đi xuyên từ 0,6 – luật cũ). Đèn báo lvl = loé xanh ngọc ở khoá chuông.
                                                      Hộp chặn KHÔNG đổi (game giữ GATE). ?cong=cu = cổng rễ ngang cũ để so.
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
  let CD = null;                     // cổng dọc: {img, m (cong-doc.json)}
  let MR = null;                     // màn rễ rủ (PH15 mục 4): {img, m (man-re.json)} – mặc định khi có
  // 29/10 PH15: ?cong=cu = KIỂU CŨ ngay trước (cổng dọc) · ?cong=ngang = cổng rễ ngang v4 (trước 29/10 ?cong=cu là cổng ngang)
  const CONG_Q = typeof location !== 'undefined' ? ((location.search.match(/[?&]cong=([a-z]+)/) || [])[1] || '') : '';
  const CONG_CU = CONG_Q === 'ngang';
  const CONG_O = ['cong-re-dong-trai', 'cong-re-dong-giua', 'cong-re-dong-phai', 'cong-re-tru-trai', 'cong-re-tru-phai'];

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
      for (const it of d.dat || []) for (const k of (it.giai === 'mep' ? [1, 2].flatMap(b => ['trai', 'giua', 'phai'].map(v => 'mep-' + (it.kieu === 'da' ? 'da-' : '') + b + '-' + v))
                                                : it.giai === 'van-day' ? ['be-van-day-' + Math.round((it.x1 - it.x0) / M.T), 'day-treo'].concat(it.xa ? [it.xa] : []) : oCua(it.o)))
        { if (!meta.o[k]) throw new Error('trang trí: thiếu ô ' + k + ' trong atlas'); can.add(meta.o[k].anh); }
      if ((d.tien_canh || []).length) { can.add(meta.o['tien-canh-trai'].anh); can.add(meta.o['tien-canh-phai'].anh); }
      if (d.cong) for (const k of CONG_O) { if (!meta.o[k]) throw new Error('trang trí: thiếu ô cổng ' + k); can.add(meta.o[k].anh); }
    }
    const tep = [...can]; let i = 0; const IMG = {}; let px = 0;
    for (const t of tep) {
      const co = Object.values(meta.anh).find(a => a.tep === t); if (!co) throw new Error('trang trí: JSON không có atlas ' + t);
      const im = await decode(nhung ? nhung.anh[t] : goc + t, t);
      if (im.naturalWidth !== co.co_anh[0] || im.naturalHeight !== co.co_anh[1]) throw new Error('ảnh ' + t + ' cỡ ' + im.naturalWidth + '×' + im.naturalHeight + ' ≠ ' + co.co_anh.join('×'));
      if (t.replace(/^.*\//, '').startsWith('tien-canh')) {   // tiền cảnh: thu ½ vào canvas (bóng rễ tối, đỡ bộ nhớ) – vẽ ở cỡ logic
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
        day: v.day ? v.day.map(d => [d[0] / B, d[1] / B]) : null, mat: v.mat || null};   // mat: [x, y, r] mắt ngọc (logic, so với neo)
      const h = ten.replace(/-\d+(?=-|$)/, ''); (HO[h] = HO[h] || []).push(ten);   // 'mang-go-3' → họ 'mang-go'; 'chan-re-1-thap' → 'chan-re-thap'
    }
    if (!nhung && !CONG_CU && CONG_Q !== 'cu' && Object.values(DL).some(d => d.cong)) {   // màn rễ rủ PH15 (thiếu / lỗi → cổng dọc)
      try { const r = await fetch(goc + 'man-re.json', {cache: 'no-cache'}); if (r.ok) { const m = await r.json(); const im = await decode(goc + m.anh, m.anh);
        if (im.naturalWidth === m.co_anh[0] && im.naturalHeight === m.co_anh[1]) { MR = {img: im, m}; px += im.naturalWidth * im.naturalHeight; tep.push(m.anh); } } }
      catch (e) { console.warn('TT: không nạp được màn rễ rủ → cổng dọc', e); }
    }
    if (!MR && !nhung && !CONG_CU && Object.values(DL).some(d => d.cong)) {   // cổng dọc 29/10 (thiếu / lỗi → cổng rễ ngang cũ)
      try { const r = await fetch(goc + 'cong-doc.json', {cache: 'no-cache'}); if (r.ok) { const m = await r.json(); const im = await decode(goc + m.anh, m.anh);
        if (im.naturalWidth === m.co_anh[0] && im.naturalHeight === m.co_anh[1]) { CD = {img: im, m}; px += im.naturalWidth * im.naturalHeight; tep.push(m.anh); } } }
      catch (e) { console.warn('TT: không nạp được cổng dọc → cổng rễ cũ', e); }
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
    const ctx = M.ctx, B = it.bo || (bam(Math.floor(it.x0 / M.T), Math.floor(it.y / M.T)) < 0.5 ? 1 : 2), P = 'mep-' + (it.kieu === 'da' ? 'da-' : '') + B;
    const L = O[P + '-trai'], G = O[P + '-giua'], R = O[P + '-phai']; if (!L || !G || !R) return;
    const x0 = it.x0, x1 = it.x1, y = it.y, w = x1 - x0, TR = it.kieu === 'da' ? 4 : 2;   // mép đá: rêu + lá nhô tối đa 4 px (mặt rêu ở +1)
    if (x1 - ox < -20 || x0 - ox > M.W + 20 || y - oy > M.H || y + 60 - oy < 0) return;
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10 - ox, y - TR - oy, w + 20, 60); ctx.clip();
    const lw = it.trai ? L.w - L.ax : 0, rw = it.phai ? R.ax : 0;   // bề rộng phần nắp nằm TRÊN mặt (từ neo tới đầu trong)
    if (it.trai && it.phai && lw + rw >= w) {                       // ngắn: 2 nắp gối nhau, cắt mỗi nắp ở giữa dải
      ctx.save(); ctx.beginPath(); ctx.rect(x0 - 10 - ox, y - TR - oy, w / 2 + 3 + 10, 60); ctx.clip(); veO(L, x0, y, 0, ox, oy); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(x0 + w / 2 - 3 - ox, y - TR - oy, w / 2 + 3 + 10, 60); ctx.clip(); veO(R, x1, y, 0, ox, oy); ctx.restore();
    } else {
      let x = x0;
      if (it.trai) { veO(L, x0, y, 0, ox, oy); x = x0 + lw - 3; }
      const xe = it.phai ? x1 - rw + 3 : x1;
      ctx.save(); ctx.beginPath(); ctx.rect(x - ox, y - TR - oy, xe - x, 60); ctx.clip();
      for (let i = 0; x < xe; x += G.w - 4, i++) veO(G, x, y, i & 1, ox, oy);
      ctx.restore();
      if (it.phai) veO(R, x1, y, 0, ox, oy);
    }
    ctx.restore();
  }

  /* bệ ván treo dây: ván 'be-van-day-<n>' neo (mép trái collider, mặt ván); từ chân mỗi dây (o.day) xếp ô 'day-treo' (lặp dọc liền)
     đi LÊN tới quá mép trên màn. Mặt ván = đúng mặt collider '='; nút buộc 2 đầu nhô lên ~9 px là DÂY (không phải mặt đứng). */
  function veVanDay(it, ox, oy) {
    const n = Math.round((it.x1 - it.x0) / M.T), o = O['be-van-day-' + n], D = O['day-treo'], XA = it.xa ? O[it.xa] : null; if (!o || !D) return;
    if (it.x1 - ox < -40 || it.x0 - ox > M.W + 40 || it.y - oy > M.H + 40) return;
    const ctx = M.ctx, yTren = XA ? it.xa_y - 6 : -1e9;          // có xà: dây chỉ xếp tới đáy đoạn dây xà (chồng 6 px, xà vẽ đè lên)
    for (const [dx, dy] of o.day || []) {
      let y = it.y + dy;                                         // chân dây (nút buộc)
      for (let i = 0; i < 40 && y - oy > -2 && y > yTren; i++, y -= D.h - 0.5) {
        const h = XA ? Math.min(D.h, y - yTren) : D.h;           // ô cuối cắt bớt cho vừa tới xà
        ctx.drawImage(D.img, D.sx, D.sy + (D.h - h) * (D.sh / D.h), D.sw, h * (D.sh / D.h), it.x0 + dx - D.ax - ox, y - h - oy, D.w, h);
      }
    }
    if (XA) veO(XA, it.x0 + o.day[0][0], it.xa_y, 0, ox, oy);   // neo xà = (tâm dây trái, đáy đoạn dây xà); 2 dây xà cách đúng 2 dây ván
    veO(o, it.x0, it.y, 0, ox, oy);
  }

  /* CỔNG RỄ CÂY (v4): px = tâm cổng (thế giới), yChan = sàn, o = tiến độ mở 0..1, lvl = độ sáng mắt ngọc 0..1.
     Đóng: rễ đan giữa + 2 trụ bản đóng (một ảnh gen cắt 3). Mở dần: trụ đơn vẽ dưới, trụ bản đóng mờ dần (rễ bám trụ "rút" đi);
     rễ giữa tách đôi, mỗi nửa bóp ngang về trụ của nó + mờ dần, hết hẳn ở o = 0,7 (cổng đi xuyên được từ 0,6). Mở hẳn: chỉ 2 trụ đơn.
     Mắt ngọc = đèn báo: phủ tối khi lvl < 1, loé xanh ngọc (cộng sáng) theo lvl. Hình không có va chạm (hộp chặn do game giữ). */
  function veCong(px, yChan, o, lvl, ox, oy) {
    if (bat && MR) return veManRe(px, yChan, o, lvl, ox, oy);
    if (bat && CD) return veCongDoc(px, yChan, o, lvl, ox, oy);
    const L = O['cong-re-dong-trai'], R = O['cong-re-dong-phai'], G = O['cong-re-dong-giua'], TL = O['cong-re-tru-trai'], TR = O['cong-re-tru-phai'];
    if (!bat || !L || !R || !G || !TL || !TR) return false;
    const ctx = M.ctx, X = px - ox, Y = yChan - oy; if (X < -140 || X > M.W + 140) return true;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    o = Math.min(1, Math.max(0, o)); lvl = Math.min(1, Math.max(0, lvl || 0));
    const s = Math.max(0, 1 - o / 0.7);
    if (o > 0) { veO(TL, px, yChan, 0, ox, oy); veO(TR, px, yChan, 0, ox, oy); }
    if (o < 1) { ctx.globalAlpha = 1 - o; veO(L, px, yChan, 0, ox, oy); veO(R, px, yChan, 0, ox, oy); ctx.globalAlpha = 1; }
    if (s > 0) {
      const hw = G.sw / 2, w = Math.max(0.5, G.w / 2 * s), x0 = X - G.ax, y0 = Y - G.ay;
      ctx.globalAlpha = s;
      ctx.drawImage(G.img, G.sx, G.sy, hw, G.sh, x0, y0, w, G.h);                 // nửa trái: neo mép trái (sát trụ trái)
      ctx.drawImage(G.img, G.sx + hw, G.sy, hw, G.sh, x0 + G.w - w, y0, w, G.h);  // nửa phải: neo mép phải
      ctx.globalAlpha = 1;
    }
    const nh = 0.85 + 0.15 * Math.sin(performance.now() / 180);
    for (const [A, B] of [[L, TL], [R, TR]]) {
      if (!A.mat || !B.mat) continue;
      const ex = X + A.mat[0] * (1 - o) + B.mat[0] * o, ey = Y + A.mat[1] * (1 - o) + B.mat[1] * o, r = (A.mat[2] + B.mat[2]) / 2 + 0.5;
      if (lvl < 1) {   // tắt: phủ tối cả viên ngọc lẫn quầng sáng vẽ sẵn trong ảnh (bán kính ≈ 2,3 lõi) → mắt "ngủ", xám xanh
        ctx.globalAlpha = 0.66 * (1 - lvl); ctx.fillStyle = '#16292a'; ctx.beginPath(); ctx.arc(ex, ey, r * 2.3, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
      if (lvl > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(ex, ey, 1, ex, ey, r * 3.6);
        g.addColorStop(0, 'rgba(170,255,225,' + (0.75 * lvl * nh).toFixed(3) + ')'); g.addColorStop(0.35, 'rgba(90,230,180,' + (0.35 * lvl * nh).toFixed(3) + ')'); g.addColorStop(1, 'rgba(60,200,150,0)');
        ctx.fillStyle = g; ctx.fillRect(ex - r * 3.6, ey - r * 3.6, r * 7.2, r * 7.2); ctx.restore();
      }
    }
    return true;
  }

  /* MÀN RỄ RỦ (PH15 mục 4, 29/10) – THAY cổng dọc: KHÔNG khung / cột / ngưỡng. Bộ mảnh man-re.json (art/huong-moi/dia-hinh/code/tao-man-re.py):
     BÚI rễ bám TRẦN ngay trên hộp chặn + 7 DẢI rễ (đầu trên phẳng, giấu sau búi) phủ toàn bề ngang hộp 183 + 4 ĐẦU rễ cong ở chân dải lớp trước.
     Dải chỉ DỊCH dọc (không scaleY) + CẮT ở trần (y = tran) → rút lên là chui sau búi / vào trần. Hộp chặn + luật GIỮ NGUYÊN (game GATE):
     mở +0,07/bước (≈ 15 bước), ĐI XUYÊN từ o ≥ 0,6 (bước 9); đóng −0,08/bước, đặc lại khi o < 0,6; Lam đứng trong hộp → game giữ o = 0,6 (không
     đóng sập lên người) → màn rễ dừng ở thế "ló" dưới búi (chân dải ≥ 120 px trên sàn, trên đầu Lam) – không vẽ rễ xuyên người.
     THU LÊN (o tăng): búi SIẾT nhẹ (o 0 → 0,14) → đầu rễ nhấc khỏi sàn (o 0,07 → 0,16) → dải kéo lên, lệch pha ít (0,04) → mọi chân dải ≥ 120 px trên sàn
                       ĐÚNG lúc o = 0,6 (mốc đi xuyên: đủ lối cả bề ngang) → rút hết sau búi (0,6 → 0,84) → búi nhả + lắc nhỏ tắt dần (sau khi mở hẳn).
     RỦ XUỐNG (o giảm, c = 1 − o): búi CO nhẹ 2 bước (c 0 → 0,16) → dải ló dưới búi (0,16 → 0,4, giữa trước) → rơi xuống sàn (giữa trước, hai mép trễ 1–3 bước:
                       c 0,4 + 0,24·pha → 0,76 + 0,24·pha) → lắc nhỏ tắt dần (~0,5 s) sau khi đóng hẳn.
     Đổi chiều giữa chừng → mỗi dải đuổi tới vị trí mới với tốc độ giới hạn (không nhảy hình). Tín hiệu (lvl): khoá đồng nhỏ CỐ ĐỊNH trên búi, loé ĐỒNG / NGÀ
     (không teal). ?cong=cu = cổng dọc (kiểu ngay trước) · ?cong=ngang = cổng rễ ngang v4. */
  const MR_TT = {}; const MR_DO = {};
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function veManRe(px, yChan, o, lvl, ox, oy) {
    const ctx = M.ctx, m = MR.m, B = m.boi, X = px - ox, Y = yChan - oy;
    o = Math.min(1, Math.max(0, o)); lvl = Math.min(1, Math.max(0, lvl || 0));
    const now = performance.now();
    const st = MR_TT[px] || (MR_TT[px] = {o, dir: 0, mut: o <= 0 ? 0 : o >= 1 ? 1 : -1, tMut: -1e9, tVe: now, day: null});
    if (o < st.o - 1e-6) st.dir = -1; else if (o > st.o + 1e-6) st.dir = 1;
    const mut = o <= 0 ? 0 : o >= 1 ? 1 : -1;
    if (mut !== st.mut) { st.mut = mut; if (mut >= 0) st.tMut = now; }
    st.o = o; const dt = Math.min(0.1, Math.max(0, (now - st.tVe) / 1000)); st.tVe = now;
    const D = m.dai, AN = m.tran - 2, LO = -120;   // AN: chân dải khi rút hết (trên trần → bị cắt hết); LO: thế ló dưới búi
    const c = 1 - o, dong = st.dir < 0;
    // chân dải (y logic so với sàn, 0 = chạm sàn) theo chiều đang chạy
    const muc = D.map(d => {
      const p = d.pha;
      if (dong) {
        if (c < 0.4 + 0.24 * p) return AN + (LO - AN) * sm(0.16 + 0.06 * p, 0.4, c);
        const t = Math.min(1, Math.max(0, (c - 0.4 - 0.24 * p) / 0.36)); return LO * (1 - t * t * (3 - 2 * t));
      }
      const q = 0.04 * p;
      if (o < 0.6) return -8 * sm(0.07 + q, 0.16 + q, o) + (-112) * sm(0.16 + q, 0.56 + q, o);
      return LO + (AN - LO) * sm(0.6, 0.84, o);
    });
    if (!st.day) st.day = muc.slice();
    const vmax = 2400 * Math.max(dt, 1 / 60);   // px logic / s – chỉ chạm tới khi đổi chiều giữa chừng
    for (let i = 0; i < muc.length; i++) { const d = muc[i] - st.day[i]; st.day[i] += Math.abs(d) <= vmax ? d : Math.sign(d) * vmax; }
    if (o <= 0 || o >= 1) st.day = muc.slice();   // đầu mút: đúng vị trí
    MR_DO[px] = {o: +o.toFixed(3), chieu: st.dir, chan_thap_nhat: +Math.max(...st.day).toFixed(1), chan_cao_nhat: +Math.min(...st.day).toFixed(1)};
    if (X < -170 || X > M.W + 170) return true;
    // lắc tắt dần: sau khi ĐÓNG hẳn → dải đung đưa quanh đỉnh; sau khi MỞ hẳn → búi nhún nhẹ
    const tl = (now - st.tMut) / 1000, lac = st.mut >= 0 && tl < 1.2 ? Math.exp(-tl / 0.22) : 0;
    const q = dong ? sm(0, 0.16, c) * (1 - sm(0.3, 0.55, c)) : sm(0, 0.14, o) * (1 - sm(0.75, 1, o));   // búi siết / co
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    // dải: cắt từ trần xuống sàn; lớp sau trước, lớp trước sau; đầu rễ vẽ ngay trước dải của nó
    ctx.save(); ctx.beginPath(); ctx.rect(X - 140, Y + m.tran, 280, -m.tran + 0.5); ctx.clip();
    for (const lop of ['sau', 'truoc']) for (let i = 0; i < D.length; i++) {
      const d = D[i]; if (d.lop !== lop) continue;
      const day = st.day[i]; if (day <= m.tran) continue;
      const goc = st.mut === 0 ? lac * 0.016 * Math.sin(tl * 2 * Math.PI / 0.34 + i * 1.7) : 0;   // ±0,9° quanh đỉnh dải
      ctx.save(); ctx.translate(X + d.x, Y + day - d.h); if (goc) ctx.rotate(goc);
      if (d.dau !== null && d.dau !== undefined) { const u = m.dau[d.dau];
        ctx.save(); ctx.translate(0, d.h - u.h);
        if (d.dau_lat) { ctx.scale(-1, 1); }
        ctx.drawImage(MR.img, u.khung[0], u.khung[1], u.khung[2], u.khung[3], -u.gan[0], 0, u.w, u.h); ctx.restore(); }
      ctx.drawImage(MR.img, d.khung[0], d.khung[1], d.khung[2], d.khung[3], -d.w / 2, 0, d.w, d.h);
      ctx.restore();
    }
    ctx.restore();
    // búi trần: siết = co ngang 3 % + nâng 1,5 px quanh giữa đỉnh; lắc sau khi mở hẳn
    const b = m.bui, bx = X + b.x + b.w / 2, by = Y + b.y;
    ctx.save(); ctx.translate(bx, by - 1.5 * q + (st.mut === 1 ? lac * 1.2 * Math.sin(tl * 2 * Math.PI / 0.3) : 0));
    if (st.mut === 1 && lac) ctx.rotate(lac * 0.006 * Math.sin(tl * 2 * Math.PI / 0.36 + 0.8));
    ctx.scale(1 - 0.03 * q, 1 - 0.05 * q);
    ctx.drawImage(MR.img, b.khung[0], b.khung[1], b.khung[2], b.khung[3], -b.w / 2, 0, b.w, b.h);
    // khoá đồng nhỏ cố định trên búi = đèn báo: tối khi chưa đủ điều kiện, loé đồng / ngà ấm theo lvl, sáng đủ khi mở
    const ex = 0, ey = 22, dl = o > 0 ? Math.max(lvl, Math.min(1, o / 0.6)) : lvl;
    ctx.fillStyle = 'rgba(40,28,16,0.95)'; ctx.beginPath(); ctx.arc(ex, ey, 3.6, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(150,104,52,1)'; ctx.beginPath(); ctx.arc(ex, ey, 2.5, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(40,28,16,0.9)'; ctx.fillRect(ex - 0.6, ey - 0.6, 1.2, 2.2);
    if (dl > 0) { const nh = 0.88 + 0.12 * Math.sin(now / 260), g = ctx.createRadialGradient(ex, ey, 0.5, ex, ey, 12);
      ctx.globalCompositeOperation = 'lighter';
      g.addColorStop(0, 'rgba(255,236,196,' + (0.78 * dl * nh).toFixed(3) + ')'); g.addColorStop(0.45, 'rgba(214,160,92,' + (0.34 * dl * nh).toFixed(3) + ')'); g.addColorStop(1, 'rgba(180,120,60,0)');
      ctx.fillStyle = g; ctx.fillRect(ex - 12, ey - 12, 24, 24); ctx.globalCompositeOperation = 'source-over'; }
    ctx.restore();
    ctx.restore();
    return true;
  }

  /* CỔNG DỌC (29/10) – xem chú thích API. Neo mọi khối = giữa đáy; px, yChan, ox, oy logic. */
  function veCongDoc(px, yChan, o, lvl, ox, oy) {
    const ctx = M.ctx, m = CD.m, B = m.boi, G = m.o.dong, Om = m.o.mo, Be = m.o.ben, ch = m.xep.chong;
    const X = px - ox, Y = yChan - oy; if (X < -160 || X > M.W + 160) return true;
    o = Math.min(1, Math.max(0, o)); lvl = Math.min(1, Math.max(0, lvl || 0));
    const s = Math.max(0, 1 - o / 0.7);                       // phần còn lại của rễ đóng (1 = đóng hẳn, 0 = đã tách / rút hết)
    const ve = (k, sx, sw, dx, dy, dw, dh) => ctx.drawImage(CD.img, k.khung[0] + sx * B, k.khung[1], sw * B, k.khung[3], dx, dy, dw, dh);
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    // PH14 mục 4: cổng mở phải đọc TOÀN BỀ NGANG collider là lối trống → BỎ khung hẹp giữa ("mo": lối tối có khung) khi mở; chỉ còn HAI TRỤ NGOÀI.
    // ?congmo=cu = như trước (khung giữa còn khi mở) để so. Collider + luật mở KHÔNG đổi.
    const CU = /[?&]congmo=cu/.test(location.search);
    if (CU && o > 0) { ctx.globalAlpha = Math.min(1, o / 0.35); ve(Om, 0, Om.w, X - Om.w / 2, Y - Om.h, Om.w, Om.h); }   // (cũ) lối tối hiện dần
    if (!CU) {
      // hai trụ ngoài: lát mép ngoài của khối bên (rễ dọc + rêu), mép trong trùng mép hộp chặn (hop_chan x −89 … +94) – luôn hiện, đóng lẫn mở
      const hc = m.hop_chan || {x: -89, w: 183}, tw = 15, th = 172, xl = X + hc.x - tw + 4, xr = X + hc.x + hc.w - 4;
      ctx.globalAlpha = 1;
      ve(Be, 0, tw, xl, Y - th, tw, th);
      ctx.save(); ctx.translate(xr + tw, 0); ctx.scale(-1, 1); ve(Be, 0, tw, 0, Y - th, tw, th); ctx.restore();
      // đèn báo ĐỒNG / NGÀ ẤM trên hai trụ (teal dành riêng cho Vọng / ký ức): sáng theo lvl khi đóng, sáng đủ khi đã mở
      const dl = o > 0 ? Math.max(lvl, Math.min(1, o / 0.7)) : lvl;
      for (const ex of [xl + tw / 2, xr + tw / 2]) {
        const ey = Y - 128; ctx.fillStyle = 'rgba(58,40,22,0.95)'; ctx.beginPath(); ctx.arc(ex, ey, 3.2, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(176,120,62,1)'; ctx.beginPath(); ctx.arc(ex, ey, 2.2, 0, 7); ctx.fill();
        if (dl > 0) { const nh = 0.88 + 0.12 * Math.sin(performance.now() / 260), g = ctx.createRadialGradient(ex, ey, 0.5, ex, ey, 11);
          ctx.globalCompositeOperation = 'lighter';
          g.addColorStop(0, 'rgba(255,236,196,' + (0.75 * dl * nh).toFixed(3) + ')'); g.addColorStop(0.45, 'rgba(214,160,92,' + (0.32 * dl * nh).toFixed(3) + ')'); g.addColorStop(1, 'rgba(180,120,60,0)');
          ctx.fillStyle = g; ctx.fillRect(ex - 11, ey - 11, 22, 22); ctx.globalCompositeOperation = 'source-over'; }
      }
    }
    if (s > 0) {
      // hai khối bên: rút xuống đất (cắt ở mặt sàn) + mờ
      const lun = (1 - s) * Be.h, xl = X - G.w / 2 + ch - Be.w, xr = X + G.w / 2 - ch;
      ctx.save(); ctx.beginPath(); ctx.rect(X - 200, Y - 400, 400, 400); ctx.clip(); ctx.globalAlpha = Math.min(1, s * 1.3);
      ve(Be, 0, Be.w, xl, Y - Be.h + lun, Be.w, Be.h);
      ctx.translate(xr + Be.w, 0); ctx.scale(-1, 1); ve(Be, 0, Be.w, 0, Y - Be.h + lun, Be.w, Be.h); ctx.restore();
      // cánh giữa: đóng hẳn → nguyên; đang mở → tách đôi, mỗi nửa bóp về mép ngoài + dạt ra + mờ
      const hw = G.w / 2, w = hw * s, dat = (1 - s) * 5, x0 = X - hw, y0 = Y - G.h;
      ctx.globalAlpha = o > 0 ? Math.min(1, s * 1.2) : 1;
      if (o <= 0) ve(G, 0, G.w, x0, y0, G.w, G.h);
      else { ve(G, 0, hw, x0 - dat, y0, w, G.h); ve(G, hw, hw, x0 + G.w - w + dat, y0, w, G.h); }
      // đèn báo: loé xanh ngọc ở khoá chuông theo lvl (điều kiện đã xong / tổng); mờ theo cánh
      if (lvl > 0 && m.khoa) {
        const ex = X + m.khoa.x, ey = Y + m.khoa.y, r = Math.max(3, m.khoa.r), nh = 0.85 + 0.15 * Math.sin(performance.now() / 180);
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = s;
        const g = ctx.createRadialGradient(ex, ey, 0.5, ex, ey, r * 3.4);
        if (CU) { g.addColorStop(0, 'rgba(170,255,225,' + (0.7 * lvl * nh).toFixed(3) + ')'); g.addColorStop(0.4, 'rgba(90,230,180,' + (0.3 * lvl * nh).toFixed(3) + ')'); g.addColorStop(1, 'rgba(60,200,150,0)'); }
        else { g.addColorStop(0, 'rgba(255,236,196,' + (0.7 * lvl * nh).toFixed(3) + ')'); g.addColorStop(0.4, 'rgba(214,160,92,' + (0.3 * lvl * nh).toFixed(3) + ')'); g.addColorStop(1, 'rgba(180,120,60,0)'); }   // PH14: đồng / ngà ấm
        ctx.fillStyle = g; ctx.fillRect(ex - r * 3.4, ey - r * 3.4, r * 6.8, r * 6.8); ctx.globalCompositeOperation = 'source-over';
      }
    }
    ctx.restore();
    return true;
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

  return {khoiTao, them, nap, anO, nuong, ve, veTienCanh, veCollider, veCong, bam, chon, O, DL, HO,
    get so() { return SO; }, get meta() { return META; }, get bat() { return bat; }, get congDoc() { return CD ? CD.m : null; }, get manRe() { return MR ? MR.m : null; },
    get manReDo() { return MR_DO; }, set bat(v) { bat = !!v; }};
})();
