"""Đo kiếm (và giáo, búa) đè mặt em bé trong trận thật, bản HAI TỆP như web, iPhone ngang 844×390 dpr 3.
4 em bé × (thân gốc, bộ Rừng, Biển, Lâu) × 2 hướng × kịch bản: đứng → đi → chạy → dừng (chuyển chạy→đứng) → chém giữ nút (3 nhát)
→ ngay sau đòn → chạy mà chém → lộn → lướt chém → chiêu → trúng đòn → giữ lấy đà (vẽ giả, kiếm không có giữ thật).
Mỗi khung: điểm ảnh vũ khí còn thấy trong vùng mặt (SC.matKhung) / vùng đầu — kiem/do_mat.js.
Chạy: python3 do_mat.py <url đủ tham số> <tệp json ra> [thư mục gif] [loại vũ khí: sword|spear|hammer]"""
import base64, io, json, os, sys
from playwright.sync_api import sync_playwright

URL, OUT = sys.argv[1], sys.argv[2]
GIF = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != '-' else None
LOAI = sys.argv[4] if len(sys.argv) > 4 else 'sword'
DAY = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.join(DAY, '../../../../../game')
KIT = os.path.join(DAY, '../../full-audit/A-nhan-vat/kiem/tu_the.js')
JS = r"""([key, bo, face, loai, chup]) => {
  const { W, P } = AU.room({ hero: key, melee: loai === 'sword' ? 'sword' : loai, lvl: 10 });
  AU.want(P, loai);
  if (bo) P.outfit = AUD.outfit(bo, {}); else P.outfit = AUD.outfit(null, {});
  const f = face, bia = [AU.dummy(P.x + 26 * f, P.y, { hp: 1e7 })];
  const out = [], hinh = []; let pha = '';
  const ghi = (giu) => {
    const { r, cv } = DOMAT.doKhung(P, pha, giu);
    out.push(r);
    if (chup && out.length % 2 === 0) hinh.push(cv.toDataURL());
  };
  const chay = (n, giu) => AU.run(n, true, (i) => { AU.pin([{ e: bia[0], x: P.x + 26 * f, y: P.y }]); if (i) ghi(giu); });
  P.face = f;
  pha = 'đứng'; chay(40);
  pha = 'đi'; AU.press({ mx: 0.4 * f }); chay(30);
  pha = 'chạy'; AU.press({ mx: f }); chay(40);
  pha = 'chạy→đứng'; AU.press({ mx: 0 }); chay(24);
  pha = 'chém 3 nhát'; AU.press({ atkP: true, atk: true }); chay(80);
  pha = 'sau đòn'; AU.inp.atk = false; chay(30);
  pha = 'đứng→chạy'; AU.press({ mx: f }); chay(16);
  pha = 'chạy mà chém'; AU.press({ mx: f, atkP: true, atk: true }); chay(64);
  pha = 'sau đòn'; AU.inp.atk = false; AU.inp.mx = 0; chay(24);
  P.face = f;
  pha = 'lộn'; AU.press({ mx: f, dodgeP: true }); chay(18);
  pha = 'lướt chém'; AU.press({ mx: 0, atkP: true, atk: true }); chay(3); AU.inp.atk = false; chay(30);
  P.face = f; P.mana = P.maxmana; P.specCd = 0;
  pha = 'chiêu'; AU.press({ specialP: true }); chay(40);
  pha = 'trúng đòn'; P.hurtT = 0.25; P.inv = 0; chay(16);
  pha = 'đứng'; chay(20);
  pha = 'giữ lấy đà'; for (const ch of [0.1, 0.4, 0.7, 1]) { P.face = f; ghi({ mv: { holding: true, charge: ch } }); }
  return { out, hinh };
}"""
kq, loi = {}, []
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium')
    ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=3, is_mobile=True, has_touch=True)
    g = ctx.new_page(); g.on('pageerror', lambda e: loi.append(str(e)))
    g.goto(URL)
    g.wait_for_function("window.G && G.scene && G.spriteCustom && ['smith','hunter','wrestler','healer'].every(k => { const s = G.spriteCustom.get('em-be-'+k); return s && s.img && s.donMa; }) && G.spriteCustom.timVuKhi({type:'sword',family:0})", timeout=180000)
    g.evaluate("""() => { const SC = G.spriteCustom; try { SC.napSau && SC.napSau(); } catch (e) {} for (const m in SC.ds) if (/^em-be-/.test(m)) try { SC.canAnh(m); } catch (e) {} }""")
    try: g.wait_for_function("""() => Object.entries(G.spriteCustom.ds).filter(e => /^em-be-/.test(e[0])).every(e => e[1].ready || e[1].cu)""", timeout=120000)
    except Exception: print('chưa nạp đủ thân em bé')
    g.wait_for_timeout(1500)
    # nạp sẵn ảnh vũ khí mọi dòng của loại đang đo (ảnh tải khi cần: chưa có thì vẽ hình code -> hai lần đo khác nhau)
    for _ in range(40):
        thieu = g.evaluate("(L) => { const SC = G.spriteCustom; let n = 0; for (let f = 0; f < 10; f++) { const s = SC.do['vk-' + L + '-' + f]; if (s) { SC.timVuKhi({ type: L, family: f }); if (!s.ready) n++; } } return n; }", LOAI)
        if not thieu: break
        g.wait_for_timeout(500)
    print('ảnh vũ khí còn thiếu:', thieu, flush=True)
    for fn in ('bot.js', 'setup.js', 'au_lib.js'): g.add_script_tag(path=os.path.join(GAME, 'tests', fn))
    g.add_script_tag(path=KIT); g.add_script_tag(path=os.path.join(DAY, 'do_mat.js'))
    for key in os.environ.get('KEYS', 'smith,hunter,wrestler,healer').split(','):
        for bo in [None if b == 'goc' else b for b in os.environ.get('BOS', 'goc,rung,bien,lau').split(',')]:
            for face in (1, -1):
                chup = bool(GIF) and bo is None and face == 1
                r = g.evaluate(JS, [key, bo, face, LOAI, chup])
                kq['%s|%s|%d' % (key, bo or 'goc', face)] = r['out']
                if chup:
                    from PIL import Image
                    ims = []
                    for u in r['hinh']:
                        im = Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGBA')
                        bg = Image.new('RGBA', im.size, (74, 107, 60, 255)); bg.alpha_composite(im)
                        ims.append(bg.convert('RGB').resize((im.width * 2, im.height * 2), Image.NEAREST))  # 128 (gấp 2) → 256: phóng ×4 điểm ảnh game
                    os.makedirs(GIF, exist_ok=True)
                    json.dump([x['tt'] for x in r['out'][1::2]], open(os.path.join(GIF, key + '.nhan.json'), 'w'), ensure_ascii=False)
                    dai = Image.new('RGB', (len(ims) * 128, 128))  # dải khung gấp 2 (đủ nét 0,5 điểm ảnh)
                    for j, im in enumerate(ims): dai.paste(im.resize((128, 128), Image.NEAREST), (j * 128, 0))
                    dai.save(os.path.join(GIF, key + '.dai.png'))
                    ims[0].save(os.path.join(GIF, key + '.gif'), save_all=True, append_images=ims[1:], duration=33, loop=0)
            print(key, 'xong', flush=True)
    b.close()
json.dump(kq, open(OUT, 'w'), ensure_ascii=False)
print('pageerror:', loi or 'không có')
