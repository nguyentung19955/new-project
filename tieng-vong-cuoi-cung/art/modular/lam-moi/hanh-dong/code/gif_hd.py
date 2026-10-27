#!/usr/bin/env python3
"""GIF kiểm hoạt ảnh hành động – vẽ từ CHÍNH sheet lam-hanh-dong-2x.png + sheet hiệu ứng ảnh gen (art/hieu-ung/sprite/),
mỗi khung GIF = 1 bước logic game (60 Hz). Chuyển động (lao tới khi chém, bị đẩy lùi, nhảy, lướt, trượt tường) mô phỏng
bằng ĐÚNG công thức của demo.html (updatePlayer) – chọn khung theo atkT / vy / bước lướt / quãng trượt như game.
  ../gif/<ten>-lon.gif   cỡ lớn (2 px / px logic = cỡ sheet), vẽ HỘP ĐÒN đỏ lúc bật, hộp quái thử (xám), đường đất, chữ atkT
  ../gif/<ten>-112px.gif cỡ thật 112 px logic (1:1, thu nhỏ LANCZOS từ sheet 2x, KHÔNG phóng nearest), không vẽ hộp
GIF chỉ có bước 10 ms → mỗi bước logic 20 ms (chậm hơn game 1,2×). Hitstop (đứng hình khi chém trúng) giữ như game.
Chạy: python3 -B gif_hd.py"""
import os, json, math
import numpy as np
from PIL import Image, ImageDraw
from chung_hd import SPRITE, GIF, HD, font
import anim_hd as A

HU = os.path.normpath(os.path.join(HD, '..', '..', '..', 'hieu-ung', 'sprite'))
META = json.load(open(os.path.join(SPRITE, 'lam-hanh-dong-2x.json'), encoding='utf-8'))
SHEET = Image.open(os.path.join(SPRITE, META['anh'])).convert('RGBA')
FR = META['frames']
IDX = META['tu_the']
FX = {}
for t in ('vet-chem', 'trung-don', 'bui', 'dash', 'truot-tuong', 'lam-bi-danh'):
    m = json.load(open(os.path.join(HU, t + '-2x.json'), encoding='utf-8'))
    FX[t] = (m, Image.open(os.path.join(HU, m['anh'])).convert('RGBA'))
QW, QH = 72, 108          # hộp quái Chuông Gỗ (demo.html)
P = A.P_GAME
JUMPV = math.sqrt(2 * P['gravity'] * P['jumpHeight'])


def tile_lam(i):
    f = FR[i]
    return SHEET.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])), f['ax'], f['ay']


def dan(cv, tile, ax, ay, X, Y, s, goc=0.0, lat=False, alpha=1.0):
    """dán tile (neo ax,ay) lên canvas tại (X,Y) px canvas, tỉ lệ s, xoay goc (độ, + = thuận kim đồng hồ), lật ngang, mờ"""
    w, h = max(1, round(tile.width * s)), max(1, round(tile.height * s))
    t = tile.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
    ax, ay = ax * s, ay * s
    if lat:
        t = t.transpose(Image.FLIP_LEFT_RIGHT); ax = w - ax
    if goc:
        R = int(math.ceil(math.hypot(max(ax, w - ax), max(ay, h - ay)))) + 2
        pad = Image.new('RGBA', (2 * R, 2 * R), (0, 0, 0, 0))
        pad.paste(t, (int(round(R - ax)), int(round(R - ay))))
        t = pad.rotate(-goc, resample=Image.BICUBIC); ax = ay = R
    if alpha < 1:
        a = np.array(t); a[..., 3] = (a[..., 3] * alpha).astype(np.uint8); t = Image.fromarray(a, 'RGBA')
    L = Image.new('RGBA', cv.size, (0, 0, 0, 0))
    L.paste(t, (int(round(X - ax)), int(round(Y - ay))))
    cv.alpha_composite(L)


class Sim:
    """trạng thái tối thiểu giống demo.html (chỉ các phần ảnh hưởng hình)"""
    def __init__(s, x=0.0, y=0.0, face=1):
        s.x, s.y, s.vx, s.vy, s.face = x, y, 0.0, 0.0, face
        s.g = True; s.atkN = 0; s.atkT = 0; s.hurtT = 0; s.hk = 1; s.dash = 0; s.dashT = 0; s.landT = 0; s.airT = 0
        s.wall = 0; s.stick = 0; s.wjT = 0; s.wpha = 0.0; s.yMin = y; s.iframes = 0
        s.fx = []; s.trail = []; s.hitstop = 0; s.frame = 0; s.troi = 0.0

    def them_fx(s, ten, x, y, lat=False, **kw):
        H = A.HIEU_UNG[ten]
        s.fx.append(dict(H=H, ten=ten, x=x, y=y, lat=lat, t=0, **kw))

    def khung(s):
        """chọn khung – CÙNG luật với demo.html lamChon"""
        if s.atkN:
            return META['don']['atk%d' % s.atkN]['khung_theo_atkT'][s.atkT - 1], s.face < 0
        if s.hurtT > 0:
            k = META['khac']['hurt' if s.hk < 0 else 'hurtt']
            return k[0 if s.hurtT >= 13 else 1 if s.hurtT >= 7 else 2], s.face < 0
        if s.dashT:
            k = META['khac']['dash']
            return k[0 if s.dashT == 1 else 1 if s.dashT <= 6 else 2], s.face < 0
        if s.wall:
            k = META['khac']['wall']
            return (k[0] if s.stick < P['wallStick'] else k[1 + int(s.wpha // 6) % 2]), s.wall < 0
        if not s.g:
            if s.wjT >= 11:
                return META['khac']['walljump'][0], s.face < 0
            j, f = META['khac']['jump'], META['khac']['fall']
            if s.vy < -6 and s.airT <= 3: return j[0], s.face < 0
            if s.vy < -4: return j[1], s.face < 0
            if s.vy < 2: return j[2], s.face < 0
            return (f[0] if s.vy < 7 else f[1]), s.face < 0
        if s.landT > 4:
            return META['khac']['land'][0 if s.landT >= 8 else 1], s.face < 0
        return None, s.face < 0                           # đứng: dáng nghỉ

    def trong_luc(s, jump_held=True):
        g = P['gravity']
        if not s.g:
            a = min(1, abs(s.vy) / 1.8); top = 0.5 if jump_held else 0.8
            g *= top + (1 - top) * a
            if s.vy > 0: g *= 1 + 0.12 * a
        s.vy = min(s.vy + g, P['maxFall'])


NGHI = Image.open(os.path.join(HD, '..', '..', '..', '..', 'game', 'anim', 'lam-nghi-2x.png')).convert('RGBA')
NGHI_NEO = (123, 234)


def ve(sim, cv, sc, ox, oy, hop=True, quai=None, nhan=''):
    """vẽ một bước: sc = px canvas / px logic; (ox, oy) = toạ độ canvas của gốc thế giới"""
    d = ImageDraw.Draw(cv)
    if quai and hop:
        qx, qy = quai
        d.rectangle([ox + qx * sc, oy + qy * sc, ox + (qx + QW) * sc, oy + (qy + QH) * sc], outline=(130, 136, 150), width=max(1, int(sc)))
    for tr in sim.trail:
        i, x, y, lat = tr['k'], tr['x'], tr['y'], tr['lat']
        t, ax, ay = tile_lam(i) if i is not None else (NGHI, *NGHI_NEO)
        dan(cv, t, ax, ay, ox + x * sc, oy + y * sc, sc / 2, lat=lat, alpha=A.HIEU_UNG['bong_mo']['alpha'] * tr['t'] / A.HIEU_UNG['bong_mo']['song'])
    k, lat = sim.khung()
    nhay = sim.iframes > 0 and sim.dash <= 0 and (sim.frame >> 2) % 2 == 0
    if not nhay:
        t, ax, ay = tile_lam(k) if k is not None else (NGHI, *NGHI_NEO)
        dan(cv, t, ax, ay, ox + sim.x * sc, oy + sim.y * sc, sc / 2, lat=lat)
    for f in sim.fx:
        H = f['H']
        m, img = FX[H.get('anh', 'vet-chem') if 'anh' in H else 'vet-chem']
        if f['ten'] == 'vet':
            m, img = FX['vet-chem']
            ids = m['anims'][f['kieu']]['khung']; buoc = f['buoc']
        else:
            ids = m['anims'][H['anim']]['khung']; buoc = H['buoc']
        acc, fi = 0, None
        for j, b in enumerate(buoc):
            if f['t'] < acc + b: fi = j; break
            acc += b
        if fi is None: continue
        fr = m['frames'][ids[fi]]
        tile = img.crop((fr['x'], fr['y'], fr['x'] + fr['w'], fr['y'] + fr['h']))
        al = 1.0 if fi < len(buoc) - 1 else max(0.15, 1 - (f['t'] - acc) / buoc[-1])
        goc = f.get('goc', H.get('goc', 0))
        if f['lat']: goc = -goc
        dan(cv, tile, fr['ax'], fr['ay'], ox + f['x'] * sc, oy + f['y'] * sc, sc / 2 * f.get('k', H.get('k', 1)), goc, f['lat'], al)
    if hop and sim.atkN:
        a = A.ATK[sim.atkN]
        if a['su'] <= sim.atkT < a['su'] + a['ac']:
            b = META['don']['atk%d' % sim.atkN]['hop_don']
            x0 = sim.x + b[0] if sim.face > 0 else sim.x - b[0] - b[2]
            d.rectangle([ox + x0 * sc, oy + (sim.y + b[1]) * sc, ox + (x0 + b[2]) * sc, oy + (sim.y + b[1] + b[3]) * sc],
                        outline=(235, 40, 40), width=max(1, int(sc)))
    if hop:
        d.ellipse([ox + sim.x * sc - 3, oy + sim.y * sc - 3, ox + sim.x * sc + 3, oy + sim.y * sc + 3], outline=(60, 90, 230), width=2)
        d.text((8, 6), nhan, fill=(20, 20, 30), font=font(15, True))


def buoc_fx(sim):
    for f in sim.fx:
        f['t'] += 1
        if f['ten'] == 'truot_tuong':
            f['y'] += f['H']['troi']
        if f.get('bam'):
            f['x'] = sim.x + f['dx']; f['y'] = sim.y + f['dy']
    sim.fx = [f for f in sim.fx if f['t'] < sum(f.get('buoc') or f['H']['buoc'])]
    for t in sim.trail: t['t'] -= 1
    sim.trail = [t for t in sim.trail if t['t'] > 0]


def bat_dau_don(sim, n):
    sim.atkN, sim.atkT = n, 0
    if n < 4 and sim.g:
        sim.vx = sim.face * 2.2 * (1.4 if n == 3 else 1)
        H = A.HIEU_UNG['bui_buoc']
        sim.them_fx('bui_buoc', sim.x + H['x'] * sim.face, sim.y, sim.face < 0)


def vet(sim):
    """vệt chém: bắt đầu đúng atkT = bat_dau, bám theo người (lao tới) – như game"""
    v = META['don']['atk%d' % sim.atkN]['vet_chem']
    if sim.atkT == v['bat_dau']:
        sim.fx.append(dict(H={'buoc': v['buoc']}, ten='vet', kieu=v['kieu'], buoc=v['buoc'], k=v['k'], goc=v['goc'],
                           x=sim.x + v['x'] * sim.face, y=sim.y + v['y'], lat=sim.face < 0, t=0, bam=True,
                           dx=v['x'] * sim.face, dy=v['y']))


def trung(sim, quai):
    """chạm quái lần đầu của nhát → tia trúng tại giữa phần giao + hitstop hs như game"""
    a = A.ATK[sim.atkN]
    if not (a['su'] <= sim.atkT < a['su'] + a['ac']) or quai is None or sim.daTrung:
        return
    b = META['don']['atk%d' % sim.atkN]['hop_don']
    x0 = sim.x + b[0] if sim.face > 0 else sim.x - b[0] - b[2]
    y0 = sim.y + b[1]
    qx, qy = quai
    ix0, ix1 = max(x0, qx), min(x0 + b[2], qx + QW); iy0, iy1 = max(y0, qy), min(y0 + b[3], qy + QH)
    if ix0 < ix1 and iy0 < iy1:
        sim.daTrung = True
        sim.them_fx('trung_don', (ix0 + ix1) / 2, (iy0 + iy1) / 2, sim.face < 0)
        sim.hitstop = {1: 3, 2: 4, 3: 6, 4: 3, 5: 3, 6: 3}[sim.atkN]


def chay_don(chuoi, quai=None, khong=False, nhay_vy=None):
    """chuoi = danh sách đòn nối combo (bấm lại ngay khi atkT = su+ac); khong = trên không (đòn 6/4)"""
    sim = Sim()
    if khong:
        sim.g = False; sim.y = -60; sim.vy = nhay_vy or -2
    out = [(sim, 'đứng')] * 0
    seq = []
    for _ in range(6):
        seq.append(snap(sim, 'đứng yên'))
    for ci, n in enumerate(chuoi):
        bat_dau_don(sim, n); sim.daTrung = False
        a = A.ATK[n]
        tong = a['su'] + a['ac'] + a['re']
        while True:
            # updatePlayer: ngang (đang chém dưới đất: hãm về 0, dec*0.5), dọc
            if sim.g:
                sim.vx = approach(sim.vx, 0, P['runSpeed'] / 5 * 0.5)
            sim.x += sim.vx
            if not sim.g:
                sim.trong_luc(); sim.y = min(sim.y + sim.vy, 0)
            sim.atkT += 1
            vet(sim)
            nhan = 'đòn %d  atkT %d/%d%s' % (n, sim.atkT, tong - 1, '  HỘP ĐÒN BẬT' if a['su'] <= sim.atkT < a['su'] + a['ac'] else '')
            trung(sim, quai)
            seq.append(snap(sim, nhan))
            for h in range(sim.hitstop):
                seq.append(snap(sim, nhan + '  (hitstop)', dong=True))
            sim.hitstop = 0
            buoc_fx(sim); sim.frame += 1
            if ci < len(chuoi) - 1 and sim.atkT >= a['su'] + a['ac']:
                break
            if sim.atkT >= tong - 1:
                sim.atkN = 0
                break
    for _ in range(14):
        sim.x += sim.vx; sim.vx = approach(sim.vx, 0, 0.88)
        seq.append(snap(sim, 'thu tay xong → đứng')); buoc_fx(sim); sim.frame += 1
    return seq


def approach(v, t, d):
    return min(v + d, t) if v < t else max(v - d, t)


def snap(sim, nhan, dong=False):
    import copy
    s = copy.copy(sim)
    s.fx = [dict(f) for f in sim.fx]; s.trail = [dict(t) for t in sim.trail]
    return (s, nhan)


def chay_bi_danh(dir_, ten):
    sim = Sim(face=1)
    seq = [snap(sim, 'đứng')] * 6
    # hurt(dir): vx = dir*4.8, vy = −6, hurtT 18, iframes 60, hitstop 6; game gọi lamChon ngay → tư thế trúng hiện trong hitstop
    sim.vx, sim.vy, sim.hurtT, sim.g, sim.iframes = dir_ * 4.8, -6.0, 18, False, 60
    sim.hk = dir_ * sim.face
    sim.them_fx('lam_bi_danh', sim.x + 4 * sim.face, sim.y - 56, sim.face < 0)
    for h in range(6):
        seq.append(snap(sim, 'trúng đòn – hitstop %d/6' % (h + 1)))
    for t in range(70):
        sim.hurtT = max(0, sim.hurtT - 1); sim.iframes = max(0, sim.iframes - 1)
        if sim.hurtT <= 8:
            dec = P['runSpeed'] / 5 * (0.75 * 0.6 if not sim.g else 1)
            sim.vx = approach(sim.vx, 0, dec)
        sim.x += sim.vx
        if not sim.g or sim.vy < 0:
            sim.trong_luc(False); sim.y += sim.vy
            if sim.y >= 0:
                vy = sim.vy; sim.y = 0; sim.vy = 0; sim.g = True
                if vy > 5: sim.landT = 10
                sim.them_fx('bui_tiep_dat', sim.x, 0)
        sim.landT = max(0, sim.landT - 1) if sim.landT and t else sim.landT
        seq.append(snap(sim, '%s  hurtT %d  vx %.1f vy %.1f  iframes %d' % (ten, sim.hurtT, sim.vx, sim.vy, sim.iframes)))
        buoc_fx(sim); sim.frame += 1
    return seq


def chay_nhay(cao=0):
    """nhảy tại chỗ giữ phím (cao=0) hoặc rơi từ gờ cao 'cao' px logic"""
    sim = Sim()
    seq = [snap(sim, 'đứng')] * 6
    if cao:
        sim.y = -cao; sim.g = False; sim.vy = 0; sim.yMin = -cao
    else:
        sim.vy = -JUMPV; sim.g = False
        sim.them_fx('bui_nhay', 0, 0)
    for t in range(140):
        if not sim.g:
            sim.airT += 1
            sim.trong_luc(True); sim.y += sim.vy; sim.yMin = min(sim.yMin, sim.y)
            if sim.y >= 0:
                vy = sim.vy; sim.y = 0; sim.vy = 0; sim.g = True; sim.airT = 0
                if vy > 5: sim.landT = 10
                cao_roi = -sim.yMin
                sim.them_fx('bui_roi_cao' if cao_roi >= A.HIEU_UNG['bui_roi_cao']['roi_cao_px'] else 'bui_tiep_dat', 0, 0)
        else:
            sim.landT = max(0, sim.landT - 1)
        nh = 'vy %.2f  y %.0f' % (sim.vy, sim.y) if not sim.g else ('tiếp đất landT %d' % sim.landT if sim.landT > 4 else 'đứng')
        seq.append(snap(sim, nh))
        buoc_fx(sim); sim.frame += 1
        if sim.g and sim.landT == 0 and t > 20:
            break
    for _ in range(10):
        seq.append(snap(sim, 'đứng')); buoc_fx(sim)
    return seq


def chay_luot():
    sim = Sim()
    seq = [snap(sim, 'đứng')] * 6
    sim.dash = P['dashFrames']; sim.iframes = P['dashIFrames']
    H = A.HIEU_UNG['bui_luot']; sim.them_fx('bui_luot', H['x'], 0)
    D = A.HIEU_UNG['dash']
    sim.fx.append(dict(H=D, ten='dash', x=D['x'], y=D['y'], lat=False, t=0, bam=True, dx=D['x'], dy=D['y']))
    while sim.dash > 0:
        sim.dash -= 1; sim.dashT += 1; sim.vx = P['dashSpeed']; sim.x += sim.vx
        sim.iframes -= 1
        if sim.frame % 2 == 0:
            k, lat = sim.khung(); sim.trail.append(dict(k=k, x=sim.x, y=sim.y, lat=lat, t=A.HIEU_UNG['bong_mo']['song']))
        seq.append(snap(sim, 'lướt bước %d/8  x %.0f (11 px/bước)' % (sim.dashT, sim.x)))
        buoc_fx(sim); sim.frame += 1
    sim.dashT = 0; sim.vx = P['runSpeed']
    for _ in range(20):
        sim.vx = approach(sim.vx, 0, 0.88); sim.x += sim.vx; sim.iframes = max(0, sim.iframes - 1)
        seq.append(snap(sim, 'hết lướt (88 px) → hãm')); buoc_fx(sim); sim.frame += 1
    return seq


def chay_tuong():
    """tường bên PHẢI (x = +10), Lam rơi vào tường → bám 6 bước → trượt (vy ≤ 1,6) → nhảy tường"""
    sim = Sim(y=-150); sim.g = False; sim.vy = 2.0; sim.wall = 1; sim.face = -1
    seq = []
    H = A.HIEU_UNG['truot_tuong']
    for t in range(80):
        sim.trong_luc(False)
        if sim.stick < P['wallStick']:
            sim.stick += 1; sim.vy = 0
        else:
            sim.vy = min(sim.vy, P['wallSlideMax'])
        sim.y += sim.vy; sim.wpha += sim.vy; sim.troi += sim.vy
        if sim.troi >= H['moi_px_truot'] and sum(1 for f in sim.fx if f['ten'] == 'truot_tuong') < H['toi_da']:
            sim.troi -= H['moi_px_truot']
            sim.them_fx('truot_tuong', sim.x + H['x'], sim.y + H['y'], False)
        nh = ('BÁM tường %d/6 (vy 0)' % sim.stick) if sim.stick < P['wallStick'] else 'TRƯỢT vy %.2f  quãng %.0f' % (sim.vy, sim.wpha)
        seq.append(snap(sim, nh)); buoc_fx(sim); sim.frame += 1
    # nhảy tường: vy = −jumpVel·0,92, vx = −5,4 (bật ra xa tường), wjT 16
    sim.wall = 0; sim.vy = -JUMPV * 0.92; sim.vx = -P.get('wallJumpVx', 5.4); sim.wjT = 16; sim.face = -1
    B = A.HIEU_UNG['bui_tuong']; sim.fx.append(dict(H=B, ten='bui_tuong', x=sim.x + 10, y=sim.y + B['y'], lat=False, t=0))
    for t in range(50):
        sim.wjT = max(0, sim.wjT - 1); sim.airT += 1
        sim.trong_luc(True); sim.y += sim.vy; sim.x += sim.vx
        seq.append(snap(sim, 'NHẢY TƯỜNG  wjT %d  vy %.1f' % (sim.wjT, sim.vy))); buoc_fx(sim); sim.frame += 1
    return seq


def xuat(ten, seq, khung_logic, goc_logic, quai=None):
    """khung_logic = (rộng, cao) px logic; goc_logic = vị trí gốc thế giới trong khung (px logic)"""
    os.makedirs(GIF, exist_ok=True)
    for sc, duoi, hop in ((2, 'lon', True), (1, '112px', False)):
        W, H = khung_logic[0] * sc, khung_logic[1] * sc
        ims = []
        for sim, nhan in seq:
            cv = Image.new('RGBA', (W, H), (232, 234, 238, 255))
            d = ImageDraw.Draw(cv)
            gy = goc_logic[1] * sc
            d.rectangle([0, gy, W, gy + max(1, sc) - 1], fill=(196, 60, 60))
            if ten.startswith('tuong'):
                wx = (goc_logic[0] + 10) * sc; d.rectangle([wx, 0, W, gy], fill=(110, 84, 60))
            ve(sim, cv, sc, goc_logic[0] * sc, goc_logic[1] * sc, hop, quai, nhan)
            ims.append(cv.convert('RGB').quantize(colors=255, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE))
        p = os.path.join(GIF, '%s-%s.gif' % (ten, duoi))
        ims[0].save(p, save_all=True, append_images=ims[1:], duration=20, loop=0, disposal=1)
    print('GIF', ten, len(seq), 'bước')


def main():
    xuat('chem-combo-1-2-3', chay_don([1, 2, 3], quai=(118, -QH)), (360, 190), (90, 160), quai=(118, -QH))
    for n in (1, 2, 3, 5):
        xuat('chem-%d' % n, chay_don([n], quai=(110, -QH)), (300, 190), (90, 160), quai=(110, -QH))
    xuat('chem-6-tren-khong', chay_don([6], khong=True), (300, 230), (90, 200))
    xuat('chem-4-nay', chay_don([4], khong=True, nhay_vy=1), (240, 230), (100, 200))
    xuat('bi-danh-day-lui', chay_bi_danh(-1, 'bị đẩy LÙI'), (300, 200), (200, 170))
    xuat('bi-danh-day-toi', chay_bi_danh(1, 'bị đẩy TỚI'), (300, 200), (70, 170))
    xuat('nhay-tai-cho', chay_nhay(), (220, 280), (110, 250))
    xuat('roi-cao', chay_nhay(cao=200), (220, 330), (110, 300))
    xuat('luot', chay_luot(), (300, 170), (60, 140))
    xuat('tuong-truot-nhay', chay_tuong(), (320, 320), (230, 300))


if __name__ == '__main__':
    main()
