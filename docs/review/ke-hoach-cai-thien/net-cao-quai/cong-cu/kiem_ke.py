"""KIỂM KÊ + KHỚP ẢNH GỐC cho quái / tinh anh / trùm / người làng (net-cao-quai 17/10). CHỈ ĐỌC game/art/custom.
Với từng khung của tấm đang dùng (net 2): tìm khung ảnh gốc (docs/anh-goc/...-cat/**/khung-*.png, cả tấm gục trùm cắt 8),
tỉ lệ co z + chỗ dán (X, Y) cho ra đúng mặt nạ đục của khung đó (IoU ≥ 0,97, có thử lật ngang) — giống do-net/cong-cu/dung_quai_net.py
nhưng tìm trên MỌI khung gốc của con đó (hàng nào cũng được), không phụ thuộc hàm thu cũ (alpha BOX ≥ 128).
  python3 kiem_ke.py [mã,mã,…]   → ra/khop.json (từng khung: nguồn, lật, z, X, Y, IoU) + in bảng
'gốc / điểm game' = số điểm ảnh gốc cho 1 điểm ảnh game (= 2 / z). ≥ N thì bản NET N có chi tiết thật (không phải phóng)."""
import glob, json, os, sys, io, base64
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
CUS = os.path.join(REPO, 'game', 'art', 'custom')
AG = os.path.join(REPO, 'docs', 'anh-goc')
RA = os.path.join(HERE, 'ra'); os.makedirs(RA, exist_ok=True)
NGUONG = 0.97
TRUM = {'cuaDa': 'cua-da', 'hoLua': 'ho-lua', 'hoTinh': 'ho-tinh', 'mocTinh': 'moc-tinh', 'nguTinh': 'ngu-tinh', 'namChua': 'nam-chua'}
EM = {'em-be-healer': 'em-cai-bong', 'em-be-hunter': 'em-cu-teo', 'em-be-wrestler': 'em-cu-li', 'nl-sen': 'em-be-sen'}


def ds_ma():
    out = []
    for f in sorted(glob.glob(os.path.join(CUS, '*.sprite.json'))):
        ma = os.path.basename(f)[:-12]
        if ma.endswith('-netcu') or ma.endswith('-muotcu'):
            continue
        d = json.load(open(f, encoding='utf-8'))
        if d.get('doi_tuong') in ('quai', 'nguoi-lang', 'em-be'):
            out.append(ma)
    return out


def doc(ma):
    d = json.load(open(os.path.join(CUS, ma + '.sprite.json'), encoding='utf-8'))
    return d, np.array(Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',', 1)[1]))).convert('RGBA'))


def nguon(ma):
    """danh sách (khoá, ảnh RGBA) các khung gốc có thể là nguồn của tấm <ma>"""
    base, pha = ma, 1
    if '-p' in ma and ma.rsplit('-p', 1)[1].isdigit():
        base, pha = ma.rsplit('-p', 1)[0], int(ma.rsplit('-p', 1)[1])
    files = []
    if base in TRUM:
        s = TRUM[base]
        files += glob.glob(os.path.join(AG, 'trum-moi', s, '*-cat', '**', 'khung-*.png'), recursive=True)
        files += glob.glob(os.path.join(AG, 'trum-moi', s, '**', 'khung-*.png'), recursive=True)
    files += glob.glob(os.path.join(AG, 'quai-moi', 'dong-tac', base + '-[0-9]*', '**', 'khung-*.png'), recursive=True)
    files += glob.glob(os.path.join(AG, 'quai-moi', 'dong-tac', base + '-cat-tay', '**', 'khung-*.png'), recursive=True)
    files += glob.glob(os.path.join(AG, 'soat-muot', 'P*-' + base + '-[0-9p]*', '**', 'khung-*.png'), recursive=True)
    nm = EM.get(ma, ma)
    files += glob.glob(os.path.join(AG, 'npc-moi', nm + '-[0-9]*', '**', 'khung-*.png'), recursive=True)
    files += glob.glob(os.path.join(AG, '*', '**', ma + '-*-cat', '**', 'khung-*.png'), recursive=True)
    out = [(os.path.relpath(f, AG), None) for f in sorted(set(files))]
    # tấm gục trùm (trum-chet-anh): một ảnh 8 khung, cắt theo cột hẹp nhất
    if base in TRUM and pha > 1:
        p = os.path.join(AG, 'trum-moi', 'chet', '%s-p%d-chet.png' % (TRUM[base], pha))
        if os.path.exists(p):
            sys.path.insert(0, os.path.join(REPO, 'docs', 'review', 'ke-hoach-cai-thien', 'trum-chet-anh', 'cong-cu'))
            from chung import cat8
            im = Image.open(p).convert('RGBA'); a = np.array(im)
            cuts = [0] + [c[0] for c in cat8(im)] + [a.shape[1]]
            for k in range(8):
                out.append(('trum-moi/chet/%s-p%d-chet.png#%d' % (TRUM[base], pha, k + 1), a[:, cuts[k]:cuts[k + 1]]))
    return out


def anh_nguon(key, arr=None):
    if arr is not None:
        return arr
    if '#' in key:
        raise KeyError(key)
    return np.array(Image.open(os.path.join(AG, key)).convert('RGBA'))


def alpha_chuan(a):
    al = a[..., 3]
    mx = int(al.max())
    if 0 < mx < 230:
        al = np.clip(al.astype(np.float32) * (255.0 / mx), 0, 255).astype(np.uint8)
    return al


def bb(m):
    ys, xs = np.nonzero(m)
    return (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1) if len(xs) else None


def mask_thu(al, z):
    H, W = al.shape
    tw, th = max(1, round(W * z)), max(1, round(H * z))
    return np.array(Image.fromarray(al).resize((tw, th), Image.BOX)) >= 128


def khop_tinh(om, al):
    """tìm z, X, Y; om = mặt nạ khung đích, al = alpha khung gốc (đã lật nếu cần)"""
    ob = bb(om); sb = bb(al >= 128)
    if ob is None or sb is None:
        return None
    z0 = (ob[3] - ob[1]) / max(1, sb[3] - sb[1])
    tot = None
    for z in z0 * (1 + np.linspace(-0.04, 0.04, 33)):
        m = mask_thu(al, z); tb = bb(m)
        if tb is None:
            continue
        if abs((tb[2] - tb[0]) - (ob[2] - ob[0])) > 1 or abs((tb[3] - tb[1]) - (ob[3] - ob[1])) > 1:
            continue
        for ddx in (-1, 0, 1):
            for ddy in (-1, 0, 1):
                X, Y = int(ob[0] - tb[0] + ddx), int(ob[1] - tb[1] + ddy)
                big = np.zeros_like(om)
                x0, y0, x1, y1 = max(0, X), max(0, Y), min(om.shape[1], X + m.shape[1]), min(om.shape[0], Y + m.shape[0])
                if x1 <= x0 or y1 <= y0:
                    continue
                big[y0:y1, x0:x1] = m[y0 - Y:y1 - Y, x0 - X:x1 - X]
                iou = (big & om).sum() / max(1, (big | om).sum())
                if tot is None or iou > tot[0]:
                    tot = (float(iou), float(z), X, Y, int((om & ~big).sum()), int((big & ~om).sum()))
    return tot


def lam(ma):
    d, sh = doc(ma)
    n = d.get('net', 1); fw, fh = d['khung_rong'] * n, d['khung_cao'] * n
    ng = nguon(ma)
    cand = []
    for key, arr in ng:
        a = anh_nguon(key, arr)
        al = alpha_chuan(a)
        for fl in (False, True):
            alf = al[:, ::-1].copy() if fl else al
            b = bb(alf >= 128)
            if b is None:
                continue
            cand.append((key, fl, alf, b))
    kq = {'ma': ma, 'ten': d.get('ten'), 'doi': d.get('doi_tuong'), 'net': n, 'khung': [fw // n, fh // n], 'tam': list(sh.shape[1::-1]),
          'kb': len(d['tam']) * 3 // 4 // 1024, 'so_nguon': len(ng), 'khung_ds': []}
    da = set()
    for ten, a_ in d['dong_tac'].items():
        if not isinstance(a_, dict) or 'hang' not in a_:
            continue
        R = a_['hang']
        for C in range(a_['so']):
            if (R, C) in da:
                continue
            da.add((R, C))
            o = sh[R * fh:(R + 1) * fh, C * fw:(C + 1) * fw]
            if o.shape[0] < fh or o.shape[1] < fw:
                continue
            om = o[..., 3] > 0
            rec = {'hang': R, 'cot': C, 'dt': ten, 'diem': int(om.sum())}
            if om.sum() < 30:
                rec['trong'] = True; kq['khung_ds'].append(rec); continue
            ob = bb(om); bw, bh = ob[2] - ob[0], ob[3] - ob[1]
            oc = om[ob[1]:ob[3], ob[0]:ob[2]]
            sc = []
            for i, (key, fl, alf, b) in enumerate(cand):
                sw, shh = b[2] - b[0], b[3] - b[1]
                if abs(sw * bh / shh - bw) > max(2, 0.06 * bw):
                    continue
                m = np.array(Image.fromarray(alf[b[1]:b[3], b[0]:b[2]]).resize((bw, bh), Image.BOX)) >= 128
                sc.append(((m & oc).sum() / max(1, (m | oc).sum()), i))
            sc.sort(reverse=True)
            tot = None
            for s0, i in sc[:3]:
                if s0 < 0.8:
                    break
                r = khop_tinh(om, cand[i][2])
                if r and (tot is None or r[0] > tot[0]):
                    tot = r + (i,)
                if tot and tot[0] >= 0.99:
                    break
            if tot:
                iou, z, X, Y, ct, cg, i = tot
                rec.update({'iou': round(iou, 4), 'nguon': cand[i][0], 'lat': cand[i][1], 'z': z, 'X': X, 'Y': Y, 'goc_moi_diem': round(n / z, 2),
                            'chi_tam': round(ct / om.sum(), 4), 'chi_goc': round(cg / om.sum(), 4)})
            # khớp: IoU ≥ 0,97; hoặc IoU ≥ 0,93 mà điểm của tấm không có trong gốc ≤ 3 % và gốc thừa ≤ 8 % (chỉ là mép dày/mỏng 1 điểm do
            # cách cắt alpha khác: LANCZOS / BOX / ngưỡng — đã xem ảnh so, vị trí trùng)
            rec['khop'] = bool(tot and (tot[0] >= NGUONG or (tot[0] >= 0.93 and rec['chi_tam'] <= 0.03 and rec['chi_goc'] <= 0.08)))
            kq['khung_ds'].append(rec)
    ks = [r for r in kq['khung_ds'] if not r.get('trong')]
    kq['so_khung'] = len(ks); kq['so_khop'] = sum(r['khop'] for r in ks)
    gm = [r['goc_moi_diem'] for r in ks if r['khop']]
    kq['goc_moi_diem'] = round(float(np.median(gm)), 2) if gm else None
    kq['goc_moi_diem_min'] = round(float(min(gm)), 2) if gm else None
    return kq


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    ds = args[0].split(',') if args else ds_ma()
    p = os.path.join(RA, 'khop.json')
    tong = json.load(open(p)) if os.path.exists(p) else {}
    for ma in ds:
        kq = lam(ma)
        tong[ma] = kq
        json.dump(tong, open(p, 'w'), ensure_ascii=False, indent=0)
        print('%-16s %-12s khung %3dx%-3d  nguồn %3d  khớp %2d/%2d  gốc/điểm %s (min %s)' % (ma, kq['doi'], kq['khung'][0], kq['khung'][1], kq['so_nguon'],
              kq['so_khop'], kq['so_khung'], kq['goc_moi_diem'], kq['goc_moi_diem_min']), flush=True)
