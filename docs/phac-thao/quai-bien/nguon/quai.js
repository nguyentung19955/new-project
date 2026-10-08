// Tám quái thường vùng Hang biển.
const LAM = ['#1f5f9c', '#3f8fd0', '#9fd8f5'], NGOC = ['#12827e', '#22b5a5', '#8ff0d8'], SANHO = ['#c9463d', '#ff7a5c', '#ffc2a0'], BANG = ['#8fc4e0', '#dff6ff', '#ffffff'], TIM = ['#231a4a', '#3d3184', '#7a6dd0'];
const Q = {};
Q.cua = function () { const g = S(44, 34);
  line(g, 12, 25, 7, 29, LAM[0], 1.6); line(g, 13, 26, 10, 30, LAM[0], 1.6); line(g, 11, 23, 5, 26, LAM[0], 1.6);
  line(g, 12, 21, 7, 17, SANHO[0], 2.4); ball(g, 6.5, 13.5, 4.2, 4.2, SANHO); poly(g, [[5, 8], [8, 8], [7, 13]], null); set(g, 6, 12, null);
  line(g, 15, 17, 14, 13, LAM[0], 1.6);
  ball(g, 22, 22.5, 10.5, 6.5, LAM); ell(g, 22, 26, 7, 2, '#dff6ff');
  mirror(g);
  eye(g, 14.5, 11, 2.8, .5, .3, 1); eye(g, 29.5, 11, 2.8, -.5, .3, -1);
  rect(g, 20, 24, 4, 1, OL); set(g, 20, 23, OL); set(g, 23, 23, OL);
  ball(g, 22, 15.5, 4.2, 2.8, BANG); rect(g, 21, 10, 2, 3, '#ffd27a'); // mũ vỏ sò có chóp
  return outline(g); };
function caCon(g, cx, cy, cols) { poly(g, [[cx + 3, cy], [cx + 7, cy - 3], [cx + 6, cy], [cx + 7, cy + 3]], cols[0]); ball(g, cx, cy, 4.2, 2.8, cols); ell(g, cx, cy + 1.4, 3, 1.1, '#eaf6ff'); rect(g, cx - 3, cy - 1, 2, 2, '#ffffff'); set(g, cx - 3, cy, OL); poly(g, [[cx - 1, cy - 2.5], [cx + 2, cy - 5], [cx + 2, cy - 2.5]], cols[0]); }
Q.caCon = function () { const g = S(44, 34); caCon(g, 14, 12, LAM); caCon(g, 26, 17, NGOC); caCon(g, 15, 23, SANHO); outline(g); set(g, 6, 7, '#9fd8f5'); set(g, 20, 8, '#9fd8f5'); set(g, 8, 18, '#9fd8f5'); return g; };
Q.oc = function () { const g = S(44, 36); // quay mặt sang trái: càng khiên bên trái
  line(g, 20, 29, 17, 32, SANHO[0], 1.6); line(g, 24, 29, 23, 32, SANHO[0], 1.6); line(g, 16, 28, 12, 31, SANHO[0], 1.6);
  poly(g, [[30, 10], [38, 3], [35, 14]], BANG[0]);
  ball(g, 27, 19, 9.5, 9.5, ['#5b6fb5', '#a9c4ee', '#f2fbff']);
  for (let a = 0; a < 62; a++) { const t = a / 10, r = 1 + t * 1.25; set(g, 28 + Math.cos(t + 1) * r, 20 + Math.sin(t + 1) * r, '#5b6fb5'); }
  ball(g, 17, 25, 5.5, 4.5, SANHO);
  line(g, 17, 20, 17, 17, SANHO[0], 1.6); line(g, 21, 20, 21, 17, SANHO[0], 1.6);
  eye(g, 16.5, 15.5, 2.4, -.6, .2, 1); eye(g, 22, 15.5, 2.4, -.6, .2, -1);
  ball(g, 9, 23, 4.6, 7.5, ['#8f2f2c', '#e0604a', '#ffc2a0']); rect(g, 8, 17, 2, 1, BANG[2]); rect(g, 6, 20, 1, 6, BANG[1]); line(g, 9, 19, 9, 27, '#8f2f2c', 1); // càng khiên
  return outline(g); };
Q.haiQuy = function () { const g = S(44, 36);
  const tips = [[9, 12], [13, 7], [20, 4.5], [27, 7], [31, 12]];
  for (const t of tips) { line(g, 20, 18, t[0], t[1], NGOC[0], 3); line(g, 20, 18, t[0], t[1], NGOC[1], 1.6); ell(g, t[0] + .5, t[1] + .5, 1.8, 1.8, NGOC[2]); }
  poly(g, [[13, 32], [28, 32], [26, 17], [15, 17]], SANHO[0]); poly(g, [[15, 31], [25, 31], [24, 18], [16, 18]], SANHO[1]); rect(g, 17, 19, 2, 9, SANHO[2]);
  ell(g, 20.5, 31.5, 9, 2.4, SANHO[0]);
  eye(g, 17.5, 23, 2.4, .5, -.4, 1); eye(g, 24, 23, 2.4, .5, -.4, -1); rect(g, 20, 27, 2, 2, OL);
  ball(g, 36, 6, 2.6, 2.6, LAM); // viên nước vừa bắn
  outline(g); set(g, 31, 9, '#9fd8f5'); set(g, 33, 8, '#9fd8f5'); return g; };
Q.caChuon = function () { const g = S(48, 34);
  poly(g, [[29, 18], [37, 11], [34, 18], [37, 25]], LAM[0]);
  poly(g, [[17, 21], [25, 29], [22, 20]], BANG[0]);
  ball(g, 20, 18, 11, 4, LAM); ell(g, 19, 20, 8.5, 1.8, '#eaf6ff');
  poly(g, [[15, 16], [26, 3], [33, 5], [25, 16]], BANG[1]); line(g, 17, 15, 26, 5, BANG[0], 1); line(g, 21, 15, 30, 6, BANG[0], 1); poly(g, [[26, 3], [33, 5], [31, 7], [27, 5]], '#ff7a5c');
  eye(g, 13, 17, 2.5, -.6, 0, 1); poly(g, [[7, 18], [10, 17], [10, 20]], LAM[0]);
  outline(g); rect(g, 40, 14, 5, 1, '#9fd8f5'); rect(g, 41, 19, 6, 1, '#9fd8f5'); rect(g, 39, 23, 4, 1, '#9fd8f5'); g.cx = 22; return g; };
Q.caNoc = function (puff) { const g = S(56, 52), cx = 28, cy = 28, R = puff ? 14 : 8.5;
  const n = puff ? 16 : 12; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + .2, r0 = R - 1, r1 = R + (puff ? 4.5 : 1.8); line(g, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, puff ? BANG[2] : BANG[1], puff ? 1.6 : 1); }
  poly(g, [[cx + R - 1, cy], [cx + R + 4, cy - 3], [cx + R + 4, cy + 3]], SANHO[1]);
  ball(g, cx, cy, R, R * .95, puff ? ['#1d8fb0', '#59d0e0', '#d8fbff'] : NGOC); ell(g, cx, cy + R * .42, R * .78, R * .5, '#f4fbff');
  poly(g, [[cx - R + 1, cy + 1], [cx - R - 3, cy + 4], [cx - R + 2, cy + 4]], SANHO[1]);
  const er = puff ? 3.4 : 2.6, ex = puff ? 6 : 4; eye(g, cx - ex, cy - R * .25, er, -.4, puff ? -.2 : .2, puff ? 1 : 0); eye(g, cx + ex, cy - R * .25, er, -.4, puff ? -.2 : .2, puff ? -1 : 0);
  rect(g, cx - 1, cy + (puff ? 4 : 3), 3, 2, SANHO[0]); set(g, cx, cy + (puff ? 4 : 3), OL);
  if (puff) { ell(g, cx - 9, cy + 3, 2, 1.3, '#ff9d8a'); ell(g, cx + 9, cy + 3, 2, 1.3, '#ff9d8a'); }
  outline(g);
  if (puff) for (const p of [[6, 10], [50, 8], [4, 34], [52, 38], [14, 4], [42, 48]]) { set(g, p[0], p[1], '#ffffff'); set(g, p[0] - 1, p[1], '#bfe9ff'); set(g, p[0] + 1, p[1], '#bfe9ff'); set(g, p[0], p[1] - 1, '#bfe9ff'); set(g, p[0], p[1] + 1, '#bfe9ff'); }
  g.cx = cx; g.foot = cy + R + (puff ? 5 : 3); return g; };
Q.sua = function () { const g = S(44, 40);
  for (const x of [13, 27]) for (let y = 17; y < 29; y++) set(g, x + Math.round(Math.sin(y * .9 + x) * 1.2), y, '#59c5e8');
  line(g, 17, 17, 17, 24, '#59c5e8', 1.6); line(g, 23, 17, 23, 24, '#59c5e8', 1.6);
  ball(g, 20, 29, 4.8, 4.8, ['#1b2f66', '#2b5f9e', '#9fd8f5']); rect(g, 19, 22, 2, 3, '#e8d9b0'); // bom nước
  ball(g, 20, 14, 10.5, 9, ['#2b7fb8', '#59c5e8', '#d6f6ff']); rect(g, 8, 18, 26, 8, null);
  line(g, 17, 18, 17, 23, '#59c5e8', 1.6); line(g, 23, 18, 23, 23, '#59c5e8', 1.6);
  ball(g, 20, 29, 4.8, 4.8, ['#1b2f66', '#2b5f9e', '#9fd8f5']); rect(g, 19, 23, 2, 2, '#e8d9b0');
  for (const x of [11.5, 15.8, 20, 24.2, 28.5]) ell(g, x, 17.6, 2.2, 1.6, '#2b7fb8');
  eye(g, 16, 13, 2.6, .2, .5); eye(g, 24, 13, 2.6, -.2, .5); rect(g, 19, 15, 2, 1, OL);
  outline(g); set(g, 20, 21, '#ffd27a'); set(g, 21, 20, '#ff7a5c'); set(g, 19, 20, '#ff7a5c'); set(g, 20, 19, '#ffffff'); return g; };
Q.nhim = function (xu) { const g = S(56, 48), cx = 28, cy = 30, n = 15;
  for (let i = 0; i < n; i++) { const a = Math.PI + (i + .5) / n * Math.PI * 1.0 - 0, aa = Math.PI * .92 + i / (n - 1) * Math.PI * 1.16, r1 = xu ? 17 : 11; line(g, cx, cy, cx + Math.cos(aa) * r1, cy + Math.sin(aa) * r1, TIM[1], xu ? 2 : 1.6); line(g, cx + Math.cos(aa) * (r1 - (xu ? 4 : 2)), cy + Math.sin(aa) * (r1 - (xu ? 4 : 2)), cx + Math.cos(aa) * r1, cy + Math.sin(aa) * r1, xu ? '#ff7a5c' : '#bfe9ff', 1); }
  ball(g, cx, cy, 7.5, 6.8, TIM);
  eye(g, cx - 3.5, cy + .5, 2.5, 0, .3, xu ? 1 : 0); eye(g, cx + 3.5, cy + .5, 2.5, 0, .3, xu ? -1 : 0);
  if (xu) rect(g, cx - 1, cy + 4, 3, 1, OL); else set(g, cx, cy + 4, OL);
  outline(g); g.cx = cx; g.foot = cy + 8; return g; };

const DS = [
  ['cua', 'Cua Lính', 'Xông tới: thấy bé là giơ càng lao thẳng vào kẹp.', '#7cc4ee'],
  ['caCon', 'Bầy Cá Con', 'Bầy nhỏ: yếu nhưng đông, bơi cả đàn vây quanh bé.', '#8ff0d8'],
  ['oc', 'Ốc Mượn Hồn', 'Giáp: giơ càng khiên chắn phía trước, phải vòng ra sau lưng.', '#c9b8ff'],
  ['haiQuy', 'Hải Quỳ', 'Bắn xa: đứng yên một chỗ, phun viên nước từ xa.', '#ff9d8a'],
  ['caChuon', 'Cá Chuồn', 'Nhanh nhẹn: lướt vèo qua, đánh một cái rồi vọt đi.', '#9fd8f5'],
  ['caNoc', 'Cá Nóc', 'Cảm tử: lại gần thì phồng to rồi nổ ra băng làm bé chậm.', '#8ff0d8', 'puff'],
  ['sua', 'Sứa Bom', 'Thả bom nước xuống sàn, có vòng đếm ngược rồi mới nổ.', '#9fd8f5', 'bom'],
  ['nhim', 'Nhím Biển', 'Gai: lúc xù gai đỏ mà đánh vào thì bé bị phản đòn.', '#b6a8ff', 'xu'],
];
// bom nước nằm sàn có vòng đếm ngược
function bomSan(c, x, y, s) { const g = S(20, 20); ball(g, 10, 12, 5, 5, ['#1b2f66', '#2b5f9e', '#9fd8f5']); rect(g, 9, 5, 2, 2, '#e8d9b0'); outline(g); set(g, 10, 4, '#ffd27a'); set(g, 10, 3, '#ff7a5c'); g.foot = 18;
  c.strokeStyle = 'rgba(255,90,70,.35)'; c.lineWidth = s; c.beginPath(); c.ellipse(x, y - s, 13 * s, 4 * s, 0, 0, 7); c.stroke();
  c.strokeStyle = '#ff5a46'; c.beginPath(); c.ellipse(x, y - s, 13 * s, 4 * s, 0, -1.2, 2.6); c.stroke(); draw(c, g, x, y, s); }
function caveBg(c, x, y, w, h, fl) { c.save(); c.beginPath(); c.roundRect(x, y, w, h, 14); c.clip(); const gr = c.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#0f2038'); gr.addColorStop(1, '#173a55'); c.fillStyle = gr; c.fillRect(x, y, w, h);
  c.fillStyle = '#1d4a63'; c.fillRect(x, y + fl, w, h - fl); c.fillStyle = '#2a6a80'; c.fillRect(x, y + fl, w, 6); c.fillStyle = '#163a50'; for (let i = 0; i < w; i += 54) c.fillRect(x + i + (i * 7 % 23), y + fl + 18 + (i * 5 % 30), 24, 6); c.restore(); }
TO['quai-bien'] = function () {
  const [cv, c, y0] = page(1080, 2300, 'Quái vùng Hang biển', 'Tám quái thường, vẽ phóng to 6 lần. Mỗi con có một kỹ năng riêng để bé phải đổi cách đánh.');
  const pw = 516, ph = 370; let y = y0;
  DS.forEach((d, i) => { const x = 16 + (i % 2) * 532, py = y + Math.floor(i / 2) * (ph + 16); panel(c, x, py, pw, ph); const fy = py + 232; floor(c, x + 12, fy, pw - 24);
    const ex = d[4]; const mx = ex ? x + pw * .28 : x + pw / 2; const g = Q[d[0]](); draw(c, g, mx, fy, 6);
    if (ex) { arrow(c, x + pw * .47, fy - 70, x + pw * .57, fy - 70, GOLDT, 6);
      if (ex === 'puff') draw(c, Q.caNoc(true), x + pw * .78, fy, 5); if (ex === 'xu') draw(c, Q.nhim(true), x + pw * .78, fy, 6); if (ex === 'bom') bomSan(c, x + pw * .78, fy, 6); }
    text(c, d[1], x + pw / 2, py + 286, 38, d[3], true, 'center'); para(c, d[2], x + pw / 2, py + 322, pw - 40, 23, CREAM, 30, 'center'); });
  y += 4 * (ph + 16) + 10; text(c, 'Cỡ thật đứng cạnh em bé (phóng 3 lần)', 22, y + 34, 34, GOLDT, true); y += 52;
  caveBg(c, 16, y, 1048, 240, 180); const fy = y + 186;
  put(c, { key: 'smith', weapon: W('sword') }, 70, fy, 3);
  DS.forEach((d, i) => { const g = Q[d[0]](); const x = 215 + i * 112; shadow(c, x, fy + 3, 16, 3); draw(c, g, x, fy, 3); });
  return cut(cv, y + 240 + 22);
};
