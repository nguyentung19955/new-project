"""Ngư Tinh MỚI (mực khổng lồ cầm đôi rìu san hô): khung đã cắt (docs/anh-goc/trum-moi/ngu-tinh/*-cat) -> 3 tệp sprite game.
python3 dung-ngu-tinh.py [--ghi]      (không --ghi: chỉ in số đo, ghi tạm vào thư mục ra/ cạnh tệp này)

Cách làm
- CO CỠ theo đầu + thân: mỗi hàng gốc (1-dung, 2-di, ...) có một hệ số "cỡ đầu" S (so với hàng đứng pha 1 = 1).
  Trong một pha: đo bằng khớp đặc trưng SIFT (RANSAC phép đồng dạng) giữa mọi khung của hàng với mọi khung đứng
  của pha đó, lấy trung vị. Giữa các pha (màu khác hẳn, SIFT không khớp): đo tay khoảng chóp mũ vây -> mắt ở khung đứng
  (pha 1: 117,7 điểm; pha 2: 131,7 / 132 -> 1,12; pha 3: 147 / 140 (khung 6, khung này nhỏ hơn khung 1 x0,966) -> 1,235).
  Cả hàng dùng MỘT hệ số (không co riêng từng khung) để động tác không phập phồng.
- Cỡ game: K điểm game cho mỗi điểm ảnh gốc của hàng đứng pha 1 -> mực pha 1 đứng cao ~111 điểm game như cá cũ (111).
- Đường đất: đáy khung (chân xúc tu) theo trung vị "chan" của hàng trong bao-cao.json; khung nào đáy thấp hơn (nước toé)
  thì giữ phần lệch đó.
- Neo ngang: trong một hàng giữ mép trái đám xúc tu dưới cùng đứng yên (không bị nước / băng bên phải làm lệch);
  cả hàng dời sao cho trung vị giữa đám xúc tu dưới (bỏ điểm nước / băng sáng) nằm ở gốc.
- Nhịp đòn: game gây sát thương ngay đầu hàng atk (chiêu cX: u < 0,4 là tele, sau đó atk; mốc nổ moc[0] = 0,38..0,45).
  Nên hàng tele = 6 khung báo đòn + các khung vung rìu TRƯỚC khung chạm đất; hàng atk bắt đầu đúng khung rìu chạm đất
  (pha 1: khung 3; pha 2: khung 3-4; pha 3: khung 3 và 5).
- Ảnh thật nét x2 (net 2), PNG bảng màu, mỗi pha một bảng màu riêng.
"""
import sys, os, json, glob, io, base64
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from neo import GOC, la_hieu_ung

DAY = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../..'))
GHI = '--ghi' in sys.argv
RA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ra')   # ảnh tấm + so-do.json (tạm, không commit)
os.makedirs(RA, exist_ok=True)

K = 0.35          # điểm game / điểm gốc ở cỡ đầu chuẩn (hàng đứng pha 1)
N = 2             # nét x2
SO_MAU = 128       # màu tối đa mỗi pha (64 làm mất màu nước xanh ở khung chạm đất pha 1)
LIEN_PHA = {1: 1.0, 2: 1.12, 3: 1.235}
# hệ số cỡ đầu trong pha (SIFT, trung vị; xem docstring). Hàng trúng đòn pha 1: SIFT 1,79 (ít cặp khớp) và đo tay 1,70 -> 1,75.
TRONG_PHA = {
    '1-dung': 1.0, '2-di': 1.182, '3-bao-don': 1.41, '4-danh': 1.121, '5-trung-don': 1.75, '6-chet': 1.219,
    'p2-1-dung': 1.0, 'p2-2-bao-don': 1.141, 'p2-3-danh': 0.911, 'p2-4-trung-don': 1.335,
    'p3-1-dung': 1.0, 'p3-2-bao-don': 1.045, 'p3-3-danh': 0.933, 'p3-4-trung-don': 1.254,
}
# khung (đếm từ 0) của hàng đánh gốc mà rìu chạm đất đầu tiên
CHAM = {1: 2, 2: 2, 3: 2}
TEP = {
    1: ('nguTinh', 'Ngư Tinh', [('idle', '1-dung', None, 1.4, True), ('move', '2-di', None, 0.8, True), ('tele', '3-bao-don', 'danh', 0.7, False),
                               ('atk', '4-danh', 'cham', 0.6, False), ('hit', '5-trung-don', None, 0.3, False), ('die', '6-chet', None, 1.2, False)]),
    2: ('nguTinh-p2', 'Ngư Tinh · pha 2 (nổi giận)', [('idle', 'p2-1-dung', None, 1.4, True), ('tele', 'p2-2-bao-don', 'danh', 0.7, False),
                                                      ('atk', 'p2-3-danh', 'cham', 0.6, False), ('hit', 'p2-4-trung-don', None, 0.3, False)]),
    3: ('nguTinh-p3', 'Ngư Tinh · pha 3 (cuồng nộ)', [('idle', 'p3-1-dung', None, 1.4, True), ('tele', 'p3-2-bao-don', 'danh', 0.7, False),
                                                       ('atk', 'p3-3-danh', 'cham', 0.6, False), ('hit', 'p3-4-trung-don', None, 0.3, False)]),
}
DANH = {1: '4-danh', 2: 'p2-3-danh', 3: 'p3-3-danh'}


def pha_cua(ten):
    return 2 if ten.startswith('p2-') else 3 if ten.startswith('p3-') else 1


def doc_hang(ten):
    """các khung của một hàng gốc: [(ảnh RGBA, neo_x (toạ độ khung cắt), lệch đáy so với đất (điểm gốc, + là thấp hơn))]"""
    d = os.path.join(GOC, ten + '-cat')
    bc = json.load(open(os.path.join(d, 'bao-cao.json'), encoding='utf-8'))
    ks = bc['hang'][0]['khung']
    fs = sorted(glob.glob(os.path.join(d, ten, 'khung-*.png')))
    assert len(fs) == len(ks), ten
    pha = pha_cua(ten)
    dat = float(np.median([k['chan'][1] for k in ks]))
    tr, mep = [], []
    anh = []
    for f, k in zip(fs, ks):
        a = np.array(Image.open(f).convert('RGBA'))
        m = a[..., 3] > 128
        ys = np.nonzero(m.any(1))[0]; y0, y1 = ys[0], ys[-1]
        band = m.copy(); band[: int(y1 - 0.18 * (y1 - y0))] = False
        t = band & ~la_hieu_ung(a, pha)
        if t.sum() < 50: t = band
        xs = np.nonzero(t)[1]
        tr.append(float(np.median(xs))); mep.append(float(xs.min()))
        assert a.shape[0] == k['khung_bao'][3] - k['khung_bao'][1], (f, a.shape, k['khung_bao'])
        anh.append((a, k['chan'][1] - dat))
    lech = float(np.median(np.array(tr) - np.array(mep)))   # giữa đám xúc tu so với mép trái, trung vị cả hàng
    return [(a, m0 + lech, dy) for (a, dy), m0 in zip(anh, mep)]


def thu(a, z):
    """thu nhỏ RGBA hệ số z (BOX, nhân alpha trước), alpha >= 128 thành đặc"""
    H, W = a.shape[:2]; tw, th = max(1, round(W * z)), max(1, round(H * z))
    al = a[..., 3:4].astype(np.float32) / 255
    pre = np.concatenate([a[..., :3] * al, al * 255], 2).astype(np.float32)
    ch = [np.array(Image.fromarray(pre[..., k]).resize((tw, th), Image.BOX)) for k in range(4)]
    A = ch[3]; ok = A >= 128
    o = np.zeros((th, tw, 4), np.uint8)
    for k in range(3): o[..., k] = np.clip(np.where(A > 0, ch[k] / np.maximum(A, 1e-3) * 255, 0), 0, 255)
    o[..., 3] = ok * 255
    return o


def he_so(ten):
    return LIEN_PHA[pha_cua(ten)] * TRONG_PHA[ten]


# --- dựng mọi hàng game (đã thu, kèm neo) ---
hang = {}   # (pha, động tác) -> [(ảnh thu, neo_x thu, lệch đáy thu (điểm nét x2))]
for pha, (ma, ten, ds) in TEP.items():
    dn = doc_hang(DANH[pha])
    for dt, goc, ghep, giay, lap in ds:
        z = N * K / he_so(goc)
        khung = doc_hang(goc) if dt != 'atk' else dn[CHAM[pha]:]
        if ghep == 'danh':
            zd = N * K / he_so(DANH[pha])
            them = [(thu(a, zd), x * zd, dy * zd) for a, x, dy in dn[:CHAM[pha]]]
        else:
            them = []
        if dt == 'atk': z = N * K / he_so(DANH[pha])
        hang[(pha, dt)] = [(thu(a, z), x * z, dy * z) for a, x, dy in khung] + them

# --- ô khung chung: đủ chứa mọi khung của cả 3 pha (giữ nguyên ô giữa các pha để chuyển pha không nhảy) ---
trai = max(x for v in hang.values() for a, x, dy in v)
phai = max(a.shape[1] - x for v in hang.values() for a, x, dy in v)
tren = max(a.shape[0] - dy for v in hang.values() for a, x, dy in v)
duoi = max(max(0.0, dy) for v in hang.values() for a, x, dy in v)
GX = int(np.ceil(trai / N)) + 1
FW = GX + int(np.ceil(phai / N)) + 1
GY = int(np.ceil(tren / N)) + 1
FH = GY + int(np.ceil(duoi / N)) + 1
print('o khung', FW, FH, 'goc', GX, GY, ' (trai %.0f phai %.0f tren %.0f duoi %.0f diem net x2)' % (trai, phai, tren, duoi))

so_do = {'o': [FW, FH], 'goc': [GX, GY], 'K': K, 'he_so': {k: round(he_so(k), 4) for k in TRONG_PHA}, 'tep': {}}
for pha, (ma, ten, ds) in TEP.items():
    cot = max(len(hang[(pha, dt)]) for dt, *_ in ds)
    sh = np.zeros((len(ds) * FH * N, cot * FW * N, 4), np.uint8)
    dong = {}
    for R, (dt, goc, ghep, giay, lap) in enumerate(ds):
        v = hang[(pha, dt)]
        for C, (a, x, dy) in enumerate(v):
            X = int(round(GX * N - x)); Y = int(round(GY * N + dy - a.shape[0]))
            o = sh[R * FH * N:(R + 1) * FH * N, C * FW * N:(C + 1) * FW * N]
            y0, x0 = max(0, Y), max(0, X); y1, x1 = min(FH * N, Y + a.shape[0]), min(FW * N, X + a.shape[1])
            assert (y0, x0) == (Y, X) and (y1, x1) == (Y + a.shape[0], X + a.shape[1]), ('tràn ô', ma, dt, C)
            o[y0:y1, x0:x1] = np.where(a[..., 3:4] > 0, a, o[y0:y1, x0:x1])
        dong[dt] = {'hang': R, 'so': len(v), 'giay': giay}
        if lap: dong[dt]['lap'] = True
        if dt == 'die': dong[dt]['mo'] = 0.6
    # lượng tử màu (mỗi pha một bảng)
    op = sh[..., 3] > 0; px = sh[op][:, :3]
    q = Image.fromarray(px.reshape(1, -1, 3)).quantize(colors=SO_MAU, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[:3 * SO_MAU]).reshape(-1, 3); sh[op, :3] = pal[np.array(q).ravel()]
    sh[~op] = 0
    mau = sorted(set(map(tuple, sh.reshape(-1, 4).tolist()))); chi = {c: i for i, c in enumerate(mau)}
    idx = np.vectorize(lambda *c: 0)  # (không dùng)
    flat = sh.reshape(-1, 4).astype(np.int64); key = ((flat[:, 0] * 256 + flat[:, 1]) * 256 + flat[:, 2]) * 256 + flat[:, 3]
    kmau = np.array([((c[0] * 256 + c[1]) * 256 + c[2]) * 256 + c[3] for c in mau], np.int64)
    ix = np.searchsorted(kmau, key).astype(np.uint8).reshape(sh.shape[:2])
    pim = Image.fromarray(ix, 'P'); pim.putpalette([v for c in mau for v in c[:3]])
    buf = io.BytesIO(); pim.save(buf, 'PNG', optimize=True, transparency=bytes(c[3] for c in mau))
    assert (np.array(Image.open(io.BytesIO(buf.getvalue())).convert('RGBA')) == sh).all()
    t = {'loai': 'linh-khi-sprite', 'doi_tuong': 'quai', 'ma': ma, 'ten': ten, 'vung': 'bien',
         'tam': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode(), 'net': N,
         'khung_rong': FW, 'khung_cao': FH, 'goc': [GX, GY], 'rong': 152, 'cao': 105, 'dong_tac': dong}
    Image.fromarray(sh).save(os.path.join(RA, ma + '.png'))
    ra = os.path.join(DAY, 'game/art/custom', ma + '.sprite.json') if GHI else os.path.join(RA, ma + '.sprite.json')
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    so_do['tep'][ma] = {'tam': list(sh.shape[1::-1]), 'mau': len(mau) - 1, 'byte': os.path.getsize(ra), 'dong_tac': dong}
    print(ma, json.dumps(so_do['tep'][ma], ensure_ascii=False))
json.dump(so_do, open(os.path.join(RA, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
