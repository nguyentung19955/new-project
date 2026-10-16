#!/usr/bin/env python3
"""SOÁT HÀNG BÚA NỆN (16/10/2026, docs/review/ke-hoach-cai-thien/bua-moi-16-10/bao-cao.md) — KHÔNG chạy game, chỉ dựng ảnh tĩnh / GIF
từ tệp game (game/art/custom/zed-moi.sprite.json + zed-vk.sprite.json) theo đúng thứ tự ghép của js/zed_moi.js:
  vũ khí SAU (neo sau = 1) → thân → [lòng bàn tay từ ảnh 'nam_tay' lớp SAU] → vũ khí TRƯỚC → nắm tay thân (hang_tay, khi không có nắm tay
  từ ảnh hoặc tay thứ hai lệch khỏi cán) → ngón tay từ ảnh lớp TRƯỚC (tay cầm + tay thứ hai trên cán).
Biến thể 'nam' (nắm chuôi) như game mặc định. Góc vũ khí giữa hai khung nội suy như gocMuot (MOC_BUA_BT, QUAY_CUOI, chiều quay ép QUA).
Đơn vị vẽ = ô 96 (= điểm ảnh game × 2, như canvas phụ net 2 của game); ×1 = ô 96 × 1,2 (cỡ Cu Tí to 1,2 trong trận), ×3 = gấp ba.

Chạy:  python3 docs/review/ke-hoach-cai-thien/bua-moi-16-10/soat-bua.py
Ra (thư mục này): bua-cu-x1.gif, bua-cu-x3.gif, bua-moi-x1.gif, bua-moi-x3.gif, luoi-khung-cu-moi.png, do-lech.json (+ in bảng).
Hàng cũ = dong_tac.bua_nen, hàng mới = dong_tac["bua_nen~16"] (game dùng thay bua_nen, ?buamoi=0 về hàng cũ).
"""
import base64, io, json, math, os
import numpy as np
from PIL import Image, ImageDraw

DAY = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(DAY, '..', '..', '..', '..'))
O = 96
CO = 1.2                                   # G.COTI_TO
MOC = [0, 0.05, 0.35, 0.5, 0.62, 0.74, 0.85, 0.93]   # MOC_BUA_BT (js/zed_moi.js) — ★ khung 3 ở 0,35 = hitAt
QUA = {1: 1}                               # bua_nen: khung 2 → 3 ép quay theo chiều kim đồng hồ (qua đầu)
QUAY_CUOI = 0.09
FPS = 30


def doc(ten):
    t = json.load(open(os.path.join(REPO, 'game', 'art', 'custom', ten + '.sprite.json'), encoding='utf-8'))
    t['_img'] = Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',', 1)[1]))).convert('RGBA')
    return t


def goc_gan(a, b):
    return a + ((((b - a) % 360) + 540) % 360) - 180


def buoc_goc(j, a, b):
    d = goc_gan(a, b) - a
    sg = QUA.get(j)
    if sg and d * sg < 0:
        d += 360 * sg
    return a + d


def phan_goc(giay, i, u):
    L = max(1e-6, MOC[i + 1] - MOC[i]); g = giay * L
    if g > QUAY_CUOI * 1.4:
        w = QUAY_CUOI / g * L
        return min(1, max(0, (u - (MOC[i + 1] - w)) / w))
    return min(1, max(0, (u - MOC[i]) / L))


def khung_goc(da, N, u):
    """(khung, góc) tại tiến độ u (0..1) — như khungMot + gocMuot (không tính nối vào thế / về thế)."""
    i = 0
    while i < da['so'] - 1 and u + 1e-6 >= MOC[i + 1]:
        i += 1
    a = N[i][2]
    if i + 1 < da['so'] and N[i + 1]:
        fr = phan_goc(da['giay'], i, u); e = fr * fr * (3 - 2 * fr)
        a = a + (buoc_goc(i, a, N[i + 1][2]) - a) * e
    return i, a


def xoay_dan(nen, im, px, py, cx, cy, deg, k=1.0):
    """Dán ảnh im (phóng k, NEAREST) sao cho điểm (cx, cy) của ảnh (đơn vị ảnh gốc) nằm ở (px, py) của nền, xoay deg (dương = kim đồng hồ)."""
    if k != 1:
        im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.NEAREST); cx *= k; cy *= k
    R = int(math.hypot(im.width, im.height)) + 4
    t = Image.new('RGBA', (2 * R, 2 * R), (0, 0, 0, 0)); t.alpha_composite(im, (int(round(R - cx)), int(round(R - cy))))
    t = t.rotate(-deg, resample=Image.NEAREST)
    lop = Image.new('RGBA', nen.size, (0, 0, 0, 0)); lop.paste(t, (int(round(px - R)), int(round(py - R))), t)
    nen.alpha_composite(lop)


def ghep(Z, V, ten, i, ang=None, cap=0, nen_mau=(0, 0, 0, 0), le=48):
    """Một khung có búa, ô (96 + 2·le)² — chân ở (48 + le, 90 + le)."""
    da = Z['dong_tac'][ten]; m = da.get('nam')
    neo, ht, tl, cam = (m['neo'], m['hang_tay'], m.get('vk_tl', da['vk_tl']), m.get('vk_cam', da['vk_cam'])) if m else (da['neo'], da['hang_tay'], da['vk_tl'], da['vk_cam'])
    n = neo[i]; a = n[2] if ang is None else ang
    W = O + 2 * le
    nen = Image.new('RGBA', (W, W), nen_mau)
    than = Z['_img'].crop((i * O, da['hang'] * O, (i + 1) * O, (da['hang'] + 1) * O))
    tay = Z['_img'].crop((i * O, ht * O, (i + 1) * O, (ht + 1) * O))
    r = V['vk'][da['vk']][cap]; vk = V['_img'].crop((r[0], r[1], r[0] + r[2], r[1] + r[3]))
    gx, gy = n[0] + le, n[1] + le
    NT = V.get('nam_tay'); D = NT and str(NT['co'].get(da['vk']))
    nt = None
    if m and NT and not n[3] and D in NT['sau']:
        k = min(range(len(NT['goc'])), key=lambda q: abs(goc_gan(a, NT['goc'][q]) - a))
        d2, het = None, False
        if len(n) > 4 and n[4]:
            rr = math.radians(a); co, si = math.cos(rr), math.sin(rr); dx, dy = (n[4][0] - n[0]) / 2, (n[4][1] - n[1]) / 2
            if abs(-dx * si + dy * co) <= 1.5:
                d2 = dx * co + dy * si
            else:
                het = True
        nt = (k, d2, het)
    lech = (V['ngon'][da['vk']][cap][4] if V.get('ngon') else 0)

    def ve_nt(lop):
        k, d2, het = nt; rc = NT[lop][D][k]; img = V['_img'].crop((rc[0], rc[1], rc[0] + rc[2], rc[1] + rc[3]))
        gA = goc_gan(a, NT['goc'][k]); rr = math.radians(a)
        for d in ([0] + ([d2] if d2 is not None else [])):
            ox, oy = 2 * d, 2 * lech
            px = gx + ox * math.cos(rr) - oy * math.sin(rr); py = gy + ox * math.sin(rr) + oy * math.cos(rr)
            xoay_dan(nen, img, px, py, rc[4], rc[5], a - gA)

    if n[3]:
        xoay_dan(nen, vk, gx, gy, cam[cap][0], cam[cap][1], a, 2 * tl)
    nen.alpha_composite(than, (le, le))
    if nt:
        ve_nt('sau')
    if not n[3]:
        xoay_dan(nen, vk, gx, gy, cam[cap][0], cam[cap][1], a, 2 * tl)
    if not nt or nt[2]:
        nen.alpha_composite(tay, (le, le))
    if nt:
        ve_nt('truoc')
    return nen


def do_hang(Z, ten):
    """Bật tâm / trượt chân giữa hai khung liền nhau (điểm ảnh ô 96 = ½ điểm ảnh game), trên ảnh thân (không vũ khí)."""
    da = Z['dong_tac'][ten]; rows = []
    for i in range(da['so']):
        a = np.array(Z['_img'].crop((i * O, da['hang'] * O, (i + 1) * O, (da['hang'] + 1) * O)))[..., 3] > 0
        ys, xs = np.nonzero(a); y1 = ys.max(); band = a[y1 - 3:y1 + 1]; cx = np.nonzero(band.any(0))[0]
        rows.append(dict(tam=(float(xs.mean()), float(ys.mean())), cao=int(y1 - ys.min() + 1), dat=int(y1),
                         chan_sau=int(cx.min()), chan_truoc=int(cx.max()), rong_chan=int(cx.max() - cx.min() + 1)))
    lien = lambda f: max(abs(f(rows[j + 1]) - f(rows[j])) for j in range(len(rows) - 1))
    return {
        'khung': rows,
        'bat_tam_ngang': round(lien(lambda r: r['tam'][0]), 2), 'bat_tam_doc': round(lien(lambda r: r['tam'][1]), 2),
        'truot_chan_sau': lien(lambda r: r['chan_sau']), 'truot_chan_truoc': lien(lambda r: r['chan_truoc']),
        'truot_chan_sau_tong': max(r['chan_sau'] for r in rows) - min(r['chan_sau'] for r in rows),
        'truot_chan_truoc_tong': max(r['chan_truoc'] for r in rows) - min(r['chan_truoc'] for r in rows),
        'rong_chan_lech_pt': round(100 * (max(r['rong_chan'] for r in rows) - min(r['rong_chan'] for r in rows)) / float(np.median([r['rong_chan'] for r in rows])), 1),
        'duong_dat': lien(lambda r: r['dat']),
    }


def gif(Z, V, ten, p, k):
    da = Z['dong_tac'][ten]; m = da.get('nam'); N = m['neo'] if m else da['neo']
    n = int(round(da['giay'] * FPS)); fr = []
    for f in range(n + 6):                       # + 0,2 giây đứng yên ở khung cuối
        u = min(1.0, f / n)
        i, a = khung_goc(da, N, u)
        im = ghep(Z, V, ten, i, a, nen_mau=(40, 44, 52, 255))
        d = ImageDraw.Draw(im); d.line([(0, 90 + 48 + 1), (im.width, 90 + 48 + 1)], fill=(80, 90, 100, 255))
        if i == 2:
            d.text((4, 4), 'CHAM', fill=(255, 220, 90, 255))
        im = im.resize((round(im.width * CO * k), round(im.height * CO * k)), Image.NEAREST)
        fr.append(im.convert('P', palette=Image.ADAPTIVE, colors=255))
    fr[0].save(p, save_all=True, append_images=fr[1:], duration=int(1000 / FPS), loop=0, optimize=False, disposal=2)
    print('Ghi ' + os.path.relpath(p, REPO))


def luoi(Z, V, p):
    """Ảnh lưới: hàng trên = búa cũ, hàng dưới = búa mới, từng khung có búa (×3), vạch đất + số khung, ★ = khung chạm."""
    hang = [('bua_nen', 'CU'), ('bua_nen~16', 'MOI')]
    so = max(Z['dong_tac'][h]['so'] for h, _ in hang); Kz = 3; Wc = (O + 96) * Kz
    P = Image.new('RGBA', (so * Wc, len(hang) * Wc + 20), (40, 44, 52, 255)); d = ImageDraw.Draw(P)
    for r_, (h, nhan) in enumerate(hang):
        da = Z['dong_tac'][h]
        for i in range(da['so']):
            im = ghep(Z, V, h, i, nen_mau=(40, 44, 52, 255)).resize((Wc, Wc), Image.NEAREST)
            dd = ImageDraw.Draw(im); y = (90 + 48 + 1) * Kz; dd.line([(0, y), (Wc, y)], fill=(90, 100, 110, 255))
            dd.text((6, 6), '%s k%d%s goc %.0f' % (nhan, i + 1, ' *CHAM*' if i == 2 else '', (da.get('nam') or da)['neo'][i][2]), fill=(255, 230, 120, 255))
            P.alpha_composite(im, (i * Wc, 20 + r_ * Wc))
    d.text((6, 4), 'Bua nen: tren = hang cu (?buamoi=0), duoi = hang moi 16/10. O 96 x3 (= game x6). Vach ngang = mat dat.', fill=(230, 230, 230, 255))
    P.convert('RGB').save(p, optimize=True)
    print('Ghi ' + os.path.relpath(p, REPO))


def main():
    Z, V = doc('zed-moi'), doc('zed-vk')
    kq = {}
    for h, nhan in (('bua_nen', 'cu'), ('bua_nen~16', 'moi')):
        if h not in Z['dong_tac']:
            print('  ! thiếu hàng ' + h); continue
        kq[nhan] = do_hang(Z, h)
        for k in (1, 3):
            gif(Z, V, h, os.path.join(DAY, 'bua-%s-x%d.gif' % (nhan, k)), k)
    if len(kq) == 2:
        luoi(Z, V, os.path.join(DAY, 'luoi-khung-cu-moi.png'))
    json.dump(kq, open(os.path.join(DAY, 'do-lech.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('| Hàng | bật tâm ngang | bật tâm dọc | trượt chân sau (liền / tổng) | trượt chân trước (liền / tổng) | rộng chân lệch | đường đất |')
    print('|---|---|---|---|---|---|---|')
    for nhan, r in kq.items():
        print('| %s | %s | %s | %d / %d | %d / %d | %s %% | %d |' % (nhan, r['bat_tam_ngang'], r['bat_tam_doc'], r['truot_chan_sau'], r['truot_chan_sau_tong'],
              r['truot_chan_truoc'], r['truot_chan_truoc_tong'], r['rong_chan_lech_pt'], r['duong_dat']))


if __name__ == '__main__':
    main()
