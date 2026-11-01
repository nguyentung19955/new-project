# -*- coding: utf-8 -*-
"""fiz.py – chép vật lý nhân vật từ game/thu-mat-na/dong-co-mn.js (bản 01/11/2026) sang Python
để thử đường đi bằng HỘP (28×96 px logic, ô 48 px). Chỉ phần cần cho dựng màn:
đi bộ, nhảy (giữ nút = nhảy cao nhất, thả sớm = nhảy thấp), nhảy đôi, rơi, bám dây leo 'H'.
KHÔNG mô phỏng bám/bật tường, lướt (tuyến chính không được phụ thuộc vào chúng)."""
import math

P = dict(runSpeed=4.2, jumpHeight=118, gravity=0.768, accelFrames=6, airControl=0.8, turnBoost=1.6, maxFall=10.4,
         fallGravMul=0.93, apexGravMul=0.3, apexThreshold=4, jumpCut=0.5, corner=8, leoSpeed=2.6, djMul=0.88)
JUMP_VEL = math.sqrt(2 * P['gravity'] * P['jumpHeight'])
T = 48
W, H = 28, 96


class Map:
    def __init__(self, luoi, nut_vo=False):
        self.L = [list(r) for r in luoi]
        self.R, self.C = len(self.L), len(self.L[0])
        self.nut_vo = nut_vo   # True: coi 'N' đã chém vỡ (thành trống)

    def tile(self, tx, ty):
        # Ngoài mép trái/phải coi như đặc trừ khi ô sát mép là trống (cửa) -> cho ra khỏi phòng
        if ty < 0:
            return '.'
        if ty >= self.R:
            return '.' if 0 <= tx < self.C and self.L[self.R - 1][tx] != '#' else '#'
        if tx < 0 or tx >= self.C:
            e = self.L[ty][0 if tx < 0 else self.C - 1]
            return '.' if e in '.H' else '#'
        return self.L[ty][tx]

    def dac(self, ch):
        if ch == '#':
            return True
        if ch == 'N':
            return not self.nut_vo
        return False

    def collide(self, x, y, w=W, h=H, oldbottom=None):
        x0, x1 = int(x // T), int((x + w - 0.001) // T)
        y0, y1 = int(y // T), int((y + h - 0.001) // T)
        L, R, C = self.L, self.R, self.C
        for ty in range(y0, y1 + 1):
            for tx in range(x0, x1 + 1):
                if 0 <= ty < R and 0 <= tx < C:
                    ch = L[ty][tx]
                else:
                    ch = self.tile(tx, ty)
                if self.dac(ch):
                    return True
                if ch == '=' and oldbottom is not None and oldbottom <= ty * T and y + h > ty * T:
                    return True
        return False

    def la_day(self, x, y):
        return self.tile(math.floor(x / T), math.floor(y / T)) == 'H'


def move_x(m, o, dx):
    if dx != 0 and not m.collide(o['x'] + dx, o['y']):
        o['x'] += dx; return False
    rem = dx
    while rem != 0:
        s = math.copysign(1, rem) if abs(rem) > 1 else rem
        if not m.collide(o['x'] + s, o['y']):
            o['x'] += s; rem -= s; continue
        return True
    return False


def move_y(m, o, dy):
    if dy != 0 and not m.collide(o['x'], o['y'] + dy, oldbottom=(o['y'] + H if dy > 0 else None)):
        o['y'] += dy; return 0
    rem = dy
    while rem != 0:
        s = math.copysign(1, rem) if abs(rem) > 1 else rem
        ob = o['y'] + H if s > 0 else None
        if not m.collide(o['x'], o['y'] + s, oldbottom=ob):
            o['y'] += s; rem -= s; continue
        if s < 0:
            ok = False
            for k in range(1, P['corner'] + 1):
                for d in (k, -k):
                    if not m.collide(o['x'] + d, o['y'] + s):
                        o['x'] += d; ok = True; break
                if ok:
                    break
            if ok:
                continue
        return 1 if s > 0 else -1
    return 0


def tren_dat(m, o):
    return m.collide(o['x'], o['y'] + 1, oldbottom=o['y'] + H)


def tren_day(m, o):
    cx = o['x'] + W / 2
    return m.la_day(cx, o['y'] + H * 0.4) or m.la_day(cx, o['y'] + H * 0.12)


def bay(m, x, y, vx, vy, huong, giu_frames, dj_frame, dj_giu=99, djco=True, toi_da=150, bam_day=True, nhay_dat=False):
    """Mô phỏng 1 quỹ đạo trên không. huong: hàm(frame)->-1/0/1. Trả (x,y,trạng_thái, đường_đi)
    trạng_thái: 'dat' (chạm đất), 'day' (bám dây), 'ra' (ra khỏi phòng), 'het' (hết giờ)."""
    o = {'x': x, 'y': y}
    jumping = vy < 0
    vet = []
    f = 0
    dj_t = None
    while f < toi_da:
        f += 1
        d = huong(f)
        giu = f <= giu_frames or (dj_t is not None and f - dj_t <= dj_giu)
        # ngang
        acc = P['runSpeed'] / P['accelFrames'] * P['airControl']
        dec = P['runSpeed'] / 5 * P['airControl'] * 0.6
        tgt = d * P['runSpeed']
        if tgt != 0:
            turning = vx != 0 and math.copysign(1, vx) != math.copysign(1, tgt)
            a = acc * P['turnBoost'] if turning else acc
            vx = min(vx + a, tgt) if vx < tgt else max(vx - a, tgt)
        else:
            vx = min(vx + dec, 0) if vx < 0 else max(vx - dec, 0)
        # dọc
        g = P['gravity']
        a0 = min(1, abs(vy) / P['apexThreshold']); a = a0 * a0 * (3 - 2 * a0)
        top = P['apexGravMul'] if giu else 0.8
        g *= top + (1 - top) * a
        if vy > 0:
            g *= 1 + (P['fallGravMul'] - 1) * a
        if not (nhay_dat and f == 1):
            vy = min(vy + g, P['maxFall'])
        if djco and dj_frame is not None and f == dj_frame:
            djco = False; vy = -JUMP_VEL * P['djMul']; jumping = True; dj_t = f
        if jumping and not giu and vy < 0:
            vy *= P['jumpCut']; jumping = False
        if vy >= 0:
            jumping = False
        if move_x(m, o, vx):
            vx = 0
        ry = move_y(m, o, vy)
        if ry != 0:
            if ry == -1:
                jumping = False
            vy = 0
        vet.append((o['x'], o['y']))
        if o['x'] + W < 0 or o['x'] > m.C * T or o['y'] > m.R * T or o['y'] + H < 0:
            return o['x'], o['y'], 'ra', vet
        if bam_day and vy > 0 and tren_day(m, o):
            return o['x'], o['y'], 'day', vet
        if tren_dat(m, o) and vy >= 0:
            return o['x'], o['y'], 'dat', vet
    return o['x'], o['y'], 'het', vet


if __name__ == '__main__':
    # Đo tầm nhảy trên sàn phẳng rộng
    luoi = ['.' * 60] * 30 + ['#' * 60]
    m = Map(luoi)
    y0 = 30 * T - H
    for ten, gf, dj in [('nhảy thường (giữ)', 99, None), ('nhảy thả sớm', 4, None), ('nhảy đôi (đỉnh)', 99, 'dinh')]:
        best = 0
        if dj == 'dinh':
            # thử mọi thời điểm nhảy đôi, lấy cao nhất
            res = []
            for k in range(2, 60):
                _, _, _, vet = bay(m, 30 * T, y0, 4.2, -JUMP_VEL, lambda f: 1, gf, k, nhay_dat=True)
                res.append((y0 - min(v[1] for v in vet), k, vet))
            best, k, vet = max(res)
            print(ten, 'cao %.0f px = %.2f ô, nhảy đôi ở khung %d, xa %.0f px = %.2f ô' % (best, best / T, k, vet[-1][0] - 30 * T, (vet[-1][0] - 30 * T) / T))
        else:
            _, _, _, vet = bay(m, 30 * T, y0, 4.2, -JUMP_VEL, lambda f: 1, gf, None, nhay_dat=True)
            best = y0 - min(v[1] for v in vet)
            print(ten, 'cao %.0f px = %.2f ô, xa %.0f px = %.2f ô, %d khung' % (best, best / T, vet[-1][0] - 30 * T, (vet[-1][0] - 30 * T) / T, len(vet)))
    # xa nhất với nhảy đôi
    res = []
    for k in range(2, 70):
        _, _, _, vet = bay(m, 2 * T, y0, 4.2, -JUMP_VEL, lambda f: 1, 99, k, nhay_dat=True)
        res.append((vet[-1][0] - 2 * T, k))
    print('nhảy đôi xa nhất (cùng độ cao) %.0f px = %.2f ô (khung %d)' % (max(res)[0], max(res)[0] / T, max(res)[1]))
