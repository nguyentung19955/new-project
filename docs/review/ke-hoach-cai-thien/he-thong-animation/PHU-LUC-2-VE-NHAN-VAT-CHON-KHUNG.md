# Phụ lục 2 — Đường VẼ người chơi (em bé) và cách CHỌN KHUNG

> Phạm vi: toàn bộ đường vẽ thân em bé từ `combat.js` (`G.heroArgs`) → `art.js` → `hero_art.js` → `hero_tinhlinh.js` → `sprite_custom.js` (+ `outfit.js` chọn thân bộ).
> Ngoài phạm vi (chỉ nêu điểm nối): vẽ / xoay / ghép vũ khí (`vkGhep`, `kiemSau`, `kiemKhop`, `kiemMuot`, `lechCo`, `drawWeapon`).
> Mã nguồn: nhánh `khoi-tao-du-an`, commit `229e263`. Mọi "tệp:dòng" theo commit đó. Số đo: Playwright + Chromium, `game/index.html`, viewport 844×390, nạp 28 tệp `em-be-*.sprite.json` bằng `G.spriteCustom.add` (bản nguồn `index.html` không nhúng sẵn ảnh AI; bản `dist` nhúng qua `G.customSpriteData`, `sprite_custom.js:2592`).
> Ký hiệu: **[ĐO]** = đã đo/đã thấy khi chạy; **[CODE]** = đọc trực tiếp trong code; **[SUY]** = suy luận từ code, chưa đo.

## 0. Tóm tắt nhanh

- 4 em bé = 4 `key`: `smith` (Cu Tí), `hunter` (Cu Tèo), `healer` (Cái Bống), `wrestler` (Cu Lì) — `hero_tinhlinh.js:591-596`, regex `sprite_custom.js:135`, `:521`.
- Thân em bé trong trận **luôn là ảnh AI (sprite sheet)** khi tệp `em-be-<key>` đã nạp; nhưng **khung xương vẽ bằng code (`pick`→`pose`→`kidSprite`) vẫn được dựng mỗi khung** — chỉ để lấy vị trí vũ khí/tay, rồi bị "bút giả" thay bằng ảnh AI ở bước `drawImage` (`sprite_custom.js:1246-1275`).
- Có **hai bộ chọn khung chạy song song, khác nhịp**: `SC.chonEmBe` (khung ảnh AI, `sprite_custom.js:595`) và `pick` (khung xương code, `hero_tinhlinh.js:1161`). Ví dụ đứng: ảnh AI 6 khung/1 s, xương code 8 khung × 6,5 fps; chạy: ảnh AI theo `P.chayT`, xương code theo `P.t` ×13 fps **[ĐO, §5]**.
- Trường JSON `giay` **chỉ có hiệu lực cho `idle`, `move`, `die`**. Mọi động tác một-lần khác (atk, atk_*, cast, hit, ne, tele) chạy theo **đồng hồ gameplay** (`P.atkDur`, `hurtT/0,2`, `dodgeT/0,27`…). Trường `lap` **không được đọc** cho em bé (lặp hay không do `chonEmBe` quyết theo trạng thái).
- Thân bộ Cái Bống (3 tệp, `"cu": true`) **bị tắt** → Cái Bống mặc áo bộ vẫn vẽ thân gốc **[ĐO]**. Cu Tèo bộ Rừng Già **không có tệp đòn** → mọi vũ khí dùng chung hàng `atk` **[ĐO]**.
- Lỗi đo được: búa chạm (u=0,35) khi thân còn ở khung lấy đà 1, khung "nện" 3 tới muộn ~5 tick (~83 ms) **[ĐO]**; 1 tick "idle" chen giữa lộn và chạy **[ĐO]**; trường `khung` (bỏ khung trùng) của `em-be-wrestler-bien` không bao giờ được phát ở chế độ mặc định **[ĐO]**.

---

## 1. Cây gọi hàm vẽ (call tree)

### 1.1 Chuỗi ghi đè `G.art.hero` (thứ tự nạp `index.html:74-89`)

| Lớp | Nơi gán | Giữ bản cũ ở | Vai trò hiện tại |
|---|---|---|---|
| 1. `art.js` | `art.js:325` `A.hero = function (c, o)` | — | Hình code đời đầu. Chỉ là dự phòng của lớp 2. |
| 2. `hero_art.js` | `hero_art.js:1159` | `const old = A.hero` (`hero_art.js:10`) | Khung xương pixel đời 2 (`pick` riêng `:1098`). Chỉ chạy khi lớp 3 lỗi (`G.art.heroOld`). |
| 3. `hero_tinhlinh.js` | `hero_tinhlinh.js:1896-1899` | `G.art.heroOld` | Em bé "Tinh Linh" vẽ bằng code + vũ khí + hiệu ứng trang phục. |
| 4. `sprite_custom.js` | `noiEmBe()` `sprite_custom.js:1208-1277` (gọi từ `SC.add` `:151` khi có tệp em bé; `SC.noi = true` ở `:2235`) | `const hero0 = A.hero` (`:1212`); bản code thuần `G.art.heroCode` (`:2234`) | Bọc lớp 3: thay **chỗ vẽ thân** bằng khung ảnh AI. |

```js
// hero_tinhlinh.js:1896-1899
if (G.art && G.art.hero) {
  if (!G.art.heroOld) G.art.heroOld = G.art.hero;
  G.art.hero = hero;
```

### 1.2 Cây gọi trong một khung hình trận đấu

```
engine.js:562 G.tick (STEP = 1/60, :560)  ── G.time += STEP
  └ scene.update → combat.js:650 G.updatePlayer(P, inp, dt)    (cập nhật đồng hồ hoạt ảnh, xem §3)
scene.draw → combat.js:1069 G.drawWorld
  └ combat.js:1127  A.hero(c, G.heroArgs(P))                    (xếp theo y với quái/đồ vật)
       combat.js:1055 G.heroArgs(P) → o { p, x, y, face, key, move, t:P.t, tc:P.chayT, atk, dodge, flash, alpha, weapon, outfit, gong }
     └ sprite_custom.js:1213 A.hero (lớp 4, noiEmBe)
         ├ :1214 SC.cuaEmBe(o.key, o)          → chọn TỆP thân (gốc / bộ)            [§2.6]
         ├ :1218 G.tinhLinh.frame(o, netCua)   → hero_tinhlinh.js:1243 frame
         │      ├ :1247 pick(o, wt)            → hoạt ảnh + khung XƯƠNG CODE        [§3.3]
         │      ├ :1253 finishPose(pose(...))  → hero_tinhlinh.js:1031 pose
         │      └ :1254 kidSprite(...)         → canvas thân code (nhớ đệm KCACHE :1196)
         ├ :1220 SC.chonEmBe(sp, o)            → (ten, i) khung ẢNH AI              [§2.3]
         ├ :1224 SC.khopEmBe + G.tinhLinh.lopDo → lớp đồ khoác sau/trước thân AI
         ├ :1230-1232 áo trên thân AI (SC.aoAI, SC.aoTrenThan / SC.diemNguc)
         ├ :1242-1244 o.veTayAI / o.veNam (G.KIEM_KHOP, G.KIEM_SAU) → điểm nối vũ khí
         └ :1274-1275 hero0.call(A, bútGiả, o) → hero_tinhlinh.js:1783 hero (lớp 3)
               ├ :1785 frame(o, lastN) (lấy lại từ nhớ đệm)
               ├ :1800-1804 bóng đổ;  :1806 aura
               ├ :1807 SC.nhunBuoc(o)  → dy −1/0 px                          [§2.7]
               ├ :1808-1809 translate + scale(f,1)  → LẬT TRÁI/PHẢI
               ├ :1810-1816 ánh viền bậc (silOf) → bị thay bằng veVien (sprite_custom.js:1262-1270)
               └ :1817 drawFrame(c, o, fr, t)  hero_tinhlinh.js:1660
                     ├ vkGhep(o, fr) → SC.khungVk(o) → SC.chonEmBe (lần nữa)  [ĐIỂM NỐI VŨ KHÍ]
                     ├ veVk() trước/sau thân
                     └ c.drawImage(fr.cv, …)  ──► bút giả `thay` (sprite_custom.js:1246)
                            nhận ra "thân" (img === fr.cv) → SC.veKhung(c, sp, s.ten, s.i, 1, {tint})  sprite_custom.js:309
                                                           → c.drawImage(sp.img, sx, sy, sw, sh, -ax, -ay, fw, fh)
```

Trích đoạn then chốt:

```js
// combat.js:1059-1061 — mọi đồng hồ hoạt ảnh của người chơi đi vào o
x: P.x, y: P.y, face: P.face, key: P.key, move: P.moving, t: P.t, tc: P.chayT,
atk: P.atkT > 0 ? 1 - P.atkT / P.atkDur : -1, dodge: P.dodgeT > 0 ? 1 - P.dodgeT / 0.27 : -1,
flash: P.hurtT > 0, alpha: P.inv > 0 && P.dodgeT <= 0 && Math.floor(G.time * 20) % 2 ? 0.5 : null,
```

```js
// sprite_custom.js:1246-1256 — bút giả: chỗ code định vẽ thân code thì vẽ khung ảnh AI
const thay = function (img, x, y) {
  const than = img === fr.cv || (arguments.length === 3 && x === fr.ox && y === fr.oy && img && img.width === fr.cv.width && img.height === fr.cv.height);
  if (than) {
    ...
    SC.veKhung(c, sp, s.ten, s.i, 1, { tint });
```

### 1.3 Các nơi khác cũng gọi `G.art.hero` cho người chơi (mỗi lần gọi chạy lại cả cây trên)

| Nơi gọi | Mục đích | Số lần / khung |
|---|---|---|
| `combat.js:1127` | thân chính | 1 |
| `fx.js:2318` (`vienBat`, `fx.js:2298`) | dựng hình bóng để vẽ viền đọc trận | 1 (khi bật đọc trận) |
| `fx.js:2342` (bóng mờ `S.ghosts`, tạo ở `fx.js:1977-1984`, `a.p = Object.assign({}, P)`) | bóng mờ khi lộn / lướt | tối đa 5 |
| `mobs.js:915-916` (`G.mobHeroOver`) | bóng mờ khi em bé bị quái to che | 0–1 |
| `hanh_trang.js:77`, `tailor.js:31`, `village.js:169/614/1030`, `village_scene.js:817`, `truyen.js:150` | ngoài trận (không có `o.p`) | — |

**[ĐO]** `G.art.hero` được gọi **2 lần mỗi khung** ở trạng thái thường (thân chính + viền), **tới 6 lần** khi đang lộn (bóng mờ). Mỗi lần gọi `SC.chonEmBe` chạy ~4 lần (`:625` nhunBuoc, `:1220`, `SC.khungVk` ở `hero_tinhlinh.js:1363` và `:1412`).

---

## 2. Hệ sprite sheet của em bé

### 2.1 Định dạng tệp và nạp (`SC.add`, `sprite_custom.js:98-158`)

```js
// sprite_custom.js:107, 113-114
const fw = tep.khung_rong | 0, fh = tep.khung_cao | 0, goc = tep.goc || [0, 0];
dt[k] = { hang: a.hang | 0, so: Math.max(1, a.so | 0), giay: +a.giay > 0 ? +a.giay : 0.6, lap: !!a.lap, mo: a.mo != null ? +a.mo : null };
const bg = docBang(a, dt[k].so); if (bg) dt[k].bang = bg; // "khung" / "cham" (bỏ khung trùng)
```

| Trường JSON | Đọc ở | Ý nghĩa với em bé | Có hiệu lực? |
|---|---|---|---|
| `khung_rong`, `khung_cao` | `:107` | cỡ khung theo **điểm ảnh game** (cả 28 tệp: 48×48) | có |
| `net` | `:93`, `:120` | ảnh thật gấp `net` lần (cả 28 tệp: 2 → ô ảnh 96×96) | có |
| `goc` | `:118` (`ax`, `ay`) | điểm neo chân trong khung (cả 28 tệp: [24, 45]) | có |
| `huong`/`quay` | `:119` (`lat`) | ảnh vẽ quay trái → lật | không tệp nào ghi → `lat=false` |
| `dong_tac.<tên>.hang` | `:113` | hàng trên tấm | có |
| `.so` | `:113` | số cột (khung) | có |
| `.giay` | `:113` | thời lượng | **chỉ `idle`, `move`, `die`** (§2.3) |
| `.lap` | `:113` | lặp | **không đọc** trong `chonEmBe` (chỉ dùng cho danh sách quái `:446`) |
| `.mo` | `:113` | mốc mờ dần khi chết | chỉ quái (`chonQuai :339`); em bé không mờ; không tệp em bé nào có |
| `.khung`, `.cham` | `docBang :177-189` | danh sách cột phát (bỏ cột trùng) + cột giữ mốc | có, nếu hàng được phát và `G.KHUNG_TRUNG` |
| `neo.dau/than/tay` (+ theo động tác) | `docNeo :484-491` | dời đồ khoác / vũ khí | có |
| `nhun_buoc` | `:133` | `false` = hàng chạy đã nhún sẵn | có |
| `cu` | `:138` | thân bộ vẽ cũ → tắt | có |
| `khoac_do` | `:131` | `false` = không khoác đồ rời | không tệp nào ghi |
| `rong`, `cao`, `bong`, `dung_yen`, `nhun` | `:120-126` | thông tin phụ | `dung_yen/nhun` không tệp em bé nào có |

Các động tác hợp lệ của em bé: `ANIMS = ['idle','move','tele','atk','hit','die','ne','noi']` (`:13`) + `HANG_DON = ['atk_sword','atk_bow','atk_spear','atk_hammer','cast']` (`:23`).

### 2.2 Cắt khung (slicing) và vẽ — `SC.veKhung` (`sprite_custom.js:309-324`)

```js
// sprite_custom.js:311-320
const a = sp.dt[ten] || sp.dt.idle, n = sp.net || 1, sx = i * sp.fw * n, sy = a.hang * sp.fh * n, sw = sp.fw * n, sh = sp.fh * n;
if ((face < 0) !== !!sp.lat) c.scale(-1, 1);
const dx = -sp.ax, dy = -sp.ay + (o.dy || 0);
else c.drawImage(sp.img, sx, sy, sw, sh, dx, dy, sp.fw, sp.fh);
```

- **Cột = chỉ số khung `i`**, **hàng = `hang`**; ô nguồn `fw·net × fh·net` = 96×96 px ảnh; vẽ ra `fw × fh` = 48×48 px game, gốc tại `(-ax, -ay)` = (−24, −45) so với chân.
- **Độ nét**: canvas thế giới có `G.NET = 2` (`engine.js:17-24`, đo được `NET: 2`) → 48 px game = 96 px thật, ảnh `net:2` hiện đủ chi tiết, `imageSmoothingEnabled = false` (`:313`).
- **Lật trái/phải**: em bé luôn gọi `veKhung(..., face = 1, ...)` (`:1256`); việc lật do lớp 3 làm cho cả bé + vũ khí:

```js
// hero_tinhlinh.js:1807-1809
const nb = G.spriteCustom && G.spriteCustom.nhunBuoc ? G.spriteCustom.nhunBuoc(o) : 0;
c.translate(x + (f < 0 ? 1 : 0), y + nb);
c.scale(f, 1);
```

  (`+1` khi quay trái để tâm lật rơi đúng giữa điểm ảnh; `f = o.face < 0 ? -1 : 1`, `:1790`.)
- **Nhuộm**: `tint` từ `emBeTint` (`:629-635`): trúng đòn trắng 0,6; băng `#9fd8ff` 0,45; độc `#7fd957` 0,4 — vẽ bằng `veNhuom` (tấm một màu cỡ một khung, `:203-215`).

**[ĐO]** Tấm sau ghép: thân gốc `768×1152` px = 8 cột × 12 hàng ô 96 (7 hàng thân + 5 hàng đòn); thân bộ không có tệp đòn `768×672` = 7 hàng.

### 2.3 Chỉ số khung từ thời gian — `khungLap`, `khungMot`, `khungDon`

```js
// sprite_custom.js:167-174 — lặp theo thời gian t (giây) / một lần theo tiến độ u (0..1)
function khungLap(a, t) {
  if (a.bang && G.KHUNG_TRUNG) { const f = Math.max(0, t) / a.giay; return theoBang(a.bang, f - Math.floor(f + 1e-6)); }
  return Math.floor(Math.max(0, t) / (a.giay / a.so) + 1e-6) % a.so;
}
function khungMot(a, u) {
  if (a.bang && G.KHUNG_TRUNG) return theoBang(a.bang, clamp(u, 0, 1));
  return Math.min(a.so - 1, Math.floor(clamp(u, 0, 1) * a.so));
```

```js
// sprite_custom.js:585-592 — hàng đòn theo vũ khí: luôn nghĩ trên nền 6 khung rồi đổi theo so thật (doi6)
const MOC_DON = { atk_bow: [0, 0.15, 0.3, 0.45, 0.62, 0.8], atk_spear: [0, 0.22, 0.45, 0.55, 0.7, 0.85], atk_hammer: [0, 0.2, 0.38, 0.45, 0.6, 0.8], cast: [0, 0.12, 0.25, 0.4, 0.6, 0.8] };
function khungDon(a, ten, u, combo) {
  let i6 = 0;
  if (ten === 'atk_sword') i6 = 2 * (((combo | 0) % 3 + 3) % 3) + (u >= 0.4 ? 1 : 0);
  else { const m = MOC_DON[ten]; while (i6 < 5 && u >= m[i6 + 1]) i6++; }
  return doi6(a, i6);
```

```js
// sprite_custom.js:594 — giữ nút lấy đà: khung đứng yên
const giuDon = (ten, charge) => (ten === 'atk_bow' ? Math.min(2, Math.floor(clamp(charge || 0, 0, 1) * 3)) : ten === 'atk_sword' ? 4 : charge >= 0.4 ? 1 : 0);
```

| Động tác | Nguồn thời gian | Công thức chọn khung | `giay` JSON có dùng? |
|---|---|---|---|
| `idle` | `o.t = P.t` (đồng hồ người chơi, +1/60 mỗi tick, `combat.js:651`) | `khungLap(idle, t)` | **có** (1 s / 6 khung) |
| `move` | `o.tc = P.chayT` (`combat.js:748`) | `khungLap(move, tc)` | **có** |
| `move` khi lướt | `t*2` (`:605`) | `khungLap(move, 2t)` | có (nhanh ×2) |
| `die` | `P.deadT` (`combat.js:654`) | `khungMot(die, deadT/giay)` | **có** |
| `atk` (dự phòng) | `o.atk = 1 − atkT/atkDur` | `khungMot(atk, u)` | không |
| `atk_sword` | `o.atk`, `P.comboI` | 2 khung/nhát, đổi ở u = 0,4 | không |
| `atk_bow/spear/hammer` | `o.atk` | mốc `MOC_DON` | không |
| `cast` | `1 − specT/0,35` (qua `G.nhipChieu`) hoặc `1 − castT/0,4` | `MOC_DON.cast` | không |
| `hit` | `1 − hurtT/0,2` | `khungMot(hit, u)` | không |
| `ne` | `o.dodge = 1 − dodgeT/0,27` | `khungMot(ne, u)` | không |
| `tele` | hằng `0,99` | khung cuối | không |

`1e-6` trong `khungLap` chống lỗi làm tròn; thấy ở số đo: khung đầu của vòng đứng chỉ 9 tick, sau đó 10 tick **[ĐO]**.

### 2.4 Trường `khung` / `cham` (bỏ khung trùng) — `docBang` (`sprite_custom.js:177-189`), cờ `G.KHUNG_TRUNG` (`:62-66`, `?khungtrung=0`)

- Chỉ **1/28 tệp** có trường này: `em-be-wrestler-bien.sprite.json` hàng `atk`: `"khung": [0, 2, 3, 4, 5], "cham": 4`.
- Bảng phát: cột 0,2,3 chia đều quãng `[0, 4/6)`, cột 4 bắt đầu đúng mốc cũ `4/6`, cột 4,5 chia đều phần còn lại.
- **[ĐO]** Với `?donvk=0`: `atk:0×4 atk:2×4 atk:3×4 atk:4×3 atk:5×4` (bỏ cột 1); `?donvk=0&khungtrung=0`: `atk:0×4 atk:1×3 atk:2×3 atk:3×3 atk:4×3 atk:5×3`.
- **[ĐO]** Chế độ mặc định: Cu Lì bộ Hang Biển có tệp `em-be-wrestler-bien-don` → kiếm phát `atk_sword`, **hàng `atk` (và trường `khung`) không bao giờ được phát** trừ khi tắt `G.DON_VK` hoặc vũ khí là `fist` (Phi Thương đang bay, `combat.js:1063`).

### 2.5 Ghép tệp đòn vào tấm thân — `themDon` (`:520-542`), `ghepDon` (`:544-569`)

- Mã tệp đòn: `em-be-<key>-don` hoặc `em-be-<key>-<bộ>-don` (regex `:521`). `lap` bị ép `false`, `so` kẹp 1..16, `giay` mặc định 0,4 (`:529`).
- Khi cả thân và tệp đòn nạp xong: vẽ tấm thân rồi dán từng hàng đòn **xuống dưới** (hàng `r0 + hang`, `r0 = round(base.height / ch)` = 7), canh điểm chân `ox = (sp.ax − d.ax)·N` (cả 28 tệp cùng `goc` → `ox = oy = 0`), thêm hàng vào `sp.dt` và xoá mọi đo đạc nhớ (`xoaDoDem :543`).

```js
// sprite_custom.js:565-566
for (const k in d.dt) { sp.dt[k] = Object.assign({}, d.dt[k], { hang: r0 + d.dt[k].hang }); sp.donHang[k] = 1; }
sp.img0 = base; sp.img = cv; sp.donMa = d.ma;
```

- Thân bộ **chỉ** nhận tệp đòn đúng bộ đó (`ghepDon(goc)` theo mã `goc0 = m[1]`), **không mượn** tệp đòn của thân gốc (chú thích `:518-519`).

### 2.6 Thứ tự ưu tiên chọn TỆP thân — `SC.cuaEmBe` (`:513`)

```js
// sprite_custom.js:503, 508-513
SC.boCua = (o) => { const f = fxCua(o), b = f && (f.bo_than !== undefined ? f.bo_than : f.bo); return typeof b === 'string' && BO_TP[b] ? b : null; };
SC.thanBo = (key, o) => {
  const b = SC.boCua(o); if (!b) return null;
  const ma = 'em-be-' + (key || 'smith') + '-' + b, s0 = SC.ds[ma];
  return s0 && s0.cu && !G.THAN_BO_CU ? null : SC.get(ma);
};
SC.cuaEmBe = (key, o) => (o && SC.thanBo(key, o)) || SC.get('em-be-' + (key || 'smith')) || SC.get('em-be');
```

1. **Thân bộ** `em-be-<key>-<bộ>` — khi áo đang mặc thuộc bộ `rung|bien|lau` (`outfit.js:247-251` ghi `fx.bo_than`; cờ `O.THAN_THEO_AO = true` `outfit.js:256`), tệp đã nạp xong (`ready`), và không phải thân cũ (`cu`) trừ khi `?thanbocu=1` (`:505`).
2. **Thân gốc** `em-be-<key>`.
3. Tệp chung `em-be` (không tồn tại trong `art/custom`).
4. Không có gì → `hero0` = **vẽ hoàn toàn bằng code** (`:1215`), và khi `frame()` lỗi → `G.art.heroOld` (hero_art.js) (`hero_tinhlinh.js:1789`) → `old` (art.js) (`hero_art.js:1163`).

Hàng đòn: chọn trong **chính tệp thân đã chọn** (`don(ten) = G.DON_VK && dt[ten]`, `:601`). Thiếu hàng → `atk` (`:612`) → thiếu nữa → `idle` (`mot` `:598`).

`outfit.js` → `P.outfit`:

```js
// outfit.js:247-250
if (O.THAN_THEO_AO) {
  const ao = O.worn(sv, 'robe'), bo = (ao && I[ao.k] && I[ao.k].set) || null;
  L.fx.bo_than = bo && O.SETS[bo] ? bo : null;
  L.fx.an_bo = L.fx.bo_than ? O.AN_THAN_BO.filter((slot) => { ... }) : [];
```

`an_bo` (mũ / đồ lưng / bùa cùng bộ) bị ẩn khỏi lớp đồ khoác vì thân bộ đã vẽ sẵn (`SC.anBo :1202-1207`). Áo không bao giờ khoác lên thân bộ (`:1231`).

### 2.7 Nhún theo bước — `SC.nhunBuoc` (`:620-628`), cờ `G.NHUN_BUOC`

```js
// sprite_custom.js:626-627
const t = ..., i = s.ten === 'move' ? s.i : G.CHAY_DANH === 'nhun' && o.atk >= 0 ? khungLap(sp.dt.move, t) : -1;
return i >= 0 && i % 3 === 1 ? -1 : 0;
```

Dời cả thân + vũ khí lên 1 px ở khung `i % 3 === 1` (vòng 6 khung = 2 bước). Thân gốc ghi `"nhun_buoc": false` (hàng chạy 8 khung mới đã nhún sẵn) → 0. **[ĐO]** Thân bộ chạy 90 tick: 30 tick nhún; thân gốc: 0. Lưu ý: luật `i % 3` giả định 6 khung — nếu một thân bộ sau này có 8 khung mà quên ghi `nhun_buoc:false` thì nhún sai nhịp **[SUY]**.

### 2.8 Neo đồ khoác (`neo`, `khopEmBe`, `matNa`) — tóm tắt

- `matNa(sp)` (`:655-672`): hình bóng từng khung (alpha > 127, lấy mẫu giữa ô net) cỡ điểm ảnh game, nhớ theo `hang:i`.
- `SC.khopEmBe(sp, ten, i)` (`:689-725`): so khung với `idle:0` của **chính tấm đó** → `{dau:[dx,dy], than:[dx,dy]}` (dò dời ±8 px) hoặc `{rot,x,y}` cho `ne`/`die` (dò góc mỗi 15°). Dùng để đồ khoác, dấu ngực, áo bám theo thân AI.
- `SC.matKhung` (`:1094-1106`) / `SC.matKhungGan` (`:1108-1120`): đĩa mặt mỗi khung — dùng cho vũ khí né mặt (điểm nối, ngoài phạm vi).
- `SC.tinhDatMon` (`:1966`): tính chỗ đặt món đồ (mũ/áo/đồ lưng) có ảnh AI theo điểm neo khung — phần trang phục; chỉ liên quan khung qua `s.ten`, `s.i`.
- Neo theo tệp (bảng §4.2): `neo.than.x` lệch tới 4 px giữa thân gốc và thân bộ (ví dụ Cu Tèo gốc `[-1,-2]`, bộ Hang Biển `[-4,-2]`).

---

## 3. Máy trạng thái hoạt ảnh người chơi

### 3.1 Không có "biến trạng thái" riêng

Không có `P.anim` / `P.state`. Trạng thái hoạt ảnh được **suy ra mỗi khung** từ các đồng hồ gameplay của `P` theo một chuỗi `if` ưu tiên. Hai chuỗi tồn tại song song: `SC.chonEmBe` (ảnh AI) và `pick` (xương code, `hero_tinhlinh.js:1161-1191`); `hero_art.js:1098-1119` là bản cũ gần giống.
(Tìm: `grep -n "P.anim\|P.state\|animState" game/js/*.js` → không có kết quả cho người chơi.)

### 3.2 Đồng hồ gameplay (nguồn của mọi trạng thái)

| Đồng hồ | Đặt ở | Giảm ở | Giá trị |
|---|---|---|---|
| `P.t` | `combat.js:651` `P.t += dt` | — | thời gian người chơi (đứng thở) |
| `P.chayT` | `combat.js:748` | — | `+= dt·clamp(tốc độ thật/P.speed, 0,55, 1,2)` chỉ khi đang đi |
| `P.moving` | `combat.js:683` (false), `:745` (true) | — | đẩy cần > 0,12 và không lộn/lướt |
| `P.atkT / P.atkDur` | `moves.js:306` `begin()` (cũ: `combat.js:533`) | `combat.js:652` | kiếm 0,3/0,3/0,46 (`moves.js:39-41`), giáo 0,38/0,34/0,34, quét 0,52, búa 0,8, cung 0,38 đứng / 0,45 đi |
| `P.comboI` | `moves.js:308` (`o.pose`) | `combat.js:788` (=−1 khi đổi vũ khí) | 0,1,2 (giáo quét = 3) |
| `P.hitAt` | `moves.js:307` | — | null → 0,45; búa 0,35 (`moves.js:74`) |
| `P.dodgeT` | `combat.js:760` = 0,27 | `combat.js:720` | lộn |
| `P.dashT` | `moves.js:335` | `combat.js:690` | lướt (nhát lướt, xốc tới) |
| `P.specT` | `combat.js:564` = 0,35 | `:652` | đòn Đặc biệt |
| `P.castT` | (chương, `chuong.js`) | `:652` | chưởng 0,4 |
| `P.hurtT` | `combat.js:632` = 0,2 | `:652` | trúng đòn |
| `P.dead / P.deadT` | `combat.js:644` / `:654` | — | gục |
| `P.mv.holding / charge` | `moves.js:573` | `moves.js:137 cancel` | giữ nút lấy đà |

### 3.3 Bảng ưu tiên (trên thắng dưới)

| # | Trạng thái | Điều kiện vào (`SC.chonEmBe`, sprite_custom.js) | Hàng ảnh AI | Xương code (`pick`, hero_tinhlinh.js) | Ra / về idle |
|---|---|---|---|---|---|
| 1 | Gục | `p.dead` `:603` | `die` một lần theo `deadT/giay` | `die` `floor(deadT/0,075)` ≤7 `:1164` | không ra (đứng khung cuối; không mờ) |
| 2 | Lộn (né) | `o.dodge >= 0` `:604` | `ne` (thiếu → `move`) | `dodge` 8 khung `:1165-1170` | `dodgeT ≤ 0` → xuống các nhánh dưới |
| 3 | Lướt | `p.dashT > 0` `:605` | `move` ×2 tốc | `dash` 2 khung 30 fps `:1172` | `dashT ≤ 0` |
| 4 | Đòn Đặc biệt | `p.specT > 0` `:606` | `cast` (thiếu → `atk`) | `spec` 7 khung `:1173` | `specT ≤ 0` |
| 5 | Chưởng | `p.castT > 0` `:607` | `cast` (thiếu → `atk`) | `cast` 8 khung `:1174` | `castT ≤ 0` |
| 6 | Giữ lấy đà | `p.mv.holding && !(o.atk>=0)` `:608` | `atk_<vk>` khung cố định `giuDon` (thiếu → `tele` khung cuối) | `hold` `:1176-1180` | thả nút → đòn (`atk`) |
| 7 | Đánh | `o.atk >= 0` `:609-613` | `atk_<vk>` (`khungDon`), thiếu → `atk`; **đang chạy + `G.CHAY_DANH='than'`** → `move` theo `tc` | `atk` (`nhip()` kéo giãn) `:1182-1186`; giáo quét: `sweep` `:1181` | `atkT ≤ 0` |
| 8 | Trúng đòn | `p.hurtT > 0` (hoặc `!p && o.flash`) `:614` | `hit` theo `1 − hurtT/0,2` | `hurt` 1 khung `:1187` | `hurtT ≤ 0` |
| 9 | Chạy | `o.move` `:615` | `move` lặp theo `tc` | `run` `floor(t·13)%8` `:1188` | `P.moving=false` |
| 10 | (Gồng) | — (ảnh AI không có) | — | `gong` `:1189` | — |
| 11 | Đứng | mặc định `:616` | `idle` lặp theo `t` | `idle` `floor(t·6,5)%8`, chớp mắt `t%3,7<0,14` `:1190` | — |

- **Không có** trạng thái "nhảy / rơi / tiếp đất / đi bộ (walk) / phòng thủ (block) / choáng (stun) của người chơi" — KHÔNG TỒN TẠI. Tìm: `grep -n "jump\|fall\|land\|nhay\|roi\b\|tiepDat\|walk\|block\|stun" game/js/sprite_custom.js game/js/hero_tinhlinh.js game/js/combat.js` → chỉ thấy `stun` của quái và `fall` (độ giảm sát thương Trảm Nguyệt `moves.js:25`), không có nhánh hoạt ảnh. Đóng băng (`P.frozenT`, `combat.js:675`) chỉ đặt `P.moving=false; P.atkT=0` → hiện `idle` (hoặc `hit` nếu còn `hurtT`) + nhuộm băng.
- "Trở về idle" **không phải chuyển tiếp có chủ đích**: khi mọi đồng hồ về 0, nhánh cuối `lap('idle', t)` thắng; vì `t = P.t` chạy liên tục nên idle **vào giữa vòng** (đo: sau đòn kiếm vào `idle:2`, sau trúng đòn vào `idle:1`) **[ĐO]**. Không có khung hồi (recovery) riêng.
- `G.CHAY_DANH` (`sprite_custom.js:38`, mặc định `'than'`, `?chaydanh=0|than|lai|nhun`):
  - `'than'`: chạy mà đánh → thân giữ hàng `move`, chỉ vũ khí vung (theo xương code) **[ĐO]**.
  - `'lai'`: hàng đòn chỉ khi `0,2 ≤ u < 0,65`, còn lại `move`.
  - `'nhun'`: hàng đòn + nhún theo bước.
  - `false` (`?chaydanh=0`): hàng đòn, chân đứng im.

### 3.4 Cờ ảnh hưởng chọn khung / vẽ thân

| Cờ | Định nghĩa | Mặc định (đo) | URL tắt/bật | Ảnh hưởng chọn khung? |
|---|---|---|---|---|
| `G.DON_VK` | `sprite_custom.js:24-28` | `true` | `?donvk=0` | **có**: dùng `atk_<vk>`/`cast` hay `atk` |
| `G.CHAY_DANH` | `:38` | `'than'` | `?chaydanh=0` / `than` / `lai` / `nhun` | **có** (chạy + đánh) |
| `G.NHUN_BUOC` | `:39` | `true` | `?nhunbuoc=0` | không đổi khung, dời y −1 px |
| `G.KHUNG_TRUNG` | `:62-66` | `true` | `?khungtrung=0` | **có** (bảng `khung/cham`) |
| `G.THAN_BO_CU` | `:505` | `false` | `?thanbocu=1` | **có** (chọn tệp thân) |
| `O.THAN_THEO_AO` | `outfit.js:256` | `true` | (không có URL) | **có** (thân bộ theo áo) |
| `G.BO_THAN` | `:435-439` | `true` | `?bothan=0` | không (chỉ dùng bút giả mới mỗi lần) |
| `G.NAP_SAU_MOI` | `:47-51` | `true` | `?napsau=0` | không (cách giải mã ảnh) |
| `G.AO_THAN_AI` | `:1134-1138` | `true` | `?aothan=0` | không (áo khoác) |
| `G.CO_VK` | `:1449-1453` | `{sword:0.66,…}` | `?covk=0` | gián tiếp: `G.nhipChieu` (`hero_tinhlinh.js:1156-1159`) dồn khung chiêu kiếm |
| `G.KIEM_KHOP` | `:895-899` | `true` | `?kiemkhop=0` | không (vẽ lại tay AI đè chuôi) |
| `G.KIEM_SAU` | `hero_tinhlinh.js:1402` **và** `sprite_custom.js:1032` (định nghĩa 2 lần) | `true` | `?kiemsau=0` | không (cắt kiếm sau đầu) |
| `G.KIEM_MUOT` | `hero_tinhlinh.js:1536` | `true` | `?kiemmuot=0` | không (góc kiếm liền) |
| `G.VK_NE_MAT` | `hero_tinhlinh.js:1476` | `true` | `?vknemat=0` | không |
| `G.VK_NGA` | `hero_tinhlinh.js:1292` | `true` | `?vknga=0` | xương code: `pick` thêm `'nga'` khi chết (`:1164`) |
| `G.VET_DAM`, `G.VET_TRON` | `fx.js:323`, `fx.js:378` | `true` (VET_DAM: `!== false`) | `?vettron=0` | không (vệt chém, gọi `TL.tip(G.heroArgs(P))` `fx.js:384-386, 785-786`) |
| `G.NET` | `engine.js:17-24` | `2` | cài đặt "Độ nét" | không (độ nét) |


---

## 4. Bảng D — hoạt ảnh em bé (sinh tự động từ JSON)

Bảng 4.1–4.3 sinh bằng script Python đọc thẳng 28 tệp `game/art/custom/em-be-*.sprite.json` (mã script ở Phụ mục A cuối tệp); cột "Thời lượng thật / Kích hoạt / Kết thúc" lấy theo luật trong `SC.chonEmBe` (`sprite_custom.js:595-617`) và đã đối chiếu số đo §5. "fps" = `so / giay` của JSON (chỉ đúng với `idle`, `move`, `die`).

Ghi chú chung cho mọi dòng:
- Khung ảnh nguồn = `khung_rong·net × khung_cao·net` = 96×96 px; vẽ ra 48×48 px game; điểm chân `goc` = [24, 45] ở mọi tệp.
- Hàng tệp đòn sau khi ghép nằm ở `7 + hang` trên tấm thân (đo: tấm 768×1152).
- Tệp đòn **không tồn tại**: `em-be-hunter-rung-don`, `em-be-healer-rung-don`, `em-be-healer-bien-don`, `em-be-healer-lau-don` (ls `game/art/custom | grep em-be`).

### 4.1 Tệp thân nào thật sự được dùng

| Thân | Trạng thái |
|---|---|
| em-be-smith | đang dùng; tệp đòn em-be-smith-don |
| em-be-smith-rung | đang dùng; tệp đòn em-be-smith-rung-don |
| em-be-smith-bien | đang dùng; tệp đòn em-be-smith-bien-don |
| em-be-smith-lau | đang dùng; tệp đòn em-be-smith-lau-don |
| em-be-hunter | đang dùng; tệp đòn em-be-hunter-don |
| em-be-hunter-rung | đang dùng; tệp đòn KHÔNG CÓ |
| em-be-hunter-bien | đang dùng; tệp đòn em-be-hunter-bien-don |
| em-be-hunter-lau | đang dùng; tệp đòn em-be-hunter-lau-don |
| em-be-healer | đang dùng; tệp đòn em-be-healer-don |
| em-be-healer-rung | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc); tệp đòn KHÔNG CÓ |
| em-be-healer-bien | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc); tệp đòn KHÔNG CÓ |
| em-be-healer-lau | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc); tệp đòn KHÔNG CÓ |
| em-be-wrestler | đang dùng; tệp đòn em-be-wrestler-don |
| em-be-wrestler-rung | đang dùng; tệp đòn em-be-wrestler-rung-don |
| em-be-wrestler-bien | đang dùng; tệp đòn em-be-wrestler-bien-don |
| em-be-wrestler-lau | đang dùng; tệp đòn em-be-wrestler-lau-don |

### 4.2 Neo, nhún, số khung chạy của từng tệp thân

| Tệp thân | goc | neo.dau | neo.than | neo.tay | nhun_buoc | cu | move (so/giay) |
|---|---|---|---|---|---|---|---|
| em-be-healer-bien | [24, 45] | [3, -3] | [0, -2] | [0, 0] | (không ghi → nhún) | True | 6/0.6 |
| em-be-healer-lau | [24, 45] | [1, -3] | [-1, -2] | [0, 0] | (không ghi → nhún) | True | 6/0.6 |
| em-be-healer-rung | [24, 45] | [-1, -2] | [0, -1] | [0, 0] | (không ghi → nhún) | True | 6/0.6 |
| em-be-healer | [24, 45] | [-1, -4] | [0, -2] | [0, 0] | False | — | 8/0.65 |
| em-be-hunter-bien | [24, 45] | [1, -3] | [-4, -2] | [0, 0] | (không ghi → nhún) | — | 6/0.6 |
| em-be-hunter-lau | [24, 45] | [1, -3] | [-1, -2] | [0, 0] | (không ghi → nhún) | — | 6/0.6 |
| em-be-hunter-rung | [24, 45] | [1, -3] | [0, -2] | [0, 0] | (không ghi → nhún) | — | 6/0.6 |
| em-be-hunter | [24, 45] | [-1, -3] | [-1, -2] | [0, 0] | False | — | 8/0.6 |
| em-be-smith-bien | [24, 45] | [3, -3] | [-1, -2] | [0, 0] | (không ghi → nhún) | — | 6/0.6 |
| em-be-smith-lau | [24, 45] | [2, -4] | [0, -2] | [0, 0] | (không ghi → nhún) | — | 6/0.6 |
| em-be-smith-rung | [24, 45] | [2, -3] | [1, -2] | [0, 0] | (không ghi → nhún) | — | 6/0.6 |
| em-be-smith | [24, 45] | [0, -3] | [0, -2] | [0, 0] | False | — | 8/0.65 |
| em-be-wrestler-bien | [24, 45] | [2, -3] | [0, -2] | [0, 0] | (không ghi → nhún) | — | 6/0.6 |
| em-be-wrestler-lau | [24, 45] | [3, -4] | [-1, -2] | [0, 0] | (không ghi → nhún) | — | 6/0.6 |
| em-be-wrestler-rung | [24, 45] | [0, -3] | [0, -2] | [0, 0] | (không ghi → nhún) | — | 6/0.6 |
| em-be-wrestler | [24, 45] | [1, -3] | [-1, -2] | [0, 0] | False | — | 8/0.6 |

### 4.3 Bảng D đầy đủ (mỗi tệp × mỗi động tác)

| Tệp (art/custom/) | Động tác | Hàng | Số khung | Khung (game px) | giay trong JSON ≈ fps | lap (JSON) | Thời lượng THẬT trong game | Kích hoạt (sprite_custom.js:dòng) | Kết thúc | Trạng thái | Lỗi tiềm ẩn / ghi chú |
|---|---|---|---|---|---|---|---|---|---|---|---|
| em-be-smith.sprite.json | idle | 0 | 6 | 48×48 (ảnh ×2 = 96×96) | 1 s ≈ 6.0 fps | có | lặp theo P.t: giay/so mỗi khung (khungLap :167) | mặc định (không trạng thái nào khác) :616 | khi có trạng thái ưu tiên hơn | đang dùng | — |
| em-be-smith.sprite.json | move | 1 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.65 s ≈ 12.3 fps | có | lặp theo P.chayT (nhịp chân ×0,55..1,2) :597 | o.move = P.moving :615; lộn khi tệp thiếu "ne" :604; lướt dashT>0 (×2 tốc) :605; chạy-đánh CHAY_DANH='than' :611 | P.moving=false / trạng thái khác | đang dùng | — |
| em-be-smith.sprite.json | tele | 2 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 10.0 fps | không | đứng ở khung cuối (u=0,99), không chạy theo giay | giữ nút lấy đà mà KHÔNG có hàng đòn atk_<vk> :608 | thả nút | gần như không dùng (giữ nút đã có hàng atk_<vk>) | giay=0.4 bị bỏ qua |
| em-be-smith.sprite.json | atk | 3 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | theo P.atkDur (0,3/0,3/0,46 kiếm…), KHÔNG theo giay | o.atk>=0 khi không có hàng atk_<vk> (DON_VK tắt, thân bộ không có tệp đòn, vũ khí "fist") :612; chiêu/chưởng khi thiếu "cast" :606-607 | P.atkT<=0 | dự phòng (chỉ khi ?donvk=0 hoặc tay không "fist") | giay=0.4 bị bỏ qua |
| em-be-smith.sprite.json | hit | 4 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.2 s ≈ 20.0 fps | không | u = 1 - hurtT/0,2 → 0,2 s, KHÔNG theo giay | P.hurtT>0 (0,2 s) và không đánh/lộn/… :614 | hurtT<=0 | đang dùng | giay=0.2 bị bỏ qua |
| em-be-smith.sprite.json | die | 5 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | không | u = deadT / giay(die) → đúng giay | P.dead :603 | không kết thúc (đứng ở khung cuối) | đang dùng | — |
| em-be-smith.sprite.json | ne | 6 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | u = 1 - dodgeT/0,27 → 0,27 s, KHÔNG theo giay | o.dodge>=0 (dodgeT 0,27 s) :604 | dodgeT<=0 | đang dùng | giay=0.4 bị bỏ qua |
| em-be-smith-don.sprite.json | atk_sword | 0 (ghép xuống dưới: hàng 7) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | khungDon: combo×2 + (u>=0,4) — 2 khung/nhát theo P.atkDur, KHÔNG theo giay; giữ nút: khung 4 :594 | o.atk>=0, vũ khí kiếm, G.DON_VK :601,612 | P.atkT<=0 | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-smith-don.sprite.json | atk_bow | 1 (ghép xuống dưới: hàng 8) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_bow theo u, KHÔNG theo giay | o.atk>=0, cung :612; giữ nút: khung 0..2 theo charge :594,608 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-smith-don.sprite.json | atk_spear | 2 (ghép xuống dưới: hàng 9) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_spear theo u, KHÔNG theo giay | o.atk>=0, giáo (cả "Quét vòng") :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur); Quét vòng (pose 3) cũng phát hàng đâm |
| em-be-smith-don.sprite.json | atk_hammer | 3 (ghép xuống dưới: hàng 10) | 6 | 48×48 (ảnh ×2) | 0.55 s ≈ 10.9 fps | không (themDon ép lap:false) | MOC_DON.atk_hammer (khung "nện" 3 ở u=0,45, đòn chạm búa ở 0,35) | o.atk>=0, búa :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.55 bị bỏ qua (khungDon theo P.atkDur); khung nện (3) ở u=0,45 nhưng búa chạm ở u=0,35 (moves.js:74) — đo: chạm lúc khung 1 |
| em-be-smith-don.sprite.json | cast | 4 (ghép xuống dưới: hàng 11) | 6 | 48×48 (ảnh ×2) | 0.4 s ≈ 15.0 fps | không (themDon ép lap:false) | MOC_DON.cast theo u, KHÔNG theo giay | P.specT>0 (đòn Đặc biệt 0,35 s) :606; P.castT>0 (chưởng 0,4 s) :607 | specT/castT<=0 | đang dùng (G.DON_VK) | giay=0.4 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-smith-rung.sprite.json | idle | 0 | 6 | 48×48 (ảnh ×2 = 96×96) | 1 s ≈ 6.0 fps | có | lặp theo P.t: giay/so mỗi khung (khungLap :167) | mặc định (không trạng thái nào khác) :616 | khi có trạng thái ưu tiên hơn | đang dùng | — |
| em-be-smith-rung.sprite.json | move | 1 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 10.0 fps | có | lặp theo P.chayT (nhịp chân ×0,55..1,2) :597 | o.move = P.moving :615; lộn khi tệp thiếu "ne" :604; lướt dashT>0 (×2 tốc) :605; chạy-đánh CHAY_DANH='than' :611 | P.moving=false / trạng thái khác | đang dùng | — |
| em-be-smith-rung.sprite.json | tele | 2 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 10.0 fps | không | đứng ở khung cuối (u=0,99), không chạy theo giay | giữ nút lấy đà mà KHÔNG có hàng đòn atk_<vk> :608 | thả nút | gần như không dùng (giữ nút đã có hàng atk_<vk>) | giay=0.4 bị bỏ qua |
| em-be-smith-rung.sprite.json | atk | 3 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | theo P.atkDur (0,3/0,3/0,46 kiếm…), KHÔNG theo giay | o.atk>=0 khi không có hàng atk_<vk> (DON_VK tắt, thân bộ không có tệp đòn, vũ khí "fist") :612; chiêu/chưởng khi thiếu "cast" :606-607 | P.atkT<=0 | dự phòng (chỉ khi ?donvk=0 hoặc tay không "fist") | giay=0.4 bị bỏ qua |
| em-be-smith-rung.sprite.json | hit | 4 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.2 s ≈ 20.0 fps | không | u = 1 - hurtT/0,2 → 0,2 s, KHÔNG theo giay | P.hurtT>0 (0,2 s) và không đánh/lộn/… :614 | hurtT<=0 | đang dùng | giay=0.2 bị bỏ qua |
| em-be-smith-rung.sprite.json | die | 5 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | không | u = deadT / giay(die) → đúng giay | P.dead :603 | không kết thúc (đứng ở khung cuối) | đang dùng | — |
| em-be-smith-rung.sprite.json | ne | 6 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | u = 1 - dodgeT/0,27 → 0,27 s, KHÔNG theo giay | o.dodge>=0 (dodgeT 0,27 s) :604 | dodgeT<=0 | đang dùng | giay=0.4 bị bỏ qua |
| em-be-smith-rung-don.sprite.json | atk_sword | 0 (ghép xuống dưới: hàng 7) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | khungDon: combo×2 + (u>=0,4) — 2 khung/nhát theo P.atkDur, KHÔNG theo giay; giữ nút: khung 4 :594 | o.atk>=0, vũ khí kiếm, G.DON_VK :601,612 | P.atkT<=0 | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-smith-rung-don.sprite.json | atk_bow | 1 (ghép xuống dưới: hàng 8) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_bow theo u, KHÔNG theo giay | o.atk>=0, cung :612; giữ nút: khung 0..2 theo charge :594,608 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-smith-rung-don.sprite.json | atk_spear | 2 (ghép xuống dưới: hàng 9) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_spear theo u, KHÔNG theo giay | o.atk>=0, giáo (cả "Quét vòng") :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur); Quét vòng (pose 3) cũng phát hàng đâm |
| em-be-smith-rung-don.sprite.json | atk_hammer | 3 (ghép xuống dưới: hàng 10) | 6 | 48×48 (ảnh ×2) | 0.55 s ≈ 10.9 fps | không (themDon ép lap:false) | MOC_DON.atk_hammer (khung "nện" 3 ở u=0,45, đòn chạm búa ở 0,35) | o.atk>=0, búa :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.55 bị bỏ qua (khungDon theo P.atkDur); khung nện (3) ở u=0,45 nhưng búa chạm ở u=0,35 (moves.js:74) — đo: chạm lúc khung 1 |
| em-be-smith-rung-don.sprite.json | cast | 4 (ghép xuống dưới: hàng 11) | 6 | 48×48 (ảnh ×2) | 0.4 s ≈ 15.0 fps | không (themDon ép lap:false) | MOC_DON.cast theo u, KHÔNG theo giay | P.specT>0 (đòn Đặc biệt 0,35 s) :606; P.castT>0 (chưởng 0,4 s) :607 | specT/castT<=0 | đang dùng (G.DON_VK) | giay=0.4 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-smith-bien.sprite.json | idle | 0 | 6 | 48×48 (ảnh ×2 = 96×96) | 1 s ≈ 6.0 fps | có | lặp theo P.t: giay/so mỗi khung (khungLap :167) | mặc định (không trạng thái nào khác) :616 | khi có trạng thái ưu tiên hơn | đang dùng | — |
| em-be-smith-bien.sprite.json | move | 1 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 10.0 fps | có | lặp theo P.chayT (nhịp chân ×0,55..1,2) :597 | o.move = P.moving :615; lộn khi tệp thiếu "ne" :604; lướt dashT>0 (×2 tốc) :605; chạy-đánh CHAY_DANH='than' :611 | P.moving=false / trạng thái khác | đang dùng | — |
| em-be-smith-bien.sprite.json | tele | 2 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 10.0 fps | không | đứng ở khung cuối (u=0,99), không chạy theo giay | giữ nút lấy đà mà KHÔNG có hàng đòn atk_<vk> :608 | thả nút | gần như không dùng (giữ nút đã có hàng atk_<vk>) | giay=0.4 bị bỏ qua |
| em-be-smith-bien.sprite.json | atk | 3 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | theo P.atkDur (0,3/0,3/0,46 kiếm…), KHÔNG theo giay | o.atk>=0 khi không có hàng atk_<vk> (DON_VK tắt, thân bộ không có tệp đòn, vũ khí "fist") :612; chiêu/chưởng khi thiếu "cast" :606-607 | P.atkT<=0 | dự phòng (chỉ khi ?donvk=0 hoặc tay không "fist") | giay=0.4 bị bỏ qua |
| em-be-smith-bien.sprite.json | hit | 4 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.2 s ≈ 20.0 fps | không | u = 1 - hurtT/0,2 → 0,2 s, KHÔNG theo giay | P.hurtT>0 (0,2 s) và không đánh/lộn/… :614 | hurtT<=0 | đang dùng | giay=0.2 bị bỏ qua |
| em-be-smith-bien.sprite.json | die | 5 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | không | u = deadT / giay(die) → đúng giay | P.dead :603 | không kết thúc (đứng ở khung cuối) | đang dùng | — |
| em-be-smith-bien.sprite.json | ne | 6 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | u = 1 - dodgeT/0,27 → 0,27 s, KHÔNG theo giay | o.dodge>=0 (dodgeT 0,27 s) :604 | dodgeT<=0 | đang dùng | giay=0.4 bị bỏ qua |
| em-be-smith-bien-don.sprite.json | atk_sword | 0 (ghép xuống dưới: hàng 7) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | khungDon: combo×2 + (u>=0,4) — 2 khung/nhát theo P.atkDur, KHÔNG theo giay; giữ nút: khung 4 :594 | o.atk>=0, vũ khí kiếm, G.DON_VK :601,612 | P.atkT<=0 | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-smith-bien-don.sprite.json | atk_bow | 1 (ghép xuống dưới: hàng 8) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_bow theo u, KHÔNG theo giay | o.atk>=0, cung :612; giữ nút: khung 0..2 theo charge :594,608 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-smith-bien-don.sprite.json | atk_spear | 2 (ghép xuống dưới: hàng 9) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_spear theo u, KHÔNG theo giay | o.atk>=0, giáo (cả "Quét vòng") :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur); Quét vòng (pose 3) cũng phát hàng đâm |
| em-be-smith-bien-don.sprite.json | atk_hammer | 3 (ghép xuống dưới: hàng 10) | 6 | 48×48 (ảnh ×2) | 0.55 s ≈ 10.9 fps | không (themDon ép lap:false) | MOC_DON.atk_hammer (khung "nện" 3 ở u=0,45, đòn chạm búa ở 0,35) | o.atk>=0, búa :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.55 bị bỏ qua (khungDon theo P.atkDur); khung nện (3) ở u=0,45 nhưng búa chạm ở u=0,35 (moves.js:74) — đo: chạm lúc khung 1 |
| em-be-smith-bien-don.sprite.json | cast | 4 (ghép xuống dưới: hàng 11) | 6 | 48×48 (ảnh ×2) | 0.4 s ≈ 15.0 fps | không (themDon ép lap:false) | MOC_DON.cast theo u, KHÔNG theo giay | P.specT>0 (đòn Đặc biệt 0,35 s) :606; P.castT>0 (chưởng 0,4 s) :607 | specT/castT<=0 | đang dùng (G.DON_VK) | giay=0.4 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-smith-lau.sprite.json | idle | 0 | 6 | 48×48 (ảnh ×2 = 96×96) | 1 s ≈ 6.0 fps | có | lặp theo P.t: giay/so mỗi khung (khungLap :167) | mặc định (không trạng thái nào khác) :616 | khi có trạng thái ưu tiên hơn | đang dùng | — |
| em-be-smith-lau.sprite.json | move | 1 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 10.0 fps | có | lặp theo P.chayT (nhịp chân ×0,55..1,2) :597 | o.move = P.moving :615; lộn khi tệp thiếu "ne" :604; lướt dashT>0 (×2 tốc) :605; chạy-đánh CHAY_DANH='than' :611 | P.moving=false / trạng thái khác | đang dùng | — |
| em-be-smith-lau.sprite.json | tele | 2 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 10.0 fps | không | đứng ở khung cuối (u=0,99), không chạy theo giay | giữ nút lấy đà mà KHÔNG có hàng đòn atk_<vk> :608 | thả nút | gần như không dùng (giữ nút đã có hàng atk_<vk>) | giay=0.4 bị bỏ qua |
| em-be-smith-lau.sprite.json | atk | 3 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | theo P.atkDur (0,3/0,3/0,46 kiếm…), KHÔNG theo giay | o.atk>=0 khi không có hàng atk_<vk> (DON_VK tắt, thân bộ không có tệp đòn, vũ khí "fist") :612; chiêu/chưởng khi thiếu "cast" :606-607 | P.atkT<=0 | dự phòng (chỉ khi ?donvk=0 hoặc tay không "fist") | giay=0.4 bị bỏ qua |
| em-be-smith-lau.sprite.json | hit | 4 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.2 s ≈ 20.0 fps | không | u = 1 - hurtT/0,2 → 0,2 s, KHÔNG theo giay | P.hurtT>0 (0,2 s) và không đánh/lộn/… :614 | hurtT<=0 | đang dùng | giay=0.2 bị bỏ qua |
| em-be-smith-lau.sprite.json | die | 5 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | không | u = deadT / giay(die) → đúng giay | P.dead :603 | không kết thúc (đứng ở khung cuối) | đang dùng | — |
| em-be-smith-lau.sprite.json | ne | 6 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | u = 1 - dodgeT/0,27 → 0,27 s, KHÔNG theo giay | o.dodge>=0 (dodgeT 0,27 s) :604 | dodgeT<=0 | đang dùng | giay=0.4 bị bỏ qua |
| em-be-smith-lau-don.sprite.json | atk_sword | 0 (ghép xuống dưới: hàng 7) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | khungDon: combo×2 + (u>=0,4) — 2 khung/nhát theo P.atkDur, KHÔNG theo giay; giữ nút: khung 4 :594 | o.atk>=0, vũ khí kiếm, G.DON_VK :601,612 | P.atkT<=0 | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-smith-lau-don.sprite.json | atk_bow | 1 (ghép xuống dưới: hàng 8) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_bow theo u, KHÔNG theo giay | o.atk>=0, cung :612; giữ nút: khung 0..2 theo charge :594,608 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-smith-lau-don.sprite.json | atk_spear | 2 (ghép xuống dưới: hàng 9) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_spear theo u, KHÔNG theo giay | o.atk>=0, giáo (cả "Quét vòng") :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur); Quét vòng (pose 3) cũng phát hàng đâm |
| em-be-smith-lau-don.sprite.json | atk_hammer | 3 (ghép xuống dưới: hàng 10) | 6 | 48×48 (ảnh ×2) | 0.55 s ≈ 10.9 fps | không (themDon ép lap:false) | MOC_DON.atk_hammer (khung "nện" 3 ở u=0,45, đòn chạm búa ở 0,35) | o.atk>=0, búa :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.55 bị bỏ qua (khungDon theo P.atkDur); khung nện (3) ở u=0,45 nhưng búa chạm ở u=0,35 (moves.js:74) — đo: chạm lúc khung 1 |
| em-be-smith-lau-don.sprite.json | cast | 4 (ghép xuống dưới: hàng 11) | 6 | 48×48 (ảnh ×2) | 0.4 s ≈ 15.0 fps | không (themDon ép lap:false) | MOC_DON.cast theo u, KHÔNG theo giay | P.specT>0 (đòn Đặc biệt 0,35 s) :606; P.castT>0 (chưởng 0,4 s) :607 | specT/castT<=0 | đang dùng (G.DON_VK) | giay=0.4 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-hunter.sprite.json | idle | 0 | 6 | 48×48 (ảnh ×2 = 96×96) | 1 s ≈ 6.0 fps | có | lặp theo P.t: giay/so mỗi khung (khungLap :167) | mặc định (không trạng thái nào khác) :616 | khi có trạng thái ưu tiên hơn | đang dùng | — |
| em-be-hunter.sprite.json | move | 1 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | có | lặp theo P.chayT (nhịp chân ×0,55..1,2) :597 | o.move = P.moving :615; lộn khi tệp thiếu "ne" :604; lướt dashT>0 (×2 tốc) :605; chạy-đánh CHAY_DANH='than' :611 | P.moving=false / trạng thái khác | đang dùng | — |
| em-be-hunter.sprite.json | tele | 2 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 10.0 fps | không | đứng ở khung cuối (u=0,99), không chạy theo giay | giữ nút lấy đà mà KHÔNG có hàng đòn atk_<vk> :608 | thả nút | gần như không dùng (giữ nút đã có hàng atk_<vk>) | giay=0.4 bị bỏ qua |
| em-be-hunter.sprite.json | atk | 3 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | theo P.atkDur (0,3/0,3/0,46 kiếm…), KHÔNG theo giay | o.atk>=0 khi không có hàng atk_<vk> (DON_VK tắt, thân bộ không có tệp đòn, vũ khí "fist") :612; chiêu/chưởng khi thiếu "cast" :606-607 | P.atkT<=0 | dự phòng (chỉ khi ?donvk=0 hoặc tay không "fist") | giay=0.4 bị bỏ qua |
| em-be-hunter.sprite.json | hit | 4 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.2 s ≈ 20.0 fps | không | u = 1 - hurtT/0,2 → 0,2 s, KHÔNG theo giay | P.hurtT>0 (0,2 s) và không đánh/lộn/… :614 | hurtT<=0 | đang dùng | giay=0.2 bị bỏ qua |
| em-be-hunter.sprite.json | die | 5 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | không | u = deadT / giay(die) → đúng giay | P.dead :603 | không kết thúc (đứng ở khung cuối) | đang dùng | — |
| em-be-hunter.sprite.json | ne | 6 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | u = 1 - dodgeT/0,27 → 0,27 s, KHÔNG theo giay | o.dodge>=0 (dodgeT 0,27 s) :604 | dodgeT<=0 | đang dùng | giay=0.4 bị bỏ qua |
| em-be-hunter-don.sprite.json | atk_sword | 0 (ghép xuống dưới: hàng 7) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | khungDon: combo×2 + (u>=0,4) — 2 khung/nhát theo P.atkDur, KHÔNG theo giay; giữ nút: khung 4 :594 | o.atk>=0, vũ khí kiếm, G.DON_VK :601,612 | P.atkT<=0 | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-hunter-don.sprite.json | atk_bow | 1 (ghép xuống dưới: hàng 8) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_bow theo u, KHÔNG theo giay | o.atk>=0, cung :612; giữ nút: khung 0..2 theo charge :594,608 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-hunter-don.sprite.json | atk_spear | 2 (ghép xuống dưới: hàng 9) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_spear theo u, KHÔNG theo giay | o.atk>=0, giáo (cả "Quét vòng") :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur); Quét vòng (pose 3) cũng phát hàng đâm |
| em-be-hunter-don.sprite.json | atk_hammer | 3 (ghép xuống dưới: hàng 10) | 6 | 48×48 (ảnh ×2) | 0.55 s ≈ 10.9 fps | không (themDon ép lap:false) | MOC_DON.atk_hammer (khung "nện" 3 ở u=0,45, đòn chạm búa ở 0,35) | o.atk>=0, búa :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.55 bị bỏ qua (khungDon theo P.atkDur); khung nện (3) ở u=0,45 nhưng búa chạm ở u=0,35 (moves.js:74) — đo: chạm lúc khung 1 |
| em-be-hunter-don.sprite.json | cast | 4 (ghép xuống dưới: hàng 11) | 6 | 48×48 (ảnh ×2) | 0.4 s ≈ 15.0 fps | không (themDon ép lap:false) | MOC_DON.cast theo u, KHÔNG theo giay | P.specT>0 (đòn Đặc biệt 0,35 s) :606; P.castT>0 (chưởng 0,4 s) :607 | specT/castT<=0 | đang dùng (G.DON_VK) | giay=0.4 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-hunter-rung.sprite.json | idle | 0 | 6 | 48×48 (ảnh ×2 = 96×96) | 1 s ≈ 6.0 fps | có | lặp theo P.t: giay/so mỗi khung (khungLap :167) | mặc định (không trạng thái nào khác) :616 | khi có trạng thái ưu tiên hơn | đang dùng | — |
| em-be-hunter-rung.sprite.json | move | 1 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 10.0 fps | có | lặp theo P.chayT (nhịp chân ×0,55..1,2) :597 | o.move = P.moving :615; lộn khi tệp thiếu "ne" :604; lướt dashT>0 (×2 tốc) :605; chạy-đánh CHAY_DANH='than' :611 | P.moving=false / trạng thái khác | đang dùng | — |
| em-be-hunter-rung.sprite.json | tele | 2 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 10.0 fps | không | đứng ở khung cuối (u=0,99), không chạy theo giay | giữ nút lấy đà mà KHÔNG có hàng đòn atk_<vk> :608 | thả nút | đang dùng | giay=0.4 bị bỏ qua |
| em-be-hunter-rung.sprite.json | atk | 3 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | theo P.atkDur (0,3/0,3/0,46 kiếm…), KHÔNG theo giay | o.atk>=0 khi không có hàng atk_<vk> (DON_VK tắt, thân bộ không có tệp đòn, vũ khí "fist") :612; chiêu/chưởng khi thiếu "cast" :606-607 | P.atkT<=0 | đang dùng cho MỌI vũ khí (thiếu tệp đòn) | một hàng đòn chung cho kiếm/cung/giáo/búa; giay=0.4 bị bỏ qua |
| em-be-hunter-rung.sprite.json | hit | 4 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.2 s ≈ 20.0 fps | không | u = 1 - hurtT/0,2 → 0,2 s, KHÔNG theo giay | P.hurtT>0 (0,2 s) và không đánh/lộn/… :614 | hurtT<=0 | đang dùng | giay=0.2 bị bỏ qua |
| em-be-hunter-rung.sprite.json | die | 5 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | không | u = deadT / giay(die) → đúng giay | P.dead :603 | không kết thúc (đứng ở khung cuối) | đang dùng | — |
| em-be-hunter-rung.sprite.json | ne | 6 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | u = 1 - dodgeT/0,27 → 0,27 s, KHÔNG theo giay | o.dodge>=0 (dodgeT 0,27 s) :604 | dodgeT<=0 | đang dùng | giay=0.4 bị bỏ qua |
| em-be-hunter-bien.sprite.json | idle | 0 | 6 | 48×48 (ảnh ×2 = 96×96) | 1 s ≈ 6.0 fps | có | lặp theo P.t: giay/so mỗi khung (khungLap :167) | mặc định (không trạng thái nào khác) :616 | khi có trạng thái ưu tiên hơn | đang dùng | — |
| em-be-hunter-bien.sprite.json | move | 1 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 10.0 fps | có | lặp theo P.chayT (nhịp chân ×0,55..1,2) :597 | o.move = P.moving :615; lộn khi tệp thiếu "ne" :604; lướt dashT>0 (×2 tốc) :605; chạy-đánh CHAY_DANH='than' :611 | P.moving=false / trạng thái khác | đang dùng | — |
| em-be-hunter-bien.sprite.json | tele | 2 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 10.0 fps | không | đứng ở khung cuối (u=0,99), không chạy theo giay | giữ nút lấy đà mà KHÔNG có hàng đòn atk_<vk> :608 | thả nút | gần như không dùng (giữ nút đã có hàng atk_<vk>) | giay=0.4 bị bỏ qua |
| em-be-hunter-bien.sprite.json | atk | 3 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | theo P.atkDur (0,3/0,3/0,46 kiếm…), KHÔNG theo giay | o.atk>=0 khi không có hàng atk_<vk> (DON_VK tắt, thân bộ không có tệp đòn, vũ khí "fist") :612; chiêu/chưởng khi thiếu "cast" :606-607 | P.atkT<=0 | dự phòng (chỉ khi ?donvk=0 hoặc tay không "fist") | giay=0.4 bị bỏ qua |
| em-be-hunter-bien.sprite.json | hit | 4 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.2 s ≈ 20.0 fps | không | u = 1 - hurtT/0,2 → 0,2 s, KHÔNG theo giay | P.hurtT>0 (0,2 s) và không đánh/lộn/… :614 | hurtT<=0 | đang dùng | giay=0.2 bị bỏ qua |
| em-be-hunter-bien.sprite.json | die | 5 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | không | u = deadT / giay(die) → đúng giay | P.dead :603 | không kết thúc (đứng ở khung cuối) | đang dùng | — |
| em-be-hunter-bien.sprite.json | ne | 6 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | u = 1 - dodgeT/0,27 → 0,27 s, KHÔNG theo giay | o.dodge>=0 (dodgeT 0,27 s) :604 | dodgeT<=0 | đang dùng | giay=0.4 bị bỏ qua |
| em-be-hunter-bien-don.sprite.json | atk_sword | 0 (ghép xuống dưới: hàng 7) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | khungDon: combo×2 + (u>=0,4) — 2 khung/nhát theo P.atkDur, KHÔNG theo giay; giữ nút: khung 4 :594 | o.atk>=0, vũ khí kiếm, G.DON_VK :601,612 | P.atkT<=0 | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-hunter-bien-don.sprite.json | atk_bow | 1 (ghép xuống dưới: hàng 8) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_bow theo u, KHÔNG theo giay | o.atk>=0, cung :612; giữ nút: khung 0..2 theo charge :594,608 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-hunter-bien-don.sprite.json | atk_spear | 2 (ghép xuống dưới: hàng 9) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_spear theo u, KHÔNG theo giay | o.atk>=0, giáo (cả "Quét vòng") :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur); Quét vòng (pose 3) cũng phát hàng đâm |
| em-be-hunter-bien-don.sprite.json | atk_hammer | 3 (ghép xuống dưới: hàng 10) | 6 | 48×48 (ảnh ×2) | 0.55 s ≈ 10.9 fps | không (themDon ép lap:false) | MOC_DON.atk_hammer (khung "nện" 3 ở u=0,45, đòn chạm búa ở 0,35) | o.atk>=0, búa :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.55 bị bỏ qua (khungDon theo P.atkDur); khung nện (3) ở u=0,45 nhưng búa chạm ở u=0,35 (moves.js:74) — đo: chạm lúc khung 1 |
| em-be-hunter-bien-don.sprite.json | cast | 4 (ghép xuống dưới: hàng 11) | 6 | 48×48 (ảnh ×2) | 0.4 s ≈ 15.0 fps | không (themDon ép lap:false) | MOC_DON.cast theo u, KHÔNG theo giay | P.specT>0 (đòn Đặc biệt 0,35 s) :606; P.castT>0 (chưởng 0,4 s) :607 | specT/castT<=0 | đang dùng (G.DON_VK) | giay=0.4 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-hunter-lau.sprite.json | idle | 0 | 6 | 48×48 (ảnh ×2 = 96×96) | 1 s ≈ 6.0 fps | có | lặp theo P.t: giay/so mỗi khung (khungLap :167) | mặc định (không trạng thái nào khác) :616 | khi có trạng thái ưu tiên hơn | đang dùng | — |
| em-be-hunter-lau.sprite.json | move | 1 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 10.0 fps | có | lặp theo P.chayT (nhịp chân ×0,55..1,2) :597 | o.move = P.moving :615; lộn khi tệp thiếu "ne" :604; lướt dashT>0 (×2 tốc) :605; chạy-đánh CHAY_DANH='than' :611 | P.moving=false / trạng thái khác | đang dùng | — |
| em-be-hunter-lau.sprite.json | tele | 2 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 10.0 fps | không | đứng ở khung cuối (u=0,99), không chạy theo giay | giữ nút lấy đà mà KHÔNG có hàng đòn atk_<vk> :608 | thả nút | gần như không dùng (giữ nút đã có hàng atk_<vk>) | giay=0.4 bị bỏ qua |
| em-be-hunter-lau.sprite.json | atk | 3 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | theo P.atkDur (0,3/0,3/0,46 kiếm…), KHÔNG theo giay | o.atk>=0 khi không có hàng atk_<vk> (DON_VK tắt, thân bộ không có tệp đòn, vũ khí "fist") :612; chiêu/chưởng khi thiếu "cast" :606-607 | P.atkT<=0 | dự phòng (chỉ khi ?donvk=0 hoặc tay không "fist") | giay=0.4 bị bỏ qua |
| em-be-hunter-lau.sprite.json | hit | 4 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.2 s ≈ 20.0 fps | không | u = 1 - hurtT/0,2 → 0,2 s, KHÔNG theo giay | P.hurtT>0 (0,2 s) và không đánh/lộn/… :614 | hurtT<=0 | đang dùng | giay=0.2 bị bỏ qua |
| em-be-hunter-lau.sprite.json | die | 5 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | không | u = deadT / giay(die) → đúng giay | P.dead :603 | không kết thúc (đứng ở khung cuối) | đang dùng | — |
| em-be-hunter-lau.sprite.json | ne | 6 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | u = 1 - dodgeT/0,27 → 0,27 s, KHÔNG theo giay | o.dodge>=0 (dodgeT 0,27 s) :604 | dodgeT<=0 | đang dùng | giay=0.4 bị bỏ qua |
| em-be-hunter-lau-don.sprite.json | atk_sword | 0 (ghép xuống dưới: hàng 7) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | khungDon: combo×2 + (u>=0,4) — 2 khung/nhát theo P.atkDur, KHÔNG theo giay; giữ nút: khung 4 :594 | o.atk>=0, vũ khí kiếm, G.DON_VK :601,612 | P.atkT<=0 | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-hunter-lau-don.sprite.json | atk_bow | 1 (ghép xuống dưới: hàng 8) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_bow theo u, KHÔNG theo giay | o.atk>=0, cung :612; giữ nút: khung 0..2 theo charge :594,608 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-hunter-lau-don.sprite.json | atk_spear | 2 (ghép xuống dưới: hàng 9) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_spear theo u, KHÔNG theo giay | o.atk>=0, giáo (cả "Quét vòng") :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur); Quét vòng (pose 3) cũng phát hàng đâm |
| em-be-hunter-lau-don.sprite.json | atk_hammer | 3 (ghép xuống dưới: hàng 10) | 6 | 48×48 (ảnh ×2) | 0.55 s ≈ 10.9 fps | không (themDon ép lap:false) | MOC_DON.atk_hammer (khung "nện" 3 ở u=0,45, đòn chạm búa ở 0,35) | o.atk>=0, búa :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.55 bị bỏ qua (khungDon theo P.atkDur); khung nện (3) ở u=0,45 nhưng búa chạm ở u=0,35 (moves.js:74) — đo: chạm lúc khung 1 |
| em-be-hunter-lau-don.sprite.json | cast | 4 (ghép xuống dưới: hàng 11) | 6 | 48×48 (ảnh ×2) | 0.4 s ≈ 15.0 fps | không (themDon ép lap:false) | MOC_DON.cast theo u, KHÔNG theo giay | P.specT>0 (đòn Đặc biệt 0,35 s) :606; P.castT>0 (chưởng 0,4 s) :607 | specT/castT<=0 | đang dùng (G.DON_VK) | giay=0.4 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-healer.sprite.json | idle | 0 | 6 | 48×48 (ảnh ×2 = 96×96) | 1 s ≈ 6.0 fps | có | lặp theo P.t: giay/so mỗi khung (khungLap :167) | mặc định (không trạng thái nào khác) :616 | khi có trạng thái ưu tiên hơn | đang dùng | — |
| em-be-healer.sprite.json | move | 1 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.65 s ≈ 12.3 fps | có | lặp theo P.chayT (nhịp chân ×0,55..1,2) :597 | o.move = P.moving :615; lộn khi tệp thiếu "ne" :604; lướt dashT>0 (×2 tốc) :605; chạy-đánh CHAY_DANH='than' :611 | P.moving=false / trạng thái khác | đang dùng | — |
| em-be-healer.sprite.json | tele | 2 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 10.0 fps | không | đứng ở khung cuối (u=0,99), không chạy theo giay | giữ nút lấy đà mà KHÔNG có hàng đòn atk_<vk> :608 | thả nút | gần như không dùng (giữ nút đã có hàng atk_<vk>) | giay=0.4 bị bỏ qua |
| em-be-healer.sprite.json | atk | 3 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | theo P.atkDur (0,3/0,3/0,46 kiếm…), KHÔNG theo giay | o.atk>=0 khi không có hàng atk_<vk> (DON_VK tắt, thân bộ không có tệp đòn, vũ khí "fist") :612; chiêu/chưởng khi thiếu "cast" :606-607 | P.atkT<=0 | dự phòng (chỉ khi ?donvk=0 hoặc tay không "fist") | giay=0.4 bị bỏ qua |
| em-be-healer.sprite.json | hit | 4 | 3 | 48×48 (ảnh ×2 = 96×96) | 0.2 s ≈ 15.0 fps | không | u = 1 - hurtT/0,2 → 0,2 s, KHÔNG theo giay | P.hurtT>0 (0,2 s) và không đánh/lộn/… :614 | hurtT<=0 | đang dùng | giay=0.2 bị bỏ qua |
| em-be-healer.sprite.json | die | 5 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | không | u = deadT / giay(die) → đúng giay | P.dead :603 | không kết thúc (đứng ở khung cuối) | đang dùng | — |
| em-be-healer.sprite.json | ne | 6 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | u = 1 - dodgeT/0,27 → 0,27 s, KHÔNG theo giay | o.dodge>=0 (dodgeT 0,27 s) :604 | dodgeT<=0 | đang dùng | giay=0.4 bị bỏ qua |
| em-be-healer-don.sprite.json | atk_sword | 0 (ghép xuống dưới: hàng 7) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | khungDon: combo×2 + (u>=0,4) — 2 khung/nhát theo P.atkDur, KHÔNG theo giay; giữ nút: khung 4 :594 | o.atk>=0, vũ khí kiếm, G.DON_VK :601,612 | P.atkT<=0 | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-healer-don.sprite.json | atk_bow | 1 (ghép xuống dưới: hàng 8) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_bow theo u, KHÔNG theo giay | o.atk>=0, cung :612; giữ nút: khung 0..2 theo charge :594,608 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-healer-don.sprite.json | atk_spear | 2 (ghép xuống dưới: hàng 9) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_spear theo u, KHÔNG theo giay | o.atk>=0, giáo (cả "Quét vòng") :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur); Quét vòng (pose 3) cũng phát hàng đâm |
| em-be-healer-don.sprite.json | atk_hammer | 3 (ghép xuống dưới: hàng 10) | 6 | 48×48 (ảnh ×2) | 0.55 s ≈ 10.9 fps | không (themDon ép lap:false) | MOC_DON.atk_hammer (khung "nện" 3 ở u=0,45, đòn chạm búa ở 0,35) | o.atk>=0, búa :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.55 bị bỏ qua (khungDon theo P.atkDur); khung nện (3) ở u=0,45 nhưng búa chạm ở u=0,35 (moves.js:74) — đo: chạm lúc khung 1 |
| em-be-healer-don.sprite.json | cast | 4 (ghép xuống dưới: hàng 11) | 6 | 48×48 (ảnh ×2) | 0.4 s ≈ 15.0 fps | không (themDon ép lap:false) | MOC_DON.cast theo u, KHÔNG theo giay | P.specT>0 (đòn Đặc biệt 0,35 s) :606; P.castT>0 (chưởng 0,4 s) :607 | specT/castT<=0 | đang dùng (G.DON_VK) | giay=0.4 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-healer-rung.sprite.json | idle | 0 | 6 | 48×48 (ảnh ×2 = 96×96) | 1 s ≈ 6.0 fps | có | lặp theo P.t: giay/so mỗi khung (khungLap :167) | mặc định (không trạng thái nào khác) :616 | khi có trạng thái ưu tiên hơn | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | — |
| em-be-healer-rung.sprite.json | move | 1 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 10.0 fps | có | lặp theo P.chayT (nhịp chân ×0,55..1,2) :597 | o.move = P.moving :615; lộn khi tệp thiếu "ne" :604; lướt dashT>0 (×2 tốc) :605; chạy-đánh CHAY_DANH='than' :611 | P.moving=false / trạng thái khác | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | — |
| em-be-healer-rung.sprite.json | tele | 2 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 10.0 fps | không | đứng ở khung cuối (u=0,99), không chạy theo giay | giữ nút lấy đà mà KHÔNG có hàng đòn atk_<vk> :608 | thả nút | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | giay=0.4 bị bỏ qua |
| em-be-healer-rung.sprite.json | atk | 3 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | theo P.atkDur (0,3/0,3/0,46 kiếm…), KHÔNG theo giay | o.atk>=0 khi không có hàng atk_<vk> (DON_VK tắt, thân bộ không có tệp đòn, vũ khí "fist") :612; chiêu/chưởng khi thiếu "cast" :606-607 | P.atkT<=0 | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | giay=0.4 bị bỏ qua |
| em-be-healer-rung.sprite.json | hit | 4 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.2 s ≈ 20.0 fps | không | u = 1 - hurtT/0,2 → 0,2 s, KHÔNG theo giay | P.hurtT>0 (0,2 s) và không đánh/lộn/… :614 | hurtT<=0 | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | giay=0.2 bị bỏ qua |
| em-be-healer-rung.sprite.json | die | 5 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | không | u = deadT / giay(die) → đúng giay | P.dead :603 | không kết thúc (đứng ở khung cuối) | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | — |
| em-be-healer-rung.sprite.json | ne | 6 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | u = 1 - dodgeT/0,27 → 0,27 s, KHÔNG theo giay | o.dodge>=0 (dodgeT 0,27 s) :604 | dodgeT<=0 | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | giay=0.4 bị bỏ qua |
| em-be-healer-bien.sprite.json | idle | 0 | 6 | 48×48 (ảnh ×2 = 96×96) | 1 s ≈ 6.0 fps | có | lặp theo P.t: giay/so mỗi khung (khungLap :167) | mặc định (không trạng thái nào khác) :616 | khi có trạng thái ưu tiên hơn | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | — |
| em-be-healer-bien.sprite.json | move | 1 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 10.0 fps | có | lặp theo P.chayT (nhịp chân ×0,55..1,2) :597 | o.move = P.moving :615; lộn khi tệp thiếu "ne" :604; lướt dashT>0 (×2 tốc) :605; chạy-đánh CHAY_DANH='than' :611 | P.moving=false / trạng thái khác | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | — |
| em-be-healer-bien.sprite.json | tele | 2 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 10.0 fps | không | đứng ở khung cuối (u=0,99), không chạy theo giay | giữ nút lấy đà mà KHÔNG có hàng đòn atk_<vk> :608 | thả nút | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | giay=0.4 bị bỏ qua |
| em-be-healer-bien.sprite.json | atk | 3 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | theo P.atkDur (0,3/0,3/0,46 kiếm…), KHÔNG theo giay | o.atk>=0 khi không có hàng atk_<vk> (DON_VK tắt, thân bộ không có tệp đòn, vũ khí "fist") :612; chiêu/chưởng khi thiếu "cast" :606-607 | P.atkT<=0 | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | giay=0.4 bị bỏ qua |
| em-be-healer-bien.sprite.json | hit | 4 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.2 s ≈ 20.0 fps | không | u = 1 - hurtT/0,2 → 0,2 s, KHÔNG theo giay | P.hurtT>0 (0,2 s) và không đánh/lộn/… :614 | hurtT<=0 | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | giay=0.2 bị bỏ qua |
| em-be-healer-bien.sprite.json | die | 5 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | không | u = deadT / giay(die) → đúng giay | P.dead :603 | không kết thúc (đứng ở khung cuối) | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | — |
| em-be-healer-bien.sprite.json | ne | 6 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | u = 1 - dodgeT/0,27 → 0,27 s, KHÔNG theo giay | o.dodge>=0 (dodgeT 0,27 s) :604 | dodgeT<=0 | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | giay=0.4 bị bỏ qua |
| em-be-healer-lau.sprite.json | idle | 0 | 6 | 48×48 (ảnh ×2 = 96×96) | 1 s ≈ 6.0 fps | có | lặp theo P.t: giay/so mỗi khung (khungLap :167) | mặc định (không trạng thái nào khác) :616 | khi có trạng thái ưu tiên hơn | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | — |
| em-be-healer-lau.sprite.json | move | 1 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 10.0 fps | có | lặp theo P.chayT (nhịp chân ×0,55..1,2) :597 | o.move = P.moving :615; lộn khi tệp thiếu "ne" :604; lướt dashT>0 (×2 tốc) :605; chạy-đánh CHAY_DANH='than' :611 | P.moving=false / trạng thái khác | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | — |
| em-be-healer-lau.sprite.json | tele | 2 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 10.0 fps | không | đứng ở khung cuối (u=0,99), không chạy theo giay | giữ nút lấy đà mà KHÔNG có hàng đòn atk_<vk> :608 | thả nút | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | giay=0.4 bị bỏ qua |
| em-be-healer-lau.sprite.json | atk | 3 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | theo P.atkDur (0,3/0,3/0,46 kiếm…), KHÔNG theo giay | o.atk>=0 khi không có hàng atk_<vk> (DON_VK tắt, thân bộ không có tệp đòn, vũ khí "fist") :612; chiêu/chưởng khi thiếu "cast" :606-607 | P.atkT<=0 | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | giay=0.4 bị bỏ qua |
| em-be-healer-lau.sprite.json | hit | 4 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.2 s ≈ 20.0 fps | không | u = 1 - hurtT/0,2 → 0,2 s, KHÔNG theo giay | P.hurtT>0 (0,2 s) và không đánh/lộn/… :614 | hurtT<=0 | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | giay=0.2 bị bỏ qua |
| em-be-healer-lau.sprite.json | die | 5 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | không | u = deadT / giay(die) → đúng giay | P.dead :603 | không kết thúc (đứng ở khung cuối) | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | — |
| em-be-healer-lau.sprite.json | ne | 6 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | u = 1 - dodgeT/0,27 → 0,27 s, KHÔNG theo giay | o.dodge>=0 (dodgeT 0,27 s) :604 | dodgeT<=0 | KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc) | giay=0.4 bị bỏ qua |
| em-be-wrestler.sprite.json | idle | 0 | 6 | 48×48 (ảnh ×2 = 96×96) | 1 s ≈ 6.0 fps | có | lặp theo P.t: giay/so mỗi khung (khungLap :167) | mặc định (không trạng thái nào khác) :616 | khi có trạng thái ưu tiên hơn | đang dùng | — |
| em-be-wrestler.sprite.json | move | 1 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | có | lặp theo P.chayT (nhịp chân ×0,55..1,2) :597 | o.move = P.moving :615; lộn khi tệp thiếu "ne" :604; lướt dashT>0 (×2 tốc) :605; chạy-đánh CHAY_DANH='than' :611 | P.moving=false / trạng thái khác | đang dùng | — |
| em-be-wrestler.sprite.json | tele | 2 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 10.0 fps | không | đứng ở khung cuối (u=0,99), không chạy theo giay | giữ nút lấy đà mà KHÔNG có hàng đòn atk_<vk> :608 | thả nút | gần như không dùng (giữ nút đã có hàng atk_<vk>) | giay=0.4 bị bỏ qua |
| em-be-wrestler.sprite.json | atk | 3 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | theo P.atkDur (0,3/0,3/0,46 kiếm…), KHÔNG theo giay | o.atk>=0 khi không có hàng atk_<vk> (DON_VK tắt, thân bộ không có tệp đòn, vũ khí "fist") :612; chiêu/chưởng khi thiếu "cast" :606-607 | P.atkT<=0 | dự phòng (chỉ khi ?donvk=0 hoặc tay không "fist") | giay=0.4 bị bỏ qua |
| em-be-wrestler.sprite.json | hit | 4 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.2 s ≈ 20.0 fps | không | u = 1 - hurtT/0,2 → 0,2 s, KHÔNG theo giay | P.hurtT>0 (0,2 s) và không đánh/lộn/… :614 | hurtT<=0 | đang dùng | giay=0.2 bị bỏ qua |
| em-be-wrestler.sprite.json | die | 5 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | không | u = deadT / giay(die) → đúng giay | P.dead :603 | không kết thúc (đứng ở khung cuối) | đang dùng | — |
| em-be-wrestler.sprite.json | ne | 6 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | u = 1 - dodgeT/0,27 → 0,27 s, KHÔNG theo giay | o.dodge>=0 (dodgeT 0,27 s) :604 | dodgeT<=0 | đang dùng | giay=0.4 bị bỏ qua |
| em-be-wrestler-don.sprite.json | atk_sword | 0 (ghép xuống dưới: hàng 7) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | khungDon: combo×2 + (u>=0,4) — 2 khung/nhát theo P.atkDur, KHÔNG theo giay; giữ nút: khung 4 :594 | o.atk>=0, vũ khí kiếm, G.DON_VK :601,612 | P.atkT<=0 | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-wrestler-don.sprite.json | atk_bow | 1 (ghép xuống dưới: hàng 8) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_bow theo u, KHÔNG theo giay | o.atk>=0, cung :612; giữ nút: khung 0..2 theo charge :594,608 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-wrestler-don.sprite.json | atk_spear | 2 (ghép xuống dưới: hàng 9) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_spear theo u, KHÔNG theo giay | o.atk>=0, giáo (cả "Quét vòng") :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur); Quét vòng (pose 3) cũng phát hàng đâm |
| em-be-wrestler-don.sprite.json | atk_hammer | 3 (ghép xuống dưới: hàng 10) | 6 | 48×48 (ảnh ×2) | 0.55 s ≈ 10.9 fps | không (themDon ép lap:false) | MOC_DON.atk_hammer (khung "nện" 3 ở u=0,45, đòn chạm búa ở 0,35) | o.atk>=0, búa :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.55 bị bỏ qua (khungDon theo P.atkDur); khung nện (3) ở u=0,45 nhưng búa chạm ở u=0,35 (moves.js:74) — đo: chạm lúc khung 1 |
| em-be-wrestler-don.sprite.json | cast | 4 (ghép xuống dưới: hàng 11) | 6 | 48×48 (ảnh ×2) | 0.4 s ≈ 15.0 fps | không (themDon ép lap:false) | MOC_DON.cast theo u, KHÔNG theo giay | P.specT>0 (đòn Đặc biệt 0,35 s) :606; P.castT>0 (chưởng 0,4 s) :607 | specT/castT<=0 | đang dùng (G.DON_VK) | giay=0.4 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-wrestler-rung.sprite.json | idle | 0 | 6 | 48×48 (ảnh ×2 = 96×96) | 1 s ≈ 6.0 fps | có | lặp theo P.t: giay/so mỗi khung (khungLap :167) | mặc định (không trạng thái nào khác) :616 | khi có trạng thái ưu tiên hơn | đang dùng | — |
| em-be-wrestler-rung.sprite.json | move | 1 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 10.0 fps | có | lặp theo P.chayT (nhịp chân ×0,55..1,2) :597 | o.move = P.moving :615; lộn khi tệp thiếu "ne" :604; lướt dashT>0 (×2 tốc) :605; chạy-đánh CHAY_DANH='than' :611 | P.moving=false / trạng thái khác | đang dùng | — |
| em-be-wrestler-rung.sprite.json | tele | 2 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 10.0 fps | không | đứng ở khung cuối (u=0,99), không chạy theo giay | giữ nút lấy đà mà KHÔNG có hàng đòn atk_<vk> :608 | thả nút | gần như không dùng (giữ nút đã có hàng atk_<vk>) | giay=0.4 bị bỏ qua |
| em-be-wrestler-rung.sprite.json | atk | 3 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | theo P.atkDur (0,3/0,3/0,46 kiếm…), KHÔNG theo giay | o.atk>=0 khi không có hàng atk_<vk> (DON_VK tắt, thân bộ không có tệp đòn, vũ khí "fist") :612; chiêu/chưởng khi thiếu "cast" :606-607 | P.atkT<=0 | dự phòng (chỉ khi ?donvk=0 hoặc tay không "fist") | giay=0.4 bị bỏ qua |
| em-be-wrestler-rung.sprite.json | hit | 4 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.2 s ≈ 20.0 fps | không | u = 1 - hurtT/0,2 → 0,2 s, KHÔNG theo giay | P.hurtT>0 (0,2 s) và không đánh/lộn/… :614 | hurtT<=0 | đang dùng | giay=0.2 bị bỏ qua |
| em-be-wrestler-rung.sprite.json | die | 5 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | không | u = deadT / giay(die) → đúng giay | P.dead :603 | không kết thúc (đứng ở khung cuối) | đang dùng | — |
| em-be-wrestler-rung.sprite.json | ne | 6 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | u = 1 - dodgeT/0,27 → 0,27 s, KHÔNG theo giay | o.dodge>=0 (dodgeT 0,27 s) :604 | dodgeT<=0 | đang dùng | giay=0.4 bị bỏ qua |
| em-be-wrestler-rung-don.sprite.json | atk_sword | 0 (ghép xuống dưới: hàng 7) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | khungDon: combo×2 + (u>=0,4) — 2 khung/nhát theo P.atkDur, KHÔNG theo giay; giữ nút: khung 4 :594 | o.atk>=0, vũ khí kiếm, G.DON_VK :601,612 | P.atkT<=0 | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-wrestler-rung-don.sprite.json | atk_bow | 1 (ghép xuống dưới: hàng 8) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_bow theo u, KHÔNG theo giay | o.atk>=0, cung :612; giữ nút: khung 0..2 theo charge :594,608 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-wrestler-rung-don.sprite.json | atk_spear | 2 (ghép xuống dưới: hàng 9) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_spear theo u, KHÔNG theo giay | o.atk>=0, giáo (cả "Quét vòng") :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur); Quét vòng (pose 3) cũng phát hàng đâm |
| em-be-wrestler-rung-don.sprite.json | atk_hammer | 3 (ghép xuống dưới: hàng 10) | 6 | 48×48 (ảnh ×2) | 0.55 s ≈ 10.9 fps | không (themDon ép lap:false) | MOC_DON.atk_hammer (khung "nện" 3 ở u=0,45, đòn chạm búa ở 0,35) | o.atk>=0, búa :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.55 bị bỏ qua (khungDon theo P.atkDur); khung nện (3) ở u=0,45 nhưng búa chạm ở u=0,35 (moves.js:74) — đo: chạm lúc khung 1 |
| em-be-wrestler-rung-don.sprite.json | cast | 4 (ghép xuống dưới: hàng 11) | 6 | 48×48 (ảnh ×2) | 0.4 s ≈ 15.0 fps | không (themDon ép lap:false) | MOC_DON.cast theo u, KHÔNG theo giay | P.specT>0 (đòn Đặc biệt 0,35 s) :606; P.castT>0 (chưởng 0,4 s) :607 | specT/castT<=0 | đang dùng (G.DON_VK) | giay=0.4 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-wrestler-bien.sprite.json | idle | 0 | 6 | 48×48 (ảnh ×2 = 96×96) | 1 s ≈ 6.0 fps | có | lặp theo P.t: giay/so mỗi khung (khungLap :167) | mặc định (không trạng thái nào khác) :616 | khi có trạng thái ưu tiên hơn | đang dùng | — |
| em-be-wrestler-bien.sprite.json | move | 1 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 10.0 fps | có | lặp theo P.chayT (nhịp chân ×0,55..1,2) :597 | o.move = P.moving :615; lộn khi tệp thiếu "ne" :604; lướt dashT>0 (×2 tốc) :605; chạy-đánh CHAY_DANH='than' :611 | P.moving=false / trạng thái khác | đang dùng | — |
| em-be-wrestler-bien.sprite.json | tele | 2 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 10.0 fps | không | đứng ở khung cuối (u=0,99), không chạy theo giay | giữ nút lấy đà mà KHÔNG có hàng đòn atk_<vk> :608 | thả nút | gần như không dùng (giữ nút đã có hàng atk_<vk>) | giay=0.4 bị bỏ qua |
| em-be-wrestler-bien.sprite.json | atk | 3 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | theo P.atkDur (0,3/0,3/0,46 kiếm…), KHÔNG theo giay | o.atk>=0 khi không có hàng atk_<vk> (DON_VK tắt, thân bộ không có tệp đòn, vũ khí "fist") :612; chiêu/chưởng khi thiếu "cast" :606-607 | P.atkT<=0 | dự phòng (chỉ khi ?donvk=0 hoặc tay không "fist") | trường khung=[0, 2, 3, 4, 5] cham=4 (bỏ khung trùng) — chỉ hiệu lực khi hàng này được phát; giay=0.4 bị bỏ qua |
| em-be-wrestler-bien.sprite.json | hit | 4 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.2 s ≈ 20.0 fps | không | u = 1 - hurtT/0,2 → 0,2 s, KHÔNG theo giay | P.hurtT>0 (0,2 s) và không đánh/lộn/… :614 | hurtT<=0 | đang dùng | giay=0.2 bị bỏ qua |
| em-be-wrestler-bien.sprite.json | die | 5 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | không | u = deadT / giay(die) → đúng giay | P.dead :603 | không kết thúc (đứng ở khung cuối) | đang dùng | — |
| em-be-wrestler-bien.sprite.json | ne | 6 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | u = 1 - dodgeT/0,27 → 0,27 s, KHÔNG theo giay | o.dodge>=0 (dodgeT 0,27 s) :604 | dodgeT<=0 | đang dùng | giay=0.4 bị bỏ qua |
| em-be-wrestler-bien-don.sprite.json | atk_sword | 0 (ghép xuống dưới: hàng 7) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | khungDon: combo×2 + (u>=0,4) — 2 khung/nhát theo P.atkDur, KHÔNG theo giay; giữ nút: khung 4 :594 | o.atk>=0, vũ khí kiếm, G.DON_VK :601,612 | P.atkT<=0 | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-wrestler-bien-don.sprite.json | atk_bow | 1 (ghép xuống dưới: hàng 8) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_bow theo u, KHÔNG theo giay | o.atk>=0, cung :612; giữ nút: khung 0..2 theo charge :594,608 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-wrestler-bien-don.sprite.json | atk_spear | 2 (ghép xuống dưới: hàng 9) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_spear theo u, KHÔNG theo giay | o.atk>=0, giáo (cả "Quét vòng") :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur); Quét vòng (pose 3) cũng phát hàng đâm |
| em-be-wrestler-bien-don.sprite.json | atk_hammer | 3 (ghép xuống dưới: hàng 10) | 6 | 48×48 (ảnh ×2) | 0.55 s ≈ 10.9 fps | không (themDon ép lap:false) | MOC_DON.atk_hammer (khung "nện" 3 ở u=0,45, đòn chạm búa ở 0,35) | o.atk>=0, búa :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.55 bị bỏ qua (khungDon theo P.atkDur); khung nện (3) ở u=0,45 nhưng búa chạm ở u=0,35 (moves.js:74) — đo: chạm lúc khung 1 |
| em-be-wrestler-bien-don.sprite.json | cast | 4 (ghép xuống dưới: hàng 11) | 6 | 48×48 (ảnh ×2) | 0.4 s ≈ 15.0 fps | không (themDon ép lap:false) | MOC_DON.cast theo u, KHÔNG theo giay | P.specT>0 (đòn Đặc biệt 0,35 s) :606; P.castT>0 (chưởng 0,4 s) :607 | specT/castT<=0 | đang dùng (G.DON_VK) | giay=0.4 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-wrestler-lau.sprite.json | idle | 0 | 6 | 48×48 (ảnh ×2 = 96×96) | 1 s ≈ 6.0 fps | có | lặp theo P.t: giay/so mỗi khung (khungLap :167) | mặc định (không trạng thái nào khác) :616 | khi có trạng thái ưu tiên hơn | đang dùng | — |
| em-be-wrestler-lau.sprite.json | move | 1 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 10.0 fps | có | lặp theo P.chayT (nhịp chân ×0,55..1,2) :597 | o.move = P.moving :615; lộn khi tệp thiếu "ne" :604; lướt dashT>0 (×2 tốc) :605; chạy-đánh CHAY_DANH='than' :611 | P.moving=false / trạng thái khác | đang dùng | — |
| em-be-wrestler-lau.sprite.json | tele | 2 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 10.0 fps | không | đứng ở khung cuối (u=0,99), không chạy theo giay | giữ nút lấy đà mà KHÔNG có hàng đòn atk_<vk> :608 | thả nút | gần như không dùng (giữ nút đã có hàng atk_<vk>) | giay=0.4 bị bỏ qua |
| em-be-wrestler-lau.sprite.json | atk | 3 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | theo P.atkDur (0,3/0,3/0,46 kiếm…), KHÔNG theo giay | o.atk>=0 khi không có hàng atk_<vk> (DON_VK tắt, thân bộ không có tệp đòn, vũ khí "fist") :612; chiêu/chưởng khi thiếu "cast" :606-607 | P.atkT<=0 | dự phòng (chỉ khi ?donvk=0 hoặc tay không "fist") | giay=0.4 bị bỏ qua |
| em-be-wrestler-lau.sprite.json | hit | 4 | 4 | 48×48 (ảnh ×2 = 96×96) | 0.2 s ≈ 20.0 fps | không | u = 1 - hurtT/0,2 → 0,2 s, KHÔNG theo giay | P.hurtT>0 (0,2 s) và không đánh/lộn/… :614 | hurtT<=0 | đang dùng | giay=0.2 bị bỏ qua |
| em-be-wrestler-lau.sprite.json | die | 5 | 8 | 48×48 (ảnh ×2 = 96×96) | 0.6 s ≈ 13.3 fps | không | u = deadT / giay(die) → đúng giay | P.dead :603 | không kết thúc (đứng ở khung cuối) | đang dùng | — |
| em-be-wrestler-lau.sprite.json | ne | 6 | 6 | 48×48 (ảnh ×2 = 96×96) | 0.4 s ≈ 15.0 fps | không | u = 1 - dodgeT/0,27 → 0,27 s, KHÔNG theo giay | o.dodge>=0 (dodgeT 0,27 s) :604 | dodgeT<=0 | đang dùng | giay=0.4 bị bỏ qua |
| em-be-wrestler-lau-don.sprite.json | atk_sword | 0 (ghép xuống dưới: hàng 7) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | khungDon: combo×2 + (u>=0,4) — 2 khung/nhát theo P.atkDur, KHÔNG theo giay; giữ nút: khung 4 :594 | o.atk>=0, vũ khí kiếm, G.DON_VK :601,612 | P.atkT<=0 | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-wrestler-lau-don.sprite.json | atk_bow | 1 (ghép xuống dưới: hàng 8) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_bow theo u, KHÔNG theo giay | o.atk>=0, cung :612; giữ nút: khung 0..2 theo charge :594,608 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur) |
| em-be-wrestler-lau-don.sprite.json | atk_spear | 2 (ghép xuống dưới: hàng 9) | 6 | 48×48 (ảnh ×2) | 0.45 s ≈ 13.3 fps | không (themDon ép lap:false) | MOC_DON.atk_spear theo u, KHÔNG theo giay | o.atk>=0, giáo (cả "Quét vòng") :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.45 bị bỏ qua (khungDon theo P.atkDur); Quét vòng (pose 3) cũng phát hàng đâm |
| em-be-wrestler-lau-don.sprite.json | atk_hammer | 3 (ghép xuống dưới: hàng 10) | 6 | 48×48 (ảnh ×2) | 0.55 s ≈ 10.9 fps | không (themDon ép lap:false) | MOC_DON.atk_hammer (khung "nện" 3 ở u=0,45, đòn chạm búa ở 0,35) | o.atk>=0, búa :612; giữ nút: khung 0/1 :594 | P.atkT<=0 / thả nút | đang dùng (G.DON_VK) | giay=0.55 bị bỏ qua (khungDon theo P.atkDur); khung nện (3) ở u=0,45 nhưng búa chạm ở u=0,35 (moves.js:74) — đo: chạm lúc khung 1 |
| em-be-wrestler-lau-don.sprite.json | cast | 4 (ghép xuống dưới: hàng 11) | 6 | 48×48 (ảnh ×2) | 0.4 s ≈ 15.0 fps | không (themDon ép lap:false) | MOC_DON.cast theo u, KHÔNG theo giay | P.specT>0 (đòn Đặc biệt 0,35 s) :606; P.castT>0 (chưởng 0,4 s) :607 | specT/castT<=0 | đang dùng (G.DON_VK) | giay=0.4 bị bỏ qua (khungDon theo P.atkDur) |

---

## 5. Đo thật bằng Playwright (khung ĐƯỢC VẼ theo từng tick)

### 5.1 Cách đo

- Script tạm: `scratchpad/pl2/do_khung.py`, `do_khung2.py`, `do_cast.py` (không nằm trong repo). Mở `file:///home/claude/new-project/game/index.html`, nạp `tests/bot.js`, `tests/setup.js`, `tests/au_lib.js`, rồi `G.spriteCustom.add(<từng tệp em-be-*.json>)`, chờ `donMa` của 4 thân gốc.
- Bọc tạm `G.art.hero` (đánh dấu lần gọi có `o.p === P`, tức thân chính, loại bóng mờ dùng bản sao `P`) và `G.spriteCustom.veKhung` (ghi `sp.ma`, `ten`, `i`, `hang` của lần vẽ thân em bé đầu tiên trong lần gọi đó). Mỗi tick: `AU.run(1, true)` (một `G.tick` 1/60 s) rồi `G.ui.begin(); G.scene.draw()`.
- Cùng tick ghi thêm `SC.chonEmBe` (khung chọn) và `G.tinhLinh.frame(o)` (khung xương code). **Kết quả: 0 tick lệch giữa khung chọn và khung vẽ** ở mọi kịch bản; 0 `pageerror`.
- Lưu ý phương pháp: lần đầu bắt "lần vẽ em bé đầu tiên" của cả khung thì bắt nhầm **bóng mờ** của cú lộn (vẽ trước thân chính, mang trạng thái cũ) → phải lọc theo `o.p === P`.

### 5.2 Đứng / chạy / đánh kiếm — 4 em bé × (gốc + 3 bộ)

`dung` = không bấm; `chay` = cần sang phải; `danh` = giữ nút Đánh (combo 3 nhát kiếm liên tục); `chaydanh` = chạy + giữ Đánh; `ne` = bấm Né 1 lần; `trung` = đặt `P.hurtT = 0,2`.

| Em bé · thân | Kịch bản | Thân thật được vẽ | Chuỗi khung VẼ thật (khung×số tick 60 Hz) | Tick nhún −1 px |
|---|---|---|---|---|
| smith · goc | dung (90 tick) | em-be-smith | idle:0×9 idle:1×10 idle:2×10 idle:3×10 idle:4×10 idle:5×10 idle:0×10 idle:1×10 idle:2×10 idle:3×1 | 0 |
| smith · goc | chay (90 tick) | em-be-smith | move:0×4 move:1×5 move:2×5 move:3×5 move:4×5 move:5×5 move:6×5 move:7×4 move:0×5 move:1×5 move:2×5 move:3×5 move:4×5 move:5×5 move:6×5 move:7×4 move:0×5 move:1×5 move:2×3 | 0 |
| smith · goc | danh (100 tick) | em-be-smith | atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×11 atk_sword:4×12 atk_sword:5×16 atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×7 | 0 |
| smith · goc | chaydanh (80 tick) | em-be-smith | move:0×5 move:1×6 move:2×6 move:3×5 move:4×6 move:5×6 move:6×5 move:7×6 move:0×6 move:1×5 move:2×6 move:3×6 move:4×5 move:5×6 move:6×1 | 0 |
| smith · goc | ne (24 tick) | em-be-smith | ne:0×3 ne:1×3 ne:2×3 ne:3×2 ne:4×3 ne:5×3 idle:1×2 idle:2×5 | 0 |
| smith · goc | trung (16 tick) | em-be-smith | hit:0×3 hit:1×3 hit:2×3 hit:3×3 idle:1×4 | 0 |
| smith · rung | dung (90 tick) | em-be-smith-rung | idle:0×9 idle:1×10 idle:2×10 idle:3×10 idle:4×10 idle:5×10 idle:0×10 idle:1×10 idle:2×10 idle:3×1 | 0 |
| smith · rung | chay (90 tick) | em-be-smith-rung | move:0×5 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×1 | 30 |
| smith · rung | danh (100 tick) | em-be-smith-rung | atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×11 atk_sword:4×12 atk_sword:5×16 atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×7 | 0 |
| smith · rung | chaydanh (80 tick) | em-be-smith-rung | move:0×6 move:1×7 move:2×7 move:3×7 move:4×7 move:5×7 move:0×7 move:1×7 move:2×7 move:3×7 move:4×7 move:5×4 | 28 |
| smith · bien | dung (90 tick) | em-be-smith-bien | idle:0×9 idle:1×10 idle:2×10 idle:3×10 idle:4×10 idle:5×10 idle:0×10 idle:1×10 idle:2×10 idle:3×1 | 0 |
| smith · bien | chay (90 tick) | em-be-smith-bien | move:0×5 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×1 | 30 |
| smith · bien | danh (100 tick) | em-be-smith-bien | atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×11 atk_sword:4×12 atk_sword:5×16 atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×7 | 0 |
| smith · bien | chaydanh (80 tick) | em-be-smith-bien | move:0×6 move:1×7 move:2×7 move:3×7 move:4×7 move:5×7 move:0×7 move:1×7 move:2×7 move:3×7 move:4×7 move:5×4 | 28 |
| smith · lau | dung (90 tick) | em-be-smith-lau | idle:0×9 idle:1×10 idle:2×10 idle:3×10 idle:4×10 idle:5×10 idle:0×10 idle:1×10 idle:2×10 idle:3×1 | 0 |
| smith · lau | chay (90 tick) | em-be-smith-lau | move:0×5 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×1 | 30 |
| smith · lau | danh (100 tick) | em-be-smith-lau | atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×11 atk_sword:4×12 atk_sword:5×16 atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×7 | 0 |
| smith · lau | chaydanh (80 tick) | em-be-smith-lau | move:0×6 move:1×7 move:2×7 move:3×7 move:4×7 move:5×7 move:0×7 move:1×7 move:2×7 move:3×7 move:4×7 move:5×4 | 28 |
| hunter · goc | dung (90 tick) | em-be-hunter | idle:0×9 idle:1×10 idle:2×10 idle:3×10 idle:4×10 idle:5×10 idle:0×10 idle:1×10 idle:2×10 idle:3×1 | 0 |
| hunter · goc | chay (90 tick) | em-be-hunter | move:0×4 move:1×4 move:2×5 move:3×4 move:4×5 move:5×4 move:6×5 move:7×4 move:0×5 move:1×4 move:2×5 move:3×4 move:4×5 move:5×4 move:6×5 move:7×4 move:0×5 move:1×4 move:2×5 move:3×4 move:4×1 | 0 |
| hunter · goc | danh (100 tick) | em-be-hunter | atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×11 atk_sword:4×12 atk_sword:5×16 atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×7 | 0 |
| hunter · goc | chaydanh (80 tick) | em-be-hunter | move:0×5 move:1×5 move:2×5 move:3×5 move:4×6 move:5×5 move:6×5 move:7×5 move:0×6 move:1×5 move:2×5 move:3×5 move:4×6 move:5×5 move:6×5 move:7×2 | 0 |
| hunter · goc | ne (24 tick) | em-be-hunter | ne:0×3 ne:1×3 ne:2×3 ne:3×2 ne:4×3 ne:5×3 idle:1×2 idle:2×5 | 0 |
| hunter · goc | trung (16 tick) | em-be-hunter | hit:0×3 hit:1×3 hit:2×3 hit:3×3 idle:1×4 | 0 |
| hunter · rung | dung (90 tick) | em-be-hunter-rung | idle:0×9 idle:1×10 idle:2×10 idle:3×10 idle:4×10 idle:5×10 idle:0×10 idle:1×10 idle:2×10 idle:3×1 | 0 |
| hunter · rung | chay (90 tick) | em-be-hunter-rung | move:0×5 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×1 | 30 |
| hunter · rung | danh (100 tick) | em-be-hunter-rung | atk:0×4 atk:1×3 atk:2×3 atk:3×3 atk:4×3 atk:5×3 atk:0×4 atk:1×3 atk:2×3 atk:3×3 atk:4×3 atk:5×3 atk:0×5 atk:1×5 atk:2×4 atk:3×5 atk:4×5 atk:5×4 atk:0×4 atk:1×3 atk:2×3 atk:3×3 atk:4×3 atk:5×3 atk:0×4 atk:1×3 atk:2×3 atk:3×3 atk:4×2 | 0 |
| hunter · rung | chaydanh (80 tick) | em-be-hunter-rung | move:0×6 move:1×7 move:2×7 move:3×7 move:4×7 move:5×7 move:0×7 move:1×7 move:2×7 move:3×7 move:4×7 move:5×4 | 28 |
| hunter · bien | dung (90 tick) | em-be-hunter-bien | idle:0×9 idle:1×10 idle:2×10 idle:3×10 idle:4×10 idle:5×10 idle:0×10 idle:1×10 idle:2×10 idle:3×1 | 0 |
| hunter · bien | chay (90 tick) | em-be-hunter-bien | move:0×5 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×1 | 30 |
| hunter · bien | danh (100 tick) | em-be-hunter-bien | atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×11 atk_sword:4×12 atk_sword:5×16 atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×7 | 0 |
| hunter · bien | chaydanh (80 tick) | em-be-hunter-bien | move:0×6 move:1×7 move:2×7 move:3×7 move:4×7 move:5×7 move:0×7 move:1×7 move:2×7 move:3×7 move:4×7 move:5×4 | 28 |
| hunter · lau | dung (90 tick) | em-be-hunter-lau | idle:0×9 idle:1×10 idle:2×10 idle:3×10 idle:4×10 idle:5×10 idle:0×10 idle:1×10 idle:2×10 idle:3×1 | 0 |
| hunter · lau | chay (90 tick) | em-be-hunter-lau | move:0×5 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×1 | 30 |
| hunter · lau | danh (100 tick) | em-be-hunter-lau | atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×11 atk_sword:4×12 atk_sword:5×16 atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×7 | 0 |
| hunter · lau | chaydanh (80 tick) | em-be-hunter-lau | move:0×6 move:1×7 move:2×7 move:3×7 move:4×7 move:5×7 move:0×7 move:1×7 move:2×7 move:3×7 move:4×7 move:5×4 | 28 |
| healer · goc | dung (90 tick) | em-be-healer | idle:0×9 idle:1×10 idle:2×10 idle:3×10 idle:4×10 idle:5×10 idle:0×10 idle:1×10 idle:2×10 idle:3×1 | 0 |
| healer · goc | chay (90 tick) | em-be-healer | move:0×4 move:1×5 move:2×5 move:3×5 move:4×5 move:5×5 move:6×5 move:7×4 move:0×5 move:1×5 move:2×5 move:3×5 move:4×5 move:5×5 move:6×5 move:7×4 move:0×5 move:1×5 move:2×3 | 0 |
| healer · goc | danh (100 tick) | em-be-healer | atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×11 atk_sword:4×12 atk_sword:5×16 atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×7 | 0 |
| healer · goc | chaydanh (80 tick) | em-be-healer | move:0×5 move:1×6 move:2×6 move:3×5 move:4×6 move:5×6 move:6×5 move:7×6 move:0×6 move:1×5 move:2×6 move:3×6 move:4×5 move:5×6 move:6×1 | 0 |
| healer · goc | ne (24 tick) | em-be-healer | ne:0×3 ne:1×3 ne:2×3 ne:3×2 ne:4×3 ne:5×3 idle:1×2 idle:2×5 | 0 |
| healer · goc | trung (16 tick) | em-be-healer | hit:0×4 hit:1×4 hit:2×4 idle:1×4 | 0 |
| healer · rung | dung (90 tick) | em-be-healer | idle:0×9 idle:1×10 idle:2×10 idle:3×10 idle:4×10 idle:5×10 idle:0×10 idle:1×10 idle:2×10 idle:3×1 | 0 |
| healer · rung | chay (90 tick) | em-be-healer | move:0×4 move:1×5 move:2×5 move:3×5 move:4×5 move:5×5 move:6×5 move:7×4 move:0×5 move:1×5 move:2×5 move:3×5 move:4×5 move:5×5 move:6×5 move:7×4 move:0×5 move:1×5 move:2×3 | 0 |
| healer · rung | danh (100 tick) | em-be-healer | atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×11 atk_sword:4×12 atk_sword:5×16 atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×7 | 0 |
| healer · rung | chaydanh (80 tick) | em-be-healer | move:0×5 move:1×6 move:2×6 move:3×5 move:4×6 move:5×6 move:6×5 move:7×6 move:0×6 move:1×5 move:2×6 move:3×6 move:4×5 move:5×6 move:6×1 | 0 |
| healer · bien | dung (90 tick) | em-be-healer | idle:0×9 idle:1×10 idle:2×10 idle:3×10 idle:4×10 idle:5×10 idle:0×10 idle:1×10 idle:2×10 idle:3×1 | 0 |
| healer · bien | chay (90 tick) | em-be-healer | move:0×4 move:1×5 move:2×5 move:3×5 move:4×5 move:5×5 move:6×5 move:7×4 move:0×5 move:1×5 move:2×5 move:3×5 move:4×5 move:5×5 move:6×5 move:7×4 move:0×5 move:1×5 move:2×3 | 0 |
| healer · bien | danh (100 tick) | em-be-healer | atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×11 atk_sword:4×12 atk_sword:5×16 atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×7 | 0 |
| healer · bien | chaydanh (80 tick) | em-be-healer | move:0×5 move:1×6 move:2×6 move:3×5 move:4×6 move:5×6 move:6×5 move:7×6 move:0×6 move:1×5 move:2×6 move:3×6 move:4×5 move:5×6 move:6×1 | 0 |
| healer · lau | dung (90 tick) | em-be-healer | idle:0×9 idle:1×10 idle:2×10 idle:3×10 idle:4×10 idle:5×10 idle:0×10 idle:1×10 idle:2×10 idle:3×1 | 0 |
| healer · lau | chay (90 tick) | em-be-healer | move:0×4 move:1×5 move:2×5 move:3×5 move:4×5 move:5×5 move:6×5 move:7×4 move:0×5 move:1×5 move:2×5 move:3×5 move:4×5 move:5×5 move:6×5 move:7×4 move:0×5 move:1×5 move:2×3 | 0 |
| healer · lau | danh (100 tick) | em-be-healer | atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×11 atk_sword:4×12 atk_sword:5×16 atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×7 | 0 |
| healer · lau | chaydanh (80 tick) | em-be-healer | move:0×5 move:1×6 move:2×6 move:3×5 move:4×6 move:5×6 move:6×5 move:7×6 move:0×6 move:1×5 move:2×6 move:3×6 move:4×5 move:5×6 move:6×1 | 0 |
| wrestler · goc | dung (90 tick) | em-be-wrestler | idle:0×9 idle:1×10 idle:2×10 idle:3×10 idle:4×10 idle:5×10 idle:0×10 idle:1×10 idle:2×10 idle:3×1 | 0 |
| wrestler · goc | chay (90 tick) | em-be-wrestler | move:0×4 move:1×4 move:2×5 move:3×4 move:4×5 move:5×4 move:6×5 move:7×4 move:0×5 move:1×4 move:2×5 move:3×4 move:4×5 move:5×4 move:6×5 move:7×4 move:0×5 move:1×4 move:2×5 move:3×4 move:4×1 | 0 |
| wrestler · goc | danh (100 tick) | em-be-wrestler | atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×11 atk_sword:4×12 atk_sword:5×16 atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×7 | 0 |
| wrestler · goc | chaydanh (80 tick) | em-be-wrestler | move:0×5 move:1×5 move:2×5 move:3×5 move:4×6 move:5×5 move:6×5 move:7×5 move:0×6 move:1×5 move:2×5 move:3×5 move:4×6 move:5×5 move:6×5 move:7×2 | 0 |
| wrestler · goc | ne (24 tick) | em-be-wrestler | ne:0×3 ne:1×3 ne:2×3 ne:3×2 ne:4×3 ne:5×3 idle:1×2 idle:2×5 | 0 |
| wrestler · goc | trung (16 tick) | em-be-wrestler | hit:0×3 hit:1×3 hit:2×3 hit:3×3 idle:1×4 | 0 |
| wrestler · rung | dung (90 tick) | em-be-wrestler-rung | idle:0×9 idle:1×10 idle:2×10 idle:3×10 idle:4×10 idle:5×10 idle:0×10 idle:1×10 idle:2×10 idle:3×1 | 0 |
| wrestler · rung | chay (90 tick) | em-be-wrestler-rung | move:0×5 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×1 | 30 |
| wrestler · rung | danh (100 tick) | em-be-wrestler-rung | atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×11 atk_sword:4×12 atk_sword:5×16 atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×7 | 0 |
| wrestler · rung | chaydanh (80 tick) | em-be-wrestler-rung | move:0×6 move:1×7 move:2×7 move:3×7 move:4×7 move:5×7 move:0×7 move:1×7 move:2×7 move:3×7 move:4×7 move:5×4 | 28 |
| wrestler · bien | dung (90 tick) | em-be-wrestler-bien | idle:0×9 idle:1×10 idle:2×10 idle:3×10 idle:4×10 idle:5×10 idle:0×10 idle:1×10 idle:2×10 idle:3×1 | 0 |
| wrestler · bien | chay (90 tick) | em-be-wrestler-bien | move:0×5 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×1 | 30 |
| wrestler · bien | danh (100 tick) | em-be-wrestler-bien | atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×11 atk_sword:4×12 atk_sword:5×16 atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×7 | 0 |
| wrestler · bien | chaydanh (80 tick) | em-be-wrestler-bien | move:0×6 move:1×7 move:2×7 move:3×7 move:4×7 move:5×7 move:0×7 move:1×7 move:2×7 move:3×7 move:4×7 move:5×4 | 28 |
| wrestler · lau | dung (90 tick) | em-be-wrestler-lau | idle:0×9 idle:1×10 idle:2×10 idle:3×10 idle:4×10 idle:5×10 idle:0×10 idle:1×10 idle:2×10 idle:3×1 | 0 |
| wrestler · lau | chay (90 tick) | em-be-wrestler-lau | move:0×5 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×6 move:4×6 move:5×6 move:0×6 move:1×6 move:2×6 move:3×1 | 30 |
| wrestler · lau | danh (100 tick) | em-be-wrestler-lau | atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×11 atk_sword:4×12 atk_sword:5×16 atk_sword:0×8 atk_sword:1×11 atk_sword:2×8 atk_sword:3×7 | 0 |
| wrestler · lau | chaydanh (80 tick) | em-be-wrestler-lau | move:0×6 move:1×7 move:2×7 move:3×7 move:4×7 move:5×7 move:0×7 move:1×7 move:2×7 move:3×7 move:4×7 move:5×4 | 28 |

### 5.3 Đọc kết quả 5.2

| Kịch bản | Lý thuyết (từ JSON + code) | Đo được | Nhận xét |
|---|---|---|---|
| Đứng, mọi thân | 6 khung × (1 s/6) = 10 tick/khung | `idle:0×9`, các khung sau ×10 | khớp; khung đầu 9 tick do `+1e-6` |
| Chạy, thân gốc Cu Tí / Cái Bống (8 khung, 0,65 s) | 4,875 tick/khung | 4–5 tick | khớp; không nhún (`nhun_buoc:false`) |
| Chạy, thân gốc Cu Tèo / Cu Lì (8 khung, 0,6 s) | 4,5 tick/khung | 4–5 tick | khớp |
| Chạy, mọi thân bộ (6 khung, 0,6 s) | 6 tick/khung | 6 tick (khung đầu 5) | nhún −1 px ở khung 1, 4: 30/90 tick |
| Chạy + đánh kiếm (`CHAY_DANH='than'`) | `move` theo `chayT`, tốc ×0,85 (`moves.js:204` `danh.sword`) | gốc 5–6 tick, bộ 7 tick | thân **không** vào hàng đòn; chỉ vũ khí vung |
| Đánh kiếm giữ nút (combo) | nhát 1/2: 0,3 s (18 tick), đổi khung ở u=0,4; nhát 3: 0,46 s | `0×8 1×11 · 2×8 3×11 · 4×12 5×16` rồi lặp | **2 khung ảnh mỗi nhát** (~6,7 fps); xương code cùng lúc qua 10 khung |
| Cu Tèo bộ Rừng Già, đánh kiếm | không có tệp đòn → `atk` 6 khung theo u | `atk:0×4 1×3 2×3 3×3 4×3 5×3` mỗi nhát | cùng một hàng cho mọi nhát combo và mọi vũ khí |
| Cái Bống mặc áo bộ (cả 3 bộ) | thân bộ `cu:true` bị bỏ | thân vẽ = `em-be-healer` | đúng thiết kế hiện tại; thân bộ Cái Bống không hiện |
| Lộn | 6 khung theo `1 − dodgeT/0,27` | `ne:0×3 1×3 2×3 3×2 4×3 5×3` (17 tick) | xương code cùng lúc 8 khung `dodge` |
| Trúng đòn | `hit` theo `1 − hurtT/0,2` | 4 khung × 3 tick; Cái Bống gốc 3 khung × 4 tick | rồi về `idle` giữa vòng |

### 5.4 Vũ khí khác, giữ nút, chiêu, chưởng (thân gốc Cu Tí, `do_khung2.py`, `do_cast.py`)

| Kịch bản | Chuỗi khung vẽ thật | Tick gây sát thương (`hitDone` đổi) | Khung đang hiện lúc chạm |
|---|---|---|---|
| Giáo, 1 lần bấm (0,38 s) | `atk_spear:0×8 1×5 2×2 3×3 4×4 5×3` → `idle:2` | tick 13, u=0,482 | `atk_spear:2` (khung đâm, mốc 0,45) — khớp |
| Búa, 1 lần bấm (0,8 s, `hitAt` 0,35) | `atk_hammer:0×12 1×9 2×3 3×7 4×10 5×9` | tick 19, u=0,354 | **`atk_hammer:1`** — khung nện 3 bắt đầu tick 24 (**trễ 5 tick ≈ 83 ms**) |
| Cung, 1 lần bấm (0,38 s) | `atk_bow:0×6 1×3 2×4 3×4 4×4 5×4` | tick 13, u=0,482 | `atk_bow:3` (buông tên) — khớp |
| Kiếm, nhát 1/2/3 | (như 5.2) | u=0,5 / 0,5 / 0,471 | `atk_sword:1/3/5` (khung chém) — khớp |
| Giữ cung 70 tick rồi thả | `atk_bow:0×24 1×15 2×32` → `3×5 4×5 5×6` | — | khung 0→1→2 theo `charge` |
| Giữ búa 70 tick rồi thả | `atk_hammer:0×36 1×35` → `2×3 3×7 4×8 5×8` (vào giữa đòn, `phase` 0,36 `moves.js:502`) | tick 74, u=0,455 | `atk_hammer:3` — khớp |
| Giữ giáo (đầy đà) rồi thả | `atk_spear:0×21 1×65` → lướt `move:3..7` (×2 tốc, 10 tick) → `idle` | — | lướt dùng hàng chạy |
| Giữ nút với kiếm | không vào `holding` trong 100 tick | — | nhánh `giuDon` kiếm (khung 4) **không gặp** |
| Đòn Đặc biệt (Trảm Nguyệt) | `cast:0×4 1×1 2×1 3×6 4×6 5×7` | — | khung 1, 2 chỉ 1 tick (do `G.nhipChieu` dồn lấy đà vào 12% đầu) |
| Chưởng (`castT = 0,3`) | **`cast:2×4 3×5 4×5 5×5`** | — | **khung 0, 1 không bao giờ hiện** (xem L1) |
| Lộn khi đang chạy | `move:0×3` → `ne`×17 → **`idle:2×1`** → `move:1…` | — | 1 tick "đứng" chen giữa (xem L3) |

Số lần vẽ mỗi khung hình: `G.art.hero` 2 lần (thường), 2–6 lần (đang lộn / lướt có bóng mờ); `veKhung` thân em bé 2–6 lần **[ĐO]**.

---

## 6. Phần vẽ bằng canvas (code) và phần dùng sprite sheet ở người chơi

| Thành phần | Nguồn hình | Nơi vẽ |
|---|---|---|
| Thân em bé (idle, move, tele, atk, atk_*, cast, hit, ne, die) | **Sprite sheet AI** (`em-be-<key>[-<bộ>]` + tệp `-don` ghép) | `SC.veKhung` `sprite_custom.js:309`, gọi từ bút giả `:1256` |
| Thân em bé khi thiếu tệp / ảnh chưa tải xong | **Canvas code**: khung xương pixel (`pick`→`pose`→`drawKid`→`kidSprite`) | `hero_tinhlinh.js:1161, 1031, 692, 1198` |
| Khung xương code khi CÓ ảnh AI | vẫn **dựng** (nhớ đệm `KCACHE`), **không hiện** (bị thay), chỉ để lấy `fr.weapon`, `fr.hands`, `fr.ox/oy` | `hero_tinhlinh.js:1243-1263` |
| Lớp đồ khoác (mũ, đồ lưng, bùa, mặt nạ, cánh) trên thân AI | Canvas code (`drawKid` ở tư thế đứng) hoặc ảnh AI của món đồ (`SC.tinhDatMon`), dời theo `neo` + `khopEmBe` | `G.tinhLinh.lopDo` `hero_tinhlinh.js:1294`; gọi `sprite_custom.js:1224` |
| Áo trên thân AI gốc | Ảnh AI `tp-robes-<hình>` cắt theo hình bóng khung | `SC.aoTrenThan` `:1161-1198` |
| Dấu ngực 3×3 (khi `?aothan=0`) | Canvas `fillRect` | `SC.veDauNguc` `:1122-1127` |
| Viền màu bậc | Tấm một màu của chính khung AI (`veNhuom`) + lớp đồ | `veVien` `:1234-1238` |
| Nhuộm trúng đòn / băng / độc | Tấm một màu của khung AI (`emBeTint` → `veNhuom`) | `:321-322`, `:629-635` |
| Bàn tay nắm vũ khí | Ảnh AI (vẽ lại vùng tay của khung: `veTayAI`, `SC.veNam`) khi `G.KIEM_KHOP`; nếu không: ô màu code 4×2 | `:1242-1244`; `hero_tinhlinh.js:1689-1696` |
| Bóng đổ | Canvas (`fillRect` 3 dòng hoặc `A.ellipse`) | `hero_tinhlinh.js:1800-1804` |
| Hào quang đủ bộ, hạt hệ, khiên, Gồng | Canvas (`fillRect` từng điểm); khiên dùng ảnh `gd-khien` nếu có | `hero_tinhlinh.js:1718, 1731, 1754, 1820-1826` |
| Nhấp nháy bất tử | `o.alpha` 0,5 nhịp 20 Hz | `combat.js:1061` |
| Bóng mờ lộn / lướt | Gọi lại toàn bộ `G.art.hero` với bản sao `P` | `fx.js:1977-1984, 2342` |
| Vũ khí | Ảnh AI vũ khí xoay bằng code / hình code (`weapon_art.js`) | **ngoài phạm vi** — điểm nối: `drawFrame` `hero_tinhlinh.js:1660`, `vkGhep0 :1359` (`SC.khungVk` `sprite_custom.js:2129`), `lechCo :1324`, `HOLD :910` |
| Gồng (`o.gong`) | Ảnh AI **không có** hàng gồng → thân vẫn `idle`/`move`; xương code có `gong` | `pick :1189` |

---

## 7. Lỗi tiềm ẩn (có bằng chứng)

| # | Loại | Mô tả | Bằng chứng | Mức chắc |
|---|---|---|---|---|
| L1 | Sai khung / mất khung | **Chưởng bỏ 2 khung đầu**: `P.castT = 0.3` nhưng mọi nơi chọn khung chia cho `0.4` → u bắt đầu ở 0,25 | `chuong.js:244`; `sprite_custom.js:607`; `hero_tinhlinh.js:1174`; `hero_art.js:1104`. Đo: `cast:2×4 3×5 4×5 5×5`, xương code bắt đầu `cast:2` | **[ĐO]** |
| L2 | Lệch nhịp đòn ↔ hình | **Búa chạm trước khung nện**: `hitAt 0,35` nhưng `MOC_DON.atk_hammer` đặt khung 3 ở 0,45 | `moves.js:74`; `sprite_custom.js:585`. Đo: chạm tick 19 lúc khung 1, khung 3 từ tick 24 (~83 ms trễ). (Búa giữ-thả vào giữa đòn nên khớp.) | **[ĐO]** |
| L3 | Giật khung | **1 tick "đứng" giữa lộn và chạy**: tick lộn kết thúc `P.moving` vẫn false và `dodge = -1` | `combat.js:683` (đặt false), nhánh lộn `:719-739` không đặt `moving`; đo `ne:5×3 → idle:2×1 → move` | **[ĐO]** |
| L4 | Khung trùng | Chỉ 1 cặp khung trùng hệt trong 28 tệp: `em-be-wrestler-bien` `atk` cột 0 = cột 1 (0 điểm ảnh khác). Trường `khung` sửa việc này nhưng hàng `atk` **không được phát** ở chế độ mặc định (đã có `-bien-don`) | Phân tích ảnh PIL (`phan_tich_anh.py`); đo `?donvk=0` | **[ĐO]** |
| L5 | Dữ liệu gây hiểu nhầm | `giay` của atk/atk_*/cast/hit/ne/tele và `lap` của mọi hàng **bị bỏ qua** cho em bé; ví dụ `atk_sword giay 0,45` nhưng nhát kiếm thật 0,3/0,3/0,46 s, búa 0,8 s vs `0,55` | `sprite_custom.js:595-617` (chỉ `khungLap` dùng `giay`); `moves.js:39-41, 74` | **[CODE]** |
| L6 | Hai đồng hồ, hai bộ chọn khung | Thân AI theo `chonEmBe` (6 khung idle / 1 s, move theo `chayT`); khung xương code (quyết định tư thế vũ khí khi `SC.khungVk` trả null) theo `pick` (idle 8 khung × 6,5 fps theo `P.t`, run 13 fps theo `P.t`). Đo: `idle:5` AI trong khi xương ở `idle:6/7`; chạy-đánh: thân `move`, xương `atk` | `hero_tinhlinh.js:1188-1190` vs `sprite_custom.js:615-616`; bảng CODE ở `do_khung.json`. Lưu ý: trong game thật tệp `ghep-<key>` có `cap.vk-*` → `coVk` true → `SC.khungVk` trả khung AI cả lúc đứng/chạy (`sprite_custom.js:1854, 2130-2138`); lần đo này **không nạp** tệp ghép nên vũ khí theo xương code | **[ĐO]** cho lệch khung; ảnh hưởng thật lên vũ khí: **[SUY]** (agent vũ khí) |
| L7 | Thiếu tài nguyên | Cu Tèo bộ Rừng Già: không có `-rung-don` → mọi vũ khí, mọi nhát combo dùng chung `atk`; giữ nút dùng `tele` khung cuối. Cái Bống: 3 thân bộ `cu:true` bị tắt, không có tệp đòn bộ | ls `art/custom`; đo `hunter·rung·danh`, `healer·*` | **[ĐO]** |
| L8 | Giật (ít khung) | Kiếm: 2 khung ảnh / nhát (lấy đà, chém), khung chém giữ tới hết đòn (nhát 3 giữ 16 tick ≈ 0,27 s); Đòn Đặc biệt: khung 1, 2 chỉ 1 tick | `khungDon :588`; `G.nhipChieu :1156-1159`; đo §5.4 | **[ĐO]** |
| L9 | Sai động tác | Giáo "Quét vòng" (`pose 3`, `moves.js:468`) phát hàng **đâm** `atk_spear` (không có hàng quét; `khungDon` bỏ `combo` với giáo) | `sprite_custom.js:588-589, 612`; xương code có `sweep` riêng `hero_tinhlinh.js:1181` | **[CODE]** |
| L10 | Ưu tiên | Trúng đòn khi đang vung / lấy đà / lộn **không** có khung `hit` (chỉ nhuộm trắng) vì `atk` (#7) đứng trên `hit` (#8) | `sprite_custom.js:609-614` | **[CODE]** |
| L11 | Không về idle "sạch" | Không có khung hồi; idle vào giữa vòng theo `P.t` (đo: sau kiếm `idle:2`, sau trúng đòn `idle:1`); chạy tiếp tục theo `chayT` cũ | `sprite_custom.js:615-616`; đo §5.2 | **[ĐO]** (chỉ thẩm mỹ) |
| L12 | Lệch neo thân gốc ↔ thân bộ | Điểm chân đồng nhất (`goc` [24,45], đáy hình bóng idle:0 = 45,5 ở mọi tệp); nhưng `neo.than.x` khác tới 3 px (Cu Tèo gốc −1, bộ Hang Biển −4), `neo.dau` khác tới 4 px (Cu Tí gốc 0 vs Hang Biển 3); `khopEmBe` đo so với `idle:0` của **từng tấm** → đổi áo giữa trận đồ khoác nhảy vị trí | bảng §4.2; `sprite_custom.js:689-725`; hộp idle:0 đo bằng PIL | **[ĐO]** số liệu; hệ quả hình: **[SUY]** |
| L13 | Luật nhún cứng | `i % 3 === 1` giả định vòng chạy 6 khung; thân 8 khung phải nhớ ghi `nhun_buoc:false` | `sprite_custom.js:627, 133` | **[SUY]** |
| L14 | Trùng lặp code | Ba `pick` gần giống nhau (`hero_art.js:1098`, `hero_tinhlinh.js:1161`, `SC.chonEmBe`) — sửa ưu tiên / hằng số (0,27; 0,2; 0,35; 0,4) phải sửa 3 nơi (L1 là hệ quả); hai bảng `ATKN` (`hero_art.js:900`, `hero_tinhlinh.js:1017`); `G.KIEM_SAU` định nghĩa 2 lần (`hero_tinhlinh.js:1402`, `sprite_custom.js:1032`); `khungLap/khungMot` dùng chung cho quái và em bé nhưng `chonQuai` và `chonEmBe` tách riêng | grep | **[CODE]** |
| L15 | Hiệu năng | Mỗi khung hình: `G.art.hero` 2–6 lần; mỗi lần dựng/tra khung xương code + `chonEmBe` ~4 lần + `khopEmBe`/`lopDo`; khoá nhớ đệm `KCACHE` gồm `sel` (mọi khung xương × đồ × tint × N) | `hero_tinhlinh.js:1250`; đo §5.4 | **[ĐO]** số lần gọi; chi phí thời gian chưa đo |
| L16 | Thiếu tính năng | Không có hàng gồng, choáng/đóng băng, nhảy/rơi/tiếp đất, đi bộ, phòng thủ; gục không mờ (`mo` chỉ cho quái) | §3.3; `sprite_custom.js:339` | **[CODE]** |
| L17 | Nhánh chết | `giuDon` kiếm (khung 4) không gặp trong đo (kiếm không có lấy đà trong `moves.js`); `tele` của thân có tệp đòn gần như không dùng | `sprite_custom.js:594, 608`; đo §5.4 | **[ĐO]** trong kịch bản đã thử |

---

## 8. Cần giữ lại khi thiết kế lại (để không vỡ gameplay)

- **Đồng hồ gameplay là nguồn sự thật**: `P.atkT/atkDur/hitAt/comboI`, `dodgeT` (0,27), `hurtT` (0,2), `specT` (0,35), `castT`, `dashT`, `deadT`, `P.mv.holding/charge`, `P.moving`, `P.chayT` (`combat.js:650-760`, `moves.js:304-311`). Hoạt ảnh chỉ đọc chúng; thời điểm gây sát thương (`combat.js:801`) không phụ thuộc khung.
- **Giao diện vẽ** `G.art.hero(c, o)` với `o` từ `G.heroArgs` (`combat.js:1055-1067`) — được gọi từ 10+ nơi (§1.3), kể cả `fx.js` (`TL.tip(G.heroArgs(P))` cho vệt chém) và bóng mờ.
- **Lật bằng `translate(x+1)` + `scale(f,1)`** ở lớp 3, vẽ khung với `face = 1` (tránh lật hai lần).
- **Điểm chân `goc`**, `net`, khung 48×48, quy ước hàng/cột, ghép tệp đòn xuống dưới (`ghepDon`) — mọi phép đo tự động (`matNa`, `khopEmBe`, `matKhung`, `diemKhung`, bảng tay `TAY_KIEM`) dựa trên `(ten, i)` và hàng sau ghép.
- **Mốc khung chạm** = mốc gây sát thương (0,45; búa 0,35) — nếu đổi số khung phải giữ "khung chạm" trùng `hitAt`.
- **Chuỗi dự phòng**: thân bộ → thân gốc → vẽ code; hàng đòn → `atk` → `idle`; ảnh chưa tải (`SC.get` trả null khi chưa `ready`) → vẽ code.
- **Cờ URL** để so trước/sau (§3.4) — các bài đo cũ (`tests/*_shots.py`) dựa vào chúng.

## 9. Điều chưa chắc / chưa đo

- Không nạp tệp `ghep-<key>` khi đo → vị trí vũ khí trong số đo khác game thật; khung **thân** không phụ thuộc tệp ghép (`chonEmBe` không đọc `SC.ghep`).
- Không đo chết (`die`), lướt "Nhát lướt" kiếm, Xốc tới đầy đà ngoài kịch bản giáo, tay không (`fist`), đóng băng; không đo `CHAY_DANH = 'lai' / 'nhun' / 0`.
- Không đo thời gian CPU của việc vẽ em bé (L15 chỉ đếm số lần gọi).
- Chế độ "khựng hình" (hitstop) của `fx.js` có thể làm `P.t` / đồng hồ đứng; các số tick ở trên đo với `AU.run(…, true)` (có khựng như lúc vẽ) nhưng không bóc riêng ảnh hưởng.
- Bản đóng gói `dist` (một tệp / hai tệp ảnh rời) nạp ảnh theo hàng chờ (`roiCan`): khi thân bộ chưa tải xong, `SC.get` trả null → tạm vẽ thân gốc rồi đổi; chưa đo.

---

## Phụ mục A — Script sinh Bảng D

Chạy: `python3 -I bang_d.py` (đọc `game/art/custom/em-be-*.sprite.json`, ghi `bang_d.md`).

<details><summary>bang_d.py</summary>

```python
"""Sinh bảng D (em bé) từ các tệp game/art/custom/em-be-*.sprite.json — không chép tay.
Cột kích hoạt / kết thúc / thời lượng thật lấy theo luật trong js/sprite_custom.js SC.chonEmBe (ghi tay một lần ở bảng LUAT bên dưới)."""
import json, glob, os, re

ROOT = '/home/claude/new-project/game/art/custom'
KEYS = ['smith', 'hunter', 'healer', 'wrestler']
TEN = {'smith': 'Cu Tí', 'hunter': 'Cu Tèo', 'healer': 'Cái Bống', 'wrestler': 'Cu Lì'}
BO = ['rung', 'bien', 'lau']

# Luật phát của em bé (sprite_custom.js:595-617). (kích hoạt, kết thúc, thời lượng thật trong game)
LUAT = {
    'idle': ('mặc định (không trạng thái nào khác) :616', 'khi có trạng thái ưu tiên hơn', 'lặp theo P.t: giay/so mỗi khung (khungLap :167)'),
    'move': ('o.move = P.moving :615; lộn khi tệp thiếu "ne" :604; lướt dashT>0 (×2 tốc) :605; chạy-đánh CHAY_DANH=\'than\' :611', 'P.moving=false / trạng thái khác', 'lặp theo P.chayT (nhịp chân ×0,55..1,2) :597'),
    'tele': ('giữ nút lấy đà mà KHÔNG có hàng đòn atk_<vk> :608', 'thả nút', 'đứng ở khung cuối (u=0,99), không chạy theo giay'),
    'atk': ('o.atk>=0 khi không có hàng atk_<vk> (DON_VK tắt, thân bộ không có tệp đòn, vũ khí "fist") :612; chiêu/chưởng khi thiếu "cast" :606-607', 'P.atkT<=0', 'theo P.atkDur (0,3/0,3/0,46 kiếm…), KHÔNG theo giay'),
    'hit': ('P.hurtT>0 (0,2 s) và không đánh/lộn/… :614', 'hurtT<=0', 'u = 1 - hurtT/0,2 → 0,2 s, KHÔNG theo giay'),
    'die': ('P.dead :603', 'không kết thúc (đứng ở khung cuối)', 'u = deadT / giay(die) → đúng giay'),
    'ne': ('o.dodge>=0 (dodgeT 0,27 s) :604', 'dodgeT<=0', 'u = 1 - dodgeT/0,27 → 0,27 s, KHÔNG theo giay'),
    'atk_sword': ('o.atk>=0, vũ khí kiếm, G.DON_VK :601,612', 'P.atkT<=0', 'khungDon: combo×2 + (u>=0,4) — 2 khung/nhát theo P.atkDur, KHÔNG theo giay; giữ nút: khung 4 :594'),
    'atk_bow': ('o.atk>=0, cung :612; giữ nút: khung 0..2 theo charge :594,608', 'P.atkT<=0 / thả nút', 'MOC_DON.atk_bow theo u, KHÔNG theo giay'),
    'atk_spear': ('o.atk>=0, giáo (cả "Quét vòng") :612; giữ nút: khung 0/1 :594', 'P.atkT<=0 / thả nút', 'MOC_DON.atk_spear theo u, KHÔNG theo giay'),
    'atk_hammer': ('o.atk>=0, búa :612; giữ nút: khung 0/1 :594', 'P.atkT<=0 / thả nút', 'MOC_DON.atk_hammer (khung "nện" 3 ở u=0,45, đòn chạm búa ở 0,35)'),
    'cast': ('P.specT>0 (đòn Đặc biệt 0,35 s) :606; P.castT>0 (chưởng 0,4 s) :607', 'specT/castT<=0', 'MOC_DON.cast theo u, KHÔNG theo giay'),
}


def doc(m):
    p = os.path.join(ROOT, m + '.sprite.json')
    return json.load(open(p)) if os.path.exists(p) else None


def main():
    hang = []
    tom = []
    for k in KEYS:
        goc = doc('em-be-' + k)
        for bo in [None] + BO:
            ma = 'em-be-' + k + ('-' + bo if bo else '')
            than = doc(ma)
            don = doc(ma + '-don')
            if not than:
                tom.append((ma, 'KHÔNG CÓ TỆP'))
                continue
            cu = than.get('cu') is True
            co_don = don is not None
            if bo and cu:
                tt_than = 'KHÔNG DÙNG ("cu": true, bị SC.thanBo bỏ qua khi G.THAN_BO_CU=false → vẽ thân gốc)'
            else:
                tt_than = 'đang dùng'
            tom.append((ma, '%s; tệp đòn %s' % (tt_than, (ma + '-don') if co_don else 'KHÔNG CÓ')))
            fw, fh, net = than['khung_rong'], than['khung_cao'], than.get('net', 1)
            for ten, a in than['dong_tac'].items():
                tt = tt_than
                loi = []
                if tt == 'đang dùng':
                    if ten == 'atk' and co_don:
                        tt = 'dự phòng (chỉ khi ?donvk=0 hoặc tay không "fist")'
                    if ten == 'tele' and co_don:
                        tt = 'gần như không dùng (giữ nút đã có hàng atk_<vk>)'
                    if ten == 'atk' and not co_don:
                        tt = 'đang dùng cho MỌI vũ khí (thiếu tệp đòn)'
                        loi.append('một hàng đòn chung cho kiếm/cung/giáo/búa')
                if 'khung' in a:
                    loi.append('trường khung=%s cham=%s (bỏ khung trùng) — chỉ hiệu lực khi hàng này được phát' % (a['khung'], a.get('cham')))
                if ten in ('atk', 'hit', 'ne', 'tele'):
                    loi.append('giay=%s bị bỏ qua' % a['giay'])
                if 'lap' in a and ten not in ('idle', 'move'):
                    loi.append('lap trong JSON không được đọc')
                fps = a['so'] / a['giay'] if a.get('giay') else 0
                L = LUAT.get(ten, ('?', '?', '?'))
                hang.append([ma + '.sprite.json', ten, str(a['hang']), str(a['so']), '%d×%d (ảnh ×%d = %d×%d)' % (fw, fh, net, fw * net, fh * net),
                             '%s s ≈ %.1f fps' % (a['giay'], fps), 'có' if a.get('lap') else 'không', L[2], L[0], L[1], tt, '; '.join(loi) or '—'])
            if don:
                for ten, a in don['dong_tac'].items():
                    tt = tt_than if tt_than != 'đang dùng' else 'đang dùng (G.DON_VK)'
                    if bo and cu:
                        tt = 'KHÔNG DÙNG (thân bộ cũ bị tắt)'
                    loi = ['giay=%s bị bỏ qua (khungDon theo P.atkDur)' % a['giay']]
                    if ten == 'atk_hammer':
                        loi.append('khung nện (3) ở u=0,45 nhưng búa chạm ở u=0,35 (moves.js:74) — đo: chạm lúc khung 1')
                    if ten == 'atk_spear':
                        loi.append('Quét vòng (pose 3) cũng phát hàng đâm')
                    fps = a['so'] / a['giay']
                    L = LUAT.get(ten)
                    hang.append([ma + '-don.sprite.json', ten, '%s (ghép xuống dưới: hàng %s)' % (a['hang'], 7 + a['hang']), str(a['so']), '%d×%d (ảnh ×%d)' % (don['khung_rong'], don['khung_cao'], don.get('net', 1)),
                                 '%s s ≈ %.1f fps' % (a['giay'], fps), 'không (themDon ép lap:false)', L[2], L[0], L[1], tt, '; '.join(loi)])
    # thêm dòng tệp đòn không tồn tại
    out = []
    out.append('| Tệp (art/custom/) | Động tác | Hàng | Số khung | Khung (game px) | giay trong JSON ≈ fps | lap (JSON) | Thời lượng THẬT trong game | Kích hoạt (sprite_custom.js:dòng) | Kết thúc | Trạng thái | Lỗi tiềm ẩn / ghi chú |')
    out.append('|' + '---|' * 12)
    for h in hang:
        out.append('| ' + ' | '.join(x.replace('|', '/') for x in h) + ' |')
    out2 = ['| Thân | Trạng thái |', '|---|---|'] + ['| %s | %s |' % t for t in tom]
    neo = ['| Tệp thân | goc | neo.dau | neo.than | neo.tay | nhun_buoc | cu | move (so/giay) |', '|---|---|---|---|---|---|---|---|']
    for f in sorted(glob.glob(os.path.join(ROOT, 'em-be-*.sprite.json'))):
        d = json.load(open(f))
        if d['ma'].endswith('-don'):
            continue
        n = d.get('neo', {})
        mv = d['dong_tac'].get('move', {})
        neo.append('| %s | %s | %s | %s | %s | %s | %s | %s/%s |' % (d['ma'], d.get('goc'), n.get('dau'), n.get('than'), n.get('tay'), d.get('nhun_buoc', '(không ghi → nhún)'), d.get('cu', '—'), mv.get('so'), mv.get('giay')))
    open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bang_d.md'), 'w').write('\n'.join(out2) + '\n\n' + '\n'.join(neo) + '\n\n' + '\n'.join(out) + '\n')
    print(len(hang), 'dòng')


main()
```

</details>
