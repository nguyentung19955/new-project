"""Dựng bộ ảnh vũ khí theo hệ game/art/custom/zed-vk-he.sprite.json từ ảnh chủ game gen (bao-cao-A mục 3, 16/10/2026).

Đầu vào: thư mục anh-gen/ cạnh tệp này, mỗi tấm = một vũ khí × một cấp, BA HỆ CẠNH NHAU trái → phải Lửa | Độc | Băng, nền #00FF00:
    anh-gen/kiem-1.png  kiem-2.png  kiem-3.png  (1 Mầm, 2 Thành hình, 3 Thức tỉnh)
    anh-gen/thuong-*.png  bua-*.png  phitieu-*.png
  Hoặc tách sẵn từng hệ: anh-gen/kiem-1-fire.png, kiem-1-poison.png, kiem-1-ice.png (có tệp tách thì dùng tệp tách).
Cách làm: tách nền xanh → tách 3 vũ khí theo cột trống → mỗi vũ khí cắt sát, co về ĐÚNG rộng × cao ô cấp đó của zed-vk (game cần cùng cỡ
  để điểm cầm / nắm tay khớp): co theo chiều rộng của ô (Image.BOX như dung-zed-game.py), đặt sát trái (kiếm/thương/búa: chuôi bên trái)
  hoặc giữa (phi tiêu), dóng hàng dọc theo cán (trung bình y các điểm ảnh ở 12% cột trái) với ảnh cấp hiện tại; phần tràn ô bị cắt (in %).
Ra: game/art/custom/zed-vk-he.sprite.json + anh-soat/xem-vk-he.png (ảnh cấp hiện tại | Lửa | Độc | Băng, ×3) để soát trước khi build.
Chạy: python3 docs/review/ke-hoach-cai-thien/vu-khi-chatgpt/dung_zed_vk_he.py   rồi   cd game && python3 build.py (+ --hai-tep)."""
import base64, glob, io, json, os, sys
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..'))
VAO = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'anh-gen')  # thử: <thư mục vào> <tệp ra>
VK_TEP = os.path.join(REPO, 'game', 'art', 'custom', 'zed-vk.sprite.json')
RA = sys.argv[2] if len(sys.argv) > 2 else os.path.join(REPO, 'game', 'art', 'custom', 'zed-vk-he.sprite.json')
HE = ['fire', 'poison', 'ice']
LOAI = ['kiem', 'thuong', 'bua', 'phitieu']


def doc_anh(s):
    s = s.split(',', 1)[1] if s.startswith('data:') else s
    return Image.open(io.BytesIO(base64.b64decode(s))).convert('RGBA')


def tach_nen(im):
    """Chỉ bỏ xanh GẦN THUẦN #00FF00 (g > 190, r < 95, b < 95): giữ được xanh Độc #72C943 / #C8F169 / #315B35 trên vũ khí.
    Không khử ám xanh ở mép (sẽ làm hỏng màu Độc); ảnh co ×~0,25 bằng Image.BOX nên mép ám tự hoà."""
    a = np.array(im.convert('RGBA')).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    xanh = (g > 190) & (r < 95) & (b < 95)
    a[..., 3] = np.where(xanh, 0, a[..., 3])
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')


def tach_ba(im):
    al = np.array(im)[..., 3] > 40
    cot = al.any(axis=0)
    doan, x = [], 0
    while x < len(cot):
        if cot[x]:
            x0 = x
            while x < len(cot) and cot[x]:
                x += 1
            doan.append([x0, x])
        x += 1
    # gộp khe nhỏ (mảnh lửa / giọt rời) cho tới khi còn 3 đoạn
    while len(doan) > 3:
        khe = [doan[i + 1][0] - doan[i][1] for i in range(len(doan) - 1)]
        i = int(np.argmin(khe))
        doan[i] = [doan[i][0], doan[i + 1][1]]
        del doan[i + 1]
    if len(doan) != 3:
        raise SystemExit('không tách được 3 vũ khí (%d đoạn) — gửi tệp tách sẵn <loại>-<cấp>-<hệ>.png' % len(doan))
    return [im.crop((x0, 0, x1, im.height)) for x0, x1 in doan]


def cat_sat(im):
    bb = im.getbbox()
    return im.crop(bb) if bb else im


def hang_can(im):
    a = np.array(im)[..., 3] > 90
    w = max(1, int(a.shape[1] * 0.12))
    ys = np.nonzero(a[:, :w])[0]
    return float(ys.mean()) if len(ys) else a.shape[0] / 2


def vao_o(v, goc, loai):
    """v: vũ khí hệ đã cắt sát (cỡ gen); goc: ô cấp hiện tại trong zed-vk. Trả ô cùng cỡ goc + % điểm ảnh bị cắt."""
    W, H = goc.size
    k = W / v.width
    n = v.resize((max(1, round(v.width * k)), max(1, round(v.height * k))), Image.BOX)
    o = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    if loai == 'phitieu':
        dx, dy = (W - n.width) // 2, (H - n.height) // 2
    else:
        dx, dy = 0, round(hang_can(goc) - hang_can(n))
    o.alpha_composite(n, (max(0, dx), max(0, dy)), (max(0, -dx), max(0, -dy)))
    tong = (np.array(n)[..., 3] > 40).sum()
    con = (np.array(o)[..., 3] > 40).sum()
    return o, 100.0 * (1 - con / max(1, tong))


def main():
    V = json.load(open(VK_TEP, encoding='utf-8'))
    tam = doc_anh(V['tam'])
    o_ra, meta = [], {}
    for loai in LOAI:
        for cap in (1, 2, 3):
            r = V['vk'][loai][cap]
            goc = tam.crop((r[0], r[1], r[0] + r[2], r[1] + r[3]))
            tach = [os.path.join(VAO, '%s-%d-%s.png' % (loai, cap, h)) for h in HE]
            if all(os.path.exists(p) for p in tach):
                ba = [tach_nen(Image.open(p)) for p in tach]
            else:
                p = os.path.join(VAO, '%s-%d.png' % (loai, cap))
                if not os.path.exists(p):
                    print('  thiếu', os.path.relpath(p, REPO), '→ game dùng ảnh cấp nhuộm như cũ')
                    continue
                ba = tach_ba(tach_nen(Image.open(p)))
            for h, v in zip(HE, ba):
                o, mat = vao_o(cat_sat(v), goc, loai)
                o_ra.append((loai, h, cap, o, goc))
                print('  %s %d %-6s → ô %dx%d, cắt tràn %.1f%%%s' % (loai, cap, h, o.width, o.height, mat, '  ← XEM LẠI' if mat > 3 else ''))
    if not o_ra:
        print('Chưa có ảnh nào trong', os.path.relpath(VAO, REPO))
        return 1
    # xếp tấm: mỗi (loại, cấp) một hàng 3 ô
    hang, y, W = {}, 0, 0
    for loai, h, cap, o, goc in o_ra:
        hang.setdefault((loai, cap), []).append((h, o, goc))
    vi = []
    for key, ds in hang.items():
        x, hmax = 0, 0
        for h, o, goc in ds:
            vi.append((key[0], h, key[1], o, x, y)); x += o.width + 2; hmax = max(hmax, o.height)
        W = max(W, x); y += hmax + 2
    T = Image.new('RGBA', (W, y), (0, 0, 0, 0))
    for loai, h, cap, o, x, yy in vi:
        T.alpha_composite(o, (x, yy))
        meta.setdefault(loai, {}).setdefault(h, [None, None, None, None])[cap] = [x, yy, o.width, o.height]
    b = io.BytesIO(); T.save(b, 'PNG', optimize=True)
    tep = {'loai': 'linh-khi-sprite', 'doi_tuong': 'zed', 'ma': 'zed-vk-he', 'ten': 'Vũ khí Cu Tí theo hệ (Lửa/Độc/Băng × Mầm/Thành hình/Thức tỉnh)',
           'phien_ban': 1, 'tam': 'data:image/png;base64,' + base64.b64encode(b.getvalue()).decode(), 'vk': meta,
           'ghi_chu': 'vk[loại][hệ][cấp] = [x, y, rộng, cao]; cùng cỡ ô với zed-vk (js/vien_vk.js G.vkHeAnh). Dựng: docs/review/ke-hoach-cai-thien/vu-khi-chatgpt/dung_zed_vk_he.py'}
    json.dump(tep, open(RA, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('Đã ghi', os.path.relpath(RA, REPO), '(%d ô, %d KB)' % (len(vi), os.path.getsize(RA) // 1024))
    # ảnh soát
    Z, rows = 3, list(hang.items())
    cw = max(o.width for *_, o, _x, _y in vi) + 4
    ch = max(o.height for *_, o, _x, _y in vi) + 4
    xem = Image.new('RGBA', (cw * 4 * Z, ch * len(rows) * Z), (36, 40, 34, 255))
    for i, (key, ds) in enumerate(rows):
        cot = [ds[0][2]] + [o for h, o, g in ds]
        for j, o in enumerate(cot):
            xem.alpha_composite(o.resize((o.width * Z, o.height * Z), Image.NEAREST), (j * cw * Z, i * ch * Z))
    os.makedirs(os.path.join(HERE, 'anh-soat'), exist_ok=True)
    xem.save(os.path.join(HERE, 'anh-soat', 'xem-vk-he.png'))
    return 0


if __name__ == '__main__':
    sys.exit(main())
