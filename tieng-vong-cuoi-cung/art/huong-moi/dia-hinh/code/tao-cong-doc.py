#!/usr/bin/env python3
"""Dựng CỔNG DỌC (29/10) từ ảnh gen art/huong-moi/nguon/dia-hinh/cong-doc-2o.png (ô trái: ĐÓNG – rễ đan + khoá chuông; ô phải: MỞ – lối tối).
Ra: art/the-gioi-moi/dia-hinh-v4/cong-doc-3x.png + cong-doc.json (cạnh dia-hinh-v4.json → TT.nap tự nạp; thiếu → cổng rễ cũ) + xem thử.

    python3 art/huong-moi/dia-hinh/code/tao-cong-doc.py

LUẬT: collider cổng KHÔNG đổi (hộp chặn 183 × 159 logic neo giữa đáy, đi xuyên khi mở > 60 %). Ảnh cổng dọc hẹp (rộng : cao ≈ 1 : 2,8) nên
một cánh không phủ được bề ngang hộp chặn → ghép 3 khối DỌC đứng sát nhau, cùng đáy = sàn:
    giữa  = cổng dọc gen (khoá chuông), cao CAO_GIUA logic (cao hơn hộp chặn – phần trên chui vào chân cột đất treo phía trên)
    2 bên = cùng ảnh rễ đan, ĐÃ XOÁ khoá chuông (vá bằng cv2.inpaint), cao 90 %, tối hơn 12 % (lùi sau) – để hai bên hộp chặn không thành
            "tường vô hình" (ảnh phủ đủ 183 px bề ngang)
    MỞ    = ô phải (khung rễ + lối tối) chỉ ở giữa; 2 khối bên rút xuống đất khi mở (code trong runtime/trang-tri-dia-hinh.js, veCongDoc).
Tách nền: như art/huong-moi/lam-tu-the-2/code/tach.py (nền trắng nối mép, khử quầng). Ảnh 3x (px = logic × 3), vẽ thu ở màn 2x."""
import json, os, sys
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
ART = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(ART, 'huong-moi', 'lam-tu-the-2', 'code'))
from tach import tach_anh, cat_o

SRC = os.path.join(ART, 'huong-moi', 'nguon', 'dia-hinh', 'cong-doc-2o.png')
RA = os.path.join(ART, 'the-gioi-moi', 'dia-hinh-v4')
XEM = os.path.join(ART, 'the-gioi-moi', 'dia-hinh-v4', 'xem-thu')
B = 3                 # px ảnh / px logic
CAO_GIUA = 208        # logic: cao khối giữa (hộp chặn cao 159)
K_BEN = 0.90          # khối bên cao 90 % khối giữa
CHONG = 10            # logic: khối bên chồng dưới mép khối giữa
HOP = (-89, -159, 183, 159)


def thu(rgba, k):
    a = rgba.astype(np.float32) / 255; pm = a.copy(); pm[..., :3] *= a[..., 3:4]
    w, h = max(1, round(rgba.shape[1] * k)), max(1, round(rgba.shape[0] * k))
    r = cv2.resize(pm, (w, h), interpolation=cv2.INTER_AREA)
    al = np.clip(r[..., 3:4], 0, 1); rgb = np.where(al > 1e-4, r[..., :3] / np.maximum(al, 1e-4), 0)
    o = (np.dstack([rgb, al]).clip(0, 1) * 255).round().astype(np.uint8); o[o[..., 3] == 0, :3] = 0
    return o


def main():
    rgba = tach_anh(SRC)
    (x0, y0, x1, y1, m0), (u0, v0, u1, v1, m1) = cat_o(rgba, 2, 1)
    dong = rgba[y0:y1, x0:x1].copy(); dong[~m0[y0:y1, x0:x1]] = 0
    mo = rgba[v0:v1, u0:u1].copy(); mo[~m1[v0:v1, u0:u1]] = 0
    # khoá chuông: cụm đồng giữa cánh đóng (đồng: R > 60, G − B > 25, R − B > 45 – rễ G − B ≈ 13, ở 1/3 giữa bề ngang, nửa giữa chiều cao)
    h, w = dong.shape[:2]; r, g, b = [dong[..., i].astype(int) for i in range(3)]
    dg = (r > 60) & (g - b > 25) & (r - b > 45) & (dong[..., 3] > 200); vung = np.zeros_like(dg); vung[int(h * .35):int(h * .65), int(w * .3):int(w * .7)] = True
    lab, n = ndi.label(ndi.binary_closing(dg & vung, iterations=3)); co = ndi.sum(dg & vung, lab, range(1, n + 1))
    khoa = lab == (int(np.argmax(co)) + 1)
    ys, xs = np.nonzero(khoa); kx, ky = float(xs.mean()), float(ys.mean())
    # cả móc treo khoá (dây đồng phía trên khoá) – mở rộng vùng vá lên trên một chút
    va = ndi.binary_dilation(khoa, iterations=9); va[max(0, ys.min() - 40):ys.min(), max(0, int(kx) - 14):int(kx) + 14] = True
    ben = dong.copy()
    bgr = cv2.cvtColor(ben[..., :3], cv2.COLOR_RGB2BGR)
    bgr = cv2.inpaint(bgr, va.astype(np.uint8) * 255, 9, cv2.INPAINT_TELEA)
    ben[..., :3] = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB); ben[va, 3] = np.maximum(ben[va, 3], dong[va, 3])
    ben[..., :3] = (ben[..., :3].astype(np.float32) * 0.88).astype(np.uint8)
    k = CAO_GIUA * B / h                     # px gen → px ảnh 3x
    G = thu(dong, k); O = thu(mo, CAO_GIUA * B / (v1 - v0)); BE = thu(ben, k * K_BEN)
    # atlas: [đóng giữa][mở giữa][bên]
    W = G.shape[1] + O.shape[1] + BE.shape[1] + 8; H = max(G.shape[0], O.shape[0], BE.shape[0])
    at = np.zeros((H, W, 4), np.uint8); xs_ = [0, G.shape[1] + 4, G.shape[1] + O.shape[1] + 8]
    for im, x in zip((G, O, BE), xs_): at[:im.shape[0], x:x + im.shape[1]] = im
    Image.fromarray(at).save(os.path.join(RA, 'cong-doc-3x.png'), optimize=True)
    o = lambda im, x: {'khung': [x, 0, im.shape[1], im.shape[0]], 'w': round(im.shape[1] / B, 2), 'h': round(im.shape[0] / B, 2)}   # neo = giữa đáy
    meta = {'ten': 'Cổng dọc (29/10) – ảnh gen cong-doc-2o.png; neo giữa đáy = tâm cổng trên sàn', 'anh': 'cong-doc-3x.png', 'boi': B, 'co_anh': [W, H],
            'o': {'dong': o(G, xs_[0]), 'mo': o(O, xs_[1]), 'ben': o(BE, xs_[2])},
            'khoa': {'x': round((kx * k) / B - G.shape[1] / B / 2, 1), 'y': round((ky * k) / B - G.shape[0] / B, 1), 'r': round(float(np.sqrt(khoa.sum() / np.pi)) * k / B, 1),
                     'y_nghia': 'tâm khoá chuông so với giữa đáy cánh giữa (logic) – đèn báo (lvl) loé ở đây'},
            'xep': {'chong': CHONG, 'k_ben': K_BEN, 'cao_giua': CAO_GIUA,
                    'ghi_chu': 'khối bên trái: mép phải chồng CHONG px dưới mép trái khối giữa; bên phải lật ngang, đối xứng'},
            'hop_chan': {'x': HOP[0], 'y': HOP[1], 'w': HOP[2], 'h': HOP[3], 'ghi_chu': 'KHÔNG đổi – game giữ (GATE); chỉ ghi để kiểm hình phủ'}}
    wg, wb = G.shape[1] / B, BE.shape[1] / B; tong = wg + 2 * (wb - CHONG)
    meta['xep']['be_ngang_logic'] = round(tong, 1)
    json.dump(meta, open(os.path.join(RA, 'cong-doc.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('cổng dọc: giữa %.0f×%.0f, bên %.0f×%.0f, bề ngang ghép %.1f (hộp chặn %d), khoá %s' % (wg, G.shape[0] / B, wb, BE.shape[0] / B, tong, HOP[2], meta['khoa']))
    # xem thử: đóng / mở ở 3x với hộp chặn
    os.makedirs(XEM, exist_ok=True)
    for ten, mo_ in (('dong', False), ('mo', True)):
        c = Image.new('RGBA', (int(260 * B), int(240 * B)), (30, 34, 40, 255)); cx, cy = 130 * B, 225 * B
        if not mo_:
            bi = Image.fromarray(BE); c.alpha_composite(bi, (int(cx - wg * B / 2 + CHONG * B - BE.shape[1]), int(cy - BE.shape[0])))
            c.alpha_composite(bi.transpose(Image.FLIP_LEFT_RIGHT), (int(cx + wg * B / 2 - CHONG * B), int(cy - BE.shape[0])))
            c.alpha_composite(Image.fromarray(G), (int(cx - G.shape[1] / 2), int(cy - G.shape[0])))
        else: c.alpha_composite(Image.fromarray(O), (int(cx - O.shape[1] / 2), int(cy - O.shape[0])))
        d = ImageDraw.Draw(c); d.rectangle([cx + HOP[0] * B, cy + HOP[1] * B, cx + (HOP[0] + HOP[2]) * B, cy], outline=(255, 210, 90), width=3)
        d.line([0, cy, c.width, cy], fill=(200, 60, 60), width=2)
        c.convert('RGB').save(os.path.join(XEM, 'cong-doc-%s-3x.png' % ten))


if __name__ == '__main__':
    main()
