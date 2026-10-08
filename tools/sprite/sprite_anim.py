"""Dựng khung hình: đặt tư thế cho bộ xương, xoay và dời các mảnh, thu về pixel, thêm viền.

Quy ước góc (nhân vật quay mặt sang phải): 0 = chĩa ra trước, 90 = chĩa xuống đất,
180 = chĩa ra sau, -90 = chĩa lên trời. Góc vũ khí cùng quy ước với A.weapon trong game.
"""
import math

import numpy as np
from PIL import Image

from sprite_rig import EMPTY, downscale_mode

CW, CH = 168, 120   # khung vẽ tạm (điểm ảnh pixel)
OX, OY = 92, 96     # vị trí điểm chân trong khung vẽ tạm


# ---------- ma trận 3x3 ----------
def T(x, y):
    return np.array([[1, 0, x], [0, 1, y], [0, 0, 1]], float)


def R(deg, c=(0, 0)):
    r = math.radians(deg)
    cs, sn = math.cos(r), math.sin(r)
    m = np.array([[cs, -sn, 0], [sn, cs, 0], [0, 0, 1]], float)
    return T(c[0], c[1]) @ m @ T(-c[0], -c[1])


def Sc(sx, sy, c=(0, 0)):
    return T(c[0], c[1]) @ np.diag([sx, sy, 1.0]) @ T(-c[0], -c[1])


def ap(m, p):
    v = m @ np.array([p[0], p[1], 1.0])
    return v[:2]


def ang(v):
    return math.degrees(math.atan2(v[1], v[0]))


def ik(root, target, l1, l2, bend):
    """Hai đoạn nối nhau với tới đích. bend = +1: khớp giữa lồi ra trước (gối), -1: lồi ra sau (khuỷu)."""
    d = target - root
    dist = float(np.hypot(*d))
    dist = min(max(dist, abs(l1 - l2) + 1e-3), l1 + l2 - 1e-3)
    base = ang(d) if np.hypot(*d) > 1e-6 else 90.0
    a = math.degrees(math.acos(max(-1, min(1, (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist)))))
    up = base - a * bend
    mid = root + l1 * np.array([math.cos(math.radians(up)), math.sin(math.radians(up))])
    tgt = root + dist * np.array([math.cos(math.radians(base)), math.sin(math.radians(base))])
    return up, ang(tgt - mid)


class Skeleton:
    def __init__(self, rig, palette, inner_lines=True):
        self.rig = rig
        self.K = rig["K"]
        self.ncol = len(palette)
        dark = palette[palette.sum(axis=1).argmin()]
        # bảng màu mở rộng: nửa sau là bản tối, dùng cho tay chân phía sau
        self.pal = np.concatenate([palette, palette * 0.68 + dark * 0.2]).clip(0, 255)
        self.outline = (dark * 0.5).astype(np.uint8)
        self.inner_lines = inner_lines
        self.g = rig["ground"]
        L = rig["limbs"]
        self.bind = {}
        for name, lb in L.items():
            self.bind[name] = (ang(lb["mid"] - lb["root"]), ang(lb["tip"] - lb["mid"]),
                               float(np.hypot(*(lb["mid"] - lb["root"]))), float(np.hypot(*(lb["tip"] - lb["mid"]))))
        self.leg_len = (self.bind["chan_truoc"][2] + self.bind["chan_truoc"][3]) / self.K
        self.arm_len = (self.bind["tay_truoc"][2] + self.bind["tay_truoc"][3]) / self.K
        self.height = rig["size"][1] / self.K
        self.width = rig["size"][0] / self.K
        self.images = {n: Image.fromarray(p["img"]) for n, p in rig["parts"].items()}
        self.boxes = {}
        for n, p in rig["parts"].items():
            ys, xs = np.where(p["img"] != EMPTY)
            self.boxes[n] = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1) if len(xs) else None

    # ----- tính ma trận của từng mảnh theo tư thế -----
    def solve(self, pose):
        K, rig, g = self.K, self.rig, self.g
        gp = lambda k, d=0.0: pose.get(k, d)
        pel, neck = rig["pelvis"], rig["neck"]
        ty = gp("ty") * K
        Lhip = R(gp("lean"), pel)          # hông không dời theo nhịp thở, để chân đứng yên
        Lt = T(gp("tx") * K, ty) @ Lhip
        hx, hy = gp("hx"), gp("hy")
        Lh = Lt @ T(hx * K, hy * K) @ R(gp("head"), neck)
        mats = {"than": Lt, "dau": Lh}
        pts = {}
        # chân: mặc định bàn chân đứng yên tại chỗ (tính ngược), hoặc cho hướng trực tiếp bằng fl / bl
        for name, key_fk, key_foot in (("chan_truoc", "fl", "ff"), ("chan_sau", "bl", "bf")):
            lb = rig["limbs"][name]
            b_up, b_lo, l1, l2 = self.bind[name]
            hip = ap(Lhip, lb["root"])
            if key_fk in pose:
                d_up, d_lo = pose[key_fk]
            else:
                off = np.array(pose.get(key_foot, (0, 0)), float) * K
                target = lb["tip"] + off - np.array([gp("x"), gp("y")]) * K
                d_up, d_lo = ik(hip, target, l1, l2, +1)
            Mu = T(*hip) @ R(d_up - b_up) @ T(*(-lb["root"]))
            knee = ap(Mu, lb["mid"])
            Ml = T(*knee) @ R(d_lo - b_lo) @ T(*(-lb["mid"]))
            mats[name + "_1"], mats[name + "_2"] = Mu, Ml
            pts[name] = ap(Ml, lb["tip"])
        # tay: cho hướng (fa / ba) hoặc cho đích của bàn tay (fa_to / ba_to, tính từ vai, đơn vị điểm ảnh)
        for name, key, key_off in (("tay_truoc", "fa", "fao"), ("tay_sau", "ba", "bao")):
            lb = rig["limbs"][name]
            b_up, b_lo, l1, l2 = self.bind[name]
            off = np.array(pose.get(key_off, (0, 0)), float) * K
            sh = ap(Lt, lb["root"]) + off
            if key + "_to" in pose:
                tgt = pose[key + "_to"]
                target = (pts["tay_truoc"] + np.array(tgt[1:], float) * K) if tgt[0] == "hand" else sh + np.array(tgt[1:], float) * K
                d_up, d_lo = ik(sh, target, l1, l2, -1)
            else:
                d_up, d_lo = pose.get(key) or (b_up, b_lo)
            Mu = T(*sh) @ R(d_up - b_up) @ T(*(-lb["root"]))
            el = ap(Mu, lb["mid"])
            Ml = T(*el) @ R(d_lo - b_lo) @ T(*(-lb["mid"]))
            mats[name + "_1"], mats[name + "_2"] = Mu, Ml
            pts[name] = ap(Ml, lb["tip"])
        for e in rig["extras"]:
            parent = Lh if e["gan"] == "dau" else Lt
            mats[e["name"]] = parent @ R(gp("phu") * e["lac"], e["pivot"])
        # cả người: dời, xoay quanh một điểm, co giãn quanh điểm chân
        piv = g + np.array(pose.get("piv", (0, -self.height * 0.45)), float) * K
        G = T(OX * K + gp("x") * K, OY * K + gp("y") * K) @ T(*(-g)) @ R(gp("rot"), piv) @ Sc(gp("sx", 1.0), gp("sy", 1.0), g)
        out = {}
        for n, m in mats.items():
            m = G @ m
            if abs(m[0, 0] - 1) < 1e-4 and abs(m[1, 1] - 1) < 1e-4 and abs(m[0, 1]) < 1e-4 and abs(m[1, 0]) < 1e-4:
                m = m.copy()
                m[0, 2] = round(m[0, 2] / K) * K
                m[1, 2] = round(m[1, 2] / K) * K
            out[n] = m
        hand = ap(out["tay_truoc_2"], rig["limbs"]["tay_truoc"]["tip"]) / K
        return out, hand

    # ----- vẽ một khung -----
    def render(self, pose):
        K = self.K
        mats, hand = self.solve(pose)
        W, H = CW * K, CH * K
        canvas = np.full((H, W), EMPTY, np.uint8)
        groups = np.zeros((H, W), np.uint8)
        for n in self.rig["order"]:
            if n not in mats or self.boxes.get(n) is None:
                continue
            m = mats[n]
            x0, y0, x1, y1 = self.boxes[n]
            cs = np.array([ap(m, c) for c in ((x0, y0), (x1, y0), (x0, y1), (x1, y1))])
            ox0, oy0 = max(0, int(math.floor(cs[:, 0].min())) - 1), max(0, int(math.floor(cs[:, 1].min())) - 1)
            ox1, oy1 = min(W, int(math.ceil(cs[:, 0].max())) + 1), min(H, int(math.ceil(cs[:, 1].max())) + 1)
            if ox1 <= ox0 or oy1 <= oy0:
                continue
            inv = np.linalg.inv(m)
            a, b, c, d, e, f = inv[0, 0], inv[0, 1], inv[0, 2], inv[1, 0], inv[1, 1], inv[1, 2]
            data = (a, b, c + a * ox0 + b * oy0, d, e, f + d * ox0 + e * oy0)
            sub = np.array(self.images[n].transform((ox1 - ox0, oy1 - oy0), Image.Transform.AFFINE, data,
                                                    resample=Image.Resampling.NEAREST, fillcolor=EMPTY))
            sel = sub != EMPTY
            canvas[oy0:oy1, ox0:ox1][sel] = sub[sel]
            groups[oy0:oy1, ox0:ox1][sel] = self.rig["parts"][n]["group"]
        # chỉ thu nhỏ vùng có hình cho nhanh
        low = np.full((CH, CW), EMPTY, np.uint8)
        grp = np.zeros((CH, CW), np.uint8)
        ys, xs = np.where((canvas != EMPTY).reshape(CH, K, CW, K).any(axis=(1, 3)))
        if len(ys):
            a, b, c, d = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
            sub = canvas[a * K:b * K, c * K:d * K]
            low[a:b, c:d] = downscale_mode(sub, K)
            grp[a:b, c:d] = downscale_mode(np.where(sub == EMPTY, EMPTY, groups[a * K:b * K, c * K:d * K]).astype(np.uint8), K)
        grp[low == EMPTY] = 0
        grp[grp == EMPTY] = 0
        # lấp các lỗ thủng 1 điểm do xoay
        solid = low != EMPTY
        pad = np.pad(solid, 1)
        nb = pad[:-2, 1:-1].astype(int) + pad[2:, 1:-1] + pad[1:-1, :-2] + pad[1:-1, 2:]
        holes = ~solid & (nb >= 4)
        if holes.any():
            lp = np.pad(low, 1, constant_values=EMPTY)
            low[holes] = lp[1:-1, :-2][holes]
            gp_ = np.pad(grp, 1)
            grp[holes] = gp_[1:-1, :-2][holes]
            solid = low != EMPTY
        rgba = np.zeros((CH, CW, 4), np.uint8)
        rgb = self.pal[np.where(solid, low, 0)]
        if self.inner_lines:
            rgb = self._inner(rgb, grp)
        rgba[solid, :3] = rgb[solid].astype(np.uint8)
        rgba[solid, 3] = 255
        dy = 0
        if pose.get("dat"):  # ép điểm thấp nhất chạm đất
            ys = np.where(solid.any(axis=1))[0]
            if len(ys):
                dy = (OY - 1) - int(ys.max()) - int(pose.get("nhay", 0))
                rgba = np.roll(rgba, dy, axis=0)
                hand = hand + np.array([0, dy])
        # viền tối 1 điểm
        s = rgba[:, :, 3] > 0
        p = np.pad(s, 1)
        edge = (p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]) & ~s
        rgba[edge, :3] = self.outline
        rgba[edge, 3] = 255
        return rgba, (float(hand[0]) - OX, float(hand[1]) - OY)

    # thứ tự lớp của các nhóm: tay sau < chân sau < chân trước < thân < tay trước
    _Z = np.array([-1, 3, 4, 0, 2, 1])

    def _inner(self, rgb, grp):
        """Tô tối mép của mảnh nằm dưới, ở chỗ tay đè lên thân hoặc chân đè lên chân, để tách khối."""
        z = self._Z[grp]
        dark = np.zeros(grp.shape, bool)
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            g2 = np.roll(grp, (dy, dx), axis=(0, 1))
            z2 = np.roll(z, (dy, dx), axis=(0, 1))
            arm = (grp == 2) | (g2 == 2) | (grp == 3) | (g2 == 3)
            legs = ((grp == 4) & (g2 == 5)) | ((grp == 5) & (g2 == 4))
            dark |= (grp > 0) & (g2 > 0) & (g2 != grp) & (z2 > z) & (arm | legs)
        out = rgb.copy()
        out[dark] = out[dark] * 0.62 + self.outline * 0.38
        return out


# ---------- các động tác ----------
def build_anims(sk):
    """Danh sách động tác. Mỗi khung: (thời lượng ms, tư thế). Số đo chân tính theo chiều dài chân."""
    L = sk.leg_len
    u = sk.height / 38.0
    A = sk.arm_len
    S = dict(fa=(100, 42), ba=(96, 78), wa=-58, wl="truoc")  # thế đứng cầm vũ khí

    def P(**kw):
        d = dict(S)
        d.update(kw)
        return d

    anims = []

    def add(aid, ten, frames, loop=False, weapon="sword", hit=None, rest=True):
        anims.append(dict(id=aid, ten=ten, frames=frames, loop=loop, weapon=weapon, hit=hit, rest=rest))

    # --- đứng thở: chỉ dời nguyên điểm ảnh nên hình luôn nét ---
    add("idle", "Đứng thở", [
        (220, P(phu=0.0)),
        (180, P(ty=1, phu=0.5)),
        (220, P(ty=1, fao=(0, 1), bao=(0, 1), hy=0, phu=1.0, wa=-56)),
        (180, P(fao=(0, 1), phu=0.5, wa=-56)),
    ], loop=True)

    # --- chạy: 8 khung, bàn chân đi theo quỹ đạo, tay đánh ngược chân ---
    stride, lift = 0.5 * L, 0.36 * L
    def foot(ph):
        ph %= 1.0
        if ph < 0.5:   # chân chống: trượt từ trước ra sau
            return (stride * (1 - 4 * ph), 0)
        t = (ph - 0.5) / 0.5  # chân vung: nhấc lên đưa ra trước
        return (stride * (-1 + 2 * (t * t * (3 - 2 * t))), -lift * math.sin(math.pi * t) ** 0.8 - (0.12 * L if t < 0.5 else 0))
    run = []
    bob = [1, 2, 0, -1, 1, 2, 0, -1]
    for i in range(8):
        ph = i / 8
        sw = math.cos(2 * math.pi * ph)
        f, b = foot(ph), foot(ph + 0.5)
        run.append((75, P(lean=9, head=-5, y=bob[i] * 0.5 * u, ff=f, bf=b,
                          fa=(92 + 34 * sw, 30 + 30 * sw), ba=(92 - 40 * sw, 40 - 44 * sw),
                          wa=-48 + 16 * sw, phu=-0.6 + 0.5 * math.sin(2 * math.pi * ph * 2))))
    add("run", "Chạy", run, loop=True)

    # --- né lăn: thu người, lăn tròn về trước, bật dậy ---
    tuck = dict(lean=38, head=28, fl=(8, 118), bl=(-6, 104), fa=(52, -28), ba=(40, -40), an=True, dat=True, piv=(0, -0.42 * sk.height))
    add("dodge", "Né lăn", [
        (50, P(y=0.3 * L, lean=26, head=10, fa=(120, 60), ba=(60, 10), ff=(-0.2 * L, 0), bf=(0.25 * L, 0), wa=-20, sy=0.94)),
        (45, P(rot=50, **tuck)),
        (45, P(rot=140, **tuck)),
        (45, P(rot=230, **tuck)),
        (45, P(rot=320, **tuck)),
        (60, P(y=0.32 * L, lean=14, head=-4, fa=(130, 70), ba=(50, 20), ff=(0.3 * L, 0), bf=(-0.3 * L, 0), wa=-30, sy=0.95)),
    ])

    # --- trúng đòn ---
    add("hurt", "Trúng đòn", [
        (90, P(x=-1 * u, rot=-9, piv=(0, 0), lean=-10, head=-14, fa=(40, 0), ba=(30, -10), ff=(0.25 * L, 0), bf=(-0.1 * L, 0), wa=-95, phu=-1, sx=1.03, sy=0.97)),
        (110, P(rot=-4, piv=(0, 0), lean=-5, head=-6, fa=(70, 20), ba=(70, 30), ff=(0.15 * L, 0), wa=-75, phu=-0.5)),
    ])

    # --- gục ngã: giật lùi, khuỵu gối, ngã ngửa, nảy nhẹ, nằm yên ---
    heel = (-0.12 * sk.width, 0)
    add("die", "Gục ngã", [
        (90, P(x=-1 * u, rot=-10, piv=(0, 0), lean=-12, head=-16, fa=(30, -10), ba=(20, -20), ff=(0.25 * L, 0), wa=-100)),
        (100, P(y=0.38 * L, lean=-16, head=-20, fa=(60, 30), ba=(50, 20), bf=(-0.15 * L, 0), wa=-130, an=True)),
        (90, P(rot=-42, piv=heel, lean=-8, head=-12, fa=(20, -20), ba=(10, -30), fl=(75, 100), bl=(60, 95), an=True, dat=True)),
        (80, P(rot=-78, piv=heel, lean=-4, head=-6, fa=(40, 10), ba=(30, 0), fl=(70, 95), bl=(55, 90), an=True, dat=True)),
        (80, P(rot=-90, piv=heel, head=6, fa=(70, 50), ba=(60, 40), fl=(80, 90), bl=(62, 96), an=True, dat=True, nhay=1)),
        (400, P(rot=-90, piv=heel, head=10, fa=(96, 84), ba=(100, 92), fl=(88, 92), bl=(78, 96), an=True, dat=True)),
    ])

    # --- ra chiêu kỹ năng: thu người, giơ cao, đẩy ra trước ---
    add("cast", "Ra chiêu kỹ năng", [
        (70, P(y=0.22 * L, lean=-6, fa=(70, -30), ba=(60, -20), wa=-80, sy=0.95)),
        (70, P(lean=-8, head=-6, fa=(-50, -85), ba=(30, -10), wa=-92)),
        (90, P(y=-0.06 * L, ff=(0, 0), lean=-10, head=-10, fa=(-78, -92), ba=(110, 130), wa=-98, sy=1.05, phu=1)),
        (90, P(lean=12, head=4, x=1 * u, fa=(-12, -4), ba=(140, 150), ff=(0.3 * L, 0), wa=-10, phu=-1)),
        (80, P(lean=5, fa=(50, 16), ba=(110, 100), ff=(0.15 * L, 0), wa=-34)),
    ])

    # --- kiếm: 3 nhịp combo, mỗi nhịp có lấy đà, vung, quá đà, thu về ---
    add("atk_sword_1", "Kiếm nhịp 1: chém ngang từ sau ra trước", [
        (70, P(y=0.12 * L, lean=-7, head=4, fa=(168, -128), ba=(50, 8), bf=(-0.12 * L, 0), wa=-158, wl="sau")),
        (60, P(y=0.16 * L, lean=-10, head=6, fa=(176, -112), ba=(46, 4), bf=(-0.14 * L, 0), wa=-172, wl="sau", sy=0.97)),
        (50, P(x=1 * u, y=0.1 * L, lean=13, fa=(6, 2), ba=(150, 160), ff=(0.34 * L, 0), bf=(-0.1 * L, 0), wa=12, sx=1.04, sy=0.98, phu=-1)),
        (80, P(x=1 * u, y=0.14 * L, lean=17, head=-4, fa=(54, 66), ba=(140, 150), ff=(0.36 * L, 0), bf=(-0.1 * L, 0), wa=76)),
        (110, P(y=0.05 * L, lean=7, fa=(84, 46), ba=(110, 96), ff=(0.2 * L, 0), wa=-6)),
    ], weapon="sword", hit=2, rest=False)
    add("atk_sword_2", "Kiếm nhịp 2: hất ngược từ dưới lên", [
        (70, P(y=0.16 * L, lean=12, head=4, fa=(124, 136), ba=(60, 20), ff=(0.2 * L, 0), wa=148, wl="sau")),
        (60, P(y=0.2 * L, lean=15, head=6, fa=(132, 148), ba=(56, 14), ff=(0.2 * L, 0), wa=166, wl="sau", sy=0.96)),
        (50, P(x=1 * u, lean=-2, fa=(-6, -30), ba=(130, 140), ff=(0.3 * L, 0), wa=-38, sy=1.03)),
        (80, P(x=1 * u, y=-0.04 * L, ff=(0.3 * L, 0), lean=-9, head=-6, fa=(-52, -84), ba=(120, 126), wa=-112, sy=1.04)),
        (110, P(lean=-2, fa=(44, -8), ba=(104, 90), ff=(0.16 * L, 0), wa=-72)),
    ], weapon="sword", hit=2, rest=False)
    add("atk_sword_3", "Kiếm nhịp 3: nhảy bổ xuống", [
        (80, P(y=0.3 * L, lean=-8, head=-4, fa=(-128, -104), ba=(-70, -50), wa=-140, wl="sau", sy=0.93)),
        (70, P(y=-0.3 * L, ff=(0.1 * L, -0.26 * L), bf=(0.0, -0.2 * L), lean=-12, head=-8, fa=(-106, -96), ba=(-84, -70), wa=-124, wl="sau", sy=1.06, phu=1)),
        (50, P(x=2 * u, y=0.2 * L, lean=22, head=-6, fa=(18, 28), ba=(150, 164), ff=(0.5 * L, 0), bf=(-0.2 * L, 0), wa=38, sy=0.94, phu=-1)),
        (90, P(x=2 * u, y=0.3 * L, lean=26, head=-8, fa=(58, 72), ba=(140, 150), ff=(0.5 * L, 0), bf=(-0.2 * L, 0), wa=84, sy=0.95)),
        (120, P(x=1 * u, y=0.1 * L, lean=10, fa=(74, 40), ba=(110, 96), ff=(0.3 * L, 0), wa=8)),
    ], weapon="sword", hit=2, rest=False)

    # --- giáo: rút về sau, lao người đâm thẳng, giữ, thu về ---
    add("atk_spear", "Giáo: đâm thẳng", [
        (70, P(x=-1 * u, lean=-8, fa=(158, 22), ba=(30, 0), bf=(-0.2 * L, 0), wa=-4)),
        (70, P(x=-2 * u, y=0.1 * L, lean=-12, head=4, fa=(170, 34), ba=(24, -4), bf=(-0.24 * L, 0), wa=-2, sx=0.97)),
        (50, P(x=2 * u, y=0.22 * L, lean=19, head=-8, fa=(4, 0), ba=(150, 160), ff=(0.6 * L, 0), bf=(-0.3 * L, 0), wa=0, sx=1.05, sy=0.96, phu=-1)),
        (90, P(x=3 * u, y=0.24 * L, lean=22, head=-10, fa=(0, -2), ba=(156, 164), ff=(0.62 * L, 0), bf=(-0.3 * L, 0), wa=0)),
        (120, P(x=1 * u, y=0.08 * L, lean=8, fa=(66, 8), ba=(110, 96), ff=(0.3 * L, 0), wa=-6)),
    ], weapon="spear", hit=2, rest=False)

    # --- búa: lấy đà dài, bổ từ trên xuống, khựng lại, thu về ---
    add("atk_hammer", "Búa: bổ từ trên xuống", [
        (70, P(y=0.16 * L, lean=8, fa=(62, 36), ba=(56, 30), wa=24)),
        (70, P(lean=-4, fa=(-28, -72), ba=(-20, -60), wa=-84)),
        (80, P(y=-0.05 * L, ff=(0, 0), lean=-12, head=-8, fa=(-104, -122), ba=(-90, -108), wa=-152, wl="sau", sy=1.05, phu=1)),
        (80, P(y=-0.02 * L, ff=(0, 0), lean=-15, head=-10, fa=(-112, -134), ba=(-96, -116), wa=-166, wl="sau", sy=1.04, phu=1)),
        (60, P(x=1 * u, y=0.3 * L, lean=24, head=-8, fa=(34, 44), ba=(40, 52), ff=(0.36 * L, 0), bf=(-0.12 * L, 0), wa=56, sy=0.93, phu=-1)),
        (130, P(x=1 * u, y=0.36 * L, lean=27, head=-10, fa=(40, 52), ba=(46, 58), ff=(0.36 * L, 0), bf=(-0.12 * L, 0), wa=64, sy=0.95)),
        (170, P(y=0.1 * L, lean=10, fa=(64, 30), ba=(70, 50), ff=(0.2 * L, 0), wa=6)),
    ], weapon="hammer", hit=4, rest=False)

    # --- cung: giơ cung, kéo dây, giữ, buông, thu về ---
    add("atk_bow", "Cung: giương và buông", [
        (50, P(fa=(24, 6), ba=(40, 10), wa=0, keo=0)),
        (60, P(lean=-3, fa=(6, 0), ba_to=("hand", -3 * u, 0), wa=0, keo=3)),
        (60, P(lean=-6, head=-2, fa=(2, -2), ba_to=("hand", -6 * u, 0), wa=0, keo=6, bf=(-0.12 * L, 0))),
        (40, P(lean=-7, head=-2, fa=(0, -2), ba_to=("hand", -8 * u, 0), wa=0, keo=8, bf=(-0.14 * L, 0), sx=0.98)),
        (80, P(x=-1 * u, lean=-2, fa=(-4, -8), ba=(172, 150), wa=0, keo=0, bf=(-0.1 * L, 0), phu=1)),
        (170, P(fa=(34, 12), ba=(120, 104), wa=0, keo=0)),
    ], weapon="bow", hit=4, rest=False)
    return anims
