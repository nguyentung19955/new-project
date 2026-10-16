#!/usr/bin/env python3
"""SOÁT KIẾM 1 / KIẾM 3 MỚI (16/10) — dựng ảnh tĩnh + GIF từ tấm game, KHÔNG chạy game.

Chạy từ gốc repo:  python3 docs/review/ke-hoach-cai-thien/kiem-moi-16-10/soat.py [mã commit TRƯỚC, mặc định HEAD]
Đọc: game/art/custom/zed-moi.sprite.json (SAU) và cùng tệp ở commit TRƯỚC (git show), zed-vk.sprite.json.
Ghép một khung y như game (bản đơn giản): vũ khí SAU (neo sau=1) → thân → vũ khí TRƯỚC → lớp nắm tay của biến thể nắm chuôi (nam).
Không vẽ lớp nắm tay ôm cán từ ảnh và không nội suy góc giữa khung (game có) → ảnh cho thấy đúng góc NEO từng khung.
Ra (thư mục này):
  kiem-<n>-x1.gif / -x3.gif   trái = TRƯỚC, phải = SAU; đứng (hàng đứng mới) → đòn đúng thời lượng + mốc khung game → giữ khung cuối
                              0,06 s → đứng. Nhịp 20 ms. x1 = ô 96 cỡ thật (= 2 điểm ảnh / điểm ảnh game, trước khi game phóng ×1,2).
  luoi-kiem-<n>.png           lưới từng khung ×3: hàng 1 = TRƯỚC (kiếm cấp 1), hàng 2–5 = SAU kiếm cấp 1..4; ★ = khung chạm.
                              Vạch xanh = đường đất, vạch vàng = chỗ bàn chân trước của hàng đứng mới.
  so-do.json                  số đo từng khung (ô 96): bàn chân sau / trước, trọng tâm hình, tâm đầu, cao; độ trượt và độ bật.
"""
import base64, io, json, math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw

GOC = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..'))
RA = os.path.dirname(os.path.abspath(__file__))
TEP = 'game/art/custom/zed-moi.sprite.json'
TRUOC = sys.argv[1] if len(sys.argv) > 1 else 'HEAD'
O = 96
MOC = {'kiem_1': [0, 0.22, 0.45, 0.65, 0.82], 'kiem_3': [0, 0.2, 0.45, 0.6, 0.75, 0.88]}
MOC16 = {'kiem_3': [0, 0.15, 0.3, 0.45, 0.65, 0.82]}  # = zed_moi.js MOC16
CHAM = 0.45
NEN = (58, 60, 72, 255)
W, H, OX, OY = 150, 120, 27, 18  # khung GIF: ô 96 đặt ở (OX, OY), chừa chỗ cho lưỡi kiếm


def doc(js):
    d = json.loads(js)
    im = Image.open(io.BytesIO(base64.b64decode(d['tam'].split(',', 1)[1]))).convert('RGBA')
    return d, im


def o96(tam, hang, i):
    return tam.crop((i * O, hang * O, (i + 1) * O, (hang + 1) * O))


class Tam:
    def __init__(self, js, vk):
        self.d, self.im = doc(js)
        self.dt = self.d['dong_tac']
        self.vk, self.vkim = vk

    def ghep(self, ten, i, cap=0):
        da = self.dt[ten]
        nen = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        than = o96(self.im, da['hang'], i)
        if 'vk' not in da:
            nen.alpha_composite(than, (OX, OY)); return nen
        m = da.get('nam')
        neo = (m or da)['neo'][i]
        ht = (m or da)['hang_tay']
        cam = (m or {}).get('vk_cam', da['vk_cam'])[cap]
        tl = (m or {}).get('vk_tl', da['vk_tl'])
        X, Y, g, sau = neo[:4]
        r = self.vk['vk'][da['vk']][cap]
        v = self.vkim.crop((r[0], r[1], r[0] + r[2], r[1] + r[3]))
        f = tl * 2
        v = v.resize((max(1, round(v.width * f)), max(1, round(v.height * f))), Image.NEAREST)
        gx, gy = cam[0] * f, cam[1] * f
        R = int(math.hypot(v.width, v.height)) + 4
        t = Image.new('RGBA', (2 * R, 2 * R), (0, 0, 0, 0)); t.alpha_composite(v, (int(R - gx), int(R - gy)))
        t = t.rotate(-g, resample=Image.NEAREST)
        lop = Image.new('RGBA', (W, H), (0, 0, 0, 0)); lop.paste(t, (int(OX + X - R), int(OY + Y - R)), t)
        if sau:
            nen.alpha_composite(lop); nen.alpha_composite(than, (OX, OY))
        else:
            nen.alpha_composite(than, (OX, OY)); nen.alpha_composite(lop)
        nen.alpha_composite(o96(self.im, ht, i), (OX, OY))
        return nen

    def than(self, ten, i):
        return np.array(o96(self.im, self.dt[ten]['hang'], i))


def do_khung(a):
    """Số đo một khung thân ô 96 (không vũ khí)."""
    al = a[..., 3] > 100
    ys, xs = np.nonzero(al)
    y1 = ys.max()
    cols = np.nonzero(al[y1 - 3:y1 + 1].any(0))[0]
    k = int(np.argmax(np.diff(cols))) if len(cols) > 1 else 0
    if len(cols) > 1 and np.diff(cols)[k] > 2:
        sau, truoc = cols[:k + 1], cols[k + 1:]
    else:
        sau = truoc = cols
    y0 = ys.min()
    dau = np.nonzero(al[y0:y0 + max(1, int((y1 - y0) * 0.3))].any(0))[0]
    return {'chan_sau': round(float(sau.mean()), 1), 'chan_truoc': round(float(truoc.mean()), 1),
            'tam_x': round(float(xs.mean()), 1), 'tam_y': round(float(ys.mean()), 1),
            'dau_x': round(float((dau.min() + dau.max()) / 2), 1), 'cao': int(y1 - y0 + 1), 'day': int(y1)}


def do_hang(T, ten, dung):
    ks = [do_khung(T.than(ten, i)) for i in range(T.dt[ten]['so'])]
    d0 = do_khung(T.than(dung, 0))
    chuoi = [d0] + ks + [d0]  # đứng → đòn → đứng
    def lon(key):
        return round(max(abs(chuoi[j + 1][key] - chuoi[j][key]) for j in range(len(chuoi) - 1)), 1)
    def lon_trong(key):
        return round(max(abs(ks[j + 1][key] - ks[j][key]) for j in range(len(ks) - 1)), 1)
    return {'khung': ks, 'dung': d0,
            'truot_chan_truoc_trong_don': lon_trong('chan_truoc'), 'truot_chan_sau_trong_don': lon_trong('chan_sau'),
            'truot_chan_truoc_ca_vao_ra': lon('chan_truoc'), 'truot_chan_sau_ca_vao_ra': lon('chan_sau'),
            'bat_tam_x': lon('tam_x'), 'bat_tam_y': lon('tam_y'), 'bat_dau_x': lon('dau_x'),
            'vao_don_chan_truoc': round(ks[0]['chan_truoc'] - d0['chan_truoc'], 1),
            'ra_don_chan_truoc': round(d0['chan_truoc'] - ks[-1]['chan_truoc'], 1),
            'cao_tv': float(np.median([k['cao'] for k in ks])), 'cao_dung': d0['cao']}


def khung_luc(moc, so, u):
    i = 0
    while i < so - 1 and u + 1e-6 >= moc[i + 1]:
        i += 1
    return i


def chuoi_gif(T, ten, moc, dung):
    """[(ảnh, ms)]: đứng 0,4 s → đòn (giây theo tấm, mốc moc) → giữ cuối 0,06 s → đứng 0,4 s; nhịp 20 ms."""
    da, dd = T.dt[ten], T.dt[dung]
    ra = []
    for k in range(20):
        ra.append(('d', int(k * 0.02 / (dd['giay'] * 1.25) * dd['so']) % dd['so']))
    n = int(round(da['giay'] / 0.02))
    for k in range(n):
        ra.append(('a', khung_luc(moc, da['so'], k / n)))
    ra += [('a', da['so'] - 1)] * 3
    for k in range(20):
        ra.append(('d', int(k * 0.02 / (dd['giay'] * 1.25) * dd['so']) % dd['so']))
    return [T.ghep(ten if a == 'a' else dung, i) for a, i in ra], [a == 'a' and i for a, i in ra]


def gif(p, khung, z, ms=20):
    out = []
    for im in khung:
        if z != 1:
            im = im.resize((im.width * z, im.height * z), Image.NEAREST)
        out.append(im.convert('RGB'))
    out[0].save(p, save_all=True, append_images=out[1:], duration=ms, loop=0, optimize=False)


def main():
    vk = doc(open(os.path.join(GOC, 'game/art/custom/zed-vk.sprite.json'), encoding='utf-8').read())
    vk = (vk[0], vk[1])
    SAU = Tam(open(os.path.join(GOC, TEP), encoding='utf-8').read(), vk)
    TRUOC_T = Tam(subprocess.run(['git', 'show', TRUOC + ':' + TEP], cwd=GOC, capture_output=True, text=True, check=True).stdout, vk)
    dung = 'dung~16'
    so_do = {}
    for n in (1, 3):
        ten = 'kiem_%d' % n
        moc_cu, moc_moi = MOC[ten], MOC16.get(ten, MOC[ten])
        ka, ia = chuoi_gif(TRUOC_T, ten, moc_cu, dung)
        kb, ib = chuoi_gif(SAU, ten + '~16', moc_moi, dung)
        L = max(len(ka), len(kb))
        ka += [ka[-1]] * (L - len(ka)); kb += [kb[-1]] * (L - len(kb))
        ghep = []
        for a, b in zip(ka, kb):
            c = Image.new('RGBA', (W * 2 + 4, H + 12), NEN)
            dr = ImageDraw.Draw(c)
            for x0 in (0, W + 4):
                dr.line([x0, OY + 90 + 12, x0 + W - 1, OY + 90 + 12], fill=(90, 160, 90, 255))
            c.alpha_composite(a, (0, 12)); c.alpha_composite(b, (W + 4, 12))
            dr.text((3, 1), 'TRUOC', fill=(230, 230, 230, 255)); dr.text((W + 7, 1), 'SAU', fill=(255, 230, 120, 255))
            ghep.append(c)
        gif(os.path.join(RA, 'kiem-%d-x1.gif' % n), ghep, 1)
        gif(os.path.join(RA, 'kiem-%d-x3.gif' % n), ghep, 3)
        # lưới
        so_moi = SAU.dt[ten + '~16']['so']; so_cu = TRUOC_T.dt[ten]['so']
        cham_cu = khung_luc(moc_cu, so_cu, CHAM); cham_moi = khung_luc(moc_moi, so_moi, CHAM)
        x_truoc = do_khung(SAU.than(dung, 0))['chan_truoc']
        Z, NH = 3, 150
        cot = max(so_moi, so_cu)
        P = Image.new('RGBA', (NH + cot * W * Z, 30 + 5 * H * Z), NEN)
        dr = ImageDraw.Draw(P)
        dr.text((6, 6), 'Kiem %d: hang 1 = TRUOC (cap 1), hang 2-5 = SAU cap 1..4 (x3). * = khung cham (u 0,45). '
                        'Vach xanh = dat, vach vang = ban chan truoc luc dung.' % n, fill=(235, 235, 235, 255))
        hang = [('TRUOC cap 1', TRUOC_T, ten, so_cu, cham_cu, 0)] + [('SAU cap %d' % (c + 1), SAU, ten + '~16', so_moi, cham_moi, c) for c in range(4)]
        for r, (nh, T, tt, so, ch, cap) in enumerate(hang):
            y0 = 30 + r * H * Z
            dr.text((6, y0 + H * Z // 2), nh, fill=(235, 235, 235, 255))
            for i in range(so):
                x0 = NH + i * W * Z
                im = T.ghep(tt, i, cap).resize((W * Z, H * Z), Image.NEAREST)
                P.alpha_composite(im, (x0, y0))
                dr.line([x0, y0 + (OY + 90) * Z + Z, x0 + W * Z - 1, y0 + (OY + 90) * Z + Z], fill=(90, 170, 90, 255), width=2)
                xv = x0 + int((OX + x_truoc) * Z + Z // 2)
                dr.line([xv, y0 + (OY + 80) * Z, xv, y0 + (OY + 92) * Z], fill=(255, 220, 60, 255), width=2)
                dr.text((x0 + 6, y0 + 4), 'khung %d%s' % (i + 1, ' *' if i == ch else ''), fill=(255, 230, 120, 255) if i == ch else (220, 220, 220, 255))
                dr.rectangle([x0, y0, x0 + W * Z - 1, y0 + H * Z - 1], outline=(80, 84, 96, 255))
        P.convert('RGB').save(os.path.join(RA, 'luoi-kiem-%d.png' % n), optimize=True)
        so_do[ten] = {'truoc': do_hang(TRUOC_T, ten, dung), 'sau': do_hang(SAU, ten + '~16', dung),
                      'khung_cham': {'truoc': cham_cu + 1, 'sau': cham_moi + 1}, 'moc': {'truoc': moc_cu, 'sau': moc_moi}}
    json.dump({'ghi_chu': 'Đơn vị: điểm ảnh ô 96 (= ½ điểm ảnh game, trước khi game phóng ×1,2). truot_* / bat_* = lệch lớn nhất giữa hai '
                          'khung liền nhau (ca_vao_ra: tính cả đứng → khung 1 và khung cuối → đứng). Đứng = hàng đứng mới khung 1.',
               **so_do}, open(os.path.join(RA, 'so-do.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for ten, v in so_do.items():
        for k in ('truoc', 'sau'):
            s = v[k]
            print('%s %-5s chân trước trong đòn %4.1f | vào %+5.1f ra %+5.1f | chân sau %4.1f (vào/ra %4.1f) | bật tâm x %4.1f y %4.1f đầu %4.1f | cao %s/%s | chạm khung %d' % (
                ten, k, s['truot_chan_truoc_trong_don'], s['vao_don_chan_truoc'], s['ra_don_chan_truoc'], s['truot_chan_sau_trong_don'],
                s['truot_chan_sau_ca_vao_ra'], s['bat_tam_x'], s['bat_tam_y'], s['bat_dau_x'], s['cao_tv'], s['cao_dung'], v['khung_cham'][k]))


if __name__ == '__main__':
    main()
