# -*- coding: utf-8 -*-
"""Dựng toàn bộ thư mục docs/khung-que-8-huong từ bộ xương + bảng động tác.

Chạy:  python3 lam.py            (tất cả 27 động tác)
       python3 lam.py 01-dung 03-chay   (chỉ vài động tác; trang xem + bảng kiểm vẫn dựng lại cho những gì đã có)
"""
import json, math, os, sys
from PIL import Image, ImageDraw, ImageFont
import xuong as X
import dong_tac as DT
import ve
import kiem
import mo_ta

GOC_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # docs/khung-que-8-huong
H5 = ['s', 'se', 'e', 'ne', 'n']
H8 = ['s', 'se', 'e', 'ne', 'n', 'nw', 'w', 'sw']
NHIP_LAP = 1.25  # game phát đứng/đi/chạy chậm ×1,25 (hằng NHIP_LAP trong tệp vẽ Cu Tí mới ở game/js)


def dt(ma):
    return next(x for x in DT.DS if x[0] == ma)


def thoi_luong(d):
    """Thời lượng từng khung (giây) đúng như game."""
    ma, so, giay, lap, moc = d[0], d[3], d[4], d[5], d[6]
    if lap and ma in ('01-dung', '02-di', '03-chay'):
        giay = giay * NHIP_LAP
    if moc and len(moc) == so:
        m = list(moc) + [1.0]
        return [round((m[i + 1] - m[i]) * giay, 4) for i in range(so)]
    return [round(giay / so, 4)] * so


# ---------------- mô tả tự động từng khung (theo hướng) ----------------
def huong_man_hinh(dx, dy):
    a = math.degrees(math.atan2(-dy, dx)) % 360
    ten = ['right', 'upper-right', 'up', 'upper-left', 'left', 'lower-left', 'down', 'lower-right']
    return ten[int(((a + 22.5) % 360) // 45)]


def cao_do(y, K):
    """Độ cao nắm tay so với thân (theo màn hình)."""
    if y < K['dau'][1] - 6:
        return 'above head'
    if y < K['co'][1] + 1:
        return 'at head'
    if y < K['nguc'][1] + 3:
        return 'at chest'
    if y < K['eo'][1] + 3:
        return 'at waist'
    return 'low'


def tu_dong(ma, i, h, K, thu_tu, P):
    ts = ve.truoc_sau(K, thu_tu)
    tr_p = ts['cang_tay_p'] == 'truoc' or ts['canh_tay_p'] == 'truoc'
    tr_t = ts['cang_tay_t'] == 'truoc' or ts['canh_tay_t'] == 'truoc'
    ph = []
    a_p = 'orange arm ' + ('FRONT' if tr_p else 'BEHIND body') + ', fist ' + cao_do(K['co_tay_p'][1], K)
    a_t = 'purple arm ' + ('FRONT' if tr_t else 'BEHIND body') + ', fist ' + cao_do(K['co_tay_t'][1], K)
    ph.append(a_p); ph.append(a_t)
    if tr_p and tr_t:
        ph.append(('orange' if thu_tu.index('cang_tay_p') > thu_tu.index('cang_tay_t') else 'purple') + ' arm on top')
    # chân: chân nào trước (theo hướng mặt), chân nào nhấc
    src = X.GUONG.get(h, h)
    yaw = math.radians(X.HUONG[src])
    fw = X.np.array([math.cos(yaw), math.sin(yaw), 0])
    eo = P['eo']
    fp = float((P['co_chan_p'] - eo) @ fw); ft = float((P['co_chan_t'] - eo) @ fw)
    zp, zt = P['co_chan_p'][2], P['co_chan_t'][2]
    zmin = min(zp, zt)
    if abs(fp - ft) < 3:
        lg = 'feet level'
    else:
        lg = ('yellow leg forward' if fp > ft else 'blue leg forward')
    nh = [n for n, z in (('yellow', zp), ('blue', zt)) if z - zmin > 3.5]
    if min(zp, zt) > 3.5:
        lg += ', both feet in the air'
    elif nh:
        lg += ', ' + nh[0] + ' foot lifted'
    ph.append(lg)
    if K['vk_goc']:
        dx = K['vk_mui'][0] - K['vk_goc'][0]; dy = K['vk_mui'][1] - K['vk_goc'][1]
        dai3 = float(X.np.linalg.norm(P['vk_mui'] - P['vk_goc']))
        dai2 = math.hypot(dx, dy)
        sau = ts.get('vk') == 'sau'
        if d_vk(ma) == 'phitieu':
            w = 'shuriken in right fist'
        elif dai2 < 0.45 * dai3:
            w = 'red guide points at/away from camera (short)'
        else:
            w = 'red guide → ' + huong_man_hinh(dx, dy)
        w += ' (behind body)' if sau else ''
        ph.append(w)
    return ph


def d_vk(ma):
    return dt(ma)[8]


MO_HUONG = {
    's': ('facing DOWN toward the camera: front view, whole face visible, seen slightly from above',
          'Both shoulders are the same distance from the camera: an arm or leg that swings toward the camera is drawn in FRONT of the body, one that swings back is BEHIND it.'),
    'se': ('facing DOWN-RIGHT: 3/4 front view, face and chest visible, body turned to the right',
           'His RIGHT side (orange arm, yellow leg) is the NEAR side, closest to the camera; his LEFT side (purple arm, blue leg) is the FAR side, partly hidden behind the body.'),
    'e': ('facing RIGHT: side profile, we see his right side, one red eye visible',
          'His RIGHT side (orange arm, yellow leg) is NEAR the camera and drawn on top; his LEFT side (purple arm, blue leg) is FAR and drawn behind the body.'),
    'ne': ('facing UP-RIGHT: 3/4 back view, back of the head and back visible, only a sliver of the right cheek',
           'His RIGHT side (orange arm, yellow leg) is NEAR the camera; his LEFT side (purple arm, blue leg) is FAR, behind the body.'),
    'n': ('facing UP, away from the camera: back view, only the back of the head, hair and back are visible, no face',
          'Both shoulders are the same distance from the camera: an arm that reaches forward goes AWAY from the camera and is hidden BEHIND the body/head; an arm swinging back comes toward the camera, in FRONT.'),
}
MO_HUONG_VN = {
    's': 'Xuống (S) — thấy mặt. Hai vai cách camera như nhau: tay/chân vung tới (về phía camera) nằm TRƯỚC thân, vung lùi nằm SAU thân.',
    'se': 'Chéo xuống phải (SE) — thấy 3/4 mặt. Bên PHẢI (tay cam, chân vàng) GẦN camera = trước; bên TRÁI (tay tím, chân xanh) XA = sau.',
    'e': 'Phải (E) — nhìn nghiêng. Bên PHẢI (tay cam, chân vàng) GẦN camera = trước; bên TRÁI (tay tím, chân xanh) XA = sau thân.',
    'ne': 'Chéo lên phải (NE) — thấy 3/4 lưng. Bên PHẢI GẦN camera = trước; bên TRÁI XA = sau.',
    'n': 'Lên (N) — thấy lưng. Hai vai cách camera như nhau: tay vươn tới (xa camera) bị thân/đầu che = SAU; tay vung lùi (về phía camera) = TRƯỚC.',
    'sw': 'Chéo xuống trái (SW) = lật gương SE.', 'w': 'Trái (W) = lật gương E.', 'nw': 'Chéo lên trái (NW) = lật gương NE.',
}

TA_CU_TI = ("Cu Ti: chibi pixel-art boy, very big head (about 42% of body height), messy spiky black hair, red eyes, "
            "tan skin, short-sleeve black ninja gi, black wrist wraps, red belt tied in a knot with hanging ends, "
            "baggy black pants with black shin wraps, black sandals")


def prompt_hang(ma, h, rows):
    d = dt(ma)
    so, cham = d[3], d[7]
    mo, gan = MO_HUONG[h]
    vk = d[8]
    l = []
    l.append(f"Pixel-art sprite sheet of {TA_CU_TI}.")
    l.append(f"Action: {mo_ta_ten_en(ma)}. Top-down 3/4 game camera ~30° above, character {mo}.")
    l.append(f"{so} frames in ONE row, evenly spaced, 96x96 cells, feet on the SAME ground line, same head size every frame. "
             f"Flat background #00FF00, no shadow, no text.")
    l.append("Match the stick figure reference EXACTLY, frame by frame: orange = RIGHT arm, purple = LEFT arm, yellow = RIGHT leg, "
             "blue = LEFT leg (grey cap = hair, red dots = eyes). FRONT = in front of the body, BEHIND = hidden behind the body. "
             "Never swap hands or legs between frames.")
    l.append(gan)
    if vk and vk != 'phitieu':
        l.append(f"Red line = {TEN_VK_EN[vk]} direction only: do NOT draw the weapon, draw an empty right fist gripping along the red line.")
    elif vk == 'phitieu':
        l.append("Red star = tiny shuriken: draw only a closed right fist.")
    l.append("Frames:")
    for i, r in enumerate(rows):
        cap = r['en'].replace('HIT: ', '')
        sao = '★HIT ' if cham == i else ''
        l.append(f"{i + 1}. {sao}{cap} — " + '; '.join(r['tu_dong']) + '.')
    l.append("Same outfit, colors and proportions in every frame; smooth in-betweens, no jumps.")
    return '\n'.join(l)


def prompt_sua(ma, h):
    d = dt(ma)
    mo, gan = MO_HUONG[h]
    return (f"Edit the attached image of Cu Ti (frame N-1, {mo.split(':')[0]}) into frame N of \"{mo_ta_ten_en(ma)}\". "
            f"Match the attached stick figure kN.png exactly (orange = right arm, purple = left arm, yellow = right leg, blue = left leg). "
            f"Change ONLY the pose: <paste line N from the list>. Keep the same character, outfit, colors, size, head size and head position, "
            f"feet on the same ground line, background #00FF00, empty right fist, no weapon, no text.")


TEN_VK_EN = {'kiem': 'sword', 'thuong': 'spear', 'bua': 'two-handed hammer', 'phitieu': 'shuriken'}
TEN_EN = {
    '01-dung': 'idle breathing (ready stance, fists in front of the belly)', '02-di': 'walk cycle', '03-chay': 'run cycle',
    '04-lon': 'dodge roll forward', '05-trung-don': 'get hit (recoil)', '06-chet': 'death (fall on the back)',
    '07-chuong': 'two-palm energy push', '08-kiem-1': 'sword combo slash 1 (diagonal down)', '09-kiem-2': 'sword combo slash 2 (rising)',
    '10-kiem-3': 'sword combo slash 3 (jumping overhead chop)', '11-thuong-1': 'spear thrust 1', '12-thuong-2': 'spear thrust 2 (rising)',
    '13-thuong-3': 'spear thrust 3 (low lunge)', '14-thuong-quet': 'spear horizontal sweep', '15-thuong-giu': 'spear charge hold (loop)',
    '16-thuong-xoc': 'spear dash thrust', '17-bua-nen': 'two-handed hammer smash', '18-bua-giu': 'hammer charge hold (loop)',
    '19-bua-nen-dat': 'hammer ground slam', '20-phi-tieu': 'shuriken overhand throw', '21-phi-tieu-ngam': 'shuriken aim hold (loop)',
    '22-phi-tieu-chum': 'shuriken fan throw (backhand sweep)', '23-tram-nguyet': 'crescent moon sword slash (special)',
    '24-phi-thuong': 'javelin spear throw (special)', '25-dia-chan': 'earthquake hammer slam (special)',
    '26-mua-phi-tieu': 'shuriken rain, toss upward (special)', '27-dam': 'right punch',
}


def mo_ta_ten_en(ma):
    return TEN_EN[ma]


# ---------------- vẽ ----------------
def anh_hang(frames, d, S=4, nhan=True):
    so = len(frames)
    im = Image.new('RGB', (96 * S * so, 96 * S), ve.MAU['nen'])
    for i, (K, tt) in enumerate(frames):
        ve.ve_khung(K, tt, S=S, nhan=(i + 1) if nhan else None, sao=(d[7] == i), im=im, ox=i * 96 * S, ghi_so=nhan)
    if nhan:  # vạch chia ô mờ
        dr = ImageDraw.Draw(im)
        for i in range(1, so):
            dr.line([(i * 96 * S, 0), (i * 96 * S, 96 * S)], fill=(0, 215, 0), width=2)
    return im


def gif(frames, d, path, S=2):
    ims = []
    for i, (K, tt) in enumerate(frames):
        ims.append(ve.ve_khung(K, tt, S=S, nhan=i + 1, sao=(d[7] == i)).convert('P', palette=Image.ADAPTIVE, colors=32))
    dur = [max(20, int(round(t * 1000))) for t in thoi_luong(d)]
    if not d[5]:
        dur[-1] += 500  # động tác 1 lần: dừng 0,5 s ở khung cuối cho dễ xem
    ims[0].save(path, save_all=True, append_images=ims[1:], duration=dur, loop=0, disposal=2)


def la_ban(ma, khung, path, S=3, gif_path=None):
    """Tấm 8 hướng xếp vòng tròn la bàn."""
    d = dt(ma)
    pos = {'n': (1, 0), 'ne': (2, 0), 'e': (2, 1), 'se': (2, 2), 's': (1, 2), 'sw': (0, 2), 'w': (0, 1), 'nw': (0, 0)}
    C = 96 * S
    fn = ImageFont.truetype(ve.FONT, 9 * S)
    fn2 = ImageFont.truetype(ve.FONT, 6 * S)

    def mot(i):
        im = Image.new('RGB', (C * 3, C * 3 + 14 * S), ve.MAU['nen'])
        dr = ImageDraw.Draw(im)
        for h, (cx, cy) in pos.items():
            K, tt, P = ve.khung_2d(ma, i, h)
            ve.ve_khung(K, tt, S=S, im=im, ox=cx * C, oy=cy * C, ghi_so=False)
            dr.text((cx * C + 4 * S, cy * C + 3 * S), h.upper() + ('' if h in H5 else ' (gương)'), fill=(0, 0, 0), font=fn2)
        # tâm la bàn
        c = (1.5 * C, 1.5 * C)
        dr.ellipse([c[0] - 30 * S, c[1] - 30 * S, c[0] + 30 * S, c[1] + 30 * S], outline=(0, 0, 0), width=S)
        for h, (cx, cy) in pos.items():
            vx, vy = cx - 1, cy - 1
            n = math.hypot(vx, vy)
            dr.line([c, (c[0] + vx / n * 28 * S, c[1] + vy / n * 28 * S)], fill=(0, 0, 0), width=S)
        dr.text((c[0] - 30 * S, c[1] + 33 * S), d[2], fill=(0, 0, 0), font=fn2)
        dr.text((4 * S, C * 3 + 2 * S), f'Cu Tí — {d[2]} — khung {i + 1}/{d[3]} — 8 hướng (SW/W/NW = lật gương)', fill=(0, 0, 0), font=fn2)
        return im
    mot(khung).save(path)
    if gif_path:
        ims = [mot(i).resize((C * 3 // 2, (C * 3 + 14 * S) // 2), Image.NEAREST).convert('P', palette=Image.ADAPTIVE, colors=32) for i in range(d[3])]
        dur = [max(20, int(round(t * 1000))) for t in thoi_luong(d)]
        ims[0].save(gif_path, save_all=True, append_images=ims[1:], duration=dur, loop=0, disposal=2)


# ---------------- kiểm 2D (trên màn hình, từng hướng) ----------------
DOAN2D = [('vai_p', 'khuyu_p'), ('khuyu_p', 'co_tay_p'), ('vai_t', 'khuyu_t'), ('khuyu_t', 'co_tay_t'),
          ('hong_p', 'goi_p'), ('goi_p', 'co_chan_p'), ('hong_t', 'goi_t'), ('goi_t', 'co_chan_t'),
          ('eo', 'co'), ('co', 'dau'), ('vk_goc', 'vk_mui')]


def kiem_2d(d, data, bo_vk=True, nguong=0.7):
    """Góc xoay trên màn hình của mỗi đoạn xương giữa 2 khung liền nhau. Bỏ qua đoạn bị chiếu ngắn (< 50% dài thật,
    chĩa thẳng vào camera — góc 2D khi đó vô nghĩa)."""
    so, lap = d[3], d[5]
    cap = [(i, i + 1) for i in range(so - 1)] + ([(so - 1, 0)] if lap else [])
    kq = {}
    for h in H5:
        fr = data[h]
        m, o = 0.0, None
        for a, b in cap:
            for u, v in DOAN2D:
                if bo_vk and u == 'vk_goc':
                    continue
                A, B = fr[a]['khop'], fr[b]['khop']
                if not (A[u] and A[v] and B[u] and B[v]):
                    continue
                L3a = fr[a]['dai3'].get(u + v); L3b = fr[b]['dai3'].get(u + v)
                va = (A[v][0] - A[u][0], A[v][1] - A[u][1]); vb = (B[v][0] - B[u][0], B[v][1] - B[u][1])
                la, lb = math.hypot(*va), math.hypot(*vb)
                if not L3a or la < nguong * L3a or lb < nguong * L3b:
                    continue
                g = abs((math.degrees(math.atan2(vb[1], vb[0]) - math.atan2(va[1], va[0])) + 180) % 360 - 180)
                if g > m:
                    m, o = g, (a + 1, b + 1, u + '-' + v)
        kq[h] = (round(m, 1), o)
    return kq


# ---------------- chạy ----------------
def dung_dong_tac(ma):
    d = dt(ma)
    so = d[3]
    vn_en = mo_ta.MO_TA[ma]
    assert len(vn_en) == so, ma
    out = {}
    dur = thoi_luong(d)
    for h in H5:
        rows, frames = [], []
        for i in range(so):
            K, tt, P = ve.khung_2d(ma, i, h)
            frames.append((K, tt))
            dai3 = {}
            for u, v in DOAN2D:
                if u in P and v in P:
                    dai3[u + v] = round(float(X.np.linalg.norm(P[v] - P[u])), 2)
            rows.append(dict(i=i + 1, cham=(d[7] == i), giay=dur[i], vn=vn_en[i][0], en=vn_en[i][1],
                             khop={k: K[k] for k in X.KHOP}, phu={'got_p': [round(v, 2) for v in K['got_p'][:2]],
                                                                   'got_t': [round(v, 2) for v in K['got_t'][:2]],
                                                                   'toc': [round(v, 2) for v in K['_toc']], 'mat': K['_mat']},
                             thu_tu_ve=tt, truoc_sau=ve.truoc_sau(K, tt), tu_dong=tu_dong(ma, i, h, K, tt, P), dai3=dai3))
        out[h] = rows
        # JSON
        p = os.path.join(GOC_DIR, 'khop', ma); os.makedirs(p, exist_ok=True)
        js = dict(dong_tac=ma, ten=d[2], ten_trong_game=d[1], huong=h, ten_huong=X.TEN_HUONG[h], o=[96, 96], diem_cham_dat=[48, 90],
                  so_khung=so, giay_moi_khung=dur, tong_giay_game=d[4], lap=d[5], moc=d[6], khung_cham=(d[7] + 1 if d[7] is not None else None),
                  vu_khi=d[8], ghi_chu=d[10],
                  quy_uoc='toạ độ [x, y, sau] trong ô 96×96, gốc trên-trái; sau = độ gần camera (lớn = gần). Lật gương sang hướng trái: x -> 96 - x.',
                  khung=[{k: r[k] for k in ('i', 'cham', 'giay', 'vn', 'en', 'khop', 'phu', 'thu_tu_ve', 'truoc_sau', 'dai3')} for r in rows])
        with open(os.path.join(p, h + '.json'), 'w', encoding='utf-8') as f:
            json.dump(js, f, ensure_ascii=False, indent=1)
        # ảnh
        pa = os.path.join(GOC_DIR, 'anh', ma); os.makedirs(pa, exist_ok=True)
        anh_hang(frames, d, nhan=True).save(os.path.join(pa, h + '.png'), optimize=True)
        anh_hang(frames, d, nhan=False).save(os.path.join(pa, h + '-sach.png'), optimize=True)
        pk = os.path.join(pa, h); os.makedirs(pk, exist_ok=True)
        for i, (K, tt) in enumerate(frames):
            ve.ve_khung(K, tt, S=4, ghi_so=False).save(os.path.join(pk, f'k{i + 1}.png'), optimize=True)
        pg = os.path.join(GOC_DIR, 'gif', ma); os.makedirs(pg, exist_ok=True)
        gif(frames, d, os.path.join(pg, h + '.gif'))
    return out


def ghi_prompt(ma, data):
    d = dt(ma)
    p = os.path.join(GOC_DIR, 'prompt'); os.makedirs(p, exist_ok=True)
    l = [f'# Prompt gen Cu Tí — {d[2]} ({ma})', '',
         f'{d[3]} khung · {d[4]} giây · ' + (f'khung chạm ★ = khung {d[7] + 1}' if d[7] is not None else 'không có khung chạm') +
         (' · lặp vòng' if d[5] else '') + (f' · ghi chú: {d[10]}' if d[10] else ''), '',
         'Mỗi hướng có 2 cách: **A. gen cả hàng** (1 lần ra đủ khung) hoặc **B. sửa từng khung** (chính xác hơn: gen khung 1, '
         'rồi mỗi khung sau = sửa ảnh khung trước). Ảnh khung que nằm trong `../anh/' + ma + '/`.', '']
    for h in H5:
        l.append(f'## {X.TEN_HUONG[h]}')
        l.append('')
        mau = '`mau/cu-ti-dung-e-k1.png`' if h == 'e' else f'khung chuẩn {h.upper()} (bước 0, `prompt/00-khung-chuan.md`)'
        l.append(f'Gửi kèm: {mau} (mẫu nhân vật đúng hướng) + `mau/cu-ti-mau.png` + `anh/{ma}/{h}-sach.png` (khung que cả hàng, không số). '
                 f'Xem số khung/★ ở `anh/{ma}/{h}.png`, xem chuyển động ở `gif/{ma}/{h}.gif`.')
        l.append('')
        l.append('**A. Gen cả hàng**')
        l.append('')
        l.append('```')
        l.append(prompt_hang(ma, h, data[h]))
        l.append('```')
        l.append('')
        l.append(f'**B. Sửa khung trước** — gửi ảnh khung N−1 đã gen + `anh/{ma}/{h}/kN.png`, thay N và dán dòng N ở danh sách trên:')
        l.append('')
        l.append('```')
        l.append(prompt_sua(ma, h))
        l.append('```')
        l.append('')
    with open(os.path.join(p, ma + '.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(l))


def ghi_khung_chuan():
    p = os.path.join(GOC_DIR, 'prompt'); os.makedirs(p, exist_ok=True)
    buoc = [('e', None, 'Hướng PHẢI (E) đã có sẵn: lấy `mau/cu-ti-dung-e-k1.png` (khung 1 ảnh Đứng thở hiện có của Cu Tí, nhìn phải). Nếu muốn khớp khung que tuyệt đối thì sửa nhẹ theo `anh/01-dung/e/k1.png` bằng prompt dưới.'),
            ('se', 'e', 'Sửa từ khung chuẩn E: xoay người 45° về phía camera.'),
            ('s', 'se', 'Sửa từ khung chuẩn SE: xoay tiếp 45°, nhìn thẳng camera.'),
            ('ne', 'e', 'Sửa từ khung chuẩn E: xoay người 45° quay lưng vào trong.'),
            ('n', 'ne', 'Sửa từ khung chuẩn NE: xoay tiếp 45°, quay lưng hẳn.')]
    L = ['# Bước 0 — khung chuẩn mỗi hướng (gen TRƯỚC mọi động tác)', '',
         'Bài học cũ: gen "vẽ lại từ khung que" chỉ khớp dáng 45–65%; gen "sửa ảnh gốc, giữ dáng" khớp 92–94%. '
         'Vì vậy mỗi hướng chỉ gen **1 khung chuẩn** (đứng thủ, khung 1 của Đứng thở) bằng cách **sửa ảnh** khung chuẩn hướng bên cạnh '
         '(mỗi lần chỉ xoay 45°), rồi mọi khung khác của hướng đó = sửa ảnh khung trước theo khung que.', '',
         'Chuỗi: **E (có sẵn) → SE → S** và **E → NE → N**. 3 hướng trái (SW/W/NW) không gen: game lật gương SE/E/NE.', '']
    for h, tu, ghi in buoc:
        mo, gan = MO_HUONG[h]
        L += [f'## {X.TEN_HUONG[h]}', '', ghi, '']
        gui = '`mau/cu-ti-mau.png` + ' + (f'khung chuẩn {tu.upper()} đã gen + ' if tu else '`mau/cu-ti-dung-e-k1.png` + ') + f'`anh/01-dung/{h}/k1.png`'
        L += [f'Gửi kèm: {gui}', '', '```',
              f"Edit the attached image of {TA_CU_TI}. Turn him so he is {mo}. "
              f"Pose = ready stance, match the attached stick figure exactly (orange = right arm, purple = left arm, yellow = right leg, blue = left leg). {gan} "
              "Keep the exact same character, outfit, colors, pixel style, head size and body proportions as the reference. "
              "One single figure in a 96x96 cell, feet on the ground line at the bottom, flat background #00FF00, empty fists, no weapon, no shadow, no text.",
              '```', '']
    with open(os.path.join(p, '00-khung-chuan.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(L))


def main(chon):
    ghi_khung_chuan()
    tat = {}
    for d in DT.DS:
        ma = d[0]
        if chon and ma not in chon:
            continue
        data = dung_dong_tac(ma)
        ghi_prompt(ma, data)
        tat[ma] = data
        print('xong', ma)
    if not chon or '01-dung' in chon:
        la_ban('01-dung', 0, os.path.join(GOC_DIR, 'la-ban-dung.png'), gif_path=os.path.join(GOC_DIR, 'la-ban-dung.gif'))
    if not chon or '03-chay' in chon:
        la_ban('03-chay', 0, os.path.join(GOC_DIR, 'la-ban-chay.png'), gif_path=os.path.join(GOC_DIR, 'la-ban-chay.gif'))
    # bảng kiểm + dữ liệu trang xem: gom từ JSON đã có trên đĩa
    import xem
    xem.dung(GOC_DIR)


if __name__ == '__main__':
    main(sys.argv[1:])
