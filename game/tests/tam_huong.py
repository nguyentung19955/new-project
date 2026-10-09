"""Kiểm tra tám hướng và bốn chiêu Đặc biệt riêng (js/moves.js, js/combat.js), ngay trong trang thật.
Với quái đặt ở 8 hướng quanh em bé (gần và xa trong tầm), mỗi đòn phải trúng quái đúng hướng và KHÔNG trúng quái đặt
ở hướng ngược lại (đặt xa hơn một chút để quái đúng hướng là con gần nhất). Thêm: lướt và lao đi đúng hướng, không
xuyên tường; Phi Thương ghim quái rồi bay về tay; nút Chưởng (thay kỹ năng riêng của hero) bắn theo hướng nhắm.
Chạy: python3 tests/tam_huong.py [-v]   (thoát mã 1 nếu có mục sai)"""
import os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS = r"""
() => {
  const out = [];
  const ok = (name, cond, detail) => out.push([name, !!cond, detail === undefined ? '' : String(detail)]);
  let W, P, S, inp = {};
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, inp);
  const PRESS = ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP'];
  const run = (n, i) => { if (i) inp = i; for (let k = 0; k < n; k++) { G.sim(1); for (const q of PRESS) delete inp[q]; } };
  const sec = (s, i) => run(Math.round(s * 60), i);
  const K = G.ZK || 0.85;
  function room(type, o) {
    o = o || {};
    G.testSave({ hero: o.hero || 'smith', melee: type === 'bow' ? 'sword' : type, tier: 1 });
    G.HEROES[o.hero || 'smith'].fav = [];
    G.startStage(0, 2, 0, { kind: 'A', seed: 3 });
    S = G.getRun(); W = G.getWorld(); P = S.P;
    if (o.big) { G.gotoRoom(S.map.boss); W = G.getWorld(); if (W.boss) { W.boss.dead = true; W.boss = null; W.px1 = null; W.shrink = null; } }
    W.waves = []; W.spawns = []; W.props = []; W.banner = null;
    for (const e of W.ents) e.dead = true; W.ents = [];
    if (type === 'bow') P.cur = 1;
    inp = {}; run(4);
    P.x = W.geo.cx; P.y = (W.y0 + W.y1) / 2; P.face = 1; P.inv = 9; P.mana = P.maxmana; P.ldx = null; P.ldy = null; P.cdT = 0;
    W.zones = [];
    return W;
  }
  // bia thử đứng yên, đặt cách em bé r điểm ảnh trên sàn theo hướng góc a (độ, 0 là phải, 90 là xuống)
  function dummy(a, r, ox, oy) {
    const x = (ox != null ? ox : P.x) + Math.cos(a * Math.PI / 180) * r, y = (oy != null ? oy : P.y) + Math.sin(a * Math.PI / 180) * r * K;
    const e = G.spawnEnemy('rusher', x, y, { hpMult: 1e6, noArt: true });
    e.st.stun = 1e9; e.inside = true;
    return e;
  }
  const lost = (e) => e.maxhp - e.hp;
  const fits = (a, r) => { const x = P.x + Math.cos(a * Math.PI / 180) * r, y = P.y + Math.sin(a * Math.PI / 180) * r * K; return x > W.x0 + 4 && x < W.x1 - 4 && y > W.y0 + 2 && y < W.y1 - 2; };
  const NAMES = { 0: 'phải', 45: 'chéo xuống phải', 90: 'xuống', 135: 'chéo xuống trái', 180: 'trái', 225: 'chéo lên trái', 270: 'lên', 315: 'chéo lên phải' };
  const DIRS = [0, 45, 90, 135, 180, 225, 270, 315];
  // Thử một đòn ở 8 hướng: quái đúng hướng ở khoảng r, quái ngược hướng ở r + gap. act() tung đòn và chờ xong.
  function eightWay(label, type, rs, act, o) {
    o = o || {};
    for (const r of rs) {
      const bad = [], skip = [];
      for (const a of DIRS) {
        room(type, Object.assign({ big: r >= 80 }, o));
        if (!fits(a, r) || !fits(a + 180, r + (o.gap || 4))) {
          // phòng không đủ rộng theo hướng này: dời em bé về phía ngược lại để vừa
          const ux = Math.cos(a * Math.PI / 180), uy = Math.sin(a * Math.PI / 180);
          P.x = G.clamp(W.geo.cx - ux * (r - (o.gap || 4)) / 2, W.x0 + 6, W.x1 - 6); P.y = G.clamp((W.y0 + W.y1) / 2 - uy * K * (r - (o.gap || 4)) / 2, W.y0 + 2, W.y1 - 2);
          if (!fits(a, r) || !fits(a + 180, r + (o.gap || 4))) { skip.push(NAMES[a]); continue; }
        }
        const t = dummy(a, r), d = dummy(a + 180, r + (o.gap || 4));
        act(a, t, d);
        if (!(lost(t) > 0) || lost(d) > 0) bad.push(NAMES[a] + ' (đúng ' + Math.round(lost(t)) + ', ngược ' + Math.round(lost(d)) + ')');
      }
      ok(label + ', quái cách ' + r + ': trúng đúng hướng, không trúng hướng ngược ở cả 8 hướng' + (skip.length ? ' (phòng hẹp, bỏ qua: ' + skip.join(', ') + ')' : ''), bad.length === 0 && skip.length < 4, bad.join('; ') || 'đủ 8 hướng');
    }
  }
  const tap = () => { run(2, { atk: true }); run(1, {}); };
  const waitAtk = () => { let n = 0; while ((P.atkT > 0 || P.dashT > 0) && n++ < 200) run(1, {}); };
  try {
    // ---------- đòn thường ----------
    eightWay('Kiếm: chuỗi ba nhát', 'sword', [16, 28], () => { for (let k = 0; k < 3; k++) { tap(); waitAtk(); } });
    eightWay('Giáo: đâm', 'spear', [20, 52], () => { tap(); waitAtk(); });
    eightWay('Giáo: quét vòng (chừa khe sau lưng)', 'spear', [24], (a, t, d) => { for (let k = 0; k < 3; k++) { tap(); waitAtk(); } d.hp = d.maxhp; t.hp = t.maxhp; tap(); waitAtk(); }, { gap: 2 });
    eightWay('Giáo: xốc tới (giữ rồi thả)', 'spear', [26, 48], () => { sec(0.75, { atk: true }); run(1, {}); waitAtk(); });
    eightWay('Búa: nện', 'hammer', [16, 28], () => { tap(); waitAtk(); });
    eightWay('Búa: nện tích lực nấc 2 (cả sóng chấn động)', 'hammer', [24, 80], () => { sec(1.25, { atk: true }); run(1, {}); sec(1, {}); }, { gap: 24 });
    // nhát lướt: né về phía quái rồi đánh ngay; đặt bia sau khi né xong
    {
      const bad = [];
      for (const a of DIRS) {
        room('sword');
        const ux = Math.cos(a * Math.PI / 180), uy = Math.sin(a * Math.PI / 180);
        P.x = G.clamp(W.geo.cx - ux * 40, W.x0 + 10, W.x1 - 10); P.y = G.clamp((W.y0 + W.y1) / 2 - uy * 30, W.y0 + 4, W.y1 - 4);
        run(1, { dodgeP: true, mx: ux, my: uy }); let n = 0; while (P.dodgeT > 0 && n++ < 60) run(1, { mx: ux, my: uy });
        const t = dummy(a, 26), d = dummy(a + 180, 30), x0 = P.x, y0 = P.y;
        run(2, { atk: true }); const kind = P.mv.kind; waitAtk();
        const mx = P.x - x0, my = (P.y - y0) / K, ml = Math.hypot(mx, my), cos = ml > 0 ? (mx * ux + my * uy) / ml : 0;
        if (kind !== 'luot' || !(lost(t) > 0) || lost(d) > 0 || cos < 0.95) bad.push(NAMES[a] + ' (' + kind + ', đúng ' + Math.round(lost(t)) + ', ngược ' + Math.round(lost(d)) + ', lệch cos ' + cos.toFixed(2) + ')');
      }
      ok('Kiếm: nhát lướt sau Né đi đúng hướng, trúng đúng hướng, không trúng hướng ngược ở cả 8 hướng', bad.length === 0, bad.join('; ') || 'đủ 8 hướng');
    }
    // ---------- bốn chiêu Đặc biệt ----------
    const spec = () => { run(1, { specialP: true }); sec(2.4, {}); };
    eightWay('Kiếm: Trảm Nguyệt', 'sword', [30, 90], spec, { gap: 8 });
    eightWay('Giáo: Phi Thương', 'spear', [30, 90], spec, { gap: 8 });
    eightWay('Búa: Địa Chấn (vệt nứt)', 'hammer', [44, 90], spec, { gap: 6 });
    eightWay('Cung: Mưa Tên', 'bow', [56, 90], spec, { gap: 26 });
    // ---------- nút Chưởng (thay kỹ năng riêng của hero, js/chuong.js): em bé nào cũng bắn theo hướng nhắm ----------
    for (const hero of ['smith', 'hunter', 'healer', 'wrestler']) eightWay(G.HEROES[hero].name + ': Chưởng bắn vào quái', 'sword', [50], () => { P.skillCd = 0; run(1, { skillP: true }); sec(0.8, {}); }, { hero, gap: 30 });
    {
      // không có quái: chưởng bay theo hướng đang kéo cần
      room('sword', { hero: 'hunter' }); inp = { mx: 0, my: -1 }; run(2); P.skillCd = 0; run(1, { skillP: true, mx: 0, my: -1 });
      const q = (W.chs || [])[0];
      ok('Chưởng: không có quái thì bay theo hướng nhắm (kéo cần lên thì bay lên)', q && q.uy < -0.9 && Math.abs(q.ux) < 0.2, q && q.ux.toFixed(2) + ',' + q.uy.toFixed(2));
    }
    // ---------- lướt, lao đi đúng hướng và không xuyên tường ----------
    {
      const bad = [];
      for (const a of DIRS) {
        room('spear');
        const ux = Math.cos(a * Math.PI / 180), uy = Math.sin(a * Math.PI / 180);
        P.x = W.geo.cx; P.y = (W.y0 + W.y1) / 2;
        sec(0.7, { atk: true, mx: ux * 0.5, my: uy * 0.5 }); const x0 = P.x, y0 = P.y; run(1, { mx: ux * 0.5, my: uy * 0.5 }); waitAtk();
        const mx = P.x - x0, my = (P.y - y0) / K, ml = Math.hypot(mx, my), cos = ml > 0 ? (mx * ux + my * uy) / ml : 0;
        if (cos < 0.97) bad.push(NAMES[a] + ' lệch ' + cos.toFixed(2));
      }
      ok('Giáo: xốc tới không có quái thì đi đúng hướng đang kéo cần ở cả 8 hướng', bad.length === 0, bad.join('; ') || 'đủ 8 hướng');
      const wb = [];
      for (const a of DIRS) {
        room('spear');
        const ux = Math.cos(a * Math.PI / 180), uy = Math.sin(a * Math.PI / 180);
        P.x = G.clamp(W.geo.cx + ux * 200, W.x0 + 6, W.x1 - 6); P.y = G.clamp((W.y0 + W.y1) / 2 + uy * 200, W.y0 + 3, W.y1 - 3);
        sec(0.7, { atk: true, mx: ux * 0.5, my: uy * 0.5 }); run(1, { mx: ux * 0.5, my: uy * 0.5 }); waitAtk();
        if (!(P.x >= W.x0 - 0.01 && P.x <= W.x1 + 0.01 && P.y >= W.y0 - 0.01 && P.y <= W.y1 + 0.01)) wb.push(NAMES[a]);
        room('sword'); P.x = G.clamp(W.geo.cx + ux * 200, W.x0 + 6, W.x1 - 6); P.y = G.clamp((W.y0 + W.y1) / 2 + uy * 200, W.y0 + 3, W.y1 - 3);
        run(1, { dodgeP: true, mx: ux, my: uy }); let n = 0; while (P.dodgeT > 0 && n++ < 60) run(1, { mx: ux, my: uy }); run(2, { atk: true }); waitAtk();
        if (!(P.x >= W.x0 - 0.01 && P.x <= W.x1 + 0.01 && P.y >= W.y0 - 0.01 && P.y <= W.y1 + 0.01)) wb.push('lướt ' + NAMES[a]);
      }
      ok('Lướt và xốc tới vào tường (8 hướng, cả góc phòng) thì dừng trong sàn, không xuyên tường', wb.length === 0, wb.join(', ') || 'đủ');
    }
    // ---------- Phi Thương: ghim, cắm, bay về tay ----------
    {
      room('spear'); const a = dummy(0, 30), b = dummy(0, 60), base = G.pDamage(P, G.curW(P)), C = G.MOVES.special.spear;
      run(1, { specialP: true });
      ok('Phi Thương: ném xong thì giáo rời tay (đang bay)', P.spearOut === G.curW(P).id && W.mvSp && W.mvSp.length === 1);
      let n = 0; while (W.mvSp.length && W.mvSp[0].phase === 'out' && n++ < 200) run(1, {});
      const q = W.mvSp[0];
      ok('Phi Thương: xuyên cả hàng, con cuối bị ghim choáng, giáo cắm lại', q && q.phase === 'stick' && q.pin === b && b.st.stun > 0 && lost(a) > 0 && lost(b) > 0, q && q.phase);
      a.st.stun = 1e9;
      // trong lúc giáo chưa về: nút Đánh là cú đấm tay
      const h0 = a.hp; P.x = a.x - 14; P.y = a.y; run(2, { atk: true }); const nm = P.mv.name; waitAtk();
      ok('Phi Thương: giáo chưa về thì nút Đánh là cú đấm tay yếu (' + C.name + ')', nm === 'Đấm' && Math.abs((h0 - a.hp) / base - G.MOVES.punch.mult) < 0.02, nm + ' ' + ((h0 - a.hp) / base).toFixed(2));
      run(1, { specialP: true });
      ok('Phi Thương: giáo chưa về thì chưa ném lại được', W.mvSp.length === 1);
      room('spear'); const c1 = dummy(0, 50); const b0 = G.pDamage(P, G.curW(P));
      run(1, { specialP: true }); n = 0; while (W.mvSp && W.mvSp.length && n++ < 400) run(1, {});
      ok('Phi Thương: giáo tự bay về tay và trúng lần nữa trên đường về', !W.mvSp.length && P.spearOut == null && Math.abs(lost(c1) / b0 - (C.mult + C.backMult)) < 0.05, (lost(c1) / b0).toFixed(2) + ' sau ' + n + ' khung');
      tap(); ok('Phi Thương: giáo về tay thì nút Đánh lại là đâm', P.mv.name === 'Đâm', P.mv.name);
    }
    // ---------- Địa Chấn: hất tung và choáng; Trảm Nguyệt: xuyên mọi quái ----------
    {
      room('hammer'); const e = dummy(0, 70); run(1, { specialP: true }); sec(0.4, {});
      ok('Địa Chấn: quái trên vệt nứt bị hất tung và choáng', lost(e) > 0 && e.mvLift >= 0 && e.st.stun > 0);
      room('sword'); const s1 = dummy(0, 30), s2 = dummy(0, 50), s3 = dummy(0, 75); run(1, { specialP: true }); sec(0.6, {});
      ok('Trảm Nguyệt: xuyên qua mọi quái trên đường bay', lost(s1) > 0 && lost(s2) > 0 && lost(s3) > 0);
      ok('Trảm Nguyệt: em bé lùi nửa bước khi tung', P.x < W.geo.cx - 4, (P.x - W.geo.cx).toFixed(1));
    }
  } catch (err) { ok('chạy không lỗi', false, err.stack || err); }
  return out;
}
"""


def main():
    verbose = '-v' in sys.argv
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        pg.evaluate('() => { G.noRender = true; }')
        res = pg.evaluate(JS)
        b.close()
    bad = [r for r in res if not r[1]]
    for name, good, detail in res:
        if verbose or not good:
            print(('ĐẠT ' if good else 'SAI ') + name + ('  -> ' + detail if detail else ''))
    if errs:
        print('LỖI TRANG:', errs[:3])
    print('%d/%d mục đạt' % (len(res) - len(bad), len(res)))
    sys.exit(1 if bad or errs else 0)


main()
