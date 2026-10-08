"""Tạo bản sao stage.js có nối bộ nút mới, để chạy thử. Không sửa file gốc.
Dùng: python3 tao_ban_thu.py <stage.js gốc> <file ra>
Ba đoạn thay dưới đây cũng chính là ba đoạn cần thay thật trong game/js/stage.js (xem BAO-CAO.md)."""
import sys

CU_1 = """    ui.rect(POT[0], POT[1], POT[2], POT[3], canDrink ? 'rgba(160,40,30,0.85)' : 'rgba(40,36,32,0.8)', canDrink ? '#e2b36a' : '#6a5a4a');
    ui.text(W.noPotion ? 'Bình: cấm' : 'Bình máu ×' + P.potions, POT[0] + POT[2] / 2, POT[1] + 13.5, { size: 7, align: 'center', bold: true, color: canDrink ? '#fff3da' : '#a89c8c' });
    ui.rect(PAU[0], PAU[1], PAU[2], PAU[3], 'rgba(40,36,32,0.8)', '#e2b36a');
    ui.text('Dừng', PAU[0] + PAU[2] / 2, PAU[1] + 13.5, { size: 7, align: 'center', bold: true });
"""
MOI_1 = """    const heldBox = (b) => [...G.pointers.values()].some((p) => p.role === 'ui' && hitBox({ x: p.sx, y: p.sy }, b));
    G.btnArt.draw(c, 'potion', POT[0] + 13, POT[1] + 11, 11, { count: P.potions, disabled: !canDrink, pressed: heldBox(POT) });
    ui.text(W.noPotion ? 'Cấm' : 'Bình máu', POT[0] + 28, POT[1] + 14, { size: 6.5, bold: true, color: canDrink ? '#fff3da' : '#a89c8c' });
    G.btnArt.draw(c, 'pause', PAU[0] + PAU[2] / 2 + 6, PAU[1] + 11, 10, { pressed: heldBox(PAU) });
"""
CU_2 = """      ui.rect(x, 3, 54, 35, on ? 'rgba(90,60,30,0.9)' : 'rgba(30,26,22,0.75)', on ? '#ffd27a' : '#6a5a4a');
"""
MOI_2 = """      // Khung ô vũ khí cùng bộ với nút. Hình vũ khí và chữ vẫn do game vẽ ở các dòng dưới.
      G.btnArt.slot(c, x, 3, 54, 35, {
        weapon: { type: w.type, branch: G.activeEl(P, w), stage: G.wStage(w), rarity: w.rarity != null ? w.rarity : w.tier },
        active: on, cd: on ? 0 : P.swapCd / 1.5, icon: false, gem: false, id: 'slot' + i,
      });
"""
CU_3 = """      const joy = [...G.pointers.values()].find((p) => p.role === 'joy');
      if (joy) {
        ui.circle(joy.sx, joy.sy, 24, 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.35)');
        const dx = G.clamp(joy.x - joy.sx, -24, 24), dy = G.clamp(joy.y - joy.sy, -24, 24);
        ui.circle(joy.sx + dx, joy.sy + dy, 11, 'rgba(255,255,255,0.35)');
      } else {
        ui.circle(62 - G.cx * 0.6, 216 + G.cy, 24, 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.22)');
        ui.circle(62 - G.cx * 0.6, 216 + G.cy, 10, 'rgba(255,255,255,0.14)');
      }
      const ready = { atk: true, dodge: P.dodgeCd <= 0, special: P.mana >= P.specCost, skill: P.mana >= 40 && P.skillCd <= 0 };
      const lab = { atk: 'Đánh', dodge: 'Né', special: 'Đặc biệt', skill: G.HEROES[P.key].skill };
      const colr = { atk: '200,90,40', dodge: '120,120,120', special: '63,139,224', skill: '160,110,220' };
      for (const name in BTN) {
        const bt = btnPos(name);
        const glow = name === 'atk' && S.near && Math.floor(G.time * 4) % 2; // nhấp nháy khi có vật để bấm
        ui.circle(bt[0], bt[1], bt[2], 'rgba(' + colr[name] + ',' + (glow ? 0.6 : ready[name] ? 0.3 : 0.1) + ')', 'rgba(255,255,255,' + (ready[name] ? 0.55 : 0.2) + ')');
        ui.text(lab[name], bt[0], bt[1] + 2.5, { size: name === 'atk' ? 9 : 6.5, align: 'center', bold: true, color: ready[name] ? '#fff' : '#999' });
      }
"""
MOI_3 = """      const A = G.btnArt;
      const joy = [...G.pointers.values()].find((p) => p.role === 'joy');
      let jdx = 0, jdy = 0;
      if (joy) {
        jdx = joy.x - joy.sx; jdy = joy.y - joy.sy;
        const jl = Math.hypot(jdx, jdy);
        if (jl > 24) { jdx *= 24 / jl; jdy *= 24 / jl; }
        A.stick(c, joy.sx, joy.sy, 24, jdx, jdy, true);
      } else A.stick(c, 62 - G.cx * 0.6, 216 + G.cy, 24, 0, 0, false);
      const held = (name) => [...G.pointers.values()].some((p) => p.role === name);
      const cw2 = G.curW(P);
      // Vũ khí đang cầm: loại, hệ đang có hiệu lực (kể cả lúc đang Nung), mốc tiến hóa, bậc.
      const wst = { type: cw2.type, branch: G.activeEl(P, cw2), stage: G.wStage(cw2), rarity: cw2.rarity != null ? cw2.rarity : cw2.tier };
      const showLab = !!S.tut; // chữ tên nút chỉ hiện ở ải hướng dẫn
      // Hướng lộn: theo cần điều khiển hoặc phím; không đẩy thì theo hướng nhân vật đang quay mặt.
      const kx = (G.keys.ArrowRight || G.keys.KeyD ? 1 : 0) - (G.keys.ArrowLeft || G.keys.KeyA ? 1 : 0) + jdx / 24;
      const ky = (G.keys.ArrowDown || G.keys.KeyS ? 1 : 0) - (G.keys.ArrowUp || G.keys.KeyW ? 1 : 0) + jdy / 24;
      const dir = Math.hypot(kx, ky) > 0.18 ? Math.atan2(ky, kx) : P.face > 0 ? 0 : Math.PI;
      let bt = btnPos('atk');
      A.draw(c, 'atk', bt[0], bt[1], bt[2] + 1, {
        weapon: wst, pressed: held('atk'), glow: !!S.near, label: showLab ? (S.near ? 'Bấm' : 'Đánh') : null, labelAt: 'top',
        // Khi game có đòn giữ rồi thả thì truyền thêm: charge: <0 đến 1>, chargeSteps: <số nấc>
      });
      bt = btnPos('special');
      A.draw(c, 'special', bt[0], bt[1], bt[2] + 1, {
        weapon: wst, cost: P.specCost, disabled: P.mana < P.specCost, pressed: held('special'),
        cd: P.specCd / 0.8, cdSec: P.specCd, label: showLab ? G.WTYPES[cw2.type].special : null, labelAt: 'top',
      });
      bt = btnPos('skill');
      A.draw(c, 'skill', bt[0], bt[1], bt[2] + 1, {
        hero: P.key, cost: 40, disabled: P.mana < 40, pressed: held('skill'),
        cd: P.skillCd / 5, cdSec: P.skillCd, label: showLab ? G.HEROES[P.key].skill : null, labelAt: 'top',
      });
      bt = btnPos('dodge');
      A.draw(c, 'dodge', bt[0], bt[1], bt[2] + 1, {
        dir, pressed: held('dodge'), cd: P.dodgeCd / P.dodgeCdMax, cdSec: P.dodgeCd, label: showLab ? 'Né' : null, labelAt: 'top',
      });
"""

def doi(src):
    for cu, moi, ten in [(CU_1, MOI_1, 'bình máu và nút dừng'), (CU_2, MOI_2, 'ô vũ khí'), (CU_3, MOI_3, 'nút đánh, chiêu, né, cần điều khiển')]:
        if src.count(cu) != 1:
            raise SystemExit('Không tìm thấy đúng một đoạn cũ: ' + ten)
        src = src.replace(cu, moi)
    return src

if __name__ == '__main__':
    open(sys.argv[2], 'w').write('// BẢN SAO ĐỂ THỬ, tạo bằng tao_ban_thu.py. Đừng sửa tay.\n' + doi(open(sys.argv[1]).read()))
    print('đã tạo', sys.argv[2])
