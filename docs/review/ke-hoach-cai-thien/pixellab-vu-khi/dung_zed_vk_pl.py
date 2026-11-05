#!/usr/bin/env python3
"""Ghép ảnh vũ khí PixelLab (bản THỬ ?vkpl=1) thành 3 tấm game/art/custom/zed-vk-pl.sprite.json, zed-vk-pl-he.sprite.json, zed-vk-pl-gan.sprite.json.

Nguồn: docs/anh-goc/zed/pixellab-vk/<loại>_<cấp>.png (Trắng..Thức tỉnh) <loại>_<hệ>_<cấp>.png (cấp 1..3) và <loại>_gan_<cấp>.png (cấp 0..2), do PixelLab vẽ
(edit-image-pixen sửa từ ô ảnh cũ, cùng rộng × cao). Mã này CHỈ kiểm cỡ, xếp ô và đo khung đầu kiếm (mui_kv) — không vẽ / vá điểm ảnh.
Mỗi ô PHẢI cùng rộng × cao với ô đang dùng của zed-vk (kiếm = ô kiếm vuông 'kiem_vuong') → js/vien_vk.js dán đè đúng ô, neo giữ nguyên.
"""
import base64, io, json, os, sys
from PIL import Image

GOC = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
NGUON = os.path.join(GOC, 'docs', 'anh-goc', 'zed', 'pixellab-vk')
CUSTOM = os.path.join(GOC, 'game', 'art', 'custom')
LOAI = ['kiem', 'thuong', 'bua', 'phitieu']
HE = ['fire', 'poison', 'ice']


def o_cu():
    vk = json.load(open(os.path.join(CUSTOM, 'zed-vk.sprite.json'), encoding='utf-8'))
    return {l: [tuple(r[2:]) for r in (vk['kiem_vuong']['vk'] if l == 'kiem' else vk['vk'][l])] for l in LOAI}


def mui(im, rong):
    """[y trên, y dưới) các điểm ảnh đục ở `rong` cột cuối bên phải (phía mũi) — js/zed_moi.js chặn đất theo khung này."""
    a = im.getchannel('A').point(lambda v: 255 if v > 90 else 0)
    bb = a.getbbox()
    if not bb:
        return None
    x0 = max(0, bb[2] - rong)
    b2 = a.crop((x0, 0, im.width, im.height)).getbbox()
    return [b2[1], b2[3]]


def tam(o_list):
    """o_list: [(khoá, ảnh)] theo hàng (mỗi hàng một danh sách). Trả (ảnh tấm, {khoá: [x, y, w, h]})."""
    W = max(sum(i.width + 2 for _, i in h) for h in o_list)
    H = sum(max(i.height for _, i in h) + 2 for h in o_list)
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    o, y = {}, 0
    for h in o_list:
        x = 0
        for k, i in h:
            c.paste(i, (x, y))
            o[k] = [x, y, i.width, i.height]
            x += i.width + 2
        y += max(i.height for _, i in h) + 2
    return c, o


def b64(im):
    b = io.BytesIO()
    im.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()


def mo(ten, can):
    im = Image.open(os.path.join(NGUON, ten)).convert('RGBA')
    if im.size != can:
        sys.exit('%s: cỡ %s khác ô cũ %s' % (ten, im.size, can))
    return im


def main():
    cu = o_cu()
    hang = [[('%s_%d' % (l, c), mo('%s_%d.png' % (l, c), cu[l][c])) for c in range(4)] for l in LOAI]
    img, o = tam(hang)
    vk = {l: [o['%s_%d' % (l, c)] for c in range(4)] for l in LOAI}
    anh = {k: i for h in hang for k, i in h}
    tep = {'loai': 'linh-khi-sprite', 'doi_tuong': 'zed', 'ma': 'zed-vk-pl', 'phien_ban': 1,
           'ten': 'Vũ khí PixelLab (bản thử ?vkpl=1): kiếm / thương / búa / phi tiêu × 4 hình thái',
           'tam': b64(img), 'vk': vk, 'mui_kv': [mui(anh['kiem_%d' % c], 3) for c in range(4)],
           'ghi_chu': 'vk[loại][cấp] = [x, y, rộng, cao], cùng cỡ ô zed-vk (kiếm = ô kiếm vuông); mui_kv[cấp] = [y trên, y dưới) 3 cột đầu mũi kiếm. '
                      'js/vien_vk.js (?vkpl=1) dán đè lên tấm zed-vk. Dựng: docs/review/ke-hoach-cai-thien/pixellab-vu-khi/dung_zed_vk_pl.py'}
    hang2 = [[('%s_%s_%d' % (l, e, c), mo('%s_%s_%d.png' % (l, e, c), cu[l][c])) for c in (1, 2, 3)] for l in LOAI for e in HE]
    img2, o2 = tam(hang2)
    anh2 = {k: i for h in hang2 for k, i in h}
    vk2 = {l: {e: [None] + [o2['%s_%s_%d' % (l, e, c)] for c in (1, 2, 3)] for e in HE} for l in LOAI}
    tep2 = {'loai': 'linh-khi-sprite', 'doi_tuong': 'zed', 'ma': 'zed-vk-pl-he', 'phien_ban': 1,
            'ten': 'Vũ khí PixelLab theo hệ (bản thử ?vkpl=1): 4 loại × Lửa/Độc/Băng × Mầm/Thành hình/Thức tỉnh',
            'tam': b64(img2), 'vk': vk2,
            'mui_kv': {e: [None] + [mui(anh2['kiem_%s_%d' % (e, c)], 8) for c in (1, 2, 3)] for e in HE},
            'ghi_chu': 'vk[loại][hệ][cấp] = [x, y, rộng, cao] (cấp 0 null), cùng cỡ ô zed-vk-he; mui_kv[hệ][cấp]: 8 cột phía mũi kiếm. '
                       'js/vien_vk.js (?vkpl=1) dán đè lên tấm zed-vk-he. Dựng: docs/review/ke-hoach-cai-thien/pixellab-vu-khi/dung_zed_vk_pl.py'}
    # ảnh "gân" tiến độ (Trắng / Mầm / Thành hình): <loại>_gan_<cấp>.png, dán đè zed-vk-gan (js/vien_vk.js)
    hang3 = [[('%s_gan_%d' % (l, c), mo('%s_gan_%d.png' % (l, c), cu[l][c])) for c in (0, 1, 2)] for l in LOAI]
    img3, o3 = tam(hang3)
    tep3 = {'loai': 'linh-khi-sprite', 'doi_tuong': 'zed', 'ma': 'zed-vk-pl-gan', 'phien_ban': 1,
            'ten': 'Vũ khí PixelLab có gân tiến độ (bản thử ?vkpl=1): Trắng / Mầm / Thành hình',
            'tam': b64(img3), 'vk': {l: [o3['%s_gan_%d' % (l, c)] for c in (0, 1, 2)] + [None] for l in LOAI},
            'ghi_chu': 'vk[loại][cấp] = [x, y, rộng, cao] hoặc null, cùng cỡ ô zed-vk (kiếm = ô kiếm vuông); js/vien_vk.js (?vkpl=1) dán đè lên tấm zed-vk-gan '
                       '(ô nào tấm cũ có mới dùng). Dựng: docs/review/ke-hoach-cai-thien/pixellab-vu-khi/dung_zed_vk_pl.py'}
    for t in (tep, tep2, tep3):
        p = os.path.join(CUSTOM, t['ma'] + '.sprite.json')
        with open(p, 'w', encoding='utf-8') as f:
            json.dump(t, f, ensure_ascii=False, separators=(',', ':'))
        print('%s: %d KB' % (os.path.relpath(p, GOC), os.path.getsize(p) // 1024))


if __name__ == '__main__':
    main()
