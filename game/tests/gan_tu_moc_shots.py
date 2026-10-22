"""Kiểm luật gân TỪ MỐC (22/10, docs/review/ke-hoach-cai-thien/gan-tu-moc/bao-cao.md). KHÔNG chơi thử: đặt bản lưu, nâng cấp Luyện
bằng G.luyen.nang(sv, w, 'fire', true) từng cấp, hỏi G.vkGan / G.vkGanAnh, rồi chụp Cu Tí đứng cầm kiếm vuông Lv 3 và Lv 6.
Mở dist/linh-khi.html?cloud=0 (chạy python3 build.py trước).

  python3 tests/gan_tu_moc_shots.py [thư mục ra]   (mặc định docs/review/ke-hoach-cai-thien/gan-tu-moc/)

In: bảng cấp 1–15 × 4 loại vũ khí → G.vkGan (luật) và có ảnh gân thật hay không (ô zed-vk-gan). Cần: Lv 2, 3–5, 6–11 có gân;
1 và 12–15 không (thương 3–11: luật bật nhưng ô gân Mầm / Thành hình trống → không ảnh). Ra: kiem-vuong-lv3-lv6.png (844×390)."""
import io, os, sys
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import au_phan_hoi_shots as AP

HERE = AP.HERE
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(HERE), 'docs', 'review', 'ke-hoach-cai-thien', 'gan-tu-moc')
LOAI = [('sword', 'kiem', 'Kiếm'), ('spear', 'thuong', 'Thương'), ('hammer', 'bua', 'Búa'), ('bow', 'phitieu', 'Phi tiêu')]
CAN = {1: False, 2: True, 3: True, 4: True, 5: True, 6: True, 7: True, 8: True, 9: True, 10: True, 11: True, 12: False, 13: False, 14: False, 15: False}

# Nâng từng cấp 1 → 15 bằng G.luyen.nang (đã trả = true), ghi [cấp, hình thái, G.vkGan, có ảnh gân (vkGanAnh ≠ null), tên ô gân]
BANG = r"""((type) => {
  const sv = G.testSave({ melee: type === 'bow' ? 'sword' : type, luyen: 1 });
  const w = sv.weapons.find((x) => x.type === type); G.luyen.dongBo(w);
  const SC = G.spriteCustom, kv = SC.kiemVuong && SC.kiemVuong();
  const loai = { sword: 'kiem', spear: 'thuong', hammer: 'bua', bow: 'phitieu' }[type];
  const V = SC.zed['zed-vk'].tep.vk, VK = kv && loai === 'kiem' ? V.kiem_vuong || V.kiem : V[loai];
  const ra = [];
  for (let lv = 1; lv <= 15; lv++) {
    if (G.luyen.cap(w) !== lv) throw new Error('cap ' + G.luyen.cap(w) + ' != ' + lv);
    const cap = G.luyen.hinhThai(lv), r = VK[cap];
    const gan = G.vkGan(w, cap), a = gan && r ? G.vkGanAnh(loai, cap, r) : null;
    ra.push([lv, cap, !!gan, !!a]);
    if (lv < 15) { const k = G.luyen.nang(sv, w, 'fire', true); if (!k) throw new Error('nang that bai o ' + lv); }
  }
  return { kv: !!kv, ra };
})"""


LIB2 = r"""
window.LK2 = {
  dung(t, L, gan) {
    G.VK_GAN = gan;
    const xy = T.room({ melee: t === 'bow' ? 'sword' : t, bow: t === 'bow', shift: 0 });
    const P = T.P;
    for (const w of [P.weapons ? P.weapons[0] : null, P.weapons ? P.weapons[1] : null, ...(G.save.weapons || [])]) {
      if (!w) continue; w.luyen = L; if (L >= 3 && !w.branch) w.branch = 'fire'; G.luyen.dongBo(w);
    }
    T.run({}, 30);
    const W = G.getWorld();
    return [P.x - (W.cam || 0), P.y];
  },
};
"""


def mo(p, vp):
    b = p.chromium.launch()
    pg = b.new_page(viewport=vp)
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.goto('file://' + HERE + '/dist/linh-khi.html?cloud=0')
    pg.wait_for_function('window.G && G.scene', timeout=60000)
    pg.evaluate("(() => { const SC = G.spriteCustom; for (const m of ['zed-moi', 'zed-vk', 'zed-vk-gan']) SC.canAnh && SC.canAnh(m); })()")
    pg.wait_for_function("() => ['zed-moi', 'zed-vk', 'zed-vk-gan'].every((m) => G.spriteCustom.zed[m] && G.spriteCustom.zed[m].ready)", timeout=60000)
    pg.wait_for_timeout(1500)
    pg.evaluate("window.requestAnimationFrame = () => 0")
    pg.add_script_tag(path=os.path.join(HERE, 'tests', 'bot.js'))
    pg.add_script_tag(path=os.path.join(HERE, 'tests', 'setup.js'))
    pg.evaluate(AP.LIB)
    pg.evaluate(LIB2)
    return b, pg, errs


def canvas_box(pg):
    return pg.evaluate("(() => { const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); return [r.left, r.top, r.width / 480]; })()")


def main():
    os.makedirs(OUT, exist_ok=True)
    F = ImageFont.truetype(AP.FONT, 20)
    F2 = ImageFont.truetype(AP.FONT, 15)
    loi = []
    with sync_playwright() as p:
        b, pg, errs = mo(p, {'width': 1440, 'height': 810})
        bang = {}
        for t, loai, ten in LOAI:
            kq = pg.evaluate(BANG + "('%s')" % t)
            bang[t] = kq['ra']
        print('kiếm vuông đang bật:', kq['kv'])
        print('%-9s' % 'Lv', *['%-11s' % x[2] for x in LOAI])
        for i in range(15):
            lv = i + 1
            cot = []
            for t, loai, ten in LOAI:
                _, cap, gan, anh = bang[t][i]
                cot.append('%-11s' % ('gân+ảnh' if anh else 'gân-ảnh∅' if gan else '—'))
                if gan != CAN[lv]: loi.append('%s Lv %d: G.vkGan=%s, cần %s' % (ten, lv, gan, CAN[lv]))
                if anh != (CAN[lv] and not (t == 'spear' and lv >= 3)): loi.append('%s Lv %d: ảnh gân=%s (không như dự kiến)' % (ten, lv, anh))
            print('%-9s' % ('Lv %d' % lv), *cot)
        # chụp Cu Tí cầm kiếm vuông Lv 3 / Lv 6 (đứng, phòng trống) → 1 ảnh 844×390
        cap = []
        for L in (3, 6):
            x, y = pg.evaluate("LK2.dung('sword', %d, true)" % L)
            bx = canvas_box(pg)
            hw, hh = 52, 40
            clip = {'x': bx[0] + (x - hw) * bx[2], 'y': bx[1] + (y - hh - 10) * bx[2], 'width': 2 * hw * bx[2], 'height': 2 * hh * bx[2]}
            cap.append(Image.open(io.BytesIO(pg.screenshot(clip=clip))).convert('RGB'))
        pg.evaluate('G.VK_GAN = true')
        errs += pg.evaluate('T.errs')
        b.close()
    out = Image.new('RGB', (844, 390), '#140f10'); d = ImageDraw.Draw(out)
    d.text((12, 8), 'Cu Ti cam KIEM VUONG - gan tu moc (22/10). Trai: Lv 3 (gan Mam). Phai: Lv 6 (gan Thanh hinh)', font=F2, fill='#ffd27a')
    for k, (im, nhan) in enumerate(zip(cap, ('Lv 3 - gan Mam', 'Lv 6 - gan Thanh hinh'))):
        im = im.resize((im.width * 340 // im.height, 340), Image.NEAREST)
        x0 = 12 + k * 420
        out.paste(im, (x0, 36))
        d.text((x0 + 4, 36 + 340 - 26), nhan, font=F, fill='#ffe9a8')
    f = os.path.join(OUT, 'kiem-vuong-lv3-lv6.png'); out.save(f); print('ghi', f)
    print('--- lỗi JS: %d' % len(errs))
    for e in errs[:20]: print('  ' + str(e)[:300])
    print('--- sai luật: %d' % len(loi))
    for e in loi: print('  ' + e)
    return 1 if errs or loi else 0


sys.exit(main())
