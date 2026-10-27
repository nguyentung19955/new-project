# Trang thử P0-A – nhịp đánh + Chuông Gỗ + quái gác có Thế (27/10/2026)

Viết cho người không rành kỹ thuật. Đây là **trang thử riêng**, sinh từ `game/demo.html` bằng script `cong-cu/tao-tu-demo.py`.
**Không sửa** `demo.html`, `build-demo.py`, `thu-bo-vo-moc/`, `thu-quai-huong-moi/`. Không publish. Làm đúng mục 3, 6, 7, 8 của
`docs/gameplay/KE-HOACH-GAMEPLAY-V2.md` (đã sửa theo phản hồi 3 trước khi làm – commit riêng).

**Chơi thử:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-p0a/index.html

| Thêm vào địa chỉ | Để làm gì |
|---|---|
| (không thêm gì) | Nhịp **MỚI** (P0-A) |
| `?p0=0` | Nhịp **CŨ** để so. **Quái, máu, Thế, công thức giống hệt** bản mới – chỉ đổi phần nhạy tay (không đổi độ nhạy và độ khó cùng lúc). Trong game: ⚙ → nút "Nhịp đánh" đổi qua lại |
| `?debug=input` | Bảng log lần bấm Chém + log trúng / Cộng hưởng (góc trên phải), số tick đòn trên đầu Lam |
| `?hitbox=1` (hoặc phím H / nút ▣) | Lớp hộp đòn: đỏ = đòn đang gây sát thương ở tick này, teal = hộp của bóng |
| `?debug=anim` | Debug chậm có sẵn của demo: ⏸, +1 bước, ×½ ×¼ ×⅒ |
| `?vao=lang` | Vào làng cũ như demo (để kiểm phần cũ không hỏng) |
| `?bm=0` | Bóng không gây máu phụ (mặc định 0,25) |
| `?dmoi=1` | **Chỉ để so lỗi**: tạo đòn bóng mới mỗi tick (lỗi PH3 chỉ ra) – hộp bóng 8 tick trúng 8 lần |

Ví dụ: `index.html?debug=input&hitbox=1` và `index.html?p0=0&debug=input&hitbox=1`.

## 1. Đã đổi gì (so với demo)

| Phần | Cũ (`?p0=0`) | Mới (P0-A) |
|---|---|---|
| Hàng chờ đòn | `atkBuf` 8 tick: bấm sớm hơn tick 11 của nhát đang chạy là **mất lặng lẽ** | **1 chỗ chờ** (`CHO`). Nhận từ tick 1 của đòn; ra ở tick đầu tiên được phép (nối combo ở `su + ac`, sau nhát 3 là nhát 1 mới); hạn = hết đòn (hoặc hết lướt) + **6 tick**; bấm thêm thì **thay** nhát chờ (lấy hướng cần của lần bấm mới); **xoá** khi lướt, bị đánh, chết, đổi phòng, rút dao, đặt lại vị trí. Đang bị đánh (`hurtT > 8`), đang chết, rút dao, tạm dừng → **loại** |
| Khởi động combo | `su` 11 / 11 / 11 | **7 / 7 / 9**. Nảy, hất, trên không giữ nguyên |
| Ngưỡng hướng **lúc ra đòn** | 0,38 (≈ 22°) | **0,7** (≈ 44°). Chạy, xuống ván, pogo tự động giữ nguyên |
| Hình / vệt chém | Bảng khung cũ; vệt `bat_dau` 10 | Bảng `khung_theo_atkT` cắt 4 / 4 / 2 phần tử đầu; `vetBatDau = su`; vệt + tia trúng tạo với `t = −1` để khung 0 hiện đúng tick (quy ước KHGP2 3c) |
| **Giống nhau ở cả hai bản** | | Dữ liệu đòn `D` bền (mã đòn sống suốt vòng đời đòn), bóng tra `maGoc → maReplay` theo từng lần phát, gom mọi lần trúng của một tick, công thức 6b, Thế mục 5, Chuông Gỗ [40], quái gác [30, Thế 60, vỏ], hình nộm, 3 phòng A–B–C |

**3 phòng mới** (nối sau phòng boss, theo `so-do-phong-thu-v2.png`; vào thẳng phòng A):
- **A · Khởi đầu** (24 ô): chuông lưu, **hình nộm** (máu 999, Thế 60 không vỏ, tự hồi đầy sau 3 s không bị đánh; hiện số vừa trúng, tổng, và "chạm → hộp: N tick").
- **B · Sân hai chuông** (34 ô): 2 Chuông Gỗ tuần tra lệch pha, cách nhau 15 ô, ván một chiều giữa sân.
- **C · Hành lang gác** (32 ô): trần cao **8 ô** (không trần thấp), 16 ô sàn trống trước **quái gác**, cổng sau lưng mở khi quái gác chết.
- Không có: Vọng Chiến, tinh anh, Bọ, quái khác, menu, lưu game, boss mới. Vọng vẫn là kiểu **ghi chủ động** cũ (nút V).

**Dữ liệu** (khối cấu hình đầu `cong-cu/khoi-p0a.js`, mục 1): `P0_SO`, `THE_VO`, `THE_NOM`, `CFG`, `VK.dao.don` (DON), `LOAI_QUAI`, `CAP_VK`.
Đòn dao là placeholder nhưng đi qua đúng giao diện `DON → pl.cs → D` của mục 6a, nên Âm Đao cắm vào sau chỉ cần thay bảng `VK`.

## 2. Thông số (sửa ở `cong-cu/khoi-p0a.js` rồi chạy lại `tao-tu-demo.py`)

| Số | Giá trị | Ghi chú |
|---|---|---|
| `su` combo | 7 / 7 / 9 (cũ 11) | `ac` 8, `re` 8 / 8 / 16 giữ nguyên |
| Hạn chỗ chờ | hết đòn + 6 tick | |
| Ngưỡng hướng ra đòn | 0,7 | Cần gạt: `stickY < −0,7` = hất; `> 0,7` = nảy (khi trên không). Bàn phím ↑/↓ luôn đủ |
| Dao | nhát 1, 2, hất, trên không, nảy [10 máu, 10 Thế]; nhát 3 [10, 30] | Thang ×10 |
| Chuông Gỗ | máu 40, không Thế; trúng → khựng 16 tick; **đã lấy đà ≥ 18 tick hoặc đang đập → không bị ngắt** (vẫn mất máu, hiện "không ngắt!") | Đòn đập giữ số cũ (báo 30 tick, hộp t 5–10) |
| Quái gác | máu 30, Thế 60, vỏ; không đánh, không gây sát thương chạm | |
| Thế vỏ cứng | choáng 120 · hồi phục 20 (Thế về đầy) · ổn định 60 (không xuống dưới 1) · không bị đánh 90 tick rồi +1 / 3 tick | Đang choáng / hồi phục: không nhận Thế |
| Hình nộm | Thế 60 không vỏ; choáng 60, có giảm choáng lặp 1 / 0,6 / 0,4 | Chỉ để đo |
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
| Thế qua đủ trạng thái | Quái gác: Keng ×3 (60 → 50 → 40 → 10, vết nứt tăng), nhát 1 → **Choang** + choáng 120 → hồi phục 20 → ổn định 60 (đánh vẫn Keng) → bình thường → phá lại → chết (`3-quai-gac-the-log.txt`) | Đạt |
| Chuông Gỗ | Trúng lúc mới lấy đà → khựng; trúng lúc lấy đà ≥ 18 tick → "không ngắt!"; 4 nhát → chết | Đạt |
| Lỗi trang / console | 0 ở mọi cảnh; `?vao=lang`, `?p0=0`, cỡ iPhone 844×390 cảm ứng mở được, không lỗi | – |

### 3b. CẦN THỬ TRÊN IPHONE THẬT (chưa làm được từ máy chủ)

| Tiêu chí 3d | Cần gì |
|---|---|
| Nhạy | 3 người thử, so bằng ⚙ "Nhịp đánh"; ≥ 2 người thấy bản mới nhạy hơn. Độ trễ cảm ứng của Safari + màn 60/120 Hz không đo được ở đây |
| Không ra nhầm hướng | Bật `?debug=input`, chơi phòng B vài phút; xem dòng "hất khi chạy x / y (z %)" ở đầu bảng log – đạt khi **< 5 %** |
| Thế đọc được | Người chưa chơi tự phá được quái gác và nói được "nhát 3 làm nứt vỏ" (nhát 3 trừ 30 Thế, vết nứt đổi rõ) |
| Cảm giác | Combo 7/7/9 có bị "gấp" quá không; khung chuẩn bị nhát 1 chỉ còn 1 tick (xem mục 5) |
| Bố cục | Bảng log chỉ hiện khi `?debug=input`; chưa kiểm ngón tay che chữ trên máy thật |

## 4. Video (`video/`, 60 hình/s, H.264, bật hộp đòn + log input)

| File | Nội dung |
|---|---|
| `1-combo-cu-vs-moi.mp4` | **Cũ | Mới cạnh nhau, cùng đầu vào**: bấm nhanh 5 lần / 9 tick; bấm sớm; bấm đều; bấm khi bị Chuông Gỗ đánh; chạy + cần chéo 30° rồi 50°. Log: `-log-cu.txt`, `-log-moi.txt` |
| `2-chuong-go.mp4` | Chuông Gỗ: khựng → lấy đà ≥ 18 "không ngắt" → chết |
| `3-quai-gac-the.mp4` | Quái gác: Keng → nứt → Choang → choáng → hồi phục → ổn định → phá lại → chết |
| `4-replay-cong-huong.mp4` | 5 cảnh replay: hộp bóng 8 tick trúng 1 lần; Cộng hưởng cùng tick; khác tick bóng trước / Lam trước; vỏ đầy |
| `4b-so-loi-D-moi-moi-tick.mp4` | `?dmoi=1` – lỗi cũ để so: 1 hộp bóng trúng 8 lần |
| `5-debug-cham-quy-uoc-tick.mp4` | **Debug chậm ¼** (mỗi tick 4 hình), cũ | mới: dòng dưới ghi tick đòn · hộp · khung · khung vệt. Bảng đầy đủ `5-bang-tick.json` |
| `do-so.json`, `ket-qua.json` | Số đo dùng ở mục 3a |

Quay lại: `python3 -B game/thu-p0a/cong-cu/quay-va-do.py [do 1 2 3 4 5]` (cần playwright, Chromium, ffmpeg). Đây chỉ là quay + ghi số, không phải bộ kiểm thử tự động.

**Đọc log** (dòng `#số` là lần bấm): `ra-ngay → atk1` (rảnh, ra ngay) · `xep-hang` (vào chỗ chờ, có hạn) · `thay-the` / `bi-thay` · `→ thuc-hien atk2 chờ N tick` · `→ het-han` · `→ xoa:bi-danh / luot / doi-phong / rut-dao` · `loai:bi-danh / chet / tam-dung`. Bản cũ thêm `atkBuf-8`, `bi-de`, `MAT`.
Dòng trúng ghi mã đòn `D`, `maGoc`, Thế đầu tick, tổng máu của tick.

## 5. Câu hỏi cần chủ dự án quyết

1. **Cộng hưởng khi vỏ đang ổn định / hồi phục**: hiện tại Cộng hưởng **không** phá được vỏ đang ổn định (Thế không xuống dưới 1) và phần máu thêm **cũng bị chặn** (vỏ còn nguyên). Đồng ý, hay muốn Cộng hưởng xuyên ổn định?
2. **"Mỗi nhát ghép Cộng hưởng tối đa 1 lần"** đang tính **trên mỗi mục tiêu** (một nhát quét trúng 2 con cùng bóng → mỗi con 1 Cộng hưởng). Tính toàn cục thì kết quả sẽ phụ thuộc con nào được duyệt trước – trái luật "không phụ thuộc thứ tự duyệt". Giữ theo mục tiêu?
3. **Bóng gây máu phụ 0,25** đã bật sẵn (công thức 6b). Mục 4 ghi đây là việc của P0-B; nếu muốn P0-A giống demo cũ (bóng không gây máu) thì dùng `?bm=0` hoặc đổi mặc định.
4. Nhát 1 với `su` 7 chỉ còn **1 tick** khung chuẩn bị (cắt 4 trong 5) rồi vào giương / vung. Có cần vẽ lại khung chuẩn bị ngắn hơn, hay giữ cắt bảng?
5. Lướt trong lúc có nhát chờ đang **xoá** nhát chờ; bấm Chém **trong** lúc lướt thì vào chỗ chờ và ra khi hết lướt (hạn + 6). Đúng ý không?
6. Vết nứt vỏ và thanh Thế hiện vẽ bằng code (tạm). Có cần ảnh gen cho vòng đồng / vết nứt 3 mức trước khi thử người chơi?
