#!/usr/bin/env python3
"""Dựng SPRITE SHEET 2x + JSON hoạt ảnh hành động của Lam từ rig-v4 (tu_the_hd.py + anim_hd.py) → ../sprite/
  lam-hanh-dong-2x.png   các khung CẮT SÁT (không cùng ô như sheet chạy, để đỡ bộ nhớ), mỗi khung có điểm neo riêng
                         (ax, ay) = vị trí GỐC rig (chân, mặt đất) trong khung → vẽ: drawImage(..., X − ax/2, Y − ay/2) – cùng
                         tỉ lệ 2x (2 px sheet = 1 px logic, Lam cao 112 px logic), cùng cách vẽ + thu nhỏ với sheet chạy rig-v4.
  lam-hanh-dong-2x.json  khung, tư thế theo tên, bảng atkT → khung của từng đòn, vệt chém, số đo khớp hộp đòn.
Trước khi dựng: ĐỌC game/demo.html, so ATK (su/ac/re/box) + P (dash, tường…) với anim_hd.py / tu_the_hd.py – lệch thì dừng.
Chạy: python3 -B dung_hd.py   (rồi gif_hd.py để xuất GIF kiểm)"""
import os, re, json
import numpy as np
from PIL import Image
from chung_hd import RIG, GX, GY, S, SPRITE, render, thu_nho, dao, LAM_TOI, HD, MANH_THEM, DAO_TAM, world_mats
from rig import piece_matrix
import math
import tu_the_hd as T
import anim_hd as A

DEMO = os.path.normpath(os.path.join(HD, '..', '..', '..', '..', 'game', 'demo.html'))
KHE = 2
RONG_MAX = 2048


def kiem_game():
    src = open(DEMO, encoding='utf-8').read()
    for n, a in A.ATK.items():
        m = re.search(r'\b%d:\{su:(\d+),\s*ac:(\d+),\s*re:(\d+),.*?box:\[([-\d,]+)\]' % n, src)
        su, ac, re_, box = int(m[1]), int(m[2]), int(m[3]), [int(v) for v in m[4].split(',')]
        if (su, ac, re_) != (a['su'], a['ac'], a['re']) or box != T.HOP_ATK[n]:
            raise SystemExit('LỆCH gameplay: ATK[%d] trong demo.html = %s %s, anim_hd/tu_the_hd = %s %s'
                             % (n, (su, ac, re_), box, a, T.HOP_ATK[n]))
    for k, v in A.P_GAME.items():
        m = re.search(r'\b%s:([\d.]+)' % k, src)
        if float(m[1]) != v:
            raise SystemExit('LỆCH gameplay: P.%s = %s trong demo.html, anim_hd = %s' % (k, m[1], v))
    m = re.search(r'let RUT_T=(\d+);', src)
    if int(m[1]) != A.RUT_T:
        raise SystemExit('LỆCH gameplay: RUT_T = %s trong demo.html, anim_hd = %d' % (m[1], A.RUT_T))
    assert 'w:20,h:30' in src.replace(' ', ''), 'collider Lam không còn 20×30'
    print('đã kiểm: ATK su/ac/re/box + P (dash, tường, nhảy) trùng demo.html')


def tu_the(ten):
    if '~' in ten:
        a, b = ten.split('~')
        return T.tron(T.P[a], T.P[b], 0.5)
    return T.P[ten]


def ve_khung(pose):
    """render 1:1 thế giới trong hộp bắt lưới sheet (gốc rơi đúng ranh giới điểm ảnh) rồi thu nhỏ LANCZOS → RGBA cắt sát"""
    big = (GX - 1600, GY - 1800, GX + 2000, GY + 900)
    lo = np.array(render(RIG, pose, big, 0.1, toi=LAM_TOI))[..., 3]
    ys, xs = np.nonzero(lo > 0)
    x0w, x1w = big[0] + xs.min() / 0.1 - 20, big[0] + (xs.max() + 1) / 0.1 + 20
    y0w, y1w = big[1] + ys.min() / 0.1 - 20, big[1] + (ys.max() + 1) / 0.1 + 20
    A_ = int(np.ceil((GX - x0w) * S)); B = int(np.ceil((x1w - GX) * S))
    C = int(np.ceil((GY - y0w) * S)); D = max(int(np.ceil((y1w - GY) * S)), 1)
    box = (GX - A_ / S, GY - C / S, GX + B / S, GY + D / S)
    im = thu_nho(render(RIG, pose, box, 1.0, toi=LAM_TOI), (A_ + B, C + D))
    a = np.array(im)
    a[a[..., 3] == 0] = 0
    ys, xs = np.nonzero(a[..., 3] > 0)
    a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    return a, A_ - xs.min(), C - ys.min()


def khung_dao():
    """dao rời (chắn + lưỡi, lưỡi chĩa PHẢI) ở đúng tỉ lệ sheet 2x; neo = tâm dao (DAO_TAM) → game xoay quanh neo"""
    im = Image.open(os.path.join(MANH_THEM, 'dao.png')).convert('RGBA')
    bx = im.getbbox()
    c = im.crop(bx)
    w, h = max(1, round(c.width * S)), max(1, round(c.height * S))
    t = c.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
    a = np.array(t); a[a[..., 3] == 0] = 0
    return a, int(round((DAO_TAM[0] - bx[0]) * S)), int(round((DAO_TAM[1] - bx[1]) * S))


def dao_chet(ten):
    """tâm dao (px logic so với chân) + góc lưỡi (độ) trong tư thế trúng đòn của clip chết → chỗ dao bắt đầu văng"""
    from chung_hd import diem_the_gioi, logic
    pose = tu_the(ten)
    x, y = logic(diem_the_gioi(RIG, pose, 'tay-truoc-dao', DAO_TAM))
    m = piece_matrix(RIG['nut']['tay-truoc-dao'], world_mats(RIG, pose)['tay-truoc-dao'])
    return [round(x, 1), round(y, 1)], round(math.degrees(math.atan2(m[1, 0], m[0, 0])), 1)


def main():
    kiem_game()
    os.makedirs(SPRITE, exist_ok=True)
    can = []
    for ten, (n, ds) in A.DON.items():
        tong = sum(b for _, b in ds)
        a = A.ATK[n]
        if tong != a['su'] + a['ac'] + a['re'] - 1:
            raise SystemExit('%s: tổng %d bước ≠ su+ac+re−1 = %d' % (ten, tong, a['su'] + a['ac'] + a['re'] - 1))
        for p, _ in ds:
            if p not in can:
                can.append(p)
    for ds in A.KHAC.values():
        for p in ds:
            if p not in can:
                can.append(p)
    print('số tư thế (khung sheet):', len(can))
    tiles = {}
    for i, p in enumerate(can):
        tiles[p] = ve_khung(tu_the(p))
    tiles['dao-roi'] = khung_dao()
    can.append('dao-roi')
    # xếp kệ (shelf) theo chiều cao giảm dần
    order = sorted(can, key=lambda p: -tiles[p][0].shape[0])
    x, y, hang_h, W = KHE, KHE, 0, 0
    pos = {}
    for p in order:
        t = tiles[p][0]
        if x + t.shape[1] + KHE > RONG_MAX:
            x, y = KHE, y + hang_h + KHE
            hang_h = 0
        pos[p] = (x, y)
        x += t.shape[1] + KHE
        hang_h = max(hang_h, t.shape[0])
        W = max(W, x)
    H = y + hang_h + KHE
    sheet = np.zeros((H, W, 4), np.uint8)
    frames, idx = [], {}
    for p in can:
        t, ax, ay = tiles[p]
        px, py = pos[p]
        sheet[py:py + t.shape[0], px:px + t.shape[1]] = t
        idx[p] = len(frames)
        frames.append({'ten': p, 'x': px, 'y': py, 'w': int(t.shape[1]), 'h': int(t.shape[0]), 'ax': int(ax), 'ay': int(ay)})
    Image.fromarray(sheet, 'RGBA').save(os.path.join(SPRITE, 'lam-hanh-dong-2x.png'), optimize=True)
    # bảng atkT → khung + đo khớp hộp đòn
    don, khop = {}, {}
    for ten, (n, ds) in A.DON.items():
        bang = []
        for p, b in ds:
            bang += [idx[p]] * b
        a = A.ATK[n]
        don[ten] = {'atk': n, 'su': a['su'], 'ac': a['ac'], 're': a['re'], 'hop_don': T.HOP_ATK[n],
                    'khung_theo_atkT': bang, 'tu_the_theo_atkT': [frames[i]['ten'] for i in bang],
                    'vet_chem': A.VET[ten]}
        bx, by, bw, bh = T.HOP_ATK[n]
        do = []
        for t in range(max(a['su'], 1), a['su'] + a['ac']):
            p = frames[bang[t - 1]]['ten']
            (mx, my), (cx, cy) = dao(tu_the(p))
            dx = max(bx - mx, 0, mx - (bx + bw)); dy = max(by - my, 0, my - (by + bh))
            do.append({'atkT': t, 'tu_the': p, 'mui_dao': [round(mx, 1), round(my, 1)], 'trong_hop': bool(dx == 0 and dy == 0),
                       'cach_hop_px': round(float(np.hypot(dx, dy)), 1)})
        khop[ten] = {'khung_trung_tu_atkT': max(a['su'], 1), 'hop_bat_atkT': [max(a['su'], 1), a['su'] + a['ac'] - 1],
                     'tu_the_khung_dau_hop_bat': frames[bang[max(a['su'], 1) - 1]]['ten'],
                     'mui_dao_moi_buoc_hop_bat': do,
                     'so_buoc_mui_dao_trong_hop': sum(d['trong_hop'] for d in do), 'so_buoc_hop_bat': len(do)}
        print('%s: khung trúng "%s" từ atkT %d; mũi dao trong hộp %d/%d bước (xa nhất %.1f px)'
              % (ten, khop[ten]['tu_the_khung_dau_hop_bat'], khop[ten]['khung_trung_tu_atkT'],
                 khop[ten]['so_buoc_mui_dao_trong_hop'], len(do), max(d['cach_hop_px'] for d in do)))
    meta = {
        'ten': 'Lam – hoạt ảnh hành động (chém, bị đánh, nhảy/rơi/tiếp đất, lướt, bám/trượt tường) từ rig-v4, sprite sheet 2x',
        'phien_ban': 'hd2', 'anh': 'lam-hanh-dong-2x.png', 'co_sheet': [W, H], 'so_khung': len(frames),
        'nguon': 'art/modular/lam-moi/hanh-dong/code/tu_the_hd.py (mốc tư thế) + anim_hd.py (bảng tick) trên rig-v4 (lam-moi-v4.json, manh/)',
        'ty_le': {'px_nguon_moi_px_logic': 2, 'cung_ty_le_voi': 'rig-v4/sprite/lam-chay-2x.png (Lam cao 112 px logic)'},
        'neo': 'mỗi khung: (ax, ay) = gốc rig (giữa hai chân, mặt đất) trong khung, px sheet. Game: chân = (pl.x+10, pl.y+30); '
               'vẽ drawImage(sheet, x,y,w,h, −ax/2, −ay/2, w/2, h/2) sau translate(chân); quay trái: scale(−1,1) tại chân.',
        'lam_toi': LAM_TOI, 'frames': frames, 'tu_the': idx, 'don': don, 'khac': {k: [idx[p] for p in v] for k, v in A.KHAC.items()},
        'khop_hop_don': khop, 'hieu_ung': A.HIEU_UNG,
        'tho': {'buoc_moi_khung': A.THO_BUOC, 'so_khung': len(A.KHAC['tho']),
                'cach': 'khung = khac.tho[floor(số bước đang đứng yên / buoc_moi_khung) mod so_khung]; khung 0 = dáng nghỉ'},
        'chet': dict(A.CHET, khung_dao=idx['dao-roi'],
                     dao_bat_dau={k: dict(zip(('tam', 'goc'), dao_chet(k + '-trung'))) for k in ('chet', 'chett')},
                     cach='pl.dead: danh sách khac.chet (ngã ngửa, pl.hurtK < 0) hoặc khac.chett (chúi tới). Chưa chạm đất: '
                          'deadT 0 → [0]; vy < vy_bay_len → [1]; còn lại [2]. Đã chạm đất (t = deadT − bước chạm): t < cham → [3]; '
                          '< nay → [4]; < lang → [5]; còn lại [6]. Dao: khung khung_dao, bắt đầu ở dao_bat_dau[..].tam/goc '
                          '(px logic so với chân, nhìn phải) khi deadT = 1, vận tốc dao.vx (theo hướng ngã) / dao.vy, quay dao.xoay °/bước; '
                          'Lam + dao mờ dần từ deadT mo_tu → mo_het.'),
        'rut_dao': {'so_buoc': A.RUT_T, 'cach': 'khung = khac.rutdao[RUT_T − drawT] (0 … 51); mục cuối = dáng nghỉ'},
        'chop_mu': 'ĐÃ BỎ (27/10/2026) – rig-v4 chop-mu hien = False',
        'gameplay_doc_tu_demo_html': {'ATK': A.ATK, 'P': A.P_GAME, 'tuong_x_px_logic': T.TUONG_X},
        'dinh_dang': 'PNG RGBA, alpha thẳng; điểm trong suốt RGB = 0; tay sau + ủng xa đã tối 10 % như sheet chạy',
    }
    json.dump(meta, open(os.path.join(SPRITE, 'lam-hanh-dong-2x.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('sheet %d×%d, %d khung → %s' % (W, H, len(frames), SPRITE))


if __name__ == '__main__':
    main()
