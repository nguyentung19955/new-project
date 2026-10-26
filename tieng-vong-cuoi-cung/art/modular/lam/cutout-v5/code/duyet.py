"""Ảnh duyệt 4 tư thế v5:  python3 duyet.py   (chạy sau xuat.py → attachment.py → tu_the.py)
→ ../tu-the/
  01-bang-duyet.png            bảng chính: 4 tư thế – màu cỡ lớn, silhouette cỡ lớn, 112 px logic 1:1 và ×4 (màu + silhouette)
  02-so-sanh-v4-v5.png         cùng tư thế: v4 (khoá chạy nháp v4) ↔ v5, màu + silhouette
  03-khuyu-goi-phong-to.png    phóng ×4 khuỷu tay gần, gối gần, gối xa ở từng tư thế, v4 ↔ v5
  04-phoi-canh-chan-xa.png     chân xa: cùng logic bước (v5) ↔ thêm DX_SHIFT −32 / LIFT_SCALE 0,7 của v4
  05-attachment.png            toàn bộ attachment duỗi/gập đã dựng
  tu-the-<ten>-lon.png, tu-the-<ten>-112px.png, tu-the-<ten>-112px-x4.png   từng tư thế riêng
  so-lieu.json                 số đo (độ cao root, đế so với đất, vị trí dao so với hông…)
Cột v4 chỉ vẽ khi có ../../cutout-v4/ (đọc lam-v4.json + code/chay_nhap.py của v4).
"""
import os, sys, json, math, importlib.util
import numpy as np
from PIL import Image, ImageDraw

import rap4, rap5, tu_the
from chung import font

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
OUT = os.path.join(ROOT, 'tu-the')
V4 = os.path.normpath(os.path.join(ROOT, '..', 'cutout-v4'))
K112 = 112 / 470.0
BG = (236, 232, 220)
FR_SIZE, FR_OFF = (500, 500), (6, 24)        # khung thế giới cố định cho mọi tư thế (đất y=468)
DAT = tu_the.DAT


def ve(L, size=FR_SIZE, off=FR_OFF):
    return rap4.render(L, size, offset=off)


def nen(cv, ground=True, col=BG, scale=1.0, off=FR_OFF):
    im = Image.new('RGBA', cv.size, col + (255,))
    if ground:
        y = (DAT + off[1]) * scale
        ImageDraw.Draw(im).line([(0, y), (im.width, y)], fill=(130, 130, 130), width=max(1, round(2 * scale)))
    im.alpha_composite(cv)
    return im.convert('RGB')


def bong_den(cv, ground=True, scale=1.0, off=FR_OFF):
    a = np.array(cv)[..., 3] > 127
    o = np.full(a.shape + (3,), 255, np.uint8); o[a] = (0, 0, 0)
    im = Image.fromarray(o)
    if ground:
        y = (DAT + off[1]) * scale
        d = ImageDraw.Draw(im); d.line([(0, y), (im.width, y)], fill=(170, 170, 170), width=max(1, round(2 * scale)))
        im = Image.fromarray(np.where(a[..., None], 0, np.array(im)).astype(np.uint8))
    return im


def nho112(cv):
    return cv.resize((round(cv.width * K112), round(cv.height * K112)), Image.LANCZOS)


def x4(im):
    return im.resize((im.width * 4, im.height * 4), Image.NEAREST)


def v4_tu_the():
    """Tư thế v4 tương ứng: khoá 0..3 của chay_nhap.py v4 (t = k·0,08 s), rig + mảnh v4."""
    j = os.path.join(V4, 'lam-v4.json'); c = os.path.join(V4, 'code', 'chay_nhap.py')
    if not (os.path.isfile(j) and os.path.isfile(c)):
        return None, None
    spec = importlib.util.spec_from_file_location('chay_nhap_v4', c)
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    r4 = rap4.Rig(j, os.path.join(V4, 'manh'))
    run = m.Run(r4)
    P = {}
    for k, t in enumerate(tu_the.TU_THE):
        p, _ = run.pose(k * m.CYCLE / 8)
        P[t] = p
    return r4, P


def nhan(im, txt, size=16, pos=(6, 4), col=(0, 0, 0)):
    ImageDraw.Draw(im).text(pos, txt, fill=col, font=font(size))
    return im


def ghep_hang(ims, gap=6, bg=(255, 255, 255)):
    W = sum(i.width for i in ims) + gap * (len(ims) - 1); H = max(i.height for i in ims)
    o = Image.new('RGB', (W, H), bg); x = 0
    for i in ims:
        o.paste(i, (x, 0)); x += i.width + gap
    return o


def ghep_cot(ims, gap=6, bg=(255, 255, 255)):
    W = max(i.width for i in ims); H = sum(i.height for i in ims) + gap * (len(ims) - 1)
    o = Image.new('RGB', (W, H), bg); y = 0
    for i in ims:
        o.paste(i, (0, y)); y += i.height + gap
    return o


def tieu_de(w, txt, size=18, h=None):
    F = font(size)
    lines = txt.split('\n'); h = h or (size + 8) * len(lines) + 8
    im = Image.new('RGB', (w, h), 'white'); d = ImageDraw.Draw(im)
    for i, l in enumerate(lines):
        d.text((8, 4 + i * (size + 8)), l, fill=(0, 0, 0), font=F)
    return im


def main():
    os.makedirs(OUT, exist_ok=True)
    rig, P = tu_the.tat_ca()
    so = tu_the.slot_goc(rig)
    r4, P4 = v4_tu_the()
    lay = {t: rig.layers(p, slot_override=so) for t, (p, _) in P.items()}
    cvs = {t: ve(L) for t, L in lay.items()}
    # ---------- 01 bảng duyệt ----------
    cols = []
    for t in tu_the.TU_THE:
        cv = cvs[t]; ts = P[t][1]
        big = nhan(nen(cv), tu_the.TEN[t].upper(), 22)
        sil = bong_den(cv)
        s = nho112(cv)
        s1 = nen(s, scale=K112); s1b = bong_den(s, scale=K112)
        pair = Image.new('RGB', (FR_SIZE[0], s1.height + 26), 'white')
        pair.paste(s1, (8, 22)); pair.paste(s1b, (8 + s1.width + 16, 22))
        nhan(pair, '112 px logic 1:1 (màu | silhouette)', 13, (6, 2))
        z = x4(s1); zb = x4(s1b)
        cols.append(ghep_cot([big, sil, pair, z, zb], 4))
        big.save(os.path.join(OUT, 'tu-the-%s-lon.png' % t))
        s1.save(os.path.join(OUT, 'tu-the-%s-112px.png' % t)); z.save(os.path.join(OUT, 'tu-the-%s-112px-x4.png' % t))
    body = ghep_hang(cols, 10)
    hdr = tieu_de(body.width, 'LAM v5 – 4 TƯ THẾ CHẠY ĐỂ DUYỆT (chưa ráp chu kỳ, chưa làm GIF).  Hàng: màu cỡ lớn (1 px = 1 px thế giới, '
                  'Lam cao ~470) · silhouette đen cỡ lớn · 112 px logic 1:1 · 112 px logic ×4 màu · 112 px logic ×4 silhouette.\n'
                  'Khung + đường đất cố định cho cả 4 tư thế (so được độ nhún). Tay/chân dùng attachment liền (một đường viền), '
                  'găng và ủng vẫn là mảnh riêng. Hai chân cùng một bảng bước, lệch nửa chu kỳ.', 16)
    ghep_cot([hdr, body], 4).save(os.path.join(OUT, '01-bang-duyet.png'))
    # ---------- 02 so sánh v4 ↔ v5 ----------
    rows = []
    for t in tu_the.TU_THE:
        cells = []
        if r4 is not None:
            c4 = ve(r4.layers(P4[t]))
            cells += [nhan(nen(c4), 'v4 – ' + tu_the.TEN[t], 18), bong_den(c4)]
        cv = cvs[t]
        cells += [nhan(nen(cv), 'v5 – ' + tu_the.TEN[t], 18), bong_den(cv)]
        if r4 is not None:
            cells += [nhan(x4(nen(nho112(c4), scale=K112)), 'v4 112px ×4', 14),
                      nhan(x4(nen(nho112(cv), scale=K112)), 'v5 112px ×4', 14)]
        rows.append(ghep_hang(cells, 6))
    body = ghep_cot(rows, 8)
    hdr = tieu_de(body.width, 'SO SÁNH v4 ↔ v5 cùng tư thế. v4 = khoá chạy nháp v4 (chay_nhap.py v4, t = 0 / 0,08 / 0,16 / 0,24 s), '
                  'v5 = tư thế thiết kế mới. Cùng khung, cùng đất.', 16)
    ghep_cot([hdr, body], 4).save(os.path.join(OUT, '02-so-sanh-v4-v5.png'))
    # ---------- 03 khuỷu / gối phóng to ----------
    def khop(r, p, cha):
        M, _ = r.matrices(p); return rap4.app(M[cha], r.inst[cha]['D'])

    def crop_khop(r, L, p, cha, lab, R=64, k=3):
        c = khop(r, p, cha)
        cv = rap4.render(L, (2 * R, 2 * R), offset=(R - c[0], R - c[1]))
        im = Image.new('RGBA', cv.size, BG + (255,)); im.alpha_composite(cv)
        d = ImageDraw.Draw(im); d.line([(R - 4, R), (R + 4, R)], fill=(255, 0, 0)); d.line([(R, R - 4), (R, R + 4)], fill=(255, 0, 0))
        z = im.convert('RGB').resize((2 * R * k, 2 * R * k), Image.LANCZOS)
        o = Image.new('RGB', (z.width, z.height + 24), 'white'); o.paste(z, (0, 24))
        return nhan(o, lab, 15)
    rows = []
    hdrs = []
    for t in tu_the.TU_THE:
        p = P[t][0]; cells = []
        for cha, lab in (('tay-tren-gan', 'khuỷu tay gần'), ('dui-gan', 'gối gần'), ('dui-xa', 'gối xa')):
            if r4 is not None:
                cells.append(crop_khop(r4, r4.layers(P4[t]), P4[t], cha, 'v4 %s – %s' % (lab, tu_the.TEN[t])))
            cells.append(crop_khop(rig, lay[t], p, cha, 'v5 %s – %s' % (lab, tu_the.TEN[t])))
        rows.append(ghep_hang(cells, 6))
    body = ghep_cot(rows, 8)
    hdr = tieu_de(body.width, 'KHUỶU VÀ GỐI phóng ×3 (ô 128×128 px thế giới, dấu + đỏ = tâm khớp). v5: đường bao ngoài liền, không nắp tròn nhô, '
                  'không vạch đen cắt ngang ống tay/ống quần,\nmột nếp gấp ngắn phía trong khi gập ≥ 30°, dải tối liền qua khớp; '
                  'găng/ủng giữ viền riêng (ranh giới vải ↔ da).', 16)
    ghep_cot([hdr, body], 4).save(os.path.join(OUT, '03-khuyu-goi-phong-to.png'))
    # ---------- 04 phối cảnh chân xa ----------
    rep_pc = {}
    rows = []
    for t in tu_the.TU_THE:
        p, ts = P[t]
        cv_a = cvs[t]
        pb, info = bien_the_v4(rig, p)
        cv_b = ve(rig.layers(pb, slot_override=so))
        ia = nhan(nen(cv_a), 'v5: cùng logic – ' + tu_the.TEN[t], 16)
        ib = nhan(nen(cv_b), '+ DX −32, nhấc ×0,7 (kiểu v4)', 16)
        da = ImageDraw.Draw(ia); db = ImageDraw.Draw(ib)
        for d_, inf in ((da, info['a']), (db, info['b'])):
            x, y = inf['co_chan']; d_.ellipse([x + FR_OFF[0] - 5, y + FR_OFF[1] - 5, x + FR_OFF[0] + 5, y + FR_OFF[1] + 5],
                                              outline=(220, 0, 0), width=2)
        nhan(ia, 'đế thấp nhất chân xa y=%.0f (đất 468)' % info['a']['de_y'], 13, (6, 26))
        nhan(ib, 'đế thấp nhất chân xa y=%.0f; gập gối %.0f°→%d°' % (info['b']['de_y'], info['b']['gap_ik'], info['b']['gap']),
             13, (6, 26))
        sa, sb = bong_den(cv_a), bong_den(cv_b)
        rows.append(ghep_hang([ia, ib, sa, sb], 6))
        rep_pc[t] = info
    body = ghep_cot(rows, 8)
    hdr = tieu_de(body.width, 'CHÂN XA: trái = v5 (hai chân cùng bảng bước, lệch nửa chu kỳ, KHÔNG dịch thêm). Phải = cùng tư thế nhưng '
                  'áp thêm DX_SHIFT −32 px và LIFT_SCALE 0,7 của v4 cho chân xa (giải IK chỉ để dựng ảnh so sánh này).\n'
                  'Vòng đỏ = cổ chân xa. Kết luận ở GHI-CHU-V5.md: điểm gắn hông xa của rig đã lệch sẵn ra sau 49 px và thấp hơn 20 px '
                  '→ phối cảnh đã có; dịch thêm làm chân xa tụt ra sau, lẫn với bao dao.', 16)
    ghep_cot([hdr, body], 4).save(os.path.join(OUT, '04-phoi-canh-chan-xa.png'))
    # ---------- 05 attachment ----------
    F = font(12); rows = []
    for chi, d in rig.att.items():
        cells = []
        for it in d['ds']:
            im = rig.att_img[it['anh']]
            c = Image.new('RGBA', (150, 170), (255, 0, 255, 255)); s = min(1.0, 140 / max(im.size))
            j = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
            c.alpha_composite(j, ((150 - j.width) // 2, 20 + (150 - j.height) // 2))
            c = c.convert('RGB'); ImageDraw.Draw(c).text((4, 2), '%s %d°' % (chi, it['goc_gap']), fill=(0, 0, 0), font=F)
            cells.append(c)
        rows.append(ghep_hang(cells, 4))
    body = ghep_cot(rows, 4)
    hdr = tieu_de(body.width, 'ATTACHMENT duỗi/gập (manh/attachment/): tay trên+cẳng tay / đùi+cẳng chân gộp một hình, một viền. '
                  'Dựng bằng code từ mảnh v4. Nền hồng = trong suốt.', 14)
    ghep_cot([hdr, body], 4).save(os.path.join(OUT, '05-attachment.png'))
    # ---------- số liệu ----------
    rep = dict(ghi_chu='px thế giới; px logic = × %.4f. Đất y = 468.' % K112, tu_the={})
    for t in tu_the.TU_THE:
        p, ts = P[t]
        M, _ = rig.matrices(p)
        hip = rap4.app(M['dui-gan'], rig.inst['dui-gan']['P'])
        # mũi dao và chuôi dao so với hông gần / đất
        dao = rig.inst['dao']; w, h = rig.img[dao['anh']].size
        tip = rap4.app(M['dao'], (w - 1, h / 2)); grip = rap4.app(M['dao'], dao['P'])
        de = {c: round(float(tu_the.de_thap_nhat(rig, p, c)), 2) for c in ('chan-gan', 'chan-xa')}
        rep['tu_the'][t] = dict(root_dy=ts['root_dy'], root_dy_logic=round(ts['root_dy'] * K112, 2),
                                de_thap_nhat_y=de, chan_tru=ts['chan_tru'], nghieng_than=ts['lean'],
                                hong_gan=[round(float(x), 1) for x in hip], chuoi_dao=[round(float(x), 1) for x in grip],
                                mui_dao=[round(float(x), 1) for x in tip],
                                dao_che_hong_chan_px=dao_che(rig, p, so),
                                dao_che_hong_chan_px_v4=dao_che(r4, P4[t]) if r4 is not None else None,
                                huong_luoi_dao_do=round(huong_dao(rig, p), 1),
                                huong_luoi_dao_do_v4=round(huong_dao(r4, P4[t]), 1) if r4 is not None else None,
                                gap_khuyu_tay_dao=ts['tay']['tay-gan'][1],
                                gap_khuyu_tay_dao_v4=round(-r4.matrices(P4[t])[1]['cang-tay-gan'], 1) if r4 is not None else None,
                                thiet_ke=dict(chan=ts['chan'], tay=ts['tay']),
                                phoi_canh_chan_xa=rep_pc[t])
    json.dump(rep, open(os.path.join(OUT, 'so-lieu.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps({t: (v['root_dy'], v['de_thap_nhat_y'], v['huong_luoi_dao_do'], v['huong_luoi_dao_do_v4'], v['gap_khuyu_tay_dao'], v['gap_khuyu_tay_dao_v4']) for t, v in rep['tu_the'].items()},
                     ensure_ascii=False))


VUNG_HONG_CHAN = ['dui-gan', 'cang-chan-gan', 'ung-gan', 'dui-xa', 'cang-chan-xa', 'ung-xa', 'dai', 'vat-sau', 'bao-dao']


def huong_dao(r, p):
    """Hướng lưỡi dao thế giới (độ; 0 = chĩa ngang ra trước, âm = chếch lên, dương = chúc xuống)."""
    M, _ = r.matrices(p)
    return rap4.wrap(r.world_dir(M, 'dao'))


def dao_che(r, p, so=None):
    """Số px thế giới mà DAO (lưỡi + chuôi) che mất phần ĐANG THẤY của vùng hông/chân (đai, vạt sau, bao dao,
    đùi, cẳng, ủng): vẽ mọi lớp trừ dao → lớp trên cùng mỗi điểm; đếm điểm có dao mà lớp đó thuộc vùng hông/chân."""
    L = [x for x in r.layers(p, slot_override=so) if x[0] != 'dao']
    ids = rap4.render_ids(L, FR_SIZE, offset=FR_OFF)
    names = np.array([n for n, _, _ in L] + ['_nen'])
    top = names[ids]                      # id −1 → '_nen'
    a = np.array(ve(r.layers(p, only=['dao'], slot_override=so)))[..., 3] > 127
    return int((a & np.isin(top, VUNG_HONG_CHAN)).sum())


def bien_the_v4(rig, p):
    """Cùng pose nhưng chân xa áp DX_SHIFT −32 và LIFT_SCALE 0,7 kiểu v4 (giải IK hai đoạn chỉ cho ảnh so sánh)."""
    import copy
    M, ang = rig.matrices(p)
    b = 'ung-xa'; c = rig.ik['chan-xa']
    ank = rap4.app(M[b], rig.inst[b]['P']); de = rap4.app(M[b], c['diem_de'])
    boot_dir = rig.world_dir(M, b)
    ank_stand = DAT - (c['diem_de'][1] - rig.inst[b]['P'][1])
    lift = max(0.0, ank_stand - ank[1])
    new_ank = np.array([ank[0] - 32.0, ank_stand - 0.7 * lift])
    shift = new_ank - ank
    q = copy.deepcopy(p); q.pop('attachment', None)
    q['khoa_chan'] = {'chan-xa': dict(de=[float(de[0] + shift[0]), float(de[1] + shift[1])], huong_ung=float(boot_dir), mix=1.0)}
    M2, ang2 = rig.matrices(q)
    thieu = float(rig.last_ik.get('chan-xa', {}).get('thieu_px', 0.0))
    gap_ik = float(ang2['cang-chan-xa'])
    gap = int(round(gap_ik / 15.0) * 15)
    # dựng lại bằng FK với gập gối đã làm tròn (để dùng đúng attachment) – giữ góc đùi/ủng thế giới từ IK
    q2 = copy.deepcopy(p)
    for n in ('dui-xa', 'cang-chan-xa', 'ung-xa'):
        q2['goc'][n] = ang2[n] - rig.inst[n]['goc_nghi']
    dg = gap - gap_ik
    q2['goc']['cang-chan-xa'] += dg; q2['goc']['ung-xa'] -= dg
    q2['attachment'] = dict(p['attachment']); q2['attachment']['chan-xa'] = gap
    M3, _ = rig.matrices(q2)
    a = dict(co_chan=[float(x) for x in ank], de_y=round(float(tu_the.de_thap_nhat(rig, p, 'chan-xa')), 2))
    bb = dict(co_chan=[float(x) for x in rap4.app(M3[b], rig.inst[b]['P'])], de_y=round(float(tu_the.de_thap_nhat(rig, q2, 'chan-xa')), 2),
              gap_ik=round(gap_ik, 1), gap=gap, thieu_tam_px=round(thieu, 2))
    return q2, dict(a=a, b=bb)


if __name__ == '__main__':
    main()
