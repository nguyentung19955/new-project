#!/usr/bin/env python3
"""Ảnh dải khung + GIF tại chỗ (112 px đúng cỡ game và phóng 2x; màu và bóng đen) từ sheet lam-moi2-*-2x.

  ../kiem/dai-khung-chay.png, dai-khung-chem1.png : hàng 1 = 2x (cỡ nguồn) trên xám trung tính, có đường đất + trục neo + vạch mắt Lam chốt;
                                                    hàng 2 = 112 px trên nền tối; hàng 3 = bóng đen 112 px trên xám.
                                                    Ô đầu = Lam chốt cùng thang (cao 112 / 224) để so mũ, mắt, chuông.
  ../gif/{chay,chem1}-{112,2x}-{mau,bong}.gif     : tại chỗ, đúng nhịp: chạy 8 ô × 62,5 ms (GIF làm tròn 60/70 ms, tổng 500 ms);
                                                    chém: đứng (D) 300 ms → A 6 bước (atkT 1–6) → B 4 (7–10, hộp bật) → C 4 (11–14) → D 8 (15–22) → đứng (tick = 1/60 s; GIF làm tròn 10 ms)
  ../gif/chem1-2x-mau-cham4.gif                    : chém chậm 4 lần (soi tư thế)
"112" = vẽ ½ sheet 2x (lọc vùng, không phóng nearest) – đúng cỡ trong game. "2x" = cỡ nguồn của sheet (phóng 2 lần so với game).
"""
import json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import cv2, sys

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from tach import tach_anh, cat_o
GOC = os.path.normpath(os.path.join(HERE, '..'))
SPR, KIEM, GIF = (os.path.join(GOC, d) for d in ('sprite', 'kiem', 'gif'))
os.makedirs(GIF, exist_ok=True)
NEN_TOI = (22, 26, 34); XAM = (128, 128, 128)
try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
except Exception:
    FONT = ImageFont.load_default()


def nap(ten):
    m = json.load(open(os.path.join(SPR, 'lam-moi2-%s-2x.json' % ten)))
    im = Image.open(os.path.join(SPR, m['anh'])).convert('RGBA')
    return m, [im.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])) for f in m['frames']]


def nua(im):
    """½ cỡ bằng lọc vùng trên alpha nhân trước (như canvas drawImage chất lượng cao)"""
    a = np.asarray(im).astype(np.float32) / 255; pm = a.copy(); pm[..., :3] *= a[..., 3:4]
    w, h = im.size; r = cv2.resize(pm, (w // 2, h // 2), interpolation=cv2.INTER_AREA)
    al = r[..., 3:4]; rgb = np.where(al > 1e-4, r[..., :3] / np.maximum(al, 1e-4), 0)
    return Image.fromarray((np.dstack([rgb, al]).clip(0, 1) * 255).round().astype(np.uint8))


def bong(im):
    a = np.asarray(im).copy(); a[..., :3] = 0; return Image.fromarray(a)


def tren_nen(im, mau, co=None):
    n = Image.new('RGBA', co or im.size, mau + (255,)); n.alpha_composite(im); return n


def lam_chot(m):
    """Lam chốt ở cùng quy ước: cao 224 px nguồn, giữa mũ ở hàng mắt = neo x, đáy = đất – đặt vào ô cùng cỡ"""
    r = tach_anh(os.path.join(GOC, '..', 'nguon', 'lam-moi-chuong-tan.png')); x0, y0, x1, y1, mm = cat_o(r, 1, 1)[0]
    from tach import do_tu_the
    d = do_tu_the(r, mm); k = 224 / (y1 - y0); xm = (d['mu_sau'] + d['mu_truoc']) / 2
    a = r.astype(np.float32) / 255; pm = a.copy(); pm[..., :3] *= a[..., 3:4]
    W, H = r.shape[1], r.shape[0]; sm = cv2.resize(pm, (round(W * k), round(H * k)), interpolation=cv2.INTER_AREA)
    al = sm[..., 3:4]; rgb = np.where(al > 1e-4, sm[..., :3] / np.maximum(al, 1e-4), 0)
    big = Image.fromarray((np.dstack([rgb, al]).clip(0, 1) * 255).round().astype(np.uint8))
    fw, fh = m['co_khung']; ax, ay = m['diem_neo']['x'], m['diem_neo']['y']
    o = Image.new('RGBA', (fw, fh)); o.alpha_composite(big, (int(round(ax - xm * k)), int(round(ay - y1 * k))))
    mat_y = ay - (y1 - d['mat'][1]) * k
    return o, mat_y


def dai(ten, nhan):
    m, F = nap(ten); fw, fh = m['co_khung']; ax, ay = m['diem_neo']['x'], m['diem_neo']['y']
    chot, mat_y = lam_chot(m)
    cols = [chot] + F; labels = ['Lam chốt'] + nhan
    W = len(cols) * (fw + 8) + 8; H = 24 + fh + 8 + fh // 2 + 8 + 26
    out = Image.new('RGB', (W, H), (40, 44, 52)); d = ImageDraw.Draw(out)
    for i, (c, lb) in enumerate(zip(cols, labels)):
        x = 8 + i * (fw + 8)
        d.text((x + 2, 4), lb, font=FONT, fill=(230, 230, 230))
        o = tren_nen(c, XAM); od = ImageDraw.Draw(o)
        od.line([(0, ay), (fw, ay)], fill=(200, 60, 60)); od.line([(ax, 0), (ax, fh)], fill=(60, 160, 220))
        od.line([(0, mat_y), (fw, mat_y)], fill=(240, 200, 60))   # hàng mắt Lam chốt (đứng thẳng)
        out.paste(o.convert('RGB'), (x, 24))
        h = nua(c); y2 = 24 + fh + 8
        out.paste(tren_nen(h, NEN_TOI).convert('RGB'), (x, y2))
        out.paste(tren_nen(bong(h), XAM).convert('RGB'), (x + fw // 2 + 2, y2))
    d.text((8, H - 22), 'đỏ = mặt đất (neo y) · xanh = trục thân (neo x) · vàng = hàng mắt Lam chốt · hàng 2: 112 px nền tối | bóng đen 112 px', font=FONT, fill=(200, 200, 200))
    out.save(os.path.join(KIEM, 'dai-khung-%s.png' % ten))


def gif(ten, khung_ms, ra, nua_co, bong_den, cham=1):
    m, F = nap(ten)
    fr = []
    for i, ms in khung_ms:
        c = F[i]; c = nua(c) if nua_co else c
        if bong_den: c = bong(c)
        nen = (70, 74, 82) if bong_den else NEN_TOI
        o = Image.new('RGBA', (c.width + 16, c.height + 8), nen + (255,)); o.alpha_composite(c, (8, 0))
        dd = ImageDraw.Draw(o); gy = (m['diem_neo']['y'] // (2 if nua_co else 1))
        dd.line([(0, gy), (o.width, gy)], fill=(90, 96, 104, 255))
        fr.append((o.convert('RGB'), ms * cham))
    # GIF chỉ có bước 10 ms: dồn phần dư sang khung sau để tổng đúng
    du = 0; ds = []
    for _, ms in fr:
        t = ms + du; r = int(round(t / 10)) * 10; du = t - r; ds.append(max(r, 20))
    pal = [f.quantize(colors=255, method=Image.Quantize.MEDIANCUT) for f, _ in fr]
    pal[0].save(os.path.join(GIF, ra), save_all=True, append_images=pal[1:], duration=ds, loop=0, disposal=1)


def main():
    dai('chay', ['1 chạm (gần)', '2 chịu lực', '3 đẩy', '4 bay', '5 chạm (xa)', '6 chịu lực', '7 đẩy', '8 bay'])
    dai('chem1', ['A lấy đà atkT1–6', 'B cắt atkT7–10', 'C kết thúc 11–14', 'D hồi atkT15–22'])
    T = 1000 / 60
    chay = [(i, 62.5) for i in range(8)]
    chem = [(3, 300), (0, 6 * T), (1, 4 * T), (2, 4 * T), (3, 8 * T), (3, 400)]
    for nc, tg in [(True, '112'), (False, '2x')]:
        for bd, tb in [(False, 'mau'), (True, 'bong')]:
            gif('chay', chay, 'chay-tai-cho-%s-%s.gif' % (tg, tb), nc, bd)
            gif('chem1', chem, 'chem1-tai-cho-%s-%s.gif' % (tg, tb), nc, bd)
    gif('chay', chay, 'chay-tai-cho-2x-mau-cham4.gif', False, False, 4)
    gif('chem1', chem, 'chem1-tai-cho-2x-mau-cham4.gif', False, False, 4)
    print('xong')


if __name__ == '__main__':
    main()
