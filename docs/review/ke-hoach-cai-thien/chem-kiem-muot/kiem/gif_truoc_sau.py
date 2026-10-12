"""GIF trước / sau: 4 em bé (cột) × trước (hàng trên) / sau (hàng dưới), vẽ bằng G.art.hero từng khung 60 fps, phóng ×4,
xuất GIF 30 fps (lấy 1 khung mỗi 2). Chữ "CHẠM" ở khung đòn gây sát thương (u = 0,45).
Chạy: python3 gif_truoc_sau.py <url trước> <url sau> <thư mục ra>   (url ví dụ http://127.0.0.1:8771/linh-khi-nhe.html?cloud=0)"""
import base64, io, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

K, CW, CH = 4, 64, 60
CANH = ['dung', 'chay', 'trai', 'chieu']
JS = r"""([ten]) => {
  const KEYS = ['smith','hunter','wrestler','healer'], DUR = [0.3, 0.3, 0.46], K = %d, CW = %d, CH = %d;
  const W = { type: 'sword', family: 0, rarity: 0 }, OF = { hat: null, robe: null, back: null, hand: null, mask: null, wing: null };
  let ID = 0;
  const nhat = (cb, mv, x) => { const n = Math.round(DUR[cb] * 60), r = [], id = ++ID; for (let i = 0; i < n; i++) r.push([i / n, cb, mv, Object.assign({ lastAtk: id }, x || {}), i / n <= 0.45 && (i + 1) / n > 0.45]); return r; };
  const nghi = (n, cb, mv, x) => Array.from({ length: n }, () => [-1, cb, mv, x || {}, false]);
  let canh, face = 1;
  if (ten === 'dung') canh = nghi(8, 0).concat(nhat(0), nghi(2, 0), nhat(1), nghi(2, 1), nhat(2), nghi(20, 2));
  if (ten === 'chay') canh = nghi(8, 0, true).concat(nhat(0, true), nhat(1, true), nhat(2, true), nghi(20, 2, true));
  if (ten === 'trai') { face = -1; canh = nghi(8, 0).concat(nhat(0), nhat(1), nhat(2), nghi(20, 2)); }
  if (ten === 'chieu') { canh = nghi(8, 0); for (let i = 0; i < 21; i++) canh.push([-1, 0, false, { specT: Math.max(0.001, 0.35 - i / 60) }, false]);
    canh = canh.concat(nghi(16, 0, false, { specT: 0 }));
    for (let i = 0; i < 8; i++) canh.push([0, 0, false, { dashT: Math.max(0.001, 0.12 - i / 60) }, false]);
    canh = canh.concat(nghi(20, 0, false, { dashT: 0 })); }
  const ps = KEYS.map(() => ({ comboI: 0, mv: {}, st: {} })), out = [];
  const cv = document.createElement('canvas'); cv.width = CW * K * 4; cv.height = CH * K; const c = cv.getContext('2d');
  canh.forEach((q, i) => {
    c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#4f6e57'; c.fillRect(0, 0, cv.width, cv.height);
    KEYS.forEach((k, j) => {
      const p = ps[j]; p.comboI = q[1]; Object.assign(p, q[3]);
      const o = { x: CW / 2 + j * CW, y: CH - 8, face, key: k, t: 1 + i / 60, tc: 1 + i / 60, move: !!q[2], weapon: W, atk: q[0], dodge: -1, p, outfit: OF };
      c.setTransform(K, 0, 0, K, 0, 0); c.imageSmoothingEnabled = false;
      try { G.art.hero(c, o); } catch (e) { out.err = String(e); }
    });
    out.push([cv.toDataURL(), q[4]]);
  });
  return out;
}""" % (K, CW, CH)


def chup(url):
    kq = {}
    with sync_playwright() as p:
        b = p.chromium.launch(); g = b.new_page(); loi = []
        g.on('pageerror', lambda e: loi.append(str(e)))
        g.goto(url)
        g.wait_for_function("window.G && G.spriteCustom && G.tinhLinh && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img && s.donMa; })", timeout=240000)
        g.wait_for_timeout(1500)
        for ten in CANH: kq[ten] = g.evaluate(JS, [ten])
        b.close()
    print(url, 'pageerror:', loi or 'không có')
    return kq


if __name__ == '__main__':
    U0, U1, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
    os.makedirs(OUT, exist_ok=True)
    A, B = chup(U0), chup(U1)
    try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
    except Exception: font = ImageFont.load_default()
    TEN = ['Cu Tí', 'Cu Tèo', 'Cu Lì', 'Cái Bống']
    for ten in CANH:
        fr = []
        for i in range(0, len(A[ten]), 2):
            a = Image.open(io.BytesIO(base64.b64decode(A[ten][i][0].split(',')[1]))).convert('RGB')
            b = Image.open(io.BytesIO(base64.b64decode(B[ten][i][0].split(',')[1]))).convert('RGB')
            W, H = a.size
            im = Image.new('RGB', (W, 2 * H + 24), '#26332b'); im.paste(a, (0, 24)); im.paste(b, (0, H + 24))
            d = ImageDraw.Draw(im)
            for j, t in enumerate(TEN): d.text((j * W // 4 + 8, 4), t, fill='#ffffff', font=font)
            d.text((4, 28), 'TRƯỚC', fill='#ffb0b0', font=font); d.text((4, H + 28), 'SAU', fill='#b0ffb0', font=font)
            cham = A[ten][i][1] or (i + 1 < len(A[ten]) and A[ten][i + 1][1])
            if cham: d.text((W - 80, 28), 'CHẠM', fill='#ffe060', font=font); d.text((W - 80, H + 28), 'CHẠM', fill='#ffe060', font=font)
            fr.append(im.quantize(colors=64, method=Image.Quantize.MEDIANCUT))
        fr[0].save(os.path.join(OUT, f'{ten}.gif'), save_all=True, append_images=fr[1:], duration=33, loop=0, optimize=True, disposal=1)
        print(ten, len(fr), 'khung', os.path.getsize(os.path.join(OUT, f'{ten}.gif')) // 1024, 'KB')
