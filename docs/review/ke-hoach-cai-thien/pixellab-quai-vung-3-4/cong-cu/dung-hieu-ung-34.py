#!/usr/bin/env python3
"""Hiệu ứng PixelLab (POST /vfx) cho quái vùng 3–4 → game/art/custom/hu-pl34-<tên>.sprite.json.
Nguồn: docs/anh-goc/pixellab-quai-vung-3-4/hieu-ung/<tên>/pixellab.png + pixellab.json (tấm khung PixelLab trả về) + chon.json.
Chỉ CẮT các khung theo pixellab.json và xếp thành một dải ngang — không vẽ / đổi điểm ảnh. Cỡ khung, điểm neo, số khung, thời lượng, xoay, lặp
lấy NGUYÊN từ tệp hiệu ứng cũ cùng tên (hu-<tên>.sprite.json) để chỗ vẽ, cỡ, thời điểm, vùng trúng y như cũ (ảnh PixelLab đặt cùng cỡ gấp đôi, net 2).
js/quai_pl_34.js chọn tệp mới thay tệp cũ (?quaipl=0: tệp cũ).
  python3 dung-hieu-ung-34.py [--ghi]"""
import base64, io, json, os, sys
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..'))
SRC = os.path.join(ROOT, 'docs', 'anh-goc', 'pixellab-quai-vung-3-4', 'hieu-ung')
OUT = os.path.join(ROOT, 'game', 'art', 'custom')
TRON_THUONG = {'hu-no-lua'}  # ảnh mới có khói tối: vẽ thường, không cộng sáng


def main():
    ghi = '--ghi' in sys.argv
    chon = json.load(open(os.path.join(SRC, 'chon.json'), encoding='utf-8'))
    for cu in chon:
        d = os.path.join(SRC, cu[3:])
        J = json.load(open(os.path.join(d, 'pixellab.json')))
        sh = Image.open(os.path.join(d, 'pixellab.png')).convert('RGBA')
        fr = [f['frame'] for f in J['frames']]
        w, h = fr[0]['w'], fr[0]['h']
        t = json.load(open(os.path.join(OUT, cu + '.sprite.json'), encoding='utf-8'))
        assert (w, h) == (t['khung_rong'] * 2, t['khung_cao'] * 2), (cu, w, h, t['khung_rong'], t['khung_cao'])
        assert len(fr) == t['so'], (cu, len(fr), t['so'])
        dai = Image.new('RGBA', (w * len(fr), h))
        for i, f in enumerate(fr):
            dai.paste(sh.crop((f['x'], f['y'], f['x'] + w, f['y'] + h)), (i * w, 0))
        b = io.BytesIO(); dai.save(b, 'PNG', optimize=True)
        moi = 'hu-pl34-' + cu[3:]
        tep = {'loai': 'linh-khi-sprite', 'doi_tuong': 'hieu-ung', 'ma': moi, 'ten': 'PixelLab: ' + t.get('ten', cu) + ' (thay ' + cu + ', ?quaipl=0: ảnh cũ)',
               'net': 2}
        for k in ('khung_rong', 'khung_cao', 'goc', 'so', 'giay', 'lap', 'xoay', 'co', 'tron', 'vung', 'ban_kinh', 'det'):
            if k in t: tep[k] = t[k]
        if cu in TRON_THUONG: tep['tron'] = 'thuong'
        tep['tam'] = 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
        print(moi, (w, h), len(fr), '%.0f KB' % (len(b.getvalue()) / 1024))
        if ghi:
            with open(os.path.join(OUT, moi + '.sprite.json'), 'w', encoding='utf-8') as f:
                json.dump(tep, f, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
