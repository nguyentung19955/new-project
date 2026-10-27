#!/usr/bin/env python3
"""Ảnh cho trang thử Âm Đao cấp 1–4 (game/thu-p0a/am-dao.html) → game/thu-p0a/am-dao/
KHÔNG sửa ảnh nguồn, rig-v4, sheet hành động gốc hay demo.html: chỉ ĐỌC rồi ghi bản riêng vào am-dao/.

  am-dao-cap1.png            kiếm âm thoa cấp 1 cắt từ art/huong-moi/nguon/vu-khi/vu-khi-mau.png, nền trắng tách sạch (alpha), mũi chĩa PHẢI
  tay-truoc-am-dao.png       mảnh tay trước của rig-v4 với lưỡi âm thoa thay dao (nắm tay giữ nguyên, kiếm dưới nắm tay, kẻ viền tối như rig)
  lam-hanh-dong-am-dao-2x.*  sheet hành động dựng LẠI từ rig-v4 bằng đúng code art/modular/lam-moi/hanh-dong/code (tư thế + bảng tick y nguyên),
                             chỉ đổi mảnh tay trước → cùng tên khung, cùng cách neo. JSON thêm:
                               luoi[tên khung] = {goc:[x,y], mui:[x,y]}  chắn tay + mũi lưỡi (px logic so với chân, nhìn phải) → âm nhận vẽ bằng code
                               don.atk7 = chém vang (Dư Âm) dùng tư thế nhát 3, su/ac/re theo VK.amDao.kyNang.chem
  lam-chay-am-dao-2x.*       sheet chạy rig-v4 dựng lại cùng cách (ô + neo v3 giữ nguyên)
  vet-du-am-2x.png/.json     VFX Dư Âm 5 khung từ art/huong-moi/nguon/vu-khi/vet-du-am.png (nền đen giữ nguyên → game vẽ CỘNG SÁNG 'lighter')
Chạy: python3 -B game/thu-p0a/cong-cu/tao-asset-am-dao.py   (cần numpy, Pillow, scipy)"""
import os, sys, json, importlib
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(GOC, 'game', 'thu-p0a', 'am-dao'); os.makedirs(OUT, exist_ok=True)
NGUON = os.path.join(GOC, 'art', 'huong-moi', 'nguon', 'vu-khi')
HDC = os.path.join(GOC, 'art', 'modular', 'lam-moi', 'hanh-dong', 'code')
RIG4C = os.path.join(GOC, 'art', 'modular', 'lam-moi', 'rig-v4', 'code')

# ---- thông số (px THẾ GIỚI của rig: 9,56 px thế giới = 1 px logic) ----
LUOI_DAI = 150.0        # chắn tay → mũi lưỡi âm thoa (dao cũ: 220 = 23 px logic). Ngắn hơn để phần âm nhận (vẽ bằng code) lấp tới mép hộp 90
CHAN_X = 168.0          # tâm chắn tay trong ảnh mảnh tay-truoc-dao (vòng chắn dao cũ ở x 150–190)
TRUC_Y = 80.0           # trục lưỡi (DAO_MUI / DAO_CHUOI cũ: y 79–80)
HOP1 = [4, -97, 86, 48]  # hộp nhát 1 của Âm Đao (= VK_AM_DAO.don[1].box trong khoi-am-dao.js)
VIEN = 5                # viền tối quanh kiếm (px ảnh mảnh) – cho hợp nét rig


def cat_kiem():
    """cắt kiếm âm thoa, xoá nền trắng: lấp từ mép ảnh qua các điểm gần trắng, rồi alpha mềm ở mép (khử viền trắng)"""
    im = np.array(Image.open(os.path.join(NGUON, 'vu-khi-mau.png')).convert('RGB')).astype(np.float32)
    c = im[82:575, 826:992]                                   # vùng kiếm âm thoa (y, x) – bên trái là mép chuông của búa, cắt bỏ
    mn = c.min(axis=2); mx = c.max(axis=2)
    trang = (mn > 222) & (mx - mn < 26)
    nhan, _ = ndimage.label(trang)
    bien = set(np.unique(np.concatenate([nhan[0], nhan[-1], nhan[:, 0], nhan[:, -1]]))) - {0}
    nen = np.isin(nhan, list(bien))
    # khe giữa hai nhánh: nối với mép trên → đã nằm trong 'nen'. Alpha mềm 1 px quanh vật: theo độ trắng
    vat = ~nen
    vat = ndimage.binary_opening(vat, iterations=1)
    lab, n = ndimage.label(vat); sz = ndimage.sum(vat, lab, range(1, n + 1)); vat = lab == (1 + int(np.argmax(sz)))   # chỉ giữ khối lớn nhất
    vien = vat & ~ndimage.binary_erosion(vat, iterations=1)
    a = vat.astype(np.float32)
    w = np.clip((255 - mn) / (255 - 150), 0, 1)
    a[vien] = np.minimum(a[vien], w[vien])
    rgb = c.copy()
    m = (a > 0) & (a < 1)                                      # khử pha trắng ở mép: c = a·x + (1−a)·255
    rgb[m] = np.clip((c[m] - (1 - a[m, None]) * 255) / np.maximum(a[m, None], 1e-3), 0, 255)
    out = np.dstack([rgb, a * 255]).round().astype(np.uint8)
    out[out[..., 3] == 0] = 0
    k = Image.fromarray(out, 'RGBA')
    k = k.crop(k.getbbox())
    return k                                                    # mũi chĩa LÊN


def hang_chan(k):
    """hàng (y) giữa chắn tay = hàng có bề rộng alpha lớn nhất; hàng mũi = hàng trên cùng"""
    a = np.array(k)[..., 3] > 128
    rong = a.sum(axis=1)
    y = int(np.argmax(rong))
    ys = np.nonzero(rong > rong.max() * 0.9)[0]
    return y, int(ys.min()), int(ys.max())


def manh_tay(k):
    """mảnh tay trước mới: kiếm (chỉ chắn + lưỡi, bỏ chuôi/núm – nắm tay của rig đã có núm) xoay mũi sang phải, đặt dưới nắm tay"""
    tay = np.array(Image.open(os.path.join(GOC, 'art', 'modular', 'lam-moi', 'hanh-dong', 'manh-them', 'tay-truoc-khong-dao.png')).convert('RGBA'))
    yc, y0c, y1c = hang_chan(k)
    a = np.array(k)
    luoi = Image.fromarray(a[:y1c + 1 + 60], 'RGBA')           # từ mũi tới hết chắn tay + 60 px chuôi (nằm DƯỚI nắm tay, lấp khe chỗ cắt dao cũ)
    dai_nguon = yc                                             # mũi (hàng 0) → tâm chắn
    s = LUOI_DAI / dai_nguon
    luoi = luoi.resize((max(1, round(luoi.width * s)), max(1, round(luoi.height * s))), Image.LANCZOS)
    luoi = luoi.rotate(-90, expand=True, resample=Image.BICUBIC)   # mũi sang PHẢI
    L = np.array(luoi)
    # viền tối như nét rig
    al = L[..., 3] > 60
    kin = ndimage.binary_closing(al, iterations=6)             # lấp khe giữa hai nhánh để viền KHÔNG lấp khe (khe giữ trong suốt)
    to = ndimage.binary_dilation(kin, iterations=VIEN) & ~(kin & ~al)
    H, W = tay.shape[:2]
    can = np.zeros((max(H, 200), max(W, 420), 4), np.uint8)
    # vị trí: tâm chắn (cột = (y1c - yc)·s tính từ trái của ảnh đã xoay) trùng CHAN_X; trục giữa ảnh trùng TRUC_Y
    cx = (y1c + 60 - yc) * s
    ox = int(round(CHAN_X - cx)); oy = int(round(TRUC_Y - L.shape[0] / 2))
    vien = np.zeros_like(can); hv = to & ~al
    sl = (slice(oy, oy + L.shape[0]), slice(ox, ox + L.shape[1]))
    vien[sl][to] = (6, 4, 3, 255)
    def de(dst, src):
        sa = src[..., 3:4] / 255.0
        dst[..., :3] = (src[..., :3] * sa + dst[..., :3] * (1 - sa)).round()
        dst[..., 3] = np.maximum(dst[..., 3], src[..., 3])
    out = can.astype(np.float32)
    de(out, vien.astype(np.float32))
    tmp = np.zeros_like(out); tmp[sl] = L
    de(out, tmp)
    tmp = np.zeros_like(out); tmp[:H, :W] = tay
    de(out, tmp)
    out = out.round().astype(np.uint8); out[out[..., 3] == 0] = 0
    out = out[:H, :max(W, ox + L.shape[1] + VIEN + 2)]
    mui = (ox + L.shape[1] - 1.0, TRUC_Y)
    chan = (CHAN_X, TRUC_Y)
    return Image.fromarray(out, 'RGBA'), mui, chan, (ox, oy, L.shape[1], L.shape[0])


def vet_du_am():
    """5 khung VFX nền đen → cắt theo độ sáng, thu nhỏ; giữ nền đen (game vẽ globalCompositeOperation 'lighter')"""
    im = Image.open(os.path.join(NGUON, 'vet-du-am.png')).convert('RGB')
    a = np.array(im).astype(np.float32); sang = a.max(axis=2)
    # 5 khung xếp đều theo chiều ngang: chia 5 ô bằng nhau rồi cắt sát theo độ sáng trong từng ô
    Wn = sang.shape[1]; gop = []
    for i in range(5):
        c0, c1 = Wn * i // 5, Wn * (i + 1) // 5
        xs = np.nonzero(sang[:, c0:c1].max(axis=0) > 40)[0]
        gop.append([c0 + int(xs.min()), c0 + int(xs.max()) + 1])
    K = 0.5                                   # thu nhỏ: ảnh nguồn ~380 px/khung → ~190 px sheet (= ~95 px logic ở k 1)
    tiles, frames = [], []
    x = 2
    for i, (c0, c1) in enumerate(gop):
        sub = sang[:, c0:c1]; ys = np.nonzero(sub.max(axis=1) > 40)[0]
        y0, y1 = int(ys.min()), int(ys.max()) + 1
        t = im.crop((max(0, c0 - 6), max(0, y0 - 6), min(Wn, c1 + 6), min(sang.shape[0], y1 + 6)))
        t = t.resize((round(t.width * K), round(t.height * K)), Image.LANCZOS)
        tiles.append(t)
        frames.append({'i': i, 'x': x, 'y': 2, 'w': t.width, 'h': t.height, 'ax': t.width // 2, 'ay': t.height // 2})
        x += t.width + 4
    W = x; Hh = max(t.height for t in tiles) + 4
    sh = Image.new('RGB', (W, Hh), (0, 0, 0))
    for t, f in zip(tiles, frames): sh.paste(t, (f['x'], f['y']))
    sh.save(os.path.join(OUT, 'vet-du-am-2x.png'), optimize=True)
    meta = {'anh': 'vet-du-am-2x.png', 'co': [W, Hh], 'cach_ve': "nền đen → ctx.globalCompositeOperation='lighter' (cộng sáng); neo = tâm khung",
            'khung': ['vet-moi', 'treo-gon', 'mo-vong-am', 'bung-vong', 'tan-hat'], 'frames': frames,
            'nguon': 'art/huong-moi/nguon/vu-khi/vet-du-am.png (5 khung, ×0,5)'}
    json.dump(meta, open(os.path.join(OUT, 'vet-du-am-2x.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('vet-du-am: %d khung, sheet %d×%d' % (len(frames), W, Hh))


def dung_sheet(manh, mui, chan, KYNANG):
    sys.path.insert(0, HDC); sys.path.insert(0, RIG4C)
    import chung_hd, dung_hd
    # mảnh tay trước mới + mũi / chắn mới (không ghi gì vào art/: _tao_manh_them chỉ ghi lại đúng 2 ảnh cũ – kiểm git status)
    chung_hd.RIG['nut']['tay-truoc-dao']['anh'] = manh
    chung_hd.DAO_MUI = mui; chung_hd.DAO_CHUOI = chan
    dung_hd.SPRITE = OUT
    dung_hd.kiem_game = lambda: print('(bỏ kiểm demo.html: sheet riêng cho trang thử, su/ac/re vẫn lấy từ anim_hd.py = demo.html)')
    # dao văng khi chết = kiếm âm thoa
    d = os.path.join(OUT, '_tam'); os.makedirs(d, exist_ok=True)
    a = np.array(Image.open(manh).convert('RGBA')); a[:, :144] = 0
    Image.fromarray(a, 'RGBA').save(os.path.join(d, 'dao.png'))
    dung_hd.MANH_THEM = d
    dung_hd.main()
    os.replace(os.path.join(OUT, 'lam-hanh-dong-2x.png'), os.path.join(OUT, 'lam-hanh-dong-am-dao-2x.png'))
    p = os.path.join(OUT, 'lam-hanh-dong-2x.json'); meta = json.load(open(p, encoding='utf-8')); os.remove(p)
    meta['anh'] = 'lam-hanh-dong-am-dao-2x.png'
    meta['ten'] = 'Lam cầm ÂM ĐAO cấp 1 (rig-v4, chỉ đổi mảnh tay trước) – trang thử am-dao.html'
    meta['nguon'] += ' · game/thu-p0a/cong-cu/tao-asset-am-dao.py thay mảnh tay trước bằng am-dao/tay-truoc-am-dao.png'
    # mũi + chắn lưỡi mỗi khung (px logic so với chân, nhìn phải)
    luoi = {}
    for f in meta['frames']:
        if f['ten'] == 'dao-roi': continue
        (mx, my), (cx, cy) = chung_hd.dao(dung_hd.tu_the(f['ten']))
        luoi[f['ten']] = {'goc': [round(cx, 1), round(cy, 1)], 'mui': [round(mx, 1), round(my, 1)]}
    meta['luoi'] = luoi
    # Âm Đao: hộp nhát 1 mép trước 95 → 90 (KHVK 2d) – game kiểm hop_don = ATK[1].box
    meta['don']['atk1']['hop_don'] = HOP1
    # chém vang (Dư Âm) = tư thế nhát 3, bảng tick riêng (tổng su+ac+re−1, khung trúng đúng tick su)
    su, ac, re_ = KYNANG['su'], KYNANG['ac'], KYNANG['re']
    pb = [['c3-chuanbi', 1], ['c3-giuong', 3], ['c3-vung', 1], ['c3-trung', 3], ['c3-trung2', 7], ['c3-thu', 7], ['c3-ve', 5]]
    assert sum(n for _, n in pb) == su + ac + re_ - 1 and sum(n for _, n in pb[:3]) == su - 1
    bang, tt = [], []
    for ten, n in pb: bang += [meta['tu_the'][ten]] * n; tt += [ten] * n
    v3 = dict(meta['don']['atk3']['vet_chem'])
    meta['don']['atk7'] = {'atk': 7, 'su': su, 'ac': ac, 're': re_, 'hop_don': KYNANG['box'], 'khung_theo_atkT': bang, 'tu_the_theo_atkT': tt,
                           'vet_chem': dict(v3, bat_dau=su, k=round(v3['k'] * 1.15, 3)), 'phan_bo': ' '.join('%s×%d' % (a, b) for a, b in pb),
                           'ghi_chu': 'chém vang Dư Âm: CHƯA có clip mới (KHVK mục 10) – dùng tư thế nhát 3'}
    json.dump(meta, open(os.path.join(OUT, 'lam-hanh-dong-am-dao-2x.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for t in ('atk1', 'atk2', 'atk3', 'atk5', 'atk6'):
        k = meta['khop_hop_don'][t]
        print('  %s: mũi âm thoa lúc hộp bật %s' % (t, sorted({tuple(m['mui_dao']) for m in k['mui_dao_moi_buoc_hop_bat']})))
    # sheet chạy
    import sprite, chung
    doc = chung.load_json(); doc['rig']['nut']['tay-truoc-dao']['anh'] = manh
    sprite.SPRITE = OUT
    sprite.main(doc)
    os.replace(os.path.join(OUT, 'lam-chay-2x.png'), os.path.join(OUT, 'lam-chay-am-dao-2x.png'))
    p = os.path.join(OUT, 'lam-chay-2x.json'); m2 = json.load(open(p, encoding='utf-8')); os.remove(p)
    m2['anh'] = 'lam-chay-am-dao-2x.png'
    json.dump(m2, open(os.path.join(OUT, 'lam-chay-am-dao-2x.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    import shutil; shutil.rmtree(d, ignore_errors=True)
    for f in ('kiem-sheet-ghep.gif', 'kiem-sheet-ghep-112px-x4.gif', 'kiem-sheet-luoi.png'):   # ảnh kiểm của sprite.py – không cần cho trang thử
        if os.path.exists(os.path.join(OUT, f)): os.remove(os.path.join(OUT, f))


def main():
    k = cat_kiem()
    k.rotate(-90, expand=True).save(os.path.join(OUT, 'am-dao-cap1.png'), optimize=True)
    print('am-dao-cap1.png', k.size)
    sys.path.insert(0, HDC); sys.path.insert(0, RIG4C)
    m, mui, chan, o = manh_tay(k)
    p = os.path.join(OUT, 'tay-truoc-am-dao.png'); m.save(p, optimize=True)
    print('tay-truoc-am-dao.png', m.size, 'mũi', mui, 'chắn', chan)
    vet_du_am()
    if '--khong-sheet' not in sys.argv:
        KY = json.loads(sys.argv[sys.argv.index('--ky') + 1]) if '--ky' in sys.argv else {'su': 6, 'ac': 8, 're': 14, 'box': [-13, -66, 103, 66]}
        dung_sheet(p, mui, chan, KY)


if __name__ == '__main__':
    main()
