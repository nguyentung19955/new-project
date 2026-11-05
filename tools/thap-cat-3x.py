#!/usr/bin/env python3
"""TURRET MERGE — cắt lại ảnh bị PHÓNG TO trên màn 3× (iPhone DPR 3) từ tấm ChatGPT gốc (docs/demo-hop-tuong/thap-art/raw_*.png).

Vì sao: nhiều PNG trước đây thu về "2× DPR" của cỡ hiển thị → trên iPhone (3×, canvas còn nhân R.s) ảnh bị kéo to 1.3–4×
→ viền mềm nhoè / răng cưa ("nhìn vỡ vỡ"). Đo bằng tools/thap-kt-min3x.js (tỉ lệ điểm ảnh màn / điểm ảnh PNG).

Cách làm (không vẽ gì mới, chỉ cắt lại đúng vùng cũ ở độ phân giải cao hơn):
  1. Tìm lại vị trí + tỉ lệ của TỪNG khung ảnh cũ trong tấm raw (so mẫu nhiều tỉ lệ, cv2.matchTemplate, tinh chỉnh dưới 1 điểm ảnh)
     → giữ nguyên khung hình, canh tâm, đăng ký khung (quái/trùm) như bản cũ.
  2. Khoá nền magenta ở độ phân giải gốc: alpha = đường cong học từ chính ảnh cũ (độ lệch khỏi #FF00FF → alpha cũ),
     tách trộn màu nền (c = (p − (1−a)·M)/a) → hết viền hồng; ảnh đặc: phần trong/ngoài lấy theo mặt nạ cũ (không thủng lỗ, không lẹm
     hình bên cạnh), chỉ dải viền lấy alpha mềm mới + làm mịn σ≈0.5 px (không bậc thang).
  3. Thu nhỏ Lanczos trên ảnh nhân-trước-alpha (premultiplied) về cỡ = tỉ lệ cần × cỡ cũ (≤ 3× cỡ CSS lớn nhất), loang màu ra mép trong suốt.
  4. Kiểm: thu bản mới về cỡ cũ so với ảnh cũ (sai số alpha / màu) — lệch nhiều thì GIỮ ảnh cũ.
Chạy: python3 tools/thap-cat-3x.py [tên ...]   (không tên = cả danh sách MUC)
"""
import os, sys, json
import numpy as np
import cv2
from PIL import Image
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art')
A = os.path.join(GOC, 'thap/assets')
OUT = os.environ.get('OUT', A)
M = np.array([255, 0, 255], np.float32)

# tên: (hệ số phóng K, [tấm raw ứng viên], kiểu 'dac' | 'sang')
#   K = tỉ lệ đo được (điểm ảnh màn lớn nhất ở 430×932 DPR 3 / điểm ảnh PNG), làm tròn lên; giới hạn bởi độ phân giải raw.
FX = ['raw_fx.png', 'raw_fx_B1.png', 'raw_fx_B2.png', 'raw_fx_B3.png', 'raw_fx_ST.png', 'raw_fx_summon_merge.png', 'raw_fx_buff_awaken.png'] + \
     ['raw_fx_T%02d.png' % i for i in (1, 2, 3, 4, 5, 6, 9, 14, 16, 18, 20, 22)]
TRUM = ['raw_trum8_a.png', 'raw_trum8_b.png', 'raw_trum8_b2.png', 'raw_trum8_c.png', 'raw_trum.png']
QUAI = ['raw_quai8_a.png', 'raw_quai8_b.png', 'raw_quai8_c.png', 'raw_quai.png']
MUC = {
    # hiệu ứng (dải 6 khung) — giới hạn 2× (khung 256): nổ to chỉ hiện chốc lát, giữ ngân sách bộ nhớ iOS
    'fx_dien': (2, FX, 'sang'), 'fx_no_phao': (2, FX, 'sang'), 'fx_laser_trung': (2, FX, 'sang'), 'fx_khoi_doc': (2, FX, 'sang'),
    'fx_bang_vo': (2, FX, 'sang'), 'fx_starup': (1.65, FX, 'sang'), 'fx_merge': (1.35, FX, 'sang'), 'fx_awaken': (1.45, FX, 'sang'),
    'fx_summon': (1.5, FX, 'sang'), 'fx_chop_nong': (1.1, FX, 'sang'),
    # đồ vật hiệu ứng (S4)
    'hu_trangkhuyet': (2, ['raw_s4.png'], 'sang'), 'hu_hoden': (2, ['raw_s4.png'], 'dac'), 'hu_khoa': (2.65, ['raw_s4.png'], 'sang'),
    'pandora_dia': (1.8, ['raw_s4.png'], 'dac'), 'fx_vong_lv': (1.95, ['raw_s4.png'], 'sang'), 'hat_tuyet': (1.5, ['raw_s4.png'], 'sang'),
    'vong_xich': (1.15, ['raw_s4.png'], 'dac'),
    # quái / trùm (dải 8 khung + dải 4 khung)
    'quai_khong_lo_8': (1.8, QUAI, 'dac'),
    'trum_octopus_8': (1.5, TRUM, 'dac'), 'trum_joker_king_8': (1.5, TRUM, 'dac'), 'trum_freezer_8': (1.5, TRUM, 'dac'),
    'trum_mad_crown_8': (1.5, TRUM, 'dac'), 'trum_janus_8': (1.5, TRUM, 'dac'), 'trum_nightmare_8': (1.5, TRUM[:4], 'dac'),
    'trum_octopus': (1.4, TRUM, 'dac'), 'trum_joker_king': (1.4, TRUM, 'dac'), 'trum_freezer': (1.4, TRUM, 'dac'),
    'trum_mad_crown': (1.4, TRUM, 'dac'), 'trum_janus': (1.4, TRUM, 'dac'), 'trum_nightmare': (1.4, TRUM, 'dac'),
    # HUD / huy hiệu trên canvas
    'hud_ten_ban': (1.75, ['raw_s1.png'], 'dac'), 'h2_sao': (3.2, ['raw_hud2_07.png'], 'dac'),
    'nhan_kn': (2, ['raw_s10.png'], 'dac'),
    # thẻ / chân dung (DOM <img>)
    'the_khung_trang': (1.45, ['raw_s8.png'], 'dac'), 'the_khung_xanh': (1.45, ['raw_s8.png'], 'dac'), 'the_khung_tim': (1.45, ['raw_s8.png'], 'dac'),
    'the_khung_vang': (1.45, ['raw_s8.png'], 'dac'), 'the_khung_do': (1.45, ['raw_s8.png'], 'dac'), 'the_khung_mv': (2.05, ['raw_s8.png'], 'dac'),
    'af_hero': (1.6, ['raw_commanders.png'], 'dac'), 'af_dahlia': (1.6, ['raw_commanders.png'], 'dac'), 'af_eve': (1.6, ['raw_commanders.png'], 'dac'),  # 474 → tối đa độ nét raw (ô 724)
    # HUD dưới (DOM nền 100% 100% / contain — không phụ thuộc cỡ điểm ảnh)
    'h2_burst': (1.6, ['raw_hud2_12.png'], 'sang'),
    'h2_trieu_cho': (1.55, ['raw_hud2_01.png'], 'dac'), 'h2_trieu_san': (1.55, ['raw_hud2_01.png'], 'dac'), 'h2_trieu_an': (1.55, ['raw_hud2_01.png'], 'dac'),
    'h2_trieu_tat': (1.55, ['raw_hud2_01.png'], 'dac'),
    'h2_phim_dung_cho': (1.5, ['raw_hud2_10.png'], 'dac'), 'h2_phim_dung_an': (1.5, ['raw_hud2_10.png'], 'dac'), 'h2_phim_dung_tat': (1.5, ['raw_hud2_10.png'], 'dac'),
    'h2_phim_toc_cho': (1.5, ['raw_hud2_10.png'], 'dac'), 'h2_phim_toc_an': (1.5, ['raw_hud2_10.png'], 'dac'), 'h2_phim_toc_tat': (1.5, ['raw_hud2_10.png'], 'dac'),
    'h2_ngoc': (1.3, ['raw_hud2_05.png'], 'dac'),
    'h2_vai_tc': (1.15, ['raw_hud2_09.png'], 'dac'), 'h2_vai_ht': (1.15, ['raw_hud2_09.png'], 'dac'), 'h2_vai_db': (1.15, ['raw_hud2_09.png'], 'dac'),
    # lửa (CO_DINH; khoi_* không tìm thấy trong raw nào)
    'tia_lua': (1.15, FX + ['raw_dan.png'], 'sang'),
    'fx_link': (1.3, ['raw_fx_link.png'], 'sang'),
}

_raw = {}
NEN = {}  # màu nền của từng tấm raw: magenta (đa số) hoặc đen (tấm hiệu ứng phát sáng raw_fx, raw_dan, raw_fx_link…)


def raw(ten):
    if ten not in _raw:
        p = os.path.join(RAW, ten)
        _raw[ten] = np.asarray(Image.open(p).convert('RGB')).astype(np.float32) if os.path.exists(p) else None
        if _raw[ten] is not None:
            R = _raw[ten]
            bien = np.concatenate([R[:3].reshape(-1, 3), R[-3:].reshape(-1, 3), R[:, :3].reshape(-1, 3), R[:, -3:].reshape(-1, 3)])
            med = np.median(bien, axis=0)
            NEN[ten] = np.array([0, 0, 0], np.float32) if med.max() < 60 else M
    return _raw[ten]


def tren_nen(rgba, nen):
    a = rgba[..., 3:4] / 255.0
    return rgba[..., :3] * a + nen * (1 - a)


def mat_na(T):
    """mặt nạ so mẫu: bỏ lỗ trong suốt KÍN (cửa sổ khung thẻ…) — trong raw chỗ đó có thể không phải màu nền."""
    tr = T[..., 3] < 128
    lab, n = nd.label(tr)
    mep = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    lo = tr & ~np.isin(lab, list(mep))
    if lo.mean() < 0.03: return None
    return np.repeat((~lo).astype(np.float32)[..., None], 3, -1)


def tim(T, cands, goi_y=None):
    """T: khung RGBA (float) → (raw, x, y, s, điểm) — vùng raw = (x, y, x + w/s, y + h/s)."""
    h, w = T.shape[:2]
    mk = mat_na(T)
    tot = None
    for ten in ([goi_y[0]] if goi_y else cands):
        R = raw(ten)
        if R is None: continue
        Tm = tren_nen(T, NEN[ten]).astype(np.float32)
        H, W = R.shape[:2]
        # thô: mẫu ~56 px
        q = min(1.0, 56.0 / max(w, h))
        tq = cv2.resize(Tm, (max(8, round(w * q)), max(8, round(h * q))), interpolation=cv2.INTER_AREA)
        mq = None if mk is None else (cv2.resize(mk, (tq.shape[1], tq.shape[0]), interpolation=cv2.INTER_AREA) > 0.99).astype(np.float32)
        if goi_y: ss = goi_y[1] * np.exp(np.linspace(-0.05, 0.05, 11))
        else: ss = np.exp(np.linspace(np.log(max(w / W, h / H) * 1.0), np.log(1.15), 70))
        for s in ss:
            sq = s * q
            Rw, Rh = round(W * sq), round(H * sq)
            if Rw < tq.shape[1] or Rh < tq.shape[0]: continue
            Rq = cv2.resize(R, (Rw, Rh), interpolation=cv2.INTER_AREA)
            m = cv2.matchTemplate(Rq, tq, cv2.TM_CCOEFF_NORMED, mask=mq) if mq is not None else cv2.matchTemplate(Rq, tq, cv2.TM_CCOEFF_NORMED)
            m = np.nan_to_num(m, nan=-1, posinf=-1, neginf=-1)
            _, v, _, p = cv2.minMaxLoc(m)
            if tot is None or v > tot[4]: tot = (ten, p[0] / sq, p[1] / sq, s, v)
    if tot is None: return None
    # tinh: toàn cỡ mẫu, quét tỉ lệ hẹp + parabol dưới 1 điểm ảnh
    ten, x, y, s, _ = tot
    R = raw(ten); Tm = tren_nen(T, NEN[ten]).astype(np.float32)
    best = None
    for s2 in s * np.exp(np.linspace(-0.035, 0.035, 15)):
        x0, y0 = max(0, int(x - 12 / s2)), max(0, int(y - 12 / s2))
        x1, y1 = min(R.shape[1], int(x + (w + 12) / s2) + 1), min(R.shape[0], int(y + (h + 12) / s2) + 1)
        sub = R[y0:y1, x0:x1]
        Rs = cv2.resize(sub, (max(w, round(sub.shape[1] * s2)), max(h, round(sub.shape[0] * s2))), interpolation=cv2.INTER_AREA)
        m = cv2.matchTemplate(Rs, Tm, cv2.TM_CCOEFF_NORMED, mask=mk) if mk is not None else cv2.matchTemplate(Rs, Tm, cv2.TM_CCOEFF_NORMED)
        m = np.nan_to_num(m, nan=-1, posinf=-1, neginf=-1)
        _, v, _, p = cv2.minMaxLoc(m)
        px, py = float(p[0]), float(p[1])
        if 0 < p[0] < m.shape[1] - 1:
            a, b, c = m[p[1], p[0] - 1], m[p[1], p[0]], m[p[1], p[0] + 1]; d = a - 2 * b + c
            if d < 0: px += 0.5 * (a - c) / d
        if 0 < p[1] < m.shape[0] - 1:
            a, b, c = m[p[1] - 1, p[0]], m[p[1], p[0]], m[p[1] + 1, p[0]]; d = a - 2 * b + c
            if d < 0: py += 0.5 * (a - c) / d
        kx, ky = sub.shape[1] / Rs.shape[1], sub.shape[0] / Rs.shape[0]
        if best is None or v > best[4]: best = (ten, x0 + px * kx, y0 + py * ky, Rs.shape[1] / sub.shape[1], v)
    return best


def do_lech(p, nen):
    """độ lệch khỏi màu nền (0 = nền): magenta → max(g, 255−r, 255−b); đen → độ sáng max(r,g,b)."""
    return np.abs(p - nen).max(-1)


def lay(R, x, y, s, w, h, K, nen):
    """cắt vùng (x, y, w/s, h/s) của raw ở cỡ (W2, H2) = (w, h)·K: trả ảnh RGB float và độ lệch D (lọc Lanczos)."""
    W2, H2 = round(w * K), round(h * K)
    P = 96  # đệm màu nền: khung cũ có thể chìa ra ngoài mép raw
    Rp = np.empty((R.shape[0] + 2 * P, R.shape[1] + 2 * P, 3), np.float32); Rp[:] = nen; Rp[P:-P, P:-P] = R
    box = (x + P, y + P, x + P + w / s, y + P + h / s)
    im = Image.fromarray(np.clip(Rp, 0, 255).astype(np.uint8), 'RGB')
    rgb = np.asarray(im.resize((W2, H2), Image.LANCZOS, box=box)).astype(np.float32)
    D = do_lech(nen=nen, p=np.asarray(im.resize((W2, H2), Image.BOX if 1 / (s * K) > 1 else Image.BICUBIC, box=box)).astype(np.float32))
    return rgb, D


def hoc_alpha(Dnho, Acu):
    """đường cong D → alpha học từ ảnh cũ (trung vị theo ngăn, đơn điệu tăng)."""
    bins = np.linspace(0, 255, 65)
    idx = np.clip(np.digitize(Dnho.ravel(), bins) - 1, 0, 63)
    a = Acu.ravel()
    lut = np.zeros(64, np.float32); co = np.zeros(64, bool)
    for i in range(64):
        v = a[idx == i]
        if v.size >= 6: lut[i] = np.median(v); co[i] = True
    if not co.any(): return lambda D: np.clip(D, 0, 255)
    xs = (bins[:-1] + bins[1:]) / 2
    lut = np.interp(xs, xs[co], lut[co])
    lut = np.maximum.accumulate(lut)
    return lambda D: np.interp(D, xs, lut)


def mo_rong(m, r):
    return nd.binary_dilation(m, iterations=max(1, int(round(r)))) if r > 0 else m


def loang(rgb, a, buoc=4):
    """màu điểm đặc loang ra điểm trong suốt sát mép (GPU lọc ảnh không kéo màu đen/hồng vào viền)."""
    dac = a > 200
    if dac.sum() < 4: dac = a > 60
    out = rgb * dac[..., None]; wt = dac.astype(np.float32)
    k = np.array([[1, 2, 1], [2, 4, 2], [1, 2, 1]], np.float32)
    for _ in range(buoc):
        s = np.stack([nd.convolve(out[..., i], k, mode='nearest') for i in range(3)], -1)
        sw = nd.convolve(wt, k, mode='nearest')
        moi = (wt == 0) & (sw > 0)
        out[moi] = s[moi] / sw[moi, None]; wt[moi] = 1
    keep = a >= 250
    res = np.where(keep[..., None], rgb, np.where(wt[..., None] > 0, out, rgb))
    return res


def cat_khung(T, R, x, y, s, K, kieu, nen):
    h, w = T.shape[:2]
    rgb, D = lay(R, x, y, s, w, h, K, nen)
    H2, W2 = rgb.shape[:2]
    Acu = T[..., 3]
    # học đường cong alpha từ ảnh cũ (D thu về cỡ cũ ↔ alpha cũ)
    Dnho = np.asarray(Image.fromarray(np.clip(D, 0, 255).astype(np.uint8)).resize((w, h), Image.BOX)).astype(np.float32)
    f = hoc_alpha(Dnho, Acu)
    a = f(D)
    Aup = np.asarray(Image.fromarray(Acu.astype(np.uint8)).resize((W2, H2), Image.BICUBIC)).astype(np.float32)
    if kieu == 'dac':
        trong = nd.binary_erosion(Acu >= 250, iterations=1)
        ngoai = ~mo_rong(Acu > 4, 1)
        trong2 = np.asarray(Image.fromarray((trong * 255).astype(np.uint8)).resize((W2, H2), Image.BILINEAR)) > 128
        ngoai2 = np.asarray(Image.fromarray((ngoai * 255).astype(np.uint8)).resize((W2, H2), Image.BILINEAR)) > 128
        a = np.where(trong2, 255.0, np.where(ngoai2, 0.0, a))
        # viền: mịn σ≈0.5 px, không bậc thang
        mem = nd.gaussian_filter(a, 0.5)
        vien = ~nd.binary_erosion(a >= 250, iterations=1) & mo_rong(a > 0, 1)
        a = np.where(vien, mem, a)
    else:
        # hiệu ứng phát sáng: alpha theo đường cong học; giới hạn trong vùng ảnh cũ có hình (nới 2 px cũ)
        sp = mo_rong(Acu > 2, 2)
        sp2 = np.asarray(Image.fromarray((sp * 255).astype(np.uint8)).resize((W2, H2), Image.BILINEAR)).astype(np.float32) / 255
        a = a * nd.gaussian_filter(sp2, K)
    a = np.clip(a, 0, 255); a[a < 3] = 0
    al = a[..., None] / 255.0
    fg = (rgb - (1 - al) * nen) / np.maximum(al, 0.04)
    fg = np.clip(fg, 0, 255)
    # khử ám hồng còn sót ở viền: chỗ ảnh mới hồng hơn ảnh cũ (min(r,b) − g) → trừ phần hồng dư khỏi r, b (như tach_nen)
    if kieu == 'dac':
        cu = np.asarray(Image.fromarray(np.clip(T[..., :3], 0, 255).astype(np.uint8)).resize((W2, H2), Image.BICUBIC)).astype(np.float32)
        hong = lambda q: np.clip(np.minimum(q[..., 0], q[..., 2]) - q[..., 1], 0, None)
        du = np.clip(hong(fg) - hong(cu) - 12, 0, None)
        vien = mo_rong(a < 250, max(2, round(2 * K))) & (a > 0)
        du = du * vien
        fg[..., 0] -= du; fg[..., 2] -= du; fg = np.clip(fg, 0, 255)
    fg = loang(fg, a)
    return np.dstack([fg, a]).astype(np.float32)


def thu_ve(img, w, h):
    """RGBA float → cỡ (w,h) Lanczos nhân-trước-alpha."""
    im = Image.fromarray(np.clip(img, 0, 255).round().astype(np.uint8), 'RGBA').convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')
    return np.asarray(im).astype(np.float32)


def sai_so(new, old):
    a1, a0 = new[..., 3], old[..., 3]
    p1, p0 = new[..., :3] * a1[..., None] / 255, old[..., :3] * a0[..., None] / 255
    return float(np.abs(a1 - a0).mean()), float(np.abs(p1 - p0).mean())


def lam(ten, K, cands, kieu, bao):
    p = os.path.join(A, ten + '.png')
    old = np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
    H, W = old.shape[:2]
    n = max(1, round(W / H)) if (ten.startswith(('fx_', 'trum_', 'quai_', 'fxb_')) and ten not in ('fx_link', 'fx_vong_lv')) else 1
    fw = W / n
    if abs(fw - round(fw)) > 0.01: n, fw = 1, W
    fw = int(round(fw))
    goi = None; khop = []
    for i in range(n):
        T = old[:, i * fw:(i + 1) * fw]
        if T[..., 3].max() < 8: khop.append(None); continue
        m = tim(T, cands, goi)
        if goi and (m is None or m[4] < 0.95):
            m2 = tim(T, cands)
            if m2 and m2[4] > (m[4] if m else 0): m = m2
        if m is None or m[4] < 0.80:
            bao.append((ten, 'BO QUA', 'khung %d không tìm thấy trong raw (điểm %.2f)' % (i, m[4] if m else 0))); return None
        goi = (m[0], m[3]); khop.append(m)
    lim = min(1 / m[3] for m in khop if m)
    K = min(K, lim)  # không phóng quá độ nét của raw
    F2 = round(fw * K); K = F2 / fw  # khung nguyên điểm ảnh
    if K < 1.04:
        bao.append((ten, 'BO QUA', 'raw không nét hơn ảnh cũ (tối đa %.2f×)' % lim)); return None
    H2 = F2 if (n > 1 and fw == H) else round(H * K)
    out = np.zeros((H2, F2 * n, 4), np.float32)
    sai = []
    for i, m in enumerate(khop):
        if m is None: continue
        T = old[:, i * fw:(i + 1) * fw]
        rten, x, y, s, v = m
        k = cat_khung(T, raw(rten), x, y, s, K, kieu, NEN[rten])
        out[:k.shape[0], i * F2:i * F2 + min(F2, k.shape[1])] = k[:H2, :F2]
        nho = thu_ve(k, fw, H)
        ea, ec = sai_so(nho, T)
        # đúng hình? (so mẫu có thể khớp nhầm khung khác cùng tấm): IoU mặt nạ + tương quan màu nhân-alpha
        m1, m0 = nho[..., 3] > 64, T[..., 3] > 64
        iou = (m1 & m0).sum() / max(1, (m1 | m0).sum())
        cc = np.corrcoef((nho[..., :3] * nho[..., 3:4]).ravel(), (T[..., :3] * T[..., 3:4]).ravel())[0, 1]
        if iou < 0.9 or cc < 0.95: ea = max(ea, 99)  # → LỆCH, giữ ảnh cũ
        sai.append((ea, ec, v, rten, 1 / s))
    if not sai: return None
    ea = max(e[0] for e in sai); ec = max(e[1] for e in sai); v = min(e[2] for e in sai); lim = min(e[4] for e in sai)
    ok = ea < 9 and ec < 9
    bao.append((ten, '%dx%d -> %dx%d' % (W, H, out.shape[1], out.shape[0]),
                'K %.2f (raw cho tối đa %.2f) %s khớp %.3f sai alpha %.1f màu %.1f %s' % (K, lim, sai[0][3], v, ea, ec, 'OK' if ok else 'LỆCH → giữ cũ')))
    if not ok: return None
    if lim < K * 0.98: bao[-1] = bao[-1][:2] + (bao[-1][2] + ' (raw chỉ đủ %.2f×: phần còn lại vẫn phóng)' % lim,)
    res = Image.fromarray(np.clip(out, 0, 255).round().astype(np.uint8), 'RGBA')
    res.save(os.path.join(OUT, ten + '.png'), optimize=True)
    return res


def khung_the(K, bao):
    """the_khung_*: chạy lại đúng phép cắt của tools/thap-cat-s89.py (cửa sổ đặt tại WIN, co giãn sx/sy theo cửa sổ) ở cỡ ×K."""
    src = open(os.path.join(GOC, 'tools/thap-cat-s89.py'), encoding='utf-8').read()
    g = {'__name__': 's89', '__file__': os.path.join(GOC, 'tools/thap-cat-s89.py')}
    dau = src[:src.index('# ---------- S8')]
    exec(dau, g)
    KW, KH = round(132 * K), round(160 * K)
    kx, ky = KW / 132, KH / 160
    WIN = (17 * kx, 30 * ky, 115 * kx, 140 * ky)
    TEN8 = {(0, 0): 'trang', (0, 1): 'xanh', (0, 2): 'tim', (1, 0): 'vang', (1, 1): 'do', (1, 2): 'mv'}
    im, o = g['cat']('raw_s8.png', 3, 2)
    for k, ten in TEN8.items():
        x0, y0, x1, y1 = o[k]
        c = im.crop((x0, y0, x1, y1))
        wx0, wy0, wx1, wy1 = g['cuaSo'](c)
        sx = (WIN[2] - WIN[0]) / (wx1 - wx0); sy = (WIN[3] - WIN[1]) / (wy1 - wy0)
        c2 = c.convert('RGBa').resize((max(1, round(c.width * sx)), max(1, round(c.height * sy))), Image.LANCZOS).convert('RGBA')
        dx, dy = round(WIN[0] - wx0 * sx), round(WIN[1] - wy0 * sy)
        tmp = Image.new('RGBA', (KW + 800, KH + 800)); tmp.alpha_composite(c2, (dx + 400, dy + 400)); out = tmp.crop((400, 400, 400 + KW, 400 + KH))
        a = np.asarray(out).astype(np.float32)
        al = a[..., 3]; mem = nd.gaussian_filter(al, 0.5); vien = ~nd.binary_erosion(al >= 250, iterations=1) & mo_rong(al > 0, 1)
        al = np.where(vien, mem, al); al[al < 3] = 0
        a = np.dstack([loang(a[..., :3], al), al])
        old = np.asarray(Image.open(os.path.join(A, 'the_khung_' + ten + '.png')).convert('RGBA')).astype(np.float32)
        ea, ec = sai_so(thu_ve(a, old.shape[1], old.shape[0]), old)
        ok = ea < 9 and ec < 12
        bao.append(('the_khung_' + ten, '%dx%d -> %dx%d' % (old.shape[1], old.shape[0], KW, KH), 'K %.2f s89 sai alpha %.1f màu %.1f %s' % (K, ea, ec, 'OK' if ok else 'LỆCH → giữ cũ')))
        print('  %-20s %-22s %s' % bao[-1], flush=True)
        if ok: Image.fromarray(np.clip(a, 0, 255).round().astype(np.uint8), 'RGBA').save(os.path.join(OUT, 'the_khung_' + ten + '.png'), optimize=True)


def vfx_hud(bao):
    """h2_vfx_cong / h2_vfx_ghep: alpha lọc theo màu (năng lượng) nên không so mẫu được → chạy lại day() của tools/thap-cat-hud2.py, khung 120 → 200 px."""
    src = open(os.path.join(GOC, 'tools/thap-cat-hud2.py'), encoding='utf-8').read()
    g = {'__name__': 'hud2', '__file__': os.path.join(GOC, 'tools/thap-cat-hud2.py')}
    exec(src[:src.index("R = 'raw_hud2_01.png'")], g)
    def luu(im, ten, ghi=''):
        a = np.asarray(im).astype(np.float32); a = np.dstack([loang(a[..., :3], a[..., 3]), a[..., 3]])
        old = np.asarray(Image.open(os.path.join(A, ten)).convert('RGBA')).astype(np.float32)
        ea, ec = sai_so(thu_ve(a, old.shape[1], old.shape[0]), old)
        ok = ea < 9 and ec < 9
        bao.append((ten[:-4], '%dx%d -> %dx%d' % (old.shape[1], old.shape[0], im.size[0], im.size[1]), 'day() hud2 sai alpha %.1f màu %.1f %s' % (ea, ec, 'OK' if ok else 'LỆCH → giữ cũ')))
        print('  %-20s %-22s %s' % bao[-1], flush=True)
        if ok: Image.fromarray(np.clip(a, 0, 255).round().astype(np.uint8), 'RGBA').save(os.path.join(OUT, ten), optimize=True)
    g['luu'] = luu; g['R'] = 'raw_hud2_13.png'
    d0 = src.index('def day('); d1 = src.index("day(320, 600")
    exec(src[d0:d1], g)
    g['day'](320, 600, (12, 308, 600, 890, 1180, 1470), 200, 'h2_vfx_cong.png', 'lanh')
    g['day'](600, 860, (890, 1180), 200, 'h2_vfx_ghep.png', 'nong', giu_vung=(98, 0, 192, 260))


def hao_quang(bao):
    """fxb_* (hào quang buff 4 khung): chạy lại docs/demo-hop-tuong/thap-art/cut_fx_buff.py với khung F 224 → 312 (≈ ô raw 313 px)."""
    src = open(os.path.join(RAW, 'cut_fx_buff.py'), encoding='utf-8').read()
    src = src.replace("F=224", "F=312").replace("OUT='/home/claude/new-project/thap/assets/'", "OUT=%r" % (OUT.rstrip('/') + '/'))
    src = src.replace("A='/home/claude/new-project/docs/demo-hop-tuong/thap-art/'", "A=%r" % (RAW + '/'))
    import contextlib, io
    with contextlib.redirect_stdout(io.StringIO()): exec(src, {'__name__': 'buff'})
    for n in ['dmg', 'toc', 'crit', 'max', 'cham', 'khien', 'chet', 'mana']:
        new = np.asarray(Image.open(os.path.join(OUT, 'fxb_%s.png' % n)).convert('RGBA')).astype(np.float32)
        old = np.asarray(Image.open(os.path.join(A if OUT != A else RAW, 'fxb_%s.png' % n)).convert('RGBA')).astype(np.float32) if OUT != A else None
        ea, ec = sai_so(thu_ve(new, old.shape[1], old.shape[0]), old) if old is not None else (0, 0)
        bao.append(('fxb_' + n, '896x224 -> %dx%d' % (new.shape[1], new.shape[0]), 'cut_fx_buff.py F=312 sai alpha %.1f màu %.1f' % (ea, ec)))
        print('  %-20s %-22s %s' % bao[-1], flush=True)


def sao_sang(bao, W=205):
    """h2_sao_sang: quầng vàng trong raw bị ám hồng → tools/thap-cat-hud2.py kéo màu về vàng sau khi tách nền; chạy lại đúng phép đó ở bề ngang 205 (cũ 76)."""
    src = open(os.path.join(GOC, 'tools/thap-cat-hud2.py'), encoding='utf-8').read()
    g = {'__name__': 'hud2', '__file__': os.path.join(GOC, 'tools/thap-cat-hud2.py')}
    exec(src[:src.index("R = 'raw_hud2_01.png'")], g)
    R = 'raw_hud2_07.png'
    _ss = np.asarray(g['cat'](R, (880, 330, 1300, 724))).astype(np.float32)
    _h = (_ss[..., 0] > 150) & (_ss[..., 2] > _ss[..., 1])
    _ss[..., 2] = np.where(_h, _ss[..., 1] * 0.25, _ss[..., 2]); _ss[..., 1] = np.where(_h, np.maximum(_ss[..., 1], _ss[..., 0] * 0.72), _ss[..., 1])
    im = Image.fromarray(_ss.astype(np.uint8), 'RGBA')
    im = im.convert('RGBa').resize((W, max(1, round(im.size[1] * W / im.size[0]))), Image.LANCZOS).convert('RGBA')
    a = np.asarray(im).astype(np.float32); a = np.dstack([loang(a[..., :3], a[..., 3]), a[..., 3]])
    old = np.asarray(Image.open(os.path.join(A, 'h2_sao_sang.png')).convert('RGBA')).astype(np.float32)
    ea, ec = sai_so(thu_ve(a, old.shape[1], old.shape[0]), old)
    ok = ea < 9 and ec < 9
    bao.append(('h2_sao_sang', '%dx%d -> %dx%d' % (old.shape[1], old.shape[0], im.size[0], im.size[1]), 'hud2 #07 sai alpha %.1f màu %.1f %s' % (ea, ec, 'OK' if ok else 'LỆCH → giữ cũ')))
    print('  %-20s %-22s %s' % bao[-1], flush=True)
    if ok: Image.fromarray(np.clip(a, 0, 255).round().astype(np.uint8), 'RGBA').save(os.path.join(OUT, 'h2_sao_sang.png'), optimize=True)


def nen_menu(bao):
    """nền menu: JPEG từ raw_s7b ở đủ độ phân giải raw (1024×1536) thay vì 600×900."""
    b = Image.open(os.path.join(RAW, 'raw_s7b.png')).convert('RGB')
    b.save(os.path.join(OUT, 'nen_menu.jpg'), quality=84, optimize=True, progressive=True)
    bao.append(('nen_menu', '600x900 -> %dx%d' % b.size, 'JPEG đủ cỡ raw (nền cover 430×932 @3× cần 1290 px: raw chỉ có 1024)'))
    print('  %-20s %-22s %s' % bao[-1], flush=True)


if __name__ == '__main__':
    ds = sys.argv[1:] or list(MUC)
    bao = []
    # chống chạy lại lên ảnh ĐÃ cắt lại (sẽ phóng thêm lần nữa): tools/thap-cat-3x.json ghi cỡ cũ → mới; FORCE=1 để bỏ qua
    DA = json.load(open(os.path.join(GOC, 'tools/thap-cat-3x.json'))) if os.path.exists(os.path.join(GOC, 'tools/thap-cat-3x.json')) else {}
    def da_cat(t):
        if os.environ.get('FORCE') or t not in DA: return False
        for e in ('.png', '.jpg'):
            f = os.path.join(A, t + e)
            if os.path.exists(f) and list(Image.open(f).size) == DA[t]['moi']: print('  %-20s đã cắt lại (%dx%d) — bỏ qua' % ((t,) + tuple(DA[t]['moi']))); return True
        return False
    if (not sys.argv[1:] or 'h2_vfx' in sys.argv[1:]) and not da_cat('h2_vfx_cong'): vfx_hud(bao)
    if (not sys.argv[1:] or 'nen_menu' in sys.argv[1:]) and not da_cat('nen_menu'): nen_menu(bao)
    if (not sys.argv[1:] or 'fxb' in sys.argv[1:]) and not da_cat('fxb_dmg'): hao_quang(bao)
    if (not sys.argv[1:] or 'h2_sao_sang' in sys.argv[1:]) and not da_cat('h2_sao_sang'): sao_sang(bao)
    ds = [t for t in ds if not da_cat(t)]
    ds = [t for t in ds if t in MUC]
    if any(t.startswith('the_khung') for t in ds) and not da_cat('the_khung_trang'):
        khung_the(2.05, bao); ds = [t for t in ds if not t.startswith('the_khung')]
    for t in ds:
        K, c, kieu = MUC[t]
        try:
            lam(t, K, c, kieu, bao)
        except Exception as e:
            bao.append((t, 'LỖI', repr(e)))
        print('  %-20s %-22s %s' % bao[-1], flush=True)
