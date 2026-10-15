"""Phiên 3 soát mượt: ảnh / GIF TĨNH trước–sau, dựng bằng đúng ảnh sprite + đúng công thức trong code mới (không chạy game, không trình duyệt).

Chạy:  python3 phien3.py ../phien-3     (cần Python 3 + Pillow + numpy)
Mỗi tệp: bên trái HIỆN TẠI (cờ tắt, như trước phiên 3), bên phải SAU PHIÊN 3 (cờ bật).
"""
import math, os, sys
import numpy as np
from PIL import Image, ImageDraw
from phan_tich import nap
from ve import font, frames_to_gif

OUT = sys.argv[1] if len(sys.argv) > 1 else 'phien-3'
os.makedirs(OUT, exist_ok=True)
NEN = (34, 36, 44, 255)
CHU = (235, 225, 200, 255)
TRAI, PHAI = 'HIỆN TẠI (cờ tắt)', 'SAU PHIÊN 3'


def khung_hu(ma):
    d, im = nap(ma)
    n = d.get('net', 1); w, h = d['khung_rong'] * n, d['khung_cao'] * n
    cot = max(1, im.width // w)
    return d, [im.crop(((f % cot) * w, (f // cot) * h, (f % cot) * w + w, (f // cot) * h + h)) for f in range(d['so'])]


def mo(im, a):
    if a >= 0.999: return im
    x = np.asarray(im).copy(); x[..., 3] = (x[..., 3].astype(float) * max(0, a)).astype(np.uint8)
    return Image.fromarray(x, 'RGBA')


def phong(im, s):
    if abs(s - 1) < 1e-3: return im
    w, h = im.size; W, H = max(1, round(w * s)), max(1, round(h * s))
    big = im.resize((W, H), Image.NEAREST); out = Image.new('RGBA', im.size, (0, 0, 0, 0))
    out.alpha_composite(big, ((w - W) // 2, (h - H) // 2)) if W <= w else out.alpha_composite(big.crop(((W - w) // 2, (H - h) // 2, (W - w) // 2 + w, (H - h) // 2 + h)))
    return out


def doi(trai, phai, sc, nhan=('', '')):
    """Ghép 2 hình (RGBA cùng cỡ) cạnh nhau, phóng sc, có nhãn trên."""
    w, h = trai.size; W, H = int(w * sc), int(h * sc)
    o = Image.new('RGBA', (W * 2 + 30, H + 40), NEN); dr = ImageDraw.Draw(o)
    o.alpha_composite(trai.resize((W, H), Image.NEAREST), (10, 30)); o.alpha_composite(phai.resize((W, H), Image.NEAREST), (W + 20, 30))
    dr.text((10, 6), TRAI + (' ' + nhan[0] if nhan[0] else ''), font=font(13), fill=CHU)
    dr.text((W + 20, 6), PHAI + (' ' + nhan[1] if nhan[1] else ''), font=font(13), fill=(150, 230, 160, 255))
    return o


def nen(im, mau=(60, 64, 76, 255)):
    n = Image.new('RGBA', im.size, mau); n.alpha_composite(im); return n


def dai(ds, sc, tieu):
    """Dải tĩnh: hàng trên = hiện tại, hàng dưới = sau (mỗi ô một khung GIF lấy mẫu)."""
    tr, ph = ds
    w, h = tr[0].size; W, H = int(w * sc), int(h * sc); n = len(tr)
    o = Image.new('RGBA', (n * (W + 4) + 150, 2 * (H + 22) + 30), NEN); dr = ImageDraw.Draw(o)
    dr.text((6, 4), tieu, font=font(13), fill=CHU)
    for r, (lst, ten, mau) in enumerate(((tr, TRAI, CHU), (ph, PHAI, (150, 230, 160, 255)))):
        y = 26 + r * (H + 22)
        dr.text((6, y + H // 2 - 7), ten, font=font(11), fill=mau)
        for i, f in enumerate(lst): o.alpha_composite(nen(f).resize((W, H), Image.NEAREST), (146 + i * (W + 4), y))
    return o


# ---------- mục 8: hiệu ứng một lần mờ dần + giữ khung cuối + nảy ----------
def muc8():
    ra = []
    for ma in ('hu-trung', 'hu-no-khoi'):
        if not os.path.exists(f'{os.path.dirname(os.path.abspath(__file__))}/../../../../../game/art/custom/{ma}.sprite.json'): continue
        d, ks = khung_hu(ma)
        gy, HOLD, step = d['giay'], 0.12, 0.02
        T = gy + HOLD + 0.2
        fr, mau_t, mau_p = [], [], []
        w, h = ks[0].size
        for k in range(int(T / step)):
            t = k * step
            f = int(t / gy * d['so'] + 1e-6)
            trai = ks[f] if f < d['so'] else Image.new('RGBA', (w, h), (0, 0, 0, 0))
            vis = gy; tv = min(t, vis - 1e-4); fp = min(d['so'] - 1, int(tv / gy * d['so'] + 1e-6))
            fade = 1 if t <= vis * 0.75 else max(0, 1 - (t - vis * 0.75) / (vis * 0.25 + HOLD))
            nay = 1 + 0.08 * math.sin(math.pi * t / 0.12) if t < 0.12 else 1
            phai = phong(mo(ks[fp], fade), nay) if t < vis + HOLD else Image.new('RGBA', (w, h), (0, 0, 0, 0))
            o = doi(nen(trai), nen(phai), 2, (f't={t:.2f}s', ''))
            fr.append(o)
            if k % 3 == 0 and len(mau_t) < 14: mau_t.append(trai); mau_p.append(phai)
        frames_to_gif(fr, f'{OUT}/p3-08-{ma}-mo-dan.gif', 40)
        dai((mau_t, mau_p), 1.5, f'Mục 8 — {ma}: mỗi ô cách 0,06 giây (GIF chậm ×2). Trái hết khung là tắt; phải giữ khung cuối 0,12 s, mờ 25% cuối, nảy 1→1,08 đầu').save(f'{OUT}/p3-08-{ma}-mo-dan.png')
        ra.append(ma)
    return ra


# ---------- mục 9A: vùng báo trước hoà khung + nhịp sáng cuối ----------
def muc9():
    import json, base64, io
    from phan_tich import ROOT
    d = json.load(open(f'{ROOT}/gd-bt-tron.sprite.json'))
    im = Image.open(io.BytesIO(base64.b64decode(d['anh'].split(',', 1)[1]))).convert('RGBA')
    w, h = 184, 184  # js/bao_truoc.js HA.tron.o
    ks = [im.crop((i * w, 0, i * w + w, h)) for i in range(8)]
    BAO = 1.0; step = 0.02; fr = []; mt, mp = [], []
    for k in range(int((BAO + 0.2) / step)):
        t = k * step
        if t < BAO:
            u = t / BAO; fi = min(6, int(u * 7)); v = u * 7
            trai = ks[fi]
            phai = ks[fi].copy()
            if fi < 6: phai.alpha_composite(mo(ks[fi + 1], min(1, v - fi)))
            con = BAO - t
            if con < 0.15:
                s = 1 - con / 0.15; a = 0.45 * s * (0.6 + 0.4 * math.sin(s * math.pi * 3))
                x = np.asarray(phai).astype(float); add = np.asarray(ks[min(7, fi)]).astype(float)
                x[..., :3] = np.minimum(255, x[..., :3] + add[..., :3] * (add[..., 3:4] / 255) * a); phai = Image.fromarray(x.astype(np.uint8), 'RGBA')
        else:
            f = (t - BAO) / 0.25; al = 1 if f < 0.35 else max(0, 1 - (f - 0.35) / 0.65)
            trai = phai = mo(ks[7], al)
        fr.append(doi(nen(trai), nen(phai), 1.2, (f't={t:.2f}s', '')))
        if k % 4 == 0 and len(mt) < 13: mt.append(trai); mp.append(phai)
    frames_to_gif(fr, f'{OUT}/p3-09-bao-truoc-hoa.gif', 40)
    dai((mt, mp), 0.6, 'Mục 9A — vùng tròn báo trước 1 giây: mỗi ô 0,08 s. Trái nhảy 7 bậc; phải hoà khung kế + nhịp sáng 0,15 s cuối (khung nổ không đổi giờ)').save(f'{OUT}/p3-09-bao-truoc-hoa.png')


# ---------- mục 16A: hiệu ứng lặp chậm hoà khung kế ----------
def muc16():
    d, ks = khung_hu('hu-bam-lua')
    so, gy, step = d['so'], d['giay'], 0.02; fr = []; mt, mp = [], []
    for k in range(int(gy * 2 / step)):
        t = k * step; v = t / gy * so; f = int(v) % so; frac = v - int(v)
        trai = ks[f]; phai = ks[f].copy()
        if frac > 0.02: phai.alpha_composite(mo(ks[(f + 1) % so], 0.35 * frac))
        fr.append(doi(nen(trai), nen(phai), 3, (f'{so / gy:.1f} khung/s', '')))
        if k % 2 == 0 and len(mt) < 12: mt.append(trai); mp.append(phai)
    frames_to_gif(fr, f'{OUT}/p3-16-lap-cham-hoa.gif', 40)
    dai((mt, mp), 2, f'Mục 16A — hu-bam-lua ({so} khung / {gy}s, lặp): mỗi ô 0,04 s. Phải: khung kế đè lên 0–35% theo phần lẻ').save(f'{OUT}/p3-16-lap-cham-hoa.png')


# ---------- mục 17: Cu Tí đứng thở đi đi về về ----------
def muc17():
    d, im = nap('zed-moi')
    n = d.get('net', 1); W = 48 * n
    dt = d['dong_tac']['dung']; so, gy = dt['so'], dt['giay'] * 1.25  # NHIP_LAP 1,25
    ks = [im.crop((i * W, dt['hang'] * W, i * W + W, dt['hang'] * W + W)) for i in range(so)]
    QL = [0, 1, 2, 3, 4, 3, 2, 1]; step = 0.04; fr = []; mt, mp = [], []
    for k in range(int(gy * 2 / step)):
        t = k * step; v = t / (gy / so)
        trai = ks[int(v) % so]; phai = ks[QL[int(v) % len(QL)]]
        fr.append(doi(nen(trai), nen(phai), 3, (f'khung {int(v) % so + 1}', f'khung {QL[int(v) % len(QL)] + 1}')))
    seq_t = [ks[i] for i in range(so)] + [ks[0]]
    seq_p = [ks[i] for i in QL] + [ks[0]]
    frames_to_gif(fr, f'{OUT}/p3-17-cu-ti-tho.gif', 40)
    dai((seq_t, seq_p), 2, 'Mục 17 — Cu Tí đứng thở, một vòng 8 bước + bước nối vòng. Trái 1→8→1 (4 khung cuối gần trùng, rồi bật về 1); phải 1-2-3-4-5-4-3-2-1').save(f'{OUT}/p3-17-cu-ti-tho.png')


# ---------- biểu đồ chung ----------
def bieu_do(path, tieu, cac, xmax, ymin, ymax, nhan_x, nhan_y, W=1180, H=320):
    o = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(o)
    L, R, T, B = 60, 20, 34, 40
    dr.text((10, 8), tieu, font=font(13), fill=CHU)
    dr.rectangle((L, T, W - R, H - B), outline=(90, 94, 110, 255))
    X = lambda x: L + (W - L - R) * x / xmax
    Y = lambda y: H - B - (H - T - B) * (y - ymin) / (ymax - ymin)
    dr.text((W // 2 - 60, H - 22), nhan_x, font=font(11), fill=CHU); dr.text((6, T), nhan_y, font=font(11), fill=CHU)
    ly = T + 4
    for ten, mau, diem, kieu in cac:
        if kieu == 'buoc':
            for i in range(1, len(diem)):
                dr.line((X(diem[i - 1][0]), Y(diem[i - 1][1]), X(diem[i][0]), Y(diem[i - 1][1])), fill=mau, width=2)
                dr.line((X(diem[i][0]), Y(diem[i - 1][1]), X(diem[i][0]), Y(diem[i][1])), fill=mau, width=2)
        else:
            dr.line([(X(a), Y(b)) for a, b in diem], fill=mau, width=2)
        for a, b in diem[:: max(1, len(diem) // 40)]: dr.ellipse((X(a) - 2, Y(b) - 2, X(a) + 2, Y(b) + 2), fill=mau)
        dr.text((W - R - 420, ly), '— ' + ten, font=font(11), fill=mau); ly += 15
    o.save(path)


def muc1():
    """Màn 120 Hz / 90 Hz, logic 60 nhịp: vị trí em bé TRÊN MÀN (x − camera) theo từng lần vẽ, em bé chạy 90 điểm ảnh/giây, camera đuổi theo."""
    for hz in (120, 90):
        STEP = 1 / 60; vx = 90
        px = 400.0; cam = px - 240 - vx / 6; acc = 0.0; last = 0.0  # camera đã đuổi kịp (lệch đều vx/6)
        prev_px, prev_cam = px, cam
        tr, ph, ly, t = [], [], [], 0.0
        for k in range(int(0.5 * hz)):
            now = k / hz; acc += now - last; last = now
            while acc >= STEP:
                prev_px, prev_cam = px, cam
                px += vx * STEP
                cam += (px - 240 - cam) * min(1, STEP * 6)
                acc -= STEP
            a = acc / STEP
            # hiện tại: không nội suy, camera và nhân vật làm tròn riêng (Math.round)
            tr.append((now * 1000, round(px) - round(cam)))
            # sau: nội suy + làm tròn nửa điểm ảnh cùng kiểu (G.NET = 2)
            ix = prev_px + (px - prev_px) * a; ic = prev_cam + (cam - prev_cam) * a
            r = lambda v: round(v * 2) / 2
            ph.append((now * 1000, r(ix) - r(ic)))
            ly.append(ix - ic)  # "chuẩn": vị trí liên tục (không làm tròn) ở đúng lúc vẽ
        # đo độ đều: độ lệch của bước dời giữa hai lần vẽ
        def deu(ds):  # độ rung: lệch so với đường liên tục (bỏ phần lệch đều, chỉ giữ phần dao động), điểm ảnh game
            e = [ds[i][1] - ly[i] for i in range(len(ds))]
            m = sum(e) / len(e); return math.sqrt(sum((x - m) ** 2 for x in e) / len(e))
        y0 = min(min(v for _, v in tr), min(v for _, v in ph)) - 1; y1 = max(max(v for _, v in tr), max(v for _, v in ph)) + 1
        bieu_do(f'{OUT}/p3-01-noi-suy-{hz}hz.png', f'Mục 1 — màn {hz} Hz, logic 60 nhịp/giây: vị trí em bé trên màn mỗi lần vẽ (độ rung so với đường liên tục: trước {deu(tr):.2f}, sau {deu(ph):.2f} điểm ảnh game)',
                [(TRAI + ': không nội suy, camera + nhân vật làm tròn riêng', (240, 150, 110, 255), tr, 'buoc'), (PHAI + ': nội suy + làm tròn nửa điểm ảnh chung', (150, 230, 160, 255), ph, 'buoc')],
                500, y0, y1, 'thời gian (ms)', 'x trên màn')
        yield hz, round(deu(tr), 3), round(deu(ph), 3)


def muc15():
    # chuyển màn: độ đen phủ lên màn (0 = thấy rõ), bảng mở: cỡ + độ hiện, thanh kinh nghiệm, truyện hoà ảnh
    st = [i / 200 for i in range(0, 81)]
    den_tr = [(t * 1000, 0) for t in st]
    den_ph = [(t * 1000, (t / 0.1) if t < 0.1 else ((1 - (t - 0.1) / 0.15) ** 2 if t < 0.25 else 0)) for t in st]
    bieu_do(f'{OUT}/p3-15a-chuyen-man.png', 'Mục 15 — chuyển màn: độ đen phủ màn (0,1 s ảnh màn cũ tối dần, rồi 0,15 s màn mới hiện dần). Đổi màn vẫn tức thì',
            [(TRAI + ': cắt cứng (0 = không phủ)', (240, 150, 110, 255), den_tr, 'line'), (PHAI + ': mờ ra / mờ vào', (150, 230, 160, 255), den_ph, 'line')], 400, 0, 1.05, 'thời gian (ms) từ lúc đổi màn', 'độ đen')
    ez = lambda u: 1 - (1 - u) ** 3
    ts = [i / 400 for i in range(0, 81)]
    s_tr = [(t * 1000, 1) for t in ts]
    s_ph = [(t * 1000, 0.94 + 0.06 * ez(min(1, t / 0.12))) for t in ts]
    a_ph = [(t * 1000, 0.94 + 0.06 * ez(min(1, t / 0.12)) if False else 0.94 + 0.06 * min(1, ez(min(1, t / 0.12)))) for t in ts]
    bieu_do(f'{OUT}/p3-15b-bang-mo.png', 'Mục 15 — bảng mở: cỡ 0,94→1 cùng độ hiện 0→1 trong 0,12 s (ease-out). Toạ độ chạm đổi ngược đúng phép phóng',
            [(TRAI + ': hiện ngay cỡ 1', (240, 150, 110, 255), s_tr, 'line'), (PHAI + ': cỡ (0,94→1)', (150, 230, 160, 255), s_ph, 'line'),
             (PHAI + ': độ hiện (thu về thang 0,94..1)', (120, 190, 255, 255), [(t * 1000, 0.94 + 0.06 * ez(min(1, t / 0.12))) for t in ts], 'line')], 200, 0.93, 1.005, 'thời gian (ms) từ lúc mở', 'cỡ')
    xs = [i / 100 for i in range(0, 71)]
    xp_tr = [(t * 1000, 0.3 if t < 0.05 else 0.62) for t in xs]
    xp_ph = [(t * 1000, 0.3 if t < 0.05 else 0.3 + 0.32 * ez(min(1, (t - 0.05) / 0.4))) for t in xs]
    bieu_do(f'{OUT}/p3-15c-thanh-kinh-nghiem.png', 'Mục 15 — thanh kinh nghiệm 30% → 62%: chạy tới đích trong 0,4 s (lên cấp / giảm thì hiện ngay)',
            [(TRAI + ': nhảy', (240, 150, 110, 255), xp_tr, 'buoc'), (PHAI + ': chạy', (150, 230, 160, 255), xp_ph, 'line')], 700, 0.25, 0.66, 'thời gian (ms)', 'phần đầy')
    tt = [i / 200 for i in range(0, 121)]
    an_tr = [(t * 1000, max(0, 1 - t / 0.35)) for t in tt]
    an_ph = [(t * 1000, 1 - (lambda u: u * u * (3 - 2 * u))(min(1, t / 0.4))) for t in tt]
    chu_tr = [(t * 1000, 1) for t in tt]
    chu_ph = [(t * 1000, min(1, max(0, t - 0.1) * 40 / 60)) for t in tt]
    bieu_do(f'{OUT}/p3-15d-truyen.png', 'Mục 15 — sang trang truyện: phần nhìn thấy của ảnh CŨ (trái: đen phủ rồi hiện ảnh mới), chữ chạy 40 chữ/giây (câu 60 chữ)',
            [(TRAI + ': ảnh cũ mất ngay, đen phủ 0,35 s', (240, 150, 110, 255), an_tr, 'line'), (PHAI + ': ảnh cũ hoà sang ảnh mới 0,4 s', (150, 230, 160, 255), an_ph, 'line'),
             (TRAI + ': chữ hiện cả đoạn', (240, 200, 110, 255), chu_tr, 'line'), (PHAI + ': phần chữ đã chạy', (120, 190, 255, 255), chu_ph, 'line')], 600, 0, 1.05, 'thời gian (ms) từ lúc sang trang', 'tỉ lệ')


def muc20():
    """Đi bộ → chạy (đẩy cần dần) rồi về: khung chân theo thời gian. Trước: đồng hồ chung chia 2 chu kỳ khác nhau + ngưỡng 0,6 không đệm."""
    DI, CHAY = 0.8 * 1.25, 0.6 * 1.25  # giây / vòng (8 khung đi, 12 khung chạy)
    t, dt = 0.0, 1 / 60; ph = 0.0; chay = True
    tr, pp = [], []
    for k in range(int(1.6 / dt)):
        t = k * dt
        tl = 0.6 + 0.04 * math.sin(t * 9)  # cần đẩy dao động quanh ngưỡng 0,6
        ten_tr = 'di' if tl < 0.6 else 'chay'
        so_tr = 8 if ten_tr == 'di' else 12
        i_tr = int(t / (DI if ten_tr == 'di' else CHAY) * so_tr) % so_tr
        if chay and tl < 0.55: chay = False
        elif not chay and tl > 0.65: chay = True
        cyc = CHAY if chay else DI
        ph = (ph + dt / cyc) % 1
        tr.append((t * 1000, i_tr / so_tr)); pp.append((t * 1000, ph))
    bieu_do(f'{OUT}/p3-20-di-chay.png', 'Mục 20 — cần đẩy dao động quanh 0,6: vị trí trong bước chân (0..1) theo thời gian. Trước: lật đi↔chạy liên tục, bước nhảy; sau: pha bước chung + vùng đệm 0,55/0,65',
            [(TRAI, (240, 150, 110, 255), tr, 'buoc'), (PHAI, (150, 230, 160, 255), pp, 'buoc')], 1600, 0, 1.02, 'thời gian (ms)', 'pha bước')


if __name__ == '__main__':
    print('muc 1', list(muc1()))
    print('muc 8', muc8())
    muc9(); muc16(); muc17(); muc15(); muc20()
    print('xong ->', OUT)
