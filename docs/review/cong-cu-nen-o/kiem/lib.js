// Thư viện kiểm: dựng ảnh lưới mẫu, chạy trang công cụ bằng Playwright, lấy kết quả.
const { chromium } = require('playwright');
const fs = require('fs'), crypto = require('crypto');
exports.sha = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
exports.mo = async () => { const b = await chromium.launch(); return b; };
// Dựng ảnh trong trình duyệt. o = {W,H,C,R,n,bg,odd:{ô: màu},line,noise,seed,bo:[ô bỏ trống]}
exports.dung = async (b, o, duongDan) => {
  const p = await b.newPage();
  const kq = await p.evaluate((o) => {
    const { W, H, C, R, n } = o, line = o.line || 12, cw = W / C, ch = H / R, le = o.lech || 0;
    // mép ô thật: lưới có thể kẻ lệch so với lưới đều
    const xs = [], ys = []; for (let c = 0; c <= C; c++) xs.push(c === 0 ? 0 : c === C ? W : Math.round(c * cw + le * Math.sin(c * 2.1))); for (let r = 0; r <= R; r++) ys.push(r === 0 ? 0 : r === R ? H : Math.round(r * ch + le * Math.cos(r * 1.7)));
    const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
    const cv = mk(), g = cv.getContext('2d'), tr = mk(), gt = tr.getContext('2d');
    g.fillStyle = o.bg; g.fillRect(0, 0, W, H);
    for (const k in o.odd || {}) { const i = +k, c = i % C, r = (i / C) | 0; g.fillStyle = o.odd[k]; g.fillRect(xs[c], ys[r], xs[c + 1] - xs[c], ys[r + 1] - ys[r]); }
    const pal = ['#c8452e', '#e0a030', '#3f7fc0', '#8a5a36', '#f4efe6', '#f7a8b8', '#6b4fa0', '#2f8f8f', '#d9d2c0', '#7a2f2f'];
    const ve = (q, i) => {
      let s = (o.seed || 7) * 7919 + i * 104729; const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
      const c = i % C, r = (i / C) | 0, cx = (xs[c] + xs[c + 1]) / 2 + (rnd() - 0.5) * cw * 0.08, cy = (ys[r] + ys[r + 1]) / 2 + (rnd() - 0.5) * ch * 0.08;
      const k = o.co || 1, rx = cw * (0.2 + rnd() * 0.08) * k, ry = ch * (0.2 + rnd() * 0.08) * k;
      q.lineWidth = 6; q.strokeStyle = '#2a1a12'; q.lineJoin = 'round';
      // tai/chóp nhỏ gắn vào thân
      q.fillStyle = pal[(i * 3 + 1) % pal.length]; q.beginPath(); q.arc(cx + rx * 0.7, cy - ry * 0.75, Math.min(rx, ry) * 0.3, 0, 7); q.fill(); q.stroke();
      q.fillStyle = (o.than || {})[i] || pal[i % pal.length]; q.beginPath(); q.ellipse(cx, cy, rx, ry, 0, 0, 7); q.fill(); q.stroke();
      q.fillStyle = pal[(i * 3 + 1) % pal.length]; q.fillRect(cx - rx * 0.55, cy - ry * 0.12, rx * 1.1, ry * 0.3);
      q.fillStyle = pal[(i + 4) % pal.length]; q.beginPath(); q.arc(cx - rx * 0.35, cy - ry * 0.45, Math.min(rx, ry) * 0.16, 0, 7); q.fill();
      q.lineWidth = 3; q.beginPath(); q.moveTo(cx - rx * 0.5, cy + ry * 0.5); q.lineTo(cx + rx * 0.5, cy + ry * 0.55); q.stroke();
    };
    const bo = new Set(o.bo || []);
    for (let i = 0; i < n; i++) if (!bo.has(i)) { ve(g, i); ve(gt, i); }
    g.fillStyle = '#000';
    for (let c = 0; c <= C; c++) { if (o.khongVien && (c === 0 || c === C)) continue; const x = Math.round(xs[c] - line / 2); g.fillRect(Math.max(0, Math.min(W - line, x)), 0, line, H); }
    for (let r = 0; r <= R; r++) { if (o.khongVien && (r === 0 || r === R)) continue; const y = Math.round(ys[r] - line / 2); g.fillRect(0, Math.max(0, Math.min(H - line, y)), W, line); }
    if (o.noise) { const im = g.getImageData(0, 0, W, H), d = im.data; let s = 12345; for (let j = 0; j < d.length; j += 4) for (let k = 0; k < 3; k++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[j + k] = Math.max(0, Math.min(255, d[j + k] + ((s >> 8) % (2 * o.noise + 1)) - o.noise)); } g.putImageData(im, 0, 0); }
    // hình thật (không nền): khung bao và số điểm của từng ô
    const td = gt.getImageData(0, 0, W, H).data, that = [];
    for (let i = 0; i < n; i++) { const c = i % C, r = (i / C) | 0; let x0 = W, y0 = H, x1 = -1, y1 = -1, m = 0;
      for (let y = ys[r]; y < ys[r + 1]; y++) for (let x = xs[c]; x < xs[c + 1]; x++) if (td[(y * W + x) * 4 + 3] >= 128) { m++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      that.push({ i, x0, y0, x1, y1, n: m, ox0: xs[c], oy0: ys[r], ox1: xs[c + 1], oy1: ys[r + 1] }); }
    return { png: cv.toDataURL('image/png'), that };
  }, o);
  await p.close();
  fs.writeFileSync(duongDan, Buffer.from(kq.png.split(',')[1], 'base64'));
  return kq.that;
};
// Mở một trang công cụ, chặn mạng ngoài (không tải JSZip, không tải gì từ ngoài)
exports.moTrang = async (b, url) => {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }), p = await ctx.newPage();
  await p.route('**/*', (r) => (r.request().url().startsWith('http://localhost') ? r.continue() : r.abort()));
  p.loi = []; p.on('pageerror', (e) => p.loi.push(String(e)));
  await p.goto(url); await p.waitForTimeout(300);
  return p;
};
exports.kiemDs = (p) => p.evaluate(() => ({ the: document.getElementById('theKq').textContent, ds: [...document.querySelectorAll('#dsKiem li')].map((li) => (li.className === 'loi' ? '✗ ' : '') + li.textContent) }));
