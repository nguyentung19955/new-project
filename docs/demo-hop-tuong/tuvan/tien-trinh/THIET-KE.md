# TIẾN TRÌNH NGƯỜI CHƠI — từ người mới tới cày cuốc, sự kiện, chế độ cày gacha (THIẾT KẾ, 09/11/2026)

> Giai đoạn 1 = **chỉ thiết kế**, chưa sửa code. Số liệu dựa trên `docs/demo-hop-tuong/tuvan/shop/KINH-TE.md` (bản LV17, §9),
> code nhánh `claude/demo-hop-tuong` (`huongdan.js`, `kinhte.js`, `kinhte-ui.js`, `manh.js`, `thebai.js`, `home.js`, `ui.js`, `data.js`, `game.js`)
> và benchmark Random Dice / Rush Royale / Lucky Defense (ghi chú nghiên cứu "Đánh giá gameplay Turret Merge").
> Mọi số ở đây là **đề xuất ban đầu** — sau mỗi đợt phải đo lại bằng bot + `tools/thap-kt-shop.js` / `tools/thap-kt-manh.js` rồi chỉnh.

## 0. Nguyên tắc thiết kế (giữ đúng triết lý người dùng)

| # | Nguyên tắc | Hệ quả cụ thể trong thiết kế |
|---|---|---|
| N1 | Game **vừa đủ khó** để muốn chinh phục | Mỗi chế độ có mốc khó dần, thất bại không mất gì ngoài thời gian; không bán "thắng" |
| N2 | **Tự khám phá** quy tắc ghép, tích/giải phóng mana, kích hoạt, cộng hưởng | KHÔNG thêm tutorial/mũi tên/gợi ý cho cộng hưởng. Mục tiêu chỉ nói **KẾT QUẢ** ("Đạt wave 25", "Có 2 ụ 5★ cùng lúc"), không nói **CÁCH** |
| N3 | Không làm skill dễ dàng | Không đổi luật trong trận để "dễ hơn" cho người mới; chỉ **mở dần nội dung** để người mới không ngợp |
| N4 | **Đỏ khó kiếm hơn Vàng rõ rệt** | Mục tiêu: tỉ lệ bản Đỏ bất kỳ ≤ 1/5 bản Vàng; thời gian MAX 1 thẻ Đỏ ≥ 1,8× thẻ Vàng (hiện 1,5–1,9×, §9.3) |
| N5 | Không nạp tiền (IAP để sau) | Mọi nguồn mới đi qua `KT.cong(loai, so, nguon)` + `KT.cho(...)`; nhãn nguồn mới: `tower`, `hunt`, `trial`, `endless`, `level`, `journey` |
| N6 | Tất định, chống gian | Thưởng 1 lần ghi cờ trước khi cộng; hạt giống = mã người chơi + khoá; bảng xếp hạng chỉ để **xem**, thưởng theo **mốc tuyệt đối** (không theo thứ hạng) vì bản lưu ở máy |

**Được phép** (không vi phạm N2): ghi lại điều người chơi ĐÃ làm được (Sổ Khám phá §3.7) — chỉ hiện "??? (3/15)" cho tới khi người chơi tự kích hoạt trong trận, không có gợi ý cách làm.

---

## 1. Kiểm kê hiện trạng (09/11)

### 1.1 Hành trình người mới hiện nay

| Bước | Hiện trạng (code) | Vấn đề |
|---|---|---|
| Vào game lần đầu | `huongdan.js`: trận SOLO có hướng dẫn, bộ cố định 5 ụ Trắng (`tia, lien, bang, set, sungluc`) + chỉ huy REINFORCE | Ổn — 7 bước chỉ dạy **điều khiển** (triệu hồi, kéo ghép, chạm xem thẻ, chỉ huy, cảnh báo trùm) |
| 7 bước | muc → trieu ×2 → ghep → tt → mv → tudo → trum (hạ trùm wave 10 = xong) | Bước "ghep" có câu phụ về Pháo La Bàn (ụ Vàng, không có trong bộ hướng dẫn) — thừa, nên bỏ |
| Xong / bỏ qua | `HD.moKhoa()` → **mở toàn bộ ~95 ụ chơi được cùng lúc** (Trắng 14 · Xanh 17 · Tím 22 · Vàng 32 · Đỏ 10), mọi chế độ, mọi cửa hàng | Ngợp; người mới chép ngay bộ Đỏ áp đảo (Rồng Máy/Thuỷ Quái chạm wave 70) → mất mục tiêu ngắn hạn |
| Sở hữu thẻ | Không có khái niệm "chưa có": mọi ụ chơi được ở cấp đầu (`THEBAI.the`) | Gacha chỉ để **lên cấp**, không để **mở ụ** — cảm giác "nhận thẻ mới" yếu |
| Giới hạn bộ | 5 ụ + 1 chỉ huy, tối đa 1 Đỏ (`UI.chonU`) | Ổn |
| Mở chỉ huy | Xanh/Tím/Vàng mở ở kỷ lục wave 15/30/50 hoặc 150/400/1 000 ngọc (`MAVUONG.*.mo2`) | Đây là **mô hình mở khoá duy nhất** đang có — mẫu tốt để nhân rộng |

### 1.2 Chế độ chơi có sẵn

| Chế độ | Luật | Thời lượng | Ghi chú |
|---|---|---|---|
| SOLO | 70 wave, trùm mỗi 10 wave (bể 12 trùm ngẫu nhiên), 3 tim; qua wave 70 = thắng | wave ~20 s → wave 30 ≈ 11 phút, wave 60 ≈ 22 phút (1×; có nút 2×) | Trần 70 che mất độ chênh bộ Đỏ |
| CO-OP (AI) | 2 bàn, 3 tim chung, trùm cố định tới wave 60 | như Solo | Test co-op đang tạm dừng (08/10) |
| PVP (AI) | cùng wave, đột tử từ wave 30 | 10–15 phút | |
| ONLINE | phòng bạn bè mã 4 chữ (co-op) | như co-op | tốc độ khoá 1× |
| Hướng dẫn | Solo tới trùm wave 10 | ~4 phút | không có túi thưởng |

Không có: chế độ ngắn (< 5 phút), chế độ có mốc cố định / thưởng lần đầu ngoài mốc Solo, endless, bảng xếp hạng, thử thách luật biến thể.

### 1.3 Nguồn tài nguyên (tóm từ KINH-TE §2–§4, §8)

| Tài nguyên | Nguồn | Thu / tuần (Thường · Giỏi) |
|---|---|---|
| Vàng | túi trận (10×wave + 40×trùm + 150 thắng), nhiệm vụ, điểm danh, quay, sự kiện | ≈ 21 000 · 48 000 |
| Ngọc | nhiệm vụ (bể 10, chọn 3 + 20 đủ 3), điểm danh, thành tựu 1 lần (490), sự kiện (90) | ≈ 460 · 460 (không theo trình độ) |
| Bản sao | túi trận 1 + ⌊wave/4⌋ lượt (**trần 10 ở wave 36**), 50% thẻ trong bộ; rương; Specials; quay; sự kiện; lò rèn | Vàng cụ thể ≈ 1,85 · 3,2 · Đỏ cụ thể ≈ 0,3–0,5 · 0,9 |
| Mảnh 1 lần (`manh.js`) | mốc Solo w20…70, hạ trùm lần đầu ×12, đủ 12 trùm | tối đa 30 Vàng + 5 Đỏ |

### 1.4 Hệ thống ngoài trận có sẵn

| Hệ thống | Code | Trạng thái |
|---|---|---|
| Nhiệm vụ ngày | `KTC.nv` (9) + `MHC.nv` (Reach wave 30) = bể 10, chọn 3/ngày | Không lọc theo trình độ (§9.7) |
| Nhiệm vụ tuần | — | **chưa có** |
| Điểm danh 7 ngày | `KTC.dn` | ổn |
| Thành tựu | `KTC.tt` (8, 490 ngọc) | ít, toàn 1 lần |
| Sự kiện tuần | `KTC.sk`: 10 mốc tới 1 700, ụ Vàng nổi bật theo tuần, điểm = wave + 10 thắng + 5/trùm (trần 60) | mốc Đỏ quá dễ với người giỏi (§9.1); mọi tuần giống nhau |
| Rương (gacha) | Thường 2 000 vàng · Vàng 500 ngọc (bảo hiểm Vàng 10, Đỏ 120) · Thần thoại 6 000 ngọc | ổn, tỉ lệ công khai |
| Vòng quay | 1 miễn phí + 5 × 100 ngọc | ổn |
| Daily Specials | 6 ô, ô Đỏ 60 000 vàng ~1/7 ngày | là chỗ tiêu vàng duy nhất có ý nghĩa (§9.5) |
| Lò rèn | 30 Sử thi → 1 Vàng (3/tuần) · 10 bản 1 thẻ Vàng → 1 Đỏ (1/tuần) | lò Đỏ gần như không dùng được sớm (§9.4) |

### 1.5 Lỗ hổng chính (KINH-TE §9 + đánh giá gameplay)

| Mã | Lỗ hổng | Xử lý trong thiết kế này |
|---|---|---|
| L1 | Mốc Đỏ sự kiện 1 700 điểm: người giỏi nhận 1 Đỏ/tuần (~52/năm) | §5: đợt 1 nâng mốc → 3 600; đợt 4 chuyển Đỏ sang cửa hàng sự kiện 3 500 xu (phải chọn, không miễn phí) |
| L2 | Túi thưởng chạm trần 10 lượt ở wave 36 | §3.3: công thức mới, trần 14 ở wave 68 |
| L3 | Thiên vị bộ bài làm Đỏ dễ tương đối (55% bản Đỏ vào thẻ trong bộ) | §6.4: phần "trong bộ" của Đỏ 50% → 30% |
| L4 | Lò Đỏ chỉ dùng được sau khi MAX thẻ Vàng | §6.3: thêm **Ấn Vàng** (bản Vàng thừa của nhiều thẻ → bản chỉ định) và **Ấn Đỏ** (Tinh thể Đỏ) |
| L5 | Vàng dư cho người giỏi | §6.5: 5 chỗ tiêu vàng mới |
| L6 | Ngọc không theo trình độ | §3.4 nhiệm vụ tuần + mốc chế độ mới cho thêm ngọc theo tiến độ |
| L7 | "Reach wave 30" giết thưởng đủ 3 của người mới | §3.4: bể nhiệm vụ lọc theo kỷ lục |
| L8 | Mở 95 ụ + mọi chế độ ngay sau hướng dẫn | §2: mở dần theo **Cấp tài khoản** |
| L9 | Không có chế độ ngắn / mục tiêu sau wave 70 | §4: Leo Tháp, Săn Trùm, Thử thách tuần, Vô tận |
| L10 | Chữ nút SUMMON hứa "<2 ụ Tấn công → ra ụ Tấn công" nhưng code không cài → người mới thua wave 2 vì xui | ngoài phạm vi kinh tế; ghi vào đợt 1 như việc **cần người dùng chọn** (cài hoặc sửa chữ) |

---

## 2. Hành trình người mới (ngày 1–7)

### 2.1 Cấp tài khoản (CẤP CHỈ HUY) — trục tiến trình chính

- **XP mỗi trận** = wave đạt + 3 × trùm hạ + 10 nếu thắng (mọi chế độ trừ hướng dẫn; chế độ mới §4 có XP riêng ghi trong bảng chế độ).
- **XP lên cấp L → L+1** = 20 + 15·L. Cấp tối đa 30; sau 30 mỗi 1 000 XP = 1 "Cấp danh vọng" (1 Rương Thường + 300 vàng).

| Cấp | XP cộng dồn | Thường đạt (ngày) | Giỏi đạt (ngày) |
|---|---|---|---|
| 2 | 35 | 1 | 1 |
| 3 | 85 | 1 | 1 |
| 4 | 150 | 2 | 1 |
| 5 | 230 | 2 | 1 |
| 6 | 325 | 3 | 2 |
| 8 | 560 | 5 | 2 |
| 10 | 855 | 6–7 | 3 |
| 12 | 1 210 | 8–9 | 4 |
| 15 | 1 855 | ~13 | 5–6 |
| 20 | 3 230 | ~22 | ~8 |
| 30 | 7 105 | ~45 | ~15 |

(Người mới: ngày 1 ≈ 80 XP (hướng dẫn + 4 trận wave ~14), ngày 2 ≈ 105, ngày 3–7 ≈ 140–195/ngày khi wave lên 22–30. Thường lâu dài ≈ 165 XP/ngày, Giỏi ≈ 550.)

**Thưởng mỗi cấp**: 150 × L vàng + 20 ngọc; cấp 5/10/15/20/25/30 thêm 1 Rương Vàng. Tổng 1 lần (2→30): ≈ 69 600 vàng · 580 ngọc · 6 Rương Vàng.

### 2.2 Bảng mở khoá

| Mở | Điều kiện | Ngày dự kiến (Thường) | Lý do |
|---|---|---|---|
| Ụ **Trắng + Xanh** (31 ụ) trong xây bộ | xong / bỏ qua hướng dẫn | 1 | đủ lựa chọn để tự tìm tổ hợp mà không ngợp |
| CO-OP (AI) | xong hướng dẫn | 1 | |
| PVP (AI) · Nhiệm vụ ngày · Cửa hàng (Specials, Rương Thường) · Vòng quay | Cấp 2 | 1 | |
| Ụ **Tím** (22) · Sự kiện tuần (bắt đầu tính điểm) · Rương Vàng | Cấp 3 | 1–2 | |
| ONLINE (phòng bạn bè) | Cấp 4 | 2 | |
| **Leo Tháp** | Cấp 5 | 2 | chế độ ngắn đầu tiên |
| Ụ **Vàng** (32) + quà "chọn 1 trong 3 thẻ Vàng" (1 bản) | Cấp 6 | 3 | quà chọn = người chơi tự quyết hướng bộ bài |
| **Săn Trùm** | đã hạ 3 trùm khác nhau | 3–4 | |
| **Thử thách tuần** · Nhiệm vụ tuần | Cấp 8 | 5 | |
| Lò rèn (Vàng/Ấn Vàng) | Cấp 10 | 6–7 | cần có bản thừa mới có nghĩa |
| Ụ **Đỏ** (10) · Rương Thần thoại · Lò rèn Đỏ | Cấp 12 **và** kỷ lục wave ≥ 30 | 8–10 | Đỏ là cột mốc lớn, tới sau khi đã quen Tím/Vàng |
| **Vô tận** (sau wave 70) + bảng xếp hạng | thắng Solo (qua wave 70) | tuần 3+ (Giỏi) | mục tiêu cho bộ mạnh |
| Chỉ huy Xanh/Tím/Vàng | giữ nguyên `mo2` (wave 15/30/50 hoặc ngọc) | | |

- Ụ chưa mở vẫn **xem được** trong Bộ sưu tập (thẻ tối, chữ "Cấp N") — chỉ khoá **đưa vào bộ**. Không viết gợi ý cách dùng.
- **Người chơi cũ** (đã có bản lưu): cấp khởi điểm = max(cấp theo XP, bảng quy đổi: kỷ lục ≥ 30 → Cấp 12 · ≥ 20 → Cấp 8 · ≥ 10 → Cấp 5 · có bản lưu → Cấp 3). Không ai mất ụ đang dùng.
- Hướng dẫn: giữ 7 bước, **chỉ bỏ** câu phụ về Pháo La Bàn ở bước "ghep". Không thêm bước nào.

### 2.3 Hành trình 7 ngày (mục tiêu = KẾT QUẢ, không nói cách làm)

Mở theo ngày kể từ lần đầu chơi (ngày N mở khi đã qua N−1 ngày lịch; làm bù được). Mỗi ngày 3 việc + thưởng đủ 3.

| Ngày | Việc 1 | Việc 2 | Việc 3 | Thưởng đủ 3 | Wave điển hình |
|---|---|---|---|---|---|
| 1 | Hạ trùm wave 10 | Chơi 3 trận | Đạt wave 15 | 500 vàng · 30 ngọc · 10 bản Xanh ngẫu nhiên | 12–18 |
| 2 | Đạt wave 18 | Có 1 ụ 4★ | Lên cấp 2 thẻ bất kỳ | 800 vàng · 1 Rương Thường · 30 ngọc | 15–20 |
| 3 | Hoàn thành 1 trận CO-OP | Hạ 2 trùm khác nhau | Thắng tầng 3 Leo Tháp *(đợt 1: "Đạt wave 20")* | 4 bản Sử thi (chọn 1 trong 3 thẻ) · 40 ngọc | 18–22 |
| 4 | Đạt wave 22 | Có 1 ụ 5★ | Mua 1 món Daily Specials | 1 500 vàng · 40 ngọc | 20–25 |
| 5 | Đạt wave 25 | Hạ trùm wave 20 | Có 2 ụ 5★ cùng lúc | 1 Rương Vàng | 22–27 |
| 6 | Chơi 1 trận PVP | Hoàn thành 3 nhiệm vụ ngày | Đạt Cấp 9 | 2 000 vàng · 50 ngọc | 25–30 |
| 7 | Đạt wave 30 | Hạ 4 trùm khác nhau | Lên cấp 1 thẻ Vàng | **Chọn 1 trong 3 thẻ Vàng × 2 bản** | 27–32 |

Tổng 1 lần: ≈ 4 800 vàng · 190 ngọc · 1 Rương Thường · 1 Rương Vàng · 4 Sử thi · 2 bản Vàng. **Không có Đỏ** trong hành trình người mới (N4).
Không việc nào nhắc tên cơ chế (jackpot, cộng hưởng, Wild Link…). "Có 2 ụ 5★ cùng lúc" buộc người chơi tự tìm cách giữ bàn — đúng N2.

### 2.4 Đường cong mục tiêu ngắn hạn tuần đầu

| Thời gian | Người chơi làm gì | "Muốn quay lại vì…" |
|---|---|---|
| 15 phút đầu | Hướng dẫn → trận Solo tự do bằng bộ Trắng/Xanh | đã thấy trùm; bộ sưu tập còn tối = có cái để mở |
| Ngày 1 | 3–5 trận, lên Cấp 3, mở Tím | Hành trình ngày 2 hiện đồng hồ đếm ngược |
| Ngày 2–3 | Leo Tháp tầng 1–10, mở Vàng + chọn 1 thẻ Vàng | thẻ Vàng vừa chọn còn LV9, cần bản sao |
| Ngày 4–5 | Săn Trùm bậc 1–3, Thử thách tuần lần đầu | mốc Thử thách tuần, trùm chưa hạ |
| Ngày 6–7 | wave 30, Hành trình ngày 7 (2 bản Vàng chọn) | sắp Cấp 12 → Đỏ |
| Tuần 2+ | Vòng ngày/tuần §3, sự kiện §5 | MAX thẻ, tầng tháp, mốc Vô tận |

---

## 3. Vòng cày ngày / tuần

### 3.1 Không dùng năng lượng

**Đề xuất: KHÔNG có năng lượng** cho Solo/Co-op/PVP/Tháp/Thử thách (giống Random Dice/Rush Royale PvP; game chưa có IAP, năng lượng chỉ làm người chơi ức chế).
Giới hạn tự nhiên = thời gian trận + trần điểm sự kiện/trận + thưởng 1 lần. **Ngoại lệ duy nhất**: Săn Trùm có **3 vé/ngày** (thưởng tuần ở đó mạnh, cần chặn "đánh lại tới khi may").

### 3.2 Phiên chơi điển hình

| Phiên | Thời lượng | Nội dung | Đủ để |
|---|---|---|---|
| Ngắn | 5 phút | điểm danh + quay miễn phí + quà Specials + 1 trận Săn Trùm (3–4 phút) | không mất chuỗi điểm danh, tiến Săn Trùm |
| Vừa | 15 phút | + 1–2 tầng Leo Tháp (3–6 phút/tầng) hoặc 1 lượt Thử thách tuần (8–15 phút) | 3 nhiệm vụ ngày (bể đã lọc cho trận ngắn) |
| Dài | 40–60 phút | + 2–3 trận Solo/Co-op dài (wave 30–60) | điểm sự kiện, túi thưởng lớn, kỷ lục |

### 3.3 Túi thưởng cuối trận — nới trần (sửa L2)

`luot = min(14, 1 + ⌊min(w, 36)/4⌋ + ⌊max(0, w − 36)/8⌋)` (đổi 1 dòng trong `THEBAI.thuong`). Vàng giữ nguyên công thức.

| Wave | 10 | 20 | 30 | 36 | 44 | 52 | 60 | 68+ |
|---|---|---|---|---|---|---|---|---|
| Lượt cũ | 3 | 6 | 8 | 10 | 10 | 10 | 10 | 10 |
| Lượt mới | 3 | 6 | 8 | 10 | 11 | 12 | 13 | **14** |

Người chơi Thường (wave 25–35) **không đổi**; Giỏi (wave 52) +20% bản sao/trận. Bù lại phần Đỏ bằng §6.4.
Chế độ Vô tận (sau wave 70) giữ trần 14 — không có lượt vô hạn.

### 3.4 Nhiệm vụ ngày (sửa L7) và nhiệm vụ tuần (mới)

**Nhiệm vụ ngày** — giữ bể + 3/ngày + 20 ngọc đủ 3, thêm:
- **Lọc theo kỷ lục**: "Reach wave 15" chỉ vào bể khi kỷ lục ≥ 12; "Reach wave 30" chỉ khi kỷ lục ≥ 28; "Play 1 PVP" chỉ khi đã mở PVP; "Defeat 2 bosses" khi kỷ lục ≥ 20.
- **Thêm vào bể** (đợt 2+): "Thắng 1 tầng Leo Tháp" (300 vàng), "Đánh 1 trận Săn Trùm" (10 ngọc), "Chơi Thử thách tuần" (15 ngọc).
- **Đổi nhiệm vụ**: 1 lần miễn phí/ngày, thêm lần 2–3 giá 500 / 1 000 vàng (chỗ tiêu vàng nhỏ).

**Nhiệm vụ tuần** (mới, mở Cấp 8, reset thứ Hai, mỗi việc 20 ngọc, đủ 5 = 1 bản Vàng ngẫu nhiên + 40 ngọc):

| Việc | Cần |
|---|---|
| Chơi trận | 15 |
| Hạ trùm | 8 |
| Kết thúc trận ở wave ≥ (kỷ lục − 5) | 3 lần |
| Có ụ 5★+ | 10 |
| Hoàn thành nhiệm vụ ngày | 12 (= 4 ngày đủ 3) |

→ +140 ngọc/tuần, +1 bản Vàng bất kỳ/tuần.

### 3.5 Ngân sách vòng ngày/tuần (sau đợt 1–4)

| Nguồn / tuần | Thường: vàng · ngọc | Giỏi: vàng · ngọc |
|---|---|---|
| Hiện có (KINH-TE §3) | 21 000 · 460 | 48 000 · 460 |
| + Nhiệm vụ tuần | — · 140 | — · 140 |
| + Săn Trùm (thưởng tuần) | 2 000 · 25 | 2 000 · 50 |
| + Thử thách tuần (mốc tuần) | 1 000 · 30 | 1 000 · 30 |
| + Vô tận (mốc tuần) | — | 2 000 · 80 |
| − Mốc sự kiện bỏ bớt ngọc (đợt 4 chuyển sang cửa hàng) | ≈ 0 | ≈ 0 |
| **Tổng** | **≈ 24 000 · 655** | **≈ 53 000 · 760** |

Ngọc ≈ 1,3–1,5 Rương Vàng/tuần (cũ 0,9). Một lần (Cấp 69 600 + Hành trình 4 800 + Tháp 55 500 + Săn Trùm 119 000): ≈ 250 000 vàng · 2 850 ngọc, rải trong 1–3 tháng (Thường thực tế ≈ 60%). Vàng không phải nút thắt (KINH-TE §4) nên chấp nhận được; bản Vàng 1 lần thêm ≈ 2 + 10 + 12 = 24.

---

## 4. Các chế độ chơi để cày gacha

Bảng tổng:

| Chế độ | Mở | Thời lượng | Tần suất | Luật chính | Thưởng chính | Đợt |
|---|---|---|---|---|---|---|
| Leo Tháp | Cấp 5 | 3–6 phút/tầng | không giới hạn, thưởng **lần đầu** | 100 tầng kịch bản cố định, bộ tự chọn | vàng, ngọc, Sử thi/Vàng chọn, Tinh thể Đỏ (tầng 50/100) | 2 |
| Săn Trùm | hạ 3 trùm khác nhau | 3–4 phút | 3 vé/ngày | chọn 1 trong 12 trùm × 10 bậc | lần đầu mỗi (trùm, bậc) + Trùm tuần | 2 |
| Thử thách tuần | Cấp 8 | 8–15 phút | không giới hạn lượt, lấy kết quả tốt nhất | bộ bài + cấp thẻ **cố định**, 2 đột biến | mốc tuần + bảng xếp hạng (xem) | 3 |
| Vô tận | thắng Solo | +10–20 phút sau wave 70 | không giới hạn | tiếp tục Solo sau 70, trùm dày dần | mốc tuần + bảng xếp hạng (xem) | 3 |
| Sự kiện chủ đề | Cấp 3 | theo hoạt động | xoay 4 tuần | xem §5 | điểm + xu sự kiện | 4 |
| Co-op chuyên đề | Cấp 4 | như co-op | tuần sự kiện số 4 | co-op + 1 đột biến | điểm sự kiện ×1,5 | 4 (chờ mở lại test co-op) |

### 4.1 Leo Tháp (Tower Climb)

- **Luật**: mỗi tầng = 1 kịch bản ngắn: **bắt đầu ở wave W_t với mana M_t, thắng khi sống qua 5 wave** (tầng chia hết cho 10 = wave cuối là trùm). Bộ bài tự chọn, cấp thẻ của người chơi. Thua không mất gì, thử lại ngay.
- W_t = 5 + ⌊0,65·t⌋ (tầng 1 → wave 5, tầng 50 → wave 37, tầng 100 → wave 70). Tầng 91–100: máu ×1,2…×3 (vượt trần 70).
- M_t = mana kỳ vọng tích được tới wave W_t của bot "chơi vừa" × 0,6 (bắt đầu thiếu → phải ra quyết định ngay) — **tham số đo bằng bot**, ghi bảng trong code.
- Mỗi **chương 10 tầng** có 1 luật chương (lấy từ bảng đột biến §4.3, mức nhẹ): ví dụ chương 3 "Khiên", chương 6 "Ô Khoá". Không giải thích cách vượt.
- XP: 5 + ⌊t/5⌋ mỗi tầng thắng lần đầu.

| Thưởng lần đầu | Chương 1–3 (tầng 1–30) | Chương 4–7 (31–70) | Chương 8–10 (71–100) |
|---|---|---|---|
| Mỗi tầng | 50 + 10·t vàng | như trái | như trái |
| Mỗi 5 tầng | 20 ngọc | 20 ngọc | 30 ngọc |
| Tầng trùm (x0) | 5 bản Sử thi — **chọn 1 trong 3 thẻ** | **1 bản Vàng — chọn 1 trong 3 thẻ** | **2 bản Vàng — chọn 1 trong 3 thẻ** |
| Đặc biệt | — | tầng 50: **3 Tinh thể Đỏ** | tầng 100: **5 Tinh thể Đỏ** + khung ảnh |

Tổng 1 lần: ≈ 55 500 vàng · 460 ngọc · 15 Sử thi · 10 bản Vàng · 8 Tinh thể Đỏ. "Chọn 1 trong 3" (3 thẻ bốc tất định theo hạt giống) cho người chơi định hướng bộ bài mà không cho chọn Đỏ.

### 4.2 Săn Trùm (Boss Hunt)

- **Luật**: chọn 1 trong 12 trùm đã từng hạ (ở bất kỳ chế độ) + bậc 1–10. Bắt đầu wave (10·b − 5) với mana bù, đánh 4 wave quái thường rồi trùm ở wave 10·b (bậc 8–10: trùm wave 70 máu ×2/×4/×8). Trùm có **90 giây**; hết giờ = thua. Bộ tự chọn.
- **Vé**: 3/ngày miễn phí; mua thêm tối đa 2/ngày, 3 000 vàng/vé. Thua vẫn mất vé.
- Mỗi trùm có điểm yếu riêng → người chơi tự tìm bộ phản trùm (gắn với nhận xét "boss killer" của benchmark), không có bảng gợi ý.

| Thưởng | Bậc 1–3 | Bậc 4–6 | Bậc 7 | Bậc 8–10 |
|---|---|---|---|---|
| Lần đầu mỗi (trùm, bậc) | 300 vàng | 1 000 vàng + 15 ngọc | 1 bản Vàng ngẫu nhiên | 30 ngọc + 2 000 vàng |
| Hạ cả 12 trùm ở cùng bậc | 1 Rương Thường | 1 Rương Vàng | 3 bản Vàng chọn 1/3 | bậc 10: **2 Tinh thể Đỏ** |

**Trùm tuần** (1 trùm xoay theo tuần, như nhau với mọi người): thưởng 1 lần/tuần theo bậc cao nhất thắng: bậc 3 = 2 000 vàng · bậc 5 = 50 ngọc · bậc 7 = 1 bản Vàng · **bậc 9 = 1 Tinh thể Đỏ**.
Tổng 1 lần: 120 ô ≈ 119 000 vàng · 1 620 ngọc · 12 bản Vàng (+ thưởng đủ 12 trùm). Người Thường thực tế tới bậc 5–6: ≈ 47 000 vàng · 540 ngọc.
Ghi chú: mốc "hạ đủ 12 trùm = 1 Đỏ" của `manh.js` giữ nguyên.

### 4.3 Thử thách tuần (Weekly Mutation)

- **Luật**: bộ 5 ụ **cố định** theo tuần (1 Vàng + 2 Tím + 1 Xanh + 1 Trắng, bốc tất định theo số tuần, không Đỏ), chỉ huy cố định, **cấp thẻ chuẩn hoá** (+5 cấp mọi thẻ, bỏ qua cấp của người chơi → bảng xếp hạng công bằng). 2 đột biến/tuần. Tối đa wave 50.
- Mục đích: buộc người chơi **chơi ụ họ không dùng** → khám phá cộng hưởng mới (N2), không phụ thuộc gacha.
- Mốc tuần (1 lần/tuần): wave 15 = 1 000 vàng · 25 = 30 ngọc · 35 = 1 bản **thẻ Vàng của bộ tuần** · **45 = 1 Tinh thể Đỏ**.
- Bảng xếp hạng tuần: chỉ hiển thị (Firebase `bxh/thuthach/{tuan}/{uid}` = wave + thời gian), thưởng không theo hạng (N6).

**Bảng đột biến** (dùng chung cho Thử thách, chương Tháp, sự kiện):

| Mã | Tên | Luật |
|---|---|---|
| D1 | Quái Nhanh | quái +25% tốc độ, −15% máu |
| D2 | Khiên | mỗi quái thứ 5 có khiên = 30% máu (phải phá khiên trước) |
| D3 | Lạm Phát | triệu hồi +20/lần (thay +10), mana giết ×1,5 |
| D4 | Ô Khoá | 3 ô giữa bắt đầu là đá 1★ |
| D5 | Thuần Gốc | không có POWER-UP; sát thương gốc +40% |
| D6 | Trùm Dày | trùm mỗi 5 wave, máu trùm ×0,6 |
| D7 | Khởi Giàu | mana đầu 500, wave chẵn quái thường không cho mana |
| D8 | Hồi Sinh | 20% quái chết hồi lại 1 lần với 30% máu |
| D9 | Chỉ Huy Chậm | hồi chiêu chỉ huy ×2, giá không nhân đôi |
| D10 | Ghép Chắc | ghép thường ra **lại đúng loại đó** (không ngẫu nhiên) |

### 4.4 Vô tận (sau wave 70)

- **Luật**: khi qua wave 70 ở Solo, nút "TIẾP TỤC" (không bắt buộc; dừng = thắng như cũ). Sau 70: máu ×1,08/wave; trùm mỗi 5 wave (71–90), mỗi 2 wave (91–100), từ 101 mỗi wave 1 trùm + 1 đột biến ngẫu nhiên mỗi 10 wave (học Rush Royale: boss dày sau wave 60).
- **Thưởng**: túi trận trần 14 lượt; mốc tuần (1 lần/tuần): wave 80 = 2 000 vàng · 90 = 30 ngọc · **100 = 1 Tinh thể Đỏ** · 110 = 50 ngọc · 120 = 1 bản Vàng chọn 1/3.
- Bảng xếp hạng tuần + mọi thời đại (chỉ xem). Không đổi luật Solo ≤ 70, không giảm Rồng Máy/Thuỷ Quái — chỉ kéo dài trần (đúng hướng của đánh giá gameplay).

### 4.5 Bốc bài (Draft) — chỉ trong tuần sự kiện

- 5 lượt, mỗi lượt chọn 1 trong 3 ụ bốc từ **toàn roster** (kể cả bậc chưa mở, tối đa 1 Đỏ), cấp chuẩn hoá. Chơi Solo tới thua.
- Khám phá thuần tuý: người chơi gặp tổ hợp chưa từng thử. Điểm sự kiện ×1,5.

---

## 5. Sự kiện — lịch xoay vòng 4 tuần

### 5.1 Lịch

| Tuần (theo `KT.tuan() % 4`) | Tên | Hoạt động nổi bật (điểm ×1,5) | Ụ nổi bật | Rương nổi bật |
|---|---|---|---|---|
| 0 | **Lễ hội Họ** | trận có ≥ 2 ụ cùng họ (`HO`) nổi bật | 1 họ (16 họ xoay) + 1 ụ Vàng của họ | Vàng của họ đó |
| 1 | **Đột Biến** | Thử thách tuần + 3 tầng đột biến sự kiện (D-mức nặng) | ụ Vàng của bộ Thử thách | Vàng ngẫu nhiên |
| 2 | **Đại Săn Trùm** | Săn Trùm (+1 vé/ngày trong tuần) | ụ Vàng khắc chế Trùm tuần (chọn tay trong bảng) | Vàng ngẫu nhiên |
| 3 | **Bốc Bài / Co-op** | Draft (§4.5); khi test co-op mở lại: Co-op + 1 đột biến | ụ Vàng ngẫu nhiên | Vàng ngẫu nhiên |

### 5.2 Điểm sự kiện

- Mỗi trận: `min(60, wave + 10·thắng + 5·trùm)` (giữ như cũ); trận ở **hoạt động nổi bật** ×1,5 (trần 90). Tầng tháp/Săn trùm: 20 điểm/lần thắng (×1,5 nếu nổi bật).
- **Xu sự kiện = điểm kiếm được** (tiến độ thang không bị trừ khi tiêu xu). Xu hết hạn cuối tuần, đổi tự động 1 xu = 2 vàng.

| Mẫu | Điểm / tuần (ước) |
|---|---|
| Thường: 5 trận/ngày, 2 trận ở hoạt động nổi bật, 45 điểm/trận | ≈ 1 900 |
| Giỏi: 8 trận/ngày, 4 nổi bật, 60 điểm/trận | ≈ 4 200 |

### 5.3 Thang mốc (miễn phí, KHÔNG có Đỏ)

| Mốc | 50 | 150 | 300 | 450 | 650 | 850 | 1 100 | 1 400 | 1 700 | 2 000 |
|---|---|---|---|---|---|---|---|---|---|---|
| Thưởng | 500 vàng | 1 bản Vàng nổi bật | Rương Thường | 30 ngọc | 1 bản Vàng nổi bật | Rương Vàng | 40 ngọc | 2 bản Vàng nổi bật | Rương Vàng | 3 000 vàng + 1 bản Vàng ngẫu nhiên |

(Giữ đúng 4 bản Vàng nổi bật + 2 Rương Vàng như cũ; ngọc 90 → 70; Đỏ chuyển sang cửa hàng.)

### 5.4 Cửa hàng sự kiện (phải chọn — tổng giá ≫ thu nhập)

| Món | Giá (xu) | Tối đa / tuần |
|---|---|---|
| 1 bản Vàng nổi bật | 400 | 4 |
| 1 bản Vàng ngẫu nhiên | 600 | 2 |
| 5 bản Sử thi (họ/bộ nổi bật, chọn) | 250 | 4 |
| Rương Vàng | 900 | 1 |
| 50 ngọc | 300 | 2 |
| 1 Tinh thể Đỏ | 1 200 | 1 |
| **1 bản Đỏ "Đỏ của tuần"** (1 trong 10 Đỏ, xoay theo tuần) | **3 500** | **1** |

Tổng ≈ 10 000 xu. Thường (≈ 1 900 xu) **không với tới Đỏ** nếu không chơi rất nhiều; Giỏi (≈ 4 200) mua được Đỏ **nếu bỏ gần hết món khác** → Đỏ thành lựa chọn có giá, không phải quà mặc định (sửa L1).

### 5.5 Đợt 1 (trước khi có cửa hàng sự kiện)

Chỉ đổi số trong `KTC.sk`: thêm mốc 2 300 (50 ngọc) và đẩy **mốc Đỏ 1 700 → 3 600**; mốc 1 700 cũ thành "3 000 vàng + 1 bản Vàng ngẫu nhiên".
Thường (≈ 1 600/tuần) không tới; Giỏi (≈ 3 360 ở 8 trận/ngày) **hụt** — cần ≈ 9 trận/ngày wave 45+ (~2,5 giờ) mới tới. Đỏ/năm từ sự kiện của người giỏi: 52 → ≈ 0–15.

---

## 6. Gacha & kinh tế

### 6.1 Rương / banner

| Rương | Giá | Tỉ lệ | Bảo hiểm | Thay đổi |
|---|---|---|---|---|
| NORMAL | 2 000 vàng | giữ | — | giữ |
| GOLD | 500 ngọc | giữ (3,8% Vàng · 0,2% Đỏ / thẻ) | Vàng ≤ 10 · Đỏ ≤ 120 | **hiện bộ đếm bảo hiểm** trên nút (đã có `s.ru.pv/pd`) |
| **FEATURED** (mới, đợt 4) | 500 ngọc | như GOLD; **50% bản Vàng ra = Vàng nổi bật của tuần** | **dùng chung** bộ đếm với GOLD | banner xoay theo sự kiện |
| MYTHIC | 6 000 ngọc | giữ | 1 Đỏ + 2 Vàng | mở ở Cấp 12 |

Mỗi lần mở Rương Vàng/Featured: +1 **Dấu bảo hiểm** hiển thị "Vàng chắc chắn sau N rương · Đỏ chắc chắn sau M rương". Không thêm bảo hiểm mềm (giữ Đỏ khó).

### 6.2 Tinh thể Đỏ — đường Đỏ CÓ CHỦ ĐÍCH nhưng hiếm

Tiền tệ mới duy nhất cho Đỏ (lưu `turret_kt.mh.tt`). **Chỉ** từ thử thách khó, không từ đăng nhập/quay/nhiệm vụ:

| Nguồn | Tinh thể | Loại |
|---|---|---|
| Leo Tháp tầng 50 / 100 | 3 / 5 | 1 lần |
| Săn Trùm: hạ cả 12 trùm bậc 10 | 2 | 1 lần |
| Trùm tuần bậc 9 | 1 | tuần |
| Thử thách tuần wave 45 | 1 | tuần |
| Vô tận wave 100 | 1 | tuần |
| Cửa hàng sự kiện | 1 (1 200 xu) | tuần |

Thu / tuần: Thường ≈ 0,2–0,3 · Giỏi ≈ 1–2 (tối đa 4). **Ấn Đỏ** (Lò rèn): **15 Tinh thể + 50 000 vàng → 1 bản Đỏ CHỈ ĐỊNH**. Giỏi ≈ 1 bản Đỏ chỉ định mỗi 8–15 tuần; Thường ≈ 1/năm.

### 6.3 Ấn Vàng — xả bản Vàng thừa (sửa L4)

**5 bản Vàng bất kỳ (gộp nhiều thẻ, trừ thẻ đích) + 20 000 vàng → 1 bản Vàng CHỈ ĐỊNH**, 1 lần/tuần. Lò rèn cũ giữ nguyên.
Thường có ≈ 3,5–5 bản Vàng/tuần rơi vào thẻ ngoài bộ → dùng được gần mỗi tuần.

### 6.4 Giảm thiên vị bộ bài cho Đỏ (sửa L3)

Túi trận: phần "lấy thẻ trong bộ" **Đỏ 50% → 30%** (Vàng/khác giữ 50%). 1 thẻ Đỏ trong bộ nhận 0,3 + 0,7/10 = **37%** bản Đỏ (cũ 55%).

### 6.5 Chỗ tiêu vàng (sửa L5)

| Chỗ tiêu | Giá | Trần / tuần |
|---|---|---|
| Daily Specials (có sẵn) | 12 000 Vàng · 60 000 Đỏ | ~6 Vàng + ~1 Đỏ |
| Ấn Vàng | 20 000 | 20 000 |
| Ấn Đỏ | 50 000 | ~1 / 8–15 tuần |
| Vé Săn Trùm thêm | 3 000 | 42 000 |
| Đổi nhiệm vụ ngày (lần 2–3) | 500 / 1 000 | 10 500 |

Giỏi (≈ 53 000/tuần) giờ phải chọn giữa lên cấp, Specials Đỏ, Ấn Vàng, vé — vàng hết "chất đống".

### 6.6 Thời gian MAX — trước / sau (1 thẻ CỤ THỂ trong bộ; bộ 2 Vàng + 1 Đỏ)

Bản / tuần cho 1 thẻ cụ thể:

| Nguồn | Vàng — Thường | Vàng — Giỏi | Đỏ — Thường | Đỏ — Giỏi |
|---|---|---|---|---|
| Túi trận (sau §3.3, §6.4) | 1,34 | 3,22 (cũ 2,68) | 0,21 (cũ 0,31) | 0,50 (cũ 0,62) |
| Rương, nhiệm vụ, nhiệm vụ tuần, lò rèn cũ, Specials | ≈ 0,45 | ≈ 0,45 | ≈ 0,15 | ≈ 0,2 |
| Sự kiện (nổi bật / Đỏ của tuần) | 0,13 | 0,13 | 0 | 0,08 |
| Ấn Vàng / Ấn Đỏ | 0,5 | 0,5 | 0,02 | 0,1 |
| **Tổng sau** | **≈ 2,4** | **≈ 4,3** | **≈ 0,38** | **≈ 0,88** |
| Tổng cũ (KINH-TE §4) | 1,85 | 3,2 | 0,3–0,5 | 0,9 |

| Thẻ | Thường cũ → sau | Giỏi cũ → sau | Tỉ lệ Đỏ / Vàng (thời gian) |
|---|---|---|---|
| Vàng LV9→17 (75 bản) | 9–10 tháng → **≈ 7 tháng** | 5–5,5 tháng → **≈ 4 tháng** | |
| Đỏ LV11→17 (31 bản) | ≈ 1,5 năm → **≈ 1,6 năm** | ≈ 8 tháng → **≈ 8 tháng** | Thường 1,6/0,6 ≈ **2,7×** · Giỏi 8/4 ≈ **2×** (cũ 1,5–1,9×) |

Một lần (mới): ≈ 24 bản Vàng (Tháp 10, Săn Trùm 12, Hành trình 2); "chọn 1 trong 3" bốc 3/32 thẻ nên thẻ mong muốn chỉ có mặt ≈ 9% lần → coi như rải đều, thêm ≈ 1–2 bản cho 1 thẻ cụ thể (không đổi đáng kể thời gian MAX).

Bản Đỏ bất kỳ / bản Vàng bất kỳ mỗi tuần (Giỏi): ≈ 4 / 22 ≈ **1/5,5** → đạt N4.
Chỉ đợt 1 (chưa có Tinh thể / cửa hàng sự kiện): Đỏ Giỏi ≈ 0,7/tuần → ≈ 10 tháng; Vàng Giỏi ≈ 4,2/tuần → ≈ 4 tháng.

---

## 7. Lộ trình triển khai

| Đợt | Nội dung | File / hệ thống | Độ lớn (theo CLAUDE.md) |
|---|---|---|---|
| **1 — chỉnh số + mở khoá** (làm được ngay với code hiện có) | (a) Cấp tài khoản: `tk.xp`, cấp, thưởng cấp, quy đổi người chơi cũ · (b) khoá bậc ụ trong xây bộ + khoá chế độ theo cấp; bỏ "mở 85 ụ" sau hướng dẫn; bỏ câu La Bàn ở bước ghép · (c) Hành trình 7 ngày (việc 3 ngày 3 dùng "Đạt wave 20") · (d) nhiệm vụ ngày lọc theo kỷ lục + đổi nhiệm vụ · (e) nhiệm vụ tuần · (f) túi thưởng trần 14 · (g) Đỏ trong bộ 30% · (h) mốc sự kiện: Đỏ 1 700 → 3 600 · (i) Ấn Vàng · (j) hiện bộ đếm bảo hiểm rương | `kinhte.js` (KTC.nv lọc, nvTuan, xp/cấp, hành trình, sk), `kinhte-ui.js` (thẻ Cấp, tab Hành trình, nhiệm vụ tuần, đếm bảo hiểm), `thebai.js` (`thuong`: luot + Đỏ 30%), `manh.js` (Ấn Vàng), `ui.js` (`theChon`/`chonU` khoá bậc), `home.js` (`HM.CHE` khoá chế độ), `huongdan.js` (`moKhoa` → mở Trắng+Xanh), `ngonngu-vi.js`/`text.js`; test: `tools/thap-kt-shop.js`, `tools/thap-kt-manh.js` + test mới `thap-kt-tien-trinh`; cập nhật KINH-TE.md | **Lớn** (kinh tế + lưu) — ~2–3 session con; quy trình đầy đủ |
| **2 — chế độ ngắn** | Leo Tháp 100 tầng (bắt đầu wave/mana tuỳ ý — mở rộng đường `G.debug.wave` có sẵn trong `game.js` thành tham số chính thức), Săn Trùm (chọn trùm ở wave cho trước — mở rộng `lichTrum`), Tinh thể Đỏ + Ấn Đỏ, nhiệm vụ ngày mới cho 2 chế độ | `game.js` (tham số trận: waveDau, manaDau, trumChon, dieuKienThang), `home.js` (2 chế độ mới), file mới `thap/js/thap-leo.js`, `thap/js/santrum.js`, `kinhte*.js`, `manh.js`, `ketqua.js`; ảnh pixel cho nút/biểu tượng chế độ (theo `docs/pixel/QUY-CHUAN.md` hoặc ghi DANH-SACH "Bổ sung") | **Lớn** — 2 session con song song (Tháp / Săn Trùm) |
| **3 — thử thách + dài hạn** | Thử thách tuần (bảng đột biến D1–D10, bộ + cấp cố định), Vô tận sau wave 70, bảng xếp hạng Firebase (chỉ xem), Sổ Khám phá (ghi lại cơ chế người chơi đã tự kích hoạt: jackpot, cộng hưởng, ghép đặc biệt…; 10–30 ngọc/mục, hiện "???" tới khi kích) | `data.js`/`game.js` (cờ đột biến), `jackpot.js`, `comoi.js`… (móc sự kiện cho Sổ Khám phá), `online/net.js` + luật Firebase `bxh/*`, `ketqua.js` | **Lớn** |
| **4 — sự kiện xoay vòng** | lịch 4 tuần, điểm ×1,5 hoạt động nổi bật, thang mốc mới (không Đỏ), xu + cửa hàng sự kiện (Đỏ của tuần 3 500 xu), Rương Featured, Draft; Co-op chuyên đề khi test co-op mở lại | `kinhte.js` (sk → skLich, xu, shop), `kinhte-ui.js`, `bobai.js`/`ui.js` (Draft), cập nhật KINH-TE.md | **Vừa–Lớn** |

### 7.1 Đề xuất đợt 1 cụ thể để duyệt (tách 3 nhánh song song)

| Nhánh | Việc | Kiểm |
|---|---|---|
| `claude/tt-cap` | Cấp tài khoản + mở khoá bậc ụ/chế độ + quy đổi người chơi cũ + hướng dẫn mở Trắng/Xanh | test mới: người mới → khoá đúng; bản lưu cũ kỷ lục 35 → Cấp 12, không mất ụ trong bộ; ảnh 844×390 + 390×844 xây bộ có thẻ khoá |
| `claude/tt-nhiemvu` | Hành trình 7 ngày + nhiệm vụ ngày lọc/đổi + nhiệm vụ tuần | giả ngày (`KT._bay`), cờ nhận 1 lần, gộp hồ sơ Firebase OR |
| `claude/tt-kinhte` | túi thưởng trần 14 · Đỏ trong bộ 30% · mốc sự kiện 3 600 · Ấn Vàng · đếm bảo hiểm · cập nhật KINH-TE §3–§9 | `tools/thap-kt-shop.js` (giả lập 52 tuần 2 mức người chơi → in thời gian MAX), `tools/thap-kt-manh.js` |

### 7.2 Cần người dùng quyết

1. **Khoá bậc ụ theo cấp** (§2.2) — đồng ý không? (Phương án nhẹ hơn: chỉ khoá Đỏ tới Cấp 12.)
2. **"Sở hữu" thẻ Vàng/Đỏ** (cần ≥ 1 bản mới được đưa vào bộ) — làm gacha có nghĩa "mở ụ mới", nhưng đổi cảm giác hiện tại. Đề xuất: **chưa làm**, xem lại sau đợt 2.
3. **Mốc Đỏ sự kiện 3 600** ở đợt 1 (người giỏi gần như mất nguồn Đỏ hằng tuần cho tới đợt 4) — hay giữ 1 700 tới khi có cửa hàng sự kiện?
4. **Ấn Vàng 5:1 + 20 000 vàng** làm Vàng nhanh hơn ~25% (Thường 9–10 → 7 tháng). Muốn chặt hơn: 6:1 hoặc 1 lần/2 tuần.
5. **Nút SUMMON** (L10): cài bảo đảm "<2 ụ Tấn công → ra ụ Tấn công" hay sửa chữ? (Ảnh hưởng người mới thua wave 2.)
6. Không năng lượng (chỉ vé Săn Trùm) — xác nhận.
