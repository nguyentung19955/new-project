"""Bước 2 – dựng rig (cây nút cha–con) + dáng nghỉ cho quái và boss từ manh/<nv>/tach.json.

Mảnh cắt thẳng từ ảnh nguồn nên dáng nghỉ = đặt mỗi mảnh đúng chỗ cũ (goc_nghi = 0, dich = 0) → ráp lại trùng
ảnh nguồn (kiểm bằng IoU trong xem_thu.py / kiem_tra.py). Pivot đặt tay ở chỗ hợp lý cho chuyển động.

CỠ TRONG GAME (px logic; Lam cao 112):
- Quái: 116 px logic từ đỉnh quai treo tới đế chân. Lý do: hitbox gameplay 72×108 (game/demo.html, QW/QH) bỏ
  vòng treo → phần thân + chân (không tính quai) ≈ 102 px, thân chuông rộng ≈ 77 px – khớp hitbox; quái cao ngang
  Lam (116 vs 112: chỉ hơn nhờ cái quai).
- Boss: 330 px logic từ đỉnh núm mái tới mặt đất (≈ 2,95× Lam). Boss KHÔNG có chân: lơ lửng sát
  mặt đất: quả lắc (điểm thấp nhất) cách đất 6 px logic, vành miệng chuông ~14 px. Núm mái → quả lắc 324 px.
  Hitbox gameplay 200×290 tính từ đất phủ thân chuông tới chân mái."""
import os
import numpy as np
from PIL import Image
from chung import MANH, GOC, RIG_JSON, LAM_CAO_LOGIC, SHEET_X, load_json, save_json

CAO_LOGIC = {'quai': 116.0, 'boss': 330.0}
BOSS_LO_LUNG_LOGIC = 6.0              # khe đầu xích ↔ mặt đất ở dáng nghỉ (px logic)

THU_TU_VE = {
    # sau → trước
    'quai': ['tay-sau', 'chan-xa', 'than', 'than-phai', 'than-trai', 'qua-lac', 'chan-gan', 'tay-truoc'],
    'boss': ['tay-sau', 'than', 'than-phai', 'than-trai', 'xich', 'tay-truoc'],
}
CHA = {
    'quai': {'goc': None, 'than': 'goc', 'qua-lac': 'than', 'than-trai': 'than', 'than-phai': 'than',
             'tay-truoc': 'goc', 'tay-sau': 'goc', 'chan-xa': 'goc', 'chan-gan': 'goc'},
    'boss': {'goc': None, 'than': 'goc', 'xich': 'than', 'than-trai': 'than', 'than-phai': 'than',
             'tay-truoc': 'goc', 'tay-sau': 'goc'},
}
AN_MAC_DINH = {'than-trai', 'than-phai'}         # chỉ hiện trong clip chết
PIVOT_TAY = {}                                    # nắm tay: tâm bóng (tính)
Q_QUA_LAC_PIVOT = (588.0, 832.0)                 # đỉnh cuống quả lắc (trong lòng chuông)
B_XICH_PIVOT = (905.0, 842.0)                    # chỗ mắt xích dọc đầu tiên móc vào mắt xích ngang trên thân


def alpha_of(rel):
    return np.array(Image.open(os.path.join(GOC, rel)))[..., 3]


def build(nv):
    tach = load_json(os.path.join(MANH, nv, 'tach.json'))
    hop = {k: v['hop_tren_nguon'] for k, v in tach['manh'].items()}
    A = {k: alpha_of(v['anh']) for k, v in tach['manh'].items()}

    def bb(k):                                     # hộp bóng (alpha>128) trên toạ độ nguồn
        ys, xs = np.nonzero(A[k] > 128)
        ox, oy = hop[k][:2]
        return xs.min() + ox, ys.min() + oy, xs.max() + 1 + ox, ys.max() + 1 + oy

    def tam(k):
        ys, xs = np.nonzero(A[k] > 128)
        return xs.mean() + hop[k][0], ys.mean() + hop[k][1]

    def day(k):                                     # giữa đế: tâm ngang của hàng đáy, mép dưới bóng
        a = A[k] > 128
        ys, xs = np.nonzero(a)
        yb = ys.max()
        row = np.nonzero(a[yb - 6:yb + 1].any(0))[0]
        return (row.min() + row.max() + 1) / 2 + hop[k][0], yb + 1 + hop[k][1]

    P = {}                                          # pivot thế giới (toạ độ nguồn)
    for k in ('tay-truoc', 'tay-sau'):
        P[k] = tam(k)
    tb = bb('than')
    if nv == 'quai':
        for k in ('chan-xa', 'chan-gan'):
            P[k] = day(k)
        ground = max(P['chan-xa'][1], P['chan-gan'][1])
        root_x = (P['chan-xa'][0] + P['chan-gan'][0]) / 2
        a = A['than'] > 128
        P['than'] = ((tb[0] + tb[2]) / 2, tb[3] - 12)            # giữa miệng chuông, sát mép dưới
        P['qua-lac'] = Q_QUA_LAC_PIVOT
        top = tb[1]
        cao_src = ground - top
    else:
        xb = bb('xich')
        top = tb[1]
        a = A['than'] > 128
        ys, xs = np.nonzero(a)
        yb = ys.max()
        row = np.nonzero(a[yb - 14:yb + 1].any(0))[0] + hop['than'][0]
        root_x = (row.min() + row.max()) / 2                       # trục chuông = giữa quả lắc (điểm thấp nhất)
        P['than'] = (root_x, yb + hop['than'][1] - 30)            # giữa đáy chuông (miệng + quả lắc)
        P['xich'] = B_XICH_PIVOT
        cao_src = None
        ground = None
        xich_day = max(xb[3], yb + 1 + hop['than'][1])               # điểm thấp nhất (quả lắc / đầu xích)
    # chiều cao & tỉ lệ
    if nv == 'quai':
        k_logic = CAO_LOGIC['quai'] / cao_src
    else:
        # tổng = (điểm thấp nhất + khe) − đỉnh = 330 px logic → giải k
        cao_than_src = xich_day - top
        k_logic = (CAO_LOGIC['boss'] - BOSS_LO_LUNG_LOGIC) / cao_than_src
        ground = xich_day + BOSS_LO_LUNG_LOGIC / k_logic
        cao_src = ground - top
    # nửa thân chẻ đôi (chết): pivot ở GÓC ĐÁY PHÍA NGOÀI (điểm biên xa nhất theo hướng chéo xuống-ra-ngoài)
    # → khi đổ, nửa thân xoay quanh đúng điểm chạm đất, không trượt.
    for k, ben in (('than-trai', -1), ('than-phai', 1)):
        aa = A[k] > 128
        ys, xs = np.nonzero(aa)
        i = int(np.argmax(ben * xs + ys))
        P[k] = (xs[i] + 0.5 + hop[k][0], ys[i] + 1.0 + hop[k][1])
    P['goc'] = (root_x, ground)

    nodes = {}
    for n, c in CHA[nv].items():
        if c is None:
            dg = np.array(P[n])
        else:
            dg = np.array(P[n]) - np.array(P[c])
        nodes[n] = {'cha': c, 'diem_gan': [round(float(dg[0]), 2), round(float(dg[1]), 2)], 'goc_nghi': 0.0}
        if n in tach['manh']:
            ox, oy = hop[n][:2]
            nodes[n]['anh'] = tach['manh'][n]['anh']
            nodes[n]['pivot'] = [round(float(P[n][0] - ox), 2), round(float(P[n][1] - oy), 2)]
            nodes[n]['hien'] = n not in AN_MAC_DINH
            nodes[n]['pivot_tren_nguon'] = [round(float(P[n][0]), 2), round(float(P[n][1]), 2)]
    rig = {'nut': nodes, 'thu_tu_ve': THU_TU_VE[nv], 'mat_dat_y': round(float(ground), 2),
           'goc_the_gioi': [round(float(root_x), 2), round(float(ground), 2)]}
    ty_le = {'px_nguon_sang_px_logic': round(float(k_logic), 6),
             'cao_dang_nghi_px_nguon': round(float(cao_src), 1),
             'cao_dang_nghi_px_logic': round(float(cao_src * k_logic), 2),
             'so_voi_Lam': round(float(cao_src * k_logic / LAM_CAO_LOGIC), 3),
             'sheet_px_moi_px_logic': SHEET_X,
             'ly_do': (__doc__.split('CỠ TRONG GAME (px logic; Lam cao 112):')[1].split('- Boss')[0].strip()
                       if nv == 'quai' else '- Boss' + __doc__.split('- Boss')[1].strip())}
    if nv == 'boss':
        ty_le['khe_dau_xich_dat_px_logic'] = BOSS_LO_LUNG_LOGIC
    return rig, ty_le


QUY_UOC = {
    'don_vi': 'px của ảnh nguồn 1254×1254 (code/nguon/*.png); nhân ty_le.px_nguon_sang_px_logic ra px logic game',
    'truc': 'gốc trái-trên, x sang phải, y xuống',
    'goc': 'độ; dương = thuận chiều kim đồng hồ trên màn hình (ctx.rotate). Nhân vật quay mặt sang TRÁI.',
    'bien_doi': 'W = W_cha · T(diem_gan + dich) · R(goc_nghi + goc) · S(ty); ảnh mảnh vẽ với pivot trùng gốc nút',
    'tu_the': 'mỗi nút: dich [dx,dy] (px nguồn, hệ cha), goc, ty [sx,sy], trang (0..1 hoà trắng), toi (0..1 tối), '
              'mo (0..1 đục), hien',
    'thu_tu_ve': 'phần tử đầu vẽ trước (nằm sau cùng)',
    'neo_dat': 'nút "goc" = điểm neo đất (mặt đất, giữa hai chân / trục chuông); không bao giờ dịch',
}


def main():
    for nv in ('quai', 'boss'):
        rig, ty_le = build(nv)
        path = RIG_JSON[nv]
        doc = load_json(path) if os.path.exists(path) else {}
        doc.update({'ten': 'Quái chuông gỗ' if nv == 'quai' else 'Boss Chuông Gác Làng',
                    'phong_cach': 'tay chân rời (One Mage Army) – mảnh tách từ ảnh nguồn, không gen ảnh',
                    'nguon': f'code/nguon/{os.path.basename(load_json(os.path.join(MANH, nv, "tach.json"))["nguon"])}',
                    'quy_uoc': QUY_UOC, 'ty_le': ty_le, 'rig': rig,
                    'huong': 'quay TRÁI như ảnh nguồn; quay phải: lật ngang quanh điểm neo (ctx.scale(-1,1) tại chân)'})
        save_json(doc, path)
        print(nv, ty_le['cao_dang_nghi_px_logic'], 'px logic; k =', ty_le['px_nguon_sang_px_logic'],
              'đất y =', rig['mat_dat_y'], 'gốc x =', rig['goc_the_gioi'][0])


if __name__ == '__main__':
    main()
