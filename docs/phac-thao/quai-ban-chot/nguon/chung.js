// Dùng chung cho bản chốt: bảng màu ba vùng và tờ xem thử.
// Rừng: lục, nâu, tím độc. Lâu đài: đỏ cam, vàng lửa, đen than. Mỗi dải 4 màu: [tối nhất, tối, vừa, sáng].
const LUCR = ['#123a1c', '#22692c', '#46a83c', '#b4ec6c'], NAUG = ['#2e1a10', '#5c3a1e', '#96643a', '#d8a870'], TIMD = ['#2a0e44', '#58208c', '#9a48d4', '#e4a8ff'], DOCX = ['#3c5a0c', '#78b818', '#c4f43c', '#f4ffb0'];
const DOCAM = ['#5a0e0c', '#b0261a', '#f0582a', '#ffb070'], LUAV = ['#c43c10', '#ff8a1e', '#ffd23c', '#fff6b0'], THANH = ['#0e0c12', '#26222c', '#48424e', '#8a8290'], XUONGT = ['#6a5c48', '#b0a488', '#e8e0c4', '#fffbe8'];
// Xem thử mọi hình trong một bộ: TO.xemLuoi(QR, 4)  hoặc  TO.xemLuoi({a: g1, b: g2}, 4). Ghi tên và cỡ (rộng x cao điểm ảnh) từng con, có em bé cỡ thật bên cạnh.
TO.xemLuoi = function (obj, s, cols) { s = s || 4; cols = cols || 4; const it = [];
  for (const k of Object.keys(obj)) { let g = obj[k]; if (typeof g === 'function') { try { g = g(); } catch (e) { continue; } } if (g && g.d) it.push([k, g]); }
  let cw = 0, ch = 0; for (const [k, g] of it) { const b = bbox(g); cw = Math.max(cw, b.w); ch = Math.max(ch, b.h); }
  cw = Math.max(cw * s + 60, 260); ch = ch * s + 90; const rows = Math.ceil(it.length / cols); const [cv, c] = mk(cols * cw + 20, rows * ch + 20); c.fillStyle = PAGE; c.fillRect(0, 0, cv.width, cv.height);
  it.forEach(([k, g], i) => { const x = 10 + (i % cols) * cw, y = 10 + Math.floor(i / cols) * ch; rr(c, x + 4, y + 4, cw - 8, ch - 8, 12, PANEL); const fy = y + ch - 50; floor(c, x + 10, fy, cw - 20);
    draw(c, g, x + cw / 2 + 20, fy, s); put(c, { key: 'smith', weapon: W('sword') }, x + 34, fy, s); const b = bbox(g); text(c, k + '  ' + b.w + 'x' + b.h, x + cw / 2, y + ch - 18, 20, CREAM, true, 'center'); });
  return cv; };
