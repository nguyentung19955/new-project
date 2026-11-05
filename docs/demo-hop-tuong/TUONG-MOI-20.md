# TURRET MERGE — 20 ỤNG/TƯỚNG MỚI (7 Tím · 8 Vàng · 5 Đỏ)

Thiết kế ngày 05/11/2026. Chỉ là tài liệu thiết kế, chưa sửa code `thap/`.

**Tiến độ (05/11/2026):** ĐÃ LÀM đợt 1 (8 ụ, `thap/js/skills3.js`) + đợt 2 (9 ụ, `thap/js/skills4.js`); giao diện `thap/js/tuongmoi-ui.js`; ảnh `tools/thap-tuong-moi.py`; cân bằng `node tools/thap-sim-moi.js dps|song|che`. Chỉnh số so với bản thiết kế: Combo Core dmg 15, Hydra dmg 15 tốc 1.2, Nine-Tail dmg 16 tốc 1.2, Nemesis dmg 26 tốc 0.8, Signal Jammer dmg 11, Bounty Beacon dmg 10, Resonance Grid × hệ số bậc Vàng 2.1, Marionette cú húc tối đa 6 quái và ≤ dmg×4. Đợt 3 (05/11, `thap/js/skills5.js`): Hive Queen, Leviathan, Genesis Core, Wyrm Engine — đã làm (chỉnh số theo sim: Hive Queen dmg 16 tốc 1, drone 60%/0.5 s, trần 12 drone/bàn; Leviathan dmg 24, +4%/cộng dồn, bọt lan 50%; Wyrm Engine dmg 10/nhịp). Grow-up đổi cách đánh từng dạng cho 15 ụ: `thap/js/growfx.js` (xem `GROWFX-WAKEUP-LAM.md`).
Tinh thần: các "Child" của DCDW / Destiny Child được dựng lại thành **ụ súng mini sci-fi nhìn từ trên xuống** (bệ tròn + đầu xoay), mỗi ụ có **phi công** riêng trên thẻ.
Không trùng 64 ụ đang có (`thap-art/roster.json`). Tên hiển thị tiếng Anh (cho `thap/js/text.js`), id tiếng Việt không dấu như quy ước cũ.

Quy ước số liệu (khớp `game.js`):
- Sát thương = `dmg gốc × hệ số bậc (Tím 1.65 · Vàng 2.1 · Đỏ 2.7) × (1 + 0.85×(sao−1)) × cấp thẻ`.
- Bàn 5×3, tối đa 7★, mỗi lần triệu hồi +10 mana, giết quái thường +1 mana (to +2).
- "★1→★7: a / b / c / d / e / f / g" = giá trị ở từng mức sao.
- Vai: **TC** = Tấn công, **HT** = Hỗ trợ (ô kề trên-dưới-trái-phải), **ĐB** = Đặc biệt / Khống chế.

---

## 0. Nghiên cứu: điều gì làm ụ cao cấp "đã" trong game thủ thành ghép

| Mô-típ | Ví dụ thật | Rút ra cho mình |
|---|---|---|
| **Vị trí trên bàn là kỹ năng** | Rush Royale: Monk (giao điểm hàng/cột), Cultist (hình chữ thập), Blade Dancer (không được chạm ụ khác), Hex (4 ô kề); DCDW Removal Tee (bingo), Won (nối liền) | Thêm ụ thích **đứng một mình** (Lone Ace) và ụ ăn theo **ô kề** (Focus Lens) — bàn 5×3 nhỏ nên mỗi ô đều phải tính |
| **Bản thân việc GHÉP là phần thưởng** | Rush Royale Witch/Genie/Robot/Demon Hunter; DCDW Thisbe, Ivory, Mafdet, Giltine | Combo Core (mỗi lần ghép +sức mạnh vĩnh viễn), Pandora Vault (ghép = mở hộp), Signal Jammer (ghép = phá đối thủ) |
| **Thao túng sao/cấp của ụ khác** | Rush Royale Dryad, Summoner, Scrapper, Harlequin; DCDW Brownie, Aurora King | Scrap Forge (ăn ụ yếu nuôi ụ chính), Genesis Core (đỏ: tự nâng sao ụ thấp nhất) |
| **Tích luỹ vô hạn / càng lâu càng mạnh** | Rush Royale Treant (ăn ụ thành "lá"), Demon Hunter (40 cộng dồn đánh toàn sân), Spirit Master (theo mana tiêu) | Nine-Tail (đủ 9 đuôi xả 9 quả cầu lửa), Leviathan (nuốt quái lấy cộng dồn) |
| **Đổi dạng / thức tỉnh** | DCDW Werewolf thức tỉnh, Mafdet thức tỉnh; Random Dice Solar/Lunar, Typhoon, Growth (loại "Transform") | Eclipse (Ngày ⇄ Đêm), Hydra (7★ các nòng hợp thành 1), 3 giai đoạn lớn lên cho mọi ụ Vàng/Đỏ |
| **Diệt trùm theo % máu** | Lucky Defense Lancelot (đốt % máu tối đa, cột lửa ~22% máu trùm), Vayne (đòn 3000%–5000%) | Nemesis (xử tử quái dưới ngưỡng máu, % máu trùm) |
| **PVP phá / CO-OP giúp** (cùng 1 kỹ năng 2 mặt) | DCDW Myrina, Giltine, Neban; Rush Royale Shaman (PvP hạ sao, Co-op nâng sao), Witch (nguyền ép ghép xấu) | Signal Jammer, Mirror Gate (phản đòn khống chế), Marionette |
| **Cổ đại/Thần thoại có kỹ năng chủ động** | DCDW Cổ đại (tối đa 1/deck, có nút kỹ năng như Ma vương); Lucky Defense Myth/Immortal có "ult" mở ở cấp 6/12 | 5 ụ Đỏ đều có **nút kỹ năng chủ động** + nội tại; giới hạn 1 Đỏ/deck |
| **Leo thang hình ảnh** | Bậc cao = viền vàng, sừng/cánh/hào quang (đúng như bộ đầu ụ Vàng/Đỏ hiện tại) | Ụ Vàng: viền vàng chạm khắc + 1 chi tiết "biểu tượng"; Đỏ: đen-đỏ + vàng, sừng/cánh/lõi phát sáng, đổi hình theo 3 giai đoạn |

Ghi chú nguồn: trang namu.wiki và fandom (DCDW, Random Dice) **bị chặn** trong lần chạy này nên phần DCDW dựa vào bản tóm tắt đã có trong repo (`DCDW-WIKI.md`, `DCDW-WIKI-TOM-TAT.md`, đọc 04/11). Rush Royale, Lucky Defense, Random Dice lấy từ các trang ở mục **Nguồn** cuối file. Cơ chế Random Dice cụ thể (Solar, Typhoon, Growth…) chỉ dùng ở mức "loại kỹ năng" theo bảng xếp hạng Gamertweak (Transform/Merge/Buff…), không chép số.

Ý kiến ChatGPT: đã đọc `thap-art/TU-VAN-TUONG-MOI.txt` (20 ụ khác: Phase Shifter, Marksmith, Resonance Grid, Nova Engine, Fate Engine…). Đã gộp: **luật cân bằng chung** (mục 5.1), sửa Pandora / Signal Jammer / Nemesis cho khớp giới hạn PVP, thêm **Resonance Grid** vào 8 ụ làm trước, 6 ụ dự bị (mục 5.5), và các ý sửa ụ cũ (mục 5.2).

---

## 1. Danh sách nhanh

| # | id | Tên | Bậc | Vai | Kỹ năng 1 dòng |
|---|---|---|---|---|---|
| P1 | `khoathoigian` | **Chrono Lock** | Tím | ĐB | Đóng băng thời gian quái đầu; hết giờ nổ toàn bộ sát thương đã dồn |
| P2 | `combo` | **Combo Core** | Tím | TC | Mỗi lần ghép bất kỳ Combo Core nào → mọi Combo Core +sát thương vĩnh viễn |
| P3 | `nayda` | **Ricochet** | Tím | TC | Đạn nảy sang N quái, mỗi lần nảy mạnh hơn |
| P4 | `docton` | **Lone Ace** | Tím | TC | Không có ụ nào kề bên → bắn ×2 nhanh, +chí mạng |
| P5 | `thaukinh` | **Focus Lens** | Tím | HT | Ụ kề: +sát thương chí mạng, chí mạng xuyên 1 quái |
| P6 | `nhieusong` | **Signal Jammer** | Tím | ĐB | Khi GHÉP: PVP khoá ụ đối thủ + tăng giá triệu hồi; Co-op: đồng đội triệu hồi miễn phí |
| P7 | `santhuong` | **Bounty Beacon** | Tím | ĐB | Gắn "truy nã" lên quái; giết quái truy nã được thêm mana |
| G1 | `nhatthuc` | **Eclipse** | Vàng | TC | Đổi Ngày (1 tia đốt cực mạnh) ⇄ Đêm (sóng làm chậm diện rộng) mỗi 8 s |
| G2 | `hydra` | **Hydra** | Vàng | TC | Số nòng = số sao, mỗi nòng bắn 1 quái khác; 7★ hợp thành tia khổng lồ |
| G3 | `nemesis` | **Nemesis** | Vàng | TC | Xử tử quái dưới ngưỡng máu; vào trùm gây % máu tối đa |
| G4 | `pandora` | **Pandora Vault** | Vàng | ĐB | Khi GHÉP: mở hộp — 1 trong 6 phép lớn ngẫu nhiên |
| G5 | `marionette` | **Marionette** | Vàng | ĐB | Chiếm điều khiển quái thường, bắt nó đi ngược đường rồi tự nổ |
| G6 | `loren` | **Scrap Forge** | Vàng | ĐB/TC | Kéo ụ 1–3★ bất kỳ vào để "ăn": +sát thương vĩnh viễn, lớn lên 3 giai đoạn |
| G7 | `guongcong` | **Mirror Gate** | Vàng | ĐB | PVP: phản lại đòn khống chế của đối thủ; Co-op: sao chép hiệu ứng ghép của đồng đội |
| G8 | `cuuvi` | **Nine-Tail** | Vàng | TC | Mỗi lần giết mọc 1 đuôi lửa; đủ 9 đuôi xả 9 cầu lửa tự dẫn |
| R1 | `ngaithoigian` | **Chrono Throne** | Đỏ | ĐB | Nội tại: quái chậm dần theo thời gian; CHỦ ĐỘNG "Rewind": đẩy lùi mọi quái về sau |
| R2 | `chuato` | **Hive Queen** | Đỏ | TC | Nuôi bầy drone mini tự săn quái; CHỦ ĐỘNG: cả bầy lao vào tự sát |
| R3 | `leviathan` | **Leviathan** | Đỏ | TC | Nuốt chửng quái thường lấy cộng dồn; CHỦ ĐỘNG: tia thở quét hết đường |
| R4 | `khoisinh` | **Genesis Core** | Đỏ | ĐB | Định kỳ +1★ ụ yếu nhất; CHỦ ĐỘNG: gọi 3 ụ ở mức sao trung bình |
| R5 | `ronglua` | **Wyrm Engine** | Đỏ | TC | Phun lửa hình nón quét bàn, đốt cháy; CHỦ ĐỘNG: rồng bổ nhào dọc đường |

---

## 2. Bậc TÍM (Epic) — 7 ụ

### P1 · Chrono Lock — `khoathoigian` — Tím · ĐB (khống chế)
- **Cảm hứng:** DCDW Freezer/Mayauel nhưng "giữ" thay vì làm chậm; mô-típ Time của các game xúc xắc; Child kiểu nữ thần thời gian.
- **Kỹ năng:** mỗi `chu kỳ` giây khoá quái ĐẦU (không phải trùm) vào **ô thời gian**: đứng yên `t` giây. Mọi sát thương nhận trong lúc khoá được **dồn lại** và khi mở khoá nổ thêm `x%` lượng dồn vào quái đó + quái trong 40 px. Trùm: không đứng yên, chỉ chậm 50% trong `t/2` giây và nổ dồn 50% số trên.
  - dmg gốc 10, tốc 0.8 (vẫn bắn đạn thường).
  - Chu kỳ ★1→★7: 9 / 8.5 / 8 / 7.5 / 7 / 6.5 / 6 s
  - Thời gian khoá: 1.2 / 1.4 / 1.6 / 1.8 / 2.0 / 2.2 / 2.5 s
  - Nổ dồn: 30 / 35 / 40 / 45 / 50 / 60 / 75 %
- **Ghép / PVP / Co-op:** khi GHÉP lập tức khoá 1 quái. Co-op: có thể khoá quái trên đường đồng đội nếu quái đầu nằm ở vùng chung. PVP: không ảnh hưởng đối thủ.
- **Lớn lên:** không (giữ 1 hình, sao dùng lớp phủ chung).
- **Phối hợp:** Ice Blade/Kiếm Băng (quái bị khoá tính là "đang chậm" → +400%), Overlord, Time Bomb, Laser (tia dồn lâu). **Khắc chế:** quái bay nhanh bầy đàn; Frost Flyer miễn chậm nhưng KHÔNG miễn khoá (tạo bản sắc).
- **Đầu ụ:** đồng hồ cát nằm ngang trong vòng bánh răng, nòng ngắn hình kim đồng hồ chỉ sang phải; điểm nhấn **xanh ngọc #45e0c8**.
- **Phi công:** cô gái tóc bạc cột thấp, kính một mắt có mặt đồng hồ, áo khoác dài xám-ngọc, nụ cười điềm tĩnh.
- **VFX/SFX:** khối kính lục giác trong suốt bao quái + số giây đếm ngược; tiếng "tích-tắc" rồi "kính vỡ" khi nổ.
- **Cân bằng:** tối đa 1 quái bị khoá cùng lúc cho mỗi ụ; nhiều Chrono Lock không khoá cùng 1 quái (chọn quái đầu tiếp theo).

### P2 · Combo Core — `combo` — Tím · TC
- **Cảm hứng:** Random Dice "Combo" (sức mạnh theo số lần ghép), Rush Royale Demon Hunter (đếm hạng ghép).
- **Kỹ năng:** biến đếm toàn trận `COMBO` = số lần bạn GHÉP **hai Combo Core** với nhau. Mọi Combo Core: sát thương +`c%` × COMBO (không giới hạn, nhưng giảm dần sau 20).
  - dmg gốc 12, tốc 1.0, nhắm quái đầu.
  - `c` mỗi combo ★1→★7 (theo sao của chính ụ bắn): 6 / 7 / 8 / 9 / 10 / 11 / 12 %
  - Sau COMBO 20: mỗi combo chỉ còn 1/2 hiệu lực.
- **Ghép:** mỗi lần ghép hiện chữ to "COMBO ×N". PVP: hiện COMBO cho đối thủ thấy (áp lực). Co-op: COMBO của 2 người cộng chung nếu cả hai mang Combo Core (×0.5 phần của bạn).
- **Lớn lên:** 3 giai đoạn theo COMBO: 0–9 (1 vòng số), 10–19 (2 vòng số quay), 20+ (lõi nóng đỏ cam).
- **Phối hợp:** Cloner/Twin Maker/Lighthouse (thêm ụ để ghép), Mimic (ghép Mimic + Combo Core **có** tính combo). **Khắc chế:** Mad Crown/Scrambler đổi loại ụ làm mất nguyên liệu.
- **Đầu ụ:** đĩa có **bộ đếm số cơ khí (2 chữ số)** ở giữa, nòng đôi ngắn bên phải; điểm nhấn **cam #ff8a2a**.
- **Phi công:** cậu bé game thủ tinh nghịch, tai nghe to, băng đô số "x99", áo hoodie cam.
- **VFX/SFX:** số combo bật lên mỗi lần ghép; âm "ting" tăng cao độ dần theo combo.
- **Cân bằng:** yếu đầu trận, mạnh cuối trận — đối trọng với ụ bùng sớm. Nếu quá mạnh: giảm `c` còn 5–10%.

### P3 · Ricochet — `nayda` — Tím · TC
- **Cảm hứng:** đạn nảy kiểu "bounce"; Child cung thủ của DCDW. Khác Tesla: đạn bay thật, mỗi lần nảy **mạnh thêm** chứ không yếu đi.
- **Kỹ năng:** viên đạn đĩa nảy từ quái này sang quái gần nhất (≤ 90 px), không trúng lại quái cũ. Mỗi lần nảy +`b%` sát thương.
  - dmg gốc 11, tốc 1.1.
  - Số lần nảy ★1→★7: 1 / 2 / 3 / 4 / 5 / 6 / 7
  - +sát thương mỗi nảy: 15 / 15 / 18 / 18 / 20 / 22 / 25 %
- **Ghép / PVP / Co-op:** không hiệu ứng ghép; co-op được nảy sang quái trên đường đồng đội (vùng chung).
- **Phối hợp:** Breaker (suy yếu), Crit Antenna, Focus Lens (chí mạng xuyên = nảy thêm). **Khắc chế:** trùm đi một mình (không có chỗ nảy) → kém trên trùm.
- **Đầu ụ:** đĩa phóng hình chữ C mở về bên phải, lưỡi đĩa răng cưa kẹp giữa; điểm nhấn **vàng chanh #d6ff3a**.
- **Phi công:** cô gái tóc ngắn đuôi vểnh, kính bảo hộ vàng chanh, miếng băng dán má, đang tung đồng xu.
- **VFX/SFX:** vệt sáng gấp khúc, mỗi lần nảy to hơn; tiếng "pinggg" cao dần.

### P4 · Lone Ace — `docton` — Tím · TC
- **Cảm hứng:** Rush Royale Blade Dancer (không chạm ụ khác thì đánh rất nhanh); DCDW Child kiếm khách cô độc.
- **Kỹ năng:** nếu **4 ô kề (trên-dưới-trái-phải) đều trống** → chế độ ACE: tốc bắn ×2 và +`a%` chí mạng. Có 1 ụ kề → bình thường. ≥3 ụ kề → −30% tốc bắn.
  - dmg gốc 14, tốc 1.0, nhắm quái đầu.
  - +chí mạng khi ACE ★1→★7: 10 / 12 / 14 / 16 / 18 / 20 / 25 %
  - 7★ ACE: đạn xuyên 1 quái.
- **Ghép:** ghép xong hiển thị viền 4 ô kề (xanh nếu trống) để người chơi biết đặt đâu.
- **Phối hợp:** Teleporter (đưa về góc trống), Mech Wolf (cũng thích góc — chọn 1). **Khắc chế:** chính mình — bàn đầy cuối trận; Mystery Box / Cloner nhét ụ vào ô trống.
- **Đầu ụ:** đầu thon dài một nòng mảnh như kiếm, 1 vây đơn phía sau; điểm nhấn **đỏ son #ff3a4a** (đơn sắc, tối giản).
- **Phi công:** nữ kiếm khách tóc đen buộc cao, mắt lạnh, khăn choàng đỏ, vết sẹo nhỏ trên mày.
- **VFX/SFX:** khi ACE: viền đỏ mảnh quanh bệ + chữ "ACE"; tiếng rút kiếm.
- **Cân bằng:** tạo thế khó "giữ ô trống" trên bàn 15 ô — đúng kiểu "vị trí là kỹ năng".

### P5 · Focus Lens — `thaukinh` — Tím · HT
- **Cảm hứng:** DCDW Siren (chí mạng) nâng cấp; các xúc xắc tăng "sát thương chí mạng" của Random Dice.
- **Kỹ năng (hỗ trợ, không bắn):** 4 ô kề: +`k%` sát thương chí mạng; chí mạng của ụ kề **xuyên** thêm 1 quái phía sau (60% sát thương).
  - +sát thương chí mạng ★1→★7: 20 / 30 / 40 / 50 / 60 / 75 / 100 %
  - 5★+: xuyên 2 quái.
- **Ghép:** không. **PVP/Co-op:** không.
- **Phối hợp:** Crit Antenna (tỉ lệ) + Focus Lens (sát thương) = cặp chí mạng; Berserker, Mech Wolf (luôn chí mạng), Dice Gun. **Khắc chế:** ụ không chí mạng.
- **Đầu ụ:** không nòng — 3 thấu kính tròn xếp tam giác trong khung tròn, lăng kính sáng ở tâm; điểm nhấn **xanh lam băng #6fd0ff**.
- **Phi công:** nam kỹ thuật viên quang học, kính lúp gắn mắt phải, tóc bù xù, áo blouse xám.
- **VFX/SFX:** tia mảnh nối tới ụ kề khi ụ đó chí mạng; tiếng "ting" thuỷ tinh.

### P6 · Signal Jammer — `nhieusong` — Tím · ĐB (khống chế khi ghép)
- **Cảm hứng:** DCDW loại Khống chế (Myrina, Neban), Cain (khoá kỹ năng đối thủ); Rush Royale Witch.
- **Kỹ năng khi GHÉP:**
  - **PVP:** báo trước 0.65 s rồi gây NHIỄU lên `n` ụ ngẫu nhiên của đối thủ: −40% tốc bắn trong `t` s (không khoá hẳn — theo luật PVP mục 5.1) **và** lần triệu hồi kế của đối thủ +`m` mana.
  - **Co-op:** lần triệu hồi kế của đồng đội **miễn phí**, + đồng đội +10% tốc bắn `t` s.
  - **Solo:** quái trên sân chậm 20% trong `t` s.
  - n ★1→★7: 1 / 1 / 2 / 2 / 3 / 3 / 4 ; t: 3 / 3.5 / 4 / 4.5 / 5 / 5.5 / 6 s ; m: 5 / 5 / 10 / 10 / 15 / 15 / 20
  - Bắn thường: dmg gốc 8, tốc 0.9.
- **Phối hợp:** Twin Maker/Cloner (thêm Jammer để ghép). **Khắc chế:** Cleanser, Shield Gen, Holy Halo, Mirror Gate (phản lại).
- **Đầu ụ:** đĩa vệ tinh mini hướng phải + 2 ăng-ten chéo, sọc nhiễu trên đĩa; điểm nhấn **tím-lam #8a7bff** (không dùng hồng/magenta).
- **Phi công:** hacker tóc tím-xanh, mặt nạ che miệng có đèn LED hình sóng, mắt cười ranh mãnh.
- **VFX/SFX:** sóng méo màn hình trên ụ bị nhiễu, chữ "JAMMED"; tiếng rè radio.
- **Cân bằng PVP:** cùng 1 ụ đối thủ không bị nhiễu lại trong 8 s (miễn nhiễm sau đòn); không chọn ụ đang dính hiệu ứng xấu khác.

### P7 · Bounty Beacon — `santhuong` — Tím · ĐB (kinh tế)
- **Cảm hứng:** DCDW Syrinx/Thisbe (mana) nhưng có tương tác; "mark" kiểu săn tiền thưởng.
- **Kỹ năng:** định kỳ gắn TRUY NÃ lên `n` quái (ưu tiên quái to). Quái truy nã chết (do bất kỳ ụ nào) → +`g` mana thêm. Quái truy nã nhận +10% sát thương.
  - Chu kỳ 5 s; n ★1→★7: 1 / 1 / 2 / 2 / 2 / 3 / 3 ; g: 2 / 3 / 3 / 4 / 5 / 5 / 6 (trùm: ×5)
  - Bắn thường: dmg gốc 6.
- **PVP:** quái truy nã bạn giết khi bị gửi sang đối thủ vẫn mang dấu → nếu đối thủ để lọt, bạn +5 mana. **Co-op:** mana thưởng chia đôi cho cả hai.
- **Phối hợp:** Energy Cannon (mana cao = mạnh), Mana Doubler, Archfiend. **Khắc chế:** sóng toàn quái nhỏ (ít quái to).
- **Đầu ụ:** đèn pha xoay có vòng ngắm chữ thập + đồng xu hình lục giác ở tâm; điểm nhấn **vàng đồng #f0b030**.
- **Phi công:** nữ săn tiền thưởng cao bồi không gian, mũ rộng vành có đèn, nhai kẹo, nháy mắt.
- **VFX/SFX:** biểu tượng "$" lục giác trên đầu quái; tiếng máy tính tiền "ka-ching".

---

## 3. Bậc VÀNG (Legendary) — 8 ụ (đều có lớn lên 3 giai đoạn)

Quy ước lớn lên: **GĐ1 = 1–3★, GĐ2 = 4–6★, GĐ3 = 7★ (thức tỉnh)** trừ khi ghi khác. Mỗi giai đoạn đổi đầu ụ + thêm hiệu ứng.

### G1 · Eclipse — `nhatthuc` — Vàng · TC
- **Cảm hứng:** cặp Solar/Lunar của Random Dice (loại "Transform"/"Buff"); Child thần mặt trời/mặt trăng (Aten là mặt trời → Eclipse là "nhật thực").
- **Kỹ năng:** đổi chế độ mỗi 8 s.
  - **NGÀY:** 1 tia nóng vào quái đầu, ×`d` sát thương, gắn CHÁY (4%/s sát thương gốc, 4 s).
  - **ĐÊM:** sóng trăng hình nón 100 px, sát thương ×0.6 diện rộng, chậm 25% 2 s.
  - dmg gốc 15, tốc 0.9; d ★1→★7: 1.5 / 1.6 / 1.7 / 1.8 / 2.0 / 2.2 / 2.5
  - **GĐ3 (7★) NHẬT THỰC:** mỗi lần chuyển chế độ, 1.5 s cả 2 chế độ cùng lúc + nổ vòng ×4 quanh quái đầu.
- **Ghép:** ghép xong chọn bắt đầu bằng chế độ ngược với ụ còn lại trên bàn (2 Eclipse luôn lệch pha → một ụ Ngày, một ụ Đêm).
- **Phối hợp:** Purifier (cháy ≠ độc, không ăn), Ice Blade (Đêm làm chậm → +400%), Aten. **Khắc chế:** quái bay nhanh lúc Ngày.
- **Đầu ụ:** GĐ1 đĩa nửa vàng nửa xanh đêm; GĐ2 thêm vành tia nắng chạm vàng; GĐ3 vành nhật hoa đen với viền lửa trắng-vàng; nòng ống kính bên phải. Điểm nhấn **vàng nắng #ffcc33 + xanh đêm #3a5bd9**.
- **Phi công:** song sinh trong 1 khung — tóc nửa vàng nửa đen, một mắt vàng một mắt bạc, áo choàng nửa ngày nửa đêm.
- **VFX/SFX:** đổi chế độ: màn tối nhẹ quanh ụ, đĩa xoay 180°; tiếng chuông gió (Ngày) / tiếng ngân trầm (Đêm).

### G2 · Hydra — `hydra` — Vàng · TC
- **Cảm hứng:** Child Hydra/Tiamat của Destiny Child (nhiều đầu); leo thang hình ảnh theo sao.
- **Kỹ năng:** số **nòng = số sao** (tối đa 6), mỗi nòng xoay độc lập bắn 1 quái KHÁC NHAU (ưu tiên quái gần cuối đường). Mỗi nòng = 55% sát thương.
  - dmg gốc 12, tốc 1.0; nòng ★1→★6: 1 / 2 / 3 / 4 / 5 / 6
  - **7★ thức tỉnh "HỢP ĐẦU":** 6 nòng nhập 1 → tia khổng lồ xuyên thẳng toàn bộ quái trên 1 đường, ×6 sát thương, 0.6 lần/s.
- **Ghép:** không. **Co-op:** nòng thừa (không có quái bên mình) bắn sang vùng chung.
- **Phối hợp:** Radar/Overclock (tốc bắn × nhiều nòng), Amplifier. **Khắc chế:** 1 trùm đơn độc (GĐ1–2 phí nòng) — nhưng 7★ lại mạnh trên trùm → đáng để ghép lên 7.
- **Đầu ụ:** GĐ1 thân tròn 1 cổ rắn-nòng; GĐ2 3–4 cổ nòng toả hình quạt bên phải; GĐ3 một đầu rồng-pháo lớn có mào vàng. Điểm nhấn **xanh lục ngọc #2ee89a** trên kim loại vàng.
- **Phi công:** nữ chỉ huy tóc xanh lục dài tết nhiều bím (như nhiều đầu), mắt rắn, cổ áo vảy vàng.
- **VFX/SFX:** mỗi nòng một tia mảnh; 7★ tia to rung màn; tiếng rít rắn khi lên sao.

### G3 · Nemesis — `nemesis` — Vàng · TC (diệt trùm)
- **Cảm hứng:** Lucky Defense Lancelot (đốt % máu tối đa, diệt trùm), Child nữ thần báo thù Nemesis; Guillotine bản cao cấp.
- **Kỹ năng:** bắn quái nhiều máu nhất. Mỗi phát cộng thêm `p%` **máu tối đa** của mục tiêu. Quái thường còn dưới `x%` máu → **XỬ TỬ** ngay. Trùm: không xử tử, nhưng mỗi 10 phát trúng trùm → "PHÁN QUYẾT" gây `j%` máu tối đa trùm.
  - dmg gốc 14, tốc 0.7
  - p ★1→★7: 0.3 / 0.4 / 0.5 / 0.6 / 0.8 / 1.0 / 1.2 %
  - x: 8 / 9 / 10 / 11 / 12 / 13 / 15 %
  - j: 2 / 2.5 / 3 / 3.5 / 4 / 5 / 6 %
  - GĐ3 (7★): xử tử thì phân thân lưỡi hái nhảy sang quái gần nhất (1 lần).
- **Phối hợp:** Breaker, Bounty Beacon (đánh dấu quái to), Sniper (cùng nhắm quái máu cao — chia việc kém, nên chọn 1). **Khắc chế:** bầy quái nhỏ đông.
- **Đầu ụ:** GĐ1 cán cân vàng thu nhỏ trên đĩa; GĐ2 thêm lưỡi hái cong ôm quanh nòng; GĐ3 cán cân + cánh lưỡi đao đen-vàng, mắt đỏ ở tâm. Điểm nhấn **bạc lạnh #c8d4e6 + đỏ máu #d01e3a**.
- **Phi công:** nữ thẩm phán bịt mắt bằng dải lụa đen, tóc trắng dài, vương miện cán cân.
- **VFX/SFX:** xử tử: chữ "JUDGED", lưỡi hái quét một nét; tiếng búa toà gõ.
- **Cân bằng:** % máu tối đa là thứ dễ phá game → phần `p%` mỗi phát bị chặn tối đa 0.8% máu trùm (theo luật chung ChatGPT); Phán Quyết 1 lần/2 s, không cộng dồn giữa nhiều Nemesis lên cùng trùm. Không bao giờ xử tử trùm/quái tinh nhuệ.

### G4 · Pandora Vault — `pandora` — Vàng · ĐB
- **Cảm hứng:** Child Pandora; DCDW Daron/Moa (ngẫu nhiên) nhưng là **sự kiện khi ghép**; khoảnh khắc "quay thưởng" kiểu gacha.
- **Kỹ năng khi GHÉP:** mở hộp, quay 1 trong 6 (tỉ lệ đều; 6★+ được quay 2 lần chọn cái tốt hơn):
  1. **Mưa mana** +`10×sao` mana.
  2. **Đông cứng** toàn bộ quái 1.5 s (trùm 0.5 s).
  3. **Quà sao** +1★ cho 1 ụ ngẫu nhiên (không lên quá 7★).
  4. **Bom hộp** nổ 3 quả vào 3 quái đầu, mỗi quả `dmg×(3+sao)`.
  5. **Khiên** chặn 1 lần cho 3 ụ.
  6. **Cuồng nộ** toàn bàn +40% tốc bắn 6 s.
  - Bắn thường: dmg gốc 10. GĐ3 (7★): luôn 2 hiệu ứng cùng lúc.
- **PVP:** không phá sao đối thủ (luật mục 5.1); thay vào đó ô số 2 "Đông cứng" còn gửi kèm 1 quái nhỏ sang đối thủ. **Co-op:** hiệu ứng 3/5/6 áp cho cả đồng đội. Ô số 3 (+1★) **không** kích hoạt hiệu ứng ghép của ụ được nâng.
- **Phối hợp:** Twin Maker/Cloner/Combo Core (thêm lần ghép). **Khắc chế:** may rủi — người không thích random.
- **Đầu ụ:** GĐ1 rương kim loại tròn khoá vàng; GĐ2 nắp hé, tia sáng 6 màu lọt ra; GĐ3 nắp mở hẳn, quả cầu cầu vồng lơ lửng giữa, "nòng" là ống phóng nhỏ bên phải. Điểm nhấn **vàng + tím than #2b1c4a**.
- **Phi công:** cô gái tinh nghịch ôm hộp, tóc hồng-cam hai búi, mắt có hình ngôi sao, ngón tay đặt môi "suỵt".
- **VFX/SFX:** vòng quay 6 biểu tượng trên đầu ụ 0.8 s rồi dừng; tiếng máy đánh bạc.

### G5 · Marionette — `marionette` — Vàng · ĐB (khống chế)
- **Cảm hứng:** Child điều khiển rối; mô-típ "đổi phe" ít game thủ thành có → tạo khoảnh khắc lạ.
- **Kỹ năng:** mỗi `chu kỳ` s gắn dây rối lên quái thường máu cao nhất (không trùm, không quái to ở 1–3★): quái đó **quay đầu đi ngược đường** `t` s, đâm vào quái khác gây sát thương = 30% máu còn lại của nó, hết giờ **nổ** (`dmg×8` trong 60 px).
  - dmg gốc 9, tốc 0.8; chu kỳ ★1→★7: 10 / 9.5 / 9 / 8.5 / 8 / 7.5 / 7 s; t: 2 / 2.5 / 3 / 3.5 / 4 / 4.5 / 5 s
  - GĐ2 (4★+): điều khiển được cả Giant/Splitter to. GĐ3 (7★): 2 con rối cùng lúc.
- **PVP:** quái rối khi chết **không** bị gửi sang đối thủ (bạn không mất nhịp) — để công bằng, rối không tính mana. **Co-op:** rối đi ngược tới tận lối vào của đồng đội.
- **Phối hợp:** Toxic Pool/Mine Layer (quái đi ngược qua bãi mìn lần 2), Wall Projector. **Khắc chế:** trùm Nightmare/Freezer nhắm ụ mạnh nhất.
- **Đầu ụ:** GĐ1 đĩa có thanh chữ thập điều khiển rối với 4 dây sáng; GĐ2 thêm bàn tay cơ khí vàng cầm thanh; GĐ3 2 bàn tay + mặt nạ hề nửa trắng nửa đen ở tâm. Điểm nhấn **đỏ rượu #a01848 + chỉ sáng trắng**.
- **Phi công:** nghệ sĩ rối tóc xoăn đỏ rượu, mũ chóp nhỏ, mặt nạ nửa mặt, nụ cười bí ẩn.
- **VFX/SFX:** sợi chỉ sáng nối ụ → quái; quái đổi màu viền sang xanh lá (phe mình); tiếng hộp nhạc.

### G6 · Scrap Forge — `loren` — Vàng · ĐB/TC
- **Cảm hứng:** Rush Royale Treant (ăn ụ thành cộng dồn) và Scrapper (ăn ụ thừa nuôi ụ chính); DCDW không có — bổ sung cách xử lý "ụ rác".
- **Kỹ năng:** kéo **bất kỳ ụ 1–3★** (khác loại) vào Forge → ăn ụ đó, Forge +`f` cộng dồn LÒ (mỗi cộng dồn +4% sát thương, vĩnh viễn trong trận, giữ khi ghép lên sao). Ăn ụ 3★ được ×3 cộng dồn.
  - dmg gốc 13, tốc 1.0, bắn búa nóng (nổ 30 px).
  - f mỗi ụ ★1→★7 (sao của Forge): 1 / 1 / 2 / 2 / 3 / 3 / 4
  - GĐ theo **cộng dồn**: 0–14 / 15–39 / 40+ (GĐ3: mỗi phát kèm 1 mảnh sắt nóng văng ra 2 quái).
- **PVP/Co-op:** Co-op: được kéo ụ của mình vào Forge của đồng đội (tặng sức mạnh).
- **Phối hợp:** Lighthouse/Cloner (ụ 1★ miễn phí làm "thức ăn"), Mystery Box. **Khắc chế:** Janus (hoá đá Forge = mất nhịp ăn), Star Breaker (hạ sao không mất cộng dồn — ghi rõ để không quá thiệt).
- **Đầu ụ:** GĐ1 lò rèn tròn có miệng lửa phía trên + nòng búa ngắn bên phải; GĐ2 thêm ống khói đôi và búa to; GĐ3 lò nóng đỏ trắng, vỏ nứt lộ dung nham. Điểm nhấn **cam nham #ff6a1a**.
- **Phi công:** nữ thợ rèn cơ bắp tóc tết đỏ, kính hàn đẩy lên trán, găng da to, mặt lấm nhọ cười tươi.
- **VFX/SFX:** ụ bị ăn tan thành mảnh rơi vào lò; số cộng dồn "+3"; tiếng búa đập "keng" + xì hơi.
- **Cân bằng:** tối đa 60 cộng dồn (+240%).

### G7 · Mirror Gate — `guongcong` — Vàng · ĐB (phản khống chế)
- **Cảm hứng:** cần 1 lá **khắc chế** cho nhóm PVP khống chế (Clamp, Scrambler, Star Breaker, Signal Jammer) — giống vai Eve/Mona của DCDW nhưng chủ động phản đòn.
- **Kỹ năng:**
  - **PVP:** khi đối thủ dùng hiệu ứng ghép lên bàn bạn, Mirror Gate **chặn và phản lại** hiệu ứng đó lên bàn đối thủ (hồi `h` s). Hiệu ứng trùm cũng bị chặn (không phản).
  - **Co-op:** khi đồng đội GHÉP 1 ụ có hiệu ứng ghép, Mirror Gate sao chép hiệu ứng đó lên bàn bạn ở 50% mức (hồi `h` s).
  - **Solo:** chặn 1 kỹ năng trùm mỗi `h` s.
  - h ★1→★7: 30 / 27 / 24 / 21 / 18 / 15 / 12 s. Bắn thường: dmg gốc 10, đạn ánh gương.
  - GĐ3 (7★): phản lại ×2 cường độ.
- **Phối hợp:** Shield Gen, Cleanser. **Khắc chế:** deck thuần sát thương (Mirror Gate thành ụ yếu) → nên chỉ mạnh ở PVP.
- **Đầu ụ:** GĐ1 vòng gương tròn viền vàng; GĐ2 2 tấm gương lục giác xếp chéo; GĐ3 vòng 6 mảnh gương bay quanh tâm pha lê. Điểm nhấn **bạc gương + xanh trắng #bff6ff**.
- **Phi công:** nam quý tộc tóc bạc rẽ ngôi, một bên mặt phản chiếu như gương, mỉm cười kiêu ngạo, găng trắng.
- **VFX/SFX:** đòn bị phản: vòng gương lóe, chữ "REFLECT"; tiếng thuỷ tinh ngân.

### G8 · Nine-Tail — `cuuvi` — Vàng · TC
- **Cảm hứng:** Child Cửu Vĩ Hồ (Kumiho/Kitsune) phổ biến trong Destiny Child; Rush Royale Demon Hunter (tích đủ cộng dồn thì đánh toàn sân).
- **Kỹ năng:** mỗi quái mà ụ này **giết** → +1 đuôi lửa (tối đa 9). Mỗi đuôi +5% tốc bắn. Đủ 9 đuôi → xả 9 **cầu lửa hồ ly** tự dẫn (mỗi quả `dmg×(2+0.5×sao)`), về 0 đuôi.
  - dmg gốc 13, tốc 1.0, nhắm quái đầu.
  - Đuôi cần mỗi lần giết ★1→★7: giết 1 → 1 đuôi; ★5+: 20% cơ hội +2 đuôi; ★7: bắt đầu lại từ 3 đuôi sau khi xả.
  - Trùm: mỗi 8% máu trùm ụ này gây ra = +1 đuôi.
  - Lớn lên theo đuôi trong trận (3/6/9) + thức tỉnh 7★ (lửa xanh trắng, cầu lửa nổ lan 40 px).
- **Ghép:** ghép giữ lại số đuôi cao hơn của 2 ụ.
- **Phối hợp:** Breaker, Guillotine (không tính kill cho Nine-Tail — ghi rõ), Bounty Beacon. **Khắc chế:** sóng ít quái nhiều máu.
- **Đầu ụ:** GĐ1 đầu cáo vàng cách điệu trên đĩa, nòng ngắn là mõm; GĐ2 3–6 đuôi kim loại xoè quanh vành; GĐ3 9 đuôi lửa vàng-trắng thành vòng tròn hoàn hảo. Điểm nhấn **lửa cam vàng #ffa020**, thức tỉnh **xanh trắng #9fe8ff**.
- **Phi công:** cô gái tai cáo tóc vàng óng dài, mắt hẹp tinh quái, áo choàng cổ cao có hoa văn lửa, ngọn lửa nhỏ trên đầu ngón tay.
- **VFX/SFX:** đuôi hiện dần quanh bệ (đếm bằng mắt); xả: 9 quả bay vòng cung; tiếng "vụt" + tiếng chuông đền.

---

## 4. Bậc ĐỎ (Mythic / "Cổ đại") — 5 ụ

Luật chung Đỏ (giống Cổ đại DCDW): **1 Đỏ/deck**, có **NÚT KỸ NĂNG CHỦ ĐỘNG** trên thẻ khi ụ đạt ≥3★ (thanh nạp theo thời gian; dùng xong nạp lại). Đều có 3 giai đoạn lớn lên (1–3★ / 4–6★ / 7★). Đầu ụ Đỏ: đen-đỏ thẫm + chạm vàng, có "vương miện" riêng (sừng/cánh/hào quang/lõi), đổi hình rõ rệt qua 3 GĐ.

### R1 · Chrono Throne — `ngaithoigian` — Đỏ · ĐB
- **Cảm hứng:** Child nữ thần thời gian (Chronos); cặp với Chrono Lock tím. Tua ngược thời gian là khoảnh khắc "cứu trận" kịch tính nhất trong thủ thành.
- **Nội tại:** mọi quái trên đường của bạn chậm thêm 1% mỗi 1 s chúng còn sống, tối đa `s%`. Bắn: dmg gốc 16, tốc 0.8, kim đồng hồ xuyên.
  - s ★1→★7: 15 / 18 / 21 / 24 / 27 / 30 / 35 %
- **CHỦ ĐỘNG "REWIND"** (hồi 40 s → 7★ 28 s): mọi quái **lùi lại** `r%` quãng đường đã đi (trùm `r/3`), quái bị kéo lùi nhận `dmg×6`.
  - r: 15 / 17 / 19 / 21 / 23 / 26 / 30 %
  - GĐ3 (7★): Rewind còn **hoàn lại 1 tim** đã mất (Solo/PVP, tối đa 1 lần/trận) hoặc trong Co-op xoá lần lọt gần nhất nếu xảy ra trong 3 s trước (cứu thua 1 lần/trận).
- **PVP:** Rewind không ảnh hưởng đối thủ. **Co-op:** Rewind áp cho vùng chung + đường của đồng đội.
- **Phối hợp:** Chrono Lock, Blizzard, Mine Layer (quái đi qua mìn lần 2). **Khắc chế:** trùm Red Star gọi thêm quái.
- **Đầu ụ:** GĐ1 mặt đồng hồ đen vàng với 2 kim, khung ngai ở sau; GĐ2 thêm 12 chấm giờ đỏ phát sáng và cánh bánh răng; GĐ3 ngai vàng 4 cánh đồng hồ cát, lõi đỏ ruby, kim giờ là nòng chỉ sang phải. Điểm nhấn **đỏ ruby #ff2a3a + vàng**.
- **Phi công:** nữ hoàng thời gian tóc trắng-bạc rất dài, vương miện bánh răng, mắt có vòng số La Mã, áo choàng đen-đỏ.
- **VFX/SFX:** Rewind: màn hình sọc VHS + toàn bộ quái chạy lùi tua nhanh 0.6 s; tiếng tua băng ngược + chuông lớn.

### R2 · Hive Queen — `chuato` — Đỏ · TC
- **Cảm hứng:** Child nữ hoàng côn trùng/Lilith; Rush Royale Summoner + Sea Dog (sinh thêm đơn vị). Đầy sân drone mini = "wow" thị giác.
- **Nội tại:** mỗi `c` s đẻ 1 drone mini (tối đa `n`), drone bay quanh ụ rồi tự săn quái gần nhất (mỗi phát 35% sát thương ụ).
  - dmg gốc 12, tốc 0.8; c ★1→★7: 4 / 3.7 / 3.4 / 3.1 / 2.8 / 2.5 / 2.2 s; n: 3 / 4 / 5 / 6 / 7 / 8 / 10
  - GĐ2: drone có thể đậu lên ụ kề, +10% tốc bắn ụ đó. GĐ3: drone hoàng gia (mỗi 5 drone có 1 drone vàng ×3 sát thương).
- **CHỦ ĐỘNG "SWARM":** (hồi 30 s) mọi drone lao vào quái đông nhất, mỗi con nổ `dmg×3` trong 35 px; drone hồi lại từ 0.
- **PVP:** drone không vượt sang đối thủ. **Co-op:** drone thừa tự bay sang giúp đồng đội (tối đa 3).
- **Phối hợp:** Amplifier/Radar (buff ụ chủ → drone mạnh theo), Crit Antenna. **Khắc chế:** Freezer đóng băng Queen (drone đứng yên).
- **Đầu ụ:** GĐ1 tổ lục giác đen-đỏ có ô mật vàng; GĐ2 thêm 4 cánh côn trùng trong suốt toả 4 góc; GĐ3 vương miện gai vàng, bụng phát sáng đỏ, nòng ngòi chích bên phải. Điểm nhấn **đỏ cam #ff4a1a + vàng mật #ffc23a**.
- **Phi công:** nữ hoàng tóc đen ánh đỏ búi cao như tổ ong, vương miện gai vàng, mắt đỏ, cánh mỏng sau lưng.
- **VFX/SFX:** drone vo ve thành quỹ đạo; Swarm: tất cả lao đi thành vệt; tiếng vo ve tăng dần.
- **Cân bằng:** drone là thực thể nhẹ — giới hạn tổng 10 trên bàn để không giật máy.

### R3 · Leviathan — `leviathan` — Đỏ · TC
- **Cảm hứng:** Child Leviathan/Nidhogg; Rush Royale Treant (tích cộng dồn vô hạn); "càng lâu càng đáng sợ".
- **Nội tại:** mỗi `e` s **nuốt chửng** 1 quái thường (không to, không trùm) trong tầm 120 px → +1 cộng dồn VỰC SÂU (mỗi cộng dồn +3% sát thương, tối đa 100). Bắn thường: dmg gốc 15, tốc 0.9, bọt nước nổ 30 px.
  - e ★1→★7: 9 / 8.5 / 8 / 7 / 6 / 5.5 / 5 s. 4★+: được nuốt quái to (×3 cộng dồn).
- **CHỦ ĐỘNG "TIDAL BREATH":** (hồi 35 s) tia nước khổng lồ quét **toàn bộ đường đi** 1.5 s, `dmg×(4+0.1×cộng dồn)` mỗi 0.25 s, đẩy lùi 20 px.
- **Lớn lên:** GĐ theo sao + vây/răng dài thêm theo cộng dồn (0/40/80).
- **PVP:** quái bị nuốt **không** gửi sang đối thủ (như giết) nhưng không cho mana. **Co-op:** nuốt quái ở vùng chung.
- **Phối hợp:** Blizzard/Frost (giữ quái trong tầm), Bounty Beacon (nuốt quái truy nã = có mana). **Khắc chế:** sóng toàn trùm, quái bay (GĐ1–2 không nuốt quái bay).
- **Đầu ụ:** GĐ1 đầu thuỷ quái tròn vảy xanh đen, mắt đỏ; GĐ2 thêm vây gai vàng xoè; GĐ3 miệng mở to (nòng) lộ lõi xanh phát sáng, 2 sừng vàng cong. Điểm nhấn **xanh biển sâu #1fb6d9 + đỏ mắt**.
- **Phi công:** nam đô đốc biển sâu, tóc xanh đen vuốt ngược, áo choàng có vảy, sẹo răng cá trên vai, nụ cười nanh.
- **VFX/SFX:** nuốt: vòng xoáy nước hút quái vào; Breath: tia nước + bọt trắng; tiếng gầm trầm dưới nước.

### R4 · Genesis Core — `khoisinh` — Đỏ · ĐB
- **Cảm hứng:** DCDW Brownie/Aurora King/Ivory gộp thành 1 "Cổ đại kinh tế"; Lucky Defense Kitty Mage (hỗ trợ thần thoại).
- **Nội tại:** mỗi `g` s, +1★ cho **ụ có sao thấp nhất** trên bàn (không phải chính nó; nếu hoà chọn ngẫu nhiên). Không bắn (lõi hỗ trợ).
  - g ★1→★7: 30 / 28 / 26 / 24 / 22 / 20 / 16 s
  - GĐ2: 4 ô kề +15% sát thương. GĐ3: mỗi lần nâng sao còn tạo 1 ụ 1★ ngẫu nhiên nếu có ô trống.
- **CHỦ ĐỘNG "GENESIS":** (hồi 45 s) gọi `k` ụ mới (loại ngẫu nhiên trong deck) ở **mức sao trung bình** của bàn (làm tròn xuống) vào ô trống. k: 1 / 1 / 2 / 2 / 2 / 3 / 3.
- **PVP:** không tác động đối thủ. **Co-op:** nội tại có thể chọn ụ thấp nhất của **đồng đội** nếu thấp hơn của bạn.
- **Phối hợp:** Combo Core, Sync Cannon, Star Cannon (tổng sao), Railgun (lấp đầy hàng). **Khắc chế:** Nightmare (hạ sao), bàn đầy.
- **Đầu ụ:** GĐ1 quả cầu lõi đỏ trong vòng ba vành vàng; GĐ2 vành mọc lá thép vàng như hoa nở; GĐ3 hoa sen kim loại 8 cánh, lõi đỏ có ngôi sao trắng, quầng sáng. Không nòng. Điểm nhấn **đỏ hồng ngọc + vàng + trắng**.
- **Phi công:** nữ thần trẻ tóc vàng hồng dài, vòng hoa sen trên đầu, ánh mắt hiền, hạt sáng trong lòng bàn tay.
- **VFX/SFX:** nâng sao: tia sáng cong từ lõi sang ụ đích; tiếng hợp xướng ngắn.
- **Cân bằng:** dễ "lăn cầu tuyết" — giữ hồi lâu, và không tính là "ghép" (không kích hoạt hiệu ứng ghép).

### R5 · Wyrm Engine — `ronglua` — Đỏ · TC
- **Cảm hứng:** Child rồng (Tiamat); quái-vật-máy kiểu mecha; lửa nón quét là hiệu ứng "đã mắt" nhất.
- **Nội tại:** phun lửa hình nón (góc 50°, dài 110 px) liên tục vào hướng quái đông nhất, sát thương mỗi 0.2 s, gắn CHÁY 3 s. Ở chỗ lửa đã quét để lại **vệt cháy** trên đường 2 s.
  - dmg gốc 7 (mỗi nhịp), tốc 5 nhịp/s; góc nón ★1→★7: 40 / 45 / 50 / 55 / 60 / 65 / 75°; tầm: 100 / 105 / 110 / 115 / 120 / 125 / 135 px
  - GĐ2: lửa xanh lam (+30% sát thương với quái to). GĐ3: lửa trắng, vệt cháy 4 s.
- **CHỦ ĐỘNG "DRAGON DIVE":** (hồi 35 s) rồng cơ khí bay ra, bổ nhào dọc **toàn bộ** đường đi từ cuối về đầu, `dmg×25` mỗi quái + 5% máu tối đa trùm, để lại vệt cháy trên cả đường 3 s.
- **PVP/Co-op:** Co-op: Dive bay luôn qua vùng chung.
- **Phối hợp:** Purifier (nếu cho cháy tính như độc — **không**, giữ riêng), Blizzard (giữ quái trong nón), Iron Fist. **Khắc chế:** quái bay nhanh lướt qua nón; Octopus Eyes.
- **Đầu ụ:** GĐ1 đầu rồng cơ khí đỏ đen nhìn từ trên, mõm-nòng bên phải; GĐ2 thêm 2 sừng vàng và vây cổ; GĐ3 2 cánh dơi cơ khí xoè quanh thân tròn, mắt và họng phát sáng trắng. Điểm nhấn **đỏ lửa #ff3b1a → lam #3aa0ff → trắng**.
- **Phi công:** nam kỵ sĩ rồng tóc đỏ rực, mắt vàng đồng tử dọc, sừng nhỏ trên trán, áo giáp đen viền vàng, cười ngạo nghễ.
- **VFX/SFX:** nón lửa hạt; Dive: bóng rồng lớn quét qua cả màn + rung; tiếng gầm rồng kim loại.

---

## 5. Luật deck, tối ưu ụ cũ, thứ tự làm

### 5.1 Luật deck đề xuất
1. Deck 5 ụ, **tối đa 1 Đỏ** (giữ luật hiện tại `maxOneMythic`).
2. **Tối đa 2 ụ "thao túng sao"** trong 1 deck: Merge King, Twin Maker, Star Lift, Star Breaker, Evolver, Scrap Forge, Genesis Core, Pandora Vault — tránh deck "chỉ ghép, không bắn".
3. Deck phải có **≥2 ụ vai TC** (cảnh báo, không chặn) để người mới không bị thua vì deck toàn hỗ trợ.
4. **PVP:** hiệu ứng khống chế lên cùng 1 ụ có "miễn nhiễm" 6 s sau mỗi lần (Clamp, Scrambler, Star Breaker, Signal Jammer). Mirror Gate là lá khắc chế.
5. Nút kỹ năng chủ động của Đỏ và Ma vương (Archfiend) **không dùng chung hồi chiêu**, nhưng Cooldown Horn chỉ giảm hồi của Ma vương (không Đỏ) để tránh xoay vòng vô hạn.
6. **Luật cân bằng chung (gộp từ ChatGPT):** không ụ nào vượt 7★; được +★ từ kỹ năng **không** tính là ghép (không kích hoạt hiệu ứng ghép, không nổ dây chuyền); hiệu ứng sinh từ hiệu ứng khác không được sinh tiếp mana/ụ. Trần: tốc bắn +100%, sát thương cộng thêm +150%, chí mạng 65%, làm chậm 45% (trùm 20%), "nhận thêm sát thương" +30%. Không giết ngay trùm/quái tinh nhuệ.
7. **PVP:** hiệu ứng lên bàn đối thủ phải **báo trước 0.65 s**, không phá sao, không khoá cứng quá 2 s, 1 ụ chỉ dính 1 hiệu ứng xấu cùng lúc + miễn nhiễm 8 s sau đó.
8. **Co-op:** mỗi người được 1 Đỏ (tổng 2 trên sân). Nếu sau này 1 ụ Đỏ có tỉ lệ thắng >55% hoặc có mặt trong >80% deck → giảm sức mạnh, không mở thêm suất Đỏ.

### 5.2 Ụ Vàng/Đỏ hiện có còn yếu hoặc trùng — đề xuất sửa (dựa trên mô tả kỹ năng, cần kiểm chứng khi chơi thử)
| Ụ | Vấn đề | Cách sửa |
|---|---|---|
| Evolver (`tienhoa`) | Trùng ý Mystery Box (biến thành ụ ngẫu nhiên) | Tiến hoá thành **loại có nhiều nhất trên bàn** +1★ → giúp ghép, có chiến thuật |
| Copycat (`saochep`) | Sao chép nhưng "giảm sát thương" → ít lý do chọn hơn Mimic | Bản sao giữ 100% kỹ năng hỗ trợ/ghép, chỉ giảm 30% sát thương bắn |
| Mech Wolf (`soi`) | Cận chiến phụ thuộc ô sát đường, thức tỉnh ngẫu nhiên | Thức tỉnh chắc chắn ở 4★; 7★ "lao" tới quái trong 2 ô rồi về |
| Rainbow (`cauvong`) | Mô tả ghi "(co-op)" → yếu ở Solo/PVP | Solo/PVP: cầu vồng làm quái nhận +15% sát thương; Co-op giữ nguyên + lan sang đồng đội |
| Wall Projector (`wallgen`) vs Black Hole (`blackhole`) | Cả hai đều "giữ quái tại chỗ rồi nổ" | Black Hole thêm hút **quái bay**; tường chặn quái đất — phân vai đất/bay |
| Holy Halo (`haoquang`) | Chỉ phòng thủ, vô dụng khi không có trùm/khống chế | Nội tại: ụ kề +20% sát thương; khi khiên bật, ụ được bảo vệ +50% tốc bắn |
| Star Cannon (`ngoisao`) | Mốc 50★ khó đạt sớm | Thêm mốc nhỏ 20★/35★ (+tốc bắn), 50★ giữ "siêu sát thương" |
| Orbital (`orbital`) | Chỉ kích hoạt khi ghép → yếu lúc bàn ổn định | Nội tại: 1 vệ tinh bắn nhỏ mỗi 6 s kể cả khi không ghép |
| Twin Maker (`sinhdoi`) vs Merge King (`vughep`) | (ý ChatGPT) cùng là "thêm sao/thêm ụ" | Merge King giữ +★; Twin Maker đổi thành "bản sao tạm" 50% sát thương, 8 s, không ghép được |
| Overlord (`overlord`) | (ý ChatGPT) chỉ 1 nhịp nạp-nổ | 3 giai đoạn: niêm phong → nạp → ion hoá (bắn tia sét chuỗi giữa các lần nổ) |
| Holy Halo (`haoquang`) | (ý ChatGPT) trùng Cleanser/Shield Gen | Thêm "cứu khẩn cấp": 1 lần/wave, khi ≥2 ụ bị khoá cùng lúc, rút ngắn hiệu ứng xấu 50% |

### 5.3 Thứ tự làm 8 ụ đầu (đa dạng vai + dễ làm trước, nhiều "wow")
1. **Ricochet** (Tím TC) — dễ code (giống đạn thẳng + tìm quái kế), lấp vai sát thương bầy.
2. **Combo Core** (Tím TC) — dễ, tạo mục tiêu ghép rõ ràng.
3. **Chrono Lock** (Tím ĐB) — khoảnh khắc khoá thời gian; hợp Ice Blade.
4. **Hydra** (Vàng TC) — leo thang hình ảnh theo sao rõ nhất.
5. **Nine-Tail** (Vàng TC) — đếm đuôi trực quan, xả cầu lửa đã mắt.
6. **Pandora Vault** (Vàng ĐB) — "quay thưởng" khi ghép, dùng lại hiệu ứng có sẵn (mana, đông cứng, khiên, buff).
7. **Resonance Grid** (Vàng HT, ý ChatGPT — xem 5.5) — hỗ trợ 4 ô CHÉO, câu đố vị trí rất hợp bàn 5×3, dễ code (giống Radar đổi hướng ô).
8. **Chrono Throne** (Đỏ) — Rewind là chiêu chủ động mạnh nhất về cảm xúc, ghép bộ với Chrono Lock.
Đợt 2: Nemesis, Lone Ace, Focus Lens, Signal Jammer, Bounty Beacon, Eclipse, Scrap Forge, Mirror Gate, Marionette. Đợt 3: Hive Queen, Leviathan, Genesis Core, Wyrm Engine.

### 5.4 Dòng `text.js` gợi ý (tiếng Anh, ngắn)
```js
khoathoigian: { name: 'Chrono Lock',   skill: 'Freezes the lead enemy in time; stored damage bursts on release' },
combo:        { name: 'Combo Core',    skill: 'Every Combo Core merge permanently powers up all Combo Cores' },
nayda:        { name: 'Ricochet',      skill: 'Disc bounces to N enemies, stronger each bounce' },
docton:       { name: 'Lone Ace',      skill: 'No neighbors: double fire rate and bonus crit' },
thaukinh:     { name: 'Focus Lens',    skill: 'Support: neighbors deal more crit damage; crits pierce' },
nhieusong:    { name: 'Signal Jammer', skill: 'On merge: PVP jams rival turrets; Co-op gives ally a free summon' },
santhuong:    { name: 'Bounty Beacon', skill: 'Marks enemies; marked kills give bonus mana' },
nhatthuc:     { name: 'Eclipse',       skill: 'Day: burning beam. Night: slowing wave. Swaps every 8s' },
hydra:        { name: 'Hydra',         skill: 'One barrel per star, each hits a different enemy; 7★ fuses' },
nemesis:      { name: 'Nemesis',       skill: 'Executes low-HP enemies; % max-HP judgment on bosses' },
pandora:      { name: 'Pandora Vault', skill: 'On merge: opens the vault for 1 of 6 big effects' },
marionette:   { name: 'Marionette',    skill: 'Takes control of an enemy, walks it backward, then boom' },
loren:        { name: 'Scrap Forge',   skill: 'Feed it 1–3★ turrets for permanent damage stacks' },
guongcong:    { name: 'Mirror Gate',   skill: 'PVP: reflects rival control. Co-op: copies ally merge effects' },
cuuvi:        { name: 'Nine-Tail',     skill: 'Kills grow fire tails; 9 tails unleash 9 homing foxfires' },
ngaithoigian: { name: 'Chrono Throne', skill: 'Enemies slow over time. Active: REWIND pushes all enemies back' },
chuato:       { name: 'Hive Queen',    skill: 'Breeds hunter drones. Active: SWARM kamikaze' },
leviathan:    { name: 'Leviathan',     skill: 'Devours enemies for stacks. Active: TIDAL BREATH sweeps the path' },
khoisinh:     { name: 'Genesis Core',  skill: 'Raises your lowest turret +1★. Active: summons 3 turrets' },
ronglua:      { name: 'Wyrm Engine',   skill: 'Flame cone burns crowds. Active: DRAGON DIVE down the path' },
```

### 5.5 Ụ dự bị lấy từ ChatGPT (`thap-art/TU-VAN-TUONG-MOI.txt`)
| Tên | Bậc | Ý chính | Ghi chú gộp |
|---|---|---|---|
| **Resonance Grid** (id đề xuất `luoicheo`) | Vàng HT | Buff **4 ô chéo**: +(7+1.6×sao)% sát thương; không buff ô thẳng | Đưa vào 8 ụ đầu. Đầu ụ: khung vuông xoay 45° có 4 chấu chéo, điểm nhấn xanh ngọc |
| Phase Shifter | Tím ĐB | Khi ghép: trong 3 s được đổi chỗ ụ vừa ghép với 1 ụ trong 2 ô, cả hai +tốc bắn 4 s | Trùng một phần Teleporter → chỉ làm nếu Teleporter bị bỏ |
| Marksmith | Tím TC | Gắn tối đa 4 dấu, mỗi dấu +% sát thương nhận; đủ 4 nổ | Trùng Breaker/Bounty Beacon → gộp ý "đủ 4 dấu thì nổ" vào Bounty Beacon nếu cần |
| Nova Engine | Đỏ TC | Đứng yên không ghép 10/20 s → GĐ B/C, GĐ C bắn phát siêu nặng rồi tụt về B | Hay cho "lớn lên"; gần Overlord → cân nhắc thay R5 nếu Wyrm Engine khó làm |
| Fate Engine | Đỏ ĐB | Tích "vé số phận" từ ghép; chạm để đổi LOẠI ụ vừa ghép (giữ sao) | Mạnh, cần chống vòng lặp; dự bị cho R4 |
| Time Anchor | Đỏ ĐB | Ghi nhớ 1 ụ; nếu bị trùm đổi loại/hạ sao trong 9 s thì phục hồi | Ý hay chống trùm → có thể gộp vào GĐ3 của Chrono Throne |

---

## 6. Việc tiếp theo
- So thêm với bản ChatGPT khi chơi thử: nếu 1 ụ của ChatGPT rõ hơn ụ cùng vai ở đây thì thay (giữ tổng ~20).
- Vẽ đầu ụ + phi công theo `TUONG-MOI-PROMPTS.md`; thêm vào `roster.json` (bac: `tim`/`vang`/`do`) và `text.js`.
- Chơi thử từng ụ ở Solo wave 1–40 và PVP bot, chỉnh số theo bảng.

## Nguồn
- Repo: `DCDW-WIKI.md`, `DCDW-WIKI-TOM-TAT.md` (tóm tắt namu.wiki DCDW, 04/11/2026).
- [Rush Royale Best Cards Tier List (2026)](https://commonsensegamer.com/rush-royale-tier-list-best-cards-in-the-game-in-2024/) — Treant, Monk, Genie, Dryad, Witch, Demon Hunter, Harlequin, Scrapper, Blade Dancer, Cultist.
- [Top 5 Best Legendary Cards in Rush Royale](https://theclashify.com/rush-royale-best-legendary-cards) — Inquisitor, Shaman (PvP hạ / Co-op nâng hạng), Hex.
- [MY.GAMES: Festival of Talents, Treant](https://about.my.games/news/244)
- [Lucky Defense mythic unlock order](https://ghidbase.github.io/lucky-defense-guides/pages/unlock-order.html) — Lancelot (% máu tối đa), Vayne, Kitty Mage, công thức ghép Myth.
- [Lucky Defense guide (Pocket Gamer)](https://www.pocketgamer.com/lucky-defense-omfg/guide) — 3 ụ cùng loại ghép ra ụ ngẫu nhiên bậc cao hơn.
- [Random Dice tier list (Gamertweak)](https://gamertweak.com/random-dice-tier-list/) — phân loại Legend: Transform (Solar, Typhoon, Growth), Merge (Assassin, Nuclear), Buff (Lunar, Hell)…
- [Random Dice guide (Pocket Tactics)](https://www.pockettactics.com/random-dice/guide), [Best PvP decks](https://progameguides.com/random-dice/best-pvp-decks-in-random-dice/)
- Không đọc được (bị chặn): en.namu.wiki trang thẻ DCDW, random-dice.fandom.com.
- Nguồn ChatGPT trích (chưa tự kiểm chứng): [Random Dice Supplement](https://randomdice.wiki.gg/wiki/Supplement_Dice), [Joker](https://randomdice.wiki.gg/wiki/Joker_Dice), [Lunar](https://randomdice.wiki.gg/wiki/Lunar_Dice), [Rush Royale update 1.40 – Witch](https://rr.my.games/en/news/4/willkommen-zum-update-140), [update 3.40 – Valkyrie](https://rr.my.games/en/news/59/welcome-to-update-340), [update 2.30 – freeze](https://rushroyale.my.games/en/news/26/welcome-to-update-230), [DCDW tier list (TouchTapPlay)](https://www.touchtapplay.com/best-destiny-child-defense-war-characters-tier-list/).
