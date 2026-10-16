# Bộ thử mặc đồ modular — Cu Tí MỚI (bộ ảnh docs/anh-goc/zed/moi/, đúng nhân vật đang chạy trong game).
# Chỉ là TÀI LIỆU, không đụng code game. Chạy từ thư mục gốc repo:   python3 docs/thu-modular/tao-bo-thu.py
#
# Phiên 3 (16/10/2026): làm lại toàn bộ. Bản trước dùng NHẦM Cu Tí cũ (zed-v2-canonical.png) → đã bỏ hết.
#
# Nguồn (đều của Cu Tí MỚI):
#   docs/anh-goc/zed/moi/00-anh-mau.png                       ảnh mẫu (chỉ để so bằng mắt + gửi kèm prompt)
#   docs/anh-goc/zed/moi/01-dung-gif/dung/khung-01.png         dáng đứng khung 1 (= hàng "dung" của game, cùng dáng ảnh mẫu)
#   docs/anh-goc/zed/moi/03-chay-v4-gif/03-chay-v4/khung-NN.png 12 khung chạy = hàng "chay" game ĐANG DÙNG
#        (game/js/zed_moi.js: hàng chay mặc định, kiếm/phi tiêu/tay không; dung-zed-game.py DONG: ('chay','03-chay-v4'))
#        (03-chay-2tay chỉ dùng khi cầm thương/búa — không làm ở bộ thử này)
#   docs/anh-goc/zed/moi/*-gif/bao-cao.json                   khung bao trên tấm gốc + điểm chân
#   docs/anh-goc/zed/dung-zed-game.py                         nạp như thư viện: cách game co + đặt khung vào ô 96×96
#   game/art/custom/zed-moi.sprite.json                       chỉ ĐỌC để soát: đặt khung của bộ thử phải trùng tấm game (IoU = 1)
#   docs/thu-modular/chinh-tay-dung.json, chinh-tay-chay.json TỆP CHỈNH TAY: khớp đo bằng mắt theo điểm ảnh ảnh khung
import importlib.util, io, base64, json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

GOC_REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RA = os.path.join(GOC_REPO, 'docs', 'thu-modular')
ZED = os.path.join(GOC_REPO, 'docs', 'anh-goc', 'zed')
_sp = importlib.util.spec_from_file_location('dung_zed_game', os.path.join(ZED, 'dung-zed-game.py'))
Z = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(Z)

FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONTB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def font(n, b=False): return ImageFont.truetype(FONTB if b else FONT, n)
DEN, DO, XAM, TRANG, XA = (0, 0, 0), (220, 30, 30), (150, 150, 150), (255, 255, 255), (70, 110, 200)

# ---------------------------------------------------------------- 0. ĐỌC KHUNG + ĐẶT Y NHƯ GAME
# (khoá, thư mục ảnh, tệp chỉnh tay, ô que (rộng, cao), x của điểm game x=24 trong ô, đường chân y)
DONG = {
    'dung': ('01-dung', 'chinh-tay-dung.json', (320, 544), 160, 520),
    'chay': ('03-chay-v4', 'chinh-tay-chay.json', (256, 320), 150, 308),
}
GIAY_KHUNG = {'dung': 1.0 / 8 * 1.25, 'chay': 0.6 / 12 * 1.25}   # giây/vòng của game × NHIP_LAP 1,25 (zed_moi.js) ÷ số khung

def r2(v): return [round(float(v[0]), 1), round(float(v[1]), 1)]

def doc_tat_ca():
    dung = Z.doc_dong('01-dung'); chay = Z.doc_dong('03-chay-v4')
    s = Z.CAO_96 / float(np.median([f['bb'][3] - f['bb'][1] for f in dung]))
    dd, dc = Z.co_dau_hang(dung), Z.co_dau_hang(chay)
    sk = {'dung': s, 'chay': s * math.sqrt(dd[0] / dc[0] * dd[1] / dc[1])}
    sprite = json.load(open(os.path.join(GOC_REPO, 'game', 'art', 'custom', 'zed-moi.sprite.json'), encoding='utf-8'))
    tam = Image.open(io.BytesIO(base64.b64decode(sprite['tam'].split(',')[1]))).convert('RGBA')
    ra = {}
    for k, fr in (('dung', dung), ('chay', chay)):
        thu, tep, (W, H), CX, GY = DONG[k]
        bc = json.load(open(os.path.join(ZED, 'moi', thu + '-gif', 'bao-cao.json'), encoding='utf-8'))['hang'][0]
        tay = json.load(open(os.path.join(RA, tep), encoding='utf-8'))['khung']
        hang = sprite['dong_tac'][k]['hang']
        ds = []
        n = 1 if k == 'dung' else len(fr)
        for i in range(n):
            f = fr[i]; im = f['im']
            # y hệt dung-zed-game.py dung_than(): co, đặt ngang theo tâm đầu (hàng lặp), chân xuống (48,90), dời nếu tràn
            nw, nh = max(1, round(im.width * sk[k])), max(1, round(im.height * sk[k])); sx, sy = nw / im.width, nh / im.height
            dx = round(Z.DAU_X - f['dau_x'] * sx); dy = round(90 - f['chan'][1] * sy)
            nho = im.resize((nw, nh), Image.BOX); bb = nho.getbbox()
            dx += max(0, -(dx + bb[0])) - max(0, dx + bb[2] - 96); dy += max(0, -(dy + bb[1])) - max(0, dy + bb[3] - 96)
            o = Image.new('RGBA', (96, 96), (0, 0, 0, 0)); o.paste(nho, (dx, dy), nho)
            a = np.array(o)[..., 3] > 0; t = np.array(tam.crop((i * 96, hang * 96, i * 96 + 96, hang * 96 + 96)))[..., 3] > 0
            iou = float((a & t).sum() / max(1, (a | t).sum()))
            ox = round(CX - (48 - dx) / sx); oy = round(GY - f['chan'][1])
            J = {m: tuple(v) for m, v in tay[i].items() if not m.startswith('_')}
            J['goc'] = ((48 - dx) / sx, f['chan'][1])    # điểm gốc = chỗ game đặt chân (48,90 ô 96 = [24,45] game)
            ds.append({'im': im, 'off': (ox, oy), 'sx': sx, 'sy': sy, 'dx': dx, 'dy': dy, 'iou': iou,
                       'kb': bc['khung'][i]['khung_bao'], 'J': J,
                       'nguon': f'docs/anh-goc/zed/moi/{thu}-gif/{bc["ten"]}/khung-{i + 1:02d}.png'})
        ra[k] = {'k': k, 'thu': thu, 'W': W, 'H': H, 'CX': CX, 'GY': GY, 'sk': sk[k], 'hang_game': hang, 'fr': ds}
    return ra

def o_cua(F, p): return (p[0] + F['off'][0], p[1] + F['off'][1])              # ảnh khung → ô que
def o96(F, p): return (F['dx'] + p[0] * F['sx'], F['dy'] + p[1] * F['sy'])     # ảnh khung → ô 96 (he_neo "nguon-96" của game)
def tam_goc(F, p): return (p[0] + F['kb'][0], p[1] + F['kb'][1])               # ảnh khung → tấm ảnh gốc 2172×724

# ---------------------------------------------------------------- 1. KHỚP, XƯƠNG, LỚP
KHOP = [  # (mã, tên)
    ('dinh_dau', 'Đỉnh đầu (đỉnh khối tóc, không tính tóc tua)'), ('tam_dau', 'Tâm đầu'), ('cam', 'Cằm'), ('co', 'Cổ (chân cổ)'),
    ('vai_phai', 'Vai phải (gần)'), ('vai_trai', 'Vai trái (xa)'), ('khuyu_phai', 'Khuỷu phải'), ('khuyu_trai', 'Khuỷu trái'),
    ('co_tay_phai', 'Cổ tay phải'), ('co_tay_trai', 'Cổ tay trái'), ('nam_tay_phai', 'Nắm tay phải'), ('nam_tay_trai', 'Nắm tay trái'),
    ('eo', 'Eo (giữa đai đỏ)'), ('hong', 'Hông (giữa chậu)'), ('hong_phai', 'Hông phải'), ('hong_trai', 'Hông trái'),
    ('goi_phai', 'Gối phải'), ('goi_trai', 'Gối trái'), ('co_chan_phai', 'Cổ chân phải'), ('co_chan_trai', 'Cổ chân trái'),
    ('mui_chan_phai', 'Mũi chân phải'), ('mui_chan_trai', 'Mũi chân trái'), ('goc', 'Điểm gốc (chỗ game đặt chân)'),
]
TEN_KHOP = dict(KHOP)
XUONG = [  # (mã, từ, đến, bộ phận, lớp)
    ('than', 'hong', 'co', 'than', 30), ('dau', 'co', 'dinh_dau', 'dau', 50),
    ('vai_phai', 'co', 'vai_phai', None, None), ('vai_trai', 'co', 'vai_trai', None, None),
    ('canh_tay_tren_phai', 'vai_phai', 'khuyu_phai', 'canh-tay-tren-phai', 70),
    ('canh_tay_duoi_phai', 'khuyu_phai', 'co_tay_phai', 'canh-tay-duoi-phai', 71),
    ('ban_tay_phai', 'co_tay_phai', 'nam_tay_phai', 'ban-tay-phai', 72),
    ('canh_tay_tren_trai', 'vai_trai', 'khuyu_trai', 'canh-tay-tren-trai', 10),
    ('canh_tay_duoi_trai', 'khuyu_trai', 'co_tay_trai', 'canh-tay-duoi-trai', 11),
    ('ban_tay_trai', 'co_tay_trai', 'nam_tay_trai', 'ban-tay-trai', 12),
    ('hong_phai', 'hong', 'hong_phai', None, None), ('hong_trai', 'hong', 'hong_trai', None, None),
    ('dui_phai', 'hong_phai', 'goi_phai', 'dui-phai', 40), ('cang_chan_phai', 'goi_phai', 'co_chan_phai', 'cang-chan-phai', 41),
    ('ban_chan_phai', 'co_chan_phai', 'mui_chan_phai', 'ban-chan-phai', 42),
    ('dui_trai', 'hong_trai', 'goi_trai', 'dui-trai', 20), ('cang_chan_trai', 'goi_trai', 'co_chan_trai', 'cang-chan-trai', 21),
    ('ban_chan_trai', 'co_chan_trai', 'mui_chan_trai', 'ban-chan-trai', 22),
]
LOP_DO = {'ao_choang_khan': 5, 'non_sau': 8, 'tay_trai (xa)': '10–12', 'chan_trai (xa)': '20–22', 'than': 30,
          'ao / giap': 35, 'dai / tui eo': 36, 'chan_phai (gần)': '40–42', 'quan (ống gần)': 45, 'dau': 50, 'mat_na': 55,
          'tay_phai (gần)': '70–72', 'vu_khi': 75, 'non_truoc / mu': 85}
def dai(a, b): return math.hypot(b[0] - a[0], b[1] - a[1])
def goc(a, b): return math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))  # 0° sang phải, 90° xuống

def ghi_json(ten, d):
    with open(os.path.join(RA, ten), 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=1)

# ---------------------------------------------------------------- 2. VẼ QUE
DOAN_VE = [  # (lớp, a, b, màu)
    (10, 'vai_trai', 'khuyu_trai', XA), (11, 'khuyu_trai', 'co_tay_trai', XA), (12, 'co_tay_trai', 'nam_tay_trai', XA),
    (20, 'hong_trai', 'goi_trai', XA), (21, 'goi_trai', 'co_chan_trai', XA), (22, 'co_chan_trai', 'mui_chan_trai', XA),
    (30, 'hong', 'co', DEN), (30, 'co', 'vai_phai', DEN), (30, 'co', 'vai_trai', DEN), (30, 'hong_phai', 'hong_trai', DEN),
    (40, 'hong_phai', 'goi_phai', DEN), (41, 'goi_phai', 'co_chan_phai', DEN), (42, 'co_chan_phai', 'mui_chan_phai', DEN),
    (70, 'vai_phai', 'khuyu_phai', DEN), (71, 'khuyu_phai', 'co_tay_phai', DEN), (72, 'co_tay_phai', 'nam_tay_phai', DEN),
]
def ve_que(im, J, ox=0, oy=0, S=1, w=None, so=False, mau_chu=(160, 0, 0)):
    """J: khớp theo toạ độ Ô QUE. Vẽ đè lên im (RGB/RGBA)."""
    d = ImageDraw.Draw(im)
    def q(m): return (ox + J[m][0] * S, oy + J[m][1] * S)
    w = w or max(2, round(1.6 * S))
    c = q('tam_dau'); r = dai(J['tam_dau'], J['dinh_dau']) * S
    d.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], outline=DEN, width=max(1, w - 1))
    d.line([q('co'), q('cam')], fill=DEN, width=max(1, w - 1))
    for _, a, b, col in sorted(DOAN_VE, key=lambda t: t[0]):
        d.line([q(a), q(b)], fill=col, width=w)
    rr = max(2, round(1.7 * S))
    for i, (m, _) in enumerate(KHOP, 1):
        x, y = q(m)
        if m == 'goc':
            d.line([(x - 5 * S, y), (x + 5 * S, y)], fill=DO, width=2); d.line([(x, y - 5 * S), (x, y)], fill=DO, width=2); continue
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=DO, outline=TRANG if S >= 2 else None)
        if so:
            d.text((x + rr + 1, y - rr - 12), str(i), fill=mau_chu, font=font(max(10, round(6 * S)), True), stroke_width=2, stroke_fill=TRANG)

def J_o(F): return {m: o_cua(F, p) for m, p in F['J'].items()}

def nen_o(D, S, luoi=False, so_luoi=True):
    W, H = D['W'], D['H']
    im = Image.new('RGB', (W * S, H * S), TRANG); d = ImageDraw.Draw(im)
    if luoi:
        for v in range(0, max(W, H) + 1, 8):
            c = (205, 218, 255) if v % 32 else (120, 150, 230)
            if v <= W: d.line([(v * S, 0), (v * S, H * S)], fill=c)
            if v <= H: d.line([(0, v * S), (W * S, v * S)], fill=c)
        if so_luoi:
            for v in range(0, W, 32): d.text((v * S + 2, 2), str(v), fill=(40, 70, 170), font=font(10))
            for v in range(32, H, 32): d.text((2, v * S + 2), str(v), fill=(40, 70, 170), font=font(10))
    d.line([(0, D['GY'] * S), (W * S, D['GY'] * S)], fill=(160, 160, 160), width=max(1, S // 2 + 1))
    d.rectangle([0, 0, W * S - 1, H * S - 1], outline=(200, 200, 200))
    return im

def dan_hinh(im, F, S, ox=0, oy=0, mo=1.0):
    h = F['im'].resize((F['im'].width * S, F['im'].height * S), Image.NEAREST) if S != 1 else F['im'].copy()
    if mo < 1: h.putalpha(h.getchannel('A').point(lambda v: int(v * mo)))
    im.paste(h, (ox + F['off'][0] * S, oy + F['off'][1] * S), h)

def tam_o(D, S=1, nen='', so=False, luoi=False, cot=None, nhan=None, ham=None):
    """Nhiều ô xếp hàng (cot ô mỗi hàng). nen: '' | 'mo' (Cu Tí mờ) | 'that' (Cu Tí thật rõ, que mảnh)."""
    n = len(D['fr']); cot = cot or n; hang = (n + cot - 1) // cot
    W, H = D['W'] * S, D['H'] * S + 24
    o = Image.new('RGB', (cot * W, hang * H), TRANG)
    for i, F in enumerate(D['fr']):
        ox, oy = (i % cot) * W, (i // cot) * H
        c = nen_o(D, S, luoi)
        if nen: dan_hinh(c, F, S, mo=0.45 if nen == 'mo' else 1.0)
        if ham: ham(c, F, S)
        else: ve_que(c, J_o(F), 0, 0, S, w=max(1, round(S * (0.9 if nen == 'that' else 1.6))), so=so)
        o.paste(c, (ox, oy))
        ImageDraw.Draw(o).text((ox + 6, oy + D['H'] * S + 3), nhan[i] if nhan else f'khung {i + 1}', fill=(200, 0, 0), font=font(15, True))
    return o

def gif(D, ten, S, nen, ham=None):
    fr = []
    for F in D['fr']:
        c = nen_o(D, S)
        if nen: dan_hinh(c, F, S, mo=1.0 if nen == 'that' else 0.45)
        if ham: ham(c, F, S)
        else: ve_que(c, J_o(F), 0, 0, S, w=max(1, round(S * (0.9 if nen == 'that' else 1.6))))
        fr.append(c)
    fr[0].save(os.path.join(RA, ten), save_all=True, append_images=fr[1:], duration=round(GIAY_KHUNG[D['k']] * 1000), loop=0)

# ---------------------------------------------------------------- 3. NEO ĐỒ + JSON
CHUOI = {'than': ('hong', 'co'), 'dau': ('co', 'dinh_dau'),
         'ttp': ('vai_phai', 'khuyu_phai'), 'tdp': ('khuyu_phai', 'co_tay_phai'), 'btp': ('co_tay_phai', 'nam_tay_phai'),
         'ttt': ('vai_trai', 'khuyu_trai'), 'tdt': ('khuyu_trai', 'co_tay_trai'), 'btt': ('co_tay_trai', 'nam_tay_trai'),
         'dp': ('hong_phai', 'goi_phai'), 'cp': ('goi_phai', 'co_chan_phai'), 'bcp': ('co_chan_phai', 'mui_chan_phai'),
         'dt': ('hong_trai', 'goi_trai'), 'ct': ('goi_trai', 'co_chan_trai'), 'bct': ('co_chan_trai', 'mui_chan_trai')}
def goc_doan(J): return {k: round(goc(J[a], J[b]), 1) for k, (a, b) in CHUOI.items()}

def neo_do(J, A, A0, tl):
    """J: khớp ô que; A: góc đoạn khung này; A0: góc đoạn dáng đứng; tl: cỡ người so với ô que dáng đứng."""
    lech = lambda k: round(((A[k] - A0[k] + 180) % 360) - 180, 1)
    # lưng: lệch ra sau thân (phía trái màn hình) 0,35 × bề vai, ở 40% từ cổ xuống eo
    u = (J['co'][0] - J['eo'][0], J['co'][1] - J['eo'][1])
    lung = (J['co'][0] - u[0] * 0.4 - 0.35 * abs(J['vai_trai'][0] - J['vai_phai'][0]), J['co'][1] - u[1] * 0.4)
    return {
        'ti_le_so_voi_dung': round(tl, 4),
        'ao': {'bam': 'than', 'neo': 'co', 'co': r2(J['co']), 'eo': r2(J['eo']), 'vai_phai': r2(J['vai_phai']), 'vai_trai': r2(J['vai_trai']),
               'hong_phai': r2(J['hong_phai']), 'hong_trai': r2(J['hong_trai']), 'goc_do': A['than'], 'xoay_so_voi_dung': lech('than'),
               'tay_ao_phai': {'vai': r2(J['vai_phai']), 'khuyu': r2(J['khuyu_phai']), 'goc_do': A['ttp'], 'xoay_so_voi_dung': lech('ttp')},
               'tay_ao_trai': {'vai': r2(J['vai_trai']), 'khuyu': r2(J['khuyu_trai']), 'goc_do': A['ttt'], 'xoay_so_voi_dung': lech('ttt')}},
        'quan': {'bam': 'than+dui+cang', 'neo': 'hong', 'eo': r2(J['eo']), 'hong': r2(J['hong']),
                 'ong_phai': {'hong': r2(J['hong_phai']), 'goi': r2(J['goi_phai']), 'co_chan': r2(J['co_chan_phai']),
                              'goc_dui': A['dp'], 'goc_cang': A['cp'], 'xoay_dui': lech('dp'), 'xoay_cang': lech('cp')},
                 'ong_trai': {'hong': r2(J['hong_trai']), 'goi': r2(J['goi_trai']), 'co_chan': r2(J['co_chan_trai']),
                              'goc_dui': A['dt'], 'goc_cang': A['ct'], 'xoay_dui': lech('dt'), 'xoay_cang': lech('ct')}},
        'toc_mu': {'bam': 'dau', 'neo': 'tam_dau', 'tam_dau': r2(J['tam_dau']), 'dinh_dau': r2(J['dinh_dau']), 'co': r2(J['co']),
                   'cam': r2(J['cam']), 'ban_kinh_dau': round(dai(J['tam_dau'], J['dinh_dau']), 1),
                   'goc_do': A['dau'], 'xoay_so_voi_dung': lech('dau')},
        'phu_kien': {'lung': r2(lung), 'eo_treo_tui': r2(J['eo']),
                     'tay_cam_phai': r2(J['nam_tay_phai']), 'tay_cam_trai': r2(J['nam_tay_trai']),
                     'gang_phai': {'co_tay': r2(J['co_tay_phai']), 'goc_do': A['tdp'], 'xoay_so_voi_dung': lech('tdp')},
                     'gang_trai': {'co_tay': r2(J['co_tay_trai']), 'goc_do': A['tdt'], 'xoay_so_voi_dung': lech('tdt')},
                     'giay_phai': {'co_chan': r2(J['co_chan_phai']), 'mui': r2(J['mui_chan_phai']), 'goc_do': A['bcp'], 'xoay_so_voi_dung': lech('bcp')},
                     'giay_trai': {'co_chan': r2(J['co_chan_trai']), 'mui': r2(J['mui_chan_trai']), 'goc_do': A['bct'], 'xoay_so_voi_dung': lech('bct')}},
    }

HE_TOA_DO = {
    'goc': 'GỐC (0,0) = GÓC TRÊN-TRÁI. x sang phải, y xuống, đơn vị điểm ảnh.',
    'khop_px': 'toạ độ trong Ô QUE của khung đó (ô i ở x = (i−1)×rộng_ô trên tấm que-*.png). 1 điểm ảnh ô = 1 điểm ảnh ảnh nguồn.',
    'khop_nguon': 'toạ độ trên ảnh khung đã cắt (anh_nguon). = khop_px − dat_trong_o.',
    'khop_tam_goc': 'toạ độ trên tấm ảnh gốc 2172×724 (docs/anh-goc/zed/moi/<thư mục>.png). = khop_nguon + khung_bao_tren_tam[0..1].',
    'khop_o96': 'toạ độ ô 96×96 của tấm game zed-moi.sprite.json (he_neo "nguon-96", chân tại 48,90). = game.dx + x_nguon×game.sx.',
    'khop_game': 'điểm ảnh game trong khung 48×48 (= khop_o96 ÷ 2); chân game tại [24,45].',
    'khop_game_tu_chan': 'điểm ảnh game tính từ chân (= khop_game − [24,45]); đây là số game cộng với vị trí nhân vật.',
    'goc_do': '0° = sang phải, 90° = thẳng xuống, −90° = thẳng lên. xoay_so_voi_dung dương = theo chiều kim đồng hồ trên màn hình.',
}

def json_que(D, D0, ten, mo_ta):
    A0 = goc_doan(J_o(D0['fr'][0]))
    ds = []
    for i, F in enumerate(D['fr']):
        Jo = J_o(F); A = goc_doan(Jo); tl = F['sx'] and D0['fr'][0]['sx'] / F['sx']
        ds.append({'khung': i + 1, 'anh_nguon': F['nguon'], 'dat_trong_o': list(F['off']), 'khung_bao_tren_tam': F['kb'],
                   'game': {'hang': D['hang_game'], 'cot': i, 'sx': round(F['sx'], 5), 'sy': round(F['sy'], 5), 'dx': F['dx'], 'dy': F['dy'],
                            'trung_tam_game_iou': round(F['iou'], 4)},
                   'khop_px': {m: r2(v) for m, v in Jo.items()},
                   'khop_nguon': {m: r2(v) for m, v in F['J'].items()},
                   'khop_tam_goc': {m: r2(tam_goc(F, v)) for m, v in F['J'].items()},
                   'khop_o96': {m: [round(x, 2) for x in o96(F, v)] for m, v in F['J'].items()},
                   'khop_game': {m: [round(x / 2, 2) for x in o96(F, v)] for m, v in F['J'].items()},
                   'khop_game_tu_chan': {m: [round(o96(F, v)[0] / 2 - 24, 2), round(o96(F, v)[1] / 2 - 45, 2)] for m, v in F['J'].items()},
                   'goc_doan_do': A,
                   'neo_do': neo_do(Jo, A, A0, tl)})
    d = {'loai': 'linh-khi-thu-modular-que', 'phien_ban': 3, 'nhan_vat': 'Cu Tí MỚI (zed-moi, bộ ảnh docs/anh-goc/zed/moi/)',
         'dong_tac': mo_ta, 'so_khung': len(ds), 'giay_moi_khung': round(GIAY_KHUNG[D['k']], 4),
         'anh_tam_goc': f'docs/anh-goc/zed/moi/{D["thu"]}.png', 'o': [D['W'], D['H']], 'goc_trong_o': [D['CX'], D['GY']],
         'duong_chan_y': D['GY'], 'he_toa_do': HE_TOA_DO, 'khoa_goc': {k: f'{a}→{b}' for k, (a, b) in CHUOI.items()},
         'cach_gan_do': 'Đồ vẽ trên ô que dáng đứng (que-dung.json). Ở khung k: đặt điểm neo của đồ trùng neo của khung (vd áo: co), '
                        'xoay quanh neo một góc = xoay_so_voi_dung, co theo neo_do.ti_le_so_voi_dung (Cu Tí chạy trong ảnh nguồn nhỏ hơn '
                        'Cu Tí đứng; ra game cả hai cùng cỡ).',
         'thu_tu_lop': LOP_DO, 'xuong': [x[:3] for x in XUONG], 'khung': ds}
    ghi_json(ten, d)
    return d

# ---------------------------------------------------------------- 4. NHÂN VẬT MẪU ĐỨNG
def lam_nhan_vat(D):
    F = D['fr'][0]; im = F['im']
    im.save(os.path.join(RA, 'nhan-vat-cu-ti-dung.png'))
    S = 2; L = 30; bang_w = 820
    W = D['W'] * S; H = D['H'] * S
    o = Image.new('RGB', (W + bang_w, max(H, 60 + 30 * len(KHOP) + 120)), TRANG)
    c = nen_o(D, S); dan_hinh(c, F, S, mo=0.55); Jo = J_o(F)
    ve_que(c, Jo, 0, 0, S, w=3, so=True); o.paste(c, (0, 0)); d = ImageDraw.Draw(o)
    bx, y = W + 16, 16
    d.text((bx, y), 'Cu Tí MỚI — đứng, khung 1 (= hàng "dung" của game)', fill=DEN, font=font(21, True)); y += 32
    d.text((bx, y), 'Ảnh: moi/01-dung-gif/dung/khung-01.png (cắt từ moi/01-dung.png). Hình ×2.', fill=DEN, font=font(14)); y += 22
    d.text((bx, y), 'Cột: ô que (gốc trên-trái ô 320×544) | ảnh khung | tấm gốc | game 48×48', fill=DEN, font=font(14)); y += 28
    for i, (m, ten) in enumerate(KHOP, 1):
        p = F['J'][m]; q = Jo[m]; t = tam_goc(F, p); g = o96(F, p)
        d.text((bx, y), f'{i:>2}. {ten}', fill=DEN, font=font(14))
        d.text((bx + 360, y), f'[{q[0]:.0f},{q[1]:.0f}]', fill=(160, 0, 0), font=font(14, True))
        d.text((bx + 455, y), f'[{p[0]:.0f},{p[1]:.0f}]', fill=(90, 90, 90), font=font(14))
        d.text((bx + 550, y), f'[{t[0]:.0f},{t[1]:.0f}]', fill=(90, 90, 90), font=font(14))
        d.text((bx + 655, y), f'[{g[0] / 2:.1f},{g[1] / 2:.1f}]', fill=(0, 90, 160), font=font(14)); y += 30
    y += 8
    for t in ['Phải/trái = của NHÂN VẬT. Phải = gần người xem (bên trái màn hình), vẽ TRƯỚC thân.',
              'Trái = xa (bên phải màn hình), vẽ SAU thân (que màu xanh lam).',
              f'Game: 1 điểm ảnh game = {1 / (F["sx"] * 0.5):.2f} điểm ảnh ảnh khung. Chân game [24,45] = ô ({D["CX"]},{D["GY"]}).']:
        d.text((bx, y), t, fill=DEN, font=font(14)); y += 22
    o.save(os.path.join(RA, 'nhan-vat-khop.png'))
    xuong = {}
    for m, a, b, bp, lop in XUONG:
        xuong[m] = {'tu': a, 'den': b, 'do_dai_px': round(dai(Jo[a], Jo[b]), 1),
                    'do_dai_game': round(dai(Jo[a], Jo[b]) * F['sx'] / 2, 2), 'goc_do': round(goc(Jo[a], Jo[b]), 1), 'bo_phan': bp, 'lop': lop}
    ghi_json('nhan-vat.json', {
        'loai': 'linh-khi-thu-modular-nhan-vat', 'phien_ban': 3, 'nhan_vat': 'Cu Tí MỚI (zed-moi)',
        'anh_mau': 'docs/anh-goc/zed/moi/00-anh-mau.png (cùng dáng, dùng gửi kèm prompt)',
        'anh_goc': 'docs/anh-goc/zed/moi/01-dung.png (tấm 2172×724, khung 1)', 'anh_khung': F['nguon'],
        'anh_cat_nen_trong': 'docs/thu-modular/nhan-vat-cu-ti-dung.png (= anh_khung)',
        'huong': 'nghiêng 3/4 sang phải. phải/trái = của nhân vật; phải = gần người xem = bên trái màn hình',
        'he_toa_do': HE_TOA_DO, 'o_que': [D['W'], D['H']], 'dat_trong_o': list(F['off']), 'khung_bao_tren_tam': F['kb'],
        'co_anh_khung': list(im.size),
        'game': {'tep': 'game/art/custom/zed-moi.sprite.json', 'hang': D['hang_game'], 'sx': round(F['sx'], 5), 'sy': round(F['sy'], 5),
                 'dx': F['dx'], 'dy': F['dy'], 'khung_game': [48, 48], 'chan_game': [24, 45], 'trung_tam_game_iou': round(F['iou'], 4)},
        'chieu_cao': {'px': round(F['J']['goc'][1] - min(np.nonzero(np.array(im)[..., 3] > 0)[0]), 1), 'game': Z.CAO_96 / 2,
                      'dau_tren_than': round((F['J']['cam'][1] - F['J']['dinh_dau'][1]) / (F['J']['goc'][1] - F['J']['dinh_dau'][1]), 2)},
        'khop': {m: {'ten': TEN_KHOP[m], 'px': r2(Jo[m]), 'nguon': r2(F['J'][m]), 'tam_goc': r2(tam_goc(F, F['J'][m])),
                     'o96': [round(x, 2) for x in o96(F, F['J'][m])], 'game': [round(x / 2, 2) for x in o96(F, F['J'][m])]} for m, _ in KHOP},
        'xuong': xuong, 'thu_tu_lop': LOP_DO,
        'ghi_chu': ['Khớp đặt bằng mắt trên ảnh phóng ×2 có lưới (tệp chỉnh tay chinh-tay-dung.json), sai khoảng ±3 điểm ảnh ảnh khung (±0,2 điểm game).',
                    'Điểm gốc tính từ cách game đặt khung (dung-zed-game.py), không đo tay.']})

# ---------------------------------------------------------------- 5. BỘ PHẬN TÁCH LỚP (điểm ảnh thật của Cu Tí, theo xương từng khung)
BO_PHAN = [  # (tên, từ, đến, bán kính ở dáng đứng (điểm ảnh ảnh khung đứng), lớp, màu bản đồ)
    ('dau', 'co', 'dinh_dau', 0, 50, (240, 200, 60)), ('than', 'hong', 'co', 0, 30, (120, 120, 120)),
    ('canh-tay-tren-phai', 'vai_phai', 'khuyu_phai', 22, 70, (230, 80, 80)), ('canh-tay-duoi-phai', 'khuyu_phai', 'co_tay_phai', 19, 71, (250, 140, 60)),
    ('ban-tay-phai', 'co_tay_phai', 'nam_tay_phai', 19, 72, (255, 200, 150)),
    ('canh-tay-tren-trai', 'vai_trai', 'khuyu_trai', 22, 10, (120, 60, 160)), ('canh-tay-duoi-trai', 'khuyu_trai', 'co_tay_trai', 19, 11, (170, 110, 220)),
    ('ban-tay-trai', 'co_tay_trai', 'nam_tay_trai', 19, 12, (220, 180, 240)),
    ('dui-phai', 'hong_phai', 'goi_phai', 44, 40, (40, 140, 60)), ('cang-chan-phai', 'goi_phai', 'co_chan_phai', 32, 41, (90, 200, 90)),
    ('ban-chan-phai', 'co_chan_phai', 'mui_chan_phai', 26, 42, (180, 240, 160)),
    ('dui-trai', 'hong_trai', 'goi_trai', 44, 20, (30, 90, 170)), ('cang-chan-trai', 'goi_trai', 'co_chan_trai', 32, 21, (70, 150, 230)),
    ('ban-chan-trai', 'co_chan_trai', 'mui_chan_trai', 26, 22, (160, 210, 250)),
]

def kc_doan(xx, yy, a, b):
    ax, ay = a; bx, by = b; vx, vy = bx - ax, by - ay; L2 = vx * vx + vy * vy or 1
    t = np.clip(((xx - ax) * vx + (yy - ay) * vy) / L2, 0, 1)
    return np.hypot(xx - (ax + t * vx), yy - (ay + t * vy))

def tach_lop(F, tl):
    """Gán mỗi điểm ảnh của khung cho 1 bộ phận: trong nhiều bộ phận → lấy lớp trên cùng; ngoài tất cả → bộ phận gần nhất.
    Đầu = mọi điểm ảnh phía trên đường cổ (vuông góc trục thân, qua 'co' lùi 4%). Thân = tứ giác vai–hông nở 8%."""
    im = F['im']; a = np.array(im); H, W = a.shape[:2]; J = F['J']
    yy, xx = np.mgrid[:H, :W].astype(float); dac = a[..., 3] > 0
    ux, uy = J['co'][0] - J['hong'][0], J['co'][1] - J['hong'][1]; L = math.hypot(ux, uy); ux, uy = ux / L, uy / L
    chieu = (xx - J['co'][0]) * ux + (yy - J['co'][1]) * uy           # > 0: phía trên cổ theo trục thân
    kc = {}
    kc['dau'] = np.where(chieu > -0.04 * L, 0.0, 1e3)
    m = Image.new('L', (W, H), 0); pts = [J['vai_phai'], J['co'], J['vai_trai'], J['hong_trai'], J['hong_phai']]
    cx = sum(p[0] for p in pts) / 5; cy = sum(p[1] for p in pts) / 5
    ImageDraw.Draw(m).polygon([(cx + (p[0] - cx) * 1.08, cy + (p[1] - cy) * 1.08) for p in pts], fill=1)
    tg = np.array(m) > 0
    kc['than'] = np.where(tg, 0.0, ndimage.distance_transform_edt(~tg)) + np.where(chieu > -0.04 * L, 1e3, 0)
    for ten, a_, b_, r, lop, _ in BO_PHAN[2:]:
        kc[ten] = kc_doan(xx, yy, J[a_], J[b_]) - r * tl
    ten_ds = [b[0] for b in BO_PHAN]; lop = np.array([b[4] for b in BO_PHAN])
    K = np.stack([kc[t] for t in ten_ds])
    trong = K <= 0
    diem_trong = np.where(trong, lop[:, None, None], -1)
    chon = np.where(trong.any(0), diem_trong.argmax(0), K.argmin(0))
    return {t: (chon == j) & dac for j, t in enumerate(ten_ds)}

def lam_bo_phan(Ds, D0):
    os.makedirs(os.path.join(RA, 'bo-phan'), exist_ok=True)
    for f in os.listdir(os.path.join(RA, 'bo-phan')):
        p = os.path.join(RA, 'bo-phan', f)
        if os.path.isfile(p): os.remove(p)        # bỏ 14 ảnh bộ phận que của bản Cu Tí cũ
    out = {}; ban_do = {}
    for k, D in Ds.items():
        thu = os.path.join(RA, 'bo-phan', k); os.makedirs(thu, exist_ok=True)
        n = len(D['fr']); W, H = D['W'], D['H']
        strip = {b[0]: Image.new('RGBA', (n * W, H), (0, 0, 0, 0)) for b in BO_PHAN}
        bd = Image.new('RGBA', (n * W, H), (0, 0, 0, 0))
        meta = {b[0]: [] for b in BO_PHAN}
        for i, F in enumerate(D['fr']):
            tl = D0['fr'][0]['sx'] / F['sx']
            M = tach_lop(F, tl); a = np.array(F['im']); ox, oy = F['off']
            mau = np.zeros_like(a)
            for ten, a_, b_, r, lop, col in BO_PHAN:
                c = a.copy(); c[..., 3] = np.where(M[ten], a[..., 3], 0)
                ci = Image.fromarray(c); strip[ten].alpha_composite(ci, (i * W + ox, oy))
                mau[M[ten]] = list(col) + [255]
                Jo = J_o(F); bb = ci.getbbox()
                meta[ten].append({'khung': i + 1, 'pivot': a_, 'pivot_px': r2(Jo[a_]), 'khop_cuoi': b_, 'khop_cuoi_px': r2(Jo[b_]),
                                  'goc_do': round(goc(Jo[a_], Jo[b_]), 1), 'do_dai_px': round(dai(Jo[a_], Jo[b_]), 1),
                                  'hop_px': [bb[0] + ox, bb[1] + oy, bb[2] + ox, bb[3] + oy] if bb else None,
                                  'so_diem_anh': int(M[ten].sum())})
            bd.alpha_composite(Image.fromarray(mau), (i * W + ox, oy))
        for ten in strip: strip[ten].save(os.path.join(thu, ten + '.png'))
        bd.save(os.path.join(thu, '_ban-do-mau.png')); ban_do[k] = bd
        out[k] = {'thu_muc': f'bo-phan/{k}/', 'o': [W, H], 'so_khung': n,
                  'bo_phan': {b[0]: {'anh': f'bo-phan/{k}/{b[0]}.png', 'lop': b[4], 'mau_ban_do': '#%02x%02x%02x' % b[5],
                                     'tu': b[1], 'den': b[2], 'khung': meta[b[0]]} for b in BO_PHAN}}
    ghi_json('bo-phan.json', {
        'loai': 'linh-khi-thu-modular-bo-phan', 'phien_ban': 3, 'nhan_vat': 'Cu Tí MỚI (zed-moi)',
        'ghi_chu': ['Mỗi bộ phận là ĐIỂM ẢNH THẬT của Cu Tí mới, tách tự động theo khung xương từng khung (không vẽ lại).',
                    'Mỗi ảnh bo-phan/<dong>/<bo-phan>.png là một hàng ô cùng cỡ ô que (dung: 1 ô 320×544, chay: 12 ô 256×320), '
                    'cùng toạ độ que-*.json → chồng tất cả ảnh theo lớp (số nhỏ trước) sẽ ra lại đúng Cu Tí.',
                    'Cách tách: điểm ảnh nằm trong vùng nhiều bộ phận → bộ phận lớp cao nhất; ngoài tất cả → bộ phận gần nhất. '
                    'Đầu = phía trên đường cổ. Thân = tứ giác vai–hông. Tay/chân = dải quanh xương, bán kính ở dáng đứng × ti_le.',
                    'Chỗ chồng lấn (tay gần đè thân, ống quần rộng, đai bay) tách xấp xỉ, sai vài điểm ảnh ở mép — để thử, không phải asset.',
                    '_ban-do-mau.png: tô mỗi bộ phận một màu (bảng mau_ban_do) để soát nhanh.'],
        'dong_tac': out})
    # ảnh tổng: bản đồ màu từng khung + bung rời dáng đứng
    S = 1; D = Ds['chay']; W, H = D['W'], D['H']
    o = Image.new('RGB', (6 * W + 20, 2 * (H + 26) + 640), TRANG); d = ImageDraw.Draw(o)
    d.text((10, 6), 'Bộ phận tách lớp — Cu Tí MỚI. Trên: 12 khung chạy tô màu theo bộ phận. Dưới: dáng đứng bung rời + bảng màu', fill=DEN, font=font(18, True))
    bd = ban_do['chay']
    for i in range(12):
        c = Image.new('RGB', (W, H), TRANG); c.paste(bd.crop((i * W, 0, i * W + W, H)), (0, 0), bd.crop((i * W, 0, i * W + W, H)))
        ve_que(c, J_o(D['fr'][i]), 0, 0, 1, w=1)
        x, y = 10 + (i % 6) * W, 34 + (i // 6) * (H + 26); o.paste(c, (x, y)); d.rectangle([x, y, x + W - 1, y + H - 1], outline=(210, 210, 210))
        d.text((x + 4, y + H + 2), f'khung {i + 1}', fill=(200, 0, 0), font=font(13, True))
    y0 = 34 + 2 * (H + 26)
    F = Ds['dung']['fr'][0]; M = tach_lop(F, 1.0); a = np.array(F['im'])
    cx = sum(F['J'][m][0] for m in ('hong', 'co')) / 2; cy = sum(F['J'][m][1] for m in ('hong', 'co')) / 2
    k_ = 0.55; bung = 0.18
    for ten, a_, b_, r, lop, col in sorted(BO_PHAN, key=lambda b: b[4]):
        c = a.copy(); c[..., 3] = np.where(M[ten], a[..., 3], 0); ci = Image.fromarray(c)
        if ten == 'than': dxy = (0, 0)
        else:
            mx = (F['J'][a_][0] + F['J'][b_][0]) / 2; my = (F['J'][a_][1] + F['J'][b_][1]) / 2
            dxy = ((mx - cx) * bung, (my - cy) * bung)
        ci = ci.resize((round(ci.width * k_), round(ci.height * k_)), Image.NEAREST)
        o.paste(ci, (round(40 + dxy[0] * k_), round(y0 + 30 + dxy[1] * k_)), ci)
    bdd = ban_do['dung']; bdd = bdd.resize((round(bdd.width * k_), round(bdd.height * k_)), Image.NEAREST)
    o.paste(bdd, (300, y0 + 30), bdd)
    yy = y0 + 20
    for ten, a_, b_, r, lop, col in BO_PHAN:
        d.rectangle([520, yy, 540, yy + 16], fill=col, outline=DEN); d.text((548, yy), f'{ten}  (lớp {lop})', fill=DEN, font=font(14)); yy += 22
    d.text((820, y0 + 20), 'Trái: đứng bung rời (mỗi mảnh dời ra khỏi thân).', fill=DEN, font=font(14))
    d.text((820, y0 + 42), 'Giữa: đứng tô màu. Ảnh rời từng bộ phận:', fill=DEN, font=font(14))
    d.text((820, y0 + 64), 'bo-phan/dung/*.png, bo-phan/chay/*.png', fill=DEN, font=font(14))
    o = o.crop((0, 0, o.width, y0 + 30 + round(Ds['dung']['H'] * k_) + 10)); o.save(os.path.join(RA, 'bo-phan.png'))
    return out

# ---------------------------------------------------------------- 6. ĐỒ THỬ (máy vẽ hình đơn giản, đặt theo neo từng khung)
DO_THU = [  # (mã, tên, lớp, màu)
    ('non', 'nón lá (bám đầu)', 85, (214, 182, 100)), ('giap', 'giáp ngực (bám thân)', 35, (130, 84, 44)),
    ('tui', 'túi đeo eo (bám eo)', 36, (80, 140, 60)), ('xa_cap_phai', 'xà cạp ống phải (bám cẳng chân)', 41, (60, 90, 170)),
    ('xa_cap_trai', 'xà cạp ống trái', 21, (40, 60, 120)), ('bao_tay_phai', 'bao tay phải (bám cẳng tay)', 71, (190, 40, 40)),
    ('bao_tay_trai', 'bao tay trái', 11, (120, 30, 30)),
]
def hinh_do(ma, J, tl):
    """Đa giác (toạ độ ô que) của một món đồ thử ở khung có khớp J. tl = cỡ người so với dáng đứng."""
    def lerp(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
    def dai_bang(a, b, t0, t1, r):
        p, q = lerp(a, b, t0), lerp(a, b, t1); L = dai(a, b) or 1; nx, ny = -(b[1] - a[1]) / L * r, (b[0] - a[0]) / L * r
        return [(p[0] + nx, p[1] + ny), (q[0] + nx, q[1] + ny), (q[0] - nx, q[1] - ny), (p[0] - nx, p[1] - ny)]
    if ma == 'non':
        c, t = J['tam_dau'], J['dinh_dau']; R = dai(c, t); ux, uy = (t[0] - c[0]) / R, (t[1] - c[1]) / R; px, py = -uy, ux
        dinh = (c[0] + ux * 1.3 * R, c[1] + uy * 1.3 * R); goc_ = (c[0] + ux * 0.3 * R, c[1] + uy * 0.3 * R)
        return [dinh, (goc_[0] + px * 1.4 * R, goc_[1] + py * 1.4 * R), (goc_[0] - px * 1.4 * R, goc_[1] - py * 1.4 * R)]
    if ma == 'giap':
        A, B = lerp(J['co'], J['vai_phai'], 0.85), lerp(J['co'], J['vai_trai'], 0.85)
        vx, vy = (B[0] - A[0]) * 0.42, (B[1] - A[1]) * 0.42; e = lerp(J['co'], J['eo'], 0.92)
        return [A, lerp(J['co'], J['eo'], 0.12), B, (e[0] + vx, e[1] + vy), (e[0] - vx, e[1] - vy)]
    if ma == 'tui':
        e = J['eo']; L = dai(J['hong'], J['co']); ux, uy = (J['co'][0] - J['hong'][0]) / L, (J['co'][1] - J['hong'][1]) / L
        c = (e[0] - 12 * tl - ux * 8 * tl, e[1] - uy * 8 * tl + 10 * tl)
        return dai_bang((c[0] + ux * 9 * tl, c[1] + uy * 9 * tl), (c[0] - ux * 13 * tl, c[1] - uy * 13 * tl), 0, 1, 11 * tl)
    s = ma.split('_')[-1]
    if ma.startswith('xa_cap'): return dai_bang(J['goi_' + s], J['co_chan_' + s], 0.25, 1.0, 21 * tl)
    if ma.startswith('bao_tay'): return dai_bang(J['khuyu_' + s], J['co_tay_' + s], 0.3, 1.05, 13 * tl)

def ve_do(c, F, S, D0, nen=True, chon=None):
    """Cu Tí thật + đồ thử chen ĐÚNG LỚP: lớp đồ < 30 vẽ dưới thân → dưới Cu Tí; còn lại vẽ trên.
    (Cu Tí là 1 ảnh phẳng nên đồ lớp xa chỉ thấy ở chỗ lòi ra ngoài người.)"""
    tl = D0['fr'][0]['sx'] / F['sx']; Jo = J_o(F)
    ds = [x for x in DO_THU if not chon or x[0] in chon]
    def ve(lst):
        lop = Image.new('RGBA', c.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lop)
        for ma, ten, l, col in sorted(lst, key=lambda x: x[2]):
            pts = [(p[0] * S, p[1] * S) for p in hinh_do(ma, Jo, tl)]
            d.polygon(pts, fill=col + (235,), outline=(25, 20, 15, 255), width=max(1, S))
        c.paste(lop, (0, 0), lop)
    ve([x for x in ds if x[2] < 30])
    if nen: dan_hinh(c, F, S)
    ve([x for x in ds if x[2] >= 30])

def lam_ghep(Ds):
    D0 = Ds['dung']; D = Ds['chay']
    tam_o(D, S=2, cot=6, ham=lambda c, F, S: ve_do(c, F, S, D0)).save(os.path.join(RA, 'ghep-thu-chay-12.png'))
    gif(D, 'ghep-thu-chay-12.gif', 2, '', ham=lambda c, F, S: ve_do(c, F, S, D0))
    tam_o(D0, S=1, ham=lambda c, F, S: ve_do(c, F, S, D0), nhan=['đứng: đồ thử đặt bằng neo']).save(os.path.join(RA, 'ghep-thu-dung.png'))

# ---------------------------------------------------------------- 7. ẢNH NEO TỪNG KHUNG
NEO_VE = [('ao', 'co', (0, 150, 90)), ('ao', 'eo', (0, 150, 90)), ('quan', 'hong', (40, 80, 200)), ('toc_mu', 'tam_dau', (200, 120, 0)),
          ('toc_mu', 'dinh_dau', (200, 120, 0)), ('phu_kien', 'lung', (150, 0, 150)), ('phu_kien', 'tay_cam_phai', (150, 0, 150)),
          ('phu_kien', 'tay_cam_trai', (150, 0, 150))]
def ve_neo(c, F, S, Q):
    dan_hinh(c, F, S, mo=0.5); N = Q['khung'][F['_i']]['neo_do']; d = ImageDraw.Draw(c)
    for nhom, m, col in NEO_VE:
        x, y = N[nhom][m]; x *= S; y *= S
        d.rectangle([x - 4, y - 4, x + 4, y + 4], outline=col, width=2)
        d.text((x + 6, y - 6), f'{m} {N[nhom][m][0]:.0f},{N[nhom][m][1]:.0f}', fill=col, font=font(10), stroke_width=1, stroke_fill=TRANG)
    for s_, col in (('phai', (40, 80, 200)), ('trai', (110, 140, 220))):
        o = N['quan']['ong_' + s_]; d.line([(o['hong'][0] * S, o['hong'][1] * S), (o['goi'][0] * S, o['goi'][1] * S), (o['co_chan'][0] * S, o['co_chan'][1] * S)], fill=col, width=2)
    a = N['ao']; d.polygon([(p[0] * S, p[1] * S) for p in (a['vai_phai'], a['co'], a['vai_trai'], a['hong_trai'], a['hong_phai'])], outline=(0, 150, 90))
    d.text((4, 4), f"thân {a['xoay_so_voi_dung']:+.0f}°  đầu {N['toc_mu']['xoay_so_voi_dung']:+.0f}°  cỡ ×{N['ti_le_so_voi_dung']:.3f}", fill=DEN, font=font(11))

# ---------------------------------------------------------------- 8. SO VỚI ẢNH MẪU
def lam_so_sanh(Ds):
    mau = Image.open(os.path.join(ZED, 'moi', '00-anh-mau.png')).convert('RGB')
    a = np.array(mau).astype(int); nen = (a[..., 1] > 150) & (a[..., 0] < 120) & (a[..., 2] < 120)
    ys, xs = np.nonzero(~nen); mau = mau.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    H = 520; mau = mau.resize((round(mau.width * H / mau.height), H), Image.NEAREST)
    d0 = Ds['dung']['fr'][0]['im']; d0 = d0.resize((round(d0.width * H / d0.height), H), Image.NEAREST)
    o = Image.new('RGB', (mau.width + d0.width + 6 * 215 + 60, H + 60), TRANG); d = ImageDraw.Draw(o)
    o.paste(mau, (10, 40)); o.paste(d0, (mau.width + 30, 40), d0); x = mau.width + d0.width + 50
    for i in range(0, 12, 2):
        f = Ds['chay']['fr'][i]['im']; k = 300 / f.height; f = f.resize((round(f.width * k), 300), Image.NEAREST)
        o.paste(f, (x, 40 + H - 300), f); d.text((x, 40 + H - 320), f'chạy {i + 1}', fill=DEN, font=font(13)); x += 215
    d.text((10, 8), 'Soát nhân vật: trái = moi/00-anh-mau.png (ảnh mẫu) · giữa = khung đứng dùng trong bộ thử · phải = khung chạy 03-chay-v4 (Cu Tí MỚI)', fill=DEN, font=font(16, True))
    o.save(os.path.join(RA, 'soat-cu-ti-moi.png'))

# ---------------------------------------------------------------- 9. TRANG KIỂM TRA
def uri(im):
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True); return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()

def lam_html(Ds, Q, BP):
    data = {'que': {}, 'doan': [[l, a, b, '#%02x%02x%02x' % c] for l, a, b, c in DOAN_VE],
            'do': [{'ma': m, 'ten': t, 'lop': l, 'mau': '#%02x%02x%02x' % c} for m, t, l, c in DO_THU],
            'khop': [m for m, _ in KHOP]}
    D0 = Ds['dung']
    for k, D in Ds.items():
        q = Q[k]; n = len(D['fr']); W, H = D['W'], D['H']
        bd = Image.open(os.path.join(RA, 'bo-phan', k, '_ban-do-mau.png'))
        hinh = []
        for i, F in enumerate(D['fr']):
            tl = D0['fr'][0]['sx'] / F['sx']; Jo = J_o(F)
            hinh.append({'cu_ti': uri(F['im']), 'x': F['off'][0], 'y': F['off'][1], 'w': F['im'].width, 'h': F['im'].height,
                         'ban_do': uri(bd.crop((i * W, 0, i * W + W, H))),
                         'do': {m: [[round(p[0], 1), round(p[1], 1)] for p in hinh_do(m, Jo, tl)] for m, *_ in DO_THU}})
        data['que'][k] = {'json': q, 'hinh': hinh, 'ten': 'đứng' if k == 'dung' else 'chạy 03-chay-v4'}
    with open(os.path.join(RA, 'kiem-tra.tmpl.html'), encoding='utf-8') as f: t = f.read()
    with open(os.path.join(RA, 'kiem-tra.html'), 'w', encoding='utf-8') as f:
        f.write(t.replace('__DATA__', json.dumps(data, ensure_ascii=False, separators=(',', ':'))))

# ---------------------------------------------------------------- CHẠY
def main():
    Ds = doc_tat_ca()
    for k, D in Ds.items():
        for i, F in enumerate(D['fr']):
            F['_i'] = i
            assert F['iou'] == 1.0, f'{k} khung {i + 1}: đặt khung KHÁC tấm game (IoU {F["iou"]:.4f})'
        print(f'{k}: {len(D["fr"])} khung, co {D["sk"]:.5f}, đặt khung trùng tấm game (IoU = 1 ở mọi khung)')
    D0, D = Ds['dung'], Ds['chay']
    lam_nhan_vat(D0)
    Q = {'dung': json_que(D0, D0, 'que-dung.json', 'đứng, khung 1 hàng "dung" (= nhan-vat.json)'),
         'chay': json_que(D, D0, 'que-chay-12.json', 'chạy, 12 khung, lặp — đo từ hàng chạy game đang dùng (moi/03-chay-v4)')}
    # que đứng
    c = nen_o(D0, 2); ve_que(c, J_o(D0['fr'][0]), 0, 0, 2, w=3, so=True); c.save(os.path.join(RA, 'que-dung.png'))
    c = nen_o(D0, 1); ve_que(c, J_o(D0['fr'][0]), 0, 0, 1, w=2); c.save(os.path.join(RA, 'que-dung-x1.png'))
    c = nen_o(D0, 1); dan_hinh(c, D0['fr'][0], 1); ve_que(c, J_o(D0['fr'][0]), 0, 0, 1, w=1); c.save(os.path.join(RA, 'que-dung-chong-hinh.png'))
    c = nen_o(D0, 2, luoi=True); ve_que(c, J_o(D0['fr'][0]), 0, 0, 2, w=2); c.save(os.path.join(RA, 'que-dung-luoi.png'))
    # que chạy
    tam_o(D, S=1).save(os.path.join(RA, 'que-chay-12.png'))
    tam_o(D, S=2, cot=6, luoi=True).save(os.path.join(RA, 'que-chay-12-luoi.png'))
    tam_o(D, S=2, cot=6, nen='that').save(os.path.join(RA, 'que-chay-12-chong-hinh.png'))
    tam_o(D, S=2, cot=6, nen='mo', so=True).save(os.path.join(RA, 'que-chay-12-chong-mo.png'))
    gif(D, 'que-chay-12.gif', 2, '')
    gif(D, 'que-chay-12-chong-hinh.gif', 2, 'that')
    tam_o(D, S=2, cot=6, ham=lambda c, F, S: ve_neo(c, F, S, Q['chay'])).save(os.path.join(RA, 'neo-do-chay-12.png'))
    tam_o(D0, S=1, ham=lambda c, F, S: ve_neo(c, F, S, Q['dung']), nhan=['đứng']).save(os.path.join(RA, 'neo-do-dung.png'))
    BP = lam_bo_phan(Ds, D0)
    lam_ghep(Ds)
    lam_so_sanh(Ds)
    lam_html(Ds, Q, BP)
    print('xong')

if __name__ == '__main__':
    main()
