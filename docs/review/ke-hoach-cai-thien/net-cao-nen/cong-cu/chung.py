"""Dùng chung cho các công cụ nét cao — nền: đọc ảnh game, nạp tấm gốc, tách hình theo màu nền."""
import base64, io, json, os, subprocess
import numpy as np
import cv2
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
CUS = os.path.join(REPO, 'game', 'art', 'custom')
RA = os.path.join(HERE, 'ra'); os.makedirs(RA, exist_ok=True)
AG = os.path.join(REPO, 'docs', 'anh-goc')
KH = os.path.join(REPO, 'docs', 'review', 'ke-hoach-cai-thien')
# tên → (đường dẫn | 'git:<commit>:<đường dẫn>', kiểu 'hinh' (nền một màu) / 'van' (hoa văn kín), lưới (cột, hàng) hoặc None)
NGUON = {
    'bien9': (os.path.join(AG, 'nen-phong', 'hang-bien-9-mang.png'), 'hinh', (3, 3)),
    'bienlien': (os.path.join(AG, 'nen-phong', 'hang-bien-san-lien.png'), 'van', None),
    'lau9': (os.path.join(AG, 'nen-phong', 'lau-dai-9-mang.png'), 'hinh', (3, 3)),
    'n1': (os.path.join(AG, 've-tay-8-gop', 'n1-nen-song-san.png'), 'hinh', (2, 2)),
    'n2': (os.path.join(AG, 've-tay-8-gop', 'n2-san-thuong-luong.png'), 'van', None),
    'g8': (os.path.join(AG, 've-tay-8-gop', 'g8-song-tuong-cua.png'), 'hinh', None),
    'g5': (os.path.join(AG, 've-tay-8-gop', 'g5-vat-song.png'), 'hinh', None),
    # ảnh gốc 12/10 đã xoá khỏi cây thư mục (c243dcf6) nhưng còn trong lịch sử git
    'ttlau': ('git:e9de4489:docs/anh-goc/2026-10-12/trang-tri-lau-dai.png', 'hinh', (4, 4)),
    'cotnang6': (os.path.join(KH, 'con-ve-tay-6', 'anh-gen-lai', 'gd-cot-nang-rung.png'), 'hinh', None),
    'cotnang5': (os.path.join(KH, 'con-ve-tay-5', 'anh-gen', 'gd-cot-nang-rung.png'), 'hinh', None),
}


def doc(ma):
    d = json.load(open(os.path.join(CUS, ma + '.sprite.json'), encoding='utf-8'))
    k = 'anh' if 'anh' in d else 'tam'
    a = np.array(Image.open(io.BytesIO(base64.b64decode(d[k].split(',', 1)[1]))).convert('RGBA'))
    a[a[..., 3] < 128] = 0
    a[a[..., 3] >= 128, 3] = 255
    return d, a


def mo_anh(p):
    if p.startswith('git:'):
        _, c, path = p.split(':', 2)
        b = subprocess.run(['git', '-C', REPO, 'show', c + ':' + path], capture_output=True, check=True).stdout
        return Image.open(io.BytesIO(b))
    return Image.open(p)


def mau_nen(rgb):
    """màu nền = màu nhiều nhất trong ảnh (hồng #ff00ff / lục #00ff00 …; viền ảnh có khi là vạch tối nên không lấy viền)"""
    v = rgb[::3, ::3].reshape(-1, 3).astype(int)
    q = (v // 16)
    k, n = np.unique(q[:, 0] * 256 + q[:, 1] * 16 + q[:, 2], return_counts=True)
    m = k[n.argmax()]
    sel = (q[:, 0] * 256 + q[:, 1] * 16 + q[:, 2]) == m
    return v[sel].mean(0)


def nap_nguon(ten):
    p, kieu, _ = NGUON[ten]
    im = mo_anh(p).convert('RGBA')
    a = np.array(im)
    if kieu == 'van':
        a[..., 3] = 255
        return a, kieu
    if (a[..., 3] < 128).mean() > 0.05:  # ảnh đã có nền trong suốt
        return a, kieu
    nen = mau_nen(a[..., :3])
    d = np.sqrt(((a[..., :3].astype(float) - nen) ** 2).sum(-1))
    # nền hồng / lục thuần: điểm "gần" màu nền (kể cả viền pha) coi là nền; điểm còn ánh hồng/lục rõ nhưng sẫm vẫn giữ
    a[..., 3] = np.where(d > 110, 255, 0).astype(np.uint8)
    return a, kieu


def tach_hinh(a, ten):
    """các hình trong tấm: [(bb x0,y0,x1,y1, ảnh RGBA cắt sát)]"""
    _, _, luoi = NGUON[ten]
    m = (a[..., 3] > 0).astype(np.uint8)
    # bỏ vạch kẻ lưới / khung ô (đường thẳng dài ≥ 1/4 ô)
    H0, W0 = m.shape
    lx = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((1, max(41, W0 // 8)), np.uint8))
    ly = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((max(41, H0 // 8), 1), np.uint8))
    vach = ((lx | ly) > 0)
    # chỉ là vạch nếu mảnh (≤ 6 điểm) — mép trên phẳng của mảng sàn không bị bỏ
    day = cv2.morphologyEx(vach.astype(np.uint8), cv2.MORPH_OPEN, np.ones((7, 7), np.uint8)) > 0
    m[vach & ~day] = 0
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    H, W = m.shape
    giu = np.zeros(n, bool)
    for i in range(1, n):
        x, y, w, h, s = st[i]
        if s < 60:
            continue
        if (w <= 8 and h > 0.5 * H / (luoi[1] if luoi else 1)) or (h <= 8 and w > 0.5 * W / (luoi[0] if luoi else 1)):
            continue  # vạch kẻ lưới
        giu[i] = True
    m2 = giu[lab].astype(np.uint8)
    nhom = []
    if luoi:
        cw, ch = W / luoi[0], H / luoi[1]
        for j in range(luoi[1]):
            for i in range(luoi[0]):
                o = np.zeros_like(m2)
                y0, y1, x0, x1 = int(j * ch), int((j + 1) * ch), int(i * cw), int((i + 1) * cw)
                o[y0:y1, x0:x1] = m2[y0:y1, x0:x1]
                if o.sum() > 200:
                    nhom.append(o)
    else:
        k = cv2.dilate(m2, np.ones((11, 11), np.uint8))
        n2, lab2 = cv2.connectedComponents(k, 8)
        for i in range(1, n2):
            o = (lab2 == i).astype(np.uint8) & m2
            if o.sum() > 200:
                nhom.append(o)
    ra = []
    for o in nhom:
        ys, xs = np.nonzero(o)
        bb = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
        c = a[bb[1]:bb[3], bb[0]:bb[2]].copy()
        c[o[bb[1]:bb[3], bb[0]:bb[2]] == 0] = 0
        ra.append((bb, c))
    return ra
