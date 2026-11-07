# HIỆU ỨNG ĐỘNG CHO BUFF / DEBUFF TRÊN Ụ — THIẾT KẾ + PROMPT CHATGPT (07/11)

Người dùng: *"hiệu ứng tăng dame, tăng tốc đánh và giảm tốc đánh hay giảm gì tăng gì thì gen kiểu hiệu ứng animation để thể hiện cái đó"*
→ mỗi trạng thái "tăng gì / giảm gì" là **một hoạt ảnh mà chính CHUYỂN ĐỘNG nói lên ý nghĩa**, không chỉ là vòng sáng tĩnh đổi màu.

Lượt này CHỈ chuẩn bị (không mở trình duyệt, không sửa code game). Ảnh tham chiếu: `ref/`.
Tuân `thap/QUY-TAC-HINH.md`: mọi hình từ PNG ChatGPT; code chỉ dời / phóng / xoay / mờ / chọn khung.

> Đối chiếu (07/11, nhánh `claude/kiem-nhan-dien`):
> - `tuvan/vfx15/SO-LIEU.md` — kiểm "15 ụ cùng bắn": trần dải nổ 90/90, hạt 320/320, chữ nổi 48/48 bị chạm liên tục; 8–9 vòng nạp xanh sáng cùng lúc gây rối. Đề xuất **c2: hào quang buff bùng khi nhận rồi mờ về ~20%** → áp vào mục 4 (lặp buff vĩnh viễn alpha 0.2). Hiệu ứng mới **không thêm chữ nổi** (one-shot ±1★ thay chữ, không cộng thêm) và đi qua `VX.ds` riêng, không ăn trần dải nổ `FX.no`.
> - `tuvan/nhandien/DE-XUAT.md` — ô thật 46,5 px CSS = 140 px điểm ảnh (iPhone 13); màu đang gánh nhận diện ụ, dễ mất khi dồn hiệu ứng / mù màu → hiệu ứng buff phải **phân biệt bằng hình + chuyển động** (đã theo) và **không che phần đầu ụ** (~45% đường kính bệ → tâm trống 45%, đã theo).

---

## 1. Kiểm kê trạng thái có thể nằm trên một ụ

Ưu tiên: **P0** = ảnh hưởng quyết định ngay (ụ không bắn / không ghép / sắp mất sao) · **P1** = nên thấy · **P2** = biết thêm cũng được.

### 1a. BUFF (tăng)

| # | Khoá trong code | Ý nghĩa | Nguồn | Thời hạn | Hiện nay | Ưu tiên |
|---|---|---|---|---|---|---|
| B1 | `B.cuong` → BVX `max` | RAGE chỉ huy: ×2 sát thương (+60% tốc qua `tocV`) | Chỉ huy RAGE, Lucky Roulette `cuong` (skills3.js:344) | 10 s | `fxb_max` + `cmd_rage` (TVF) | P1 |
| B2 | `T.buf.dmg` + `buf.dkHien` + `T.aurora` → `dmg` | + sát thương (thường / có điều kiện: quái lộ, chậm, vệt cầu vồng, đòn liên tiếp) | Star Breaker (hasao), Amplifier, Cryo Reactor (dk), Ember Relay, Quantum Choir, Railgun hàng, Mimic aurora | vĩnh viễn khi kề / vài s (aurora) | `fxb_dmg` | P1 |
| B3 | `T.buf.toc` + `T.epxung` + `tocT/tocV` → `toc` | + tốc bắn | Radar, Fusion Mixer, Overclock (`epxung` +65–90% VĨNH VIỄN), Kẹp Phá co-op/solo, Berserker frenzy, Merge Surge, Cleanser 7★, Shield Gen 7★, Star Breaker solo +8%, Hero Foundry, Railgun cột, Nhiễu Sóng co-op | kề = vĩnh viễn · `tocT` 4–12 s · epxung vĩnh viễn | `fxb_toc` (gộp chung) | P1 |
| B4 | `buf.crit` + `buf.cdmg` (+`xuyen`) → `crit` | + chí mạng / sát thương chí mạng | Crit Antenna, Hammer | vĩnh viễn khi kề | `fxb_crit` | P2 |
| B5 | `T.khien`, `B.khien`, `B.halo`, `T.ht.khang` → `khien` | khiên chặn 1 đòn (ụ / cả bàn); Holy Halo; Mirror Gate kháng khống chế | Shield Gen, chỉ huy SHIELD, Holy Halo, Mirror Gate | tới khi bị đánh / hết giờ | `fxb_khien` (khang = mờ 0.45) + `cmd_khien`, `tb_khien` | P1 |
| B6 | `buf.chet` → `chet` | giết ngay quái dưới ngưỡng máu | hỗ trợ Execute | vĩnh viễn khi kề | `fxb_chet` | P2 |
| B7 | `buf.cham` → `cham` | đòn bắn kèm làm chậm | Chiller, Cryo Reactor | vĩnh viễn khi kề | `fxb_cham` | P2 |
| B8 | `VX.manaRa` → `mana` | Mana Core sinh mana (proc) | Mana Core, Mana Doubler | tức thời | `fxb_mana` (chỉ bùng) | P2 |
| B9 | `nangSao(+1★)` / `X.sao++` | được +1★ | STAR GIFT (roulette), Star Lift, Hex Saboteur co-op, Star Leech chết trả sao | tức thời | chữ + `FX.vong1`, `tiaLua` | P1 |
| B10 | `VX.donSach` (taylo) | được tẩy sạch debuff | Cleanser, Sanctum, 5★ PURGE | tức thời | `VX.donSach` (hạt code) | P1 |
| B11 | `T.thucTinh` / `T.thucT` | Werewolf / Orbital THỨC TỈNH | soi, orbital | trận / vài s | `fx_awaken` (growfx.js) | P2 — giữ nguyên, ngoài phạm vi |
| — | Evolver đếm ngược, Copycat bản sao | không phải buff/debuff chỉ số | growfx.js, `T.banSao` | — | ảnh riêng | ngoài phạm vi |

### 1b. DEBUFF (giảm)

| # | Khoá trong code | Ý nghĩa | Nguồn | Thời hạn | Hiện nay | Ưu tiên |
|---|---|---|---|---|---|---|
| D1 | `T.st.bang` | ĐÓNG BĂNG: không bắn | trùm Freezer (6 s, Halo ½), Cryo active / skilldemo | 3–6 s | `BANGFX` (mảnh bay → khối băng → `fx_bang_vo`) | P0 — **giữ BANGFX**, không gen lại |
| D2 | `T.st.da` | HOÁ ĐÁ: không bắn, không ghép tới khi được tẩy | trùm Janus | tới khi Cleanser | `phu_da` tĩnh + đầu súng xám | **P0** |
| D3 | `T.st.lua` | CHÁY: hết 6 s → mất 1★ (`haSao 'burn'`) | trùm Octopus | 6 s đếm ngược | `phu_lua` tĩnh + chấm cam | **P0** |
| D4 | `T.st.cam` (+`st.kep`) | BỊ CÂM (JAMMED): không bắn, không ghép, không buff kề | trùm Static Jammer | 6 s | `vong_xich` xoay + chữ JAMMED | **P0** |
| D5 | `T.st.kep` | KẸP: −40% tốc bắn (game.js:265) | Jammer/Kẹp Phá PVP (5+★ s), Máy Nhiễu Sóng PVP (3–6 s), Mirror Gate phản (4 s) | 3–12 s | `vong_xich` xoay + chữ CLAMPED/JAMMED/REFLECTED | **P1** (PVP rất hay gặp) |
| D6 | `T.giamT / giamV` | −8% tốc bắn | Star Breaker PVP (ụ 5★ đầu tiên mỗi wave) | 6 s | chỉ chữ "−8% FIRE RATE" | P2 |
| D7 | `SKILLS.dongbo.heSoDoiThu(B)` | − sát thương cả bàn đối thủ | Sync Cannon PVP | khi đối thủ có Sync Cannon | **không có** (không có cờ trên ụ) | P2 |
| D8 | `T.hexT` | BỊ NGUYỀN (ụ 1★ đối thủ): đứng hình 2.5 s | Hex Saboteur PVP | 2.5 s | dùng tạm `st.ngam` (tâm ngắm) | P1 |
| D9 | `haSao` / `X.sao--` | MẤT 1★ (1★ → nổ mất ụ) | Nightmare snipe, hết cháy, Hex Saboteur, Star Leech trộm | tức thời | chữ "−1★" 18 px + `tiaLua` | **P1** |
| D10 | `T.st.ngam` / `st.ngamK` | BÁO CHIÊU trùm sắp đánh ụ này (1.4 s) / Nhiễu Sóng ngắm (0.65 s) | mọi trùm, Nhiễu Sóng | 0.65–1.4 s | `phu_ngam` + `TVF tb_*` riêng từng trùm | P0 — **giữ TVF**, không gen lại |
| D11 | đổi loại ụ | bị biến (Mad Crown), Máy Xáo Trộn PVP "RIVAL SCRAMBLED", Joker ném Mimic | trùm / PVP | tức thời | `tb_doiloai`, chữ | P2 |
| — | độc (poison) | *Không có debuff độc trên ụ* trong code hiện tại (độc chỉ ở quái) | — | — | — | không làm |

---

## 2. Ngôn ngữ hình ảnh

**Quy luật chuyển động (đọc trong < 1 s ở ô 46 px):**
- **TĂNG** = đi LÊN · NỞ RA · NHANH DẦN · hội tụ sáng. **GIẢM** = chìm XUỐNG · CO LẠI · CHẬM DẦN · nứt, nhỏ giọt, vỡ.
- Mỗi hiệu ứng khác nhau bằng **HÌNH + CHUYỂN ĐỘNG**, màu chỉ là lớp thứ ba (người mù màu vẫn phân biệt được).
- Hiệu ứng nằm **quanh / sau / dưới chân** ụ, tâm ô (≈45%) để trống → không che đầu súng và huy hiệu sao.
- Nhận buff = **bùng 1 lần** (khung 1–4, ~0.4 s) → **lặp nhẹ** (khung 5–8, 8 fps, mờ). Mất buff = mờ dần 0.2 s (co 1 → 0.9). Không có khung "mất" riêng.

**Màu theo chỉ số (đồng bộ ic_* / fxb_* hiện có):** sát thương = đỏ-cam · tốc bắn = vàng · chí mạng = tím · khiên = vàng kim lục giác · chậm/băng = xanh băng · giết ngay = lục linh hồn · đá = xám · câm = tím nhiễu · mana = tím violet · sao = vàng sao.

| Mã ảnh | Trạng thái | HÌNH | CHUYỂN ĐỘNG bùng (1–4) | CHUYỂN ĐỘNG lặp (5–8) |
|---|---|---|---|---|
| `fxa_dmg` | B2 + sát thương | chữ V (chevron) đỏ-cam có lửa | 3 chevron phóng từ chân ụ lên, nở to, loé | chevron nhỏ trôi lên dần 2 bên rồi tan ở đỉnh |
| `fxa_toc` | B3 + tốc bắn (gồm Overclock) | mũi tên cong vàng quay quanh ụ | 2 mũi tên quay nửa vòng → cả vòng, càng lúc càng nhanh, vệt mờ dài ra | mũi tên quay đều quanh vòng, vệt tốc độ |
| `fxa_crit` | B4 + chí mạng | sao lấp lánh tím 4 cánh | sao từ ngoài bay HỘI TỤ vào vành, loé chéo | 4 sao lấp lánh lần lượt bật/tắt trên vành |
| `fxa_khien` | B5 khiên | tấm lục giác vàng kim | các tấm lục giác bay vào ghép thành vòng/bán cầu | ánh sáng quét qua các tấm, vòng đứng yên |
| `fxa_chet` | B6 giết ngay | lưỡi hái + linh hồn lục | lưỡi hái chém 1 vệt cung quanh ụ | 2 đốm linh hồn lục bay vòng chậm |
| `fxa_cham` | B7 đòn làm chậm | vành băng + bông tuyết | vành băng đóng từ 1 điểm chạy quanh | bông tuyết trôi CHẬM ra ngoài |
| `fxa_mana` | B8 sinh mana | tinh thể violet | tinh thể bật lên từ chân, vỡ thành hạt bay lên | (dùng ít) tinh thể nhấp nhô lên xuống |
| `fxa_max` | B1 RAGE ×2 | lửa vàng-đỏ + 2 chevron đôi | cột lửa bùng lên quanh ụ, 2 chevron đôi vút lên | lửa liếm lên đều quanh vành |
| `fxa_saolen` | B9 +1★ | ngôi sao vàng | sao bay từ dưới lên, xoay, loé | sao dừng phía trên, toả 4 tia rồi tan (chỉ phát 1 lần, không lặp) |
| `fxa_sach` | B10 tẩy sạch | vòng nước trắng-xanh lam + mảnh vụn | sóng sạch toả ra, mảnh tối văng ra ngoài | vòng lấp lánh mờ dần (1 lần) |
| `fxa_tocxuong` | D5/D6 − tốc bắn (thay vòng xích) | bánh răng/đồng hồ vàng + bùn tím đen nhỏ giọt | bùn đổ xuống bám vào bánh răng, kim đồng hồ khựng lại | bánh răng quay CHẬM DẦN, bùn nhỏ giọt rơi xuống |
| `fxa_dmgxuong` | D7 − sát thương (Sync Cannon) | chevron đỏ NỨT chĩa xuống | chevron đỏ hiện trên vành, nứt vỡ | mảnh chevron rơi xuống, mờ hẳn (**1 lần, không lặp**) |
| `fxa_cam` | D4 câm | răng cưa nhiễu tím + ổ khoá vỡ tín hiệu | tia nhiễu tím đánh xuống, vạch nhiễu bao quanh | răng cưa nhiễu giật chớp quanh vành (như TV mất sóng) |
| `fxa_da` | D2 hoá đá | lớp đá xám + vết nứt | vết nứt xám bò từ chân lên, đá bao kín vành | bụi đá rơi lả tả, vết nứt sáng mờ |
| `fxa_lua` | D3 cháy (sắp −1★) | lưỡi lửa cam + than hồng | lửa bắt từ 1 điểm lan quanh vành | lửa liếm lên, than bay lên, vành đen dần (gợi đếm ngược) |
| `fxa_hex` | D8 nguyền đứng hình | ấn lục giác đỏ-tím + sao choáng | 3 ấn nguyền rơi xuống đóng quanh ụ | ấn + sao nhỏ quay vòng trên đỉnh (choáng) |
| `fxa_saoxuong` | D9 −1★ | ngôi sao vàng sứt mẻ | sao vỡ 1 cánh, mảnh văng ra | sao rơi xuống, xám đi, vỡ vụn (1 lần) |
| `fxa_xao` | D11 bị đổi loại | xoáy hồng-tím | xoáy cuộn vào tâm | xoáy tung ra, mờ (1 lần) |

Không gen: `bang` (BANGFX đã đủ), `ngam`/`ngamK` (TVF tb_* đã có), `thucTinh` (fx_awaken), độc (không tồn tại trên ụ).

---

## 3. Prompt ChatGPT

**Cách gen:** mỗi prompt 1 tab ChatGPT, đính kèm ảnh ref ghi ở dòng *Ref* (luôn kèm `ref/ref_fxb_dmg.png` làm chuẩn phong cách). Gen xong lấy ảnh về `docs/demo-hop-tuong/thap-art/raw_fxa_<k>.png` rồi **đóng tab ngay** (QUY-TAC-HINH §2).
Mọi prompt đã gồm đủ: 4x2 grid, 8 ô vuông bằng nhau, trái→phải trên→dưới, khung 1–4 bùng, 5–8 lặp liền mạch, tâm trống, nhìn từ trên xuống, nền magenta đặc, không chữ, không vẽ ụ, không sương sáng tràn nền.

### Đợt A — 10 hiệu ứng quan trọng (P0/P1, ưu tiên gen trước)

**A1 · fxa_dmg — DAMAGE UP** · Ref: `ref_fxb_dmg.png`, `ref_fxb_dmg_bung.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view. Effect: DAMAGE UP around an empty center. Frames 1-4 (burst): three red-orange fiery chevron arrows (pointing up) shoot upward from the bottom of a flame ring, growing bigger and flashing. Frames 5-8 (seamless subtle loop): small red-orange chevrons drift upward along both sides of the ring and fade at the top. Keep the middle 45% of every cell completely empty (a turret sits there). Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

**A2 · fxa_toc — FIRE RATE UP** · Ref: `ref_fxb_toc.png`, `ref_fxb_dmg.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view. Effect: FIRE RATE UP around an empty center. Frames 1-4 (burst): two curved yellow arrows spin around a golden ring, faster in each frame, with speed trails getting longer, ending in a bright flash. Frames 5-8 (seamless subtle loop): the two yellow arrows keep orbiting the ring at steady high speed with motion streaks and small electric sparks (rotate 45 degrees per frame). Keep the middle 45% of every cell completely empty. Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

**A3 · fxa_tocxuong — FIRE RATE DOWN (thay vòng xích Kẹp Phá)** · Ref: `ref_fxb_toc.png`, `ref_vong_xich.png`, `ref_fxb_dmg.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view. Effect: FIRE RATE DOWN around an empty center. A yellow cogwheel ring with a small clock hand on top. Frames 1-4 (onset): dark purple-black sludge pours down onto the cogwheel ring and sticks to it; the clock hand jerks and stops. Frames 5-8 (seamless subtle loop): the cogwheel turns very slowly, sludge drips fall downward from the bottom of the ring. Dull, heavy, slowing mood. Keep the middle 45% of every cell completely empty. Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

**A4 · fxa_cam — JAMMED (cannot fire / merge)** · Ref: `ref_vong_xich.png`, `ref_fxb_crit.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view. Effect: JAMMED / SIGNAL LOST around an empty center. Frames 1-4 (onset): a purple static lightning bolt strikes down, then jagged purple zigzag static lines wrap into a broken ring with a small cracked padlock at the top. Frames 5-8 (seamless loop): the purple zigzag static flickers and jitters around the ring like a TV losing signal, small glitch blocks pop in and out; padlock stays. Keep the middle 45% of every cell completely empty. Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

**A5 · fxa_da — PETRIFIED (stone)** · Ref: `ref_phu_da.png`, `ref_fxb_dmg.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view. Effect: TURNED TO STONE around an empty center. Frames 1-4 (onset): gray stone crust with dark cracks creeps up from the bottom of the cell and closes into a full rocky ring, ending with a small dust puff. Frames 5-8 (seamless subtle loop): the gray stone ring stays still, tiny pebbles and dust flakes fall slowly downward, a faint crack line glints. Matte, heavy, no bright colors. Keep the middle 45% of every cell completely empty. Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

**A6 · fxa_lua — BURNING (will lose a star)** · Ref: `ref_phu_lua.png`, `ref_fxb_dmg.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view. Effect: BURNING DEBUFF around an empty center. Frames 1-4 (onset): a spark catches at one side and orange flames spread around the ring until it is fully burning, with a dark scorched base. Frames 5-8 (seamless loop): ragged orange flames lick upward around the ring, black smoke wisps and glowing embers rise. Hostile, dangerous, darker than a buff. Keep the middle 45% of every cell completely empty. Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

**A7 · fxa_saoxuong — LOSE 1 STAR (one-shot)** · Ref: `ref_fxb_max.png`, `ref_fxb_dmg.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view, one-shot animation. Effect: LOSE ONE STAR. A gold star sits above the empty center. Frames 1-4: the star cracks, one point chips off and red shards burst out. Frames 5-8: the broken star falls downward past the side of the center, turns gray and crumbles into dust that fades out. Keep the middle 45% of every cell empty (the star passes along the edge). Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

**A8 · fxa_hex — HEXED / STUNNED** · Ref: `ref_fxb_crit.png`, `ref_phu_ngam.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view. Effect: CURSED AND STUNNED around an empty center. Frames 1-4 (onset): three red-purple hexagon curse sigils drop from above and slam down around the ring, with a dark pulse. Frames 5-8 (seamless loop): the three curse sigils and two tiny dizzy stars orbit slowly around the top half of the ring. Keep the middle 45% of every cell completely empty. Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

**A9 · fxa_crit — CRIT UP** · Ref: `ref_fxb_crit.png`, `ref_fxb_crit_bung.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view. Effect: CRITICAL CHANCE UP around an empty center. Frames 1-4 (burst): purple four-pointed sparkles fly in from the cell edges and converge onto a thin violet ring, ending in a sharp cross-shaped flash. Frames 5-8 (seamless subtle loop): four sparkles on the ring twinkle on and off one after another, clockwise. Keep the middle 45% of every cell completely empty. Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

**A10 · fxa_khien — SHIELD** · Ref: `ref_fxb_khien.png`, `ref_fxb_khien_bung.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view. Effect: ONE-HIT SHIELD around an empty center. Frames 1-4 (burst): golden hexagon plates fly in from outside and snap together into a ring of hex tiles, final frame flashes. Frames 5-8 (seamless subtle loop): the hex ring stays still while a soft highlight sweeps around it, one tile at a time. Translucent gold, only the ring of tiles, the middle is open. Keep the middle 45% of every cell completely empty. Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

### Đợt B — 8 hiệu ứng bổ sung (P1/P2)

**B1 · fxa_max — RAGE ×2** · Ref: `ref_fxb_max.png`, `ref_fxb_max_bung.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view. Effect: MAX POWER RAGE around an empty center. Frames 1-4 (burst): a golden-red flame ring erupts upward and two double chevrons (pointing up) blast up from the bottom, big flash. Frames 5-8 (seamless loop): gold and red flames lick steadily upward around the ring, small double chevrons rise and fade. Keep the middle 45% of every cell completely empty. Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

**B2 · fxa_dmgxuong — DAMAGE DOWN (one-shot, Sync Cannon)** · Ref: `ref_fxb_dmg.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view, one-shot animation. Effect: DAMAGE DOWN. Frames 1-4: three dull red chevrons pointing DOWN appear on a dim red ring around the empty center, then crack apart. Frames 5-8: the cracked dark-red chevron pieces fall downward along both sides of the ring, lose their glow and fade out completely by frame 8. Weak, drained mood, desaturated. Keep the middle 45% of every cell empty. Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

**B3 · fxa_chet — EXECUTE** · Ref: `ref_fxb_chet.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view. Effect: EXECUTE around an empty center. Frames 1-4 (burst): a ghostly green scythe slashes a curved arc all the way around the ring, leaving a green trail. Frames 5-8 (seamless subtle loop): two small green skull-wisps orbit slowly around the ring. Keep the middle 45% of every cell completely empty. Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

**B4 · fxa_cham — SLOWING SHOTS** · Ref: `ref_fxb_cham.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view. Effect: FROST TOUCH around an empty center. Frames 1-4 (burst): icy blue frost forms at one point and crystallizes around the ring, snowflakes pop out. Frames 5-8 (seamless subtle loop): a few snowflakes drift slowly outward from the icy ring and fade. Keep the middle 45% of every cell completely empty. Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

**B5 · fxa_mana — MANA GAIN** · Ref: `ref_fxb_mana.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view. Effect: MANA GAIN around an empty center. Frames 1-4 (burst): violet crystals pop up from the bottom of a violet ring and shatter into sparkles flying upward. Frames 5-8 (seamless subtle loop): three small violet crystals bob gently up and down on the ring. Keep the middle 45% of every cell completely empty. Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

**B6 · fxa_saolen — GAIN 1 STAR (one-shot)** · Ref: `ref_fxb_max.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view, one-shot animation. Effect: GAIN ONE STAR. Frames 1-4: a shining gold star flies up from the bottom edge along the side of the empty center, spinning and growing. Frames 5-8: the star stops at the top of the cell, bursts into four golden rays and fades out with sparkles. Keep the middle 45% of every cell empty. Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

**B7 · fxa_sach — CLEANSED (one-shot)** · Ref: `ref_fxb_khien.png`, `ref_fxb_cham.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view, one-shot animation. Effect: CLEANSE. Frames 1-4: a white and aqua water ring splashes outward from around the empty center, dark purple debris pieces are pushed away to the edges. Frames 5-8: the clean ring sparkles and fades out completely. Keep the middle 45% of every cell empty. Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

**B8 · fxa_xao — SCRAMBLED / TRANSFORMED (one-shot)** · Ref: `ref_fxb_crit.png`
```
Make an image. Game VFX sprite sheet: a 4x2 grid of 8 equal square cells, read left to right, top to bottom. Top-down view, one-shot animation. Effect: SCRAMBLED. Frames 1-4: a pink-magenta-violet swirl vortex spins inward around the empty center, tightening. Frames 5-8: the swirl flings outward into pink sparkles and fades. Use pink and violet, not pure magenta. Keep the middle 45% of every cell empty. Same style as the attached image. Solid flat magenta #FF00FF background, no glow haze on the background, crisp edges, no text, no turret.
```

> Lưu ý nền: `fxa_xao` màu hồng gần magenta → khi cắt khoá nền kiểm kỹ viền; nếu ăn màu thì gen lại đổi sang tím-xanh.

---

## 4. Kế hoạch gắn vào game (làm SAU, tối thiểu)

**Ảnh:** `thap/assets/fxa_<k>.png` = **dải ngang 8 khung vuông** (cắt từ lưới 4x2: hàng 1 → khung 0–3, hàng 2 → khung 4–7) để `REN.coDai()` dùng được như `fxb_*` (khung = chiều cao dải). Cắt khoá magenta + Lanczos về 3× cỡ vẽ lớn nhất (ô ~46 px × 1.4 ≈ 64 px CSS → khung ~192 px; bùng S×1.5 → kiểm `tools/thap-kt-min3x.js`). Raw giữ ở `docs/demo-hop-tuong/thap-art/raw_fxa_*.png`. Chạy `node tools/build-asset-list.js` nếu có danh sách ảnh.

**buffvfx.js (sửa nhỏ, giữ đường dự phòng `fxb_*`):**
1. `LOAI[k].anh2 = 'fxa_<k>'`; có ảnh `fxa_` thì dùng, chưa có thì chạy y như cũ (fxb 3 khung lặp + khung 4 bùng).
2. Khi `false→true` (đã có sẵn ở `capNhat`, `v.on[k]`): phát khung **0–3 một lần ở 10 fps** (0.4 s, alpha 1, cỡ 1.0) — thay `bung()` bằng khung 4 của fxb.
3. Sau đó lặp khung **4–7 ở 8 fps**, alpha thấp (SO-LIEU c2): buff kề vĩnh viễn (dmg/toc/crit/cham/chet) **mờ về ~0.2** sau 1 s (mạnh hơn → tới 0.3); buff tạm (`tocT`, max, khien) 0.4–0.6. **Tốc bắn gồm Overclock**: `toc` mạnh hơn (epxung +65–90%) → alpha cao hơn + lặp nhanh hơn (8 → 12 fps) + cỡ ×1.08; không ảnh riêng.
4. Mất (true→false): mờ 0.2 s, co 1 → 0.9 (không cần ảnh riêng).
5. Debuff thêm vào `doManh` bằng khoá mới (`da`, `cam`, `lua`, `tocxuong`=`st.kep>0 && !st.cam || giamT>0` (giamT alpha 0.5), `hex`=`hexT>0`; `dmgxuong` = **one-shot** trên mọi ụ tấn công bàn đối thủ khi Sync Cannon bắt đầu có hiệu lực (heSoDoiThu từ 1 → <1) hoặc lên mức, không lặp). Debuff **P0** (`da`, `cam`, `lua`, và `bang` của BANGFX) **luôn chiếm suất 1**, alpha 0.9, và **ẩn mọi hào quang buff** trên ụ đó (ụ không bắn thì buff vô nghĩa).
6. Trần: **tối đa 2/ụ** (giữ nguyên); bàn > 8 ụ có hiệu ứng → 1/ụ (giữ nguyên `lim`).
7. One-shot (`saolen`, `saoxuong`, `sach`, `xao`, `mana`, `dmgxuong`): chỉ phát 8 khung một lần qua `VX.ds` (`k:'bvx'`), gọi từ `nangSao`/`haSao`/`X.sao±`/`VX.donSach`/`VX.manaRa`/xaotron; thay chữ "−1★" bằng `fxa_saoxuong` (chữ giữ ở CHẾ ĐỘ có REDUCE MOTION).
8. **LOD:** `CG.doc().fx === 'gon'` (EFFECTS Minimal) → TẮT vòng lặp buff và bùng buff; vẫn giữ debuff P0 (lặp 4 fps) và one-shot ±1★. Balanced → lặp buff alpha × 0.7. REDUCE MOTION (`CG.doc().dong`) → lặp 4 fps.
9. Đồng bộ mọi chế độ (QUY-TAC-HINH §6): buffvfx.js đã chạy chung SOLO/CO-OP/PVP/ONLINE/Test range qua `VX.duoiDau` — chỉ cần kiểm ảnh từng chế độ.

**Thay thế:**

| Ảnh mới | Thay | Ghi chú |
|---|---|---|
| fxa_max/dmg/toc/crit/khien/chet/cham/mana | fxb_max/dmg/toc/crit/khien/chet/cham/mana (fxa_toc gồm cả Overclock) | fxb_* giữ làm dự phòng tới khi fxa_ ổn |
| fxa_tocxuong | `vong_xich` (st.kep) + chữ CLAMPED/−8% | **bỏ hẳn vòng xích** (người dùng chốt); chữ nổi giữ 1 lần lúc trúng |
| fxa_cam | `vong_xich` + chữ JAMMED (st.cam) | không xích; `cam` ưu tiên hơn `tocxuong` (trùm Jammer đặt cả kep lẫn cam) |
| fxa_da | `phu_da` | đầu súng xám giữ nguyên |
| fxa_lua | `phu_lua` + chấm cam `cham1('#ff7a2a')` | |
| fxa_hex | `phu_ngam` dùng tạm cho hexT | |
| fxa_saoxuong / fxa_saolen | chữ "−1★" + tiaLua / FX.vong1 | |
| fxa_sach | hạt `VX.donSach` | |
| fxa_xao | `tb_doiloai` (khi bị đổi loại) | |
| — | BANGFX, TVF tb_*, phu_ngam (báo chiêu), fx_awaken | **giữ nguyên** |

**Kiểm sau khi gắn:** chụp 844×390 + dọc 390×844, bàn đầy 15 ụ có buff (độ rối), PVP có kep/cam, wave trùm Janus/Octopus/Jammer; xem tận mắt từng ảnh.

---

## 5. Quyết định của người dùng (07/11)

1. **Kẹp Phá / Nhiễu Sóng / Mirror Gate −40% (st.kep):** THAY vòng xích bằng bánh răng chậm dần + bùn nhỏ giọt (`fxa_tocxuong`). Không còn xích ở đâu (kể cả trùm Jammer → `fxa_cam`).
2. **Overclock:** không ảnh riêng — gộp vào `fxa_toc`; mạnh hơn = đậm hơn, quay nhanh hơn, to hơn chút.
3. **Sync Cannon PVP −sát thương:** bùng 1 lần (chevron đỏ nứt rơi xuống) trên ụ đối thủ khi bắt đầu, không lặp.
4. **Không làm hiệu ứng độc** (không có debuff độc trên ụ).

**Tổng: 18 hiệu ứng** — đợt A 10 (A1–A10), đợt B 8 (B1–B8). Chưa gen: chờ session điều phối báo "GO" (Chrome đang bận).
