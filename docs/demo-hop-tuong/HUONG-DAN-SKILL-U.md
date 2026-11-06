# HƯỚNG DẪN SKILL CÁC Ụ — TURRET MERGE (bản tiếng Việt)

> Viết theo code hiện tại của game (thư mục `thap/`, nhánh `claude/demo-hop-tuong`, ngày 06/11/2026). Mọi con số lấy từ code, không lấy từ tài liệu cũ. Tên ụ ghi kèm tên tiếng Anh vì trong game đang hiện tên tiếng Anh.

## Nói nhanh về luật chung

- **Độ hiếm (5 bậc):** Thường (trắng) · Hiếm (xanh) · Sử thi (tím) · Huyền thoại (vàng) · Cổ đại (đỏ). Bậc càng cao, chỉ số gốc càng to: Thường ×1 · Hiếm ×1,3 · Sử thi ×1,65 · Huyền thoại ×2,1 · Cổ đại ×2,7.
- **Sao 1★ → 7★:** kéo 2 ụ **cùng loại, cùng sao** vào nhau → ra **một ụ ngẫu nhiên trong bộ bài** với +1★ (Mimic ghép được với mọi ụ cùng sao). Mỗi sao thêm +85% sát thương so với 1★ (4★ ≈ ×3,55 · 7★ ≈ ×6,1). Ở **3★ / 5★ / 7★** ụ đạt **mốc kỹ năng** (ụ bắn thường: 3★ QUICK HANDS +20% tốc bắn · 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi · 7★ APEX +30% sát thương, +10% chí mạng; nhiều ụ có mốc riêng — ghi trong từng mục). Đạt mốc thì có bùng sao vàng + vòng vàng + tiếng.
- **Cấp thẻ LV (ngoài trận):** LV khởi đầu theo độ hiếm: Thường LV1 · Hiếm LV3 · Sử thi LV6 · Huyền thoại LV9 · Cổ đại LV11 → tối đa **LV15**. Lên cấp cần bản sao thẻ + vàng (từ túi thưởng cuối trận). Mỗi cấp cộng % sát thương (Thường +4% · Hiếm +5% · Sử thi +7% · Huyền thoại +10% · Cổ đại +15% mỗi cấp → ở LV15 khoảng **+56–63%**). Nhiều ụ còn được **tăng chính kỹ năng** theo cấp (ví dụ Copycat sao chép 50% → 92%) — ghi ở dòng "Cấp thẻ" của từng ụ.
- **POWER-UP trong trận:** tiêu mana (100 → 200 → 400 → 700) để nâng cả loại ụ đó trong trận này: 4 bước +1/+2/+3/MAX, mỗi bước **+25% sát thương gốc** (tối đa +100%); ụ Hỗ trợ thì +6% độ mạnh buff mỗi bước. Hết trận là mất.
- **Ụ Hỗ trợ** không bắn, chỉ buff 4 ô kề thẳng (trên/dưới/trái/phải — trừ vài ụ có hình riêng), không buff ụ Hỗ trợ khác. Độ mạnh buff theo sao: 1★ ×1 · 3★ ×1,45 · 5★ ×1,9 · 7★ ×2,35. Buff bị **trần chung**: tốc bắn tối đa +45%, sát thương +35%, chí mạng +20%, sát thương chí mạng +50%, làm chậm 35% (trùm 15%), giết ngay 15%; quái "nhận thêm sát thương" từ mọi nguồn cộng lại tối đa 25%.
- **Số trong bảng "Sức mạnh"** là sát thương 1 phát ở cấp thẻ khởi đầu, chưa power-up, chưa buff (đã tính hệ số độ hiếm và mốc sao chung). Chí mạng gốc của mọi ụ là 10%.

**Hiển thị chung trên sân:**
- Ụ có nhịp nạp (Frost, Venom, Mana Core, Wall Projector, Black Hole…) có **vòng nạp sáng quanh bệ**, tô màu riêng của ụ, đầy dần rồi nhấp nháy khi gần đầy.
- Ụ **"grow-up"** (đổi 3 dạng đầu súng: Overlord, Mystery Box, Evolver, Cryo Reactor, Werewolf, Orbital, Berserker, Star Cannon, Chain Link, Sync Cannon và nhiều ụ mới) có **vòng 3 cung** quanh ụ: cung trái → cung phải → cung "vương miện" trên đỉnh, cho biết đang ở dạng nào. Đổi dạng có hoạt ảnh biến hình ~0,6 giây; dạng cuối có hào quang thức tỉnh.
- Ụ Cổ đại có **kỹ năng chủ động** (từ 3★): một **vòng nạp mảnh bên trong chạy theo chiều kim đồng hồ** từ đỉnh; đầy thì nhấp nháy trắng → chạm vào ụ để dùng.
- Hiện code **chưa có** "vòng kỹ năng xanh lá chạy theo kim đồng hồ" chung cho mọi ụ, và **chưa có bom/đồng hồ đếm ngược** trên Evolver trong trận (chỉ có vòng 3 cung + số giây trong bảng thông tin khi chạm). Tài liệu mô tả đúng hình ảnh hiện tại.
- Chữ nổi đang hiện trên sân: FROZEN, MARKED, BLOCKED, số +mana, COMBO ×N… Các nhãn tên kỹ năng nổi trên ụ (như CLUSTER, OVERDRIVE, BINGO) hiện đang **tắt** trong code.

**Số ụ:** 93 ụ — 44 Tấn công · 19 Hỗ trợ · 30 Đặc biệt (vai trò theo code của game).

## Mục lục

- **Thường (trắng)** (15 ụ)
  - Tấn công: [Cannon — Pháo Nổ](#cannon--pháo-nổ--thường--tấn-công) · [Dice Gun — Pháo May Rủi](#dice-gun--pháo-may-rủi--thường--tấn-công) · [Gatling — Liên Thanh](#gatling--liên-thanh--thường--tấn-công) · [Scatter — Súng Phun Loạn](#scatter--súng-phun-loạn--thường--tấn-công) · [Revolver — Súng Lục](#revolver--súng-lục--thường--tấn-công) · [Sniper — Bắn Tỉa](#sniper--bắn-tỉa--thường--tấn-công) · [Tesla — Tesla](#tesla--tesla--thường--tấn-công) · [Guillotine — Máy Chém](#guillotine--máy-chém--thường--tấn-công) · [Iron Fist — Nắm Đấm Sắt](#iron-fist--nắm-đấm-sắt--thường--tấn-công)
  - Hỗ trợ: [Armor Breaker — Phá Giáp](#armor-breaker--phá-giáp--thường--hỗ-trợ) · [Hammer — Búa Đẩy](#hammer--búa-đẩy--thường--hỗ-trợ)
  - Đặc biệt: [Frost — Băng](#frost--băng--thường--đặc-biệt) · [Venom — Độc](#venom--độc--thường--đặc-biệt) · [Mana Core — Máy Mana](#mana-core--máy-mana--thường--đặc-biệt) · [Time Bomb — Bom Hẹn Giờ](#time-bomb--bom-hẹn-giờ--thường--đặc-biệt)
- **Hiếm (xanh)** (17 ụ)
  - Tấn công: [Ice Blade — Kiếm Băng](#ice-blade--kiếm-băng--hiếm--tấn-công) · [Drone Bay — Bệ Phóng Drone](#drone-bay--bệ-phóng-drone--hiếm--tấn-công) · [Energy Cannon — Pháo Năng Lượng](#energy-cannon--pháo-năng-lượng--hiếm--tấn-công) · [Laser — Laser](#laser--laser--hiếm--tấn-công) · [Mortar — Súng Cối](#mortar--súng-cối--hiếm--tấn-công) · [Toxic Pool — Bom Vũng Độc](#toxic-pool--bom-vũng-độc--hiếm--tấn-công) · [Mana Leech — Máy Hút Mana](#mana-leech--máy-hút-mana--hiếm--tấn-công) · [Mine Layer — Bệ Rải Mìn](#mine-layer--bệ-rải-mìn--hiếm--tấn-công)
  - Hỗ trợ: [Crit Antenna — Ăng-ten Chí Mạng](#crit-antenna--ăng-ten-chí-mạng--hiếm--hỗ-trợ) · [Radar — Radar](#radar--radar--hiếm--hỗ-trợ) · [Fusion Mixer — Bộ Trộn](#fusion-mixer--bộ-trộn--hiếm--hỗ-trợ) · [Chiller — Máy Phát Lạnh](#chiller--máy-phát-lạnh--hiếm--hỗ-trợ) · [Amplifier — Bộ Khuếch Đại](#amplifier--bộ-khuếch-đại--hiếm--hỗ-trợ)
  - Đặc biệt: [Mana Doubler — Máy Nhân Mana](#mana-doubler--máy-nhân-mana--hiếm--đặc-biệt) · [Mimic — Mimic](#mimic--mimic--hiếm--đặc-biệt) · [Teleporter — Bệ Dịch Chuyển](#teleporter--bệ-dịch-chuyển--hiếm--đặc-biệt) · [Cooldown Horn — Loa Hồi Chiêu](#cooldown-horn--loa-hồi-chiêu--hiếm--đặc-biệt)
- **Sử thi (tím)** (22 ụ)
  - Tấn công: [Berserker — Súng Cuồng Nộ](#berserker--súng-cuồng-nộ--sử-thi--tấn-công) · [Blizzard — Bão Tuyết](#blizzard--bão-tuyết--sử-thi--tấn-công) · [Chain Link — Chuỗi Liên Kết](#chain-link--chuỗi-liên-kết--sử-thi--tấn-công) · [Fifth Shot — Nỏ Năm Nhịp](#fifth-shot--nỏ-năm-nhịp--sử-thi--tấn-công) · [Storm Gun — Súng Bão](#storm-gun--súng-bão--sử-thi--tấn-công) · [Lighthouse — Tháp Ánh Sáng](#lighthouse--tháp-ánh-sáng--sử-thi--tấn-công) · [Ricochet — Đĩa Nảy](#ricochet--đĩa-nảy--sử-thi--tấn-công) · [Combo Core — Lõi Combo](#combo-core--lõi-combo--sử-thi--tấn-công) · [Lone Ace — Độc Tôn](#lone-ace--độc-tôn--sử-thi--tấn-công)
  - Hỗ trợ: [Cleanser — Máy Tẩy Lỗi](#cleanser--máy-tẩy-lỗi--sử-thi--hỗ-trợ) · [Shield Gen — Máy Khiên](#shield-gen--máy-khiên--sử-thi--hỗ-trợ) · [Star Lift — Bệ Nâng Sao](#star-lift--bệ-nâng-sao--sử-thi--hỗ-trợ) · [Reaper Pillar — Cột Tử Thần](#reaper-pillar--cột-tử-thần--sử-thi--hỗ-trợ) · [Focus Lens — Thấu Kính](#focus-lens--thấu-kính--sử-thi--hỗ-trợ)
  - Đặc biệt: [Cloner — Máy Nhân Bản](#cloner--máy-nhân-bản--sử-thi--đặc-biệt) · [Jammer — Kẹp Phá](#jammer--kẹp-phá--sử-thi--đặc-biệt) · [Mystery Box — Hộp Bí Ẩn](#mystery-box--hộp-bí-ẩn--sử-thi--đặc-biệt) · [Scrambler — Máy Xáo Trộn](#scrambler--máy-xáo-trộn--sử-thi--đặc-biệt) · [Overclock — Bộ Ép Xung](#overclock--bộ-ép-xung--sử-thi--đặc-biệt) · [Chrono Lock — Khoá Thời Gian](#chrono-lock--khoá-thời-gian--sử-thi--đặc-biệt) · [Signal Jammer — Máy Nhiễu Sóng](#signal-jammer--máy-nhiễu-sóng--sử-thi--đặc-biệt) · [Bounty Beacon — Đèn Săn Thưởng](#bounty-beacon--đèn-săn-thưởng--sử-thi--đặc-biệt)
- **Huyền thoại (vàng)** (30 ụ)
  - Tấn công: [Purifier — Pháo Thanh Tẩy](#purifier--pháo-thanh-tẩy--huyền-thoại--tấn-công) · [Railgun — Railgun](#railgun--railgun--huyền-thoại--tấn-công) · [Star Cannon — Pháo Ngôi Sao](#star-cannon--pháo-ngôi-sao--huyền-thoại--tấn-công) · [Werewolf — Sói Máy](#werewolf--sói-máy--huyền-thoại--tấn-công) · [Wall Projector — Máy Dựng Tường](#wall-projector--máy-dựng-tường--huyền-thoại--tấn-công) · [Hydra — Hydra](#hydra--hydra--huyền-thoại--tấn-công) · [Nine-Tail — Cửu Vĩ](#nine-tail--cửu-vĩ--huyền-thoại--tấn-công) · [Nemesis — Nữ Thần Phán Xử](#nemesis--nữ-thần-phán-xử--huyền-thoại--tấn-công) · [Eclipse — Nhật Thực](#eclipse--nhật-thực--huyền-thoại--tấn-công) · [Ember Relay — Lửa Tiếp Sức](#ember-relay--lửa-tiếp-sức--huyền-thoại--tấn-công) *(mới)* · [Quantum Choir — Hợp Xướng Lượng Tử](#quantum-choir--hợp-xướng-lượng-tử--huyền-thoại--tấn-công) *(mới)* · [Fusion Archive — Kho Lưu Hợp Nhất](#fusion-archive--kho-lưu-hợp-nhất--huyền-thoại--tấn-công) *(mới)* · [Prism Thief — Siêu Trộm Lăng Kính](#prism-thief--siêu-trộm-lăng-kính--huyền-thoại--tấn-công) *(mới)*
  - Hỗ trợ: [Sync Cannon — Pháo Đồng Bộ](#sync-cannon--pháo-đồng-bộ--huyền-thoại--hỗ-trợ) · [Star Breaker — Súng Hạ Sao](#star-breaker--súng-hạ-sao--huyền-thoại--hỗ-trợ) · [Rainbow — Máy Cầu Vồng](#rainbow--máy-cầu-vồng--huyền-thoại--hỗ-trợ) · [Resonance Grid — Lưới Cộng Hưởng](#resonance-grid--lưới-cộng-hưởng--huyền-thoại--hỗ-trợ) · [Mirror Gate — Cổng Gương](#mirror-gate--cổng-gương--huyền-thoại--hỗ-trợ) · [Sanctum — Thánh Địa](#sanctum--thánh-địa--huyền-thoại--hỗ-trợ) *(mới)*
  - Đặc biệt: [Merge King — Vua Ghép](#merge-king--vua-ghép--huyền-thoại--đặc-biệt) · [Twin Maker — Máy Sinh Đôi](#twin-maker--máy-sinh-đôi--huyền-thoại--đặc-biệt) · [Copycat — Máy Sao Chép](#copycat--máy-sao-chép--huyền-thoại--đặc-biệt) · [Evolver — Hộp Tiến Hoá](#evolver--hộp-tiến-hoá--huyền-thoại--đặc-biệt) · [Orbital — Vệ Tinh](#orbital--vệ-tinh--huyền-thoại--đặc-biệt) · [Pandora Vault — Hộp Pandora](#pandora-vault--hộp-pandora--huyền-thoại--đặc-biệt) · [Scrap Forge — Lò Rèn Phế Liệu](#scrap-forge--lò-rèn-phế-liệu--huyền-thoại--đặc-biệt) · [Marionette — Rối Máy](#marionette--rối-máy--huyền-thoại--đặc-biệt) · [Hero Foundry — Xưởng Anh Hùng](#hero-foundry--xưởng-anh-hùng--huyền-thoại--đặc-biệt) *(mới)* · [Blood Circuit — Mạch Máu](#blood-circuit--mạch-máu--huyền-thoại--đặc-biệt) *(mới)* · [Hex Saboteur — Kẻ Nguyền](#hex-saboteur--kẻ-nguyền--huyền-thoại--đặc-biệt) *(mới)*
- **Cổ đại (đỏ)** (9 ụ)
  - Tấn công: [Black Hole — Hố Đen](#black-hole--hố-đen--cổ-đại--tấn-công) · [Overlord — Overlord](#overlord--overlord--cổ-đại--tấn-công) · [Hive Queen — Chúa Tổ](#hive-queen--chúa-tổ--cổ-đại--tấn-công) · [Leviathan — Thuỷ Quái](#leviathan--thuỷ-quái--cổ-đại--tấn-công) · [Wyrm Engine — Rồng Máy](#wyrm-engine--rồng-máy--cổ-đại--tấn-công)
  - Hỗ trợ: [Cryo Reactor — Lò Phản Ứng Băng](#cryo-reactor--lò-phản-ứng-băng--cổ-đại--hỗ-trợ)
  - Đặc biệt: [Holy Halo — Hào Quang Thánh](#holy-halo--hào-quang-thánh--cổ-đại--đặc-biệt) · [Chrono Throne — Ngai Thời Gian](#chrono-throne--ngai-thời-gian--cổ-đại--đặc-biệt) · [Genesis Core — Lõi Khởi Sinh](#genesis-core--lõi-khởi-sinh--cổ-đại--đặc-biệt)
- [Chỉ huy](#chỉ-huy-commander--ma-vương) · [Trùm](#trùm-boss) · [Chỗ mô tả lệch code](#chỗ-mô-tả-lệch-code)

---

## Ụ THƯỜNG (TRẮNG)


**— Tấn công —**

### Cannon — Pháo Nổ · Thường · Tấn công
- **Skill:** Bắn chậm vào quái đầu đoàn một quả đạn pháo bay vòng cung, chạm đất thì nổ lan, trúng mọi quái trong vùng nổ. Sao càng cao vùng nổ càng rộng.
- **Trên màn hình thấy gì:** đầu súng giật lùi mạnh, chớp lửa và khói ở nòng; quả đạn pháo có vệt bay theo đường cong; khi chạm: quả cầu nổ cam, vòng sóng cam đúng bằng vùng nổ, tia lửa bắn ra, màn hình rung nhẹ.
- **Khi nào biến đổi / kích hoạt:** bắn tự động khi có quái. Vùng nổ = 28 + 6 px mỗi sao. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 thì nạp lại gần như ngay (bắn đôi); 7★ APEX +30% sát thương, +10% chí mạng. Không đổi dạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương mỗi quả (cả vùng nổ) | 32.7 | 116 | 260 |
  | Tốc bắn (phát/giây) | 0.55 | 0.66 | 0.66 |
  | Bán kính nổ | 34 px | 52 px | 70 px |
  Cấp thẻ: LV1 → LV15: +4% sát thương mỗi cấp, tới +56%.
  Mạnh/yếu: tốt khi quái đi thành đám; chậm, dễ phí đòn khi quái thưa. Hợp với: Radar, Amplifier, Venom.

### Dice Gun — Pháo May Rủi · Thường · Tấn công
- **Skill:** Bắn đạn pháo vào quái đi đầu, mỗi phát "tung xúc xắc" ra sát thương ngẫu nhiên từ 3% đến 300%. Nếu phát đó chí mạng thì luôn ra mức tối đa 300%, không nhân đôi thêm.
- **Trên màn hình thấy gì:** đạn pháo tròn có khói ở nòng. Số sát thương đổi màu theo vận: phát thấp (dưới 40%) số xám, phát cao (từ 240%) số vàng kèm nổ to và tia lửa nhiều hơn, đồng thời trên ô ụ bùng sáng một biểu tượng buff.
- **Khi nào biến đổi / kích hoạt:** mỗi phát đều tung lại. Chí mạng gốc 10% (thêm từ ụ hỗ trợ kề). Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng (chí mạng = 20%).
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương gốc/phát (ụ Thường LV1, chưa power-up) | 16 | 56.8 | 126.9 |
  | Khoảng sát thương thật (3%–300%) | 0.5–48 | 1.7–170 | 3.8–381 |
  | Tốc bắn (phát/giây) | 0.8 | 0.96 | 0.96 |
  Cấp thẻ: LV1 → LV15: sát thương +4% mỗi cấp, tới +56%.
  Mạnh/yếu: trung bình khoảng 150% mỗi phát và rất mạnh khi có nhiều chí mạng, nhưng thất thường, có phát gần như bằng 0. Hợp với: Crit Antenna, Hammer, Focus Lens.

### Gatling — Liên Thanh · Thường · Tấn công
- **Skill:** Xả đạn rất nhanh vào quái đầu đoàn, mỗi viên sát thương nhỏ. Mỗi sao tăng thêm 14% tốc bắn (ngoài sát thương tăng theo sao).
- **Trên màn hình thấy gì:** đầu súng rung giật liên tục, chớp lửa nhỏ ở nòng (thỉnh thoảng có khói), chuỗi đạn sáng nối đuôi nhau như một dòng tia, tia lửa vàng nhỏ ở chỗ trúng.
- **Khi nào biến đổi / kích hoạt:** bắn liên tục khi có quái. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng. Không đổi dạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương mỗi viên | 4.5 | 16 | 35.7 |
  | Tốc bắn (phát/giây) | 4.0 | 6.8 | 8.8 |
  Cấp thẻ: LV1 → LV15: +4% sát thương mỗi cấp, tới +56%.
  Mạnh/yếu: sát thương đều, nhiều phát nên hưởng lợi lớn từ chí mạng và hiệu ứng "mỗi đòn trúng"; một viên rất yếu nên kém với quái giáp/trùm nếu không có buff. Hợp với: Radar, Amplifier, Crit Antenna.

### Scatter — Súng Phun Loạn · Thường · Tấn công
- **Skill:** Bắn liên thanh rất nhanh, mỗi viên nhắm một con quái NGẪU NHIÊN trong tầm, nên đạn rải đều khắp đám quái thay vì dồn vào con đầu. Mỗi sao thêm 8% tốc bắn.
- **Trên màn hình thấy gì:** nòng giật nhẹ liên tục, chớp lửa nòng nhỏ lắc qua lại, đạn liên thanh nhỏ bay tỏa nhiều hướng, mỗi viên trúng tóe 1 tia lửa vàng.
- **Khi nào biến đổi / kích hoạt:** bắn liên tục, không có kỹ năng kích hoạt riêng. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (ụ Thường LV1, chưa power-up) | 3.4 | 12.2 | 27.2 |
  | Tốc bắn (phát/giây) | 5.0 | 7.4 | 8.9 |
  Cấp thẻ: LV1 → LV15: sát thương +4% mỗi cấp, tới +56%.
  Mạnh/yếu: rất nhiều đòn nhỏ, tốt để rải hiệu ứng "khi trúng" lên cả đám; yếu trước trùm vì đạn bị chia ra nhiều con. Hợp với: Chiller, Reaper Pillar, Radar.

### Revolver — Súng Lục · Thường · Tấn công
- **Skill:** Bắn chậm nhưng mỗi phát rất nặng, trúng NGAY LẬP TỨC vào quái đi đầu (không có đạn bay). Tự có thêm 10% chí mạng, tức 20% chí mạng.
- **Trên màn hình thấy gì:** nòng giật mạnh, khói nòng, một vệt tia vàng nhạt nối thẳng từ nòng tới quái rồi mờ đi, tia lửa vàng ở chỗ trúng, vỏ đạn văng ra sau ụ.
- **Khi nào biến đổi / kích hoạt:** bắn đều đặn, không có kỹ năng kích hoạt. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng (lên 30%).
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (ụ Thường LV1, chưa power-up) | 34.5 | 122.5 | 273.6 |
  | Tốc bắn (phát/giây) · chí mạng | 0.6 · 20% | 0.72 · 20% | 0.72 · 30% |
  Cấp thẻ: LV1 → LV15: sát thương +4% mỗi cấp, tới +56%.
  Mạnh/yếu: đòn đơn rất nặng, không trượt, hợp đánh quái trâu; bắn chậm nên dễ phí sát thương vào quái yếu. Hợp với: Amplifier, Crit Antenna, Armor Breaker.

### Sniper — Bắn Tỉa · Thường · Tấn công
- **Skill:** Bắn rất chậm nhưng mỗi phát rất nặng, trúng ngay lập tức. Luôn nhắm quái CÒN NHIỀU MÁU NHẤT (không phải quái đầu). Gây gấp đôi (+100%) sát thương lên quái to và trùm.
- **Trên màn hình thấy gì:** đầu súng giật lùi mạnh, chớp lửa và chút khói ở nòng; một vệt đạn tỉa xanh lam thẳng tắp từ nòng tới quái rồi mờ dần (~0,3 giây); tia lửa xanh nhạt ở chỗ trúng.
- **Khi nào biến đổi / kích hoạt:** bắn tự động. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng. Không đổi dạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương mỗi phát (quái thường) | 69.6 | 247 | 552 |
  | Với quái to / trùm | 139 | 494 | 1104 |
  | Tốc bắn (phát/giây) | 0.35 | 0.42 | 0.42 |
  Cấp thẻ: LV1 → LV15: +4% sát thương mỗi cấp, tới +56%.
  Mạnh/yếu: diệt quái trâu và trùm rất tốt; chậm, không đỡ được đám quái nhỏ đông. Hợp với: Venom, Crit Antenna, Hammer.

### Tesla — Tesla · Thường · Tấn công
- **Skill:** Phóng sét chuỗi vào quái đầu rồi nhảy sang quái gần kề (trong ~120 px). Số quái trúng = số sao. Mỗi lần nhảy sét yếu đi 12%.
- **Trên màn hình thấy gì:** ngay trước khi bắn, đầu súng sáng lên và có quả cầu sáng vàng ở nòng; sau đó là các đoạn sét vàng ngoằn ngoèo nối từ nòng qua từng quái, chớp điện ở mỗi quái bị trúng.
- **Khi nào biến đổi / kích hoạt:** bắn tự động. Lên sao thì sét nối thêm quái. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương quái đầu (mỗi lần nhảy ×0,88) | 18.2 | 64.6 | 144 |
  | Số quái trúng | 1 | 4 | 7 |
  | Tốc bắn (phát/giây) | 0.70 | 0.84 | 0.84 |
  Cấp thẻ: LV1 → LV15: +4% sát thương mỗi cấp, tới +56%.
  Mạnh/yếu: sao cao dọn đám quái sát nhau rất tốt; 1–2★ chỉ như súng thường, quái thưa thì sét không nhảy được. Hợp với: Radar, Venom, Amplifier.

### Guillotine — Máy Chém · Thường · Tấn công
- **Skill:** Bắn quái đi đầu; mỗi phát trúng có một xác suất nhỏ GIẾT NGAY quái nhỏ (không áp cho trùm và quái to). Không chém được thì gây sát thương bình thường.
- **Trên màn hình thấy gì:** đạn tia sáng bay tới quái. Khi chém trúng: một lưỡi sáng rơi từ trên xuống ngay đầu quái, chớp đỏ, nổ và tia lửa đỏ, số sát thương màu đỏ, kèm biểu tượng đầu lâu bùng lên.
- **Khi nào biến đổi / kích hoạt:** mỗi phát đều thử chém. Tỉ lệ chém tăng 0.75% mỗi sao và +0.5% mỗi bước power-up. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (ụ Thường LV1, chưa power-up) | 16.3 | 57.7 | 128.9 |
  | Tỉ lệ giết ngay quái nhỏ mỗi phát | 3.75% | 6.0% | 8.25% |
  | Tốc bắn (phát/giây) | 0.8 | 0.96 | 0.96 |
  Cấp thẻ: LV1 → LV15: tỉ lệ chém gốc 3.75% → 5.85% (7★ thành 10.35%), và sát thương +4% mỗi cấp, tới +56%.
  Mạnh/yếu: dọn quái nhỏ máu dày rất tốt; vô dụng phần chém trước trùm và quái to. Hợp với: Scatter, Gatling, Radar.

### Iron Fist — Nắm Đấm Sắt · Thường · Tấn công
- **Skill:** Đánh gần: chỉ đấm quái đi đầu trong vòng 105 px quanh ụ. Mỗi cú đấm nổ tỏa tròn 36 px, trúng mọi quái trong vòng nổ. Đấm rất nhanh, mỗi sao +6% tốc đánh. Phải đặt sát đường đi.
- **Trên màn hình thấy gì:** đầu ụ thụt tới trước rồi bật về như lò xo, vệt cam ngắn từ nòng tới quái, nổ pháo cam + vòng tròn cam lan ra, bụi văng và màn hình rung nhẹ.
- **Khi nào biến đổi / kích hoạt:** đánh liên tục khi có quái trong tầm 105 px; ngoài tầm thì đứng yên. Mốc chung: 3★ QUICK HANDS +20% tốc đánh; 5★ DOUBLE TAP cứ cú thứ 4 đánh đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/cú (vùng 36 px; ụ Thường LV1, chưa power-up) | 7.5 | 26.6 | 59.5 |
  | Tốc đánh (cú/giây) | 2.4 | 3.4 | 3.9 |
  Cấp thẻ: LV1 → LV15: sát thương +4% mỗi cấp, tới +56%.
  Mạnh/yếu: đánh lan rất khỏe khi quái dồn cục ở gần; ô đặt xa đường thì gần như không đánh. Hợp với: Teleporter (đưa ra mép đường), Hammer, Crit Antenna.


**— Hỗ trợ —**

### Armor Breaker — Phá Giáp · Thường · Hỗ trợ
- **Skill:** Không bắn. Cứ 3 giây làm LỘ ĐIỂM YẾU quái đi đầu và quái còn nhiều máu nhất trong 6 giây. Các ụ Tấn công ở 4 ô kề (trên/dưới/trái/phải) gây thêm sát thương vào quái đang bị lộ.
- **Trên màn hình thấy gì:** vòng nạp tím nhạt quanh bệ đầy dần trong 3 giây; khi kích hoạt bắn tia phép tím tới từng quái, nổ điện nhỏ và chữ nổi "EXPOSED" trên đầu quái. Đầu ụ quay theo quái đang bị lộ. Định kỳ có xung sáng tím ngắn chạy tới các ụ kề đang được buff.
- **Khi nào biến đổi / kích hoạt:** mỗi 3 giây (không đổi theo sao). Mốc: 3★ TUNED AURA (buff ×1.45 so với 1★); 5★ DOUBLE EXPOSE: buff ×1.9 và lộ 3 quái (đầu + 2 con trâu nhất); 7★ SHATTERED GUARD: buff ×2.35 và quái bị lộ nhận thêm 8% sát thương từ MỌI ụ.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Ụ Tấn công kề: thêm sát thương vào quái bị lộ | +22% | +36% (chạm trần 35%) | +52% (bị kẹp ở trần 35%) |
  | Số quái bị lộ mỗi lần | 2 | 2 | 3 (+8% từ mọi ụ) |
  Cấp thẻ: LV1 → LV15: buff gốc 1★ +22% → +30.4% (mỗi sao nhân theo). Power-up: +6% độ mạnh buff mỗi bước.
  Mạnh/yếu: tăng mạnh sát thương lên trùm/quái trâu, có từ 1★; trần sát thương 35% dùng chung với buff sát thương khác nên lên sao cao ít lợi thêm. Hợp với: Revolver, Sniper, Railgun.

### Hammer — Búa Đẩy · Thường · Hỗ trợ
- **Skill:** Không bắn. Ụ Tấn công ở 4 ô kề được thêm tỉ lệ chí mạng và sát thương chí mạng; mỗi lần chúng chí mạng thì quái thường bị CHOÁNG ngắn (mỗi con được miễn choáng 3 giây sau đó; trùm không bị choáng).
- **Trên màn hình thấy gì:** đầu búa quay chậm; định kỳ có xung sáng vàng cam chạy tới các ụ kề được buff. Khi quái bị choáng có một vòng tròn vàng nhỏ loé quanh quái.
- **Khi nào biến đổi / kích hoạt:** buff luôn bật. Mốc: 3★ TUNED AURA (buff ×1.45); 5★ HEAVY HAND: buff ×1.9, sát thương chí mạng chạm trần 50%; 7★ QUAKE: buff ×2.35, choáng 0.35 giây và choáng được cả quái to (trừ trùm).
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Ụ kề: + tỉ lệ chí mạng | +5% | +8.3% | +11.8% |
  | Ụ kề: + sát thương chí mạng | +30% | +49.5% | +50% (trần) |
  | Thời gian choáng khi chí mạng | 0.2 s | 0.2 s | 0.35 s |
  Cấp thẻ: LV1 → LV15: sát thương chí mạng gốc 1★ +30% → +42.6% (tỉ lệ chí mạng tăng cùng tỉ lệ ×1.42). Power-up: +6% độ mạnh buff mỗi bước.
  Mạnh/yếu: vừa tăng sát thương vừa khống chế nhẹ; cần ụ kề bắn nhiều/có chí mạng mới phát huy, sát thương chí mạng sớm chạm trần 50%. Hợp với: Berserker, Werewolf, Scatter.


**— Đặc biệt —**

### Frost — Băng · Thường · Đặc biệt
- **Skill:** Không gây sát thương. Cứ mỗi 6 giây bắn một viên băng ĐÓNG BĂNG quái đầu đoàn 2 giây (quái to chỉ 60% thời gian, trùm chỉ 0,6 giây); hết băng quái còn bị chậm 30% thêm 2 giây (trùm 15%). Quái vừa bị đóng băng được miễn đóng băng 3 giây nên không bị khoá liên tục.
- **Trên màn hình thấy gì:** vòng nạp sáng màu xanh băng nhạt quanh bệ, càng đầy càng kín, gần đầy thì nhấp nháy; viên đạn băng có vệt hạt băng; khi trúng: mảnh băng vỡ tung và chữ "FROZEN" nổi trên đầu quái.
- **Khi nào biến đổi / kích hoạt:** tự bắn khi nạp đầy và có quái chưa bị băng/chưa được miễn (quái miễn chậm như quái bay băng không bị nhắm). Buff tốc bắn làm nạp nhanh hơn. Mốc riêng: 3★ LONG FREEZE băng thêm 0,5 giây; 5★ QUICK FROST nạp 4,5 giây; 7★ DOUBLE FREEZE đóng băng 2 quái đầu cùng lúc.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Thời gian đóng băng (quái thường) | 2 s | 2.5 s | 2.5 s |
  | Chu kỳ / số quái mỗi lần | 6 s / 1 | 6 s / 1 | 4.5 s / 2 |
  Cấp thẻ: LV1 → LV15: thời gian đóng băng gốc 2 → 2,98 giây (+0,07 giây mỗi cấp); 7★ LV15 ≈ 3,5 giây.
  Mạnh/yếu: giữ quái đầu lại rất hiệu quả, nhất là ở 7★; gần như vô dụng với trùm (0,6 giây) và tự nó không giết được gì. Hợp với: Ice Blade, Sniper, Cannon.

### Venom — Độc · Thường · Đặc biệt
- **Skill:** Không tự gây sát thương. Cứ 2,5 giây bắn một viên độc ĐÁNH DẤU quái đầu đoàn trong 5 giây: quái mang dấu nhận thêm 12% sát thương từ mọi ụ. Đánh dấu lại chỉ làm mới thời gian, không cộng dồn; tổng mọi kiểu "suy yếu" lên một quái tối đa 25%.
- **Trên màn hình thấy gì:** vòng nạp sáng màu xanh lá quanh bệ; tia hạt xanh phun ra ở nòng; viên độc xanh có vệt hạt, trúng thì bung khói độc; chữ "MARKED" xanh trên đầu quái và biểu tượng suy yếu trên quái suốt 5 giây.
- **Khi nào biến đổi / kích hoạt:** tự bắn mỗi 2,5 giây (buff tốc bắn làm nhanh hơn), ưu tiên quái chưa có dấu. Mốc riêng: 3★ TWIN MARK đánh dấu 2 quái đầu; 5★ CONTAGION quái mang dấu chết thì dấu nhảy sang quái gần nhất trong ~90 px (có tia xanh nối); 7★ NEUROTOXIN quái mang dấu bị chậm 15% (trừ quái miễn chậm).
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Thêm sát thương quái nhận | +12% | +12% | +12% |
  | Số quái mỗi lần · thêm | 1 | 2 · dấu lây khi chết | 2 · lây + chậm 15% |
  Cấp thẻ: LV1 → LV15: dấu +12% → +17,6% (+0,4% mỗi cấp).
  Mạnh/yếu: tăng sát thương cho cả đội, rất đáng khi có nhiều ụ mạnh bắn quái đầu; % không tăng theo sao, và bị trần suy yếu chung 25%. Hợp với: Sniper, Railgun, Overlord.

### Mana Core — Máy Mana · Thường · Đặc biệt
- **Skill:** Không bắn. Cứ 7 giây sinh ra một lượng mana (tiền trong trận) để triệu hồi ụ và POWER-UP. Lượng mana tăng theo số sao và theo POWER-UP của chính Mana Core (+25% mỗi bước).
- **Trên màn hình thấy gì:** đầu máy không xoay, lơ lửng nhấp nhô và phát sáng tím theo nhịp; vòng nạp sáng màu tím quanh bệ; mỗi lần ra mana: số "+N" tím kèm biểu tượng mana nổi lên, hạt tím bay lên và một tinh thể mana bùng ra trên ô. Chạm vào ụ thấy dây năng lượng chạy tới thanh mana kèm nhãn "+N MANA".
- **Khi nào biến đổi / kích hoạt:** chạy liên tục, buff tốc bắn KHÔNG làm nhanh hơn. Mốc riêng: 3★ FAST FLOW mỗi 6 giây; 5★ OVERFLOW +25% mana; 7★ WELLSPRING mỗi 5 giây.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Mana mỗi lần | 9 | 36 | 79 |
  | Chu kỳ | 7 s | 6 s | 5 s |
  Cấp thẻ: LV1 → LV15: lượng mana ×1,00 → ×1,56 (+4% mỗi cấp); 7★ LV15 ≈ 123 mana mỗi 5 giây.
  Mạnh/yếu: tiếp mana đều cho trận dài, giúp POWER-UP sớm; chiếm 1 ô mà không đánh. Hợp với: Energy Cannon, Mana Doubler, Mana Leech.

### Time Bomb — Bom Hẹn Giờ · Thường · Đặc biệt
- **Skill:** Cứ 2 giây ném một quả bom dính vào một quái ngẫu nhiên (con chưa có bom). Sau 5 giây bom nổ, KHÔNG gây sát thương nhưng làm mọi quái trong vùng nổ YẾU ĐI: nhận thêm 10% sát thương trong 4 giây.
- **Trên màn hình thấy gì:** vòng nạp cam quanh bệ; bom bay tới và dính trên quái, phía trên có số đếm ngược (vàng, 1.5 giây cuối chuyển đỏ và đèn đỏ nháy nhanh). Khi nổ: chớp nổ lớn, vòng cam lan ra, tia lửa, màn hình rung, chữ nổi "WEAKENED".
- **Khi nào biến đổi / kích hoạt:** mỗi 2 giây (nhanh hơn nếu được buff tốc). Mốc riêng: 3★ LONG FUSE yếu kéo dài 6 giây; 5★ SHOCKWAVE vụ nổ làm choáng 0.5 giây (trừ trùm); 7★ TWIN BOMBS mỗi lần ném 2 quả.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Bán kính vụ nổ | 37 px | 46 px | 55 px |
  | Hiệu ứng yếu (nhận thêm sát thương) | +10% · 4 s | +10% · 6 s | +10% · 6 s, choáng 0.5 s, 2 bom |
  Cấp thẻ: LV1 → LV15: không có kỹ năng tăng theo cấp; ụ không gây sát thương nên lên cấp thẻ (và power-up) gần như không đổi gì.
  Mạnh/yếu: giúp cả đội đánh mạnh hơn lên cụm quái; tổng "yếu" từ mọi nguồn bị trần 25%, và bom chọn quái ngẫu nhiên nên có khi rơi vào con lẻ. Hợp với: Cannon, Mortar, Gatling.


---

## Ụ HIẾM (XANH)


**— Tấn công —**

### Ice Blade — Kiếm Băng · Hiếm · Tấn công
- **Skill:** Chém băng vào quái, ưu tiên quái ĐANG BỊ CHẬM. Đánh quái đang chậm (hoặc đang đóng băng) gây ×5 sát thương (+400%). Mỗi đòn còn làm lạnh các quái quanh điểm trúng (20% chậm, 2 giây; trùm 15%) để đòn sau chém chúng ×5.
- **Trên màn hình thấy gì:** đạn băng xanh có vệt đuôi; nổ vỡ băng ở chỗ trúng (to hơn khi trúng quái chậm), số sát thương xanh băng khi "SHATTER"; vòng sáng xanh nhạt 44 px khi hơi lạnh lan sang quái xung quanh.
- **Khi nào biến đổi / kích hoạt:** mỗi đòn. Mốc riêng (không có mốc chung): 3★ SHATTER ×6; 5★ SPLINTERS: khi chém quái chậm, mảnh băng văng trúng các quái khác trong 40 px với 40% sát thương đòn đó; 7★ GLACIER ×8.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát thường (ụ Hiếm LV3, chưa power-up) | 21.8 | 77.5 | 133.2 |
  | Vào quái đang chậm | ×5 = 109 | ×6 = 465 | ×8 = 1066 |
  | Tốc bắn (phát/giây) | 0.75 | 0.75 | 0.75 |
  Cấp thẻ: LV3 → LV15: sát thương +5% mỗi cấp, tới +60%.
  Mạnh/yếu: sát thương cực lớn khi đội có nguồn làm chậm; không tự làm chậm mục tiêu chính nên đứng một mình thì phát đầu luôn thường; quái kháng chậm không bị "SHATTER". Hợp với: Chiller, Frost, Blizzard.

### Drone Bay — Bệ Phóng Drone · Hiếm · Tấn công
- **Skill:** Bình thường bắn đạn liên thanh vào quái đi đầu. Khi GHÉP ụ này, phóng drone bom bay NGƯỢC đường (từ cuối đường về cổng ra quái), đâm vào con quái đầu tiên gặp và nổ lan 46 px với sát thương bằng 24 lần một phát.
- **Trên màn hình thấy gì:** drone nhỏ bay dọc đường, nhấp nhô, có bóng đổ và đuôi lửa xanh băng; nổ to kèm điện xanh, màn hình rung. Các drone xuất phát cách nhau 0.4 giây.
- **Khi nào biến đổi / kích hoạt:** mỗi lần ghép. Số drone = 1 + (sao ÷ 3, làm tròn xuống) theo sao ụ đem ghép: 1–2★ ra 1, 3–5★ ra 2, 6★ ra 3. Drone tồn tại tối đa 12 giây. Mốc chung (phần bắn): 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát thường (ụ Hiếm LV3, chưa power-up) | 11.3 | 40.0 | 89.4 |
  | Khi ghép: số drone × sát thương nổ mỗi con | 1 × 500 | 2 × 1190 | không ghép tiếp được (ghép hai 6★: 3 × 1650) |
  Cấp thẻ: LV3 → LV15: sát thương +5% mỗi cấp, tới +60% (áp cho cả drone). Power-up cũng tăng sát thương drone.
  Mạnh/yếu: mỗi lần ghép là một đợt nổ lớn giữa đám quái; giữa các lần ghép bắn khá yếu. Hợp với: Mimic, Cloner, Mana Doubler.

### Energy Cannon — Pháo Năng Lượng · Hiếm · Tấn công
- **Skill:** Bắn cầu năng lượng tím vào quái đi đầu; sát thương tăng theo lượng mana bạn ĐANG CÓ: cứ mỗi 120 mana thêm +100%, tối đa +500% (từ 600 mana). Không tiêu mana.
- **Trên màn hình thấy gì:** đầu pháo sáng dần khi mana nhiều; càng nhiều mana thì giật nòng, chớp nòng, viên đạn và vụ nổ điện ở chỗ trúng càng to. Số sát thương màu tím. Dưới ô có tấm nhỏ biểu tượng mana + "+..%" (chữ vàng khi đạt +500%).
- **Khi nào biến đổi / kích hoạt:** mỗi phát tính lại theo mana lúc đó. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát khi 0 mana (ụ Hiếm LV3, chưa power-up) | 20.1 | 71.2 | 159.1 |
  | Khi có ≥600 mana (×6) | 120 | 427 | 954 |
  | Tốc bắn (phát/giây) | 0.7 | 0.84 | 0.84 |
  Cấp thẻ: LV3 → LV15: sát thương +5% mỗi cấp, tới +60%.
  Mạnh/yếu: cực mạnh khi để dành mana; tiêu mana mua power-up hay gọi ụ thì pháo yếu đi ngay. Hợp với: Mana Core, Mana Doubler, Mana Leech.

### Laser — Laser · Hiếm · Tấn công
- **Skill:** Chiếu tia liên tục vào quái đầu đoàn. Giữ tia trên cùng một quái thì sát thương tăng dần tới ×4 sau 3 giây; đổi mục tiêu thì về lại ×1. Tia không bao giờ chí mạng.
- **Trên màn hình thấy gì:** tia hồng tím nối từ nòng tới quái, cuộn vân và rung nhẹ, càng giữ lâu tia càng to và sáng; đầu súng nóng sáng dần; đốm sáng ở nòng và ở chỗ trúng, tia lửa hồng lấm tấm. Tia bật/tắt mờ dần.
- **Khi nào biến đổi / kích hoạt:** tự chiếu khi quay đầu súng đúng hướng quái đầu. Buff tốc bắn làm tia mạnh hơn theo tỉ lệ. Mốc chung (loại tự quản nhịp): 3★ QUICK HANDS +20% nhịp; 5★ OVERCHARGE +25% sát thương; 7★ APEX +30% sát thương (+10% chí mạng nhưng tia không chí mạng nên vô tác dụng).
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/giây lúc mới chiếu | 15.6 | 66.5 | 186 |
  | Sát thương/giây khi đủ ×4 (sau 3 s) | 62.4 | 266 | 742 |
  Cấp thẻ: LV3 → LV15: +5% sát thương mỗi cấp, tới +60%.
  Mạnh/yếu: rất mạnh với quái trâu/trùm đi lâu trong tầm; yếu với đám quái nhỏ chết nhanh (tia liên tục bị về ×1). Hợp với: Venom, Radar, Amplifier.

### Mortar — Súng Cối · Hiếm · Tấn công
- **Skill:** Bắn đạn cối vòng cao vào quái NGẪU NHIÊN, nổ lan 46 px. Cứ phát thứ 3 là đạn CHÙM: ngoài vụ nổ chính còn văng ra 3 quả nổ phụ nhỏ xung quanh (mỗi quả 45% sát thương, vùng 26 px).
- **Trên màn hình thấy gì:** nòng giật mạnh, chớp lửa và khói dày; quả đạn bay vòng rất cao có bóng đổ dưới đất; nổ cam to kèm bụi và rung màn; đạn chùm to hơn một chút và nổ thêm 3 đám lửa nhỏ quanh tâm.
- **Khi nào biến đổi / kích hoạt:** bắn tự động; đạn chùm ở phát 3, 6, 9… Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương vụ nổ chính (46 px) | 35.8 | 127 | 284 |
  | Mỗi quả nổ phụ của đạn chùm | 16.1 | 57.1 | 128 |
  | Tốc bắn (phát/giây) | 0.40 | 0.48 | 0.48 |
  Cấp thẻ: LV3 → LV15: +5% sát thương mỗi cấp, tới +60%.
  Mạnh/yếu: rải sát thương khắp đường, tốt với quái đông; nhắm ngẫu nhiên nên không tập trung được quái nguy hiểm, đạn bay chậm. Hợp với: Cannon, Amplifier, Venom.

### Toxic Pool — Bom Vũng Độc · Hiếm · Tấn công
- **Skill:** Định kỳ ném một bình độc xuống đường, ngay trước mặt quái đi đầu, tạo vũng độc tồn tại 5 giây. Quái nào đi qua vũng đều bị trúng độc (mất máu theo thời gian, kéo dài thêm 1.5 giây sau khi rời vũng). Độc không cộng dồn, lấy mức mạnh nhất.
- **Trên màn hình thấy gì:** vòng nạp xanh lá quanh bệ; bình độc bay vòng cung có đuôi, chạm đất thành đám khói độc xanh lá cuộn động trên đường rồi mờ dần; số sát thương độc màu xanh lá.
- **Khi nào biến đổi / kích hoạt:** mỗi 4.4 giây ở 1★, nhanh dần 0.2 giây mỗi sao (sớm hơn nếu được buff tốc). Mốc riêng (không có mốc chung): 3★ TWIN POOLS ném thêm vũng thứ 2 phía sau; 5★ CORROSION quái trong vũng nhận thêm 15% sát thương; 7★ TOXIC LAKE vũng rộng hơn 50%.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Độc mỗi giây (ụ Hiếm LV3, chưa power-up) | 31.8 | 113.0 | 194.3 |
  | Bán kính vũng · số vũng · nhịp ném | 32 px · 1 · 4.4 s | 38 px · 2 · 3.8 s | 66 px · 2 · 3.2 s |
  Cấp thẻ: LV3 → LV15: sát thương +5% mỗi cấp, tới +60%.
  Mạnh/yếu: đánh mọi quái đi qua, rất tốt với đoàn quái đông; độc không cộng dồn nên đặt nhiều nguồn độc chồng lên nhau phí. Hợp với: Purifier, Venom, Time Bomb.

### Mana Leech — Máy Hút Mana · Hiếm · Tấn công
- **Skill:** Bắn tia hút vào quái đi đầu; mỗi phát trúng gây sát thương và hồi một chút mana, nhưng có trần mana mỗi giây. Mana được cộng dồn và nhả ra theo từng gói (từ 3 mana trở lên).
- **Trên màn hình thấy gì:** đạn tia sáng tím; khi nhả mana: hạt sáng tím bay lên từ quái và số "+3" (hoặc hơn) tím nổi cạnh ụ.
- **Khi nào biến đổi / kích hoạt:** mỗi phát trúng. Mana mỗi phát tăng 0.15 mỗi sao và +20% mỗi bước power-up; trần mỗi giây tăng 0.3 mỗi sao. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (ụ Hiếm LV3, chưa power-up) | 14.3 | 50.8 | 113.4 |
  | Mana mỗi phát · trần mỗi giây | 0.35 · 1.2 | 0.8 · 2.1 | 1.25 · 3.0 |
  | Tốc bắn · mana thực tế mỗi giây | 1.4 · ~0.5 | 1.68 · ~1.3 | 1.68 · ~2.1 |
  Cấp thẻ: LV3 → LV15: chỉ sát thương +5% mỗi cấp, tới +60% (lượng mana không tăng theo cấp thẻ).
  Mạnh/yếu: vừa đánh vừa ra mana đều đặn; lượng mana nhỏ và bị trần, buff tốc bắn rất cao cũng không vượt trần. Hợp với: Energy Cannon, Radar, Fusion Mixer.

### Mine Layer — Bệ Rải Mìn · Hiếm · Tấn công
- **Skill:** Định kỳ bắn một quả mìn xuống đường, phía trước một quái ngẫu nhiên. Quái giẫm lên thì mìn nổ lan 36 px, sát thương bằng 7 lần một phát. Đôi khi ra MÌN SAO nổ ×3. Mỗi ụ có tối đa 6 mìn nằm trên đường; mìn tự mất sau 30 giây.
- **Trên màn hình thấy gì:** vòng nạp cam quanh bệ; đầu ụ quay về chỗ rải, quả mìn bay vòng cung rồi nằm trên đường, đèn đỏ nháy (mìn sao to hơn, đèn vàng). Nổ cam có bụi và rung màn hình; mìn sao nổ to hơn, tia lửa vàng.
- **Khi nào biến đổi / kích hoạt:** mỗi 3.8 giây ở 1★, nhanh 0.2 giây mỗi sao (không nhanh hơn 2 giây), cộng buff tốc. Tỉ lệ mìn sao 3% +0.5% mỗi sao. Mốc chung: 3★ QUICK HANDS +20% tốc rải; 5★ OVERCHARGE +25% sát thương; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương mỗi mìn (ụ Hiếm LV3, chưa power-up) | 82 | 291 | 812 |
  | Nhịp rải · tỉ lệ mìn sao ×3 | 3.8 s · 3% | 2.7 s · 4.5% | 2.2 s · 6% |
  Cấp thẻ: LV3 → LV15: sát thương +5% mỗi cấp, tới +60%.
  Mạnh/yếu: mỗi quả mìn rất đau và nổ lan, chặn đường tốt; mìn rơi trước quái ngẫu nhiên nên đôi khi nằm chỗ ít quái, và tối đa chỉ 6 quả. Hợp với: Time Bomb, Venom, Radar.


**— Hỗ trợ —**

### Crit Antenna — Ăng-ten Chí Mạng · Hiếm · Hỗ trợ
- **Skill:** Không bắn. Cho 4 ụ ở ô kề (trên/dưới/trái/phải, trừ ụ Hỗ trợ khác) thêm tỉ lệ chí mạng. Chí mạng = gấp đôi sát thương.
- **Trên màn hình thấy gì:** ăng-ten quay chậm đều (không nhắm quái); định kỳ có xung sáng đỏ ngắn chạy tới các ụ kề. Khi chạm vào ụ: dây năng lượng tới từng ô kề và nhãn "+..% CRIT".
- **Khi nào biến đổi / kích hoạt:** buff luôn bật. Mốc riêng: 3★ SHARP EYE +11% chí mạng; 5★ DEADLY EYE +15% chí mạng và +10% sát thương chí mạng; 7★ CERTAIN STRIKE +20% chí mạng và cứ 6 giây đòn kế tiếp của mỗi ụ kề chắc chắn chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Ụ kề: + tỉ lệ chí mạng | +6% | +13% | +20% |
  | Thêm | – | – (5★: +10% sát thương chí mạng) | +10% sát thương chí mạng, chí mạng chắc mỗi 6 s |
  Cấp thẻ: LV3 → LV15: buff gốc 1★ 6% → 8.4% (mọi sao ×1.4), nhưng tổng chí mạng từ ụ Hỗ trợ bị trần 20% nên 7★ không vượt 20%. Power-up: +6% độ mạnh buff mỗi bước.
  Mạnh/yếu: buff đơn giản, hợp mọi ụ bắn; trần 20% làm ụ sao cao/cấp cao ít lợi thêm. Hợp với: Dice Gun, Revolver, Berserker.

### Radar — Radar · Hiếm · Hỗ trợ
- **Skill:** Không bắn. Tăng tốc bắn cho các ụ ở 4 ô thẳng kề (trên/dưới/trái/phải), trừ ụ Hỗ trợ khác. Tổng buff tốc bắn từ mọi ụ hỗ trợ lên một ụ tối đa 45%.
- **Trên màn hình thấy gì:** chảo radar quay đều liên tục; khoảng 2,2 giây một lần có xung năng lượng cam ngắn chạy tới các ô đang nhận buff; ụ được buff có biểu tượng tốc bắn (mũi tên ») ở góc trên-trái. Chạm Radar: các ô khác tối đi, vòng năng lượng cam quét ra, dây nối tới ô kề và nhãn "+X% FIRE RATE".
- **Khi nào biến đổi / kích hoạt:** buff luôn bật. Độ mạnh theo sao: 3★ TUNED AURA ×1,45; 5★ LOCK-ON ×1,9 và ô kề thêm +4% chí mạng; 7★ OVERDRIVE ×2,35 và cứ 8 giây bùng thêm +25% tốc bắn trong 2 giây (vẫn tính trong trần 45%). POWER-UP: +6% độ mạnh buff mỗi bước.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Buff tốc bắn cho ô kề | +12% | +19.8% | +28.2% |
  | Thêm | – | – | +4% chí mạng · OVERDRIVE |
  Cấp thẻ: LV3 → LV15: giá trị buff 1★ +12% → +16,8% (+0,4% mỗi cấp), nên 7★ LV15 ≈ +39,5% (chạm trần 45% khi cộng thêm nguồn khác).
  Mạnh/yếu: rẻ, buff tới 4 ụ cùng lúc; cần xếp ụ tấn công đúng ô thẳng kề, ở sao cao dễ đụng trần 45%. Hợp với: Gatling, Cannon, Tesla.

### Fusion Mixer — Bộ Trộn · Hiếm · Hỗ trợ
- **Skill:** Không bắn. Ụ Tấn công ở 4 ô kề được thêm tốc bắn; càng nhiều LOẠI ụ Tấn công khác nhau đứng quanh thì buff càng mạnh: 6% với 1 loại, +2% mỗi loại thêm (tối đa 12% ở 1★ khi đủ 4 loại).
- **Trên màn hình thấy gì:** đầu ụ quay đều; định kỳ có xung sáng vàng ngắn chạy tới các ụ Tấn công kề. Chạm vào ụ: dây năng lượng tới từng ô và nhãn "+..% FIRE RATE".
- **Khi nào biến đổi / kích hoạt:** buff luôn bật, tự tính lại khi ụ kề đổi. Mốc: 3★ TUNED AURA (×1.45); 5★ MIXED FIRE: ×1.9, có từ 3 loại trở lên thì thêm sát thương (+5.7% ở 5★); 7★ PERFECT BLEND: ×2.35, đủ 4 loại thì thêm 6% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Ụ kề: + tốc bắn (1 loại → 4 loại) | 6% → 12% | 9.9% → 19.8% | 14.1% → 28.2% |
  | Thêm | – | – | 3+ loại: +7% sát thương; 4 loại: +6% chí mạng |
  Cấp thẻ: LV3 → LV15: buff gốc 1★ 6% → 8.4% (mọi sao ×1.4). Power-up: +6% độ mạnh buff mỗi bước. Tốc bắn từ ụ Hỗ trợ trần 45%.
  Mạnh/yếu: rất hợp bộ bài nhiều loại ụ Tấn công khác nhau; bàn toàn một loại thì chỉ được 6%. Hợp với: Gatling, Cannon, Tesla.

### Chiller — Máy Phát Lạnh · Hiếm · Hỗ trợ
- **Skill:** Không bắn. Mọi đòn của các ụ ở 4 ô kề (trừ ụ Hỗ trợ) kèm làm CHẬM quái trong 2 giây. Không cộng dồn với nguồn chậm khác (lấy mức cao nhất); trần 35%, trùm tối đa 15%.
- **Trên màn hình thấy gì:** đầu máy quay khá nhanh và đều, hạt hơi lạnh xanh nhạt bốc lên từ ụ, định kỳ có xung sáng xanh băng chạy tới các ụ kề. Chạm vào ụ: nhãn "+..% SLOW".
- **Khi nào biến đổi / kích hoạt:** mỗi đòn của ụ kề. Mốc: 3★ TUNED AURA (×1.45); 5★ FROSTNIP: ×1.9 và ụ kề gây thêm sát thương vào quái đang chậm; 7★ FLASH FREEZE: ×2.35 và cứ 8 giây đòn kế tiếp của mỗi ụ kề đóng băng quái 0.8 giây (trừ trùm và quái kháng chậm).
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Độ chậm mỗi đòn (2 s) | 8% | 13.2% | 18.8% |
  | Thêm | – | – (5★: +9.5% sát thương vào quái chậm) | +11.8% vào quái chậm, đóng băng 0.8 s mỗi 8 s |
  Cấp thẻ: LV3 → LV15: độ chậm gốc 1★ 8% → 11% (mọi sao ×1.375). Power-up: +6% độ mạnh buff mỗi bước.
  Mạnh/yếu: biến ụ bắn nhanh thành máy làm chậm cả đám, mở đường cho Ice Blade; chậm chỉ lấy mức cao nhất nên chồng nhiều nguồn chậm không lợi. Hợp với: Ice Blade, Scatter, Gatling.

### Amplifier — Bộ Khuếch Đại · Hiếm · Hỗ trợ
- **Skill:** Không bắn. Ụ Tấn công ở 4 ô kề đánh LIÊN TIẾP vào cùng một quái thì mỗi đòn cộng thêm sát thương (tính riêng từng quái). Đổi mục tiêu hoặc ngừng đánh con đó quá 1.5 giây thì về 0 (ụ bắn chậm được chờ đủ một nhịp bắn).
- **Trên màn hình thấy gì:** đầu ụ quay chậm đều; định kỳ có xung sáng cam chạy tới các ụ Tấn công kề. Chạm vào ụ: nhãn "+..% / HIT ×5".
- **Khi nào biến đổi / kích hoạt:** đòn đầu vào một quái chưa cộng, từ đòn thứ 2 liên tiếp bắt đầu cộng dồn. Mốc: 3★ TUNED AURA (×1.45); 5★ DEEP STACKS: ×1.9, tối đa 7 lần cộng; 7★ LOCKED IN: ×2.35, giữ cộng dồn 3 giây.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | + sát thương mỗi lần cộng | +9% | +14.9% | +21.2% |
  | Số lần cộng tối đa · tổng (trần 35%) | 5 · 35% | 5 · 35% | 7 · 35% |
  Cấp thẻ: LV3 → LV15: mỗi lần cộng gốc 1★ 9% → 12.6% (mọi sao ×1.4). Power-up: +6% độ mạnh buff mỗi bước.
  Mạnh/yếu: rất hợp ụ bắn dồn một mục tiêu (trùm, quái trâu); tổng bị trần sát thương 35% chung nên sao cao chủ yếu là đạt trần nhanh hơn; ụ bắn ngẫu nhiên hoặc đổi mục tiêu liên tục ít được lợi. Hợp với: Sniper, Revolver, Railgun.


**— Đặc biệt —**

### Mana Doubler — Máy Nhân Mana · Hiếm · Đặc biệt
- **Skill:** Bình thường bắn tia lửa tím yếu vào quái đi đầu. Kỹ năng chính: khi đem GHÉP ụ này, bạn nhận ngay một lượng mana lớn, càng nhiều sao càng nhiều mana.
- **Trên màn hình thấy gì:** đạn tia lửa tím. Lúc ghép: số "+mana" tím to nổi trên ô, 16 hạt sáng tím bay lên, biểu tượng mana bùng sáng trên ô và tiếng mana.
- **Khi nào biến đổi / kích hoạt:** mỗi lần ghép (kể cả ghép với Mimic). Mana = 32 × số sao của ụ đem ghép; mỗi bước power-up thêm 25% lượng này. Mốc chung (cho phần bắn): 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Mana khi ghép (LV3, chưa power-up) | +32 | +128 | không ghép tiếp được (ghép hai 6★: +192) |
  | Sát thương/phát (ụ Hiếm LV3) | 8.1 | 28.8 | 64.2 |
  Cấp thẻ: LV3 → LV15: mana mỗi sao 32 → 56 (ghép hai 6★ được +336), và sát thương +5% mỗi cấp, tới +60%.
  Mạnh/yếu: nguồn mana bùng nổ để mua power-up/dùng chiêu Ma vương; bắn rất yếu, giá trị nằm ở việc ghép. Hợp với: Energy Cannon, Mana Core, Mimic.

### Mimic — Mimic · Hiếm · Đặc biệt
- **Skill:** Ụ "joker": ghép được với BẤT KỲ ụ nào cùng số sao (không cần cùng loại). Ụ mới ra (ngẫu nhiên trong bộ bài, +1★) được +50% sát thương trong 8 giây. Lúc đứng chờ, Mimic tự bắn đạn nhỏ vào quái đầu.
- **Trên màn hình thấy gì:** đầu ụ luôn ánh sáng nhấp nháy và có đốm cầu vồng (hồng, vàng, xanh lá, xanh dương, tím) chạy vòng quanh; đạn là tia lửa nhỏ, trúng bắn tia màu hồng/xanh/vàng. Ụ nhận buff có biểu tượng sát thương ở góc ô.
- **Khi nào biến đổi / kích hoạt:** kích hoạt khi kéo ghép Mimic với ụ cùng sao (hoặc kéo ụ khác vào Mimic). Kỹ năng "khi ghép" của ụ kia vẫn chạy (vd ghép với Orbital vẫn đánh thức Vệ Tinh). Mốc chung của súng bắn thường: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương mỗi phát (khi tự bắn) | 8.7 | 30.8 | 68.8 |
  | Tốc bắn (phát/giây) | 1.2 | 1.44 | 1.44 |
  | Buff cho ụ ra sau ghép | +50% · 8 s | +50% · 8 s | +50% · 8 s |
  Cấp thẻ: LV3 → LV15: buff sau ghép +50% → +74% (+2% mỗi cấp) và sát thương bắn +5% mỗi cấp (tới +60%).
  Mạnh/yếu: cứu bàn khi thiếu cặp ghép, giúp lên sao nhanh; tự bắn rất yếu. Hợp với: Merge King, Orbital, Wall Projector.

### Teleporter — Bệ Dịch Chuyển · Hiếm · Đặc biệt
- **Skill:** Kéo ụ này thả lên một ụ khác CÙNG SAO trên bàn mình thì hai ụ ĐỔI CHỖ cho nhau (không ghép, không mất ụ nào). Đổi được cả với ô bị hoá đá hoặc đóng băng. Lúc thường thì bắn tia lửa xanh nhạt vào quái đi đầu.
- **Trên màn hình thấy gì:** đạn tia lửa xanh nhạt. Khi đổi chỗ: ở cả hai ô có vòng xanh nhạt co lại và tia lửa, một tia phép nối hai ô, hai ụ bật nảy ở chỗ mới.
- **Khi nào biến đổi / kích hoạt:** mỗi lần bạn kéo nó lên ụ khác cùng sao (phải kéo chính Teleporter; hai Teleporter cùng sao thì ghép như thường). Mốc chung (phần bắn): 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (ụ Hiếm LV3, chưa power-up) | 15.3 | 54.3 | 121.2 |
  | Tốc bắn (phát/giây) | 0.85 | 1.02 | 1.02 |
  Cấp thẻ: LV3 → LV15: sát thương +5% mỗi cấp, tới +60% (việc đổi chỗ không đổi theo cấp).
  Mạnh/yếu: sửa bố cục bàn (đưa ụ đánh gần ra mép đường, đặt ụ cạnh ụ Hỗ trợ); cần đúng cùng sao, bắn yếu. Hợp với: Iron Fist, Werewolf, Crit Antenna.

### Cooldown Horn — Loa Hồi Chiêu · Hiếm · Đặc biệt
- **Skill:** Bình thường bắn tia lửa vàng vào quái đi đầu. Khi GHÉP ụ này: nếu chiêu Ma vương đang hồi thì giảm thời gian hồi; nếu chiêu đã sẵn sàng thì giảm 15% giá mana của chiêu (không thấp hơn giá gốc).
- **Trên màn hình thấy gì:** loa quay chậm đều; mỗi phát bắn có một vòng vàng nhỏ quanh ụ. Lúc ghép: 3 vòng sóng âm vàng lan rộng dần từ ô ghép.
- **Khi nào biến đổi / kích hoạt:** mỗi lần ghép. Số giây giảm = 3 + 1.5 × sao của ụ đem ghép. Mốc chung (phần bắn): 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Giảm hồi chiêu Ma vương khi ghép (LV3) | −4.5 s | −9 s | không ghép tiếp được (ghép hai 6★: −12 s) |
  | Sát thương/phát (ụ Hiếm LV3, chưa power-up) | 16.3 | 57.7 | 128.9 |
  Cấp thẻ: LV3 → LV15: mức giảm gốc 4.5 s → 7.5 s (mọi sao ×1.67, ghép hai 6★ được −20 s), và sát thương +5% mỗi cấp, tới +60%.
  Mạnh/yếu: cho dùng chiêu Ma vương dày hơn hẳn; bắn yếu, giá trị nằm ở việc ghép. Hợp với: Mimic, Mana Doubler, Energy Cannon.


---

## Ụ SỬ THI (TÍM)


**— Tấn công —**

### Berserker — Súng Cuồng Nộ · Sử thi · Tấn công
- **Skill:** Súng liên thanh, chí mạng sẵn cao hơn ụ thường (15% thay vì 10%). Chí mạng lần 1 → NỘ: +25% tốc bắn trong 5 giây. Chí mạng lần 2 khi còn NỘ → CUỒNG NỘ: tốc bắn tăng rất mạnh trong 5 giây; đang Cuồng Nộ mà chí mạng tiếp thì được cộng thêm 1 giây.
- **Trên màn hình thấy gì:** ụ có 3 dạng đầu súng: CALM bắn vạch vàng; RAGE bắn đạn cam kéo tàn lửa, đầu súng hơi sáng; FRENZY hai nòng bắn xen kẽ đạn đỏ-trắng, chớp nòng đôi, vỏ đạn văng, nổ lửa nhỏ khi trúng, đầu súng nhấp nháy. Khi vào NỘ/CUỒNG NỘ có bùng hào quang buff. Vòng 3 cung quanh ụ: cung phải sáng nửa khi NỘ, cung "vương miện" trên đỉnh tụt dần theo thời gian Cuồng Nộ còn lại; đổi dạng có hoạt ảnh biến hình.
- **Khi nào biến đổi / kích hoạt:** mỗi lần chí mạng. Mốc riêng (không dùng mốc chung): 3★ HOT BLOOD — NỘ giữ 8 giây; 5★ BLOODLUST — Cuồng Nộ dài 7 giây; 7★ RAMPAGE — trong Cuồng Nộ +25% chí mạng (dễ nối dài Cuồng Nộ).
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (ụ Sử thi LV6, chưa power-up) | 13.3 | 47.3 | 81.2 |
  | Tốc bắn thường · khi Cuồng Nộ (phát/giây) | 1.5 · 4.0 | 1.5 · 4.7 | 1.5 · 5.3 |
  | Cuồng Nộ cộng tốc bắn | +165% | +210% | +255% |
  Cấp thẻ: LV6 → LV15: chỉ tăng sát thương, +7% mỗi cấp, tới +63%.
  Mạnh/yếu: khi đã vào Cuồng Nộ bắn cực nhanh; nhưng phụ thuộc may rủi chí mạng, lúc bình thường khá chậm và 7★ không có thêm sát thương mốc chung. Hợp với: Crit Antenna, Hammer, Radar.

### Blizzard — Bão Tuyết · Sử thi · Tấn công
- **Skill:** Không bắn từng viên. Cứ mỗi đợt nạp đầy, tung một cơn bão tuyết đánh TẤT CẢ quái trên đường: gây sát thương, làm chậm 3 giây và đóng băng ngắn quái nhỏ (không áp lên trùm, quái to và quái kháng chậm).
- **Trên màn hình thấy gì:** đầu ụ là quạt tuyết quay đều liên tục. Quanh bệ có vòng nạp sáng màu xanh băng nhạt, càng đầy càng kín, gần đầy thì nhấp nháy. Khi phát: tuyết rơi khắp sân, cả màn hình loé xanh nhạt, mỗi con quái bị vỡ băng (mảnh băng bắn ra).
- **Khi nào biến đổi / kích hoạt:** mỗi chu kỳ nạp (chỉ phát khi có quái). Buff tốc bắn từ ụ khác cũng làm nạp nhanh hơn. Mốc riêng: 3★ SQUALL — phát sớm hơn 1.5 giây; 5★ ICE SHARDS — sát thương mỗi đợt ×3; 7★ WHITEOUT — quái nhỏ bị đóng băng 1 giây (thường 0.35 giây).
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương mỗi đợt lên MỖI quái (Sử thi LV6, chưa power-up) | 22.3 | 79.1 | 407.6 |
  | Chu kỳ phát | 10.4 s | 7.1 s | 5.3 s |
  | Làm chậm (3 giây) · đóng băng quái nhỏ | 33% · 0.35 s | 42% · 0.35 s | 51% · 1 s |
  Cấp thẻ: LV6 → LV15: chỉ tăng sát thương, +7% mỗi cấp, tới +63%.
  Mạnh/yếu: khống chế toàn sân rất tốt, càng đông quái càng lời; nhịp chậm nên sát thương lên 1 mục tiêu (trùm) thấp. Hợp với: Ice Blade, Chiller, Cryo Reactor.

### Chain Link — Chuỗi Liên Kết · Sử thi · Tấn công
- **Skill:** Các Chain Link đứng sát nhau (trên-dưới-trái-phải, nối liền thành chuỗi) cùng mạnh lên: mỗi ụ trong chuỗi +40% sát thương cho mỗi Chain Link khác trong chuỗi. Chuỗi từ 4 ụ trở lên: đạn trúng còn nảy sang 1 quái gần đó (trong 90 px) với 50% sát thương. Ụ bị hoá đá làm đứt chuỗi.
- **Trên màn hình thấy gì:** 3 dạng đầu súng: SINGLE bắn vòng tím rỗng; LINKED đạn kéo theo sợi xích từ nòng; CHAIN MASTER khi trúng có xích mắt tròn quật sang quái thứ 2. Dưới ô có tấm nhỏ "×số ụ trong chuỗi" kèm biểu tượng sát thương. Khi chuỗi dài thêm: xích sáng nối các ô. Chạm chọn ụ thì thấy xích nối cả chuỗi. Vòng 3 cung quanh ụ thể hiện độ dài chuỗi (2 → cung phải, 4 → cung vương miện).
- **Khi nào biến đổi / kích hoạt:** luôn tính theo vị trí trên bàn. 2 ụ nối → LINKED; 4+ ụ nối → CHAIN MASTER. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát, đứng 1 mình (Sử thi LV6, chưa power-up) | 22.0 | 78.1 | 174.4 |
  | Tốc bắn (phát/giây) | 0.9 | 1.08 | 1.08 |
  Thưởng chuỗi: 2 ụ +40% · 3 ụ +80% · 4 ụ +120% (thêm nảy) · 5 ụ +160%.
  Cấp thẻ: LV6 → LV15: chỉ tăng sát thương, +7% mỗi cấp, tới +63%.
  Mạnh/yếu: rất mạnh khi giữ được nhiều Chain Link sát nhau; nhưng ghép làm mất ụ khỏi chuỗi, và bắn chậm. Hợp với: Amplifier, Radar, Reaper Pillar.

### Fifth Shot — Nỏ Năm Nhịp · Sử thi · Tấn công
- **Skill:** Nỏ bắn từng mũi tên thường; cứ phát thứ 5 thì bắn cùng lúc 3 mũi tên nổ vào quái đang nhắm và 2 quái gần nó nhất (ít quái thì dồn vào 1 con). Mỗi mũi nổ lan 34 px với 2 lần sát thương.
- **Trên màn hình thấy gì:** dưới bệ có 5 chấm nhịp: mỗi phát thường sáng thêm 1 chấm hồng; phát thứ 5 nỏ giật mạnh, chớp nòng lớn, 3 mũi tên to bay ra, nổ pháo kèm vòng hồng, ụ bùng hào quang chí mạng ngắn; xong 5 chấm tắt và đếm lại.
- **Khi nào biến đổi / kích hoạt:** cố định mỗi 5 phát. Ụ này tự giữ nhịp nên dùng mốc chung kiểu "tự nạp": 3★ QUICK HANDS +20% tốc bắn; 5★ OVERCHARGE +25% sát thương; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương phát thường (Sử thi LV6, chưa power-up) | 15.8 | 56.2 | 157.0 |
  | Phát thứ 5: mỗi mũi nổ (×3 mũi) | 31.7 | 112.5 | 314.0 |
  | Tốc bắn (phát/giây) | 1.25 | 1.5 | 1.5 |
  Cấp thẻ: LV6 → LV15: chỉ tăng sát thương, +7% mỗi cấp, tới +63%.
  Mạnh/yếu: sát thương lan đều đặn, 7★ được cả 2 mốc sát thương (×1.625); nhưng 4 phát thường khá yếu. Hợp với: Overclock, Radar, Amplifier.

### Storm Gun — Súng Bão · Sử thi · Tấn công
- **Skill:** Bắn tia điện trúng ngay lập tức (không có đạn bay), rất nhanh. Mỗi phát có 20% nảy sét sang quái gần nhất (trong 96 px) với 70% sát thương. Mỗi Súng Bão khác đứng sát cạnh (trên-dưới-trái-phải) làm nó bắn chậm đi 30%.
- **Trên màn hình thấy gì:** tia sét xanh lơ mảnh loé từ nòng tới quái mỗi phát, chớp nòng nhỏ, thỉnh thoảng nổ điện tại chỗ trúng; khi nảy thì thấy tia sét nhảy sang con thứ 2.
- **Khi nào biến đổi / kích hoạt:** mỗi phát bắn (nảy sét theo xác suất). Tốc bắn còn tăng 5% mỗi sao. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (Sử thi LV6, chưa power-up) | 8.6 | 30.5 | 68.0 |
  | Tốc bắn (phát/giây, không đứng cạnh Súng Bão khác) | 4.5 | 6.2 | 7.0 |
  Cấp thẻ: LV6 → LV15: chỉ tăng sát thương, +7% mỗi cấp, tới +63%.
  Mạnh/yếu: rất nhiều phát nên ăn buff "mỗi phát trúng" cực tốt; mỗi phát yếu, và phải đặt các Súng Bão xa nhau. Hợp với: Reaper Pillar, Amplifier, Crit Antenna.

### Lighthouse — Tháp Ánh Sáng · Sử thi · Tấn công
- **Skill:** Bắn tia sáng vào quái, sát thương mỗi phát còn +15% cho mỗi sao của tháp. Đồng thời định kỳ gọi miễn phí 1 ụ 1★ (loại ngẫu nhiên trong bộ bài) vào ô trống; sao càng cao gọi càng nhanh.
- **Trên màn hình thấy gì:** quanh đầu tháp có các quả cầu sáng quay vòng — số quả = số sao. Vòng nạp sáng màu vàng nhạt quanh bệ. Khi gọi ụ: một quả cầu ánh sáng bay vòng cung từ tháp tới ô trống, ụ mới hiện ra với hiệu ứng triệu hồi. Đạn là tia lửa vàng nhạt, trúng thì toé tia sáng.
- **Khi nào biến đổi / kích hoạt:** mỗi chu kỳ gọi ụ (bàn đầy thì giữ đầy chờ, có ô trống là gọi ngay). Chu kỳ này không được buff tốc bắn rút ngắn. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (Sử thi LV6, chưa power-up, đã gồm +15%/sao) | 18.2 | 90.0 | 257.5 |
  | Tốc bắn (phát/giây) | 0.75 | 0.9 | 0.9 |
  | Gọi 1 ụ 1★ mỗi | 19.4 s | 14.6 s | 9.8 s |
  Cấp thẻ: LV6 → LV15: chỉ tăng sát thương, +7% mỗi cấp, tới +63%.
  Mạnh/yếu: tạo ụ miễn phí liên tục, sao cao bắn rất đau; bắn chậm và cần ô trống để gọi. Hợp với: Mimic, Cloner, Merge King.

### Ricochet — Đĩa Nảy · Sử thi · Tấn công
- **Skill:** Bắn một lưỡi cưa tròn vào quái đi đầu. Trúng xong, đĩa nảy sang quái gần nhất (trong 90 px) chưa bị trúng; số lần nảy = số sao. Mỗi lần nảy đĩa mạnh thêm một chút, nên cú cuối là mạnh nhất.
- **Trên màn hình thấy gì:** lưỡi cưa xám quay tít, viền và vệt sáng màu vàng chanh, nảy qua lại giữa các quái; mỗi lần nảy đĩa to hơn, sáng hơn, bay nhanh hơn, có vòng sáng nhỏ và tia lửa ở chỗ trúng. Cú cuối nổ một chớp điện.
- **Khi nào biến đổi / kích hoạt:** mỗi phát bắn đều nảy. Nếu quái đang bị nhắm chết giữa đường, đĩa tự chuyển sang quái gần nhất; không còn quái trong 90 px thì đĩa tắt. Mốc sao: 3★ QUICK HANDS +20% tốc bắn · 5★ DOUBLE TAP (cứ phát thứ 4 bắn đôi) · 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương cú đầu (LV đầu, chưa power-up) | 18.2 | 64.4 | 143.9 |
  | Số lần nảy · thêm mỗi lần nảy · cú cuối | 1 · +15% · ×1.15 | 4 · +18% · ×1.72 | 7 · +25% · ×2.75 |
  | Tốc bắn (phát/giây) | 1.1 | 1.32 | 1.32 |
  Cấp thẻ: LV6 → LV15: sát thương +7% mỗi cấp, tới +63%.
  Mạnh/yếu: rất mạnh khi quái đi thành đàn sát nhau; quái đi lẻ, cách xa thì đĩa không nảy được. Hợp với: Armor Breaker, Venom, Crit Antenna.

### Combo Core — Lõi Combo · Sử thi · Tấn công
- **Skill:** Mỗi lần bạn ghép 2 Combo Core với nhau (hoặc Mimic với Combo Core), bộ đếm COMBO của bàn +1, giữ suốt trận. Mọi Combo Core trên bàn được cộng sát thương theo COMBO; từ COMBO 20 trở đi mỗi combo chỉ còn tính một nửa. Ụ bắn 2 viên đạn cam song song, mỗi viên 50% sát thương.
- **Trên màn hình thấy gì:** khi ghép đúng cặp hiện chữ cam to "COMBO ×N" và một vòng sáng; các Combo Core còn lại trên bàn lóe sáng. Quanh ụ có vòng phù văn cam quay (1 vòng lúc đầu, 2 vòng ngược chiều nhau ở COMBO 10+, lõi đỏ rực ở COMBO 20+). Đáy ô có tấm nhỏ ghi "×N" (chữ vàng khi tới 20). Có vòng 3 cung quanh ụ báo tiến độ tới dạng sau.
- **Khi nào biến đổi / kích hoạt:** tăng mỗi lần ghép đúng cặp. Dạng: COMBO 0–9 / 10–19 / 20+. Co-op: nếu đồng đội cũng mang Combo Core, bạn được thêm ½ COMBO của họ. Mốc sao: 3★ QUICK HANDS +20% tốc bắn · 5★ DOUBLE TAP · 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương mỗi loạt 2 viên (LV đầu, COMBO 0) | 24.8 | 87.9 | 196.3 |
  | Thêm mỗi COMBO · ví dụ ở COMBO 10 | +6% · +60% | +9% · +90% | +12% · +120% |
  | Tốc bắn (loạt/giây) | 1 | 1.2 | 1.2 |
  Cấp thẻ: LV6 → LV15: sát thương +7% mỗi cấp, tới +63%.
  Mạnh/yếu: càng về cuối trận càng mạnh, không có trần cứng; đầu trận yếu và cần bộ bài ít loại để hay ghép trúng cặp. Hợp với: Mimic, Chain Link, Sync Cannon.

### Lone Ace — Độc Tôn · Sử thi · Tấn công
- **Skill:** Nếu 4 ô trên/dưới/trái/phải đều TRỐNG → trạng thái ACE: tốc bắn +100% và thêm tỉ lệ chí mạng. Nếu có 3 ụ kề trở lên → bị chật, −30% tốc bắn. 1–2 ụ kề thì bình thường. Ụ Hỗ trợ đặt kề cũng tính là hàng xóm.
- **Trên màn hình thấy gì:** tia đỏ bắn thẳng vào quái đầu. Khi ACE: vòng đỏ sáng nhấp nháy quanh bệ, đầu súng sáng, lúc vào ACE có hiệu ứng buff bùng lên. Đáy ô có tấm "+100%" (chữ vàng) hoặc "−30%" khi chật.
- **Khi nào biến đổi / kích hoạt:** xét liên tục theo vị trí trên bàn. Mốc sao: 3★ QUICK HANDS +20% tốc bắn · 5★ DOUBLE TAP · 7★ DUELIST: khi ACE, đạn xuyên thêm 1 quái phía sau (trong 80 px, đủ sát thương) (không có APEX).
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương 1 phát (LV đầu) | 23.1 | 82.0 | 140.9 |
  | Tốc bắn: thường · ACE · chật | 1.0 · 2.0 · 0.7 | 1.2 · 2.2 · 0.9 | 1.2 · 2.2 · 0.9 |
  | Thêm chí mạng khi ACE (gốc 10%) | +10% | +16% | +25% |
  Cấp thẻ: LV6 → LV15: sát thương +7% mỗi cấp, tới +63%.
  Mạnh/yếu: rất mạnh nếu chừa được 4 ô trống, nhưng tốn chỗ trên bàn và không nhận được buff của ụ Hỗ trợ thường (chúng buff ô kề). Hợp với: Resonance Grid (buff ô chéo), Overclock.


**— Hỗ trợ —**

### Cleanser — Máy Tẩy Lỗi · Sử thi · Hỗ trợ
- **Skill:** Không bắn. Cứ 12 giây quét 4 ô thẳng quanh mình và gỡ hiệu ứng xấu (đóng băng, hoá đá, cháy, bị kẹp, bị giảm tốc) cho tối đa 2 ụ. Nếu lượt đó không có gì để tẩy, các ụ tấn công/đặc biệt bên cạnh được +8% sát thương cho tới lượt quét sau.
- **Trên màn hình thấy gì:** đầu ụ quay chậm, xung sáng màu kem chạy tới các ô kề theo nhịp; vòng nạp sáng màu kem quanh bệ (đầy → quét). Khi tẩy: tia phép màu kem nối tới ụ được tẩy và một chữ thập trắng quét qua ụ đó. Chạm vào ụ: dây năng lượng tới 4 ô kề, khung góc sáng và nhãn "CLEANSE ×2 / 12s".
- **Khi nào biến đổi / kích hoạt:** mỗi chu kỳ nạp. Mốc: 3★ (mốc chung hỗ trợ) phần +sát thương ×1.45; 5★ DEEP CLEAN — quét mỗi 9 giây, tẩy tới 3 ụ; 7★ FRESH START — ụ vừa được tẩy +20% tốc bắn 4 giây.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | +Sát thương cho ụ kề (khi không có gì để tẩy) | +8% | +13.2% | +18.8% |
  | Chu kỳ quét · số ụ tẩy tối đa | 12 s · 2 | 12 s · 2 | 9 s · 3 |
  Cấp thẻ: LV6 → LV15: phần +sát thương ở 1★ tăng từ 8% lên 11.6% (+0.4% mỗi cấp) → 7★ tới +27.3%. Power-up: +6% độ mạnh buff mỗi bước. Buff sát thương hỗ trợ cộng chung bị trần 35%.
  Mạnh/yếu: vừa chống trùm khống chế vừa có buff sát thương lúc rảnh; buff nhỏ và chỉ tẩy theo nhịp, không chặn trước. Hợp với: Shield Gen, Gatling, Railgun.

### Shield Gen — Máy Khiên · Sử thi · Hỗ trợ
- **Skill:** Không bắn. Mỗi lần nạp đầy, phát cho mọi ụ ở 4 ô thẳng bên cạnh (kể cả ụ hỗ trợ, trừ ụ hoá đá) một tấm khiên chặn được 1 lần chiêu khống chế của trùm hoặc đòn phá của đối thủ PVP. Khiên không cộng dồn; khi mọi ụ kề đã có khiên thì máy giữ đầy chờ.
- **Trên màn hình thấy gì:** đầu ụ quay chậm, xung sáng xanh băng tới các ô kề; vòng nạp xanh băng quanh bệ. Khi phát khiên: tia phép xanh nối tới từng ụ và vòng sáng xanh nở ra trên ụ đó; ụ đang có khiên mang bong bóng khiên lục giác. Khi khiên đỡ đòn: khiên lục giác bung ra và chữ "BLOCKED". Chạm vào ụ: nhãn "SHIELD / 18s".
- **Khi nào biến đổi / kích hoạt:** theo chu kỳ sạc. Mốc riêng: 3★ QUICK CHARGE — 16 giây; 5★ FAST CHARGE — 14 giây; 7★ COUNTER SHIELD — 10 giây, và mỗi lần khiên đỡ được đòn thì ụ đó +20% tốc bắn 4 giây.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Thời gian sạc khiên | 18 s | 16 s | 10 s |
  | Số ô được che | 4 ô thẳng | 4 ô thẳng | 4 ô thẳng |
  Cấp thẻ: LV6 → LV15: thời gian sạc giảm 0.4 giây mỗi cấp, tổng −3.6 giây (1★ còn 14.4 s, 7★ còn 6.4 s). Power-up trong trận không làm khiên mạnh hơn.
  Mạnh/yếu: vô hiệu chiêu trùm và đòn phá PVP lên các ụ quý; không tăng sát thương chút nào. Hợp với: Cleanser, Railgun, Chain Link.

### Star Lift — Bệ Nâng Sao · Sử thi · Hỗ trợ
- **Skill:** Không bắn. Trong 4 ô thẳng bên cạnh, chọn 2 ụ tấn công/đặc biệt có SAO THẤP NHẤT và cho chúng +6% tốc bắn cho mỗi sao của Star Lift (tối đa 30%). Từ 5★ còn cho nấc sao: mỗi wave, ụ kề sao thấp nhất nhận 1 nấc, đủ nấc thì được +1★.
- **Trên màn hình thấy gì:** đầu ụ quay chậm, xung sáng vàng tới các ô kề; vòng nạp vàng quanh bệ. Khi nhận nấc: chữ "★ PIP 1/3" vàng trên ụ; đủ nấc: chữ "+1★" to, tia lửa và vòng sáng vàng, có thể kèm hiệu ứng SKILL UP nếu ụ đó chạm mốc. Chạm vào ụ: nhãn "+x% LOW-STAR RATE".
- **Khi nào biến đổi / kích hoạt:** buff tốc luôn bật; nấc sao trao mỗi khi sang wave mới (bắt đầu từ wave kế tiếp sau khi đạt 5★). Mốc riêng: 3★ LIFT — +18%; 5★ STAR PIP — 3 nấc = +1★; 7★ STAR SURGE — 2 nấc = +1★. Mỗi Star Lift chỉ nâng tối đa 2★ mỗi trận.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | +Tốc bắn cho 2 ụ kề sao thấp nhất | +6% | +24% | +30% |
  | Nấc sao cần cho +1★ | — | — | 2 (5★–6★: 3) |
  Cấp thẻ: LV6 → LV15: phần buff tăng từ ×1 lên ×1.45 (6% → 8.7% mỗi sao) → 7★ tới +43.5%. Power-up: +6% độ mạnh buff mỗi bước. Tốc bắn hỗ trợ cộng chung bị trần 45%.
  Mạnh/yếu: kéo ụ sao thấp theo kịp và còn tặng sao miễn phí; buff không theo đường cong hỗ trợ chung nên ở 5★ đã chạm 30%. Hợp với: Gatling, Scatter, Revolver.

### Reaper Pillar — Cột Tử Thần · Sử thi · Hỗ trợ
- **Skill:** Không bắn. Các ụ tấn công/đặc biệt ở 4 ô thẳng bên cạnh, mỗi phát trúng có xác suất GIẾT NGAY quái thường nếu máu quái sau phát đó còn dưới 30%. Trùm không bị giết ngay — chỉ nhận thêm một đòn nhỏ (tối đa 1% máu tối đa).
- **Trên màn hình thấy gì:** cột quay chậm, xung sáng tím tới các ô kề theo nhịp. Khi giết ngay: dấu chém trên quái kèm nhát lưỡi hái. Chạm vào ụ: dây năng lượng tới 4 ô kề, nhãn "x% INSTANT KILL".
- **Khi nào biến đổi / kích hoạt:** mỗi phát trúng của ụ kề. Mốc: 3★ (mốc chung hỗ trợ) ×1.45; 5★ DEEP REAP — ngưỡng máu nâng lên 40%; 7★ GRIM HARVEST — quái to cũng bị giết ngay khi dưới 15% máu.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Xác suất giết ngay mỗi phát | 8% | 13.2% | 15% (tính ra 18.8%, bị trần 15%) |
  | Ngưỡng máu quái thường | 30% | 30% | 40% (+ quái to 15%) |
  Cấp thẻ: LV6 → LV15: xác suất ở 1★ tăng từ 8% lên 11.6% (+0.4% mỗi cấp); từ khoảng 3★ trở lên đã chạm trần 15%. Power-up: +6% độ mạnh mỗi bước. Mọi nguồn giết ngay cộng chung bị trần 15%.
  Mạnh/yếu: cực hợp với ụ bắn nhanh nhiều phát; vô dụng với trùm và chạm trần sớm. Hợp với: Storm Gun, Gatling, Scatter.

### Focus Lens — Thấu Kính · Sử thi · Hỗ trợ
- **Skill:** Không bắn. 4 ụ kề (trên/dưới/trái/phải) được cộng sát thương chí mạng (chí mạng gốc ×2, cộng thêm phần này). Mỗi lần ụ kề chí mạng, đòn đó xuyên thêm sang quái phía sau trên cùng đường (trong 60 px) với 50% sát thương của đòn chí mạng.
- **Trên màn hình thấy gì:** đầu xoay chậm, cứ ~2.6 s phát xung xanh nhạt tới các ụ được buff. Khi chí mạng xuyên: tia xanh nhạt nối từ quái trúng sang quái phía sau. Chạm ụ: dây năng lượng tới ô kề, nhãn "+x% CRIT DMG · PIERCE".
- **Khi nào biến đổi / kích hoạt:** buff luôn bật; xuyên xảy ra mỗi lần ụ kề chí mạng (không áp cho đòn phụ như nổ lan). Mốc sao: 3★ buff ×1.45 · 5★ DOUBLE PIERCE: buff ×1.9, xuyên 2 quái · 7★ TRUE FOCUS: buff ×2.35, đòn xuyên gây 65%.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | +Sát thương chí mạng cho ụ kề | +14% | +23.1% | +32.9% |
  | Xuyên: số quái · % sát thương | 1 · 50% | 1 · 50% | 2 · 65% |
  Cấp thẻ: LV6 → LV15: buff gốc 1★ tăng từ +14% lên +19.4% (7★ ≈ +45.6%). Trần chung sát thương chí mạng từ hỗ trợ: +50%.
  Mạnh/yếu: rất mạnh với ụ hay chí mạng; ụ ít chí mạng thì gần như vô dụng. Không buff ụ Hỗ trợ khác. Hợp với: Crit Antenna, Berserker, Werewolf.


**— Đặc biệt —**

### Cloner — Máy Nhân Bản · Sử thi · Đặc biệt
- **Skill:** Bắn đạn nhẹ như ụ thường. Mỗi lần GHÉP có Máy Nhân Bản làm nguyên liệu, ngoài kết quả ghép còn được tặng thêm 1 ụ 1★ miễn phí (loại ngẫu nhiên trong bộ bài, đặt vào ô trống ngẫu nhiên).
- **Trên màn hình thấy gì:** đạn tia nhỏ. Khi ghép: vòng phù văn màu tím + biểu tượng Cloner bật lên ở ô ghép, một tia phép tím nối từ ô ghép sang ô vừa có ụ mới, ụ mới hiện ra với hiệu ứng triệu hồi.
- **Khi nào biến đổi / kích hoạt:** chỉ khi ghép, và chỉ khi bàn còn ô trống (bàn đầy thì không tặng). Mỗi lần ghép chỉ tặng 1 ụ. Ụ 7★ không ghép được nữa nên ở 7★ kỹ năng không còn dùng. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (Sử thi LV6, chưa power-up) | 13.5 | 47.9 | 107.0 |
  | Tốc bắn (phát/giây) | 1.1 | 1.32 | 1.32 |
  | Ụ tặng khi ghép | 1 ụ 1★ | 1 ụ 1★ | — (không ghép được) |
  Cấp thẻ: LV6 → LV15: chỉ tăng sát thương, +7% mỗi cấp, tới +63%.
  Mạnh/yếu: tiết kiệm mana triệu hồi, giúp bàn mau đầy để ghép tiếp; bản thân bắn yếu. Hợp với: Mimic, Twin Maker, Lighthouse.

### Jammer — Kẹp Phá · Sử thi · Đặc biệt
- **Skill:** Bắn đạn nhẹ như ụ thường. Khi GHÉP có Jammer làm nguyên liệu: ở PVP, kẹp những ụ tấn công sao cao nhất của đối thủ — chúng bắn chậm đi 40% trong vài giây (khiên chặn được). Ở CO-OP thì ngược lại: tăng tốc bắn cho ụ tấn công sao cao nhất của đồng đội; chơi SOLO thì tăng tốc cho ụ của chính mình.
- **Trên màn hình thấy gì:** đạn tia nhỏ. Khi ghép: vòng phù văn + biểu tượng Jammer bật lên ở ô ghép; tia phép tím bắn sang từng ụ đối thủ bị kẹp kèm chữ "CLAMPED"; ở CO-OP/SOLO là tia xanh lá sang ụ được tăng tốc, ụ đó có hào quang tốc bắn.
- **Khi nào biến đổi / kích hoạt:** chỉ khi ghép. Số ụ bị tác động = 1 + nửa số sao (làm tròn xuống) của Jammer đem ghép. Ụ 7★ không ghép được nữa nên 7★ không còn dùng kỹ năng. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (Sử thi LV6, chưa power-up) | 11.4 | 40.5 | 90.5 |
  | Tốc bắn (phát/giây) | 1.3 | 1.56 | 1.56 |
  | Khi ghép — PVP: số ụ bị kẹp · thời gian | 1 · 6 s | 3 · 9 s | — (6★ ghép: 4 · 11 s) |
  | Khi ghép — CO-OP/SOLO: tăng tốc · thời gian | +45% · 7 s | +60% · 10 s | — (6★ ghép: +70% · 12 s) |
  Cấp thẻ: LV6 → LV15: chỉ tăng sát thương, +7% mỗi cấp, tới +63%.
  Mạnh/yếu: phá nhịp đối thủ ở PVP ngay lúc ghép; tác dụng ngắn và cần ghép liên tục, bắn yếu. Hợp với: Mimic, Shield Gen, Gatling.

### Mystery Box — Hộp Bí Ẩn · Sử thi · Đặc biệt
- **Skill:** Không có súng thật. Đếm ngược 47 giây kể từ lúc hộp xuất hiện, rồi tự mở và biến thành 1 ụ ngẫu nhiên trong bộ bài (không ra Hộp Bí Ẩn) với số sao ngẫu nhiên 1–7★ — không phụ thuộc sao của hộp. Trong lúc chờ, hộp có "đòn chọc" yếu (khoảng 0.3 lần sức ụ thường).
- **Trên màn hình thấy gì:** 3 dạng: SEALED (0–70% thời gian) chọc 1 mảnh bài tím; UNSEALING (70–93%) bắn 3 tia "?" xoay vào 3 quái; ABOUT TO OPEN (93–100%) ngừng bắn, bắn pháo hoa nhiều màu. Hộp rung lắc ngày càng mạnh, có tia lửa tím bốc lên. Vòng nạp tím quanh bệ và vòng 3 cung quanh ụ chạy theo thời gian. Khi mở: màn biến hình ăn mừng ~0.75 giây, ụ mới hiện ra (kèm SKILL UP nếu đạt mốc 3/5/7★).
- **Khi nào biến đổi / kích hoạt:** hết giờ đếm ngược. Mốc riêng: 3★ QUICK OPEN — mở sớm 10 giây (37 s); 5★ LUCKY BOX — ra ít nhất 3★; 7★ JACKPOT — ra ít nhất 5★. Nếu đem hộp đi ghép thì chỉ ra ụ ngẫu nhiên như ghép thường.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Thời gian mở | 47 s | 37 s | 37 s |
  | Sao của ụ nhận được (đều ngẫu nhiên) | 1–7★ | 1–7★ | 5–7★ |
  | Đòn chọc (dạng 1) | 5.0 | 17.6 | 30.2 |
  Cấp thẻ: LV6 → LV15: thời gian mở giảm 1 giây mỗi cấp, tổng −9 giây (47 → 38 s; từ 3★: 37 → 28 s).
  Mạnh/yếu: hộp 1★ có thể nhảy thẳng lên 7★, rất lời; nhưng chiếm 1 ô gần như vô dụng trong lúc chờ và kết quả hên xui. Hợp với: Cloner, Lighthouse, Merge King.

### Scrambler — Máy Xáo Trộn · Sử thi · Đặc biệt
- **Skill:** Bắn đạn lửa hồng nhẹ như ụ thường. Khi GHÉP có Scrambler làm nguyên liệu: ở PVP, biến ngẫu nhiên vài ụ của đối thủ thành loại khác trong bộ bài của họ (giữ nguyên sao) để phá thế bàn; khiên chặn được. Ở CO-OP (bàn đồng đội) hoặc SOLO (bàn mình): tìm ụ "lẻ loi" không có bạn ghép và đổi nó thành cùng loại với một ụ cùng sao, tạo ra cặp ghép được.
- **Trên màn hình thấy gì:** đạn tia lửa màu hồng. Khi ghép: vòng phù văn + biểu tượng Scrambler bật lên; tia phép hồng nối sang từng ụ bị đổi, ụ đó bật nảy với vòng sáng, tia lửa và chớp sáng màu bậc của ụ mới.
- **Khi nào biến đổi / kích hoạt:** chỉ khi ghép. Số ụ bị đổi = 1 + nửa số sao (làm tròn xuống) của Scrambler đem ghép; CO-OP/SOLO ưu tiên ụ sao thấp trước, hết ụ lẻ thì dừng. 7★ không ghép được nữa nên không còn dùng kỹ năng. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (Sử thi LV6, chưa power-up) | 11.0 | 39.1 | 87.3 |
  | Tốc bắn (phát/giây) | 1.35 | 1.62 | 1.62 |
  | Số ụ bị đổi khi ghép | 1 | 3 | — (6★ ghép: 4) |
  Cấp thẻ: LV6 → LV15: chỉ tăng sát thương, +7% mỗi cấp, tới +63%.
  Mạnh/yếu: ở SOLO/CO-OP giúp bàn kẹt có thêm cặp ghép; ở PVP phá đội hình đối thủ nhưng hên xui. Bắn yếu. Hợp với: Mimic, Merge King, Cloner.

### Overclock — Bộ Ép Xung · Sử thi · Đặc biệt
- **Skill:** Bắn đạn nhẹ như ụ thường. Kéo Overclock thả lên một ụ khác CÙNG SAO (ụ có sát thương, không phải Overclock khác): Overclock biến mất và ụ kia được +65% tốc bắn vĩnh viễn (cộng dồn nếu ép nhiều lần). Ụ tự nạp nhịp (bão, xung…) cũng nạp nhanh hơn. Hiệu lực mất khi ụ đó đem đi ghép.
- **Trên màn hình thấy gì:** đạn tia nhỏ. Khi ép: Overclock bay sang ụ đích, ụ đích nảy lên và loé sáng, nổ tia điện lớn kèm tia lửa cam, bùng hào quang tốc bắn; sau đó ụ được ép mang biểu tượng/hào quang tăng tốc.
- **Khi nào biến đổi / kích hoạt:** khi người chơi kéo thả lên ụ cùng sao (ở mọi mức sao, kể cả 7★). Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát của chính nó (Sử thi LV6, chưa power-up) | 9.3 | 32.9 | 73.5 |
  | Tốc bắn của chính nó (phát/giây) | 1.6 | 1.92 | 1.92 |
  | Tốc bắn tặng ụ được ép (vĩnh viễn) | +65% | +65% | +65% |
  Cấp thẻ: LV6 → LV15: phần ép xung tăng từ +65% lên +87.5% (+2.5% mỗi cấp), và còn +7% sát thương mỗi cấp (tới +63%).
  Mạnh/yếu: biến 1 ụ chủ lực thành máy bắn cực nhanh; phải hy sinh Overclock và ụ cùng sao, ghép ụ đó thì mất buff. Hợp với: Sniper, Fifth Shot, Blizzard.

### Chrono Lock — Khoá Thời Gian · Sử thi · Đặc biệt
- **Skill:** Cứ mỗi chu kỳ, ụ khoá quái đi đầu (ưu tiên quái không phải trùm) vào một ô thời gian: quái đứng yên. Mọi sát thương nó nhận lúc bị khoá được dồn lại; hết giờ (hoặc khi nó chết), kính vỡ và nổ ra một phần lượng đã dồn vào quái đó và quái trong 40 px. Trùm chỉ bị khoá nửa thời gian và nổ nửa lượng. Ngoài ra ụ vẫn bắn đạn băng thường.
- **Trên màn hình thấy gì:** lồng kính bát giác có mặt đồng hồ bao quanh quái, vành xanh ngọc ngắn dần và kim trắng quay, số giây còn lại hiện trên đầu quái. Khi mở khoá: kính vỡ, vòng sáng xanh ngọc, chữ "TIME BURST <số>". Quanh bệ ụ có vòng nạp màu xanh ngọc đầy dần.
- **Khi nào biến đổi / kích hoạt:** tự khoá mỗi chu kỳ; mỗi ụ chỉ khoá 1 quái một lúc (đang khoá thì ngừng nạp). Khi GHÉP 2 Chrono Lock: khoá ngay 1 quái (theo sao của ụ mới). Quái bị khoá được tính là "đang bị chậm"; quái kháng chậm vẫn bị khoá. Mốc sao: 3★ QUICK HANDS +20% tốc (cả nhịp khoá) · 5★ DOUBLE TAP · 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Khoá mỗi · giữ trong | 9 s · 1.2 s | 6.25 s · 1.8 s | 5 s · 2.5 s |
  | Nổ ra (phần sát thương đã dồn) | 30% | 45% | 75% |
  | Sát thương đạn thường (LV đầu) · tốc bắn | 16.5 · 0.8/s | 58.6 · 0.96/s | 130.8 · 0.96/s |
  Cấp thẻ: LV6 → LV15: sát thương +7% mỗi cấp, tới +63% (chỉ đạn thường; vụ nổ tính theo sát thương các ụ khác dồn vào).
  Mạnh/yếu: rất hợp với đội nhiều ụ sát thương bắn quái đầu; tự mình sát thương thấp. Hợp với: Ice Blade, Sniper, Hydra.

### Signal Jammer — Máy Nhiễu Sóng · Sử thi · Đặc biệt
- **Skill:** Bình thường bắn đạn tím. Khi GHÉP 2 Signal Jammer, tác dụng tuỳ chế độ (tính theo sao của ụ mới ra): PVP — báo trước 0.65 s rồi gây NHIỄU vài ụ đối thủ (−40% tốc bắn trong vài giây) và lần triệu hồi kế của đối thủ đắt thêm mana. Co-op — lần triệu hồi kế của đồng đội MIỄN PHÍ và mọi ụ có sát thương của đồng đội +10% tốc bắn. Solo — mọi quái chậm 20%.
- **Trên màn hình thấy gì:** tia phép tím bay từ ô vừa ghép tới các ụ đối thủ bị nhắm; sau đó chữ tím "JAMMED" trên các ụ đó. Co-op: tia tím sang bàn đồng đội, lúc họ triệu hồi hiện chữ "FREE". Solo: màn hình lóe tím.
- **Khi nào biến đổi / kích hoạt:** chỉ khi ghép. PVP: ụ vừa bị nhiễu được miễn nhiễm thêm 8 s; bỏ qua ụ đang dính hiệu ứng xấu; khiên / Mirror Gate có thể chặn. Mốc sao: 3★ QUICK HANDS +20% tốc bắn · 5★ DOUBLE TAP · 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương đạn thường (LV đầu) · tốc bắn | 18.2 · 1/s | 64.4 · 1.2/s | 143.9 · 1.2/s |
  Khi ghép, theo sao ụ mới ra (2★ / 5★ / 7★): số ụ bị nhiễu 1 / 3 / 4 · thời gian 3.5 / 5 / 6 s · đối thủ triệu hồi đắt thêm +5 / +15 / +20 mana (thời gian này cũng dùng cho tăng tốc co-op và làm chậm solo).
  Cấp thẻ: LV6 → LV15: sát thương +7% mỗi cấp, tới +63% (không đổi hiệu ứng nhiễu).
  Mạnh/yếu: rất khó chịu trong PVP, hữu ích trong co-op; ở solo chỉ là làm chậm ngắn, sát thương yếu. Hợp với: Mimic, Cloner, Mirror Gate.

### Bounty Beacon — Đèn Săn Thưởng · Sử thi · Đặc biệt
- **Skill:** Cứ mỗi chu kỳ, gắn TRUY NÃ lên vài quái chưa bị gắn (ưu tiên quái to, rồi quái nhiều máu). Quái truy nã nhận thêm 10% sát thương từ mọi ụ (chung trần suy yếu 25%), và khi chết (do bất kỳ ụ nào giết) bạn được thêm mana; trùm cho ×5. Dấu giữ tới khi quái chết. Ụ vẫn bắn đạn thường.
- **Trên màn hình thấy gì:** huy hiệu "$" trên đầu mỗi quái bị truy nã; tia vàng từ nòng tới quái lúc gắn dấu; khi quái chết hiện chữ vàng "+n BOUNTY". Quanh bệ có vòng nạp màu vàng cam.
- **Khi nào biến đổi / kích hoạt:** mỗi 5 s (chia cho tốc; từ 3★ là ~4.2 s), chỉ gắn khi có quái chưa bị gắn. Co-op: mana thưởng chia đôi cho 2 bàn. PVP: chỉ làn mình. Mốc sao: 3★ QUICK HANDS +20% tốc (cả nhịp gắn dấu) · 5★ DOUBLE TAP · 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Số quái gắn mỗi lần · gắn mỗi | 1 · 5 s | 2 · 4.2 s | 3 · 4.2 s |
  | Mana mỗi quái truy nã chết (trùm ×5) | +2 | +4 | +6 |
  | Sát thương đạn thường (LV đầu) · tốc bắn | 16.5 · 1/s | 58.6 · 1.2/s | 130.8 · 1.2/s |
  Cấp thẻ: LV6 → LV15: sát thương +7% mỗi cấp, tới +63% (mana thưởng không đổi).
  Mạnh/yếu: nuôi mana để power-up và triệu hồi, giúp cả đội đánh quái to; tự gây sát thương thấp. Hợp với: Nemesis, Sniper, Energy Cannon.


---

## Ụ HUYỀN THOẠI (VÀNG)


**— Tấn công —**

### Purifier — Pháo Thanh Tẩy · Huyền thoại · Tấn công
- **Skill:** Bắn tia đơn chậm. Phát trúng quái đang trúng độc (độc vũng/độc lây, hoặc dấu độc của Venom) gây ×4 sát thương. Ụ ưu tiên nhắm quái trúng độc. Quái nào bị nó giết sẽ nổ lan ×2 sát thương ra quái xung quanh.
- **Trên màn hình thấy gì:** tia sáng bay thẳng tới quái; trúng quái độc thì nổ tia xanh lá to, quái thường thì tóe điện vàng nhỏ. Khi giết: vụ nổ pháo vàng, vòng sóng vàng lan ra, màn hình rung nhẹ, chữ nổi "PURIFY" trên ụ.
- **Khi nào biến đổi / kích hoạt:** mỗi phát bắn / mỗi lần giết. Mốc riêng: 3★ BIG BANG — vụ nổ khi giết rộng 70 px (thay vì 50 px); 5★ TOXIC BLAST — vụ nổ còn tẩm độc quái xung quanh 3 giây (để phát sau ăn ×4); 7★ PURGE — quái trúng độc nhận ×6 thay vì ×4. Không có mốc chung (không có QUICK HANDS/APEX).
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (Huyền thoại LV9, chưa power-up) | 46.5 | 165.1 | 283.7 |
  | Vào quái trúng độc (×4, 7★ ×6) | 186 | 660 | 1702 |
  | Tốc bắn (phát/giây) | 0.65 | 0.65 | 0.65 |
  Cấp thẻ: LV9 → LV15: chỉ tăng sát thương, +10% mỗi cấp, tới +60%.
  Mạnh/yếu: cực mạnh khi có nguồn độc ổn định, nhưng bắn rất chậm và không có độc thì chỉ là một ụ bắn chậm bình thường. Hợp với: Venom, Toxic Pool.

### Railgun — Railgun · Huyền thoại · Tấn công
- **Skill:** Ngắm quái đầu, nạp ~0,4 giây rồi bắn tia xuyên thẳng dài, trúng MỌI quái nằm trên đường tia. BINGO: nếu cả HÀNG NGANG (5 ô) đều là Railgun → mỗi Railgun trong hàng +200% sát thương; cả CỘT DỌC (3 ô) đều là Railgun → +150% tốc bắn. Ô đá không tính; hàng chưa đầy không được gì.
- **Trên màn hình thấy gì:** lúc nạp có đường ngắm xanh ngọc chạy từ nòng và đốm sáng lớn dần ở nòng; rồi tia xuyên sáng chói lóe qua màn, chớp điện ở mỗi quái trúng, nòng giật mạnh, màn rung. Có bộ đếm nhỏ trên ô (biểu tượng sát thương "n/5", tốc bắn "n/3") khi đã có từ 2 Railgun cùng hàng/cột; đủ BINGO thì cả hàng/cột lóe vàng kèm tiếng. Chạm Railgun thấy vệt sáng dọc hàng và cột của nó.
- **Khi nào biến đổi / kích hoạt:** bắn tự động. BINGO bật/tắt ngay khi xếp đủ/thiếu. Mốc chung (loại tự quản nhịp): 3★ QUICK HANDS +20% tốc bắn; 5★ OVERCHARGE +25% sát thương; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương mỗi tia (mỗi quái trên đường) | 147 | 522 | 1457 |
  | Tốc bắn (phát/giây) | 0.33 | 0.40 | 0.40 |
  | Có BINGO: sát thương hàng (+200%) / tốc bắn cột (+150%) | 441 / 0.83 | 1566 / 0.89 | 4371 / 0.89 |
  Cấp thẻ: LV9 → LV15: +10% sát thương mỗi cấp, tới +60%.
  Mạnh/yếu: tia xuyên cực nặng, BINGO cực mạnh; cần nhiều Railgun xếp đúng hàng/cột, một con lẻ thì bắn chậm. Hợp với: Venom, Merge King, Mimic.

### Star Cannon — Pháo Ngôi Sao · Huyền thoại · Tấn công
- **Skill:** Đếm TỔNG SAO của mọi ụ đang có trên bàn mình. Mỗi mốc 10 đã qua (10, 20, 30, 40, 60…) +10% tốc bắn; mỗi mốc 50 đã qua +50% sát thương. Khi tổng sao ĐÚNG BẰNG mốc: mốc tốc thêm +100% tốc bắn, mốc 50 thêm +350% sát thương. Tổng sao giảm thì thưởng mất theo.
- **Trên màn hình thấy gì:** tấm đếm ở đáy ô "tổng/mốc kế" với biểu tượng tốc hoặc sát thương, thành chữ vàng khi đứng đúng mốc. Ụ grow-up 3 dạng: SPARK (dưới 10★) bắn mảnh sao nhỏ; NOVA (từ 10★) bắn cặp mảnh sao có vệt lấp lánh; SUPERNOVA (từ 50★) bắn sao chổi, nổ hình ngôi sao, cứ phát thứ 5 gọi THIÊN THẠCH rơi vào quái nhiều máu nhất (×1.2, nổ lan, chữ "METEOR"). Đứng đúng mốc: 3 quả cầu vàng (mốc tốc) hoặc 5 quả cầu (mốc 50) quay quanh ụ, đầu súng sáng.
- **Khi nào biến đổi / kích hoạt:** tính lại liên tục theo sao trên bàn. Mốc chung của ụ bắn: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP — cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (Huyền thoại LV9, chưa power-up, chưa tính sao bàn) | 26.7 | 94.9 | 212.0 |
  | Tốc bắn gốc (phát/giây) | 1.1 | 1.32 | 1.32 |
  | Ví dụ tổng sao bàn: 40★ · 45★ · 50★ | +140% tốc · +40% tốc · +40% tốc và +400% sát thương | ← | ← |
  Cấp thẻ: LV9 → LV15: mọi thưởng mốc ×100% → ×130%, và sát thương +10% mỗi cấp (tới +60%).
  Mạnh/yếu: bùng nổ khi canh tổng sao đúng 50 hoặc 100; mất thưởng ngay khi bị cướp/giảm sao. Hợp với: Twin Maker, Merge King, Star Lift.

### Werewolf — Sói Máy · Huyền thoại · Tấn công
- **Skill:** Sói đánh cận chiến (tầm 108 px), vồ quái đi đầu trong tầm, mỗi đòn còn tóe sát thương nhỏ ra quái sát bên. Mỗi lần GỌI hoặc GHÉP ra Sói, game quay 1 lần để chọn dạng và giữ suốt đời ụ:
  · **Dạng thường (~70%)**: 2 nhát chém chéo chữ X, mỗi nhát 50% sát thương, tóe 22 px; chí mạng như ụ thường (10%).
  · **Dạng THỨC TỈNH (30% ở LV9, +1,5% mỗi cấp thẻ → 39% ở LV15)**: MỌI đòn đều chí mạng (×2), +40% tốc đánh, 2 nhát mỗi nhát 55%, tóe rộng 32 px, cứ đòn thứ 4 lướt tới mục tiêu, hú mỗi 7 giây (chỉ để báo, không có tác dụng thêm).
- **Trên màn hình thấy gì:** đầu sói đổi theo dạng (thường / thức tỉnh). Bản thường: vệt vuốt chéo màu cam. Bản thức tỉnh: hào quang thức tỉnh lặp, đầu đỏ chớp, tàn lửa đỏ bay lên, 3 vệt vuốt đỏ thẫm, bóng sói đỏ khi lướt, 3 vòng sóng âm khi hú, có tiếng "thức tỉnh" lúc vừa ra. Không có vòng đếm tiến độ vì dạng không đổi.
- **Khi nào biến đổi / kích hoạt:** chỉ lúc ụ sinh ra (gọi/ghép); Copycat sao chép giữ nguyên dạng. Mốc riêng: 3★ KEEN FANGS +10% chí mạng; 5★ FERAL +25% sát thương; 7★ ALPHA HOWL — các ụ ở 4 ô kề +25% tốc bắn. Không có mốc chung.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương mỗi lượt đánh, dạng thường (LV9, chưa power-up, chưa chí mạng) | 35.7 | 126.7 | 272.2 |
  | Sát thương mỗi lượt, dạng thức tỉnh (luôn chí mạng) | 78.5 | 278.8 | 599 |
  | Tốc đánh thường · thức tỉnh (lượt/giây) | 1.8 · 2.52 | 1.8 · 2.52 | 1.8 · 2.52 |
  Cấp thẻ: LV9 → LV15: tỉ lệ thức tỉnh 30% → 39%, và sát thương +10% mỗi cấp (tới +60%).
  Mạnh/yếu: bản thức tỉnh là một trong những ụ sát thương cao nhất, nhưng phụ thuộc may rủi và phải đặt gần đường vì tầm ngắn. Hợp với: Hammer, Copycat, Star Breaker.

### Wall Projector — Máy Dựng Tường · Huyền thoại · Tấn công
- **Skill:** Định kỳ dựng một bức tường ánh sáng chắn ngang đường ngay trước quái đầu, giữ quái lại, hết giờ thì tường nổ (×7 sát thương, vùng 58 px). Khi GHÉP Máy Dựng Tường → dựng TƯỜNG VÀNG trước quái đầu: đứng 6 giây, nổ mạnh gấp 6 lần tường thường của sao kế tiếp, vùng 84 px.
- **Trên màn hình thấy gì:** vòng nạp sáng xanh ngọc quanh bệ; tia sáng từ nòng chiếu tới tường; tường là dải điện xanh ngọc ngang đường với 2 cột sáng ở mép, sắp nổ thì nhấp nháy; nổ điện + lửa, vòng sóng, rung màn. Tường vàng: tấm tường vàng lớn, lóe vàng khi xuất hiện, nổ to với 2 vòng vàng, tia lửa và chớp màn.
- **Khi nào biến đổi / kích hoạt:** nạp xong và có quái thì dựng tường (không dựng tường mới khi tường cũ còn). Buff tốc bắn làm nạp nhanh hơn. Tường vàng khi ghép (kể cả ghép với Mimic). Mốc chung (loại tự quản nhịp): 3★ QUICK HANDS +20% tốc nạp; 5★ OVERCHARGE +25% sát thương; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương nổ tường (58 px) | 382 | 1357 | 3789 |
  | Chu kỳ dựng · thời gian đứng | 8.6 s · 2.7 s | 6.2 s · 3.6 s | 5.2 s · 4.5 s |
  Tường vàng khi ghép 2 con 1★: khoảng 4240 sát thương.
  Cấp thẻ: LV9 → LV15: +10% sát thương mỗi cấp, tới +60%.
  Mạnh/yếu: vừa chặn vừa nổ to, gom quái lại cho ụ nổ lan; chu kỳ dài, quái bay qua nhanh lúc tường chưa sẵn. Hợp với: Cannon, Black Hole, Mortar.

### Hydra — Hydra · Huyền thoại · Tấn công
- **Skill:** Số nòng = số sao (tối đa 6). Mỗi loạt, mỗi nòng bắn một quái KHÁC nhau (ưu tiên quái gần lối ra), mỗi nòng 55% sát thương. Ở 7★ sáu nòng nhập làm một: bắn tia khổng lồ xuyên mọi quái trên một đường thẳng, mỗi quái nhận ×6 sát thương, nhưng bắn chậm.
- **Trên màn hình thấy gì:** 1–3★ các nòng bắn kim ngọc lục bay; 4–6★ quạt kim xanh ngọc bắn tức thì, so le nhau, mỗi chỗ trúng để lại dấu ấn lục giác; 7★ tia trắng lõi, quầng xanh ngọc to, phù văn lục giác dọc tia, rung màn hình, chớp xanh và một cảnh đặc biệt (đầu rồng hợp nhất). Có vòng 3 cung quanh ụ báo dạng.
- **Khi nào biến đổi / kích hoạt:** đổi dạng theo sao: 1–3★ (HATCHLING) / 4–6★ (MANY HEADS) / 7★ (FUSED HEAD, có hoạt ảnh biến hình). Mốc sao: 3★ QUICK HANDS +20% tốc bắn (cũng làm tia 7★ nhanh hơn) · 5★ DOUBLE TAP · 7★ FUSED HEAD (thay cho APEX: không có +30% sát thương).
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương mỗi nòng (LV đầu) · số nòng | 17.3 · 1 | 61.5 · 4 | — |
  | Tia hợp đầu 7★ (mỗi quái trên đường) | — | — | 1152.9 |
  | Tốc bắn | 1.2 loạt/s | 1.44 loạt/s | 0.72 tia/s |
  Cấp thẻ: LV9 → LV15: sát thương +10% mỗi cấp, tới +60%.
  Mạnh/yếu: 4–6★ dọn đàn quái rất tốt; 7★ cực mạnh khi quái xếp hàng thẳng nhưng bắn chậm và phải xoay đúng hướng. Hợp với: Radar, Crit Antenna, Chrono Lock.

### Nine-Tail — Cửu Vĩ · Huyền thoại · Tấn công
- **Skill:** Mỗi quái chính phát bắn thường của ụ này giết được → mọc 1 đuôi lửa; mỗi đuôi +5% tốc bắn. Đủ 9 đuôi → xả 9 cầu lửa hồ ly tự dẫn đường vào các quái nhiều máu nhất (mỗi quả rất mạnh), rồi về 0 đuôi. Với trùm: cứ gây được 8% máu tối đa của trùm thì +1 đuôi.
- **Trên màn hình thấy gì:** 9 ngọn lửa nhỏ xếp vòng tròn quanh bệ, ngọn nào sáng là đã có đuôi (màu cam; 7★ màu xanh trắng). Đáy ô có tấm "n/9". Khi xả: 9 cầu lửa bung ra thành vòng rồi uốn lượn lao vào quái, có vệt lửa, nổ khi trúng. Đạn thường: 1 cầu lửa cam bay thẳng; từ 5 đuôi đạn bay uốn lượn có vệt lửa; 7★ đạn xanh trắng uốn lượn nổ vòng nhỏ 26 px (thêm 35% sát thương quanh đó). Có vòng 3 cung quanh ụ.
- **Khi nào biến đổi / kích hoạt:** dạng: 0–4 đuôi / 5–8 đuôi (đuôi rực lửa) / 7★ (NINE-TAIL). Cầu lửa hồ ly không tính để mọc đuôi. Nếu ghép 2 Nine-Tail mà ra lại Nine-Tail thì giữ số đuôi cao hơn (tối đa 8). Mốc sao: 3★ QUICK HANDS +20% tốc bắn · 5★ TWIN TAILS: 20% lần giết mọc 2 đuôi · 7★ NINE-TAIL: cầu lửa xanh trắng nổ lan 40 px, sau khi xả còn lại 3 đuôi (không có DOUBLE TAP / APEX).
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương đạn thường (LV đầu) | 33.6 | 119.3 | 205.0 |
  | Mỗi cầu lửa (×9 quả) | 84 (×2.5) | 477.1 (×4) | 1127.4 (×5.5, nổ 40 px) |
  | Tốc bắn (0 → 8 đuôi) | 1.2 → 1.68 | 1.44 → 1.92 | 1.62 → 1.92 |
  Cấp thẻ: LV9 → LV15: sát thương +10% mỗi cấp, tới +60%.
  Mạnh/yếu: mạnh trong màn nhiều quái nhỏ dễ giết; đứng sau ụ khác "cướp" mạng thì chậm mọc đuôi. Hợp với: Armor Breaker, Radar, Overclock.

### Nemesis — Nữ Thần Phán Xử · Huyền thoại · Tấn công
- **Skill:** Luôn bắn quái nhiều máu nhất. Mỗi phát cộng thêm một % máu tối đa của quái (với trùm tối đa 0.8%). Quái thường (không phải quái to/trùm) còn dưới ngưỡng máu → XỬ TỬ ngay. Với trùm: cứ 10 phát trúng → PHÁN QUYẾT, gây thêm một % lớn máu tối đa (cách nhau ít nhất 2 s).
- **Trên màn hình thấy gì:** tia đỏ thẫm từ nòng tới quái. Khi xử tử: nhát chém, chữ đỏ "JUDGED". Khi phán quyết trùm: nhát chém lớn và rung màn hình. 7★: tia đỏ nhảy từ quái bị xử tử sang quái kế bên. Có vòng 3 cung quanh ụ; đầu súng đổi dạng theo sao.
- **Khi nào biến đổi / kích hoạt:** mỗi phát. Dạng theo sao: 1–3★ (SCALES) / 4–6★ (SCYTHE) / 7★ (VERDICT). Mốc sao: 3★ QUICK HANDS +20% tốc bắn · 5★ DOUBLE TAP · 7★ REAPER LEAP: xử tử xong nhảy sang quái gần nhất (trong 110 px) đánh thêm 1 phát (không có APEX).
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương 1 phát (LV đầu, chưa tính % máu) | 54.6 | 193.8 | 333.1 |
  | + máu tối đa mỗi phát · ngưỡng xử tử | 0.3% · 8% | 0.6% · 11% | 1.2% · 15% |
  | Phán quyết trùm (mỗi 10 phát) | 2% | 3.5% | 6% |
  | Tốc bắn | 0.8/s | 0.96/s | 0.96/s |
  Cấp thẻ: LV9 → LV15: sát thương +10% mỗi cấp, tới +60%.
  Mạnh/yếu: khắc chế quái trâu và trùm; bắn chậm nên kém khi quái nhỏ đông. Hợp với: Armor Breaker, Venom, Crit Antenna.

### Eclipse — Nhật Thực · Huyền thoại · Tấn công
- **Skill:** Tự đổi chế độ mỗi 8 s. NGÀY: tia nóng vào quái đầu, sát thương nhân lên và làm quái CHÁY 4 s. ĐÊM: sóng trăng hình nón (dài hơn mục tiêu 100 px) đánh mọi quái trong nón 60% sát thương và làm chậm 25% trong 2 s. Có 2 Eclipse thì chúng tự lệch pha (một ngày, một đêm).
- **Trên màn hình thấy gì:** quanh bệ có 2 nửa vòng: nửa vàng (ngày) và nửa xanh (đêm), nửa nào sáng là chế độ đang bật; mỗi lần đổi có vòng sáng vàng/xanh. Ngày: tia vàng, than hồng bay lên trên quái đang cháy. Đêm: lưỡi liềm trăng nở ra theo hướng bắn. 7★: lúc đổi cả 2 nửa cùng sáng, có vụ nổ vòng sáng vàng nhạt quanh quái đầu. Có vòng 3 cung quanh ụ.
- **Khi nào biến đổi / kích hoạt:** đổi ngày/đêm mỗi 8 s (không bị tốc bắn ảnh hưởng). Dạng theo sao: 1–3★ (DUSK) / 4–6★ (CORONA) / 7★ (TOTAL ECLIPSE). Mốc sao: 3★ QUICK HANDS +20% tốc bắn · 5★ DOUBLE TAP · 7★ TOTAL ECLIPSE: mỗi lần đổi, 1.5 s bật cả 2 chế độ + nổ vòng ×4 (50 px) quanh quái đầu (không có APEX).
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Ngày: tia (LV đầu) · tổng cháy 4 s | 47.3 (×1.5) · 50.4 | 201.2 (×1.8) · 178.9 | 480.5 (×2.5) · 307.5 |
  | Đêm: mỗi quái trong nón | 18.9 | 67.1 | 115.3 |
  | Tốc bắn · nổ đổi chế độ 7★ | 0.9/s · — | 1.08/s · — | 1.08/s · 768.8 |
  Cấp thẻ: LV9 → LV15: sát thương +10% mỗi cấp, tới +60%.
  Mạnh/yếu: vừa dồn sát thương vừa làm chậm đàn; nhưng mỗi lúc chỉ mạnh một kiểu, phải chịu nhịp 8 s. Hợp với: Ice Blade, Cryo Reactor, Amplifier.

### Ember Relay — Lửa Tiếp Sức · Huyền thoại · Tấn công
- **Skill:** Bắn đạn lửa. Mỗi lần GHÉP có Ember Relay (Relay + Relay, hoặc Mimic + Relay) → mọi Ember Relay ở 4 ô kề (trên/dưới/trái/phải) của ô ghép, và ụ vừa ghép ra nếu cũng là Ember Relay, nhận +1 LỬA (tối đa 5 lửa/ụ). Mỗi lửa +12% sát thương và +3% chí mạng, giữ mãi trên ụ đó. Ụ vừa nhận lửa còn +15% tốc bắn trong 5 s.
- **Trên màn hình thấy gì:** lúc ghép: vòng lửa bung ở ô ghép, ngọn lửa nhỏ bay thẳng sang từng Relay kề, ụ nhận lửa loé sáng + biểu tượng tăng sát thương. Trên ụ: ngọn lửa ở 4 nhánh chữ thập (1–4 lửa), đủ 5 lửa thì thêm ngọn lửa lớn ở giữa. Đạn to dần theo số lửa. Đáy ô có bộ đếm "n/5". Vòng 3 cung quanh ụ màu cam (COLD RELAY → KINDLED → FULL BLAZE), dạng 3 có hào quang thức tỉnh.
- **Khi nào biến đổi / kích hoạt:** chỉ khi ghép (xếp các Relay thành hình chữ thập để chia lửa cho nhiều ụ). Đổi dạng: 0 lửa = COLD RELAY, 1–4 lửa = KINDLED, 5 lửa = FULL BLAZE. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (chưa tính lửa) | 36 | 127 | 283 |
  | Tốc bắn (phát/giây) | 1 | 1.2 | 1.2 |
  | 5 lửa (LV9) | +60% sát thương, +15% chí mạng | như 1★ | như 1★ |
  Cấp thẻ: LV9 → LV15: mỗi lửa +12% → +18% sát thương (5 lửa: +60% → +90%), kèm +10% sát thương mỗi cấp (tới +60%).
  Mạnh/yếu: rất mạnh khi xếp nhiều Relay cạnh nhau; lửa mất khi chính ụ đó bị đem ghép, cần giữ ụ đứng yên. Hợp với: Mimic, Crit Antenna, Hammer.

### Quantum Choir — Hợp Xướng Lượng Tử · Huyền thoại · Tấn công
- **Skill:** Bắn đạn tím. Đếm số ụ KHÁC trên bàn mình có CÙNG SỐ SAO với nó (mọi loại, không tính ô đá, tối đa 7): mỗi ụ khớp +18% sát thương. Ở 7★ thêm +12% tốc bắn. Co-op: ụ bàn đồng đội không tính.
- **Trên màn hình thấy gì:** đạn tím, chỗ trúng có vòng nhỏ to dần theo số ụ khớp. Đáy ô có bộ đếm "×n" (biểu tượng sát thương), sáng lên khi đủ 7. Mỗi khi số ụ khớp tăng: hiệu ứng tím loé quanh ụ (dải 16 khung).
- **Khi nào biến đổi / kích hoạt:** tự động, cập nhật liên tục theo bàn — ghép/đổi sao các ụ khác làm số ụ khớp lên xuống. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng (cộng +12% tốc bắn riêng). Không đổi dạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (chưa tính ụ khớp) | 32 | 112 | 250 |
  | Tốc bắn (phát/giây) | 1 | 1.2 | 1.32 |
  | 7 ụ khớp (LV9 → LV15) | +126% → +210% | như 1★ | như 1★ |
  Cấp thẻ: LV9 → LV15: mỗi ụ khớp +18% → +30% sát thương, kèm +10% sát thương mỗi cấp (tới +60%).
  Mạnh/yếu: cực mạnh khi bàn có nhiều ụ cùng sao; yếu khi sao trên bàn lệch nhau, càng lên sao cao càng khó có ụ khớp. Hợp với: Sync Cannon, Genesis Core, Star Lift.

### Fusion Archive — Kho Lưu Hợp Nhất · Huyền thoại · Tấn công
- **Skill:** Bắn đạn xanh nhạt. MỌI lần ghép thành công trên bàn mình (ghép gì cũng được) → mọi Fusion Archive đang có +1 ĐIỂM LƯU (tối đa 40), mỗi điểm +2.5% sát thương. Archive mới xuất hiện nhận sẵn một nửa tổng số lần ghép của trận. Ghép Archive + Archive → 3 xung nổ (cách nhau 0.25 s, bán kính 45 px) vào chỗ quái đông nhất, mỗi xung 160% sát thương.
- **Trên màn hình thấy gì:** đạn xanh nhạt + tia lửa nhỏ khi trúng; đáy ô có số điểm lưu (sáng khi đủ 40). Vòng 3 cung quanh ụ màu xanh băng (EMPTY SHELVES → FILING → GRAND ARCHIVE), dạng 3 có hào quang thức tỉnh. Xung nổ: 3 lần nổ xanh (dải 16 khung) + rung màn.
- **Khi nào biến đổi / kích hoạt:** điểm lưu tăng mỗi lần bạn ghép; xung nổ khi ghép 2 Archive. Đổi dạng: 0–9 điểm EMPTY SHELVES, 10–29 FILING, 30–40 GRAND ARCHIVE. Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (chưa tính điểm lưu) | 32 | 112 | 250 |
  | Tốc bắn (phát/giây) | 1 | 1.2 | 1.2 |
  | 40 điểm lưu (LV9 → LV15) | +100% → +160% | như 1★ | như 1★ |
  Cấp thẻ: LV9 → LV15: mỗi điểm lưu +2.5% → +4% sát thương, kèm +10% sát thương mỗi cấp (tới +60%).
  Mạnh/yếu: cuối trận rất mạnh vì ghép nhiều; đầu trận yếu, và điểm lưu của ụ bị đem ghép thì mất. Hợp với: Twin Maker, Mystery Box, Genesis Core.

### Prism Thief — Siêu Trộm Lăng Kính · Huyền thoại · Tấn công
- **Skill:** Mỗi 3 s đạn tự đổi màu: ĐỎ (đốt cháy 3 s) → VÀNG (+40% chí mạng) → XANH (làm chậm 25% trong 1.5 s). Ghép 2 Prism Thief đang CÙNG MÀU → +1 COMBO (chung cả bàn): mỗi COMBO cho mọi Prism Thief +6% sát thương và +4% tốc bắn. Tối đa 10 COMBO (15 nếu trên bàn có Prism Thief 5★).
- **Trên màn hình thấy gì:** quầng sáng sau đầu súng mang màu đạn hiện tại (đỏ/vàng/xanh) đập nhịp nhẹ; đạn lăng kính bay tới quái. Ghép cùng màu: vòng sáng màu đó + nổ lăng kính (dải 16 khung).
- **Khi nào biến đổi / kích hoạt:** màu đổi tự động mỗi 3 s (mỗi ụ lệch nhịp khác nhau) — muốn có COMBO thì canh ghép lúc 2 ụ cùng màu. Mốc: 3★ QUICK HANDS +20% tốc bắn; 5★ MASTER THIEF trần COMBO 15; 7★ FULL SPECTRUM mỗi phát mang cả 3 màu (đốt + chí mạng + chậm). Không đổi dạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (chưa tính COMBO) | 32 | 112 | 192 |
  | Tốc bắn (phát/giây, chưa tính COMBO) | 1 | 1.2 | 1.2 |
  | COMBO tối đa → sát thương / tốc bắn | 10 → +60% / +40% | 10 (15 nếu có ụ 5★) | 15 → +90% / +60% |
  Cấp thẻ: LV9 → LV15: mỗi COMBO +6% → +9% sát thương (15 COMBO: tới +135%), kèm +10% sát thương mỗi cấp (tới +60%).
  Mạnh/yếu: càng ghép đúng màu càng mạnh, 7★ có đủ 3 hiệu ứng; cần nhiều bản Prism Thief và canh màu. Hợp với: Crit Antenna, Hammer, Focus Lens.


**— Hỗ trợ —**

### Sync Cannon — Pháo Đồng Bộ · Huyền thoại · Hỗ trợ
- **Skill:** Không bắn. Tăng sát thương cho MỌI ụ Tấn công trên cả bàn có CÙNG SỐ SAO với nó (không cần đứng kề). Nhiều Pháo Đồng Bộ thì mỗi ụ chỉ nhận bản mạnh nhất. Trong PVP, ụ của đối thủ còn bị giảm nhẹ sát thương (−3% ở 1★ → −6% ở 7★).
- **Trên màn hình thấy gì:** ụ grow-up 3 dạng: OFFLINE (chưa ụ nào khớp sao), SYNCED (có 1–2 ụ khớp), FULL SYNC (3 ụ trở lên); vòng 3 cung quanh ụ đầy dần theo số ụ khớp. Từ dạng SYNCED có vòng vàng đập nhịp mỗi 1 giây quanh ụ, đầu súng sáng hơn khi khớp nhiều. Có tấm đếm nhỏ ở đáy ô "×số ụ khớp" (thành chữ vàng khi đủ 3). Khi số ụ khớp thay đổi, hoặc khi chạm xem ụ, hiện dây xích vàng nối tới các ụ cùng sao. Xung ping vàng tới ụ được buff.
- **Khi nào biến đổi / kích hoạt:** luôn bật, tự đếm lại khi sao trên bàn thay đổi. 3★ TUNED AURA (buff ×1.45 so với 1★); 5★ PAIRED FIRE — buff ×1.9 và khi có từ 2 ụ khớp thì các ụ đó +tốc bắn nhỏ (≈+4–5%); 7★ LOOSE SYNC — buff ×2.35 và ụ lệch 1 sao cũng tính là khớp.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | +Sát thương cho ụ Tấn công cùng sao (LV9, chưa power-up) | +7.5% | +12.4% | +17.6% |
  | PVP: ụ đối thủ bị giảm sát thương | −3% | −4.5% | −6% |
  Cấp thẻ: LV9 → LV15: buff gốc 1★ tăng từ 7.5% lên 10.5% (7★ ≈ +24.7%); mức giảm PVP cũng nhích lên.
  Mạnh/yếu: buff cả bàn không cần xếp kề, nhưng phải giữ nhiều ụ Tấn công cùng số sao; buff sát thương chung bị trần 35%. Hợp với: Chain Link, Gatling, Mimic.

### Star Breaker — Súng Hạ Sao · Huyền thoại · Hỗ trợ
- **Skill:** Không bắn. Ụ Tấn công ở 4 ô kề thẳng được +sát thương. Mỗi khi có phép ghép ra ụ ở ô kề nó, ụ mới được bùng tốc bắn 5 giây. Mỗi wave, lần đầu có một ụ lên 5★: PVP → ụ đó của đối thủ bị −8% tốc bắn 6 giây; CO-OP → ụ Tấn công sao thấp nhất của đồng đội +8% tốc bắn 6 giây; SOLO → ụ Tấn công sao thấp nhất của mình +8%.
- **Trên màn hình thấy gì:** xung ping đỏ tới ụ kề mỗi ~2,6 giây; ụ vừa ghép cạnh nó hiện nhãn "MERGE SURGE". Khi hạ/tặng sao: hoạt ảnh kẻ trộm sao (PVP) hoặc sứ giả sao (co-op/solo) bay sang ụ đích rồi sao vỡ / sao được tặng, chữ "−8% FIRE RATE", "+8% FIRE RATE" hoặc "ALLY +8%", nhãn "STAR BREAK" trên ụ; nếu ụ đối thủ có khiên thì hiện ấn khoá chặn.
- **Khi nào biến đổi / kích hoạt:** buff luôn bật; bùng tốc khi ghép cạnh; hạ/tặng tốc 1 lần mỗi wave. 3★ TUNED AURA (×1.45 buff 1★); 5★ BREAK POINT — buff ×1.9, bùng tốc lớn hơn; 7★ STAR SHATTER — buff ×2.35, bùng tốc +32%.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | +Sát thương ụ Tấn công kề (LV9, chưa power-up) | +10% | +16.5% | +23.5% |
  | Bùng tốc khi ghép cạnh (5 giây) | +13.8% | +22.8% | +32.4% |
  | Hạ/tặng tốc mỗi wave (6 giây) | ±8% | ±8% | ±8% |
  Cấp thẻ: LV9 → LV15: buff gốc 1★ 10% → 14.2% (7★ ≈ +33%); bùng tốc tăng theo cùng tỉ lệ.
  Mạnh/yếu: buff sát thương lớn cho ô kề và thưởng việc ghép tại chỗ; hiệu ứng 5★ nhỏ và chỉ 1 lần mỗi wave. Hợp với: Sniper, Gatling, Purifier.

### Rainbow — Máy Cầu Vồng · Huyền thoại · Hỗ trợ
- **Skill:** Không bắn. Cứ 7 giây vẽ một vệt cầu vồng trên đường quái, ngay phía trước quái đi đầu. CO-OP và SOLO: quái đi trên vệt nhận thêm sát thương từ MỌI ụ, và ụ Tấn công ở 4 ô kề đánh quái trên vệt mạnh hơn nữa. PVP thì ngược lại: vệt vẽ lên đường của ĐỐI THỦ, quái trên đó nhận ÍT sát thương hơn từ đối thủ (quái "trâu" hơn).
- **Trên màn hình thấy gì:** vòng nạp hồng quanh bệ đầy dần trong 7 giây, gần đầy thì nhấp nháy. Khi vẽ: dải cầu vồng rộng mọc dọc đường trong 0,5 giây, nhãn "RAINBOW" trên ụ. Quái đứng trên vệt có dấu sắc màu đổi liên tục. Xung ping hồng tới ụ kề được buff.
- **Khi nào biến đổi / kích hoạt:** mỗi 7 giây (nếu có quái để nhắm). 3★ TUNED AURA (×1.45 buff 1★); 5★ DOUBLE ARC — buff ×1.9 và vẽ 2 vệt (vệt thứ 2 phía sau quái đi đầu); 7★ PRISM — buff ×2.35 và vệt làm chậm quái 10% (không áp trong PVP).
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Ụ Tấn công kề: +sát thương vào quái trên vệt (LV9, chưa power-up) | +13% | +21.5% | +30.6% |
  | Quái trên vệt nhận thêm từ mọi ụ (co-op/solo) | +5% | +8% | +11% |
  | PVP: quái đối thủ trên vệt nhận ít hơn | −10% | −16% | −22% |
  | Vệt dài · tồn tại | 100 px · 6.5 s | 130 px · 8 s | 160 px · 9.5 s |
  Cấp thẻ: LV9 → LV15: buff gốc 1★ 13% → 18.4% (7★ ≈ +43%, nhưng bị trần 35%); mức giảm PVP cũng tăng (7★ ≈ −27%).
  Mạnh/yếu: tăng sát thương cả bàn lên một đoạn đường; vệt ngắn, chỉ có ích khi quái đi qua đúng chỗ; buff có điều kiện chung trần 35% với buff sát thương khác. Hợp với: Sniper, Gatling, Purifier.

### Resonance Grid — Lưới Cộng Hưởng · Huyền thoại · Hỗ trợ
- **Skill:** Không bắn. Chỉ tăng sát thương cho 4 ô CHÉO quanh nó (không buff ô trên/dưới/trái/phải). Nếu cả 4 ô chéo đều có ụ → CỘNG HƯỞNG, buff ×1.5. Chỉ 3 ô giữa của hàng giữa mới có đủ 4 ô chéo; ô ở mép có ít ô chéo hơn và không được bù.
- **Trên màn hình thấy gì:** đầu hình chữ X luôn chỉ về 4 góc chéo; cứ ~2.4 s (khi cộng hưởng ~1.2 s) phát xung xanh ngọc tới các ô chéo được buff. Đáy ô có tấm "n/4" (chữ vàng khi đủ 4). Khi có 2+ ô chéo: đòn của ụ được buff lóe vòng tia xanh ngọc; khi cộng hưởng: cứ phát thứ 3 của mỗi ụ chéo có thêm 1 viên đạn vọng xanh ngọc (chỉ là hình). Có vòng 3 cung quanh ụ; chạm ụ hiện dây năng lượng và nhãn "+x% DAMAGE (DIAGONAL)".
- **Khi nào biến đổi / kích hoạt:** dạng theo số ô chéo có ụ: 0–1 / 2–3 / đủ 4 (RESONANCE). Mốc sao: 3★ buff ×1.45 · 5★ RESONANCE LINK: ụ chéo thêm tốc bắn (5% × hệ số sao) · 7★ GRAND RESONANCE: khi đủ 4 ô, phần tốc bắn này ×1.5.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | +Sát thương cho ụ chéo (thường · cộng hưởng) | 8% · 12% | 13.2% · 19.8% | 18.8% · 28.2% |
  | +Tốc bắn cho ụ chéo (từ 5★) | — | — | 11.8% (cộng hưởng 17.6%) |
  Cấp thẻ: LV9 → LV15: buff gốc 1★ tăng từ 8% lên 11.3% (7★ cộng hưởng ~39.8% nhưng bị trần chung 35%).
  Mạnh/yếu: buff sát thương lớn nhất khi đặt ở giữa bàn và lấp đủ 4 góc; đặt ở mép thì yếu. Không buff ụ Hỗ trợ khác. Hợp với: Lone Ace, Hydra, Nemesis.

### Mirror Gate — Cổng Gương · Huyền thoại · Hỗ trợ
- **Skill:** Không bắn. 4 ụ kề có xác suất KHÁNG khống chế (trần 35%). Ngoài ra có tấm gương nạp đầy sau mỗi 20 s: PVP — chặn 1 hiệu ứng khống chế của đối thủ lên bàn bạn và PHẢN lại: ụ sao cao nhất của đối thủ bị Kẹp (−40% tốc bắn) 4 s. Trùm (mọi chế độ) — chặn 1 chiêu của trùm. Co-op — khi đồng đội ghép ụ có hiệu ứng ghép (Mana Doubler, Drone Bay, Cooldown Horn, Cloner, Jammer, Twin Maker, Orbital, Chrono Lock, Pandora Vault, Signal Jammer), bàn bạn được chép hiệu ứng đó ở ½ sao.
- **Trên màn hình thấy gì:** các mảnh gương bay vòng quanh tâm ụ (2 mảnh ở 1–3★, 4 mảnh ở 4–6★, 6 mảnh ở 7★), mờ khi đang nạp, sáng rõ và có quầng xanh nhạt khi sẵn sàng. Vòng nạp xanh nhạt quanh bệ. Khi dùng: vòng sáng, tiếng kính vỡ, chữ "REFLECT!" / "BLOCKED" / "MIRROR COPY"; tia sang ụ đối thủ kèm chữ "REFLECTED". Ụ kề có bong bóng mờ; khi kháng thành công hiện chữ "RESIST". Có vòng 3 cung quanh ụ.
- **Khi nào biến đổi / kích hoạt:** gương dùng 1 lần mỗi khi đầy. Dạng theo sao: 1–3★ (MIRROR) / 4–6★ (TWIN PANES) / 7★ (SHARD HALO). Mốc sao: 3★ buff ×1.45 · 5★ POLISHED: buff ×1.9 (kháng ~28%) · 7★ TRUE MIRROR: kháng 35%, gương mỗi 15 s, phản lên 2 ụ đối thủ.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Kháng khống chế cho ụ kề | 15% | 24.8% | 35% (trần) |
  | Gương nạp mỗi · số ụ đối thủ bị phản | 20 s · 1 | 20 s · 1 | 15 s · 2 |
  Cấp thẻ: LV9 → LV15: kháng gốc 1★ tăng từ 15% lên 21% (chạm trần 35% sớm hơn, khoảng 4★–5★); thời gian gương không đổi.
  Mạnh/yếu: khắc chế ụ phá đối thủ trong PVP và chiêu trùm; trong solo không có trùm thì gần như ngồi chơi. Không buff ụ Hỗ trợ khác. Hợp với: Shield Gen, Cleanser, Holy Halo.

### Sanctum — Thánh Địa · Huyền thoại · Hỗ trợ
- **Skill:** Không bắn. Khi vừa XUẤT HIỆN (được gọi hoặc ghép ra) thì tẩy sạch băng/đá/cháy/kẹp/tê liệt cho các ô kề và cho mỗi ụ kề 1 khiên chặn 1 đòn. Luôn cho ụ TẤN CÔNG kề +sát thương. Khiên của ô kề bị mất sẽ tự nạp lại sau 14 s (7★: 4 s).
- **Trên màn hình thấy gì:** lửa thánh + vòm sáng (dải 16 khung) ở ụ khi xuất hiện, tia phép vàng nhạt bắn sang từng ô kề; ụ được che có bong bóng khiên. Quanh bệ có VÒNG NẠP màu vàng kem (8 khung, càng đầy càng kín, >80% nhấp nháy) — khi mọi ô kề đã có khiên vòng đứng ở gần đầy và nhấp nháy. Nạp xong: tia phép + vòng sáng nhỏ ở ô được khiên lại. Chạm ụ: biểu tượng khiên trên ô được buff, nhãn "+x% DAMAGE · SHIELD".
- **Khi nào biến đổi / kích hoạt:** tẩy + khiên khi ụ xuất hiện; khiên nạp lại chỉ khi có ô kề thiếu khiên. Mốc: 3★ TUNED AURA (buff ×1.45); 5★ WIDE SANCTUM tẩy, khiên và buff lan ra cả 8 ô xung quanh (thêm 4 ô chéo); 7★ HOLY GROUND khiên nạp lại mỗi 4 s. Không đổi dạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | +sát thương ụ Tấn công kề (LV9 → LV15) | 10% → 14.2% | 16.5% → 23.4% | 23.5% → 33.4% |
  | Số ô tác dụng | 4 | 4 | 8 |
  | Khiên nạp lại mỗi | 14 s | 14 s | 4 s |
  Cấp thẻ: LV9 → LV15: buff sát thương ở 1★ 10% → 14.2% (nhân theo sao như mọi ụ Hỗ trợ; trần chung sát thương 35%).
  Mạnh/yếu: chống khống chế cực tốt (nhất là 7★); buff chỉ cho ụ Tấn công, không cho ụ Đặc biệt. Hợp với: Wyrm Engine, Leviathan, Hive Queen.


**— Đặc biệt —**

### Merge King — Vua Ghép · Huyền thoại · Đặc biệt
- **Skill:** Kéo Vua Ghép thả lên một ụ CÙNG SAO: Vua Ghép biến mất, ụ kia được +1 sao và GIỮ NGUYÊN loại (không ra ụ ngẫu nhiên như ghép thường). Mỗi lần gọi/ghép ra có 10% thành bản VÀNG: bản vàng cho +2 sao (không vượt 7★). Nâng được cả ụ đang bị hoá đá/đóng băng (đá vẫn là đá). Vua Ghép + Vua Ghép → 1 Vua Ghép +1 sao (giữ vàng nếu một trong hai là vàng). Bình thường nó vẫn bắn đạn lửa nhỏ.
- **Trên màn hình thấy gì:** bản vàng có quầng vàng phập phồng quanh ụ. Khi rê có huy hiệu sao xem trước kết quả. Lúc dùng: hoạt ảnh huy hiệu xoay → vương miện nổi trên ô → búa hoàng gia gõ → đóng dấu sao vàng; chữ lớn "+1★"/"+2★" và nhãn "MERGE KING +1★" hoặc "GOLD KING +2★".
- **Khi nào biến đổi / kích hoạt:** khi người chơi kéo thả. Bản vàng được quay lúc ụ sinh ra. Mốc chung của ụ bắn: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP — cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (Huyền thoại LV9, chưa power-up) | 35.0 | 124.3 | 277.6 |
  | Tốc bắn (phát/giây) | 0.9 | 1.08 | 1.08 |
  | Sao cộng cho ụ đích (thường · vàng) | +1 · +2 | +1 · +2 | +1 · +2 |
  Cấp thẻ: LV9 → LV15: tỉ lệ ra bản vàng 10% → 22%, và sát thương +10% mỗi cấp (tới +60%).
  Mạnh/yếu: đẩy nhanh ụ chủ lực lên sao cao mà không mất loại; bản thân bắn yếu. Hợp với: Star Cannon, Purifier, Sniper.

### Twin Maker — Máy Sinh Đôi · Huyền thoại · Đặc biệt
- **Skill:** Khi GHÉP THƯỜNG hai Máy Sinh Đôi cùng sao (hoặc Máy Sinh Đôi với Mimic), ngoài ụ ngẫu nhiên +1 sao của phép ghép còn gọi thêm 1 ụ ngẫu nhiên trong bộ bài, cùng số sao với hai ụ nguyên liệu, đặt vào một ô trống ngẫu nhiên. 10% trường hợp ụ thêm cao hơn 1 sao. Ghép đặc biệt (Merge King, Copycat… kéo vào nó) không kích hoạt. Bình thường bắn đạn nhỏ.
- **Trên màn hình thấy gì:** không có chữ nổi; lúc kích hoạt có tia vàng bay từ ô ghép tới ô mới, vòng vàng quanh ụ mới và biểu tượng hai vòng nối lóe ~0,6 giây trên cả hai ô.
- **Khi nào biến đổi / kích hoạt:** mỗi lần ghép thường (hai Máy Sinh Đôi ghép nhau cũng chỉ ra đúng 1 ụ thêm). Mốc chung của ụ bắn: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP — cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát (Huyền thoại LV9, chưa power-up) | 16.5 | 58.6 | 130.9 |
  | Tốc bắn (phát/giây) | 1.4 | 1.68 | 1.68 |
  | Ụ thêm khi ghép | 1 ụ cùng sao nguyên liệu (10%: +1★) | ← | ← |
  Cấp thẻ: LV9 → LV15: tỉ lệ ụ thêm cao hơn 1 sao 10% → 16%, và sát thương +10% mỗi cấp (tới +60%).
  Mạnh/yếu: lấp bàn và tăng tổng sao rất nhanh; bắn yếu, chỉ có lợi khi ghép liên tục. Hợp với: Star Cannon, Merge King, Mimic.

### Copycat — Máy Sao Chép · Huyền thoại · Đặc biệt
- **Skill:** Kéo Máy Sao Chép thả lên một ụ CÙNG SAO (khác Copycat): nó biến thành bản sao của ụ đó, cùng sao, nhưng chỉ gây 50% sát thương. Bản sao giữ đúng dạng của ụ gốc (Sói thức tỉnh, Vua Ghép vàng) và giữ các buff đang có trên thân Copycat. Nếu sao chép ụ Hỗ trợ thì buff vẫn đủ 100% (chỉ sát thương bị giảm). Trước khi dùng, nó bắn đạn lửa nhỏ.
- **Trên màn hình thấy gì:** tia phép tím nối từ ụ gốc sang ô Copycat, nhãn "COPY". Bản sao có quầng tím nhấp nháy và biểu tượng Copycat nhỏ ở góc trên-trái ô để không nhầm với ụ thật.
- **Khi nào biến đổi / kích hoạt:** khi người chơi kéo thả (không lên được ô đá/băng). Mốc chung của ụ bắn (áp cho chính Copycat trước khi biến): 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP — cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát của Copycat (LV9, chưa power-up) | 28.0 | 99.4 | 222.0 |
  | Tốc bắn (phát/giây) | 1.2 | 1.44 | 1.44 |
  | Sức mạnh bản sao so với ụ gốc | 50% | 50% | 50% |
  Cấp thẻ: LV9 → LV15: bản sao từ 50% → 92% sát thương ụ gốc, và sát thương +10% mỗi cấp (tới +60%).
  Mạnh/yếu: nhân đôi ụ chủ lực hoặc ụ hỗ trợ quý ngay lập tức; ở cấp thẻ thấp bản sao tấn công chỉ còn một nửa. Hợp với: Werewolf, Sync Cannon, Merge King.

### Evolver — Hộp Tiến Hoá · Huyền thoại · Đặc biệt
- **Skill:** Sau một khoảng thời gian (20 giây + 6 giây mỗi sao), Hộp tự biến thành 1 ụ ngẫu nhiên khác trong bộ bài, cao hơn nó 1 sao. Trong lúc chờ nó "chọc" quái bằng đòn yếu. Ở 7★ không lên được nữa: thay vì biến, mỗi vòng nó hoàn mana rồi đếm lại từ đầu (không bao giờ ra 8★).
- **Trên màn hình thấy gì:** KHÔNG có đồng hồ hay số đếm ngược trên ụ trong trận, cũng không có bom (số đếm chỉ hiện trong clip minh hoạ ở trang hồ sơ ụ, vài giây cuối). Tiến độ thể hiện bằng vòng 3 cung: dạng INCUBATING (0–60%) cung trái đầy dần, bắn viên hổ phách nhỏ; FORGING (60–90%) cung phải đầy dần, bắn cục vàng nóng chảy vào 3 quái, nổ lan 20 px; ASCENDING (90–100%) bắn tia vàng mảnh liên tục, có hào quang. Đầu hộp quay càng lúc càng nhanh và sáng dần. Bảng thông tin khi chạm ghi số giây còn lại. Lúc biến: hoạt ảnh biến hình + chữ "EVOLVE +1★ <tên ụ mới>". Ở 7★: tàn lửa vàng bay lên, hiệu ứng mana bay ra.
- **Khi nào biến đổi / kích hoạt:** khi đồng hồ ngầm đủ thời gian (dừng đếm khi ụ bị đóng băng/hoá đá). Mất sao (bị cháy, bị trùm cướp sao) KHÔNG làm đếm lại: thời gian đã chờ giữ nguyên, ngưỡng mới ngắn hơn nên có thể biến ngay. Mốc riêng: 3★ FAST GROWTH — nhanh hơn 20%; 5★ BREAKTHROUGH — 25% cơ hội +2 sao (tối đa 7★); 7★ SALVAGE — mỗi vòng hoàn 120 mana (+10 mỗi bậc power-up của Evolver, tối đa 160) rồi đếm lại.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Thời gian chờ biến (giây) | 26 | 35.2 | 49.6 (hoàn mana) |
  | Kết quả | ụ ngẫu nhiên 2★ | ụ ngẫu nhiên 5★ | +120–160 mana mỗi vòng |
  | Đòn chọc dạng đầu (LV9, chưa power-up) | 6.3 | 22.4 | 38.4 |
  Cấp thẻ: LV9 → LV15: chỉ tăng sát thương đòn chọc +10% mỗi cấp (tới +60%); thời gian và mana hoàn không đổi theo cấp thẻ.
  Mạnh/yếu: tự lên sao miễn phí, rất hợp chiến thuật tích sao; kết quả ngẫu nhiên và gần như không gây sát thương khi đang chờ. Hợp với: Merge King, Star Cannon, Twin Maker.

### Orbital — Vệ Tinh · Huyền thoại · Đặc biệt
- **Skill:** Không bắn thường. Khi GHÉP Vệ Tinh, MỌI Vệ Tinh còn trên bàn (kể cả ụ vừa ghép ra nếu là Vệ Tinh) THỨC TỈNH 23 giây: mỗi con thả loạt bom từ trời xuống quái ngẫu nhiên, mỗi quả nổ lan 34 px. Nếu ghép xong không còn Vệ Tinh nào trên bàn → gọi một đợt bắn phá ngắn 12 giây (mỗi 0,32 giây một tia) để lần ghép không phí.
- **Trên màn hình thấy gì:** đầu ụ đung đưa chậm; thức tỉnh thì đung đưa nhanh, đầu sáng rực, vòng sáng xanh băng quay quanh đầu (mờ dần 2 giây cuối). Vòng 3 cung quanh ụ: STANDBY → UPLINK (có từ 2 Vệ Tinh) → AWAKENED (cung trên đỉnh co dần theo thời gian còn lại, nháy khi sắp hết). Lúc ghép: vòng sáng xanh lan ra, màn chớp xanh. Bom: tia sáng dọc từ đỉnh màn xuống, nổ điện + lửa, rơi so le.
- **Khi nào biến đổi / kích hoạt:** chỉ khi ghép (2 Vệ Tinh cùng sao, hoặc Vệ Tinh với Mimic). Đổi dạng theo số Vệ Tinh trên bàn và trạng thái thức tỉnh. Mốc riêng: 3★ QUICK HANDS loạt bom nhanh 20%; 5★ HEAVY SALVO +25% sát thương bom; 7★ JUSTICE RAIN thêm +30% sát thương và +1 bom.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương mỗi bom (34 px) | 56.7 | 201 | 562 |
  | Số bom mỗi loạt · nhịp | 3 · 1.8 s | 4 · 1.5 s | 7 · 1.5 s |
  Cấp thẻ: LV9 → LV15: thời gian thức tỉnh 23 → 29 giây (+1 giây mỗi cấp) và +10% sát thương mỗi cấp (tới +60%).
  Mạnh/yếu: nhiều Vệ Tinh cùng thức tỉnh thì mưa bom phủ cả đường; ngoài lúc thức tỉnh hoàn toàn không đánh, phải ghép thường xuyên. Hợp với: Mimic, Merge King, Venom.

### Pandora Vault — Hộp Pandora · Huyền thoại · Đặc biệt
- **Skill:** Mỗi lần ghép 2 Pandora Vault (hoặc Mimic + Pandora), hộp mở và quay ngẫu nhiên 1 trong 6 phép (tính theo sao của ụ mới ra): MANA RAIN (+10 mana × sao) · FREEZE (mọi quái đứng yên 1.5 s, trùm 0.5 s) · STAR GIFT (+1★ cho 1 ụ ngẫu nhiên) · VAULT BOMBS (3 quả bom vào 3 quái đầu, nổ 30 px) · SHIELD ×3 (3 ụ sao cao nhất được khiên chặn 1 lần) · FRENZY (mọi ụ có sát thương +40% tốc bắn 6 s). Ngày thường ụ bắn đạn lửa vàng.
- **Trên màn hình thấy gì:** trên ô vừa ghép hiện đĩa quay 6 biểu tượng, quay chậm dần ~0.8 s, có kim lấp lánh ở đỉnh, ô trúng sáng lên; rồi chữ tên phép (ví dụ "FREEZE!") và vòng sáng màu phép, kèm cảnh đặc biệt mở hộp. 4–6★: 6 tia sáng nhiều màu lọt ra khe nắp; 7★: quả cầu cầu vồng lơ lửng đổi màu. Có vòng 3 cung quanh ụ.
- **Khi nào biến đổi / kích hoạt:** chỉ khi ghép. Ghép ra 6★: quay 2 lần, giữ phép tốt hơn (thứ tự: STAR GIFT > FRENZY > BOMBS > MANA > FREEZE > SHIELD). Ghép ra 7★: ra 2 phép khác nhau cùng lúc. Co-op: STAR GIFT, SHIELD, FRENZY áp cả bàn đồng đội. +★ từ hộp không tính là ghép. Dạng: 1–3★ khoá / 4–6★ hé nắp / 7★ mở. Mốc sao: 3★ QUICK HANDS +20% tốc bắn · 5★ LUCKY SPIN · 7★ OPEN VAULT.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương đạn thường (LV đầu) | 21 | 74.6 | 128.1 |
  | Tốc bắn | 0.9/s | 1.08/s | 1.08/s |
  Mở hộp theo sao ụ mới ra (2★ / 5★ / 7★): MANA +20 / +50 / +70 · mỗi quả bom 194 / 739 / 1281 (LV đầu).
  Cấp thẻ: LV9 → LV15: sát thương +10% mỗi cấp, tới +60% (cả đạn thường lẫn bom).
  Mạnh/yếu: phép may rủi, có lúc rất lớn (+1★, FRENZY); tự bắn yếu và chỉ có tác dụng khi ghép. Hợp với: Mimic, Cloner, Twin Maker.

### Scrap Forge — Lò Rèn Phế Liệu · Huyền thoại · Đặc biệt
- **Skill:** Không bắn. KÉO một ụ 1–3★ bất kỳ (khác Forge, cùng bàn, không phải đá) thả lên Forge (hoặc kéo Forge lên nó) → Forge "ăn" ụ đó, được thêm cộng dồn LÒ (ăn ụ 3★ được ×3). Mỗi cộng dồn = +4% sát thương cho ụ Tấn công mạnh nhất trên bàn (sao cao nhất), tối đa 15 cộng dồn (+60%). Chỉ cho ăn mới tính, ghép thường không tính.
- **Trên màn hình thấy gì:** ụ bị ăn bay vào Forge, nổ tia lửa cam, chữ cam "+n FORGE", tia phép cam nối tới ụ được nhận buff. Từ 4 cộng dồn Forge có quầng cam sau lưng, từ 10 cộng dồn quầng nhấp nháy; đầu súng sáng dần theo số cộng dồn. Đáy ô có tấm "n/15" (vàng khi đầy). Có vòng 3 cung quanh ụ.
- **Khi nào biến đổi / kích hoạt:** mỗi lần cho ăn. Dạng: 0–4 cộng dồn (COLD FORGE) / 5–14 (BELLOWS) / 15 (MOLTEN CORE). Nếu ghép 2 Forge mà ra lại Forge thì giữ số cộng dồn cao hơn. Buff luôn đi theo ụ Tấn công mạnh nhất hiện tại. Mốc sao riêng: 3★ HOT COALS: mỗi lần ăn +2 · 5★ BELLOWS: +3 · 7★ MOLTEN CORE: +4.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Cộng dồn mỗi lần ăn (ăn ụ 3★) | +1 (+3) | +2 (+6) | +4 (+12) |
  | Buff tối đa cho ụ Tấn công mạnh nhất | +60% | +60% | +60% |
  Cấp thẻ: LV9 → LV15: không làm Forge mạnh thêm (Forge không có sát thương; số cộng dồn và +4% không đổi theo cấp). Power-up cũng không tác dụng.
  Mạnh/yếu: biến ụ 1–3★ thừa thành sức mạnh lâu dài cho ụ chủ lực; tốn ụ và tốn chỗ, không tự đánh. Hợp với: Hydra, Nemesis, Nine-Tail.

### Marionette — Rối Máy · Huyền thoại · Đặc biệt
- **Skill:** Mỗi chu kỳ, gắn dây rối lên quái thường nhiều máu nhất (không lấy trùm; 1–3★ không lấy quái to). Con rối quay đầu đi NGƯỢC đường trong vài giây, đâm vào quái khác gây sát thương (30% máu còn lại của nó, có giới hạn), hết giờ thì TỰ NỔ trong 60 px. Rối chết không cho mana và không bị gửi sang đối thủ. Ụ vẫn bắn đạn hồng thường.
- **Trên màn hình thấy gì:** sân khấu rối nhỏ, bàn tay khổng lồ hiện trên đầu quái, 4 dây móc búng xuống, nhấc bổng quái và kéo lùi (có bóng dưới chân); mỗi lần đâm có tiếng nổ nhỏ; cuối cùng bàn tay nắm lại và con rối nổ tung như đồ chơi (vòng hồng 60 px, rung màn hình). Quanh bệ có vòng nạp màu đỏ mận. Có vòng 3 cung quanh ụ.
- **Khi nào biến đổi / kích hoạt:** chỉ gắn khi không có con rối nào của ụ đang chạy. Dạng theo sao: 1–3★ (STRINGS) / 4–6★ (GOLDEN HAND, được lấy quái to) / 7★ (TWIN PUPPETS). Mốc sao: 3★ QUICK HANDS +20% tốc (cả nhịp gắn rối) · 5★ DOUBLE TAP · 7★ TWIN PUPPETS: điều khiển 2 quái cùng lúc (không có APEX).
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Chu kỳ · thời gian điều khiển | 10 s · 2 s | ~7.1 s · 3.5 s | ~5.8 s · 5 s |
  | Nổ cuối 60 px (LV đầu) · trần mỗi cú đâm | 151.2 · 75.6 | 536.8 · 268.4 | 922.3 · 461.2 |
  | Đạn thường · tốc bắn | 18.9 · 0.8/s | 67.1 · 0.96/s | 115.3 · 0.96/s |
  Cấp thẻ: LV9 → LV15: sát thương +10% mỗi cấp, tới +60% (cả nổ và đâm).
  Mạnh/yếu: vừa đẩy lùi, vừa diệt chắc 1 quái trâu, vừa gây nổ vào đàn; không tác dụng lên trùm. Hợp với: Chrono Throne, Black Hole, Mortar.

### Hero Foundry — Xưởng Anh Hùng · Huyền thoại · Đặc biệt
- **Skill:** Bắn đạn nhẹ, nhanh. Khi GHÉP 2 Hero Foundry → 1 ô ngẫu nhiên trên bàn mình (ưu tiên ô đang có ụ) thành Ô ANH HÙNG trong 12 s: ụ đứng trên ô +20% tốc bắn, cộng thêm 4% cho mỗi sao của Foundry đem ghép. Tối đa 2 ô cùng lúc (ô thứ 3 thay ô cũ nhất); trúng lại ô đang là ô anh hùng thì làm mới thời gian. Ô vẫn giữ hiệu lực khi ụ trên đó đổi đi.
- **Trên màn hình thấy gì:** lúc ghép: hiệu ứng "đóng dấu" vàng (dải 16 khung) trên ô được chọn; sau đó dưới ô có vòng tròn vàng xoay chậm, đập nhịp, mờ dần trong 1.5 s cuối. Đáy ô Foundry có bộ đếm "n/2" (biểu tượng tốc bắn).
- **Khi nào biến đổi / kích hoạt:** chỉ khi ghép 2 Foundry (cùng sao). Mốc chung: 3★ QUICK HANDS +20% tốc bắn; 5★ DOUBLE TAP cứ phát thứ 4 bắn đôi; 7★ APEX +30% sát thương, +10% chí mạng. Không đổi dạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát | 16 | 56 | 125 |
  | Tốc bắn (phát/giây) | 1.3 | 1.56 | 1.56 |
  | Ô anh hùng khi ghép 2 Foundry sao này (LV9 → LV15) | +20% → +32% | +32% → +44% | — (7★ không ghép được; cao nhất 6★: +40% → +52%) |
  Cấp thẻ: LV9 → LV15: tốc bắn ô anh hùng +20% → +32% (chưa cộng phần theo sao), kèm +10% sát thương mỗi cấp (tới +60%).
  Mạnh/yếu: tăng mạnh tốc bắn cho ụ chủ lực, nhưng ô chọn ngẫu nhiên và chỉ 12 s; bản thân bắn yếu. Hợp với: Railgun, Wyrm Engine, Gatling.

### Blood Circuit — Mạch Máu · Huyền thoại · Đặc biệt
- **Skill:** Bắn tia máu như ụ thường. Điểm đặc biệt: KÉO Blood Circuit thả lên một ụ bất kỳ của mình (mọi loại, mọi sao, trừ Blood Circuit khác) → cả hai biến thành 1 ụ ngẫu nhiên trong bộ bài, ở mức sao CAO HƠN trong hai ụ (không bao giờ tự lên sao). Nếu hai ụ CÙNG sao → +1 điểm VAMP (chung cả bàn, tối đa 10): mỗi VAMP +6% sát thương cho mọi Blood Circuit. Nếu KHÁC sao và có ≥2 VAMP → tốn 2 VAMP, nổ xung máu 220% sát thương trong 120 px quanh ô.
- **Trên màn hình thấy gì:** tia máu đỏ bay tới quái. Lúc kéo-thả: ụ bay sang ô đích, vòng đỏ đậm + tia lửa đỏ bung ra, ụ mới hiện ra kiểu nổ. Xung máu: dải hiệu ứng 16 khung màu máu + rung màn. Từ 3 VAMP trở lên quanh ụ có quầng đỏ đập nhịp, càng nhiều VAMP đầu súng càng sáng.
- **Khi nào biến đổi / kích hoạt:** mỗi lần người chơi kéo nó lên ụ khác (máy tự dùng khi bàn đầy, hết cặp ghép). Mốc: 3★ QUICK HANDS +20% tốc bắn; 5★ DEEP DRAIN xung máu 300% (thay 220%); 7★ BLOOD STAR cho ăn cùng sao được +2 VAMP. Không đổi dạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát | 36 | 127 | 218 |
  | Tốc bắn (phát/giây) | 0.9 | 1.08 | 1.08 |
  | Xung máu (chưa tính VAMP) | 79 | 279 | 653 |
  Cấp thẻ: LV9 → LV15: mỗi VAMP +6% → +9% (10 VAMP: +60% → +90%), kèm +10% sát thương mỗi cấp (tới +60%).
  Mạnh/yếu: "giải cứu" bàn kẹt, đổi ụ xấu lấy ụ khác; không tự tăng sao, cho ăn ụ sao cao thì mất ụ đó. Hợp với: Merge King, Genesis Core, Mystery Box.

### Hex Saboteur — Kẻ Nguyền · Huyền thoại · Đặc biệt
- **Skill:** Bắn đạn đỏ như ụ thường. Khi GHÉP 2 Hex Saboteur: sau 1.5 s một lời nguyền bay tới mục tiêu ngẫu nhiên. PVP: có xác suất làm 1 ụ đối thủ −1★ (ụ 1★ thì bị tê liệt 2.5 s); khiên/Mirror Gate chặn được. Co-op: cùng xác suất đó cho 1 ụ đồng đội +1★. Chơi đơn: quái đi đầu luôn bị chậm 30% và nhận thêm 15% sát thương trong 4 s. Hồi chiêu 8 s chung cả bàn (ghép trong lúc hồi thì không có lời nguyền).
- **Trên màn hình thấy gì:** âm thoa đỏ bay vòng cung từ ô ghép tới đích; trúng thì nổ "sao vỡ" (dải 16 khung) và tia lửa đỏ ở ụ bị −1★, hoặc vòng vàng ở ụ đồng đội được +1★; trượt thì chỉ có vòng đỏ nhạt.
- **Khi nào biến đổi / kích hoạt:** mỗi lần ghép 2 Hex Saboteur (nếu không đang hồi 8 s). Xác suất tính theo sao của ụ đem ghép: 35% + 5% mỗi sao trên 1★, tối đa 80%. Mốc: 3★ QUICK HANDS +20% tốc bắn; 5★ SHARP HEX (+20% so với 1★); 7★ DOOM HEX (+30%). Không đổi dạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát | 27 | 97 | 167 |
  | Tốc bắn (phát/giây) | 1 | 1.2 | 1.2 |
  | Xác suất nguyền (LV9 → LV15) | 35% → 47% | 50% → 62% | 65% → 77% |
  Cấp thẻ: LV9 → LV15: xác suất nguyền +2% mỗi cấp (35% → 47% ở 1★), kèm +10% sát thương mỗi cấp (tới +60%).
  Mạnh/yếu: phá bàn đối thủ trong PVP, đẩy sao đồng đội trong Co-op; chơi đơn chỉ là làm chậm nhẹ. Hợp với: Mimic, Twin Maker, Merge King.


---

## Ụ CỔ ĐẠI (ĐỎ)


**— Tấn công —**

### Black Hole — Hố Đen · Cổ đại · Tấn công
- **Skill:** Định kỳ mở một hố đen ở chỗ quái đông nhất: trong 3 giây hút quái về tâm (trùm chỉ bị hút 30%) và rút máu liên tục, cuối cùng NGHIỀN NÁT gây ×8 sát thương cho mọi quái trong hố. Không có kỹ năng chủ động.
- **Trên màn hình thấy gì:** vòng nạp sáng màu hồng quanh bệ; khi mở: đĩa xoáy tím hồng xoay, hạt sáng xoắn ốc bị hút vào; khoảnh khắc đặc biệt: mảnh đường bay lên, "mống mắt" hấp dẫn mở ra, xoáy, rồi nén lại nổ lớn và nhả quái còn sống ra (dùng lại trong 15 giây thì bản ngắn hơn). Lúc nghiền: chớp hồng, vòng sóng, rung màn mạnh.
- **Khi nào biến đổi / kích hoạt:** nạp xong và có quái thì mở hố (mỗi lúc chỉ 1 hố). Buff tốc bắn làm nạp nhanh hơn. Bán kính hố = 64 + 4 px mỗi sao. Mốc chung (loại tự quản nhịp): 3★ QUICK HANDS +20% tốc nạp; 5★ OVERCHARGE +25% sát thương; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Đòn nghiền cuối (×8) | 389 | 1380 | 3854 |
  | Rút máu mỗi giây (3 giây) | 97 | 345 | 964 |
  | Chu kỳ · bán kính | 9.5 s · 68 px | 6.7 s · 80 px | 5.4 s · 92 px |
  Cấp thẻ: LV11 → LV15: +15% sát thương mỗi cấp, tới +60%.
  Mạnh/yếu: gom và nghiền cả đám quái, giữ quái lại 3 giây; ít tác dụng kéo với trùm, chu kỳ dài. Hợp với: Cannon, Mortar, Venom.

### Overlord — Overlord · Cổ đại · Tấn công
- **Skill:** Nạp chậm; đầy thì giáng SIÊU SẤM vào quái đầu: ×9 sát thương nổ vùng 92 px, rồi sét dư chấn nhảy tới 4 quái gần nhất ngoài vùng nổ (mỗi con ×2). Trong lúc nạp (35–80%) còn bắn tia lửa điện vào quái gần nhất mỗi 1,2 giây (×1,2). Không có kỹ năng chủ động.
- **Trên màn hình thấy gì:** đầu súng sáng dần theo độ nạp; vòng 3 cung quanh ụ: DORMANT (tia lửa tĩnh điện lấm tấm) → CHARGING (tia điện đỏ nhảy ra) → OVERCHARGED (cung đỉnh đầy dần); mỗi lần đổi dạng có hoạt ảnh biến hình. Khi bắn: nòng giật cực mạnh, 3 tia sét khổng lồ (từ nòng và từ trời) giáng xuống, cột sét từ trời, vòng cháy đen trên đất, chớp trắng cả màn, rung mạnh, sét dư chấn nối sang quái khác.
- **Khi nào biến đổi / kích hoạt:** bắn khi nạp đầy, có quái và đầu súng đã quay đúng hướng. Buff tốc bắn làm nạp nhanh hơn. Mốc chung (loại tự quản nhịp): 3★ QUICK HANDS +20% tốc nạp; 5★ OVERCHARGE +25% sát thương; 7★ APEX +30% sát thương, +10% chí mạng.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Siêu sấm (×9, vùng 92 px) | 680 | 2415 | 6745 |
  | Mỗi sét dư chấn (×2, tối đa 4 quái) | 151 | 537 | 1499 |
  | Thời gian nạp | 7.0 s | 4.6 s | 3.3 s |
  Cấp thẻ: LV11 → LV15: +15% sát thương mỗi cấp, tới +60%.
  Mạnh/yếu: một đòn xoá sổ cả cụm và gây sát thương khủng lên trùm; giữa hai đòn khá im, quái lẻ chạy nhanh có thể lọt. Hợp với: Venom, Radar, Wall Projector.

### Hive Queen — Chúa Tổ · Cổ đại · Tấn công
- **Skill:** Tự bắn kim chích vào quái, đồng thời cứ vài giây "đẻ" thêm 1 drone ong máy. Drone bay quanh tổ và tự chích quái gần nhất trong 150 px (60% sát thương ụ, 2 phát/giây). Từ 3★ có chiêu chủ động SWARM: cả bầy lao vào chỗ quái đông nhất, mỗi con nổ ×3 sát thương trong 35 px.
- **Trên màn hình thấy gì:** đàn ong máy nhỏ (ảnh PNG) bay vòng quanh ụ, vệt tia chích cam ngắn tới quái; ong chúa vàng to hơn ở 7★. Khi dùng SWARM: chữ "SWARM!", vòng lửa cam quanh ụ, từng con ong kéo vệt sáng lao xuống và nổ (có cảnh đặc biệt: nữ hoàng xoè thân, nổ tổ ong dọc đường). Vòng 3 cung quanh ụ (NEST → HIVE → ROYAL HIVE) + cung nạp mảnh bên trong màu đỏ cam, đầy thì nhấp nháy trắng → chạm để dùng.
- **Khi nào biến đổi / kích hoạt:** đẻ drone tự động (4 s/con ở 1★ → 2.2 s ở 7★), tối đa 12 drone cả bàn. SWARM nạp 30 s, chỉ mở từ 3★; xong bầy đẻ lại từ đầu. Mốc riêng (không có mốc chung): 3★ SWARM mở chiêu; 5★ QUICK BROOD nhiều drone, đẻ nhanh hơn; 7★ ROYAL BROOD cứ con thứ 5 là ong vàng ×3 sát thương. Đổi dạng: 4★ drone đậu lên 4 ụ kề và cho chúng +10% tốc bắn; 7★ dạng hoàng gia.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương kim chích/phát (1 phát/giây) | 43 | 153 | 264 |
  | Sát thương mỗi drone/phát (2 phát/giây) | 26 | 92 | 158 (ong vàng 474) |
  | Số drone tối đa · thời gian đẻ 1 con | 3 · 4 s | 6 · 3.1 s | 10 · 2.2 s |
  | SWARM: mỗi drone nổ | 130 | 460 | 791 (ong vàng 2372) |
  Cấp thẻ: LV11 → LV15: +15% sát thương mỗi cấp, tới +60% (áp cho cả kim, drone và SWARM).
  Mạnh/yếu: nhiều nguồn sát thương cùng lúc và còn tăng tốc ụ bên cạnh; drone chỉ đánh trong 150 px nên quái ở xa tổ thì ít bị chích. Hợp với: Radar, Crit Antenna, Star Breaker.

### Leviathan — Thuỷ Quái · Cổ đại · Tấn công
- **Skill:** Bắn bọt nước nổ lan 30 px (quái bên cạnh nhận 50%). Định kỳ NUỐT CHỬNG 1 quái thường gần ụ (trong 120 px, chọn con máu nhiều nhất, không nuốt trùm), mỗi con nuốt được +1 điểm VỰC SÂU (ABYSS) = +4% sát thương vĩnh viễn, tối đa 100 điểm (+400%). Từ 3★ có chiêu chủ động TIDAL BREATH: tia nước quét dọc cả đường, mỗi quái trúng 1 lần ×(4 + 0.1×số điểm ABYSS) sát thương và bị đẩy lùi.
- **Trên màn hình thấy gì:** bọt nước xanh biển (to hơn ở 7★) nổ thành vòng nước; khi nuốt: xoáy nước quay hút quái biến mất rồi tia nước bay về ụ, chữ "+1 ABYSS"/"+3 ABYSS". Quanh ụ có các đốm sao vàng (4 / 8 / 12 cái khi ABYSS 0 / 40 / 80), số ABYSS hiện ở đáy ô. TIDAL BREATH: chữ "TIDAL BREATH!", màn hình loé xanh, hàm thuỷ quái trồi lên và dải nước chạy dọc đường. Vòng 3 cung quanh ụ (HATCHLING → DEEP ONE → ABYSS LORD) + cung nạp màu xanh ngọc, đầy thì nhấp nháy trắng → chạm để dùng.
- **Khi nào biến đổi / kích hoạt:** nuốt mỗi 9 s (1★) → 7 s (4★) → 5 s (7★). TIDAL BREATH nạp 35 s, mở từ 3★. Mốc riêng: 3★ TIDAL BREATH; 5★ DEEP MAW nuốt được quái to (×3 điểm) — thực tế có từ 4★; 7★ ABYSS LORD nuốt mỗi 5 s và nuốt được cả quái bay.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương/phát, 0.9 phát/giây (ABYSS 0 → 100) | 65 → 324 | 230 → 1150 | 395 → 1976 |
  | Nuốt 1 quái mỗi | 9 s | 7 s | 5 s |
  | TIDAL BREATH mỗi quái (ABYSS 0 → 100) | 259 → 4536 | 920 → 16100 | 1581 → 27670 |
  Cấp thẻ: LV11 → LV15: +15% sát thương mỗi cấp, tới +60%.
  Mạnh/yếu: càng đánh lâu càng mạnh (tới +400% sát thương), dọn đường tốt; đầu trận yếu vì chưa có điểm ABYSS và không nuốt được trùm. (Chiêu thở nhân cả phần +% của ABYSS nên ở 100 điểm mạnh gấp ~17 lần lúc 0 điểm.) Hợp với: Chiller, Armor Breaker, Radar.

### Wyrm Engine — Rồng Máy · Cổ đại · Tấn công
- **Skill:** Phun lửa HÌNH NÓN liên tục (5 nhịp/giây) vào mọi quái trong nón, gắn CHÁY 3 s (mỗi giây ~60% sát thương 1 nhịp) và để lại vệt cháy trên đường. Từ 3★ có chiêu chủ động DRAGON DIVE: rồng máy bổ nhào dọc toàn bộ đường, mỗi quái trúng ×25 sát thương (trùm thêm 5% máu tối đa), rải vệt cháy 3 s.
- **Trên màn hình thấy gì:** nón lửa cam (1–3★), lửa XANH (4–6★), lửa TRẮNG viền xanh (7★) phun từ đầu súng, đốm than hồng trên đường. Đầu súng có 3 dạng ảnh khác nhau (WHELP → BLUE WYRM → WHITE WYRM) với hoạt ảnh biến hình. DRAGON DIVE: chữ "DRAGON DIVE!", màn rung, rồng thức giấc dang cánh rồi bay dọc đường phun lửa, kết thúc bằng huy hiệu rồng cháy. Vòng 3 cung quanh ụ + cung nạp màu đỏ lửa, đầy thì nhấp nháy trắng → chạm để dùng.
- **Khi nào biến đổi / kích hoạt:** phun tự động khi có quái trong tầm. DRAGON DIVE nạp 35 s, mở từ 3★. Mốc riêng: 3★ DRAGON DIVE; 5★ BLUE FLAME +30% với quái to và trùm (thực tế có từ 4★); 7★ WHITE FLAME nón dài thêm 15%, vệt cháy giữ 4 s.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương mỗi nhịp lửa (5 nhịp/giây, đánh cả nón) | 27 | 96 | 165 |
  | Góc nón × tầm | 40° × 100 px | 55° × 115 px | 75° × 155 px |
  | DRAGON DIVE mỗi quái | 675 | 2397 | 4118 |
  Cấp thẻ: LV11 → LV15: +15% sát thương mỗi cấp, tới +60%.
  Mạnh/yếu: rất mạnh với đám quái đông và quái to (từ 4★); tầm ngắn, phải đặt gần đường. Hợp với: Amplifier, Chiller, Radar.


**— Hỗ trợ —**

### Cryo Reactor — Lò Phản Ứng Băng · Cổ đại · Hỗ trợ
- **Skill:** Không bắn. Toả hào quang lạnh làm chậm mọi quái trong vùng quanh lò (cập nhật 2,5 lần/giây; trùm chỉ bị chậm 15%). Ụ Tấn công ở 4 ô kề đánh quái đang bị chậm mạnh hơn. Kỹ năng chủ động BÃO BĂNG: nạp đầy trong 24 giây, chạm lò để đóng băng mọi quái trong vùng rộng gấp 1,6 lần (trùm chỉ 0,8 giây), không gây sát thương. Nếu để đầy hơn 6 giây mà có từ 5 quái trong vùng hoặc có trùm, game tự kích hoạt.
- **Trên màn hình thấy gì:** ụ grow-up 3 dạng theo mức nạp: IDLE CORE (dưới 50%), HEATING (50–99%), CRYO STORM READY (đầy). Mỗi nhịp hào quang có vòng sương lạnh toả ra; từ dạng 2 thêm 3 kim băng bay tới quái chậm nhất (chỉ là hình); dạng 3 có sàn lưới băng lục giác dưới lò. Từ 3★ có vòng nạp mảnh bên trong, đầy thì nhấp nháy trắng. Khi dùng: vòng băng lớn, chớp trắng, rung màn, quái vỡ băng, chữ "ICE STORM!". Hạt tuyết bay trên quái bị chậm.
- **Khi nào biến đổi / kích hoạt:** hào quang luôn bật; bão băng khi chạm (dùng được từ 1★ dù vòng nạp bên trong chỉ hiện từ 3★). Mốc riêng: 3★ COLD FRONT — vùng +20 px; 5★ DEEP COLD — trùm trong vùng tung chiêu chậm 25%, đóng băng kéo dài 4 giây; 7★ ABSOLUTE ZERO — quái trong vùng nhận +10% sát thương từ mọi nguồn. Buff kề theo đường cong hỗ trợ (×1.45 / ×1.9 / ×2.35).
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Ụ kề +sát thương vào quái chậm (Cổ đại LV11, chưa power-up) | +14% | +23.1% | +32.9% |
  | Làm chậm · bán kính vùng | 15% · 115 px | 21% · 150 px | 27% · 165 px |
  | Bão băng: thời gian đóng băng · bán kính | 2.5 s · 184 px | 2.5 s · 240 px | 4 s · 264 px |
  Cấp thẻ: LV11 → LV15: buff gốc 1★ 14% → 19.6% (7★ ≈ +46%, bị trần 35%); độ chậm, vùng và bão băng không đổi.
  Mạnh/yếu: khống chế đám đông rất tốt và tăng sát thương cho ụ kề; bản thân không gây sát thương, trùm chịu ảnh hưởng ít. Hợp với: Ice Blade, Frost, Chiller.


**— Đặc biệt —**

### Holy Halo — Hào Quang Thánh · Cổ đại · Đặc biệt
- **Skill:** Không bắn. Tự nạp năng lượng; đầy thì chạm để bật HÀO QUANG THÁNH vài giây cho cả đội (co-op: cả 2 bàn): quái thường lọt tới cuối đường KHÔNG làm mất tim, bàn có khiên chặn chiêu đối thủ. Chiêu của trùm chỉ bị giảm (chiêu nhắm nhiều ụ chỉ còn trúng 1 ụ; Freezer vẫn trúng hết nhưng thời gian băng còn một nửa). Game cũng tự bật ngay khi đầy nếu có trùm đang nhắm chiêu vào bàn, có ụ bị đóng băng/hoá đá/cháy/kẹp, hoặc còn 1 tim mà quái sắp lọt.
- **Trên màn hình thấy gì:** vòng nạp màu kem quanh bệ đầy dần, >80% thì nhấp nháy; đầy thì ụ có quầng sáng kem phập phồng; đầu quay chậm đều. Khi bật: vòng sáng lớn toả ra, chớp sáng, tia phép nối tới mọi ụ trên bàn, chữ "HOLY HALO!". Quái lọt lúc có hào quang biến mất với chữ "HALO" ở cuối đường.
- **Khi nào biến đổi / kích hoạt:** hồi chiêu 40 giây − 2 giây mỗi sao (tối thiểu 28 giây); dùng được từ 1★. Mốc riêng: 3★ STEADY HALO — hào quang 2,5 giây; 5★ PURGE — còn gỡ băng/đá/cháy/kẹp cho mọi ụ; 7★ BLESSING — hào quang 3,5 giây và mọi ụ +30% tốc bắn trong 5,5 giây.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Thời gian hào quang | 2 s | 2.5 s | 3.5 s |
  | Hồi chiêu | 38 s | 32 s | 28 s |
  | Thêm | — | — | gỡ hiệu ứng xấu, +30% tốc bắn |
  Cấp thẻ: LV11 → LV15: không có chỉ số kỹ năng tăng theo cấp; phần "+15% sát thương mỗi cấp" không có tác dụng vì ụ không gây sát thương.
  Mạnh/yếu: cứu tim và chặn chiêu trùm vào lúc nguy cấp; thời gian bảo vệ ngắn, hồi chiêu dài. Hợp với: Shield Gen, Cleanser, Mirror Gate.

### Chrono Throne — Ngai Thời Gian · Cổ đại · Đặc biệt
- **Skill:** Nội tại: mọi quái trên đường của bạn chậm dần, thêm 1% mỗi giây chúng còn sống, tới mức tối đa theo sao (trùm tối đa 20%; quái kháng chậm miễn). Ụ bắn kim đồng hồ xuyên mọi quái trên đường tới mục tiêu. Kỹ năng CHỦ ĐỘNG REWIND (từ 3★): chạm khi đầy → mọi quái bị tua ngược lại một phần quãng đã đi (trùm ⅓) và nhận ×6 sát thương.
- **Trên màn hình thấy gì:** dưới mỗi quái có cung tròn mảnh, dài dần theo độ chậm (đỏ khi tối đa). Kim vàng bay vụt xuyên quái; 4–6★ kim đóng dấu mặt đồng hồ lên quái đầu (chậm thêm 8% trong 1 s); 7★ kim xuyên cả đường và 0.3 s sau có "tiếng vọng" đánh lại 40%. Vòng nạp đỏ quanh bệ và vòng nạp mảnh của kỹ năng chủ động; đầy thì ụ rực đỏ nhấp nháy. Khi REWIND: chữ đỏ "REWIND!" to, mặt đồng hồ đỏ quay ngược, quái trượt lùi kèm vệt mờ, màn hình chớp đỏ và rung, cảnh ngai đồng hồ trồi lên, kim quay ngược, đồng hồ cát vỡ.
- **Khi nào biến đổi / kích hoạt:** REWIND mở ở 3★; nếu đầy mà bạn không chạm, sau 5 s nó tự dùng khi có trùm hoặc quái sắp tới lối ra (còn dưới 30% đường). Dạng theo sao: 1–3★ / 4–6★ / 7★. Mốc sao: 3★ REWIND (thay QUICK HANDS: không +20% tốc) · 5★ DOUBLE TAP · 7★ TIME RESTORED: Rewind hồi 1 tim, 1 lần/trận (không có APEX). Co-op 7★: cứu 1 lần quái lọt mỗi trận (tự tua ngược, chữ "TIME SAVE!"); Rewind tác động cả 2 đường.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | Sát thương kim (LV đầu) · tốc bắn | 43.2 · 0.8/s | 153.4 · 0.8/s | 263.5 · 0.8/s |
  | Chậm tối đa (nội tại) | 15% | 24% | 35% |
  | REWIND: lùi · sát thương · hồi chiêu | — (mở ở 3★) | 21% · 920 · 34 s | 30% · 1581 · 28 s |
  Cấp thẻ: LV11 → LV15: sát thương +15% mỗi cấp, tới +60% (cả kim lẫn Rewind).
  Mạnh/yếu: khống chế toàn đường rất mạnh, cứu thua cuối trận; sát thương thường không cao và 1–2★ chưa có Rewind. Hợp với: Black Hole, Wall Projector, Chrono Lock.

### Genesis Core — Lõi Khởi Sinh · Cổ đại · Đặc biệt
- **Skill:** Không bắn. Cứ mỗi khoảng thời gian, tự +1★ cho ụ SAO THẤP NHẤT trên bàn (không tính chính nó và ụ Genesis khác; hoà thì chọn ngẫu nhiên; Co-op có thể chọn ụ đồng đội nếu thấp hơn). Từ 3★ có chiêu chủ động GENESIS: gọi thêm ụ (loại ngẫu nhiên trong bộ bài) ở mức SAO TRUNG BÌNH của bàn vào ô trống.
- **Trên màn hình thấy gì:** 3 vành phù văn vàng/hồng quay quanh ụ; từ 4★ thêm 8 đốm sáng vàng như cánh sen; 7★ có quầng hồng và ngôi sao trắng ở lõi. Gần tới lượt nâng sao ụ loé sáng vàng. Khi nâng sao: tia sáng cong bay từ lõi sang ụ được nâng, chữ "GENESIS +1★". Khi dùng chiêu: chữ "GENESIS ×n (x★)", vòng hồng loé. Vòng 3 cung quanh ụ (SEED → BLOSSOM → LOTUS OF LIFE) + cung nạp màu hồng đỏ, đầy thì nhấp nháy trắng → chạm để dùng (chỉ dùng được khi bàn còn ô trống).
- **Khi nào biến đổi / kích hoạt:** nâng sao tự động mỗi 30 s (1★) → 24 s (4★) → 16 s (7★). GENESIS nạp 45 s, mở từ 3★. Mốc riêng: 3★ GENESIS; 5★ BLOOM 4 ô kề +15% sát thương (thực tế có từ 4★); 7★ SEED OF LIFE mỗi lần nâng sao còn gọi thêm 1 ụ 1★ miễn phí nếu còn ô trống.
- **Sức mạnh:**
  | | 1★ | 4★ | 7★ |
  |---|---|---|---|
  | +1★ cho ụ yếu nhất mỗi | 30 s | 24 s | 16 s |
  | GENESIS gọi số ụ | 1 (chưa mở) | 2 | 3 |
  | 4 ô kề +sát thương | — | +15% | +15% |
  Cấp thẻ: LV11 → LV15: không làm kỹ năng mạnh hơn (ụ không gây sát thương, không có mục kỹ năng theo cấp).
  Mạnh/yếu: tạo sao "miễn phí" đều đặn, lấp bàn nhanh; tự nó không gây sát thương. Hợp với: Merge King, Twin Maker, Star Cannon.

---

## Chỉ huy (Commander / Ma vương)

Mỗi trận chọn 1 chỉ huy. Nút chỉ huy ở khay dưới, trả bằng mana; **mỗi lần dùng giá ×2**, có hồi chiêu. Chỉ tác dụng lên bàn của mình (CO-OP không lan sang đồng đội). Đồng hồ tác dụng tạm dừng khi đang nghỉ giữa 2 wave mà bàn không còn quái.

### REINFORCE (Tăng viện) — giá 30 → 60 → 120… · hồi 15 giây
- **Làm gì:** gọi ngay **2 ụ 1★ miễn phí** (không làm tăng giá Triệu hồi). Thiếu ô trống → mỗi ụ thiếu chỗ thành **+1★ cho ụ yếu nhất** (sao thấp nhất, bậc thấp nhất; bỏ qua ụ đá và ụ 7★). Bàn đầy và mọi ụ đã 7★ → không dùng được, không trừ mana.
- **Trên màn hình:** 2 ụ mới hiện lên với hoạt ảnh triệu hồi, hoặc ụ được nâng có hiệu ứng lên sao.

### RAGE (Cuồng nộ) — giá 40 → 80 → 160… · hồi 25 giây
- **Làm gì:** **+100% sát thương (×2) cho cả bàn trong 10 giây.** Dùng lại khi còn hiệu lực chỉ làm mới thời gian, không cộng dồn.
- **Trên màn hình:** biểu tượng ngọn lửa; mọi ụ phủ ánh cam đỏ trong lúc RAGE.

### HOLY SHIELD (Khiên thánh) — giá 40 → 80 → 160… · hồi 25 giây
- **Làm gì:** ngay lúc dùng **gỡ hết hiệu ứng xấu** trên bàn (băng, đá, lửa, bị ngắm), rồi **chặn mọi chiêu trùm** (và chiêu phá của đối thủ PVP) trong **8 giây**.
- **Trên màn hình:** chiêu trùm đánh vào bị khiên lục giác chặn, hiện chữ **BLOCKED**.

## Trùm (Boss)

Trùm ra ở wave 10, 20, 30… (PVP từ wave 30 là "đột tử": wave nào cũng có trùm, máu tăng dần). Máu trùm ≈ 30 lần máu quái thường của wave đó và còn tăng theo wave. **Trùm lọt qua mất 2 tim.**
**Nhịp chiêu:** chiêu đầu sau khoảng 4,5 giây; sau đó mỗi **10 giây** (càng về sau càng nhanh, nhanh nhất 6 giây). Trước mỗi chiêu có **báo trước 1,4 giây**: trùm giơ tay tung chiêu, chữ tên chiêu (vd "SCRAMBLE!") hiện trên đầu trùm, **tâm ngắm đỏ** hiện trên các ụ sắp bị đánh. Ụ có khiên (Shield Gen, Sanctum, Holy Halo, HOLY SHIELD) có thể chặn.

**6 trùm gốc (có từ wave 10):**

| Trùm | Chiêu | Làm gì | Trên màn hình |
|---|---|---|---|
| MAD CROWN | SCRAMBLE | Biến 3 ụ ngẫu nhiên thành loại khác trong bộ bài (giữ sao) | tia hồng bắn tới ụ, ụ nổ tia lửa hồng rồi đổi hình |
| FREEZER | DEEP FREEZE | Đóng băng 3 ụ sao cao nhất 6 giây (+1 ụ mỗi 20 wave, tối đa 5). Ụ đóng băng không bắn, không ghép | mảnh băng bay tới, ụ bị bọc băng rồi vỡ ra |
| JANUS CUBE | PETRIFY | Hoá đá 1 ụ: đá không bắn, chỉ ghép được với đá cùng sao → ra đá cao hơn | ụ xám lại, bụi bay, màn rung |
| JOKER KING | FORCE MERGE | Ném Mimic vào 1 ụ rồi ép ghép với 1 ụ cùng sao | ụ hoá Mimic, tự ghép |
| NIGHTMARE | SNIPE | Bắn ụ sao cao nhất: −1★ (ụ 1★ thì nổ mất) | tia bắn tỉa đỏ |
| OCTOPUS EYES | BURN | Đốt 3 ụ 6 giây: hết lửa mà chưa được tẩy thì −1★ | ụ cháy ánh cam |

**6 trùm mới (vào bể trùm ngẫu nhiên từ wave ghi bên cạnh; CO-OP từ wave 60):**

| Trùm | Từ wave | Chiêu | Làm gì |
|---|---|---|---|
| HIVE MOTHER | 10 | SWARM | Thả 4 drone bay lên trước mặt nó (6 drone từ wave 40); chữ "SWARM ×n" |
| STATIC JAMMER | 20 | JAM | Gây nhiễu 2 ụ (ưu tiên ụ Hỗ trợ): không bắn, không ghép, không buff trong 6 giây; ụ bị xích + chữ "JAMMED" |
| PRISM WARDEN | 20 | PRISM SHIELD | Khiên giảm 90% sát thương cho tới khi bị 3 loại ụ khác nhau bắn trúng (4 loại từ wave 40); vỡ thì một lúc sau dựng lại, chữ "SHIELD UP" |
| TWIN CORE | 30 | SPLIT | Bị phá thì tách thành 2 lõi nhỏ chạy nhanh; chữ "SPLIT!" |
| PATCH TITAN | 30 | REPAIR | Hồi 12% máu cho nó và 35% cho mọi quái cùng làn; chữ "+12% REPAIR" |
| STAR LEECH | 40 | STAR THEFT | Cướp 1★ của ụ mạnh nhất rồi lao nhanh (chữ "DASH!"); giết được nó thì lấy lại sao (chữ "+1★ RETURNED") |

---

## Chỗ mô tả lệch code

Những chỗ chữ hiển thị trong game (hoặc tài liệu/luật đã chốt) nói khác với cách code đang chạy thật. Chỉ ghi lại, **chưa sửa code**.

- **Frost:** chữ mô tả chỉ ghi "trùm 0,6 s", không nói quái to chỉ bị đóng băng 60% thời gian (code có giảm).
- **Mana Core:** nhãn khi chạm ụ luôn ghi "+N MANA / 7s" nhưng từ 3★ code là 6 s và 7★ là 5 s.
- **Armor Breaker:** chữ mô tả và nhãn "+..% VS EXPOSED" ghi số chưa kẹp trần (vd 7★ ghi +52%), nhưng code kẹp thêm sát thương ở trần chung 35%.
- **Time Bomb:** hàng CARD LEVEL trên trang ụ ghi lên cấp được "+..% damage", nhưng Time Bomb không gây sát thương nên lên cấp thẻ thực tế không mạnh thêm.
- **Crit Antenna:** chữ mô tả và nhãn "+..% CRIT" ghi số chưa kẹp trần (vd 7★ LV15 ghi +28%), nhưng code kẹp chí mạng từ ụ Hỗ trợ ở 20%.
- **Radar:** mốc 7★ ghi "+25% fire rate 2s" nhưng vì trần 45%, ở 7★ (đã +28%) thực tế chỉ thêm khoảng +17%.
- **Laser:** mốc 7★ APEX ghi "+10% crit" nhưng tia Laser không bao giờ chí mạng.
- **Mine Layer:** chữ mô tả "Mine ×7 every … s" và dòng nhịp "mine every … s" vẫn tính theo nhịp gốc, chưa trừ 3★ QUICK HANDS (+20%), nên từ 3★ thực tế rải nhanh hơn số ghi (vd 4★ ghi 3.2 s nhưng thật ~2.7 s).
- **Jammer:** danh sách roster gọi ụ này là "Clamp" nhưng trong game tên hiển thị là "Jammer"; dòng mô tả ở 7★ vẫn ghi số ụ bị kẹp/% tăng tốc dù 7★ không ghép được nữa.
- **Reaper Pillar:** nhãn khi chạm ụ ("x% INSTANT KILL") hiện số chưa kẹp trần (vd 7★ ghi 18.8%) trong khi code chỉ cho tối đa 15%; dòng mô tả trong bảng thông tin thì đã kẹp đúng 15%.
- **Scrambler:** chữ mô tả ngắn (và tên kỹ năng tiếng Việt) chỉ nói tác dụng ở PVP, nhưng code còn tạo cặp ghép cho bàn mình/đồng đội ở SOLO và CO-OP.
- **Orbital:** bảng dạng đánh ghi "salvo … every 1.8s" nhưng từ 3★ code là 1,5 s.
- **Cryo Reactor:** chữ mô tả ghi 'TAP when full: FREEZE', nhưng code tự kích hoạt bão băng nếu để đầy quá 6 s khi có ≥5 quái trong vùng hoặc có trùm.
- **Holy Halo:** chữ mô tả chỉ ghi 'TAP' (chạm để dùng), nhưng trên bàn người chơi code tự bật hào quang ~0,3 s sau khi đầy nếu có trùm nhắm chiêu / ụ bị khống chế / còn 1 tim và quái sắp lọt.
- **Hydra:** mốc 7★ FUSED HEAD và dòng nhịp bắn ghi tia "0.6/s", nhưng code cộng cả QUICK HANDS +20% nên thực tế 0.72 tia/s (và còn nhanh hơn nếu được buff tốc).
- **Pandora Vault:** mốc 7★ OPEN VAULT ghi "mỗi lần mở ra 2 phép", nhưng ụ 7★ không ghép được nữa nên không mở lại; 2 phép chỉ xảy ra lúc ghép 2 ụ 6★ thành 7★. Dòng mô tả ở 6★ vẫn ghi "lần ghép sau quay 2 lần giữ cái tốt hơn" trong khi lần ghép đó thực ra ra 2 phép.
- **Resonance Grid:** dòng "tấn công theo dạng" ghi dạng 3 "bắn thêm 1 đạn vọng", nhưng viên đạn vọng đó chỉ là hiệu ứng hình, không gây sát thương.
- **Scrap Forge:** chữ ghi "ụ Tấn công mạnh nhất được sát thương VĨNH VIỄN", nhưng code chỉ giữ cộng dồn trên Forge; buff chuyển theo ụ Tấn công sao cao nhất lúc đó và mất nếu Forge bị ghép mất/biến mất.
- **Scrap Forge:** trang thẻ hiện "+% sát thương" khi lên cấp (Forge không có mục kỹ năng theo cấp) nhưng Forge không gây sát thương nên cấp thẻ không có tác dụng.
- **Scrap Forge:** roster.json ghi vai "tc" (Tấn công) nhưng code là Đặc biệt.
- **Mirror Gate:** roster.json ghi vai "db" (Đặc biệt) nhưng code là Hỗ trợ.
- **Marionette:** dòng mô tả ghi "mỗi 10 / 8.5 / 7 s" nhưng từ 3★ QUICK HANDS làm nhịp nhanh hơn 20% (4★ thực tế ~7.1 s, 7★ ~5.8 s). Chữ ghi "đâm gây 30% máu của nó" nhưng code còn giới hạn mỗi cú tối đa 4 lần sát thương 1 phát, và chỉ 6 quái đầu tiên bị đâm.
- **Hive Queen:** mốc 5★ "QUICK BROOD" ghi như một bước nhảy, nhưng code tăng số drone và tốc đẻ đều đặn từng sao (1★→7★), 5★ không có gì thêm riêng.
- **Genesis Core:** trang thẻ vẫn hiện "+% damage" khi lên cấp, nhưng ụ không gây sát thương và không có mục kỹ năng theo cấp → lên cấp thẻ không có tác dụng gì.
- **Hero Foundry:** trang ụ 7★ ghi "+44% / LV15 56% fire rate" theo sao hiện tại, nhưng ụ 7★ không ghép được nữa nên con số đó không bao giờ xảy ra (cao nhất là ghép 2 ụ 6★: +40%, LV15 +52%).
- **Blood Circuit:** chữ ghi kéo lên "BẤT KỲ ụ" (ANY), nhưng code không cho kéo lên một Blood Circuit khác.
- **Sanctum:** khi chạm Sanctum 5★+, phần hiển thị hỗ trợ chỉ vẽ dây tới 4 ô thẳng, nhưng code buff/khiên cả 8 ô xung quanh.
- **Evolver:** theo luật đã chốt trong tài liệu ("Evolver 7★ bị mất sao thì đếm lại từ đầu"), nhưng code hiện tại **giữ nguyên thời gian đã chờ** khi mất sao (ngưỡng mới ngắn hơn nên có thể biến ngay).
- **Chung:** nhiều trang thẻ ghi "+% sát thương mỗi cấp" cho cả ụ không gây sát thương (Time Bomb, Genesis Core, Scrap Forge, Holy Halo…) — với các ụ này lên cấp thẻ thực tế không mạnh thêm.
- **Chung:** các nhãn chữ nổi tên kỹ năng trên ụ (CLUSTER, OVERDRIVE, BINGO ROW!, TIME LOCK!, RICOCHET ×n, JUDGMENT!, DAY/NIGHT…) đang bị tắt trong code, nên chữ mô tả/hướng dẫn nhắc tới chúng sẽ không thấy trong trận.
