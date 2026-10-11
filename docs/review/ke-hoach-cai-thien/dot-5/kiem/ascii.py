import sys, json, io, base64
import numpy as np
from PIL import Image
REPO='/home/claude/new-project'
def tam(key):
    t = json.load(open(REPO + '/game/art/custom/em-be-%s.sprite.json' % key))
    return t, Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',', 1)[1]))).convert('RGBA')
def khung(t, im, ten, i):
    a = np.asarray(im); h = t['dong_tac'][ten]['hang']
    return a[h * 96 + 1:(h + 1) * 96:2, i * 96 + 1:(i + 1) * 96:2].copy()
def ve(key, frames, y0=-20, y1=-4, x0=-12, x1=16):
    t, im = tam(key)
    Fs = [khung(t, im, *f) for f in frames]
    print(key, '   '.join('%s:%d' % f + ' ' * (x1 - x0 - 5) for f in frames))
    hdr = ''.join(str(abs(x) % 10) for x in range(x0, x1 + 1))
    print('    ' + '   '.join([hdr] * len(frames)))
    for y in range(y0, y1 + 1):
        row = []
        for F in Fs:
            s = ''
            for x in range(x0, x1 + 1):
                r, g, b, a = [int(v) for v in F[45 + y, 24 + x]]
                lum = (r * 3 + g * 6 + b) / 10
                s += '.' if a < 128 else ('#' if lum < 55 else ('+' if lum < 110 else 'o'))
            row.append(s)
        print('%3d ' % y + '   '.join(row))
if __name__ == '__main__':
    key = sys.argv[1]
    fr = [(a.split(':')[0], int(a.split(':')[1])) for a in sys.argv[2].split(',')]
    ve(key, fr, *[int(v) for v in sys.argv[3:]])
