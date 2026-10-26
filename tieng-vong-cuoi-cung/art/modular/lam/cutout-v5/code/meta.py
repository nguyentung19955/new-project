"""Ghép định nghĩa rig (khung.py) + số đo mảnh → dict metadata thống nhất (ghi ra lam-v5.json)."""
import math

SCHEMA_VERSION = '5.0.0'
WORLD_TO_LOGIC = 112 / 470.0

QUY_UOC = ("Toạ độ px ảnh/thế giới: x phải, y xuống. Góc độ, DƯƠNG = chiều kim đồng hồ trên màn hình, "
           "0° = +x, 90° = xuống. huong_anh = hướng xương D−P trong ảnh (0 nếu không có D). "
           "goc_nghi = góc TƯƠNG ĐỐI (cục bộ) của hướng mảnh so với hướng cha; gốc (than) so với trục x thế giới. "
           "Hướng = hướng xương nếu có D, ngược lại = trục x ảnh. Pose: pose.goc[ten] = delta cộng vào goc_nghi. "
           "M_con = M_cha·T(gan)·R(goc_nghi+delta+huong_cha−huong_con)·S(ti_le)·T(−P). "
           "gan = điểm gắn trên ảnh CHA (px chưa scale); với chuỗi chi, gan = D của cha.")

THU_TU_XU_LY = ['1 góc cục bộ = goc_nghi + delta pose',
                '2 phu: bù góc tĩnh (con += he_so × delta nguồn, kẹp gioi_han)',
                '3 FK từ gốc: root (goc_toa_do) + góc thân (lean)',
                '4 IK hai đoạn cho chuỗi khoá chân (ghi đè góc đùi/cẳng/ủng, trộn mix), sau root/lean',
                '5 slot_theo_tu_the đánh giá trên góc SAU IK',
                '6 sắp lớp theo khoá (slot, thu_tu_phu, ten) – tăng dần, nhỏ vẽ trước',
                '7 bỏ mảnh visible=false (chỉ mảnh đó, không bỏ con), vẽ']

LAT = dict(kieu='toan_rig', mo_ta='Lật ngang toàn rig khi nhân vật quay trái: áp ma trận S(−1,1) quanh x = x gốc '
           '(P thân thế giới) SAU khi tính mọi ma trận (W = T(x0,0)·S(−1,1)·T(−x0,0)·M). Không đổi slot, '
           'thu_tu_phu, visible, góc cục bộ hay dấu gap trong dữ liệu: IK giải trong hệ chưa lật rồi mới lật. '
           'Đích khoá chân đưa vào IK phải ở hệ CHƯA lật (x_chua_lat = 2·x0 − x_man_hinh).')


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
        if 'diem_de' in p.extra:
            out[n]['diem_de'] = p.extra['diem_de']
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
                       goc_nghi=round(float(r['goc_nghi']), 4), kieu_goc='tuong_doi',
                       ti_le=float(r.get('ti_le', 1.0)), slot=int(r['slot']),
                       thu_tu_phu=int(r.get('thu_tu_phu', 0)), visible=bool(r.get('visible', True)))
        if d.get('diem_de'):
            manh[n]['diem_de'] = d['diem_de']
        if r.get('ghi_chu'):
            manh[n]['ghi_chu'] = r['ghi_chu']
    out = dict(schema_version=SCHEMA_VERSION, phien_ban='lam-cutout-v5', quy_uoc_goc=QUY_UOC,
               don_vi='px thế giới (Lam cao ~470 px).',
               world_to_logic=WORLD_TO_LOGIC, logic_cao_lam=112, the_gioi_cao_lam=470,
               ghi_chu_thiet_bi='px thiết bị = px logic × devicePixelRatio của canvas thật (bài thử dùng 2,17 làm giả định, '
                                'CHƯA đo trên máy thật).',
               goc=dict(manh='than', vi_tri_nghi=[round(float(root[0]), 2), round(float(root[1]), 2)]),
               canvas=list(canvas), dat_y=dat_y, thu_tu_xu_ly=THU_TU_XU_LY,
               sap_lop=dict(khoa=['slot', 'thu_tu_phu', 'ten'], chieu='tăng dần = vẽ trước (xa)'),
               visible_ghi_chu='visible=false: không vẽ CHÍNH mảnh đó; ma trận vẫn tính, con vẫn vẽ. '
                               'Ghi đè theo pose: pose.hien[ten] = true/false.',
               lat_ngang=LAT, manh=manh)
    if extra:
        out.update(extra)
    return out
