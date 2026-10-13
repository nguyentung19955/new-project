# Báo cáo đợt 6: ÉP ĐỒ (bậc vũ khí) + ẢI THEO NGÀY

**Mã commit:** `16ad9872` (nhánh `khoi-tao-du-an`)

Làm theo `YEU-CAU-6-EP-DO-AI-NGAY.md`, sau khi đọc báo cáo 1–5.

**Không chạy game, không Playwright, không bài kiểm tra nào.** Chỉ kiểm bằng:
- `node --check` cho mọi tệp `game/js/*.js` (đều qua);
- `python3 game/build.py` (chạy xong, đã dựng lại `game/dist`);
- script tính số `node tools/can-bang/tinh.js` (thêm mục 6);
- script cắt ảnh `python3 docs/anh-goc/ep-do/cat_ep_do.py`.

Những thứ không đụng tới:
- `master`. Không force push, không mở PR.
- `cloud.js`, đăng nhập Google, `?cloud=0`, `firebase-config.js` (không chép apiKey).
- Đường đọc bản lưu cũ: chỉ **thêm** trường mới. Bản lưu cũ không có gì thì mọi vũ khí ở Bậc Trắng, 0 đá, ải ngày tự tạo lượt.

## 1. Cách ép đồ (người chơi thấy)

**Ép ở đâu.** Ông Thợ Rèn có thẻ mới **"Ép đồ"** (giữa "Linh khí" và "Nâng lò"). Hành trang › Vũ khí cũng có phần "Ép đồ" ngay dưới danh sách vũ khí. Trong ải chỉ xem được.

**Hai trục riêng.** Trục **Bậc** (ép đồ) độc lập với trục **Cấp** hệ (Trắng / Mầm / Thành hình / Thức tỉnh). Chỗ nào có chữ "Trắng" của trục Bậc đều ghi là "Bậc Trắng".

**Bảng ép:**
- Cột trái là 4 vũ khí, mỗi món có ô màu theo bậc và tên bậc. Chấm xanh nghĩa là ép được ngay.
- Cột phải là món đang chọn:
  - sức mạnh vũ khí trước → sau;
  - phần cộng riêng của loại vũ khí;
  - các dòng hiệu ứng, mỗi dòng có nút "Đổi dòng";
  - giá, tỉ lệ (có ghi phần may mắn, ví dụ "Tỉ lệ: 45% (+20% may mắn)");
  - thất bại thì giữ bậc hay tụt về bậc nào;
  - nút **Ép**.

**Khi có nguy cơ tụt bậc** (ép lên Vàng, Đỏ, Rực lửa), game hỏi trước:
- Có bùa: "Thất bại sẽ tụt về Bậc X — dùng Bùa giữ bậc?", với 3 nút **Dùng bùa** / **Không dùng** / **Thôi**.
- Không có bùa: "… Không có Bùa giữ bậc. Vẫn ép?".

**Kết quả ép:**
- Thành công: cột sáng vàng (ảnh `hu-ep-thanh-cong`) và chữ "Thành công!".
- Thất bại: khói trên bệ lò (`hu-ep-that-bai`) và chữ "Thất bại…".
- Tụt bậc: ngọc vỡ (`hu-ep-tut-bac`) và chữ "Tụt bậc!".
- Thiếu ảnh thì game vẽ bằng code: chớp sáng, khói xám, vỡ vụn.

**Màu theo bậc:**
- Ô vũ khí và tên vũ khí ở bảng Linh khí đổi màu theo bậc khi đã ép.
- Ô vũ khí trong trận (góc trên phải) có viền màu bậc nhuộm bằng code. Rực lửa có lửa chạy quanh viền.

**Chỗ xem đá và bùa:** Hành trang › Tài nguyên có thêm 2 dòng "Đá nâng bậc" và "Bùa giữ bậc".

**Thất bại (đúng như chủ dự án 15:59 / 16:01):**
- Luôn mất đá và vàng của lần ép.
- Ép lên Xanh lam / Xanh lục / Tím: hỏng thì giữ bậc.
- Ép lên Vàng / Đỏ / Rực lửa: hỏng thì **tụt 1 bậc** so với bậc đang có, và mất dòng hiệu ứng mới nhất. Ví dụ đang Tím ép lên Vàng mà hỏng thì về Xanh lục, mất dòng duy nhất.
- Không bao giờ tụt dưới Bậc Trắng.
- Bùa giữ bậc chỉ bị trừ khi lần ép thật sự hỏng.

**Điểm may mắn:**
- Mỗi lần hỏng cộng +10% tỉ lệ cho món đó ở lần ép lên đúng bậc đó.
- Thành công thì điểm về 0.
- Điểm lưu riêng cho từng bậc đích (`w.ep.may`).

**Đổi dòng (tẩy luyện):**
- Luôn thành công, tốn ít đá hơn giá ép.
- Ra một dòng chưa có trên món và khác dòng cũ; độ mạnh của dòng cũng ngẫu nhiên lại.

## 2. Bảng bậc, dòng, giá (tất cả ở `G.EP_DO`, `game/js/data.js`)

### Bậc
"Sức mạnh" là tổng sức mạnh vũ khí. Sát thương thật bằng sức mạnh chia cho phần cộng riêng, để cả hai cộng lại đúng bằng con số này (Rực lửa ≈ ×1,75).

| Bậc | Sức mạnh | Tỉ lệ ép lên | Giá mỗi lần ép | Dòng hiệu ứng | Hỏng thì |
|---|---|---|---|---|---|
| Trắng | ×1,00 | – | – | 0 | – |
| Xanh lam | ×1,08 | 100% | 3 đá + 100 vàng | 0 | giữ bậc |
| Xanh lục | ×1,17 | 90% | 6 đá + 200 vàng | 0 | giữ bậc |
| Tím | ×1,28 | 75% | 10 đá + 350 vàng | 1 | giữ bậc |
| Vàng | ×1,40 | 60% | 16 đá + 550 vàng | 2 | tụt 1 bậc |
| Đỏ | ×1,55 | 45% | 25 đá + 800 vàng + 1 mảnh Ngư Tinh | 3 | tụt 1 bậc |
| Rực lửa | ×1,75 | 30% | 40 đá + 1.200 vàng + 2 mảnh Hồ Tinh | 4 | tụt 1 bậc |

### Phần cộng riêng theo loại (mỗi bậc)
| Vũ khí | Cộng thêm | Rực lửa | Tính vào sức mạnh |
|---|---|---|---|
| Kiếm | +2,5% tốc đánh (đòn nhanh hơn) | +15% | tính trọn |
| Thương | +3% tầm đánh | +18% | tính một nửa |
| Búa | +8% thời gian choáng | +48% | ~0,6 phần |
| Phi tiêu | +5% sát thương lên con xuyên sau | +30%; từ Đỏ xuyên thêm 1 quái | tính một nửa |

Ví dụ kiếm Rực lửa: sát thương ×1,52, tốc đánh ×1,15, cộng lại ≈ ×1,75.

### Dòng hiệu ứng
- Chỉ có tác dụng khi **đang cầm** vũ khí đó.
- Mỗi món không có 2 dòng trùng nhau.
- Giá trị dòng = giá trị gốc × hệ số bậc **hiện tại** × độ mạnh ngẫu nhiên 0,8–1,2 (gieo lúc ra dòng).
- Hệ số bậc: Tím 1 · Vàng 1,25 · Đỏ 1,6 · Rực lửa 2. Vì vậy dòng mạnh dần khi món lên bậc.

| Dòng | Giá trị gốc (Tím) | Rực lửa (độ mạnh 1,0) | Móc vào |
|---|---|---|---|
| Chí mạng | +4% | +8% | `combat.js` playerHit |
| Sát thương chí mạng | +15% (×2 → ×2,15) | +30% | playerHit (cả ám sát / chí mạng của skill bộ) |
| Sát thương lên trùm, tinh anh | +8% | +16% | playerHit |
| Hút máu | 1,2% sát thương | 2,4% (mỗi đòn tối đa 2% máu tối đa) | playerHit → `G.epDo.hut` |
| Tốc đánh | +4% | +8% | `moves.js` begin (mọi nhát, cả phi tiêu) |
| Giảm hồi chiêu đặc biệt | −6% mana và hồi đòn Đặc biệt | −12% | `P.specCost` cập nhật mỗi khung, `special()` |
| Linh khí nhận | +5% | +10% | `vk_moi.js` (túi linh khí chung) |
| Sát thương hệ | +6% (đòn đang mang hệ) | +12% | playerHit |
| Giảm sát thương nhận | −3% | −6% | `hurtPlayer` |

### Đổi dòng (theo bậc đang có)
| Bậc | Tím | Vàng | Đỏ | Rực lửa |
|---|---|---|---|---|
| Giá | 3 đá + 150 vàng | 5 đá + 250 vàng | 8 đá + 400 vàng | 12 đá + 600 vàng |

### Nguồn đá nâng bậc và bùa giữ bậc
Số đá theo vùng 1 / 2 / 3. Độ khó 2 thì ×1,5.

| Nguồn | Đá | Bùa |
|---|---|---|
| Trùm nhỏ (cuối ải thường) | 1 / 1 / 2 (lần đầu qua ải đó: 2 / 2 / 3) | – |
| Trùm vùng | 3 / 4 / 5 (lần đầu: 6 / 8 / 10) | 10% |
| Ải Đá Bậc | Dễ 3 · Vừa 5 · Khó 8 | Khó 10% |
| Thương nhân trong ải | – | bán 600 vàng |

Dòng thưởng ghi ở màn kết quả. Đồ rơi trên sàn dùng hình đá (`vp-stone`).

**Sức mạnh (`G.power`):** đã tính hệ số bậc (qua `G.wBase`) và tính gần đúng các dòng hiệu ứng (`G.epDo.sucManh`).

## 3. Ải theo ngày

**Ngày giờ:** tính theo giờ máy người chơi, đổi ngày lúc 00:00.

| Ải | Thưởng mỗi lượt thắng (Dễ / Vừa / Khó) | Ngày mở |
|---|---|---|
| Ải Đá Bậc | 3 / 5 / 8 đá nâng bậc (Khó thêm 10% ra bùa) | T7, CN, T2, T4 |
| Ải Đá Mài | 14 / 18 / 22 quặng | T3, T6, T7, CN |
| Ải Vàng | 520 / 800 / 1.100 vàng | T5, T6, T7, CN |

- **Đá mài = quặng** (mặc định của yêu cầu).
  - Đề xuất: nếu muốn "đá mài" là vật phẩm riêng, nên dùng nó thay một phần quặng khi mài từ +10 trở lên. Hiện quặng là thứ thiếu nhất khi mài nên dùng quặng là đủ.
- **Mở ải:** mở sau khi hạ trùm vùng 1.
  - Mức Dễ / Vừa / Khó mở khi đã hạ trùm vùng 1 / 2 / 3 (Mộc Tinh / Ngư Tinh / Hồ Tinh).
  - Quái và cảnh theo vùng đó, sức mạnh quái như ải trùm của vùng.
- **Lượt:** mỗi ải 3 lượt / ngày, hồi lúc 00:00.
  - **Chỉ thắng mới trừ lượt**: thua hoặc bỏ ải không mất lượt, cũng không có thưởng.
  - Thắng được thêm kinh nghiệm bằng 0,5 lần kinh nghiệm ải trùm vùng đó.
- **Lối chơi:** 1 phòng, 5 đợt quái (dùng đúng luật đợt quái của ải thường), đợt cuối có 1 tinh anh. Dọn hết là thắng, hiện bảng kết quả riêng có nút "Chơi lại" khi còn lượt.
- **Cổng vào:** bản đồ của Chú Lái Đò có nút **"Ải ngày"** ở góc trên phải, có chấm đỏ khi hôm nay còn lượt.
  - Màn ải ngày có: ảnh cổng đá (`gd-cong-ai-ngay`), thứ và ngày hôm nay, đồng hồ "Ngày mới sau hh:mm:ss".
  - Mỗi ải một hàng gồm: biểu tượng, các ngày mở (hôm nay tô xanh), "Hôm nay mở/đóng", "Lượt: x/3", và 3 nút Dễ / Vừa / Khó ghi phần thưởng.
- **Chống chỉnh giờ máy:**
  - Bản lưu giữ ngày lớn nhất từng thấy (`sv.aiNgay.cuoi`).
  - Ngày mới lớn hơn thì hồi đủ lượt. Ngày lùi thì không hồi.
- **Lưu:** `sv.aiNgay = { cuoi, luot: { da, mai, vang } }` nằm trong bản lưu, nên lưu máy và mây cùng định dạng. Lượt ải dở (`luu_luot.js`) không ghi ải ngày.

## 4. Bảng cân bằng (`node tools/can-bang/tinh.js`, mục 6)

### Kỳ vọng để ép MỘT vũ khí từ Bậc Trắng
Mô phỏng 20.000 lần, theo đúng luật tỉ lệ, may mắn và tụt bậc. Số cộng dồn từ Bậc Trắng.

| Lên tới | Đá | Vàng | Mảnh | Lần ép | Nếu luôn dùng bùa: đá / bùa tốn |
|---|---|---|---|---|---|
| Xanh lam | 3 | 100 | 0 | 1 | 3 / 0 |
| Xanh lục | 9,6 | 320 | 0 | 2,1 | 9,6 / 0 |
| Tím | 22,5 | 772 | 0 | 3,4 | 22,5 / 0 |
| Vàng | 54 | 1.869 | 0 | 5,6 | 47 / 0,5 |
| Đỏ | 131 | 4.397 | 1,9 | 9,6 | 96 / 1,5 |
| Rực lửa | 339 | 10.966 | 9,5 | 17,7 | 193 / 2,9 |

### Đá mỗi tuần và số tuần
- Ải Đá Bậc: 4 ngày × 3 lượt = 12 lượt mỗi tuần.
- Giả định thêm 20 lượt ải thường mỗi tuần (cày lại, 1/5 là ải trùm vùng).

| Mức | Đá ải / tuần | Đá trùm / tuần | Tổng đá / tuần | Bùa / tuần | Tuần lên Tím (1 món) | Tuần lên Rực lửa (1 món / cả 4 món) |
|---|---|---|---|---|---|---|
| Dễ (Rừng già) | 36 | 28 | 64 | 0,4 | 0,85 | 5,3 / 21 |
| Vừa (Hang biển) | 60 | 32 | 92 | 0,4 | 0,59 | 3,7 / 15 |
| Khó (Lâu đài cổ) | 96 | 52 | 148 | 1,6 | 0,37 | 2,3 / 9 |

### Ải ngày so với một lượt ải thường cùng vùng
Lượt ải thường là trung bình 5 ải của vùng, chơi lại, chưa bị giảm thưởng vì quá dễ.

| Mức | Vàng ải ngày / ải thường | × | Quặng ải ngày / ải thường | × |
|---|---|---|---|---|
| Dễ | 520 / 307 | 1,69 | 14 / 7,7 | 1,81 |
| Vừa | 800 / 471 | 1,70 | 18 / 9,7 | 1,85 |
| Khó | 1.100 / 644 | 1,71 | 22 / 11,7 | 1,88 |

Cả hai đều nằm trong khoảng 1,5–2× như yêu cầu. Số đợt 4–5 (giá linh khí, khuyên dùng, máu, quái) **không đổi**.

**Lưu ý cân bằng:** ép đồ là sức mạnh MỚI cộng thêm.
- Trong chiến dịch, đá lần đầu từ trùm khoảng 14 / 16 / 22 mỗi vùng. Lên Tím một món (cần ~22 đá) làm Sức mạnh tăng khoảng +13%.
- Người chơi ép sẽ qua `G.STAGE_REC` dễ hơn số bot đo ở đợt 5.
- Muốn giữ nguyên độ khó chiến dịch: giảm `G.EP_DO.roi.miniDau` / `vungDau`, hoặc chạy lại bot (`tests/cay.py`) có ép đồ rồi chỉnh khuyên dùng.

## 5. Ảnh (đủ 8 tấm, đã cắt và đưa vào game)

Script: `docs/anh-goc/ep-do/cat_ep_do.py`. Bản xem trước: `docs/anh-goc/ep-do/xem-truoc.png`. Prompt ở `docs/anh-goc/ep-do/prompt.txt`, không cần gen thêm.

| Ảnh gốc | Mã trong game | Cỡ (điểm ảnh game) | Dùng ở |
|---|---|---|---|
| E1 | `gd-da-nang-bac` | 24×24 | bảng ép, Tài nguyên |
| E2 | `gd-bua-giu-bac` | 24×24 | bảng ép, Tài nguyên |
| E3 | `gd-o-ep-0` … `gd-o-ep-6` | 30×30 mỗi khung | ô vũ khí theo bậc (bảng ép, bảng Linh khí) |
| E4 | `hu-ep-thanh-cong` | 6 khung 30×48 | hiệu ứng ép thành công |
| E5 | `hu-ep-that-bai` | 5 khung 32×48 | thất bại (giữ bệ lò rèn đá) |
| E6 | `hu-ep-tut-bac` | 6 khung 34×40 | tụt bậc |
| E7 | `gd-cong-ai-ngay` | 92×96 | màn ải ngày |
| E8 | `gd-ai-ngay-da` / `-mai` / `-vang` | 32×32 | biểu tượng 3 ải |

Ghi chú cắt:
- E6: đã bỏ viền ô vuông đen trước khi cắt.
- E3: khung Xanh lục giữ màu xanh lá thật (bước khử viền xanh thường làm nó ngả ô liu).
- E4: giữ hình thanh kiếm nhỏ trong cột sáng.
- Ô vũ khí trong trận vẫn dùng khung `gd-o-vk-*` cũ cộng viền màu bậc nhuộm bằng code.

## 6. Tệp đã sửa

- **Mới:**
  - `game/js/ep_do.js`: luật, bản lưu, móc trận, bảng ép, hiệu ứng.
  - `game/js/ai_ngay.js`: lịch, lượt, thưởng, màn chọn ải.
  - `docs/anh-goc/ep-do/cat_ep_do.py`.
  - 16 tệp `game/art/custom/*.sprite.json`.
- **Sửa:**
  - `data.js`: `G.EP_DO`, `G.AI_NGAY`, cờ tắt.
  - `combat.js`: `wBase`, chí mạng, dòng, hút máu, choáng, giảm sát thương, hồi chiêu, Sức mạnh.
  - `moves.js`: nhịp đòn, tầm, xuyên.
  - `vk_moi.js`: linh khí nhận; ô và tên theo bậc.
  - `stage.js`: đá từ trùm, ải ngày, bảng kết quả, thương nhân, viền ô.
  - `village.js`: thẻ Ép đồ, nút Ải ngày.
  - `hanh_trang.js`: phần Ép đồ, dòng tài nguyên.
  - `luu_luot.js`: bỏ qua ải ngày.
  - `index.html`: nạp 2 tệp mới sau `bo_skill.js`.
  - `tools/can-bang/tinh.js`: mục 6.
- Dựng lại: `game/dist/*`, `tools/xuong-sprite/*`.
- Có thêm chữ tiếng Anh cho mọi chữ mới (`G.ngonNgu.them` ngay trong `ep_do.js`, `ai_ngay.js`).

## 7. Cờ

| Cờ | Tác dụng |
|---|---|
| `?epdo=0` | Bậc không có tác dụng (×1), dòng không có tác dụng, không rơi đá / bùa, ẩn thẻ Ép đồ, phần Ép đồ ở Hành trang, bùa ở thương nhân. Dữ liệu bậc trong bản lưu giữ nguyên. |
| `?aingay=0` | Ẩn nút Ải ngày. Màn ải ngày (nếu mở) báo đang tắt. |

## 8. Cần xem khi chạy thử (chưa kiểm vì không được chạy game)

- **Bảng ép** (Thợ Rèn, thẻ Ép đồ): chữ có lọt khung không khi món có 4 dòng (cột phải hẹp ~198 điểm ảnh). Xem thêm hộp hỏi bùa, hiệu ứng ảnh đặt đúng ô chưa (điểm neo ước lượng từ ảnh).
- **Hành trang › Vũ khí:** phần Ép đồ nằm dưới 4 vũ khí, phải cuộn mới thấy.
- **Ải ngày:** dọn xong 5 đợt có ra bảng kết quả đúng không, có trừ lượt không, "Chơi lại" có hoạt động không. Chỗ ra quái trong phòng rộng. Nút "Ải ngày" trên tranh bản đồ có đè chữ nào không.
- **Thương nhân** nay có tối đa 5 món (nút hẹp hơn: 60 điểm ảnh).
- **Hút máu:** mỗi đòn tối đa 2% máu. Với búa hoặc đòn quét trúng nhiều con có thể hơi mạnh; chỉnh `G.EP_DO.hutToiDa` nếu cần.
- **Bản lưu:**
  - Nếu sau này tăng `G.SAVE_CAN_LAI` (bước cân lại của `vk_moi.js` dựng lại vũ khí từ đầu) thì nhớ giữ trường `w.ep`, không thì mất bậc ép.
  - Bản lưu mở bằng bản game cũ rồi ghi lại thì các trường mới vẫn còn, vì game cũ không xoá trường lạ của vũ khí. Trường `daBac`, `buaBac`, `aiNgay` ở gốc bản lưu cũng giữ.
- **Bot cân bằng** (`tests/`) chưa biết ép đồ và ải ngày. Nên cho bot ép và đo lại khuyên dùng (mục 4).
