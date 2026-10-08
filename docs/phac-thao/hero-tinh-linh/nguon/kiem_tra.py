# Kiểm tra file game/js/hero_tinhlinh.js qua trang thử: dựng mọi khung của mọi bé, mọi vũ khí, mọi món đồ; đo thời gian;
# thử hàm trung gian vũ khí với một G.weaponArt giả; thử các đầu vào lạ. Thoát mã 1 nếu có lỗi.   Chạy: python3 kiem_tra.py
import json, os, sys
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
JS = r"""
() => {
  window.requestAnimationFrame = () => 0;
  const TL = G.tinhLinh, L = G.heroLooks, out = { bad: [], frames: 0, maxMs: 0, sumMs: 0 };
  const cv = document.createElement('canvas'); cv.width = 200; cv.height = 200; const c = cv.getContext('2d');
  const ok = (name, cond) => { if (!cond) out.bad.push(name); };
  const ANIM = { idle: 8, run: 8, dodge: 8, hurt: 1, die: 8, cast: 8, dash: 2, gong: 4, spec: 7 };
  const hats = Object.keys(L.hats), robes = Object.keys(L.robes), backs = Object.keys(L.backs), wings = Object.keys(L.wings);
  ok('đủ 6 mũ', hats.length >= 6); ok('đủ 6 áo', robes.length >= 6); ok('đủ 3 món lưng', backs.length >= 3); ok('đủ 4 kiểu cánh', wings.length >= 4);
  for (const k of ['hats', 'robes', 'backs', 'wings']) for (const id in L[k]) ok('món ' + id + ' có id, tên, hàm vẽ', L[k][id].id === id && L[k][id].name && typeof L[k][id].draw === 'function');
  for (const id in L.wings) ok('cánh ' + id + ' có 3 cấp', L.wings[id].levels === 3);
  let n = 0;
  const one = (o) => {
    const t0 = performance.now();
    let fr;
    try { fr = TL.frame(o); } catch (e) { out.bad.push('lỗi dựng khung ' + JSON.stringify([o.key, o.weapon && o.weapon.type, o.anim, o.f, o.outfit]) + ': ' + e.message); return null; }
    const ms = performance.now() - t0; out.maxMs = Math.max(out.maxMs, ms); out.sumMs += ms; out.frames++;
    c.clearRect(0, 0, 200, 200);
    try { G.art.hero(c, Object.assign({ x: 100, y: 150, face: n++ % 2 ? 1 : -1 }, o)); } catch (e) { out.bad.push('lỗi vẽ: ' + e.message); }
    if (fr.weapon) for (const k of ['x', 'y', 'ang', 'pull']) if (!isFinite(fr.weapon[k])) out.bad.push('vũ khí ' + k + ' hỏng ở ' + o.anim + ' ' + o.f);
    if (!isFinite(fr.ox) || !isFinite(fr.oy)) out.bad.push('vị trí hỏng');
    return fr;
  };
  // mọi bé x mọi vũ khí x mọi hoạt ảnh x mọi khung (bộ khởi đầu)
  for (const key of G.HKEYS) for (const wt of G.WKEYS.concat([null])) {
    const weapon = wt ? { type: wt, tier: 0, marks: { fire: 0, poison: 0, ice: 0 } } : null;
    for (const a in ANIM) for (let f = 0; f < ANIM[a]; f++) one({ key, weapon, anim: a, f, v: 0 });
    if (wt) for (let v = 0; v < 3; v++) for (let f = 0; f < TL.ATKN[wt]; f++) one({ key, weapon, anim: 'atk', f, v });
  }
  // mọi món đồ, mọi cấp cánh, vài tư thế khó (lộn, bay, gục)
  const hard = [['idle', 0], ['dodge', 3], ['atk', 5], ['die', 7], ['run', 2]];
  const W = { type: 'sword', tier: 0, marks: { fire: 0, poison: 0, ice: 0 } };
  for (const h of hats.concat([null])) for (const q of hard) one({ key: 'smith', weapon: W, anim: q[0], f: q[1], outfit: { hat: h } });
  for (const r of robes.concat([null])) for (const q of hard) one({ key: 'hunter', weapon: W, anim: q[0], f: q[1], outfit: { robe: r } });
  for (const b of backs.concat([null])) for (const q of hard) one({ key: 'healer', weapon: W, anim: q[0], f: q[1], outfit: { back: b } });
  for (const w of wings) for (let lv = 1; lv <= 3; lv++) for (const q of hard) one({ key: 'wrestler', weapon: W, anim: q[0], f: q[1], outfit: { wing: { kind: w, level: lv } } });
  // đồ đang có trong data.js
  for (const h in G.GEAR.helm) { const fr = one({ key: 'smith', weapon: W, helm: h, anim: 'idle', f: 0 }); ok('mũ ' + h + ' nối được', L.fromGear.helm[h] && L.hats[L.fromGear.helm[h]]); }
  for (const a in G.GEAR.armor) { one({ key: 'smith', weapon: W, armor: a, anim: 'idle', f: 0 }); ok('áo ' + a + ' nối được', L.fromGear.armor[a] && L.robes[L.fromGear.armor[a]]); }
  // vũ khí theo hệ, nhuộm màu khi dính hiệu ứng
  for (const el of ['fire', 'poison', 'ice']) for (const wt of G.WKEYS) one({ key: 'smith', weapon: { type: wt, coat: el, tier: 1, marks: { fire: 0, poison: 0, ice: 0 } }, anim: 'atk', f: 4 });
  one({ key: 'smith', weapon: W, flash: true, atk: -1, dodge: -1 }); one({ key: 'smith', weapon: W, p: { st: { ice: 1 }, hurtT: 0 }, atk: -1, dodge: -1 }); one({ key: 'smith', weapon: W, p: { st: { poison: 1 }, hurtT: 0 }, atk: 0.5, dodge: -1 });
  // đầu vào lạ: không được sập
  for (const o of [{ key: 'khong-co' }, { key: 'smith', weapon: { type: 'la' } }, { key: 'smith', outfit: { hat: 'khong-co', robe: 'x', back: 'y', wing: { kind: 'z', level: 9 }, hand: 'q', mask: 'm' } }, { key: 'hunter', outfit: { wing: { kind: 'lua', level: 0 } } }, { key: 'healer', helm: 'h_la', armor: 'a_la' }, {}])
    one(Object.assign({ atk: -1, dodge: -1 }, o));
  // hàm trung gian vũ khí: G.weaponArt giả phải được gọi đúng tham số
  const calls = [];
  G.weaponArt = { draw: (cc, opts, x0, y0, ang, pull) => { calls.push([opts, x0, y0, ang, pull]); } };
  G.art.hero(c, { x: 50, y: 50, face: 1, key: 'hunter', weapon: { type: 'bow', coat: 'ice', branch: 'fire', tier: 2, marks: { fire: 0, poison: 0, ice: 0 } }, anim: 'atk', f: 3, atk: -1, dodge: -1 });
  const q = calls[0];
  ok('G.weaponArt được gọi', calls.length === 1);
  if (q) ok('tham số vũ khí đúng', q[0].type === 'bow' && q[0].family === 'ice' && q[0].branch === 'fire' && q[0].rarity === 2 && q[0].mood === 'attack' && isFinite(q[1]) && isFinite(q[2]) && isFinite(q[3]) && q[4] > 0.5);
  G.weaponArt = { draw: () => { throw new Error('giả lỗi'); } };
  try { G.art.hero(c, { x: 50, y: 50, face: 1, key: 'hunter', weapon: W, atk: -1, dodge: -1 }); } catch (e) { out.bad.push('G.weaponArt lỗi làm sập hero'); }
  delete G.weaponArt;
  const info = TL.info({ key: 'smith', weapon: W, anim: 'atk', f: 4, v: 0 });
  ok('info trả đủ trường', info && ['type', 'x', 'y', 'ang', 'pull', 'front', 'mood'].every((k) => k in info));
  ok('giữ hàm cũ', typeof G.art.heroOld === 'function' && G.art.heroOld !== G.art.hero);
  out.info = info; out.avgMs = +(out.sumMs / out.frames).toFixed(2); out.maxMs = +out.maxMs.toFixed(1); delete out.sumMs;
  out.cache = TL.cacheSize();
  return out;
}
"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 960, 'height': 540})
    warns = []
    pg.on('pageerror', lambda e: warns.append(str(e)))
    pg.on('console', lambda m: warns.append(m.text) if m.type in ('error', 'warning') and 'ERR_' not in m.text and 'giả lỗi' not in m.text and 'G.weaponArt lỗi' not in m.text else None)
    pg.goto('file://' + os.path.join(HERE, 'thu.html')); pg.wait_for_timeout(1500)
    r = pg.evaluate(JS); b.close()
print(json.dumps(r, ensure_ascii=False, indent=1))
if warns: print('CẢNH BÁO TRONG TRANG:', warns[:6])
sys.exit(1 if r['bad'] or warns else 0)
