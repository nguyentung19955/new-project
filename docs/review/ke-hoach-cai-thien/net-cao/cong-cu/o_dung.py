"""Ô nào của bản to Cu Tí (zed-moi, tam_to) game THẬT SỰ vẽ khi chơi mặc định: chạy bot (tests/bot.js) qua vài ải với từng vũ khí,
vẽ mỗi 2 nhịp, ghi mọi lệnh drawImage lấy từ ảnh bản to → danh sách ô (chỉ số o_cua). Dùng để dựng bản nét cao chỉ cho ô có dùng.
  python3 o_dung.py [url]   → ra/o-dung.json"""
import json, os, sys
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..', 'game'))
URL = sys.argv[1] if len(sys.argv) > 1 else 'file://' + GAME + '/dist/linh-khi.html?cloud=0'
os.makedirs(os.path.join(HERE, 'ra'), exist_ok=True)
GHI = r'''() => {
  const P0 = CanvasRenderingContext2D.prototype.drawImage;
  window.__O = {};
  CanvasRenderingContext2D.prototype.drawImage = function (img) {
    const z = window.G && G.spriteCustom && G.spriteCustom.zed && G.spriteCustom.zed['zed-moi'];
    if (z && z._to && img === z._to.img && arguments.length === 9) {
      const t = z.tep.to, j = Math.floor(arguments[2] / t.o) * t.cot + Math.floor(arguments[1] / t.o);
      window.__O[j] = (window.__O[j] || 0) + 1;
    }
    return P0.apply(this, arguments);
  };
}'''
CHAY = r'''([melee, r, i, giay]) => {
  window.requestAnimationFrame = () => 0;
  G.testSave({ lvl: 14, melee });
  G.startStage(r, i, 0);
  let n = 0, err = null, s = 0;
  // ép thêm các động tác bot ít làm: chiêu đặc biệt (L), chưởng (I), giữ đòn (giữ J), lộn (K), đấm tay không (đổi vũ khí rỗng)
  if (!G.__bi) G.__bi = G.botInput;
  G.botInput = (S) => { const q = G.__bi(S), k = s % 240;
    if (k === 0) q.specialP = true; if (k === 50) q.skillP = true; if (k === 90) q.dodgeP = true;
    if (k >= 120 && k < 200) { q.atk = true; q.atkP = k === 120; } return q; };
  for (s = 0; s < 60 * giay; s++) {
    const S = G.getRun(); if (!S) break;
    if (S.mode !== 'play') { if (S.mode === 'result' || S.mode === 'dead') break; G.botRun(1); continue; }
    S.W.P.hp = Math.max(S.W.P.hp, S.W.P.maxhp * 0.6);
    if (s % 300 === 150) { S.W.P.hurtT = 0.2; } // trúng đòn
    if (s % 211 === 100) { S.W.P.cur = 1 - (S.W.P.cur | 0); } // đổi sang phi tiêu rồi đổi lại
    G.tick(); G.click = null;
    if (s % 2 === 0) { try { G.ui.begin(); G.scene.draw(); n++; } catch (e) { err = String(e.stack || e); break; } }
  }
  const P = G.getRun() && G.getRun().W.P; // chết: vẽ hết hoạt cảnh
  if (P && G.getRun().mode === 'play') { P.hp = 0; for (let j = 0; j < 90; j++) { try { G.tick(); G.ui.begin(); G.scene.draw(); } catch (e) { break; } } }
  G.botInput = G.__bi;
  return { n, err };
}'''
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 844, 'height': 390})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.add_init_script('(' + GHI + ')()')
    pg.goto(URL); pg.wait_for_timeout(1000)
    for f in ('setup.js', 'bot.js'):
        pg.add_script_tag(path=os.path.join(GAME, 'tests', f))
    pg.wait_for_function("() => window.G && G.spriteCustom && G.spriteCustom.zed && G.spriteCustom.zed['zed-moi'] && G.spriteCustom.zed['zed-moi'].ready", timeout=60000)
    # lần vẽ đầu bắt đầu tải bản to
    pg.evaluate(CHAY, ['sword', 0, 0, 1]); pg.wait_for_timeout(800)
    for melee in ('sword', 'spear', 'hammer'):
        for r, i in ((0, 0), (1, 1), (2, 2)):
            print(melee, r, i, pg.evaluate(CHAY, [melee, r, i, 150]), pg.evaluate('() => Object.keys(window.__O).length'), flush=True)
    o = pg.evaluate('() => window.__O')
    meta = pg.evaluate("() => { const t = G.spriteCustom.zed['zed-moi'].tep.to; return { o_cua: t.o_cua, cot_goc: t.cot_goc }; }")
    j2i = {v: k for k, v in enumerate(meta['o_cua']) if v >= 0}
    dung = sorted(j2i[int(j)] for j in o)
    hang = sorted({i // meta['cot_goc'] for i in dung})
    json.dump({'o': dung, 'hang': hang, 'lan': {str(j2i[int(j)]): v for j, v in o.items()}, 'tong_o_to': len(j2i)}, open(os.path.join(HERE, 'ra', 'o-dung.json'), 'w'))
    print('ô dùng', len(dung), '/', len(j2i), 'hàng', hang, 'lỗi', errs[:3])
    b.close()
