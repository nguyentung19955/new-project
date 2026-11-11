# TÀI LIỆU GỐC — ASTRAL ARSENAL (Turret Merge)

> **Chuẩn đối chiếu duy nhất** cho hướng dẫn, mô tả trong game, trang ụ, video bắn thử và mọi tài liệu khác.
> Viết lại **từ code** trên nhánh `claude/demo-hop-tuong` (code là nguồn sự thật; tài liệu cũ chỉ tham khảo).
> Mỗi mục ghi `file: hàm/hằng` để đối chiếu. **Quy tắc:** mọi thay đổi luật / số liệu / cơ chế / chế độ / kinh tế phải sửa tài liệu này trong **cùng commit** (xem `CLAUDE.md` mục "Tài liệu gốc").
>
> - Cập nhật lần cuối: **10/11/2026** · commit gốc đọc code: `0b1a6b539` (Fusion Archive dồn điểm) + sửa chữ đợt checklist 1 (Solo → Single-player/Chơi đơn, Archfiend → Commander, Radar 46%, Genesis 11 s).
> - Bảng 97 ụ, bảng cấp thẻ, bảng chỉ huy, bảng trùm **sinh tự động** bằng cách nạp game thật (Playwright) và đọc `G.roster`, `SKILLS`, `TEXT`, `upBangSao`, `mocCua`, `GROW`, `KY_NANG_CAP`, `MAVUONG`, `TRUM` — khi sửa số, chạy lại để cập nhật (cách làm ở mục 17).
> - Checklist rà hướng dẫn theo tài liệu này: `docs/demo-hop-tuong/CHECKLIST-HUONG-DAN.md`.

## Mục lục
1. [Tổng quan](#1-tổng-quan)
2. [Vòng chơi một trận](#2-vòng-chơi-một-trận)
3. [Quái, wave, trùm, tim](#3-quái-wave-trùm-tim)
4. [Các chế độ chơi + mở khoá + thưởng](#4-các-chế-độ-chơi)
5. [5 bậc và hệ số sức mạnh](#5-5-bậc-và-hệ-số-sức-mạnh)
6. [Bảng 97 ụ](#6-bảng-97-ụ)
7. [Cấp thẻ + kỹ năng theo cấp (KY_NANG_CAP)](#7-cấp-thẻ)
8. [Chỉ huy](#8-chỉ-huy)
9. [12 trùm + chiêu](#9-12-trùm)
10. [Gacha, sở hữu, rương, tỉ lệ, bảo hiểm, mở nhóm](#10-gacha-sở-hữu-rương)
11. [Kinh tế](#11-kinh-tế)
12. [Tiến trình người chơi](#12-tiến-trình)
13. [Online](#13-online)
14. [Admin](#14-admin)
15. [Nguyên tắc thiết kế](#15-nguyên-tắc-thiết-kế)
16. [Phong cách hình](#16-phong-cách-hình)
17. [Cách cập nhật tài liệu này](#17-cách-cập-nhật)

---

## 1. Tổng quan
- **Tên:** ASTRAL ARSENAL (tên cũ trong code: TURRET MERGE). Merge tower-defense trên điện thoại kiểu *Destiny Child: Defense War* (DCDW / Lucky Defense). Thư mục game `thap/`, live https://turret-merge.web.app.
- **Một câu:** triệu hồi ụ súng ngẫu nhiên từ bộ 5 thẻ lên bàn 5×3, ghép 2 ụ giống nhau để lên sao, giữ lõi khỏi quái đi theo đường chữ C; trùm mỗi 10 wave.
- **Màn khung logic** 430×860, co giãn theo màn (`data.js: W, H`). Ngôn ngữ EN (gốc trong code) + VI (`ngonngu.js` + từ điển `ngonngu-vi.js` sinh từ `docs/demo-hop-tuong/tuvan/ngonngu/vi.json` bằng `tools/thap-vi-dung.py`).
- **Một loại tiền trong trận: MANA** (`data.js: TIEN, CHI`). Ngoài trận: **Vàng, Ngọc, Tinh thể Đỏ**, bản sao thẻ (mảnh).
- **Số ụ đang chơi:** 97 (`G.roster` lọc theo `SKILLS`; `assets/roster.json` có 98 mục — `haoquang` (Holy Halo) đã bỏ khỏi game). Ụ thứ 97 = Crimson Sting (`bocap`, ra mắt 10/11 ở bậc Vàng, **lên bậc Đỏ 11/11**).

## 2. Vòng chơi một trận
Nguồn: `game.js: batDau, trieu, ghep, hopLeGhep, nangCap, dungMV, dmgU, tocU, critU` · `data.js: LUAT, boCuc, hsLv`.

| Luật | Giá trị | Nguồn |
|---|---|---|
| Bàn | 5 cột × 3 hàng = **15 ô**; quái đi đường **chữ C** ôm 3 cạnh bàn (Leo Tháp: 1 bàn; CO-OP / Đường Đua: 2 bàn cùng cỡ, 2 nhánh nhập hành lang chung; PVP: 2 bàn, mỗi bàn 1 làn chữ C đối xứng) | `data.js: boCuc, BC_SOLO, BC_DOI, BC_PVP` |
| Mana đầu trận | **100** (Leo Tháp: theo wave đầu, xem mục 4) | `LUAT.manaDau`, `chedo-c.js: CDC.mana` |
| Mana khi giết | Quái thường: `(10 + 2×(wave−1)) × (1 + 1,7·min(wave,30)/30)` × hệ số quái (Crawler / Flyer / Frost Flyer / Splitter / Runner 1 · Giant 4 · Big Splitter 3 · Elite 10 · Swarmling 0,5 · Spawnling 0,3). **Trùm: `(10 + 2×(wave−1)) × 12`** (không nhân bù). Hệ số bù (11/11) giữ tổng mana/wave gần như cũ dù số quái giảm; Bounty Beacon (thưởng = 15–30% `manaGiet` của wave) cũng được nhân bù vì số quái để đánh dấu ít đi; Star Leech hoàn mana theo công thức gốc ×3 như cũ | `data.js: manaGiet, manaGietGoc`, `game.js` (chết) |
| Triệu hồi (SUMMON) | Giá **10**, mỗi lần sau **+10**. Ra **1 ụ 1★** loại ngẫu nhiên đều trong bộ 5 thẻ, vào ô trống ngẫu nhiên (RNG có hạt, tất định) | `game.js: trieu`, `LUAT.giaTrieu/giaTrieuTang` |
| Ghép thường | Kéo ụ A lên ụ B **cùng loại + cùng sao** → ở ô B ra **1 ụ NGẪU NHIÊN trong bộ, +1★** (ụ mới thật, mọi cộng dồn về 0). Tối đa **7★** | `game.js: ghep, hopLeGhep, LUAT.saoMax` |
| Mimic | Ghép với **bất kỳ ụ cùng sao**; kết quả +% sát thương 8 s (`KY_NANG_CAP.mimic` 50%→74%) | `hopLeGhep`, `dmgU` |
| Ụ đá (Janus) | Đá chỉ ghép với đá **cùng sao** → khối đá +1★; Cleanser / HOLY SHIELD phá đá | `ghep` (daDa) |
| Ụ băng | Không ghép được tới khi tan | `hopLeGhep` |
| Ghép đặc biệt | Kỹ năng của ụ KÉO quyết định (Merge King +★ tại chỗ, Teleporter đổi chỗ, Copycat chép, Overclock, Fusion Mixer, Pháo La Bàn gộp hướng, Twin Anvil, Prism hợp thể, Wild Link ghép tự do…). Chỉ "ghép thật" mới tính là ghép cho bộ đếm/nhiệm vụ | `ghepDacBiet, laGhepThat, tdW` |
| Wild Link | Ghép với mọi loại/mọi sao, kể cả đá/băng; kết quả ngẫu nhiên, sao = ⌈trung bình⌉, **không +1★** (cấp thẻ: % được +1★) | `game.js: saoGhep, tdThuong` |
| Bản sao theo ô đích | Ghép đặc biệt cùng loại lấy cờ "bản sao" của **ụ đích**; ghép thường luôn ra ụ thật | `giuBanSao` |
| POWER-UP trong trận | Chạm thẻ ở thanh dưới: **4 bước +1/+2/+3/MAX**, giá **100 / 200 / 400 / 700** mana, mỗi bước **+25% sát thương GỐC** (cộng tuyến tính, tối đa +100%), áp **mọi bản cùng loại** trận này. Ụ không gây sát thương: bước tăng chính số kỹ năng (`pu` trong KY_NANG_CAP). Hydra không có power-up | `nangCap, hsLv, LUAT.giaNangCap, LUAT.nangPct` |
| Chỉ huy | 1 chỉ huy/bộ; giá mana **×2 mỗi lần dùng**, có hồi chiêu; đồng hồ tác dụng dừng lúc nghỉ giữa wave khi sân trống | `dungMV, chihuy.js, LUAT_MV` |
| Chí mạng | Gốc **10%**, chí mạng ×2 sát thương (+ ST chí mạng từ hỗ trợ) | `critU` |
| Cộng gộp buff | +% cùng loại (ST / tốc / ST chí mạng) cộng trong nhóm rồi các nhóm nhân nhau; nhân riêng: RAGE ×2, suy yếu quái, bản sao Copycat, mốc sao 5★/7★ | `game.js: CONG_GOP, dmgU` |
| Tăng theo sao (ụ Tấn công) | ST × (1 + **0,5**/★), tốc +**10,5 điểm %**/★ (7★ ≈ ×4 ST, ×1,83 tốc). Giữ kiểu cũ ST ×(1+0,85/★), không thêm tốc: `ronglua, leviathan, wallgen, chuato, min, blackhole` | `data.js: SAO_ST, SAO_TOC, SAO_CU, heSaoST` |
| Nền Đỏ (ụ Tấn công Đỏ) | ST × 1,8 ở 1–3★ · 1,6 (4★) · 1,4 (5★) · 1,2 (6★) · 1,0 (7★) | `DO_NEN, heDoNen` |
| Gánh hậu kỳ (Tấn công Vàng/Đỏ) | Sau wave 20: Vàng và Đỏ cùng **+2%/wave** tới wave 40 (wave 40: ×1,40); **sau wave 40 không tăng nữa** (11/11, biến thể B) | `HAU_KY, heHauKy` |
| Mốc sao | 3★/5★/7★ mở nâng cấp kỹ năng thật (mốc riêng từng ụ hoặc mốc chung: QUICK HANDS +20% tốc · DOUBLE TAP mỗi phát thứ 4 bắn đôi · APEX +30% ST +10% chí mạng; ụ hỗ trợ: hào quang ×1,45 / ×1,9 / ×2,35) | `phattrien.js: MOC_RIENG, MOC_CHUNG, mocCua` |
| Kỹ năng chủ động | Ụ có ▶: nạp đầy → **tự kích** (`TU_KICH`), riêng **Black Hole** và **Arcane Cascade** phải **chạm tay** | `game.js: TU_KICH, laTuKich, chamSan` |
| Tốc độ | Bước mô phỏng cố định 1/60 s; 2×/3× = chạy nhiều bước hơn | `game.js: BUOC` |
| Bộ bài | 5 ụ đã sở hữu, **tối đa 1 ụ Đỏ (Thần thoại)**; mẹo ≥2 ụ Tấn công. Ụ trên bàn chỉ đến từ 5 thẻ trong bộ | `text.js: oneMythic`, `ui.js` |

## 3. Quái, wave, trùm, tim
Nguồn: `data.js: QUAI, taoWave, mauWave, LUAT` · `game.js: wavMoi, sinhQuai, sinhTrum, lot, lichTrum, trumCuaWave, pvpDotTu`.

- **Tim:** 3 (CO-OP: 3 tim **chung**). Quái thường lọt −1 tim; **Khổng lồ, Tách lớn, trùm lọt −2 tim** (`QUAI.*.tim`, `sinhTrum: tim 2`, `lot`).
- **Quái:** Crawler (máu ×1, tốc 34) · Flyer (×0,6, 62, bay) · Frost Flyer (×0,85, 50, bay, **miễn làm chậm**) · Giant (×4,5, 22, to) · Splitter (×1,6, tách **3** con nhỏ) · Big Splitter (×3,2, to, tách **2** Splitter) · Spawnling (×0,22) · Swarmling (×0,5, tốc 44) · Runner (×0,9, tốc 60, **miễn làm chậm**) · Elite (×12, tốc 20, to, lọt −2 tim). Ba loại cuối (11/11) chỉ khác số liệu, mượn hình Splitter nhỏ / Crawler / Giant.
- **Số quái/wave (11/11, biến thể B):** n = `min(20, 8 + ⌊w/4⌋)` (`soQuaiWave`; wave 10: 10 · wave 30: 15 · từ wave 48: 20). Wave thường 20 s.
- **Wave có chủ đề** theo chữ số cuối của wave (`CHU_DE`, `dsQuaiChuDe`; tên chủ đề hiện dưới chữ WAVE n đầu wave):

| Cuối wave | Chủ đề (tên trong game) | Thành phần |
|---|---|---|
| 1, 6 | Hỗn hợp (MIXED) | n con: Crawler; 20% Flyer (từ wave 2); 10% Frost Flyer (từ wave 8); mỗi con thứ 6 là Giant (từ wave 4) |
| 2 | Bầy đàn (SWARM) | 1,8n Swarmling |
| 3 | Không kích (AIR RAID) | n Flyer, từ wave 8: 40% là Frost Flyer |
| 4 | Thiết giáp (ARMORED) | n/3,2 Giant (ít nhất 2) |
| 5 | Tinh anh (ELITE) | 1 Elite + n/2 Crawler |
| 7 | Tốc hành (EXPRESS) | 0,9n Runner |
| 8 | Phân bào (MITOSIS) | 0,45n Splitter (ít nhất 3); từ wave 30 mỗi con thứ 4 là Big Splitter. **Slime chỉ còn ở wave này** |
| 9 | Hỗn loạn (CHAOS) | 2 chủ đề khác nhau bốc ngẫu nhiên (Bầy đàn / Không kích / Thiết giáp / Tốc hành), mỗi bên nửa số quái, xen kẽ |
| 0 | Trùm | trùm + 4 Crawler (wave chia hết 10 mà không có trùm, vd giữa tầng Leo Tháp: Hỗn hợp) |

  Ngẫu nhiên của wave lấy từ RNG có hạt do nơi gọi đưa vào (PVP / Leo Tháp / Thử thách / Vô tận: `rngHat` theo hạt trận + wave; co-op online: `dongbo.js` đặt RNG có hạt quanh `wavMoi`) → 2 máy ra cùng danh sách. Luật sinh Leo Tháp (Horde ×số quái, Giants, Sky Raid) áp lên danh sách chủ đề.
- **Máu wave:** `(80·m + 30·w) × hệ số B`, m = 1,15^(w−1) tới wave 25; ×1,12/wave từ 26–40; ×1,08/wave từ 41 (PVP giữ ×1,15). **Hệ số B (11/11, `mauHeSo`)**: giảm đều từ ×1 (wave 1) tới **×0,95** (wave 30), wave 41–60 thêm ×0,99/wave, từ wave 61 thêm ×1,01/wave → máu thực tăng **×1,069/wave** ở wave 41–60 và **×1,091/wave** từ wave 61 (tiếp tục mãi, không trần). So với trước 11/11: wave 50 ×0,86 · 60 ×0,78 · 70 ×0,86 · 80 ×0,95.
- **Không trần wave (11/11):** solo (`?mode=solo`) và CO-OP (cả online) **không còn thắng ở wave 70** — đánh tới khi hết tim; trùm vẫn mỗi 10 wave, chủ đề lặp theo chữ số cuối, máu theo công thức trên. Trận kết thúc bằng màn DEFEAT "Reached WAVE n" (kỷ lục / XP / điểm sự kiện tính theo wave đạt được như trước). `LUAT.waveMax = 0` (= không trần; chỉ công cụ đo đặt số > 0). Leo Tháp, Săn Trùm, Thử thách ngắn, Thử thách tuần, PVP giữ điều kiện kết thúc riêng.
- **Trùm:** mỗi **10 wave** (`LUAT.songTrum`). Máu trùm = `mauWave(w) × 30 × (1 + w/35)`. Bể trùm ngẫu nhiên theo wave xuất hiện (6 trùm cũ từ wave 10; Hive 10; Jammer, Prism 20; Twin Core, Patch Titan 30; Star Leech 40), không lặp liền, hạt giống trận (tất định). CO-OP: thứ tự cố định tới wave 59, mỗi nhánh 1 trùm khác loại. PVP: từ wave **30 = ĐỘT TỬ** — wave nào cũng có trùm, máu ×(1+0,5k), số trùm 1+⌊k/3⌋.
- **Cảnh báo chiêu trùm** biến mất khi trùm chết (`huyBaoTrum`).

## 4. Các chế độ chơi
> **11/11 18:41 — người dùng chốt BỎ Leo Tháp + Thử thách ngắn / Thử thách tuần / Săn Trùm / Vô tận (làm theo DCDW trên nhánh `claude/che-do-dcdw`).** Vì vậy các thay đổi cân bằng B KHÔNG áp vào `chedo-c.js` / `chedo-d.js`: wave đầu tầng Leo Tháp vẫn `5 + ⌊0,62(t−1)⌋`, danh sách quái của các chế độ này vẫn theo công thức cũ (tới 32 con / wave, không chủ đề), mốc Tuần 15/25/35/45 và Vô tận 80–120 giữ nguyên. Chỗ nào bên dưới ghi khác (tầng 1–11 bắt đầu wave 1–11, mốc 20/30/40/50, 75–115) là KHÔNG đúng với code. Cân bằng B + wave có chủ đề + không trần wave chỉ áp cho CO-OP / PVP / solo thử.

Bảng GAME MODE ở HOME (`home.js: HM.CHE` + `chedo-c.js` + `chedo-d.js` + `chedo-dd.js`). **11/11 người dùng chốt "làm y như DCDW"**: chế độ = PVP, CO-OP, ONLINE phòng bạn bè, ĐƯỜNG ĐUA (Raid, Push làm đợt sau) ; **18:41 người dùng chốt tiếp: BỎ cả LEO THÁP** (`CDC.bo.thap`, bản lưu `cd.thap` giữ nguyên) — chế độ chính = CO-OP, hướng dẫn là một bản riêng. **ĐÃ BỎ khỏi game (ẩn mọi lối vào, code + bản lưu `turret_kt.cd.san / thu / vt / tw` giữ nguyên): SĂN TRÙM, THỬ THÁCH NGẮN (`CDC.bo`), VÔ TẬN, THỬ THÁCH TUẦN (`CDDC.vt.bat / tw.bat = false`)** — thắng tầng 100 Leo Tháp = kết thúc bình thường (không hỏi ENDLESS); nguồn thưởng tuần của 3 chế độ đó chuyển sang mốc điểm tuần Đường Đua; **thưởng MỘT LẦN của Săn Trùm và 6 Thử thách ngắn bỏ hẳn, không chuyển** (người dùng chốt 19:06). **SOLO đã bỏ (10/11)**: mục `solo` còn ẩn (`an: 1`) chỉ cho `?mode=solo` (kiểm thử) và trận hướng dẫn; bản lưu cũ chọn Solo tự chuyển sang Leo Tháp (`HM.chuan`). Mọi chế độ một người dùng bàn `solo`.

| Chế độ | Luật | Mở khoá | Thưởng | Nguồn |
|---|---|---|---|---|
| **CO-OP** — chế độ chính (HOME PLAY mặc định, 11/11) | 2 bàn: bạn + **đồng đội máy**; 3 tim chung; trùm thứ tự cố định tới wave 59; **không trần wave** — đánh tới khi hết tim (11/11, trước thắng ở wave 70) | Sau hướng dẫn | Kỷ lục, XP, nhiệm vụ, Rương Trận (theo wave, như cũ). **Mốc wave đạt LẦN ĐẦU** (11/11, thay thưởng lần đầu mỗi tầng Leo Tháp; tự phát ở màn kết quả, ghi cờ trước): wave 10: 3 000 vàng + 40 ngọc + Rương Thường · 20: 5 000 + 50 + Rương Thường×2 · 30: 7 000 + 60 + Rương Vàng · 40: 8 000 + 70 + Rương Vàng×2 + 3 Tinh thể Đỏ · 50: 10 000 + 80 + Rương HH · 60: 10 000 + 80 + Rương HH×2 · 70: 12 500 + 80 + Rương HH×2 + 5 Tinh thể Đỏ (tổng = tổng thưởng lần đầu 100 tầng cũ; đã duyệt 11/11). **Cấp phi công ≤ 5: đồng đội máy dùng bộ cố định** Sniper, Gatling, Tesla, Revolver, Laser (toàn ụ gây sát thương Trắng / Xanh, `MOIC`) thay vì bộ ngẫu nhiên. Chơi và nhận thưởng không giới hạn lượt — `chedo-dd.js: MOCWC, MOCW` | `home.js: HM.CHE.coop`, `boCuc('coop')` |
| **PVP** | Đấu **đối thủ máy** trên cùng chuỗi wave (hạt giống chung); hết tim trước = thua; đột tử từ wave 30. Bộ đối thủ ≥3 ụ gây sát thương, ≤1 hỗ trợ | Cấp phi công 2 | XP, nhiệm vụ. **CÚP (11/11, theo DCDW):** thắng +30, thua −20 (không âm), lưu `turret_kt.cd.cup`. **Mốc cúp cao nhất đạt lần đầu** (1 lần): 100: 500 vàng + Rương Thường · 200: 1 000 vàng + 20 ngọc · 300: 30 ngọc + Rương Thường×2 · 500: 2 000 vàng + Rương Vàng · 700: 3 000 vàng + 50 ngọc · 1 000: Rương Vàng×2 + 1 Tinh thể Đỏ · 1 300: 5 000 vàng + Rương HH · 1 600: 80 ngọc + Rương HH · 2 000: 8 000 vàng + Rương HH×2 + 2 TT Đỏ · 2 500: 10 000 vàng + Rương HH×3 + 3 TT Đỏ. **Đối thủ máy theo cúp** (`CUPC.doKho`): 0–199: bộ chỉ Trắng / Xanh, cấp thẻ 0, mana mỗi mạng ×0,6 · 200–499: tới Tím, cấp ≤ 2, mana ×0,8 · 500–999: tới Vàng, cấp = trung bình của bạn · ≥ 1 000: mọi bậc · ≥ 2 000: cấp +1. **Túi thắng:** thắng PVP → Rương Trận (thẻ) rơi 60%, tất định theo hạt trận (`CUP.roi`); thua hoặc không trúng: chỉ vàng trận. Chưa có khe rương hẹn giờ / trần 4 rương, chưa có mùa / Crystal Crown | `HM.CHE.pvp`, `deckDoiThu`, `chedo-dd.js: CUPC, CUP` |
| **ONLINE** | Phòng bạn bè **CO-OP 2 người** qua mã 4 chữ / link; sảnh chờ READY; đồng bộ "lockstep-lite" (mục 13) | Cấp phi công 4 | Như CO-OP | `online/phong.js, dongbo.js` |
| **ĐƯỜNG ĐUA** (RACE TRACK) — theo DCDW, thêm 11/11 | Bàn CO-OP: bạn + **đồng đội máy dùng cùng bộ bài của bạn**, cấp thẻ thật, **3 tim chung**. Đồng hồ **8:00**, **không chia wave**: quái ra liên tục, 2 làn luân phiên, nhịp `max(0,45; 1,5 − 1,05·t/480)` giây/con (~550 con / lượt); chuỗi quái (loại, làn, trùm nhỏ) sinh bằng `rngHat(hạt TUẦN)` → mọi người cùng chuỗi trong tuần (hạt trận — triệu hồi, kỹ năng — vẫn ngẫu nhiên mỗi lượt). Máu 1 con = `110 × hệ số loại × (1 + 0,015·g) × (1 + (g/270)^4)`, g = số quái đã diệt (con tách ra không tính). **Trùm nhỏ mỗi 120 s** (máu = 25 con thường lúc đó, lọt −2 tim). Mana mỗi mạng tăng theo "chặng" 20 s (như wave thường). **Trần 34 quái sống** lúc sinh: quá trần thì con chưa ra dồn máu + điểm vào con kế. **Điểm** = tổng cân nặng quái đã diệt (thường/bay 1 · tách 2 · khổng lồ 4 · quái tách lớn 5 · trùm nhỏ 30). Hết giờ, hết tim hoặc bỏ cuộc = dừng, **giữ điểm** (hết tim / bỏ cuộc: màn kết quả khung trung tính "RACE OVER", không phải thua). Không ghi kỷ lục wave / Rương Trận / nhiệm vụ theo wave | Sau hướng dẫn | **Mốc ĐIỂM tuần** (1 lần/tuần, đặt lại thứ Hai, ghi cờ trước khi phát): 100: 1 000 vàng + 50 ngọc · 250: 50 ngọc · 400: 2 000 vàng + 1 Tinh thể Đỏ · 550: 60 ngọc + Rương HH · 700: 2 000 vàng + 1 Tinh thể Đỏ · 850: Rương HH×2 + 1 Tinh thể Đỏ. (người dùng duyệt 11/11 19:06). Bảng xếp hạng tuần | `chedo-dd.js: DDC, DD` |
| **HƯỚNG DẪN** (màn mở đầu chỉ báo trùm wave 10) — một bản riêng (trận `solo` ẩn với bộ + luật cố định của nó, không dùng cấu hình chế độ nào); chơi lại: GAME MODE → **TUTORIAL** hoặc Settings → REPLAY TUTORIAL; xong → nút **PLAY CO-OP** | Trận đầu tiên: bộ cố định Sniper, Gatling, Frost, Tesla, Revolver + chỉ huy REINFORCE; 7 bước (mục tiêu → triệu hồi ×2 → ghép → chạm xem thông tin → chỉ huy → tự chơi → trùm); xong = hạ trùm wave 10. Bỏ qua được | Lần đầu mở game | Tặng ụ **Ice Blade**; mở bậc Trắng + Xanh, CO-OP, Leo Tháp, Thử thách | `huongdan.js: HD`, `sohuu.js: SHC.qua.hd` |

**Quy đổi sau khi bỏ Leo Tháp (11/11, người dùng đã duyệt):** mọi điều kiện đo theo TẦNG đo lại theo WAVE (CO-OP / PVP / online — `tk.wave`, `TT dem.wave`, `MH sw`); tầng đã qua vẫn tính: **tầng f ≙ wave `9 + ⌊0,62·(f−1)⌋`** (`TT.waveTuTang`), mốc wave CO-OP W coi như đã nhận nếu tầng đã qua ≥ `TT.tangTuWave(W)` (10→4, 20→20, 30→36, 40→52, 50→68, 60→84, 70→100).

| Điều kiện cũ (tầng) | Điều kiện mới (wave) |
|---|---|
| Hành trình: qua tầng 5 / 10 / 15 / 20 / 25 / 35 | đạt wave 11 / 14 / 17 / 20 / 23 / 30 |
| Nhiệm vụ ngày "qua tầng ≥ 15" · nhiệm vụ Lò rèn "qua tầng ≥ 40" | đạt wave 15 · đạt wave 30 (trong 1 trận) |
| Nhiệm vụ tuần "3 trận trong 5 tầng quanh tầng cao nhất" | 3 trận trong 5 wave quanh kỷ lục |
| Thành tựu qua tầng 40 / 70 / 100 | đạt wave 30 / 50 / 70 |
| Mốc Huyền thoại tầng 20 / 40 / 55 / 70 / 85 / 100 | wave CO-OP 20 / 30 / 40 / 50 / 60 / 70 (cặp w–t có sẵn trong `MHC.moc`) |
| Mở bậc Đỏ: LV12 + tầng 40 | LV12 + wave 30 (`TTC.doWave`) |
| Chỉ huy TWIN / CROSSFIRE / NEXUS: tầng 15 / 40 / 70 (hoặc ngọc) | wave 15 / 30 / 50 (hoặc ngọc) (`MAVUONG.mo2.wave`) |
| Thưởng lần đầu mỗi tầng (100 tầng) | 7 mốc wave CO-OP lần đầu (xem hàng CO-OP) |
| Rương Trận nhỏ mỗi lần thắng tầng · XP / điểm sự kiện theo tầng | Rương Trận / XP / điểm sự kiện theo wave của trận CO-OP / PVP (công thức có sẵn, không đổi) |
| Hồ sơ: BEST FLOOR | BEST WAVE (tầng cũ hiện nhỏ "TOWER FLOOR n") |

Ghi chú: trận Leo Tháp (đã bỏ) / Đường Đua **không ghi kỷ lục wave** (Leo Tháp không ghi `turret_best` Solo; Đường Đua không ghi kỷ lục CO-OP) (`turret_best`); kỷ lục wave Solo cũ vẫn được tính cho mọi mốc đổi sang tầng (điều kiện Đỏ, thành tựu, chỉ huy, mốc Huyền thoại).

## 5. 5 bậc và hệ số sức mạnh
Nguồn: `data.js: TIERS, CAP_VD, CAP_DO, TOC_DO` · `thebai.js: THE`.

| Bậc (code) | Tên EN | Màu | Hệ số `hs` | Cấp thẻ đầu → tối đa | Ghi chú |
|---|---|---|---|---|---|
| Trắng (`trang`) | COMMON | #e9eef4 | 1,0 | LV1 → 15 | +4% ST/cấp |
| Xanh (`xanh`) | RARE | #4fb8ff | 1,3 | LV3 → 15 | +5%/cấp |
| Tím (`tim`) | EPIC | #c77dff | 2,0 | LV6 → 15 | +7%/cấp |
| Vàng (`vang`) | LEGENDARY | #ffd23f | 2,6 | LV9 → **17** | theo vai: Tấn công +5% ST +2% tốc · Hỗ trợ +4% · Đặc biệt/Khống chế +3% mỗi cấp |
| Đỏ (`do`) | MYTHIC | #ff4b3e | 3,3 | LV11 → **17** | Tấn công +7% ST +3% tốc · Hỗ trợ +5,5% · ĐB +4%; ụ Tấn công Đỏ tốc ×1,15 |

ST đòn = `dmg gốc × hs bậc × hệ số sao × (1 + 25%·bước power-up) × hệ số cấp thẻ × (1 + buff) × …` (`dmgU`). Phân bố 97 ụ: Trắng 14 · Xanh 17 · Tím 22 · Vàng 33 · Đỏ 11. Vai: Tấn công 48 · Hỗ trợ 19 · Đặc biệt 26 · Khống chế 4 (Khống chế = ụ Đặc biệt có hiệu ứng lên đối thủ PVP, `unitpage.js: upVai`).

**Họ kỹ năng theo bậc** (`phattrien.js: HO`): Trắng = hiệu ứng cơ bản 1 mục tiêu · Xanh = lan rộng · Tím = thêm cơ chế mới · Vàng = combo/điều kiện mạnh · Đỏ = kết "WOW" + kỹ năng chủ động.

## 6. Bảng 97 ụ
Sinh tự động từ game (EN-mode cho số, VI-mode cho mô tả). Cột "1★ → 7★" là dòng hiệu ứng **chính hàm trận** in ra (`SKILLS[id].mo` / `SUP[id].chu`, qua `upBangSao`) ở cấp thẻ đầu, trước power-up/buff. "Dạng" = các dạng grow-up/biến hình trên trang ụ (`GROW`). "Chủ động": Tự kích / Chạm tay. Mô tả đầy đủ + luật ghép riêng: trang ụ (`unitpage.js: upLuatGhep, upCheDo`).

| # | id | Tên EN / VI | Bậc | Vai | Cơ chế (mô tả trong game, VI) | ST gốc · tốc | 1★ → 7★ (dòng hiệu ứng code) | Mốc sao 3/5/7★ | Dạng | Chủ động |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `bang` | Frost / Băng | Trắng | Đặc biệt | Đặc biệt: mỗi 6 s Đóng băng quái đầu 2 s (không gây sát thương). Trùm không bị đóng băng: chỉ chậm 50% trong 0.6 s. Cùng một quái không bị đóng băng lại trong 3 s | — | Every 6s freezes the lead enemy 2s (big ×0.6; bosses only 50% slow 0.6s) + 30% chill · 3s freeze immunity · F… → Every 4.5s freezes 2 lead enemies 2.5s (big ×0.6; bosses only 50% slow 0.6s) + 30% chill · 3s freeze immunity… | LONG FREEZE / QUICK FROST / DOUBLE FREEZE | — | — |
| 2 | `bomhen` | Time Bomb / Bom Hẹn Giờ | Trắng | Đặc biệt | Đặc biệt: gắn bom lên quái ngẫu nhiên. Bom nổ sau 5 s. Quái gần vụ nổ nhận thêm 10% sát thương trong vài giây | — | Every 2s sticks a 5s bomb on a random enemy · blast (37 px) weakens: +10% damage taken 4s → Every 2s sticks a 5s bomb on a random enemy · blast (55 px) weakens: +13% damage taken 6s · staggers 0.5s · 2… | LONG FUSE / SHOCKWAVE / TWIN BOMBS | — | — |
| 3 | `bua` | Hammer / Búa Đẩy | Trắng | Hỗ trợ | Hỗ trợ: ụ Tấn công Kề (4 phía) +tỉ lệ và sát thương chí mạng. Chí mạng của chúng làm quái khựng lại một chút | — | +18% crit dmg → +42% crit dmg | TUNED AURA / HEAVY HAND / QUAKE | — | — |
| 4 | `doc` | Venom / Độc | Trắng | Đặc biệt | Đặc biệt: đánh dấu quái đầu 5 s. Quái bị đánh dấu nhận thêm 12% sát thương từ mọi ụ. Sao cao đánh dấu 2 quái | — | Every 2.5s marks the lead enemy 5s: +12% damage taken from all turrets → Every 2.5s marks 2 lead enemies 5s: +12% damage taken from all turrets · mark spreads on death · marked slowe… | TWIN MARK / CONTAGION / NEUROTOXIN | — | — |
| 5 | `lien` | Gatling / Liên Thanh | Trắng | Tấn công | Bắn rất nhanh vào quái đầu. Mỗi ★ bắn nhanh hơn. Mẹo: đặt Radar cạnh nó | 4.5 · 4/s | Each ★ +14% fire rate | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 6 | `mana` | Mana Core / Máy Mana | Trắng | Đặc biệt | Không bắn. Sinh mana mỗi 7 s (sao cao: nhanh hơn, nhiều hơn). Mẹo: dùng mana để Triệu hồi | — | +9 mana / 7s → +79 mana / 5s | FAST FLOW / OVERFLOW / WELLSPRING | — | — |
| 7 | `maychem` | Guillotine / Máy Chém | Trắng | Tấn công | Mỗi phát có chút cơ hội giết ngay một quái nhỏ. Mẹo: tốt khi nhiều quái nhỏ | 16.25 · 0.8/s | Instant-kill small enemies 3.8% per shot → Instant-kill small enemies 8.2% per shot | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 8 | `nam` | Iron Fist / Nắm Đấm Sắt | Trắng | Tấn công | Cận chiến: đấm quái ở gần, rất nhanh. Mỗi cú đấm nổ lan quái quanh mục tiêu. Mẹo: đặt sát đường đi | 7.5 · 2.4/s · cận chiến 105 px | Melee range 105 px · 36 px ring blast · 2.4 hits/s → Melee range 165 px · 36 px ring blast · 6.0 hits/s | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 9 | `phagiap` | Armor Breaker / Phá Giáp | Trắng | Hỗ trợ | Hỗ trợ: mỗi 3 s phá giáp quái đầu và quái nhiều máu nhất. Ụ Tấn công Kề (4 phía) gây thêm sát thương lên chúng | — | +13% vs exposed → +31% vs exposed | TUNED AURA / DOUBLE EXPOSE / SHATTERED GUARD | — | — |
| 10 | `phun` | Scatter / Súng Phun Loạn | Trắng | Tấn công | Bắn rất nhanh vào quái ngẫu nhiên. Tốt khi quái đi đông. Mỗi ★ bắn nhanh hơn | 3.43 · 5/s | Random targets · each ★ +8% fire rate | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 11 | `set` | Tesla / Tesla | Trắng | Tấn công | Sét đánh 1 quái rồi nhảy sang quái kế. Số quái trúng = số sao (4★ = 4 quái) | 18.21 · 0.7/s | Chains to 1 enemy → Chains to 7 enemies (120 px jumps, −12% per jump) | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 12 | `sungluc` | Revolver / Súng Lục | Trắng | Tấn công | Một phát lớn vào quái đầu. Đạn trúng ngay. Mẹo: thêm hỗ trợ chí mạng hoặc sát thương | 34.5 · 0.6/s | Heavy instant shot · 20% crit → Heavy instant shot · 30% crit | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 13 | `tia` | Sniper / Bắn Tỉa | Trắng | Tấn công | Bắn quái nhiều máu nhất. +100% sát thương lên quái to và Trùm | 51.8 · 0.47/s | +100% vs big enemies & bosses | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 14 | `xucxac` | Dice Gun / Pháo May Rủi | Trắng | Tấn công | Mỗi phát gây sát thương ngẫu nhiên: 3% đến 300%. Chí mạng luôn gây 300%. Mẹo: thêm tỉ lệ chí mạng | 18.4 · 0.8/s | Each shot 3–300% damage · crit = 300% | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 15 | `chimang` | Crit Antenna / Ăng-ten Chí Mạng | Xanh | Hỗ trợ | Hỗ trợ: ô Kề (4 phía) +tỉ lệ chí mạng (+6.8% ở 1★, +22.5% ở 7★). Chí mạng gây gấp đôi sát thương | — | +7% crit → +23% crit | SHARP EYE / DEADLY EYE / CERTAIN STRIKE | — | — |
| 16 | `dichchuyen` | Teleporter / Bệ Dịch Chuyển | Xanh | Đặc biệt | Kéo lên ụ cùng sao: hai ụ đổi chỗ. Dùng được cả với ụ Hoá đá và Đóng băng. Mẹo: đưa ụ cận chiến ra sát đường | 11.76 · 0.85/s | Drag onto same-star turret: swap (move melee to the edge) · works on stone/frozen turrets too | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 17 | `drone` | Drone Bay / Drone Kéo Xa | Xanh | Tấn công | Ghép 2 Drone Kéo Xa: drone bom bay ra. Mỗi ô kéo = 1 drone, +1 mỗi 3★ (tối đa 8). Mẹo: kéo thật xa (góc này sang góc kia = 7) | 17 · 1.5/s | On merge: 1 bomb drone per cell dragged + 0 (max 8, ×18 damage, blast 46 px) · drag from far away for more dr… → Max 7★: it cannot merge again, so its merge skill no longer fires (it keeps shooting) | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 18 | `hutmana` | Mana Leech / Máy Hút Mana | Xanh | Tấn công | Bắn quái đầu. Mỗi phát trúng cho chút mana (có giới hạn mỗi giây) | 20 · 1.4/s | +0.35 mana / hit → +1.25 mana / hit | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 19 | `khuech` | Amplifier / Bộ Khuếch Đại | Xanh | Hỗ trợ | Hỗ trợ: ụ Tấn công Kề (4 phía) đánh lại cùng một quái thì sát thương tăng dần. Cộng dồn tới 5 đòn mỗi quái | — | +6.8% / hit ×5 → +15.9% / hit ×7 | TUNED AURA / DEEP STACKS / LOCKED IN | — | — |
| 20 | `kiembang` | Ice Blade / Kiếm Băng | Xanh | Tấn công | Gây ×5 sát thương lên quái đang chậm (×6 ở 3★, ×8 ở 7★). Mỗi đòn còn làm chậm quái quanh mục tiêu | 11.45 · 1.1/s | ×5 damage to slowed enemies · chills enemies within 44 px (20% · 2s) → ×8 damage to slowed enemies · chills enemies within 44 px (20% · 2s) · splinters | SHATTER ×6 / SPLINTERS / GLACIER | — | — |
| 21 | `lanhgia` | Chiller / Máy Phát Lạnh | Xanh | Hỗ trợ | Hỗ trợ: đòn của ô Kề (4 phía) làm chậm quái (12% ở 1★ → 28% ở 7★; Trùm tối đa 50%) | — | +12% slow → +28% slow | TUNED AURA / FROSTNIP / FLASH FREEZE | — | — |
| 22 | `laser` | Laser / Laser | Xanh | Tấn công | Giữ tia lên 1 quái. Tia mạnh dần, tới ×4 sau 3 s. Đổi mục tiêu thì lại từ ×1 | 14 · 1/s | Beam ramps to ×4 over 3s on the lead enemy (resets on switch) · beam never crits | QUICK HANDS / OVERCHARGE / APEX | — | — |
| 23 | `loa` | Cooldown Horn / Loa Hồi Chiêu | Xanh | Đặc biệt | Ghép 2 Loa Hồi Chiêu: kỹ năng Chỉ huy hồi nhanh hơn (−12 s ở 4★). Nếu đã sẵn sàng thì tốn ít mana hơn | 12.5 · 0.8/s | On merge: Commander cooldown −6s (if ready: cost −15%, not below its base cost) → Max 7★: it cannot merge again, so its merge skill no longer fires (it keeps shooting) | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 24 | `mimic` | Mimic / Mimic | Xanh | Đặc biệt | Ghép với BẤT KỲ ụ nào cùng sao. Ụ mới +tấn công trong 8 s. Mẹo: dùng để cứu bàn xấu | 9 · 1.2/s | Merges with any same-star turret · result +50% attack 8s | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 25 | `min` | Mine Layer / Bệ Rải Mìn | Xanh | Tấn công | Rải mìn trên đường. Quái giẫm lên thì mìn nổ. Đôi khi là mìn sao (×3 sát thương) | 9 · 1/s | Mine ×7 every 3.8s (with fire-rate buffs) (max 6 out) · 3.0% star mine ×3 → Mine ×7 every 1.8s (with fire-rate buffs) (max 6 out) · 6.0% star mine ×3 | QUICK HANDS / OVERCHARGE / APEX | — | — |
| 26 | `mortar` | Mortar / Súng Cối | Xanh | Tấn công | Bắn đạn cối vào quái ngẫu nhiên, nổ lan. Mỗi phát thứ 3 tách thành nhiều bom nhỏ (CHÙM) | 19.6 · 0.56/s | Splash 46 px · random targets · cluster shell in 3 | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 27 | `nangluong` | Energy Cannon / Pháo Năng Lượng | Xanh | Tấn công | Càng nhiều mana càng mạnh (+100% mỗi 120 mana, tối đa +500%). Mẹo: để dành mana | 34 · 0.7/s | Current mana → +83% (each 120 mana +100%, max +500%) | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 28 | `nhanmana` | Mana Doubler / Máy Nhân Mana | Xanh | Đặc biệt | Ghép 2 Máy Nhân Mana: nhận ngay nhiều mana. Sao cao nhận nhiều hơn | 6.23 · 1.3/s | Merge: +44 mana → Merge: +308 mana | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 29 | `radar` | Radar / Radar | Xanh | Hỗ trợ | Hỗ trợ: ô Kề (4 phía) bắn nhanh hơn (+19.5% ở 1★, +46% ở 7★) | — | +20% fire rate → +46% fire rate | TUNED AURA / LOCK-ON / OVERDRIVE | — | — |
| 30 | `tron` | Fusion Mixer / Bộ Trộn | Xanh | Hỗ trợ | Hỗ trợ: ụ Tấn công Kề (4 phía) bắn nhanh hơn. Càng nhiều loại ụ Tấn công khác nhau cùng Hàng và Cột = thưởng càng lớn | — | +9% fire rate → +21% fire rate | TUNED AURA / MIXED FIRE / PERFECT BLEND | — | — |
| 31 | `vungdoc` | Toxic Pool / Bom Vũng Độc | Xanh | Tấn công | Ném vũng độc lên đường. Quái đi qua mất máu dần | 7 · 1/s | Poison pool 32 px · 5s → 2 pools 66 px · 5s · weakens +15% | TWIN POOLS / CORROSION / TOXIC LAKE | — | — |
| 32 | `anhsang` | Lighthouse / Tháp Ánh Sáng | Tím | Tấn công | Quả cầu sáng đầy dần. Đầy thì Triệu hồi một ụ 1★ miễn phí | 12 · 0.75/s | 1 orbs · summon 1★ turret every 19 s → 7 orbs · summon 1★ turret every 10 s | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 33 | `bao` | Storm Gun / Súng Bão | Tím | Tấn công | Trúng ngay, rất nhanh. Một số đòn nhảy sang quái thứ 2 (20%). Mỗi Súng Bão kề bên thêm +5% cơ hội nhảy | 5.2 · 4.5/s | Instant hits 4.5/s · 20% arc to a 2nd enemy · each touching Storm Gun +5% arc → Instant hits 10.7/s · 20% arc to a 2nd enemy · each touching Storm Gun +5% arc | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 34 | `baotuyet` | Blizzard / Bão Tuyết | Tím | Tấn công | Vài giây một lần, bão tuyết làm chậm TẤT CẢ quái trên đường 3 s và đóng băng quái nhỏ một chút | 26 · 1/s | Every 10.4s: slow all enemies 33% for 3s (bosses max 50%) + freeze small ones 0.35s · hits all for 150% damage → Every 5.3s: slow all enemies 51% for 3s (bosses max 50%) + freeze small ones 1s · hits all for 450% damage | SQUALL / ICE SHARDS / WHITEOUT | — | — |
| 35 | `combo` | Combo Core / Lõi Combo | Tím | Tấn công | Ghép 2 Lõi Combo: MỌI Lõi Combo +sát thương vĩnh viễn (cộng dồn, không trần). Đột phá ở 5 / 10 / 20 / 40 combo. Co-op: tính thêm nửa số combo của đồng đội | 18 · 1/s | Combo ×0 → +0% damage (6% per combo) · Breakthroughs at 5/10/20/40 → Combo ×0 → +0% damage (12% per combo) · Breakthroughs at 5/10/20/40 | QUICK HANDS / DOUBLE TAP / APEX | WARM-UP → ON A ROLL → OVERDRIVE | — |
| 36 | `cuongno` | Berserker / Súng Cuồng Nộ | Tím | Tấn công | Mỗi lần chí mạng +1 NỘ. Đủ 2 NỘ thì CUỒNG NỘ: bắn nhanh hơn nhiều trong 5 s. Mẹo: thêm tỉ lệ chí mạng | 8.07 · 1.5/s | Rage 0/2 · frenzy +165% fire rate → Rage 0/2 · frenzy +255% fire rate | HOT BLOOD / BLOODLUST / RAMPAGE | CALM → RAGE → FRENZY | — |
| 37 | `docton` | Lone Ace / Độc Tôn | Tím | Tấn công | Đứng một mình mạnh nhất: 4 phía trống thì bắn nhanh ×2 và chí mạng nhiều hơn | 14 · 1/s | Ace: +100% fire rate, +10% crit · keep its 4 N/E/S/W cells empty → Ace: +100% fire rate, +25% crit, pierces 1 · keep its 4 N/E/S/W cells empty | QUICK HANDS / DOUBLE TAP / DUELIST | — | — |
| 38 | `epxung` | Overclock / Bộ Ép Xung | Tím | Đặc biệt | Kéo lên ụ bắn cùng sao: ụ đó bắn nhanh hơn 90%. Làm lại được: cộng dồn | 5.62 · 1.6/s | Drag onto a same-star shooting turret: +90% fire rate (stacks) | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 39 | `hopbi` | Mystery Box / Hộp Bí Ẩn | Tím | Đặc biệt | Không bắn. Sau 58 s (46 s từ 3★) hộp mở, thành một ụ ngẫu nhiên 1–7★, không thấp hơn sao của hộp | — | Opens in 58s → random 1–7★ turret → Opens in 46s → random 6–7★ turret | QUICK OPEN / LUCKY BOX / TOP PRIZE | SEALED → UNSEALING → ABOUT TO OPEN | — |
| 40 | `kepha` | Jammer / Kẹp Phá | Tím | Khống chế | Ghép 2 Kẹp Phá. PvP: ụ đối thủ bắn chậm 40%. Co-op: ụ đồng đội bắn nhanh hơn. Chơi đơn: ụ của bạn bắn nhanh hơn | 9.3 · 1.3/s | On merge: PvP clamps 1 rival turrets −40% speed · co-op/single-player +75% speed → Max 7★: it cannot merge again, so its merge skill no longer fires (it keeps shooting) | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 41 | `khien` | Shield Gen / Máy Khiên | Tím | Hỗ trợ | Hỗ trợ: ô Kề (4 phía) có khiên. Khiên chặn 1 chiêu Trùm hoặc đòn của đối thủ, rồi hồi lại sau 18 s | — | Shield / 18s → Shield / 10s | QUICK CHARGE / FAST CHARGE / COUNTER SHIELD | — | — |
| 42 | `khoathoigian` | Chrono Lock / Khoá Thời Gian | Tím | Đặc biệt | Khoá quái đầu trong thời gian. Sát thương nó nhận được giữ lại. Hết khoá thì nổ ra một lần | 10 · 0.8/s | Every 7.5s locks the lead non-boss enemy 1.2s · release bursts 40% of stored damage (40 px) · a boss (only if… → Every 3.8s locks the lead non-boss enemy 2.5s · release bursts 95% of stored damage (40 px) · a boss (only if… | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 43 | `lienket` | Chain Link / Chuỗi Liên Kết | Tím | Tấn công | Các Chuỗi Liên Kết đứng kề nhau (4 phía) tạo thành chuỗi. Mỗi mắt thêm: +40% sát thương. Ụ Hoá đá làm đứt chuỗi. Đột phá ở 3 / 5 / 8 / 12 mắt | 19.8 · 0.9/s | Chain of 1 linked → +0% damage · Breakthroughs at 3/5/8/12 | QUICK HANDS / DOUBLE TAP / APEX | SINGLE → LINKED → CHAIN MASTER | — |
| 44 | `nangsao` | Star Lift / Bệ Nâng Sao | Tím | Hỗ trợ | Hỗ trợ: cả 4 ô Kề bắn nhanh hơn (+12% mỗi ★). Ô Kề sao thấp nhất được ×1.5. | — | +12% fire rate → +84% fire rate | LIFT / HIGH LIFT / SKY LIFT | — | — |
| 45 | `nayda` | Ricochet / Đĩa Nảy | Tím | Tấn công | Đĩa trúng 1 quái rồi nảy sang quái khác. Số lần nảy = số sao. Mỗi lần nảy đánh mạnh hơn | 11 · 1.1/s | Bounces 1× (90 px, never the same enemy) · +15% per bounce → last hit ×1.15 → Bounces 7× (90 px, never the same enemy) · +25% per bounce → last hit ×2.75 | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 46 | `nhanban` | Cloner / Máy Nhân Bản | Tím | Đặc biệt | Ghép 2 Máy Nhân Bản: được thêm một ụ 1★ miễn phí (2★ nếu ghép ra 3★ trở lên) | 11 · 1.1/s | On merge: free extra 1★ turret (2★ when the merge makes 3★+) → Max 7★: it cannot merge again, so its merge skill no longer fires (it keeps shooting) | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 47 | `nhieusong` | Signal Jammer / Máy Nhiễu Sóng | Tím | Khống chế | Ghép 2 Máy Nhiễu Sóng. PvP: ụ đối thủ bắn chậm 40% trong vài giây. Co-op: lần Triệu hồi kế của đồng đội miễn phí. Chơi đơn: mọi quái chậm 20% | 18 · 1/s | On merge (as 2★): PvP jams 1 rival turrets −40% for 3.5s + their next summon +5 mana · co-op ally next summon… → Max 7★: it cannot merge again, so its merge skill no longer fires (it keeps shooting) | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 48 | `no5` | Fifth Shot / Nỏ Năm Nhịp | Tím | Tấn công | Đếm số phát bắn. Cứ phát thứ 5 bắn 3 mũi tên nổ | 9.6 · 1.25/s | 5th shot: 3 bolts ×2 blast 34 px · 5 shots left | QUICK HANDS / OVERCHARGE / APEX | — | — |
| 49 | `santhuong` | Bounty Beacon / Đèn Săn Thưởng | Tím | Đặc biệt | Đánh dấu một quái (ưu tiên quái to). Quái bị đánh dấu chết thì bạn được thêm mana | 10 · 1/s | Every 5.0s marks 1 enemy (big first): +15% damage taken, +4 mana when killed (boss ×5; co-op: split with ally) → Every 4.2s marks 3 enemies (big first): +15% damage taken, +8 mana when killed (boss ×5; co-op: split with al… | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 50 | `taylo` | Cleanser / Máy Tẩy Lỗi | Tím | Hỗ trợ | Hỗ trợ: mỗi 12 s tẩy cho tối đa 2 ô Kề (4 phía): gỡ Đóng băng, Hoá đá, cháy. Không có gì để tẩy: ô Kề +18% sát thương | — | Cleanse ×2 / 12s → Cleanse ×3 / 9s | TUNED AURA / DEEP CLEAN / FRESH START | — | — |
| 51 | `thaukinh` | Focus Lens / Thấu Kính | Tím | Hỗ trợ | Hỗ trợ: ô Kề (4 phía) +sát thương chí mạng. Chí mạng của chúng xuyên sang quái phía sau | — | +36% crit dmg · pierce → +85% crit dmg · pierce | TUNED AURA / DOUBLE PIERCE / TRUE FOCUS | — | — |
| 52 | `tuthan` | Reaper Pillar / Cột Tử Thần | Tím | Hỗ trợ | Hỗ trợ: ô Kề (4 phía) có thể giết ngay quái thường còn dưới 30% máu | — | 12.0% instant kill → 28.2% instant kill | TUNED AURA / DEEP REAP / GRIM HARVEST | — | — |
| 53 | `xaotron` | Scrambler / Máy Xáo Trộn | Tím | Khống chế | Ghép 2 Máy Xáo Trộn. PvP: ụ đối thủ bị đổi loại ngẫu nhiên. Co-op: ụ lẻ của đồng đội thành ghép được. Chơi đơn: ụ lẻ của bạn thành ghép được | 14 · 1.35/s | On merge: PvP shuffles 1 rival turrets · co-op/single-player makes loners mergeable → Max 7★: it cannot merge again, so its merge skill no longer fires (it keeps shooting) | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 54 | `aten` | Purifier / Pháo Thanh Tẩy | Vàng | Tấn công | Gây ×8 sát thương lên quái trúng độc. Quái nó giết sẽ nổ, trúng quái gần đó. Mẹo: đi cùng Độc hoặc Bom Vũng Độc | 40 · 1/s | ×4 vs poisoned · kills explode ×2 in 50 px → ×6 vs poisoned · kills explode ×2 in 70 px (poisons) | BIG BANG / TOXIC BLAST / PURGE | — | — |
| 55 | `bienmau` | Prism Thief / Siêu Trộm Lăng Kính | Vàng | Tấn công | Mỗi ụ 1 màu: đỏ giết, vàng cho mana, lam đóng băng, lục chí mạng. Đặt 4 màu khác nhau cạnh nhau rồi vuốt qua cả 4: chúng HỢP THỂ thành 1 Lăng Kính Quang Phổ 4 màu có đủ 4 hiệu ứng. Hợp thể tiếp để mạnh hơn: mỗi lần hợp thể thêm sát thương, tốc bắn và sát thươ… | 60 · 2/s | Red prism: 8% per hit to kill a normal enemy at once · stacks 0/10 → +0% damage vs normal enemies · fusion: p… | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 56 | `canon` | Compass Cannon / Pháo La Bàn | Vàng | Tấn công | Nhận 1 hướng ngẫu nhiên (N, S, W hoặc E). Ghép 2 Pháo La Bàn để gộp hướng (N + S = NS). Sao kết quả = trung bình 2 sao, làm tròn lên. Mỗi hướng bắn 1 tên lửa đuổi. NSWE chỉ ghép với NSWE: thêm 1 nấc. Mỗi nấc: thêm nhiều sát thương, thêm sát thương chí mạng và… | 20 · 0.55/s | Directions: N · 1 homing rocket (×1.15 damage each) · merge two Compasses to combine their directions · resul… | QUICK HANDS / POLE STAR / FOUR WINDS | — | — |
| 57 | `cauvong` | Rainbow / Máy Cầu Vồng | Vàng | Hỗ trợ | Hỗ trợ: vẽ cầu vồng lên đường. Chơi đơn: quái trên vệt nhận thêm sát thương. Co-op: như vậy, trên đường của bạn. PvP: vẽ lên đường đối thủ; quái ở đó nhận ít sát thương hơn | — | +30% vs rainbow → +70% vs rainbow | TUNED AURA / DOUBLE ARC / PRISM | — | — |
| 58 | `congap` | Hatchery Gate / Cổng Ấp Nở | Vàng | Đặc biệt | Không bắn. LƯỢT GỌI = số sao lúc xuất hiện. Mỗi 11 giây dùng 1 lượt: 1 ụ 1★ ngẫu nhiên trong bộ bài hiện ra ở 1 ô trống (miễn phí: không tốn mana, không tăng giá triệu hồi). Bàn đầy: chờ, giữ lượt. Được tăng sao tại chỗ (Merge King, Star Lift, Genesis Core…)… | — | Calls a random 1★ turret from your deck into an empty cell every 11s (free) · calls left 1 (next in 11s) · ca… → Calls a random 1★ turret from your deck into an empty cell every 11s (free) · calls left 7 (next in 11s) · ca… | QUICK HANDS / OVERCHARGE / APEX | — | — |
| 59 | `cuuvi` | Nine-Tail / Cửu Vĩ | Vàng | Tấn công | Mỗi lần giết mọc một đuôi lửa. Đủ 9 đuôi thì bắn 9 hồ hoả tự đuổi quái. Đột phá ở 1 / 3 / 6 / 10 lần bắn hồ hoả | 24 · 1.2/s | Tails 0/9 (+0% fire rate) · at 9: 9 homing foxfires ×2.5 · bosses: +1 tail per 8% HP dealt · Breakthroughs at… → Tails 0/9 (+0% fire rate) · at 9: 9 homing foxfires ×5.5 · 20% double tail · nine-tail: blasts 40 px, restart… | QUICK HANDS / TWIN TAILS / NINE-TAIL | KIT → BLAZING TAILS → NINE-TAIL | — |
| 60 | `dongbo` | Sync Cannon / Pháo Đồng Bộ | Vàng | Hỗ trợ | Hỗ trợ: MỌI ụ Tấn công CÙNG SAO ở bất kỳ đâu trên bàn +sát thương (không cần đứng kề). PvP: ụ đối thủ giảm sát thương | — | +17% same-star → +41% same-star | TUNED AURA / PAIRED FIRE / LOOSE SYNC | OFFLINE → SYNCED → FULL SYNC | — |
| 61 | `guongcong` | Mirror Gate / Cổng Gương | Vàng | Hỗ trợ | Hỗ trợ (ụ riêng): ô Kề (4 phía) kháng khống chế. Mỗi 20 s: Chơi đơn: chặn 1 chiêu Trùm. PvP: phản 1 đòn của đối thủ. Co-op: chép 1 hiệu ứng ghép của đồng đội | — | 18% resist → 43% resist | TUNED AURA / POLISHED / TRUE MIRROR | MIRROR → TWIN PANES → SHARD HALO | — |
| 62 | `hasao` | Star Breaker / Súng Hạ Sao | Vàng | Hỗ trợ | Hỗ trợ: ụ Tấn công Kề (4 phía) +sát thương. Ụ 5★ đầu tiên mỗi wave: Chơi đơn: ụ Tấn công yếu nhất của bạn +8% tốc bắn. Co-op: ụ yếu nhất của đồng đội +8%. PvP: ụ 5★ đầu tiên của đối thủ −8% tốc bắn | — | +23% damage → +54% damage | TUNED AURA / BREAK POINT / STAR SHATTER | — | — |
| 63 | `hopca` | Quantum Choir / Hợp Xướng Lượng Tử | Vàng | Tấn công | HOÀ ÂM: mỗi ụ kề (trên, dưới, trái, phải) cùng số ★ cho +100% sát thương và +8% ST chí mạng. 2: bắn thêm quái thứ 2. 3: +30% tốc bắn. 4: +50% ST chí mạng và đòn vang | 32 · 2/s | Harmony 0/4 → +0% damage, +0% crit damage · each touching turret (up, down, left, right) with the same ★ = 1… → Harmony 0/4 → +0% damage, +0% crit damage, +25% fire rate · each touching turret (up, down, left, right) with… | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 64 | `hydra` | Hydra / Hydra | Vàng | Tấn công | Mỗi sao 1 đầu. Các đầu bắn một chuỗi đạn rồi nghỉ. Không nâng cấp mana. Tự kích khi đông quái: MỌI Hydra từ 3★ bắn nhanh gấp đôi; Hydra 7★ thành SÚNG MÁY (10 phát/giây trong 7,5 giây, lâu hơn theo cấp thẻ). Giá: 40 mana, gấp đôi mỗi lần dùng | 40 · 1/s | 1 head: 1 shot (43% damage), rest 2.1s · no mana power-up · card skill works from 3★ → 7 heads: a chain of 7 shots (91% each, 0.15s apart), rest 1.6s · no mana power-up · auto when crowded (40 man… | FRENZY / DOUBLE TAP / MACHINE GUN | HATCHLING → MANY HEADS → SEVEN HEADS | Tự kích |
| 65 | `loren` | Twin Anvil / Đe Song Sinh | Vàng | Đặc biệt | Đặc biệt: mỗi Anvil là dạng Sát thương hoặc dạng Tốc. Kéo lên Anvil CÙNG dạng để cộng dồn (tối đa 14, có rủi ro: hỏng thì mất ụ kéo). Kéo lên ụ **SÁT CẠNH nó (không chéo — 12/11)**: ụ đó +3% sát thương hoặc +2% tốc bắn mỗi cộng dồn, vĩnh viễn (mất nếu ụ đó đem ghép). **SONG SINH (TWIN-FORGED, 12/11):** 1 ụ mang được cả rèn ST và rèn tốc; cộng dồn BẰNG NHAU → giữ cả hai, mỗi buff ×1,25 (`SKILLS.loren.SONG`); lệch → chỉ giữ loại có cộng dồn lớn hơn; cùng loại giữ cộng dồn lớn hơn. **Mỗi ★ Anvil nhận tại chỗ (Merge King, Star Lift…) = +1 cộng dồn** (trần 14, hạ sao không trừ). Anvil + Anvil cùng dạng không cần sát cạnh | — | Damage anvil · stacks 1/14 · drag onto another turret: it gets +3% damage for good (3% per stack; one buff ty… → Damage anvil · stacks 7/14 · drag onto another turret: it gets +21% damage for good (3% per stack; one buff t… | QUICK HANDS / OVERCHARGE / APEX | — | — |
| 66 | `lualien` | Ember Relay / Lửa Thập Tự | Vàng | Tấn công | Lửa Thập Tự rời bàn vì bất kỳ lý do gì (bị ghép, bán, bị phá) thì lửa của nó cộng cho mọi Lửa Thập Tự cùng hàng và cột. Ghép 2 Lửa Thập Tự: mọi Lửa Thập Tự khác cùng hàng và cột với ô ghép nhận lửa của cả 2. Ụ vẫn ở lại (hoá đá, đóng băng, bị biến hình, bị tr… | 30 · 1.8/s | Flames 0/90 → +0% damage, +0% crit chance, +0% crit damage, +0% fire rate · each flame: +8% damage, +0.4% cri… | QUICK HANDS / DOUBLE TAP / APEX | EMBER → KINDLED → FULL BLAZE | — |
| 67 | `luoicheo` | Resonance Grid / Lưới Cộng Hưởng | Vàng | Hỗ trợ | Hỗ trợ: buff 4 ô CHÉO (góc), không phải 4 phía. Đủ 4 ô chéo = CỘNG HƯỞNG (thưởng lớn hơn) | — | +16% damage (diagonal) → +38% damage (diagonal) | TUNED AURA / RESONANCE LINK / GRAND RESONANCE | IDLE → HUMMING → RESONANCE | — |
| 68 | `luutru` | Fusion Archive / Kho Lưu Hợp Nhất | Vàng | Tấn công | Mỗi lần ghép thật trên bàn cho +1 điểm vào MỘT Archive ngẫu nhiên. Mỗi điểm +10% sát thương. Thưởng ở 10 / 20 / 30 / 40 điểm (tối đa 40, thêm ở cấp thẻ LV11/13/15). Đem ghép một Archive thì toàn bộ điểm của nó dồn sang Archive có nhiều điểm nhất của bạn | 24 · 2/s | Charges 0/40 → +0% damage · every real merge on your board gives +1 charge to one random Fusion Archive (it f… | QUICK HANDS / DOUBLE TAP / APEX | EMPTY SHELVES → FILING → GRAND ARCHIVE | — |
| 69 | `marionette` | Marionette / Rối Máy | Vàng | Đặc biệt | Bắt một quái và bắt nó đi lùi. Trên đường nó đâm quái khác, rồi phát nổ | 9 · 0.8/s | Every 10s controls 1 enemy (no big ones): walks it back 2s, rams others for 30% of its HP (max ×4 damage), th… → Every 5.8s controls 2 enemies (big ones too): walks it back 5s, rams others for 30% of its HP (max ×4 damage)… | QUICK HANDS / DOUBLE TAP / TWIN PUPPETS | STRINGS → GOLDEN HAND → TWIN PUPPETS | — |
| 70 | `mauhut` | Blood Circuit / Mạch Máu | Vàng | Tấn công | Tấn công: bắn đạn máu vào quái đầu. Kéo lên 1 ụ của mình để ĐÁNH DẤU: sau 5 s + 3 s mỗi ★ ụ đó bị nuốt, +5 Máu mỗi ★ (cấp thẻ càng cao: nuốt càng nhanh). Mỗi Máu cho nó +5% sát thương, +0.6% tốc bắn, +0.2% chí mạng và +1% ST chí mạng, không giới hạn. Ở 20 / 5… | 50 · 1.3/s | Blood 0 (blood circuit) → +0% damage, +0% fire rate, +0% crit chance, +0% crit damage · next form at 20 Blood… | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 71 | `nemesis` | Nemesis / Nữ Thần Phán Xử | Vàng | Tấn công | Mỗi đòn thêm 1.5% máu tối đa (tăng theo ★). Mỗi 10 đòn có một PHÁN QUYẾT. Trúng quái thường nhiều hơn: +4% tốc bắn vĩnh viễn (tối đa +60%). Tinh anh/trùm nhiều hơn hoặc hoà: +15% sát thương vĩnh viễn (tối đa +250%) | 50 · 0.8/s | +0.5% max HP per hit · verdict every 10 hits (0/10): more normal enemies → +4% fire rate (now +0%, cap 60%);… → +2.0% max HP per hit (bosses 1.2%) · verdict every 10 hits (0/10): more normal enemies → +4% fire rate (now +… | QUICK HANDS / DOUBLE TAP / APEX | SCALES → SCYTHE → VERDICT | — |
| 72 | `ngoisao` | Star Cannon / Pháo Ngôi Sao | Vàng | Tấn công | Đếm tổng ★ đang có trên bàn. Mỗi 10★: bắn nhanh và mạnh hơn. Mỗi 50★: mạnh hơn nhiều. Tổng sao giảm thì thưởng cũng giảm | 40 · 1.1/s | Live board ★ 1/10 (speed) · now +0% fire rate, +0% damage (drops if your stars fall) → Live board ★ 7/10 (speed) · now +0% fire rate, +0% damage (drops if your stars fall) | QUICK HANDS / DOUBLE TAP / APEX | SPARK → NOVA → SUPERNOVA | — |
| 73 | `nguyenrua` | Hex Saboteur / Kẻ Nguyền | Vàng | Khống chế | Ghép 2 Kẻ Nguyền: lời nguyền bay ra. PvP: một ụ đối thủ có thể mất 1★. Co-op: một ụ đồng đội có thể bắn nhanh hơn 50% trong 6s. Chơi đơn: quái đầu bị chậm và nhận thêm sát thương | 13 · 1/s | Merge two: hex a random turret after 1.5s — 35% · PvP: rival −1★ (1★: disabled 2.5s) · co-op: ally turret +50… → Max 7★: it cannot merge again, so its merge skill no longer fires (it keeps shooting) | QUICK HANDS / SHARP HEX / DOOM HEX | — | — |
| 74 | `nhatthuc` | Eclipse / Nhật Thực | Vàng | Tấn công | Ngày: tia đốt cháy. Đêm: sóng làm chậm. Đổi mỗi 8 s | 15 · 1.5/s | Day: beam ×2.2 + burn 4s · swaps in 0s → Day: beam ×3.8 + burn 4s · swaps in 0s · eclipse: both modes 1.5s + ×4 ring on each swap | QUICK HANDS / DOUBLE TAP / TOTAL ECLIPSE | DUSK → CORONA → TOTAL ECLIPSE | — |
| 75 | `orbital` | Orbital / Vệ Tinh | Vàng | Đặc biệt | Đặc biệt: không bắn thường. Ghép 2 Vệ Tinh: MỌI Vệ Tinh trên bàn thức dậy 23 s và thả bom xuống quái | — | Merging Orbitals awakens every Orbital on the board for 23s: salvo of 3 bombs every 1.8s (79 area damage each) → Merging Orbitals awakens every Orbital on the board for 23s: salvo of 7 bombs every 1.5s (779 area damage eac… | QUICK HANDS / HEAVY SALVO / JUSTICE RAIN | STANDBY → UPLINK → AWAKENED | — |
| 76 | `pandora` | Pandora Vault / Hộp Pandora | Vàng | Đặc biệt | Ghép 2 Hộp Pandora: hộp mở 1 trong 6 hiệu ứng lớn (mana, Đóng băng hết, +1★, bom, khiên, cuồng nộ). Quà +1★ chỉ có cách một vòng 6 lần mở (vòng kia ra bom). Co-op: vài hiệu ứng giúp cả đồng đội | 10 · 0.9/s | On merge: opens the vault — 1 of 6 (mana rain · freeze all · +1★ gift · 5 bombs · 5 shields · frenzy) → Max 7★: it cannot merge again, so its merge skill no longer fires (it keeps shooting) | QUICK HANDS / LUCKY SPIN / OPEN VAULT | LOCKED → AJAR → OPEN VAULT | — |
| 77 | `railgun` | Salvo Battery / Pháo Loạt Salvo | Vàng | Tấn công | Bingo: càng nhiều Salvo cùng Hàng càng mạnh (3/5 +25%, 4/5 +65%, đủ hàng +240%). Càng nhiều cùng Cột càng nhanh (2/3 +35%, đủ cột +150%). Ô đá làm đứt hàng | 46.2 · 0.5/s | Salvos in this row 1/5 → +0% damage · in this column 1/3 → +0% fire rate · row 3/5 +25%, 4/5 +65%, 5/5 +200%… | QUICK HANDS / OVERCHARGE / APEX | — | — |
| 78 | `saochep` | Copycat / Máy Sao Chép | Vàng | Đặc biệt | Kéo lên ụ cùng sao: thành bản sao 70% sát thương. Dùng được cả với ụ Hoá đá, nhưng không với ụ Đóng băng. Đặc tính ngẫu nhiên được quay lại; buff riêng của Copycat mất. Ghép đặc biệt cùng loại (La Bàn, Anvil, Merge King, hợp thể Prism) theo ụ đích: vào bản sa… | 13.33 · 1.2/s | Drag onto a same-star turret (stone too, not frozen): becomes a copy at 70% damage · random traits (colour, d… | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 79 | `sinhdoi` | Twin Maker / Máy Sinh Đôi | Vàng | Đặc biệt | Ghép 2 Máy Sinh Đôi: được thêm một ụ ngẫu nhiên cùng sao (10%: cao hơn một ★) | 7.86 · 1.4/s | On merge: also summons a random 1★ turret (10%: 2★ instead) → Max 7★: it cannot merge again, so its merge skill no longer fires (it keeps shooting) | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 80 | `soi` | Werewolf / Sói Máy | Vàng | Tấn công | Súng sói. Bản thường: 1 nòng, 1 phát mỗi 1.2 s. Mỗi đòn trúng đánh lan 100% sát thương lên quái trong 1 ô. Mỗi lần Triệu hồi hoặc Ghép có 30% ra bản THỨC TỈNH: há mồm 3 nòng, loạt 3 viên mỗi 0.8 s, luôn chí mạng, đánh lan 120% trong 1.2 ô | 45 · 0.83/s | Normal: one barrel, 1 shot every 1.2s · splash 70% to enemies within 1 tile (crits only if the shot crits) ·… → Normal: one barrel, 1 shot every 1.2s · splash 70% to enemies within 1 tile (crits only if the shot crits) ·… | KEEN FANGS / FERAL / ALPHA HOWL | NORMAL hoặc AWAKENED | — |
| 81 | `thanhdia` | Sanctum / Thánh Địa | Vàng | Hỗ trợ | Hỗ trợ: khi xuất hiện, tẩy và tạo khiên cho ô Kề (4 phía). Ụ Tấn công Kề +sát thương. Khiên hồi lại theo thời gian | — | +23% damage · shield → +54% damage · shield | TUNED AURA / WIDE SANCTUM / HOLY GROUND | — | — |
| 82 | `tienhoa` | Evolver / Trứng Tiến Hoá | Vàng | Đặc biệt | Không bắn. Quả trứng nở thành 1 ụ ngẫu nhiên +1★ sau 10 s + 2 s mỗi ★. Trứng 6★ cháy thành trứng 7★ không bao giờ nở: tự tái chế lấy +20 mana | — | Egg hatches in 12s → a random turret from your deck at 2★ · time = 10s + 2s per ★ · frozen or stone: the time… → Burnt egg: it never hatches and does not shoot · it recycles itself: +20 mana | QUICK HANDS / OVERCHARGE / BURNT EGG | EGG → EGG → EGG | Tự kích |
| 83 | `tudo` | Wild Link / Khớp Nối Vạn Năng | Vàng | Đặc biệt | Ghép với BẤT KỲ ụ nào: mọi loại, mọi sao. Kết quả: 1 ụ ngẫu nhiên, sao = trung bình 2 ụ, làm tròn lên (3 + 4 sao = 4 sao, không thưởng sao). Tính là ghép thật (kích hoạt Twin Maker…). Ghép được cả ụ Đá và Băng: kết quả hết bị khoá | 8.5 · 1.2/s | Merges with any turret (any type, any star): a random turret, star = average of the two, rounded up (no bonus… | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 84 | `vughep` | Merge King / Vua Ghép | Vàng | Đặc biệt | Kéo lên ụ cùng sao: ụ đó +1★ và giữ nguyên loại. 10% Vua Ghép là bản VÀNG: +2★. Vua Ghép + Vua Ghép = Vua Ghép +1★ | 16.67 · 0.9/s | Drag onto same-star turret: +1★, keeps its type · 10% of summons/merges come out golden (+2★) · also on stone… | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 85 | `wallgen` | Wall Projector / Máy Dựng Tường | Vàng | Tấn công | Dựng tường trên đường. Tường chặn quái rồi nổ. Ghép 2 Máy Dựng Tường: TƯỜNG VÀNG (giữ 6 s, nổ ×6) | 26 · 1/s | Wall holds 2.7s, then explodes · on merge: golden wall holds 6s, explodes ×6 → Wall holds 4.5s, then explodes · on merge: golden wall holds 6s, explodes ×6 | QUICK HANDS / OVERCHARGE / APEX | — | — |
| 86 | `xuonganh` | Hero Foundry / Xưởng Anh Hùng | Vàng | Đặc biệt | Ghép 2 Xưởng Anh Hùng: ô đó thành ô ANH HÙNG 25 s. Ụ đứng trên ô +80% tốc bắn và +30% ST chí mạng | 7.5 · 1.3/s | Merge 2 Hero Foundries: that cell becomes a hero tile for 25s → the turret on it gets +80% fire rate and +30%… → Max 7★: it cannot merge again, so its merge skill no longer fires (it keeps shooting) | QUICK HANDS / DOUBLE TAP / APEX | — | — |
| 87 | `blackhole` | Black Hole / Hố Đen | Đỏ | Tấn công | Mở hố đen ở chỗ quái đông. Hố giữ chân chúng rồi nghiền nát. Từ 3★, chạm (30 mana): SỤP ĐỔ KỲ DỊ làm hố kế tiếp to và mạnh hơn | 90 · 1/s | Every 10.0s a black hole (radius 68 px) holds enemies in place 1.2s (elites 0.6s, bosses not held), then crus… → Every 7.0s a black hole (radius 92 px) holds enemies in place 1.2s (elites 0.6s, bosses not held), then crush… | SINGULARITY / OVERCHARGE / APEX | — | Chạm tay |
| 88 | `chuato` | Hive Queen / Chúa Tổ | Đỏ | Tấn công | Drone bay vòng quanh tổ (1 con mỗi sao). Đủ bầy thì cả bầy bay ra; càng nhiều drone càng đau. Từ 3★, tự kích khi đầy: BẦY ĐÀN — thả hết ngay, +35% sát thương | 80 · 1/s | 0/1 drones circling · full brood every 1.92s, then all fly out: 85% damage each, +8% per extra drone · swarm… → 0/7 drones circling · full brood every 7.09s, then all fly out: 175% damage each, +8% per extra drone · auto… | SWARM / OVERCHARGE / FULL BROOD | NEST → HIVE → ROYAL HIVE | Tự kích |
| 89 | `cobac` | Lucky Slot / Máy Xèng | Đỏ | Tấn công | Quay 3 cuộn trái cây khi xuất hiện (triệu hồi hoặc ghép). Ra cặp = +1 điểm cho quả đó; 3 ô giống nhau = JACKPOT: +2 cho mọi quả. Không trùng = quay lại. Điểm dùng chung cho mọi Máy Xèng. Cam = sát thương, Dưa hấu = tốc bắn, Nho = sát thương chí mạng. Tăng sao… | 38 · 1/s | Spins 3 fruit reels when it appears (summon or merge). A pair = +1 point to that fruit; 3 of a kind = jackpot… | QUICK HANDS / DOUBLE TAP / APEX | SLOT → HIGH ROLLER → GRAND CASINO | — |
| 90 | `khoisinh` | Genesis Core / Lõi Khởi Sinh | Đỏ | Đặc biệt | Không bắn. Theo đồng hồ (11,3 s ở thẻ LV11 → 9,7 s LV17), tặng +1★ cho ụ sao thấp nhất ở ô trên/dưới/trái/phải (trừ ụ 7★, ụ hoá đá hoặc đóng băng). Số lượt tặng = số sao lúc xuất hiện; tặng hết lượt thì tự vỡ. Không ụ kề nào nhận được sao: chờ, không mất lượt. Từ 4★: 4 ô kề +15% sát thương. Từ 3★, tự kích (30 mana): KHỞI NGUYÊN gọi 1 ụ 1★ vào ô trống kề | — | +1★ to the lowest-star turret above/below/left/right every 11.32s · next gift in 11s · gifts left 1 (= its stars when it appea… → … gifts left 7 … · neighbours +15% damage · … · **Trên bàn (10/11):** tấm đếm đáy ô ★×lượt còn (còn 1 → chữ đỏ cam) + thanh đồng hồ hồng (hổ phách nhấp nháy = đang chờ) · ụ kề sắp được +1★: khung hồng + mũi tên + "+1★" · 4★+: kiếm nhỏ góc ô kề được +15% + xung nhẹ · bảng chạm: "Gifts left N · next +1★ in Ns" / "WAITING: no neighbour to raise" | GENESIS / BLOOM / APEX | SEED → BLOSSOM → LOTUS OF LIFE | Tự kích |
| 91 | `leviathan` | Leviathan / Thuỷ Quái | Đỏ | Tấn công | Nuốt quái nhỏ lấy điểm ABYSS: mỗi điểm +6% sát thương (không trần). Hạ tinh anh +3, hạ Trùm +10. Mỗi Leviathan giữ điểm riêng; ụ mới (kể cả ụ ra từ Ghép) bắt đầu từ 0. Từ 3★, tự kích khi đầy: HƠI THỞ THỦY TRIỀU — nước mưa xuống khắp đường | 24 · 0.9/s | Abyss 0 · +0% damage · this turret only (a new one starts at 0) · its kills: elite +3, boss +10 · devours a s… → Abyss 0 · +0% damage · this turret only (a new one starts at 0) · its kills: elite +3, boss +10 · devours a s… | TIDAL BREATH / DEEP MAW / ABYSS LORD | HATCHLING → DEEP ONE → ABYSS LORD | Tự kích |
| 92 | `lophanung` | Cryo Reactor / Lò Phản Ứng Băng | Đỏ | Hỗ trợ | Hỗ trợ: khí lạnh làm chậm quái ở gần. Ụ Tấn công Kề (4 phía) đánh quái đang chậm mạnh hơn. Tự kích khi đầy: ĐÓNG BĂNG quái ở gần | — | +34% vs slowed → +79% vs slowed | COLD FRONT / DEEP COLD / ABSOLUTE ZERO | IDLE CORE → HEATING → CRYO STORM READY | Tự kích |
| 93 | `ngaithoigian` | Chrono Throne / Ngai Thời Gian | Đỏ | Đặc biệt | Quái trên đường chậm dần theo thời gian. Từ 3★, tự kích khi đầy: TUA NGƯỢC đẩy mọi quái lùi lại. Co-op: tua ngược cả hai đường | 16 · 0.8/s | Enemies slow 1%/s alive, up to 15% (bosses 20%) · piercing hands · rewind unlocks at 3★ → Enemies slow 1%/s alive, up to 35% (bosses 20%) · piercing hands · auto when full: rewind 30% of path (bosses… | REWIND / DOUBLE TAP / TIME RESTORED | DIAL → TWELVE HOURS → THRONE OF TIME | Tự kích |
| 94 | `overlord` | Overlord / Overlord | Đỏ | Tấn công | Nạp chậm, rồi bắn một đòn sấm lớn vào cả nhóm quái. Sau đó tia lửa nhảy sang thêm quái | 22.4 · 1/s | Charge 5.6s · thunder ×9 in 92 px · aftershock arcs ×2 to 4 more → Charge 2.7s · thunder ×9 in 92 px · aftershock arcs ×2 to 4 more | QUICK HANDS / OVERCHARGE / APEX | DORMANT → CHARGING → OVERCHARGED | — |
| 95 | `ronglua` | Wyrm Engine / Rồng Máy | Đỏ | Tấn công | LÒ PHẢN ỨNG: phun 1 TIA LỬA mảnh vào quái đầu, xuyên mọi quái trên đường tia và thiêu chúng; mỗi nhịp tia trúng tích Nhiệt (không trần, nguội 2%/giây); ghép thật cùng hàng hoặc cột +5 × ★ nhiệt. Mỗi nhiệt +0.2% sát thương · 100 nhiệt: +25% tốc phun · 250 nhiệ… | 8.5 · 5/s | Hatchling engine · Heat 0 → +0% damage · fire beam to the front enemy, pierces every enemy on the line (130 p… → Inferno dragon · Heat 0 → +0% damage · fire beam to the front enemy, pierces every enemy on the line (304 px)… | WINGED WYRM / ARMORED DRAGON / INFERNO DRAGON | Hatchling Engine → Winged Wyrm → Armored Dragon → Inferno Dragon | Tự kích |
| 96 | `thacmana` | Arcane Cascade / Thác Mana | Đỏ | Tấn công | Súng cầu mana mạnh theo MANA bạn đang giữ. Bắn quái đầu rồi nảy sang các quái gần nhất (−10% mỗi lần nảy). Sát thương × (1 + 1 × √(mana/100)), không trần. Ở 100 / 300 / 600 / 1000 / 2000 / 4000 mana trúng 2 / 3 / 4 / 5 / 6 / 8 quái, sau đó mỗi lần gấp đôi +… | 20 · 1/s | Mana 100 → ×1.50 damage, hits 2 enemies (next at 300 mana) · mana orb bounces to the nearest enemy (125 px, −… → Mana 100 → ×1.50 damage, hits 2 enemies (next at 300 mana) · mana orb bounces to the nearest enemy (125 px, −… | MANA FLOOD / DOUBLE TAP / APEX | — | Chạm tay |
| 97 | `bocap` | Crimson Sting / Bọ Cạp Hồng Ngọc | Đỏ | Tấn công | Mỗi lần CHÍNH ụ này bắn chí mạng: +1 STING, không trần. Mỗi STING: +13% sát thương và +1% ST chí mạng; tốc bắn cũng tăng dần (tiến tới +100%). Chỉ đánh 1 quái. Ụ mới (kể cả ghép ra) bắt đầu từ 0; bị hạ sao thì mất hết STING. Hoá đá / đóng băng: giữ nguyên. Đặt cạnh ụ hỗ trợ chí mạng để tích nhanh hơn | 22 · 2/s | Each own crit: +1 STING · +13% damage, +1% crit damage each → … · +5% crit chance · every 3rd crit: +2 · crits mark the enemy 3s: +10% from this turret | KEEN STINGER / DOUBLE DOSE / VENOM MARK | STINGLET → VENOM SURGE → KING SCORPION | — |

> **Crimson Sting (`bocap`, ụ 97 — 10/11, lên ĐỎ 11/11, `skills7.js: SKILLS.bocap`).** Đỏ Tấn công (ST gốc 22, tốc gốc 2/s giữ như lúc Vàng; bậc Đỏ tự cho hs 3,3, tốc ×1,15, thẻ +7% ST +3% tốc mỗi cấp), đơn mục tiêu (quái đầu), **không lan** (kim đổi sang 1 quái gần đó nếu quái đích chết lúc kim còn bay — vẫn 1 kim 1 quái). Chí mạng thường (10%, ×200%). **Mỗi chí mạng của CHÍNH ụ đó +1 STING, KHÔNG TRẦN**; mỗi STING: **+13% ST** (LV11; +0,5%/cấp thẻ → LV17 +16%, `KY_NANG_CAP.bocap` — lúc còn Vàng: LV9 16% → LV17 20%), **+1% ST chí mạng**, tốc bắn **+100% × n/(n + 250)** (≈ +0,4%/STING lúc đầu, 250 STING = +50%, tiệm cận +100% — không tự bùng nổ). Ụ mới (triệu hồi / ghép ra / biến hình ra) = 0; **bị hạ sao = mất hết** (ngoại lệ có chủ ý của nguyên tắc "−★ không đặt lại"); +★ tại chỗ giữ; hoá đá / đóng băng không bắn nên không tích, không mất. Hỗ trợ chí mạng kề (Crit Antenna, Hammer, Focus Lens) làm tích nhanh hơn — chủ ý. **Mốc sao riêng:** 3★ KEEN STINGER +5% chí mạng · 5★ DOUBLE DOSE mỗi chí mạng thứ 3 cho +2 STING (đếm, tất định) · 7★ VENOM MARK chí mạng đánh dấu quái 3 s: nhận +10% ST từ chính ụ này (không có mốc chung QUICK HANDS / DOUBLE TAP / APEX). **3 dạng theo STING:** 0–49 STINGLET · 50–199 VENOM SURGE · 200+ KING SCORPION (kỳ vọng ụ giữ lâu ≈59 ở wave 20, ≈201 ở wave 40). Tấm đếm đáy ô: icon ngòi hồng ngọc + số STING. Online: chí mạng do `trung()` quyết bằng `rngLuat`; cờ ô `G<sting>;J<đếm chí mạng>;` (`dongbo.js oTT/datO`). Mở ở cấp phi công **14** (nhóm Firestorm, cùng Overlord) + qua tầng 40 Leo Tháp như mọi thẻ Đỏ; rơi từ nguồn Đỏ (Mythic Chest…); tối đa 1 Đỏ / bộ bài. **Thẻ đã có lúc còn Vàng** (`thebai.js: THEBAI.doiBac`, cờ `turret_the.bd.bocap`): giữ sở hữu + bản sao; cấp thẻ giữ số bước đã lên (Vàng LV9+k → Đỏ LV11+k, tối đa LV17; bước 7–8 hoàn bản sao); bộ bài đã lưu có Crimson Sting + 1 ụ Đỏ khác → gỡ Crimson Sting khỏi bộ đó. **Hình (11/11):** bệ Đỏ dùng chung hình bệ của Black Hole (`bocap_de` / `_vien`), thân bọ cạp chuyển tím-chàm → đỏ thẫm bằng xử lý màu (`tools/thap-bocap-do.py`), viền vàng + ngòi hồng ngọc giữ. **Cân bằng** (`tools/thap-can-bang-so.js`, Đỏ độ khó 3, dải 5.1–5.5; giả định STING tính lại theo tốc ×1,15: 3 ụ giữ lâu 69 / 235 / 451, còn lại 19 / 41 / 153): w20 **3.72** · w40 **5.10** · w60 **8.06** → tổng **5.35** (đạt). Chỉ đổi bậc mà giữ 16%/STING thì tổng 6.00 (vượt dải) → hạ 16% → 13% ở cấp đầu. **Mô phỏng 1 ụ 7★ sống 10 phút** (`tools/thap-do-bocap.js`, wave 60, power-up MAX, thẻ LV11, 3 hạt, tự tích từ 0): không hỗ trợ — STING 56 / 108 / 241 / 479 ở phút 1 / 2 / 5 / 10, ST/giây phút cuối ≈ 325 nghìn (TB 232 nghìn); có Crit Antenna + Hammer + Focus Lens kề (chí mạng 55%) — STING 162 / 326 / 835 / 1 587, ST/giây phút cuối ≈ 2,35 triệu (TB 1,81 triệu, ≈ 7,8×). Chưa có luật hãm cho trường hợp có hỗ trợ (chờ người dùng quyết).

> **Cân bằng đợt 2 (10/11):** cột "ST gốc" và cột mô tả của các ụ tấn công Vàng/Đỏ đã cập nhật theo đợt 2; cột "1★ → 7★" (dòng hiệu ứng code) của các ụ đổi hệ số kỹ năng CHƯA sinh lại — số đúng xem bảng ở mục 15 hoặc trang ụ trong game.

**Ngoại lệ đáng nhớ (luật riêng, đọc trang ụ):** Pháo La Bàn (gộp hướng N/S/W/E, NSWE+NSWE = +1 stack, sao = trung bình làm tròn lên) · Prism Thief (4 màu, hợp thể bằng vuốt 4 ô) · Wild Link (ghép tự do) · Twin Anvil (Anvil + Anvil chỉ ghép cùng dạng; rèn ụ khác chỉ khi SÁT CẠNH; ST + tốc bằng cộng dồn = song sinh ×1,25; +★ tại chỗ = +1 cộng dồn) · Merge King (+★ tại chỗ, MK+MK = MK+1★) · Copycat (bản sao 70%→94% chỉ số) · Evolver (trứng; 6★ cháy thành 7★ không nở, chạm tái chế +20 mana) · Lucky Slot · Ember Relay (lửa cả hàng + cột) · Fusion Archive (ghép Archive dồn hết điểm sang Archive nhiều điểm nhất).


**Dạng (forms) và hình trên trang ụ** — trang ụ dùng ảnh `assets/<id>_nong_s1..s3.png` (có `STAGE_K`) = **cùng ảnh trong trận** (`render.js: REN.dauTen`); ụ không có ảnh dạng riêng thì 3 ô dạng dùng chung 1 ảnh đầu (khác dạng trong trận chỉ bằng hiệu ứng `growfx.js`). Sói Máy: 2 dạng `soi_dau_thuong` / `soi_dau_thuctinh` (`phattrien.js: GROW.soi.anhDang`) = đúng hình trong trận (`skills2.js`). Rồng Máy: 4 dạng hình riêng `nho/ronglua_f1..f4`.

| id | Dạng | Ảnh trang ụ |
|---|---|---|
| `overlord` | DORMANT → CHARGING → OVERCHARGED | riêng `_nong_s1..3` — HÌNH MỚI tự do 11/11 (mặt nạ quỷ đá đen sừng pha lê đỏ; tấm `raw_anime_u_tudo_t08..t14`, `tools/thap-cat-u-tudo.py`; ĐẦU ĐỨNG, lắc ±3.5°; khung 1 ô, `DAU_VE.S`) |
| `hopbi` | SEALED → UNSEALING → ABOUT TO OPEN | riêng `_nong_s1..3` |
| `tienhoa` | EGG → EGG → EGG | **dùng chung 1 ảnh** (`tienhoa_nong`) |
| `lophanung` | IDLE CORE → HEATING → CRYO STORM READY | riêng `_nong_s1..3` — HÌNH MỚI tự do 11/11 (voi ma mút băng (vòi chĩa lên); tấm `raw_anime_u_tudo_t08..t14`, `tools/thap-cat-u-tudo.py`; ĐẦU ĐỨNG, lắc ±3.5°; khung 1 ô, `DAU_VE.S`) |
| `soi` | NORMAL / AWAKENED | riêng: soi_dau_thuong, soi_dau_thuctinh |
| `orbital` | STANDBY → UPLINK → AWAKENED | riêng `_nong_s1..3` — HÌNH MỚI tự do 11/11 (cú vệ tinh; tấm `raw_anime_u_tudo_t08..t14`, `tools/thap-cat-u-tudo.py`; ĐẦU ĐỨNG, lắc ±3.5°; khung 1 ô, `DAU_VE.S`) |
| `cuongno` | CALM → RAGE → FRENZY | **dùng chung 1 đầu** `<id>_nong` — HÌNH MỚI tự do 11/11 (lợn rừng mào đỏ; tấm `raw_anime_u_tudo_t15`, 1 đầu cho cả 3 dạng: ×1 / 1,04 / 1,08 + quầng màu dạng 2/3 — `STAGE_MOT_DAU`, growfx.js mục 7; ĐẦU ĐỨNG, lắc ±3.5°) |
| `ngoisao` | SPARK → NOVA → SUPERNOVA | riêng `_nong_s1..3` |
| `lienket` | SINGLE → LINKED → CHAIN MASTER | riêng `_nong_s1..3` — HÌNH MỚI tự do 11/11 (mũ giáp xích; tấm `raw_anime_u_tudo_t08..t14`, `tools/thap-cat-u-tudo.py`; ĐẦU ĐỨNG, lắc ±3.5°; khung 1 ô, `DAU_VE.S`) |
| `dongbo` | OFFLINE → SYNCED → FULL SYNC | riêng `_nong_s1..3` — HÌNH MỚI tự do 11/11 (đồng hồ quả quýt; tấm `raw_anime_u_tudo_t08..t14`, `tools/thap-cat-u-tudo.py`; ĐẦU ĐỨNG, lắc ±3.5°; khung 1 ô, `DAU_VE.S`) |
| `hydra` | HATCHLING → MANY HEADS → SEVEN HEADS | riêng `_nong_s1..3` trên trang ụ (10/11, `STAGE_VE_TRANG`); trong trận Hydra vẫn tự vẽ vương miện n đầu = số sao |
| `cuuvi` | KIT → BLAZING TAILS → NINE-TAIL | riêng `_nong_s1..3` |
| `luoicheo` | IDLE → HUMMING → RESONANCE | riêng `_nong_s1..3` — HÌNH MỚI tự do 11/11 (chữ X vàng lõi teal, phóng lớn nhất trong ô; tấm `raw_anime_u_tudo_t08..t14`, `tools/thap-cat-u-tudo.py`; ĐẦU ĐỨNG, đứng yên; khung 1 ô, `DAU_VE.S`) |
| `ngaithoigian` | DIAL → TWELVE HOURS → THRONE OF TIME | **dùng chung 1 đầu** `<id>_nong` — HÌNH MỚI tự do 11/11 (ngai đồng hồ; tấm `raw_anime_u_tudo_t21`, 1 đầu cho cả 3 dạng: ×1 / 1,04 / 1,08 + quầng màu dạng 2/3 — `STAGE_MOT_DAU`, growfx.js mục 7; ĐẦU ĐỨNG, lắc ±3.5°) |
| `combo` | WARM-UP → ON A ROLL → OVERDRIVE | riêng `_nong_s1..3` (10/11, `STAGE_VE`) |
| `pandora` | LOCKED → AJAR → OPEN VAULT | **dùng chung 1 đầu** `<id>_nong` — HÌNH MỚI tự do 11/11 (rương hé 6 màu; tấm `raw_anime_u_tudo_t20`, 1 đầu cho cả 3 dạng: ×1 / 1,04 / 1,08 + quầng màu dạng 2/3 — `STAGE_MOT_DAU`, growfx.js mục 7; ĐẦU ĐỨNG, lắc ±3.5°) |
| `nemesis` | SCALES → SCYTHE → VERDICT | riêng `_nong_s1..3` (10/11, `STAGE_VE`) |
| `nhatthuc` | DUSK → CORONA → TOTAL ECLIPSE | riêng `_nong_s1..3` (10/11, `STAGE_VE`) |
| `marionette` | STRINGS → GOLDEN HAND → TWIN PUPPETS | **dùng chung 1 đầu** `<id>_nong` — HÌNH MỚI tự do 11/11 (tay cầm cần rối + đầu hề; tấm `raw_anime_u_tudo_t20`, 1 đầu cho cả 3 dạng: ×1 / 1,04 / 1,08 + quầng màu dạng 2/3 — `STAGE_MOT_DAU`, growfx.js mục 7; ĐẦU ĐỨNG, lắc ±3.5°) |
| `guongcong` | MIRROR → TWIN PANES → SHARD HALO | riêng `_nong_s1..3` — HÌNH MỚI tự do 11/11 (gương thần đèn; tấm `raw_anime_u_tudo_t08..t14`, `tools/thap-cat-u-tudo.py`; ĐẦU ĐỨNG, lắc ±3.5°; khung 1 ô, `DAU_VE.S`) |
| `chuato` | NEST → HIVE → ROYAL HIVE | riêng `_nong_s1..3` (10/11, `STAGE_VE`) |
| `leviathan` | HATCHLING → DEEP ONE → ABYSS LORD | riêng `_nong_s1..3` (10/11, `STAGE_VE`) |
| `khoisinh` | SEED → BLOSSOM → LOTUS OF LIFE | riêng `_nong_s1..3` (10/11, `STAGE_VE`) |
| `ronglua` | Hatchling Engine (1–2★) → Winged Wyrm (3–4★) → Armored Dragon (5–6★) → Inferno Dragon (7★) | riêng: nho/ronglua_f1, nho/ronglua_f2, nho/ronglua_f3, nho/ronglua_f4 |
| `lualien` | EMBER → KINDLED → FULL BLAZE | riêng `_nong_s1..3` (10/11, `STAGE_VE`) |
| `luutru` | EMPTY SHELVES → FILING → GRAND ARCHIVE | riêng `_nong_s1..3` (10/11, `STAGE_VE`) |
| `bocap` | STINGLET → VENOM SURGE → KING SCORPION (STING 0–49 / 50–199 / 200+) | riêng `_nong_s1..3` (10/11, `STAGE_VE`; 11/11 thân đỏ thẫm + bệ Đỏ — `tools/thap-bocap-do.py`; tấm `raw_anime_u_dang_bocap.png`, cắt `tools/thap-cat-dang-dau.py bocap` + `BIEN_HANG=310,616 tools/thap-cat-anime-u.py --dang dang_bocap bocap` cho bệ / icon / huy hiệu) |
| `cobac` | SLOT → HIGH ROLLER → GRAND CASINO | riêng `_nong_s1..3` (10/11, `STAGE_VE`) |

## 7. Cấp thẻ
Nguồn: `thebai.js: THE, THEBAI.the` · `data.js: hsThe, tocThe, heDB, KY_NANG_CAP, knGt`.

- Lên cấp = đủ **bản sao** (thẻ trùng) + **vàng**. Cấp đầu: Trắng 1 · Xanh 3 · Tím 6 · Vàng 9 · Đỏ 11. Tối đa LV15 (Vàng/Đỏ LV17).
- Bản sao cần mỗi lần lên (theo số cấp đã lên): Trắng 2,4,8,15,25,40,60,90,130,180,240,320,420,550 · Xanh 2,4,7,12,20,32,48,70,100,140,190,250 · Tím 2,3,5,8,12,18,26,36,50 · Vàng 1,2,3,5,8,12,18,26 · Đỏ 1,2,3,5,8,12.
- Vàng cần cho LV L→L+1 (theo cấp tuyệt đối): 20, 50, 100, 200, 400, 800, 1 500, 2 500, 4 000, 6 000, 9 000, 13 000, 18 000, 25 000, 35 000, 50 000 (LV1→2 … LV16→17).
- Mỗi cấp trên cấp đầu: +% sát thương theo bậc (mục 5). Ụ có mục trong **KY_NANG_CAP**: cấp thẻ nâng **chính con số kỹ năng** = `base + buoc × số cấp`, kẹp ở trần; `pu` = bước POWER-UP trong trận cho ụ không gây sát thương (cộng sau trần). `ht: 1` = ụ hỗ trợ (giá trị buff ở 1★, đường cong sao nhân lên). Trang ụ hiện "Next card level" bằng chính hàm trận (`unitpage.js: upCapSau`).

| id | Nhãn | Cấp đầu | Bước/cấp | Trần | Đơn vị | Power-up/bước |
|---|---|---|---|---|---|---|
| `bang` | Freeze | 2 | 0.07 | 2.98 | s | 0.15 |
| `bomhen` | Weaken | +10 | 0.25 | 13.5 | % | 0.75 |
| `bua` | Crit dmg | +18 | 0.54 | 25.56 | % | — |
| `doc` | Mark | +12 | 0.4 | 17.6 | % | 0.75 |
| `mana` | Mana | 100 | 4 | 156 | % | — |
| `maychem` | Execute | 3.75 | 0.15 | 5.85 | % | — |
| `phagiap` | Exposed | +13 | 0.355 | 17.964 | % | — |
| `chimang` | Crit buff | +6.75 | 0.225 | 9.45 | % | — |
| `khuech` | Per hit | +6.75 | 0.225 | 9.45 | % | — |
| `lanhgia` | Slow | 12 | 0.375 | 16.5 | % | — |
| `loa` | Cooldown | −6 | 0.33 | 9.96 | s | — |
| `mimic` | Merge buff | +50 | 2 | 74 | % | — |
| `nhanmana` | Merge mana | +44 | 2.75 | 77 |  | — |
| `radar` | Rate buff | +19.5 | 0.65 | 27.3 | % | — |
| `tron` | Rate buff | +9 | 0.3 | 12.6 | % | — |
| `epxung` | Overclock | +90 | 2.5 | 112.5 | % | — |
| `hopbi` | Opens in | 58 | -1 | 49 | s | -2 |
| `khien` | Recharge | 18 | -0.4 | 14.4 | s | -0.5 |
| `nangsao` | Rate buff | +12 | 0.6 | 17.4 | % | — |
| `taylo` | Dmg buff | +18 | 0.9 | 26.1 | % | — |
| `thaukinh` | Crit dmg | +36 | 1.548 | 49.932 | % | — |
| `tuthan` | Execute | 12 | 0.6 | 17.4 | % | — |
| `bocap` | Per STING | +13 | 0.5 | 16 | % | — |
| `canon` | Per stack | +175 | 2.5 | 195 | % | — |
| `cauvong` | Trail dmg | +29.9 | 1.196 | 39.468 | % | — |
| `dongbo` | Dmg buff | +17.25 | 0.69 | 22.77 | % | — |
| `guongcong` | Resist | 18.4 | 0.736 | 24.288 | % | — |
| `hasao` | Dmg buff | +23 | 0.92 | 30.36 | % | — |
| `loren` | Forge buff | +3 | 0.09 | 3.72 | % | 0.3 |
| `lualien` | Flame limit | 90 | 12 | 186 |  | — |
| `luoicheo` | Dmg buff | +16.1 | 0.644 | 21.252 | % | — |
| `mauhut` | Devour time | 0 | -4 | -32 | % | — |
| `ngoisao` | Milestones | 100 | 5 | 130 | % | — |
| `nguyenrua` | Hex | 35 | 2 | 47 | % | — |
| `orbital` | Awaken | 23 | 1 | 29 | s | — |
| `saochep` | Copy | 70 | 4 | 94 | % | — |
| `sinhdoi` | +1★ twin | 10 | 1 | 16 | % | — |
| `soi` | Awaken | 30 | 1.5 | 39 | % | — |
| `thanhdia` | Dmg buff | +23 | 0.92 | 30.36 | % | — |
| `tienhoa` | Hatch time | 100 | -2.43 | 80.6 | % | -3 |
| `tudo` | Bonus +1★ | 10 | 2.5 | 30 | % | — |
| `vughep` | Gold +2★ | 10 | 2 | 22 | % | — |
| `xuonganh` | Hero rate | +80 | 2.4 | 99.2 | % | — |
| `cobac` | Fruit power | 100 | 5 | 130 | % | — |
| `khoisinh` | Raise time (hiển thị: `Raise every` bằng GIÂY thật, 11.3s → 9.7s — `giay`/`tenGiay`, 10/11) | 94.3 | -2.2834 | 80.6 | % | -3 |
| `lophanung` | Slowed dmg | +33.6 | 3.36 | 47.04 | % | — |

## 8. Chỉ huy
Nguồn: `data.js: MAVUONG, LUAT_MV, mvCo, mvBac` · `chihuy.js`, `chihuy-moi.js` · chữ `text.js: TEXT.af`. Giá ×2 mỗi lần dùng (40 → 80 → 160); bậc chỉ để hiển thị (viền/khung), không đổi luật. REINFORCE: bàn thiếu chỗ → mỗi ụ thiếu = +1★ cho ụ yếu nhất; bàn đầy & mọi ụ 7★ → không dùng được, không trừ mana. TWIN/CROSSFIRE/NEXUS: chạm chỉ huy rồi chạm 1 ô.

| id | Tên (EN) | Bậc | Mana | Hồi chiêu | Tác dụng | Cách có | Mô tả trong game (EN) |
|---|---|---|---|---|---|---|---|
| `hero` | REINFORCE | Xanh | 30 (×2 mỗi lần dùng) | 15 s | tức thì | Miễn phí | Instantly summon two 1★ turrets (free); no room → +1★ to your weakest |
| `dahlia` | RAGE | Tím | 40 (×2 mỗi lần dùng) | 25 s | 10 s | Miễn phí | +100% damage to the whole board for 10s |
| `eve` | HOLY SHIELD | Vàng | 40 (×2 mỗi lần dùng) | 25 s | 8 s | Miễn phí | Clears freeze, stone & burn + blocks boss skills and rival merge effects for 8s |
| `tech` | QUICK TUNE | Trắng | 25 (×2 mỗi lần dùng) | 20 s | 10 s | Miễn phí | Your 1★ and 2★ Attack turrets fire 40% faster for 10s |
| `tide` | DRAG NET | Trắng | 30 (×2 mỗi lần dùng) | 24 s | 6 s | Miễn phí | Enemies on your path move 25% slower for 6s (bosses 12%) |
| `twin` | TWIN SIGNAL | Xanh | 35 (×2 mỗi lần dùng) | 22 s | 12 s · chọn ô | Kỷ lục wave 15 (cũ) hoặc qua tầng 15 hoặc 150 ngọc | Tap a turret that has a twin (same type and star): both deal +60% damage for 12s. Merging either twin ends the buff |
| `hawk` | CROSSFIRE | Tím | 45 (×2 mỗi lần dùng) | 28 s | 10 s · chọn ô | Kỷ lục wave 30 (cũ) hoặc qua tầng 40 hoặc 400 ngọc | Tap a cell: Attack turrets in its row and column get +20% damage for each different turret type there (max +100%) for 10s |
| `weaver` | NEXUS LINK | Vàng | 50 (×2 mỗi lần dùng) | 30 s | 11 s · chọn ô | Kỷ lục wave 50 (cũ) hoặc qua tầng 70 hoặc 1000 ngọc | Tap an Attack turret: links up to 3 Support turrets in its row or column (not next to it). Each link gives +15% damage (+5% per Support star) and +10% speed for 11s |

## 9. 12 trùm
Nguồn: `data.js: TRUM, TRUM_THU_TU` · `trum.js: TRUM_MOI, TRM, TRUM_POOL, trumTuWave` · chiêu trong `game.js` (case theo id) + `trum.js` (bọc hàm). Mỗi trùm lọt −2 tim; HOLY SHIELD / Mirror Gate chặn chiêu. (Trùm của tuần của Săn Trùm: chế độ đã bỏ 11/11.)

| id | Tên | Chiêu | Từ wave | Mô tả chiêu (EN, trong game) |
|---|---|---|---|---|
| `mad_crown` | MAD CROWN | SCRAMBLE | 10 | Turns 3 random turrets into random deck types (same star) |
| `freezer` | FREEZER | DEEP FREEZE | 10 | Freezes 3 random turrets for 6 s (+1 every 20 waves, max 5; co-op: split across both boards) |
| `janus` | JANUS CUBE | PETRIFY | 10 | Turns 1 turret to stone (stone only merges with same-star stone → a higher stone) |
| `joker_king` | JOKER KING | FORCE MERGE | 10 | Throws a Mimic onto 1 turret and forces a same-star merge |
| `nightmare` | NIGHTMARE | SNIPE | 10 | Snipes a random turret: −1★ (1★ explodes) |
| `octopus` | OCTOPUS EYES | BURN | 10 | Burns 3 turrets for 6 s: −1★ when the fire ends unless cleansed (1★ is destroyed) |
| `hive` | HIVE MOTHER | SWARM | 10 | Launches 4 drones ahead of itself (6 from wave 40) |
| `jammer` | STATIC JAMMER | JAM | 20 | **12/11: XÍCH không tự hết** — Chains 2 turrets (supports first) until you merge onto one of them: no fire, no aura, cannot be dragged. Gỡ: ghép một ụ VÀO ụ bị xích (ghép thường đúng luật / Wild Link / ghép đặc biệt `quaKhoa` như Merge King +★) → đứt cả hai. Trùm chết / lọt, xoá debuff (Cleanser, Eve…), hoá đá, ụ kia biến mất → đứt. Mỗi Jammer chỉ giữ 1 cặp xích: còn xích thì không niệm tiếp. Máy tự ưu tiên ghép gỡ. (`trum.js: XICH`; trước 12/11: câm 2 ụ 6 s) |
| `prism` | PRISM WARDEN | PRISM SHIELD | 20 | −90% damage until hit by 3 different turret types (4 from wave 40); re-shields ~8 s after breaking |
| `twin_core` | TWIN CORE | SPLIT | 30 | Splits into 2 fast cores when destroyed |
| `patcher` | PATCH TITAN | REPAIR | 30 | Heals itself 12% and every enemy in its lane 35% |
| `leech` | STAR LEECH | STAR THEFT | 40 | Steals 1★ from your top turret (2★+), then dashes. Kill it: the stolen stars return to random turrets |

Số cố định: Hive 4 drone (+2 từ wave 40) · Static Jammer 2 ụ 6 s · Prism −90% sát thương, cần 3 loại ụ (4 từ wave 40), dựng lại sau 7 s + thời gian niệm · Patch Titan hồi 12% bản thân, 35% quái cùng làn · Twin Core con: 35% máu, tốc 22 (`TRM`).

## 10. Gacha, sở hữu, rương
Nguồn: `sohuu.js: SHC, SH` · `kinhte.js: KTC.ruong, KT.moRuong` · `manh.js: MHC` · `thebai.js: THE.tiLe, soBan`.

- **Sở hữu:** chỉ ụ **đã có ≥1 bản sao** mới vào bộ bài/bộ mẫu. Người mới có **10 ụ**: Sniper, Gatling, Revolver, Frost, Tesla, Mana Core, Venom, Armor Breaker, Amplifier, Laser. Quà cụ thể: hướng dẫn → Ice Blade; Hành trình ngày 1 → Berserker, ngày 4 → Storm Gun, ngày 6 → Overclock.
- **3 trạng thái thẻ** ở lưới bộ bài/bộ sưu tập: ĐÃ CÓ · CHƯA CÓ (mờ + nguồn: Trắng/Xanh "Any chest", Tím "Gold Chest", Vàng "Gold Chest · Event", Đỏ "Mythic Chest") · CHƯA MỞ (mờ + "PILOT LV n"). Chạm vẫn mở trang ụ.
- **Mở nhóm theo cấp phi công** (ụ chưa mở **không rơi**; ụ đã có vẫn nhận bản sao): LV1 Starter Arsenal (10 ụ khởi đầu) · 2 Spread & Traps (phun, bomhen, kiembang, vungdoc) · 3 Critical Strike (xucxac, bua, nam, chimang, cuongno) · 4 Heavy Fire (maychem, mortar, radar, no5, bao) · 5 Frost & Mana (lanhgia, nhanmana, hutmana, baotuyet, santhuong) · 6 First Legends (min, lienket, epxung, railgun, soi, aten) · 7 Merge Bonus (drone, loa, nhanban, anhsang) · 8 One Big Shot (nangluong, docton, thaukinh, nemesis) · 9 Guardians (khien, taylo, nhieusong, thanhdia) · 10 Teamwork (tuthan, nayda, dongbo, hydra) · 11 Tricksters (mimic, tron, dichchuyen, xaotron) · 12 Eternal Frost (kepha, nhatthuc, lophanung) · 13 Starlight (nangsao, ngoisao, hasao) · 14 Firestorm (cuuvi, bienmau, overlord, bocap) · 15 Path Control (khoathoigian, wallgen, marionette, blackhole) · 16 Swarm (combo, sinhdoi, chuato) · 17 Merge Workshop (luutru, congap, vughep) · 18 Star Forge (loren, hopca, khoisinh) · 19 Resonance (cauvong, xuonganh, luoicheo, thacmana) · 20 Big Guns (canon, orbital, leviathan) · 21 Shapeshifters (hopbi, tienhoa, saochep) · 22 Dark Wards (guongcong, nguyenrua, ngaithoigian) · 23 Dragonfire (lualien, mauhut, ronglua) · 24 Wild Cards (tudo, pandora, cobac).
- **Khoá bậc theo cấp phi công** (`tientrinh.js: TTC.moBac`): Trắng + Xanh sau hướng dẫn · Tím LV3 · Vàng LV6 · **Đỏ LV12 VÀ đã qua tầng 40 Leo Tháp** (`TTC.doTang`; người cũ: kỷ lục Solo ≥ wave 30). Ụ Đỏ trong nhóm chỉ rơi khi đạt điều kiện Đỏ.
- **Rương** (tỉ lệ % độ hiếm MỖI thẻ, công khai bằng nút (i)):

| Rương | Giá | Số thẻ | Trắng | Xanh | Tím | Vàng | Đỏ | Bảo đảm / bảo hiểm |
|---|---|---|---|---|---|---|---|---|
| NORMAL | 2 000 vàng | 6 | 62 | 29 | 8,5 | 0,5 | 0 | — |
| GOLD | 500 ngọc | 8 | 44 | 36 | 16 | 3,8 | 0,2 | ≥1 Tím mỗi rương; **6 rương liền không Vàng → rương thứ 7 chắc Vàng** (`pityV: 7`, 11/11 theo DCDW; trước: thứ 10), ra sớm thì đếm lại từ 0, bộ đếm hiện ở SHOP ("Legendary in ≤ n"); 120 rương không Đỏ → chắc Đỏ |
| MYTHIC | 6 000 ngọc | 12 | 30 | 38 | 24 | 7 | 1 | ≥1 Đỏ + ≥2 Vàng mỗi rương (mở khi đạt điều kiện Đỏ) |
| EVENT (thưởng) | không bán | 3 + 1 Vàng nổi bật | 35 | 40 | 25 | — | — | ô cố định |
| LEGENDARY (thưởng) | không bán | 2 + n Vàng | 40 | 40 | 20 | — | — | ô cố định |
| ANCIENT (thưởng) | không bán | 2 + n Đỏ | — | 40 | 60 | — | — | ô cố định |

  Số bản mỗi thẻ: Trắng 4–8 · Xanh 2–4 · Tím 1–2 · Vàng/Đỏ 1 (`KTC.ruongBan`). Mọi kết quả **tất định theo hạt** (mã người chơi + bộ đếm) — tải lại không quay lại được.
- **Túi thưởng cuối trận** (`THE.tiLe`): Trắng 58 · Xanh 29 · Tím 11 · Vàng 1,8 · Đỏ 0,2 %.
- **Nguồn mảnh Vàng/Đỏ** (`manh.js: MHC`): mốc Leo Tháp lần đầu tầng 20 (HH×1) · 40 (HH×2) · 55 (HH×3) · 70 (HH×3 + CĐ×1) · 85 (HH×4 + CĐ×1) · 100 (HH×5 + CĐ×2); hạ mỗi trùm lần đầu = Rương HH; hạ đủ 12 trùm = Rương Cổ đại; nhiệm vụ ngày "Clear floor 40 or higher" = Rương HH.

## 11. Kinh tế
Nguồn: `kinhte.js: KTC` · `manh.js: MHC.ren, MHC.an` · `chedo-c.js: CDC.anDo` · `thebai.js`. **Không có nạp tiền thật** (`KTC.goiNgoc = []`, `skPremium = null`).

- **Vàng:** thưởng trận/nhiệm vụ/tầng; dùng lên cấp thẻ, Rương Thường, Daily Specials, lò rèn, Ấn. **Ngọc:** chỉ kiếm bằng chơi; dùng Rương Vàng/Thần thoại, vòng quay, đổi vàng (100→1 000 · 500→5 500 · 1 500→18 000), mở chỉ huy. **Tinh thể Đỏ:** tầng 50 (3), 100 (5), mốc điểm tuần Đường Đua 400 / 700 / 850 (1 mỗi mốc = 3/tuần). (Trước 11/11: Săn Trùm đủ trùm bậc 10, trùm của tuần bậc 9, Vô tận wave 100, Tuần wave 45 — các chế độ đó đã bỏ.)
- **Daily Specials** (6 ô, đổi 0 giờ, hạt = ngày + mã người chơi): giá vàng mỗi bản Trắng 25 · Xanh 80 · Tím 500 · Vàng 12 000 · Đỏ 60 000; ô cuối là Đỏ ~1 ngày/tuần; ô miễn phí (100 vàng / 5 ngọc / 5 bản Trắng / 2 bản Xanh).
- **Lò rèn (SHARD FORGE, LV10):** 30 bản 1 thẻ Tím + 2 000 vàng → 1 bản Vàng ngẫu nhiên (3/tuần) · 10 bản 1 thẻ Vàng + 10 000 vàng → 1 bản Đỏ ngẫu nhiên (1/tuần).
- **Ấn Vàng (LEGENDARY SEAL, LV10):** 6 bản Vàng thừa + 20 000 vàng → 1 bản Vàng **tự chọn**, 1/tuần. **Ấn Đỏ (MYTHIC FORGE, điều kiện Đỏ):** 15 Tinh thể Đỏ + 50 000 vàng → 1 bản Đỏ tự chọn (trong các Đỏ đã mở/đã có).
- **Vòng quay (LUCKY SPIN, LV2):** 1 lượt miễn phí/ngày + tối đa 5 lượt × 100 ngọc. 8 ô trọng số: 200 vàng (30) · 10 bản Trắng (16) · 10 ngọc (14) · 800 vàng (14) · 4 bản Xanh (12) · 40 ngọc (6) · 2 bản Tím (7,5) · JACKPOT Rương HH (0,5 miễn phí / 1,0 lượt ngọc).
- **Cửa hàng** mở LV2; Rương Vàng LV3; Rương Thần thoại theo điều kiện Đỏ.

## 12. Tiến trình
Nguồn: `tientrinh.js: TTC, TT` · `kinhte.js: KTC.nv, dn, tt, sk` · `sohuu.js` (NEW).

- **Cấp phi công:** XP lên L→L+1 = `20 + 15L`, tối đa **LV30**; sau 30 mỗi 1 000 XP = 1 cấp danh vọng (300 vàng + Rương Thường). Thưởng mỗi cấp `150·L` vàng + 20 ngọc; LV5/10/…/30 thêm Rương Vàng; LV6: chọn 1 trong 3 thẻ Vàng.
- **XP mỗi trận:** wave đạt + 3×trùm hạ + 10 nếu thắng; Leo Tháp: wave đã qua trong tầng (≤5) + 3×trùm + 5 nếu qua tầng (+ XP lần đầu tầng).
- **Khoá tính năng** (`TTC.tn`): CO-OP, Đường Đua sau hướng dẫn · PVP, nhiệm vụ ngày, cửa hàng, vòng quay LV2 · Rương Vàng LV3 · ONLINE LV4 · nhiệm vụ tuần LV8 · Lò rèn + Ấn Vàng LV10 · Rương Thần thoại + Ấn Đỏ: điều kiện Đỏ · Săn Trùm: hạ 3 trùm khác nhau · Vô tận: qua tầng 100. Nút khoá: tối + "LV n" / "FLOOR n", chạm = 1 dòng điều kiện.
- **Hành trình 7 ngày** (đạt 1 trong các mục tiêu mỗi ngày, làm bù được): N1 qua tầng 5 / 3 trận / có ụ 3★ → 500 vàng + 30 ngọc + Rương Thường + Berserker · N2 hạ trùm tầng 10 / ụ 4★ / lên cấp 2 thẻ → 800 vàng + 30 ngọc + Rương Thường · N3 1 trận CO-OP / 2 trùm khác nhau / tầng 15 → 40 ngọc + chọn 4 bản Tím · N4 tầng 20 / ụ 5★ / mua Daily Specials → 1 500 vàng + 40 ngọc + Storm Gun · N5 tầng 25 / 3 trùm / 2 ụ 5★ cùng lúc (hoặc 6 ụ 5★+ tổng) → Rương Vàng · N6 1 trận PVP / 3 nhiệm vụ ngày / LV9 (hoặc 25 trận) → 2 000 vàng + 50 ngọc + Overclock · N7 tầng 35 / 4 trùm khác nhau / lên cấp 1 thẻ Vàng → chọn 2 bản Vàng.
- **Nhiệm vụ ngày:** 3/ngày từ bể (thắng 1 trận 300 vàng · 3 trận 400 vàng · ghép 30 lần 10 ngọc · qua tầng ≥15 10 ngọc · triệu hồi 50 300 vàng · CO-OP/ONLINE 15 ngọc · 1 PVP 15 ngọc · hạ 2 trùm 15 ngọc · 3 ụ 5★+ 400 vàng · qua tầng ≥40 Rương HH); đủ 3 = +20 ngọc; đổi 1 nhiệm vụ/ngày miễn phí.
- **Nhiệm vụ tuần (LV8, reset thứ Hai):** 15 trận · 8 trùm · 3 trận trong 5 tầng quanh tầng cao nhất · 10 ụ 5★+ · 12 nhiệm vụ ngày → mỗi việc 20 ngọc; đủ 5 = 40 ngọc + Rương HH.
- **Điểm danh 7 ngày** (không cần liên tiếp): 300 vàng · 10 ngọc · Rương Thường · 20 ngọc · 1 000 vàng · 30 ngọc · Rương Vàng.
- **Thành tựu 1 lần:** thắng đầu 20 ngọc · hạ trùm đầu 30 · ụ 7★ đầu 50 · qua tầng 40 (=wave 30 cũ) 50 · tầng 70 (=wave 50) 100 · tầng 100 (=wave 70) 200 · lên cấp thẻ 20 · mở rương 20.
- **Sự kiện tuần:** điểm/trận = wave + 10 nếu thắng + 5/trùm (tối đa 60); Leo Tháp: 2×wave qua (≤5) + 5 nếu qua + 5/trùm. Thang mốc 40 → 3 600 (mốc 3 600 = Rương Cổ đại).
- **NEW / chấm đỏ:** ụ mới nhận chưa xem có nhãn NEW + chấm đỏ trên DECK/COLLECTION ở HOME (`sohuu.js`); nút SHOP/SPIN/QUESTS/EVENT có chấm đỏ khi có thứ nhận được (`kinhte.js`, `kinhte-ui.js`); **màn QUESTS chia 3 thẻ con (12/11, `nv-the.js`, chỉ đổi cách bày): REWARDS (Pilot Level + 7-Day Journey + Daily Login) · DAILY (Daily Quests + Weekly Quests) · ACHIEVEMENTS (Legendary & Mythic + Achievements), mỗi thẻ có chấm đỏ riêng, mở màn vào thẻ đầu tiên có chấm đỏ;** tính năng đang khoá không báo chấm đỏ.

## 13. Online
Nguồn: `online/net.js, taikhoan.js, phong.js, dongbo.js, chat.js, ketqua-onl.js` · `chedo-d.js` (bảng xếp hạng).

- **Firebase** dự án `turret-merge` (Auth ẩn danh + **Sign in with Google**, Realtime Database gốc `turretmerge/`). Không mạng → chơi offline bình thường, hồ sơ trong máy.
- **Hồ sơ:** `profiles/{uid}` (tên, chân dung phi công, thống kê) + bản sao kinh tế `kt`; gộp 2 bản: cờ OR, số lớn nhất, cấp thẻ lớn nhất (không nhận 2 lần).
- **Phòng CO-OP online:** tạo phòng → mã 4 chữ + link; sảnh READY; chủ phòng bắt đầu; phòng > 2 giờ bị bỏ. **Lockstep-lite:** 2 máy chạy cùng mô phỏng (hạt giống chung), mỗi người điều khiển bàn mình, bàn bạn là "con rối" dựng từ hành động + ảnh chụp bàn mỗi 1 s (băm, lệch thì sửa). Tim chung do chủ phòng giữ. Bạn im ≥12 s → AI chơi thay ("Partner left — AI playing"); không bao giờ DEFEAT chỉ vì bạn rời.
- **Chat nhanh:** 8 câu soạn sẵn + 4 biểu cảm (chữ tự do ≤60 ký tự chỉ ở sảnh), 1 tin/2 s, MUTE trong cài đặt.
- **Bảng xếp hạng:** 1 bảng **Đường Đua tuần** (`lb/dd/{tuần}/{uid}`: w = điểm, t = giây, k = w·100000 + 99999 − t), top 50, chỉ để xem (thưởng theo mốc tuyệt đối, không theo hạng). 3 bảng cũ (Thử thách tuần, Vô tận tuần / mọi lúc) đã bỏ khỏi giao diện 11/11. **Rules Firebase chưa có đường `lb/dd`** → tới khi publish (mẫu ở `tuvan/che-do-dcdw/THIET-KE.md` §4) bảng chỉ hiện kỷ lục cá nhân ("NOT CONNECTED").
- **Tất định:** gameplay không phụ thuộc hiệu ứng/FPS (bước 1/60 s cố định); quyết định ngẫu nhiên dùng `rngLuat` / `rngHat` / `rngSinh` có hạt — **không `Math.random` trong luật** (Math.random chỉ cho hiệu ứng).

## 14. Admin
Nguồn: `admin.js: ADMIN`. `ADMIN.la()` = tài khoản Google đã đăng nhập có email đã xác minh trùng `ADMIN.EMAIL` (không ghi email ở đây). Admin **bỏ mọi khoá** (chế độ, tầng, cửa hàng, lò rèn, Ấn, chỉ huy, online…) + sở hữu ảo đủ 97 ụ; **không** đổi dữ liệu thật, không cộng tài nguyên. Chỉ kiểm phía máy khách (quyền thật ở server: giai đoạn sau).

## 15. Nguyên tắc thiết kế
- **Vừa đủ khó** để muốn chinh phục: mỗi chế độ có mốc khó dần, thua không mất gì ngoài thời gian, không bán "thắng" (`docs/demo-hop-tuong/tuvan/tien-trinh/THIET-KE.md` N1). Thẻ Vàng/Đỏ phải "cày" như DCDW.
- **Không sát thương lan / tràn** cho ụ mới (`tuvan/u-sang-tao/DE-XUAT.md` §3): đòn trúng mục tiêu gọi tên rõ; vùng chỉ dùng cho khống chế. **Ngoại lệ đang có trong code** (sát thương nhiều quái): Tesla (nhảy theo sao), Iron Fist (nổ vòng 36 px), Mortar (nổ vùng + CLUSTER), Toxic Pool (vũng độc), Mine Layer (mìn), Drone Bay (drone bom), Fifth Shot (phát nổ), Storm Gun (nhảy), Ice Blade 5★ (mảnh 40%), Compass Cannon (nổ nhỏ ở điểm trúng), Werewolf (lan 70%/85% trong 1 ô), Purifier (nổ + vũng), Wall Projector (tường nổ), Overlord, Nine-Tail, Eclipse (vòng), Marionette, Lone Ace / Focus Lens (xuyên), Salvo Battery & Ember Relay & Wyrm Engine (cả hàng/cột), Leviathan, Hydra, Arcane Cascade, Chrono Throne, Black Hole.
- **Khó được mạnh hơn dễ, chỉ so trong cùng bậc** (người dùng chốt 10/11): cân bằng ụ bằng cách so các ụ CÙNG BẬC với nhau (Đỏ hơn Vàng là bình thường). Ụ cơ chế KHÓ (cần điều kiện, xếp chỗ, ghép có chủ đích, tích luỹ lâu, bấm kích hoạt đúng lúc) được phép mạnh hơn: dễ ≈ 0,9–1,0× trung vị bậc · vừa ≈ 1,0–1,15× · khó ≈ 1,15–1,35×. Ụ cơ chế DỄ (bắn thẳng, không điều kiện) mà sát thương/tốc bắn cao hơn ụ khó cùng bậc là lệch → giảm ụ dễ hoặc tăng ụ khó. Số đo + danh sách lệch + đề xuất: `docs/demo-hop-tuong/tocban/CAN-BANG-VANG-DO.md` (công cụ `tools/thap-can-bang-so.js`).
- **Chỉnh số cân bằng 10/11 (người dùng duyệt):** GIẢM ụ dễ mà mạnh — Lucky Slot ST gốc 58 → 38, Werewolf 38,7 → 29. TĂNG ụ khó/yếu — Leviathan ST gốc 24 → 34 và ABYSS +4% → +6%/điểm, Star Cannon 21 → 40, Purifier 23,4 → 40. Tăng NHẸ (bài đo tĩnh chấm thấp oan, trận bot ngang trung vị): Nine-Tail 20 → 24, Hydra 40 → 48, Fusion Archive 24 → 28 (% mỗi điểm giữ 2%).

- **Đỏ mạnh nhờ hiệu ứng kỹ năng, không nhờ chỉ số cơ bản (người dùng chốt 10/11).** Ụ Đỏ tấn công KHÔNG tăng ST gốc / tốc bắn / chí mạng gốc để cân bằng — chỉ chỉnh hệ số của chính kỹ năng (% mỗi điểm tích luỹ, hệ số đòn kỹ năng, số mục tiêu, thời lượng / hồi chiêu, thưởng mốc…). Ụ Đỏ nào không vào dải được bằng kỹ năng thì dừng và báo, không bù ST gốc. **Vàng cũng ưu tiên hệ số kỹ năng trước**; chỉ khi cơ chế không đủ mạnh mới bù ST gốc.
- **Chỉnh số cân bằng 10/11 — đợt 2 (kéo ụ TẤN CÔNG Vàng/Đỏ về dải đích; chi tiết + bảng điểm từng mốc: `tocban/CAN-BANG-VANG-DO.md` mục 8).** Nguyên tắc: ụ tấn công Vàng không được thua ụ hỗ trợ Đỏ; các ụ Đỏ tấn công nên mạnh như Leviathan; không tăng máu quái. **Dải đích điểm tổng** (đơn vị = số ụ Eclipse bộ số cũ): Đỏ dễ 4.5–4.8 · vừa 4.8–5.1 · khó 5.1–5.5; Vàng dễ 2.5–2.8 · vừa 2.8–3.1 · khó 3.1–3.5. Đợt 2 thay cho các số ST gốc của đợt 1 ở dòng trên với: Leviathan (về 24), Hydra (về 40), Fusion Archive (về 24). Số đo là bài tĩnh — chưa đo trận thật.

| Ụ | Hệ số kỹ năng cũ → mới | ST gốc | Điểm trước → sau | Dải | Kết quả |
|---|---|---|---|---|---|
| Leviathan (Đỏ, khó) | bọt nổ lan 50%/30 px → 140%/42 px · TIDAL BREATH ×(4 + 0.1/điểm) → ×(40 + 0.1/điểm), hồi 35 → 25 s · ABYSS giữ +6%/điểm | 34 → 24 | 4.18 → 5.29 | 5.1–5.5 | đạt |
| Arcane Cascade (Đỏ, vừa) | ×(1 + 0.5√(mana/100)) → ×(1 + 1.0√(mana/100)) | 20 giữ | 3.70 → 4.87 | 4.8–5.1 | đạt |
| Black Hole (Đỏ, vừa) | nghiền (2.0 + 0.6×★)D → (3.2 + 0.95×★)D | 90 giữ | 3.91 → 4.83 | 4.8–5.1 | đạt (số đo không ổn định) |
| Wyrm Engine (Đỏ, vừa) | không đổi | 8.5 giữ | 5.06 | 4.8–5.1 | đạt |
| Lucky Slot (Đỏ, dễ) | Cam +2.5% → +5% ST/điểm · Nho +6% → +10% STCM/điểm | 38 giữ | 3.62 → 4.62 | 4.5–4.8 | đạt |
| Overlord (Đỏ, dễ) | sấm ×9 → ×16 · dư chấn ×2 tới 4 quái → ×6 tới 8 quái · nạp 5.6 → 5.1 s | 22.4 giữ | 2.81 → 4.61 | 4.5–4.8 | đạt |
| Hive Queen (Đỏ, dễ) | mỗi drone (0.70 + 0.15×★)D → (1.0 + 0.22×★)D · chu kỳ bầy 2×★ → 1.4×★ giây | 80 giữ | 3.03 → 4.63 | 4.5–4.8 | đạt |
| Compass Cannon · Ember Relay (Vàng, khó) | không đổi | giữ | 3.73 · 3.45 | 3.1–3.5 | giữ |
| Crimson Sting (**Đỏ từ 11/11**, khó) | mỗi STING +16% → **+13%** ST (LV11; LV17 16%), +1% STCM, tốc +100% × n/(n+250); mốc 3/5/7★ riêng | 22 (tốc 2/s) giữ | lúc Vàng 3.28 → Đỏ **5.35** (3.72 / 5.10 / 8.06) | 5.1–5.5 | đạt |
| Salvo Battery (Vàng, khó) | BINGO đủ hàng +200% → +240% | 46.2 giữ | 2.96 → 3.24 | 3.1–3.5 | đạt |
| Quantum Choir (Vàng, khó) | mỗi Hoà âm +35% → +100% ST | 24 → 32 | 1.98 → 3.38 | 3.1–3.5 | đạt |
| Blood Circuit (Vàng, khó) | thưởng dạng 20/50/100/200 Máu +15/40/60/90% → +250/500/550/600% · STCM mỗi Máu 3% → 1% | 22 → 50 | 1.61 → 3.32 | 3.1–3.5 | đạt (w20 1.2 · w60 9.4) |
| Star Cannon (Vàng, khó) | tốc +15% → +30%/mốc 10 (đúng mốc +100% → +250%) · ST +10% → +40%/mốc 10, +100% → +400%/mốc 50 (đúng mốc 50 +350% → +1000%) | 40 giữ | 1.54 → 3.11 | 3.1–3.5 | đạt |
| Prism Thief (Vàng, khó) | cộng dồn đỏ +2% → +15%, vàng +1% → +10%, lục +5% → +30% STCM · tỉ lệ đỏ 8% → 16%, lục 15% → 30% · hợp thể +600% → +1200%/lần | 24 → 60 (trần ×2.5) | 1.68 → 2.71 | 3.1–3.5 | CHƯA |
| Purifier (Vàng, vừa) | ×4 → ×8 vào quái độc (7★ ×6 → ×12) · nổ khi giết ×2 → ×4 | 40 giữ | 1.57 → 2.83 | 2.8–3.1 | đạt |
| Nemesis (Vàng, vừa) | phán quyết ST +6% → +15% (trần +100% → +250%) · % máu mỗi đòn 0.5–2% → 1.5–6% (trùm giữ 1.2%) | 26 → 50 | 1.55 → 2.85 | 2.8–3.1 | đạt |
| Wall Projector (Vàng, vừa) | tường nổ ×7 → ×18 | 26 giữ | 1.19 → 1.74 | 2.8–3.1 | CHƯA (bão hoà; chặn quái không đo) |
| Hydra (Vàng, vừa) | mỗi viên (0.35 + 0.08×★)D → (0.77 + 0.176×★)D, 7★ 0.91 → 2.0 · SÚNG MÁY 0.45D → 1.0D | 48 → 40 | 0.95 → 1.48 | đích quy đổi 1.46 | chưa chắc — cần đo trận thật |
| Nine-Tail (Vàng, vừa) | hồ hoả ×(2 + 0.5×★) → ×(10 + 2.5×★) · trùm +1 đuôi mỗi 8% → 2% máu · mỗi đuôi +5% → +10% tốc | 24 giữ | 0.39 → 0.60 | đích quy đổi 0.59 | chưa chắc — cần đo trận thật |
| Fusion Archive (Vàng, vừa) | mỗi điểm +2% → +10% ST · mốc 10/20/30/40: +15% tốc / +8% chí mạng / +25% ST / +40% STCM → +100% / +25% / +150% / +200% | 28 → 24 | 0.82 → 1.34 | đích quy đổi 1.38 | chưa chắc — cần đo trận thật |
| Werewolf (Vàng, dễ) | đánh lan 70% → 100% (thức tỉnh 85% → 120%) | 29 → 45 | 1.68 → 2.64 | 2.5–2.8 | đạt |
| Eclipse (Vàng, dễ) | tia NGÀY ×2.2–3.8 → ×4.6–8.0 · nón ĐÊM ×1 → ×2.1 · cháy 60% → 125% | 15 giữ | 1.47 → 2.66 | 2.5–2.8 | đạt |
- **Tự do sáng tạo (người dùng chốt 10/11):** mỗi Ụ là **một vật thể riêng** (vd con bọ cạp máy của Crimson Sting), mỗi PHI CÔNG là **một sinh vật riêng** — không dùng lại khuôn "nòng pháo trên bệ" cho ụ, không dùng "người anime đổi màu" cho phi công. Hình vẫn chỉ từ ChatGPT (mục 16); ụ phải nhận ra được ở cỡ ô thật và không lẫn với ụ cùng bậc.
- **Đỏ hiếm:** tối đa 1 Đỏ/bộ; Đỏ mở ở LV12 + tầng 40; tỉ lệ rơi 0,2% (túi trận/Rương Vàng), bảo hiểm 120 rương.
- **Tất định:** không `Math.random` trong luật; online + Retry same seed ra cùng kết quả.
- **VFX không đổi gameplay:** hiệu ứng/hoạt ảnh chạy song song, luật không chờ hoạt ảnh (`trieu`: "luật chơi không chờ hoạt ảnh"); 30/60 FPS cùng kết quả.
- **Ụ hỗ trợ không bắn** (như DCDW); ụ không gây sát thương có tầm = vùng tác dụng, không ghi "Whole path".
- **Hiệu năng iPhone:** ảnh 3× cỡ hiển thị lớn nhất (`tools/thap-kt-min3x.js`), tiết kiệm khung hình (`tietkiem.js`), không ảnh rung giả hoạt ảnh.
- **Sửa 1 chỗ áp mọi chế độ** (`thap/QUY-TAC-HINH.md` luật 6); gọn như DCDW (luật 7).

## 16. Phong cách hình
- Hình **chỉ từ ChatGPT** (PNG nền magenta, cắt khoá), **không vẽ bằng code** (`thap/QUY-TAC-HINH.md`). Prompt tiếng Anh ngắn.
- Giao diện ngoài trận **"Royal Twilight"** (`css/ui-anime.css`, `js/ui-anime.js`): nền #10162F · tấm #212B50 · viền champagne #E9CCA0 · nhấn cyan #71E4EE · nút chính cam đào #FFB866 (chữ #172040) · chữ #F7F8FF / phụ #B8C3E6 · cảnh báo #FF5E80. HUD trận đồng bộ (`hud-anime.*`).
- **Màu theo bậc:** Trắng #e9eef4 · Xanh #4fb8ff · Tím #c77dff · Vàng #ffd23f · Đỏ #ff4b3e (`TIERS.mau`); chỉ huy dùng cùng bộ màu.
- **26 ụ hình mới kiểu tự do (11/11, `tools/thap-cat-u-tudo.py`, 14 tấm `thap-art/raw_anime_u_tudo_t01..t14.png`):** nhanban (bình nhân bản 2 mực con) · xaotron (quạt bài + mũ ảo thuật) · thaukinh (bọ ngựa kính tròn) · docton (quạ mũ lông) · tuthan (thần chết + lưỡi hái) · nangsao (sao trên lò xo) · epxung (đồng hồ áp suất) · no5 (hoa 5 viên đạn) · nhieusong (sứa phát sóng) · santhuong (bảng truy nã) · sungluc (ổ đạn đội mũ cao bồi) · tia (tắc kè ôm ống ngắm) · set (rắn hổ mang điện) · railgun (đàn ống tên lửa) · sinhdoi (đôi cá chép âm dương) · saochep (gương mèo) · loren (đe + búa lửa / búa băng) · nguyenrua (búp bê voodoo) · thanhdia (tượng thiên thần) + 7 ụ 3 dạng (bảng dạng mục 6). **Bệ giữ nguyên bệ theo bậc đang có**; chỉ thay đầu `<id>_nong` (+ `_s1..s3`), icon `nho/<id>`, huy hiệu `<id>_phu`, `glyph/<id>`. Bề ngang đầu = 85–100% bề ngang bệ (dạng 2/3 lớn dần, chặn trong ô). **Đầu ĐỨNG** (không xoay theo mục tiêu, lắc ±3.5°, đòn phát từ tâm ụ — `skills7.js` cuối file `DUNG`): 24 ụ; riêng `no5` vẫn chĩa viên đạn vàng vào mục tiêu, `sinhdoi` quay chậm. Twin Anvil dạng TỐC (`lorentoc_nong`) = cùng hình lật gương + quầng đe xanh băng. Tesla bỏ vòng cuộn rời (`PHU_GIUA`).
- **18 ụ đặc biệt / hỗ trợ hình mới kiểu tự do, lô 2 (11/11, cùng tool, 7 tấm `thap-art/raw_anime_u_tudo_t15..t21.png`):** cuongno (lợn rừng mào đỏ) · vungdoc (cá sấu ngậm độc tím) · khuech (vẹt mào + 2 loa) · doc (ếch độc) · mana (sen pha lê) · phagiap (tê giác sừng khoan) · bua (tay gấu cầm búa) · bomhen (bom đồng hồ báo thức) · nhanmana (ong ôm 2 giọt) · dichchuyen (mèo chui cổng) · chimang (dơi tai chảo) · loa (chim cánh cụt thổi tù và) · kepha (bạch tuộc đỏ kẹp chữ C) · khoathoigian (đồng hồ cát xích khoá) · pandora (rương hé 6 màu) · marionette (tay cầm cần rối + đầu hề) · xuonganh (sư tử lửa ngậm kiếm) · ngaithoigian (ngai đồng hồ). Giữ bệ theo bậc; đầu đứng thẳng, lắc ±3,5°. CHƯA ghép (chờ người dùng): Frost `bang` (t16 hàng 1), Wild Link `tudo` (t21 hàng 2); Merge King giữ vương miện (t20 hàng 1 không dùng).
- **Hình riêng cho biến thể (11/11, `tools/thap-cat-bienthe.py`, `thap-art/raw_bienthe2_vughep_loren.png`):** Merge King VÀNG (`T.vang`) = vương miện vàng 2 sao `vughepvang_nong` (cùng khung + cỡ vương miện thường; quầng vàng mờ chỉ còn là dự phòng khi ảnh chưa tải) · Twin Anvil dạng Sát thương = `loren_nong` (2 búa lửa, đe đỏ cam), dạng Tốc = `lorentoc_nong` (2 búa băng, đe xanh); cả hai nguyên khối kèm tấm nền xám góc vàng phủ lên bệ `loren_de`, đầu nằm yên (không lắc). Icon thẻ Twin Anvil giữ hình 1 búa lửa + 1 búa băng.
- Quái/trùm là vật thể **không tay chân**; đi theo hướng làn, chỉ quay về bàn khi dùng chiêu. Lửa phải màu lửa.

## 17. Cách cập nhật
1. Sửa luật/số trong code → sửa mục tương ứng ở đây **trong cùng commit** (ghi `file: hàm`).
2. Bảng sinh tự động (mục 6–9): chạy server `python3 -m http.server 8765` ở gốc repo, nạp `thap/index.html?notut=1` bằng Playwright, đọc `G.roster`, `SKILLS`, `upBangSao(id)`, `mocCua(id)`, `GROW`, `KY_NANG_CAP`, `MAVUONG`, `TRUM` (script mẫu: xem `CHECKLIST-HUONG-DAN.md` mục "Cách quét").
3. Đổi chữ hướng dẫn/mô tả → đối chiếu tài liệu này + cập nhật `CHECKLIST-HUONG-DAN.md`.
