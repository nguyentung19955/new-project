#!/usr/bin/env python3
"""Thử rig gắn giáp lên khớp (độc lập, không đụng game).

Việc làm:
  1. Vẽ 6 ảnh giáp pixel tối giản (PNG trong suốt), DÙNG CHUNG cho cả 12 khung
     và cho cả bên trước lẫn bên sau: giáp vai, giáp cẳng tay, giáp ống chân,
     chụp vai, chụp khuỷu, chụp gối.  -> rig/giap/*.png
  2. Ghi metadata điểm neo / thứ tự chồng                         -> rig/rig.json
  3. Dựng trang tự chứa (ảnh base64) từ khuôn                      -> rig/kiem-tra-rig.html
  (Thêm bộ giáp "Gen" từ rig/giap-gen/gen.json — chạy tao-giap-gen.py trước.)

Chỉ ĐỌC ../data.json và ../sheets/ (theo DATA.layerOrder). Không sửa tệp nào ngoài rig/.
Chạy:  python3 docs/thu-modular-96/rig/tao-rig.py   (cần playwright + Chromium cho bước tự kiểm hở; bỏ qua: --khong-kiem)
"""
import base64, io, json, os, sys
from PIL import Image

RIG = os.path.dirname(os.path.abspath(__file__))
BO = os.path.dirname(RIG)

# ---------- 1. Ảnh giáp (vẽ bằng mã ký tự, mỗi ký tự = 1 điểm ảnh) ----------
# Mảnh xương nằm NGANG: trục x = chiều xương (đầu xương bên trái), trục y = bề dày.
MAU = {
    '.': None,
    'o': (46, 24, 16),      # viền tối
    'd': (122, 58, 26),     # đồng tối
    'b': (176, 96, 44),     # đồng
    'l': (222, 146, 74),    # đồng sáng
    'h': (248, 202, 128),   # điểm sáng
    'S': (214, 220, 228),   # thép sáng
    's': (150, 160, 174),   # thép
    'x': (88, 96, 110),     # thép tối
}
ANH = {
    # giáp vai: tấm đồng bo tròn ôm bắp tay (vai -> khuỷu)
    'giap-vai': [
        "..oooooo.",
        ".ohhllbdo",
        "ohllbbbdo",
        "olbbbbddo",
        ".obbdddo.",
        "..ooooo..",
    ],
    # giáp cẳng tay: ống thép, 2 đai đồng (khuỷu -> cổ tay)
    'giap-cang-tay': [
        ".oooooo",
        "obSSsbo",
        "odssxdo",
        ".oooooo",
    ],
    # giáp ống chân: thép, đai đồng ở phía gối (gối -> cổ chân)
    'giap-ong-chan': [
        ".ooooooo.",
        "oblSSSsso",
        "obdsssxxo",
        "odsxxxxo.",
        ".ooooo...",
    ],
    # chụp khớp: không xoay, đặt tâm vào khớp
    'chup-vai': [
        ".ooo.",
        "ohllo",
        "olbdo",
        "obddo",
        ".ooo.",
    ],
    'chup-khuyu': [
        ".oo.",
        "oSso",
        "osxo",
        ".oo.",
    ],
    'chup-goi': [
        ".oo.",
        "ohlo",
        "obdo",
        ".oo.",
    ],
}


def ve(rows):
    w = len(rows[0])
    assert all(len(r) == w for r in rows), rows
    im = Image.new('RGBA', (w, len(rows)), (0, 0, 0, 0))
    for y, r in enumerate(rows):
        for x, c in enumerate(r):
            if MAU[c]:
                im.putpixel((x, y), MAU[c] + (255,))
    return im


os.makedirs(os.path.join(RIG, 'giap'), exist_ok=True)
for ten, rows in ANH.items():
    ve(rows).save(os.path.join(RIG, 'giap', ten + '.png'))

# ---------- 2. Metadata ----------
# Tọa độ điểm neo cục bộ tính theo CẠNH điểm ảnh của ảnh giáp (điểm ảnh i chiếm [i, i+1]),
# giống hệ tọa độ khớp trong data.json (.5 = tâm điểm ảnh).
def bone(id_, ten, nhom, ben, anh, tu, den, a0, a1, sau, **k):
    p = dict(id=id_, name=ten, group=nhom, side=ben, kind='bone', image=anh,
             from_=tu, to=den, anchorStart=a0, anchorEnd=a1,
             thicknessScale=k.get('t', 1.0), stretch=dict(min=0.75, max=1.3),
             insertAfter=sau, tint=0.72 if ben == 'sau' else 1.0)
    p['from'] = p.pop('from_')
    return p


def cap(id_, ten, nhom, ben, anh, tai, a, sau, mask):
    return dict(id=id_, name=ten, group=nhom, side=ben, kind='cap', image=anh, at=tai,
                anchor=a, insertAfter=sau, maskLayers=mask,
                tint=0.72 if ben == 'sau' else 1.0)


rig = {
    'version': 1,
    'about': 'Thử rig: mỗi mảnh giáp là 1 ảnh dùng chung cho 12 khung, gắn theo 2 khớp bằng code.',
    'coordinates': 'anchorStart/anchorEnd/anchor: tọa độ trong ảnh giáp, gốc góc trên-trái, '
                   'điểm ảnh i chiếm [i,i+1]. anchorStart đặt trùng khớp đầu, hướng anchorStart→anchorEnd '
                   'xoay theo xương; chiều dài kéo theo xương trong khoảng stretch.min..max; '
                   'thicknessScale nhân bề dày. tint<1 làm tối bản bên sau lúc chạy (cùng 1 ảnh).',
    'images': {k: 'giap/%s.png' % k for k in ANH},
    'imageSources': {k: 'vẽ pixel tối giản bằng tao-rig.py (không lấy từ ảnh gen)' for k in ANH},
    'layering': 'Mảnh giáp được chèn NGAY SAU lớp insertAfter (tên lấy từ DATA.layerOrder). '
                'Nhiều mảnh cùng insertAfter thì vẽ theo thứ tự trong danh sách pieces. '
                'frameOverrides: {"<khung>": {"insertAfter": "..."}} để ghi đè theo khung.',
    'skipLayerKinds': ['giap'],   # không vẽ các sheet giáp 12 khung của bản cũ
    'outfit': 'goc',
    'pieces': [
        # --- bên sau: dưới thân ---
        bone('vaiSau', 'Giáp vai sau', 'vai', 'sau', 'giap-vai', 'shoulderBack', 'elbowBack', [1.5, 3.0], [7.5, 3.0], 'rearArm'),
        bone('cangTaySau', 'Giáp cẳng tay sau', 'cangTay', 'sau', 'giap-cang-tay', 'elbowBack', 'wristBack', [1.0, 2.0], [6.5, 2.0], 'rearArm'),
        cap('chupVaiSau', 'Chụp vai sau', 'chupVai', 'sau', 'chup-vai', 'shoulderBack', [2.5, 2.5], 'rearArm', ['rearArm']),
        cap('chupKhuyuSau', 'Chụp khuỷu sau', 'chupKhuyu', 'sau', 'chup-khuyu', 'elbowBack', [2.0, 2.0], 'rearArm', ['rearArm']),
        bone('ongChanSau', 'Giáp ống chân sau', 'ongChan', 'sau', 'giap-ong-chan', 'kneeBack', 'ankleBack', [1.0, 2.5], [8.0, 2.5], 'rearPants'),
        cap('chupGoiSau', 'Chụp gối sau', 'chupGoi', 'sau', 'chup-goi', 'kneeBack', [2.0, 2.0], 'rearPants', ['rearLeg', 'rearPants']),
        # --- bên trước: trên chân/tay trước ---
        bone('ongChanTruoc', 'Giáp ống chân trước', 'ongChan', 'truoc', 'giap-ong-chan', 'kneeFront', 'ankleFront', [1.0, 2.5], [8.0, 2.5], 'frontPants'),
        cap('chupGoiTruoc', 'Chụp gối trước', 'chupGoi', 'truoc', 'chup-goi', 'kneeFront', [2.0, 2.0], 'frontPants', ['frontLeg', 'frontPants']),
        bone('cangTayTruoc', 'Giáp cẳng tay trước', 'cangTay', 'truoc', 'giap-cang-tay', 'elbowFront', 'wristFront', [1.0, 2.0], [6.5, 2.0], 'frontArm'),
        bone('vaiTruoc', 'Giáp vai trước', 'vai', 'truoc', 'giap-vai', 'shoulderFront', 'elbowFront', [1.5, 3.0], [7.5, 3.0], 'frontArm'),
        cap('chupKhuyuTruoc', 'Chụp khuỷu trước', 'chupKhuyu', 'truoc', 'chup-khuyu', 'elbowFront', [2.0, 2.0], 'frontArm', ['frontArm']),
        cap('chupVaiTruoc', 'Chụp vai trước', 'chupVai', 'truoc', 'chup-vai', 'shoulderFront', [2.5, 2.5], 'frontArm', ['frontArm']),
    ],
    'groupNames': {'vai': 'Giáp vai', 'cangTay': 'Giáp cẳng tay', 'ongChan': 'Giáp ống chân',
                   'chupVai': 'Chụp vai', 'chupKhuyu': 'Chụp khuỷu', 'chupGoi': 'Chụp gối'},
    'frameOverrides': {},
}
# ---------- 2b. Bộ giáp "Gen" (ảnh gen thật, do tao-giap-gen.py cắt + thu nhỏ) ----------
GEN = json.load(open(os.path.join(RIG, 'giap-gen', 'gen.json')))
GP = GEN['pieces']
gimg = ['giap-vai', 'giap-cang-tay', 'giap-ong-chan', 'giap-nguc', 'chup-vai', 'chup-khuyu', 'chup-goi']


def gbone(id_, ten, nhom, ben, anh, tu, den, sau, **k):
    g = GP[anh]
    p = bone(id_, ten, nhom, ben, anh, tu, den, g['anchorStart'], g['anchorEnd'], sau, t=g['thicknessScale'])
    p.update(k)
    return p


def gcap(id_, ten, nhom, ben, anh, tai, sau, mask):
    return cap(id_, ten, nhom, ben, anh, tai, GP[anh]['anchor'], sau, mask)


rig['armorSets'] = {
    'may': {'name': 'Máy vẽ', 'about': 'bộ vẽ tối giản bằng mã (dùng images/pieces ở trên)', 'usesTopLevel': True},
    'gen': {
        'name': 'Gen',
        'about': 'Ảnh gen thật %s: 4 mảnh cắt + thu nhỏ giữ nét bằng tao-giap-gen.py; 3 chụp khớp là hình bộ máy vẽ tô bằng bảng màu gen.' % GEN['source'],
        'images': {k: 'giap-gen/%s.png' % k for k in gimg},
        'imagesX2': {k: 'giap-gen/%s-x2.png' % k for k in gimg},
        'imagesX2Note': 'Bản ×2 CHỈ dùng cho chế độ xem "Phóng to nhân vật ×2 (192)". Điểm neo ghi theo cỡ ×1; bản ×2 đúng gấp đôi cỡ nên neo ×2.',
        'imageSources': {k: ('cắt từ ảnh gen, gốc cắt: giap-gen/goc-%s.png' % k) if k.startswith('giap') else GP[k]['note'] for k in gimg},
        'palette': GEN['palette'],
        'pieces': [
            gbone('vaiSau', 'Giáp vai sau', 'vai', 'sau', 'giap-vai', 'shoulderBack', 'elbowBack', 'rearArm'),
            gbone('cangTaySau', 'Giáp cẳng tay sau', 'cangTay', 'sau', 'giap-cang-tay', 'elbowBack', 'wristBack', 'rearArm'),
            gcap('chupVaiSau', 'Chụp vai sau', 'chupVai', 'sau', 'chup-vai', 'shoulderBack', 'rearArm', ['rearArm']),
            gcap('chupKhuyuSau', 'Chụp khuỷu sau', 'chupKhuyu', 'sau', 'chup-khuyu', 'elbowBack', 'rearArm', ['rearArm']),
            gbone('ongChanSau', 'Giáp ống chân sau', 'ongChan', 'sau', 'giap-ong-chan', 'kneeBack', 'ankleBack', 'rearPants'),
            gcap('chupGoiSau', 'Chụp gối sau', 'chupGoi', 'sau', 'chup-goi', 'kneeBack', 'rearPants', ['rearLeg', 'rearPants']),
            # giáp ngực nhỏ: theo đoạn cổ → giữa hông (chỉ phủ 60% đầu đoạn), vẽ trên thân, dưới chân/tay trước
            gbone('nguc', 'Giáp ngực nhỏ', 'nguc', 'truoc', 'giap-nguc', 'neck', 'hipCenter', 'chestArmor', boneFrac=GEN['chestFrac']),
            gbone('ongChanTruoc', 'Giáp ống chân trước', 'ongChan', 'truoc', 'giap-ong-chan', 'kneeFront', 'ankleFront', 'frontPants'),
            gcap('chupGoiTruoc', 'Chụp gối trước', 'chupGoi', 'truoc', 'chup-goi', 'kneeFront', 'frontPants', ['frontLeg', 'frontPants']),
            gbone('cangTayTruoc', 'Giáp cẳng tay trước', 'cangTay', 'truoc', 'giap-cang-tay', 'elbowFront', 'wristFront', 'frontArm'),
            gbone('vaiTruoc', 'Giáp vai trước', 'vai', 'truoc', 'giap-vai', 'shoulderFront', 'elbowFront', 'frontArm'),
            gcap('chupKhuyuTruoc', 'Chụp khuỷu trước', 'chupKhuyu', 'truoc', 'chup-khuyu', 'elbowFront', 'frontArm', ['frontArm']),
            gcap('chupVaiTruoc', 'Chụp vai trước', 'chupVai', 'truoc', 'chup-vai', 'shoulderFront', 'frontArm', ['frontArm']),
        ],
        'groupNames': dict(rig['groupNames'], nguc='Giáp ngực nhỏ'),
    },
}
rig['boneFrac'] = 'boneFrac (tuỳ chọn, mặc định 1): khớp cuối dùng để gắn = from + (to − from) × boneFrac. Giáp ngực dùng 0,6 của đoạn cổ → giữa hông.'

# ---------- 2c. Giáp vai kiểu "vai" + luật chụp khớp (16/10, sửa lệch vai / hở về 0) ----------
rig['armBlend'] = 0.35
rig['angleHold'] = 8
rig['shoulderMount'] = ('Giáp vai (group "vai") có 2 kiểu gắn, chọn trong trang: "xuong" = theo bắp tay (vai → khuỷu, kéo giãn theo xương, '
                        'như cũ); "tron" (mặc định) = neo tại khớp vai, KHÔNG kéo giãn, góc = góc thân (neck → hipCenter) + armBlend × '
                        '(góc bắp tay − góc thân); vị trí neo làm tròn về điểm ảnh nguyên; góc đổi < angleHold° so với khung trước thì giữ góc cũ.')
rig['jointOverrides'] = {'chay': 'khop-chinh/chay.json'}
rig['jointOverridesNote'] = 'Rig đọc ../data.json rồi ĐÈ bằng khop-chinh/chay.json (offsetFix + khớp đánh lại). data.json không bị sửa.'
rig['actionsDir'] = 'dong-tac'
rig['actionsNote'] = ('Mọi thư mục dong-tac/<ten>/ có đủ sheet.png (ô 96, ngang) + khop.json ({action, frameCount, fps, frames[{frame, joints}], '
                      'source, hidden}) được tao-rig.py tự nhận. Động tác này dùng sheet cả người (CÁCH TẠM): mảnh bên SAU vẽ trước sheet, '
                      'bên TRƯỚC vẽ sau sheet. Khớp trong hidden ở khung nào thì mảnh gắn vào khớp đó tạm ẩn ở khung đó (không tính hở).')
CAP_KIEU = {'chup-vai': 'dong', 'chup-goi': 'dong', 'chup-khuyu': 'thep'}
CAP_D = (5, 6, 7)


def dia(d, kieu):
    """mã ký tự chụp khớp tròn đường kính d (cùng kiểu vẽ với chụp gốc): viền 'o', sáng góc trên-trái."""
    c = d / 2
    cell = lambda x, y: (x + .5 - c) ** 2 + (y + .5 - c) ** 2 <= c * c + 1e-9
    rows = []
    for y in range(d):
        r = ''
        for x in range(d):
            if not cell(x, y):
                r += '.'; continue
            if not all(0 <= x + a < d and 0 <= y + b < d and cell(x + a, y + b) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                r += 'o'; continue
            t = (x + y + 1 - d) / d
            if kieu == 'dong':
                r += 'h' if t < -0.3 else 'l' if t < 0 else 'b' if t < 0.3 else 'd'
            else:
                r += 'S' if t < -0.15 else 's' if t < 0.2 else 'x'
        rows.append(r)
    return rows


def mau_gen():
    """bảng ký tự → màu của chụp gen: đọc từ chính ảnh chụp gen (tô theo cùng mã ký tự của bộ máy vẽ)."""
    m = {}
    for ten in CAP_KIEU:
        im = Image.open(os.path.join(RIG, 'giap-gen', ten + '.png')).convert('RGBA')
        for y, r in enumerate(ANH[ten]):
            for x, ch in enumerate(r):
                if ch != '.':
                    m.setdefault(ch, im.getpixel((x, y))[:3])
    return m


MAU_GEN = mau_gen()
rig['capVariants'] = {}
for bo, bang in (('may', MAU), ('gen', MAU_GEN)):
    rig['capVariants'][bo] = {}
    os.makedirs(os.path.join(RIG, 'chup', bo), exist_ok=True)
    for ten, kieu in CAP_KIEU.items():
        goc = len(ANH[ten][0])
        lst = []
        for d in CAP_D:
            if d <= goc:
                continue
            rows = dia(d, kieu)
            im = Image.new('RGBA', (d, d), (0, 0, 0, 0))
            for y, r in enumerate(rows):
                for x, ch in enumerate(r):
                    if ch != '.':
                        im.putpixel((x, y), tuple(bang[ch]) + (255,))
            f = 'chup/%s/%s-d%d.png' % (bo, ten, d)
            im.save(os.path.join(RIG, f))
            lst.append({'d': d, 'file': f, 'anchor': [d / 2, d / 2]})
        rig['capVariants'][bo][ten] = lst
rig['capRule'] = ('Luật chụp khớp (hở về 0): đo điểm ảnh tay/chân trong bán kính 2đ quanh khớp mà mảnh xương cùng bên không che '
                  '(cả 2 chế độ xoay). Chọn cỡ chụp NHỎ NHẤT (gốc, rồi Ø5/6/7 trong capVariants) mà ở MỌI khung của động tác, dời '
                  'chụp ≤1đ quanh vị trí làm tròn là che kín; không cỡ nào che kín cả động tác thì chọn theo từng khung. '
                  'Chụp không xoay nên không méo.')
json.dump(rig, open(os.path.join(RIG, 'rig.json'), 'w'), ensure_ascii=False, indent=1)

# ---------- 3. Trang tự chứa ----------
DATA = json.load(open(os.path.join(BO, 'data.json')))


def b64(path):
    return 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()


loi = []
anh = {}
outfit = DATA.get('outfits', {}).get(rig['outfit'], {}).get('sheets', {})
for L in DATA['layerOrder']:
    if DATA.get('layerKinds', {}).get(L) in rig['skipLayerKinds']:
        continue
    p = DATA.get('sheets', {}).get(L) or outfit.get(L)
    if not p:
        loi.append('lớp %s không có sheet' % L)
        continue
    full = os.path.join(BO, p)
    if not os.path.exists(full):
        loi.append('thiếu tệp %s' % p)
        continue
    anh['layer:' + L] = b64(full)
for k, p in rig['images'].items():
    anh['img:' + k] = b64(os.path.join(RIG, p))
for k, p in rig['armorSets']['gen']['images'].items():
    anh['gen:' + k] = b64(os.path.join(RIG, p))
for k, p in rig['armorSets']['gen']['imagesX2'].items():
    anh['genx2:' + k] = b64(os.path.join(RIG, p))

# chỉ đưa vào trang phần data cần dùng (khung, khớp, thứ tự lớp)
DATA_MIN = {k: DATA[k] for k in ('name', 'frameWidth', 'frameHeight', 'frameCount', 'pivot', 'scale',
                                 'fps', 'layerOrder', 'layerKinds', 'jointNames') if k in DATA}
DATA_MIN['frames'] = [{'frame': f.get('frame', i), 'joints': f.get('joints', {})} for i, f in enumerate(DATA['frames'])]
CH = json.load(open(os.path.join(RIG, 'khop-chinh', 'chay.json')))
DATA_MIN['framesGoc'] = [{'joints': f['joints']} for f in DATA_MIN['frames']]   # khớp gốc data.json (chưa dời) = "trước"
ox, oy = CH['offsetFix']
moi = []
for i, f in enumerate(DATA_MIN['frames']):
    J = {n: [round(v[0] + ox, 2), round(v[1] + oy, 2)] for n, v in f['joints'].items()}
    J.update(CH['frames'][i]['joints'])
    moi.append({'frame': f['frame'], 'joints': J})
DATA_MIN['frames'] = moi

# ---------- động tác khác: rig/dong-tac/<ten>/{sheet.png, khop.json} ----------
ACTS = []
DT = os.path.join(RIG, 'dong-tac')
for ten in sorted(os.listdir(DT)) if os.path.isdir(DT) else []:
    d = os.path.join(DT, ten)
    if not (os.path.isfile(os.path.join(d, 'sheet.png')) and os.path.isfile(os.path.join(d, 'khop.json'))):
        print('  bỏ qua dong-tac/%s (thiếu sheet.png hoặc khop.json)' % ten)
        continue
    try:
        k = json.load(open(os.path.join(d, 'khop.json'), encoding='utf-8'))
    except Exception as e:
        loi.append('dong-tac/%s/khop.json đọc lỗi: %s' % (ten, e)); continue
    k['action'] = k.get('action') or ten
    k['_dir'] = ten
    # quy ước toạ độ: phiên R2 (và data.json) đổi bằng dx + (x+0,5)·s − 0,5 (tâm điểm ảnh = số nguyên) → +0,5 cho khớp với rig
    cs = str(k.get('coordinateSystem', ''))
    off = 0.0 if k.get('coordinateConvention') == 'canh' else (0.5 if ('− 0.5' in cs or '- 0.5' in cs or 'doi_diem' in cs) else 0.0)
    k['_offsetFix'] = off
    if off:
        for f in k.get('frames', []):
            f['joints'] = {n: ([round(v[0] + off, 2), round(v[1] + off, 2)] if isinstance(v, list) and len(v) == 2 and None not in v else v)
                           for n, v in (f.get('joints') or {}).items()}
    # hidden: khoá = số khung đếm từ 1 (README-R2; hiddenBase đổi được) → mảng theo vị trí khung cho trang
    hb = int(k.get('hiddenBase', 1))
    hid = [[] for _ in k.get('frames', [])]
    h = k.get('hidden') or {}
    if isinstance(h, dict):
        for kk, v in h.items():
            try:
                i = int(kk) - hb
            except ValueError:
                loi.append('dong-tac/%s: khoá hidden "%s" không phải số khung' % (ten, kk)); continue
            if 0 <= i < len(hid):
                hid[i] = list(v)
            else:
                loi.append('dong-tac/%s: hidden khung %s ngoài 1..%d' % (ten, kk, len(hid)))
    elif isinstance(h, list):
        hid = [list(x) if isinstance(x, list) else [] for x in h] + hid[len(h):]
    k['hiddenRaw'] = h
    k['hidden'] = hid
    if k['action'] == 'chay':
        k['action'] = 'chay_' + ten
    ACTS.append(k)
    anh['act:' + k['action']] = b64(os.path.join(d, 'sheet.png'))
for bo, v in rig['capVariants'].items():
    for ten, lst in v.items():
        for c in lst:
            anh['cap:%s:%s:%d' % (bo, ten, c['d'])] = b64(os.path.join(RIG, c['file']))

tmpl = open(os.path.join(RIG, 'kiem-tra-rig.tmpl.html'), encoding='utf-8').read()
html = (tmpl.replace('/*__DATA__*/null', json.dumps(DATA_MIN, ensure_ascii=False))
            .replace('/*__RIG__*/null', json.dumps(rig, ensure_ascii=False))
            .replace('/*__ANH__*/null', json.dumps(anh))
            .replace('/*__ACTS__*/null', json.dumps(ACTS, ensure_ascii=False)))
open(os.path.join(RIG, 'kiem-tra-rig.html'), 'w', encoding='utf-8').write(html)

if loi:
    print('LỖI:', *loi, sep='\n  ')
    sys.exit(1)
print('xong: %d ảnh giáp máy vẽ + %d gen, %d lớp thân, %d động tác, trang %d KB' % (len(rig['images']), len(rig['armorSets']['gen']['images']), sum(k.startswith('layer:') for k in anh), 1 + len(ACTS), len(html) // 1024))

# ---------- 4. Tự kiểm trên Chromium: còn hở > 0 ở bất kỳ khung nào → dừng lỗi thật ----------
if '--khong-kiem' not in sys.argv:
    import kiem_ho
    if not kiem_ho.kiem():
        sys.exit(1)

