"""Bước 1 (PROMPT mục 1): chuyển toạ độ thế giới nghỉ của v2 sang offset cục bộ/góc tương đối
mà KHÔNG làm nhảy vị trí nghỉ. Dùng mảnh v2 nguyên bản + rap3 (đọc JSON) rồi so với rest của rap2 v2.
Chạy: python3 kiem_chuyen_doi.py  (cần thư mục review-v2 bên cạnh cutout-v3 như trong repo)."""
import os, sys, json, importlib
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
V2DIR = os.path.normpath(os.path.join(HERE, '..', '..', 'review-v2', 'lam-cutout', 'code'))
OUT = os.path.join(HERE, '..', 'kiem-thu')


def main():
    sys.path.insert(0, V2DIR)
    cwd = os.getcwd(); os.chdir(V2DIR)
    try:
        rap2 = importlib.import_module('rap2')
    finally:
        os.chdir(cwd)
    sys.path.pop(0)
    sys.path.insert(0, HERE)
    import khung, meta, rap3
    PC, IM = rap2.PC, rap2.IM
    names = list(PC)
    dims = meta.dims_of(PC, names)
    dims['chop-mu']['chop_goc'] = PC['chop-mu'].extra['goc_trong_mu']
    R = khung.rig_tu_v2(dims)
    M = meta.meta_json(R, dims, root=khung.V2['than_pos'], canvas=(520, 520), dat_y=None)
    os.makedirs(OUT, exist_ok=True)
    jp = os.path.join(OUT, '00-chuyen-doi-v2-cuc-bo.json')
    json.dump(M, open(jp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    imgs = {k + '.png': v for k, v in IM.items()}
    rig = rap3.Rig(jp, images=imgs)
    a = np.array(rap2.render(rap2.lam(rap2.REST))).astype(int)
    b = np.array(rap3.render(rig.layers())).astype(int)
    diff = np.abs(a - b).max(-1)
    # mắt 1: v2 resize ảnh (24x42) rồi dán, v3 scale 0.92 bằng ma trận → khác nội suy ở mắt
    bad = diff > 8
    eye_box = None
    Mm, _ = rig.matrices()
    e = rig.world_point('mat-1', (13, 23))
    res = dict(diem_khac_gt8=int(bad.sum()), diem_khac_gt0=int((diff > 0).sum()), tong=int(diff.size),
               max_khac=int(diff.max()))
    if bad.any():
        ys, xs = np.nonzero(bad)
        res['bbox_khac'] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    res['tam_mat_1'] = [round(float(e[0]), 1), round(float(e[1]), 1)]
    # lean: v2 không kéo chi/đầu theo thân; v3 kéo theo → chứng minh bằng số
    for lean in (-8, 8):
        Lv2 = rap2.lam(dict(rap2.REST, lean=lean))
        Mv2 = {}
        for img, Mx in Lv2:
            for k, v in IM.items():
                if img is v: Mv2.setdefault(k, Mx)
        Mv3, _ = rig.matrices({'goc': {'than': lean}})
        out = {}
        for k in ('mu', 'capelet-sau', 'gang-gan', 'ung-gan'):
            p = (dims[k]['w'] / 2, dims[k]['h'] / 2)
            out[k] = dict(v2=[round(float(x), 1) for x in rap3.app(Mv2[k], p)],
                          v3=[round(float(x), 1) for x in rap3.app(Mv3[k], p)])
        res['lean_%+d' % lean] = out
    img = Image.new('RGB', (1560, 520), 'white')
    for i, arr in enumerate((a, b)):
        t = Image.new('RGBA', (520, 520), 'white'); t.alpha_composite(Image.fromarray(arr.astype(np.uint8)))
        img.paste(t.convert('RGB'), (520 * i, 0))
    d = np.zeros((520, 520, 3), np.uint8) + 255; d[diff > 0] = (255, 160, 0); d[bad] = (255, 0, 0)
    img.paste(Image.fromarray(d), (1040, 0))
    img.save(os.path.join(OUT, '00-chuyen-doi-v2-cuc-bo.png'))
    json.dump(res, open(os.path.join(OUT, '00-chuyen-doi-v2-cuc-bo-ketqua.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    print(json.dumps(res, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
