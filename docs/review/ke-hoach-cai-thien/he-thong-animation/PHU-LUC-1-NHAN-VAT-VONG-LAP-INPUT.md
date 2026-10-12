# PHỤ LỤC 1 — Nhân vật, vòng lặp cập nhật, input và Luồng C (nhấn phím → sát thương)

Phạm vi: định nghĩa nhân vật (người chơi, quái, trùm, người làng, em bé ở làng), hàm cập nhật (vòng lặp, di chuyển, va chạm, camera), input (bàn phím, chuột, cảm ứng, nút HUD, bot) và đường đi của một nhát đánh từ lúc bấm phím tới lúc gây sát thương. Chi tiết vẽ sprite, vũ khí và hiệu ứng (fx) thuộc phụ lục khác; ở đây chỉ nêu tên hàm được gọi.

Mã nguồn: nhánh `khoi-tao-du-an`, commit `229e263`. Mọi "tệp:dòng" lấy theo commit này, đường dẫn tính từ `game/js/`.
Số đo: Playwright + Chromium, viewport 844x390, mở `file:///home/claude/new-project/game/index.html`. Script đo tạm nằm ở scratchpad `pl1/do_luong_c.py`, `pl1/do_trans.py`, không sửa tệp nào của game.

Quy ước: **[đã đo]** là có số đo Playwright; **[đã thấy]** là đọc thẳng trong code, tính được chắc chắn; **[suy luận]** là lập luận chưa đo.

---

## 0. Tóm tắt nhanh

- Vòng lặp dùng **bước cố định** `STEP = 1/60` với bộ tích luỹ (accumulator), tối đa 5 tick mỗi khung `requestAnimationFrame` (engine.js:560, 621–628). Logic luôn chạy 60 nhịp/giây, phần vẽ có thể chậm hơn (10 hoặc 30 khung/giây khi tiết kiệm).
- **Không có nhảy, rơi hay tiếp đất. Không có trọng lực hay trục z cho nhân vật.** Chỉ có độ cao giả để vẽ: `e.mvLift` (quái bị Địa Chấn hất), `o.z` của mũi tên và đạn quái (mục 2.6).
- Va chạm tường là **kẹp toạ độ vào hình chữ nhật** `W.x0..W.x1 (W.px1)`, `W.y0..W.y1` (combat.js:802–803). Ở làng thì kiểm tra theo điểm bằng `blocked(x, y)` (village_scene.js:525).
- Trạng thái animation của em bé **không nằm trong một biến state**. Nó được suy ra mỗi khung từ các bộ đếm thời gian `P.atkT/atkDur, P.dodgeT, P.dashT, P.specT, P.castT, P.hurtT, P.deadT, P.mv.holding` qua `G.heroArgs` (combat.js:1055), rồi `SC.chonEmBe` (sprite_custom.js:595) hoặc `pick` (hero_art.js:1098) chọn hàng và khung.
- Input đi theo đường `G.keys/G.keyP/G.downs/G.pointers` (engine.js) → `readInput()` (stage.js:614) → đối tượng `inp {mx,my,atk,atkP,dodgeP,…}` → `G.updatePlayer` (combat.js:650) → `M.input` / `M.act` / `M.hit` (moves.js).
- Số đo chính [đã đo]: kiếm gây sát thương sau **9 tick (0,150 s)** kể từ tick nhận phím. Giáo, búa và cung **chỉ bắt đầu ra đòn khi nhả nút**, nên trễ thêm đúng thời gian giữ phím. Búa gây sát thương khi hình còn ở khung 1; khung "nện" (khung 3) hiện sau đó 5 tick (khi không khựng hình) hoặc 10 tick (khi có khựng hình).

---

## 1. Định nghĩa nhân vật

### 1.1 Dữ liệu tĩnh (data.js, moves.js)

| Bảng | Vị trí | Nội dung liên quan animation |
|---|---|---|
| `G.HEROES` | data.js:122–147 | 4 em bé `smith` (Cu Tí), `hunter` (Cu Tèo), `healer` (Cái Bống), `wrestler` (Cu Lì): `hp, mana, speed` (hệ số tốc độ đi), `fav` (vũ khí ưa thích). Không có trường animation nào. |
| `G.HKEYS` | data.js:148 | `['smith','hunter','healer','wrestler']`. Em bé mặc định là `'smith'` (engine.js:297 `hero: 'smith'`). |
| `G.WTYPES` | data.js:28–39 | `sword` (Kiếm), `bow` (Cung), `spear` (Giáo), `hammer` (Búa): `dmg, cd, reach, depth, stagger, ranged`. Theo chú thích ở data.js:24–27, `cd` **chỉ dùng cho lối đánh cũ** khi thiếu moves.js. |
| `G.WKEYS` | data.js:40 | `['sword','bow','spear','hammer']` |
| `G.MOVES` | moves.js:16–84 | Nhịp thật của từng nhát: `tap 0.16`, `hold 0.8`, `buffer 0.25`. Kiếm `chain` có dur 0.3/0.3/0.46. Cung `shot.still 0.38 / move 0.45`, `charge.time 0.75, recover 0.5`. Giáo `chain` có dur 0.38/0.34/0.34/0.52, `charge.t 0.16`. Búa `swing.dur 0.8, hitAt 0.35`, `charge.lv1 0.5, time 1.1, recover 0.7`. |
| `G.DODGE` | data.js:300 | `{ vx: 195, ky: 0.75 }`: tốc độ lộn ngang và tỉ lệ dọc. |
| `G.ZK` | data.js:298 | 0.85: hệ số co chiều dọc của sàn nhìn 3/4. |
| `G.ROLES` | data.js:203–213 | Vai quái: `hp, dmg, speed, r` (bán kính va chạm). |
| `G.MOB_ART` | data.js:215–222 | Mã hình AI của quái, trùm nhỏ và trùm vùng theo vùng. |

### 1.2 Người chơi `P` — tạo ở `G.buildPlayer` (combat.js:88–128)

```js
const P = {
  isPlayer: true, key, lvl: hs.lvl, sk, x: 60, y: 190, r: 7, hr: 6, face: 1,
  ...
  atkT: 0, atkDur: 0, cdT: 0, hitDone: true, comboI: -1, lastAtk: 0, hitCount: 0,
  dodgeT: 0, dodgeCd: 0, dodgeBuf: 0, ddx: 1, ddy: 0, inv: 0, hurtT: 0, dashT: 0, dashHit: null,
  castT: 0, specT: 0, deadT: 0, // đồng hồ cho hoạt ảnh: dùng kỹ năng, tung đòn đặc biệt, gục
```

Các bộ đếm thời gian giảm cùng một chỗ, combat.js:652:
```js
for (const k of ['atkT', 'cdT', 'dodgeCd', 'inv', 'hurtT', 'skillCd', 'specCd', 'swapCd', 'gongT', 'castT', 'specT']) if (P[k] > 0) P[k] -= dt;
```

| Trường | Ý nghĩa | Gán (tệp:dòng) | Đọc để vẽ / chọn khung |
|---|---|---|---|
| `x, y` | chân nhân vật (toạ độ sàn, y là chiều sâu) | combat.js:743–744 (đi), 711 (lướt), 724–725 (lộn), 717 (lùi khi Trảm Nguyệt), 802–803 (kẹp tường); combat.js:187 và stage.js:340–341 (vào phòng) | heroArgs combat.js:1059; xếp lớp theo y combat.js:1127 |
| `face` | ±1, chỉ lật trái/phải | combat.js:530 (lối cũ), 749 (đi, chỉ khi `atkT<=0`), 767 (lộn); moves.js:416 `setAim` | heroArgs combat.js:1059 |
| `aimX, aimY` / `aimRel, aimUx, aimUy` | hướng nhắm 8 hướng trên sàn / trên màn hình (độ) | moves.js:258–262 `setAimM`, 415–419 `setAim` | hero_tinhlinh.js:1171, 1601, 1617 (xoay vũ khí) |
| `stickX, stickY` | hướng cần điều khiển | moves.js:173 | moves.js:234, 250 |
| `ldx, ldy` | hướng đi gần nhất | combat.js:750 | moves.js:251, 410; combat.js:766 |
| `moving` | đang đi (bật mỗi tick) | combat.js:683 (=false), 745 (=true), 670, 675 | heroArgs `move` combat.js:1059 |
| `t` | đồng hồ riêng của bé | combat.js:651 | heroArgs `t`, nhịp idle |
| `chayT` | nhịp chân theo tốc độ đi thật | combat.js:748 | heroArgs `tc` combat.js:1059 → sprite_custom.js:597 |
| `atkT, atkDur` | thời gian còn lại / tổng của nhát | moves.js:306 `begin`, 360 `swordGlide`, 479 `spearLunge`; combat.js:533 `startAttack` (lối cũ). Huỷ: combat.js:675 (đóng băng), 686 (Né huỷ lướt), 710 (lướt chạm tường), 763 (lộn), 785 (đổi vũ khí) | heroArgs `atk = 1 - atkT/atkDur` combat.js:1060; M.input `mv.prog` moves.js:194 |
| `cdT` | khoá ra nhát mới | moves.js:306, 360, 479; combat.js:533, 762, 785 | moves.js:540 `can = P.cdT <= 0` |
| `hitDone, hitAt` | đã gây sát thương chưa / mốc chạm (0..1) | moves.js:306–307, 459, 585; combat.js:533, 538, 785 | combat.js:801 (điểm chạm) |
| `comboI, lastAtk` | tư thế trong chuỗi | moves.js:308 (`o.pose`), 360, 479; combat.js:531–532, 788 | sprite_custom.js:612 (`p.comboI`), hero_art.js:1112 |
| `mv` (đối tượng) | trạng thái lối đánh: `name, kind, step, chain, charge, level, prog, holding, holdT, wasHeld, relP, buf, pressBuf, chargeT, fullT, afterDodge, wasDodge, wid, cur, lastT, gap, dashDur` | tạo ở moves.js:126–135 `st(P)`; cập nhật ở M.input moves.js:168–196, M.act 538–579, begin 304–311 | sprite_custom.js:608 (`p.mv.holding`, `p.mv.charge`), hero_art.js:1105 |
| `dodgeT, dodgeCd, dodgeBuf, ddx, ddy` | lộn né | combat.js:673–674 (bộ nhớ), 760 (`dodgeT = 0.27`), 766 | heroArgs `dodge = 1 - dodgeT/0.27` combat.js:1060 |
| `inv` | bất tử (i-frame) | combat.js:632 (0.55 khi trúng đòn), 760 (≥0.32 khi lộn), 186 (0.6 khi vào phòng); moves.js:359, 478; stage.js:349 | heroArgs `alpha` nhấp nháy combat.js:1061 |
| `hurtT` | đang bị đánh | combat.js:632 (`0.2`) | heroArgs `flash` combat.js:1061; sprite_custom.js:614, 631; hero_art.js:1115 |
| `dashT, dashVx/Vy, dashUx/Uy, dashNe, dashHit, dashMult, dashOpt` | lướt hoặc lao (Nhát lướt, Xốc tới) | moves.js:333–338 `dashGo`; combat.js:686–713 | sprite_custom.js:605; hero_art.js:1102 |
| `slideT, slideVx/Vy` | lùi nửa bước khi Trảm Nguyệt | moves.js:769; combat.js:714–718 | không có hình riêng |
| `specT, specCd` | đòn Đặc biệt (0.35 s) | combat.js:564–565 `special` | sprite_custom.js:606; hero_art.js:1103 |
| `castT, skillCd, chHold, chT` | chưởng (kỹ năng) | chuong.js:244 (`castT = 0.3`), 271–286 `CH.input` | sprite_custom.js:607 (chia **0.4**); hero_art.js:1104 |
| `frozenT` | bị nổ băng, đứng im 0.65 s | mobs.js:168 `onBlastHit` | combat.js:675 (dừng mọi thứ). **Không có hàng hoặc khung "đóng băng" riêng.** |
| `st.fire/poison/ice` | hiệu ứng trên người | combat.js:640–642 | combat.js:1135–1137; sprite_custom.js:632–633 (nhuộm màu) |
| `hp, maxhp, dead, deadT` | máu, gục | combat.js:629, 644 (`P.dead = true; W.over = 'dead'`), 654 | sprite_custom.js:603 (`die`, u = deadT/giay); hero_art.js:1100 |
| `cur, weapons, swapCd` | vũ khí đang cầm (0/1) | combat.js:781–782 | heroArgs `weapon` combat.js:1063 |
| `spearOut` | giáo đang bay (Phi Thương) | moves.js:778, 868; combat.js:188; stage.js:350 | combat.js:1063 (vẽ tay không `type:'fist'`) |
| `gongT` | Gồng (còn bộ đếm, không còn chỗ gán) | combat.js:109 | heroArgs `gong` combat.js:1064 |

**Không tồn tại** trường riêng nào cho trạng thái "choáng" (stun) của người chơi. Người chơi chỉ có `frozenT` (đóng băng) và `hurtT` (giật khi trúng đòn). `P.st` chỉ gồm `fire/poison/ice` (combat.js:108). Lệnh kiểm tra: `grep -n "P.st.stun\|P.stun" game/js/*.js` không ra kết quả nào.

### 1.3 Quái `e` — `G.spawnEnemy` (combat.js:200–217) + `G.mobInit` (mobs.js:90–124)

```js
const e = {
  role, x, y, r: R.r, hr: role === 'elite' ? 9 : 6, face: -1, t: G.rnd() * 5,
  ...
  st: st0(), flash: 0, wind: 0, cd: G.rr(0.4, 1.4), state: 'move', moving: false, scale: role === 'elite' ? 1.5 : 1,
```

| Trường | Gán | Đọc / ghi chú |
|---|---|---|
| `x, y, face, moving` | mobs.js `keep` 256–266, `moveTo` 367–371, `lungeT` 231–235; combat.js `separate` 894–911, kẹp phòng 922–925 | A.enemy (mobs.js:842) đọc `e.face`, `e.dirA` |
| `an = {n, t, spd, cut?, rev?}` | mobs.js:24 `play`, 25 `loop`, tăng `t` ở 216 | **Đây là state animation thật của quái.** Đọc ở mobs.js:845; tên hàng: `spawn, idle, move, tele, atk, hit, die` |
| `act = {k, t, T, a, fired, end, fire, step, after, cd}` | mobs.js:185–191 `begin`, 242–254 `stepAct` | `tele` T giây → `atk` (`play(e, A.anim1 || 'atk')` 249) → hết `end` thì về `idle` (253) |
| `wind` | mobs.js:190, 245, 248 | A.enemy rải hàng `tele` theo `1 - wind/act.T` (mobs.js:858) |
| `spawnT` | mobs.js:106 | 220: hết thì `loop(e,'idle')` |
| `hitT` | mobs.js:131 (0.3 khi trúng đòn) | mobs.js:849 → hàng `hit` nếu đang `idle`/`move` |
| `flash` | combat.js:283 (0.07) | chớp trắng (mobs.js:862) |
| `st.stun / st.frozen / st.root` | combat.js:456–457, 342 | mobs.js:222–226 (đứng im, huỷ đòn); A.enemy 847–848 (frozen → `idle` t=0, stun → `hit` rung) |
| `lungeT, lv, dive, boomT, spikeUp` | mobs.js | các cơ chế riêng theo vai |
| `mvLift` | moves.js:888 | combat.js:1100 (độ cao vẽ khi bị hất tung, chỉ đổi hình) |
| `dead` | combat.js:376 `G.kill` | Quái bị lọc khỏi `W.ents` ngay trong tick đó (combat.js:1036). Cảnh chết do fx tự chiếu: `api('death')` fx.js:1785 chụp lại quái thành `snap` có `dying` (fx.js:1789–1801) |
| `state: 'move'` | combat.js:207 | **Trường chết:** `grep -n "\.state\b" combat.js mobs.js art.js monster_art.js fx.js` không tìm thấy chỗ nào đọc `e.state` |

Quái kiểu cũ (`!e.art`, ví dụ bia tập `noArt` trong bài đo) đi qua `updateEnemy` (combat.js:816–893) với `wind/lunge/retreat` và **không có `e.an`**.

### 1.4 Trùm `b` — `G.makeBoss` (boss.js:51–96)

Các trường: `isBoss, kind ('moc','ngu','ho','mini'), phase 0..2, seq (chuỗi hẹn giờ), cd, busy, tired, invuln, intro, wind, exposed, lunge, an {n,t,spd,cut}, dirA, face, hitT, roarT, dying` (do fx gán cho bản chụp).
- `play(b, n, spd, o)` boss.js:98. Hàng: `intro, spawn, idle, move, c1..c5, chieu*, atk*, tele*, phase2, phase3, stun, hit, die`.
- Chọn hàng mỗi tick ở boss.js:403–407. Hết `busy` hoặc không ở hàng "bận" thì chuyển về `move` hoặc `idle`:
```js
const busyAnim = b.an && (b.an.n === 'intro' || ... || /^c\d$|^chieu|^atk|^tele/.test(b.an.n));
if (b.busy <= 0 || !busyAnim) { const n = b.moving ? 'move' : 'idle'; if (!b.an || b.an.n !== n) play(b, n); }
```
- Khi vẽ (A.boss, boss.js:424–453) hàng được đè: `dying` → `die`, choáng hoặc `tired` → `stun`, `hitT` → `hit`.
- Đổi pha: boss.js:388–401 (chơi `phase2`/`phase3`, đặt `invuln = busy = dur`). Chết: `G.kill` → `mobOnKill` đặt `W.bossDieT = dur(art,'die') + 0.4` (mobs.js:152). stage.js:719 chờ hết thời gian đó rồi mới mở cổng.

### 1.5 Người làng (NPC) — village_scene.js

- `NPCS` (village_scene.js:37–45): 7 người `lai, ren, xen, may, do, tu, mo` với `pos, den` (chỗ em bé đứng nói chuyện), `top, wide, sit, robe`.
- **NPC không có vòng cập nhật riêng.** Khung hình tính thẳng lúc vẽ, VS.drawWorld village_scene.js:1009–1013:
```js
const look = nearMe ? (S.x >= q[0] ? 1 : -1) : 0;
const f = look ? 0 : Math.floor(t * 2.4 + k.length * 0.7) % 3, blink = !look && ((t * 0.31 + k.length * 0.37) % 1) > 0.95;
putNpc(c, k, q[0] - cam, q[1], f, { look, blink, breath: t });
```
  Mỗi NPC có 3 khung nhàn rỗi chạy 2,4 khung/giây, chớp mắt và thở. Khi em bé ở gần thì NPC quay mặt (`look`). Hàm vẽ: `putNpc` 173, `npcSprite` 146, `drawNpc` 53, `thoLen` 154.

### 1.6 Em bé ở làng — `VS.state` (village_scene.js:578–583)

```js
const S = (VS.state = {
  x: 610, y: 166, face: -1, moving: false, cam: 240, t: 0,
  path: null, goal: null, ...
```
- Em bé đang chơi: `S.x, S.y, S.face, S.moving, S.t`, đi với `SPEED = 108` (village_scene.js:584). Vẽ bằng `drawKid` (815–818), gọi `G.art.hero` với `atk: -1, dodge: -1, weapon: null, move: S.moving` và **không truyền `p`**, nên chỉ có hai trạng thái `idle` và `move`.
- 3 em bé ngồi ở sân đình: `seats()` (521–524) lấy toạ độ từ `B.be` (318). Hàm vẽ ở 1017–1020 dùng mẹo `move: un && Math.sin(t * 1.1 + st.x) > 0.75` để em bé thỉnh thoảng nhún bằng khung chạy.
- 2 vũ khí bay theo sau em bé: `S.wp` (cập nhật 794–797, vẽ bằng `drawWeapon` 805).
- Cảnh `G.Village` (village.js:824). `update(dt)` ở 843–845 gọi `VS.update(dt, V.tab !== 'hub' || !!V.moi)`, tức là khoá điều khiển khi đang mở bảng.

---

## 2. Hàm cập nhật

### 2.1 Vòng lặp (engine.js)

```js
const STEP = 1 / 60;
G.tick = function () {
  G.time += STEP;
  if (G.scene) G.scene.update(STEP);
  G.keyP = {};
  G.downs.length = 0;
};
```
(engine.js:560–567)

```js
function frame(ts) {
  requestAnimationFrame(frame);
  const now = ts / 1000;
  acc += Math.min(0.1, Math.max(0, now - last || 0));
  last = now;
  let n = 0;
  while (acc >= STEP && n < 5) { G.tickDraw = n === 0; G.tick(); acc -= STEP; n++; }
  if (acc > STEP) acc = 0;
```
(engine.js:621–628)

- **`dt` cố định 1/60 s cho mọi logic** [đã thấy]. Mỗi khung trình duyệt chạy 0–5 tick. Bỏ phần dư khi khung trình duyệt quá chậm (628) và cộng tối đa 0,1 s mỗi khung, nên máy chậm dưới khoảng 12 khung/giây sẽ thấy game chạy chậm lại.
- Phần vẽ có thể bị bỏ (engine.js:629, `nenVe` 614–619). Hai trường hợp: cảnh đứng yên thì vẽ 10 khung/giây (`canhYen` 599–613); tiết kiệm pin (`G.save.pin` hoặc `?fps=30`) thì vẽ 30 khung/giây, còn logic vẫn 60 nhịp/giây (591–592).
- `G.run` (645) khởi động vòng lặp, `main.js` gọi `G.setScene(G.Title); G.run()`. `G.sim(n)` (647–650) chạy n tick với `G.noRender = true`, dùng cho bài kiểm thử: không vẽ và **không có khựng hình**.
- [đã đo] Ở Chromium headless, khoảng cách giữa các tick có trung vị 16,65–16,7 ms. Thỉnh thoảng một khung chạy 2 tick (1–9 lần trong khoảng 115 tick).
- `G.tickDraw` (627) được gán nhưng **không nơi nào đọc**. Lệnh kiểm tra `grep -n tickDraw game/js/*.js` chỉ ra đúng dòng 627.

### 2.2 Cây gọi hàm mỗi khung (trong ải)

```
requestAnimationFrame → frame(ts)                         engine.js:621
├─ [0..5 lần] G.tick()                                    engine.js:562
│  ├─ G.time += 1/60
│  ├─ G.scene.update(STEP) = G.StageScene.update(dt)      stage.js:661
│  │  ├─ (S.mode !== 'play') → chỉ xử lý Esc/P/M, return  stage.js:665–674
│  │  ├─ (S.trans) → đếm thời gian chuyển phòng, return   stage.js:676–681   ← input KHÔNG được đọc
│  │  ├─ inp = G.botInput ? G.botInput(S) : readInput()   stage.js:683 / 614
│  │  ├─ pauseP / mapP → setMode, return                  stage.js:684–685
│  │  ├─ tìm đồ vật gần (S.near); near && atkP → interact stage.js:689–699
│  │  ├─ G.updateWorld(dt, inp)                            combat.js:914
│  │  │  ├─ G.fx.frozen(dt, inp) → true thì return (khựng hình)    combat.js:917, fx.js:475
│  │  │  ├─ G.updatePlayer(P, inp, dt)                     combat.js:650
│  │  │  │  ├─ giảm bộ đếm (atkT, cdT, inv, hurtT, castT, specT…)  652
│  │  │  │  ├─ dot cháy / độc                               658–669
│  │  │  │  ├─ W.over → return                              670
│  │  │  │  ├─ dodgeBuf, frozenT                            673–675
│  │  │  │  ├─ G.moves.input(P, inp, dt)  (M.input)         678 → moves.js:168
│  │  │  │  ├─ dashT>0: lướt + đánh trên đường, return      687–713
│  │  │  │  ├─ slideT                                       714–718
│  │  │  │  ├─ dodgeT>0: lộn   | ngược lại:                 719–799
│  │  │  │  │    di chuyển (mx,my), face, chayT            741–751
│  │  │  │  │    ưu tiên: Né > Đặc biệt (special) > Chưởng (G.chuong.input) > M.act > startAttack (lối cũ)  752–779
│  │  │  │  │    đổi vũ khí (swapP), bình máu (potionP)    780–798
│  │  │  │  ├─ điểm chạm: atkT <= atkDur*(1-hitAt) → M.hit(P) | doHit(P)  801
│  │  │  │  └─ kẹp vào tường                                802–803
│  │  │  ├─ updateEnemy(e) cho mỗi quái → G.mob.update(e) nếu e.art   combat.js:919, 822 → mobs.js:214
│  │  │  ├─ separate() (đẩy quái khỏi nhau), kẹp phòng   920–925
│  │  │  ├─ G.updateBoss(W.boss, dt)                       926 → boss.js:364
│  │  │  ├─ G.mob.tick(dt)                                 927
│  │  │  ├─ đạn W.projs (bay, trúng, playerHit / hurtPlayer)  929–967
│  │  │  ├─ vùng W.zones                                   969–1014
│  │  │  ├─ G.moves.update(W, dt) (chiêu bay, sóng búa)   1015 → moves.js:901
│  │  │  ├─ G.chuong.update(W, dt)                         1016
│  │  │  ├─ bẫy, lọc props/ents, hạt, chữ, vệt chém, shake, banner  1018–1045
│  │  │  ├─ camera W.cam (lerp)                            1047–1049
│  │  │  └─ G.fx.update(dt)                                1050 → fx.js:2067
│  │  ├─ tickSpawns, đợt quái, cửa, nhặt đồ              stage.js:706–733
│  ├─ G.keyP = {}; G.downs.length = 0                     engine.js:565–566
├─ nenVe()? — không thì return (không vẽ)                 engine.js:629
└─ vẽ: ui.begin(); G.scene.draw()                         engine.js:633–634
   └─ G.StageScene.draw()                                 stage.js:738
      ├─ G.drawWorld(S.r)                                 combat.js:1069
      │  ├─ A.bg, vùng (A.zone / fx.zone), fx.drawGround
      │  ├─ danh sách xếp theo y: A.enemy(e) / A.boss(b) / A.prop / vật cao / A.hero(c, G.heroArgs(P))  1097–1132
      │  │     (A.hero: sprite_custom.js:1213 → SC.chonEmBe; dự phòng hero_art.js:1159 / art.js:325)
      │  ├─ G.mobHeroOver, đạn (fx.proj, A.proj), A.slash, hạt, fx.drawOver, fx.vienBe
      │  └─ số sát thương (lớp UI), G.doRoi.nhan, fx.drawUI, G.baoTruoc.draw
      └─ drawHud() — cần điều khiển, nút tròn, ô bình máu...  stage.js:927
   G.click = null                                          engine.js:643
```

Ở làng: `G.Village.update` (village.js:843) → `VS.update(dt, locked)` (village_scene.js:735). Hàm vẽ `G.Village.draw` (village.js:851) → `VS.drawWorld` (983) và `VS.drawHud` (1108).

### 2.3 Di chuyển (movement)

- Người chơi, combat.js:741–751:
```js
const sp = P.speed * slow * (P.atkT > 0 ? (MV && MV.speedAtk ? MV.speedAtk(P) : 0.4) : 1) * (MV ? MV.speed(P) : 1) * (P.chHold ? 0.6 : 1);
if (ml > 0.12) {
  P.x += mx * sp * dt;
  P.y += my * sp * 0.75 * dt;
```
  `P.speed = 72 * H.speed` (combat.js:104). Đi dọc chậm hơn 0,75 lần. Trong lúc ra đòn tốc độ nhân theo vũ khí (`G.CHAM_DANH.danh` moves.js:203–206: kiếm 0.85, giáo 0.8, cung 0.7, búa 0.55). Khi giữ nút lấy đà: `M.speed` moves.js:216–222. Đang ra đòn thì **không đổi hướng mặt theo cần** (combat.js:749 `if (P.atkT <= 0 …)`); hướng mặt lúc này do `setAim` quyết định (moves.js:416).
- Lộn né: combat.js:719–739, vận tốc `G.DODGE.vx * dm`, thời gian `0.27` (combat.js:760).
- Lướt/lao: combat.js:687–713, vận tốc `P.dashVx/Vy` do `dashGo` đặt (moves.js:333–338).
- Quái: mobs.js `keep` (256), `moveTo` (367), `lungeT` (231); lối cũ combat.js:886–891. Trùm: `move` (boss.js:342–362), `lunge` (boss.js:120, 375–379).
- Em bé ở làng: village_scene.js:767–785, chạy theo cần hoặc theo đường `findPath` (545).

### 2.4 Va chạm tường (collision)

- Trong ải: **chỉ kẹp vào hình chữ nhật**. `W.x0..x1, y0..y1` lấy từ `geo.bounds` (room_art.js:1298 `{ x0: g.fx0 + 9, x1: g.fx1 - 9, y0: g.fy0 + 8, y1: g.fy1 - 4 }`), gán ở stage.js:247. `W.px1` là bức chắn phải của phòng trùm vùng.
```js
P.x = G.clamp(P.x, W.x0, W.px1 != null ? W.px1 : W.x1);
P.y = G.clamp(P.y, W.y0, W.y1);
```
  (combat.js:802–803). Lướt chạm tường thì dừng và rút ngắn `atkT` (combat.js:710). `wallLen` (moves.js:283–289) cắt tầm chiêu ở tường.
- Không có va chạm giữa người chơi và quái hay đồ vật. Quái chỉ đẩy nhau (`separate`, combat.js:894–911).
- Ở làng: `blocked(x, y)` (village_scene.js:525–539) kiểm tra từng trục riêng (775–776), nên em bé trượt dọc theo vật cản.

### 2.5 Camera và rung

- Trong ải: `W.cam += (camTo - W.cam) * Math.min(1, dt * 6)` (combat.js:1049), lệch 150 điểm ảnh khi có trùm (1047). Phòng vuông rộng `G.W` nên thường `camTo = 0`.
- Rung: `W.shake` (combat.js:633, 552; moves.js:517, 599…) giảm ở combat.js:1044. Độ lệch tính bằng `fx.shakeOffset` (fx.js:504) và áp vào `drawWorld` (combat.js:1074–1078).
- Khựng hình (hit-stop): `stop(ms)` (fx.js:462) được gọi khi trúng đòn với 45/70/90/100/115 ms (fx.js:954). Trong lúc khựng, `fx.frozen` (fx.js:475–491) làm `G.updateWorld` dừng sớm. Các cờ bấm `PRESS = ['atkP','dodgeP','specialP','skillP','swapP','potionP']` (fx.js:472) được giữ lại (latch) và trả ở tick sau.
- Ở làng: `S.cam` (village_scene.js:799–801).

### 2.6 Physics, trọng lực, trục z — nhảy/rơi/tiếp đất: **KHÔNG TỒN TẠI**

Đã tìm bằng các lệnh:
```
grep -nEi "\bjump|\bfall\b|\blanding\b|\bland\b|gravity|\bvz\b|onGround|grounded" game/js/*.js
grep -nE "\.z\s*[-+]?=" game/js/*.js
```
Kết quả chỉ gồm tên kiểu chết của quái (`'fall'`, art.js:1206, 1280), biến vẽ cục bộ (`fall` trong art.js), mốc rơi đạn trùm (`s.land` art.js:1477) và mũi tên hạ độ cao `o.z` (combat.js:943). Chú thích ở boss.js:3 nói rõ: *"Người chơi không nhảy: chiêu nào cũng né được bằng đi bộ hoặc lộn"*. Độ cao giả duy nhất:
- `e.mvLift` (moves.js:888, 921): quái bị hất tung, vẽ bằng `up = sin(...)*10` (combat.js:1100).
- `o.z` của mũi tên (moves.js:444 `z: B.z0`, combat.js:943) và đạn quái (mobs.js:194).
- Hạt có trọng lực riêng: `o.vy += 90 * dt` (combat.js:1038). Đây là hạt hiệu ứng, không phải nhân vật.

---

## 3. Input

### 3.1 Nguồn (engine.js)

| Nguồn | Mã | Ghi chú |
|---|---|---|
| Bàn phím | engine.js:102–111 | `G.keys[code]` = đang giữ; `G.keyP[code]` = vừa bấm, chỉ khi phím chưa giữ nên **lặp phím tự động không tạo lần bấm mới**. Bỏ qua phím khi có Ctrl/Meta/Alt (106). Chặn mũi tên, Space, Tab (105). |
| Chuột / cảm ứng | engine.js:114–153 | Pointer Events: `pointerdown` tạo `o = {id,x,y,sx,sy,role:null,stale}` vào `G.pointers` và `G.downs` (132–134). Chuột chỉ nhận nút trái (129). `pointerup` thành `G.click` nếu `!o.role && !o.stale` và kéo < 12 (149). Toạ độ được xoay khi khoá ngang `G.rot` (118–123). |
| Chạm đồng bộ | engine.js:157–168 | `G.syncTaps` cho nút cần chạy ngay trong sự kiện chạm (đăng nhập Google). |
| Mất tiêu điểm | engine.js:174–181 | `blur` hoặc trang ẩn → `dropInput()` xoá `G.keys`, `G.keyP`, `G.pointers`. Trong ải gọi thêm `G.scene.hide()` → tạm dừng (stage.js:737). |
| Bot | stage.js:683 `G.botInput ? G.botInput(S) : readInput()` | Bộ kiểm thử thay hàm này (tests/bot.js:66, tests/au_lib.js:31). Khi có `G.botInput` thì **bỏ qua hoàn toàn** bàn phím và cảm ứng. |

`G.keyP` và `G.downs` được xoá **sau mỗi tick** (engine.js:565–566). Nếu một khung trình duyệt chạy 2 tick thì chỉ tick đầu thấy lần bấm. Nếu khung không chạy tick nào (màn hình 120 Hz), lần bấm được giữ tới tick sau.

### 3.2 Chuyển thành cờ — `readInput()` (stage.js:614–656)

```js
atk: !!(k.KeyJ || k.KeyZ || k.Space), atkP: !!(kp.KeyJ || kp.KeyZ || kp.Space),
dodgeP: !!(kp.KeyK || kp.KeyX || kp.ShiftLeft), specialP: !!(kp.KeyL || kp.KeyC), skillP: !!(kp.KeyI || kp.KeyV), skill: !!(k.KeyI || k.KeyV),
swapP: !!(kp.KeyQ || kp.Tab), potionP: !!(kp.KeyE || kp.KeyH), pauseP: !!(kp.Escape || kp.KeyP), mapP: !!kp.KeyM,
```
Cảm ứng (624–655): mỗi ngón mới trong `G.downs` được gán `role` một lần:
- `swapP` khi chạm vào dải vũ khí `(368,0,112,38)`, `mapP` khi chạm bản đồ nhỏ, `potionP` khi chạm ô `POT`, `pauseP` khi chạm `PAU`. Các ngón này nhận `role = 'ui'`.
- Nút tròn gần nhất trong `BTN` (`atk, dodge, special, skill`; vị trí ở stage.js:599–606, `btnPos`) cho `role = 'atk'|'dodge'|'special'|'skill'` và bật cờ `…P` tương ứng.
- Nửa trái màn hình (`x<240, y>48`) khi chưa có cần điều khiển: `role = 'joy'`. Chạm chỗ khác: `role = 'none'`.
- Mỗi tick, các ngón đang giữ cho: `role 'atk'` → `inp.atk = true`, `'skill'` → `inp.skill = true`, `'joy'` → `mx,my` (vùng chết 0.18, bán kính 24) (646–655).

Ở làng (village_scene.js:743–766): phím di chuyển, `talkP` (J/Z/Space/Enter), nút tròn "nói chuyện", cần điều khiển, chạm nhanh vào đất → `tapWorld`.

### 3.3 Bảng phím → cờ → hàm xử lý → trạng thái animation

| Phím / chạm | Cờ | Hàm xử lý (tệp:dòng) | Trạng thái animation bị kích hoạt |
|---|---|---|---|
| W/A/S/D, mũi tên; cần ảo bên trái | `mx, my` | combat.js:741–751 (đi), M.input moves.js:172–173 (hướng nhắm) | `P.moving` → `move` (lặp theo `P.chayT`); `face` |
| J / Z / Space; nút tròn **atk** | `atkP` (vừa bấm), `atk` (giữ) | stage.js:698 (gần đồ vật thì thành `interact`); combat.js:678 `M.input` → 776 `M.act` (moves.js:538) | Kiếm: `swordChain` → `begin` → `atkT` (hàng `atk_sword`, tư thế `comboI` 0..2). Ngay sau Né: `swordGlide` → `dashT` (hàng `move` ×2). Cung/giáo/búa: `mv.holding = true` (khung giương hoặc lấy đà, sprite_custom.js:608) → khi nhả: `release` → `bowTap`/`spearTap`/`hammerTap` (`atkT`) hoặc `bowRelease`/`spearLunge`/`hammerRelease` |
| K / X / ShiftLeft; nút **dodge** | `dodgeP` | combat.js:673 (bộ nhớ `dodgeBuf` 0.15 s), 758–770; búa có "giáp nhẹ" 754–757 | `dodgeT = 0.27` → hàng `ne` (sprite_custom.js:604), `inv ≥ 0.32`; huỷ `atkT` (763) |
| L / C; nút **special** | `specialP` | combat.js:771–772 `special` → `G.moves.cast` (moves.js:759) hoặc mưa tên | `specT = 0.35` → hàng `cast` hoặc `atk` (sprite_custom.js:606) |
| I / V; nút **skill** (giữ được) | `skillP`, `skill` | combat.js:773 `G.chuong.input` (chuong.js:271) → `CH.fire` (239) | `castT = 0.3` → hàng `cast` (sprite_custom.js:607); giữ để tích lực: `chHold` (đi chậm 0.6) |
| Q / Tab; chạm dải vũ khí | `swapP` | combat.js:780–791 | huỷ đòn: `atkT=0; hitDone=true; mv.cur=null; comboI=-1`; fx `swap` |
| E / H; ô bình máu | `potionP` | combat.js:792–798 | fx `potion` (không có hàng animation riêng) |
| Esc / P; nút Dừng | `pauseP` | stage.js:684 `setMode('paused')` | dừng cả thế giới |
| M; bản đồ nhỏ | `mapP` | stage.js:685 | dừng cả thế giới |
| (bị đánh) | — | combat.js:621–647 `G.hurtPlayer` | `hurtT = 0.2` → hàng `hit`. **Chỉ hiện khi không đang đánh, lộn, lướt hay giữ** (thứ tự ưu tiên ở sprite_custom.js:603–616) |
| (máu hết) | — | combat.js:644 | `dead`, `deadT` → hàng `die` |
| (nổ băng của quái) | — | mobs.js:168 | `frozenT = 0.65`, huỷ `atkT`. Không có hình riêng: thân hiện `idle` |

Thứ tự chọn hàng của thân ảnh AI (sprite_custom.js:603–616): `die` > `ne` (lộn) > lướt (`move` ×2) > `specT` > `castT` > giữ lấy đà > `atk*` (đang chạy thì `move`, vì `G.CHAY_DANH = 'than'`) > `hit` > `move` > `idle`. Thân vẽ bằng code (`pick`, hero_art.js:1098–1119) có cùng thứ tự.

### 3.4 Các bộ nhớ đệm (buffer) của nút Đánh — moves.js:168–196

- `mv.pressBuf = C.buffer (0.25)` khi vừa nhấn (175). Kiếm ra nhát kế tiếp ngay khi `cdT <= 0` nếu `held || pressBuf > 0` (moves.js:551).
- `mv.buf = 0.25` khi nhả lúc đang bận (177). Cung, giáo, búa ra đòn bấm khi rảnh (moves.js:575–577).
- Khi đang lộn, hai bộ nhớ trên không bị trừ thời gian (180–182).
- `mv.afterDodge = 0.35` sau khi lộn xong (185) → Nhát lướt của kiếm (553).

---

## 4. Luồng C — từ nhấn phím tới sát thương

### 4.1 Các bước (kiếm, bấm J một lần)

| # | Bước | Tệp:dòng | Thời điểm (60 fps) |
|---|---|---|---|
| 1 | `keydown` → `G.keys.KeyJ = true; G.keyP.KeyJ = true` | engine.js:104–108 | sự kiện trình duyệt |
| 2 | Tick kế tiếp: `G.tick` → `StageScene.update` → `readInput()` → `inp.atk = inp.atkP = true` | engine.js:562–564; stage.js:683, 619 | ≤ 1 khung sau phím. [đã đo] 9,9 ms |
| 3 | `G.updateWorld` → `fx.frozen` (không khựng) → `G.updatePlayer` | combat.js:917–918 | cùng tick |
| 4 | `M.input`: `held = true`, `mv.holdT = 0`, `mv.pressBuf = 0.25` | moves.js:170, 175 | cùng tick |
| 5 | Nhánh hành động: không Né, không Đặc biệt, không Chưởng → `M.act` | combat.js:758–776 | cùng tick |
| 6 | `M.act` kiếm: `(held || pressBuf>0) && cdT<=0` → `swordChain` → `aim` (chọn quái gần nhất, `setAim` đổi `face`, `aimRel`) → `begin(P, w, {kind:'chem', pose:i,…}, 0.3)` | moves.js:550–553, 347–352, 304–311 | cùng tick: **`atkT = atkDur = 0.3`**, `cdT = 0.3`, `hitDone = false`, `comboI = 0`, `mv.cur = o` |
| 7 | Vẽ khung đó: `G.heroArgs` → `atk = 1 - atkT/atkDur = 0` → A.hero → `SC.chonEmBe` → `theoDon('atk_sword', 0, comboI)` → `khungDon`: `i6 = 2*combo + (u >= 0.4 ? 1 : 0)` | combat.js:1060; sprite_custom.js:612, 586–590 | khung `atk_sword#0` (lấy đà) |
| 8 | Các tick sau: `atkT -= 1/60` (combat.js:652). Từ `u ≥ 0.4` chuyển sang khung chém `#1` | sprite_custom.js:588 | +8 tick (0,133 s, u = 0,444) |
| 9 | Điểm chạm: `atkT <= atkDur*(1-0.45)` → `M.hit(P)` → `boxHit` → `G.cb.playerHit` → **`G.damage`** → `FX('hit')` (gọi `stop(ms)` cho khựng hình) → `swingFx` (fx `mvSwing`, vệt chém) | combat.js:801; moves.js:582–592, 319–325; combat.js:438–452, 247 | +9 tick (0,150 s, **u = 0,5**, chậm 1 tick so với mốc 0,45 vì làm tròn theo tick) |
| 10 | Khựng hình (chỉ khi có vẽ): `G.updateWorld` dừng sớm, `atkT` đứng yên, khung giữ nguyên | combat.js:917; fx.js:475–487 | +3 tick với kiếm hoặc giáo, +5 tick với búa [đã đo] |
| 11 | Hết đòn: `atkT <= 0` → `heroArgs.atk = -1` → hàng `idle` (khung tính theo `P.t`, **không đặt lại về khung 0**) | combat.js:1060; sprite_custom.js:616 | +19 tick (không khựng) / +22 tick (có khựng) |

Với cung, giáo, búa, bước 6 khác: tick đầu chỉ đặt `mv.holding = true` (moves.js:572–574) và hiện khung giương hoặc lấy đà (sprite_custom.js:608). Đòn **chỉ bắt đầu khi nhả nút**: `!held` → `release` → `charge < min` → `TAPS[type]` (moves.js:558–559, 531–536). Cung không gây sát thương ở điểm chạm. `M.hit` cho `kind === 'ban'` gọi `shoot` để tạo mũi tên trong `W.projs` (moves.js:593–594, 437–448). Sát thương đến khi mũi tên cắt quái (combat.js:938–958, `segHit` 517).

### 4.2 Bảng đo theo tick [đã đo]

Cách đo: dựng phòng trống bằng `AU.room({hero:'smith', melee})`, chọn vũ khí bằng `AU.want`, đặt bia `AU.dummy` (giữ chỗ bằng `AU.pin`) cách 22 px (cận chiến) hoặc 80 px (cung). Tại tick 1 bơm `atk = atkP = true` qua `G.botInput` và giữ 3 tick (0,05 s). Bọc tạm `G.damage` ngay trong trang, không sửa tệp. Mỗi tick ghi `P.atkT/atkDur`, `P.hitDone`, `P.mv.kind/holding`, khung do `SC.chonEmBe(sp, G.heroArgs(P))` trả về (đã nạp `em-be-smith.sprite.json` + `em-be-smith-don.sprite.json` bằng `G.spriteCustom.add`), và số tên của người chơi trong `W.projs`. Có hai chế độ: "sim" (`G.sim`, không khựng hình, giống bot kiểm thử) và "fx" (`G.noRender = false`, có khựng hình như lúc chơi thật). Thời điểm tính bằng tick kể từ tick 1, tức tick nhận phím; 1 tick = 16,7 ms.

Hàng sprite (thân AI smith): `idle 6/1s, move 8/0.65s, atk_sword 6/0.45s, atk_bow 6/0.45s, atk_spear 6/0.45s, atk_hammer 6/0.55s, ne 6/0.4s, hit 4/0.2s, die 8/0.6s, cast 6/0.4s`. Cờ `G.DON_VK = true`, `G.CHAY_DANH = 'than'`.

| Vũ khí (`G.WTYPES`) | Đòn | Bắt đầu `atkT` | `atkDur` | Đổi khung (tick: khung, u) | `G.damage` đầu tiên | Tạo tên (`W.projs`) | Hết đòn → idle: sim / fx | Khựng hình |
|---|---|---|---|---|---|---|---|---|
| `sword` | Chém ngang (`chem`) | tick 1 (+0 s, ngay khi nhấn) | 0.30 | 1: `atk_sword#0`; 9: `#1` (u .444) | **tick 10 (+0,150 s), u = 0,500**, khung `#1` | — | tick 20 (+0,317 s) / tick 23 (+0,367 s) | 3 tick |
| `spear` | Đâm (`dam`) | **tick 4** (khi nhả, +0,050 s); tick 1–3: `layDa`, khung `atk_spear#0` | 0.38 | 4: `#0`; 10: `#1` (.263); 15: `#2` (.482); 17: `#3` (.57); 20: `#4`; 24: `#5` | **tick 15 (+0,233 s), u = 0,482**, khung `#2` | — | tick 27 (+0,433 s) / tick 30 (+0,483 s) | 3 tick |
| `hammer` | Nện (`nen`, `hitAt 0.35`) | **tick 4** (+0,050 s); tick 1–3 `layDa` | 0.80 | 4: `#0`; 14: `#1` (.208); sim 23 / fx 28: `#2` (.396); sim 26 / fx 31: `#3` (.458); `#4` (.604); `#5` (.813) | **tick 21 (+0,333 s), u = 0,354, khung `#1`** | — | tick 52 (+0,850 s) / tick 57 (+0,933 s) | 5 tick |
| `bow` | Bắn (`ban`, đứng yên 0,38) | **tick 4** (+0,050 s); tick 1–3 `layDa`, khung `atk_bow#0` | 0.38 | 4: `#0`; 8: `#1` (.175); 11: `#2` (.307); 15: `#3` (.482); 19: `#4`; 23: `#5` | **tick 26 (+0,417 s)**, mũi tên bay 80 px (290 px/s) | **tick 15 (+0,233 s), u = 0,482**, khung `#3` | tick 27 (+0,433 s) / tick 27 | 0 (tên thường không khựng, fx.js:952 chỉ khựng khi `big`) |

Bàn phím thật, vòng lặp rAF thật (`page.keyboard.down('KeyJ')`, giữ 60 ms rồi nhả; đo bằng `performance.now()`):

| Vũ khí | Phím xuống → tick ra đòn | Phím nhả → `atkT` đặt | Phím xuống → `G.damage` | Phím xuống → về idle |
|---|---|---|---|---|
| sword | 9,9 ms (ra đòn khi nhấn) | — | 160,5 ms | 377,6 ms |
| spear | 0,5 ms (vào `layDa`) | 3,1 ms | 252,4 ms | 500,7 ms |
| hammer | 6,1 ms (`layDa`) | 7,0 ms | 358,0 ms | 956,1 ms |
| bow | 6,8 ms (`layDa`) | 10,5 ms | 440,7 ms (bia 80 px) | 457,0 ms |

Các con số khớp với chế độ fx: kiếm 9 tick tới sát thương cộng khựng hình. Với giáo, búa, cung, mọi mốc **dịch đúng bằng thời gian giữ phím** (khoảng 65 ms).

Nhận xét từ số đo:
1. **Kiếm ra đòn khi nhấn, ba vũ khí còn lại ra đòn khi nhả** [đã đo]. Lý do: từ V12, cung/giáo/búa vào tư thế lấy đà ngay khi chạm (moves.js:569–574) và chỉ quyết định "bấm" hay "giữ" lúc nhả (moves.js:559 → 531–536). Nếu giữ dưới mức `min` của đà (cung 0.3 → khoảng 0,385 s, búa `min 0.45` của `time 1.1` → khoảng 0,66 s) thì vẫn chỉ là đòn bấm, nhưng ra **muộn đúng bằng thời gian giữ**.
2. Búa: **sát thương xảy ra khi hình còn ở khung 1 (u 0,354)**. Khung nện `#3` (MOC_DON `atk_hammer` mốc 0,45, sprite_custom.js:585) hiện sau đó 5 tick (sim) hoặc **10 tick = 0,167 s** (fx, vì khựng hình giữ nguyên khung 1). Nguyên nhân: `G.MOVES.hammer.swing.hitAt = 0.35` (moves.js:74) trong khi chú thích ở sprite_custom.js:583 ghi "khung chạm … rơi đúng lúc đòn chạm 0,45".
3. Kiếm chạm ở u = 0,5 thay vì 0,45 vì so sánh `atkT <= atkDur*0.55` được làm sau khi trừ dt (combat.js:652, 801), làm tròn lên 1 tick. Khung chém (`u ≥ 0.4`) hiện trước sát thương 1 tick, nên vẫn khớp.
4. Khựng hình **chỉ có khi vẽ** (`!G.noRender`, combat.js:917; fx.js:476). Bài kiểm thử dùng `G.sim` nên mỗi nhát ngắn hơn lúc chơi thật 3–5 tick.
5. Thời lượng ghi trong tệp sprite (`giay` 0.45/0.55 của các hàng `atk_*`) **không được dùng cho đòn đánh**. Khung chọn theo `u = 1 - atkT/atkDur` (sprite_custom.js:602, 612), nên hàng đòn luôn kéo dài đúng bằng `atkDur` của moves.js (0,3 s đến 0,8 s).

---

## 5. Lỗi tiềm ẩn liên quan

| # | Vấn đề | Bằng chứng | Mức chắc chắn |
|---|---|---|---|
| L1 | **Input bị nuốt khi chuyển phòng.** Trong `S.trans` (0,13 + 0,2 s, stage.js:772) `readInput()` không được gọi, mà `G.keyP` và `G.downs` vẫn bị xoá mỗi tick. Phím bấm trong lúc đó mất hẳn. Ngón chạm xuống trong lúc đó **không bao giờ được gán role**, nên cần điều khiển không chạy cho tới khi nhấc ngón chạm lại; lúc nhấc ngón lại bị tính thành `G.click`. | stage.js:676–681 (return trước 683); engine.js:565–566. [đã đo] `pl1/do_trans.py`: ngón chạm trong lúc trans → `role` vẫn `null` sau khi trans kết thúc, kéo cần 24 px trong 10 tick thì `P.x` đổi 0. Phím J bấm trong trans → `atkT = 0`, `mv.kind = ''` | đã đo |
| L2 | **Cung/giáo/búa ra đòn bấm khi nhả, không phải khi nhấn.** Giữ phím hoặc ngón lâu (người chơi trên điện thoại thường chạm 80–200 ms) thì đòn trễ tương ứng. Với búa, giữ tới gần 0,66 s vẫn chỉ ra nhát thường. | moves.js:558–559, 572–574, 531–536; bảng 4.2 | đã đo |
| L3 | **Búa: sát thương lệch trước khung nện** 5–10 tick. | moves.js:74 `hitAt: 0.35`; sprite_custom.js:585 `atk_hammer: [0, 0.2, 0.38, 0.45, …]`, chú thích 583; bảng 4.2 | đã đo |
| L4 | **Hàng `cast` (chưởng) bỏ mất 25% đầu.** `CH.fire` đặt `P.castT = 0.3` nhưng ba nơi chọn khung chia cho 0.4, nên `u` bắt đầu từ 0,25: khung 0 và 1 của `cast` (mốc 0, 0.12) không bao giờ hiện, đòn mở đầu ở khung 2. | chuong.js:244; sprite_custom.js:607; hero_art.js:1104; hero_tinhlinh.js:1174 | đã thấy (số học chắc chắn; chưa chụp hình) |
| L5 | **Hằng số thời gian lặp lại ở nhiều nơi, dễ lệch nhau:** lộn `0.27` (combat.js:760 và 1060), bị đánh `0.2` (combat.js:632 và sprite_custom.js:614), đặc biệt `0.35` (combat.js:564 và sprite_custom.js:606, hero_art.js:1103). Đổi một chỗ là animation chạy sai tỉ lệ (L4 là một ca đã lệch). | các dòng nêu | đã thấy |
| L6 | **Idle không bắt đầu lại từ khung 0** sau đòn, lộn hay bị đánh. Khung idle tính theo đồng hồ tuyệt đối `P.t` (`lap('idle', t)`), nên sau đòn rơi vào khung bất kỳ. | sprite_custom.js:599, 616; số đo: hết đòn kiếm → `idle#2`, giáo → `idle#2/#3`, búa → `idle#5/#0` | đã đo |
| L7 | **Hình "bị đánh" bị che bởi đòn đánh.** `hurtT` (0,2 s) xếp sau `atk`, giữ lấy đà, lộn và lướt, nên trúng đòn giữa nhát chém chỉ thấy chớp trắng (`emBeTint`), không có tư thế giật. | sprite_custom.js:603–616, 631 | đã thấy |
| L8 | **Đóng băng (`frozenT`) không có trạng thái animation.** Nó huỷ `atkT` nhưng không đặt `hitDone` hay `mv.cur`, và không huỷ `mv.holding` (vì `return` trước `M.input`). Thân hiện `idle` (hoặc khung giữ đà) suốt 0,65 s. | combat.js:675; mobs.js:168; sprite_custom.js:603–616 không đọc `frozenT` | đã thấy (hệ quả hình ảnh là suy luận) |
| L9 | **Khựng hình dừng thế giới nhưng `G.time` vẫn chạy.** `mv.lastT`, `P.lastAtk` (dùng cho khoảng nghỉ chuỗi `gap 0.45`, moves.js:192) so với `G.time`, nên đoạn khựng 45–115 ms bị tính vào khoảng nghỉ: đánh liên tiếp vào đám đông thì chuỗi dễ quay về nhát đầu hơn lúc chạy bot (không khựng). | engine.js:563; combat.js:917; moves.js:192, 309 | suy luận |
| L10 | **Hành vi khác nhau giữa bot kiểm thử và lúc chơi thật:** `G.sim` / `G.noRender` tắt khựng hình (fx.js:476), nên mọi số đo thời gian bằng bot thiếu 3–5 tick mỗi nhát trúng. | bảng 4.2 cột sim / fx | đã đo |
| L11 | **Đang đánh thì bấm J gần đồ vật bị đổi thành tương tác**, và việc giữ nút Đánh bị tắt (`inp.atk = false`) khi có `S.near`. Đây có thể là ý đồ thiết kế, nhưng sẽ làm đòn giữ (lấy đà cung/búa) tự nhả khi đi ngang qua rương hay suối. | stage.js:698–699; moves.js:174 (`relP`) | suy luận |
| L12 | **Đòn dở dang đi qua cửa.** `enterRoom` đặt lại `dashT, dodgeT, slideT, spearOut` nhưng không đặt lại `atkT, hitDone, mv.holding, frozenT, hurtT`. Trong `S.trans` thế giới đứng yên, nên nhát chém dở tiếp tục và có thể gây sát thương ở phòng mới. | stage.js:349–350; combat.js:186–188 | suy luận |
| L13 | **Phụ thuộc dt:** logic chạy bước cố định nên không phụ thuộc tốc độ khung. Nhưng khi khung > 100 ms (`Math.min(0.1, …)`) hoặc cần > 5 tick, phần dư bị bỏ và game chạy chậm lại (không phải giật bù). Hiệu ứng làng (`dt*6`), camera và lerp đều dùng dt cố định nên ổn định. | engine.js:624–628 | đã thấy |
| L14 | Khung vẽ đứng yên (`nenVe` 10/30 khung/giây) chỉ giảm số lần vẽ; nhịp animation vẫn tính theo thời gian nên không sai khung, chỉ thưa hơn. Animation chạy (`move`) ở chế độ pin 30 khung/giây sẽ bỏ một nửa khung. | engine.js:599–619 | suy luận |
| L15 | Trường chết hoặc thừa: `e.state = 'move'` (combat.js:207) và `G.tickDraw` (engine.js:627) không ai đọc; `gongT` không còn chỗ gán (chỉ khởi tạo ở combat.js:109). | lệnh grep ở mục 1.3 và 2.1; `grep -n "gongT" game/js/*.js` | đã thấy |

Không tìm thấy lỗi kiểu "đứng mãi ở hàng đòn" ở người chơi: cả 4 vũ khí đều về idle ngay tick đầu tiên có `atkT <= 0` [đã đo]. Quái về `idle` khi hết `act.end` (mobs.js:253). Trùm về `idle`/`move` khi hết `busy` (boss.js:404–407).

---

## 6. Những điều nên giữ lại khi thiết kế lại

- Bước cố định 1/60 cùng bộ tích luỹ, và việc tách tần số vẽ khỏi tần số logic (engine.js:621–644).
- Ý tưởng "animation suy ra từ bộ đếm thời gian của luật chơi" (`u = 1 - atkT/atkDur`). Nhờ vậy khung luôn khớp với thời lượng đòn thật, đổi số ở `G.MOVES` thì hình tự giãn theo. Chỉ cần gom các hằng số (L4, L5) về một chỗ.
- Mốc chạm do luật quyết định (`P.hitAt`, combat.js:801). Hình phải theo mốc này chứ không ngược lại; nên lấy `hitAt` cho cả bảng `MOC_DON` (L3).
- Bộ nhớ nút (pressBuf, buf, dodgeBuf), latch nút trong lúc khựng hình (fx.js:472–488), và việc lặp phím tự động không tạo lần bấm mới (engine.js:107).
- Quái và trùm đã có state animation rõ ràng (`e.an`, `b.an` với `play`/`loop`); có thể dùng làm mẫu cho em bé.

## 7. Điều chưa chắc

- Chỉ đo với thân AI gốc `em-be-smith` (+ tệp `-don`). Thân theo bộ (`SC.thanBo`) và thân vẽ bằng code (`pick`, hero_art.js) chưa đo theo tick. Thân vẽ bằng code dùng `Math.floor(o.atk * n)` (hero_art.js:1110–1113) nên có mốc khung khác.
- Các con số "+ms" ở chế độ bàn phím thật đo trong Chromium headless, có lúc một khung chạy 2 tick. Trên máy thật, độ trễ phím → tick vẫn ≤ 1 khung, nhưng phần vẽ có thể chậm thêm 1 khung.
- L9, L11, L12, L14 là suy luận, chưa có kịch bản đo riêng.
- Chưa đo đòn giữ (Tên mạnh, Xốc tới, Nện đất), chuỗi 2–3 của kiếm, cũng như Nhát lướt hay Đặc biệt. Cách đo giống mục 4.2, chỉ cần đổi số tick giữ hoặc bơm `dodgeP` trước.
