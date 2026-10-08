"""Chuẩn bị ảnh, tự tìm khớp và tách nhân vật thành các mảnh.

Mọi phép tính làm trên bản "phóng K lần" của sprite (mỗi điểm ảnh pixel ứng với K x K ô),
để khi xoay mảnh rồi thu về vẫn nét. Toạ độ trong file rig.json tính theo điểm ảnh pixel
của hình đứng (chưa có viền), gốc ở góc trên bên trái.
"""
import json
import math

import numpy as np
from PIL import Image, ImageDraw

EMPTY = 255  # ô trống trong ảnh chỉ số màu


# ---------- phép toán mặt nạ (thay cho scipy) ----------
def _shift(m, dx, dy):
    out = np.zeros_like(m)
    h, w = m.shape
    ys, yd = (slice(0, h - dy), slice(dy, h)) if dy >= 0 else (slice(-dy, h), slice(0, h + dy))
    xs, xd = (slice(0, w - dx), slice(dx, w)) if dx >= 0 else (slice(-dx, w), slice(0, w + dx))
    out[yd, xd] = m[ys, xs]
    return out


def dilate(m, n=1, square=False):
    for _ in range(n):
        o = m | _shift(m, 1, 0) | _shift(m, -1, 0) | _shift(m, 0, 1) | _shift(m, 0, -1)
        if square:
            o |= _shift(m, 1, 1) | _shift(m, -1, 1) | _shift(m, 1, -1) | _shift(m, -1, -1)
        m = o
    return m


def erode(m, n=1, square=False):
    return ~dilate(~m, n, square)


def _disc_steps(r):
    """Xen kẽ hình chữ thập và hình vuông để gần giống hình tròn bán kính r."""
    return [(i % 2 == 1) for i in range(max(0, int(round(r))))]


def open_disc(m, r):
    """Mở hình (bào mòn rồi nở lại): phần mảnh hơn 2r biến mất, phần dày giữ nguyên."""
    p = np.pad(m, int(r) + 2)
    for sq in _disc_steps(r):
        p = erode(p, 1, sq)
    for sq in _disc_steps(r):
        p = dilate(p, 1, sq)
    k = int(r) + 2
    return p[k:-k, k:-k] & m


def label(mask):
    """Đánh số các vùng liền nhau (liền theo 4 hướng)."""
    h, w = mask.shape
    m = np.pad(mask, 1)
    lab = np.zeros(m.shape, np.int32)
    flat, lf = m.ravel(), lab.ravel()
    W = w + 2
    n = 0
    for s in np.flatnonzero(flat):
        if lf[s]:
            continue
        n += 1
        lf[s] = n
        stack = [int(s)]
        while stack:
            i = stack.pop()
            for j in (i - 1, i + 1, i - W, i + W):
                if flat[j] and not lf[j]:
                    lf[j] = n
                    stack.append(j)
    return lab[1:-1, 1:-1], n


def bbox(mask):
    ys, xs = np.where(mask)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def fill_from(img, own, want, max_iter=400):
    """Tô các ô trong `want` bằng màu của ô `own` gần nhất (loang dần từ mép)."""
    img = img.copy()
    have = own.copy()
    todo = want & ~have
    for _ in range(max_iter):
        if not todo.any():
            break
        moved = False
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            src = _shift(have, dx, dy) & todo
            if src.any():
                img[src] = _shift(img, dx, dy)[src]
                have |= src
                todo &= ~src
                moved = True
        if not moved:
            break
    return img, have


# ---------- đọc ảnh, tách nền, thu về bản phóng K ----------
def background_mask(img, tol):
    """Nền = vùng cùng màu với 4 góc và nối liền ra mép ảnh, cộng các lỗ kín đúng màu nền.

    Khác pixelize.py một chút: mảng màu gần giống nền nhưng nằm kín trong nhân vật
    (lòng trắng mắt, áo sáng màu) được giữ lại, không bị ăn mất.
    """
    h, w = img.shape[:2]
    k = max(2, min(h, w) // 50)
    corners = np.concatenate([
        img[:k, :k].reshape(-1, 4), img[:k, -k:].reshape(-1, 4),
        img[-k:, :k].reshape(-1, 4), img[-k:, -k:].reshape(-1, 4),
    ])
    if np.median(corners[:, 3]) < 128:  # ảnh đã có nền trong suốt
        return img[:, :, 3] < 128
    bg = np.median(corners[:, :3], axis=0)
    dist = np.sqrt(((img[:, :, :3].astype(float) - bg) ** 2).sum(axis=2))
    cand = (dist < tol) | (img[:, :, 3] < 128)
    # loang từ mép ảnh
    pad = np.pad(cand, 1, constant_values=True)
    im = Image.fromarray((pad * 255).astype(np.uint8))
    ImageDraw.floodfill(im, (0, 0), 128)
    outer = (np.array(im) == 128)[1:-1, 1:-1]
    # lỗ kín (khe giữa tay và thân): chỉ nhận khi rất sát màu nền và đủ lớn
    inner = cand & ~outer & (dist < tol * 0.35)
    if inner.any():
        lab, n = label(inner)
        if n:
            sizes = np.bincount(lab.ravel(), minlength=n + 1)
            fg_h = max(1, (~outer).any(axis=1).sum())
            big = np.flatnonzero(sizes >= (0.02 * fg_h) ** 2)
            big = big[big > 0]
            outer = outer | np.isin(lab, big)
    return outer


def build_palette(px, colors):
    """Bảng màu chung. Ưu tiên các mảng màu phẳng khác hẳn nhau, kể cả mảng nhỏ (khăn, đai lưng),
    thay vì dồn hết màu cho mảng lớn như cách cắt trung vị của pixelize.py."""
    q = (px.astype(np.int32) >> 3)
    key = (q[:, 0] << 10) | (q[:, 1] << 5) | q[:, 2]
    keys, inv, counts = np.unique(key, return_inverse=True, return_counts=True)
    sums = np.zeros((len(keys), 3))
    np.add.at(sums, inv, px)
    means = sums / counts[:, None]
    order = np.argsort(-counts)
    picked = []
    for thr in (56, 40, 28):
        for i in order:
            if len(picked) >= colors:
                break
            if counts[i] < max(3, 0.002 * len(px)):
                break
            if all(np.sqrt(((means[i] - means[j]) ** 2).sum()) >= thr for j in picked):
                picked.append(i)
    if len(picked) < 3:  # ảnh quá ít màu rõ ràng: quay về cách cắt trung vị
        strip = Image.fromarray(px.astype(np.uint8).reshape(1, -1, 3), "RGB")
        pal = strip.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        palette = np.array(pal.getpalette()[: colors * 3], dtype=float).reshape(-1, 3)
        return palette[np.unique(np.array(pal))]
    palette = means[picked].astype(float)
    sample = px[:: max(1, len(px) // 40000)].astype(float)
    for _ in range(3):  # chỉnh nhẹ cho mỗi màu về giữa nhóm điểm của nó
        d = ((sample[:, None, :] - palette[None, :, :]) ** 2).sum(axis=2).argmin(axis=1)
        for k in range(len(palette)):
            if (d == k).any():
                palette[k] = sample[d == k].mean(axis=0)
    return palette


def prepare(path, height, colors, tol, K, clean_lines=True):
    """Trả về (idx, palette): ảnh chỉ số màu cỡ (cao-2)*K, và bảng màu."""
    img = np.array(Image.open(path).convert("RGBA"))
    fg = ~background_mask(img, tol)
    fg = erode(dilate(erode(fg)))  # bỏ viền lem màu nền, như pixelize.py
    if not fg.any():
        raise SystemExit("Không tìm thấy nhân vật trong ảnh. Thử giảm --tol.")
    x0, y0, x1, y1 = bbox(fg)
    crop, m = img[y0:y1, x0:x1, :3].astype(np.float32), fg[y0:y1, x0:x1].astype(np.float32)
    hl = height - 2  # viền chiếm 1 điểm ảnh mỗi phía
    wl = max(1, int(round((x1 - x0) * hl / (y1 - y0))))
    size = (wl * K, hl * K)
    a = np.array(Image.fromarray(m).resize(size, Image.Resampling.BOX))
    rgb = np.stack([np.array(Image.fromarray(crop[:, :, c] * m).resize(size, Image.Resampling.BOX)) for c in range(3)], axis=2)
    rgb = rgb / np.maximum(a, 1e-6)[:, :, None]
    mask = a >= 0.5
    # bỏ các đốm lẻ
    lab, n = label(mask)
    if n > 1:
        sizes = np.bincount(lab.ravel(), minlength=n + 1)
        sizes[0] = 0
        mask = np.isin(lab, np.flatnonzero(sizes >= max(4, sizes.max() * 0.02)))
    palette = build_palette(np.clip(rgb[mask], 0, 255), colors)
    flat = rgb.reshape(-1, 3)
    idx = np.empty(len(flat), np.uint8)
    for s in range(0, len(flat), 65536):
        d = ((flat[s:s + 65536, None, :] - palette[None, :, :]) ** 2).sum(axis=2)
        idx[s:s + 65536] = d.argmin(axis=1)
    idx = idx.reshape(mask.shape)
    idx[~mask] = EMPTY
    if clean_lines:
        idx = remove_thin_ink(idx, palette, K)
    return idx, palette


def remove_thin_ink(idx, palette, K):
    """Bỏ nét viền mảnh màu tối của ảnh gốc (mảnh hơn nửa điểm ảnh pixel), thay bằng màu bên cạnh.

    Nét mảnh như vậy khi thu nhỏ chỉ còn lại lốm đốm. Mảng tối lớn (tóc, mắt) vẫn giữ nguyên.
    Viền ngoài sẽ được công cụ vẽ lại đều 1 điểm ảnh ở từng khung hình.
    """
    lum = palette @ np.array([0.299, 0.587, 0.114])
    inks = np.flatnonzero(lum < 60)
    mask = idx != EMPTY
    ink = np.isin(idx, inks) & mask
    if not ink.any() or ink.sum() > 0.6 * mask.sum():
        return idx
    thin = ink & ~open_disc(ink | ~mask, 0.3 * K)
    keep = mask & ~thin
    if not keep.any():
        return idx
    out, _ = fill_from(idx, keep, thin, max_iter=K)
    return out


def downscale_mode(idx, K, min_cover=0.5):
    """Thu K lần: mỗi ô lấy chỉ số xuất hiện nhiều nhất; ô phủ chưa tới một nửa thì để trống."""
    H, W = idx.shape[0] // K, idx.shape[1] // K
    blocks = idx[:H * K, :W * K].reshape(H, K, W, K)
    best = np.full((H, W), EMPTY, np.uint8)
    bestc = np.zeros((H, W), np.int32)
    total = np.zeros((H, W), np.int32)
    for i in np.unique(idx):
        if i == EMPTY:
            continue
        c = (blocks == i).sum(axis=(1, 3))
        upd = c > bestc
        best[upd] = i
        bestc[upd] = c[upd]
        total += c
    best[total < K * K * min_cover] = EMPTY
    return best


# ---------- tự tìm khớp theo hình bóng ----------
def _runs(row):
    """Các đoạn liền nhau trong một hàng: danh sách (bắt đầu, kết thúc)."""
    d = np.diff(np.concatenate([[0], row.astype(np.int8), [0]]))
    return list(zip(np.flatnonzero(d == 1), np.flatnonzero(d == -1)))


def auto_rig(idx, K):
    """Đoán hộp và khớp từ hình bóng. Kết quả theo đơn vị điểm ảnh pixel (đã chia K)."""
    M = idx != EMPTY
    h, w = M.shape
    notes = []
    rows = [_runs(M[y]) for y in range(h)]
    main = []  # đoạn dài nhất của mỗi hàng
    for r in rows:
        main.append(max(r, key=lambda s: s[1] - s[0]) if r else (0, 0))
    wid = np.array([b - a for a, b in main], float)
    ker = np.ones(K) / K
    wid_s = np.convolve(wid, ker, mode="same")

    # --- chân: dò khe giữa hai chân từ dưới lên ---
    crotch, gap = None, None
    yb = h - 1 - K // 2
    rb = [s for s in rows[yb] if s[1] - s[0] >= 0.8 * K]
    if len(rb) >= 2:
        rb = sorted(sorted(rb, key=lambda s: s[0] - s[1])[:2])
        gap = (rb[0][1], rb[1][0])
        y = yb
        while y > h * 0.35:
            row = M[y - 1]
            a, b = gap
            free = np.flatnonzero(~row[a:b])
            if len(free) == 0:
                break
            # khe của hàng trên: đoạn trống chạm khe hiện tại
            c = a + free[len(free) // 2]
            l, r = c, c
            while l > 0 and not row[l - 1]:
                l -= 1
            while r < w and not row[r]:
                r += 1
            if l == 0 or r >= w:
                break
            gap = (l, r)
            y -= 1
        crotch = y
        if (h - crotch) < 0.1 * h:
            crotch = None
    legs = {}
    if crotch is not None:
        gx = []
        lrun, rrun = [], []
        for y in range(crotch, h):
            rs = rows[y]
            free = [(rs[i][1], rs[i + 1][0]) for i in range(len(rs) - 1)]
            if not free:
                continue
            # khe gần tâm khe đã dò nhất
            gc = (gap[0] + gap[1]) / 2 if not gx else gx[-1]
            i = min(range(len(free)), key=lambda k: abs((free[k][0] + free[k][1]) / 2 - gc))
            gx.append((free[i][0] + free[i][1]) / 2)
            lrun.append((y, rs[i]))
            rrun.append((y, rs[i + 1]))
        for name, run in (("truoc", lrun), ("sau", rrun)):
            lowrun = [s for y, s in run if y >= crotch + (h - crotch) * 0.35] or [s for _, s in run]
            x0 = min(s[0] for s in lowrun)  # chỉ đo ở nửa dưới, tránh dính đuôi hay vạt áo phía trên
            x1 = max(s[1] for s in lowrun)
            clip = lambda s: (max(s[0], x0), max(max(s[0], x0) + 1, min(s[1], x1)))
            top = [clip(s) for y, s in run if y < crotch + (h - crotch) * 0.35] or [clip(run[0][1])]
            lw = float(np.median([s[1] - s[0] for s in top]))
            hipx = float(np.mean([(s[0] + s[1]) / 2 for s in top[: max(1, len(top) // 3)]]))
            low = [s for y, s in run if crotch + (h - crotch) * 0.45 < y < crotch + (h - crotch) * 0.75] or [run[-1][1]]
            footx = float(np.mean([(s[0] + s[1]) / 2 for s in low]))
            legs[name] = dict(box=[x0, crotch, x1, h], hip=[hipx, crotch - 0.15 * lw], foot=[footx, h], lw=lw)
    else:
        notes.append("Không thấy khe giữa hai chân, chia chân theo tỉ lệ. Nên xem lại hộp chân.")
        crotch = int(h * 0.72)
        a, b = main[min(h - 1, crotch + (h - crotch) // 2)]
        mid = (a + b) / 2
        for name, (x0, x1) in (("truoc", (a, mid)), ("sau", (mid, b))):
            legs[name] = dict(box=[x0, crotch, x1, h], hip=[(x0 + x1) / 2, crotch - 0.1 * (x1 - x0)], foot=[(x0 + x1) / 2, h], lw=x1 - x0)

    # --- cổ: chỗ thắt sâu nhất giữa đầu và vai ---
    lo, hi = int(h * 0.1), int(min(crotch - 2, h * 0.68))
    best, neck = -1.0, int(h * 0.3)
    for y in range(lo, max(lo + 1, hi)):
        depth = min(wid_s[:y].max(), wid_s[y + 1:crotch].max()) - wid_s[y]
        if depth > best:
            best, neck = depth, y
    if best < 0.08 * wid_s[:crotch].max():
        notes.append("Không thấy rõ cổ, lấy theo tỉ lệ. Nên xem lại hộp đầu.")
    ncx = (main[neck][0] + main[neck][1]) / 2
    # hộp đầu: vùng liền phía trên cổ
    up = M.copy()
    up[neck:] = False
    lab, n = label(up)
    if n:
        sizes = np.bincount(lab.ravel(), minlength=n + 1)
        sizes[0] = 0
        hb = bbox(lab == sizes.argmax())
    else:
        hb = (0, 0, w, neck)
    head_box = [hb[0], 0, hb[2], neck]

    # --- thân ---
    ty0, ty1 = neck, crotch
    mid_rows = range(int(ty0 + (ty1 - ty0) * 0.3), max(int(ty0 + (ty1 - ty0) * 0.3) + 1, int(ty1)))
    tw = float(np.median([wid[y] for y in mid_rows]))
    tcx = float(np.median([(main[y][0] + main[y][1]) / 2 for y in mid_rows]))

    # --- tay và phần phụ: phần mảnh thò ra khỏi khối dày ---
    lw = float(np.mean([lg["lw"] for lg in legs.values()]))
    r_open = max(1.2 * K, min(0.5 * lw + 0.6 * K, 0.38 * tw))
    core = open_disc(M, r_open)
    thin = M & ~core
    thin[: max(0, neck - K)] = False
    for lg in legs.values():
        x0, y0, x1, y1 = [int(round(v)) for v in lg["box"]]
        thin[y0:, max(0, x0 - 1):x1 + 1] = False
    lab, n = label(thin)
    area_all = M.sum()
    arms, extras = {}, []
    core_d = dilate(core, 2, True)
    for i in range(1, n + 1):
        comp = lab == i
        area = int(comp.sum())
        if area < 0.012 * area_all:
            continue
        att = comp & core_d
        if not att.any():
            continue
        ay, ax = [float(v.mean()) for v in np.where(att)]
        ys, xs = np.where(comp)
        d2 = (xs - ax) ** 2 + (ys - ay) ** 2
        j = int(d2.argmax())
        tx, ty, length = float(xs[j]), float(ys[j]), math.sqrt(float(d2[j]))
        if length < 0.1 * h:
            continue
        thick = area / max(1.0, length)
        info = dict(att=(ax, ay), tip=(tx, ty), length=length, thick=thick, area=area, box=bbox(comp))
        is_arm = ty0 - K <= ay <= ty0 + (ty1 - ty0) * 0.65 and ty > ay - 0.3 * length
        if is_arm:
            side = "truoc" if ax < tcx else "sau"
            if side not in arms or arms[side]["area"] < area:
                arms[side] = info
        elif area >= 0.02 * area_all:
            extras.append(info)

    def arm_from(info):
        (ax, ay), (tx, ty) = info["att"], info["tip"]
        ux, uy = (tx - ax) / info["length"], (ty - ay) / info["length"]
        th = info["thick"]
        sh = [ax - ux * th * 0.35, ay - uy * th * 0.35]
        hand = [tx - ux * th * 0.55, ty - uy * th * 0.55]
        b = info["box"]
        pad = K
        box = [min(b[0], sh[0] - th / 2) - pad, min(b[1], sh[1] - th / 2) - pad, max(b[2], sh[0] + th / 2) + pad, b[3] + pad]
        return dict(sh=sh, hand=hand, day=th * 1.5 + K, box=box)

    rig_arms = {}
    if "truoc" not in arms and "sau" in arms:
        arms["truoc"] = arms.pop("sau")  # chỉ thấy một tay: coi là tay cầm vũ khí
    if "truoc" in arms:
        rig_arms["truoc"] = arm_from(arms["truoc"])
    else:
        notes.append("Không thấy tay tách khỏi thân, đặt tay theo tỉ lệ ở giữa thân. Nên xem lại tay.")
        sy = ty0 + (ty1 - ty0) * 0.2
        day = max(2 * K, tw * 0.3)
        rig_arms["truoc"] = dict(sh=[tcx, sy], hand=[tcx + 0.05 * tw, ty1 + (h - ty1) * 0.15], day=day,
                                 box=[tcx - day, sy - day, tcx + day, ty1 + (h - ty1) * 0.15 + day])
    if "sau" in arms:
        rig_arms["sau"] = arm_from(arms["sau"])

    q = lambda v: round(float(v) / K, 1)
    P = lambda p: [q(p[0]), q(p[1])]
    B = lambda b: [q(max(0, b[0])), q(max(0, b[1])), q(min(w, b[2])), q(min(h, b[3]))]
    rig = {
        "_huong_dan": [
            "Toa do tinh theo diem anh cua hinh dung trong anh xem-khop.png (goc tren ben trai la 0,0).",
            "hop = [trai, tren, phai, duoi]. Sua so roi chay lai cong cu. Xoa file nay de cong cu tu doan lai.",
            "tay_truoc la tay gan nguoi xem, cung la tay cam vu khi. day = be day canh tay (0 = chi cat theo hop).",
            "sao_chep = dung lai manh khac lam ban sau (to toi hon); lech = doi sang phai, xuong duoi bao nhieu diem.",
            "phu = phan phu nhu duoi, non: hop, khop (cho gan vao than), gan (than hoac dau), lop (truoc hoac sau), lac (do dung dua), day (chi lay phan manh hon so nay; 0 = lay ca hop).",
        ],
        "manh": {
            "dau": {"hop": B(head_box)},
            "than": {"hop": B([tcx - tw / 2, ty0, tcx + tw / 2, ty1])},
        },
        "khop": {"co": P([ncx, neck])},
        "phu": [],
    }
    a = rig_arms["truoc"]
    rig["manh"]["tay_truoc"] = {"hop": B(a["box"]), "day": q(a["day"])}
    mid = lambda p, r, t=0.5: [p[0] + (r[0] - p[0]) * t, p[1] + (r[1] - p[1]) * t]
    rig["khop"].update(vai_truoc=P(a["sh"]), khuyu_truoc=P(mid(a["sh"], a["hand"])), ban_tay_truoc=P(a["hand"]))
    if "sau" in rig_arms:
        b = rig_arms["sau"]
        rig["manh"]["tay_sau"] = {"hop": B(b["box"]), "day": q(b["day"])}
        rig["khop"].update(vai_sau=P(b["sh"]), khuyu_sau=P(mid(b["sh"], b["hand"])), ban_tay_sau=P(b["hand"]))
    else:
        rig["manh"]["tay_sau"] = {"sao_chep": "tay_truoc", "lech": [q(min(tw * 0.25, 2 * K)), 0]}
    for name in ("truoc", "sau"):
        lg = legs[name]
        rig["manh"]["chan_" + name] = {"hop": B(lg["box"]), "day": 0}
        rig["khop"].update({"hong_" + name: P(lg["hip"]), "goi_" + name: P(mid(lg["hip"], lg["foot"], 0.48)), "ban_chan_" + name: P(lg["foot"])})
    for k, e in enumerate(extras):
        back = e["tip"][0] < tcx
        name = "duoi" if back and e["att"][1] > ty0 + (ty1 - ty0) * 0.4 else "phu%d" % (k + 1)
        b = e["box"]
        rig["phu"].append({"ten": name, "hop": B([b[0] - K, b[1] - K, b[2] + K, b[3] + K]), "khop": P(e["att"]),
                           "gan": "than", "lop": "sau" if back else "truoc", "lac": 10,
                           "day": q(2 * r_open + K)})
        notes.append("Thấy một phần phụ thò ra (%s). Nếu không đúng thì xoá mục này trong rig.json." % name)
    return rig, notes


# ---------- tách mảnh theo rig ----------
def _box_mask(shape, box, K):
    h, w = shape
    x0, y0, x1, y1 = [int(round(v * K)) for v in box]
    m = np.zeros(shape, bool)
    m[max(0, y0):max(0, y1), max(0, x0):max(0, x1)] = True
    return m


def _seg_dist(shape, a, b):
    """Khoảng cách từ tâm mỗi ô tới đoạn thẳng ab."""
    h, w = shape
    yy, xx = np.mgrid[0:h, 0:w]
    px, py = xx + 0.5 - a[0], yy + 0.5 - a[1]
    dx, dy = b[0] - a[0], b[1] - a[1]
    L2 = dx * dx + dy * dy
    t = np.clip((px * dx + py * dy) / L2, 0, 1) if L2 > 1e-9 else np.zeros(shape)
    return np.hypot(px - t * dx, py - t * dy)


def _disc(shape, c, r):
    h, w = shape
    yy, xx = np.mgrid[0:h, 0:w]
    return (xx + 0.5 - c[0]) ** 2 + (yy + 0.5 - c[1]) ** 2 <= r * r


def _half_width(mask, p, d, limit):
    """Nửa bề rộng của mảnh tại điểm p, đo theo phương vuông góc với hướng d."""
    n = np.array([-d[1], d[0]], float)
    n /= max(1e-9, np.hypot(*n))
    h, w = mask.shape
    out = []
    for s in (1, -1):
        k = 0.0
        while k < limit:
            x, y = int(p[0] + n[0] * s * (k + 1)), int(p[1] + n[1] * s * (k + 1))
            if not (0 <= x < w and 0 <= y < h and mask[y, x]):
                break
            k += 1
        out.append(k)
    return (out[0] + out[1]) / 2


def _between_rows(part):
    """Các ô nằm giữa điểm trái nhất và phải nhất của mảnh trên cùng một hàng."""
    left = np.logical_or.accumulate(part, axis=1)
    right = np.logical_or.accumulate(part[:, ::-1], axis=1)[:, ::-1]
    return left & right


def split_parts(idx, rig, K, ncol):
    """Cắt ảnh thành các mảnh theo rig. Trả về dict mô tả bộ xương để dựng khung hình.

    Chỉ số màu >= ncol là bản tối của màu (dùng cho tay chân phía sau).
    """
    M = idx != EMPTY
    shape = M.shape
    h, w = shape
    J = {k: np.array(v, float) * K for k, v in rig["khop"].items()}
    manh = rig["manh"]
    remaining = M.copy()
    parts, order_back, order_front = {}, [], []
    arm_cut = np.zeros(shape, bool)

    def new_part(name, mask, img=None, group=1, dark=False):
        im = np.full(shape, EMPTY, np.uint8)
        src = idx if img is None else img
        im[mask] = src[mask]
        parts[name] = dict(img=im, group=group, dark=dark)

    # 1. tay chân: mỗi cái gồm 2 đoạn (trên, dưới) nối ở khuỷu hoặc gối
    limb_defs = [
        ("tay_truoc", "vai_truoc", "khuyu_truoc", "ban_tay_truoc", 2),
        ("tay_sau", "vai_sau", "khuyu_sau", "ban_tay_sau", 3),
        ("chan_truoc", "hong_truoc", "goi_truoc", "ban_chan_truoc", 4),
        ("chan_sau", "hong_sau", "goi_sau", "ban_chan_sau", 5),
    ]
    limbs = {}
    regions = {}
    for name, jr, jm, jt, group in limb_defs:
        d = manh.get(name) or {}
        if d.get("sao_chep"):
            continue
        if jr not in J or jt not in J:
            raise SystemExit("rig.json thiếu khớp %s hoặc %s cho mảnh %s." % (jr, jt, name))
        root, tip = J[jr], J[jt]
        mid = J.get(jm, (root + tip) / 2)
        reg = remaining.copy()
        if d.get("hop"):
            reg &= _box_mask(shape, d["hop"], K)
        day = float(d.get("day", 0)) * K
        dist = np.minimum(_seg_dist(shape, root, mid), _seg_dist(shape, mid, tip))
        if day > 0:
            u = (tip - mid) / max(1e-9, np.hypot(*(tip - mid)))
            tip_ext = tip + u * day * 0.5
            reg &= np.minimum(dist, _seg_dist(shape, mid, tip_ext)) <= day / 2
        # bỏ mẩu rời không dính vào xương của mảnh (ví dụ khúc đuôi lọt vào hộp)
        lab, n = label(reg)
        if n > 1:
            near = np.unique(lab[reg & (dist <= 1.5 * K)])
            if len(near):
                reg = np.isin(lab, near[near > 0])
        if not reg.any():
            raise SystemExit("Mảnh %s không cắt được điểm nào. Xem lại hộp và khớp trong rig.json." % name)
        remaining &= ~reg
        regions[name] = (reg, root, mid, tip, group, d)
        if name.startswith("tay"):
            arm_cut |= reg

    # phần phụ (đuôi, nón...): cắt sau tay chân. Có "day" thì chỉ lấy phần mảnh hơn "day" nằm trong hộp.
    extras = []
    for e in rig.get("phu", []):
        reg = remaining & _box_mask(shape, e["hop"], K)
        day = float(e.get("day", 0)) * K
        if day > 0:
            reg &= ~open_disc(M, day / 2)
        if not reg.any():
            continue
        remaining &= ~reg
        piv = np.array(e["khop"], float) * K
        name = "phu_" + e["ten"]
        r = max(K, min(_half_width(reg, piv, (1, 0), 4 * K), _half_width(reg, piv, (0, 1), 4 * K)))
        ball = _disc(shape, piv, r) & M
        new_part(name, reg | ball, group=1)
        extras.append(dict(name=name, pivot=piv, gan=e.get("gan", "than"), lop=e.get("lop", "sau"), lac=float(e.get("lac", 10))))
        arm_cut |= reg

    # vá chỗ tay che lên chân (trước khi chia đoạn)
    leg_imgs = {}
    for name in ("chan_truoc", "chan_sau"):
        if name not in regions:
            continue
        reg = regions[name][0]
        both = reg.copy()
        for other in ("chan_truoc", "chan_sau"):
            if other in regions:
                both |= regions[other][0]
        fill = arm_cut & _between_rows(both) & M
        hop = regions[name][5].get("hop")
        if hop:
            fill &= _box_mask(shape, hop, K)
        img, have = fill_from(idx, reg, fill)
        leg_imgs[name] = img
        regions[name] = (have,) + regions[name][1:]

    body = remaining  # đầu và thân
    for name, (reg, root, mid, tip, group, d) in regions.items():
        src = leg_imgs.get(name, idx)
        u1 = (root - mid) / max(1e-9, np.hypot(*(root - mid)))
        u2 = (tip - mid) / max(1e-9, np.hypot(*(tip - mid)))
        nrm = u2 - u1
        yy, xx = np.mgrid[0:h, 0:w]
        lower = ((xx + 0.5 - mid[0]) * nrm[0] + (yy + 0.5 - mid[1]) * nrm[1]) > 0
        r_mid = max(K * 0.8, _half_width(reg, mid, nrm, 6 * K))
        p_root = root + (mid - root) * 0.35
        r_root = max(K, _half_width(reg, p_root, mid - root, 6 * K))
        dm = _disc(shape, mid, r_mid) & reg
        up_mask = (reg & ~lower) | dm
        lo_mask = (reg & lower) | dm
        # quả cầu ở gốc: lấy thêm điểm của thân quanh khớp để xoay không hở
        ball = _disc(shape, root, r_root) & (body | reg)
        up_mask2 = up_mask | ball
        new_part(name + "_1", up_mask2, img=src, group=group)
        new_part(name + "_2", lo_mask, img=src, group=group)
        limbs[name] = dict(root=root, mid=mid, tip=tip, parts=(name + "_1", name + "_2"), r_root=r_root, r_mid=r_mid)

    # bản sao cho tay chân phía sau
    for name, jr, jm, jt, group in limb_defs:
        d = manh.get(name) or {}
        src_name = d.get("sao_chep")
        if not src_name:
            continue
        if src_name not in limbs:
            raise SystemExit("Mảnh %s sao chép từ %s nhưng mảnh đó không có." % (name, src_name))
        off = np.array(d.get("lech", [0, 0]), float) * K
        ox, oy = int(round(off[0])), int(round(off[1]))
        s = limbs[src_name]
        for k in (0, 1):
            im = parts[s["parts"][k]]["img"]
            sh = np.full(shape, EMPTY, np.uint8)
            m = _shift(im != EMPTY, ox, oy)
            sh[m] = _shift(im, ox, oy)[m]
            parts[name + "_%d" % (k + 1)] = dict(img=sh, group=group, dark=bool(d.get("toi", True)))
        limbs[name] = dict(root=s["root"] + (ox, oy), mid=s["mid"] + (ox, oy), tip=s["tip"] + (ox, oy),
                           parts=(name + "_1", name + "_2"), r_root=s["r_root"], r_mid=s["r_mid"])
        J[jr], J[jm], J[jt] = limbs[name]["root"], limbs[name]["mid"], limbs[name]["tip"]
    for name in ("tay_sau", "chan_sau"):
        d = manh.get(name) or {}
        if d.get("toi") and not d.get("sao_chep"):
            for p in limbs[name]["parts"]:
                parts[p]["dark"] = True

    # 2. đầu và thân; vá chỗ tay che
    head_mask = body & _box_mask(shape, manh["dau"]["hop"], K)
    torso_mask = body & ~head_mask
    # mẩu vụn không dính vào khối chính của thân thì trả về cho đầu
    lab, n = label(torso_mask)
    if n > 1:
        sizes = np.bincount(lab.ravel(), minlength=n + 1)
        sizes[0] = 0
        main_t = lab == sizes.argmax()
        crumbs = torso_mask & ~main_t & dilate(head_mask, 2, True)
        if crumbs.any():
            crumb_ids = np.unique(lab[crumbs])
            mv = np.isin(lab, crumb_ids)
            head_mask |= mv
            torso_mask &= ~mv
    fill_t = arm_cut & _between_rows(torso_mask) & M
    timg, torso_have = fill_from(idx, torso_mask, fill_t)
    fill_h = arm_cut & _between_rows(head_mask) & M & ~torso_have
    himg, head_have = fill_from(idx, head_mask, fill_h)
    neck = J["co"]
    r_neck = max(K, _half_width(body, neck, (0, 1), 5 * K) * 0.9)
    nb = _disc(shape, neck, r_neck) & body
    new_part("than", torso_have | (nb & head_mask), img=np.where(torso_have, timg, idx).astype(np.uint8), group=1)
    new_part("dau", head_have | (nb & torso_mask), img=np.where(head_have, himg, idx).astype(np.uint8), group=1)

    for p in parts.values():
        if p["dark"]:
            m = p["img"] != EMPTY
            p["img"][m] = (p["img"][m] % ncol) + ncol

    hips = (limbs["chan_truoc"]["root"] + limbs["chan_sau"]["root"]) / 2
    feet = (limbs["chan_truoc"]["tip"] + limbs["chan_sau"]["tip"]) / 2
    order = (
        [e["name"] for e in extras if e["lop"] == "sau"]
        + ["tay_sau_1", "tay_sau_2", "chan_sau_1", "chan_sau_2", "chan_truoc_1", "chan_truoc_2", "than", "dau"]
        + [e["name"] for e in extras if e["lop"] != "sau"]
        + ["tay_truoc_1", "tay_truoc_2"]
    )
    return dict(parts=parts, limbs=limbs, extras=extras, J=J, K=K, order=order, size=(w, h),
                pelvis=hips, ground=np.array([feet[0], float(h)]), neck=neck)


def load_or_make_rig(path, idx, K, force_auto=False):
    """Đọc rig.json nếu có; chưa có thì tự đoán và ghi ra. Trả về (rig, ghi chú, có phải mới tạo)."""
    if path.exists() and not force_auto:
        rig = json.loads(path.read_text(encoding="utf-8"))
        return rig, [], False
    rig, notes = auto_rig(idx, K)
    path.write_text(json.dumps(rig, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return rig, notes, True
