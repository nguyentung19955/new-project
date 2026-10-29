"""Quay + xuất ảnh kiểm cho game/thu-lam-pixel (Chromium không GPU, bước logic cố định – không phụ thuộc máy).

Chạy (từ tieng-vong-cuoi-cung/):  python3 game/thu-lam-pixel/cong-cu/quay.py
Ra game/thu-lam-pixel/xem-thu/:
  chup-960x540.png / chup-1920x1080.png   ảnh chụp đúng cỡ chơi (×3 = logic 960×540; ×6 = như iPhone ngang)
  chay-chem.gif (toàn tốc) · chay-chem-cham4.gif · chay-chem-60fps.mp4   chạy → chém nộm → nhảy → chạy tiếp, ×3
  lam-sheet-x8.png   mọi khung Lam phóng ×8 (lưới điểm ảnh)
  so-do.json + so-do.md   đỉnh mũ / mắt từng khung, số điểm khác nhau giữa các khung liền nhau
"""
import base64, io, json, os, subprocess, sys, threading, http.server, functools
import numpy as np
from PIL import Image, ImageDraw

GOC = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))   # tieng-vong-cuoi-cung/
RA = os.path.join(GOC, 'game', 'thu-lam-pixel', 'xem-thu'); os.makedirs(RA, exist_ok=True)
LP = os.path.join(GOC, 'art', 'huong-moi', 'lam-pixel')
sys.path.insert(0, os.path.join(LP, 'code'))
from pixel import tu_rgba, k as KY


def phuc_vu():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=GOC)
    h.log_message = lambda *a: None
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s


# kịch bản: (số bước, phím)
KICH_BAN = [(20, ''), (58, 'r'), (1, 'ra'), (26, 'r'), (6, ''), (1, 'a'), (28, ''), (1, 'a'), (30, ''), (30, 'r'), (18, 'rj'), (24, 'r'), (16, 'rj'), (40, 'r'), (1, 'ra'), (30, 'r'), (24, '')]


def quay():
    from playwright.sync_api import sync_playwright
    s = phuc_vu(); url = f'http://127.0.0.1:{s.server_address[1]}/game/thu-lam-pixel/index.html?tu=1'
    hinh = []; ten_hinh = []
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 960, 'height': 540})
        pg.goto(url); pg.wait_for_function('window.TV && (TV.xong || TV.loi)')
        assert not pg.evaluate('TV.loi'), pg.evaluate('TV.loi')
        def chup():
            d = pg.evaluate('TV.anh()'); hinh.append(Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGB'))
            ten_hinh.append(pg.evaluate('TV.pl.hinh + (TV.pl.cung ? "+" + TV.pl.cung : "")'))
        chup()
        for n, phim in KICH_BAN:
            for _ in range(n):
                pg.evaluate(f'TV.buoc(1, "{phim}")'); chup()
        trung = pg.evaluate('TV.NOM.n')
        # ảnh chụp: lúc chém trúng (có cung)
        b.close()
    s.shutdown()
    return hinh, ten_hinh, trung


def main():
    hinh, ten, trung = quay()
    i_chup = next((i for i, t in enumerate(ten) if t.endswith('+day')), len(hinh) // 2)
    hinh[i_chup].resize((960, 540), Image.NEAREST).save(os.path.join(RA, 'chup-960x540.png'))
    hinh[i_chup].resize((1920, 1080), Image.NEAREST).save(os.path.join(RA, 'chup-1920x1080.png'))
    hinh[0].resize((960, 540), Image.NEAREST).save(os.path.join(RA, 'chup-dung-960x540.png'))
    big = [h.resize((960, 540), Image.NEAREST) for h in hinh]
    # GIF toàn tốc: mỗi 2 bước 1 hình, 33 ms (≈ 30 hình/s); chậm ×4: mọi bước, 67 ms
    big[0].save(os.path.join(RA, 'chay-chem.gif'), save_all=True, append_images=big[2::2], duration=33, loop=0, optimize=True)
    big[0].save(os.path.join(RA, 'chay-chem-cham4.gif'), save_all=True, append_images=big[1:], duration=67, loop=0, optimize=True)
    tmp = os.path.join(RA, '_k'); os.makedirs(tmp, exist_ok=True)
    for i, h in enumerate(big):
        h.save(os.path.join(tmp, f'{i:04d}.png'))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '60', '-i', os.path.join(tmp, '%04d.png'), '-vf', 'scale=960:540:flags=neighbor',
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', os.path.join(RA, 'chay-chem-60fps.mp4')], check=True)
    for f in os.listdir(tmp): os.remove(os.path.join(tmp, f))
    os.rmdir(tmp)
    # sheet ×8 + số đo
    M = json.load(open(os.path.join(LP, 'sprite', 'lam-pixel.json'))); sh = Image.open(os.path.join(LP, 'sprite', 'lam-pixel.png'))
    AX, AY = M['neo']; ten_k = list(M['khung'])
    OW, OH = M['o']; Z = 8
    tam = Image.new('RGBA', (len(ten_k) * OW * Z, (OH + 4) * Z), (52, 62, 74, 255)); d = ImageDraw.Draw(tam)
    mu = {KY('1'), KY('2'), KY('3'), KY('4')}
    so = []; truoc = None
    for i, t in enumerate(ten_k):
        f = M['khung'][t]; fr = sh.crop((f[0], f[1], f[0] + f[2], f[1] + f[3]))
        c = Image.new('RGBA', fr.size, (52, 62, 74, 255)); c.alpha_composite(fr)
        tam.paste(c.resize((OW * Z, OH * Z), Image.NEAREST), (i * OW * Z, 0))
        for x in range(0, OW * Z, Z): d.line([(i * OW * Z + x, 0), (i * OW * Z + x, OH * Z)], fill=(70, 80, 92, 255))
        for y in range(0, OH * Z, Z): d.line([(i * OW * Z, y), ((i + 1) * OW * Z, y)], fill=(70, 80, 92, 255))
        d.text((i * OW * Z + 6, OH * Z + 8), t, fill=(240, 230, 200, 255))
        a = tu_rgba(fr).a
        ys, xs = np.nonzero(a == KY('E'))
        mat = [int(xs.min()) - AX, int(ys.min()) - AY] if len(xs) else None
        mm = np.isin(a, list(mu)); yy = np.nonzero(mm.any(1))[0]
        dinh = int(yy.min()) - AY if len(yy) else None
        khac = int((a != truoc).sum()) if truoc is not None else None
        # đầu khoá điểm: so vùng mũ (hàng 0–15 của bản vẽ DAU, trên khăn) với bản vẽ gốc, căn theo mắt
        dau = M['dau']['ascii']; mx_, my_ = M['dau']['mat']; lech = 0; tong = 0
        if mat:
            gx, gy = mat[0] + AX - mx_, mat[1] + AY - my_
            for j in range(16):
                for i_, ch_ in enumerate(dau[j]):
                    if ch_ == '.': continue
                    tong += 1
                    if not (0 <= gy + j < OH and 0 <= gx + i_ < OW) or a[gy + j, gx + i_] != KY(ch_): lech += 1
        so.append({'khung': t, 'dinh_mu_y': dinh, 'mat_xy': mat, 'diem_khac_khung_truoc': khac, 'so_diem': int((a >= 0).sum()),
                   'dau_lech_diem': lech, 'dau_tong_diem': tong})
        truoc = a
    # lại tranh tối nền ô sau mỗi khung
    tam.save(os.path.join(RA, 'lam-sheet-x8.png'))
    nhom = {'dung': [s for s in so if s['khung'].startswith('dung')], 'chay': [s for s in so if s['khung'].startswith('chay')],
            'chem': [s for s in so if s['khung'].startswith('chem')]}
    tom = {}
    for k_, v in nhom.items():
        dm = [s['dinh_mu_y'] for s in v]; my = [s['mat_xy'][1] for s in v]; mx = [s['mat_xy'][0] for s in v]
        tom[k_] = {'dinh_mu_dao_dong_diem': max(dm) - min(dm), 'mat_y_dao_dong_diem': max(my) - min(my), 'mat_x_dao_dong_diem': max(mx) - min(mx)}
    # khác nhau trong vòng chạy (kể cả 5→0)
    ch = [n for n in ten_k if n.startswith('chay')]
    arr = {n: tu_rgba(sh.crop(tuple(M['khung'][n][:2]) + (M['khung'][n][0] + OW, OH))).a for n in ch}
    vong = [int((arr[ch[i]] != arr[ch[(i + 1) % 6]]).sum()) for i in range(6)]
    tom['chay']['diem_khac_lien_nhau_vong'] = vong
    out = {'don_vi': '1 điểm = 3 px logic; y so với mặt đất (âm = lên trên), x so với giữa collider', 'khung': so, 'tom_tat': tom,
           'trung_nom_trong_quay': trung, 'so_buoc_quay': len(hinh) - 1}
    json.dump(out, open(os.path.join(RA, 'so-do.json'), 'w'), ensure_ascii=False, indent=1)
    L = ['| Khung | Đỉnh mũ y | Mắt (x, y) | Điểm khác khung trước | Số điểm | Đầu lệch so bản gốc |', '|---|---|---|---|---|---|']
    for s in so:
        L.append(f"| {s['khung']} | {s['dinh_mu_y']} | {s['mat_xy']} | {s['diem_khac_khung_truoc'] if s['diem_khac_khung_truoc'] is not None else '–'} | {s['so_diem']} | {s['dau_lech_diem']}/{s['dau_tong_diem']} |")
    L += ['', '| Nhóm | Đỉnh mũ dao động | Mắt y dao động | Mắt x dao động |', '|---|---|---|---|']
    for k_, v in tom.items():
        L.append(f"| {k_} | {v['dinh_mu_dao_dong_diem']} điểm ({v['dinh_mu_dao_dong_diem'] * 3} px logic) | {v['mat_y_dao_dong_diem']} điểm | {v['mat_x_dao_dong_diem']} điểm |")
    L += ['', 'Điểm khác nhau giữa 2 khung chạy liền nhau (0→1 … 5→0): ' + ', '.join(map(str, vong))]
    open(os.path.join(RA, 'so-do.md'), 'w').write('\n'.join(L) + '\n')
    print('\n'.join(L)); print('trúng nộm:', trung, 'bước:', len(hinh) - 1)


if __name__ == '__main__':
    main()
