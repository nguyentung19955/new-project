#!/usr/bin/env python3
"""Lô ảnh chibi 3: Lam run 8, Quái Chuông Gỗ (đi/tấn công/trúng/chết), boss Chuông Gác Làng, đồ vật.

Chạy (từ thư mục tieng-vong-cuoi-cung/):  python3 tools/chibi-batch-3.py
Lặp lại được: ghi đè đầu ra. Dùng lại tools/chibi-tach-khung.py (bỏ nền, đo mắt, đổi cỡ, đặt ô).
Số đo ghi ở art/chibi/bao-cao-3-so-do.json (BAO-CAO-3.md trích từ đây).
Chỉ ghi vào: art/chibi/lam/khung/run8*, art/chibi/lam/khung/so-sanh-run6-run8.gif,
art/chibi/quai/khung/{di,tan-cong,trung,chet}, art/chibi/quai/khung/so-sanh-goc.png,
art/chibi/boss/khung, art/chibi/do-vat/khung.
"""
import importlib.util, json, os, subprocess, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(GOC)
_sp = importlib.util.spec_from_file_location('tk', 'tools/chibi-tach-khung.py')
tk = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(tk)

SO_DO = {}


def doc_rgba(p):
    return tk.bo_nen(np.asarray(Image.open(p).convert('RGB')))


def xoa_lo_trang(rgba, vung=None, dien_min=150):
    """Lỗ trắng kín còn sót (vòng treo chuông, ô giữa khung chuông): xoá vùng gần trắng thuần, không chạm mép."""
    a = rgba[..., :3].astype(int)
    sat = a.max(-1) - a.min(-1)
    trang = (rgba[..., 3] > 0) & (a.min(-1) > 228) & (sat < 22)
    if vung is not None:
        m = np.zeros_like(trang); m[vung] = True; trang &= m
    lab, n = ndi.label(trang)
    out = rgba.copy()
    for i, s in enumerate(ndi.find_objects(lab), 1):
        mm = lab[s] == i
        if mm.sum() < dien_min:
            continue
        big = ndi.binary_dilation(lab == i, iterations=2)
        out[big & (a.min(-1) > 200) & (sat < 40), 3] = 0
    return out


def xoa_bui_trang(rgba):
    """Bụi xám-trắng mờ dưới đất (khung vỡ) + đốm alpha lẻ < 15 px."""
    a = rgba[..., :3].astype(int)
    sat = a.max(-1) - a.min(-1)
    out = rgba.copy()
    out[(a.min(-1) > 200) & (sat < 30), 3] = 0
    al = out[..., 3] > 0
    lab, n = ndi.label(al, structure=np.ones((3, 3)))
    if n:
        d = ndi.sum(al, lab, range(1, n + 1))
        nho = np.isin(lab, np.where(d < 15)[0] + 1)
        out[nho, 3] = 0
    return out


def bbox(rgba, t=128):
    al = rgba[..., 3] > t
    ys, xs = np.where(al)
    return ys.min(), ys.max() + 1, xs.min(), xs.max() + 1


def cat_vua(rgba, pad=2):
    y0, y1, x0, x1 = bbox(rgba, 8)
    return rgba[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad]


def nen_xam(im, mau=(38, 40, 46)):
    return tk.nen_xam(im, mau)


def gif(imgs, path, fps):
    tk.luu_gif(imgs, path, fps)


# ======================= 1. LAM RUN 8 =======================
def lam_run8():
    ra = 'art/chibi/lam/khung/run8'
    subprocess.run([sys.executable, 'tools/chibi-tach-khung.py', 'art/chibi/lam/run-8.png', '--hang', '1', '--cot', '8',
                    '--ra', ra, '--fps', '12', '--json', ra + '.json'], check=True, stdout=subprocess.DEVNULL)
    sd = json.load(open(ra + '.json'))
    SO_DO['run8'] = dict(ti_le=sd['ti_le'], mat_p75=sd['mat_p75'], **danh_gia(ra, 8))
    SO_DO['run6_cu'] = danh_gia('art/chibi/lam/khung/run', 6)
    _so_sanh(ra)


def danh_gia(ra, so):
    # đánh giá mượt trên khung 512 đã đặt ô: độ cao mắt & đỉnh mũ so với đất (y=500)
    dg = []
    for i in range(1, so + 1):
        o = np.asarray(Image.open(f'{ra}/khung-{i}.png'))
        n, h, my = tk.do_mat(o)
        y0 = bbox(o)[0]
        # chân trước/sau: x của 2 đốm ủng thấp nhất so với pivot 256
        m = tk.mask_ung(o); m[:int(500 - 0.4 * (500 - y0))] = False
        m = ndi.binary_closing(m, iterations=3)
        lab, k = ndi.label(m)
        chan = []
        if k:
            dien = ndi.sum(m, lab, range(1, k + 1))
            for j in np.argsort(dien)[::-1][:2]:
                yy, xx = np.where(lab == j + 1)
                chan.append(dict(x=round(float(xx.mean()) - 256, 1), day=int(yy.max())))
        chan.sort(key=lambda c: c['x'])
        dg.append(dict(khung=i, mat_tren_dat=round(500 - my, 1) if my else None, dinh_tren_dat=int(500 - y0),
                       chan_sau=chan[0] if chan else None, chan_truoc=chan[-1] if len(chan) > 1 else None))
    mats = [d['mat_tren_dat'] for d in dg if d['mat_tren_dat']]
    dinhs = [d['dinh_tren_dat'] for d in dg]
    tb = float(np.mean(mats))
    return dict(khung=dg,
                         mat_lech_max_pct=round(100 * max(abs(m - tb) for m in mats) / tb, 2),
                         dinh_lech_max_pct=round(100 * (max(dinhs) - min(dinhs)) / np.mean(dinhs), 2),
                         mat_tb=round(tb, 1))


def _so_sanh(ra):
    # so sánh run6 | run8 cạnh nhau, 12 FPS, 24 khung (BCNN 6, 8)
    r6 = [Image.open(f'art/chibi/lam/khung/run/256/khung-{i}.png') for i in range(1, 7)]
    r8 = [Image.open(f'{ra}/256/khung-{i}.png') for i in range(1, 9)]
    fr = []
    for t in range(24):
        c = Image.new('RGBA', (512, 256), (38, 40, 46, 255))
        c.alpha_composite(r6[t % 6], (0, 0)); c.alpha_composite(r8[t % 8], (256, 0))
        fr.append(c)
    fr = [f.convert('RGB') for f in fr]
    from PIL import ImageDraw
    for f in fr:
        d = ImageDraw.Draw(f)
        d.text((6, 4), 'run-6 (cu)', fill=(220, 220, 220)); d.text((262, 4), 'run-8 (moi)', fill=(220, 220, 220))
        d.line([(256, 0), (256, 255)], fill=(90, 90, 100))
        d.line([(0, 250), (511, 250)], fill=(70, 70, 80))
    fr[0].save('art/chibi/lam/khung/so-sanh-run6-run8.gif', save_all=True, append_images=fr[1:],
               duration=int(1000 / 12), loop=0)


# ======================= 2. QUÁI =======================
def mat_quai(img):
    """Mắt quái: đốm vàng sáng lớn nhất → (chiều cao, diện tích)."""
    a = img[..., :3].astype(int); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = (img[..., 3] > 200) & (r > 215) & (g > 180) & (r - b > 40)
    m = ndi.binary_opening(m)
    lab, n = ndi.label(m)
    if not n:
        return None
    d = ndi.sum(m, lab, range(1, n + 1)); i = int(np.argmax(d))
    s = ndi.find_objects(lab)[i]
    return s[0].stop - s[0].start, float(d[i])


def vong_quai(img):
    """Bề rộng ngoài vòng treo trên đỉnh chuông (dải trên cùng, trước khi tới nắp)."""
    al = img[..., 3] > 128
    ys = np.where(al.any(1))[0]; top, day = ys[0], ys[-1]
    ws = []
    for y in range(top, top + int(0.12 * (day - top))):
        xs = np.where(al[y])[0]; ws.append(xs[-1] - xs[0])
    return int(max(ws))


def pivot_quai(img, phan=0.13):
    """x giữa hai bàn chân = tâm 2 đốm lớn nhất trong dải dưới cùng; y = đáy các đốm đó."""
    al = img[..., 3] > 128
    ys = np.where(al.any(1))[0]; top, day = ys[0], ys[-1]
    lim = int(day - phan * (day - top))
    m = al.copy(); m[:lim] = False
    lab, n = ndi.label(m)
    d = ndi.sum(m, lab, range(1, n + 1))
    od = np.argsort(d)[::-1]
    chon = [od[0] + 1] + ([od[1] + 1] if n > 1 and d[od[1]] > 0.25 * d[od[0]] else [])
    xs, days = [], []
    for i in chon:
        yy, xx = np.where(lab == i)
        xs.append(xx.mean()); days.append(yy.max())
    return float(np.mean(xs)), float(max(days)), len(chon)


def tach_cot(rgba, so):
    """Tách sheet 1 hàng thành `so` khung theo VÙNG CỘT: ranh giới = cột thưa nhất giữa hai thân chính.
    Mọi mảnh rời thuộc khung có cột chứa tâm mảnh → mảnh vụn không nhảy sang khung bên."""
    al = rgba[..., 3] > 128
    lab, n = ndi.label(al, structure=np.ones((3, 3)))
    d = ndi.sum(al, lab, range(1, n + 1))
    sl = ndi.find_objects(lab)
    chinh = sorted(np.argsort(d)[::-1][:so], key=lambda i: sl[i][1].start)
    cx = [(sl[i][1].start + sl[i][1].stop) / 2 for i in chinh]
    proj = ndi.uniform_filter1d(al.sum(0).astype(float), 9)
    ranh = [0]
    for a, b in zip(cx[:-1], cx[1:]):
        # tìm trong khoảng giữa mép phải thân trái và mép trái thân phải (nếu chồng thì giữa 2 tâm)
        ia, ib = chinh[cx.index(a)], chinh[cx.index(b)]
        lo, hi = sl[ia][1].stop, sl[ib][1].start
        if hi <= lo:
            lo, hi = int(a), int(b)
        ranh.append(int(lo + np.argmin(proj[lo:hi])))
    ranh.append(rgba.shape[1])
    out = []
    tam = ndi.center_of_mass(al, lab, range(1, n + 1))
    for c in range(so):
        ids = [i + 1 for i in range(n) if ranh[c] <= tam[i][1] < ranh[c + 1]]
        m = np.isin(lab, ids)
        k = rgba.copy(); k[~m, 3] = 0
        y0, y1, x0, x1 = bbox(k, 1)
        out.append(dict(img=k[y0:y1, x0:x1], x0=x0, y0=y0, ranh=(ranh[c], ranh[c + 1]), so_manh=len(ids)))
    return out


def tach_thuong(rgba, so):
    hs = tk.tach_khung(rgba, 1)
    ds = hs[0]
    assert len(ds) == so, (len(ds), so)
    return [dict(img=xoa_bui_trang(k['img']), x0=k['x0'], y0=k['y0']) for k in ds]


QUAI_O = 512
QUAI_DAY = 500
QUAI_CAO_512 = 360          # chiều cao trung bình khung ĐI trong ô 512 (384 thì nắm đấm tấn công 3 bị cắt)
QUAI_CAO_GAME = 120         # → ô game round(512·120/360) = 171


def quai():
    tam = {}
    for ten, p, so, cot in [('di', 'di-4.png', 4, False), ('tan-cong', 'tan-cong-4.png', 4, False),
                            ('trung-chet', 'trung-chet-5.png', 5, True)]:
        rgba = xoa_lo_trang(doc_rgba('art/chibi/quai/' + p))
        rgba = xoa_bui_trang(rgba)
        tam[ten] = tach_cot(rgba, so) if cot else tach_thuong(rgba, so)
    goc_rgba = xoa_lo_trang(doc_rgba('art/chibi/quai/quai-chuong-go.png'))
    goc = cat_vua(goc_rgba, 0)
    # --- đo: mắt + vòng treo, tấm nào cũng đo; so với ảnh gốc
    do = {}
    for ten, ks in tam.items():
        do[ten] = []
        for k in ks:
            mq = mat_quai(k['img'])
            do[ten].append(dict(cao=int(k['img'].shape[0]), mat_h=mq[0] if mq else None,
                                mat_dien=mq[1] if mq else None, vong=vong_quai(k['img'])))
    mg = mat_quai(goc)
    do_goc = dict(cao=int(goc.shape[0]), mat_h=mg[0], mat_dien=mg[1], vong=vong_quai(goc))
    # tỉ số gốc/tấm, đo trên tấm ĐI (4 khung đứng, đủ mắt + vòng)
    di = do['di']
    r_mat = do_goc['mat_h'] / np.median([d['mat_h'] for d in di])
    r_matd = np.sqrt(do_goc['mat_dien'] / np.median([d['mat_dien'] for d in di]))
    r_vong = do_goc['vong'] / np.median([d['vong'] for d in di])
    r_goc = float(np.mean([r_mat, r_matd, r_vong]))
    # kiểm tra tấm tấn công / trúng có cùng cỡ với tấm đi (khung đứng thẳng: tấn công 4, trúng-chết 2)
    kiem = dict(
        tan_cong_k4_vs_di=dict(cao=round(do['tan-cong'][3]['cao'] / np.median([d['cao'] for d in di]), 3),
                               vong=round(do['tan-cong'][3]['vong'] / np.median([d['vong'] for d in di]), 3),
                               mat=round(do['tan-cong'][3]['mat_h'] / np.median([d['mat_h'] for d in di]), 3)),
        trung_k1_vs_di=dict(vong=round(do['trung-chet'][0]['vong'] / np.median([d['vong'] for d in di]), 3)),
    )
    s = QUAI_CAO_512 / float(np.mean([d['cao'] for d in di]))   # MỘT hệ số cho cả 3 tấm
    s_goc = s / r_goc                                            # hệ số tương đương cho quai-chuong-go.png
    o_game = int(round(QUAI_O * QUAI_CAO_GAME / QUAI_CAO_512))
    g = o_game / QUAI_O                                          # hệ số thật (ô nguyên)
    SO_DO['quai'] = dict(ti_le_tam=round(s, 4), ti_le_anh_goc=round(s_goc, 4), goc_chia_tam=round(r_goc, 3),
                         goc_chia_tam_chi_tiet=dict(mat_cao=round(r_mat, 3), mat_dien_tich=round(r_matd, 3),
                                                    vong=round(r_vong, 3)),
                         kiem_cung_co=kiem, do_goc=do_goc, do=do, he_so_game=g, o_game=o_game,
                         goc_cao_512=round(goc.shape[0] * s_goc, 1))
    # --- đặt ô
    nhom = {'di': tam['di'], 'tan-cong': tam['tan-cong'], 'trung': tam['trung-chet'][:1],
            'chet': tam['trung-chet'][1:]}
    fps = {'di': 8, 'tan-cong': 10, 'trung': 10, 'chet': 10}
    pv_prev = None
    thong_tin = {}
    for ten, ks in nhom.items():
        thu = f'art/chibi/quai/khung/{ten}'
        os.makedirs(f'{thu}/game', exist_ok=True)
        anh, tt = [], []
        for j, k in enumerate(ks, 1):
            sc = tk.doi_co(k['img'], s)
            if ten == 'chet' and j >= 3:
                # đống vụn (chết 3, 4): không còn bàn chân → x = tâm khối dải dưới 25%, y = đáy thân chính
                al = sc[..., 3] > 128
                ys = np.where(al.any(1))[0]
                band = al.copy(); band[:int(ys[-1] - 0.25 * (ys[-1] - ys[0]))] = False
                px = float(np.where(band)[1].mean()); py = float(ys[-1]); nchan = 0
                cach = 'tâm khối dải dưới'
            else:
                px, py, nchan = pivot_quai(sc)
                cach = 'giữa 2 bàn chân' if nchan == 2 else 'bàn chân lớn nhất'
            o, mat = tk.dat_o(sc, px, py, QUAI_O, QUAI_DAY)
            im = Image.fromarray(o, 'RGBA')
            im.save(f'{thu}/khung-{j}.png', optimize=True)
            tk.thu_nho(im, o_game).save(f'{thu}/game/khung-{j}.png', optimize=True)
            y0, y1, x0, x1 = bbox(o)
            tt.append(dict(khung=j, pivot=cach, bi_cat_px=mat, cao_512=int(y1 - y0),
                           trai_pivot_512=int(256 - x0), phai_pivot_512=int(x1 - 256),
                           cao_game=round((y1 - y0) * g, 1), trai_pivot_game=round((256 - x0) * g, 1),
                           so_manh=k.get('so_manh')))
            anh.append(im)
        gif([tk.thu_nho(i, 256) for i in anh], f'{thu}/xem-thu.gif', fps[ten])
        thong_tin[ten] = tt
    # trúng + chết nối nhau để xem cả đoạn
    tc = [Image.open(f'art/chibi/quai/khung/trung/khung-1.png')] + \
         [Image.open(f'art/chibi/quai/khung/chet/khung-{j}.png') for j in range(1, 5)]
    gif([tk.thu_nho(i, 256) for i in tc] + [tk.thu_nho(tc[-1], 256)] * 4,
        'art/chibi/quai/khung/chet/xem-thu-trung-chet.gif', 10)
    SO_DO['quai']['khung'] = thong_tin
    # khung đấm chạm: tấn công 3 (tay duỗi hết) — tầm với tính từ pivot, quái nhìn sang TRÁI
    SO_DO['quai']['hit'] = dict(khung=3, tam_voi_trai_game_px=thong_tin['tan-cong'][2]['trai_pivot_game'],
                                tam_voi_trai_512=thong_tin['tan-cong'][2]['trai_pivot_512'])
    # so sánh với ảnh gốc ở cùng tỉ lệ
    gsc = tk.doi_co(goc, s_goc)
    px, py, _ = pivot_quai(gsc)
    o, _ = tk.dat_o(gsc, px, py, QUAI_O, QUAI_DAY)
    c = Image.new('RGBA', (1024, 512), (38, 40, 46, 255))
    c.alpha_composite(Image.fromarray(o, 'RGBA'), (0, 0))
    c.alpha_composite(Image.open('art/chibi/quai/khung/di/khung-1.png'), (512, 0))
    from PIL import ImageDraw
    d = ImageDraw.Draw(c)
    d.line([(0, QUAI_DAY), (1023, QUAI_DAY)], fill=(120, 120, 130))
    d.text((8, 6), 'quai-chuong-go.png (goc) cung ti le', fill=(230, 230, 230))
    d.text((520, 6), 'di khung 1', fill=(230, 230, 230))
    c.convert('RGB').save('art/chibi/quai/khung/so-sanh-goc.png')


# ======================= 3. BOSS =======================
BOSS_O = 1024
BOSS_DAY = 1000
BOSS_CAO_O = 820
BOSS_CAO_GAME = 330


def boss():
    rgba = xoa_lo_trang(doc_rgba('art/chibi/boss/chuong-gac-lang.png'))
    rgba = xoa_bui_trang(rgba)
    img = cat_vua(rgba, 0)
    s = BOSS_CAO_O / img.shape[0]
    sc = tk.doi_co(img, s)
    px, py, n = pivot_quai(sc, 0.10)
    o, mat = tk.dat_o(sc, px, py, BOSS_O, BOSS_DAY)
    thu = 'art/chibi/boss/khung'
    os.makedirs(f'{thu}/game', exist_ok=True); os.makedirs(f'{thu}/tam-tho/game', exist_ok=True)  # TẠM: chỉ lưu cỡ game (bản 1024 = biến dạng của dung.png)
    im = Image.fromarray(o, 'RGBA'); im.save(f'{thu}/dung.png', optimize=True)
    o_game = int(round(BOSS_O * BOSS_CAO_GAME / BOSS_CAO_O))
    g = o_game / BOSS_O
    tk.thu_nho(im, o_game).save(f'{thu}/game/dung.png', optimize=True)
    y0, y1, x0, x1 = bbox(o)
    # TẠM: thở/nhún bằng co giãn quanh pivot (đáy giữa chân), 6 khung
    fr = []
    A = np.asarray(im)
    for j in range(6):
        ph = np.sin(2 * np.pi * j / 6)
        sy, sx = 1 + 0.025 * ph, 1 - 0.012 * ph
        w, h = int(round(BOSS_O * sx)), int(round(BOSS_O * sy))
        r = tk.doi_co(A, 1)  # bản sao
        pm = Image.fromarray(r, 'RGBA')
        # co giãn theo 2 trục riêng: dùng doi_co cho từng trục qua resize premultiplied
        a = r.astype(float); a[..., :3] *= a[..., 3:4] / 255
        ch = [Image.fromarray(a[..., i].astype(np.float32), 'F').resize((w, h), Image.LANCZOS) for i in range(4)]
        q = np.dstack([np.asarray(c) for c in ch]); al = np.clip(q[..., 3], 0, 255)
        rgb = np.where(al[..., None] > 0.5, q[..., :3] * 255 / np.maximum(al[..., None], 1e-3), 0)
        q = np.dstack([np.clip(rgb, 0, 255), al]).astype(np.uint8)
        out, _ = tk.dat_o(q, 512 * sx, BOSS_DAY * sy, BOSS_O, BOSS_DAY)
        f = Image.fromarray(out, 'RGBA'); fr.append(f)
        tk.thu_nho(f, o_game).save(f'{thu}/tam-tho/game/khung-{j + 1}.png', optimize=True)
    gif([tk.thu_nho(f, 384) for f in fr], f'{thu}/tam-tho/xem-thu.gif', 6)
    SO_DO['boss'] = dict(ti_le=round(s, 4), pivot='giữa 2 bàn chân' if n == 2 else 'bàn chân lớn nhất',
                         bi_cat_px=mat, cao_o=int(y1 - y0), rong_o=int(x1 - x0),
                         trai_pivot_o=int(512 - x0), phai_pivot_o=int(x1 - 512),
                         he_so_game=round(g, 4), o_game=o_game, cao_game=round((y1 - y0) * g, 1),
                         rong_game=round((x1 - x0) * g, 1))


# ======================= 4. ĐỒ VẬT =======================
DO_VAT = [  # (tên, nhóm cùng tỉ lệ)
    ('cong-tac-nho', 'cong-tac'), ('cong-tac-lun', 'cong-tac'),
    ('diem-luu-tat', 'diem-luu'), ('diem-luu-sang', 'diem-luu'),
    ('cong-dong', 'cong'), ('cong-mo', 'cong'), ('den-long', 'den'),
]
CO_GAME = {'cong-tac': ('rong', 64), 'diem-luu': ('cao', 160), 'cong': ('cao', 192), 'den': ('cao', 48)}


def do_vat():
    rgba = doc_rgba('art/chibi/do-vat/do-vat.png')
    hs = tk.tach_khung(rgba, 2)
    # hàng trên: công tắc nhô, lún, điểm lưu tắt, sáng ; hàng dưới: cổng đóng, mở, đèn
    ds = hs[0] + hs[1]
    assert len(ds) == 7, len(ds)
    thu = 'art/chibi/do-vat/khung'
    os.makedirs(f'{thu}/game', exist_ok=True)
    anh = {}
    for (ten, nh), k in zip(DO_VAT, ds):
        im = k['img']
        if ten == 'diem-luu-tat':
            # ô trống giữa khung chuông (nền trắng bị kẹt) → trong suốt
            im = xoa_lo_trang(im, dien_min=400)
        anh[ten] = cat_vua(im, 0)
    meta = {}
    nhom = {}
    for ten, nh in DO_VAT:
        nhom.setdefault(nh, []).append(ten)
    for nh, tens in nhom.items():
        truc, gia_tri = CO_GAME[nh]
        goc = anh[tens[0]]
        s = gia_tri / (goc.shape[1] if truc == 'rong' else goc.shape[0])
        W = max(anh[t].shape[1] for t in tens); H = max(anh[t].shape[0] for t in tens)
        for t in tens:
            a = anh[t]
            # ô chung cho cả nhóm, đáy giữa thẳng hàng
            o = np.zeros((H + 4, W + 4, 4), np.uint8)
            ox = (W + 4 - a.shape[1]) // 2; oy = H + 2 - a.shape[0]
            o[oy:oy + a.shape[0], ox:ox + a.shape[1]] = a
            Image.fromarray(o, 'RGBA').save(f'{thu}/{t}.png', optimize=True)
            gw, gh = max(1, round((W + 4) * s)), max(1, round((H + 4) * s))
            gim = Image.fromarray(tk.doi_co(o, gw / (W + 4)), 'RGBA')
            gim.save(f'{thu}/game/{t}.png', optimize=True)
            ga = np.asarray(gim)
            y0, y1, x0, x1 = bbox(ga, 64)
            meta[t] = dict(anh=f'khung/{t}.png', anh_game=f'khung/game/{t}.png',
                           co_goc=[int(o.shape[1]), int(o.shape[0])], co_game=[int(ga.shape[1]), int(ga.shape[0])],
                           ti_le_game=round(gw / (W + 4), 4),
                           pivot_goc=[int(o.shape[1] // 2), int(H + 2)],
                           pivot_game=[int(ga.shape[1] // 2), int(round((H + 2) * gw / (W + 4)))],
                           hinh_game=dict(rong=int(x1 - x0), cao=int(y1 - y0)))
    # vùng va chạm cổng đóng: cả bề ngang 2 cột (cột phủ ≥ 50% chiều cao), từ đỉnh xà tới đất; toạ độ game so với pivot
    ga = np.asarray(Image.open(f'{thu}/game/cong-dong.png'))
    al = ga[..., 3] > 128
    py = meta['cong-dong']['pivot_game'][1]; pxp = meta['cong-dong']['pivot_game'][0]
    phu = al[:py].mean(0)
    cot = np.where(phu > 0.5)[0]
    # đỉnh xà ngang: hàng đầu tiên mà ≥ 60% bề rộng giữa hai cột có hình
    x0, x1 = int(cot.min()), int(cot.max()) + 1
    hang = np.where(al[:, x0:x1].mean(1) > 0.6)[0]
    ytop = int(hang.min())
    meta['cong-dong']['va_cham'] = dict(x=x0 - pxp, y=ytop - py, w=x1 - x0, h=py - ytop,
                                        ghi_chu='hộp chữ nhật, toạ độ game px so với pivot (đáy giữa); y âm = lên trên')
    # cổng mở: chỉ hai cột (tuỳ chọn) — đi qua được ở giữa
    gm = np.asarray(Image.open(f'{thu}/game/cong-mo.png'))[..., 3] > 128
    pym = meta['cong-mo']['pivot_game'][1]; pxm = meta['cong-mo']['pivot_game'][0]
    phu = gm[:pym].mean(0)
    cot = np.where(phu > 0.5)[0]
    nhom_cot = np.split(cot, np.where(np.diff(cot) > 1)[0] + 1)
    meta['cong-mo']['va_cham'] = [dict(x=int(c.min()) - pxm, y=-int(phu[c].max() * pym), w=int(len(c)),
                                       h=int(phu[c].max() * pym)) for c in nhom_cot if len(c) > 2]
    meta['cong-mo']['ghi_chu'] = 'va_cham = 2 cột (tuỳ chọn, có thể bỏ để đi xuyên); lỗ giữa đi qua được'
    json.dump(dict(ghi_chu='pivot = đáy giữa; co_* = [rộng, cao]; ảnh game đã thu nhỏ sẵn theo ti_le_game',
                   do_vat=meta), open('art/chibi/do-vat/do-vat.json', 'w'), ensure_ascii=False, indent=1)
    SO_DO['do_vat'] = meta
    # bảng xem nhanh
    W = sum(Image.open(f'{thu}/game/{t}.png').width + 16 for t, _ in DO_VAT) + 16
    c = Image.new('RGBA', (W, 240), (38, 40, 46, 255)); x = 16
    for t, _ in DO_VAT:
        g = Image.open(f'{thu}/game/{t}.png'); c.alpha_composite(g, (x, 220 - meta[t]['pivot_game'][1])); x += g.width + 16
    from PIL import ImageDraw
    ImageDraw.Draw(c).line([(0, 220), (W, 220)], fill=(120, 120, 130))
    c.convert('RGB').save(f'{thu}/xem-co-game.png')


if __name__ == '__main__':
    lam_run8(); print('run8 xong')
    quai(); print('quái xong')
    boss(); print('boss xong')
    do_vat(); print('đồ vật xong')
    json.dump(SO_DO, open('art/chibi/bao-cao-3-so-do.json', 'w'), ensure_ascii=False, indent=1,
              default=lambda o: o.item() if hasattr(o, 'item') else str(o))
