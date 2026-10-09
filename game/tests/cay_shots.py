"""Chụp ảnh "Sức mạnh khuyên dùng" và chỉ số "Sức mạnh" vào docs/can-bang-cay/: tranh bản đồ của Chú Lái Đò (thẻ ải),
bảng hero của Ông Từ, dải trên ở làng, thanh trên khi vào ải. Chạy từ thư mục game: python3 tests/cay_shots.py
Cần Playwright và Chromium."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
import ui_lib
from ui_lib import Game, ROOT

OUT = os.path.join(os.path.dirname(ROOT), 'docs', 'can-bang-cay')
os.makedirs(OUT, exist_ok=True)
ui_lib.SIZES['dt'] = dict(viewport={'width': 844, 'height': 390}, has_touch=True, is_mobile=True, device_scale_factor=2)
# bản lưu giữa vùng hai: qua 1-1 .. 2-2, đang nhắm ải 2-3 và trùm Ngư Tinh
SAVE = """(() => { G.resetSave(); const s = G.save; s.sound = false; s.gold = 820; s.ore = 31; s.stones = 2; s.mats = [14, 9, 0]; s.shards = [3, 0, 0];
  s.heroes.smith.lvl = 12; s.heroes.smith.sk = { atk: 2, def: 1, elem: 1 }; s.heroes.hunter.unlocked = true; s.heroes.hunter.lvl = 4;
  const a = G.weaponById(s.carry[0]); a.rarity = 2; a.tier = 2; a.marks.fire = 70; a.branch = 'fire'; a.sharpen = 6; G.fitAffixes(a);
  const b = G.weaponById(s.carry[1]); b.rarity = 1; b.tier = 1; b.sharpen = 4; G.fitAffixes(b);
  s.owned.armor = ['a_r1', 'a_moc']; s.armor = 'a_moc'; s.owned.helm = ['h_r1']; s.helm = 'h_r1'; s.forge = 2;
  for (let i = 0; i < 7; i++) s.stars[Math.floor(i / 5) + '-' + (i % 5)] = 2 + (i % 2);
  s.tut.done = true; G.setScene(G.Village); })()"""

def main():
    errs = []
    with sync_playwright() as p:
        g = Game(p, 'dt')
        g.pg.on('pageerror', lambda e: errs.append(str(e)))
        ev = g.ev
        V, VS = 'G.villageApi.V', 'G.villageScene'
        def shot(name, wait=300):
            g.wait(wait); g.pg.screenshot(path=os.path.join(OUT, name + '.png')); print('đã chụp', name)
        def talk(k): ev(f"{VS}.goNpc('{k}', true)"); g.wait(500)
        def home(): ev("G.keyP.Escape = true"); g.wait(250)
        g.wait(600); g.tap(240, 150); g.wait(1500)
        ev(SAVE); g.wait(1500)
        shot('lang-dai-tren-suc-manh')
        talk('lai'); ev(f"{V}.sel = [1, 2]"); shot('the-ai-suc-manh-khuyen-dung')
        ev(f"{V}.sel = [1, 4]"); shot('the-ai-trum-vung-thieu-suc-manh')
        ev(f"{V}.sel = [1, 1]"); shot('the-ai-du-suc-manh'); home()
        talk('tu'); shot('bang-hero-suc-manh'); home()
        ev("G.startStage(1, 2, 0)"); g.wait(2500); shot('trong-ai-thanh-tren-suc-manh')
        g.close()
    if errs: print('LỖI TRANG:', errs[:3]); sys.exit(1)

main()
