"""Rà soát B (bổ sung, 12/10): vùng báo của TƯỜNG NƯỚC (Ngư Tinh, Sóng thần) có phủ hết chỗ tường sẽ đánh trúng không.
Tường không dùng G.inZone: trúng khi mép tường dày th quét qua (|al − s| < th/2 + 3) trên cả đường s → maxS, trừ khe |ac − g| ≤ gw
(G.mobWall, js/mobs.js). So với mặt nạ vẽ kiểu điểm ảnh (G.baoTruoc.maskOf: 2, 3 = dải xuất phát đỏ; 8 = đường quét đỏ nhạt;
4..7 = khe an toàn). Đạt khi: không điểm nào bị trúng mà không tô đỏ, và khe an toàn không bị tô đỏ. Chạy: python3 tests/bt_tuong.py"""
import sys
from quai_lib import sync_playwright, open_page

JS = r"""
() => {
  const BT = G.baoTruoc; G.BT_PIXEL = true;
  const { W } = T.room(1, 2, { seed: 3 });
  const out = [];
  const cases = [
    { x: 380, y: 150, ang: Math.PI, s: 10, half: 120, g: 0, gw: 26, maxS: 340, th: 14 },
    { x: 330, y: 120, ang: Math.PI * 0.9, s: 6, half: 90, g: -30, gw: 20, maxS: 260, th: 18 },
    { x: 120, y: 160, ang: 0, s: 8, half: 100, g: 40, gw: 24, maxS: 300, th: 14 },
  ];
  for (const z of cases) {
    const it = { k: 'wall', x: z.x, y: z.y, ang: z.ang, s: z.s, half: z.half, g: z.g, gw: z.gw, maxS: z.maxS, th: z.th };
    const M = BT.maskOf(it);
    let thieu = 0, dung = 0, kheDo = 0;
    const c = Math.cos(z.ang), s = Math.sin(z.ang);
    for (let j = 0; j < M.h; j++) for (let i = 0; i < M.w; i++) {
      const x = M.x0 + i + 0.5, y = M.y0 + j + 0.5, dx = x - z.x, dy = y - z.y, al = dx * c + dy * s, ac = -dx * s + dy * c;
      const hit = Math.abs(al - z.s) < z.th / 2 + 3 || (al > z.s && al < z.maxS) ? al > z.s - z.th / 2 - 3 && al < z.maxS + z.th / 2 + 3 && Math.abs(ac) < z.half && Math.abs(ac - z.g) > z.gw : false;
      const v = M.m[j * M.w + i], red = v === 2 || v === 3 || v === 8, khe = v >= 4 && v <= 7;
      if (hit && red) dung++; else if (hit) thieu++;
      if (khe && Math.abs(ac - z.g) > z.gw + 1) kheDo++;
    }
    out.push({ thieu, dung, kheDo });
  }
  return out;
}
"""
with sync_playwright() as pw:
    b, pg, errs = open_page(pw, 844, 390)
    res = pg.evaluate(JS)
    b.close()
bad = 0
for i, r in enumerate(res):
    ok = r['thieu'] == 0 and r['kheDo'] == 0
    print(('ĐẠT ' if ok else 'HỎNG ') + 'tường %d: trúng mà không đỏ %d, đúng %d, khe an toàn tô sai %d' % (i + 1, r['thieu'], r['dung'], r['kheDo']))
    bad += 0 if ok else 1
errs = [e for e in errs if 'willReadFrequently' not in e]
if errs: print('LỖI TRANG', errs[:5]); bad += 1
sys.exit(1 if bad else 0)
