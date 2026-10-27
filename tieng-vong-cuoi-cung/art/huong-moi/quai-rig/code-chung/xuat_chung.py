#!/usr/bin/env python3
"""Bước chung sau khi cắt mảnh: tô màu nhẹ + vệt sáng mép (vẽ sẵn) → xuất mảnh 2x + JSON (QBR.napThem) → ảnh kiểm
(ráp so chồng, IoU, bảng mảnh) → GIF lớn + GIF cỡ chơi → ảnh so cỡ cạnh Lam mới (art/huong-moi/lam-rig/)."""
import json, math, os
import numpy as np
from PIL import Image, ImageDraw
import cutout as cc

HERE = os.path.dirname(os.path.abspath(__file__))
HM = os.path.normpath(os.path.join(HERE, '..', '..'))                  # art/huong-moi
LAM_SHEET = os.path.join(HM, 'lam-rig', 'sprite', 'lam-ct-dung-2x')
CANH = os.path.join(HM, 'nguon', 'canh-chuan-lang.png')
DAT_CANH = 416                                                        # mặt sàn của cảnh chuẩn ở 960×540 (như game/thu-lam-moi)


def lam_2x(khung=0, rim=True):
    """Lam mới đứng (sheet 2x): ảnh RGBA + điểm neo (px 2x)"""
    m = json.load(open(LAM_SHEET + '.json'))
    f = m['frames'][khung]
    im = Image.open(LAM_SHEET + '.png').crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
    if rim:
        r = Image.open(LAM_SHEET.replace('-2x', '-rim-2x') + '.png').crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
        im = Image.alpha_composite(im, r)
    return im, (m['diem_neo']['x'], m['diem_neo']['y'])


def chen(o, im, x, y):
    """chồng ảnh RGBA PIL (alpha thẳng) lên mảng float o (H×W×4, màu đã ghép nền) tại (x,y)"""
    a = np.array(im).astype(np.float32) / 255
    H, W = o.shape[:2]; h, w = a.shape[:2]
    x0, y0 = max(0, x), max(0, y); x1, y1 = min(W, x + w), min(H, y + h)
    if x1 <= x0 or y1 <= y0: return
    s = a[y0 - y:y1 - y, x0 - x:x1 - x]; v = o[y0:y1, x0:x1]
    v[..., :3] = s[..., :3] * s[..., 3:4] + v[..., :3] * (1 - s[..., 3:4])


def canh(k):
    """ảnh cảnh chuẩn ở 960k×540k (float RGB)"""
    im = Image.open(CANH).convert('RGB').resize((960 * k, 540 * k), Image.LANCZOS)
    return np.array(im).astype(np.float32) / 255


def chay(C):
    """C['nhom']: list nhóm hình (mỗi nhóm = một hình nguyên con trong ảnh nguồn): dict ten, HOP, manh, THU_TU, dich (dời
    toạ độ nhóm vào hệ toạ độ rig, mặc định (0,0)). Nhóm đầu = dáng nghỉ chính."""
    ROOT = C['ROOT']; rig = C['rig']; TY = C['TY']
    MANH = os.path.join(ROOT, 'manh'); KIEM = os.path.join(ROOT, 'kiem'); XEM = os.path.join(ROOT, 'xem-thu')
    for d in (MANH, KIEM, XEM): os.makedirs(d, exist_ok=True)
    TT = {}; ANH2 = {}; ANH_LON = {}; TT_LON = {}; KQ = []; TAT_CA = {}
    for G in C['nhom']:
        HOP = G['HOP']; manh = G['manh']; THU_TU = G['THU_TU']; dx_, dy_ = G.get('dich', (0, 0))
        x0, y0, x1, y1 = HOP
        goc_rgb = C['rgb'][y0:y1, x0:x1] / 255; goc_a = G['alpha'][y0:y1, x0:x1]
        # 1) ráp dáng nghỉ (chưa tô màu) – so với hình nguyên con. THU_TU có thể mượn mảnh nhóm trước (cùng cỡ khung,
        #    vd. Nấm phồng = gốc + mũ của dáng xẹp + túi phồng) → kiểm đúng tư thế rig sẽ vẽ.
        m01 = {t: np.dstack([m[..., :3] / 255, m[..., 3]]) for t, m in manh.items()}
        TAT_CA.update(m01)
        rap = cc.ghep({t: TAT_CA[t] for t in THU_TU}, THU_TU)
        IOU = cc.iou(rap[..., 3], goc_a)
        lech = float(np.abs(rap[..., :3] - goc_rgb)[(goc_a > 0.5) & (rap[..., 3] > 0.5)].mean() * 255)
        print('%s – %s: IoU ráp lại / nguyên con = %.4f · lệch màu TB %.2f /255' % (C['TEN'], G['ten'], IOU, lech))
        KQ.append({'nhom': G['ten'], 'iou': round(IOU, 4), 'lech_mau': round(lech, 2)})
        bong = rap[..., 3] > 0.5
        # 2) tô màu nhẹ + vệt sáng mép (chỉ mép bóng cả con)
        da_to = {}
        for t, m in m01.items():
            giu = C['giu'](m * np.array([255, 255, 255, 1], np.float32)) if C.get('giu') else None
            o = m.copy(); o[..., :3] = cc.to_mau(m[..., :3], **C.get('mau', {}), giu=giu)
            # độ dày vệt sáng tính theo px LOGIC (mảnh đang ở phân giải nguồn): 2 px logic phía trên-trước, 0,75 px quanh bóng
            vs = {'day': 2.0 / TY, 'day_deu': 0.75 / TY}
            vs.update(C.get('vet_sang', {})); vs.update(C.get('vet_sang_rieng', {}).get(t, {}))
            da_to[t] = cc.vet_sang(o, bong, **vs)
        # 3) xuất mảnh 2x (+ bản phân giải gốc để vẽ GIF lớn)
        for t, o in da_to.items():
            tt = cc.xuat_manh(o, HOP, TY, os.path.join(MANH, t + '.png'))
            tt['tl'] = (tt['tl'][0] + dx_, tt['tl'][1] + dy_)
            TT[t] = tt; ANH2[t] = Image.open(os.path.join(MANH, t + '.png'))
            al = o[..., 3]; ys, xs = np.nonzero(al > 0.004)
            c = o[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
            ANH_LON[t] = Image.fromarray(np.dstack([(np.clip(c[..., :3], 0, 1) * 255).round(), (c[..., 3] * 255).round()]).astype(np.uint8), 'RGBA')
            TT_LON[t] = {'tl': (HOP[0] + xs.min() + dx_, HOP[1] + ys.min() + dy_), 'co': (c.shape[1], c.shape[0])}
        # 5) ảnh kiểm: gốc | ráp lại | so chồng (lục = chỉ gốc, đỏ = chỉ ráp, xám = trùng) | khác màu ×4 | mỗi màu một mảnh
        nen = np.array(cc.NEN_TOI, np.float32) / 255
        def tren_nen(rgba):
            return rgba[..., :3] * rgba[..., 3:4] + nen * (1 - rgba[..., 3:4])
        A = goc_a > 0.5; B = bong
        chong = np.zeros(goc_a.shape + (3,), np.float32) + nen
        chong[A & B] = (0.55, 0.55, 0.52); chong[A & ~B] = (0.2, 0.9, 0.3); chong[~A & B] = (0.95, 0.2, 0.2)
        khac = np.clip(np.abs(rap[..., :3] - goc_rgb) * 4, 0, 1) * (A | B)[..., None]
        rng = np.random.RandomState(3); mau_manh = {t: rng.uniform(0.25, 1, 3) for t in THU_TU}
        lop = np.zeros_like(chong) + nen
        for t in THU_TU:
            a_ = TAT_CA[t][..., 3:4] * 0.85
            lop = mau_manh[t] * a_ * (0.5 + 0.5 * TAT_CA[t][..., :3].mean(-1, keepdims=True)) + lop * (1 - a_)
        o_goc = np.dstack([goc_rgb, goc_a])
        bang = [tren_nen(o_goc), tren_nen(rap), chong, khac, lop]
        nhan = ['%s (ảnh gốc)' % G['ten'], 'ráp lại từ %d mảnh' % len(THU_TU), 'so chồng: IoU %.4f' % IOU, 'khác màu ×4', 'mỗi màu một mảnh']
        s_ = min(1.0, 380.0 / goc_a.shape[1])
        hh, ww = int(goc_a.shape[0] * s_), int(goc_a.shape[1] * s_)
        Gi = Image.new('RGB', ((ww + 10) * len(bang) + 10, hh + 40), cc.NEN_TOI); g = ImageDraw.Draw(Gi); f = cc.font(15)
        for i, b_ in enumerate(bang):
            Gi.paste(cc.sang_anh(b_).resize((ww, hh), Image.LANCZOS), (10 + i * (ww + 10), 32))
            g.text((10 + i * (ww + 10), 8), nhan[i], fill=(242, 214, 154), font=f)
        Gi.save(os.path.join(KIEM, 'rap-so-chong%s.png' % G.get('duoi', '')))
    THU_TU = [t for G in C['nhom'] for t in G['manh']]
    # bảng mảnh 2x (đúng ảnh trong gói)
    xs_ = 8; Wb = sum(ANH2[t].width + 10 for t in THU_TU) + 8; Hb = max(ANH2[t].height for t in THU_TU) + 34
    Bm = Image.new('RGBA', (Wb, Hb), cc.NEN_TOI + (255,)); g = ImageDraw.Draw(Bm); f = cc.font(12)
    for t in THU_TU:
        Bm.alpha_composite(ANH2[t], (xs_, 26)); g.text((xs_, 6), t, fill=(242, 214, 154), font=f); xs_ += ANH2[t].width + 10
    Bm.convert('RGB').save(os.path.join(KIEM, 'manh-2x.png'))
    IOU = KQ[0]['iou']; lech = KQ[0]['lech_mau']

    # 4) JSON
    them = dict(C.get('them', {}))
    ve2 = cc.Ve(rig, ANH2, TT)
    P0 = C.get('P_hop', rig.tu_the())
    M = rig.the_gioi(P0)
    hop = [1e9, 1e9, -1e9, -1e9]
    for n in rig.ds:
        m = rig.manh[n]
        if not m or not P0[n][7]: continue
        px, py = rig.vt[n][0] - TT[m]['tl'][0], rig.vt[n][1] - TT[m]['tl'][1]
        for u, v in TT[m]['hull']:
            q = M[n] @ np.array([u - px, v - py, 1])
            hop = [min(hop[0], q[0]), min(hop[1], q[1]), max(hop[2], q[0]), max(hop[3], q[1])]
    hop_l = [round(float(v) * TY, 1) for v in hop]
    them.update({'hop_nghi_logic': hop_l, 'cao_nghi_logic_do': round(hop_l[3] - hop_l[1], 1), 'kiem_rap': KQ})
    J = cc.rig_json(rig, TT, C['CLIPS'], C['TEN'], C['KHOA'], them)
    J['ghi_chu'] = ('Sinh bởi art/huong-moi/quai-rig/%s/code/dung.py. Cùng định dạng game/runtime/quai-boss/quai-moi-rig.json '
                    '(QBR.napThem(base, tên json)). Toạ độ rig = px ảnh nguồn (nền trắng), quái QUAY TRÁI; ảnh mảnh 2 px / px logic. '
                    'Tư thế khung: [dx,dy,goc,sx,sy,toi,mo,hien] theo nut_ds. Chỉ có clip duyệt hình, CHƯA có đòn đánh.' % C['ten_tep'])
    da = sorted(set(TT))
    J['tong'] = {'anh': len(da), 'byte_png': sum(os.path.getsize(os.path.join(MANH, t + '.png')) for t in da),
                 'byte_giai_ma': sum(TT[t]['co_anh'][0] * TT[t]['co_anh'][1] * 4 for t in da)}
    p = os.path.join(ROOT, C['ten_tep'] + '-rig.json')
    json.dump(J, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('  ghi', os.path.relpath(p, ROOT), os.path.getsize(p), 'byte · mảnh', J['tong'], '· hộp nghỉ (logic)', hop_l)

    # 6) GIF: lớn (vẽ từ mảnh phân giải gốc) + cỡ chơi 1:1 (vẽ từ mảnh 2x, như game) – nền tối, vạch đất trôi khi đi
    veL = cc.Ve(rig, ANH_LON, TT_LON)
    cao = hop_l[3] - hop_l[1]
    k_lon = min(4.0, 320.0 / max(cao, hop_l[2] - hop_l[0]) * 1.0)
    for ten, clip, dai_s in C['clip_gif']:
        cl = C['CLIPS'][clip]
        nhay = 2 if cl['ms'] >= 2500 else 1          # clip chậm (đứng/thở/treo): GIF 15 hình/s cho nhẹ; clip nhanh: 30 hình/s
        n = int(round(dai_s * 1000 / cl['buoc_ms'] / nhay))
        toc = C.get('toc', {}).get(clip, 0.0)
        bien = C.get('bien_gif', {}).get(clip, (0, 0, 0, 0))   # nới khung (trái, trên, phải, dưới) px logic
        for nhan_, k, ve_ in (('lon', k_lon, veL), ('co-choi', 1.0, ve2)):
            hg = C.get('hop_gif', {}).get(clip, hop_l)
            hx0, hy0, hx1, hy1 = hg[0] - 10 - bien[0], hg[1] - 10 - bien[1], hg[2] + 10 + bien[2], hg[3] + 6 + bien[3]
            Wc, Hc = int((hx1 - hx0) * k), int((hy1 - hy0) * k)
            neo = (-hx0 * k, -hy0 * k)
            kh = []
            for i in range(n):
                tms = i * nhay * cl['buoc_ms']
                j = (i * nhay) % len(cl['khung'])
                P = {nn: list(cl['khung'][j][q]) for q, nn in enumerate(rig.ds)}
                o = ve_.ve(P, k, (Wc, Hc), neo)
                im = cc.sang_anh(o)
                if C.get('dat_gif', {}).get(clip, True):   # có mặt đất
                    d = ImageDraw.Draw(im); yd = neo[1]
                    d.line([(0, yd), (Wc, yd)], fill=(70, 62, 52), width=max(1, int(k / 2)))
                    buoc_v = (toc * cl['ms'] / 1000 / 2 if toc else 24) * k; lech_v = (toc * tms / 1000 * k) % buoc_v
                    for xv in np.arange(-buoc_v + lech_v, Wc, buoc_v):
                        d.line([(xv, yd), (xv - 4 * k, yd + 3 * k)], fill=(70, 62, 52), width=max(1, int(k / 2)))
                kh.append(im)
            cc.luu_gif(kh, cl['buoc_ms'] * nhay, os.path.join(XEM, '%s-%s.gif' % (ten, nhan_)))
        print('  GIF', ten, n, 'khung')

    # 7) so cỡ cạnh Lam mới (đứng, khung 0): cỡ chơi 1× và 2× (ảnh 2x đúng gói, không phóng)
    lam, (lax, lay) = lam_2x()
    for k in (1, 2):
        nen_c = canh(k)
        W_, H_ = 360 * k, 230 * k
        xc0 = 300 * k; yc0 = (DAT_CANH - 190) * k
        o = np.zeros((H_, W_, 4), np.float32); o[..., :3] = nen_c[yc0:yc0 + H_, xc0:xc0 + W_]; o[..., 3] = 1
        dat_y = (DAT_CANH * k) - yc0
        neo = (W_ * 0.68, dat_y - C.get('so_co_neo_cao', 0) * k)
        o = ve2.ve(C.get('P_so_co', rig.tu_the()), k, (W_, H_), neo, nen=None, anh_nen=o)
        li = lam if k == 2 else lam.resize((lam.width // 2, lam.height // 2), Image.LANCZOS)
        chen(o, li, int(W_ * 0.22 - lax * k / 2), int(dat_y - lay * k / 2))
        im = cc.sang_anh(o); d = ImageDraw.Draw(im); f = cc.font(11 * k)
        d.text((6 * k, 6 * k), 'Lam mới 112 px  ·  %s %.0f px (cỡ %d×)' % (C['TEN'], C.get('cao_ghi', cao), k), fill=(242, 214, 154), font=f)
        im.save(os.path.join(XEM, 'so-co-lam-%dx.png' % k))
    print('  ảnh kiểm + so cỡ xong')
    return {'IOU': IOU, 'hop': hop_l, 'TT': TT}
