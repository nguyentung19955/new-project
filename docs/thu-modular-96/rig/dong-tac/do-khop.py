#!/usr/bin/env python3
"""ĐO KHỚP CÁC ĐỘNG TÁC KHÁC CỦA CU TÍ MỚI (zed-moi) — thử rig, phiên R2.

Chạy lại:  python3 docs/thu-modular-96/rig/dong-tac/do-khop.py [tên ...]     (không ghi tên = cả 5 động tác)
Đọc (CHỈ ĐỌC): game/art/custom/zed-moi.sprite.json (tấm thân game), docs/anh-goc/zed/moi/<hàng>-gif/ (ảnh nguồn cao),
               docs/anh-goc/zed/dung-zed-game.py (lấy lại đúng phép co/dời từng khung, xem dat_khung.py),
               rig/dong-tac/<tên>/khop-tay.json (khớp đánh tay trên ảnh nguồn — TỆP CHỈNH TAY).
Ghi (chỉ trong rig/dong-tac/<tên>/): sheet.png (N khung × 96, cắt thẳng từ tấm game), khop.json, soat.png, soat-nguon.png.
Kiểm (lỗi → mã 1): ảnh dựng lại từ nguồn trùng hình bóng hàng game; mọi khớp không ghi "an" nằm trong hoặc sát hình bóng ≤ 2 điểm ảnh.
Không sửa code game, không sửa ảnh nguồn, không đụng kiem-tra-rig.html / rig.json / tao-rig.py.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

DAY = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, DAY)
import dat_khung as D

O = 96
TEN_KHOP = ['neck', 'head', 'headTop', 'chin', 'shoulderFront', 'elbowFront', 'wristFront', 'handFront',
            'shoulderBack', 'elbowBack', 'wristBack', 'handBack', 'hipFront', 'kneeFront', 'ankleFront', 'toeFront',
            'hipBack', 'kneeBack', 'ankleBack', 'toeBack', 'hipCenter', 'beltTop', 'waist']
TAY = {'vaiT': 'shoulderFront', 'khuyuT': 'elbowFront', 'coTayT': 'wristFront', 'banTayT': 'handFront',
       'vaiS': 'shoulderBack', 'khuyuS': 'elbowBack', 'coTayS': 'wristBack', 'banTayS': 'handBack',
       'hongT': 'hipFront', 'goiT': 'kneeFront', 'coChanT': 'ankleFront', 'muiChanT': 'toeFront',
       'hongS': 'hipBack', 'goiS': 'kneeBack', 'coChanS': 'ankleBack', 'muiChanS': 'toeBack',
       'dinh': 'headTop', 'cam': 'chin', 'co': 'neck', 'dau': 'head', 'hongGiua': 'hipCenter'}
XUONG_T = [('shoulderFront', 'elbowFront'), ('elbowFront', 'wristFront'), ('wristFront', 'handFront'),
           ('hipFront', 'kneeFront'), ('kneeFront', 'ankleFront'), ('ankleFront', 'toeFront'), ('hipCenter', 'hipFront'), ('neck', 'shoulderFront')]
XUONG_S = [(a.replace('Front', 'Back'), b.replace('Front', 'Back')) for a, b in XUONG_T]
XUONG_G = [('headTop', 'head'), ('head', 'chin'), ('chin', 'neck'), ('neck', 'waist'), ('waist', 'hipCenter'), ('beltTop', 'waist')]
DO, XANH, VANG = (235, 40, 40), (40, 120, 255), (250, 220, 60)
try: FNT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
except Exception: FNT = None


def tam_mat(f):
    """tâm mảng da mặt trên ảnh nguồn (như dung-zed-game.do_dau: mảng da lớn nằm cao nhất)."""
    z = D.Z(); a = np.array(f['im'])
    m = ndimage.binary_opening(z.da(a), iterations=2)
    lab, n = ndimage.label(m)
    if n == 0: return None
    sz = ndimage.sum(m, lab, range(1, n + 1)); cm = ndimage.center_of_mass(m, lab, range(1, n + 1))
    i = min((j for j in range(n) if sz[j] > 0.15 * sz.max()), key=lambda j: cm[j][0])
    return [cm[i][1], cm[i][0]]


def khop_khung(f, kt):
    k = {}
    for a, b in TAY.items():
        if a in kt: k[b] = D.doi(f, kt[a])
    if 'head' not in k:
        m = tam_mat(f); k['head'] = D.doi(f, m)
    if 'hipCenter' not in k:
        k['hipCenter'] = [round((k['hipFront'][0] + k['hipBack'][0]) / 2, 1), round((k['hipFront'][1] + k['hipBack'][1]) / 2, 1)]
    hip = k['hipCenter']
    if 'daiTrenDiem' in kt: k['beltTop'] = D.doi(f, kt['daiTrenDiem'])   # thân nằm/nghiêng: ghi thẳng điểm mép trên đai
    else: k['beltTop'] = [hip[0], D.doi(f, (0, kt['daiTren']))[1]] if 'daiTren' in kt else [hip[0], round(hip[1] - 5, 1)]
    if 'eo' in kt: k['waist'] = D.doi(f, kt['eo'])
    else: k['waist'] = [round((k['neck'][0] + hip[0]) / 2 - 1, 1), k['beltTop'][1]]   # như tao-bo.khop_va_neo
    return {n: k[n] for n in TEN_KHOP}


def ve_que(d, k, s, ox, oy, an, r=4):
    P = lambda n: (ox + (k[n][0] + 0.5) * s, oy + (k[n][1] + 0.5) * s)
    for xs, c in ((XUONG_S, XANH), (XUONG_G, VANG), (XUONG_T, DO)):
        for a, b in xs:
            d.line([P(a), P(b)], fill=c + (255,), width=2)
    for n in TEN_KHOP:
        c = DO if 'Front' in n else XANH if 'Back' in n else VANG
        x, y = P(n)
        if n in an: d.ellipse([x - r, y - r, x + r, y + r], outline=c + (255,), width=2)
        else: d.ellipse([x - r, y - r, x + r, y + r], fill=c + (255,), outline=(0, 0, 0, 255))


def mot(ten):
    kg, kt_game, thu = D.DONG[ten]
    ra = os.path.join(DAY, ten)
    tay = json.load(open(os.path.join(ra, 'khop-tay.json'), encoding='utf-8'))
    an_tay = {int(a): b for a, b in tay.get('an', {}).items()}   # khung (1..N) → [tên khớp game bị che]
    d, t = D.tam_game()
    dt = d['dong_tac'][kt_game]; h = dt['hang']; n = dt['so']
    fr = D.dat(thu)
    assert len(fr) == n == len(tay['khung']), (ten, len(fr), n, len(tay['khung']))
    sheet = t[h * O:(h + 1) * O, :n * O].copy()
    Image.fromarray(sheet).save(os.path.join(ra, 'sheet.png'), optimize=True)
    loi, frames, kiem = [], [], []
    for i, f in enumerate(fr):
        g = sheet[:, i * O:(i + 1) * O]
        if ((g[..., 3] > 0) != (f['o'][..., 3] > 0)).any():
            loi.append('%s khung %d: hình bóng dựng lại khác hàng game' % (ten, i + 1))
        k = khop_khung(f, tay['khung'][i])
        frames.append({'frame': i, 'joints': k})
        kc = ndimage.distance_transform_edt(g[..., 3] == 0)
        an = set(an_tay.get(i + 1, []))
        xa = {}
        for nm, (x, y) in k.items():
            xi, yi = int(round(x)), int(round(y))
            dd = float(kc[yi, xi]) if 0 <= xi < O and 0 <= yi < O else 99.0
            if dd > 2 and nm not in an: xa[nm] = round(dd, 1)
            if dd > 2 and nm not in an: loi.append('%s khung %d: %s cách hình bóng %.1f điểm ảnh' % (ten, i + 1, nm, dd))
        kiem.append(xa)
    giay, so = dt['giay'], dt['so']
    out = {
        'action': ten,
        'gameKey': kg,
        'gameRow': {'key': kt_game, 'hang': h, 'so': so, 'giay': giay, 'lap': dt['lap']},
        'frameCount': n,
        'fps': round(so / giay, 2),
        'frameWidth': O, 'frameHeight': O, 'pivot': [48, 90],
        'coordinateSystem': 'Điểm ảnh ô 96×96, gốc góc trên-trái, x phải, y xuống; chân (48,90). Quy đổi từ ảnh nguồn như tach_lop.doi_diem: X96 = dx + (x+0.5)·sx − 0.5 (sx, dx, dy của chính khung đó, lấy lại từ dung-zed-game.py).',
        'frames': frames,
        'source': {
            'sheet': 'game/art/custom/zed-moi.sprite.json, dong_tac.%s (hàng %d, %d khung, %.2f giây/lượt, %s)' % (kt_game, h, n, giay, 'lặp' if dt['lap'] else 'không lặp'),
            'highRes': 'docs/anh-goc/zed/moi/%s-gif/%s/khung-01..%02d.png' % (thu, thu, n),
            'manual': 'rig/dong-tac/%s/khop-tay.json' % ten,
            'auto': 'head = tâm mảng da mặt (như dung-zed-game.do_dau) trừ khi khop-tay ghi "dau"; hipCenter = giữa 2 hông nếu không ghi; beltTop/waist như tao-bo.khop_va_neo',
        },
        'hidden': {str(a): b for a, b in sorted(an_tay.items())},
        'notes': tay.get('ghi_chu_ra', []),
    }
    if kg != kt_game:
        out['notes'] = ['Game chạy cầm thương dùng hàng thân "%s" (zed_moi.js: chay + thương/búa → chay2tay), nên đo trên hàng đó.' % kt_game] + out['notes']
    with open(os.path.join(ra, 'khop.json'), 'w', encoding='utf-8') as fo:
        json.dump(out, fo, ensure_ascii=False, indent=1)
    # ảnh soát ô 96 ×4
    S, cot = 4, min(n, 6)
    hang = (n + cot - 1) // cot
    W, H = cot * O * S, hang * (O * S + 22)
    c = Image.new('RGBA', (W, H), (40, 44, 52, 255)); dr = ImageDraw.Draw(c)
    for i in range(n):
        ox, oy = (i % cot) * O * S, (i // cot) * (O * S + 22) + 22
        o = Image.fromarray(sheet[:, i * O:(i + 1) * O]).resize((O * S, O * S), Image.NEAREST)
        nen = Image.new('RGBA', o.size, (205, 205, 205, 255)); nen.alpha_composite(o)
        c.paste(nen, (ox, oy))
        dr.rectangle([ox, oy, ox + O * S - 1, oy + O * S - 1], outline=(90, 90, 90, 255))
        ve_que(dr, frames[i]['joints'], S, ox, oy, set(an_tay.get(i + 1, [])))
        nh = 'khung %d' % (i + 1) + ('  che: ' + ', '.join(an_tay[i + 1]) if an_tay.get(i + 1) else '')
        dr.text((ox + 4, oy - 19), nh, fill=(255, 255, 255, 255), font=FNT)
    c.convert('RGB').save(os.path.join(ra, 'soat.png'), optimize=True)
    # ảnh soát trên nguồn cao (khớp đánh tay chồng lên ảnh gốc, thu về cao 300)
    tiles = []
    for i, f in enumerate(fr):
        im = f['im']; q = 300 / im.height
        tl = Image.new('RGBA', (int(im.width * q), 300), (215, 215, 215, 255))
        tl.alpha_composite(im.resize(tl.size, Image.LANCZOS))
        dd = ImageDraw.Draw(tl)
        k = frames[i]['joints']
        # vẽ theo toạ độ nguồn: đổi ngược từ ô 96
        kn = {nm: [((v[0] + 0.5 - f['dx']) / f['sx'] - 0.5) * q, ((v[1] + 0.5 - f['dy']) / f['sy'] - 0.5) * q] for nm, v in k.items()}
        ve_que(dd, kn, 1, -0.5, -0.5, set(an_tay.get(i + 1, [])), r=3)
        dd.text((3, 3), str(i + 1), fill=(0, 0, 0, 255), font=FNT)
        tiles.append(tl)
    W2 = sum(t_.width for t_ in tiles) + 4 * len(tiles)
    c2 = Image.new('RGB', (W2, 300), (255, 255, 255)); x = 0
    for t_ in tiles: c2.paste(t_.convert('RGB'), (x, 0)); x += t_.width + 4
    c2.save(os.path.join(ra, 'soat-nguon.png'), optimize=True)
    return loi, kiem


def main():
    tens = sys.argv[1:] or list(D.DONG)
    loi = []
    for ten in tens:
        if not os.path.exists(os.path.join(DAY, ten, 'khop-tay.json')):
            print('bỏ qua %s (chưa có khop-tay.json)' % ten); continue
        l, kiem = mot(ten)
        loi += l
        print('%s: %d khung, khớp xa hình bóng > 2đ (không ghi che): %s' % (ten, len(kiem), sum(len(x) for x in kiem)))
    for l in loi: print('  LỖI', l)
    sys.exit(1 if loi else 0)


if __name__ == '__main__':
    main()
