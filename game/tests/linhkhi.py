"""Kiểm tra hiệu ứng đạn (js/fx_dan.js) và phần hiển thị linh khí (js/linhkhi.js) ngay trong trang thật.
- Đạn: mỗi loại đạn có hình đúng theo vùng; vẽ đạn không đổi đường bay, tốc độ, sát thương; trúng tường có hiệu ứng; nhiều đạn không lỗi.
- Linh khí: vạch trong trận tăng đúng khi nhận dấu ấn, hệ chính sáng, hai hệ kia mờ, sắp đạt mốc thì nhấp nháy, hạt sáng bay vào vạch
  và chữ "+1 Lửa"; biểu tượng hệ trên đầu quái; màn kết quả ghi đúng số; màn Xem vũ khí và trang Cụ Đồ có đủ chữ.
Chạy: python3 tests/linhkhi.py   (thoát mã 1 nếu có mục sai)"""
import os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS = r"""
() => {
  const out = [];
  const ok = (name, cond, detail) => out.push([name, !!cond, detail === undefined ? '' : String(detail)]);
  const FR = (n) => { for (let i = 0; i < n; i++) { G.tick(); G.ui.begin(); G.scene.draw(); G.click = null; } };
  // ghi lại mọi chữ vẽ ra trong một khung
  const texts = (fn) => { const t0 = G.ui.text, got = []; G.ui.text = function (s, x, y, o) { got.push(String(s)); return t0.apply(this, arguments); }; try { fn(); } finally { G.ui.text = t0; } return got.join(' | '); };
  let S, W, P;
  function room(r, o) {
    G.testSave(Object.assign({ hero: 'smith', lvl: 12, tier: 1 }, o || {}));
    G.rnd = G.srand(7);
    G.startStage(r, 1, 0);
    S = G.getRun(); W = G.getWorld(); P = S.P;
    W.waves = []; W.spawns = []; W.ents.length = 0; W.props = W.props.filter((p) => p.type === 'roomFore');
    P.inv = 1e9;
    FR(10);
  }
  function mob(el, x, y) {
    const g = W.geo, e = G.spawnEnemy('rusher', x || g.cx, y || g.cy - 30, { hpMult: 1e4 });
    e.inside = true; e.st.stun = 1e9;
    if (el === 'fire') { e.st.fire = 3; e.st.last = 'fire'; }
    if (el === 'poison') { e.st.poisonN = 2; e.st.poisonT = 4; e.st.last = 'poison'; }
    if (el === 'ice') { e.st.iceN = 2; e.st.iceT = 4; e.st.last = 'ice'; }
    return e;
  }
  const row = (el) => G.lk.state.last.rows.find((r) => r.el === el);

  // ================= ĐẠN =================
  const looks = {};
  for (const r of [0, 1, 2]) {
    room(r);
    const L = (o) => G.fx.danLook(Object.assign({ team: 'enemy', x: 0, y: 0, vx: 1, vy: 0 }, o));
    looks[r] = [L({ kind: 'orb' }), L({ kind: 'spike', el: 'ice' }), L({ kind: 'spike', el: 'poison' }), L({ kind: 'fire', el: 'fire' }), L({ kind: 'bua', el: 'poison' }), L({ kind: 'fruit' }), L({ kind: 'orb', el: 'poison' })];
  }
  ok('Đạn rừng: quả cầu thường là bào tử, quả là quả nổ, hạt độc', looks[0][0] === 'spore' && looks[0][5] === 'fruit' && looks[0][6] === 'toxseed', looks[0]);
  ok('Đạn biển: bọt nước, gai băng', looks[1][0] === 'bubble' && looks[1][1] === 'icespike', looks[1]);
  ok('Đạn lâu đài: đạn pháo, tàn lửa, bùa', looks[2][0] === 'cannon' && looks[2][3] === 'ember' && looks[2][4] === 'bua' && looks[2][5] === 'cannon', looks[2]);

  // vẽ đạn không đổi đường bay: cùng một viên chạy có vẽ và không vẽ phải cho cùng vị trí
  function flight(render) {
    room(1);
    const g = W.geo;
    P.x = g.cx; P.y = g.fy1 - 10;
    W.projs.push({ team: 'enemy', kind: 'orb', x: g.cx - 60, y: g.cy - 40, vx: 40, vy: 25, t: 2.5, dmg: 1, el: 'ice', src: null, z: 12, homing: 30 });
    W.projs.push({ team: 'player', kind: 'arrow', x: g.cx, y: g.cy, vx: 270, vy: -20, t: 1, w: G.curW(P), mult: 1, pierce: 0, big: false, col: '#f1ead9', seen: [], z: 11 });
    const a = W.projs[0], b = W.projs[1], tr = [];
    for (let i = 0; i < 40; i++) { if (render) FR(1); else G.sim(1); tr.push(a.x.toFixed(3), a.y.toFixed(3), a.vx.toFixed(3), a.t.toFixed(3), b.x.toFixed(3), b.y.toFixed(3)); }
    return tr.join(',') + '|' + a.dmg + '|' + b.mult;
  }
  const f1 = flight(false), f2 = flight(true);
  ok('Vẽ đạn không đổi đường bay, tốc độ, thời gian bay, sát thương', f1 === f2, f1 === f2 ? '' : f1.slice(0, 80) + ' / ' + f2.slice(0, 80));

  // đụng tường: tên cắm vào tường, đạn quái vỡ ra
  room(2);
  const E0 = G.fx.state().E.length;
  W.projs.push({ team: 'player', kind: 'arrow', x: W.geo.fx1 - 12, y: W.geo.cy, vx: 270, vy: 0, t: 1, w: G.curW(P), mult: 1, pierce: 0, big: false, col: '#f1ead9', seen: [], z: 11 });
  FR(8);
  const stuck = G.fx.state().E.filter((o) => o.ty === 'he' && o.ux === 1).length;
  ok('Tên bay vào tường: cắm vào tường rồi mờ dần', stuck >= 1 && W.projs.length === 0, stuck + ' ' + W.projs.length);
  W.projs.push({ team: 'enemy', kind: 'orb', x: W.geo.fx0 + 8, y: W.geo.cy, vx: -150, vy: 0, t: 3, dmg: 1, el: null, src: null, z: 12 });
  FR(2); const pn = G.fx.stats().parts; FR(6);
  ok('Đạn quái đụng tường: vỡ tan (có vòng sóng và mảnh văng)', W.projs.length === 0 && G.fx.state().E.some((o) => o.ty === 'ring'), pn);

  // trúng quái: toé hạt và vòng sóng tại chỗ trúng
  room(0);
  const t1 = mob(null, W.geo.cx + 40, W.geo.cy);
  P.x = W.geo.cx - 30; P.y = W.geo.cy;
  W.projs.push({ team: 'player', kind: 'arrow', x: P.x + 8, y: P.y, vx: 270, vy: 0, t: 1, w: G.curW(P), mult: 1, pierce: 0, big: true, col: '#ff7a2a', seen: [], z: 11, he: { el: 'fire', lv: 2 } });
  let rings = 0;
  for (let i = 0; i < 20; i++) { FR(1); rings = Math.max(rings, G.fx.state().E.filter((o) => o.ty === 'ring').length); }
  ok('Tên trúng quái: có vòng sóng tại chỗ trúng và quái mất máu', rings >= 1 && t1.hp < t1.maxhp, rings + ' ' + Math.round(t1.maxhp - t1.hp));

  // nhiều đạn cùng lúc: không lỗi
  room(2);
  const e0 = G.fx.errs;
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; W.projs.push({ team: 'enemy', kind: ['orb', 'spike', 'fire', 'bua', 'fruit'][i % 5], el: [null, 'ice', 'fire', 'poison', null][i % 5], x: W.geo.cx, y: W.geo.cy, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90, t: 3, dmg: 0, src: null, z: 12 }); }
  const t0 = performance.now(); FR(120); const ms = (performance.now() - t0) / 120;
  ok('60 viên đạn bay cùng lúc: không lỗi vẽ', G.fx.errs === e0, G.fx.lastErr);
  ok('60 viên đạn bay cùng lúc: mỗi khung dưới 8 ms', ms < 8, ms.toFixed(2) + ' ms');

  // ================= LINH KHÍ =================
  // vũ khí đã khoá Lửa, 110 dấu ấn
  room(1, { branch: 'fire', marks: 110 });
  let w = G.curW(P);
  ok('Vạch trong trận: Lửa 110/120 là hệ chính, hai hệ kia mờ', row('fire').m === 110 && row('fire').next === 120 && row('fire').main && row('poison').dim && row('ice').dim, JSON.stringify(row('fire')));
  const fr0 = row('fire').frac;
  let e = mob('fire');
  G.kill(e, {}); FR(1);
  ok('Nhận 1 dấu ấn Lửa: số trên vạch tăng đúng 111/120', row('fire').m === 111 && row('fire').text === '111/120' && Math.floor(w.marks.fire) === 111, row('fire').text);
  ok('Nhận dấu ấn: phần đầy của vạch dài thêm', row('fire').frac > fr0 && Math.abs(row('fire').frac - (111 - 30) / 90) < 1e-6, row('fire').frac);
  const orbs = G.fx.state().E.filter((o) => o.ty === 'orb');
  const bp = G.lk.barPos('fire');
  ok('Hạt sáng bay ra từ quái', orbs.length >= 1, orbs.length);
  const d0 = orbs.length ? Math.hypot(orbs[0].x - (bp.x + W.cam), orbs[0].y - bp.y) : 0;
  FR(30);
  const d1 = orbs.length && orbs[0].t > 0 ? Math.hypot(orbs[0].x - (bp.x + W.cam), orbs[0].y - bp.y) : 0;
  ok('Hạt sáng bay về phía vạch Lửa', d1 < d0, d0.toFixed(1) + ' -> ' + d1.toFixed(1));
  const nums = [];
  for (let i = 0; i < 90; i++) { FR(1); for (const n of G.fx.state().N || []) if (!nums.includes(n.s)) nums.push(n.s); }
  ok('Chữ nổi "+1 Lửa" hiện cạnh vạch', nums.some((s) => s === '+1 Lửa'), nums.join(','));
  // sắp đạt mốc thì nhấp nháy
  w.marks.fire = 117; FR(1);
  ok('Còn 3 dấu ấn tới mốc 120: vạch Lửa nhấp nháy', row('fire').near, JSON.stringify(row('fire')));
  w.marks.fire = 100; FR(1);
  ok('Còn 20 dấu ấn: chưa nhấp nháy', !row('fire').near);
  // đổi vũ khí: vạch theo vũ khí đang cầm
  w.marks.poison = 7;
  P.cur = 1 - P.cur; FR(1);
  ok('Đổi vũ khí: vạch đọc dấu ấn của vũ khí đang cầm', G.lk.state.last.wid === G.curW(P).id);
  P.cur = 1 - P.cur; FR(1);

  // biểu tượng hệ trên đầu quái
  const a1 = mob('poison', W.geo.cx - 40), a2 = mob(null, W.geo.cx + 40);
  FR(3);
  ok('Quái đang trúng độc có biểu tượng Độc trên đầu', G.lk.badgeList.some((b) => b.e === a1 && b.el === 'poison'), JSON.stringify({ hid: a1.hidden, dy: a1.dying, st: a1.st, n: G.lk.badgeList.length }));
  ok('Quái không dính hiệu ứng thì không có biểu tượng', !G.lk.badgeList.some((b) => b.e === a2));
  a1.st.fire = 2; a1.st.last = 'fire'; FR(1);
  ok('Biểu tượng theo hiệu ứng gây sau cùng (giống luật dấu ấn)', G.lk.badgeList.some((b) => b.e === a1 && b.el === 'fire') && G.lk.markEl(a1) === 'fire');

  // chưa khoá hệ: ba vạch đều sáng, hệ nào đủ 30 trước thì khoá
  room(0, {});
  w = G.curW(P);
  w.marks.fire = 20; w.marks.poison = 29;
  FR(1);
  ok('Chưa khoá hệ: ba vạch đều sáng, mốc kế là 30', ['fire', 'poison', 'ice'].every((el) => !row(el).dim && row(el).next === 30), JSON.stringify(G.lk.state.last.rows.map((r) => [r.el, r.m, r.dim])));
  G.kill(mob('poison'), {}); FR(1);
  ok('Độc đủ 30 trước: vũ khí khoá Độc, vạch Độc thành hệ chính, Lửa mờ đi', w.branch === 'poison' && row('poison').main && row('fire').dim && row('poison').text === '30/120', JSON.stringify(row('poison')));

  // ================= MÀN KẾT QUẢ =================
  room(1, { branch: 'fire', marks: 100 });
  const ws = P.weapons, wa = ws[0], wb = ws[1];
  P.cur = 0;
  for (let i = 0; i < 5; i++) G.kill(mob('fire'), {});
  for (let i = 0; i < 2; i++) G.kill(mob('poison'), {});
  G.kill(mob('ice'), { w: wb });
  G.kill(mob(null), {}); // quái không dính hiệu ứng: không có dấu ấn
  FR(5);
  const k = P.markMult * W.marksMult, n5 = Math.round(5 * k), n2 = Math.round(2 * k), n1 = Math.round(k), tot = Math.floor(100 + 5 * k);
  G.finishStage(false); FR(30);
  const rows = G.lk.resultRows(S);
  const ra = rows.find((r) => r.w === wa), rb = rows.find((r) => r.w === wb);
  const got = (r) => r.got.map((q) => q.n + ' ' + q.el).join(', ');
  ok('Kết quả: vũ khí 1 nhận ' + n5 + ' Lửa, ' + n2 + ' Độc (5 và 2 con, nhân hệ số dấu ấn ' + k + ')', got(ra) === n5 + ' fire, ' + n2 + ' poison', got(ra));
  ok('Kết quả: vũ khí 2 nhận ' + n1 + ' Băng', got(rb) === n1 + ' ice', got(rb));
  ok('Kết quả: ghi tổng hiện tại/mốc kế, còn bao nhiêu, mốc kế mở gì', ra.prog === 'Lửa ' + tot + '/120 · còn ' + (120 - tot) + ' nữa → Thành hình: mở Vệt cháy', ra.prog);
  const shown = texts(() => G.scene.draw());
  ok('Màn kết quả vẽ đủ chữ: số dấu ấn từng hệ và tổng/mốc kế', shown.includes('+' + n5 + ' Lửa') && shown.includes('+' + n2 + ' Độc') && shown.includes('Lửa ' + tot + '/120') && shown.includes('Linh khí của vũ khí'), shown.slice(-300));
  // ải hướng dẫn: dấu ấn nhân đôi, sổ ghi vẫn khớp với số thật
  G.testSave({ hero: 'smith' }); G.save.tut.done = false; G.startStage(0, 0, 0);
  S = G.getRun(); W = G.getWorld(); P = S.P; W.waves = []; W.spawns = []; W.ents.length = 0; P.inv = 1e9;
  const m0 = G.curW(P).marks.fire;
  for (let i = 0; i < 3; i++) G.kill(mob('fire'), {});
  ok('Ải đầu (dấu ấn x2): số ghi ở màn kết quả khớp số dấu ấn thật', Math.abs(S.lkGain[G.curW(P).id].fire - (G.curW(P).marks.fire - m0)) < 1e-9, S.lkGain[G.curW(P).id].fire + ' / ' + (G.curW(P).marks.fire - m0));
  // tối đa bậc và đã Thức tỉnh
  const cw = G.curW(P);
  cw.rarity = 0; cw.branch = 'ice'; cw.marks = { fire: 0, poison: 0, ice: 150 };
  ok('Vũ khí Thường đã Thành hình: báo tối đa bậc, cần nâng bậc', G.lk.resultRows(S).find((r) => r.w === cw).prog.includes('tối đa bậc Thường'), G.lk.resultRows(S).find((r) => r.w === cw).prog);
  cw.rarity = 3; cw.marks.ice = 320;
  ok('Vũ khí đã qua 300: báo đã Thức tỉnh', G.lk.resultRows(S).find((r) => r.w === cw).prog.includes('đã Thức tỉnh'), G.lk.resultRows(S).find((r) => r.w === cw).prog);

  // ================= XEM VŨ KHÍ và CỤ ĐỒ =================
  G.testSave({ hero: 'smith', tier: 2, branch: 'fire', marks: 140 });
  G.setScene(G.Village); FR(5);
  const V = G.villageApi.V;
  V.tab = 'weapon'; V.wid = G.save.carry[0]; V.back = 'hub'; V.wvTab = 'lk';
  let s = texts(() => { G.ui.begin(); G.scene.draw(); });
  ok('Xem vũ khí: bảng linh khí ba hệ có số và mốc', s.includes('Linh khí (dấu ấn hệ)') && s.includes('140/300') && s.includes('mốc 30 · 120 · 300') && s.includes('Băng'), s.slice(0, 160));
  ok('Xem vũ khí: hệ chính, đã mở, sắp mở, cách cày', s.includes('Hệ chính: Lửa') && s.includes('Đã mở: Vệt cháy') && s.includes('Sắp mở: Thức tỉnh: mở Nổ lan (còn 160') && s.includes('Đánh quái đang cháy rồi kết liễu để nhận dấu ấn Lửa'));
  V.wvTab = 'aff';
  s = texts(() => { G.ui.begin(); G.scene.draw(); });
  ok('Xem vũ khí: thẻ Dòng phụ vẫn còn', s.includes('Dòng phụ') && !s.includes('Linh khí (dấu ấn hệ)'));
  V.wvTab = 'lk';
  V.tab = 'help'; V.page = 0;
  let found = false;
  for (let i = 0; i < 12 && !found; i++) { V.page = i; s = texts(() => { G.ui.begin(); G.scene.draw(); }); found = s.includes('Linh khí: dấu ấn hệ của vũ khí'); }
  ok('Cụ Đồ: có trang Linh khí vẽ bằng hình, ghi "Kết hợp hai hệ: sắp có"', found && s.includes('Kết hợp hai hệ: sắp có') && s.includes('30 · Mầm') && s.includes('300 · Thức tỉnh'));
  V.tab = 'forge'; V.ftab = 'sharpen'; V.sel = G.save.carry[0];
  s = texts(() => { G.ui.begin(); G.scene.draw(); });
  ok('Ông Thợ Rèn: có nút Xem linh khí cho món đang chọn', s.includes('Xem linh khí'));
  ok('Không có lỗi vẽ hiệu ứng', G.fx.errs === 0, G.fx.lastErr);
  G.rnd = Math.random;
  return out;
}
"""


def main():
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.wait_for_timeout(300)
        pg.evaluate("window.requestAnimationFrame = () => 0")
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'bot.js'))
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        res = pg.evaluate(JS)
        b.close()
    bad = 0
    for name, good, detail in res:
        print(('ĐÚNG ' if good else 'SAI  ') + name + ('' if good or not detail else '  [' + detail + ']'))
        bad += 0 if good else 1
    for e in errs:
        print('LỖI TRANG', e); bad += 1
    print(f'{len(res) - bad}/{len(res)} mục đúng')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
