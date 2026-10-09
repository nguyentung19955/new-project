"""Chụp bảng thua có gợi ý "nên cày gì" vào docs/cay-nang-cap/: thua ở trùm Ngư Tinh (thiếu sức mạnh, còn điểm kỹ năng,
thiếu vàng để mài, thiếu vảy cá để nâng bậc), thua ở ải đầu vùng ba, và cảnh bấm một gợi ý thì về làng mở đúng người làng.
Chạy từ thư mục game: python3 tests/cay_nang_cap_shots.py (cần Playwright và Chromium). Thoát mã 1 nếu trang có lỗi."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
import ui_lib
from ui_lib import Game, ROOT

OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'cay-nang-cap')
os.makedirs(OUT, exist_ok=True)
ui_lib.SIZES['dt'] = dict(viewport={'width': 844, 'height': 390}, has_touch=True, is_mobile=True, device_scale_factor=2)
# bản lưu giữa vùng hai: qua 1-1 .. 2-4, còn điểm kỹ năng, thiếu vàng để mài, thiếu vảy cá để nâng bậc
SAVE = """(() => { G.resetSave(); const s = G.save; s.sound = false; s.gold = 520; s.ore = 31; s.stones = 1; s.mats = [14, 5, 0]; s.shards = [3, 0, 0];
  s.heroes.smith.lvl = 16; s.heroes.smith.xp = 300; s.heroes.smith.sk = { atk: 2, def: 1, elem: 1 }; s.heroes.hunter.unlocked = true; s.heroes.hunter.lvl = 4;
  const a = G.weaponById(s.carry[0]); a.rarity = 1; a.tier = 1; a.marks.fire = 70; a.branch = 'fire'; a.sharpen = 6; G.fitAffixes(a);
  const b = G.weaponById(s.carry[1]); b.rarity = 1; b.tier = 1; b.sharpen = 4; G.fitAffixes(b);
  s.forge = 3;
  for (let i = 0; i < 9; i++) s.stars[Math.floor(i / 5) + '-' + (i % 5)] = 2 + (i % 2);
  s.tut.done = true; })()"""
LOSE = "(() => { G.startStage(%d, %d, 0); const S = G.getRun(); S.P.hp = 0; S.W.over = 'dead'; G.sim(120); S.modeT = -9; return JSON.stringify(S.result.tips); })()"

def main():
    errs = []
    with sync_playwright() as p:
        g = Game(p, 'dt')
        g.pg.on('pageerror', lambda e: errs.append(str(e)))
        g.pg.on('console', lambda m: m.type == 'error' and 'ERR_' not in m.text and errs.append(m.text))
        ev = g.ev
        def shot(name, wait=400):
            g.wait(wait); g.pg.screenshot(path=os.path.join(OUT, name + '.png')); print('đã chụp', name)
        g.wait(600); g.tap(240, 150); g.wait(1500)
        ev(SAVE); g.wait(300)
        print(ev(LOSE % (1, 4)))
        shot('bang-thua-goi-y-trum-ngu-tinh')
        # bấm gợi ý thứ hai: về làng, mở đúng người
        g.tap(240, 86 + 23 + 10); g.wait(1200)
        print('mở:', ev("JSON.stringify({ who: G.villageApi.V.who, tab: G.villageApi.V.tab, ftab: G.villageApi.V.ftab, sel: G.villageApi.V.sel })"))
        shot('bam-goi-y-mo-nguoi-lang')
        ev("(() => { const s = G.save; s.stars['1-4'] = 2; s.heroes.smith.lvl = 21; s.heroes.smith.sk = { atk: 3, def: 2, elem: 2 }; s.gold = 900; s.mats = [10, 12, 3]; })()")
        print(ev(LOSE % (2, 0)))
        shot('bang-thua-goi-y-vung-ba')
        g.close()
    if errs:
        print('LỖI TRANG:', errs[:3]); sys.exit(1)

main()
