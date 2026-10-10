// XƯỞNG RỐI: vai các mảnh theo khung, tự đoán vai, tự ráp tư thế đứng, đóng gói ảnh và tệp linh-khi-rig.
(function () {
  'use strict';
  const XR = (window.XR = window.XR || {});

  XR.KHUNG = { nguoi: 'Người', 'bon-chan': 'Bốn chân', cua: 'Cua / bọ' };
  XR.VAI = {
    nguoi: [['dau', 'Đầu'], ['than', 'Thân'], ['tay-truoc', 'Tay trước'], ['tay-sau', 'Tay sau'], ['chan-truoc', 'Chân trước'], ['chan-sau', 'Chân sau'],
      ['vu-khi', 'Vũ khí'], ['phu-kien', 'Phụ kiện (tóc, khăn…)']],
    'bon-chan': [['dau', 'Đầu'], ['than', 'Thân'], ['chan-truoc-gan', 'Chân trước (gần)'], ['chan-truoc-xa', 'Chân trước (xa)'],
      ['chan-sau-gan', 'Chân sau (gần)'], ['chan-sau-xa', 'Chân sau (xa)'], ['duoi', 'Đuôi'], ['phu-kien', 'Phụ kiện']],
    cua: [['than', 'Thân / mai'], ['cang-truoc', 'Càng trước'], ['cang-sau', 'Càng sau'], ['chan-gan-1', 'Chân gần 1'], ['chan-gan-2', 'Chân gần 2'],
      ['chan-gan-3', 'Chân gần 3'], ['chan-xa-1', 'Chân xa 1'], ['chan-xa-2', 'Chân xa 2'], ['chan-xa-3', 'Chân xa 3'], ['phu-kien', 'Phụ kiện']],
  };
  XR.tenVai = function (khung, vai) { const v = (XR.VAI[khung] || []).find((a) => a[0] === vai); return v ? v[1] : vai || '?'; };
  XR.DONG_TAC = [['idle', 'Đứng thở'], ['move', 'Đi'], ['tele', 'Chuẩn bị đánh'], ['atk', 'Đánh'], ['hit', 'Trúng đòn'], ['die', 'Chết']];
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
    const sangTruoc = (a, b) => b.so.sang - a.so.sang; // sáng hơn đứng trước = gần
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
      // 4 chi: dài nhất trong phần còn lại
      const chi = lay(4).sort((a, b) => cy(a) - cy(b));
      const tay = chi.slice(0, 2).sort(sangTruoc), chan = chi.slice(2).sort(sangTruoc);
      if (tay[0]) tay[0].vai = 'tay-truoc'; if (tay[1]) tay[1].vai = 'tay-sau';
      if (chan[0]) chan[0].vai = 'chan-truoc'; if (chan[1]) chan[1].vai = 'chan-sau';
      if (chan.length < 2 && tay.length === 2 && chan.length === 0) { tay[1].vai = 'chan-truoc'; }
      const daiTay = Math.max(1, ...chi.map((p) => Math.max(p.w, p.h)));
      for (const p of theoCo) if (Math.max(p.w, p.h) > daiTay * 1.2 && !ds.some((q) => q.vai === 'vu-khi')) p.vai = 'vu-khi';
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
      const chan = lay(6).sort(sangTruoc);
      const gan = chan.slice(0, 3).sort((a, b) => a.sx - b.sx), xa = chan.slice(3).sort((a, b) => a.sx - b.sx);
      gan.forEach((p, i) => (p.vai = 'chan-gan-' + (i + 1)));
      xa.forEach((p, i) => (p.vai = 'chan-xa-' + (i + 1)));
    }
  };

  // ---------- tự ráp ----------
  // Mỗi vai: cha mặc định, lớp, điểm khớp trên mảnh [fx, fy] (tỉ lệ cỡ mảnh), điểm gắn trên cha [fx, fy] (tỉ lệ cỡ cha).
  const RAP = {
    nguoi: {
      than: { lop: 3, khop: [0.5, 0.95] },
      dau: { cha: 'than', lop: 5, khop: [0.5, 0.93], gan: [0.5, 0.1] },
      'tay-truoc': { cha: 'than', lop: 7, khop: [0.3, 0.12], gan: [0.66, 0.2] },
      'tay-sau': { cha: 'than', lop: 1, khop: [0.3, 0.12], gan: [0.38, 0.2] },
      'chan-truoc': { cha: 'than', lop: 2, khop: [0.5, 0.12], gan: [0.62, 0.86] },
      'chan-sau': { cha: 'than', lop: 0, khop: [0.5, 0.12], gan: [0.38, 0.86] },
      'vu-khi': { cha: 'tay-truoc', lop: 6, khop: [0.5, 0.75], gan: [0.62, 0.88] },
      'phu-kien': { cha: 'dau', lop: 4, khop: [0.5, 0.2], gan: [0.2, 0.45] },
    },
    'bon-chan': {
      than: { lop: 2, khop: [0.5, 0.6] },
      dau: { cha: 'than', lop: 5, khop: [0.3, 0.72], gan: [0.86, 0.35] },
      'chan-truoc-gan': { cha: 'than', lop: 1, khop: [0.5, 0.15], gan: [0.74, 0.74] },
      'chan-truoc-xa': { cha: 'than', lop: 0, khop: [0.5, 0.15], gan: [0.62, 0.7] },
      'chan-sau-gan': { cha: 'than', lop: 1, khop: [0.5, 0.15], gan: [0.3, 0.74] },
      'chan-sau-xa': { cha: 'than', lop: 0, khop: [0.5, 0.15], gan: [0.18, 0.7] },
      duoi: { cha: 'than', lop: 0, khop: [0.88, 0.5], gan: [0.05, 0.35] },
      'phu-kien': { cha: 'than', lop: 4, khop: [0.5, 0.6], gan: [0.5, 0.1] },
    },
    cua: {
      than: { lop: 2, khop: [0.5, 0.7] },
      'cang-truoc': { cha: 'than', lop: 5, khop: [0.2, 0.75], gan: [0.9, 0.55] },
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
  const cachRap = (khung, vai) => (RAP[khung] || RAP.nguoi)[vai] || { cha: 'than', lop: 3, khop: [0.5, 0.5], gan: [0.5, 0.5] };

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
      const c = cachRap(khung, p.vai);
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
  XR.laConChau = function (ds, a, p) {
    let k = a, buoc = 0;
    while (k != null && buoc++ < 50) { if (k === p) return true; const q = ds.find((x) => x.id === k); k = q ? q.cha : null; }
    return false;
  };

  // Tự ráp: đặt dat, truc, lop cho mọi mảnh và trả về goc (điểm chân chạm đất)
  XR.tuRap = function (khung, ds) {
    if (!ds.length) return [0, 0];
    XR.chaMacDinh(khung, ds);
    const byId = {}; ds.forEach((p) => (byId[p.id] = p));
    const xong = new Set();
    let vong = 0;
    while (xong.size < ds.length && vong++ < 20) {
      for (const p of ds) {
        if (xong.has(p.id)) continue;
        const c = cachRap(khung, p.vai);
        p.lop = c.lop;
        if (p.cha == null) {
          p.dat = [0, 0]; p.truc = [p.w * c.khop[0], p.h * c.khop[1]]; xong.add(p.id); continue;
        }
        const cha = byId[p.cha]; if (!cha || !xong.has(cha.id)) continue;
        const g = c.gan || [0.5, 0.5];
        const gx = cha.dat[0] + cha.w * g[0], gy = cha.dat[1] + cha.h * g[1];
        p.dat = [Math.round(gx - p.w * c.khop[0]), Math.round(gy - p.h * c.khop[1])];
        p.truc = [Math.round(gx), Math.round(gy)];
        xong.add(p.id);
      }
    }
    for (const p of ds) if (!p.dat) { p.dat = [0, 0]; p.truc = [p.w / 2, p.h / 2]; p.lop = p.lop || 0; }
    return XR.tinhGoc(ds);
  };
  // Điểm chân: giữa thân theo chiều ngang, đáy thấp nhất của các chân (hoặc của cả con)
  XR.tinhGoc = function (ds) {
    const than = ds.find((p) => p.cha == null) || ds[0];
    const chan = ds.filter((p) => /^chan/.test(p.vai));
    const day = Math.max(...(chan.length ? chan : ds).map((p) => p.dat[1] + p.h));
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
  XR.veTinh = function (ctx, ds, chon) {
    const thuTu = ds.slice().sort((a, b) => a.lop - b.lop);
    for (const p of thuTu) {
      ctx.globalAlpha = chon && chon !== p.id && XR._mo ? 0.5 : 1;
      ctx.drawImage(p.cv, p.dat[0], p.dat[1]);
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
      const anh = k === 1 ? c.p.cv : XR.thuNho(c.p.cv, c.w, c.h);
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
      return { id: 'm' + (i + 1) + '_' + Date.now().toString(36), ten: m.ten, vai: m.vai, chaTen: m.cha, cv, w, h, sx: m.dat[0], sy: m.dat[1], dat: m.dat.slice(), truc: m.truc.slice(), lop: m.lop };
    });
    for (const p of ds) { const c = ds.find((q) => q.ten === p.chaTen); p.cha = c ? c.id : null; delete p.chaTen; }
    return {
      ten: tep.ten || '', ma: tep.ma || '', doi_tuong: tep.doi_tuong || 'em-be', thay_cho: tep.thay_cho || '', khung: tep.khung || 'nguoi',
      cao: tep.cao || 40, goc: (tep.goc || [0, 0]).slice(), dong_tac: tep.dong_tac || {}, manh: ds,
    };
  };
})();
