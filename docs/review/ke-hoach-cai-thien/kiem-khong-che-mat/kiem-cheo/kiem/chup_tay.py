"""Ảnh cận NẮM TAY: 4 em bé × tư thế (đứng, chạy, trúng đòn, lấy đà nhát 1, chém nhát 1), vẽ G.art.hero phóng ×K, cắt 28×28 điểm ảnh
game quanh bàn tay (vg.P). Chấm vàng nhỏ (tuỳ chọn) = điểm nắm.
Chạy: python3 chup_tay.py <url> <ảnh ra.png> [cham=0] [bo=goc]"""
import base64, io, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

URL, OUT = sys.argv[1], sys.argv[2]
CHAM = (sys.argv[3] if len(sys.argv) > 3 else '0') == '1'
BO = sys.argv[4] if len(sys.argv) > 4 else 'goc'
TT = [('đứng', [-1, 0, False, {}]), ('chạy', [-1, 0, True, {}]), ('trúng đòn', [-1, 0, False, {'hurtT': 0.3}]),
      ('lấy đà nhát 1', [0.2, 0, False, {'lastAtk': 1}]), ('chém nhát 1', [0.5, 0, False, {'lastAtk': 2}])]
JS = r"""([tt, bo, K]) => {
  const KEYS = ['smith','hunter','wrestler','healer'], C = 28, W = { type: 'sword', family: 0, rarity: 0 };
  const OF = { hat: null, robe: null, back: null, hand: null, mask: null, wing: null }; if (bo !== 'goc') OF.fx = { bo_than: bo };
  const out = [];
  for (const [ten, q] of tt) for (const k of KEYS) {
    const p = Object.assign({ comboI: q[1], mv: {}, st: {} }, q[3]);
    const o = { x: 0, y: 0, face: 1, key: k, t: 1, tc: 1, move: !!q[2], weapon: W, atk: q[0], dodge: -1, p, outfit: OF };
    const vg = G.tinhLinh.vkGhep(o), P = vg.P || [5, -10];
    const cv = document.createElement('canvas'); cv.width = C * K; cv.height = C * K; const c = cv.getContext('2d');
    c.fillStyle = '#4f6e57'; c.fillRect(0, 0, cv.width, cv.height);
    c.setTransform(K, 0, 0, K, Math.round((C / 2 - P[0]) * K), Math.round((C / 2 - P[1]) * K)); c.imageSmoothingEnabled = false;
    G.art.hero(c, o);
    out.push([cv.toDataURL(), ten, k]);
  }
  return out;
}"""
if __name__ == '__main__':
    K = 10
    with sync_playwright() as p:
        b = p.chromium.launch(); g = b.new_page(); loi = []
        g.on('pageerror', lambda e: loi.append(str(e)))
        g.goto(URL)
        g.wait_for_function("window.G && G.spriteCustom && G.tinhLinh && G.weaponArt && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img && s.donMa; })", timeout=300000)
        if BO != 'goc':
            g.evaluate("(b) => { for (const k of ['smith','hunter','wrestler','healer']) G.spriteCustom.get('em-be-'+k+'-'+b); }", BO); g.wait_for_timeout(3000)
        g.wait_for_timeout(1000)
        r = g.evaluate(JS, [TT, BO, K])
        b.close()
    S = 28 * K
    im = Image.new('RGB', (4 * S + 5 * 6, len(TT) * (S + 22) + 6), '#1d2620'); d = ImageDraw.Draw(im)
    try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
    except Exception: font = ImageFont.load_default()
    for n, (u, ten, k) in enumerate(r):
        i, j = divmod(n, 4); x, y = 6 + j * (S + 6), 6 + i * (S + 22)
        a = Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB'); im.paste(a, (x, y + 18))
        d.text((x, y), f'{ten} — {k}', fill='#ffffff', font=font)
        if CHAM: d.ellipse([x + S / 2 - 3, y + 18 + S / 2 - 3, x + S / 2 + 3, y + 18 + S / 2 + 3], outline='#ffe000')
    im.save(OUT); print(OUT, im.size, 'pageerror:', loi or 'không có')
