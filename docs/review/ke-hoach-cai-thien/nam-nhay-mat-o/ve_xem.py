#!/usr/bin/env python3
"""ẢNH SOÁT TĨNH xem-nam-nhay.png: chỗ 3 ô độc của chiêu Nhảy dập (Nấm Phồng Chúa) qua vài lượt mô phỏng, TRƯỚC / SAU khi sửa.

Chạy luật game trong Node (mo_phong.py, game/tests/node_trang.js) — KHÔNG trình duyệt. Cùng hạt ngẫu nhiên nên mỗi cột trước / sau là
cùng một lượt (cùng chỗ em bé, chỗ tinh anh, cùng lúc bị choáng).
  python3 ve_xem.py <thư mục game TRƯỚC khi sửa> [số lượt mỗi hàng=6]
  (thư mục game trước: vd  git worktree add /tmp/cu <commit trước>  →  /tmp/cu/game)
Ra: xem-nam-nhay.png, xem-nam-nhay.json (số liệu thô) cùng thư mục.
"""
import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import mo_phong  # noqa: E402

MOI = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game'))


class Trang:
    def __init__(self, game):
        self.p = subprocess.Popen(['node', os.path.join(game, 'tests', 'node_trang.js')], stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                  stderr=subprocess.DEVNULL, text=True, encoding='utf-8', bufsize=1)

    def evaluate(self, code, arg=None):
        self.p.stdin.write(json.dumps({'code': code.strip(), 'arg': arg}, ensure_ascii=False) + '\n'); self.p.stdin.flush()
        r = json.loads(self.p.stdout.readline())
        if not r.get('ok'):
            raise RuntimeError(r.get('loi', '?')[:400])
        return r['v']

    def close(self):
        self.p.stdin.close(); self.p.wait(5)


HANG = [('dung', {}, 'Em bé đứng yên'), ('chay+gian', {'chay': 1, 'gian': 1}, 'Em bé chạy|tinh anh nổi giận'),
        ('dung+danh muon', {'danh': 1, 'tre': 1}, 'Em bé đứng yên|đánh choáng tinh anh|giữa chiêu')]


def main():
    cu = sys.argv[1] if len(sys.argv) > 1 else None
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 6
    if not cu:
        sys.exit('Cần thư mục game trước khi sửa (xem đầu tệp).')
    sv = json.load(open(os.path.join(MOI, 'tests', 'cay_luu.json')))[0]
    data = {}
    for ten_ban, game in (('truoc', cu), ('sau', MOI)):
        t = Trang(game)
        try:
            for ten, kb, _ in HANG:
                data[ten_ban + ' ' + ten] = t.evaluate(mo_phong.JS, [sv, 'namPhongChua', kb, 777 + len(ten) * 13, n])
        finally:
            t.close()
    json.dump(data, open(os.path.join(HERE, 'xem-nam-nhay.json'), 'w'), ensure_ascii=False)

    F = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    f1, f2, f3 = ImageFont.truetype(F, 15), ImageFont.truetype(F, 11), ImageFont.truetype(F.replace('Sans.ttf', 'Sans-Bold.ttf'), 12)
    PW, PH, K = 230, 150, 0.62  # ô vẽ mỗi lượt, tỉ lệ thu nhỏ sàn
    top, left = 70, 150
    img = Image.new('RGB', (left + n * (PW + 8) + 10, top + len(HANG) * 2 * (PH + 26) + 70), '#1b1d24')
    d = ImageDraw.Draw(img)
    d.text((10, 10), 'Nhảy dập (Nấm Phồng Chúa) — chỗ 3 ô độc mỗi lượt chiêu, mô phỏng luật game trong Node. TRƯỚC / SAU khi sửa (cùng lượt, cùng hạt ngẫu nhiên).', fill='#f0f0f0', font=f1)
    d.text((10, 32), 'Xanh dương = em bé · tím = tinh anh lúc bắt đầu · vòng đỏ 1/2/3 = ô độc đã nổ (số = thứ tự) · vòng xám đứt = báo mà không nổ · '
           'mũi tên vàng = cú nhảy · chữ "NGẮT" = chiêu dừng vì choáng.', fill='#c8c8c8', font=f2)
    d.text((10, 48), 'Vòng vẽ đúng cỡ trên sàn (r 24, dẹt theo G.ZK 0,85). Dưới mỗi ô: số ô nổ / số ô tách rời (tâm cách ≥ 36 trên sàn).', fill='#c8c8c8', font=f2)
    y = top
    for ten, kb, nhan in HANG:
        for ten_ban in ('truoc', 'sau'):
            rs = data[ten_ban + ' ' + ten]
            for m, dong in enumerate(nhan.split('|')):
                d.text((10, y + 30 + m * 14), dong, fill='#ffd27a', font=f2)
            d.text((10, y + 78), 'TRƯỚC' if ten_ban == 'truoc' else 'SAU', fill='#ff8a7a' if ten_ban == 'truoc' else '#8aff9a', font=f3)
            for i, r in enumerate(rs):
                x0 = left + i * (PW + 8)
                sx0, sy0, sx1, sy1 = r['san']
                # khung nhìn: quanh các điểm của lượt
                pts = [r['P'], r['E0']] + [[z['x'], z['y']] for z in r['zones']]
                cx = sum(p[0] for p in pts) / len(pts); cy = sum(p[1] for p in pts) / len(pts)
                vx0, vy0 = cx - PW / K / 2, cy - PH / K / 2
                def M(x, yy): return (x0 + (x - vx0) * K, y + (yy - vy0) * K)
                d.rectangle([x0, y, x0 + PW, y + PH], fill='#2a2e38')
                a, b = M(sx0, sy0), M(sx1, sy1)
                d.rectangle([max(x0, a[0]), max(y, a[1]), min(x0 + PW, b[0]), min(y + PH, b[1])], fill='#3a4a36', outline='#6a7a5a')
                no = [z for z in r['zones'] if z['no']]
                for k, z in enumerate(r['zones']):
                    c = M(z['x'], z['y']); rx, ry = 24 * K, 24 * 0.85 * K
                    if z['no']:
                        d.ellipse([c[0] - rx, c[1] - ry, c[0] + rx, c[1] + ry], outline='#ff5a4a', width=2)
                        d.text((c[0] - 4, c[1] - 7), str(k + 1), fill='#ffffff', font=f3)
                    else:
                        for g in range(0, 360, 30):
                            d.arc([c[0] - rx, c[1] - ry, c[0] + rx, c[1] + ry], g, g + 15, fill='#9a9a9a', width=2)
                ep = M(*r['E0'])
                d.ellipse([ep[0] - 5, ep[1] - 5, ep[0] + 5, ep[1] + 5], fill='#b070ff')
                prev = ep
                for j in r['jumps']:
                    q = M(j['x'], j['y'])
                    d.line([prev, q], fill='#ffd23f', width=1)
                    d.ellipse([q[0] - 2, q[1] - 2, q[0] + 2, q[1] + 2], fill='#ffd23f')
                    prev = q
                pp = M(*r['P'])
                d.ellipse([pp[0] - 4, pp[1] - 4, pp[0] + 4, pp[1] + 4], fill='#4aa8ff', outline='#ffffff')
                tach = 0
                for a1 in range(len(no)):
                    if all(((no[a1]['x'] - no[b1]['x']) ** 2 + ((no[a1]['y'] - no[b1]['y']) / 0.85) ** 2) ** 0.5 >= 36 for b1 in range(len(no)) if b1 != a1):
                        tach += 1
                ok = len(no) == 3 and tach == 3
                txt = f'nổ {len(no)} · tách {tach}' + ('  NGẮT' if r.get('ngat') else '')
                d.text((x0 + 2, y + PH + 4), txt, fill='#8aff9a' if ok else ('#ffd27a' if r.get('ngat') else '#ff8a7a'), font=f2)
            y += PH + 26
        y += 4
    img.save(os.path.join(HERE, 'xem-nam-nhay.png'))
    print('đã ghi xem-nam-nhay.png')


if __name__ == '__main__':
    main()
