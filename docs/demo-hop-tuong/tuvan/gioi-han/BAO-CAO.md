# Giới hạn kỹ năng ụ — rà soát + đề xuất (06/11/2026)

Việc này **chỉ rà soát và đề xuất**, chưa sửa code gameplay. Số liệu đọc thẳng từ code nhánh `claude/demo-hop-tuong` (thap/js), có file:dòng ở bảng đầy đủ bên dưới.

## 1. DCDW làm thế nào (tóm tắt nghiên cứu)

- **"Katarina" không có trong DCDW.** Con lửa cộng dồn là **Kalaratri (카라라트리)**, ra 04/02/2022 — chính là con Ember Relay đang mô phỏng (comment ở vangmoi1.js). Câu kỹ năng gốc duy nhất tìm được: *"보유한 불꽃의 숫자만큼 대미지와 치명타 확률이 증가하며, 전투 시 합체하면 **십자 방향**에 있는 동일 차일드에게 불꽃을 지급하고, 공속 버프가 주어진다."* ([MuMu blog](https://www.mumuplayer.com/kr/blog/destiny-child-new-character.html))
  - Nghĩa: số lửa đang giữ → +sát thương & +chí mạng; ghép trong trận → cho lửa các Kalaratri **theo hướng chữ thập**, kèm buff tốc đánh.
  - "십자 방향" (hướng chữ thập) **có thể hiểu là cả tia hàng + cột** — khớp với trí nhớ của bạn ("cả hàng/cột"). Code mình đang hiểu hẹp là **chỉ 4 ô kề**. Số %/lửa và trần: **không có nguồn công khai** (namu.wiki lỗi tải).
- Child khác (chủ yếu từ ghi chú cũ trong repo, xem phụ lục): Cosmem đếm cả bàn (trần 15) · Darby theo tổng ★ cả bàn · Removal Tee kín hàng/cột · Dana cả bàn cùng ★ · Mafdet ghép → MỌI Mafdet thức tỉnh · Mars 4 ô kề, nhiều Mars cộng dồn.
- **Mẫu DCDW:** buff thường là 4 ô kề / chữ thập, cả bàn khi có điều kiện "cùng loại/cùng ★"; kích hoạt chủ yếu bằng ghép; **trần số nhỏ rất hiếm** — trần đến tự nhiên từ bàn 15 ô và 7★. Cấp thẻ làm mạnh chính kỹ năng (~+10%/cấp ở Huyền thoại).

## 2. Hai lỗi gốc làm nhiều ụ "bị bó"

1. **Trần hỗ trợ quá thấp so với giá trị 1★.** Nhiều ụ hỗ trợ chạm trần ngay ở 1–2★ → lên ★, cấp thẻ, power-up **không còn tác dụng** (Reaper Pillar, Mirror Gate, Focus Lens, Crit Antenna, Armor Breaker, Amplifier…).
2. **Quyết định "cấp thẻ nâng trần hỗ trợ" CHƯA có trong code.** Trần chỉ nhân theo bậc (`HOTRO.CAP_BAC`, hotro.js:18). Còn **power-up** vẫn bỏ qua 6 ụ không gây sát thương (`PU_KHONG` thatso.js:155: khien, hopbi, tuthan, tienhoa, haoquang, loren) + bomhen — trái với quyết định "power-up tăng cả kỹ năng không gây sát thương".
3. (Phụ) **Ghép luôn ra ụ ngẫu nhiên mới** (game.js:199) → mọi cộng dồn trên 2 ụ đem ghép **mất sạch** (lửa Relay, lò Forge, Vực Sâu Leviathan, Ép Xung, đếm Hộp Bí Ẩn).

## 3. Top ụ bị giới hạn lạ / chặt nhất

| # | Ụ | Bị bó thế nào | Đề xuất ngắn |
|---|---|---|---|
| 1 | **Ember Relay** (Vàng TC) | Ghép Relay chỉ +1 lửa cho Relay ở **4 ô kề**; **tối đa 5 lửa**; 2 Relay đem ghép **mất lửa**; phải xếp ≥3 Relay sát nhau | +1 lửa cho **mọi Relay cùng hàng + cùng cột**, trần 8, +10→15%/lửa, +2% chí mạng/lửa; ụ ra là Relay giữ lửa = max 2 nguyên liệu |
| 2 | **Amplifier** (Xanh HT) | Cộng dồn mỗi đòn dùng **chung trần sát thương 35%** → 1★ chạm trần ở cộng dồn thứ 3; ★/thẻ/power-up gần như vô dụng | Trần riêng cho "mỗi đòn" (25% + 4%/★ × bậc), +4.5%×K/đòn, tối đa 5 (5★: 7) |
| 3 | **Reaper Pillar** (Tím HT) | Giết ngay đã kẹt trần 19.5% **từ 1★** | Gốc 0.12·k → 0.06·k; trần tăng theo cấp thẻ (tới ~24%) |
| 4 | **Mirror Gate** (Vàng HT) | Kháng khống chế 34.5% ở 1★, **kẹp cứng 35%** | Gốc 0.15 → 0.08·k; trần 35% × bậc (Vàng 52%) |
| 5 | **Focus Lens** (Tím HT) | Sát thương chí mạng 60% ở 1★, trần 65% → chạm ở ~2★ | Gốc 0.30 → 0.18·k, hoặc trần Tím ×1.6 (80%) |
| 6 | **Crit Antenna** (Xanh HT) | 5★ đã vượt trần chí mạng 22% → 6★/7★/thẻ/power-up = 0 | Trần chí mạng chung 20 → 25% + cấp thẻ nâng trần |
| 7 | **Armor Breaker** (Trắng HT) | "Đánh quái LỘ" chung trần 35% với buff thường → từ 4–5★ không tăng nữa | Hạ gốc 0.22 → 0.13; tách trần cho buff có điều kiện |
| 8 | **Resonance Grid** (Vàng HT) | Chỉ 4 ô chéo; cộng hưởng ×1.5 cần đủ 4 ô chéo → chỉ 3 ô giữa làm được; phần thêm bị trần ăn mất | Cộng hưởng khi đủ mọi ô chéo hiện có (mép ×1.3, đủ 4 ×1.5), +10% trần riêng |
| 9 | **Fusion Mixer** (Xanh HT) | Cần nhiều **loại** TC khác nhau ở 4 ô kề; 7★ cần 4 loại → gần như không bao giờ | Đếm loại TC trên cả hàng + cột, 7★ cần ≥3 loại |
| 10 | **Leviathan** (Đỏ TC) | Chỉ nuốt trong 120 px → đặt hàng giữa cột 2–4 **không bao giờ nuốt**; Vực Sâu (trần 100) **mất khi ghép** | Vực Sâu lưu theo bàn (mọi Leviathan hưởng), tầm 160 px |
| 11 | **Star Lift** (Tím HT) | Chỉ buff 2 ụ ★ thấp nhất; trần 39% từ 2★; nâng ★ tối đa 2 lần/trận | Buff cả 4 ô kề (★ thấp nhất ×1.5), trần 50%, nâng ★ mỗi 2 wave |
| 12 | **Scrap Forge** (Vàng ĐB) | Tối đa 15 cộng dồn, trần +60%, chỉ 1 ụ TC mạnh nhất; mất khi ghép | Trần 60% + phần cấp thẻ (tới 82%), max 20, hoặc buff mọi ụ cùng loại với ụ mạnh nhất |

Mức 3/5 (hơi chặt, xem bảng đầy đủ): Radar (7★ OVERDRIVE bị trần tốc ăn), Railgun (kín 5/5 hoặc không gì), Hive Queen (12 drone/bàn), Wyrm Engine & Iron Fist (ô hàng giữa không với tới đường), Hero Foundry, Prism Thief (trần 10, phải cùng màu), Time Bomb (★/power-up không tăng suy yếu), Mana Leech, Teleporter, Cleanser, Mystery Box, Storm Gun, Star Breaker, Star Cannon, Rainbow, Cryo Reactor, Holy Halo, Lone Ace, Bounty Beacon (mana cố định 4–8 không theo wave), Marionette (rối chết không cho mana), giá Chỉ huy ×2 không trần.

**Lỗi nhỏ phát hiện kèm** (sửa khi làm): trần chậm lệch (apDung 35%×bậc nhưng khiTrung kẹp cứng 35%, hotro.js:81 vs 131) · Blizzard / Eclipse / Signal Jammer làm chậm trùm 20–51%, bỏ qua trần trùm 15% · Jammer ghi đè buff tốc thay vì lấy max (s2:504) · Time Bomb ghi đè `ywK` thay vì max · Genesis 4★ / Hive Queen 4★ cộng ngoài trần hỗ trợ · chữ 7★ Hydra 0.72/s nhưng code 0.6/s · comment Copycat "50→92%" sai (thật 70→94%, fallback code vẫn 50).

## 4. Cần bạn quyết

1. **Ember Relay — ai nhận lửa?**
   - **A (khuyên):** ghép Relay → +1 lửa cho **mọi Relay cùng hàng + cùng cột** (tia chữ thập, đúng câu gốc "십자 방향"); trần 8; +10%/lửa LV9 → 15% LV15 (tối đa +80→120%), +2% chí mạng/lửa; ụ ra là Relay nhận lửa = max của 2 nguyên liệu.
   - B: cả bàn nhận lửa; trần 6; +8→12%/lửa.
   - C: giữ 4 ô kề, chỉ bỏ "mất lửa khi ghép" + trần 5 → 8.
2. **Trần hỗ trợ theo cấp thẻ (quyết định cũ chưa vào code) — công thức?**
   - **A (khuyên):** trần = CAP × CAP_BAC × (1 + 0.5 × (hệ số thẻ − 1)) → thẻ max nới trần ~+20%; kèm **hạ giá trị 1★** của 5 ụ chạm trần sớm (Reaper, Mirror, Focus Lens, Armor Breaker, Crit Antenna) để ★ có ý nghĩa lại.
   - B: chỉ nới trần theo thẻ, không đổi giá trị 1★ (đơn giản nhưng ★ vẫn vô dụng với 5 ụ trên).
   - C: bỏ trần cho từng ụ, chỉ giữ trần nhóm tổng (gần DCDW nhất, rủi ro cân bằng cao).
3. **Buff có điều kiện (đánh quái LỘ / chậm / cầu vồng / mỗi đòn) có chung trần 35% với buff sát thương thường?**
   - **A (khuyên):** tách trần riêng 35% × bậc cho nhóm có điều kiện.
   - B: giữ chung nhưng nâng trần chung 35 → 50% khi có ≥2 loại hỗ trợ.
   - C: giữ như cũ.
4. **Trần chí mạng 20%:** **A (khuyên)** nâng 25% + thẻ nâng tiếp · B: giữ 20%, hạ bảng Crit Antenna ×0.75 · C: giữ nguyên.
5. **Power-up với ụ không gây sát thương (`PU_KHONG`: Shield Gen, Mystery Box, Reaper, Evolver, Holy Halo, Scrap Forge + Time Bomb):**
   - **A (khuyên):** mỗi bước power-up cho 1 hiệu ứng nhỏ riêng (vd. −3 s mở hộp, −1 s hồi Halo, +1% suy yếu Time Bomb, +3% trần Forge).
   - B: chỉ tăng thời gian/hồi chiêu chung 5%/bước cho mọi ụ trong danh sách.
   - C: giữ không bán power-up cho các ụ này.
6. **Cộng dồn mất khi ghép (Relay, Forge, Leviathan, Overclock, Mystery Box):**
   - **A (khuyên):** nếu ụ ra **cùng loại** thì giữ max cộng dồn của 2 nguyên liệu; Leviathan lưu Vực Sâu theo bàn.
   - B: giữ 50% cộng dồn cho ụ ra bất kể loại.
   - C: giữ như cũ (mất hết — đúng "ghép ra ngẫu nhiên" của DCDW).
7. **Ụ cần với tới đường (Leviathan, Wyrm Engine, Iron Fist) bị "chết" ở hàng giữa:**
   - **A (khuyên):** nới tầm để mọi ô với tới (Leviathan 160, Wyrm 165, Iron Fist 105 + 10/★).
   - B: không có quái trong tầm → đánh quái đầu với 50–60% sát thương.
   - C: giữ (coi là luật xếp chỗ).
8. **Ụ cần đếm "loại khác nhau" / hình đặc biệt (Fusion Mixer, Resonance Grid, Star Lift):**
   - **A (khuyên):** đổi sang đếm cả hàng + cột / mọi ô chéo hiện có, như bảng top.
   - B: giữ hình, chỉ hạ điều kiện (7★ Mixer cần 3 loại; Grid cộng hưởng ≥2 ô chéo).
9. **Lỗi nhỏ (mục 3):** **A (khuyên)** sửa hết cùng lúc khi làm đợt cân bằng · B: sửa riêng trước, không đợi.

Gợi ý thứ tự làm sau khi bạn chọn: (1) Relay → (2+3+4) trần hỗ trợ (một đợt, chạy lại `tools/thap-sim-tier.js`) → (5+6) → (7+8).

---

## 5. Bảng đầy đủ

Điểm 1–5: 5 = bó nhiều / lạ nhất cho người chơi. Ký hiệu file: `s2` skills2.js, `s4` skills4.js, `ht` hotro.js, `d` data.js, `g` game.js. K = hệ số ★ hỗ trợ (1★ 1 → 7★ 2.35) × bậc × power-up × cấp thẻ.

### Audit A: giới hạn kỹ năng ụ (skills.js · skills3.js · skills5.js · vangmoi1.js · skills7.js)

Chỉ đọc code, không sửa repo. Đã grep id trên toàn bộ thap/js/*.js để tìm chỗ vá đè: chỉ có thatso.js (thay chữ của radar/pandora, luật "7★ không ghép được nữa" cho pandora/xuonganh/nguyenrua ở thatso.js:47-52). motvong.js, nongskill.js và statthuc.js không đổi luật của ụ nào trong phạm vi này.

Ghi chú chung (áp cho nhiều dòng):
- **Ghép luôn ra ụ NGẪU NHIÊN mới** (game.js:199, sinhU → sinh()), nên mọi cộng dồn nằm trên từng ụ (lửa Relay, VỰC SÂU Leviathan, đuôi Nine-Tail) sẽ **mất khi chính ụ đó bị đem ghép**.
- **Trần hỗ trợ** (hotro.js:14,18): tốc 45%, sát thương 35%, nhân theo bậc (xanh ×1.1, vàng ×1.5, đỏ ×1.7). Nhiều bản của cùng một loại hỗ trợ thì **chỉ lấy bản mạnh nhất** (hotro.js:71). Mọi nguồn suy yếu cộng lại có trần **25%** (hotro.js:110).
- **Power-up trong trận** (LUAT.nangPct 25%/bước): kỹ năng hỗ trợ nhận +6%/bước (hotro.js:22), Mana Core +25%/bước (skills.js:130), còn lại chỉ tăng sát thương. Kỹ năng không gây sát thương (thời gian đóng băng/khoá, chu kỳ, số mục tiêu…) **không** tăng theo power-up.
- **"Cấp thẻ nâng trần hỗ trợ"**: trong code hiện tại **chưa có**. Trần chỉ theo bậc (CAP_BAC), cấp thẻ chỉ nâng giá trị buff (kThe, hotro.js:24), nên lên cấp thẻ chỉ làm buff chạm trần sớm hơn.
- Hình học bàn SOLO (data.js:169-172): ô hàng giữa cách đường trên/dưới khoảng **154 px**. Các ô cột 2–4 của hàng giữa (ô 7, 8, 9) cách làn trái hơn 200 px.

| Ụ (id · tên · bậc/vai) | Luật hiện tại (số, file:dòng) | Đánh giá | Điểm 1–5 | Đề xuất |
|---|---|---|---|---|
| canon · Cannon · Trắng/TC | Vùng nổ 28+6×★ px (34→70) skills.js:23 · không trần, không điều kiện | Hợp lý (giống DCDW) | 1 | Giữ. Không giới hạn đáng kể |
| lien · Gatling · Trắng/TC | +14% tốc mỗi ★ skills.js:33 · không trần | Hợp lý | 1 | Giữ. Không giới hạn đáng kể |
| bang · Frost · Trắng/ĐB | Chu kỳ 6 s (5★ 4.5 s) skills.js:45 · đóng băng 2 s (cấp thẻ →2.98 s, 3★ +0.5) :46 · chỉ 1 quái đầu (7★ 2 con) :47 · quái to ×0.6, trùm chỉ 0.6 s + chậm 15% :67-69 · miễn đóng băng 3 s sau mỗi lần :68 · Frost Flyer miễn :49 · power-up không tăng thời gian | Hợp lý (chống khoá cứng như DCDW Liza) | 2 | Giữ. Có thể cho power-up +0.1 s/bước đóng băng (tối đa +0.4 s) cho đúng quyết định "power-up nâng kỹ năng phi sát thương" |
| doc · Venom · Trắng/ĐB | Mỗi 2.5 s đánh dấu 1 quái (3★ 2 con) skills.js:74-75 · +12%→17.6% (cấp thẻ) nhận sát thương, 5 s, làm mới chứ không cộng dồn :97 · chung trần suy yếu 25% hotro.js:110 · lây sang quái gần khi chết, chỉ trong 90 px hotro.js:205 | Hợp lý | 2 | Giữ. Lưu ý: với Bounty Beacon/Time Bomb/Rainbow, trần 25% bị chạm rất nhanh, nên cấp thẻ Venom gần như vô ích khi đi combo. Cân nhắc nới trần chung lên 30% |
| tia · Sniper · Trắng/TC | Nhắm quái nhiều máu nhất · ×2 vào quái to/trùm skills.js:106 | Hợp lý | 1 | Giữ. Không giới hạn đáng kể |
| set · Tesla · Trắng/TC | Số quái trong chuỗi = số ★ (1★ không nảy) skills.js:118 · mỗi bước nhảy ≤120 px :119 · −12%/bước :123 | Hợp lý | 1 | Giữ |
| mana · Mana Core · Trắng/ĐB | 9×★ mana mỗi 7 s (3★ 6 s, 7★ 5 s) skills.js:130-131 · cấp thẻ ×1→1.56 · power-up +25%/bước | Hợp lý | 1 | Giữ. Không giới hạn đáng kể |
| radar · Radar · Xanh/HT | Chỉ 4 ô N/E/S/W hotro.js:40 · không buff ụ HT khác :46 · 12%×K×1.5 (1★ 18%, 7★ 42%) skills.js:148 · trần tốc 45%×1.1 = **49.5%** hotro.js:14,18 · 2 Radar không cộng dồn (lấy bản mạnh nhất) hotro.js:71 · 7★ OVERDRIVE +25% trong 2 s mỗi 8 s nhưng **nằm trong trần** skills.js:150,156; thatso.js:42 | Hơi chặt: ở 7★ đã sát trần, cấp thẻ tối đa (×1.4 → 59%) vượt trần, nên OVERDRIVE thực tế chỉ +7% rồi về **0%** | 3 | Nới: cho OVERDRIVE vượt trần (trần +15% trong 2 s), hoặc trần tốc Radar = 49.5% + 1%/cấp thẻ (đúng quyết định "cấp thẻ nâng trần") |
| mimic · Mimic · Xanh/ĐB | Ghép với BẤT KỲ ụ cùng ★ game.js:175 · ụ ra +50%→74% tấn công trong **8 s** game.js:202; data.js:190 | Hợp lý (giống DCDW Aurora) | 1 | Giữ |
| laser · Laser · Xanh/TC | Chỉ bắn quái đầu skills.js:173 · tăng dần tới ×4 trong 3 s, **đổi mục tiêu thì về 0** :174,181 · không bao giờ chí mạng :185 · phải ngắm lệch ≤0.15 rad mới bắn :179 | Hợp lý (cơ chế tia tăng dần) | 2 | Giữ. Có thể khi đổi mục tiêu chỉ mất một nửa độ tăng (về 50%) cho bớt hụt ở wave đông |
| mortar · Mortar · Xanh/TC | Nổ 46 px, mục tiêu ngẫu nhiên · đạn chùm mỗi phát thứ 3 skills.js:196 | Hợp lý | 1 | Giữ. Không giới hạn đáng kể |
| railgun · Railgun · Vàng/TC | Chỉ tính hàng/cột **ĐẦY** Railgun: hàng đủ 5/5 → +200% sát thương, cột đủ 3/3 → +150% tốc skills.js:209-222 · hàng dở dang không thưởng :214 · ô đá không tính :210 | Hợp lý (đúng bingo DCDW Removal Tee) nhưng hàng 5/5 rất khó (cần 5 Railgun cùng loại trong một hàng) | 3 | Giữ luật bingo. Có thể thêm bậc nhỏ: hàng 3/5 → +40%, 4/5 → +90% (cột vẫn phải đủ 3/3) để bớt "được tất cả hoặc không được gì" |
| orbital · Orbital · Vàng/ĐB | Không bắn thường · chỉ thức tỉnh khi GHÉP Orbital skills.js:264 · mọi Orbital trên bàn thức tỉnh 23 s (cấp thẻ →29 s) :234,258-261 · ghép lại thì chỉ đặt lại thời gian, không cộng :260 · số bom 3/4/5/7 theo ★ :235 · không còn Orbital → dự phòng 12 s :266 | Hợp lý (giống DCDW Mafdet, ảnh hưởng cả bàn) | 1 | Giữ |
| wallgen · Wall Projector · Vàng/TC | Mỗi ụ chỉ một tường tại một thời điểm skills.js:293-294 · chu kỳ max(5, 9−0.4×★) s :297 (sàn 5 s không bao giờ chạm, 7★ = 6.2 s) · tường đứng 2.4+0.3×★ s :302 · ghép → TƯỜNG VÀNG 6 s, nổ ×6 :281-289 | Hợp lý | 1 | Giữ. Không giới hạn đáng kể |
| blackhole · Black Hole · Đỏ/TC | Mỗi ụ chỉ một hố skills.js:312 · chu kỳ max(6, 10−0.5×★) s :319 · hố 3 s, bán kính 64+4×★ :322 · trùm chỉ bị kéo ×0.3 :514 | Hợp lý | 1 | Giữ |
| overlord · Overlord · Đỏ/TC | Nạp 7−0.5×(★−1) s (7★ 4 s) skills.js:334 · phải ngắm lệch ≤0.2 rad :337 · dư chấn tối đa 4 quái trong 240 px :546 | Hợp lý | 1 | Giữ |
| nayda · Ricochet · Tím/TC | Số lần nảy = ★ (1→7) skills3.js:27 · mỗi lần nảy ≤90 px, không trúng lại quái cũ :55 · +15→25%/lần nảy :28 | Hợp lý | 1 | Giữ |
| combo · Combo Core · Tím/TC | COMBO chỉ tăng khi ghép Combo+Combo hoặc Mimic+Combo skills3.js:92 · đếm theo bàn, giữ cả trận, mọi Combo Core cùng hưởng :84,97 · +6→12%/combo theo ★ :76 · sau 20 combo mỗi combo chỉ còn ½ :77 · co-op +½ combo của đồng đội :80 | Hợp lý (giống DCDW: tác dụng toàn bàn, không trần cứng) | 1 | Giữ |
| khoathoigian · Chrono Lock · Tím/ĐB | Mỗi ụ khoá tối đa 1 quái skills3.js:122 · chu kỳ 7.5→4.5 s :117 · khoá 1.2→2.5 s :118 · nổ 40→95% sát thương dồn, bán kính 40 px :119,154 · trùm chỉ khi không còn quái nào khác: chậm 50%, nửa thời gian, nửa lượng nổ :129-131 · không khoá quái đang bị khoá :128 · không có mục KY_NANG_CAP, power-up không tăng thời gian khoá | Hợp lý; cấp thẻ chỉ tăng sát thương bắn thường (vô nghĩa với ụ khoá) | 2 | Giữ luật. Thêm KY_NANG_CAP.khoathoigian: % nổ base 100 buoc 3 max 118 (nhân với bảng ★), để cấp thẻ nâng chính kỹ năng |
| hydra · Hydra · Vàng/TC | Số nòng = min(6, ★) skills3.js:182 · mỗi nòng 55%, mỗi nòng một quái khác :200 · 7★ gộp thành tia ×6, 0.6 lần/s × (1+tốc) :187 (chữ mốc nói 0.72/s :548) | Hợp lý | 1 | Giữ. Sửa chữ mốc 7★ cho khớp số thật |
| cuuvi · Nine-Tail · Vàng/TC | Tối đa 9 đuôi skills3.js:234 · chỉ tính quái **chính ụ này giết** (không phải trùm), +1 (5★: 20% được +2) :249 · trùm: cứ 8% máu tối đa do ụ này gây = +1 đuôi :253 · đủ 9 thì xả và về 0 (7★ về 3) :245 · +5% tốc/đuôi (tối đa 45%) :248 · ghép giữ số đuôi lớn hơn nhưng chỉ khi ụ ra cũng là Nine-Tail, và bị kẹp còn 8 :256 | Hơi chặt: phải tự giết (ụ nhắm quái đầu hay bị ụ khác giết trước); ghép ra ụ khác là mất đuôi | 2 | Nới: tính cả đòn hỗ trợ giết (quái chết trong 1 s sau khi ụ này bắn trúng) hoặc mọi Nine-Tail trên bàn cùng +1 khi một con giết. Giữ trần 9 |
| pandora · Pandora Vault · Vàng/ĐB | Chỉ kích hoạt khi GHÉP skills3.js:318 · quay 1 trong 6 đều nhau (ra 6★ quay 2 lấy cái tốt, ra 7★ được 2 phép) :322-324 · đóng băng 2.5 s (trùm 0.8) :333 · khiên tối đa 5 ụ :343 · bom 5 quả :339 · FRENZY +60% tốc 10 s :344 · 7★ không ghép được nữa, kỹ năng tắt thatso.js:47 · không có mục KY_NANG_CAP: cấp thẻ chỉ tăng sát thương bom và đạn | Hợp lý (ngẫu nhiên kiểu DCDW) | 2 | Giữ. Cho cấp thẻ nâng mana rain 25→31×★ và freeze 2.5→3 s (+0.08 s/cấp) |
| luoicheo · Resonance Grid · Vàng/HT | **Chỉ 4 ô CHÉO**, không buff N/E/S/W skills3.js:409 · 8%×K×2.3 (1★ 18%, 7★ 43%) :403 · RESONANCE ×1.5 chỉ khi đủ cả 4 ô chéo, nghĩa là **chỉ 3 ô giữa hàng 2 (ô 6/7/8)** làm được :404-406 · ô góc chỉ có 1 ô chéo, ô mép 2, không bù · trần sát thương 35%×1.5 = **52.5%** hotro.js:14,18 · 7★ có cộng hưởng (65%) bị kẹp còn 52.5%. Ở cấp thẻ tối đa, 7★ không cộng hưởng đã 61% > trần, nên RESONANCE **vô tác dụng** · 2 Grid không cộng (lấy bản mạnh nhất) | Lạ/quá chặt: 12/15 ô không bao giờ cộng hưởng, ô góc gần như vô dụng, phần thưởng chính bị trần nuốt | 4 | Làm lại: cộng hưởng khi đủ **mọi ô chéo hiện có** (≥2), ô mép ×1.3, đủ 4/4 ×1.5 · phần vượt trần do RESONANCE được nâng trần riêng +10% (trần 62.5%) · hạ hệ số gốc 8%→7%×K để giữ cân bằng |
| ngaithoigian · Chrono Throne · Đỏ/ĐB | Chậm 1%/s theo tuổi quái, tối đa 15→35% theo ★, trùm ≤20% skills3.js:428,437 · quái kháng chậm miễn :438 · REWIND mở ở 3★ :442 · hồi 40−2×(★−1) s (7★ 28 s) :430 · lùi 15→30% quãng đường (trùm ⅓), ×6 sát thương :429,454 · 7★ hồi 1 tim **một lần mỗi trận** :457 · co-op cứu 1 lần lọt mỗi trận :517 | Hợp lý | 2 | Giữ. Có thể cho cấp thẻ giảm hồi REWIND 0.5 s/cấp (tối đa −3 s) |
| chuato · Hive Queen · Đỏ/TC | Tối đa 3→10 drone mỗi ụ theo ★ skills5.js:25 · đẻ mỗi 4→2.2 s :24 · **tổng tối đa 12 drone/bàn** (cho nhẹ máy) :34 · drone chỉ săn quái trong 150 px :81 · 4★: ô N/E/S/W +10% tốc khi còn drone (cộng thẳng, không qua trần HOTRO) :29 · 7★: cứ drone thứ 5 là HOÀNG GIA ×3 :36 · SWARM hồi 30 s, mở ở 3★, xong thì bầy về 0 :26,60 | Hơi chặt: 2 Hive Queen 7★ (10+10) bị cắt còn 12, nên con thứ 2 gần như bỏ đi | 3 | Nới trần bàn lên 20 (hoặc drone vượt trần đổi thành +4% sát thương ngòi chích cho Queen) · giữ số theo ★ |
| leviathan · Leviathan · Đỏ/TC | Nuốt mỗi 9→5 s skills5.js:133 · chỉ quái trong **120 px** (+co×0.3), không nuốt trùm, quái to chỉ từ 4★, quái bay chỉ từ 7★ :143 · ô hàng giữa cột 2–4 cách đường ≈154 px nên **không bao giờ nuốt được** · VỰC SÂU tối đa 100, +4% sát thương mỗi điểm (tối đa +400%), quái to +3 :139,188-189 · **ghép là mất hết VỰC SÂU** (ụ ra mới, sinh() đặt 0) :137 · TIDAL BREATH hồi 35 s, mỗi quái trúng 1 lần :134,214 | Lạ/quá chặt: tích 100 điểm mất 8–15 phút rồi mất trắng khi ghép; nếu đặt sai ô thì không bao giờ tích được | 4 | Làm lại kiểu DCDW: VỰC SÂU lưu theo bàn (mọi Leviathan cùng hưởng, giữ khi ghép) · tầm nuốt 160 px (phủ cả hàng giữa) · trần 60 nhưng +5%/điểm (tối đa +300%) để bù việc giữ được qua ghép |
| khoisinh · Genesis Core · Đỏ/ĐB | +1★ cho ụ sao thấp nhất (không phải Genesis, <7★, hoà thì ngẫu nhiên) mỗi 30→16 s × cấp thẻ (100→92%) skills5.js:243,249-252 · 4★: ô N/E/S/W +15% sát thương (cộng thẳng, ngoài trần HOTRO) :248; hotro.js:66 · 7★: mỗi lần nâng sao gọi thêm 1 ụ 1★ nếu còn ô :264 · GENESIS hồi 45 s cố định, gọi 1→3 ụ ở ★ trung bình (làm tròn xuống, kẹp 1..6) :244-245,275 | Hợp lý (mạnh sẵn) | 1 | Giữ. Lưu ý +15% ngoài trần có thể chồng lên Sanctum/Grid. Nên đưa vào HOTRO (nhóm dmg) để chung trần |
| ronglua · Wyrm Engine · Đỏ/TC | Nón 40→75° skills5.js:323 · tầm chỉ 100→135 px (7★ ×1.15 = 155) :324 · chỉ bắn quái đầu **trong tầm** :328 · hàng giữa cột 2–4 (≈154 px tới đường) **không bắn được tới 7★**; cột 1 hàng giữa cần 6★ · vệt cháy ≤1 vệt/0.45 s :343 · 4★ +30% vào quái to/trùm :339 · DRAGON DIVE hồi 35 s, mỗi quái 1 lần, trùm +5% máu tối đa :358,421 | Hơi chặt: vị trí đặt quyết định ụ có bắn được hay không; người chơi không thấy tầm | 3 | Nới tầm: 130→165 px (7★ ×1.15 = 190) để mọi ô với tới đường · hoặc giữ tầm, nhưng khi không có quái trong tầm thì phun vào quái đầu với 50% sát thương |
| lualien · Ember Relay · Vàng/TC | Ghép có Relay → +1 lửa **chỉ cho Relay ở 4 ô N/E/S/W** của ô ghép (+ ụ ra nếu là Relay) vangmoi1.js:79-82 · **tối đa 5 lửa/ụ** :64,86 · +12%/lửa (LV9) → 18% (LV15), +3% chí mạng/lửa :40,71 · ụ nhận lửa +15% tốc 5 s :87 · 2 Relay đem ghép **mất luôn lửa** (ụ ra ngẫu nhiên, lc=0) · cần ≥3 Relay đứng sát nhau | Lạ/quá chặt: phải đặt theo hình chữ thập, trần 5 nhỏ, ghép là đốt lửa của chính 2 con | 4 | Làm lại kiểu DCDW (Katarina): ghép Relay → +1 lửa cho **MỌI Relay cùng hàng và cùng cột** với ô ghép (hoặc cả bàn) · trần 8 lửa · +10%/lửa LV9 → 15% LV15 (tối đa +80→120%), +2% chí mạng/lửa · ụ ra là Relay thì nhận lửa = max(2 nguyên liệu) |
| hopca · Quantum Choir · Vàng/TC | Đếm ụ KHÁC cùng ★ trên bàn mình (mọi loại), **tối đa 7** vangmoi1.js:115 · +18%→30%/ụ (tối đa +126→210%) :41,120 · 7★ +12% tốc :120 · ô đá không tính · co-op không tính bàn đồng đội | Hợp lý (toàn bàn, giống DCDW) | 1 | Giữ |
| luutru · Fusion Archive · Vàng/TC | Mọi lần ghép thành công trên bàn mình → +1 cho mọi Archive vangmoi1.js:166-177 · **tối đa 40** :135 · +2.5→4%/điểm (tối đa +100→160%) :42 · Archive mới nhận 50% tổng số lần ghép của trận :141 · chỉ Archive+Archive mới có 3 xung nổ 160%, 45 px :149,160 | Hợp lý (toàn bàn, tự bù khi ghép) | 2 | Giữ. Có thể nâng "Archive mới nhận" 50% → 70% để ghép Archive bớt thiệt |
| xuonganh · Hero Foundry · Vàng/ĐB | Chỉ ghép Foundry+Foundry vangmoi1.js:195 · 1 ô NGẪU NHIÊN (ưu tiên ô có ụ, kể cả ụ HT/mana) :200-202 · ô anh hùng **12 s** · **tối đa 2 ô**, ô cũ nhất bị thay :187,209 · ô trùng thì chỉ làm mới, không cộng :207-208 · chỉ tốc bắn +20→32% +4%/★ (7★ LV15 = 56%) :188 · 7★ không ghép được nữa thatso.js:47 | Hơi chặt: 12 s ngắn, ô có thể rơi vào ụ không bắn | 3 | Nới: ưu tiên ô có ụ TẤN CÔNG · thời gian 18 s · giữ tối đa 2 ô, không cộng dồn |
| mauhut · Blood Circuit · Vàng/ĐB | VAMP chung cả bàn, **tối đa 10** skills7.js:54 · cùng ★ +1 (7★ +2) :74 · khác ★ tốn 2 VAMP đổi lấy xung 220% (5★ 300%), bán kính 120 px; thiếu VAMP thì chỉ đổi ụ :75-78 · +6→9%/VAMP (tối đa +60→90%) :20 · không bao giờ tự lên ★ | Hợp lý; trần 10 hơi thấp so với công sức | 2 | Nới nhẹ: trần 15, giữ +6→9%/VAMP (tối đa +90→135%) |
| nguyenrua · Hex Saboteur · Vàng/ĐB | Chỉ ghép 2 Hex · **hồi 8 s CHUNG cả bàn**, ghép trong lúc hồi thì kỹ năng bị bỏ, không xếp hàng skills7.js:99,104 · xác suất 35%(+2%/cấp thẻ)+5%/★, **trần 80%** :100 · trễ 1.5 s, ụ mục tiêu đổi thì trượt :129 · SOLO: quái đầu chậm 30% + nhận +15% trong 4 s (vào trần suy yếu 25%) :127 · 7★ không ghép được nữa | Hơi chặt ở SOLO (hiệu ứng nhỏ cho một lần ghép đôi); PVP thì hợp lý | 2 | SOLO: nguyền 3 quái đầu, hoặc 6 s. Giữ hồi 8 s và trần 80% cho PVP |
| thanhdia · Sanctum · Vàng/HT | Chỉ buff ụ Tấn công (chiTC) skills7.js:159 · 4 ô N/E/S/W, 5★ 8 ô :162 · 10%×K×2.3 (1★ 23%, 7★ 54%) :160 vượt trần 52.5% ở 7★ · tẩy + khiên khi xuất hiện, khiên nạp mỗi 14 s (7★ 4 s), mỗi ô 1 khiên :161,171-186 | Hợp lý | 2 | Giữ. Cấp thẻ chỉ đẩy buff vượt trần, nên cho cấp thẻ nâng trần (+1%/cấp) hoặc rút nạp khiên 14→11 s |
| bienmau · Prism Thief · Vàng/TC | Màu đổi mỗi 3 s theo tuổi + uid riêng của từng ụ skills7.js:200 · COMBO chỉ khi ghép 2 Prism **đang CÙNG MÀU** :222 · COMBO chung bàn, **tối đa 10** (có Prism 5★ thì 15) :201,223 · +6→9% sát thương +4% tốc mỗi combo :23,205 · ghép khác màu = ghép thường, không được gì | Lạ: phải canh màu theo nhịp riêng từng ụ (may rủi, khó đọc); trần 10 | 3 | Nới: ghép Prism+Prism nào cũng +1, cùng màu +2 · trần 15 (5★: 20) · giữ +6→9%, +4% tốc |

### Audit B: giới hạn kỹ năng (Trắng + Xanh trong skills2.js) và hệ thống hỗ trợ chung

Chỉ đọc code, không sửa gì. Số trích từ code ngày 06/11. Ký hiệu: K = HOTRO.k (sao 1★ 1 / 3★ 1.45 / 5★ 1.9 / 7★ 2.35) × BAC (trắng 1, xanh 1.5) × power-up (+6%/bước, tối đa LV5 = ×1.24) × cấp thẻ (knHe, tối đa khoảng ×1.38–1.42). Trần nhóm = CAP × CAP_BAC (trắng ×1, xanh ×1.1).
Đã grep từng id trên thap/js/*.js. Không có monkey-patch đổi luật cho 21 ụ này (motvong/nongskill/statthuc/skills7 không đụng tới). Chỉ có chữ/hiển thị: thatso.js:47 (khuech), thatso.js:100 (min), thatso.js:136–148 (số đã kẹp trần), skilldemo.js:100/182/282, phattrien.js:210/221, game.js:825 (AI không ghép dichchuyen khác loại).

#### Từng ụ

| Ụ (id · tên · bậc/vai) | Luật hiện tại (số, file:dòng) | Đánh giá | Điểm 1–5 | Đề xuất |
|---|---|---|---|---|
| xucxac · Dice Gun · Trắng/tc | Mỗi phát ngẫu nhiên 3–300% (TB khoảng 151%). Chí mạng = cố định 300% (×1.5 rồi ×(2+cdmg)), không cộng với số ngẫu nhiên. Lượt "chắc chí mạng" của Crit Antenna 7★ dùng 1 lần rồi hết (skills2.js:91–92). Không trần nào khác. | Hợp lý (giống DCDW) | 1 | Giữ |
| phun · Scatter · Trắng/tc | Tốc 5/s, +8%/★ (tocSao 0.08). Mỗi phát đổi mục tiêu ngẫu nhiên (skills2.js:101,108). Không trần. Buff tốc vẫn bị trần chung 45%. | Hợp lý | 1 | Giữ |
| sungluc · Revolver · Trắng/tc | Một phát trúng ngay, tốc 0.6/s, crit kỹ năng +10% (tổng 20%) (skills2.js:112–116). Không trần. | Hợp lý | 1 | Giữ |
| maychem · Guillotine · Trắng/tc | Tỉ lệ giết ngay = thẻ 3.75%→5.85% + 0.75%/★ + 0.5%/bước power-up; ở 7★ LV5 thẻ max khoảng 12.35%/phát (skills2.js:124; data.js:203). Chỉ quái nhỏ: trùm và quái to (d.to) bị loại hẳn (skills2.js:131). Không ăn buff "giết ngay" chung. | Hợp lý (DCDW Scaffold cũng chỉ chém quái thường) | 2 | Giữ. Tuỳ chọn: quái to còn dưới 20% máu thì được chém với ½ tỉ lệ |
| phagiap · Armor Breaker · Trắng/ht (chiTC) | Mỗi 3 s đánh dấu quái đầu + 1 quái trâu nhất (5★ thêm 1), lộ 6 s (skills2.js:141,148–156). Ụ Tấn công kề +22%×K sát thương vào quái bị lộ (skills2.js:140,143). Nhóm "lo" dùng CHUNG trần sát thương 35% với buff sát thương thường (hotro.js:31,95–96,126). Mới 4★ đã 36% > trần (0.22×1.65), nên từ 5★ trở lên thì sao, cấp thẻ và power-up đều vô dụng. 7★ lộ thêm +8% vào trần suy yếu 25% (skills2.js:156). | Lạ/quá chặt: chạm trần quá sớm, lại chia trần với buff sát thương thường | 4 | Nới: hạ gốc 0.22→0.13 (1★ 13%, 7★ 31%). Cho nhóm có điều kiện (lo/lanh/vet/amp) trần RIÊNG 35%×CAP_BAC, không chung với dmg thường. Cho cấp thẻ nâng trần (xem Hệ thống chung) |
| bua · Hammer · Trắng/ht (chiTC) | +18%×K sát thương chí mạng (trần 50%), +4%×K tỉ lệ chí mạng (trần 20%) (skills2.js:165–166). Choáng khi chí mạng 0.2 s (7★ 0.35 s), không áp lên trùm; quái to chỉ bị từ 7★; mỗi quái 1 lần mỗi 3 s; lấy max (hotro.js:80,137). Sát thương chí mạng tới khoảng 7★ + thẻ cao (0.42×1.42 = 0.60) thì chạm trần 50%. Chữ mô tả gõ cứng 0.5 thay vì CAP×CAP_BAC (skills2.js:168; support.js:21). | Hợp lý | 2 | Giữ. Đổi `Math.min(0.5…)` thành `HOTRO.tran(T,'cdmg')` |
| nam · Iron Fist · Trắng/tc | Cận chiến: tầm cố định 105 px, nổ tròn 36 px, sao không tăng tầm (skills2.js:173–179). Đặt xa đường thì không đánh được gì. | Lạ/hơi chặt: DCDW không có khái niệm tầm; ở bàn 5×3 nhiều ô sẽ chết | 3 | Nới: tầm 105 + 10/★ (7★ 165 px), nổ 36 + 2/★. Hoặc khi không có quái trong tầm thì đấm quái đầu với 60% sát thương |
| bomhen · Time Bomb · Trắng/db | Mỗi 2 s (÷ nhịp tốc) gắn 1 bom vào quái ngẫu nhiên, mỗi quái chỉ mang 1 bom (E.bom). Ngòi cố định 5 s (skills2.js:191–201). Khi nổ: bán kính 34 + 3/★, suy yếu 10%→13.5% theo cấp thẻ (data.js:205), kéo dài 4 s (3★ 6 s). 5★ choáng 0.5 s (không áp lên trùm). 7★ ném 2 bom (skills2.js:186–198, 1069–1072). Suy yếu đi vào trần chung 25% (hotro.js:104,110). E.ywK bị GHI ĐÈ chứ không lấy max (skills2.js:1070). Sao KHÔNG tăng %. Power-up không có tác dụng gì (thatso.js:145 PU_KHONG), trái với quyết định mới là power-up cũng nâng kỹ năng không gây sát thương. | Hơi chặt | 3 | Nới: % suy yếu = thẻ + 0.5%/★ + 1%/bước power-up (7★ LV5 thẻ max khoảng 20.5%). Dùng `max` cho ywK. Trần suy yếu chung 25→30% (xem dưới) |
| nhanmana · Mana Doubler · Xanh/db | Khi ghép: +44→77 (thẻ) × sao trước khi ghép × (1 + 25%/bước power-up) (skills2.js:211,215). Không trần. Gương sao chép được (skills4.js:329). | Hợp lý | 1 | Giữ |
| kiembang · Ice Blade · Xanh/tc | Đánh quái đang chậm ×5 (3★ ×6, 7★ ×8) (skills2.js:233). Ưu tiên quái chậm (−400 px). Lan lạnh 20% (trùm 15%) trong 2 s ở bán kính 44 px nhưng KHÔNG áp lên mục tiêu chính; quái kháng chậm miễn (skills2.js:240). 5★ mảnh văng 40% trong 40 px (skills2.js:236). | Hợp lý: cần nguồn chậm khác, đúng ý đồ phối hợp | 2 | Giữ |
| chimang · Crit Antenna · Xanh/ht | Bảng riêng 6/8/11/13/15/18/20% × power-up × thẻ × 1.5 (skills2.js:247) nên 1★ 9%, 4★ 19.5%, 5★ 22.5%, vượt trần crit 20%×1.1 = 22% (hotro.js:14,18). 6★, 7★, cấp thẻ và power-up không tăng chí mạng nữa. 5★ thêm +10% sát thương chí mạng cố định. 7★ cứ 6 s mỗi ụ kề được 1 cú chắc chí mạng (skills2.js:252). Chỉ 4 ô thẳng. | Lạ/quá chặt: hết đường lên từ 5★ | 4 | Nới: trần crit 20→25% và để cấp thẻ nâng trần (khoảng +0.6%/cấp, tối đa khoảng 32% ở Xanh). Hoặc hạ bảng ×0.75 (7★ 22.5%) để sao vẫn còn ý nghĩa |
| dichchuyen · Teleporter · Xanh/db | Chỉ đổi chỗ với ụ CÙNG SAO trên cùng bàn; đổi được cả ô đá/băng (skills2.js:261–262). Ụ bị tiêu hao khi đổi. AI không dùng ụ này để ghép khác loại (game.js:825). | Hơi chặt: điều kiện cùng sao khó gặp | 3 | Nới: đổi với ụ có sao ≤ sao của nó (hoặc với mọi ụ, nhưng ụ dịch chuyển mất 1★) |
| drone · Drone Bay · Xanh/tc | Khi ghép: 1 + ⌊★/3⌋ drone (★ = sao trước ghép: 1–2★ 1 con, 3–5★ 2, 6★ 3), mỗi con ×24 sát thương, nổ 46 px, sống 12 s, đâm con quái đầu tiên gặp (skills2.js:279–283, 1086–1100). | Hợp lý | 1 | Giữ |
| tron · Fusion Mixer · Xanh/ht (chiTC) | Tốc bắn +6% + 2% cho mỗi LOẠI Tấn công khác nhau đứng kề, tối đa 12% (n≤4), × K (skills2.js:290–291). Trần tốc 45%×1.1. 5★ +3%×K sát thương chỉ khi có ≥3 loại; 7★ +6% crit chỉ khi có đủ 4 loại (skills2.js:296–297). Bàn 5×3 chỉ có 3 ô có đủ 4 ô kề (hàng giữa, cột 2–4), nên mốc 7★ hầu như không kích được. Game ghép thì thường dồn cùng loại, ngược với điều kiện "khác loại". | Lạ/quá chặt | 4 | Làm lại kiểu DCDW: đếm số loại Tấn công khác nhau trên CẢ HÀNG + CỘT (hoặc cả bàn). 7★ cần ≥3 loại. Số +6% crit và +3% dmg nhân thêm K |
| nangluong · Energy Cannon · Xanh/tc | +100% sát thương cho mỗi 120 mana đang giữ, trần +500% (600 mana) (skills2.js:303). Muốn mạnh phải giữ mana, nên mâu thuẫn với triệu hồi và power-up. | Hợp lý (rủi ro đổi lấy lợi ích) | 2 | Giữ |
| lanhgia · Chiller · Xanh/ht | Chậm 8%×K (1★ 12%, 7★ 28%; thêm thẻ và power-up thì khoảng 48%) (skills2.js:316). Chậm KHÔNG cộng dồn mà lấy max (hotro.js:80,85). Mỗi đòn chậm 2 s. Trần 35%, trùm 15% (hotro.js:131). 5★ +5%×K sát thương vào quái chậm, vào trần dmg chung. 7★ cứ 8 s có 1 đòn đóng băng 0.8 s (không áp lên trùm hay quái kháng chậm) (skills2.js:321; hotro.js:136). Lệch: apDung cho trần chậm 35%×1.1 = 38.5% (hotro.js:81) nhưng khiTrung kẹp cứng 35%. | Hợp lý (DCDW cũng có trần chậm, nhất là với trùm) | 2 | Giữ số. Sửa lệch: dùng một trần duy nhất (35%, hoặc 35%×CAP_BAC ở cả hai chỗ) |
| khuech · Amplifier · Xanh/ht (chiTC) | Mỗi đòn liên tiếp vào CÙNG 1 quái +9%×K (1★ 13.5%), tối đa 5 cộng dồn (5★ 7). Mất cộng dồn khi nghỉ 1.5 s (7★ 3 s, tối thiểu 1 nhịp bắn), tính riêng từng quái, đòn đầu = 0 (skills2.js:328–331; hotro.js:119–123). Tổng bị kẹp vào trần sát thương CHUNG 38.5%, sau khi đã trừ buff dmg thường (hotro.js:126). 1★ chạm trần ở cộng dồn thứ 3; 7★ (31.7%/đòn) chạm ở cộng dồn thứ 2. Mốc 5★ "7 cộng dồn", sao, thẻ, power-up gần như vô dụng; đứng cạnh hasao/taylo thì gần như bằng 0. | Lạ/quá chặt: cộng dồn chỉ để trang trí | 5 | Làm lại: mỗi đòn +4.5%×K, tối đa 5 (5★ 7), với trần RIÊNG cho amp = (25% + 4%/★)×CAP_BAC (7★ khoảng 54%), không chung với dmg thường. Thẻ nâng trần |
| vungdoc · Toxic Pool · Xanh/tc | Mỗi max(2.6, 4.6 − 0.2★) s (sàn 2.6 không bao giờ chạm vì 7★ = 3.2 s). Vũng sống 5 s, r = 30 + 2★ (7★ ×1.5). Độc lấy max chứ không cộng (skills.js:353), nên 2 vũng ở 3★ không chồng sát thương. 5★ suy yếu 15% khi đứng trong vũng (+0.6 s), vào trần 25% (skills2.js:336–349; skills.js:354). | Hợp lý | 2 | Giữ |
| loa · Cooldown Horn · Xanh/db | Khi ghép: hồi chiêu Ma vương −(4 + 2★) s × thẻ (6→9.96, tối đa ×1.66). Nếu chiêu đã sẵn thì giá −15% nhưng không thấp hơn giá gốc (skills2.js:357–363). Power-up chỉ tăng sát thương bắn, không tăng kỹ năng. | Hợp lý | 2 | Giữ. Tuỳ chọn: power-up +0.5 s/bước |
| hutmana · Mana Leech · Xanh/tc | Mỗi đòn +0.35 + 0.15/★ mana × (1 + 20%/bước power-up). Trần 1.2 + 0.3/★ mana/giây; trần này KHÔNG tăng theo power-up. Cộng tới ≥3 mới trả (skills2.js:369–379). Với 7★ LV5 và buff tốc thì vượt trần, nên power-up từ khoảng bước 3 trở đi bị phí. | Hơi chặt | 3 | Nới: trần/giây cũng ×(1 + 20%/bước), hoặc đổi sang trần mỗi wave (khoảng 40 + 10/★) |
| min · Mine Layer · Xanh/tc | Mỗi max(2, 4 − 0.2★) s (sàn 2 không bao giờ chạm vì 7★ = 2.6 s). Mỗi ụ tối đa 6 mìn trên đường, mìn sống 30 s, cần 0.3 s mới nổ được, r = 36 cố định, sát thương ×7. Mìn sao ×3 với tỉ lệ 3% + 0.5%/★ (skills2.js:387–401, 1108–1112). | Hợp lý | 2 | Giữ. Có thể nâng lên 6 + ⌊★/3⌋ mìn và bỏ sàn chết |

#### Hệ thống chung (hotro.js / support.js / buff.js)

| Luật | Hiện tại (file:dòng) | Đánh giá | Điểm 1–5 | Đề xuất |
|---|---|---|---|---|
| Trần tốc bắn 45% | hotro.js:14, ×CAP_BAC theo nguồn bậc cao nhất (hotro.js:81) | Hợp lý | 2 | Giữ |
| Trần sát thương 35%, và DÙNG CHUNG cho dmg có điều kiện (lo/lanh/vet/amp) | hotro.js:31,77,95–96,126 | Lạ/quá chặt: một ụ dmg thường là đủ làm phagiap/khuech/lanhgia 5★ thành vô dụng | 4 | Tách trần riêng cho nhóm có điều kiện (35%×CAP_BAC), hoặc nâng trần chung 35→50% khi có ≥2 loại |
| Trần chí mạng 20% | hotro.js:14 (cộng với bua; nguồn Xanh nâng lên 22%) | Hơi chặt: chimang 5★ đã chạm | 4 | Nâng lên 25% và để cấp thẻ nâng tiếp |
| Trần sát thương chí mạng 50% | hotro.js:14 | Hợp lý | 2 | Giữ |
| Trần chậm 35% / trùm 15% (CHAM_TRUM), lấy max không cộng | hotro.js:15,80,85,131 | Hợp lý (giống DCDW). Lệch: apDung ×CAP_BAC (38.5%) nhưng khiTrung kẹp cứng 35% | 2 | Giữ số, chỉ dùng một trần |
| Trần giết ngay 15% (trùm: chỉ +1% máu tối đa) | hotro.js:14,132–134 | Hợp lý (ngoài phạm vi, không có ụ nào trong 21 ụ dùng) | 2 | Giữ |
| Trần suy yếu 25% cho MỌI nguồn cộng lại | hotro.js:100–110: cứng, không nhân bậc/thẻ | Hơi chặt: bomhen 13.5 + vungdoc 15 = 28.5, thêm 1 nguồn bậc cao là bị phí | 3 | 30% cho quái thường, giữ 25% cho trùm |
| Cùng loại chỉ lấy bản mạnh nhất; khác loại cộng rồi kẹp trần | hotro.js:71,80 | Hợp lý: tránh xếp chồng bản sao | 2 | Giữ |
| Hình tác dụng: 4 ô thẳng | hotro.js:37–41 (support.js:44–47 và buff.js:95–96 còn code cũ "5★ thêm chéo" đã chết) | Hơi chặt so với DCDW (thường cả hàng/cột): góc chỉ 2 ô, trung bình khoảng 2.9 ô/15 | 3 | Giữ 4 ô cho các % mạnh. Mốc 5★ thêm 2 ô thẳng xa (cách 1 ô) cùng hàng. Dọn code chéo cũ |
| Không buff ụ hỗ trợ khác; chiTC chỉ buff Tấn công; ụ đá/băng/câm không buff, không nhận | hotro.js:43–49,64 | Hợp lý | 1 | Giữ |
| Trần theo nguồn bậc cao nhất: capDmg lấy max trên MỌI nhóm | hotro.js:76–77 (một nguồn Tím ở nhóm khác cũng nâng trần dmg cho nguồn Trắng) | Hơi lạ, nhưng vô hại | 2 | Tính capB theo từng nhóm (giống hotro.js:81) |
| Power-up cho hỗ trợ: chỉ +6%/bước (tối đa +24%), còn dmg được +25%/bước | hotro.js:22; data.js:243 | Hơi chặt: vì trần chạm sớm, power-up hỗ trợ thường phí mana | 3 | Cho power-up nâng TRẦN +4%/bước (tương đối) thay vì chỉ nâng giá trị |
| Quyết định "cấp thẻ nâng trần hỗ trợ" | CHƯA có trong code: tran() và apDung chỉ nhân CAP_BAC (hotro.js:27–33,76–83) | Thiếu | 4 | Trần = CAP × CAP_BAC × (1 + 0.5 × (knHe − 1)), tối đa khoảng ×1.2 |
| Hiển thị | bua dùng cứng 0.5 (skills2.js:168, support.js:21); lanhgia dùng CAP.cham không ×bậc (support.js:11) | Nhỏ | 1 | Thống nhất dùng HOTRO.tran |

Số dòng: 21 ụ + 14 luật chung.

### Audit C — giới hạn kỹ năng (skills2 phần Tím/Vàng/Đỏ, skills4, Chỉ huy)

Chỉ đọc code, không sửa gì. Số liệu lấy từ code thật. Viết tắt: `s2` = thap/js/skills2.js, `s4` = thap/js/skills4.js, `ht` = thap/js/hotro.js, `d` = thap/js/data.js, `g` = thap/js/game.js.

Nền chung (áp cho mọi ụ hỗ trợ):
- `HOTRO.k` = K[★] (1 → 2.35) × BAC (tím 2.0 / vàng 2.3 / đỏ 2.8) × (1 + 6%·(LV power-up − 1)) × hệ số cấp thẻ (ht:22). Trần nhóm `CAP` toc 45 / dmg 35 / crit 20 / cdmg 50 / chậm 35 / giết ngay 15 % × CAP_BAC (tím 1.3 / vàng 1.5 / đỏ 1.7) (ht:14–18). Mọi suy yếu cộng lại tối đa 25% (ht:110).
- Hỗ trợ chỉ tác dụng lên 4 ô kề N/E/S/W (ht:37–41). Riêng `dongbo` dùng cả bàn.
- Ghép thường tạo ra ụ ngẫu nhiên MỚI (g:198), nên mọi trạng thái nằm trên thân ụ (Ép Xung, cộng dồn Forge, bộ đếm hộp) đều MẤT khi ụ đó đem đi ghép.
- Ụ có kỹ năng KHI GHÉP thì hết tác dụng ở 7★ (thatso.js:50).
- Power-up trong trận: tăng sát thương; với ụ hỗ trợ là +6%/LV vào `HOTRO.k`. Các ụ trong `PU_KHONG` (thatso.js:155: khien, hopbi, tuthan, tienhoa, haoquang, loren…) không được gì.
- Cấp thẻ: `KY_NANG_CAP` (d:188–229), giá trị = base + buoc·cấp, kẹp ở max.

#### Bảng ụ

| Ụ (id · tên · bậc/vai) | Luật hiện tại (số, file:dòng) | Đánh giá | Điểm 1–5 | Đề xuất |
|---|---|---|---|---|
| cuongno · Berserker · Tím/TC | Chí mạng 1 → RAGE +25% tốc trong 5 s (3★: 8 s); chí mạng 2 → FRENZY +(150+15·★)% tốc trong 5 s (5★: 7 s). Đang Frenzy mà chí mạng thì +1 s nhưng kẹp ở 5/7 s. RAGE tối đa 1 nấc (về 0 khi đủ 2). 7★ Frenzy +25% chí mạng. Chí mạng gốc +5% (s2:411–432) | Hợp lý (giống DCDW Danu) | 2 | Giữ. Có thể cho thời gian Frenzy kẹp ở 8 s thay vì 5/7 s để chuỗi chí mạng dài vẫn có lợi |
| baotuyet · Blizzard · Tím/TC | Chu kỳ = max(4, 11 − 0.6·★ − 1.5 nếu 3★) → 10.4 s ở 1★, 5.3 s ở 7★; sàn 4 s không chạm tới khi chưa có buff. Làm chậm min(60%, 30+3·★%) = 33–51% trong 3 s, áp lên **cả trùm** (không dùng trần trùm 15%). Đóng băng 0.35 s (7★: 1 s) chỉ với quái nhỏ. Sát thương ×1.5 (5★: ×4.5) (s2:437–449) | Hợp lý; trùm bị chậm tới 51% là không khớp với luật trùm 15% của các nguồn khác | 2 | Giữ nhịp. Kẹp chậm trên trùm ở `HOTRO.CHAM_TRUM` (15%) hoặc 25% cho nhất quán |
| nhanban · Cloner · Tím/ĐB | Khi ghép: +1 ụ 1★ miễn phí (ghép ra 3★ trở lên: ụ 2★). Cần ô trống (ghép luôn trả 1 ô). 7★ thì tắt (s2:462–465, g:129, thatso:50) | Hợp lý (giống DCDW Ivory) | 2 | Giữ. Có thể đổi thành ụ ra = ★ nguyên liệu − 1 (tối đa 3★) để vẫn có ích ở cuối trận |
| lienket · Chain Link · Tím/TC | +40% sát thương cho mỗi ụ cùng loại nối liền bằng ô kề trực giao (loang 4 hướng), không trần. Chuỗi 4+ thì đạn nảy thêm 1 quái ×0.5 trong 90 px (s2:470–486) | Hơi chặt về vị trí (chỉ tính khi nối liền ô kề), số thì rộng tay | 2 | Giữ +40%/ụ. Cân nhắc tính cả ụ cùng loại cùng HÀNG (không cần liền) như aura kiểu DCDW, khi đó giảm còn +30%/ụ |
| kepha · Jammer · Tím/ĐB | Khi ghép, số mục tiêu n = 1 + ⌊★nguyên liệu/2⌋. PVP: Kẹp −40% tốc trong 5+★ s. Solo/Co-op: n ụ có sát thương sao cao nhất được +(70+5·★)% tốc trong 8+★ s. `tocV` bị **ghi đè**, không lấy max, nên một buff yếu hơn có thể xoá buff mạnh hơn. 7★ tắt (s2:494–505) | Hợp lý | 2 | Giữ. Đổi `X.tocV = Math.max(...)` để không ghi đè buff mạnh hơn |
| taylo · Cleanser · Tím/HT | Mỗi 12 s (5★: 9 s) tẩy tối đa 2 ụ kề (5★: 3). Lượt trước không tẩy gì thì ụ kề +0.09·k sát thương (18% ở 1★, 42% ở 7★, trần 45.5%). 7★: ụ được tẩy +20% tốc trong 4 s. Chu kỳ cố định, cấp thẻ chỉ tăng % sát thương (s2:511–527, d:219) | Hơi chặt: chu kỳ dài, chỉ 4 ô kề, buff mất ngay khi vừa tẩy | 3 | Chu kỳ 12 → 10 s và cho cấp thẻ giảm chu kỳ (−0.15 s/cấp, sàn 8 s). Giữ buff sát thương kể cả lượt vừa tẩy |
| khien · Shield Gen · Tím/HT | Chu kỳ [18,18,16,16,14,14,10] s theo ★, cấp thẻ −0.4 s/cấp (tối đa −3.6 s). Khiên 1 lần, không cộng dồn, chỉ 4 ô kề; đủ khiên thì giữ đầy. 7★: chặn xong +20% tốc trong 4 s (s2:534–545, ht:196, d:203). Power-up không tác dụng (PU_KHONG) | Hợp lý (giống DCDW Mona) | 2 | Giữ. Cho power-up giảm chu kỳ 5%/LV (đúng quyết định "power-up tăng cả kỹ năng không gây sát thương") |
| hopbi · Mystery Box · Tím/ĐB | Mở sau 58 s (3★: 46 s), cấp thẻ −1 s/cấp, sàn 49/37 s. Kết quả 1–6★ ngẫu nhiên (5★: 3–6, 7★: 5–7). ★ của hộp từ 1–4★ không đổi kết quả. Đem ghép là mất bộ đếm. Power-up không tác dụng (s2:552–560, d:204) | Hơi chặt: chờ gần 1 phút, 1★ có thể mở ra 1★ | 3 | Gốc 45 s (3★: 36 s). Sàn kết quả = max(★ hộp, 1). Power-up −3 s/LV |
| nangsao · Star Lift · Tím/HT | Chỉ 2 ụ kề có ★ thấp nhất (trong 4 ô) được +tốc = min(30%×1.3 = 39%, 12%·★·2.0·cấp thẻ) × power-up → **từ 2★ đã chạm trần 39%**, ★ cao hơn không thêm gì. 5★: mỗi wave 1 nấc, 3 nấc (7★: 2) = +1★, **tối đa 2★ mỗi trận** (s2:568–580) | Lạ/quá chặt: trần chạm sớm, thêm 3 giới hạn chồng nhau (2 ụ, 1 nấc/wave, 2★/trận) | 4 | Bỏ giới hạn "2 ụ" (buff cả 4 ô kề, ụ ★ thấp nhất ×1.5). Trần riêng 39% → 50%. Nấc sao: bỏ trần 2★/trận, đổi thành 1 nấc mỗi 2 wave |
| tuthan · Reaper Pillar · Tím/HT | Tỉ lệ giết ngay = min(15%×1.3 = 19.5%, 0.12·k). Ở 1★ đã là 0.24 nên **luôn bằng trần 19.5%** từ 1★: ★, cấp thẻ (24 → 34.8) và power-up đều vô tác dụng. Ngưỡng máu 30% (5★: 40%). Quái to chỉ ở 7★, dưới 15%. Trùm chỉ nhận thêm đòn ≤1% máu tối đa (s2:589–592, ht:133–134, d:221) | Lạ/quá chặt: con số tăng trưởng hiển thị nhưng thực tế không đổi | 4 | Hạ gốc còn 0.06·k (12% ở 1★ → 19.5% khoảng 4★). Nới CAP.chet cho tím lên 0.15×1.6 = 24% ở 7★/cấp tối đa. Cho cấp thẻ nâng ngưỡng máu (30 → 36%) thay vì nâng tỉ lệ |
| xaotron · Scrambler · Tím/ĐB | Khi ghép, n = 1 + ⌊★/2⌋. PVP: đổi loại n ụ đối thủ (ụ đá/băng miễn). Solo/Co-op: biến n ụ lẻ loi thành cặp với ụ cùng ★. 7★ tắt (s2:599–615) | Hợp lý (giống DCDW Neban) | 2 | Giữ |
| epxung · Overclock · Tím/ĐB | Kéo lên ụ CÙNG ★ có sát thương: +90% tốc vĩnh viễn (cấp thẻ +2.5%/cấp → 112.5%), cộng dồn không trần. Mất khi ụ nhận đem đi ghép. Copycat chép được (s2:621–631, g:257, d:192) | Hợp lý (giống DCDW Pararamim) | 2 | Giữ. Điều kiện cùng ★ là kiểu DCDW |
| no5 · Fifth Shot · Tím/TC | Phát thứ 5 bắn 3 mũi tên nổ ×2 trong 34 px. Mốc 5★ chung là OVERCHARGE +25% (KHONG_DOI) (s2:637–647, phattrien:109) | Hợp lý | 1 | Giữ |
| bao · Storm Gun · Tím/TC | Mỗi ụ Súng Bão kề bên làm **−30% tốc**, sàn hệ số 0.1. 20% nảy sang quái thứ 2 trong 96 px ×0.7 (s2:661, 667–669, g:257) | Hơi chặt: phạt việc đứng gần nhau, trong khi bàn 5×3 nên ghép thường xuyên | 3 | −30% → −15% mỗi ụ kề, tối đa −30% |
| anhsang · Lighthouse · Tím/TC | Gọi 1 ụ 1★ mỗi max(9, 21 − 1.6·★) s → 19.4 s ở 1★, 9.8 s ở 7★. Cần ô trống. Không theo buff tốc (s2:675–681) | Hợp lý (giống DCDW Venus) | 2 | Giữ. Có thể cho nhịp theo `nhipU` để buff tốc giúp được |
| aten · Purifier · Vàng/TC | ×4 (7★: ×6) vào quái trúng độc. Giết thì nổ ×2 trong 50 px (3★: 70 px), 5★ nổ gây độc. Phụ thuộc nguồn độc trong bộ bài (s2:703–711) | Hợp lý (giống DCDW Aten) | 2 | Giữ |
| dongbo · Sync Cannon · Vàng/HT | Cả bàn: mọi ụ TC **cùng ★** (7★: lệch ±1★) +0.075·k sát thương (17% ở 1★ → 40% ở 7★, trần 52.5%). 5★: có 2+ ụ khớp thì +2%·k tốc (≈8.7%). Nhiều bản Đồng Bộ không cộng dồn. PVP: đối thủ −(3+0.5·(★−1))%, kẹp 8% (s2:720–736, g:249) | Hợp lý (giống DCDW Dana) | 2 | Giữ. Tốc 5★ hơi nhỏ, nâng 0.02 → 0.04·k |
| vughep · Merge King · Vàng/ĐB | Kéo lên ụ cùng ★, dưới 7★: +1★, giữ loại. Bản vàng 10% (+2%/cấp thẻ, tối đa 22%) thì +2★. MK + MK chỉ +1★. Dùng được trên ô đá (s2:743–762, d:191) | Hợp lý (giống DCDW Aurora King) | 1 | Giữ |
| sinhdoi · Twin Maker · Vàng/ĐB | Ghép thường: +1 ụ ngẫu nhiên cùng ★ nguyên liệu. 10% (+1%/cấp, tối đa 16%) ra cao hơn 1★. Ghép đặc biệt không kích hoạt. 7★ tắt (s2:775, g:142–151, d:196) | Hợp lý (giống DCDW Berit) | 1 | Giữ |
| hasao · Star Breaker · Vàng/HT | Ụ TC kề +0.1·k sát thương (23% → 54%, trần 52.5%). Ghép THẬT ra ụ ở ô kề thì +0.2·k/1.45 tốc trong 5 s. Mỗi wave chỉ **1 lần**, khi có ụ lên 5★: PVP đối thủ −8% tốc 6 s; Solo/Co-op ụ TC thấp nhất +8% tốc 6 s. Mức 8% không tăng theo ★ hay cấp (s2:780–800, ht:189) | Hơi chặt: phần 5★ quá nhỏ và chỉ 1 lần/wave | 3 | Mức 8% → 0.04·k (≈9% ở 1★, 22% ở 7★), thời gian 6 → 8 s. Giữ 1 lần/wave |
| saochep · Copycat · Vàng/ĐB | Kéo lên ụ cùng ★ (kể cả đá/băng): thành bản sao với 70% chỉ số (+4%/cấp, tối đa 94%). Giữ dạng gốc và Ép Xung/Aurora. Ghi chú: comment ở g:247 ghi "50% → 92%" nhưng số thật là 70 → 94 (d:189), fallback `|| 50` ở d:242 (s2:811–818) | Hợp lý (giống DCDW Shamash) | 1 | Giữ. Sửa comment và fallback cho khớp 70 |
| ngoisao · Star Cannon · Vàng/TC | Tổng ★ trên bàn n (tối đa 105). Tốc +10% mỗi mốc 10 đã qua; +100% chỉ khi n **chia hết đúng 10**. Sát thương +50% mỗi mốc 50; +350% chỉ khi n **đúng 50 hoặc 100**. Mỗi lần ghép/triệu hồi làm n đổi nên dễ rơi khỏi mốc. Cấp thẻ ×1.0 → 1.3 (s2:831–843, d:193) | Hơi chặt: thưởng lớn dựa vào "đúng số", rất dễ vỡ | 3 | Giữ ý tưởng của DCDW Darby nhưng cho thưởng "đúng mốc" tồn tại thêm 5 s sau khi n rời mốc. Mốc sát thương 50 → 40 cho bàn 15 ô |
| soi · Werewolf · Vàng/TC | Bản thức tỉnh 30% (+1.5%/cấp → 39%, trần 50%), quay 1 lần khi sinh. 3★ +10% chí mạng, 5★ +25% sát thương, 7★ ụ kề +25% tốc. Cận chiến 108 px (s2:861–872, d:194) | Hợp lý (giống DCDW Werewolf) | 1 | Giữ |
| tienhoa · Evolver · Vàng/ĐB | Đếm (14 + 5·★) s × 0.8 (3★) × cấp thẻ (100 → 88%) → thành ụ ngẫu nhiên +1★ (5★: 25% là +2★). 7★ thì xịt. Power-up không tác dụng (s2:887–907, d:207) | Hợp lý (giống DCDW Moa) | 2 | Giữ. Cho power-up −4%/LV thời gian |
| cauvong · Rainbow · Vàng/HT | Mỗi 7 s cố định (không theo tốc): vệt dài 90 + 10·★ px, kéo dài 6 + 0.5·★ s (5★: 2 vệt). Co-op/Solo: quái trên vệt +(4+★)% sát thương nhận (vào trần suy yếu 25%), không tăng theo cấp thẻ. Ụ TC kề +0.13·k vào quái trên vệt (30% → chạm trần 52.5% từ 5★). PVP: quái đối thủ −(8+2·★)%, kẹp 30%. 7★ chậm 10% (s2:917–935) | Hơi chặt: phần cộng cho toàn đội chỉ 5–11% và dùng chung trần 25% | 3 | Phần toàn đội cho theo cấp thẻ (×kThe), 5% → 6%+1.5%/★. Chu kỳ 7 s theo `nhipU` |
| lophanung · Cryo Reactor · Đỏ/HT | Hào quang 110 + 5·★ (+20 ở 3★) px, làm chậm min(40%, 20+2.5·(★−1)%), trùm 15%. Ụ TC kề +0.2·k vào quái chậm = 56% ở 1★, **gần trần 59.5% ngay từ 1★** và dùng chung trần sát thương. Chủ động: nạp 24 s cố định, đóng băng 2.5 s (5★: 4 s), trùm 0.8 s. 7★ +10% suy yếu (s2:946–976) | Hơi chặt: phần buff hết tăng từ 1–2★, nạp chủ động cố định | 3 | Hạ hệ số 0.2 → 0.12·k (34% ở 1★, chạm trần khoảng 5★). Cho cấp thẻ/power-up giảm nạp 24 s (−0.4 s/cấp, sàn 18 s) |
| haoquang · Holy Halo · Đỏ/ĐB | Hồi max(20, 30 − 2·★) s → 28 s, sàn 20 s từ 5★. Bất tử 3 s (+0.125 s/cấp, tối đa 3.5 s) +0.5 (3★) +1 (7★). Chiêu trùm chỉ bị giảm (chỉ trúng 1 ụ; Freezer giảm nửa). 5★ tẩy, 7★ +30% tốc. Tự bật khi nguy. Power-up không tác dụng (s2:992–1010, ht:154–180) | Hơi chặt: khoảng 3 s mỗi 28 s | 3 | Bất tử 3 → 4 s ở 1★. Power-up −1 s hồi chiêu/LV (sàn 18 s) |
| nemesis · Nemesis · Vàng/TC | Mỗi phát +p% máu tối đa (0.3 → 1.2%), trùm kẹp 0.8%. Xử tử quái thường (không to) dưới 8 → 15%. Trùm: 10 phát trúng → 2 → 6% máu tối đa, cách nhau tối thiểu 2 s. 7★ nhảy 1 lần trong 110 px (s4:14–34) | Hợp lý; trần trùm đúng kiểu DCDW | 2 | Giữ |
| docton · Lone Ace · Tím/TC | Chỉ khi **cả 4 ô kề TRỐNG** mới ACE: +100% tốc, +10 → 25% chí mạng (7★ xuyên 1 quái trong 80 px). 3+ ụ kề thì −30% tốc. Ô góc chỉ có 2 ô kề nên dễ hơn (s4:44–58) | Hơi chặt: trên bàn 15 ô phải bỏ trống 2–4 ô | 3 | Đổi thành "≤1 ụ kề": ACE (+80% tốc). Giữ −30% khi 3+ ụ kề |
| thaukinh · Focus Lens · Tím/HT | Ụ kề +0.30·k sát thương chí mạng = 60% ở 1★. Trần cdmg 50×1.3 = **65%, chạm từ khoảng 2★** nên ★ cao và cấp thẻ (60 → 83%) gần như không có tác dụng. Chí mạng xuyên 1 quái (5★: 2) trong 60 px cùng đường, 50% (7★: 65%) (s4:70–79, d:222) | Lạ/quá chặt: con số tăng trưởng gần như không có tác dụng | 4 | Hạ gốc 0.30 → 0.18·k (36% ở 1★ → chạm 65% khoảng 6★). Hoặc nới trần cdmg của tím 1.3 → 1.6 (80%) |
| nhieusong · Signal Jammer · Tím/ĐB | Khi ghép (★ kết quả): PVP nhiễu n = 1 → 4 ụ, −40% trong 3 → 6 s, lần triệu hồi kế của đối thủ +5 → 20 mana; ụ đã bị nhiễu miễn 8 s; bỏ qua ụ đang dính hiệu ứng xấu. Co-op: 1 lần triệu hồi miễn phí + đồng đội +10% tốc. Solo: mọi quái −20% trong t s (cả trùm). 7★ tắt (s4:88–107, 119) | Hợp lý | 2 | Giữ. Solo: kẹp trùm ở 15% |
| santhuong · Bounty Beacon · Tím/ĐB | Mỗi 5 s/nhịp gắn TRUY NÃ cho 1 → 3 quái chưa bị gắn, +15% suy yếu (chung trần 25%), chết thì +4 → 8 mana (trùm ×5). Co-op: mỗi bàn nhận ⌈g/2⌉. Mana thưởng **không tăng theo wave** trong khi giết thường cho 10 + 2·(w−1) (s4:140–167, d:98) | Hơi chặt: cuối trận +4–8 mana gần như vô nghĩa | 3 | Thưởng = 15% → 30% của `manaGiet(w)` (theo ★) thay cho số cố định |
| nhatthuc · Eclipse · Vàng/TC | Đổi chế độ mỗi 8 s cố định. Ngày: ×1.5 → 2.5 + cháy 4 s. Đêm: nón +100 px ×0.6, chậm 25% 2 s (trùm cũng 25%). 2 Eclipse luôn lệch pha. 7★: 1.5 s cả hai + nổ ×4 (s4:189–211) | Hợp lý | 2 | Giữ. Kẹp chậm trên trùm 15% |
| loren · Scrap Forge · Vàng/ĐB | Ăn ụ khác loại 1–3★: +1 → 4 cộng dồn (ụ 3★ ×3), **tối đa 15**. Mỗi cộng dồn +4% (cấp thẻ tới 5.5%), **trần +60%**, chỉ cho **1 ụ TC mạnh nhất**. Nhiều Forge cũng kẹp 60% mỗi ụ nhận. Cấp thẻ chỉ làm chạm trần sớm hơn (11 cộng dồn). Đem ghép là mất cộng dồn (trừ khi ghép ra đúng Forge). Power-up không tác dụng (s4:250–281, d:209) | Lạ/quá chặt: ăn ụ thật để đổi lấy +60% cho một ụ, trần chặn mất giá trị của cấp thẻ | 4 | Trần 60% → 60% + phần cấp thẻ (tối đa 82%), MAX 15 → 20. Hoặc buff mọi ụ TC CÙNG LOẠI với ụ mạnh nhất (kiểu aura DCDW) |
| guongcong · Mirror Gate · Vàng/HT | Ụ kề kháng khống chế 0.15·k = 34.5% ở 1★, **kẹp cứng 35%** (ht:29, 143). ★, cấp thẻ (34.5 → 48.3) và power-up gần như không tác dụng. Gương nạp 20 s (7★: 15 s): chặn 1 chiêu trùm / phản 1 hiệu ứng PVP (Kẹp 4 s cho 1 ụ, 7★: 2 ụ). Co-op chép 1 hiệu ứng ghép ở ½★ (s4:293–343, d:227) | Lạ/quá chặt: trần đạt từ 1★ | 4 | Hạ gốc 0.15 → 0.08·k (18% ở 1★). Trần 35% × CAP_BAC (vàng = 52%). Cho cấp thẻ giảm nạp gương (−0.3 s/cấp) |
| marionette · Marionette · Vàng/ĐB | Mỗi 10 → 7 s (theo tốc) điều khiển 1 quái (7★: 2) nhiều máu nhất. Không trùm, quái to chỉ từ 4★. Đi lùi 2 → 5 s; va chạm gây min(30% máu con rối, ×4 sát thương), tối đa 6 lần; nổ ×8 trong 60 px. Chỉ 1 lượt rối cùng lúc. **Con rối chết không cho mana** (s4:352–381, 164) | Hơi chặt: mất mana là cái giá ẩn | 3 | Rối chết vẫn cho 50% mana. Giữ các số còn lại |

#### Bảng Chỉ huy (Ma vương)

| Chỉ huy | Luật hiện tại (số, file:dòng) | Đánh giá | Điểm 1–5 | Đề xuất |
|---|---|---|---|---|
| hero · REINFORCE | Giá 30, hồi 15 s (d:62). Gọi min(2, ô trống) ụ 1★ miễn phí, không tăng giá triệu hồi. Thiếu ô thì mỗi ụ thiếu +1★ cho ụ yếu nhất (bỏ đá/7★), mỗi ụ chỉ nhận 1 lần. Bàn đầy và mọi ụ 7★ thì không dùng được, không trừ mana (d:70; chihuy.js:19–29, 39, 52–53) | Hợp lý | 2 | Giữ. Có thể cho ụ gọi ra là 2★ sau wave 30 để còn ích khi giá đã ×16 trở lên |
| dahlia · RAGE | Giá 40, hồi 25 s. Mọi ụ của bàn mình ×2 sát thương trong 10 s; dùng lại chỉ làm mới, không cộng dồn (d:63, 71; chihuy.js:55; g:248) | Hợp lý | 2 | Giữ |
| eve · HOLY SHIELD | Giá 40, hồi 25 s. Khiên bàn 8 s chặn chiêu trùm và phá của đối thủ; khi dùng tẩy băng/đá/lửa/ngắm. Chỉ bàn mình (d:64, 72; chihuy.js:56–62; g:713, 726) | Hợp lý | 2 | Giữ |
| Luật chung LUAT_MV | Giá ×2 mỗi lần, không trần và không bao giờ hạ: 40 → 80 → 160 → 320 → 640 → 1280… (d:73; chihuy.js:49). Hồi chiêu vẫn chạy giữa wave; đồng hồ tác dụng dừng khi nghỉ wave và hết quái (chihuy.js:66–75). Chỉ huy không có cấp thẻ hay power-up. Chỉ `loa` hạ được: −hồi chiêu, hoặc −15% giá (không dưới giá gốc) (s2:361–363) | Hơi chặt: tăng theo cấp số nhân không trần, lần thứ 6–7 gần như không dùng được dù mana cuối trận khoảng 70/quái | 3 | Giữ ×2 như mô tả DCDW nhưng thêm trần giá = 16× gốc (640 / 480 cho hero). Hoặc giảm 1 bậc giá mỗi trùm bị hạ. Cân nhắc cho cấp thẻ chỉ huy (nếu có) +5% thời gian tác dụng |

#### Ghi chú tương tác (cấp thẻ và power-up)
- Năm ụ hỗ trợ chạm trần rất sớm nên cấp thẻ, ★ và power-up không đổi được kết quả: **tuthan** (từ 1★), **guongcong** (từ 1★), **thaukinh** (khoảng 2★), **nangsao** (2★), **lophanung** (1–2★). Quyết định mới "cấp thẻ nâng trần hỗ trợ" mới chỉ nâng CAP_BAC theo bậc, chưa nâng theo cấp, nên với các ụ này cấp thẻ hoàn toàn vô hiệu. Hướng sửa: hạ hệ số gốc, hoặc cho trần nhân thêm (1 + 0.02·cấp).
- `PU_KHONG` (khien, hopbi, tuthan, tienhoa, haoquang, loren) trái với quyết định "power-up tăng cả kỹ năng không gây sát thương". Các đề xuất power-up ở trên (−chu kỳ / −thời gian / +thời gian bất tử) là để vá chỗ này.
- Power-up cho ụ hỗ trợ đi qua +6%/LV trong `HOTRO.k` (ht:22), nhưng ở `nangsao` trần 39% được kẹp TRƯỚC khi nhân power-up (s2:568), nên power-up là thứ duy nhất vượt được trần đó (lên tới 48%). Chỗ này không nhất quán với các ụ hỗ trợ khác.
- Mọi nguồn suy yếu (santhuong 15%, cauvong 5–11%, lophanung 7★ 10%…) dùng chung trần 25% (ht:110). Một đội có 2–3 nguồn thì nguồn thứ 3 vô dụng.

## 6. Phụ lục — ghi chú nghiên cứu DCDW

### Cộng dồn / tăng dần trong DCDW (+ Lucky Defense) — nghiên cứu 06/11/2026

Độ tin: chữ kỹ năng GỐC trong game gần như không đọc được. namu.wiki (DCDW /차일드, 운빨존많겜/영웅/신화) và thisisgame lỗi tải. Các bài inven / xportsnews / khgames chỉ có trong ghi chú cũ, lần này KHÔNG mở lại được (cần quyền) → dùng nội dung đã ghi trong file local, ghi rõ "(ghi chú cũ)".
"chưa xác nhận" = không có nguồn nói rõ. KHÔNG bịa số.

#### 0. Katarina (카타리나) — KHÔNG tìm thấy trong DCDW
- Tìm "디펜스 워 카타리나", "카타리나 차일드 불꽃": không có kết quả nào về DCDW. Không file local nào nhắc tới.
- Child có cơ chế "lửa cộng dồn" thật sự là **Kalaratri (카라라트리)** → rất có thể là con đang được hỏi. Xem mục 1.

#### 1. Kalaratri 카라라트리 (Huyền thoại, ra 04/02/2022)
- Câu gốc duy nhất: "보유한 불꽃의 숫자만큼 대미지와 치명타 확률이 증가하며, 전투 시 합체하면 십자 방향에 있는 동일 차일드에게 불꽃을 지급하고, 공속 버프가 주어진다."
- Phạm vi nhận: Kalaratri khác (동일 차일드) ở **4 ô chữ thập** (trên/dưới/trái/phải) quanh chỗ ghép. Không phải cả hàng, cả cột hay cả bàn. (Ô kề 1 bước hay cả tia chữ thập dài: chưa xác nhận — chữ "십자 방향" hơi mơ hồ.)
- Kích hoạt: **ghép (합체) trong trận**. Không thấy nói đánh / triệu hồi cho lửa.
- Mỗi lửa +: tăng sát thương và tỉ lệ chí mạng — **số % mỗi lửa: chưa xác nhận**. Có thêm buff tốc đánh (cho ai, bao lâu: chưa xác nhận).
- Trần: chưa xác nhận. Reset: chưa xác nhận (lửa là "보유" = đang giữ trên thân; khi con đó bị đem đi ghép thì mất thân → suy ra mất lửa, chưa xác nhận).
- Nguồn: https://www.mumuplayer.com/kr/blog/destiny-child-new-character.html (đọc được); https://m.thisisgame.com/webzine/nboard/225/?n=141585 (lỗi tải).

#### 2. Child DCDW khác có cộng dồn / mạnh dần
### Aurora (아우로라, bản vàng, 20/08/2021)
- Phạm vi nhận: chưa xác nhận (ghi chú cũ: "mỗi lần ghép → sát thương cộng dồn").
- Kích hoạt: ghép. Mỗi lần +: chưa xác nhận. Trần: chưa xác nhận.
- Nguồn (ghi chú cũ, không mở lại được): https://www.inven.co.kr/webzine/news/?news=261166 , https://www.xportsnews.com/article/1463611

### Cosmem 코스밈 (Huyền thoại)
- Phạm vi: chính nó; đếm Child **cùng số sao** trên **cả bàn** (mọi loại).
- Kích hoạt: trạng thái bàn (không phải tích vĩnh viễn) → tự lên/xuống khi bàn đổi.
- Mỗi lần +: chưa xác nhận. Trần: **15** (bàn tối đa 15 ô; ghi chú cũ theo DC Inside #2161).
- Thêm: tiprelay nói Huyền thoại thường mạnh ~10%/cấp thẻ, Cosmem ~20%/cấp vì tốc đánh cũng tăng.
- Nguồn: local DCDW-COMBO.md (DC#2161, gameinn 1897); https://tiprelay.com/데스티니-차일드-디펜스워-덱-추천-조합-정리/

### Darby 다비
- Phạm vi: chính nó; đếm **tổng sao cả bàn**.
- Kích hoạt: tổng sao là bội số 10 → tốc đánh; đạt 50★ → thức tỉnh +350% sát thương (namu, ghi chú cũ).
- Mỗi mốc +: chưa xác nhận số tốc đánh. Trần: thực tế 50★ (đủ mốc thức tỉnh). tiprelay: "giữ 40성 이상" là mạnh.
- Nguồn: local DCDW-WIKI-TOM-TAT.md (en.namu.wiki); tiprelay (link trên).

### Removal Tee 제거티 (bingo)
- Phạm vi: chính nó, theo **hàng / cột** nó đứng.
- Kích hoạt: hàng ngang kín → +250% sát thương; cột dọc kín → +400% tốc đánh (namu, ghi chú cũ). Cộng dồn nhiều đường (DC Inside, ghi chú cũ).
- Trần: số hàng/cột của bàn 5×3. Không tích vĩnh viễn — vỡ hàng là mất.
- Nguồn: local DCDW-WIKI-TOM-TAT.md, DCDW-COMBO.md; tiprelay ("올빙고").

### Nebula 네뷸라 (Hiếm)
- Phạm vi: chính nó. Kích hoạt: bắn tia liên tục vào 1 mục tiêu → sát thương 10 → 1000. Trần: 1000. Reset: **đổi mục tiêu thì về đầu**.
- Nguồn: local DCDW-WIKI-TOM-TAT.md (en.namu.wiki, ghi chú cũ).

### Mars 마르스 (Hiếm)
- Phạm vi: **4 ô kề**. Kích hoạt: đứng cạnh. Mỗi nguồn: + sát thương phẳng, nhiều Mars **cộng dồn**. Trần: chưa xác nhận.
- Nguồn: local DCDW-WIKI-TOM-TAT.md.

### Jacheongbi 자청비 (Cổ đại)
- Phạm vi: chính nó. Kích hoạt: **thời gian** — khởi động chậm, mạnh dần, đủ ngưỡng → siêu chế độ sét. Mỗi lần +/ngưỡng: chưa xác nhận. Người chơi nuôi bằng Aurora King (tăng sao).
- Nguồn: local DCDW-WIKI-TOM-TAT.md; tiprelay.

### Rusalka 루살카 (Huyền thoại, 18/03/2022)
- Phạm vi: chính nó (chưa xác nhận có trao cho con khác không). Kích hoạt: ghép → nhận **giọt nước = số sao**; đánh quái bị chậm thì + sát thương, + chí mạng. Mỗi giọt +, trần: chưa xác nhận.
- Nguồn (ghi chú cũ, không mở lại được): https://www.khgames.co.kr/news/articleView.html?idxno=135069

### Gumiho 구미호 (Huyền thoại, 20/02/2023)
- Giữ "quả cầu sáng" khi ghép → buff sát thương. Phạm vi / mỗi lần / trần: chưa xác nhận. Nguồn: BlueStacks KR tin vắn (ghi chú cũ).

### Dana 다나 (Huyền thoại, 22/06/2021) — aura, không tích
- Phạm vi: **mọi Child cùng số sao với nó (cả bàn)**. + sát thương; số: chưa xác nhận. Nguồn (ghi chú cũ): https://www.xportsnews.com/article/1439566

### Mafdet 마프데트 — kích hoạt theo nhóm
- Khi ghép Mafdet → **mọi Mafdet trên bàn** thức tỉnh bắn pháo (có thời hạn, không tích). Nguồn: local DCDW-WIKI-TOM-TAT.md.

### Lupin 뤼팽 (18/01/2023)
- Đổi màu Đỏ→Vàng→Xanh; ghép cùng màu → combo, + tốc, + sát thương. Cộng dồn combo / trần: chưa xác nhận. Nguồn (ghi chú cũ): https://www.xportsnews.com/article/1678181

#### 3. Lucky Defense (운빨존많겜) — tóm tắt, nguồn mỏng
- **Hailey (thức tỉnh)**: cộng dồn "Star Power", **trần 10 stack**, đầy nâng cấp tới **+4000% sát thương** (tổng). Kích hoạt: tiêu vàng triệu hồi (ghidbase: "gold spent on summoning to boost Star Power"). Nhận: chính Hailey. Mỗi stack: chưa xác nhận.
  Nguồn: https://www.bluestacks.com/de/blog/game-guides/lucky-defense/lyds-hero-tier-list-de.html , https://ghidbase.github.io/lucky-defense-guides/pages/hell-mode-guide.html
- **Lancelot**: KHÔNG phải stack trong trận; nội tại Flame theo % máu mục tiêu, nâng vĩnh viễn bằng đá may mắn 0.2% → 2.2% (10 lần, 2 đá/lần). Nguồn: https://ghidbase.github.io/lucky-defense-guides/pages/unlock-order.html , https://www.pocketgamer.com/lucky-defense-omfg/tier-list
- **Bat Man**: mạnh lên khi tiêu vàng / lên cấp; cơ chế stack cụ thể chưa xác nhận. **Kitty Mage**: cần ≥3 con để giữ Vayne ở dạng ult (đếm số con, không phải stack). **Kun**: lên chậm nhất, mạnh khi cấp +80. **Ninja**: không tìm được nguồn. **Orc Shaman**: mỗi con −20 giáp (cộng dồn theo số con), mốc cấp 12 thêm −30 **không cộng dồn**. Nguồn: ghidbase hell-mode-guide (link trên).
- Uchi (우치): kỹ năng theo khoảng cách / số quái, không phải stack. Nguồn: https://namu.wiki/w/우치(운빨존많겜)

#### 4. Cấp thẻ & power-up trong trận
- Cấp thẻ: Huyền thoại ~**+10% / cấp** (Cosmem ~20%) — tiprelay. Không nguồn nào nói cấp thẻ đổi riêng giá trị MỖI stack → chưa xác nhận.
- Power-up trong trận (mana, 4 bước): mỗi bước + 1 lần sát thương gốc (local DCDW-TANG-SUC-MANH.md). Ảnh hưởng tới stack: chưa xác nhận (suy đoán: % stack nhân trên sát thương đã tăng).

#### Mẫu thiết kế DCDW
1. Buff cho NGƯỜI KHÁC hầu như là **4 ô kề / chữ thập** (Siren, Kirinus, Mars, Kalaratri trao lửa); cả bàn chỉ khi điều kiện "cùng sao / cùng loại" (Dana, Cosmem, Mafdet). Hàng/cột riêng = bingo của Removal Tee.
2. Kích hoạt chủ yếu bằng **GHÉP** (Kalaratri, Aurora, Rusalka, Gumiho, Mafdet), sau đó là trạng thái bàn (số sao, cùng sao, hàng/cột) và thời gian (Jacheongbi, Nebula). "Mỗi lần giết +1" gần như không thấy.
3. Đa số là **trạng thái bàn tự tính lại** (mất khi bàn đổi), không phải tích vĩnh viễn; stack giữ trên thân thì mất khi con đó bị ghép đi (suy luận).
4. Trần thường đến tự nhiên từ bàn 15 ô / 7★ (Cosmem 15, Darby 50★, bingo); trần số riêng hiếm (Nebula 1000); Lucky Defense Hailey có trần rõ 10.
5. Cấp thẻ ~+10%/cấp nhân lên sát thương gốc; power-up trong trận cộng sát thương gốc; con số mỗi stack của DCDW gần như KHÔNG có nguồn công khai → tự đặt số khi làm game.
