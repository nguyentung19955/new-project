#!/usr/bin/env python3
"""TURRET MERGE — NHẬN DIỆN Ụ ANIME Ở CỠ Ô THẬT (claude/demo-hop-tuong, 10/11).

Vấn đề (người dùng xem trong trận, iPhone ô ~57×49 px): 57 ụ anime vẽ lại đều là cái bệ khung vàng giống nhau,
đầu ụ (hình đặc trưng) nhỏ, vàng-trên-vàng → không biết ụ nào với ụ nào.

Tool này NƯỚNG SẴN vào ảnh (PIL, không filter/shadowBlur lúc chạy):
  1) ĐẦU <id>_nong(.png, _s1.._s3): đổi phần kim loại VÀNG sang MÀU NHẤN riêng của ụ (theo cơ chế: băng xanh lạnh,
     độc xanh lá, điện vàng chanh, mana teal…) + viền sáng màu nhấn ôm hình bóng đầu; rồi DỜI TÂM ảnh về tâm khối hình
     (đầu xoay quanh chính nó thay vì quanh tâm bệ) → phóng to tới khi bán kính xa nhất = R_MAX ô (như mọi đầu cũ:
     mọi góc xoay vẫn nằm trong ô). Hình đặc trưng chiếm ~80–95% ô thay vì ~1/2 ô lệch lên trên.
  2) BỆ <id>_de.png + icon thẻ nho/<id>.png: kim loại vàng → tông BẬC (Trắng bạc ngọc trai, Xanh sapphire, Tím thạch anh; Vàng giữ) + bệ tối bớt (khung vàng chạm trổ lùi ra sau), viền bậc màu (<id>_vien) giữ → bậc đọc bằng viền.
Số cỡ vẽ ghi thap/js/artscale.js window.DAU_VE = {id: {K, S?}} — CHỈ dùng để VẼ (render.js kDau/dauK khi vẽ);
cỡ LUẬT (REN.coDau → mũi nòng dauNong, đạn) vẫn đọc HEAD_K / STAGE_K cũ → gameplay/tất định không đổi.

Nguồn = ảnh gốc trong git (GOC_REF, mặc định 48d490641 — bộ anime trước khi nướng), không đọc lại ảnh đã nướng → chạy lại được.
Chạy: python3 tools/thap-nhan-dien-u.py [id …]          (không id = cả 57 ụ trong MAU)
      KHONG_JS=1 …   không sửa artscale.js · OUT=thư_mục  ghi ảnh chỗ khác
"""
import os, sys, io, json, re, subprocess, colorsys
import numpy as np
from PIL import Image, ImageFilter

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.environ.get('OUT', os.path.join(GOC, 'thap/assets'))
JS = os.path.join(GOC, 'thap/js/artscale.js')
REF = os.environ.get('GOC_REF', '48d490641')
# ụ cắt lại SAU 48d490641 (ảnh anime mới): đọc ảnh gốc chưa nướng + HEAD_K từ commit cắt của nó
REF_RIENG = {'xaotron': 'aef60ba1d', **{i: '708d42e8f' for i in ('min', 'taylo', 'baotuyet', 'kepha', 'hutmana')}}   # 10/11: Máy Xáo Trộn — khối rune 4 ô + 2 mũi tên đổi chỗ (trước giống máy xèng cobac); + 5 ụ vẽ lại cùng đợt (raw_anime_u_velai_a/b)
R_MAX = 0.485            # bán kính xa nhất của đầu / cạnh ô (= tools/thap-cat-umod.py)
VIEN = 0.022             # độ dày viền màu nhấn quanh đầu / cạnh ô
TRON = 0.80              # mức đổi vàng → màu nhấn (0..1)

# màu nhấn theo cơ chế / hình cũ (đọc nhanh trong 1 bộ 5 ụ)
MAU = {
    # Trắng
    'xucxac': '#f4efe4', 'lien': '#d0743c', 'phun': '#ffe14a', 'sungluc': '#4f7dff', 'bang': '#8fe8ff', 'doc': '#8ee53f',
    'mana': '#2ee6c8', 'tia': '#ff5ad2', 'set': '#e8ff3a', 'maychem': '#a9b7cc', 'phagiap': '#ff5a1f', 'bua': '#a46bff',
    'nam': '#ff3d3d', 'bomhen': '#3c3c48',
    # Xanh
    'nhanmana': '#23e0a0', 'kiembang': '#4a8bff', 'mimic': '#b8763a', 'chimang': '#ff3d5a', 'dichchuyen': '#6a7bff',
    'radar': '#3ddc6a', 'drone': '#4fc3ff', 'tron': '#ff9a2a', 'nangluong': '#2fe0ff', 'laser': '#c25cff', 'lanhgia': '#a8f0ff',
    'mortar': '#a4b24a', 'khuech': '#b06bff', 'vungdoc': '#6ee03a', 'loa': '#e0603a', 'hutmana': '#22c8b8', 'min': '#d0202e',
    # Tím
    'cuongno': '#ff3030', 'baotuyet': '#8fdcff', 'nhanban': '#ff9a3a', 'lienket': '#b8b0d8', 'kepha': '#ff7a4a', 'taylo': '#7affd2',
    'khien': '#3fd0ff', 'hopbi': '#e04fd0', 'nangsao': '#ffe04a', 'tuthan': '#7a3cff', 'xaotron': '#7aa6ff', 'epxung': '#c04cff',
    'no5': '#ff4f7a', 'bao': '#8a5cff', 'anhsang': '#fff07a', 'nayda': '#9be22d', 'combo': '#ff6a3a', 'khoathoigian': '#3ac8c8',
    'docton': '#c8283c', 'thaukinh': '#2fd38a', 'nhieusong': '#ff4fd0', 'santhuong': '#ff9a1a',
    # Vàng (4 ụ vẽ lại)
    'dongbo': '#3fe0e0', 'orbital': '#4f8bff', 'sinhdoi': '#9a6bff', 'saochep': '#6ad0ff',
}
DANG = {'cuongno', 'lienket', 'hopbi', 'dongbo', 'orbital'}   # ụ grow-up vẽ lại: thêm đầu _s1.._s3 (STAGE_ANIME)


def doc_git(path, ref=None):
    b = subprocess.run(['git', '-C', GOC, 'show', '%s:%s' % (ref or REF, path)], capture_output=True, check=True).stdout
    return Image.open(io.BytesIO(b)).convert('RGBA')


def hex_rgb(h): return tuple(int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))


def doi_vang(a, mau, tron=None):
    """Phần kim loại VÀNG (hue 18–62°, bão hoà rõ) → màu nhấn, giữ sáng tối (vát kim loại)."""
    f = a[..., :3] / 255.0
    mx, mn = f.max(-1), f.min(-1); v = mx; d = mx - mn; s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    h = np.zeros_like(mx)
    m = d > 1e-6
    hr = ((g - b) / np.maximum(d, 1e-6)) % 6; hg = (b - r) / np.maximum(d, 1e-6) + 2; hb = (r - g) / np.maximum(d, 1e-6) + 4
    h = np.where(mx == r, hr, np.where(mx == g, hg, hb)) * 60; h = np.where(m, h, 0)
    # mức "vàng": mềm ở mép dải hue / bão hoà
    w = np.clip(1 - np.abs(h - 40) / 24, 0, 1) * np.clip((s - 0.22) / 0.2, 0, 1) * np.clip((v - 0.15) / 0.15, 0, 1)
    ah, as_, av = colorsys.rgb_to_hsv(*hex_rgb(mau))
    ns = as_ * np.clip(s / 0.7, 0, 1.0)
    nv = v * (0.5 + 0.5 * av) if av < 0.5 else v
    if av < 0.5: nv = 0.18 + v * 0.5    # màu nhấn tối (bom đen): kim loại sẫm, vẫn còn vát sáng
    # HSV → RGB (vector)
    ff = ah * 6 - np.floor(ah * 6)
    p, q, t = nv * (1 - ns), nv * (1 - ns * ff), nv * (1 - ns * (1 - ff))
    ch = [(nv, t, p), (q, nv, p), (p, nv, t), (p, q, nv), (t, p, nv), (nv, p, q)][int(np.floor(ah * 6)) % 6]
    moi = np.stack(ch, -1)
    k = (w * (TRON if tron is None else tron))[..., None]
    out = a.astype(np.float64).copy(); out[..., :3] = (f * (1 - k) + moi * k) * 255
    return out.clip(0, 255).astype(np.uint8)


def vien_mau(im, mau, px):
    """Viền màu nhấn ôm hình bóng (alpha giãn px, mép mềm) đặt DƯỚI hình."""
    al = im.split()[3]
    g = al.filter(ImageFilter.MaxFilter(2 * (px // 2) + 1)).filter(ImageFilter.GaussianBlur(max(1, px / 3)))
    ga = np.asarray(g).astype(np.float64) / 255
    ga = np.clip(ga * 1.6, 0, 1) * 0.95
    c = np.zeros(ga.shape + (4,), np.uint8); c[..., :3] = [int(x * 255) for x in hex_rgb(mau)]; c[..., 3] = (ga * 255).astype(np.uint8)
    nen = Image.fromarray(c, 'RGBA'); nen.alpha_composite(im); return nen


def dau(path_git, mau, K, ref=None):
    """→ (ảnh đầu đã nướng, dời tâm), K_vẽ"""
    a = doc_git(path_git, ref); W = a.width
    px_o = W / K                                  # điểm ảnh / cạnh ô
    pv = max(2, int(round(VIEN * px_o)))
    pad = pv * 2 + 2
    big = Image.new('RGBA', (W + 2 * pad, W + 2 * pad)); big.paste(a, (pad, pad))
    arr = doi_vang(np.asarray(big), mau)
    im = vien_mau(Image.fromarray(arr, 'RGBA'), mau, pv)
    al = np.asarray(im)[..., 3]; ys, xs = np.nonzero(al > 24)
    cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
    r = np.sqrt((xs - cx) ** 2 + (ys - cy) ** 2).max() + 1
    N = int(np.ceil(2 * r)) + 2
    out = Image.new('RGBA', (N, N)); out.paste(im, (int(round(N / 2 - cx)), int(round(N / 2 - cy))))
    K_ve = R_MAX * 2 * N / (2 * r)                # bán kính xa nhất = R_MAX ô
    K_ve = max(K_ve, K * N / W)                   # không bao giờ nhỏ hơn đầu gốc
    return out, round(K_ve, 4)


# tông vật liệu BẬC cho bệ / khung / icon thẻ (người dùng 10/11: Trắng/Xanh/Tím không được vàng kim như bậc Vàng)
BAC_MAU = {'trang': '#dfe4ec', 'xanh': '#3f8cff', 'tim': '#a35cff'}
BAC = {}
for _b, _ds in (('trang', 'xucxac lien phun sungluc bang doc mana tia set maychem phagiap bua nam bomhen'),
                ('xanh', 'nhanmana kiembang mimic chimang dichchuyen radar drone tron nangluong laser lanhgia mortar khuech vungdoc loa hutmana min'),
                ('tim', 'cuongno baotuyet nhanban lienket kepha taylo khien hopbi nangsao tuthan xaotron epxung no5 bao anhsang nayda combo khoathoigian docton thaukinh nhieusong santhuong'),
                ('vang', 'dongbo orbital sinhdoi saochep')):
    for _i in _ds.split(): BAC[_i] = _b


def be(i):
    """bệ: kim loại vàng → tông BẬC (Vàng giữ vàng kim), rồi tối bớt để đầu nổi lên."""
    a = np.asarray(doc_git('thap/assets/%s_de.png' % i, REF_RIENG.get(i)))
    m = BAC_MAU.get(BAC[i])
    if m: a = doi_vang(a, m, 1.0)
    a = a.astype(np.float64); f = a[..., :3] / 255
    f = f * 0.72 + np.array([0.02, 0.03, 0.07]) * 0.28   # tối, ngả chàm (nền Royal Twilight)
    a[..., :3] = (f * 255).clip(0, 255)
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def nho(i):
    """icon thẻ nho/<id>.png: kim loại vàng → tông BẬC (biểu tượng/đá màu giữ nguyên)."""
    a = doc_git('thap/assets/nho/%s.png' % i, REF_RIENG.get(i)); m = BAC_MAU.get(BAC[i])
    return Image.fromarray(doi_vang(np.asarray(a), m, 0.9), 'RGBA') if m else a


def js_obj(t, ten):
    m = re.search(r'window\.' + ten + r' = (.*);[ \t]*$', t, re.M); return json.loads(m.group(1)) if m else None


def main():
    ids = sys.argv[1:] or list(MAU)
    t0 = subprocess.run(['git', '-C', GOC, 'show', REF + ':thap/js/artscale.js'], capture_output=True, check=True, text=True).stdout
    HK, SA = js_obj(t0, 'HEAD_K'), js_obj(t0, 'STAGE_ANIME') or {}
    p = JS; t = open(p, encoding='utf-8').read(); DV = js_obj(t, 'DAU_VE') or {}
    for i in ids:
        mau = MAU[i]; ref = REF_RIENG.get(i)
        hk = js_obj(subprocess.run(['git', '-C', GOC, 'show', ref + ':thap/js/artscale.js'], capture_output=True, check=True, text=True).stdout, 'HEAD_K') if ref else HK
        im, K = dau('thap/assets/%s_nong.png' % i, mau, hk[i], ref); im.save(os.path.join(OUT, i + '_nong.png'), optimize=True)
        e = {'K': K}
        if i in DANG and i in SA:
            e['S'] = []
            for n in (1, 2, 3):
                im2, k2 = dau('thap/assets/%s_nong_s%d.png' % (i, n), mau, SA[i]['K'][n - 1])
                im2.save(os.path.join(OUT, '%s_nong_s%d.png' % (i, n)), optimize=True); e['S'].append(k2)
        be(i).save(os.path.join(OUT, i + '_de.png'), optimize=True)
        if BAC_MAU.get(BAC[i]): nho(i).save(os.path.join(OUT, 'nho', i + '.png'), optimize=True)
        DV[i] = e
        print(i, mau, 'K', hk[i], '→', K, e.get('S', ''))
    if not os.environ.get('KHONG_JS'):
        s = 'window.DAU_VE = ' + json.dumps(DV, ensure_ascii=False) + ';'
        m = re.search(r'window\.DAU_VE = (.*);[ \t]*$', t, re.M)
        if m: t = t[:m.start()] + s + t[m.end():]
        else: t = t.rstrip('\n') + '\n// claude/demo-hop-tuong 10/11 (tools/thap-nhan-dien-u.py): NHẬN DIỆN ụ anime — đầu đã dời tâm + màu nhấn; K/S = cỡ VẼ (ô × K) — chỉ để vẽ, cỡ luật (coDau, mũi nòng) vẫn HEAD_K/STAGE_K\n' + s + '\n'
        open(p, 'w', encoding='utf-8').write(t)


if __name__ == '__main__':
    main()
