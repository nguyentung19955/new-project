#!/usr/bin/env python3
"""DỰNG BỘ ZED MỚI CHO GAME (tích hợp 13/10/2026 — docs/review/ke-hoach-cai-thien/zed-tich-hop/YEU-CAU.md).

Chạy lại được bất cứ lúc nào (từ đâu cũng được):  python3 docs/anh-goc/zed/dung-zed-game.py
Đọc:  docs/anh-goc/zed/moi/<ten>-gif/   (khung đã cắt + bao-cao.json có điểm chân từng khung)
      docs/anh-goc/zed/gan-vk/neo.json  (điểm cầm + góc vũ khí từng khung, toạ độ ẢNH KHUNG ĐÃ CẮT = nguồn)
Ghi:  game/art/custom/zed-moi.sprite.json  thân Zed: mỗi động tác 1 hàng, khung 96×96 điểm ảnh (= 48×48 game, net 2),
                                            chân tại (48,90) ảnh = goc [24,45] game; thêm các hàng "nắm tay" (lớp vẽ đè lên cán vũ khí)
      game/art/custom/zed-vk.sprite.json    4 vũ khí × 4 cấp (kiếm, thương, búa, phi tiêu), ảnh rời, game tự xoay theo neo
      docs/review/ke-hoach-cai-thien/zed-tich-hop/xem-truoc-*.png  ảnh xem trước (dựng như game ghép: người → vũ khí → nắm tay)

CÁCH GHÉP VŨ KHÍ = y hệt docs/anh-goc/zed/gan-vk/ghep-thu-vk.py (bản đã duyệt):
  - điểm cầm trên người: chinh_nam (tâm điểm da quanh điểm ghi trong neo.json, bán kính 28)
  - điểm cầm trên vũ khí: chuoi (cam = tỉ lệ dọc chiều dài; không có cam: tâm phần quấn đỏ của chuôi)
  - độ dài: sc = dai × (chiều cao lớn nhất các khung của động tác) / (bề ngang ảnh vũ khí cấp 1); cấp khác dùng cùng sc
  - góc độ: 0 = mũi chỉ sang phải, dương = chúc xuống (xoay theo chiều kim đồng hồ quanh điểm cầm); sau = 1 vũ khí vẽ SAU người
  - nắm tay: điểm màu da trong bán kính 26 quanh điểm cầm (và tay2) vẽ lại ĐÈ lên vũ khí
HỆ TOẠ ĐỘ trong tệp game: "he_neo": "nguon-96" = toạ độ trên khung 96×96 của tấm (chân tại 48,90). Game chia 2 rồi trừ goc (24,45)
để ra điểm ảnh game tính từ chân. Quy đổi: X96 = dx + x_nguon × s, Y96 = dy + y_nguon × s (s, dx, dy của từng khung: cùng phép
co/dịch đã dùng để đặt khung đó vào ô 96×96).
"""
import base64, glob, io, json, math, os, sys
import numpy as np
from PIL import Image

DAY = os.path.dirname(os.path.abspath(__file__))
GOC_REPO = os.path.abspath(os.path.join(DAY, '..', '..', '..'))
MOI = os.path.join(DAY, 'moi')
NEO = os.path.join(DAY, 'gan-vk', 'neo.json')
RA_GAME = os.path.join(GOC_REPO, 'game', 'art', 'custom')
RA_XEM = os.path.join(GOC_REPO, 'docs', 'review', 'ke-hoach-cai-thien', 'zed-tich-hop')

O = 96                 # cạnh ô ảnh (nguồn 96 = game 48 × net 2)
CHAN = (48, 90)        # chân trong ô 96 (= goc [24,45] game)
CAO_96 = 62            # Zed đứng cao 62 điểm ảnh ô 96 (= 31 điểm ảnh game, như docs/anh-goc/zed/kiem-sheet.py CAO_GAME)
DAI_CAP1 = 0.8         # như ghep-thu-vk.py
Q_VK = 2.0             # ảnh vũ khí lưu ở tỉ lệ Q_VK × s (s: tỉ lệ co thân) để game chỉ phải thu nhỏ, không phóng to

# (khoá game, thư mục, giây một vòng, lặp)
DONG = [
    ('dung', '01-dung', 1.0, True), ('di', '02-di', 0.8, True), ('chay', '03-chay', 0.6, True), ('lon', '04-lon', 0.27, False),
    ('trung', '05-trung-don', 0.2, False), ('chet', '06-chet-b2', 0.6, False), ('chuong', '07-chuong-b2', 0.3, False),
    ('kiem_1', '08-kiem-1-tp', 0.3, False), ('kiem_2', '09-kiem-2-tp', 0.3, False), ('kiem_3', '10-kiem-3', 0.46, False),
    ('thuong_1', '11-thuong-1', 0.38, False), ('thuong_2', '12-thuong-2', 0.34, False), ('thuong_3', '13-thuong-3', 0.34, False),
    ('thuong_quet', '14-thuong-quet', 0.52, False), ('thuong_giu', '15-thuong-giu', 0.45, True), ('thuong_xoc', '16-thuong-xoc', 0.16, False),
    ('bua_nen', '17-bua-nen', 0.8, False), ('bua_giu', '18-bua-giu', 0.5, True), ('bua_nen_dat', '19-bua-nen-dat', 0.7, False),
    ('phitieu', '20-phi-tieu', 0.38, False), ('phitieu_ngam', '21-phi-tieu-ngam', 0.45, True), ('phitieu_chum', '22-phi-tieu-chum', 0.5, False),
    ('db_kiem', '23-tram-nguyet-tp', 0.35, False), ('db_thuong', '24-phi-thuong', 0.35, False), ('db_bua', '25-dia-chan', 0.35, False),
    ('db_phitieu', '26-mua-phi-tieu', 0.35, False), ('dam', '27-dam', 0.3, False),
]
VK = [('kiem', 'vk-kiem-moi'), ('thuong', 'vk-thuong'), ('bua', 'vk-bua'), ('phitieu', 'vk-phi-tieu')]
VK_THU_MUC = dict((b, a) for a, b in VK)


# ---------- y hệt ghep-thu-vk.py ----------
def da(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return (r > 170) & (g > 110) & (b > 70) & (r - b > 50) & (a[..., 3] > 0)


def chinh_nam(im, x, y, r=28):
    a = np.array(im); m = da(a)
    yy, xx = np.mgrid[:a.shape[0], :a.shape[1]]
    vung = m & ((xx - x) ** 2 + (yy - y) ** 2 < r * r)
    if vung.sum() < 20:
        return float(x), float(y)
    return float(xx[vung].mean()), float(yy[vung].mean())


def chuoi(vk, cam=None):
    a = np.array(vk)
    if cam is not None:
        x = int(a.shape[1] * cam); ys = np.nonzero(a[:, x, 3] > 0)[0]
        return float(x), float(ys.mean() if len(ys) else a.shape[0] / 2)
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    m = (r > 110) & (g < 70) & (b < 70) & (a[..., 3] > 0)
    m[:, int(a.shape[1] * 0.35):] = False
    ys, xs = np.nonzero(m)
    if len(xs) == 0:
        return a.shape[1] * 0.1, a.shape[0] / 2
    return float(np.median(xs)), float(np.median(ys))


def lop_tay(im, x, y, tay2):
    a = np.array(im); m = da(a)
    yy, xx = np.mgrid[:a.shape[0], :a.shape[1]]
    tay = m & ((xx - x) ** 2 + (yy - y) ** 2 < 26 ** 2)
    if tay2:
        tay |= m & ((xx - tay2[0]) ** 2 + (yy - tay2[1]) ** 2 < 26 ** 2)
    lop = a.copy(); lop[..., 3] = np.where(tay, a[..., 3], 0)
    return Image.fromarray(lop)


# ---------- đọc khung ----------
def doc_dong(thu):
    goc = os.path.join(MOI, thu + '-gif')
    bc = json.load(open(os.path.join(goc, 'bao-cao.json'), encoding='utf-8'))
    h = bc['hang'][0]
    fs = sorted(glob.glob(os.path.join(goc, h['ten'], 'khung-*.png')))
    ra = []
    for k, f in zip(h['khung'], fs):
        im = Image.open(f).convert('RGBA')
        kb = k['khung_bao']
        bb = im.getbbox()
        # chân: hoành độ theo báo cáo cắt (điểm chân đo trên tấm gốc), tung độ = đáy hình thật (điểm ảnh đặc thấp nhất)
        ra.append({'im': im, 'chan': (float(k['chan'][0] - kb[0]), float(bb[3])), 'bb': bb})
    if len(fs) != len(h['khung']):
        print('  ! %s: %d tệp khung, báo cáo ghi %d' % (thu, len(fs), len(h['khung'])))
    return ra


def png_b64(im):
    b = io.BytesIO(); im.save(b, 'PNG', optimize=True)
    return 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode('ascii')


def main():
    neo_all = json.load(open(NEO, encoding='utf-8'))
    dong = [(k, thu, gi, lap, doc_dong(thu)) for k, thu, gi, lap in DONG]
    H_dung = float(np.median([f['bb'][3] - f['bb'][1] for f in dong[0][4]]))
    s = CAO_96 / H_dung
    print('Chiều cao Zed đứng (nguồn): %.1f điểm ảnh → %d điểm ảnh ô 96; tỉ lệ co chung s = %.5f' % (H_dung, CAO_96, s))

    # ảnh vũ khí gốc (đủ 4 cấp)
    vk_goc = {}
    for loai, thu in VK:
        vk_goc[loai] = [Image.open(f).convert('RGBA') for f in sorted(glob.glob(os.path.join(MOI, thu + '-gif', thu, 'khung-*.png')))]
        assert len(vk_goc[loai]) == 4, thu
    q = Q_VK * s

    # ---------- tấm thân + nắm tay ----------
    so_tay = sum(1 for k, thu, gi, lap, fr in dong if thu in neo_all)
    cot = max(len(fr) for *_, fr in dong)
    tam = Image.new('RGBA', (cot * O, (len(dong) + so_tay) * O), (0, 0, 0, 0))
    dt, tran, hang_tay = {}, [], len(dong)
    xem = {}
    for hang, (k, thu, gi, lap, fr) in enumerate(dong):
        sk = s
        if thu == '06-chet-b2':  # người vẽ nhỏ hơn: phóng cho cùng chiều cao với tấm đứng
            sk = s * H_dung / max(f['bb'][3] - f['bb'][1] for f in fr)
            print('  chết: phóng thêm ×%.3f cho bằng chiều cao tấm đứng' % (sk / s))
        n = neo_all.get(thu)
        d = {'hang': hang, 'so': len(fr), 'giay': gi, 'lap': lap}
        if n:
            d['hang_tay'] = hang_tay
            d['vk'] = VK_THU_MUC[n['vk']]
            cao = max(f['im'].height for f in fr)
            sc = n.get('dai', DAI_CAP1) * cao / vk_goc[d['vk']][0].width  # điểm ảnh người nguồn / điểm ảnh vũ khí nguồn (như ghep-thu-vk.py)
            d['vk_tl'] = round(sc * sk / (q * 2), 5)                     # điểm ảnh GAME / điểm ảnh ảnh vũ khí đã lưu
            cam = n.get('cam')
            d['vk_cam'] = []
            for cap in range(4):
                gx, gy = chuoi(vk_goc[d['vk']][cap], cam)
                bb = vk_goc[d['vk']][cap].getbbox()
                d['vk_cam'].append([round((gx - bb[0]) * q, 2), round((gy - bb[1]) * q, 2)])
            d['neo'] = []
        xem[k] = []
        for i, f in enumerate(fr):
            im = f['im']
            nw, nh = max(1, round(im.width * sk)), max(1, round(im.height * sk))
            sx, sy = nw / im.width, nh / im.height
            dx, dy = round(CHAN[0] - f['chan'][0] * sx), round(CHAN[1] - f['chan'][1] * sy)
            nho = im.resize((nw, nh), Image.BOX)
            o = Image.new('RGBA', (O, O), (0, 0, 0, 0)); o.paste(nho, (dx, dy), nho)
            tam.alpha_composite(o, (i * O, hang * O))
            bb = nho.getbbox()
            if bb and (dx + bb[0] < 0 or dy + bb[1] < 0 or dx + bb[2] > O or dy + bb[3] > O):
                tran.append('%s khung %d' % (thu, i + 1))
            item = {'than': o}
            if n:
                kk = n['khung'][i] if i < len(n['khung']) else None
                if not kk:
                    d['neo'].append(None)
                else:
                    x, y = chinh_nam(im, kk[0], kk[1])
                    t2 = chinh_nam(im, *kk[4]) if len(kk) > 4 else None
                    X, Y = dx + x * sx, dy + y * sy
                    sau = kk[3] if len(kk) > 3 else 0
                    d['neo'].append([round(X, 2), round(Y, 2), kk[2], sau])
                    ly = lop_tay(im, x, y, t2).resize((nw, nh), Image.BOX)
                    ot = Image.new('RGBA', (O, O), (0, 0, 0, 0)); ot.paste(ly, (dx, dy), ly)
                    tam.alpha_composite(ot, (i * O, hang_tay * O))
                    item.update(tay=ot, neo=(X, Y, kk[2], sau))
            xem[k].append(item)
        if n:
            hang_tay += 1
        dt[k] = d
    tam = tam.crop((0, 0, tam.width, hang_tay * O))

    # ---------- tấm vũ khí: mỗi loại một hàng, 4 cấp ----------
    o_vk, vk_meta, yk = [], {}, 0
    for loai, thu in VK:
        xk, cao_h, ds = 0, 0, []
        for cap in range(4):
            v = vk_goc[loai][cap]; v = v.crop(v.getbbox())
            v = v.resize((max(1, round(v.width * q)), max(1, round(v.height * q))), Image.BOX)
            o_vk.append((v, xk, yk)); ds.append([xk, yk, v.width, v.height]); xk += v.width + 2; cao_h = max(cao_h, v.height)
        vk_meta[loai] = ds; yk += cao_h + 2
    W = max(x + v.width for v, x, y in o_vk)
    tam_vk = Image.new('RGBA', (W, yk), (0, 0, 0, 0))
    for v, x, y in o_vk:
        tam_vk.alpha_composite(v, (x, y))
    than = {
        'loai': 'linh-khi-sprite', 'doi_tuong': 'zed', 'ma': 'zed-moi', 'ten': 'Zed (bộ ảnh mới 13/10)', 'phien_ban': 1,
        'tam': png_b64(tam), 'net': 2, 'khung_rong': 48, 'khung_cao': 48, 'goc': [24, 45], 'rong': 16, 'cao': CAO_96 // 2,
        'he_neo': 'nguon-96', 'dong_tac': dt,
        'ghi_chu': 'Dựng bằng docs/anh-goc/zed/dung-zed-game.py. neo: [X96, Y96, góc độ, sau] theo ô 96×96 (chân 48,90); '
                   'vk_tl: điểm ảnh game trên 1 điểm ảnh tấm zed-vk; vk_cam: điểm cầm trên ảnh vũ khí từng cấp (điểm ảnh tấm zed-vk).',
    }
    vk = {
        'loai': 'linh-khi-sprite', 'doi_tuong': 'zed', 'ma': 'zed-vk', 'ten': 'Vũ khí Zed 4 loại × 4 cấp', 'phien_ban': 1,
        'tam': png_b64(tam_vk), 'vk': vk_meta, 'cap': ['Trắng', 'Mầm', 'Thành hình', 'Thức tỉnh'],
        'ti_le': round(q, 5), 'ghi_chu': 'Mỗi loại một hàng [x, y, rộng, cao] × 4 cấp; ti_le = điểm ảnh tấm / điểm ảnh ảnh gốc.',
    }
    for ten, t in (('zed-moi', than), ('zed-vk', vk)):
        p = os.path.join(RA_GAME, ten + '.sprite.json')
        with open(p, 'w', encoding='utf-8') as fo:
            json.dump(t, fo, ensure_ascii=False, separators=(',', ':'))
        print('Ghi %s (%.0f KB)' % (os.path.relpath(p, GOC_REPO), os.path.getsize(p) / 1024))
    print('Tấm thân: %d×%d, %d hàng thân + %d hàng nắm tay' % (tam.width, tam.height, len(dong), hang_tay - len(dong)))
    if tran:
        print('  ! hình tràn ô 96×96 (bị cắt mép): ' + ', '.join(tran))

    # ---------- ảnh xem trước: ghép như game (cấp 1 và cấp 4), cỡ ô 96 (= game ×2) ----------
    os.makedirs(RA_XEM, exist_ok=True)
    def ghep(k, i, cap):
        it = xem[k][i]; d = dt[k]
        nen = Image.new('RGBA', (O * 2, O * 2), (0, 0, 0, 0)); goc0 = (O // 2, O // 2)
        if 'neo' not in it:
            nen.alpha_composite(it['than'], goc0); return nen
        X, Y, g, sau = it['neo']
        r = vk_meta[d['vk']][cap]; v = tam_vk.crop((r[0], r[1], r[0] + r[2], r[1] + r[3]))
        f = d['vk_tl'] * 2  # điểm ảnh ô 96 / điểm ảnh tấm vk
        v = v.resize((max(1, round(v.width * f)), max(1, round(v.height * f))), Image.NEAREST)
        gx, gy = d['vk_cam'][cap][0] * f, d['vk_cam'][cap][1] * f
        R = int(math.hypot(v.width, v.height)) + 4
        t = Image.new('RGBA', (2 * R, 2 * R), (0, 0, 0, 0)); t.alpha_composite(v, (int(R - gx), int(R - gy)))
        t = t.rotate(-g, resample=Image.NEAREST)
        lop = Image.new('RGBA', nen.size, (0, 0, 0, 0)); lop.paste(t, (int(goc0[0] + X - R), int(goc0[1] + Y - R)), t)
        if sau:
            nen.alpha_composite(lop); nen.alpha_composite(it['than'], goc0)
        else:
            nen.alpha_composite(it['than'], goc0); nen.alpha_composite(lop)
        nen.alpha_composite(it['tay'], goc0)
        return nen
    for ten_xem, ds in (('than', [k for k, *_ in DONG]),):
        hang = []
        for k in ds:
            for cap in ((0, 3) if 'vk' in dt[k] else (0,)):
                hang.append([ghep(k, i, cap) for i in range(dt[k]['so'])])
        P = Image.new('RGBA', (cot * O * 2, len(hang) * O * 2), (40, 44, 52, 255))
        for r_, h in enumerate(hang):
            for c_, im in enumerate(h):
                P.alpha_composite(im, (c_ * O * 2, r_ * O * 2))
        p = os.path.join(RA_XEM, 'xem-truoc-%s.png' % ten_xem)
        P.convert('RGB').save(p, optimize=True)
        print('Ghi ' + os.path.relpath(p, GOC_REPO))


if __name__ == '__main__':
    main()
