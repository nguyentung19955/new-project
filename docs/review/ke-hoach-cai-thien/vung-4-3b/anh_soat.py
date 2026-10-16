#!/usr/bin/env python3
"""Phiên 3B: ẢNH SOÁT TĨNH (không chơi thử): dựng phòng trùm ải 4-5, đưa trận tới từng lúc (ép chiêu bằng G.bossDebug, chạy G.sim),
vẽ MỘT khung (G.drawWorld) vào canvas thế giới, chép PNG. Trình duyệt không giao diện chỉ để có canvas thật.
  python3 anh_soat.py   → cac-luc.png (8 lúc của trận), truoc-sau.png (trái: phiên 1 ?tlrieng=0, phải: phiên 3B)
"""
import base64, io, os
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', 'game'))
URL = 'file://' + os.path.join(GAME, 'index.html') + '?cloud=0'
JS = """([luc]) => {
  G.testSave({ lvl: 40, sharpen: 15, branch: 'fire', marksMoi: 5000 }); const s = G.save; s.sound = false;
  for (let rr = 0; rr < 3; rr++) for (let ii = 0; ii < 5; ii++) s.stars[rr + '-' + ii] = 3;
  for (let ii = 0; ii < 4; ii++) s.stars['3-' + ii] = 1;
  const r0 = G.rnd; G.rnd = G.srand(77);
  const h0 = G.hurtPlayer; G.hurtPlayer = () => false;
  try {
    G.startStage(3, 4, 0); G.testGoto('boss');
    const W = G.getWorld(), b = W.boss, P = W.P;
    const dung = (x, y, n) => { for (let i = 0; i < n; i++) { P.x = x; P.y = y; G.sim(1); } };
    for (let i = 0; i < 400 && b.invuln > 0; i++) dung((W.x0 + W.x1) / 2 - 40, (W.y0 + W.y1) / 2, 1);
    const ra = (k, x, y, n) => { for (let i = 0; i < 600 && (b.busy > 0 || b.seq.length); i++) dung(x, y, 1); b.dbg = k; b.cd = 0; b.last = null; dung(x, y, n); };
    const cx = (W.x0 + W.x1) / 2, cy = (W.y0 + W.y1) / 2;
    if (luc === 'dau') dung(cx - 60, cy, 30);
    else if (luc === 'duoi') ra('c1', W.x0 + 90, W.y0 + 8, 50);
    else if (luc === 'quet') ra('c1', W.x0 + 90, W.y0 + 8, 76);
    else if (luc === 'phun') ra('c2', W.x0 + 60, cy + 20, 58);
    else if (luc === 'vom') ra('c3', W.x0 + 90, cy, 90);
    else if (luc === 'song') { b.cd = 99; for (let i = 0; i < 112; i++) { b.cd = 99; dung(W.x0 + 120, W.y1 - 6, 1); } }
    else if (luc === 'pha2') { b.hp = b.maxhp * 0.6; dung(cx - 60, cy, 2); for (let i = 0; i < 400 && b.invuln > 0; i++) dung(cx - 60, cy, 1); dung(cx - 60, cy, 20); }
    else if (luc === 'pha3') { b.hp = b.maxhp * 0.3; dung(cx - 60, cy, 2); for (let i = 0; i < 400 && b.invuln > 0; i++) dung(cx - 60, cy, 1); b.hp = b.maxhp * 0.28; dung(cx - 60, cy, 2); for (let i = 0; i < 400 && b.invuln > 0; i++) dung(cx - 60, cy, 1); dung(cx - 60, cy, 20); }
    else if (luc === 'xong') { b.invuln = 0; b.hp = 1; G.damage(b, 1e9, { el: 'fire' }); for (let i = 0; i < 900 && !W.safe; i++) dung(cx, cy, 1); dung(cx, cy, 40); }
    G.noRender = false; G.drawWorld(3); G.ui && G.StageScene && G.StageScene.draw && (() => { try { G.StageScene.draw(); } catch (e) { /* chỉ lấy lớp trận */ } })();
    return { P: [W.P.x, W.P.y], safe: !!W.safe, rut: W.tlRut, png: G.wx.canvas.toDataURL('image/png'), el: b.el, ph: b.phase, ten: b.skillName, err: String((G.thuongLuong && G.thuongLuong.loiVe) || G.art.roomErr || '') };
  } finally { G.rnd = r0; G.hurtPlayer = h0; }
}"""


def anh(o):
    return Image.open(io.BytesIO(base64.b64decode(o['png'].split(',', 1)[1]))).convert('RGB')


def be(im, o):  # ảnh trình duyệt không giao diện không vẽ em bé (ảnh tải lười, như ảnh soát 2B): chấm vàng = chỗ em bé đứng
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


with sync_playwright() as p:
    br = p.chromium.launch()
    pg, loi = mo(br, '')
    pg.evaluate(JS, ['dau']); pg.wait_for_timeout(4000)  # ảnh nhân vật / trùm tải lười: chờ tải xong rồi mới chụp
    ds = []
    for luc, chu in (('dau', 'pha 1 Doc'), ('duoi', 'Quat duoi: bao'), ('quet', 'Quat duoi: quet'), ('phun', 'Phun nuoc den + vet'),
                     ('vom', 'Vong than: lo diem yeu'), ('song', 'Vo song bo (mep duoi)'), ('pha2', 'pha 2 Bang'), ('pha3', 'pha 3 Lua')):
        o = pg.evaluate(JS, [luc]); ds.append(nhan(be(anh(o), o), f'{chu} | {o["el"]} {o["ten"] or ""}'))
        if o['err']: print('LOI', luc, o['err'])
    o = pg.evaluate(JS, ['xong']); print('xong', o['safe'], o['rut']); ds.append(nhan(be(anh(o), o), 'ha xong: nuoc rut'))
    luoi(ds, 3, 'cac-luc.png')
    sau = ds[0]
    pg2, loi2 = mo(br, '&tlrieng=0')
    pg2.evaluate(JS, ['dau']); pg2.wait_for_timeout(4000)
    o = pg2.evaluate(JS, ['dau']); truoc = nhan(be(anh(o), o), 'TRUOC (phien 1, ?tlrieng=0)')
    luoi([truoc, nhan(sau, 'SAU (phien 3B)')], 2, 'truoc-sau.png')
    print('lỗi trang:', loi[:3], loi2[:3])
    br.close()
