import sys, os, numpy as np
from PIL import Image
sys.path.insert(0, '/home/user/new-project/tools')
import importlib.util
spec = importlib.util.spec_from_file_location('cs', '/home/user/new-project/tools/cat-sheet.py'); cs = importlib.util.module_from_spec(spec); spec.loader.exec_module(cs)
im = Image.open(sys.argv[1]).convert('RGB')
# (mã, hộp x0,y0,x1,y1 phần thân panel, số dáng mong đợi)
P = [('cungan', 18, 52, 372, 220, 3), ('kybinh', 470, 52, 695, 220, 1), ('voichien', 712, 40, 1040, 222, 1),
     ('camap', 1056, 52, 1390, 222, 1), ('muc', 18, 300, 352, 475, 3), ('cua', 365, 310, 695, 478, 1), ('cao', 712, 360, 1040, 478, 3)]
def key(c):
    a = np.asarray(c).astype(int)
    d = np.sqrt((a[..., 0] - 255) ** 2 + (a[..., 1] - 126) ** 2 + (a[..., 2] - 253) ** 2)
    like = d < 70
    # loang từ mép
    from collections import deque
    H, W = like.shape; bg = np.zeros_like(like); q = deque()
    for y in range(H):
        for x in (0, W - 1):
            if like[y, x]: bg[y, x] = 1; q.append((y, x))
    for x in range(W):
        for y in (0, H - 1):
            if like[y, x] and not bg[y, x]: bg[y, x] = 1; q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
            if 0 <= ny < H and 0 <= nx < W and like[ny, nx] and not bg[ny, nx]: bg[ny, nx] = 1; q.append((ny, nx))
    # khử ám hồng ở viền
    bg |= d < 45                       # nền bị bao kín (trong dây cung, cửa sổ tháp)
    al = np.where(bg, 0, 255)
    return Image.fromarray(np.dstack([a, al]).astype(np.uint8), 'RGBA')
for code, x0, y0, x1, y1, n in P:
    c = cs.drop_specks(key(im.crop((x0, y0, x1, y1))), 60)
    a = np.asarray(c)[..., 3] > 20
    cols = a.sum(0)
    # tách dáng theo cột trống
    segs, inn, st = [], False, 0
    for x, v in enumerate(cols):
        if v > 0 and not inn: inn, st = True, x
        if v == 0 and inn: inn = False; segs.append((st, x))
    if inn: segs.append((st, len(cols)))
    segs = [s for s in segs if s[1] - s[0] > 15]
    if n == 3 and len(segs) != 3:
        w = (x1 - x0) / 3; segs = [(int(i * w), int((i + 1) * w)) for i in range(3)]
    if n == 1: segs = [(segs[0][0], segs[-1][1])]
    rows = np.nonzero(a.any(1))[0]; top, bot = rows.min(), rows.max() + 1
    frames = [c.crop((s0, top, s1, bot)) for s0, s1 in segs]
    def biggest(f):
        from scipy import ndimage
        m = np.asarray(f)[..., 3] > 20
        lab, k = ndimage.label(m)
        if k > 1:
            sz = ndimage.sum(m, lab, range(1, k + 1)); keep = 1 + int(np.argmax(sz))
            arr = np.asarray(f).copy(); arr[(lab != keep) & (lab > 0), 3] = 0
            # giữ cả mảnh lớn khác (> 15% mảnh chính), ví dụ mũi tên rời
            for j in range(1, k + 1):
                if sz[j - 1] > 0.15 * sz[keep - 1]: arr[lab == j, 3] = np.asarray(f)[..., 3][lab == j]
            f = Image.fromarray(arr, 'RGBA')
        return f
    if code == 'cao': frames = [frames[0], frames[0], frames[2]]
    frames = [biggest(f) for f in frames]
    frames = [f.crop(f.getbbox()[0:1] + (0,) + f.getbbox()[2:3] + (f.height,)) for f in frames]
    names = ['walk1', 'walk2', 'attack'] if len(frames) == 3 else ['walk1']
    out = f'/home/user/new-project/assets/packs/{code}'; os.makedirs(out, exist_ok=True)
    for nm, f in zip(names, frames):
        k = min(1.0, 480 / f.height) if f.height > 480 else 1.0
        cs.save_light(f, f'{out}/{nm}.png')
    if len(frames) == 1:
        for nm in ['walk2', 'attack']: cs.save_light(frames[0], f'{out}/{nm}.png')
    print(code, len(segs), [f.size for f in frames])
