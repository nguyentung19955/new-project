"""Quy đổi ảnh nguồn cao → ô 96 của game cho các hàng zed-moi (CHỈ ĐỌC, không sửa gì ngoài rig/dong-tac/).
Lặp lại đúng phép co/dời của docs/anh-goc/zed/dung-zed-game.py (hàm dung_than): sk = s × r_hang, dx/dy theo chân (hoặc tâm đầu
với hàng NEO_DAU), dời vào ô nếu tràn. Kiểm: ảnh dựng lại == hàng tương ứng trong game/art/custom/zed-moi.sprite.json.
"""
import base64, importlib.util, io, json, math, os
import numpy as np
from PIL import Image

DAY = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(DAY, '..', '..', '..', '..'))
GAME = os.path.join(REPO, 'game', 'art', 'custom', 'zed-moi.sprite.json')
O = 96
# tên thư mục ra → (khoá dong_tac game, khoá hàng thân thực vẽ, thư mục nguồn)
DONG = {
    'chay_thuong': ('chay_thuong', 'chay2tay', '03-chay-2tay'),
    'lon': ('lon', 'lon', '04-lon'),
    'trung': ('trung', 'trung', '05-trung-don'),
    'phitieu': ('phitieu', 'phitieu', '20-phi-tieu'),
    'chet': ('chet', 'chet', '06-chet-b2'),
}

_Z = None
def Z():
    global _Z
    if _Z is None:
        p = os.path.join(REPO, 'docs', 'anh-goc', 'zed', 'dung-zed-game.py')
        sp = importlib.util.spec_from_file_location('dung_zed_game', p)
        _Z = importlib.util.module_from_spec(sp); sp.loader.exec_module(_Z)
    return _Z


def tam_game():
    d = json.load(open(GAME, encoding='utf-8'))
    im = Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',')[1]))).convert('RGBA')
    return d, np.array(im)


def dat(thu):
    """[(ảnh nguồn PIL, sx, sy, dx, dy, ô96 dựng lại)] cho từng khung của hàng thu."""
    z = Z()
    dung = z.doc_dong('01-dung')
    H_dung = float(np.median([f['bb'][3] - f['bb'][1] for f in dung]))
    s = z.CAO_96 / H_dung
    d0 = z.co_dau_hang(dung)
    fr = z.doc_dong(thu)
    d1 = z.co_dau_hang(fr)
    r = math.sqrt(d0[0] / d1[0] * d0[1] / d1[1])
    sk = s * r
    k = [a for a, b, *_ in z.DONG if b == thu][0]
    ra = []
    for f in fr:
        im = f['im']
        nw, nh = max(1, round(im.width * sk)), max(1, round(im.height * sk))
        sx, sy = nw / im.width, nh / im.height
        dx = round(z.DAU_X - f['dau_x'] * sx) if k in z.NEO_DAU else round(z.CHAN[0] - f['chan'][0] * sx)
        dy = round(z.CHAN[1] - f['chan'][1] * sy)
        nho = im.resize((nw, nh), Image.BOX)
        bb = nho.getbbox()
        if bb and not (bb[2] - bb[0] > O or bb[3] - bb[1] > O):
            dx += max(0, -(dx + bb[0])) - max(0, dx + bb[2] - O)
            dy += max(0, -(dy + bb[1])) - max(0, dy + bb[3] - O)
        o = Image.new('RGBA', (O, O), (0, 0, 0, 0)); o.paste(nho, (dx, dy), nho)
        ra.append(dict(im=im, sx=sx, sy=sy, dx=dx, dy=dy, o=np.array(o)))
    return ra


def doi(f, p):
    """điểm ảnh nguồn → ô 96 (cùng công thức tach_lop.doi_diem: tâm điểm ảnh)."""
    return [round(f['dx'] + (p[0] + 0.5) * f['sx'] - 0.5, 1), round(f['dy'] + (p[1] + 0.5) * f['sy'] - 0.5, 1)]
