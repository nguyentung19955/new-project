#!/usr/bin/env python3
"""Tách khung ảnh chibi (nền trắng/kem) → khung PNG trong suốt, cùng tỉ lệ, pivot giữa hai bàn chân.

Ví dụ:
  python3 tools/chibi-tach-khung.py art/chibi/lam/run-6.png --hang 2 --cot 3 --ra art/chibi/lam/khung/run --fps 12
  python3 tools/chibi-tach-khung.py art/chibi/lam/combo-20.png --hang 5 --cot 4 --tach-hang \
      --ra art/chibi/lam/khung/combo --bay 4,5,6,7,8,13,14 --fps 14
  python3 tools/chibi-tach-khung.py art/chibi/lam/idle.gif --ra art/chibi/lam/khung/idle --fps 8

Tỉ lệ: đo chiều cao MẮT (đốm vàng phát sáng, ổn định nhất trong ảnh gen) – lấy trung vị
(phân vị 75) của cả tấm sheet, so với mau-goc.png → MỘT hệ số cho mọi khung trong tấm (không scale riêng
từng khung). Có thể ép bằng --ti-le.
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image, ImageSequence
from scipy import ndimage as ndi

O = 512                    # ô vuông nguồn
DAY = 500                  # đáy ô (chừa 12 px cho bóng/viền)
MAT_CHUAN = 15.0           # chiều cao mắt (px) trong ô 512 – xem BAO-CAO
NGUONG_NEN = 34            # khoảng cách màu tới nền để coi là nền


# ---------- 1. bỏ nền ----------
def uoc_mau_nen(a):
    vien = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]).astype(float)
    return np.median(vien, axis=0)


def bo_nen(rgb, nguong=NGUONG_NEN):
    """Flood fill từ mép theo màu gần nền → alpha; mép mịn 1–2 px; khử viền trắng."""
    a = rgb.astype(float)
    nen = uoc_mau_nen(rgb)
    d = np.sqrt(((a - nen) ** 2).sum(-1))
    sat = a.max(-1) - a.min(-1)
    giong_nen = (d < nguong) & (sat < 40)
    lab, n = ndi.label(giong_nen)
    mep = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    nen_mask = np.isin(lab, list(mep))
    # lỗ kín (khoảng trống giữa tay và thân): chỉ khi rất giống nền, đủ lớn, đồng màu
    lo_mask = np.zeros_like(nen_mask)
    lab2, n2 = ndi.label(giong_nen & ~nen_mask)
    if n2:
        r, g, b = a[..., 0], a[..., 1], a[..., 2]
        vang = (r > 200) & (g > 150) & (r - b > 40)       # quầng mắt / đồng thau
        for i, sl0 in enumerate(ndi.find_objects(lab2), 1):
            sl = tuple(slice(max(q.start - 6, 0), q.stop + 6) for q in sl0)
            m = lab2[sl] == i
            if m.sum() < 12:
                continue
            dd = d[sl][m]
            if np.median(dd) > 12:
                continue
            vong = ndi.binary_dilation(m, iterations=5) & ~ndi.binary_dilation(m, iterations=2)
            # lưỡi dao: viền quanh là kim loại xám (bão hoà ~0) → giữ
            if np.median(sat[sl][vong]) < 8:
                continue
            # mắt: có quầng vàng sát bên → giữ
            if (vang[sl] & ndi.binary_dilation(m, iterations=3)).sum() >= 4:
                continue
            lo_mask[sl] |= m
    nen_mask |= lo_mask
    alpha = np.where(nen_mask, 0.0, 1.0)
    # vành 2 px quanh nền: alpha mềm theo khoảng cách màu, bỏ pha trộn với nền
    vanh = ndi.binary_dilation(nen_mask, iterations=2) & ~nen_mask
    t = np.clip((d - 6) / (nguong + 40 - 6), 0, 1)
    alpha[vanh] = np.maximum(t[vanh], 0.0)
    alpha[vanh & (t > 0.92)] = 1.0
    # un-premultiply với màu nền
    al = np.clip(alpha, 1e-3, 1)[..., None]
    mau = np.clip((a - (1 - al) * nen) / al, 0, 255)
    mau = np.where(alpha[..., None] > 0, mau, 0)
    out = np.dstack([mau, alpha * 255]).astype(np.uint8)
    return out


# ---------- 2. tách khung ----------
def tach_khung(rgba, hang=None, cot=None):
    al = rgba[..., 3] > 128
    lab, n = ndi.label(al, structure=np.ones((3, 3)))
    if n == 0:
        return []
    idx = np.arange(1, n + 1)
    dien = ndi.sum(al, lab, idx)
    lon = dien.max()
    sl = ndi.find_objects(lab)
    chinh = [i for i in idx if dien[i - 1] > lon * 0.12]
    phu = [i for i in idx if lon * 0.0004 < dien[i - 1] <= lon * 0.12]
    nhom = {i: [i] for i in chinh}

    def bb(i):
        s = sl[i - 1]
        return s[0].start, s[0].stop, s[1].start, s[1].stop

    for p in phu:  # ghép mảnh rời (dao, chuông) vào khung gần nhất (theo bbox)
        y0, y1, x0, x1 = bb(p)
        best, bd = None, 1e9
        for c in chinh:
            Y0, Y1, X0, X1 = bb(c)
            dx = max(0, X0 - x1, x0 - X1); dy = max(0, Y0 - y1, y0 - Y1)
            dd = np.hypot(dx, dy)
            if dd < bd:
                best, bd = c, dd
        if bd < 0.25 * np.sqrt(lon):
            nhom[best].append(p)
    khung = []
    for c, ds in nhom.items():
        m = np.isin(lab, ds)
        ys, xs = np.where(m)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        crop = rgba[y0:y1, x0:x1].copy()
        crop[..., 3] = np.where(m[y0:y1, x0:x1] | (ndi.binary_dilation(m, iterations=2)[y0:y1, x0:x1]),
                                crop[..., 3], 0)
        khung.append(dict(img=crop, y0=y0, x0=x0, cy=(y0 + y1) / 2, cx=(x0 + x1) / 2, y1=y1))
    # sắp theo hàng rồi cột
    khung.sort(key=lambda k: k['cy'])
    if hang and hang > 1:
        cys = np.array([k['cy'] for k in khung])
        gaps = np.diff(cys)
        cat = sorted(np.argsort(gaps)[-(hang - 1):])
    else:
        h = np.median([k['img'].shape[0] for k in khung])
        cat = [i for i, g in enumerate(np.diff([k['cy'] for k in khung])) if g > h * 0.5]
    hangs, s = [], 0
    for c in list(cat) + [len(khung) - 1]:
        hangs.append(sorted(khung[s:c + 1], key=lambda k: k['cx'])); s = c + 1
    for r, hg in enumerate(hangs):
        for k in hg:
            k['hang'] = r
    return hangs


# ---------- 3. đo ----------
def mask_mat(rgba):
    a = rgba[..., :3].astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    sang = (r > 205) & (g > 165) & (r - b > 20) & (r - b < 175)
    # mắt phát sáng nằm trong vùng tối (mặt đen) → loại chuông/khoá đồng sáng
    toi = ndi.uniform_filter(((r + g + b) < 150).astype(float), 9) > 0.3
    return (rgba[..., 3] > 200) & sang & ndi.binary_dilation(toi, iterations=2)


def do_mat(rgba):
    """→ (số mắt, chiều cao mắt trung bình, y tâm mắt) ; mắt = đốm vàng sáng đủ lớn."""
    m = mask_mat(rgba)
    m = ndi.binary_closing(m, structure=np.ones((5, 3)))
    lab, n = ndi.label(m)
    if n == 0:
        return 0, None, None
    out = []
    H = rgba.shape[0]
    for i, s in enumerate(ndi.find_objects(lab), 1):
        h = s[0].stop - s[0].start; w = s[1].stop - s[1].start
        dien = (lab[s] == i).sum()
        # mắt: dạng elip đứng, không quá dẹt, đủ lớn
        if dien >= max(6, (H * 0.008) ** 2) and h >= w * 0.8 and h < H * 0.15:
            out.append((h, (s[0].start + s[0].stop) / 2, dien))
    if not out:
        return 0, None, None
    lonnhat = max(o[2] for o in out)
    out = [o for o in out if o[2] > lonnhat * 0.3]
    lon = max(out, key=lambda o: o[2])          # chiều cao = mắt lớn nhất (ít nhiễu nhất)
    return len(out), float(lon[0]), float(lon[1])


def mask_ung(rgba):
    a = rgba[..., :3].astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return (rgba[..., 3] > 200) & (r > 70) & (r > g + 12) & (g > b + 4) & (r < 190)


def pivot_chan(rgba):
    """x giữa hai bàn chân (2 đốm ủng nâu lớn nhất ở 40% dưới), y = đáy alpha."""
    H = rgba.shape[0]
    al = rgba[..., 3] > 128
    ys = np.where(al.any(1))[0]
    day = ys.max()
    top = ys.min()
    lim = int(top + (day - top) * 0.6)
    m = mask_ung(rgba); m[:lim] = False
    m = ndi.binary_closing(m, iterations=3)
    lab, n = ndi.label(m)
    if n == 0:
        xs = np.where(al[day - 5:day + 1].any(0))[0]
        return float(xs.mean()), float(day), 0
    dien = ndi.sum(m, lab, range(1, n + 1))
    od = np.argsort(dien)[::-1]
    chon = [od[0] + 1] + ([od[1] + 1] if n > 1 and dien[od[1]] > dien[od[0]] * 0.25 else [])
    cxs = []
    for i in chon:
        yy, xx = np.where(lab == i)
        # tâm phần đế (1/3 dưới của đốm)
        cut = np.percentile(yy, 66)
        cxs.append(xx[yy >= cut].mean())
    return float(np.mean(cxs)), float(day), len(chon)


# ---------- 4. đặt vào ô ----------
def doi_co(rgba, k):
    im = Image.fromarray(rgba, 'RGBA')
    # premultiply để Lanczos không loang viền tối/trắng
    a = np.asarray(im).astype(float)
    pm = a.copy(); pm[..., :3] *= a[..., 3:4] / 255
    w, h = max(1, round(im.width * k)), max(1, round(im.height * k))
    ch = [Image.fromarray(pm[..., i].astype(np.float32), 'F').resize((w, h), Image.LANCZOS) for i in range(4)]
    out = np.dstack([np.asarray(c) for c in ch])
    al = np.clip(out[..., 3], 0, 255)
    rgb = np.where(al[..., None] > 0.5, out[..., :3] * 255 / np.maximum(al[..., None], 1e-3), 0)
    return np.dstack([np.clip(rgb, 0, 255), al]).astype(np.uint8)


def dat_o(rgba, px, py, size=O, day=DAY):
    o = np.zeros((size, size, 4), np.uint8)
    ox, oy = int(round(size / 2 - px)), int(round(day - py))
    h, w = rgba.shape[:2]
    y0, x0 = max(0, oy), max(0, ox)
    y1, x1 = min(size, oy + h), min(size, ox + w)
    cat = (y0 - oy > 0) or (x0 - ox > 0) or (y1 - oy < h) or (x1 - ox < w)
    if y1 > y0 and x1 > x0:
        src = rgba[y0 - oy:y1 - oy, x0 - ox:x1 - ox]
        o[y0:y1, x0:x1] = src
    # nếu bị cắt thì tính phần alpha mất
    mat = 0
    if cat:
        mat = int((rgba[..., 3] > 128).sum() - (o[..., 3] > 128).sum())
    return o, mat


def thu_nho(img512, n):
    return Image.fromarray(doi_co(np.asarray(img512), n / img512.width), 'RGBA')


def nen_xam(im, mau=(38, 40, 46)):
    bg = Image.new('RGBA', im.size, mau + (255,))
    bg.alpha_composite(im)
    return bg.convert('RGB')


def luu_gif(imgs, path, fps):
    fr = [nen_xam(i) for i in imgs]
    fr[0].save(path, save_all=True, append_images=fr[1:], duration=int(1000 / fps), loop=0)


def doc_anh(p):
    im = Image.open(p)
    if getattr(im, 'n_frames', 1) > 1:
        return [np.asarray(f.convert('RGB')) for f in ImageSequence.Iterator(im)]
    return [np.asarray(im.convert('RGB'))]


def mat_chuan(mau_goc):
    rgba = bo_nen(np.asarray(Image.open(mau_goc).convert('RGB')))
    hangs = tach_khung(rgba, 1)
    k = hangs[0][0]
    n, h, _ = do_mat(k['img'])
    return h, k['img'].shape[0]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('vao')
    ap.add_argument('--ra', required=True)
    ap.add_argument('--hang', type=int); ap.add_argument('--cot', type=int)
    ap.add_argument('--tach-hang', action='store_true', help='mỗi hàng là 1 animation: <ra>-1, <ra>-2 …')
    ap.add_argument('--bay', default='', help='số khung (1-based, toàn sheet) đang bay, vd 4,5,6')
    ap.add_argument('--tu-do-bay', action='store_true', help='tự coi khung có đáy cao hơn đất của hàng >5%% là bay')
    ap.add_argument('--ti-le', type=float, help='ép hệ số scale (bỏ qua đo mắt)')
    ap.add_argument('--mat', type=float, default=MAT_CHUAN, help='chiều cao mắt mong muốn trong ô 512')
    ap.add_argument('--fps', type=int, default=12)
    ap.add_argument('--json', help='ghi số đo ra file json')
    a = ap.parse_args()

    anh = doc_anh(a.vao)
    if len(anh) > 1:  # GIF: mỗi frame là 1 khung
        khung = []
        for i, f in enumerate(anh):
            rgba = bo_nen(f)
            hs = tach_khung(rgba, 1)
            k = hs[0][0] if len(hs[0]) == 1 else max(hs[0], key=lambda q: q['img'].shape[0] * q['img'].shape[1])
            k['hang'] = 0; khung.append(k)
        hangs = [khung]
    else:
        rgba = bo_nen(anh[0])
        hangs = tach_khung(rgba, a.hang, a.cot)
    ds = [k for hg in hangs for k in hg]
    for i, k in enumerate(ds):
        k['so'] = i + 1
    if a.hang and a.cot and len(ds) != a.hang * a.cot:
        print(f'CẢNH BÁO: tìm thấy {len(ds)} khung, mong {a.hang * a.cot}', file=sys.stderr)

    for k in ds:
        k['mat_n'], k['mat_h'], k['mat_y'] = do_mat(k['img'])
        k['px'], k['py'], k['n_ung'] = pivot_chan(k['img'])
    hm = [k['mat_h'] for k in ds if k['mat_h']]
    if a.ti_le:
        s = a.ti_le
    else:
        s = a.mat / float(np.percentile(hm, 75))  # lỗi dò mắt chỉ làm mắt NHỎ đi → lấy p75
    # khung bay: tự dò (đáy cao hơn mặt đất của hàng >5% chiều cao) + danh sách tay
    bay = {int(x) for x in a.bay.split(',') if x.strip()}
    for hg in hangs:
        dat = max(k['y0'] + k['img'].shape[0] for k in hg)
        hmed = np.median([k['img'].shape[0] for k in hg])
        for k in hg:
            k['bay'] = k['so'] in bay or (a.tu_do_bay and dat - (k['y0'] + k['img'].shape[0])) > 0.05 * hmed
    # đầu (đỉnh mũ) của khung đất → khung bay giữ đầu ngang khung đất gần nhất
    out = []
    for k in ds:
        sc = doi_co(k['img'], s)
        k['sc'] = sc
        px, py = k['px'] * s, k['py'] * s
        k['dinh'] = (np.where((sc[..., 3] > 128).any(1))[0].min()) - py  # đỉnh so với chân (âm)
        k['spx'], k['spy'] = px, py
    dat_list = [k for k in ds if not k['bay']]
    for k in ds:
        k['mat_rel'] = (k['mat_y'] * s - k['spy']) if k['mat_y'] is not None else None
    for k in ds:
        py = k['spy']
        if k['bay'] and dat_list:
            # khung đất kề bên: ưu tiên khung TRƯỚC gần nhất (đà nhảy), không có thì khung sau
            truoc = [q for q in dat_list if q['so'] < k['so']]
            gan = max(truoc, key=lambda q: q['so']) if truoc else min(dat_list, key=lambda q: q['so'])
            if k['mat_y'] is not None and gan['mat_rel'] is not None:
                py = k['mat_y'] * s - gan['mat_rel']      # mắt cùng độ cao
            else:
                dinh_y = np.where((k['sc'][..., 3] > 128).any(1))[0].min()
                py = dinh_y - gan['dinh']                 # đỉnh mũ cùng độ cao
            py = max(py, k['spy'])                        # không bao giờ kéo chân xuống dưới đất
            k['ke'] = gan['so']
        o, mat = dat_o(k['sc'], k['spx'], py)
        k['o'] = Image.fromarray(o, 'RGBA'); k['mat_px'] = mat
        k['lo_lung'] = int(round(py - k['spy']))

    # ghi
    def ghi(nhom, thu):
        os.makedirs(thu, exist_ok=True)
        for n in (256, 128):
            os.makedirs(os.path.join(thu, str(n)), exist_ok=True)
        for j, k in enumerate(nhom, 1):
            k['o'].save(os.path.join(thu, f'khung-{j}.png'), optimize=True)
            for n in (256, 128):
                thu_nho(k['o'], n).save(os.path.join(thu, str(n), f'khung-{j}.png'), optimize=True)
        luu_gif([thu_nho(k['o'], 256) for k in nhom], os.path.join(thu, 'xem-thu.gif'), a.fps)

    if a.tach_hang:
        for r, hg in enumerate(hangs, 1):
            ghi(hg, f'{a.ra}-{r}')
    else:
        ghi(ds, a.ra)

    so_do = dict(vao=a.vao, ti_le=round(s, 4), mat_p75=round(float(np.percentile(hm, 75)), 1) if hm else None,
                 khung=[dict(so=k['so'], hang=k['hang'] + 1, mat=k['mat_n'],
                             mat_h=round(k['mat_h'], 1) if k['mat_h'] else None,
                             ung=k['n_ung'], bay=bool(k['bay']), ke=k.get('ke'),
                             lo_lung_px=k['lo_lung'], bi_cat_px=k['mat_px'],
                             cao_512=int(k['sc'].shape[0]), rong_512=int(k['sc'].shape[1]))
                        for k in ds])
    for kk in so_do['khung']:
        print(kk)
    print('tỉ lệ', so_do['ti_le'], 'mắt p75', so_do['mat_p75'])
    if a.json:
        json.dump(so_do, open(a.json, 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
