"""AUDIT chiến đấu — đo DPS thực tế, số đòn hạ quái, thời gian bị khoá và chỗ huỷ đòn bằng Né (góp ý ChatGPT mục 3.2).
Không sửa game: dựng phòng trống, đặt bia đứng yên, bơm nút bấm theo kịch bản (không dùng bot) rồi đếm sát thương.
  cd game && python3 tests/au_dps.py [giây=15]
In bảng và ghi JSON vào /tmp/au_dps.json (để chép vào docs/review/AUDIT-CHIEN-DAU.md).
Hai chế độ thời gian:
  - "logic": G.sim, không vẽ, không có khựng hình (hit-stop) — đúng như bot và tests/dps.py đo.
  - "thật":  chạy như lúc có vẽ (fx.js bật) nên mỗi đòn trúng làm thế giới đứng 45–115 ms: đây là nhịp người chơi cảm thấy."""
import os, sys, json
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECS = int(sys.argv[1]) if len(sys.argv) > 1 else 15

# Kịch bản bấm cho mỗi lối đánh: trả về hàm each(i) đặt nút cho khung i.
JS_DPS = r"""
([mode, secs, fx, group]) => {
  const melee = { sword: 'sword', swordTap: 'sword', spear: 'spear', spearLunge: 'spear', hammer: 'hammer', hammerCharge: 'hammer', bow: 'sword', bowCharge: 'sword' }[mode];
  const type = mode.startsWith('bow') ? 'bow' : melee;
  const { W, P } = AU.room({ melee, lvl: 10, tier: 1, sharpen: 3 });
  AU.want(P, type);
  P.x = W.x0 + 40; P.y = W.geo.cy; P.face = 1;
  const far = type === 'bow' ? 80 : type === 'spear' ? 40 : 20;
  const pins = [];
  const spots = group ? [[far, 0], [far + 6, -14], [far + 6, 14], [far + 16, -6], [far + 16, 8], [far + 24, 0]] : [[far, 0]];
  for (const s of spots) { const x = P.x + s[0], y = P.y + s[1]; pins.push({ e: AU.dummy(x, y, { hp: 1e7 }), x, y }); }
  const px = P.x, py = P.y;
  let n = 0;
  const each = (i) => {
    AU.pin(pins);
    P.mana = 0; // không cho dùng đòn Đặc biệt hay chưởng: chỉ đo nút Đánh
    if (mode === 'spearLunge' || mode === 'sword' || mode === 'swordTap') { if (P.dashT <= 0) { P.x = px; P.y = py; } } // lướt / xốc qua bia thì kéo về chỗ cũ
    const I = AU.inp;
    if (mode === 'sword') { I.atk = true; I.atkP = i === 0; }                  // kiếm: giữ nút = chuỗi liên tục
    else if (mode === 'swordTap') { I.atk = i % 4 === 0; I.atkP = i % 4 === 0; }  // kiếm: bấm liên tục mỗi 4 khung
    else if (mode === 'bow' || mode === 'spear' || mode === 'hammer') { I.atk = i % 4 === 0; I.atkP = i % 4 === 0; } // bấm nhịp (bộ nhớ 0,25 giây giữ lượt bấm)
    else {
      // giữ đến đầy rồi thả. Thời gian giữ: cung 0,16+0,75; búa 0,16+1,1 (nấc 2); giáo 0,16+0,5
      const hold = { bowCharge: 0.95, hammerCharge: 1.3, spearLunge: 0.7 }[mode];
      const busy = P.atkT > 0 || P.dashT > 0 || P.cdT > 0;
      if (!P.mv || !P.mv.holding) { if (!busy) { I.atk = true; } else I.atk = false; }
      else if (P.mv.chargeT >= hold - 0.16) I.atk = false; else I.atk = true;
    }
  };
  const r = AU.count(() => AU.run(secs * 60, fx, each));
  // thời gian thật (khung) = số khung đã chạy; khựng hình làm thế giới đứng yên nên cùng số khung ít đòn hơn
  const hitT = r.list.filter((x) => x.src === 'hit');
  return { mode, type, group, fx, dps: r.dmg / secs, hits: r.hits, perHit: r.hits ? r.dmg / r.hits : 0, perHitBase: G.pDamage(P, G.curW(P)), swings: hitT.length };
}
"""

# Số đòn hạ từng loại quái ở cấp tương đương. Quái thật (hình mới), đứng yên (bị choáng), em bé đánh mặt trước.
JS_KILL = r"""
([cfg, type, role]) => {
  const melee = type === 'bow' ? 'sword' : type;
  const { W, P } = AU.room({ melee, lvl: cfg.lvl, tier: cfg.tier, sharpen: cfg.sharpen, region: cfg.r, stage: 0 });
  AU.want(P, type);
  P.x = W.x0 + 40; P.y = W.geo.cy; P.face = 1;
  const far = type === 'bow' ? 80 : type === 'spear' ? 40 : 22;
  const e = G.spawnEnemy(role, P.x + far, P.y, {});
  e.inside = true; e.spawnT = 0; e.face = -1;
  const ex = e.x, ey = e.y;
  let presses = 0, t = 0;
  const each = (i) => {
    if (e.dead) return false;
    e.st.stun = 9; e.x = ex; e.y = ey; e.face = -1; e.hidden = false; e.dive = null; e.spikeUp = 0;
    P.mana = 0; P.x = W.x0 + 40; P.y = W.geo.cy;
    const I = AU.inp;
    if (type === 'sword') { I.atk = true; I.atkP = i === 0; }
    else { I.atk = i % 4 === 0; I.atkP = I.atk; }
    t++;
  };
  const r = AU.count(() => AU.run(60 * 60, false, each));
  return { role, type, hp: Math.round(e.maxhp), hits: r.hits, time: t / 60, per: G.pDamage(P, G.curW(P)), dead: e.dead };
}
"""

# Thời gian bị khoá và chỗ huỷ được bằng Né: thử bấm Né ở từng khung của động tác.
JS_LOCK = r"""
([mode]) => {
  const melee = { sword1: 'sword', sword3: 'sword', glide: 'sword', spearTap: 'spear', spearSweep: 'spear', spearLunge: 'spear', hammerTap: 'hammer', hammerSlam: 'hammer', bowTap: 'sword', bowCharge: 'sword', special: 'sword', chuong: 'sword' }[mode];
  const type = mode.startsWith('bow') ? 'bow' : melee;
  const setup = () => {
    const { W, P } = AU.room({ melee, lvl: 10 });
    AU.want(P, type);
    P.x = W.x0 + 60; P.y = W.geo.cy; P.face = 1; P.mana = P.maxmana;
    AU.dummy(P.x + 30, P.y, { hp: 1e7 });
    return { W, P };
  };
  // dựng tới đúng đầu động tác cần đo, trả về true khi động tác vừa bắt đầu
  function start(P) {
    const I = AU.inp, MV = () => P.mv || {};
    if (mode === 'sword1') { I.atk = true; I.atkP = true; AU.run(1); I.atk = false; return; }
    if (mode === 'sword3') { // tới nhát thứ 3 (Nhát kết)
      for (let k = 0; k < 120 && !(MV().step === 2 && P.atkT > 0); k++) { I.atk = true; AU.run(1); }
      I.atk = false; return;
    }
    if (mode === 'glide') { I.dodgeP = true; AU.run(1); for (let k = 0; k < 40 && P.dodgeT > 0; k++) AU.run(1); I.atk = true; I.atkP = true; AU.run(1); I.atk = false; return; }
    if (mode === 'spearTap') { I.atk = true; I.atkP = true; AU.run(1); I.atk = false; AU.run(1); return; }
    if (mode === 'spearSweep') { for (let k = 0; k < 200 && !(MV().kind === 'quet' && P.atkT > 0); k++) { I.atk = k % 4 === 0; I.atkP = I.atk; AU.run(1); } I.atk = false; return; }
    if (mode === 'hammerTap') { I.atk = true; I.atkP = true; AU.run(1); I.atk = false; AU.run(1); return; }
    if (mode === 'bowTap') { I.atk = true; I.atkP = true; AU.run(1); I.atk = false; AU.run(1); return; }
    if (mode === 'spearLunge' || mode === 'hammerSlam' || mode === 'bowCharge') {
      const hold = { bowCharge: 1.0, hammerSlam: 1.35, spearLunge: 0.75 }[mode];
      for (let k = 0; k < hold * 60; k++) { I.atk = true; AU.run(1); }
      I.atk = false; AU.run(1); return;
    }
    if (mode === 'special') { I.specialP = true; AU.run(1); return; }
    if (mode === 'chuong') { I.skillP = true; I.skill = true; AU.run(1); I.skill = false; return; }
  }
  // một lượt dài: ghi các mốc của động tác
  let { P } = setup();
  start(P);
  const t0 = G.time, rows = [];
  for (let k = 0; k < 90; k++) {
    rows.push({ k, atkT: +P.atkT.toFixed(3), cdT: +P.cdT.toFixed(3), dashT: +P.dashT.toFixed(3), slow: P.atkT > 0 ? 0.4 : 1, hold: !!(P.mv && P.mv.holding), castT: +(P.castT || 0).toFixed(3) });
    AU.run(1);
  }
  const busyAnim = rows.filter((r) => r.atkT > 0).length; // khung còn trong động tác (đi chậm 0,4)
  const busyCd = rows.filter((r) => r.cdT > 0).length;    // khung chưa ra được đòn mới
  const busyDash = rows.filter((r) => r.dashT > 0).length; // khung mất điều khiển hẳn (đang lướt)
  // thử Né ở từng khung kể từ đầu động tác
  const deny = [];
  for (let k = 0; k < Math.max(busyAnim, busyDash) + 2; k++) {
    ({ P } = setup());
    start(P);
    P.dodgeCd = 0;
    AU.run(k);
    AU.inp.dodgeP = true; AU.inp.atk = false;
    AU.run(1);
    if (!(P.dodgeT > 0)) deny.push(k);
  }
  return { mode, anim: busyAnim / 60, cd: busyCd / 60, dash: busyDash / 60, deny: deny.map((k) => k), dodgeOk: Math.max(busyAnim, busyDash) + 2 - deny.length };
}
"""

STAGES = [
    ('Ải 1-1, cấp 1, Thường +0 (sức mạnh 98/100)', dict(r=0, lvl=1, tier=0, sharpen=0)),
    # gần "Sức mạnh khuyên dùng" của ải (G.STAGE_REC 100 / 245 / 425); chưa mặc trang phục nên ải 3-1 chỉ đạt khoảng 83%
    ('Ải 2-1, cấp 22, Tím +6 (sức mạnh 225/245)', dict(r=1, lvl=22, tier=2, sharpen=6)),
    ('Ải 3-1, cấp 40, Vàng +10 (sức mạnh 353/425)', dict(r=2, lvl=40, tier=3, sharpen=10)),
]
ROLES = ['rusher', 'swarm', 'shield', 'archer', 'nimble', 'kami', 'bomber', 'spiky', 'elite']
RNAME = {'rusher': 'Lính xông', 'swarm': 'Bầy nhỏ', 'shield': 'Khiên (đánh mặt trước)', 'archer': 'Xạ thủ', 'nimble': 'Nhanh nhẹn', 'kami': 'Cảm tử', 'bomber': 'Đặt bom', 'spiky': 'Gai', 'elite': 'Tinh anh'}


def main():
    out = {'dps': [], 'kill': [], 'lock': []}
    errs = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_function('window.G && G.scene')
        for f in ['bot.js', 'setup.js', 'au_lib.js']:
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
        print('== DPS trên bia đứng yên (cấp 10, Lam +3, không hệ, không Đặc biệt/chưởng), %d giây' % SECS)
        print('%-13s %-6s %9s %9s %7s %9s' % ('lối đánh', 'bia', 'logic', 'thật', 'đòn', 'st/đòn'))
        for mode in ['sword', 'swordTap', 'spear', 'spearLunge', 'hammer', 'hammerCharge', 'bow', 'bowCharge']:
            for group in [False, True]:
                a = pg.evaluate(JS_DPS, [mode, SECS, False, group])
                f = pg.evaluate(JS_DPS, [mode, SECS, True, group])
                out['dps'].append({'mode': mode, 'group': group, 'logic': a['dps'], 'real': f['dps'], 'hits': a['hits'], 'hitsReal': f['hits'], 'perHit': a['perHit'], 'base': a['perHitBase']})
                print('%-13s %-6s %9.1f %9.1f %7d %9.1f' % (mode, 'cụm 6' if group else '1 con', a['dps'], f['dps'], a['hits'], a['perHit']))
                sys.stdout.flush()
        print('\n== Số đòn (lần trúng) để hạ một con, quái thật đứng yên')
        for name, cfg in STAGES:
            print('--', name)
            print('%-24s %7s %7s %7s %7s %7s' % ('quái', 'máu', 'kiếm', 'giáo', 'búa', 'cung'))
            for role in ROLES:
                row = {'stage': name, 'role': role}
                cells = []
                for t in ['sword', 'spear', 'hammer', 'bow']:
                    r = pg.evaluate(JS_KILL, [cfg, t, role])
                    row[t] = r['hits'] if r['dead'] else None
                    row[t + 'T'] = r['time']
                    row['hp'] = r['hp']
                    cells.append(('%d' % r['hits']) + ('' if r['dead'] else '+'))
                out['kill'].append(row)
                print('%-24s %7d %7s %7s %7s %7s' % (RNAME[role], row['hp'], *cells))
                sys.stdout.flush()
        print('\n== Thời gian động tác, bị khoá, chỗ huỷ bằng Né (khung 1/60 giây)')
        print('%-11s %8s %8s %8s %s' % ('động tác', 'đi chậm', 'chờ đòn', 'mất đk', 'khung KHÔNG né được'))
        for mode in ['sword1', 'sword3', 'glide', 'spearTap', 'spearSweep', 'spearLunge', 'hammerTap', 'hammerSlam', 'bowTap', 'bowCharge', 'special', 'chuong']:
            r = pg.evaluate(JS_LOCK, [mode])
            out['lock'].append(r)
            print('%-11s %8.2f %8.2f %8.2f %s' % (mode, r['anim'], r['cd'], r['dash'], r['deny']))
            sys.stdout.flush()
        b.close()
    if errs:
        print('LỖI JS:', errs[:5]); sys.exit(1)
    json.dump(out, open('/tmp/au_dps.json', 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
