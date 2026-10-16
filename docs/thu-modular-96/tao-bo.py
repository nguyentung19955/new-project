#!/usr/bin/env python3
"""BẢN THỬ GHÉP TRANG PHỤC MODULAR 96×96 — Cu Tí mới (bộ ảnh zed-moi đang dùng trong game), hàng CHẠY 12 khung.

Chạy lại:  python3 docs/thu-modular-96/tao-bo.py      (khoảng 5 giây; lỗi thật → thoát mã 1)
Đọc (CHỈ ĐỌC):
       game/art/custom/zed-moi.sprite.json (hàng "chay" = hàng 2, 12 khung 96×96, chân ở 48,90)
       docs/anh-goc/zed/moi/03-chay-v4-gif/03-chay-v4/khung-XX.png (ảnh nguồn cao của chính hàng đó)
       docs/thu-modular-96/khop-nguon.json (khớp đánh tay trên ảnh nguồn)
       docs/thu-modular-96/do-gen/<bộ>/*.png (nếu có: đồ đã nạp từ ảnh gen bằng nap-anh-gen.py)
Ghi (chỉ trong docs/thu-modular-96/):
       sheets/<lớp>.png            nền cơ thể + giáp mẫu (1152×96, 12 khung × 96, nền trong suốt)
       sheets/do-goc/<lớp>.png     trang phục gốc (áo đen, đai đỏ, quần đen) — thay được
       sheets/do-moi/<lớp>.png     trang phục mới (áo chàm, đai vàng, quần kaki + xà cạp) — máy vẽ từng khung
       data.json, sheets-luoi.png, so-sanh-do.png, chay-goc-moi.gif, mau-gen/*.png, kiem-tra.html
Không sửa code game, không sửa ảnh nguồn.
"""
import base64, io, json, os, shutil, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

DAY = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, DAY)
import tach_lop as T
import trang_phuc as TP

O, N = 96, T.SO_KHUNG
PIVOT = (48, 90)
LOP = TP.LAYER_ORDER
GIAP = TP.GIAP

# bảng màu giáp mẫu (thép xanh + viền đồng)
VIEN = (28, 30, 44, 255)
THEP = [(64, 74, 96, 255), (104, 120, 146, 255), (150, 166, 190, 255), (206, 218, 232, 255)]
DONG = [(122, 78, 30, 255), (196, 146, 52, 255), (242, 204, 104, 255)]

BO = {'goc': 'Đồ gốc (áo đen, đai đỏ, quần đen)', 'moi': 'Đồ mới máy vẽ (áo chàm, đai vàng, quần kaki + xà cạp)'}
try: FNT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
except Exception: FNT = None


def p96(i, p, H, W):
    return T.doi_diem(i, p, H, W)


def vien_ngoai(mask):
    """điểm ảnh biên (4 láng giềng) của mask."""
    tr = ndimage.binary_erosion(mask, structure=[[0, 1, 0], [1, 1, 1], [0, 1, 0]], border_value=0)
    return mask & ~tr


def ve_giap_nguc(k, than):
    """Giáp ngực khung k: vẽ điểm ảnh theo vùng thân (thân trần dựng lại) của chính khung đó, từ cổ → mép trên đai."""
    co, eo_tren = k['neck'], k['beltTop']
    m = np.zeros((O, O), bool)
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


def khop_va_neo(i, kn, phu, n96, H, W):
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
        'hair': k['headTop'], 'hat': k['headTop'],
        'belt': k['waist'],
        'back': [round(min(k['shoulderFront'][0], k['shoulderBack'][0]) - 2, 1), round((nc[1] + k['waist'][1]) / 2, 1)],
        'handFrontItem': k['handFront'], 'handBackItem': k['handBack'],
        'shoulderFrontArmor': k['shoulderFront'], 'shoulderBackArmor': k['shoulderBack'],
        'forearmFrontArmor': [round((k['elbowFront'][0] + k['wristFront'][0]) / 2, 1), round((k['elbowFront'][1] + k['wristFront'][1]) / 2, 1)],
    }
    return k, anchors


def bo_gen():
    """Bộ đồ nạp từ ảnh gen (do-gen/<tên>/<lớp>.png, tạo bằng nap-anh-gen.py)."""
    goc = os.path.join(DAY, 'do-gen')
    out = {}
    if not os.path.isdir(goc): return out
    for ten in sorted(os.listdir(goc)):
        d = os.path.join(goc, ten)
        if not os.path.isdir(d): continue
        lop = {l: np.array(Image.open(os.path.join(d, l + '.png')).convert('RGBA')) for l in TP.DO if os.path.exists(os.path.join(d, l + '.png'))}
        slots = [s for s, ls in TP.SLOT.items() if all(l in lop for l in ls)]
        lop = {l: a for l, a in lop.items() if any(l in TP.SLOT[s] for s in slots)}
        if lop:
            nhan = open(os.path.join(d, 'ten.txt'), encoding='utf-8').read().strip() if os.path.exists(os.path.join(d, 'ten.txt')) else 'Đồ gen: ' + ten
            out['gen-' + ten] = (nhan, lop, slots)
    return out


def main():
    game = T.hang_game()
    kh_nguon = json.load(open(os.path.join(DAY, 'khop-nguon.json')))['khung']
    loi = []
    F = []
    for i in range(N):
        a, nh, phu = T.tach(i, kh_nguon[i])
        H, W = nh.shape
        gk = game[:, i * O:(i + 1) * O]
        n96 = T.ha_nhan(i, a, nh, gk)
        k, anchors = khop_va_neo(i, kh_nguon[i], phu, n96, H, W)
        own = TP.chu_so_huu(n96, gk, k)
        T_, nen_img, fill = TP.dung_nen(own, gk, k)
        F.append(dict(gk=gk, k=k, anchors=anchors, own=own, T=T_, nen_img=nen_img, fill=fill))
    # ngưỡng sáng/tối của đồ gốc (tính trên cả 12 khung) để đồ mới giữ nếp gấp
    def ng(ls):
        v = np.concatenate([f['gk'][:, :, :3].max(2)[np.logical_or.reduce([f['own'][l] for l in ls])] for f in F])
        return list(np.percentile(v, [35, 70]))
    nguong = {'ao': ng(['torsoOutfit']), 'dai': ng(['belt']), 'quan': ng(TP.SLOT['quan'])}

    Z = lambda: np.zeros((O, O * N, 4), np.uint8)
    nen = {l: Z() for l in TP.NEN + GIAP}
    bo = {'goc': {l: Z() for l in TP.DO}, 'moi': {l: Z() for l in TP.DO}}
    for i, f in enumerate(F):
        sl = slice(i * O, (i + 1) * O); gk, own, k = f['gk'], f['own'], f['k']
        for l in TP.NEN:
            s = nen[l][:, sl]
            s[own[l]] = gk[own[l]]
            if l in f['fill']: s[f['fill'][l]] = f['nen_img'][l][f['fill'][l]]
        for l in TP.DO:
            bo['goc'][l][:, sl][own[l]] = gk[own[l]]
        for l, im in TP.ve_do_moi(own, gk, k, f['T'], nguong).items():
            bo['moi'][l][:, sl] = im
        # giáp mẫu
        than = f['T'] & ~own['belt']
        nen['chestArmor'][:, sl] = ve_giap_nguc(k, than)
        a_, b_ = TP.tach_vai_truoc(ve_vai(k, k['shoulderFront'], k['elbowFront']), own, k)
        nen['frontShoulderArmor'][:, sl] = a_
        nen['frontShoulderArmorTop'][:, sl] = b_
        nen['backShoulderArmor'][:, sl] = ve_vai(k, k['shoulderBack'], k['elbowBack'], 0.85)
        nen['forearmArmor'][:, sl] = ve_bao_tay(k, k['elbowFront'], k['wristFront'])
    bo_slots = {'goc': list(TP.SLOT), 'moi': list(TP.SLOT)}
    for key, (nhan, lop, slots) in bo_gen().items():
        BO[key] = nhan
        bo[key] = {l: lop[l] for l in lop}
        bo_slots[key] = slots

    # ===== KIỂM TRA (lỗi → dừng, mã thoát 1) =====
    kq = []
    for i, f in enumerate(F):
        sl = slice(i * O, (i + 1) * O); gk = f['gk']
        lay = lambda ao, quan, giap=False: dict(
            [(l, nen[l][:, sl]) for l in TP.NEN] + ([(l, nen[l][:, sl]) for l in GIAP] if giap else []) +
            ([(l, bo[ao][l][:, sl]) for l in TP.SLOT['ao']] if ao else []) +
            ([(l, bo[quan][l][:, sl]) for l in TP.SLOT['quan']] if quan else []))
        g_goc, top_goc = TP.ghep(lay('goc', 'goc'))
        lech = int((g_goc != gk).any(2).sum())
        if lech: loi.append('khung %d: nền + đồ gốc KHÁC ảnh game ở %d điểm ảnh' % (i, lech))
        do_idx = [TP.IDX[l] for l in TP.DO]
        goc_hien = np.isin(top_goc, do_idx)
        r = {'frame': i, 'nenDoGocKhacGame': lech}
        tohop = []
        for b in bo:
            if b == 'goc': continue
            if 'ao' in bo_slots[b]: tohop.append((b, 'goc'))
            if 'quan' in bo_slots[b]: tohop.append(('goc', b))
            if bo_slots[b] == list(TP.SLOT): tohop.append((b, b))
        for ao, quan in tohop:
            _, top = TP.ghep(lay(ao, quan))
            lo_nen = sum(int((f['fill'][l] & (top == TP.IDX[l])).sum()) for l in f['fill'])
            lo_goc = int((goc_hien & ~np.isin(top, do_idx)).sum())
            r['ao_%s+quan_%s' % (ao, quan)] = {'thanTranLo': lo_nen, 'doGocKhongDuocPhu': lo_goc}
            if lo_nen or lo_goc:
                loi.append('khung %d (áo %s, quần %s): lộ %d điểm thân trần, %d điểm đồ gốc không được phủ' % (i, ao, quan, lo_nen, lo_goc))
        g_nen, _ = TP.ghep(lay(None, None))
        r['lỗTrongSuốtKhiChỉCóNền'] = int(((gk[:, :, 3] == 255) & (g_nen[:, :, 3] == 0) & ~f['own']['belt']).sum())
        r['daiBayNgoaiThan'] = int(((g_nen[:, :, 3] == 0) & f['own']['belt']).sum())
        kq.append(r)
    if loi:
        print('LỖI:'); [print('  -', x) for x in loi]
        raise SystemExit(1)

    # ===== GHI SHEET =====
    thu = os.path.join(DAY, 'sheets')
    if os.path.isdir(thu): shutil.rmtree(thu)
    duong = {}
    for l, s in nen.items():
        duong[l] = 'sheets/%s.png' % l
    duong_bo = {b: {l: 'sheets/do-%s/%s.png' % (b, l) for l in bo[b]} for b in bo}
    for l, s in nen.items(): luu(s, duong[l])
    for b in bo:
        for l in bo[b]: luu(bo[b][l], duong_bo[b][l])

    data = {
        'name': 'Cu Tí mới (zed-moi) — chạy sang phải',
        'frameWidth': O, 'frameHeight': O, 'frameCount': N, 'pivot': list(PIVOT), 'scale': 0.5,
        'fps': round(N / 0.6, 1),
        'coordinateSystem': 'Điểm ảnh của ô 96×96, gốc GÓC TRÊN-TRÁI ô, x sang phải, y xuống dưới. Chân chạm (48,90). Toạ độ có .5 là tâm điểm ảnh.',
        'layerOrder': LOP,
        'layerKinds': {l: ('nen' if l in TP.NEN else 'do' if l in TP.DO else 'giap') for l in LOP},
        'bodyLayers': TP.NEN, 'armorLayers': GIAP, 'outfitLayers': TP.DO,
        'outfitSlots': TP.SLOT, 'outfitSlotNames': {'ao': 'Áo (áo + đai)', 'quan': 'Quần'},
        'sheets': duong,
        'outfits': {b: {'name': BO[b], 'slots': bo_slots[b], 'sheets': duong_bo[b]} for b in bo},
        'defaultOutfit': {'ao': 'goc', 'quan': 'goc'},
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
        'layerNames': {
            'rearLeg': 'chân sau trần + bàn chân (nền)', 'rearPants': 'ống quần sau', 'rearArm': 'tay sau (nền)',
            'backShoulderArmor': 'giáp vai sau (sau thân)', 'body': 'thân trần + cổ (nền)', 'pants': 'quần phần hông',
            'torsoOutfit': 'áo', 'belt': 'đai + dải bay', 'chestArmor': 'giáp ngực', 'frontLeg': 'chân trước trần + bàn chân (nền)',
            'frontPants': 'ống quần trước', 'frontShoulderArmor': 'giáp vai trước – phần dưới cẳng tay',
            'frontArm': 'tay trước (nền)', 'frontShoulderArmorTop': 'giáp vai trước – phần trên bắp tay',
            'forearmArmor': 'giáp cẳng tay', 'head': 'mặt (nền)', 'hair': 'tóc (nền)'},
        'notes': [
            'Tay TRƯỚC = tay lộ bắp tay trần (vẽ đè lên thân). Tay SAU = tay đấm ra trước, bắp tay khuất sau thân.',
            'Chân TRƯỚC/SAU giữ cùng một chân suốt 12 khung (chân trước = chân trụ ở khung 0).',
            'Nền cơ thể (bodyLayers) = điểm ảnh gốc của đầu, tóc, tay, bàn chân, cổ + thân/chân trần dựng thêm (da + khố) ở đúng hình bóng áo/quần gốc từng khung.',
            'Trang phục (outfitLayers) thay theo 2 ô: ao = torsoOutfit + belt, quan = rearPants + pants + frontPants. Mỗi bộ trong outfits có đủ 5 lớp.',
            'Giáp vai trước tách 2 lớp: frontShoulderArmor (dưới tay trước, chỉ phần cẳng tay đi ngang qua) và frontShoulderArmorTop (trên bắp tay).',
        ],
        'checks': kq,
        'frames': [{'frame': i, 'joints': f['k'], 'anchors': f['anchors'],
                    'source': 'docs/anh-goc/zed/moi/03-chay-v4-gif/03-chay-v4/khung-%02d.png' % (i + 1)} for i, f in enumerate(F)],
    }
    loi += kiem_sheets(data, game)
    if loi:
        print('LỖI SHEET:'); [print('  -', x) for x in loi]
        raise SystemExit(1)
    json.dump(data, open(os.path.join(DAY, 'data.json'), 'w'), ensure_ascii=False, indent=1)
    anh = {p: np.array(Image.open(os.path.join(DAY, p))) for p in tat_ca_duong(data)}
    luoi(anh, data)
    so_sanh(anh, data, game)
    gif(anh, data)
    mau_gen(anh, data)
    html(data)
    print('xong: nền + đồ gốc = ảnh game 12/12 khung; đồ mới phủ kín (0 điểm lộ) ở 12/12 khung; %d sheet hợp lệ.' % len(tat_ca_duong(data)))


def luu(s, p):
    p = os.path.join(DAY, p)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    Image.fromarray(s).save(p, optimize=True)


def tat_ca_duong(data):
    ds = list(data['sheets'].values())
    for b in data['outfits'].values(): ds += list(b['sheets'].values())
    return ds


def kiem_sheets(data, game):
    """Đọc lại từng tệp sheet từ đĩa: 1152×96 RGBA, có nền trong suốt, đủ 12 khung, nằm cùng khung/pivot với nhân vật."""
    loi = []
    W = O * N
    bong = game[:, :, 3] > 0
    vung = {r: np.concatenate([ndimage.binary_dilation(bong[:, i * O:(i + 1) * O], iterations=r) if r else bong[:, i * O:(i + 1) * O]
                               for i in range(N)], 1) for r in (0, 4, 8)}
    co_the_trong = {'frontShoulderArmor'}            # phần giáp vai dưới cẳng tay: chỉ có ở khung tay vung ngang vai
    for p in tat_ca_duong(data):
        ten = os.path.splitext(os.path.basename(p))[0]
        fp = os.path.join(DAY, p)
        if not os.path.exists(fp): loi.append('%s: thiếu tệp' % p); continue
        im = Image.open(fp)
        if im.size != (W, O): loi.append('%s: kích thước %s, cần %dx%d' % (p, im.size, W, O)); continue
        if im.mode != 'RGBA': loi.append('%s: không có kênh alpha (mode %s)' % (p, im.mode)); continue
        a = np.array(im)[:, :, 3]
        if a.min() != 0: loi.append('%s: không có nền trong suốt' % p)
        for i in range(N):
            if ten not in co_the_trong and not a[:, i * O:(i + 1) * O].any(): loi.append('%s: khung %d trống' % (p, i))
        r = 0 if ten in TP.NEN else 8 if ten in GIAP else 4
        ngoai = int(((a > 0) & ~vung[r]).sum())
        if ngoai: loi.append('%s: %d điểm ảnh nằm ngoài nhân vật (lệch khung/pivot?)' % (p, ngoai))
    # ghép lại nhân vật gốc TỪ TỆP TRÊN ĐĨA (nền + đồ gốc) và so với hàng chạy đọc lại từ game
    goc_moi_doc = T.hang_game()
    for i in range(N):
        lay = {l: np.array(Image.open(os.path.join(DAY, data['sheets'][l])).convert('RGBA'))[:, i * O:(i + 1) * O] for l in TP.NEN}
        lay.update({l: np.array(Image.open(os.path.join(DAY, data['outfits']['goc']['sheets'][l])).convert('RGBA'))[:, i * O:(i + 1) * O] for l in TP.DO})
        g, _ = TP.ghep(lay)
        lech = int((g != goc_moi_doc[:, i * O:(i + 1) * O]).any(2).sum())
        if lech: loi.append('khung %d: ghép sheet trên đĩa (nền + đồ gốc) khác ảnh game %d điểm ảnh' % (i, lech))
    # chân chạm y = 90 ở mọi tổ hợp đồ
    for b in data['outfits']:
        if data['outfits'][b]['slots'] != list(TP.SLOT): continue
        for i in range(N):
            lay = {l: np.array(Image.open(os.path.join(DAY, data['sheets'][l])))[:, i * O:(i + 1) * O] for l in TP.NEN}
            lay.update({l: np.array(Image.open(os.path.join(DAY, data['outfits'][b]['sheets'][l])))[:, i * O:(i + 1) * O] for l in TP.DO})
            g, _ = TP.ghep(lay)
            ys = np.nonzero(g[:, :, 3].any(1))[0]
            if ys.max() != PIVOT[1] - 1: loi.append('bộ %s khung %d: đáy chân ở y=%d, cần %d' % (b, i, ys.max() + 1, PIVOT[1]))
    return loi


def o_ca_ro(w, h, o=8):
    yy, xx = np.mgrid[0:h, 0:w]
    c = np.where(((xx // o + yy // o) % 2) == 0, 245, 226).astype(np.uint8)
    return Image.fromarray(np.dstack([c, c, c, np.full_like(c, 255)]))


def khung_ghep(anh, data, i, ao, quan, giap=False, nen_tat=False):
    lay = {}
    for l in LOP:
        kind = data['layerKinds'][l]
        if kind == 'nen' and not nen_tat: p = data['sheets'][l]
        elif kind == 'giap' and giap: p = data['sheets'][l]
        elif kind == 'do':
            b = ao if l in TP.SLOT['ao'] else quan
            if not b: continue
            p = data['outfits'][b]['sheets'][l]
        else: continue
        lay[l] = anh[p][:, i * O:(i + 1) * O]
    return TP.ghep(lay)[0]


Y0, Y1, X0, X1 = 20, 94, 8, 88      # vùng cắt khi xem (nhân vật nằm gọn trong đây)


def luoi(anh, data):
    Z = 2; CW, CH = (X1 - X0) * Z, (Y1 - Y0) * Z; LW = 210; TOP = 22
    rows = [(l, [data['sheets'][l]]) for l in TP.NEN]
    for b in data['outfits']:
        rows += [('%s [%s]' % (l, b), [data['outfits'][b]['sheets'][l]]) for l in TP.DO if l in data['outfits'][b]['sheets']]
    rows += [(l, [data['sheets'][l]]) for l in GIAP]
    rows += [('= nền cơ thể', ('ghep', None, None, False))]
    for b in data['outfits']:
        sl = data['outfits'][b]['slots']
        rows += [('= nền + đồ %s' % b, ('ghep', b if 'ao' in sl else 'goc', b if 'quan' in sl else 'goc', False))]
    rows += [('= đồ mới + giáp', ('ghep', 'moi', 'moi', True))]
    img = Image.new('RGBA', (LW + N * CW, TOP + len(rows) * CH), (250, 250, 250, 255))
    d = ImageDraw.Draw(img)
    for c in range(N): d.text((LW + c * CW + 4, 4), 'khung %d' % c, fill=(0, 0, 0), font=FNT)
    for r, (ten, ds) in enumerate(rows):
        d.text((6, TOP + r * CH + CH // 2 - 8), ten, fill=(0, 0, 0), font=FNT)
        for c in range(N):
            ch = o_ca_ro(O, O)
            if ds[0] == 'ghep': ch.alpha_composite(Image.fromarray(khung_ghep(anh, data, c, ds[1], ds[2], ds[3])))
            else: ch.alpha_composite(Image.fromarray(np.ascontiguousarray(anh[ds[0]][:, c * O:(c + 1) * O])))
            cd = ImageDraw.Draw(ch)
            cd.line([(0, PIVOT[1]), (O, PIVOT[1])], fill=(0, 160, 255, 255))
            cd.point(PIVOT, fill=(255, 0, 0, 255))
            x0, y0 = LW + c * CW, TOP + r * CH
            img.paste(ch.crop((X0, Y0, X1, Y1)).resize((CW, CH), Image.NEAREST), (x0, y0))
            d.rectangle([x0, y0, x0 + CW - 1, y0 + CH - 1], outline=(190, 190, 190))
    img.convert('RGB').save(os.path.join(DAY, 'sheets-luoi.png'), optimize=True)


def so_sanh(anh, data, game):
    """Ảnh soát: gốc / nền / áo mới / quần mới / đồ mới / chỗ đồ gốc còn lộ — 12 khung, phóng ×4."""
    Z = 4; CW, CH = (X1 - X0) * Z, (Y1 - Y0) * Z; LW = 230; TOP = 26
    rows = [('Ảnh game (gốc)', None), ('Nền cơ thể', (None, None)), ('Áo mới + quần gốc', ('moi', 'goc')),
            ('Áo gốc + quần mới', ('goc', 'moi')), ('Đồ mới đầy đủ', ('moi', 'moi')), ('Đồ gốc còn lộ (đỏ)', 'lo')]
    img = Image.new('RGB', (LW + N * CW, TOP + len(rows) * CH), (250, 250, 250))
    d = ImageDraw.Draw(img)
    for c in range(N): d.text((LW + c * CW + 6, 6), 'khung %d' % c, fill=(0, 0, 0), font=FNT)
    for r, (ten, cfg) in enumerate(rows):
        nhan = ten
        if cfg == 'lo': nhan += '\n' + 'tổng: %d điểm' % sum(x['ao_moi+quan_moi']['doGocKhongDuocPhu'] for x in data['checks'])
        d.multiline_text((8, TOP + r * CH + CH // 2 - 16), nhan, fill=(0, 0, 0), font=FNT)
        for c in range(N):
            ch = o_ca_ro(O, O, 4)
            if cfg is None: f = game[:, c * O:(c + 1) * O]
            elif cfg == 'lo':
                g0 = khung_ghep(anh, data, c, 'goc', 'goc'); g1 = khung_ghep(anh, data, c, 'moi', 'moi')
                lay = {l: anh[data['outfits']['goc']['sheets'][l]][:, c * O:(c + 1) * O] for l in TP.DO}
                f = g1.copy(); f[:, :, 3] = (f[:, :, 3] * 0.35).astype(np.uint8)
                # điểm đồ gốc đang nhìn thấy ở bản gốc nhưng bản mới không có đồ phủ
                _, tg = TP.ghep({**{l: anh[data['sheets'][l]][:, c * O:(c + 1) * O] for l in TP.NEN}, **lay})
                lay1 = {l: anh[data['outfits']['moi']['sheets'][l]][:, c * O:(c + 1) * O] for l in TP.DO}
                _, t1 = TP.ghep({**{l: anh[data['sheets'][l]][:, c * O:(c + 1) * O] for l in TP.NEN}, **lay1})
                di = [TP.IDX[l] for l in TP.DO]
                lo = np.isin(tg, di) & ~np.isin(t1, di)
                f[lo] = (255, 0, 0, 255)
            else: f = khung_ghep(anh, data, c, *cfg)
            ch.alpha_composite(Image.fromarray(np.ascontiguousarray(f)))
            x0, y0 = LW + c * CW, TOP + r * CH
            img.paste(ch.crop((X0, Y0, X1, Y1)).resize((CW, CH), Image.NEAREST), (x0, y0))
            d.rectangle([x0, y0, x0 + CW - 1, y0 + CH - 1], outline=(190, 190, 190))
    img.save(os.path.join(DAY, 'so-sanh-do.png'), optimize=True)


def gif(anh, data):
    """GIF chạy: đồ gốc | đồ mới | đồ mới + giáp (×4, 20 khung/giây)."""
    Z = 4; W, H = (X1 - X0), (Y1 - Y0)
    fr = []
    for c in range(N):
        im = Image.new('RGB', (3 * W * Z + 2 * 8, H * Z + 24), (236, 233, 224))
        d = ImageDraw.Draw(im)
        for j, (nhan, a, q, g) in enumerate((('đồ gốc', 'goc', 'goc', False), ('đồ mới', 'moi', 'moi', False), ('đồ mới + giáp', 'moi', 'moi', True))):
            ch = Image.new('RGBA', (O, O), (236, 233, 224, 255))
            ch.alpha_composite(Image.fromarray(khung_ghep(anh, data, c, a, q, g)))
            im.paste(ch.crop((X0, Y0, X1, Y1)).convert('RGB').resize((W * Z, H * Z), Image.NEAREST), (j * (W * Z + 8), 24))
            d.text((j * (W * Z + 8) + 6, 4), nhan, fill=(0, 0, 0), font=FNT)
        fr.append(im.quantize(colors=255, method=Image.MEDIANCUT, dither=Image.NONE))
    fr[0].save(os.path.join(DAY, 'chay-goc-moi.gif'), save_all=True, append_images=fr[1:], duration=int(1000 / data['fps']), loop=0, disposal=1)


XANH = (0, 255, 0, 255)


def mau_gen(anh, data):
    """Ảnh mẫu gửi kèm khi gen: nền xanh #00FF00, 1 hàng 12 ô, phóng ×4 (ô 384×384)."""
    out = os.path.join(DAY, 'mau-gen'); os.makedirs(out, exist_ok=True)
    Z = 4

    def hang(fn):
        im = Image.new('RGBA', (O * N, O), XANH)
        for c in range(N):
            ch = Image.new('RGBA', (O, O), XANH)
            ch.alpha_composite(Image.fromarray(np.ascontiguousarray(fn(c))))
            im.paste(ch, (c * O, 0))
        return im.convert('RGB').resize((O * N * Z, O * Z), Image.NEAREST)
    hang(lambda c: khung_ghep(anh, data, c, None, None)).save(os.path.join(out, 'nen-co-the.png'), optimize=True)
    hang(lambda c: khung_ghep(anh, data, c, 'goc', 'goc')).save(os.path.join(out, 'do-goc.png'), optimize=True)
    for slot, ten in (('ao', 'vung-phu-ao'), ('quan', 'vung-phu-quan')):
        def fn(c, slot=slot):
            g = khung_ghep(anh, data, c, None, None).astype(float)
            xam = g[:, :, :3].mean(2, keepdims=True) * 0.5 + 110
            g[:, :, :3] = xam
            m = np.zeros((O, O), bool)
            for l in data['outfitSlots'][slot]: m |= anh[data['outfits']['goc']['sheets'][l]][:, c * O:(c + 1) * O, 3] > 0
            g[m] = (255, 0, 255, 255)
            return g.astype(np.uint8)
        hang(fn).save(os.path.join(out, ten + '.png'), optimize=True)


def html(data):
    tmpl = open(os.path.join(DAY, 'kiem-tra.tmpl.html'), encoding='utf-8').read()
    anh = {}
    for p in tat_ca_duong(data):
        anh[p] = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(DAY, p), 'rb').read()).decode()
    out = tmpl.replace('/*__DATA__*/null', json.dumps(data, ensure_ascii=False)).replace('/*__ANH__*/null', json.dumps(anh))
    open(os.path.join(DAY, 'kiem-tra.html'), 'w', encoding='utf-8').write(out)


if __name__ == '__main__':
    main()
