// mẫu dùng chung
const cv = require('./cv');
const M = {
  // ngọn lửa: đáy (cx, by), cao h, rộng w; vỏ 'f', lõi 'F'
  lua(c, cx, by, h, w, vo = 'f', loi = 'F') {
    const t = by - h;
    c.poly([[cx - w / 2, by], [cx - w / 2 - 0.5, by - h * 0.45], [cx - w * 0.2, by - h * 0.7], [cx - w * 0.25, t + h * 0.15], [cx + 0.5, t], [cx + w * 0.15, by - h * 0.65], [cx + w * 0.42, by - h * 0.75], [cx + w / 2 + 0.5, by - h * 0.35], [cx + w / 2 + 0.5, by]], vo);
    c.poly([[cx - w * 0.28, by], [cx - w * 0.3, by - h * 0.35], [cx, by - h * 0.62], [cx + w * 0.3, by - h * 0.3], [cx + w * 0.28, by]], loi);
    return c;
  },
  // sóng cuộn kiểu hoa văn: đỉnh sóng tại (x, y)
  song(c, y, mat = 'w', bot = 'W') {
    c.rect(0, y + 3, 18, 18 - y - 3, mat);
    for (let x0 = -2; x0 < 18; x0 += 6) { c.disc(x0 + 3, y + 3, 3, mat).p(x0 + 3, y + 1, bot).p(x0 + 4, y + 1, bot).p(x0 + 5, y + 2, bot).p(x0 + 5, y + 3, bot); }
    return c;
  },
  // mặt trống đồng nhìn từ trên: tâm, bán kính
  trong(c, cx, cy, r) {
    c.disc(cx, cy, r, 'b');
    c.ring(cx, cy, r - 1.5, ',');
    c.ring(cx, cy, r - 3.5, ',');
    // sao giữa
    c.disc(cx, cy, 1.6, 'g');
    for (let a = 0; a < 8; a++) { const t = a * Math.PI / 4; c.p(cx + Math.cos(t) * 2.6, cy + Math.sin(t) * 2.6, '*'); }
    return c;
  },
  // tia sét gấp khúc từ trên xuống
  set(c, pts, ch = '4', w = 1) { for (let i = 0; i < pts.length - 1; i++) c.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], ch, w); return c; },
};
module.exports = M;
