import sys, os, numpy as np, importlib.util
from PIL import Image
from scipy import ndimage
spec = importlib.util.spec_from_file_location('cs', '/home/user/new-project/tools/cat-sheet.py'); cs = importlib.util.module_from_spec(spec); spec.loader.exec_module(cs)
im = Image.open(sys.argv[1]).convert('RGB')
# mã: {dáng: (x0,y0,x1,y1)} — toạ độ trên tấm ghép 1792×592
B = {
 'thuongluong': {'walk1': (0, 40, 238, 292), 'attack': (446, 40, 592, 150), 'rage': (446, 162, 592, 290)},
 'haba':        {'walk1': (600, 35, 752, 212), 'attack': (752, 35, 892, 155), 'rage': (758, 162, 892, 292)},
 'daibang':     {'walk1': (0, 330, 202, 442), 'walk2': (205, 330, 398, 446), 'attack': (205, 448, 398, 588), 'rage': (402, 328, 600, 402)},
 'anvuong':     {'walk1': (0, 443, 202, 592), 'attack': (400, 436, 600, 592)},
 'ngutinh':     {'walk1': (600, 330, 892, 592)},
 'thuytinh':    {'walk1': (900, 30, 1050, 168), 'attack': (1048, 30, 1192, 168), 'rage': (1052, 165, 1190, 289)},
 'chantinh':    {'walk1': (1200, 35, 1402, 292), 'rage': (1600, 35, 1792, 292)},
 'hotinh':      {'walk1': (900, 335, 1052, 452), 'walk2': (1050, 335, 1192, 452), 'attack': (900, 450, 1052, 592), 'rage': (1050, 450, 1196, 592)},
 'trieuda':     {'walk1': (1200, 335, 1305, 592), 'attack': (1326, 390, 1490, 592), 'rage': (1600, 325, 1792, 592)},
}
def cut(box):
    c = cs.drop_specks(cs.key_magenta(im.crop(box)), 60)
    a = np.asarray(c).copy(); m = a[..., 3] > 20
    lab, k = ndimage.label(m)
    if k > 1:
        sz = ndimage.sum(m, lab, range(1, k + 1)); big = sz.max()
        for j in range(1, k + 1):
            if sz[j - 1] < 0.12 * big: a[lab == j, 3] = 0
    c = Image.fromarray(a, 'RGBA')
    return c.crop(c.getbbox())
for code, poses in B.items():
    out = f'/home/user/new-project/assets/packs/{code}'; os.makedirs(out, exist_ok=True)
    fr = {n: cut(b) for n, b in poses.items()}
    fr.setdefault('walk2', fr['walk1']); fr.setdefault('attack', fr['walk1'])
    for n, f in fr.items(): cs.save_light(f, f'{out}/{n}.png')
    print(code, {n: f.size for n, f in fr.items()})
