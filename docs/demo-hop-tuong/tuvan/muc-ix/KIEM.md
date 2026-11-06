# Kiểm mục IX + X 'PHASE P0' — REVIEW-VFX-93-v2-ANIM.txt (06/11)

Review viết từ tài liệu mô tả CŨ → kiểm lại từng mục trên **code + chữ hiện tại** (EN/VI, thẻ CARD LV, thanh soi ụ trong trận, Turret File, chú thích).
Phân loại: **Đúng rồi** · **Chữ sai** · **UI sai** · **Lỗi cơ chế**. Cột "Sau" = việc đã làm trong đợt này.
Kiểm hồi quy: `tools/thap-kt-vfx-p0.js` (trong `thap-kt-hoiquy.js`) — thêm mục 8–13 cho các ca dưới đây.

## IX · P0

| # | Mục review | Code hiện tại | Loại | Sau |
|---|---|---|---|---|
| 1 | Time Bomb: CARD LV '+damage' vô dụng | Thẻ ghi **Weaken +10% → +10.3%** (KY_NANG_CAP.bomhen, nối vào phép nổ thật) — không còn dòng damage | Đúng rồi | — |
| 2 | Scrap Forge: LV '+damage' vô dụng; 'VĨNH VIỄN' sai | Thẻ ghi **Per stack +4% → +4.3%**; chữ EN 'while this Forge stays on the board' | Chữ sai (chỉ ở `assets/roster.json`: EN 'permanent', VI 'vĩnh viễn' — dùng cho ô tìm kiếm) | Sửa roster.json EN + VI |
| 3 | Genesis Core: LV '+damage' | Thẻ ghi **Raise time 100% → 98%** (chu kỳ +1★ ngắn lại) | Đúng rồi | — |
| 4 | Holy Halo + mọi ụ không sát thương | Cả 24 ụ dmg = 0 có dòng kỹ năng thật trên thẻ (Barrier, Freeze, Mark, Recharge, Opens in, Fuse time…), không dòng damage | Đúng rồi (thẻ) · **Chữ sai (mới tìm)**: Turret File ghi 'mỗi lần POWER-UP trong trận +25% base damage' cho cả 10 ụ mà power-up KHÔNG đổi gì | Turret File: 10 ụ đó ghi 'ụ này không gây sát thương nên power-up không đổi gì'; ụ hỗ trợ ghi 'power-up làm kỹ năng mạnh hơn, không phải sát thương' → **Cần bạn quyết #1** |
| 5 | Armor Breaker / Crit Antenna / Reaper: số vượt trần | Mô tả + nhãn SUP đã là số sau trần. **Thanh soi ụ trong trận + bảng thông tin** (`hoTroTT`) vẫn số thô: Crit Antenna 7★ 'Crit +30%' (thật 22%), Armor Breaker 52% (35%), Focus Lens 141% (65%), Rainbow 70% (52%), Amplifier 222% (39%)…; nhãn sai: Sanctum 'Shield', Mirror Gate 'Shield', Cryo 'Shots slow' | UI sai | Số hiện tại = số thật sau trần + 'capped at X%'; nhãn Damage / Control resist / Aura slow (31 ca kẹp) |
| 5b | (mới tìm) Mirror Gate kháng khống chế | Code `HOTRO.khang` kẹp cứng **35%**, chữ lại ghi 52% (lấy trần × bậc vàng) | Chữ sai | `HOTRO.tran('khang')` = 35% → mô tả, nhãn SUP, thanh soi đều 35% |
| 6 | Pandora 7★ 'mỗi lần mở hai phép' | 7★: 'cannot merge again'; mốc 7★: 'Merging two 6★ into 7★ fires 2 effects once' | Đúng rồi | — |
| 7 | Hero Foundry 7★ hiển thị buff bất khả thi | 7★: 'Max 7★: it cannot merge again, so its merge skill no longer fires' | Đúng rồi | — |
| 8 | Evolver mất sao | Luật đã chốt (c8d9e2e): 7★ xịt bị giảm sao → **đếm lại từ đầu**; chữ 7★ + mốc DUD ghi đúng vậy | Đúng rồi (chữ = code) | Ghi chú: mất sao ở **dưới 7★** thì vẫn giữ thời gian đã chờ (chữ không hứa gì khác) → **Cần bạn quyết #3** |
| 9 | Sanctum 5★+: chỉ vẽ 4 link | Trận: chạm/giữ ụ vẽ khung + dây tới **cả 8 ô** (`buff.js veHoTro` dùng `HOTRO.oDich`), nhịp 'ping' cũng 8 ô; Turret File 5★ vẽ 8 ô | Đúng rồi | Kiểm (mục 5 cũ) giữ |

## IX · P1

| # | Mục review | Code hiện tại | Loại | Sau |
|---|---|---|---|---|
| 10 | Frost quái to | 'freezes … 2s (big ×0.6; bosses only 50% slow 0.6s)' | Đúng rồi | — |
| 11 | Mana Core 3★/7★ 6s/5s | Mô tả + nhãn đọc `SKILLS.mana.ky`: 7s / 6s / 5s | Đúng rồi | — |
| 12 | Laser 7★ +crit | Mốc 7★ '+30% damage (the beam never crits)' | Đúng rồi | — |
| 13 | Mine Layer / Hydra / Marionette / Orbital nhịp | Nhịp thật (đã gồm tốc bắn + mốc) | Đúng rồi | — |
| 14 | Radar 7★ +25% vượt trần | Mô tả bị **2 câu chồng nhau**: 'OVERDRIVE every 8s: +7% for 2s (cap 50%): +25% for 2s (up to the 49.5% cap)' | Chữ sai | Một câu: 'OVERDRIVE every 8s: +7% for 2s (fire-rate cap 50%)' (+ bản Việt) |
| 15 | Cryo Reactor tự phát | Mô tả ghi điều kiện tự phát; huy hiệu 'tự phát' PNG | Đúng rồi | — |
| 16 | Holy Halo tự phát | Như trên (boss skill / ụ bị khoá / tim cuối) | Đúng rồi | Thêm kiểm huy hiệu |
| 17 | Hive Queen QUICK BROOD | 'Every ★ adds a drone…' | Đúng rồi | — |
| 18 | Leviathan / Wyrm mốc 5★ vs dạng 4★ | 'From 4★ (DEEP ONE / BLUE WYRM form)…' | Đúng rồi | — |
| 19 | Jammer tên 'Clamp' | Trong game: Jammer. `roster.json` vẫn 'Clamp' | Chữ sai (dữ liệu) | roster.json = Jammer |
| 20 | Blood Circuit 'bất kỳ ụ' | 'any other turret (not another Blood Circuit)' | Đúng rồi | — |
| 21 | Scrambler chỉ PVP | 'PVP shuffles … · CO-OP/SOLO makes loners mergeable' | Đúng rồi | — |
| 22 | Mirror Gate / Scrap Forge vai | Lọc vai trò dùng vai code (đúng). `roster.json` vẫn ghi Mirror Gate 'db', Scrap Forge 'tc' | Chữ sai (dữ liệu) | roster.json: Mirror Gate = ht, Scrap Forge = db |
| 23 | Resonance 'đạn vọng' | 'visual only, no extra damage' | Đúng rồi | — |
| 24 | Nhãn proc CLUSTER/JUDGMENT/… tắt | Đúng luật (không chữ bật lên giữa trận) — dùng icon/hình | Đúng rồi | — |

## IX · P2

| # | Mục review | Code hiện tại | Loại | Sau |
|---|---|---|---|---|
| 25 | Một nguồn sự thật cho tooltip | `thatso.js` (mô tả, SUP) — thanh soi ụ còn công thức riêng | UI sai (phần thanh soi) | Thanh soi dùng cùng trần (mục 5) |
| 26 | Icon trạng thái | Mỗi trạng thái 1 ảnh PNG; ≤ 2 dấu/quái | Đúng rồi | — |
| 27 | Preview 3 dạng | Turret File: nút Stage 1–3 dùng ảnh dạng thật (STAGE_K) | Đúng rồi | — |

## X · PHASE P0

| # | Mục | Code hiện tại | Loại | Sau |
|---|---|---|---|---|
| 28 | Tooltip LV / trần / 7★ ghép | Mục 1–8 | Đúng rồi (+ sửa 4, 5, 14) | — |
| 29 | Icon trạng thái + 12 cảnh báo trùm | Đã có từ các đợt trước | Đúng rồi | — |
| 30 | Vòng skill/nạp/dạng 15 ô không chồng | MỘT VÒNG (0322b21) | Đúng rồi | — |
| 31a | FX = vùng trúng · **Wall Projector** | Vòng nổ = r + 2 (60 ↔ 58); tường vàng nổ 170 px (mép thấy ~81 ↔ 84) | Đúng rồi | — |
| 31b | **Toxic Pool** | Ảnh vũng bầu dục luôn nằm NGANG → đoạn đường dọc (cạnh trái) quái trúng xa hơn mép thấy ~33% | UI sai | Trục dài vũng xoay **dọc đường**; mép = r + 8 (đo ảnh: 51.8 ↔ 52) |
| 31c | **Black Hole** | Tờ P2: mép xoáy thấy = 92% bán kính hút; bản dự phòng: lệnh vẽ đĩa nằm lọt trong chú thích (đĩa không hiện) | UI sai | Cỡ vẽ = r / tỉ lệ ảnh đo (80 ↔ 80); sửa dòng vẽ dự phòng |
| 31d | **Wyrm Engine** | Mũi lửa = tầm (đúng); bề ngang lửa chỉ ~60% nón trúng (nón ±góc/2 + 0.08 rad) | UI sai | Bề ngang lửa ở 70% chiều dài = bề ngang nón trúng (71 ↔ 70) |
| 31e | **Cryo Reactor** | Hào quang: vòng mỗi nhịp = r (đúng). FREEZE: băng lan thấy 91% vùng | UI sai (nhẹ) | Băng lan = vùng r × 1.6 (199 ↔ 200) |
| 32 | Sanctum 8 ô | Mục 9 | Đúng rồi | — |
| 33 | Feedback skill tự phát Cryo / Holy Halo / Chrono | Huy hiệu PNG 'tự phát' 0.9 s ở góc trên-trái ô + câu điều kiện trong mô tả | Đúng rồi | Thêm huy hiệu cho 4 ụ đỏ cũng tự dùng khi để đầy > 6 s (Hive Queen, Leviathan, Genesis, Wyrm) |

Tỉ lệ ảnh đo nằm ở `VUNG_ANH` (data.js); kiểm đo lại ảnh thật mỗi lần chạy → đổi ảnh mà quên cập nhật thì báo đỏ.
Không đổi sát thương / hồi chiêu / cân bằng. Dữ liệu online không đổi (chỉ hình + chữ; thêm `goc` vào vũng độc chỉ để vẽ).

## Tổng
- **Đúng rồi: 25** (1, 3, 6–13, 15–18, 20, 21, 23, 24, 26–30, 31a, 32, 33 — mục 33 có làm thêm huy hiệu cho 4 ụ đỏ)
- **Đã sửa: 8 mục** (2, 4, 5 + 5b, 14, 19, 22, 25, 31 b–e) — chữ/dữ liệu: 2, 4, 5b, 14, 19, 22 · UI: 5/25 (thanh soi ụ), 31b–e (4 FX); không có lỗi cơ chế phải sửa.
- **Cần bạn quyết: 0** — 3 mục đã quyết (xem 'Đã quyết' bên dưới)

## Đã quyết (bạn trả lời 06/11 — đã làm)

### 1. POWER-UP trong trận cho 10 ụ không gây sát thương → kiểu DCDW
Mỗi bước power-up (+1 → MAX = 4 bước, giá như cũ) nâng **chính con số kỹ năng** — cộng sau số cấp thẻ (`KY_NANG_CAP[id].pu`, data.js `knThe`). Bước ≈ 6–10% số gốc (ụ sát thương: +25% ST/bước).

| Ụ | Số kỹ năng | Mỗi bước | MAX (+4) | Ví dụ LV đầu, 1★ |
|---|---|---|---|---|
| Frost | Đóng băng | +0.15 s | +0.6 s | 2 s → 2.6 s |
| Venom | Đánh dấu (quái nhận thêm ST) | +0.75% | +3% | 12% → 15% (vẫn trong trần suy yếu 25%) |
| Time Bomb | Suy yếu | +0.75% | +3% | 10% → 13% (trần 25%) |
| Shield Gen | Hồi khiên | −0.5 s | −2 s | 18 s → 16 s |
| Mystery Box | Mở sau | −2 s | −8 s | 58 s → 50 s |
| Reaper Pillar | Tỉ lệ giết ngay | +6% độ mạnh + **trần** +0.5% điểm | trần +2% | trần 19.5% → 21.5% (vẫn có trần) |
| Evolver | Thời gian đếm | −3% | −12% | 100% → 88% |
| Holy Halo | Kết giới | +0.15 s | +0.6 s | 3 s → 3.6 s |
| Scrap Forge | % mỗi nấc lò | +0.3% | +1.2% | 4% → 5.2% (trần +60%/ụ giữ) |
| Genesis Core | Chu kỳ +1★ | −3% | −12% | 100% → 88% |

Chữ: Turret File 'Each in-battle power-up: Freeze +0.15s (+1 → MAX, no damage)'; bảng thông tin trong trận 'power-up +2: Freeze +0.3s' (chỉ khi đã nâng; số trong mô tả đã gồm). Bot: mọi loại đều đáng nâng → ưu tiên loại đang có trên bàn, cấp thấp trước. Online: B.lv đi theo lệnh nâng → tất định.

### 2. Ụ hỗ trợ chạm trần → CẤP THẺ NỚI TRẦN
Mỗi cấp thẻ trên cấp đầu nới trần của nguồn đó, trải đều tới **+18% trần ở LV15** (mọi bậc; trần cứng ×1.18) — `HOTRO.capLv / tran` (hotro.js), dùng cho cả số thật (apDung, kháng Mirror Gate, làm chậm khi trúng) và chữ.
Ví dụ (LV đầu → LV15): Crit Antenna 22% → 26% · Armor Breaker 35% → 41.3% · Focus Lens 65% → 76.7% · Mirror Gate 35% → 41.3% · Rainbow 52.5% → 62% · Reaper Pillar 19.5% → 23% (+2% nữa khi power-up MAX).
Chữ: thanh soi + bảng thông tin 'cap X% (LV raises it)'; mô tả (Turret File) '+22% (cap · LV raises it)'; hàng CARD LV 'cap 22% → 22.3%'. Nhãn trên bàn giữ gọn (chỉ số). Mốc sao bỏ số trần cứng ('reaches its cap (card LV raises it)').

### 3. Evolver mất sao DƯỚI 7★ → đếm lại từ đầu
Như luật 7★ xịt (c8d9e2e): mọi lần mất sao (5★ → 4★, cháy Octopus, Nightmare, Star Leech…) → bộ đếm về 0 theo sao mới; lên sao giữ thời gian đã chờ. `T.evoSao` (skills2.js) — thuần theo T.sao → online tất định. Chữ: mô tả 'losing a star restarts the countdown' + text.js.

Kiểm hồi quy: `thap-kt-vfx-p0.js` mục 10 / 10b / 10c (power-up đổi số thật cho mọi ụ không sát thương + đúng số chốt; trần nới theo cấp, cứng ×1.18, crit thật tăng) · `thap-kt-matran.js` (Evolver 5★→4★ và 7★ xịt→6★ đếm lại, lên sao giữ) · ngâm `thap-qa-ngam-trang.js` bất biến `evolver-ha-sao`.

## (cũ) Cần bạn quyết — đã trả lời ở trên
1. **POWER-UP trong trận vô tác dụng với 10 ụ** không gây sát thương: Frost, Venom, Time Bomb, Shield Gen, Mystery Box, Reaper Pillar, Evolver, Holy Halo, Scrap Forge, Genesis Core (power-up chỉ nhân sát thương / độ mạnh hỗ trợ). Bot (AI) vẫn mua power-up cho các ụ này.
   - (a) Kiểu DCDW: power-up nâng đúng con số kỹ năng như cấp thẻ (vd Time Bomb Weaken +%, Holy Halo Barrier +s)
   - (b) Khoá / làm mờ nút power-up của các ụ này (và bot không mua)
   - (c) Giữ như nay — **mặc định đang dùng**: chữ nói thật 'power-up không đổi gì'
2. **Ụ hỗ trợ đã chạm trần** (vd Armor Breaker ≥ 4★, Crit Antenna 5★+, Focus Lens 3★+, Mirror Gate 3★+, Rainbow 5★+): lên cấp thẻ / power-up không thêm gì. Mặc định: thanh soi ghi 'capped at X%'. Lựa chọn: cho cấp nâng trần, hoặc đổi phần thừa thành hiệu ứng khác.
3. **Evolver mất sao dưới 7★** (vd 5★ → 4★): hiện giữ thời gian đã chờ (đếm theo sao mới). Luật đã chốt chỉ ghi ca 7★ xịt. Lựa chọn: mọi lần mất sao đều đếm lại từ đầu, hay giữ. Mặc định: giữ (chữ không hứa khác).
