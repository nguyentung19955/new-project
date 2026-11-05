"""Dựng bộ HUD PixelLab (05/11/2026) — CHỈ CẮT, không vẽ / vá điểm ảnh.

  python3 docs/review/ke-hoach-cai-thien/pixellab-hud/dung_hud_pl.py

Đọc ảnh gốc PixelLab đã chọn ở docs/anh-goc/pixellab-hud/<mã cũ>.png (ảnh ra của edit-image-pixen, khung đã đệm lên bội số 4),
cắt bỏ phần đệm (chon.json: ox, oy, rộng, cao theo điểm ảnh thật), với khung thanh / khung 9 mảnh thì giữ đúng hình bóng ảnh cũ
(điểm nào ở ảnh cũ trong suốt thì ở ảnh mới cũng trong suốt: lòng khung để game tự tô thanh máu, lề 9 mảnh y như cũ),
rồi ghi game/art/custom/gd-pl-<tên>.sprite.json cùng rong / cao / net / vien với ảnh cũ gd-<tên>.
"""
import base64, io, json, os
from PIL import Image

GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..'))
ANH = os.path.join(GOC, 'docs', 'anh-goc', 'pixellab-hud')
CUS = os.path.join(GOC, 'game', 'art', 'custom')
GIU = ('rong', 'cao', 'net', 'vien', 'lap_canh', 'so', 'khung_cao', 'dai')


def doc_cu(ma):
    d = json.load(open(os.path.join(CUS, ma + '.sprite.json'), encoding='utf-8'))
    im = Image.open(io.BytesIO(base64.b64decode(d['anh'].split(',', 1)[1]))).convert('RGBA')
    return d, im


def main():
    chon = json.load(open(os.path.join(ANH, 'chon.json'), encoding='utf-8'))
    for ma, c in sorted(chon.items()):
        d, cu = doc_cu(ma)
        moi = Image.open(os.path.join(ANH, ma + '.png')).convert('RGBA')
        ox, oy, w, h = c['cat']
        moi = moi.crop((ox, oy, ox + w, oy + h))
        assert moi.size == cu.size, (ma, moi.size, cu.size)
        px = moi.load(); pc = cu.load()
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                a = 255 if a >= 128 else 0  # PixelLab đôi khi trả điểm nửa trong: cắt về 0 / 255 (không đổi màu)
                if c.get('giu_hinh') and pc[x, y][3] == 0:
                    a = 0  # khung: giữ đúng hình bóng ảnh cũ (lòng + mép 9 mảnh)
                px[x, y] = (r, g, b, a) if a else (0, 0, 0, 0)
        b = io.BytesIO(); moi.save(b, 'PNG', optimize=True)
        tep = {'loai': 'linh-khi-sprite', 'phien_ban': 1, 'ma': 'gd-pl-' + ma[3:], 'ten': d.get('ten', ma) + ' (PixelLab)', 'doi_tuong': 'giao-dien'}
        for k in GIU:
            if k in d:
                tep[k] = d[k]
        tep['nguon'] = 'PixelLab edit-image-pixen seed %s · docs/anh-goc/pixellab-hud/%s.png · docs/review/ke-hoach-cai-thien/pixellab-hud/dung_hud_pl.py' % (c['seed'], ma)
        tep['anh'] = 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode()
        ra = os.path.join(CUS, 'gd-pl-' + ma[3:] + '.sprite.json')
        with open(ra, 'w', encoding='utf-8') as f:
            json.dump(tep, f, ensure_ascii=False)
        print('%-28s %3dx%-3d -> %s (%d B)' % (ma, w, h, os.path.basename(ra), os.path.getsize(ra)))


if __name__ == '__main__':
    main()
