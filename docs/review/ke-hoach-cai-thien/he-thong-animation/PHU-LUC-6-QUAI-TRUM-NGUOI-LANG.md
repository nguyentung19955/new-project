# Phụ lục 6 — Quái, trùm, người làng: animation, máy trạng thái, liên hệ khung ảnh ↔ sát thương

Commit đối chiếu: `229e263` (nhánh `khoi-tao-du-an`). Mọi `tệp:dòng` theo commit này. Phiên CHỈ PHÂN TÍCH — không sửa gì trong `game/`.
Số đo lấy bằng Playwright (Chromium, 844×390, `file:///…/game/index.html`, nạp `tests/setup.js` + `tests/au_lib.js`), script tạm ở thư mục nháp `pl6/` (`do_quai.py`, `do_trum.py`, `do_elite.py`, `do_vai.py`, `do_hit.py`, `do_nl.py`, `meta.py`, `gen.py`). Ký hiệu: **[đo]** = đã đo/đã thấy trên trang; **[code]** = đọc thẳng từ code; **[suy luận]** = lập luận từ code, chưa đo riêng.

> Lưu ý quan trọng khi đo: `index.html` (bản dev) **không nạp ảnh AI** — `Object.keys(G.spriteCustom.ds).length === 0` **[đo]**. Ảnh `*.sprite.json` chỉ vào game qua `G.customSpriteData` do `game/build.py` nhúng (`sprite_custom.js:2592`). Vì vậy script đo tự gọi `G.spriteCustom.add(<nội dung tệp>)` cho đúng những tệp cần đo (đúng đường nạp của bản đóng gói), rồi đợi `sp.ready`.

---

## 0. Tóm tắt nhanh

| # | Phát hiện | Bằng chứng |
|---|---|---|
| 1 | Thân quái/trùm có ảnh AI được vẽ bằng một **"bút giả"**: `monster_art.js` vẫn chạy toàn bộ tư thế (Pose) vẽ-bằng-code, lệnh `drawImage` thân đầu tiên bị thay bằng `SC.veQuai`. Code còn quyết định bóng, hiệu ứng rời, và **có vẽ thân hay không** (`P.a > 0`). | `sprite_custom.js:454-473`, `monster_art.js:1440-1447` [code]; Nấm Phồng nổ: thân AI biến mất từ atk u≈0,19 tới 0,83 [đo] |
| 2 | Thời lượng hàng ảnh **một lần** (tele/atk/hit/die) **không dùng `giay` của tệp ảnh** khi quái có định nghĩa code: hàng ảnh bị kéo giãn theo `d` của `monster_art.js` (`MA.dur` gốc trả trước). Chỉ hàng **lặp** (idle/move) dùng `giay` của ảnh. | `sprite_custom.js:329-332, 461, 474-479` [code] |
| 3 | Sát thương của quái thường rơi đúng **lúc hết báo trước = khung atk 0** (vùng `z.t` hết hạn cùng lúc `act.t ≥ T`), không theo "khung chạm" vẽ trong ảnh (`cham`). Khựng hình (hitstop) làm khung atk 0 hiện **sau** lúc trúng ~5 tick. | heoCon: trúng +0,567 s, atk[0] hiện +0,650 s; boHung +0,583 / +0,667 [đo] |
| 4 | Lượt đánh kết thúc (`A.end`) **trước** khi hàng atk chạy hết: heoCon chỉ tới khung atk 2/5, boHung 3/5, socNo 4/5 (khung 5 không bao giờ hiện). | [đo] + Bảng D cột cuối |
| 5 | **Tinh anh chiêu riêng (`chieu1`) phát phần báo trước 2 lần**: `begin` phát `chieu1`, tới mốc T `stepAct` gọi lại `play(e,'chieu1')` → hoạt ảnh quay về t=0. Sát thương rơi vào lần tele thứ hai. | Cua Tướng, Tướng Ma [đo]; `mobs.js:425, 249` |
| 6 | **Quái gai (spiky) "dựng gai" 2,2 s không bao giờ hiện hàng tele** — `play(e,'tele',0.5)` bị `loop(e,'idle')` đè ngay trong cùng tick; hàng atk khi bắn gai chỉ sống 1 tick. | nhimDoc [đo]; `mobs.js:325, 237-239` |
| 7 | **Quái cảm tử (kami)** biến mất không có hoạt ảnh chết (đặt `e.dead` thẳng, không qua `G.kill`). | namPhong: `DEAD`, không có bóng chết trong `fx` [đo]; `mobs.js:221` |
| 8 | Trùm vùng: sprite đổi tele→atk ở **u = 0,4 cố định** (`SC.chonQuai`), còn sát thương ở `moc[0]` riêng từng chiêu (0,22…0,42). Hồ Tinh c2 "Vồ mồi": trúng lúc ảnh còn **tele:2**, atk:0 hiện trễ ~0,4 s; Mộc Tinh c2 "Rễ đâm" tương tự. | [đo] mục 5.3 |
| 9 | Chuyển pha trùm: nửa đầu cảnh `phase2/3` dùng ảnh pha cũ, đổi tệp `-p2/-p3` ở u=0,5 có chớp trắng che. Pha 2/3 không có hàng `move/die` → đi dùng `idle` của tệp pha, chết dùng `hit` của tệp pha + mờ. | [đo]; `sprite_custom.js:359-374` |
| 10 | Trùm trúng đòn: `t = 0.4 − hitT` với `hitT = 0.3` → **khung hit 0 của trùm không bao giờ hiện**, bắt đầu từ khung 1. | [đo] `do_hit.py`; `boss.js:430`, `mobs.js:131` |
| 11 | Người làng: tệp có `idle` + `noi` 6 khung, nhưng game **chỉ vẽ khung idle 0 đứng yên** (cờ `G.NL_DONG` mặc định tắt). | [đo] `do_nl.py`; `sprite_custom.js:1288-1289` |
| 12 | Không có quái nào "chỉ có canvas": 36/36 định nghĩa trong `monster_art.js` đều có tệp ảnh AI. Canvas thuần chỉ còn ở (a) bản dev `index.html`, (b) lúc ảnh rời chưa tải xong, (c) bia thử `noArt`, (d) đường cũ `art.js` (`drawMon`, `mocDraw`…), (e) ảo ảnh Hồ Tinh (không tìm thấy chỗ tạo). | `defs.json` [đo]; mục 1.6 |

---

## 1. Quái thường, tinh anh (mobs.js + monster_art.js + sprite_custom.js)

### 1.1 Sơ đồ tệp và cây gọi hàm

```
main loop: engine.js:562 G.tick → G.scene.update(STEP=1/60)
  └─ combat.js:914 G.updateWorld(dt, inp)
       ├─ combat.js:917  if (G.fx.frozen(dt)) return        ← khựng hình (hitstop) dừng CẢ thế giới
       ├─ combat.js:919  for e of W.ents → updateEnemy(e)     (combat.js:816)
       │     └─ combat.js:822  if (G.mob && e.art) G.mob.update(e, dt)   → mobs.js:214
       │           ├─ e.an.t += dt*spd                         (mobs.js:216)
       │           ├─ spawnT / dive / frozen|stun (huỷ act + vùng)  (mobs.js:222-228)
       │           ├─ e.act ? stepAct (mobs.js:242) : think (mobs.js:275)
       │           └─ if (!e.act && !e.dive) loop(e, moving?'move':'idle')   (mobs.js:239)
       ├─ combat.js:926  G.updateBoss(W.boss)                  → boss.js:364
       ├─ combat.js:927  G.mob.tick(dt)  (G.later hẹn giờ, mobs.js:474)
       └─ combat.js:969-1013  vùng (zones): z.t -= dt; z.t<=0 → G.inZone → G.hurtPlayer (combat.js:982-984)
  G.kill(e) combat.js:374 → e.dead=true, G.mobOnKill (mobs.js:145), FX('death') → fx.js:1785 (bản chụp "đang chết")
  W.ents = W.ents.filter(!dead) combat.js:1036

vẽ: combat.js:1069 G.drawWorld → combat.js:1102/1107 A.enemy(c,e)  (mini boss: combat.js:1119 A.enemy)
  └─ mobs.js:842 A.enemy (bọc art.js:1647)
       ├─ chọn n/t: die / frozen / stun / hitT / rev / cut / tele-theo-wind / atk-nặng  (mobs.js:845-859)
       └─ G.monsterArt.draw(c, e.art, x, y, o)   (mobs.js:878)
            └─ sprite_custom.js:454 MA.draw (bọc) — có ảnh AI & ready?
                 ├─ không: draw0 = monster_art.js:1426 (vẽ hoàn toàn bằng canvas)
                 └─ có:   draw0.call(MA, butGia, …)  → Pose + bóng + hiệu ứng code;
                          drawImage đầu tiên → thay() → SC.veQuai(c, sp, x, y, o, false, D=dur0)   (sprite_custom.js:463-468)
                               └─ SC.chonQuai(sp, n, t, D) (sprite_custom.js:328) → {ten, i, alpha, dy}
                               └─ SC.phaTrum (trùm, sprite_custom.js:345)
                               └─ SC.veKhung(c, sp, ten, i, face, o)  (sprite_custom.js:309) → c.drawImage(sp.img, …)
  bóng chết: fx.js:2340 dyingDraw → fx.js:2349 A.enemy(c, snap) với snap.dying = k
```

### 1.2 Hai nguồn hình

| Nguồn | Tệp | Bản chất | Khi nào hiện |
|---|---|---|---|
| Canvas "lưới điểm ảnh + Pose" | `monster_art.js` (2322 dòng, ghép tự động từ `docs/phac-thao/quai-hoat-hinh/nguon`) | `def(id,{luoi, parts, anims:{ten:{d,lap,f,moc}}, don, chet, hien})` (`monster_art.js:1409-1412`); khung chọn theo `MA.fps = 12` (`monster_art.js:1107, 1430`) | Không có ảnh AI / ảnh chưa `ready` |
| Ảnh AI (sprite sheet) | `art/custom/<mã>.sprite.json` qua `sprite_custom.js` | Lưới hàng × cột: hàng = động tác (`hang`), cột = khung (`so`), ô `khung_rong×khung_cao` (×`net`) | Có tệp & `sp.ready` |

Giá trị mặc định khi `def` không khai: `monster_art.js:1406`
```js
const DMAC = { idle: [1.2, true], move: [.6, true], tele: [.7, false], atk: [.55, false], hit: [.35, false], die: [1.1, false], spawn: [1.1, false] };
```

Cách thay thân: bút giả chỉ "ăn" lệnh `drawImage` đầu tiên và vẽ ảnh AI tại `(x,y)` thật của quái (`sprite_custom.js:463-468`):
```js
const thay = function () {
  if (xong) return;
  xong = true;
  c.save(); c.setTransform(T0); c.globalAlpha = a0;
  try { SC.veQuai(c, sp, x, y, o, false, D); } finally { c.restore(); }
};
```
Hệ quả [code]: dời/nhún/xoay/alpha của Pose (`P.x`, `P.h`, `P.rot`, `P.a`) **không** áp lên ảnh AI; nhưng nếu Pose không gọi `ve()` (vì `P.a <= 0`, `monster_art.js:1446`) thì ảnh AI **không được vẽ** ([đo] Nấm Phồng nổ, mục 5.2). Bóng chân và hiệu ứng rời (`P._u`, `P._o`) vẫn của code, đồng bộ theo thời lượng code ở 12 fps.

### 1.3 Máy trạng thái quái (một con)

Trạng thái không có biến enum: được suy từ các trường `e.spawnT`, `e.dive`, `e.act`, `e.spikeUp`, `e.st.*`, `e.hitT`, `e.dying`, và tên hoạt ảnh `e.an.n` (`play`/`loop` — `mobs.js:24-25`).

| Trạng thái (hình) | Vào khi | Thời gian | Ra khi | Sát thương |
|---|---|---|---|---|
| `spawn` (ảnh: hàng `idle` + alpha + dy) | `G.mobInit` → `play(e,'spawn')`, `e.spawnT = dur(spawn)` (`mobs.js:105-106`) | code `spawn` 1,1–1,3 s (×0,7 nếu quái phụ) | `spawnT ≤ 0` → `loop(e,'idle')` (`mobs.js:222`) | không |
| `idle` / `move` (lặp) | không có `act` (`mobs.js:239`) | lặp theo `giay` **của ảnh** | bắt đầu `act` | không |
| `tele` (báo trước) | `begin()` (`mobs.js:185-191`) hoặc `melee()` (`mobs.js:373`) | `T` = 0,45–0,85 s theo vai (Bảng D) | `act.t ≥ T` → `play(atk)` + `A.fire` (`mobs.js:246-251`) | vùng `z.t = T` tạo cùng lúc (`strikeZone`, `mobs.js:172-178`) |
| `atk` | `stepAct` tại T | tới `act.end = T + d_atk·0,75` (lao: ·0,5) (`mobs.js:186, 378`) | `act.t ≥ end` → `loop('idle')`, `e.cd` (`mobs.js:253`) | **đúng lúc vào atk** (vùng hết hạn, `combat.js:982-984`) |
| `hit` (hình) | `e.hitT = 0.3` (`G.mobOnHit`, `mobs.js:131`) — **chỉ hiện nếu đang idle/move** (`mobs.js:849`) | 0,3 s | hết `hitT` | — |
| `stun` (hình `hit` lắc) | `e.st.stun > 0` (vũ khí `stagger`, `combat.js:456`) | theo `st.stun` | hết choáng; **huỷ act chưa ra đòn + huỷ vùng** (`mobs.js:224-227`) | — |
| `frozen` (hình `idle` khung 0) | `e.st.frozen > 0` (`mobs.js:847`) | | | — |
| `dive` (nimble lặn) | `startDive` (`mobs.js:390`): `spawn` chạy ngược → ẩn → vòng báo 0,75 s → `spawn` ×1,8 | | `stepDive` xong (`mobs.js:412-415`) | vùng tròn r=20 lúc trồi (`mobs.js:407`) |
| `die` | `G.kill` → `fx.js:1785` bản chụp `snap.dying = 0..1` trong `dur(die)` s | code `die` 1,1–1,5 s | `fx.js:1819-1822` xoá bản chụp | — (trừ tinh anh "Nổ khi chết", `mobs.js:147-150`) |

Đoạn đổi tên cử động → hàng ảnh (`sprite_custom.js:333-341`):
```js
if (n === 'idle' || n === 'intro') return lap('idle');
if (n === 'move') return lap('move');
if (n === 'tele' || n === 'phase2' || n === 'phase3') return mot('tele', u);
if (n === 'atk') return mot('atk', u);
if (n === 'hit') return mot('hit', u);
if (n === 'stun') { const r = mot('hit', 0.35 + 0.15 * Math.sin(t * 9)); r.u = 1; return r; }
if (n === 'die') { const r = mot('die', u); r.alpha = 1 - seg(u, dt.die && dt.die.mo != null ? dt.die.mo : 0.6, 1); return r; }
if (/^chieu|^c\d$/.test(n)) return u < 0.4 ? mot('tele', u / 0.4) : mot('atk', (u - 0.4) / 0.6);
```

Hai chỉnh thời gian ở lúc vẽ (`mobs.js:857-859`) — chỉ đổi hình, không đổi luật:
- `tele` trải đúng theo `e.wind / e.act.T` → 4 khung tele luôn đủ trong T (đo: tele 0→3 đều 0,15 s/khung với T=0,58).
- `atk` của tinh anh/quái giáp: giữ khung ở `0,2·D` thêm 0,08 s, sau đó chạy ×0,9.

### 1.4 Chọn khung, lặp, `mo`, lật hướng (sprite_custom.js)

| Việc | Code | Ghi chú |
|---|---|---|
| Đọc tệp | `SC.add` `sprite_custom.js:98-158`; mỗi động tác `{hang, so≥1, giay>0 (mặc định 0,6), lap, mo}` (`:113`), bảng `khung/cham` (`:114`, `docBang :177-189`) | Tên hợp lệ: `ANIMS = idle, move, tele, atk, hit, die, ne, noi` (`:13`) — hàng khác (vd. `chieu1`) bị bỏ qua |
| Lặp | `khungLap(a,t) = floor(t/(giay/so)) % so` (`:167-170`) | dùng `giay` của ảnh |
| Một lần | `khungMot(a,u) = min(so−1, floor(u·so))` (`:171-174`), `u = clamp(t/D)` với `D` = thời lượng code (`:331-332`) | **`giay` của ảnh bị bỏ** cho quái có `def` |
| Bỏ khung trùng | `"khung":[…]`, `"cham":c` → bảng mốc `{s,i}` (`:177-189`); bật bởi `G.KHUNG_TRUNG` (`:61-67`) | socNo atk `[0,2,3,4,5]` chạm 4; hoTinh-p2 atk `[0..4]` chạm 4; socNo die `[0,2,3,4,6,7]` |
| `mo` (mờ khi chết) | `alpha = 1 − seg(u, mo, 1)` (`:339`) — mọi tệp quái ghi `mo: 0.6` | đo: alpha 1 tới k=0,6; 0,87@0,65 … 0@1,0 |
| Bóng khi chết | `w = bong·(1 − 0,5u)` (`:381`) — chỉ khi `bong=true` (quái không có `def`); quái có `def` dùng bóng của code | |
| Lật | `if ((face < 0) !== !!sp.lat) c.scale(-1, 1);` (`:314`); ảnh vẽ quay **PHẢI**, tệp ghi `"huong":"trai"` thì `sp.lat` (`:119`). Canvas code thì ngược: `if (face > 0) c.scale(-1,1)` (`monster_art.js:1440`) | `e.face` đổi khi `|cos a| > 0.15` (`mobs.js:188`); quái giáp quay chậm 0,9 s (`faceSlow`, `mobs.js:268-273`) |
| Chớp trắng | `flash = o.hit`; đầu cú trúng `u<0.3` → 0,75 (`:375-377`) | |
| Nhuộm trạng thái | `o.than` → `khungThan` (`:318-320`), từ `ttQuai` (`mobs.js:876-877`) | Đợt 7 |

### 1.5 Khi nào gây sát thương — tóm theo vai

| Vai (`G.MOB_ART`, `data.js:215-221`) | Đòn | T báo trước | Gây sát thương ở | Ghi chú |
|---|---|---|---|---|
| rusher | `melee` | 0,58 | vùng (quạt/đường/tròn theo `don.kieu`) hết hạn = vào atk | `mobs.js:365`; vùng `quiet` (không vẽ báo) `mobs.js:173` |
| swarm | `melee` | 0,5 | như trên | |
| shield | `slam` | 0,6 | như trên + rung | `mobs.js:350`; atk nặng (giữ khung) |
| archer | `shot`/`lob` | `G.ROLES.archer.wind` = 0,7 | đạn bay (`shoot`) / bom rơi (`bomb`: fl 0,45 + fuse 0,6) | `mobs.js:292-293`, `data.js:207` |
| nimble | `melee` + lặn | 0,45 / trồi 0,75 | vùng | `mobs.js:358, 407` |
| kami | `boom` | 0,85 | vùng tròn r=tam+6 | rồi tự nổ & biến mất (`mobs.js:311-314, 221`) |
| bomber | `lob`/`drop` | 0,5 | bom: fl 0,5 + fuse 1,2 (sứa: 0 + 1,6) | `mobs.js:301-302`; sứa `anim1:'idle'` |
| spiky | `melee` 0,6 / dựng gai 2,2 s → 8–10 gai | 0,6 / 2,2 | vùng / đạn gai; **phản đòn cận chiến** khi đang dựng gai | `mobs.js:320-331, 382-388, 134-138` |
| elite | `melee` 0,6 / chiêu riêng `chieu1` (T=0,7) / `gai`, `no` | 0,6–0,7 | vùng riêng từng con (`mobs.js:427-452`) | `fast` ×0,75–0,85 nếu "Nhanh" |

### 1.6 Quái nào chỉ vẽ bằng canvas?

Đo bằng `defs.js` (nạp `monster_art.js` trong Node, so với thư mục ảnh): **36/36** mã trong `MA._defs` (8 vai × 3 vùng + 6 tinh anh + 3 trùm nhỏ + 3 trùm vùng) đều có `<mã>.sprite.json` (`sprite=true`). Không có quái nào thiếu ảnh. Canvas thuần còn dùng ở:
- **Bản dev `index.html`**: không nhúng ảnh → toàn bộ quái/trùm vẽ bằng `monster_art.js` [đo: `ds = 0`].
- **Ảnh rời chưa về** (bản 2 tệp, `G.ANH_ROI`): `MA.draw` rơi về `draw0` và gọi `roiCan(id)` (`sprite_custom.js:456`).
- **Bia thử `noArt`** (`au_lib.js` `AU.dummy`) → đường cũ `art.js:1647-1653` (`drawMon`/`dieMon`/`drawMini`).
- **Trùm khi không có `G.monsterArt`** → `art.js:2830` (`mocDraw`, `nguDraw`, `hoDraw`).
- **Ảo ảnh Hồ Tinh** (`e.illusion`): `art.js:1648`, `boss.js:425` vẫn rẽ nhánh nhưng `grep -rn "illusion *[:=] *true" game/js` **không có kết quả** → KHÔNG TỒN TẠI chỗ tạo ảo ảnh ở commit này (nhánh vẽ là code chết).

---

## 2. Trùm (boss.js)

### 2.1 Loại trùm và đường vẽ

| Loại | `b.kind` | Ảnh (`G.MOB_ART`) | Vẽ qua | AI |
|---|---|---|---|---|
| Trùm nhỏ | `mini` | `namChua`, `cuaDa`, `hoLua` (theo vùng) | `A.enemy` (`combat.js:1119` → `mobs.js:842`) — **không** qua `A.boss` | `thinkMini` (`boss.js:273-339`) |
| Trùm vùng | `moc` / `ngu` / `ho` | `mocTinh`, `nguTinh`, `hoTinh` (+ `-p2`, `-p3`) | `A.boss` bọc (`boss.js:424-453`) → `G.monsterArt.draw` | `thinkBig` (`boss.js:228-253`) |

### 2.2 Máy trạng thái trùm (`G.updateBoss`, `boss.js:364-418`)

Bộ đếm: `busy` (đang bận chiêu/cảnh), `wind` (còn bao lâu tới lúc ra đòn), `cd`, `invuln`, `tired`, `seq` (hàng đợi `later`), `lunge`, `phase`.

```
makeBoss (boss.js:51) → play('intro'|'spawn'); invuln = busy = dur(intro|spawn)   (boss.js:89-91)
mỗi tick:
  an.t += dt*spd (:375) ; phase = hp>66% ?0 : hp>33% ?1 : 2 (:386-387)
  phase tăng → huỷ seq, lunge, vùng đang báo, đạn; play('phase2'|'phase3'); invuln = busy = dur(...) (:388-402)
  chạy seq tới hạn (:403-406) ; move() nếu không bận (:342-362)
  busyAnim? giữ hoạt ảnh chiêu : play(moving ? 'move':'idle') (:409-413)
  busy<=0 && không choáng → cd -= dt → thinkBig / thinkMini (:414-417)
```

Một chiêu trùm vùng (`thinkBig`, `boss.js:236-248`):
```js
const spd = [1, 1.1, 1.2][ph], a = ang(b, P);
let D = dur(b.art, k) / spd, T = moc(b.art, k)[0] * D, aspd = spd;
...
if (sk.tele && T < sk.tele) { const T0 = T; T = sk.tele; D += T - T0; aspd = spd * T0 / T;
  later(b, T, () => { if (b.an && b.an.n === k) b.an.spd = spd; }); }
aimFace(b, a); play(b, k, aspd); sk.f(b, P, T, D, a, spd); b.busy = D; b.wind = T;
```
- `moc` = `[hết báo trước, hết ra đòn]` (tỉ lệ 0..1) lấy từ `MA.list` (`boss.js:11`).
- `sk.f` tạo vùng/đạn với hẹn giờ `T` (vd. `Z('line', …, T, …)`).
- `b.an.cut` (Ngư c1 = `moc[1]`, Hồ c2 = 0,9, Hổ Lửa chieu1 = 0,75) giữ hoạt ảnh không vượt quá `cut·D` (`boss.js:130, 197, 329, 427`).
- `tire()` sau chiêu lớn: `tired`, `busy`, `exposed` (`boss.js:222-226`) → hình `stun` (`boss.js:429`).

### 2.3 Liên hệ khung ảnh ↔ chiêu ↔ vùng báo ↔ sát thương

`SC.chonQuai` cho mọi `cX` / `chieuN`: **u < 0,4 → hàng tele (4 khung), u ≥ 0,4 → hàng atk (6 khung)** — cố định cho mọi chiêu (`sprite_custom.js:341`). Mốc sát thương là `moc[0]` riêng. Bảng sau tính từ `defs.json` (đọc `monster_art.js`) [code], cột "khung ảnh lúc trúng" là u = moc[0]:

| Trùm | Chiêu | D (s, pha 1) | moc | T = moc0·D | Khung ảnh lúc trúng | Vùng báo (bao_truoc) |
|---|---|---|---|---|---|---|
| Ngư Tinh | c1 Đớp | 1,9 | 0,40/0,62 | 0,76 | atk:0 ✓ | đường thẳng w46 (`boss.js:128`) |
| | c2 Sóng thần | 2,3 | 0,38/0,80 | 0,87 | tele:3 | tường nước `wall` chờ `wait=T` |
| | c3 Phun băng | 2,2 | 0,40/0,75 | 0,88 | atk:0 ✓ | quạt r125 |
| | c4 Mưa băng nhọn | 2,2 | 0,38/0,80 | 0,84 (+i·0,08) | tele:3 | 7 vòng tròn |
| | c5 Xoáy nước | 2,6 | 0,30/0,82 | 0,78 / +0,55 | **tele:2** | tròn r60 + vành 60–112 |
| Mộc Tinh | c1 Quật cành | 2,0 | 0,42/0,65 | 0,84 | atk:0 ✓ | quạt r118 |
| | c2 Rễ đâm | 2,2 | 0,25/0,85 | 0,55 (+i·0,09) | **tele:2** | chuỗi tròn r14 |
| | c3 Mưa quả độc | 2,3 | 0,40/0,85 | 0,92 (+i·0,1) | atk:0 ✓ | tròn r18 → vũng |
| | c4 Bùa bay | 2,2 | 0,40/0,80 | 0,88 | atk:0 ✓ | đạn đuổi (không vùng) |
| | c5 Rừng gai | 2,6 | 0,35/0,90 | 0,91 (+i·0,38) | tele:3 | 3 vành có khe |
| Hồ Tinh | c1 Hồ hoả | 2,4 | 0,36/0,80 | 0,86 | tele:3 | đạn lửa đuổi |
| | c2 Vồ mồi | 2,0 | 0,22/0,90 | 0,44 → **kéo 0,65** (`tele`) | **tele:2** | 2 đường thẳng w40 |
| | c3 Quạt đuôi | 2,2 | 0,42/0,68 | 0,92 (+0,12/0,24) | atk:0 ✓ | 3 vành trăng khuyết |
| | c4 Vòng lửa ma | 2,5 | 0,30/0,92 | (0,3–0,5)·D | tele:2 | 8 + 12 cột tròn |
| | c5 Bão hồ hoả | 2,4 | 0,35/0,95 | 0,84 (+j·0,32) | tele:3 | đạn toả tròn |

Vùng báo: mọi vùng của trùm **không** `quiet` → `bao_truoc.js` vẽ, phần đỏ đậm "lấp dần" theo `u = 1 − z.t/z.t0` và đầy đúng lúc nổ (`bao_truoc.js:73-76`); đòn thường của quái (`quiet: true`) không vẽ báo (`bao_truoc.js:58, 618`). Ngoài vùng, ảnh AI có chớp trắng báo đòn 0,25 s cuối (`o.baoDon`, `boss.js:442`) — đo thấy `!0.35` nhấp nháy 20 Hz trước mốc trúng.

Trùm nhỏ (`thinkMini`): `atk` = phát `tele` với tốc độ `0.7/0.75·spd`, sau `T = 0.75/spd` thì `play('atk')` (`boss.js:296-301`); `chieu1/2`: `T = 0,5·D` → u=0,5 → ảnh atk khung 1 (`(0.5−0.4)/0.6·6 = 1`) [suy luận].

### 2.4 Pha trùm và ảnh `-p2` / `-p3`

- Mã pha: `PHA_MA = /^(nguTinh|mocTinh|hoTinh)-p([23])$/` (`sprite_custom.js:18`). Tệp pha không vào danh sách quái (`:149-151`).
- Tệp pha chỉ có 4 hàng **idle(h0) / tele(h1) / atk(h2) / hit(h3)** — Bảng D.
- Chọn tệp (`sprite_custom.js:359-374`):
```js
let pha = o.phase | 0;
if (pha >= 2 && (n === 'phase2' || n === 'phase3') && s.u < 0.5) pha--;
const sp2 = pha >= 2 ? SC.phaTrum(sp, pha, s.ten) : null;
...
else if (pha >= 2 && G.PHA_TRUM_DU && (s.ten === 'move' || s.ten === 'die')) {
  const pf = SC.phaTrum(sp, pha, s.ten === 'move' ? 'idle' : 'hit');
```
- `G.PHA_TRUM_DU` (bật mặc định, tắt `?phatrum=0`, `sprite_custom.js:52-57`).
- Cảnh chuyển pha: `phase2/3` → hàng `tele` kéo giãn trên 2,2–2,6 s; chớp trắng 0,85→0 ở 14% đầu (`boss.js:444`), chớp 1→0,5 ở u 0,45–0,58 khi có tệp pha (`boss.js:445-448`).
- Pha tính theo máu mỗi tick (`boss.js:386-388`), **không chờ hết chiêu**: chiêu đang dở bị cắt ngay (huỷ `seq`, vùng còn báo, đạn — `boss.js:390-396`) → hoạt ảnh nhảy thẳng sang `phase2/3` khung 0 [code].

### 2.5 Chết của trùm

`G.mobOnKill`: `w.bossDieT = dur(art,'die') + 0.4` (`mobs.js:152`); `fx.js:1794` bản chụp `t = dur(die)` (3,2–3,4 s) với chuỗi nổ nhỏ; `stage.js:719` mở cổng sau `bossDieT`. Pha 1: hàng `die` 8 khung + mờ từ 0,6; pha 2/3: hàng `hit` của tệp pha chạy ×1,6 rồi giữ khung 3 + mờ [đo: `p2 0.6 → hoTinh-p2:hit:3@1`, `0.8 → @0.5`].

---

## 3. Người làng, em bé ở làng, và các nhóm ảnh khác

### 3.1 Người làng (`nl-*`)

| Bước | Code |
|---|---|
| Tệp `doi_tuong: "nguoi-lang"` → `noiNguoiLang()` gắn `VS.tuVe`, `VS.tuVeMat` | `sprite_custom.js:151, 1312-1327` |
| Mỗi khung cảnh làng: vòng 7 người, `look` = ±1 khi em bé ở gần / đang nói, `f` = khung code 0..2 | `village_scene.js:1006-1012` |
| `putNpc` → `VS.tuVe(...)` trả true thì bỏ hình code | `village_scene.js:173-181` |
| `SC.veNguoiLang`: `ten = 'noi'` nếu `look`, nhưng **chỉ vẽ `idle` khung 0** trừ khi `G.NL_DONG` | `sprite_custom.js:1284-1291` |

```js
// 12/10 (chủ dự án): người làng chỉ đứng yên, không nhún nhảy theo khung; bật lại hoạt ảnh: G.NL_DONG = true
SC.veKhung(c, sp, G.NL_DONG ? ten : 'idle', G.NL_DONG ? khungLap(a, Math.max(0, o.t || 0)) : 0, o.face < 0 ? -1 : 1, {});
```
[đo] `look ∈ {0, 1, −1}`, `t ∈ {0…1,1}` → luôn `nl-lai:idle:0`; chỉ đổi `face` (−1 khi em bé đứng bên trái). Bật `G.NL_DONG = true` → `noi:0, noi:2, noi:4` ở t = 0 / 0,3 / 0,7 (lặp 0,9 s). Khuôn mặt ở dải lối tắt: `vungMat` cắt phần đầu khung idle 0 (`sprite_custom.js:1294-1310`). Người làng **không có** AI di chuyển (đứng ở `NPCS[k].pos`, `village_scene.js:37`).

### 3.2 Em bé ở làng

- Em bé người chơi: `drawKid(c, sv.hero, …, { move: S.moving, outfit })` (`village_scene.js:1023`) → `G.art.hero` (`village_scene.js:815-818`) — **cùng hàm vẽ em bé trong trận** (xem phụ lục em bé): `atk:-1, dodge:-1`, nên chỉ có `idle`/`move` (chạy), tốc độ đi 108 (`village_scene.js:584`), `S.moving`/`S.face` đặt ở `VS.update` (`village_scene.js:767-785`).
- Ba em bé ngồi ở sân đình (`seats()`, `village_scene.js:521-524`): vẽ cùng `drawKid`, `move: un && Math.sin(t*1.1 + st.x) > 0.75` (`village_scene.js:1017-1020`) → **ngồi yên nhưng định kỳ phát hàng chạy tại chỗ** (~23% thời gian) [suy luận từ công thức].
- `village.js` dùng `G.art.hero` cho ô chọn em bé / huy hiệu (`village.js:169, 614`), `VS.bigNpc` (người làng to trong bảng, `village.js:99` → `putNpc` với `look: 1`).

### 3.3 Các nhóm ảnh khác — cái nào là animation

Đếm bằng `doi.py` trên 626 tệp:

| Tiền tố | `doi_tuong` | Số tệp | Có khung động? | Dùng ở |
|---|---|---|---|---|
| (tên quái) | `quai` | 36 + 6 tệp pha | **Có** (`dong_tac`, 4–6 hàng) | quái/trùm |
| `nl-` | `nguoi-lang` | 7 | Có (`idle`,`noi`) — game chỉ vẽ khung 0 | làng |
| `em-be-*` | `em-be` | 28 | Có (phụ lục em bé) | em bé |
| `ghep-` | `ghep` | 4 | Không ảnh (hồ sơ điểm ghép) | em bé |
| `hu-` | `hieu-ung` | 101 | **Có** — dải ngang 1 hàng `so` khung / `giay` s, 37 tệp `lap` (đạn, vũng, bom, chưởng, `hu-lang-khung-cui`, `hu-lang-lua-lo`) | `fx_anh.js` (`FA.add` `:18`, chọn khung `:59-61`); làng: `veDai` (`village_scene.js:390-395`, 7 khung/giây) |
| `vk-` | `vu-khi` | 160 | Không (ảnh tĩnh, game xoay theo tay) | vũ khí |
| `tp-` | `trang-phuc` | 52 | Không (tĩnh, khoác theo neo) | trang phục |
| `vp-` | `vat-pham` | 14 | Không | vật phẩm rơi |
| `gd-` | `giao-dien` | 218 | Không (biểu tượng, nút, cửa, công trình làng `gd-lang-*`) | UI, làng |

Liên quan quái trong `hu-*`: `hu-quai-chet` (bụi chết, `fx.js:1804`), `hu-pha-giap` (`mobs.js:142`), `hu-vung-quai-<hệ>` (vũng, `fx.js:1497`), `hu-trum-no` (`fx.js:1860`), `hu-quai-cao` (`fx.js:881`), đạn `hu-dan-*` (`fx_dan.js:217-256`). Phổ biến nhất: 4 khung/0,4 s (15 tệp), 5 khung/0,2 s (13 tệp).

---

## 4. Bảng D — mọi `*.sprite.json` có `dong_tac` (trừ `em-be-*`, `ghep-*`)

Sinh bằng `meta.py` + `gen.py` (đọc tệp thật). Ô động tác: `h<hàng>·<số khung>·<giây>[·lặp][·khung[...]][·chạm][·mờ]`. Cột "code d" là thời lượng **thật sự dùng** cho hàng một-lần (từ `monster_art.js`, mục 1.4). "AI" = báo trước T → kết thúc lượt (`act.end`) tính theo `mobs.js` (vai từ `data.js:215-221`). Cột cuối: tiến độ atk lớn nhất trước khi lượt kết thúc và khung ảnh cuối cùng thực sự hiện (khớp số đo của heoCon 2/5, boHung 3/5, socNo 4/5).

**Dùng ở đâu (chung cho mọi quái):** `idle`/`move` ← `mobs.js:239` (không có act); `tele` ← `begin` `mobs.js:189` (kết thúc khi `act.t ≥ T`); `atk` ← `stepAct` `mobs.js:249` (kết thúc `act.t ≥ end`, `mobs.js:253`); `hit` ← `hitT`/`stun` `mobs.js:848-849`; `die` ← bản chụp `fx.js:1801` (kết thúc sau `dur(die)`); `spawn` → hàng `idle` + alpha. Trùm: `cX`/`chieuN`/`phaseN`/`intro`/`stun` theo `boss.js` (mục 2).

| mã | đối tượng · vai | khung (w×h) · goc | idle | move | tele | atk | hit | die | code d (tele/atk/hit/die) | AI: T → end (s) | atk thật sự phát tới khung |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `cua` | Cua Lính · rusher · chem | 60×44 · [30, 40] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.7/0.55/0.35/1.2 | 0.58 → 0.99 | u≈0.75 → khung 4/5 |
| `heoCon` | Heo Rừng Con · rusher · lao | 64×40 · [32, 36] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.75/0.6/0.35/1.2 | 0.58 → 0.88 | u≈0.50 → khung 2/5 [đo] |
| `linhMa` | Lính Ma Giáp Gỉ · rusher · lao | 64×40 · [32, 36] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.7/0.55/0.35/1.3 | 0.58 → 0.85 | u≈0.50 → khung 2–3/5 |
| `caCon` | Bầy Cá Con · swarm · lao | 48×44 · [24, 40] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.7/0.6/0.35/1.1 | 0.50 → 0.80 | u≈0.50 → khung 2–3/5 |
| `doiThan` | Bầy Dơi Than · swarm · lao | 56×48 · [28, 44] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.7/0.6/0.35/1.1 | 0.50 → 0.80 | u≈0.50 → khung 2–3/5 |
| `ongVo` | Bầy Ong Vò Vẽ · swarm · lao | 56×56 · [28, 52] | h0·6·0.6s·lặp | h1·6·0.4s·lặp | h2·4·0.4s | h3·6·0.4s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.7/0.6/0.35/1.1 | 0.50 → 0.80 | u≈0.50 → khung 2–3/5 |
| `boHung` | Bọ Hung Mai Cứng · shield · dap | 64×44 · [32, 40] | h0·6·1.2s·lặp | h1·6·0.7s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.8/0.6/0.35/1.2 | 0.60 → 1.05 | u≈0.57 → khung 3/5 [đo] |
| `oc` | Ốc Mượn Hồn · shield · chem | 64×52 · [32, 48] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.75/0.55/0.4/1.2 | 0.60 → 1.01 | u≈0.56 → khung 3/5 |
| `tuongDa` | Tượng Đá Cầm Khiên · shield · dap | 64×40 · [32, 36] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.85/0.6/0.35/1.2 | 0.60 → 1.05 | u≈0.57 → khung 3/5 |
| `denLong` | Đèn Lồng Ma · archer · ban | 56×40 · [28, 36] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.75/0.55/0.35/1.2 | 0.70 → 1.15 | u≈0.82 → khung 4/5 |
| `haiQuy` | Hải Quỳ · archer · nem | 56×52 · [28, 48] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.8/0.9/0.35/1.3 | 0.70 → 1.20 | u≈0.56 → khung 3/5 |
| `hoaBaoTu` | Hoa Phun Bào Tử · archer · ban | 64×48 · [32, 44] | h0·6·1.4s·lặp | h1·6·1s·lặp | h2·4·0.6s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.8/0.6/0.35/1.4 | 0.70 → 1.15 | u≈0.75 → khung 4/5 |
| `caChuon` | Cá Chuồn · nimble · lao | 68×44 · [34, 40] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.7/0.55/0.35/1.1 | 0.45 → 0.73 | u≈0.50 → khung 2–3/5 |
| `chonBong` | Chồn Bóng · nimble · lao | 76×40 · [38, 36] | h0·6·1s·lặp | h1·6·0.45s·lặp | h2·4·0.4s | h3·6·0.4s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.6/0.55/0.35/1.2 | 0.45 → 0.73 | u≈0.50 → khung 2–3/5 |
| `meoDen` | Mèo Đen Hai Đuôi · nimble · chem | 72×44 · [36, 40] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.6/0.5/0.35/1.2 | 0.45 → 0.82 | u≈0.75 → khung 4/5 |
| `caNoc` | Cá Nóc · kami · gai | 44×36 · [22, 32] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.7/0.55/0.35/1.1 | 0.85 → 1.40 | tới 5/5; **biến mất ở atk·0,95, không phát die** |
| `huLua` | Hũ Lửa Sống · kami · no | 40×40 · [20, 36] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.8/1/0.35/1.1 | 0.85 → 1.85 | như trên |
| `namPhong` | Nấm Phồng · kami · no | 44×44 · [22, 40] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.6s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.8/0.9/0.35/1.1 | 0.85 → 1.75 | như trên; thân AI ẩn giữa atk [đo] |
| `socNo` | Sóc Ném Quả Nổ · bomber · nem | 60×48 · [30, 44] | h0·6·1s·lặp | h1·6·0.5s·lặp | h2·4·0.5s | h3·6·0.5s·khung[0,2,3,4,5]·chạm4 | h4·4·0.3s | h5·8·1.2s·khung[0,2,3,4,6,7]·mờ0.6 | 0.75/0.75/0.35/1.2 | 0.50 → 1.10 | u≈0.80 → khung 4/5 [đo: 0,2,3,4] |
| `sua` | Sứa Bom · bomber · no | 52×48 · [26, 44] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.7/0.55/0.35/1.1 | 0.50 → 0.90 | **hàng atk không dùng** (`anim1:'idle'`, `mobs.js:301`) |
| `tieuYeu` | Tiểu Yêu Ném Pháo · bomber · nem | 56×40 · [28, 36] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.75/0.75/0.35/1.2 | 0.50 → 1.10 | u≈0.80 → khung 4/5 |
| `nhim` | Nhím Biển · spiky · gai | 40×32 · [20, 28] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.7/0.55/0.35/1.1 | 0.60 → 1.01 | đòn thường 4/5; dựng gai: tele **không hiện**, atk 1 tick |
| `nhimDoc` | Nhím Gai Độc · spiky · gai | 56×36 · [28, 32] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.75/0.6/0.35/1.1 | 0.60 → 1.05 | như trên [đo] |
| `nhimThan` | Nhím Than Hồng · spiky · gai | 40×36 · [20, 32] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.75/0.6/0.35/1.1 | 0.60 → 1.05 | như trên |
| `caNocChua` | Cá Nóc Chúa · elite · gai | 80×72 · [40, 68] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.7/0.55/0.35/1.1 (chieu1 1.6) | 0.60 → 1.01 / chieu1 0.7 → 1.6 | 3/5; chieu1: tele phát 2 lần |
| `cuaTuong` | Cua Tướng · elite · chem | 104×72 · [52, 68] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.7/0.55/0.35/1.1 (chieu1 1.4) | 0.60 → 1.01 / chieu1 0.7 → 1.4 | 3/5; chieu1: chỉ tới atk:0 [đo] |
| `heoNanh` | Heo Rừng Nanh Dài · elite · lao | 100×56 · [50, 52] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.85/0.65/0.35/1.4 (chieu1 2.1) | 0.60 → 0.93 | 2/5; chiêu húc 3 lần (anim0 tele, anim1 atk ×1,4) |
| `huChua` | Hũ Lửa Chúa · elite · no | 72×52 · [36, 48] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.85/0.75/0.35/1.4 (chieu1 1.7) | 0.70 → 1.26 (`no`)  | 3/5; chieu1 tele 2 lần |
| `namPhongChua` | Nấm Phồng Chúa · elite · no | 96×56 · [48, 52] | h0·6·1.4s·lặp | h1·6·0.8s·lặp | h2·4·0.7s | h3·6·0.6s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.85/0.7/0.35/1.4 (chieu1 1.9) | 0.70 → 1.23 (`no`) | 3/5; chieu1 tele 2 lần |
| `tuongMa` | Tướng Ma · elite · chem | 80×52 · [40, 48] | h0·6·1.2s·lặp | h1·6·0.6s·lặp | h2·4·0.5s | h3·6·0.5s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.85/0.6/0.35/1.5 (chieu1 1.6) | 0.60 → 1.05 / chieu1 0.7 → 1.6 | 3/5; chieu1 tới atk:1 [đo] |
| `cuaDa` | Cua Đá · mini · chem | 140×80 · [70, 76] | h0·6·1.4s·lặp | h1·6·0.8s·lặp | h2·4·0.7s | h3·6·0.6s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.8/0.6/0.35/1.6 (c1 1.6, c2 1.8) | atk T=0,75/spd; chieu T=0,5·D | `boss.js:295-336` |
| `hoLua` | Hổ Lửa · mini · chem | 132×72 · [66, 68] | h0·6·1.4s·lặp | h1·6·0.8s·lặp | h2·4·0.7s | h3·6·0.6s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.75/0.55/0.35/1.6 (c1 1.5, c2 1.7) | như trên; chieu1 `cut 0.75` | |
| `namChua` | Nấm Chúa · mini · phun | 116×72 · [58, 68] | h0·6·1.4s·lặp | h1·6·0.8s·lặp | h2·4·0.7s | h3·6·0.6s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.8/0.8/0.35/1.6 (c1 1.7, c2 1.8) | như trên | |
| `hoTinh` | Hồ Tinh · trùm vùng | 208×128 · [104, 124] | h0·6·1.4s·lặp | h1·6·0.8s·lặp | h2·4·0.7s | h3·6·0.6s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.7/0.55/0.4/3.4; c1–c5 2,0–2,5 | mục 2.3 | |
| `hoTinh-p2` | Hồ Tinh · pha 2 | 208×128 · [104, 124] | h0·6·1.4s·lặp | — | h1·4·0.7s | h2·6·0.6s·khung[0,1,2,3,4]·chạm4 | h3·4·0.3s | — | (của hoTinh) | pha 2 | khung 5 bị bỏ |
| `hoTinh-p3` | Hồ Tinh · pha 3 | 208×128 · [104, 124] | h0·6·1.4s·lặp | — | h1·4·0.7s | h2·6·0.6s | h3·4·0.3s | — | (của hoTinh) | pha 3 | |
| `mocTinh` | Mộc Tinh · trùm vùng | 168×140 · [84, 136] | h0·6·1.4s·lặp | h1·6·0.8s·lặp | h2·4·0.7s | h3·6·0.6s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.7/0.55/0.4/3.4; c1–c5 2,0–2,6 | mục 2.3 | |
| `mocTinh-p2` | Mộc Tinh · pha 2 | 168×140 · [84, 136] | h0·6·1.4s·lặp | — | h1·4·0.7s | h2·6·0.6s | h3·4·0.3s | — | (của mocTinh) | | |
| `mocTinh-p3` | Mộc Tinh · pha 3 | 168×140 · [84, 136] | h0·6·1.4s·lặp | — | h1·4·0.7s | h2·6·0.6s | h3·4·0.3s | — | (của mocTinh) | | |
| `nguTinh` | Ngư Tinh · trùm vùng | 180×116 · [90, 112] | h0·6·1.4s·lặp | h1·6·0.8s·lặp | h2·4·0.7s | h3·6·0.6s | h4·4·0.3s | h5·8·1.2s·mờ0.6 | 0.7/0.55/0.4/3.2; c1–c5 1,9–2,6 | mục 2.3 | |
| `nguTinh-p2` | Ngư Tinh · pha 2 | 180×116 · [90, 112] | h0·6·1.4s·lặp | — | h1·4·0.7s | h2·6·0.6s | h3·4·0.3s | — | (của nguTinh) | | |
| `nguTinh-p3` | Ngư Tinh · pha 3 | 180×116 · [90, 112] | h0·6·1.4s·lặp | — | h1·4·0.7s | h2·6·0.6s | h3·4·0.3s | — | (của nguTinh) | | |

Người làng (cùng định dạng, `doi_tuong: nguoi-lang`):

| mã | tên | khung · goc | idle | noi | dùng ở đâu / kích hoạt |
|---|---|---|---|---|---|
| `nl-do` | Cụ Đồ | 56×52 · [28, 49] · net 2 | h0·6·1.2s·lặp | h1·6·0.9s·lặp | `village_scene.js:1012`; `noi` khi `look≠0` (em bé trong 30 điểm / đang nói) — **chỉ khi `G.NL_DONG`** |
| `nl-lai` | Chú Lái Đò | như trên | như trên | như trên | như trên |
| `nl-may` | Cô Thợ May | như trên | | | + `VS.shown` (chưa về làng thì ẩn, `village_scene.js:1007`) |
| `nl-mo` | Anh Mõ | như trên | | | |
| `nl-ren` | Ông Thợ Rèn | như trên | | | |
| `nl-tu` | Ông Từ | như trên | | | |
| `nl-xen` | Bà Hàng Xén | như trên | | | |

Nhận xét chung Bảng D: 36 tệp quái cùng một lưới chuẩn (h0 idle 6 · h1 move 6 · h2 tele 4 · h3 atk 6 · h4 hit 4 · h5 die 8); `tele` có 4 khung còn `atk` 6 khung; `giay` của hàng một-lần (0,4–0,7 s) **khác** `d` code (0,5–1,0 s) ở hầu hết quái — vô hiệu vì game dùng `d` code.

---

## 5. Số đo Playwright

### 5.1 Quái thường (9 s mỗi con, em bé đứng yên cách 40 điểm, `P.inv = 0` mỗi tick để không bỏ sót lần trúng)

Thời gian tính từ lúc vào phòng (+0 = tick đầu). `hurt` = mọi lần `G.hurtPlayer` được gọi (bọc tạm trong trang).

| Quái | tele[0] | tele 0→3 | trúng (hurt) | atk[0] hiện | khung atk cuối | về idle |
|---|---|---|---|---|---|---|
| heoCon (rusher, lao, T=0,58) | 1,767 | 0,15 s/khung | **2,333** | 2,417 | atk[2] | 2,717 |
| boHung (shield, đập, T=0,6) | 1,817 | ~0,15 s/khung | **2,400** | 2,483 | atk[3] | 2,933 |
| socNo (bomber, ném, T=0,5) | 1,767 | ~0,13 s/khung | bom nổ 3,983 (= atk + 0,5 bay + 1,2 ngòi) | 2,283 | atk 0→2→3→4 (bỏ 1, theo `khung`) | 2,867 |

Lần trúng lặp lại đều: heoCon 2,333 / 4,800 / 7,267 (chu kỳ 2,467 s); boHung 2,400 / 5,133 / 7,867. Sau khi trúng, `act.t` đứng 5 tick (0,083 s) do khựng hình `combat.js:917` → atk[0] hiện **sau** lần trúng.

Trúng đòn (quét `hitT` 0,3 → 0): `hit:0 (chớp 0,75) → hit:1 → hit:2 → hit:3` — đủ 4 khung, chớp trắng chỉ ở u < 0,3.
Chết (quét `dying` 0 → 1, 1,2 s): `die:0` (k 0–0,10), `1` (0,15–0,2), `2` (0,25–0,35), `3` (0,4–0,5), `4` (0,55–0,6), `5` (0,65–0,7, α 0,87–0,75), `6` (0,75–0,85), `7` (0,9–1, α → 0). `G.kill` → thực thể bị xoá khỏi `W.ents` ngay; bóng chết trong `fx` sống **71 tick ≈ 1,18 s** (= `dur(die)` 1,2) [đo].

### 5.2 Tinh anh, quái gai, cảm tử

| Quái | Kết quả |
|---|---|
| cuaTuong `chieu1` (D 1,4, T 0,7) | tele 0→3 (0,03–0,47), atk:0 0,60, **về tele:0 ở 0,733** (hoạt ảnh phát lại), tele 0→3, atk:0 1,367, idle 1,5. Trúng 0,817 (2 đường chéo) — lúc đó ảnh đang **tele:0/1 lần 2**. |
| tuongMa `chieu1` (D 1,6) | tương tự: tele×2, atk tới khung 1; trúng 0,717 & 1,233 (2 vòng đao). |
| nhimDoc dựng gai (`spikeCd=0.01`) | `e.an.n = 'idle'` suốt 2,2 s (không có tele); `atk:0` đúng **1 tick** (2,233) rồi `move`; gai trúng 2,367. |
| namPhong (kami) | tele 0→3 (0,85 s), atk:0 0,933, atk:1 1,083; **từ 1,100 tới 1,683 không gọi `veKhung`** (Pose code `P.a=0` → không có `drawImage`), atk:5 1,683; 1,800 `DEAD`, bị xoá, `fx.stats().dying = 0` (không có bóng chết). Trúng 0,85. |

### 5.3 Trùm vùng (3 pha) — Hồ Tinh và Mộc Tinh

Ép chiêu bằng `G.bossDebug(k)`, đổi pha bằng đặt `b.hp`. Em bé đặt trước mặt trùm 45 điểm, `W.hpFloor = true`. `+t` tính từ tick ra chiêu.

| Chiêu | Ảnh theo thời gian | Trúng | Nhận xét |
|---|---|---|---|
| Hồ p1 c1 Hồ hoả (T=0,864) | tele:0 +0 → tele:3 +0,733 (chớp `!0.35` từ +0,633) → atk:0 +0,967 … atk:5 +2,167 → move +2,417 | 2,567 / 2,9 (cầu lửa đuổi bay tới) | đạn sinh ở T, ảnh atk:0 sau T 0,1 s |
| Hồ p1 c2 Vồ mồi (T kéo 0,65, `spd` 0,677→1) | tele:0 → tele:1 +0,433 → tele:2 +0,8 → **tele:3 +1,083 → atk:0 +1,283** | 0,833 (vồ 1), 2,083 (vồ 2) | **lúc vồ 1 trúng ảnh còn tele:2; atk:0 trễ 0,45 s** |
| Hồ p1 c3 Quạt đuôi (T=0,924) | tele:3 +0,667 → atk:0 +0,883 → atk:5 +2,117 → `stun` (hit:0/1 lắc) +2,417…+3,55 | 0,917 (+ vũng lửa 1,6/2,18/2,77/3,35) | khớp (moc 0,42 ≈ 0,4) |
| Chuyển pha 2 (D=2,4) | `hoTinh:tele:0` chớp 0,85→0 (0–0,40) → tele:1 +0,667 → chớp 0,99…0,83 → **`hoTinh-p2:tele:2` +1,267** (u=0,5) → tele:3 → `move` vẽ bằng **`hoTinh-p2:idle`** +2,483 | — | đổi tệp đúng ở u 0,5, có chớp che |
| Hồ p2 c2 | `hoTinh-p2` tele:0 → tele:2 +0,667 → atk:0 +1,117 → atk:4 +1,85 (atk:5 không hiện: bảng `khung` bỏ 5 + `cut 0.9`) | 0,700 | trúng ở tele:2 |
| Hồ p3 c5 (tự chọn) | `hoTinh-p3` tele→atk:0 +0,683 → atk:5 → stun (hit:0/1) | 0,867 | |
| Hồ p3 c2 | tele:2 +0,6 → atk:0 +1,017 → atk:5 +1,85 | 0,633 / 1,883 | trúng 1 ở tele:2; trúng 2 ở atk:5 |
| Mộc p1 c1 Quật cành (T=0,84) | tele:3 +0,6 → atk:0 +0,8 → atk:5 +1,883 | 0,833 | khớp |
| Mộc p1 c2 Rễ đâm (T=0,55) | tele:2 +0,45 → tele:3 +0,733 → atk:0 +0,95 | 0,633 | **trúng ở tele:2, atk trễ ~0,32 s** |

Chết trùm (quét `dying`): p1 `hoTinh:die:0/2/4/6@0,5/7@0,12`; p2 `hoTinh-p2:hit:0/1/3/3@0,5/3@0,12`; p3 tương tự với `-p3`. Trúng đòn trùm (quét `hitT` 0,3→0): `hit:1(chớp) → hit:1 → hit:2 → hit:3` — **không bao giờ hit:0**.

---

## 6. Lỗi tiềm ẩn

| # | Lỗi | Mức | Bằng chứng | Loại |
|---|---|---|---|---|
| L1 | **`giay` của tệp ảnh bị bỏ qua cho hàng một-lần**: hàng tele/atk/hit/die luôn kéo theo `d` của `monster_art.js` (`MA.dur` gốc trả trước, `sprite_custom.js:474-476`; `D = dur0.call(...)` `:461`). Họa sĩ đặt atk 0,5 s nhưng game chạy 0,55–1,0 s. Riêng quái không có `def` (chưa có) mới dùng `giay`. | Cao (thiết kế lại phải chọn MỘT nguồn thời gian) | code + đo tele 4 khung trải đúng T | [code]+[đo] |
| L2 | **Lượt đòn kết thúc trước khi hàng atk chạy hết** (`end = T + d·0,75` hoặc ·0,5 cho lao, `mobs.js:186, 378`) → khung atk cuối (thu đòn) không bao giờ hiện, nhảy cụt về idle. | Trung bình | heoCon dừng atk[2], boHung atk[3], socNo atk[4] [đo]; Bảng D cột cuối | [đo] |
| L3 | **Sát thương không khớp "khung chạm" trong ảnh**: vùng trúng ở u_atk = 0 (đầu hàng atk), còn tệp ghi `cham: 4` (socNo, hoTinh-p2) — khung chạm hiện sau 0,5 s (socNo: quả nổ đã bay từ khung 0). | Cao | `sprite_custom.js:182-188`; socNo atk:4 hiện +0,5 s sau `fire` [đo] | [đo] |
| L4 | **Trùm vùng: ngưỡng tele→atk cố định u=0,4** (`sprite_custom.js:341`) trong khi `moc[0]` từ 0,22 tới 0,42 → 7/15 chiêu trúng lúc ảnh còn tele (Hồ c2 trễ 0,45 s, Mộc c2 0,32 s). | Cao | mục 2.3, 5.3 [đo] | [đo] |
| L5 | **Tinh anh `chieu1` phát tele hai lần**: `o.anim1 = 'chieu1'` (`mobs.js:425`) + `play(e, A.anim1 …)` (`mobs.js:249`) đặt lại `e.an.t = 0` → nửa sau của hàng (atk 1–5) gần như không bao giờ hiện. | Cao | cuaTuong, tuongMa [đo] | [đo] |
| L6 | **Quái gai không hiện "dựng gai"**: `play(e,'tele',0.5)` (`mobs.js:325`) rồi `return` từ `think`, nhưng `G_mob.update` gọi tiếp `loop(e, …'idle')` (`mobs.js:239`) → tele bị đè; khi bắn gai `play(e,'atk')` (`mobs.js:384`) chỉ sống 1 tick. | Trung bình | nhimDoc [đo] | [đo] |
| L7 | **Cảm tử biến mất không có hoạt ảnh chết** (`e.dead = true` thẳng, `mobs.js:221`), và Pose code làm thân AI tàng hình giữa atk (bút giả không được gọi). | Thấp–TB (có thể là ý đồ "nổ tan") | namPhong [đo] | [đo] |
| L8 | **Die xong biến mất**: quái thật bị xoá ngay khi chết (`combat.js:1036`), phần "đang chết" là bản chụp trong `fx.js` (`:1788-1801`, giới hạn 16 bản `:1799` — bản cũ nhất bị `shift()` cắt ngang nếu chết dồn >16 con). Mờ theo `mo` 0,6 rồi mất, không để xác. | Thấp | 71 tick ≈ 1,2 s [đo]; `fx.js:1799` [code] | [đo]+[code] |
| L9 | **Trúng đòn chỉ hiện khi idle/move** (`mobs.js:849`, `boss.js:430`): bị đánh lúc tele/atk chỉ có chớp trắng; trùm `t = 0.4 − hitT` với `hitT=0.3` (`mobs.js:131`) → bỏ khung hit 0. | Thấp | [đo] `do_hit.py` | [đo] |
| L10 | **Pha trùm cắt chiêu giữa chừng**: pha tính mỗi tick theo máu (`boss.js:386-396`) → đang ở atk:2 nhảy thẳng `phase2` tele:0 (có chớp trắng che). Nếu ảnh `-p2` chưa tải xong (bản ảnh rời) thì cảnh pha vẽ ảnh pha 1 rồi **đổi tệp giữa hoạt ảnh** khi ảnh về (`sprite_custom.js:347-349`). | Trung bình | [code]; chưa đo mạng chậm trong phiên này (xem `tests/au_pha_trum.py --cham`) | [suy luận] |
| L11 | **Tệp pha thiếu `move`/`die`**: đi dùng `idle` của pha (chân không bước, thân trôi), chết dùng `hit` ×1,6 + giữ khung 3 (`sprite_custom.js:364-373`). | Thấp | [đo] `move → hoTinh-p2:idle` | [đo] |
| L12 | **Pose code điều khiển ảnh AI một cách ẩn**: offset/alpha/`bongMa` của Pose bị bỏ (`thay` không dùng tham số), nhưng `P.a ≤ 0` thì ảnh mất; nếu Pose vẽ `bongMa` trước thân thì lệnh `drawImage` đầu tiên là bóng ma (`monster_art.js:1445`) — ảnh AI vẫn vẽ ở gốc. | Trung bình (bẫy khi thiết kế lại) | `sprite_custom.js:463-472`, `monster_art.js:1440-1447` | [code]+[đo] |
| L13 | **Hàng `move` không theo tốc độ đi thật**: khung lặp theo `giay` ảnh cố định (vd. heoCon 0,6 s/vòng) dù `e.speed`, băng làm chậm (`mobs.js:229`) — trượt chân. | Thấp | `khungLap` `sprite_custom.js:167-170` | [suy luận] |
| L14 | **Người làng có 6 khung `noi` nhưng không dùng** (`G.NL_DONG` tắt), và em bé ngồi ở sân đình phát hàng chạy tại chỗ theo `sin` (`village_scene.js:1019`). | Thấp | [đo] `do_nl.py` | [đo]+[suy luận] |
| L15 | **Trùng lặp code**: `dur()` ở `mobs.js:15` (dự phòng 0,6) và `boss.js:10` (dự phòng 1); `play()` ở `mobs.js:24` và `boss.js:98` (boss có thêm `o`); chọn `die`/`stun`/`hit` lặp ở `mobs.js:846-849` và `boss.js:427-430` (hằng 0,3 vs 0,4); 4 bộ chọn khung khác nhau: `khungLap/khungMot` (`sprite_custom.js:167-174`), `MA.draw` 12 fps (`monster_art.js:1430-1431`), `fx_anh.js:59-61`, `veDai` (`village_scene.js:390-395`); người làng vẽ qua `SC.veKhung` riêng (`sprite_custom.js:1284`) không qua `veQuai`. | Trung bình (bảo trì) | [code] | [code] |
| L16 | Bản dev `index.html` không có ảnh AI → mọi bài đo/ảnh chụp trên `index.html` mà không tự `SC.add` là đo **hình canvas**, không phải hình người chơi thấy. | Lưu ý quy trình | [đo] `ds = 0` | [đo] |

---

## 7. Những thứ cần giữ nguyên khi làm lại animation

- Luật thời gian đòn: `T` báo trước theo vai (Bảng D), `act.end`, `cd`; vùng `z.t/z.t0` và mốc nổ (`combat.js:982-990`); `moc` của chiêu trùm (`boss.js:11, 237`), `sk.tele` tối thiểu (`boss.js:187, 240-244`); `G.bossSK` được bài kiểm tra đọc (`boss.js:219`).
- Hướng: `e.face`/`e.dirA`/`act.a` (`mobs.js:187-188`, `boss.js:118`), quái giáp quay chậm, `keepFace`.
- Huỷ đòn khi choáng/đóng băng (`mobs.js:224-227`) + `cancel` vùng khi quái chết (`combat.js:978`).
- `e.h`, `e.w` (thanh máu, biểu tượng), `e.r/e.hr` va chạm (`mobs.js:100-102`), `BODY` trùm (`boss.js:48`) — độc lập với ảnh.
- `G.PHA_TRUM_DU`, `G.KHUNG_TRUNG`, `G.BO_THAN` (cờ tắt bằng tham số URL) — bài đo cũ dựa vào.
- Định dạng tệp: `goc` = điểm chân, ảnh quay phải, `net`, lưới 6 hàng chuẩn; mã `<trùm>-p2/-p3`.

## 8. Điều chưa chắc / chưa đo

- Chưa đo Ngư Tinh và trùm nhỏ bằng Playwright (chỉ tính từ code, mục 2.3).
- Chưa đo trường hợp ảnh `-p2/-p3` tải chậm giữa cảnh chuyển pha (L10).
- Trong số đo trùm, vài lần `hurt` sớm (+0,0…+0,43) là cầu lửa/vũng của chiêu trước còn sót, không phải chiêu đang đo.
- Ảo ảnh Hồ Tinh: nhánh vẽ còn nhưng không tìm thấy chỗ tạo (`grep -rn "illusion *[:=] *true" game/js` rỗng).
