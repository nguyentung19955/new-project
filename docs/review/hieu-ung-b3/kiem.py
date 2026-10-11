"""Phiên hieu-ung-b3 (nổ, trạng thái, trùm, cổng): MỘT lượt kiểm nhanh bằng Playwright.
Chạy từ thư mục gốc repo:
  python3 docs/review/hieu-ung-b3/kiem.py <thư mục bản code CŨ để so>   (ví dụ một git worktree của commit trước phiên này)
Làm gì:
  1) tự dựng 15 dải mẫu (nền đúng màu prompt, có kẻ lưới, rộng 1536 như ảnh ChatGPT) → đưa vào trang tools/tach-hieu-ung ở cỡ màn iPhone
     → phải ĐẠT, tệp có "net": 2, bấm Tải ra đủ 2 bản; chép lại mọi prompt để so với bản cũ (40 mục cũ không được đổi một chữ);
  2) game: cùng một kịch bản 15 hiệu ứng trong phòng, chụp bản CŨ / bản MỚI không có tệp (phải khác 0 điểm ảnh) / bản MỚI nạp tạm 15 tệp mẫu;
  3) ghép ảnh kiểm docs/review/hieu-ung-b3/anh-kiem.png và anh-kiem-trang-tach.png.
Không ghi gì vào game/art/custom. Dải mẫu và tệp mẫu chỉ nằm trong thư mục tạm."""
import base64, functools, http.server, io, json, math, os, sys, tempfile, threading
from PIL import Image, ImageChops, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OLD = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else None
TMP = tempfile.mkdtemp(prefix='b3-')
NEN = {'duong': (0, 0, 255), 'hong': (255, 0, 255), 'xanh': (0, 255, 0)}


def serve(root):
    class Im(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Im, directory=root))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return 'http://127.0.0.1:%d' % s.server_address[1]


# ---------- 1) dải mẫu: mỗi khung một hình đơn giản đổi theo thời gian, có "mào" cam ở phía trên để soi lật/lộn ----------
def dai_mau(q, path):
    so, fw, fh = q['so'], q['fw'], q['fh']
    cw = 1536 // so; ch = round(cw * fh / fw)
    im = Image.new('RGB', (cw * so, ch), NEN[q['nen']])
    d = ImageDraw.Draw(im)
    V = (20, 24, 46)
    ma = q['ma']
    sang = (251, 254, 208) if q.get('phe') == 'ta' else (160, 52, 9) if q.get('phe') == 'quai' else (244, 191, 77)
    mep = (50, 176, 233) if ('bang' in ma or 'nuoc' in ma or 'soc' in ma) else (254, 125, 4) if ('lua' in ma or 'khoi' in ma or 'tien' in ma) else (246, 108, 82) if 'hoi' in ma else (92, 91, 115) if q.get('phe') == 'quai' else (206, 205, 218)
    for i in range(so):
        x0 = i * cw; u = (i + 0.5) / so
        if i: d.line([(x0, 0), (x0, ch)], fill=(10, 10, 10), width=2)
        cx = x0 + cw * q['gx'] / fw; cy = ch * q['gy'] / fh
        day = q.get('doc') == 'day'
        if ma in ('hu-cot-lua', 'hu-cot-nuoc', 'hu-tien-hoa', 'hu-hoi-mau'):  # cột đứng từ điểm neo đi lên
            h = ch * 0.78 * min(1, u * 2.2) * (1 if u < 0.7 else (1 - u) / 0.3 * 0.7 + 0.3); w = cw * 0.22 * (1.1 - u * 0.6)
            d.rectangle([cx - w, cy - h, cx + w, cy], fill=mep, outline=V, width=3)
            d.rectangle([cx - w * 0.45, cy - h + 4, cx + w * 0.45, cy - 3], fill=sang)
            d.ellipse([cx - w * 1.5, cy - 8, cx + w * 1.5, cy + 6], outline=mep, width=4)
        elif ma in ('hu-vong-phep', 'hu-cong'):  # vòng elip dẹt trên sàn, có một chấm chạy vòng
            rx = cw * 0.40 * (0.6 + 0.4 * min(1, u * 3)) if ma == 'hu-vong-phep' else cw * 0.42; ry = rx * 0.58
            if ma == 'hu-cong': d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(31, 79, 74))
            d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=(168, 117, 47) if ma == 'hu-cong' else sang, width=max(4, cw // 24))
            a = u * math.tau; px, py = cx + math.cos(a) * rx * 0.6, cy + math.sin(a) * ry * 0.6
            d.ellipse([px - cw * 0.06, py - cw * 0.05, px + cw * 0.06, py + cw * 0.05], fill=(216, 255, 242) if ma == 'hu-cong' else mep)
        elif ma == 'hu-choang':  # ba ngôi sao chạy vòng
            for j in range(3):
                a = u * math.tau + j * 2.094; px, py = cx + math.cos(a) * cw * 0.32, cy + math.sin(a) * ch * 0.22
                r = ch * 0.16
                d.polygon([(px, py - r), (px + r, py), (px, py + r), (px - r, py)], fill=sang, outline=V)
        else:  # nổ: vòng tròn nở ra rồi mỏng dần, tâm ở điểm neo (nổ sàn: tâm cao hơn điểm neo một chút)
            lim = min(cx - x0, x0 + cw - cx, cy if not day else cy, ch - cy + (ch * 0.2 if day else 0)) * 0.86
            r = lim * (0.35 + 0.65 * min(1, u * 1.8)); wv = max(3, int(lim * 0.5 * (1 - u)) + 3)
            ky = 0.8
            yy = cy - (lim * 0.25 if q['gy'] > fh * 0.6 else 0)
            d.ellipse([cx - r, yy - r * ky, cx + r, yy + r * ky], outline=mep, width=wv)
            if u < 0.6: d.ellipse([cx - r * 0.45, yy - r * ky * 0.45, cx + r * 0.45, yy + r * ky * 0.45], fill=sang)
            d.polygon([(cx - r * 0.2, yy - r * ky), (cx + r * 0.2, yy - r * ky), (cx, yy - r * ky - lim * 0.12)], fill=(254, 125, 4) if mep != (254, 125, 4) else (251, 254, 208))  # mào ở phía trên
    im.save(path)
    return path


def crop(im, box):
    return im.crop(box)


def khac(d):
    if not d.getbbox(): return 0
    r, g, b = d.split()
    return sum(1 for v in ImageChops.lighter(ImageChops.lighter(r, g), b).tobytes() if v)


def png(url):
    return Image.open(io.BytesIO(base64.b64decode(url.split(',', 1)[1]))).convert('RGB')


KICH_BAN = r"""
async (mau) => {
  const cho = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const out = [], loi = [];
  // Cho hai lần chạy giống hệt nhau: số ngẫu nhiên và đồng hồ game bắt đầu từ cùng một chỗ (số khung màn hình chào chạy trước đó mỗi lần một khác).
  let hat = 20261011; Math.random = () => (hat = (hat * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  G.time = 50;
  const { S, W, P } = AU.room({ melee: 'sword', lvl: 10, region: 0 });
  G.noRender = false; G.fx.reset();
  for (const t of mau) if (!G.fxAnh.add(t)) loi.push('không nạp được ' + t.ma);
  if (mau.length) await new Promise((r) => setTimeout(r, 500));
  for (const t of mau) if (!G.fxAnh.co(t.ma)) loi.push('ảnh chưa sẵn sàng ' + t.ma);
  const cv = document.getElementById('world');
  const buoc = (n) => AU.run(n, true);
  const chup = async (ten, x, y) => { await cho(); out.push([ten, cv.toDataURL(), Math.round(x - W.cam), Math.round(y)]); };
  const xong = () => { buoc(100); G.fx.reset(); buoc(2); };
  P.x = W.geo.cx; P.y = W.geo.cy + 10; P.face = 1;
  const e = AU.dummy(P.x + 70, P.y, { hp: 1e6 });
  const giu = () => { e.x = P.x + 70; e.y = P.y; P.x = W.geo.cx; P.y = W.geo.cy + 10; P.hp = P.maxhp; };
  buoc(3);
  // 1. nổ khói   2. sốc nhiệt
  G.fx.combo('smoke', e); buoc(12); giu(); await chup('hu-no-khoi', e.x, e.y); xong();
  G.fx.combo('shock', e); buoc(12); giu(); await chup('hu-soc-nhiet', e.x, e.y); xong();
  // 3. cột lửa  4. cột nước (vùng đòn của quái phát nổ)
  G.fx.zoneFire({ team: 'enemy', shape: 'circle', x: P.x - 60, y: P.y + 6, r: 26, el: 'fire' }); buoc(9); await chup('hu-cot-lua', P.x - 60, P.y + 6); xong();
  G.fx.zoneFire({ team: 'enemy', shape: 'circle', x: P.x - 60, y: P.y + 6, r: 26, el: 'ice' }); buoc(9); await chup('hu-cot-nuoc', P.x - 60, P.y + 6); xong();
  // 5. vòng phép
  G.fx.rune(P.x - 60, P.y + 10, 40, 'fire', 0.6, 8); buoc(10); await chup('hu-vong-phep', P.x - 60, P.y + 10); xong();
  // 6. em bé trúng đòn  7. hồi máu
  G.fx.hurt(P, 7, null); buoc(8); giu(); await chup('hu-be-trung', P.x, P.y - 14); xong();
  G.fx.potion(P); buoc(9); giu(); await chup('hu-hoi-mau', P.x, P.y); xong();
  // 8. sao choáng
  e.st.stun = 3; buoc(4); giu(); await chup('hu-choang', e.x, e.y - 20); e.st.stun = 0; xong();
  // 9. đóng băng  10. băng vỡ
  e.st.frozen = 3; G.fx.freeze(e); buoc(7); giu(); await chup('hu-dong-bang', e.x, e.y); e.st.frozen = 0; buoc(5); giu(); await chup('hu-bang-vo', e.x, e.y - 10); xong();
  // 11. nổ nhỏ trên thân trùm  12. trùm nổ cuối
  // 13. tiến hoá vũ khí
  G.fx.evolve('fire', 1); buoc(24); giu(); await chup('hu-tien-hoa', P.x, P.y - 60); xong();
  // 14. lấp lánh
  G.fx.sparkle(P.x - 50, P.y + 4, '#ffd23f', 16); buoc(7); await chup('hu-lap-lanh', P.x - 50, P.y - 8); xong();
  // 15. cổng dịch chuyển: lúc đang mọc và lúc đã mọc xong
  W.props.push({ type: 'portal', act: 'portal', x: P.x - 60, y: P.y + 20, born: G.time });
  buoc(22); await chup('hu-cong (đang mọc)', P.x - 60, P.y + 20);
  buoc(90); await chup('hu-cong', P.x - 60, P.y + 20);
  // 11. nổ nhỏ trên thân trùm  12. trùm nổ cuối: sang phòng trùm thật, cho trùm gục
  {
    const R2 = AU.room({ melee: 'sword', lvl: 10, region: 0, big: true, keepBoss: true }), W2 = R2.W, b = W2.boss;
    G.noRender = false; G.fx.reset(); buoc(3);
    if (!b) loi.push('không có trùm trong phòng trùm');
    else {
      b.spawnT = 0; b.hidden = false;
      const bx = b.x, by = b.y, bh = Math.min(110, (b.h || 40) * (b.scale || 1));
      G.fx.death(b, { el: 'fire' }); b.dead = true; W2.boss = null;
      buoc(46); out.push(['hu-no-nho', (await (async () => { await cho(); return cv.toDataURL(); })()), Math.round(bx - W2.cam), Math.round(by - bh * 0.5)]);
      let n = 0; while (G.fx.state().dying.length && n++ < 300) buoc(1);
      buoc(14); await cho(); out.push(['hu-trum-no', cv.toDataURL(), Math.round(bx - W2.cam), Math.round(by - bh * 0.4)]);
    }
  }
  const st = G.fx.state();
  return { out, loi: loi.concat(G.fxAnh.loi || []), fxErr: (G.fx.errs ? G.fx.errs + ' lỗi fx: ' + G.fx.lastErr : '') };
}
"""


def chay_game(pw, goc, mau):
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type in ('error', 'warning') else None)
    pg.goto(serve(goc) + '/game/index.html?cloud=0')
    pg.wait_for_function('window.G && G.scene')
    for f in ('bot.js', 'setup.js', 'au_lib.js'):
        pg.add_script_tag(path=os.path.join(REPO, 'game', 'tests', f))
    r = pg.evaluate(KICH_BAN, mau)
    b.close()
    return r, errs


def trang_tach(pw):
    """Đưa 15 dải mẫu vào trang tách (cỡ màn iPhone). Trả về (danh sách tệp, bảng kết quả, prompt mới, lỗi, ảnh chụp trang)."""
    url = serve(REPO) + '/tools/tach-hieu-ung/index.html'
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True, accept_downloads=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' and 'jszip' not in m.text.lower() and 'ERR_' not in m.text else None)
    pg.goto(url); pg.wait_for_function('typeof HU !== "undefined" && typeof chonHu === "function"')
    hu = pg.evaluate('HU.map((q, i) => Object.assign({ i }, q))')
    prompts = pg.evaluate('''() => { const o = {}; HU.forEach((q, i) => { chonHu(i); o[Q.ma] = taoPrompt(Q);
        if (q.phe && !("mau" in q)) for (const he of ["fire", "poison", "ice"]) { chonHu(i, he); o[Q.ma] = taoPrompt(Q); } }); return o; }''')
    moi = hu[40:]
    tep, bang, shots = [], [], []
    for q in moi:
        path = dai_mau(q, os.path.join(TMP, q['ma'] + '.png'))
        pg.select_option('#chonHu', str(q['i']))
        pg.set_input_files('#chonAnh', path)
        pg.wait_for_function('!document.getElementById("buoc3").hidden && document.getElementById("dangCho").textContent.indexOf("%s") >= 0' % q['ma'])
        pg.wait_for_timeout(250)
        kq = pg.evaluate('''() => ({ the: document.getElementById("theKq").textContent, ds: [...document.querySelectorAll("#dsKiem li.loi")].map((l) => l.textContent),
            cuon: document.documentElement.scrollWidth > window.innerWidth + 1, tep: taoTep(), nut: document.getElementById("nutTaiJson").textContent, ban: !document.getElementById("oBanMau").hidden })''')
        t = kq['tep']
        im = png(t['tam'])
        dung = t.get('net') == 2 and im.size == (q['fw'] * q['so'] * 2, q['fh'] * 2) and t['ma'] == q['ma'] and t['khung_rong'] == q['fw'] and t['so'] == q['so']
        bang.append((q['ma'], kq['the'], dung, kq['cuon'], kq['ds'], len(json.dumps(t)), kq['ban']))
        tep.append(t)
        if q['ma'] in ('hu-no-khoi', 'hu-trum-no', 'hu-cong'):
            pg.locator('#buoc3').scroll_into_view_if_needed()
            shots.append(Image.open(io.BytesIO(pg.screenshot())).convert('RGB'))
    # bấm Tải một lần: phải ra đủ 2 bản (zip, hoặc 2 tệp rời khi không tải được thư viện nén)
    tai = []
    pg.on('download', lambda d: tai.append(d.suggested_filename))
    pg.click('#nutTaiJson'); pg.wait_for_timeout(4000)
    b.close()
    return tep, bang, prompts, errs, shots, tai, hu


def chu(d, xy, s, mau=(240, 236, 220), co=15):
    try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', co)
    except Exception: f = ImageFont.load_default()
    d.text(xy, s, fill=mau, font=f)


def main():
    ok = True
    with sync_playwright() as pw:
        print('== 1. Trang tách')
        tep, bang, prompts, errs, shots, tai, hu = trang_tach(pw)
        for ma, the, dung, cuon, ds, kb, ban in bang:
            dat = the == 'ĐẠT' and dung and not cuon
            ok &= dat
            print('  %-16s %-7s net2+cỡ đúng: %s  cuộn ngang: %s  ô Bản màu: %-5s  tệp %5.1f KB %s' % (ma, the, dung, cuon, ban, kb / 1024, '' if dat else ds))
        print('  bấm Tải ra:', tai); ok &= len(tai) >= 1
        print('  lỗi trang:', errs or 'không'); ok &= not errs
        json.dump(prompts, open(os.path.join(TMP, 'prompt-moi.json'), 'w'), ensure_ascii=False, indent=1)
        json.dump(hu[40:], open(os.path.join(TMP, 'hu-moi.json'), 'w'), ensure_ascii=False, indent=1)
        if OLD:
            b = pw.chromium.launch(); pg = b.new_page()
            pg.goto(serve(OLD) + '/tools/tach-hieu-ung/index.html'); pg.wait_for_function('typeof HU !== "undefined"')
            cu = pg.evaluate('''() => { const o = {}; HU.forEach((q, i) => { chonHu(i); o[Q.ma] = taoPrompt(Q);
                if (q.phe) for (const he of ["fire", "poison", "ice"]) { chonHu(i, he); o[Q.ma] = taoPrompt(Q); } }); return o; }''')
            b.close()
            doi = [k for k in cu if cu[k] != prompts.get(k)]
            print('  prompt cũ: %d bản, đổi chữ: %s' % (len(cu), doi or 'không bản nào')); ok &= not doi
        print('  tệp tạm:', TMP)

        print('== 2. Game')
        moi0, e0 = chay_game(pw, REPO, [])
        print('  bản mới, không tệp: lỗi', e0 or 'không', moi0['loi'] or '', moi0['fxErr'] or '')
        if OLD:
            cu0, ec = chay_game(pw, OLD, [])
            for (ten, a, _, _), (_, bb, _, _) in zip(cu0['out'], moi0['out']):
                d = ImageChops.difference(png(a), png(bb)); box = d.getbbox()
                n = 0 if not box else khac(d)
                ok &= n == 0
                print('  không tệp, so cũ/mới  %-20s khác %d điểm ảnh' % (ten, n))
            print('  lỗi console bản cũ:', ec or 'không')
        moi1, e1 = chay_game(pw, REPO, tep)
        print('  bản mới, nạp tạm %d tệp mẫu: lỗi' % len(tep), [x for x in e1 if x not in e0] or 'không (ngoài các dòng đã có ở bản không tệp)', moi1['loi'] or '', moi1['fxErr'] or '')
        ok &= not moi1['loi'] and not moi1['fxErr'] and not [x for x in e1 if x not in e0]
        for (ten, a, _, _), (_, bb, _, _) in zip(moi0['out'], moi1['out']):
            d = ImageChops.difference(png(a), png(bb)); n = khac(d)
            ok &= n > 0
            print('  có tệp mẫu  %-20s khác bản code %d điểm ảnh %s' % (ten, n, '' if n else '  <-- ẢNH KHÔNG HIỆN'))

    # ---------- 3) ảnh kiểm: mỗi hiệu ứng một cặp (trên: hình code, dưới: dải mẫu), cắt quanh chỗ hiệu ứng ----------
    CW, CH, COT = 300, 250, 4
    n = len(moi0['out']); hang = math.ceil(n / COT)
    tam = Image.new('RGB', (COT * (CW + 8) + 8, hang * (CH * 2 + 44) + 40), (18, 22, 26))
    d = ImageDraw.Draw(tam)
    chu(d, (10, 8), 'Phiên hieu-ung-b3 · mỗi ô: trên = hình vẽ bằng code (chưa có tệp), dưới = nạp tạm dải mẫu máy dựng (hình tròn/cột/vòng đơn giản)', co=14)
    for i, ((ten, a, x, y), (_, bb, _, _)) in enumerate(zip(moi0['out'], moi1['out'])):
        A, B = png(a), png(bb); k = A.size[0] / 480
        to = ten in ('hu-trum-no', 'hu-tien-hoa')
        w, h = (CW / k, CH / k) if not to else (CW / k * 1.6, CH / k * 1.6)
        cx = min(max(x, w / 2), 480 - w / 2); cy = min(max(y - h * 0.15, h / 2), 270 - h / 2)
        box = tuple(int(v * k) for v in (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2))
        ox = 8 + (i % COT) * (CW + 8); oy = 36 + (i // COT) * (CH * 2 + 44)
        chu(d, (ox, oy), ten, (246, 220, 146))
        tam.paste(A.crop(box).resize((CW, CH), Image.NEAREST), (ox, oy + 20))
        tam.paste(B.crop(box).resize((CW, CH), Image.NEAREST), (ox, oy + 22 + CH))
    tam.save(os.path.join(HERE, 'anh-kiem.png'), optimize=True)
    if shots:
        w = sum(s.size[0] for s in shots) + 10 * (len(shots) + 1); h = max(s.size[1] for s in shots) + 20
        t2 = Image.new('RGB', (w, h), (18, 22, 26)); x = 10
        for s in shots: t2.paste(s, (x, 10)); x += s.size[0] + 10
        t2 = t2.resize((t2.size[0] // 2, t2.size[1] // 2), Image.LANCZOS)
        t2.save(os.path.join(HERE, 'anh-kiem-trang-tach.png'), optimize=True)
    # trọn màn game lúc cổng đã mọc và lúc nổ khói (có tệp mẫu), để nhìn trong phòng
    for ten in ('hu-no-khoi', 'hu-hoi-mau', 'hu-cong'):
        for o in moi1['out']:
            if o[0] == ten: png(o[1]).save(os.path.join(TMP, ten + '-phong.png'))
    print('KẾT QUẢ:', 'ĐẠT' if ok else 'CÓ LỖI')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
