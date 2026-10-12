"""Tạo lại ghep-healer.sprite.json cho thân MỚI của Cái Bống (12/10), theo đúng cách Đợt 5 (dot-5/kiem/taoghep5.py):
- diem (khung đứng đầu) = chỗ game tự ước lượng khi chưa có tệp ghép (SC.diemNhanVat); dinh_dau theo khung = gốc + độ dời đầu game tự đo (SC.khopEmBe);
- eo theo khung = gốc + độ dời mép trên quần xanh lam (thân mới có quần màu riêng nên đo thẳng, như quan5.py đo Cu Tí);
- lung, goc_canh = gốc + 60% dời đầu + 40% dời eo; tay_truoc đo trên hình (như tay5.py), hàng lấy đà lấy bàn tay kéo ra sau (đo mép sau).
- cap (vũ khí bám tay_truoc) giữ như cũ, thêm khung chạy 6, 7 không cần (chạy không bám).
Chạy từ gốc repo, cần game/dist/linh-khi.html đã build:  python3 docs/review/ke-hoach-cai-thien/cai-bong/taoghep.py"""
import json, re, io, base64, subprocess, time, colorsys
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright
REPO = '/home/claude/new-project'; P_GHEP = REPO + '/game/art/custom/ghep-healer.sprite.json'
t = json.load(open(REPO + '/game/art/custom/em-be-healer.sprite.json'))
im = np.asarray(Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',', 1)[1]))).convert('RGBA'))
HANG = [(k, t['dong_tac'][k]['so']) for k in ('idle', 'move', 'tele', 'atk', 'hit')]
def khung(ten, i):
    h = t['dong_tac'][ten]['hang']; return im[h * 96 + 1:(h + 1) * 96:2, i * 96 + 1:(i + 1) * 96:2]
r5 = lambda v: round(v * 2) / 2
num = lambda v: int(v) if v == int(v) else v
P = lambda x, y: [num(r5(x)), num(r5(y))]
# 1. số game tự đo (bỏ tệp ghép trong trang)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8793'], cwd=REPO, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.goto('http://localhost:8793/game/dist/linh-khi.html?cloud=0')
        pg.wait_for_function("window.G && G.spriteCustom && (()=>{const s=G.spriteCustom.get('em-be-healer');return s&&s.img&&s.dt.move.so===8})()", timeout=120000)
        G = pg.evaluate("""() => { const SC = G.spriteCustom; SC.remove('ghep-healer'); const sp = SC.cuaEmBe('healer', { key: 'healer' }), r = { diem0: SC.diemNhanVat('healer', 'idle', 0).diem, khop: {} };
          for (const ten of ['idle','move','tele','atk','hit']) for (let i = 0; i < sp.dt[ten].so; i++) r.khop[ten + ':' + i] = SC.khopEmBe(sp, ten, i); return r; }""")
        b.close()
finally: srv.kill()
d0 = G['diem0']
# 2. eo: mép trên quần xanh lam (bỏ vùng đầu)
def la_quan(r, g, b):
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255); return 0.55 < h < 0.72 and s > 0.35 and 0.2 < v < 0.9
def eo(ten, i):
    F = khung(ten, i); pts = [(x, y) for y in range(48) for x in range(48) if F[y, x, 3] > 127 and y - 45 > -13 and la_quan(*[int(q) for q in F[y, x, :3]])]
    ys = sorted(q[1] for q in pts); y0 = ys[len(ys) // 20]; xs = [q[0] for q in pts if q[1] <= y0 + 1.5]
    return (sum(xs) / len(xs) - 24, y0 - 45)
E0 = eo('idle', 0)
# 3. bàn tay trước: điểm xa nhất về phía trước trong dải cánh tay; lấy đà: xa nhất về phía sau
DAI = {'idle': (-13, -6), 'move': (-14, -8), 'tele': (-13, -8), 'atk': (-16, -9), 'hit': (-17, -11)}
def tay(ten, i):
    y0, y1 = DAI[ten]; M = khung(ten, i)[..., 3] > 127; B = M[45 + y0:45 + y1 + 1]; ys, xs = np.nonzero(B)
    if ten == 'tele':
        xm = xs.min(); col = ys[xs <= xm + 1]; return [float(xm + 1.5 - 24), float(round((col.min() + col.max()) / 2 * 2) / 2 + y0)]
    xm = xs.max(); col = ys[xs >= xm - 1]; return [float(xm - 1.5 - 24), float(round((col.min() + col.max()) / 2 * 2) / 2 + y0)]
cu = json.load(open(P_GHEP))
diem = {n: P(*d0[n]) for n in ('lung', 'goc_canh', 'eo', 'dinh_dau')}; diem['tay_truoc'] = P(*tay('idle', 0))
theo = {}
for ten, n in HANG:
    if ten == 'idle': continue
    for i in range(n):
        k = '%s:%d' % (ten, i); kf = k.replace('move', 'run'); dau = (G['khop'][k] or {'dau': [0, 0]})['dau']
        e = eo(ten, i); w = (e[0] - E0[0], e[1] - E0[1]); tr = (0.6 * dau[0] + 0.4 * w[0], 0.6 * dau[1] + 0.4 * w[1])
        theo[kf] = {'lung': P(d0['lung'][0] + tr[0], d0['lung'][1] + tr[1]), 'goc_canh': P(d0['goc_canh'][0] + tr[0], d0['goc_canh'][1] + tr[1]),
                    'eo': P(d0['eo'][0] + w[0], d0['eo'][1] + w[1]), 'dinh_dau': P(d0['dinh_dau'][0] + dau[0], d0['dinh_dau'][1] + dau[1]), 'tay_truoc': P(*tay(ten, i))}
g = dict(cu); g['diem'] = diem; g['diem_theo'] = theo
for v in g['cap'].values():  # trúng đòn nay 3 khung
    v['theo'].pop('hit:3', None)
s = json.dumps(g, ensure_ascii=False, indent=1)
s = re.sub(r'\[\s+(-?[\d.]+),\s+(-?[\d.]+)\s+\]', r'[\1, \2]', s)
s = re.sub(r'\{\s+"bam": "tay_truoc"\s+\}', '{ "bam": "tay_truoc" }', s)
s = re.sub(r'\{\s+"bam": "tay_truoc",\s+([^{}]*?)\s+\}', lambda m: '{ "bam": "tay_truoc", ' + re.sub(r'\s+', ' ', m.group(1)) + ' }', s)
open(P_GHEP, 'w', encoding='utf-8').write(s + '\n')
print('diem', diem); [print(k, v) for k, v in theo.items()]
