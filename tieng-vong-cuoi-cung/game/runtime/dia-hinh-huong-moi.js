/* ======================= ĐỊA HÌNH + NỀN HƯỚNG MỚI (28/10/2026) – module DHM =======================
   Theo art/huong-moi/TU-VAN-CHUYEN-GIA-3-MOI-TRUONG-PHONG-A-F.md, "THỨ TỰ THỰC HIỆN" bước đầu: nền xa mới + thân đất mới cho một phòng.
   Ảnh: art/huong-moi/dia-hinh/ (sinh bởi code/tao.py từ art/huong-moi/nguon/). Ảnh 2x: px ảnh = logic × 2.

   LUẬT (game/kiem-thu-trang-tri-v4/GHI-CHU.md): collider KHÔNG đổi (chỉ đọc lưới ô); rêu nhô ≤ 3 px trên mặt collider, mép đứng nhô ≤ 3 px;
   không có mặt đứng giả (mọi mặt trên vẽ đúng chỗ ô đặc có ô trống phía trên); vẽ cùng toạ độ camera (ox, oy) và làm tròn theo điểm ảnh thật
   như gạch cũ; chọn biến thể theo băm vị trí cố định (không ngẫu nhiên lúc chạy).

   Cách vẽ đất (mỗi ô đặc '#' / 'W' trong các cột được bật):
     1. THÂN: khối lặp liền 320×320 logic (4 mảnh thân 160 logic của ảnh gen, nối bằng mask) → cắt theo ô ở toạ độ thế giới (tx mod 10, ty mod 10).
        Không nén cả mảnh vào ô 32 (tư vấn mục 2).
     2. MẶT TRÊN: ô có ô trống phía trên → dải mặt trên (cao 100 logic, rêu nhô 3) cắt cột 32; đoạn giữa A / B (128 logic) theo băm
        floor(x / 128); hai đầu mọi đoạn chung khớp → thứ tự nào cũng liền. Dải bị cắt ở đáy khối (bệ mỏng). Đáy dải mờ dần vào thân.
     3. ĐẦU TRÁI / PHẢI: chỗ mặt trên hết (ô bên cạnh trống) → mảnh đầu 96 logic (mép đứng ảnh gen đã nắn thẳng), phía trong mờ dần
        phủ lên đoạn giữa. Mặt trên hết vì gặp tường (góc lõm) → cột cuối mờ dần vào thân tường.
     4. MÉP CŨ (tạm, chờ ảnh gen cạnh đứng / đáy theo prompt A): cạnh lộ còn lại (tường, đáy) dùng ô gạch CŨ đã chỉnh màu (HM), chỉ giữ dải
        mép ~10 logic sát cạnh lộ, mờ vào thân mới. Ô '=' (ván) và 'S' (đá) vẽ nguyên ô cũ đã chỉnh màu.
   Ảnh gen cạnh đứng / đáy / góc / ván về sau: khe trong dia-hinh.json → "khuon" (xem art/huong-moi/dia-hinh/khuon/KHUON.md).

   API:
     await DHM.nap(srcJson)                         nạp JSON + 5 ảnh, giải mã sẵn
     DHM.dung(opt)                                  dựng sẵn danh sách lệnh vẽ (1 lần sau khi lưới + atlas cũ sẵn sàng)
        opt = {T, ROWS, rows, WW, cot:[[c0,c1],…], tile(tx,ty), cuIdx(tx,ty) → chỉ số atlas cũ hoặc −1, cuK (chỉ số → [dx,dy]),
               cuTen (tên → chỉ số), cuImg (atlas cũ đã kéo mép, ô 64 tại [dx,dy]), trangTri:[{o, x, y}]}
     DHM.coCot(tx)                                  cột tx có vẽ bằng bộ mới không
     DHM.veDat(ctx, ox, oy, K, W, H, cuImg)          vẽ đất các cột được bật
     DHM.veNen(ctx, ox, oy, K, W, H, camx, rc, ch)   vẽ nền xa + nền giữa thưa (ch = cấu hình phòng: {giua:[{m, x}], sanY})
     DHM.taoDen(p, cao) / DHM.veDen(ctx, ox, oy, ds, frame)   đèn lồng cũ: giảm nét, thu cỡ, quầng nhỏ vẽ SAU địa hình + nhân vật
   Không xử lý điểm ảnh mỗi khung: mọi mask / giảm nét làm 1 lần lúc dựng. */
const DHM = (() => {
  const SO = {ms_nap: 0, ms_dung: 0, mb_anh: 0, lenh: 0, ve: 0};
  const IMG = {};
  let M = null, bat = false, COT = null, L = null, VIEN = null;

  function bam(x, y) { let h = Math.imul((x | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((y | 0) + 0x632be5ab, 0xc2b2ae35); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12;
    h = Math.imul(h, 0x297a2d39); h ^= h >>> 15; return (h >>> 0) % 1000 / 1000; }   // băm vị trí cố định (phân bố đều cả khi x liền nhau)
  function anh(src) {
    return new Promise((res, rej) => { const im = new Image(); im.onload = async () => { try { if (im.decode) await im.decode(); } catch (e) {} res(im); };
      im.onerror = () => rej(new Error('không tải được ' + src)); im.src = src; });
  }
  async function nap(srcJson) {
    const t0 = performance.now();
    const r = await fetch(srcJson, {cache: 'no-cache'}); if (!r.ok) throw new Error('lỗi mạng ' + r.status + ' khi tải ' + srcJson);
    M = await r.json(); const goc = srcJson.replace(/[^/]*$/, '');
    const ds = {xa: M.nen.xa, giua: M.nen.giua, mat: M.mat_tren, than: M.than, tt: M.trang_tri};
    let px = 0;
    await Promise.all(Object.entries(ds).map(async ([k, d]) => {
      const im = await anh(goc + d.tep);
      if (d.co_anh && (im.naturalWidth !== d.co_anh[0] || im.naturalHeight !== d.co_anh[1])) throw new Error('ảnh ' + d.tep + ' cỡ ' + im.naturalWidth + '×' + im.naturalHeight + ' ≠ ' + d.co_anh.join('×'));
      IMG[k] = im; px += im.naturalWidth * im.naturalHeight; }));
    SO.ms_nap = Math.round(performance.now() - t0); SO.mb_anh = +(px * 4 / 1048576).toFixed(1);
    bat = true; return SO;
  }

  /* ---------- dựng ---------- */
  const CHON = {'TBLR': 'than', 'BLR': 'tren-giua', 'TBR': 'canh-trai', 'TBL': 'canh-phai', 'TLR': 'day-giua', 'TR': 'day-trai', 'TL': 'day-phai',
    'TB': 'cot-than', 'T': 'cot-day', 'BR': 'tren-trai', 'BL': 'tren-phai', 'B': 'cot-tren', '': 'khoi', 'LR': 'noi-giua', 'R': 'noi-trai', 'L': 'noi-phai'};
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  /* mép cũ: ô atlas cũ (64 + kéo mép 2) → chỉ giữ dải sát các cạnh lộ (E: chuỗi 'L','R','B'), mờ vào trong */
  function vienCu(opt, E) {
    if (!VIEN) VIEN = {cv: canvas(16 * 68, 4 * 68), o: {}, n: 0};
    if (VIEN.o[E] !== undefined) return VIEN.o[E];
    const key = 'T' + (E.includes('B') ? '' : 'B') + (E.includes('L') ? '' : 'L') + (E.includes('R') ? '' : 'R');
    const ten = 'go-' + CHON[key], i = opt.cuTen[ten]; if (i === undefined) return (VIEN.o[E] = -1);
    const [dx, dy] = opt.cuK[i], c = canvas(68, 68), g = c.getContext('2d', {willReadFrequently: true});
    g.drawImage(opt.cuImg, dx - 2, dy - 2, 68, 68, 0, 0, 68, 68);
    const id = g.getImageData(0, 0, 68, 68), D = id.data, A = 10, B = 22;   // px 2x: giữ đủ tới 5 logic, hết ở 11 logic
    for (let y = 0; y < 68; y++) for (let x = 0; x < 68; x++) {
      const px = x - 2, py = y - 2; let d = 1e9;
      if (E.includes('L')) d = Math.min(d, px); if (E.includes('R')) d = Math.min(d, 63 - px); if (E.includes('B')) d = Math.min(d, 63 - py);
      let k = d <= A ? 1 : d >= B ? 0 : 1 - (d - A) / (B - A); k = k * k * (3 - 2 * k);
      if (E.includes('F')) k *= Math.max(0, Math.min(1, (py + 4) / 40));   // F: hiện dần từ trên (nối dưới mép đứng của mảnh đầu)
      const j = (y * 68 + x) * 4; D[j + 3] = D[j + 3] * k;
    }
    g.putImageData(id, 0, 0);
    const n = VIEN.n++, X = (n % 16) * 68, Y = Math.floor(n / 16) * 68;
    VIEN.cv.getContext('2d').drawImage(c, X, Y); VIEN.o[E] = [X + 2, Y + 2]; return VIEN.o[E];
  }
  /* cột cuối mặt trên gặp tường (góc lõm): bản cột đoạn giữa mờ dần về phía tường */
  const MO_CUOI = {};
  function cotMo(bien, u, phai) {
    const k = bien + u + (phai ? 'p' : 't'); if (MO_CUOI[k]) return MO_CUOI[k];
    const f = M.mat_tren.khung[bien], h = f[3], c = canvas(64, h), g = c.getContext('2d');
    g.drawImage(IMG.mat, f[0] + u * 2, f[1], 64, h, 0, 0, 64, h);
    g.globalCompositeOperation = 'destination-in';
    const gr = g.createLinearGradient(0, 0, 64, 0);
    if (phai) { gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.35, 'rgba(0,0,0,.85)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); }
    else { gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.65, 'rgba(0,0,0,.85)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); }
    g.fillStyle = gr; g.fillRect(0, 0, 64, h);
    return (MO_CUOI[k] = c);
  }

  function dung(opt) {
    if (!bat) return;
    const t0 = performance.now(), T = opt.T, R = opt.rows, MT = M.mat_tren, NHO = MT.nho_logic, HS = MT.cao_logic, DOAN = MT.doan_logic;
    const KB = M.than.khoi_logic, PAD = M.than.pad;
    COT = new Set(); for (const [a, b] of opt.cot) for (let x = a; x <= b; x++) COT.add(x);
    const ch = (tx, ty) => opt.tile(tx, Math.min(Math.max(ty, -1), opt.ROWS - 1));
    const dac = (tx, ty) => { if (ty < 0) return true; const c = ch(tx, ty); return c === '#' || c === 'S' || c === 'W'; };
    const moi = (tx, ty) => { const c = ch(tx, ty); return c === '#' || c === 'W'; };
    L = {than: [], cu: [], mat: [], dau: [], vien: [], tt: []};
    const sau = (tx, ty) => { let d = 0; while (ty + d < R && moi(tx, ty + d)) d++; return d; };   // số ô đất mới liền nhau từ ty xuống
    const dinh = (tx, ty) => { let r = ty; while (r > 0 && moi(tx, r - 1)) r--; return (r > 0 && !dac(tx, r - 1)) ? r : -1; };   // hàng mặt trên của cột (−1: trần / không có)
    const cot = [...COT].sort((a, b) => a - b);
    for (const tx of cot) for (let ty = 0; ty < R; ty++) {
      const c = ch(tx, ty);
      if (!moi(tx, ty)) { const v = opt.cuIdx(tx, ty); if (v >= 0) { const q = opt.cuK[v]; L.cu.push(['cu', q[0], q[1], 64, 64, tx * T, ty * T, T, T]); } continue; }
      // 1. thân (gộp sau)
      const u = ((tx * T) % KB + KB) % KB, v = ((ty * T) % KB + KB) % KB;
      L.than.push(['than', PAD + u * 2, PAD + v * 2, 64, 64, tx * T, ty * T, T, T]);
      // 2. mặt trên
      const lo = ty > 0 && !dac(tx, ty - 1);
      if (lo) {
        const d = sau(tx, ty), hl = Math.min(HS, NHO + d * T), x = tx * T, sg = Math.floor(x / DOAN), bien = bam(sg, 7) < 0.5 ? 'giua-a' : 'giua-b';
        const f = MT.khung[bien], uu = x - sg * DOAN;
        const tuong = (dx) => dac(tx + dx, ty) && dac(tx + dx, ty - 1);     // gặp tường cao hơn mặt sàn → góc lõm
        if (tuong(1) || tuong(-1)) L.mat.push(['mo:' + bien + ':' + uu + ':' + (tuong(1) ? 'p' : 't'), 0, 0, 64, hl * 2, x, ty * T - NHO, T, hl]);
        else L.mat.push(['mat', f[0] + uu * 2, f[1], 64, hl * 2, x, ty * T - NHO, T, hl]);
        // 3. đầu trái / phải: ô cạnh cùng hàng trống (không đặc)
        for (const phai of [false, true]) {
          if (dac(tx + (phai ? 1 : -1), ty)) continue;
          const fk = MT.khung[phai ? 'dau-phai' : 'dau-trai'], w = MT.dau_logic + MT.dau_nho_logic;
          const xa = phai ? (tx + 1) * T + NHO - w : tx * T - NHO;   // mép trái ảnh đầu (thế giới)
          let mo = 0; while (ty + mo < R && moi(tx, ty + mo) && !dac(tx + (phai ? 1 : -1), ty + mo)) mo++;   // số hàng có cạnh lộ dưới mặt trên
          const hMo = Math.min(HS, NHO + mo * T);                     // gặp sàn thấp hơn (góc lõm) → mảnh đầu dừng ở mặt sàn đó
          for (let k = 0; k < 4; k++) {
            const cx = phai ? tx - k : tx + k;
            if (k > 0 && !(moi(cx, ty) && !dac(cx, ty - 1))) break;     // hết dải mặt trên
            let x0 = cx * T, x1 = (cx + 1) * T;
            if (k === 0) { if (phai) x1 += NHO; else x0 -= NHO; }
            x0 = Math.max(x0, xa); x1 = Math.min(x1, xa + w); if (x1 <= x0) continue;
            const h2 = Math.min(k === 0 ? hMo : HS, NHO + sau(cx, ty) * T);   // chỉ cột mép đứng dừng ở mặt sàn thấp (góc lõm)
            L.dau.push(['mat', fk[0] + (x0 - xa) * 2, fk[1], (x1 - x0) * 2, h2 * 2, x0, ty * T - NHO, x1 - x0, h2]);
          }
        }
      }
      // 4. mép cũ: cạnh lộ trái / phải / dưới, trừ phần đầu đã có mép đứng
      const eL = !dac(tx - 1, ty), eR = !dac(tx + 1, ty), eB = ty + 1 < R && !dac(tx, ty + 1);
      if (eL || eR || eB) {
        const dr = dinh(tx, ty), phu = dr >= 0 && ty - dr <= 1;
        const cL = eL && !(phu && !dac(tx - 1, dr)), cR = eR && !(phu && !dac(tx + 1, dr));
        const F = dr >= 0 && ty - dr === 2 && ((cL && !dac(tx - 1, dr)) || (cR && !dac(tx + 1, dr)));   // ngay dưới mảnh đầu: mép cũ hiện dần
        const E = (cL ? 'L' : '') + (cR ? 'R' : '') + (eB ? 'B' : '') + (F ? 'F' : '');
        if (E) { const q = vienCu(opt, E); if (q !== -1) L.vien.push(['vien', q[0], q[1], 64, 64, tx * T, ty * T, T, T]); }
      }
    }
    // gộp thân + mặt trên liền nhau (cùng hàng, cùng ảnh, nguồn liền) → ít lệnh vẽ
    for (const k of ['than', 'mat', 'cu']) {
      const a = L[k].sort((p, q) => p[6] - q[6] || p[5] - q[5]), o = [];
      for (const c of a) { const p = o[o.length - 1];
        if (p && p[0] === c[0] && c[0] !== 'cu' && p[6] === c[6] && p[8] === c[8] && p[5] + p[7] === c[5] && p[1] + p[3] === c[1] && p[2] === c[2] && p[4] === c[4]) { p[3] += c[3]; p[7] += c[7]; }
        else o.push(c.slice()); }
      L[k] = o;
    }
    for (const it of opt.trangTri || []) { const o = M.trang_tri.o[it.o]; if (!o) continue; const [sx, sy, w, h] = o.khung;
      L.tt.push(['tt', sx, sy, w, h, it.x, it.y - h / 2 + (it.lun || 0), w / 2, h / 2]); }
    SO.lenh = Object.values(L).reduce((s, a) => s + a.length, 0); SO.ms_dung = Math.round(performance.now() - t0);
    SO.vien_mau = VIEN ? Object.keys(VIEN.o).filter(k => VIEN.o[k] !== -1) : [];
  }
  function coCot(tx) { return !!(bat && COT && COT.has(tx)); }

  /* ---------- vẽ ---------- */
  function veDS(ctx, ds, ox, oy, K, W, H, cuImg) {
    for (const c of ds) {
      const wx = c[5], wy = c[6]; if (wx - ox > W || wx + c[7] - ox < 0 || wy - oy > H || wy + c[8] - oy < 0) continue;
      let im;
      if (c[0] === 'mat') im = IMG.mat; else if (c[0] === 'than') im = IMG.than; else if (c[0] === 'cu') im = cuImg; else if (c[0] === 'vien') im = VIEN.cv;
      else if (c[0] === 'tt') im = IMG.tt; else { const p = c[0].split(':'); im = cotMo(p[1], +p[2], p[3] === 'p'); }
      const x0 = Math.round((wx - ox) * K) / K, x1 = Math.round((wx + c[7] - ox) * K) / K, y0 = Math.round((wy - oy) * K) / K, y1 = Math.round((wy + c[8] - oy) * K) / K;
      ctx.drawImage(im, c[1], c[2], c[3], c[4], x0, y0, x1 - x0, y1 - y0); SO.ve++;
    }
  }
  function veDat(ctx, ox, oy, K, W, H, cuImg) {
    if (!bat || !L) return;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    veDS(ctx, L.than, ox, oy, K, W, H, cuImg); veDS(ctx, L.cu, ox, oy, K, W, H, cuImg); veDS(ctx, L.mat, ox, oy, K, W, H, cuImg);
    veDS(ctx, L.dau, ox, oy, K, W, H, cuImg); veDS(ctx, L.vien, ox, oy, K, W, H, cuImg); veDS(ctx, L.tt, ox, oy, K, W, H, cuImg);
  }

  /* nền: xa (lặp soi gương nên không có đường nối) + giữa (từng mảnh, đặt thưa theo phòng). Lệch cuộn tính theo TRỤC GIỮA PHÒNG (rc):
     camera ở giữa phòng → bố cục đúng như thiết kế; không phụ thuộc toạ độ tuyệt đối của phòng trong thế giới. */
  function veNen(ctx, ox, oy, K, W, H, camx, rc, ch) {
    if (!bat) return false;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    const X = M.nen.xa, iw = X.co_logic[0], ih = X.co_logic[1], dx = camx - rc;
    ctx.fillStyle = '#10181b'; ctx.fillRect(0, 0, W, H);
    const x0 = -(iw - W) / 2 - dx * X.he_so, y = Math.round((X.y_logic - oy * X.he_so_doc) * K) / K;
    for (let n = Math.floor(-x0 / iw); x0 + n * iw < W; n++) {   // bản lẻ lật ngang → mép nối luôn liền (soi gương)
      const x = x0 + n * iw, X0 = Math.round(x * K) / K, X1 = Math.round((x + iw) * K) / K;
      if ((n % 2 + 2) % 2) { ctx.save(); ctx.translate(X1, 0); ctx.scale(-1, 1); ctx.drawImage(IMG.xa, 0, y, X1 - X0, ih); ctx.restore(); }
      else ctx.drawImage(IMG.xa, X0, y, X1 - X0 + 0.02, ih);
    }
    const G = M.nen.giua; if (!ch || !ch.giua) return true;
    const y0 = (ch.sanY + (ch.catDuoi || 20)) - G.cat_day_logic - oy * G.he_so_doc;
    for (const p of ch.giua) { const f = G.khung[p.m]; if (!f) continue;
      const w = f[2] / 2, h = f[3] / 2, gx = p.x - dx * G.he_so; if (gx > W || gx + w < 0) continue;
      ctx.globalAlpha = p.al === undefined ? 1 : p.al;
      if (p.lat) { ctx.save(); ctx.translate(Math.round((gx + w) * K) / K, 0); ctx.scale(-1, 1); ctx.drawImage(IMG.giua, f[0], f[1], f[2], f[3], 0, Math.round(y0 * K) / K, w, h); ctx.restore(); }
      else ctx.drawImage(IMG.giua, f[0], f[1], f[2], f[3], Math.round(gx * K) / K, Math.round(y0 * K) / K, w, h);
      ctx.globalAlpha = 1; }
    return true;
  }

  /* đèn lồng cũ: thu về cao `cao` logic, GIẢM NÉT (viền đen ngoài → nâu sẫm trong, mảnh hơn), quầng nhỏ vẽ sẵn */
  let DEN = null;
  function taoDen(p, cao) {
    const k = cao / p.h, w = Math.ceil(p.w * k * 2) + 4, h = Math.ceil(p.h * k * 2) + 4, c = canvas(w, h), g = c.getContext('2d', {willReadFrequently: true});
    g.imageSmoothingQuality = 'high'; g.drawImage(p.img, p.sx, p.sy, p.sw, p.sh, 2, 2, w - 4, h - 4);
    const id = g.getImageData(0, 0, w, h), D = id.data, A = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) A[i] = D[i * 4 + 3];
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x, j = i * 4; if (!A[i]) continue;
      const bien = A[i - 1] < 60 || A[i + 1] < 60 || A[i - w] < 60 || A[i + w] < 60, L = 0.2126 * D[j] + 0.7152 * D[j + 1] + 0.0722 * D[j + 2];
      if (L < 55) { const t = bien ? 0.45 : 0.6; D[j] = D[j] + (58 - D[j]) * t; D[j + 1] = D[j + 1] + (44 - D[j + 1]) * t; D[j + 2] = D[j + 2] + (36 - D[j + 2]) * t; if (bien) D[j + 3] *= 0.55; }
    }
    g.putImageData(id, 0, 0);
    const q = canvas(96, 96), qg = q.getContext('2d'), gr = qg.createRadialGradient(48, 48, 0, 48, 48, 48);
    gr.addColorStop(0, 'rgba(242,214,154,.9)'); gr.addColorStop(0.3, 'rgba(226,180,110,.35)'); gr.addColorStop(1, 'rgba(200,150,80,0)');
    qg.fillStyle = gr; qg.fillRect(0, 0, 96, 96);
    DEN = {c, w: w / 2, h: h / 2, ax: (p.ax * k * 2 + 2) / 2, q};
    return DEN;
  }
  function veDen(ctx, ox, oy, ds, frame) {
    if (!DEN) return;
    for (const d of ds) {
      const x = d.x - ox, y = d.y - oy; if (x < -60 || x > 1020) continue;
      const sw = Math.sin(frame * 0.03 + (d.ph || 0)) * 1.5, top = y - DEN.h;
      ctx.strokeStyle = 'rgba(24,20,17,.75)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, -oy - 4); ctx.lineTo(x + sw, top + 1); ctx.stroke();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = d.sang === undefined ? 0.22 : d.sang;
      const r = d.r || 46; ctx.drawImage(DEN.q, x + sw - r, top + DEN.h * 0.62 - r, r * 2, r * 2); ctx.restore();
      ctx.save(); ctx.translate(x + sw, top); ctx.rotate(sw * 0.01); ctx.drawImage(DEN.c, -DEN.ax, 0, DEN.w, DEN.h); ctx.restore();
    }
  }
  return {SO, IMG, nap, dung, coCot, veDat, veNen, taoDen, veDen, get bat() { return bat; }, get M() { return M; }, get L() { return L; }, get VIEN() { return VIEN; }};
})();
