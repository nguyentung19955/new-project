# GIAI ĐOẠN C — LEO THÁP · SĂN TRÙM · TINH THỂ ĐỎ + ẤN ĐỎ · THỬ THÁCH NGẮN (thiết kế 09/11/2026)

> Nguồn: `tuvan/tien-trinh/THIET-KE.md` §4.1–§4.2, §6.2 · `tien-trinh/CHATGPT-THU-PHI.md` (thử thách ngắn 3–5 phút cho người mới, hết vé vẫn luyện tập) ·
> `tuvan/gacha-thu-thap/BANG-MO-NHOM.md` (thưởng = RƯƠNG, chỉ ụ trong bể rơi). Mã: `thap/js/chedo-c.js` + `thap/css/chedo-c.css`. Kiểm: `tools/thap-kt-*.js` (bên dưới).
> Mọi số = đề xuất ban đầu; đo lại sau khi có dữ liệu người chơi.

## 0. Nguyên tắc (giữ triết lý người dùng)

- **Vừa đủ khó**: mỗi tầng/bậc khó dần, thua không mất gì ngoài thời gian (Săn Trùm mất vé). Không gợi ý cách vượt, không bảng "nên dùng ụ nào" — chỉ nêu **luật** và **kết quả cần đạt**.
- **Đỏ hiếm**: không chế độ nào rơi bản Đỏ trực tiếp. Đường Đỏ có chủ đích duy nhất = **Tinh thể Đỏ** từ mốc rất khó → **Ấn Đỏ** (15 tinh thể + 50 000 vàng → 1 bản Đỏ tự chọn trong các Đỏ ĐÃ MỞ).
- **Thưởng = RƯƠNG / mảnh theo hệ gacha thu thập**: Rương Thường / Rương Vàng / Rương Huyền thoại (n bản Vàng bảo đảm) — mọi thẻ chỉ rơi ụ trong bể (đã mở theo cấp phi công hoặc đã có). Mỗi thưởng **1 lần**, ghi cờ TRƯỚC khi phát.
- **Tất định**: mỗi tầng / (trùm, bậc) / thử thách là **kịch bản cố định** — thành phần wave sinh bằng RNG có hạt (hạt = chế độ + số tầng/trùm/bậc), hạt trận cố định (lịch chiêu trùm như nhau). Code chế độ không gọi `Math.random`. Chưa có xếp hạng ở giai đoạn này (để D).
- **Không ăn gian kỷ lục**: trận chế độ C **không** ghi kỷ lục Solo, không tính mốc wave Solo / điểm sự kiện / nhiệm vụ theo wave / thành tựu (bắt đầu ở wave cao sẽ phá các mốc đó); không có Rương Trận. XP phi công chỉ ở lần thắng đầu.
- Không năng lượng (trừ vé Săn Trùm). Không có chữ "hướng dẫn cách chơi" trên màn chọn.

## 1. Luật chung của trận chế độ C

| Mục | Luật |
|---|---|
| Bàn / bộ bài | Bàn SOLO, **bộ bài tự chọn** (5 ụ đã sở hữu + chỉ huy), **cấp thẻ thật** của người chơi, 3 tim (trừ luật riêng) |
| Bắt đầu | Wave đầu W, mana M = `max(100, ⌊0,6 × 27·W² / 10⌋·10)` (27·W² ≈ mana bot tích được tới wave W, đo bằng `tools/thap-sim-che-do-c.js`; ×0,6 → bàn yếu hơn Solo cùng wave, phải dựng bàn nhanh) · 5 giây chuẩn bị trước wave đầu |
| Wave | Mỗi trận **5 wave** (W … W+4); thành phần wave theo bảng quái Solo của wave đó nhưng **sinh bằng RNG có hạt** của tầng; trùm chỉ xuất hiện ở wave cuối của tầng trùm / trận Săn Trùm |
| Thắng | Sống qua wave cuối và dọn sạch sân (Săn Trùm: **hạ được trùm**) |
| Thua | Hết tim (Săn Trùm thêm: trùm lọt / hết **90 giây** kể từ khi trùm vào sân) |
| Chơi lại | Thắng hay thua đều chơi lại được ngay (RETRY), thắng tầng → nút NEXT FLOOR |

**Luật chương / đột biến nhẹ** (chỉ dùng loại không cần móc vào sát thương — đổi lúc sinh quái):

| Mã | Tên (EN) | Luật |
|---|---|---|
| NHANH | Swift | quái +25% tốc độ, −15% máu |
| DONG | Horde | +40% số quái, −25% máu mỗi con |
| KHONGLO | Giants | cứ 3 quái có 1 Giant |
| BAY | Sky Raid | 50% quái thường thành quái bay |
| MONG | Glass Core | chỉ 1 tim |
| DAY | Thick Hide | quái +30% máu |

## 2. LEO THÁP (TOWER CLIMB) — mở Cấp phi công 5

- 100 tầng = 10 chương × 10 tầng. Tầng t: **W_t = 5 + ⌊0,62·(t−1)⌋** (tầng 1: wave 5–9 · tầng 50: 35–39 · tầng 100: 66–70). Tầng chia hết cho 10 = **tầng trùm** (wave cuối là trùm, trùm cố định theo tầng, xoay 12 trùm).
- Phải thắng tầng t mới mở tầng t+1. Thắng lại tầng cũ: không thưởng.
- Luật chương: C1 — · C2 Horde · C3 Swift · C4 Giants · C5 Thick Hide · C6 Sky Raid · C7 Glass Core · C8 Swift + Giants · C9 Horde + Thick Hide · C10 máu ×(1,2 → 3,0 theo tầng 91–100).
- Thời lượng: 5 s chuẩn bị + 4 wave × ≤ 20 s + wave cuối (trùm ≤ 60 s) ≈ **2–3 phút/tầng**.

| Thưởng lần đầu | Tầng 1–30 | Tầng 31–70 | Tầng 71–100 |
|---|---|---|---|
| Mỗi tầng | 50 + 10·t vàng | như trái | như trái |
| Mỗi 5 tầng (5, 10, 15…) | 20 ngọc | 20 ngọc | 30 ngọc |
| Tầng trùm (10, 20, 30) | **Rương Vàng** | — | — |
| Tầng trùm (40, 50, 60, 70) | — | **Rương Huyền thoại** (1 bản Vàng) | — |
| Tầng trùm (80, 90, 100) | — | — | **Rương Huyền thoại** (2 bản Vàng) |
| Đặc biệt | — | tầng 50: **3 Tinh thể Đỏ** | tầng 100: **5 Tinh thể Đỏ** |
| XP phi công | 5 + ⌊t/5⌋ | | |

Tổng 1 lần: **55 500 vàng · 460 ngọc · 3 Rương Vàng · 7 Rương Huyền thoại (10 bản Vàng) · 8 Tinh thể Đỏ · 1 470 XP**.

## 3. SĂN TRÙM (BOSS HUNT) — mở khi đã hạ 3 trùm khác nhau

- Chọn 1 trong 12 trùm **đã từng hạ** (trùm chưa hạ: ảnh tối, "Defeat it once to hunt") + bậc 1–10 (bậc b mở khi đã thắng bậc b−1 của CÙNG trùm).
- Bậc b ≤ 7: wave 10b−4 … 10b−1 quái thường, **trùm ở wave 10b**. Bậc 8 / 9 / 10: trùm wave 70, máu trùm ×2 / ×4 / ×8 (quái thường như wave 66–69).
- Trùm có **90 giây**; hết giờ hoặc trùm lọt = thua. Thời lượng ≈ **3–4 phút**.
- **Vé**: 3 vé/ngày miễn phí (reset 0 giờ); mua thêm tối đa 2 vé/ngày, **3 000 vàng/vé**. Vào trận = trừ 1 vé (thua vẫn mất). **Hết vé vẫn đánh được ở chế độ LUYỆN TẬP** (không thưởng, không mở bậc).
- Không gợi ý trùm nào khắc ụ nào — người chơi tự tìm bộ phản trùm.

| Thưởng lần đầu mỗi (trùm, bậc) | Bậc 1–3 | Bậc 4–6 | Bậc 7 | Bậc 8–10 |
|---|---|---|---|---|
| Thắng lần đầu | 300 vàng | 1 000 vàng + 15 ngọc | **Rương Huyền thoại** (1 Vàng) | 2 000 vàng + 30 ngọc |
| Thắng cả 12 trùm ở cùng bậc | bậc 1/2/3: **Rương Thường** | bậc 4/5/6: **Rương Vàng** | **Rương Huyền thoại** (3 Vàng) | bậc 10: **2 Tinh thể Đỏ** |
| XP phi công | 5 + 2·b | | | |

**Trùm tuần**: 1 trùm xoay theo tuần (`KT.tuan() % 12`, như nhau với mọi người); thưởng 1 lần/tuần theo bậc cao nhất đã thắng trong tuần: bậc 3 = 2 000 vàng · bậc 5 = 50 ngọc · bậc 7 = Rương Huyền thoại · **bậc 9 = 1 Tinh thể Đỏ**.

Tổng 1 lần (120 ô): **118 800 vàng · 1 620 ngọc · 12 + 3 Rương Huyền thoại (15 bản Vàng) · 3 Rương Thường · 3 Rương Vàng · 2 Tinh thể Đỏ**. Người chơi Thường thực tế tới bậc 5–6: ≈ 47 000 vàng · 540 ngọc.

## 4. TINH THỂ ĐỎ + ẤN ĐỎ

- Tiền tệ mới duy nhất cho Đỏ, lưu `turret_kt.mh.tt` (khoá con mới trong khoá có sẵn; gộp hồ sơ Firebase lấy LỚN NHẤT của tổng đã nhận − đã tiêu).
- Nguồn (giai đoạn C): Tháp tầng 50 (3) · tầng 100 (5) · Săn Trùm đủ 12 trùm bậc 10 (2) · Trùm tuần bậc 9 (1/tuần). Giai đoạn D thêm: Thử thách tuần wave 45 (1/tuần), Vô tận wave 100 (1/tuần).
- **Ấn Đỏ** (Cửa hàng → LÒ RÈN, cạnh Ấn Vàng; mở theo điều kiện Đỏ = Cấp 12 + kỷ lục wave 30): **15 Tinh thể + 50 000 vàng → 1 bản Đỏ TỰ CHỌN** trong các Đỏ đã mở/đã có (bảng chọn như Ấn Vàng). Không giới hạn tuần (tinh thể đã hiếm).
- Ước lượng: một lần 10 tinh thể; hằng tuần ≤ 1 (giai đoạn C). Người Giỏi: Ấn Đỏ đầu tiên ≈ tuần 5–6, sau đó ≈ 1 / 15 tuần (tới giai đoạn D ≈ 1 / 5–8 tuần). Người Thường: ≈ 1–2 / năm. → Đỏ vẫn hiếm hơn Vàng rõ rệt (N4).

## 5. THỬ THÁCH NGẮN (QUICK TRIALS) — mở ngay sau hướng dẫn

6 thử thách cố định, **3–5 phút**, mở lần lượt (thắng cái trước mới mở cái sau). Mục tiêu chỉ nói kết quả.

| # | Tên | Wave | Luật | Thưởng lần đầu |
|---|---|---|---|---|
| 1 | First Stand | 1–8 | — | Rương Thường |
| 2 | Boss Gate | 6–10 (trùm wave 10) | — | 30 ngọc + Rương Thường |
| 3 | Swarm Line | 8–13 | Horde | 1 000 vàng + Rương Thường |
| 4 | Giant Steps | 10–15 | Giants | Rương Vàng |
| 5 | Glass Core | 12–17 | 1 tim | 40 ngọc + 1 000 vàng |
| 6 | Sky Storm | 15–20 (trùm wave 20) | Sky Raid + Swift | Rương Vàng |

XP phi công: 20 mỗi thử thách (lần đầu). Tổng 1 lần: **3 Rương Thường · 2 Rương Vàng · 70 ngọc · 2 000 vàng · 120 XP**.

## 6. Kinh tế ước lượng (cộng thêm so với sau đợt 1 + gacha thu thập)

| Nguồn mới | Vàng | Ngọc | Rương | Bản Vàng bảo đảm | Tinh thể Đỏ |
|---|---|---|---|---|---|
| Leo Tháp (1 lần) | 55 500 | 460 | 3 Vàng | 10 | 8 |
| Săn Trùm (1 lần, đủ 120 ô) | 118 800 | 1 620 | 3 Thường · 3 Vàng | 15 | 2 |
| Thử thách ngắn (1 lần) | 2 000 | 70 | 3 Thường · 2 Vàng | — | — |
| Trùm tuần (mỗi tuần, tối đa) | 2 000 | 50 | — | 1 | 1 |
| Tiêu mới | vé 3 000/vé (≤ 6 000/ngày) · Ấn Đỏ 50 000 | | | | 15/Ấn |

- Một lần ≈ 176 000 vàng · 2 150 ngọc rải trong 1–3 tháng (người Thường đạt ≈ 40–60%). Vàng không phải nút thắt; vé + Ấn Đỏ là chỗ tiêu vàng mới cho người giỏi.
- Bản Vàng bảo đảm thêm 25 (1 lần) + ≤ 1/tuần → thời gian MAX 1 thẻ Vàng cụ thể gần như không đổi (rải 33 Vàng). Bản Đỏ: chỉ qua Ấn Đỏ → tỉ lệ thời gian Đỏ/Vàng giữ ≥ 2×.

## 7. Mở khoá + nơi vào

| Chế độ | Mở | Nơi vào |
|---|---|---|
| Thử thách ngắn | xong / bỏ qua hướng dẫn | HOME → GAME MODE → QUICK TRIALS → PLAY |
| Leo Tháp | Cấp phi công 5 | GAME MODE → TOWER CLIMB |
| Săn Trùm | đã hạ 3 trùm khác nhau | GAME MODE → BOSS HUNT |
| Ấn Đỏ | Cấp 12 + kỷ lục wave 30 | SHOP → LÒ RÈN |

Mục khoá trong GAME MODE: tối + nhãn điều kiện (giống khoá đợt 1). Mở được → báo trong bảng lên cấp ("NEW FEATURES UNLOCKED").

## 8. Lưu (khoá con mới, không đổi khoá cũ)

`turret_kt.cd = { thap: { max, nhan{} }, san: { da{"trum:bac"}, du{bac}, ngay, ve, mua, tuan, tuanMax, tuanNhan{} }, thu: { da{} } }` · `turret_kt.mh.tt` (tinh thể) + `mh.ttDung`.
Gộp hồ sơ Firebase: cờ OR, số lớn nhất.

## 9. Hình (chỉ ảnh có sẵn; ảnh riêng chờ gen)

Dùng tạm: Leo Tháp = `ua_ts_xp` (cánh + mũi tên lên) · Săn Trùm = `ua_ic_trum` · Thử thách = `ua_ic_nv` · tinh thể = `ua_ts_do` · vé = `ua_ic_trum` nhỏ.
Prompt chờ gen (lưới 2×2, nền magenta #FF00FF, same style as attached ua_ic_*): "tower climb emblem: crystal spire with stairs" · "boss hunt emblem: crossed spears over horned skull" · "trial hourglass emblem" · "hunt ticket: golden ticket with skull seal".

## 10. Thứ tự làm + kiểm

1. Leo Tháp — `tools/thap-kt-thap-leo.js` · 2. Săn Trùm — `tools/thap-kt-san-trum.js` · 3. Tinh thể Đỏ + Ấn Đỏ — `tools/thap-kt-an-do.js` · 4. Thử thách ngắn — `tools/thap-kt-thu-thach.js`.
Mỗi mục: chạy kèm `thap-kt-tien-trinh`, `thap-kt-so-huu`, `thap-kt-shop`, `thap-kt-manh`; chơi thật 390×844 + 844×390, EN + VI, xem ảnh tận mắt.
