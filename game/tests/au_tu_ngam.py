"""AUDIT chiến đấu — tự ngắm có quay ngược về quái phía sau khi đang chạy / né khỏi trùm không (góp ý ChatGPT mục 3.4, 3.3 ý cuối).
  cd game && python3 tests/au_tu_ngam.py
Tình huống dựng sẵn (không sửa game, bia đứng yên):
  - "Trùm" = bia máu dày ở phía ĐÔNG (bên phải) em bé. Em bé đẩy cần sang TÂY (trái) để chạy khỏi trùm.
  - Một quái nhỏ đứng quanh em bé ở góc θ (0 = phía đông, sau lưng lúc đang chạy; 180 = phía tây, trước mặt).
  - Em bé làm một động tác (Nhát lướt sau khi Né, chuỗi kiếm, Xốc tới của giáo, bắn cung, Trảm Nguyệt, nện búa lấy đà),
    ghi lại hướng đòn (P.aimX) và em bé bị kéo dịch về phía đông (về phía trùm) bao nhiêu điểm ảnh.
Ghi JSON vào /tmp/au_tu_ngam.json."""
import os, sys, json, math
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS = r"""
([act, th, dist, noMob]) => {
  const melee = { glide: 'sword', chain: 'sword', lunge: 'spear', bow: 'sword', special: 'sword', slam: 'hammer' }[act];
  const { W, P } = AU.room({ melee, lvl: 10 });
  AU.want(P, act === 'bow' ? 'bow' : melee);
  P.x = W.geo.cx; P.y = W.geo.cy; P.face = -1; P.dodgeCd = 0; P.mana = P.maxmana;
  const boss = AU.dummy(P.x + 70, P.y, { hp: 1e7, role: 'elite' }); // "trùm" phía đông
  const pins = [{ e: boss, x: boss.x, y: boss.y }];
  const I = AU.inp;
  I.mx = -1; I.my = 0; // chạy sang tây, khỏi trùm
  AU.run(20);           // đang chạy
  if (act === 'glide') { I.dodgeP = true; AU.run(1); while (P.dodgeT > 0) AU.run(1); }
  // đòn giữ-thả: lấy đà trước (vẫn đẩy cần), đặt quái rồi mới thả
  if (act === 'lunge') for (let k = 0; k < 45; k++) { I.atk = true; AU.run(1); }
  if (act === 'slam') for (let k = 0; k < 80; k++) { I.atk = true; AU.run(1); }
  // đặt quái nhỏ quanh em bé lúc ra đòn
  let mob = null;
  if (!noMob) {
    const a = th * Math.PI / 180, mx = P.x + Math.cos(a) * dist, my = P.y + Math.sin(a) * dist * 0.85;
    mob = AU.dummy(mx, my, { hp: 1e7 }); pins.push({ e: mob, x: mob.x, y: mob.y });
  }
  if (act === 'bow') { const far = AU.dummy(P.x - 120, P.y, { hp: 1e7 }); pins.push({ e: far, x: far.x, y: far.y }); }
  const x0 = P.x, y0 = P.y, bd0 = Math.hypot(boss.x - P.x, boss.y - P.y);
  let hitMob = false, hitBoss = false, arrowVx = null;
  const d0 = G.damage;
  G.damage = function (t, a, o) { if (t === mob) hitMob = true; if (t === boss) hitBoss = true; return d0(t, a, o); };
  try {
    if (act === 'glide' || act === 'chain') { I.atk = true; I.atkP = true; AU.run(1); I.atk = false; }
    else if (act === 'bow') { I.atk = true; I.atkP = true; AU.run(1); I.atk = false; AU.run(1); }
    else if (act === 'lunge' || act === 'slam') { I.atk = false; AU.run(1); }
    else if (act === 'special') { I.specialP = true; AU.run(1); }
    const ax = P.aimX, ay = P.aimY;
    AU.run(30, false, () => { AU.pin(pins); const ar = W.projs.find((o) => o.team === 'player'); if (ar && arrowVx == null) arrowVx = ar.vx; });
    const ux = act === 'bow' ? (arrowVx == null ? null : Math.sign(arrowVx)) : ax;
    return { act, th, dist, noMob, aimX: ux == null ? null : +ux.toFixed(2), aimY: ay == null ? null : +ay.toFixed(2), moveEast: +(P.x - x0).toFixed(1), bossCloser: +(bd0 - Math.hypot(boss.x - P.x, boss.y - P.y)).toFixed(1), hitMob, hitBoss, face: P.face };
  } finally { G.damage = d0; }
}
"""


def main():
    errs = []
    out = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        for f in ['bot.js', 'setup.js', 'au_lib.js']:
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
        acts = [('glide', 25), ('chain', 22), ('lunge', 40), ('bow', 60), ('special', 60), ('slam', 30)]
        names = {'glide': 'Nhát lướt (sau Né)', 'chain': 'Chuỗi kiếm', 'lunge': 'Xốc tới (giáo giữ-thả)', 'bow': 'Bắn cung (bấm)', 'special': 'Trảm Nguyệt', 'slam': 'Búa lấy đà'}
        for act, dist in acts:
            print('== %s, quái nhỏ cách %d điểm ảnh; cần đẩy sang TÂY; trùm ở ĐÔNG' % (names[act], dist))
            base = pg.evaluate(JS, [act, 0, dist, True])
            print('   không có quái nhỏ: hướng đòn x=%s, bị kéo về phía trùm %+.1f' % (base['aimX'], base['bossCloser']))
            out.append(base)
            for th in [0, 45, 90, 135, 180, 225, 270, 315]:
                r = pg.evaluate(JS, [act, th, dist, False])
                out.append(r)
                back = r['aimX'] is not None and r['aimX'] > 0.3
                print('   quái ở góc %3d°: hướng đòn x=%5s  dịch về phía trùm %+6.1f  %s' % (th, r['aimX'], r['bossCloser'], 'QUAY NGƯỢC về phía đông' if back else ''))
            sys.stdout.flush()
        b.close()
    if errs:
        print('LỖI JS:', errs[:5]); sys.exit(1)
    json.dump(out, open('/tmp/au_tu_ngam.json', 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
