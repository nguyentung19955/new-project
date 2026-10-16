#!/usr/bin/env python3
"""Thử rig gắn giáp lên khớp (độc lập, không đụng game).

Việc làm:
  1. Vẽ 6 ảnh giáp pixel tối giản (PNG trong suốt), DÙNG CHUNG cho cả 12 khung
     và cho cả bên trước lẫn bên sau: giáp vai, giáp cẳng tay, giáp ống chân,
     chụp vai, chụp khuỷu, chụp gối.  -> rig/giap/*.png
  2. Ghi metadata điểm neo / thứ tự chồng                         -> rig/rig.json
  3. Dựng trang tự chứa (ảnh base64) từ khuôn                      -> rig/kiem-tra-rig.html

Chỉ ĐỌC ../data.json và ../sheets/ (theo DATA.layerOrder). Không sửa tệp nào ngoài rig/.
Chạy:  python3 docs/thu-modular-96/rig/tao-rig.py
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

# chỉ đưa vào trang phần data cần dùng (khung, khớp, thứ tự lớp)
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
print('xong: %d ảnh giáp, %d lớp thân, trang %d KB' % (len(rig['images']), sum(k.startswith('layer:') for k in anh), len(html) // 1024))
