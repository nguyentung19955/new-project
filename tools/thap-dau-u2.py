#!/usr/bin/env python3
"""TURRET MERGE — BỘ ĐẦU ỤNG u2 (ChatGPT, tấm 2×2) + ẢNH DẠNG GROW (tấm 3×1) → thap/assets.
Nguồn (giữ nguyên, không sửa): docs/demo-hop-tuong/thap-art/raw_u2_01..22.png (ô TL,TR,BL,BR; tên trong u2/u2_sheets.json)
                              docs/demo-hop-tuong/thap-art/raw_grow_<id>.png (dạng 1 / 2 / 3)
Việc làm (chạy lại được — luôn đọc từ raw; bản cũ chỉ cất 1 lần):
  1. Khoá magenta: alpha theo khoảng cách màu tới #FF00FF, mép: tách trộn (C = a·F + (1−a)·M) → màu F lấy từ điểm đặc
     gần nhất → không viền hồng, không quầng. Bỏ bụi nhỏ.
  2. Tách từng vật theo thành phần liên thông, gán ô theo trọng tâm.
  3. TÂM XOAY = tâm bệ tròn: tâm vòng nội tiếp lớn nhất → tinh chỉnh bằng khớp đường tròn (bình phương nhỏ nhất, bỏ điểm lệch)
     lên mép TRÁI của hình (nòng chĩa phải nên mép trái là vành bệ). Ảnh vuông, tâm xoay = tâm ảnh, nòng giữ hướng phải.
  4. Cỡ: K (HEAD_K) như tools/thap-dau-v2.py (thân mọi ụ nhìn bằng nhau trên bệ chung); dạng grow: STAGE_K theo cùng
     cách × [1, 1.04, 1.08] để dạng sau to dần nhẹ; STAGE_TIP = mũi nòng.
  5. Cỡ xuất = 3 × cỡ hiển thị CSS LỚN NHẤT (đo thap-kt-min3x.js: 272·K px thiết bị) — không vượt độ nét raw. Thu Lanczos nhân-trước-alpha.
  6. Cất bản cũ: <id>_nong_v1.png, <id>_nong_s1_v1.png…, nho/<id>_v1.png (cờ ?ucu=1 nạp lại bộ cũ + số cỡ cũ: window.ART_V1).
Chạy: python3 tools/thap-dau-u2.py [--chi-cat]   (--chi-cat: chỉ cắt vào docs/.../thap-art/u2/cut/, không đụng thap/)
"""
import importlib.util, json, os, re, shutil, sys
import numpy as np
from PIL import Image
from scipy import ndimage

GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
A = os.path.join(GOC, 'thap', 'assets'); JS = os.path.join(GOC, 'thap', 'js')
ART = os.path.join(GOC, 'docs', 'demo-hop-tuong', 'thap-art'); U2 = os.path.join(ART, 'u2'); CUT = os.path.join(U2, 'cut')
spec = importlib.util.spec_from_file_location('v2', os.path.join(GOC, 'tools', 'thap-dau-v2.py'))
V2 = importlib.util.module_from_spec(spec); spec.loader.exec_module(V2)
M = np.array([255., 0., 255.])
G_IDS = ['overlord', 'hopbi', 'tienhoa', 'lophanung', 'soi', 'orbital', 'cuongno', 'ngoisao', 'lienket', 'dongbo', 'hydra', 'cuuvi', 'ngaithoigian', 'ronglua', 'luoicheo']
NHAN_STAGE = [1.0, 1.03, 1.06]   # vành bệ dạng 2/3 to dần nhẹ
# tên trên tấm khác tên hiển thị trong text.js
TEN_KHAC = {'breaker': 'phagiap', 'blender': 'tron', 'clamp': 'kepha', 'mech wolf': 'soi'}


# ---------------------------------------------------------------- 1. khoá magenta
def khoa(rgb):
    """khoá magenta: NỀN = vùng gần #FF00FF nối ra mép ảnh (hoặc lỗ kín lớn, magenta thuần) → màu hồng/tím THẬT
    bên trong vật (chỉ khâu, ngọc) không bị đục. Dải 3 px sát nền: tách trộn C = a·F + (1−a)·M, F = màu điểm sâu bên
    trong gần nhất (viền đen của hình) → mép không còn màu hồng/tím, không quầng."""
    rgb = rgb.astype(np.float32)
    d = np.sqrt(((rgb - M) ** 2).sum(-1))
    gan = d < 90
    lab, n = ndimage.label(gan)
    H, W = d.shape
    bien = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
    if n:
        dt = ndimage.sum(np.ones_like(d), lab, range(1, n + 1)); md = ndimage.mean(d, lab, range(1, n + 1))
        ok = [i + 1 for i in range(n) if (i + 1) in bien or (dt[i] >= 120 and md[i] < 40)]
    else: ok = []
    nen = np.isin(lab, ok)
    dn = ndimage.distance_transform_edt(~nen)
    sau = dn >= 3.5
    idx = ndimage.distance_transform_edt(~sau, return_distances=False, return_indices=True)
    F = rgb[idx[0], idx[1]]
    FM = F - M; CM = rgb - M
    a = np.clip((CM * FM).sum(-1) / np.maximum((FM * FM).sum(-1), 1.0), 0, 1)
    a[sau] = 1; a[nen] = 0
    out = np.where(sau[..., None], rgb, F)
    return out, a


def boi(a, nho):
    """bỏ đốm nhỏ (bụi nén) — giữ thành phần có diện tích ≥ nho"""
    lab, n = ndimage.label(a > 0.5)
    if n == 0: return a, lab, []
    s = ndimage.sum(np.ones_like(a), lab, range(1, n + 1))
    giu = [i + 1 for i in range(n) if s[i] >= nho]
    return a, lab, giu


# ---------------------------------------------------------------- 3. tâm bệ tròn
def khop_tron(xs, ys):
    A_ = np.c_[2 * xs, 2 * ys, np.ones_like(xs)]; b = xs ** 2 + ys ** 2
    c, *_ = np.linalg.lstsq(A_, b, rcond=None)
    cx, cy = c[0], c[1]; r = np.sqrt(c[2] + cx ** 2 + cy ** 2)
    return cx, cy, r


def tam_be(mask):
    """tâm vành bệ tròn: RANSAC đường tròn trên ĐƯỜNG BIÊN TRÁI/TRÊN/DƯỚI (nửa trái) của hình — vành bệ là cung tròn
    dài nhất ở đó (nòng/cánh/gai chỉ chiếm đoạn ngắn). Rơi về tâm vòng nội tiếp nếu không khớp."""
    f = ndimage.binary_fill_holes(mask)
    d = ndimage.distance_transform_edt(f); m = d.max()
    ys, xs = np.nonzero(d >= 0.95 * m); c1 = np.array([xs.mean(), ys.mean()])
    ys, xs = np.nonzero(f); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    pts = []
    for y in range(y0, y1 + 1):
        r = np.nonzero(f[y])[0]
        if len(r): pts.append((r[0], y))
    xm = x0 + 0.62 * (x1 - x0)
    for x in range(x0, int(xm)):
        c = np.nonzero(f[:, x])[0]
        if len(c): pts.append((x, c[0])); pts.append((x, c[-1]))
    P = np.array(pts, float)
    rng = np.random.default_rng(7); best = None; H = y1 - y0
    for _ in range(4000):
        a, b, c = P[rng.choice(len(P), 3, replace=False)]
        try: cx, cy, r = khop_tron(np.array([a[0], b[0], c[0]]), np.array([a[1], b[1], c[1]]))
        except Exception: continue
        if not np.isfinite(r) or r < 0.28 * H or r > 0.62 * H or cx < x0 + 0.6 * r: continue
        if not f[int(min(max(cy, 0), f.shape[0] - 1)), int(min(max(cx, 0), f.shape[1] - 1))]: continue
        e = np.abs(np.hypot(P[:, 0] - cx, P[:, 1] - cy) - r); n = (e < 1.6).sum()
        if best is None or n > best[0]: best = (n, cx, cy, r)
    if best is None or best[0] < 40: return c1, None
    n, cx, cy, r = best
    e = np.abs(np.hypot(P[:, 0] - cx, P[:, 1] - cy) - r); k = e < 2.5
    cx, cy, r = khop_tron(P[k, 0], P[k, 1])
    return np.array([cx, cy]), r


def vuong(rgb, a, mask, tam, le=0.02):
    """ảnh RGBA vuông, tâm xoay = tâm ảnh, đủ chứa cả hình"""
    ys, xs = np.nonzero(mask)
    R = np.sqrt((xs + .5 - tam[0]) ** 2 + (ys + .5 - tam[1]) ** 2).max() * (1 + le) + 2
    n = int(np.ceil(R)) * 2
    rgba = np.dstack([rgb, a * 255 * mask]).clip(0, 255).astype(np.uint8)
    im = Image.fromarray(rgba, 'RGBA')
    x0, y0 = tam[0] - n / 2, tam[1] - n / 2
    # dời cả phần lẻ dưới điểm ảnh (affine, nhân-trước-alpha) → tâm bệ đúng tâm ảnh
    return im.convert('RGBa').transform((n, n), Image.AFFINE, (1, 0, x0, 0, 1, y0), resample=Image.BICUBIC).convert('RGBA')


def cat_tam(path, luoi, so_o):
    """→ list[(Image vuông, cách đo tâm) | None] theo thứ tự ô"""
    im = Image.open(path).convert('RGB'); rgb = np.asarray(im)
    H, W = rgb.shape[:2]
    out, a = khoa(rgb)
    cot, hang = luoi
    _, lab, giu = boi(a, 0.0008 * H * W)
    objs = [None] * (cot * hang)
    com = ndimage.center_of_mass(np.ones_like(a), lab, giu) if giu else []
    nhom = {}
    for i, (cy, cx) in zip(giu, com):
        o = min(cot - 1, int(cx / (W / cot))) + cot * min(hang - 1, int(cy / (H / hang)))
        nhom.setdefault(o, []).append(i)
    for o in range(min(so_o, cot * hang)):
        if o not in nhom: continue
        mk = np.isin(lab, nhom[o])
        # gồm cả mép alpha mềm quanh vật (dãn 3 px) nhưng chỉ trong ô
        vung = ndimage.binary_dilation(mk, iterations=3)
        aa = a * vung
        tam, cach = tam_be(mk)
        im = vuong(out, aa, vung, tam)
        objs[o] = (im, cach / im.size[0] if cach else None, cach)  # q = bán kính vành / cạnh ảnh, r = bán kính vành (px raw)
    return objs


def thu(im, n):
    """thu Lanczos nhân-trước-alpha"""
    if im.size[0] == n: return im
    return im.convert('RGBa').resize((n, n), Image.LANCZOS).convert('RGBA')


def mat(im): return ndimage.binary_fill_holes(np.asarray(im)[..., 3] > 110)


def do_K(im):
    a = mat(im); W = a.shape[0]
    _, _, dthan, dtoan, _ = V2.do_than(a)
    ys, xs = np.nonzero(a); far = float(np.sqrt((xs + .5 - W / 2) ** 2 + (ys + .5 - W / 2) ** 2).max() / (W / 2))
    co = (0.65 * dthan + 0.35 * dtoan) / W
    K = round(float(np.clip(V2.MUC / co, 0.62, min(1.12, 0.98 / far))), 3)
    return K, far, co, a


def co_xuat(K, n_raw):
    # đo bằng tools/thap-kt-min3x.js (430×932, DPR 3, cả 18 bộ bài): đầu lớn nhất trên màn = 272·K điểm ảnh thiết bị
    # (ô bàn chơi × R.s × DPR 3; trang ụ dùng icon nho/ chứ không dùng ảnh đầu) → xuất 276·K, không vượt raw
    return int(min(n_raw, int(np.ceil(276 * K / 4.0)) * 4))


# ---------------------------------------------------------------- bảng tên → id
def bang_ten():
    t = open(os.path.join(JS, 'text.js'), encoding='utf-8').read()
    ten = {}
    for m in re.finditer(r"^\s*([a-z0-9_]+):\s*\{\s*name:\s*'([^']+)'", t, re.M): ten.setdefault(m.group(2).lower(), m.group(1))
    sh = json.load(open(os.path.join(U2, 'u2_sheets.json'), encoding='utf-8'))
    rows = []
    for k, p in sorted(sh.items()):
        body = p.split('sprite sheet:', 1)[1].split('Tier colors')[0]
        cells = [c.strip() for c in re.findall(r"([^;\[]+?)\s*\[", body)]
        for i, c in enumerate(cells):
            id_ = ten.get(c.lower()) or TEN_KHAC.get(c.lower())
            rows.append((k, i, c, id_, 'tên khác' if c.lower() in TEN_KHAC else ''))
    return rows


def cat_v1(src, dst):
    if os.path.exists(src) and not os.path.exists(dst): shutil.copy2(src, dst)


if __name__ == '__main__':
    chi = '--chi-cat' in sys.argv
    os.makedirs(CUT, exist_ok=True)
    rows = bang_ten()
    # MAP.md
    L = ['# u2 — tên trên tấm → id ụ (tools/thap-dau-u2.py)', '', 'Tấm | ô | tên trên tấm | id | ghi chú', '---|---|---|---|---']
    for k, i, c, id_, gc in rows: L.append('raw_u2_%s | %d (%s) | %s | %s | %s' % (k, i, 'TL TR BL BR'.split()[i], c, id_ or '**KHÔNG KHỚP**', gc))
    L += ['', 'Tên trên tấm khác tên trong game (đã khớp tay): Breaker → phagiap (Armor Breaker), Blender → tron (Fusion Mixer), '
          'Clamp → kepha (Jammer), Mech Wolf → soi (Werewolf).', '', 'Grow: raw_grow_<id>.png, 3 ô ngang = dạng 1 / 2 / 3 → <id>_nong_s1/_s2/_s3.png']
    open(os.path.join(U2, 'MAP.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')
    bao = []
    dau = {}
    for k in sorted({r[0] for r in rows}):
        ds = [r for r in rows if r[0] == k]
        objs = cat_tam(os.path.join(ART, 'raw_u2_%s.png' % k), (2, 2), len(ds))
        for (k_, i, c, id_, _), ob in zip(ds, objs):
            if not id_ or ob is None: bao.append(('THIEU', k, i, c)); continue
            im, cach, _ = ob; im.save(os.path.join(CUT, id_ + '_nong.png')); dau[id_] = (im, cach)
    stage = {}
    for id_ in G_IDS:
        p = os.path.join(ART, 'raw_grow_%s.png' % id_)
        objs = cat_tam(p, (3, 1), 3)
        for s, ob in enumerate(objs):
            if ob is None: bao.append(('THIEU', 'grow', id_, s + 1)); continue
            ob[0].save(os.path.join(CUT, '%s_nong_s%d.png' % (id_, s + 1))); stage[(id_, s + 1)] = ob
    for b in bao: print(*b)
    print('cut', len(dau), 'heads,', len(stage), 'stages')
    if chi: sys.exit(0)

    # ------------------------------------------------ lắp vào thap/
    mt = open(os.path.join(JS, 'meta.js'), encoding='utf-8').read(); at = open(os.path.join(JS, 'artscale.js'), encoding='utf-8').read()
    AM = V2.js_obj(mt, 'ART_META'); HK = V2.js_obj(at, 'HEAD_K'); SK = V2.js_obj(at, 'STAGE_K') or {}; ST = V2.js_obj(at, 'STAGE_TIP') or {}
    SDM = V2.js_obj(at, 'STAGE_DAU_MOI') or {}
    V1 = V2.js_obj(at, 'ART_V1')
    if V1 is None:   # lần đầu: chụp số cỡ của bộ đầu cũ (cho ?ucu=1)
        V1 = {'HEAD_K': dict(HK), 'STAGE_K': dict(SK), 'STAGE_TIP': dict(ST), 'STAGE_DAU_MOI': dict(SDM),
              'META': {i: {'s': AM[i].get('s'), 'tip': AM[i].get('tip')} for i in AM if i in HK}}
    ten_v1 = set()
    bang = []
    # CỠ THEO VÀNH BỆ: đường kính vành = VANH (phần ô) cho mọi đầu + mọi dạng → đầu ngồi khít bệ, đổi dạng không nhảy cỡ.
    # VANH = trung vị theo cách đo thân cũ (giữ cỡ nhìn chung như bộ trước). Chặn: mũi xa nhất ≤ 0.49 ô.
    VANH = float(np.median([do_K(im)[0] * 2 * q for im, q in dau.values() if q]))
    print('VANH', round(VANH, 3))

    def K_vanh(im, q, nhan=1.0, tran=0.98):
        K0, far, co, _ = do_K(im)
        K = VANH * nhan / (2 * q) if q else K0
        return round(float(min(K, tran / far)), 3), far
    for id_, (im, cach) in sorted(dau.items()):
        dst = os.path.join(A, id_ + '_nong.png')
        cat_v1(dst, os.path.join(A, id_ + '_nong_v1.png')); ten_v1.add(id_ + '_nong')
        K, far = K_vanh(im, cach)
        n = co_xuat(K, im.size[0]); thu(im, n).save(dst); V2.LM.lam(dst)
        HK[id_] = K; AM.setdefault(id_, {})['s'] = round(K / 0.8, 3); AM[id_]['tip'] = min(0.98, V2.mui(mat(Image.open(dst))))
        ic = os.path.join(A, 'nho', id_ + '.png'); cat_v1(ic, os.path.join(A, 'nho', id_ + '_v1.png')); ten_v1.add('nho/' + id_)
        V2.icon(id_, K, far)
        bang.append((id_, cach, K, round(far, 3), n))
    for id_ in G_IDS:
        ks, tips = [], []
        # 3 dạng cùng 1 tấm (cùng tỉ lệ raw) → vành bệ cùng bán kính: lấy trung vị (1 dạng có vòng ngắm/hào quang to hơn vành
        # — vd. Vệ Tinh dạng 3 — không làm lệch cỡ)
        rs = [stage[(id_, s)][2] for s in (1, 2, 3) if (id_, s) in stage and stage[(id_, s)][2]]
        rm = float(np.median(rs)) if rs else None
        for s in (1, 2, 3):
            ob = stage.get((id_, s))
            if not ob: ks = None; break
            im = ob[0]; dst = os.path.join(A, '%s_nong_s%d.png' % (id_, s))
            cat_v1(dst, os.path.join(A, '%s_nong_s%d_v1.png' % (id_, s)))
            r = ob[2] if ob[2] and rm and abs(ob[2] / rm - 1) < 0.12 else rm
            K, far = K_vanh(im, r / im.size[0] if r else ob[1], NHAN_STAGE[s - 1], 1.06)   # dạng thức tỉnh được tràn ô nhẹ (≤ 0.53 ô)
            n = co_xuat(K, im.size[0]); thu(im, n).save(dst); V2.LM.lam(dst)
            ks.append(K); tips.append(min(0.98, max(0.72, V2.mui(mat(Image.open(dst))))))
            bang.append(('%s_s%d' % (id_, s), ob[1], K, round(far, 3), n))
        if ks: SK[id_] = ks; ST[id_] = tips; SDM.pop(id_, None)
    open(os.path.join(JS, 'meta.js'), 'w', encoding='utf-8').write(V2.js_set(mt, 'ART_META', AM))
    at = V2.js_set(V2.js_set(V2.js_set(at, 'HEAD_K', HK), 'STAGE_K', SK), 'STAGE_TIP', ST)
    at = V2.js_set(at, 'STAGE_DAU_MOI', SDM)
    at = V2.js_set(at, 'ART_V1', V1, '// ?ucu=1: bộ đầu CŨ (trước u2) — ảnh <ten>_v1.png + số cỡ cũ (thap/js/text.js anhTen())')
    at = V2.js_set(at, 'DAU_V1', sorted(ten_v1 | set(V2.js_obj(at, 'DAU_V1') or [])))
    open(os.path.join(JS, 'artscale.js'), 'w', encoding='utf-8').write(at)
    for b in bang: print('%-16s q %-6s K %.3f far %.3f n %d' % (b[0], round(b[1], 3) if b[1] else None, b[2], b[3], b[4]))
