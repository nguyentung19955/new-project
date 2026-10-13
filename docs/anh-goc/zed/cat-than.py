#!/usr/bin/env python3
"""CẮT THÂN ZED Ở THẮT LƯNG — chạy + chém (13/10/2026, docs/review/ke-hoach-cai-thien/zed-chay-danh/YEU-CAU.md mục C).

Chạy lại được:  python3 docs/anh-goc/zed/cat-than.py
Đọc:  game/art/custom/zed-{moi,rung,bien,lau}.sprite.json  (tấm thân ĐÃ DỰNG bởi dung-zed-game.py — script này KHÔNG sửa tấm,
      KHÔNG đụng BO_KHAC / dung_bo của dung-zed-game.py; chỉ đo trên tấm rồi xuất dữ liệu riêng)
Ghi:  game/js/zed_eo_data.js   G.ZED_EO = { phien_ban, hang: [...], bo: { moi|rung|bien|lau: { <động tác>: [[y, x], ...] } },
                                 loai: {...}, ghi_chu }
      docs/review/ke-hoach-cai-thien/zed-chay-danh/ghep-eo-<bo>.png   ảnh xem trước (dựng y như game ghép)

CÁCH GHÉP (game/js/zed_moi.js, khi đang chạy mà ra đòn ở một hàng có trong ZED_EO.hang):
  - Nửa DƯỚI (chân, từ dưới đai trở xuống) = khung CHẠY hiện tại (nhịp chân không đổi, P.chayT), hàng 'chay' của tấm.
  - Nửa TRÊN (đai + thân + đầu + tay; vũ khí và nắm tay theo neo khung đòn) = khung ĐÒN hiện tại.
  - Hai nửa khớp nhau tại ĐIỂM EO của từng khung: [y, x] trong ô 96×96 nguồn (chân ở 48,90):
      y = hàng dưới cùng của dải đai (đường cắt: nửa trên lấy các hàng <= y của khung đòn, nửa dưới lấy các hàng > y của khung chạy)
      x = tâm hông ngay dưới đai (trung bình tâm đoạn liền dài nhất của quần trên 3 hàng ngay dưới đai; bỏ da tay và màu đai)
    Nửa trên dời (dx, dy) = (x_chạy − x_đòn, y_chạy − y_đòn) điểm ảnh nguồn (số nguyên → nửa điểm ảnh game, không làm mờ).
  - Không đổi cỡ, gốc (24,45), neo chân, tỉ lệ: chỉ dời nguyên khối nửa trên. Chân vẫn đứng đúng neo của khung chạy.
DÒ ĐAI TỰ ĐỘNG (từng khung, từng bộ):
  - màu đai theo bộ (MAU_DAI): ninja đỏ, Rừng vàng, Biển xanh ngọc, Lâu đài vạt áo đỏ (đai da nằm ngay trên vạt);
  - chỉ tìm trong dải [chân − 34, chân − 12] (bỏ ngực, tay, bàn chân);
  - mép trên đai = hàng cao nhất mà nó và hàng dưới đều có ≥ 2 điểm màu đai (nút / đuôi đai rủ xuống nằm dưới nên không làm lệch);
    đường cắt y = mép trên + DAY_DAI − 1.
  - Không thấy đai (hoặc lệch > LECH_TOI_DA so với bộ ninja cùng khung) → dùng điểm eo của bộ ninja cùng khung, ghi vào 'loai'.
HÀNG ĐƯỢC GHÉP (thân trên thẳng): HANG_EO. Hàng cúi/khuỵu (kiếm 3, búa, quét, đặc biệt…) KHÔNG ghép: game vẽ toàn thân hàng đòn.
"""
import base64, io, json, os
import numpy as np
from PIL import Image

DAY = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.abspath(os.path.join(DAY, '..', '..', '..'))
CUSTOM = os.path.join(GOC, 'game', 'art', 'custom')
RA_JS = os.path.join(GOC, 'game', 'js', 'zed_eo_data.js')
RA_XEM = os.path.join(GOC, 'docs', 'review', 'ke-hoach-cai-thien', 'zed-chay-danh')
BO = {'moi': 'zed-moi', 'rung': 'zed-rung', 'bien': 'zed-bien', 'lau': 'zed-lau'}
O = 96
CHAN_Y = 90
# Hàng thân trên thẳng được ghép eo khi chạy (YEU-CAU mục C). Giữ đà (thuong_giu, phitieu_ngam) cũng thẳng người: ghép để chạy chậm
# lúc lấy đà không trượt chân.
HANG_EO = ['kiem_1', 'kiem_2', 'thuong_1', 'thuong_2', 'thuong_3', 'phitieu', 'phitieu_chum', 'phitieu_ngam', 'thuong_giu', 'dam', 'chuong']
LECH_TOI_DA = 4  # điểm ảnh nguồn
VUNG_TREN = {'lau': 29}  # Lâu đài: ngực áo giáp cũng đỏ → bắt đầu tìm thấp hơn (dưới ngực)
DAY_DAI = 3      # bề dày dải đai (điểm ảnh nguồn, đo trên tấm đứng)


def hsv(a):
    rgb = a[..., :3].astype(float) / 255
    mx, mn = rgb.max(-1), rgb.min(-1)
    d = mx - mn
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    dd = np.maximum(d, 1e-6)
    h = np.where(mx == r, ((g - b) / dd) % 6, np.where(mx == g, (b - r) / dd + 2, (r - g) / dd + 4)) * 60
    return np.where(d > 1e-6, h, 0), s, mx


def da(a):  # da người (bàn tay, cẳng tay): nới hơn da() của dung-zed-game.py vì tấm đã co nhỏ
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return (r > 150) & (g > 90) & (b > 60) & (r - b > 40)


def gan_hue(h, c, w):
    return np.abs(((h - c) + 180) % 360 - 180) < w


MAU_DAI = {
    'moi': lambda h, s, v: gan_hue(h, 355, 18) & (s > 0.5) & (v > 0.3),
    'rung': lambda h, s, v: gan_hue(h, 48, 14) & (s > 0.55) & (v > 0.55),
    'bien': lambda h, s, v: gan_hue(h, 188, 10) & (s > 0.5) & (v > 0.6),
    'lau': lambda h, s, v: gan_hue(h, 358, 16) & (s > 0.55) & (v > 0.35),
}


def doc_tam(ma):
    d = json.load(open(os.path.join(CUSTOM, ma + '.sprite.json'), encoding='utf-8'))
    im = Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',', 1)[1]))).convert('RGBA')
    return d, np.array(im)


def khung(a, hang, i):
    return a[hang * O:(hang + 1) * O, i * O:(i + 1) * O]


def do_eo(f, bo):
    """Điểm eo [y, x] của một khung 96×96, hoặc None nếu không thấy đai."""
    al = f[..., 3] > 100
    if not al.any():
        return None
    h, s, v = hsv(f)
    m = al & MAU_DAI[bo](h, s, v) & ~da(f)
    z0 = CHAN_Y - VUNG_TREN.get(bo, 34)
    m[:z0] = False
    m[CHAN_Y - 12:] = False
    dem = m.sum(1)
    y0 = next((r for r in range(z0, CHAN_Y - 13) if dem[r] >= 2 and dem[r + 1] >= 2), None)
    if y0 is None:
        return None
    y = y0 + DAY_DAI - 1  # mép trên đai ổn định (nút, đuôi đai rủ xuống bên dưới) → đường cắt = mép trên + bề dày đai
    # tâm hông: 3 hàng ngay dưới đai, điểm đặc không phải da, không phải màu đai, đoạn liền dài nhất
    q = al & ~da(f) & ~MAU_DAI[bo](h, s, v)
    tam = []
    for yy in range(y + 1, min(O, y + 4)):
        row = q[yy]
        best, bl, j = None, 0, 0
        while j < O:
            if row[j]:
                j0 = j
                while j < O and row[j]:
                    j += 1
                if j - j0 > bl:
                    bl, best = j - j0, (j0 + j - 1) / 2
            else:
                j += 1
        if best is not None and bl >= 4:
            tam.append(best)
    if not tam:
        return None
    return [int(y), int(round(float(np.mean(tam))))]


def main():
    tam = {b: doc_tam(ma) for b, ma in BO.items()}
    D0 = tam['moi'][0]['dong_tac']
    hang = ['chay'] + [k for k in HANG_EO if k in D0]
    ra, loai = {}, {}
    for b in BO:
        d, a = tam[b]
        ra[b] = {}
        for ten in hang:
            dt = d['dong_tac'][ten]
            ds = []
            for i in range(dt['so']):
                e = do_eo(khung(a, dt['hang'], i), b)
                ds.append(e)
            ra[b][ten] = ds
    # đối chiếu bộ ninja: khung không đo được / lệch quá → dùng điểm của ninja cùng khung
    for b in BO:
        for ten in hang:
            for i, e in enumerate(ra[b][ten]):
                e0 = ra['moi'][ten][i]
                if e0 is None:
                    raise SystemExit('Bộ ninja không dò được đai: %s khung %d' % (ten, i))
                if e is None or (b != 'moi' and max(abs(e[0] - e0[0]), abs(e[1] - e0[1])) > LECH_TOI_DA):
                    loai.setdefault(b, []).append('%s#%d %s→ninja %s' % (ten, i, e, e0))
                    ra[b][ten][i] = list(e0)
    out = {
        'phien_ban': 1,
        'ghi_chu': 'Dựng bằng docs/anh-goc/zed/cat-than.py. Mỗi khung [y, x] ô 96×96 nguồn: y = đường cắt (đáy đai), x = tâm hông.',
        'hang': [k for k in hang if k != 'chay'],
        'bo': ra,
        'loai': loai,
    }
    js = ('// TỰ SINH bởi docs/anh-goc/zed/cat-than.py — đừng sửa tay. Điểm eo từng khung để ghép chạy + chém (js/zed_moi.js).\n'
          '(window.G = window.G || {}).ZED_EO = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
    open(RA_JS, 'w', encoding='utf-8', newline='\n').write(js)
    print('Đã ghi', os.path.relpath(RA_JS, GOC), '(%d byte)' % len(js))
    for b, ds in loai.items():
        print('  %s: %d khung dùng điểm ninja: %s' % (b, len(ds), '; '.join(ds)))
    xem(tam, ra, hang)


def ghep(fa, ea, fr, er):
    """Ghép như game: nửa dưới khung chạy fr (hàng > er.y), nửa trên khung đòn fa (hàng <= ea.y) dời theo điểm eo."""
    dx, dy = er[1] - ea[1], er[0] - ea[0]
    out = np.zeros_like(fr)
    out[er[0] + 1:] = fr[er[0] + 1:]
    up = np.zeros_like(fa)
    up[:ea[0] + 1] = fa[:ea[0] + 1]
    sh = np.zeros_like(up)
    ys, xs = slice(max(0, dy), min(O, O + dy)), slice(max(0, dx), min(O, O + dx))
    sh[ys, xs] = up[max(0, -dy):O - max(0, dy), max(0, -dx):O - max(0, dx)]
    im = Image.fromarray(out)
    im.alpha_composite(Image.fromarray(sh))
    return im


def xem(tam, ra, hang):
    os.makedirs(RA_XEM, exist_ok=True)
    for b in BO:
        d, a = tam[b]
        dc = d['dong_tac']['chay']
        rows = [k for k in hang if k != 'chay']
        so = max(d['dong_tac'][k]['so'] for k in rows)
        H = len(rows)
        cv = Image.new('RGBA', (O * so * 2, O * H), (58, 60, 72, 255))
        for r, ten in enumerate(rows):
            dt = d['dong_tac'][ten]
            for i in range(dt['so']):
                j = (i * 2) % dc['so']  # khung chạy bất kỳ (minh hoạ nhịp chân chạy song song)
                fa, fr = khung(a, dt['hang'], i), khung(a, dc['hang'], j)
                cv.alpha_composite(Image.fromarray(fa), (O * i * 2, O * r))
                g = ghep(fa, ra[b][ten][i], fr, ra[b]['chay'][j])
                cv.alpha_composite(g, (O * (i * 2 + 1), O * r))
                ea = ra[b][ten][i]
        cv = cv.resize((cv.width * 2, cv.height * 2), Image.NEAREST)
        p = os.path.join(RA_XEM, 'ghep-eo-%s.png' % b)
        cv.save(p, optimize=True)
        print('Đã ghi', os.path.relpath(p, GOC))


if __name__ == '__main__':
    main()
