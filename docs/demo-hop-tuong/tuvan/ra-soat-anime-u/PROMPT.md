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
- vang2 (2 hàng, bệ vàng): Twin Maker (2 quả cầu âm dương nối vòng vô cực) · Copycat (gương sao chép khung vàng)

## Tấm BIẾN HÌNH (1 ụ / tấm): `raw_anime_u_dang_<id>.png`
Kèm ảnh `refd_<id>` (icon hiện tại + 3 đầu dạng CŨ `_s1.._s3_v1` làm ý tưởng). Prompt chung:
"Next: a TRANSFORMATION sheet for ONE turret: <tên>. ONE image 1536x1024, solid flat magenta #FF00FF, 3 rows x 4 columns … Row 1 = STAGE 1, row 2 = STAGE 2, row 3 = STAGE 3: the SAME turret evolving, each stage clearly more powerful, bigger and more ornate … Columns per row: (1) assembled turret top-down pointing UP; (2) the BASE alone … the SAME base in all 3 rows, matching the CURRENT turret's base …; (3) the HEAD alone pointing UP …; (4) a round emblem of that stage. Keep every head compact … (max 85%). Stage ideas: …"
- cuuvi: 3 đuôi lửa cam → 6 đuôi lửa cuộn → 9 đuôi lửa cáo trắng-xanh
- ngoisao: sao pha lê 1 nòng → NOVA sao đôi vệt lấp lánh → SUPERNOVA sao lớn đuôi sao chổi
- luoicheo: lưới vàng lõi teal mờ → HUMMING vòng tia teal 4 góc chéo → RESONANCE lõi rực + gai pha lê chéo + cánh vàng
- soi, hydra, tienhoa: đã gen (soi) / dừng (hydra) / gen (tienhoa) nhưng KHÔNG dùng — 3 ụ này vẽ đầu riêng theo trạng thái trong skills (đầu thường/thức tỉnh, số đầu, trứng theo sao).
- overlord (làm lại 1 lần: lượt đầu cột 3 là trụ đứng không khớp cột 1 → thêm "column 3 must be EXACTLY the turret of column 1 with the base removed"): cụm 4 chóp pha lê đỏ + lõi sét → hồ quang giữa 4 chóp → chóp lớn + cánh vàng + lõi trắng-đỏ
- lophanung: 3 lõi băng → kim băng + sương → vương miện băng + lưới lục giác
- ngaithoigian: mặt đồng hồ + 1 kim → 12 vạch sáng + kim giây → vương miện thời gian nhiều vòng + kim xuyên
- hopbi: hộp quà đóng → nắp hé, mảnh bài tím → bung sáng vàng + hoa giấy
- orbital (làm lại cả hình chính, bệ vàng vuông): vệ tinh cánh gập → anten uplink + vòng quỹ đạo → cánh mở + khoang bom sáng
- dongbo (làm lại cả hình chính, kèm `ref_dongbo_moi` = hàng 2 tấm vang1): 3 bánh răng mờ → vòng teal nối 3 trục → bánh răng thứ 4 + quầng vàng
Quy tắc cắt GIU_CHINH: dạng 2/3 không nhỏ hơn dạng 1 (K ≥ K1 × 1,04^n).
- cuongno: 2 nòng mắt đỏ mờ → RAGE mắt cam + tàn lửa → FRENZY nòng đỏ-trắng, sừng lửa
- lienket: pháo quấn xích → dây xích tím rủ từ nòng → 2 xích xoáy + gai vàng

## Tấm HIỆU ỨNG `raw_anime_u_fx1.png` (2 hàng × 3 cột, kèm `ref_fx1` = icon Sói/Hydra + đầu Hydra)
"EFFECT sprite sheet … Row 1: three parallel curved CLAW SLASH marks, pure WHITE glowing energy (tintable) · circular SHOCKWAVE thin white ring with speed streaks · small white star hit spark. Row 2: HYDRA BODY top-down: round emerald scaled coil, gold rim, jade gem centre · same body AWAKENED · empty."
Cắt: `tools/thap-cat-anime-fx.py` (ảnh tô màu fx_* ép RGB trắng để bỏ ám hồng).

## Tấm HÌNH TỰ DO 11/11 (26 ụ, người dùng tự gen): `raw_anime_u_tudo_t01..t14.png`
Cùng bố cục 4 cột (lắp ráp · bệ · ĐẦU · huy hiệu); t01–t06 mỗi hàng 1 ụ, t07 1 hàng (Sanctum), t08–t14 mỗi tấm 3 dạng của 1 ụ. Cắt: `python3 tools/thap-cat-u-tudo.py [id …]`
(bảng `TAM` / `DANG` trong tool = id từng hàng). KHÁC các tấm trước: **giữ bệ đang có trong game** (không ghi `_de` / `_vien`), đầu không đổi vàng → màu nhấn, khung đầu = 1 ô,
đầu đứng (`skills7.js` `DUNG`). Nền hồng lẫn vào quầng trong mờ: `TACH_HONG` (overlord, luoicheo, lophanung, orbital); vệt tím-hồng hào quang Sanctum: `DOI_HUE` (đổi hue, không làm thủng).

