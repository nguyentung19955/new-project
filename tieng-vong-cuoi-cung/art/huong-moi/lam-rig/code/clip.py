"""Ba clip duyệt chuyển động: ĐỨNG (lắng nghe), CHẠY, CHÉM đòn 1 (ATK[1] của game/demo.html).

Cách làm (theo mục 4 file tư vấn):
  • ĐỘNG TÁC CHÍNH (thân, chân, tay, dao) = mốc khoá theo THỜI GIAN (tick 60 Hz), nội suy Hermite đơn điệu (PCHIP) –
    không vượt mốc, giữ được nhịp nén ngắn → vung nhanh → hồi chậm.
  • ĐỘNG TÁC PHỤ (mũ, chóp, chuông, áo choàng vai, 2 vạt, dao trong tay) = LÒ XO tắt dần mô phỏng từng tick
    (4 bước con / tick), bị đẩy bởi gia tốc của thân / mảnh cha → tự trễ nhịp đúng chuỗi: thân → mũ → chóp/chuông.
    Mỗi lò xo có tần số + độ tắt riêng → không mảnh nào chạy cùng một đường sin.
  • Clip lặp (đứng, chạy): mô phỏng nhiều vòng rồi lấy vòng cuối → nối vòng liền.
Đơn vị: px NGUỒN (ảnh chốt; 1 px logic = 9,885 px nguồn), độ, tick = 1/60 s.
"""
import math
import numpy as np
from scipy.interpolate import PchipInterpolator
from rig import tu_the_nghi, K_LOGIC

FPS = 60
SUB = 4
RUN_SPEED_LOGIC = 4.4 * 60                     # 264 px logic/s (P.runSpeed của game)
QUANG_LOGIC = 132.0                            # px logic / chu kỳ chạy (như rig-v4)
QUANG = QUANG_LOGIC / K_LOGIC                  # px nguồn / chu kỳ
CHAY_TICK = 30                                 # 132 / 4,4 = 30 tick / chu kỳ ở tốc độ tối đa
# ATK[1] trong game/demo.html (đọc lại & kiểm khi dựng: sprite.py)
ATK1 = {'su': 11, 'ac': 8, 're': 8, 'box': [4, -97, 91, 48], 'lunge': 2.2, 'decel_frames': 5, 'run_speed': 4.4}


def tron(x):
    x = np.clip(x, 0, 1)
    return x * x * (3 - 2 * x)


def track(keys, t, period=None):
    ks = sorted(keys)
    tt = np.array([k[0] for k in ks], float)
    vv = np.array([k[1] for k in ks], float)
    if period:
        tt = np.concatenate([tt - period, tt, tt + period])
        vv = np.concatenate([vv, vv, vv])
        _, idx = np.unique(tt, return_index=True)
        tt, vv = tt[idx], vv[idx]
    f = PchipInterpolator(tt, vv)
    t = np.asarray(t, float)
    if period:
        t = np.mod(t, period)
    return f(t)


def dao_ham2(x, dt=1.0 / FPS, period=False):
    if period:
        return (np.roll(x, -1) - 2 * x + np.roll(x, 1)) / dt ** 2
    d = np.zeros_like(x)
    d[1:-1] = (x[2:] - 2 * x[1:-1] + x[:-2]) / dt ** 2
    d[0], d[-1] = d[1], d[-2]
    return d


def lo_xo(target, drive, omega, zeta, x0=None):
    """x'' = ω²(target − x) − 2ζω x' + drive ; target/drive theo tick; trả x theo tick."""
    n = len(target)
    x = target[0] if x0 is None else x0
    v = 0.0
    out = np.zeros(n)
    h = 1.0 / FPS / SUB
    for i in range(n):
        for _ in range(SUB):
            a = omega * omega * (target[i] - x) - 2 * zeta * omega * v + drive[i]
            v += a * h
            x += v * h
        out[i] = x
    return out


def _ghep(n):
    return [tu_the_nghi() for _ in range(n)]


def _dat(poses, ten, i, tx=None, ty=None, rot=None, sx=None, sy=None):
    p = poses[i][ten]
    for j, v in enumerate((tx, ty, rot, sx, sy)):
        if v is not None:
            p[j] = float(v)


# ======================================================================================================
# ĐỨNG = LẮNG NGHE: thở 3 s (thân lên xuống < 1 px logic), giây 3,5–5,7 nghiêng đầu nghe chuông; lặp 6 s.
# ======================================================================================================
DUNG_TICK = 360
DUNG_BUOC_MOI_KHUNG = 5                         # 72 khung × 5 tick


def clip_dung():
    N = DUNG_TICK
    vong = 3
    t = np.arange(N * vong)
    # hơi thở: hít chậm 0,42 chu kỳ, ngừng ngắn, thở ra dài hơn, nghỉ cuối (không phải sin)
    b = track([(0, 0), (16, 0.04), (76, 1.0), (94, 0.97), (160, 0.04), (180, 0.0)], t, period=180)
    than_ty = -5.2 * b                           # 5,2 px nguồn = 0,53 px logic (cộng giãn ngực → đỉnh mũ ~0,8 px logic)
    than_sy = 1 + 0.0028 * b
    than_sx = 1 - 0.0012 * b
    than_rot = -0.35 * b                         # ưỡn nhẹ khi hít
    # nghiêng đầu nghe (mũ cúi về phía chuông) – mốc khoá
    nghieng = track([(0, 0), (205, 0), (246, 5.6), (262, 5.1), (292, 5.4), (338, 0), (360, 0)], t, period=N)
    mu_tx = track([(0, 0), (205, 0), (246, 3.0), (292, 3.0), (338, 0), (360, 0)], t, period=N)
    ay = dao_ham2(than_ty, period=False)
    a_rot = dao_ham2(than_rot)
    # mũ: lò xo bám mốc (trễ + chùng nhẹ), thêm hơi thở trễ
    mu_rot = lo_xo(nghieng - 0.25 * b, -0.6 * a_rot + 0.02 * ay, 9.0, 0.55)
    mu_ty = lo_xo(np.zeros_like(b), -ay * 0.9, 14.0, 0.6)
    a_mu = dao_ham2(mu_rot) + a_rot
    chop = lo_xo(np.full_like(b, 0.0), -0.9 * a_mu + 0.05 * ay, 5.5, 0.16)   # chóp: chậm, chùng → trễ thêm
    chuong = lo_xo(np.zeros_like(b), -0.5 * a_rot + 0.06 * ay, 7.0, 0.18)
    vai = lo_xo(np.zeros_like(b), 0.03 * ay - 0.4 * a_rot, 10.0, 0.45)
    vt = lo_xo(np.zeros_like(b), 0.05 * ay, 6.0, 0.3)
    vs = lo_xo(np.zeros_like(b), -0.05 * ay, 5.0, 0.3)
    tay = lo_xo(-0.9 * b, 0.0 * b, 6.5, 0.5)
    dao = lo_xo(np.zeros_like(b), -0.5 * dao_ham2(tay), 9.0, 0.35)
    tay_xa = lo_xo(0.6 * b, 0 * b, 6.0, 0.5)
    s = slice(N * (vong - 1), N * vong)
    poses = _ghep(N)
    for i, j in enumerate(range(s.start, s.stop)):
        _dat(poses, 'than', i, ty=than_ty[j], rot=than_rot[j], sx=than_sx[j], sy=than_sy[j])
        _dat(poses, 'mu', i, tx=mu_tx[j], ty=mu_ty[j], rot=mu_rot[j], sx=1 / than_sx[j], sy=1 / than_sy[j])
        _dat(poses, 'chop', i, rot=chop[j])
        _dat(poses, 'chuong', i, rot=chuong[j], sx=1 / than_sx[j], sy=1 / than_sy[j])
        _dat(poses, 'ao-vai', i, rot=vai[j])
        _dat(poses, 'vat-truoc', i, rot=vt[j])
        _dat(poses, 'vat-sau', i, rot=vs[j])
        _dat(poses, 'gang-gan', i, rot=tay[j], sx=1 / than_sx[j], sy=1 / than_sy[j])
        _dat(poses, 'dao', i, rot=dao[j])
        _dat(poses, 'gang-xa', i, rot=tay_xa[j])
    khung = list(range(0, N, DUNG_BUOC_MOI_KHUNG))
    return [poses[k] for k in khung], {'tick_moi_khung': DUNG_BUOC_MOI_KHUNG, 'so_tick': N,
                                       'tho': {'chu_ky_tick': 180, 'bien_do_than_px_nguon': 5.2},
                                       'nghieng_dau': {'tick': [205, 338], 'goc_do': 5.6}}


# ======================================================================================================
# CHẠY: 30 tick / chu kỳ = 132 px logic (264 px/s), 2 bước. Ủng chạm đất 22 % chu kỳ mỗi chân (sải ngắn dưới vạt,
# không có ống chân) → chân chịu lực trôi đúng tốc độ đất; còn lại là pha bay → thân nảy, vạt tung, ủng ló.
# ======================================================================================================
DUTY = 0.22
L0 = QUANG * DUTY / 2                            # ủng chạm ở +L0, rời ở −L0 (so với gốc)
UNG_NHAC = 52.0                                  # nhấc ủng cao nhất (px nguồn)
NUA_UNG = 40.0                                   # nửa chiều dài đế → mũi chạm đất khi gót nhấc


def ung_chay(ph):
    """vị trí ủng (dx so với chỗ nghỉ của nó → quy về gốc, dy, xoay) theo pha riêng của chân (0 = chạm đất)."""
    ph = ph % 1.0
    if ph < DUTY:
        x = L0 - QUANG * ph
        rot = 20 * tron((ph - 0.55 * DUTY) / (0.45 * DUTY))          # gót nhấc, đạp bằng mũi
        y = 0.0
        cham = True
    else:
        s = (ph - DUTY) / (1 - DUTY)
        x = -L0 + 2 * L0 * float(track([(0, 0), (0.12, 0.02), (0.55, 0.62), (0.88, 0.985), (1, 1)], s))
        y = -UNG_NHAC * math.sin(math.pi * min(1, s * 1.08)) ** 0.85
        rot = float(track([(0, 20), (0.22, 8), (0.5, -2), (0.8, -12), (0.95, -4), (1, 0)], s))
        cham = False
    if rot > 0:                                                      # quay quanh mũi: nâng tâm đế
        y -= NUA_UNG * math.sin(math.radians(rot))
    return x, y, rot, cham


def than_chay(ph):
    """nảy thân theo nửa chu kỳ (u = 0: vừa chạm đất)."""
    u = (ph % 0.5) / 0.5
    dc = DUTY / 0.5
    if u < dc:
        k = math.sin(math.pi * u / dc)
        y = 9.0 * k
        sy = 1 - 0.026 * k ** 1.4                                     # nén 2,6 % khi chịu lực
    else:
        s = (u - dc) / (1 - dc)
        y = -19.0 * 4 * s * (1 - s) ** 0.9 * 1.12
        sy = 1 + 0.018 * math.sin(math.pi * min(1, s * 1.6)) ** 2     # giãn 1,8 % lúc đạp bật
    y -= 24.0                                                        # chạy: thân nhấc khỏi dáng nghỉ → vạt hở, ủng ló
    return y, sy


def clip_chay():
    N = CHAY_TICK
    vong = 8
    t = np.arange(N * vong)
    ph = t / N
    y = np.array([than_chay(p)[0] for p in ph])
    sy = np.array([than_chay(p)[1] for p in ph])
    sx = 1 / np.sqrt(sy)
    rot = 7.5 + 1.3 * np.sin(2 * np.pi * 2 * (ph - 0.14))            # nghiêng tới; nhấn thêm lúc đạp
    dx = 5.0 * np.sin(2 * np.pi * 2 * (ph - 0.2))                    # thân dồn tới lúc đạp, lùi lúc chạm
    ay = dao_ham2(y)
    ax = dao_ham2(dx)
    a_rot = dao_ham2(rot)
    ug = [ung_chay(p) for p in ph]
    ux = [ung_chay(p + 0.5) for p in ph]
    xg = np.array([u[0] for u in ug])
    xx = np.array([u[0] for u in ux])
    # mũ: nghiêng ngược thân 1 phần (đầu không chúi theo thân) + trễ nhịp nảy
    mu_rot = lo_xo(np.full_like(y, -3.0), -0.8 * a_rot - 0.06 * ay - 0.03 * ax, 15.0, 0.42)
    mu_ty = lo_xo(np.zeros_like(y), -0.08 * ay, 20.0, 0.45)
    mu_tx = lo_xo(np.zeros_like(y), -0.25 * ax / 9.0, 18.0, 0.5)
    a_mu = dao_ham2(mu_rot) + a_rot
    chop = lo_xo(np.full_like(y, 9.0), -0.85 * a_mu + 0.09 * ay, 10.5, 0.24)        # chóp: trễ thêm, kéo ra sau
    chuong = lo_xo(np.full_like(y, 13.0), 0.07 * ay - 0.3 * ax, 12.5, 0.2)
    vai = lo_xo(np.full_like(y, 2.5), 0.02 * ay - 0.3 * a_rot, 19.0, 0.5)
    vt = lo_xo(4.0 - 8.0 * xg / L0, 0.016 * ay, 16.0, 0.34)                        # vạt trước theo ủng gần
    vs = lo_xo(6.0 - 5.0 * xx / L0, -0.012 * ay, 13.0, 0.3)                         # vạt sau theo ủng xa
    tay = lo_xo(-4.0 + 17.0 * np.cos(2 * np.pi * ph), 0 * y, 14.0, 0.5)              # tay gần ngược chân gần
    dao = lo_xo(np.zeros_like(y), -0.55 * dao_ham2(tay), 17.0, 0.38)
    tay_xa = lo_xo(-16.0 * np.cos(2 * np.pi * ph), 0 * y, 13.0, 0.5)
    s = slice(N * (vong - 1), N * vong)
    poses = _ghep(N)
    cham = []
    for i, j in enumerate(range(s.start, s.stop)):
        _dat(poses, 'than', i, ty=y[j], rot=rot[j], sx=sx[j], sy=sy[j])
        poses[i]['goc'] = [float(dx[j]), 0.0]
        _dat(poses, 'mu', i, tx=mu_tx[j], ty=mu_ty[j], rot=mu_rot[j], sx=1 / sx[j], sy=1 / sy[j])
        _dat(poses, 'chop', i, rot=chop[j])
        _dat(poses, 'chuong', i, rot=chuong[j], sx=1 / sx[j], sy=1 / sy[j])
        _dat(poses, 'ao-vai', i, rot=vai[j])
        _dat(poses, 'vat-truoc', i, rot=vt[j])
        _dat(poses, 'vat-sau', i, rot=vs[j])
        _dat(poses, 'gang-gan', i, rot=tay[j], sx=1 / sx[j], sy=1 / sy[j])
        _dat(poses, 'dao', i, rot=dao[j])
        _dat(poses, 'gang-xa', i, rot=tay_xa[j])
        # ủng: toạ độ so với chỗ nghỉ của từng ủng; chỗ nghỉ ủng gần +91, ủng xa −49 so với gốc → quy về gốc
        g, x_ = ug[j], ux[j]
        _dat(poses, 'ung-gan', i, tx=g[0] - 91.0, ty=g[1], rot=g[2])
        _dat(poses, 'ung-xa', i, tx=x_[0] + 49.0, ty=x_[1], rot=x_[2])
        cham.append({'ung-gan': g[3], 'ung-xa': x_[3]})
    return poses, {'tick_moi_khung': 1, 'so_tick': N, 'quang_px_logic': QUANG_LOGIC, 'ty_le_cham_dat': DUTY,
                   'chiu_luc': cham}


# ======================================================================================================
# CHÉM ĐÒN 1 (ngang): 26 khung = atkT 1…26 (su 11 + ac 8 + re 8 − 1). Hộp đòn bật atkT 11…18.
# nén ngắn (1–5) → giữ thế (6–8) → vung nhanh (9–11, 2 tick) → trúng + đà (11–18) → hồi chậm (19–26).
# Bước tới bằng ủng gần; game tự đẩy Lam tới (lunge 2,2 giảm 0,44/tick) → ủng bù đúng quãng đó để không trượt.
# ======================================================================================================
def lunge_logic():
    """quãng dịch thật của collider theo atkT (px logic) – mô phỏng đúng code game (startAtk + approach về 0)."""
    vx, D, out = ATK1['lunge'], 0.0, []
    dec = ATK1['run_speed'] / ATK1['decel_frames'] * 0.5
    for atkT in range(1, 27):
        if atkT > 1:
            vx = max(0.0, vx - dec)
            D += vx
        out.append(D)
    return np.array(out)


def clip_chem():
    n = 26
    lead = 40                                     # tick đứng yên trước khi chém (cho lò xo ở trạng thái nghỉ)
    tail = 0
    t = np.arange(-lead, n + tail) + 1            # atkT
    T0 = lambda keys: track([(-lead, keys[0][1])] + keys, t)
    # ---- thân ----
    dx = T0([(0, 0), (4, -14), (8, -20), (9, -10), (11, 118), (14, 132), (18, 122), (22, 60), (26, 0)])
    dy = T0([(0, 0), (4, 9), (8, 7), (9, 4), (11, 2), (13, 11), (16, 5), (20, 2), (26, 0)])
    rot = T0([(0, 0), (4, -4.5), (8, -6.5), (9, -5), (11, 10.5), (14, 12), (18, 9.5), (23, 2.5), (26, 0)])
    sy = T0([(0, 1), (4, 0.972), (8, 0.982), (10, 1.026), (11, 1.018), (13, 0.973), (16, 1.0), (26, 1)])
    sx = 1 / np.sqrt(sy)
    # ---- tay gần (quay quanh vai, chiều kim đồng hồ: rủ → ra sau → lên → tới trước → rủ lại) ----
    # chém NGANG nhìn ngang: tay kéo ra sau ngang vai (co lại = khuỷu gập), vung QUA TRƯỚC NGỰC (tay ngắn lại vì chĩa
    # về phía người xem, 1 tick) rồi duỗi thẳng ra trước, hơi chếch lên; hồi chậm về rủ.
    tay = T0([(0, 0), (3, 52), (6, 96), (8, 104), (9, 100), (10, 0), (11, -98), (13, -98), (18, -95), (22, -48),
              (26, 0)])
    tay_dai = T0([(0, 1), (4, 0.92), (8, 0.84), (9, 0.8), (10, 0.42), (11, 1.03), (13, 1.0), (26, 1)])
    # ---- dao trong tay: hướng riêng (bị kéo trễ khi vung, quất qua rồi về) ----
    dao_key = T0([(0, 0), (4, 38), (8, 66), (9, 72), (10, 96), (11, 66), (12, 63), (14, 61), (18, 60), (22, 24),
                  (26, 0)])
    dao_dai = T0([(0, 1), (9, 1), (10, 0.6), (11, 1.0), (26, 1)])
    tay_xa = T0([(0, 0), (5, -18), (9, -22), (11, 26), (16, 20), (24, 4), (26, 0)])
    # ---- ủng: gần bước tới, xa bám đất rồi bước theo; bù quãng lunge của collider ----
    D = np.concatenate([np.zeros(lead), lunge_logic() / K_LOGIC])     # px nguồn, atkT ≥ 1
    ung_g_land = 185.0
    gx = np.zeros_like(D)
    gy = np.zeros_like(D)
    gr = np.zeros_like(D)
    xx = np.zeros_like(D)
    xy = np.zeros_like(D)
    xr = np.zeros_like(D)
    for i, a in enumerate(t):
        # ủng gần: đứng chỗ cũ (bù D) tới atkT 7, nhấc 7→11 ra +150, đứng tới 19, nhấc 19→24 về 0
        if a <= 7:
            gx[i] = -D[i]
            gr[i] = 12 * tron((a - 4) / 3)
        elif a <= 11:
            s = (a - 7) / 4
            x0 = -D[i]
            gx[i] = x0 + (ung_g_land - x0) * float(tron(s))
            gy[i] = -44 * math.sin(math.pi * s)
            gr[i] = float(track([(0, 12), (0.5, -10), (0.85, -14), (1, 0)], s))
        elif a <= 19:
            gx[i] = ung_g_land
        elif a <= 24:
            s = (a - 19) / 5
            gx[i] = ung_g_land * (1 - float(tron(s)))
            gy[i] = -30 * math.sin(math.pi * s)
            gr[i] = float(track([(0, 10), (0.5, 0), (1, 0)], s))
        # ủng xa: bám đất (bù D), gót nhấc lúc đạp 9–12, bước theo 13→18 về 0
        if a <= 12:
            xx[i] = -D[i]
            xr[i] = 22 * tron((a - 8) / 2) * (1 - tron((a - 11) / 2))
        elif a <= 18:
            s = (a - 12) / 6
            x0 = -D[i]
            xx[i] = x0 * (1 - float(tron(s)))
            xy[i] = -26 * math.sin(math.pi * s)
        if gr[i] > 0:
            gy[i] -= NUA_UNG * math.sin(math.radians(gr[i]))
        if xr[i] > 0:
            xy[i] -= NUA_UNG * math.sin(math.radians(xr[i]))
    # ---- phụ: lò xo bị thân kéo ----
    ax = dao_ham2(dx)
    ay = dao_ham2(dy)
    a_rot = dao_ham2(rot)
    mu_key = T0([(0, 0), (4, -2.5), (9, -3), (11, 4), (16, 3), (26, 0)])
    mu_rot = lo_xo(mu_key, -0.75 * a_rot - 0.0011 * ax + 0.0012 * ay, 15.0, 0.45)
    mu_tx = lo_xo(np.zeros_like(dx), -0.16 * ax / 9.0, 17.0, 0.5)
    mu_ty = lo_xo(np.zeros_like(dx), -0.22 * ay / 9.0, 19.0, 0.5)
    a_mu = dao_ham2(mu_rot) + a_rot
    chop = lo_xo(np.zeros_like(dx), -0.8 * a_mu - 0.0016 * ax + 0.0016 * ay, 10.0, 0.26)
    chuong = lo_xo(np.zeros_like(dx), -0.65 * a_rot - 0.0030 * ax + 0.002 * ay, 11.5, 0.24)
    vai = lo_xo(np.zeros_like(dx), -0.0008 * ax - 0.3 * a_rot, 17.0, 0.5)
    vt = lo_xo(-7.0 * np.clip(gx / ung_g_land, -1, 1), -0.0012 * ax + 0.001 * ay, 15.0, 0.36)
    vs = lo_xo(np.zeros_like(dx), -0.0016 * ax - 0.001 * ay, 12.0, 0.3)
    dao_lx = lo_xo(np.zeros_like(dx), -0.12 * dao_ham2(tay), 20.0, 0.45)
    # cuối đòn: kéo phần phụ về đúng dáng nghỉ (khung 26 → bước sau là dáng đứng) – tắt dần 21…26
    w = 1 - tron((t - 20) / 6)
    poses = _ghep(n)
    for i in range(n):
        j = lead + i
        _dat(poses, 'than', i, ty=dy[j], rot=rot[j], sx=sx[j], sy=sy[j])
        poses[i]['goc'] = [float(dx[j]), 0.0]
        _dat(poses, 'mu', i, tx=mu_tx[j] * w[j], ty=mu_ty[j] * w[j], rot=mu_rot[j] * w[j] + mu_key[j] * (1 - w[j]),
             sx=1 / sx[j], sy=1 / sy[j])
        _dat(poses, 'chop', i, rot=chop[j] * w[j])
        _dat(poses, 'chuong', i, rot=chuong[j] * w[j], sx=1 / sx[j], sy=1 / sy[j])
        _dat(poses, 'ao-vai', i, rot=vai[j] * w[j])
        _dat(poses, 'vat-truoc', i, rot=vt[j] * w[j])
        _dat(poses, 'vat-sau', i, rot=vs[j] * w[j])
        _dat(poses, 'gang-gan', i, rot=tay[j], sx=1 / sx[j], sy=tay_dai[j] / sy[j])
        _dat(poses, 'dao', i, rot=dao_key[j] + dao_lx[j] * w[j], sx=dao_dai[j])
        _dat(poses, 'gang-xa', i, rot=tay_xa[j])
        # ủng là con của GỐC, không theo 'goc' của thân → toạ độ so với chỗ nghỉ
        _dat(poses, 'ung-gan', i, tx=gx[j], ty=gy[j], rot=gr[j])
        _dat(poses, 'ung-xa', i, tx=xx[j], ty=xy[j], rot=xr[j])
    return poses, {'tick_moi_khung': 1, 'atkT': list(range(1, 27)), 'lunge_px_logic': lunge_logic().round(3).tolist(),
                   'ATK1': ATK1}
