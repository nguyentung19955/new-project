import sys, json, base64, io
sys.path.insert(0, '.')
from build import *
from velai import dat_tile, dat_goc_trong, da_tile, da_goc_trong, tuong_tile, tuong_goc_trong, van_tile  # bản vẽ lại 2

OUT = '/home/claude/new-project/tieng-vong-cuoi-cung/art/tileset/ai/game/'

def giam_mau(tiles, n=32):
    """gom màu cả nhóm về ≤ n màu (giữ màu viền #0C0F14)"""
    px = np.concatenate([t[t[..., 3] > 0][:, :3] for t in tiles], 0)
    uniq = np.unique(px, axis=0)
    if len(uniq) <= n:
        return tiles, len(uniq)
    khac = px[~(px == VIEN[:3]).all(1)]
    im = Image.fromarray(khac.reshape(-1, 1, 3).astype(np.uint8))
    q = im.quantize(colors=n - 1, method=Image.Quantize.MEDIANCUT)
    pal = np.array(q.getpalette()[:(n - 1) * 3]).reshape(-1, 3)
    pal = np.concatenate([pal, VIEN[None, :3]], 0)
    out = []
    for t in tiles:
        t = t.copy()
        m = t[..., 3] > 0
        c = t[m][:, :3]
        d = ((c[:, None, :] - pal[None]) ** 2).sum(2)
        # màu viền giữ nguyên
        isv = (c == VIEN[:3]).all(1)
        idx = d.argmin(1)
        idx[isv] = len(pal) - 1
        t[m, :3] = pal[idx]
        out.append(t)
    return out, len(np.unique(np.concatenate([t[t[..., 3] > 0][:, :3] for t in out]), axis=0))

def nang(t, k):
    """nâng sáng nhẹ để tách khỏi nền parallax (không đụng màu viền)"""
    t = t.copy()
    m = (t[..., 3] > 0) & ~(t[..., :3] == VIEN[:3]).all(-1)
    t[m, :3] = np.clip(t[m, :3] * k, 0, 255).astype(int)
    return t

NANG = {'dat': 1.0, 'da': 1.0, 'tuong': 1.0}  # bảng màu velai.py đã chỉnh sẵn

def tat_ca():
    nhom = {'dat': [], 'da': [], 'vat': []}
    for vl, ham, gt in (('dat', dat_tile, dat_goc_trong), ('da', da_tile, da_goc_trong), ('tuong', tuong_tile, tuong_goc_trong)):
        g = 'dat' if vl == 'dat' else 'da'
        for m in range(16):
            for v in range(4):
                nhom[g].append((vl + '_' + str(m) + '_' + str(v), nang(ham(m, v), NANG[vl]), vl))
        for k in ('BT', 'BD', 'NT', 'ND'):
            nhom[g].append((vl + '_gt_' + k, nang(gt(k), NANG[vl]), vl + '_goc'))
    for lr in range(4):
        for v in range(3):
            nhom['vat'].append(('van_%d_%d' % (lr, v), van_tile(lr, v), 'van'))
    for ud in range(4):
        nhom['vat'].append(('thang_%d' % ud, thang_tile(ud), 'thang'))
        nhom['vat'].append(('day_%d' % ud, day_tile(ud), 'day'))
        nhom['vat'].append(('cua0_%d' % ud, cua_tile(False, ud), 'cua'))
        nhom['vat'].append(('cua1_%d' % ud, cua_tile(True, ud), 'cua'))
    nhom['vat'].append(('gai', gai_tile(), 'gai'))
    nhom['vat'].append(('congtac0', congtac_tile(0), 'congtac'))
    nhom['vat'].append(('congtac1', congtac_tile(1), 'congtac'))
    ds = []
    somau = {}
    for g in ('dat', 'da', 'vat'):
        tiles, n = giam_mau([x[1] for x in nhom[g]])
        somau[g] = n
        for (ten, _, nh), t in zip(nhom[g], tiles):
            ds.append((ten, t, nh))
    # thứ tự giống tiles.js
    thu_tu = []
    for vl in ('dat', 'da', 'tuong'):
        for m in range(16):
            for v in range(4): thu_tu.append('%s_%d_%d' % (vl, m, v))
        for k in ('BT', 'BD', 'NT', 'ND'): thu_tu.append(vl + '_gt_' + k)
    for lr in range(4):
        for v in range(3): thu_tu.append('van_%d_%d' % (lr, v))
    for ud in range(4):
        thu_tu += ['thang_%d' % ud, 'day_%d' % ud, 'cua0_%d' % ud, 'cua1_%d' % ud]
    thu_tu += ['gai', 'congtac0', 'congtac1']
    dd = {x[0]: x for x in ds}
    return [dd[t] for t in thu_tu], somau

if __name__ == '__main__':
    ds, somau = tat_ca()
    COT = 16
    hang = (len(ds) + COT - 1) // COT
    atlas = np.zeros((hang * T, COT * T, 4), np.uint8)
    mp = {}
    for i, (ten, t, nh) in enumerate(ds):
        ox, oy = (i % COT) * T, (i // COT) * T
        atlas[oy:oy + T, ox:ox + T] = t
        mp[ten] = [ox, oy, nh]
    im = Image.fromarray(atlas, 'RGBA')
    im.save(OUT + 'tiles.png', optimize=True)
    json.dump({'kichThuoc': T, 'cot': COT, 'o': {k: v[:2] for k, v in mp.items()},
               'nhom': {k: v[2] for k, v in mp.items()}}, open(OUT + 'tiles.json', 'w'), ensure_ascii=False, separators=(',', ':'))
    print('so tile', len(ds), 'atlas', im.size, 'so mau', somau,
          'tong mau', len(np.unique(atlas[atlas[..., 3] > 0][:, :3], axis=0)))
    print('alpha', np.unique(atlas[..., 3]))
