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
   (Trên đây là đường cũ – bước 1, chỉ còn dùng với opt.boCu.)

   BƯỚC 2 (28/10): có dia-hinh.json → "bo_moi" (ảnh gen chủ dự án, code/tao-bo-moi.py) → dungMoi: thân, cạnh đứng, đáy, mặt trên, góc, ván
   đều từ bộ mới, NƯỚNG SẴN thành mảng canvas (xem chú thích trên dungMoi). "do_vat_a": điểm lưu + hình nộm mới (veDiemLuu, veNomMoi).

   API:
     await DHM.nap(srcJson)                         nạp JSON + 5 ảnh, giải mã sẵn
     DHM.dung(opt)                                  dựng sẵn danh sách lệnh vẽ (1 lần sau khi lưới + atlas cũ sẵn sàng)
        opt = {T, ROWS, rows, WW, cot:[[c0,c1],…], tile(tx,ty), cuIdx(tx,ty) → chỉ số atlas cũ hoặc −1, cuK (chỉ số → [dx,dy]),
               cuTen (tên → chỉ số), cuImg (atlas cũ đã kéo mép, ô 64 tại [dx,dy]), trangTri:[{o, x, y}]}
     DHM.coCot(tx)                                  cột tx có vẽ bằng bộ mới không
     DHM.veDat(ctx, ox, oy, K, W, H, cuImg)          vẽ đất các cột được bật
     DHM.veNen(ctx, ox, oy, K, W, H, camx, rc, ch)   vẽ nền xa + nền giữa thưa (ch = cấu hình phòng: {giua:[{m, x}], sanY})
     DHM.taoDen(p, cao) / DHM.veDen(ctx, ox, oy, ds, frame)   đèn lồng cũ: giảm nét, thu cỡ, quầng nhỏ vẽ SAU địa hình + nhân vật (d.tran: dây từ trần)
     DHM.coDoVat() / DHM.veDiemLuu(ctx, X, Y, on, xoay) / DHM.veNomMoi(ctx, x, y, lac, sang)   đồ vật phòng A mới (neo giữa đáy)
     opt thêm: boCu (đường cũ bước 1), daLaDat (false: ô 'S' vẽ đá cũ), lop ([0..4]: chỉ nướng các lớp này – để soi lỗi)
   Không xử lý điểm ảnh mỗi khung: mọi mask / giảm nét làm 1 lần lúc dựng. */
const DHM = (() => {
  const SO = {ms_nap: 0, ms_dung: 0, mb_anh: 0, lenh: 0, ve: 0};
  const IMG = {};
  let M = null, bat = false, COT = null, L = null, VIEN = null, CHK = null;

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
    if (M.bo_moi) ds.dat = M.bo_moi;          // bộ đất mới (ảnh gen chủ dự án) – code/tao-bo-moi.py
    if (M.do_vat_a) ds.dv = M.do_vat_a;       // điểm lưu + hình nộm mới
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
    CHK = null;
    if (M.bo_moi && IMG.dat && !opt.boCu) return dungMoi(opt);
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
  /* ======================= BỘ ĐẤT MỚI (ảnh gen chủ dự án → code/tao-bo-moi.py → dat-moi.png) – NƯỚNG SẴN THÀNH MẢNG =======================
     Thay hẳn mép cũ chỉnh màu. Mỗi ô đất (#, W, và S nếu opt.daLaDat !== false) trong các cột được bật:
       lớp 0 THÂN      khối lặp liền 320×320 logic, cắt theo ô ở toạ độ thế giới
       lớp 1 CẠNH ĐỨNG ô lộ trái / phải: dải 47 logic (3 nhô + 44 vào trong, 18 cuối mờ), 3 đoạn lặp dọc 128 logic (băm cố định theo đoạn + cột)
       lớp 2 ĐÁY      ô lộ dưới: dải 61,5 logic (4 nhô xuống), 3 đoạn 128 logic; 2 đầu đáy (góc lồi dưới) ở chỗ cạnh lộ
       lớp 3 MẶT TRÊN ô lộ trên: dải 116 logic (3 nhô lên), 3 đoạn 128 logic; 2 đầu (góc lồi trên). Lớp này bị XOÁ DẦN 26 logic sát mọi
                      mép đáy lộ (bệ mỏng: mặt trên mờ đi để lộ đáy rêu, không còn "đáy cắt thẳng")
       lớp 4 VÁN '='  đầu trái 64 + giữa 64 × n + đầu phải 64 (2 bộ, băm theo vị trí); mặt ván = mặt collider ô '='; giá đỡ chỉ chĩa xuống
     Góc lõm: mặt trên / đáy cột sát tường mờ dần về phía tường + bóng tối nhỏ (sàn gặp tường).
     Tất cả vẽ 1 lần vào canvas mảng 256×128 logic (ảnh 2x, chỉ giữ khung bao phần có hình) → mỗi khung chỉ vẽ các mảng trong màn hình.
     Collider KHÔNG đổi: chỉ đọc lưới ô. */
  const CW = 256, CHH = 128;
  let T3 = null, T2 = null;
  function dungMoi(opt) {
    const t0 = performance.now(), T = opt.T, R = opt.rows, B = M.bo_moi, KH = B.khung, IM = IMG.dat;
    const NHO = B.nho_logic, NHD = B.nho_day_logic, HS = B.mat_cao_logic, HD = B.day_cao_logic, DAU = B.dau_logic + NHO, TW = B.tuong_rong_logic,
      DO = B.doan_logic, KB = B.than_logic, VH = B.van_cao_logic, VD = B.van_dau_logic + NHO, VG = B.van_giua_logic;
    COT = new Set(); for (const [a, b] of opt.cot) for (let x = a; x <= b; x++) COT.add(x);
    const ch = (tx, ty) => opt.tile(tx, Math.min(Math.max(ty, -1), opt.ROWS - 1));
    const dac = (tx, ty) => { if (ty < 0) return true; const c = ch(tx, ty); return c === '#' || c === 'S' || c === 'W'; };
    const laDat = (tx, ty) => { if (!COT.has(tx)) return false; const c = ch(tx, ty); return c === '#' || c === 'W' || (c === 'S' && opt.daLaDat !== false); };
    const mod = (a, m) => ((a % m) + m) % m;
    const chon = (ds, a, b) => ds[Math.floor(bam(a, b) * ds.length) % ds.length];
    const runDown = (tx, ty) => { let d = 0; while (ty + d < R && dac(tx, ty + d)) d++; return d; };
    const runUp = (tx, ty) => { let d = 0; while (ty - d >= 0 && dac(tx, ty - d)) d++; return d; };
    L = {than: [], cu: [], mat: [], dau: [], vien: [], tt: []};
    const ops = [], xoa = [], ao = [];
    const op = (l, k, du, dv, sw, sh, x, y, w, h, c, mo) => { if (opt.lop && !opt.lop.includes(Math.floor(l))) return; const f = KH[k]; ops.push({l, sx: f[0] + du, sy: f[1] + dv, sw, sh, x, y, w, h, c, mo}); };
    const cot = [...COT].sort((a, b) => a - b);
    for (const tx of cot) for (let ty = 0; ty < R; ty++) {
      const X = tx * T, Y = ty * T;
      if (!laDat(tx, ty)) { if (ch(tx, ty) !== '=') { const v = opt.cuIdx(tx, ty); if (v >= 0) { const q = opt.cuK[v]; L.cu.push(['cu', q[0], q[1], 64, 64, X, Y, T, T]); } } continue; }
      const oL = !dac(tx - 1, ty), oR = !dac(tx + 1, ty), oT = !dac(tx, ty - 1), oB = !dac(tx, ty + 1);
      // lớp 0: thân
      op(0, 'than', mod(X, KB) * 2, mod(Y, KB) * 2, 64, 64, X, Y, T, T, null);
      // lớp 1: cạnh đứng
      for (const phai of [false, true]) {
        if (!(phai ? oR : oL)) continue;
        const k = 'tuong-' + (phai ? 'phai-' : 'trai-') + chon(B.tuong_doan, Math.floor(Y / DO), tx * 7 + (phai ? 3 : 1)), v = mod(Y, DO);
        let inn = 1; while (inn < 3 && dac(tx + (phai ? -inn : inn), ty)) inn++;
        const xa = phai ? X + T + NHO - TW : X - NHO;
        const c = phai ? [Math.max(xa, X + T - inn * T), Y, X + T + NHO, Y + T] : [X - NHO, Y, Math.min(xa + TW, X + inn * T), Y + T];
        op(1, k, 0, v * 2, KH[k][2], 64, xa, Y, TW, T, c);
      }
      // lớp 2: đáy + đầu đáy
      if (oB) {
        const yTop = (ty - runUp(tx, ty) + 1) * T, yb = Y + T + NHD;
        const k = 'day-' + chon(B.day_doan, Math.floor(X / DO), 17), u = mod(X, DO);
        const vach = dx => dac(tx + dx, ty) && dac(tx + dx, ty + 1);
        op(2, k, u * 2, 0, 64, KH[k][3], X, yb - HD, T, HD, [X, Math.max(yTop, yb - HD), X + T, yb], vach(1) ? 'p' : vach(-1) ? 't' : null);
        for (const phai of [false, true]) {
          if (!(phai ? oR : oL)) continue;
          const kd = 'day-dau-' + (phai ? 'phai' : 'trai'), xa = phai ? X + T + NHO - DAU : X - NHO;
          for (let kk = 0; kk < 4; kk++) {
            const cx = phai ? tx - kk : tx + kk;
            if (kk > 0 && !(laDat(cx, ty) && !dac(cx, ty + 1))) break;
            let c0 = cx * T, c1 = (cx + 1) * T; if (kk === 0) { if (phai) c1 += NHO; else c0 -= NHO; }
            c0 = Math.max(c0, xa); c1 = Math.min(c1, xa + DAU); if (c1 <= c0) continue;
            let top = (ty - runUp(cx, ty) + 1) * T;
            if (kk === 0) { let m = 0; while (ty - m >= 0 && dac(cx, ty - m) && !dac(cx + (phai ? 1 : -1), ty - m)) m++; top = Math.max(top, Y + T - m * T); }
            op(2.5, kd, 0, 0, KH[kd][2], KH[kd][3], xa, yb - HD, DAU, HD, [c0, Math.max(top, yb - HD), c1, yb]);
          }
        }
        xoa.push([X - (oL ? NHO + 1 : 0), Y + T - 26, X + T + (oR ? NHO + 1 : 0), Y + T + NHD + 1]);
      }
      // lớp 3: mặt trên + đầu
      if (oT) {
        const d = runDown(tx, ty), hl = Math.min(HS, NHO + d * T);
        const k = 'mat-' + chon(B.mat_doan, Math.floor(X / DO), 7), u = mod(X, DO);
        const tuong = dx => dac(tx + dx, ty) && dac(tx + dx, ty - 1);
        op(3, k, u * 2, 0, 64, hl * 2, X, Y - NHO, T, hl, null, tuong(1) ? 'p' : tuong(-1) ? 't' : null);
        if (tuong(1)) ao.push([X + T, Y]); if (tuong(-1)) ao.push([X, Y]);
        for (const phai of [false, true]) {
          if (!(phai ? oR : oL)) continue;
          const kd = 'mat-dau-' + (phai ? 'phai' : 'trai'), xa = phai ? X + T + NHO - DAU : X - NHO;
          let mo = 0; while (ty + mo < R && dac(tx, ty + mo) && !dac(tx + (phai ? 1 : -1), ty + mo)) mo++;
          for (let kk = 0; kk < 4; kk++) {
            const cx = phai ? tx - kk : tx + kk;
            if (kk > 0 && !(laDat(cx, ty) && !dac(cx, ty - 1))) break;
            let c0 = cx * T, c1 = (cx + 1) * T; if (kk === 0) { if (phai) c1 += NHO; else c0 -= NHO; }
            c0 = Math.max(c0, xa); c1 = Math.min(c1, xa + DAU); if (c1 <= c0) continue;
            const h2 = Math.min(kk === 0 ? NHO + mo * T : HS, NHO + runDown(cx, ty) * T);
            op(3.5, kd, 0, 0, KH[kd][2], KH[kd][3], xa, Y - NHO, DAU, HS, [c0, Y - NHO, c1, Y - NHO + h2]);
          }
        }
      }
    }
    // lớp 4: ván một chiều (dải '=' liền trong các cột được bật)
    for (let ty = 0; ty < R; ty++) for (const tx of cot) {
      if (ch(tx, ty) !== '=' || (COT.has(tx - 1) && ch(tx - 1, ty) === '=')) continue;
      let n = 0; while (COT.has(tx + n) && ch(tx + n, ty) === '=') n++;
      const bo = chon(B.van_bo, tx, ty * 3 + 5), x0 = tx * T, x1 = (tx + n) * T, y = ty * T - NHO, mid = (x0 + x1) / 2;
      const kL = 'van-' + bo + '-trai', kR = 'van-' + bo + '-phai', kG = 'van-' + bo + '-giua';
      op(4, kL, 0, 0, KH[kL][2], KH[kL][3], x0 - NHO, y, VD, VH, [x0 - NHO, y - 2, Math.min(mid, x0 - NHO + VD), y + VH]);
      op(4, kR, 0, 0, KH[kR][2], KH[kR][3], x1 + NHO - VD, y, VD, VH, [Math.max(mid, x1 + NHO - VD), y - 2, x1 + NHO, y + VH]);
      for (let gx = x0 - NHO + VD; gx < x1 + NHO - VD; gx += VG) op(4, kG, 0, 0, KH[kG][2], KH[kG][3], gx, y, VG, VH, [gx, y - 2, Math.min(gx + VG, x1 + NHO - VD), y + VH]);
    }
    for (const it of opt.trangTri || []) { const o = M.trang_tri.o[it.o]; if (!o) continue; const [sx, sy, w, h] = o.khung;
      L.tt.push(['tt', sx, sy, w, h, it.x, it.y - h / 2 + (it.lun || 0), w / 2, h / 2]); }

    // ---- nướng: chia mảng theo khung bao của lệnh (sau cắt)
    const MAP = new Map();
    for (const o of ops) {
      const r = o.c ? [Math.max(o.x, o.c[0]), Math.max(o.y, o.c[1]), Math.min(o.x + o.w, o.c[2]), Math.min(o.y + o.h, o.c[3])] : [o.x, o.y, o.x + o.w, o.y + o.h];
      if (r[2] <= r[0] || r[3] <= r[1]) continue;
      for (let cy = Math.floor(r[1] / CHH); cy * CHH < r[3]; cy++) for (let cx = Math.floor(r[0] / CW); cx * CW < r[2]; cx++) {
        const key = cx + ',' + cy; let m = MAP.get(key); if (!m) MAP.set(key, m = {cx, cy, ops: [], bb: [1e9, 1e9, -1e9, -1e9]});
        m.ops.push(o); const b = m.bb;
        b[0] = Math.min(b[0], Math.max(r[0], cx * CW)); b[1] = Math.min(b[1], Math.max(r[1], cy * CHH));
        b[2] = Math.max(b[2], Math.min(r[2], (cx + 1) * CW)); b[3] = Math.max(b[3], Math.min(r[3], (cy + 1) * CHH));
      }
    }
    if (!T3) { T3 = canvas(CW * 2 + 4, CHH * 2 + 4); T2 = canvas(DAU * 2 + 8, Math.ceil(HS * 2) + 8); }
    const g3 = T3.getContext('2d'), g2 = T2.getContext('2d');
    const ve = (g, o, bx, by) => {
      g.save(); g.setTransform(2, 0, 0, 2, -bx * 2, -by * 2);
      if (o.c) { g.beginPath(); g.rect(o.c[0], o.c[1], o.c[2] - o.c[0], o.c[3] - o.c[1]); g.clip(); }
      if (!o.mo) g.drawImage(IM, o.sx, o.sy, o.sw, o.sh, o.x, o.y, o.w, o.h);
      else {   // góc lõm: mờ dần về phía tường
        const w = Math.round(o.w * 2), h = Math.round(o.h * 2);
        g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalCompositeOperation = 'source-over'; g2.clearRect(0, 0, T2.width, T2.height);
        g2.drawImage(IM, o.sx, o.sy, o.sw, o.sh, 0, 0, w, h);
        g2.globalCompositeOperation = 'destination-in'; const gr = g2.createLinearGradient(0, 0, w, 0);
        if (o.mo === 'p') { gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.35, 'rgba(0,0,0,.85)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); }
        else { gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.65, 'rgba(0,0,0,.85)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); }
        g2.fillStyle = gr; g2.fillRect(0, 0, w, h); g2.globalCompositeOperation = 'source-over';
        g.drawImage(T2, 0, 0, w, h, o.x, o.y, o.w, o.h);
      }
      g.restore();
    };
    CHK = []; let px = 0;
    for (const m of MAP.values()) {
      const bx = Math.floor(m.bb[0]), by = Math.floor(m.bb[1]), w = Math.ceil(m.bb[2]) - bx, h = Math.ceil(m.bb[3]) - by;
      const cv = canvas(w * 2, h * 2), g = cv.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      for (const l of [0, 1, 2, 2.5]) for (const o of m.ops) if (o.l === l) ve(g, o, bx, by);
      const co3 = m.ops.some(o => o.l === 3 || o.l === 3.5);
      if (co3) {
        g3.setTransform(1, 0, 0, 1, 0, 0); g3.globalCompositeOperation = 'source-over'; g3.clearRect(0, 0, T3.width, T3.height);
        g3.imageSmoothingEnabled = true; g3.imageSmoothingQuality = 'high';
        for (const l of [3, 3.5]) for (const o of m.ops) if (o.l === l) ve(g3, o, bx, by);
        g3.setTransform(2, 0, 0, 2, -bx * 2, -by * 2); g3.globalCompositeOperation = 'destination-out';
        for (const r of xoa) { if (r[2] < bx || r[0] > bx + w || r[3] < by || r[1] > by + h) continue;
          const gr = g3.createLinearGradient(0, r[1], 0, r[3] - NHD - 1); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)');
          g3.fillStyle = gr; g3.fillRect(r[0], r[1], r[2] - r[0], r[3] - r[1]); }
        g3.globalCompositeOperation = 'source-over'; g3.setTransform(1, 0, 0, 1, 0, 0);
        g.drawImage(T3, 0, 0, w * 2, h * 2, 0, 0, w * 2, h * 2);
      }
      // bóng góc lõm (sàn gặp tường)
      g.save(); g.setTransform(2, 0, 0, 2, -bx * 2, -by * 2);
      for (const [x, y] of ao) { if (x < bx - 24 || x > bx + w + 24 || y < by - 24 || y > by + h + 24) continue;
        const gr = g.createRadialGradient(x, y, 0, x, y, 22); gr.addColorStop(0, 'rgba(14,10,8,.42)'); gr.addColorStop(1, 'rgba(14,10,8,0)');
        g.save(); g.fillStyle = gr; g.beginPath(); g.rect(x - 22, y - 3, 44, 25); g.clip(); g.fillRect(x - 22, y - 22, 44, 44); g.restore(); }
      g.restore();
      for (const o of m.ops) if (o.l === 4) ve(g, o, bx, by);
      CHK.push({x: bx, y: by, w, h, cv}); px += cv.width * cv.height;
    }
    SO.mang = CHK.length; SO.mb_mang = +(px * 4 / 1048576).toFixed(1); SO.lenh_nuong = ops.length;
    SO.lenh = CHK.length + L.cu.length + L.tt.length; SO.ms_dung = Math.round(performance.now() - t0); SO.vien_mau = [];
  }
  /* ---------- đồ vật phòng A mới (do-vat-a.png): điểm lưu + hình nộm ---------- */
  function coDoVat() { return !!(bat && IMG.dv && M.do_vat_a); }
  /* điểm lưu: vòm (neo giữa đáy X, Y) + chuông RỜI xoay quanh điểm treo; trả về điểm treo (để vẽ quầng) */
  function veDiemLuu(ctx, X, Y, on, rot) {
    const D = M.do_vat_a, K = D.khung, im = IMG.dv, v = K.vom, w = v[2] / 2, h = v[3] / 2, x0 = X - w / 2, y0 = Y - h;
    ctx.drawImage(im, v[0], v[1], v[2], v[3], x0, y0, w, h);
    const ten = on ? 'chuong-sang' : 'chuong-tat', kc = K[ten], n = D.chuong_neo[ten], px = x0 + D.treo[0] / 2, py = y0 + D.treo[1] / 2;
    ctx.save(); ctx.translate(px, py); ctx.rotate(rot || 0); ctx.drawImage(im, kc[0], kc[1], kc[2], kc[3], -n[0] / 2, -n[1] / 2, kc[2] / 2, kc[3] / 2); ctx.restore();
    return [px, py + kc[3] / 4];
  }
  /* hình nộm: neo giữa đáy (x, y), nghiêng quanh gốc theo lac (px), sáng lên theo flash (0..1) */
  function veNomMoi(ctx, x, y, lac, sang) {
    const K = M.do_vat_a.khung, a = K.nom, w = a[2] / 2, h = a[3] / 2;
    ctx.save(); ctx.translate(x, y); ctx.rotate((lac || 0) * 0.012);
    ctx.drawImage(IMG.dv, a[0], a[1], a[2], a[3], -w / 2, -h, w, h);
    if (sang > 0) { const b = K['nom-sang']; ctx.globalAlpha = Math.min(1, sang); ctx.drawImage(IMG.dv, b[0], b[1], b[2], b[3], -w / 2, -h, w, h); }
    ctx.restore();
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
    if (CHK) {   // bộ mới: đất đã NƯỚNG sẵn thành mảng (chunk) → mỗi khung chỉ vài lệnh vẽ
      for (const c of CHK) { if (c.x - ox > W || c.x + c.w - ox < 0 || c.y - oy > H || c.y + c.h - oy < 0) continue;
        const x0 = Math.round((c.x - ox) * K) / K, x1 = Math.round((c.x + c.w - ox) * K) / K, y0 = Math.round((c.y - oy) * K) / K, y1 = Math.round((c.y + c.h - oy) * K) / K;
        ctx.drawImage(c.cv, 0, 0, c.cv.width, c.cv.height, x0, y0, x1 - x0, y1 - y0); SO.ve++; }
      veDS(ctx, L.cu, ox, oy, K, W, H, cuImg); veDS(ctx, L.tt, ox, oy, K, W, H, cuImg);
      return;
    }
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
      const w = f[2] / 2, h = f[3] / 2, gx = p.x - (p.rc === undefined ? dx : camx - p.rc) * G.he_so; if (gx > W || gx + w < 0) continue;
      const al = (p.al === undefined ? 1 : p.al) * (p.w === undefined ? 1 : p.w); if (al <= 0.003) continue;
      ctx.globalAlpha = al;
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
      ctx.strokeStyle = 'rgba(24,20,17,.75)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, (d.tran === undefined ? -4 : d.tran) - oy); ctx.lineTo(x + sw, top + 1); ctx.stroke();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = d.sang === undefined ? 0.22 : d.sang;
      const r = d.r || 46; ctx.drawImage(DEN.q, x + sw - r, top + DEN.h * 0.62 - r, r * 2, r * 2); ctx.restore();
      ctx.save(); ctx.translate(x + sw, top); ctx.rotate(sw * 0.01); ctx.drawImage(DEN.c, -DEN.ax, 0, DEN.w, DEN.h); ctx.restore();
    }
  }
  return {SO, IMG, nap, dung, coCot, veDat, veNen, taoDen, veDen, coDoVat, veDiemLuu, veNomMoi, get CHK() { return CHK; }, get bat() { return bat; }, get M() { return M; }, get L() { return L; }, get VIEN() { return VIEN; }};
})();
