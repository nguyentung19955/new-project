"""Chia tấm nét cao thành nhiều TRANG ảnh (mỗi trang ≤ HANG_TRANG hàng ô) — ảnh một tấm 17 triệu điểm (nét 4) vượt trần canvas/giải mã
của nhiều máy (iOS ~16,7 triệu điểm), và tốn RAM liền một khối. Ô j nằm ở trang j // (cot × HANG_TRANG), vị trí j % … trong trang.
"tam_n<N>" trong tệp game = MẢNG đường dẫn ảnh (data URL) các trang; "to_n<N>"."trang" = số ô mỗi trang.
  python3 chia_trang.py     chia lại các "tam_n3" / "tam_n4" còn là MỘT ảnh trong game/art/custom/zed-moi.sprite.json"""
import base64, io, json, os, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.normpath(os.path.join(HERE, '..', '..', 'do-net', 'cong-cu')))
import thu_net
HANG_TRANG = 8
TEP = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..', 'game', 'art', 'custom', 'zed-moi.sprite.json'))


def chia(big, meta):
    """big: ảnh RGBA cả tấm (np). Trả (danh sách PNG bytes, số ô mỗi trang)."""
    O, C = meta['o'], meta['cot']
    h = HANG_TRANG * O
    tr = []
    for y in range(0, big.shape[0], h):
        p = big[y:y + h]
        if p[..., 3].any():
            tr.append(thu_net.png_bang_mau(p))
    return tr, C * HANG_TRANG


def main():
    d = json.load(open(TEP, encoding='utf-8'))
    for N in (3, 4):
        k = 'tam_n%d' % N
        if not isinstance(d.get(k), str):
            continue
        big = np.array(Image.open(io.BytesIO(base64.b64decode(d[k].split(',', 1)[1]))).convert('RGBA'))
        tr, n = chia(big, d['to_n%d' % N])
        d[k] = ['data:image/png;base64,' + base64.b64encode(b).decode() for b in tr]
        d['to_n%d' % N]['trang'] = n
        print('nét %d: %d trang, %s KB' % (N, len(tr), [len(b) // 1024 for b in tr]))
    json.dump(d, open(TEP, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))


if __name__ == '__main__':
    main()
