# Bộ thử animation modular cho Zed (Cu Tí) — chỉ là TÀI LIỆU, không đụng code game.
# Chạy từ thư mục gốc repo:  python3 docs/thu-modular/tao-bo-thu.py
# Sinh: nhan-vat*.png/json, que-*.png/json, bo-phan/*, bo-phan.png/json, ghep-thu-*.png/gif
import json, math, os, sys
from PIL import Image, ImageDraw, ImageFont

GOC_REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RA = os.path.join(GOC_REPO, 'docs', 'thu-modular')
ZED = os.path.join(GOC_REPO, 'docs', 'anh-goc', 'zed')
TAM = os.path.join(ZED, 'zed-v2-canonical.png')          # = v2/00-than-dung-di-chay.png (giống hệt từng điểm ảnh)
HOP = (45, 16, 202, 253)                                   # khung bao hình đứng 1 trên tấm (đo: điểm không xanh)
GOC = (140, 252)                                           # điểm gốc = giữa hai bàn chân, mép dưới đế
K_GAME = 31 / 236                                          # 236 điểm ảnh cao → 31 điểm game (như do-dac.json)
GAME_KHUNG, GAME_GOC = (48, 48), (24, 45)                  # khung game 48×48, chân tại [24,45] (như neo-game.json)

FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONTB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def font(n, b=False): return ImageFont.truetype(FONTB if b else FONT, n)

DEN, DO, XAM, TRANG = (0, 0, 0), (220, 30, 30), (150, 150, 150), (255, 255, 255)

# ---------------------------------------------------------------- 1. KHỚP (điểm ảnh tấm gốc, khung đứng 1)
# Zed nhìn nghiêng 3/4 sang PHẢI. "phải/trái" = tay/chân phải/trái CỦA NHÂN VẬT:
#   bên phải nhân vật = bên TRÁI màn hình = phía GẦN người xem (vẽ TRƯỚC thân)
#   bên trái nhân vật = bên PHẢI màn hình = phía XA (vẽ SAU thân)
KHOP = [  # (mã, tên tiếng Việt, [x, y])
    ('dinh_dau',      'Đỉnh đầu (tóc, không tính sừng)', [136, 30]),
    ('tam_dau',       'Tâm đầu',                         [141, 86]),
    ('cam',           'Cằm',                             [150, 134]),
    ('co',            'Cổ',                              [141, 139]),
    ('vai_phai',      'Vai phải (gần)',                  [112, 148]),
    ('vai_trai',      'Vai trái (xa)',                   [160, 148]),
    ('khuyu_phai',    'Khuỷu phải',                      [105, 172]),
    ('khuyu_trai',    'Khuỷu trái',                      [169, 172]),
    ('co_tay_phai',   'Cổ tay phải',                     [103, 189]),
    ('co_tay_trai',   'Cổ tay trái',                     [174, 187]),
    ('nam_tay_phai',  'Nắm tay phải',                    [102, 198]),
    ('nam_tay_trai',  'Nắm tay trái',                    [177, 195]),
    ('eo',            'Eo (đai)',                        [137, 176]),
    ('hong',          'Hông (giữa chậu)',                [139, 191]),
    ('hong_phai',     'Hông phải',                       [126, 192]),
    ('hong_trai',     'Hông trái',                       [152, 192]),
    ('goi_phai',      'Đầu gối phải',                    [118, 221]),
    ('goi_trai',      'Đầu gối trái',                    [160, 221]),
    ('co_chan_phai',  'Cổ chân phải',                    [116, 239]),
    ('co_chan_trai',  'Cổ chân trái',                    [159, 239]),
    ('mui_chan_phai', 'Mũi chân phải',                   [131, 250]),
    ('mui_chan_trai', 'Mũi chân trái',                   [180, 249]),
    ('goc',           'Điểm gốc (chân, đặt xuống đất)',  list(GOC)),
]
P = {m: tuple(xy) for m, _, xy in KHOP}

# XƯƠNG: (mã, cha-khớp → con-khớp, bộ phận, lớp vẽ)
XUONG = [
    ('than',           'hong',         'co',            'than',          30),
    ('dau',            'co',           'dinh_dau',      'dau',           50),
    ('vai_phai',       'co',           'vai_phai',      None,            None),
    ('vai_trai',       'co',           'vai_trai',      None,            None),
    ('canh_tay_tren_phai', 'vai_phai', 'khuyu_phai',    'canh-tay-tren-phai', 70),
    ('canh_tay_duoi_phai', 'khuyu_phai', 'co_tay_phai', 'canh-tay-duoi-phai', 71),
    ('ban_tay_phai',   'co_tay_phai',  'nam_tay_phai',  'ban-tay-phai',  72),
    ('canh_tay_tren_trai', 'vai_trai', 'khuyu_trai',    'canh-tay-tren-trai', 10),
    ('canh_tay_duoi_trai', 'khuyu_trai', 'co_tay_trai', 'canh-tay-duoi-trai', 11),
    ('ban_tay_trai',   'co_tay_trai',  'nam_tay_trai',  'ban-tay-trai',  12),
    ('hong_phai',      'hong',         'hong_phai',     None,            None),
    ('hong_trai',      'hong',         'hong_trai',     None,            None),
    ('dui_phai',       'hong_phai',    'goi_phai',      'dui-phai',      40),
    ('cang_chan_phai', 'goi_phai',     'co_chan_phai',  'cang-chan-phai', 41),
    ('ban_chan_phai',  'co_chan_phai', 'mui_chan_phai', 'ban-chan-phai', 42),
    ('dui_trai',       'hong_trai',    'goi_trai',      'dui-trai',      20),
    ('cang_chan_trai', 'goi_trai',     'co_chan_trai',  'cang-chan-trai', 21),
    ('ban_chan_trai',  'co_chan_trai', 'mui_chan_trai', 'ban-chan-trai', 22),
]
LOP_DO = {  # lớp đồ (giữa các bộ phận thân)
    'ao_choang_khan': 5, 'non_sau': 8, 'tay_trai (xa)': '10–12', 'chan_trai (xa)': '20–22', 'than': 30,
    'ao / giap': 35, 'chan_phai (gần)': '40–42', 'quan': 45, 'dau': 50, 'mat_na': 55,
    'tay_phai (gần)': '70–72', 'vu_khi': 75, 'non_truoc / mu': 85,
}

def game(xy):
    return [round(GAME_GOC[0] + (xy[0] - GOC[0]) * K_GAME, 2), round(GAME_GOC[1] + (xy[1] - GOC[1]) * K_GAME, 2)]
def dai(a, b): return math.hypot(b[0] - a[0], b[1] - a[1])
def goc(a, b): return math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))  # 0 = sang phải, 90 = thẳng xuống

def ghi_json(ten, d):
    with open(os.path.join(RA, ten), 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=1)

def lam_nhan_vat():
    tam = Image.open(TAM).convert('RGB')
    hinh = tam.crop(HOP)
    # tách nền xanh → trong suốt (chỉ để xem/ghép, không phải asset chính thức)
    rgba = hinh.convert('RGBA'); px = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = px[x, y]
            if g > 150 and r < 120 and b < 120: px[x, y] = (0, 0, 0, 0)
            elif g > max(r, b) + 45: px[x, y] = (0, 0, 0, 0)   # viền xanh lem
    rgba.save(os.path.join(RA, 'nhan-vat-zed-dung.png'))
    S = 4
    to = rgba.resize((rgba.width * S, rgba.height * S), Image.NEAREST)
    nen = Image.new('RGBA', to.size, (255, 255, 255, 255)); nen.alpha_composite(to)
    nen.convert('RGB').save(os.path.join(RA, 'nhan-vat-zed-dung-x4.png'))

    # ảnh khớp: hình ×4 (mờ), xương, khớp đánh số, bảng tên + toạ độ bên phải
    S = 4; L = 60
    W = rgba.width * S + 2 * L; H = rgba.height * S + 2 * L
    bang_w = 760
    im = Image.new('RGB', (W + bang_w, max(H, 40 + 34 * len(KHOP) + 260)), TRANG)
    mo = to.copy(); a = mo.getchannel('A').point(lambda v: v * 0.55); mo.putalpha(a)
    im.paste(mo, (L, L), mo)
    d = ImageDraw.Draw(im)
    def q(xy): return (L + (xy[0] - HOP[0]) * S, L + (xy[1] - HOP[1]) * S)
    for _, a_, b_, _, _ in XUONG: d.line([q(P[a_]), q(P[b_])], fill=DEN, width=4)
    d.line([q(P['co']), q(P['cam'])], fill=XAM, width=2)
    d.line([(L - 40, q(GOC)[1]), (L + rgba.width * S + 40, q(GOC)[1])], fill=XAM, width=2)
    f = font(17, True)
    for i, (m, ten, xy) in enumerate(KHOP, 1):
        x, y = q(xy)
        d.ellipse([x - 7, y - 7, x + 7, y + 7], fill=DO, outline=DEN)
        d.text((x + 9, y - 22), str(i), fill=(160, 0, 0), font=f, stroke_width=3, stroke_fill=TRANG)
    # bảng
    bx = W + 10; y = 20
    d.text((bx, y), 'Zed (Cu Tí) — đứng nghiêng phải, khung 1', fill=DEN, font=font(22, True)); y += 34
    d.text((bx, y), 'Toạ độ: điểm ảnh tấm gốc (2048×768)  |  điểm game (48×48, chân [24,45])', fill=DEN, font=font(14)); y += 30
    for i, (m, ten, xy) in enumerate(KHOP, 1):
        d.text((bx, y), f'{i:>2}. {ten}', fill=DEN, font=font(16))
        g = game(xy)
        d.text((bx + 380, y), f'[{xy[0]}, {xy[1]}]', fill=(160, 0, 0), font=font(16, True))
        d.text((bx + 520, y), f'game [{g[0]:.1f}, {g[1]:.1f}]', fill=(0, 90, 160), font=font(16))
        y += 34
    y += 10
    for t in ['Phải/trái = của NHÂN VẬT. Bên phải (gần, bên trái màn hình) vẽ TRƯỚC thân,',
              'bên trái (xa, bên phải màn hình) vẽ SAU thân.',
              f'1 điểm game = {1 / K_GAME:.2f} điểm ảnh gốc. Hình ×4. Nét đen = xương, chấm đỏ = khớp.']:
        d.text((bx, y), t, fill=DEN, font=font(15)); y += 24
    im.save(os.path.join(RA, 'nhan-vat-khop.png'))

    xuong = {}
    for m, a_, b_, bp, lop in XUONG:
        xuong[m] = {'tu': a_, 'den': b_, 'do_dai_px': round(dai(P[a_], P[b_]), 1),
                    'do_dai_game': round(dai(P[a_], P[b_]) * K_GAME, 2), 'goc_do': round(goc(P[a_], P[b_]), 1),
                    'bo_phan': bp, 'lop': lop}
    ghi_json('nhan-vat.json', {
        'loai': 'linh-khi-thu-modular-nhan-vat', 'phien_ban': 1, 'nhan_vat': 'zed-v2 (Cu Tí)',
        'anh_goc': 'docs/anh-goc/zed/zed-v2-canonical.png (hàng 1 "đứng", khung 1)',
        'anh_cat': 'docs/thu-modular/nhan-vat-zed-dung.png (nền trong suốt, = khung_bao bên dưới)',
        'huong': 'nghiêng 3/4 sang phải. phải/trái = của nhân vật; phải = gần người xem = bên trái màn hình',
        'he_toa_do': {
            'goc_anh': 'điểm ảnh trên tấm 2048×768; (0,0) góc trên-trái tấm; x sang phải, y xuống',
            'trong_anh_cat': 'trừ khung_bao[0..1]: x_cat = x - 45, y_cat = y - 16',
            'game': 'x_game = 24 + (x - 140) × ti_le ; y_game = 45 + (y - 252) × ti_le',
            'goc_do': '0° = sang phải, 90° = thẳng xuống, -90° = thẳng lên (y màn hình hướng xuống)'},
        'khung_bao_tren_tam': list(HOP), 'co_hinh_px': [HOP[2] - HOP[0], HOP[3] - HOP[1]],
        'diem_goc_chan': {'px': list(GOC), 'game': game(GOC)},
        'ti_le_game': round(K_GAME, 5), 'khung_game': list(GAME_KHUNG), 'goc_game': list(GAME_GOC),
        'chieu_cao': {'px': GOC[1] - HOP[1], 'game': round((GOC[1] - HOP[1]) * K_GAME, 1),
                      'dau_tren_than': round((P['cam'][1] - P['dinh_dau'][1]) / (GOC[1] - P['dinh_dau'][1]), 2)},
        'khop': {m: {'ten': t, 'px': xy, 'game': game(xy), 'trong_anh_cat': [xy[0] - HOP[0], xy[1] - HOP[1]]}
                 for m, t, xy in KHOP},
        'xuong': xuong,
        'thu_tu_lop': {'ghi_chu': 'số nhỏ vẽ trước (nằm dưới). Bộ phận thân + chỗ chen lớp đồ', 'lop': LOP_DO},
        'ghi_chu': ['Khớp đo bằng mắt trên ảnh phóng ×4 (sai số ±2 px gốc ≈ ±0.3 điểm game).',
                    'Neo máy đo cũ: docs/anh-goc/zed/neo/zed-v2.neo.json (cổ, eo, vai, lưng…) — khớp với tệp này trong ±3 px.',
                    'Toạ độ x game của neo-game.json cũ lệch +2 so với tệp này vì tệp cũ lấy tâm khung khác; dùng tệp này cho bộ thử.']})


# ---------------------------------------------------------------- 2. KHUNG QUE (động học thuận đơn giản)
O = 256                       # ô khung que = 256×256 điểm ảnh, CÙNG tỉ lệ ảnh gốc (1 px que = 1 px ảnh gốc)
OG = (128, 248)               # điểm gốc (chân) trong ô
def rel(m): return (P[m][0] - GOC[0], P[m][1] - GOC[1])
def tru(a, b): return (a[0] - b[0], a[1] - b[1])
def cong(a, b): return (a[0] + b[0], a[1] + b[1])
def xoay(v, deg):
    r = math.radians(deg); c, s = math.cos(r), math.sin(r)
    return (v[0] * c - v[1] * s, v[0] * s + v[1] * c)
def huong(deg, l): r = math.radians(deg); return (math.cos(r) * l, math.sin(r) * l)

CHUOI = {  # khoá góc -> (khớp đầu, khớp cuối)
    'than': ('hong', 'co'), 'dau': ('co', 'dinh_dau'),
    'ttp': ('vai_phai', 'khuyu_phai'), 'tdp': ('khuyu_phai', 'co_tay_phai'), 'btp': ('co_tay_phai', 'nam_tay_phai'),
    'ttt': ('vai_trai', 'khuyu_trai'), 'tdt': ('khuyu_trai', 'co_tay_trai'), 'btt': ('co_tay_trai', 'nam_tay_trai'),
    'dp': ('hong_phai', 'goi_phai'), 'cp': ('goi_phai', 'co_chan_phai'), 'bcp': ('co_chan_phai', 'mui_chan_phai'),
    'dt': ('hong_trai', 'goi_trai'), 'ct': ('goi_trai', 'co_chan_trai'), 'bct': ('co_chan_trai', 'mui_chan_trai'),
}
A0 = {k: goc(P[a], P[b]) for k, (a, b) in CHUOI.items()}
LEN = {k: dai(P[a], P[b]) for k, (a, b) in CHUOI.items()}

def fk(g, hong=None, can_dat=True, nang=0.0, hep=1.0):
    """g: góc tuyệt đối từng đoạn (thiếu thì lấy dáng đứng). Trả về khớp theo toạ độ ô que."""
    a = dict(A0); a.update(g)
    J = {'hong': hong or rel('hong')}
    J['co'] = cong(J['hong'], huong(a['than'], LEN['than']))
    dt = a['than'] - A0['than']; dd = a['dau'] - A0['dau']
    J['dinh_dau'] = cong(J['co'], huong(a['dau'], LEN['dau']))
    J['tam_dau'] = cong(J['co'], xoay(tru(rel('tam_dau'), rel('co')), dd))
    J['cam'] = cong(J['co'], xoay(tru(rel('cam'), rel('co')), dd))
    J['eo'] = cong(J['hong'], xoay(tru(rel('eo'), rel('hong')), dt))
    for s in ('phai', 'trai'):
        J['vai_' + s] = cong(J['co'], xoay(tru(rel('vai_' + s), rel('co')), dt))
        o = tru(rel('hong_' + s), rel('hong'))   # hep < 1: hai hông xích lại khi đi/chạy (nhìn nghiêng hơn)
        J['hong_' + s] = cong(J['hong'], (o[0] * hep, o[1]))
    for k in ('ttp', 'tdp', 'btp', 'ttt', 'tdt', 'btt', 'dp', 'cp', 'bcp', 'dt', 'ct', 'bct'):
        a_, b_ = CHUOI[k]; J[b_] = cong(J[a_], huong(a[k], LEN[k]))
    if can_dat:  # hạ/nâng cả người cho bàn chân thấp nhất chạm đất
        day = max(max(J['co_chan_phai'][1] + 13, J['mui_chan_phai'][1] + 2),
                  max(J['co_chan_trai'][1] + 13, J['mui_chan_trai'][1] + 2))
        for m in J: J[m] = (J[m][0], J[m][1] - day - nang)
    J['goc'] = (0.0, 0.0)
    return {m: (v[0] + OG[0], v[1] + OG[1]) for m, v in J.items()}, a

# Khi đi/chạy, chân không còn "dạng chữ A" như dáng đứng: lấy chân gốc gần thẳng đứng (D0, C0).
D0, C0, T0 = 94, 96, 100
def dang_di(n=6):
    ra = []
    for i in range(n):
        p = 2 * math.pi * i / n
        g = {'than': A0['than'] + 4, 'dau': A0['dau'] + 2}
        for s, ph in (('p', p), ('t', p + math.pi)):
            g['d' + s] = D0 - 24 * math.cos(ph)   # khung 1 = chân phải bước tới xa nhất (chạm đất)
            g['c' + s] = g['d' + s] + (C0 - D0) + 3 + 34 * max(0, -math.sin(ph))
            g['bc' + s] = g['c' + s] + (A0['bc' + s] - A0['c' + s]) - 10 * max(0, -math.sin(ph))
            g['tt' + s] = T0 + 22 * math.cos(ph)
            g['td' + s] = g['tt' + s] - 18
            g['bt' + s] = g['td' + s] + (A0['bt' + s] - A0['td' + s])
        ra.append(fk(g, hep=0.4))
    return ra

def dang_chay(n=8):
    ra = []
    for i in range(n):
        p = 2 * math.pi * i / n
        g = {'than': A0['than'] + 14, 'dau': A0['dau'] + 8}
        for s, ph in (('p', p), ('t', p + math.pi)):
            g['d' + s] = D0 - 40 * math.cos(ph)
            g['c' + s] = g['d' + s] + (C0 - D0) + 18 + 62 * max(0, -math.sin(ph))
            g['bc' + s] = g['c' + s] + (A0['bc' + s] - A0['c' + s]) - 15 * max(0, -math.sin(ph))
            g['tt' + s] = T0 + 40 * math.cos(ph)
            g['td' + s] = g['tt' + s] - 80
            g['bt' + s] = g['td' + s] + (A0['bt' + s] - A0['td' + s])
        ra.append(fk(g, hep=0.4, nang=7 * max(0, -math.cos(2 * p))))
    return ra

# đánh kiếm 1 nhát (tay PHẢI = tay gần cầm kiếm). (tên, góc, lệch hông x, góc kiếm)
KIEM = [
    ('thu-the',   dict(than=-84, ttp=75, tdp=15, ttt=100, tdt=70, dp=80, cp=98, dt=112, ct=104), 0, -50),
    ('vung-len',  dict(than=-97, dau=-96, ttp=-125, tdp=-105, ttt=85, tdt=50, dp=86, cp=98, dt=110, ct=104), -2, -122),
    ('dinh',      dict(than=-92, ttp=-110, tdp=-80, ttt=95, tdt=60, dp=78, cp=96, dt=116, ct=106), 0, -72),
    ('chem',      dict(than=-74, dau=-86, ttp=-15, tdp=0, ttt=135, tdt=110, dp=55, cp=92, dt=132, ct=104), 16, 10),
    ('het-da',    dict(than=-72, dau=-86, ttp=50, tdp=70, ttt=130, tdt=105, dp=56, cp=92, dt=130, ct=104), 18, 30),
    ('thu-ve',    dict(than=-84, ttp=80, tdp=30, ttt=105, tdt=75, dp=74, cp=98, dt=116, ct=106), 6, -35),
]
DAI_KIEM = 92   # ≈ 12 điểm game
def dang_kiem():
    ra = []
    for ten, g, dx, gk in KIEM:
        g = dict(g); g['btp'] = g['tdp'] + (A0['btp'] - A0['tdp'])
        g['btt'] = g['tdt'] + (A0['btt'] - A0['tdt'])
        g['bcp'] = g['cp'] + (A0['bcp'] - A0['cp']); g['bct'] = g['ct'] + (A0['bct'] - A0['ct'])
        h = rel('hong'); J, a = fk(g, hong=(h[0] + dx, h[1]))
        J['mui_kiem'] = cong(J['nam_tay_phai'], huong(gk, DAI_KIEM)); a['kiem'] = gk
        ra.append((J, a))
    return ra

XA = (95, 95, 95)  # bên xa vẽ xám đậm cho dễ phân biệt
DOAN_VE = [  # (lớp, khớp a, khớp b, màu)
    (10, 'vai_trai', 'khuyu_trai', XA), (11, 'khuyu_trai', 'co_tay_trai', XA), (12, 'co_tay_trai', 'nam_tay_trai', XA),
    (20, 'hong_trai', 'goi_trai', XA), (21, 'goi_trai', 'co_chan_trai', XA), (22, 'co_chan_trai', 'mui_chan_trai', XA),
    (30, 'hong', 'co', DEN), (30, 'vai_phai', 'vai_trai', DEN), (30, 'hong_phai', 'hong_trai', DEN),
    (40, 'hong_phai', 'goi_phai', DEN), (41, 'goi_phai', 'co_chan_phai', DEN), (42, 'co_chan_phai', 'mui_chan_phai', DEN),
    (70, 'vai_phai', 'khuyu_phai', DEN), (71, 'khuyu_phai', 'co_tay_phai', DEN), (72, 'co_tay_phai', 'nam_tay_phai', DEN),
]
def ve_que(im, J, ox=0, oy=0, S=1, them=None, nhan=False):
    """Vẽ que theo thứ tự lớp; them = [(lớp, hàm(im))] chen ảnh đồ vào giữa các lớp."""
    viec = [(l, ('doan', a, b, c)) for l, a, b, c in DOAN_VE] + [(50, ('dau',))]
    if 'mui_kiem' in J: viec.append((75, ('kiem',)))
    viec += [(l, ('anh', f)) for l, f in (them or [])]
    viec.sort(key=lambda t: t[0])
    d = ImageDraw.Draw(im)
    def q(m): return (ox + J[m][0] * S, oy + J[m][1] * S)
    w = max(2, round(3 * S))
    for _, v in viec:
        if v[0] == 'doan': d.line([q(v[1]), q(v[2])], fill=v[3], width=w)
        elif v[0] == 'dau':
            c = q('tam_dau'); r = dai(J['tam_dau'], J['dinh_dau']) * S
            d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], outline=DEN, width=w)
            d.line([q('co'), q('cam')], fill=DEN, width=max(1, w - 1))
            # mũi nhỏ chỉ hướng mặt (sang phải)
            d.line([c, (c[0] + r * 0.9 * (J['cam'][0] - J['tam_dau'][0]) / max(1, dai(J['cam'], J['tam_dau'])) + r * 0.3,
                                      c[1] + r * 0.9 * (J['cam'][1] - J['tam_dau'][1]) / max(1, dai(J['cam'], J['tam_dau'])))], fill=XAM, width=1)
        elif v[0] == 'kiem':
            a, b = q('nam_tay_phai'), q('mui_kiem')
            d.line([a, b], fill=(120, 120, 120), width=w)
            ux, uy = (b[0] - a[0]) / max(1, dai(a, b)), (b[1] - a[1]) / max(1, dai(a, b))
            h = (a[0] + ux * 6 * S, a[1] + uy * 6 * S)   # chắn tay kiếm
            d.line([(h[0] - uy * 8 * S, h[1] + ux * 8 * S), (h[0] + uy * 8 * S, h[1] - ux * 8 * S)], fill=(120, 120, 120), width=w)
        elif v[0] == 'anh':
            v[1](im); d = ImageDraw.Draw(im)
    r = max(3, round(3.5 * S))
    for m, (x, y) in J.items():
        if m.startswith('_') or m == 'goc': continue
        x, y = ox + x * S, oy + y * S
        d.ellipse([x - r, y - r, x + r, y + r], fill=DO)
    x, y = ox + J['goc'][0] * S, oy + J['goc'][1] * S
    d.line([(x - 5 * S, y), (x + 5 * S, y)], fill=DO, width=2); d.line([(x, y - 5 * S), (x, y)], fill=DO, width=2)

def cell_game(xy):  # toạ độ ô que → điểm game (khung 48×48, chân [24,45])
    return [round(GAME_GOC[0] + (xy[0] - OG[0]) * K_GAME, 2), round(GAME_GOC[1] + (xy[1] - OG[1]) * K_GAME, 2)]

def tam_que(ten, khung, giay, mo_ta, S=1, them_fn=None):
    n = len(khung); GAP = 0
    im = Image.new('RGB', (n * O * S, O * S + 30 * S), TRANG); d = ImageDraw.Draw(im)
    for i, (J, a) in enumerate(khung):
        ox = i * O * S
        d.rectangle([ox, 0, ox + O * S - 1, O * S - 1], outline=(215, 215, 215), width=1)
        d.line([(ox + 8, OG[1] * S), (ox + O * S - 8, OG[1] * S)], fill=(185, 185, 185), width=max(1, S))
        ve_que(im, J, ox, 0, S, them=them_fn(i, J, a, ox, S) if them_fn else None)
        d = ImageDraw.Draw(im)
        d.text((ox + 6 * S, O * S + 4 * S), str(i + 1), fill=(200, 0, 0), font=font(16 * S, True))
    return im

def json_que(ten, khung, giay, mo_ta):
    ds = []
    for i, (J, a) in enumerate(khung):
        ds.append({'khung': i + 1,
                   'khop_px': {m: [round(v[0], 1), round(v[1], 1)] for m, v in J.items()},
                   'khop_game': {m: cell_game(v) for m, v in J.items()},
                   'goc_doan_do': {k: round(v, 1) for k, v in a.items()}})
    ghi_json(ten, {'loai': 'linh-khi-thu-modular-que', 'phien_ban': 1, 'dong_tac': mo_ta, 'so_khung': len(khung),
                   'giay_moi_khung': giay, 'o': [O, O], 'goc_trong_o': list(OG),
                   'he_toa_do': 'khop_px: điểm ảnh trong ô (ô i bắt đầu ở x = (i-1)×256 trên tấm); cùng tỉ lệ ảnh gốc. '
                                'khop_game: khung 48×48, chân [24,45]. Góc: 0° sang phải, 90° xuống.',
                   'khoa_goc': {k: f'{a}→{b}' for k, (a, b) in CHUOI.items()},
                   'khung': ds})

def lam_que():
    dung = fk({})
    # que-dung.png: ×2, đánh số khớp như nhan-vat-khop.png
    S = 2; im = Image.new('RGB', (O * S, O * S), TRANG); d = ImageDraw.Draw(im)
    d.line([(10, OG[1] * S), (O * S - 10, OG[1] * S)], fill=(185, 185, 185), width=2)
    ve_que(im, dung[0], 0, 0, S); d = ImageDraw.Draw(im)
    for i, (m, _, _) in enumerate(KHOP, 1):
        x, y = dung[0][m]; d.text((x * S + 7, y * S - 18), str(i), fill=(160, 0, 0), font=font(13, True), stroke_width=2, stroke_fill=TRANG)
    im.save(os.path.join(RA, 'que-dung.png'))
    tam_que('', [dung], 1, '').save(os.path.join(RA, 'que-dung-x1.png'))
    # chồng que lên hình thật (kiểm tỉ lệ)
    S = 3; hinh = Image.open(os.path.join(RA, 'nhan-vat-zed-dung.png'))
    nen = Image.new('RGBA', (O * S, O * S), (255, 255, 255, 255))
    to = hinh.resize((hinh.width * S, hinh.height * S), Image.NEAREST)
    a = to.getchannel('A').point(lambda v: int(v * 0.5)); to.putalpha(a)
    nen.alpha_composite(to, ((OG[0] - (GOC[0] - HOP[0])) * S, (OG[1] - (GOC[1] - HOP[1])) * S))
    nen = nen.convert('RGB'); ve_que(nen, dung[0], 0, 0, S); nen.save(os.path.join(RA, 'que-dung-chong-hinh.png'))
    json_que('que-dung.json', [dung], 1.2, 'đứng (dáng gốc, = nhan-vat.json)')

    di = dang_di(6); tam_que('', di, 0.15, '').save(os.path.join(RA, 'que-di-6.png')); json_que('que-di-6.json', di, 0.15, 'đi, 6 khung, lặp')
    ch = dang_chay(8); tam_que('', ch, 0.075, '').save(os.path.join(RA, 'que-chay-8.png')); json_que('que-chay-8.json', ch, 0.075, 'chạy, 8 khung, lặp')
    kk = dang_kiem(); tam_que('', kk, 0.08, '').save(os.path.join(RA, 'que-kiem-1-nhat.png'))
    json_que('que-kiem-1-nhat.json', kk, [0.12, 0.1, 0.06, 0.05, 0.1, 0.14],
             'đánh kiếm 1 nhát, 6 khung: ' + ', '.join(k[0] for k in KIEM) + '. Kiếm ở tay phải (gần), mui_kiem = mũi kiếm')
    # gif xem nhanh
    for ten, ks, ms in (('di-6', di, 150), ('chay-8', ch, 75), ('kiem-1-nhat', kk, 110)):
        fr = []
        for J, a in ks:
            f = Image.new('RGB', (O, O), TRANG); ImageDraw.Draw(f).line([(8, OG[1]), (O - 8, OG[1])], fill=(185, 185, 185))
            ve_que(f, J); fr.append(f.resize((O * 2, O * 2), Image.NEAREST))
        fr[0].save(os.path.join(RA, f'que-{ten}.gif'), save_all=True, append_images=fr[1:], duration=ms, loop=0)
    return dung, di, ch, kk

if __name__ == '__main__':
    os.makedirs(RA, exist_ok=True)
    lam_nhan_vat()
    lam_que()
    print('xong')
