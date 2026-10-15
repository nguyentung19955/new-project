"""Dựng GIF 'băng hình mô phỏng' bằng chính dữ liệu dong_tac + nhịp code (không chạy game)."""
import json, base64, io, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from phan_tich import nap, cat, ROOT
from ve import font, chu, len_nen, frames_to_gif

OUT = sys.argv[1] if len(sys.argv) > 1 else 'xem'
os.makedirs(OUT, exist_ok=True)
TICK = 0.02  # 50 khung/giây (GIF không xuống dưới 20 ms)
NEN = (34, 36, 44, 255)


def doc_bang(a, so):
    k = a.get('khung')
    if not isinstance(k, list):
        return None
    ds = [i for i in k if 0 <= i < so]
    n = len(ds); jc = ds.index(a['cham']) if a.get('cham') in ds else -1
    if jc < 0:
        return [(j / n, ds[j]) for j in range(n)]
    t0 = ds[jc] / so; b = []
    for j in range(jc): b.append((j * t0 / jc, ds[j]))
    for j in range(jc, n): b.append((t0 + (j - jc) * (1 - t0) / (n - jc), ds[j]))
    b[0] = (0, b[0][1]); return b


def mot(a, u):
    u = min(1, max(0, u)); b = doc_bang(a, a['so'])
    if b:
        k = 0
        for j in range(1, len(b)):
            if u + 1e-6 >= b[j][0]: k = j
        return b[k][1]
    return min(a['so'] - 1, int(u * a['so']))


def lap(a, t, giay=None):
    g = giay or a['giay']
    return int(max(0, t) / (g / a['so']) + 1e-6) % a['so']


class Quai:
    def __init__(self, ma):
        self.d, im = nap(ma)
        self.dt = self.d['dong_tac']
        self.f = {k: [Image.fromarray(x, 'RGBA') for x in cat(self.d, im, v['hang'], v['so'])] for k, v in self.dt.items()}


def vien(fr, v):
    """viền sáng kiểu CHOP_NHE: 4 bóng lệch 1 điểm ảnh màu #fff6e0 dưới thân + nhuộm đỏ 0.3."""
    if v <= 0: return fr
    a = np.asarray(fr).copy(); al = a[..., 3]
    sil = np.zeros_like(a); sil[..., 0], sil[..., 1], sil[..., 2] = 255, 246, 224
    m = np.zeros(al.shape, bool)
    for dx, dy in ((2, 0), (-2, 0), (0, 2), (0, -2)):
        m |= np.roll(np.roll(al > 40, dy, 0), dx, 1)
    sil[..., 3] = (m * 255 * 0.85 * v).astype(np.uint8)
    out = Image.fromarray(sil, 'RGBA')
    body = a.astype(float)
    body[..., 0] = body[..., 0] * 0.7 + 255 * 0.3 * v + body[..., 0] * 0.3 * (1 - v)
    body[..., 1] *= (1 - 0.3 * v); body[..., 2] *= (1 - 0.3 * v)
    out.alpha_composite(Image.fromarray(body.clip(0, 255).astype(np.uint8), 'RGBA'))
    return out


def ghep(panels, nhan, ghi, scale=1, size=None):
    """panels: list of RGBA frames (cùng cỡ) → 1 khung GIF có tiêu đề + chú thích xuống dòng."""
    w, h = panels[0].size
    w2, h2 = int(w * scale), int(h * scale)
    W = max(560, len(panels) * (w2 + 12) + 12)
    f = font(12); dong = []; cur = ''
    for tu in ghi.split(' '):
        thu = (cur + ' ' + tu).strip()
        if f.getlength(thu) > W - 24: dong.append(cur); cur = tu
        else: cur = thu
    dong.append(cur)
    o = Image.new('RGBA', (W, h2 + 36 + 16 * len(dong)), (20, 20, 24, 255))
    x0 = (W - (len(panels) * (w2 + 12) - 12)) // 2
    for i, p in enumerate(panels):
        x = x0 + i * (w2 + 12)
        bg = Image.new('RGBA', p.size, NEN); bg.alpha_composite(p)
        o.paste(bg.resize((w2, h2), Image.NEAREST), (x, 26))
        chu(o, (x, 6), nhan[i], 13, (255, 220, 120, 255) if 'HIỆN' in nhan[i] else (140, 230, 160, 255))
    for k, dg in enumerate(dong):
        chu(o, (12, h2 + 32 + 16 * k), dg, 12, (220, 220, 220, 255))
    return o


def gif_atk_cat(ma='heoCon'):
    q = Quai(ma); D = 0.6 if ma == 'heoCon' else 0.55
    T = 0.6; seq = []
    # mỗi chu kỳ: đứng 0.5 → báo T → đánh tới 0.75D (hiện tại) → đứng 0.5
    for vong in range(2):
        t = 0; tid = 0.0
        tong = 0.5 + T + 0.75 * D + 0.6
        while t < tong:
            if t < 0.5:
                a = b = ('idle', lap(q.dt['idle'], tid + t)); tag = 'đứng'
            elif t < 0.5 + T:
                u = (t - 0.5) / T; a = b = ('tele', mot(q.dt['tele'], u)); tag = 'báo đòn'
            elif t < 0.5 + T + 0.75 * D:
                ta = t - 0.5 - T
                a = ('atk', mot(q.dt['atk'], ta / D)); b = ('atk', mot(q.dt['atk'], ta / (0.75 * D))); tag = 'đánh'
            else:
                ti = t - (0.5 + T + 0.75 * D)
                a = ('idle', lap(q.dt['idle'], ti))  # hiện tại: đồng hồ về 0 → khung 1 của đứng
                # đề xuất: giữ khung cuối đánh 60 ms rồi về đứng
                b = ('atk', q.dt['atk'].get('khung', [q.dt['atk']['so'] - 1])[-1]) if ti < 0.06 else ('idle', lap(q.dt['idle'], ti - 0.06))
                tag = 'về đứng'
            fa = q.f[a[0]][a[1]]; fb = q.f[b[0]][b[1]]
            seq.append(ghep([fa, fb], [f'HIỆN TẠI: {a[0]} k{a[1]+1}', f'ĐỀ XUẤT: {b[0]} k{b[1]+1}'],
                            f'{ma}: hàng đánh bị cắt ở 75% → khung thu đòn không bao giờ hiện, nhảy về đứng ({tag})', 2))
            t += TICK
    frames_to_gif(seq, f'{OUT}/gif-1-don-danh-bi-cat.gif', int(TICK * 1000))


def gif_bao_dai(ma='caNoc', T=1.0):
    q = Quai(ma); a_t = q.dt['tele']; seq = []; so = a_t['so']
    t = 0
    tong = 0.4 + T + 0.4
    while t < tong:
        if t < 0.4:
            A = B = ('idle', lap(q.dt['idle'], t))
        elif t < 0.4 + T:
            tt = t - 0.4; u = tt / T
            A = ('tele', mot(a_t, u))
            # đề xuất: chạy hàng báo ~12 khung/giây một lượt, rồi đưa đi đưa lại 3 khung cuối tới lúc ra đòn (như trùm vùng)
            if tt < so / 12: B = ('tele', min(so - 1, int(tt * 12)))
            else:
                p = int((tt - so / 12) * 12) % 4; j = p if p < 3 else 4 - p; B = ('tele', so - 3 + j)
        else:
            tt = t - 0.4 - T; A = B = ('atk', mot(q.dt['atk'], tt / 0.55))
        seq.append(ghep([q.f[A[0]][A[1]], q.f[B[0]][B[1]]], [f'HIỆN TẠI {A[0]} k{A[1]+1}', f'ĐỀ XUẤT {B[0]} k{B[1]+1}'],
                        f'{ma}: báo đòn {T:.1f} s kéo 6 khung → 6 khung/giây, khựng; đề xuất 12 khung/giây + đưa đi đưa lại 3 khung cuối', 2))
        t += TICK
    frames_to_gif(seq, f'{OUT}/gif-2-bao-don-dai-khung.gif', int(TICK * 1000))


def gif_choang(ma='heoCon'):
    q = Quai(ma); seq = []; t = 0
    while t < 2.0:
        u = (0.08 + 0.06 * math.sin(t * 9)) / 0.35
        i = mot(q.dt['hit'], u); fl = 0.75 if u < 0.3 else 0
        A = vien(q.f['hit'][i], fl)
        j = mot(q.dt['hit'], 0.35 + 0.15 * math.sin(t * 9)); B = q.f['hit'][j]
        seq.append(ghep([A, B], [f'HIỆN TẠI hit k{i+1} {"CHỚP" if fl else ""}', f'ĐỀ XUẤT stun k{j+1}'],
                        f'{ma} bị choáng: code gửi "hit" → viền trắng chớp ~1,4 lần/giây suốt lúc choáng (trông như bị đánh liên tục)', 2))
        t += TICK
    frames_to_gif(seq, f'{OUT}/gif-3-choang-chop-nhap-nhay.gif', int(TICK * 1000))


def gif_di_dung(ma='chonBong'):
    q = Quai(ma); seq = []; rng = np.random.default_rng(3)
    # cờ "đang đi" lật liên tục quanh mốc dừng (md > 3 không có vùng đệm)
    pattern = []
    while len(pattern) < 120:
        pattern += [True] * int(rng.integers(3, 9)) + [False] * int(rng.integers(2, 7))
    tA = 0; nA = None; tB_i = 0; tB_m = 0; nB = 'idle'; hold = 0
    for k, mv in enumerate(pattern[:120]):
        n = 'move' if mv else 'idle'
        if n != nA: tA = 0; nA = n
        else: tA += TICK
        A = (nA, lap(q.dt[nA], tA))
        # đề xuất: 0,15 s vùng đệm mới đổi hàng, giữ đồng hồ riêng mỗi hàng
        if mv: hold = 0.15
        else: hold -= TICK
        nB = 'move' if hold > 0 else 'idle'
        tB_m += TICK; tB_i += TICK
        B = (nB, lap(q.dt[nB], tB_m if nB == 'move' else tB_i))
        seq.append(ghep([q.f[A[0]][A[1]], q.f[B[0]][B[1]]], [f'HIỆN TẠI {A[0]} k{A[1]+1}', f'ĐỀ XUẤT {B[0]} k{B[1]+1}'],
                        f'{ma} đứng sát mốc dừng: đi↔đứng lật vài khung một lần, mỗi lần về khung 1 → giật', 2))
    frames_to_gif(seq, f'{OUT}/gif-4-di-dung-lat-lien-tuc.gif', int(TICK * 1000))


def nap_hu(ma):
    d = json.load(open(f'{ROOT}/{ma}.sprite.json'))
    im = Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',', 1)[1]))).convert('RGBA')
    return d, [Image.fromarray(x, 'RGBA') for x in cat(d, im, 0, d['so'])]


def gif_hieu_ung(mas=('hu-bua-tam-giac', 'hu-tia-mom', 'hu-manh-san-ho')):
    data = [nap_hu(m) for m in mas]
    W = max(f[0].width for _, f in data); H = max(f[0].height for _, f in data)
    seq = []; t = 0; L = max(d['giay'] for d, _ in data) + 0.5
    while t < L:
        panels = []; nh = []
        for (d, fs), m in zip(data, mas):
            for cach in (0, 1):
                c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
                g = d['giay']
                if cach == 0:
                    if t < g: c.alpha_composite(fs[min(d['so'] - 1, int(t / g * d['so']))], ((W - fs[0].width) // 2, (H - fs[0].height) // 2))
                else:
                    if t < g + 0.15:
                        i = min(d['so'] - 1, int(min(t, g * 0.999) / g * d['so']))
                        a = 1.0 if t < 0.75 * g else max(0, 1 - (t - 0.75 * g) / (0.25 * g + 0.15))
                        s = 1 + 0.08 * max(0, 1 - t / 0.12)  # nảy nhẹ lúc xuất hiện
                        f = fs[i]
                        if abs(s - 1) > 0.01: f = f.resize((int(f.width * s), int(f.height * s)), Image.NEAREST)
                        arr = np.asarray(f).copy(); arr[..., 3] = (arr[..., 3] * a).astype(np.uint8)
                        c.alpha_composite(Image.fromarray(arr, 'RGBA'), ((W - f.width) // 2, (H - f.height) // 2))
                panels.append(c); nh.append('HIỆN TẠI' if cach == 0 else 'ĐỀ XUẤT')
        seq.append(ghep(panels, nh, '(' + ' | '.join(mas) + ') Hiệu ứng một lần: hết khung cuối là biến mất ngay (khung cuối còn đậm). Đề xuất: mờ dần 25% cuối + nảy nhẹ lúc hiện', 3))
        t += TICK
    frames_to_gif(seq, f'{OUT}/gif-5-hieu-ung-tat-phut.gif', int(TICK * 1000))


def gif_vung_bao(T=1.0):
    d = json.load(open(f'{ROOT}/gd-bt-tron.sprite.json'))
    im = Image.open(io.BytesIO(base64.b64decode(d['anh'].split(',', 1)[1]))).convert('RGBA')
    fs = [im.crop((i * 184, 0, i * 184 + 184, 184)) for i in range(8)]
    seq = []; t = 0
    while t < T + 0.5:
        A = Image.new('RGBA', (184, 184), (0, 0, 0, 0)); B = A.copy()
        if t < T:
            u = t / T; ap = min(1, t / 0.15); e = 1 - (1 - ap) ** 3
            fi = min(6, int(u * 7))
            A = Image.blend(A, fs[fi], 1) if e >= 1 else Image.blend(Image.new('RGBA', (184, 184), (0, 0, 0, 0)), fs[fi], e)
            x = u * 7; i0 = min(6, int(x)); i1 = min(6, i0 + 1); fr = x - int(x) if i0 < 6 else 0
            mix = Image.blend(fs[i0], fs[i1], fr)
            if u > 0.85:  # nhịp sáng 0,15 s cuối
                k = 0.5 + 0.5 * math.sin((u - 0.85) / 0.15 * math.pi * 3)
                arr = np.asarray(mix).astype(float); arr[..., :3] = arr[..., :3] + (255 - arr[..., :3]) * 0.35 * k
                mix = Image.fromarray(arr.clip(0, 255).astype(np.uint8), 'RGBA')
            B = Image.blend(Image.new('RGBA', (184, 184), (0, 0, 0, 0)), mix, e)
            na, nb = f'HIỆN TẠI k{fi+1}', f'ĐỀ XUẤT k{i0+1}+{fr:.1f}'
        else:
            f = (t - T) / 0.5; a = 1 if f < 0.35 else max(0, 1 - (f - 0.35) / 0.65)
            arr = np.asarray(fs[7]).copy(); arr[..., 3] = (arr[..., 3] * a).astype(np.uint8)
            A = B = Image.fromarray(arr, 'RGBA'); na = nb = 'NỔ k8'
        seq.append(ghep([A, B], [na, nb], 'Vùng báo trước 1 giây: 7 bậc nhảy (~7 lần/giây). Đề xuất: hoà 2 khung liền + sáng nhịp 0,15 s cuối', 1))
        t += TICK
    frames_to_gif(seq, f'{OUT}/gif-6-vung-bao-truoc-nhay-bac.gif', int(TICK * 1000))


def gif_cuti_dung():
    d, im = nap('zed-moi'); a = d['dong_tac']['dung']
    fs = [Image.fromarray(x, 'RGBA') for x in cat(d, im, a['hang'], a['so'])]
    g = a['giay'] * 1.25  # NHIP_LAP
    seq = []; t = 0; bang = [0, 1, 2, 3, 4, 3, 2, 1]
    while t < g * 2:
        i = lap(a, t, g); j = bang[int(t / (g / 8)) % 8]
        seq.append(ghep([fs[i], fs[j]], [f'HIỆN TẠI k{i+1}', f'ĐỀ XUẤT k{j+1}'],
                        'Cu Tí đứng thở: khung 5–8 gần như y nhau (đứng im ~0,5 s) rồi bật về khung 1. Đề xuất phát 1-2-3-4-5-4-3-2', 2))
        t += TICK
    frames_to_gif(seq, f'{OUT}/gif-7-cu-ti-dung-tho.gif', int(TICK * 1000))


if __name__ == '__main__':
    gif_atk_cat(); gif_bao_dai(); gif_choang(); gif_di_dung(); gif_hieu_ung(); gif_vung_bao(); gif_cuti_dung()
    print('xong')
