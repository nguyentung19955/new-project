# VFX TRÙM + CHỈ HUY (review VFX-93 mục IV, V, II.C, X) — thap/js/trumvfx.js

Chỉ hiển thị: KHÔNG đổi luật, thời gian (1,4 s), sát thương, cách chọn mục tiêu. Online tất định (không random, không ghi luật).
Ảnh: 16 ảnh ChatGPT (`CAN-VE-boss.json` → `docs/demo-hop-tuong/thap-art/raw_*.png` → `tools/thap-cat-trumvfx.py` → `thap/assets/`).
Chụp: `tools/thap-chup-trumvfx.js` (iPhone 13 390×844 DPR 3; `CHE=coop|pvp`, `CHI=<id>|mv`).

## Nhịp chung mọi chiêu nhắm ụ (1,4 s)
T-1,4→-1,0 dấu rơi vào ô (to → vừa) · T-1,0→-0,4 giữ, thở chậm (2,5 Hz, không nháy) · T-0,4→0 nén nhỏ + sáng dần · T0 TRÚNG = dấu đập ra rồi tan /
BỊ CHẶN = dấu tô lam co lại, lắc nhẹ, tan (+ lục giác chặn có sẵn). Ô có khiên → viền lục giác lam nhạt `tb_khien` trước khi nổ.
Trùm đang báo: vòng cảnh báo dưới chân (`tb_trum`; Hive `tb_to`, Patch Titan `tb_suachua`). Tâm ngắm đỏ `phu_ngam` chỉ còn cho Sniper/đối thủ PVP.

| Trùm | Dấu | Ảnh dải |
|---|---|---|
| Mad Crown — SCRAMBLE | 4 lá bài hồng xoay (`tb_doiloai`) | trum_mad_crown(.png/_chan) |
| Freezer — DEEP FREEZE | vòng bông tuyết (`tb_bang`), CO-OP chia 2 bàn | trum_freezer(_chan, _coop) |
| Janus — PETRIFY | vòng đá nứt + khối vàng (`tb_da`) | trum_janus(_chan) |
| Joker King — FORCE MERGE | vòng hề + găng chỉ xuống (`tb_mimic`) | trum_joker_king(_chan) |
| Nightmare — SNIPE | 4 góc tam giác đỏ (`tb_snipe`), không phải vòng tròn | trum_nightmare(_chan, _pvp) |
| Octopus — BURN | vòng 3 mắt lửa (`tb_lua`) | trum_octopus(_chan) |
| Static Jammer — JAM | vòng sóng tím đứt + ổ khoá (`tb_xich`) | trum_jammer(_chan) |
| Star Leech — STAR THEFT | sao nứt bị hút (`tb_sao`) + số sao đang giữ trên thanh máu + vòng sao lúc lao | trum_leech(_chan, _pvp) |
| Hive Mother — SWARM | vòng tổ ong dưới chân → bung lúc thả drone | trum_hive |
| Prism Warden — PRISM SHIELD | 3/4 mảnh khiên pha lê quanh trùm: sáng = còn, mờ = đã vỡ (đúng số loại ụ khác nhau đã bắn) | trum_prism(_pvp) |
| Twin Core — SPLIT | nứt khi < 30% máu (sắp tách); 2 lõi có thanh máu riêng (đã có) | trum_twin_core |
| Patch Titan — REPAIR | vòng bánh răng + cờ lê dưới chân; dây sửa xanh lục tới quái cùng làn | trum_patcher(_coop) |

Mọi trùm: gần lối ra (> 70% đường) hiện số tim sẽ mất (ảnh tim × E.tim) cạnh thanh máu.

## Chỉ huy
- REINFORCE: khoang thép (`cmd_capsule`) rơi xuống từng ô mới rồi mở; bàn đầy → tia sáng rọi xuống ụ nhận +1★.
- RAGE: viền rãnh cam (`cmd_rage`) quanh ô các ụ có sát thương, lan từ giữa bàn ra; 2 s cuối nhịp báo hết. Không phải lửa/burn.
- HOLY SHIELD: lưới lục giác vàng nhạt (`cmd_khien`) trên từng ô, lan từ giữa ra; khác Holy Halo (Halo không vẽ lưới).
- Bỏ chớp toàn màn (FX.sang) của RAGE/HOLY SHIELD và bỏ "bùng" hào quang đồng loạt cả bàn lúc bật.

## Đã có (không làm lại)
Thẻ chỉ huy: sẵn sàng / thiếu mana (không trừ, không FX) / hồi chiêu / thời gian tác dụng / giá ×2 (chihuy-the.js). Lục giác chặn
(VX.chanKhien). Băng Freezer (bangfx.js). Twin Core: tách 2 lõi, thanh máu riêng. Leech: trả sao khi chết (starup). Jammer: vòng xích khi bị câm.

## Không làm (lý do)
- Tên chiêu nổi trên sân lúc T-1,4: trái quy tắc "không chữ popup trong trận" (chỉ hiện khi bật Battle hints — đã có).
- Boss crit/weak point, Reduce Flash cài đặt: phần của session P1.

## Xuất bản
dc97b39 trên claude/mobile-tower-defense-game-k5oxzo (thap/ = bản 6975b8d, ver 8c9500b72d). Hồi quy 4 cỡ XANH trên bản này.
Lần chạy lại sau khi kéo P0/P1 (390, NHANH): chỉ trượt thap-kt-vi vì 3 chữ cài đặt mới của P1 (EFFECTS / REDUCE FLASH / HAPTICS — camgiac.js) chưa có bản Việt → chưa xuất bản phần P1; việc của session P1 / Tiếng Việt.
