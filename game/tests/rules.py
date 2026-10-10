"""Kiểm tra luật cốt lõi ngay trong trang thật: hiệu ứng ba hệ, kết hợp, dấu ấn, mốc tiến hóa, lớp thích nghi, chấm sao.
Chạy: python3 tests/rules.py   (thoát mã 1 nếu có luật sai)"""
import sys
from playwright.sync_api import sync_playwright

JS = r"""
() => {
  const out = [];
  const ok = (name, cond, detail) => out.push([name, !!cond, detail === undefined ? '' : String(detail)]);
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const sec = (s) => G.sim(Math.round(s * 60));
  let W, P, S;
  // Phòng trống: không có đợt quái, người chơi đứng yên.
  function room(hero, r, i, diff) {
    G.testSave({ hero: hero || 'hunter' });
    G.startStage(r || 0, i == null ? 2 : i, diff || 0);
    S = G.getRun(); W = G.getWorld(); P = S.P;
    W.waves = []; W.props = [];
    sec(0.1);
  }
  function dummy(x, role) {
    const e = G.spawnEnemy(role || 'rusher', x, 190, { hpMult: 1e6 });
    e.st.stun = 1e9; e.inside = true;
    return e;
  }
  const lost = (e) => e.maxhp - e.hp;

  // ----- Lửa -----
  room();
  let e = dummy(300);
  G.applyStatus(e, 'fire', 100);
  ok('Lửa: dính 3 giây', near(e.st.fire, 3, 0.01), e.st.fire);
  sec(2.9); ok('Lửa: còn cháy ở giây 2,9', e.st.fire > 0);
  sec(0.2); ok('Lửa: hết sau 3 giây', e.st.fire <= 0 && !G.hasStatus(e));
  ok('Lửa: tổng khoảng 60% sát thương vũ khí (20% mỗi giây)', lost(e) >= 50 && lost(e) <= 70, lost(e));
  G.applyStatus(e, 'fire', 100); sec(2); G.applyStatus(e, 'fire', 100);
  ok('Lửa: đánh tiếp thì làm mới thời gian, không cộng dồn', near(e.st.fire, 3, 0.01) && near(e.st.fireDmg, 20, 0.01));

  // ----- Độc -----
  room(); e = dummy(300);
  for (let k = 0; k < 7; k++) G.applyStatus(e, 'poison', 100);
  ok('Độc: tối đa 5 tầng', e.st.poisonN === 5, e.st.poisonN);
  let h0 = e.hp; sec(2);
  // 5 tầng x 6% x 100 = 30 mỗi giây, cộng 20% vì mỗi tầng tăng 4% sát thương nhận vào
  ok('Độc: 5 tầng gây khoảng 6% mỗi tầng mỗi giây', near(h0 - e.hp, 72, 20), h0 - e.hp);
  sec(2.9); ok('Độc: còn ở giây 4,9', e.st.poisonN === 5);
  sec(0.2); ok('Độc: hết sau 5 giây', e.st.poisonN === 0 && !G.hasStatus(e));
  const sh = dummy(320, 'shield');
  h0 = sh.hp; G.damage(sh, 100, {});
  ok('Khiên: giáp giảm 45% sát thương', near(h0 - sh.hp, 55, 0.01), h0 - sh.hp);
  for (let k = 0; k < 5; k++) G.applyStatus(sh, 'poison', 1);
  h0 = sh.hp; G.damage(sh, 100, {});
  ok('Độc: 5 tầng ăn mòn hết giáp', h0 - sh.hp >= 100, h0 - sh.hp);

  // ----- Băng -----
  room(); e = dummy(300);
  for (let k = 0; k < 4; k++) G.applyStatus(e, 'ice', 100);
  ok('Băng: 4 tầng làm chậm', e.st.iceN === 4 && e.st.frozen <= 0, e.st.iceN);
  G.applyStatus(e, 'ice', 100);
  ok('Băng: tầng thứ 5 đóng băng 1,5 giây', near(e.st.frozen, 1.5, 0.01) && e.st.iceN === 0, e.st.frozen);
  ok('Băng: sau đó miễn đóng băng 5 giây', near(e.st.freezeImm, 5, 0.01), e.st.freezeImm);
  sec(1.6);
  ok('Băng: tan băng sau 1,5 giây', e.st.frozen <= 0);
  for (let k = 0; k < 7; k++) G.applyStatus(e, 'ice', 100);
  ok('Băng: đang miễn thì chỉ dừng ở 4 tầng, không đóng băng lại', e.st.iceN === 4 && e.st.frozen <= 0, e.st.iceN + '/' + e.st.frozen);
  sec(3.9); ok('Băng: tầng còn ở giây 3,9', e.st.iceN === 4);
  sec(0.2); ok('Băng: tầng hết sau 4 giây', e.st.iceN === 0);
  for (let k = 0; k < 5; k++) G.applyStatus(e, 'ice', 100);
  ok('Băng: hết miễn thì đóng băng lại được', e.st.frozen > 0);

  // ----- Nổ khói -----
  room(); let a = dummy(300), b = dummy(320), c = dummy(440);
  for (let k = 0; k < 3; k++) G.applyStatus(a, 'poison', 1);
  let ha = a.hp, hb = b.hp, hc = c.hp;
  G.applyStatus(a, 'fire', 100);
  ok('Nổ khói: gây 150% lên quái xung quanh', near(hb - b.hp, 150, 0.01), hb - b.hp);
  ok('Nổ khói: mục tiêu chính cũng dính (đang 3 tầng độc nên +12%)', near(ha - a.hp, 168, 0.01), ha - a.hp);
  ok('Nổ khói: quái ở xa không dính', hc === c.hp);
  ok('Nổ khói: tiêu hết tầng độc, lửa bám lại', a.st.poisonN === 0 && a.st.fire > 0, a.st.poisonN + '/' + a.st.fire);
  room(); a = dummy(300);
  G.applyStatus(a, 'fire', 100); ha = a.hp; G.applyStatus(a, 'poison', 100);
  ok('Nổ khói: Độc lên quái đang cháy cũng nổ và không để lại độc', near(ha - a.hp, 150, 0.01) && a.st.poisonN === 0, (ha - a.hp) + '/' + a.st.poisonN);

  // ----- Sốc nhiệt -----
  room(); a = dummy(300); b = dummy(320);
  G.applyStatus(a, 'ice', 1, 2); ha = a.hp; hb = b.hp;
  G.applyStatus(a, 'fire', 100);
  ok('Sốc nhiệt: 250% lên một mục tiêu', near(ha - a.hp, 250, 0.01) && hb === b.hp, ha - a.hp);
  ok('Sốc nhiệt: xóa cả Lửa và Băng', a.st.fire <= 0 && a.st.iceN === 0 && !G.hasStatus(a));
  G.applyStatus(b, 'fire', 100); hb = b.hp; G.applyStatus(b, 'ice', 100);
  ok('Sốc nhiệt: Băng lên quái đang cháy cũng kích hoạt', near(hb - b.hp, 250, 0.01) && !G.hasStatus(b), hb - b.hp);
  c = dummy(360);
  for (let k = 0; k < 5; k++) G.applyStatus(c, 'ice', 1);
  G.applyStatus(c, 'fire', 100);
  ok('Sốc nhiệt: làm tan cả đóng băng', c.st.frozen <= 0 && !G.hasStatus(c), c.st.frozen);

  // ----- tối đa 2 hiệu ứng -----
  room(); a = dummy(300);
  G.applyStatus(a, 'poison', 100); G.applyStatus(a, 'ice', 100);
  ok('Độc + Băng cùng tồn tại (Độc ngấm)', a.st.poisonN === 1 && a.st.iceN === 1);
  a.st.comboCd = 5; // chặn phản ứng để thử riêng giới hạn 2 hiệu ứng
  G.applyStatus(a, 'fire', 100);
  ok('Mỗi mục tiêu mang tối đa 2 hiệu ứng khác hệ', a.st.fire <= 0 && a.st.poisonN === 1 && a.st.iceN === 1, a.st.fire);
  sec(4.2);
  ok('Độc ngấm: độc kéo dài hơn trong lúc bị chậm', a.st.poisonN === 1 && a.st.iceN === 0);

  // ----- dấu ấn -----
  room('hunter');
  const w0 = P.weapons[0], w1 = P.weapons[1];
  e = dummy(300); G.applyStatus(e, 'fire', 1); e.hp = 1; G.damage(e, 50, {});
  ok('Dấu ấn: kết liễu quái đang cháy cho 1 dấu ấn Lửa vào vũ khí đang cầm', w0.marks.fire === 1 && w1.marks.fire === 0, JSON.stringify(w0.marks));
  e = dummy(300); e.hp = 1; G.damage(e, 50, {});
  ok('Dấu ấn: quái không dính hiệu ứng thì không cho', w0.marks.fire === 1 && w0.marks.poison === 0 && w0.marks.ice === 0);
  e = dummy(300, 'elite'); G.applyStatus(e, 'poison', 1); e.hp = 1; G.damage(e, 50, {});
  ok('Dấu ấn: tinh anh cho 5, đúng hệ Độc', w0.marks.poison === 5, w0.marks.poison);
  P.cur = 1;
  e = dummy(300); G.applyStatus(e, 'ice', 1); e.hp = 1; G.damage(e, 50, {});
  ok('Dấu ấn: đổi vũ khí thì vũ khí mới nhận', w1.marks.ice === 1 && w0.marks.ice === 0);
  e = dummy(300); G.applyStatus(e, 'poison', 1); G.applyStatus(e, 'ice', 1); sec(4.2);
  e.hp = 1; G.damage(e, 50, {});
  ok('Dấu ấn: tính theo hiệu ứng còn hiệu lực lúc kết liễu', w1.marks.poison === 1 && w1.marks.ice === 1, JSON.stringify(w1.marks));
  e = dummy(300); G.applyStatus(e, 'fire', 100); e.hp = 1; sec(0.6);
  ok('Dấu ấn: quái chết vì cháy cũng tính', e.dead && w1.marks.fire === 1, JSON.stringify(w1.marks));
  e = dummy(300); for (let k = 0; k < 2; k++) G.applyStatus(e, 'poison', 1); e.hp = 100; G.applyStatus(e, 'fire', 100);
  ok('Dấu ấn: kết liễu bằng Nổ khói vẫn tính', e.dead && w1.marks.poison + w1.marks.fire === 3, JSON.stringify(w1.marks));
  room('smith'); e = dummy(300); G.applyStatus(e, 'fire', 1); e.hp = 1; G.damage(e, 50, {});
  ok('Thợ Rèn: dấu ấn nhanh hơn 20%', near(P.weapons[0].marks.fire, 1.2, 1e-9), P.weapons[0].marks.fire);

  // ----- khóa nhánh và mốc tiến hóa -----
  room('hunter');
  let w = P.weapons[0];
  G.addMarks(w, 'fire', 29);
  ok('Nhánh: 29 dấu ấn chưa khóa', w.branch === null && G.wStage(w) === 0);
  G.addMarks(w, 'fire', 1);
  ok('Nhánh: đủ 30 thì khóa nhánh, đạt Mầm', w.branch === 'fire' && G.wStage(w) === 1);
  G.addMarks(w, 'ice', 80);
  ok('Nhánh: hệ khác đủ 30 sau đó không đổi nhánh', w.branch === 'fire' && G.wStage(w) === 1 && w.marks.ice === 80);
  G.addMarks(w, 'fire', 89);
  ok('Mốc: 119 vẫn là Mầm', G.wStage(w) === 1);
  G.addMarks(w, 'fire', 1);
  ok('Mốc: 120 là Thành hình', G.wStage(w) === 2);
  G.addMarks(w, 'fire', 400);
  ok('Mốc: bậc Sắt dừng ở Thành hình', G.wStage(w) === 2 && w.name === null, G.wStage(w));
  w.tier = 1;
  ok('Mốc: bậc Bạc với 300 dấu ấn là Thức tỉnh', G.wStage(w) === 3);
  w.marks.fire = 299;
  ok('Mốc: 299 chưa Thức tỉnh', G.wStage(w) === 2);
  ok('Cơ hội gây hiệu ứng theo mốc 0/20/50/100%', G.PROC.join() === '0,0.2,0.5,1' && G.MARKS.join() === '30,120,300');
  ok('activeEl: vũ khí Mầm trở lên đánh ra hệ của nhánh', G.activeEl(P, w) === 'fire' && G.activeEl(P, P.weapons[1]) === null);
  G.addCoat('ice', 5);
  ok('Bùa hệ phủ đè lên hệ của nhánh', G.activeEl(P, w) === 'ice' && G.activeEl(P, P.weapons[1]) === 'ice');
  sec(5.1);
  ok('Bùa hệ hết giờ thì trở lại hệ của nhánh', G.activeEl(P, w) === 'fire' && G.activeEl(P, P.weapons[1]) === null);

  // ----- lớp thích nghi -----
  const st = (f, p, i, n, r, m, d) => ({ el: { fire: f, poison: p, ice: i, none: n }, ranged: r, melee: m, dodges: d });
  const lay = (s, max) => G.computeLayers(s, max, 0.5).map((l) => l.type + (l.el ? ':' + l.el : '')).join(',');
  ok('Lớp: Lửa 60% thì kháng Lửa', lay(st(60, 20, 10, 10, 50, 50, 0), 2) === 'resist:fire', lay(st(60, 20, 10, 10, 50, 50, 0), 2));
  ok('Lớp: đúng 50% thì chưa kháng', lay(st(50, 50, 0, 0, 50, 50, 0), 2) === '');
  ok('Lớp: không hệ nào quá 50% thì không kháng', lay(st(40, 30, 0, 30, 50, 50, 0), 2) === '');
  ok('Lớp: đánh xa trên 60% thì chống đánh xa', lay(st(0, 0, 0, 100, 61, 39, 0), 2) === 'antiRanged');
  ok('Lớp: cận chiến trên 60% thì chống áp sát', lay(st(0, 0, 0, 100, 39, 61, 0), 2) === 'antiMelee');
  ok('Lớp: đúng 60% thì chưa tính', lay(st(0, 0, 0, 100, 60, 40, 0), 2) === '');
  // GĐ3 (M4, D1): chỉ đếm cú né rỗng (tổng né trừ số lần Né chuẩn), ngưỡng 15 -> 30
  ok('Lớp: né rỗng trên 30 lần thì bắt bài lăn né', lay(st(0, 0, 0, 100, 50, 50, 31), 2) === 'antiDodge' && lay(st(0, 0, 0, 100, 50, 50, 30), 2) === '');
  ok('Lớp: Né chuẩn không tính là né rỗng', lay(Object.assign(st(0, 0, 0, 100, 50, 50, 50), { neChuan: 25 }), 2) === '' && lay(Object.assign(st(0, 0, 0, 100, 50, 50, 50), { neChuan: 19 }), 2) === 'antiDodge');
  ok('Lớp: boss vùng tối đa 2 lớp', lay(st(0, 90, 0, 10, 90, 10, 30), 2) === 'resist:poison,antiRanged');
  ok('Lớp: trùm nhỏ 1 lớp', lay(st(0, 90, 0, 10, 90, 10, 30), 1) === 'resist:poison');
  ok('Lớp: chưa đánh gì thì không có lớp nào', lay(st(0, 0, 0, 0, 0, 0, 0), 2) === '');
  ok('Vòng khắc chế', G.WEAK.fire === 'ice' && G.WEAK.ice === 'poison' && G.WEAK.poison === 'fire');

  // ----- kháng, yếu, chấm sao -----
  function boss(el, i, diff) {
    room('hunter', 0, i == null ? 2 : i, diff);
    if (el) { S.stats.el[el] = 900; S.stats.el.none = 100; }
    G.gotoRoom(S.rooms.length - 1);
    W = G.getWorld(); P = S.P;
    const bb = W.boss; bb.cd = 1e9; bb.invuln = 0; bb.busy = 0; // bỏ qua màn ra mắt của trùm
    return bb;
  }
  b = boss('fire');
  ok('Trùm: kháng hệ dùng nhiều nhất, yếu hệ khắc chế', b.layers.length === 1 && b.layers[0].el === 'fire' && b.weak.join() === 'ice', JSON.stringify(b.layers) + b.weak);
  h0 = b.hp; G.damage(b, 100, { el: 'fire' });
  ok('Kháng: sát thương hệ bị kháng giảm một nửa', near(h0 - b.hp, 50, 0.01), h0 - b.hp);
  h0 = b.hp; G.damage(b, 100, { el: 'ice' });
  ok('Yếu: hệ khắc chế gây thêm 30%', near(h0 - b.hp, 130, 0.01), h0 - b.hp);
  h0 = b.hp; G.damage(b, 100, { el: 'poison' });
  ok('Hệ còn lại và đòn trắng gây đủ 100%', near(h0 - b.hp, 100, 0.01), h0 - b.hp);
  b.exposed = 1; h0 = b.hp; G.damage(b, 100, {});
  ok('Lộ điểm yếu: +50% sát thương', near(h0 - b.hp, 150, 0.01), h0 - b.hp);
  b.exposed = 0;
  for (let k = 0; k < 5; k++) G.applyStatus(b, 'ice', 1);
  ok('Trùm không bị đóng băng mà khựng 0,5 giây', b.st.frozen <= 0 && near(b.st.stun, 0.5, 0.01) && b.st.freezeImm > 0, b.st.stun);
  const endWith = (el, potion) => {
    const bb = boss('fire');
    if (potion) W.usedPotion = true;
    G.damage(bb, 1e12, { el });
    sec(4.5); // trùm chết hoành tráng (cử động chết khoảng 3,4 giây) rồi mới mọc cổng
    return S.result ? S.result.starNote.map((x) => (x ? 1 : 0)).join('') + '/' + S.result.stars : 'chưa xong';
  };
  ok('Sao: hạ trùm bằng hệ khắc chế, không dùng bình thì 3 sao', endWith('ice') === '111/3', endWith('ice'));
  ok('Sao: hạ bằng hệ bị kháng thì mất sao thứ ba', endWith('fire') === '110/2', endWith('fire'));
  ok('Sao: hạ bằng đòn trắng thì mất sao thứ ba', endWith(null) === '110/2', endWith(null));
  ok('Sao: dùng bình máu thì mất sao thứ hai', endWith('ice', true) === '101/2', endWith('ice', true));
  b = boss(null);
  ok('Trùm không kháng hệ nào khi người chơi không dùng hệ', b.weak.length === 0 && !b.layers.some((l) => l.type === 'resist'));
  // boss vùng đầu tiên chỉ kháng 30% và 1 lớp; vùng sau 2 lớp, 50%
  b = boss('poison', 4);
  S.stats.melee = 0;
  ok('Mộc Tinh lần đầu: 1 lớp, kháng 30%', b.layers.length === 1 && b.layers[0].pct === 0.3, JSON.stringify(b.layers));
  h0 = b.hp; G.damage(b, 100, { el: 'poison' });
  ok('Kháng 30% đúng số', near(h0 - b.hp, 70, 0.01), h0 - b.hp);
  // độ khó 2: thêm lớp vết sẹo
  G.testSave({ hero: 'hunter' }); G.save.scars.moc = 'ice';
  G.startStage(0, 4, 1); S = G.getRun(); G.getWorld().waves = [];
  S.stats.el.fire = 900; S.stats.el.none = 100; S.stats.ranged = 900; S.stats.melee = 100;
  G.gotoRoom(S.rooms.length - 1); b = G.getWorld().boss;
  const res = b.layers.filter((l) => l.type === 'resist').map((l) => l.el + (l.scar ? '*' : '')).join();
  ok('Độ khó 2: thêm lớp vết sẹo kháng hệ đã kết liễu lần trước', res === 'fire,ice*' && b.layers.length === 3, res);
  ok('Độ khó 2: hệ yếu không trùng hệ đang kháng', b.weak.join() === 'poison', b.weak.join());

  // ----- hiệu ứng lên người chơi -----
  room('hunter'); P.inv = 0;
  G.hurtPlayer(10, 'fire', null, false);
  ok('Người chơi: dính cháy 3 giây', near(P.st.fire, 3, 0.01));
  sec(3.1); ok('Người chơi: hết cháy', P.st.fire <= 0);
  P.inv = 0; P.hp = 2; G.hurtPlayer(1, 'poison', null, false); sec(4.5);
  ok('Người chơi: độc không tự kết liễu (dừng ở 1 máu)', P.hp >= 1 && !P.dead, P.hp);
  P.inv = 0; G.hurtPlayer(5, 'ice', null, false);
  ok('Người chơi: dính chậm 2,5 giây', near(P.st.ice, 2.5, 0.01));
  G.testSave({ hero: 'hunter', helm: 'h_ngu' }); G.startStage(1, 0, 0); P = G.getRun().P; P.inv = 0;
  G.hurtPlayer(5, 'ice', null, false);
  ok('Mũ vây cá: giảm 40% thời gian bị chậm', near(P.st.ice, 1.5, 0.01), P.st.ice);
  G.setScene(G.Village);
  return out;
}
"""

def main():
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + __import__('os').path.dirname(__import__('os').path.dirname(__import__('os').path.abspath(__file__))) + '/index.html')
        pg.wait_for_timeout(1500)
        pg.add_script_tag(path='tests/setup.js')
        res = pg.evaluate(JS)
        b.close()
    bad = 0
    for name, good, detail in res:
        if not good:
            bad += 1
        if not good or '-v' in sys.argv:
            print(('ĐẠT ' if good else 'SAI ') + name + (('  -> ' + detail) if detail else ''))
    print(f'{len(res) - bad}/{len(res)} luật đạt' + (', lỗi trang: ' + '; '.join(errs[:3]) if errs else ''))
    sys.exit(1 if bad or errs else 0)

main()
