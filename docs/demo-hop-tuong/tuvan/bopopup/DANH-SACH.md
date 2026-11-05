# Bỏ chú thích / popup chữ trong trận — danh sách & cách xử lý

Yêu cầu người dùng: "mấy cái chú thích, hoặc popup trong trận kiểu type difference bỏ đi giúp tôi".
Code: `thap/js/bopopup.js` + `thap/css/bopopup.css` (nạp sau cùng) và 1 sửa nhỏ trong `thap/js/ghepfx.js` (lắc khi bật về).
Áp dụng chung mọi chế độ (SOLO / CO-OP / PVP / ONLINE / Test range) vì lọc ở các hàm dùng chung (`FX.chu1`, `TIENUI.bay`, `KG.veMeo`, `TEXT.ui`, `TVB.CHU`).

Cài đặt mới: **BATTLE HINTS: OFF/ON** (mặc định OFF, `localStorage tm_goiy_tran`) ở Settings (sảnh) và bảng Paused. Bật = mọi chữ cũ hiện lại (cho người mới).
Hướng dẫn lần đầu (`HD.dang`) vẫn hiện đủ chữ trong lúc hướng dẫn chạy.

## A. Chữ nổi trên sân (canvas, `FX.chu1`) — BỎ (chỉ hiện khi BATTLE HINTS bật)

| Chữ | Nơi | Thay bằng |
|---|---|---|
| TYPE DIFFERS / STARS DIFFER (thả ghép sai) | ui.js `het` | ụ bật về ô cũ + **lắc ngắn 160 ms** (ghepfx.js) + chớp E21 `tv_lui1–4` ở ô gốc; lúc kéo: ô gạch chéo E19 `tv_khong` trên ô không ghép được (tvb.js) |
| FROZEN (kéo ụ đang đóng băng) | ui.js pointermove | không nhấc được (ụ có hiệu ứng băng sẵn) |
| BLOCKED / RESIST / REFLECTED / HALO / HALO: HALF | game.js, hotro.js, skills4.js, trum.js | lục giác khiên `VX.chanKhien` (đã có) |
| FROZEN / MARKED / EXPOSED / WEAKENED / JUDGED / JAMMED / CLAMPED (trên quái/ụ) | skills*.js, trum.js | hiệu ứng ảnh đã có |
| Tên kỹ năng: ORBITAL STRIKE!, COMBO ×n, TIME BURST n, TIME SAVE!, tên hộp Pandora, FREE, ★ PIP n/m, SWARM ×n, SHIELD UP/BROKEN, PRISM n/m, DASH!, SPLIT!, tên chiêu trùm "XXX!", tên chỉ huy bàn máy | skills2–4.js, trum.js, game.js | bỏ (băng cảnh báo trùm giữ nguyên) |
| DESTROYED! (ụ 1★ bị bắn nổ) | game.js | vụ nổ `no_phao` + rung (đã có) |
| "?" trên hộp bí ẩn | growfx.js | bỏ |

**Rút về con số** (khi tắt gợi ý): `+5 BOUNTY` → `+5`, `+20 FORGE` → `+20`, `+10% REPAIR` → `+10%`, `−1★ STOLEN` → `−1★`, `+1★ RETURNED` → `+1★`, `±8% FIRE RATE` → `±8%`, `+1 LIFE · TIME RESTORED` → `+1♥`, online `−2 LIFE` → `−2♥`.

**GIỮ**: số sát thương (thường/chí mạng), số mana `+n`, `−n♥`, `+n★`, `−1★`, `BOSS DOWN!`, `SUDDEN DEATH`, nhãn hệ thống online (`PARTNER LEFT — AI PLAYING`, `PARTNER IS BACK` — qua `ONS.bao`), tấm kết quả ghép (tên + sao, keoghep.js). Chữ biến hình (growfx `chuBien`) và nhãn kỹ năng `nhanU` đã bị tắt từ trước.

## B. Chữ bay DOM trên khay (`TIENUI.bay`) — BỎ

| Chữ | Thay bằng |
|---|---|
| NEED n MORE (chỉ huy thiếu mana) | thẻ chỉ huy lắc (`h2-lac`) + huy hiệu khoá PNG (chihuy-the.js) |
| COOLDOWN / BOARD FULL · ALL 7★ / PAUSED | thẻ lắc + vòng hồi chiêu / thẻ tối |
| BOARD FULL · MERGE TO FREE A SLOT (tvb.js, chạm Triệu hồi khi đầy) | nút Triệu hồi **mờ** (opacity .5, ảnh tắt `h2_trieu_tat`) + lắc nhẹ (hudb.js) |
| RAGE 10s · FULL → +1★ ×n · n NEW · +1★ ×n | bỏ (thanh RAGE trên thẻ + hiệu ứng ★ đã có) |
| Giá chỉ huy `40→80` | **giữ** (là con số) |

## C. Chữ cố định trên nút / HUD — BỎ

| Chữ | Thay bằng |
|---|---|
| BOARD / FULL 2 dòng trên nút Triệu hồi (tvb.js B7) | nút mờ, không chữ |
| BOARD FULL trên thẻ chỉ huy (chihuy-the.js) | thẻ tối (đã có) |
| Summon khi thiếu mana (không chữ cũ) | nút lắc (hud2.js) + **số mana chớp đỏ 1 lần 420 ms** (mới) |
| "Summon & merge turrets!" dưới băng WAVE 1 | bỏ (chỉ "WAVE 1") |
| Mẹo 1 lần "POWER-UP … Tap a card · hold for info." (tien-ui.js `goiY`) | bỏ |
| Mẹo ghép trên ô "Random type, +1★" / "Special merge" / "Tap a glowing turret to merge" (keoghep.js `veMeo`) | bỏ — ô hợp lệ đã có khung cyan E18 |

## D. Dải xem nhanh / tấm mở rộng (quy tắc 6)

| Chữ cũ | Chữ mới (gợi ý tắt) |
|---|---|
| `READY: TAP TO USE` | `READY` |
| `STONE (merge with same-star stone)` | `STONE` |
| `PAUSED · TAP OUTSIDE TO RESUME` (SOLO mở tấm) | `PAUSED` |

Chi tiết đầy đủ vẫn ở trang ụ / bảng thông tin (chạm-mở) — không đổi.

## E. Không đụng

Hướng dẫn lần đầu (huongdan.js), bảng giới thiệu "YOUR 5 TURRETS" đầu trận, băng cảnh báo trùm, HUD wave/đếm ngược, màn kết quả, chữ ở sảnh/bộ bài (Deck full…), chú thích trong demo kỹ năng trang ụ (skilldemo.js — là nội dung giải thích của trang chi tiết, không phải popup trận).

## Kiểm

`NODE_PATH=/opt/npm-tools/node_modules node tools/thap-kt-bopopup.js` (390×844 DPR 3, SOLO/CO-OP/PVP): thả khác loại, thả khác sao, Triệu hồi 0 mana, bàn đầy → không chữ nổi / chữ bay, mana chớp, nút mờ, ghép sai không ghép; bật BATTLE HINTS → "TYPE DIFFERS" hiện lại. Ảnh trong thư mục này (`<chế độ>_khacloai_giu/tha`, `_khacsao_*`, `_trieu_0mana`, `_bandau`, `_xemnhanh`).
