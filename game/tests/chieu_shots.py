"""Chụp ảnh các lối đánh và hiệu ứng theo hệ để xem bằng mắt. Ảnh lưu vào docs/chieu-thuc/.
Chạy: python3 tests/chieu_shots.py            (chụp đủ bộ ảnh)
      python3 tests/chieu_shots.py day sword fire   (chụp dày từng 2 khung của một vũ khí, một hệ, để chọn khung)"""
import base64, os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'chieu-thuc')

LIB = r"""
(() => {
  const T = (window.T = {});
  let inp = {};
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, inp);
  const frame = () => { G.tick(); G.ui.begin(); G.scene.draw(); G.click = null; for (const q of ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP']) delete inp[q]; };
  T.CW = 190; T.CH = 104; T.Z = 3;
  // Dựng phòng thử: hero đứng giữa, vài con quái đứng yên (máu rất nhiều) ở trước mặt.
  T.room = function (type, el, o) {
    o = o || {};
    G.testSave({ hero: 'smith', lvl: 12, melee: type === 'bow' ? 'sword' : type, tier: 1, branch: el || undefined, marks: el ? (o.marks || 300) : 0 });
    G.startStage(o.region == null ? 2 : o.region, 2, 0);
    const S = G.getRun(), W = G.getWorld(), P = S.P;
    W.waves = []; W.props = []; W.banner = null; S.hint = null;
    if (type === 'bow') P.cur = 1;
    inp = {};
    for (let i = 0; i < 8; i++) frame();
    W.banner = null;
    P.x = 150; P.y = 196; P.face = 1; P.inv = 0; P.mana = P.maxmana; P.hp = P.maxhp;
    const ds = o.dummies || (type === 'bow' ? [[232, 196], [262, 190], [290, 200]] : type === 'hammer' ? [[180, 196], [196, 186], [200, 206], [236, 198]] : [[180, 196], [196, 186], [200, 206]]);
    for (const d of ds) { const e = G.spawnEnemy(d[2] || 'rusher', d[0], d[1], { hpMult: o.hp || 400 }); e.st.stun = 1e9; e.inside = true; e.face = -1; }
    W.cam = 0;
    for (let i = 0; i < 3; i++) frame();
    T.W = W; T.P = P; T.shots = []; T.P0x = type === 'bow' ? 176 : 150;
    return W;
  };
  T.grab = function (label) {
    const cv = document.createElement('canvas');
    cv.width = T.CW; cv.height = T.CH;
    const x0 = Math.round(T.P0x != null ? T.P0x : 150) - 46, y0 = 196 - 74; // T.P0x: dời khung cắt (cung cần thấy xa hơn về bên phải)
    cv.getContext('2d').drawImage(G.wx.canvas, x0, y0, T.CW, T.CH, 0, 0, T.CW, T.CH);
    T.shots.push({ cv, label: label || '' });
  };
  // seq: [[nút, số khung, { khung: 'nhãn' }], ...]. dense > 0 thì chụp đều mỗi "dense" khung.
  // mom: [[điều kiện(P, W, mv), số khung chờ thêm, nhãn], ...]: mỗi mục chụp một lần, sau khi điều kiện đúng lần đầu.
  T.play = function (seq, dense, mom) {
    let n = 0;
    const due = [], done = new Set();
    for (const s of seq) {
      for (let k = 0; k < s[1]; k++) {
        inp = Object.assign({}, s[0]);
        if (k > 0) for (const q of ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP']) delete inp[q];
        frame(); n++;
        if (dense) { if (n % dense === 0) T.grab(String(n)); continue; }
        (mom || []).forEach((m, i) => { if (!done.has(i) && m[0](T.P, T.W, T.P.mv || {})) { done.add(i); due.push([n + m[1], i, m[2]]); } });
        for (const d of due) if (d[0] === n) { T.shots.push(null); T.grab(d[2]); const g = T.shots.pop(); T.shots.pop(); T.byMom = T.byMom || []; T.byMom[d[1]] = g; }
      }
    }
    if (!dense) T.shots = (T.byMom || []).filter(Boolean);
    T.byMom = null;
  };
  // Ghép các hàng ảnh thành một tấm. rows: [{ title, shots }]
  T.sheet = function (rows, head) {
    const Z = T.Z, cols = Math.max(...rows.map((r) => r.shots.length));
    const cw = T.CW * Z, ch = T.CH * Z, LM = 0, TH = 30, HH = head ? 46 : 0;
    const cv = document.createElement('canvas');
    cv.width = LM + cols * (cw + 6) + 6; cv.height = HH + rows.length * (ch + TH + 6) + 6;
    const c = cv.getContext('2d');
    c.fillStyle = '#17110f'; c.fillRect(0, 0, cv.width, cv.height);
    c.imageSmoothingEnabled = false;
    c.textBaseline = 'middle';
    if (head) { c.fillStyle = '#ffd27a'; c.font = '700 24px "Be Vietnam Pro", "DejaVu Sans", sans-serif'; c.fillText(head, 10, 24); }
    rows.forEach((r, j) => {
      const y = HH + 6 + j * (ch + TH + 6);
      c.fillStyle = r.col || '#f1ead9'; c.font = '700 19px "Be Vietnam Pro", "DejaVu Sans", sans-serif';
      c.fillText(r.title, 10, y + 15);
      r.shots.forEach((s, i) => {
        const x = LM + 6 + i * (cw + 6);
        c.drawImage(s.cv, x, y + TH, cw, ch);
        if (s.label) {
          c.font = '600 15px "Be Vietnam Pro", "DejaVu Sans", sans-serif';
          const tw = c.measureText(s.label).width;
          c.fillStyle = 'rgba(10,8,6,0.78)'; c.fillRect(x + 4, y + TH + 4, tw + 10, 22);
          c.fillStyle = '#fff3b0'; c.fillText(s.label, x + 9, y + TH + 16);
        }
      });
    });
    return cv.toDataURL('image/png');
  };
})();
"""

T_ = "[{ atk: true, atkP: true }, 2]"
# Kịch bản bấm nút của từng vũ khí: [nút, số khung]
SEQ = {
    'sword': "[" + ", ".join([T_ + ", [{}, 20]"] * 2) + ", " + T_ + """, [{}, 70],
      [{ dodgeP: true, mx: 1 }, 1], [{ mx: 1 }, 17], [{ atk: true, atkP: true }, 3], [{}, 40]]""",
    'bow': "[" + T_ + """, [{}, 44], [{ atk: true, atkP: true }, 66], [{}, 60]]""",
    'spear': "[" + ", ".join([T_ + ", [{}, 19]"] * 3) + ", " + T_ + """, [{}, 60], [{ atk: true, atkP: true }, 48], [{}, 50]]""",
    'hammer': "[" + T_ + """, [{}, 55], [{ atk: true, atkP: true }, 84], [{}, 70]]""",
    'special': """[[{}, 4], [{ specialP: true }, 1], [{}, 80]]""",
}
# Thời điểm chụp: [điều kiện, chờ thêm mấy khung, nhãn]
MOM = {
    'sword': """[
      [(P, W, m) => m.kind === 'chem' && m.step === 0 && P.hitDone, 2, 'Chém ngang'],
      [(P, W, m) => m.kind === 'chem' && m.step === 1 && P.hitDone, 2, 'Chém ngược'],
      [(P, W, m) => m.kind === 'chem' && m.step === 2 && P.hitDone, 2, 'Nhát kết'],
      [(P, W, m) => m.kind === 'chem' && m.step === 2 && P.hitDone, 12, 'Ngay sau nhát kết'],
      [(P, W, m) => m.kind === 'chem' && m.step === 2 && P.hitDone, 40, 'Còn lại trên đất'],
      [(P, W, m) => m.kind === 'luot', 5, 'Né rồi lướt chém']]""",
    'bow': """[
      [(P, W, m) => W.projs.some((o) => o.team === 'player' && !o.big && o.x > 200), 0, 'Bấm: tên thường'],
      [(P, W, m) => m.holding && m.charge > 0.5, 0, 'Giữ: giương cung'],
      [(P, W, m) => m.holding && m.charge >= 1, 8, 'Đầy đà'],
      [(P, W, m) => W.projs.some((o) => o.big), 2, 'Thả: tên mạnh'],
      [(P, W, m) => W.projs.some((o) => o.big && o.seen.length >= 1), 3, 'Trúng và xuyên qua'],
      [(P, W, m) => W.projs.some((o) => o.big && o.seen.length >= 1), 22, 'Sau đó']]""",
    'spear': """[
      [(P, W, m) => m.kind === 'dam' && m.step === 0 && P.hitDone, 2, 'Đâm'],
      [(P, W, m) => m.kind === 'dam' && m.step === 2 && P.hitDone, 2, 'Đâm lần ba'],
      [(P, W, m) => m.kind === 'quet' && P.hitDone, 2, 'Quét vòng'],
      [(P, W, m) => m.kind === 'quet' && P.hitDone, 14, 'Ngay sau quét vòng'],
      [(P, W, m) => m.holding && m.charge >= 1, 4, 'Giữ: thu giáo'],
      [(P, W, m) => m.kind === 'xoc', 5, 'Thả: xốc tới'],
      [(P, W, m) => m.kind === 'xoc', 22, 'Sau khi lao']]""",
    'hammer': """[
      [(P, W, m) => m.kind === 'nen' && P.hitDone, 2, 'Nện thường'],
      [(P, W, m) => m.holding && m.level === 1, 8, 'Giữ: lấy đà nấc 1'],
      [(P, W, m) => m.holding && m.level === 2, 8, 'Nấc 2'],
      [(P, W, m) => m.kind === 'nenDat' && P.hitDone, 3, 'Thả: nện đất'],
      [(P, W, m) => W.mvWaves && W.mvWaves.some((z) => Math.abs(z.x - P.x) > 62), 0, 'Sóng chấn động'],
      [(P, W, m) => m.kind === 'nenDat' && P.hitDone, 44, 'Còn lại trên đất']]""",
    'special': """[
      [(P, W, m) => P.specCd > 0, 8, 'Đặc biệt'],
      [(P, W, m) => P.specCd > 0, 50, '']]""",
}

def run(pg, type_, el, dense=0, special=False):
    pg.evaluate("([t, e]) => { T.room(t, e); }", [type_, el])
    pg.evaluate("([s, d, m]) => { T.play(eval(s), d, eval(m)); }", [SEQ[type_], dense, MOM[type_]])
    if special:
        # thêm đòn Đặc biệt của vũ khí đó vào cuối hàng (dựng lại phòng cho sạch)
        pg.evaluate("([t, e, s, m, n]) => { const keep = T.shots; T.room(t, e); T.play(eval(s), 0, eval(m)); T.shots.forEach((x, i) => { x.label = i ? '' : 'Đặc biệt: ' + n; }); T.shots = keep.concat(T.shots); }",
                    [type_, el, SEQ['special'], MOM['special'], SPEC[type_]])

def save(pg, js, name):
    data = pg.evaluate(js)
    path = os.path.join(OUT, name)
    with open(path, 'wb') as f:
        f.write(base64.b64decode(data.split(',')[1]))
    print('đã lưu', path)

SPEC = {'sword': 'Chém lướt', 'bow': 'Mưa tên', 'spear': 'Lao tới', 'hammer': 'Nện đất'}
NAMES = {'sword': 'Kiếm', 'bow': 'Cung', 'spear': 'Giáo', 'hammer': 'Búa'}
FILES = {'sword': 'kiem', 'bow': 'cung', 'spear': 'giao', 'hammer': 'bua'}
ELN = {None: 'Chưa có hệ', 'fire': 'Lửa', 'poison': 'Độc', 'ice': 'Băng'}
ELC = {None: '#f1ead9', 'fire': '#ff9a4a', 'poison': '#8fe04a', 'ice': '#9fdcff'}

def main():
    os.makedirs(OUT, exist_ok=True)
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.wait_for_timeout(300)
        pg.evaluate("window.requestAnimationFrame = () => 0")
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        pg.evaluate(LIB)
        if len(sys.argv) > 1 and sys.argv[1] == 'day':
            t = sys.argv[2]; el = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != 'none' else None
            run(pg, t, el, 2)
            pg.evaluate("window.__rows = []; for (let i = 0; i < T.shots.length; i += 8) __rows.push({ title: '', shots: T.shots.slice(i, i + 8) });")
            save(pg, "T.sheet(__rows)", os.environ.get('CHIEU_DAY', '_day.png'))  # đặt CHIEU_DAY=/đường/dẫn.png để lưu ra ngoài kho
        else:
            types = [t for t in ['sword', 'bow', 'spear', 'hammer'] if t in SEQ]
            # 1. bốn vũ khí, chưa có hệ
            pg.evaluate("window.__rows = []")
            for t in types:
                run(pg, t, None)
                pg.evaluate("([n]) => { __rows.push({ title: n, shots: T.shots }); }", [NAMES[t]])
            save(pg, "T.sheet(__rows, 'Lối đánh riêng của từng vũ khí')", 'kieu-danh-bon-vu-khi.png')
            # 2. mỗi vũ khí một lưới: ba hệ ở mốc Thức tỉnh (kèm hàng chưa có hệ để so)
            for t in types:
                pg.evaluate("window.__rows = []")
                for el in [None, 'fire', 'poison', 'ice']:
                    run(pg, t, el, special=True)
                    pg.evaluate("([n, c]) => { __rows.push({ title: n, col: c, shots: T.shots }); }", [ELN[el] + ('' if el is None else ' (Thức tỉnh)'), ELC[el]])
                save(pg, "T.sheet(__rows, '" + NAMES[t] + ": cùng lối đánh ở ba hệ')", FILES[t] + '-ba-he.png')
            # 3. cùng một nhát kết của kiếm ở bốn trạng thái
            pg.evaluate("window.__rows = []")
            for el in [None, 'fire', 'poison', 'ice']:
                run(pg, 'sword', el)
                pg.evaluate("([n, c]) => { const s = T.shots.filter((x) => x.label !== 'Né rồi lướt chém' && x.label !== 'Chém ngược'); __rows.push({ title: n, col: c, shots: s }); }", [ELN[el], ELC[el]])
            save(pg, "T.sheet(__rows, 'Cùng một chuỗi kiếm: chưa có hệ, Lửa, Độc, Băng')", 'hieu-ung-ba-he.png')
        if errs or pg.evaluate("G.fx.errs"):
            print('LỖI:', errs[:3], pg.evaluate("G.fx.lastErr"))
            sys.exit(1)
        b.close()

main()
