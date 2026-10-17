#!/usr/bin/env python3
"""KIẾM NẶNG (combo 3 nhát mới của Cu Tí, 17/10 — docs/review/ke-hoach-cai-thien/kiem-nang/bao-cao.md).

Dựng 3 hàng mới vào tấm thân bộ ninja game/art/custom/zed-moi.sprite.json (THÊM vào cuối tấm, các ô cũ không đổi một điểm ảnh):
  kiem_1~kn = khung 1–4 (★ khung 4, chém hất lên)      game dùng thay kiem_1 khi cầm kiếm (?kiemnang=0 về hàng trước phiên này)
  kiem_2~kn = khung 5–7 (★ khung 6, hai tay bổ xuống)   thay kiem_2
  kiem_3~kn = khung 8–10 (★ khung 9, chém ngang)        thay kiem_3
Ảnh: docs/anh-goc/kiem-nang/kiem-nang-10k.png, cắt bằng cat-diem-anh.py → moi16/28-kiem-nang-10k-gif/kiem/ (10 khung, ĐẠT).
Neo kiếm: gan-vk/neo-kiem-nang.py → neo.json "28-kiem-nang-10k" (hai tay "co_dinh"); góc khung sát đất tính ở đây (GOC_DAT).

Cách dựng = y hệt hàng kiếm mới 16/10 + độ nét 17/10:
  - chạy chính hàm dung_than của dung-zed-game.py (qua do-net/cong-cu/dung_zed_net.py để thu nhỏ KIỂU NÉT: lấy màu theo ô, alpha 0/255)
    với hàng tham chiếu 01-dung (cỡ) + 01-dung-8k (đầu, bàn chân trước) + 10 khung kiếm nặng làm MỘT hàng → cả 10 khung cùng một tỉ lệ:
    ĐẦU bằng đầu hàng đứng mới, BÀN CHÂN TRƯỚC đúng chỗ bàn chân trước lúc đứng (CHAN_TRUOC), rồi chia 4 / 3 / 3 khung;
  - bản to ×1,2 (tam_to) dựng thẳng từ ảnh gốc (dung_to), không kèm ô nắm tay kiểu cũ (như goi_to.py);
  - màu: đưa về đúng bảng màu đang có của tấm (màu gần nhất) → tấm vẫn ≤ 64 màu, các ô cũ không đổi;
  - vũ khí: vk / vk_tl / vk_cam y hệt kiem_1~16 (cùng thanh kiếm, cùng cỡ, cùng điểm cầm chuẩn cam_chuan_data).
Chạy lại được (tự bỏ 3 hàng đã thêm lần trước rồi dựng lại):  python3 docs/anh-goc/zed/dung-kiem-nang.py
"""
import base64, copy, importlib.util, io, json, math, os, sys
import numpy as np
from PIL import Image

DAY = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.abspath(os.path.join(DAY, '..', '..', '..'))
CONG_CU = os.path.join(GOC, 'docs', 'review', 'ke-hoach-cai-thien', 'do-net', 'cong-cu')
TEP = os.path.join(GOC, 'game', 'art', 'custom', 'zed-moi.sprite.json')
THU = '28-kiem-nang-10k'
HANG = [('kiem_1~kn', 0, 4, 0.3), ('kiem_2~kn', 4, 7, 0.3), ('kiem_3~kn', 7, 10, 0.46)]   # (khoá, khung đầu, khung cuối +1, giây)
# Khung lê / sát đất (đếm từ 0): góc kiếm tính lại để mũi thanh kiếm DÀI NHẤT (4 cấp) vừa chạm vạch đất (y = 90 ô 96), không xuyên
# đất; giữ phía của góc người đặc (chúc ra sau: 1, 2; chúc ra trước: 3, 7).
KHUNG_DAT = (0, 1, 2, 6)
Y_DAT = 90.0
KHUNG_CAO = (0, 1, 2, 7, 8, 9)   # khung thẳng người, không giơ tay quá đầu: đo chiều cao người

# ---- nạp công cụ nét (vá Image.resize / paste… của dung-zed-game.py, ghi cách ghép để dựng bản to) mà không chạy main() của nó ----
sys.path.insert(0, CONG_CU)
_src = open(os.path.join(CONG_CU, 'dung_zed_net.py'), encoding='utf-8').read()
_src = _src[:_src.rstrip().rindex('main()')]
NET = {'__file__': os.path.join(CONG_CU, 'dung_zed_net.py'), '__name__': 'dung_zed_net'}
_argv = sys.argv; sys.argv = [sys.argv[0]]
exec(compile(_src, NET['__file__'], 'exec'), NET)
sys.argv = _argv
DZ, thu_net = NET['DZ'], NET['thu_net']
sys.path.insert(0, os.path.join(DAY, 'gan-vk'))
_sp = importlib.util.spec_from_file_location('neo_kn', os.path.join(DAY, 'gan-vk', 'neo-kiem-nang.py'))
NK = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(NK)


def doc_anh(s):
    return np.array(Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA'))


def ve_bang(a, bang):
    """Đưa mọi điểm đục của a về màu gần nhất trong bảng (n×3); alpha 0/255."""
    a = a.copy(); op = a[..., 3] > 0
    px = a[op][:, :3].astype(int)
    if len(px):
        d = ((px[:, None, :] - bang[None, :, :]) ** 2).sum(2)
        a[op, :3] = bang[d.argmin(1)]
    a[op, 3] = 255; a[~op] = 0
    return a


def bo_hang_cu(d):
    """Bỏ các hàng kiếm nặng đã thêm lần trước (chạy lại)."""
    m = d.pop('kiem_nang', None)
    if not m:
        return d
    for k, *_ in HANG:
        d['dong_tac'].pop(k, None)
    t = doc_anh(d['tam'])[:m['h_tam'] * 96]
    d['tam'] = 'data:image/png;base64,' + base64.b64encode(thu_net.png_bang_mau(t)).decode()
    to = doc_anh(d['tam_to']); O, C = d['to']['o'], d['to']['cot']
    to = to[:((m['o_to'] + C - 1) // C) * O]
    hang_cuoi = m['o_to'] // C   # xoá các ô thêm ở hàng cuối cũ
    if m['o_to'] % C:
        to[hang_cuoi * O:, (m['o_to'] % C) * O:] = 0
    d['tam_to'] = 'data:image/png;base64,' + base64.b64encode(thu_net.png_bang_mau(to)).decode()
    d['to']['o_cua'] = d['to']['o_cua'][:m['h_tam'] * d['to']['cot_goc']]
    return d


def dung(neo_e, kiem16):
    """Chạy dung_than (cách nét) cho hàng tham chiếu + 10 khung kiếm nặng. Trả (tam, dt, dong)."""
    neo_all = {THU: neo_e}
    dong = [('dung', '01-dung', 1.0, True, DZ.doc_dong('01-dung')),
            ('dung~16', '01-dung-8k', 1.0, True, DZ.doc_dong('01-dung-8k', DZ.GOC_RIENG['01-dung-8k'])),
            ('kiem_nang', THU, 0.3, False, DZ.doc_dong(THU, os.path.join(DZ.MOI16, THU + '-gif')))]
    DZ.CHAN_TRUOC.add(THU)
    H = float(np.median([f['bb'][3] - f['bb'][1] for f in dong[0][4]]))
    s = DZ.CAO_96 / H
    # CỠ NGƯỜI = HÀNG ĐỨNG MỚI theo CHIỀU CAO (không theo cỡ đầu): ảnh kiếm nặng vẽ người ít "chibi" hơn (đầu gần bằng nhưng thân + chân
    # dài hơn) → co theo đầu như kiếm 16/10 thì người cao hơn lúc đứng 12 điểm ảnh ô 96 (~19 %), vào đòn như lớn phổng lên. Ở đây co sao cho
    # chiều cao các khung thẳng người, không giơ tay (KHUNG_CAO) = chiều cao trung vị hàng đứng mới (dung~16). dung_than co hàng CHAN_TRUOC
    # theo "cỡ đầu" → đưa cho nó cỡ đầu quy đổi (cao_dau giả) để ra đúng tỉ lệ này; vẫn căn bàn chân trước như kiếm 16/10.
    goc_dau = DZ.co_dau_hang
    d0, d16 = goc_dau(dong[0][4]), goc_dau(dong[1][4])
    r16 = math.sqrt(d0[0] / d16[0] * d0[1] / d16[1])
    h16 = float(np.median([f['bb'][3] - f['bb'][1] for f in dong[1][4]])) * s * r16
    h_kn = float(np.median([dong[2][4][i]['bb'][3] - dong[2][4][i]['bb'][1] for i in KHUNG_CAO]))
    r_kn = h16 / (h_kn * s)
    that = goc_dau(dong[2][4])
    DZ.co_dau_hang = lambda fr: (r16 * d16[0] / r_kn, that[1], that[2]) if fr is dong[2][4] else goc_dau(fr)
    print('Cỡ: cao người đứng mới %.1f điểm ảnh ô 96; kiếm nặng nếu co theo đầu: %.1f → co theo chiều cao: %.1f (đầu %.1f thay vì 25,2)' % (
        h16, h_kn * s * r16 * d16[0] / that[0], h_kn * s * r_kn, that[0] * s * r_kn))

    def vk_cua(k, n, nam=False):
        r = {q: copy.deepcopy(kiem16[q]) for q in ('vk', 'vk_tl', 'vk_cam')}
        if nam and 'vk_cam' in kiem16.get('nam', {}):
            r['vk_cam'] = copy.deepcopy(kiem16['nam']['vk_cam'])
        return r

    def neo_cua(thu, i, f, kk):
        return float(kk[0]), float(kk[1]), (tuple(float(v) for v in kk[4]) if len(kk) > 4 and kk[4] else None)

    try:
        tam, dt, xem, dau, r_hang, tran, cot = DZ.dung_than(dong, neo_all, s, vk_cua, neo_cua, {THU: neo_e})
    finally:
        DZ.co_dau_hang = goc_dau
    if tran:
        print('  tràn ô:', tran)
    return tam, dt, dong, s * r_hang[THU]


def do_dai(kiem16):
    """Độ dài lưỡi lớn nhất (từ điểm cầm tới mũi, điểm ảnh ô 96) qua 4 cấp — như kepDat của js/zed_moi.js (điểm cầm chuẩn cam_chuan)."""
    V = json.load(open(os.path.join(GOC, 'game', 'art', 'custom', 'zed-vk.sprite.json'), encoding='utf-8'))
    s = open(os.path.join(GOC, 'game', 'js', 'cam_chuan_data.js'), encoding='utf-8').read()
    C = json.loads(s.split('G.CAM_CHUAN_DATA = ', 1)[1].rsplit(';', 1)[0])
    cam = C['vk_cam']['kiem']['moi']
    return max((V['vk']['kiem'][c][2] - cam[c][0]) * kiem16['vk_tl'] * 2 for c in range(4))


def main():
    d = json.load(open(TEP, encoding='utf-8'))
    d = bo_hang_cu(d)
    kiem16 = d['dong_tac']['kiem_1~16']
    L = do_dai(kiem16)
    # lượt 1: góc người đặc → điểm cầm ô 96 từng khung; lượt 2: góc khung sát đất cho mũi vừa chạm đất
    kh = NK.tinh()
    tam, dt, dong, sk = dung({'vk': 'vk-kiem-moi', 'khung': kh}, kiem16)
    goc_dat = {}
    for i in KHUNG_DAT:
        n = dt['kiem_nang']['nam']['neo'][i]
        k = (Y_DAT - n[1]) / L
        g0 = kh[i][2]
        if k >= 1:
            continue
        a = math.degrees(math.asin(max(-1.0, k)))   # góc chúc xuống để mũi chạm đất (phía trước); phía sau = 180 − a
        goc_dat[i] = round(a if math.cos(math.radians(g0)) > 0 else 180 - a, 1)
        print('  khung %d: điểm cầm y %.1f, lưỡi dài %.1f → góc %s° (người đặc %s°)' % (i + 1, n[1], L, goc_dat[i], g0))
    kh = NK.tinh(goc_dat)
    NK.ghi(kh)
    tam, dt, dong, sk = dung({'vk': 'vk-kiem-moi', 'khung': kh}, kiem16)
    D = dt['kiem_nang']
    to_big, meta = NET['dung_to'](tam)
    tam_a = np.array(tam.convert('RGBA'))

    # ---- ghép vào tấm game ----
    cu = doc_anh(d['tam']); cu_to = doc_anh(d['tam_to'])
    bang = np.unique(cu[cu[..., 3] > 0][:, :3].view(np.dtype((np.void, 3)))).view(np.uint8).reshape(-1, 3).astype(int)
    bang_to = np.unique(cu_to[cu_to[..., 3] > 0][:, :3].view(np.dtype((np.void, 3)))).view(np.uint8).reshape(-1, 3).astype(int)
    W = cu.shape[1]; COT = W // 96; h0 = cu.shape[0] // 96
    assert COT >= 4
    them = np.zeros((9 * 96, W, 4), np.uint8)
    r_than, r_tay, r_nam = 2, D['hang_tay'], D['nam']['hang_tay']
    O, C = d['to']['o'], d['to']['cot']
    o_cua = list(d['to']['o_cua']) + [-1] * (9 * COT)
    n_to = sum(1 for v in d['to']['o_cua'] if v >= 0)
    n0 = max(d['to']['o_cua']) + 1
    o_moi = []
    for j, (k, a, b, giay) in enumerate(HANG):
        for c in range(a, b):
            for lop, r_src in ((0, r_than), (1, r_tay), (2, r_nam)):
                o = tam_a[r_src * 96:(r_src + 1) * 96, c * 96:(c + 1) * 96]
                them[(lop * 3 + j) * 96:(lop * 3 + j + 1) * 96, (c - a) * 96:(c - a + 1) * 96] = ve_bang(o, bang)
                if lop == 1:
                    continue   # bản to không kèm ô nắm tay kiểu cũ (goi_to.py)
                t = meta['o_cua'][r_src * meta['cot_goc'] + c]
                if t < 0:
                    continue
                o_moi.append(((h0 + lop * 3 + j) * COT + (c - a), to_big[(t // meta['cot']) * O:(t // meta['cot'] + 1) * O, (t % meta['cot']) * O:(t % meta['cot'] + 1) * O]))
        da = {'hang': h0 + j, 'so': b - a, 'giay': giay, 'lap': False, 'hang_tay': h0 + 3 + j,
              'vk': D['vk'], 'vk_tl': D['vk_tl'], 'vk_cam': D['vk_cam'], 'neo': D['neo'][a:b],
              'nam': {'neo': D['nam']['neo'][a:b], 'hang_tay': h0 + 6 + j}}
        if 'vk_cam' in D['nam']:
            da['nam']['vk_cam'] = D['nam']['vk_cam']
        d['dong_tac'][k] = da
    tam_moi = np.concatenate([cu, them], 0)
    # bản to: thêm ô vào sau các ô cũ (ô 116, 16 ô một hàng)
    tong = n0 + len(o_moi)
    hang_to = (tong + C - 1) // C
    to_moi = np.zeros((hang_to * O, C * O, 4), np.uint8)
    to_moi[:cu_to.shape[0]] = cu_to[:hang_to * O]
    for q, (vt, o) in enumerate(o_moi):
        n = n0 + q
        to_moi[(n // C) * O:(n // C + 1) * O, (n % C) * O:(n % C + 1) * O] = ve_bang(o, bang_to)
        o_cua[vt] = n
    d['tam'] = 'data:image/png;base64,' + base64.b64encode(thu_net.png_bang_mau(tam_moi)).decode()
    d['tam_to'] = 'data:image/png;base64,' + base64.b64encode(thu_net.png_bang_mau(to_moi)).decode()
    d['to']['o_cua'] = o_cua
    d['kiem_nang'] = {'h_tam': h0, 'o_to': n0, 'ghi_chu': 'kiếm nặng 17/10: 9 hàng cuối tấm + ô bản to từ o_to (docs/anh-goc/zed/dung-kiem-nang.py)'}
    s = json.dumps(d, ensure_ascii=False, separators=(',', ':'))
    open(TEP, 'w', encoding='utf-8').write(s)
    print('Ghi %s: tấm %d×%d (+9 hàng), bản to %d ô (+%d), %d KB' % (os.path.relpath(TEP, GOC), tam_moi.shape[1], tam_moi.shape[0], tong, len(o_moi), len(s) // 1024))
    for k, *_ in HANG:
        print(' ', k, json.dumps(d['dong_tac'][k]['nam']['neo']))


if __name__ == '__main__':
    main()
