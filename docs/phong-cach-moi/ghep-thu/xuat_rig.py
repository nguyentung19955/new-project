#!/usr/bin/env python3
"""Xuất 3 tệp khung xương mẫu (định dạng "linh-khi-rig", xem docs/phong-cach-moi/KE-HOACH-CHIBI.md) từ ảnh tách bộ phận.

Dùng lại cut.py (tách mảnh khỏi nền trắng) và các điểm khớp đã dò trong hero.json, boar.json, knight.json.
  python3 docs/phong-cach-moi/ghep-thu/xuat_rig.py
Ghi ra game/art/chibi/tho-ren.rig.json, heo-rung-con.rig.json, linh-ma-giap-gi.rig.json.
Cần Pillow, numpy, scipy.
"""
import base64
import io
import json
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
MAU = os.path.join(REPO, 'docs', 'phong-cach-moi', 'mau')
RA = os.path.join(REPO, 'game', 'art', 'chibi')
TOI_DA = 300 * 1024  # mỗi tệp dưới ~300 KB

# tên mảnh trong json -> (tên mảnh trong rig, vai)
NGUOI = {'body': ('than', 'than'), 'head': ('dau', 'dau'), 'arm_f': ('tay-truoc', 'tay-truoc'), 'arm_b': ('tay-sau', 'tay-sau'),
         'leg_f': ('chan-truoc', 'chan-truoc'), 'leg_b': ('chan-sau', 'chan-sau')}
BON_CHAN = {'body': ('than', 'than'), 'head': ('dau', 'dau'), 'tail': ('duoi', 'duoi'),
            'legFN': ('chan-truoc-gan', 'chan-truoc-gan'), 'legFF': ('chan-truoc-xa', 'chan-truoc-xa'),
            'legBN': ('chan-sau-gan', 'chan-sau-gan'), 'legBF': ('chan-sau-xa', 'chan-sau-xa')}

MAU_RIG = [
    # anh mẫu, json khớp, mã, tên, đối tượng, thay cho (mã quái trong game), khung, bảng tên, cao (đơn vị game), lật ngang
    ('hero', 'hero.json', 'tho-ren', 'Thợ Rèn', 'em-be', 'hero', 'nguoi', NGUOI, 34, False),
    ('boar', 'boar.json', 'heo-rung-con', 'Heo Rừng Con', 'quai', 'heoCon', 'bon-chan', BON_CHAN, 30, True),   # ảnh mẫu quay TRÁI
    ('knight', 'knight.json', 'linh-ma-giap-gi', 'Linh Ma Giáp Gỉ', 'quai', 'linhMa', 'nguoi', NGUOI, 36, False),
]


def tach(ten, tam):
    """Chạy cut.py trong thư mục tạm, trả về danh sách ảnh mảnh RGBA theo số thứ tự k."""
    shutil.copy(os.path.join(MAU, ten + '_parts.png'), os.path.join(tam, ten + '_parts.png'))
    subprocess.run([sys.executable, os.path.join(HERE, 'cut.py'), ten], cwd=tam, check=True, stdout=subprocess.DEVNULL)
    out, k = [], 0
    while os.path.exists(os.path.join(tam, '%s_p%d.png' % (ten, k))):
        out.append(Image.open(os.path.join(tam, '%s_p%d.png' % (ten, k))).convert('RGBA'))
        k += 1
    return out


def xep(manh, le=2):
    """Xếp các mảnh (đã co) vào một tấm ảnh theo hàng. Trả về (ảnh, [ô x, y, rộng, cao])."""
    rong = max(256, max(m.width for m in manh) + le * 2)
    tong = sum(m.width * m.height for m in manh)
    rong = max(rong, int((tong ** 0.5) * 1.25))
    x = y = cao_hang = 0
    o = []
    for m in manh:
        if x + m.width + le > rong:
            x, y, cao_hang = 0, y + cao_hang + le, 0
        o.append([x + le, y + le, m.width, m.height])
        x += m.width + le
        cao_hang = max(cao_hang, m.height + le)
    anh = Image.new('RGBA', (rong + le, y + cao_hang + le * 2), (0, 0, 0, 0))
    for m, q in zip(manh, o):
        anh.alpha_composite(m, (q[0], q[1]))
    # cắt bớt phần thừa bên phải
    bb = anh.getbbox()
    if bb:
        anh = anh.crop((0, 0, bb[2] + le, bb[3] + le))
    return anh, o


def png_b64(anh):
    b = io.BytesIO()
    anh.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode('ascii')


def lam(anh_mau, tep_khop, ma, ten, doi, thay_cho, khung, bang, cao, lat, tam):
    cfg = json.load(open(os.path.join(HERE, tep_khop), encoding='utf-8'))
    imgs = tach(anh_mau, tam)
    P = cfg['parts']
    body = P['body']
    ox, oy = cfg['root']
    bdat = (ox - body['pivot'][0], oy - body['pivot'][1])  # góc trên trái của thân trong tư thế ráp
    thu_tu = sorted(P.items(), key=lambda kv: kv[1]['z'])
    lop = {k: i for i, (k, _) in enumerate(thu_tu)}
    ds = []
    for k, pt in P.items():
        im = imgs[pt['k']]
        if k == 'body':
            dat, truc = bdat, (ox, oy)
        else:
            truc = (bdat[0] + pt['at'][0], bdat[1] + pt['at'][1])
            dat = (truc[0] - pt['pivot'][0], truc[1] - pt['pivot'][1])
        tm, vai = bang[k]
        ds.append({'k': k, 'ten': tm, 'vai': vai, 'cha': None if k == 'body' else 'than', 'im': im, 'dat': list(dat), 'truc': list(truc), 'lop': lop[k]})
    # điểm chân: đáy thấp nhất của các mảnh, giữa theo bề ngang chân
    day = max(m['dat'][1] + m['im'].height for m in ds)
    chan = [m for m in ds if m['vai'].startswith('chan')] or ds
    gx = sum(m['truc'][0] for m in chan) / len(chan)
    if lat:  # lật ngang: mặt quay sang PHẢI
        trai = min(m['dat'][0] for m in ds)
        phai = max(m['dat'][0] + m['im'].width for m in ds)
        for m in ds:
            m['im'] = m['im'].transpose(Image.FLIP_LEFT_RIGHT)
            m['dat'][0] = trai + phai - (m['dat'][0] + m['im'].width)
            m['truc'][0] = trai + phai - m['truc'][0]
        gx = trai + phai - gx
    goc = [gx, day]
    # co nhỏ (Lanczos) cho tệp dưới TOI_DA
    for he_so in (0.5, 0.45, 0.4, 0.35, 0.3, 0.25):
        nho = [m['im'].resize((max(1, round(m['im'].width * he_so)), max(1, round(m['im'].height * he_so))), Image.LANCZOS) for m in ds]
        anh, o = xep(nho)
        manh = []
        for m, q, im in zip(ds, o, nho):
            manh.append({'ten': m['ten'], 'vai': m['vai'], 'cha': m['cha'], 'o': q,
                         'dat': [round(m['dat'][0] * he_so, 2), round(m['dat'][1] * he_so, 2)],
                         'truc': [round(m['truc'][0] * he_so, 2), round(m['truc'][1] * he_so, 2)], 'lop': m['lop']})
        tep = {'loai': 'linh-khi-rig', 'phien_ban': 1, 'ma': ma, 'ten': ten, 'doi_tuong': doi, 'thay_cho': thay_cho, 'khung': khung,
               'anh': png_b64(anh), 'cao': cao, 'goc': [round(goc[0] * he_so, 2), round(goc[1] * he_so, 2)], 'manh': manh,
               'dong_tac': {'idle': {'bien_do': 1, 'toc_do': 1}}}
        chu = json.dumps(tep, ensure_ascii=False, indent=1)
        if len(chu.encode('utf-8')) <= TOI_DA:
            break
    os.makedirs(RA, exist_ok=True)
    duong = os.path.join(RA, ma + '.rig.json')
    with open(duong, 'w', encoding='utf-8', newline='\n') as f:
        f.write(chu + '\n')
    print('%s: %d mảnh, co %.2f, ảnh %dx%d, %d KB' % (os.path.relpath(duong, REPO), len(manh), he_so, anh.width, anh.height, len(chu.encode('utf-8')) // 1024))


def main():
    tam = tempfile.mkdtemp(prefix='xuat_rig_')
    try:
        for d in MAU_RIG:
            lam(*d, tam=tam)
    finally:
        shutil.rmtree(tam, ignore_errors=True)


if __name__ == '__main__':
    main()
