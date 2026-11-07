# Tóm tắt — tư vấn ChatGPT: làm lại họ BĂNG / CHẬM / THỜI GIAN (07/11/2026)

Nguồn: [CHATGPT.md](CHATGPT.md) (nguyên văn) · luật hiện tại trong code: [BANG-BANG.md](BANG-BANG.md). Chỉ là đề xuất, **chưa sửa code game**.

**Kết luận chính:** giữ cả 12 ụ, nhưng bỏ "làm chậm chung chung" khỏi 9 ụ. Mỗi ụ ăn một động từ riêng: đóng băng, vỡ băng, chuỗi đòn, giòn (chí mạng), phủ đường, đếm đám đông, chuỗi ngày–đêm, dồn sát thương, tua ngược, ấn màu, chống hồi máu, tiếng vọng.

## 1. Bốn trạng thái dùng chung (ai tạo / ai ăn)
| Trạng thái | Nghĩa | Tạo | Ăn |
|---|---|---|---|
| LẠNH (CHILL) | chậm, lấy giá trị lớn nhất, không cộng (trần 90% / trùm 50%) | dư âm Frost, hào quang Cryo | bộ đếm đám đông của Cryo; các kiểm tra "đang chậm" cũ |
| ĐÓNG BĂNG (FROZEN) | đứng im | Frost, Ice Blade, Blizzard, Cryo | VỠ BĂNG của Frost |
| GIÒN (BRITTLE) | +điểm % sát thương chí mạng nhận vào | Chiller | mọi đòn chí mạng trực tiếp |
| KHOÁ THỜI GIAN | đứng im + ghi sát thương để nổ sau | Chrono Lock | nổ của Chrono Lock |

Thứ tự thắng khi gặp nhau (di chuyển): KHOÁ > BĂNG > LẠNH; GIÒN độc lập, chồng được với cả 3. Băng và khoá chạy 2 đồng hồ riêng, không cộng giờ. **Miễn đóng băng 3 s dùng chung cho mọi nguồn băng** (khoá không bị miễn chặn). Quái bay băng miễn LẠNH + BĂNG, không miễn KHOÁ. Nhiều Chiller: lấy GIÒN mạnh nhất, không cộng. Sát thương phụ (vỡ băng, tiếng vọng, nổ dồn) không kích hoạt dây chuyền; RAGE ×2 đúng 1 lần.

## 2. Từng ụ (1–2 dòng; số LV9, độ khó 1–5)
- **Frost — Phán Quyết Pha Lê** (3): 6 s đóng băng quái đầu 2 s; đòn CHÍ MẠNG đầu tiên của đồng đội vào quái đang băng → VỠ BĂNG nổ 60% đòn đó (44 px) → 3★ 80% / 5★ 100%, hồi 4.5 s / 7★ 120%, băng 2 con, quái nhỏ <15% máu bị kết liễu. 1 lần vỡ/1 lần băng.
- **Ice Blade — Kiếm Sĩ Tê Cóng** (4): chém liên tiếp cùng 1 mục tiêu (đổi mục tiêu = về 0): +50%/đòn, đòn chốt ×3 + băng 0.5 s ở đòn thứ 3 → 3★ 4 đòn ×4 / 5★ 5 đòn ×6 + văng 40% / 7★ 6 đòn ×10 + văng 65%. Bỏ "×5 vào quái chậm".
- **Chiller — Lò Rèn Giòn** (4): 4 đòn của ụ Tấn công kề → GIÒN +25% sát thương chí mạng 3 s → 3★ cần ≥2 loại ụ, +45 / 5★ 5 đòn, +75 / 7★ 6 đòn từ ≥3 loại, +120. Thay hẳn làm chậm.
- **Blizzard — Người Vẽ Tuyết** (4): chia đường thành 8 đoạn; mỗi 1.5 s rắc tuyết lên đoạn có quái đầu (giữ 16 s); phủ 5/8 → TRẮNG XOÁ ×1.5 + băng 0.5 s → 6/8 ×2.5 / 7/8 ×4.5 / 8/8 ×7 + băng 1.2 s; hồi 18 s.
- **Cryo Reactor — Độ Không Tuyệt Đối** (5): giữ hào quang lạnh; đếm số quái KHÁC NHAU đang lạnh/băng/khoá trong vùng: 4 con → xung tự động 100% tổng sát thương gốc 4 ụ kề (hồi 12 s) → 3★ 6 con + bấm: 200%, băng 1.5 s / 5★ 8 con: 400%, băng 2.5 s, trùm tung chiêu chậm 25% / 7★ 10 con: 700%, băng 4 s, ụ kề +25% sát thương chí mạng 4 s.
- **Eclipse — Tiếp Sức Hoàng Hôn** (4): đánh dấu NGÀY 2 lần lên cùng quái rồi đòn ĐÊM → ×2 + 20% tốc 3 s → 3★ 3 dấu ×3 / 5★ 4 dấu ×5 / 7★ 5 dấu ×8, +90% tốc, +75% sát thương chí mạng, vòng nổ ×4 chỉ khi combo thành. Ban đêm bỏ làm chậm.
- **Chrono Lock — Phán Quyết Hoãn** (4): giữ nguyên số cũ (khoá 1.2→2.5 s, nổ 40→95% sát thương dồn) + thưởng mới: ≥3 loại ụ Tấn công cùng đánh quái bị khoá → nổ +20/40/60/100%.
- **Chrono Throne — Nợ Đường** (5): bỏ làm chậm theo tuổi; quái sống ≥8 s ăn 1 đòn TUỔI ×2 → 3★ ≥10 s, TUA NGƯỢC 15% ×6 (hồi 36 s) / 5★ ≥14 s, 23% ×9 / 7★ ≥18 s, 30% ×13, hồi 1 tim 1 lần.
- **Prism Thief XANH — Nợ Màu** (3): đạn XANH dán ấn 5 s; đạn ĐỎ/VÀNG sau đó ăn ấn ×1.6 → ×2.2 / ×3 / 7★ ×4.5 + VÀNG +80% sát thương chí mạng; một viên không tự dán và tự ăn.
- **Venom 7★ — Vỡ Độc** (4): dấu +22%; nếu quái mất 25% máu tối đa trong 5 s dấu → nổ độc 15% máu tối đa (trùm tối đa 2%), quái được hồi máu −60%.
- **Rainbow 7★ — Tiếng Vọng Quang Phổ** (4): quái đi qua 2–3 màu vệt khác nhau → các đòn kế được lặp lại 25/45/75% (không chí mạng, không lặp chồng); 7★ bỏ làm chậm 35%.
- **Pandora — Vận Kính Tuyết** (5): ô "đóng băng tất cả 1.5 s" đổi thành 2/3/4/6 đòn chí mạng kế của đồng đội +30/50/85/130% sát thương chí mạng (8 s).

## 3. Bảng tương tác (dịch gọn; CỘNG = hợp, NGƯỢC = khắc, ĐÈ = luật ưu tiên)
| Cơ chế | Ụ băng khác | Ụ chí mạng (Hammer, Antenna, Focus Lens, Berserker, Werewolf, Dice Gun) | Ụ cộng dồn (Amplifier, Nine-Tail, Chain Link, Choir, Star Cannon) | Hỗ trợ (Radar, Star Lift, Armor Breaker, Venom) | Copycat / Mimic | Ụ bị băng / đá | Trùm | PvP |
|---|---|---|---|---|---|---|---|---|
| Frost Vỡ Băng | CỘNG Chiller (vỡ mạnh hơn), Ice Blade (giữ mục tiêu); ĐÈ miễn băng chung với Blizzard; song song với khoá | CỘNG mạnh tất cả (chí mạng = mồi vỡ) | CỘNG (giữ mục tiêu, vỡ giúp giết) | Radar/Star Lift không giảm hồi chiêu Frost; CỘNG Venom | Copycat: bản sao băng, vỡ 70% · Mimic: ghép thường | NGƯỢC: không tung chiêu | CỘNG Hive Mother, Twin Core(7★); NGƯỢC Prism Warden (1 loại), Patch Titan (trùm chỉ băng 0.6 s), mọi trùm khoá/hạ sao | NGƯỢC: miễn 3 s chặn khoá chuỗi |
| Ice Blade Tê Cóng | CỘNG băng/khoá/lạnh (giữ mục tiêu cho chuỗi) | CỘNG (đòn chốt chí mạng) | CỘNG Amplifier (cùng mục tiêu) | CỘNG Radar (chuỗi nhanh hơn) | Copycat: chuỗi riêng · Mimic: ghép = mất chuỗi | NGƯỢC | CỘNG trùm máu trâu, Patch Titan; NGƯỢC Twin Core (tách = reset), Hive (drone reset) | CỘNG: diệt trùm chính xác |
| Chiller Giòn | ĐÈ: nhiều Chiller lấy mạnh nhất; CỘNG mọi đòn chí mạng của họ băng | CỘNG mạnh nhất (Focus Lens/Werewolf là jackpot) — rủi ro lạm phát | CỘNG (chí mạng của ụ cộng dồn) | CỘNG Radar, Armor Breaker | Copycat: lấy giòn mạnh nhất | NGƯỢC: hào quang tắt | NGƯỢC Static Jammer (nhắm hỗ trợ trước), Mad Crown/Joker (phá bố cục); CỘNG Prism Warden (nhiều loại ụ kề) | NGƯỢC: hỗ trợ sao cao bị nhắm |
| Blizzard Tuyết | ĐÈ: 1 đoạn chỉ 1 dấu tuyết dù nhiều Blizzard; CỘNG Cryo (băng làm tăng đếm) | CỘNG (TRẮNG XOÁ chí mạng được) | phần lớn không liên quan; CỘNG Nine-Tail | CỘNG Radar (rắc nhanh) | Copycat: phủ chung | NGƯỢC | CỘNG Hive, Twin Core; NGƯỢC Prism Warden, trùm đơn lẻ | CỘNG: khống chế đám đông, cổng 18 s |
| Cryo Độ Không | ĐÈ: đếm theo ID quái, không đếm nguồn; CỘNG mọi nguồn băng/khoá | CỘNG ụ chí mạng kề (7★ +sát thương chí mạng) | CỘNG (giữ quái cho ụ khác) | Radar/Star Lift không tác dụng (không phải ụ Tấn công) | Copycat: không đếm trùng | NGƯỢC: tắt hào quang + bấm | CỘNG Hive; NGƯỢC trùm đơn, Twin Core (chỉ 2), Static Jammer | NGƯỢC: sóng trùm thưa |
| Eclipse Hoàng Hôn | CỘNG băng/lạnh (giữ quái qua lượt đổi) | CỘNG Focus Lens (combo ×8 chí mạng) | CỘNG Amplifier, Nine-Tail | CỘNG Radar | Copycat: dấu riêng · Mimic: mất tiến trình | NGƯỢC | CỘNG Patch Titan, trùm lâu; NGƯỢC Twin Core, Hive, Star Leech | NGƯỢC: chu kỳ 8 s dễ đoán |
| Chrono Lock Hoãn | ĐÈ: 1 khoá/quái, đồng hồ song song với băng | CỘNG (chí mạng được ghi vào sổ) | CỘNG (mọi sát thương được ghi) | không giảm hồi chiêu; CỘNG Armor Breaker, Venom | Copycat: hồi chiêu riêng | NGƯỢC | CỘNG trùm đơn (nửa hiệu lực), bay băng; NGƯỢC Twin Core, Hive | CỘNG: khắc bay băng |
| Chrono Throne Nợ Đường | CỘNG băng/khoá (thêm tuổi) | NGƯỢC Berserker/Werewolf/Dice (giết sớm, không kịp tuổi) | NGƯỢC tất cả (giết nhanh = mất tuổi) | tuổi theo thời gian thực | Copycat: tuổi tính 1 lần | NGƯỢC | CỘNG trùm lâu, Patch Titan; NGƯỢC Twin Core (lõi mới tuổi 0), Hive | NGƯỢC: cần quái sống lâu |
| Prism Nợ Màu | CỘNG (băng giữ quái mang ấn) | CỘNG (VÀNG chí mạng) | CỘNG Amplifier, Nine-Tail | CỘNG Radar | Copycat giữ danh tính 1 loại | NGƯỢC | NGƯỢC Prism Warden (3 màu = 1 loại), Twin Core (mất ấn) | NGƯỢC: quái chết trước combo |
| Venom Vỡ Độc | ĐÈ: lấy dấu mạnh nhất; CỘNG mọi nổ (đạt ngưỡng 25%) | CỘNG | CỘNG | — | Copycat: lấy mạnh nhất | NGƯỢC | CỘNG mạnh Patch Titan (−60% hồi); NGƯỢC Twin Core, Hive | CỘNG: khắc Patch Titan |
| Rainbow Tiếng Vọng | ĐÈ: tua ngược không "cày" màu | tiếng vọng KHÔNG chí mạng (chặn nhân đôi chí mạng vô hạn) | ĐÈ: tiếng vọng không tính thêm đòn cộng dồn / Choir / mốc | CỘNG Armor Breaker | Copycat: màu không tính trùng | NGƯỢC | CỘNG Hive, Patch Titan; NGƯỢC Prism Warden (giữ loại gốc) | NGƯỢC: không có khống chế cứng |
| Pandora Vận Kính | ĐÈ: 1 thẻ/đòn | CỘNG mạnh (Werewolf, Dice Gun) | CỘNG | CỘNG | Mimic: chỉ kỹ năng ghép của nguồn chạy | NGƯỢC: không ghép thường | CỘNG Hive, Twin Core | NGƯỢC: kết quả seed 1/6 |

Luật trạng thái ụ GIỮ NGUYÊN: ụ băng/đá bỏ qua trạng thái xấu mới nhưng vẫn mất sao; MK/Teleporter/Copycat vẫn kéo lên ụ băng/đá; ụ câm không ghép; đá+đá +1★; khiên bàn > Mirror > khiên ụ; Teleporter không tính ghép cho Archive; REINFORCE bỏ ụ băng.

**Hợp chính:** Frost + Chiller + ụ chí mạng (băng → chí mạng → vỡ, giòn làm vỡ to); Ice Blade + nguồn giữ mục tiêu (băng/khoá/Amplifier/Radar); Cryo + mọi nguồn khống chế (đếm đám đông); Chrono Lock + bộ bài nhiều loại ụ. **Khắc chính:** Chrono Throne ngược với bộ giết nhanh (Nine-Tail, Berserker…); Twin Core/Hive reset mọi cơ chế "cùng mục tiêu"; Static Jammer/Mad Crown/Joker phá Chiller & Cryo (cần bố cục kề); Prism Warden không tính 3 màu Prism là 3 loại.

## 4. Các họ khác bị trùng (1 dòng/ụ — giữ/khắc đặc trưng)
- **Chí mạng / kết liễu:** Hammer = chí mạng gây choáng · Crit Antenna = chí mạng ổn định, vượt 100% đổi 2:1 sang sát thương chí mạng · Focus Lens = chí mạng xuyên · Berserker = chuỗi chí mạng → cuồng tốc · Werewolf = thức tỉnh chí mạng chắc · Dice Gun = chí mạng ra mặt max · Lone Ace = đứng một mình · Guillotine = may rủi giết ngay · Reaper = hỗ trợ kết liễu <30% · Nemesis = đao phủ trùm. *Rủi ro nhất: Hammer ≈ Crit Antenna.*
- **Tốc bắn:** Radar = tốc đơn giản (chỉ con này được đơn giản) · Star Lift = ưu ụ sao thấp · Fusion Mixer = đa loại hàng/cột · Overclock = hiến ụ · Gatling = nóng dần, đổi mục tiêu xả nhiệt · Nine-Tail = đà giết.
- **Hỗ trợ sát thương chung:** Armor Breaker = ưu tiên mục tiêu · Amplifier = đầu tư 1 mục tiêu · Sync Cannon = mạng cùng sao · Star Breaker = phá PvP · Cleanser = tẩy, rảnh thì +sát thương · Sanctum = cụm bảo vệ · Resonance Grid = hình chéo · Rainbow = tiếng vọng.
- **Mana:** Mana Core thụ động · Mana Doubler khi ghép · Mana Leech khi đánh · Bounty Beacon hợp đồng giết · Energy Cannon giữ mana = sát thương (đo mana/đợt 20 s).
- **Ghép / sinh ụ / sao:** Cloner, Twin Maker, Evolver, Mystery Box, Lighthouse dễ thành "máy cho ụ free" giống nhau → phải khác theo thời điểm, phân bố sao, mức kiểm soát.
- **Cộng dồn / jackpot (soát ngay sau họ băng):** Quantum Choir = đông cùng sao bất kể vị trí · Chain Link = nối liền thật · Sync Cannon = đa dạng/đội hình cùng sao — không được thành cùng công thức "+% mỗi ụ giống".
- **PvP:** Jammer = phá nhịp (−40% tốc) · Signal Jammer = phá kinh tế (+giá) — không dùng chung hiệu ứng "kẹp".
- **Diện rộng:** Tesla / Storm Gun / Ricochet dễ thành 3 bản chớp nối giống nhau → Tesla = nhiều quái rời, Storm Gun = chớp tức thì gần, Ricochet = nảy dài mạnh dần.

## 5. Ưu tiên làm trước (ChatGPT)
1. Chiller → GIÒN (rủi ro lạm phát chí mạng; test 2–4 Chiller, 100% chí mạng, Focus Lens, Werewolf).
2. Ice Blade → chuỗi đòn (rủi ro 6 đòn khó đạt ở 0.75 phát/s).
3. Frost → VỠ BĂNG (chặn dây chuyền, 1 vỡ/1 băng).
4. Prism XANH → Nợ Màu (7★ đủ 3 màu: ấn phải từ viên trước).
5. Venom 7★ → Vỡ Độc (kiểm Patch Titan hồi 12% + 35%).
Bộ bài thử đầu tiên: Frost + Ice Blade + Chiller + Crit Antenna + Radar. Mọi đồng hồ trạng thái lưu theo tick số nguyên (60 tick = 1 s), không tốn RNG.

## 6. Nhận xét của session (chưa hỏi lại ChatGPT)
- Chrono Lock gần như giữ nguyên (chỉ thêm thưởng ≥3 loại ụ) — ổn vì đã độc đáo.
- Sau đề xuất, chỉ còn Cryo (hào quang) và dư âm Frost gây LẠNH → các buff "+sát thương vào quái chậm" cũ (Cryo `lanh`, Chiller 5★) cần xét lại; Ice Blade không còn ăn trạng thái chậm.
- Số Cryo 7★ (10 quái cùng lúc trong vùng) và Blizzard 8/8 đoạn cần đo trên bàn thật trước khi chốt.
