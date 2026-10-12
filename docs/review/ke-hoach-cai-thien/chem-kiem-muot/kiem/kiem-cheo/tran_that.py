"""Chơi thật trong trận (bản hai tệp như web): 4 em bé cầm kiếm, chạy luật game thật từng khung 1/60 giây (tests/au_lib.js),
VẼ từng khung (G.drawWorld: có vệt chém, khựng hình) rồi đo góc kiếm đã vẽ, lớp trước/sau, lúc bia mất máu.
Kịch bản: giữ nút Đánh đứng yên (chuỗi liên tục) -> nhả, vừa chạy phải vừa giữ Đánh -> dừng, chạy trái vừa đánh (quay trái),
chiêu Trảm Nguyệt, Né rồi lướt chém. Cắt khung quanh em bé để làm GIF.
Chạy: python3 tran_that.py <url đủ tham số> <thư mục ra> <nhãn> [rộng cao dpr]"""
import base64, io, json, os, sys
from PIL import Image
from playwright.sync_api import sync_playwright

URL, OUT, NHAN = sys.argv[1], sys.argv[2], sys.argv[3]
VW, VH, DPR = (int(sys.argv[4]), int(sys.argv[5]), float(sys.argv[6])) if len(sys.argv) > 6 else (844, 390, 3)
GAME = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../../../../game')
os.makedirs(OUT, exist_ok=True)
JS = r"""([key, chup]) => {
  const TL = G.tinhLinh, K = 3, CW = 84, CH = 72, frames = [], log = [];
  const { W, P } = AU.room({ hero: key, melee: 'sword', lvl: 10 });
  AU.want(P, 'sword');
  const bia = [AU.dummy(P.x + 26, P.y, { hp: 1e7 }), AU.dummy(P.x - 26, P.y, { hp: 1e7 })];
  let hp0 = bia.map((e) => e.hp), pha = '';
  const anh = () => {
    try { G.drawWorld(G.getRun().r); } catch (er) { log.push({ loi: String(er) }); }
    const o = G.heroArgs(P), vg = TL.vkGhep(o), w = vg.wp;
    const r = { pha, atk: +(o.atk.toFixed(3)), c: P.comboI, ang: w ? w.ang : null, truoc: w ? !!w.front : null, mat: P.face, chay: !!P.moving, trung: 0, dash: P.dashT > 0, spec: P.specT > 0 };
    bia.forEach((e, i) => { if (e.hp < hp0[i]) { r.trung++; hp0[i] = e.hp; } });
    log.push(r);
    if (chup && log.length % 2 === 0) {
      const cv = G.wx.canvas, sc = cv.width / G.W, cam = Math.round(W.cam);
      const c = document.createElement('canvas'); c.width = CW * K; c.height = CH * K; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
      x.drawImage(cv, (P.x - cam - CW / 2) * sc, (P.y - CH + 14) * sc, CW * sc, CH * sc, 0, 0, CW * K, CH * K);
      frames.push(c.toDataURL());
    }
  };
  const chay = (n, each) => AU.run(n, true, (i) => { if (each) each(i); AU.pin([{ e: bia[0], x: P.x + 26, y: P.y }, { e: bia[1], x: P.x - 26, y: P.y }]); if (i) anh(); });
  // 1. đứng yên giữ Đánh (chuỗi liên tục) rồi nhả
  pha = 'dung-chem'; P.face = 1; AU.press({ atkP: true, atk: true }); chay(80); AU.inp.atk = false; pha = 'nha'; chay(24);
  // 2. chạy phải vừa giữ Đánh rồi dừng
  pha = 'chay-chem'; AU.press({ mx: 1, atkP: true, atk: true }); chay(64); AU.inp.atk = false; AU.inp.mx = 0; pha = 'dung'; chay(20);
  // 3. chạy trái vừa giữ Đánh (quay trái)
  pha = 'trai-chem'; AU.press({ mx: -1, atkP: true, atk: true }); chay(64); AU.inp.atk = false; AU.inp.mx = 0; pha = 'dung'; chay(20);
  // 4. chiêu Trảm Nguyệt
  P.face = 1; P.mana = P.maxmana; P.specCd = 0; pha = 'chieu'; AU.press({ specialP: true }); chay(40);
  // 5. Né rồi lướt chém
  pha = 'ne-luot'; AU.press({ mx: 1, dodgeP: true }); chay(14); AU.press({ mx: 0, atkP: true, atk: true }); chay(3); AU.inp.atk = false; chay(36);
  return { log, frames };
}"""
loi = []
tong = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx = b.new_context(viewport={'width': VW, 'height': VH}, device_scale_factor=DPR, is_mobile=DPR > 1.5, has_touch=DPR > 1.5)
    g = ctx.new_page(); g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto(URL)
    g.wait_for_function("window.G && G.scene && G.spriteCustom && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img && s.donMa; }) && G.spriteCustom.timVuKhi({type:'sword',family:0})", timeout=180000)
    g.wait_for_timeout(1500)
    for f in ('bot.js', 'setup.js', 'au_lib.js'):
        g.add_script_tag(path=os.path.join(GAME, 'tests', f))
    for k in ('smith', 'hunter', 'wrestler', 'healer'):
        r = g.evaluate(JS, [k, True])
        tong[k] = r['log']
        ims = [Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB') for u in r['frames']]
        q = [im.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE) for im in ims]
        q[0].save(os.path.join(OUT, f'{NHAN}-{k}.gif'), save_all=True, append_images=q[1:], duration=33, loop=0, optimize=True)
    b.close()
json.dump(tong, open(os.path.join(OUT, f'{NHAN}.json'), 'w'), ensure_ascii=False)
print('pageerror:', loi or 'không có')
for k, log in tong.items():
    loi_ve = [x for x in log if 'loi' in x]
    nhay, lop, ra = 0, 0, []
    for a, c in zip(log, log[1:]):
        if 'loi' in a or 'loi' in c or a['ang'] is None or c['ang'] is None: continue
        d = abs(c['ang'] - a['ang'])
        vung = c['atk'] >= 0 and a['atk'] >= 0 and a['atk'] < 0.5 and c['atk'] > 0.38 and not c['dash']
        if not vung and a['pha'] == c['pha'] and not c['dash'] and not a['dash'] and not (c['spec'] or a['spec']): nhay = max(nhay, d)
        if a['truoc'] != c['truoc']: lop += 1
    for x in log:
        if x.get('trung') and x['pha'] in ('dung-chem', 'chay-chem', 'trai-chem'): ra.append((x['atk'], x['ang'], x['c']))
    print('%-9s lỗi vẽ %d | nhảy góc lớn nhất ngoài cú vung %d độ/khung | đổi lớp %d | lúc bia mất máu (tiến độ, góc, nhát): %s' % (k, len(loi_ve), nhay, lop, ra[:9]))
