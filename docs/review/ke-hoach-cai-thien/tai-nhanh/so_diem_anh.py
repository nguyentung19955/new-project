"""So điểm ảnh các cảnh mẫu giữa các cách đóng gói (tải nhanh 12/10).
Mỗi bản: mở trang, chờ MỌI ảnh nạp xong, dừng vòng lặp thật, cố định ngẫu nhiên + đồng hồ, dựng từng cảnh bằng cùng một kịch bản,
vẽ một khung rồi chụp màn 844x390 (dpr 3). So từng điểm ảnh với bản gốc (bản một tệp, ảnh PNG nhúng sẵn).
python3 so_diem_anh.py <thư mục ra> <tên=url> [<tên=url> ...]   (tên đầu là bản gốc; thêm '#nowebp' sau url = giả lập trình duyệt không đọc WebP)"""
import json, os, sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops

RA = sys.argv[1]
BAN = [a.split('=', 1) for a in sys.argv[2:]]
SETUP = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'game', 'tests', 'setup.js'), encoding='utf-8').read()
# Giả lập trình duyệt KHÔNG đọc được WebP: mọi ảnh WebP (data: hay tệp .webp) đều báo lỗi.
KHONG_WEBP = r"""(() => {
  const d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  Object.defineProperty(HTMLImageElement.prototype, 'src', { configurable: true, get() { return d.get.call(this); }, set(v) {
    if (/^data:image\/webp|\.webp(\?|$)/.test(String(v))) { window.__webpBiChan = (window.__webpBiChan || 0) + 1; return d.set.call(this, 'data:image/x-khong-doc-duoc;base64,AAAA'); }
    return d.set.call(this, v); } });
})();"""
# Dừng nhịp logic ngay khi mã game chạy xong (trước nhịp đầu): mọi bản bắt đầu các cảnh từ cùng một trạng thái (làng ở màn chào không tự chạy
# theo thời gian thật). Khung hình vẫn vẽ (để màn chào vẽ xong và game bắt đầu tải ảnh như thật).
DUNG_NHIP = r"""document.addEventListener('DOMContentLoaded', () => { if (window.G && G.tick) { window.__T0 = G.tick; G.tick = function () {}; } });"""
CHO = r"""() => { const SC = G.spriteCustom, FA = G.fxAnh; if (!SC || !SC.sau) return false;
  if (!/^(xong|khong|loi)$/.test(SC.sau.tt)) return false;
  for (const o of [SC.ds, SC.do || {}, SC.gd || {}, FA.ds]) for (const k in o) if (!o[k].ready) return false;
  for (const k in SC.don) if (!SC.don[k].img) return false;
  return true; }"""
DUNG = r"""() => {
  if (!window.__T0) window.__T0 = G.tick; G.tick = function () {}; G.noRender = true;
  Date.now = () => 1790000000000; performance.now = () => 123456;
  window.__ve = function () { G.noRender = false; if (G.NET !== G.netMuon()) G.setNet(G.netMuon()); G.ui.begin(); G.scene.draw(); if (G.theme && G.theme.endFrame) G.theme.endFrame(); };
  // Vẽ HAI lần, chụp lần sau: trạng thái bút (độ dày nét, màu viền…) còn lại từ khung trước không làm lệch ảnh (game có chỗ dựa vào trạng thái đó).
  window.__ve = ((v) => function () { v(); v(); G.noRender = true; })(window.__ve);
  window.__chay = function (n, moi) { for (let i = 0; i < n; i++) { if (moi) moi(i); G.time += 0; window.__T0(); G.click = null; } };
  window.__hat = function (s) { const r = G.srand(s); Math.random = r; G.rnd = r; G.time = 0; };
}"""
CANH = {
  'man-chao': "() => { __hat(1); G.resetSave(); G.save.sound = false; G.setScene(G.Title); __chay(30); __ve(); }",
  'lang': "() => { __hat(2); G.testSave({ hero: 'smith', lvl: 12, tier: 1 }); G.setScene(G.Village); __chay(40); __ve(); }",
  'em-be-mac-do': """() => { __hat(3); const sv = G.testSave({ hero: 'hunter', lvl: 20, tier: 2, branch: 'ice', marks: 300 }); const O = G.outfit; O.sync(sv);
     const bo = {}; for (const k in O.ITEMS) { const T = O.ITEMS[k]; if (T.set && !bo[T.slot]) bo[T.slot] = k; }
     for (const s in bo) O.wear(sv, O.add(sv, bo[s], 2, { lv: 2 })); G.setScene(G.Village); __chay(40); __ve(); return bo; }""",
}
for r, ten in enumerate(['rung', 'bien', 'lau-dai']):
    CANH['vung-' + ten] = """() => { __hat(%d); G.testSave({ lvl: 10, tier: 1, branch: 'fire', marks: 140 }); G.startStage(%d, 1, 0, { kind: 'A', seed: 11 });
      const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; G.testGoto('fight'); const W = S.W, P = S.P; W.waves = []; W.spawns = []; W.ents.length = 0; P.inv = 999;
      ['rusher', 'swarm', 'shield', 'archer', 'nimble', 'kami', 'bomber', 'spiky', 'elite'].forEach((role, i) => {
        const e = G.spawnEnemy(role, W.x0 + (W.x1 - W.x0) * (0.2 + 0.3 * (i %% 3)), W.y0 + (W.y1 - W.y0) * (0.3 + 0.22 * Math.floor(i / 3)), {}); e.speed = 0; e.cd = 99; e.inside = true; });
      __chay(20); __ve(); }""" % (10 + r, r)
    CANH['trum-' + ten] = """() => { __hat(%d); G.testSave({ lvl: 30, tier: 2, branch: 'ice', marks: 300 }); G.startStage(%d, 4, 0, { kind: 'A', seed: 3 });
      const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; G.gotoRoom(S.map.boss); S.P.inv = 999; __chay(90); __ve(); }""" % (20 + r, r)
CANH['hieu-ung'] = """() => { __hat(30); G.testSave({ hero: 'smith', melee: 'sword', lvl: 30, tier: 2, sharpen: 6, branch: 'fire', marks: 300 }); G.startStage(0, 2, 0, { kind: 'A', seed: 4242 });
  const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; G.testGoto('fight'); const W = S.W, P = S.P; W.waves = []; W.spawns = []; W.ents.length = 0; P.inv = 999; P.mana = P.maxmana;
  for (let i = 0; i < 4; i++) { const e = G.spawnEnemy(['rusher', 'shield', 'swarm', 'elite'][i], P.x + 20 + i * 8, P.y - 10 + i * 6, { hpMult: 1e4 }); e.speed = 0; e.cd = 99; e.inside = true; }
  let k = 0; G.botInput = () => { k++; return { mx: 1, my: 0, atk: true, atkP: k % 9 === 1, dodgeP: false, specialP: k === 20, skillP: k === 8, skill: false, swapP: false, potionP: false, pauseP: false, mapP: false }; };
  __chay(26); G.botInput = null; __ve(); }"""


def main():
    os.makedirs(RA, exist_ok=True)
    kq = {}
    with sync_playwright() as pw:
        b = pw.chromium.launch(args=['--ignore-certificate-errors', '--host-resolver-rules=MAP fonts.googleapis.com 127.0.0.1:9, MAP fonts.gstatic.com 127.0.0.1:9'])
        for ten, url in BAN:
            nw = url.endswith('#nowebp')
            ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True, ignore_https_errors=True)
            pg = ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.add_init_script(DUNG_NHIP)
            if nw: pg.add_init_script(KHONG_WEBP)
            pg.goto(url.replace('#nowebp', ''), timeout=120000)
            pg.wait_for_function(CHO, timeout=180000, polling=250)
            pg.wait_for_timeout(1500)
            info = pg.evaluate("() => ({ webp: G.spriteCustom.roi ? G.spriteCustom.roi.webp : null, chan: window.__webpBiChan || 0, tai: G.spriteCustom.sau.tt })")
            pg.add_script_tag(content=SETUP)
            pg.evaluate(DUNG)
            kq[ten] = {'info': info, 'canh': {}}
            for c, js in CANH.items():
                pg.evaluate(js)
                pg.screenshot(path=os.path.join(RA, '%s-%s.png' % (c, ten)))
            kq[ten]['loi'] = errs
            ctx.close()
        b.close()
    goc = BAN[0][0]
    for ten, _ in BAN[1:]:
        for c in CANH:
            a = Image.open(os.path.join(RA, '%s-%s.png' % (c, goc))).convert('RGBA'); bb = Image.open(os.path.join(RA, '%s-%s.png' % (c, ten))).convert('RGBA')
            d = ImageChops.difference(a, bb)
            n = sum(1 for p in d.get_flattened_data() if p != (0, 0, 0, 0)) if hasattr(d, 'get_flattened_data') else sum(1 for p in d.getdata() if p != (0, 0, 0, 0))
            kq[ten]['canh'][c] = n
    print(json.dumps(kq, ensure_ascii=False, indent=1))
    json.dump(kq, open(os.path.join(RA, 'ket-qua.json'), 'w'), ensure_ascii=False, indent=1)


main()
