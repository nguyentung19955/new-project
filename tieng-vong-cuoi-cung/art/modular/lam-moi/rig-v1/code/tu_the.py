"""Bước 2–3: dựng rig từ dáng nghỉ + đặt 4 tư thế chạy bằng tay → ../lam-moi.json.

Tư thế do người đặt (không IK). Ủng đi theo MỘT quỹ đạo 8 mốc (ĐAT_UNG); ủng gần ở pha φ, ủng xa ở
φ + 0,5 → cùng logic, lệch nửa chu kỳ. 4 tư thế = pha 0; 1/8; 2/8; 3/8 của ủng gần. Nửa sau chu kỳ
(pha 4/8…7/8) = đổi vai hai ủng và hai tay (ghi trong JSON, chưa vẽ ảnh vì giai đoạn này chỉ duyệt 4 tư thế).
"""
import os
import json
import numpy as np
from chung import MANH, JSON_PATH, CAO_LOGIC, HE_SO_THIET_BI, save_json
from rig import build_rig, world_points

TEN_TU_THE = ['cham-dat', 'chiu-luc', 'dap', 'bay']
NHAN = {'cham-dat': 'Chạm đất', 'chiu-luc': 'Chịu lực', 'dap': 'Đạp', 'bay': 'Bay'}

# Quỹ đạo ủng (so với dáng nghỉ của chính ủng đó, đơn vị px ảnh ngang): (dx, nhấc lên, góc, chạm đất?)
# góc + = mũi ủng chúi xuống (gót nhấc), − = mũi hếch lên (gót chạm trước)
DAT_UNG = [
    (+150, 0, -14, True),    # 0/8 chạm đất: đưa ra trước, gót chạm, mũi hếch
    (+35, 0, 0, True),       # 1/8 chịu lực: ủng phẳng, dưới thân
    (-95, 0, +22, True),     # 2/8 đạp: lùi sau thân, gót nhấc, mũi còn chạm đất
    (-150, 45, +36, False),  # 3/8 bay: vừa rời đất phía sau
    (-125, 80, +28, False),  # 4/8: nhấc lên phía sau
    (-15, 95, +8, False),    # 5/8: co lên, đi qua dưới thân
    (+95, 85, -12, False),   # 6/8: đưa lên trước
    (+150, 40, -20, False),  # 7/8: vươn ra trước, hạ dần
]
# dx tính từ ĐIỂM GỐC (giữa hai ủng lúc nghỉ), không tính từ chỗ nghỉ của từng ủng → hai ủng thật sự
# cùng một quỹ đạo. Lệch chiều sâu nhỏ: ủng gần +15 px, ủng xa −15 px.
LECH_SAU = {'ung-gan': +15.0, 'ung-xa': -15.0}

# Thân (theo pha của ủng gần): nhún dy (+ = xuống), nghiêng (+ = chúi trước)
THAN = {'cham-dat': (6, 5), 'chiu-luc': (30, 7), 'dap': (-6, 8), 'bay': (-8, 6)}
# Cả người (nút gốc) bật lên khi bay: dy (+ = xuống). Thân bay tổng cộng = −22 + −8 = −30 px.
GOC = {'cham-dat': 0, 'chiu-luc': 0, 'dap': 0, 'bay': -22}
# Mũ trễ theo thân: (dy so với thân, góc so với thân)
MU = {'cham-dat': (-4, -2.0), 'chiu-luc': (-10, +2.5), 'dap': (+2, +0.5), 'bay': (+8, -2.5)}
# Chóp mũ đung đưa trễ (≤ ±10°): + = đỉnh chóp hất lên
CHOP = {'cham-dat': +3, 'chiu-luc': +9, 'dap': +2, 'bay': -7}
CHUONG = {'cham-dat': -3, 'chiu-luc': +6, 'dap': +2, 'bay': -5}
# Tay: góc quay quanh vai ẩn (vai nằm phía trên nắm tay ~240 px → cung gần như ngang).
# Cả hai tay: + = vung VỀ SAU (sang trái), − = vung RA TRƯỚC (sang phải). Tay sau ra trước thì đi vào sau thân.
# Tay vung ngược chân cùng bên: chân gần ra trước (chạm đất) → tay gần (dao) về sau, tay xa ra trước.
BIEN_DO_TAY_TRUOC = 14.0
BIEN_DO_TAY_SAU = 20.0
GIU_HUONG_DAO = 0.8     # cổ tay xoay ngược 80 % góc vung → dao không chĩa lên/xuống quá


def pha_tay(phi):
    return np.cos(2 * np.pi * phi)       # 1 ở chạm đất (chân gần trước → tay gần sau)


def ung_tai(phi, ten, rig):
    k = int(round(phi * 8)) % 8
    dx, lift, g, ground = DAT_UNG[k]
    rest_x = rig['nut'][ten]['diem_gan'][0]          # vị trí nghỉ của ủng so với gốc
    d = {'dich': [round(dx + LECH_SAU[ten] - rest_x, 2), -lift], 'goc': g}
    if ground:
        d['cham_dat'] = True
    return d


def make_pose(name, phi, rig):
    dy, tilt = THAN[name]
    mdy, mg = MU[name]
    s = pha_tay(phi)
    a_truoc = round(BIEN_DO_TAY_TRUOC * s, 2)
    a_sau = round(-BIEN_DO_TAY_SAU * s, 2)        # tay sau ngược pha tay trước
    return {
        'goc': {'dich': [0, GOC[name]]},
        'than': {'dich': [0, dy], 'goc': tilt},
        'mu': {'dich': [0, mdy], 'goc': mg},
        'chop-mu': {'goc': CHOP[name]},
        'chuong': {'goc': CHUONG[name]},
        'vai-truoc': {'goc': a_truoc},
        'tay-truoc-dao': {'goc': round(-GIU_HUONG_DAO * a_truoc - tilt * 0.5, 2)},
        'vai-sau': {'goc': a_sau},
        'tay-sau': {'goc': round(-0.3 * a_sau, 2)},
        'ung-gan': ung_tai(phi, 'ung-gan', rig),
        'ung-xa': ung_tai(phi + 0.5, 'ung-xa', rig),
    }


def main():
    ch = json.load(open(os.path.join(MANH, 'goc', 'chuan-hoa.json'), encoding='utf-8'))
    khop = json.load(open(os.path.join(MANH, 'goc', 'khop.json'), encoding='utf-8'))
    tach = json.load(open(os.path.join(MANH, 'goc', 'tach.json'), encoding='utf-8'))
    rig = build_rig(ch)
    # mặt đất = điểm thấp nhất thật của dáng nghỉ (ủng nghỉ hơi nghiêng nên góc đế thấp hơn pivot)
    from rig import render
    im, _ = render(rig, {}, (0, 0, 1400, 1400), 1.0)
    ys = np.nonzero((np.array(im)[..., 3] > 128).any(1))[0]
    rig['mat_dat_y'] = float(ys.max() + 1)
    poses = {n: make_pose(n, i / 8, rig) for i, n in enumerate(TEN_TU_THE)}
    nua_sau = {n + '-doi-chan': {'giong': n, 'doi': [['ung-gan', 'ung-xa'], ['vai-truoc', 'vai-sau']],
                                 'cach_lam': 'ủng gần lấy pha φ+0,5 (ủng xa lấy φ); tay đổi dấu góc vung'}
               for n in TEN_TU_THE}
    manh = {}
    for n, v in ch.items():
        manh[n] = {'anh': f'manh/{n}.png', 'co': v['co_moi'], 'tu_manh_bang': v['tu_manh_goc']}
        for k in ('he_so', 'he_so_ngang', 'he_so_doc', 'co_goc'):
            if k in v:
                manh[n][k] = v[k]
        if n in khop or v['tu_manh_goc'] in khop:
            kk = khop[v['tu_manh_goc']]
            manh[n]['khop_anh_ngang'] = {k: kk[k] for k in kk if k not in ('ghi_chu',)}
    manh['mat-xa']['ghi_chu'] = 'bản hẹp/tối của mắt gần, ẩn ở nhìn ngang'
    doc = {
        'ten': 'Lam – rig tay chân rời v1',
        'phien_ban': '1.0.0',
        'quy_uoc': {
            'don_vi': 'px của 2-nhin-ngang.png (1254×1254)',
            'truc': 'gốc trái-trên, x sang phải, y xuống',
            'goc': 'độ; dương = thuận chiều kim đồng hồ trên màn hình; Lam quay mặt sang phải (+x)',
            'bien_doi': 'W = W_cha · T(diem_gan + dich) · R(goc_nghi + goc); ảnh mảnh vẽ với pivot trùng gốc nút',
            'pivot': 'toạ độ px trong ảnh mảnh (manh/<ten>.png) đã chuẩn hoá cỡ',
            'cham_dat': 'ủng có cham_dat=true: tự dịch dọc để điểm thấp nhất chạm mat_dat_y',
            'thu_tu_ve': 'phần tử đầu vẽ trước (nằm sau cùng)',
            'cao_logic_px': CAO_LOGIC, 'he_so_thiet_bi': HE_SO_THIET_BI,
        },
        'manh': manh,
        'rig': rig,
        'tu_the': poses,
        'tu_the_nua_sau': nua_sau,
        'pha_ung': {n: [i / 8, (i / 8 + 0.5) % 1] for i, n in enumerate(TEN_TU_THE)},
        'quy_dao_ung_8_moc': [{'dx': a, 'nhac': b, 'goc': c, 'cham_dat': d} for a, b, c, d in DAT_UNG],
        'nguon': {'bang_manh': '3-bang-manh.png', 'nhin_ngang': '2-nhin-ngang.png',
                  'tach': tach['bang_manh']},
    }
    save_json(doc, JSON_PATH)
    for n in TEN_TU_THE:
        wp = world_points(rig, poses[n])
        print(n, 'thân', wp['than'], 'tay trước', wp['tay-truoc-dao'])


if __name__ == '__main__':
    main()
