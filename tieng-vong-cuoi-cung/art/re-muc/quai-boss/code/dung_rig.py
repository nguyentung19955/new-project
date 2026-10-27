"""Bước 2 – dựng rig (cây nút cha–con) + dáng nghỉ cho Nấm Mốc / Dơi Chuông / Mẹ Nấm Mốc từ manh/<nv>/tach.json.

Mảnh cắt thẳng từ bản nguyên nên dáng nghỉ = đặt mỗi mảnh đúng chỗ cũ (goc_nghi = 0, dich = 0) → ráp lại trùng ảnh
nguồn (kiểm IoU ≥ 0,98 trong kiem_tra.py). Pivot đặt tay ở chỗ hợp lý cho chuyển động (toạ độ ảnh nguồn CHƯA lật,
đổi sang toạ độ đã lật x' = W − x khi dựng).

CỠ TRONG GAME (px logic; Lam cao 112):
- nam: 116 px logic từ đỉnh quai chuông trên mũ tới đế chân (= quái chuông gỗ đã duyệt 116). Điểm neo = mặt đất,
  giữa hai chân. Hitbox đề xuất 72×100 (thân + chân, không tính chóp mũ / chuông) – xem GHI-CHU.md.
- doi: 56 px logic từ đỉnh quai chuông tới đáy quả lắc (≈ ½ Lam). Quái BAY: điểm neo = đáy quả lắc, giữa trục chuông
  (= giữa đáy hitbox, cùng quy ước "neo = giữa đáy hitbox" của quái/boss cũ). Khi chết rơi xuống, game đặt neo trên
  mặt đất → clip chết-vỡ nằm đúng đất.
- menam: 330 px logic từ núm chuông trên mũ tới đáy gò rễ (= boss Chuông Gác Làng đã duyệt 330). KHÔNG chân, ngồi trên
  gò rễ; điểm neo = mặt đất, trục thân."""
import os
import numpy as np
from PIL import Image
from chung import manh_dir, rig_json, duong_manh, LAM_CAO_LOGIC, TEN_NV, load_json, save_json

CAO_LOGIC = {'nam': 116.0, 'doi': 56.0, 'menam': 330.0}
SO_BAO_TU = {'nam': 6, 'menam': 8, 'doi': 0}

THU_TU_VE = {
    # sau → trước
    'nam': ['tay-sau', 'chan-xa', 'than', 'mu', 'chuong', 'chan-gan', 'tay-truoc'],
    'doi': ['canh-sau', 'than', 'than-phai', 'than-trai', 'qua-lac', 'canh-truoc'],
    'menam': ['vuot-sau', 'tui-xa', 'than', 'go-re', 'tui-gan', 'mu', 'chuong', 'vuot-truoc'],
}
CHA = {
    'nam': {'goc': None, 'than': 'goc', 'mu': 'than', 'chuong': 'mu', 'tay-truoc': 'goc', 'tay-sau': 'goc',
            'chan-xa': 'goc', 'chan-gan': 'goc'},
    'doi': {'goc': None, 'than': 'goc', 'qua-lac': 'than', 'canh-truoc': 'than', 'canh-sau': 'than',
            'than-trai': 'than', 'than-phai': 'than'},
    'menam': {'goc': None, 'go-re': 'goc', 'than': 'goc', 'mu': 'than', 'chuong': 'mu', 'tui-gan': 'than',
              'tui-xa': 'than', 'vuot-truoc': 'goc', 'vuot-sau': 'goc'},
}
AN_MAC_DINH = {'than-trai', 'than-phai'}
# pivot đặt tay, toạ độ ảnh nguồn CHƯA lật (đo trên ảnh có lưới)
PIVOT = {
    'nam': {'mu': (432, 482), 'chuong': (520, 196)},
    'doi': {'than': (642, 420), 'qua-lac': (628, 562), 'canh-truoc': (866, 400), 'canh-sau': (492, 384)},
    'menam': {'than': (452, 790), 'mu': (452, 448), 'chuong': (560, 300), 'tui-gan': (360, 690),
              'tui-xa': (640, 690)},
}
# chỗ bào tử nằm lúc ẩn (toạ độ ảnh nguồn chưa lật) – trong lòng mũ / trong túi
BAO_TU_NGHI = {'nam': (432, 470), 'menam': (452, 700)}


def alpha_of(rel):
    return np.array(Image.open(duong_manh(rel)))[..., 3]


def build(nv):
    tach = load_json(os.path.join(manh_dir(nv), 'tach.json'))
    W = tach['rong_nguon']
    hop = {k: v['hop_tren_nguon'] for k, v in tach['manh'].items()}
    A = {k: alpha_of(v['anh']) for k, v in tach['manh'].items()}

    def bb(k):
        ys, xs = np.nonzero(A[k] > 128)
        ox, oy = hop[k][:2]
        return xs.min() + ox, ys.min() + oy, xs.max() + 1 + ox, ys.max() + 1 + oy

    def tam(k):
        ys, xs = np.nonzero(A[k] > 128)
        return xs.mean() + hop[k][0], ys.mean() + hop[k][1]

    def day(k):
        a = A[k] > 128
        ys, xs = np.nonzero(a)
        yb = ys.max()
        row = np.nonzero(a[yb - 6:yb + 1].any(0))[0]
        return (row.min() + row.max() + 1) / 2 + hop[k][0], yb + 1 + hop[k][1]

    def lat(p):
        return (W - p[0], p[1])

    P = {k: lat(v) for k, v in PIVOT[nv].items()}
    nhan_vat = [k for k in tach['manh'] if k != 'bao-tu']
    top = min(bb(k)[1] for k in nhan_vat if k not in AN_MAC_DINH)
    if nv == 'nam':
        for k in ('tay-truoc', 'tay-sau'):
            P[k] = tam(k)
        for k in ('chan-xa', 'chan-gan'):
            P[k] = day(k)
        ground = max(P['chan-xa'][1], P['chan-gan'][1])
        root_x = (P['chan-xa'][0] + P['chan-gan'][0]) / 2
        tb = bb('than')
        P['than'] = ((tb[0] + tb[2]) / 2, tb[3] - 14)
    elif nv == 'doi':
        ground = max(bb(k)[3] for k in nhan_vat if k not in AN_MAC_DINH)
        root_x = P['than'][0]
        for k, ben in (('than-trai', -1), ('than-phai', 1)):          # góc đáy phía ngoài (đổ quanh điểm chạm đất)
            aa = A[k] > 128
            ys, xs = np.nonzero(aa)
            i = int(np.argmax(ben * xs + ys))
            P[k] = (xs[i] + 0.5 + hop[k][0], ys[i] + 1.0 + hop[k][1])
    else:
        for k in ('vuot-truoc', 'vuot-sau'):
            P[k] = tam(k)
        gb = bb('go-re')
        ground = gb[3]
        root_x = P['than'][0]
        P['go-re'] = (root_x, ground)
    cao_src = ground - top
    k_logic = CAO_LOGIC[nv] / cao_src
    P['goc'] = (root_x, ground)

    nodes = {}
    cha = dict(CHA[nv])
    n_bt = SO_BAO_TU[nv]
    for i in range(n_bt):
        cha[f'bao-tu-{i + 1}'] = 'goc'
        P[f'bao-tu-{i + 1}'] = lat(BAO_TU_NGHI[nv])
    for n, c in cha.items():
        dg = np.array(P[n]) - (np.array(P[c]) if c else 0)
        nodes[n] = {'cha': c, 'diem_gan': [round(float(dg[0]), 2), round(float(dg[1]), 2)], 'goc_nghi': 0.0}
        mk = 'bao-tu' if n.startswith('bao-tu') else n
        if mk in tach['manh']:
            nodes[n]['anh'] = tach['manh'][mk]['anh']
            if mk == 'bao-tu':
                h = A[mk].shape
                nodes[n]['pivot'] = [h[1] / 2.0, h[0] / 2.0]
                nodes[n]['hien'] = False
            else:
                ox, oy = hop[n][:2]
                nodes[n]['pivot'] = [round(float(P[n][0] - ox), 2), round(float(P[n][1] - oy), 2)]
                nodes[n]['hien'] = n not in AN_MAC_DINH
                nodes[n]['pivot_tren_nguon'] = [round(float(P[n][0]), 2), round(float(P[n][1]), 2)]
    thu_tu = THU_TU_VE[nv] + [f'bao-tu-{i + 1}' for i in range(n_bt)]
    rig = {'nut': nodes, 'thu_tu_ve': thu_tu, 'mat_dat_y': round(float(ground), 2),
           'goc_the_gioi': [round(float(root_x), 2), round(float(ground), 2)]}
    ly_do = __doc__.split('CỠ TRONG GAME (px logic; Lam cao 112):')[1]
    ly_do = [l.strip() for l in ly_do.split('\n- ') if l.strip().startswith(nv + ':')][0]
    ty_le = {'px_nguon_sang_px_logic': round(float(k_logic), 6),
             'cao_dang_nghi_px_nguon': round(float(cao_src), 1),
             'cao_dang_nghi_px_logic': round(float(cao_src * k_logic), 2),
             'rong_dang_nghi_px_logic': round(float((max(bb(k)[2] for k in nhan_vat) -
                                                     min(bb(k)[0] for k in nhan_vat)) * k_logic), 1),
             'so_voi_Lam': round(float(cao_src * k_logic / LAM_CAO_LOGIC), 3),
             'ly_do': ' '.join(ly_do.split())}
    return rig, ty_le


QUY_UOC = {
    'don_vi': 'px của ảnh nguồn (code/nguon/*.png) ĐÃ LẬT NGANG; nhân ty_le.px_nguon_sang_px_logic ra px logic game',
    'truc': 'gốc trái-trên, x sang phải, y xuống',
    'goc': 'độ; dương = thuận chiều kim đồng hồ trên màn hình (ctx.rotate). Nhân vật quay mặt sang TRÁI.',
    'bien_doi': 'W = W_cha · T(diem_gan + dich) · R(goc_nghi + goc) · S(ty); ảnh mảnh vẽ với pivot trùng gốc nút',
    'tu_the': 'mỗi nút: dich [dx,dy] (px nguồn, hệ cha), goc, ty [sx,sy], toi (0..1 tối), mo (0..1 đục), hien. '
              'KHÔNG có kênh nháy trắng: game tự nháy (ảnh trắng cache sẵn trong runtime).',
    'thu_tu_ve': 'phần tử đầu vẽ trước (nằm sau cùng)',
    'neo_dat': 'nút "goc" = điểm neo (giữa đáy hitbox: mặt đất cho Nấm / Mẹ Nấm, đáy quả lắc cho Dơi); không dịch',
    'hien': 'cờ bật/tắt mảnh: ĐỔI BẬC theo khung, không nội suy (thân chẻ đôi của Dơi, bào tử)',
}


def main(ds=('nam', 'doi', 'menam')):
    for nv in ds:
        rig, ty_le = build(nv)
        path = rig_json(nv)
        doc = load_json(path) if os.path.exists(path) else {}
        doc.update({'ten': TEN_NV[nv], 'nv': nv,
                    'phong_cach': 'tay chân rời (One Mage Army) – mảnh tách từ ảnh nguồn, không gen ảnh',
                    'nguon': 'code/nguon/' + load_json(os.path.join(manh_dir(nv), 'tach.json'))['nguon'],
                    'quy_uoc': QUY_UOC, 'ty_le': ty_le, 'rig': rig,
                    'huong': 'quay TRÁI (ảnh nguồn nhìn phải đã lật); quay phải: lật ngang quanh điểm neo'})
        save_json(doc, path)
        print(nv, ty_le['cao_dang_nghi_px_logic'], 'px logic; rộng', ty_le['rong_dang_nghi_px_logic'], '; k =',
              ty_le['px_nguon_sang_px_logic'], 'đất y =', rig['mat_dat_y'], 'gốc x =', rig['goc_the_gioi'][0])


if __name__ == '__main__':
    import sys
    main(sys.argv[1:] or ('nam', 'doi', 'menam'))
