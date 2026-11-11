# Cân bằng wave — ĐỀ XUẤT (chờ duyệt, CHƯA sửa số nào trong game)

Đo 11/11 bằng trận bot thật (`tools/thap-bot-tran.js`, đúng code game, 4 hạt giống mỗi ca, thẻ ở cấp đầu). Biến thể bơm lúc đo: `tools/thap-bot-bienthe.js`.

## 1. Kết luận
- **Nên chọn B** (đúng ý "giảm sát thương ụ + giảm quái"): bộ Vàng tấn công chết quanh **wave 65** (60–68) — trước là 46; tài khoản mới **qua được tầng 1–6** (trước 0/4 mọi tầng); số quái sống cùng lúc giảm **3–4 lần**.
- **A** = phương án không đụng ụ (chỉ đổi quái + máu): bộ Vàng tới wave 69 (67–73).
- Cả hai **giữ nguyên kinh tế mana**: mana nhận từ giết quái tới wave 30 lệch +1% (32 300 → 32 600–33 300).
- Co-op bộ của bạn, wave 25–34: quái sinh mỗi wave **101 → 28**, đỉnh quái sống **31 → 8** (cao nhất 74 → 20).
- "Mana đầu 100 cho tầng ≤ 5" **không đủ**: tầng 4 thắng 1/4, tầng 5 thắng 0/4. Nên giữ công thức mana theo wave đầu (100 · 100 · 140 · 250 · 400).

## 2. Bảng trước / sau
Wave = trung vị (thấp nhất–cao nhất) của 4 trận, trần wave 100; ✓n = số trận qua wave 100. Leo Tháp = số trận thắng / 4. Đỉnh = quái sống cùng lúc, trung vị / cao nhất.

| Bộ | Trước | A | B | Đỉnh trước | Đỉnh A | Đỉnh B |
|---|---|---|---|---|---|---|
| Khởi đầu · tầng 1 | 0/4 | 4/4 | 4/4 | 25/27 | 5/5 | 5/6 |
| Khởi đầu · tầng 2 | 0/4 | 4/4 | 4/4 | 24/27 | 8/8 | 8/8 |
| Khởi đầu · tầng 3 | 0/4 | 3/4 | 3/4 | 24/26 | 9/12 | 9/12 |
| Khởi đầu · tầng 4 | 0/4 | 3/4 | 3/4 | 26/26 | 9/12 | 9/13 |
| Khởi đầu · tầng 5 | 0/4 | 4/4 | 4/4 | 25/28 | 13/17 | 13/15 |
| Khởi đầu · tầng 6 | 0/4 | 4/4 | 4/4 | 28/30 | 13/14 | 11/14 |
| Khởi đầu · tầng 8 | 0/4 | 2/4 | 2/4 | 28/29 | 19/23 | 17/22 |
| Khởi đầu · tầng 10 (trùm) | 0/4 | 2/4 | 3/4 | 28/33 | 18/24 | 17/17 |
| Khởi đầu · tầng 12 | 0/4 | 4/4 | 4/4 | 41/44 | 25/26 | 23/26 |
| Co-op `cobac,vughep,sinhdoi,saochep,tudo` | 29 (9–34) | 75 (29–90) | 80 (42–90) | 68/87 | 30/32 | 28/66 |
| Solo cùng bộ trên | 65 (26–100) ✓2 | 86 (34–90) | 80 (80–98) | 43/53 | 11/20 | 30/34 |
| `nguyenrua,sinhdoi,khoisinh` + Ember, Blood Vein | 58 (24–100) ✓1 | 100 (60–100) ✓3 | 73 (53–100) ✓1 | 45/55 | 8/18 | 22/41 |
| **Vàng tấn công** `lualien,hopca,luutru,nhatthuc,railgun` | **46** (33–46) | **69** (67–73) | **65** (60–68) | 54/62 | 31/38 | 31/41 |
| 4 Vàng + Lucky Slot (Đỏ) | 48 (47–48) | 79 (74–80) | 72 (60–80) | 59/64 | 24/36 | 17/33 |
| Đỏ nặng `bocap,leviathan,ronglua,overlord,cobac` | 98 (90–100) ✓2 | 85 (80–90) | 90 (80–90) | 38/56 | 11/19 | 17/30 |
| Tím tấn công `bao,combo,cuongno,docton,lienket` | 17 (15–18) | 25 (23–28) | 28 (27–33) | 33/37 | 24/25 | 24/31 |
| Xanh + Trắng `laser,mortar,kiembang,tia,lien` | 16 (15–18) | 25 (18–27) | 24 (20–26) | 32/41 | 22/27 | 23/24 |
| Kiểu Thử thách tuần (1 Vàng 2 Tím 1 Xanh 1 Trắng, +5 cấp) | 22 (17–25) | 44 (38–50) | 42 (40–50) | 37/46 | 21/23 | 27/28 |
| Vàng tấn công · Leo Tháp tầng 20 / 40 / 60 | 4/4 · 2/4 · 0/4 | 4/4 · 4/4 · 4/4 | 4/4 · 4/4 · 4/4 | 11 · 51 · 57 | 3 · 8 · 31 | 3 · 9 · 33 |

Đỉnh ở cột trên thường rơi vào lúc sắp thua (quái dồn lại). Khi bàn còn trụ được:

| Đoạn wave | Quái sinh / wave (trước → sau) | Đỉnh quái sống trung vị (cao nhất) trước → sau |
|---|---|---|
| Co-op bộ của bạn, wave 25–34 | 101 → 28 | 31 (74) → 8 (20) |
| Co-op bộ của bạn, wave 35–45 | bản cũ không tới | sau: 11 (22–24), sinh 34–36 |
| Solo Vàng tấn công, wave 35–45 | 96 → 17 | 33 (62) → 2–3 (6–7) |

## 3. Số cụ thể sẽ đổi
**Chung cho A và B**
- **Leo Tháp:** wave đầu tầng t = `min(t, 5 + ⌊0,62(t−1)⌋)` → tầng 1–11 bắt đầu ở wave 1–11, tầng 12 trở lên như cũ (tầng 100 vẫn wave 66–70). Mana đầu giữ công thức cũ theo wave đầu: tầng 1–11 = 100 · 100 · 140 · 250 · 400 · 580 · 790 · 1 030 · 1 310 · 1 620 · 1 960.
- **Số quái mỗi wave:** `min(20, 8 + ⌊w/4⌋)` (cũ `min(32, 9 + ⌊0,75w⌋)`). Wave 10: 16 → 10 · wave 30: 31 → 15 · wave 50: 32 → 20.
- **Slime:** Splitter tách **3** con (cũ 5); Big Splitter tách **2** Splitter (cũ 3). Slime chỉ còn ở wave "Phân bào" (trước: 13% số quái ở mọi wave từ wave 6).
- **Wave có chủ đề** theo chữ số cuối của wave (n = số quái ở trên):

| Cuối wave | Chủ đề | Thành phần |
|---|---|---|
| 1, 6 | Hỗn hợp | Crawler; 20% Flyer; 10% Frost Flyer (từ wave 8); con thứ 6 là Giant (từ wave 4) |
| 2 | Bầy đàn | 1,8n Swarmling (máu ×0,5, tốc 44) |
| 3 | Không kích | n Flyer, 40% là Frost Flyer từ wave 8 |
| 4 | Thiết giáp | n/3,2 Giant (ít nhất 2) |
| 5 | Tinh anh | 1 Elite (máu ×12, lọt −2 tim) + n/2 Crawler |
| 7 | Tốc hành | 0,9n Runner (máu ×0,9, tốc 60, miễn làm chậm) |
| 8 | Phân bào | 0,45n Splitter (ít nhất 3); từ wave 30 con thứ 4 là Big Splitter |
| 9 | Hỗn loạn | 2 chủ đề ngẫu nhiên (Bầy đàn / Không kích / Thiết giáp / Tốc hành), mỗi bên một nửa |
| 0 | Trùm | như cũ |

- **Mana khi giết (để tổng mana không đổi dù ít quái):** quái thường × `(1 + 1,7·min(w,30)/30)`; trùm giữ ×12 như cũ. Hệ số loại: Giant 4 (cũ 2) · Big Splitter 3 (cũ 2) · Swarmling 0,5 · Runner 1 · Elite 10.

**Riêng A — không đổi ụ**
- Máu quái: wave 41–60 **×1,096**/wave (cũ ×1,08), từ wave 61 **×1,112**/wave. Tới wave 40 như cũ. So với cũ: wave 50 ×1,16 · wave 60 ×1,35 · wave 70 ×1,81.

**Riêng B — giảm sát thương ụ (đề nghị chọn)**
- Gánh hậu kỳ ụ Tấn công Vàng và Đỏ: **+2%/wave** từ wave 20 tới 40, **sau wave 40 không tăng nữa** (cũ: Vàng +3,5%, Đỏ +4%, sau 40 còn nhân ×1,02 / ×1,023 mỗi wave). Hệ số ở wave 40 / 60 / 70: Vàng 1,70 / 2,53 / 3,08 → **1,40**; Đỏ 1,80 / 2,84 / 3,56 → **1,40**.
- Máu quái thấp hơn để bù: giảm dần đều tới **×0,95** ở wave 30; wave 41–60 **×1,069**/wave; từ wave 61 **×1,091**/wave. So với cũ: wave 50 ×0,86 · wave 60 ×0,78 · wave 70 ×0,86 · wave 80 ×0,95.
- Lợi của B: bộ Tím lên wave 28 (A: 25), khoảng cách Vàng ↔ Đỏ hẹp lại, con số sát thương nhỏ hơn.

## 4. Phần thưởng bị lệch + gợi ý
- **Leo Tháp tầng 1–11** (trước gần như không qua được với bộ khởi đầu): nay nhận dần 1 210 vàng + 40 ngọc + Rương Thường tầng 10. Đây là thưởng tân thủ đúng ý → **giữ nguyên**. Hành trình ngày 1 "qua tầng 5" và ngày 2 "hạ trùm tầng 10" nay làm được.
- **Leo Tháp tầng 41–60** nay vừa sức bộ Vàng cấp đầu (bot 0/4 → 4/4 ở tầng 60): thêm khoảng 11 100 vàng, 80 ngọc, 2 Rương Vàng (tầng 50, 60), 3 Tinh thể Đỏ (tầng 50). Gợi ý: **giữ**; nếu thấy nhanh quá thì dời 3 Tinh thể Đỏ từ tầng 50 lên tầng 60.
- **Tầng 70–100** (Rương Huyền thoại, 5 Tinh thể Đỏ, thành tựu 100 / 200 ngọc): bộ Vàng nay với tới wave 60–70 nên sẽ chạm vùng này. Bot không đo được (mục 5) → **chưa đề xuất số, cần người chơi thử**.
- **Thử thách tuần** (mốc wave 15 / 25 / 35 / 45): bộ kiểu tuần 22 → 42–44. Mốc cũ thành quá dễ → gợi ý **20 / 30 / 40 / 50** (thưởng giữ nguyên).
- **Vô tận** (mốc tuần wave 80–120): bộ Đỏ nặng 98 → 85–90 → mốc 100 trở lên khó hơn. Gợi ý **75 / 85 / 95 / 105 / 115**.
- **XP và điểm sự kiện theo wave** (co-op, PVP): mỗi trận dài hơn nên điểm mỗi trận cao hơn, điểm mỗi phút gần như cũ; điểm sự kiện đã có trần 60/trận → **giữ**.
- **Thử thách ngắn, Săn Trùm:** thưởng lần đầu không đổi; độ khó chưa đo.

## 5. Chưa kiểm / bot không đại diện
- **Leo Tháp tầng ≥ 70 bộ Vàng: 0/4 ở cả ba bản** — bot chết ở wave thứ 2 khi còn 27 000–54 000 mana chưa tiêu, bàn mới 2–3★, chưa power-up (bot chỉ thao tác 0,6 s/lần). Số này **không phản ánh người chơi**.
- **Bộ `nguyenrua,sinhdoi,khoisinh`:** bot ghép hỏng 700–1 000 lần/4 trận, kết quả 24–100 → chỉ tham khảo. **Co-op bộ `cobac…`:** bot kẹt 78–161 lần, kết quả 9–90.
- **Bộ khởi đầu có hỗ trợ** (`tia,lien,mana,khuech,doc`): tầng 1 thắng 3/4, tầng 3 thắng 0/4 ở A và B — bot không biết xếp ụ hỗ trợ.
- 4 hạt giống mỗi ca, dao động lớn. Thẻ ở cấp đầu, chỉ huy mặc định, không dùng kỹ năng chạm tay.
- **4 quái mới** (khiên, hồi máu, tự nổ, tàng hình) chưa có code → chưa đo. Chủ đề chỉ dùng hành vi quái sẵn có + 3 loại mới thuần số liệu (Swarmling, Runner, Elite).
- Chưa đo: PVP (đột tử wave 30), Săn Trùm (giới hạn 90 s — ở B ụ Vàng/Đỏ yếu đi 18–55% ở wave 40–70, máu trùm chỉ giảm 5–22%), Thử thách ngắn, chương Leo Tháp có luật riêng (Horde, Giants…) ở tầng cao, FPS thật trên iPhone, online tất định với bảng wave mới.
- "Đỏ nặng" là bộ 5 Đỏ (game thật chỉ cho 1 Đỏ) — chỉ để so trần sức mạnh.

## 6. Dữ liệu thô
`bot-wave-goc.json` · `bot-wave-A.json` · `bot-wave-B.json` (28 ca × 4 hạt, có số quái sinh / đỉnh / mana từng wave) · `bot-wave-A-mana100.json` (tầng 3–5 với mana đầu 100). Gộp bảng: `node tools/thap-bot-bang.js docs/demo-hop-tuong/tocban/bot-wave-{goc,A,B}.json`.
