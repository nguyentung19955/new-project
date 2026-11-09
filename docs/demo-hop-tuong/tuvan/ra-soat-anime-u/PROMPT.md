# PROMPT gen ụ anime (ChatGPT, kèm ảnh tham chiếu)

Ảnh tham chiếu mỗi lượt (`/tmp` → upload): trên = tấm mẫu `raw_mod_cobac` + icon canon/mauhut/tienhoa/lualien; dưới = icon CŨ của 2–3 ụ cần vẽ lại (đánh số 1/2/3).

## Lượt đầu (phần chung)
```
Generate ONE image, 1536x1024 landscape. Background: solid flat pure magenta #FF00FF everywhere, no gradient, no text, no labels, no grid lines. Exactly 3 rows x 4 columns of separate objects; each object centered in its own cell with a wide magenta margin, nothing touching or crossing cell borders. These are top-down sprites for a mobile merge tower-defense game, in the anime fantasy-tech "Royal Twilight" style exactly like the STYLE TARGET in the attached image (same quality as the slot machine / compass / heart sprites): thick dark outline, glossy cel shading, ornate champagne-gold frame (#E9CCA0 and rich gold), deep indigo-navy body (#212B50, #10162F), cyan glow accents (#71E4EE), small faceted gems. No grey industrial metal. Each ROW is one turret; the 4 columns are: (1) the full turret assembled, top-down, weapon pointing UP; (2) the BASE platform alone, same size and position as in column 1, with an empty round socket in its middle; (3) the HEAD/weapon alone, same size as in column 1, pointing UP; (4) a small round emblem badge of that turret's theme. All 3 bases the same size (about 70% of the cell), rounded octagon shape with gold rim.
```
Bậc: TRẮNG = "small pearl-white gems as tier accent", bệ bát giác viền vàng. XANH = "base is a ROUND gold platform with a double ring of small sapphire-blue dots and sapphire gems (#4D8CFA)".
Lượt sau (cùng cuộc trò chuyện): "Perfect. Next sheet: same Royal Twilight style and rules (… 3 rows x 4 columns …; never use magenta in the objects)" + mô tả từng hàng.

## Từng hàng đã dùng
- trang1: Dice Gun (xúc xắc ngà chấm vàng trong vỏ pháo ngắn) · Gatling (6 nòng xoay, đai vàng, cuộn năng lượng cyan) · Scatter (phễu loe bắn chì + ổ đạn trống)
- trang2: Revolver (ổ 6 viên + 1 nòng dài khắc vàng) · Frost (bông tuyết pha lê, lõi xanh nhạt) · Venom (vòm kính độc xanh lá, móng vàng giữ)
- trang3: Mana Core (con nhộng vàng giữ cầu mana teal #25D6C0) · Sniper (nòng mảnh dài + ống ngắm thấu kính xanh lá) · Tesla (2 chạc tesla + hồ quang cyan)
- trang4: Guillotine (khung máy chém vàng, lưỡi thép, hồng ngọc) · Armor Breaker (mũi khoan + mặt nghiền lục giác cyan) · Hammer (đầu búa chiến có gai)
- trang5 (2 hàng): Iron Fist (găng giáp nắm đấm, khớp vàng, hồng ngọc) · Time Bomb (bom navy mặt đồng hồ quả quýt, ngòi cháy — cắt tia lửa ngòi khi tách đầu: CAT_TREN)
- xanh1: Ice Blade (kiếm băng chĩa lên, chắn tay vàng) · Mimic (rương mimic 1 mắt, răng nanh, lưỡi) · Crit Antenna (ăng-ten chữ thập 4 hồng ngọc, lõi tâm ngắm cyan)
- xanh2: Teleporter (2 cổng dịch chuyển nối cầu vàng) · Radar (chảo radar, màn quét cyan) · Drone Bay (khoang phóng + drone bom tròn)
- xanh3: Fusion Mixer (lõi lò xoáy 3 màu đỏ/lục/vàng) · Energy Cannon (pháo ngắn + pin mana teal) · Laser (lăng kính thạch anh tím + thấu kính)
- xanh4: Chiller (quạt làm lạnh, tinh thể băng ở vành) · Mortar (ống cối ngắn đai vàng + giá đạn) · Amplifier (chồng 3 chevron tím-xanh)
- xanh5: Toxic Pool (tay đòn vàng + bầu độc sủi) · Cooldown Horn (kèn trận vàng có đồng hồ cát) · Mana Leech (miệng đỉa vòng răng, ánh teal)
- xanh6 (2 hàng): Mine Layer (băng 3 mìn lõi đỏ) · Mana Doubler (2 ngọc mana teal đôi)
TÍM = "PURPLE base: a rounded HEXAGON gold platform with small triangular rune notches and amethyst-violet gems (#A966ED)"; thêm "keep each head compact, about 75% of the base width; no grey industrial metal, no yellow hazard stripes".
- tim1: Berserker (mặt nạ quỷ sừng + 2 nòng) · Blizzard (cầu bão tuyết) · Cloner (khoang nhân bản)
- tim2 (làm lại 1 lần: lượt đầu ra hồng sáng, lệch bệ → gửi kèm `ref_tim_base` = nửa trái tim1, yêu cầu "NO hot pink"): Chain Link · Jammer (kẹp chữ C) · Cleanser (chữ thập bạc hà + cờ lê)
- tim3: Shield Gen (vòm tổ ong cyan) · Mystery Box (hộp quà nơ tím) · Star Lift (bệ nâng mũi tên + sao)
- tim4: Reaper Pillar (cột + lưỡi hái) · Scrambler (hộp xáo 3 ô rune) · Overclock (pin đôi tia sét)
- tim5: Fifth Shot (nỏ + bánh 5 chấm) · Storm Gun (pháo mây bão) · Lighthouse (hải đăng nhỏ)
- tim6: Ricochet (đĩa cưa lục) · Combo Core (lõi xoáy cam) · Chrono Lock (ổ khoá + mặt đồng hồ)
- tim7: Lone Ace (mắt khe tím + nòng mảnh) · Focus Lens (thấu kính ngọc lục bảo) · Signal Jammer (tháp phát sóng)
- vang1: hàng 1 Bounty Beacon (đồng xu tâm ngắm, bệ TÍM) · hàng 2–3 Sync Cannon / Orbital (bệ VÀNG vuông góc vương miện) — 2 hàng sau chưa dùng (sẽ làm bằng tấm biến hình).
VÀNG = "a rounded SQUARE gold platform with small crown-shaped corner ornaments and topaz-gold gems (#FFD65B), dark indigo inside".
