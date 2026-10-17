"""Đo HÌNH BÁO TRƯỚC có tắt đúng lúc không (chủ game 17/10: "Báo trước xong thì phải tắt đi chứ").
  cd game && python3 tests/bao_truoc_tat.py [tệp kết quả .json] [đuôi địa chỉ, vd "?baotat=0"]
Không sửa luật chơi. Mỗi cảnh dựng một phòng (quái thường, tinh anh, trùm nhỏ, trùm vùng; cả 4 vùng; Thuồng Luồng là trùm vùng 4),
em bé bất tử đi vòng chậm quanh giữa phòng, chạy THẬT và VẼ từng khung như game (G.tick + G.scene.draw), ghi:
  - mỗi hình báo trước (theo vùng báo của luật chơi, vòng gai, vòng chỗ quái mọc): khung đầu / khung cuối còn vẽ,
    phần "báo" (lấp dần), phần "chớp lúc nổ", phần "mờ khi huỷ";
  - lúc ĐÒN THẬT RA: vùng gây sát thương thì là lúc chính nó nổ; vùng chỉ để báo (không sát thương) thì là sự kiện đầu tiên của
    cùng con quái nằm trong vùng báo (vùng sát thương nổ, đạn bay ra, quái ra đòn, vật lăn / bóng xuất hiện);
  - hình còn hiện khi quái đã chết / đang choáng / trùm đã đổi pha.
Cảnh thêm: giết quái, làm choáng quái, đưa em bé sang phòng khác đúng lúc hình báo đang hiện.
In bảng và ghi JSON (mặc định /tmp/bao_truoc_tat.json)."""
import os, sys, json, time
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/bao_truoc_tat.json'
QS = sys.argv[2] if len(sys.argv) > 2 else ''
ONLY = os.environ.get('BTT_ONLY')  # lọc cảnh theo chuỗi con (để chạy nhanh khi sửa)
NGUONG = 0.1  # giây: mờ nhanh cho phép sau khi đòn ra

JS = r"""
([kind, r, art, mode, secs]) => {
  const D = window.BTD;
  const big = kind === 'mini' || kind === 'boss';
  const { S, W, P } = AU.room({ region: r, stage: kind === 'boss' ? 4 : kind === 'mini' ? 1 : 0, big, keepBoss: big, lvl: 30, tier: 2, seed: 11 });
  const h0 = G.hurtPlayer;
  G.hurtPlayer = function (dmg, el, src) { return false; };
  let e;
  const cx = W.geo.cx, cy = W.geo.cy;
  try {
    if (!big) {
      const role = kind === 'elite' ? 'elite' : Object.keys(G.MOB_ART).find((k) => k !== 'elite' && k !== 'mini' && k !== 'boss' && G.MOB_ART[k][r] === art);
      e = G.spawnEnemy(role, cx + 60, cy - 6, { art }); e.inside = true; e.cd = 0.4; if (kind === 'elite') e.skCd = 0.4;
    } else { e = W.boss; e.invuln = 0; e.busy = 0; e.intro = 0; e.cd = 0.3; }
    D.begin();
    const N = Math.round(secs * 60), sid = D.idOf(e);
    let doneAt = null, actT = null, info = { mode, actT: null };
    for (let i = 0; i < N; i++) {
      const t = i / 60, a = t * 0.8;
      P.x = cx - 30 + Math.cos(a) * 40; P.y = cy + Math.sin(a) * 22; P.hp = P.maxhp; P.inv = 0; P.dead = false; if (S.W) S.W.over = null;
      if (mode === 'tu-nhien' && big && e && !e.dead) {
        if (kind === 'boss' && i === Math.round(N * 0.34)) e.hp = Math.round(e.maxhp * 0.6);
        if (kind === 'boss' && i === Math.round(N * 0.67)) e.hp = Math.round(e.maxhp * 0.3);
        if (kind === 'mini' && i === Math.round(N * 0.5)) e.hp = Math.round(e.maxhp * 0.45);
      }
      if (mode !== 'tu-nhien' && actT == null) {
        // hình báo của con này đã hiện ≥ 0,25 giây và khung trước còn vẽ → ra tay
        const now = +(G.time - D.t0).toFixed(4);
        const rr = [...D.rec.values()].find((q) => q.s === sid && q.lastTele != null && now - q.lastTele < 0.02 && now - q.first >= 0.25);
        if (rr) {
          actT = now; info.actT = now; info.key = rr.key;
          if (mode === 'chet') { e.hp = 0; G.kill(e, {}); }
          else if (mode === 'choang') { e.st.stun = Math.max(e.st.stun || 0, 1.5); }
          else if (mode === 'roi-phong') {
            const id = S.map.rooms.findIndex((q, j) => j !== S.idx && q.type !== 'boss');
            info.room = [S.idx, id]; G.gotoRoom(id >= 0 ? id : 0);
          }
          doneAt = i;
        }
      }
      D.frame();
      if (mode === 'roi-phong' && actT != null) { const now = +(G.time - D.t0).toFixed(4); if ([...D.rec.values()].some((q) => q.first <= actT && q.last > actT)) info.visAfter = Math.max(info.visAfter || 0, now - actT); }
      if (doneAt != null && i - doneAt > 180) break; // 3 giây sau khi ra tay: đủ để vùng còn nổ thật kịp nổ
    }
    const res = D.result();
    return { kind, r, art: e.art, name: e.name || null, mode, info, res, ev: D.ev.length };
  } finally { G.hurtPlayer = h0; }
}
"""


def cases(arts):
    out = []
    for r in range(4):
        for role in ['rusher', 'swarm', 'shield', 'archer', 'nimble', 'kami', 'bomber', 'spiky']:
            out.append(('mob', r, arts[role][r]))
        for a in arts['elite'][r]: out.append(('elite', r, a))
        out.append(('mini', r, arts['mini'][r]))
        out.append(('boss', r, None))
    return out


def main():
    errs = []
    allres = []
    t_start = time.time()
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 844, 'height': 390})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html' + (QS if QS.startswith('?') else ('?' + QS if QS else '')))
        pg.wait_for_function('window.G && G.scene')
        pg.wait_for_timeout(1500)
        pg.evaluate("window.requestAnimationFrame = () => 0")
        for f in ['bot.js', 'setup.js', 'au_lib.js', 'bao_truoc_tat_lib.js']:
            pg.add_script_tag(path=os.path.join(ROOT, 'tests', f))
        arts = pg.evaluate("() => G.MOB_ART")
        for kind, r, art in cases(arts):
            modes = [('tu-nhien', 70 if kind == 'boss' else 40 if kind == 'mini' else 22)]
            modes += [('chet', 14), ('choang', 14)] + ([('roi-phong', 14)] if kind != 'boss' else [])
            for mode, secs in modes:
                tag = '%s/%d/%s/%s' % (kind, r, art, mode)
                if ONLY and ONLY not in tag: continue
                try:
                    o = pg.evaluate(JS, [kind, r, art, mode, secs])
                except Exception as e:
                    print('LỖI', tag, str(e)[:300]); errs.append(tag + ' ' + str(e)[:200]); continue
                allres.append(o)
                tre = [x for x in o['res'] if x['sau'] is not None and x['sau'] > NGUONG + 1e-6]
                st = {k: 0 for k in ['chet', 'choang', 'doiPha']}
                for x in o['res']:
                    if x['vanRa']: continue  # đòn vẫn ra thật sau đó (vật đã ném ra, vùng của trùm vẫn nổ): hình báo phải còn
                    for k, v in x['state'].items():
                        if k in st and v[1] - v[0] > NGUONG + 1e-6: st[k] += 1
                print('%-34s hình %3d | còn hiện > %.1fs sau khi đòn ra: %2d (lâu nhất %.2fs) | khi chết %d, choáng %d, đổi pha %d%s' % (
                    tag, len(o['res']), NGUONG, len(tre), max([x['sau'] for x in tre] or [0]), st['chet'], st['choang'], st['doiPha'],
                    (' | rời phòng còn hiện %.2fs' % o['info'].get('visAfter', 0)) if mode == 'roi-phong' else ''))
                sys.stdout.flush()
        b.close()
    json.dump({'qs': QS, 'res': allres, 'errs': errs}, open(OUT, 'w'), ensure_ascii=False)
    print('xong %.0fs, lỗi JS: %s' % (time.time() - t_start, errs[:5] or 0))
    if errs: sys.exit(1)


if __name__ == '__main__':
    main()
