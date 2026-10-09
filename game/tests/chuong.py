"""Kiểm tra CHƯỞNG (js/chuong.js): nút Chưởng thay kỹ năng riêng của em bé, ba cây chưởng, điểm chưởng theo cấp.
Phần 1 (luật, chạy ngay trong trang thật): bấm Chưởng bắn đúng 8 hướng và trúng quái; tốn mana; hồi chiêu; mỗi cây có hiệu ứng đúng
(Hỏa: cháy, nổ lan, vệt cháy, tích lực, tàn lửa; Độc: độc, mây độc, lây độc, ăn mòn, tách 3 luồng, mây hút; Băng: chậm, xuyên nhiều quái,
đóng băng, băng vỡ, tầm xa, vòng băng); nét riêng của 4 em bé; chưởng không cho dấu ấn linh khí và không kết hợp hệ với vũ khí;
học điểm, đổi cây trả điểm; điểm theo cấp; bản lưu cũ được bù điểm; Sức mạnh có phần chưởng.
Phần 2 (giao diện, Playwright chạm thật qua tests/ui_lib.py): khung ngang và khung dọc (bị xoay): chạm nút Chưởng trong ải, thẻ Cây chưởng
ở Cụ Đồ (học bằng chạm, đổi cây), Hành trang thẻ Kỹ năng (ở làng học được, trong ải chỉ xem), không chữ tràn khung.
Chạy: python3 tests/chuong.py [-v] [--luat | --ui]   (thoát mã 1 nếu có mục sai)"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ui_lib import Game, Checker, sync_playwright, ROOT

LUAT = r"""
() => {
  const out = [];
  const ok = (name, cond, detail) => out.push([name, !!cond, detail === undefined ? '' : String(detail)]);
  let W, P, S, inp = {};
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, inp);
  const PRESS = ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP'];
  const run = (n, i) => { if (i) inp = i; for (let k = 0; k < n; k++) { G.sim(1); for (const q of PRESS) delete inp[q]; } };
  const sec = (s, i) => run(Math.round(s * 60), i);
  const K = G.ZK || 0.85, CH = G.chuong, C = G.CHUONG;
  // cay: cây chưởng; n: { nút: bậc }; hero
  function room(o) {
    o = o || {};
    G.testSave({ hero: o.hero || 'smith', lvl: o.lvl || 30, tier: 1 });
    const hs = G.save.heroes[o.hero || 'smith'];
    CH.use(hs, o.cay || 'hoa', o.hero || 'smith'); hs.ch.cay = o.cay || 'hoa'; hs.ch.n = Object.assign({}, o.n || {});
    G.startStage(0, 2, 0, { kind: 'A', seed: 3 });
    S = G.getRun(); W = G.getWorld(); P = S.P;
    if (o.big) { G.gotoRoom(S.map.boss); W = G.getWorld(); if (W.boss) { W.boss.dead = true; W.boss = null; W.px1 = null; W.shrink = null; } }
    W.waves = []; W.spawns = []; W.props = []; W.banner = null;
    for (const e of W.ents) e.dead = true; W.ents = [];
    inp = {}; run(4);
    P.x = W.geo.cx; P.y = (W.y0 + W.y1) / 2; P.face = 1; P.inv = 99; P.mana = P.maxmana; P.ldx = null; P.ldy = null; P.cdT = 0; P.skillCd = 0;
    W.zones = []; W.chs = []; W.chZones = [];
    return W;
  }
  function dummy(a, r, o) {
    o = o || {};
    const x = P.x + Math.cos(a * Math.PI / 180) * r, y = P.y + Math.sin(a * Math.PI / 180) * r * K;
    const e = G.spawnEnemy(o.role || 'rusher', x, y, { hpMult: o.hp || 1e6, noArt: true });
    e.st.stun = 1e9; e.inside = true; e.speed = 0;
    return e;
  }
  const lost = (e) => e.maxhp - e.hp;
  const fire = (s) => { P.mana = P.maxmana; P.skillCd = 0; run(1, { skillP: true }); sec(s == null ? 1 : s, {}); };

  // ---------- 1. tám hướng, tốn mana, hồi chiêu, không trúng quái hướng ngược lại ----------
  for (const cay of ['hoa', 'doc', 'bang']) {
    let good = 0, bad = [];
    for (let a = 0; a < 360; a += 45) {
      room({ cay });
      const e = dummy(a, 70), back = dummy(a + 180, 110);
      fire(0.9);
      if (lost(e) > 0 && lost(back) === 0) good++; else bad.push(a + '° (' + Math.round(lost(e)) + '/' + Math.round(lost(back)) + ')');
    }
    ok(C.trees[cay].name + ': bắn đúng 8 hướng, trúng quái đúng hướng, không trúng quái phía ngược lại', good === 8, good + '/8 ' + bad.join(' '));
  }
  room({ cay: 'hoa' });
  const m0 = P.maxmana; P.mana = m0; P.skillCd = 0; run(1, { skillP: true });
  ok('bấm Chưởng tốn ' + C.cost + ' mana và có thời gian hồi', P.mana === m0 - C.cost && P.skillCd > 0.5 && W.chs.length === 1, 'mana ' + m0 + ' -> ' + P.mana + ', hồi ' + P.skillCd.toFixed(2));
  run(1, { skillP: true });
  ok('đang hồi thì bấm không bắn', W.chs.length <= 1 && P.mana === m0 - C.cost, W.chs.length);
  sec(1.2, {}); P.mana = 10; run(1, { skillP: true });
  ok('thiếu mana thì không bắn', P.mana === 10 && !(W.chs || []).length);
  room({ cay: 'hoa' }); inp = { mx: 0, my: -1 }; run(3); P.mana = P.maxmana; run(1, { skillP: true, mx: 0, my: -1 });
  const q0 = W.chs[0];
  ok('không có quái thì bắn theo hướng đang kéo cần (lên)', q0 && q0.uy < -0.9, q0 && q0.ux.toFixed(2) + ',' + q0.uy.toFixed(2));

  // ---------- 2. Hỏa chưởng ----------
  room({ cay: 'hoa' });
  let e = dummy(0, 60), e2 = dummy(0, 72), far = dummy(90, 100);
  e2.y = e.y + 12; fire(0.6);
  ok('Hỏa chưởng: trúng thì gây cháy (của chưởng)', e.st.fire > 0 && e.st.ch.fire, e.st.fire.toFixed(2));
  ok('Hỏa chưởng: nổ lan trúng quái đứng gần, không trúng quái ở xa', lost(e2) > 0 && e2.st.fire > 0 && lost(far) === 0, Math.round(lost(e2)) + ' / ' + Math.round(lost(far)));
  const hit1 = lost(e);
  room({ cay: 'hoa', n: { luc: 5, no: 5 } });
  e = dummy(0, 60); fire(0.6);
  ok('Hỏa lực 5 bậc: chưởng mạnh hơn 50%', Math.abs(lost(e) / hit1 - 1.5) < 0.12, (lost(e) / hit1).toFixed(2));
  ok('Nổ to: vùng nổ rộng hơn', P.ch.blastR === 38, P.ch.blastR);
  room({ cay: 'hoa', n: { luc: 5, vet: 3 } });
  dummy(0, 120); P.mana = P.maxmana; run(1, { skillP: true }); sec(0.35, {});
  ok('Vệt cháy: cầu lửa để lại vệt cháy dọc đường bay', W.chZones.filter((z) => z.kind === 'vet').length >= 3, W.chZones.length);
  room({ cay: 'hoa', n: { dai: 5, luc: 5 } }); e = dummy(0, 60); fire(0.3);
  ok('Lửa dai: cháy kéo dài hơn (3 giây x 2)', e.st.fire > 4.5, e.st.fire.toFixed(2));
  room({ cay: 'hoa', n: { luc: 5, no: 5, tich: 5 } });
  e = dummy(0, 60); P.mana = P.maxmana; run(1, { skillP: true, skill: true }); sec(1.2, { skill: true });
  const held = W.chs.length === 0 && P.chHold && G.chuong.chargeOf(P) >= 1;
  run(1, {}); sec(0.6, {});
  const big = lost(e);
  room({ cay: 'hoa', n: { luc: 5, no: 5, tich: 5 } }); e = dummy(0, 60); fire(0.6);
  ok('Tích lực: giữ nút thì tích (chưa bắn), thả ra cầu lửa lớn mạnh hơn hẳn', held && big > lost(e) * 2.2, (big / lost(e)).toFixed(2));
  room({ cay: 'hoa', n: { luc: 5, no: 5, vet: 5, dai: 3, tan: 3 } });
  e = dummy(0, 60); const o1 = dummy(-40, 70), o2 = dummy(40, 70); fire(1);
  ok('Mưa tàn lửa: nổ xong tàn lửa văng trúng quái quanh đó', lost(o1) > 0 && lost(o2) > 0 && o1.st.fire > 0, Math.round(lost(o1)) + ',' + Math.round(lost(o2)));

  // ---------- 3. Độc chưởng ----------
  room({ cay: 'doc' }); e = dummy(0, 60); fire(0.5);
  ok('Độc chưởng: trúng thì gây 2 tầng độc', e.st.poisonN >= 2 && e.st.ch.poison, e.st.poisonN);
  ok('Độc chưởng: để lại đám mây độc', W.chZones.some((z) => z.kind === 'may'), W.chZones.length);
  e2 = dummy(10, 66); e2.y = e.y + 8; sec(1.2, {});
  ok('Mây độc: quái đứng trong mây bị thêm độc', e2.st.poisonN > 0 && lost(e2) > 0, e2.st.poisonN);
  room({ cay: 'doc', n: { luc: 5, may: 5 } }); fire(0.4); const z5 = W.chZones[0];
  ok('Mây dày: mây to hơn, lâu hơn', z5 && z5.r === 35 && z5.life0 === 4.5, z5 && z5.r + ' ' + z5.life0);
  room({ cay: 'doc', n: { luc: 5, lay: 5 } });
  e = dummy(0, 60, { hp: 0.05 }); const nb = dummy(0, 85); e.hp = e.maxhp = 50; e.st.stun = 9;
  withEnemy: {
    G.chSrc = true; G.applyStatus(e, 'poison', 10, 3); G.chSrc = false;
    G.damage(e, 999, {}); sec(0.1, {});
    ok('Lây độc: quái dính độc chưởng chết thì độc lây sang quái gần', nb.st.poisonN >= 2 && nb.st.ch.poison, nb.st.poisonN);
  }
  room({ cay: 'doc', n: { luc: 5, mon: 5 } }); e = dummy(0, 60, { role: 'shield' }); e.armor = 0.45;
  const d0 = G.damage(e, 100, {}); G.chSrc = true; G.applyStatus(e, 'poison', 10, 1); G.chSrc = false; e.st.chCorr = 5;
  const d1 = G.damage(e, 100, {});
  ok('Ăn mòn: quái dính độc chưởng mất giáp, nhận thêm sát thương', d1 > d0 * 1.6, Math.round(d0) + ' -> ' + Math.round(d1));
  room({ cay: 'doc', n: { luc: 5, may: 5, tach: 1 } }); dummy(0, 60); P.mana = P.maxmana; run(1, { skillP: true });
  ok('Tam xà: chưởng tách thành 3 luồng', W.chs.length === 3, W.chs.length);
  room({ cay: 'doc', n: { luc: 5, may: 5, lay: 5, mon: 3, hut: 3 } }); e = dummy(0, 60); fire(0.3);
  const side = dummy(0, 60); side.y = e.y + 14; side.st.stun = 0; side.speed = 0; const y0 = side.y; sec(1, {});
  ok('Vạn độc: mây độc hút quái vào giữa', Math.abs(side.y - e.y) < Math.abs(y0 - e.y) - 2, y0.toFixed(1) + ' -> ' + side.y.toFixed(1));

  // ---------- 4. Băng chưởng ----------
  room({ cay: 'bang', hero: 'hunter' }); // (Thợ Săn: chưởng không đẩy lùi mạnh, hàng quái giữ nguyên chỗ)
  const row = [dummy(0, 25), dummy(0, 45), dummy(0, 65), dummy(0, 85)]; fire(0.8);
  ok('Băng chưởng: xuyên 3 quái (con thứ tư không trúng)', lost(row[0]) > 0 && lost(row[1]) > 0 && lost(row[2]) > 0 && lost(row[3]) === 0, row.map((x) => Math.round(lost(x))).join(','));
  ok('Băng chưởng: làm chậm (tầng Băng của chưởng)', row[0].st.iceN >= 2 && row[0].st.ch.ice, row[0].st.iceN);
  room({ cay: 'bang', hero: 'hunter', n: { luc: 5, xa: 0, xuyen: 2 } });
  const row2 = [dummy(0, 25), dummy(0, 45), dummy(0, 65), dummy(0, 85)]; fire(0.8);
  ok('Xuyên băng: xuyên thêm quái', row2.every((x) => lost(x) > 0), row2.map((x) => Math.round(lost(x))).join(','));
  room({ cay: 'bang', n: { luc: 5, xuyen: 0, dong: 5 } }); e = dummy(0, 60); e.st.freezeImm = 0; fire(0.5); P.skillCd = 0; fire(0.5);
  ok('Đóng băng: trúng 2 lần là đóng băng', e.st.frozen > 0 || e.st.freezeImm > 0, e.st.frozen.toFixed(2));
  room({ cay: 'bang', n: { luc: 5, xa: 0, dong: 5, vo: 5 } });
  e = dummy(0, 60); e.hp = e.maxhp = 30; const ring = [dummy(-60, 110), dummy(60, 110), dummy(0, 160)];
  G.chSrc = true; e.st.frozen = 2; e.st.ch.ice = true; G.chSrc = false;
  G.damage(e, 999, {}); sec(0.5, {});
  ok('Băng vỡ: quái đóng băng (bởi chưởng) chết thì bắn mảnh băng trúng quái quanh đó', ring.filter((x) => lost(x) > 0).length >= 1, ring.map((x) => Math.round(lost(x))).join(','));
  room({ cay: 'bang' }); fire(0.05); const L0 = W.chs[0] ? W.chs[0].left : 0;
  room({ cay: 'bang', n: { luc: 5, xa: 5 } }); fire(0.05); const L1 = W.chs[0] ? W.chs[0].left : 0;
  ok('Tầm xa: bay xa hơn', L1 > L0 * 1.4, Math.round(L0) + ' -> ' + Math.round(L1));
  room({ cay: 'bang', n: { luc: 5, xa: 5, xuyen: 5, dong: 3, phong: 3 } });
  e = dummy(0, W.x1 - P.x - 12); const lat = G.spawnEnemy('rusher', e.x + 6, e.y + 24 * K, { hpMult: 1e6, noArt: true }); lat.st.stun = 1e9; lat.inside = true;
  fire(1.2);
  ok('Băng phong: mũi băng to hơn, cuối đường bay nổ vòng băng trúng quái cạnh đó', lost(e) > 0 && lost(lat) > 0 && lat.st.iceN > 0, Math.round(lost(e)) + ' / ' + Math.round(lost(lat)));

  // ---------- 5. nét riêng của từng em bé ----------
  room({ cay: 'hoa', hero: 'smith' }); e = dummy(0, 60); e.st.stun = 0; const x0 = e.x; fire(0.4);
  ok('Thợ Rèn: chưởng đẩy lùi quái mạnh', e.x - x0 > 12, (e.x - x0).toFixed(1));
  room({ cay: 'hoa', hero: 'healer' }); P.hp = P.maxhp * 0.5; const hp0 = P.hp; dummy(0, 60); fire(0.4);
  ok('Thầy Lang: chưởng trúng thì hồi máu', P.hp > hp0 + P.maxhp * 0.01, Math.round(hp0) + ' -> ' + Math.round(P.hp));
  room({ cay: 'bang', hero: 'hunter' }); fire(0.02); const Lh = W.chs[0].left, vh = W.chs[0].v;
  room({ cay: 'bang', hero: 'smith' }); fire(0.02); const Ls = W.chs[0].left, vs = W.chs[0].v;
  ok('Thợ Săn: chưởng bay xa hơn, nhanh hơn', Lh > Ls * 1.2 && vh > vs * 1.2, Math.round(Ls) + '/' + Math.round(Lh));
  room({ cay: 'bang', hero: 'wrestler' }); fire(0.02); const Lw = W.chs[0].left, hw = W.chs[0].half;
  ok('Đô Vật: chưởng tầm gần mà to', Lw < Ls * 0.7 && hw > W.chs[0].ch.half / 1.5 * 1.4, Math.round(Lw) + ' ' + hw);

  // ---------- 6. không cho linh khí, không kết hợp hệ với vũ khí ----------
  room({ cay: 'hoa' }); const w = G.curW(P), mk = JSON.stringify(w.marks);
  e = dummy(0, 60, { hp: 0.001 }); e.hp = 1; fire(0.6);
  ok('quái thường bị chưởng kết liễu: vũ khí không nhận dấu ấn', e.dead && JSON.stringify(w.marks) === mk, JSON.stringify(w.marks));
  e = dummy(0, 60); e.st.stun = 9; fire(0.3); e.hp = 1; G.damage(e, 5, { src: 'hit', w, el: null });
  ok('quái đang cháy vì chưởng bị vũ khí kết liễu: vũ khí không nhận dấu ấn Lửa', e.dead && w.marks.fire === 0, JSON.stringify(w.marks));
  room({ cay: 'hoa' }); e = dummy(0, 60); G.applyStatus(e, 'poison', 10, 2); fire(0.5);
  ok('chưởng Lửa lên quái dính Độc của vũ khí: không có Nổ khói', e.st.poisonN === 2 && e.st.fire > 0, 'độc ' + e.st.poisonN + ' cháy ' + e.st.fire.toFixed(1));
  room({ cay: 'bang' }); e = dummy(0, 60); fire(0.5); const icy = e.st.iceN; G.applyStatus(e, 'fire', 10, 1);
  ok('vũ khí Lửa lên quái dính Băng của chưởng: không có Sốc nhiệt', e.st.fire > 0 && e.st.iceN === icy, 'băng ' + e.st.iceN + ' cháy ' + e.st.fire.toFixed(1));
  room({ cay: 'hoa' }); e = dummy(0, 60, { role: 'elite' }); e.hp = 1; const mkE = G.curW(P).marks.poison; fire(0.6);
  ok('tinh anh gục vì chưởng: vẫn nhận phần thưởng linh khí của tinh anh (hệ của vùng)', e.dead && G.curW(P).marks.poison > mkE, mkE + ' -> ' + G.curW(P).marks.poison);

  // ---------- 7. điểm, học, đổi cây, bản lưu cũ, Sức mạnh ----------
  G.resetSave(); const sv = G.save, hs = sv.heroes.smith;
  ok('bản lưu mới: cấp 1 có 1 điểm chưởng, cây mặc định Hỏa chưởng', CH.pts(hs, 'smith').left === 1 && hs.ch.cay === 'hoa');
  hs.lvl = 12;
  ok('mỗi cấp +1 điểm chưởng (cấp 12: 12 điểm), tách riêng điểm kỹ năng (4)', CH.pts(hs, 'smith').left === 12 && Math.floor(hs.lvl / 3) === 4);
  ok('nút cần dồn điểm mới mở', CH.why(hs, 'tich', 'smith') !== '' && !CH.learn(hs, 'tich', 'smith'));
  for (let i = 0; i < 5; i++) CH.learn(hs, 'luc', 'smith');
  ok('học nút: bậc tăng, điểm giảm, không quá bậc tối đa', hs.ch.n.luc === 5 && !CH.learn(hs, 'luc', 'smith') && CH.pts(hs, 'smith').left === 7);
  for (let i = 0; i < 5; i++) CH.learn(hs, 'no', 'smith');
  ok('dồn 10 điểm thì mở nút Tích lực', CH.learn(hs, 'tich', 'smith') && hs.ch.n.tich === 1);
  const pw1 = G.power(); CH.use(hs, 'bang', 'smith');
  ok('đổi cây: miễn phí, trả lại hết điểm', hs.ch.cay === 'bang' && CH.pts(hs, 'smith').left === 12 && sv.gold === 0 && G.power() < pw1, CH.pts(hs, 'smith').left + ' điểm, sức mạnh ' + pw1 + ' -> ' + G.power());
  hs.lvl = 40;
  ok('đầy một cây cần ' + CH.fullPts('hoa') + '/' + CH.fullPts('doc') + '/' + CH.fullPts('bang') + ' điểm (25-30), cấp 40 có 40 điểm', ['hoa', 'doc', 'bang'].every((k) => CH.fullPts(k) >= 25 && CH.fullPts(k) <= 30));
  const old = JSON.parse(JSON.stringify(sv)); old.heroes.smith.lvl = 17; delete old.heroes.smith.ch; delete old.heroes.hunter.ch; old.heroes.hunter.lvl = 9; old.heroes.hunter.unlocked = true;
  const fx = G.fixSave(old);
  ok('bản lưu cũ (chưa có chưởng): nhận cây mặc định, bù đủ điểm theo cấp (17 và 9)', fx.heroes.smith.ch.cay === 'hoa' && CH.pts(fx.heroes.smith, 'smith').left === 17 && fx.heroes.hunter.ch.cay === 'bang' && CH.pts(fx.heroes.hunter, 'hunter').left === 9);
  const bad = JSON.parse(JSON.stringify(sv)); bad.heroes.smith.lvl = 3; bad.heroes.smith.ch = { cay: 'xyz', n: { luc: 9, la: 3 } };
  const fb = G.fixSave(bad);
  ok('bản lưu hỏng: cây lạ thành mặc định, điểm quá cấp thì trả lại', C.trees[fb.heroes.smith.ch.cay] && CH.pts(fb.heroes.smith, 'smith').spent <= 3, JSON.stringify(fb.heroes.smith.ch));
  G.resetSave(); const s2 = G.save, h2 = s2.heroes.smith; h2.lvl = 30; const pa = G.power();
  for (let i = 0; i < 28; i++) for (const nd of C.trees.hoa.nodes) if (CH.learn(h2, nd.id, 'smith')) break;
  const pb = G.power();
  ok('Sức mạnh tính thêm phần chưởng (học đầy cây: thêm khoảng 5%)', pb > pa && pb < pa * 1.09, pa + ' -> ' + pb);
  ok('hero nào cũng có nút Chưởng thay kỹ năng cũ', G.HKEYS.every((k) => G.HEROES[k].skill === 'Chưởng' && C.hero[k] && C.hero[k].note));
  G.resetSave();
  return out;
}
"""


def luat(p, verbose):
    c = Checker('chưởng: luật')
    g = Game(p, 'desk')
    g.pg.add_script_tag(path=ROOT + '/tests/bot.js')
    g.pg.add_script_tag(path=ROOT + '/tests/setup.js')
    for name, good, detail in g.ev(LUAT):
        if verbose or not good:
            print(('  đạt ' if good else '  ') + name + (' — ' + detail if detail else ''))
        c.ok(good, name + (' — ' + detail if detail else ''))
    ok = c.done(g)
    g.close()
    return ok


def main():
    verbose = '-v' in sys.argv
    good = True
    with sync_playwright() as p:
        if '--ui' not in sys.argv:
            good = luat(p, verbose) and good
        if '--luat' not in sys.argv:
            import chuong_ui
            good = chuong_ui.run(p, verbose) and good
    sys.exit(0 if good else 1)


if __name__ == '__main__':
    main()
