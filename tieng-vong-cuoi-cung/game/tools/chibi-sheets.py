#!/usr/bin/env python3
"""Ghép sheet chibi cho demo 960×540 (CHỈ ĐỌC art/chibi):

  game/anim/lam-chibi.png + .json   Lam (từ art/chibi/lam/khung-chuan/, cỡ đồng nhất theo mũ trùm)
  game/anim/quai-boss.png + .json   Quái Chuông Gỗ (ô 171, pivot [85.5,167]) + boss Chuông Gác Làng (ô 412, pivot [206,402])
  game/anim/the-gioi.png + .json    mảnh tileset rễ cây (cỡ game, giảm tương phản 10 %) + đồ vật

Mỗi khung được CẮT SÁT (bỏ lề trong suốt) rồi xếp kệ; json ghi [x, y, w, h, ox, oy]
với (ox, oy) = góc trên-trái của hình so với PIVOT (giữa đế ủng / đáy giữa), đơn vị px game.
Hệ toạ độ vẫn là "ô 240, pivot [120, 234]" của Lam: 640 px ô khung-chuan → 300 px (×0,46875 = 240/512).

Quy tắc căn MỚI (docs/fix-animation.md, thay quy tắc "khoá mắt / khoá gót" cũ): mỗi bước có dx, dy (px game):
  - NGANG: mọi khung Lam đặt TÂM THÂN (trọng tâm vùng thân dưới mắt, không tính dao) đúng trên pivot (x = 0).
    Cùng một mốc cho MỌI animation → đổi animation / lật mặt không làm người trượt ngang.
    Đầu, tay, chân vẫn chuyển động tự do như ảnh (dao động tự nhiên của chạy được giữ).
  - DỌC dưới đất: đế ủng thấp nhất (không tính dao) chạm pivot (y = 0). KHÔNG cộng độ cao giả.
  - DỌC trên không (jump 2–4, bám tường, chém nảy, chém xoay): tâm thân cao bằng tâm thân của jump/2
    (khung duỗi chân, đế chạm pivot); đế không bao giờ thấp hơn pivot. Độ cao nhảy chỉ do vật lý.
  - Quái / boss: giữ đúng vị trí ô gốc (dx = 0) – đo cho thấy ô gốc đã ổn định, khoá mắt cũ làm quái giật 14 px.
  - Hitbox đòn giữ NGUYÊN số cũ (không đổi chiến đấu).
Thời lượng từng bước (ms) khác nhau: chuẩn bị 120, vung 60, chạm 140 (hitbox bật), thu 140.

Chạy: python3 game/tools/chibi-sheets.py
"""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
ART = os.path.normpath(os.path.join(GAME, '..', 'art', 'chibi'))
OUT = os.path.join(GAME, 'anim')
KC = os.path.join(ART, 'lam', 'khung-chuan')
K = 240 / 512                      # khung-chuan px → px game
PV = (320 * K, 620 * K)            # pivot trong ô 300 (150, 290.625)


def premul_resize(im, size):
    return im.convert('RGBa').resize(size, Image.LANCZOS).convert('RGBA')


def cat_sat(im):
    a = np.asarray(im)[..., 3]
    ys = np.where(a.max(1) > 3)[0]; xs = np.where(a.max(0) > 3)[0]
    x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1
    return im.crop((x0, y0, x1, y1)), x0, y0


class Ke:
    """xếp kệ đơn giản (shelf packing)."""
    def __init__(self, rong=2048, le=2):
        self.r, self.le, self.x, self.y, self.h, self.ds = rong, le, 0, 0, 0, []

    def them(self, im):
        w, h = im.size
        if self.x + w + self.le > self.r:
            self.x, self.y, self.h = 0, self.y + self.h + self.le, 0
        pos = (self.x, self.y)
        self.ds.append((im, pos))
        self.x += w + self.le; self.h = max(self.h, h)
        return pos

    def anh(self):
        H = self.y + self.h
        H = (H + 3) // 4 * 4
        out = Image.new('RGBA', (self.r, H), (0, 0, 0, 0))
        for im, p in self.ds:
            out.alpha_composite(im, p)
        return out


def mask_dao(a):
    """lưỡi dao: xám bạc sáng, ít bão hoà."""
    rgb = a[..., :3].astype(int)
    sat = rgb.max(-1) - rgb.min(-1)
    lum = rgb.mean(-1)
    m = (a[..., 3] > 160) & (sat < 30) & (lum > 135)
    lab, n = ndi.label(ndi.binary_closing(m, iterations=2) & (a[..., 3] > 160))
    if not n:
        return m & False
    sz = ndi.sum(m, lab, range(1, n + 1))
    i = int(np.argmax(sz)) + 1
    ys, xs = np.where(lab == i)
    # lưỡi dao: mảng lớn nhất, đủ dài (≥ 12 % ô) – nếu không thì coi như không có dao
    if max(np.ptp(xs), np.ptp(ys)) < a.shape[0] * 0.12:
        return m & False
    return lab == i


def mask_ung(a):
    rgb = a[..., :3].astype(int)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return (a[..., 3] > 200) & (r > 60) & (r > g + 12) & (g > b + 4) & (r < 200)


# ------------------------------------------------------------------ LAM
def lam():
    so_do = json.load(open(os.path.join(KC, 'khung-chuan.json'), encoding='utf-8'))
    ke = Ke()
    frames, info, moc = {}, {}, {}

    def nap(key):
        if key in frames:
            return
        nm, so = key.split('/')
        im512 = Image.open(os.path.join(KC, nm, 'khung-%s.png' % so)).convert('RGBA')
        a640 = np.asarray(im512)
        dao = mask_dao(a640)
        al = (a640[..., 3] > 128) & ~ndi.binary_dilation(dao, iterations=4)
        ung = mask_ung(a640) & al
        yu = np.where(ung.any(1))[0]
        dayu = yu.max(); band = max(6, int((dayu - np.where(al.any(1))[0].min()) * 0.05))
        xs = np.where(ung[dayu - band:dayu + 1].any(0))[0]
        got = float(xs.min())                       # gót sau = mép sau đế ủng thấp nhất (không tính dao)
        than = float(np.median(np.where(al)[1]))    # (cũ) trung vị ngang toàn thân
        kk = so_do['tam'][nm]['khung'][int(so) - 1]
        ys_, xs_ = np.where(al); top, day = ys_.min(), ys_.max()
        ey = kk['mat'][1] if kk['mat'] else top + 0.3 * (day - top)
        y0 = int(ey); y1 = int(y0 + 0.55 * (day - y0))
        by, bx = np.where(al[y0:y1])
        tx, ty = float(bx.mean()), float(by.mean() + y0)   # TÂM THÂN: trọng tâm dải mắt → 55 % xuống chân
        im = premul_resize(im512, (300, 300))
        a = np.asarray(im)
        d = mask_dao(a)
        dao_box = None
        if d.sum() > 20:
            yy, xx = np.where(d)
            dao_box = [float(xx.min() - PV[0]), float(yy.min() - PV[1]), float(xx.max() + 1 - PV[0]), float(yy.max() + 1 - PV[1])]
        crop, x0, y0 = cat_sat(im)
        pos = ke.them(crop)
        frames[key] = [pos[0], pos[1], crop.width, crop.height, round(x0 - PV[0], 2), round(y0 - PV[1], 2)]
        info[key] = dict(mat=kk['mat'], got=got, than=than, dao=dao_box, tx=tx, ty=ty, top=float(top), day=float(day))
        g = lambda v, o: round((v - o) * K, 1)
        moc[key] = dict(tx=g(tx, 320), ty=g(ty, 620), dinh=g(top, 620), de=g(day, 620),
                        mat=[g(kk['mat'][0], 320), g(kk['mat'][1], 620)] if kk['mat'] else None,
                        mu=round(kk['mu'] * K, 1) if kk['mu'] else None)

    # (tên, kiểu khoá, [(khung, ms, thêm)])
    def seq(*ds):
        return [dict(f=f, ms=ms, **(x[0] if x else {})) for f, ms, *x in ds]
    HIT = {'hit': True}
    ANIMS = {
        'idle':   ('mat', seq(('idle/1', 125), ('idle/2', 125), ('idle/3', 125), ('idle/4', 125), ('idle/3', 125), ('idle/2', 125)), True,
                   'idle 8 FPS phát 1-2-3-4-3-2 (khung 5≈1, 6≈2 trong ảnh gốc nên bỏ) để giảm nhấp dọc.'),
        'run':    ('mat', seq(*[('run8/%d' % i, 83) for i in range(1, 9)]), True, 'run-8, 12 FPS.'),
        'jump':   ('mat', seq(('jump/1', 100), ('jump/2', 100), ('jump/3', 100), ('jump/4', 100)), False,
                   'chọn khung theo vận tốc: 1 khuỵu lúc bật, 2 lên, 3 đỉnh, 4 rơi.'),
        'rutdao': ('got', seq(('rut-dao/1', 140), ('rut-dao/2', 140), ('rut-dao/3', 120), ('rut-dao/4', 100), ('rut-dao/5', 100), ('rut-dao/6', 260)), False,
                   'Rút dao khi vào ải (đầu màn, sau hồi sinh). Khoá điều khiển trong lúc phát.'),
        # combo (đòn 1–3 dưới đất), chém nảy, chém hất, chém trên không
        'atk1':   ('got', seq(('combo-3/1', 120), ('combo-3/2', 60), ('combo-3/3', 140, HIT), ('combo-3/4', 140)), False, 'Đòn 1 = combo-3 (đâm).'),
        'atk2':   ('got', seq(('combo-1/2', 120), ('combo-1/3', 60), ('combo-1/4', 140, HIT), ('combo-1/3', 140)), False,
                   'Đòn 2 = combo-1 bỏ khung 1 (khung 1 dao ở tay sau). Thu = khung 3.'),
        'atk3':   ('than', seq(('combo-4/1', 120), ('combo-4/2', 60), ('combo-4/3', 140, HIT), ('combo-4/4', 140),
                              ('combo-5/1', 140)), False,
                   'Đòn 3 = combo-4 bổ xuống; KHÔNG cộng độ cao giả (vật lý đòn 3 không nhảy). Sau đòn 1 khung combo-5/1 thu thế.'),
        'atk4':   ('than', seq(('combo-4/3', 183, HIT), ('combo-4/4', 67)), False, 'Chém nảy (↓+Chém trên không) = combo-4 khung 3–4.'),
        'atk5':   ('got', seq(('combo-3/1', 120), ('combo-3/2', 60), ('combo-3/4', 140, HIT), ('combo-5/1', 140)), False,
                   'Chém hất (↑+Chém) = combo-3 khung 1, 2, 4 (dao giơ chéo lên) + thu combo-5/1.'),
        'atk6':   ('than', seq(('combo-2/1', 50), ('combo-2/2', 50), ('combo-2/3', 50), ('combo-2/4', 140, HIT), ('combo-2/4', 60)), False,
                   'Đòn trên không = combo-2 (xoay). Khoá theo tâm thân (mắt khung 2 nhìn lưng không đo được).'),
        # TẠM: dùng khung có sẵn
        'dash':   ('mat', seq(('run8/1', 100)), True, 'TẠM: lướt = run8 khung 1 (chưa có sheet lướt).'),
        'land':   ('mat', seq(('jump/1', 100)), False, 'Tiếp đất = jump khung 1 (khuỵu).'),
        'hurt':   ('mat', seq(('jump/1', 100)), False, 'TẠM: bị đánh = jump khung 1 (khuỵu) + nháy.'),
        'wall':   ('mat', seq(('jump/4', 100)), True, 'TẠM: bám tường = jump khung 4.'),
        'dead':   ('mat', seq(('jump/1', 100)), False, 'TẠM: chết = jump khung 1, mờ dần.'),
    }
    for nm, (kh, sq, loop, ghi) in ANIMS.items():
        for st in sq:
            nap(st['f'])
    TREN_KHONG = {'jump', 'wall', 'atk4', 'atk6'}           # animation phát khi ở trên không
    j2 = info['jump/2']; T_AIR = (j2['ty'] - j2['day']) * K   # tâm thân so với đế, khung duỗi chân
    # hitbox đòn: GIỮ NGUYÊN số cũ (so với chân, mặt phải) – không đổi chiến đấu
    HOP = {'atk1': [4, -97, 147, 48], 'atk2': [-36, -100, 116, 48], 'atk3': [-13, -59, 99, 64],
           'atk4': [-26, -24, 64, 82], 'atk5': [-9, -140, 97, 60], 'atk6': [-3, -107, 127, 48]}
    out = {}
    for nm, (kh, sq, loop, ghi) in ANIMS.items():
        buoc = []
        for i, s_ in enumerate(sq):
            f = info[s_['f']]
            dx = -(f['tx'] - 320) * K                       # tâm thân lên pivot
            de = (f['day'] - 620) * K                       # đế so với pivot (âm = cao hơn)
            if nm in TREN_KHONG and not (nm == 'jump' and i == 0):
                dy = min(T_AIR - (f['ty'] - 620) * K, -de)  # tâm thân ở độ cao cố định, đế không xuống dưới pivot
            else:
                dy = -de                                    # đế chạm pivot
            b = dict(f=s_['f'], ms=s_['ms'], dx=round(dx, 2), dy=round(dy, 2))
            if s_.get('hit'):
                b['hit'] = True
                b['box'] = HOP[nm] if nm in HOP else None
            buoc.append(b)
        out[nm] = dict(khoa='tâm thân (ngang) + ' + ('tâm thân cố định trên không' if nm in TREN_KHONG else 'đế ủng chạm đất (dọc)'),
                       loop=loop, buoc=buoc, ghiChu=ghi)
    # chém nảy: hộp dưới chân (giữ tầm với của bản cũ)
    sheet = ke.anh()
    sheet.save(os.path.join(OUT, 'lam-chibi.png'), optimize=True)
    meta = dict(version=2, image='lam-chibi.png', donVi='px game (960×540)', tiLe=K,
                pivotGoc='ô 240, pivot [120, 234] = giữa đế ủng; frames: [x, y, w, h, ox, oy] (ox, oy = góc hình so với pivot)',
                nguon='art/chibi/lam/khung-chuan (cỡ đồng nhất theo mũ trùm, xem khung-chuan.json)',
                frames=frames, moc=moc, anims=out)
    json.dump(meta, open(os.path.join(OUT, 'lam-chibi.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('lam-chibi.png', sheet.size, os.path.getsize(os.path.join(OUT, 'lam-chibi.png')) // 1024, 'KB')
    for nm, a in out.items():
        print(' ', nm, [(b['f'], b['dx'], b.get('box')) for b in a['buoc']])


# ------------------------------------------------------------------ QUÁI + BOSS
def mat_quai(a):
    rgb = a[..., :3].astype(int)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    m = (a[..., 3] > 200) & (r > 200) & (g > 170) & (b < 170)
    if m.sum() < 3:
        return None
    lab, n = ndi.label(m)
    sz = ndi.sum(m, lab, range(1, n + 1))
    i = np.argmax(sz) + 1
    ys, xs = np.where(lab == i)
    return float(xs.mean()), float(ys.mean())


def quai_boss():
    ke = Ke()
    frames = {}
    info = {}
    Q = os.path.join(ART, 'quai', 'khung')
    QP = (85.5, 167.0)
    for nm, n in [('di', 4), ('tan-cong', 4), ('trung', 1), ('chet', 4)]:
        for i in range(1, n + 1):
            im = Image.open(os.path.join(Q, nm, 'game', 'khung-%d.png' % i)).convert('RGBA')
            a = np.asarray(im)
            al = a[..., 3] > 128
            ys = np.where(al.any(1))[0]
            day = ys.max(); band = max(3, int((day - ys.min()) * 0.04))
            xs = np.where(al[day - band:day + 1].any(0))[0]
            crop, x0, y0 = cat_sat(im)
            pos = ke.them(crop)
            key = 'quai-%s/%d' % (nm, i)
            frames[key] = [pos[0], pos[1], crop.width, crop.height, round(x0 - QP[0], 2), round(y0 - QP[1], 2)]
            info[key] = dict(mat=mat_quai(a), got=float(xs.max()))      # quái nhìn TRÁI → gót sau = mép phải
    B = os.path.join(ART, 'boss', 'khung', 'tam-tho', 'game')
    BP = (206.0, 402.0)
    for i in range(1, 7):
        im = Image.open(os.path.join(B, 'khung-%d.png' % i)).convert('RGBA')
        crop, x0, y0 = cat_sat(im)
        pos = ke.them(crop)
        frames['boss/%d' % i] = [pos[0], pos[1], crop.width, crop.height, round(x0 - BP[0], 2), round(y0 - BP[1], 2)]

    def buoc(keys, ms, kieu):
        kieu = ''   # MỚI: giữ vị trí ô gốc (đo: ô gốc ổn định ±1,3 px; khoá mắt cũ làm thân nhảy 14 px)
        if kieu == 'mat':
            xs = [info[k]['mat'][0] for k in keys if info[k]['mat']]
            ref = float(np.median(xs))
            return [dict(f=k, ms=m, dx=round(ref - info[k]['mat'][0], 2) if info[k]['mat'] else 0) for k, m in zip(keys, ms)]
        if kieu == 'got':
            ref = info[keys[0]]['got']
            return [dict(f=k, ms=m, dx=round(ref - info[k]['got'], 2)) for k, m in zip(keys, ms)]
        return [dict(f=k, ms=m, dx=0) for k, m in zip(keys, ms)]
    anims = {
        'quai-di': dict(loop=True, khoa='ô gốc', buoc=buoc(['quai-di/%d' % i for i in range(1, 5)], [125] * 4, 'mat')),
        'quai-tan-cong': dict(loop=False, khoa='ô gốc (giữ đà đấm vẽ sẵn)',
                              buoc=buoc(['quai-tan-cong/%d' % i for i in range(1, 5)], [500, 83, 100, 430], 'got'),
                              ghiChu='khung 1 lấy đà (0,5 s, chuông lóe vàng), 2 đấm, 3 duỗi = CHẠM (hitbox), 4 thu.'),
        'quai-trung': dict(loop=False, khoa='—', buoc=buoc(['quai-trung/1'], [270], '')),
        'quai-chet': dict(loop=False, khoa='—', buoc=buoc(['quai-chet/%d' % i for i in range(1, 5)], [120, 140, 160, 999], ''),
                          ghiChu='vỡ rồi nằm lại đống vụn (khung 4), mờ dần bằng code.'),
        'boss-tho': dict(loop=True, khoa='—', buoc=buoc(['boss/%d' % i for i in range(1, 7)], [160] * 6, ''),
                         ghiChu='TẠM: thở/nhún (co giãn 1 tư thế). Chưa có đi/đập/quét/trúng/chết riêng.'),
    }
    # đòn đấm khung 3: hộp tay (px game so với pivot, quái nhìn TRÁI)
    a3 = np.asarray(Image.open(os.path.join(Q, 'tan-cong', 'game', 'khung-3.png')).convert('RGBA'))
    al = a3[..., 3] > 128
    xs = np.where(al.any(0))[0]
    tam_x = xs.min()
    cot = al[:, tam_x:tam_x + 30]
    yy = np.where(cot.any(1))[0]
    dd = anims['quai-tan-cong']['buoc'][2]['dx']
    hop = [round(tam_x - QP[0] - 8 + dd), round(yy.min() - QP[1] - 10), 66, round(yy.max() - yy.min() + 20)]
    anims['quai-tan-cong']['buoc'][2]['box'] = hop
    sheet = ke.anh()
    sheet.save(os.path.join(OUT, 'quai-boss.png'), optimize=True)
    meta = dict(version=1, image='quai-boss.png', donVi='px game',
                quai=dict(o=171, pivot=list(QP), nhin='trái', tamVoi=round(-(tam_x - QP[0])), hopDam=hop),
                boss=dict(o=412, pivot=list(BP), nhin='trái'),
                frames=frames, anims=anims)
    json.dump(meta, open(os.path.join(OUT, 'quai-boss.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('quai-boss.png', sheet.size, os.path.getsize(os.path.join(OUT, 'quai-boss.png')) // 1024, 'KB', 'hộp đấm', hop,
          'tầm', meta['quai']['tamVoi'])
    print('  ', [(b['f'], b['dx']) for a in anims.values() for b in a['buoc']])


# ------------------------------------------------------------------ THẾ GIỚI: mảnh tileset + đồ vật
def giam_tuong_phan(im, k=0.9):
    a = np.asarray(im).astype(float)
    al = a[..., 3] > 10
    tb = a[..., :3][al].mean(0)
    a[..., :3] = np.where(al[..., None], tb + (a[..., :3] - tb) * k, a[..., :3])
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def the_gioi():
    ke = Ke()
    frames = {}
    T = json.load(open(os.path.join(ART, 'tileset', 'manh.json'), encoding='utf-8'))
    manh = {}
    for m in T['manh']:
        im = giam_tuong_phan(Image.open(os.path.join(ART, 'tileset', m['file_game'])).convert('RGBA'))
        pos = ke.them(im)
        key = 'manh-%02d' % m['so']
        frames[key] = [pos[0], pos[1], im.width, im.height, 0, 0]
        md = m['mat_dung_game']
        manh[key] = dict(loai=m['loai'], day=m['day_manh'], matDung=round(m['mat_dung_y_trung_vi_game'], 1),
                         matDungX=[[round(x), round(y)] for x, y in md][::2])
    D = json.load(open(os.path.join(ART, 'do-vat', 'do-vat.json'), encoding='utf-8'))
    dv = {}
    for nm, v in D['do_vat'].items():
        im = Image.open(os.path.join(ART, 'do-vat', v['anh_game'])).convert('RGBA')
        pos = ke.them(im)
        pg = v['pivot_game']
        frames[nm] = [pos[0], pos[1], im.width, im.height, -pg[0], -pg[1]]
        dv[nm] = {k: v[k] for k in ('va_cham',) if k in v}
    sheet = ke.anh()
    sheet.save(os.path.join(OUT, 'the-gioi.png'), optimize=True)
    meta = dict(version=1, image='the-gioi.png', donVi='px game',
                ghiChu='mảnh tileset: [x,y,w,h,0,0] (góc trên-trái), giảm tương phản 10 %; đồ vật: pivot đáy giữa.',
                frames=frames, manh=manh, doVat=dv)
    json.dump(meta, open(os.path.join(OUT, 'the-gioi.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('the-gioi.png', sheet.size, os.path.getsize(os.path.join(OUT, 'the-gioi.png')) // 1024, 'KB')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    lam(); quai_boss(); the_gioi()
