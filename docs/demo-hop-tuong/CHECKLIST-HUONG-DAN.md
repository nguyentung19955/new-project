# CHECKLIST HƯỚNG DẪN — đối chiếu với TÀI LIỆU GỐC

> Chuẩn đối chiếu: `docs/demo-hop-tuong/TAI-LIEU-GOC.md` (đọc từ code). Rà lần 1: **10/11/2026**, code gốc `8412b00` (+ bản sửa chữ trong cùng đợt).
> Cột: **Mục · Nơi trong game · EN · VI · Hình/video · Kết quả · Chỗ sai · Cách sửa · Đã sửa?** — "video" = màn **bắn thử** trên trang ụ (`skilldemo.js`, chú thích chạy qua `MV.doiChu` của `motvong.js` nên chữ "tap" của ụ tự kích tự đổi thành "auto").
> Quy tắc: lệch CHỮ → sửa ngay; lệch HÌNH cần vẽ mới → ghi prompt ChatGPT (mục E); code có vẻ sai thiết kế → mục F "Cần người dùng quyết" (không đổi luật/số).

## Tổng kết
| | Số mục |
|---|---|
| Đã rà | 47 mục (trong đó 96 mô tả ụ quét tự động) |
| KHỚP | 33 |
| LỆCH | 14 |
| Đã sửa | 13 (chữ EN/VI) |
| Chờ vẽ hình (prompt mục E) | 1 nhóm (14 ụ) |
| Cần người dùng quyết (mục F) | 3 |

Test sau khi sửa: `thap-kt-vi` ✓ (Tiếng Việt đủ — trước đó TRƯỢT: 35 chuỗi thiếu + "WAVE 9" ở màn kết quả), `thap-kt-tu-kich` 29/0 ✓, `thap-kt-vetay-ui` 0 lỗi ✓, `thap-kt-hinh-ui` chỉ báo 404 chập chờn của server tĩnh (mỗi lần 1 ảnh khác, ảnh có trong repo).
Ảnh đã xem (393×852): trang ụ Jammer EN/VI (mục MODES AND DECK), Cooldown Horn VI (trên + bắn thử), Iron Fist VI, Werewolf EN, hướng dẫn bước đầu EN/VI, bảng GAME MODE VI.

## A. Hướng dẫn đầu game (`huongdan.js: HD.BUOC`)
| Mục | Nơi | EN | VI | Hình/video | Kết quả | Chỗ sai | Cách sửa | Đã sửa? |
|---|---|---|---|---|---|---|---|---|
| Bước 1 mục tiêu | Trận hướng dẫn | "Stop enemies reaching your CORE · Each enemy that gets through costs a life. You have 3." | có | mũi tên `h2_canh_bao` | KHỚP | — (quái to/trùm −2 tim được nói ở bước 7) | — | — |
| Bước 2 triệu hồi | nút SUMMON | "Tap SUMMON twice · … Each summon costs +10 mana." | có | mũi tên chỉ nút | KHỚP (`LUAT.giaTrieuTang` 10) | — | — | — |
| Bước 3 ghép | bàn | "Same turret + same ★ = merge: a RANDOM turret from your deck with +1★." | có | dựng sẵn cặp ghép (ghi rõ "Tutorial setup") | KHỚP (`ghep`) | — | — | — |
| Bước 4 xem thông tin | chạm ụ | "Its card shows what it does and its star skills." | có | — | KHỚP | — | — | — |
| Bước 5 chỉ huy | thẻ chỉ huy | "REINFORCE: two free turrets. Costs mana, doubles each use, then cools down." | có | nạp mana cho bước này (ghi rõ) | KHỚP (`MAVUONG.hero`, `LUAT_MV.heSoGia` 2) | — | — | — |
| Bước 6 tự chơi | thanh thẻ | "Tap a card below to upgrade that turret with mana. Hold it to read it. Boss at wave 10." | có | — | KHỚP (POWER-UP, trùm wave 10) | — | — | — |
| Bước 7 trùm | cảnh báo trùm | "Bosses use skills and cost 2 lives if they get through." | có | băng trùm | KHỚP (`sinhTrum` tim 2) | — | — | — |
| Kết thúc | màn kết quả | "Tutorial cleared — gift: Ice Blade joins your collection" | có | — | KHỚP (`SHC.qua.hd = kiembang`; mở Trắng+Xanh, CO-OP, Leo Tháp, Thử thách) | — | — | — |
| Bộ hướng dẫn | — | Sniper, Gatling, Frost, Tesla, Revolver + REINFORCE | — | — | KHỚP (đều trong 10 ụ khởi đầu) | — | — | — |

## B. Nhắc nhanh / chữ trong trận
| Mục | Nơi | EN | VI | Hình | Kết quả | Chỗ sai | Cách sửa | Đã sửa? |
|---|---|---|---|---|---|---|---|---|
| Mẹo POWER-UP | dải gợi ý trên thanh thẻ (`tien-ui.js` + `CHI.nang.mo`) | "+25% base damage… (+1 → +2 → +3 → MAX). Tap a card · hold for info." | **LỆCH** | — | LỆCH | VI hiện nửa Anh nửa Việt (câu ghép 2 đoạn không có bản dịch) | thêm khoá VI nguyên câu (`vi.json`) | ✓ |
| Chú thích nút chỉ huy | bảng thông tin chỉ huy (`ui.js`) | "Archfiend skill · tap the button to cast" | "Kỹ năng Ma vương…" | — | LỆCH | tên cũ "Archfiend / Ma vương"; game gọi là COMMANDER / CHỈ HUY | → "Commander skill…" / "Kỹ năng Chỉ huy…" | ✓ |
| Nhãn buff RAGE | bảng buff ụ (`buff.js`) | "Archfiend RAGE 10s" | "CUỒNG NỘ Ma vương" | — | LỆCH | như trên | → "Commander RAGE" / "CUỒNG NỘ Chỉ huy" | ✓ |
| Số wave màn kết quả | kết quả trận (`ketqua.js`) | "WAVE 9" | **"WAVE 9"** | — | LỆCH | `chedo-d.js` ghi đè từ điển `'WAVE #': 'WAVE #'` → VI không dịch | đổi thành `'ĐỢT #'` (cùng chữ các màn khác) | ✓ |
| Tên chủ đề wave (11/11) | bảng "WAVE n" đầu wave (`ui.js: bangWave`, `TEXT.chuDe`) | MIXED · SWARM · AIR RAID · ARMORED · ELITE · EXPRESS · MITOSIS · CHAOS (wave trùm: "BOSS INCOMING!", wave 1: "Summon & merge turrets!") | HỖN HỢP · BẦY ĐÀN · KHÔNG KÍCH · THIẾT GIÁP · TINH ANH · TỐC HÀNH · PHÂN BÀO · HỖN LOẠN | — | KHỚP (`TAI-LIEU-GOC.md` mục 3, bảng chủ đề) | — | — | — |
| Mẹo sau trận theo quái (11/11) | màn kết quả (`ketqua.js: meo`) | "Splitters burst into 3…" (số lấy từ `QUAI.tach.tach.n`) + mẹo mới Swarmling / Runner / Elite | có | — | KHỚP (Splitter tách 3; Runner miễn làm chậm; Elite máu ×12) | — | — | — |
| Mẹo bộ bài | bộ bài | "Tip: take at least 2 Attack turrets" · "Only 1 Mythic turret per deck" | có | — | KHỚP | — | — | — |
| Nhãn trùm | thanh trên | "BOSS IN n" / Leo Tháp "FLOOR t · k/5" | có | — | KHỚP | — | — | — |
| Bảng xem trùm | trùm (`trumxem.js`) | "Solo & PvP: random boss from wave N" | "Solo & PvP…" | chân dung trùm | LỆCH | Solo đã bỏ; Leo Tháp chọn trùm theo tầng (không hẳn "random") | → "Single-player & PvP: can appear from wave N" / "Chơi đơn & PvP: có thể ra từ đợt N" | ✓ |

## C. Mô tả 97 ụ (`text.js: TEXT.turret`, `SKILLS[id].mo`, `phattrien.js: HO_MOI/MOC`, VI `vi.json`)
Quét tự động: lấy mọi con số trong mô tả ngắn, so với số mà chính hàm trận in ra ở 1★…7★ (`upBangSao`), `SKILLS` và `KY_NANG_CAP`; quét chữ "Solo/solo", "Archfiend", "melee"; quét chuỗi VI chưa dịch trên trang ụ đủ 96 ụ (`NN.thieu`).
| Mục | Nơi | EN | VI | Hình/video | Kết quả | Chỗ sai | Cách sửa | Đã sửa? |
|---|---|---|---|---|---|---|---|---|
| 86 ụ còn lại | trang ụ + thẻ | khớp số code | có | bắn thử | KHỚP | — | — | — |
| Radar | mô tả | "+45% at 7★" | # | — | LỆCH | code 7★ = 19,5 × 2,35 = **45,8 → 46%** (bảng sao hiện 46) | → "+46% at 7★" | ✓ |
| Genesis Core | mô tả | "Every 12s gives +1★…" | # | — | LỆCH | thẻ Đỏ bắt đầu LV11 → 12/(1+0,03×2) = **11,3 s** (bảng sao "every 11.32s") | → "Every 11s…" | ✓ |
| Crit Antenna | mô tả | "+6.8% at 1★, +22.5% at 7★" | # | — | KHỚP (làm tròn) | bảng sao làm tròn 7% / 23% | — | — |
| Chiller | mô tả | "Bosses max 50%" | # | — | KHỚP (`HOTRO.CHAM_TRUM` 0,5) | — | — | — |
| Cooldown Horn | mô tả + dòng sao + "Its twist" + bắn thử | "your Archfiend skill…" | "Ma vương" | caption "Your Archfiend skill is cooling down" | LỆCH | tên cũ | → Commander / Chỉ huy (text.js, skills2.js, phattrien.js, skilldemo.js + VI) | ✓ |
| Jammer, Scrambler, Star Breaker, Rainbow, Signal Jammer, Mirror Gate, Hex Saboteur | mô tả + dòng sao | "Solo: …", "co-op/solo …", "SOLO slows…", "SOLO (always)…" | "Solo: …" | — | LỆCH | chế độ Solo đã bỏ (10/11) | → "Single-player:" / "Chơi đơn:" (text.js, skills2/4/7.js + VI) | ✓ |
| Iron Fist / Teleporter | mô tả | "Melee…", "move a melee turret next to the path" | "Cận chiến" | — | KHỚP | Iron Fist thật sự cận chiến (`SKILLS.nam.tam` 105→165 px) | — | — |
| Ụ tự kích (Cryo Reactor, Chrono Throne, Hive Queen, Leviathan, Genesis Core, Wyrm Engine, Hydra, Evolver) | mô tả, mốc sao, bắn thử | trong code ghi "tap…" | "chạm…" | caption "Tap: …" | KHỚP khi hiển thị | `motvong.js: MV.doiChu` đổi "tap" → "auto" lúc hiện (mô tả, mốc, demo) | — (nguồn chữ còn "tap" nhưng người chơi thấy "auto") | — |
| Black Hole, Arcane Cascade | mô tả | "tap (30 mana)" / "tap when full" | có | caption "Tap: …" | KHỚP (`TU_KICH` không có 2 ụ này) | — | — | — |
| VI thiếu dịch | trang ụ VI | Copycat, Hydra, Blood Circuit, Hex Saboteur, Arcane Cascade, Werewolf (dạng), Star Lift (mốc 5/7★), Twin Maker, Fusion Archive… | **35 chuỗi tiếng Anh** | — | LỆCH | khoá VI chưa có / mô tả đổi sau bản dịch | thêm ~40 khoá `vi.json` → `tools/thap-vi-dung.py` | ✓ |

- **Crimson Sting (`bocap`, ụ 97 — thêm 10/11):** mô tả `text.js` + `roster.json`/`meta.js` (EN/VI) khớp `SKILLS.bocap` (11/11 lên bậc Đỏ: +13% ST ở LV11 — trước +16% — và +1% ST chí mạng mỗi STING, tốc tiến tới +100%, ghép / hạ sao về 0, đá/băng giữ); dòng `mo` ngắn theo sao (3★ +5% chí mạng · 5★ chí mạng thứ 3 +2 · 7★ dấu nọc +10%/3 s); mốc `MOC_RIENG`, dạng `GROW` (0–49 / 50–199 / 200+), bắn thử `SD_K.bocap` (Crit Antenna kề; dạng 1/2/3 đặt 12 / 50 / 200 STING), nhắc nhanh `SD_MO`, bảng chạm `hudb.js` ("STING N · +X% damage · +Y% fire rate · +Z% crit damage"), Partners riêng (Crit Antenna, Hammer, Focus Lens) + Watch out "Merging it resets its STING". VI: `vi.json` đủ (`tools/thap-kt-vi.js` ✓). Đã xem ảnh EN + VI: `/home/claude/xem/bocap/`.

## D. Trang ụ (`unitpage.js`)
| Mục | Nơi | EN | VI | Hình/video | Kết quả | Chỗ sai | Cách sửa | Đã sửa? |
|---|---|---|---|---|---|---|---|---|
| MODES AND DECK — dòng chung | 89 ụ | "Works the same in solo, co-op and PvP." | "…ở solo, co-op và PvP" | — | LỆCH | còn chữ solo | → "Works the same in every mode." / "Hoạt động như nhau ở mọi chế độ." | ✓ |
| MODES AND DECK — dòng riêng | 7 ụ Khống chế/hỗ trợ đặc biệt | nhãn "Solo" | "Solo" | — | LỆCH | như trên | nhãn "Single-player" / "Chơi đơn"; regex đọc được cả bản VI (trước khi sửa, VI mất dòng này) | ✓ |
| MODES AND DECK — Mythic | ụ Đỏ | "Max 1 Mythic per deck…" | có | — | KHỚP | — | — | — |
| MERGE RULES — Compass Cannon | trang ụ | "A Copycat copy keeps them too." | "Bản sao Copycat cũng giữ." | — | LỆCH | code (`SKILLS.saochep.ghepDB.lam`, 08/11): bản sao = Pháo mới, **1 hướng ngẫu nhiên mới, 0 stack** | → "A Copycat copy is a new Compass: 1 new random direction, 0 stacks." + VI | ✓ |
| MERGE RULES — Prism Thief, Wild Link, Normal/Stone | trang ụ | — | có | — | KHỚP | — | — | — |
| Thông số (Damage/Rate/Range/Target) | trang ụ | từ `dmgU`/`tocTT`/`upTam` | có | — | KHỚP (cùng hàm trận) | — | — | — |
| FORMS — Werewolf | trang ụ | PUP / NORMAL / AWAKENED (hiện 2 dạng) | có | `soi_dau_thuong` / `soi_dau_thuctinh` | KHỚP (cùng ảnh `skills2.js` vẽ trong trận) | — | — | — |
| FORMS — 11 ụ có ảnh dạng `_nong_s1..s3` (Overlord, Mystery Box, Cryo Reactor, Orbital, Berserker, Star Cannon, Chain Link, Sync Cannon, Nine-Tail, Resonance Grid, Chrono Throne) + Wyrm Engine 4 dạng | trang ụ | — | — | ảnh dạng | KHỚP (`REN.dauTen` dùng cùng ảnh) | — | — | — |
| FORMS — 14 ụ dùng CHUNG 1 ảnh cho 3 dạng | trang ụ | tên 3 dạng | có | 3 ô cùng 1 ảnh đầu (CSS chỉ làm sáng) | LỆCH (hình) | trong trận dạng khác nhau bằng hiệu ứng `growfx.js`, trang ụ không thấy khác | vẽ ảnh dạng mới → prompt mục E | ✗ chờ vẽ |
| Bắn thử (video) — 96 ụ | trang ụ → Test range | chú thích `SD_K` | dịch qua NN | — | KHỚP (số lấy từ hàm trận: Frost `SKILLS.bang.dai`, Venom `knThe`, Ice Blade ×5/6/8, Drone `so()`, Mimic/Copycat/Twin Maker theo cấp thẻ) | caption Cooldown Horn "Archfiend" | đã sửa (mục C) | ✓ |

## C2. Chỉ huy, trùm, chế độ, cửa hàng, mở khoá
| Mục | Nơi | EN | VI | Hình | Kết quả | Chỗ sai | Cách sửa | Đã sửa? |
|---|---|---|---|---|---|---|---|---|
| 8 chỉ huy | thẻ + trang chỉ huy (`TEXT.af`, `UP_MV`) | số %/giây | có | — | KHỚP (`MAVUONG`: 60%/12s, +20%/loại max 100%, 3 liên kết +15% +5%/★ +10% tốc…) | — | — | — |
| Cách có chỉ huy | bảng chọn chỉ huy | wave cũ / tầng / ngọc | có | — | KHỚP (`mo2`) | — | — | — |
| 12 trùm | băng trùm, bảng xem trùm | `TEXT.boss`, `TRUM_MOI` | có | — | KHỚP (Hive 4/+2 từ w40, Jammer 2 ụ 6s, Prism −90% 3/4 loại, Patch 12%/35%, Freezer 3→5) | — | — | — |
| Bảng GAME MODE | HOME → MODE | TOWER CLIMB / CO-OP / PVP / ONLINE / QUICK TRIALS / BOSS HUNT / WEEKLY / ENDLESS | có | biểu tượng | KHỚP (Solo ẩn) | — | — | — |
| Khoá chế độ | nút khoá | "TUTORIAL", "LV 2/4/8", "3 BOSSES", "FLOOR 100" | có | — | KHỚP (`TTC.tn`) | — | — | — |
| Rương / tỉ lệ / bảo hiểm | SHOP (i) | sinh từ `KTC.ruong` | có | — | KHỚP (dữ liệu là nguồn) | — | — | — |
| Vòng quay, Daily Specials, Lò rèn, Ấn Vàng/Đỏ | SHOP | từ `KTC`, `MHC`, `CDC.anDo` | có | — | KHỚP | — | — | — |
| Nguồn mảnh Vàng | thẻ chưa có | "Tower floors 20–100 …" | có | — | KHỚP (đã đổi từ Solo wave) | — | — | — |
| Điều kiện Đỏ | thẻ Đỏ khoá | "PILOT LV 12 · FLOOR 40" | có | — | KHỚP (`TTC.moBac.do`, `doTang`) | — | — | — |
| Mở nhóm theo cấp | thẻ chưa mở | "PILOT LV n" | có | — | KHỚP (`SHC.nhom`) | — | — | — |

## E. Hình cần vẽ mới (ChatGPT — người dùng tự gen)

**ĐÃ SỬA 10/11 (13 ụ):** người dùng gen 5 tấm `docs/demo-hop-tuong/thap-art/raw_anime_u_dang_sheet1..5.png` → `tools/thap-cat-dang-dau.py` cắt + tách nền + dời tâm + viền màu nhấn → `thap/assets/<id>_nong_s1..s3.png` (khung 1 ô, dạng 1/2/3 bán kính 0,86/0,93/1,0 × 0,485 ô — to dần, dạng 3 không tràn ô); đăng ký `artscale.js window.STAGE_VE` (cỡ VẼ `DAU_VE.S`, cỡ LUẬT/mũi nòng giữ HEAD_K/ART_META.tip → không đổi gameplay). Trang ụ hiện 3 hình khác nhau, trong trận đổi hình khi lên dạng. Hydra: chỉ trang ụ (`STAGE_VE_TRANG`) — trong trận giữ vương miện n đầu. Còn lại: `tienhoa` (Evolver — trứng theo sao, không làm).
Ụ có 3 dạng grow-up nhưng chỉ có 1 ảnh đầu (`<id>_nong.png`); vẽ xong cắt ra `<id>_nong_s1..s3.png` (tools/thap-cat-hinh.py) + thêm `STAGE_K` trong `artscale.js` → trang ụ và trận tự dùng (`render.js: REN.dauTen`). Đính kèm ảnh đầu hiện tại làm tham chiếu.

| id | Tên | Dạng | Ảnh tham chiếu | Prompt (EN) |
|---|---|---|---|---|
| `tienhoa` | Evolver | EGG → EGG → EGG | `thap/assets/tienhoa_nong.png` | Attached: the current head sprite of the turret "Evolver" (top-down mobile tower-defense, anime style). Draw 3 evolution stages of this SAME head side by side in a 1x3 grid, same camera, same size, same palette: 1) fresh metal egg, 2) glowing cracked egg about to hatch, 3) burnt charred egg (never hatches, smoke wisps). Solid magenta #FF00FF background, no text, no base/pedestal, crisp edges. |
| ~~`hydra`~~ ĐÃ SỬA | Hydra | HATCHLING → MANY HEADS → SEVEN HEADS | `thap/assets/hydra_nong.png` | Attached: the current head sprite of the turret "Hydra" (top-down mobile tower-defense, anime style). Draw 3 evolution stages of this SAME head side by side in a 1x3 grid, same camera, same size, same palette: 1) HATCHLING, 2) MANY HEADS, 3) SEVEN HEADS — each stage visibly bigger/brighter with more detail, stage 3 most powerful. Solid magenta #FF00FF background, no text, no base/pedestal, crisp edges. |
| ~~`combo`~~ ĐÃ SỬA | Combo Core | WARM-UP → ON A ROLL → OVERDRIVE | `thap/assets/combo_nong.png` | Attached: the current head sprite of the turret "Combo Core" (top-down mobile tower-defense, anime style). Draw 3 evolution stages of this SAME head side by side in a 1x3 grid, same camera, same size, same palette: 1) WARM-UP, 2) ON A ROLL, 3) OVERDRIVE — each stage visibly bigger/brighter with more detail, stage 3 most powerful. Solid magenta #FF00FF background, no text, no base/pedestal, crisp edges. |
| ~~`pandora`~~ ĐÃ SỬA | Pandora Vault | LOCKED → AJAR → OPEN VAULT | `thap/assets/pandora_nong.png` | Attached: the current head sprite of the turret "Pandora Vault" (top-down mobile tower-defense, anime style). Draw 3 evolution stages of this SAME head side by side in a 1x3 grid, same camera, same size, same palette: 1) LOCKED, 2) AJAR, 3) OPEN VAULT — each stage visibly bigger/brighter with more detail, stage 3 most powerful. Solid magenta #FF00FF background, no text, no base/pedestal, crisp edges. |
| ~~`nemesis`~~ ĐÃ SỬA | Nemesis | SCALES → SCYTHE → VERDICT | `thap/assets/nemesis_nong.png` | Attached: the current head sprite of the turret "Nemesis" (top-down mobile tower-defense, anime style). Draw 3 evolution stages of this SAME head side by side in a 1x3 grid, same camera, same size, same palette: 1) SCALES, 2) SCYTHE, 3) VERDICT — each stage visibly bigger/brighter with more detail, stage 3 most powerful. Solid magenta #FF00FF background, no text, no base/pedestal, crisp edges. |
| ~~`nhatthuc`~~ ĐÃ SỬA | Eclipse | DUSK → CORONA → TOTAL ECLIPSE | `thap/assets/nhatthuc_nong.png` | Attached: the current head sprite of the turret "Eclipse" (top-down mobile tower-defense, anime style). Draw 3 evolution stages of this SAME head side by side in a 1x3 grid, same camera, same size, same palette: 1) DUSK, 2) CORONA, 3) TOTAL ECLIPSE — each stage visibly bigger/brighter with more detail, stage 3 most powerful. Solid magenta #FF00FF background, no text, no base/pedestal, crisp edges. |
| ~~`marionette`~~ ĐÃ SỬA | Marionette | STRINGS → GOLDEN HAND → TWIN PUPPETS | `thap/assets/marionette_nong.png` | Attached: the current head sprite of the turret "Marionette" (top-down mobile tower-defense, anime style). Draw 3 evolution stages of this SAME head side by side in a 1x3 grid, same camera, same size, same palette: 1) STRINGS, 2) GOLDEN HAND, 3) TWIN PUPPETS — each stage visibly bigger/brighter with more detail, stage 3 most powerful. Solid magenta #FF00FF background, no text, no base/pedestal, crisp edges. |
| ~~`guongcong`~~ ĐÃ SỬA | Mirror Gate | MIRROR → TWIN PANES → SHARD HALO | `thap/assets/guongcong_nong.png` | Attached: the current head sprite of the turret "Mirror Gate" (top-down mobile tower-defense, anime style). Draw 3 evolution stages of this SAME head side by side in a 1x3 grid, same camera, same size, same palette: 1) MIRROR, 2) TWIN PANES, 3) SHARD HALO — each stage visibly bigger/brighter with more detail, stage 3 most powerful. Solid magenta #FF00FF background, no text, no base/pedestal, crisp edges. |
| ~~`chuato`~~ ĐÃ SỬA | Hive Queen | NEST → HIVE → ROYAL HIVE | `thap/assets/chuato_nong.png` | Attached: the current head sprite of the turret "Hive Queen" (top-down mobile tower-defense, anime style). Draw 3 evolution stages of this SAME head side by side in a 1x3 grid, same camera, same size, same palette: 1) NEST, 2) HIVE, 3) ROYAL HIVE — each stage visibly bigger/brighter with more detail, stage 3 most powerful. Solid magenta #FF00FF background, no text, no base/pedestal, crisp edges. |
| ~~`leviathan`~~ ĐÃ SỬA | Leviathan | HATCHLING → DEEP ONE → ABYSS LORD | `thap/assets/leviathan_nong.png` | Attached: the current head sprite of the turret "Leviathan" (top-down mobile tower-defense, anime style). Draw 3 evolution stages of this SAME head side by side in a 1x3 grid, same camera, same size, same palette: 1) HATCHLING, 2) DEEP ONE, 3) ABYSS LORD — each stage visibly bigger/brighter with more detail, stage 3 most powerful. Solid magenta #FF00FF background, no text, no base/pedestal, crisp edges. |
| ~~`khoisinh`~~ ĐÃ SỬA | Genesis Core | SEED → BLOSSOM → LOTUS OF LIFE | `thap/assets/khoisinh_nong.png` | Attached: the current head sprite of the turret "Genesis Core" (top-down mobile tower-defense, anime style). Draw 3 evolution stages of this SAME head side by side in a 1x3 grid, same camera, same size, same palette: 1) SEED, 2) BLOSSOM, 3) LOTUS OF LIFE — each stage visibly bigger/brighter with more detail, stage 3 most powerful. Solid magenta #FF00FF background, no text, no base/pedestal, crisp edges. |
| ~~`lualien`~~ ĐÃ SỬA | Ember Relay | EMBER → KINDLED → FULL BLAZE | `thap/assets/lualien_nong.png` | Attached: the current head sprite of the turret "Ember Relay" (top-down mobile tower-defense, anime style). Draw 3 evolution stages of this SAME head side by side in a 1x3 grid, same camera, same size, same palette: 1) EMBER, 2) KINDLED, 3) FULL BLAZE — each stage visibly bigger/brighter with more detail, stage 3 most powerful. Solid magenta #FF00FF background, no text, no base/pedestal, crisp edges. |
| ~~`luutru`~~ ĐÃ SỬA | Fusion Archive | EMPTY SHELVES → FILING → GRAND ARCHIVE | `thap/assets/luutru_nong.png` | Attached: the current head sprite of the turret "Fusion Archive" (top-down mobile tower-defense, anime style). Draw 3 evolution stages of this SAME head side by side in a 1x3 grid, same camera, same size, same palette: 1) EMPTY SHELVES, 2) FILING, 3) GRAND ARCHIVE — each stage visibly bigger/brighter with more detail, stage 3 most powerful. Solid magenta #FF00FF background, no text, no base/pedestal, crisp edges. |
| ~~`cobac`~~ ĐÃ SỬA | Lucky Slot | SLOT → HIGH ROLLER → GRAND CASINO | `thap/assets/cobac_nong.png` | Attached: the current head sprite of the turret "Lucky Slot" (top-down mobile tower-defense, anime style). Draw 3 evolution stages of this SAME head side by side in a 1x3 grid, same camera, same size, same palette: 1) SLOT, 2) HIGH ROLLER, 3) GRAND CASINO — each stage visibly bigger/brighter with more detail, stage 3 most powerful. Solid magenta #FF00FF background, no text, no base/pedestal, crisp edges. |

## F. Cần người dùng quyết (không tự đổi)
| # | Chỗ | Hiện tại (code) | Vì sao hỏi | Gợi ý |
|---|---|---|---|---|
| 1 | Màn kết quả ONLINE khi bạn đã rời (`online/ketqua-onl.js` nút `kqo-solo`) | nút **PLAY SOLO** vẫn mở trận Solo ẩn (`batDau('solo')`, bàn chữ C, không tầng) | Solo đã bỏ khỏi game; nút này đưa người chơi vào chế độ không còn trong bảng GAME MODE | (khuyên dùng) đổi thành **TOWER CLIMB** → vào tầng kế (`CD.vao('thap', CD.thapKe())`); hoặc bỏ nút |
| 2 | Từ gọi chế độ một người trong mô tả ụ | đã đổi "Solo" → **"Single-player" / "Chơi đơn"** | người dùng có thể muốn tên khác (vd "Tower") | giữ "Chơi đơn" (đúng cho cả Leo Tháp, Săn Trùm, Thử thách, Vô tận, Tuần) |
| 3 | 14 ụ grow-up không có ảnh dạng riêng | trang ụ hiện 3 ô cùng 1 ảnh | cần vẽ 14 tờ ảnh (mục E) | vẽ theo đợt ≤10 tab ChatGPT |

## Cách quét (chạy lại khi đổi chữ/số)
1. Server tĩnh ở gốc repo: `python3 -m http.server 8765`.
2. Playwright nạp `thap/index.html?notut=1` (thêm `localStorage tm_lang=vi` cho Tiếng Việt), với mỗi `id` trong `G.roster`: đọc `TEXT.turret[id].skill`, `upBangSao(id)` (số 1★…7★ do hàm trận in), `upLuatGhep(id)`, `upCheDo(id)`, `mocCua(id)`, `GROW[id]`, `KY_NANG_CAP[id]`; dựng `UP.html(...) + UP.chiTiet(...)` vào DOM để lấy chữ hiển thị + `NN.thieu`.
3. So: số trong mô tả ∈ số của hàm trận; không còn "Solo/solo", "Archfiend/Ma vương"; `NN.thieu` rỗng; chạy `node tools/thap-kt-vi.js`.
4. Ảnh: chụp 393×852 EN + VI trang ụ (đầu trang, bắn thử, MODES AND DECK) và xem bằng mắt.
