#!/usr/bin/env python3
"""TURRET MERGE — CĂN CỠ ĐẦU ỤNG THEO THÂN (body), chạy SAU tools/thap-tuong-moi.py.
Vấn đề: công thức cũ (thap-co-dau.py: thân vuông góc ≤61%, đường kính diện tích ≤68%, mũi ≤92%) tính cho ảnh cũ;
12 đầu vẽ lại + các ụ mới có viền/cánh/đuôi rộng → nhìn TO hoặc NHỎ hơn hẳn các ụ khác trên bệ chung.
Cách đo: "bán kính thân" ρ = bán kính lớn nhất mà ≥80% vòng tròn quanh tâm còn đặc (nòng/cánh mảnh không tính).
Mốc: trung vị đường kính thân của 52 ụ cũ đã chuẩn = 0.495 cạnh ô (20–80%: 0.44–0.53).
→ K = 0.495 / (2ρ) (đầu tròn không nòng ×1.07)  (dạng thức tỉnh s3: ×1.1 — "đầu lớn thêm bộ phận, không phóng cả ảnh"), chặn mũi xa nhất ≤ 0.95 ô, K ∈ [0.6, 1.1].
Cập nhật: artscale.js HEAD_K / STAGE_K, meta.js ART_META {s = K/0.8, tip = mũi nòng}, icon thẻ assets/nho/<id>.png.
Chạy: python3 tools/thap-co-than.py [id ...]   (không truyền id = danh sách DS bên dưới)
"""
import importlib.util, json, math, os, re, sys
import numpy as np
from PIL import Image

GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
A = os.path.join(GOC, 'thap', 'assets'); JS = os.path.join(GOC, 'thap', 'js')
spec = importlib.util.spec_from_file_location('tm', os.path.join(GOC, 'tools', 'thap-tuong-moi.py'))
MUC = 0.495
VE_LAI = 'mana phagiap bomhen mimic mortar vungdoc loa drone baotuyet bao aten saochep'.split()
MOI = ('nayda combo khoathoigian hydra cuuvi pandora luoicheo ngaithoigian nemesis docton thaukinh nhieusong santhuong '
       'nhatthuc loren guongcong marionette chuato leviathan khoisinh ronglua').split()
S3 = ['hydra', 'cuuvi', 'ngaithoigian', 'luoicheo', 'ronglua']   # dạng 1/2 = đầu gốc, dạng 3 = ảnh s3


def than(path, nguong=0.8):
    a = np.array(Image.open(path).convert('RGBA'))[:, :, 3] > 110; h, w = a.shape
    g = np.linspace(0, 2 * np.pi, 360, endpoint=False); rho = 0.2
    for p in np.arange(0.2, 1.0, 0.01):
        xs = (w / 2 + np.cos(g) * p * w / 2).astype(int).clip(0, w - 1); ys = (h / 2 + np.sin(g) * p * h / 2).astype(int).clip(0, h - 1)
        if a[ys, xs].mean() >= nguong: rho = p
    ys, xs = np.nonzero(a); r = np.sqrt((xs + .5 - w / 2) ** 2 + (ys + .5 - h / 2) ** 2).max() / (w / 2)
    return float(rho), float(r)


def K_than(path, muc=MUC):
    rho, r = than(path)
    if rho < 0.36: return None, rho, r          # thân quá mảnh (ụ lưỡi kiếm / khung rỗng): giữ K cũ
    if r - rho < 0.16: muc *= 1.07               # đầu tròn KHÔNG nòng: thiếu khối nòng → nhìn nhỏ hơn, bù +7%
    return round(float(np.clip(muc / rho, 0.6, min(1.1, 0.95 / r))), 3), rho, r


def js_obj(txt, ten):
    m = re.search(r'window\.' + ten + r' = (.*);[ \t]*$', txt, re.M); return json.loads(m.group(1))


def js_set(txt, ten, obj):
    m = re.search(r'window\.' + ten + r' = (.*);[ \t]*$', txt, re.M)
    return txt[:m.start()] + 'window.' + ten + ' = ' + json.dumps(obj, ensure_ascii=False) + ';' + txt[m.end():]


def icon(id, K, r):
    de = Image.open(os.path.join(A, 'de_chung.png')).convert('RGBA'); im = Image.open(os.path.join(A, id + '_nong.png')).convert('RGBA')
    N = 192; BE = 0.70; ic = Image.new('RGBA', (N, N), (0, 0, 0, 0)); sc = 0.84 / max(BE, K * r)
    b = int(round(N * BE * sc)); ic.alpha_composite(de.resize((b, b), Image.LANCZOS), ((N - b) // 2, (N - b) // 2))
    d = int(round(N * K * sc)); hd = im.resize((d, d), Image.LANCZOS).rotate(0 if id in ('mana', 'luoicheo', 'khoisinh') else 45, Image.BICUBIC)
    ic.alpha_composite(hd, ((N - d) // 2, (N - d) // 2)); ic.save(os.path.join(A, 'nho', id + '.png'), optimize=True)


if __name__ == '__main__':
    ids = sys.argv[1:] or VE_LAI + MOI
    mt = open(os.path.join(JS, 'meta.js'), encoding='utf-8').read(); at = open(os.path.join(JS, 'artscale.js'), encoding='utf-8').read()
    ART = js_obj(mt, 'ART_META'); HK = js_obj(at, 'HEAD_K'); SK = js_obj(at, 'STAGE_K')
    for id in ids:
        f = os.path.join(A, id + '_nong.png'); K, rho, r = K_than(f)
        cu = HK.get(id)
        if K is None: K = cu
        HK[id] = K; ART.setdefault(id, {'tip': 0.9})['s'] = round(K / 0.8, 3)
        icon(id, K, r)
        if id in S3 and os.path.exists(os.path.join(A, id + '_nong_s3.png')):
            k3, _, _ = K_than(os.path.join(A, id + '_nong_s3.png'), MUC * 1.1); SK[id] = [K, K, k3 or K]
        print(f'{id:13s} than {rho:.2f}  K {cu} -> {K}   than tren o {cu*rho:.3f} -> {K*rho:.3f}', SK.get(id, '') if id in S3 else '')
    open(os.path.join(JS, 'meta.js'), 'w', encoding='utf-8').write(js_set(mt, 'ART_META', ART))
    open(os.path.join(JS, 'artscale.js'), 'w', encoding='utf-8').write(js_set(js_set(at, 'HEAD_K', HK), 'STAGE_K', SK))
