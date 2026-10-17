#!/usr/bin/env python3
"""Ghép kết quả jump64 / fall64 / attack64 (từ tools/chatgpt-anim-to-px.py) vào sheet game và kiểm chuỗi chuyển trạng thái.

  python3 tools/lam-anim-64-ghep.py so-sanh-jump   → art/nhan-vat/lam-chatgpt/jump64/so-sanh-jump-v1-v2-v3-x4.png (3 bản × 4 khung, số liệu mắt/chân)
  python3 tools/lam-anim-64-ghep.py attack-x4      → art/nhan-vat/lam-chatgpt/attack64/attack-x4.png (3 đòn × 6, ô 96) + attack-80-x4.png (ô 80, phần bị cắt tô đỏ)
  python3 tools/lam-anim-64-ghep.py sheet          → game/anim/lam-chatgpt-80.png (hàng 2 jump, 3 fall, 4 attack đòn 1) + .anim.json;
                                                      game/anim/lam-chatgpt-80-combo.png (3 hàng × 6, ô 96×80) + .anim.json
  python3 tools/lam-anim-64-ghep.py chuoi          → art/nhan-vat/lam-chatgpt/attack64/chuoi-x4.gif + chuoi-kiem-tra.json (lệch mắt/chân tại điểm chuyển)
  python3 tools/lam-anim-64-ghep.py anim2d         → nạp sheet vào game/xem-thu/anim2d.html headless (chỉ đọc), chụp jump/fall/attack
Không sửa hàng 0 (idle tạm = run-0) và hàng 1 (run) của sheet; không đụng lam-proto.*, lam-chatgpt.png (46 px), demo.html, game/lib/*.
"""
import importlib.util, json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..'))
ART = os.path.join(ROOT, 'art', 'nhan-vat', 'lam-chatgpt'); GAME = os.path.join(ROOT, 'game')
NEN = (42, 36, 51, 255); FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
N = 80; PIV = [40, 79]


def chu(c):
    try: return ImageFont.truetype(FONT, c)
    except Exception: return ImageFont.load_default()


def to_x(im, s): return im.resize((im.width * s, im.height * s), Image.NEAREST)


def nap(thu_muc, ten, n): return [Image.open(os.path.join(thu_muc, '%s-%d.png' % (ten, i))).convert('RGBA') for i in range(n)]


def kt(thu_muc): return json.load(open(os.path.join(thu_muc, 'kiem-tra.json')))


# ------------------------------------------------------------ so sánh 3 bản jump
def so_sanh_jump():
    S = 4; ban = [('v1', 'v1'), ('v2', 'v2'), ('v3', '.')]; chon = 'v3'
    W = 4 * (N * S + 8) + 220; H = len(ban) * (N * S + 40) + 40
    out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); f = chu(13); fb = chu(15)
    dr.text((8, 6), 'Jump – 3 bản ChatGPT thu về cao 64 / ô 80 / pivot [40,79], cột mắt 48 · F0/F1 chống đất (đáy 79), F2/F3 giữ hàng mắt của F1 · chọn: ' + chon, font=fb, fill=(240, 240, 240, 255))
    for r, (ten, tm) in enumerate(ban):
        d = os.path.join(ART, 'jump64', tm); k = kt(d); ims = nap(d, 'jump', 4); y = 36 + r * (N * S + 40)
        dr.text((8, y + 4), ('%s%s' % (ten, '  ← CHỌN' if ten == chon else '')), font=fb, fill=(131, 204, 147, 255) if ten == chon else (230, 230, 230, 255))
        dr.text((8, y + 26), 'tỉ lệ %.4f' % k['tyLe']['s'], font=f, fill=(180, 190, 200, 255))
        dr.text((8, y + 44), 'cao ra: ' + '/'.join('%.0f' % c for c in k['tyLe']['caoRaTheoKhung']), font=f, fill=(180, 190, 200, 255))
        for i, im in enumerate(ims):
            x = 220 + i * (N * S + 8); out.alpha_composite(to_x(im, S), (x, y)); dr.rectangle([x, y, x + N * S - 1, y + N * S - 1], outline=(70, 80, 95, 255))
            kk = k['khung'][str(i)]; py = y + (79 + 0.5) * S
            dr.line([x, py, x + N * S, py], fill=(255, 70, 70, 120), width=1)
            dr.text((x + 4, y + N * S + 4), 'F%d · mắt h%d · chân h%d (%+d) · %s' % (i, kk['hangMat'], kk['hangDayThan'], 79 - kk['hangDayThan'], 'đất' if kk['chongDat'] else 'bay'), font=f, fill=(200, 210, 220, 255))
            if r == 0 and i == 0: dr.text((220, 24), 'nhãn: mắt h = hàng tâm 2 mắt; chân h = hàng đáy thân (+n = cao hơn pivot n px); vạch đỏ = hàng 79', font=f, fill=(170, 180, 190, 255))
    out.save(os.path.join(ART, 'jump64', 'so-sanh-jump-v1-v2-v3-x4.png')); print('ok so-sanh-jump')


# ------------------------------------------------------------ attack 3 đòn
def attack_x4():
    S = 4; d0 = os.path.join(ART, 'attack64')
    for rong, sub, ten_file in ((96, 'rong96', 'attack-x4.png'), (80, '', 'attack-80-x4.png')):
        W = 6 * (rong * S + 8) + 120; H = 3 * (N * S + 44) + 40
        out = Image.new('RGBA', (W, H), NEN); dr = ImageDraw.Draw(out); f = chu(13); fb = chu(15)
        dr.text((8, 6), 'Attack – 3 đòn × 6 khung, ô %d×80, pivot [%d,79], 14 FPS non-loop, hitFrames [2,3] (khung viền vàng) · đáy thân = 79 · cột mắt %d · vòng đỏ = mũi kiếm (pixel #CEF0D6 xa mắt nhất)' % (rong, rong // 2, 48 + (rong - 80) // 2) + ('' if rong == 96 else ' · vùng ĐỎ ngoài ô = pixel bị cắt khỏi ô 80'), font=fb, fill=(240, 240, 240, 255))
        for r in range(3):
            d = os.path.join(d0, 'don%d' % (r + 1)); k = kt(d); ims = nap(os.path.join(d, sub), 'attack%d' % (r + 1), 6); y = 36 + r * (N * S + 44)
            dr.text((8, y + 4), ['đòn 1\nchém ngang', 'đòn 2\nchéo lên', 'đòn 3\nchéo xuống'][r], font=fb, fill=(230, 230, 230, 255))
            for i, im in enumerate(ims):
                x = 120 + i * (rong * S + 8); kk = k['khung'][str(i)]
                if rong == 80 and kk['roiNgoaiO']['soPixelMat']:
                    big = Image.open(os.path.join(d, 'rong96', 'attack%d-%d.png' % (r + 1, i))).convert('RGBA'); a = np.array(big)[..., 3] > 0
                    red = np.zeros((80, 96, 4), np.uint8); red[a] = (255, 60, 60, 110); red[:, 8:88] = 0
                    out.alpha_composite(to_x(Image.fromarray(red, 'RGBA'), S), (x - 8 * S, y))
                out.alpha_composite(to_x(im, S), (x, y)); dr.rectangle([x, y, x + rong * S - 1, y + N * S - 1], outline=(70, 80, 95, 255) if i not in (2, 3) else (225, 184, 90, 255), width=1 if i not in (2, 3) else 2)
                mk = k['muiKiem'][i]
                if mk: dr.ellipse([x + (mk[0] + 0.5) * S - 5 + (rong - 80) // 2 * S, y + (mk[1] + 0.5) * S - 5, x + (mk[0] + 0.5) * S + 5 + (rong - 80) // 2 * S, y + (mk[1] + 0.5) * S + 5], outline=(255, 90, 90, 255), width=2)
                roi = kk['roiNgoaiO']['soPixelMat'] if rong == 80 else k['xuatRong']['pixelRoiNgoaiO'][str(i)]
                dr.text((x + 4, y + N * S + 4), 'F%d %dms · mắt h%d · mũi %s%s%s' % (i, round(i * 1000 / 14), kk['hangMat'], mk, ' HIT' if i in (2, 3) else '', (' · CẮT %dpx' % roi) if roi else ''), font=f, fill=(255, 120, 120, 255) if roi else (200, 210, 220, 255))
        out.save(os.path.join(d0, ten_file)); print('ok', ten_file)


# ------------------------------------------------------------ sheet game
def sheet():
    p = os.path.join(GAME, 'anim', 'lam-chatgpt-80'); sh = Image.open(p + '.png').convert('RGBA'); js = json.load(open(p + '.anim.json'))
    assert sh.size == (640, 400) and js['frameWidth'] == 80, 'sheet 80 không như mong đợi'
    jump = nap(os.path.join(ART, 'jump64'), 'jump', 4); fall = nap(os.path.join(ART, 'fall64'), 'fall', 2); at1 = nap(os.path.join(ART, 'attack64', 'don1'), 'attack1', 6)
    for row in (2, 3, 4):      # xoá hàng trước khi vẽ (ô trống trong suốt)
        tr = Image.new('RGBA', (640, 80), (0, 0, 0, 0)); sh.paste(tr, (0, row * 80))
    for i, im in enumerate(jump): sh.alpha_composite(im, (i * 80, 160))
    for i, im in enumerate(fall): sh.alpha_composite(im, (i * 80, 240))
    for i, im in enumerate(at1): sh.alpha_composite(im, (i * 80, 320))
    sh.save(p + '.png')
    js['animations']['jump'] = {'row': 2, 'frames': 4, 'fps': 10, 'loop': False}
    js['animations']['fall'] = {'row': 3, 'frames': 2, 'fps': 8, 'loop': True}
    js['animations']['attack'] = {'row': 4, 'frames': 6, 'fps': 14, 'loop': False, 'hitFrames': [2, 3]}
    with open(p + '.anim.json', 'w') as f: json.dump(js, f, indent=2, ensure_ascii=False); f.write('\n')
    # combo 96×80
    pc = os.path.join(GAME, 'anim', 'lam-chatgpt-80-combo'); W = 96
    cb = Image.new('RGBA', (6 * W, 3 * 80), (0, 0, 0, 0))
    for r in range(3):
        for i, im in enumerate(nap(os.path.join(ART, 'attack64', 'don%d' % (r + 1), 'rong96'), 'attack%d' % (r + 1), 6)): cb.alpha_composite(im, (i * W, r * 80))
    cb.save(pc + '.png')
    jc = {'version': 1, 'image': 'lam-chatgpt-80-combo.png', 'frameWidth': W, 'frameHeight': 80, 'pivot': [48, 79],
          'animations': {'attack1': {'row': 0, 'frames': 6, 'fps': 14, 'loop': False, 'hitFrames': [2, 3]}, 'attack2': {'row': 1, 'frames': 6, 'fps': 14, 'loop': False, 'hitFrames': [2, 3]},
                         'attack3': {'row': 2, 'frames': 6, 'fps': 14, 'loop': False, 'hitFrames': [2, 3]}}}
    with open(pc + '.anim.json', 'w') as f: json.dump(jc, f, indent=2, ensure_ascii=False); f.write('\n')
    print('ok sheet', sh.size, cb.size)


# ------------------------------------------------------------ chuỗi chuyển trạng thái
def chuoi():
    run = nap(os.path.join(ART, 'run64'), 'run', 8); kr = kt(os.path.join(ART, 'run64'))
    jump = nap(os.path.join(ART, 'jump64'), 'jump', 4); kj = kt(os.path.join(ART, 'jump64'))
    fall = nap(os.path.join(ART, 'fall64'), 'fall', 2); kf = kt(os.path.join(ART, 'fall64'))
    at = [nap(os.path.join(ART, 'attack64', 'don%d' % (r + 1), 'rong96'), 'attack%d' % (r + 1), 6) for r in range(3)]; ka = [kt(os.path.join(ART, 'attack64', 'don%d' % (r + 1))) for r in range(3)]
    def do(k, i, rong): kk = k['khung'][str(i)]; return {'mat': [kk.get('cotMat', 48) - (rong - 80) // 2 * 0, kk['hangMat']], 'chan': kk.get('hangDayThan', kk['hangDay']), 'dinh': kk['bbox'][1]}
    # (tên, ảnh, pivotX, ms, số liệu)
    seq = []
    seq += [('idle (tạm run-0)', run[0], 40, 125, do(kr, 0, 80))] * 4
    seq += [('jump F%d' % i, jump[i], 40, 100, do(kj, i, 80)) for i in range(4)]
    seq += [('jump giữ F3', jump[3], 40, 100, do(kj, 3, 80))] * 2
    seq += [('fall F%d' % i, fall[i], 40, 125, do(kf, i, 80)) for i in (0, 1, 0, 1)]
    seq += [('run F%d' % i, run[i], 40, 83, do(kr, i, 80)) for i in range(8)]
    for r in range(3): seq += [('attack%d F%d' % (r + 1, i), at[r][i], 48, 71, do(ka[r], i, 96)) for i in range(6)]
    seq += [('idle (tạm run-0)', run[0], 40, 125, do(kr, 0, 80))] * 3
    S = 4; CW, CH = 128, 100; PX, PY = 64, 95; ims = []
    for ten, im, px, ms, _ in seq:
        c = Image.new('RGBA', (CW, CH), NEN); c.alpha_composite(im, (PX - px, PY - 79))
        big = to_x(c, S); d = ImageDraw.Draw(big)
        d.line([0, (PY + 0.5) * S, CW * S, (PY + 0.5) * S], fill=(255, 70, 70, 140)); d.line([(PX + 0.5) * S - 6, (PY + 0.5) * S, (PX + 0.5) * S + 6, (PY + 0.5) * S], fill=(255, 70, 70, 255), width=2); d.line([(PX + 0.5) * S, (PY + 0.5) * S - 6, (PX + 0.5) * S, (PY + 0.5) * S + 6], fill=(255, 70, 70, 255), width=2)
        d.text((8, 6), ten, font=chu(16), fill=(243, 230, 200, 255), stroke_width=2, stroke_fill=(12, 15, 20, 255))
        ims.append(big.convert('P', palette=Image.ADAPTIVE, colors=48))
    ra = os.path.join(ART, 'attack64', 'chuoi-x4.gif')
    ims[0].save(ra, save_all=True, append_images=ims[1:], duration=[s[3] for s in seq], loop=0, disposal=2)
    # lệch tại điểm chuyển (khung cuối A → khung đầu B)
    moc = []
    for i in range(1, len(seq)):
        a, b = seq[i - 1], seq[i]
        if a[0].split(' ')[0] == b[0].split(' ')[0]: continue
        moc.append({'tu': a[0], 'den': b[0], 'lechHangMat': b[4]['mat'][1] - a[4]['mat'][1], 'lechCotMat': b[4]['mat'][0] - a[4]['mat'][0], 'lechHangChan': b[4]['chan'] - a[4]['chan'], 'lechDinhMu': b[4]['dinh'] - a[4]['dinh'],
                    'ghiChu': 'mắt + = đầu tụt xuống; chân + = chân thấp hơn (chân 79 = chạm đất); jump/fall chân cao hơn 79 là chủ ý (bay)'})
    with open(os.path.join(ART, 'attack64', 'chuoi-kiem-tra.json'), 'w') as f: json.dump({'thuTu': [s[0] for s in seq], 'diemChuyen': moc}, f, indent=1, ensure_ascii=False)
    for m in moc: print('%-18s → %-18s mắt %+d cột %+d chân %+d đỉnh mũ %+d' % (m['tu'], m['den'], m['lechHangMat'], m['lechCotMat'], m['lechHangChan'], m['lechDinhMu']))


def anim2d():
    spec = importlib.util.spec_from_file_location('t', os.path.join(HERE, 'chatgpt-sheet-to-px.py')); t = importlib.util.module_from_spec(spec); spec.loader.exec_module(t)
    t.N = 80; kq = {}
    p = os.path.join(GAME, 'anim', 'lam-chatgpt-80')
    for ten, thu in (('jump', 'jump64'), ('fall', 'fall64'), ('attack', 'attack64')):
        try: kq[ten] = t.anim2d_check(p + '.png', ten, os.path.join(ART, thu, 'anim2d-check.png'), json_path=p + '.anim.json')
        except Exception as e: kq[ten] = {'loi': str(e)}
        print(ten, json.dumps(kq[ten], ensure_ascii=False)[:400])
    with open(os.path.join(ART, 'attack64', 'anim2d-kiem-tra.json'), 'w') as f: json.dump(kq, f, indent=1, ensure_ascii=False)


if __name__ == '__main__':
    {'so-sanh-jump': so_sanh_jump, 'attack-x4': attack_x4, 'sheet': sheet, 'chuoi': chuoi, 'anim2d': anim2d}[sys.argv[1]]()
