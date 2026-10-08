#!/usr/bin/env python3
"""Nạp thử sprite vào game thật và chụp ảnh hero đang đứng, chạy, chém trong một phòng.

    python tools/sprite/thu_trong_game.py

Cần Playwright và Chromium có sẵn trên máy. Không sửa file nào của game: file hero_sprite.js
được chèn vào trang lúc chạy thử. Kết quả: tools/sprite/out/trong-game.png
"""
import io
import sys
from pathlib import Path

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from gen_sprite import text  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "tools" / "sprite" / "out" / "trong-game.png"

SETUP = """(map) => {
  window.requestAnimationFrame = () => 0;   // dừng vòng lặp của game, tự điều khiển từng khung
  G.heroSpriteMap = map;
}"""
START = """([hero, melee]) => {
  G.resetSave(); const sv = G.save; sv.sound = false; sv.tut && (sv.tut.done = true);
  for (const k of G.HKEYS) sv.heroes[k].unlocked = true;
  sv.hero = hero;
  sv.weapons = []; sv.nextId = 1;
  const a = G.newWeapon(sv, melee, 1), b = G.newWeapon(sv, 'bow', 1);
  sv.carry = [a.id, b.id];
  G.startStage(0, 1, 0); G.gotoRoom(1);
  for (let i = 0; i < 40; i++) { G.tick(); G.click = null; }
  return { state: G.heroSprite.state(hero), key: G.getWorld().P.key };
}"""
# Đặt trạng thái người chơi rồi vẽ đúng một khung. cur = 0: vũ khí cận chiến, 1: cung.
POSE = """(o) => {
  const W = G.getWorld(), P = W.P;
  for (const e of W.enemies || []) { if (!o.keepEnemies) { e.dead = true; e.hidden = true; } }
  P.x = W.cam + 150; P.y = Math.round((W.y0 + W.y1) / 2) + 10; P.face = 1; P.hurtT = 0; P.inv = 0; P.dodgeT = 0; P.castT = 0; P.specT = 0;
  P.moving = !!o.move; P.t = o.t || 0; P.atkT = 0; P.cur = o.cur || 0;
  if (o.atk != null) { P.atkDur = 0.4; P.atkT = 0.4 * (1 - o.atk); P.comboI = o.combo || 0; }
  if (o.dodge != null) P.dodgeT = 0.27 * (1 - o.dodge);
  if (o.hurt) P.hurtT = 0.15;
  if (o.cast != null) P.castT = 0.4 * (1 - o.cast);
  G.ui.begin(); G.scene.draw();
  return { st: G.heroSprite.state(P.key), x: P.x - Math.round(W.cam), y: P.y };
}"""


def main():
    shots, errs = [], []
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={"width": 960, "height": 540})
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto((ROOT / "game" / "index.html").as_uri())
        pg.wait_for_timeout(1200)
        pg.evaluate(SETUP, {"smith": "thu-nguoi", "hunter": "thu-ho-con"})
        pg.add_script_tag(path=str(ROOT / "game" / "js" / "hero_sprite.js"))
        plan = [
            ("smith", "sword", [("Đứng", dict(t=0.1)), ("Chạy", dict(move=True, t=0.24)), ("Chém kiếm (nhịp 1)", dict(atk=0.5, combo=0)),
                                ("Chém kiếm (nhịp 3)", dict(atk=0.5, combo=2))]),
            ("smith", "hammer", [("Búa: lấy đà", dict(atk=0.3)), ("Búa: bổ xuống", dict(atk=0.5))]),
            ("hunter", "spear", [("Hổ con: đâm giáo", dict(atk=0.5)), ("Hổ con: kéo cung", dict(atk=0.35, cur=1))]),
        ]
        for hero, melee, poses in plan:
            info = pg.evaluate(START, [hero, melee])
            pg.evaluate(POSE, {})     # vẽ một khung để bộ nạp bắt đầu tải sprite của hero này
            pg.wait_for_timeout(500)  # chờ ảnh sprite nạp xong
            for label, o in poses:
                r = pg.evaluate(POSE, o)
                st = r["st"]
                pg.wait_for_timeout(60)
                png = pg.locator("#world").screenshot()
                shots.append((label, Image.open(io.BytesIO(png)).convert("RGB"), st, r["x"], r["y"]))
                print(hero, melee, label, "sprite:", st)
        br.close()
    if errs:
        print("LỖI TRANG:", errs[:5])
    # ghép: mỗi ô gồm ảnh cả phòng thu nhỏ và ảnh cận cảnh hero
    cols = 4
    cw, ch = 480, 270
    rows = (len(shots) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (cw + 8) + 8, rows * (ch + 34) + 40), (38, 34, 44))
    d = ImageDraw.Draw(sheet)
    text(d, (10, 8), "TRONG GAME: hero vẽ bằng sprite do công cụ tạo ra, vũ khí là vũ khí thật của game (A.weapon). Góc phải mỗi ô là ảnh cận cảnh.", 15)
    for i, (label, im, st, px, py) in enumerate(shots):
        x, y = 8 + (i % cols) * (cw + 8), 36 + (i // cols) * (ch + 34)
        k = im.width / 480.0
        small = im.resize((cw, ch), Image.Resampling.NEAREST)
        zoom = im.crop((int((px - 40) * k), int((py - 62) * k), int((px + 50) * k), int((py + 18) * k))).resize((180, 160), Image.Resampling.NEAREST)
        sheet.paste(small, (x, y))
        sheet.paste(zoom, (x + cw - 184, y + 4))
        d.rectangle([x + cw - 185, y + 3, x + cw - 4, y + 164], outline=(255, 210, 122))
        text(d, (x + 2, y + ch + 4), label + ("" if st == "ready" else "  (CHƯA nạp được sprite: %s)" % st), 14,
             fill=(255, 210, 122) if st == "ready" else (255, 120, 120))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT)
    print("Đã lưu", OUT)
    return 1 if errs or any(st != "ready" for _, _, st, _, _ in shots) else 0


if __name__ == "__main__":
    sys.exit(main())
