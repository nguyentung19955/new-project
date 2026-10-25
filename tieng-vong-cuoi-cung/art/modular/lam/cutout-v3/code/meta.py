"""Ghép định nghĩa rig (khung.py) + số đo mảnh → dict metadata thống nhất (ghi ra lam-v3.json)."""
import math

QUY_UOC = ("Toạ độ px ảnh/thế giới: x phải, y xuống. Góc độ, DƯƠNG = chiều kim đồng hồ trên màn hình, "
           "0° = +x, 90° = xuống. huong_anh = hướng xương D−P trong ảnh (0 nếu không có D). "
           "goc_nghi = góc TƯƠNG ĐỐI (cục bộ) của hướng mảnh so với hướng cha; gốc (than) so với trục x thế giới. "
           "Hướng = hướng xương nếu có D, ngược lại = trục x ảnh. Pose: pose.goc[ten] = delta cộng vào goc_nghi. "
           "M_con = M_cha·T(gan)·R(goc_nghi+delta+huong_cha−huong_con)·S(ti_le)·T(−P). "
           "gan = điểm gắn trên ảnh CHA (px chưa scale); với chuỗi chi, gan = D của cha. "
           "slot: số nhỏ vẽ trước (xa). slot_theo_tu_the đổi slot khi điều kiện đúng.")


def dims_of(pc, names):
    out = {}
    for n in names:
        p = pc[n]
        out[n] = dict(w=int(p.mask.shape[1]), h=int(p.mask.shape[0]),
                      P=None if p.P is None else [round(p.P[0], 2), round(p.P[1], 2)],
                      D=None if p.D is None else [round(p.D[0], 2), round(p.D[1], 2)],
                      huong=0.0 if p.D is None else round(math.degrees(math.atan2(p.D[1] - p.P[1], p.D[0] - p.P[0])), 4),
                      xuong=None if p.D is None else round(math.hypot(p.D[0] - p.P[0], p.D[1] - p.P[1]), 2))
        if 'goc_trong_mu' in p.extra:
            out[n]['chop_goc'] = p.extra['goc_trong_mu']
    return out


def meta_json(R, dims, root, canvas, dat_y, extra=None):
    manh = {}
    for n, r in R.items():
        d = dims[r['anh']]
        P = r.get('P') or [d['w'] / 2.0, d['h'] / 2.0]
        gan = r.get('gan')
        if gan is None and r['cha'] is not None:
            gan = dims[R[r['cha']]['anh']]['D']          # chuỗi chi: gắn vào D của cha
        manh[n] = dict(anh=r['anh'] + '.png', kich_thuoc=[d['w'], d['h']],
                       P=[round(float(P[0]), 2), round(float(P[1]), 2)],
                       D=d['D'],
                       xuong=d['xuong'], huong_anh=d['huong'],
                       cha=r['cha'], gan=None if gan is None else [round(float(gan[0]), 2), round(float(gan[1]), 2)],
                       goc_nghi=round(float(r['goc_nghi']), 3), kieu_goc='tuong_doi',
                       ti_le=float(r.get('ti_le', 1.0)), slot=int(r['slot']))
        if r.get('ghi_chu'):
            manh[n]['ghi_chu'] = r['ghi_chu']
    out = dict(phien_ban='lam-cutout-v3', quy_uoc_goc=QUY_UOC,
               don_vi='px thế giới (Lam cao ~470 px). Game: 112 px logic ⇒ ×112/470 ≈ 0,238.',
               goc=dict(manh='than', vi_tri_nghi=[round(float(root[0]), 2), round(float(root[1]), 2)]),
               canvas=list(canvas), dat_y=dat_y, manh=manh)
    if extra:
        out.update(extra)
    return out
