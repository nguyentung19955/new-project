#!/usr/bin/env python3
"""GIF xem trước mỗi vũ khí từ tấm đã dựng (game/art/custom/zed-rowan-pl-<loai>.sprite.json), phóng ×3 NEAREST:
đứng → đi → các nhát combo → đặc biệt → đứng; hướng quay phải (se) rồi quay trái (sw). Thời lượng mỗi động tác = như game (zed-rowan.sprite.json).
Vạch đỏ nhỏ dưới chân = điểm neo (giữa chân). python3 gif_rowan_pl.py <thư mục ra>"""
import base64, io, json, os, sys
from PIL import Image, ImageDraw
GOC = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../..'))
C = os.path.join(GOC, 'game/art/custom')
GIAY = {k: v for k, v in json.load(open(os.path.join(C, 'zed-rowan.sprite.json')))['dong_tac'].items()}
CHUOI = {'kiem': ['dung', 'di', 'kiem_1', 'kiem_2', 'kiem_3', 'db_kiem', 'dung'],
         'thuong': ['dung', 'di', 'thuong_1', 'thuong_2', 'thuong_3', 'thuong_quet', 'db_thuong', 'dung'],
         'bua': ['dung', 'di', 'bua_giu', 'bua_nen', 'bua_nen_dat', 'db_bua', 'dung'],
         'phitieu': ['dung', 'di', 'phitieu_ngam', 'phitieu', 'phitieu_chum', 'db_phitieu', 'dung']}
K, O, NEO = 3, 150, (75, 128)


def main(ra):
    os.makedirs(ra, exist_ok=True)
    for l, ch in CHUOI.items():
        p = os.path.join(C, 'zed-rowan-pl-%s.sprite.json' % l)
        if not os.path.exists(p):
            continue
        t = json.load(open(p))
        tam = Image.open(io.BytesIO(base64.b64decode(t['tam'].split(',', 1)[1]))).convert('RGBA')
        fr, du = [], []
        for h in ('se', 'sw'):
            for k in ch:
                if k not in t['hang']:
                    continue
                ds = t['hang'][k][h]
                g = GIAY.get(k, {'giay': 0.6, 'so': len(ds)})
                lap = 2 if k in ('dung', 'di') else 1
                ms = max(40, int(g['giay'] * 1000 / len(ds)))
                for _ in range(lap):
                    for r in ds:
                        o = Image.new('RGBA', (O, O), (118, 140, 96, 255))
                        o.alpha_composite(tam.crop((r[0], r[1], r[0] + r[2], r[1] + r[3])), (NEO[0] + r[4], NEO[1] + r[5]))
                        d = ImageDraw.Draw(o); d.line([(NEO[0] - 2, NEO[1]), (NEO[0] + 2, NEO[1])], fill=(220, 40, 40, 255))
                        d.text((3, 2), '%s %s' % (k, h), fill=(20, 20, 20, 255))
                        fr.append(o.resize((O * K, O * K), Image.NEAREST).convert('P', palette=Image.ADAPTIVE, colors=255)); du.append(ms)
        fr[0].save(os.path.join(ra, 'rowan-%s.gif' % l), save_all=True, append_images=fr[1:], duration=du, loop=0, disposal=2)
        print(l, len(fr), 'khung')


if __name__ == '__main__':
    main(sys.argv[1])
