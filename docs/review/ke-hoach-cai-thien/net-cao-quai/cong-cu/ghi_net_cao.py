"""GHI ảnh nét cao (ra/<mã>-net3.png, -net4.png của dung_net_cao.py) vào game/art/custom/<mã>.sprite.json.
Để đỡ RAM điện thoại (tấm trùm nét 4 nguyên lưới tới 30 triệu điểm = 120 MB khi giải mã), KHÔNG lưu nguyên lưới: mỗi khung đang dùng được
CẮT SÁT phần có hình rồi XẾP KÍN vào các TRANG ảnh (mỗi trang rộng ≤ 3072, cao ≤ 2048 điểm). Mục thêm vào tệp:
  "tam_n3" / "tam_n4": một ảnh (chuỗi) hoặc mảng trang ảnh PNG
  "o_n3" / "o_n4":     { "c": số cột của tấm thường, "o": [ô 0, ô 1, …] } — ô thứ hang × c + cột: [trang, x, y, rộng, cao, dx, dy] (điểm ảnh
                       của trang; dx, dy = chỗ của phần cắt trong ô gốc, cũng theo điểm ảnh nét N) hoặc 0 (ô không dùng → vẽ tấm thường)
  "net_cao": ghi chú; "net_cao_cua": 12 ký tự đầu sha256 của "tam" (tấm thường đổi mà chưa dựng lại → build.py bỏ bản nét cao)
Mọi mục cũ giữ nguyên từng ký tự (đã so). build.py chỉ đưa các mục này vào bản web (ảnh rời riêng); bản một tệp bỏ hết.
  python3 ghi_net_cao.py [mã,…]   (không có mã: mọi con trong ra/dung-3.json)
  python3 ghi_net_cao.py --xoa    bỏ các mục nét cao khỏi mọi tệp (quay lui)"""
import base64, hashlib, json, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..', '..', 'do-net', 'cong-cu'))
import thu_net
import kiem_ke as K
RONG, CAO = 3072, 2048
KHOA = ('tam_n3', 'tam_n4', 'o_n3', 'o_n4', 'net_cao', 'net_cao_cua')


def xep(ma, N, d):
    a = np.array(Image.open(os.path.join(K.RA, '%s-net%d.png' % (ma, N))).convert('RGBA'))
    fw, fh = d['khung_rong'] * N, d['khung_cao'] * N
    rows, cols = a.shape[0] // fh, a.shape[1] // fw
    dung = set()
    for t in d['dong_tac'].values():
        if isinstance(t, dict) and 'hang' in t:
            for c in range(t.get('so', 1)):
                dung.add((t['hang'], c))
    manh = []
    for (r, c) in sorted(dung):
        if r >= rows or c >= cols:
            continue
        cell = a[r * fh:(r + 1) * fh, c * fw:(c + 1) * fw]
        ys, xs = np.nonzero(cell[..., 3])
        if not len(xs):
            continue
        x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
        manh.append((r * cols + c, cell[y0:y1, x0:x1], int(x0), int(y0)))
    # xếp kệ: cao trước, mỗi trang rộng ≤ RONG, cao ≤ CAO, cách nhau 1 điểm
    manh.sort(key=lambda m: -m[1].shape[0])
    trang, o = [], [0] * (rows * cols)
    cur = None
    for idx, img, dx, dy in manh:
        h, w = img.shape[:2]
        assert w <= RONG and h <= CAO, (ma, w, h)
        if cur is None or (cur['x'] + w > RONG and cur['y'] + cur['kh'] + 1 + h > CAO):
            cur = {'ds': [], 'x': 0, 'y': 0, 'kh': 0, 'W': 0}; trang.append(cur)
        if cur['x'] + w > RONG:  # kệ mới
            cur['y'] += cur['kh'] + 1; cur['x'] = 0; cur['kh'] = 0
        cur['ds'].append((idx, img, cur['x'], cur['y']))
        o[idx] = [len(trang) - 1, cur['x'], cur['y'], w, h, dx, dy]
        cur['x'] += w + 1; cur['kh'] = max(cur['kh'], h); cur['W'] = max(cur['W'], cur['x'] - 1)
    anh, dien = [], 0
    for t in trang:
        H = t['y'] + t['kh']
        p = np.zeros((H, t['W'], 4), np.uint8)
        for idx, img, x, y in t['ds']:
            p[y:y + img.shape[0], x:x + img.shape[1]] = img
        dien += p.shape[0] * p.shape[1]
        anh.append('data:image/png;base64,' + base64.b64encode(thu_net.png_bang_mau(p)).decode())
    return anh, {'c': cols, 'o': o}, dien, a.shape[0] * a.shape[1]


def ghi(ma, xoa=False):
    f = os.path.join(K.CUS, ma + '.sprite.json')
    d = json.loads(open(f, encoding='utf-8').read())
    cu = {k: v for k, v in d.items() if k not in KHOA}
    for k in KHOA:
        d.pop(k, None)
    tt = []
    if not xoa:
        for N in (3, 4):
            if not os.path.exists(os.path.join(K.RA, '%s-net%d.png' % (ma, N))):
                continue
            anh, o, dien, luoi = xep(ma, N, d)
            d['tam_n%d' % N] = anh[0] if len(anh) == 1 else anh
            d['o_n%d' % N] = o
            tt.append('nét %d: %d trang, %.1f triệu điểm (lưới đủ %.1f)' % (N, len(anh), dien / 1e6, luoi / 1e6))
        d['net_cao_cua'] = hashlib.sha256(d['tam'].encode()).hexdigest()[:12]  # build.py bỏ bản nét cao nếu tấm thường đổi mà chưa dựng lại
        d['net_cao'] = 'net-cao-quai 17/10: tam_n3 / tam_n4 dựng lại từ ảnh gốc (docs/review/ke-hoach-cai-thien/net-cao-quai/cong-cu), khung cắt sát xếp kín; ' + '; '.join(tt)
    assert all(d[k] == v for k, v in cu.items()), ma
    with open(f, 'w', encoding='utf-8') as fo:
        json.dump(d, fo, ensure_ascii=False, separators=(',', ':'))
    return tt


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    xoa = '--xoa' in sys.argv
    ds = args[0].split(',') if args else list(json.load(open(os.path.join(K.RA, 'dung-3.json'))))
    for ma in ds:
        print(ma, ghi(ma, xoa), flush=True)
