#!/usr/bin/env python3
# Ghép bảng + chấm điểm (hình bóng = PHẦN ĐẦU, đã trừ bệ chung lấy trung vị 93 ụ)
# DỄ NHẦM cho tools/thap-kt-nhandien.js
#  Vào: <OUT>/o/<id>.png (ụ vẽ bằng REN.veU, cỡ điểm ảnh thật iPhone DPR 3) + <OUT>/meta.json
#  Ra:  BANG-MAU.png (màu) · BANG-XAM.png (xám) · BANG-NHO.png (xám thu về cỡ CSS 1× — nhìn như mắt ở khoảng cách tay cầm)
#       CAP-DE-NHAM.png (30 cặp giống nhau nhất, đặt cạnh nhau) · cap.json · KET-QUA.md
#  Điểm giống (0–1) = 0.45 × IoU hình bóng phần đầu (khác bệ chung) + 0.55 × tương quan ảnh xám đã làm mờ ở 20 px
#  → mô phỏng "nhìn 1 giây ở cỡ thật, không màu". Chỉ là chỉ báo để chọn ụ ưu tiên vẽ lại, KHÔNG thay test người thật.
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = sys.argv[1]
meta = [m for m in json.load(open(os.path.join(OUT, 'meta.json'), encoding='utf-8')) if not m.get('loi')]
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed.ttf'
MAU_BAC = {'trang': (200, 200, 200), 'xanh': (80, 150, 255), 'tim': (190, 110, 255), 'vang': (255, 200, 60), 'do': (255, 80, 80)}
NEN = (58, 62, 70)  # nền xám đậm gần màu ô trên bàn


def nap(id_):
    return Image.open(os.path.join(OUT, 'o', id_ + '.png')).convert('RGBA')


def tren_nen(im, nen=NEN):
    bg = Image.new('RGBA', im.size, nen + (255,))
    bg.alpha_composite(im)
    return bg.convert('RGB')


def xam(im):
    return tren_nen(im).convert('L').convert('RGB')


def font(n):
    return ImageFont.truetype(FONT, n)


def bang(ten_file, bien, co_o, cot=10, chu=14):
    n = len(meta)
    hang = (n + cot - 1) // cot
    pad, nhan = 6, chu * 2 + 6
    W, H = cot * (co_o + pad) + pad, hang * (co_o + nhan + pad) + pad
    img = Image.new('RGB', (W, H), (30, 32, 36))
    d = ImageDraw.Draw(img)
    f = font(chu)
    for i, m in enumerate(meta):
        x = pad + (i % cot) * (co_o + pad)
        y = pad + (i // cot) * (co_o + nhan + pad)
        o = bien(nap(m['id'])).resize((co_o, co_o), Image.LANCZOS)
        img.paste(o, (x, y))
        d.rectangle([x, y + co_o, x + co_o, y + co_o + 3], fill=MAU_BAC.get(m.get('bac'), (120, 120, 120)))
        d.text((x + 2, y + co_o + 4), f"{i + 1:02d} {m['ten']}"[:22], font=f, fill=(235, 235, 235))
        d.text((x + 2, y + co_o + 4 + chu), m['id'][:22], font=f, fill=(150, 155, 165))
    img.save(os.path.join(OUT, ten_file), optimize=True)


TRUNG_VI = None  # ảnh trung vị của cả 93 ụ ≈ BỆ CHUNG → so riêng PHẦN ĐẦU (chỗ khác bệ)


def trung_vi():
    global TRUNG_VI
    if TRUNG_VI is None:
        st = np.stack([np.asarray(tren_nen(nap(m['id'])).resize((64, 64), Image.LANCZOS), dtype=np.float32) for m in meta])
        TRUNG_VI = np.median(st, axis=0)
    return TRUNG_VI


def dac_trung(id_):
    im = nap(id_)
    rgb = np.asarray(tren_nen(im).resize((64, 64), Image.LANCZOS), dtype=np.float32)
    khac = np.abs(rgb - trung_vi()).max(axis=2)  # phần đầu = chỗ khác bệ chung > 40/255
    a = np.asarray(Image.fromarray((khac > 40).astype(np.uint8) * 255).resize((32, 32), Image.BILINEAR), dtype=np.float32) / 255
    g = xam(im).convert('L').resize((20, 20), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
    g = np.asarray(g, dtype=np.float32).ravel()
    g = (g - g.mean()) / (g.std() + 1e-6)
    return a > 0.5, g


def main():
    css = meta[0]['cssPx']
    N = meta[0]['N']
    # 1) bảng màu / xám ở cỡ điểm ảnh thật (≈ cỡ ô trên iPhone, DPR 3) — co_o = cỡ ô CSS × 3
    co3 = int(round(css * 3))
    bang('BANG-MAU.png', tren_nen, co3)
    bang('BANG-XAM.png', xam, co3)
    # 2) bảng xám cỡ 1× CSS (như nhìn màn hình thường / khoảng cách xa) — rồi phóng ×3 kiểu ô vuông để soi
    def nho(im):
        g = xam(im).resize((int(round(css)), int(round(css))), Image.LANCZOS)
        return g.resize((co3, co3), Image.NEAREST)
    bang('BANG-NHO.png', nho, co3)

    # 3) điểm giống
    ft = {m['id']: dac_trung(m['id']) for m in meta}
    ids = [m['id'] for m in meta]
    by = {m['id']: m for m in meta}
    caps = []
    for i in range(len(ids)):
        for j in range(i + 1, len(ids)):
            ma, ga = ft[ids[i]]
            mb, gb = ft[ids[j]]
            iou = (ma & mb).sum() / max(1, (ma | mb).sum())
            corr = float(np.dot(ga, gb) / len(ga))
            s = 0.45 * iou + 0.55 * max(0.0, corr)
            caps.append({'a': ids[i], 'b': ids[j], 'diem': round(float(s), 3), 'iou': round(float(iou), 3), 'xam': round(corr, 3)})
    caps.sort(key=lambda c: -c['diem'])
    json.dump(caps[:200], open(os.path.join(OUT, 'cap.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    # gần nhất của từng ụ
    gan = {}
    for c in caps:
        for x, y in ((c['a'], c['b']), (c['b'], c['a'])):
            if x not in gan:
                gan[x] = (y, c['diem'])
    iou_tb = float(np.mean([c['iou'] for c in caps]))

    # 4) tấm 30 cặp giống nhất (xám, cỡ thật)
    top = caps[:30]
    co = co3
    f = font(13)
    W = 3 * (2 * co + 24) + 20
    H = 10 * (co + 40) + 20
    img = Image.new('RGB', (W, H), (30, 32, 36))
    d = ImageDraw.Draw(img)
    for k, c in enumerate(top):
        x = 10 + (k % 3) * (2 * co + 24)
        y = 10 + (k // 3) * (co + 40)
        img.paste(xam(nap(c['a'])).resize((co, co), Image.LANCZOS), (x, y))
        img.paste(xam(nap(c['b'])).resize((co, co), Image.LANCZOS), (x + co + 4, y))
        d.text((x, y + co + 2), f"#{k + 1} {by[c['a']]['ten']} ↔ {by[c['b']]['ten']}"[:40], font=f, fill=(235, 235, 235))
        d.text((x, y + co + 18), f"điểm {c['diem']:.2f} · bóng {c['iou']:.2f} · xám {c['xam']:.2f}", font=f, fill=(150, 155, 165))
    img.save(os.path.join(OUT, 'CAP-DE-NHAM.png'), optimize=True)

    # 5) báo cáo ngắn
    L = []
    L.append('# Kiểm nhận diện silhouette 93 ụ — kết quả máy đo\n')
    L.append(f'Sinh bởi `tools/thap-kt-nhandien.js` (iPhone 13, 390×844, DPR 3). Ô thật = **{css} px CSS** = {co3} px điểm ảnh. '
             f'Mỗi ụ vẽ bằng `REN.veU` của game, 1★, không huy hiệu / sao / hiệu ứng, nòng hướng lên.\n')
    L.append('Điểm giống = 0.45 × IoU hình bóng PHẦN ĐẦU (đã trừ bệ chung) + 0.55 × tương quan ảnh xám mờ 20 px. Đây là chỉ báo để **chọn ụ ưu tiên vẽ lại**, không thay bài test 1 giây với người thật.\n')
    L.append(f'- Số ụ: {len(meta)} · IoU hình bóng trung bình mọi cặp: **{iou_tb:.2f}** (1.0 = cùng hình bóng)\n')
    nguong = 0.80
    L.append(f'- Cặp điểm ≥ {nguong}: **{sum(c["diem"] >= nguong for c in caps)}** · ≥ 0.70: {sum(c["diem"] >= 0.70 for c in caps)}\n')
    L.append('\n## 30 cặp dễ nhầm nhất\n\n| # | Ụ A | Ụ B | Điểm | Bóng (IoU) | Xám |\n|---|---|---|---|---|---|\n')
    for k, c in enumerate(top):
        L.append(f"| {k + 1} | {by[c['a']]['ten']} (`{c['a']}`) | {by[c['b']]['ten']} (`{c['b']}`) | {c['diem']:.2f} | {c['iou']:.2f} | {c['xam']:.2f} |\n")
    # ụ "mất bản sắc": gần nhất rất giống
    xau = sorted(((i, gan[i][0], gan[i][1]) for i in ids), key=lambda t: -t[2])
    L.append('\n## Ụ có "người giống nhất" sát nhất (ưu tiên đổi silhouette)\n\n| Ụ | Bậc | Giống nhất với | Điểm |\n|---|---|---|---|\n')
    for i, j, s in xau[:25]:
        L.append(f"| {by[i]['ten']} (`{i}`) | {by[i].get('bac', '')} | {by[j]['ten']} | {s:.2f} |\n")
    L.append('\n## Ảnh để xem\n\n- `BANG-MAU.png` — 93 ụ màu, cỡ thật\n- `BANG-XAM.png` — 93 ụ xám (bỏ màu)\n- `BANG-NHO.png` — xám ở độ phân giải 1× (mô phỏng nhìn lướt)\n- `CAP-DE-NHAM.png` — 30 cặp giống nhất đặt cạnh nhau\n')
    open(os.path.join(OUT, 'KET-QUA.md'), 'w', encoding='utf-8').write(''.join(L))
    print(f'bảng: {len(meta)} ụ · ô {css}px CSS ({co3}px) · IoU tb {iou_tb:.2f} · cặp ≥0.80: {sum(c["diem"] >= 0.80 for c in caps)} · top: '
          + ', '.join(f"{c['a']}~{c['b']} {c['diem']:.2f}" for c in top[:5]))


main()
