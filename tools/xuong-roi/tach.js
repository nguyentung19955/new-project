// XƯỞNG RỐI: nạp ảnh, xoá nền trắng, tách các mảnh theo vùng liền, gộp / lật mảnh.
// Cách làm giống docs/phong-cach-moi/ghep-thu/cut.py: so khác màu nền, đóng khe nhỏ, lấp lỗ, tìm vùng liền, bỏ vùng vụn.
(function () {
  'use strict';
  const XR = (window.XR = window.XR || {});
  const MAX_ANH = 1600; // cạnh dài nhất của ảnh làm việc

  XR.taoCanvas = function (w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
    return c;
  };

  // Tệp ảnh -> canvas (thu nhỏ nếu quá to)
  XR.docTepAnh = function (file, max) {
    return new Promise((ok, bad) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => { try { ok(XR.anhRaCanvas(img, max || MAX_ANH)); } catch (e) { bad(e); } URL.revokeObjectURL(url); };
      img.onerror = () => { URL.revokeObjectURL(url); bad(new Error('Không đọc được ảnh này')); };
      img.src = url;
    });
  };
  XR.tuDataUrl = function (src) {
    return new Promise((ok, bad) => { const img = new Image(); img.onload = () => ok(img); img.onerror = () => bad(new Error('Ảnh hỏng')); img.src = src; });
  };
  XR.anhRaCanvas = function (img, max) {
    const w0 = img.naturalWidth || img.width, h0 = img.naturalHeight || img.height;
    const k = Math.min(1, (max || 100000) / Math.max(w0, h0));
    const c = XR.taoCanvas(w0 * k, h0 * k), x = c.getContext('2d');
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.drawImage(img, 0, 0, c.width, c.height);
    return c;
  };

  // Màu nền: trung vị các điểm ở viền ảnh
  function mauNen(d, w, h) {
    const rs = [], gs = [], bs = [];
    const lay = (i) => { if (d[i * 4 + 3] < 128) return; rs.push(d[i * 4]); gs.push(d[i * 4 + 1]); bs.push(d[i * 4 + 2]); };
    for (let x = 0; x < w; x += 2) { for (let k = 0; k < 4; k++) { lay(k * w + x); lay((h - 1 - k) * w + x); } }
    for (let y = 0; y < h; y += 2) { for (let k = 0; k < 4; k++) { lay(y * w + k); lay(y * w + w - 1 - k); } }
    if (rs.length < 10) return [255, 255, 255];
    const tv = (a) => { a.sort((p, q) => p - q); return a[a.length >> 1]; };
    return [tv(rs), tv(gs), tv(bs)];
  }

  // Nở / co mặt nạ theo hình vuông bán kính r (tách hai chiều cho nhanh)
  function no(m, w, h, r, giuMot) {
    const t = new Uint8Array(m.length), o = new Uint8Array(m.length);
    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) {
        let v = giuMot ? 1 : 0;
        for (let k = -r; k <= r; k++) {
          const xx = x + k; const s = xx < 0 || xx >= w ? (giuMot ? 0 : 0) : m[row + xx];
          if (giuMot) { if (!s) { v = 0; break; } } else if (s) { v = 1; break; }
        }
        t[row + x] = v;
      }
    }
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        let v = giuMot ? 1 : 0;
        for (let k = -r; k <= r; k++) {
          const yy = y + k; const s = yy < 0 || yy >= h ? 0 : t[yy * w + x];
          if (giuMot) { if (!s) { v = 0; break; } } else if (s) { v = 1; break; }
        }
        o[y * w + x] = v;
      }
    }
    return o;
  }
  const noRa = (m, w, h, r) => no(m, w, h, r, false);
  const coLai = (m, w, h, r) => no(m, w, h, r, true);

  // Lấp lỗ: điểm nền không thông ra mép ảnh thì thành hình
  function lapLo(m, w, h) {
    const n = w * h, ngoai = new Uint8Array(n), q = new Int32Array(n);
    let a = 0, b = 0;
    const vao = (i) => { if (!m[i] && !ngoai[i]) { ngoai[i] = 1; q[b++] = i; } };
    for (let x = 0; x < w; x++) { vao(x); vao((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { vao(y * w); vao(y * w + w - 1); }
    while (a < b) {
      const i = q[a++], x = i % w;
      if (x > 0) vao(i - 1); if (x < w - 1) vao(i + 1); if (i >= w) vao(i - w); if (i < n - w) vao(i + w);
    }
    const o = new Uint8Array(n);
    for (let i = 0; i < n; i++) o[i] = ngoai[i] ? 0 : 1;
    return o;
  }

  // Gắn nhãn vùng liền (8 hướng). Trả về { nhan: Int32Array (-1 = nền), vung: [{id, dt, x0,y0,x1,y1}] }
  function ganNhan(m, w, h) {
    const n = w * h, nhan = new Int32Array(n).fill(-1), q = new Int32Array(n), vung = [];
    for (let s = 0; s < n; s++) {
      if (!m[s] || nhan[s] >= 0) continue;
      const id = vung.length; let a = 0, b = 0; q[b++] = s; nhan[s] = id;
      const v = { id, dt: 0, x0: w, y0: h, x1: -1, y1: -1 };
      while (a < b) {
        const i = q[a++], x = i % w, y = (i / w) | 0; v.dt++;
        if (x < v.x0) v.x0 = x; if (x > v.x1) v.x1 = x; if (y < v.y0) v.y0 = y; if (y > v.y1) v.y1 = y;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy; if (yy < 0 || yy >= h) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx; if (xx < 0 || xx >= w) continue;
            const j = yy * w + xx; if (m[j] && nhan[j] < 0) { nhan[j] = id; q[b++] = j; }
          }
        }
      }
      vung.push(v);
    }
    return { nhan, vung };
  }

  // canvas -> danh sách mảnh {cv, sx, sy, w, h}
  // o: { nguong (10..120, mặc định 45), lem (0..4 điểm xoá viền trắng, mặc định 1), vun (phần trăm vùng to nhất, mặc định 3) }
  XR.tachManh = function (src, o) {
    o = o || {};
    const T = o.nguong == null ? 45 : o.nguong, lem = o.lem == null ? 1 : o.lem, vun = o.vun == null ? 3 : o.vun;
    const w = src.width, h = src.height, n = w * h;
    const anh = src.getContext('2d').getImageData(0, 0, w, h), d = anh.data;
    const nen = mauNen(d, w, h);
    const khac = new Float32Array(n), m = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const p = i * 4;
      const v = d[p + 3] < 128 ? 0 : Math.abs(d[p] - nen[0]) + Math.abs(d[p + 1] - nen[1]) + Math.abs(d[p + 2] - nen[2]);
      khac[i] = v; m[i] = v > T ? 1 : 0;
    }
    // đóng khe nhỏ (nét viền đứt) rồi lấp lỗ bên trong (lòng trắng mắt, răng)
    const r = Math.max(1, Math.round(Math.max(w, h) / 600));
    let mk = coLai(noRa(m, w, h, r + 1), w, h, r + 1);
    mk = lapLo(mk, w, h);
    const { nhan, vung } = ganNhan(mk, w, h);
    if (!vung.length) return [];
    const lon = Math.max.apply(null, vung.map((v) => v.dt));
    const giu = vung.filter((v) => v.dt >= lon * vun / 100 && v.dt >= 30);
    // lõi chắc chắn là hình (co lại "lem" điểm): đặc hoàn toàn; phần viền: độ trong theo độ khác nền, bỏ màu trắng lem
    const loi = lem > 0 ? coLai(mk, w, h, lem) : mk;
    const out = [];
    for (const v of giu) {
      const pad = 1, x0 = Math.max(0, v.x0 - pad), y0 = Math.max(0, v.y0 - pad), x1 = Math.min(w - 1, v.x1 + pad), y1 = Math.min(h - 1, v.y1 + pad);
      const cw = x1 - x0 + 1, ch = y1 - y0 + 1, cv = XR.taoCanvas(cw, ch), cx = cv.getContext('2d');
      const od = cx.createImageData(cw, ch), q = od.data;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const i = y * w + x; if (nhan[i] !== v.id) continue;
        const p = i * 4, t = ((y - y0) * cw + (x - x0)) * 4;
        let a = 1;
        if (!loi[i]) a = Math.max(0, Math.min(1, (khac[i] - T * 0.5) / Math.max(T * 2, 330))); // điểm viền: trộn giữa nét viền tối và nền
        if (a <= 0.02) continue;
        // bỏ phần màu nền đã trộn vào điểm viền: màu thật = (màu - (1-a)·nền) / a
        for (let k = 0; k < 3; k++) q[t + k] = a >= 1 ? d[p + k] : Math.max(0, Math.min(255, (d[p + k] - (1 - a) * nen[k]) / a));
        q[t + 3] = Math.round(a * 255);
      }
      cx.putImageData(od, 0, 0);
      out.push({ cv, sx: x0, sy: y0, w: cw, h: ch });
    }
    // xếp theo hàng (trên xuống) rồi trái sang phải
    const hang = Math.max(40, h / 8);
    out.sort((a, b) => Math.floor(a.sy / hang) - Math.floor(b.sy / hang) || a.sx - b.sx);
    return out;
  };

  // CẮT THEO Ô TĨNH: người dùng khoanh ô chữ nhật trên ảnh sheet, cắt ĐÚNG ô đó (toạ độ điểm ảnh tuyệt đối, không tự dò vùng).
  // Trong ô chỉ làm một việc: nền trắng nối với mép ô thì thành trong suốt (loang từ mép vào), phần trắng nằm lọt
  // trong nét viền (lòng trắng mắt, răng) giữ nguyên. Viền mảnh mượt, bỏ màu trắng lem ở mép.
  // r: {x, y, w, h} trong ảnh sheet. o: { nguong (mặc định 45), lem (0..4) }
  XR.mauNenAnh = function (src) { const d = src.getContext('2d').getImageData(0, 0, src.width, src.height).data; return mauNen(d, src.width, src.height); };
  XR.catO = function (src, r, o) {
    o = o || {};
    const T = o.nguong == null ? 45 : o.nguong, lem = o.lem == null ? 1 : o.lem;
    const x0 = Math.max(0, Math.round(r.x)), y0 = Math.max(0, Math.round(r.y));
    const w = Math.max(1, Math.min(src.width - x0, Math.round(r.w))), h = Math.max(1, Math.min(src.height - y0, Math.round(r.h))), n = w * h;
    const nen = o.nen || XR.mauNenAnh(src);
    const anh = src.getContext('2d').getImageData(x0, y0, w, h), d = anh.data;
    const khac = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const p = i * 4;
      khac[i] = d[p + 3] < 128 ? 0 : Math.abs(d[p] - nen[0]) + Math.abs(d[p + 1] - nen[1]) + Math.abs(d[p + 2] - nen[2]);
    }
    // loang nền từ mép ô
    const ngoai = new Uint8Array(n), q = new Int32Array(n);
    let a = 0, b = 0;
    const vao = (i) => { if (!ngoai[i] && khac[i] <= T) { ngoai[i] = 1; q[b++] = i; } };
    for (let x = 0; x < w; x++) { vao(x); vao((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { vao(y * w); vao(y * w + w - 1); }
    while (a < b) {
      const i = q[a++], x = i % w;
      if (x > 0) vao(i - 1); if (x < w - 1) vao(i + 1); if (i >= w) vao(i - w); if (i < n - w) vao(i + w);
    }
    const hinh = new Uint8Array(n); for (let i = 0; i < n; i++) hinh[i] = ngoai[i] ? 0 : 1;
    const loi = lem > 0 ? coLai(hinh, w, h, lem) : hinh;
    const cv = XR.taoCanvas(w, h), cx = cv.getContext('2d'), od = cx.createImageData(w, h), out = od.data;
    for (let i = 0; i < n; i++) {
      if (!hinh[i]) continue;
      const p = i * 4;
      let al = 1;
      if (!loi[i]) al = Math.max(0, Math.min(1, (khac[i] - T * 0.5) / Math.max(T * 2, 330)));
      if (al <= 0.02) continue;
      for (let k = 0; k < 3; k++) out[p + k] = al >= 1 ? d[p + k] : Math.max(0, Math.min(255, (d[p + k] - (1 - al) * nen[k]) / al));
      out[p + 3] = Math.round(al * 255);
    }
    cx.putImageData(od, 0, 0);
    return { cv, sx: x0, sy: y0, w, h, rect: [x0, y0, w, h] };
  };

  // Gộp nhiều mảnh (giữ đúng vị trí tương đối trong ảnh gốc)
  XR.gopManh = function (ds) {
    const x0 = Math.min.apply(null, ds.map((p) => p.sx)), y0 = Math.min.apply(null, ds.map((p) => p.sy));
    const x1 = Math.max.apply(null, ds.map((p) => p.sx + p.w)), y1 = Math.max.apply(null, ds.map((p) => p.sy + p.h));
    const cv = XR.taoCanvas(x1 - x0, y1 - y0), cx = cv.getContext('2d');
    for (const p of ds) cx.drawImage(p.cv, p.sx - x0, p.sy - y0);
    return { cv, sx: x0, sy: y0, w: cv.width, h: cv.height };
  };

  XR.latCanvas = function (c) {
    const o = XR.taoCanvas(c.width, c.height), x = o.getContext('2d');
    x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(c, 0, 0);
    return o;
  };

  // Số đo của một mảnh: diện tích phần có hình, độ sáng trung bình, độ tròn
  XR.doManh = function (cv) {
    const w = cv.width, h = cv.height, d = cv.getContext('2d').getImageData(0, 0, w, h).data;
    let dt = 0, sang = 0;
    for (let i = 0; i < w * h; i++) {
      if (d[i * 4 + 3] < 128) continue;
      dt++; sang += d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11;
    }
    return { dt, sang: dt ? sang / dt : 0, tron: Math.min(w, h) / Math.max(w, h), day: dt / (w * h) };
  };

  // Ảnh cả con (lần A): xoá nền trắng đơn giản, cắt sát
  XR.xoaNenDon = function (src, T) {
    T = T || 45;
    const w = src.width, h = src.height, im = src.getContext('2d').getImageData(0, 0, w, h), d = im.data, nen = mauNen(d, w, h);
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4, v = Math.abs(d[p] - nen[0]) + Math.abs(d[p + 1] - nen[1]) + Math.abs(d[p + 2] - nen[2]);
      if (v <= T || d[p + 3] < 128) d[p + 3] = 0;
      else { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    if (x1 < 0) return src;
    const c = XR.taoCanvas(w, h); c.getContext('2d').putImageData(im, 0, 0);
    const o = XR.taoCanvas(x1 - x0 + 1, y1 - y0 + 1); o.getContext('2d').drawImage(c, -x0, -y0);
    return o;
  };

  // Thu nhỏ mượt từng nửa một (giữ nét hơn thu một lần)
  XR.thuNho = function (c, w, h) {
    w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
    let cur = c;
    while (cur.width / 2 >= w && cur.height / 2 >= h) {
      const t = XR.taoCanvas(cur.width / 2, cur.height / 2), x = t.getContext('2d');
      x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
      x.drawImage(cur, 0, 0, t.width, t.height); cur = t;
    }
    if (cur.width === w && cur.height === h) return cur === c ? cur : cur;
    const o = XR.taoCanvas(w, h), x = o.getContext('2d');
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.drawImage(cur, 0, 0, w, h);
    return o;
  };
})();
