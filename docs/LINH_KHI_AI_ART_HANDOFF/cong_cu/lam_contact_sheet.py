"""Ghép contact sheet có nhãn tiếng Việt từ ảnh do chup_tham_chieu.py tạo ra (đọc anh/do_dac.json).
Chạy: python3 docs/LINH_KHI_AI_ART_HANDOFF/cong_cu/lam_contact_sheet.py"""
import json, os
from PIL import Image, ImageDraw, ImageFont

PKG = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(PKG, 'anh')
F = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
font = lambda s, b=False: ImageFont.truetype(FB if b else F, s)
BG, CHK = (34, 30, 40, 255), (44, 40, 52, 255)
M = json.load(open(os.path.join(A, 'do_dac.json')))


def checker(w, h, s=8):
    im = Image.new('RGBA', (w, h), BG); d = ImageDraw.Draw(im)
    for y in range(0, h, s):
        for x in range(0, w, s):
            if (x // s + y // s) % 2: d.rectangle([x, y, x + s - 1, y + s - 1], fill=CHK)
    return im


def labeled_rows(src, rows, out, title, scale, colnames=None, left=300):
    """rows: list of (label, y0, h) in 1x pixels of src. Phóng 'scale' lần (láng giềng gần nhất)."""
    im = Image.open(os.path.join(A, src)).convert('RGBA')
    im = im.resize((im.width * scale, im.height * scale), Image.NEAREST)
    top = 60 + (28 if colnames else 0)
    W, H = left + im.width, top + im.height
    can = checker(W, H, 4 * scale)
    can.alpha_composite(im, (left, top))
    d = ImageDraw.Draw(can)
    d.rectangle([0, 0, W, 50], fill=(18, 14, 22, 255))
    d.text((12, 10), title, font=font(24, True), fill=(255, 240, 196, 255))
    if colnames:
        cw = im.width // len(colnames)
        for i, c in enumerate(colnames):
            d.text((left + i * cw + 6, 60), c, font=font(16), fill=(220, 220, 220, 255))
    for lab, y0, h in rows:
        y = top + y0 * scale
        d.line([(0, y), (W, y)], fill=(80, 74, 90, 255))
        for k, line in enumerate(lab.split('\n')):
            d.text((10, y + 8 + k * 22), line, font=font(18, k == 0), fill=(240, 236, 220, 255) if k == 0 else (180, 176, 170, 255))
    can.save(os.path.join(A, 'contact', out))
    return can


def main():
    os.makedirs(os.path.join(A, 'contact'), exist_ok=True)
    made = []
    # Em bé
    o = M['em_be']['o_ve']
    for k in ['smith', 'hunter', 'healer', 'wrestler']:
        e = M['em_be'][k]
        rows = [(f"{r['nhan']}\n{r['so_khung']} khung · hộp {r['hop_bao_tu_chan']['rong']}×{r['hop_bao_tu_chan']['cao']}", r['hang'] * o['cao'], o['cao']) for r in e['hang']]
        labeled_rows(f'em_be/{k}_sheet.png', rows, f'em_be_{k}.png', f"Em bé {e['ten']} ({k}) — mỗi ô {o['rong']}×{o['cao']} px gốc, PHÓNG ×3; gốc chân tại ({o['goc_chan_x']},{o['goc_chan_y']}) trong ô", 3)
        made.append(f'em_be_{k}.png')
    # Quái
    cols = [f"{a}@{u}" for a, u in M['quai']['cot']]
    for v, ten in [('rung', 'Rừng già'), ('bien', 'Hang biển'), ('laudai', 'Lâu đài cổ')]:
        q = M['quai'][v]
        rows = [(f"{c['ten']} ({c['id']})\n{c['loai']} · lưới {c['khung_luoi']['rong']}×{c['khung_luoi']['cao']}", c['hang_y'], c['hang_cao']) for c in q['con']]
        labeled_rows(f'quai/{v}_sheet.png', rows, f'quai_{v}.png', f"Quái {ten} — PHÓNG ×2; cột: động tác@tỉ lệ thời gian (u)", 2, cols, left=360)
        made.append(f'quai_{v}.png')
    # Trùm
    bc = [f"{a}@{u}" for a, u in M['trum']['cot']]
    for bid in ['mocTinh', 'nguTinh', 'hoTinh']:
        t = M['trum'][bid]; W0, H0 = t['o']
        rows = [(f"Pha {p}", (p - 1) * H0, H0) for p in (1, 2, 3)]
        labeled_rows(f'trum/{bid}_sheet.png', rows, f'trum_{bid}.png', f"Trùm {t['ten']} ({bid}) — lưới {t['khung_luoi']['rong']}×{t['khung_luoi']['cao']}, PHÓNG ×1 (gốc)", 1, bc, left=120)
        made.append(f'trum_{bid}.png')
    # Vũ khí
    rows = [(n, i * 56, 56) for i, n in enumerate(['Kiếm (sword)', 'Cung (bow)', 'Giáo (spear)', 'Búa (hammer)'])]
    labeled_rows('vu_khi/vu_khi_40_dong_sheet.png', rows, 'vu_khi_40_dong.png', 'Vũ khí: 10 dòng × 4 loại, dạng gốc, nằm ngang (góc 0), PHÓNG ×3; cột = dòng 0..9', 3, [str(i) for i in range(10)], left=200)
    made.append('vu_khi_40_dong.png')
    # Tổng hợp cảnh 480x270 (×1, lưới 3 cột)
    sc = ['rung_phong_trong', 'bien_phong_trong', 'laudai_phong_trong', 'rung_phong_co_quai', 'bien_phong_co_quai', 'laudai_phong_co_quai',
          'rung_phong_trum', 'bien_phong_trum', 'laudai_phong_trum', 'hieu_ung_dong_1', 'hieu_ung_dong_2', 'hieu_ung_dong_3']
    tw, th, pad = 480, 270, 34
    can = Image.new('RGBA', (3 * (tw + 10) + 10, 50 + 4 * (th + pad + 6)), (18, 14, 22, 255)); d = ImageDraw.Draw(can)
    d.text((12, 12), 'Cảnh trong game — lớp thế giới 480×270 đúng cỡ gốc (×1), chưa có lớp giao diện', font=font(22, True), fill=(255, 240, 196, 255))
    for i, n in enumerate(sc):
        x, y = 10 + (i % 3) * (tw + 10), 50 + (i // 3) * (th + pad + 6)
        d.text((x, y + 6), n + '_480x270.png', font=font(16), fill=(230, 230, 230, 255))
        can.alpha_composite(Image.open(os.path.join(A, 'canh', n + '_480x270.png')).convert('RGBA'), (x, y + pad))
    can.save(os.path.join(A, 'contact', 'canh_480x270.png')); made.append('canh_480x270.png')
    # Tổng quan một trang: thu nhỏ từng contact sheet
    thumbs = [Image.open(os.path.join(A, 'contact', m)).convert('RGBA') for m in made]
    TW = 640; cells = []
    for m, t in zip(made, thumbs):
        r = TW / t.width; cells.append((m, t.resize((TW, max(1, int(t.height * r))), Image.LANCZOS)))
    cols3 = 3; rows_h = []
    for i in range(0, len(cells), cols3): rows_h.append(max(c[1].height for c in cells[i:i + cols3]) + 30)
    can = Image.new('RGBA', (cols3 * (TW + 10) + 10, 60 + sum(rows_h)), (18, 14, 22, 255)); d = ImageDraw.Draw(can)
    d.text((12, 14), 'LINH KHÍ — tổng quan ảnh tham chiếu (ảnh thu nhỏ, CHỈ để xem nhanh; mở từng file contact/*.png để xem đúng điểm ảnh)', font=font(22, True), fill=(255, 240, 196, 255))
    y = 60
    for ri, i in enumerate(range(0, len(cells), cols3)):
        for j, (m, t) in enumerate(cells[i:i + cols3]):
            x = 10 + j * (TW + 10); d.text((x, y + 4), 'contact/' + m, font=font(16), fill=(230, 230, 230, 255)); can.alpha_composite(t, (x, y + 26))
        y += rows_h[ri]
    can.save(os.path.join(A, 'contact', '00_TONG_QUAN.png'))
    print('đã làm', len(made) + 1, 'contact sheet')


if __name__ == '__main__':
    main()
