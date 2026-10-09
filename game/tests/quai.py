"""Kiểm tra quái mới (js/mobs.js, js/boss.js): mỗi cơ chế hoạt động, đòn tám hướng, trùm đi đủ ba pha và chết được, không lỗi.
Chạy: python3 tests/quai.py        (thoát mã 1 nếu có mục hỏng)"""
import sys, json
from quai_lib import sync_playwright, open_page

JS = r"""
() => {
  const out = [];
  const ok = (name, cond, info) => out.push([!!cond, name, info == null ? '' : String(info)]);
  const P0 = () => G.getRun().P;
  const step = (n, keep) => T.sim(n, keep);
  const mob = (role, x, y, o) => { const e = G.spawnEnemy(role, x, y, o || {}); e.inside = true; return e; };
  const ready = (e) => { e.spawnT = 0; e.cd = 0; };
  const hurtOf = (f) => { const P = P0(), h0 = P.hp; f(); return h0 - P.hp; };

  // ---------- hình mới cho mọi vai ở cả ba vùng ----------
  const roles = ['rusher', 'swarm', 'shield', 'archer', 'nimble', 'kami', 'bomber', 'spiky', 'elite'];
  for (let r = 0; r < 3; r++) {
    const { W } = T.room(r, 2);
    const ids = roles.map((ro) => { const e = mob(ro, 240, 150); return e.art; });
    ok('Vùng ' + (r + 1) + ': mọi vai đều có hình mới', ids.every((x) => x && G.monsterArt._defs[x]), ids.join(','));
    const e = W.ents[0];
    ok('Vùng ' + (r + 1) + ': vùng va chạm theo cỡ hình (rộng hơn quái cũ)', e.r >= 8 && e.h >= 24, e.r + '/' + e.h);
    ok('Vùng ' + (r + 1) + ': quái mới vừa mọc thì diễn cử động xuất hiện', e.an && e.an.n === 'spawn' && e.spawnT > 0);
  }
  { const { W } = T.room(1, 2); const e = mob('rusher', 240, 150); step(2); const n0 = e.an.n; e.spawnT = 0; step(2); ok('Hết cử động xuất hiện thì đứng thở hoặc đi', n0 === 'spawn' && (e.an.n === 'idle' || e.an.n === 'move' || e.an.n === 'tele'), n0 + '→' + e.an.n); }

  // ---------- tám hướng: quái ở mọi phía vẫn đánh trúng em bé đứng yên ----------
  const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  for (let r = 0; r < 3; r++) for (const role of ['rusher', 'swarm', 'nimble', 'elite', 'shield', 'archer']) {
    const hit = [];
    DIRS.forEach((d, k) => {
      const { W, P } = T.room(r, 2, { seed: 9 + k });
      P.x = (W.x0 + W.x1) / 2; P.y = (W.y0 + W.y1) / 2; P.inv = 0;
      const L = Math.hypot(d[0], d[1]), dist = role === 'archer' ? 80 : role === 'elite' ? 40 : 28;
      const e = mob(role, P.x + d[0] / L * dist, P.y + d[1] / L * dist, { hpMult: 1e4 }); ready(e); e.diveCd = 99; e.skCd = 99; e.healCd = 99; e.sumCd = 99;
      if (role === 'shield') e.face = d[0] > 0 ? -1 : 1;
      let got = false;
      for (let t = 0; t < 360 && !got; t++) { const h0 = P.hp; G.sim(1); P.x = (W.x0 + W.x1) / 2; P.y = (W.y0 + W.y1) / 2; if (P.hp < h0) got = true; P.hp = P.maxhp; P.inv = 0; P.frozenT = 0; }
      hit.push(got ? 1 : 0);
    });
    ok('Tám hướng vùng ' + (r + 1) + ' (' + role + '): đánh trúng từ cả 8 phía', hit.every((x) => x), hit.join(''));
  }
  { // vùng báo trước xoay theo góc: quái ở chéo trên thì vùng báo hướng chéo xuống
    const { W, P } = T.room(0, 2); P.x = 240; P.y = 180; const e = mob('rusher', 210, 150, { hpMult: 1e4 }); ready(e);
    let z = null; for (let t = 0; t < 120 && !z; t++) { step(1); P.x = 240; P.y = 180; z = W.zones.find((q) => q.src === e && q.t > 0); }
    ok('Vùng báo trước xoay theo góc tới em bé (chéo)', z && z.shape === 'line' && Math.abs(z.ang - Math.atan2(30, 30)) < 0.25, z && z.ang.toFixed(2));
  }

  // ---------- đặt bom: bom có vòng đếm ngược rồi nổ, nổ theo hệ vùng ----------
  for (let r = 0; r < 3; r++) {
    const { W, P } = T.room(r, 2); P.x = 240; P.y = 170;
    const e = mob('bomber', 300, 150, { hpMult: 1e4 }); ready(e);
    let bz = null; for (let t = 0; t < 200 && !bz; t++) { step(1, true); bz = W.zones.find((z) => z.bomb); }
    ok('Đặt bom vùng ' + (r + 1) + ': thả bom có vòng đếm ngược', bz && bz.t > 0.8 && bz.fxKind === 'bomb', bz && bz.t.toFixed(2));
    if (!bz) continue;
    P.x = bz.x; P.y = bz.y; P.inv = 0; P.frozenT = 0; const h0 = P.hp;
    for (let t = 0; t < 200 && W.zones.includes(bz) && bz.t > 0; t++) { G.sim(1); P.x = bz.x; P.y = bz.y; }
    const el = G.REGIONS[r].el;
    const pools = W.zones.filter((z) => z.pool && z.el === el && z.team !== 'player').length;
    ok('Đặt bom vùng ' + (r + 1) + ': nổ trúng em bé đứng trong vòng', P.hp < h0, (h0 - P.hp).toFixed(0));
    if (el === 'ice') ok('Bom vùng Băng: nổ trúng thì đóng băng ngắn', P.frozenT > 0, P.frozenT);
    else ok('Bom vùng ' + G.EL[el].name + ': nổ để lại ' + (el === 'poison' ? 'vũng độc' : 'vệt cháy'), pools >= 1, pools);
  }
  { // em bé bị đóng băng thì không đi được trong lúc đó
    const { W, P } = T.room(1, 2); P.frozenT = 0.6; const x0 = P.x; T.useBot(false); T.inp = { mx: 1 }; G.sim(20); T.inp = {};
    ok('Đóng băng: em bé đứng yên một lúc', Math.abs(P.x - x0) < 0.5, P.x - x0); G.sim(40); T.inp = { mx: 1 }; G.sim(10); T.inp = {};
    ok('Đóng băng: hết băng thì đi lại được', P.x - x0 > 3, P.x - x0);
  }

  // ---------- cảm tử: lao vào, phồng lên rồi nổ, nổ xong thì biến mất ----------
  for (let r = 0; r < 3; r++) {
    const { W, P } = T.room(r, 2); P.x = 240; P.y = 170; P.inv = 0;
    const e = mob('kami', 300, 150, { hpMult: 1e4 }); ready(e); const k0 = W.loot.kills;
    let boomed = false, hurt = 0;
    for (let t = 0; t < 500 && !e.dead; t++) { const h0 = P.hp; G.sim(1); P.x = 240; P.y = 170; if (P.hp < h0) hurt += h0 - P.hp; P.hp = P.maxhp; P.inv = 0; P.frozenT = 0; if (e.ghost) boomed = true; }
    ok('Cảm tử vùng ' + (r + 1) + ': lao tới nổ trúng em bé rồi biến mất (không tính là bị hạ)', boomed && e.dead && hurt > 0 && W.loot.kills === k0 && !W.ents.includes(e), [boomed, e.dead, hurt.toFixed(0)].join('/'));
  }

  // ---------- gai: đang dựng gai mà chém thì bị phản đòn; bắn tên thì không ----------
  for (let r = 0; r < 3; r++) {
    const { W, P } = T.room(r, 2); P.x = 220; P.y = 170; P.inv = 0;
    const e = mob('spiky', 250, 170, { hpMult: 1e4 }); ready(e); e.spikeCd = 0;
    for (let t = 0; t < 30 && !(e.spikeUp > 0); t++) step(1, true);
    ok('Gai vùng ' + (r + 1) + ': có lúc dựng gai (có dấu hiệu)', e.spikeUp > 0);
    P.inv = 0; const hm = hurtOf(() => G.cb.playerHit(e, 1, { w: G.curW(P) }));
    P.inv = 0; e.reflT = 0; const hr = hurtOf(() => G.cb.playerHit(e, 1, { w: G.curW(P), ranged: true }));
    ok('Gai vùng ' + (r + 1) + ': chém lúc dựng gai thì bị phản đòn, bắn xa thì không', hm > 0 && hr === 0, hm.toFixed(0) + '/' + hr);
    const n0 = W.projs.length; for (let t = 0; t < 200 && W.projs.length === n0; t++) step(1, true);
    ok('Gai vùng ' + (r + 1) + ': hạ gai thì bắn gai toả tròn tám hướng', W.projs.filter((o) => o.kind === 'spike').length >= 8, W.projs.length);
  }

  // ---------- giáp: chắn phía trước, phải vòng ra sau hoặc phá giáp; hồi máu cho bạn ----------
  for (let r = 0; r < 3; r++) {
    const { W, P } = T.room(r, 2); const e = mob('shield', 260, 170, { hpMult: 1e4 }); ready(e); e.st.stun = 1e9; e.face = -1;
    P.x = 230; P.y = 170; let h0 = e.hp; G.damage(e, 100, {}); const front = h0 - e.hp;
    P.x = 290; h0 = e.hp; G.damage(e, 100, {}); const back = h0 - e.hp;
    ok('Giáp vùng ' + (r + 1) + ': đánh phía trước bị giảm, đánh sau lưng thì đủ', front < 70 && Math.abs(back - 100) < 0.01, front.toFixed(0) + '/' + back.toFixed(0));
    P.x = 230; e.hp = e.maxhp; for (let k = 0; k < 40 && !(e.brokeT > 0); k++) G.mobOnHit(e, e.maxhp * 0.05, {});
    h0 = e.hp; G.damage(e, 100, {});
    ok('Giáp vùng ' + (r + 1) + ': đánh mãi phía trước thì vỡ giáp, lúc đó đánh trước cũng đủ', e.brokeT > 0 && Math.abs(h0 - e.hp - 100) < 0.01, (h0 - e.hp).toFixed(0));
    const { W: W2, P: P2 } = T.room(r, 2); P2.x = 120;
    const s = mob('shield', 250, 170, { hpMult: 1e4 }); ready(s); s.healCd = 0; const a = mob('rusher', 270, 180, { hpMult: 1e4 }); ready(a); a.st.stun = 1e9; a.hp = a.maxhp * 0.5;
    for (let t = 0; t < 150; t++) step(1, true);
    ok('Giáp vùng ' + (r + 1) + ': hồi máu cho bạn đứng gần', a.hp > a.maxhp * 0.55, (a.hp / a.maxhp).toFixed(2));
  }
  { // quái giáp quay mặt chậm: em bé vòng ra sau thì một lúc sau nó mới quay lại
    const { W, P } = T.room(0, 2); const e = mob('shield', 250, 170, { hpMult: 1e4 }); ready(e); e.face = -1; P.x = 290; P.y = 170;
    step(20, true); const f1 = e.face; step(60, true); const f2 = e.face;
    ok('Giáp: quay mặt chậm, có lúc để đánh sau lưng', f1 === -1 && f2 === 1, f1 + '→' + f2);
  }

  // ---------- bắn xa: bắn theo mọi góc, gọi thêm bầy nhỏ ----------
  for (let r = 0; r < 3; r++) {
    const { W, P } = T.room(r, 2); P.x = 240; P.y = W.y1 - 10;
    const e = mob('archer', 240, W.y0 + 20, { hpMult: 1e4 }); ready(e); e.sumCd = 99;
    let shot = false; for (let t = 0; t < 300 && !shot; t++) { step(1, true); P.x = 240; P.y = W.y1 - 10; shot = W.projs.some((o) => o.team === 'enemy' && o.vy > 30) || W.zones.some((z) => z.bomb && z.y > W.y0 + 60); }
    ok('Bắn xa vùng ' + (r + 1) + ': em bé ở ngay bên dưới vẫn bị bắn xuống', shot);
    e.sumCd = 0; e.cd = 5; for (let t = 0; t < 150; t++) step(1, true);
    const adds = W.ents.filter((x) => x.sum === e);
    ok('Bắn xa vùng ' + (r + 1) + ': gọi thêm bầy nhỏ (có vòng báo trước)', adds.length === 2 && adds.every((x) => x.add && x.role === 'swarm'), adds.length);
  }

  // ---------- nhanh nhẹn: lặn hoặc chui xuống, có vòng báo, trồi lên cạnh em bé ----------
  for (let r = 0; r < 3; r++) {
    const { W, P } = T.room(r, 2); P.x = 200; P.y = 170;
    const e = mob('nimble', 300, 150, { hpMult: 1e4 }); ready(e); e.diveCd = 0;
    let hid = false, warn = false; for (let t = 0; t < 240; t++) { step(1, true); P.x = 200; P.y = 170; if (e.hidden) hid = true; if (e.dive && e.dive.k === 'warn') warn = true; if (hid && !e.hidden && !e.dive) break; }
    ok('Nhanh nhẹn vùng ' + (r + 1) + ': lặn xuống (không bị nhắm), báo vòng đỏ rồi trồi lên sát em bé', hid && warn && Math.hypot(e.x - 200, e.y - 170) < 60, Math.round(Math.hypot(e.x - 200, e.y - 170)));
    e.hidden = true; ok('Đang lặn thì không là mục tiêu', !G.targets().includes(e)); e.hidden = false;
  }

  // ---------- tinh anh: chiêu riêng và dấu hiệu ngẫu nhiên ----------
  for (let r = 0; r < 3; r++) for (const id of G.MOB_ART.elite[r]) {
    const { W, P } = T.room(r, 2); P.x = 220; P.y = 170;
    const e = mob('elite', 270, 170, { hpMult: 1e4, art: id, trait: 'giap' }); ready(e); e.skCd = 0;
    let used = false; for (let t = 0; t < 120 && !used; t++) { step(1, true); P.x = 220; P.y = 170; used = e.an && e.an.n === 'chieu1' || (e.act && e.act.k === 'sk'); }
    ok('Tinh anh ' + id + ': dùng chiêu riêng', used);
  }
  {
    const tr = new Set(); const { W } = T.room(1, 2); for (let k = 0; k < 30; k++) tr.add(mob('elite', 240, 170).trait);
    ok('Tinh anh: dấu hiệu ngẫu nhiên đủ bốn loại', ['nhanh', 'giap', 'no', 'hut'].every((x) => tr.has(x)), [...tr].join());
    const { P } = T.room(1, 2); P.x = 200;
    const a = mob('elite', 260, 170, { trait: 'nhanh' }), b = mob('elite', 260, 190, { trait: 'giap' }), c = mob('elite', 260, 150, { trait: 'no' }), d = mob('elite', 270, 170, { trait: 'hut' });
    ok('Tinh anh nhanh: chạy nhanh hơn', a.speed > G.ROLES.elite.speed * 1.3, a.speed);
    let h0 = b.hp; P.x = 300; G.damage(b, 100, {}); ok('Tinh anh bọc giáp: giảm sát thương cả sau lưng', Math.abs(h0 - b.hp - 65) < 0.5, (h0 - b.hp).toFixed(1));
    const zn = G.getWorld().zones.length; G.damage(c, 1e9, {}); ok('Tinh anh nổ khi chết: chết thì có vòng đỏ nổ sau một lúc', G.getWorld().zones.length > zn && G.getWorld().zones.some((z) => z.bomb && z.bomb.big));
    d.hp = d.maxhp * 0.5; P.inv = 0; G.hurtPlayer(20, null, d, true); ok('Tinh anh hút máu: đánh trúng thì hồi máu', d.hp > d.maxhp * 0.5);
  }

  // ---------- kiểu xuất hiện theo phòng ----------
  {
    const modes = new Set(); let marks = true;
    for (let k = 0; k < 24; k++) {
      const { S, W } = T.room(k % 3, 3, { seed: 30 + k });
      G.gotoRoom(S.map.rooms.findIndex((x) => x.type === 'fight'));
      const W2 = G.getWorld(); W2.waveT = 0.01; G.sim(3);
      if (W2.spawnMode) modes.add(W2.spawnMode);
      if (!W2.spawns.length || W2.ents.length) marks = false;
    }
    ok('Xuất hiện: có đủ ba kiểu lần lượt, cùng lúc, từng tốp', ['one', 'all', 'group'].every((m) => modes.has(m)), [...modes].join());
    ok('Xuất hiện: có vòng báo trước rồi quái mới mọc', marks);
  }

  // ---------- trùm nhỏ: hai chiêu riêng ----------
  for (let r = 0; r < 3; r++) {
    const { W, P, b } = T.boss(r, false); b.invuln = 0; b.busy = 0;
    const seen = new Set(); for (let t = 0; t < 2400 && seen.size < 2; t++) { step(1, true); if (b.an && /^chieu/.test(b.an.n)) seen.add(b.an.n); }
    ok('Trùm nhỏ ' + b.name + ': dùng đủ 2 chiêu riêng', seen.size === 2, [...seen].join());
  }

  // ---------- trùm vùng: ra mắt, ba pha, năm chiêu, choáng, chết rồi mới mọc cổng ----------
  for (let r = 0; r < 3; r++) {
    const { S, W, P, b } = T.boss(r, true);
    ok('Trùm ' + b.name + ': có màn ra mắt, lúc đó không nhận sát thương', b.an.n === 'intro' && G.damage(b, 100, {}) === 0);
    step(Math.ceil(b.intro * 60) + 5, true);
    const seen = new Set(), phases = []; let stun = false;
    for (let t = 0; t < 60 * 120 && (seen.size < 5 || !stun || t < 1600); t++) {
      step(1, true);
      if (b.an && /^c\d$/.test(b.an.n)) seen.add(b.an.n);
      if (b.an && /^phase/.test(b.an.n) && !phases.includes(b.an.n)) phases.push(b.an.n);
      if (b.tired > 0 || b.st.stun > 0) stun = true;
      if (t === 600) b.hp = b.maxhp * 0.6;
      if (t === 1500) b.hp = b.maxhp * 0.3;
    }
    ok('Trùm ' + b.name + ': đổi pha ở 66% và 33% máu, có cảnh chuyển pha', phases.join() === 'phase2,phase3' && b.phase === 2, phases.join());
    ok('Trùm ' + b.name + ': dùng đủ năm chiêu', seen.size === 5, [...seen].sort().join());
    ok('Trùm ' + b.name + ': có lúc choáng (mệt sau chiêu lớn)', stun);
    G.damage(b, 1e12, { el: 'ice' });
    step(60, true);
    const early = !!S.portal || S.won;
    step(60 * 4, true);
    ok('Trùm ' + b.name + ': chết hoành tráng rồi mới mọc cổng dịch chuyển', !early && (S.won || S.portal), early + '/' + !!S.portal);
  }
  return out;
}
"""

with sync_playwright() as pw:
    b, pg, errs = open_page(pw)
    pg.evaluate("G.noRender = false")
    res = pg.evaluate(JS)
    # chạy thêm vài giây có vẽ trong phòng đông quái và phòng trùm để bắt lỗi vẽ
    pg.evaluate("""() => { for (let r = 0; r < 3; r++) { const { W } = T.room(r, 3); for (const ro of ['rusher','swarm','shield','archer','nimble','kami','bomber','spiky','elite']) { const e = G.spawnEnemy(ro, G.rr(W.x0, W.x1), G.rr(W.y0, W.y1), { hpMult: 3 }); e.inside = true; } T.useBot(true); T.frame(400); T.useBot(false);
      for (const big of [0, 1]) { const o = T.boss(r, big); T.useBot(true); T.frame(500); o.b.hp = o.b.maxhp * 0.5; T.frame(300); o.b.hp = o.b.maxhp * 0.2; T.frame(300); G.damage(o.b, 1e12, {}); T.frame(300); T.useBot(false); } } }""")
    fxe = pg.evaluate("G.fx.errs")
    b.close()
bad = 0
for good, name, info in res:
    print(('đạt ' if good else 'SAI ') + name + ('' if good or not info else '  -> ' + info))
    bad += 0 if good else 1
real = [e for e in errs if 'willReadFrequently' not in e]
print('lỗi trang:', real[:5], '| lỗi hiệu ứng:', fxe)
if real or fxe: bad += 1
print(f'{len(res) - (bad if not (real or fxe) else bad - 1)}/{len(res)} mục đạt')
sys.exit(1 if bad else 0)
