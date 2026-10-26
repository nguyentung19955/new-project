"""[v5] GIAI ĐOẠN NÀY KHÔNG CHẠY FILE NÀY: chủ dự án duyệt 4 tư thế (tu_the.py) trước, sau đó mới ráp chu kỳ.
File giữ lại từ v4 với MỘT thay đổi theo YEU-CAU-V5 mục 2: bỏ mặc định chênh lệch chân xa
(DX_SHIFT chân xa −32 → 0, LIFT_SCALE chân xa 0,7 → 1,0) – hai chân cùng logic bước, lệch nửa chu kỳ.
Khi ráp chu kỳ v5 sẽ viết lại để dùng bảng tư thế + attachment của tu_the.py (IK chỉ giữ chân chịu lực).

Chạy NHÁP tại chỗ (kiểm rig, KHÔNG phải animation game hoàn thiện):  python3 chay_nhap.py
→ ../chay-nhap/: GIF cỡ lớn, GIF 112 px logic (sáng/tối/caro), contact sheet, chay-nhap.json (khoá + số đo).

Dựng: 4 tư thế chính mỗi nửa chu kỳ (chạm đất, chịu lực, đạp, bay); nửa sau đổi chân. Chu kỳ 0,64 s.
Nội suy theo THỜI GIAN (Catmull–Rom tuần hoàn), không khoá số khung runtime.
Chân: đích điểm đế (diem_de) + hướng ủng thế giới theo khoá, giải IK hai đoạn (gập cố định gap=−1).
Pha chịu lực (chạm đất → đạp): đích KHOÁ trong thế giới, trượt lùi theo mặt đất với vận tốc v (chạy tại chỗ =
mặt đất chạy lùi); sau đạp nhả khoá trong 0,03 s (trộn đích khoá → đích khoá-tư-thế). Pha bay không khoá.
Thân: lean + nhún root theo khoá; đầu bù góc tĩnh qua `phu` (JSON). Tay: góc thế giới theo khoá.
"""
import os, sys, json, math, copy
import numpy as np
from PIL import Image, ImageDraw

import rap4, khung
from chung import font

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, '..', 'chay-nhap'))
K112 = 112 / 470.0
CYCLE = 0.64
DAT = 468.0

# ---------------- khoá (tư thế chính) – 8 khoá / chu kỳ cho MỘT chân, pha 0 = chạm đất ----------------
# (dx, nhac, huong_ung): dx = x CỔ CHÂN (P ủng) − x hông của chính chân đó (thế giới); nhac = độ nhấc cổ chân trên
# độ cao cổ chân khi đứng (px thế giới, nhân LIFT_SCALE theo chân); huong_ung = hướng ủng thế giới (90 = đế phẳng).
# Mọi pha giải IK hai đoạn (gap cố định −1). Pha chịu lực (khoá 0→2): đích = ĐIỂM ĐẾ khoá trong thế giới, trượt lùi
# theo mặt đất; pha bay: đích theo khoá (không khoá đất), giữ khoảng hông–cổ chân ≥ DMIN và không xuyên đất.
LEG_KEYS = [
    ('chạm đất', (24, 0, 90)),
    ('chịu lực', (0, 0, 90)),
    ('đạp', (-28, 0, 90)),
    ('bay', (-40, 22, 118)),
    ('chạm đất (chân kia)', (-32, 44, 138)),
    ('chịu lực (chân kia)', (-2, 46, 122)),
    ('đạp (chân kia)', (24, 34, 102)),
    ('bay (chân kia)', (32, 12, 92)),
]
# v4: LIFT_SCALE chân xa 0,7 và DX_SHIFT chân xa −32. v5: BỎ – hai chân cùng logic (xem tu-the/04-phoi-canh-chan-xa.png:
# điểm gắn hông xa của rig đã lệch ra sau 49 px và thấp 20 px, dịch thêm làm đế chân xa xuyên đất ở tư thế chạm đất).
LIFT_SCALE = {'chan-gan': 1.0, 'chan-xa': 1.0}
DX_SHIFT = {'chan-gan': 0.0, 'chan-xa': 0.0}
DMIN = 42.0                # px: khoảng hông–cổ chân tối thiểu khi bay (gối gập ≤ ~125°)
STANCE_KEYS = 2            # khoá 0..2 = pha chịu lực (khoá chân), sau đó nhả
RELEASE = 0.03             # s: nhả khoá sau khi đạp (trộn góc IK → FK, mix 1 → 0)
RAMP_IN = 0.02             # s: vào khoá trước chạm đất (mix 0 → 1)
# tay: góc thế giới [tay trên, cẳng, găng] theo pha của TAY (pha 0 = tay ở sau nhất)
ARM_KEYS = {   # tay gần cầm dao: biên độ nhỏ, cẳng tay giữ hướng lên-trước; tay xa vung rộng hơn
    'tay-gan': [(104, 18, 8), (96, 4, -4), (82, -16, -14), (68, -32, -24),
                (62, -40, -30), (68, -32, -24), (82, -16, -14), (96, 4, -4)],
    'tay-xa': [(132, 78, 78), (118, 56, 56), (96, 24, 24), (76, -2, -2),
               (66, -14, -14), (76, -2, -2), (96, 24, 24), (118, 56, 56)]}
# thân: theo nửa chu kỳ (4 khoá) – root dy (dương = xuống), lean (độ), chóp (độ)
BODY_KEYS = [(3, 6.0, -2), (7, 7.0, 3), (3, 6.0, 1), (-4, 5.0, -2)]
GROUND_OFFSET = {'chan-gan': 0.0, 'chan-xa': 0.0}     # cùng mặt đất y=468 như dáng nghỉ


def catmull(keys, u):
    """keys: list các vector, tuần hoàn; u ∈ [0, len) – nội suy Catmull–Rom đồng đều."""
    n = len(keys); i = int(math.floor(u)) % n; f = u - math.floor(u)
    p0, p1, p2, p3 = (np.array(keys[(i + k) % n], float) for k in (-1, 0, 1, 2))
    return 0.5 * ((2 * p1) + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f ** 3)


def smooth(w):
    w = min(max(w, 0.0), 1.0); return w * w * (3 - 2 * w)


class Run:
    def __init__(s, r):
        s.r = r
        s.root0 = np.array(r.meta['goc']['vi_tri_nghi'], float)
        s.phase_off = {'chan-gan': 0.0, 'chan-xa': 0.5}
        s.t_st = STANCE_KEYS / len(LEG_KEYS) * CYCLE
        # vận tốc mặt đất từ khoá chân: (dx chạm đất − dx đạp) / thời gian chịu lực
        s.v = (LEG_KEYS[0][1][0] - LEG_KEYS[STANCE_KEYS][1][0]) / s.t_st
        s.contact = {}
        for ch in ('chan-gan', 'chan-xa'):
            tc = ((-s.phase_off[ch]) % 1.0) * CYCLE
            de, _ = s.free_target(ch, tc, clamp=False)
            s.contact[ch] = de

    def body(s, t):
        u = (t / CYCLE) * 8.0
        dy, lean, tip = catmull(BODY_KEYS, u % 4.0)
        return float(dy), float(lean), float(tip)

    def base_pose(s, t):
        """Pose thân + tay (FK) tại t; chân để IK."""
        r = s.r
        dy, lean, tip = s.body(t)
        g = {'than': lean, 'chop-mu': tip}
        for ch, off in (('tay-gan', 0.0), ('tay-xa', 0.5)):
            ws = catmull(ARM_KEYS[ch], ((t / CYCLE + off) % 1.0) * len(ARM_KEYS[ch]))
            prev = r.inst['than']['goc_nghi'] + lean
            for n, w in zip(khung.CHAIN[ch], ws):
                g[n] = (w - prev) - r.inst[n]['goc_nghi']; prev = w
        return {'goc': g, 'goc_toa_do': [float(s.root0[0]), float(s.root0[1] + dy)]}

    def hip(s, ch, t):
        p = s.base_pose(t); M, _ = s.r.matrices(p)
        n1 = s.r.ik[ch]['xuong'][0]
        return rap4.app(M[n1], s.r.inst[n1]['P'])

    def free_target(s, ch, t, clamp=True):
        """Đích điểm đế (thế giới) theo khoá + hướng ủng; giữ hông–cổ chân ≥ DMIN, không để đế dưới đất."""
        r = s.r
        ph = (t / CYCLE + s.phase_off[ch]) % 1.0
        k = catmull([v for _, v in LEG_KEYS], ph * len(LEG_KEYS))
        b = r.ik[ch]['xuong'][2]; P = r.inst[b]['P']
        g = DAT + GROUND_OFFSET[ch]
        ank_stand = g - (r.ik[ch]['diem_de'][1] - P[1])          # cổ chân khi đế phẳng chạm đất
        hip = s.hip(ch, t)
        ankle = np.array([hip[0] + k[0] + DX_SHIFT[ch], ank_stand - max(0.0, k[1]) * LIFT_SCALE[ch]])
        if clamp:
            v = ankle - hip; d = float(np.hypot(*v))
            if d < DMIN:
                ankle = hip + v / d * DMIN
        bd = float(k[2])
        th = math.radians(bd - r.inst[b]['huong_anh'])
        cs, sn = math.cos(th), math.sin(th)

        def w(q):
            v = np.subtract(q, P); return ankle + np.array([cs * v[0] - sn * v[1], sn * v[0] + cs * v[1]])
        de = w(r.ik[ch]['diem_de'])
        if clamp:
            low = max(w(q)[1] for q in r.inst[b]['diem_de'].values())
            if low > g:
                de = de - np.array([0.0, low - g])
        return de, bd

    def lock_of(s, ch, t):
        """(khoá?, w, đích đế) – khoá đất trong [−RAMP_IN, t_st + RELEASE] quanh pha chịu lực; w = trọng số đích khoá."""
        ph = (t / CYCLE + s.phase_off[ch]) % 1.0
        tc = ph * CYCLE
        if tc > CYCLE - RAMP_IN:
            tc -= CYCLE
        if tc < -RAMP_IN or tc > s.t_st + RELEASE:
            return False, 0.0, None
        g = DAT + GROUND_OFFSET[ch]
        de = np.array([s.contact[ch][0] - s.v * tc, g])
        if tc < 0:
            w = smooth(1 + tc / RAMP_IN)
        elif tc > s.t_st:
            w = smooth(1 - (tc - s.t_st) / RELEASE)
        else:
            w = 1.0
        return 0 <= tc <= s.t_st, w, de

    def pose(s, t):
        r = s.r
        p = s.base_pose(t)
        locks, info = {}, {}
        for ch in ('chan-gan', 'chan-xa'):
            free, bd = s.free_target(ch, t)
            k, w, de = s.lock_of(ch, t)
            if de is not None:
                tgt = w * de + (1 - w) * free; bd = w * 90.0 + (1 - w) * bd
            else:
                tgt = free
            info[ch] = dict(khoa=k, w=w)
            locks[ch] = dict(de=[float(tgt[0]), float(tgt[1])], huong_ung=float(bd), mix=1.0)
        p['khoa_chan'] = locks
        drop = max(0.0, r.ha_goc_can_thiet(p, {c: l for c, l in locks.items() if info[c]['khoa']}))
        if drop > 0:      # chân chịu lực ngoài tầm: hạ root (báo số), không kéo xương
            p['goc_toa_do'] = [p['goc_toa_do'][0], p['goc_toa_do'][1] + drop]
        dy, lean, _ = s.body(t)
        return p, dict(chan=info, ha_root_them=drop, root_dy=dy, lean=lean)


def _clean(o):
    if isinstance(o, dict):
        return {k: _clean(v) for k, v in o.items()}
    if isinstance(o, list):
        return [_clean(v) for v in o]
    if isinstance(o, (bool, np.bool_)):
        return bool(o)
    if isinstance(o, (float, np.floating)):
        return float(o) if math.isfinite(o) else None
    return o


def slot_on(r, ang):
    rule = r.meta['slot_theo_tu_the'][0]
    return r.rule_value(rule, ang) < rule['khi']['nho_hon']


def draw_ground(im, v, t, scale=1.0, off=(0, 0), ground=DAT, col=(120, 120, 120)):
    d = ImageDraw.Draw(im)
    y = (ground + off[1]) * scale
    d.line([(0, y), (im.width, y)], fill=col, width=max(1, int(2 * scale)))
    step = 40.0
    x0 = (-(v * t)) % step
    x = x0 - step
    while x < im.width / scale + step:
        X = (x + off[0]) * scale
        d.line([(X, y), (X - 6 * scale, y + 8 * scale)], fill=col, width=max(1, int(2 * scale)))
        x += step


def main():
    os.makedirs(OUT, exist_ok=True)
    r = rap4.load_default()
    run = Run(r)
    FPS = 50
    N = int(round(CYCLE * FPS))
    frames = []
    rep = dict(chu_ky_s=CYCLE, fps_xem_truoc=FPS, so_khung=N, van_toc_mat_dat_px_s=round(run.v, 2),
               van_toc_logic_px_s=round(run.v * K112, 2), khung=[])
    prev_slot = None; toggles = []
    for i in range(N + 1):                      # khung N = t 0,64 (để kiểm vòng nối, không đưa vào GIF)
        t = i / FPS
        p, inf = run.pose(t)
        M, ang = r.matrices(p)
        ik = copy.deepcopy(r.last_ik)
        sl = slot_on(r, ang)
        row = dict(t=round(t, 4), root=[round(x, 3) for x in p['goc_toa_do']], ha_root_them=round(inf['ha_root_them'], 3),
                   lean=round(inf['lean'], 2), slot_115=sl, goc_dui_gan_cuc_bo=round(ang['dui-gan'], 2))
        for ch in ('chan-gan', 'chan-xa'):
            de = rap4.app(M[r.ik[ch]['xuong'][2]], r.ik[ch]['diem_de'])
            q = ik.get(ch, dict(sai_de_px=float('nan'), sai_co_chan_px=float('nan'), thieu_px=0.0, goc_goi=ang[r.ik[ch]['xuong'][1]]))
            row[ch] = dict(khoa=inf['chan'][ch]['khoa'], mix=round(inf['chan'][ch]['w'], 3),
                           sai_de_px=round(q['sai_de_px'], 4), sai_co_chan_px=round(q['sai_co_chan_px'], 4),
                           thieu_tam_px=round(q['thieu_px'], 4), goc_goi=round(q['goc_goi'], 2),
                           de_y=round(float(de[1]), 2), xuyen_dat_px=round(max(0.0, float(de[1]) - (DAT + GROUND_OFFSET[ch])), 3))
            # điểm thấp nhất của ủng (gót/mũi) so với đất – kiểm xuyên đất khi bay
            low = max(rap4.app(M[r.ik[ch]['xuong'][2]], q)[1] for q in r.inst[r.ik[ch]['xuong'][2]]['diem_de'].values())
            row[ch]['ung_thap_nhat_y'] = round(float(low), 2)
        if prev_slot is not None and sl != prev_slot:
            toggles.append(round(t, 4))
        prev_slot = sl
        rep['khung'].append(row)
        frames.append((t, p, sl))
    # ---------- tổng hợp số ----------
    K = rep['khung'][:N]
    st = [(k[ch]['sai_de_px'], k[ch]['sai_co_chan_px']) for k in K for ch in ('chan-gan', 'chan-xa') if k[ch]['khoa']]
    rep['khoa_chan'] = dict(so_mau_khoa=len(st), sai_de_max_px=round(max(a for a, _ in st), 4),
                            sai_de_max_logic=round(max(a for a, _ in st) * K112, 4),
                            sai_co_chan_max_px=round(max(b for _, b in st), 4),
                            sai_co_chan_max_logic=round(max(b for _, b in st) * K112, 4),
                            muc_tieu_logic=0.25, dat=bool(max(a for a, _ in st) * K112 <= 0.25))
    # trượt chân trong pha khoá: dịch điểm đế giữa hai khung liên tiếp so với mặt đất (đã trừ v·dt)
    slip = []
    for ch in ('chan-gan', 'chan-xa'):
        for a, b in zip(rep['khung'][:-1], rep['khung'][1:]):
            if a[ch]['khoa'] and b[ch]['khoa']:
                slip.append(abs(a[ch]['sai_de_px']) + abs(b[ch]['sai_de_px']))
    rep['truot_khi_khoa_max_px'] = round(max(slip), 4) if slip else None
    rep['ha_root_them_max_px'] = round(max(k['ha_root_them'] for k in K), 3)
    rep['khung_can_ha_root'] = [k['t'] for k in K if k['ha_root_them'] > 0]
    rep['thieu_tam_max_px'] = round(max(k[ch]['thieu_tam_px'] for k in K for ch in ('chan-gan', 'chan-xa')), 4)
    rep['xuyen_dat_khi_bay_max_px'] = round(max(max(0.0, k[ch]['ung_thap_nhat_y'] - (DAT + GROUND_OFFSET[ch]))
                                                for k in K for ch in ('chan-gan', 'chan-xa') if not k[ch]['khoa']), 3)
    rep['doi_slot_khi_chay'] = dict(thoi_diem=toggles, so_lan_moi_chu_ky=len(toggles),
                                    goc_dui_min=round(min(k['goc_dui_gan_cuc_bo'] for k in K), 2),
                                    goc_dui_max=round(max(k['goc_dui_gan_cuc_bo'] for k in K), 2))
    # vòng nối: khung N (t=0,64) phải trùng khung 0; bước góc tại mối nối so với bước trung bình
    def angvec(p):
        _, a = r.matrices(p); return np.array([a[n] for n in sorted(a)])

    def adiff(x, y):
        return np.abs((x - y + 180.0) % 360.0 - 180.0)
    a0, aN = angvec(frames[0][1]), angvec(frames[N][1])
    a1, aN1 = angvec(frames[1][1]), angvec(frames[N - 1][1])
    steps = [adiff(angvec(frames[i + 1][1]), angvec(frames[i][1])).max() for i in range(N)]
    rep['vong_noi'] = dict(lech_goc_khung0_va_064_do=round(float(adiff(a0, aN).max()), 6),
                           lech_root_px=round(float(np.hypot(*np.subtract(frames[0][1]['goc_toa_do'], frames[N][1]['goc_toa_do']))), 6),
                           buoc_goc_tai_noi_do=round(float(adiff(a0, aN1).max()), 3),
                           buoc_goc_trung_vi_do=round(float(np.median(steps)), 3), buoc_goc_max_do=round(float(max(steps)), 3))
    # pop khi đổi slot trong chạy
    pops = []
    for tt in toggles:
        i = int(round(tt * FPS)); p = frames[i][1]
        rule = r.meta['slot_theo_tu_the'][0]

        def force(on):
            def f(ang):
                sl = {n: r.inst[n]['slot'] for n in r.inst}
                if on:
                    for n in rule['manh']:
                        sl[n] = rule['slot']
                return sl
            return f
        A = np.array(rap4.render(r.layers(p, slot_override=force(True))))
        B = np.array(rap4.render(r.layers(p, slot_override=force(False))))
        pops.append(int((np.abs(A.astype(int) - B.astype(int)).max(-1) > 40).sum()))
    rep['doi_slot_khi_chay']['px_doi_tai_khung_doi'] = pops
    # ---------- ảnh ----------
    CW, CH, OFF = 560, 520, (60, 0)
    big, small = [], {'sang': [], 'toi': [], 'caro': []}
    for i, (t, p, sl) in enumerate(frames[:N]):
        cv = rap4.render(r.layers(p), (CW, CH), offset=OFF)
        im = Image.new('RGBA', (CW, CH), (236, 232, 220, 255))
        draw_ground(im, run.v, t, 1.0, OFF)
        im.alpha_composite(cv)
        d = ImageDraw.Draw(im)
        for ch in ('chan-gan', 'chan-xa'):
            if rep['khung'][i][ch]['khoa']:
                x, y = p['khoa_chan'][ch]['de']
                d.ellipse([x + OFF[0] - 5, y - 5, x + OFF[0] + 5, y + 5], outline=(0, 150, 0), width=2)
        d.text((8, 6), 't=%.2fs  slot115=%s  khoá: gần %s xa %s' % (t, 'bật' if sl else 'tắt',
               'x' if rep['khung'][i]['chan-gan']['khoa'] else '-', 'x' if rep['khung'][i]['chan-xa']['khoa'] else '-'),
               fill=(0, 0, 0), font=font(14))
        big.append(im.convert('RGB'))
        # 112 px logic: scale đồng nhất, khung cố định
        cvw = rap4.render(r.layers(p), (CW, CH), offset=OFF)
        g = cvw.resize((round(CW * K112), round(CH * K112)), Image.LANCZOS)
        for bgk in small:
            if bgk == 'caro':
                b = Image.new('RGBA', g.size, (255, 255, 255, 255)); dd = ImageDraw.Draw(b)
                for yy in range(0, g.height, 4):
                    for xx in range(0, g.width, 4):
                        if (xx // 4 + yy // 4) % 2:
                            dd.rectangle([xx, yy, xx + 3, yy + 3], fill=(200, 200, 200, 255))
            else:
                b = Image.new('RGBA', g.size, (236, 232, 220, 255) if bgk == 'sang' else (28, 30, 44, 255))
            draw_ground(b, run.v, t, K112, OFF, col=(120, 120, 120) if bgk != 'toi' else (160, 160, 170))
            b.alpha_composite(g)
            small[bgk].append(b.convert('RGB'))
    dur = int(round(1000 / FPS))
    big[0].save(os.path.join(OUT, 'chay-nhap-lon.gif'), save_all=True, append_images=big[1:], duration=dur, loop=0)
    for bgk, fr in small.items():
        fr[0].save(os.path.join(OUT, 'chay-nhap-112px-logic-%s.gif' % bgk), save_all=True, append_images=fr[1:],
                   duration=dur, loop=0)
        # bản phóng ×4 NEAREST để xem từng px logic
        z = [f.resize((f.width * 4, f.height * 4), Image.NEAREST) for f in fr]
        z[0].save(os.path.join(OUT, 'chay-nhap-112px-logic-%s-phong-x4.gif' % bgk), save_all=True,
                  append_images=z[1:], duration=dur, loop=0)
    # contact sheet: 8 khoá + toàn bộ khung (thu nhỏ)
    F = font(13)
    keys_t = [k * CYCLE / 8 for k in range(8)]
    names = [n for n, _ in LEG_KEYS[:4]]
    cells = []
    for k, tt in enumerate(keys_t):
        i = int(round(tt * FPS))
        c = big[i].crop((60, 60, 520, 500)).resize((345, 330), Image.LANCZOS)
        ImageDraw.Draw(c).text((6, 310), 'khoá %d: %s – chân %s' % (k, names[k % 4], 'gần' if k < 4 else 'xa'),
                               fill=(0, 0, 0), font=F)
        cells.append(c)
    W = 4 * 349 + 4
    sheet1 = Image.new('RGB', (W, 2 * 334 + 4), 'white')
    for j, c in enumerate(cells):
        sheet1.paste(c, (4 + (j % 4) * 349, 4 + (j // 4) * 334))
    thumbs = [f.crop((60, 60, 520, 500)).resize((172, 165), Image.LANCZOS) for f in big]
    cols = 8; rows = (len(thumbs) + cols - 1) // cols
    sheet2 = Image.new('RGB', (cols * 174 + 2, rows * 167 + 2), 'white')
    for j, c in enumerate(thumbs):
        sheet2.paste(c, (2 + (j % cols) * 174, 2 + (j // cols) * 167))
    lg = [f.resize((f.width * 2, f.height * 2), Image.NEAREST) for f in small['sang']]
    cols3 = 16; rows3 = (len(lg) + cols3 - 1) // cols3
    sheet3 = Image.new('RGB', (cols3 * (lg[0].width + 2), rows3 * (lg[0].height + 2)), 'white')
    for j, c in enumerate(lg):
        sheet3.paste(c, ((j % cols3) * (c.width + 2), (j // cols3) * (c.height + 2)))
    hdr = Image.new('RGB', (max(W, sheet2.width, sheet3.width), 64), 'white')
    ImageDraw.Draw(hdr).text((6, 4), 'CHẠY NHÁP tại chỗ – chu kỳ %.2f s, %d khung @%d fps (nội suy theo thời gian). '
                             'Vòng xanh = chân đang khoá. Vạch đất chạy lùi %.0f px TG/s.\nHàng 1–2: 8 khoá chính; '
                             'giữa: mọi khung; dưới: 112 px logic ×2 (nền sáng).' % (CYCLE, N, FPS, run.v),
                             fill=(0, 0, 0), font=F)
    sheet = Image.new('RGB', (hdr.width, 64 + sheet1.height + sheet2.height + sheet3.height + 8), 'white')
    y = 0
    for s_ in (hdr, sheet1, sheet2, sheet3):
        sheet.paste(s_, (0, y)); y += s_.height + 2
    sheet.save(os.path.join(OUT, 'chay-nhap-contact-sheet.png'))
    rep['khoa_tu_the'] = dict(chan=[dict(ten=n, dx_co_chan_so_hong=v[0], nhac=v[1], huong_ung=v[2]) for n, v in LEG_KEYS],
                              tay=ARM_KEYS, than_root_dy_lean_chop=BODY_KEYS, nhac_theo_chan=LIFT_SCALE, dx_dich_theo_chan=DX_SHIFT, dmin=DMIN, dat_lech=GROUND_OFFSET,
                              khoa_pha_chiu_luc=STANCE_KEYS, nha_khoa_s=RELEASE, vao_khoa_s=RAMP_IN)
    rep = _clean(rep)
    json.dump(rep, open(os.path.join(OUT, 'chay-nhap.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    summ = {k: rep[k] for k in ('khoa_chan', 'truot_khi_khoa_max_px', 'ha_root_them_max_px', 'thieu_tam_max_px',
                                'xuyen_dat_khi_bay_max_px', 'doi_slot_khi_chay', 'vong_noi')}
    print(json.dumps(summ, ensure_ascii=False, indent=1))
    return rep


if __name__ == '__main__':
    main()
