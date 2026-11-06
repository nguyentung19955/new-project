# VFX P3 — kiểm toán hiệu ứng đánh / chiêu của 79 ụ còn lại (06/11)

Phạm vi: 93 ụ trừ 12 ụ P2 (tuvan/vfx-p2) và 2 rồng (Leviathan, Wyrm — tuvan/rong). Luật: tuvan/vfx/YEU-CAU-ANIM.md (không lắc / phập phồng / nhấp nháy 1 ảnh tĩnh).
Cách đo: `node tools/thap-kt-p3.js` (iPhone 13, DPR 3) — mỗi ụ 2 pha: **atk** = 1★ đánh thường 4,2 s, **sk** = 4★ + kỹ năng chủ động / nạp đầy; đếm đối tượng vẽ:
`pop` = FX.anim ảnh tĩnh nổ trúng (`no1` → render.js veMot: phóng 0,6→1,1), `nòng` = chớp nòng ảnh tĩnh, dải khung (FX.anim thường, SIG, HU). Đọc thêm code mọi `Math.sin(t·k)` trên ảnh (skills*.js, render.js, hieuung.js, sigfx.js, bangfx.js, growfx.js).
Dải khung trước/sau: `strips/<id>_atk.jpg`, `strips/<id>_sk.jpg` (8 khung × 0,07 s).

## Kết luận
- **52/79 ụ có nổ trúng hoặc chớp nòng** dùng chung 1 kiểu: ảnh tĩnh `fx_<id>_trung` phóng 0,6→1,1 rồi mờ (+ chớp nòng `fx_<id>_no` phóng 0,55→1,15). Đây là "ảnh rung" phổ biến nhất → sửa 1 chỗ cho tất cả: **CG.K3** (camgiac.js) dựng sẵn từ chính ảnh ChatGPT của ụ 1 dải 6 khung *loé → bung → khoét tâm + bẻ mép thành mảnh → tan* (chớp nòng 4 khung *phụt → dài → tắt từ nòng*), cộng **tia lửa** bay ra (màu nguyên tố) và vòng dư âm mảnh cho đòn lớn. Dựng 1 lần/ảnh lúc vào trận (rảnh, 60 ms/dải), trần bộ đệm 48 dải.
- **27 ụ có ảnh tĩnh lắc / phập phồng / nhấp nháy riêng** (bảng: ẢNH TĨNH RUNG) → bỏ dao động, thay bằng hạt thật hoặc tờ khung.
- **Màu sai:** Tesla — ảnh nổ `fx_set_trung` lõi cam (nguyên tố điện) → dải dựng sẵn phủ màu nguyên tố khi ảnh lệch > 50° (thap-kt-mau XANH 116/116).
- **Yếu / chung chung:** 20 ụ nổi bật nhất xin tờ 4×4 riêng (CAN-VE.json: raw_p3_*) — có tờ thì tự thay dải dựng sẵn.

| # | Ụ | id | Phân loại (trước) | Đối tượng vẽ (trước) | Vấn đề → sửa | Tờ |
|---|---|---|---|---|---|---|
| 1 | Cannon | canon | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (8 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (5) | tờ p3 (CAN-VE) |
| 2 | Dice Gun | xucxac | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (5 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (7) | — |
| 3 | Gatling | lien | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (7 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (45) | — |
| 4 | Scatter | phun | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (2 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (45) | — |
| 5 | Revolver | sungluc | ảnh tĩnh bật (pop) | HU.tiaTia | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (1 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (6) | — |
| 6 | Frost | bang | **ẢNH TĨNH RUNG** | bang_vo | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (4 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (2); (trùm Freezer bọc ô: khối băng rung trước khi vỡ — dùng chung bangfx) → không rung; tờ p3_bang | tờ p3 (CAN-VE) |
| 7 | Venom | doc | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (6 lần/8,4 s) | — |
| 8 | Mana Core | mana | **ẢNH TĨNH RUNG** | — | đầu nhún ±1,6 px + phập phồng 4% + sáng sin (render.js) → đứng yên, chỉ phồng 1 nhịp khi sinh mana | — |
| 9 | Sniper | tia | ảnh tĩnh bật (pop) | HU.tiaTia | chớp nòng = ảnh tĩnh phóng (3) | — |
| 10 | Tesla | set | ảnh tĩnh bật (pop) | HU.set | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (27 lần/8,4 s) | tờ p3 (CAN-VE) |
| 11 | Guillotine | maychem | ảnh tĩnh bật (pop) | no_phao, HU.chem | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (2 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (8) | tờ p3 (CAN-VE) |
| 12 | Armor Breaker | phagiap | ảnh tĩnh bật (pop) | HU.tiaPhep | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (8 lần/8,4 s) | — |
| 13 | Hammer | bua | OK (không hiệu ứng riêng ngoài vòng nạp / buff) | — | — | — |
| 14 | Iron Fist | nam | ảnh tĩnh bật (pop) | HU.tiaTia | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (31 lần/8,4 s) | — |
| 15 | Time Bomb | bomhen | **ẢNH TĨNH RUNG** | HU.bom | chớp nòng = ảnh tĩnh phóng (4); đèn bom nhấp nháy bật/tắt → đèn đều + tia lửa ngòi phụt theo nhịp (nhanh dần); tờ p3_bomhen: ngòi cháy → nổ | tờ p3 (CAN-VE) |
| 16 | Mana Doubler | nhanmana | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (1 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (13) | — |
| 17 | Ice Blade | kiembang | ảnh tĩnh bật (pop) | bang_vo | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (6 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (6) | — |
| 18 | Mimic | mimic | **ẢNH TĨNH RUNG** | — | đầu sáng nhấp nháy sin(4t) → sáng đều | — |
| 19 | Crit Antenna | chimang | OK | HU.ping | — | — |
| 20 | Teleporter | dichchuyen | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (2 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (8) | — |
| 21 | Radar | radar | OK | HU.ping | — | — |
| 22 | Drone Bay | drone | **ẢNH TĨNH RUNG** | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (1 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (14); ảnh drone nhún sin(14t) → bay thẳng + hạt lửa đuôi | — |
| 23 | Fusion Mixer | tron | OK (không hiệu ứng riêng ngoài vòng nạp / buff) | — | — | — |
| 24 | Energy Cannon | nangluong | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (7 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (7) | — |
| 25 | Laser | laser | **ẢNH TĨNH RUNG** | — | tia rung bề rộng/alpha 37–48 rad/s, điểm cháy = ảnh tĩnh xoay + phập phồng, nòng rung 40 rad/s → tia cuộn đều, điểm cháy = dải dựng sẵn LẶP khung, nòng đứng | — |
| 26 | Chiller | lanhgia | OK | HU.ping | — | — |
| 27 | Mortar | mortar | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (5 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (4) | tờ p3 (CAN-VE) |
| 28 | Amplifier | khuech | OK (không hiệu ứng riêng ngoài vòng nạp / buff) | — | — | — |
| 29 | Toxic Pool | vungdoc | **ẢNH TĨNH RUNG** | HU.may | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (5 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (3); vũng = 1 ảnh tĩnh nở ra; tờ p3_vungdoc: sủi bọt 16 khung lặp | tờ p3 (CAN-VE) |
| 30 | Cooldown Horn | loa | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (1 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (8) | — |
| 31 | Mana Leech | hutmana | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (1 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (13) | — |
| 32 | Mine Layer | min | **ẢNH TĨNH RUNG** | HU.min | chớp nòng = ảnh tĩnh phóng (4); đèn mìn nhấp nháy → đèn đều; tờ p3_min: đèn → bật → nổ | tờ p3 (CAN-VE) |
| 33 | Berserker | cuongno | **ẢNH TĨNH RUNG** | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (4 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (16); đầu nhấp nháy 20 rad/s khi bùng nổ → sáng đều + than đỏ bay lên | — |
| 34 | Blizzard | baotuyet | **ẢNH TĨNH RUNG** | bang_vo, HU.tuyet | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (16 lần/8,4 s); tuyết rơi = hạt (ok); tờ p3_baotuyet: lốc tuyết ở ụ lúc ra chiêu | tờ p3 (CAN-VE) |
| 35 | Cloner | nhanban | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (3 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (11) | — |
| 36 | Chain Link | lienket | **ẢNH TĨNH RUNG** | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (1 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (9); xích nối nhấp nháy alpha → đều | — |
| 37 | Jammer | kepha | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (2 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (13) | — |
| 38 | Cleanser | taylo | OK | HU.ping | — | — |
| 39 | Shield Gen | khien | OK | HU.ping, HU.tiaPhep | — | — |
| 40 | Mystery Box | hopbi | **ẢNH TĨNH RUNG** | — | đầu hộp LẮC mạnh dần khi sắp mở → đứng yên (tia sáng rỉ ra có sẵn); tờ p3_hopbi: rung trong khung → bật nắp | tờ p3 (CAN-VE) |
| 41 | Star Lift | nangsao | OK | HU.ping | — | — |
| 42 | Reaper Pillar | tuthan | ảnh tĩnh bật (pop) | HU.ping | nhát lưỡi hái lúc GIẾT NGAY (VX.chem → FXU.pop ảnh tĩnh, quái thử máu vô hạn nên không đếm được) → dải dựng sẵn / tờ | tờ p3 (CAN-VE) |
| 43 | Scrambler | xaotron | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (1 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (13) | — |
| 44 | Overclock | epxung | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (1 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (15) | — |
| 45 | Fifth Shot | no5 | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (8 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (11) | — |
| 46 | Storm Gun | bao | ảnh tĩnh bật (pop) | HU.set, HU.tiaTia | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (29 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (45) | — |
| 47 | Lighthouse | anhsang | ảnh tĩnh bật (pop) | HU.cauSang, HU.set | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (10 lần/8,4 s) | — |
| 48 | Purifier | aten | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (12 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (6) | tờ p3 (CAN-VE) |
| 49 | Sync Cannon | dongbo | OK (không hiệu ứng riêng ngoài vòng nạp / buff) | — | — | — |
| 50 | Railgun | railgun | ảnh tĩnh bật (pop) | HU.rail | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (7 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (2) | tờ p3 (CAN-VE) |
| 51 | Merge King | vughep | **ẢNH TĨNH RUNG** | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (10 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (9); quầng vàng (Merge King vàng) phập phồng → đều | — |
| 52 | Twin Maker | sinhdoi | ảnh tĩnh bật (pop) | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (15 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (13) | — |
| 53 | Star Breaker | hasao | OK (không hiệu ứng riêng ngoài vòng nạp / buff) | — | — | — |
| 54 | Star Cannon | ngoisao | ảnh tĩnh bật (pop) | HU.gLap | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (11 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (11) | tờ p3 (CAN-VE) |
| 55 | Werewolf | soi | **ẢNH TĨNH RUNG** | HU.gLuot, HU.gTre, HU.gVuot | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (44 lần/8,4 s); đầu sáng sin khi thức tỉnh → đều | tờ p3 (CAN-VE) |
| 56 | Rainbow | cauvong | OK | HU.cauvong | — | — |
| 57 | Wall Projector | wallgen | **ẢNH TĨNH RUNG** | HU.tuong | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (7 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (2); tường nhấp nháy 50 rad/s lúc sắp tắt, quầng vàng phập phồng, bề dày + 2 đốm mép phập phồng → tắt dần, đều; tờ p3_wallgen: dựng → rung năng lượng → vỡ | tờ p3 (CAN-VE) |
| 58 | Ricochet | nayda | ảnh tĩnh bật (pop) | HU.dia | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (16 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (11) | — |
| 59 | Combo Core | combo | **ẢNH TĨNH RUNG** | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (1 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (9); quầng dạng 3 + đầu sáng phập phồng → đều | — |
| 60 | Hydra | hydra | **ẢNH TĨNH RUNG** | HU.gDauAn, HU.gTre, HU.tiaTia, SIG hydraCan | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (14 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (29); đầu sáng phập phồng (dạng 2) → đều | tờ p3 (CAN-VE) |
| 61 | Nine-Tail | cuuvi | **ẢNH TĨNH RUNG** | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (22 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (11); đầu sáng + đốm lửa hồ ly nhấp nháy → đều; tờ p3_cuuvi: cầu lửa = ngọn lửa hồ ly chạy khung | tờ p3 (CAN-VE) |
| 62 | Pandora Vault | pandora | **ẢNH TĨNH RUNG** | — | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (8 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (8); hộp sig lắc ±1,6 px, quả cầu nhún, biểu tượng phập phồng, đầu sáng sin → đứng yên (khung tờ tự chuyển động) | — |
| 63 | Resonance Grid | luoicheo | **ẢNH TĨNH RUNG** | — | đầu lắc ±0,06 rad liên tục → đứng | — |
| 64 | Nemesis | nemesis | ảnh tĩnh bật (pop) | HU.tiaTia | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (8 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (8) | tờ p3 (CAN-VE) |
| 65 | Lone Ace | docton | **ẢNH TĨNH RUNG** | HU.tiaTia | chớp nòng = ảnh tĩnh phóng (9); vòng ACE nhấp nháy → đều | — |
| 66 | Focus Lens | thaukinh | OK | HU.ping | — | — |
| 67 | Signal Jammer | nhieusong | ảnh tĩnh bật (pop) | — | chớp nòng = ảnh tĩnh phóng (10) | — |
| 68 | Bounty Beacon | santhuong | ảnh tĩnh bật (pop) | HU.tiaPhep | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (1 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (9) | — |
| 69 | Eclipse | nhatthuc | **ẢNH TĨNH RUNG** | HU.chay, HU.tiaTia | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (9 lần/8,4 s); sóng trăng = ảnh tĩnh phóng theo bán kính (sóng thật đi ra — giữ); tờ p3_nhatthuc lúc ra chiêu | tờ p3 (CAN-VE) |
| 70 | Scrap Forge | loren | **ẢNH TĨNH RUNG** | — | đầu đung đưa ±0,2 rad + quầng lò phập phồng → đứng, đều | — |
| 71 | Mirror Gate | guongcong | **ẢNH TĨNH RUNG** | HU.ping | quầng sân gương phập phồng → đều | — |
| 72 | Marionette | marionette | ảnh tĩnh bật (pop) | HU.roi, SIG roi | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (14 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (7) | — |
| 73 | Hive Queen | chuato | **ẢNH TĨNH RUNG** | HU.chich, HU.toOng | nổ trúng = ảnh tĩnh phóng 0,6→1,1 (24 lần/8,4 s); chớp nòng = ảnh tĩnh phóng (8); ong máy phập phồng + lắc (vỗ cánh giả), đầu sáng sin, ong đậu nhún → bay vòng thật, không phập phồng | — |
| 74 | Quantum Choir | hopca | OK | chop_nong, laser_trung | — | — |
| 75 | Fusion Archive | luutru | OK | chop_nong, laser_trung | — | — |
| 76 | Blood Circuit | mauhut | **ẢNH TĨNH RUNG** | chop_nong, laser_trung | quầng VAMP phập phồng → đều | — |
| 77 | Hex Saboteur | nguyenrua | OK | chop_nong | — | — |
| 78 | Sanctum | thanhdia | OK | HU.0,15, HU.tiaPhep | — | — |
| 79 | Prism Thief | bienmau | **ẢNH TĨNH RUNG** | chop_nong, laser_trung, HU.chay | quầng lăng kính phập phồng → đều | — |
