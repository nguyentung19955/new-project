// XƯỞNG RỐI: vai các mảnh theo khung, tự đoán vai, tự ráp tư thế đứng, đóng gói ảnh và tệp linh-khi-rig.
(function () {
  'use strict';
  const XR = (window.XR = window.XR || {});

  XR.KHUNG = { nguoi: 'Người', 'bon-chan': 'Bốn chân', cua: 'Cua / bọ' };
  XR.VAI = {
    nguoi: [['dau', 'Đầu'], ['than', 'Thân'], ['tay-truoc', 'Tay trước'], ['tay-sau', 'Tay sau'], ['chan-truoc', 'Chân trước'], ['chan-sau', 'Chân sau'],
      ['vu-khi', 'Vũ khí'], ['phu-kien', 'Phụ kiện (tóc, khăn…)']],
    'bon-chan': [['dau', 'Đầu'], ['than', 'Thân / hông'], ['nguc', 'Ngực / vai (nếu tách)'], ['co', 'Cổ (nếu tách)'], ['chan-truoc-gan', 'Chân trước (gần)'], ['chan-truoc-xa', 'Chân trước (xa)'],
      ['chan-sau-gan', 'Chân sau (gần)'], ['chan-sau-xa', 'Chân sau (xa)'], ['duoi', 'Đuôi'], ['phu-kien', 'Phụ kiện']],
    cua: [['than', 'Thân / mai'], ['cang-truoc', 'Càng trước'], ['cang-sau', 'Càng sau'], ['chan-gan-1', 'Chân gần 1'], ['chan-gan-2', 'Chân gần 2'],
      ['chan-gan-3', 'Chân gần 3'], ['chan-xa-1', 'Chân xa 1'], ['chan-xa-2', 'Chân xa 2'], ['chan-xa-3', 'Chân xa 3'], ['phu-kien', 'Phụ kiện']],
  };
  XR.tenVai = function (khung, vai) { const v = (XR.VAI[khung] || []).find((a) => a[0] === vai); return v ? v[1] : vai || '?'; };
  XR.DONG_TAC = [['idle', 'Đứng thở'], ['move', 'Đi'], ['roll', 'Lộn nhào'], ['tele', 'Chuẩn bị đánh'], ['atk', 'Đánh'], ['hit', 'Trúng đòn'], ['die', 'Chết']];
  XR.LAP = { idle: true, move: true }; // động tác lặp; còn lại chạy một lần (u 0..1)

  // Mã: bỏ dấu, chữ thường, gạch nối
  XR.taoMa = function (s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  };

  // ---------- tự đoán vai ----------
  // ds: mảnh có cv, sx, sy. Gemini vẽ phần "xa" tối hơn phần "gần", tay ở hàng trên chân.
  XR.doanVai = function (khung, ds) {
    for (const p of ds) { if (!p.so) p.so = XR.doManh(p.cv); p.vai = 'phu-kien'; }
    const theoCo = ds.slice().sort((a, b) => b.so.dt - a.so.dt);
    const lay = (n) => theoCo.splice(0, n);
    // Mảnh "trước/gần" và "sau/xa": Gemini vẽ theo thứ tự đánh số trong prompt, từ trái sang phải (trước bên trái).
    // Prompt cũ còn vẽ mảnh sau tối hơn: chỉ khi chênh sáng rõ (>30) mới dùng độ sáng.
    const sangTruoc = (a, b) => (Math.abs(a.so.sang - b.so.sang) > 30 ? b.so.sang - a.so.sang : a.sx - b.sx);
    const cy = (p) => p.sy + p.h / 2;
    if (khung === 'nguoi') {
      const hai = lay(2);
      if (hai.length === 2) {
        // chibi: đầu to và tròn; nếu một mảnh nằm hẳn phía trên thì là đầu
        let [a, b] = hai;
        const diemDau = (p) => p.so.dt * (0.6 + p.so.tron) - cy(p) * 0.2 * Math.sqrt(p.so.dt);
        if (diemDau(b) > diemDau(a)) [a, b] = [b, a];
        a.vai = 'dau'; b.vai = 'than';
      } else if (hai.length) hai[0].vai = 'than';
      // Bỏ riêng trước khi chọn tay chân: áo choàng (mảnh to gần bằng thân, không daiNhat) và vũ khí (rất daiNhat, mảnh)
      const than0 = ds.find((p) => p.vai === 'than'), dtThan = than0 ? than0.so.dt : 1;
      const dai = (p) => Math.max(p.w, p.h) / Math.max(1, Math.min(p.w, p.h));
      const daiNhat = (p) => Math.max(p.w, p.h);
      for (const p of theoCo.slice()) {
        // vũ khí: rất mảnh VÀ daiNhat hơn hẳn mọi mảnh còn lại (chân gầy cũng mảnh nhưng không daiNhat bằng)
        const khac = theoCo.filter((q) => q !== p).map(daiNhat);
        if (dai(p) >= 3 && daiNhat(p) > Math.max(1, ...khac) * 1.15 && !ds.some((q) => q.vai === 'vu-khi')) { p.vai = 'vu-khi'; theoCo.splice(theoCo.indexOf(p), 1); }
        else if (p.so.dt >= dtThan * 0.45 && dai(p) < 1.6) { p.vai = 'phu-kien'; theoCo.splice(theoCo.indexOf(p), 1); }
      }
      // 4 chi: to nhất trong phần còn lại; tay ở hàng trên chân
      const chi = lay(4).sort((a, b) => cy(a) - cy(b));
      const tay = chi.slice(0, 2).sort(sangTruoc), chan = chi.slice(2).sort(sangTruoc);
      if (tay[0]) tay[0].vai = 'tay-truoc'; if (tay[1]) tay[1].vai = 'tay-sau';
      if (chan[0]) chan[0].vai = 'chan-truoc'; if (chan[1]) chan[1].vai = 'chan-sau';
      if (chan.length < 2 && tay.length === 2 && chan.length === 0) { tay[1].vai = 'chan-truoc'; }
      const daiTay = Math.max(1, ...chi.map((p) => Math.max(p.w, p.h)));
      for (const p of theoCo) if (Math.max(p.w, p.h) > daiTay * 1.2 && !ds.some((q) => q.vai === 'vu-khi')) p.vai = 'vu-khi';
      for (const p of ds) if (p.vai === 'vu-khi' && p !== ds.find((q) => q.vai === 'vu-khi')) p.vai = 'phu-kien';
    } else if (khung === 'bon-chan') {
      const [than, dau] = lay(2);
      if (than) than.vai = 'than'; if (dau) dau.vai = 'dau';
      const chan = lay(4).sort((a, b) => cy(a) - cy(b));
      const truoc = chan.slice(0, 2).sort(sangTruoc), sau = chan.slice(2).sort(sangTruoc);
      if (truoc[0]) truoc[0].vai = 'chan-truoc-gan'; if (truoc[1]) truoc[1].vai = 'chan-truoc-xa';
      if (sau[0]) sau[0].vai = 'chan-sau-gan'; if (sau[1]) sau[1].vai = 'chan-sau-xa';
      const duoi = lay(1)[0]; if (duoi) duoi.vai = 'duoi';
    } else {
      const than = lay(1)[0]; if (than) than.vai = 'than';
      const cang = lay(2).sort(sangTruoc);
      if (cang[0]) cang[0].vai = 'cang-truoc'; if (cang[1]) cang[1].vai = 'cang-sau';
      // 6 chân: hàng trên là chân gần, hàng dưới là chân xa (prompt cũ: chân xa tối hơn)
      const chan = lay(6), sangs = chan.map((p) => p.so.sang), lech = sangs.length ? Math.max(...sangs) - Math.min(...sangs) : 0;
      chan.sort(lech > 30 ? (a, b) => b.so.sang - a.so.sang : (a, b) => (a.sy + a.h / 2) - (b.sy + b.h / 2));
      const gan = chan.slice(0, 3).sort((a, b) => a.sx - b.sx), xa = chan.slice(3).sort((a, b) => a.sx - b.sx);
      gan.forEach((p, i) => (p.vai = 'chan-gan-' + (i + 1)));
      xa.forEach((p, i) => (p.vai = 'chan-xa-' + (i + 1)));
    }
  };

  // ---------- tự ráp ----------
  // Mỗi vai: cha mặc định, lớp, điểm khớp trên mảnh [fx, fy] (tỉ lệ cỡ mảnh), điểm gắn trên cha [fx, fy] (tỉ lệ cỡ cha).
  const RAP = {
    nguoi: {
      // CÂY XƯƠNG CỐ ĐỊNH: thân là gốc, mọi bộ phận gắn vào thân (vũ khí gắn vào tay trước).
      // Điểm gắn nằm SÂU BÊN TRONG thân áo (không ở mép), xoay bao nhiêu cũng không lộ khoảng trống.
      // Thứ tự vẽ cố định (dưới lên trên): chân sau + tay sau (tối hơn 10%) → thân → ống tên / phụ kiện → đầu → chân trước + tay trước (→ vũ khí).
      // Số đo là tỉ lệ theo khung bao phần CÓ HÌNH của mảnh (không tính lề trống của ô cắt).
      // ĐẦU: tâm xoay ở GỐC chỏm cổ (đáy mảnh đầu), cắm sâu trong cổ áo. Đầu vẽ TRÊN thân, nhưng game vẽ lại
      // riêng dải cổ áo của thân đè lên chỏm cổ (phu_co), nên chỗ nối luôn bị cổ áo che.
      'chan-sau': { cha: 'than', lop: 0, khop: [0.5, 0.12], gan: [0.4, 0.8] },
      'tay-sau': { cha: 'than', lop: 1, khop: [0.45, 0.16], gan: [0.36, 0.26] },
      than: { lop: 2, khop: [0.5, 0.95] },
      'phu-kien': { cha: 'than', lop: 3, khop: [0.5, 0.35], gan: [0.3, 0.3] },
      dau: { cha: 'than', lop: 4, khop: [0.5, 0.99], gan: [0.5, 0.17] },
      'chan-truoc': { cha: 'than', lop: 5, khop: [0.5, 0.12], gan: [0.6, 0.8] },
      'tay-truoc': { cha: 'than', lop: 6, khop: [0.45, 0.16], gan: [0.64, 0.26] },
      'vu-khi': { cha: 'tay-truoc', lop: 7, khop: [0.5, 0.75], gan: [0.62, 0.88] },
    },
    'bon-chan': {
      than: { lop: 2, khop: [0.5, 0.6] },
      dau: { cha: 'than', lop: 5, khop: [0.3, 0.72], gan: [0.86, 0.35] },
      'chan-truoc-gan': { cha: 'than', lop: 1, khop: [0.5, 0.15], gan: [0.72, 0.68] },
      'chan-truoc-xa': { cha: 'than', lop: 0, khop: [0.5, 0.15], gan: [0.62, 0.64] },
      'chan-sau-gan': { cha: 'than', lop: 1, khop: [0.5, 0.15], gan: [0.32, 0.68] },
      'chan-sau-xa': { cha: 'than', lop: 0, khop: [0.5, 0.15], gan: [0.22, 0.64] },
      duoi: { cha: 'than', lop: 0, khop: [0.88, 0.5], gan: [0.05, 0.35] },
      'phu-kien': { cha: 'than', lop: 4, khop: [0.5, 0.6], gan: [0.5, 0.1] },
    },
    cua: {
      than: { lop: 2, khop: [0.5, 0.7] },
      'cang-truoc': { cha: 'than', lop: 1, khop: [0.2, 0.75], gan: [0.9, 0.55] },
      'cang-sau': { cha: 'than', lop: 0, khop: [0.2, 0.75], gan: [0.8, 0.42] },
      'chan-gan-1': { cha: 'than', lop: 1, khop: [0.5, 0.12], gan: [0.3, 0.8] },
      'chan-gan-2': { cha: 'than', lop: 1, khop: [0.5, 0.12], gan: [0.5, 0.82] },
      'chan-gan-3': { cha: 'than', lop: 1, khop: [0.5, 0.12], gan: [0.7, 0.8] },
      'chan-xa-1': { cha: 'than', lop: 0, khop: [0.5, 0.12], gan: [0.22, 0.72] },
      'chan-xa-2': { cha: 'than', lop: 0, khop: [0.5, 0.12], gan: [0.42, 0.74] },
      'chan-xa-3': { cha: 'than', lop: 0, khop: [0.5, 0.12], gan: [0.62, 0.72] },
      'phu-kien': { cha: 'than', lop: 3, khop: [0.5, 0.6], gan: [0.5, 0.1] },
    },
  };
  XR.RAP = RAP;
  const cachRap0 = (khung, vai) => (RAP[khung] || RAP.nguoi)[vai] || { cha: 'than', lop: 3, khop: [0.5, 0.5], gan: [0.5, 0.5] };
  // Phụ kiện to (từ nửa thân trở lên, cao hơn rộng gần bằng): coi là ÁO CHOÀNG / ĐUÔI ÁO: treo ở cổ, nằm sau cùng, rủ ra sau lưng.
  // Mặt quay phải nên mép trên bên phải của tấm áo là chỗ buộc ở cổ.
  const AO_CHOANG = { cha: 'than', lop: -1, khop: [0.8, 0.04], gan: [0.48, 0.12] };
  XR.laAoChoang = function (p, ds) {
    if (p.vai !== 'phu-kien') return false;
    const than = ds.find((q) => q.vai === 'than');
    return !!than && p.w * p.h >= than.w * than.h * 0.45 && p.h >= p.w * 0.7;
  };
  // Phụ kiện vừa (ống tên, túi, khiên đeo lưng: từ 1/8 thân trở lên) ở khung người: đeo sau lưng, nằm sau thân.
  // Phụ kiện nhỏ hơn (chùm lông, chim nhỏ) vẫn gắn lên đầu.
  const DEO_LUNG = { cha: 'than', lop: -0.5, khop: [0.5, 0.45], gan: [0.22, 0.35] };
  const laDoDeoLung = (khung, p, ds) => {
    if (khung !== 'nguoi' || p.vai !== 'phu-kien') return false;
    const than = ds.find((q) => q.vai === 'than');
    return !!than && p.w * p.h >= than.w * than.h * 0.12;
  };
  // Bốn chân có tách NGỰC / CỔ: hông (thân) → ngực → chân trước, cổ → đầu. Khớp đặt sâu bên trong mảnh cha.
  const BON_CHAN_NGUC = {
    nguc: { cha: 'than', lop: 3, khop: [0.22, 0.55], gan: [0.8, 0.5] },            // khớp cột sống ở giữa lưng
    'chan-truoc-gan': { cha: 'nguc', lop: 1, khop: [0.5, 0.15], gan: [0.55, 0.7] },
    'chan-truoc-xa': { cha: 'nguc', lop: 0, khop: [0.5, 0.15], gan: [0.42, 0.66] },
    co: { cha: 'nguc', lop: 4, khop: [0.25, 0.8], gan: [0.75, 0.35] },
    dau: { cha: 'co', lop: 5, khop: [0.3, 0.72], gan: [0.75, 0.3] },
  };
  function cachBonChan(vai, ds) {
    const coNguc = ds.some((q) => q.vai === 'nguc'), coCo = ds.some((q) => q.vai === 'co');
    if (vai === 'nguc') return BON_CHAN_NGUC.nguc;
    if (vai === 'co') return Object.assign({}, BON_CHAN_NGUC.co, coNguc ? {} : { cha: 'than', gan: [0.86, 0.3] });
    if (vai === 'dau' && coCo) return BON_CHAN_NGUC.dau;
    if (vai === 'dau' && coNguc) return { cha: 'nguc', lop: 5, khop: [0.3, 0.72], gan: [0.82, 0.35] };
    if (/^chan-truoc/.test(vai) && coNguc) return BON_CHAN_NGUC[vai];
    return null;
  }
  const cachRap = (khung, vai, p, ds) => (p && ds && XR.laAoChoang(p, ds) ? AO_CHOANG : (khung === 'bon-chan' && ds && cachBonChan(vai, ds)) || cachRap0(khung, vai));
  void laDoDeoLung; void DEO_LUNG; // (bỏ: phụ kiện giờ luôn vẽ ngay sau thân theo thứ tự lớp cố định)

  // Đặt tên duy nhất theo vai (tên dùng trong tệp)
  XR.datTen = function (ds) {
    const dem = {};
    for (const p of ds) { const v = p.vai || 'manh'; dem[v] = (dem[v] || 0) + 1; p.ten = dem[v] > 1 ? v + '-' + dem[v] : v; }
  };

  // Chọn cha mặc định cho mọi mảnh (theo id)
  XR.chaMacDinh = function (khung, ds) {
    const goc = ds.find((p) => p.vai === 'than') || ds.slice().sort((a, b) => b.w * b.h - a.w * a.h)[0];
    for (const p of ds) {
      if (p === goc) { p.cha = null; continue; }
      const c = cachRap(khung, p.vai, p, ds);
      let cha = ds.find((q) => q !== p && q.vai === c.cha);
      if (!cha && c.cha === 'tay-truoc') cha = ds.find((q) => q.vai === 'tay-sau');
      if (!cha && c.cha === 'dau') cha = goc;
      p.cha = (cha || goc).id;
      if (p.cha === p.id) p.cha = null;
    }
    // chặn vòng lặp cha-con
    for (const p of ds) if (XR.laConChau(ds, p.cha, p.id)) p.cha = goc && goc !== p ? goc.id : null;
  };
  // a có phải là p hoặc con cháu của p không
  // ---------- xoay mảnh trong tư thế ráp ----------
  // Định dạng tệp không có góc nghỉ, nên góc được "nướng" vào ảnh mảnh: luôn xoay từ ảnh gốc cv0 (không mờ dần khi xoay nhiều lần).
  // Toạ độ: điểm q trong ảnh gốc nằm ở  dat + R(a)·q − m  (m: góc trên trái của ảnh sau khi xoay).
  function nuong(cv0, a) {
    const w = cv0.width, h = cv0.height, c = Math.cos(a), s = Math.sin(a);
    const xs = [0, w * c, -h * s, w * c - h * s], ys = [0, w * s, h * c, w * s + h * c];
    const m = [Math.floor(Math.min(...xs)), Math.floor(Math.min(...ys))];
    const W = Math.ceil(Math.max(...xs)) - m[0], H = Math.ceil(Math.max(...ys)) - m[1];
    const cv = XR.taoCanvas(W, H), x = cv.getContext('2d');
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.translate(-m[0], -m[1]); x.rotate(a); x.drawImage(cv0, 0, 0);
    return { cv, m };
  }
  // Xoay mảnh p (và mọi mảnh con cháu) quanh khớp của p thêm `do` độ (dương = theo chiều kim đồng hồ).
  XR.xoayManh = function (ds, p, doXoay) {
    const d = doXoay * Math.PI / 180, cd = Math.cos(d), sd = Math.sin(d), T = p.truc.slice();
    const quay = (v) => [T[0] + cd * (v[0] - T[0]) - sd * (v[1] - T[1]), T[1] + sd * (v[0] - T[0]) + cd * (v[1] - T[1])];
    const nhom = [p];
    const di = (id) => { for (const q of ds) if (q.cha === id && nhom.indexOf(q) < 0) { nhom.push(q); di(q.id); } };
    di(p.id);
    for (const q of nhom) {
      if (!q.cv0) { q.cv0 = q.cv; q.a = 0; q.m = [0, 0]; }
      const goc = quay([q.dat[0] - q.m[0], q.dat[1] - q.m[1]]); // vị trí điểm (0,0) của ảnh gốc sau khi xoay
      q.a = (q.a || 0) + d;
      if (Math.abs(q.a) < 1e-6) q.a = 0;
      const r = q.a ? nuong(q.cv0, q.a) : { cv: q.cv0, m: [0, 0] };
      q.cv = r.cv; q.m = r.m; q.w = r.cv.width; q.h = r.cv.height;
      q.dat = [Math.round(goc[0] + r.m[0]), Math.round(goc[1] + r.m[1])];
      q.truc = quay(q.truc).map((v) => Math.round(v));
      q._a = null; q.so = null;
    }
  };
  // Tâm đầu tròn trên cùng của một chi (toạ độ trong mảnh): đi từ hàng có hình đầu tiên xuống tới khi
  // quãng đã đi bằng nửa bề ngang của chi ở hàng đó: đó là tâm hình tròn đầu khớp.
  // Khung bao phần có hình (bỏ lề trong suốt của ô cắt), nhớ theo ảnh
  XR.hopHinh = function (p) {
    if (p._hop && p._hop.cv === p.cv) return p._hop;
    const w = p.cv.width, h = p.cv.height, d = p.cv.getContext('2d').getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 100) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) { x0 = 0; y0 = 0; x1 = w - 1; y1 = h - 1; }
    return (p._hop = { cv: p.cv, x0, y0, w: x1 - x0 + 1, h: y1 - y0 + 1 });
  };
  XR.tamDauTron = function (p) {
    const w = p.w, h = p.h, d = p.cv.getContext('2d').getImageData(0, 0, w, h).data;
    const nhip = (y) => { let a = -1, b = -1; for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 128) { if (a < 0) a = x; b = x; } return a < 0 ? null : [a, b]; };
    let y0 = -1;
    for (let y = 0; y < h; y++) if (nhip(y)) { y0 = y; break; }
    if (y0 < 0) return null;
    let tot = null;
    for (let y = y0; y < Math.min(h, y0 + h * 0.45); y++) {
      const n = nhip(y); if (!n) continue;
      const r = (n[1] - n[0]) / 2;
      tot = [(n[0] + n[1]) / 2, y];
      if (y - y0 >= r * 0.9) break;
    }
    return tot;
  };
  // NẮP KHỚP ("bản lề ảo"): hình tròn cùng màu chi, vẽ ngay tại tâm khớp, đè lên chỗ nối để xoay mạnh cũng không hở.
  // Trả về [bán kính, '#màu'] (toạ độ mảnh) cho tay, chân, càng, đầu (gốc cổ), cổ; mảnh khác: null.
  XR.napKhop = function (p, khung) {
    // chỉ chi (tay, chân, càng) và đầu NGƯỜI (tâm ở gốc cổ); đầu thú tâm nằm giữa mặt nên không vẽ nắp
    if (!/^(tay|chan|cang)/.test(p.vai || '') && !(p.vai === 'dau' && khung === 'nguoi')) return null;
    const cv = p.cv0 || p.cv, w = cv.width, h = cv.height, d = cv.getContext('2d').getImageData(0, 0, w, h).data;
    const l = XR.vaoGoc(p, p.truc), lx = Math.round(l[0]), ly = Math.round(l[1]);
    const co = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 200;
    let y = Math.max(0, Math.min(h - 1, ly)); if (p.vai === 'dau') y = Math.max(0, y - Math.round(h * 0.03));
    let a = lx, b = lx;
    if (!co(lx, y)) return null;
    while (co(a - 1, y)) a--; while (co(b + 1, y)) b++;
    const r = Math.max(2, (b - a) * 0.36);
    let sr = 0, sg = 0, sb = 0, n = 0;
    for (let yy = Math.round(y - r * 0.6); yy <= y + r * 0.6; yy++) for (let xx = Math.round(lx - r * 0.6); xx <= lx + r * 0.6; xx++) {
      if (!co(xx, yy)) continue;
      const i = (yy * w + xx) * 4, sang = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
      if (sang < 70) continue; // bỏ nét viền tối
      sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; n++;
    }
    if (!n) return null;
    const hx = (v) => Math.round(v / n).toString(16).padStart(2, '0');
    return [Math.round(r * 10) / 10, '#' + hx(sr) + hx(sg) + hx(sb)];
  };
  // DẢI CỔ ÁO (khung người): ô chữ nhật quanh chỗ cổ cắm vào thân (toạ độ tư thế ráp). Game vẽ lại phần thân trong ô này
  // ngay sau khi vẽ đầu, để viền cổ áo đè lên chỏm cổ. Trả về [x, y, w, h] hoặc null.
  XR.dayCoAo = function (ds, khung) {
    if (khung !== 'nguoi') return null;
    const dau = ds.find((p) => p.vai === 'dau'), than = ds.find((p) => p.vai === 'than');
    if (!dau || !than || dau.cha !== than.id) return null;
    const n = XR.napKhop(dau, khung); if (!n) return null;
    const rong = (n[0] / 0.36) * 1.5; // bề ngang cổ x 1,5
    return [dau.truc[0] - rong / 2, dau.truc[1] - rong * 0.45, rong, rong * 0.9];
  };
  XR.gocManh = (p) => Math.round(((p.a || 0) * 180) / Math.PI);

  XR.laConChau = function (ds, a, p) {
    let k = a, buoc = 0;
    while (k != null && buoc++ < 50) { if (k === p) return true; const q = ds.find((x) => x.id === k); k = q ? q.cha : null; }
    return false;
  };

  // Tự ráp: đặt dat, truc, lop cho mọi mảnh và trả về goc (điểm chân chạm đất)
  XR.tuRap = function (khung, ds) {
    if (!ds.length) return [0, 0];
    ds.forEach(goXoay); // ráp lại từ đầu: mảnh đã xoay trở về thẳng
    XR.chaMacDinh(khung, ds);
    const byId = {}; ds.forEach((p) => (byId[p.id] = p));
    const xong = new Set();
    let vong = 0;
    while (xong.size < ds.length && vong++ < 20) {
      for (const p of ds) {
        if (xong.has(p.id)) continue;
        const c = cachRap(khung, p.vai, p, ds);
        p.lop = c.lop;
        if (p.cha == null) {
          const hp = XR.hopHinh(p);
          p.dat = [0, 0]; p.truc = [hp.x0 + hp.w * c.khop[0], hp.y0 + hp.h * c.khop[1]]; xong.add(p.id); continue;
        }
        const cha = byId[p.cha]; if (!cha || !xong.has(cha.id)) continue;
        const g = c.gan || [0.5, 0.5], hc = XR.hopHinh(cha);
        const gx = cha.dat[0] + hc.x0 + hc.w * g[0];
        const gy = cha.dat[1] + hc.y0 + hc.h * g[1];
        void mepNgang;
        // Tay, chân, càng: khớp đặt ĐÚNG TÂM đầu tròn trên cùng của mảnh, nên xoay bao nhiêu thì đầu tròn vẫn nằm yên dưới thân, không lộ mép
        const tam = /^(tay|chan|cang)/.test(p.vai) && !XR.laAoChoang(p, ds) ? XR.tamDauTron(p) : null;
        const hp = XR.hopHinh(p);
        const kx = tam ? tam[0] : hp.x0 + hp.w * c.khop[0], ky = tam ? tam[1] : hp.y0 + hp.h * c.khop[1];
        p.dat = [Math.round(gx - kx), Math.round(gy - ky)];
        p.truc = [Math.round(gx), Math.round(gy)];
        xong.add(p.id);
      }
    }
    for (const p of ds) if (!p.dat) { p.dat = [0, 0]; p.truc = [p.w / 2, p.h / 2]; p.lop = p.lop || 0; }
    return XR.tinhGoc(ds);
  };
  // Điểm có hình xa nhất bên phải (phai) hoặc trái của mảnh ở độ cao fy (tỉ lệ), tính trong mảnh
  function mepNgang(p, fy, phai) {
    const y = Math.max(0, Math.min(p.h - 1, Math.round(p.h * fy)));
    const d = p.cv.getContext('2d').getImageData(0, y, p.w, 1).data;
    if (phai) { for (let x = p.w - 1; x >= 0; x--) if (d[x * 4 + 3] > 128) return x; }
    else { for (let x = 0; x < p.w; x++) if (d[x * 4 + 3] > 128) return x; }
    return null;
  }
  // Điểm chân: giữa thân theo chiều ngang, đáy thấp nhất của các chân (hoặc của cả con)
  // ---------- KHUNG MẪU (cấu hình ráp có sẵn) ----------
  // Ghi lại cách ráp của một con đã chỉnh tay để ráp con khác cùng khung y như vậy, không phải đoán.
  // Mọi số là TỈ LỆ theo cỡ mảnh (không phải điểm ảnh), nên dùng được cho ảnh Gemini to nhỏ khác nhau.
  //   vai[ten]: { cha: tên mảnh cha, khop: [fx, fy] khớp trên mảnh, gan: [fx, fy] chỗ gắn trên mảnh cha, lop, goc: độ }
  //   goc: điểm chân, tỉ lệ theo khung bao của mảnh gốc (thân)
  function goXoay(p) { // trả mảnh về góc 0 (ảnh gốc) mà giữ nguyên khớp
    if (!p.a) return;
    const T = p.truc.slice(), c = Math.cos(-p.a), s = Math.sin(-p.a);
    const q0 = [p.dat[0] - p.m[0], p.dat[1] - p.m[1]]; // vị trí điểm (0,0) ảnh gốc
    const lx = c * (T[0] - q0[0]) - s * (T[1] - q0[1]), ly = s * (T[0] - q0[0]) + c * (T[1] - q0[1]); // khớp trong ảnh gốc
    p.cv = p.cv0; p.w = p.cv.width; p.h = p.cv.height; p.a = 0; p.m = [0, 0];
    p.dat = [Math.round(T[0] - lx), Math.round(T[1] - ly)]; p._a = null; p.so = null;
  }
  // Điểm pt (toạ độ ráp) đổi sang toạ độ trong ẢNH GỐC (chưa xoay) của mảnh p
  function vaoGoc(p, pt) {
    if (!p.a) return [pt[0] - p.dat[0], pt[1] - p.dat[1]];
    const q0 = [p.dat[0] - p.m[0], p.dat[1] - p.m[1]], c = Math.cos(-p.a), s = Math.sin(-p.a), dx = pt[0] - q0[0], dy = pt[1] - q0[1];
    return [c * dx - s * dy, s * dx + c * dy];
  }
  XR.vaoGoc = (p, pt) => vaoGoc(p, pt);
  // CẤU HÌNH KHUNG XƯƠNG dạng đơn giản (ô cắt tĩnh trên ảnh sheet + tâm xoay + điểm gắn), cho ai muốn tự viết bộ vẽ riêng.
  // sourceRect: ô cắt trên ảnh sheet (điểm ảnh); pivot: tâm xoay trong ô cắt; attachTo: mảnh cha; offset: từ tâm xoay của cha
  // tới tâm xoay của mảnh (tư thế đứng); rotation: góc nghỉ (độ); z: thứ tự vẽ (nhỏ vẽ trước).
  XR.cauHinh = function (S) {
    const ds = S.manh; XR.datTen(ds);
    const byId = {}; ds.forEach((p) => (byId[p.id] = p));
    const out = { loai: 'xuong-roi-cau-hinh', phien_ban: 1, ten: S.ten || '', khung: S.khung, anhSheet: S.coGoc ? S.coGoc[0] : null,
      canvasWidth: S.coGoc ? S.coGoc[1] : null, canvasHeight: S.coGoc ? S.coGoc[2] : null, goc: S.goc.slice(), parts: {} };
    for (const p of ds.slice().sort((a, b) => a.lop - b.lop)) {
      const pv = vaoGoc(p, p.truc).map((v) => Math.round(v)), cha = p.cha ? byId[p.cha] : null;
      const e = { vai: p.vai, z: p.lop, rotation: Math.round(((p.a || 0) * 180) / Math.PI), flipX: !!p.lat, pivot: { x: pv[0], y: pv[1] } };
      if (p.rect) e.sourceRect = { x: p.rect[0], y: p.rect[1], w: p.rect[2], h: p.rect[3] };
      if (cha) { e.attachTo = cha.ten; e.offset = { x: Math.round(p.truc[0] - cha.truc[0]), y: Math.round(p.truc[1] - cha.truc[1]) }; }
      else e.isRoot = true;
      out.parts[p.ten] = e;
    }
    return out;
  };
  XR.layKhungMau = function (khung, ds, goc, ten) {
    XR.datTen(ds);
    const byId = {}; ds.forEach((p) => (byId[p.id] = p));
    const mau = { loai: 'xuong-roi-khung-mau', ten: ten || 'Khung mẫu', khung, vai: {}, goc: null };
    for (const p of ds) {
      // số đo ở góc 0: xoay ngược khớp về ảnh gốc
      const a = p.a || 0, w0 = p.cv0 ? p.cv0.width : p.w, h0 = p.cv0 ? p.cv0.height : p.h;
      const [lx, ly] = vaoGoc(p, p.truc);
      const cha = p.cha ? byId[p.cha] : null;
      const e = { cha: cha ? cha.ten : null, vaiCha: cha ? cha.vai : null, khop: [lx / w0, ly / h0], lop: p.lop, goc: Math.round((a * 180) / Math.PI) };
      if (cha) { // chỗ gắn tính trong ảnh gốc của cha (cha chưa xoay)
        const g = vaoGoc(cha, p.truc), cw = cha.cv0 ? cha.cv0.width : cha.w, chh = cha.cv0 ? cha.cv0.height : cha.h;
        e.gan = [g[0] / cw, g[1] / chh];
      }
      mau.vai[p.ten] = e;
    }
    const goc0 = ds.find((p) => p.cha == null);
    if (goc0) mau.goc = [(goc[0] - goc0.dat[0]) / goc0.w, (goc[1] - goc0.dat[1]) / goc0.h];
    return mau;
  };
  // Ráp theo khung mẫu. Mảnh nào mẫu không có thì ráp như cũ (tự đoán). Trả về điểm chân.
  XR.rapTheoMau = function (khung, ds, mau) {
    ds.forEach(goXoay);
    let goc = XR.tuRap(khung, ds); // nền: cách ráp tự đoán, rồi đè bằng mẫu
    XR.datTen(ds);
    const theoTen = {}; ds.forEach((p) => (theoTen[p.ten] = p));
    for (const p of ds) {
      const e = mau.vai[p.ten]; if (!e) continue;
      p.lop = e.lop;
      const cha = e.cha ? theoTen[e.cha] : null;
      if (e.cha === null) p.cha = null; else if (cha && cha !== p && !XR.laConChau(ds, cha.id, p.id)) p.cha = cha.id;
    }
    // đặt lại vị trí: cha trước con
    const da = new Set(), byId = {}, dich = {}; ds.forEach((p) => (byId[p.id] = p));
    const dat = (p) => {
      if (da.has(p.id)) return; da.add(p.id);
      const cha = p.cha ? byId[p.cha] : null; if (cha) dat(cha);
      const e = mau.vai[p.ten], d0 = p.dat.slice();
      if (!e) { // mẫu không có mảnh này: đi theo cha
        const d = (cha && dich[cha.id]) || [0, 0];
        p.dat = [p.dat[0] + d[0], p.dat[1] + d[1]]; p.truc = [p.truc[0] + d[0], p.truc[1] + d[1]]; dich[p.id] = d; return;
      }
      const kx = p.w * e.khop[0], ky = p.h * e.khop[1];
      if (cha && e.gan) {
        const gx = cha.dat[0] + cha.w * e.gan[0], gy = cha.dat[1] + cha.h * e.gan[1];
        const dx = Math.round(gx - kx) - p.dat[0], dy = Math.round(gy - ky) - p.dat[1];
        p.dat = [p.dat[0] + dx, p.dat[1] + dy];
      } else if (!cha) p.dat = [0, 0];
      p.truc = [Math.round(p.dat[0] + kx), Math.round(p.dat[1] + ky)];
      dich[p.id] = [p.dat[0] - d0[0], p.dat[1] - d0[1]];
    };
    ds.forEach(dat);
    const goc0 = ds.find((p) => p.cha == null);
    if (goc0 && mau.goc) goc = [Math.round(goc0.dat[0] + goc0.w * mau.goc[0]), Math.round(goc0.dat[1] + goc0.h * mau.goc[1])];
    else goc = XR.tinhGoc(ds);
    // góc xoay: cha trước con (mảnh con đã tính góc riêng nên trừ phần cha đã xoay)
    const thuTu = []; const di = (p) => { if (thuTu.indexOf(p) >= 0) return; if (p.cha && byId[p.cha]) di(byId[p.cha]); thuTu.push(p); };
    ds.forEach(di);
    for (const p of thuTu) {
      const e = mau.vai[p.ten]; if (!e || !e.goc) continue;
      const can = e.goc - Math.round(((p.a || 0) * 180) / Math.PI);
      if (can) XR.xoayManh(ds, p, can);
    }
    return goc;
  };
  // Lấy khung mẫu từ một tệp .rig.json đã xuất (không có góc xoay vì góc đã nướng vào ảnh)
  XR.mauTuTep = function (tep) {
    if (!tep || tep.loai !== 'linh-khi-rig' || !Array.isArray(tep.manh)) throw new Error('Đây không phải tệp .rig.json');
    const theoTen = {}; tep.manh.forEach((m) => (theoTen[m.ten] = m));
    const mau = { loai: 'xuong-roi-khung-mau', ten: tep.ten || tep.ma, khung: tep.khung || 'nguoi', vai: {}, goc: null };
    for (const m of tep.manh) {
      const w = m.o[2], h = m.o[3], cha = m.cha ? theoTen[m.cha] : null;
      const e = { cha: m.cha || null, khop: [(m.truc[0] - m.dat[0]) / w, (m.truc[1] - m.dat[1]) / h], lop: m.lop, goc: 0 };
      if (cha) e.gan = [(m.truc[0] - cha.dat[0]) / cha.o[2], (m.truc[1] - cha.dat[1]) / cha.o[3]];
      mau.vai[m.ten] = e;
    }
    const g = tep.manh.find((m) => !m.cha);
    if (g && tep.goc) mau.goc = [(tep.goc[0] - g.dat[0]) / g.o[2], (tep.goc[1] - g.dat[1]) / g.o[3]];
    return mau;
  };

  XR.tinhGoc = function (ds) {
    const than = ds.find((p) => p.cha == null) || ds[0];
    const chan = ds.filter((p) => /^chan/.test(p.vai));
    const day = Math.max(...(chan.length ? chan : ds).map((p) => { const b = XR.hopHinh(p); return p.dat[1] + b.y0 + b.h; }));
    return [Math.round(than.dat[0] + than.w / 2), Math.round(day)];
  };

  // Khung bao của tư thế ráp
  XR.khungRap = function (ds) {
    if (!ds.length) return { x0: 0, y0: 0, x1: 100, y1: 100 };
    return {
      x0: Math.min(...ds.map((p) => p.dat[0])), y0: Math.min(...ds.map((p) => p.dat[1])),
      x1: Math.max(...ds.map((p) => p.dat[0] + p.w)), y1: Math.max(...ds.map((p) => p.dat[1] + p.h)),
    };
  };

  // Vẽ tĩnh tư thế ráp (không cần bộ động tác)
  // ---------- tô tối mảnh phía sau ----------
  // Prompt mới bảo Gemini vẽ hai tay (hai chân) GIỐNG HỆT nhau; công cụ tự tô tối mảnh phía sau cho có chiều sâu.
  const CAP = { 'tay-sau': 'tay-truoc', 'chan-sau': 'chan-truoc', 'chan-truoc-xa': 'chan-truoc-gan', 'chan-sau-xa': 'chan-sau-gan',
    'cang-sau': 'cang-truoc', 'chan-xa-1': 'chan-gan-1', 'chan-xa-2': 'chan-gan-2', 'chan-xa-3': 'chan-gan-3' };
  XR.DO_TOI = 0.1; // tay chân phía sau tối hơn 10%
  XR.tinhToi = function (ds, bat) {
    for (const p of ds) {
      p.toi = 0;
      if (!bat || !CAP[p.vai] || p.daToi) continue; // daToi: ảnh mở từ tệp đã xuất, đã tô tối sẵn
      const truoc = ds.find((q) => q.vai === CAP[p.vai]);
      if (!p.so) p.so = XR.doManh(p.cv);
      if (truoc && !truoc.so) truoc.so = XR.doManh(truoc.cv);
      // Gemini đã vẽ tối sẵn (tối hơn mảnh trước rõ rệt) thì thôi
      if (truoc && p.so.sang < truoc.so.sang - 18) continue;
      p.toi = XR.DO_TOI;
    }
  };
  // Ảnh để vẽ/xuất của một mảnh (đã tô tối nếu cần)
  XR.anhVe = function (p) {
    if (!p.toi) return p.cv;
    if (p._toi && p._toi.cv === p.cv && p._toi.k === p.toi) return p._toi.anh;
    const c = XR.taoCanvas(p.cv.width, p.cv.height), x = c.getContext('2d');
    x.drawImage(p.cv, 0, 0);
    x.globalCompositeOperation = 'source-atop';
    x.fillStyle = 'rgba(28,16,40,' + p.toi + ')';
    x.fillRect(0, 0, c.width, c.height);
    p._toi = { cv: p.cv, k: p.toi, anh: c };
    return c;
  };

  XR.veTinh = function (ctx, ds, chon) {
    const thuTu = ds.slice().sort((a, b) => a.lop - b.lop);
    for (const p of thuTu) {
      ctx.globalAlpha = chon && chon !== p.id && XR._mo ? 0.5 : 1;
      ctx.drawImage(XR.anhVe(p), p.dat[0], p.dat[1]);
    }
    ctx.globalAlpha = 1;
  };

  // ---------- đóng gói ----------
  // Xếp các mảnh vào một ảnh (xếp kệ, cao trước). k: hệ số thu nhỏ. Trả về { cv, o: {id: [x,y,w,h]} }
  XR.xepAnh = function (ds, k) {
    const pad = 2;
    const cac = ds.map((p) => ({ p, w: Math.max(1, Math.round(p.w * k)), h: Math.max(1, Math.round(p.h * k)) })).sort((a, b) => b.h - a.h);
    const tong = cac.reduce((s, c) => s + (c.w + pad) * (c.h + pad), 0);
    const rong = Math.max(Math.ceil(Math.sqrt(tong) * 1.15), ...cac.map((c) => c.w + pad * 2));
    let x = pad, y = pad, cao = 0;
    for (const c of cac) {
      if (x + c.w + pad > rong) { x = pad; y += cao + pad; cao = 0; }
      c.x = x; c.y = y; x += c.w + pad; cao = Math.max(cao, c.h);
    }
    const cv = XR.taoCanvas(rong, y + cao + pad), cx = cv.getContext('2d'), o = {};
    for (const c of cac) {
      const goc = XR.anhVe(c.p), anh = k === 1 ? goc : XR.thuNho(goc, c.w, c.h);
      cx.drawImage(anh, c.x, c.y, c.w, c.h);
      o[c.p.id] = [c.x, c.y, c.w, c.h];
    }
    return { cv, o };
  };

  // Tạo tệp linh-khi-rig v1. S: trạng thái công cụ. k: hệ số thu nhỏ (1 = giữ nguyên).
  XR.taoTep = function (S, k) {
    k = k || 1;
    const ds = S.manh;
    XR.datTen(ds);
    const { cv, o } = XR.xepAnh(ds, k);
    const tenTheoId = {}; ds.forEach((p) => (tenTheoId[p.id] = p.ten));
    const r = (v) => Math.round(v * k * 10) / 10;
    const tep = {
      loai: 'linh-khi-rig', phien_ban: 1,
      ma: S.ma || XR.taoMa(S.ten) || 'chua-dat-ten', ten: S.ten || 'Chưa đặt tên',
      doi_tuong: S.doi_tuong || 'em-be',
      thay_cho: S.doi_tuong === 'quai' ? S.thay_cho || '' : S.thay_cho || 'hero',
      khung: S.khung || 'nguoi',
      anh: cv.toDataURL('image/png'),
      cao: +S.cao || 40,
      goc: [r(S.goc[0]), r(S.goc[1])],
      manh: ds.slice().sort((a, b) => a.lop - b.lop).map((p) => ({
        ten: p.ten, vai: p.vai, cha: p.cha == null ? null : tenTheoId[p.cha] || null,
        o: o[p.id], dat: [r(p.dat[0]), r(p.dat[1])], truc: [r(p.truc[0]), r(p.truc[1])], lop: p.lop,
        ...((p.toi || p.daToi) ? { da_to_toi: true } : {}), // công cụ đã tô tối sẵn trong ảnh (game bỏ qua khoá này)
        ...(p.vai === 'than' && S.banLe !== false && XR.dayCoAo(ds, S.khung) ? { phu_co: XR.dayCoAo(ds, S.khung).map((v) => Math.round(v * k * 10) / 10) } : {}),
        ...(S.banLe !== false && XR.napKhop(p, S.khung) ? { nap: ((n) => [Math.round(n[0] * k * 10) / 10, n[1]])(XR.napKhop(p, S.khung)) } : {}),
      })),
    };
    if (S.dong_tac && Object.keys(S.dong_tac).length) tep.dong_tac = JSON.parse(JSON.stringify(S.dong_tac));
    return { tep, cv };
  };

  // Xuất: thu nhỏ dần tới khi ảnh dưới ~300 KB (cạnh ảnh tối đa 2048)
  XR.xuat = function (S) {
    const tongDien = S.manh.reduce((s, p) => s + p.w * p.h, 0);
    let k = Math.min(1, Math.sqrt(2048 * 2048 * 0.6 / Math.max(1, tongDien)));
    const caoRap = (() => { const b = XR.khungRap(S.manh); return b.y1 - b.y0; })();
    k = Math.min(k, 900 / Math.max(1, caoRap)); // nhân vật cao tối đa 900 điểm ảnh: đủ nét cho màn chơi nét cao
    let kq = null;
    for (let lan = 0; lan < 12; lan++) {
      kq = XR.taoTep(S, k);
      const kb = kq.tep.anh.length / 1024 + 2; // cỡ tệp .rig.json (ảnh base64 + phần chữ)
      kq.kb = Math.round(kb); kq.k = k;
      if (kb <= 295 || k < 0.2) break;
      k *= Math.max(0.6, Math.min(0.92, Math.sqrt(290 / kb)));
    }
    return kq;
  };

  // Mở tệp đã xuất -> danh sách mảnh để sửa tiếp
  XR.moTep = async function (tep) {
    if (!tep || tep.loai !== 'linh-khi-rig' || !Array.isArray(tep.manh)) throw new Error('Đây không phải tệp .rig.json của Xưởng Rối');
    const img = await XR.tuDataUrl(tep.anh);
    const ds = tep.manh.map((m, i) => {
      const [x, y, w, h] = m.o, cv = XR.taoCanvas(w, h);
      cv.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h);
      return { id: 'm' + (i + 1) + '_' + Date.now().toString(36), ten: m.ten, vai: m.vai, chaTen: m.cha, cv, w, h, sx: m.dat[0], sy: m.dat[1], dat: m.dat.slice(), truc: m.truc.slice(), lop: m.lop, daToi: !!m.da_to_toi };
    });
    for (const p of ds) { const c = ds.find((q) => q.ten === p.chaTen); p.cha = c ? c.id : null; delete p.chaTen; }
    return {
      ten: tep.ten || '', ma: tep.ma || '', doi_tuong: tep.doi_tuong || 'em-be', thay_cho: tep.thay_cho || '', khung: tep.khung || 'nguoi',
      cao: tep.cao || 40, goc: (tep.goc || [0, 0]).slice(), dong_tac: tep.dong_tac || {}, manh: ds,
    };
  };
})();
