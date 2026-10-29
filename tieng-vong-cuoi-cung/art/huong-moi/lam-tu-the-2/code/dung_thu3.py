#!/usr/bin/env python3
"""Dựng sheet Lam mới bộ 3 (PH13 mục 2) – MỘT LỆNH cho mỗi sheet mới. Xuất 2x và 3x + JSON + ảnh dải kiểm + danh sách cho game.

    python3 dung_thu3.py                 # dựng MỌI sheet trong bảng có file nguồn (thiếu file → bỏ qua, báo)
    python3 dung_thu3.py pogo tuong      # chỉ dựng các sheet này
    python3 dung_thu3.py them <ten> <file.png> <cot> <hang> <nhan1,nhan2,...> [neo_x] [neo_y] [vai]
                                         # THÊM một sheet mới vào bảng (code/bang-thu3.json) rồi dựng luôn
    tuỳ chọn: --nguon DIR (mặc định art/huong-moi/nguon/lam-tu-the)  --ra DIR (mặc định ../sprite)  --kiem DIR (mặc định ../kiem)

Bảng sheet: code/bang-thu3.json (pogo 3 ô, tường 4, nhảy/rơi/tiếp đất 6, đứng 3, chạy sửa 8, chém 1 sửa 4 – tên file theo PH13 mục 2).
Ra: sprite/lam-moi3-<ten>-{2x,3x}.{png,json}, sprite/thu3-danh-sach.json (game đọc file này: chỉ nạp sheet có trong danh sách),
    kiem/thu3-<ten>-dai.png (2x trên xám + 112 px nền tối + bóng đen 112, có Lam chốt cùng thang), kiem/thu3-so-do.json.

TỈ LỆ (PH13 mục 1.3 + 4): MỘT tỉ lệ cho mỗi ảnh nguồn, lấy từ ẢNH LAM CHỐT – KHÔNG co từng hình theo khung bao, không theo chiều cao:
    k (px gen → px logic) = CỠ MŨ Lam chốt (cao 112 logic) / TRUNG VỊ cỡ mũ các ô; cỡ mũ = căn(bề rộng ở hàng mắt × cao trên mắt)
    (bộ 3, 29/10: chỉ bề rộng thì sai ở tường – tay áp vách dính hàng mắt – và pogo P1 – vạt áo; xem co_mu). Ô không thấy mắt không góp số.
    → Mũ cùng cỡ ảnh chốt giữa mọi sheet bộ 3 (sheet chạy/chém thử 2 dựng theo chiều cao nên mũ to hơn chốt 8–31 %: xem so-do).
NEO (toạ độ chân của game: x = trục thân / giữa collider, y = mặt đất / đáy hình), chọn theo từng sheet (hoặc từng ô):
    neo_x  'mu'    = giữa mũ ở hàng mắt của TỪNG ô (trục thân; tư thế trên không, không có chân trụ)
           'ung'   = giữa hai ủng của từng ô + MỘT hằng số (giữa mũ − giữa ủng của ô 'trung_tinh') – như chém thử 2 (chân trụ đứng yên)
           'o'     = giữ NGUYÊN vị trí trong ô của ảnh gen (một hằng số = trung bình giữa mũ các ô) – như chạy thử 2
           'tuong' = điểm XA NHẤT bên phải (tay/ủng áp vách, mẫu vách bên phải) đặt cách trục 10 px logic (= nửa collider 20 px)
           'moc_phai' = (bộ 5, bám bằng móc) ĐẦU MÓC = điểm xa nhất bên phải trong 1/4 trên của hình, đặt cách trục 10 px logic (mép collider
                      phía vách phải); số đo ghi 'dau_moc_logic' (so với chân) để game rắc bụi ở đầu móc
    neo_y  'mat'   = mắt cao đúng như Lam chốt trên chân (72,6 px logic) – tư thế trên không / tường: đầu liền mạch giữa các hình ;
           'day'   = đáy hình ; 'ung' = đáy ủng (thiếu ủng → đáy hình) ; 'chay' = như chạy thử 2 (đất theo hàng, ô 4/8 giữ độ nhấc)
Chia ô: thành phần liên thông lớn nhất trong từng ô lưới (tach.cat_o) – ảnh gen phải là lưới đều, nền trắng.
Tuỳ chọn trong bảng: "lay_o_tu": {"file": "thu2-chay-8o.png", "o": [1, 3, 4, 7, 8]} (hoặc DANH SÁCH nhiều mục như vậy) → các ô này lấy từ ảnh gốc (PH13: máy gen đổi ô "giữ
nguyên" thì lấy lại ô cũ); mỗi ảnh nguồn có tỉ lệ riêng theo CÙNG luật mũ chốt.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi
import cv2

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from tach import tach_anh, cat_o, do_tu_the
from dung_sheet import ung, lam_net, thu_co, NET_3X, _np

GOC = os.path.normpath(os.path.join(HERE, '..'))
NGUON_CHOT = os.path.normpath(os.path.join(GOC, '..', 'nguon', 'lam-moi-chuong-tan.png'))
BANG = os.path.join(HERE, 'bang-thu3.json')
KHE = 2
NUA_COLLIDER = 10.0   # px logic: pl.w = 20
try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
except Exception:
    FONT = ImageFont.load_default()


def chot():
    """số đo Lam chốt ở thang cao 112 px logic (đáy hình = đất, x từ giữa mũ ở hàng mắt)"""
    r = tach_anh(NGUON_CHOT); x0, y0, x1, y1, m = cat_o(r, 1, 1)[0]; d = do_tu_the(r, m); k = 112 / (y1 - y0)
    return {'k': k, 'mu_rong': d['mu_rong_hang_mat'] * k, 'mu_cao': d['mu_cao_tren_mat'] * k, 'mat_y': (d['mat'][1] - y1) * k,
            'anh': r, 'hop': (x0, y0, x1, y1), 'xm': (d['mu_sau'] + d['mu_truoc']) / 2}


def nap_nguon(path, cot, hang, cfg=None):
    cfg = cfg or {}; rgba = tach_anh(path); tt = cat_o(rgba, cot, hang)
    return rgba, tt, [do_tu_the(rgba, m, mat_min=cfg.get('mat_min', 15), bo_moc=cfg.get('mu_bo_moc', 0)) for *_, m in tt]


R_MU = 1.18   # tỉ lệ rộng/cao mũ điển hình ở các ô "sạch" (chạy, đứng, nhảy, pogo P2/P3: 1,14–1,22) – dùng khi hàng mắt dính tay/áo


def co_mu(d, thay_rong=False):
    """CỠ MŨ một ô (px gen) = căn(bề rộng ở hàng mắt × cao trên mắt). Nếu rộng/cao > 1,35 (hàng mắt dính tay áp vách / vạt áo) thì
    bề rộng thay bằng cao × R_MU. thay_rong (bảng: "mu_thay_rong", bộ 4 tường lưng): tay giơ áp vách nằm ngay hàng mắt ở MỌI ô → luôn thay.
    Trả (cỡ, có thay không) hoặc None khi không thấy mắt."""
    if not d['mat'] or not d['mu_cao_tren_mat']: return None
    h = float(d['mu_cao_tren_mat']); w = float(d['mu_rong_hang_mat'] or 0); thay = thay_rong or (not w) or w / h > 1.35
    if thay: w = h * R_MU
    return float(np.sqrt(w * h)), thay


def co_mu_chot(C):
    return float(np.sqrt(C['mu_rong'] * C['mu_cao']))


def ty_le(do_list, C, cfg=None):
    """k = px gen → px logic: cỡ mũ Lam chốt / TRUNG VỊ cỡ mũ các ô (MỘT số cho cả sheet). Trả (k, cách, số ô)
    Bộ 4: bảng có thể ghi "o_do_mu" (số ô, từ 1) = chỉ các ô mũ đo sạch góp số – ô có tay / dao giơ đè lên mũ (chém 3 lấy lực/đỉnh, hất
    kết thúc cao) làm "cao trên mắt" tính tới mũi dao → bỏ, ghi lý do ở "o_do_mu_ly_do". Luật vẫn là cỡ mũ chốt / trung vị."""
    cfg = cfg or {}; chon = cfg.get('o_do_mu'); tr = cfg.get('mu_thay_rong', False)
    c = [co_mu(d, tr) for i, d in enumerate(do_list) if not chon or (i + 1) in chon]; c = [x for x in c if x]
    if not c: raise SystemExit('không đo được mũ ở ô nào (không thấy mắt) – kiểm ảnh nguồn')
    nt = sum(1 for x in c if x[1])
    return co_mu_chot(C) / float(np.median([x[0] for x in c])), 'cỡ mũ = căn(rộng hàng mắt × cao trên mắt), trung vị %d ô%s' % (
        len(c), (' (%d ô hàng mắt dính tay/áo → rộng = cao × %.2f)' % (nt, R_MU)) if nt else ''), len(c)


def theo_o(v, i):
    return v[i] if isinstance(v, list) else v


def dung_mot(ten, cfg, dir_nguon, dir_ra, dir_kiem, C):
    nhan = cfg['tu_the']; cot, hang = cfg['cot'], cfg['hang']; n = cot * hang
    assert len(nhan) == n, '%s: %d nhãn cho %d ô' % (ten, len(nhan), n)
    p = os.path.join(dir_nguon, cfg['file'])
    if not os.path.exists(p): return None
    # các nguồn: ảnh chính + (tuỳ chọn) ảnh gốc cho một số ô
    nguon = {'chinh': nap_nguon(p, cot, hang, cfg)}
    lay = cfg.get('lay_o_tu')
    lays = (lay if isinstance(lay, list) else [lay]) if lay else []   # 29/10 (chạy sửa 2): có thể nhiều ảnh gốc – mỗi ảnh một danh sách ô
    tu = ['chinh'] * n
    for j, l in enumerate(lays):
        kn = 'goc' if j == 0 else 'goc%d' % (j + 1)
        nguon[kn] = nap_nguon(os.path.join(dir_nguon, l['file']), cot, hang)
        for o in l['o']: tu[o - 1] = kn
    K = {}
    cung_co = len({v[0].shape for v in nguon.values()}) == 1
    if cung_co:   # các ảnh nguồn cùng khổ / bố cục (chạy sửa + chạy gốc) → MỘT tỉ lệ chung, đo trên đúng các ô được dùng
        kk = ty_le([nguon[tu[i]][2][i] for i in range(n)], C, cfg)
        for kn in nguon: K[kn] = kk
    else:
        for kn, (rgba, tt, do) in nguon.items(): K[kn] = ty_le(do, C, cfg)
    # neo từng ô (px gen của ảnh nguồn ô đó)
    hang_so = {}
    for kn, (rgba, tt, do) in nguon.items():
        cw = rgba.shape[1] / cot
        xs = [(d['mu_sau'] + d['mu_truoc']) / 2 - (i % cot) * cw for i, d in enumerate(do) if d['mu_rong_hang_mat']]
        hs = {'o': float(np.mean(xs)) if xs else cw / 2}
        tt_i = cfg.get('trung_tinh', 0)
        x0, y0, x1, y1, m = tt[tt_i]; u = ung(rgba, m, y1); d = do[tt_i]
        if len(u) == 2 and d['mu_rong_hang_mat']:
            hs['ung'] = (d['mu_sau'] + d['mu_truoc']) / 2 - (u[0][0] + u[0][1] + u[1][0] + u[1][1]) / 4
        hang_so[kn] = hs
    neo, ghi = [], []
    for i in range(n):
        kn = tu[i]; rgba, tt, do = nguon[kn]; x0, y0, x1, y1, m = tt[i]; d = do[i]; k = K[kn][0]
        cw = rgba.shape[1] / cot; ci, cj = i % cot, i // cot
        mx, my = theo_o(cfg.get('neo_x', 'mu'), i), theo_o(cfg.get('neo_y', 'day'), i)
        u = ung(rgba, m, y1) if (mx == 'ung' or my == 'ung') else []
        g = {'neo_x': mx, 'neo_y': my, 'nguon': kn}
        if mx == 'mu' and d['mu_rong_hang_mat']: xn = (d['mu_sau'] + d['mu_truoc']) / 2
        elif mx == 'ung' and len(u) == 2 and 'ung' in hang_so[kn]: xn = (u[0][0] + u[0][1] + u[1][0] + u[1][1]) / 4 + hang_so[kn]['ung']
        elif mx == 'tuong': xn = x1 - NUA_COLLIDER / k
        elif mx == 'tuong_trai': xn = x0 + NUA_COLLIDER / k   # bộ 4: LƯNG áp vách bên TRÁI (Lam nhìn phải) – điểm xa nhất bên trái (lưng/tay) = mép collider
        elif mx == 'moc_phai':   # bộ 5: BÁM BẰNG MÓC, vách bên PHẢI – đầu móc (điểm xa nhất bên phải trong 1/4 trên của hình = móc sắt trên đầu) = mép collider
            yy, xx = np.nonzero(m[: y0 + int(0.25 * (y1 - y0))]); j = int(np.argmax(xx)); xm, ym = float(xx[j] + 1), float(yy[j])
            xn = xm - NUA_COLLIDER / k; g['dau_moc_gen'] = [round(xm, 1), round(ym, 1)]
        else:
            if mx != 'o': g['neo_x_thay'] = 'o (không đo được %s)' % mx
            xn = ci * cw + hang_so[kn]['o']
        if my == 'mat' and d['mat']: yd = d['mat'][1] - C['mat_y'] / k   # mắt đặt cao đúng như Lam chốt trên chân (trên không: đầu không nhảy giữa các hình)
        elif my == 'ung' and u: yd = max(t[2] for t in u)
        elif my == 'chay':
            day_hang = max(t[3] for kk, t in enumerate(tt) if kk // cot == cj); bay = (i % 4) == 3
            yd = day_hang if bay else y1; g['bay'] = bay
        else:
            if my not in ('day',): g['neo_y_thay'] = 'day (không đo được %s)' % my
            yd = y1
        neo.append((xn, yd)); ghi.append(g)
    meta_ra = {}
    for boi, loc, net in [(2, 'area', None), (3, 'lanczos', NET_3X)]:
        LE = int(round(6 * boi / 2)); LE_DUOI = int(round(4 * boi / 2))
        thu = {}
        for kn, (rgba, tt, do) in nguon.items():
            s = K[kn][0] * boi; Hs, Ws = rgba.shape[:2]
            a = rgba.astype(np.float32) / 255; pm = a.copy(); pm[..., :3] *= a[..., 3:4]
            nw, nh = int(round(Ws * s)), int(round(Hs * s)); sm = thu_co(pm, nw, nh, loc)
            if net: sm = lam_net(sm, thu_co(pm, nw, nh, 'area'), *net)
            thu[kn] = (sm, nw / Ws, nh / Hs, nw, nh)
        hop = []
        for i in range(n):
            x0, y0, x1, y1, m = nguon[tu[i]][1][i]; xn, yd = neo[i]; _, sx, sy, _, _ = thu[tu[i]]
            hop.append(((x0 - xn) * sx, (y0 - yd) * sy, (x1 - xn) * sx, (y1 - yd) * sy))
        L = -min(h[0] for h in hop) + LE; R = max(h[2] for h in hop) + LE
        U = -min(h[1] for h in hop) + LE; D = max(max(h[3] for h in hop), 0) + LE_DUOI
        fw, fh = int(np.ceil(L + R)), int(np.ceil(U + D)); ax, ay = int(np.ceil(L)), int(np.ceil(U))
        co_sheet = (cot * fw + (cot - 1) * KHE, hang * fh + (hang - 1) * KHE)
        sheet = np.zeros((co_sheet[1], co_sheet[0], 4), np.float32); frames = []
        for i in range(n):
            x0, y0, x1, y1, m = nguon[tu[i]][1][i]; xn, yd = neo[i]; sm, sx, sy, nw, nh = thu[tu[i]]
            mm = cv2.resize(ndi.binary_dilation(m, iterations=2).astype(np.float32), (nw, nh), interpolation=cv2.INTER_AREA) > 0.01
            X, Y = int(round(xn * sx)), int(round(yd * sy)); fx, fy = (i % cot) * (fw + KHE), (i // cot) * (fh + KHE)
            sx0, sy0 = X - ax, Y - ay
            a0, b0 = max(sx0, 0), max(sy0, 0); a1, b1 = min(sx0 + fw, nw), min(sy0 + fh, nh)
            sheet[fy + b0 - sy0: fy + b1 - sy0, fx + a0 - sx0: fx + a1 - sx0] = sm[b0:b1, a0:a1] * mm[b0:b1, a0:a1, None]
            frames.append({'i': i, 'nhan': nhan[i], 'x': fx, 'y': fy, 'w': fw, 'h': fh, 'neo_gen': [round(float(xn), 1), int(yd)], 'nguon': tu[i]})
        al = sheet[..., 3:4]; rgb = np.where(al > 1e-4, sheet[..., :3] / np.maximum(al, 1e-4), 0)
        out = (np.dstack([rgb, al]).clip(0, 1) * 255).round().astype(np.uint8); out[out[..., 3] == 0, :3] = 0
        anh = '%s-%s-%dx.png' % (cfg.get('tien_to', 'lam-moi3'), ten, boi)
        Image.fromarray(out).save(os.path.join(dir_ra, anh), optimize=True)
        so = []
        for i in range(n):
            d = nguon[tu[i]][2][i]; k = K[tu[i]][0]; xn, yd = neo[i]; x0, y0, x1, y1, _ = nguon[tu[i]][1][i]
            so.append({'o': i + 1, 'nhan': nhan[i], 'cao_logic': round((y1 - y0) * k, 1), 'dinh_tren_neo_logic': round((yd - y0) * k, 1),
                       'mu_rong_hang_mat_logic': round(d['mu_rong_hang_mat'] * k, 1) if d['mu_rong_hang_mat'] else None,
                       'mu_so_chot_phan_tram': round(float(d['mu_rong_hang_mat'] * k / C['mu_rong'] - 1) * 100, 1) if d['mu_rong_hang_mat'] else None,
                       'mat_logic': [round((d['mat'][0] - xn) * k, 1), round((d['mat'][1] - yd) * k, 1)] if d['mat'] else None,
                       'mu_cao_tren_mat_logic': round(d['mu_cao_tren_mat'] * k, 1) if d['mu_cao_tren_mat'] else None,
                       'co_mu_so_chot_phan_tram': round((co_mu(d, cfg.get('mu_thay_rong', False))[0] * k / co_mu_chot(C) - 1) * 100, 1) if co_mu(d) else None,
                       'mu_do_nhieu': bool(cfg.get('o_do_mu')) and (i + 1) not in cfg['o_do_mu'],
                       'mat_dien_tich_logic': round(d['mat_co'] * k * k, 1) if d['mat'] else None,
                       'mau_mu_trung_vi': d['mau_mu'], **ghi[i]})
            if 'dau_moc_gen' in ghi[i]: so[-1]['dau_moc_logic'] = [round((ghi[i]['dau_moc_gen'][0] - xn) * k, 1), round((ghi[i]['dau_moc_gen'][1] - yd) * k, 1)]
        meta = {'ten': 'Lam mới bộ %d – %s (%s), sprite sheet %dx' % (cfg.get('bo', 3), ten, ' / '.join(nhan), boi), 'phien_ban_clip': 'lam-moi-thu%d' % cfg.get('bo', 3),
                'vai': cfg.get('vai', ten), 'tu_the': nhan, 'anh': anh,
                'dinh_dang': 'PNG RGBA, alpha thẳng (không nhân trước); điểm trong suốt RGB = 0',
                'co_sheet': list(co_sheet), 'luoi': {'cot': cot, 'hang': hang, 'khe_px': KHE}, 'co_khung': [fw, fh],
                'diem_neo': {'x': ax, 'y': ay, 'y_nghia': 'toạ độ trong MỖI khung: x = trục thân / giữa collider, y = chân (đất hoặc đáy hình). '
                             'Mọi khung cùng một điểm neo.'},
                'ty_le': {'px_nguon_moi_px_logic': boi, 'cach': {kn: K[kn][1] for kn in K},
                          'px_gen_sang_px_logic': {kn: round(K[kn][0], 6) for kn in K},
                          'ghi_chu': 'MỘT tỉ lệ / ảnh nguồn, khớp mũ Lam chốt (%.1f px logic ở hàng mắt) – không theo khung bao' % C['mu_rong']},
                'huong': cfg.get('huong', 'Lam quay mặt sang PHẢI. Quay trái: lật ngang quanh neo x.'),
                'nguon_anh_gen': 'art/huong-moi/nguon/lam-tu-the/' + cfg['file'] + ''.join(' + %s (ô %s)' % (l['file'], l['o']) for l in lays) + (' (ô chính %s)' % [i + 1 for i in range(n) if tu[i] == 'chinh'] if lays else ''),
                'thu_co': {'loc': {'area': 'cv2 INTER_AREA', 'lanczos': 'Lanczos (PIL)'}[loc],
                           'lam_net': {'sigma_px_nguon': net[0], 'luong': net[1]} if net else None},
                'frames': frames, 'so_do': so}
        for kk in ('vet_pogo', 'vet_chem1', 'nhip', 'vet', 'bo', 'o_do_mu', 'o_do_mu_ly_do', 'mu_thay_rong'):
            if kk in cfg: meta[kk] = cfg[kk]
        json.dump(meta, open(os.path.join(dir_ra, '%s-%s-%dx.json' % (cfg.get('tien_to', 'lam-moi3'), ten, boi)), 'w', encoding='utf-8'), ensure_ascii=False, indent=1, default=_np)
        meta_ra[boi] = (meta, out)
    dai(ten, meta_ra[2], C, dir_kiem, 'thu%d' % cfg.get('bo', 3))
    return meta_ra[2][0]


def nua(im):
    a = np.asarray(im).astype(np.float32) / 255; pm = a.copy(); pm[..., :3] *= a[..., 3:4]
    w, h = im.size; r = cv2.resize(pm, (w // 2, h // 2), interpolation=cv2.INTER_AREA)
    al = r[..., 3:4]; rgb = np.where(al > 1e-4, r[..., :3] / np.maximum(al, 1e-4), 0)
    return Image.fromarray((np.dstack([rgb, al]).clip(0, 1) * 255).round().astype(np.uint8))


def dai(ten, mo, C, dir_kiem, tien='thu3'):
    """ảnh dải kiểm: Lam chốt cùng thang (2x) + từng tư thế 2x trên xám (đỏ = neo y, xanh = neo x, vàng = hàng mắt chốt); dưới: 112 px + bóng"""
    meta, out = mo; fw, fh = meta['co_khung']; ax, ay = meta['diem_neo']['x'], meta['diem_neo']['y']
    sh = Image.fromarray(out); F = [sh.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])) for f in meta['frames']]
    r = C['anh']; x0, y0, x1, y1 = C['hop']; k = C['k'] * 2
    a = r.astype(np.float32) / 255; pm = a.copy(); pm[..., :3] *= a[..., 3:4]
    sm = cv2.resize(pm, (round(r.shape[1] * k), round(r.shape[0] * k)), interpolation=cv2.INTER_AREA)
    al = sm[..., 3:4]; big = Image.fromarray((np.dstack([np.where(al > 1e-4, sm[..., :3] / np.maximum(al, 1e-4), 0), al]).clip(0, 1) * 255).round().astype(np.uint8))
    cho = Image.new('RGBA', (fw, fh)); cho.alpha_composite(big, (int(round(ax - C['xm'] * k)), int(round(ay - y1 * k))))
    cols = [cho] + F; lb = ['Lam chốt'] + meta['tu_the']; mat_y = ay + C['mat_y'] * 2
    W = len(cols) * (fw + 8) + 8; H = 22 + fh + 8 + fh // 2 + 30
    o = Image.new('RGB', (W, H), (40, 44, 52)); d = ImageDraw.Draw(o)
    for i, (c, t) in enumerate(zip(cols, lb)):
        x = 8 + i * (fw + 8); d.text((x + 2, 3), t, font=FONT, fill=(230, 230, 230))
        g = Image.new('RGBA', (fw, fh), (128, 128, 128, 255)); g.alpha_composite(c); gd = ImageDraw.Draw(g)
        gd.line([(0, ay), (fw, ay)], fill=(200, 60, 60)); gd.line([(ax, 0), (ax, fh)], fill=(60, 160, 220)); gd.line([(0, mat_y), (fw, mat_y)], fill=(240, 200, 60))
        o.paste(g.convert('RGB'), (x, 22)); h = nua(c)
        t1 = Image.new('RGBA', h.size, (22, 26, 34, 255)); t1.alpha_composite(h); o.paste(t1.convert('RGB'), (x, 30 + fh))
        b = np.asarray(h).copy(); b[..., :3] = 0; t2 = Image.new('RGBA', h.size, (128, 128, 128, 255)); t2.alpha_composite(Image.fromarray(b))
        o.paste(t2.convert('RGB'), (x + fw // 2 + 2, 30 + fh))
    d.text((8, H - 20), 'đỏ = neo y · xanh = neo x (trục thân) · vàng = hàng mắt Lam chốt · dưới: 112 px nền tối | bóng đen', font=FONT, fill=(200, 200, 200))
    o.save(os.path.join(dir_kiem, '%s-%s-dai.png' % (tien, ten)))


def so_mu(dir_ra, dir_kiem, C, chi_bo=None):
    """kiem/thu3-so-mu.png: ĐẦU của mọi tư thế bộ 3 (2x) cạnh Lam chốt, căn theo MẮT (chấm đỏ) – xem mũ có phình / mắt có đổi giữa trạng thái.
    Khung vàng = cỡ mũ Lam chốt (rộng × cao trên mắt) đặt từ mắt. Ô ⚠ = cỡ mũ lệch chốt > 8 % hoặc mắt to hơn chốt > 30 %."""
    bang = json.load(open(BANG, encoding='utf-8')); o = []
    r = C['anh']; k = C['k'] * 2; a = r.astype(np.float32) / 255; pm = a.copy(); pm[..., :3] *= a[..., 3:4]
    sm = cv2.resize(pm, (round(r.shape[1] * k), round(r.shape[0] * k)), interpolation=cv2.INTER_AREA)
    al = sm[..., 3:4]; big = Image.fromarray((np.dstack([np.where(al > 1e-4, sm[..., :3] / np.maximum(al, 1e-4), 0), al]).clip(0, 1) * 255).round().astype(np.uint8))
    d0 = do_tu_the(r, cat_o(r, 1, 1)[0][4]); o.append(('Lam chốt', big, (d0['mat'][0] * k, d0['mat'][1] * k), False))
    mat_chot = d0['mat_co'] * C['k'] ** 2
    for ten in [t for t in bang if not t.startswith('_') and (chi_bo is None or bang[t].get('bo', 3) == chi_bo)]:
        j = os.path.join(dir_ra, '%s-%s-2x.json' % (bang[ten].get('tien_to', 'lam-moi3'), ten))
        if not os.path.exists(j): continue
        m = json.load(open(j, encoding='utf-8')); sh = Image.open(os.path.join(dir_ra, m['anh'])); ax, ay = m['diem_neo']['x'], m['diem_neo']['y']
        for f, s_ in zip(m['frames'], m['so_do']):
            if not s_['mat_logic']: continue
            nhieu = s_.get('mu_do_nhieu')   # ô bỏ khỏi trung vị (tay/dao đè mũ): số cỡ mũ không tin được → chỉ xét mắt
            canh = (not nhieu and s_['co_mu_so_chot_phan_tram'] is not None and abs(s_['co_mu_so_chot_phan_tram']) > 8) or (s_['mat_dien_tich_logic'] or 0) > mat_chot * 1.3
            fr = sh.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
            o.append(('%s %s%s' % (ten, f['nhan'], ' (che)' if nhieu else ''), fr, (ax + s_['mat_logic'][0] * 2, ay + s_['mat_logic'][1] * 2), canh))
    W, H, cot = 150, 150, 12; hang = (len(o) + cot - 1) // cot
    out = Image.new('RGB', (cot * (W + 4) + 4, hang * (H + 22) + 30), (40, 44, 52)); d = ImageDraw.Draw(out)
    rw, rc = C['mu_rong'] * 2, C['mu_cao'] * 2
    for i, (t, im, (ex, ey), canh) in enumerate(o):
        x, y = 4 + (i % cot) * (W + 4), 4 + (i // cot) * (H + 22)
        g = Image.new('RGBA', (W, H), (128, 128, 128, 255)); g.alpha_composite(im, (int(round(W * 0.62 - ex)), int(round(H * 0.6 - ey))))
        gd = ImageDraw.Draw(g); cx, cy = W * 0.62, H * 0.6
        gd.rectangle([cx - rw * 0.8, cy - rc, cx + rw * 0.2, cy], outline=(240, 200, 60)); gd.ellipse([cx - 2, cy - 2, cx + 2, cy + 2], fill=(220, 40, 40))
        out.paste(g.convert('RGB'), (x, y + 18)); d.text((x + 2, y), ('⚠ ' if canh else '') + t, font=FONT, fill=(255, 120, 90) if canh else (230, 230, 230))
    d.text((6, out.height - 22), 'căn theo mắt (chấm đỏ) · khung vàng = cỡ mũ Lam chốt · ⚠ = cỡ mũ lệch > 8 % hoặc mắt to hơn chốt > 30 %', font=FONT, fill=(200, 200, 200))
    out.save(os.path.join(dir_kiem, 'thu%s-so-mu.png' % (chi_bo or 3)))


def main(av):
    op = {'--nguon': os.path.normpath(os.path.join(GOC, '..', 'nguon', 'lam-tu-the')), '--ra': os.path.join(GOC, 'sprite'), '--kiem': os.path.join(GOC, 'kiem')}
    rest = []; i = 0
    while i < len(av):
        if av[i] in op: op[av[i]] = os.path.abspath(av[i + 1]); i += 2
        else: rest.append(av[i]); i += 1
    for k in ('--ra', '--kiem'): os.makedirs(op[k], exist_ok=True)
    bang = json.load(open(BANG, encoding='utf-8'))
    if rest and rest[0] == 'them':
        _, ten, file, cot, hang, nh, *tuy = rest
        bang[ten] = {'file': file, 'cot': int(cot), 'hang': int(hang), 'tu_the': nh.split(','), 'vai': tuy[2] if len(tuy) > 2 else ten,
                     'neo_x': tuy[0] if tuy else 'mu', 'neo_y': tuy[1] if len(tuy) > 1 else 'day'}
        json.dump(bang, open(BANG, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('đã thêm', ten, 'vào', BANG)
        rest = [ten]
    chon = [k for k in bang if not k.startswith('_') and not bang[k].get('tu_dung')] if not rest else rest   # 'tu_dung' = sheet dựng bằng script riêng (vd. bat_moc)
    C = chot(); print('Lam chốt: mũ ở hàng mắt %.1f px logic' % C['mu_rong'])
    so = {}
    for ten in chon:
        if ten not in bang: sys.exit('không có "%s" trong bảng – dùng: them %s <file> <cot> <hang> <nhãn,...>' % (ten, ten))
        m = dung_mot(ten, bang[ten], op['--nguon'], op['--ra'], op['--kiem'], C)
        if m is None: print('  bỏ qua %-6s – chưa có %s' % (ten, bang[ten]['file'])); continue
        so[ten] = m['so_do']
        print('  dựng  %-6s %s ô %s neo (%d,%d) cỡ mũ so chốt %s %%' % (ten, m['co_sheet'], m['co_khung'], m['diem_neo']['x'], m['diem_neo']['y'],
              [None if s['co_mu_so_chot_phan_tram'] is None else float(s['co_mu_so_chot_phan_tram']) for s in m['so_do']]))
    # danh sách cho game: MỌI sheet bộ 3 đang có trên đĩa (cả các lần dựng trước)
    ds = []
    for ten, cfg in bang.items():
        if ten.startswith('_'): continue
        j = os.path.join(op['--ra'], '%s-%s-2x.json' % (cfg.get('tien_to', 'lam-moi3'), ten))
        if os.path.exists(j):
            m = json.load(open(j, encoding='utf-8'))
            ds.append({'ten': '%s-%s' % (cfg.get('tien_to', 'lam-moi3'), ten), 'bo': cfg.get('bo', 3), 'vai': m['vai'], 'tu_the': m['tu_the'], 'co_3x': os.path.exists(j.replace('-2x.json', '-3x.json'))})
    json.dump({'ghi_chu': 'Sheet Lam mới bộ 3 đã dựng (dung_thu3.py ghi). Game (thu-lam-moi-2) chỉ nạp các sheet trong danh sách; thiếu → hình tạm.',
               'sheets': ds}, open(os.path.join(op['--ra'], 'thu3-danh-sach.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    p = os.path.join(op['--kiem'], 'thu3-so-do.json'); cu = json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {}
    cu.update(so); cu['_lam_chot_mu_rong_logic'] = round(C['mu_rong'], 1)
    json.dump(cu, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, default=_np)
    so_mu(op['--ra'], op['--kiem'], C)
    if any(v.get('bo') == 4 for k, v in bang.items() if not k.startswith('_')): so_mu(op['--ra'], op['--kiem'], C, 4)   # thu4-so-mu.png: chỉ bộ 4
    print('danh sách game:', [d['ten'] for d in ds])


if __name__ == '__main__':
    main(sys.argv[1:])
