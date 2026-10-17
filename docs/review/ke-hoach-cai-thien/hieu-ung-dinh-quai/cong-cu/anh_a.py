"""Ảnh lưới (×3) các trường hợp lệch + GIF ca tiêu biểu (phần A). Chạy từ gốc repo:
  python3 docs/review/ke-hoach-cai-thien/hieu-ung-dinh-quai/cong-cu/anh_a.py [thư-mục-ra=anh/truoc] [tham-số-url]"""
import sys, os, io, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dq_common import *
from PIL import Image, ImageDraw, ImageFont
FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)

RA = os.path.join(OUT, sys.argv[1] if len(sys.argv) > 1 else 'anh/truoc')
EXTRA = sys.argv[2] if len(sys.argv) > 2 else ''
os.makedirs(RA, exist_ok=True)


def img(u): return Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB')


def luoi(ds, ten, tieu_de, cot=4):
    ds = [(t, im) for t, im in ds if im is not None]
    if not ds: return
    W = max(im.width for _, im in ds); H = max(im.height for _, im in ds) + 16
    hang = (len(ds) + cot - 1) // cot
    o = Image.new('RGB', (min(cot, len(ds)) * (W + 6) + 6, hang * (H + 6) + 26), (18, 18, 22))
    d = ImageDraw.Draw(o); d.text((6, 6), tieu_de, fill=(255, 255, 255), font=FONT)
    for i, (t, im) in enumerate(ds):
        x = 6 + (i % cot) * (W + 6); y = 26 + (i // cot) * (H + 6)
        o.paste(im, (x, y + 16)); d.text((x, y + 1), t, fill=(255, 230, 120), font=FONT)
    o.save(os.path.join(RA, ten + '.png'))
    print('ảnh', ten, len(ds), flush=True)


def main():
    with sync_playwright() as pw:
        b, pg, errs = open_game(pw, EXTRA)
        pg.evaluate("DQ.CHUP = (api) => true")
        q = lambda i: "DQ.roster().find(x => x.id === '%s')" % i

        def trung(i, don, api=None, lay=0):
            r = pg.evaluate("([t]) => DQ.danh(%s, t, -1)" % q(i), [don])
            a = []
            for x in (r or {}).get('list', []):
                a += x.get('anh', [])
            return img(a[lay]) if len(a) > lay else None
        luoi([(i + ' · kiếm nhát 1', trung(i, 'kiem')) for i in ['moc', 'ngu', 'ho', 'thuong', 'namChua', 'caTre', 'heoCon', 'cuaTuong']],
             '1-hinh-trung-kiem', 'Hình trúng kiếm (khung xanh = thân; khung chấm = vùng đúng, bỏ 1/5 dưới chân; dấu đỏ = tâm hình trúng)')
        luoi([(i + ' · ' + d, trung(i, d)) for i in ['heoCon', 'ongVo', 'cuaTuong', 'moc'] for d in ['chuong_hoa', 'chuong_doc']],
             '2-chuong-no', 'Hỏa chưởng / Độc chưởng trúng quái: hình nổ / vòng độc')
        luoi([(i + ' · ' + d, trung(i, d)) for i in ['moc', 'ho', 'ngu'] for d in ['phitieu', 'db_thuong', 'chuong_bang']], '3-trum-phi-tieu-phi-thuong', 'Trùm vùng: phi tiêu, Phi Thương, Băng chưởng')
        def so(i):
            u = pg.evaluate("() => DQ.anhSo(%s)" % q(i))
            return img(u) if u else None
        luoi([(i, so(i)) for i in ['heoCon', 'ongVo', 'caChuon', 'denLong', 'diaTrau', 'moc', 'ngu', 'thuong', 'namChua']],
             '4-so-sat-thuong', 'Số sát thương (ô vàng = chỗ số mọc ra)')
        luoi([(i + ' · ' + t, img(pg.evaluate("([t]) => DQ.anhTT(%s, t, -1, false)" % q(i), [t]))) for i in ['moc', 'ngu', 'ho', 'thuong'] for t in ['chay', 'doc', 'dongbang']],
             '5-trang-thai-tren-trum', 'Trạng thái trên trùm vùng (cháy, độc, đóng băng)')
        luoi([(i + ' · choáng', img(pg.evaluate("([t]) => DQ.anhTT(%s, t, -1, false)" % q(i), ['choang']))) for i in ['heoCon', 'ongVo', 'caChuon', 'denLong', 'echPhinh', 'namChua', 'cuaTuong', 'caTre']],
             '6-sao-choang', 'Sao choáng trên đầu')
        luoi([(i + ' · ' + t + ' · bị hất', img(pg.evaluate("([t]) => DQ.anhTT(%s, t, -1, true)" % q(i), [t]))) for i in ['heoCon', 'cua', 'linhMa'] for t in ['chay', 'doc', 'bang', 'choang']],
             '7-bi-hat-tung', 'Bị hất tung (Địa Chấn): khung xanh = chỗ thân khi nhấc 10 điểm; hình trạng thái ở lại dưới đất')
        luoi([(i + ' · ' + t, img(pg.evaluate("([t]) => DQ.anhTT(%s, t, -1, false)" % q(i), [t]))) for i in ['heoCon', 'nhim', 'caNoc', 'huLua'] for t in ['chay', 'doc', 'bang']],
             '8-quai-nho', 'Quái nhỏ: hình trạng thái có trùm lấp thân không')
        # GIF
        for ten, i, t, kieu, n in [('gif-1-chay-bi-hat', 'heoCon', 'chay', 'hat', 14), ('gif-2-choang-ong', 'ongVo', 'choang', None, 10), ('gif-3-chay-trum', 'moc', 'chay', 'di', 12)]:
            fs = [img(u) for u in pg.evaluate("([t, k, n]) => DQ.khungGif(%s, t, n, k)" % q(i), [t, kieu, n])]
            fs[0].save(os.path.join(RA, ten + '.gif'), save_all=True, append_images=fs[1:], duration=90, loop=0)
            print('gif', ten, flush=True)
        r = pg.evaluate("() => { DQ.CHUP = () => true; const x = DQ.danh(%s, 'kiem', -1); return x.list.flatMap(a => a.anh || []); }" % q('moc'))
        fs = [img(u) for u in r]
        if fs:
            W = max(f.width for f in fs); H = max(f.height for f in fs)
            fs = [Image.new('RGB', (W, H), (18, 18, 22)) for _ in []] or [f.resize((W, H)) for f in fs]
            fs[0].save(os.path.join(RA, 'gif-4-kiem-trum.gif'), save_all=True, append_images=fs[1:], duration=400, loop=0)
        print('lỗi JS:', len(errs))
        b.close()


if __name__ == '__main__':
    main()
