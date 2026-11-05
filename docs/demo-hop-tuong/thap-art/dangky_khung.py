#!/usr/bin/env python3
"""Đăng ký (register) khung quái/trùm theo THÂN: mọi khung cùng tâm, cùng cỡ thân.

Dải ngang N khung vuông (quai_<id>.png 4 khung, quai_<id>_8.png 8 khung, trum_<id>.png).
Mỗi khung: lấy mặt nạ alpha, ăn mòn (erode) để bỏ chân/cánh mảnh → "lõi thân",
chọn thành phần liên thông lớn nhất, tính tâm có trọng số alpha + diện tích lõi.
Sau đó dịch khung sao cho tâm lõi trùng tâm trung bình các khung, và co giãn đều (đồng nhất x/y) để
diện tích lõi bằng trung vị các khung → thân không phình/xẹp, không trôi.

Dùng một lần:  python3 dangky_khung.py thap/assets/quai_bo.png [...]
Bản gốc được chép vào docs/demo-hop-tuong/thap-art/goc_truoc_dangky/ trước khi ghi đè.
Tuỳ chọn --chi-tam: chỉ canh tâm, không co giãn. --bo-khung 3: khung không dùng để tính
trung vị cỡ (vd khung tung chiêu của trùm có hiệu ứng lớn) — dịch theo tâm trung bình, giữ cỡ.
"""
import sys, os, shutil, argparse
import numpy as np
from PIL import Image
from scipy import ndimage

GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'goc_truoc_dangky')


def loi_than(a, an_mon):
    m = a > 0.35
    if an_mon > 0:
        m2 = ndimage.binary_erosion(m, iterations=an_mon)
        if m2.sum() > m.sum() * 0.15: m = m2
    lab, n = ndimage.label(m)
    if n == 0: return None
    sz = ndimage.sum(m, lab, range(1, n + 1))
    k = int(np.argmax(sz)) + 1
    core = lab == k
    w = a * core
    tot = w.sum()
    ys, xs = np.indices(a.shape)
    return (xs * w).sum() / tot, (ys * w).sum() / tot, core.sum()


def xu_ly(path, chi_tam=False, bo=(), an_mon=None, gioi_han=0.12):
    im = Image.open(path).convert('RGBA')
    H = im.height; n = max(1, round(im.width / H)); fw = im.width // n
    an_mon = an_mon if an_mon is not None else max(2, fw // 24)
    khung = [im.crop((i * fw, 0, (i + 1) * fw, H)) for i in range(n)]
    info = []
    for k in khung:
        a = np.asarray(k, dtype=np.float32)[..., 3] / 255.0
        info.append(loi_than(a, an_mon))
    dt = [inf[2] for i, inf in enumerate(info) if inf and i not in bo]
    chuan = float(np.median(dt)) if dt else None
    out = Image.new('RGBA', im.size, (0, 0, 0, 0))
    bao = []
    ds = [inf for i, inf in enumerate(info) if inf and i not in bo]
    tb = (float(np.mean([d[0] for d in ds])), float(np.mean([d[1] for d in ds]))) if ds else (fw / 2, H / 2)
    for i, (k, inf) in enumerate(zip(khung, info)):
        if not inf: out.alpha_composite(k, (i * fw, 0)); continue
        cx, cy, ar = inf
        if i in bo: cx, cy, ar = tb[0], tb[1], chuan  # khung bị loại (hiệu ứng lớn): dịch như trung bình, giữ cỡ
        s = 1.0 if (chi_tam or chuan is None or i in bo) else float(np.sqrt(chuan / ar))
        s = float(np.clip(s, 1 - gioi_han, 1 + gioi_han))
        # biến đổi affine: điểm đích (u,v) → nguồn ((u-c)/s + cx)
        # đích = tâm TRUNG BÌNH các khung (không kéo hình lệch khỏi ô → không cắt mép thêm)
        u, v = tb
        k2 = k.transform((fw, H), Image.AFFINE, (1 / s, 0, cx - u / s, 0, 1 / s, cy - v / s), resample=Image.BICUBIC)
        out.alpha_composite(k2, (i * fw, 0))
        bao.append('k%d lệch(%.1f,%.1f) cỡ×%.3f' % (i, cx - u, cy - v, s))
    return out, bao


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('files', nargs='+')
    ap.add_argument('--chi-tam', action='store_true')
    ap.add_argument('--bo-khung', type=int, nargs='*', default=[])
    a = ap.parse_args()
    os.makedirs(GOC, exist_ok=True)
    for f in a.files:
        dich = os.path.join(GOC, os.path.basename(f))
        if not os.path.exists(dich): shutil.copy2(f, dich)  # giữ bản gốc lần đầu
        out, bao = xu_ly(dich, a.chi_tam, set(a.bo_khung))  # luôn xử lý TỪ bản gốc (chạy lại không cộng dồn)
        out.save(f, optimize=True)
        print(os.path.basename(f), ' | '.join(bao))


if __name__ == '__main__':
    main()
