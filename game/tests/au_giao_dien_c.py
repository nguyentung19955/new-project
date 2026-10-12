"""Rà soát C (12/10): giao diện điện thoại ở nhiều cỡ màn + vùng an toàn giả lập.
Chạy từ gốc repo, sau khi build hai tệp và mở máy chủ (docs/review/kiem-thu-12-10/srv.py, bản có thư mục anh/):
  python3 game/tests/au_giao_dien_c.py <thư mục ra> [địa chỉ gốc, mặc định http://127.0.0.1:8765] [đuôi thêm sau ?cloud=0] [tên cỡ,...]
Với mỗi cỡ màn (iPhone SE 667x375, iPhone 14 844x390, Pro Max 932x430, iPad 1024x768, iPhone 14 cầm dọc 390x844) và mỗi cảnh
(màn chào, truyện mở đầu, làng, các bảng ở làng, trận ở 3 vùng, phòng trùm, bản đồ lớn, dừng, hành trang, thắng, thua...):
- chụp ảnh;
- đọc mọi nút đã vẽ (G.theme.nutKhungTruoc + nút điều khiển trận) ra điểm CSS (pt): nút có vùng chạm < 44 pt, nút có HÌNH chồng hình nút khác;
- ghi mọi chữ vẽ lên lớp giao diện: chữ bị cắt ở mép khung (ra ngoài canvas), cỡ chữ thật theo pt.
Vùng an toàn: trình duyệt máy thử không có tai thỏ nên giả bằng biến CSS --sa-* (giống số của iPhone thật).
In tóm tắt, ghi <thư mục ra>/ket-qua.json. Có pageerror thì thoát mã 1."""
import json, os, sys, time
from playwright.sync_api import sync_playwright

GAME = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/au-gd-c'
BASE = sys.argv[2] if len(sys.argv) > 2 else 'http://127.0.0.1:8765'
EXTRA = sys.argv[3] if len(sys.argv) > 3 else ''
CHI_CO = set(sys.argv[4].split(',')) if len(sys.argv) > 4 and sys.argv[4] else None
CHI_CANH = set(sys.argv[5].split(',')) if len(sys.argv) > 5 and sys.argv[5] else None
os.makedirs(OUT, exist_ok=True)

# (tên, rộng, cao, vùng an toàn trên/phải/dưới/trái theo px CSS của máy thật ở hướng đó)
CO = [
    ('se', 667, 375, (0, 0, 0, 0)),
    ('ip14', 844, 390, (0, 47, 21, 47)),
    ('promax', 932, 430, (0, 59, 21, 59)),
    ('ipad', 1024, 768, (0, 0, 0, 0)),
    ('doc', 390, 844, (47, 0, 34, 0)),
]

SCENES = r"""
(() => {
  const C = (window.__canh = {});
  let timers = [];
  window.__bot0 = window.__bot0 || G.botInput;
  const clear = () => { for (const t of timers) clearInterval(t); timers = []; G.botInput = window.__bot0; if (G.truyen) G.truyen.dang = null; };
  const bat = () => timers.push(setInterval(() => { const S = G.getRun(); if (!S) return; const P = S.P; P.hp = P.maxhp; P.inv = 0.5; P.mana = P.maxmana; if (S.mode === 'dead') S.mode = 'play'; }, 200));
  const fill = (n, roles) => timers.push(setInterval(() => {
    const S = G.getRun(); if (!S || G.scene !== G.StageScene || S.mode !== 'play') return;
    const W = G.getWorld();
    const rw = W.x1 - W.x0 - 20, rh = W.y1 - W.y0 - 30;
    const live = W.ents.filter((e) => !e.dead && !e.isBoss).length;
    for (let i = live; i < n; i++) { const e = G.spawnEnemy(roles[i % roles.length], W.x0 + 10 + (i * 53) % rw, W.y0 + 20 + (i * 37) % rh, { hpMult: 1e5 }); e.inside = true; }
  }, 300));
  const save = (o) => { G.testSave(Object.assign({ hero: 'smith', melee: 'sword', lvl: 14, tier: 1, gold: 400, sharpen: 3 }, o || {})); for (let i = 0; i < 5; i++) G.save.stars['0-' + i] = 2; G.save.ore = 30; };
  const run = (r, i, o) => { G.startStage(r, i, 0, { kind: 'A', seed: 4242 }); const S = G.getRun(); S.fade = 0; S.tut = null; S.hint = null; Object.assign(G.botCfg, { explore: false, props: false }); return S; };
  C.chao = () => { clear(); G.resetSave(); G.save.sound = false; G.setScene(G.Title); };
  C.chao2 = () => { clear(); save(); G.setScene(G.Title); };
  C.truyen = () => { clear(); G.resetSave(); G.save.sound = false; G.setScene(G.Village); if (G.truyen && G.truyen.xemLai) G.truyen.xemLai(); };
  C.lang = () => { clear(); save(); G.setScene(G.Village); };
  C.langMoi = () => { clear(); G.resetSave(); G.save.sound = false; G.save.tut.done = true; G.setScene(G.Village); };
  C.bang = (k, set) => { C.lang(); const V = G.villageApi; V.open(k); if (set) set(V.V); };
  C.xemVk = () => { C.lang(); const V = G.villageApi; V.V.wid = G.save.carry[0]; V.V.back = 'hub'; V.V.tab = 'weapon'; };
  C.tran = (r) => { clear(); save({ lvl: 30, tier: 2, sharpen: 6, branch: ['poison', 'ice', 'fire'][r], marks: 300 }); run(r, 2); G.testGoto('fight'); const W = G.getWorld(); W.waves = []; W.spawns = []; bat(); fill(8, ['rusher', 'swarm', 'shield', 'archer', 'elite']); };
  C.trum = (r) => { clear(); save({ lvl: 30, tier: 2, sharpen: 6 }); const S = run(r, 4); G.gotoRoom(S.map.boss); bat(); };
  C.mode = (m) => { const S = G.getRun(); if (S) { S.mode = m; S.sel = null; if (m === 'bag' && G.hanhTrang) G.hanhTrang.reset(); } };
  C.ruong = () => { const S = G.getRun(); G.testGoto('chest'); };
  C.thang = () => { clear(); save(); const S = run(0, 1); G.gotoRoom(S.map.boss); S.got.push('3 quặng'); G.finishStage(true); S.modeT = -9; };
  C.thua = () => { clear(); save(); const S = run(0, 1); G.testGoto('fight'); G.getWorld().waves = []; G.getWorld().spawns = []; G.finishStage(false); S.modeT = -9; };
  C.dung = clear;
  // Đo: nút và chữ của khung vừa vẽ
  const tx = []; window.__chu = tx;
  const ux = G.ux, ft0 = ux.fillText.bind(ux);
  ux.fillText = function (s, x, y, mw) {
    try {
      if (window.__doChu && tx.length < 1500) {
        const m = ux.getTransform(), w = ux.measureText(s).width, fs = parseFloat(/(\d+(\.\d+)?)px/.exec(ux.font)[1]);
        const al = ux.textAlign; let x0 = x; if (al === 'center') x0 = x - w / 2; else if (al === 'right' || al === 'end') x0 = x - w;
        const d = G.dpr || 1;
        tx.push({ s: String(s).slice(0, 40), x0: (m.a * x0 + m.e) / d, x1: (m.a * (x0 + w) + m.e) / d, y0: (m.d * (y - fs) + m.f) / d, y1: (m.d * y + m.f) / d, pt: fs * m.a / d, a: ux.globalAlpha });
      }
    } catch (e) { /* bỏ qua */ }
    return ft0(s, x, y, mw);
  };
  C.do = () => {
    const sc = G.scale, ox = G.ox, oy = G.oy;
    const toPt = (r) => [ox + r[0] * sc, oy + r[1] * sc, r[2] * sc, r[3] * sc];
    const nut = (G.theme.nutKhungTruoc ? G.theme.nutKhungTruoc() : []).map((q) => ({ hinh: toPt(q[0]), cham: toPt(q[1]) }));
    const S = G.scene === G.StageScene && G.getRun();
    if (S && S.mode === 'play' && G.stageUi) {
      const U = G.stageUi;
      for (const n of ['atk', 'dodge', 'special', 'skill']) { const b = U.btnPos(n); const rr = b[2] + 6; nut.push({ ten: n, hinh: toPt([b[0] - b[2], b[1] - b[2], b[2] * 2, b[2] * 2]), cham: toPt([b[0] - rr, b[1] - rr, rr * 2, rr * 2]) }); }
      for (const [n, b] of [['binh', U.POT], ['dung', U.PAU]]) nut.push({ ten: n, hinh: toPt(b), cham: toPt([b[0] - 4, b[1] - 4, b[2] + 8, G.theme.chamMin ? Math.max(b[3] + 9, G.theme.chamMin()) : b[3] + 9]) });
      const mm = G.minimap.rect(S), m44 = G.theme.chamMin ? G.theme.chamMin() : 31; const mmH = mm[3] < m44 ? m44 : mm[3] + 3, mmY = mm[3] < m44 ? mm[1] - 4 : mm[1];
      nut.push({ ten: 'bando', hinh: toPt(mm), cham: toPt([mm[0] - 2, mmY, mm[2] + 4, mmH]) });
    }
    const fit = document.getElementById('fit').getBoundingClientRect(), st = document.getElementById('stage').getBoundingClientRect();
    return { scale: sc, ox, oy, fitW: document.getElementById('fit').clientWidth, fitH: document.getElementById('fit').clientHeight, stage: [st.left - fit.left, st.top - fit.top, st.width, st.height], rot: !!G.rot, nut, chu: tx.slice() };
  };
  return Object.keys(C);
})()
"""

# (tên cảnh, câu lệnh JS, chờ giây)
CANH = [
    ('01-chao', "__canh.chao()", 2.0),
    ('02-chao-cu', "__canh.chao2()", 1.5),
    ('03-truyen', "__canh.truyen()", 1.8),
    ('04-lang', "__canh.lang()", 2.0),
    ('05-lang-moi', "__canh.langMoi()", 2.0),
    ('06-lai-do', "__canh.bang('lai')", 1.0),
    ('07-lo-ren-mai', "__canh.bang('ren')", 1.0),
    ('08-lo-ren-bac', "__canh.bang('ren', (V) => { V.ftab = 'tier'; })", 1.0),
    ('09-lo-ren-luyen', "__canh.bang('ren', (V) => { V.ftab = 'reforge'; })", 1.0),
    ('10-hang-xen', "__canh.bang('xen')", 1.0),
    ('11-hang-xen-ban', "__canh.bang('xen', (V) => { V.gtab = 'sell'; })", 1.0),
    ('12-tho-may', "__canh.bang('may')", 1.0),
    ('13-cu-do', "__canh.bang('do')", 1.0),
    ('14-cu-do-chuong', "__canh.bang('do', (V) => { V.tab = 'chuong'; V.dtab = 'chuong'; })", 1.0),
    ('15-cu-do-huongdan', "__canh.bang('do', (V) => { V.tab = 'help'; V.dtab = 'help'; })", 1.0),
    ('16-ong-tu', "__canh.bang('tu')", 1.0),
    ('17-anh-mo-1', "__canh.bang('mo')", 1.0),
    ('18-anh-mo-2', "__canh.bang('mo', (V) => { V.cd2 = true; })", 1.0),
    ('19-hanh-trang', "__canh.lang(); G.villageApi.V.tab = 'bag'", 1.0),
    ('20-xem-vk', "__canh.xemVk()", 1.0),
    ('21-tran-rung', "__canh.tran(0)", 2.5),
    ('22-tran-bien', "__canh.tran(1)", 2.5),
    ('23-tran-lau-dai', "__canh.tran(2)", 2.5),
    ('24-trum-rung', "__canh.trum(0)", 2.5),
    ('25-trum-lau-dai', "__canh.trum(2)", 2.5),
    ('26-ban-do', "__canh.mode('map')", 0.8),
    ('27-dung', "__canh.mode('paused')", 0.8),
    ('28-tran-hanh-trang', "__canh.mode('bag')", 0.8),
    ('29-thang', "__canh.thang()", 1.0),
    ('30-thua', "__canh.thua()", 1.0),
]


def main():
    errs, kq = [], {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for ten, w, h, sa in CO:
            if CHI_CO and ten not in CHI_CO: continue
            ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=3, is_mobile=True, has_touch=True)
            pg = ctx.new_page()
            pg.on('pageerror', lambda e, t=ten: errs.append(t + ': ' + str(e)[:300]))
            pg.goto('%s/linh-khi-nhe.html?cloud=0%s' % (BASE, EXTRA))
            pg.wait_for_function('window.G && G.scene', timeout=90000)
            pg.evaluate("sa => { const s = document.documentElement.style; s.setProperty('--sa-t', sa[0] + 'px'); s.setProperty('--sa-r', sa[1] + 'px'); s.setProperty('--sa-b', sa[2] + 'px'); s.setProperty('--sa-l', sa[3] + 'px'); window.dispatchEvent(new Event('resize')); }", list(sa))
            pg.add_script_tag(path=os.path.join(GAME, 'tests', 'setup.js'))
            pg.add_script_tag(path=os.path.join(GAME, 'tests', 'bot.js'))
            pg.evaluate(SCENES)
            time.sleep(1.0)
            d = os.path.join(OUT, ten); os.makedirs(d, exist_ok=True)
            kq[ten] = {}
            for canh, js, cho in CANH:
                if CHI_CANH and canh not in CHI_CANH: continue
                try:
                    pg.evaluate('() => { ' + js + ' }')
                except Exception as e:
                    errs.append('%s/%s: %s' % (ten, canh, str(e)[:200])); continue
                time.sleep(cho)
                pg.evaluate('() => { window.__chu.length = 0; window.__doChu = true; }')
                time.sleep(0.12)
                pg.evaluate('() => { window.__doChu = false; }')
                pg.screenshot(path=os.path.join(d, canh + '.png'))
                try:
                    kq[ten][canh] = pg.evaluate('() => __canh.do()')
                except Exception as e:
                    errs.append('%s/%s do: %s' % (ten, canh, str(e)[:200]))
            pg.evaluate('() => __canh.dung()')
            ctx.close()
        b.close()
    json.dump(kq, open(os.path.join(OUT, 'ket-qua.json'), 'w'))
    tom_tat(kq)
    print('pageerror:', len(errs))
    for e in errs[:30]: print('  ', e)
    sys.exit(1 if errs else 0)


def chong(a, b):
    return min(a[0] + a[2], b[0] + b[2]) - max(a[0], b[0]) > 1 and min(a[1] + a[3], b[1] + b[3]) - max(a[1], b[1]) > 1


def tom_tat(kq):
    for co, cs in kq.items():
        print('==', co)
        for canh, r in cs.items():
            if not r: continue
            nho = sorted({(round(n['cham'][2]), round(n['cham'][3]), n.get('ten', '')) for n in r['nut'] if min(n['cham'][2], n['cham'][3]) < 43.5})
            # bỏ trùng hình (một nút được ghi nhiều lần trong khung)
            hs = []
            for n in r['nut']:
                if not any(abs(n['hinh'][i] - q['hinh'][i]) < 0.6 for i in range(4) for q in [] ) and not any(all(abs(n['hinh'][i] - q['hinh'][i]) < 0.6 for i in range(4)) for q in hs): hs.append(n)
            ch = [(i, j) for i in range(len(hs)) for j in range(i + 1, len(hs)) if chong(hs[i]['hinh'], hs[j]['hinh'])]
            W, H = r['fitW'], r['fitH']
            cat = sorted({c['s'] for c in r['chu'] if c['a'] > 0.05 and c['s'].strip() and (c['x0'] < -1 or c['x1'] > W + 1 or c['y0'] < -2 or c['y1'] > H + 1)})
            nhoChu = sorted({round(c['pt'], 1) for c in r['chu'] if c['a'] > 0.3 and c['s'].strip()})[:3]
            line = '  %-20s nút<44pt: %d %s | hình chồng: %d | chữ cắt mép: %s | chữ nhỏ nhất pt: %s' % (canh, len(nho), nho[:4], len(ch), cat[:4], nhoChu)
            print(line)


if __name__ == '__main__':
    main()
