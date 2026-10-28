#!/usr/bin/env python3
"""Dựng sheet 2x + JSON cho Lam mới (thử 2): CHẠY 8 tư thế + CHÉM 1 gồm 4 tư thế – theo PHAN-HOI-11/12.

Nguồn (chỉ đọc): art/huong-moi/nguon/lam-tu-the/thu2-chay-8o.png (2 hàng × 4), thu2-chem1-4o.png (1 hàng × 4),
                 art/huong-moi/nguon/lam-moi-chuong-tan.png (Lam chốt – chỉ để đo so sánh).
Quy tắc (PH12 mục 3 + yêu cầu việc 1):
  - MỘT tỉ lệ cho cả sheet (không resize từng hình theo bounding box):
      CHÉM: dáng trung tính = D (hồi, đứng thế thủ) → cao 224 px nguồn = 112 px logic
      CHẠY: không có dáng đứng → lấy trung bình 4 tư thế "cao trung gian" (1, 3, 5, 7 – PH12 mục 1) = 224 px nguồn
  - Neo chung: y = mặt đất (đáy ủng chạm đất), x = trục thân; KHÔNG căn giữa từng ảnh:
      CHẠY: x giữ NGUYÊN vị trí trong ô của ảnh gen (ô 384 px; mắt lệch ±≈2 px logic giữa các ô → ảnh gen đã giữ trục thân);
            y: tư thế chạm đất (1,2,3,5,6,7) → đáy ủng = mặt đất; tư thế bay (4, 8) giữ độ nhấc so với mặt đất CỦA HÀNG trong ảnh gen.
      CHÉM: hai ủng trụ thấy rõ ở cả 4 ô → x = giữa hai ủng (như quy ước lam-rig: giữa hai ủng = giữa collider), y = đáy ủng.
            (vị trí trong ô của ảnh gen trôi tới 26 px nguồn giữa các ô → neo theo ô sẽ làm chân trượt)
  - Ô chung đủ chứa mọi tư thế; mọi khung cùng điểm neo (cùng định dạng lam-ct-*-2x.json).
Chạy: python3 dung_sheet.py   → ../sprite/lam-moi2-{chay,chem1}-{2x,3x}.{png,json}, ../kiem/so-do.json
  3x (Làm nét 28/10): thu thẳng từ ảnh gen bằng Lanczos + làm nét nhẹ có kẹp (lam_net) – cùng neo gen, cùng tỉ lệ; game dùng khi bộ đệm/logic > 2.
  (4x không làm: sheet chạy chỉ có ~389 px gen cho dáng trung tính → 448 px sẽ là PHÓNG ảnh gen, không thêm chi tiết.)
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
import cv2

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from tach import tach_anh, cat_o, do_tu_the

GOC = os.path.normpath(os.path.join(HERE, '..'))
NGUON = os.path.normpath(os.path.join(GOC, '..', 'nguon'))
SPR = os.path.join(GOC, 'sprite'); KIEM = os.path.join(GOC, 'kiem')
os.makedirs(SPR, exist_ok=True); os.makedirs(KIEM, exist_ok=True)
# cao dáng trung tính = 112 px logic × bội số (2x: 224 px nguồn, 3x: 336); lề trong ô 6 px nguồn ở 2x (theo bội số)
KHE = 2


def ung(rgba, m, y1):
    """hai ủng: điểm rất tối (độ sáng < 45, ít xanh) trong 22 hàng dưới cùng của tư thế → [(x_trái, x_phải, đáy)] (≤ 2 cụm lớn nhất)"""
    c = rgba[..., :3].astype(int); lum = c.mean(-1)
    d = m & (rgba[..., 3] > 128) & (lum < 45) & (c[..., 2] - c[..., 0] < 22)
    d[:y1 - 22] = False
    d = ndi.binary_opening(d, iterations=1)
    lab, n = ndi.label(d)
    cs = []
    for k in range(1, n + 1):
        yy, xx = np.nonzero(lab == k)
        if len(xx) >= 120: cs.append([int(xx.min()), int(xx.max()) + 1, int(yy.max()) + 1, len(xx)])
    cs.sort()
    gop = []                              # một ủng bị gấu áo cắt đôi → gộp cụm cách nhau < 20 px gen
    for c in cs:
        if gop and c[0] - gop[-1][1] < 20: g = gop[-1]; g[1] = max(g[1], c[1]); g[2] = max(g[2], c[2]); g[3] += c[3]
        else: gop.append(c)
    cs = sorted(gop, key=lambda t: -t[3])
    return sorted(cs[:2])


def lam_net(pm, kep, sigma, luong):
    """làm nét nhẹ CÓ KIỂM SOÁT trên ảnh alpha nhân trước (đã thu cỡ): unsharp bán kính nhỏ rồi KẸP mỗi kênh vào [min, max] của
    3×3 lân cận trong ảnh `kep` (= cùng ảnh thu bằng INTER_AREA, không gợn) → không có viền sáng / viền tối vượt (halo) – kể cả gợn
    của Lanczos –, mép alpha không răng cưa (alpha chỉ dốc hơn, không vượt khoảng sẵn có). Cuối cùng RGB ≤ alpha (điều kiện nhân trước)."""
    mo = cv2.GaussianBlur(pm, (0, 0), sigma)
    n = pm + luong * (pm - mo)
    k = np.ones((3, 3), np.uint8)
    lo = cv2.erode(kep, k); hi = cv2.dilate(kep, k)
    n = np.clip(n, lo, hi)
    n[..., 3] = np.clip(n[..., 3], 0, 1)
    n[..., :3] = np.minimum(np.clip(n[..., :3], 0, 1), n[..., 3:4])
    return n


def thu_co(pm, nw, nh, loc):
    """thu cả ảnh (alpha nhân trước) một lần: 'area' = cv2 INTER_AREA (cách của sheet 2x) ; 'lanczos' = PIL Lanczos (sắc hơn, có chống răng cưa)"""
    if loc == 'area':
        return cv2.resize(pm, (nw, nh), interpolation=cv2.INTER_AREA)
    return np.dstack([np.asarray(Image.fromarray(pm[..., c]).resize((nw, nh), Image.LANCZOS)) for c in range(4)]).astype(np.float32)


def dung(ten, file, cot, hang, chon_ty_le, che_do, mo_ta, boi=2, loc='area', net=None, luu=True):
    """boi = px nguồn mỗi px logic (2 = sheet 2x gốc; 3 = sheet 3x cho màn bộ đệm/logic > 2). Cùng neo gen, cùng một tỉ lệ / sheet."""
    CAO_NGUON = 112 * boi
    LE = int(round(6 * boi / 2)); LE_DUOI = int(round(4 * boi / 2))
    rgba = tach_anh(os.path.join(NGUON, 'lam-tu-the', file))
    Hs, Ws = rgba.shape[:2]; cw, ch = Ws / cot, Hs / hang
    tt = cat_o(rgba, cot, hang)
    do = [do_tu_the(rgba, m) for *_, m in tt]
    cao = [y1 - y0 for (x0, y0, x1, y1, m) in tt]
    s = CAO_NGUON / chon_ty_le(cao)        # px gen → px nguồn (boi x)
    s_tam = s
    neo = []                                # (x_neo_gen, y_đất_gen) cho từng tư thế
    ghi = []
    for i, ((x0, y0, x1, y1, m), d) in enumerate(zip(tt, do)):
        ci, cj = i % cot, i // cot
        if che_do == 'chay':
            # mặt đất của HÀNG = đáy thấp nhất trong hàng (tư thế chạm đất); tư thế chạm đất: đáy ủng = đất; bay: giữ nhấc theo hàng
            day_hang = max(t[3] for k, t in enumerate(tt) if k // cot == cj)
            bay = (i % 4) == 3            # ô 4, 8
            yd = day_hang if bay else y1
            xn = ci * cw + XNEO_CHAY      # vị trí trong ô của ảnh gen giữ nguyên
            ghi.append({'bay': bay, 'nhac_gen': day_hang - y1 if bay else 0, 'day_gen': y1, 'day_hang_gen': day_hang})
        else:
            u = ung(rgba, m, y1)
            assert len(u) == 2, (ten, i, u)
            gi = (u[0][0] + u[0][1] + u[1][0] + u[1][1]) / 4     # giữa hai ủng
            xn = gi + LECH_CHEM                                    # + hằng số chung: trục thân của D (giữa mũ ở hàng mắt)
            yd = max(u[0][2], u[1][2])
            ghi.append({'ung_gen': [x[:3] for x in u], 'giua_hai_ung_trong_o_gen': gi - ci * cw,
                        'ung_sau_logic': round((((u[0][0] + u[0][1]) / 2) - xn) * s_tam / 2, 1) if s_tam else None,
                        'ung_truoc_logic': round((((u[1][0] + u[1][1]) / 2) - xn) * s_tam / 2, 1) if s_tam else None})
        neo.append((xn, yd))
    # thu nhỏ CẢ ẢNH một lần (alpha nhân trước, INTER_AREA) rồi cắt từng tư thế theo neo đã làm tròn (lệch ≤ 0,25 px logic)
    a = rgba.astype(np.float32) / 255; pm = a.copy(); pm[..., :3] *= a[..., 3:4]
    nw, nh = int(round(Ws * s)), int(round(Hs * s))
    sm = thu_co(pm, nw, nh, loc)
    if net: sm = lam_net(sm, thu_co(pm, nw, nh, 'area'), *net)
    sx, sy = nw / Ws, nh / Hs
    hop = []
    for (x0, y0, x1, y1, m), (xn, yd) in zip(tt, neo):
        hop.append((x0 * sx - xn * sx, y0 * sy - yd * sy, x1 * sx - xn * sx, y1 * sy - yd * sy))
    L = -min(h[0] for h in hop) + LE; R = max(h[2] for h in hop) + LE
    U = -min(h[1] for h in hop) + LE; D = max(h[3] for h in hop) + LE_DUOI
    fw, fh = int(np.ceil(L + R)), int(np.ceil(U + D)); ax, ay = int(np.ceil(L)), int(np.ceil(U))
    co_sheet = (cot * fw + (cot - 1) * KHE, hang * fh + (hang - 1) * KHE)
    sheet = np.zeros((co_sheet[1], co_sheet[0], 4), np.float32)
    frames = []
    for i, ((x0, y0, x1, y1, m), (xn, yd)) in enumerate(zip(tt, neo)):
        mm = cv2.resize(ndi.binary_dilation(m, iterations=2).astype(np.float32), (nw, nh), interpolation=cv2.INTER_AREA) > 0.01
        X, Y = int(round(xn * sx)), int(round(yd * sy))
        fx, fy = (i % cot) * (fw + KHE), (i // cot) * (fh + KHE)
        # vùng nguồn tương ứng ô
        sx0, sy0 = X - ax, Y - ay
        src_x0, src_y0 = max(sx0, 0), max(sy0, 0); src_x1, src_y1 = min(sx0 + fw, nw), min(sy0 + fh, nh)
        blk = sm[src_y0:src_y1, src_x0:src_x1] * mm[src_y0:src_y1, src_x0:src_x1, None]
        sheet[fy + src_y0 - sy0: fy + src_y1 - sy0, fx + src_x0 - sx0: fx + src_x1 - sx0] = blk
        frames.append({'i': i, 'x': fx, 'y': fy, 'w': fw, 'h': fh, 'neo_gen': [round(float(xn), 1), int(yd)]})
    al = sheet[..., 3:4]
    rgb = np.where(al > 1e-4, sheet[..., :3] / np.maximum(al, 1e-4), 0)
    out = np.dstack([rgb, al]).clip(0, 1) * 255
    out = out.round().astype(np.uint8); out[out[..., 3] == 0, :3] = 0
    if luu: Image.fromarray(out).save(os.path.join(SPR, 'lam-moi2-%s-%dx.png' % (ten, boi)), optimize=True)
    # số đo trong px LOGIC (gen × s / 2), so với neo
    so = []
    for i, (d, (xn, yd), g) in enumerate(zip(do, neo, ghi)):
        k = s / boi
        e = {'o': i + 1, 'cao_logic': round((tt[i][3] - tt[i][1]) * k, 1),
             'dinh_mu_tren_dat_logic': round((yd - d['top']) * k, 1),
             'mat_logic': [round((d['mat'][0] - xn) * k, 1), round((d['mat'][1] - yd) * k, 1)] if d['mat'] else None,
             'mat_dien_tich_logic2': round(d['mat_co'] * k * k, 1) if d['mat'] else None,
             'mu_cao_tren_mat_logic': round(d['mu_cao_tren_mat'] * k, 1) if d['mu_cao_tren_mat'] is not None else None,
             'mu_rong_hang_mat_logic': round(d['mu_rong_hang_mat'] * k, 1) if d['mu_rong_hang_mat'] else None,
             'mat_cach_mep_truoc_mu_ty_le': round((d['mu_truoc'] - d['mat'][0]) / d['mu_rong_hang_mat'], 3) if d['mu_rong_hang_mat'] else None,
             'mau_mu_trung_vi': d['mau_mu'],
             'chuong_logic': {'tam': [round((d['chuong']['tam'][0] - xn) * k, 1), round((d['chuong']['tam'][1] - yd) * k, 1)],
                              'rong': round(d['chuong']['rong'] * k, 1), 'cao': round(d['chuong']['cao'] * k, 1)} if d['chuong'] else None}
        e.update({kk: vv for kk, vv in g.items()})
        so.append(e)
    meta = {'ten': mo_ta, 'phien_ban_clip': 'lam-moi-thu2', 'anh': 'lam-moi2-%s-%dx.png' % (ten, boi),
            'dinh_dang': 'PNG RGBA, alpha thẳng (không nhân trước); điểm trong suốt RGB = 0',
            'co_sheet': list(co_sheet), 'luoi': {'cot': cot, 'hang': hang, 'khe_px': KHE}, 'co_khung': [fw, fh],
            'diem_neo': {'x': ax, 'y': ay, 'y_nghia': 'toạ độ trong MỖI khung (từ góc trái-trên ô): x = trục thân / giữa collider, y = mặt đất '
                         '(hàng y−1 là hàng thấp nhất của đế khi chạm đất). Mọi khung cùng một điểm neo; không crop riêng khung.'},
            'ty_le': {'px_nguon_moi_px_logic': boi, 've_trong_game': 'vẽ ở 1/%d cỡ nguồn' % boi if boi != 2 else 'vẽ ở ½ cỡ nguồn',
                      'cao_dang_nghi_px_nguon': CAO_NGUON, 'cao_dang_nghi_px_logic': CAO_NGUON / boi, 'he_so_px_anh_gen_sang_px_nguon': round(s, 6),
                      'ghi_chu': 'một tỉ lệ cố định cho mọi tư thế của sheet (không co từng hình theo bounding box)'},
            'huong': 'Lam quay mặt sang PHẢI. Quay trái: lật ngang quanh điểm neo x (ctx.scale(-1,1) tại chân).',
            'nguon_anh_gen': 'art/huong-moi/nguon/lam-tu-the/' + file,
            'frames': frames, 'so_do': so}
    if not luu: meta['_mang'] = out
    return meta, rgba, tt, s


XNEO_CHAY = None
LECH_CHEM = 0.0


def _np(o):
    if isinstance(o, np.integer): return int(o)
    if isinstance(o, np.floating): return float(o)
    raise TypeError(type(o))


def dung_ca(boi=2, loc='area', net=None, luu=True):
    """dựng CẢ HAI sheet (chạy + chém 1) ở một bội số; trả (chay, chem) meta (luu=False: không ghi file, ảnh ở meta['_mang'])"""
    global XNEO_CHAY
    # trục thân chạy = trung bình (theo ô) của giữa đoạn mũ ở hàng mắt – MỘT số cho cả 8 ô
    rg = tach_anh(os.path.join(NGUON, 'lam-tu-the', 'thu2-chay-8o.png'))
    tt = cat_o(rg, 4, 2); xs = []
    for i, (*_, m) in enumerate(tt):
        d = do_tu_the(rg, m); xs.append((d['mu_sau'] + d['mu_truoc']) / 2 - (i % 4) * rg.shape[1] / 4)
    XNEO_CHAY = float(np.mean(xs))
    chay, *_ = dung('chay', 'thu2-chay-8o.png', 4, 2, lambda c: np.mean([c[0], c[2], c[4], c[6]]), 'chay',
                    'Lam mới thử 2 – CHẠY 8 tư thế (264 px logic/s, 132 px/vòng), sprite sheet %dx' % boi, boi, loc, net, luu)
    chay['diem_neo']['x_chay_ghi_chu'] = ('CHẠY: x neo = trung bình giữa-mũ-ở-hàng-mắt của 8 ô (%.1f px gen trong ô), cùng một số cho mọi ô; '
                                          'vị trí trong ô của ảnh gen giữ nguyên' % XNEO_CHAY)
    chay.update({'lap': True, 'so_khung': 8,
                 'cach_phat': 'theo QUÃNG ĐƯỜNG: pha += |dx_thực| / quang ; khung = floor(pha × 8) ; pha không reset (mỗi ô = 16,5 px)',
                 'toc_do_chuan': {'quang_duong_moi_chu_ky_px_logic': 132.0, 'toc_do_px_logic_s': 264.0, 'ms_moi_o_o_toc_do_chuan': 62.5},
                 'tu_the': ['1 chân gần chạm đất', '2 chịu lực chân gần', '3 đẩy đất chân gần', '4 bay – chân xa đưa trước',
                            '5 chân xa chạm đất', '6 chịu lực chân xa', '7 đẩy đất chân xa', '8 bay – chân gần đưa trước']})
    for f in chay['frames']: f['pha'] = f['i'] / 8; f['ms'] = 62.5
    # CHÉM: trục thân = giữa hai ủng + MỘT hằng số, chọn để ở D (dáng trung tính/hồi) giữa mũ ở hàng mắt trùng neo – cùng quy ước với CHẠY
    global LECH_CHEM
    rc = tach_anh(os.path.join(NGUON, 'lam-tu-the', 'thu2-chem1-4o.png')); tc = cat_o(rc, 4, 1)
    x0, y0, x1, y1, mD = tc[3]; uD = ung(rc, mD, y1); dD = do_tu_the(rc, mD)
    LECH_CHEM = (dD['mu_sau'] + dD['mu_truoc']) / 2 - (uD[0][0] + uD[0][1] + uD[1][0] + uD[1][1]) / 4
    chem, *_ = dung('chem1', 'thu2-chem1-4o.png', 4, 1, lambda c: c[3], 'chem',
                    'Lam mới thử 2 – CHÉM 1 (ngang thấp) 4 tư thế A lấy đà / B cắt / C kết thúc / D hồi, sprite sheet %dx' % boi, boi, loc, net, luu)
    chem['diem_neo']['x_chem_ghi_chu'] = ('CHÉM: x neo = giữa hai ủng của TỪNG tư thế + %.1f px gen (hằng số chung = giữa mũ ở hàng mắt − giữa hai ủng của D) '
                                          '→ chân trụ đứng yên giữa các tư thế, D cùng trục thân với CHẠY' % LECH_CHEM)
    chem.update({'lap': False, 'atk': 1, 'tu_the': ['A lấy đà', 'B cắt qua', 'C kết thúc', 'D hồi'],
                 'lich_tick': {'A': [1, 7], 'B': [8, 11], 'C': [12, 15], 'D': [16, 23],
                               'ghi_chu': 'tick đếm từ 1 = bước logic đầu tiên của đòn. Hộp chỉ bật tick 8–15 (= B + C). '
                                          'Trong game chọn hình theo CHÍNH điều kiện hộp: atkT < su → A; su ≤ atkT < su+4 → B; '
                                          '< su+ac → C; còn lại → D (su 7, ac 8, re 8 của game – KHÔNG đổi).'},
                 'khung_theo_tick': [0] * 7 + [1] * 4 + [2] * 4 + [3] * 8})
    for f, n in zip(chem['frames'], [7, 4, 4, 8]): f['tick'] = n; f['ms'] = round(n * 1000 / 60, 1)
    for meta in (chay, chem):
        meta['thu_co'] = {'loc': {'area': 'cv2 INTER_AREA', 'lanczos': 'Lanczos (PIL)'}[loc],
                          'lam_net': ({'kieu': 'unsharp nhỏ, kẹp vào min/max 3×3 của bản thu INTER_AREA cùng cỡ (không halo, không gợn Lanczos)', 'sigma_px_nguon': net[0], 'luong': net[1]}
                                      if net else None),
                          'ghi_chu': 'thu THẲNG từ ảnh gen gốc (không phóng sheet khác), alpha nhân trước'}
    if luu:
        for meta, ten in [(chay, 'chay'), (chem, 'chem1')]:
            json.dump(meta, open(os.path.join(SPR, 'lam-moi2-%s-%dx.json' % (ten, boi)), 'w'), ensure_ascii=False, indent=1, default=_np)
    return chay, chem


# sheet 3x (Làm nét 28/10): cho màn có bộ đệm/logic > 2 (iPhone @3x ngang: 2,17; tới 3). Lanczos + làm nét nhẹ có kẹp.
NET_3X = (0.8, 0.45)


def main():
    chay, chem = dung_ca(2)
    dung_ca(3, 'lanczos', NET_3X)
    # Lam chốt cùng thang (để so): cao 224 px nguồn
    ch = tach_anh(os.path.join(NGUON, 'lam-moi-chuong-tan.png')); t = cat_o(ch, 1, 1)[0]; d = do_tu_the(ch, t[4])
    k = 112 / (t[3] - t[1]); xn = (d['mu_sau'] + d['mu_truoc']) / 2
    chot = {'cao_logic': 112, 'mat_logic': [round((d['mat'][0] - xn) * k, 1), round((d['mat'][1] - t[3]) * k, 1)],
            'mat_dien_tich_logic2': round(d['mat_co'] * k * k, 1), 'mu_cao_tren_mat_logic': round(d['mu_cao_tren_mat'] * k, 1),
            'mu_rong_hang_mat_logic': round(d['mu_rong_hang_mat'] * k, 1),
            'mat_cach_mep_truoc_mu_ty_le': round((d['mu_truoc'] - d['mat'][0]) / d['mu_rong_hang_mat'], 3), 'mau_mu_trung_vi': d['mau_mu'],
            'chuong_logic': {'rong': round(d['chuong']['rong'] * k, 1), 'cao': round(d['chuong']['cao'] * k, 1)},
            'ghi_chu': 'mat_logic x đo từ giữa mũ ở hàng mắt (không có neo chân), y từ đáy'}
    json.dump({'lam_chot': chot, 'chay': chay['so_do'], 'chem1': chem['so_do'],
               'ty_le_gen_sang_nguon': {'chay': chay['ty_le']['he_so_px_anh_gen_sang_px_nguon'], 'chem1': chem['ty_le']['he_so_px_anh_gen_sang_px_nguon']}},
              open(os.path.join(KIEM, 'so-do.json'), 'w'), ensure_ascii=False, indent=1, default=_np)
    print('chay', chay['co_sheet'], chay['co_khung'], chay['diem_neo']['x'], chay['diem_neo']['y'], 's', chay['ty_le']['he_so_px_anh_gen_sang_px_nguon'])
    print('chem', chem['co_sheet'], chem['co_khung'], chem['diem_neo']['x'], chem['diem_neo']['y'], 's', chem['ty_le']['he_so_px_anh_gen_sang_px_nguon'])


if __name__ == '__main__':
    main()
