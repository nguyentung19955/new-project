"""Ba trùm nhỏ MỚI (Nấm Chúa, Cua Đá, Hổ Lửa): khung đã cắt (docs/anh-goc/trum-moi/<nam-chua|cua-da|ho-lua>/*-cat) -> 2 tệp sprite mỗi con
(<mã>.sprite.json pha 1 6 hàng, <mã>-p2.sprite.json pha 2 4 hàng). python3 dung-trum-nho.py [--ghi]   (không --ghi: ghi tạm vào cong-cu/ra/)
Dựng từ dung-moc-ho.py, cùng cách:
- Co cỡ: mỗi hàng MỘT hệ số, đo bằng khớp SIFT (estimateAffinePartial2D, trung vị mọi cặp khung) với hàng đứng cùng pha;
  giữa hai pha: SIFT hàng đứng p2 so với hàng đứng p1 (hai chiều). Nấm p2 báo đòn (vẽ quay trái, đã lật): SIFT không tin được -> theo chiều cao khung đầu.
- Cỡ game: pha 1 đứng cao ≈ con cũ (ảnh AI cũ: Nấm 64, Cua 74, Hổ 60 điểm game). Giữ rong/cao cũ, không đụng hộp va chạm (BODY trong boss.js).
- Nhịp đòn: đòn thường gây sát thương ngay đầu hàng atk; chiêu 1/2 ở u = 0,5 (hàng atk ~0,17) -> hàng atk bắt đầu từ khung chạm (CHAM),
  các khung trước nối vào cuối hàng tele.
"""
import sys, os, json, glob, io, base64
import numpy as np
from PIL import Image

DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GOC0 = os.path.join(DAY, 'docs/anh-goc/trum-moi')
GHI = '--ghi' in sys.argv
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra'); os.makedirs(RA, exist_ok=True)
N = 2; SO_MAU = 128

CFG = {
  'namChua': dict(thu_muc='nam-chua', ten='Nấm Chúa', vung='rung', cao_cu=64, rong=97, cao=63, LAT={'p2-2-bao-don'},
    LIEN_PHA={1: 1.0, 2: 1.06},
    TRONG_PHA={'1-dung': 1.0, '2-di': 0.99, '3-bao-don': 0.918, '4-danh': 0.94, '5-trung-don': 1.32, '6-chet': 0.96,
               'p2-1-dung': 1.0, 'p2-2-bao-don': 0.95, 'p2-3-danh': 0.985, 'p2-4-trung-don': 1.255},
    CHAM={1: 2, 2: 1}, ten_pha={2: 'Nấm Chúa · pha 2 (nổi giận)'}),
  'cuaDa': dict(thu_muc='cua-da', ten='Cua Đá', vung='bien', cao_cu=74, rong=117, cao=71, LAT=set(),
    LIEN_PHA={1: 1.0, 2: 1.04},
    TRONG_PHA={'1-dung': 1.0, '2-di': 0.898, '3-bao-don': 1.049, '4-danh': 0.93, '5-trung-don': 1.236, '6-chet': 0.958,
               'p2-1-dung': 1.0, 'p2-2-bao-don': 1.03, 'p2-3-danh': 0.926, 'p2-4-trung-don': 1.325},
    CHAM={1: 2, 2: 2}, ten_pha={2: 'Cua Đá · pha 2 (nổi giận)'}),
  'hoLua': dict(thu_muc='ho-lua', ten='Hổ Lửa', vung='laudai', cao_cu=60, rong=109, cao=64, LAT=set(),
    LIEN_PHA={1: 1.0, 2: 0.972},
    TRONG_PHA={'1-dung': 1.0, '2-di': 0.934, '3-bao-don': 1.017, '4-danh': 1.025, '5-trung-don': 1.42, '6-chet': 1.018,
               'p2-1-dung': 1.0, 'p2-2-bao-don': 0.97, 'p2-3-danh': 1.055, 'p2-4-trung-don': 1.55},
    CHAM={1: 2, 2: 2}, ten_pha={2: 'Hổ Lửa · pha 2 (nổi giận)'}),
}
HANG = {1: [('idle', '1-dung', 1.4, True), ('move', '2-di', 0.8, True), ('tele', '3-bao-don', 0.7, False), ('atk', '4-danh', 0.6, False),
            ('hit', '5-trung-don', 0.3, False), ('die', '6-chet', 1.2, False)]}
for p in (2,):
    HANG[p] = [('idle', 'p%d-1-dung' % p, 1.4, True), ('tele', 'p%d-2-bao-don' % p, 0.7, False), ('atk', 'p%d-3-danh' % p, 0.6, False), ('hit', 'p%d-4-trung-don' % p, 0.3, False)]
DANH = {1: '4-danh', 2: 'p2-3-danh'}
pha_cua = lambda ten: 2 if ten.startswith('p2-') else 3 if ten.startswith('p3-') else 1


def hieu_ung(a):
    """điểm rực màu (lửa, nhựa độc, bào tử, chớp sáng): không dùng để neo"""
    c = a[..., :3].astype(int); mx = c.max(2); mn = c.min(2)
    return ((mx > 180) & (mx - mn > 110)) | (mn > 215)


def doc_hang(goc, ten, lat=()):
    d = os.path.join(goc, ten + '-cat')
    ks = json.load(open(os.path.join(d, 'bao-cao.json'), encoding='utf-8'))['hang'][0]['khung']
    fs = sorted(glob.glob(os.path.join(d, ten, 'khung-*.png'))); assert len(fs) == len(ks), ten
    dat = float(np.median([k['chan'][1] for k in ks]))
    anh, lech = [], []
    for f, k in zip(fs, ks):
        a = np.array(Image.open(f).convert('RGBA'))
        if ten in lat: a = a[:, ::-1].copy()  # vẽ quay trái -> lật ngang
        m = a[..., 3] > 128
        assert a.shape[0] == k['khung_bao'][3] - k['khung_bao'][1], f
        ys = np.nonzero(m.any(1))[0]; y0, y1 = ys[0], ys[-1]
        band = m.copy(); band[: int(y1 - 0.15 * (y1 - y0))] = False
        t = band & ~hieu_ung(a)
        if t.sum() < 50: t = band
        xs = np.nonzero(t)[1]; cx = a.shape[1] / 2
        lech.append(float(np.median(xs)) - cx)
        anh.append((a, cx, k['chan'][1] - dat))
    L = float(np.median(lech))
    return [(a, cx + L, dy) for a, cx, dy in anh]


def thu(a, z):
    H, W = a.shape[:2]; tw, th = max(1, round(W * z)), max(1, round(H * z))
    al = a[..., 3:4].astype(np.float32) / 255
    pre = np.concatenate([a[..., :3] * al, al * 255], 2).astype(np.float32)
    ch = [np.array(Image.fromarray(pre[..., k]).resize((tw, th), Image.BOX)) for k in range(4)]
    A = ch[3]; ok = A >= 128
    o = np.zeros((th, tw, 4), np.uint8)
    for k in range(3): o[..., k] = np.clip(np.where(A > 0, ch[k] / np.maximum(A, 1e-3) * 255, 0), 0, 255)
    o[..., 3] = ok * 255
    return o


def luu_png(sh):
    op = sh[..., 3] > 0; px = sh[op][:, :3]
    q = Image.fromarray(px.reshape(1, -1, 3)).quantize(colors=SO_MAU, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[:3 * SO_MAU]).reshape(-1, 3); sh[op, :3] = pal[np.array(q).ravel()]; sh[~op] = 0
    mau = sorted(set(map(tuple, sh.reshape(-1, 4).tolist())))
    flat = sh.reshape(-1, 4).astype(np.int64); key = ((flat[:, 0] * 256 + flat[:, 1]) * 256 + flat[:, 2]) * 256 + flat[:, 3]
    kmau = np.array([((c[0] * 256 + c[1]) * 256 + c[2]) * 256 + c[3] for c in mau], np.int64)
    ix = np.searchsorted(kmau, key).astype(np.uint8).reshape(sh.shape[:2])
    pim = Image.fromarray(ix, 'P'); pim.putpalette([v for c in mau for v in c[:3]])
    buf = io.BytesIO(); pim.save(buf, 'PNG', optimize=True, transparency=bytes(c[3] for c in mau))
    assert (np.array(Image.open(io.BytesIO(buf.getvalue())).convert('RGBA')) == sh).all()
    return buf.getvalue(), len(mau) - 1


so_do = {}
for MA, C in CFG.items():
    goc = os.path.join(GOC0, C['thu_muc'])
    K = C['cao_cu'] / float(np.median([k['cao'] for k in json.load(open(os.path.join(goc, '1-dung-cat/bao-cao.json')))['hang'][0]['khung']]))
    he_so = lambda ten: C['LIEN_PHA'][pha_cua(ten)] * C['TRONG_PHA'][ten]
    TRAN = 1.8 * C['cao_cu'] * N   # chiều cao tối đa trên gốc (điểm nét x2)
    so_do[MA] = {'K': round(K, 4), 'he_so': {k: round(he_so(k), 4) for k in C['TRONG_PHA']}, 'tep': {}}
    for pha, ds in HANG.items():
        dn = doc_hang(goc, DANH[pha], C['LAT']); CH = C['CHAM'][pha]; zd = N * K / he_so(DANH[pha])
        hang = {}
        for dt, g, giay, lap in ds:
            z = N * K / he_so(g)
            if dt == 'atk': v = [(thu(a, zd), x * zd, dy * zd) for a, x, dy in dn[CH:]]
            else:
                v = [(thu(a, z), x * z, dy * z) for a, x, dy in doc_hang(goc, g, C['LAT'])]
                if dt == 'tele': v += [(thu(a, zd), x * zd, dy * zd) for a, x, dy in dn[:CH]]
            # cắt phần quá cao
            v2 = []
            for a, x, dy in v:
                cao = a.shape[0] - dy
                if cao > TRAN: a = a[int(round(cao - TRAN)):]
                v2.append((a, x, dy))
            hang[dt] = v2
        trai = max(x for v in hang.values() for a, x, dy in v); phai = max(a.shape[1] - x for v in hang.values() for a, x, dy in v)
        tren = max(a.shape[0] - dy for v in hang.values() for a, x, dy in v); duoi = max(max(0.0, dy) for v in hang.values() for a, x, dy in v)
        GX = int(np.ceil(trai / N)) + 1; FW = GX + int(np.ceil(phai / N)) + 1
        GY = int(np.ceil(tren / N)) + 1; FH = GY + int(np.ceil(duoi / N)) + 1
        cot = max(len(v) for v in hang.values())
        sh = np.zeros((len(ds) * FH * N, cot * FW * N, 4), np.uint8); dong = {}
        for R, (dt, g, giay, lap) in enumerate(ds):
            for Cc, (a, x, dy) in enumerate(hang[dt]):
                X = int(round(GX * N - x)); Y = int(round(GY * N + dy - a.shape[0]))
                o = sh[R * FH * N:(R + 1) * FH * N, Cc * FW * N:(Cc + 1) * FW * N]
                assert X >= 0 and Y >= 0 and X + a.shape[1] <= FW * N and Y + a.shape[0] <= FH * N, ('tràn ô', MA, pha, dt, Cc)
                sub = o[Y:Y + a.shape[0], X:X + a.shape[1]]; sub[:] = np.where(a[..., 3:4] > 0, a, sub)
            dong[dt] = {'hang': R, 'so': len(hang[dt]), 'giay': giay}
            if lap: dong[dt]['lap'] = True
            if dt == 'die': dong[dt]['mo'] = 0.6
        png, nm = luu_png(sh)
        ma = MA if pha == 1 else '%s-p%d' % (MA, pha)
        t = {'loai': 'linh-khi-sprite', 'doi_tuong': 'quai', 'ma': ma, 'ten': C['ten'] if pha == 1 else C['ten_pha'][pha], 'vung': C['vung'],
             'tam': 'data:image/png;base64,' + base64.b64encode(png).decode(), 'net': N, 'khung_rong': FW, 'khung_cao': FH, 'goc': [GX, GY],
             'rong': C['rong'], 'cao': C['cao'], 'dong_tac': dong}
        Image.fromarray(sh).save(os.path.join(RA, ma + '.png'))
        ra = os.path.join(DAY, 'game/art/custom', ma + '.sprite.json') if GHI else os.path.join(RA, ma + '.sprite.json')
        json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        so_do[MA]['tep'][ma] = {'o': [FW, FH], 'goc': [GX, GY], 'tam': list(sh.shape[1::-1]), 'mau': nm, 'byte': os.path.getsize(ra), 'dong_tac': dong}
        print(ma, json.dumps(so_do[MA]['tep'][ma], ensure_ascii=False))
json.dump(so_do, open(os.path.join(RA, 'so-do-trum-nho.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
