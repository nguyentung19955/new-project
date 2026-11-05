#!/usr/bin/env python3
"""TURRET MERGE — LẮP BỘ ĐẦU ỤNG + PHI CÔNG VẼ LẠI (v2) cho 85 ụ.
Nguồn: docs/demo-hop-tuong/thap-art/redo/<id>_nong_v2.png (đầu súng 256 px, nhìn từ trên, nòng chĩa PHẢI)
       docs/demo-hop-tuong/thap-art/redo/pilot_<id>_v2.png (chân dung phi công 256 px)
Việc làm (chạy lại được — luôn đọc từ ảnh v2 gốc, không xử lý chồng):
  1. Lưu bản cũ: thap/assets/<id>_nong.png → docs/.../thap-art/old_heads/, pilot_<id>.png → old_pilots/ (chỉ lần đầu).
  2. Đầu súng: đặt TÂM THÂN vào tâm ảnh (ảnh xoay quanh tâm → thân phải nằm đúng tâm, nòng không "quét" lệch).
     Tâm thân = trung bình (tâm vòng tròn nội tiếp lớn nhất, trọng tâm khối thân sau khi gọt nòng mảnh) khi 2 cách đo khớp nhau.
     Lệch > 5 px thì dời; nếu dời làm tràn mép thì thu cả ảnh về để không cắt mất phần nào.
     Rồi làm mịn viền (tools/thap-lam-min-anh.py: khử màu phông ở viền + alpha mềm).
  3. Cỡ: K (artscale.js HEAD_K) = MUC / cỡ thân, cỡ thân = 0.65·đường kính khối thân + 0.35·đường kính toàn hình (diện tích tương đương)
     → thân mọi ụ nhìn bằng nhau trên bệ chung (de_chung.png = 70% ô). Chặn: mũi xa nhất ≤ 0.49 ô, K ∈ [0.62, 1.12].
     ART_META.s = K/0.8, ART_META.tip = mũi nòng (điểm đặc xa nhất phía phải trên trục giữa).
  4. Icon thẻ assets/nho/<id>.png dựng lại từ đầu mới + bệ chung.
  5. Ụ đổi dạng (STAGE_K): ảnh _s1/_s2/_s3 cũ KHÔNG khớp đầu mới → chuyển sang STAGE_K_CHO (giữ số cũ chờ ảnh mới),
     STAGE_DAU_MOI[id] = hệ số cỡ dạng 1/2/3 dựng từ đầu mới (growfx.js vẽ quầng PNG theo dạng).
Chạy: python3 tools/thap-dau-v2.py
"""
import importlib.util, json, os, re, shutil
import numpy as np
from PIL import Image
from scipy import ndimage

GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
A = os.path.join(GOC, 'thap', 'assets'); JS = os.path.join(GOC, 'thap', 'js')
ART = os.path.join(GOC, 'docs', 'demo-hop-tuong', 'thap-art'); REDO = os.path.join(ART, 'redo')
spec = importlib.util.spec_from_file_location('lm', os.path.join(GOC, 'tools', 'thap-lam-min-anh.py'))
LM = importlib.util.module_from_spec(spec); spec.loader.exec_module(LM)
MUC = 0.535
NHAN_STAGE = [1.0, 1.04, 1.08]


def mat(im):
    return ndimage.binary_fill_holes(np.asarray(im)[..., 3] > 110)


def do_than(a):
    """→ (tâm nội tiếp, tâm khối thân, đường kính thân, đường kính toàn hình, bán kính nội tiếp) theo px"""
    d = ndimage.distance_transform_edt(a); m = d.max()
    ys, xs = np.nonzero(d >= 0.92 * m); c1 = (xs.mean() + .5, ys.mean() + .5)
    r = max(2, int(m * 0.45))                                     # gọt nòng mảnh: mở hình thái bằng đĩa bán kính r (qua khoảng cách, nhanh)
    than = ndimage.distance_transform_edt(~(d > r)) <= r
    ys, xs = np.nonzero(than); c2 = (xs.mean() + .5, ys.mean() + .5)
    return c1, c2, 2 * np.sqrt(than.sum() / np.pi), 2 * np.sqrt(a.sum() / np.pi), m


def can_giua(im):
    a = mat(im); W = im.size[0]; c1, c2, *_ = do_than(a)
    if abs(c1[0] - c2[0]) > 12 or abs(c1[1] - c2[1]) > 12: return im, (0, 0)
    dx, dy = W / 2 - (c1[0] + c2[0]) / 2, W / 2 - (c1[1] + c2[1]) / 2
    if abs(dx) <= 5 and abs(dy) <= 5: return im, (0, 0)
    dx, dy = int(round(dx)), int(round(dy)); P = max(abs(dx), abs(dy)) + 2
    to = Image.new('RGBA', (W + 2 * P, W + 2 * P), (0, 0, 0, 0)); to.paste(im, (P + dx, P + dy))
    ys, xs = np.nonzero(np.asarray(to)[..., 3] > 8); C = (W + 2 * P) / 2
    xa = max(C - xs.min(), xs.max() + 1 - C, C - ys.min(), ys.max() + 1 - C)    # nửa cạnh nhỏ nhất chứa hết hình (quanh tâm)
    nua = max(W / 2, xa + 1)
    to = to.crop((int(C - nua), int(C - nua), int(C + nua), int(C + nua)))
    if to.size[0] != W: to = to.convert('RGBa').resize((W, W), Image.LANCZOS).convert('RGBA')
    return to, (dx, dy)


def mui(a):
    """mũi nòng: điểm đặc xa nhất bên phải trong dải giữa (±8% cạnh), theo nửa cạnh ảnh"""
    h, w = a.shape; b = a[int(h * .42):int(h * .58)]
    xs = np.nonzero(b.any(0))[0]
    return round(float((xs.max() + 1 - w / 2) / (w / 2)), 3) if len(xs) else 0.9


def js_obj(txt, ten):
    m = re.search(r'window\.' + ten + r' = (.*);[ \t]*$', txt, re.M); return json.loads(m.group(1)) if m else None


def js_set(txt, ten, obj, ghichu=''):
    s = 'window.' + ten + ' = ' + json.dumps(obj, ensure_ascii=False) + ';'
    m = re.search(r'window\.' + ten + r' = (.*);[ \t]*$', txt, re.M)
    if m: return txt[:m.start()] + s + txt[m.end():]
    return txt.rstrip('\n') + '\n' + (ghichu + '\n' if ghichu else '') + s + '\n'


def icon(id, K, r):
    de = Image.open(os.path.join(A, 'de_chung.png')).convert('RGBA'); im = Image.open(os.path.join(A, id + '_nong.png')).convert('RGBA')
    N = 192; BE = 0.70; ic = Image.new('RGBA', (N, N), (0, 0, 0, 0)); sc = 0.84 / max(BE, K * r)
    b = int(round(N * BE * sc)); ic.alpha_composite(de.resize((b, b), Image.LANCZOS), ((N - b) // 2, (N - b) // 2))
    d = int(round(N * K * sc)); hd = im.convert('RGBa').resize((d, d), Image.LANCZOS).convert('RGBA')
    hd = hd.rotate(0 if id in ('mana', 'luoicheo', 'khoisinh') else 45, Image.BICUBIC)
    ic.alpha_composite(hd, ((N - d) // 2, (N - d) // 2)); ic.save(os.path.join(A, 'nho', id + '.png'), optimize=True)


if __name__ == '__main__':
    mt = open(os.path.join(JS, 'meta.js'), encoding='utf-8').read(); at = open(os.path.join(JS, 'artscale.js'), encoding='utf-8').read()
    AM = js_obj(mt, 'ART_META'); HK = js_obj(at, 'HEAD_K'); SK = js_obj(at, 'STAGE_K'); ST = js_obj(at, 'STAGE_TIP')
    SKC = js_obj(at, 'STAGE_K_CHO') or {}; STC = js_obj(at, 'STAGE_TIP_CHO') or {}
    os.makedirs(os.path.join(ART, 'old_heads'), exist_ok=True); os.makedirs(os.path.join(ART, 'old_pilots'), exist_ok=True)
    bang = []
    for id in HK:
        src = os.path.join(REDO, id + '_nong_v2.png'); dst = os.path.join(A, id + '_nong.png')
        if not os.path.exists(src): print('THIEU', src); continue
        cu = os.path.join(ART, 'old_heads', id + '_nong.png')
        if not os.path.exists(cu) and os.path.exists(dst): shutil.copy2(dst, cu)
        im, dich = can_giua(Image.open(src).convert('RGBA'))
        im.save(dst); LM.lam(dst)
        # phi công
        ps = os.path.join(REDO, 'pilot_' + id + '_v2.png'); pd = os.path.join(A, 'pilot_' + id + '.png')
        if os.path.exists(ps):
            pc = os.path.join(ART, 'old_pilots', 'pilot_' + id + '.png')
            if not os.path.exists(pc) and os.path.exists(pd): shutil.copy2(pd, pc)
            p = Image.open(ps)
            if p.size != (256, 256): p = p.resize((256, 256), Image.LANCZOS)
            p.save(pd, optimize=True)
        # cỡ
        a = mat(Image.open(dst).convert('RGBA')); W = a.shape[0]
        _, _, dthan, dtoan, _ = do_than(a)
        ys, xs = np.nonzero(a); far = float(np.sqrt((xs + .5 - W / 2) ** 2 + (ys + .5 - W / 2) ** 2).max() / (W / 2))
        co = (0.65 * dthan + 0.35 * dtoan) / W
        K = round(float(np.clip(MUC / co, 0.62, min(1.12, 0.98 / far))), 3)
        HK[id] = K; AM.setdefault(id, {})['s'] = round(K / 0.8, 3); AM[id]['tip'] = min(0.98, mui(a))
        icon(id, K, far)
        bang.append((id, dich, round(co, 3), K, round(far, 3)))
    # ụ đổi dạng: ảnh _s cũ không khớp đầu mới → chờ ảnh mới, dựng dạng từ đầu mới
    SDM = js_obj(at, 'STAGE_DAU_MOI') or {}
    for id in list(SK):
        SKC[id] = SK.pop(id)
        if id in ST: STC[id] = ST.pop(id)
    for id in SKC:
        far = next((b[4] for b in bang if b[0] == id), 0.92)
        SDM[id] = [round(min(n, 0.98 / (HK[id] * far)), 3) for n in NHAN_STAGE]
    open(os.path.join(JS, 'meta.js'), 'w', encoding='utf-8').write(js_set(mt, 'ART_META', AM))
    at = js_set(js_set(js_set(at, 'HEAD_K', HK), 'STAGE_K', SK), 'STAGE_TIP', ST)
    at = js_set(at, 'STAGE_K_CHO', SKC, '// ảnh dạng _s1/_s2/_s3 CŨ không khớp đầu v2 → tạm cất (khi có ảnh mới: chuyển id về STAGE_K/STAGE_TIP, xoá khỏi STAGE_DAU_MOI)')
    at = js_set(at, 'STAGE_TIP_CHO', STC)
    at = js_set(at, 'STAGE_DAU_MOI', SDM, '// ụ đổi dạng dùng ĐẦU MỚI cho cả 3 dạng: hệ số cỡ dạng 1/2/3 (growfx.js thêm quầng PNG theo dạng)')
    open(os.path.join(JS, 'artscale.js'), 'w', encoding='utf-8').write(at)
    for b in bang: print('%-13s dich %-10s co %.3f K %.3f far %.3f' % (b[0], b[1], b[2], b[3], b[4]))
