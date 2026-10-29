#!/usr/bin/env python3
"""PH15 bước 1 mục 5 – ẢNH CẶP CHẠY để gen hình nối (chạy 12 hình).

    python3 art/huong-moi/lam-tu-the-2/code/cap_chay_noi.py

Đo "độ nhảy hình" giữa từng cặp tư thế chạy KỀ NHAU trong vòng (R1→R2 … R8→R1), trên sheet chạy ĐANG DÙNG trong game (lam-moi3-chay, đúng neo game:
mỗi ô vẽ tại chân, không căn giữa lại). Ba số, đều ở px logic (Lam cao ~112):
    mat      – mắt dời bao nhiêu (căn(dx² + dy²)) – đầu nhảy
    dinh_mu  – đỉnh mũ lên / xuống
    khac_hinh – 1 − IoU hai bóng (cùng neo) × 100 – toàn thân đổi bao nhiêu (áo, chân, dao)
Điểm = mat / trung vị(mat) + khac_hinh / trung vị(khac_hinh) (+ dinh_mu / trung vị nếu > 0). Chọn 4 cặp điểm cao nhất (PH15 gợi ý R2→R3, R4→R5, R6→R7,
R8→R1 – nếu đo thấy cặp khác lớn hơn thì theo số đo).
Ra: kiem/cap-chay-noi.png – 4 hàng, mỗi hàng một cặp (trái = tư thế trước, phải = tư thế sau), NỀN TRẮNG, đúng hình sheet 3x (không hộp, không chữ
trong hình; chỉ số thứ tự nhỏ ở mép trái ngoài hình), cùng thang + cùng đường đất giữa mọi ô; kiem/cap-chay-noi.json – số đo mọi cặp + cặp đã chọn."""
import json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__)); GOC = os.path.normpath(os.path.join(HERE, '..'))
SP, KI = os.path.join(GOC, 'sprite'), os.path.join(GOC, 'kiem')


def main():
    m3 = json.load(open(os.path.join(SP, 'lam-moi3-chay-3x.json'), encoding='utf-8')); sh = Image.open(os.path.join(SP, m3['anh'])).convert('RGBA')
    b = m3['ty_le']['px_nguon_moi_px_logic']; ax, ay = m3['diem_neo']['x'], m3['diem_neo']['y']
    F = [sh.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])) for f in m3['frames']]; nh = m3['tu_the']; so = m3['so_do']
    A = [np.asarray(f)[..., 3] > 100 for f in F]
    def dinh(a): ys = np.nonzero(a.any(1))[0]; return (ys.min() - ay) / b
    cap = []
    for i in range(8):
        j = (i + 1) % 8; ma, mb = so[i]['mat_logic'], so[j]['mat_logic']
        mat = float(np.hypot(mb[0] - ma[0], mb[1] - ma[1])) if ma and mb else 0.0
        iou = float((A[i] & A[j]).sum() / max(1, (A[i] | A[j]).sum()))
        cap.append({'cap': '%s→%s' % (nh[i], nh[j]), 'i': i, 'j': j, 'mat': round(mat, 2), 'dinh_mu': round(float(abs(dinh(A[j]) - dinh(A[i]))), 2), 'khac_hinh': round((1 - iou) * 100, 1)})
    md = {k: float(np.median([c[k] for c in cap])) or 1.0 for k in ('mat', 'dinh_mu', 'khac_hinh')}
    for c in cap: c['diem'] = round(float(c['mat'] / md['mat'] + c['khac_hinh'] / md['khac_hinh'] + c['dinh_mu'] / md['dinh_mu']), 2)
    chon = sorted(sorted(cap, key=lambda c: -c['diem'])[:4], key=lambda c: c['i'])
    # ảnh: mỗi hàng 2 ô, cùng neo (chân) – trắng
    L = max(ax for _ in F); fw, fh = F[0].size; LE = 46; K = 24
    o = Image.new('RGB', (LE + 2 * fw + K * 3, 4 * fh + K * 5), (255, 255, 255)); d = ImageDraw.Draw(o)
    try: ft = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
    except Exception: ft = ImageFont.load_default()
    for r, c in enumerate(chon):
        y = K + r * (fh + K)
        for k, idx in enumerate((c['i'], c['j'])):
            x = LE + K + k * (fw + K); o.paste(F[idx], (x, y), F[idx])
        d.text((10, y + fh // 2 - 10), str(r + 1), font=ft, fill=(150, 150, 150))
    o.save(os.path.join(KI, 'cap-chay-noi.png'))
    json.dump({'ghi_chu': 'PH15 mục 2 "CHẠY 12 HÌNH": 4 cặp tư thế kề nhau nhảy hình lớn nhất (đo trên sheet đang dùng, cùng neo game). Hàng ảnh 1–4 = "chon" theo thứ tự. '
               'mat = mắt dời (px logic), dinh_mu = đỉnh mũ lên/xuống, khac_hinh = (1 − IoU bóng) × 100, diem = tổng chuẩn hoá theo trung vị.',
               'sheet': 'sprite/' + m3['anh'], 'moi_cap': cap, 'chon': [c['cap'] for c in chon], 'ph15_goi_y': ['R2→R3', 'R4→R5', 'R6→R7', 'R8→R1']},
              open(os.path.join(KI, 'cap-chay-noi.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for c in cap: print(c)
    print('chọn:', [c['cap'] for c in chon], '→', os.path.join(KI, 'cap-chay-noi.png'), o.size)


if __name__ == '__main__':
    main()
