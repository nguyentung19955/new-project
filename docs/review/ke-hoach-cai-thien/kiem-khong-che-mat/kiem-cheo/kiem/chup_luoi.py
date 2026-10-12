"""Ảnh lưới bằng chứng: 4 em bé (cột) × tư thế (hàng), vẽ bằng G.art.hero, phóng ×K điểm ảnh game (nét pixel),
vòng đỏ = vùng mặt SC.matKhung của khung đang vẽ (tuỳ chọn).
Chạy: python3 chup_luoi.py <url> <ảnh ra.png> [vong=1] [bo=goc|rung|bien|lau] [loai=sword] [ho=0]"""
import base64, io, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

URL, OUT = sys.argv[1], sys.argv[2]
VONG = (sys.argv[3] if len(sys.argv) > 3 else '1') == '1'
BO = sys.argv[4] if len(sys.argv) > 4 else 'goc'
LOAI = sys.argv[5] if len(sys.argv) > 5 else 'sword'
HO = int(sys.argv[6]) if len(sys.argv) > 6 else 0
HANG = [  # tên, các khung [atk, comboI, move, p-thêm, dodge]
    ('đứng', [[-1, 0, False, {}, -1]] * 1),
    ('đứng (quay trái)', 'TRAI'),
    ('chạy', [[-1, 0, True, {}, -1]]),
    ('chạy khung 3', [[-1, 0, True, {}, -1]]),
    ('trúng đòn', [[-1, 0, False, {'hurtT': 0.3}, -1]]),
    ('lộn', [[-1, 0, False, {'ddx': 1, 'ddy': 0}, 0.3]]),
    ('giữ lấy đà', [[-1, 0, False, {'mv': {'holding': True, 'charge': 0.6}}, -1]]),
]
JS = r"""([url, hang, bo, LOAI, HO, K]) => {
  const SC = G.spriteCustom, KEYS = ['smith','hunter','wrestler','healer'], CW = 60, CH = 56;
  const W = { type: LOAI, family: HO, rarity: 0 };
  const OF = { hat: null, robe: null, back: null, hand: null, mask: null, wing: null }; if (bo !== 'goc') OF.fx = { bo_than: bo };
  const cv = document.createElement('canvas'); cv.width = CW * K * 4; cv.height = CH * K * hang.length; const c = cv.getContext('2d');
  c.fillStyle = '#4f6e57'; c.fillRect(0, 0, cv.width, cv.height);
  const vong = [];
  hang.forEach((h, r) => KEYS.forEach((k, j) => {
    const q = h.q, face = h.trai ? -1 : 1, p = Object.assign({ comboI: q[1], mv: {}, st: {} }, q[3]);
    const t = 1 + (h.t || 0);
    const o = { x: CW / 2 + j * CW, y: CH * r + CH - 8, face, key: k, t, tc: t, move: !!q[2], weapon: W, atk: q[0], dodge: q[4], p, outfit: OF };
    c.setTransform(K, 0, 0, K, 0, 0); c.imageSmoothingEnabled = false;
    G.art.hero(c, o);
    const sp = SC.cuaEmBe(k, o), s = SC.chonEmBe(sp, o), m = SC.matKhung(sp, s.ten, s.i);
    if (m) vong.push([(o.x + face * m.x) * K, (o.y + m.y) * K, m.r * K]);
  }));
  return [cv.toDataURL(), vong];
}"""

if __name__ == '__main__':
    K = 6
    hang = []
    for ten, q in HANG:
        if q == 'TRAI': hang.append({'q': [-1, 0, False, {}, -1], 'trai': True, 'ten': ten})
        else: hang.append({'q': q[0], 'ten': ten, 't': 0.47 if 'khung 3' in ten else 0})
    with sync_playwright() as p:
        b = p.chromium.launch(); g = b.new_page(); loi = []
        g.on('pageerror', lambda e: loi.append(str(e)))
        g.goto(URL)
        g.wait_for_function("window.G && G.spriteCustom && G.tinhLinh && G.weaponArt && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img && s.donMa; })", timeout=300000)
        if BO != 'goc':
            g.evaluate("(b) => { for (const k of ['smith','hunter','wrestler','healer']) G.spriteCustom.get('em-be-'+k+'-'+b); }", BO)
            g.wait_for_timeout(3000)
        g.wait_for_timeout(1000)
        url, vong = g.evaluate(JS, [URL, hang, BO, LOAI, HO, K])
        b.close()
    im = Image.open(io.BytesIO(base64.b64decode(url.split(',')[1]))).convert('RGB')
    d = ImageDraw.Draw(im)
    if VONG:
        for x, y, r in vong: d.ellipse([x - r, y - r, x + r, y + r], outline='#ff3030', width=2)
    try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
    except Exception: font = ImageFont.load_default()
    for i, h in enumerate(hang): d.text((4, i * 56 * K + 4), h['ten'], fill='#ffffff', font=font)
    im.save(OUT)
    print(OUT, im.size, 'pageerror:', loi or 'không có')
