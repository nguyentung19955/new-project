"""Kiểm tra các luật thêm ở đợt ghép 1: nâng cấp bản lưu cũ, bốn bậc màu, trùm vùng rơi Vàng,
đặc trưng hệ mở theo cấp, né theo hướng di chuyển gần nhất, hình hero và vũ khí sống.
Chạy: python3 tests/ghep.py   (thêm -v để in cả mục đạt; thoát mã 1 nếu có mục sai)"""
import os, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS = r"""
() => {
  const out = [];
  const ok = (name, cond, detail) => out.push([name, !!cond, detail === undefined ? '' : String(detail)]);
  const near = (a, b, tol) => Math.abs(a - b) <= (tol == null ? 1e-9 : tol);
  let inp = {};
  G.botInput = () => Object.assign({ mx: 0, my: 0 }, inp);
  const step = (n, i) => { for (let k = 0; k < n; k++) { inp = Object.assign({}, i || {}); if (k > 0) for (const q of ['atkP', 'dodgeP', 'specialP', 'skillP', 'swapP']) delete inp[q]; G.sim(1); } inp = {}; };
  const sec = (s, i) => step(Math.round(s * 60), i);
  let W, P, S;
  function room(o) {
    G.testSave(Object.assign({ hero: 'hunter', lvl: 10 }, o || {}));
    G.startStage(0, 2, 0);
    S = G.getRun(); W = G.getWorld(); P = S.P;
    W.waves = []; W.props = []; W.banner = null;
    step(6);
    P.x = 200; P.y = 190; P.face = 1; P.inv = 0; P.mana = P.maxmana;
    return P.weapons[0];
  }
  function dummy(x, y, hp) {
    const e = G.spawnEnemy('rusher', x, y == null ? 190 : y, { hpMult: hp || 1e6 });
    e.st.stun = 1e9; e.inside = true;
    return e;
  }
  const lost = (e) => e.maxhp - e.hp;
  const heZones = () => W.zones.filter((z) => z.he).length;

  // ================= 1. NÂNG CẤP BẢN LƯU CŨ =================
  const old = {
    v: 1, gold: 500, hero: 'smith', nextId: 24, carry: [1, 2],
    heroes: { smith: { unlocked: true, lvl: 9, xp: 3, sk: { atk: 1, def: 1, elem: 1 } } },
    stars: { '0-0': 3, '0-4': 2 },
    weapons: [
      { id: 1, type: 'sword', tier: 0, marks: { fire: 130, poison: 0, ice: 0 }, branch: 'fire', sharpen: 2, name: null, kills: 40, bossKills: {}, affix: null },
      { id: 2, type: 'bow', tier: 1, marks: { fire: 0, poison: 0, ice: 310 }, branch: 'ice', sharpen: 0, name: 'Cung Tuyết Trắng, kẻ hạ Mộc Tinh', kills: 300, bossKills: { 'Mộc Tinh': 2 }, affix: null },
      { id: 13, type: 'spear', tier: 2, marks: { fire: 0, poison: 5, ice: 0 }, branch: null, sharpen: 4, name: null, kills: 0, bossKills: {}, affix: 'crit' },
      { id: 23, type: 'hammer', tier: 2, marks: { fire: 0, poison: 0, ice: 0 }, branch: null, sharpen: 0, name: null, kills: 0, bossKills: {}, affix: 'reach' },
    ],
  };
  const fixed = G.fixSave(JSON.parse(JSON.stringify(old)));
  const fw = (id) => fixed.weapons.find((w) => w.id === id);
  ok('Bản lưu cũ: giữ đủ 4 vũ khí, vàng, cấp hero, sao', fixed.weapons.length === 4 && fixed.gold === 500 && fixed.heroes.smith.lvl === 9 && fixed.stars['0-4'] === 2, fixed.weapons.length);
  ok('Bản lưu cũ: Sắt thành Thường, Bạc thành Lam, Linh thành Tím', fw(1).rarity === 0 && fw(2).rarity === 1 && fw(13).rarity === 2 && fw(23).rarity === 2, fixed.weapons.map((w) => w.rarity).join());
  ok('Bản lưu cũ: tên bậc đúng', G.RARITY[fw(1).rarity].name === 'Thường' && G.RARITY[fw(2).rarity].name === 'Lam' && G.RARITY[fw(13).rarity].name === 'Tím');
  ok('Bản lưu cũ: dòng gán theo quy tắc cố định (số thứ tự chia 10 lấy dư)', fw(1).family === 1 && fw(2).family === 2 && fw(13).family === 3 && fw(23).family === 3, fixed.weapons.map((w) => w.family).join());
  ok('Bản lưu cũ: dấu ấn, nhánh, cấp mài, số mạng được giữ nguyên', fw(1).marks.fire === 130 && fw(1).branch === 'fire' && fw(1).sharpen === 2 && fw(2).marks.ice === 310 && fw(2).kills === 300 && fw(13).sharpen === 4);
  ok('Bản lưu cũ: mốc tiến hóa không đổi (Thường 130 là Thành hình, Lam 310 là Thức tỉnh)', G.wStage(fw(1)) === 2 && G.wStage(fw(2)) === 3, G.wStage(fw(1)) + '/' + G.wStage(fw(2)));
  ok('Bản lưu cũ: dòng phụ cũ được giữ, Tím được bù cho đủ 2 dòng khác nhau', fw(13).affixes.length === 2 && fw(13).affixes[0] === 'crit' && fw(13).affixes[1] !== 'crit' && fw(23).affixes[0] === 'reach' && fw(23).affixes.length === 2, JSON.stringify(fw(13).affixes) + JSON.stringify(fw(23).affixes));
  ok('Bản lưu cũ: Thường không có dòng phụ, Lam có đúng 1', fw(1).affixes.length === 0 && fw(2).affixes.length === 1, fw(2).affixes.join());
  ok('Bản lưu cũ: không món nào có dòng mạnh (chưa có Vàng)', fixed.weapons.every((w) => w.power === null && w.gold === 0));
  ok('Bản lưu cũ: danh hiệu cũ được giữ, tên lấy theo hình', fw(2).title === ', kẻ hạ Mộc Tinh' && fw(2).name === null && G.wName(fw(2)).endsWith(', kẻ hạ Mộc Tinh'), G.wName(fw(2)));
  const again = G.fixSave(JSON.parse(JSON.stringify(fixed)));
  ok('Bản lưu cũ: nạp lại lần nữa không đổi gì (nâng cấp êm)', JSON.stringify(again) === JSON.stringify(fixed));
  const twice = G.fixSave(JSON.parse(JSON.stringify(old)));
  ok('Bản lưu cũ: nâng cấp hai lần ra cùng một kết quả', JSON.stringify(twice) === JSON.stringify(fixed));
  ok('Bản lưu: ghi rarity và family, không ghi tier; mã cũ đọc w.tier vẫn ra bậc', JSON.stringify(fixed).indexOf('"tier"') < 0 && JSON.stringify(fixed).indexOf('"rarity"') > 0 && fw(13).tier === 2);
  const bad = G.fixSave({ v: 1, weapons: [{ id: 5, type: 'sword', rarity: 9, family: 77, gold: 5, affixes: ['crit', 'crit', 'x'], power: 'x' }] });
  ok('Bản lưu hỏng: bậc, dòng, dòng phụ sai được sửa về giá trị hợp lệ', bad.weapons[0].rarity === 3 && bad.weapons[0].family === 5 && bad.weapons[0].gold === 2 && bad.weapons[0].affixes.length === 2 && !!G.POWER[bad.weapons[0].power], JSON.stringify(bad.weapons[0]));
  const fresh = G.newSave();
  ok('Bản lưu mới: kiếm và cung khởi đầu bậc Thường, có dòng', fresh.weapons.length === 2 && fresh.weapons.every((w) => w.rarity === 0 && w.family >= 0 && w.family <= 9 && w.affixes.length === 0));

  // ================= 2. BỐN BẬC =================
  ok('Bậc: bốn bậc Thường, Lam, Tím, Vàng', G.RARITY.map((r) => r.name).join() === 'Thường,Lam,Tím,Vàng');
  ok('Bậc: hệ số sát thương 1 / 1,15 / 1,3 / 1,5', G.RARITY.map((r) => r.mult).join() === '1,1.15,1.3,1.5');
  ok('Bậc: Thường tiến hóa tối đa Thành hình, ba bậc kia tới Thức tỉnh', G.RARITY.map((r) => r.maxStage).join() === '2,3,3,3');
  G.testSave({});
  const sv = G.save;
  const mk = (r, o) => G.newWeapon(sv, 'sword', r, o);
  const ws = [mk(0), mk(1), mk(2), mk(3, { gold: 0 }), mk(3, { gold: 1 }), mk(3, { gold: 2 })];
  ok('Bậc: sát thương gốc kiếm 10 / 11,5 / 13 / 15', ws.slice(0, 4).map((w) => G.wBase(w, 1).toFixed(2)).join() === '10.00,11.50,13.00,15.00', ws.slice(0, 4).map((w) => G.wBase(w, 1).toFixed(2)).join());
  ok('Bậc: Vàng vùng 1, 2, 3 có hệ số 1,5 / 1,6 / 1,7', ws.slice(3).map((w) => G.wBase(w, 1).toFixed(2)).join() === '15.00,16.00,17.00', ws.slice(3).map((w) => G.wBase(w, 1).toFixed(2)).join());
  ok('Bậc: số dòng phụ 0 / 1 / 2 / 2', ws.slice(0, 4).map((w) => w.affixes.length).join() === '0,1,2,2', ws.slice(0, 4).map((w) => w.affixes.length).join());
  ok('Bậc: dòng phụ là affix sẵn có và không trùng nhau', ws.every((w) => w.affixes.every((k, i, a) => G.AFFIX[k] && a.indexOf(k) === i)));
  ok('Bậc: chỉ Vàng có dòng mạnh riêng', ws.slice(0, 3).every((w) => w.power === null) && ws.slice(3).every((w) => !!G.POWER[w.power]));
  for (const w of ws) { w.marks.fire = 999; w.branch = 'fire'; }
  ok('Bậc: 999 dấu ấn thì Thường dừng ở Thành hình, còn lại Thức tỉnh', ws.slice(0, 4).map((w) => G.wStage(w)).join() === '2,3,3,3', ws.slice(0, 4).map((w) => G.wStage(w)).join());
  const w0 = ws[0];
  w0.rarity = 1; G.fitAffixes(w0);
  ok('Nâng bậc: Thường lên Lam không mất dấu ấn, lên được Thức tỉnh, có 1 dòng phụ', w0.marks.fire === 999 && w0.branch === 'fire' && G.wStage(w0) === 3 && w0.affixes.length === 1);
  const keep = w0.affixes[0];
  w0.rarity = 2; G.fitAffixes(w0); w0.rarity = 3; w0.gold = 2; G.fitAffixes(w0);
  ok('Nâng bậc: lên Tím rồi Vàng giữ dòng phụ cũ, thêm dòng mới và dòng mạnh', w0.affixes[0] === keep && w0.affixes.length === 2 && !!G.POWER[w0.power] && near(G.wRarMult(w0), 1.7));
  ok('Nâng bậc: chi phí Lam và Tím không cần mảnh trùm; lên Vàng cần mảnh trùm của vùng', !G.TIER_UP[1].shard && !G.TIER_UP[2].shard && [0, 1, 2].every((r) => G.goldCost(r).shard[r] > 0 && G.goldCost(r).shard.filter((n) => n > 0).length === 1));
  ok('Tên: lấy từ hình vũ khí sống theo dòng, nhánh, mốc', G.wName(ws[1]) === G.weaponArt.name(G.weaponArt.fromWeapon(ws[1])) && G.wName(ws[1]).length > 3, G.wName(ws[1]));
  // dòng phụ và dòng mạnh có tác dụng thật
  let w = room({ melee: 'sword', tier: 2, affixes: ['reach', 'mana'] });
  let e = dummy(200 + 32 + 8 + 3); // ngoài tầm 32 của nhát đầu một chút, trong tầm khi xa hơn 15%
  const m0 = P.mana = 10;
  step(2, { atk: true, atkP: true }); sec(0.5);
  ok('Dòng phụ: tầm xa hơn 15% với tới quái ngoài tầm thường; trúng thì hồi thêm 1 mana', lost(e) > 0 && near(P.mana - m0, P.manaHit + 1), lost(e) + ' / ' + (P.mana - m0));
  w = room({ melee: 'sword', tier: 2 }); e = dummy(243);
  step(2, { atk: true, atkP: true }); sec(0.5);
  ok('Dòng phụ: không có dòng tầm xa thì không với tới', lost(e) === 0, lost(e));
  w = room({ hero: 'smith', melee: 'sword', tier: 3, power: 'first' }); e = dummy(220);
  step(2, { atk: true, atkP: true }); sec(0.32);
  const d1 = lost(e); step(2, { atk: true, atkP: true }); sec(0.32);
  ok('Dòng mạnh Mở màn: đòn đầu lên quái đầy máu gấp đôi (0,9 x 2), đòn sau như thường (0,95)', near(d1 / G.pDamage(P, w), 1.8, 0.01) && near((lost(e) - d1) / G.pDamage(P, w), 0.95, 0.01), (d1 / G.pDamage(P, w)).toFixed(2) + '/' + ((lost(e) - d1) / G.pDamage(P, w)).toFixed(2));
  w = room({ hero: 'smith', melee: 'sword', tier: 3, power: 'boss' }); e = dummy(220); const el2 = G.spawnEnemy('elite', 224, 196, { hpMult: 1e6 }); el2.st.stun = 1e9; el2.inside = true; el2.hp -= 1; e.hp -= 1;
  step(2, { atk: true, atkP: true }); sec(0.32);
  ok('Dòng mạnh Diệt yêu: tinh anh nhận thêm 20%, quái thường thì không', near((el2.maxhp - el2.hp - 1) / (lost(e) - 1), 1.2, 0.01), ((el2.maxhp - el2.hp - 1) / (lost(e) - 1)).toFixed(3));

  // ================= 3. VŨ KHÍ RƠI =================
  G.testSave({});
  G.rnd = G.srand(7);
  const cnt = [0, 1, 2].map((r) => { const c = [0, 0, 0, 0]; for (let k = 0; k < 4000; k++) c[G.rollRarity(r)]++; return c; });
  ok('Rơi: rương và tinh anh không bao giờ ra Vàng, cao nhất là Tím', cnt.every((c) => c[3] === 0 && c[2] > 0), JSON.stringify(cnt));
  ok('Rơi: đa số là Thường ở vùng đầu', cnt[0][0] > 4000 * 0.6, cnt[0].join());
  ok('Rơi: vùng sau tỉ lệ bậc cao tốt hơn (Tím tăng dần, Thường giảm dần)', cnt[0][2] < cnt[1][2] && cnt[1][2] < cnt[2][2] && cnt[0][0] > cnt[1][0] && cnt[1][0] > cnt[2][0], JSON.stringify(cnt));
  const fams = new Set(); for (let k = 0; k < 400; k++) { G.save.weapons.length = 2; fams.add(G.giveWeapon('sword', G.rollRarity(1)).family); }
  ok('Rơi: dòng ngẫu nhiên, đủ cả 10 dòng', fams.size === 10, fams.size);
  // trùm vùng: lần đầu chắc chắn Vàng
  function bossWin(r, seed) {
    G.rnd = G.srand(seed);
    G.startStage(r, 4, 0);
    const S2 = G.getRun(); G.getWorld().waves = [];
    G.gotoRoom(S2.rooms.length - 1);
    const before = G.save.weapons.map((x) => x.id);
    G.damage(G.getWorld().boss, 1e12, { el: null });
    G.sim(60 * 3);
    return G.save.weapons.filter((x) => !before.includes(x.id) && x.rarity >= 2);
  }
  for (let r = 0; r < 3; r++) {
    G.testSave({ lvl: 20 });
    let ok1 = true, got = null;
    for (let seed = 1; seed <= 6; seed++) { G.testSave({ lvl: 20 }); const d = bossWin(r, seed * 13); got = d[d.length - 1]; if (!got || got.rarity !== 3 || got.gold !== r) ok1 = false; }
    ok('Trùm vùng ' + (r + 1) + ': lần đầu hạ chắc chắn rơi 1 vũ khí Vàng (thử 6 hạt giống)', ok1, got ? got.rarity + '/' + got.gold : 'không rơi');
    ok('Trùm vùng ' + (r + 1) + ': Vàng có hệ số x' + G.GOLD_MULT[r] + ', đủ 2 dòng phụ và 1 dòng mạnh', got && near(G.wRarMult(got), [1.5, 1.6, 1.7][r]) && got.affixes.length === 2 && !!G.POWER[got.power]);
  }
  G.testSave({ lvl: 20 });
  bossWin(0, 5);
  let gold = 0, tim = 0, other = 0;
  for (let k = 0; k < 60; k++) {
    G.save.weapons = G.save.weapons.filter((x) => G.save.carry.includes(x.id));
    const d = bossWin(0, 100 + k);
    const x = d[d.length - 1];
    if (!x) other++; else if (x.rarity === 3) gold++; else if (x.rarity === 2) tim++; else other++;
  }
  ok('Trùm vùng: đánh lại thì lần nào cũng rơi Vàng hoặc Tím', other === 0 && gold + tim === 60, gold + '/' + tim + '/' + other);
  ok('Trùm vùng: đánh lại phần lớn là Tím, Vàng hiếm (khoảng 12%)', tim > gold && gold <= 18, gold + ' Vàng trong 60 lần');
  G.testSave({}); G.rnd = G.srand(3);
  while (G.save.weapons.length < 12) G.newWeapon(G.save, 'sword', 0);
  ok('Rương đồ đầy: vũ khí thường đổi thành vàng, vũ khí Vàng vẫn được giữ', G.giveWeapon('bow', 2) === null && !!G.giveWeapon('bow', 3, { gold: 1 }) && G.save.weapons.length === 13);
  G.rnd = Math.random;
  // ================= 4. ĐẶC TRƯNG HỆ THEO CẤP =================
  ok('Đặc trưng: Trắng và Mầm chưa mở gì, Thành hình mở 1, Thức tỉnh mở 2', [0, 1, 2, 3].map(G.heFeatures).join() === '0,0,1,2');
  ok('Đặc trưng: mỗi hệ có đủ tên hai đặc trưng', G.ELS.every((el) => G.HE_FEATURES[el].length === 2 && G.HE_FEATURES[el].every((f) => f.name && f.desc)));
  const MARKS = { 1: 30, 2: 120, 3: 300 };
  const combo3 = () => { for (let k = 0; k < 3; k++) { step(1, { atk: true, atkP: true }); let n = 0; while (!P.hitDone && n++ < 200) step(1); if (k < 2) { n = 0; while (P.atkT > 0 && n++ < 200) step(1); } } };
  const fixRnd = (v) => { G.rnd = () => v; };
  // st: mốc 1..3. Trả về kết quả đo của nhát kết kiếm và của phản ứng dây chuyền.
  function probe(el, st, rar) {
    const r = {};
    // (a) nhát kết của kiếm: có để lại gì trên sân không
    w = room({ hero: 'smith', melee: 'sword', tier: rar == null ? 1 : rar, branch: el, marks: MARKS[st] });
    r.stage = G.wStage(w);
    const near1 = dummy(224), far1 = dummy(262);
    fixRnd(0.999); combo3(); G.rnd = Math.random;
    r.zones = heZones(); r.farHit = lost(far1) > 0; r.farIce = far1.st.iceN;
    // (b) phản ứng dây chuyền
    w = room({ hero: 'smith', melee: 'sword', tier: rar == null ? 1 : rar, branch: el, marks: MARKS[st] });
    if (el === 'fire') {
      const a = dummy(300, 190, 1), b = dummy(322); // a đang cháy và sắp chết, b đứng cạnh
      G.applyStatus(a, 'fire', 1); a.hp = 1e-6; G.damage(a, 1, { w });
      r.chain = a.dead && lost(b) > 0 && b.st.fire > 0; r.chainDmg = lost(b) / G.pDamage(P, w);
    } else if (el === 'poison') {
      const a = dummy(300, 190, 1), b = dummy(322);
      G.applyStatus(a, 'poison', 1, 3); a.hp = 1e-6; G.damage(a, 1, { w });
      r.chain = a.dead && b.st.poisonN > 0; r.chainDmg = b.st.poisonN;
    } else {
      const a = dummy(224), b = dummy(248, 198);
      for (let k = 0; k < 5; k++) G.applyStatus(a, 'ice', 1);
      fixRnd(0.999); step(1, { atk: true, atkP: true }); let n = 0; while (!P.hitDone && n++ < 200) step(1); G.rnd = Math.random;
      r.chain = a.st.frozen > 0 && lost(b) > 0; r.chainDmg = lost(b) / G.pDamage(P, w);
    }
    return r;
  }
  const FNAME = { fire: 'Lửa', poison: 'Độc', ice: 'Băng' };
  for (const el of G.ELS) {
    const f = G.HE_FEATURES[el];
    const r1 = probe(el, 1), r2 = probe(el, 2), r3 = probe(el, 3);
    const left = (r) => (el === 'ice' ? r.farHit && r.farIce > 0 : r.zones > 0);
    ok(FNAME[el] + ' Mầm (cấp 2): chưa có luật hệ, nhát kết không để lại gì trên sân', r1.stage === 1 && !left(r1) && r1.zones === 0 && !r1.farHit, JSON.stringify(r1));
    ok(FNAME[el] + ' Mầm (cấp 2): chưa có phản ứng dây chuyền', !r1.chain, JSON.stringify(r1));
    ok(FNAME[el] + ' Thành hình (cấp 3): có đặc trưng 1 "' + f[0].name + '"', r2.stage === 2 && left(r2), JSON.stringify(r2));
    ok(FNAME[el] + ' Thành hình (cấp 3): chưa có đặc trưng 2 "' + f[1].name + '"', !r2.chain, JSON.stringify(r2));
    ok(FNAME[el] + ' Thức tỉnh (cấp 4): vẫn có đặc trưng 1 "' + f[0].name + '"', r3.stage === 3 && left(r3), JSON.stringify(r3));
    ok(FNAME[el] + ' Thức tỉnh (cấp 4): có đặc trưng 2 "' + f[1].name + '"', r3.chain, JSON.stringify(r3));
    const rT = probe(el, 3, 0);
    ok(FNAME[el] + ' bậc Thường đủ 300 dấu ấn: dừng ở Thành hình nên chỉ có đặc trưng 1', rT.stage === 2 && left(rT) && !rT.chain, JSON.stringify(rT));
  }
  // Mầm vẫn có hiệu ứng hệ nhẹ: tỉ lệ gây cháy, độc, chậm theo G.PROC
  for (const el of G.ELS) {
    w = room({ hero: 'smith', melee: 'sword', tier: 1, branch: el, marks: 30 }); e = dummy(224);
    fixRnd(0.19); step(1, { atk: true, atkP: true }); sec(0.3); const on = G.hasStatus(e);
    w = room({ hero: 'smith', melee: 'sword', tier: 1, branch: el, marks: 30 }); e = dummy(224);
    fixRnd(0.21); step(1, { atk: true, atkP: true }); sec(0.3); const off = !G.hasStatus(e);
    G.rnd = Math.random;
    ok(FNAME[el] + ' Mầm: mỗi đòn có 20% gây hiệu ứng hệ (số ngẫu nhiên dưới 0,2 thì dính, trên thì không)', on && off, on + '/' + off);
  }
  ok('Chỉ số tăng theo mốc: Trắng 1 / Mầm 1,04 / Thành hình 1,08 / Thức tỉnh 1,12', G.STAGE_MULT.join() === '1,1.04,1.08,1.12');
  // bùa phủ hệ lên vũ khí trắng: tính như Mầm, không có luật hệ
  w = room({ hero: 'smith', melee: 'sword', tier: 1 }); e = dummy(224);
  G.addCoat('fire', 30); combo3();
  ok('Bùa hệ trên vũ khí trắng: quái dính cháy nhưng nhát kết không để lại vệt cháy (tính như Mầm)', e.st.fire > 0 && heZones() === 0, e.st.fire + '/' + heZones());
  // cung: luật của tên cũng chỉ có từ Thành hình
  function arrowProbe(el, st) {
    room({ hero: 'smith', tier: 1, branch: el, marks: MARKS[st] }); P.cur = 1; w = G.curW(P); step(2);
    const a = dummy(280), b = dummy(el === 'ice' ? 310 : 292, el === 'ice' ? 190 : 197);
    fixRnd(0.999); step(2, { atk: true, atkP: true }); sec(0.9); G.rnd = Math.random;
    return lost(a) > 0 && lost(b) > 0;
  }
  ok('Cung Lửa: tên nổ lan sang quái bên cạnh từ Thành hình, Mầm thì không', !arrowProbe('fire', 1) && arrowProbe('fire', 2));
  ok('Cung Băng: tên xuyên thêm 1 quái từ Thành hình, Mầm thì không', !arrowProbe('ice', 1) && arrowProbe('ice', 2));
  // thông báo trong trận khi lên cấp 3 và cấp 4
  for (const el of G.ELS) {
    w = room({ hero: 'hunter', melee: 'sword', tier: 1 });
    G.addMarks(w, el, 30);
    const b1 = W.banner ? W.banner.s : '';
    G.addMarks(w, el, 90);
    const b2 = W.banner ? W.banner.s : '';
    G.addMarks(w, el, 180);
    const b3 = W.banner ? W.banner.s : '';
    ok(FNAME[el] + ': lên Mầm có thông báo nhưng chưa nhắc đặc trưng', b1.includes('Mầm') && !b1.includes('Mở đặc trưng'), b1);
    ok(FNAME[el] + ': lên Thành hình thông báo kèm tên đặc trưng vừa mở', b2.includes('Thành hình') && b2.includes('Mở đặc trưng: ' + G.HE_FEATURES[el][0].name), b2);
    ok(FNAME[el] + ': lên Thức tỉnh thông báo kèm tên đặc trưng vừa mở', b3.includes('Thức tỉnh') && b3.includes('Mở đặc trưng: ' + G.HE_FEATURES[el][1].name), b3);
  }
  // Nổ lan dây chuyền: ba con đang cháy đứng thành hàng, con đầu chết thì cả hàng nổ theo
  w = room({ hero: 'smith', melee: 'sword', tier: 1, branch: 'fire', marks: 300 });
  const row = [dummy(300, 190, 1), dummy(326, 190, 1), dummy(352, 190, 1)];
  for (const q of row) { G.applyStatus(q, 'fire', 1); q.hp = G.pDamage(P, w) * 0.3; }
  row[0].hp = 1e-6; G.damage(row[0], 1, { w });
  ok('Nổ lan: quái bị nổ chết khi đang cháy thì nổ tiếp (dây chuyền cả hàng)', row.every((q) => q.dead), row.map((q) => (q.dead ? 1 : 0)).join(''));

  // ================= 5. NÉ THEO HƯỚNG DI CHUYỂN GẦN NHẤT =================
  room({ hero: 'smith' });
  let x0 = P.x, y0 = P.y;
  step(1, { dodgeP: true }); sec(0.3);
  ok('Né: chưa đi bước nào thì lộn theo hướng mặt', P.x > x0 + 30 && near(P.y, y0, 0.5), (P.x - x0).toFixed(0));
  room({ hero: 'smith' });
  sec(0.25, { mx: -1 }); step(4);
  P.face = 1; // quay mặt sang phải (ví dụ vừa đánh quái bên phải) nhưng bước gần nhất là sang trái
  x0 = P.x; y0 = P.y;
  step(1, { dodgeP: true }); sec(0.3);
  ok('Né: không đẩy cần thì lộn theo hướng di chuyển gần nhất (trái), không theo hướng mặt (phải)', P.x < x0 - 30 && near(P.y, y0, 0.5), (P.x - x0).toFixed(0));
  ok('Né: lộn xong thì quay mặt theo hướng lộn', P.face === -1);
  room({ hero: 'smith' });
  sec(0.25, { my: -1 }); step(4);
  x0 = P.x; y0 = P.y;
  step(1, { dodgeP: true }); step(6);
  const upFrame = G.tinhLinh.frame(G.heroArgs(P));
  sec(0.3);
  ok('Né: bước gần nhất là đi lên thì lộn thẳng lên', P.y < y0 - 12 && near(P.x, x0, 0.5), (P.x - x0).toFixed(0) + '/' + (P.y - y0).toFixed(0));
  ok('Né: hình lộn dùng tư thế theo hướng lộn (lên hẳn là kiểu 0, ngang là kiểu 2)', upFrame.anim === 'dodge' && upFrame.v === 0, upFrame.anim + '/' + upFrame.v);
  room({ hero: 'smith' });
  sec(0.25, { mx: -1 }); step(4);
  x0 = P.x;
  step(1, { dodgeP: true, mx: 1 }); step(6, { mx: 1 });
  const sideFrame = G.tinhLinh.frame(G.heroArgs(P));
  sec(0.3);
  ok('Né: đang đẩy cần thì vẫn lộn theo hướng cần (phải), dù bước trước đó sang trái', P.x > x0 + 30, (P.x - x0).toFixed(0));
  ok('Né: lộn ngang dùng tư thế kiểu 2', sideFrame.anim === 'dodge' && sideFrame.v === 2, sideFrame.v);
  room({ hero: 'smith' });
  sec(0.25, { mx: 1, my: 1 }); step(4);
  x0 = P.x; y0 = P.y;
  step(1, { dodgeP: true }); step(6);
  const dgFrame = G.tinhLinh.frame(G.heroArgs(P));
  ok('Né: hướng chéo xuống cũng được nhớ, hình lộn nghiêng theo (kiểu 3)', P.x > x0 + 5 && P.y > y0 + 3 && dgFrame.v === 3, dgFrame.v);

  // ================= 6. HERO MỚI, VŨ KHÍ SỐNG, NÚT MỚI =================
  ok('Hero: em bé tinh linh thay hình hero cũ', G.art.hero === G.tinhLinh.hero && typeof G.art.heroOld === 'function');
  const draws = [];
  const realDraw = G.weaponArt.draw;
  G.weaponArt.draw = function (c, o) { draws.push(Object.assign({}, o)); return realDraw.apply(this, arguments); };
  const btns = [];
  const realBtn = G.btnArt.draw;
  G.btnArt.draw = function (c, kind, x, y, r, st) { btns.push([kind, Object.assign({}, st)]); return realBtn.apply(this, arguments); };
  const paint = () => { draws.length = 0; btns.length = 0; G.ui.begin(); G.scene.draw(); G.click = null; };
  w = room({ hero: 'hunter', melee: 'spear', tier: 3, family: 7, branch: 'ice', marks: 300 });
  paint();
  let d0 = draws.find((d) => d.type === 'spear');
  ok('Vũ khí sống: hình lấy đúng loại, dòng, nhánh, mốc, bậc của món đang cầm', d0 && d0.family === 7 && d0.branch === 'ice' && d0.stage === 3 && d0.rarity === 3, JSON.stringify(d0));
  ok('Vũ khí sống: lúc đứng yên thì mặt bình thường', d0 && d0.mood === 'idle', d0 && d0.mood);
  step(1, { atk: true, atkP: true }); step(6); paint();
  d0 = draws.find((d) => d.type === 'spear' && d.mood === 'attack');
  ok('Vũ khí sống: lúc ra đòn thì mặt đang đánh', !!d0);
  sec(0.6); P.inv = 0; G.hurtPlayer(1, null, null, false); step(1); paint();
  d0 = draws.find((d) => d.type === 'spear' && d.mood === 'hurt');
  ok('Vũ khí sống: bé trúng đòn thì vũ khí nhăn mặt', !!d0);
  ok('Nút: đủ bộ Đánh, Đặc biệt, kỹ năng, Né, bình máu, tạm dừng vẽ bằng G.btnArt', ['atk', 'special', 'skill', 'dodge', 'potion', 'pause'].every((k) => btns.some((b) => b[0] === k)), btns.map((b) => b[0]).join());
  w = room({ hero: 'hunter', melee: 'hammer', tier: 1 });
  sec(0.8, { atk: true }); inp = { atk: true }; paint();
  let ab = btns.find((b) => b[0] === 'atk');
  const holdF = G.tinhLinh.frame(G.heroArgs(P));
  ok('Nút Đánh: đang giữ để lấy đà thì hiện vòng nạp theo P.mv (búa có 2 nấc)', ab && ab[1].charge > 0.3 && ab[1].charge <= 1 && near(ab[1].charge, P.mv.charge, 0.05) && ab[1].chargeSteps === 2, ab && JSON.stringify([ab[1].charge, ab[1].chargeSteps]));
  ok('Hero: đang lấy đà thì dùng tư thế lấy đà', holdF.anim === 'hold', holdF.anim);
  step(2, {}); sec(0.9); paint();
  ab = btns.find((b) => b[0] === 'atk');
  ok('Nút Đánh: thả ra thì hết vòng nạp', ab && !(ab[1].charge > 0));
  w = room({ hero: 'healer', melee: 'spear', tier: 1 }); e = dummy(230);
  let sweep = false;
  for (let k = 0; k < 4; k++) { step(2, { atk: true, atkP: true }); step(1); let n = 0; while (P.atkT > 0 && n++ < 200) { step(1); if (P.mv.kind === 'quet' && G.tinhLinh.frame(G.heroArgs(P)).anim === 'sweep') sweep = true; } }
  ok('Hero: nhát thứ tư của giáo dùng tư thế quét vòng', sweep);
  room({ hero: 'smith' });
  sec(0.25, { mx: -1 }); step(4); P.face = 1; paint();
  let db = btns.find((b) => b[0] === 'dodge');
  ok('Nút Né: không đẩy cần thì mũi tên chỉ hướng di chuyển gần nhất (trái)', db && Math.abs(Math.abs(db[1].dir) - Math.PI) < 0.01, db && db[1].dir);
  G.weaponArt.draw = realDraw; G.btnArt.draw = realBtn;
  const icons = [];
  const realIcon = G.weaponArt.icon;
  G.weaponArt.icon = function (c, o) { icons.push(Object.assign({}, o)); return realIcon.apply(this, arguments); };
  paint();
  ok('Ô vũ khí trong trận: biểu tượng vẽ bằng G.weaponArt.icon cho cả hai món', icons.length >= 2, icons.length);
  G.setScene(G.Village);
  for (const t of ['hub', 'forge', 'gear']) { icons.length = 0; G.villageApi.V.tab = t; paint(); ok('Làng (' + t + '): biểu tượng vũ khí vẽ bằng G.weaponArt.icon', icons.length >= 2, icons.length); }
  G.villageApi.V.tab = 'weapon'; G.villageApi.V.wid = G.save.carry[0]; icons.length = 0; paint();
  ok('Làng: màn xem vũ khí mở được và có hình vũ khí', G.villageApi.V.tab === 'weapon' && icons.length >= 1);
  G.weaponArt.icon = realIcon;
  G.botInput = null;
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
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        pg.add_script_tag(path=os.path.join(ROOT, 'tests', 'setup.js'))
        res = pg.evaluate(JS)
        b.close()
    bad = 0
    for name, good, detail in res:
        if not good:
            bad += 1
        if not good or '-v' in sys.argv:
            print(('ĐẠT ' if good else 'SAI ') + name + (('  -> ' + detail) if detail else ''))
    print(f'{len(res) - bad}/{len(res)} mục đạt' + (', lỗi trang: ' + '; '.join(errs[:3]) if errs else ''))
    sys.exit(1 if bad or errs else 0)


main()
