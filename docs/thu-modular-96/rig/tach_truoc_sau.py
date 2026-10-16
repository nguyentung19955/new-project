"""Che theo độ sâu (16/10 chiều): tạo ảnh tách TRƯỚC/SAU cho từng mảnh giáp + nhãn lớp người cho mọi động tác.

tao-rig.py gọi 2 hàm:
  tach_giap(rig)            -> ghi giap/tach/*.png, giap-gen/tach/*.png; thêm "depth" vào từng mảnh trong rig
  nhan_nguoi(acts, data, lay) -> ghi nhan/<động tác>.png (mỗi điểm ảnh người: kênh R = số lớp 1..7)

Không đụng ảnh nguồn: chỉ ĐỌC ảnh mảnh giáp đã có trong rig/ và sheet người; mọi tệp mới nằm trong rig/.

Quy tắc tách (toạ độ trong ảnh mảnh: trục x = chiều xương, đầu xương bên trái; tâm điểm ảnh = (x+0,5; y+0,5)):
  - Giáp ngực:  "cổ áo"  = các cột gần cổ (tâm x < anchorStart.x + 2,2)  -> lượt SAU
                "mép lưng" = điểm ảnh ngoài cùng mỗi cột ở phía lưng (y0 hoặc y1, chọn theo khung) -> lượt SAU
                còn lại (mặt ngực) -> lượt TRƯỚC
  - Giáp vai:   "mép trong" = các cột phía khớp vai (tâm x < anchorStart.x + 0,5), sát cổ/thân -> lượt SAU; vỏ ngoài -> TRƯỚC
  - Cẳng tay / ống chân: nửa phía thân (y < trục hoặc y > trục, chọn theo khung) -> lượt SAU (dưới lớp chi); nửa ngoài + hàng giữa -> TRƯỚC
  - Chụp khớp: không tách (luôn nằm trên lớp chi của nó).
Nhiều "biến thể" (variants) cho 1 mảnh; trang chọn biến thể theo từng khung (tự động từ khớp, hoặc frameOverrides).
"""
import json, math, os
from PIL import Image

RIG = os.path.dirname(os.path.abspath(__file__))

# Lớp người giả (từ sau ra trước). Ảnh nhãn ghi số thứ tự 1..7 theo danh sách này.
LORDER = ['rearLeg', 'rearArm', 'body', 'neck', 'frontLeg', 'frontArm', 'head']
LNAME = {'rearLeg': 'chân sau', 'rearArm': 'tay sau', 'body': 'thân', 'neck': 'cổ', 'frontLeg': 'chân trước',
         'frontArm': 'tay trước', 'head': 'đầu + tóc + cằm'}
LCOL = {'rearLeg': (150, 0, 150), 'rearArm': (230, 60, 230), 'body': (0, 170, 0), 'neck': (255, 40, 40),
        'frontLeg': (30, 60, 220), 'frontArm': (0, 210, 255), 'head': (255, 190, 0)}
# lớp thật của data.json -> lớp người giả (hàng chạy)
TU_LOP = {'rearLeg': 'rearLeg', 'rearPants': 'rearLeg', 'rearArm': 'rearArm', 'body': 'body', 'pants': 'body',
          'torsoOutfit': 'body', 'belt': 'body', 'frontLeg': 'frontLeg', 'frontPants': 'frontLeg', 'frontArm': 'frontArm',
          'head': 'head', 'hair': 'head'}

# Độ sâu từng mảnh (theo id; dùng chung cho 2 bộ).
#  backAfter/frontAfter: lượt sau/trước vẽ NGAY SAU lớp người này ('' = trước mọi lớp người).
#  che: lớp người phải nằm TRƯỚC mảnh này (cách "Che bằng lớp người" vẽ lại các lớp này lên trên mảnh; cũng là thước đo "đè sai").
#  limb: lớp chi của khớp (đo hở ở chế độ che theo độ sâu).
SAU_HET = ['body', 'neck', 'frontLeg', 'frontArm', 'head']
DEPTH = {
    'vaiSau':        dict(rule='vai', backAfter='rearLeg', frontAfter='rearArm', che=SAU_HET, limb='rearArm'),
    'cangTaySau':    dict(rule='chi', backAfter='rearLeg', frontAfter='rearArm', che=SAU_HET, limb='rearArm'),
    'chupVaiSau':    dict(frontAfter='rearArm', che=SAU_HET, limb='rearArm'),
    'chupKhuyuSau':  dict(frontAfter='rearArm', che=SAU_HET, limb='rearArm'),
    'ongChanSau':    dict(rule='chi', backAfter='', frontAfter='rearLeg', che=['rearArm'] + SAU_HET, limb='rearLeg'),
    'chupGoiSau':    dict(frontAfter='rearLeg', che=['rearArm'] + SAU_HET, limb='rearLeg'),
    'nguc':          dict(rule='nguc', backAfter='body', frontAfter='neck', che=['neck', 'frontLeg', 'frontArm', 'head'], limb='body'),
    'ongChanTruoc':  dict(rule='chi', backAfter='neck', frontAfter='frontLeg', che=[], limb='frontLeg'),
    'chupGoiTruoc':  dict(frontAfter='frontLeg', che=[], limb='frontLeg'),
    'cangTayTruoc':  dict(rule='chi', backAfter='frontLeg', frontAfter='frontArm', che=['head'], limb='frontArm'),
    'vaiTruoc':      dict(rule='vai', backAfter='body', frontAfter='frontArm', che=['neck', 'head'], limb='frontArm'),
    'chupKhuyuTruoc': dict(frontAfter='frontArm', che=['head'], limb='frontArm'),
    'chupVaiTruoc':  dict(frontAfter='frontArm', che=['head'], limb='frontArm'),
}


def _mat_na(im, s, a0, rule):
    """trả {biến thể: tập điểm ảnh lượt SAU} cho ảnh im (cỡ ×s so với neo a0)."""
    w, h = im.size
    A = im.getchannel('A').load()
    op = [(x, y) for y in range(h) for x in range(w) if A[x, y]]
    ax, ay = a0[0] * s, a0[1] * s
    if rule == 'chi':
        return {'trong-y0': {(x, y) for x, y in op if y + .5 < ay - 1e-6},
                'trong-y1': {(x, y) for x, y in op if y + .5 > ay + 1e-6}}
    if rule == 'vai':
        return {'vien': {(x, y) for x, y in op if x + .5 < ax + 0.5 * s}}
    if rule == 'nguc':
        co = {(x, y) for x, y in op if x + .5 < ax + 2.2 * s}
        cols = {}
        for x, y in op:
            cols.setdefault(x, []).append(y)
        lung0 = set()
        lung1 = set()
        for x, ys in cols.items():
            for k in range(s):          # bản ×2: mép dày 2 điểm ảnh
                ys2 = sorted(ys)
                if k < len(ys2):
                    lung0.add((x, ys2[k]))
                    lung1.add((x, ys2[-1 - k]))
        return {'co': co, 'co-lung-y0': co | lung0, 'co-lung-y1': co | lung1}
    raise ValueError(rule)


def _cat(im, keep):
    out = Image.new('RGBA', im.size, (0, 0, 0, 0))
    P, Q = im.load(), out.load()
    for (x, y) in keep:
        Q[x, y] = P[x, y]
    return out


def tach_giap(rig):
    """tạo ảnh tách cho mọi mảnh xương của 2 bộ; gắn piece['depth']. Trả số ảnh đã ghi."""
    n = 0
    bo = [('may', 'giap', rig['images'], {}, rig['pieces'])]
    g = rig['armorSets']['gen']
    bo.append(('gen', 'giap-gen', g['images'], g.get('imagesX2', {}), g['pieces']))
    stats = {}
    for sk, thu_muc, images, images2, pieces in bo:
        os.makedirs(os.path.join(RIG, thu_muc, 'tach'), exist_ok=True)
        for p in pieces:
            d = dict(DEPTH[p['id']])
            if p['kind'] == 'cap' or 'rule' not in d:
                d.pop('rule', None)
                p['depth'] = d
                continue
            im = Image.open(os.path.join(RIG, images[p['image']])).convert('RGBA')
            im2 = Image.open(os.path.join(RIG, images2[p['image']])).convert('RGBA') if p['image'] in images2 else None
            m1 = _mat_na(im, 1, p['anchorStart'], d['rule'])
            m2 = _mat_na(im2, 2, p['anchorStart'], d['rule']) if im2 else None
            tong = sum(1 for y in range(im.height) for x in range(im.width) if im.getpixel((x, y))[3])
            d['variants'] = {}
            for v, back in m1.items():
                ten = '%s-%s' % (p['image'], v)
                rec = {}
                for tag, I, M in (('', im, back), ('-x2', im2, m2[v] if m2 else None)):
                    if I is None:
                        continue
                    allp = {(x, y) for y in range(I.height) for x in range(I.width) if I.getpixel((x, y))[3]}
                    fb = 'tach/%s-sau%s.png' % (ten, tag)
                    ff = 'tach/%s-truoc%s.png' % (ten, tag)
                    _cat(I, M).save(os.path.join(RIG, thu_muc, fb))
                    _cat(I, allp - M).save(os.path.join(RIG, thu_muc, ff))
                    n += 2
                    rec['backImage' + ('X2' if tag else '')] = thu_muc + '/' + fb
                    rec['frontImage' + ('X2' if tag else '')] = thu_muc + '/' + ff
                rec['backPixels'] = len(back)
                rec['totalPixels'] = tong
                d['variants'][v] = rec
                stats['%s:%s:%s' % (sk, p['image'], v)] = '%d/%d' % (len(back), tong)
            p['depth'] = d
    return n, stats


# ---------------- nhãn lớp người ----------------
def _seg(px, py, a, b):
    ax, ay = a
    bx, by = b
    dx, dy = bx - ax, by - ay
    L2 = dx * dx + dy * dy
    t = 0 if L2 == 0 else max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / L2))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def _ok(J, n, hid):
    v = J.get(n)
    return isinstance(v, list) and len(v) == 2 and None not in v and n not in hid


def _truc_than(J):
    nk, hc = J['neck'], J['hipCenter']
    L = math.hypot(hc[0] - nk[0], hc[1] - nk[1]) or 1
    return nk, ((hc[0] - nk[0]) / L, (hc[1] - nk[1]) / L)


def _la_co(J, px, py):
    """điểm ảnh (tâm px,py) thuộc vùng cổ: ngay dưới cằm, trên vai (theo trục thân)."""
    if not (_ok(J, 'neck', ()) and _ok(J, 'hipCenter', ())):
        return False
    nk, u = _truc_than(J)
    t = (px - nk[0]) * u[0] + (py - nk[1]) * u[1]
    lat = abs((px - nk[0]) * u[1] - (py - nk[1]) * u[0])
    return -4.0 <= t <= 1.5 and lat <= 3.0


def _nhan_khung_sheet(J, hid, alpha_at, w, h):
    """gán nhãn điểm ảnh người theo 'ống xương' gần nhất (cho sheet cả người, chưa tách lớp)."""
    caps = []   # (nhãn, A, B, bán kính, ưu tiên)

    def add(lb, a, b, r, pr):
        if _ok(J, a, hid) and _ok(J, b, hid):
            caps.append((lb, J[a], J[b], r, pr))
    add('frontArm', 'shoulderFront', 'elbowFront', 2.0, 0)
    add('frontArm', 'elbowFront', 'wristFront', 2.0, 0)
    add('frontArm', 'wristFront', 'handFront', 2.3, 0)
    add('frontLeg', 'hipFront', 'kneeFront', 2.8, 2)
    add('frontLeg', 'kneeFront', 'ankleFront', 2.4, 2)
    add('frontLeg', 'ankleFront', 'toeFront', 2.0, 2)
    add('body', 'neck', 'hipCenter', 5.0, 4)
    add('rearArm', 'shoulderBack', 'elbowBack', 2.0, 5)
    add('rearArm', 'elbowBack', 'wristBack', 2.0, 5)
    add('rearArm', 'wristBack', 'handBack', 2.3, 5)
    add('rearLeg', 'hipBack', 'kneeBack', 2.8, 6)
    add('rearLeg', 'kneeBack', 'ankleBack', 2.4, 6)
    add('rearLeg', 'ankleBack', 'toeBack', 2.0, 6)
    co_truc = _ok(J, 'neck', ()) and _ok(J, 'hipCenter', ())
    lab = {}
    for y in range(h):
        for x in range(w):
            if not alpha_at(x, y):
                continue
            px, py = x + .5, y + .5
            # đầu: phía trên cổ theo trục thân (cách cổ > 1đ về phía đầu)
            if co_truc:
                nk, u = _truc_than(J)
                t = (px - nk[0]) * u[0] + (py - nk[1]) * u[1]
            else:
                t = 0
            best = None
            for lb, a, b, r, pr in caps:
                dd = _seg(px, py, a, b)
                if dd <= r and (best is None or pr < best[1] or (pr == best[1] and dd < best[2])):
                    best = (lb, pr, dd)
            if best and best[0] == 'frontArm':
                lab[(x, y)] = 'frontArm'
                continue
            if co_truc and t < -4.0:
                lab[(x, y)] = 'head'
                continue
            if co_truc and _la_co(J, px, py):
                lab[(x, y)] = 'neck'
                continue
            if best:
                lab[(x, y)] = best[0]
                continue
            # ngoài mọi ống: lấy ống gần nhất (trừ bán kính)
            bb = min(((_seg(px, py, a, b) - r, lb) for lb, a, b, r, pr in caps), default=(0, 'body'))
            lab[(x, y)] = bb[1] if caps else 'body'
    return lab


def nhan_nguoi(acts, frames_chay, layers_chay, W=96, H=96):
    """acts: [{key, frames, hiddenSets, sheet(PIL)}]; frames_chay: khớp hàng chạy; layers_chay: [(tên lớp thật, PIL sheet)].
    Ghi nhan/<key>.png + trả thống kê {key: {nhãn: số điểm ảnh}}."""
    os.makedirs(os.path.join(RIG, 'nhan'), exist_ok=True)
    out = {}
    jobs = [('chay', frames_chay, [set() for _ in frames_chay], None)] + [(a['key'], a['frames'], a['hid'], a['sheet']) for a in acts]
    for key, frames, hids, sheet in jobs:
        N = len(frames)
        im = Image.new('RGBA', (W * N, H), (0, 0, 0, 0))
        P = im.load()
        st = {l: 0 for l in LORDER}
        for f in range(N):
            J = frames[f]['joints']
            if sheet is None:
                top = {}
                for ten, sh in layers_chay:
                    A = sh.getchannel('A').load()
                    for y in range(H):
                        for x in range(W):
                            if A[f * W + x, y]:
                                top[(x, y)] = TU_LOP[ten]
                lab = {}
                for (x, y), lb in top.items():
                    if lb in ('body',) and _la_co(J, x + .5, y + .5):
                        lb = 'neck'
                    lab[(x, y)] = lb
            else:
                A = sheet.getchannel('A').load()
                lab = _nhan_khung_sheet(J, hids[f], lambda x, y: A[f * W + x, y] > 0, W, H)
            for (x, y), lb in lab.items():
                i = LORDER.index(lb) + 1
                P[f * W + x, y] = (i, 0, 0, 255)
                st[lb] += 1
        im.save(os.path.join(RIG, 'nhan', key + '.png'))
        out[key] = st
    return out


def soat_nhan(keys, sheets, W=96, H=96, k=4, nmax=8):
    """ảnh soát nhãn: hàng = động tác; mỗi khung: người | nhãn tô màu. Ghi soat/nhan-lop-nguoi.png"""
    rows = []
    for key in keys:
        lb = Image.open(os.path.join(RIG, 'nhan', key + '.png')).convert('RGBA')
        sh = sheets[key]
        N = lb.width // W
        fs = list(range(N))[:nmax]
        row = Image.new('RGBA', (len(fs) * 2 * 60 * k, 72 * k), (235, 235, 235, 255))
        for i, f in enumerate(fs):
            p = sh.crop((f * W + 18, 20, f * W + 78, 92))
            c = Image.new('RGBA', (60, 72), (0, 0, 0, 0))
            L = lb.crop((f * W + 18, 20, f * W + 78, 92)).load()
            C = c.load()
            for y in range(72):
                for x in range(60):
                    r, _, _, a = L[x, y]
                    if a:
                        C[x, y] = LCOL[LORDER[r - 1]] + (255,)
            row.alpha_composite(p.resize((60 * k, 72 * k), Image.NEAREST), (i * 120 * k, 0))
            row.alpha_composite(c.resize((60 * k, 72 * k), Image.NEAREST), (i * 120 * k + 60 * k, 0))
        rows.append(row)
    Wt = max(r.width for r in rows)
    out = Image.new('RGBA', (Wt, sum(r.height for r in rows)), (255, 255, 255, 255))
    y = 0
    for r in rows:
        out.alpha_composite(r, (0, y))
        y += r.height
    os.makedirs(os.path.join(RIG, 'soat'), exist_ok=True)
    out.convert('RGB').save(os.path.join(RIG, 'soat', 'nhan-lop-nguoi.png'), optimize=True)
