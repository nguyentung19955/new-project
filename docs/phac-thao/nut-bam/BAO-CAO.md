# Báo cáo: bộ nút bấm riêng cho đánh và chiêu

Nhánh: `claude/nut-bam`. Gốc: `khoi-tao-du-an`. Trạng thái: **xong**, chờ chủ dự án duyệt hình và phiên điều phối nối vào game.

## Đã làm được gì

- Một file mới `game/js/btn_art.js`. Không sửa file nào khác trong `game/`.
- Bộ nút gồm: Đánh, Đặc biệt, kỹ năng hero, Né, bình máu, nút dừng, hai ô vũ khí, cần điều khiển.
- Nút Đánh đổi hình theo vũ khí đang cầm (kiếm, cung, giáo, búa) và nhuốm màu hệ (chưa hệ, Lửa, Độc, Băng). Lửa có ngọn lửa trên vòng, Độc có giọt nhỏ phía dưới, Băng có gai bốn góc. Mốc tiến hóa càng cao, trang trí càng nhiều.
- Nút Đặc biệt có hình riêng cho từng đòn: Chém lướt, Mưa tên, Lao tới, Nện đất. Có thẻ giá mana.
- Nút kỹ năng có hình riêng cho từng hero: Nung (kiếm trong lửa), Đặt bẫy (bẫy kẹp), Bình thuốc (bầu hồ lô), Gồng (nắm đấm).
- Nút Né có mũi tên xoay theo cần điều khiển, 16 hướng.
- Năm trạng thái: bình thường, đang bấm (lún xuống, sáng lên), không dùng được (xám; thiếu mana thì số giá màu đỏ), đang hồi (màn tối quét theo chiều kim đồng hồ, hơn 1 giây thì hiện số giây), vừa sẵn sàng (nháy sáng một nhịp, tự nhận biết).
- Vòng nạp quanh nút Đánh có vạch nấc, cho đòn giữ rồi thả.
- Ô vũ khí có viền bốn bậc: Thường xám, Lam, Tím, Vàng.

## Ảnh

| Ảnh | Nội dung |
| --- | --- |
| `bo-nut.png` | Cả bộ nút, bảng năm trạng thái, vòng nạp, nút Né theo hướng, ô vũ khí bốn bậc, cần điều khiển |
| `nut-theo-vu-khi-va-he.png` | Nút Đánh và Đặc biệt cho 4 vũ khí nhân 4 hệ, kỹ năng của 4 hero |
| `tren-man-hinh.png` | So cũ và mới trên màn hình game, bố cục phòng vuông |
| `trong-game.png` | Game thật (nhánh gốc) có nút mới, lúc bình thường |
| `trong-game-dang-hoi.png` | Game thật có nút mới, lúc đang hồi, thiếu mana, hết bình máu |
| `trong-game-hunter.png`, `-healer.png`, `-wrestler.png` | Ba hero còn lại |

## Cách nối vào game (cho phiên điều phối)

**Bước 1.** Trong `game/index.html`, thêm một dòng ngay trước dòng nạp `js/stage.js`:

```html
<script src="js/btn_art.js"></script>
```

`game/build.py` tự đọc danh sách file từ `index.html` nên không cần sửa.

**Bước 2.** Thay ba đoạn trong `game/js/stage.js`, hàm `drawHud`. Số dòng tính theo nhánh `khoi-tao-du-an`. Ba đoạn cũ này cũng có y nguyên trong `stage.js` của nhánh `claude/phong-vuong` (đã thử thay được).

Đoạn 1, bình máu và nút dừng (dòng 396 đến 399). Dòng hiện tại:

```js
    ui.rect(POT[0], POT[1], POT[2], POT[3], canDrink ? 'rgba(160,40,30,0.85)' : 'rgba(40,36,32,0.8)', canDrink ? '#e2b36a' : '#6a5a4a');
    ui.text(W.noPotion ? 'Bình: cấm' : 'Bình máu ×' + P.potions, POT[0] + POT[2] / 2, POT[1] + 13.5, { size: 7, align: 'center', bold: true, color: canDrink ? '#fff3da' : '#a89c8c' });
    ui.rect(PAU[0], PAU[1], PAU[2], PAU[3], 'rgba(40,36,32,0.8)', '#e2b36a');
    ui.text('Dừng', PAU[0] + PAU[2] / 2, PAU[1] + 13.5, { size: 7, align: 'center', bold: true });
```

Thay bằng:

```js
    const heldBox = (b) => [...G.pointers.values()].some((p) => p.role === 'ui' && hitBox({ x: p.sx, y: p.sy }, b));
    G.btnArt.draw(c, 'potion', POT[0] + 13, POT[1] + 11, 11, { count: P.potions, disabled: !canDrink, pressed: heldBox(POT) });
    ui.text(W.noPotion ? 'Cấm' : 'Bình máu', POT[0] + 28, POT[1] + 14, { size: 6.5, bold: true, color: canDrink ? '#fff3da' : '#a89c8c' });
    G.btnArt.draw(c, 'pause', PAU[0] + PAU[2] / 2 + 6, PAU[1] + 11, 10, { pressed: heldBox(PAU) });
```

Đoạn 2, khung ô vũ khí (dòng 416). Dòng hiện tại:

```js
      ui.rect(x, 3, 54, 35, on ? 'rgba(90,60,30,0.9)' : 'rgba(30,26,22,0.75)', on ? '#ffd27a' : '#6a5a4a');
```

Thay bằng:

```js
      // Khung ô vũ khí cùng bộ với nút. Hình vũ khí và chữ vẫn do game vẽ ở các dòng dưới.
      G.btnArt.slot(c, x, 3, 54, 35, {
        weapon: { type: w.type, branch: G.activeEl(P, w), stage: G.wStage(w), rarity: w.rarity != null ? w.rarity : w.tier },
        active: on, cd: on ? 0 : P.swapCd / 1.5, icon: false, gem: false, id: 'slot' + i,
      });
```

Đoạn 3, cần điều khiển và bốn nút tròn (dòng 488 đến 504). Dòng hiện tại:

```js
      const joy = [...G.pointers.values()].find((p) => p.role === 'joy');
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
```

Thay bằng:

```js
      const A = G.btnArt;
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
        weapon: wst, pressed: held('atk'), glow: !!S.near, label: showLab ? 'Đánh' : null,
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
```

Vị trí nút và vùng chạm không đổi. Chỉ đổi hình vẽ.

## Hàm công khai

- `G.btnArt.draw(ctx, kind, x, y, r, st)`: `kind` là `'atk'`, `'special'`, `'skill'`, `'dodge'`, `'potion'`, `'pause'`. `st` gồm: `weapon {type, branch, stage, rarity}`, `hero`, `pressed`, `disabled`, `cd` (0 đến 1), `cdSec`, `cost`, `lack` (thiếu mana; không truyền thì tự suy từ `disabled`), `charge` (0 đến 1), `chargeSteps`, `dir` (góc, radian), `ready` (không truyền thì tự nhận biết), `glow` (nhấp nháy gọi bấm), `label`, `labelAt: 'top'`, `count` (số bình máu), `t`, `id`.
- `G.btnArt.slot(ctx, x, y, w, h, st)`: `st` gồm `weapon`, `active`, `pressed`, `disabled`, `cd`, `swap` (dấu hai mũi tên), `icon: false` (để game tự vẽ hình vũ khí), `gem: false`.
- `G.btnArt.stick(ctx, cx, cy, r, dx, dy, active)`.
- `G.btnArt.clear()`: xóa bộ đệm.

Cách giữ nét: mỗi hình được vẽ thành pixel vào canvas đệm, rồi phóng to theo số nguyên (làm tròn tỉ lệ màn hình). Khung nút được dựng lại theo đúng cỡ nên nút vẫn to đúng như yêu cầu. Mọi hình đều có bộ đệm, mỗi khung chỉ dán lại ảnh.

## Đã kiểm tra

- `node --check game/js/btn_art.js` và bản sao `stage_thu.js`: đạt.
- `nguon/kiem_tra.py`: chạy game thật qua trang `nguon/thu.html` ở 5 cỡ màn hình (tỉ lệ 2,2 đến 4,3), không có lỗi trang. Giữ nút Đánh cùng lúc kéo cần, bấm kỹ năng và Né bằng cảm ứng giả: game nhận đúng.
- Tốc độ: vẽ cả màn hình khoảng 0,6 ms một khung trên máy thử, riêng ba nút khoảng 0,2 ms.

## Chưa làm hoặc cần biết

- **Vòng nạp chưa chạy trong game.** Nhánh gốc chưa có đòn giữ rồi thả. Vòng nạp mới chỉ thấy ở tờ phác thảo. Khi game có đòn này, truyền `charge` và `chargeSteps` vào nút Đánh.
- **Bậc Vàng chưa có trong game gốc.** Game gốc có ba bậc Sắt, Bạc, Linh; đoạn nối tạm lấy chúng làm Thường, Lam, Tím. Khi vũ khí có `rarity` thì hàm dùng `rarity`.
- **Ô vũ khí trong game** chỉ thay khung, hình vũ khí và chữ vẫn do game vẽ (để nhánh vũ khí sống dùng hình của họ). Kiểu ô gọn có hình, ngọc hệ, dấu đổi như trong `bo-nut.png` có sẵn, bỏ `icon: false` là dùng được.
- **Ngọn lửa của nút Đánh chạm nhẹ vào thẻ giá của nút kỹ năng** vì hai nút nằm sát nhau. Nếu muốn thoáng, dời nút kỹ năng lên 4 đơn vị (`BTN0.skill` từ 166 thành 162).
- **Nút vẽ to hơn vùng cũ 1 đơn vị** (bán kính 29 và 19) cho đúng cỡ yêu cầu.
- **Chữ tên nút** chỉ hiện ở ải hướng dẫn (`S.tut`). Ải thường chỉ còn hình.
- **Hình vũ khí trên nút chưa có mắt** như vũ khí sống. Đây là hình chung theo loại, không theo từng món.
- Ảnh `tren-man-hinh.png` chụp từ một bản sao tạm của nhánh `claude/phong-vuong` có nối nút mới. Bản sao đó không nằm trong nhánh này.
- Máy chụp không tải được phông Be Vietnam Pro, nên chữ trong ảnh là phông thay thế. Trên máy thật chữ sẽ đúng phông game.
- Chưa thử trên điện thoại thật. Chưa chạy bộ kiểm tra có sẵn của game (`game/tests`), vì các file gốc không đổi và trang gốc chưa nạp file mới.

## File nguồn trong `nguon/`

- `to-1.html`, `to-2.html`, `to-3.html`, `to.js`, `to.css`, `chup.py`: dựng và chụp ba tờ phác thảo.
- `tao_ban_thu.py`: tạo `stage_thu.js` (bản sao `stage.js` đã thay ba đoạn trên).
- `thu.html`: trang chơi thử có nút mới. `chup_game.py`: chụp ảnh trong game. `kiem_tra.py`: kiểm tra.
