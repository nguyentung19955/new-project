#!/usr/bin/env python3
"""TURRET MERGE — hình BIẾN THỂ ĐẶC BIỆT của ụ (11/11; ảnh người dùng gen bằng ChatGPT, nền magenta).

Nguồn: docs/demo-hop-tuong/thap-art/raw_bienthe2_vughep_loren.png (1536×1024, 1 hàng × 3):
  (1) Merge King VÀNG  → thap/assets/vughepvang_nong.png — đầu ụ khi T.vang (skills2.js SKILLS.vughep.dauAnh). Cùng khung 294 px, cùng hệ số cỡ
      và cùng chân vương miện với vughep_nong (vương miện thường) → không đổi bố cục; 2 ngôi sao trên đỉnh cao hơn nên thân thu ~90%.
  (2) Twin Anvil dạng SÁT THƯƠNG (2 búa lửa, đe đỏ cam) → loren_nong.png
  (3) Twin Anvil dạng TỐC (2 búa băng, đe xanh)          → lorentoc_nong.png (thay bản lật gương cũ)
      Cả hai vẽ kèm MỘT TẤM NỀN xám góc vàng giống hệt nhau: KHÔNG tách đe khỏi nền — coi tấm nền là bệ riêng của Twin Anvil, vẽ nguyên khối,
      cỡ tấm nền = TAM_NEN ô (nhỉnh hơn bệ loren_de 0,71 ô → che kín bệ cũ, viền bậc loren_vien vẫn lộ quanh). Đầu KHÔNG lắc (skills7.js) để tấm nền nằm yên trên ô.
Mọi ảnh: đầu quay PHẢI như mọi đầu ụ (vẽ với gocDau −π/2 → đứng như ảnh gốc). Không nướng viền màu nhấn (hình đã có quầng riêng; viền bậc của bệ phải thấy rõ).
Chạy: python3 tools/thap-cat-bienthe.py     (KT=thư_mục ảnh kiểm)
"""
import os, importlib.util
import numpy as np
from PIL import Image
from scipy import ndimage as nd

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(GOC, 'docs/demo-hop-tuong/thap-art/raw_bienthe2_vughep_loren.png')
OUT = os.environ.get('OUT', os.path.join(GOC, 'thap/assets'))
spec = importlib.util.spec_from_file_location('umod', os.path.join(GOC, 'tools', 'thap-cat-umod.py'))
U = importlib.util.module_from_spec(spec); spec.loader.exec_module(U)

PX = 300          # Twin Anvil: điểm ảnh / cạnh ô (DAU_VE.loren K = 1, HEAD_K.lorentoc = 1)
TAM_NEN = 0.735   # bề ngang cả khối (tấm nền) / cạnh ô
DAY_NEN = 0.37    # đáy tấm nền dưới tâm ô (ô)


def khung(c):
    ys, xs = np.nonzero(c[..., 3] > 0.02); return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1


def tach3():
    a = np.asarray(Image.open(RAW).convert('RGB'))
    m, _ = U.tach(a); c = U.khoa(a.astype(np.float64) / 255, m)
    lab, n = nd.label(c[..., 3] > 0, structure=np.ones((3, 3)))
    cm = nd.center_of_mass(lab > 0, lab, range(1, n + 1)); W = a.shape[1]; ra = []
    for k in range(3):
        ks = [j for j, (y, x) in enumerate(cm, 1) if int(x // (W / 3)) == k]
        q = c.copy(); q[~np.isin(lab, ks)] = 0; ra.append(q)
    return ra


def dat(c, s, N, cx, cy):
    """c: RGBA float đứng thẳng; s = px đích / px gốc; (cx, cy) = điểm gốc (px gốc) đặt vào TÂM khung N → ảnh N×N quay PHẢI."""
    im = U.anh(c); im = im.convert('RGBa').resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS).convert('RGBA')
    out = Image.new('RGBA', (N, N)); out.alpha_composite(im, (int(round(N / 2 - cx * s)), int(round(N / 2 - cy * s))))
    return out.rotate(-90, Image.BICUBIC)


def main():
    vm, st, toc = tach3(); kt = os.environ.get('KT'); ra = {}
    # (1) vương miện vàng: khớp vương miện thường (đứng thẳng: ngang = trục y ảnh quay phải, cao = trục x)
    cu = Image.open(os.path.join(OUT, 'vughep_nong.png')); N = cu.size[0]; bx0, by0, bx1, by1 = cu.getbbox()
    day_cu, dinh_max = N / 2 - bx0, N - 3 - N / 2          # chân vương miện dưới tâm · đỉnh tối đa trên tâm (px)
    x0, y0, x1, y1 = khung(vm); w, h = x1 - x0, y1 - y0
    day = day_cu + 0.07 * N                                 # chân hạ thêm 7% ô (đè lên nệm bệ) để thân to gần bằng vương miện thường
    s = min((by1 - by0) / w, (day + dinh_max) / h)
    ra['vughepvang_nong'] = dat(vm, s, N, (x0 + x1) / 2, y1 - day / s)
    print('vughepvang: tỉ lệ %.3f · ngang %.0f px (thường %d) · cao %.0f px (thường %d)' % (s, w * s, by1 - by0, h * s, bx1 - bx0))
    # (2)(3) Twin Anvil nguyên khối
    for ten, c in (('loren_nong', st), ('lorentoc_nong', toc)):
        x0, y0, x1, y1 = khung(c); s = TAM_NEN * PX / (x1 - x0)
        ra[ten] = dat(c, s, PX, (x0 + x1) / 2, y1 - DAY_NEN * PX / s)
        print(ten, 'tỉ lệ %.3f · khung' % s, ra[ten].getbbox())
    for ten, im in ra.items():
        im.save(os.path.join(OUT, ten + '.png'), optimize=True)
        if kt:
            os.makedirs(kt, exist_ok=True); n = im.size[0]; nen = Image.new('RGBA', (n * 2, n), (20, 24, 48, 255)); nen.paste((40, 230, 60, 255), (n, 0, n * 2, n))
            up = im.rotate(90); nen.alpha_composite(up, (0, 0)); nen.alpha_composite(up, (n, 0)); nen.convert('RGB').save(os.path.join(kt, ten + '.png'))


if __name__ == '__main__':
    main()
