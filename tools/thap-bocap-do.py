#!/usr/bin/env python3
"""TURRET MERGE — Crimson Sting (bocap) lên bậc ĐỎ (11/11): đổi BỆ sang bệ Đỏ có sẵn + chuyển tông thân bọ cạp tím-chàm → ĐỎ THẪM.

KHÔNG vẽ mới: chỉ xử lý màu trên ảnh đã có (HSV có mặt nạ theo hue). Nguồn = ảnh gốc trong git (GOC_REF, mặc định 5c4c610e7 — bản Vàng) → chạy lại được.
  · Bệ: chép bệ Đỏ của Black Hole (blackhole_de / blackhole_vien — tròn đỏ thẫm, 4 mũi pha lê đỏ) + DE_RIENG.bocap = DE_RIENG.blackhole.
  · Thân: điểm ảnh hue 200–325° (chàm / tím / tím-hồng) → hue 356° (đỏ), bão hoà ×1,15, sáng ×0,82 (đỏ thẫm, phần tối thành đen-đỏ).
    Viền vàng (hue 25–60°) giữ; ngòi + mắt hồng ngọc (hue 335–15°) giữ nguyên rồi sáng ×1,12 → sáng hơn thân, vẫn nổi.
  · Ghi: bocap_nong, bocap_nong_s1..s3, bocap_de, bocap_vien, nho/bocap (bệ Đỏ + đầu đỏ dạng 1). Huy hiệu bocap_phu, glyph, phi công: giữ.
Chạy: python3 tools/thap-bocap-do.py      (OUT=thư_mục ghi chỗ khác · KHONG_JS=1 không sửa artscale.js)
"""
import os, io, re, json, shutil, subprocess, importlib.util
import numpy as np
from PIL import Image

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('OUT', os.path.join(GOC, 'thap/assets'))
SRC = os.path.join(GOC, 'thap/assets')
JS = os.path.join(GOC, 'thap/js/artscale.js')
REF = os.environ.get('GOC_REF', '5c4c610e7')
BE = 'blackhole'
spec = importlib.util.spec_from_file_location('umod', os.path.join(GOC, 'tools', 'thap-cat-umod.py'))
U = importlib.util.module_from_spec(spec); spec.loader.exec_module(U)


def doc_git(path):
    b = subprocess.run(['git', '-C', GOC, 'show', '%s:%s' % (REF, path)], capture_output=True, check=True).stdout
    return Image.open(io.BytesIO(b)).convert('RGBA')


def do_tham(im):
    a = np.asarray(im).astype(np.float64) / 255; f = a[..., :3]
    mx, mn = f.max(-1), f.min(-1); d = mx - mn; r, g, b = f[..., 0], f[..., 1], f[..., 2]
    h = np.where(mx == r, ((g - b) / np.maximum(d, 1e-6)) % 6, np.where(mx == g, (b - r) / np.maximum(d, 1e-6) + 2, (r - g) / np.maximum(d, 1e-6) + 4)) * 60
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0); v = mx
    w = np.clip((h - 200) / 15, 0, 1) * np.clip((325 - h) / 10, 0, 1) * np.clip(s / 0.12, 0, 1)   # mức "chàm / tím" (mép dải mềm; xám không màu giữ)
    ruby = ((h >= 335) | (h <= 15)) & (s > 0.5) & (v > 0.45)
    ns = np.clip(s * 1.15 + 0.1 * w, 0, 1); nv = v * 0.82
    c = nv * ns; x = c * (1 - np.abs((356 / 60) % 2 - 1)); m = nv - c                              # hue 356° → (c, 0, x) + m
    moi = np.stack([c + m, m, x + m], -1)
    out = f * (1 - w[..., None]) + moi * w[..., None]
    out = np.where(ruby[..., None], np.clip(out * 1.12, 0, 1), out)
    a[..., :3] = out
    return Image.fromarray((a * 255).round().astype(np.uint8), 'RGBA')


def main():
    os.makedirs(os.path.join(OUT, 'nho'), exist_ok=True)
    dau = {}
    for n in ('bocap_nong', 'bocap_nong_s1', 'bocap_nong_s2', 'bocap_nong_s3'):
        dau[n] = do_tham(doc_git('thap/assets/%s.png' % n)); dau[n].save(os.path.join(OUT, n + '.png'), optimize=True)
    for k in ('_de', '_vien'): shutil.copyfile(os.path.join(SRC, BE + k + '.png'), os.path.join(OUT, 'bocap' + k + '.png'))
    t = open(JS, encoding='utf-8').read(); DE = U.js_obj(t, 'DE_RIENG'); DE['bocap'] = DE[BE]
    # icon thẻ: bệ Đỏ + đầu dạng 1 (khung 1 ô, quay PHẢI → dựng đứng), phần hình 88% của 192 px
    N = 384; o = N / 1.2; ic = Image.new('RGBA', (N, N))
    de = Image.open(os.path.join(OUT, 'bocap_de.png')).convert('RGBA'); b = int(round(o * U.SB_C0 * DE['bocap']))
    ic.alpha_composite(de.convert('RGBa').resize((b, b), Image.LANCZOS).convert('RGBA'), ((N - b) // 2, (N - b) // 2))
    d = int(round(o)); hd = dau['bocap_nong_s1'].convert('RGBa').resize((d, d), Image.LANCZOS).convert('RGBA').rotate(90, Image.BICUBIC)
    ic.alpha_composite(hd, ((N - d) // 2, (N - d) // 2))
    cr = ic.crop(ic.getbbox()); s2 = 0.88 * 192 / max(cr.size)
    cr = cr.convert('RGBa').resize((max(1, round(cr.width * s2)), max(1, round(cr.height * s2))), Image.LANCZOS).convert('RGBA')
    ic = Image.new('RGBA', (192, 192)); ic.alpha_composite(cr, ((192 - cr.width) // 2, (192 - cr.height) // 2)); ic.save(os.path.join(OUT, 'nho', 'bocap.png'), optimize=True)
    if not os.environ.get('KHONG_JS'): open(JS, 'w', encoding='utf-8').write(U.js_set(t, 'DE_RIENG', DE))


if __name__ == '__main__':
    main()
