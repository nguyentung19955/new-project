"""Chụp soát headless 844×390 ?cloud=0 (KHÔNG chơi tay): python3 chup.py <dist/linh-khi.html> <thư mục ra>
Ra: trum-1-2[-cu].png (ải 1-2, KHÔNG phải bản thử: phòng trùm nhỏ Nấm Chúa → hình Toadstool King; -cu = ?quaipl=0),
    so-<mã>-<vi|en>[-tencu].png (Sổ / Bestiary trang heoCon, hoaBaoTu, namChua; -tencu = ?ten=cu)."""
import os, sys, json
from playwright.sync_api import sync_playwright
from PIL import Image
HTML = os.path.abspath(sys.argv[1]); OUT = os.path.abspath(sys.argv[2]); os.makedirs(OUT, exist_ok=True)
GOC = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', '..'))
SETUP = os.path.join(GOC, 'game', 'tests', 'setup.js')
LOI = []
VAO = r'''() => { G.resetSave(); G.save.sound = false; G.save.tut.done = true; G.keys = {}; G.keyP = {}; G.startStage(0, 1, 0); const S = G.getRun(); S.fade = 0; S.mode = 'play';
  const id = S.map.rooms.findIndex((r) => r && r.type === 'boss'); return [!!S.slice, id]; }'''
PHONG = r'''(n) => { G.gotoRoom(n); const S = G.getRun(); S.fade = 0; S.mode = 'play'; S.trans = null; return S.idx; }'''
TRUM = r'''() => { const S = G.getRun(), Wd = S.W, b = Wd.boss; if (!b) return null; b.busy = 999; b.cd = 99; b.vx = 0; b.vy = 0; S.P.inv = 99; Wd.banner = null; S.hint = null;
  for (const k of Object.keys(Wd)) if (Array.isArray(Wd[k]) && /^(ents|projs|haz|hazards|zones|bullets|mobs|spawns|warns|aoes)$/.test(k)) Wd[k].length = 0;
  S.P.x = b.x - 90; S.P.y = b.y + 4; return { art: b.art, ten: b.name, slice: !!S.slice, tamMoi: !!(G.quaiPl && G.quaiPl.tamMoi && G.quaiPl.tamMoi('namChua')), tenHien: G.ten && G.ten.doi ? G.ten.doi(b.name) : null }; }'''
SO = r'''(o) => { G.ngonNgu.dat(o.lang, false); G.resetSave(); G.save = G.fixSave(G.save); const sv = G.save; sv.tut.done = true; sv.stars = { '0-0': 3, '0-1': 3, '0-2': 2, '0-3': 3, '0-4': 3, '1-0': 2 };
  sv.so.q = { heoCon: { g: 1, h: 34, k: 1, n: 7 }, hoaBaoTu: { g: 1, h: 6, k: 1, n: 1 }, namChua: { g: 1, h: 2, k: 1, n: 3 }, ongVo: { g: 1, h: 3 }, namPhong: { g: 1, h: 3 } }; sv.so.bu = 1;
  G.setScene(G.Village); const VA = G.villageApi, V = VA.V; VA.open('tu'); V.tab = 'so'; V.ttab = 'so'; V.soVung = 0; V.soSel = o.sel; V.msgT = 0; return [G.LANG, V.tab]; }'''


def mo(b, co=''):
    ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=1, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); pg.on('pageerror', lambda e: LOI.append(co + ': ' + str(e)))
    pg.goto('file://' + HTML + '?cloud=0' + co)
    pg.wait_for_function('() => window.G && G.scene && G.bia', timeout=180000); pg.wait_for_timeout(4000)
    pg.add_script_tag(path=SETUP)
    return ctx, pg


def trum(b, nhan, co):
    ctx, pg = mo(b, co)
    v = pg.evaluate(VAO); print(nhan, 'vào ải 1-2', v)
    pg.wait_for_timeout(1000); pg.evaluate(PHONG, v[1]); pg.wait_for_timeout(3500)
    print(nhan, 'trùm', pg.evaluate(TRUM)); pg.wait_for_timeout(500); pg.evaluate(TRUM); pg.wait_for_timeout(300)
    f = os.path.join(OUT, 'trum-1-2' + nhan + '.png'); pg.screenshot(path=f)
    bx = pg.evaluate('() => { const S = G.getRun(), b = S.W.boss, cam = G.camVe ? G.camVe(S.W) : Math.round(S.W.cam || 0); return [Math.round(b.x - cam), Math.round(b.y)]; }')
    im = Image.open(f); c = im.crop((max(0, bx[0] - 150), max(0, bx[1] - 140), min(844, bx[0] + 110), min(390, bx[1] + 40)))
    c.resize((c.width * 3, c.height * 3), Image.NEAREST).save(f[:-4] + '-x3.png')
    ctx.close()


def so(b, nhan, co):
    ctx, pg = mo(b, co)
    for lang in ('vi', 'en'):
        for sel in ('heoCon', 'hoaBaoTu', 'namChua'):
            pg.evaluate(SO, {'lang': lang, 'sel': sel}); pg.wait_for_timeout(900)
            pg.screenshot(path=os.path.join(OUT, 'so-%s-%s%s.png' % (sel, lang, nhan)))
    # chữ hiện ra (qua lớp đổi tên): tên + lời nhắc
    print(nhan, json.dumps(pg.evaluate(r'''() => { const r = {}; for (const lang of ['vi', 'en']) { G.ngonNgu.dat(lang, false);
      for (const s of ['Heo Rừng Con', 'Hoa Phun Bào Tử', 'Nấm Chúa', G.MEO_QUAI ? '' : '']) if (s) r[lang + ':' + s] = G.t ? G.t(s) : s; } G.ngonNgu.dat('vi', false); return r; }'''), ensure_ascii=False))
    ctx.close()


with sync_playwright() as p:
    b = p.chromium.launch()
    trum(b, '', ''); trum(b, '-cu', '&quaipl=0')
    so(b, '', ''); so(b, '-tencu', '&ten=cu')
    b.close()
print('LỖI TRANG:', LOI or 'không có')
