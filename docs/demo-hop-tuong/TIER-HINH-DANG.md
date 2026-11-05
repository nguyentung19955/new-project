# TURRET MERGE — HÌNH DÁNG ĐẦU Ụ THEO BẬC (art direction)

Người dùng 05/11: *"các ụ có chức năng tương tự nhưng tối ưu hơn theo tier, kiểu băng thì băng trắng chỉ làm chậm, băng xanh thì lan làm chậm, băng đỏ thì nổ… thì hình dáng có nên theo kiểu trắng đơn giản → xanh thêm chi tiết → … → đỏ chi tiết kiểu bùng nổ wow"* → **CÓ.** Tài liệu này là luật vẽ để cả "nấc thang" của 1 họ nhìn là biết cùng họ, và bậc càng cao nhìn càng "đã".

Liên quan: họ kỹ năng trong code `thap/js/phattrien.js` (`HO`), hiệu ứng leo thang theo bậc `thap/js/tiervfx.js`, ụ mới lấp chỗ trống `TUONG-MOI-20.md`.
Ảnh kiểm tra: `tuvan/family_sheet.png` (64 đầu ụ trên bệ chung, xếp theo HỌ × BẬC), `tuvan/tier_vfx_energy.png` (hiệu ứng trúng đòn 5 bậc của họ Energy).

---

## 1. Luật chung (áp cho mọi họ)

| Bậc | Độ phức tạp đầu ụ | Được dùng | KHÔNG được dùng |
|---|---|---|---|
| **TRẮNG** | Đơn giản, sạch: thân tròn + 1 nòng + 1 biểu tượng họ ở tâm. ≤ 4 khối chính | Kim loại xám + **1 màu nhấn** của họ, bóng đổ cel đơn giản | Lõi phát sáng, viền vàng, cánh/sừng, hạt bay |
| **XANH** | + **tấm giáp / chi tiết cơ khí** (ốc, rãnh, ống, tấm ốp), nòng dài/dày hơn 1 chút | Thép xanh lam + màu họ, đèn LED nhỏ | Viền vàng, lõi sáng lớn, cánh |
| **TÍM** | + **bộ phận năng lượng**: lõi phát sáng, vòng năng lượng, cuộn dây, tinh thể | Tím/đen + màu họ, glow vừa phải ở lõi | Viền vàng chạm khắc, sừng |
| **VÀNG** | + **viền vàng chạm khắc**, vương miện / cánh nhỏ / huy hiệu, đối xứng trang trọng | Vàng kim + màu họ, đá quý | Hình đen-đỏ dữ dằn (để dành cho Đỏ) |
| **ĐỎ** | **WOW**: sừng, lửa/năng lượng tràn, bộ phận lơ lửng, hình bóng (silhouette) mạnh, lõi rực | Đen-đỏ + vàng + màu họ rực | Rối mắt mất hình tròn; vẫn phải đọc rõ ở 40 px |

Luật hình học (giữ như cũ): nhìn **thẳng từ trên xuống**, thân là **hình tròn chuẩn** (không oval), đặt **giữa ô**, nòng **chĩa sang phải**, nền **magenta #FF00FF** phẳng, không chữ, không bệ, **không dùng hồng/magenta trên vật thể** (bị xoá khi tách nền).

Kiểm tra nhanh 1 họ: đặt các đầu cạnh nhau từ Trắng → Đỏ. (1) Cùng **mô-típ** (biểu tượng tâm + kiểu nòng + màu họ) → đọc ra cùng họ. (2) Mỗi bậc **thêm** đúng 1 lớp chi tiết của bảng trên. (3) Không có ụ bậc thấp nào lộng lẫy hơn ụ bậc cao cùng họ.

## 2. Mô-típ chung của từng họ (giữ qua mọi bậc)

| Họ | Màu họ | Mô-típ phải lặp lại | Nấc thang hiện có (Trắng › Xanh › Tím › Vàng › Đỏ) |
|---|---|---|---|
| FROST | băng xanh `#7fdcff` | bông tuyết ở tâm + nòng tinh thể băng | Frost › Ice Blade / Chiller › Blizzard › *(trống: Eclipse)* › Cryo Reactor |
| POISON | xanh lá `#9dff5a` | ký hiệu sinh học ☣ / bình độc xanh lá | Venom › Toxic Pool › *(trống)* › Purifier › *(trống)* |
| EXPLOSIVE | cam `#ff8a3a` | nòng pháo tròn to, vỏ đạn cam | Cannon / Dice Gun › Mortar › Fifth Shot › Orbital › *(trống: Wyrm Engine)* |
| ENERGY | lục lam điện `#9ffcff` | cuộn dây / vòng dẫn điện + mũi phóng | Tesla › Laser › Storm Gun › Railgun › Overlord *(đủ 5 bậc)* |
| HEAVY SHOT | xanh thép `#6fc8ff` | 1 nòng dài nặng, ống ngắm | Revolver / Sniper › Energy Cannon › *(Lone Ace)* › *(Nemesis)* › *(Leviathan)* |
| RAPID FIRE | cam vàng `#ffb43a` | nòng chùm / nhiều nòng nhỏ | Gatling / Scatter › Radar › Overclock › *(Hydra)* › *(trống)* |
| CRIT | đỏ hồng `#ff5a64` | tâm ngắm chữ thập / móng vuốt | Hammer / Iron Fist › Crit Antenna › Berserker › Werewolf › *(trống)* |
| DAMAGE AMP | vàng chanh `#ffe46b` | loa / vòng khuếch đại, mắt xích | Armor Breaker › Amplifier › Chain Link › Sync Cannon / Rainbow › *(trống)* |
| PATH TRAPS | cam đất `#ffb35a` | bom / mìn / máy chiếu xuống đường | Time Bomb › Mine Layer › *(Chrono Lock)* › Wall Projector › Black Hole |
| EXECUTE | đỏ máu `#ff4b3e` | lưỡi chém / đầu lâu | Guillotine › *(trống)* › Reaper Pillar › *(Nemesis)* › *(trống)* |
| MANA | tím nhạt `#d9a8ff` | tinh thể mana | Mana Core › Mana Leech / Mana Doubler › *(Bounty Beacon)* › *(trống)* › *(trống)* |
| MERGE BONUS | kem sáng `#fff6c0` | khoang phóng / chuông / ngọn hải đăng | *(trống)* › Drone Bay / Cooldown Horn › Cloner / Lighthouse › Twin Maker › *(Hive Queen)* |
| STAR | vàng sao `#ffd23f` | ngôi sao 4–5 cánh | *(trống)* › *(trống)* › Star Lift › Merge King / Star Breaker / Star Cannon › *(Genesis Core)* |
| JOKER | hồng tím `#ff6ad5`* | khối lập phương / quân bài / gương | *(trống)* › Mimic / Fusion Mixer / Teleporter › Scrambler › Copycat › *(trống)* |
| GUARD | xanh khiên `#9fe6ff` | khiên lục giác / vầng hào quang | *(trống)* › *(trống)* › Shield Gen / Cleanser / Jammer › *(Mirror Gate)* › Holy Halo |
| TRANSFORM | tím `#c77dff` | hộp / kén có dấu ? | *(trống)* › *(trống)* › Mystery Box › Evolver › *(trống)* |

\* Màu họ JOKER chỉ dùng cho hiệu ứng trong game; trên **đầu ụ** dùng cầu vồng/tím thay hồng-magenta (luật tách nền).

## 3. Kiểm tra 64 đầu hiện có — đầu PHÁ LUẬT cần vẽ lại (12)

Xem `tuvan/family_sheet.png`. Phần lớn đúng luật (đặc biệt bậc Đỏ và họ Energy). 12 đầu dưới đây sai 1 trong 3 điểm kiểm tra:

| # | id | Ụ (bậc) | Lỗi | Hướng sửa |
|---|---|---|---|---|
| 1 | `mana` | Mana Core (Trắng) | Ụ trắng nhưng **lộng lẫy nhất họ**: viên ngọc tím phát sáng to, vây nhọn — hơn cả Mana Leech/Doubler bậc Xanh | Đơn giản hoá: thân xám, 1 viên tinh thể nhỏ không glow |
| 2 | `phagiap` | Armor Breaker (Trắng) | Có **lõi tím phát sáng** (đặc quyền bậc Tím) | Thân xám + mũi khoan/chày phá giáp màu vàng chanh, không glow |
| 3 | `bomhen` | Time Bomb (Trắng) | Thân **tím** → đọc nhầm thành bậc Tím, lệch màu họ Bẫy | Thân xám + bom đen + đồng hồ, nhấn cam đất |
| 4 | `mimic` | Mimic (Xanh) | **Hoa mỹ hơn ụ Vàng cùng họ** (Copycat) + có hồng/magenta | Bớt: khối lập phương cầu vồng nhỏ hơn, thân thép xanh, không hồng |
| 5 | `mortar` | Mortar (Xanh) | Màu **tím** → đọc như bậc Tím; mất mô-típ cam của họ Explosive | Thép xanh lam + vỏ đạn cam, tấm giáp + bu-lông |
| 6 | `vungdoc` | Toxic Pool (Xanh) | Bình **vàng-cam** → không đọc ra họ Poison | Bình độc **xanh lá** + ống dẫn, ký hiệu ☣ nhỏ |
| 7 | `loa` | Cooldown Horn (Xanh) | **Viền vàng** chạm khắc (đặc quyền bậc Vàng) | Loa thép xanh, đèn LED xanh, không vàng |
| 8 | `drone` | Drone Bay (Xanh) | **Viền vàng** dày (đặc quyền bậc Vàng) | Khoang drone thép xanh + tấm ốp, cánh quạt nhỏ |
| 9 | `baotuyet` | Blizzard (Tím) | Đơn giản ngang/kém **Frost (Trắng)** — thiếu bộ phận năng lượng | Lõi bông tuyết phát sáng tím-băng + vòng năng lượng + 3 tinh thể băng lơ lửng quanh viền |
| 10 | `bao` | Storm Gun (Tím) | Xám bạc trơn, **kém nổi hơn Laser (Xanh)**; thiếu mô-típ cuộn dây họ Energy | Cuộn dây điện + lõi sét phát sáng lục lam, cánh tản nhiệt tím |
| 11 | `aten` | Purifier (Vàng) | Đẹp nhưng **mất mô-típ họ Poison** (chỉ là mặt trời vàng) | Giữ mặt trời vàng chạm khắc, thêm lõi/ống độc xanh lá đang "thanh tẩy" |
| 12 | `saochep` | Copycat (Vàng) | **Đơn giản hơn Mimic (Xanh)** cùng họ | Viền vàng chạm khắc + 2 cánh gương + vương miện nhỏ, lõi lăng kính |

Ghi chú: Gatling/Tesla (Trắng) hơi nhiều chi tiết nhưng vẫn không có glow lớn/viền vàng → giữ. Bậc Đỏ (Cryo Reactor, Overlord, Black Hole, Holy Halo) đều đạt "wow".

## 4. Prompt ChatGPT vẽ lại (2 sheet, lưới 4×2)

Đính kèm ảnh mẫu khi dán: `thap-art/raw_fix8_heads.png` (phong cách chung) và `tuvan/family_sheet.png` (để ChatGPT thấy anh em cùng họ). Nhận ảnh → cắt lưới → tách nền magenta → ghi đè `thap-art/<id>_nong.png` + `thap/assets/<id>_nong.png` (quy trình cũ, chạy lại `tools/thap-co-dau.py` để cập nhật `HEAD_K`).

### Sheet R1 — 8 đầu
```text
Turret head sprite sheet, same style as the attached reference sheet: chunky cartoon mobile-game hard-surface, thick dark outline, clean cel shading. Strict TOP-DOWN view. Each head is a PERFECT CIRCLE body centered in its cell, barrel/emitter pointing RIGHT. 4x2 grid of equal square cells, generous spacing, flat pure magenta #FF00FF background, no shadow, no text, no base/pedestal, no pink or magenta on the objects.
Tier rules: COMMON = simple clean gunmetal grey, one accent color, no glow, no gold. RARE = steel-blue armor panels, bolts and pipes, small LEDs, no gold trim. EPIC = adds a glowing energy core / rings / crystals.
Row 1: 1 Mana Core (COMMON): plain grey round body with ONE small violet crystal in the center, no glow, short stubby emitter right. 2 Armor Breaker (COMMON): grey body, short drill-spike barrel, lemon-yellow #ffe46b accent stripes, no glowing core. 3 Time Bomb (COMMON): grey body, a black round bomb with a small dial clock mounted on top, short launcher right, earthy orange #ffb35a accents. 4 Mimic (RARE): steel-blue armored ring holding a SMALL rainbow cube core, simple panels, no pink.
Row 2: 5 Mortar (RARE): steel-blue armored body with bolted panels, one wide short mortar tube right, orange shell visible in the tube. 6 Toxic Pool (RARE): steel-blue body with two GREEN poison canisters and pipes, small biohazard sign, nozzle right dripping green. 7 Cooldown Horn (RARE): steel-blue horn speaker pointing right, blue LED ring, NO gold. 8 Drone Bay (RARE): steel-blue hangar disk with a small quadcopter drone docked on top, launch rail right, NO gold.
```

### Sheet R2 — 4 đầu (+4 ô dự phòng: vẽ lại bản cũ để so)
```text
Same style and rules as the previous turret head sheet (strict top-down, perfect circle body centered, barrel right, flat pure magenta #FF00FF background, no text, no pink/magenta on objects). EPIC = glowing energy core, rings, floating crystals. LEGENDARY = ornate engraved gold filigree trim, small crown or wings, gemstones, symmetric and regal.
Row 1: 1 Blizzard (EPIC): glowing ice-blue snowflake core inside a violet energy ring, three floating ice crystals orbiting the rim, crystal fan barrel right. 2 Storm Gun (EPIC): copper coil rings around a glowing cyan lightning core, violet heat-sink fins, slim spark-tip barrel right. 3 Purifier (LEGENDARY): ornate gold sun disk with engraved rays, a glowing GREEN toxic core in the middle being purified, gold barrel right with green vents. 4 Copycat (LEGENDARY): ornate gold filigree ring, two small mirror wings, tiny crown at the back, glowing prism core, crystal barrel right.
Row 2: 5–8 leave empty (flat magenta).
```

## 5. Hiệu ứng theo bậc trong code (đã làm, không cần ảnh mới)
`thap/js/tiervfx.js` — cùng 1 đòn đánh, bậc càng cao càng giàu hiệu ứng, có trần để không rối: Trắng = hiệu ứng gốc sạch · Xanh = + hạt phụ nhỏ màu họ · Tím = + vòng tròn mảnh · Vàng = + vệt sáng theo đạn, tia lửa, quầng nhỏ · Đỏ = nổ nhiều lớp, 2 vòng, than hồng đọng lại, chớp màn ≤0.08 (tối đa 1 lần/1.6 s toàn màn), rung ngắn (tối đa 1 lần/0.8 s). Mỗi ụ bị giới hạn tần suất (0.12–0.9 s) nên ụ bắn nhanh không làm rối màn.
