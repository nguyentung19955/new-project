# Phụ lục 3: Vũ khí trên tay nhân vật (cầm, neo, xoay, lớp vẽ, né mặt, hiệu ứng)

Phạm vi: cách em bé (người chơi) cầm và vung 4 loại vũ khí, ở commit `229e263` (nhánh `khoi-tao-du-an`). Số dòng ghi theo commit này.
Ngoài phạm vi: vệt chém (fx.js); phụ lục này chỉ nêu chỗ fx.js lấy dữ liệu từ vũ khí (mục 11).

Quy ước: **[đọc code]** là kết luận rút từ mã nguồn. **[đã đo]** là số đo bằng Playwright trên bản đóng gói `game/dist/linh-khi.html?cloud=0` (viewport 844x390, có ảnh AI). **[đã thấy]** là quan sát trên ảnh. **[suy luận]** là nhận định chưa đo trực tiếp.

> Lưu ý về loại vũ khí: game chỉ có **4 loại**: `sword` (kiếm), `bow` (cung), `spear` (giáo/thương), `hammer` (búa) (`weapon_art.js:57` `const TYPES = ['sword', 'bow', 'spear', 'hammer']`). **Không có loại vũ khí "phép"**. Chỗ gần nhất là tư thế **chưởng** (`cast`, `hero_tinhlinh.js:1081`): một kỹ năng, không phải vũ khí. Khi chưởng, vũ khí đang cầm vẫn được vẽ (xem bảng mục 8). Thêm loại giả `fist`: lúc giáo đang bay (Phi Thương), `combat.js:1063` đổi `weapon.type` thành `'fist'`; `REST['fist']` không tồn tại nên không vẽ vũ khí nào.

---

## 1. Tóm tắt nhanh

| Câu hỏi | Trả lời ngắn |
|---|---|
| Vũ khí vẽ bằng gì? | Ba đường, chọn lúc chạy. (1) **Ảnh AI** `vk-<loại>-<dòng>[-<nhánh>].sprite.json` (160 tệp) xoay bằng code theo bước 5° (`SC.veVuKhi`/`xoayVk`, `sprite_custom.js:1554,1641`). (2) Không có ảnh AI thì **vẽ thủ tục bằng canvas** (`G.weaponArt.draw`, `weapon_art.js:2242`): vũ khí "sinh vật" có mặt, nhớ đệm theo góc bước 5°. (3) `G.weaponArt` lỗi thì **hình tạm** `weaponSprite` (`hero_tinhlinh.js:889`). |
| Ảnh thân có vẽ sẵn vũ khí không? | **Không.** Cả thân gốc (`em-be-<key>`, hàng `atk`) và tệp đòn theo vũ khí (`em-be-<key>[-<bộ>]-don`, hàng `atk_sword/atk_bow/atk_spear/atk_hammer/cast`) đều là tay không. Vũ khí luôn được **ghép bằng code** đè lên [đã thấy: `em-be-smith-don`, `em-be-hunter-lau-don`, `em-be-wrestler` hàng atk]. `G.DON_VK` chỉ chọn **tư thế thân**, không chọn hình vũ khí. |
| Điểm neo vũ khí | Hệ trục vũ khí là (t, q): t chạy từ tay cầm ra mũi. **Điểm cầm** (0,0) = trường `cam` trong ảnh AI. Bàn tay nắm cách điểm cầm `HOLD` dọc thân (kiếm/búa −5, giáo −10; `hero_tinhlinh.js:910`). Ảnh AI co theo `G.CO_VK` nên được dời bằng `lechCo` (`:1324`) để điểm `nam` (1,5 px trên ảnh × hệ số co) rơi đúng bàn tay. |
| Bàn tay lấy ở đâu? | Thân AI: điểm `tay_truoc` của khung ảnh đang vẽ. Ưu tiên: tệp ghép `diem_theo`/`diem_theo_than` ("tep") > bảng đo tay `SC.TAY_KIEM`/`SC.TAY_DON` ("bang-do") > máy tự đo `doTay` ("do-tu-dong") > ước lượng từ `diem` + dịch khung ("uoc-luong"). Thân code: khung xương `attach()`. |
| Góc theo thời gian | Kiếm trên thân AI: một **đường vung liên tục** `kiemMuot` (`:1593`, bảng `VUNG` theo từng em bé, `tienDo`). Giáo, búa, cung (và kiếm trên thân code): **khung khóa** `ATK`/`SPEC` (`:988–1016`) nội suy tuyến tính, qua `nhip()` (`:1146`). Sau đó lần lượt qua né mặt (`kiemKhop`), "kiếm sau lưng" (`kiemSau`) và xoay theo hướng nhắm (`aimRot`). |
| Lớp trước/sau thân | `wp.front`, cùng hai nhánh cắt điểm ảnh của `G.KIEM_SAU` (`drawFrame`, `:1660`). Đứng/chạy/trúng đòn: kiếm, giáo, búa nằm **sau lưng**, mũi chúc xuống sau gót, chỉ khúc chuôi ở trước. Lúc đánh, phần lưỡi lọt vào đĩa đầu được vẽ **sau đầu**. Cung luôn sau thân, trừ khi ngắm xuống > 40°. |
| Lật hướng | Chỉ lật trái/phải bằng `c.scale(f, 1)` (`hero_tinhlinh.js:1809`). Mọi tọa độ vũ khí tính khi quay phải. Đánh chếch lên/xuống thì xoay vũ khí quanh bàn tay một góc `rel` (`aimRot`, `:1022`), mỗi nấc 15°. |

---

## 2. Sơ đồ gọi hàm (người chơi, mỗi khung vẽ)

```
combat.js:1127  G.drawWorld → A.hero(c, G.heroArgs(P))                 // heroArgs: combat.js:1055 (atk = 1 − atkT/atkDur, dodge, move, weapon…)
└─ sprite_custom.js:1213  A.hero (bọc của noiEmBe) — chỉ khi có thân AI (SC.cuaEmBe)
   ├─ :1216  thêm o.vkNga khi chết (G.VK_NGA)
   ├─ :1240  thêm o.neoTay nếu neo.tay ≠ [0,0]   (mọi tệp em-be hiện ghi "tay": [0,0] → không bao giờ bật)
   ├─ :1242  thêm o.veTayAI (G.KIEM_KHOP): vẽ lại đĩa r=2,5 của thân AI quanh nắm tay
   ├─ :1244  thêm o.veNam   (G.KIEM_KHOP && G.KIEM_SAU): chỉ điểm ảnh bàn tay + 2 ngón (SC.veNam :1077)
   └─ :1274  hero0 (= hero_tinhlinh.js:1783 hero) chạy với "bút giả": lệnh drawImage thân code → SC.veKhung (ảnh AI)
      hero_tinhlinh.js:1783 hero(c,o)
      ├─ :1785 frame(o) :1243 → pick(o,wt) :1161 → pose(key,wt,anim,f,v,rs) :1031 → attach :928 / bowPose :983 / aimRot :1022
      │        → fr.weapon = { type, x, y, ang, pull, front, mood, sx }   (tọa độ tính từ chân, quay phải)
      ├─ :1809 c.translate(x,y+nhún); c.scale(f,1)
      └─ :1822 drawFrame(c,o,fr,t) :1660
         ├─ vkGhep(o,fr) :1449 = kiemSau(o, fr, vkGhep0(o,fr))
         │   vkGhep0 :1359
         │   ├─ SC.khungVk(o)  sprite_custom.js:2129 → SC.chonEmBe :595 (hàng/khung ảnh AI)
         │   │                 → SC.diemKhung :879 (+ bọc :993 bảng tay, :1011 đầu thật) → diem.tay_truoc
         │   │                 → SC.matKhung :1094 (vùng mặt khung, nếu G.KIEM_KHOP)
         │   ├─ SC.capVuKhi    sprite_custom.js:2114 (tệp ghep-<key>: "cap"."vk-…"."theo"."atk:i" → {bam:"tay_truoc", bam_vk})
         │   ├─ (G.CO_VK) idle/move: tự bám tay_truoc (búa đứng: xoay 65°, cung: dx 2)       :1367–1369
         │   ├─ (hàng đòn LA_DON) tự bám tay_truoc                                          :1373–1374
         │   ├─ kiemKhop :1478  (né mặt bằng hình học; G.KIEM_KHOP, G.VK_NE_MAT, G.VK_KHOP)
         │   └─ kiemMuot :1593  (kiếm: đường vung liên tục; G.KIEM_MUOT) → ghi đè kết quả kiemKhop
         │   kiemSau :1408 (G.KIEM_SAU): không đánh → góc "kéo kiếm sau lưng" 140..170°; đang đánh → xoay dần vào đòn + đĩa đầu `dau`
         ├─ ghiGoc :1587 (nhớ góc đã vẽ vào NHO_GOC để nối liền giữa các trạng thái)
         └─ drawWeapon :1334 → lechCo :1324 → G.weaponArt.draw
                └─ (đã bọc ở sprite_custom.js:1683 noiVuKhi) SC.timVuKhi :1473 → SC.veVuKhi :1641 → xoayVk :1554 (+ hatHe :1604)
                   không có ảnh AI → weapon_art.js:2242 draw (vẽ code) ; lỗi → hero_tinhlinh.js:889 weaponSprite
```

Nơi khác cũng vẽ vũ khí: vũ khí bay theo em bé ở làng (`village_scene.js:811`, `o.lang = true` → nhân thêm `G.CO_VK.lang`); giáo bay Phi Thương (`fx_he.js:593 drawSpear`, điểm cầm dời lùi cố định 22 px); ô đồ, đồ rơi (`weaponArt.icon`, `do_roi.js:40`). Nếu `G.tinhLinh.frame` ném lỗi, game dùng hình cũ `G.art.heroOld` (hero_art.js, có `drawWeapon` riêng ở `hero_art.js:640`). Đây là đường dự phòng, không phân tích sâu.

Trang `game/index.html` (bản phát triển) không nhúng `G.customSpriteData`: `sprite_custom.js:2592` chỉ nạp khi `build.py` đã nhúng. Vì vậy trang này dùng **thân code + vũ khí vẽ code**, còn bản đóng gói dùng thân AI + ảnh vũ khí AI [đọc code]. Số đo ở mục 9 lấy từ bản đóng gói.

---

## 3. Nguồn hình vũ khí

### 3.1 Vẽ thủ tục bằng canvas: `weapon_art.js`
- Mỗi loại có 10 dòng (`FAM`), 3 nhánh hệ (`fire/poison/ice`) × giai đoạn 0–3 và 4 bậc (`RARITY`), xem `weapon_art.js:1-5`. Vũ khí là "sinh vật": thân dựng sẵn vào canvas đệm, còn **mặt vẽ lại mỗi khung** (`Face`, `:515`) theo `mood` ∈ `idle|calm|attack|hurt|sleep`.
- Phép đổi trục `Frame.T(t,q)` (`:88`) xoay (t,q) theo `ang` và co theo `ks`/`k`. Nó còn uốn thân theo `warp` (Độc), `arc` (lưỡi liềm) và `wave`.
- Nhớ đệm theo góc lượng tử 5°: `ASTEP = 5`, `qAng` (`:2237`), tối đa `CACHE_MAX = 600` (`:2222`).
```js
// weapon_art.js:2242
function draw(c, opts, x0, y0, ang, pull) {
  const P = params(opts || {}), a = qAng(ang), b = body(P, a);
  ...
  c.drawImage(b.cv, X + b.dx, Y + b.dy);
  const F = new Face(c, X, Y, b.fr, a, P, mood, t, isBow);
  if (isBow) bowString(c, P, b.fr, X, Y, Math.max(0, Math.min(1, pull || 0)));
```
- Góc nghỉ `REST = { sword: -90, spear: -90, hammer: -90, bow: 0 }` (`:2288`). Bảng này chỉ dùng để đo cỡ, vẽ ô đồ và vũ khí bay ở làng. Nó **khác** bảng `REST` trong hero_tinhlinh.js:909 (cùng tên, ý nghĩa khác).
- `tipLen(opts)` (`:2295`) cho khoảng cách từ điểm cầm tới mũi để fx.js vẽ vệt.

### 3.2 Ảnh AI: `game/art/custom/vk-*.sprite.json` (160 tệp)
- Trường (đọc ở `sprite_custom.js:1372 themDo`): `doi_tuong: "vu-khi"`, `rong`, `cao` (điểm ảnh game), `net` (2 = ảnh gấp đôi), `anh` (PNG base64), `vu_khi: { loai, dong, he, gd, cam:[x,y], mui:[x,y], day:[[x,y],[x,y]]|null }`.
  - `cam`: **điểm cầm**, gốc xoay. `mui`: mũi; hướng `cam→mui` là trục 0° của ảnh. `day`: hai đầu dây cung (chỉ cung).
  - Ví dụ: `vk-sword-0`: `cam [6.25, 9.5]`, `mui [44, 2.33]`. `vk-bow-0`: `cam [11.25, 19]`, `mui [25, 19]`, `day [[11, 0.25], [7.25, 37.75]]`.
- Biến thể: `vk-<loại>-<dòng>` cùng 3 tệp `-fire|-ice|-poison`. **Không có** tệp có hậu tố giai đoạn, nên `SC.timVuKhi` (`:1473`) luôn lọt xuống nhánh `b-branch` (gđ ≥ 2) hoặc `b`. Giai đoạn 1 dùng ảnh thường kèm hạt hệ.
- Chiều dài `cam→mui` của ảnh gốc (điểm ảnh game) [đã đo từ tệp]: kiếm 33,6–42,7; giáo 27,2 (dòng 9) và 36,8–51,9; búa 31,2–40,9; cung 9,1 (dòng 7) và 11,0–20,1. Hai món quá nhỏ được nhân thêm `G.CO_VK_DONG = { 'spear-9': 1.45, 'bow-7': 1.35 }` (`:1466`).
- `xoayVk(sp, a, rar, he, co)` (`:1554`) quay ảnh bằng **lấy mẫu điểm ảnh gần nhất** (không nhòe), góc làm tròn 5°. Nó thêm viền bậc (`RAR_VIEN`, `:1338`), nhuộm màu hệ ở gđ ≥ 2 (`pxHe`) và quầng sáng ở gđ 3. Nhớ đệm chung `XOAY_NHO` (tối đa 1 200, `:200`).
- Ảnh AI **không có mặt và không đổi theo `mood`**: `SC.veVuKhi` không đọc `opts.mood`. Vì thế vũ khí "nhăn mặt 0,5 giây khi bé trúng đòn" (`hero_tinhlinh.js:1793 HURT`) chỉ thấy được khi vẽ code [đọc code].

### 3.3 Hình tạm: `hero_tinhlinh.js:766–900`
`wSword/wBow/wSpear/wHammer`, gom trong `WDRAW` (`:887`), nhớ trong `WCACHE` (`taoNho('vk-em-be', {max: 901})`, `:888`). Đường này chỉ chạy khi `G.weaponArt` thiếu hoặc ném lỗi (`drawWeapon`, `:1354`).

---

## 4. Tệp ghép `ghep-<key>.sprite.json` và tệp đòn

### 4.1 Định dạng (parse ở `sprite_custom.js:1849 themGhep`, `:1840 docCap`)
| Trường | Ý nghĩa | Ví dụ thật |
|---|---|---|
| `diem` | điểm neo thân ở khung `idle:0` (tọa độ tính từ chân, x về trước mặt) | smith: `tay_truoc [5.5, -9]`, `dinh_dau [0.5, -27]`, `eo`, `lung`, `goc_canh` |
| `diem_theo` | điểm theo hàng/khung: khóa `run:i`, `atk:i`, `hit:i`, `tele:i` (tên code hoặc tên AI đều được, `khoaTheo` `:1876`) | 20 khóa (healer 21) |
| `diem_theo_than` | điểm riêng cho một tấm thân (`em-be-<key>` có hàng chạy 8 khung) | `{'em-be-smith': 8 khóa}` |
| `cap` | chỉnh theo cặp nhân vật + món, khóa `vk-<loại>` / `vk-<loại>-<dòng>` / mã tệp (món cụ thể nhất thắng). Mỗi mục `{dx, dy, xoay, bam, bam_vk, theo:{…}, da_chinh}` | cả 4 em bé chỉ có `theo` cho `tele:0–3`, `atk:0–5`, `hit:0–3` với `{"bam":"tay_truoc"}`; riêng cung ở `tele` thêm `"bam_vk":"day"`; mọi mục ghi `"da_chinh": false` |

- `bam`: tên điểm neo của thân mà bàn tay nắm vào. `bam_vk`: chỗ nắm trên vũ khí, gồm `"nam"` (mặc định của kiếm, giáo, búa: `HOLD`), `"cam"` (mặc định của cung: điểm cầm) và `"day"`. Code chỉ phân biệt `'cam'` với các giá trị còn lại (`:1380`): `"day"` cho cung đi vào công thức `-9 - 8*pull` (chỗ lắp tên), tức là giống hệt khi không ghi gì, chỉ khác mặc định `'cam'`.
- Khóa `atk:i` chỉ khớp hàng ảnh tên `atk`. Hàng đòn theo vũ khí (`atk_sword`…) có tên khác nên **không** dùng `cap.theo["atk:i"]`. Thay vào đó, nhánh "hàng đòn" (`hero_tinhlinh.js:1373`) tự gán `bam: 'tay_truoc'` [đọc code].

### 4.2 Tệp thân và tệp đòn
- `em-be-<key>.sprite.json` (thân gốc, 48×48, `net 2`) có hàng `idle 6, move 8, tele 4, atk 6, hit 3–4, die 8, ne 6`. Thân bộ `-rung|-bien|-lau` có `move 6`.
- `neo: { dau, than, tay }`. Mọi tệp ghi `tay: [0, 0]`, nên đường `o.neoTay` (`sprite_custom.js:1240`, `hero_tinhlinh.js:1663`) **không bao giờ chạy** [đọc code + đã kiểm tệp].
- Tệp đòn `-don` (`atk_sword/bow/spear` 6 khung 0,45 s, `atk_hammer` 6 khung 0,55 s, `cast` 6 khung 0,4 s) có cho: 4 thân gốc; smith-rung/bien/lau; hunter-bien/lau; wrestler-rung/bien/lau. **Không có** cho hunter-rung, healer-rung/bien/lau: các thân này đánh bằng hàng `atk` chung.
- Chọn khung đòn: `SC.khungDon` (`:586`). Kiếm đổi khung theo nhát: `i6 = 2*combo + (u >= 0.4)`, nghĩa là **mỗi nhát chỉ 2 khung ảnh**. Các loại khác theo mốc `MOC_DON` (`:585`), ví dụ `atk_hammer: [0, 0.2, 0.38, 0.45, 0.6, 0.8]`.

### 4.3 Bàn tay `tay_truoc` của thân AI: nguồn và thứ tự ưu tiên
```js
// sprite_custom.js:879 + :993 (bọc)
const da = SC.ghep[key] ? SC.diemAI(key, ten, i, kh, sp) : null;   // 'tep' (diem_theo) hoặc 'uoc-luong' (diem + khop)
if (!LA_DON[ten]) return da;
const tay = SC.tayAI(sp, ten, i);                                  // 'do-tu-dong' (doTay :817: tìm điểm xa thân nhất)
...
r.diem.tay_truoc = t; r.nguon.tay_truoc = 'bang-do';               // SC.TAY_KIEM / SC.TAY_DON nếu số điểm ảnh khung khớp ±max(4, 3%)
```
- `SC.TAY_KIEM` (`:910`) ghi tay đo tay cho 6 khung `atk_sword` của 4 thân gốc và 7 thân bộ. `SC.TAY_DON` (`:931`) ghi `atk_bow/spear/hammer` của 7 thân bộ. Mỗi khung kèm số điểm ảnh (`so`); ảnh vẽ lại khác số thì bảng tự thôi dùng (`tayBang`, `:979`).
- Nguồn đo được [đã đo, smith & hunter thân gốc]: đứng khung 0 `tep`, khung 1–5 `uoc-luong`; chạy `tep` (diem_theo_than); kiếm đánh `bang-do` 150/150 tick; giáo, búa, cung đánh chủ yếu `do-tu-dong`, xen một phần `uoc-luong` (búa smith 30/150, búa hunter 30/150, cung hunter 45/150) ở những khung `doTay` trả null.

---

## 5. Điểm neo, bàn tay, chỗ nắm trên hình

| Hằng số | Giá trị | Ở đâu | Ý nghĩa |
|---|---|---|---|
| `REST` (hero) | sword `{x:12,y:-9,ang:-90}`, bow `{16,-18,0}`, spear `{11,-15,-90}`, hammer `{12,-10,-90}` | `hero_tinhlinh.js:909` | điểm cầm và góc khi đứng (thân code) |
| `HOLD` | sword −5, spear −10, hammer −5 (bow: không) | `:910` | bàn tay nằm cách điểm cầm bao nhiêu dọc thân |
| cung | tay kéo dây `-9 - 8*pull`; trục quay `BPIV = [3,-16]`, bán kính `BRAD = 13` | `:932`, `:970` | |
| `G.CO_VK` | `{ sword: 0.66, bow: 0.52, spear: 0.59, hammer: 0.48, lang: 0.9, nam: 1.5 }` | `sprite_custom.js:1452` | hệ số co ảnh AI; `nam`: chỗ nắm trên ảnh (px ảnh gốc, tính từ `cam`) |
| `lechCo` | `rotv(lh - n, 0, ang)` với `n = nam × hệ số co` | `hero_tinhlinh.js:1324` | dời điểm vẽ để chỗ `nam` trên ảnh trùng bàn tay |

```js
// hero_tinhlinh.js:1380 (vkGhep0): đặt bàn tay của vũ khí đúng điểm bám của thân AI, góc giữ góc đòn
const Lh = kieu === 'cam' ? 0 : wp.type === 'bow' ? -9 - 8 * (wp.pull || 0) : HOLD[wp.type] || 0, h0 = rotv(Lh, 0, wp.ang), a1 = wp.ang + cv.xoay, ...
const tx = P[0] + cv.dx - nt[0], ty = P[1] + cv.dy - nt[1];
...
return { wp: Object.assign({}, wp, { x: Math.round(tx - h2[0]), y: Math.round(ty - h2[1]), ang: a2, lh: Lh }, ...), tay: [...], bam: true, P: [P[0] + cv.dx, P[1] + cv.dy] };
```
Bàn tay vẽ đè lên chuôi: nếu `G.KIEM_KHOP && G.KIEM_SAU` thì dùng `SC.veNam` (chỉ điểm ảnh bàn tay + 2 ngón), nếu chỉ có `G.KIEM_KHOP` thì `veTayAI` (đĩa r = 2,5), còn thân code thì vẽ ô vuông "bàn tay code" (`hero_tinhlinh.js:1691–1697`).

---

## 6. Góc vũ khí theo thời gian đòn

Đầu vào: `o.atk = 1 − P.atkT / P.atkDur` (`combat.js:1060`). Thời lượng đòn ở `moves.js`: kiếm 0,30 / 0,30 / 0,46 s (`:38–40`); giáo 0,38 / 0,34 / 0,34 / quét 0,52 s (`:63–66`); búa nện 0,8 s, `hitAt: 0.35` (`:74`); cung bắn 0,38 s đứng yên, 0,45 s khi chạy (`:54`). Mặc định đòn chạm ở u = 0,45 (`combat.js:801`).

### 6.1 Khung khóa (thân code; giáo, búa, cung trên thân AI)
`pick()` (`:1182`) đổi u sang khung xương: `f = floor(nhip(u)·ATKN)`, `ATKN = { sword: 10, hammer: 14, spear: 10, bow: 12 }`. `nhip()` (`:1146`) dồn nhịp: tới nhanh tư thế lấy đà `DA` rồi giữ, vung nhanh dần, giữ khung trúng 0,45..0,49, sau đó thu chậm dần. Góc lấy từ `kf(ATK[wt][combo], (f+0.5)/n)`, nội suy tuyến tính giữa các khóa:

| Loại / nhát | Góc `ang` (độ; 0 = trước mặt, âm = chĩa lên) tại các mốc tư thế u |
|---|---|
| Kiếm nhát 1 | 0: −95 → 0,22: −150 → 0,45: 15 → 0,6: 38 → 0,82: 10 → 1: −75 |
| Kiếm nhát 2 | −95 → 0,22: 60 → 0,45: −55 → 0,6: −120 → 0,82: −100 → −75 |
| Kiếm nhát 3 | −95 → 0,2: −170 → 0,45: 35 → 0,6: 52 → 0,82: 20 → −75 |
| Giáo nhát 1/2/3 | −8 → 0,25: −3/−14/4 → 0,45: 0/−14/0 → 0,62: 2/−12/3 → 0,85: −4/−6/−4 → −8 (đâm ngang, chủ yếu dời x) |
| Giáo quét (`sweep`) | `ang = round(7·sin θ)`, ép bẹt ngang `sx = cos θ` (`:1110`) |
| Búa nhát 1 (= nhát 2) | −85 → 0,28: −135 → 0,45: 42 → 0,6: 44 → 0,8: 10 → −85 |
| Búa nhát 3 | −85 → 0,28: −155 → 0,45: 44 → 0,6: 44 → 0,8: 10 → −85 |
| Cung | góc = hướng nhắm `bowRel` (nấc 15°). Chỉ đổi `pull`: `bowPull(u)` 0,3→1 (u < 0,3), giữ 1, buông ở 0,45, giật lùi 0,45–0,6 (`:977`) |
| Chiêu (`SPEC`) | kiếm −90 → −170 → 20 → 30 → 10; giáo 0 → 2 → −4; cung −55 → −68 → −62 → −25; búa 44 → 44 → 10 → −85 (`:1009`) |

Hướng nhắm: `aimRot` (`:1022`) xoay quanh `ps.pv` (chỗ nắm) thêm `rel = (ai−6)·15`. Nếu `rel ≤ −45` thì vẽ sau thân, nếu `rel ≥ 45` thì vẽ trước thân.

### 6.2 Kiếm trên thân AI: `kiemMuot` (G.KIEM_MUOT)
Mỗi nhát là **một** đường vung theo tiến độ `tienDo(u, D, F, T)` (`:1551`). Các pha: lấy đà 0→0,26 (lùi thêm 14°), giữ đến 0,33, vung 0,33→0,48 (eIO3), theo đà đến 0,62, thu kiếm đến 1 (lùi 30% về −65°). Góc đầu, góc chém, góc theo đà lấy từ **bảng riêng từng em bé** `VUNG` (`:1540`):
```js
const VUNG = {
  _: [[-140, 5, 25], [45, -30, -40], [-160, 30, 48]],
  _hunter: [[-140, 12, 30], [45, -5, -15], [-160, 30, 48]],
  smith: [[-140, 8, 28], [40, -50, -62], [-165, 35, 55]],
  hunter: [[-140, 0, 22], [50, -60, -80], [-165, 30, 50]],
```
Chỉ áp khi `gv.ten` là `atk_sword` hoặc `move` (chạy chém) (`:1597`). Thân bộ không có tệp `-don` (hàng `atk`) thì quay về khung khóa 6.1 cộng `kiemKhop` [đọc code].

### 6.3 Đường vung thực tế [đã đo, mỗi tick 1/60 s, đứng yên, quay phải]
Kiếm, Cu Tí (smith) thân gốc, `vk-sword-0` (u:góc, S = sau thân, Tc = trước thân nhưng cắt phần trong đĩa đầu):
```
nhát 1: 0.00:-192S 0.11:-167S 0.22:-160S 0.33:-156S 0.39:-116S 0.44:-1Tc 0.50:13Tc 0.61:28Tc 0.72:24Tc 0.83:11Tc 1.00:0Tc
nhát 2: 0.00:20Tc 0.11:47Tc 0.22:54Tc 0.33:56Tc 0.39:30Tc 0.44:-44Tc 0.56:-59Tc 0.61..1.00:-62Tc
nhát 3: 0.00:-120S 0.11:-172S 0.25:-179S 0.33:-181S 0.40:-99S 0.43:11Tc 0.51:42Tc 0.62:55Tc 0.80:39Tc 0.98:19Tc
```
Cu Tèo (hunter) giống về hình dạng, lệch theo `VUNG.hunter`: nhát 2 xuống tới −80°. Bước lớn nhất **115°/tick** rơi vào cú vung u 0,39→0,44 (chủ ý: 0,33→0,48 chỉ khoảng 3 tick với đòn 0,3 s).

Búa: Cu Tí `0.00:-152 0.04:-101 0.08:-49 … 0.17:-47 0.19:-130 0.21:-70 … 0.38:-72 0.40:-92 0.42:-17 0.44:42 … 0.62:31 0.71:0 0.77:-34 0.81:-14 0.83..:-18` (mọi tick đều trước thân, cắt đầu).
Búa: Cu Tèo `0.06:-124 0.08:-104 0.12:-117 0.19:-190 … 0.35:-190 0.38:-37 0.40:-92 0.42:-17 0.44:42`. Góc **giật qua lại** −117 → −190 → −37 → −92 → −17 trong 5 tick. Đây là luật né mặt của búa (`kiemKhop` `:1511–1516`) đổi lời giải giữa các khung.
Giáo: gần như nằm ngang (−14..7°), riêng Cu Tèo nhát 2 có `0.44:-14 0.49:-59 0.54:-58 0.59:-11` (nhảy 45° trong 2 tick rồi về) và nhát 1/3 có `0.44:0 0.48:20 0.57:1`.
Cung: góc 0 suốt đòn; `pull` lần lượt 0,15 / 0,4 / 0,59 / 0,79 / 0,98 / 1 rồi 0.

Ảnh minh họa: `anh/vk-smith-kiem.png` (3 nhát), `anh/vk-hunter-kiem.png`, `anh/vk-smith-giao.png` (nhát 1 + quét vòng), `anh/vk-smith-bua.png`, `anh/vk-hunter-bua.png`, `anh/vk-smith-cung.png`, `anh/vk-smith-kiem-trang-thai.png` và `anh/vk-smith-bua-trang-thai.png` (đứng, chạy, lộn, trúng đòn).

---

## 7. Lớp vẽ, che mặt, nối góc giữa các trạng thái

### 7.1 Thứ tự vẽ (`drawFrame`, `hero_tinhlinh.js:1660`)
```js
if (G.KIEM_SAU && wp && (vg.sau || (wp.front && vg.dau))) {
  if (vg.sau) { veVk(); c.drawImage(fr.cv, …); if (vg.sau.tach) { veCat(oChuoi(…), false); nam(vg.sau.H, vg.sau.a); } return; }  // cả cây sau thân, khúc chuôi trước
  const L = oDau(vg.dau); veCat(L, false); c.drawImage(fr.cv, …); veCat(L, true); …                                  // lưỡi trong đĩa đầu: sau đầu
}
if (wp && !wp.front) veVk();
c.drawImage(fr.cv, fr.ox, fr.oy, fr.w, fr.h);
if (wp && wp.front) { veVk(); /* bàn tay AI hoặc ô bàn tay code */ }
```
- `wp.front` ban đầu do tư thế đặt: `attach` gán `front: wt !== 'bow'`; idle/run/hurt/dodge/die/cast gán `front: false`; `bowPose` gán `true` khi ngắm xuống > 40°. Sau đó các bước sau đè lên: `cap.truoc` (`:1368`, `:1374`: kiếm, giáo, búa bám tay thì trước thân), `aimRot`, `kiemKhop`, `kiemMuot`, rồi `kiemSau` (`front: false` khi không đánh).
- Cắt theo điểm ảnh: `oDau` (đĩa đầu `dauTu`: tâm = mặt − 0,6·r, bán kính 2·r + 1,2) và `oChuoi` (khúc chuôi từ −8 đến +3,5 dọc trục, rộng ±5), xem `:1452–1465`.

### 7.2 Che mặt: 3 lớp luật chồng nhau
| Luật | Cờ | Áp cho | Cách làm |
|---|---|---|---|
| `kiemKhop` `:1478` | `G.KIEM_KHOP` (+`G.VK_NE_MAT`, `G.VK_KHOP`) | kiếm (đánh); giáo, búa (mọi lúc, khi bật `VK_NE_MAT`) | kiểm hình học "lưỡi đi qua đĩa mặt" (`m.r + day`, `NE_MAT_DAY = {1.5, 2, 3}`). Nếu chạm thì xoay từng 5° (tối đa 50/60/70°) hoặc vẽ sau thân. `VK_KHOP` ước bề dày lưỡi từ diện tích ảnh |
| `kiemMuot` `:1593` | `G.KIEM_MUOT` (cần cả `G.KIEM_KHOP`) | kiếm trên thân AI | chọn lớp một lần cho mỗi khung thân (`truocOk`); `kepMat` kẹp góc trước mặt |
| `kiemSau` `:1408` | `G.KIEM_SAU` | kiếm, giáo, búa trên thân AI | không đánh: góc kéo sau lưng `a = clamp(180 − asin(sn), 140, 170)` để mũi chạm đất (`KS.mui`), lộn/chết `KS.lon = 0`. Đánh: chỉ cắt đĩa đầu |

Vùng mặt `SC.matKhung` (`sprite_custom.js:1094`) do máy tự đo trên hình bóng khung: đĩa đầu `dauKhung`, dời 0,3·R về trước và xuống, bán kính 0,5·R. Đo hỏng thì `matKhungGan` mượn khung gần nhất trong cùng hàng, rồi hàng chạy, các hàng khác, cuối cùng thân gốc (`:1108`).

[đã đo] Không tick nào (8 ca × 380 tick) có lưỡi đi qua đĩa mặt mà vẫn vẽ trước thân **không cắt**. Mọi tick lưỡi đè mặt về hình học (búa đánh 30–36/150 tick, giáo hunter 32/150, kiếm 5–7/150) đều rơi vào nhánh cắt đầu hoặc sau lưng.

### 7.3 Nối góc giữa các trạng thái (bộ nhớ `NHO_GOC`, `:1575`)
- `ghiGoc` ghi góc đã vẽ (`ve`) và góc khung đòn cuối (`don`).
- `kiemSau` không đánh: tiến dần tới góc đích, tối đa `KS.toc = 1500`°/s, τ = 0,05 s (`:1443`). Vào đòn: dàn độ lệch ban đầu ra `KS.vao = 6` khung vẽ (`:1423–1429`). Đo được [đã đo]: giáo nhát đầu sau khi đứng `104 → 76 → 50 → 23 → −5` (khoảng 27°/tick).
- `kiemMuot` sau đòn: xoay về góc đứng trong `MU.sau = 0.14` s. Đầu nhát: đi tiếp từ góc cũ trong `MU.vao = 0.12` (đứng) hoặc `MU.u2` (chạy).

---

## 8. Bảng loại vũ khí × trạng thái (thân AI, bản đóng gói, các cờ mặc định)

Viết tắt: **bám** = điểm cầm đặt theo `tay_truoc` của khung ảnh AI; **khung xương** = theo tư thế code `pose()`, không bám tay AI. Góc đo là `ang` lúc vẽ, quay phải [đã đo trên smith & hunter, `vk-*-0`].

| Trạng thái (hàng ảnh) | Kiếm | Giáo | Búa | Cung |
|---|---|---|---|---|
| Đứng (`idle`) | ghép code, **sau lưng** (khúc chuôi trước), bám (`tep`/`uoc-luong`), góc 159–162° | như kiếm, 163° | như kiếm, 156–160° (nhánh "xoay 65°" ở `:1369` bị `kiemSau` đè) | ghép code, sau thân, bám điểm cầm + dx 2, góc 0° |
| Chạy (`move`) | sau lưng, bám `tep` (diem_theo_than), 149–162°, điểm cầm nảy ≤ 5,5 px/tick | 154–163° | 144–159° | sau thân, −6° |
| Đánh (`atk_<loại>` hoặc `atk`) | `kiemMuot`, bám `bang-do`; lấy đà sau thân, vung **trước + cắt đầu** | khung khóa + `kiemKhop`, bám `do-tu-dong`; trước + cắt đầu (nhát 1–3), trước rồi sau (quét: **không bám**, ép bẹt `sx`) | khung khóa + `kiemKhop`, trước + cắt đầu suốt đòn | `bowPose`, sau thân, góc = hướng nhắm, `pull` động |
| Chạy mà đánh (`move`, `G.CHAY_DANH='than'`) | `kiemMuot` với `VUNG._`/`_hunter`, bám `tep` | khung khóa, bám tay của khung chạy | như đứng | như đứng |
| Giữ lấy đà (`tele`/hàng đòn khung giữ) | `attach(...YEN0)`, `cap.tele` bám tay, kiếm −95 − 30·c | giáo lùi theo c | búa giơ −85 − 55·c | `bowPose`, bám `"day"` |
| Chiêu (`spec`) / chưởng (`cast`) | SPEC + `nhipChieu`; `kiemMuot` tính liền theo thời gian | SPEC | SPEC | SPEC |
| Lướt (`dash` → hàng `move`) | `attach` ngang (hang 86), bám tay khung chạy (nhánh `CO_VK`) | như kiếm | như kiếm | `x:16,y:-17`, ngả 20° |
| Trúng đòn (`hit`) | sau lưng, bám `tep` (cap `hit:i`), 141–158° | 144–161° | 139–155° | sau thân, 0–12° |
| Lộn (`ne`) | **khung xương, không bám** (`ne` không có trong cap), góc về `KS.lon = 0`, sau thân. Lệch tay đo được 4,8–6 px trung bình, **tối đa 10–11 px** | như kiếm | như kiếm | −90 + tilt, sau thân |
| Chết (`die`) | khung xương (`vkNga`: nằm ngay từ khung đầu), không bám, `kiemSau`/`kiemKhop` bỏ qua khi chết [đọc code, chưa đo] | như kiếm | như kiếm | như kiếm |
| Giáo đang bay | — | **ẩn** (`type: 'fist'`, `combat.js:1063`) | — | — |

Thân code (bản `index.html`): mọi trạng thái theo khung xương `pose()` và `attach()`, với `front` như mục 7.1. Không có `kiemMuot`, `kiemSau` hay `kiemKhop`, vì cả ba cần `gv` (khung AI) [đọc code].

---

## 9. Đo bằng Playwright: phương pháp và số chính

Script nằm ngoài repo (thư mục tạm `scratchpad/pl3/do_vk.js`, `do_vk.py`). Script nạp `tests/bot.js`, `setup.js`, `au_lib.js`. Mỗi tick nó chạy `AU.run(1, true)` rồi `G.drawWorld()`. Trong lúc vẽ, nó **bọc tạm** `G.art.hero`, `G.weaponArt.draw` và `G.spriteCustom.veKhung` để ghi tham số vẽ thật (điểm cầm, góc, pull, thứ tự vẽ thân/vũ khí), rồi trả lại hàm gốc. Song song, nó đọc `G.tinhLinh.vkGhep(o)`, `SC.khungVk(o)` và `SC.diemKhung(...)`. Các pha: đứng 30 tick, chạy 30, đánh 150 (bấm mỗi 5 tick), chạy đánh 60, lộn 24, trúng đòn 16. Có 2 em bé (smith, hunter thân gốc) × 4 vũ khí dòng 0. Không có pageerror.

| Ca | Lệch tay* trung bình/tối đa (đánh) | Bước góc lớn nhất/tick (đánh) | Lớp khi đánh (tick) | Ghi chú |
|---|---|---|---|---|
| smith kiếm | 0,44 / 0,9 px | 115° (cú vung) | sau 48, trước-cắt-đầu 102 | đứng: sau lưng 30/30 |
| hunter kiếm | 0,38 / 0,8 | 110° | sau 48, trước-cắt 102 | |
| smith giáo | 0,5 / 1,3 (quét: **12,2**) | 30° | trước-cắt 118, trước 16, sau 16 | quét không bám tay |
| hunter giáo | 0,48 / 1,3 (quét: 12,7) | 47° | trước-cắt 86, sau 48, trước 16 | giật −14 → −59 → −11 |
| smith búa | 0,36 / 0,9 | 83° | trước-cắt 150 | |
| hunter búa | 0,48 / 1,0 | **153°** | trước-cắt 150 | giật −117 → −190 → −37 → −92 |
| cung (cả hai) | (cầm ở điểm cầm) | 0° | sau 150 | điểm cầm nảy tới 7 px/tick (hunter) |
| lộn (mọi vũ khí) | 4,8–6,2 / **8,5–11,2** | 25° | sau thân | vũ khí không theo tay AI |

\* Lệch tay = khoảng cách giữa chỗ nắm thiết kế (điểm cầm + `lh` dọc thân) và `tay_truoc` của khung AI. Với các khung có bám, số này gần 0 theo cách dựng (chỉ còn sai số làm tròn). Nó chỉ có ý nghĩa ở các khung không bám (lộn, quét).

---

## 10. Hiệu ứng trên vũ khí

| Hiệu ứng | Vẽ code (`weapon_art.js`) | Ảnh AI (`sprite_custom.js`) |
|---|---|---|
| Mặt, tâm trạng | `Face` `:515`: mắt, chân mày, miệng theo `mood`; chớp mắt khi `idle` (`:520`) | không có |
| Hệ Lửa/Độc/Băng | đổi chất liệu theo giai đoạn: dấu hệ `seed` (gđ 1), hạt `motes` (gđ 2–3), `flame`/`crystal`/`thorn`/`vine`, uốn `warp` (Độc) | gđ 1: hạt `hatHe` (tàn lửa bay, giọt nọc + bọt, lấp lánh băng); gđ ≥ 2: nhuộm `pxHe` (45%/70%, từ `HE_T0` dọc thân), viền màu hệ; gđ 3: quầng sáng `glow` (`lighter`, nhấp nháy 0,3 + 0,12·sin 5t) và lửa liếm dọc lưỡi |
| Bậc | `gild(rar)` trang trí, đá `gem`; bậc Vàng có `twinkle` (`:2255`) | viền 1 px màu bậc `RAR_VIEN` |
| Phủ hệ tạm (`coat`, bùa/Nung) | `drawWeapon` `:1340`: chưa có nhánh thì hiện như Mầm của hệ đó | như cột trái (qua `heCua`) |
| Dây cung + tên | `bowString` `:2268` (dây gãy ở điểm kéo, tên khi `pull > 0.02`) | `SC.veVuKhi` `:1655–1665`: dây giữa hai điểm `day`, kéo lùi `0.35·span·pull`, tên dài `0.55·span` |

---

## 11. Điểm nối với vệt chém (fx.js)

- `G.tinhLinh.tip(o)` (`hero_tinhlinh.js:1850`) gọi lại `vkGhep(o, frame(o))`, tức là **đúng hình đang vẽ**. Kết quả: `{ anim, u, wt, combo, gx, gy (điểm cầm, tọa độ màn hình, đã lật), dx, dy (hướng thân), L (dài điểm cầm → mũi), front }`. Khi `G.CO_VK` bật, `gx, gy` cộng `lechCo` và `L = |mui−cam| × coVk`. Cung trả `null`.
- `fx.js:382 cungVk(P, win)` lấy 41 mẫu `o.atk = i/40`, gọi `TL.tip(o)` từng mẫu và lấy `q.front` cùng hướng `dx` để loại đoạn "sau lưng" (khi `G.KIEM_KHOP`, hoặc khi `!G.VET_TRON && G.KIEM_MUOT`).
- Chú ý [đọc code]: `tip()` không hoàn toàn "chỉ đọc". Qua `kiemMuot` nó có thể ghi `r.dau` (`:1644`), và qua `kiemSau` có thể tăng `r.ksVao.n` (`:1426`) trong bộ nhớ `NHO_GOC`. Xem lỗi L7.

---

## 12. Toàn bộ cờ `G.*` liên quan vũ khí

| Cờ | Mặc định | Tắt bằng URL | Khai báo | Tác dụng lên vũ khí |
|---|---|---|---|---|
| `G.CO_VK` | `{sword .66, bow .52, spear .59, hammer .48, lang .9, nam 1.5}` | `?covk=0` (→ `null`) | `sprite_custom.js:1449` | co ảnh AI; `lechCo`; bám tay ở idle/move (`hero_tinhlinh.js:1367`); `tip` dùng dài ảnh; `cungVk` chỉ chạy khi bật; `G.nhipChieu` |
| `G.CO_VK_DONG` | `{'spear-9': 1.45, 'bow-7': 1.35}` | không có (gán `null`) | `:1466` | nhân thêm cỡ cho 2 món nhỏ |
| `G.DON_VK` | `true` | `?donvk=0` | `:24` | dùng hàng đòn theo vũ khí của thân (tư thế thân); `SC.TAY_DON`; `khungVk` trả về cả khi chưa có tệp ghép |
| `G.KIEM_KHOP` | `true` | `?kiemkhop=0` | `:895` | `SC.TAY_KIEM`; `matKhung` trong `khungVk`; `kiemKhop`; `veTayAI`; điều kiện của `kiemMuot` |
| `G.VK_KHOP` | `true` | `?vkkhop=0` | `:902` | bề dày lưỡi theo ảnh; búa lấy đà nghiêng về trước |
| `G.VK_NE_MAT` | `true` | `?vknemat=0` | `hero_tinhlinh.js:1476` | né mặt cho giáo, búa và cả lúc không đánh |
| `G.KIEM_SAU` | `true` | `?kiemsau=0` | **hai nơi**: `hero_tinhlinh.js:1402` và `sprite_custom.js:1032` | kéo vũ khí sau lưng; cắt đĩa đầu; `veNam`; `matKhungGan` |
| `G.KIEM_MUOT` | `true` | `?kiemmuot=0` | `hero_tinhlinh.js:1536` | đường vung kiếm liên tục |
| `G.VK_NGA` | `true` | `?vknga=0` | `hero_tinhlinh.js:1292` | vũ khí nằm theo thân AI ngay khung chết đầu |
| `G.CHAY_DANH` | `'than'` | `?chaydanh=0\|than\|lai\|nhun` | `sprite_custom.js:38` | hàng thân khi chạy mà đánh, nên quyết định cả nguồn bàn tay và `VUNG._` |
| `G.NHUN_BUOC` | `true` | `?nhunbuoc=0` | `:39` | nhún 1 px; vũ khí và `tip` cùng nhún |
| `G.KHUNG_TRUNG` | `true` | `?khungtrung=0` | `:62` | thứ tự khung ảnh, ảnh hưởng gián tiếp tới `tay_truoc` |
| `G.DAU_THAT` | `true` | `?dauthat=0` | `:1007` | dời điểm đầu (không phải `tay_truoc`); `matKhung` dùng chung |
| `G.VET_TRON` | `true` | `?vettron=0` | `fx.js:378` | chỉ là điểm nối: cách `cungVk` dùng `q.front` |
| `G.BO_THAN` | `true` | `?bothan=0` | `sprite_custom.js:435` | `false` → bút giả kiểu cũ (`:1273`); không đổi hình vũ khí |
| `G.nhipChieu` (hàm) | | | `hero_tinhlinh.js:1156` | dồn nhịp Trảm Nguyệt khi `G.CO_VK` |

---

## 13. Lỗi tiềm ẩn (kèm bằng chứng)

| # | Lỗi | Bằng chứng | Loại |
|---|---|---|---|
| L1 | **Búa: sát thương tới trước hình.** Đòn chạm ở u = 0,35 (`moves.js:74 hitAt: 0.35`, `combat.js:801`), nhưng tư thế búa (`nhip`, `DA.hammer 0.28`) và khung ảnh (`MOC_DON.atk_hammer` khung chạm 0,45, `sprite_custom.js:585`) đều coi 0,45 là lúc chạm. | Đo: u 0,35–0,38 búa vẫn giơ ở −70° (smith) / −190° (hunter); 42° chỉ tới ở u 0,44. Trễ 0,09 × 0,8 s ≈ **72 ms**. Ảnh `vk-smith-bua.png` khung u = 0,38: hiệu ứng nện đất đã nổ trong khi búa còn trên cao | đã đo + đã thấy |
| L2 | **Góc búa/giáo giật** khi luật né mặt đổi lời giải giữa các khung (`kiemKhop`: thử ngả sau 5..60°, rồi nghiêng trước 5..70°, `:1511–1516`; khung ảnh và vùng mặt đổi theo khung). | Đo: hunter búa −117 → −190 → −37 → −92 → −17 → 42 trong 6 tick (153°/tick); hunter giáo nhát 2 −14 → −59 → −58 → −11 | đã đo |
| L3 | **Lộn: vũ khí không theo tay AI.** Hàng `ne` không nằm trong `cap`, không phải hàng đòn, không phải idle/move, nên không bám. Vũ khí theo khung xương `{x:4,y:-11}` cộng `KS.lon = 0`. | Đo: lệch tay trung bình 4,8–6,2 px, tối đa 8,5–11,2 px ở cả 8 ca (ảnh `vk-smith-kiem-trang-thai.png` hàng "ne") | đã đo |
| L4 | **Giáo quét vòng không bám tay**: `wp.sx != null` bỏ qua bám (`:1367`, `:1373`, `:1376`). Hình ép bẹt quanh điểm cầm khung xương. | Đo: lệch tay tối đa 12,2–12,7 px (đứng), 6,1–6,3 (chạy) | đã đo |
| L5 | **Chết: không bám tay**, `kiemSau`/`kiemKhop` thoát sớm khi `p.dead` (`:1411`, `:1484`). Vũ khí nằm theo khung xương `R.x+2q…` (`:1078`). | code | đọc code (chưa đo) |
| L6 | **Ba công thức "dài lưỡi tính từ tay" khác nhau**: `kiemKhop` `:1490` và `daiLuoi` `:1563` dùng `|mui−cam|·co − HOLD` (cộng 5); `kiemSau` `:1436` dùng `− namVk` (trừ khoảng 1). Kiếm `vk-sword-0`: 30,4 so với 24,4 px. Né mặt khi đánh và góc kéo sau lưng vì vậy dùng hai độ dài lưỡi khác nhau cho cùng một cây. | code + số đo `dai = 25.36`, `nam = 0.99` | đọc code + đã đo |
| L7 | **Hàm truy vấn có tác dụng phụ**: `tip()` (fx gọi 41 lần mỗi khung trong `cungVk`) → `kiemMuot` ghi `r.dau` (`:1644`), `kiemSau` tăng `r.ksVao.n` (`:1426`). Nếu `cungVk` chạy **trước** lần vẽ ở một khung mới (`t > v.tl`) thì bước "vào đòn" có thể bị tiêu trước. | code; chưa đo khác biệt | suy luận |
| L8 | **Logic trùng/bị đè giữa các nhánh cờ**: (a) `vkGhep0` xoay búa đứng 65° (`:1369`) nhưng `kiemSau` tính lại góc từ đầu (đo: búa đứng 156–160°), nên nhánh này chết khi `G.KIEM_SAU` bật; (b) nhánh "không đánh" của `kiemKhop` (`:1518–1521`) cũng bị `kiemSau` đè; (c) `kiemMuot` thay hẳn kết quả `kiemKhop` (`:1385`); (d) `G.KIEM_SAU` khai báo 2 lần (`hero_tinhlinh.js:1402`, `sprite_custom.js:1032`); (e) `aimRot` và `ps.front` bị 4 tầng sau ghi đè. | code + đo | đọc code + đã đo |
| L9 | **Số "ma thuật" theo từng em bé, từng khung**: `VUNG` theo key (`:1540`); `SC.TAY_KIEM` 11 bảng × 6 khung và `SC.TAY_DON` 7 thân × 3 hàng × 6 khung, khóa bằng **số điểm ảnh** khung (`:910–975`); `KS` (`min 140, max 170, mui, chuoi [-8,3.5], rong 5`); `NE_MAT_DAY`; `dauTu` 0,6 / 1,2; `matKhung` 0,3R / 0,5R; `G.CO_VK` từng loại + `nam 1.5`; `CO_VK_DONG`; `HOLD`; búa 65°, cung dx 2; mặc định `L = 24`; `tip` dự phòng 48/34/36; Phi Thương 22 px. Nhập lại ảnh là lệch, và bảng tay tự tắt thì rơi về máy đo. | code | đọc code |
| L10 | **Nhảy vị trí khi đổi khung**: điểm cầm đi theo `tay_truoc` của từng khung nên nảy cùng ảnh. | Đo: chạy nảy tới 5,5 px/tick; kiếm đánh tới 24,6 px/tick (lúc thân đổi khung lấy đà → chém, u 0,4); giáo 20–21 px; cung 7 px | đã đo |
| L11 | **Lượng tử góc 5°** ở cả hai đường vẽ (`qAng`, `xoayVk`): vung chậm (thu kiếm, kéo sau lưng) thì góc đi từng bậc. | code | đọc code |
| L12 | **Mỗi nhát kiếm chỉ có 2 khung thân** (`khungDon`: `2*combo + (u >= 0.4)`), nên kiếm vung qua cả 100–180° trong khi thân đứng yên. | code + đo (`atk_sword0` → `1` ở u 0,40–0,44) | đã đo |
| L13 | **Đường chết `neoTay`**: mọi tệp `em-be` ghi `neo.tay [0,0]`, nên `o.neoTay` không bao giờ được gán. | `sprite_custom.js:1240` + tệp | đọc code |
| L14 | **Ảnh AI bỏ `mood`**: vũ khí "nhăn mặt khi trúng đòn" (`HURT`, `:1793`) và mắt khi đánh chỉ có ở vẽ code, mà bản đóng gói có đủ 160 ảnh. | `SC.veVuKhi` `:1641` | đọc code |
| L15 | **Thân bộ thiếu tệp `-don`** (hunter-rung, healer-rung/bien/lau): kiếm quay về khung khóa + `kiemKhop` (không có `kiemMuot`); giáo, búa, cung cũng không có bảng tay `TAY_DON`. Chất lượng vung vì vậy khác nhau giữa các bộ đồ. | danh sách tệp + `kiemMuot :1597` | đọc code |
| L16 | Cung luôn vẽ **sau thân** (`front: false`, trừ ngắm xuống > 40°). Dây cung và tên có thể bị thân che khi cung sát người; `dx: 2` chỉ là vá cục bộ cho idle/move. | `:1369`, `:985` | suy luận |

Xuyên vũ khí qua thân: khi đánh, luật hiện tại **cố ý** vẽ lưỡi trước thân, chỉ phần trong đĩa đầu được đưa ra sau. Vì vậy lưỡi vẫn đè ngang ngực và tay sau [đã thấy trong `vk-smith-kiem.png`: nhát 2 u 0,00–0,39, lưỡi chúc xuống đè qua thân]. Khi không đánh, phần lưỡi sau lưng bị thân che, và chỗ thân hẹp có thể để lưỡi lộ ra dưới nách (chưa đo).

---

## 14. Cần giữ lại khi làm lại animation
- **Hợp đồng vẽ**: `G.weaponArt.draw(c, opts, x0, y0, ang, pull)` (điểm cầm, độ, 0 = trước, âm = lên), `fromWeapon`, `tipLen`, `icon`. Cần giữ cả ô đồ, đồ rơi, làng và Phi Thương.
- **`G.tinhLinh.tip(o)`** cùng định dạng `TIP` (fx.js `cungVk`, vệt chém). `G.tinhLinh.info`, `vkGhep` (trang thử).
- Nhịp gameplay: `atkDur`, `hitAt` (0,45 mặc định, búa 0,35), `comboI`, `aimRel` (nấc 15°), `bowPull` buông tên ở 0,45. Hình phải bám các mốc này, không được đổi ngược lại.
- Dữ liệu ảnh vũ khí AI (`cam`, `mui`, `day`, `net`) và cơ chế nhuộm hệ/bậc (gameplay hiển thị tiến hóa vũ khí).
- Tệp ghép (`diem`, `diem_theo`, `diem_theo_than`, `cap.bam`) và bảng tay đo tay: đây là nguồn đúng nhất hiện có cho vị trí bàn tay AI.

Gợi ý cấu trúc khi thay [suy luận]: mỗi khung thân xuất kèm **một socket tay** (`tay_truoc: [x,y]`, `goc_tay`, `lop: truoc|sau`, `vung_mat`). Đặt cho mọi hàng kể cả `ne`, `die`, quét. Một hàm duy nhất tính `{grip, ang, front}` từ (loại, nhát, u), thay cho 4 tầng `vkGhep0 → kiemKhop → kiemMuot → kiemSau`. Một hằng số dài lưỡi (`|mui−cam|·co − nam`) dùng chung. Đặt tên khóa theo `<hàng ảnh>:<khung>` như `diem_theo` đang dùng.

---

## 15. Chưa chắc / chưa đo
- Chỉ đo 2 em bé thân gốc (smith, hunter) với vũ khí dòng 0. Thân bộ, các dòng 1–9 (lưỡi bản to, `VK_KHOP`) và healer/wrestler chưa đo lại ở phiên này.
- Chưa đo: chết, giữ lấy đà (`tele`), chiêu, chưởng, lướt chém; đánh chếch lên/xuống (`aimRel ≠ 0`); quay trái (`face = −1`, có `+1` px khi lật, `:1808`).
- L7 (tác dụng phụ của `tip`) chưa đo được ảnh hưởng thực.
- "Không che mặt" ở mục 7.2 chỉ là phép thử hình học (đoạn chỗ nắm → mũi so với đĩa `matKhung`). Đây không phải đếm điểm ảnh như phiên `kiem-khong-che-mat`.
- `game/dist/linh-khi.html` được giả định trùng commit `229e263`: tệp dist dựng 11:11, sau thời điểm commit 11:10, và có chuỗi `VET_TRON`. Chưa so từng byte.
