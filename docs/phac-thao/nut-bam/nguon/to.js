// Đồ dùng chung cho các tờ phác thảo: tạo một ô canvas có nền giống trong game rồi gọi hàm vẽ.
// w, h tính theo đơn vị giao diện của game; scale là số lần phóng to.
window.G = window.G || {};
function taoO(cha, w, h, scale, ve, chu, nen) {
  const o = document.createElement('div'); o.className = 'cell';
  const c = document.createElement('canvas');
  c.width = Math.round(w * scale); c.height = Math.round(h * scale);
  const x = c.getContext('2d');
  nenGame(x, c.width, c.height, scale, nen);
  x.setTransform(scale, 0, 0, scale, 0, 0);
  ve(x, w, h);
  o.appendChild(c);
  if (chu) { const d = document.createElement('div'); d.className = 'cap'; d.innerHTML = chu; o.appendChild(d); }
  cha.appendChild(o);
  return o;
}
// Nền giả: gạch tối như lề màn hình game, để thấy nút nổi trên nền thật.
function nenGame(x, W, H, s, kieu) {
  x.fillStyle = kieu === 'sang' ? '#5a4a40' : '#17121a'; x.fillRect(0, 0, W, H);
  const bw = 16 * s, bh = 8 * s;
  for (let r = 0; r * bh < H; r++) for (let c = -1; c * bw < W; c++) {
    const X = c * bw + (r % 2 ? bw / 2 : 0), Y = r * bh;
    x.fillStyle = kieu === 'sang' ? ((r * 7 + c * 3) % 5 ? '#665448' : '#5e4c42') : ((r * 7 + c * 3) % 5 ? '#1e1820' : '#1a151c');
    x.fillRect(X + s, Y + s, bw - s, bh - s);
  }
}
function el(tag, cls, html, cha) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (cha) cha.appendChild(e); return e; }
