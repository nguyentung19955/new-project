#!/usr/bin/env python3
"""Dựng MÀN RỄ RỦ (PH15 mục 4) từ bộ mảnh gen art/huong-moi/nguon/dia-hinh/man-re-ru-manh.png
(hàng trên: 1 BÚI rễ trần rộng · giữa: 7 DẢI rễ dài, đầu trên phẳng · dưới: 4 ĐẦU rễ cong).
Ra: art/the-gioi-moi/dia-hinh-v4/man-re-3x.png + man-re.json (cạnh dia-hinh-v4.json → TT.nap tự nạp, ưu tiên hơn cổng dọc; ?cong=cu = cổng dọc,
    ?cong=ngang = cổng rễ ngang v4) + xem thử art/the-gioi-moi/dia-hinh-v4/xem-thu/man-re-dong-3x.png.

    python3 art/huong-moi/dia-hinh/code/tao-man-re.py

THAY HẲN cổng dọc: không khung / cột / ngưỡng. Hộp chặn GIỮ NGUYÊN 183 × 159 logic neo giữa đáy (game GATE, đi xuyên khi mở ≥ 0,6).
  búi   bám TRẦN ngay trên hộp chặn: rộng BUI_RONG logic, đỉnh búi cao hơn đỉnh hộp BUI_NHO px (chui vào trần)
  dải   7 dải (bảng XEP: tâm x, lớp trước/sau, lệch pha) phủ TOÀN bề ngang hộp; đầu trên phẳng giấu sau búi; khi đóng chân dải chạm sàn
        lớp sau tối hơn TOI_SAU (nướng sẵn vào ảnh – không dùng filter lúc chơi)
  đầu   4 đầu rễ cong gắn dưới 4 dải lớp trước (vẽ SAU dải, đi cùng dải) – đầu chạm sàn, nhấc trước khi dải kéo lên
Chuyển động (rủ xuống / thu lên, lắc tắt dần) làm bằng code trong game/runtime/trang-tri-dia-hinh.js (veManRe) – không scaleY, dịch dải từ sau búi + cắt ở trần.
Tách nền như art/huong-moi/lam-tu-the-2/code/tach.py. Ảnh 3x (px = logic × 3)."""
import json, os, sys
import numpy as np, cv2
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(ART, 'huong-moi', 'lam-tu-the-2', 'code'))
from tach import tach_anh

SRC = os.path.join(ART, 'huong-moi', 'nguon', 'dia-hinh', 'man-re-ru-manh.png')
RA = os.path.join(ART, 'the-gioi-moi', 'dia-hinh-v4')
XEM = os.path.join(RA, 'xem-thu')
B = 3
HOP = (-89, -159, 183, 159)
BUI_RONG = 206        # logic – búi rộng hơn hộp (183) một chút: không lộ đầu dải ở hai mép
BUI_NHO = 7           # logic – đỉnh búi nằm trên đỉnh hộp (chui vào trần)
DAI_CAO = 172         # logic – dải: đỉnh (phẳng) ở −DAI_CAO + chân… khi đóng chân dải ở sàn (−1)
TOI_SAU = 0.82        # lớp sau tối hơn
DAU_K = 0.6           # đầu rễ cong: thu so với thang dải
# 7 dải: [chỉ số mảnh nguồn (trái→phải), tâm x (logic, so với tâm cổng), lớp ('sau' | 'truoc'), lệch pha (0..1, 0 = giữa rủ trước), đầu rễ (chỉ số / None), lật đầu rễ (1 = cong vào trong: nửa trái)]
XEP = [
    [0, -70, 'truoc', 1.0, 0, 1],
    [1, -47, 'sau', 0.67, None],
    [2, -23, 'truoc', 0.33, 1, 1],
    [3, 2, 'sau', 0.0, None],
    [4, 25, 'truoc', 0.33, 2],
    [5, 49, 'sau', 0.67, None],
    [6, 72, 'truoc', 1.0, 3],
]


def thu(rgba, k):
    a = rgba.astype(np.float32) / 255; pm = a.copy(); pm[..., :3] *= a[..., 3:4]
    w, h = max(1, round(rgba.shape[1] * k)), max(1, round(rgba.shape[0] * k))
    r = cv2.resize(pm, (w, h), interpolation=cv2.INTER_AREA)
    al = np.clip(r[..., 3:4], 0, 1); rgb = np.where(al > 1e-4, r[..., :3] / np.maximum(al, 1e-4), 0)
    o = (np.dstack([rgb, al]).clip(0, 1) * 255).round().astype(np.uint8); o[o[..., 3] == 0, :3] = 0
    return o


def manh(rgba):
    a = rgba[..., 3] > 0; lab, n = ndi.label(a, structure=np.ones((3, 3))); co = ndi.sum(a, lab, range(1, n + 1)); sl = ndi.find_objects(lab)
    lon = [k for k in np.argsort(-co) if co[k] > 5000]
    ra = []
    for k in lon:
        s = sl[k]; m = lab[s] == k + 1; im = rgba[s].copy(); im[~m] = 0
        trang = (im[..., :3].min(-1) > 190) & (im[..., 3] > 0)   # đốm nền trắng kẹt giữa các sợi rễ (lỗ nhỏ tach_anh không coi là nền) → trong suốt
        im[ndi.binary_dilation(trang, iterations=1) & (im[..., :3].min(-1) > 150)] = 0
        ra.append((s[1].start, s[0].start, im))
    bui = max(ra, key=lambda r: r[2].shape[1])
    con = [r for r in ra if r is not bui]
    dai = sorted([r for r in con if r[2].shape[0] > 400], key=lambda r: r[0])
    dau = sorted([r for r in con if r[2].shape[0] <= 400], key=lambda r: r[0])
    assert len(dai) == 7 and len(dau) == 4, (len(dai), len(dau))
    return bui[2], [d[2] for d in dai], [d[2] for d in dau]


def main():
    rgba = tach_anh(SRC)
    bui, dai, dau = manh(rgba)
    kb = BUI_RONG * B / bui.shape[1]; BU = thu(bui, kb)
    kd = DAI_CAO * B / float(np.median([d.shape[0] for d in dai]))
    DA = []
    for i, d in enumerate(dai):
        im = thu(d, kd)
        if XEP[i][2] == 'sau': im = im.copy(); im[..., :3] = (im[..., :3].astype(np.float32) * TOI_SAU).astype(np.uint8)
        DA.append(im)
    DU = [thu(d, kd * DAU_K) for d in dau]
    # đầu rễ: điểm gắn = điểm CAO NHẤT phía phải của mảnh (gốc có rêu) – đo trên mảnh đã thu
    gan = []   # điểm gắn = gốc có rêu (điểm cao nhất, lệch phải) – x đặt dưới tâm dải; ĐÁY mảnh = chân dải (đầu rễ nằm trên sàn khi đóng)
    for im in DU:
        a = im[..., 3] > 128; ys, xs = np.nonzero(a); j = np.argmin(ys - 0.15 * xs)
        gan.append((float(xs[j]), float(im.shape[0])))
    # atlas: hàng 1 búi; hàng 2 dải; hàng 3 đầu
    pad = 4; W = max(BU.shape[1], sum(d.shape[1] + pad for d in DA), sum(d.shape[1] + pad for d in DU))
    H = BU.shape[0] + pad + max(d.shape[0] for d in DA) + pad + max(d.shape[0] for d in DU)
    at = np.zeros((H, W, 4), np.uint8); khung = {}
    at[:BU.shape[0], :BU.shape[1]] = BU; khung['bui'] = [0, 0, BU.shape[1], BU.shape[0]]
    y = BU.shape[0] + pad; x = 0
    for i, d in enumerate(DA): at[y:y + d.shape[0], x:x + d.shape[1]] = d; khung['dai%d' % i] = [x, y, d.shape[1], d.shape[0]]; x += d.shape[1] + pad
    y += max(d.shape[0] for d in DA) + pad; x = 0
    for i, d in enumerate(DU): at[y:y + d.shape[0], x:x + d.shape[1]] = d; khung['dau%d' % i] = [x, y, d.shape[1], d.shape[0]]; x += d.shape[1] + pad
    Image.fromarray(at).save(os.path.join(RA, 'man-re-3x.png'), optimize=True)
    L = lambda k: {'khung': khung[k], 'w': round(khung[k][2] / B, 2), 'h': round(khung[k][3] / B, 2)}
    # đáy búi (phần đặc, bỏ rễ con thòng) – đo % điểm đặc theo hàng
    a = BU[..., 3] > 128; hang = a.mean(1); day_dac = int(np.nonzero(hang > 0.45)[0].max()) / B
    bui_y = HOP[1] - BUI_NHO   # đỉnh búi (logic, so với sàn)
    meta = {'ten': 'Màn rễ rủ (PH15 mục 4) – bộ mảnh man-re-ru-manh.png; toạ độ logic so với tâm cổng trên sàn (x giữa, y = sàn, âm = lên)',
            'anh': 'man-re-3x.png', 'boi': B, 'co_anh': [W, H],
            'bui': dict(L('bui'), x=-BUI_RONG / 2, y=bui_y, day_dac=round(bui_y + day_dac, 1),
                        y_nghia='đỉnh búi ở y (trên đỉnh hộp BUI_NHO px – chui vào trần); day_dac = đáy phần búi đặc (dưới đó là rễ con thòng)'),
            'dai': [dict(L('dai%d' % i), x=XEP[i][1], lop=XEP[i][2], pha=XEP[i][3], dau=XEP[i][4], dau_lat=XEP[i][5] if len(XEP[i]) > 5 else 0) for i in range(7)],
            'dau': [dict(L('dau%d' % i), gan=[round(gan[i][0] / B, 1), round(gan[i][1] / B, 1)]) for i in range(4)],
            'dau_y_nghia': 'đầu rễ cong: gan = [x gốc rêu, đáy mảnh] (logic, trong mảnh); x gốc đặt dưới tâm dải, đáy mảnh = chân dải (sàn khi đóng); vẽ TRƯỚC dải (nằm sau lưng dải), đi cùng dải',
            'tran': HOP[1], 'dai_y_nghia': 'dải neo GIỮA ĐỈNH; đóng: chân dải ở sàn (đỉnh ở −h); kéo lên tới đỉnh ≤ đỉnh búi thì đã khuất. Cắt ở trần (y = tran)',
            'hop_chan': {'x': HOP[0], 'y': HOP[1], 'w': HOP[2], 'h': HOP[3], 'ghi_chu': 'KHÔNG đổi – game giữ (GATE); chỉ ghi để kiểm hình phủ'},
            'thu': {'bui_px_gen_sang_logic': round(kb / B, 4), 'dai_px_gen_sang_logic': round(kd / B, 4), 'dau': round(kd * DAU_K / B, 4)}}
    phu = [(XEP[i][1] - DA[i].shape[1] / B / 2, XEP[i][1] + DA[i].shape[1] / B / 2) for i in range(7)]
    meta['phu_ngang'] = [round(min(p[0] for p in phu), 1), round(max(p[1] for p in phu), 1)]
    json.dump(meta, open(os.path.join(RA, 'man-re.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('màn rễ: búi %.0f×%.0f (đáy đặc %.1f), dải cao %.0f rộng %s, phủ ngang %s (hộp %d…%d)' % (
        BU.shape[1] / B, BU.shape[0] / B, meta['bui']['day_dac'], DAI_CAO, [round(d.shape[1] / B) for d in DA], meta['phu_ngang'], HOP[0], HOP[0] + HOP[2]))
    # xem thử: đóng, 3x, có hộp chặn (giống veManRe khi o = 0)
    os.makedirs(XEM, exist_ok=True)
    c = Image.new('RGBA', (int(260 * B), int(230 * B)), (30, 34, 40, 255)); cx, cy = 130 * B, 215 * B
    tran = cy + HOP[1] * B
    lop = Image.new('RGBA', c.size)
    for thu_tu in ('sau', 'truoc'):
        for i in range(7):
            if XEP[i][2] != thu_tu: continue
            d = Image.fromarray(DA[i]); x0 = cx + XEP[i][1] * B - d.width / 2; y0 = cy - B - d.height
            if XEP[i][4] is not None:
                u = Image.fromarray(DU[XEP[i][4]]); g = gan[XEP[i][4]]; gx = g[0]
                if len(XEP[i]) > 5 and XEP[i][5]: u = u.transpose(Image.FLIP_LEFT_RIGHT); gx = u.width - g[0]
                lop.alpha_composite(u, (int(cx + XEP[i][1] * B - gx), int(cy - B - g[1])))
            lop.alpha_composite(d, (int(x0), int(y0)))
    a = np.asarray(lop).copy(); a[:int(tran)] = 0; c.alpha_composite(Image.fromarray(a))
    c.alpha_composite(Image.fromarray(BU), (int(cx - BU.shape[1] / 2), int(cy + bui_y * B)))
    d = ImageDraw.Draw(c); d.rectangle([cx + HOP[0] * B, cy + HOP[1] * B, cx + (HOP[0] + HOP[2]) * B, cy], outline=(255, 210, 90), width=3)
    d.line([0, cy, c.width, cy], fill=(200, 60, 60), width=2); d.line([0, tran, c.width, tran], fill=(90, 160, 220), width=1)
    c.convert('RGB').save(os.path.join(XEM, 'man-re-dong-3x.png'))


if __name__ == '__main__':
    main()
