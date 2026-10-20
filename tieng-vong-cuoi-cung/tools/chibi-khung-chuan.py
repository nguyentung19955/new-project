#!/usr/bin/env python3
"""Tách lại khung Lam với CỠ ĐỒNG NHẤT theo bề rộng mũ trùm (khung-chuan).

Vấn đề: idle (ép 0,585) đứng cao 344/512 còn run8 / combo / rut-dao tách theo chuẩn mắt chỉ cao ~262–296
→ đổi trạng thái là Lam co lại 10–15 %. Ở đây mỗi tấm nguồn có MỘT hệ số sao cho bề rộng mũ trùm
(trung vị các khung) bằng của idle.

Đo mũ trùm (xem do_mu): trung bình của căn diện tích vùng xanh chàm của mũ và khoảng mắt→đỉnh mũ.
Bề rộng bbox ngang (có chóp mũ) lệch theo dáng tới 15 % nên chỉ ghi tham khảo (mu_bbox). Combo bỏ hàng xoay khi đo.

Ra (KHÔNG ghi đè art/chibi/lam/khung/):
  art/chibi/lam/khung-chuan/<anim>/khung-N.png   ô 640×640, pivot (320, 620) = giữa đế ủng, đáy y=620
  art/chibi/lam/khung-chuan/khung-chuan.json      hệ số, số đo mũ, mốc từng khung (mắt, gót sau, đế, đỉnh)
  art/chibi/lam/khung-chuan/so-co-lam.png         idle/run/jump/combo/rut-dao cạnh nhau cùng đất
Ô 640 (không phải 512) vì phóng combo lên thì dao đâm dài bị cắt ở ô 512.
Tỉ lệ so với bộ khung cũ: 1 px ở ô 640 này = 1 px ở ô 512 cũ (cùng cỡ người), chỉ rộng lề hơn.

Chạy (từ tieng-vong-cuoi-cung/):  python3 tools/chibi-khung-chuan.py
"""
import importlib.util, json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(GOC)
_sp = importlib.util.spec_from_file_location('tk', 'tools/chibi-tach-khung.py')
tk = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(tk)

A = 'art/chibi/lam'
RA = A + '/khung-chuan'
O = 640
PX, DAY = O // 2, O - 20

# (tên, nguồn, hàng, cột, hệ số cố định hoặc None = khớp mũ idle, kiểu pivot, khung bay (1-based trong tấm))
TAM = [
    ('idle',    A + '/idle-6.png',   1, 6, 0.585, 'de',  []),
    ('jump',    A + '/jump-4.png',   1, 4, 0.522, 'de',  [2, 3, 4]),
    ('run8',    A + '/run-8.png',    1, 8, None,  'ung', []),
    ('combo',   A + '/combo-20.png', 5, 4, None,  'ung', [5, 6, 7, 8]),
    ('rut-dao', A + '/idle.gif',     None, None, None, 'ung', []),
]


def mat_xy(rgba):
    """tâm mắt lớn nhất (x, y) – giống tk.do_mat nhưng trả cả x; None nếu không thấy."""
    m = tk.mask_mat(rgba)
    m = ndi.binary_closing(m, structure=np.ones((5, 3)))
    lab, n = ndi.label(m)
    best = None
    H = rgba.shape[0]
    for i, s in enumerate(ndi.find_objects(lab), 1):
        h = s[0].stop - s[0].start; w = s[1].stop - s[1].start
        d = (lab[s] == i).sum()
        if d >= max(6, (H * 0.008) ** 2) and h >= w * 0.8 and h < H * 0.15:
            if best is None or d > best[0]:
                ys, xs = np.where(lab == i)
                best = (d, float(xs.mean()), float(ys.mean()), h)
    return None if best is None else best[1:]


def do_mu(rgba, ey):
    """cỡ mũ trùm (px của ảnh đưa vào) = trung bình của
    (a) bề rộng tương đương = căn bậc hai diện tích vùng xanh chàm từ đỉnh tới mắt + 30 % (đỉnh→mắt),
    (b) khoảng mắt → đỉnh mũ × 1,08 (quy về cùng cỡ với (a) trên idle).
    Không dùng bbox ngang vì chóp mũ đổi hướng theo dáng (combo nghiêng chóp ra sau → bbox to hơn thật 13–15 %)."""
    al = rgba[..., 3] > 128
    r, g, b = [rgba[..., i].astype(int) for i in range(3)]
    navy = al & (b > r + 12) & (b >= g - 5) & (r + g + b < 420)
    ys = np.where(al.any(1))[0]
    top = ys.min()
    a = np.sqrt(navy[top:int(ey + 0.3 * (ey - top))].sum())
    return float(0.5 * (a + 1.08 * (ey - top)))


def do_mu_bbox(rgba, ey):
    """bề rộng bbox mũ trùm (gồm chóp) – chỉ để tham khảo."""
    al = rgba[..., 3] > 128
    r, g, b = [rgba[..., i].astype(int) for i in range(3)]
    navy = al & (b > r + 12) & (b >= g - 5) & (r + g + b < 420)
    ys = np.where(al.any(1))[0]
    top = ys.min()
    y1 = int(ey + 0.5 * (ey - top))
    reg = navy[top:y1]
    lab, n = ndi.label(reg)
    if not n:
        return None
    sz = ndi.sum(reg, lab, range(1, n + 1))
    big = lab == (np.argmax(sz) + 1)
    xs = np.where(big.any(0))[0]
    return float(xs.max() - xs.min() + 1)


def tach(nguon, hang, cot):
    anh = tk.doc_anh(nguon)
    if len(anh) > 1:
        ds = []
        for f in anh:
            hs = tk.tach_khung(tk.bo_nen(f), 1)
            ds.append(max(hs[0], key=lambda q: q['img'].shape[0] * q['img'].shape[1]))
        return [ds]
    return tk.tach_khung(tk.bo_nen(anh[0]), hang, cot)


def got_sau(rgba, day):
    """gót chân sau (nhìn phải): x nhỏ nhất của alpha trong dải 3 % dưới cùng (sát đất)."""
    al = rgba[..., 3] > 128
    ys = np.where(al.any(1))[0]
    band = max(4, int((ys.max() - ys.min()) * 0.03))
    xs = np.where(al[int(day) - band:int(day) + 1].any(0))[0]
    return float(xs.min()) if len(xs) else None


def main():
    os.makedirs(RA, exist_ok=True)
    tam = {}
    for ten, nguon, hang, cot, s_co_dinh, kp, bay in TAM:
        hangs = tach(nguon, hang, cot)
        ds = [k for hg in hangs for k in hg]
        for i, k in enumerate(ds):
            k['so'] = i + 1
            m = mat_xy(k['img'])
            k['mat'] = m
            k['mu_src'] = do_mu(k['img'], m[1]) if m else None
            k['px'], k['py'], _ = tk.pivot_chan(k['img'], kp)
        # combo: bỏ hàng 2 (xoay, nhìn lưng/chính diện – mũ đo không so được)
        mus = [k['mu_src'] for k in ds if k['mu_src'] and not (ten == 'combo' and k.get('hang', 0) == 1)]
        tam[ten] = dict(ds=ds, hangs=hangs, s=s_co_dinh, mu_src_tv=float(np.median(mus)), bay=bay, nguon=nguon)
    mu_idle = tam['idle']['mu_src_tv'] * tam['idle']['s']
    # độ cao mắt dáng đứng idle so với đất → khung bay đặt mắt ở đây
    so_do = dict(chuan_mu_idle_512=round(mu_idle, 1), o=O, pivot=[PX, DAY], tam={})
    for ten, t in tam.items():
        if t['s'] is None:
            t['s'] = mu_idle / t['mu_src_tv']
    idle = tam['idle']
    E0 = float(np.median([(k['py'] - k['mat'][1]) * idle['s'] for k in idle['ds']]))
    so_do['mat_cao_idle'] = round(E0, 1)

    for ten, t in tam.items():
        s = t['s']
        ra_khung = []
        for k in t['ds']:
            sc = tk.doi_co(k['img'], s)
            px, py = k['px'] * s, k['py'] * s
            day = py
            if k['so'] in t['bay'] and k['mat']:
                day = max(py, k['mat'][1] * s + E0)       # mắt ngang mắt idle, không kéo chân xuống dưới đất
            o, cat = tk.dat_o(sc, px, day, size=O, day=DAY)
            dx, dy = PX - px, DAY - day                     # dời ảnh đã scale → ô
            mx, my = (k['mat'][0] * s + dx, k['mat'][1] * s + dy) if k['mat'] else (None, None)
            al = o[..., 3] > 128
            ys = np.where(al.any(1))[0]; xs = np.where(al.any(0))[0]
            got = got_sau(o, ys.max())
            mu = do_mu(o, my) if my else None
            mub = do_mu_bbox(o, my) if my else None
            ra_khung.append(dict(img=o, so=k['so'], hang=k.get('hang', 0) + 1,
                                 mat=[round(mx, 1), round(my, 1)] if mx is not None else None,
                                 got_sau=round(got, 1) if got is not None else None,
                                 de=[round(PX, 1), round(py + dy, 1)], bay=k['so'] in t['bay'],
                                 dinh=int(ys.min()), day=int(ys.max()), trai=int(xs.min()), phai=int(xs.max()),
                                 mu=round(mu, 1) if mu else None, mu_bbox=round(mub, 1) if mub else None, bi_cat=int(cat)))
        # ghi
        if ten == 'combo':
            nhom = {}
            for kk in ra_khung:
                nhom.setdefault('combo-%d' % kk['hang'], []).append(kk)
        else:
            nhom = {ten: ra_khung}
        for nm, ks in nhom.items():
            os.makedirs(os.path.join(RA, nm), exist_ok=True)
            for j, kk in enumerate(ks, 1):
                Image.fromarray(kk['img'], 'RGBA').save(os.path.join(RA, nm, 'khung-%d.png' % j), optimize=True)
            mus = [kk['mu'] for kk in ks if kk['mu']]
            so_do['tam'][nm] = dict(nguon=t['nguon'], he_so=round(s, 4), mu_trung_vi=round(float(np.median(mus)), 1),
                                    khung=[{k2: v for k2, v in kk.items() if k2 != 'img'} for kk in ks])
            print(nm, 'hệ số', round(s, 4), 'mũ TV', round(float(np.median(mus)), 1),
                  'cao', [kk['day'] - kk['dinh'] for kk in ks], 'cắt', [kk['bi_cat'] for kk in ks])
    json.dump(so_do, open(os.path.join(RA, 'khung-chuan.json'), 'w'), ensure_ascii=False, indent=1)

    # so-co-lam.png: idle/run/jump/combo/rut-dao cạnh nhau cùng đất
    chon = [('idle 1', 'idle', 1), ('run8 1', 'run8', 1), ('run8 3', 'run8', 3), ('jump 3', 'jump', 3),
            ('combo-3 1', 'combo-3', 1), ('combo-1 2', 'combo-1', 2), ('combo-5 1', 'combo-5', 1),
            ('rut-dao 1', 'rut-dao', 1), ('rut-dao 6', 'rut-dao', 6)]
    W1 = 300
    can = Image.new('RGBA', (W1 * len(chon), 560), (38, 40, 46, 255))
    d = ImageDraw.Draw(can)
    try:
        f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
    except Exception:
        f = ImageFont.load_default()
    nen_y = 470
    d.line([(0, nen_y), (can.width, nen_y)], fill=(225, 184, 90, 255), width=2)
    for i, (nhan, nm, so) in enumerate(chon):
        im = Image.open(os.path.join(RA, nm, 'khung-%d.png' % so))
        kk = so_do['tam'][nm]['khung'][so - 1]
        can.alpha_composite(im, (i * W1 + W1 // 2 - PX, nen_y - DAY))
        d.text((i * W1 + 10, 10), nhan, fill=(243, 230, 200, 255), font=f)
        d.text((i * W1 + 10, 34), 'mũ %s · TV tấm %s' % (kk['mu'], so_do['tam'][nm]['mu_trung_vi']), fill=(206, 240, 214, 255), font=f)
        d.text((i * W1 + 10, 58), 'hệ số %.3f' % so_do['tam'][nm]['he_so'], fill=(169, 179, 191, 255), font=f)
    d.text((10, 520), 'Cùng đất (vạch vàng). Cỡ mũ chuẩn = idle %.0f (căn diện tích mũ & mắt→đỉnh). Lệch cho phép ±3%%.' % mu_idle,
           fill=(243, 230, 200, 255), font=f)
    can.convert('RGB').save(os.path.join(RA, 'so-co-lam.png'), optimize=True)
    for nm, v in so_do['tam'].items():
        print('%-8s mũ %.1f  lệch %+.1f %%' % (nm, v['mu_trung_vi'], (v['mu_trung_vi'] / mu_idle - 1) * 100))


if __name__ == '__main__':
    main()
