# Phụ lục 4: Đòn đánh, né, nhận đòn, hitbox (mục 5, 6, 10 của YEU-CAU.md)

Commit `229e263`, nhánh `khoi-tao-du-an`. Tệp này chỉ phân tích, không sửa code game.
Mọi `tệp:dòng` ghi theo `game/js/` ở commit trên. Số đo lấy bằng Playwright (Chromium, 844×390, `file://…/game/index.html`, nạp
`tests/bot.js`, `tests/setup.js`, `tests/au_lib.js` cùng một tệp đo riêng đặt trong scratchpad, không nằm trong repo), chạy `G.sim` 60 nhịp/giây.
"Khung" (frame) trong mọi bảng là **nhịp logic 1/60 giây** (`engine.js:560` `const STEP = 1 / 60`), không phải khung ảnh sprite.

Phân biệt nguồn trong tệp này:
- **[đo]**: số đo thật từ Playwright.
- **[code]**: đọc thẳng từ code, có `tệp:dòng`.
- **[suy luận]**: lập luận từ code, chưa đo trực tiếp.

---

## 0. Tóm tắt nhanh cho người thiết kế lại animation

1. **Sát thương chỉ gắn với thời gian, không gắn với số khung ảnh.** Mỗi đòn là một đồng hồ `P.atkT / P.atkDur`. Đòn chạm khi tiến độ
   `1 - atkT/atkDur` vượt `P.hitAt` (mặc định 0,45) (`combat.js:801`). Lớp vẽ (`sprite_custom.js:586-593`, `hero_tinhlinh.js:1146-1153`)
   chỉ **đọc** tiến độ đó để chọn khung, không có callback hay sự kiện "khung chạm" nào báo ngược về logic.
2. Hitbox của người chơi là **hình học tức thời**, xét đúng **một nhịp** (lúc chạm): hộp xoay (`moves.js:267`), cung tròn ¾ vòng (giáo quét,
   `moves.js:601-613`), hình tròn (búa nện đất, `moves.js:504`), dải quét (lướt / xốc tới / chiêu bay / sóng búa), đoạn tên bay (`combat.js:517`).
   Mọi khoảng cách đo **trên sàn**: chiều dọc màn hình chia `G.ZK = 0.85` (`data.js:298`).
3. Đòn cận chiến **tự ngắm** quái gần nhất **mọi hướng** (`G.AIM_CONE` = null → `inCone` luôn true, `moves.js:234`). Vì vậy "góc" của đòn
   gần như 360°: hộp đòn xoay theo con quái gần nhất trong tầm `reach + 34` (`moves.js:264`).
4. Không có: khung "hit" của người chơi làm ngắt đòn, giật lùi người chơi (knockback), phòng thủ chủ động (block/parry), nhảy/rơi/tiếp đất.
5. Lỗi lệch hình–sát thương rõ nhất: **búa nện** gây sát thương ở tiến độ 0,35 nhưng cả hai lớp vẽ đặt khung "chạm" ở 0,45. Lúc gây sát thương,
   búa còn đang giơ cao sau đầu (mục 5.1).

---

## 1. Luồng một đòn đánh: từ nút bấm tới sát thương (theo dấu hàm)

```
stage.js:620/640  (phím K/X/Shift, nút cảm ứng 'dodge'; atk/atkP tương tự)  →  inp
stage.js:700      G.updateWorld(dt, inp)
combat.js:917       (fx.frozen: hit-stop, cả thế giới đứng yên, nút "P" được giữ lại)
combat.js:918       G.updatePlayer(P, inp, dt)
combat.js:652         giảm các đồng hồ: atkT, cdT, dodgeCd, inv, hurtT, castT, specT…
combat.js:678         G.moves.input(P, inp, dt)      → moves.js:168  (bấm/giữ/thả, bộ đệm, xoá chuỗi)
combat.js:686-713     đang lướt (dashT): dải quét trúng → playerHit
combat.js:719-739     đang lộn (dodgeT): chỉ di chuyển
combat.js:758-779     else-if: Né | Đặc biệt | Chưởng | G.moves.act (moves.js:538) | startAttack (kiểu cũ)
                         moves.js:538 M.act → swordChain / spearTap / hammerTap / bowTap / release()
                         → begin() moves.js:304: đặt P.atkDur, P.atkT, P.cdT, P.hitDone=false, P.hitAt, P.comboI, mv.cur
combat.js:801         nếu atkT ≤ atkDur·(1 - hitAt) và chưa hitDone → G.moves.hit(P)  (moves.js:582)
                         → boxHit / quét / hammerSlam / shoot → G.cb.playerHit (combat.js:438) → G.damage (combat.js:247)
                         → FX('hit') → fx.js:951-957 hit-stop 45–115 ms + rung
combat.js:1127      vẽ: A.hero(c, G.heroArgs(P)) ; heroArgs.atk = 1 - atkT/atkDur (combat.js:1060)
                         → sprite_custom.js:595 SC.chonEmBe (thân ảnh AI) / hero_tinhlinh.js:1161 pick (khung xương code + vũ khí)
```

Điểm then chốt ở `combat.js:801`:

```js
// V15: đòn chạm khi đi được P.hitAt phần động tác (moves.js đặt; búa nện 0,35), mặc định 0,45 (còn 55% thời gian) như cũ.
if (P.atkT > 0 && !P.hitDone && P.atkT <= P.atkDur * (1 - (P.hitAt != null ? P.hitAt : 0.45))) { if (MV) MV.hit(P); else doHit(P); }
```

Đồng hồ đòn đặt trong `begin()` (`moves.js:304-311`):

```js
function begin(P, w, o, dur, phase) {
  const mv = P.mv;
  P.atkDur = dur; P.atkT = dur * (1 - (phase || 0)); P.cdT = P.atkT; P.hitDone = false; P.lastAtk = G.time;
  P.hitAt = o.hitAt != null ? o.hitAt : null;
  P.comboI = o.pose || 0;
  mv.name = o.name; mv.kind = o.kind; mv.step = o.step || 0; mv.cur = o; mv.lastT = G.time + P.atkT;
```

`P.cdT = P.atkT`: **hồi chiêu giữa hai đòn = đúng thời lượng đòn** (chưa trừ phần `phase`). Không có thời gian hồi riêng sau đòn, trừ Nhát lướt
(`cdT = t + 0.08`, `moves.js:360`) và Xốc tới (`cdT = t + 0.2`, `moves.js:479`).

Đường "kiểu cũ" `startAttack/doHit/meleeBox` (`combat.js:491-558`) chỉ chạy khi thiếu `moves.js`, hoặc khi `M.hit` thấy `mv.cur == null`
(`moves.js:584`). Cả bốn loại vũ khí đều có cấu hình trong `G.MOVES` nên **thực tế đây là code chết** [suy luận]. Nó vẫn phải giữ nếu
còn muốn chạy game không có moves.js.

---

## 2. Mục 5: Đòn tấn công theo từng loại

### 2.1 Bảng cấu hình gốc [code]

`G.WTYPES` (`data.js:28-39`): chỉ còn dùng `dmg` (sức đánh gốc), `stagger` (búa 0,4 s choáng cho quái thường, `combat.js:456`) và `cd`
(chỉ trong tỉ lệ gây hệ `combat.js:465` và đường đánh kiểu cũ). Các số `reach/depth/cd` của WTYPES **không** quyết định đòn thật nữa.
Đòn thật lấy từ `G.MOVES` (`moves.js:16-84`).

| Vũ khí / đòn | Nguồn | dur (s) | hitAt | mult | Hình vùng trúng | Kích thước (điểm ảnh trên sàn) | push | Ghi chú |
|---|---|---|---|---|---|---|---|---|
| Kiếm, nhát 1 "Chém ngang" | `moves.js:38` | 0,30 | 0,45 (mặc định) | 1,0 | hộp xoay | reach 32, depth 20 | – | `pose 0` |
| Kiếm, nhát 2 "Chém ngược" | `moves.js:39` | 0,30 | 0,45 | 1,05 | hộp xoay | reach 34, depth 20 | – | `pose 1` |
| Kiếm, nhát 3 "Nhát kết" | `moves.js:40` | 0,46 | 0,45 | 1,8 | hộp xoay | reach 40, depth 30 | 10 | heavy, `finish` (đặc trưng hệ) |
| Kiếm "Nhát lướt" (sau Né) | `moves.js:42` | 0,12 (t) | – (dải quét mỗi nhịp) | 1,4 | dải theo đường lướt | len 30, nửa rộng 12 + thân quái | – | win 0,35 s sau khi lộn xong |
| Giáo, đâm 1/2/3 | `moves.js:63-65` | 0,38 / 0,34 / 0,34 | 0,45 | 1,1 | hộp xoay | reach 60/60/62, depth 12 | – | `pose 0,1,2` |
| Giáo "Quét vòng" (nhịp 4) | `moves.js:66` | 0,52 | 0,45 | 1,85 | quạt ¾ vòng (khe sau lưng ±40°) | r 44 | 8 (toả ra) | heavy, `pose 3` |
| Giáo "Xốc tới" (giữ-thả) | `moves.js:69` | 0,16 (t) | – (dải quét) | 1,0 → 2,2 | dải theo đường lao | len 30 → 58, depth 12 | – | `P.inv` = 0,16 |
| Búa "Nện" (bấm) | `moves.js:74` | 0,80 | **0,35** | 1,0 | hộp xoay | reach 32, depth 26 | – | giáp nhẹ khi Né (`combat.js:755`) |
| Búa "Nện đất" nấc 1 | `moves.js:80` | recover 0,70, vào ở phase 0,36 | 0,45 | 1,0 | tròn tâm cách 22 về trước | r 30 + sóng len 60 (mult 0,4) | – | lv1 khi đà ≥ 0,5 s |
| Búa "Nện đất mạnh" nấc 2 | `moves.js:81` | như trên | 0,45 | 1,25 | tròn | r 38 + sóng len 96 (0,5), stun 0,7 | – | lv2 khi đà ≥ 1,1 s |
| Cung "Bắn" | `moves.js:54` | 0,38 đứng / 0,45 chạy | 0,45 (lúc buông tên) | 1,0 | đoạn tên vs bầu dục quanh quái | tầm 180, tốc 290, xuyên 1 (×0,35) | – | tên sinh ra lúc chạm |
| Cung "Tên mạnh" (giữ-thả) | `moves.js:55` | recover 0,5, vào ở phase 0,45 | tên bay ngay khi thả | 1,2 → 3,0 | như trên, to hơn | tầm 250·(0,7 + 0,3c), tốc 340, xuyên 1/1/2 | – | `hitDone = true` ngay (`moves.js:459`) |
| Đấm (giáo đang bay) | `moves.js:32` | 0,30 | 0,45 | 0,45 | hộp xoay | reach 18, depth 14 | – | `fist` |
| Đặc biệt kiếm "Trảm Nguyệt" | `moves.js:25`, `759-771` | specT 0,35 (chỉ là hoạt ảnh) | sinh vệt ngay khi bấm | 2,0, con sau ×0,7 | dải bay | tầm clamp(0,66·bề ngang phòng, 110, 170), nửa rộng 13, tốc 330 | – | bé lùi 9 |
| Đặc biệt giáo "Phi Thương" | `moves.js:28`, `772-780` | 0,35 | ngay khi bấm | 1,6 (về 0,9) | dải bay đi/về | tầm 110–165, nửa rộng 9 | – | ghim choáng 1,0 |
| Đặc biệt búa "Địa Chấn" | `moves.js:30`, `781-789` | 0,35 | vòng: ngay; vệt nứt: sau warn 0,12 | vòng 1,0, vệt 2,1 | tròn r 28 + dải | tầm 90–140, nửa rộng 15 | – | stun 0,3 / 0,9 |
| Đặc biệt cung "Mưa Tên" | `combat.js:571-583` | 0,35 | vùng tròn, mỗi 0,15 s | 0,34/đợt | tròn r 40 (dẹt theo ×1,6) | life 0,95 s | – | |
| Chưởng (cast) | `chuong.js:239-268` | castT 0,3 | đạn sinh ngay khi bấm | theo cây chưởng | đạn bay | – | – | xem mục 5.6 |

Tầm `reach` nhân 1,15 nếu vũ khí có dòng phụ `reach` (`moves.js:138`).

### 2.2 Hình dạng vùng trúng [code]

**Hộp xoay** (`moves.js:267-272`), dùng cho kiếm, giáo đâm, búa bấm, đấm:

```js
function inBox(o, e, ux, uy, reach, depth, back) {
  const k = ZK(), dx = e.x - o.x, dy = (e.y - o.y) / k;
  const a = dx * ux + dy * uy, b = Math.abs(dy * ux - dx * uy);
  const half = Math.abs(ux) * (depth / 2 + e.hr) / k + Math.abs(uy) * (depth / 2 + e.r);
  return a > -(back == null ? 8 + e.r * 0.5 : back + e.r) && a < reach + e.r && b <= half;
}
```

Tức là: chạy dọc hướng nhắm từ `-(8 + r/2)` sau lưng tới `reach + r` phía trước. Nửa bề rộng là `depth/2 + hr` (đánh ngang) hoặc `depth/2 + r`
(đánh dọc). Gốc hộp là **chân người chơi** (`P.x, P.y`), không phải tay hay mũi vũ khí.

**Quét vòng giáo** (`moves.js:605-608`): `d < reach + e.r && (d < 8 || cos > -0.77)`. Trúng mọi hướng trừ khe ±40° ngay sau lưng.
**Nện đất** (`moves.js:504-512`): tròn `r + e.r` quanh điểm cách chân `min(22, tới tường)` về trước.
**Dải lướt/lao** (`combat.js:695-706`): đoạn vừa đi trong nhịp, nửa rộng `12 + hr` (ngang) / `r + 8` (dọc), hai đầu nới `r + 6`.
**Tên** (`combat.js:517-524`): đoạn bay trong nhịp cắt bầu dục bán trục `(r + 5, hr + 8)`. Nhịp đầu đoạn bắt đầu từ giữa người (`px, py`).

### 2.3 Combo, giữ lấy đà, bộ đệm [code]

| Cơ chế | Biến / số | Chỗ code | Ý nghĩa |
|---|---|---|---|
| Chuỗi kiếm 3 nhịp | `mv.chain % 3`, `gap 0.45` | `moves.js:347-352`, `192` | Bấm hoặc **giữ** nút đều ra nhát tiếp theo (`moves.js:550-555`). Ngừng quá `gap` tính từ `mv.lastT` (= lúc đòn **dự kiến** hết) thì về nhát 1 |
| Chuỗi giáo 4 nhịp | `mv.chain % 4`, `gap 0.45` | `moves.js:465-471` | Bấm-thả mới ra đòn. Giữ là lấy đà Xốc tới |
| Búa | không có chuỗi | `moves.js:493-497` | Mọi nhát bấm như nhau (`pose 0`) |
| Cung | không có chuỗi | `moves.js:449-454` | |
| Lấy đà (cung/giáo/búa) | `C.tap 0.16`, `charge.time`, `charge.min`, `C.hold 0.8` | `moves.js:557-578` | Chạm nút → vào tư thế ngay (V12), đà tính sau 0,16 s. Thả lúc đà < min → đòn bấm. Đầy đà giữ thêm 0,8 s → tự thả |
| Đệm nút kiếm | `mv.pressBuf = C.buffer 0.25` khi vừa nhấn | `moves.js:175`, `182` | Trôi khi không giữ nút và không đang lộn |
| Đệm nút cung/giáo/búa | `mv.buf = 0.25` khi **thả** mà không đang lấy đà | `moves.js:177`, `181`, `575-578` | |
| Đệm nút Né | `DODGE_BUF 0.15` | `combat.js:649`, `673-674` | Không trôi khi đang lướt / bị đóng băng |
| Hủy đà | lộn, lướt, đặc biệt, chưởng, chết | `moves.js:191` | `cancel(mv)` (`moves.js:137`) |
| Đổi vũ khí giữa đòn | `P.atkT = 0`, `hitDone = true`, `cdT ≤ 0.1` | `combat.js:780-791`, `moves.js:188` | Bỏ hẳn nhát đang vung, chuỗi về 0 |

### 2.4 Lướt tới (lunge) [code + đo]

| Đòn | Quãng (sàn) | Thời gian | Bất tử | Hủy bằng Né | Đo |
|---|---|---|---|---|---|
| Nhát lướt (kiếm) | 30 | 0,12 s (8 nhịp) | 0,12 s (`moves.js:359`) | có (`P.dashNe`, `combat.js:686`) nhưng thực tế gần như không làm được (mục 5.4) | [đo] 30,0 điểm ảnh trong 8 nhịp, x 285,3 → 315,3 |
| Xốc tới (giáo) | 30 + 28·c | 0,16 s | 0,16 s (`moves.js:478`) | không (`dashNe = false`, `moves.js:337`) | [đo] giữ 20 nhịp (c = 0,35) → 39,7; giữ 45 nhịp (đầy) → 58,0 |
| Kiếm, giáo, búa thường | 0 | – | – | – | Các nhát chém **không** đẩy người chơi tới |
| Trảm Nguyệt | lùi 9 (`slideT 0.12`) | 0,12 s | không | – | `moves.js:769` |

Lúc đang đánh vẫn đi được, chậm lại: hệ số `G.CHAM_DANH.danh` = kiếm 0,85, giáo 0,8, cung 0,7, búa 0,55 (`moves.js:203-206`).
[đo] Thợ Rèn đi 72 điểm ảnh/s. Vừa đi vừa giữ nút Đánh trong 0,5 s: kiếm 61,9, giáo 52,8, cung 52,8, búa 48,0. Ba vũ khí sau đang
**lấy đà** nên dùng hệ số `giu` / `charge.slow` (`moves.js:216-222`), không phải `danh`.

### 2.5 Đòn đặc biệt và Chưởng [code + đo]

- `special(P)` (`combat.js:561-585`): trừ mana, `P.specT = 0.35`, `P.specCd = 0.8`, rồi `G.moves.cast` (`moves.js:759`). **Vật gây sát thương
  (vệt trăng, cây giáo, vệt nứt) sinh ra ngay nhịp bấm.** `specT` chỉ là đồng hồ hoạt ảnh. `G.nhipChieu` (`hero_tinhlinh.js:1156-1159`)
  ép đoạn giơ kiếm vào 12% đầu để hình khớp với vệt đã bay.
- [đo] Trảm Nguyệt trúng bia xa nhất 185 (trượt 190). Phi Thương 190 (trượt 195). Địa Chấn 160 (trượt 165). Phòng thử rộng 282 (x0 = 89, x1 = 371).
  Địa Chấn: vòng chấn trúng ở nhịp 0, vệt nứt bắt đầu trúng từ nhịp 7 (warn 0,12 s).
- Chưởng (`chuong.js:239-268`): `P.castT = 0.3`, đạn sinh ngay. [đo] Bia cách 20: trúng ở **nhịp 0** (cùng nhịp bấm).

---

## 3. Mục 6: Né, lướt, phòng thủ, nhận đòn, choáng, chết

| Thứ | Có không | Chỗ code | Số liệu [code] | Đo [đo] |
|---|---|---|---|---|
| Lộn / Né (dodge, "ne") | CÓ | `combat.js:758-770`, di chuyển `719-739` | `dodgeT 0.27`, `dodgeCd 1` (0,75 nếu điểm Thủ ≥ 2, `combat.js:112`), `P.inv ≥ 0.32`, tốc `G.DODGE.vx 195`, dọc ×0,75 (`data.js:300`) | Ngang 56,4 điểm ảnh trong 17 nhịp. Thẳng xuống 42,3 trong 18 nhịp. `inv` > 0 suốt 20 nhịp (0,32 s). Hồi 60 nhịp |
| Né hủy đòn đang vung | CÓ | `combat.js:762-763` | `atkT = 0`, `cdT ≤ 0.1` | Mục 4.4 |
| Lướt nhanh (dash) độc lập | **KHÔNG TỒN TẠI** như một nút riêng | `grep -n "dashT = " js/*.js` chỉ ra `moves.js:335` (dashGo), hai chỗ đặt 0 trong `combat.js` (686, 710), một chỗ đặt 0 khi vào phòng (`stage.js:350`) và bản sao để vẽ bóng mờ (`fx.js:445`) | Lướt chỉ có trong Nhát lướt và Xốc tới | – |
| Phòng thủ chủ động (block/parry/guard) | **KHÔNG TỒN TẠI** | `grep -rn "block\|guard\|parry" combat.js moves.js` chỉ ra `G.outfit.block` (khiên thụ động) | Khiên trang phục `outfit.js:343-351` (chặn một đòn, `inv ≥ 0.35`). Gồng `P.gongT` giảm còn 40% (`combat.js:627`), có hoạt ảnh `gong` | – |
| Nhận sát thương | CÓ | `G.hurtPlayer` `combat.js:621-647` | `P.inv = 0.55`, `P.hurtT = 0.2`, rung 0,18 | [đo] `inv` 0,55 (33 nhịp). Đòn thứ hai trong lúc `inv` = 0,25 bị bỏ (`ok: false`). Vị trí bé **không đổi** (dx = dy = 0) |
| Giật lùi người chơi (knockback) | **KHÔNG TỒN TẠI** | `grep -n "P\.x += \|P\.x -= \|knock" js/*.js`: không có dòng nào đẩy P khi trúng đòn | – | [đo] dx = dy = 0 |
| Khung "hit" ngắt đòn của người chơi (hit-stun) | **KHÔNG TỒN TẠI** | `hurtPlayer` không đụng `atkT` | Hoạt ảnh `hit` chỉ hiện khi không đánh (`sprite_custom.js:614` nằm **sau** nhánh atk) | [đo] Bé bị trúng ở nhịp 3 khi đang chém: nhát chém vẫn gây sát thương ở nhịp 9 |
| Choáng người chơi (stun) | **KHÔNG TỒN TẠI** dưới tên stun; có **đóng băng ngắn** | `P.frozenT` đặt duy nhất ở `mobs.js:168` (nổ băng 0,65 s), xử lý ở `combat.js:675` (`atkT = 0`, đứng im) | `grep -n "frozenT" js/*.js` | – |
| Choáng quái | CÓ | `e.st.stun` (`combat.js:456-457`), quái mới `mobs.js:224-227` (hủy đòn đang báo), trùm `boss.js:345`, `414` | Búa stagger 0,4 (không với trùm). `o.stun` với trùm ×0,4 | – |
| Quái "trúng đòn" | CÓ (chỉ là hình) | `mobs.js:131` `e.hitT = 0.3`, vẽ `mobs.js:849` | Chỉ thay hình khi quái đang idle/move, **không ngắt đòn** của quái | – |
| Đẩy lùi quái | CÓ, dịch chuyển tức thời | `moves.js:327-330` (Nhát kết 10), `moves.js:610` (Quét 8) | Không áp lên trùm | – |
| Giật hình khi trúng | CÓ (chỉ vẽ) | `fx.recoil` `fx.js:1233`, `fx.xf` `fx.js:1125` | Không đổi `e.x` thật | – |
| Chết người chơi | CÓ | `combat.js:644` `P.dead = true; W.over = 'dead'`, `P.deadT` (`combat.js:654`), màn thua sau 1,2 s (`stage.js:720`) | Hoạt ảnh `die`: `sprite_custom.js:603`, `hero_tinhlinh.js:1164` (8 khung × 0,075 s) | – |
| Chết quái | CÓ | `G.kill` `combat.js:374-435`. Xoá khỏi `W.ents` cuối nhịp (`combat.js:1036`) | **Hình chết là bản chụp trong fx** (`fx.js:1786-1801`): 0,42 s hoặc `dur(art,'die')`, không còn là thực thể | – |
| Chết trùm | CÓ | `combat.js:426-434` (giết hết quái, xoá vùng + đạn), `mobs.js:152` `bossDieT`, `fx.js:1793-1797` (1,25 s, khựng 120 ms) | | – |
| Nhảy / rơi / tiếp đất | **KHÔNG TỒN TẠI** (ngoài phạm vi phụ lục này) | – | – | – |

Đoạn Né (`combat.js:758-763`):

```js
} else if ((inp.dodgeP || P.dodgeBuf > 0) && P.dodgeCd <= 0) {
  P.dodgeBuf = 0;
  P.dodgeT = 0.27; P.dodgeCd = 1 * P.dodgeCdMax; P.inv = Math.max(P.inv, 0.32); // Q13: giữ bất tử 0,32 giây
  // V15 (Q5): Né huỷ nhát đang vung thì không bắt chờ hết thời gian nhát đó (búa trước phải chờ thêm ~0,43 giây sau cú lộn)
  if (P.atkT > 0) P.cdT = Math.min(P.cdT, 0.1);
  P.atkT = 0; P.chHold = false; P.chT = 0; // lộn thì bỏ phần chưởng đang tích
```

"Giáp nhẹ" của búa (`combat.js:755-757`): đã đi quá nửa quãng tới lúc chạm thì nút Né được giữ trong bộ đệm cho tới khi búa chạm.
Hằng số thời lượng lộn 0,27 bị **chép tay** ở `combat.js:1060` (`dodge: 1 - P.dodgeT / 0.27`). Hàng ảnh `ne` có `giay 0.4` nhưng
không được dùng, vì `mot('ne', o.dodge)` chọn khung theo tiến độ (`sprite_custom.js:604`).

---

## 4. Số đo Playwright (số thật)

Thiết lập: Thợ Rèn cấp 10, điểm kỹ năng 0, tắt chí mạng, bia `AU.dummy` (vai `rusher`, r = 8, hr = 6, máu 1e7) giữ cố định bằng `AU.pin`.
Bé đứng giữa phòng (230, 154), riêng cung đứng sát tường trái (x = 95). Khoảng cách là **tâm–tâm theo điểm ảnh màn hình**.
Nhịp 0 = nhịp nút được bấm.

### 4.1 Nhịp combo đầy đủ: lúc bắt đầu, lúc gây sát thương (`G.sim`, không khựng hình)

Kiếm: giữ nút. Giáo, búa, cung: nhấn rồi thả ngay khi rảnh. Bia cách 20 (cung 60).

| Vũ khí | Đòn | Nhịp bắt đầu | Nhịp gây ST | Trễ (nhịp / s) | Tiến độ đòn lúc ST | Chu kỳ tới đòn sau (nhịp) |
|---|---|---|---|---|---|---|
| Kiếm | Chém ngang | 0 | 9 | 9 / 0,150 | **0,500** | 19 |
| Kiếm | Chém ngược | 19 | 28 | 9 / 0,150 | 0,500 | 19 |
| Kiếm | Nhát kết | 38 | 51 | 13 / 0,217 | 0,471 | 28 |
| Kiếm | (lặp) Chém ngang | 66 | 75 | 9 | 0,500 | – |
| Giáo | Đâm 1 | 1 (nhịp thả) | 12 | 11 / 0,183 | 0,482 | 25 |
| Giáo | Đâm 2 | 26 | 36 | 10 / 0,167 | 0,490 | 23 |
| Giáo | Đâm 3 | 49 | 59 | 10 | 0,490 | 23 |
| Giáo | Quét vòng | 72 | 87 | 15 / 0,250 | 0,481 | 34 |
| Búa | Nện | 1 | 18 | 17 / 0,283 | **0,354** | 50 |
| Cung | Bắn (bia 60) | 1 | 19 | 18 (tên buông ở ~0,48, bay 60 điểm ảnh) | 0,789 | 25 |

Nhận xét [đo]: tiến độ thật lúc chạm lệch +0,03…+0,05 so với `hitAt` 0,45, vì đồng hồ trừ `dt` **trước** khi so (`combat.js:652` rồi `801`).
Kiếm 0,30 s = 18 nhịp → chạm ở nhịp 9 = 0,50.

**Có khựng hình** (`AU.run(…, fx = true)`, hit-stop của `fx.js:951-957`): chu kỳ kiếm 19 → **22** nhịp, Nhát kết 28 → **34**, giáo đâm
25 → 28, quét 34 → 40, búa 50 → 55. Cung không đổi (tên trúng không khựng, trừ tên to). Số nhịp từ lúc bắt đầu tới lúc gây ST không đổi.

### 4.2 Tầm thực và hình vùng trúng (bia đơn, quét từng điểm ảnh)

"Trước": bia thẳng ngang phía trước. "Xuống": thẳng dưới (màn hình). "Chéo": 45° trên màn hình.
"Ngang ±": có bia neo ở (10, 0) để khoá hướng nhắm, bia dò lệch dọc. "Sau lưng": bia neo phía trước, bia dò phía sau.

| Đòn | Trước (xa nhất trúng / trượt) | Xuống | Chéo 45° | Ngang ± (ở dx 0 / 16 / 30) | Sau lưng | Nhịp ST |
|---|---|---|---|---|---|---|
| Kiếm Chém ngang | 39 / 40 | 33 | 36 | 16 / 16 / 16 | 11 | 9 |
| Kiếm Chém ngược | 41 / 42 | 35 | 38 | 16 / 16 / 16 | 11 | 9 |
| Kiếm Nhát kết | 47 / 48 | 40 | 43 | 21 / 21 / 21 | 11 | 13 |
| Giáo Đâm 1, 2 | 67 / 68 | 57 | 62 | 12 / 12 / 12 | 11 | 11–12 |
| Giáo Đâm 3 | 69 / 70 | 59 | 64 | 12 | 11 | 11 |
| Giáo Quét vòng | 51 / 52 | 44 | 47 | 44 / 42 / 36 | 9 | 16 |
| Búa Nện | 39 / 40 | 33 | 36 | 19 / 19 / 19 | 11 | 18 |
| Giáo Xốc tới (giữ 20 nhịp, c ≈ 0,35) | 53 / 54 | 45 | 49 | 18 | 14 | 30 (lướt 39,7) |
| Giáo Xốc tới (giữ 45, đầy) | 72 / 73 | 61 | 65 | 18 | 14 | 55 (lướt 58,0) |
| Búa Nện đất nấc 1 (giữ 42) | 93 / 94 (sóng) | 69 | 75 | 26 / 31 / 31 | 15 | 46 (vòng), 63 (sóng tới 93) |
| Búa Nện đất nấc 2 (giữ 78) | 129 / 130 (sóng) | 69 | 75 | 34 / 38 / 38 | 23 | 110 (sóng tới 129) |
| Cung Bắn (bấm) | 205 / 210 | ≥ 90 (hết bia thử) | – | – | – | 12 (sát) → 49 (205) |
| Cung Tên mạnh, giữ 28 nhịp (c ≈ 0,41) | 230 / 235 | – | – | – | – | 28 → 64 |
| Cung Tên mạnh đầy (giữ 58) | ≥ 275 (hết phòng) | – | – | – | – | 58 → 102 |

Đối chiếu công thức: kiếm nhát 1 `reach 32 + r 8 = 40` (điều kiện `<` nên 39 trúng). Xuống 33 điểm ảnh màn hình = 38,8 trên sàn
(×0,85, đúng `G.ZK`). Ngang 16 = `(20/2 + hr 6)`. Sau lưng 11 ≈ `8 + r/2 = 12`. Búa nấc 1/2 "xuống" chỉ 69: sóng bị cắt bởi
`wallLen` (bé ở y 154, tường dưới y 248) [suy luận từ `moves.js:515`].

**Góc**: vì tự ngắm mọi hướng, một bia đơn ở **bất kỳ góc nào** trong tầm đều bị đánh (bảng trên: trước / xuống / chéo đều trúng).
Bia ở sau lưng chỉ bị trượt khi có con quái khác gần hơn kéo hướng nhắm đi.

### 4.3 Né, nhận đòn, Nhát lướt

| Đo | Kết quả |
|---|---|
| Lộn ngang (đẩy cần phải 1 nhịp) | 17 nhịp di chuyển, 56,4 điểm ảnh. `P.inv` 0,32 → 0 sau 20 nhịp. `dodgeCd` về 0 ở nhịp 60 |
| Lộn thẳng xuống | 18 nhịp, 42,3 điểm ảnh |
| Nhận đòn (vùng tròn nổ ở nhịp 2) | `inv` 0,55, `hurtT` 0,2. Vùng thứ hai nổ khi `inv` = 0,25: bị bỏ. Vùng thứ ba (inv hết): trúng. Vị trí không đổi |
| Nhận đòn giữa nhát chém (nhịp 3) | Nhát chém vẫn gây ST ở nhịp 9, máu 1000 → 990 |
| Nhát lướt: bấm Đánh ở nhịp k sau khi bấm Né (lộn hết ở nhịp 17) | k = 0…18: lướt bắt đầu ở nhịp 18 (bấm sớm được nhớ suốt cú lộn). k = 20…38: lướt ngay nhịp đó. k ≥ 40: nhát chém thường. **Cửa sổ = cả cú lộn + 21 nhịp (0,35 s)** |
| Nhát lướt: vị trí | 285,3 → 315,3 (30,0) trong nhịp 18–25. `inv` = `dashT` = 0,12 |

### 4.4 Né hủy đòn: bấm Né ở nhịp k sau khi ra đòn (bia cách 20)

| Vũ khí | Nhịp gây ST nếu không né | k hủy được sát thương | k không hủy | Ghi chú |
|---|---|---|---|---|
| Kiếm (nhát 1) | 9 | 1…9 | ≥ 10 | Né ở **đúng nhịp chạm** vẫn hủy (nhánh Né chạy trước `combat.js:801`) |
| Giáo (đâm 1) | 12 | 1…12 | ≥ 13 | |
| Búa (bấm) | 18 | 1…9 | 10…21 | k ≥ 10: giáp nhẹ, cú lộn **bị hoãn tới nhịp 19** (trễ tới 9 nhịp = 0,15 s) |
| Cung (bấm) | 12 (buông tên) | 1…12 | ≥ 13 | |
| Búa Nện đất (giữ 42, thả ở 42) | 46 | 41…46 | ≥ 47 | Nện đất **không** có giáp nhẹ (`hitAt` null → `giapBua` false, `combat.js:755`) |
| Búa giữ, Né ở k = 36…40 (trước khi thả) | – | đà bị hủy | – | Nút thả ở 42 rơi vào bộ đệm → **sau cú lộn ra một nhát Nện thường** (ST ở 71…75) |

Sau mọi lần hủy: `atkT = 0`, tên đòn rỗng, cdT ≤ 0,1. Hình trở về idle/move ngay khi lộn xong [đo: `atkAfter.name = ''`].

### 4.5 Bộ đệm nút (bấm 1 nhịp ở nhịp k khi đòn đầu bắt đầu ở 0/1)

| Vũ khí | Thời lượng đòn đầu | Bấm ở k bị **mất** | Bấm ở k được nhớ → đòn sau ở nhịp |
|---|---|---|---|
| Kiếm | 19 nhịp | k = 3 (k = 1 dính liền nhịp 0 nên không phải lần nhấn mới) | k = 5…19 → 19 |
| Giáo | 23–24 nhịp | k = 1…7 | k = 9…23 → 24 |
| Cung | 24 nhịp | k = 1…7 | k = 9…23 → 24 |
| Búa | 49 nhịp | **k = 1…31 (2/3 đầu nhát nện)** | k = 33…47 → 49 |

Bộ đệm chỉ 0,25 s (15 nhịp) và trôi ngay từ lúc nhấn/thả, nên mọi lần nhấn sớm hơn 15 nhịp trước khi đòn hết đều mất.

### 4.6 Cửa sổ nối combo (bấm lại ở nhịp k sau một nhát)

| Vũ khí | Đòn đầu hết ở | Vẫn nối nhịp 2 nếu bấm ở k ≤ | Về nhịp 1 từ k ≥ | Với khựng hình (fx) |
|---|---|---|---|---|
| Kiếm | 18 | 45 | 46 | Đòn hết ở 21 (khựng 3 nhịp) nhưng **vẫn về đầu ở 46**: cửa sổ sau đòn co từ 27 còn 24 nhịp |
| Giáo | 23 | 49 | 50 | Hết ở 26, vẫn về đầu ở 50 |

Lý do [code]: `mv.lastT = G.time + P.atkT` đặt lúc bắt đầu (`moves.js:309`) và so với `G.time` (`moves.js:192`). Trong lúc khựng hình,
`G.time` vẫn chạy (`engine.js:563`) nhưng `atkT` đứng yên (`combat.js:917`).

### 4.7 Đánh trong lúc đang có hoạt ảnh Chưởng / Đặc biệt

| Thử | Kết quả |
|---|---|
| Kiếm: bấm Chưởng ở nhịp 0, Đánh ở nhịp 3 | Chém bắt đầu ở nhịp 3 khi `castT` = 0,25. Gây ST ở nhịp 12 khi `castT` = 0,10 vẫn > 0 |
| Kiếm: Đặc biệt ở nhịp 0, Đánh ở nhịp 3 | Chém bắt đầu khi `specT` = 0,30. Gây ST ở nhịp 12 khi `specT` = 0,15 |
| Búa: Chưởng hoặc Đặc biệt ở 0, nhấn Đánh ở 3 | Vào "Lấy đà" ở nhịp 3 rồi bị `moves.js:191` hủy ở nhịp 4. **Lần nhấn bị mất hẳn**, không có nhát nào |

---

## 5. Mục 10: Hurtbox, hitbox, vùng báo trước, liên hệ animation ↔ sát thương

### 5.1 Sát thương gắn với thời gian hay khung ảnh? **Chỉ thời gian.**

- Logic: `combat.js:801` (tiến độ ≥ `hitAt`). Không có chỗ nào trong `combat.js` hay `moves.js` đọc `dong_tac`, số khung, `giay`, hay chỉ số khung ảnh.
  Lệnh `grep -n "khung\|dong_tac\|frame" js/combat.js js/moves.js` chỉ ra chú thích về "khung" theo nghĩa nhịp logic (vd. `combat.js:689`, `moves.js:569`),
  không có dòng nào đọc khung ảnh để tính sát thương.
- Lớp vẽ ảnh AI (`sprite_custom.js:580-593`) chọn khung **theo tiến độ đòn** và mốc chép tay, cố canh "khung chạm" trùng 0,45:

```js
const MOC_DON = { atk_bow: [0, 0.15, 0.3, 0.45, 0.62, 0.8], atk_spear: [0, 0.22, 0.45, 0.55, 0.7, 0.85], atk_hammer: [0, 0.2, 0.38, 0.45, 0.6, 0.8], cast: [0, 0.12, 0.25, 0.4, 0.6, 0.8] };
function khungDon(a, ten, u, combo) {
  let i6 = 0;
  if (ten === 'atk_sword') i6 = 2 * (((combo | 0) % 3 + 3) % 3) + (u >= 0.4 ? 1 : 0);
```

- Lớp khung xương code (`hero_tinhlinh.js:1140-1153`, hàm `nhip`) đổi thời gian thật sang tư thế, giả định "đòn chạm ở a = 0,45":
  `DA = { sword: [0.22, 0.22, 0.2], hammer: [0.28, 0.28, 0.28], spear: [0.25, …] }`. Bảng tư thế `ATK` (`hero_tinhlinh.js:988-1008`)
  đặt vũ khí ở góc chém tới tại mốc 0,45.
- Trường `giay` của hàng `atk_*` trong `*.sprite.json` (atk_sword/spear/bow 0,45 s, atk_hammer 0,55 s, 12 tệp mỗi loại) **không ảnh hưởng**
  tới thời lượng đòn. Thời lượng do `P.atkDur` quyết định.

**Khung ảnh lúc gây sát thương** [tính từ tiến độ đo được + công thức `khungDon` / `nhip`]:

| Đòn | Tiến độ lúc ST [đo] | Khung ảnh AI (0–5) | Ý nghĩa khung | Tư thế khung xương code (`nhip`) | Khung code (`ATKN`) |
|---|---|---|---|---|---|
| Kiếm nhát 1 | 0,500 | 1 | chém (bật từ u = 0,4) | 0,478 | 4/10 |
| Kiếm nhát 2 | 0,500 | 3 | chém | 0,478 | 4/10 |
| Kiếm nhát 3 | 0,471 | 5 | bổ xuống | 0,466 | 4/10 |
| Giáo đâm | 0,48–0,49 | 2 | đâm (0,45 → 0,55) | 0,47 | 4/10 |
| Cung bắn | ≈ 0,48 | 3 | buông (0,45 → 0,62) | – (cung tuyến tính) | 5/12 |
| **Búa nện** | **0,354** | **1 (lấy đà)** | khung chạm (3) chỉ tới ở u = 0,45 | **0,28 = đỉnh giơ búa** (ang −135°) | 3/14 |

Búa: sát thương, số sát thương, tiếng trúng và **khựng hình 70 ms** (`fx.js:917` `blunt`, `954`) đều xảy ra khi hình còn giơ búa sau đầu.
Khung chạm của ảnh AI tới muộn 0,08 s, tư thế chạm của khung xương tới muộn ~0,06–0,08 s (u 0,43–0,45) [suy luận từ công thức, đã tính số].
Nguyên nhân: V15 đổi `hitAt` của búa sang 0,35 (`moves.js:72-74`) nhưng không cập nhật `MOC_DON.atk_hammer` và `DA.hammer`.

### 5.2 Hurtbox [code]

| Đối tượng | Bán kính | Dùng ở đâu |
|---|---|---|
| Người chơi | `r: 7, hr: 6` (`combat.js:100`) | **Gần như không dùng.** Vùng của quái kiểm tra **một điểm** `(P.x, P.y)`: `G.inZone(z, P)` (`combat.js:983`, `1007`), `G.inShape(z, e, pad = 0)` (`mobs.js:29-47`). Đạn quái: hộp `|dx| < 7, |dy| < 8` (`combat.js:962`). Đòn chém kiểu cũ: `dx > -6 && dx < reach && |dy| < depth` (`combat.js:811-815`). Vồ (nimble): `|dx| < 12, |dy| < 11` (`combat.js:848`) |
| Quái kiểu cũ | `r` theo vai (`data.js:203-213`: 7–12), `hr` 6 (tinh anh 9) (`combat.js:205`) | Hộp/tròn của người chơi cộng `e.r` (dọc hướng đánh) và `e.hr` (ngang) |
| Quái mới (ảnh) | `r = clamp(round(w·0.24), 6, 12)` (tinh anh `w·0.2`, tới 16), `hr = clamp(round(h·0.18), 5, 8)` (tinh anh tới 11) (`mobs.js:100-101`) | như trên. `e.h` chỉ để vẽ |
| Trùm | `BODY` `boss.js:48`: Mộc Tinh r 30/hr 14, Ngư Tinh 36/16, Hồ Tinh 32/14, trùm nhỏ 22–26/12 | như trên |

Lưu ý hệ trục: vùng của người chơi và vùng tròn đều chia `G.ZK` (đo trên sàn). Vùng `line` và `cone` của quái mới dùng **toạ độ thật**,
không dẹt (`mobs.js:27-28`: "Toạ độ thật (không bẹp theo chiều dọc) cho khớp với hình báo trước").

### 5.3 Vùng báo trước của quái và trùm (`bao_truoc.js`)

- Vùng là đối tượng luật chơi `{ shape, t, t0, dmg, … }` do `addZone` tạo (`mobs.js:74-78`), `G.zoneCircle/zoneRect` (`combat.js:230-239`).
  Sát thương nổ đúng lúc `z.t ≤ 0` (`combat.js:980-988`).
- `bao_truoc.js` **chỉ vẽ** từ chính hình đó: `geo(z)` (`bao_truoc.js:45-53`). Phần tô đầy theo `u = 1 - z.t / t0` (`bao_truoc.js:73-75`),
  nên vùng tô đầy đúng lúc nổ. Vùng `z.quiet` (đòn thường của quái) không vẽ (`bao_truoc.js:58`).
- Hoạt ảnh `tele/atk` của quái (`monster_art.js`, vd. dòng 1362, 1476) và vùng báo là hai đồng hồ riêng do `mobs.js` đặt cùng lúc. Quái
  bị choáng thì đòn và vùng bị hủy (`mobs.js:225` `cancelZones`).

### 5.4 Bảng tổng kết: animation ↔ combat

| Trạng thái người chơi | Đồng hồ logic | Lớp vẽ đọc | Ưu tiên chọn hình (`sprite_custom.js:603-616`) |
|---|---|---|---|
| chết | `P.dead`, `P.deadT` | `die` theo `deadT / giay` | 1 |
| lộn | `P.dodgeT / 0.27` | `ne` | 2 |
| lướt / xốc tới | `P.dashT` | `move` ×2 tốc độ | 3 |
| đặc biệt | `P.specT / 0.35` | `cast` / `atk` | 4 |
| chưởng | `P.castT / 0.4` (**castT đặt 0,3**) | `cast` / `atk` | 5 |
| giữ lấy đà | `P.mv.holding`, `mv.charge` | `atk_*` khung giữ (`giuDon`) / `tele` | 6 |
| đánh | `1 - atkT/atkDur`, `P.comboI` | `atk_<vũ khí>` (`khungDon`). Đang chạy với `G.CHAY_DANH = 'than'` (mặc định): **hàng `move`**, chỉ vũ khí code vung | 7 |
| bị trúng | `P.hurtT / 0.2` | `hit` | 8 (bị đè nếu đang đánh) |
| chạy / đứng | `P.moving`, `P.chayT` | `move` / `idle` | 9–10 |

---

## 6. Lỗi tiềm ẩn (có bằng chứng)

| # | Lỗi | Bằng chứng | Loại |
|---|---|---|---|
| L1 | **Búa: sát thương trước hình chạm.** ST ở tiến độ 0,354, ảnh AI còn khung 1 (lấy đà), khung xương ở tư thế 0,28 (búa giơ sau đầu). Khựng hình 70 ms giữ đúng tư thế đó | `moves.js:74` `hitAt: 0.35`. `sprite_custom.js:585` `atk_hammer: […, 0.38, 0.45, …]`. `hero_tinhlinh.js:1144` `DA.hammer 0.28`. Đo: prog 0,354 | đã đo (tiến độ) + suy luận (khung tính từ công thức) |
| L2 | **Mốc chạm thật lệch +0,03…0,05 so với 0,45** vì trừ `dt` trước khi so. Ảnh kiếm bật khung chém ở 0,40, ST ở 0,50 (trễ 2 nhịp ≈ 33 ms) | `combat.js:652`, `801`. Đo: prog 0,500 / 0,482 / 0,490 | đã đo |
| L3 | **Chưởng: `castT = 0.3` nhưng mọi bộ chọn hình chia cho 0,4**: hoạt ảnh bắt đầu ở u = 0,25 (mất ¼ đầu). Đạn và ST xảy ra ngay nhịp bấm (trước cả hình) | `chuong.js:244`. `sprite_custom.js:607`, `hero_tinhlinh.js:1174`, `hero_art.js:1104` `1 - p.castT / 0.4`. Đo: ST ở nhịp 0 | đã thấy (code) + đã đo (ST) |
| L4 | **Đánh trong lúc `specT/castT` > 0: ST thật nhưng hình vẫn là chiêu/chưởng.** Bộ chọn ưu tiên spec/cast trước atk | `sprite_custom.js:606-609`. Đo 4.7: nhát chém gây ST ở nhịp 12 khi `castT` 0,10 / `specT` 0,15 | đã đo (logic) + suy luận (hình) |
| L5 | **Cung/giáo/búa: nhấn Đánh trong 0,35 s sau Đặc biệt hoặc 0,3 s sau Chưởng bị mất hẳn** (vào lấy đà rồi bị hủy, không vào bộ đệm). Kiếm thì không bị | `moves.js:191`, `177` (`buf` chỉ đặt khi `!holding`). Đo 4.7 (búa) | đã đo |
| L6 | **Bộ đệm quá ngắn với búa:** nhấn trong 31 nhịp đầu (≈ 2/3 nhát nện 0,8 s) là mất | `moves.js:19` `buffer: 0.25`. Đo 4.5 | đã đo |
| L7 | **Thả nút lấy đà đúng nhịp/1 nhịp sau khi bấm Né: đòn bị mất** (không vào bộ đệm). Né sớm hơn thì nút thả vào bộ đệm và **ra nhát Nện thường sau cú lộn** (người chơi có thể không muốn) | `moves.js:174-177` chạy trước `moves.js:191`. Đo 4.4: k = 41, 42 → không ST. k = 36…40 → ST ở 71…75 | đã đo |
| L8 | **Nhát lướt "hủy được bằng Né" (V33) gần như không xảy ra**: lướt chỉ có trong ≤ 0,63 s sau cú Né mà hồi Né 1 s | `moves.js:358`, `combat.js:686` (`P.dodgeCd <= 0`). Đo: hồi 1 s → 0/12 lần. Hồi 0,75 s → chỉ khi lướt bắt đầu từ nhịp ≥ 29 | đã đo |
| L9 | **Khựng hình làm co cửa sổ nối combo** (27 → 24 nhịp với kiếm) vì `mv.lastT` tính theo `G.time` (vẫn chạy trong lúc khựng) | `moves.js:309`, `192`. `engine.js:563`. `combat.js:917`. Đo 4.6 | đã đo |
| L10 | **Chạy mà đánh (`G.CHAY_DANH = 'than'`, mặc định): thân AI giữ hàng `move`**, không có khung chém nào của thân. Chỉ vũ khí (vẽ code) vung. Trong lúc đó ST vẫn theo đồng hồ đòn | `sprite_custom.js:31-38`, `610-611` | đã thấy (code) |
| L11 | **Giáo "Quét vòng" trên thân ảnh AI dùng mốc của đòn đâm** (`atk_spear` + `MOC_DON`, không xét `mv.kind === 'quet'`). Khung xương code thì có nhánh `sweep` riêng | `sprite_custom.js:612` so với `hero_tinhlinh.js:1181` | suy luận (chưa chụp hình) |
| L12 | **Bị trúng đòn không ngắt đòn và không hiện hình `hit` khi đang đánh**. Chỉ có nhuộm trắng (`emBeTint`) và nhấp nháy `inv` | `sprite_custom.js:614` nằm sau nhánh atk (609). Đo 4.3 | đã đo (logic) |
| L13 | **Hằng số chép tay** dễ lệch khi đổi thời lượng: lộn 0,27 (`combat.js:760` và `1060`), đặc biệt 0,35 (`combat.js:564`, `sprite_custom.js:606`, `hero_tinhlinh.js:1173`), hurt 0,2 (`combat.js:632`, `sprite_custom.js:614`), chưởng 0,3/0,4 (L3) | các dòng nêu | đã thấy (code) |
| L14 | **Gốc hitbox là chân, không phải vũ khí.** Hộp đòn không theo tay hay mũi vũ khí, và sau lưng vẫn có 8 + r/2 điểm ảnh trúng. Vẽ lại tay/vũ khí sẽ không đổi vùng trúng | `moves.js:271`. Đo "sau lưng" 11 | đã đo |
| L15 | **Đòn huỷ về idle: không lỗi.** Sau Né `atkT = 0`, `mv.name` về rỗng khi rảnh (`moves.js:195`) | Đo 4.4 `atkAfter.name = ''` | đã đo |
| L16 | Nút Đánh **giữ** (`atk`) không được chốt trong lúc khựng hình, chỉ các nút "P" được chốt (`fx.js:472`, `484`). Bot chỉ bấm `atk` 1 nhịp trong lúc khựng thì mất (đo: giáo, k = 15, có fx). Người chơi thật có `atkP` nên **có thể** không bị | `fx.js:472-485` | đã đo (với bot), chưa chắc với người chơi |

---

## 7. Cần giữ nguyên khi làm lại animation (để không đổi gameplay)

1. Đồng hồ `P.atkT / atkDur / cdT / hitDone / hitAt` và điểm chạm `combat.js:801`. Hoạt ảnh mới phải **đọc** tiến độ đòn, không được tự quyết định lúc chạm.
   Nếu muốn khung ảnh "chạm" quyết định sát thương thì phải đổi luật, và phải cân lại mọi số ở mục 4.
2. Tên/thứ tự đòn và `P.comboI`/`mv.kind`/`mv.step` (lớp vẽ dùng để chọn hàng). `pose` của giáo quét = 3, tên mạnh = 2, nện đất = 2.
3. `G.MOVES` (`moves.js:16-84`) và các hằng: Né 0,27 s / bất tử 0,32 s / hồi 1 s, nhận đòn `inv` 0,55 / `hurtT` 0,2, `G.ZK` 0,85, `G.DODGE`.
4. Tự ngắm mọi hướng (`aimM`, `P.aimX/aimY`, `P.aimRel` cho lớp vẽ xoay vũ khí), và `P.face` chỉ lật trái/phải.
5. Bộ đệm nút và giáp nhẹ của búa (đã được cân bằng có chủ ý, `combat.js:752-757`).
6. Hit-stop của `fx.js` có làm thay đổi nhịp chơi thật (mục 4.1). Bỏ hoặc đổi độ dài khựng là đổi tốc độ đánh.

---

## 8. Điều chưa chắc

- Phòng thử của `AU.room` rộng 282 (giống phòng trùm theo chú thích `moves.js:21`). Tầm Đặc biệt và sóng búa phụ thuộc bề ngang phòng
  (`spanOf`, `waveFrac`), nên phòng 190 sẽ cho số nhỏ hơn.
- Không chụp ảnh nên L1, L4, L11 về **hình** là tính từ công thức. Lớp `hero_art.js` (thân vẽ code cũ) có bảng tư thế riêng
  (`hero_art.js:908-965`, mốc 0,45), chưa đo khung lúc chạm của nó.
- Không đo kỹ quái/trùm: hitbox và thời điểm đòn của từng loại quái nằm trong `mobs.js` / `boss.js` (ngoài trọng tâm phụ lục này).
- Chưa đo khi có vũ khí mang hệ (đặc trưng hệ `finish`, `arrowHit`, `onKill`), có dòng phụ `reach` (×1,15), hay ở nhân vật khác (tốc độ đi khác).
