#!/usr/bin/env python3
"""Cắt tờ hiệu ứng v2 (ChatGPT, nền magenta) → thap/assets/fx_<id>_<cot>.png + js/fxu-meta.js + contact sheet.
Khoá màu: color-to-alpha theo màu nền đo ở viền (giữ quầng sáng mềm) + lõi đặc (khác nền nhiều → alpha 1) cho hình có viền.
Ô có thể lệch: gom thành phần liên thông, chia ô theo trọng tâm.
Dùng: python3 tools/thap-cat-fxv2.py
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, 'docs/demo-hop-tuong/thap-art')
OUT = os.path.join(ROOT, 'thap/assets')
TV = os.path.join(ROOT, 'docs/demo-hop-tuong/tuvan/fxv2')
os.makedirs(TV, exist_ok=True)

COT = ['dan', 'no', 'trung', 'hieu']
CO = {'dan': 96, 'no': 96, 'trung': 128, 'hieu': 128}
TO = {  # tờ 4×4: hàng = ụ (thứ tự trong HIEU-UNG-U-MOI.md)
    'T01': ['canon', 'mortar', 'bomhen', 'min'],
    'T02': ['bua', 'nam', 'loren', 'phagiap'],
    'T03': ['lien', 'phun', 'sungluc', 'xucxac'],
    'T04': ['tia', 'no5', 'railgun', 'docton'],
    'T05': ['bang', 'kiembang', 'baotuyet', 'lanhgia'],
    'T06': ['khoathoigian', 'guongcong', 'khien', 'taylo'],
    'T07': ['doc', 'vungdoc', 'tuthan', 'nhanmana'],
    'T08': ['set', 'bao', 'epxung', 'nangluong'],
    'T09': ['anhsang', 'aten', 'haoquang', 'hasao'],
    'T10': ['nangsao', 'vughep', 'santhuong', 'pandora'],
    'T11': ['blackhole', 'dichchuyen', 'tron', 'xaotron'],
    'T12': ['mana', 'hutmana', 'khuech', 'saochep'],
    'T13': ['chimang', 'radar', 'thaukinh', 'luoicheo'],
    'T14': ['laser', 'nemesis', 'nhatthuc', 'marionette'],
    'T15': ['cauvong', 'mimic', 'combo', 'nayda'],
    'T16': ['drone', 'chuato', 'kepha', 'nhieusong'],
    'T17': ['maychem', 'sinhdoi', 'nhanban', 'loa'],
    'T18': ['wallgen', 'khoisinh', 'leviathan', 'ronglua'],
    'T19': ['overlord', 'orbital', 'dongbo', 'ngoisao'],
    'T20': ['cuongno', 'soi', 'cuuvi', 'hopbi'],
    'T21': ['lophanung', 'hydra', 'lienket', 'ngaithoigian'],
}
TO_G = {  # tờ dạng 2/3: cột = dan2, dan3, trung3, dacbiet
    'G1': ['overlord', 'orbital', 'dongbo', 'ngoisao'],
    'G2': ['cuongno', 'soi', 'cuuvi', 'hopbi'],
    'G3': ['lophanung', 'hydra', 'lienket', 'ngaithoigian'],
    'G4': ['tienhoa', 'ronglua', 'luoicheo', 'chuato'],
}
T22 = [['fx_tienhoa_dan', 'fx_tienhoa_no', 'fx_tienhoa_trung', 'fx_tienhoa_hieu'],
       ['fx_vet_trang', 'fx_cham_trang', 'fx_vong_mong', 'fx_than'],
       ['fx_tia_sao', 'fx_song_xung', 'fx_bui', 'fx_vo_dan'],
       ['fx_giot_nuoc', 'fx_la', 'fx_hoa_giay', 'fx_set_nho']]
CO22 = {'fx_vet_trang': 128, 'fx_cham_trang': 48, 'fx_vong_mong': 128, 'fx_than': 48, 'fx_tia_sao': 64, 'fx_song_xung': 128,
        'fx_bui': 64, 'fx_vo_dan': 48, 'fx_giot_nuoc': 48, 'fx_la': 48, 'fx_hoa_giay': 48, 'fx_set_nho': 64}
ST = ['cham', 'dong', 'doc', 'chay', 'choang', 'yeu', 'giapvo', 'cauvong', 'kep', 'frostbite', 'dau', 'khienvang', 'keo', 'tua', 'doclay', 'xutu']
B = {'B1': ['tia', 'sungluc', 'laser', 'railgun', 'anhsang', 'haoquang'],
     'B2': ['hydra', 'dongbo', 'tienhoa', 'nhatthuc', 'leviathan', 'khoisinh'],
     'B3': ['set', 'bao', 'overlord', 'orbital', 'nemesis', 'docton']}
# hình mềm (quầng sáng, trắng tô màu, tia): chỉ color-to-alpha, không ép lõi đặc
MEM = {'fx_vet_trang', 'fx_cham_trang', 'fx_vong_mong', 'fx_tia_sao', 'fx_song_xung', 'fx_set_nho'}

META = {}
CONTACT = []


def nen(a):
    v = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    return np.median(v, axis=0)


def khoa(a, bg, mem):
    """RGB float 0..255 → RGBA float (color-to-alpha + lõi đặc)."""
    bg = np.where(bg > 235, 255.0, np.where(bg < 20, 0.0, bg))
    d = a - bg
    dn0 = np.sign(d) * np.maximum(np.abs(d) - 8, 0)  # bỏ nhiễu nén quanh màu nền
    up = np.where(dn0 > 0, dn0 / np.maximum(255 - bg, 1), 0)
    dn = np.where(dn0 < 0, -dn0 / np.maximum(bg, 1), 0)
    al = np.clip(np.max(np.maximum(up, dn), axis=2), 0, 1)
    if not mem:
        dist = np.sqrt((d ** 2).sum(2))
        solid = dist > 95
        solid = ndi.binary_erosion(solid, iterations=1)
        soft = ndi.gaussian_filter(solid.astype(np.float32), 0.8)
        al = np.maximum(al, np.clip(soft * 1.4, 0, 1))
    al[al < 0.035] = 0
    a2 = np.where(al[..., None] > 0, bg + d / np.maximum(al[..., None], 1e-3), 0)
    # pixel đặc: giữ màu gốc (không đẩy màu)
    a2 = np.where(al[..., None] >= 0.999, a, a2)
    return np.dstack([np.clip(a2, 0, 255), al * 255])


GIU_HONG = ('cauvong', 'mimic', 'combo', 'st_cauvong')  # ảnh có màu hồng/tím thật (dải cầu vồng, viên hồng)


def khu_hong(rgba, ten=''):
    """Khử viền hồng/tím sẫm của nền magenta (ChatGPT đổ bóng magenta sẫm quanh hình → khoá màu tưởng là phần đặc).
    Ảnh KHÔNG phải tông tím/hồng: điểm có sắc magenta (R≈B, cả hai > G) bị giảm alpha theo độ magenta + trừ phần magenta.
    Ảnh tông tím/hồng (hoặc trong GIU_HONG) giữ nguyên."""
    if any(k in ten for k in GIU_HONG):
        return rgba
    a = rgba
    al = a[..., 3] / 255
    R, G, B = a[..., 0], a[..., 1], a[..., 2]
    mx = np.maximum(np.maximum(R, B), 1)
    hue = np.abs(R - B) / mx < 0.4
    m = np.where(hue, (np.minimum(R, B) - G) / mx, 0)
    dac = al > 0.9
    if dac.sum() < 20:
        return a
    if ((m > 0.45) & dac).sum() / dac.sum() > 0.30:  # ảnh tông tím/hồng
        return a
    f = np.clip(1 - (m - 0.25) / 0.4, 0, 1)
    s = np.clip(np.minimum(R, B) - G, 0, None) * (m > 0.25)
    o = a.copy()
    o[..., 0] = R - s; o[..., 2] = B - s
    o[..., 3] = a[..., 3] * f
    return o


def luu(rgba, ten, cmax, pivot='giua'):
    rgba = khu_hong(rgba, ten)
    al = rgba[..., 3]
    ys, xs = np.nonzero(al > 8)
    if len(xs) == 0:
        print('  RỖNG', ten); return
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    # vệt mảnh mờ (đường nối ô / nhiễu) kéo dài khung → bỏ, khung theo phần đặc + lề 8 px
    mo = ndi.binary_opening(al > 8, iterations=2)
    if mo.any():
        ys2, xs2 = np.nonzero(mo)
        b = (max(0, ys2.min() - 8), min(al.shape[0], ys2.max() + 9), max(0, xs2.min() - 8), min(al.shape[1], xs2.max() + 9))
        if (b[1] - b[0]) < 0.8 * (y1 - y0) or (b[3] - b[2]) < 0.8 * (x1 - x0):
            print('  cắt vệt mảnh', ten, (y1 - y0, x1 - x0), '→', (b[1] - b[0], b[3] - b[2]))
            rgba = rgba.copy(); keep = np.zeros(al.shape, bool); keep[b[0]:b[1], b[2]:b[3]] = True
            rgba[..., 3] *= keep; y0, y1, x0, x1 = b
    c = rgba[y0:y1, x0:x1]
    h, w = c.shape[:2]
    s = min(1.0, cmax / max(w, h))
    nw, nh = max(1, round(w * s)), max(1, round(h * s))
    im = Image.fromarray(c.astype(np.uint8), 'RGBA')
    # thu nhỏ trên ảnh nhân alpha trước (tránh viền tối)
    pm = c.copy(); pm[..., :3] *= pm[..., 3:4] / 255
    imp = Image.fromarray(pm.astype(np.uint8), 'RGBA').resize((nw, nh), Image.LANCZOS)
    q = np.asarray(imp).astype(np.float32)
    q[..., :3] = np.where(q[..., 3:4] > 0, q[..., :3] * 255 / np.maximum(q[..., 3:4], 1), 0)
    im = Image.fromarray(np.clip(q, 0, 255).astype(np.uint8), 'RGBA')
    im.save(os.path.join(OUT, ten + '.png'), optimize=True)
    # tâm neo: đạn = trọng tâm phần đặc (thân đạn, bỏ vệt mờ); nòng = mép trái phần sáng; còn lại = giữa ảnh
    q = np.asarray(im).astype(np.float32)[..., 3] / 255
    px, py = 0.5, 0.5
    if pivot == 'dan':
        m = q > 0.92
        if m.sum() > 4:
            yy, xx = np.nonzero(m); px, py = (xx.mean() + 0.5) / nw, (yy.mean() + 0.5) / nh
    elif pivot == 'no':
        cols = np.nonzero(q.max(0) > 0.3)[0]
        px = (cols.min() if len(cols) else 0) / nw
    META[ten] = [nw, nh, round(float(px), 3), round(float(py), 3)]
    CONTACT.append((ten, im))


def tach_luoi(a, rgba, n_r, n_c):
    """→ dict (r,c) → rgba crop (ảnh cùng cỡ, chỉ giữ thành phần của ô)."""
    H, W = rgba.shape[:2]
    m = rgba[..., 3] > 20
    md = ndi.binary_dilation(m, iterations=6)  # gom tia lửa lẻ vào thân
    lab, n = ndi.label(md)
    cs = ndi.center_of_mass(m.astype(np.float32) * (rgba[..., 3] / 255), lab, range(1, n + 1))
    area = ndi.sum(m, lab, range(1, n + 1))
    o = {}
    for i, ((cy, cx), ar) in enumerate(zip(cs, area), 1):
        if ar < 6 or np.isnan(cx):
            continue
        k = (min(n_r - 1, int(cy / (H / n_r))), min(n_c - 1, int(cx / (W / n_c))))
        o.setdefault(k, []).append(i)
    ra = {}
    for k, ids in o.items():
        mask = np.isin(lab, ids)
        r = rgba.copy(); r[..., 3] *= mask
        ra[k] = r
    return ra


def to44(ma, ten_o, kieu):
    p = os.path.join(ART, 'raw_fx_' + ma + '.png')
    if not os.path.exists(p):
        return False
    a = np.asarray(Image.open(p).convert('RGB')).astype(np.float32)
    bg = nen(a)
    print(ma, 'nền', bg.round())
    o = {}
    for mem in (False, True):
        o[mem] = tach_luoi(a, khoa(a, bg, mem), 4, 4)
    for r in range(4):
        for c in range(4):
            ten, cmax, pv = ten_o(r, c)
            if not ten:
                continue
            q = o[ten in MEM].get((r, c))
            if q is None:
                print('  THIẾU ô', ma, r, c, ten); continue
            luu(q, ten, cmax, pv)
    return True


def to_tia(ma, ids):
    p = os.path.join(ART, 'raw_fx_' + ma + '.png')
    if not os.path.exists(p):
        return False
    a = np.asarray(Image.open(p).convert('RGB')).astype(np.float32)
    bg = nen(a)
    rgba = khoa(a, bg, True)
    H, W = rgba.shape[:2]
    prof = rgba[..., 3].mean(1)
    on = prof > prof.max() * 0.06
    lab, n = ndi.label(on)
    bands = sorted([(s.start, s.stop) for s, in ndi.find_objects(lab)], key=lambda t: t[0])
    bands = [b for b in bands if b[1] - b[0] > 8]
    if len(bands) != len(ids):  # dải vỡ / dính: gom theo 6 khe đều (theo tâm dải), khe trống → chia đều
        print('  ', ma, 'số dải', len(bands), '→ gom theo khe')
        g = {}
        for b in bands:
            k = min(5, int((b[0] + b[1]) / 2 / (H / 6))); g.setdefault(k, []).append(b)
        bands = [(min(x[0] for x in g[k]), max(x[1] for x in g[k])) if k in g else (round(k * H / 6), round((k + 1) * H / 6)) for k in range(6)]
    for (y0, y1), id_ in zip(bands, ids):
        pad = 4; y0 = max(0, y0 - pad); y1 = min(H, y1 + pad)
        s = rgba[y0:y1, :]
        # lấy đoạn giữa (bỏ 2 đầu mờ) + hoà vòng → lặp liền mạch
        x0, L, ov = int(W * 0.12), int(W * 0.62), int(W * 0.12)
        seg = s[:, x0:x0 + L + ov].copy()
        out = seg[:, :L].copy()
        wv = np.linspace(0, 1, ov)[None, :, None]
        out[:, :ov] = seg[:, L:L + ov] * (1 - wv) + seg[:, :ov] * wv
        h = out.shape[0]; nw = 512; nh = max(8, round(h * nw / L))
        if nh > 64: nh = 64
        pm = out.copy(); pm[..., :3] *= pm[..., 3:4] / 255
        im = Image.fromarray(np.clip(pm, 0, 255).astype(np.uint8), 'RGBA').resize((nw, nh), Image.LANCZOS)
        q = np.asarray(im).astype(np.float32)
        q[..., :3] = np.where(q[..., 3:4] > 0, q[..., :3] * 255 / np.maximum(q[..., 3:4], 1), 0)
        im = Image.fromarray(np.clip(q, 0, 255).astype(np.uint8), 'RGBA')
        ten = 'fx_' + id_ + '_tia'
        im.save(os.path.join(OUT, ten + '.png'), optimize=True)
        META[ten] = [nw, nh, 0.5, 0.5]
        CONTACT.append((ten, im))
    print(ma, 'dải', len(bands))
    return True


co_to = []
for ma, ids in TO.items():
    if to44(ma, lambda r, c, ids=ids: ('fx_%s_%s' % (ids[r], COT[c]), CO[COT[c]], COT[c] if COT[c] in ('dan', 'no') else 'giua'), 'u'):
        co_to.append(ma)
for ma, ids in TO_G.items():
    cg = ['dan2', 'dan3', 'trung3', 'dacbiet']
    if to44(ma, lambda r, c, ids=ids: ('fx_%s_%s' % (ids[r], cg[c]), 128 if c >= 2 else 96, 'dan' if c < 2 else 'giua'), 'g'):
        co_to.append(ma)
if to44('T22', lambda r, c: (T22[r][c], CO22.get(T22[r][c], CO.get(T22[r][c].split('_')[-1], 96)), 'dan' if T22[r][c] in ('fx_tienhoa_dan', 'fx_vet_trang') else ('no' if T22[r][c] == 'fx_tienhoa_no' else 'giua')), 'h'):
    co_to.append('T22')
if to44('ST', lambda r, c: ('fx_st_' + ST[r * 4 + c], 128, 'giua'), 's'):
    co_to.append('ST')
for ma, ids in B.items():
    if to_tia(ma, ids):
        co_to.append(ma)

with open(os.path.join(ROOT, 'thap/js/fxu-meta.js'), 'w') as f:
    f.write('// sinh bởi tools/thap-cat-fxv2.py — [rộng, cao, neoX, neoY] của ảnh hiệu ứng v2 (đừng sửa tay)\n')
    f.write("'use strict';\nconst FXU_TO = " + json.dumps(co_to) + ';\n')
    f.write('const FXU_META = ' + json.dumps(META, separators=(',', ':')) + ';\n')

# contact sheet (nền ca-rô để thấy alpha)
cw, ch, ncol = 150, 120, 10
rows = (len(CONTACT) + ncol - 1) // ncol
sheet = Image.new('RGBA', (cw * ncol, ch * rows), (40, 44, 52, 255))
from PIL import ImageDraw
dr = ImageDraw.Draw(sheet)
for i, (ten, im) in enumerate(CONTACT):
    x, y = (i % ncol) * cw, (i // ncol) * ch
    for yy in range(y, y + ch - 18, 10):
        for xx in range(x, x + cw, 10):
            if ((xx - x) // 10 + (yy - y) // 10) % 2: dr.rectangle([xx, yy, xx + 9, yy + 9], fill=(60, 64, 72, 255))
    t = im.copy(); t.thumbnail((cw - 8, ch - 24))
    sheet.alpha_composite(t, (x + (cw - t.width) // 2, y + (ch - 18 - t.height) // 2))
    dr.text((x + 3, y + ch - 15), ten.replace('fx_', ''), fill=(230, 230, 230, 255))
sheet.convert('RGB').save(os.path.join(TV, 'cut_contact.png'), optimize=True)
print('xong', len(META), 'ảnh, tờ:', co_to)
