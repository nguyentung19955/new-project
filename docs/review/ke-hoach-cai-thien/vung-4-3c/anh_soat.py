#!/usr/bin/env python3
"""Phiên 3C (chép từ vung-4-3b/anh_soat.py): ẢNH SOÁT TĨNH (không chơi thử): dựng phòng trùm ải 4-5, đưa trận tới từng lúc (ép chiêu, chạy G.sim),
vẽ MỘT khung (G.drawWorld) vào canvas thế giới, chép PNG. Trình duyệt không giao diện chỉ để có canvas thật.
  python3 anh_soat.py   → cac-luc.png (13 lúc pha 2, 3), bo-tron.png (6 lúc cảnh bỏ trốn), truoc-sau.png (pha 3: trái ?tl3c=0, phải 3C)
"""
import base64, io, os
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
URL = 'file://' + os.path.join(GAME, 'index.html') + '?cloud=0'
JS = """([luc, q]) => {
  G.testSave({ lvl: 40, sharpen: 15, branch: 'fire', marksMoi: 5000 }); const s = G.save; s.sound = false;
  for (let rr = 0; rr < 3; rr++) for (let ii = 0; ii < 5; ii++) s.stars[rr + '-' + ii] = 3;
  for (let ii = 0; ii < 4; ii++) s.stars['3-' + ii] = 1;
  const r0 = G.rnd; G.rnd = G.srand(77);
  const h0 = G.hurtPlayer; G.hurtPlayer = () => false;
  try {
    G.startStage(3, 4, 0); G.testGoto('boss');
    const W = G.getWorld(), b = W.boss, P = W.P;
    const dung = (x, y, n) => { for (let i = 0; i < n; i++) { P.x = x; P.y = y; G.sim(1); } };
    const cx = (W.x0 + W.x1) / 2, cy = (W.y0 + W.y1) / 2;
    for (let i = 0; i < 400 && b.invuln > 0; i++) dung(cx - 40, cy, 1);
    const pha = (p) => { for (const f of p >= 2 ? [0.6, 0.3] : [0.6]) { b.hp = b.maxhp * f; dung(cx - 60, cy, 2); for (let i = 0; i < 400 && b.invuln > 0; i++) dung(cx - 60, cy, 1); } b.ngConLai = 0; };
    const ra = (k, x, y, n) => { for (let i = 0; i < 900 && (b.busy > 0 || b.seq.length || (b.tl && b.tl.troi)); i++) dung(x, y, 1); b.dbg = k; b.cd = 0; b.last = null; b.ngConLai = 0; dung(x, y, n); };
    const x1 = W.x0 + 80;
    if (luc === 'pha2') { pha(1); dung(cx - 60, cy, 30); }
    else if (luc === 'xoayBao') { pha(1); ra('x2', x1, cy, 20); }
    else if (luc === 'xoay') { pha(1); ra('x2', x1, cy, 110); }
    else if (luc === 'gon') { pha(1); ra('l2', x1, cy, 120); }
    else if (luc === 'troi') { pha(1); ra('l2', x1, cy, 1); for (let i = 0; i < 600 && !(b.tl.troi && b.tl.troi.pha === 'lo'); i++) dung(x1, cy, 1); dung(x1, cy, 10); }
    else if (luc === 'dongDoi') { pha(1); b.tl.dong.doiT = 99; ra('d2', x1, cy - 40, 30); }
    else if (luc === 'troiGo') { pha(1); b.tl.dong.doiT = 99; ra('d2', x1, cy - 40, 102); }
    else if (luc === 'pha3') { pha(2); dung(cx - 60, cy, 30); }
    else if (luc === 'manhBao') { pha(2); ra('m3', x1, cy, 40); }
    else if (luc === 'manh') { pha(2); ra('m3', x1, cy, 130); }
    else if (luc === 'sietBao') { pha(2); ra('s3', x1, cy, 40); }
    else if (luc === 'siet') { pha(2); ra('s3', x1, cy, 90); ra('s3', x1, cy, 90); dung(x1, cy, 10); }
    else if (luc === 'lienHoan') { pha(2); ra('dl', b.x - 90, b.y, 70); }
    else if (luc.startsWith('tron')) { pha(2); dung(cx, cy, 10); G.kill(b, {}); const t0 = G.time; while (G.time - t0 < +luc.slice(4)) dung(x1, cy, 1); }
    G.noRender = false; G.drawWorld(3); G.ui && G.StageScene && G.StageScene.draw && (() => { try { G.StageScene.draw(); } catch (e) { /* chỉ lấy lớp trận */ } })();
    return { P: [W.P.x, W.P.y], png: G.wx.canvas.toDataURL('image/png'), el: b.el, ph: b.phase, ten: b.skillName, err: String((G.thuongLuong && G.thuongLuong.loiVe) || G.art.roomErr || '') };
  } finally { G.rnd = r0; G.hurtPlayer = h0; }
}"""

def anh(o):
    return Image.open(io.BytesIO(base64.b64decode(o['png'].split(',', 1)[1]))).convert('RGB')


def be(im, o):  # ảnh trình duyệt không giao diện không vẽ em bé (ảnh tải lười, như ảnh soát 2B, 3B): chấm vàng = chỗ em bé đứng
    im = im.copy(); d = ImageDraw.Draw(im); k = im.width / 480; x, y = o['P'][0] * k, o['P'][1] * k
    d.ellipse([x - 5 * k, y - 3 * k, x + 5 * k, y + 3 * k], outline=(255, 230, 60), width=2); d.line([x, y - 22 * k, x, y], fill=(255, 230, 60), width=2); return im


def nhan(im, chu):
    im = im.copy(); d = ImageDraw.Draw(im); d.rectangle([0, 0, 8 + 6 * len(chu), 12], fill=(0, 0, 0)); d.text((3, 1), chu, fill=(255, 255, 255)); return im


def luoi(ds, cot, ten):
    ds = [im.resize((im.width // 2, im.height // 2), Image.NEAREST) if im.width > 900 else im for im in ds]
    w, h = ds[0].size
    out = Image.new('RGB', (w * cot, h * ((len(ds) + cot - 1) // cot)), (0, 0, 0))
    for k, im in enumerate(ds): out.paste(im, ((k % cot) * w, (k // cot) * h))
    out.save(os.path.join(HERE, ten)); print('ghi', ten, out.size)


def mo(p, q):
    pg = p.new_page(viewport={'width': 960, 'height': 540})
    loi = []; pg.on('pageerror', lambda e: loi.append(str(e)))
    pg.goto(URL + q); pg.wait_for_timeout(3000)
    pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
    pg.evaluate('() => { G.resetSave(); G.save.sound = false; G.save.tut.done = true; }')
    return pg, loi


def chup(pg, ds, luc, chu):
    o = pg.evaluate(JS, [luc, None]); ds.append(nhan(be(anh(o), o), f'{chu} | {o["el"]} {o["ten"] or ""}'))
    if o['err']: print('LOI', luc, o['err'])


with sync_playwright() as p:
    br = p.chromium.launch()
    pg, loi = mo(br, '')
    pg.evaluate(JS, ['pha2', None]); pg.wait_for_timeout(4000)  # ảnh trùm tải lười: chờ tải xong rồi mới chụp
    ds = []
    for luc, chu in (('pha2', 'pha 2 Bang: dai Dong nuoc'), ('xoayBao', 'Xoay nuoc: bao'), ('xoay', 'Xoay nuoc'), ('gon', 'Lan-troi dop: gon duoi'),
                     ('troi', 'Lan-troi dop: troi, lo diem yeu'), ('dongDoi', 'Dong nuoc doi chieu: bao'), ('troiGo', 'Dong nuoc: tang bang troi'),
                     ('pha3', 'pha 3 Lua'), ('manhBao', 'Mua manh dong: bao'), ('manh', 'Mua manh dong: vat can'), ('sietBao', 'Siet san: bao'),
                     ('siet', 'Siet san: san hep 2 lan'), ('lienHoan', 'Dop lien hoan')):
        chup(pg, ds, luc, chu)
    luoi(ds, 3, 'cac-luc.png')
    ds2 = []
    for k in ('0.3', '0.8', '1.3', '2.1', '2.7', '3.3'):
        chup(pg, ds2, 'tron' + k, 'bo tron ' + k + ' giay')
    luoi(ds2, 3, 'bo-tron.png')
    pg2, loi2 = mo(br, '&tl3c=0')
    pg2.evaluate(JS, ['pha3', None]); pg2.wait_for_timeout(4000)
    t = []; chup(pg2, t, 'pha3', 'TRUOC (3B, ?tl3c=0) pha 3')
    s2 = []; chup(pg, s2, 'manh', 'SAU (3C) pha 3')
    luoi([t[0], s2[0]], 2, 'truoc-sau.png')
    print('lỗi trang:', loi[:3], loi2[:3])
    br.close()
