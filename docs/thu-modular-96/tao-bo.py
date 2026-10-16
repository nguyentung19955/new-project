#!/usr/bin/env python3
"""BẢN THỬ GHÉP TRANG PHỤC MODULAR 96×96 — Cu Tí mới (bộ ảnh zed-moi đang dùng trong game), hàng CHẠY 12 khung.

Chạy lại:  python3 docs/thu-modular-96/tao-bo.py
Đọc:   game/art/custom/zed-moi.sprite.json (hàng "chay" = hàng 2, 12 khung 96×96, chân ở 48,90) — CHỈ ĐỌC
       docs/anh-goc/zed/moi/03-chay-v4-gif/03-chay-v4/khung-XX.png (ảnh nguồn cao của chính hàng đó, dùng để tách lớp cho chính xác)
       docs/thu-modular-96/khop-nguon.json (khớp đánh tay trên ảnh nguồn)
Ghi (chỉ trong docs/thu-modular-96/):
       sheets/<lớp>.png   13 sprite sheet ngang 1152×96 (12 khung × 96), nền trong suốt
       data.json          khớp + điểm neo từng khung (toạ độ ô 96×96, gốc trên-trái)
       sheets-luoi.png    lưới mọi lớp × mọi khung
       kiem-tra.html      trang kiểm tra tự chứa (ảnh nhúng base64)
Không sửa code game.
"""
import base64, io, json, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

DAY = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, DAY)
import tach_lop as T

O, N = 96, T.SO_KHUNG
PIVOT = (48, 90)
LOP = T.LOP
GIAP = ['chestArmor', 'backShoulderArmor', 'frontShoulderArmor', 'forearmArmor']

# bảng màu giáp mẫu (thép xanh + viền đồng)
VIEN = (28, 30, 44, 255)
THEP = [(64, 74, 96, 255), (104, 120, 146, 255), (150, 166, 190, 255), (206, 218, 232, 255)]
DONG = [(122, 78, 30, 255), (196, 146, 52, 255), (242, 204, 104, 255)]


def p96(i, p, H, W):
    return T.doi_diem(i, p, H, W)


def vien_ngoai(mask):
    """điểm ảnh biên (4 láng giềng) của mask."""
    tr = ndimage.binary_erosion(mask, structure=[[0, 1, 0], [1, 1, 1], [0, 1, 0]], border_value=0)
    return mask & ~tr


def ve_giap_nguc(k, nhan):
    """Giáp ngực khung k: vẽ điểm ảnh theo thân của chính khung đó (cổ → mép trên đai), phủ cả phần thân nằm dưới tay trước."""
    co, eo_tren = k['neck'], k['beltTop']
    m = np.zeros((O, O), bool)
    than = (nhan == T.NH['body'])
    y0, y1 = int(round(co[1])) + 2, int(round(eo_tren[1])) + 1
    hang_x = {}
    for y in range(y0, y1 + 1):
        t = (y - y0) / max(1, y1 - y0)
        xc = (co[0] - 3) * (1 - t) + k['hipCenter'][0] * t      # đường giữa thân của khung này
        xs = np.nonzero(than[y])[0]
        xs = xs[(xs >= xc - 7) & (xs <= xc + 5)]                  # chỉ bề ngang thân, bỏ phần tay sau lấn vào
        if xs.size == 0: continue
        hang_x[y] = (xs.min(), xs.max())
    if not hang_x: return np.zeros((O, O, 4), np.uint8)
    ys = sorted(hang_x)
    for y in ys:
        a, b = hang_x[y]
        m[y, a:b + 1] = True
    m = ndimage.binary_closing(m, iterations=1) | m
    # nở 1 điểm ra hai bên (giáp dày hơn áo), không nở lên quá cổ
    to = ndimage.binary_dilation(m, structure=[[0, 0, 0], [1, 1, 1], [0, 0, 0]])
    to[:y0, :] = False
    m = to
    yy, xx = np.mgrid[0:O, 0:O]
    out = np.zeros((O, O, 4), np.uint8)
    ytop, ybot = ys[0], ys[-1]
    for y in range(O):
        row = np.nonzero(m[y])[0]
        if row.size == 0: continue
        a, b = row.min(), row.max()
        for x in row:
            u = (x - a) / max(1, b - a)      # 0 = lưng, 1 = ngực (nhân vật quay phải)
            c = THEP[1]
            if u > 0.62: c = THEP[2]
            if u > 0.84: c = THEP[3]
            if u < 0.22: c = THEP[0]
            out[y, x] = c
    # đường nối các lá giáp (2 đường ngang theo chiều cao thân của khung này)
    for t in (0.42, 0.72):
        y = int(round(ytop + t * (ybot - ytop)))
        row = np.nonzero(m[y])[0]
        for x in row: out[y, x] = THEP[0]
    # cổ áo đồng + gờ dưới
    for y, mau in ((ytop, DONG[1]), (ytop + 1, DONG[2])):
        row = np.nonzero(m[y])[0]
        for x in row: out[y, x] = mau
    row = np.nonzero(m[ybot])[0]
    for x in row: out[ybot, x] = DONG[1]
    # đinh tán ở ngực
    ym = int(round(ytop + 0.25 * (ybot - ytop)))
    row = np.nonzero(m[ym])[0]
    if row.size > 3: out[ym, row.max() - 2] = DONG[2]
    v = vien_ngoai(m)
    out[v] = VIEN
    return out


def ve_vai(k, vai, khuyu, to=1.0):
    """Giáp vai: nửa vỏ sò úp trên khớp vai, hướng theo bắp tay của khung đó (tính từng điểm ảnh, không xoay ảnh)."""
    s, e = np.array(vai), np.array(khuyu)
    v = e - s; L = np.hypot(*v)
    v = v / L if L > 0 else np.array([0, 1.0])
    n = np.array([-v[1], v[0]])
    if n[1] > 0: n = -n                   # n chỉ lên trên
    c = s + v * 1.0 + n * 0.8
    a, b = 4.6 * to, 3.6 * to            # nửa bề ngang (theo n... ) / nửa dài (theo v)
    yy, xx = np.mgrid[0:O, 0:O].astype(float)
    dx, dy = xx + 0.5 - c[0], yy + 0.5 - c[1]
    pu = dx * v[0] + dy * v[1]            # dọc bắp tay
    pn = dx * n[0] + dy * n[1]            # vuông góc (dương = phía trên)
    m = (pu / b) ** 2 + (pn / a) ** 2 <= 1.0
    m &= pn > -a * 0.55                   # vỏ úp: cắt phần dưới nách
    out = np.zeros((O, O, 4), np.uint8)
    out[m] = THEP[1]
    out[m & (pn > a * 0.25)] = THEP[2]
    out[m & (pn > a * 0.55) & (pu < b * 0.2)] = THEP[3]
    # gờ đồng ở mép dưới
    out[m & (pn <= -a * 0.25)] = DONG[1]
    out[vien_ngoai(m)] = VIEN
    return out


def ve_bao_tay(k, khuyu, co_tay):
    """Giáp cẳng tay trước: ống giáp từ dưới khuỷu tới cổ tay của khung đó."""
    e, w = np.array(khuyu), np.array(co_tay)
    a = e + (w - e) * 0.2
    yy, xx = np.mgrid[0:O, 0:O].astype(float)
    d = T.kc_doan(xx + 0.5, yy + 0.5, a, w)
    m = d <= 2.3
    vv = (w - a); L = np.hypot(*vv); vv = vv / max(L, 1e-6)
    t = ((xx + 0.5 - a[0]) * vv[0] + (yy + 0.5 - a[1]) * vv[1]) / max(L, 1e-6)
    n = np.array([-vv[1], vv[0]]);
    if n[1] > 0: n = -n
    pn = (xx + 0.5 - a[0]) * n[0] + (yy + 0.5 - a[1]) * n[1]
    out = np.zeros((O, O, 4), np.uint8)
    out[m] = THEP[1]
    out[m & (pn > 0.6)] = THEP[2]
    out[m & (pn < -1.0)] = THEP[0]
    out[m & (t > 0.78)] = DONG[1]
    out[vien_ngoai(m)] = VIEN
    return out


def main():
    game = T.hang_game()
    kh_nguon = json.load(open(os.path.join(DAY, 'khop-nguon.json')))['khung']
    sheets = {l: np.zeros((O, O * N, 4), np.uint8) for l in LOP}
    data_khung, loi = [], []
    for i in range(N):
        a, nh, phu = T.tach(i, kh_nguon[i])
        H, W = nh.shape
        gk = game[:, i * O:(i + 1) * O]
        n96 = T.ha_nhan(i, a, nh, gk)
        for l, so in T.NH.items():
            m = n96 == so
            sheets[l][:, i * O:(i + 1) * O][m] = gk[m]
        # kiểm: ghép lại == khung game
        ghep = np.zeros_like(gk)
        for l in LOP:
            s = sheets[l][:, i * O:(i + 1) * O]
            ghep = np.where(s[:, :, 3:4] > 0, s, ghep)
        if not np.array_equal(ghep, gk): loi.append('khung %d: ghép lớp khác khung game (%d điểm)' % (i + 1, int((ghep != gk).any(2).sum())))
        # khớp ra toạ độ 96
        kn = kh_nguon[i]
        P = lambda p: p96(i, p, H, W)
        hair_ys, hair_xs = np.nonzero((n96 == T.NH['hair']) | (n96 == T.NH['head']))
        face_ys, face_xs = np.nonzero(n96 == T.NH['head'])
        hip = P(phu['hong'])
        k = {
            'neck': P(phu['co']),
            'head': [round(float(face_xs.mean()), 1), round(float(face_ys.mean()), 1)],
            'headTop': [round(float(hair_xs.mean()), 1), float(hair_ys.min())],
            'chin': P(phu['cam']),
            'shoulderFront': P(kn['vaiT']), 'elbowFront': P(kn['khuyuT']), 'wristFront': P(kn['coTayT']), 'handFront': P(kn['banTayT']),
            'shoulderBack': P(kn['vaiS']), 'elbowBack': P(kn['khuyuS']), 'wristBack': P(kn['coTayS']), 'handBack': P(kn['banTayS']),
            'hipFront': P(kn['hongT']), 'kneeFront': P(kn['goiT']), 'ankleFront': P(kn['coChanT']), 'toeFront': P(kn['muiChanT']),
            'hipBack': P(kn['hongS']), 'kneeBack': P(kn['goiS']), 'ankleBack': P(kn['coChanS']), 'toeBack': P(kn['muiChanS']),
            'hipCenter': hip,
        }
        k['beltTop'] = [hip[0], P((0, phu['dai_tren']))[1]]
        k['waist'] = [round((k['neck'][0] + hip[0]) / 2 - 1, 1), k['beltTop'][1]]
        nc = k['neck']
        anchors = {
            'torsoOutfit': [round((nc[0] + k['waist'][0]) / 2, 1), round((nc[1] + k['waist'][1]) / 2, 1)],
            'chestArmor': [round((nc[0] + k['waist'][0]) / 2 + 1, 1), round(nc[1] + (k['waist'][1] - nc[1]) * 0.35, 1)],
            'pants': hip,
            'hair': k['headTop'],
            'hat': k['headTop'],
            'belt': k['waist'],
            'back': [round(min(k['shoulderFront'][0], k['shoulderBack'][0]) - 2, 1), round((nc[1] + k['waist'][1]) / 2, 1)],
            'handFrontItem': k['handFront'], 'handBackItem': k['handBack'],
            'shoulderFrontArmor': k['shoulderFront'], 'shoulderBackArmor': k['shoulderBack'],
            'forearmFrontArmor': [round((k['elbowFront'][0] + k['wristFront'][0]) / 2, 1), round((k['elbowFront'][1] + k['wristFront'][1]) / 2, 1)],
        }
        # giáp mẫu
        sl = slice(i * O, (i + 1) * O)
        sheets['chestArmor'][:, sl] = ve_giap_nguc(k, n96)
        sheets['frontShoulderArmor'][:, sl] = ve_vai(k, k['shoulderFront'], k['elbowFront'])
        sheets['backShoulderArmor'][:, sl] = ve_vai(k, k['shoulderBack'], k['elbowBack'], 0.85)
        sheets['forearmArmor'][:, sl] = ve_bao_tay(k, k['elbowFront'], k['wristFront'])
        data_khung.append({'frame': i, 'joints': k, 'anchors': anchors,
                           'source': 'docs/anh-goc/zed/moi/03-chay-v4-gif/03-chay-v4/khung-%02d.png' % (i + 1)})

    os.makedirs(os.path.join(DAY, 'sheets'), exist_ok=True)
    for l in LOP:
        Image.fromarray(sheets[l]).save(os.path.join(DAY, 'sheets', l + '.png'), optimize=True)

    data = {
        'name': 'Cu Tí mới (zed-moi) — chạy sang phải',
        'frameWidth': O, 'frameHeight': O, 'frameCount': N, 'pivot': list(PIVOT), 'scale': 0.5,
        'fps': round(N / 0.6, 1),
        'coordinateSystem': 'Điểm ảnh của ô 96×96, gốc GÓC TRÊN-TRÁI ô, x sang phải, y xuống dưới. Chân chạm (48,90). Toạ độ có .5 là tâm điểm ảnh.',
        'layerOrder': LOP,
        'armorLayers': GIAP,
        'sheets': {l: 'sheets/%s.png' % l for l in LOP},
        'emptyLayers': [],
        'cuTiHasNoArt': GIAP,
        'source': {
            'gameSheet': 'game/art/custom/zed-moi.sprite.json, dong_tac.chay (hàng 2, 12 khung, 0,6 giây/vòng)',
            'highResFrames': 'docs/anh-goc/zed/moi/03-chay-v4-gif/03-chay-v4/khung-01..12.png (ảnh nguồn của chính hàng đó)',
            'scaleFromSource': T.SK, 'placement': T.DAT,
        },
        'jointNames': {
            'neck': 'cổ', 'head': 'tâm mặt', 'headTop': 'đỉnh tóc', 'chin': 'cằm',
            'shoulderFront': 'vai trước', 'elbowFront': 'khuỷu trước', 'wristFront': 'cổ tay trước', 'handFront': 'nắm tay trước',
            'shoulderBack': 'vai sau', 'elbowBack': 'khuỷu sau', 'wristBack': 'cổ tay sau', 'handBack': 'nắm tay sau',
            'hipFront': 'hông trước', 'kneeFront': 'gối trước', 'ankleFront': 'cổ chân trước', 'toeFront': 'mũi chân trước',
            'hipBack': 'hông sau', 'kneeBack': 'gối sau', 'ankleBack': 'cổ chân sau', 'toeBack': 'mũi chân sau',
            'hipCenter': 'giữa hông', 'beltTop': 'mép trên đai', 'waist': 'eo'},
        'anchorNames': {
            'torsoOutfit': 'neo áo (giữa thân)', 'chestArmor': 'neo giáp ngực', 'pants': 'neo quần (giữa hông)',
            'hair': 'neo tóc (đỉnh đầu)', 'hat': 'neo mũ (đỉnh đầu)', 'belt': 'neo đai/thắt lưng', 'back': 'neo phụ kiện lưng',
            'handFrontItem': 'neo đồ cầm tay trước', 'handBackItem': 'neo đồ cầm tay sau',
            'shoulderFrontArmor': 'neo giáp vai trước', 'shoulderBackArmor': 'neo giáp vai sau', 'forearmFrontArmor': 'neo giáp cẳng tay trước'},
        'notes': [
            'Tay TRƯỚC = tay lộ bắp tay trần (vẽ đè lên thân). Tay SAU = tay đấm ra trước, bắp tay khuất sau thân. Ảnh gốc không đổi tay giữa chu kỳ.',
            'Chân TRƯỚC/SAU giữ cùng một chân suốt 12 khung (chân trước = chân trụ ở khung 0).',
            'body = thân + áo đen (áo vẽ liền người, không có thân trần), torsoOutfit = đai đỏ + hai dải đai bay, pants = phần quần ở hông; ống quần nằm trong frontLeg/rearLeg.',
            'Lớp trống (Cu Tí không có): giáp, xem emptyLayers. Giáp mẫu nằm ở 4 lớp armorLayers.',
        ],
        'frames': data_khung,
    }
    json.dump(data, open(os.path.join(DAY, 'data.json'), 'w'), ensure_ascii=False, indent=1)
    luoi(sheets, data)
    html(data)
    print('xong.', 'LỖI:' if loi else 'ghép lại khớp khung game 12/12', loi)
    print('lớp trống:', data['emptyLayers'])


def luoi(sheets, data):
    Z = 2; CW = O * Z; LW = 150; TOP = 24
    rows = LOP + ['(ghép Cu Tí)', '(ghép + giáp)']
    W = LW + N * CW; Hh = TOP + len(rows) * CW
    img = Image.new('RGBA', (W, Hh), (250, 250, 250, 255))
    d = ImageDraw.Draw(img)
    from PIL import ImageFont
    try: fnt = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
    except Exception: fnt = None
    for c in range(N): d.text((LW + c * CW + 4, 4), 'frame %d' % c, fill=(0, 0, 0), font=fnt)
    o_bt = [l for l in LOP if l not in GIAP]
    for r, ten in enumerate(rows):
        d.text((6, TOP + r * CW + CW // 2 - 8), ten, fill=(0, 0, 0), font=fnt)
        for c in range(N):
            x0, y0 = LW + c * CW, TOP + r * CW
            ch = Image.new('RGBA', (O, O))
            cd = ImageDraw.Draw(ch)
            for yy in range(0, O, 8):
                for xx in range(0, O, 8):
                    cd.rectangle([xx, yy, xx + 7, yy + 7], fill=(225, 225, 225, 255) if (xx + yy) // 8 % 2 else (245, 245, 245, 255))
            if ten in LOP: ds = [ten]
            elif ten == '(ghép Cu Tí)': ds = o_bt
            else: ds = LOP
            for l in ds:
                ch.alpha_composite(Image.fromarray(np.ascontiguousarray(sheets[l][:, c * O:(c + 1) * O])))
            cd = ImageDraw.Draw(ch)
            cd.line([(0, PIVOT[1]), (O, PIVOT[1])], fill=(0, 160, 255, 160))
            cd.point(PIVOT, fill=(255, 0, 0, 255))
            img.paste(ch.resize((CW, CW), Image.NEAREST), (x0, y0))
            d.rectangle([x0, y0, x0 + CW - 1, y0 + CW - 1], outline=(180, 180, 180))
    img.save(os.path.join(DAY, 'sheets-luoi.png'), optimize=True)


def html(data):
    tmpl = open(os.path.join(DAY, 'kiem-tra.tmpl.html'), encoding='utf-8').read()
    anh = {}
    for l in LOP:
        anh[l] = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(DAY, 'sheets', l + '.png'), 'rb').read()).decode()
    d2 = dict(data); d2 = {k: v for k, v in data.items()}
    out = tmpl.replace('/*__DATA__*/null', json.dumps(d2, ensure_ascii=False)).replace('/*__ANH__*/null', json.dumps(anh))
    open(os.path.join(DAY, 'kiem-tra.html'), 'w', encoding='utf-8').write(out)


if __name__ == '__main__':
    main()
