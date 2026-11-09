# Ụ SÁNG TẠO — làm lại 53 ụ Trắng / Xanh / Tím (09/11) — CHỈ ĐỀ XUẤT, chưa sửa game

Yêu cầu người dùng: *"kiểm tra lại các ụ trắng xanh và tím, chả có tý gì gọi là đặc sắc cả, phải như DCDW hoặc Random Dice chứ, tôi thấy nhiều ụ tích lực quá"* · *"hãy free style sáng tạo giống như Ụ trứng ấy … không nhất thiết cứ phải là súng, hay như ụ trái tim chẳng hạn"*.

Nguồn đã rà (nhánh `claude/demo-hop-tuong` @ 12b2dd287): `thap/assets/roster.json` (nguồn ụ chính, 97 ụ: 14 Trắng · 17 Xanh · 22 Tím · 33 Vàng · 11 Đỏ), `thap/js/text.js` (mô tả kỹ năng), `skills*.js`, `data.js` (`TIERS`, `KY_NANG_CAP`), `phattrien.js` (`HO`), `docs/demo-hop-tuong/tuvan/trung-lap/DE-XUAT.md` (đề xuất tách ụ trùng 11/11 — bản này kế thừa vài ý).

Không tham khảo ChatGPT đợt này (không bắt buộc).

---

## 0. Vì sao người dùng thích "Ụ trứng" và "ụ trái tim"

| Ụ | Thực tế trong game | Điều làm nó "đặc sắc" |
|---|---|---|
| **Evolver / Trứng Tiến Hoá** (`tienhoa`, Vàng) | Quả trứng không bắn; nở sau 10 s + 2 s/★ thành ụ ngẫu nhiên +1★; 6★ cháy thành trứng 7★, chạm lấy +20 mana | 1) **Vật thể đời thường**, không phải súng. 2) **Nhìn là hiểu**: trứng → nở. 3) Có **cử động/cá tính** (rung, nứt vỏ). 4) **Một cơ chế duy nhất**, không phải "+X% chỉ số". 5) Có **khoảnh khắc** (lúc nở, trứng cháy). |
| **Blood Circuit / Mạch Máu** (`mauhut`, Vàng) — ụ trái tim | Trái tim có ống mạch, đập; NUỐT ụ của mình lấy Máu, đổi dạng ở 20/50/100 Máu | Vật thể kỳ quặc, **sống** (đập), cơ chế "ăn đồng đội" có quyết định đánh đổi rõ ràng. |

=> Tiêu chí cho bộ mới: **(a) vật thể/sinh vật có cá tính + cử động riêng, (b) một luật dễ nhận trong 2 giây, (c) có quyết định đặt/ghép, (d) có khoảnh khắc nhìn thấy được.** Chỉ số (+% tốc, +% chí mạng…) chỉ là phụ.

---

## 1. Hiện trạng 53 ụ Trắng / Xanh / Tím

Cột **Đặc sắc**: 1 = rất nhạt (chỉ là chỉ số) … 5 = có cá tính rõ. **TL** = có tích lực / cộng dồn / chờ nạp (✓) hay không. **Lan** = có sát thương lan/vùng (vi phạm luật cấm splash).

### Trắng (14)
| id | Tên hiện tại | Cơ chế | TL | Lan | Trùng với | Đặc sắc |
|---|---|---|---|---|---|---|
| xucxac | Dice Gun / Pháo May Rủi | ST ngẫu nhiên 3–300% | | | — | 3 |
| lien | Gatling / Liên Thanh | bắn rất nhanh quái đầu | | | phun, sungluc (chỉ khác chỉ số) | 1 |
| phun | Scatter / Súng Phun Loạn | bắn nhanh quái ngẫu nhiên | | | lien | 1 |
| sungluc | Revolver / Súng Lục | 1 phát to quái đầu | | | tia | 1 |
| bang | Frost / Băng | đóng băng quái đầu 2 s | | | khoathoigian, baotuyet | 2 |
| doc | Venom / Độc | đánh dấu +12% ST nhận | | | phagiap, santhuong (đánh dấu) | 2 |
| mana | Mana Core / Máy Mana | không bắn, sinh mana | | | nhanmana, hutmana | 2 |
| tia | Sniper / Bắn Tỉa | quái nhiều máu, +100% quái to | | | sungluc | 2 |
| set | Tesla | sét nhảy N quái | | | bao, nayda | 2 |
| maychem | Guillotine / Máy Chém | tỉ lệ giết ngay quái nhỏ | | | tuthan | 2 |
| phagiap | Armor Breaker / Phá Giáp | hỗ trợ ô kề: quái bị lộ | | | doc + nhóm "ô kề" | 1 |
| bua | Hammer / Búa Đẩy | hỗ trợ ô kề: chí mạng | | | chimang, thaukinh | 1 |
| nam | Iron Fist / Nắm Đấm Sắt | cận chiến, nổ vòng quanh | | ✓ | — | 2 |
| bomhen | Time Bomb / Bom Hẹn Giờ | bom 5 s, nổ làm yếu quái quanh | (hẹn giờ) | ✓ | — | 2 |

### Xanh (17)
| id | Tên hiện tại | Cơ chế | TL | Lan | Trùng với | Đặc sắc |
|---|---|---|---|---|---|---|
| nhanmana | Mana Doubler | ghép 2 → nhiều mana | | | mẫu "ghép 2 → nhận X" | 1 |
| kiembang | Ice Blade / Kiếm Băng | ×5 vào quái chậm, tự lan chậm | | (lan chậm) | tự đủ, không cần đồng đội | 3 |
| mimic | Mimic | ghép với bất kỳ ụ cùng sao | | | — (luật DCDW tốt, hình nhạt) | 3 |
| chimang | Crit Antenna | ô kề +chí mạng | | | bua, thaukinh | 1 |
| dichchuyen | Teleporter | đổi chỗ với ụ cùng sao | | | — | 3 |
| radar | Radar | ô kề +tốc | | | tron, nangsao | 1 |
| drone | Drone Bay | ghép kéo xa → nhiều drone | | | — (kéo xa là ý hay) | 4 |
| tron | Fusion Mixer | +tốc theo số loại trong hàng+cột | | | radar | 3 |
| nangluong | Energy Cannon | ST theo mana đang giữ | ✓ | | Thác Mana (Đỏ) | 2 |
| laser | Laser | tia mạnh dần ×4 trong 3 s | ✓ | | — | 2 |
| lanhgia | Chiller | ô kề bắn thêm làm chậm | | | Cryo Reactor, kiembang | 1 |
| mortar | Mortar / Súng Cối | đạn nổ vùng, phát 3 chùm | | ✓ | no5 | 2 |
| khuech | Amplifier | ô kề cộng dồn ST theo đòn | ✓ | | phagiap | 1 |
| vungdoc | Toxic Pool | vũng độc trên đường | | ✓ (vùng) | doc | 2 |
| loa | Cooldown Horn | ghép 2 → giảm hồi chiêu chỉ huy | | | mẫu "ghép 2" | 1 |
| hutmana | Mana Leech | bắn quái đầu, hồi chút mana | | | mana | 2 |
| min | Mine Layer | rải mìn trên đường | | (nổ) | bomhen | 2 |

### Tím (22)
| id | Tên hiện tại | Cơ chế | TL | Lan | Trùng với | Đặc sắc |
|---|---|---|---|---|---|---|
| cuongno | Berserker | chí mạng tích RAGE → cuồng nộ | ✓ | | — | 2 |
| baotuyet | Blizzard | chậm toàn bàn | | | bang, lanhgia | 2 |
| nhanban | Cloner | ghép 2 → thêm ụ 1★ | | | sinhdoi, anhsang | 2 |
| lienket | Chain Link | mạnh theo số mắt xích kề | ✓ (đếm) | | — | 3 |
| kepha | Jammer | ghép 2 → PVP làm chậm đối thủ | | | mẫu "ghép 2", Solo ≈ 0 | 1 |
| taylo | Cleanser | ô kề: tẩy khống chế | | | nhóm "ô kề" | 1 |
| khien | Shield Gen | ô kề: khiên 1 lần | | | nhóm "ô kề", Solo ≈ 0 | 1 |
| hopbi | Mystery Box | chờ 58 s → ụ ngẫu nhiên | (chờ) | | tienhoa | 3 |
| nangsao | Star Lift | ô kề +tốc, tích pip sao | ✓ | | radar | 2 |
| tuthan | Reaper Pillar | ô kề: giết ngay quái <30% | | | maychem | 1 |
| xaotron | Scrambler | ghép 2 → xáo ụ | | | mẫu "ghép 2" | 3 |
| epxung | Overclock | kéo vào ụ: +90% tốc, cộng dồn | ✓ | | radar | 2 |
| no5 | Fifth Shot | đếm 5 phát → 3 mũi nổ | ✓ | ✓ | mortar | 2 |
| bao | Storm Gun | đòn tức thì, nảy | | | set, nayda | 2 |
| anhsang | Lighthouse | tích quả cầu → triệu hồi 1★ | ✓ | | nhanban | 2 |
| nayda | Ricochet | đĩa nảy, mạnh dần mỗi nảy | ✓ | | set, bao | 2 |
| combo | Combo Core | ghép → mọi Combo Core +ST vĩnh viễn | ✓ | | — | 3 |
| khoathoigian | Chrono Lock | khoá quái, tích ST rồi nổ | ✓ | | bang | 2 |
| docton | Lone Ace | đứng một mình ×2 tốc | | | — | 4 |
| thaukinh | Focus Lens | ô kề +ST chí mạng | | | bua, chimang | 1 |
| nhieusong | Signal Jammer | ghép 2 → PVP nhiễu | | | kepha | 1 |
| santhuong | Bounty Beacon | đánh dấu, giết được mana | | | doc | 2 |

### Tóm tắt hiện trạng
- **Nhạt (điểm ≤ 2): 42 / 53 (79%)**; chỉ 2 ụ đạt 4 (Drone Bay, Lone Ace).
- **Tích lực / cộng dồn / chờ nạp: 13 / 53 (25%)** — laser, nangluong, khuech, cuongno, lienket, nangsao, epxung, no5, anhsang, nayda, combo, khoathoigian, hopbi. Bậc Vàng/Đỏ còn dày hơn (stack La Bàn, lửa Ember, Kho Lưu, Twin Anvil, Prism, Máu, Nhiệt Rồng, Cửu Vĩ…) nên người dùng thấy "nhiều ụ tích lực".
- **12 ụ "hỗ trợ 4 ô kề +%"** (phagiap, bua, chimang, radar, tron, lanhgia, khuech, taylo, khien, nangsao, tuthan, thaukinh) — cùng một khuôn, chỉ khác con số.
- **8 ụ "ghép 2 cái → nhận X"** (nhanmana, drone, loa, nhanban, kepha, xaotron, nhieusong, combo).
- **5 ụ có sát thương lan/vùng** trái luật cấm splash: nam, bomhen, mortar, vungdoc, no5 (+ min nổ).
- **Hình:** gần như toàn bộ là "ụ súng/máy" cùng một khuôn → không phân biệt được trên bàn.

---

## 2. Nguyên tắc bộ mới

1. **Giữ nguyên `id`, `bac`, số ô** (14/17/22) → bộ sưu tập, cấp thẻ, bộ bài, lưu online của người chơi cũ không mất. Chỉ đổi `ten`/`ten_vi`/`kyNang`, hình (ụ + chân dung + pixel), và luật trong `SKILLS[id]`.
2. **Mỗi ụ 1 luật**, đọc được trong 2 giây; mốc 3★/5★/7★ chỉ là "nâng" luật đó.
3. **Không sát thương lan / tràn.** Mọi đòn trúng **mục tiêu chỉ định** (1 hoặc vài quái gọi tên rõ: "quái đầu", "3 quái đầu", "quái giẫm lỗ"). Vùng chỉ được dùng cho **khống chế** (chậm/đứng), không gây ST.
4. **Tích lực ≤ 15%:** bộ mới chỉ **2 ụ cộng dồn thật** (Kính Lúp, Búp Bê Matryoshka) + 2 ụ "đếm giờ" (Hộp Quà, Bonsai) = 4/53 (7,5%).
5. **Tất định online:** mọi chỗ ngẫu nhiên dùng `rngLuat(B, muoi, T.o)` (quyết định đổi bàn/mục tiêu) hoặc `rngSinh` — **muối mới riêng** cho từng ụ; không `Math.random` trong luật (chỉ được dùng cho hạt bụi trang trí).
6. **Đa dạng vật thể:** 15/53 (28%) vũ khí cận chiến/cổ điển, còn lại đồ vật / sinh vật / kỳ quặc.
7. **Chân dung:** 26 người/anime (49%) · 11 sinh vật nhỏ dễ thương (21%) · 8 quái (15%) · 8 máy/linh hồn (15%).
8. **Hỗ trợ không còn khuôn "4 ô kề +%"**: mỗi ụ hỗ trợ có **hình học riêng** (chéo, cột, trái-phải, hàng, theo hướng khiên).

Ký hiệu cột: **Vai** TC = sát thương · KC = khống chế · HT = hỗ trợ · KT = kinh tế/mana · BÀN = đổi bàn/ghép · PVP. **CD** = loại chân dung (Ng = người/anime · SV = sinh vật nhỏ · Q = quái · M = máy/linh hồn). **VK** = vũ khí. **TL** = tích lực.

---

## 3. Bộ mới — Trắng (14): "một trò, một nhìn là hiểu"

| id | Tên mới EN / VI | Hình dung (vật thể · cá tính · cử động) | Cơ chế (1 câu) | Vai | Ghép / mốc ★ | CD |
|---|---|---|---|---|---|---|
| xucxac | **Lucky Die / Xúc Xắc Lắc** | Xúc xắc gỗ to có chấm đỏ, tự nảy tưng tưng rồi lăn vào quái | Mỗi đòn tung mặt 1–6 (`rngLuat`): ST = mặt × 0,5D; ra **6 thì tung tiếp ngay** (tối đa 2 lần nối) | TC | 3★ mặt 1 đổi thành mặt 2 · 5★ nối tối đa 3 · 7★ chí mạng = mặt 6 | Ng (cô nàng sòng bạc) |
| lien | **Zhuge Repeater / Liên Nỏ Gia Cát** VK | Nỏ liên châu gỗ có hộp tên trên lưng, cần gạt giật liên hồi | Bắn **băng 10 mũi** cực nhanh vào quái đầu rồi **nạp 1,5 s** (thanh băng đạn thấy được); ★ thêm mũi/băng | TC | 3★ 12 mũi · 5★ nạp 1,1 s · 7★ 15 mũi | Ng (quân sư áo lam) |
| phun | **Bee Hive / Tổ Ong** | Tổ ong treo, ong mũm mĩm bay ra-vào | Thả 2 + ⌊★/2⌋ con ong; mỗi con bay tới **quái ngẫu nhiên** (`rngLuat`), đốt 1 phát rồi **bay về** → đặt gần đường thì đốt dày hơn | TC | xem mẫu §6.2 | SV (ong nghệ) |
| sungluc | **Iaido Katana / Kiếm Rút Nhanh** VK | Kiếm trong vỏ trên giá, rung khi quái tới gần | **Chém 1 nhát to** vào quái đầu tiên trong **dải hàng hoặc cột** của ô (kéo dài ra đường) → chỗ đặt quyết định | TC | xem mẫu §6.1 | Ng (nữ ronin) |
| bang | **Snow Globe / Quả Cầu Tuyết** | Quả cầu thuỷ tinh có làng tuyết, tự lắc | Mỗi 6 s **nhốt quái đầu vào cầu** 2 s (trùm: chậm 50% 0,6 s); đòn đầu tiên vào quái trong cầu **×1,5 và làm vỡ cầu** (thả sớm) | KC | 3★ cầu 2,5 s · 5★ vỡ cầu ×2 · 7★ nhốt 2 quái | M (tinh linh tuyết) |
| doc | **Blowgun / Ống Thổi Phi Tiêu** VK | Ống tre có lông vũ, phồng má thổi | Thổi phi tiêu đánh dấu quái đầu 5 s (+12% ST nhận); **quái bị dấu chết → dấu nhảy sang quái đầu kế tiếp** | HT | 3★ dấu 6 s · 5★ 2 dấu · 7★ +18% | Ng (thợ săn rừng) |
| mana | **Piggy Bank / Heo Đất** | Heo sứ hồng, lúc lắc khi có xu rơi vào | Mỗi 7 s rơi xu = mana; **khi bị dùng làm nguyên liệu ghép ("đập heo") trả thêm 5×★ mana** | KT | ghép thường + thưởng đập | SV (heo con) |
| tia | **Longbow / Trường Cung** VK | Cung dài khắc lá, dây cung căng chậm | Nhắm **quái nhiều máu nhất**, +100% vào quái to/trùm; mũi tên **ghim quái đứng 0,3 s** (trùm 0,1 s) | TC | 3★ +ghim 0,4 s · 5★ +130% · 7★ 2 mũi | Ng (cung thủ elf) |
| set | **Jellyfish / Sứa Điện** | Sứa phát sáng lơ lửng, xúc tu buông thõng | Chích quái đầu rồi nhảy sang quái **đứng sát (≤ 48 px)**, tối đa ★ quái — mỗi quái 1 đòn riêng, quái tách xa thì đứt chuỗi | TC | 3★ khoảng nhảy 60 px · 7★ +1 nhảy | SV (sứa) |
| maychem | **Reaper's Scythe / Lưỡi Hái** VK | Lưỡi hái đen cong, đung đưa như con lắc | Đòn thường; **quái thường dưới 25% máu bị chém gọn** (vạch đỏ hiện trên thanh máu); không với quái to/trùm | TC | 3★ 28% · 5★ 32% · 7★ thêm quái to (15%) | Ng (thần chết chibi) |
| phagiap | **Can Opener / Đồ Khui Hộp** | Đồ khui to có hàm cắn, "cạch cạch" | Không gây ST; mỗi 3 s **khui nắp** quái to / nhiều máu nhất: **đòn kế tiếp của BẤT KỲ ụ vào quái đó chắc chắn chí mạng** | HT | 5★ 2 đòn chắc chí mạng · 7★ nhịp 2,4 s | M (robot thợ máy) |
| bua | **War Hammer / Búa Chiến** VK | Búa chiến to cắm đất, nhấc lên giáng xuống | Đập **quái gần nhất trong 1 ô** quanh nó, ST to, **khựng 0,35 s** (trùm 0,1 s) → đặt sát đường | TC/KC | 3★ khựng 0,45 s · 7★ nhịp nhanh 25% | Ng (nữ Viking) |
| nam | **Nunchaku / Côn Nhị Khúc** VK | Côn quay tít thành vòng mờ | Không bắn đạn: đánh **quái gần nhất trong 1 ô** rất nhanh (ST cao hơn chuẩn 30% bù tầm ngắn); không nổ vòng | TC | 5★ đổi mục tiêu tức thì · 7★ +tốc 20% | Ng (võ sư) |
| bomhen | **Horseshoe Magnet / Nam Châm Móng Ngựa** | Nam châm đỏ-bạc, tia từ rung rinh | Mỗi 5 s **hút quái đầu LÙI 26 px** dọc đường (tinh anh 13, trùm 6); không ST | KC | 3★ hút thêm quái thứ 2 · 5★ nhịp 4 s · 7★ quái bị hút nhận +10% ST 2 s | Q (golem sắt) |

## 4. Bộ mới — Xanh (17): "một trò + một điều kiện xếp/ghép"

| id | Tên mới EN / VI | Hình dung | Cơ chế (1 câu) | Vai | Ghép / mốc ★ | CD |
|---|---|---|---|---|---|---|
| nhanmana | **Gacha Machine / Máy Gắp Viên Nang** | Máy gacha tay quay, đèn nhấp nháy | **Ghép 2 → nhả 1 viên nang mana**: trắng ×0,7 / xanh ×1,0 / vàng ×2,0 (60/32/8%, `rngLuat`) — kỳ vọng ≈ cũ, có khoảnh khắc "ra vàng" | KT | ghép | Ng (cô bé arcade) |
| kiembang | **Icicle Spear / Giáo Băng** VK | Giáo băng trong suốt, đầu nhọn toả hơi lạnh | **×5 ST vào quái đang chậm/đóng băng**; bỏ tự lan chậm → phải ghép đội với Ô Mưa / Quả Cầu Tuyết / Người Tuyết / Đồng Hồ Cát | TC | 3★ ×6 · 7★ ×8 | Ng (valkyrie) |
| mimic | **Chameleon / Tắc Kè Hoa** | Tắc kè cuộn đuôi, đổi màu theo ụ bên cạnh | Giữ luật DCDW: **ghép với BẤT KỲ ụ cùng sao**; khi đứng yên **bắt chước kiểu bắn của ụ kề nhiều sao nhất ở 50% sức** (đổi màu theo) | BÀN | luật ghép tự do | SV (tắc kè) |
| chimang | **Lucky Cat / Mèo Thần Tài** | Maneki-neko vẫy tay | Hỗ trợ **4 ô CHÉO**: +chí mạng; mỗi chí mạng của ụ chéo +0,2 mana (trần 1/giây) | HT/KT | 7★ ụ chéo chí mạng chắc chắn đòn đầu mỗi wave | SV (mèo) |
| dichchuyen | **Magic Top Hat / Mũ Ảo Thuật** | Mũ chóp, thỏ thò tai ra | Kéo lên ụ cùng sao: **2 ụ đổi chỗ** (cả ụ đá/băng); ụ vừa "biến ra" **+50% tốc 4 s** | BÀN | — | Ng (ảo thuật gia) |
| radar | **Teapot / Ấm Trà Chiều** | Ấm sứ men lam, vòi nghiêng rót | Hỗ trợ **2 ô TRÊN–DƯỚI (cột)**: +tốc (giá trị ≈ Radar cũ ×1,3 vì chỉ 2 ô); mỗi 8 s "rót trà" thấy rõ | HT | 5★ thêm ô thứ 2 trong cột | Ng (hầu gái trà đạo) |
| drone | **Paper Cranes / Hạc Giấy** | Hạc origami vỗ cánh từ hộp giấy | Giữ luật **kéo xa**: ghép 2 → mỗi ô kéo qua = 1 hạc, mỗi hạc lao vào 1 quái riêng | TC/BÀN | ghép kéo xa | M (tinh linh giấy) |
| tron | **Witch Cauldron / Vạc Phù Thuỷ** | Vạc sủi bọt đổi màu | Ụ tấn công kề **+tốc theo số LOẠI tấn công KHÁC NHAU trong hàng + cột** (màu bọt = số loại) | HT | — | Ng (phù thuỷ) |
| nangluong | **Vending Machine / Máy Bán Hàng** | Máy bán nước có mặt cười, lon lăn ra | **Mỗi 10 mana bạn TIÊU** (triệu hồi, nâng cấp, chỉ huy) → bắn 1 lon vào quái ngẫu nhiên (`rngLuat`), 1,2D — đối lập Thác Mana (giữ mana) | TC/KT | 5★ 1 lon / 8 mana | M (robot bán hàng) |
| laser | **Magnifying Glass / Kính Lúp** (TL) | Kính lúp gọng đồng, gom nắng thành chấm | Giữ chấm nắng trên 1 quái: **nóng dần ×1 → ×4 trong 3 s**; đổi mục tiêu về ×1 ("đốt kiến") | TC | 3★ ×4 trong 2,5 s | Ng (thám tử nhí) |
| lanhgia | **Rain Umbrella / Ô Mưa** | Ô giấy một mắt (kasa-obake) xoay tròn | Tạo **mưa trên dải CỘT** của nó: quái trong dải chậm 25% (trùm 12%); không ST | KC | 3★ 30% · 5★ thêm dải hàng | Q (ô yêu quái) |
| mortar | **Melon Catapult / Máy Bắn Dưa** VK | Máy bắn đá gỗ, cần bật bằng dây thừng | Bắn dưa vào **quái ngẫu nhiên** (1 quái, không nổ vùng); quả thứ 3 vỡ thành **3 hạt bay vào 3 quái khác nhau** | TC | 5★ 4 hạt | Q (goblin kỹ sư) |
| khuech | **Trident / Đinh Ba** VK | Đinh ba bạc cắm trong vỏ sò | Mỗi đòn **3 mũi: mũi giữa 1,0D quái đầu, 2 mũi bên 0,5D quái thứ 2 và 3**; ít quái thì mũi thừa dồn vào quái đầu | TC | 5★ mũi bên 0,6D | Q (ngư nhân) |
| vungdoc | **Poison Toad / Cóc Độc** | Cóc béo lè lưỡi dài | Lưỡi **bắt quái BAY trước** (không có thì quái đầu): kéo lùi 20 px + độc 3 s chỉ trên con đó | TC/KC | 3★ độc 4 s · 7★ bắt 2 con | SV (cóc) |
| loa | **Temple Gong / Chiêng Đồng** | Chiêng đồng treo khung gỗ, rung khi gõ | **Mỗi khi quái to/trùm xuất hiện**, chiêng tự ngân: hồi chiêu chỉ huy −X s (chiêu đã sẵn → giảm giá mana) | HT | (không cần ghép 2 nữa) | Ng (chú tiểu) |
| hutmana | **Vampire Bat / Dơi Hút** | Dơi nhỏ treo ngược, đôi mắt đỏ | Cắn quái đầu; mỗi đòn hồi chút mana (trần mỗi giây như cũ) | TC/KT | — | Q (dơi ma cà rồng) |
| min | **Mole / Chuột Chũi** | Chuột chũi đội mũ thợ mỏ, thò đầu khỏi lỗ | Mỗi 2 s **đào 1 lỗ** phía trước quái đầu; **quái đầu tiên giẫm lỗ** bị gõ (1 mục tiêu); 1/5 lỗ là chũi vàng ×3 (`rngLuat`) | TC | 5★ nhịp 1,6 s | SV (chuột chũi) |

## 5. Bộ mới — Tím (22): "bẻ một luật của game"

| id | Tên mới EN / VI | Hình dung | Cơ chế (1 câu) | Vai | Ghép / mốc ★ | CD |
|---|---|---|---|---|---|---|
| cuongno | **Ninja Kunai / Phi Tiêu Ninja** VK | Bó kunai cắm trên khúc gỗ, khói lượn | Chí mạng gốc 25%; **mỗi chí mạng: kunai dịch chuyển chém ngay quái kế tiếp** (nối tối đa ★ lần, mỗi lần 1 mục tiêu) — thay RAGE | TC | hợp Đồ Khui, Mèo Thần Tài | Ng (ninja) |
| baotuyet | **Snowman / Người Tuyết** | Người tuyết mũi cà rốt, khăn quàng bay | Mỗi 8 s **lăn cầu tuyết khổng lồ** dọc đoạn đường trong dải cột: quái bị lăn qua chậm 40% 3 s, quái nhỏ đứng 0,5 s; không ST | KC | 5★ lăn cả dải hàng | Ng (Yuki-onna) |
| nhanban | **Slime / Slime Phân Bào** | Slime xanh trong, nảy dẻo | **Ghép 2 Slime → thêm 1 slime 1★ (2★ nếu ra ≥ 3★) ở ô ĐỐI XỨNG qua tâm bàn** (bận → ô trống gần nhất theo thứ tự ô) | BÀN | ghép | SV (slime) |
| lienket | **Domino / Quân Domino** | Quân domino đứng có mắt, nghiêng ngả | Domino kề nhau thành 1 hàng; **domino nào giết quái → domino kế đổ: bắn ngay 1 phát** dây chuyền (1 lượt / 1,5 s) | TC | dây chuyền thay đếm mắt xích | M (robot domino) |
| kepha | **Bear Trap / Bẫy Kẹp** VK | Bẫy sắt răng cưa, há-đóng "cạp" | Mỗi 7 s đặt bẫy trên đường: **quái đầu tiên giẫm bị kẹp đứng 1,5 s** (trùm 0,4 s). PVP: ghép 2 → kẹp 1 ụ đối thủ 3 s (ô `rngLuat`) | KC/PVP | Solo có tác dụng | Ng (thợ săn) |
| taylo | **Rubber Duck / Vịt Cao Su** | Vịt vàng chạy lạch bạch trên bàn | Mỗi 12 s **chạy tới ụ bị khống chế GẦN NHẤT trên toàn bàn** (đá/băng/cháy/kẹp) và tắm sạch; không có gì → kêu "quác": ụ kề +ST 4 s | HT | 5★ 2 lượt | SV (vịt) |
| khien | **Tower Shield / Khiên Tháp** VK | Khiên tháp cao có huy hiệu, có hướng | **Có hướng (chạm xoay 90°)**: chặn chiêu trùm / tấn công đối thủ cho **2 ô phía sau khiên**; hồi 18 s | HT/PVP | 5★ 3 ô · 7★ hồi 12 s | Ng (nữ hiệp sĩ) |
| hopbi | **Gift Box / Hộp Quà** (đếm giờ) | Hộp quà nơ đỏ, thỉnh thoảng nhảy lên | Sau 58 s mở thành ụ ngẫu nhiên 1–7★ (`rngLuat`); **có thể mở sớm bằng cách kéo 1 ụ vào hộp** (ụ đó mất, sao ra = sao ụ +1) | BÀN | ghép = mở sớm | Q (rương mimic) |
| nangsao | **Bonsai / Cây Bonsai** (đếm giờ) | Chậu bonsai, lá rụng bay sang ụ bên | Mỗi 2 wave **+1★ cho ụ kề sao THẤP NHẤT** (không vượt sao Bonsai); bỏ buff tốc, bỏ pip | BÀN | — | M (tinh linh kodama) |
| tuthan | **Tombstone / Bia Mộ** | Bia mộ rêu, hồn ma lửng lơ | Quái thường chết gần bia (≤ 1,5 ô) **hoá ma ám quái đầu**: chậm 30% 1,5 s + nhận +15% ST (debuff, không ST) | KC/HT | 5★ ám 2 quái | Q (ma nữ) |
| xaotron | **Kaleidoscope / Kính Vạn Hoa** | Ống vạn hoa xoay, hoa văn đổi màu | Ghép 2: PVP **xáo loại ụ đối thủ**; Solo/Co-op: ụ lẻ thành cặp ghép được (giữ luật cũ, `rngLuat`) | BÀN/PVP | ghép | SV (cáo hồ ly nhỏ) |
| epxung | **Espresso / Tách Cà Phê Đặc** | Tách espresso bốc khói, tim latte | Kéo lên ụ tấn công cùng sao: **+90% tốc vĩnh viễn, 1 lần / ụ** (ụ có biểu tượng tách nhỏ); bỏ cộng dồn | BÀN | — | Ng (barista) |
| no5 | **Chakram / Vòng Chakram** VK | Vòng thép lưỡi tròn quay tít | Ném tới **quái XA nhất** rồi bay về, **trúng quái GẦN nhất trên đường về** (2 đòn, 2 mục tiêu); thay đếm 5 phát + nổ | TC | 5★ quay về giết được → ném lại ngay | Ng (công chúa chiến binh) |
| bao | **Lightning Rod / Cột Thu Lôi** | Cột sắt nhọn, mây đen nhỏ trên đỉnh | Không bắn; **mỗi khi ụ của bạn chí mạng → sét từ cột đánh đúng quái đó** (0,6× ST cột, 0,25 s/lần) | TC | hợp Ninja, Đồ Khui, Mèo | Q (quỷ sấm oni) |
| anhsang | **Paper Lantern / Đèn Lồng** | Đèn lồng đỏ bay lên, rơi nhẹ | **Đầu mỗi wave** thả 1 đèn rơi vào ô trống → ụ 1★ cùng loại với loại **nhiều nhất trên bàn** (hoà → `rngLuat`) — xếp để chọn loại | BÀN | 5★ đèn ra 2★ | Ng (cô gái lễ hội) |
| nayda | **Pinball Flipper / Cần Gạt Pinball** | Cần gạt pinball + bi thép, đèn chớp | Bi nảy tối đa ★ lần, **mỗi lần phải sang quái KHÁC LOẠI** (không còn → bi về); ST không tăng dần | TC | mạnh với wave hỗn hợp | M (robot arcade) |
| combo | **Matryoshka / Búp Bê Nga** (TL) | Búp bê gỗ lồng nhau, mở ra một lớp | **Ghép 2 Matryoshka → thêm 1 LỚP**: mọi Matryoshka +ST vĩnh viễn (nhìn thấy số lớp) | TC | ghép = cộng lớp | Ng (cô gái Nga) |
| khoathoigian | **Hourglass / Đồng Hồ Cát** | Đồng hồ cát khung đồng, tự lật ngược | Mỗi 9 s lật: **3 s "cát chậm"** — quái trong dải hàng chậm 45%, ụ tấn công cùng hàng +30% tốc | KC/HT | xem mẫu §6.3 | Ng (phù thuỷ thời gian) |
| docton | **Lone Gunslinger / Cao Bồi Cô Độc** VK | Khẩu súng lục cổ trên bao da, mũ cao bồi | Giữ luật **đứng một mình (4 ô trống): ×2 tốc + thêm chí mạng** | TC | — | Ng (cao bồi) |
| thaukinh | **Echo Mirror / Gương Vọng** | Gương đứng khung bạc, phản chiếu lung linh | Ụ tấn công **kề TRÁI–PHẢI**: mỗi đòn có bản phản chiếu 30% bắn vào **quái thứ hai** (mục tiêu khác) | HT | 5★ 40% | M (tinh linh gương) |
| nhieusong | **Music Box / Hộp Nhạc** | Hộp nhạc có vũ công xoay | Ghép 2: PVP ụ đối thủ "nhảy múa" chậm 40% 4 s; Co-op: lần triệu hồi kế của đồng đội miễn phí; Solo: quái lắc lư chậm 20% 3 s | PVP/KC | ghép | Ng (ballerina) |
| santhuong | **Pirate Parrot / Vẹt Hải Tặc** | Vẹt đội mũ hải tặc, đậu trên rương | Đánh dấu quái to nhất; **quái bị dấu chết → +mana** | KT | 5★ 2 dấu | SV (vẹt) |

### Thống kê bộ mới
- **Vũ khí cận chiến/cổ điển: 15/53 (28%)** — Liên Nỏ, Katana, Ống Thổi, Trường Cung, Lưỡi Hái, Búa Chiến, Côn Nhị Khúc · Giáo Băng, Máy Bắn Dưa, Đinh Ba · Kunai, Bẫy Kẹp, Khiên Tháp, Chakram, Cao Bồi.
- **Tích lực thật: 2/53 (4%)** (Kính Lúp, Matryoshka) + 2 đếm giờ (Hộp Quà, Bonsai) → **4/53 = 7,5%** (trước 25%).
- **Sát thương lan: 0** (nam, bomhen, mortar, vungdoc, no5, min đã bỏ nổ vùng).
- **Hỗ trợ khuôn "4 ô kề +%": 0** — thay bằng chéo (Mèo), cột (Ấm Trà), trái-phải (Gương), hàng (Đồng Hồ Cát), hướng (Khiên), loại trong hàng+cột (Vạc).
- **"Ghép 2 → X": 6** (Gacha, Hạc Giấy kéo xa, Slime đối xứng, Kính Vạn Hoa, Hộp Nhạc, Matryoshka) — mỗi cái có biến tấu riêng; Chiêng, Bẫy Kẹp chuyển sang bị động.
- **Chân dung:** Ng 26 (49%) · SV 11 (21%) · Q 8 (15%) · M 8 (15%).

### Bộ phối hợp gợi ý (DCDW / Random Dice-style)
- **Băng giá:** Ô Mưa / Quả Cầu Tuyết / Người Tuyết / Đồng Hồ Cát làm chậm → **Giáo Băng ×5**.
- **Chí mạng:** Đồ Khui (chí mạng chắc) + Mèo Thần Tài (chéo) → **Phi Tiêu Ninja** nối + **Cột Thu Lôi** giáng sét.
- **Mana:** Heo Đất + Gacha + Mèo Thần Tài sinh mana → tiêu nhiều → **Máy Bán Hàng** bắn lon.
- **Hình học:** Katana đặt góc (cắt 2 đoạn đường) + Đồng Hồ Cát cùng hàng; Cao Bồi đứng lẻ; Gương Vọng giữa 2 ụ tấn công.
- **Khống chế đường:** Nam Châm hút lùi + Bẫy Kẹp + Cóc → quái dồn lâu trong dải Katana / Ô Mưa.

---

## 6. 2–3 ụ MẪU đề xuất làm thử trước

Chọn 3 ụ đại diện 3 nhóm (vũ khí / sinh vật / đồ vật bẻ luật), đều **đơn giản để code**, **không cần đổi luật lưu**, test được riêng. Ngân sách DPS Trắng tham chiếu hiện tại ở 1★: Súng Lục 34,5 × 0,6/s ≈ 20,7 · Liên Thanh 4,5 × 4 = 18 · Phun Loạn 3,43 × 5 ≈ 17 · Dice Gun ≈ 22.

### 6.1 Iaido Katana / Kiếm Rút Nhanh (`sungluc`, Trắng, TC, vũ khí)
- **Hình:** thanh katana nằm trong vỏ trên giá gỗ; quái vào dải → kiếm **rung + rút nửa lưỡi**; chém → **vệt trắng cắt ngang dải** + kiếm tra vỏ "cách". Chân dung: nữ ronin tóc buộc cao, áo haori sờn.
- **Luật:**
  - "Dải chém" = dải **hàng** (|E.y − tâm hàng| ≤ ½ ô) **hoặc cột** (|E.x − tâm cột| ≤ ½ ô) của ô Katana, kéo dài ra đường (dùng toạ độ quái; tất định).
  - Có quái trong dải: **chém quái đầu (theo tiến độ đường) trong dải**, `dmg 40`, trúng tức thì, nhịp **1,8 s** → 22,2 DPS (≈ Súng Lục + 7%, bù lúc trống dải).
  - Không có quái trong dải: **chọc** quái đầu trong tầm, 45% (18), cùng nhịp → không bao giờ đứng im vô dụng.
  - Chí mạng gốc 10% (như Súng Lục).
  - Mốc: **3★ Hai Đường** dải rộng 1,5 ô · **5★ Nhất Thiểm** nhát chém trúng **quái đầu + quái thứ 2 trong dải** (2 mục tiêu riêng, mỗi con 100%, không lan) · **7★ Vô Ảnh** nhịp 1,4 s.
- **Cấp thẻ:** như ụ tấn công thường (+% ST); không cần mục `KY_NANG_CAP`.
- **Test:** quái trong dải hàng → ST 40×hs; ngoài dải → 18×hs; 5★ 2 mục tiêu khác nhau; online 2 máy cùng kết quả.

### 6.2 Bee Hive / Tổ Ong (`phun`, Trắng, TC, sinh vật nhỏ)
- **Hình:** tổ ong treo cành; ong mũm mĩm bay vòng cung ra, đốt (nháy chữ thập vàng), bay về chui vào tổ. Số ong đang ở nhà = chấm vàng trên tổ. Chân dung: bé ong nghệ đeo kính bảo hộ (SV).
- **Luật:**
  - Số ong = **2 + ⌊★/2⌋** (1★ 2 · 3★ 3 · 5★ 4 · 7★ 5).
  - Ong ở nhà → chọn **quái ngẫu nhiên trong tầm** bằng `rngLuat(B, <muối mới>, T.o)`, ưu tiên quái chưa có ong khác bay tới; bay **260 px/s**, đốt **`dmg 9`** (1 mục tiêu), bay về, nghỉ **0,25 s** rồi đi tiếp. Quái chết giữa đường → ong quay về (không chuyển ST).
  - DPS tự nhiên theo khoảng cách: cách 60 px ≈ 12,7/ong, cách 120 px ≈ 7,7/ong → **2 ong 1★: 15–25 DPS** — đặt sát đường thì mạnh, đặt giữa bàn yếu (quyết định xếp rõ ràng).
  - Mốc: **3★ Ong Đất** ong đốt quái BAY ×1,5 · **5★ Mật Ngọt** quái bị đốt chậm 10% 1 s (không cộng dồn, lấy nguồn mạnh nhất) · **7★ Ong Chúa** tốc bay 340 px/s.
  - Ong là **đơn vị hình ảnh + hẹn giờ trong `T`**, không phải đạn tự do: lưu `T.ong[i] = {pha, t, muc}` để ảnh chụp online khôi phục được.
- **Test:** đếm ong theo ★; RNG tất định (2 lần chạy cùng hạt → cùng chuỗi mục tiêu); DPS ở 2 khoảng cách nằm trong 15–25.

### 6.3 Hourglass / Đồng Hồ Cát (`khoathoigian`, Tím, KC/HT, đồ vật bẻ luật)
- **Hình:** đồng hồ cát khung đồng; mỗi 9 s **tự lật 180°** (xoay 0,4 s), cát chảy ngược phát sáng xanh ngọc; trong 3 s "cát chậm" một **dải sương xanh ngọc** phủ hàng của nó, ụ trong hàng có kim đồng hồ nhỏ quay nhanh trên đầu. Chân dung: phù thuỷ thời gian tóc bạc, mắt đồng hồ (Ng).
- **Luật (thay hẳn "khoá + tích ST" — bỏ 1 ụ tích lực):**
  - Nhịp lật **9 s** cố định theo đồng hồ trận (`T.t`), không ngẫu nhiên.
  - **3 s cát chậm:** quái trong **dải hàng** của đồng hồ (kéo dài ra đường, như Katana) **chậm 45%** (tinh anh 30%, trùm 20%); chậm **không cộng dồn**, lấy nguồn mạnh nhất (luật chung). Đồng thời **ụ tấn công cùng hàng +30% tốc**.
  - Không gây ST (tránh trùng Chrono Throne Đỏ).
  - Mốc: **3★** nhịp 8 s · **5★ Cát Ngược** dải **cột** cũng tính (cả quái lẫn ụ cùng cột) · **7★ Ngưng Đọng** 0,5 s đầu mỗi lần lật quái thường trong dải **đứng yên**.
  - Cấp thẻ: `KY_NANG_CAP.khoathoigian = { ten: 'Slow', base: 45, buoc: 1.35, max: 55.8, dv: '%', pu: 1.5 }` (Khống chế +3%/cấp như bảng ChatGPT đã chốt).
  - Hợp: **Giáo Băng** cùng hàng (quái chậm → ×5) và **Katana** (quái chậm ở lâu trong dải chém).
- **Test:** trong 3 s chậm đúng %, ngoài 3 s không; ụ cùng hàng +30% tốc, khác hàng không; 5★ cột; trùm 20%.

---

## 7. Việc khi triển khai (bước sau, KHÔNG làm ở đợt này)

- **Giữ khoá:** `id`, `bac`, `KY_NANG_CAP` key (đổi `ten` nhãn), bộ sưu tập/cấp thẻ/bộ bài (`bobai.js` deck theo id) không đổi. Online: đổi luật → tăng phiên bản giao thức để máy cũ không ghép trận với máy mới.
- **Chỗ phải cập nhật cùng lúc** mỗi ụ: `assets/roster.json` + `meta.js ROSTER_EMBED` (tên, kỹ năng EN/VI) · `text.js` / `ngonngu-vi.js` · `SKILLS[id]` trong `skills*.js` · `phattrien.js` (`HO`, mô tả, mốc ★) · `skilldemo.js` · `buff.js SUP_LOAI` (ụ hỗ trợ đổi kiểu) · `anim-meta.js` (nhóm hoạt ảnh) · `data.js` (`SAO_CU`, `KY_NANG_CAP`) · test `QA-KYNANG-*`.
- **Hình:** ụ + chân dung + **bản pixel** theo quy chuẩn pixel; giữ đường vẽ dự phòng (ụ chưa có hình mới vẽ hình cũ). Prompt ảnh nên viết theo cột "Hình dung" + "CD" ở trên.
- **Tất định:** mỗi ụ dùng ngẫu nhiên ghi muối `rngLuat` mới vào bảng muối (không trùng muối 37 của Dice Gun…).
- **Thứ tự gợi ý:** 3 ụ mẫu §6 → người dùng chơi thử duyệt "cảm giác" → làm theo bậc Trắng → Xanh → Tím, mỗi đợt 4–6 ụ; đo DPS bằng `tools/thap-sim-tier.js` để giữ hệ số bậc.
