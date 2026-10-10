"""AUDIT âm thanh (phiên au-kien-truc-tiep-can): giới hạn số tiếng phát cùng lúc, tổng âm lượng dồn, tiếng trùng nhau.
  cd game && python3 tests/au_am_thanh.py
KHÔNG nghe được tiếng (máy chạy không có loa): bài này bọc AudioContext để GHI LẠI từng bộ dao động (oscillator) game tạo ra,
lúc bắt đầu, lúc dừng, âm lượng ban đầu, rồi tính:
  - số tiếng kêu cùng lúc nhiều nhất
  - tổng âm lượng ban đầu của các tiếng chồng nhau (> 1,0 là vượt ngưỡng loa của Web Audio => rè/vỡ tiếng nếu không có bộ nén)
Tình huống: 20 quái đứng sát nhau
  A. một nhát Địa Chấn (búa, Đặc biệt) trúng cả 20
  B. 20 quái chết cùng một khung (kết liễu một lượt)
  C. một quả Hỏa chưởng nổ giữa bầy
Ghi JSON: docs/review/anh/au_am_thanh.json. KHÔNG sửa game."""
import os, json
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'review', 'anh', 'au_am_thanh.json')

SPY = r"""
(() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  window.__osc = []; window.__ac = null;
  const co = AC.prototype.createOscillator, cg = AC.prototype.createGain;
  AC.prototype.createOscillator = function () {
    window.__ac = this;
    const o = co.call(this), rec = { t0: null, t1: null, f: 0, g: 0, type: '' };
    window.__osc.push(rec);
    const st = o.start.bind(o), sp = o.stop.bind(o);
    o.start = (t) => { rec.t0 = this.currentTime; rec.f = o.frequency.value; rec.type = o.type; return st(t); };
    o.stop = (t) => { rec.t1 = t; return sp(t); };
    const cn = o.connect.bind(o);
    o.connect = (n) => { if (n && n.gain) rec.gNode = n; return cn(n); };
    return o;
  };
})();
"""

JS = r"""(kind) => {
  const { W, P } = AU.room({ melee: kind === 'A' ? 'hammer' : 'sword', lvl: 20 });
  if (kind === 'A') AU.want(P, 'hammer');
  G.save.sound = true; G.audioStart();
  const mobs = [];
  for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, rr = 14 + (i % 3) * 6; mobs.push(AU.dummy(P.x + Math.cos(a) * rr, P.y + Math.sin(a) * rr * 0.8, { hp: kind === 'B' ? 1 : 400 })); }
  const pins = mobs.map((e) => ({ e, x: e.x, y: e.y }));
  window.__osc.length = 0;
  const calls = [];
  const f = G.sfx; G.sfx = function (n, p) { calls.push([n, G.time.toFixed(3)]); return f(n, p); };
  try {
    if (kind === 'A') { P.mana = P.maxmana; AU.press({ specialP: true }); AU.run(90, true, () => AU.pin(pins)); }
    if (kind === 'B') { for (const e of mobs) G.damage(e, 999, { fromPlayer: true, src: 'test' }); AU.run(30, true); }
    if (kind === 'C') { P.mana = P.maxmana; P.skillCd = 0; AU.press({ skillP: true }); AU.run(5, true); AU.press({ skill: false }); AU.run(90, true, () => AU.pin(pins)); }
  } finally { G.sfx = f; }
  // dòng thời gian các tiếng: [bắt đầu, kết thúc, âm lượng]
  const v = window.__osc.filter((o) => o.t0 != null).map((o) => [o.t0, o.t1 || o.t0 + 0.1, o.gNode ? o.gNode.gain.value : 0, o.type, Math.round(o.f)]);
  let maxN = 0, maxG = 0;
  for (const a of v) { let n = 0, g = 0; for (const b of v) if (b[0] <= a[0] + 1e-6 && b[1] > a[0]) { n++; g += b[2] || 0; } maxN = Math.max(maxN, n); maxG = Math.max(maxG, g); }
  const byName = {}; for (const c of calls) byName[c[0]] = (byName[c[0]] || 0) + 1;
  // số lần gọi trong cùng một khung (cùng G.time)
  const perFrame = {}; for (const c of calls) perFrame[c[1]] = (perFrame[c[1]] || 0) + 1;
  return { kind, state: window.__ac ? window.__ac.state : 'không tạo', goi: calls.length, theoTen: byName, nhieuNhatMotKhung: Math.max(0, ...Object.values(perFrame)), daoDong: v.length, cungLucNhieuNhat: maxN, tongAmLuongDinh: +maxG.toFixed(3), quaiTrung: mobs.filter((e) => e.hp < e.maxhp).length, quaiChet: mobs.filter((e) => e.dead).length };
}"""


def main():
    res = {}
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.add_init_script(SPY)
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        for f in ['bot.js', 'setup.js', 'au_lib.js']:
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
        # bảng tiếng của game: đọc thẳng từ mã nguồn engine.js (biến SFX là cục bộ)
        src = open(os.path.join(ROOT, 'js', 'engine.js'), encoding='utf-8').read()
        import re
        res['bang_tieng'] = {m[0]: {'tan_so': float(m[1]), 'dai_giay': float(m[2]), 'song': m[3], 'am_luong': float(m[4])}
                            for m in re.findall(r"(\w+): \[(\d+(?:\.\d+)?), (\d+(?:\.\d+)?), '(\w+)', (\d+(?:\.\d+)?)\]", src)}
        for k in 'ABC':
            r = pg.evaluate(JS, k)
            res[k] = r
            print(json.dumps(r, ensure_ascii=False))
        res['loi_trang'] = errs[:3]
        b.close()
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(res, f, ensure_ascii=False, indent=1)
    print('bảng tiếng:', len(res['bang_tieng']), 'tiếng')


if __name__ == '__main__':
    main()
