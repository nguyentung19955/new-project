# Trang thử P0-A – nhịp đánh + Chuông Gỗ + quái gác có Thế (27/10/2026, sửa theo phản hồi 5)

Viết cho người không rành kỹ thuật. Đây là **trang thử riêng**, sinh từ `game/demo.html` bằng script `cong-cu/tao-tu-demo.py`.
**Không sửa** `demo.html`, `build-demo.py`, `thu-bo-vo-moc/`, `thu-quai-huong-moi/`. Không publish. Làm đúng mục 3, 6, 7, 8 của
`docs/gameplay/KE-HOACH-GAMEPLAY-V2.md` (đã sửa theo phản hồi 3 trước khi làm – commit riêng).

**Chơi thử:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-p0a/index.html
Link **không thêm gì** = bản cho **người chơi thử trên iPhone**: log input và lớp hộp đòn **TẮT** (chỉ bật khi thêm `?debug=input` / `?hitbox=1`
hoặc chạm nút ▣). Đã kiểm trong code: hộp đòn mặc định `hbSet(URLQ.get('hitbox')==='1')`, log chỉ khi `debug=input`. Hình nộm (phòng A)
vẫn hiện số trúng vì nó là công cụ đo. **Phản hồi 5 đã sửa** – xem mục 6 "Sửa theo phản hồi 5" ở cuối.

| Thêm vào địa chỉ | Để làm gì |
|---|---|
| (không thêm gì) | Nhịp **MỚI** (P0-A) |
| `?p0=0` | Nhịp **CŨ** để so. **Quái, máu, Thế, công thức giống hệt** bản mới – chỉ đổi phần nhạy tay (không đổi độ nhạy và độ khó cùng lúc). Trong game: ⚙ → nút "Nhịp đánh" đổi qua lại |
| `?debug=input` | Bảng log lần bấm Chém + log trúng / Cộng hưởng (góc trên phải), số tick đòn trên đầu Lam |
| `?hitbox=1` (hoặc phím H / nút ▣) | Lớp hộp đòn: đỏ = đòn đang gây sát thương ở tick này, teal = hộp của bóng |
| `?debug=anim` | Debug chậm có sẵn của demo: ⏸, +1 bước, ×½ ×¼ ×⅒ |
| `?vao=lang` | Vào làng cũ như demo (để kiểm phần cũ không hỏng) |
| `?bm=0` | **Cấu hình thử TẮT sát thương bóng** (để thử riêng). **Không** phải bản giống demo cũ: demo cũ được các báo cáo trước xác định bóng gây **1 máu như Lam**. Mặc định 0,25 = cấu hình kiểm công thức, giống nhau ở `?p0=0` và bản mới |
| `?khung=cat` | **Chỉ để so** (PH5): bảng khung đòn đất kiểu P0-A **trước** phản hồi 5 (cắt 4 / 4 / 2 phần tử đầu). Mặc định = phân bố lại |
| `?dmoi=1` | **Chỉ để so lỗi**: tạo đòn bóng mới mỗi tick (lỗi PH3 chỉ ra) – hộp bóng 8 tick trúng 8 lần |

Ví dụ: `index.html?debug=input&hitbox=1` và `index.html?p0=0&debug=input&hitbox=1`.

## 1. Đã đổi gì (so với demo)

| Phần | Cũ (`?p0=0`) | Mới (P0-A) |
|---|---|---|
| Hàng chờ đòn | `atkBuf` 8 tick: bấm sớm hơn tick 11 của nhát đang chạy là **mất lặng lẽ** | **1 chỗ chờ** (`CHO`). Nhận từ tick 1 của đòn; ra ở tick đầu tiên được phép (nối combo ở `su + ac`, sau nhát 3 là nhát 1 mới); hạn = hết đòn (hoặc hết lướt) + **6 tick**; bấm thêm thì **thay** nhát chờ (lấy hướng cần của lần bấm mới); **xoá** khi lướt, bị đánh, chết, đổi phòng, rút dao, đặt lại vị trí. Đang bị đánh (`hurtT > 8`), đang chết, rút dao, tạm dừng → **loại** |
| Khởi động combo | `su` 11 / 11 / 11 | **7 / 7 / 9**. Nảy, hất, trên không giữ nguyên |
| Ngưỡng hướng **lúc ra đòn** | 0,38 (≈ 22°) | **0,7** (≈ 44°). Chạy, xuống ván, pogo tự động giữ nguyên |
| Hình / vệt chém | Bảng khung cũ; vệt `bat_dau` 10 | Bảng `khung_theo_atkT` **phân bố lại trong startup** (PH5, mục 6.3; trước PH5 là cắt 4 / 4 / 2 phần tử đầu); `vetBatDau = su`; vệt + tia trúng tạo với `t = −1` để khung 0 hiện đúng tick (quy ước KHGP2 3c) |
| **Giống nhau ở cả hai bản** | | Dữ liệu đòn `D` bền (mã đòn sống suốt vòng đời đòn), bóng tra `maGoc → maReplay` theo từng lần phát, gom mọi lần trúng của một tick, công thức 6b, **bóng 0,25 máu / 0,5 Thế** (đo: `thongSo()` cả hai bản `bongMau 0.25, bongThe 0.5` – `video/do-so.json`), Thế mục 5, Chuông Gỗ [40], quái gác [30, vỏ 60 vỡ một lần], hình nộm, 3 phòng A–B–C |

**3 phòng mới** (nối sau phòng boss, theo `so-do-phong-thu-v2.png`; vào thẳng phòng A):
- **A · Khởi đầu** (24 ô): chuông lưu, **hình nộm** (máu 999, Thế 60 không vỏ, tự hồi đầy sau 3 s không bị đánh; hiện số vừa trúng, tổng, và "chạm → hộp: N tick").
- **B · Sân hai chuông** (34 ô): 2 Chuông Gỗ tuần tra lệch pha, cách nhau 15 ô, ván một chiều giữa sân.
- **C · Hành lang gác** (32 ô): trần cao **8 ô** (không trần thấp), 16 ô sàn trống trước **quái gác**, cổng sau lưng mở khi quái gác chết.
  **Quái gác không đánh** → chỉ là **bài kiểm đọc vỏ** (Keng, nứt, vỡ, mất vỏ). **Không dùng để kết luận trận đánh đã hay.**
- Không có: Vọng Chiến, tinh anh, Bọ, quái khác, menu, lưu game, boss mới. Vọng vẫn là kiểu **ghi chủ động** cũ (nút V).

**Dữ liệu** (khối cấu hình đầu `cong-cu/khoi-p0a.js`, mục 1): `P0_SO` (gồm `phanBo`), `THE_VO`, `THE_NOM`, `THE_TINH_ANH` / `THE_BOSS` (ghi sẵn cho sau, chưa dùng), `CFG`, `VK.dao.don` (DON), `LOAI_QUAI`, `CAP_VK`.
Đòn dao là placeholder nhưng đi qua đúng giao diện `DON → pl.cs → D` của mục 6a, nên Âm Đao cắm vào sau chỉ cần thay bảng `VK`.

## 2. Thông số (sửa ở `cong-cu/khoi-p0a.js` rồi chạy lại `tao-tu-demo.py`)

| Số | Giá trị | Ghi chú |
|---|---|---|
| `su` combo | 7 / 7 / 9 (cũ 11) | `ac` 8, `re` 8 / 8 / 16 giữ nguyên |
| Hạn chỗ chờ | hết đòn + 6 tick | |
| Ngưỡng hướng ra đòn | 0,7 | Cần gạt: `stickY < −0,7` = hất; `> 0,7` = nảy (khi trên không). Bàn phím ↑/↓ luôn đủ |
| Dao | nhát 1, 2, hất, trên không, nảy [10 máu, 10 Thế]; nhát 3 [10, 30] | Thang ×10 |
| Chuông Gỗ | máu 40, không Thế; trúng → khựng 16 tick; **đã lấy đà ≥ 18 tick hoặc đang đập → không bị ngắt** (vẫn mất máu, hiện "không ngắt!") | Đòn đập giữ số cũ (báo 30 tick, hộp t 5–10) |
| Quái gác | máu 30, vỏ (Thế) 60; không đánh, không gây sát thương chạm | Chỉ để kiểm đọc vỏ |
| Vỏ quái thường (`THE_VO`, PH5) | `phaMotLan: true`: vỡ **một lần** → choáng 120 → hồi phục 20 (đứng dậy, **vỏ vẫn vỡ**) → **mất vỏ tới chết**. Không ổn định, không hồi Thế (`hoiThe: false`) | Mất vỏ: mọi đòn gây máu (Lam, bóng, Cộng hưởng) |
| Thế tinh anh / boss (`THE_TINH_ANH`, `THE_BOSS`, cho sau) | `phaMotLan: false`: choáng 150 / 90 · hồi phục 20 (Thế về đầy) · ổn định 120 (không xuống dưới 1, không khôi phục gì đã mất) · không bị đánh 90 tick rồi +1 / 3 tick · giảm choáng lặp | Chưa quái nào dùng trong P0-A |
| Hình nộm | Thế 60 không vỏ, hồi được (giữ như cũ); choáng 60, có giảm choáng lặp 1 / 0,6 / 0,4 | Chỉ để đo |
| `CFG` | `resWindow` 12, khóa Cộng hưởng 45, hitstop Cộng hưởng 8, `CH_MAU` 1, `CH_THE` 0,5, `BONG_MAU` 0,25, `BONG_THE` 0,5, hitstop Keng 2, vỡ 6 | |

## 3. Kết quả theo tiêu chí mục 3d

### 3a. ĐÃ KIỂM BẰNG CODE (Chromium headless trên máy chủ, bàn phím / cần giả lập, mỗi hình video = 1 bước logic)

| Tiêu chí 3d | Kết quả đo | Đạt? |
|---|---|---|
| **Nhạy**: chạm → hộp ≤ `su` + 1 | Bấm lúc rảnh, 20 lần: **luôn 7 tick** (mới), **11 tick** (cũ) – tính tick bấm là tick 1 (`video/do-so.json`) | Đạt (phần đo được) |
| **Mọi lần bấm có kết cục** | Mọi cảnh quay: "thiếu kết cục **0**". Bấm mỗi 3 tick trong 120 tick: 40 lần bấm → 40 kết cục (cả hai bản). Bản cũ lộ rõ lần bấm **MAT** ("hết 8 tick") và "bi-de" (bị nạp đè) | Đạt |
| Bấm sớm (4 tick sau khi mỗi nhát bắt đầu) | Cũ: **0** lần nối được nhát 2 / nhát 3, **8** lần mất. Mới: 6 lần nhát 2, 6 lần nhát 3, **0** mất | – |
| Bấm 5 lần trong 9 tick | Cũ: chỉ 1 nhát, 3 lần "bi-de" rồi lần cuối **MAT**. Mới: **đúng 1 nhát tiếp** (nhát 2), 3 lần "bi-thay" – không tự đánh thêm | Đạt luật 3b |
| Bấm khi bị đánh | Mới: nhát đang chờ → `xoa:bi-danh`; bấm lúc đang bị đẩy → `loai:bi-danh`. Cũ: cả hai thành **MAT** | Đạt luật 3b |
| **Không ra nhầm hướng** | Chạy + cần chéo lên: cũ ra **chém hất từ 25°**; mới chỉ ra hất từ **46°** (đo 15–60°) | Phần code đạt; **tỉ lệ < 5 % phải đo trên iPhone thật** |
| **Hình khớp** (lệch 0 tick) | Debug chậm ¼ (`5-bang-tick.json`): mới – hộp tick 7–14, khung "trúng" từ tick 7, **khung 0 của vệt ở tick 7** → lệch **0**. Cũ – hộp 11–18, khung trúng 11, vệt hiện ở **tick 10 bằng khung 1** (khung 0 không bao giờ hiện) → vệt **sớm 1 tick** | Đạt (mới) |
| Mã đòn bền / hộp nhiều tick | Hộp bóng bật 8 tick trên hình nộm → **1** lần trúng (log "đã trúng → bỏ qua các tick sau"). `?dmoi=1` (lỗi cũ) → **8** lần trúng | Đạt |
| Cộng hưởng cùng tick | Lam + bóng cùng tick vào quái gác Thế 10: gom 2 lần trúng, **cả hai bị chặn theo Thế đầu tick**, vỡ, thêm 10 → tổng **10** | Đạt (PH3 sửa 2) |
| Khác tick, bóng trước 5 | Bóng Keng (Thế 10 → 5), Lam phá vỏ, thêm 10 → tổng **10** | Đạt |
| Khác tick, Lam trước 5 | Lam phá vỏ (Keng), bóng vào vỏ đã vỡ **2** + thêm 10 → **12** | Đúng ví dụ 4 trong kế hoạch |
| Cộng hưởng vỏ đầy (Thế 60) | Vỡ ngay, thêm 10 | Đạt |
| Vỏ qua đủ trạng thái (PH5) | Quái gác: Keng ×3 (60 → 50 → 40 → 10, vết nứt tăng), nhát 1 → **Choang** + choáng 120 (1 nhát máu −10) → hồi phục 20 "đứng dậy, vỏ VẪN VỠ" → **mất vỏ**: nhát 2, 3 mỗi nhát **−10 máu**, không Keng → chết (`3-quai-gac-the-log.txt`, f117 vỡ · f236 dậy · f284, f299 máu) | Đạt |
| Cộng hưởng vào mục tiêu đã mất vỏ (PH5) | Cùng tick: Lam 10 + bóng 2 + thêm 10 = **22** (30 → 8). Lam trước 5 tick: 10, rồi 2 + 10 = **22**. Phần thêm không bị chặn (`4-replay-cong-huong-log.txt`) | Đạt |
| Chuông Gỗ | Trúng lúc mới lấy đà → khựng; trúng lúc lấy đà ≥ 18 tick → "không ngắt!"; 4 nhát → chết | Đạt |
| Lỗi trang / console | 0 ở mọi cảnh; `?vao=lang`, `?p0=0`, cỡ iPhone 844×390 cảm ứng mở được, không lỗi | – |

### 3b. CẦN THỬ TRÊN IPHONE THẬT (chưa làm được từ máy chủ)

| Tiêu chí 3d | Cần gì |
|---|---|
| Nhạy | 3 người thử, so bằng ⚙ "Nhịp đánh"; ≥ 2 người thấy bản mới nhạy hơn. Độ trễ cảm ứng của Safari + màn 60/120 Hz không đo được ở đây |
| Không ra nhầm hướng | Bật `?debug=input`, chơi phòng B vài phút; xem dòng "hất khi chạy x / y (z %)" ở đầu bảng log – đạt khi **< 5 %** |
| Thế đọc được | Người chưa chơi tự phá được quái gác và nói được "nhát 3 làm nứt vỏ" (nhát 3 trừ 30 Thế, vết nứt đổi rõ) |
| Cảm giác | Combo 7/7/9 có bị "gấp" quá không; nhát 1 sau phân bố lại (PH5) có còn đọc được tư thế lấy đà không |
| Bố cục | Bảng log chỉ hiện khi `?debug=input`; chưa kiểm ngón tay che chữ trên máy thật |

## 4. Video (`video/`, 60 hình/s, H.264, bật hộp đòn + log input)

| File | Nội dung |
|---|---|
| `1-combo-cu-vs-moi.mp4` | **Cũ | Mới cạnh nhau, cùng đầu vào**: bấm nhanh 5 lần / 9 tick; bấm sớm; bấm đều; bấm khi bị Chuông Gỗ đánh; chạy + cần chéo 30° rồi 50°. Log: `-log-cu.txt`, `-log-moi.txt` |
| `2-chuong-go.mp4` | Chuông Gỗ: khựng → lấy đà ≥ 18 "không ngắt" → chết |
| `3-quai-gac-the.mp4` | **PH5:** Quái gác: Keng → nứt → Choang → choáng → đứng dậy, vỏ vẫn vỡ → mọi nhát gây máu → chết |
| `4-replay-cong-huong.mp4` | 7 cảnh replay: hộp bóng 8 tick trúng 1 lần; Cộng hưởng cùng tick; khác tick bóng trước / Lam trước; vỏ đầy; **PH5:** quái gác đã mất vỏ – cùng tick / Lam trước → 22 |
| `4b-so-loi-D-moi-moi-tick.mp4` | `?dmoi=1` – lỗi cũ để so: 1 hộp bóng trúng 8 lần |
| `5-debug-cham-quy-uoc-tick.mp4` | **Debug chậm ¼** (mỗi tick 4 hình), cũ | mới: dòng dưới ghi tick đòn · hộp · khung · khung vệt. Bảng đầy đủ `5-bang-tick.json` |
| `6-debug-cham-phan-bo-khung-truoc-sau.mp4` | **PH5 – debug chậm ¼**, **trước** (`?khung=cat`) | **sau** (phân bố lại), cùng su 7/7/9: combo 1-2-3 rồi một nhát 1 lẻ (thấy hết phần hồi). Bảng `6-bang-khung-truoc-sau.json` |
| `do-so.json`, `ket-qua.json` | Số đo dùng ở mục 3a |

Quay lại: `python3 -B game/thu-p0a/cong-cu/quay-va-do.py [do 1 2 3 4 5 6]` (cần playwright, Chromium, ffmpeg). Đây chỉ là quay + ghi số, không phải bộ kiểm thử tự động.

**Đọc log** (dòng `#số` là lần bấm): `ra-ngay → atk1` (rảnh, ra ngay) · `xep-hang` (vào chỗ chờ, có hạn) · `thay-the` / `bi-thay` · `→ thuc-hien atk2 chờ N tick` · `→ het-han` · `→ xoa:bi-danh / luot / doi-phong / rut-dao` · `loai:bi-danh / chet / tam-dung`. Bản cũ thêm `atkBuf-8`, `bi-de`, `MAT`.
Dòng trúng ghi mã đòn `D`, `maGoc`, Thế đầu tick, tổng máu của tick.

## 5. Sáu câu hỏi trước – chủ dự án đã chốt (phản hồi 5)

| Câu hỏi | Chốt (PH5) | Trang này làm |
|---|---|---|
| 1. Cộng hưởng xuyên ổn định / hồi phục? | Không phá Thế xuyên ổn định; mục tiêu đã mất vỏ nhận máu bình thường | Vỏ quái thường vỡ một lần, không còn ổn định → Cộng hưởng vào quái gác đã mất vỏ cộng đủ 10 máu. Luật ổn định chỉ còn cho Thế tinh anh / boss (cấu hình cho sau) |
| 2. Một Cộng hưởng mỗi mục tiêu? | Đồng ý | Giữ, xác nhận code (mục 6.2) |
| 3. Bóng 0,25 máu phụ? | Giữ, ghi rõ cấu hình thử, cũ / mới giống nhau | Giữ; đã đo giống nhau. Sửa câu sai về demo cũ / `?bm=0` |
| 4. Nhát 1 chỉ còn 1 tick chuẩn bị? | Chưa gen / vẽ lại; phân bố lại trong startup 7 tick | Đã làm (mục 6.3) |
| 5. Lướt xoá nhát chờ, chém trong lướt vào chờ? | Đồng ý | Giữ như cũ |
| 6. Gen vòng Thế / vết nứt? | Không; tắt log / hitbox khi thử người chơi | Hình code giữ nguyên; link mặc định đã tắt |

## 6. Sửa theo phản hồi 5 (`docs/gameplay/PHAN-HOI-5-P0A.md`)

Chỉ sửa nhỏ. **Không** thêm quái / hệ thống mới, không sửa `game/demo.html`, `build-demo.py`, không publish. Chưa ghép vào game chính.

### 6.1. Vỏ quái thường vỡ một lần (luật mới)
- **Vỏ vật lý của quái thường** (`THE_VO`, quái gác): phá **một lần**, giữ vỡ tới chết. Choáng 120 → hồi phục 20 (đứng dậy, Thế **không** về đầy) → trạng thái **mất vỏ** tới chết.
  Không có ổn định, không có "không bị đánh 90 tick thì hồi Thế" (bỏ bộ đếm vô hình – vết nứt chỉ tăng, không tự lành).
- **Ổn định** chỉ ngăn phá Thế tiếp, **không** tự khôi phục vỏ đã mất. Mục tiêu đã mất vỏ nhận máu **bình thường** từ Lam, bóng và phần thêm của Cộng hưởng.
- **Thế tinh anh / boss** (chưa có trong P0-A) giữ luật hồi + ổn định + giảm choáng lặp: cấu hình `THE_TINH_ANH`, `THE_BOSS` ghi sẵn ở đầu `khoi-p0a.js`, chưa quái nào dùng.
- **Hình nộm** giữ như cũ (Thế hồi được, ổn định 60) – nó là công cụ đo.
- Hiển thị: sau khi đứng dậy nhãn trên đầu quái gác đổi thành **"VỎ VỠ"**, vết nứt đầy đủ, thanh vỏ rỗng. Gợi ý phòng C: "vỏ vỡ là vỡ hẳn tới chết".
- **Quái gác không đánh** → chỉ là bài kiểm **đọc vỏ**, không dùng để kết luận trận đánh đã hay.
- Video `3-quai-gac-the.mp4`, `4-replay-cong-huong.mp4` (2 cảnh mới). Số đo ở mục 3a.

### 6.2. Cộng hưởng theo từng mục tiêu (xác nhận code)
- Nhớ nhát chờ ghép (`e.chP` Lam, `e.chE` bóng) và khoá 45 tick (`e.khoaCH`) là **của từng mục tiêu**. Một cú quét trúng 2 con cùng bóng → mỗi con 1 Cộng hưởng.
- **Mỗi cặp nhát ghép tối đa 1 lần trên mỗi mục tiêu**: mỗi `D` (Lam hoặc bóng) chỉ trúng một mục tiêu một lần (`D.daTrung`), nhớ bị xoá khi ghép,
  và (thêm lần này cho rõ) mỗi mục tiêu giữ danh sách mã nhát đã ghép `e.daGhep` – nhát đã ghép trên mục tiêu đó thì không ghép lại (log "bỏ Cộng hưởng … đã ghép").
- Bóng **0,25** máu phụ / 0,5 Thế giữ làm cấu hình kiểm công thức, **giống nhau** ở `?p0=0` và bản mới (`CFG` không phụ thuộc nhịp; đo `do-so.json` → `thong_so`).
- Luật lướt giữ như hiện tại: lướt xoá lệnh chờ cũ; chém trong lướt giữ một lệnh, ra khi được phép; huỷ khi bị đánh / chết / đổi phòng.

### 6.3. Nhát 1 (và 2, 3): phân bố lại khung trong startup – không vẽ / gen lại
Cùng `su` 7 / 7 / 9, cùng ảnh trong sheet, **không** tăng rung, **không** kéo dài hitstop. Chỉ đổi khung nào hiện ở tick nào (`P0_SO.phanBo`):

| Nhát | Trước (P0-A, cắt đầu bảng – `?khung=cat`) | **Sau (PH5)** |
|---|---|---|
| 1 | chuanbi×**1** · giuong×3 · giuong~vung×1 · vung×1 · **trung ở tick 7** ×3 · trung2×5 · thu×3 · ve×5 | chuanbi×**2** · giuong×3 · vung×1 · **trung ở tick 7** ×2 · trung2×6 · thu×4 · ve×4 |
| 2 | (không có chuanbi) giuong×4 · giuong~vung×1 · vung×1 · trung tick 7 ×3 · trung2×5 · thu×3 · ve×5 | chuanbi×1 · giuong×4 · vung×1 · trung tick 7 ×2 · trung2×6 · thu×4 · ve×4 |
| 3 | chuanbi×1 · giuong×5 · giuong~vung×1 · vung×1 · trung tick 9 ×3 · trung2×5 · thu×8 · ve×8 | chuanbi×2 · giuong×4 · giuong~vung×1 · vung×1 · trung tick 9 ×2 · trung2×6 · thu×8 · ve×8 |

Ý đồ: **lấy đà ngắn nhưng đọc rõ** (chuẩn bị + giương 5 tick ở nhát 1 thay vì 1 tick chuẩn bị) → **chuyển vung nhanh** (bỏ khung trộn ở nhát 1, 2: vung chỉ 1 tick) →
**điểm chạm sắc** (trung 2 tick thay vì 3) → **hồi có trọng lượng** (giữ tư thế vung-qua 6 tick, thu 4 tick). Đo (`6-bang-khung-truoc-sau.json`):
hộp vẫn tick 7–14 / 7–14 / 9–16, khung "trung" vẫn từ tick `su`, vệt khung 0 vẫn đúng tick `su` (`5-bang-tick.json`: lệch 0).
Video **debug chậm ¼ trước | sau**: `video/6-debug-cham-phan-bo-khung-truoc-sau.mp4`. Đẹp hay chưa là **cảm nhận**, phải xem trên máy thật – mục 6.4.

### 6.4. Hướng dẫn thử người chơi (iPhone, trước khi ghép vào game chính)
**Chuẩn bị:** iPhone xoay ngang, Safari, mở **link mặc định** (không thêm gì – log và hộp đòn tắt). Không chạm nút ▣. Cùng một máy cho mọi người thử nếu được.

**So nhịp cũ / mới cùng điều kiện:**
1. Mỗi người chơi **cả hai** nhịp: MỚI = link mặc định; CŨ = ⚙ → "Nhịp đánh" (trang tải lại với `?p0=0`). Quái, máu, vỏ, bóng **giống hệt**; chỉ khác độ nhạy tay.
2. Mỗi lượt cùng một việc, cùng thời lượng (~3 phút): phòng A đánh hình nộm vài combo → phòng B hạ 2 Chuông Gỗ → phòng C phá vỏ quái gác.
3. **Đổi thứ tự giữa các người thử**: người 1 CŨ → MỚI, người 2 MỚI → CŨ, người 3 CŨ → MỚI … Không nói trước bản nào là "mới". Ghi lại thứ tự từng người.
4. Đừng gợi ý cách chơi trong lúc thử (ngoài câu hướng dẫn đầu: "chém, lướt, bấm V để gọi bóng").

**Sau mỗi bản, hỏi riêng từng câu** (không gộp, không hỏi "bản nào hay hơn" trước):
1. Bấm chém thì đòn ra **có nhanh** không? (1 = chậm / trễ … 5 = ra ngay)
2. Có lúc nào Lam **đánh tiếp ngoài ý muốn** (đánh thêm nhát mình không bấm) không? Lúc nào?
3. Có lúc nào **ra nhầm chém hất** (chém lên) khi chỉ muốn chém ngang không? Lúc nào?
Cuối buổi mới hỏi thêm: "bản thứ nhất hay thứ hai dễ điều khiển hơn?" và ở phòng C: "nhát nào làm nứt vỏ nhiều nhất?" (mong đợi: nhát 3).

**Báo cáo tách hai phần – không trộn:**

| Phần A – số đo code (máy chủ / log) | Phần B – cảm nhận người chơi (iPhone thật) |
|---|---|
| Chạm → hộp: 7 tick (mới) / 11 tick (cũ) khi rảnh (`do-so.json`) | Câu 1, 2, 3 của từng người, ghi kèm **thứ tự** đã chơi |
| Mọi lần bấm có kết cục: thiếu 0 | Số người thấy bản mới nhạy hơn (đạt khi ≥ 2 / 3) |
| Chém hất khi chạy: chỉ ra từ cần ≥ 46° (mới) / 25° (cũ) | Có ai tự nói "nhát 3 làm nứt vỏ" không |
| Hình khớp hộp: lệch 0 tick; phân bố khung mục 6.3 | Nhát 1 có "bật thẳng" / thiếu lực không |
| (Tỉ lệ hất khi chạy trên máy thật: bật `?debug=input` **riêng**, sau buổi thử, dòng "hất khi chạy x / y") | Ghi chú tự do |

Số đo ở phần A **không** thay cho cảm nhận ở phần B, và ngược lại.

### 6.5. Sửa tài liệu
- Câu cũ ở mục 5 ("nếu muốn P0-A giống demo cũ – bóng không gây máu – thì dùng `?bm=0`") **sai**: demo cũ được báo cáo bóng gây **1 máu như Lam**, không phải 0.
  Đã sửa: `?bm=0` là **cấu hình thử tắt sát thương bóng**, không gọi là giống demo cũ (bảng cờ đầu file + `KE-HOACH-GAMEPLAY-V2.md` mục 4).
- `KE-HOACH-GAMEPLAY-V2.md`: mục 5 viết lại theo luật vỏ mới, 3c (phân bố khung), 3d (thử người chơi), 6b, 10 + bảng "Đã sửa theo phản hồi 5".

### 6.6. Bọ Vỏ Mộc (`game/thu-bo-vo-moc/`)
Mai vỡ thì **giữ vỡ** sau khi đứng dậy tới chết (bỏ "dậy lại → mai đầy", bỏ mai tự hồi); hết choáng Bọ **đánh tiếp** (báo trước + húc).
Chi tiết + video quay lại: `game/thu-bo-vo-moc/GHI-CHU.md` mục "Sửa theo phản hồi 5".

### 6.7. Chưa làm / cần biết
- Chưa thử trên iPhone thật (mục 3b, 6.4). Mọi số trên là đo trong Chromium headless.
- Phân bố khung mới là đề xuất để xem; nếu nhát 1 vẫn thiếu lực trên máy thật thì mới tính vẽ khung chuẩn bị ngắn riêng.
- Âm Đao cấp 1–4: **đã làm** ở trang con `am-dao.html` (bản này giữ nguyên để so) – xem `GHI-CHU-AM-DAO.md`.
