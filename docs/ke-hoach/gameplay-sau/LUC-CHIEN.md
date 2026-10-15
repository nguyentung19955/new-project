# Phiên 3 — LỰC CHIẾN: phụ kiện, linh thú, hiệu ứng nhân vật, cảnh giới, ấn ký, kinh tế, trần cân bằng

Lập 15/10/2026. **Chỉ là kế hoạch**: chưa sửa gì trong `game/`, chưa gen ảnh, chưa viết prompt (phong cách ảnh chưa chốt — `docs/ke-hoach/khong-pixel/`).
Đã đọc: `YEU-CAU.md`, `docs/cot-truyen/CHUNG.md`, `docs/ke-hoach/BUOC-2-3-4.md`, `docs/ke-hoach/buoc-3/KE-HOACH.md`, `docs/ke-hoach/LUAT-CAN-BANG.md`,
code `data.js`, `combat.js` (`G.powerParts`), `vk_moi.js`, `ep_do.js`, `bo_skill.js`, `chuong.js`, `so_yeu_quai.js`, `thanh_tuu.js`, `viec_ngay.js`, `ai_ngay.js`,
`vien_vk.js`, `luc_chien.js`, `stage.js` (thưởng mỗi trận), `tools/can-bang/tinh.js`, `game/tests/cay.py`, `balance.py`.
Hai tệp anh em: **VUNG.md** (vùng 5–8, phiên 1) và **LOI-DANH.md** (cách ra đòn, phiên 2). Chỗ cần nối ghi **[Điểm nối]**, không viết thay.

---

## 0. Tóm tắt một phút

- **Vì sao cần**: hết vùng 4 thì Cu Tí đã **cấp 40 (trần)**, mài gần +15, ép đồ gần Rực lửa, 4 bộ đồ cấp 3. Vùng 5–8 cần chỗ lớn lên mới, nếu không người chơi
  chỉ còn cách cày lại hoặc kẹt. Đồng thời vàng / linh khí cuối vùng 3–4 đang **thừa, không có chỗ tiêu**.
- **4 hệ mới, tất cả chỉ mở SAU KHI QUA VÙNG 4** (nên vùng 1–4 không dễ đi chút nào):
  1. **Phụ kiện** — 4 ô đeo (Vòng cổ, Vòng tay, Ngọc bội, Bùa hộ mệnh), 4 bậc theo vùng (Đồng → Bạc → Ngọc → Kim), luyện +0…+10, 4 **bộ** (Sấm, Đèn Đá, Mây, Trống Đồng); đủ 4 món một bộ thì có **hào quang + vệt** trên người.
  2. **Linh thú** — 4 con, mỗi vùng một con gắn truyện (Nghê Sấm, Đom Đóm Đá, Chim Lạc con, Rùa Vàng con); đi theo, tự đánh, 1 chiêu bấm nút; cấp 1–20, tiến hoá 3 dạng; **không chết** (chỉ “mệt” rồi dậy).
  3. **Cảnh giới** — thay cho cấp khi đã cấp 40: kinh nghiệm thừa thành **Tu vi**, lên 15 tầng (5 bậc theo cây đa: Rễ → Thân → Cành → Lá → Hoa); qua bậc phải thắng **thử thách Bóng Cu Tí**.
  4. **Ấn ký trống đồng** — mỗi mảnh trống đã lấy lại khắc được **1 ấn** (chọn 1 trong 2), đổi cách chơi một chút (lăn xa hơn, đèn sáng hơn…). Ít sức mạnh, nhiều cá tính.
  (+ **Thiên phú** là phần tuỳ chọn đợt sau, gần như không cộng sức mạnh — xem 5.3.)
- **Trần**: tổng cộng 4 hệ mới tối đa **×2,1 Sức mạnh** so với cuối vùng 4 (phụ kiện ×1,30 · linh thú ×1,25 · cảnh giới ×1,18 · ấn ký ×1,06 · thiên phú ×1,02).
  Vừa khớp đường khuyên dùng vùng 5–8 tăng ~×1,22 mỗi vùng. Mọi con số dưới đây là **số xuất phát — bot đo rồi mới chốt**.
- **Kinh tế**: chỉ thêm **3 thứ mới** (Bột đồng, Hạt linh, Ngọc linh thú) + Tu vi (là kinh nghiệm thừa, không phải tiền). Không dùng đá nâng bậc cho hệ mới (để đá vẫn dành cho ép đồ).
- **Ảnh**: ~**240 tấm** (nhiều nhất là linh thú: 4 con × 3 dạng × 6 động tác). Danh sách ở mục 8.
- **Làm**: 5 đợt × ~3 phiên, mỗi hệ một cờ tắt (`?phukien=0`, `?linhthu=0`, `?canhgioi=0`, `?anky=0`, `?hieuungnv=0`).

---

## 1. Hiện trạng — cái gì đã có, cái gì đã chạm trần

Không làm trùng những thứ sau (code hiện có):

| Đã có | Tăng gì | Trần hiện tại |
|---|---|---|
| Cấp nhân vật | máu +6%/cấp, sát thương +1,5%/cấp | cấp 40 (`G.MAX_LEVEL`) — vùng 4 đưa lên 40 |
| Cây kỹ năng Cụ Đồ (Công/Thủ/Hệ) | sát thương, chí mạng 10%, giảm ST, kháng hệ | 13 điểm / 15 ô |
| Cây chưởng (Hỏa/Độc/Băng) | +0,4% sức mạnh / điểm | 28 điểm / cây |
| Cấp hệ vũ khí (Mầm → Thức tỉnh) | ×1,15 / 1,35 / 1,6 + tính năng hệ | Thức tỉnh |
| Mài | +8% / cấp | +15 (lò rèn cấp 4) |
| Ép đồ (7 bậc) + dòng | ×1,08…×1,75; dòng: **chí mạng, ST chí mạng, đánh trùm, hút máu, tốc đánh, hồi chiêu, linh khí, ST hệ, giảm ST nhận** | Rực lửa, 4 dòng |
| Bộ đồ (4 bộ, Cô Thợ May) | 3 kỹ năng bộ mỗi bộ (Bóng lướt, Khiên nước, Giáp bạc…) | cấp 3 |
| Bạn dạy (Cu Tèo, Cái Bống, Cu Lì) | nội tại cố định | 1 lần mỗi bạn |
| Sổ yêu quái, thành tựu, việc hôm nay, ải ngày | chỉ cho **tiền** (vàng, linh khí, đá, bùa), không cộng chỉ số | — |
| Danh hiệu | **chỉ để nhìn** | — |
| Ánh vũ khí (`vien_vk.js`) | viền theo bậc ép, vệt sáng theo mài, hạt hệ ở tay | — |

**Không có**: thú, phụ kiện, thiên phú, cảnh giới, ấn ký, hào quang trên **người** (chỉ có trên vũ khí). Đây là chỗ trống để làm.

**Những dòng KHÔNG được dùng lại** cho phụ kiện (đã là dòng ép đồ): chí mạng, ST chí mạng, đánh trùm, hút máu, tốc đánh, hồi chiêu đặc biệt, thêm linh khí, ST hệ.
Lý do: hai nơi cùng cộng một chỉ số thì trần cũ (hút máu 1%/nhát, giảm ST 75%…) bị vượt và người chơi không biết nên nâng cái nào.

---

## 2. Ngân sách sức mạnh vùng 5–8 (khung chung cho cả 3 phiên)

Sức mạnh trong code: `power = 3·√(off × ehp)` (`G.powerParts`). Một hệ “×1,30 sức mạnh” nghĩa là `off × ehp` tăng ×1,69. Mỗi hệ mới khai báo **riêng phần off và phần ehp**
(giống `G.boSk.quyDoi`), không dùng `P.powerMult` chung — để bot và màn hình biết sức mạnh đến từ đâu.

### 2.1 Khuyên dùng dự kiến (chỉ để chia ngân sách — VUNG.md và bot chốt số thật)
| Cuối vùng | Khuyên dùng ải 5 | Tăng so với vùng trước | Từ đâu ra (dự kiến) |
|---|---|---|---|
| 3 (đã có) | 520 | — | — |
| 4 (kế hoạch bước 3) | 690 | ×1,33 | cấp 30→40, ép/mài tiếp |
| 5 Núi Sét | ~850 | ×1,23 | phần còn lại của hệ cũ (ép Rực lửa, mài +15, vũ khí thứ 2) + phụ kiện Đồng + linh thú 1 + vũ khí/hệ Sét (phiên 2) |
| 6 Hang tối | ~1 040 | ×1,22 | phụ kiện Bạc + bộ 4 món đầu, linh thú tiến hoá 1, cảnh giới bậc Thân, ấn ký |
| 7 Đỉnh mây | ~1 270 | ×1,22 | phụ kiện Ngọc, linh thú cấp 15+, cảnh giới bậc Cành–Lá |
| 8 Hắc Long | ~1 450 | ×1,14 | phụ kiện Kim (chưa luyện đủ), linh thú dạng Thần, cảnh giới bậc Hoa |

Trần tuyệt đối (mọi thứ tối đa) ≈ 690 × 1,15 (hệ cũ còn lại) × 2,1 × 1,10 (vũ khí/hệ Sét) ≈ **1 830**. Khuyên dùng 8-5 (1 450) ≈ 80% trần → người chơi bình thường
đánh được Hắc Long khi chưa tối đa, người cày thêm có ~25% dư (vẫn dưới mốc 130% của `G.grindMult`, nên không bị cắt thưởng oan).

### 2.2 Chia trần từng hệ
| Hệ | Trần sức mạnh | off tối đa | ehp tối đa | Mở khi |
|---|---|---|---|---|
| Phụ kiện (4 ô + bộ) | ×1,30 | ×1,25 | ×1,35 | qua 4-5 |
| Linh thú (1 con ra trận) | ×1,25 | tuỳ con (bảng 4.3) | tuỳ con | cứu Thần Sét (5-5) — món quà đầu ở 5-1 |
| Cảnh giới (15 tầng) | ×1,18 | ×1,15 | ×1,21 | cấp 40 |
| Ấn ký (8 ấn) | ×1,06 | — | — | qua 4-5 (4 mảnh cũ khắc luôn) |
| Thiên phú (tuỳ chọn) | ×1,02 | — | — | cảnh giới bậc Thân |
| **[Điểm nối] LOI-DANH.md**: vũ khí mới / hệ Sét / chiêu hợp lực | đề nghị **≤ ×1,10** | | | phiên 2 quyết |
| **Tích 5 hệ mới** | **≈ ×2,1** (×2,3 nếu tính cả phiên 2) | | | |

Nguyên tắc: **không hệ nào một mình quá ×1,30**, để không có “một cái phải cày bằng mọi giá”. Bot kiểm phần mỗi hệ (mục 7).

---

## 3. Phụ kiện

### 3.1 Ô đeo (4 ô, mỗi ô một chỉ số CHÍNH cố định — trẻ con nhìn là hiểu)
| Ô | Tên trong game | Chỉ số chính | Tối đa (Kim +10) |
|---|---|---|---|
| 1 | **Vòng cổ bạc** | Máu +% | +15% |
| 2 | **Vòng tay** | Sát thương +% | +12% |
| 3 | **Ngọc bội** (đeo hông) | Giảm sát thương nhận +% | 8% (vẫn chung trần giảm ST 75%) |
| 4 | **Bùa hộ mệnh** (túi bùa cổ) | Kháng 1 hệ (ghi trên bùa: Lửa/Độc/Băng/**Sét**) | 25% (vẫn chung trần kháng 0,8) |

Bùa hộ mệnh **cho đổi hệ miễn phí ở làng** → dạy người chơi chuẩn bị theo trùm (trùm vùng 5 Sét → đeo bùa Sét).

### 3.2 Bậc (theo vùng — không thể có món mạnh trước khi tới vùng)
| Bậc | Rơi từ | Hệ số chỉ số chính | Luyện tối đa | Dòng phụ |
|---|---|---|---|---|
| Đồng | vùng 5 | ×0,4 | +4 | 0–1 |
| Bạc | vùng 6 | ×0,6 | +6 | 1 |
| Ngọc | vùng 7 | ×0,8 | +8 | 1–2 |
| Kim | vùng 8 (+ sau khi thắng Hắc Long) | ×1,0 | +10 | 2 |

Chỉ số = tối đa × hệ số bậc × (0,5 + 0,05 × cấp luyện). Ví dụ Vòng tay Kim +10 = 12% × 1 × 1,0 = 12%; Vòng tay Đồng +4 = 12% × 0,4 × 0,7 ≈ 3,4%.
Màu khung bậc **khác hẳn màu ép đồ** (đồng nâu, bạc, ngọc xanh ngọc, kim vàng chói có hoa văn trống) để không nhầm với Trắng → Rực lửa.

### 3.3 Dòng phụ (bể riêng của phụ kiện, không trùng ép đồ)
| Dòng | Mỗi dòng (Kim) | Trần cộng dồn | Quy ra |
|---|---|---|---|
| Sát thương linh thú +% | +8% | +20% | off (qua linh thú) |
| Sát thương chưởng +% | +6% | +15% | off |
| Hồi máu khi vào phòng +% máu | +2% | 5% (cộng với ô “hồi 8%/phòng” cây Thủ) | ehp |
| Thời gian bất tử khi lăn +giây | +0,04 s | +0,10 s | ehp |
| Sát thương lên quái có khiên / tinh anh +% | +6% | +15% | off |
| Máu tối đa +% (phụ) | +3% | +6% | ehp |
| Kéo dài choáng / đẩy lùi +% | +8% | +20% | off (nhẹ) |
| **[Điểm nối] LOI-DANH**: “cửa sổ né hoàn hảo +giây” | +0,02 s | +0,05 s | ehp |

Dòng **đổi lại được** ở Ông Thợ Bạc: 1 Bột đồng × bậc + vàng (xem 6.3). Không có dòng “thêm vàng / thêm rơi” (sẽ phá kinh tế).

### 3.4 Bộ (4 món cùng vùng = 1 bộ)
| Bộ | Vùng | 2 món | 4 món (hiệu ứng + **thấy trên người**) |
|---|---|---|---|
| **Bộ Sấm** | 5 Núi Sét | máu +3% | Cứ đòn thứ 6 trúng phóng **tia sét nhỏ** sang 2 quái gần (30% ST đòn) · hào quang chân tia điện tím, vệt lăn tia lửa điện |
| **Bộ Đèn Đá** | 6 Hang tối | giảm ST 2% | **Vòng sáng quanh người** rộng thêm 40% (trong vùng tối), quái trong vòng sáng nhận +8% ST · hào quang chân ánh đèn vàng, đom đóm bay quanh |
| **Bộ Mây** | 7 Đỉnh mây | ST +3% | Lăn né để lại **luồng gió** đẩy quái ra 1 lần / 4 s; đánh trúng quái bay +10% · hào quang mây trắng, vệt lăn mây |
| **Bộ Trống Đồng** | 8 Đền trống | máu +3%, ST +2% | Mỗi 8 s một **nhịp trống**: sóng âm vòng nhỏ (40% ST, đẩy lùi), trúng nhịp lăn thì hồi 2% máu · hào quang hoa văn mặt trời trống đồng xoay chậm |

Quy đổi 4 món ≈ off ×1,06 hoặc ehp ×1,06 (bot đo để 4 bộ lệch nhau ≤ ±5 điểm tỉ lệ thắng). Bộ 2 món **gộp được 2 bộ** (2+2).
**[Điểm nối] VUNG.md**: bộ Đèn Đá chỉ có ý nghĩa nếu vùng 6 có luật “bóng tối / đèn soi”; bộ Mây cần quái bay vùng 7; bộ Trống Đồng cần trận Hắc Long đánh theo nhịp trống.
**[Điểm nối] LOI-DANH.md**: nếu có hệ Sét, tia sét Bộ Sấm nên dùng chung hiệu ứng / luật lan của hệ Sét (không viết luật lan thứ hai).

### 3.5 Nguồn có được
| Nguồn | Rơi gì | Tỉ lệ / số (xuất phát) |
|---|---|---|
| Tinh anh vùng 5–8 | 1 phụ kiện bậc vùng (ô ngẫu nhiên, bộ của vùng) | 25% |
| Trùm nhỏ | 1 phụ kiện | 60%, lần đầu chắc chắn |
| Trùm vùng | 1 phụ kiện, **lần đầu cho chọn ô** | 100% |
| Rương ải (phòng chọn rương) | thêm lựa chọn “Phụ kiện” bên cạnh linh khí / quặng / bùa hệ | 1 trong 4 lựa chọn |
| Sổ yêu quái trang vùng mới | đủ vùng → 1 phụ kiện bậc vùng chọn ô | 1 lần / vùng |
| Ông Thợ Bạc (NPC mới ở làng) | đúc món chọn ô bằng Bột đồng | 30 / 45 / 65 / 90 Bột đồng theo bậc |

Món thừa **phân giải** → Bột đồng (2 / 4 / 7 / 12 theo bậc, + cấp luyện hoàn 50%). Đổi sang món bậc cao hơn: **chuyển 70% cấp luyện** (làm tròn xuống) để không phải cày lại từ đầu.

### 3.6 Luyện (+0 → +10)
- Chi phí lần luyện thứ n (n = 0…): **vàng 80 × (n+1) × hệ số bậc [1; 1,5; 2,2; 3]**, **Bột đồng 2 + n**.
- **Luôn thành công** (khác ép đồ — không làm thêm một vòng “may rủi” nữa cho trẻ con).
- Trần luyện còn bị chặn bởi **Lò bạc** của Ông Thợ Bạc: cấp lò 1–4 mở khi qua vùng 5/6/7/8 (giống `G.FORGE_CAP`).
- Tổng một món Kim +10 ≈ 13 200 vàng + 65 Bột đồng → 4 món ≈ 53 000 vàng: phần lớn là **chỗ tiêu sau truyện**, khuyên dùng 8-5 tính theo “Ngọc +8, Kim +4” (mục 7).

---

## 4. Linh thú

### 4.1 Bốn con, gắn truyện (CHUNG.md: “vùng 5 mở thú đồng hành đầu tiên”)
| Linh thú | Có từ | Vai | Hệ | Đòn thường | Chiêu bấm nút (hồi 12 s) | Nội tại |
|---|---|---|---|---|---|---|
| **Nghê Sấm** (con nghê đá trước đình, được Thần Sét truyền sét cho sống dậy) | Đầu vùng 5 (5-1 được giao trông; thắng 5-5 thì ở lại hẳn) | cận chiến, giữ chân | Sét | vồ cắn, 20% hút sự chú ý quái thường | **Gầm sấm**: choáng quái quanh 1,2 s | Cu Tí đứng gần Nghê: giảm ST 4% |
| **Đom Đóm Đá** (bầy đom đóm sống trong thạch nhũ) | Cứu người ở vùng 6 | hỗ trợ, soi sáng | — | bắn đốm sáng nhỏ tầm xa | **Đèn lồng**: soi sáng vùng tối 6 s + hồi 6% máu | quái bị soi lộ điểm yếu (+5% ST của Cu Tí) |
| **Chim Lạc con** (từ hoa văn trống bay ra khi lấy mảnh trống vùng 7) | Thắng 7-5 (hoặc giữa vùng 7 — VUNG.md quyết) | tầm xa, đánh quái bay | Gió | lao mổ, ưu tiên quái bay | **Lượn vòng**: 3 lần lao qua đường thẳng | đánh quái bay +15% |
| **Rùa Vàng con** (con của rùa giữ đền, trốn khỏi Hắc Long) | Giữa vùng 8 | khiên | — | húc nhẹ | **Mai rùa**: đỡ 1 đòn bất kỳ cho Cu Tí (kể cả chiêu trùm) | sau khi Cu Tí bị trúng, 0,3 s bất tử thêm |

Chỉ **1 con ra trận**, đổi ở làng hoặc ở suối hồi giữa ải. Mọi con đều đi được mọi vùng (con mới không làm con cũ vô dụng — xem 4.3).
**[Điểm nối] VUNG.md**: nơi trao từng con + một câu truyện; người cần cứu vùng 6 nên là người tặng Đom Đóm. **[Điểm nối] LOI-DANH.md**: “chiêu hợp lực với linh thú” là phần phiên 2;
phía này chỉ cấp sẵn **“điểm thân thiết”** (4.5) và một nút chiêu linh thú để phiên 2 gắn chiêu hợp lực vào.

### 4.2 Đi theo và đánh (luật đơn giản, không làm người chơi bực)
- Đi sau Cu Tí ~40 điểm ảnh, chạy vòng qua vật cản; quá xa (>200) thì **nhảy tới** cạnh Cu Tí.
- Đánh: ưu tiên quái Cu Tí vừa đánh; không có thì quái gần nhất trong 120. **Không bao giờ đánh vỡ vật hệ** (lục bình, đèn dầu…) để không gây chết oan.
- **Không chết**: có thanh “sức” riêng; hết sức → nằm “mệt” 6 s rồi tự dậy. Quái chỉ nhắm linh thú nếu bị nó khiêu khích (Nghê) — trùm vùng **không** nhắm linh thú (trừ chiêu vùng của trùm trúng cả hai).
- Linh thú **không nhặt đồ, không mở cửa, không kích bẫy**. Ra khỏi trận / vào cảnh truyện thì ẩn.
- Máy yếu / quá nhiều thứ trên màn: linh thú vẫn đánh nhưng bỏ bớt hạt hiệu ứng (theo cài đặt hiệu ứng, mục 5.4).

### 4.3 Sức mạnh của linh thú (theo % sức Cu Tí — tự lớn theo người chơi, không phải cân riêng từng vùng)
Sát thương linh thú = **sát thương gốc của Cu Tí (không tính chí mạng / dòng ép) × hệ số cấp**. Hệ số cấp: cấp 1 = 8% → cấp 20 = 22% (mỗi giây, so với DPS Cu Tí); dạng Lớn +2%, dạng Thần +4%.

| Linh thú | off tối đa | ehp tối đa | Trần sức mạnh |
|---|---|---|---|
| Nghê Sấm | ×1,20 | ×1,30 | ×1,25 |
| Đom Đóm Đá | ×1,10 | ×1,42 | ×1,25 |
| Chim Lạc con | ×1,45 | ×1,08 | ×1,25 |
| Rùa Vàng con | ×1,05 | ×1,49 | ×1,25 |

Bot kiểm: 4 con cùng cấp, cùng ải → tỉ lệ thắng lệch nhau **≤ ±5 điểm** (giống luật 4 vũ khí ±14%).

### 4.4 Nâng cấp và tiến hoá
- **Cấp 1 → 20**: cho ăn **Hạt linh** (bánh gai, cơm nắm, hạt sen — chỉ khác tên/ảnh, cùng giá trị). Cần `3 + 2n` hạt cho cấp n → n+1 (tổng 440 hạt / con).
- **Con mới bắt đầu ở cấp = cấp con cao nhất − 5** (“học theo đàn anh”) → không bắt cày lại.
- **Tiến hoá** (đổi hình + mở nội tại thứ 2):
  - Con → **Lớn** ở cấp 10: 1 Ngọc linh thú + 1 000 vàng.
  - Lớn → **Thần** ở cấp 20: 3 Ngọc linh thú + 3 000 vàng + 200 linh khí. Dạng Thần chỉ mở khi đã qua vùng 7 (để vùng 5–6 không vọt).
- Trần cấp theo vùng đã qua: vùng 5 → 10, vùng 6 → 14, vùng 7 → 18, vùng 8 → 20.

### 4.5 Thân thiết (chỉ để nhìn + mở chiêu hợp lực, KHÔNG cộng chỉ số)
Đánh chung tích điểm thân thiết (mỗi trận thắng +1, trùm +3). Mốc 10 / 30 / 60: câu nói mới, động tác vui ở làng, **mở chiêu hợp lực** (phiên 2). Không cộng sức mạnh → không ép cày.

---

## 5. Hiệu ứng nhìn thấy trên nhân vật & các hệ khác

### 5.1 Hiệu ứng nhân vật khi mặc phụ kiện / bộ đồ
Nguyên tắc: **không vẽ phụ kiện lên từng khung sprite** (Cu Tí đã có 4 bộ đồ × 6 động tác; thêm 4 ô × 4 bậc lên mọi khung là hàng trăm ảnh và đổi phong cách thì phải vẽ lại hết).
Thay vào đó dùng **lớp hiệu ứng tách rời** đặt dưới / quanh nhân vật — đổi phong cách chỉ vẽ lại vài tấm.

| Lớp | Hiện khi | Ở đâu | Ghi chú |
|---|---|---|---|
| **Hào quang chân** (vòng dưới chân) | đủ 4 món một bộ | dưới bóng nhân vật | 1 vòng / bộ; mờ 60%, không che vạch báo trước của quái |
| **Vệt lăn né** | 4 món một bộ | theo đường lăn | thay vệt bụi mặc định |
| **Hạt bay quanh người** | cảnh giới bậc Cành trở lên | quanh thân | lá đa xanh (Cành) → hoa đa (Hoa) |
| **Màu vệt chém** | bộ 4 món | nhát chém | tím điện / vàng đèn / trắng mây / đồng đỏ. **Không đổi viền vũ khí** (viền đã dành cho bậc ép đồ, `vien_vk.js`) |
| **Ánh ngọc bội** | ngọc bội bậc Ngọc/Kim | điểm sáng nhỏ ở hông, nhấp nháy chậm | 1 chấm sáng vẽ bằng code, không cần ảnh |
| **Ấn trên trán / mu bàn tay** | khi vừa kích hoạt ấn ký | chớp 0,5 s | để người chơi biết ấn vừa có tác dụng |
| **Hiệu ứng linh thú tiến hoá** | dạng Thần | quanh linh thú | hào quang nhỏ theo hệ con thú |

Màn **Hành trang**: ô xem trước Cu Tí đứng xoay có đủ hào quang + linh thú đứng cạnh (chỗ khoe thành quả).

### 5.2 Cảnh giới (sau cấp 40)
- Kinh nghiệm sau cấp 40 đổ vào **Tu vi**. Mỗi tầng: Tu vi `3 000 + 500 × t` + linh khí `40 + 20 × t` (t = 0…14).
- 15 tầng, chia **5 bậc theo cây đa** (gắn truyện cây đa xanh lại): **Rễ · Thân · Cành · Lá · Hoa** (mỗi bậc 3 tầng).
- Mỗi tầng: **máu +1,4%, sát thương +1%** (cộng dồn) → tầng 15: máu +21%, ST +15% (đúng trần off ×1,15, ehp ×1,21).
- Qua bậc (tầng 3, 6, 9, 12): **Thử thách Bóng Cu Tí** ở gốc cây đa — đánh một bóng đen dùng đúng vũ khí/chiêu của người chơi (1 phòng, thua không mất gì).
  **[Điểm nối] LOI-DANH.md**: bóng dùng lại bộ chiêu của Cu Tí, là nơi tốt để dạy né hoàn hảo / phản đòn.
- Trần tầng theo vùng: qua vùng 4 → 3 · vùng 5 → 6 · vùng 6 → 9 · vùng 7 → 12 · vùng 8 → 15.
- Giữ `G.MAX_LEVEL = 40` (không nâng cấp — đổi trần cấp kéo theo `xpNeed`, cây kỹ năng, chưởng, rất nhiều bảng đã cân).

### 5.3 Thiên phú (tuỳ chọn, đợt cuối)
Mỗi bậc cảnh giới (từ Thân) mở 1 hàng chọn **1 trong 3** — đổi kiểu chơi, gần như không cộng sức mạnh. Ví dụ: “+1 bình máu nhưng bình hồi ít hơn 20%” · “lăn né 2 lần liền, hồi né lâu hơn 30%” ·
“linh thú đánh mạnh +15%, Cu Tí −5%”. Đổi lại miễn phí ở làng. Bot tính mỗi lựa chọn ≤ ×1,02 (mục 7). Nếu chủ game thấy đủ hệ rồi → bỏ (Q6).

### 5.4 Ấn ký trống đồng
- Mở sau vùng 4: màn **Trống đồng làng** (ảnh trống ghép dần các mảnh). Mỗi mảnh đã lấy lại (4 mảnh vùng 1–4 + 4 mảnh vùng 5–8) → khắc 1 ấn, **chọn 1 trong 2**, đổi được ở làng (50 linh khí).
- Mỗi ấn rất nhỏ (~×1,007 sức mạnh), cái hay là **cảm giác**:

| Mảnh | Ấn A | Ấn B |
|---|---|---|
| 1 Rừng già | Ấn Lá: hồi 1% máu khi nhặt linh khí | Ấn Gai: quái chạm vào bị độc 1 tầng |
| 2 Hang biển | Ấn Sóng: lăn né xa hơn 15% | Ấn Vỏ ốc: đòn đầu mỗi phòng giảm 30% ST nhận |
| 3 Lâu đài | Ấn Đuốc: chưởng to hơn 10% | Ấn Đá: không bị đẩy lùi bởi quái thường |
| 4 Sông sâu (chim Lạc) | Ấn Chim Lạc: chạy nhanh hơn 6% | Ấn Mái chèo: dòng nước đẩy Cu Tí yếu hơn 50% |
| 5 Núi Sét | Ấn Sấm: đòn đặc biệt có 20% gây tê | Ấn Mây đen: hồi chiêu linh thú −15% |
| 6 Hang tối | Ấn Đom đóm: vòng sáng +20% | Ấn Thạch nhũ: +5% ST lên quái đứng yên |
| 7 Đỉnh mây | Ấn Gió: đánh quái bay +8% | Ấn Lông vũ: rơi từ trên cao không mất máu (nếu VUNG.md có) |
| 8 Đền trống | Ấn Mặt trời (chỉ có sau khi thắng Hắc Long — phần thưởng kết): hào quang mặt trời trống đồng sau lưng, máu +3% | (một ấn duy nhất) |

**[Điểm nối] VUNG.md**: ấn 4, 6, 7 tham chiếu luật vùng (dòng nước, vùng tối, rơi cao) — phiên 1 đổi luật thì đổi ấn tương ứng.

---

## 6. Kinh tế

### 6.1 Tiền / vật liệu (cũ + mới)
| Thứ | Có sẵn? | Kiếm ở đâu | Tiêu vào |
|---|---|---|---|
| Vàng | có | thắng ải (80+30·n), quái, việc hôm nay, ải ngày | + luyện phụ kiện, đổi dòng, tiến hoá linh thú, mua Hạt linh |
| Linh khí | có | tinh anh/trùm, rương, đánh kết liễu | + tầng cảnh giới, tiến hoá Thần, đổi ấn |
| Quặng, Gỗ/Vảy/Đá lửa, mảnh trùm | có | như cũ | **không dùng cho hệ mới** |
| Đá nâng bậc, bùa giữ bậc | có | như cũ | **không dùng cho hệ mới** (để ép đồ không đói) |
| **Bột đồng** | MỚI | phân giải phụ kiện; tinh anh vùng 5+ 1–2; rương | luyện, đổi dòng, đúc ở Ông Thợ Bạc |
| **Hạt linh** | MỚI | mỗi trận thắng vùng 5+ 2–4; việc hôm nay; mua 40 vàng/hạt (tối đa 20/ngày) | cho linh thú ăn |
| **Ngọc linh thú** | MỚI | trùm vùng 5–8 lần đầu 2, lặp 1 (Độ khó 2: +1); Sổ yêu quái đủ vùng 1 | tiến hoá |
| Tu vi | MỚI (không phải tiền) | kinh nghiệm sau cấp 40 | tầng cảnh giới |

### 6.2 Thu nhập dự kiến vùng 5–8 (theo công thức `stage.js` kéo dài; bot đo lại)
| Vùng | Ải n | Vàng / trận thắng | ~Số trận (thắng+thua) | Vàng cả vùng | Linh khí cả vùng | Tu vi (XP) cả vùng |
|---|---|---|---|---|---|---|
| 5 | 20–24 | 680–800 (+quái ~100) | ~12 | ~9 500 | ~260 | ~15 000 |
| 6 | 25–29 | 830–950 | ~12 | ~11 000 | ~290 | ~18 000 |
| 7 | 30–34 | 980–1 100 | ~13 | ~13 000 | ~320 | ~21 000 |
| 8 | 35–39 | 1 130–1 250 | ~14 | ~16 000 | ~350 | ~25 000 |
| **Cộng** | | | ~51 | **~50 000** (+việc ngày, ải ngày ~8 000) | **~1 220** | **~79 000** |

### 6.3 Chi tiêu để đạt khuyên dùng 8-5 vs tối đa
| Hệ | Tới mức “khuyên dùng 8-5” | Chi phí | Tối đa | Chi phí tối đa |
|---|---|---|---|---|
| Phụ kiện | 4 món: 2 Ngọc +8, 2 Kim +4 + bộ 4 món | ~22 000 vàng, ~110 Bột đồng | 4 Kim +10 | ~53 000 vàng, ~260 Bột đồng |
| Linh thú (1 con) | cấp 18, dạng Lớn | ~1 000 vàng + 300 hạt (≈ 180 rơi + 120 mua = 4 800 vàng) + 1 Ngọc | cấp 20 Thần | ~13 000 vàng (gồm mua hạt), 4 Ngọc, 200 LK |
| Cảnh giới | tầng 13 | Tu vi ~78 000, linh khí ~2 080 ⚠ | tầng 15 | Tu vi ~97 500, linh khí ~2 700 |
| Ấn ký | 8 ấn | 0 (đổi: 50 LK/lần) | — | — |

⚠ **Linh khí cảnh giới đang vượt thu nhập** (2 080 cần vs ~1 220 + phần thừa vùng 3–4). Hai cách (Q4): **A.** giảm linh khí mỗi tầng còn `20 + 10·t` (tổng ~1 300) ·
**B.** giữ, coi cảnh giới là chỗ hút linh khí thừa và thêm linh khí vào rương vùng 5+. Đề nghị **A** (an toàn hơn, không bơm thêm tiền).

Tổng chi tới khuyên dùng 8-5 ≈ **~29 000 vàng** / thu ~58 000 → còn dư ~50% cho mài/ép đồ vũ khí thứ hai, bộ đồ vùng mới (nếu có), và để người chơi không thấy thiếu. Phần “tối đa” (~70 000 vàng) là chỗ tiêu **sau truyện** — đúng chỗ thiếu hiện nay.

### 6.4 Giữ luật cân bằng (LUAT-CAN-BANG.md)
1. Vùng 1–4 **không** thêm thu nhập nào; hệ mới khoá tới khi qua 4-5 → bot 15/20 ải trước/sau phải lệch ≤ ±5 điểm.
2. Thưởng mới (Bột đồng, Hạt linh, Ngọc) chỉ rơi ở vùng 5+; rương vùng 5+ thêm lựa chọn **thay** (không cộng) vào bảng rương.
3. `G.grindMult` áp cả lên Bột đồng / Hạt linh / Tu vi (vượt 130% khuyên dùng thì giảm).
4. Mua Hạt linh có trần 20/ngày → người chi vàng cũng không vọt linh thú trong một buổi.

---

## 7. Trần cân bằng & cách kiểm bằng bot

### 7.1 Bảng trần (đề xuất)
| Thứ | Trần | Chặn bởi |
|---|---|---|
| Phụ kiện sức mạnh | ×1,30 (off ≤ ×1,25, ehp ≤ ×1,35) | bậc theo vùng, Lò bạc |
| Giảm ST tổng | 75% (cũ) | `Math.min(0.75, dr)` |
| Kháng hệ | 0,8 (cũ) | như cũ |
| Bất tử khi lăn thêm | +0,10 s | dòng phụ |
| Linh thú | ×1,25 / con, 1 con ra trận, cấp 20 | cấp theo vùng, Hạt 20/ngày |
| Cảnh giới | ×1,18, 15 tầng | tầng theo vùng, thử thách |
| Ấn ký | ×1,06 | 8 mảnh trống (truyện) |
| Thiên phú | ×1,02 | 4 hàng |
| Tổng hệ mới | ≈ ×2,1 | tích các trần trên |

### 7.2 Gắn vào code (để bot đọc được)
- Mỗi hệ một tệp có hàm `quyDoi(P) → {off, ehp}` giống `G.boSk.quyDoi`: `phu_kien.js`, `linh_thu.js`, `canh_gioi.js`, `an_ky.js`. `G.powerParts` nhân thêm 4 cặp này.
- `luc_chien.js` (lực chiến hiển thị) và màn Hành trang hiện **từng phần** (“Phụ kiện +18%, Linh thú +12%…”) — người chơi biết nên nâng gì.
- Lưu: `save.pk` (đồ đang đeo + túi, tối đa 40 món), `save.lt` (cấp, dạng, thân thiết từng con, con ra trận), `save.cg` (tu vi, tầng), `save.ak` (ấn đã chọn), thêm tiền `botDong`, `hatLinh`, `ngocLT`.
  **Nhớ `cloud.js` / `engine.js` (chuẩn hoá save) giữ đủ các trường mới**; save cũ thiếu trường → mặc định rỗng.

### 7.3 Bot kiểm (thêm vào `game/tests/` và `tools/can-bang/tinh.js`)
| # | Kiểm | Công cụ | Đạt khi |
|---|---|---|---|
| 1 | Vùng 1–4 không đổi | `python3 game/tests/cay.py --node` (15 ải, sau đó 20 ải khi có vùng 4) trước/sau, mọi cờ hệ mới bật | tỉ lệ thắng từng ải ±5 điểm; số lượt qua không giảm >10%; save mới 95–105 |
| 2 | Phần mỗi hệ ở cuối game | `tinh.js` thêm **mục 8 “nguồn sức mạnh vùng 5–8”** (in off/ehp từng hệ theo ải) | mỗi hệ ≤ trần ± 2% |
| 3 | Đường khuyên dùng 20 → 40 ải | `cay.py --node --kd=8` (mở rộng 40 ải), `bot_nang.js` dạy bot mua theo thứ tự rẻ-hiệu-quả: linh thú cấp → luyện ô rẻ → cảnh giới → bộ | khuyên dùng tăng dần; bot thắng 75% ở khuyên dùng; mỗi ải ≤ 7 lượt chơi trung bình |
| 4 | 4 linh thú ngang nhau | `balance.py --linhthu=nghe|domdom|chimlac|rua` cùng save | lệch ≤ ±5 điểm |
| 5 | 4 bộ phụ kiện ngang nhau | `balance.py --bo=sam|den|may|trong` | lệch ≤ ±5 điểm |
| 6 | Không cày một hệ mà qua | bot chỉ nâng 1 hệ mới (3 hệ kia = 0) | **không** đạt khuyên dùng 7-5 |
| 7 | Kinh tế | `kiem-can-bang/do_b.py kinhte` mở rộng vùng 5–8 | sau mỗi vùng vàng dư không quá 1,5× chi phí bước tiếp theo; linh khí không âm ở bot “bình thường” |
| 8 | Linh thú không làm trùm dễ đột ngột | `balance.py --trum` có / không linh thú, cùng sức mạnh | tỉ lệ thắng ±5 điểm (sức mạnh đã tính linh thú thì phải ngang) |

Sửa luôn lỗi **NaN ở mục 2 `tinh.js` từ ải 1-3** trước khi đo (thấy khi chạy thử, không sửa trong phiên này).

### 7.4 Cờ quay lui
`?phukien=0` · `?linhthu=0` · `?canhgioi=0` · `?anky=0` · `?thienphu=0` · `?hieuungnv=0` (tắt mọi lớp hiệu ứng mục 5.1, sức mạnh giữ nguyên).
Cài đặt cho người chơi: **Hiệu ứng nhân vật: Đủ / Gọn (chỉ hào quang chân) / Tắt**.

---

## 8. Danh sách ảnh cần (CHƯA viết prompt)

| Nhóm | Tên ảnh (đề xuất) | Số tấm |
|---|---|---|
| Biểu tượng phụ kiện | `pk-{voncho|vongtay|ngocboi|bua}-{dong|bac|ngoc|kim}` (16) + biến thể bộ ở bậc của vùng: `pk-{sam|den|may|trong}-{4 ô}` (16) | 32 |
| Khung bậc phụ kiện | `pk-khung-{dong|bac|ngoc|kim}` | 4 |
| Hào quang chân 4 bộ | `hq-chan-{sam|den|may|trong}` × 8 khung lặp | 32 |
| Vệt lăn 4 bộ | `vet-lan-{sam|den|may|trong}` × 6 khung | 24 |
| Hạt cảnh giới | `hat-cg-{la|hoa}` × 4 khung | 8 |
| Linh thú | 4 con × 3 dạng (Con / Lớn / Thần) × 6 động tác (đứng, chạy, đánh, chiêu, mệt, vui) — mỗi động tác 1 dải khung | 72 dải (~430 khung) |
| Hiệu ứng chiêu linh thú | `fx-lt-{gam-sam|den-long|luon-vong|mai-rua}` × 6–8 khung | 4 dải |
| Chân dung linh thú (bảng chọn) | 4 con × 3 dạng | 12 |
| Hạt linh / Bột đồng / Ngọc linh thú | biểu tượng tiền | 3 (+3 kiểu Hạt linh: bánh gai, cơm nắm, hạt sen) |
| NPC Ông Thợ Bạc | 1 ảnh đứng + 1 chân dung + lò bạc ở làng | 3 |
| Màn Trống đồng làng | trống trống không + 8 mảnh ghép + 15 hình ấn | 24 |
| Cảnh giới | nền gốc cây đa thử thách (1), Bóng Cu Tí (dùng lại sprite Cu Tí tô đen — **0 ảnh mới**), 5 huy hiệu bậc | 6 |
| Giao diện | bảng Phụ kiện, bảng Linh thú, bảng Cảnh giới, tab mới Hành trang | ~6 |
| **Tổng** | | **~234 ảnh / dải** |

Dung lượng: linh thú là nặng nhất (~1,5–2 MB WebP). Vùng 4 đã đẩy lên ~18,5 / 20 MB → **phải tải theo vùng** (linh thú chỉ tải con đang ra trận) hoặc nâng trần (Q7).
**[Điểm nối] VUNG.md**: phiên 1 cũng thêm ảnh vùng 5–8 → hai phiên cần chung một bảng dung lượng.

---

## 9. Điểm nối (gom lại)

| Với | Việc | Ai quyết |
|---|---|---|
| VUNG.md | Nơi trao 4 linh thú, câu truyện; người cần cứu vùng 6 tặng Đom Đóm | phiên 1 |
| VUNG.md | Luật vùng 6 (tối / đèn), vùng 7 (quái bay, rơi cao), vùng 8 (nhịp trống) — bộ phụ kiện và ấn ký dựa vào | phiên 1 |
| VUNG.md | Khuyên dùng vùng 5–8 (~850 / 1 040 / 1 270 / 1 450) — bảng 2.1 chỉ là ngân sách, phiên 1 + bot chốt | phiên 1 + bot |
| VUNG.md | Bảng rơi tinh anh / trùm nhỏ / trùm vùng thêm phụ kiện, Bột đồng, Hạt linh, Ngọc | gộp khi code |
| LOI-DANH.md | Ngân sách vũ khí mới / hệ Sét ≤ ×1,10; tia sét Bộ Sấm dùng chung luật lan hệ Sét; kháng Sét ở Bùa hộ mệnh | phiên 2 |
| LOI-DANH.md | Chiêu hợp lực linh thú gắn vào nút chiêu linh thú + mốc thân thiết 10/30/60 | phiên 2 |
| LOI-DANH.md | Dòng phụ “cửa sổ né hoàn hảo”, thử thách Bóng Cu Tí dạy né/phản đòn | phiên 2 |

---

## 10. Thứ tự làm (mỗi đợt ~3 phiên song song; xong đợt → bot đo → chủ game thử → đợt sau)

| Đợt | Phiên A | Phiên B | Phiên C | Cần trước |
|---|---|---|---|---|
| **0 — Khung** (làm được ngay cả khi chưa có vùng 5) | `quyDoi` chung + tách sức mạnh theo nguồn trong `G.powerParts`, `luc_chien.js`, Hành trang hiện từng phần | Save mới (`pk/lt/cg/ak`, tiền mới) + `cloud.js` + chuẩn hoá save cũ | Sửa NaN `tinh.js`, thêm mục 8 “nguồn sức mạnh”, khung bot `cay.py` 40 ải | vùng 4 xong |
| **1 — Phụ kiện** | Dữ liệu ô/bậc/dòng/bộ + rơi + phân giải | Ông Thợ Bạc: luyện, đổi dòng, đúc, Lò bạc | Bảng Phụ kiện trong Hành trang + biểu tượng (ảnh tạm vẽ code) | đợt 0 |
| **2 — Linh thú 1 (Nghê Sấm)** | Đi theo, AI đánh, mệt/dậy, không đánh vật hệ | Cấp, Hạt linh, tiến hoá, đổi ở làng/suối | Ảnh Nghê (3 dạng × 6 động tác) + chiêu Gầm sấm | đợt 0; nên đi cùng vùng 5 |
| **3 — Hiệu ứng nhân vật + Cảnh giới** | Lớp hào quang chân / vệt lăn / màu vệt chém / cài đặt Đủ-Gọn-Tắt | Cảnh giới: Tu vi, tầng, trần theo vùng | Thử thách Bóng Cu Tí + nền gốc đa | đợt 1 |
| **4 — Ấn ký + 3 linh thú còn lại** | Màn Trống đồng làng + 15 ấn | Đom Đóm Đá, Chim Lạc con | Rùa Vàng con + chân dung + bảng chọn | theo tiến độ vùng 6–8 |
| **5 — Cân bằng cả cụm** | Bot 40 ải, kiểm 1–8 mục 7.3, chốt số | Kinh tế vùng 5–8, bảng trước/sau | (tuỳ Q6) Thiên phú | mọi đợt trên |

Mỗi đợt có cờ tắt riêng; báo cáo kèm bảng trước/sau (LUAT-CAN-BANG.md).

---

## 11. Câu hỏi cần chủ game quyết (in đậm = đề nghị)

1. **Mở hệ mới khi nào**: **A. tất cả sau khi qua vùng 4** (vùng 1–4 giữ nguyên cân bằng) · B. phụ kiện mở sớm từ vùng 3 (ít món) để có chỗ tiêu vàng thừa ngay.
2. **Số ô phụ kiện**: **A. 4 ô** (vòng cổ, vòng tay, ngọc bội, bùa) · B. 3 ô (bỏ bùa, kháng hệ để cây kỹ năng lo) · C. 6 ô (thêm nhẫn, đai — nhiều ảnh, khó cân hơn).
3. **Luyện phụ kiện có may rủi không**: **A. luôn thành công** (ép đồ đã có may rủi) · B. có tỉ lệ như ép đồ.
4. **Linh khí cho cảnh giới**: **A. giảm còn `20 + 10·t`** · B. giữ `40 + 20·t` và thêm linh khí ở rương vùng 5+.
5. **Linh thú**: **A. 4 con gắn truyện, 1 con ra trận** · B. thêm con “nuôi ở làng” (Mèo mướp, Trâu đất) không đánh, chỉ cho vui · C. cho 2 con ra trận (khó cân, khó nhìn).
6. **Thiên phú**: **A. để sau cùng, tuỳ phản hồi** · B. làm cùng cảnh giới · C. bỏ hẳn.
7. **Dung lượng**: **A. tải linh thú theo con đang ra trận** · B. nâng trần 20 MB → 25 MB.
8. **Tên cảnh giới**: **A. Rễ · Thân · Cành · Lá · Hoa (cây đa)** · B. tên kiểu tu tiên (Luyện Khí, Trúc Cơ…) · C. tên khác chủ game đặt.
9. **Hào quang có cho tắt/chọn không**: **A. có cài đặt Đủ / Gọn / Tắt, và chọn hào quang của bộ đã từng đủ 4 món dù đang mặc bộ khác** · B. chỉ hiện đúng bộ đang mặc.
10. **Hắc Long thắng xong**: **A. thưởng Ấn Mặt trời + bậc Kim tiếp tục rơi ở chế độ chơi lại** · B. mở thêm “vùng sau truyện” (cần phiên 1 nghĩ thêm).
