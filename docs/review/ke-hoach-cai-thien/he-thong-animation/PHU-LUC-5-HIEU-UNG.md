# Phụ lục 5: Hiệu ứng (mục 11): vệt chém, đạn bay, va chạm, bụi, rung màn hình, khựng hình, số nổi, hạt

Phạm vi: `game/js/fx.js`, `fx_he.js`, `fx_anh.js`, `fx_dan.js`, `fx_chuong.js`, `fx_ky_nang.js`, `vfx_cfg.js` và mọi chỗ gọi chúng
(`combat.js`, `moves.js`, `mobs.js`, `boss.js`, `chuong.js`, `stage.js`), cùng `hero_tinhlinh.js` (`tip()`), nơi vệt chém lấy đường vung.
Số dòng lấy theo commit `229e263`. Ký hiệu: **[đo]** là số đo bằng Playwright (mục 5), **[code]** là đọc thẳng từ code, **[suy luận]** là lập luận chưa đo.

> Lưu ý quan trọng **[đo]**: `game/index.html` (bản nguồn) **không nạp ảnh AI nào**: `G.fxAnh.ds` rỗng (0 tệp), vì `game/build.py` mới là nơi nhúng
> `art/custom/*.sprite.json` thành `G.customSpriteData` (`build.py:11`, `sprite_custom.js:2592`). Nên ở bản nguồn, mọi hiệu ứng đều chạy nhánh
> **vẽ bằng code** (dải vệt `trailDraw`, trăng khuyết `cres`, mũi đâm `thrust`…). Bản đóng gói `dist/` thì chạy nhánh **ảnh AI** (`hu-*`).
> Hai bản trông khác hẳn nhau. Khi đo, tôi nạp ảnh giống bản đóng gói bằng `add_init_script` (mục 5).

---

## 1. Cây gọi hàm và cách lưu

### 1.1 Thứ tự nạp và lớp bọc

`index.html:84–94`: `vfx_cfg.js` → `fx.js` → `fx_he.js` → `fx_anh.js` → … → `fx_dan.js` → `fx_chuong.js` → `fx_ky_nang.js`.
`fx.js` tạo `G.fx` và bộ đồ nghề `fx.kit` (`fx.js:2406`). Các tệp sau **bọc chồng** hàm của tệp trước (lưu `f0`, gọi lại `f0` rồi vẽ thêm):

| Hàm công khai | Định nghĩa gốc | Bọc thêm bởi (theo thứ tự) |
|---|---|---|
| `fx.proj` (vẽ quanh đạn) | `fx.js:990` | `fx_he.js:406` → `fx_dan.js:186` → `fx_ky_nang.js:240` |
| `fx.drawOver` | `fx.js:2366` | `fx_he.js:744` (thanh lấy đà) → `fx_chuong.js:319` (thanh tích chưởng) |
| `fx.drawGround` | `fx.js:2336` | `fx_chuong.js:313` (vòng phép tích lực) |
| `fx.heStep` (gọi mỗi bước từ `fx.js:2063`) | `fx_he.js:521` | `fx_dan.js:367` → `fx_chuong.js:211` → `fx_ky_nang.js:299` |
| `fx.hit` | `fx.js:892` | `fx_he.js:332` (quá 5 con trúng cùng `G.time` thì chỉ giật lùi, không hạt) |
| `fx.zone`, `fx.status`, `fx.dmg`, `fx.entity` | `fx.js` | `fx_he.js:397`, `fx_ky_nang.js:146/173/130/213` |
| `A.proj` (hình viên đạn, `art.js`) | `art.js` | `fx_dan.js:226` (ảnh `hu-dan-*`) |

Mọi hàm tạo hiệu ứng đi qua `api(name, f)` (`fx.js:106–114`): bỏ qua khi `G.noRender`, tự `sync()` trạng thái theo phòng, nuốt lỗi (`fx.errs`),
và đặt "chủ" `OWN` (1 = của em bé, 0 = của quái) theo bảng `PL_API` / `EN_API` (`fx.js:102–105`).

```js
// fx.js:106-113
function api(name, f) {
  const own = PL_API[name] ? 1 : EN_API[name] ? 0 : -1;
  fx[name] = function (a, b, c, d, e) {
    if (G.noRender) return undefined;
    ...
    try { if (!sync()) return undefined; return f(a, b, c, d, e); } catch (err) { fail(err); return undefined; } finally { OWN = o0; }
```

Luật chơi gọi qua một hàm nhỏ `FX(n, …)` giống nhau, chép ở 5 tệp: `combat.js:7`, `moves.js:9`, `mobs.js:21`, `boss.js:9`, `chuong.js:15`.

### 1.2 Từ nút Đánh tới vệt chém (đòn cận chiến của em bé)

```
engine.js:562 G.tick (bước cố định 1/60 s) → stage.js:700 G.updateWorld(dt, inp)
  combat.js:917  fx.frozen(dt, inp) ── đang khựng hình? → return (cả thế giới đứng yên)
  combat.js:775  MV.act → moves.js:538 M.act → swordChain/… → moves.js:304 begin() (đặt P.atkT, P.atkDur, P.hitAt)
  combat.js:801  tới P.hitAt (mặc định 0,45 động tác) → moves.js:582 M.hit
        ├─ boxHit → G.cb.playerHit (combat.js:438) → combat.js:452 FX('hit', e, {...})      ← chớp/ảnh trúng, hạt, KHỰNG + RUNG
        │                                           → combat.js:285 t.flash = 0.07; :287 FX('dmg') ← số sát thương, chớp trắng thân
        └─ moves.js:339 swingFx → moves.js:343 FX('mvSwing', P, info)                         ← VỆT CHÉM (tạo SAU hit)
              fx_he.js:161 api('mvSwing') → K.aimed(P, () => { swing(P,o); decorate(P,o); })
                 fx_he.js:162 swing(): luot / banManh / quet / xoc / nenDat … còn lại → baseSwing = fx.swing (fx.js:725)
                    fx.js:734 anhVk(maVet, P, type, scVet) → cungVk() (fx.js:382) → G.tinhLinh.tip() (hero_tinhlinh.js:1850)
                                                       → anhVkDat() (fx.js:415) → add({ty:'anh', xg, theo:P})
                 fx_he.js:151 decorate(): lửa/độc/băng dọc hình cung giả định shapeOf() (fx_he.js:15)
  combat.js:1050 fx.update(dt) → fx.js:2033 step(): stepShake, stepNums, updParts, stepFx, stepProjs, stepPlayer(trailStep, bụi chân), heStep…
vẽ: combat.js:1069 G.drawWorld
  :1074 sx,sy = fx.shakeOffset()  → :1078 G.wxDat(c, -cam+sx, sy) (chỉ lớp thế giới rung)
  :1095 fx.drawGround (ly 0)  :1128 fx.sorted (trailDraw ở y = P.y-0.5, bóng mờ lộn/lướt, xác quái)
  :1139-1140 fx.proj + A.proj  :1143 fx.drawOver (ly 1)  :1144 fx.vienBe (viền bé, rồi vẽ lại vệt đòn của bé lên trên)
  :1149 fx.drawUI (số sát thương, viền đỏ, chớp màn hình)  :1151 G.baoTruoc.draw
```

Đường cũ vẫn còn: khi vũ khí không có `C[w.type]` (`moves.js:540–542`) hoặc `M.hit` không có `mv.cur` (`moves.js:584`), dùng `combat.js:536 doHit`
→ `combat.js:551 FX('swing', …)` (gọi thẳng `fx.swing`, **không** qua `aimed`, không trang trí hệ).

### 1.3 Người gọi theo tệp **[code]** (đếm `FX('…')` và gọi thẳng `G.fx.*`)

| Tệp | Hàm hiệu ứng được gọi (dòng) |
|---|---|
| `combat.js` | `marks` 53, `evolve` 64, `burst` 220, `farHint` 272, `dmg` 287, `combo` 308/315, `freeze` 343, `status` 347, `death` 380, `markOrbs` 407, `hit` 452, `propBlast` 482, `swing` 551, `hurt` 635, `dodge` 770, `swap` 790, `potion` 796, `lunge` 836, `enemySwing` 839, `zoneFire` 986, `rainDrop` 1000, `trapSnap` 1030; `frozen` 917, `update` 1050 |
| `moves.js` | `mvSwing`/`swing` 343, `mvCharge` 565, `punch` 597, `heFinish` 681, `heShatter` 695, `heBoom` 710, `heSpread` 718, `heArrow` 731/743/748/913, `spCast` 790, `spEnd` 833/893, `spPin` 857, `spBack` 862, `spCatch` 869 |
| `mobs.js` | `text` 137/142/168/341, `anh('hu-pha-giap')` 142, `burst` 142/411/633, `propBlast` 158, `sparkle` 342, `lunge` 377, bọc `zoneFire` + `shake(0.15)` 623–634, `chop`/`dotTint` 860–861 |
| `boss.js` | `burst` 78/190, `chop`/`dotTint` 437–438 |
| `chuong.js` | `chHeal` 224, `chCast` 266, `chBoom` 308/316/322, `chHit` 366/377, `chEnd` 371, `chSpread` 425, `chShatter` 433 |
| `stage.js` | `fx.text` (thông báo) |

### 1.4 Cách lưu, vòng đời, giới hạn **[code]**

| Kho | Ở đâu | Giới hạn | Vòng đời / khi đầy |
|---|---|---|---|
| Trạng thái theo phòng `S` | `fx.js:75 fresh(W)`, `:85 sync()` | 1 | Tạo mới khi `G.getWorld()` đổi; `fx.reset()` xoá |
| Hạt `PT` (đối tượng dựng sẵn, dùng lại) | `fx.js:73–74`, `emit` `:199` | `MAXP = 400` (`:7`) | `updParts` (`:233`) trừ `t`, hết thì đổi chỗ với hạt cuối. Đầy thì **ghi đè** theo vòng `S.ovr` (`:201`) |
| Hình hiệu ứng `S.E` (`ty`: anh, ring, flash, cut, cres, thrust, crack, scorch, spikes, pillar, bottle, orb, beam, dashline, stuck, he) | `add` `:320` | `MAXE = 72` | `stepFx` (`:1896`) trừ `t` (có `d` = trễ). Đầy thì bỏ **cái cũ nhất** (`S.E.shift()`). Ảnh hết khung thì `drawFx` đặt `o.t = 0` (`:2093`) |
| Số / chữ nổi `S.N` | `num` `:575`, `numDoc` `:521` | `MAXN = 28`; Đợt 8: `soToiDa 6`, `chuToiDa 3` (`ui_theme.js:901–902`) | `stepNums` `:1919`; cộng dồn cùng mục tiêu trong `gop 0,25 s` (`fx.js:552–557`) |
| Dải vệt vũ khí `TR` (vòng) | `fx.js:768–769` | `TRN = 12` mẫu | `trailAge` (`:776`), mỗi mẫu sống `life` 0,085–0,12 s |
| Xác quái đang tan `S.dying` | `api('death')` | 16 | `stepDying` `:1815` |
| Bóng mờ lộn/lướt `S.ghosts` | `stepPlayer` `:1983` | 5 | 0,24 s |
| Đạn đã thấy (fx_dan) | `fx_dan.js:265 live` (Set) | — | So `W.projs` khung trước/sau để biết đạn vừa sinh / vừa mất |

Hình gắn với đối tượng sống lâu (chưởng `W.chs`, chiêu `W.mvSp`, sóng `W.mvWaves`, mây độc) được thêm **một lần** với `t: 30` hoặc `t: z.life`
và tự tắt khi đối tượng xong (`fx_he.js:650`, `fx_chuong.js:173`, `fx_he.js:534/543`).

---

## 2. Bảng từng hiệu ứng

Cột "Ảnh?": tên tệp `hu-*` (có thì vẽ ảnh qua `fx_anh.js`, không thì vẽ code). Thời lượng: `t` trong code / `giay` của tệp ảnh (bảng 2.2).

### 2.1 Hiệu ứng chiến đấu

| Hiệu ứng | Tệp:hàm | Kích hoạt bởi | Thời lượng | Vẽ | Cấu hình `G.VFX` | Cờ / URL |
|---|---|---|---|---|---|---|
| Vệt đòn thường kiếm/búa/giáo (ảnh) | `fx.js:725 swing` → `:424 anhVk` → `:415 anhVkDat` | `moves.js:590/598` qua `mvSwing` | giay tệp: kiếm 0,2; búa 0,24; giáo 0,18 | Ảnh `hu-chem-kiem`, `hu-chem-bua`, `hu-dam-giao`, xoay quanh neo bằng `c.rotate(o.xg)` (`fx.js:2085–2091`) | **không** theo `vet` | `G.CO_VK` (`?covk=0`), `G.VET_CO` (chỉ console), `G.VET_TRON` (`?vettron=0`), `G.KIEM_KHOP` (`?kiemkhop=0`), `G.KIEM_MUOT` (`?kiemmuot=0`) |
| Vệt đòn (code, khi thiếu ảnh) | `fx.js:780 trailStep` + `:818 trailDraw` | mỗi bước, khi `P.atkT>0` và mũi trong `WIN` | mẫu sống 0,085/0,115/0,12 s × (0,5+0,5·vet) | Canvas, tô tứ giác theo hàng điểm ảnh (`quad` `:802`) | `vet` (độ dài sống, độ sáng; 0 = tắt) | — |
| Trăng khuyết `cres` / mũi đâm `thrust` (code cũ) | `fx.js:739–756` | `fx.swing` khi không có ảnh và không có dải vệt | 0,16–0,24 s | Canvas `crescent()` | — | — |
| Lướt chém | `fx_he.js:164–174`, `fx.js:442 anhLuot` | Né rồi đánh (`moves.js:364`) | 0,2 | Ảnh `hu-chem-luot[-hệ]` hoặc `cres` | — | `G.CO_VK` |
| Quét vòng giáo | `fx_he.js:191–203` | nhát 4 giáo (`moves.js:611`) | 0,3 (ảnh) / 0,26 (code) | Ảnh `hu-quet-giao[-hệ]` tâm ở thân, **không theo mũi giáo** + vòng `ring` | — | — |
| Nện đất (búa giữ-thả) | `fx_he.js:206–219` | `moves.js:519` | ảnh `hu-chem-bua` + `slam()` | Ảnh + `crack` 1,6 s | `hat` | — |
| Nện (`slam`) bụi/đá/vết nứt | `fx.js:854 slam` | búa thường, chiêu búa | crack 1,6; ảnh `hu-nen-dat` 0,36 | Ảnh `hu-nen-dat[-hệ]` (neo `'san'`) hoặc 2 `ring` + `flash` | — | — |
| Trang trí hệ dọc vệt | `fx_he.js:151 decorate`, `:50/:83/:114` | mọi `mvSwing` có hệ (`o.lv>0`) | 0,24–0,42 | Canvas, theo **hình cung giả định** `shapeOf()` (`fx_he.js:15`) | — | — |
| Vệt cào của quái | `fx.js:878 enemySwing` | `combat.js:839` | 0,16 (ảnh) / 0,14 | Ảnh `hu-quai-cao[-hệ]` hoặc `cres` | — | — |
| Lao của quái | `fx.js:885 lunge` | `combat.js:836`, `mobs.js:377` | 0,15–0,25 | Hạt `streak` | — | — |
| **Trúng đòn** (chớp, vết cắt, tia, khựng, rung) | `fx.js:892 hit` (+ bọc `fx_he.js:332`) | `combat.js:452 playerHit` | ảnh 0,2–0,3; flash 0,08–0,14 | Ảnh `hu-trung`, `hu-trung-nang`, `hu-chi-mang`; hoặc `flash`+`cut`/`ring` | `hat`, `rung`, `khung` | — |
| Chớp trắng thân quái | `combat.js:285` `t.flash = 0.07` → `mobs.js:861` (`hit` × `fx.chop()`) ; `boss.js:438` | mọi `G.damage` | 0,07 s logic | Nhuộm khung quái | — | — |
| Chớp trắng thân em bé | `combat.js:632` `P.hurtT = 0.2` → `hero_tinhlinh.js` `TINT.F` / `sprite_custom.js` `emBeTint` | `G.hurtPlayer` | 0,2 s | Nhuộm trắng 0,6 | — | — |
| Em bé trúng đòn | `fx.js:1712 hurt` | `combat.js:635` | ảnh 0,2 | Ảnh `hu-be-trung[-hệ]` hoặc `flash` + số `-n` + viền đỏ (`S.hurt` 0,3) | `rung`, `khung` | — |
| Số sát thương | `fx.js:592 dmg` → `num`/`dmgDoc` | `combat.js:287` | 0,55–1 s | Chữ canvas ở lớp UI (`G.ux`) | — | `G.DO_DOC_TRAN` (`?doctran=0`) |
| Giật lùi / nhún / nảy khi trúng | `fx.js:903–911` đặt `e.fxK, fxS, fxL, fxHop`; vẽ `fx.xf` `:1125`, `fx.recoil` `:1233` | `fx.hit` | 0,13 s (`fxK`) | Biến đổi canvas khi vẽ nhân vật | `nhun` | — |
| Rung màn hình | `fx.js:460 trauma`, `:461 kick`, `:1931 stepShake` | bảng 4.2 | trauma giảm 1,9/s | Dời lớp thế giới | `rung` | — |
| Khựng hình | `fx.js:462 stop`, `:475 frozen` | bảng 4.1 | 40–120 ms | Dừng `updateWorld` | `khung` | — |
| Chớp cả màn hình | `fx.js:2378` (`S.flash`) | tiến hoá `:1765`, trùm chết `:1795/:1857`, chưởng tối thượng `fx_ky_nang.js:39` | 0,45–0,6 s | `fillRect` cả màn | `rung` (=0 thì tắt) | — |
| Bụi bước chân em bé | `fx.js:1966–1974` | `P.moving`, đồng hồ **0,21 s** | hạt 0,2–0,4 s | Hạt loại 2 (ly 0) | `bui` | — |
| Bụi tiếp đất sau lộn | `fx.js:1953–1955` | hết `P.dodgeT` | 0,25–0,4 | Hạt loại 2 | `bui` | — |
| Bụi chân quái | `fx.js:1092 buiBuoc` (gọi ở `edges` `:1085`) | quãng đi ≥ 9–15 điểm ảnh | 0,22–0,38 | Hạt loại 2 | `bui` | — |
| Bụi lộn / lướt | `fx.js:1693 dodge`, `:1623 dash` | `combat.js:770`, đòn lao | 0,25–0,5 | Hạt loại 2 + `dashline` 0,4 | **không** theo `bui` | — |
| Bóng mờ lộn/lướt | `fx.js:1976–1988` | `P.dodgeT/dashT` | 0,24 | Vẽ lại em bé mờ | — | — |
| Hào quang tay cầm vũ khí | `fx.js:1990–2003` | vũ khí mốc ≥ 2 hoặc phủ hệ | — | Hạt ở `hand(P)` | — | — |
| Xác quái tan / trùm nổ | `fx.js:1785 death`, `:1815 stepDying`, `:1855 bossEnd` | `combat.js:380` | quái: theo `die` của ảnh; trùm 1,25 s + nổ | Ảnh `hu-quai-chet`, `hu-no-nho`, `hu-trum-no` | `hat`, `rung`, `khung` | — |

### 2.2 Đạn, tên, chưởng, kỹ năng

| Hiệu ứng | Tệp:hàm | Kích hoạt | Thời lượng | Vẽ | Ghi chú |
|---|---|---|---|---|---|
| Mũi tên em bé (thân) | `fx_dan.js:226 A.proj` | `W.projs` (`combat.js:547`, `moves.js` `shoot`) | lặp 0,3 s | Ảnh `hu-dan-ten[-hệ]` xoay theo `atan2(vy,vx)` | 4 lớp vẽ thêm quanh tên: `fx.js:994` vệt sau tên, `fx_he.js:406` hệ, `fx_dan.js:194` quầng, `fx_ky_nang.js:240` lõi sáng |
| Chớp lúc buông tên | `fx_dan.js:323`; thêm `fx.js:970` cho tên lớn | đạn mới | 0,07 / 0,1 | `flash`, `ring` | Tên lớn có **2 chớp** (trùng) |
| Tên trúng quái | `fx_dan.js:270 impact` (theo `o.seen`) **và** `fx.js:892 hit` (`ranged`) | `combat.js:953–954` | 0,09–0,24 | `ring`+`flash`+hạt **và** ảnh `hu-trung` sc 0,8 | Trùng lặp (mục 6) |
| Tên cắm tường | `fx_dan.js:297 wallHit` → `drawStuck` | đạn mất ở mép | 0,9 | `ty:'he'` | — |
| Tên mưa rơi | `fx.js:1034 rainDrop` → hạt loại 7 → `land` `:250` (`stuck` 0,45) | `combat.js:1000` | 0,5–0,6 | Hạt | — |
| Đạn quái | `fx_dan.js:186/226`, `step` `:312` | `W.projs` team enemy | lặp 0,32–0,4 | Ảnh `hu-dan-*` (9 kiểu) hoặc sprite xoay 16 hướng (`fx_dan.js:131`) | Quầng đỏ + chấm đỏ nhấp nháy |
| Bom quái | `fx.js:1315 propBlast` (`pr.nr`) | `mobs.js:158` | ảnh nổ 0,55 | `hu-no-lua/doc/bang` | — |
| Ra chiêu đặc biệt | `fx_he.js:665 spCast` | `moves.js:790` | 0,2 | Ảnh `hu-ra-chieu[-hệ]` | khựng 40/60 |
| Trảm Nguyệt bay | `fx_he.js:570 drawCres` | `W.mvSp` | lặp 0,32 | Ảnh `hu-tram-nguyet[-hệ]` | — |
| Phi Thương | `fx_he.js:593 drawSpear` | `W.mvSp` | — | `G.weaponArt.draw` (vũ khí thật) | — |
| Địa Chấn | `fx_he.js:614 drawCrack` | `W.mvSp` | — | Canvas | — |
| Chưởng | `fx_chuong.js:168 step`, `:218 chCast`, `:236 chBoom` | `chuong.js` | lặp 0,4 | Ảnh `hu-chuong-*`, `hu-ra-chuong[-hệ]`, `hu-no-*` | Bậc cường độ `fx_ky_nang.js:27–32` |
| Vòng phép, độc, nhịp độc | `fx_ky_nang.js` | `chBoom`, `heBoom`, `combo`, `status`, `dmg` | 0,22–0,7 | Canvas | — |

### 2.3 Tệp ảnh `hu-*` liên quan đòn đánh **[code: đọc JSON]**

101 tệp `game/art/custom/hu-*.sprite.json`, tất cả `net: 2`. Các tệp dính tới đòn của em bé:

| Mã | Khung (rộng×cao) | Neo `goc` | Số khung | `giay` | `co` | `xoay` | Dùng ở |
|---|---|---|---|---|---|---|---|
| `hu-chem-kiem` | 56×48 | [8,24] | 6 | 0,20 | 0,8 | không | `fx.js:723` |
| `hu-chem-bua` | 56×56 | [10,30] | 6 | 0,24 | 0,8 | không | `fx.js:723`, `fx_he.js:210` |
| `hu-dam-giao` | 56×20 | [2,10] | 5 | 0,18 | 0,85 | không | `fx.js:723` |
| `hu-chem-luot[-hệ]` | 64×28 | [8,14] | 6 | 0,20 | 1 | không | `fx_he.js:167` |
| `hu-quet-giao[-hệ]` | 104×36 | [52,18] | 8 | 0,30 | 1 | không | `fx_he.js:195` |
| `hu-nen-dat[-hệ]` | 80×48 | [40,36] | 6 | 0,36 | 1 | không | `fx.js:858` |
| `hu-ban-cung[-hệ]` | 32×32 | [4,16] | 4 | 0,16 | 1 | có | `fx_he.js:181` |
| `hu-trung` / `hu-trung-nang` / `hu-chi-mang` | 32 / 40 / 56 | giữa | 5 / 6 / 6 | 0,2 / 0,24 / 0,3 | 1 | không | `fx.js:919` |
| `hu-dan-ten[-hệ]` | 24×8 / 28×12 | [14,4] / [16,6] | 4 | 0,3 lặp | 1 | có | `fx_dan.js:220–225` |

`fx_anh.js` chỉ phát dải khung ngang: khung = `floor(t/giay·so)` (`fx_anh.js:57–62`), vẽ bằng `drawImage` với `imageSmoothingEnabled=false`,
`co` của tệp nhân `co` của nơi gọi (`fx_anh.js:71`). Tệp không bật `xoay` thì góc chỉ dùng để **lật** (`fx_anh.js:73`); vệt bám mũi tự xoay canvas trước khi gọi (`fx.js:2087`).

### 2.4 `vfx_cfg.js` (toàn bộ, `vfx_cfg.js:5–15`)

| Khoá | Mặc định | Thật sự dùng ở **[code]** |
|---|---|---|
| `rung` | 1 | `trauma`, `kick` (`fx.js:460–461`), chớp màn hình (`:2378`) |
| `khung` | 1 | `stop` (`fx.js:463`) |
| `hat` | 1 | `fx.hit` `NH` (`:916`, tối thiểu 1 hạt), xác tan (`:1832`), `hatK` nổ, `fx_dan.js hatN`, `fx_ky_nang.js nHat/pHat` |
| `vet` | 1 | **chỉ** dải vệt code (`:784`, `:820`). Vệt ảnh AI không đọc (mục 6) |
| `nhun` | 1 | `fx.xf` (`:1128`), xác quái (`:2358`) |
| `bui` | 1 | bụi chân bé (`:1966`), tiếp đất (`:1955`), chân quái (`:1093`), (`:1811`) |
| `moiTruong`, `giaoDien`, `vien` | 1 | ngoài phạm vi fx (môi trường, giao diện, viền nhân vật) |

---

## 3. Vệt chém: lấy đường vung từ đâu

### 3.1 Nguồn dữ liệu: `G.tinhLinh.tip(o)` (`hero_tinhlinh.js:1850–1873`)

`tip` dựng **đúng khung đang vẽ** (`frame(o)`, cùng bộ nhớ đệm `KCACHE` với lúc vẽ em bé) rồi lấy vũ khí **sau khi ghép vào tay thân AI** (`vkGhep`):

```js
// hero_tinhlinh.js:1851, 1866-1869
const fr = frame(o), w = vkGhep(o, fr).wp; // vệt chém đi theo đúng hình vũ khí đang vẽ
const n = fr.anim === 'spec' ? 7 : fr.anim === 'sweep' ? 10 : ATKN[w.type] || 8;
TIP.anim = fr.anim; TIP.u = (fr.f + 0.5) / n; TIP.wt = w.type; ...
TIP.gx = X0 + f * gx; TIP.gy = Y0 + gy; TIP.dx = f * Math.cos(r) * sx; TIP.dy = Math.sin(r); TIP.L = L;
TIP.front = !!w.front;
```

- `(gx, gy)`: **điểm cầm** trên màn hình (đã lật theo mặt, đã cộng nhún bước `nhunBuoc`, đã dời theo `lechCo` khi vũ khí ảnh AI co nhỏ).
- `(dx, dy)`: hướng thân vũ khí từ **góc** `w.ang`. Góc này đến từ khung xương code (`ATK` `hero_tinhlinh.js:988`, `SPEC` `:1009`) hoặc,
  với kiếm trên thân AI, từ đường vung liên tục `kiemMuot` (`:1593`, bảng góc `VUNG` `:1540`, nhịp `MU` `:1548`, tính theo `o.atk` **liên tục**),
  rồi luật kéo kiếm sau lưng `kiemSau` (`:1408`).
- `L`: dài từ điểm cầm tới **mũi**. Có ảnh vũ khí AI: `|mui − cam| × coVk` (điểm `vk.mui`, `vk.cam` của tệp `vk-*`). Không có: 48 / 34 / 36.
- `u`: tiến độ **lượng tử theo khung xương** (`fr.f` từ `pick` → `nhip()` `:1146`, `ATKN = {sword:10, hammer:14, spear:10, bow:12}` `:1017`), không phải `o.atk`.
- Cung không có vệt (`tip` trả `null` với `bow`).

Như vậy vệt **bám khung ảnh + vũ khí đang vẽ**, không bám hitbox. Hitbox là hộp `boxHit` theo `reach/depth` (`moves.js:319`), độc lập với hình.

### 3.2 `cungVk(P, win)` (`fx.js:382–413`): cung vung của một đòn

1. Chỉ chạy khi `G.CO_VK` bật, có `tip`, và `P` là người chơi (`:384`).
2. Lấy mẫu **41 thời điểm** `o.atk = i/40` của chính đòn đang đánh (cùng `comboI`, cùng thân, cùng vũ khí), gọi `tip` mỗi lần (`:387–389`).
3. Giữ mẫu có `q.anim === 'atk'` và `q.u` trong cửa sổ `win` (`WIN.atk`, `fx.js:771`: kiếm `[0.2, 0.66]`, búa `[0.26, 0.64]`, giáo `[0.42, 0.66]`).
4. Đánh dấu `sau` (bỏ khỏi cung) khi kiếm chĩa ra sau lưng (`G.KIEM_KHOP`, `dx·f < −0,25·|d|`, `:393`). Chỉ khi **tắt** `G.VET_TRON` mới bỏ thêm mẫu kiếm vẽ sau thân (`q.front === false`, `:395`).
5. Còn dưới 3 mẫu trước mặt và `VET_TRON` bật thì lấy **cả** đường vung (`caCung`, `:399`).
6. Gộp: góc nối liền (không nhảy 2π), tâm cung = **trung bình điểm cầm**, bán kính = **dài mũi lớn nhất**, góc giữa `am = (a0 + a1)/2`
   (góc mẫu đầu và mẫu cuối, không phải trung bình theo cung), và mẫu "xa nhất phía trước" `ex/ey/ea/eL` cho giáo (`:400–412`).

```js
// fx.js:406-411
const l = q.L * Math.hypot(q.dx, q.dy), gx = q.gx - P.x, gy = q.gy - P.y, ex = (gx + Math.cos(a) * l) * f;
a1 = a; n++; sx += gx; sy += gy; if (l > L) L = l;
if (ex > best) { best = ex; CU.ex = gx; CU.ey = gy; CU.ea = a; CU.eL = l; }
...
CU.px = sx / n; CU.py = sy / n; CU.r = L; CU.am = (a0 + a1) / 2;
```

`anhVk` (`fx.js:424–440`) đặt ảnh: kiếm/búa thì neo ở tâm cung, cỡ `(r+1)/(A.r·co)`, không nhỏ hơn cỡ cũ `scDam` khi `G.VET_CO !== false`.
Giáo thì đặt đầu nhọn ảnh ở mũi giáo lúc đâm xa nhất. `ANH_VK` (`:370`) ghi bán kính mép ngoài của từng ảnh, đo tay: kiếm 25, búa 30, giáo 44, lướt 43,5.
`anhVkDat` (`:415–421`) gắn `h.theo = P`: ảnh **đi theo em bé** suốt lúc phát (`fx.js:2086`). Góc xoay `xg` thì cố định từ lúc tạo.

Số đo **[đo]** (Cu Tí `smith`, thân AI gốc, góc mũi theo `tip`, `atk` từng bước 0,1):

| Đòn | atk 0,3 | 0,4 | 0,5 | 0,6 | 0,7 | Vệt thật được tạo lúc |
|---|---|---|---|---|---|---|
| Kiếm nhát 1 (Chém ngang) | −155° (sau thân) | −59° | 13° | 28° | 26° | atk = 0,50 |
| Kiếm nhát 2 (Chém ngược) | 55° | 13° | −53° | −62° | −62° | 0,50 |
| Kiếm nhát 3 (Nhát kết) | −180° | −93° | 40° | 55° | 52° | 0,47 |
| Búa (Nện) | −70° | −92° | 42° | 43° | 0° (u 0,82) | 0,354 |
| Giáo (Đâm) | −3° | −2° | 0° | 1° | −1° | 0,48–0,49 |

Ảnh vệt kiếm đo được: `xg` ≈ −0,27 / −0,07 / −0,33 rad, cỡ 1,32–1,40, neo `(tdx, tdy)` ≈ (4,5; −10,6) … (8,3; −4,9) so với chân.

### 3.3 Liên hệ với khung ảnh và vũ khí

- Vệt **không** có trong dữ liệu khung (`dong_tac` của `em-be-*.sprite.json` không có trường vệt). Ảnh vệt là một tệp `hu-*` riêng
  phát **6 khung trong 0,2 s, tính từ lúc gây sát thương**. Khung ảnh em bé (thân AI) và khung xương chỉ đóng góp vị trí điểm cầm và góc.
- Đường vung lấy mẫu **trước và sau** thời điểm hiện tại (atk 0,2→0,66) ngay tại lúc trúng, nên ảnh vẽ **cả cung một lần** (ảnh tự có
  hoạt ảnh quét trong 6 khung), không vẽ dần theo mũi kiếm như dải vệt code.

### 3.4 Thân gốc / thân bộ / thân code

| Thân | `tip()` lấy vũ khí từ | Khác biệt vệt |
|---|---|---|
| Thân code (không có ảnh `em-be-*`) | khung xương `ATK` (`vkGhep0` trả `wp` nguyên, `:1362`, `:1375`) | Góc nhảy theo 10 khung xương; `kiemMuot`/`kiemSau` trả `null` (không có `gv`) |
| Thân AI gốc (`em-be-<key>`) | `vkGhep0` bám điểm `tay_truoc` đo trên từng khung ảnh (`:1369–1374`), góc từ `kiemMuot` | Bảng góc riêng từng em bé (`VUNG.smith/hunter/…`, `:1540–1547`) |
| Thân bộ (`tp-*`, đồ mặc theo bộ) | như thân AI nhưng đĩa mặt `gv.mat` đo trên ảnh thân bộ (to hơn do mũ/đồ) | Trước `G.VET_TRON` bỏ gần hết mẫu (`front === false`): nhát 1 còn 0 mẫu, vệt rơi về chỗ cố định. `VET_TRON` (mặc định bật) sửa: chỉ bỏ theo hướng lưỡi, `< 3` mẫu thì lấy cả cung (`fx.js:395–399`). Số đo ở báo cáo `vet-combo/bao-cao.md` (đối chiếu code: khớp) |
| Chạy mà chém | `VUNG._` / `VUNG._hunter` (`:1541–1542`) | Góc riêng cho khi thân đang ở hàng chạy |

---

## 4. Rung màn hình và khựng hình

### 4.1 Khựng hình (hit-stop) **[code]**

```js
// fx.js:462-468
function stop(ms) {
  ms *= VX('khung');
  if (!(ms > 0)) return;
  const s = ms / 1000;
  if (S.stop > 0) { if (s > S.stop) S.stop = s; return; }
  if (S.stopGap > 0 && ms < 100) return; // không khựng liên tục khi đánh cả đám
  S.stop = s;
```

`fx.frozen` (`fx.js:475–491`) được `G.updateWorld` hỏi **đầu mỗi bước** (`combat.js:917`); đang khựng thì `return`: em bé, quái, đạn, vùng, `P.atkT`,
`e.flash`… **đứng yên**. Hiệu ứng vẫn chạy kiểu chậm: `step(dt, true)` (`fx.js:2042`) cho hạt chạy 30%, dải vệt tắt 50%, số sát thương chạy bình thường,
rung vẫn tính; hình `S.E` (ảnh vệt) **đứng yên** (không gọi `stepFx`). Nút bấm trong lúc khựng được giữ (`S.latch`) và trả về khung sau.
Khựng xong có `stopGap = 0,07 s` không khựng lại (trừ khựng ≥ 100 ms) và chớp trắng chỉ ở khung đầu (`fx.chop`, `fx.js:494`).

| Ai gọi | ms | Dòng |
|---|---|---|
| Trúng cận chiến: thường / búa / nặng / kết liễu / chí mạng | 45 / 70 / 90 / 100 / 115 | `fx.js:954` |
| Tên trúng: chỉ tên lớn hoặc chí mạng | 50 | `fx.js:952` |
| Em bé trúng đòn | 60 | `fx.js:1727` |
| Nện đất nấc 2 / chiêu búa / chiêu kiếm | 60 / 60 / 40 | `fx_he.js:218/689/676` |
| Băng vỡ, ghim giáo, bẫy kẹp, `slam` | 70 | `fx_he.js:275/697`, `fx.js:1665/1640` |
| Kết hợp hệ (Nổ khói / Sốc nhiệt), nổ đồ vật | 80 / 100 / 90 | `fx.js:1300/1311/1321` |
| Gồng / tiến hoá vũ khí / trùm chết | 60 / 110 / 120 | `fx.js:1691/1781/1796` |
| Chưởng tối thượng | 85 | `fx_ky_nang.js:31` (`CAP.toiThuong.khung`) |
| `fx.hitStop` (API) | — | `fx.js:471`: **không ai gọi** |

**Có ảnh hưởng thời gian logic không? Có, nhưng chỉ khi có vẽ.**
- `fx.frozen` bỏ qua khi `G.noRender` (`combat.js:917`, `fx.js:476`), nên chạy không vẽ (`G.sim`, bot, các bài `tests/*.py` dùng `G.sim`) **không bao giờ khựng**.
- `G.time` vẫn tăng đều trong lúc khựng (`engine.js:563`, trong `G.tick` `:562`), trong khi `updateWorld` dừng. Cửa sổ nối chuỗi tính theo `G.time`
  (`moves.js:192` `G.time - mv.lastT > mv.gap`, với `mv.lastT = G.time + P.atkT` đặt lúc **bắt đầu** nhát, `moves.js:309`), nên thời gian rảnh
  thật sau khi nhát kết thúc bị **ngắn đi đúng bằng thời gian khựng** (gap 0,45 s → 0,405 s sau nhát thường, 0,36 s sau Nhát kết) **[suy luận từ code]**.
- **[đo]** Giữ nút Đánh liên tục 600 bước (10 s), kiếm, bia không chết: **có khựng 23 nhát / 320 sát thương, không khựng 27 nhát / 382** (−15%).
  Mốc trúng có khựng: 0,167; 0,533; 0,967; 1,467… Không khựng: 0,167; 0,483; 0,867; 1,267… Búa giữ-thả: cùng 8 nhát, mỗi nhát trễ thêm 0,1 s.

### 4.2 Rung màn hình **[code]**

Hai cơ chế chồng lên nhau:

1. **Hệ mới** `trauma(a)` + `kick(dx, dy)` (`fx.js:460–461`), giải ở `stepShake` (`fx.js:1931–1942`):
   `S.trauma` giảm 1,9/s; dời `sx = kx + rand·4·trauma²`, `sy = ky + rand·3·trauma²` (làm tròn điểm ảnh); `kick` kẹp ±4 / ±3 rồi dội `×(−0,55)` mỗi bước.
2. **Hệ cũ** `W.shake` (số giây) do luật đặt: `combat.js:433` (trùm chết 0,6), `:552` (búa 0,08), `:633` (bé trúng 0,18), `:987` (vùng nổ 0,06),
   `moves.js:517` (nện đất 0,16/0,3), `:599` (nện 0,08), `:770`, `:788`, `boss.js:92/397`, `chuong.js:306`, `mobs.js:350`.
   `stepShake` đổi mỗi lần `W.shake` tăng thành `trauma(min(1, W.shake·1,7))` (`fx.js:1933`). `W.shake` tự giảm trong `updateWorld` (`combat.js:1044`).
   Không có `fx.js` thì `drawWorld` rung kiểu cũ ±2/±1 bằng `Math.random` (`combat.js:1075`).

Rung chỉ dời **lớp thế giới** (`G.wxDat(c, -cam + sx, sy)`, `combat.js:1078`). Số sát thương và giao diện không rung; vùng báo trước nhận `sx, sy` (`combat.js:1151`).

Giá trị `trauma` chính: trúng cận chiến 0,14 / 0,3 (búa, nặng) / 0,4 (chí mạng), nhân `dim = 1/(1+1,5·hitN)` khi nhiều con trúng cùng bước (`fx.js:913, 955`);
bé trúng 0,45; slam 0,8; trùm chết 1. **[đo]** Rung lớn nhất trong 5 s đánh bia: kiếm/giáo 4 px ngang, 0 px dọc; búa 2 px ngang, 3 px dọc; cung 1 px.

---

## 5. Đo nhanh bằng Playwright

Script (chỉ trong thư mục tạm): `scratchpad/pl5/do_fx.py`, `do_fx_khong_anh.py`, `do_khung.py`; kết quả `ket_qua.json`, `ket_qua_khong_anh.json`, `ket_qua_khung.json`.
Cách làm: mở `file:///…/game/index.html` 844×390, **nạp ảnh như bản đóng gói** bằng `add_init_script` đặt `G.customSpriteData` = 345 tệp
(`em-*`, `ghep-*`, `hu-*`, `vk-*`, `tp-*`), nạp `tests/bot.js`, `setup.js`, `au_lib.js`; `AU.room` + 1 bia `AU.dummy` (máu 10⁷, ghim chỗ);
chạy `AU.run(1, true)` (có khựng như lúc vẽ) 300 bước, bấm Đánh mỗi 30 bước (búa 54). Đếm hình mới trong `G.fx.state().E` theo danh tính,
hạt mới bằng cách soi `PT[i].a` đổi (mỗi `emit` gán `o.a = R()`), số bước khựng, rung lớn nhất. Không vẽ khung (chỉ cập nhật), nên ảnh tắt theo `t` chứ không theo số khung ảnh.

### 5.1 Có ảnh AI (như bản đóng gói), Cu Tí (`smith`); Cu Tèo (`hunter`) cho cùng số

| Vũ khí | Nhát trúng / 5 s | Bước khựng | Khựng mỗi nhát (ms) | Hình `S.E` sinh ra | Hạt mới | Hạt / nhát |
|---|---|---|---|---|---|---|
| Kiếm | 10 | 39 | 45, 45, 90 (nhát kết) | `hu-chem-kiem` 10, `hu-trung` 7, `hu-trung-nang` 3 | 54 | ~5 |
| Giáo | 10 | 36 | 45 ×3, 90 (quét) | `hu-dam-giao` 8, `hu-quet-giao` 2, `ring` 2, `hu-trung` 8, `hu-trung-nang` 2 | 68 | ~7 |
| Búa | 6 | 30 | 70 | `hu-chem-bua` 6, `hu-nen-dat` 6, `crack` 6, `hu-trung-nang` 6 | 72 | ~12 |
| Cung (tên thường) | 10 | 0 | — | `flash` 20, `ring` 10, `hu-trung` 10, `he` (tên cắm tường) 9 | 213 | ~21 |

Thời gian sống đo được (bước 1/60 s, đã gồm khựng): `hu-chem-kiem` 15 bước (0,2 s + 3 bước khựng), Nhát kết 18; `hu-dam-giao` 13; `hu-quet-giao` 24;
`hu-chem-bua` 19; `hu-nen-dat` 26; `crack` 106 (1,6 s); `hu-trung` 15 (cận chiến) / 12 (tên); `hu-trung-nang` 20; `flash` 5–6; `ring` 11–21.
Thời điểm tạo vệt so với đòn: kiếm atk = 0,50 (nhát kết 0,47); giáo 0,48–0,49; búa 0,354 (`hitAt 0,35`, `moves.js:74`); cung: tên bay, không có vệt.
`fx.errs = 0`, không có `pageerror`.

### 5.2 Không có ảnh (bản nguồn `index.html`)

| Vũ khí | Hình `S.E` | Hạt mới |
|---|---|---|
| Kiếm | `flash` 10, `cut` 10, `ring` 3: **không có `cres`**, vệt là dải `trailDraw` (không nằm trong `S.E`) | 77 |
| Giáo | `thrust` 8, `cres` 4 (quét), `flash` 10, `ring` 4 | 111 |
| Búa | `cres` 6, `crack` 6, `ring` 24, `flash` 12 | 121 |
| Cung | `flash` **30** (3 chớp mỗi tên: buông, `impact` của `fx_dan`, `hit` của `fx.js`), `ring` 10 | 251 |

---

## 6. Lỗi tiềm ẩn, trùng lặp, không đồng bộ

| # | Vấn đề | Bằng chứng | Loại |
|---|---|---|---|
| L1 | **Khựng hình đổi nhịp logic chỉ khi có vẽ**: chạy không vẽ (bot, bài kiểm `G.sim`) nhanh hơn chơi thật. Mọi số DPS/cân bằng đo bằng `G.sim` lệch so với trận thật | `combat.js:917` (`!G.noRender && …frozen`), `fx.js:476`. Kiếm giữ nút 10 s: 23 vs 27 nhát (−15%) | **đã đo** |
| L2 | `G.time` vẫn chạy trong lúc khựng nên cửa sổ nối chuỗi bị ăn mất 45–115 ms | `engine.js:563`, `moves.js:192`, `:309` | suy luận từ code |
| L3 | **Vệt sinh ra ở lúc gây sát thương, không ở lúc bắt đầu vung**: kiếm nhát 1 lúc tạo vệt (atk 0,5), lưỡi đã đi từ −59° tới 13°; ảnh vẽ cả cung −59°→28° rồi phát 0,2 s, trong khi nhát còn 0,15 s (0,5 × 0,3 s). Vệt **còn 0,05 s sau khi nhát xong** (+ khựng), và phần lấy đà trước 0,5 không có vệt đi kèm | `moves.js:589–590` (gọi `swingFx` sau `boxHit`), `fx.js:771`, số mục 3.2 và 5.1 | đã đo (thời điểm), suy luận (cảm nhận) |
| L4 | `cungVk` lấy góc giữa `am = (a0+a1)/2` từ mẫu đầu/cuối; tâm cung là **trung bình điểm cầm**, trong khi tay thật di chuyển nhiều trên thân AI; bán kính = dài **lớn nhất**. Ảnh vẽ một cung tròn lý tưởng, không theo đường mũi thật (thường là elip/xoắn) | `fx.js:400–411` | suy luận |
| L5 | **Nhiều nơi tự đặt vệt ở chỗ cố định, không bám mũi**: `hu-quet-giao` (tâm thân, `fx_he.js:196`), nện đất `hu-chem-bua` (`fx_he.js:210`, chỗ cố định `P.x+f·4, P.y−17`), dự phòng `fx.js:734`, trăng khuyết code `fx.js:739–756`, `fx_he.js:171/197/211`; trang trí hệ dùng cung giả định `shapeOf` (`fx_he.js:15–28`), **không** dùng `cungVk` → lửa/độc/băng có thể nằm lệch vệt ảnh | các dòng nêu | đã thấy trong code |
| L6 | **Hai bộ vẽ vệt song song**: dải vệt code (`trailStep/trailDraw`) và ảnh AI (`anhVk`), chọn theo "có ảnh không" ngay trong `trailStep` (`fx.js:789`). Bản nguồn và bản đóng gói nhìn khác hẳn (5.1 vs 5.2). Thêm `A.slash` (`art.js:3323`) + `W.slashes` (`combat.js:1141`) là **mã chết**: không chỗ nào `push` vào `W.slashes` (grep `slashes.push`: 0 kết quả); tương tự `W.texts`/`W.parts` chỉ còn đường `legacy()` (`fx.js:1943`) | grep | đã thấy |
| L7 | **Tên trúng quái vẽ hiệu ứng hai lần**: `fx_dan.js impact` (ring + flash + hạt) và `fx.hit(ranged)` (ảnh `hu-trung` hoặc flash). Tên lớn còn **hai chớp lúc buông** (`fx.js:970` + `fx_dan.js:323`). Mũi tên có 4 lớp vẽ quanh + ảnh | 5.1: 10 tên → 20 flash + 10 `hu-trung` + 10 ring; 5.2: 30 flash | **đã đo** |
| L8 | `G.VFX.vet = 0` **không tắt** vệt ảnh AI (chỉ tắt dải code). `anhVk`/`swing` không đọc `VX('vet')` | `fx.js:732–734` vs `:784` | đã thấy trong code |
| L9 | `G.VFX.bui = 0` không tắt bụi lộn, lướt, nện, Gồng (`fx.js:1626, 1693–1696, 1688`) | grep `VX('bui')` | đã thấy |
| L10 | Bụi bước chân em bé theo **đồng hồ 0,21 s**, không theo khung chạy (thân code 8 khung × 13 khung/s → bước mỗi 0,31 s; thân AI dùng `khungLap` + nhịp `i % 3 === 1`, `sprite_custom.js:618–628`) → bụi không trùng nhịp chân | `fx.js:1968–1970` | suy luận từ code |
| L11 | `hand(P)` của hiệu ứng là **điểm cố định** `P.x + face·7, P.y − 14` (cung: theo hướng ngắm), không đọc tay thân AI (`tay_truoc`) → chớp lấy đà, đổi vũ khí, Nung, bắt giáo… có thể lệch tay ảnh | `fx.js:1617–1621` | suy luận |
| L12 | `cungVk` gọi `tip()` 41 lần lúc trúng; `tip` → `frame()` có thể dựng khung mới (`kidSprite`) nếu chưa có trong `KCACHE` → có thể giật một khung ở nhát đầu của mỗi kiểu đòn | `fx.js:387–389`, `hero_tinhlinh.js:1243–1260` | suy luận (chưa đo thời gian khung) |
| L13 | `tip()` (từ `cungVk`, `trailStep`) đi qua `kiemSau`, nơi có **trạng thái** (`NHO_GOC`: `r.ksVao.n++` khi `t > v.tl`). Gọi ngoài lúc vẽ có thể đổi bộ đếm làm êm góc. Với bước cố định 1/60 và một lần vẽ mỗi bước thì vô hại | `hero_tinhlinh.js:1416–1428` | suy luận |
| L14 | "Chỉ đọc trạng thái game" (`fx.js:2`) không hoàn toàn đúng: fx **ghi** `P.fxS/fxL`, `e.fxK/fxHk/fxHop`, `e.fxHitAt`, và `t.flash = 0` (nhịp độc, `fx.js:601`, `:560`). `e.flash` chỉ dùng để vẽ nên không đổi luật; nhưng thiết kế lại phải giữ các trường này | grep | đã thấy |
| L15 | Hai hệ rung chồng nhau: một đòn búa vừa `W.shake = 0.08` (`moves.js:599`) vừa `trauma(0.3)` trong `fx.hit`; bé trúng đòn `W.shake 0.18` (`combat.js:633`) + `trauma(0.45)` | các dòng nêu | đã thấy |
| L16 | Cờ không đồng đều: `G.VET_TRON`, `G.CO_VK`, `G.KIEM_*` có `?…=0`; `G.VET_DAM`, `G.VET_CO`, `G.VIEN_VUNG` chỉ đặt được trong console | `fx.js:323, 378, 432, 1435` | đã thấy |
| L17 | `fx_dan` đặt `OWN = 0` cho **cả** tên của em bé (`fx_dan.js:370`, chớp buông `:323`) → chớp buông/`impact` của tên bé được coi là hiệu ứng của quái (không nhạt, không vào nhóm "vệt đòn") | `fx_dan.js:370`, `fx.js:322–324` | suy luận |
| L18 | `S.E` đầy (72) thì `shift()` bỏ hình **cũ nhất**, có thể là vệt đang phát hoặc vết nứt; hạt đầy 400 thì ghi đè theo vòng. Trận đông có thể mất vệt chém | `fx.js:325, 201` | suy luận (bài `tests/au_hieu_ung.py` đo mức bão hoà) |

---

## 7. Giữ lại khi thiết kế lại

- **Thời điểm**: sát thương ở `P.hitAt` (mặc định 0,45; búa 0,35) do `combat.js:801` quyết định. Hiệu ứng chỉ được **đọc** mốc này, không đổi.
- `fx.frozen` / `S.latch` (giữ nút trong lúc khựng), `fx.chop` (chớp trắng chỉ khung đầu), `stopGap`.
- `G.tinhLinh.tip()` là **nguồn duy nhất** cho vị trí mũi vũ khí theo khung vẽ. Hệ animation mới nên xuất ra đúng dữ liệu này (điểm cầm, hướng, độ dài,
  tiến độ đòn, trước/sau thân) cho từng khung, kể cả điểm mũi đo trên ảnh.
- Các cờ quay lui (`VET_TRON`, `VET_DAM`, `VET_CO`, `CO_VK`, `KIEM_*`) và `G.VFX` (một chỗ chỉnh).
- Các trường hình do fx ghi lên nhân vật (`fxS, fxL, fxHop, fxK, fxD, fxHk, fxHitAt, fxDotAt`) vì `mobs.js:861`, `boss.js:438`, `combat.js:1096–1127` (`xf`, `recoil` khi vẽ) đọc chúng.

## 8. Điều chưa chắc

- Chưa đo thời gian khung (frame time) lúc `cungVk` dựng khung mới (L12), và chưa chụp ảnh để so vị trí vệt với mũi kiếm từng khung vẽ (phiên `vet-combo` đã chụp).
- Không kiểm `tip()` khi có góc ngắm `aimRel ≠ 0` (vệt ảnh dùng `neo:'khoa'` nên `aimed` không xoay; tôi giả định góc vũ khí trong `tip` đã gồm hướng ngắm vì `pick` truyền `ai`).
- Đo trên `index.html` có nạp ảnh bằng `add_init_script`, không phải bản `dist/` thật (bản `dist/` trong repo có thể cũ hơn commit).
- Thân bộ (`tp-*`) không đo lại ở phiên này; số liệu thân bộ lấy từ `vet-combo/bao-cao.md` và chỉ đối chiếu với code `fx.js:393–399`.
