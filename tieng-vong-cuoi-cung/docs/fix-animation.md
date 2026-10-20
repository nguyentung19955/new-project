# Sửa nhấp nhô / rung giật animation (2026-10-20)

Làm theo `docs/yeu-cau-fix-animation.md`. Mọi số dưới đây là **đo bằng chạy thử thật** (Chromium headless, màn iPhone ngang 844×390 @3x,
đồng hồ rAF giả 60 Hz và 120 Hz), không phải ước đoán. Công cụ đo: `python3 game/tools/do-animation.py` (tự dựng bản "trước" từ commit gốc
trong thư mục tạm, chạy cả hai, ghi `game/xem-thu/anh/do-animation.json`, ảnh `debug-*.png`, GIF `truoc-sau-*.gif`).

Cách đo: bọc `ctx.drawImage` để lấy **toạ độ vẽ thật** của sprite (ma trận transform + ô nguồn) → suy ra trên màn tâm thân, đỉnh mũ, đế ủng;
so với **pivot vật lý** (giữa đáy hitbox, đã nội suy). "Giật" = độ đổi của (sprite − pivot vật lý) giữa 2 lần vẽ liền nhau, tức là phần
chuyển động **không do vật lý** gây ra. Đơn vị: px logic 960×540 (trên iPhone 1 px logic ≈ 2,17 px thật).

## 1. Nguyên nhân (đã kiểm từng cái)

| # | Nguyên nhân | Lỗi CODE hay ẢNH | Ở đâu (bản trước) | Số đo |
|---|---|---|---|---|
| A | **Đòn đánh khoá theo "gót chân sau"**. Khi ảnh đổi thế chân (bước tới / co chân), gót nhảy chỗ → code kéo cả người lùi | code (quy tắc căn) | `game/tools/chibi-sheets.py` dòng 159–175 (`HREF = info['combo-3/1']['got']`, nhánh `else` khoá `got`) → `dx` trong `lam-chibi.json` | đòn 1 (combo-3/4) thân lùi **20 px** trong 1 khung; đòn 2 (combo-1/4, khung CHẠM) lùi **23,8 px** rồi nhảy lại |
| B | **Chạy / đứng khoá theo "tâm mắt"** + mỗi animation có mốc ngang khác nhau (idle thân ở −5,5, chạy +8, đòn +2…) → **lật mặt** (quay đầu) làm thân nhảy 2 × lệch đó; đổi animation thân trượt ngang | code | `chibi-sheets.py` dòng 162–164 (`kh == 'mat'`), lật quanh pivot trong `veBuoc` (`demo.html` dòng 1141) | quay đầu khi chạy: thân nhảy **15,9 px**; nhảy (jump/2) lệch **14,2 px** |
| C | **Cộng độ cao giả**: khung nhảy 2–4 và chém xoay được đặt "mắt ngang mắt idle" nên **chân lơ lửng 24–43 px trên hitbox**; đòn 3 cộng thêm `dy −28 / −44` rồi rơi về 0 trong 1 khung | code (trái mục 3 & 10 của yêu cầu) | `tools/chibi-khung-chuan.py` dòng 147 (`day = max(py, mat + E0)`); `chibi-sheets.py` dòng 141 (`{'dy': -28}`, `{'dy': -44}`) | nhảy: đế nhảy **24,4 px**, đầu **53,9 px**; đòn 3: đế **33,7 px**, đầu **47,3 px** |
| D | **Quái đi khoá theo mắt** — đo mắt quái không ổn định nên thân quái nhảy qua lại; ô gốc thì vốn đã ổn định (±1,3 px) | code | `chibi-sheets.py` dòng 240–244 (`buoc(..., 'mat')`) | thân quái nhảy **13,2–14 px** mỗi vòng đi |
| E | **Camera làm tròn px logic** (`Math.round(camx)`) = 2,17 px thật trên iPhone, còn nền/parallax/nhân vật vẽ lẻ → cả màn dịch theo bậc không đều | code | `demo.html` dòng 1353 (`ox=Math.round(camx)+…`) | lệch camera tới **1,08 px thật**, sai bước dịch màn tới **1,83–2,0 px thật** (tb 0,56–0,72) |
| F | **Quay đầu khi chạy chen 1 khung idle** (vx đi qua vùng \|vx\|<0,6) → idle cao hơn chạy 26 px nháy lên + vòng chạy bị reset về khung 1 | code | `demo.html` dòng 697 (`else if(Math.abs(pl.vx)>0.6) ten='run'`) | thấy trong mẫu: `run8/1 → idle/1 → run8/1` |
| G | Idle khung 1, 2, 5, 6 gần như trùng, khung 3–4 cao hơn đột ngột ~4 px | **ảnh** | `art/chibi/lam/idle-6.png` | đỉnh mũ nhảy **3,8–4,1 px** trong 1 khung (giữ nguyên, xem mục 5) |
| H | Idle vẽ đứng thẳng, chân dài hơn các dáng đứng khác (mắt cao 113,5 vs rút dao 103–106, thu thế 110) dù mũ cùng cỡ | **ảnh** | `idle-6.png` vs `idle.gif`, `combo-20.png` | đổi idle ↔ chạy/đòn: đầu đổi cao **≈26 px** (một phần là dáng khuỵu thật) |

**Đã kiểm, KHÔNG phải nguyên nhân:**
- **Cỡ (scale)**: mọi khung vẽ đúng cỡ ô cắt (`drawImage` w,h = w,h nguồn, không co giãn từng khung). Cỡ mũ đo được 50–53 px ở mọi tấm
  (idle 0,585 / jump 0,522 / run 0,783 / combo 1,365 / rút dao 0,930 đều đã quy về cùng cỡ mũ). Các cột "đổi cỡ %" lớn trong bảng (đòn 1: 19 %,
  chém xoay: 46 %) là do **đầu quay** (combo-3/3 hơi quay chính diện, combo-2/2–2/3 nhìn lưng/chính diện) làm phép đo mũ sai — không phải đổi cỡ.
- **Vòng lặp**: đã đúng từ trước — logic cố định 60 bước/giây theo thời gian thật của rAF, vẽ nội suy; khung animation tăng theo **bước logic**,
  không theo số lần vẽ. Đo: vòng chạy **666,7 ms ở cả 60 Hz và 120 Hz** (trước và sau).
- **Reset animation**: chỉ reset khi đổi tên animation, không reset liên tục (ngoại trừ lỗi F).
- **devicePixelRatio / letterbox / imageSmoothing**: đúng (bộ đệm = CSS × dpr, smoothing bật cho ảnh vẽ tay).
- **Hitbox / vật lý**: không phụ thuộc khung ảnh (20×30 cố định, hộp đòn theo bảng `ATK`).

## 2. Đã sửa gì

1. **Quy tắc căn mới** (`game/tools/chibi-sheets.py`, sinh lại `lam-chibi.json`, `quai-boss.json`; ảnh sheet KHÔNG đổi, ô cắt giống hệt):
   - Ngang: **tâm thân** (trọng tâm dải từ mắt xuống 55 % về phía chân, bỏ dao) đặt đúng trên pivot, **cùng một mốc cho mọi animation**
     → đổi animation / lật mặt không trượt người. Đầu, tay, chân vẫn chuyển động như ảnh (đầu chạy vẫn đung đưa ±2,5 px, nhấp dọc 5,6 px giữ nguyên).
     Đây là lý do bỏ "khoá mắt" (ép đầu đứng yên — trái mục 6) và "khoá gót" (nguồn lỗi A).
   - Dọc dưới đất: **đế ủng thấp nhất (không tính dao) chạm pivot**. Bỏ `dy −28/−44` của đòn 3.
   - Dọc trên không (jump 2–4, bám tường, chém nảy, chém xoay): tâm thân ở độ cao cố định so với pivot (lấy từ jump/2 – khung duỗi chân, đế chạm pivot);
     đế không bao giờ thấp hơn pivot. **Độ cao nhảy chỉ do vật lý.** Khung co gối (jump/3) chân tự co lên 17 px — đó là dáng vẽ, không phải nhấc giả.
   - Quái / boss: giữ vị trí ô gốc (`dx = 0`).
   - Mỗi khung có thêm `moc` (tâm thân, đỉnh, đế, mắt, cỡ mũ) trong json — dùng cho debug và công cụ đo.
2. **`demo.html`**:
   - `snap()` + `veBuoc`: làm tròn **chỉ khi vẽ**, theo **pixel thật** (1/BK), cùng một cách cho camera, Lam, quái, boss (thay `Math.round(camx)` px logic).
   - `lamChibi`: giữ "run" khi đang chạy mà \|vx\| > 0,05 (trễ) → quay đầu không chen khung idle, vòng chạy không reset.
   - Chặn `boss.k2` chưa có (vẽ boss trước bước logic đầu tiên → lỗi `undefined`), chỉ xảy ra khi dịch chuyển tức thời.
   - **Debug Animation**: `?debug=anim` hoặc ⚙ → "Debug animation". Vẽ khung sprite gốc (trắng đứt), pivot (hồng), tâm thân (xanh lá),
     hitbox vật lý (xanh dương), vùng ăn đòn (lục đứt), hộp đòn (đỏ), đường đất (vàng), toạ độ vật lý + vẽ, tên animation, bước/khung/ms,
     **FPS vẽ thật và số bước logic/giây**. Nút chạm (góc phải trên, dùng được trên iPhone): ⏸/▶ dừng, **+1 / +5** phát từng bước logic,
     **×1 / ×½ / ×¼ / ×⅒** phát chậm, ✕ tắt. Phím: 9 dừng, 0 +1 bước, 8 đổi tốc độ.
3. **Không đổi**: gameplay, điều khiển, tốc độ, trọng lực, combat, bản đồ, va chạm. Đã đối chiếu trong trình duyệt: `ATK` (su/ac/re/box của 6 đòn),
   `RUT_T = 51`, hộp đấm quái `[-90,-81,66,37]`, `runSpeed 4.4`, `gravity 0.64`, `jumpVel 11.97` **giống hệt** bản trước.

Trích đoạn quan trọng (`chibi-sheets.py`):

```python
dx = -(f['tx'] - 320) * K                       # tâm thân lên pivot
de = (f['day'] - 620) * K                       # đế so với pivot (âm = cao hơn)
if nm in TREN_KHONG and not (nm == 'jump' and i == 0):
    dy = min(T_AIR - (f['ty'] - 620) * K, -de)  # tâm thân ở độ cao cố định, đế không xuống dưới pivot
else:
    dy = -de                                    # đế chạm pivot
```

`demo.html`:

```js
function snap(v){ return Math.round(v*BK)/BK; }          // pixel thật
ox=snap(camx+S.shx*sm); oy=snap(S.camy+S.shy*sm);         // cũ: Math.round(camx) – px logic
else if(Math.abs(pl.vx)>0.6 || (CH.ten==='run' && Math.abs(pl.vx)>0.05)) ten='run';
```

## 3. Bảng số trước / sau (60 Hz; 120 Hz cho cùng giá trị max – xem json)

"Thân ngang" = độ nhảy ngang lớn nhất của tâm thân so với pivot vật lý giữa 2 lần vẽ kề nhau. "Đỉnh / đế dọc" tương tự theo chiều dọc. px logic.

| Animation | Thân ngang trước → sau | Đỉnh mũ dọc trước → sau | Đế dọc trước → sau | Ghi chú |
|---|---|---|---|---|
| Đứng (idle) | 1,0 → **0,0** | 3,8 → 4,1 | 0 → 0,3 | nhấp đỉnh 4 px là ẢNH (G) |
| Chạy (gồm quay đầu) | **15,9 → 0,4** | 5,6 → 5,6 | 0,5 → 0,2 | nhấp đầu 5,6 px = dao động tự nhiên, giữ |
| Nhảy | **14,2 → 0,2** | **53,9 → 29,6** | **24,4 → 16,9** | 29,6 / 16,9 = đổi dáng khuỵu→duỗi→co gối của ảnh |
| Đòn 1 (đâm) | **20,0 → 0,4** | 1,8 → 2,2 | 0,5 → 0,4 | |
| Đòn 2 | **23,8 → 0,1** | 0,5 → 1,0 | 0,5 → 0 | |
| Đòn 3 (bổ) | 5,1 → 0,4 | **47,3 → 25,3** | **33,7 → 0,3** | 25 px = dáng co người → bổ xuống, chân giữ trên đất |
| Chém trên không | 3,0 → 0,2 | 19,7 → 11,5 | 17,3 → 9,7 | khung xoay đổi góc nhìn |
| Bị đánh / Chết | 0 → 0,3 / 0 → 0,4 | 0 → 0,3 | 0 → 0,4 | 1 khung TẠM, theo vật lý (đẩy lùi, rơi) |
| Quái đi | **13,2 → 2,0** (tb 0,82 → 0,27) | 1,0 → 0,9 | 0 → 0,1 | |
| Quái đánh | 23,4 → 23,0 | 4,0 → 4,2 | 0 → 0,2 | 23 px = cú đấm lao người tới, ẢNH vẽ có chủ đích — giữ |
| Quái chết | 5,9 → 6,1 | 57 → 57 | 1 → 1,1 | vỡ sụp (có chủ đích) |
| Boss | 0,8 → 0,8 | 0 → 0 | 0 → 0 | thở/nhún bằng ảnh + co giãn có chủ đích |

Camera (Lam chạy trên bệ đá Sân chuông, camera đang trượt theo), **pixel thật** iPhone (BK 2,17):

| | lệch camera max | sai bước dịch màn max | tb |
|---|---|---|---|
| 60 Hz trước → sau | 1,08 → **0,50** | 1,83 → **0,81** | 0,72 → **0,32** |
| 120 Hz trước → sau | 1,08 → **0,50** | 2,00 → **0,75** | 0,56 → **0,36** |

Tốc độ animation: vòng chạy 8 khung = **666,7 ms ở 60 Hz và 120 Hz** (trước/sau như nhau — vòng lặp vốn đúng).

Ảnh: `game/xem-thu/anh/truoc-sau-{run,idle,combo,quai-di}.gif` (trái trước, phải sau, đúng tốc độ thật);
`game/xem-thu/anh/debug-{dung,chay,nhay,combo-a,combo-b,combo-c,chem-tren-khong,chet,quai-dam,boss}.png` (lớp debug, màn iPhone).

## 4. Kiểm từng animation

| Animation | Kết quả | Ghi chú |
|---|---|---|
| Idle | **Đạt một phần** | không trượt ngang; nhấp 4 px khung 2→3 là ảnh gốc (cần vẽ lại) |
| Run | **Đạt** | thân không nhảy, quay đầu không nháy idle, giữ nhấp tự nhiên |
| Jump | **Đạt** | chân trùng hitbox lúc bật/tiếp đất, không độ cao giả |
| Đòn 1, 2, chém hất | **Đạt** | hết giật lùi 20–24 px |
| Đòn 3 | **Đạt (về giật) / chưa đẹp** | hết rơi 44 px; nhưng ảnh 1–2 vẽ đang **bay**, nay đứng trên đất (xem mục 5) |
| Chém trên không, chém nảy | **Đạt** | khung xoay nhìn lưng/chính diện vẫn trông đầu to hơn (ảnh) |
| Hurt / Death / Dash / Wall / Land | **Đạt (TẠM)** | chỉ là 1 khung mượn từ jump/run — cần ảnh riêng |
| Quái đi / chết | **Đạt** | |
| Quái đánh | **Đạt** | lao 23 px là đà đấm vẽ sẵn |
| Boss | **Đạt (TẠM)** | chỉ có 6 khung thở |

**Lưu ý thật thà — hitbox đòn giữ nguyên số cũ** (không đổi chiến đấu), nhưng hình đã dời nên **lưỡi dao trên màn lệch hitbox**:
đòn 1 dao ngắn hơn hộp 13 px; **đòn 2 dao dài hơn hộp 25 px**; đòn 3 lệch 7 px ngang, 10 px dọc; chém hất +7 px; chém trên không −16 px ngang, +21 px dọc.
Bật debug sẽ thấy hộp đỏ. Muốn hộp khớp dao thì đổi `HOP` trong `chibi-sheets.py` sang lấy theo dao — nhưng đó là **đổi tầm đánh**, cần bạn đồng ý.

## 5. Sprite cần vẽ lại (code không sửa được)

| Ảnh | Vấn đề | Prompt gen lại (1 dòng) |
|---|---|---|
| `idle-6.png` | khung 1/2/5/6 trùng, 3–4 nhô 4 px đột ngột; dáng chân dài hơn mọi dáng khác (mắt cao hơn 8–10 px) | `Same hooded chibi, side view facing right, 6-frame idle breathing loop, feet fixed, body rises max 2px per frame, same leg length as run sheet, transparent background` |
| `combo-20.png` hàng 4 khung 1–2 (đòn 3) | vẽ nhảy lên không, nhưng đòn 3 trong game ở dưới đất → nay trông co người tại chỗ | `Same chibi, side view, 2-frame grounded overhead windup with dagger raised, both feet on ground, transparent background` |
| `combo-20.png` hàng 2 khung 2–3 (chém xoay) | nhìn lưng / chính diện → đầu trông to hơn 23 % | `Same chibi, side view, 4-frame airborne spin slash keeping head in profile, consistent head size, transparent background` |
| `jump-4.png` khung 2 | thân chồm xa, mũ nhỏ hơn 7 % | `Same chibi, side view, jump rising frame, upright body, same hood size as idle, transparent background` |
| (chưa có) bị đánh, chết, lướt, bám tường | đang mượn khung jump/run | `Same chibi, side view, 3-frame hurt recoil, feet on ground, transparent background` · `Same chibi, side view, 5-frame death collapse to lying on ground, transparent background` · `Same chibi, side view, 3-frame forward dash, low lean, transparent background` · `Same chibi, side view, wall slide pose, hand on wall, transparent background` |
| boss | chỉ có thở | `Same wooden bell guardian boss, side view facing left, 6-frame walk cycle, feet on ground, transparent background` |

## 6. Còn lại / chưa làm

- Chưa chơi thử trên iPhone thật — chỉ đo headless (SwiftShader, canvas phần mềm) ở cỡ màn iPhone.
- `docs/demo-chibi.md` mục "Quy tắc căn" và `art/chibi/lam/xem-thu-muot/GHI-CHU.md` (khoá mắt / khoá gót) là quy tắc CŨ — đã thay bằng mục 2 ở đây.
