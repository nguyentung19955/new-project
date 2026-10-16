#!/usr/bin/env python3
"""Rig giáp modular có THỨ TỰ CHE KHUẤT theo vùng (back / front / trong) — bản rig-do-sau.

Chạy:  python3 docs/thu-modular-96/rig-do-sau/tao-rig.py
Các bước:
  1. Vẽ ảnh giáp gốc bộ Máy vẽ từ mã ký tự  -> giap/*.png  (+ 3 cỡ chụp khớp: nho / gon / to)
  2. Nếu chưa có giap-gen/gen.json: chạy tao-giap-gen.py (cắt bộ Gen từ ../anh-gen/giap-roi-4-manh.png)
     rồi vẽ 3 cỡ chụp khớp tô màu Gen          -> giap-gen/chup-*-{nho,gon,to}.png
  3. tao-mask.py: ảnh nhãn nhan/<bộ>/*.png + tách pass/<bộ>/*-{back,front,trong}.png
  4. Ghi rig.json (điểm neo, lớp vẽ từng vùng, quy tắc đổi lớp theo khung, chồng khớp, chụp khớp)
  5. Dựng trang tự chứa kiem-tra-rig.html (mọi ảnh nhúng base64)
Chỉ ĐỌC ../data.json, ../sheets/ (theo DATA.layerOrder), ../anh-gen/. Không ghi gì ngoài rig-do-sau/.
Ảnh giáp gốc KHÔNG bị nới/cắt/sửa sau bước 1–2 (khác bản ChatGPT).
"""
import base64, json, os, subprocess, sys
from PIL import Image

RIG = os.path.dirname(os.path.abspath(__file__))
BO = os.path.dirname(RIG)

# ---------- 1. Ảnh giáp bộ Máy vẽ (mỗi ký tự = 1 điểm ảnh) ----------
MAU = {
    '.': None, 'o': (46, 24, 16), 'd': (122, 58, 26), 'b': (176, 96, 44), 'l': (222, 146, 74),
    'h': (248, 202, 128), 'S': (214, 220, 228), 's': (150, 160, 174), 'x': (88, 96, 110),
}
XUONG = {   # nằm NGANG: trục x = chiều xương (đầu xương bên trái), trục y = bề dày
    'giap-vai': ["..oooooo.", ".ohhllbdo", "ohllbbbdo", "olbbbbddo", ".obbdddo.", "..ooooo.."],
    'giap-cang-tay': [".oooooo", "obSSsbo", "odssxdo", ".oooooo"],
    'giap-ong-chan': [".ooooooo.", "oblSSSsso", "obdsssxxo", "odsxxxxo.", ".ooooo..."],
}
# Chụp khớp: không xoay, tâm ảnh đặt vào khớp. 3 cỡ để so độ kín:
#   nho = cỡ gốc (vai 5×5, khuỷu/gối 4×4); gon = 5×5 cho cả 3; to = 7×7 (cỡ bản ChatGPT)
CHUP = {
    'nho': {
        'chup-vai': [".ooo.", "ohllo", "olbdo", "obddo", ".ooo."],
        'chup-khuyu': [".oo.", "oSso", "osxo", ".oo."],
        'chup-goi': [".oo.", "ohlo", "obdo", ".oo."],
    },
    'gon': {
        'chup-vai': [".ooo.", "ohllo", "olbdo", "obddo", ".ooo."],
        'chup-khuyu': [".ooo.", "oSsso", "osSxo", "osxxo", ".ooo."],
        'chup-goi': [".ooo.", "ohllo", "olbdo", "obddo", ".ooo."],
    },
    'to': {
        'chup-vai': ["..ooo..", ".ohllo.", "ohllbdo", "olbbbdo", "obbbddo", ".obddo.", "..ooo.."],
        'chup-khuyu': ["..ooo..", ".oSSso.", "oSSssxo", "osssSxo", "osssxxo", ".osxxo.", "..ooo.."],
        'chup-goi': ["..ooo..", ".ohllo.", "ohllbdo", "olbbbdo", "obbbddo", ".obddo.", "..ooo.."],
    },
}
CO_CHUP = {'nho': 'nhỏ (cỡ gốc: vai 5×5, khuỷu/gối 4×4)', 'gon': 'gọn 5×5', 'to': 'to 7×7 (cỡ bản ChatGPT)'}


def ve(rows, cmap, sc=1):
    w = len(rows[0])
    assert all(len(r) == w for r in rows), rows
    im = Image.new('RGBA', (w * sc, len(rows) * sc), (0, 0, 0, 0))
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if cmap.get(c):
                for dy in range(sc):
                    for dx in range(sc):
                        im.putpixel((x * sc + dx, y * sc + dy), tuple(cmap[c]) + (255,))
    return im


os.makedirs(os.path.join(RIG, 'giap'), exist_ok=True)
for ten, rows in XUONG.items():
    ve(rows, MAU).save(os.path.join(RIG, 'giap', ten + '.png'))
for co, bo in CHUP.items():
    for ten, rows in bo.items():
        ve(rows, MAU).save(os.path.join(RIG, 'giap', '%s-%s.png' % (ten, co)))

# ---------- 2. Bộ Gen ----------
GEN_JSON = os.path.join(RIG, 'giap-gen', 'gen.json')
if not os.path.exists(GEN_JSON) or '--gen' in sys.argv:
    subprocess.check_call([sys.executable, os.path.join(RIG, 'tao-giap-gen.py')])
GEN = json.load(open(GEN_JSON))
PAL = [tuple(int(p['rgb'][i:i + 2], 16) for i in (1, 3, 5)) for p in GEN['palette']]
ROLE = [p['role'] for p in GEN['palette']]
br = sorted([i for i, r in enumerate(ROLE) if r == 'đồng'], key=lambda i: sum(PAL[i]))
stl = sorted([i for i, r in enumerate(ROLE) if r == 'thép/tối'], key=lambda i: sum(PAL[i]))
pick = lambda lst, t: PAL[lst[min(len(lst) - 1, round(t * (len(lst) - 1)))]]
GMAP = {'o': PAL[ROLE.index('viền')], 'd': pick(br, 0), 'b': pick(br, .5), 'l': pick(br, 1), 'h': pick(br, 1),
        'x': pick(stl, .34), 's': pick(stl, .67), 'S': pick(stl, 1)}   # giống tao-giap-gen.py
for co, bo in CHUP.items():
    for ten, rows in bo.items():
        ve(rows, GMAP).save(os.path.join(RIG, 'giap-gen', '%s-%s.png' % (ten, co)))
        ve(rows, GMAP, 2).save(os.path.join(RIG, 'giap-gen', '%s-%s-x2.png' % (ten, co)))

# ---------- 3. Nhãn + tách lượt ----------
subprocess.check_call([sys.executable, os.path.join(RIG, 'tao-mask.py')])
SO = json.load(open(os.path.join(RIG, 'nhan', 'nhan.json'), encoding='utf-8'))

# ---------- 4. rig.json ----------
# Lớp vẽ theo VÙNG. {"before": L} = vẽ ngay trước lớp L; {"after": L} = vẽ ngay sau lớp L (tên trong DATA.layerOrder).
# "chi" = lớp thân của chính chi đó: back/trong mặc định nằm DƯỚI nó, front nằm TRÊN nó (selfCheck kiểm).
LOP = {
    ('tay', 'sau'): {'chi': ['rearArm'], 'back': {'before': 'rearArm'}, 'trong': {'before': 'rearArm'}, 'front': {'after': 'rearArm'}},
    ('chan', 'sau'): {'chi': ['rearLeg', 'rearPants'], 'back': {'before': 'rearLeg'}, 'trong': {'before': 'rearLeg'}, 'front': {'after': 'rearPants'}},
    ('chan', 'truoc'): {'chi': ['frontLeg', 'frontPants'], 'back': {'before': 'frontLeg'}, 'trong': {'before': 'frontLeg'}, 'front': {'after': 'frontPants'}},
    ('tay', 'truoc'): {'chi': ['frontArm'], 'back': {'before': 'frontArm'}, 'trong': {'before': 'frontArm'}, 'front': {'after': 'frontArm'}},
    ('than', 'truoc'): {'chi': ['body'], 'back': {'before': 'body'}, 'trong': {'before': 'body'}, 'front': {'after': 'chestArmor'}},
}
CHI = {'vai': 'tay', 'cangTay': 'tay', 'chupVai': 'tay', 'chupKhuyu': 'tay', 'ongChan': 'chan', 'chupGoi': 'chan', 'nguc': 'than'}


def lop(nhom, ben):
    L = LOP[(CHI[nhom], ben)]
    return {'chi': L['chi'], 'vung': {k: dict(L[k]) for k in ('back', 'front', 'trong')}}


def bone(bo, id_, ten, nhom, ben, anh, tu, den, a0, a1, t=1.0, **k):
    p = dict(id=id_, name=ten, group=nhom, side=ben, kind='bone', image=anh, **{'from': tu}, to=den,
             anchorStart=list(a0), anchorEnd=list(a1), thicknessScale=t, stretch={'min': 0.85, 'max': 1.15},
             tint=0.72 if ben == 'sau' else 1.0, nhan='nhan/%s/%s.png' % (bo, anh), vungRong=['trong'], **lop(nhom, ben))
    p.update(k)
    return p


def cap(bo, id_, ten, nhom, ben, anh, tai):
    return dict(id=id_, name=ten, group=nhom, side=ben, kind='cap', at=tai,
                imageTheoCo={co: '%s-%s' % (anh, co) for co in CHUP}, tint=0.72 if ben == 'sau' else 1.0,
                nhan='nhan/%s/%s-<cỡ>.png' % (bo, anh), vungRong=['back', 'trong'], **lop(nhom, ben))


def pieces(bo, neo, nguc=None):
    P = [
        bone(bo, 'vaiSau', 'Giáp vai sau', 'vai', 'sau', 'giap-vai', 'shoulderBack', 'elbowBack', *neo['giap-vai']),
        bone(bo, 'cangTaySau', 'Giáp cẳng tay sau', 'cangTay', 'sau', 'giap-cang-tay', 'elbowBack', 'wristBack', *neo['giap-cang-tay']),
        cap(bo, 'chupVaiSau', 'Chụp vai sau', 'chupVai', 'sau', 'chup-vai', 'shoulderBack'),
        cap(bo, 'chupKhuyuSau', 'Chụp khuỷu sau', 'chupKhuyu', 'sau', 'chup-khuyu', 'elbowBack'),
        bone(bo, 'ongChanSau', 'Giáp ống chân sau', 'ongChan', 'sau', 'giap-ong-chan', 'kneeBack', 'ankleBack', *neo['giap-ong-chan']),
        cap(bo, 'chupGoiSau', 'Chụp gối sau', 'chupGoi', 'sau', 'chup-goi', 'kneeBack'),
    ]
    if nguc:
        P.append(nguc)
    P += [
        bone(bo, 'ongChanTruoc', 'Giáp ống chân trước', 'ongChan', 'truoc', 'giap-ong-chan', 'kneeFront', 'ankleFront', *neo['giap-ong-chan']),
        cap(bo, 'chupGoiTruoc', 'Chụp gối trước', 'chupGoi', 'truoc', 'chup-goi', 'kneeFront'),
        bone(bo, 'cangTayTruoc', 'Giáp cẳng tay trước', 'cangTay', 'truoc', 'giap-cang-tay', 'elbowFront', 'wristFront', *neo['giap-cang-tay']),
        bone(bo, 'vaiTruoc', 'Giáp vai trước', 'vai', 'truoc', 'giap-vai', 'shoulderFront', 'elbowFront', *neo['giap-vai']),
        cap(bo, 'chupKhuyuTruoc', 'Chụp khuỷu trước', 'chupKhuyu', 'truoc', 'chup-khuyu', 'elbowFront'),
        cap(bo, 'chupVaiTruoc', 'Chụp vai trước', 'chupVai', 'truoc', 'chup-vai', 'shoulderFront'),
    ]
    return P


def anh_bo(bo, thu, ten_anh, x2=False):
    """Khai báo ảnh gốc + 3 lượt của mỗi ảnh (đường dẫn tương đối rig-do-sau/)."""
    out = {}
    for t in ten_anh:
        s = t + ('-x2' if x2 else '')
        out[t] = '%s/%s.png' % (thu, s)
        for v in ('back', 'front', 'trong'):
            out['%s-%s' % (t, v)] = 'pass/%s/%s-%s.png' % (bo, s, v)
    return out


MAY_NEO = {'giap-vai': ([1.5, 3.0], [7.5, 3.0]), 'giap-cang-tay': ([1.0, 2.0], [6.5, 2.0]),
           'giap-ong-chan': ([1.0, 2.5], [8.0, 2.5])}
GP = GEN['pieces']
GEN_NEO = {k: (GP[k]['anchorStart'], GP[k]['anchorEnd'], GP[k]['thicknessScale']) for k in ('giap-vai', 'giap-cang-tay', 'giap-ong-chan')}
CAP_ANH = ['%s-%s' % (c, co) for c in CHUP['nho'] for co in CHUP]
ANH_MAY = list(XUONG) + CAP_ANH
ANH_GEN = ['giap-vai', 'giap-cang-tay', 'giap-ong-chan', 'giap-nguc'] + CAP_ANH
gnguc = GP['giap-nguc']
nguc = bone('gen', 'nguc', 'Giáp ngực nhỏ', 'nguc', 'truoc', 'giap-nguc', 'neck', 'hipCenter',
            gnguc['anchorStart'], gnguc['anchorEnd'], gnguc['thicknessScale'], boneFrac=GEN['chestFrac'])

rig = {
    'version': 2,
    'about': 'rig-do-sau: mỗi mảnh giáp = 1 ảnh gốc + 1 ảnh nhãn (đỏ back / xanh dương front / lục trong). '
             'tao-mask.py tách ra 3 lượt cùng cỡ, cùng neo. Renderer đặt cả 3 lượt bằng CÙNG một ma trận, '
             'mỗi lượt chèn vào thứ tự lớp thân theo khai báo "vung" của mảnh, quy tắc "quyTacLop" đổi lớp theo khung.',
    'coordinates': 'anchorStart/anchorEnd/anchor: toạ độ trong ảnh giáp GỐC (không nới). x.5 = tâm điểm ảnh. '
                   'Khớp lấy từ data.json. Mảnh xương: xoay + giãn dọc trục trong stretch.min..max (≤ ±15%), '
                   'bề dày nhân thicknessScale. Chụp khớp: không xoay, tâm ảnh đặt vào khớp (làm tròn lưới điểm ảnh).',
    'layering': 'Mỗi vùng {"before": L} hoặc {"after": L}, L thuộc DATA.layerOrder. Thứ tự vẽ 1 khung: với mỗi L theo '
                'layerOrder: các lượt "before L" → lớp thân L → các lượt "after L". Lớp thân vẽ đúng 1 lần, '
                'không vẽ lại nhân vật đè lên giáp. "chi" = lớp thân của chi mang giáp: back/trong phải nằm dưới, front phải nằm trên.',
    'skipLayerKinds': ['giap'],
    'outfit': 'goc',
    'huongMat': 'phai',
    'huongMatNote': 'nhân vật nhìn sang phải (mũi chân trước ở bên phải cổ chân). "phía sau" đường thân = x nhỏ hơn.',
    'chongKhop': {'mac': 2, 'note': 'overlapStart/overlapEnd (điểm ảnh ảnh gốc, số nguyên ≥ 0): renderer kéo dài điểm ảnh '
                  'mép mỗi hàng ra ngoài 2 đầu mảnh xương đúng chừng ấy để chồng qua khớp; ảnh trên đĩa không đổi. '
                  'Mặc định dùng "mac" nếu mảnh không ghi.'},
    'chupKhop': {'co': 'gon', 'cacCo': CO_CHUP, 'note': 'Cỡ chụp khớp đang dùng; trang thử có ô chọn và bảng so khe theo từng cỡ.'},
    'quyTacLop': [
        {'id': 'tayRaSau', 'ten': 'Tay trước vung ra sau vai', 'manh': ['cangTayTruoc', 'vaiTruoc'], 'vung': 'back',
         'khop': 'wristFront', 'duong': ['shoulderFront'], 'phia': 'sau', 'nguong': 1.0,
         'khiDung': {'before': 'body'},
         'note': 'Cổ tay trước lùi ra sau đường dọc qua vai trước quá 1 điểm ảnh (tay vung ra sau lưng): mép trong (vùng back) '
                 'của giáp cẳng tay + giáp bắp tay áp vào thân → vẽ dưới lớp body, thân che phần mép lấn vào thân. '
                 'Không đúng thì dùng mặc định của mảnh (ngay dưới frontArm). Thử neck→hipCenter trước: khớp tay trước luôn ở sau '
                 'đường đó (11–12/12 khung) nên không phân biệt được pha vung, đã bỏ.'},
    ],
    'quyTacNote': 'Điểm "khop" so với đường thẳng qua 2 khớp "duong" (kéo dài), tại cùng tung độ; "duong" chỉ 1 khớp = đường dọc qua khớp đó. phia "sau" = lệch về phía lưng '
                  'quá "nguong" điểm ảnh. Đúng → vùng "vung" của các mảnh "manh" dùng lớp "khiDung", sai → lớp mặc định trong mảnh.',
    'images': anh_bo('may', 'giap', ANH_MAY),
    'pieces': pieces('may', {k: v for k, v in MAY_NEO.items()}),
    'groupNames': {'vai': 'Giáp vai', 'cangTay': 'Giáp cẳng tay', 'ongChan': 'Giáp ống chân',
                   'chupVai': 'Chụp vai', 'chupKhuyu': 'Chụp khuỷu', 'chupGoi': 'Chụp gối', 'nguc': 'Giáp ngực nhỏ'},
    'nhanTrangThai': {k: v['trangThai'] for k, v in SO.items()},
}
rig['armorSets'] = {
    'may': {'name': 'Máy vẽ', 'usesTopLevel': True},
    'gen': {
        'name': 'Gen', 'source': GEN['source'],
        'images': anh_bo('gen', 'giap-gen', ANH_GEN),
        'imagesX2': anh_bo('gen', 'giap-gen', ANH_GEN, x2=True),
        'imagesX2Note': 'Bản ×2 CHỈ dùng cho ô xem "nhân vật ×2 (192)"; neo ghi theo cỡ ×1.',
        'pieces': pieces('gen', GEN_NEO, nguc),
    },
}
for P in (rig['pieces'], rig['armorSets']['gen']['pieces']):
    for p in P:
        if p['kind'] == 'bone':
            p['overlapStart'] = p['overlapEnd'] = rig['chongKhop']['mac']
json.dump(rig, open(os.path.join(RIG, 'rig.json'), 'w'), ensure_ascii=False, indent=1)

# ---------- 5. Trang tự chứa ----------
DATA = json.load(open(os.path.join(BO, 'data.json')))
b64 = lambda path: 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()
loi, anh = [], {}
outfit = DATA.get('outfits', {}).get(rig['outfit'], {}).get('sheets', {})
for L in DATA['layerOrder']:
    if DATA.get('layerKinds', {}).get(L) in rig['skipLayerKinds']:
        continue
    p = DATA.get('sheets', {}).get(L) or outfit.get(L)
    if not p or not os.path.exists(os.path.join(BO, p)):
        loi.append('lớp %s không có sheet (%s)' % (L, p))
        continue
    anh['layer:' + L] = b64(os.path.join(BO, p))
for pre, imgs in (('may:', rig['images']), ('gen:', rig['armorSets']['gen']['images']), ('genx2:', rig['armorSets']['gen']['imagesX2'])):
    for k, p in imgs.items():
        f = os.path.join(RIG, p)
        if not os.path.exists(f):
            loi.append('thiếu ảnh %s' % p)
            continue
        anh[pre + k] = b64(f)
DATA_MIN = {k: DATA[k] for k in ('name', 'frameWidth', 'frameHeight', 'frameCount', 'pivot', 'scale',
                                 'fps', 'layerOrder', 'layerKinds', 'jointNames') if k in DATA}
DATA_MIN['frames'] = [{'frame': f.get('frame', i), 'joints': f.get('joints', {})} for i, f in enumerate(DATA['frames'])]
tmpl = open(os.path.join(RIG, 'kiem-tra-rig.tmpl.html'), encoding='utf-8').read()
html = (tmpl.replace('/*__DATA__*/null', json.dumps(DATA_MIN, ensure_ascii=False))
            .replace('/*__RIG__*/null', json.dumps(rig, ensure_ascii=False))
            .replace('/*__ANH__*/null', json.dumps(anh)))
open(os.path.join(RIG, 'kiem-tra-rig.html'), 'w', encoding='utf-8').write(html)
if loi:
    print('LỖI:', *loi, sep='\n  ')
    sys.exit(1)
print('xong: %d ảnh Máy vẽ + %d Gen (+%d ×2), %d lớp thân, trang %d KB'
      % (len(rig['images']), len(rig['armorSets']['gen']['images']), len(rig['armorSets']['gen']['imagesX2']),
         sum(k.startswith('layer:') for k in anh), len(html) // 1024))
