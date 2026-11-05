# Grow-up / Wake-up kiểu DCDW — ĐÃ LÀM (05/11/2026)

Nguồn thiết kế: `DCDW-WAKEUP-GROWUP.md` (nghiên cứu + kế hoạch từng ụ) và `thap-art/TU-VAN-WAKEUP.txt` (ChatGPT: vòng đo quanh ĐẦU, mốc 0–650 ms, "mỗi dạng phải khác QUỸ ĐẠO hoặc HÌNH VA CHẠM, không chỉ sáng hơn").
Mã: `thap/js/growfx.js` (nạp cuối cùng), âm thanh mới trong `thap/js/sound.js` (khối `GROW-UP / WAKE-UP`), 4 ụ Đỏ mới `thap/js/skills5.js`.

## 1. Cái gì đổi
- **Đòn đánh theo dạng** (bảng dưới): đạn/vệt/hình trúng vẽ bằng code (`GFX.taoSprite`: 20 sprite hướng PHẢI, tròn tuyệt đối), âm riêng từng dạng. Luật chơi gần như giữ nguyên (DPS 1/4/7★ của ụ cũ đổi < 5%); chỗ có cơ chế thêm thì nhỏ và ghi trong bảng thông tin.
- **Vòng đo 3 cung quanh đầu súng**: cung TRÁI = dạng 1 (dâng từ đáy), cung PHẢI = dạng 2, cung "vương miện" trên đỉnh = dạng 3. Khe hở đúng chỗ 2 huy hiệu góc trên (loại ụ · số sao) và ở đáy → huy hiệu không bị che. Gần tới dạng sau (≥85%) cung nháy 2 Hz; dạng 3 có thời hạn (Vệ Tinh bắn phá, Cuồng Nộ Frenzy, Bão Băng) thì cung đỉnh rút dần và nháy 0.8 s cuối. Ụ Đỏ có kỹ năng chủ động: cung nạp mảnh bên trong, đầy = trắng nhấp nháy (chạm để dùng). Vòng tiến độ cũ dưới bệ đã bỏ.
- **Biến hình 0–650 ms** (thời gian thực, luật đổi NGAY — không có khoảng dừng sát thương): 0–100 vòng siết vào đầu → 100–220 nén (đầu co 5%, tối, lõi nạp, 6 vệt hút vào) → 220–330 chớp bóng trắng + sóng tròn 0.4→1.1 ô + 8 gai → 330–520 đổi ảnh đầu `_s1/_s2/_s3`, bung 0.9→1.05 → 520–650 lắng + **phát bắn đầu tiên** bằng đòn mới. Chữ ngắn "Awakened!" (dạng 3) hoặc tên dạng 2; Vệ Tinh: "Bombardment!" 1 lần/bàn. Ụ chu kỳ (Overlord, Cryo, Cuồng Nộ, Cửu Vĩ, Lưới) lần sau chỉ nảy 300 ms, không chữ to. Âm: `gNap` (nạp) + `gKhoa` (khoá, dạng 3 có hợp âm chuông).
- **Bảng thông tin**: thêm dòng *ATTACK BY STAGE* (dạng hiện tại tô màu).
- **Trần dễ nhìn**: nét 2–4 px; cột sáng từ trời chỉ dài 110–150 px phía trên mục tiêu (mờ dần, không đè ngang cả bàn ụ); lưới băng Cryo dạng 3 chỉ trong ô; rung màn ≤ 1.5–2 px, tối đa 1 lần / 0.8 s toàn bàn.

## 2. Bảng dạng → đòn đánh
| Ụ | Dạng 1 | Dạng 2 | Dạng 3 |
|---|---|---|---|
| Overlord | nạp im lặng (tia lửa tĩnh) | tia điện nhảy vào quái gần nhất mỗi 1.2 s (×1.2) | cú sấm thành CỘT SÉT từ trời + 6 tia toả + vết cháy tròn + 4 sét dư chấn |
| Mystery Box | chọc mảnh bài tím | quạt 3 bóng "?" vào 3 quái | ngừng bắn, pháo giấy báo sắp mở |
| Evolver | viên hổ phách | xỉ vàng nóng chảy: vệt than + nổ 20 px | tia vàng mảnh liên tục |
| Cryo Reactor | mỗi nhịp hào quang: vòng sương lan ra | + 3 kim băng bay vào 3 quái chậm nhất | sàn lưới lục giác dưới ụ; BÃO BĂNG lấp lưới trắng + quái vỡ thành 6 mảnh |
| Mech Wolf (Warwolf) | 1 vuốt cam | 2 nhát chéo chữ X, đầu lao tới | 2 nhát chí mạng siêu nhanh, 3 vệt đỏ thẫm, cứ 4 đòn LƯỚT tới (bóng đầu sói) |
| Orbital (Mafdet) | tia lam nhỏ | tia dài + vòng ngắm khoá quái trước khi trúng | GHÉP → mọi Vệ Tinh thức tỉnh: mỗi phát = 3 GIÁO TRỜI có tâm ngắm đỏ, so le (đánh đơn, không nổ lan — đúng DCDW) |
| Berserker (Danu) | vạch vàng | đạn cam + tàn lửa | FRENZY: 2 nòng xen kẽ đạn đỏ-trắng, chớp đôi, vỏ đạn văng, nổ lửa nhỏ |
| Star Cannon (Darby) | mảnh sao | cặp sao + vệt lấp lánh | sao chổi + nổ hình ngôi sao; phát thứ 5 gọi THIÊN THẠCH vào quái trâu nhất |
| Chain Link | vòng tím rỗng | vòng kéo dây xích từ nòng | trúng → xích mắt tròn quật sang quái thứ 2 (×0.5) |
| Sync Cannon | viên vàng | + sóng âm ở nòng; mọi Pháo Đồng Bộ đập cùng nhịp 1 s | tia vàng tức thì hội tụ + vòng vàng |
| Hydra | 1–3 kim ngọc BAY | quạt kim tức thì so le 40 ms + dấu ấn lục giác | HỢP ĐẦU: tia xuyên khổng lồ + phù văn dọc tia |
| Nine-Tail | lửa hồ ly cam bay thẳng | lửa hồ ly UỐN LƯỢN + vệt lửa | 7★: lửa xanh-trắng uốn lượn, nổ vòng 26 px |
| Chrono Throne | kim đồng hồ xuyên | + đóng dấu mặt đồng hồ 12 vạch (chậm nhẹ) | xuyên cả đường + TIẾNG VỌNG đánh lại 40% sau 0.3 s |
| Wyrm Engine | nón lửa CAM, cháy 3 s | nón lửa XANH +30% quái to | nón TRẮNG viền xanh, dài hơn, vệt cháy 4 s |
| Resonance Grid | buff chéo | ụ chéo trúng: vòng ngọc lam | cứ phát thứ 3 của ụ chéo bắn thêm đạn vọng ngọc lam |

## 3. Bốn ụ Đỏ đợt 3 (`skills5.js`, tối đa 1 Đỏ / bộ bài)
- **Hive Queen**: ngòi chích + drone ong máy tự săn (60% dmg / 0.5 s, đẻ 4→2.2 s, tối đa 3→10, trần 12/bàn); 4★ drone đậu ụ kề +10% tốc; 7★ drone hoàng gia ×3. Chủ động **SWARM** (3★, 30 s): cả bầy lao vào chỗ đông, nổ ×3 35 px.
- **Leviathan**: bọt nước nổ 30 px; mỗi 9→5 s NUỐT 1 quái (4★ quái to ×3, 7★ cả quái bay) → +4% sát thương/cộng dồn (tối đa 100). Chủ động **TIDAL BREATH** (3★, 35 s): tia nước chạy dọc đường 1.5 s, ×(4+0.1·cộng dồn), đẩy lùi.
- **Genesis Core**: không bắn; mỗi 30→16 s +1★ cho ụ sao thấp nhất (không tính là ghép; co-op lấy cả ụ đồng đội); 4★ ụ kề +15% dmg; 7★ mỗi lần nâng còn gọi 1 ụ 1★. Chủ động **GENESIS** (3★, 45 s): gọi 1–3 ụ ở mức sao trung bình.
- **Wyrm Engine**: nón lửa 5 nhịp/s, 40→75° × 100→155 px, cháy 3 s, vệt cháy trên đường; dạng cam/xanh/trắng. Chủ động **DRAGON DIVE** (3★, 35 s): rồng bổ nhào dọc cả đường ×25 (+5% máu trùm), rải vệt cháy.

### DPS mô phỏng (`node tools/thap-sim-moi.js`, wave 20, 40 s; Leviathan thêm 120 s)
| Ụ | 1★ | 4★ | 7★ |
|---|---|---|---|
| Hive Queen | 167 | 1227 | 4121 |
| Leviathan (40 s / 120 s) | 144 / 119 | 542 / 1911 | 852 / 3820 |
| Wyrm Engine | 458 | 2219 | 5964 |
| Overlord (cũ) | 996 | 5457 | 17499 |
| Black Hole (cũ) | 963 | 6646 | 11300 |
| Cryo Reactor (cũ) | 2667 | 16160 | 18073 |
| Holy Halo (cũ) | 150 | 638 | 2004 |
| Chrono Throne | 78 | 2308 | 3991 |
Bot tự chơi (deck X×3 + Gatling + Cannon, solo): Hive Queen ~24, Leviathan 32, Genesis Core 32, Wyrm Engine 30, Overlord 31 (nền Gatling×4 ~13).

## 4. Kiểm tra
- `docs/demo-hop-tuong/tuvan/growfx/dang-ban-390.jpg`, `dang-ban-430.jpg`: mỗi ụ ở 3 ô (dạng 1/2/3) đang bắn, 2 khung.
- `bien-hinh-390.jpg`, `bien-hinh-430.jpg`: khung 50/160/260/360/480/600 ms + chữ Awakened!.
- `do-moi-390.jpg`, `do-moi-430.jpg`: 4 ụ Đỏ 1/4/7★ + kỹ năng chủ động; `che-*.png`: SOLO/CO-OP/PVP tự chơi.
- Cỡ đầu: `tuvan/co-dau-truoc.png`, `co-dau-sau.png`, `co-dau-tren-ban-390.png` (`tools/thap-co-than.py`).
- Không lỗi trang ở 390×844 / 430×860. FPS headless (Chromium phần mềm, không GPU) trước/sau như nhau (median ~39 → ~47, dao động 35–58); máy thật có GPU sẽ cao hơn.
- Ép dạng để kiểm: trong console `G.debug.gd = 3` (mọi ụ grow-up) hoặc `T._epGd = 2` (1 ụ).
