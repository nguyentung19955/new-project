"""F4 bước A — soát vũ khí PixelLab mặc định: chụp headless 844×390 Rowan cầm từng vũ khí × hình thái × hệ (+ gân), đứng và đang đánh.
  python3 chup_vk.py <dist mới> <dist cũ (trước F4)> <thư mục ra>
So 3 bản: MỚI mặc định | CŨ ?vkpl=1 (bản thử PixelLab ghép lúc chạy, đã soát điểm cầm ở phiên pixellab-vu-khi) | MỚI ?vkpl=0 (ChatGPT).
Ra: anh/tren-tay-<loại>.png (cột: PixelLab mặc định đứng | đánh | ChatGPT ?vkpl=0 đứng | đánh), chup_vk.json (số điểm ảnh khác bản thử cũ, lỗi trang).
Ghi chú 05/11: bản dist trước F4 với ?vkpl=1 chụp headless lại ra kiếm ChatGPT (bản ghép lúc chạy không kịp ghép trong lượt chụp) nên cột so điểm ảnh
với bản thử chỉ để tham khảo; soát điểm cầm bằng mắt trên ảnh + ô cùng rộng × cao (neo không đổi)."""
import io, os, sys, subprocess, time, json
from PIL import Image, ImageDraw, ImageFont, ImageChops
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, *['..'] * 5))
TESTS = os.path.join(ROOT, 'game', 'tests')
LIB = open(os.path.join(ROOT, 'docs', 'review', 'ke-hoach-cai-thien', 'bua-khop-2', 'lib.js')).read()
SRV = os.path.join(ROOT, 'docs', 'review', 'kiem-thu-12-10', 'srv.py')
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 11)
LOAI = [('kiem', 'sword'), ('thuong', 'spear'), ('bua', 'hammer'), ('phitieu', 'bow')]
# (cấp, hệ, Luyện, nhãn): mốc hình thái (không gân) × 3 hệ, rồi cấp có gân
CAP = [(0, None, 1, 'Trắng')] + [(c, h, [1, 3, 6, 12][c], '%s %s' % (['', 'Mầm', 'Thành hình', 'Thức tỉnh'][c], {'fire': 'Lửa', 'poison': 'Độc', 'ice': 'Băng'}[h]))
                                for c in (1, 2, 3) for h in ('fire', 'poison', 'ice')] + [(0, None, 2, 'Trắng gân'), (1, None, 4, 'Mầm gân'), (2, None, 7, 'Thành hình gân')]
DUNG = r'''([melee, bow, cap, he, lv]) => {
  T.room({ hero: 'smith', melee: bow ? 'sword' : melee, face: 1, bow, dum: [[60, 0]] });
  const P = T.P, sv = G.save, w = sv.weapons.find((q) => q.type === melee);
  G.vkMoi.datCap(w, cap, he); if (G.luyen && G.luyen.bat()) w.luyen = lv;
  T.hold({}, 20); P.face = 1;
  return [G.wStage(w), w.branch, w.luyen];
}'''


def mo(b, port, co):
    pg = b.new_page(viewport={'width': 844, 'height': 390}, device_scale_factor=1, is_mobile=True, has_touch=True)
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.goto('http://127.0.0.1:%d/linh-khi-nhe.html?cloud=0%s' % (port, co))
    pg.wait_for_function('window.G && G.scene', timeout=60000)
    pg.wait_for_function("() => { const SC = G.spriteCustom, z = SC && SC.zed; for (const m of ['zed-vk', 'zed-vk-he', 'zed-vk-gan', 'zed-rowan']) { const q = z && z[m]; if (q && !q.ready && SC.canAnh) SC.canAnh(m); if (!(q && q.ready)) return false; } return true; }", timeout=120000)
    if 'vkpl=1' in co:
        pg.wait_for_function("() => { const v = G.vkPl && G.vkPl(); return v && v.vk && v.he && v.gan; }", timeout=90000)
    pg.add_script_tag(path=os.path.join(TESTS, 'bot.js'))
    pg.add_script_tag(path=os.path.join(TESTS, 'setup.js'))
    pg.evaluate("() => { let q = 12345; Math.random = () => ((q = (q * 1664525 + 1013904223) >>> 0) / 4294967296); G.rnd = Math.random; G.testSave({ melee: 'sword' }); G.startStage(0, 2, 0, { kind: 'A', seed: 777 }); }")
    pg.wait_for_function("() => !!G.getRun()", timeout=120000)
    pg.wait_for_timeout(2500)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.evaluate(LIB)
    return pg, errs


def cat(pg, x, y):
    box = pg.evaluate("(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return [r.left, r.top, r.width / 480, G.getWorld().cam]; })()")
    hw, hh = 46, 34
    clip = {'x': box[0] + (x - box[3] - hw) * box[2], 'y': box[1] + (y - 14 - hh) * box[2], 'width': 2 * hw * box[2], 'height': 2 * hh * box[2]}
    return Image.open(io.BytesIO(pg.screenshot(clip=clip))).convert('RGB')


def chay(b, port, co, nhan, anh, loi):
    pg, errs = mo(b, port, co)
    for loai, melee in LOAI:
        for cap, he, lv, ten in CAP:
            pg.evaluate("() => { let q = 99; Math.random = () => ((q = (q * 1664525 + 1013904223) >>> 0) / 4294967296); G.rnd = Math.random; G.time = 10; }")
            pg.evaluate(DUNG, [melee, melee == 'bow', cap, he, lv])
            anh[(nhan, loai, ten, 'dung')] = cat(pg, *pg.evaluate('[T.P.x, T.P.y]'))
            pg.evaluate("T.hold({atkP:true,atk:true},1)"); pg.evaluate("T.hold({}, %d)" % (4 if melee != 'hammer' else 9))
            anh[(nhan, loai, ten, 'danh')] = cat(pg, *pg.evaluate('[T.P.x, T.P.y]'))
    loi += [nhan + ': ' + e for e in errs + pg.evaluate('T.errs')]
    pg.close()


def main():
    moi, cu, ra = sys.argv[1], sys.argv[2], sys.argv[3]
    os.makedirs(ra, exist_ok=True)
    s1 = subprocess.Popen([sys.executable, SRV, moi, '8841'], stderr=subprocess.DEVNULL)
    s2 = subprocess.Popen([sys.executable, SRV, cu, '8842'], stderr=subprocess.DEVNULL)
    time.sleep(1)
    anh, loi = {}, []
    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            chay(b, 8841, '', 'moi', anh, loi)
            chay(b, 8842, '&vkpl=1', 'thu', anh, loi)
            chay(b, 8841, '&vkpl=0', 'cu', anh, loi)
            b.close()
    finally:
        s1.kill(); s2.kill()
    khac = []
    for k, im in anh.items():
        if k[0] != 'moi':
            continue
        t = anh[('thu',) + k[1:]]
        bb = ImageChops.difference(im, t).convert('L').point(lambda v: 255 if v > 8 else 0)
        n = sum(1 for v in bb.getdata() if v)
        if n:
            khac.append(list(k[1:]) + [n])
            if len(khac) <= 4:
                g = Image.new('RGB', (im.width * 3, im.height)); g.paste(im, (0, 0)); g.paste(t, (im.width, 0)); g.paste(bb.convert('RGB'), (im.width * 2, 0))
                g.resize((g.width * 3, g.height * 3), Image.NEAREST).save(os.path.join('/tmp/claude-0/w', 'diff%d.png' % len(khac)))
    for loai, _ in LOAI:
        w, h = anh[('moi', loai, 'Trắng', 'dung')].size
        W2, H2 = w * 2, h * 2
        g = Image.new('RGB', (4 * (W2 + 4) + 4, 22 + len(CAP) * (H2 + 16)), (20, 16, 18)); d = ImageDraw.Draw(g)
        for i, t in enumerate(['PIXELLAB (mặc định) · đứng', 'PIXELLAB · đánh', 'CŨ ?vkpl=0 · đứng', 'CŨ · đánh']):
            d.text((8 + i * (W2 + 4), 4), t, font=F, fill=(255, 210, 122))
        for r, (cap, he, lv, ten) in enumerate(CAP):
            for i, kk in enumerate([('moi', 'dung'), ('moi', 'danh'), ('cu', 'dung'), ('cu', 'danh')]):
                x, y = 4 + i * (W2 + 4), 22 + r * (H2 + 16)
                g.paste(anh[(kk[0], loai, ten, kk[1])].resize((W2, H2), Image.NEAREST), (x, y)); d.text((x + 3, y + H2 + 1), ten, font=F, fill=(230, 220, 200))
        g.save(os.path.join(ra, 'tren-tay-%s.png' % loai))
    kq = {'so_o': sum(1 for k in anh if k[0] == 'moi'), 'khac_ban_thu_vkpl1': khac, 'loi': loi}
    json.dump(kq, open(os.path.join(ra, 'chup_vk.json'), 'w'), ensure_ascii=False, indent=1)
    print(json.dumps(kq, ensure_ascii=False)[:2000])
    return 1 if loi else 0


if __name__ == '__main__':
    sys.exit(main())
