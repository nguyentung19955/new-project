# Chân dung ụ súng mới — "MỘT THIÊN HÀ, NHIỀU CHỦNG TỘC" — QUY CHUẨN

Pha 1 (07/11): đề xuất phong cách + 8 ảnh thử. Chưa nối vào game.
Hướng người dùng chốt (07/11 23:22): GIỮ phong cách anh hùng anime hiện tại làm chuẩn (nhiều ụ vẫn là người),
và mở rộng dàn nhân vật thành **một thiên hà nhiều chủng tộc** (người ngoài hành tinh nhiều loài, người máy, thú nhân,
sinh thể năng lượng, côn trùng, thủy tộc…). Mỗi tộc có nhận diện riêng nhất quán (dáng, da/chất liệu, bảng màu, họa tiết công nghệ),
gán cho ụ có chủ đề hợp. Giữ các sửa lỗi: nền đầy, chủ thể trong vùng an toàn của khung cắt, đạo cụ hợp lý.
**Chuẩn chất lượng:** chân dung Compass Cannon mới đã chốt (`docs/demo-hop-tuong/thap-art/raw_pt_canon.png` — thuyền trưởng hoa tiêu,
áo vàng-navy, vòng la bàn phát sáng + chòm sao sau đầu, nền giàu, mặt rõ trong khung cắt). Ụ người làm giống mức đó; tộc khác cùng độ hoàn thiện.
(Hai hướng trước — "chỉ cỗ máy" và "chỉ robot" — đã bỏ.)

## 1. Chân dung đang được cắt thế nào (đo bằng Playwright trên game hiện tại, 390×844 và 844×390)

| Chỗ hiện | File | Cửa sổ CSS (390×844) | Tỉ lệ | Ghi chú |
|---|---|---|---|---|
| Thẻ kho (Collection) | `pn/pilot_<id>.png` 256 | 59×59 | 1:1 | viền `o_vien_*` đè 8,1 % mỗi cạnh; chip LV trên-trái; thanh "0/2" đè ~22 % đáy |
| Ô bộ bài | `pn/pilot_<id>.png` | 56×56 | 1:1 | như trên |
| Khay trận | `pn/pilot_<id>.png` | 50×50 | 1:1 | viền 8,1 %; chip chồng góc trên-phải; giá ở dưới khung |
| Xem nhanh / bảng chạm | `pilot_<id>.png` 427 | 83×83 / 43×43 | 1:1 | viền 8,1 % |
| Trang ụ (detail) + nền sảnh | `hero/hero_<id>.jpg` 1170×1020 | 390×340 | 39:34 | hiện 1:1, `object-position 50% 0`; 16 % đáy mờ dần; nhãn "TM-xxx" dưới-trái |

844×390: game giữ khung dọc thu nhỏ (ô 27–28 px, trang ụ 195×170) — cùng tỉ lệ, cùng vùng an toàn.
Cắt hiện tại bám MẶT (`PO_NEO`/`HERO_NEO` trong `thap/js/chandung.js`, `FACE_BOX` trong `khung.js`): ô nhỏ phóng để cả đầu ≈ 52 % chiều cao vùng thấy.

## 2. Ảnh gốc DUY NHẤT cho mọi chỗ cắt

- Ảnh gốc: **1536×1024 (3:2 ngang)**, lưu `raw/cd_<id>.png` (riêng canon đã chốt dùng `raw_pt_canon.png` vuông 1254).
- `hero_<id>.jpg` = cắt giữa **1174×1024** (x 11,8–88,2 %) → 1170×1020 (đúng độ phân giải, không phóng).
- `pilot_<id>.png` (427) và `pn/pilot_<id>.png` (256) = cắt **vuông cạnh 46 % chiều cao** (~470 px ≥ 427, không phóng) quanh MẶT: tâm ô = mặt dời xuống 10 % cạnh ô (mặt ở ~40 % chiều cao ô), kẹp trong ảnh. Tọa độ mặt ghi tay cho từng ảnh (`foc` trong `PILOT.json`). Thử 72 % thì mặt quá nhỏ ở ô 50 px — bỏ.
- Pha 2: đặt `PO_NEO[id] = [0, 40, 50, 100]` (cả ảnh vuông coi là "đầu" → không phóng thêm, k = cover) và `HERO_NEO[id] = [0, 40, 50]`; hoặc giữ chú thích mặt thật nếu muốn ô nhỏ zoom mặt.

### Vùng an toàn (% ảnh gốc 1536×1024)

```
 0%             11.8%                                  88.2%            100%
 +---------------+--------------------------------------+---------------+  0%
 | chỉ NỀN       | HERO: nền + phần phụ, hiệu ứng       | chỉ NỀN       |
 | (mất ở trang  |     +--------------------------+     | (mất ở trang  |
 |  ụ, giữ để    |     | Ô VUÔNG x 26–74 %        |     |  ụ)           | 10%
 |  làm banner)  |     |         y 10–82 %        |     |               |
 |               |     |   +------------------+   |     |               | 20%
 |               |     |   | LÕI x 34–66 %    |   |     |               |
 |               |     |   | MẶT ở y 20–50 %  |   |     |               |
 |               |     |   | vai/ngực-huy hiệu|   |     |               | 66%
 |               |     |   +------------------+   |     |               |
 |               |     +--------------------------+     |               | 82%
 |               | dải y 84–100 %: mờ dần ở trang ụ     |               |
 +---------------+--------------------------------------+---------------+ 100%
```

- **LÕI**: mặt + vai mang huy hiệu ụ — phần còn rõ ở ô 50 px sau khi trừ viền 8,1 %, chip LV, thanh đếm.
- **Ô VUÔNG** (vàng trong PILOT.jpg): khoảng mặt ±23 % chiều cao — đầu (cả tóc/sừng/mào) + vai nằm trọn; vì vậy cần ≥ 8 % trời trống trên đỉnh đầu.
- **HERO**: nền, tay, vũ khí, hiệu ứng; không có gì quan trọng ở y > 84 % và góc dưới-trái.

## 3. Tám chủng tộc

| Mã | Tộc | Nhận diện (dáng · da/chất liệu · màu · họa tiết) | Họ ụ hợp |
|---|---|---|---|
| T | **Terran** (người) | anh hùng anime người, đủ sắc tộc/tuổi; quân phục hải quân sao, đồ kỹ sư, viền đồng/vàng | pháo/súng cổ điển, xạ thủ, chỉ huy, ảo thuật/vận may, khiên |
| V | **Voltari** (sinh thể năng lượng) | thân là plasma sống phát sáng lộ qua khe giáp pha lê-kim loại; tóc như bờm năng lượng; mắt sáng không con ngươi; màu theo nguyên tố (xanh-trắng điện, đỏ sấm, vàng mana) | điện, sấm, laser/năng lượng, mana, cộng hưởng |
| C | **Cryon** (xứ băng) | da xanh băng nhạt, sừng/vương miện tinh thể băng, tóc bạc trắng, giáp trắng viền lông khảm pha lê xanh, hơi thở sương | băng, làm chậm, thấu kính/gương/lăng kính |
| A | **Thalassi** (thủy tộc) | tai vây, mang ở cổ, vảy óng xanh ngọc trên má/vai, vân phát quang cyan, giáp san hô-ngọc trai | nước, hải quái, thanh tẩy, ánh sáng, cầu vồng, đa đầu |
| I | **Vespari** (côn trùng) | giáp kitin hổ phách/lục bảo, mắt kép hoặc 4 mắt, râu, hàm nhỏ, cánh trong suốt — thanh lịch, không ghê | độc, tổ đàn, tiến hóa, hút máu, nguyền |
| F | **Ferrin** (thú nhân) | sư tử/sói/cáo… mặt thú biểu cảm, lông, giáp bộ lạc-công nghệ bằng đồng, da, vải | cận chiến, cuồng nộ, rèn, kho báu/mánh lới, thú (sói, cửu vĩ, rồng) |
| S | **Synthari** (người máy) | thân tổng hợp trắng sứ + thép xám, khớp lộ, visor/mắt LED, mặt nạ biểu cảm | drone, nhân bản, sao chép, kỹ thuật, rối |
| N | **Nyx** (sinh ra từ hư không) | da chàm chứa trời sao sống, mắt trắng-tím, vòng hào quang lơ lửng, áo giáp vải tinh vân | hố đen, thời gian, dịch chuyển, sao, nhật thực, định mệnh |

Quy tắc chung: một nhân vật, nửa người (waist-up), mặt anime đẹp chi tiết, thần thái rõ; hình dạng/màu/huy hiệu của ụ (`raw_mod_<id>.png`)
nằm trên giáp, vũ khí hoặc đạo cụ; đạo cụ nguyên vẹn, cầm hợp lý (không búa gãy, không vật lơ lửng vô lý).
Máy quay ngang mắt → hơi thấp, 3/4, ống 50 mm, nhìn về người xem. Cấm: chữ, số, logo, watermark, khung thẻ, viền, UI; cắt đầu/tóc/sừng ở mép.

### Tông theo bậc (ánh sáng viền + điểm nhấn nền)

| Bậc | Ánh sáng viền / điểm nhấn | Cường độ nền |
|---|---|---|
| Trắng | trắng bạc + xanh nhạt, ánh ngày lạnh | yên, ít hạt |
| Xanh | xanh cobalt, ánh neon xanh | vừa |
| Tím | tím/hồng ma thuật, hạt lấp lánh | vừa-mạnh |
| Vàng | vàng kim ấm, tia thần thánh, lens flare | mạnh, hoành tráng |
| Đỏ | đỏ thẫm + đen, sét/lửa, tia vàng nhỏ | dữ dội nhất |

### Nền theo họ (gợi ý)

pháo/tấn công: pháo đài, chiến trường, đài quan sát · băng: đồng băng, hang pha lê · điện/năng lượng: phòng cao áp, mây giông ·
vũ trụ/thời gian: tinh vân, đĩa bồi tụ · hỗ trợ/ghép/bí ẩn: xưởng rèn, kho báu, sân khấu phép · thủy: rạn san hô, biển sâu · côn trùng: tổ hổ phách, rừng nấm phát quang.

## 4. Mẫu prompt (ChatGPT, đính kèm `raw_mod_<id>.png`)

```
Use the attached turret sprite sheet only as the DESIGN REFERENCE (shapes, colors, emblem details) — do not copy the sheet layout or show the sheet.
Create ONE premium anime gacha hero card illustration, LANDSCAPE 3:2 (1536x1024), for the turret "<NAME>" (<TIER> rarity, <ROLE>). The game's heroes come from one galaxy with many races.
Race of this hero — <RACE BLOCK, verbatim from the list below>
Character: <WHO + how the turret parts appear on armor/weapon/gear>. The turret's recognizable shapes, colors and emblem details from the reference must appear clearly on the character's armor, weapon or gear. Props must be whole and logical (no broken or floating tools). Strong personality through expression and pose.
Skill to suggest visually: <SKILL VISUAL>
Composition (strict): waist-up portrait of one character, centered; the FACE sits in the middle third of the width, between 20% and 50% of image height; head and shoulders fit inside the central 48% of the width; clear margin above the head (hair/horns/crest fully inside the frame, at least 8% empty above the highest point); the character stays between 8% and 84% of the height; nothing important near any edge or in the bottom 16%; the left and right thirds are background only (effects may extend there).
Camera: eye level to slightly low 3/4 view, 50mm lens, character facing the viewer.
Background: rich and full, never flat black or empty: <BACKGROUND>, with depth, atmospheric light and particles.
Tier lighting: <TIER LIGHT>
Style: high-end anime gacha hero card art (like a premium mobile RPG), detailed beautiful face, clean confident ink lines, cel shading with soft gradients, glossy metal, saturated colors, cinematic rim light.
No text, no letters, no numbers, no logos, no watermark, no card frame, no border, no UI.
```

RACE BLOCK (chép nguyên văn):
- T: `TERRAN (human): an anime human hero; sci-fi star-navy / engineer outfits with brass and gold trims.`
- V: `VOLTARI (energy beings): a humanoid whose body is living glowing plasma, visible through cracks between sleek crystal-metal armor plates; hair like a flowing mane of energy; pupil-less glowing eyes; luminous slightly translucent skin; the energy color follows its element.`
- C: `CRYON (cold-world race): humanoid with pale ice-blue skin, frost-crystal horns or crown growing from the head, silver-white hair, white fur-trimmed armor with blue crystal inlays, faint frosty breath.`
- A: `THALASSI (aquatic race): humanoid with fin-like ears, gill lines on the neck, iridescent teal scales on cheeks and shoulders, glowing cyan bioluminescent markings, coral-and-pearl armor.`
- I: `VESPARI (insectoid race): elegant humanoid with amber/emerald chitin exoskeleton plates, large faceted compound eyes (or four eyes), antennae, small mandible accents, translucent wings — beautiful, not gross.`
- F: `FERRIN (beast-folk): an anthropomorphic animal hero (lion, wolf or fox) with expressive animal face and fur, wearing tribal-tech armor of brass, leather and cloth.`
- S: `SYNTHARI (androids): a sleek synthetic humanoid with porcelain-white and gunmetal body panels, visible mechanical joints, glowing LED eyes or visor, an expressive face plate.`
- N: `NYX (void-born): humanoid with dark indigo skin that contains a living starfield, glowing white-violet eyes, floating halo rings, flowing robes and armor made of nebula fabric.`

Lưu ý quy trình ChatGPT: mỗi ảnh 1 cuộc chat mới; XOÁ ô soạn trước khi dán (ChatGPT giữ bản nháp chung giữa các tab — đã gặp prompt lạ của tab khác lẫn vào).
Prompt đầy đủ 8 ảnh thử: `prompts.json`.

## 5. Kiểm ảnh (bắt buộc trước khi nhận)

1. Mô phỏng cắt (ô 50/59 px có viền 8,1 %, trang ụ 39:34, khay trận) — xem `PILOT.jpg`.
2. Mặt trong LÕI, tóc/sừng/mào không chạm mép trên? Nhận ra tộc + ụ ở ô 50 px? Nền đầy? Không chữ? Đạo cụ hợp lý?
3. Đạt thì giữ `raw/cd_<id>.png`; yếu thì sinh lại (ghi lý do).

## 6. Đề xuất gán tộc cho 93 ụ

★ = ảnh thử pha 1.

| id | Tên | Bậc | Tộc |
|---|---|---|---|
| canon ★ | Compass Cannon | Vàng | Terran (người) |
| xucxac | Dice Gun | Trắng | Terran (người) |
| lien | Gatling | Trắng | Terran (người) |
| phun | Scatter | Trắng | Terran (người) |
| sungluc | Revolver | Trắng | Terran (người) |
| bang ★ | Frost | Trắng | Cryon (xứ băng) |
| doc | Venom | Trắng | Vespari (côn trùng) |
| mana | Mana Core | Trắng | Voltari (năng lượng) |
| tia | Sniper | Trắng | Terran (người) |
| set ★ | Tesla | Trắng | Voltari (năng lượng) |
| maychem | Guillotine | Trắng | Terran (người) |
| phagiap | Armor Breaker | Trắng | Ferrin (thú nhân) ⟳ |
| bua | Hammer | Trắng | Ferrin (thú nhân) ⟳ |
| nam | Iron Fist | Trắng | Ferrin (thú nhân) |
| bomhen | Time Bomb | Trắng | Synthari (người máy) |
| nhanmana | Mana Doubler | Xanh | Vespari (côn trùng) ⟳ |
| kiembang | Ice Blade | Xanh | Ferrin (thú nhân) ⟳ |
| mimic ★ | Mimic | Xanh | Ferrin (thú nhân) |
| chimang | Crit Antenna | Xanh | Vespari (côn trùng) ⟳ |
| dichchuyen | Teleporter | Xanh | Terran (người) ⟳ |
| radar | Radar | Xanh | Terran (người) |
| drone | Drone Bay | Xanh | Synthari (người máy) |
| tron | Fusion Mixer | Xanh | Voltari (năng lượng) |
| nangluong | Energy Cannon | Xanh | Terran (người) ⟳ |
| laser | Laser | Xanh | Synthari (người máy) |
| lanhgia | Chiller | Xanh | Ferrin (thú nhân) ⟳ |
| mortar | Mortar | Xanh | Terran (người) |
| khuech | Amplifier | Xanh | Synthari (người máy) |
| vungdoc | Toxic Pool | Xanh | Vespari (côn trùng) |
| loa | Cooldown Horn | Xanh | Ferrin (thú nhân) |
| hutmana | Mana Leech | Xanh | Thalassi (thủy tộc) ⟳ |
| min | Mine Layer | Xanh | Terran (người) |
| cuongno | Berserker | Tím | Ferrin (thú nhân) |
| baotuyet | Blizzard | Tím | Cryon (xứ băng) ⟳ |
| nhanban | Cloner | Tím | Synthari (người máy) |
| lienket | Chain Link | Tím | Voltari (năng lượng) |
| kepha | Jammer | Tím | Synthari (người máy) |
| taylo | Cleanser | Tím | Thalassi (thủy tộc) |
| khien | Shield Gen | Tím | Terran (người) |
| hopbi ★ | Mystery Box | Tím | Terran (người) |
| nangsao | Star Lift | Tím | Synthari (người máy) ⟳ |
| tuthan | Reaper Pillar | Tím | Nyx (hư không) ⟳ |
| xaotron | Scrambler | Tím | Ferrin (thú nhân) ⟳ |
| epxung | Overclock | Tím | Synthari (người máy) ⟳ |
| no5 | Fifth Shot | Tím | Terran (người) |
| bao | Storm Gun | Tím | Ferrin (thú nhân) ⟳ |
| anhsang | Lighthouse | Tím | Terran (người) ⟳ |
| aten | Purifier | Vàng | Voltari (năng lượng) ⟳ |
| dongbo | Sync Cannon | Vàng | Terran (người) |
| railgun | Railgun | Vàng | Terran (người) |
| vughep | Merge King | Vàng | Terran (người) ⟳ |
| sinhdoi | Twin Maker | Vàng | Thalassi (thủy tộc) ⟳ |
| hasao | Star Breaker | Vàng | Nyx (hư không) ⟳ |
| saochep | Copycat | Vàng | Ferrin (thú nhân) ⟳ |
| ngoisao | Star Cannon | Vàng | Ferrin (thú nhân) ⟳ |
| soi | Werewolf | Vàng | Ferrin (thú nhân) |
| tienhoa | Evolver | Vàng | Vespari (côn trùng) |
| cauvong | Rainbow | Vàng | Thalassi (thủy tộc) |
| wallgen | Wall Projector | Vàng | Synthari (người máy) |
| orbital | Orbital | Vàng | Terran (người) ⟳ |
| blackhole ★ | Black Hole | Đỏ | Nyx (hư không) |
| overlord ★ | Overlord | Đỏ | Voltari (năng lượng) |
| lophanung | Cryo Reactor | Đỏ | Cryon (xứ băng) |
| haoquang | Holy Halo | Đỏ | Terran (người) |
| nayda | Ricochet | Tím | Terran (người) |
| combo | Combo Core | Tím | Ferrin (thú nhân) ⟳ |
| khoathoigian | Chrono Lock | Tím | Synthari (người máy) ⟳ |
| hydra | Hydra | Vàng | Thalassi (thủy tộc) |
| cuuvi | Nine-Tail | Vàng | Ferrin (thú nhân) |
| pandora | Pandora Vault | Vàng | Vespari (côn trùng) ⟳ |
| luoicheo | Resonance Grid | Vàng | Voltari (năng lượng) |
| ngaithoigian | Chrono Throne | Đỏ | Terran (người) ⟳ |
| nemesis | Nemesis | Vàng | Nyx (hư không) |
| docton | Lone Ace | Tím | Terran (người) ⟳ |
| thaukinh | Focus Lens | Tím | Terran (người) ⟳ |
| nhieusong | Signal Jammer | Tím | Synthari (người máy) ⟳ |
| santhuong | Bounty Beacon | Tím | Terran (người) |
| nhatthuc | Eclipse | Vàng | Nyx (hư không) ⟳ |
| loren | Scrap Forge | Vàng | Ferrin (thú nhân) |
| guongcong | Mirror Gate | Vàng | Cryon (xứ băng) |
| marionette | Marionette | Vàng | Synthari (người máy) ⟳ |
| chuato | Hive Queen | Đỏ | Vespari (côn trùng) |
| leviathan | Leviathan | Đỏ | Thalassi (thủy tộc) |
| khoisinh | Genesis Core | Đỏ | Voltari (năng lượng) ⟳ |
| ronglua | Wyrm Engine | Đỏ | Ferrin (thú nhân) |
| lualien | Ember Relay | Vàng | Voltari (năng lượng) |
| hopca | Quantum Choir | Vàng | Thalassi (thủy tộc) ⟳ |
| luutru | Fusion Archive | Vàng | Synthari (người máy) |
| xuonganh ★ | Hero Foundry | Vàng | Ferrin (thú nhân) |
| mauhut | Blood Circuit | Vàng | Vespari (côn trùng) ⟳ |
| nguyenrua | Hex Saboteur | Vàng | Vespari (côn trùng) |
| thanhdia | Sanctum | Vàng | Terran (người) ⟳ |
| bienmau | Prism Thief | Vàng | Cryon (xứ băng) |

Đếm: Terran (người) 23, Voltari (năng lượng) 13, Nyx (hư không) 12, Ferrin (thú nhân) 11, Synthari (người máy) 11, Cryon (xứ băng) 8, Thalassi (thủy tộc) 8, Vespari (côn trùng) 7

## 7. Kết quả 8 ảnh thử (pha 1) — `PILOT.jpg`

| id | Tộc | File | Nhận xét |
|---|---|---|---|
| canon | Terran | `thap-art/raw_pt_canon.png` (đã chốt, giữ nguyên) | chuẩn chất lượng |
| overlord | Voltari | `raw/cd_overlord_v2.png` (v1 `cd_overlord.png` sát mép trên) | v2 đủ trời trên sừng; đỏ-trên-đỏ hơi khó đọc ở ô 50 px |
| xuonganh | Ferrin (sư tử) | `raw/cd_xuonganh.png` | đẹp, không búa, ô anh hùng lục giác rõ |
| bang | Cryon | `raw/cd_bang.png` | đẹp, mặt rõ |
| set | Voltari | `raw/cd_set_v2.png` (v1 `cd_set.png` mặt lệch, tóc chạm mép) | v2 giữa khung, đủ trời trên tóc |
| blackhole | Nyx | `raw/cd_blackhole.png` | đẹp |
| mimic | Ferrin (cáo) + rương mimic | `raw/cd_mimic.png` | đẹp, đạo cụ hợp lý |
| hopbi | Terran | `raw/cd_hopbi.png` | đẹp |


## 8. Đa dạng hoá (08/11)

⟳ = 36 ụ vẽ lại để khỏi na ná nhau (đổi tộc/tuổi/dáng/tóc-mũ/màu chủ đạo). Rà soát + lý do: `TRUNG-NHAU.md`; prompt: `prompts-da-dang.json`; trước/sau: `TRUOC-SAU-da-dang.jpg`; bảng tổng mới: `TONG-94.jpg`.
