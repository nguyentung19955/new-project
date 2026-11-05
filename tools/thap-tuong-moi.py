#!/usr/bin/env python3
"""TURRET MERGE — đưa ỤNG MỚI (docs/demo-hop-tuong/TUONG-MOI-20.md) vào thap/:
  1. chép đầu ụ <id>_nong.png (+ dạng thức tỉnh <id>_nong_s3.png nếu có) + phi công pilot_<id>.png sang thap/assets/
     (đầu ụ qua bước làm mịn viền của tools/thap-lam-min-anh.py; phi công giữ nguyên như các ụ cũ)
  2. ụ grow-up có ảnh s3: dạng 1/2 = đầu gốc (code thêm sáng/phóng), dạng 3 = ảnh s3 → <id>_nong_s1/_s2/_s3.png
  3. đo cỡ đầu: ART_META (s, tip — công thức thap-cat-hinh.py), HEAD_K / STAGE_K / STAGE_TIP (công thức thap-co-dau.py)
  4. icon thẻ assets/nho/<id>.png (bệ chung + đầu súng, 192 px)
  5. thêm vào roster.json (docs + thap/assets) và meta.js (ROSTER_EMBED) — giữ nguyên mục cũ
Chạy: python3 tools/thap-tuong-moi.py   (chạy lại nhiều lần được: luôn chép lại từ ảnh gốc)
"""
import importlib.util, json, math, os, re, shutil
import numpy as np
from PIL import Image
from scipy import ndimage as nd

GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
NGUON = os.path.join(GOC, 'docs', 'demo-hop-tuong', 'thap-art')
A = os.path.join(GOC, 'thap', 'assets')
JS = os.path.join(GOC, 'thap', 'js')
spec = importlib.util.spec_from_file_location('lammin', os.path.join(GOC, 'tools', 'thap-lam-min-anh.py'))
lammin = importlib.util.module_from_spec(spec); spec.loader.exec_module(lammin)

# id, tên VN, bậc, thẻ DCDW (cảm hứng), kỹ năng VN, tên EN, kỹ năng EN, vai, họ
MOI = [
    ('nayda', 'Đĩa Nảy', 'tim', 'Child cung thủ', 'Đĩa nảy sang N quái, mỗi lần nảy mạnh hơn', 'Ricochet', 'Disc bounces to N enemies, stronger each bounce', 'tc', 'energy'),
    ('combo', 'Lõi Combo', 'tim', 'Random Dice Combo', 'Mỗi lần ghép 2 Lõi Combo → mọi Lõi Combo +sát thương vĩnh viễn', 'Combo Core', 'Every Combo Core merge permanently powers up all Combo Cores', 'tc', 'summon'),
    ('khoathoigian', 'Khoá Thời Gian', 'tim', 'Freezer / Mayauel', 'Khoá quái đầu trong thời gian; mở khoá nổ phần sát thương đã dồn', 'Chrono Lock', 'Freezes the lead enemy in time; stored damage bursts on release', 'db', 'trap'),
    ('hydra', 'Hydra', 'vang', 'Hydra / Tiamat', 'Số nòng = số sao, mỗi nòng bắn 1 quái khác; 7★ hợp thành tia khổng lồ', 'Hydra', 'One barrel per star, each hits a different enemy; 7★ fuses into a giant beam', 'tc', 'rapid'),
    ('cuuvi', 'Cửu Vĩ', 'vang', 'Kumiho', 'Mỗi lần giết mọc 1 đuôi lửa; đủ 9 đuôi xả 9 cầu lửa tự dẫn', 'Nine-Tail', 'Kills grow fire tails; 9 tails unleash 9 homing foxfires', 'tc', 'blast'),
    ('pandora', 'Hộp Pandora', 'vang', 'Pandora', 'Khi GHÉP: mở hộp — 1 trong 6 phép lớn ngẫu nhiên', 'Pandora Vault', 'On merge: opens the vault for 1 of 6 big effects', 'db', 'joker'),
    ('luoicheo', 'Lưới Cộng Hưởng', 'vang', '(ChatGPT G05)', 'Hỗ trợ 4 ô CHÉO: +sát thương; đủ 4 ô chéo → cộng hưởng', 'Resonance Grid', 'Support: buffs the 4 DIAGONAL cells (not N/E/S/W); all 4 filled = RESONANCE', 'ht', 'amp'),
    ('ngaithoigian', 'Ngai Thời Gian', 'do', 'Chronos', 'Quái chậm dần theo thời gian; CHỦ ĐỘNG Rewind đẩy lùi mọi quái', 'Chrono Throne', 'Enemies slow over time. Active (3★+): REWIND pushes all enemies back', 'db', 'trap'),
    # ---- đợt 2 ----
    ('nemesis', 'Nữ Thần Phán Xử', 'vang', 'Nemesis / Lancelot', 'Xử tử quái dưới ngưỡng máu; vào trùm gây % máu tối đa', 'Nemesis', 'Executes low-HP enemies; % max-HP judgment on bosses', 'tc', 'execute'),
    ('docton', 'Độc Tôn', 'tim', 'Blade Dancer', 'Không có ụ kề → tốc bắn ×2 và +chí mạng', 'Lone Ace', 'No neighbors: double fire rate and bonus crit', 'tc', 'heavy'),
    ('thaukinh', 'Thấu Kính', 'tim', 'Siren+', 'Hỗ trợ: ụ kề +sát thương chí mạng, chí mạng xuyên quái', 'Focus Lens', 'Support: neighbors deal more crit damage; crits pierce', 'ht', 'crit'),
    ('nhieusong', 'Máy Nhiễu Sóng', 'tim', 'Cain / Neban', 'Khi GHÉP: PVP nhiễu ụ đối thủ; Co-op đồng đội triệu hồi miễn phí', 'Signal Jammer', 'On merge: PVP jams rival turrets; Co-op gives ally a free summon', 'db', 'guard'),
    ('santhuong', 'Đèn Săn Thưởng', 'tim', 'Syrinx / Thisbe', 'Gắn truy nã lên quái; giết quái truy nã được thêm mana', 'Bounty Beacon', 'Marks enemies; marked kills give bonus mana', 'db', 'mana'),
    ('nhatthuc', 'Nhật Thực', 'vang', 'Aten (Solar/Lunar)', 'Đổi Ngày (tia đốt) ⇄ Đêm (sóng làm chậm) mỗi 8 s', 'Eclipse', 'Day: burning beam. Night: slowing wave. Swaps every 8s', 'tc', 'frost'),
    ('loren', 'Lò Rèn Phế Liệu', 'vang', 'Treant / Scrapper', 'Kéo ụ 1–3★ vào để ăn: +sát thương vĩnh viễn', 'Scrap Forge', 'Drag a 1–3★ turret onto it to feed: permanent damage stacks', 'tc', 'star'),
    ('guongcong', 'Cổng Gương', 'vang', 'Eve / Mona', 'PVP phản đòn khống chế; Co-op sao chép hiệu ứng ghép đồng đội', 'Mirror Gate', 'PVP: reflects rival control. Co-op: copies ally merge effects. Solo: blocks boss skills', 'db', 'guard'),
    ('marionette', 'Rối Máy', 'vang', 'Child điều khiển rối', 'Chiếm điều khiển quái, bắt đi ngược đường rồi nổ', 'Marionette', 'Takes control of an enemy, walks it backward, then boom', 'db', 'trap'),
]
S3 = ['hydra', 'cuuvi', 'ngaithoigian', 'luoicheo']  # có ảnh dạng thức tỉnh → grow-up dạng ảnh


def head_k(im):
    a = np.array(im)[:, :, 3] > 110
    h, w = a.shape; ys, xs = np.nonzero(a)
    wb = (ys.max() - ys.min() + 1) / h
    eq = 2 * math.sqrt(a.sum() / math.pi) / w
    r = np.sqrt((xs + .5 - w / 2) ** 2 + (ys + .5 - h / 2) ** 2).max() / (w / 2)
    return min(0.61 / wb, 0.68 / eq, 0.92 / r), r


def art_meta(path):
    a = np.asarray(Image.open(path))[..., 3] > 60
    dt = nd.distance_transform_edt(nd.binary_fill_holes(a))
    body = float(dt[112:144, 112:144].max())
    cot = np.nonzero(a[118:138].any(0))[0]
    tip = (cot.max() - 128) / 128.0 if len(cot) else 0.6
    s = min(1.35, max(0.85, 72.0 / max(body, 30)))
    return {'s': round(s, 3), 'tip': round(float(tip), 3)}


def chep_dau(src, dst):
    shutil.copyfile(src, dst); lammin.lam(dst)


def icon(id, K, r):
    de = Image.open(os.path.join(A, 'de_chung.png')).convert('RGBA')
    im = Image.open(os.path.join(A, id + '_nong.png')).convert('RGBA')
    N = 192; BE = 0.70; ic = Image.new('RGBA', (N, N), (0, 0, 0, 0))
    sc = 0.84 / max(BE, K * r)
    b = int(round(N * BE * sc)); ic.alpha_composite(de.resize((b, b), Image.LANCZOS), ((N - b) // 2, (N - b) // 2))
    d = int(round(N * K * sc)); hd = im.resize((d, d), Image.LANCZOS).rotate(45 if id != 'luoicheo' else 0, Image.BICUBIC)
    ic.alpha_composite(hd, ((N - d) // 2, (N - d) // 2))
    os.makedirs(os.path.join(A, 'nho'), exist_ok=True); ic.save(os.path.join(A, 'nho', id + '.png'), optimize=True)


def js_obj(txt, ten):
    m = re.search(r'window\.' + ten + r' = (.*);[ \t]*$', txt, re.M)
    return (json.loads(m.group(1)), m) if m else ({}, None)


def js_set(txt, ten, obj):
    s = 'window.' + ten + ' = ' + json.dumps(obj, ensure_ascii=False) + ';'
    _, m = js_obj(txt, ten)
    return txt[:m.start()] + s + txt[m.end():] if m else txt.rstrip('\n') + '\n' + s + '\n'


meta_txt = open(os.path.join(JS, 'meta.js'), encoding='utf-8').read()
art_txt = open(os.path.join(JS, 'artscale.js'), encoding='utf-8').read()
ART, _ = js_obj(meta_txt, 'ART_META'); EMB, _ = js_obj(meta_txt, 'ROSTER_EMBED')
HK, _ = js_obj(art_txt, 'HEAD_K'); SK, _ = js_obj(art_txt, 'STAGE_K'); ST, _ = js_obj(art_txt, 'STAGE_TIP')
r_docs = json.load(open(os.path.join(NGUON, 'roster.json'), encoding='utf-8'))
r_thap = json.load(open(os.path.join(A, 'roster.json'), encoding='utf-8'))

for (id, vi, bac, dcdw, knvi, en, knen, vai, ho) in MOI:
    src = os.path.join(NGUON, id + '_nong.png')
    if not os.path.exists(src): print('THIẾU', src); continue
    chep_dau(src, os.path.join(A, id + '_nong.png'))
    shutil.copyfile(os.path.join(NGUON, 'pilot_' + id + '.png'), os.path.join(A, 'pilot_' + id + '.png'))
    ART[id] = art_meta(os.path.join(A, id + '_nong.png'))
    K, r = head_k(Image.open(os.path.join(A, id + '_nong.png')).convert('RGBA'))
    HK[id] = round(float(K), 3)
    icon(id, K, r)
    if id in S3:
        ks, ts = [], []
        for n in (1, 2, 3):
            f = os.path.join(A, id + '_nong_s%d.png' % n)
            chep_dau(os.path.join(NGUON, id + ('_nong_s3.png' if n == 3 else '_nong.png')), f)
            k2, _ = head_k(Image.open(f).convert('RGBA')); ks.append(round(float(k2), 3)); ts.append(art_meta(f)['tip'])
        SK[id] = ks; ST[id] = ts
    for ds, ten, kn, them in ((r_docs, vi, knvi, {}), (r_thap, en, knen, {'ten_vi': vi, 'kyNang_vi': knvi})):
        e = {'id': id, 'ten': ten, 'bac': bac, 'dcdw': dcdw, 'kyNang': kn, **them, 'vai': vai, 'ho': ho, 'moi': 'TUONG-MOI-20'}
        for i, x in enumerate(ds):
            if x['id'] == id: ds[i] = e; break
        else: ds.append(e)
    e = {'id': id, 'ten': vi, 'bac': bac, 'dcdw': dcdw, 'kyNang': knvi, 'vai': vai, 'ho': ho}
    for i, x in enumerate(EMB):
        if x['id'] == id: EMB[i] = e; break
    else: EMB.append(e)
    print(id, 'K', HK[id], ART[id], SK.get(id, ''))

json.dump(r_docs, open(os.path.join(NGUON, 'roster.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(os.path.join(A, 'roster.json'), 'w', encoding='utf-8').write(json.dumps(r_thap, ensure_ascii=False, indent=1) + '\n')
meta_txt = js_set(js_set(meta_txt, 'ART_META', ART), 'ROSTER_EMBED', EMB)
open(os.path.join(JS, 'meta.js'), 'w', encoding='utf-8').write(meta_txt)
art_txt = js_set(js_set(js_set(art_txt, 'HEAD_K', HK), 'STAGE_K', SK), 'STAGE_TIP', ST)
open(os.path.join(JS, 'artscale.js'), 'w', encoding='utf-8').write(art_txt)
print('xong', len(MOI))
