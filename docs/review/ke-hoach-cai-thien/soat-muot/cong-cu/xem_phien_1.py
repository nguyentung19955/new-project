"""Phiên 1 "Quái động mượt": băng hình TRƯỚC / SAU dựng từ khung ảnh mà CODE GAME THẬT chọn (không mở trình duyệt).

Chạy game trong Node (game/tests/node_trang.js, DOM / canvas giả), nạp phien1_ghi.js, rồi mỗi cảnh chạy hai lần cùng hạt ngẫu nhiên:
  TRƯỚC = 7 cờ của phiên 1 tắt (?dondu=0&choangcu=1&didung=0&baodeu=0&xihoi=0&buoctoc=0&trungdu=0)
  SAU   = mặc định (cờ bật)
Mỗi lượt tính (60/giây) ghi hàng + cột ảnh đã vẽ (kể cả lớp viền chớp), rồi dán đúng khung đó từ tệp .sprite.json.
Mục 11A (2 khung trắng của trùm pha 2) không cần cảnh: dải khung hàng trúng đòn trước / sau bảng vá KHUNG_TRANG.

    python3 xem_phien_1.py ..     → ../xem-phien-1.gif (+ ../xem-phien-1.json: số đếm từng cảnh cho báo cáo)
"""
import json, os, subprocess, sys
import numpy as np
from PIL import Image
from phan_tich import nap, cat, ROOT
from gifs import ghep, vien
from ve import frames_to_gif, chu

OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.join(ROOT, '..', '..')
NEN = (34, 36, 44, 255)


class Game:
    def __init__(self):
        self.p = subprocess.Popen(['node', os.path.join(GAME, 'tests', 'node_trang.js')], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, cwd=GAME)

    def ev(self, code, arg=None):
        self.p.stdin.write(json.dumps({'code': code, 'arg': arg}) + '\n'); self.p.stdin.flush()
        r = json.loads(self.p.stdout.readline())
        if not r.get('ok'): raise RuntimeError(r.get('loi'))
        return r['v']


class Anh:
    def __init__(self):
        self.c = {}

    def k(self, ma, ten, cot):
        if ma not in self.c:
            d, im = nap(ma)
            self.c[ma] = (d, {t: [Image.fromarray(x, 'RGBA') for x in cat(d, im, v['hang'], v['so'])] for t, v in d['dong_tac'].items()})
        d, f = self.c[ma]
        return d, f[ten][min(cot, len(f[ten]) - 1)]


A = Anh()


def ve_luot(r, W=168, H=140, chan=124):
    """Một lượt ghi → ảnh khung (cỡ gấp đôi điểm ảnh game, đúng như ảnh gốc 'net' 2)."""
    o = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    b = r.get('b')
    if not b: return o, '—'
    ma, ten, cot, dx, dy, al = b
    d, fr = A.k(ma, ten, cot)
    n = d.get('net', 1)
    chop = max([a for c, a in r['ov'] if c == '#fff6e0'] + [0]) / 0.85
    trang = max([a for c, a in r['ov'] if c == '#ffffff'] + [0])
    f = vien(fr, min(1, chop)) if chop > 0.01 else fr.copy()
    if trang > 0.01:
        a = np.asarray(f).astype(float); a[..., :3] = a[..., :3] + (255 - a[..., :3]) * trang
        f = Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')
    if r['mat'] < 0 and not False: f = f.transpose(Image.FLIP_LEFT_RIGHT)
    if al < 0.99:
        a = np.asarray(f).copy(); a[..., 3] = (a[..., 3] * al).astype(np.uint8); f = Image.fromarray(a, 'RGBA')
    # dx, dy: điểm ảnh game từ chân tới góc khung (lật thì đối xứng)
    gx = dx if r['mat'] >= 0 else -(dx + d['khung_rong'])
    o.alpha_composite(f, (int(W / 2 + gx * n), int(chan + dy * n)))
    nhan = f'{ten} k{cot + 1}' + (' CHỚP' if chop > 0.05 or trang > 0.05 else '')
    return o, nhan


def canh(g, ten, o, ghi_chu, so=None):
    cu = g.ev('(a) => __P1.chay(a)', dict(o, moi=False))
    moi = g.ev('(a) => __P1.chay(a)', dict(o, moi=True))
    n = min(len(cu), len(moi))
    hinh = []
    for k in range(0, n, 2):  # 60 lượt/giây → 30 khung/giây GIF (33 ms), giữ nhịp thật (khung ngắn nhất của game ~2 lượt vẫn thấy)
        a, na = ve_luot(cu[k]); b, nb = ve_luot(moi[k])
        hinh.append(ghep([a, b], [f'HIỆN TẠI (trước): {na}', f'SAU PHIÊN 1: {nb}'], f'{ten} — {ghi_chu}', 1))
    if os.environ.get('IN'): print('  CU ', chuoi(cu)); print('  MOI', chuoi(moi))
    return hinh, dem(cu), dem(moi)


def chuoi(ghi):
    """Dòng chữ gọn: mỗi lượt tính một ô <hàng 2 chữ><cột>[* = có viền chớp][b/r = đang báo / đang ra đòn]."""
    out = []
    for x in ghi:
        b = x.get('b')
        out.append(f"{b[1][:2]}{b[2]}{'*' if any(c == '#fff6e0' for c, a in x['ov']) else ''}{x['act'][:1]}" if b else '-')
    return ' '.join(out)


def dem(ghi):
    """Số đếm cho báo cáo: số lần về khung 1 của đứng/đi, số lượt chớp, khung cuối hàng đánh có hiện không..."""
    so = dict(luot=len(ghi), doi_hang=0, chop=0, cot_atk=set(), cot_tele=[], cot_hit=set())
    trc = None
    for r in ghi:
        b = r.get('b')
        if not b: continue
        key = b[1]
        if trc and key != trc: so['doi_hang'] += 1
        trc = key
        if any(c == '#fff6e0' and a > 0.05 for c, a in r['ov']): so['chop'] += 1
        if key == 'atk': so['cot_atk'].add(b[2])
        if key == 'tele': so['cot_tele'].append(b[2])
        if key == 'hit': so['cot_hit'].add(b[2])
    # số lần đổi khung trong lúc báo đòn / số giây báo → khung/giây thật
    doi = sum(1 for i in range(1, len(so['cot_tele'])) if so['cot_tele'][i] != so['cot_tele'][i - 1])
    so['tele_doi_khung'] = doi; so['tele_luot'] = len(so['cot_tele'])
    so['cot_atk'] = sorted(so['cot_atk']); so['cot_hit'] = sorted(so['cot_hit']); del so['cot_tele']
    return so


def dai_khung_trang():
    """Mục 11A: hàng trúng đòn của hoLua-p2, namChua-p2: TRƯỚC (cột trắng) / SAU (cột kề + phủ trắng nhẹ 25%, như js/sprite_custom.js veKhung)."""
    hinh = []
    for ma, thay in (('hoLua-p2', {1: 0}), ('namChua-p2', {2: 1})):
        d, im = nap(ma); a = d['dong_tac']['hit']
        fs = [Image.fromarray(x, 'RGBA') for x in cat(d, im, a['hang'], a['so'])]
        for i in range(a['so']):
            A_ = fs[i]
            j = thay.get(i, i); B_ = fs[j].copy()
            if j != i:
                arr = np.asarray(B_).astype(float); arr[..., :3] = arr[..., :3] + (255 - arr[..., :3]) * 0.25; B_ = Image.fromarray(arr.clip(0, 255).astype(np.uint8), 'RGBA')
            W, H = A_.size
            for _ in range(8):  # mỗi khung ~0,27 s cho dễ nhìn
                hinh.append(ghep([A_, B_], [f'HIỆN TẠI (trước): hit k{i + 1}', f'SAU PHIÊN 1: hit k{j + 1}' + (' (vá)' if j != i else '')],
                                 f'Mục 11A — {ma}: khung trúng đòn trắng toàn thân → vẽ khung kề + phủ trắng nhẹ (cờ ?khungtrang=1)', 0.5))
    return hinh


def luu_gif(hinh, path, ms):
    """Một bảng màu chung (ảnh pixel ít màu) + nén khung trùng: tệp nhỏ để để trong repo."""
    W, H = hinh[0].size
    mau = Image.new('RGB', (W, H * min(len(hinh), 40)))
    for i, h in enumerate(hinh[::max(1, len(hinh) // 40)][:40]): mau.paste(h.convert('RGB'), (0, i * H))
    pal = mau.quantize(colors=96, method=Image.MEDIANCUT, dither=Image.NONE)
    q = [h.convert('RGB').quantize(palette=pal, dither=Image.NONE) for h in hinh]
    q[0].save(path, save_all=True, append_images=q[1:], duration=ms, loop=0, optimize=True)


def lam_cung_co(hinh):
    """Mọi khung GIF cùng một cỡ (lấy cỡ lớn nhất, nền tối)."""
    W = max(h.width for h in hinh); H = max(h.height for h in hinh)
    out = []
    for h in hinh:
        if h.size == (W, H): out.append(h); continue
        c = Image.new('RGBA', (W, H), (20, 20, 24, 255)); c.paste(h, (0, 0)); out.append(c)
    return out


CANH = [
    # thời gian trong 'su' tính từ lúc tạo quái; ~1,1 giây đầu (quái trồi lên) không ghi
    ('Mục 2 + 4 · cua (Cua Kìm) đánh rồi nhích lại', dict(ma='cua', role='rusher', r=1, cach=50, giay=3.7),
     'trước: hàng đánh cắt ở 75% rồi đứng 1 lượt → đi → đứng (mỗi lần về khung 1); nay đủ khung + giữ khung cuối 60 ms, vùng đệm đi↔đứng 0,13 s (?dondu=0, ?didung=0)'),
    ('Mục 2 · heoNanh (tinh anh) đánh', dict(ma='heoNanh', role='elite', r=0, cach=40, giay=3.4),
     'đòn nặng giữ khung: trước chỉ tới khung 3/6, nay tới khung cuối (?dondu=0)'),
    ('Mục 19 · heoCon trúng đòn', dict(ma='heoCon', role='rusher', r=0, cach=160, giay=2.6, su=[{'k': 'khoaCd'}, {'k': 'trung', 'luc': 1.4}, {'k': 'trung', 'luc': 2.0}]),
     'hàng trúng đòn 4 khung trải đủ 0,3 s: khung 4 không còn chỉ ~2 lượt tính (?trungdu=0)'),
    ('Mục 3 · heoCon bị choáng', dict(ma='heoCon', role='rusher', r=0, cach=160, giay=3.2, su=[{'k': 'khoaCd'}, {'k': 'choang', 'luc': 1.3, 'giay': 1.6}]),
     'trước: viền trắng chớp liên tục như đang ăn đòn; nay lảo đảo, không chớp (?choangcu=1)'),
    ('Mục 18 · heoCon đi chậm vì băng', dict(ma='heoCon', role='rusher', r=0, cach=190, giay=2.8, su=[{'k': 'khoaCd'}, {'k': 'cham', 'tu': 0.0, 'den': 9, 'n': 3}]),
     'băng làm chậm ×0,55 mà chân vẫn bước nhịp gốc (trượt); nay bước theo tốc độ thật (?buoctoc=0)'),
    ('Mục 18 · hoaBaoTu lùi xa', dict(ma='hoaBaoTu', role='archer', r=0, cach=30, giay=2.8, su=[{'k': 'khoaCd'}]),
     'lùi ra xa (mặt vẫn quay về em bé) mà chân bước tới; nay hàng đi phát ngược (?buoctoc=0)'),
    ('Mục 6A + 10A · caNoc báo đòn 1 s rồi nổ gai', dict(ma='caNoc', role='kami', r=1, cach=40, giay=3.2),
     'báo đòn trước ~6 khung/giây; nay ~12 khung/giây + đưa đi đưa lại 3 khung cuối; vào đánh xì hơi 0,1 s (?baodeu=0, ?xihoi=0)'),
    ('Mục 6A + 10A · nhimDoc cuộn rồi lăn', dict(ma='nhimDoc', role='spiky', r=0, cach=60, giay=5.6),
     'báo 2,2 s: trước 6 khung trải đều; cuộn tròn → bung: thêm khung nối (?baodeu=0, ?xihoi=0)'),
    ('Mục 10A · nhim xoay bắn gai xong về đứng', dict(ma='nhim', role='spiky', r=1, cach=60, giay=5.6),
     'xong đòn: thu gai 0,15 s (hàng báo đòn phát ngược) thay vì bật về đứng (?xihoi=0)'),
]

if __name__ == '__main__':
    g = Game()
    nguon = ''.join(d for d in open(os.path.join(HERE, 'phien1_ghi.js')) if not d.lstrip().startswith('//'))
    g.ev('(window.__P1 = ' + nguon.strip().rstrip(';') + ', 1)')
    can = sorted({o['ma'] for _, o, _ in CANH})
    teps = [json.load(open(f'{ROOT}/{m}.sprite.json')) for m in can]
    print('nạp:', g.ev('(a) => __P1.nap(a)', teps))
    tat_ca = []; so = {}
    chi = sys.argv[2].split(',') if len(sys.argv) > 2 else None
    for i, (ten, o, gc) in enumerate(CANH):
        if chi and str(i) not in chi: continue
        h, a, b = canh(g, ten, o, gc)
        so[ten] = {'truoc': a, 'sau': b}
        print(ten, '\n  TRƯỚC', a, '\n  SAU  ', b)
        tat_ca += h
        tat_ca += [h[-1]] * 10  # nghỉ 0,33 s giữa các cảnh
    if not chi: tat_ca += dai_khung_trang()
    json.dump(so, open(os.path.join(OUT, 'xem-phien-1.json'), 'w'), ensure_ascii=False, indent=1)
    luu_gif(lam_cung_co(tat_ca), os.path.join(OUT, 'xem-phien-1.gif'), 33)
    print('xong', len(tat_ca), 'khung')
