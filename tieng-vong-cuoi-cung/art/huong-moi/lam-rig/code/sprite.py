"""Bước 5: xuất sheet 2x + JSON (cùng quy ước rig-v4), GIF lớn + GIF 112 px, số đo.

Đầu ra ../sprite/:  lam-ct-dung-2x.png/.json, lam-ct-chay-2x.png/.json, lam-ct-chem1-2x.png/.json
           ../gif/:     <clip>-lon.gif (Lam cao 448 px, vẽ thẳng từ rig – không phóng), <clip>-112px.gif (đúng cỡ game, 1:1)
           ../so-lieu.json, ../lam-chuong-tan.json (rig nguồn: mảnh, neo, cây, thứ tự vẽ)
Quy ước sheet (như rig-v4): mọi khung cùng ô + cùng điểm neo; neo x = gốc rig (giữa hai ủng), neo y = mặt đất
(hàng neo_y − 1 là hàng thấp nhất của đế khi chạm đất); 224 px nguồn = 112 px logic → game vẽ ½ cỡ.
"""
import os
import re
import sys
import math
import numpy as np
from PIL import Image, ImageDraw
from chung import RIG, SPRITE, GIF, MANH, GAME, RIG_JSON, luu_json, doc_json, font
from rig import (Rig, THU_TU, CAY, GOC, K2, K_LOGIC, CAO_NGHI_NGUON, LAM_TOI, M_o, the_gioi, diem, tron_tu_the, DIEM)
import clip as C

PAD = 3
COT = 8
KHE = 2


def doc_atk1():
    """đọc ATK[1] + P.lunge/runSpeed/decelFrames từ game/demo.html → bảo đảm clip khớp đúng game."""
    src = open(os.path.join(GAME, 'demo.html'), encoding='utf-8').read()
    m = re.search(r"\n\s*1:\{su:(\d+), ac:(\d+), re:(\d+),.*?box:\[([-\d, ]+)\]", src)
    su, ac, re_, box = int(m.group(1)), int(m.group(2)), int(m.group(3)), [int(x) for x in m.group(4).split(',')]
    lunge = float(re.search(r"lunge:([\d.]+)", src).group(1))
    rs = float(re.search(r"runSpeed:([\d.]+)", src).group(1))
    dec = int(re.search(r"decelFrames:(\d+)", src).group(1))
    return {'su': su, 'ac': ac, 're': re_, 'box': box, 'lunge': lunge, 'run_speed': rs, 'decel_frames': dec}


def o_va_neo(rig, poses):
    xs0, ys0, xs1, ys1 = [], [], [], []
    for p in poses:
        a, b, c, d = rig.hop(p, M_o((0, 0)))
        xs0.append(a); ys0.append(b); xs1.append(c); ys1.append(d)
    x0, y0 = math.floor(min(xs0)) - PAD, math.floor(min(ys0)) - PAD
    x1, y1 = math.ceil(max(xs1)) + PAD, math.ceil(max(ys1)) + PAD
    y1 = max(y1, PAD)
    return (x1 - x0, y1 - y0), (-x0, -y0)


def xuat_sheet(rig, ten, poses, extra_frame, meta_clip):
    co, neo = o_va_neo(rig, poses)
    n = len(poses)
    hang = (n + COT - 1) // COT
    W = COT * co[0] + (COT - 1) * KHE
    H = hang * co[1] + (hang - 1) * KHE
    sheet = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    frames = []
    imgs = []
    for i, p in enumerate(poses):
        im = rig.ve(p, co, neo)
        x, y = (i % COT) * (co[0] + KHE), (i // COT) * (co[1] + KHE)
        sheet.paste(im, (x, y))
        imgs.append(im)
        f = {'i': i, 'x': x, 'y': y, 'w': co[0], 'h': co[1]}
        f.update(extra_frame(i, p, neo))
        frames.append(f)
    path = os.path.join(SPRITE, f'lam-ct-{ten}-2x.png')
    sheet.save(path, optimize=True)
    # vệt sáng mép mũ/vai VẼ SẴN (cùng lưới ô) – trang thử vẽ chồng lên sprite, tắt bằng ?rim=0
    rim = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for i, p in enumerate(poses):
        x, y = (i % COT) * (co[0] + KHE), (i // COT) * (co[1] + KHE)
        rim.paste(vet_sang(rig, p, co, neo, imgs[i]), (x, y))
    rim.save(os.path.join(SPRITE, f'lam-ct-{ten}-rim-2x.png'), optimize=True)
    js = {
        'ten': f'Lam "Cổ tích chuông tàn" – {meta_clip.pop("ten_viet")}, sprite sheet 2x',
        'phien_ban_clip': 'chuong-tan-1',
        'anh': os.path.basename(path),
        'dinh_dang': 'PNG RGBA, alpha thẳng (không nhân trước); điểm trong suốt RGB = 0',
        'co_sheet': [W, H], 'luoi': {'cot': COT, 'hang': hang, 'khe_px': KHE}, 'co_khung': list(co),
        'diem_neo': {'x': neo[0], 'y': neo[1], 'y_nghia': 'toạ độ trong MỖI khung (từ góc trái-trên ô): x = gốc rig '
                     '(giữa hai ủng = giữa collider), y = mặt đất (hàng y−1 là hàng thấp nhất của đế khi chạm đất). '
                     'Mọi khung cùng một điểm neo; không crop riêng khung.'},
        'ty_le': {'px_nguon_moi_px_logic': 2, 've_trong_game': 'vẽ ở ½ cỡ nguồn', 'cao_dang_nghi_px_nguon': 224,
                  'cao_dang_nghi_px_logic': 112.0, 'he_so_px_anh_chot_sang_px_nguon': round(K2, 6),
                  'ghi_chu': 'một tỉ lệ cố định cho mọi tư thế; dáng nghỉ (đỉnh mũ → đế) cao 224 px nguồn'},
        'huong': 'Lam quay mặt sang PHẢI. Quay trái: lật ngang quanh điểm neo x (ctx.scale(-1,1) tại chân).',
        'lam_toi': {**LAM_TOI, 'ghi_chu': 'găng xa + ủng xa đã tối 10 % sẵn trong sheet'},
        'anh_vet_sang': f'lam-ct-{ten}-rim-2x.png',
        'vet_sang_ghi_chu': 'cùng lưới ô/neo; chỉ mép mũ, chóp, áo choàng vai phía có đèn (trên, chếch trước); vẽ chồng lên khung',
        **meta_clip,
        'frames': frames,
    }
    luu_json(os.path.join(SPRITE, f'lam-ct-{ten}-2x.json'), js)
    return js, imgs, co, neo


RIM_HUONG = np.array([0.42, -1.0]) / np.hypot(0.42, 1.0)   # ánh sáng từ trên, hơi chếch phía trước mặt
RIM_DAY = 3.5                                                 # px sheet (≈ 1,75 px logic)
RIM_MAU = (242, 214, 154)                                     # màu lõi đèn của bảng màu tư vấn (#F2D69A)
RIM_MANH = ['mu', 'chop', 'ao-vai']                           # chỉ mép mũ + chóp + vai (không viền cả người)


def vet_sang(rig, pose, co, neo, im_full):
    from scipy import ndimage as nd
    a = np.asarray(im_full).astype(np.float32)[..., 3] / 255
    sub = np.asarray(rig.ve(pose, co, neo, thu_tu=RIM_MANH)).astype(np.float32)[..., 3] / 255
    dx, dy = RIM_HUONG * RIM_DAY
    a_sh = nd.shift(a, (-dy, -dx), order=1, mode='constant', cval=0.0)   # alpha tại điểm lệch về phía đèn
    r = np.clip(a - a_sh, 0, 1) * sub * a
    r = nd.gaussian_filter(r, 0.6)
    out = np.zeros(a.shape + (4,), np.uint8)
    out[..., 0], out[..., 1], out[..., 2] = RIM_MAU
    out[..., 3] = (np.clip(r * 1.3, 0, 1) * 225).astype(np.uint8)
    out[out[..., 3] == 0] = 0
    return Image.fromarray(out, 'RGBA')


def gif(rig_lon, poses_t, ms, path, nen=(28, 34, 40)):
    """poses_t: danh sách tư thế (đã lấy mẫu đúng thời gian GIF). Vẽ thẳng từ rig ở cỡ lớn."""
    co, neo = o_va_neo(rig_lon, poses_t)
    out = []
    for p in poses_t:
        im = rig_lon.ve(p, co, neo)
        bg = Image.new('RGBA', co, nen + (255,))
        d = ImageDraw.Draw(bg)
        d.line([(0, neo[1]), (co[0], neo[1])], fill=(70, 80, 90), width=2)
        bg.alpha_composite(im)
        out.append(bg.convert('RGB'))
    out[0].save(path, save_all=True, append_images=out[1:], duration=ms, loop=0, optimize=False, disposal=1)


def gif112(imgs2x, ms, path, nen=(28, 34, 40), xs=None):
    out = []
    for im in imgs2x:
        w, h = im.size
        a = np.asarray(im).astype(np.float32) / 255
        a = a[:h // 2 * 2, :w // 2 * 2].reshape(h // 2, 2, w // 2, 2, 4)
        a[..., :3] *= a[..., 3:4]
        a = a.mean((1, 3))
        bg = np.ones(a.shape[:2] + (3,), np.float32) * np.array(nen) / 255
        rgb = a[..., :3] + bg * (1 - a[..., 3:4])
        out.append(Image.fromarray((rgb * 255).round().clip(0, 255).astype(np.uint8)))
    pal = out[0].quantize(colors=255, method=Image.MEDIANCUT)
    fr = [o.quantize(palette=pal, dither=Image.NONE) for o in out]
    fr[0].save(path, save_all=True, append_images=fr[1:], duration=ms, loop=0, disposal=1)


def lay_mau(poses, tick_moi_khung, ms, tong_ms, vong=True):
    """lấy tư thế ở các thời điểm k·ms (nội suy giữa 2 khung)."""
    n = len(poses)
    out = []
    t = 0.0
    while t < tong_ms - 1e-6:
        f = t / (1000 / 60) / tick_moi_khung
        i = int(math.floor(f))
        u = f - i
        a = poses[i % n] if vong else poses[min(i, n - 1)]
        b = poses[(i + 1) % n] if vong else poses[min(i + 1, n - 1)]
        out.append(tron_tu_the(a, b, u))
        t += ms
    return out


def main(nhanh=False):
    for d in (SPRITE, GIF):
        os.makedirs(d, exist_ok=True)
    atk = doc_atk1()
    for k in ('su', 'ac', 're', 'box', 'lunge', 'run_speed', 'decel_frames'):
        assert atk[k] == C.ATK1[k], f'ATK[1].{k} trong demo.html ({atk[k]}) khác clip.py ({C.ATK1[k]}) – sửa clip.py'
    rig = Rig()
    rig_lon = Rig(zoom=2.0)
    so = {'gameplay_doc_tu_demo_html': atk}

    # ================= ĐỨNG =================
    pd, md = C.clip_dung()
    def ex_d(i, p, neo):
        return {'ms': round(1000 / 60 * md['tick_moi_khung'], 3), 'tick': i * md['tick_moi_khung']}
    js_d, im_d, co_d, neo_d = xuat_sheet(rig, 'dung', pd, ex_d, {
        'ten_viet': 'ĐỨNG = lắng nghe (lặp 6 s)', 'lap': True,
        'cach_phat': 'theo THỜI GIAN: khung = floor(số_tick_đứng / tick_moi_khung) % so_khung; khung 0 = dáng nghỉ đúng ảnh chốt',
        'tick_moi_khung': md['tick_moi_khung'], 'so_khung': len(pd), 'so_tick_vong': md['so_tick'],
        'tho': md['tho'], 'nghieng_dau': md['nghieng_dau']})
    # ================= CHẠY =================
    pc, mc = C.clip_chay()
    def ex_c(i, p, neo):
        return {'ms': round(1000 / 60, 3), 'pha': round(i / len(pc), 5), 'chiu_luc': mc['chiu_luc'][i]}
    js_c, im_c, co_c, neo_c = xuat_sheet(rig, 'chay', pc, ex_c, {
        'ten_viet': 'CHẠY (264 px logic/s, 132 px/chu kỳ)', 'lap': True,
        'cach_phat': 'theo QUÃNG ĐƯỜNG (như rig-v4): pha += |dx_thực| / quang ; khung = floor(pha × so_khung); pha không reset',
        'toc_do_chuan': {'quang_duong_moi_chu_ky_px_logic': C.QUANG_LOGIC, 'toc_do_px_logic_s': C.RUN_SPEED_LOGIC,
                         'so_tick_moi_chu_ky': C.CHAY_TICK},
        'so_khung': len(pc), 'ty_le_cham_dat_moi_chan': C.DUTY})
    # ================= CHÉM 1 =================
    pk, mk = C.clip_chem()
    tip_log = []
    def ex_k(i, p, neo):
        tx, ty = diem(p, M_o(neo), 'mui_dao')
        tl = [round((tx - neo[0]) / 2, 2), round((ty - neo[1]) / 2, 2)]
        tip_log.append(tl)
        return {'ms': round(1000 / 60, 3), 'atkT': i + 1, 'mui_dao_px_logic': tl,
                'hop_don_bat': atk['su'] <= i + 1 < atk['su'] + atk['ac']}
    js_k, im_k, co_k, neo_k = xuat_sheet(rig, 'chem1', pk, ex_k, {
        'ten_viet': 'CHÉM đòn 1 (ngang) – ATK[1]', 'lap': False, 'atk': 1,
        'su': atk['su'], 'ac': atk['ac'], 're': atk['re'], 'hop_don': atk['box'],
        'cach_phat': 'khung = khung_theo_atkT[atkT − 1] (atkT 1…26, như game: atkT tăng 1/tick, hộp đòn bật atkT su…su+ac−1)',
        'khung_theo_atkT': list(range(len(pk))),
        'lunge_collider_px_logic_theo_atkT': mk['lunge_px_logic'],
        'ghi_chu_lunge': 'game tự đẩy collider tới (P.lunge 2,2 giảm 0,44/tick → 4,4 px); ủng trong sheet đã bù quãng này '
                         '→ khi vẽ tại collider, chân chịu lực đứng yên trên đất'})

    # ================= SỐ ĐO =================
    so['dung'] = do_dung(pd, neo_d)
    so['chay'] = do_chay(pc, mc, neo_c)
    so['chem1'] = do_chem(pk, mk, neo_k, tip_log, atk)
    so['sheet'] = {k: {'co_sheet': j['co_sheet'], 'co_khung': j['co_khung'], 'neo': [j['diem_neo']['x'], j['diem_neo']['y']],
                       'so_khung': len(j['frames']), 'ram_giai_nen_MB': round(j['co_sheet'][0] * j['co_sheet'][1] * 4 / 1e6, 2)}
                   for k, j in (('dung', js_d), ('chay', js_c), ('chem1', js_k))}
    so['cao_dang_nghi_px_sheet'] = do_cao(im_d[0])
    luu_json(os.path.join(RIG, 'so-lieu.json'), so)

    # ================= RIG NGUỒN =================
    meta = doc_json(os.path.join(MANH, 'manh.json'))
    luu_json(RIG_JSON, {
        'ten': 'Lam – rig "Cổ tích chuông tàn" (13 mảnh)', 'he_toa_do': meta['_he_toa_do'],
        'goc_rig': {'x': GOC[0], 'y': GOC[1], 'y_nghia': 'x giữa hai ủng, y mặt đất'},
        'cao_dang_nghi_px_anh_chot': CAO_NGHI_NGUON, 'he_so_sang_sheet_2x': K2, 'he_so_sang_px_logic': K_LOGIC,
        'thu_tu_ve': THU_TU,
        'manh': {t: {'anh': f'manh/{t}.png', 'ten_viet': meta[t]['ten_viet'], 'goc_tren_trai': meta[t]['goc_tren_trai'],
                     'co': meta[t]['co'], 'cha': CAY[t][0] or ('gốc (đất)' if t.startswith('ung') else 'gốc + dịch thân'),
                     'neo': list(CAY[t][1]), 'lam_toi': LAM_TOI.get(t, 0)} for t in THU_TU},
        'tu_the': 'tư thế = {mảnh: [tx, ty, xoay°, sx, sy]} cục bộ quanh neo (xoay dương = chiều kim đồng hồ trên màn); '
                  'ma trận = cha · T(neo+t) · R · S · T(−neo)',
        'diem_do': {k: {'manh': v[0], 'xy': list(v[1])} for k, v in DIEM.items()},
        'clip': {'dung': 'sprite/lam-ct-dung-2x.json', 'chay': 'sprite/lam-ct-chay-2x.json', 'chem1': 'sprite/lam-ct-chem1-2x.json'}})

    # ================= GIF =================
    if not nhanh:
        # đứng: 60 hình × 100 ms = 6 s đúng nhịp
        gif(rig_lon, lay_mau(pd, md['tick_moi_khung'], 100, 6000), 100, os.path.join(GIF, 'dung-lon.gif'))
        gif112([im_d[int(i * 6 / 5) % len(im_d)] for i in range(60)], 100, os.path.join(GIF, 'dung-112px.gif'))
        # chạy: 25 hình × 20 ms = 0,50 s (GIF không chạy được 16,7 ms) – lặp 3 lần cho dễ xem
        pcs = lay_mau(pc, 1, 20, 500)
        gif(rig_lon, pcs, 20, os.path.join(GIF, 'chay-lon.gif'))
        gif(rig_lon, lay_mau(pc, 1, 1000 / 60 * 1, 500), 80, os.path.join(GIF, 'chay-lon-cham-x5.gif'))
        im_c112 = [rig.ve(p, co_c, neo_c) for p in pcs]
        gif112(im_c112, 20, os.path.join(GIF, 'chay-112px.gif'))
        # chém: đứng 0,4 s → chém (26 tick) → đứng 0,4 s; 20 ms/hình
        nghi = pd[0]
        seq = [nghi] * 24 + pk + [nghi] * 24
        ks = lay_mau(seq, 1, 20, len(seq) * 1000 / 60, vong=False)
        gif(rig_lon, ks, 20, os.path.join(GIF, 'chem1-lon.gif'))
        gif(rig_lon, pk, 100, os.path.join(GIF, 'chem1-lon-cham-x6.gif'))
        gif112([rig.ve(p, co_k, neo_k) for p in ks], 20, os.path.join(GIF, 'chem1-112px.gif'))
    print(so['chem1'])
    print(so['chay'])
    print(so['dung'])


def do_cao(im):
    a = np.asarray(im)[..., 3]
    ys = np.nonzero(a.max(1) > 127)[0]
    return int(ys.max() - ys.min() + 1)


def _y(p, neo, ten):
    return diem(p, M_o(neo), ten)


def do_dung(poses, neo):
    top = [_y(p, neo, 'dinh_mu')[1] for p in poses]
    eye = [_y(p, neo, 'mat') for p in poses]
    tip = [_y(p, neo, 'mui_chop') for p in poses]
    vong = [np.hypot(*(np.subtract(_y(poses[0], neo, k), _y(poses[-1], neo, k)))) / 2 for k in ('dinh_mu', 'mui_chop', 'mat')]
    k_tho = [i for i in range(len(poses)) if i * C.DUNG_BUOC_MOI_KHUNG < 200]          # trước lúc nghiêng đầu
    tho_top = [top[i] for i in k_tho]
    return {'than_tho_dinh_mu_len_xuong_px_logic': round((max(tho_top) - min(tho_top)) / 2, 3),
            'dinh_mu_len_xuong_ca_luc_nghieng_dau_px_logic': round((max(top) - min(top)) / 2, 3),
            'mat_dich_xa_nhat_px_logic': round(max(np.hypot(e[0] - eye[0][0], e[1] - eye[0][1]) for e in eye) / 2, 2),
            'mui_chop_dich_xa_nhat_px_logic': round(max(np.hypot(t[0] - tip[0][0], t[1] - tip[0][1]) for t in tip) / 2, 2),
            'noi_vong_khung_cuoi_ve_0_px_logic': round(max(vong), 3),
            'chu_ky_tho_s': 3.0, 'vong_lap_s': 6.0}


def do_chay(poses, mc, neo):
    n = len(poses)
    v_khung = C.QUANG / n * K2                    # px sheet mỗi khung (đất trôi lùi)
    truot = {'ung-gan': [], 'ung-xa': []}
    for k in ('ung-gan', 'ung-xa'):
        dk = 'de_ung_gan' if k == 'ung-gan' else 'de_ung_xa'
        for i in range(n):
            j = (i + 1) % n
            if mc['chiu_luc'][i][k] and mc['chiu_luc'][j][k]:
                a, b = _y(poses[i], neo, dk), _y(poses[j], neo, dk)
                truot[k].append(abs((b[0] - a[0]) + v_khung) / 2)     # px logic / bước (vết trên đất)
    top = [_y(p, neo, 'dinh_mu')[1] for p in poses]
    eye = [_y(p, neo, 'mat')[1] for p in poses]
    return {'quang_px_logic_chu_ky': C.QUANG_LOGIC, 'so_khung': n, 'khung_moi_buoc_logic_o_toc_do_toi_da': 1.0,
            'truot_chan_chiu_luc_px_logic_moi_buoc_max': round(max(max(v) for v in truot.values()), 4),
            'so_buoc_chiu_luc_moi_chan': {k: len(v) for k, v in truot.items()},
            'dinh_mu_nay_px_logic': round((max(top) - min(top)) / 2, 2),
            'mat_nay_px_logic': round((max(eye) - min(eye)) / 2, 2),
            'than_nhac_khoi_dang_nghi_px_logic': [round(-max(p['than'][1] for p in poses) * K_LOGIC, 2),
                                                  round(-min(p['than'][1] for p in poses) * K_LOGIC, 2)],
            'nen_gian_than': 'nén 2,6 % lúc chịu lực, giãn 1,8 % lúc đạp (mũ, chuông, tay giữ cỡ)'}


def do_chem(poses, mk, neo, tips, atk):
    su, ac = atk['su'], atk['ac']
    bx, by, bw, bh = atk['box']
    trong = []
    for i, (x, y) in enumerate(tips):
        a = i + 1
        if su <= a < su + ac:
            trong.append(bx <= x <= bx + bw and by <= y <= by + bh)
    xa = max(t[0] for t in tips[su - 1:su + ac - 1])
    # chân chịu lực: đế ủng xa (atkT 1–12) và ủng gần (12–19) đứng yên trên đất (tính cả collider trôi do lunge)
    D = np.array(mk['lunge_px_logic'])
    def troi(k, a0, a1):
        dk = 'de_ung_gan' if k == 'ung-gan' else 'de_ung_xa'
        xs = [(_y(poses[a - 1], neo, dk)[0] - neo[0]) / 2 + D[a - 1] for a in range(a0, a1 + 1)]
        return round(max(xs) - min(xs), 3)
    return {'so_khung': len(poses), 'atkT': [1, len(poses)],
            'mui_dao_trong_hop_don_khi_bat': f'{sum(trong)}/{len(trong)}',
            'mui_dao_xa_nhat_khi_bat_px_logic': round(xa, 1), 'mep_truoc_hop_don_px_logic': bx + bw,
            'thieu_tam_px_logic': round(bx + bw - xa, 1),
            'mui_dao_theo_atkT_px_logic': tips,
            'ung_xa_troi_tren_dat_atkT_1_12_px_logic': troi('ung-xa', 1, 12),
            'ung_gan_troi_tren_dat_atkT_12_19_px_logic': troi('ung-gan', 12, 19),
            'ung_gan_troi_tren_dat_atkT_1_7_px_logic': troi('ung-gan', 1, 7)}


if __name__ == '__main__':
    main(nhanh='--nhanh' in sys.argv)
