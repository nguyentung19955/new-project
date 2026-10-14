"""Ba bạn nhỏ mới (phong cách Zed): khung đã cắt docs/anh-goc/npc-moi/em-<mã>-{1-dung,2-ngoi}-cat -> game/art/custom/em-be-<key>.sprite.json
python3 dung-ban-nho.py [--ghi]
- 2 hàng x 6: hàng 0 ĐỨNG (idle, 1,2 s lặp), hàng 1 NGỒI (ngoi, 1,2 s lặp). Các động tác cũ (move/tele/atk/hit/die/ne) trỏ về hàng đứng
  để code cũ không vỡ. Ảnh nhìn sang PHẢI như cũ (không ghi "huong").
- Cỡ: chiều cao đứng (trung vị khung hàng đứng, gồm tóc) = 31 điểm game = Zed mới (bạn cùng tuổi).
- Hàng ngồi co theo tỉ lệ SIFT so với hàng đứng (đo bằng hàm của sift_ti_le.py, ghi ở SIFT).
- Neo: đáy chân / mông = đường đất (trung vị 'chan' của hàng). Ngang: hàng đứng = trung vị dải chân 15% dưới cùng;
  hàng ngồi = trung vị cột của phần thân trên 55% (đầu + mình), vì dải đáy lẫn cung / giỏ / chân duỗi.
- Bảng 96 màu (như NPC), net 2."""
import sys, os, json, glob, io, base64
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
DAY = os.path.abspath(os.path.join(HERE, '../../../../..'))
GOC = os.path.join(DAY, 'docs/anh-goc/npc-moi')
GHI = '--ghi' in sys.argv
RA = os.path.join(HERE, 'ra'); os.makedirs(RA, exist_ok=True)
N = 2; SO_MAU = 96; CAO = 31
BAN = {'hunter': ('cu-teo', 'Cu Tèo'), 'healer': ('cai-bong', 'Cái Bống'), 'wrestler': ('cu-li', 'Cu Lì')}
SIFT = {'hunter': 0.888, 'healer': 1.096, 'wrestler': 0.953}  # tỉ lệ hàng ngồi / hàng đứng (trung vị 36 cặp khung)

# dùng lại thu() và luu_png() của dung-npc.py (không chạy phần dựng NPC)
src = open(os.path.join(HERE, 'dung-npc.py'), encoding='utf-8').read().split('\nso_do = {}')[0]
ns = {'__file__': os.path.join(HERE, 'dung-npc.py')}; exec(compile(src, 'dung-npc.py', 'exec'), ns)
thu, luu_png = ns['thu'], ns['luu_png']

def doc_hang(ma, h, ngoi):
    d = os.path.join(GOC, 'em-%s-%s-cat' % (ma, h))
    ks = json.load(open(os.path.join(d, 'bao-cao.json'), encoding='utf-8'))['hang'][0]['khung']
    fs = sorted(glob.glob(os.path.join(d, '*', 'khung-*.png'))); assert len(fs) == len(ks) == 6, (ma, h)
    dat = float(np.median([k['chan'][1] for k in ks])); out = []; lech = []
    for f, k in zip(fs, ks):
        a = np.array(Image.open(f).convert('RGBA')); m = a[..., 3] > 128
        ys = np.nonzero(m.any(1))[0]; y0, y1 = ys[0], ys[-1]
        band = m.copy()
        if ngoi: band[int(y0 + 0.55 * (y1 - y0)):] = False
        else: band[: int(y1 - 0.15 * (y1 - y0))] = False
        xs = np.nonzero(band)[1]; cx = a.shape[1] / 2; lech.append(float(np.median(xs)) - cx)
        # đáy khung cắt = 'chan' của khung (khung_bao y1); dy > 0: khung này thấp hơn đường đất chung
        out.append((a, cx, k['chan'][1] - dat))
    L = float(np.median(lech))
    return [(a, cx + L, dy) for a, cx, dy in out]

so_do = {}
for key, (ma, ten) in BAN.items():
    dung = doc_hang(ma, '1-dung', False); ngoi = doc_hang(ma, '2-ngoi', True)
    hc = float(np.median([a.shape[0] - dy for a, x, dy in dung]))
    z1 = N * CAO / hc; z2 = z1 / SIFT[key]
    hang = [[(thu(a, z1), x * z1, dy * z1) for a, x, dy in dung], [(thu(a, z2), x * z2, dy * z2) for a, x, dy in ngoi]]
    trai = max(x for v in hang for a, x, dy in v); phai = max(a.shape[1] - x for v in hang for a, x, dy in v)
    tren = max(a.shape[0] - dy for v in hang for a, x, dy in v); duoi = max(max(0.0, dy) for v in hang for a, x, dy in v)
    GX = int(np.ceil(trai / N)) + 1; FW = GX + int(np.ceil(phai / N)) + 1
    GY = int(np.ceil(tren / N)) + 1; FH = GY + int(np.ceil(duoi / N)) + 1
    sh = np.zeros((2 * FH * N, 6 * FW * N, 4), np.uint8)
    for R, v in enumerate(hang):
        for C, (a, x, dy) in enumerate(v):
            X = int(round(GX * N - x)); Y = int(round(GY * N + dy - a.shape[0]))
            o = sh[R * FH * N:(R + 1) * FH * N, C * FW * N:(C + 1) * FW * N]
            assert X >= 0 and Y >= 0 and X + a.shape[1] <= FW * N and Y + a.shape[0] <= FH * N
            sub = o[Y:Y + a.shape[0], X:X + a.shape[1]]; sub[:] = np.where(a[..., 3:4] > 0, a, sub)
    png, sh = luu_png(sh, SO_MAU)
    def bao(R):  # khung đầu của hàng R: (cao, rộng) điểm game
        m = sh[R * FH * N:(R + 1) * FH * N, :FW * N, 3] > 127; ys = np.nonzero(m.any(1))[0]; xs = np.nonzero(m.any(0))[0]
        return int(round((GY * N - ys[0]) / N)), int(round((xs[-1] - xs[0] + 1) / N))
    cao, rong = bao(0); cao_ngoi, rong_ngoi = bao(1)
    H0 = {'hang': 0, 'so': 6}
    t = {'loai': 'linh-khi-sprite', 'doi_tuong': 'em-be', 'ma': 'em-be-' + key, 'ten': ten, 'phien_ban': 2,
         'ghi_chu': 'Phong cách Zed (14/10): hàng 0 đứng, hàng 1 ngồi (sân đình). Các bạn không còn đánh nhau: move/tele/atk/hit/die/ne trỏ về hàng đứng.',
         'tam': 'data:image/png;base64,' + base64.b64encode(png).decode(), 'net': N, 'khung_rong': FW, 'khung_cao': FH, 'goc': [GX, GY],
         'rong': rong, 'cao': cao, 'cao_ngoi': cao_ngoi,
         'dong_tac': {'idle': dict(H0, giay=1.2, lap=True), 'ngoi': {'hang': 1, 'so': 6, 'giay': 1.2, 'lap': True},
                      'move': dict(H0, giay=1.2, lap=True), 'tele': dict(H0, giay=0.4), 'atk': dict(H0, giay=0.4),
                      'hit': dict(H0, giay=0.2), 'die': dict(H0, giay=0.6), 'ne': dict(H0, giay=0.4)},
         'khoac_do': False, 'nhun_buoc': False}
    Image.fromarray(sh).save(os.path.join(RA, 'em-be-%s.png' % key))
    ra = os.path.join(DAY, 'game/art/custom', 'em-be-%s.sprite.json' % key) if GHI else os.path.join(RA, 'em-be-%s.sprite.json' % key)
    json.dump(t, open(ra, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    so_do[key] = {'o': [FW, FH], 'goc': [GX, GY], 'rong': rong, 'cao': cao, 'cao_ngoi': cao_ngoi, 'rong_ngoi': rong_ngoi, 'png': len(png), 'byte': os.path.getsize(ra)}
    print(key, so_do[key])
json.dump(so_do, open(os.path.join(RA, 'so-do-ban-nho.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
