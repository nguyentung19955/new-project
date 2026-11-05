#!/usr/bin/env python3
"""F4 bước A (05/11, chủ game: "Có dùng pixellab"): VŨ KHÍ PIXELLAB THÀNH MẶC ĐỊNH — "nướng" sẵn ô PixelLab vào tấm vũ khí.

Trước (?vkpl=1, js/vien_vk.js): lúc chạy game chép tấm cũ ra canvas rồi dán ô PixelLab đè đúng ô cũ. Nay làm việc đó MỘT LẦN ở đây
(Pillow, chỉ cắt + dán ô nguyên vẹn, không vẽ / vá điểm ảnh), ghi thẳng vào:
  game/art/custom/zed-vk.sprite.json      (thuong / bua / phitieu: "tam"; kiếm: "kiem_vuong.tam" + "kiem_vuong.mui" = mui_kv PixelLab)
  game/art/custom/zed-vk-he.sprite.json   (vk.kiem_vuong / thuong / bua / phitieu [hệ][cấp]; "mui_kv" = mui_kv PixelLab)
  game/art/custom/zed-vk-gan.sprite.json  (vk.kiem_vuong / thuong / bua / phitieu [cấp], chỉ ô tấm cũ có)
Tấm ChatGPT cũ giữ nguyên vẹn ở game/art/custom/<mã>-vkcu.sprite.json (mục "vk_cu_cua": <mã>) — chỉ bản web, chỉ tải khi ?vkpl=0,
KHÔNG tính vào tải đầu (game/build.py) — và ảnh PNG ở docs/anh-goc/zed/vk-chatgpt-cu/. Ba tấm PixelLab (zed-vk-pl*) chuyển sang
docs/anh-goc/zed/pixellab-vk/tam/ (nguồn của lần nướng này), không còn trong bản dựng.
Ô lệch cỡ → dừng (không bao giờ dán lệch). Chạy lại được: đọc tấm cũ từ <mã>-vkcu nếu đã có.
  python3 docs/review/ke-hoach-cai-thien/on-dinh-f4-chia-anh/cong-cu/nuong_vk_pl.py [--kiem]   (--kiem: chỉ soát, không ghi)
"""
import base64, copy, io, json, os, shutil, sys
from PIL import Image

GOC = os.path.abspath(os.path.join(os.path.dirname(__file__), *['..'] * 5))
CUSTOM = os.path.join(GOC, 'game', 'art', 'custom')
PL_DIR = os.path.join(GOC, 'docs', 'anh-goc', 'zed', 'pixellab-vk', 'tam')
CU_DIR = os.path.join(GOC, 'docs', 'anh-goc', 'zed', 'vk-chatgpt-cu')
LOAI3 = ['thuong', 'bua', 'phitieu']


def doc(p):
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def ghi(p, d):
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')


def anh(s):
    return Image.open(io.BytesIO(base64.b64decode(s.split(',', 1)[1]))).convert('RGBA')


def b64(im):
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode('ascii')


def dan(im, pl, o, r, dem, ten):
    """Thay ĐÚNG ô o (tấm cũ) bằng ô r (tấm PixelLab), cả kênh alpha (= clearRect + drawImage của bản chạy ?vkpl=1)."""
    if not o or not r:
        return
    if o[2] != r[2] or o[3] != r[3]:
        sys.exit('LỆCH CỠ %s: ô cũ %s ≠ ô PixelLab %s' % (ten, o, r))
    im.paste(pl.crop((r[0], r[1], r[0] + r[2], r[1] + r[3])), (o[0], o[1]))
    dem.append((ten, tuple(o), tuple(r)))


def main():
    chi_kiem = '--kiem' in sys.argv
    os.makedirs(PL_DIR, exist_ok=True); os.makedirs(CU_DIR, exist_ok=True)
    def lay_pl(ma):
        p = os.path.join(CUSTOM, ma + '.sprite.json')
        q = os.path.join(PL_DIR, ma + '.sprite.json')
        if os.path.isfile(p) and not chi_kiem:
            shutil.copyfile(p, q)
        return doc(q if os.path.isfile(q) else p)
    def lay_cu(ma):
        p = os.path.join(CUSTOM, ma + '-vkcu.sprite.json')
        if os.path.isfile(p):
            d = doc(p); d['ma'] = ma; d.pop('vk_cu_cua', None); return d
        return doc(os.path.join(CUSTOM, ma + '.sprite.json'))
    P, PE, PN = lay_pl('zed-vk-pl'), lay_pl('zed-vk-pl-he'), lay_pl('zed-vk-pl-gan')
    V, E, N = lay_cu('zed-vk'), lay_cu('zed-vk-he'), lay_cu('zed-vk-gan')
    pl, ple, pln = anh(P['tam']), anh(PE['tam']), anh(PN['tam'])
    dem = []
    # 1) zed-vk: thương / búa / phi tiêu trên tấm chính; kiếm = ô kiếm vuông (tấm phụ kiem_vuong.tam)
    v2 = copy.deepcopy(V); im = anh(V['tam']); kv = anh(V['kiem_vuong']['tam'])
    for l in LOAI3:
        for cap in range(4):
            dan(im, pl, V['vk'][l][cap], P['vk'][l][cap], dem, 'zed-vk %s %d' % (l, cap))
    for cap in range(4):
        dan(kv, pl, V['kiem_vuong']['vk'][cap], P['vk']['kiem'][cap], dem, 'zed-vk kiem_vuong %d' % cap)
    v2['tam'] = b64(im); v2['kiem_vuong'] = dict(V['kiem_vuong'], tam=b64(kv), mui=P['mui_kv'])
    # 2) zed-vk-he
    e2 = copy.deepcopy(E); ie = anh(E['tam'])
    for l in ['kiem'] + LOAI3:
        k = 'kiem_vuong' if l == 'kiem' else l
        for he, ds in PE['vk'][l].items():
            for cap, r in enumerate(ds):
                o = (E['vk'].get(k) or {}).get(he)
                dan(ie, ple, o[cap] if o else None, r, dem, 'zed-vk-he %s %s %d' % (k, he, cap))
    e2['tam'] = b64(ie); e2['mui_kv'] = PE['mui_kv']
    # 3) zed-vk-gan
    n2 = copy.deepcopy(N); ig = anh(N['tam'])
    for l in ['kiem'] + LOAI3:
        k = 'kiem_vuong' if l == 'kiem' else l
        for cap, r in enumerate(PN['vk'][l]):
            o = N['vk'].get(k)
            dan(ig, pln, o[cap] if o else None, r, dem, 'zed-vk-gan %s %d' % (k, cap))
    n2['tam'] = b64(ig)
    print('Đã dán %d ô PixelLab (zed-vk %d, zed-vk-he %d, zed-vk-gan %d)' % (len(dem), sum(1 for d in dem if d[0].startswith('zed-vk ')),
          sum(1 for d in dem if d[0].startswith('zed-vk-he')), sum(1 for d in dem if d[0].startswith('zed-vk-gan'))))
    if chi_kiem:
        return
    GHI = '05/11 F4 (on-dinh-f4-chia-anh): vũ khí PixelLab NƯỚNG SẴN vào tấm (mặc định). Tấm ChatGPT cũ: <mã>-vkcu (?vkpl=0).'
    for d, ten in ((v2, 'zed-vk'), (e2, 'zed-vk-he'), (n2, 'zed-vk-gan')):
        d['ghi_chu_pl'] = GHI
        d['vk_moi'] = True
        ghi(os.path.join(CUSTOM, ten + '.sprite.json'), d)
    for d, ten in ((V, 'zed-vk'), (E, 'zed-vk-he'), (N, 'zed-vk-gan')):
        cu = dict(d, ma=ten + '-vkcu', vk_cu_cua=ten, ten='(CŨ ChatGPT, chỉ ?vkpl=0) ' + str(d.get('ten', '')))
        cu.pop('vk_moi', None); cu.pop('ghi_chu_pl', None)
        ghi(os.path.join(CUSTOM, ten + '-vkcu.sprite.json'), cu)
        anh(d['tam']).save(os.path.join(CU_DIR, ten + '.png'))
        if ten == 'zed-vk':
            anh(d['kiem_vuong']['tam']).save(os.path.join(CU_DIR, 'zed-vk-kiem-vuong.png'))
    for ma in ('zed-vk-pl', 'zed-vk-pl-he', 'zed-vk-pl-gan'):
        p = os.path.join(CUSTOM, ma + '.sprite.json')
        if os.path.isfile(p):
            os.remove(p)
    print('Ghi xong: zed-vk / zed-vk-he / zed-vk-gan (PixelLab), <mã>-vkcu (cũ), ảnh cũ ở', os.path.relpath(CU_DIR, GOC))


if __name__ == '__main__':
    main()
