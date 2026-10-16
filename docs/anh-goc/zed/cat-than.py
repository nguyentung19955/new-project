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
SỬA BÓP EO (13/10/2026, docs/review/ke-hoach-cai-thien/zed-eo-sua/YEU-CAU.md, cờ game ?eosua=0 → cách trên):
  - Mỗi khung ghi thêm [.., c, l, r]: c = đường cắt THẤP (giữa đùi) = y + round((chân − y) × TI_LE_CAT); l, r = mép trái/phải hình
    (bỏ da tay, bỏ màu đai/đuôi đai) quanh hàng c — gộp các đoạn liền cách nhau ≤ GOP_DOAN điểm ảnh (hai đùi) quanh tâm hông.
  - Game: nửa trên = khung ĐÒN hàng 0..c (đai + hông + đùi trên), nửa dưới = khung CHẠY hàng > c (giữa đùi → bàn chân); nửa trên dời
    ngang theo tâm hông (x, như cũ: thân không nhảy), dọc sao cho hàng c đòn nằm ngay trên hàng c+1 chạy. Vùng nối VUNG_NOI hàng: nửa
    nào hẹp hơn thì kéo giãn ngang dần (hàng xa mép giữ nguyên → ở mép nối khớp đúng mép trái/phải của nửa kia; hệ số ≤ KEO_TOI_DA,
    mép dời ≤ DOI_TOI_DA, quá thì không kéo); nửa trên vẽ đè lên nửa dưới (nửa dưới lấn lên 1 hàng).
  - Điểm eo cũ [y, x] (2 số đầu) giữ nguyên: trục nghiêng thân trên (zed-8-huong) và cách cũ ?eosua=0 vẫn đọc.
KIẾM 1 MỚI 16/10 (kiem_1~16, chỉ bộ ninja): điểm eo đo riêng bằng eo-kiem-16-10.py, chèn vào zed_eo_data.js → chạy lại
  script đó SAU MỖI LẦN chạy script này (script này ghi đè cả tệp).
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
TI_LE_CAT = 0.35  # đường cắt mới: từ đáy đai xuống 35% quãng đai → bàn chân ≈ giữa đùi (zed-eo-sua)
GOP_DOAN = 4      # hai đùi cách nhau ≤ 4 điểm ảnh nguồn vẫn tính là một khối khi đo bề rộng
VUNG_NOI = 5      # số hàng nguồn của vùng nối kéo giãn (game đọc ZED_EO.vung_noi)
KEO_TOI_DA = 1.8  # hệ số giãn ngang tối đa ở mép nối (game đọc ZED_EO.keo_toi_da)
DOI_TOI_DA = 10   # mép trái/phải dời tối đa (điểm ảnh nguồn) khi khớp (game đọc ZED_EO.doi_toi_da)
RA_XEM_SUA = os.path.join(GOC, 'docs', 'review', 'ke-hoach-cai-thien', 'zed-eo-sua')


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


def doan_hang(row, x0):
    """Khối hình quanh cột x0 trên một hàng mặt nạ: [trái, phải] (gộp các đoạn cách nhau ≤ GOP_DOAN), hoặc None."""
    doan, j = [], 0
    while j < O:
        if row[j]:
            j0 = j
            while j < O and row[j]:
                j += 1
            doan.append([j0, j - 1])
        else:
            j += 1
    if not doan:
        return None
    k = min(range(len(doan)), key=lambda i: 0 if doan[i][0] <= x0 <= doan[i][1] else min(abs(doan[i][0] - x0), abs(doan[i][1] - x0)))
    a, b = doan[k]
    i = k - 1
    while i >= 0 and a - doan[i][1] - 1 <= GOP_DOAN:
        a = doan[i][0]; i -= 1
    i = k + 1
    while i < len(doan) and doan[i][0] - b - 1 <= GOP_DOAN:
        b = doan[i][1]; i += 1
    return [a, b]


def do_cat(f, e, bo):
    """Đường cắt giữa đùi + mép hình ở đó: [c, trái, phải] (ô 96 nguồn; trái = phải = −1 nếu không đo được).
    e = điểm eo [y, x] đã chốt. Mép = trung vị của 3 hàng c−1, c, c+1 (một điểm ảnh lạc không làm lệch)."""
    c = int(e[0] + round((CHAN_Y - e[0]) * TI_LE_CAT))
    al = f[..., 3] > 100
    h, s, v = hsv(f)
    m = al & ~da(f) & ~MAU_DAI[bo](h, s, v)
    ds = [d for d in (doan_hang(m[y], e[1]) for y in (c - 1, c, c + 1)) if d]
    if not ds:
        return [c, -1, -1]
    return [c, int(np.median([d[0] for d in ds])), int(np.median([d[1] for d in ds]))]


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
    # sửa bóp eo: đường cắt giữa đùi + bề rộng, đo trên chính khung của bộ đó (sau khi đã chốt điểm eo)
    for b in BO:
        d, a = tam[b]
        for ten in hang:
            dt = d['dong_tac'][ten]
            for i in range(dt['so']):
                e = ra[b][ten][i]
                ra[b][ten][i] = list(e[:2]) + do_cat(khung(a, dt['hang'], i), e, b)
    out = {
        'phien_ban': 2,
        'vung_noi': VUNG_NOI,
        'keo_toi_da': KEO_TOI_DA,
        'doi_toi_da': DOI_TOI_DA,
        'ghi_chu': 'Dựng bằng docs/anh-goc/zed/cat-than.py. Mỗi khung [y, x, c, l, r] ô 96×96 nguồn: y = đáy đai (cắt cũ, trục nghiêng), x = tâm hông; c = đường cắt giữa đùi (zed-eo-sua), l/r = mép trái/phải hình ở hàng c (−1: không đo được).',
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
    xem_sua(tam, ra)


def ghep(fa, ea, fr, er):  # cách CŨ (cắt ở đáy đai), để so sánh — game: ?eosua=0
    """Ghép như game: nửa dưới khung chạy fr (hàng > er.y), nửa trên khung đòn fa (hàng <= ea.y) dời theo điểm eo."""
    er, ea = er[:2], ea[:2]
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


# ---------- ẢNH SOÁT zed-eo-sua: dựng y như game (js/zed_moi.js) ở độ phân giải nguồn ----------
def keo_noi(eA, eR, dx):
    """Phép kéo vùng nối — y hệt keoNoi() trong js/zed_moi.js. Trả (bên, l, r, L, R) hoặc None:
    bên 'tren' / 'duoi' = nửa được kéo; [l, r] mép của nó, [L, R] mép đích (đều theo cột nguồn của khung CHẠY, nửa trên đã dời dx)."""
    if eA[3] < 0 or eR[3] < 0:
        return None
    lA, rA, lR, rR = eA[3] + dx, eA[4] + dx, eR[3], eR[4]
    wA, wR = rA - lA + 1, rR - lR + 1
    if wA == wR and lA == lR:
        return None
    ben = 'tren' if wA < wR else 'duoi'
    l, r, L, R = (lA, rA, lR, rR) if ben == 'tren' else (lR, rR, lA, rA)
    if (R - L + 1) / (r - l + 1) > KEO_TOI_DA or max(abs(L - l), abs(R - r)) > DOI_TOI_DA:
        return None
    return ben, l, r, L, R


def keo_hang(row, l, r, L, R, t):
    """Hàng RGBA: đoạn [l, r] biến tuyến tính về [l + t(L − l), r + t(R − r)] (cả hàng cùng phép, lấy mẫu gần nhất)."""
    tl, tr = l + t * (L - l), r + t * (R - r)
    k = (tr - tl + 1) / (r - l + 1)
    X = np.arange(O)
    src = np.floor(l + (X + 0.5 - tl) / k).astype(int)
    ok = (src >= 0) & (src < O)
    out = np.zeros_like(row)
    out[ok] = row[src[ok]]
    return out


def dich(a, dx, dy):
    out = np.zeros_like(a)
    ys, xs = slice(max(0, dy), min(O, O + dy)), slice(max(0, dx), min(O, O + dx))
    out[ys, xs] = a[max(0, -dy):O - max(0, dy), max(0, -dx):O - max(0, dx)]
    return out


def ghep_cu(fa, ea, fr, er, nguoc):
    """Cách cũ (?eosua=0): cắt ở đáy đai; chạy ngược hướng chém thì chân LẬT ngược lại (vặn người)."""
    if not nguoc:
        return ghep(fa, ea, fr, er)
    # game: Lx = kc + rel·(xR/2 − 24), mặt phải → kc = 1 điểm ảnh game; chân vẽ lật
    lx = 1 - (er[1] / 2 - 24)
    hip = int(round(2 * lx + 48))           # tâm hông chân (nguồn) sau khi lật
    out = np.zeros_like(fr)
    low = np.zeros_like(fr)
    low[er[0] + 1:] = fr[er[0] + 1:]
    low = dich(low[:, ::-1], hip - (O - 1 - er[1]), 0)
    out = low
    up = np.zeros_like(fa)
    up[:ea[0] + 1] = fa[:ea[0] + 1]
    up = dich(up, hip - ea[1], er[0] - ea[0])
    im = Image.fromarray(out)
    im.alpha_composite(Image.fromarray(up))
    return im


def ghep_moi(fa, ea, fr, er):
    """Cách mới: cắt giữa đùi, vùng nối kéo giãn bên hẹp, nửa trên đè nửa dưới. Chân luôn cùng hướng thân trên."""
    cA, cR = ea[2], er[2]
    dx, dy = er[1] - ea[1], cR - cA          # ngang theo tâm hông (như cũ), dọc theo đường cắt mới
    S = VUNG_NOI
    up = np.zeros_like(fa)
    up[:cA + 1] = fa[:cA + 1]
    up = dich(up, dx, dy)                   # từ đây hàng cA của nửa trên nằm ở hàng cR
    low = np.zeros_like(fr)
    low[cR:] = fr[cR:]                      # lấn lên 1 hàng (bị nửa trên đè)
    K = keo_noi(ea, er, dx)
    if K:
        ben, l, r, L, R = K
        for k in range(S):                  # k = 0 ở mép nối (t = 1) → k = S−1 (t = 1/S)
            t = (S - k) / S
            if ben == 'tren':
                y = cR - k
                if y >= 0:
                    up[y] = keo_hang(up[y], l, r, L, R, t)
            else:
                y = cR + 1 + k
                if y < O:
                    low[y] = keo_hang(low[y], l, r, L, R, t)
        if ben == 'duoi':
            low[cR] = keo_hang(low[cR], l, r, L, R, 1)
    im = Image.fromarray(low)
    im.alpha_composite(Image.fromarray(up))
    return im


def xem_sua(tam, ra):
    """xem-eo-sua.png: kiếm 1, kiếm 2, thương 1, phi tiêu × bộ ninja, Lâu đài; mỗi ô: CŨ cùng hướng | MỚI cùng hướng | CŨ ngược | MỚI ngược."""
    from PIL import ImageDraw
    os.makedirs(RA_XEM_SUA, exist_ok=True)
    dong = [(b, t) for b in ('moi', 'lau') for t in ('kiem_1', 'kiem_2', 'thuong_1', 'phitieu')]
    KH = 3          # 3 khung mỗi đòn (đầu, chạm ★, cuối)
    Z = 2           # phóng to ×2 nguồn
    W0 = 150
    cot = KH * 4
    cv = Image.new('RGBA', (W0 + O * Z * cot, 40 + O * Z * len(dong)), (46, 48, 58, 255))
    dr = ImageDraw.Draw(cv)
    nhan = ['CU cung huong', 'MOI cung huong', 'CU chay nguoc', 'MOI chay nguoc (lui)']
    for k in range(4):
        for f in range(KH):
            x = W0 + (k * KH + f) * O * Z
            dr.text((x + 6, 6), '%s #%d' % (nhan[k], f + 1), fill=(255, 230, 150, 255))
    tenb = {'moi': 'ninja', 'lau': 'Lau dai'}
    for r, (b, ten) in enumerate(dong):
        d, a = tam[b]
        dt, dc = d['dong_tac'][ten], d['dong_tac']['chay']
        y0 = 40 + r * O * Z
        dr.text((8, y0 + 80), '%s\n%s' % (tenb[b], ten), fill=(230, 230, 240, 255))
        ks = [0, min(dt['so'] - 1, 2), dt['so'] - 2]
        for f, i in enumerate(ks):
            fa, ea = khung(a, dt['hang'], i), ra[b][ten][i]
            j = (i * 3 + 1) % dc['so']
            jl = dc['so'] - 1 - j                 # chạy lùi: hàng chạy phát ngược thứ tự khung
            fr, er = khung(a, dc['hang'], j), ra[b]['chay'][j]
            frl, erl = khung(a, dc['hang'], jl), ra[b]['chay'][jl]
            o = [ghep_cu(fa, ea, fr, er, False), ghep_moi(fa, ea, fr, er), ghep_cu(fa, ea, fr, er, True), ghep_moi(fa, ea, frl, erl)]
            for k in range(4):
                x = W0 + (k * KH + f) * O * Z
                if k % 2 == 1:
                    dr.rectangle([x, y0, x + O * Z - 1, y0 + O * Z - 1], fill=(54, 66, 60, 255))
                cv.alpha_composite(o[k].resize((O * Z, O * Z), Image.NEAREST), (x, y0))
    for k in range(1, 4):
        x = W0 + k * KH * O * Z
        dr.line([x, 0, x, cv.height], fill=(255, 255, 255, 120), width=2)
    p = os.path.join(RA_XEM_SUA, 'xem-eo-sua.png')
    cv.save(p, optimize=True)
    print('Đã ghi', os.path.relpath(p, GOC), cv.size)


if __name__ == '__main__':
    main()
