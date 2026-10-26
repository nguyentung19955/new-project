"""(Chạy MỘT LẦN, cần thư mục ../../../modular/lam-moi/rig-v2) – vẽ Lam dáng nghỉ của rig-v2 ở 4× cỡ logic
(Lam cao 112 px logic → 448 px) để so cỡ quái/boss với Lam. Kết quả đã chép sẵn vào nguon/lam-rig-v2-nghi-4x.png
+ nguon/lam-rig-v2-nghi-4x.json, nên các script khác KHÔNG cần rig-v2 nữa.
Không sửa gì trong rig-v2 (chỉ đọc lam-moi-v2.json + manh/)."""
import os
import sys
import json
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
RIG2 = os.path.normpath(os.path.join(HERE, '..', '..', '..', 'modular', 'lam-moi', 'rig-v2'))
sys.path.insert(0, os.path.join(RIG2, 'code'))

import rig as rig2  # noqa: E402  (rig.py của rig-v2)


def main():
    doc = json.load(open(os.path.join(RIG2, 'lam-moi-v2.json'), encoding='utf-8'))
    so = json.load(open(os.path.join(RIG2, 'so-lieu.json'), encoding='utf-8'))
    k = so['he_so_112']                       # px ảnh ngang → px logic
    R = doc['rig']
    gx, gy = R['nut']['goc']['diem_gan']
    box = (gx - 700, gy - 1250, gx + 700, gy + 10)
    s = 4 * k
    im = rig2.render(R, doc['tu_the_nghi'], box, s, rig_dir=RIG2)
    a = np.array(im)[..., 3]
    ys, xs = np.nonzero(a > 8)
    x0, y0, x1, y1 = xs.min() - 4, ys.min() - 4, xs.max() + 5, ys.max() + 1
    anchor = ((gx - box[0]) * s, (gy - box[1]) * s)           # gốc rig (giữa hai chân, mặt đất)
    im = im.crop((x0, y0, x1, y1))
    out = os.path.join(HERE, 'nguon', 'lam-rig-v2-nghi-4x.png')
    im.save(out)
    meta = {'ghi_chu': 'Lam rig-v2 dáng nghỉ (tu_the_nghi), vẽ 4× cỡ logic: 4 px ảnh = 1 px logic. '
                       'neo = gốc rig (giữa hai ủng, mặt đất) trong ảnh này.',
            'px_anh_moi_px_logic': 4, 'neo': [round(anchor[0] - x0, 2), round(anchor[1] - y0, 2)],
            'cao_logic': round((ys.max() + 1 - ys.min()) / 4, 2), 'nguon': 'art/modular/lam-moi/rig-v2'}
    json.dump(meta, open(out.replace('.png', '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(meta)


if __name__ == '__main__':
    main()
