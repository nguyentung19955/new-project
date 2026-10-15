# Kế hoạch: chuyển Linh Khí từ pixel art sang tranh vẽ tay nét mịn

Ngày lập: 15/10/2026 · Nhánh: `khoi-tao-du-an` · Trạng thái: **CHỈ LÀ KẾ HOẠCH, chưa sửa code game**

Phong cách đích (mặc định, chủ game đổi được ở Bước 0A): **tranh minh hoạ hoạt hình 2D vẽ tay, nét mịn, viền tối rõ, tô màu phẳng và đổ bóng mềm**, hợp với 7 cảnh truyện (`docs/anh-goc/truyen/`) và 2 bìa (`docs/anh-goc/bia/`).

Ba nguyên tắc không đổi suốt kế hoạch:

1. **Không đổi cân bằng game** (`docs/ke-hoach/LUAT-CAN-BANG.md`). Chỉ đổi *hình*, không đổi *số*: máu, sát thương, tốc độ, thời lượng đòn, khung chạm đòn, vùng va chạm đều giữ nguyên.
2. **Hai kiểu chạy song song bằng cờ.** Mặc định vẫn là pixel. Thêm `?netmin=1` vào địa chỉ thì chạy bản mịn. Bản mặc định phải giống hệt trước, từng điểm ảnh, cho tới ngày chủ game chốt.
3. **Xem thử nhỏ trước, làm hết sau.** Bước 0 chỉ làm 5 thứ (Zed, 1 quái, 1 trùm, 1 nền phòng, 1 nút) để chủ game xem cảm giác, rồi mới quyết làm tiếp hay dừng.

> Giải thích từ ngữ: **khung** là một hình trong một động tác (ví dụ "đi bộ" có 8 khung). **Tấm** là một ảnh chứa nhiều khung xếp thành hàng. **Prompt** là một lần nhờ công cụ tạo ảnh vẽ, ra một tấm. **net 2** nghĩa là ảnh có số điểm ảnh gấp đôi kích thước trong game.

---

## 1. Kiểm kê: phải vẽ lại những gì

Số liệu dưới đây đếm thẳng từ `game/art/custom/*.sprite.json` (526 tệp) ngày 15/10. Không tính 30 tệp `*-cu` (hình quái cũ chỉ dùng khi bật `?quaicu=1`) và `game/art/du-tru/`. Hai nhóm này giữ pixel, không vẽ lại.

### 1.1 Bảng tổng

Cột "Prompt" tính theo quy cách mới (mục 4): **mỗi prompt ra 1 hàng khung**, cộng thêm 1 prompt "ảnh mẫu" cho mỗi nhân vật hay con quái.

| Nhóm | Tệp trong game | Khung (hình) | Prompt cần gen | Ghi chú |
|---|---:|---:|---:|---|
| **Zed** (nhân vật chơi, hình Cu Tí cũ), 4 bộ đồ | 4 (`zed-moi`, `zed-rung`, `zed-bien`, `zed-lau`) | 4 × 273 = 1.092 (vẽ thật 4 × 161 = 644, phần còn lại là hàng "cầm vũ khí" máy tự ghép) | 4 × (1 mẫu + 27 hàng) = **112** | Thân vẽ **không cầm vũ khí**, game tự gắn vũ khí theo điểm neo (`docs/anh-goc/zed/gan-vk/neo.json`) |
| **Vũ khí của Zed** (ghép lớp) | 1 (`zed-vk`) | 4 loại × 4 cấp = 16 | **4** (mỗi loại 1 hàng 4 cấp) | Phần phát sáng vẽ trắng, game tự nhuộm theo hệ |
| **Quái thường** | 25 | 25 × 34 = 850 | 25 × (1 + 6) = **175** | 6 hàng: đứng, đi, báo đòn, đánh, trúng đòn, chết |
| **Quái tinh anh / chúa** (Heo Nanh Dài, Cua Tướng, Cá Nóc Chúa, Nấm Phồng Chúa, Hũ Lửa Chúa) | 5 | 170 | 5 × 7 = **35** | |
| **Trùm nhỏ** (Nấm Chúa, Cua Đá, Hổ Lửa), 2 pha | 6 (`namChua`, `namChua-p2`…) | 3 × (34 + 22) = 168 | 3 × (1 + 6 + 4) = **33** | Pha 2 chỉ 4 hàng |
| **Trùm vùng** (Mộc Tinh, Ngư Tinh, Hồ Tinh), 3 pha | 9 | 3 × (34 + 30 + 30) ≈ 282 | 3 × (1 + 6 + 5 + 5) = **51** | Hình to nhất game (140–177 × 105–131 điểm game) |
| **Người làng** (7 người) | 7 (`nl-*`) | 7 × 12 = 84 | 7 × 3 = **21** | 2 hàng: đứng, nói |
| **Ba bạn** (Cu Tèo, Cái Bống, Cu Lì) | 3 (`em-be-*`) | 3 × 48 (game chỉ còn dùng vài hàng) | 3 × 3 = **9** | Chỉ còn ngồi ở sân đình, trong truyện, bảng Ông Từ. Phiên làm phải soát lại xem hàng nào còn dùng |
| **Hiệu ứng `hu-*`** | 166 | 901 | **≈ 95–127** | 39 tệp là bản Lửa/Độc/Băng của 13 hiệu ứng, máy tự nhuộm, không gen. Khoảng 30 hiệu ứng đơn giản (chớp, vòng, lấp lánh) có thể vẽ bằng code (xem 2.8) |
| **Nền phòng** (`gd-nen-*`) | 27 (3 vùng × 9 ô) | 27 | 3 × 2 = **6** | Mỗi vùng: 1 tấm sàn (ô lát liền mép) + 1 tấm tường |
| **Trang trí phòng, đồ trong phòng, cửa** (`gd-tt-*`, `gd-vat-*`, `gd-cua-*`) | 52 + 18 + 20 = 90 | 90 | **≈ 16** | Mỗi tấm 1 hàng 6–8 món |
| **Làng** (`gd-lang-*`, `gd-cong-ai-ngay`) | 20 | 20 | **≈ 5** | Nền làng 720 × 270 (1 prompt riêng) + đình, lò rèn, cây đa… |
| **Giao diện: nút, khung, ô, thẻ, thanh, vòng, báo trước** (`gd-nut`, `gd-khung`, `gd-o`, `gd-the`, `gd-thanh`, `gd-vong`, `gd-bt`, `gd-can`…) | ≈ 85 | ≈ 115 (báo trước có 8 khung) | **≈ 12** | Khoảng 25 tệp **cắt lại từ ảnh gốc** đã có, không gen (mục 1.2) |
| **Biểu tượng nhỏ** (`gd-phong`, `gd-quai`, `gd-he`, `gd-ngoc`, `gd-huy`, `gd-sao`, `gd-ai`, `gd-tui`…) | ≈ 40 | 40 | **≈ 6** | Mỗi tấm 1 hàng 8 biểu tượng |
| **Đồ rơi** (`vp-*`: vàng, quặng, linh khí, bình máu, mảnh…) | 14 | 14 | **2** | Hình rất nhỏ (6–10 điểm game) |
| **Cộng** | **≈ 490** | **≈ 3.000** | **≈ 580–610** | |

Phân theo vùng (quan trọng để chia đợt và tải theo vùng). Mỗi vùng có 12 con:

| Vùng | Quái thường | Tinh anh / chúa | Trùm nhỏ | Trùm vùng |
|---|---|---|---|---|
| Rừng già | Heo Rừng Con, Bọ Hung, Chồn Bóng, Hoa Bào Tử, Nấm Phồng, Nhím Độc, Ong Vò Vẽ, Sóc Nổ | Heo Nanh Dài, Nấm Phồng Chúa | Nấm Chúa | Mộc Tinh |
| Hang biển | Cua Lính, Bầy Cá Con, Cá Chuồn, Cá Nóc, Hải Quỳ, Ốc Mượn Hồn, Sứa Bom, Nhím Biển | Cua Tướng, Cá Nóc Chúa | Cua Đá | Ngư Tinh |
| Lâu đài cổ | Lính Ma, Dơi Than, Tượng Đá, Đèn Lồng Ma, Mèo Đen, Hũ Lửa, Tiểu Yêu, Nhím Than | Tướng Ma, Hũ Lửa Chúa | Hổ Lửa | Hồ Tinh |

### 1.2 Những gì giữ được, không vẽ lại

| Thứ | Vì sao giữ | Việc còn phải làm |
|---|---|---|
| **7 cảnh truyện** (`game/art/truyen/`, nguồn `docs/anh-goc/truyen/`) | Vốn đã là tranh vẽ mịn, chính là "đích" của phong cách mới | Không. Dùng làm ảnh tham chiếu phong cách |
| **2 bìa** (`game/art/bia/`, nguồn `docs/anh-goc/bia/`) | Như trên | Không |
| **Khung giao diện có ảnh gốc lớn** trong `docs/anh-goc/giao-dien/` (khung bảng, khung thoại, nút chữ 4 màu, thanh trên) và `giao-dien/dot2/` (dải thông báo, khung cảnh báo, khung máu quái, khung nhỏ, vạch linh khí, ô con, thanh cuộn, thẻ nhỏ, thẻ sắp có) | Ảnh gốc rộng khoảng 2.000 điểm ảnh, hơn 60.000 màu, đã đủ mịn. Game đang thu nhỏ rồi ép còn 32–48 màu nên mới ra pixel | **Cắt lại** ở chế độ "Mịn" (bỏ giảm màu, bỏ alpha cứng). Khoảng 25 tệp `gd-*`, không tốn prompt |
| **Bản đồ vùng, khung bản đồ** (`gd-ban-do-vung`, `gd-khung-ban-do`) | Ảnh gốc lớn (`docs/anh-goc/nen-phong/ban-do-chon-ai.png`) | Cắt lại như trên, xem có cần gen lại không |
| **Chữ** | Chữ vẽ trên lớp `#ui` riêng, đã nét theo màn hình | Không |
| **Tệp `*-cu` (30), `du-tru/`** | Chỉ dùng ở chế độ pixel khi bật cờ cũ | Không đụng |
| **Ảnh gốc pixel đã có** trong `docs/anh-goc/` (quái, trùm, Zed, NPC…) | Không dùng làm ảnh game nữa, nhưng **là ảnh mẫu bắt buộc gửi kèm** mỗi prompt để giữ đúng thiết kế nhân vật | Không |

### 1.3 Phần game đang vẽ bằng code (không phải ảnh)

Khoảng 16.800 dòng trong `art.js`, `monster_art.js`, `room_art.js`, `env_art.js`, `weapon_art.js`, `fx*.js`, `village_scene.js`, `ui_theme.js`, `btn_art.js`. Phần lớn là **hình dự phòng** khi ảnh chưa tải xong. Thứ người chơi thật sự nhìn thấy là các hạt, tia, vệt, bóng dưới chân, thanh máu và vòng báo đòn: khoảng 100 lệnh vẽ ô vuông (`A.p` / `fillRect`) trong `fx.js`, `fx_he.js`, `fx_dan.js`, `fx_ky_nang.js`, `do_roi.js`, `combat.js`. Ở chế độ mịn, các lệnh này phải vẽ chấm tròn hoặc nét mềm, nếu không sẽ lộ ô vuông giữa tranh mịn. Đây là **việc code, không cần gen ảnh** (mục 2.8).

---

## 2. Kỹ thuật

### 2.1 Hiện tại game vẽ thế nào

| Thứ | Hiện tại | Ở đâu |
|---|---|---|
| Toạ độ game | 480 × 270 "điểm game". Mọi số liệu (vị trí, tầm đánh, va chạm) tính theo hệ này | `G.W`, `G.H` |
| Canvas thế giới | 960 × 540 (gấp đôi, `G.NET = 2`, cài đặt "Độ nét: Cao"), hoặc 480 × 270 ("Thường") | `engine.js` `G.setNet` |
| Ảnh | Hầu hết là **net 2**: ảnh có số điểm gấp đôi cỡ game (ví dụ Zed: khung 96 × 96 điểm ảnh = 48 × 48 điểm game) | trường `net` trong `.sprite.json` |
| Làm mịn | **Tắt ở mọi nơi**: `imageSmoothingEnabled = false`, 91 chỗ trong 25 tệp. Canvas thế giới được phóng lên màn hình cũng không làm mịn | `engine.js` dòng ~719 |
| Vị trí vẽ | Làm tròn tới điểm game (`Math.round` ở chỗ vẽ quái, Zed, thanh máu…) nên hình đi theo từng bậc | `sprite_custom.js` dòng ~1042, `zed_moi.js`, `stage.js` |
| Lớp chữ | Canvas `#ui` riêng, nét theo màn hình (tối đa gấp 2) | `engine.js` |
| Công cụ tách | Nền được xoá theo kiểu có hoặc không (alpha 0/255), ép còn 32/48 màu, thêm viền `#14182e` | `tools/tach-*/index.html` |

### 2.2 Cờ hai kiểu song song

- `?netmin=1`: bật bản mịn. `?netmin=0` hoặc không ghi gì: pixel như cũ.
- Biến `G.NET_MIN` (true/false) đọc cờ một lần lúc mở game. Mọi chỗ khác chỉ hỏi biến này.
- **Bộ ảnh riêng:** ảnh mịn để ở `game/art/min/<mã>.sprite.json`, **cùng mã** với ảnh pixel (`heoCon`, `zed-moi`, `gd-nut-ne`…). `build.py` đóng thêm một bảng ảnh thứ hai. Người chơi bản nào **chỉ tải bộ của bản đó**, không tải cả hai.
- **Thiếu ảnh mịn thì dùng ảnh pixel.** Như vậy làm tới đâu thử được tới đó (Bước 0 chỉ có 5 thứ mịn, còn lại vẫn pixel). Trước ngày chốt, bài kiểm phải báo **0 hình thiếu**.
- Trình duyệt không đọc được WebP (rất hiếm) thì luôn chạy pixel.
- Không đổi tệp lưu. Ngày chốt: thêm lựa chọn "Kiểu hình: Pixel / Tranh vẽ" ở Anh Mõ, đổi mặc định sang mịn, giữ `?netmin=0` làm đường lui ít nhất 2 tuần.
- Bản một tệp (`dist/linh-khi.html`, trang công cụ) giữ pixel.

### 2.3 Độ phân giải: giữ 960 × 540, ảnh vẫn net 2

- **Toạ độ game giữ 480 × 270.** Không đổi chỗ nào.
- **Canvas thế giới giữ 960 × 540.** Lý do: số điểm vẽ mỗi khung hình không đổi, nên máy yếu không chậm thêm vì độ phân giải. Trên màn 1080p, ảnh net 2 được phóng khoảng 1,5–2 lần có nội suy, hơi mềm, hợp với kiểu tranh vẽ.
- **Ảnh mịn vẫn net 2.** Không lên net 3: ảnh nặng gấp 2,25 lần (vượt trần dung lượng, mục 3) và tốn RAM gấp 2,25 lần.
- **Ngoại lệ net 1,5 cho hình to** (trùm vùng, tinh anh, hiệu ứng TO): tranh mịn thu nhỏ không lộ răng cưa như pixel, nên dùng hệ số lẻ được. `docNet` trong `sprite_custom.js` hiện chỉ nhận số nguyên 1–4, phải cho phép số lẻ **chỉ khi ở chế độ mịn**.
- Mức "Rất cao" (canvas theo màn, tối đa gấp 3) để sau, chỉ cho máy khoẻ, nếu Bước 0 thấy cần.

### 2.4 Làm mịn (imageSmoothing)

- Viết một hàm chung `G.datMin(c)`: ở chế độ mịn bật `imageSmoothingEnabled = true` và `imageSmoothingQuality = 'medium'`; ở chế độ pixel giữ `false` như cũ. Thay 91 chỗ đang ghi thẳng `false` bằng lời gọi hàm này. Chế độ pixel không đổi một điểm ảnh nào.
- Bước phóng canvas thế giới lên màn (`engine.js` ~719) cũng theo cờ.
- Giữ `false` cho những thứ cần sắc: tấm đệm nền phòng lúc ghép ô (2.6), biểu tượng nhỏ hơn 12 điểm game nếu nhìn bị nhoè.

### 2.5 Làm tròn toạ độ và nội suy

- **Hình động** (Zed, quái, trùm, vũ khí, đạn, hiệu ứng): ở chế độ mịn **bỏ làm tròn** lúc vẽ, để hình trượt dưới 1 điểm ảnh, đỡ giật. Chỉ khoảng 10 chỗ vẽ, liệt kê khi làm (`sprite_custom.js` ~1042, `zed_moi.js`, `weapon_art.js`, `fx_dan.js`…).
- **Camera:** làm tròn tới 1/NET điểm game, tức đúng 1 điểm ảnh canvas, để nền phòng không rung hay nhoè khi màn trượt.
- **Thanh máu, khung, chữ, nút:** vẫn làm tròn cho nét.
- **Không đụng `Math.round` trong phần tính toán** (sát thương, vàng, kinh nghiệm…). Cả game có 988 chỗ, chỉ sửa chỗ vẽ.
- **Nội suy hiển thị (tuỳ chọn, cờ riêng `?noisuy=1`):** vòng lặp chạy bước cố định 1/60 giây. Trên máy 90/120 Hz hoặc khi rớt khung, hình nhảy cóc. Pixel che được lỗi này, tranh mịn thì lộ ra. Cách sửa: vẽ hình ở vị trí *giữa* hai bước tính. Chỉ ảnh hưởng chỗ vẽ, logic và va chạm không đổi. Làm sau Bước 0, nếu chủ game thấy giật.

### 2.6 Va chạm và số đo: giữ nguyên tuyệt đối

- Vùng va chạm của quái (`e.r`, `e.hr` trong `mobs.js`) và của Zed tính từ số liệu và cỡ khung **theo điểm game**, không theo điểm ảnh.
- Luật cứng: mỗi `.sprite.json` mịn **chép y hệt** các số `rong`, `cao`, `goc`, `khung_rong`, `khung_cao`, `neo`, `giay`, `lap`, `khung`, `cham`, `bong` từ bản pixel. Chỉ thay ảnh và `net`. Có bài kiểm tự động so hai bản, lệch một số là đỏ.
- **Hình vẽ phải cùng cỡ với hình cũ.** Nếu hình mịn to hơn, người chơi tưởng bị đánh trúng oan. Kiểm bằng ảnh chồng: viền hình cũ đè lên hình mới, mỗi động tác một ảnh.
- **Khung chạm đòn giữ đúng thời điểm.** Ví dụ búa chạm ở 43–53% động tác, Heo Rừng Con chạm ở cột 2 (u ≈ 0,2). Nếu tranh mới vẽ khác số khung thì phải sửa bảng `khung` / `cham` sao cho mốc chạm theo giây **không đổi**.

### 2.7 Những xử lý điểm ảnh hiện có phải sửa cho tranh mịn

| Xử lý | Vì sao hỏng với tranh mịn | Sửa |
|---|---|---|
| Nhuộm thân khi dính Độc/Cháy/Băng (`khungThan`, `naGiu`) | Dò đúng mã viền `#14182e` để giữ viền. Tranh mịn có viền nhiều sắc độ (mép mềm) | Dò theo độ tối, có dung sai, thay vì đúng một mã màu |
| Viền sáng khi trúng đòn, chớp báo ra đòn | Viền dựng theo alpha 0/255 | Dựng theo alpha mềm (ngưỡng ~50%) |
| Tách nền, thu nhỏ, giảm màu trong 7 trang công cụ | Mép răng cưa, màu bị ép | Chế độ "Mịn" (mục 4.3) |
| Dựng Zed bằng Python (`cat-diem-anh.py`, `dung-zed-game.py`) thu nhỏ bằng NEAREST | Răng cưa, mất nét | Dùng LANCZOS hoặc lọc diện tích khi ở chế độ mịn |
| Neo cầm vũ khí (`gan-vk/neo.json`, `cam-vk.py`) | Đo trên khung cũ | **Đo lại** cho từng hàng Zed mới (bán tự động, có ảnh soát) |
| Ghép nền phòng từ ô 64 × 64 | Khi làm mịn, nội suy lấy màu ô bên cạnh nên lộ đường kẻ mảnh giữa các ô | Tấm đệm phòng (`room_art.js`, nhớ 4 phòng) ghép ô ở toạ độ nguyên với làm mịn **tắt**, chỉ làm mịn khi vẽ cả tấm ra màn. Ô sàn vẽ liền mép (tileable) |

### 2.8 Vẽ bằng code trong chế độ mịn

- Hạt, tia, tàn lửa, bọt nước: thay ô vuông bằng chấm tròn có mép mềm. Phần phát sáng vẽ chế độ cộng sáng (`globalCompositeOperation = 'lighter'`).
- Bóng dưới chân: hình bầu dục mờ.
- Vòng báo đòn, vạch nứt: nét mảnh có bo đầu.
- Khoảng 30 hiệu ứng ảnh đơn giản (chớp, vòng, lấp lánh, sóng tròn) có thể vẽ bằng code mịn thay vì gen, bớt được 30 prompt và khoảng 0,5 MB. Phiên Đợt 1 lập danh sách, chủ game duyệt.
- Chế độ pixel: vẫn đi đường cũ (`A.p`).

### 2.9 Hiệu năng trên máy yếu

| Yếu tố | Ảnh hưởng | Đánh giá |
|---|---|---|
| Bật làm mịn khi vẽ ảnh có phóng to thu nhỏ | Máy có GPU: gần như không tốn thêm. Máy không GPU (Android rẻ, trình duyệt vẽ bằng CPU): thời gian vẽ ảnh tăng khoảng 10–30% | Trung bình |
| Canvas giữ 960 × 540 | Không đổi số điểm vẽ | Không |
| Ảnh WebP có mất mát | Giải mã nhanh như WebP không mất mát. Ảnh vẫn giải mã ngoài luồng chính (`img.decode`, đã có) | Không |
| RAM sau giải mã | Bằng cũ nếu giữ net 2. Net 1,5 cho trùm còn giảm RAM | Tốt hơn |
| Vẽ không làm tròn | Không tốn thêm | Không |
| Hạt vẽ hình tròn | Vẽ tròn chậm hơn ô vuông. Trần 400 hạt (đã có) là đủ an toàn | Thấp |

Cách đo: dùng sẵn `tests/perf.py` và `tests/au_hieunang.py`, chạy cả hai chế độ trên cùng phòng đông (14 quái + 16 đồ rơi).

- Ngưỡng đạt, máy khoẻ: số khung/giây giảm không quá 5%.
- Ngưỡng đạt, giả CPU chậm 4 lần: giảm không quá 15%.
- Không đạt thì máy yếu tự về "Độ nét: Thường" (canvas 480 × 270, vẫn mịn), hoặc tắt làm mịn ở hạt.

---

## 3. Dung lượng

### 3.1 Hiện tại

- Trần người chơi tải: **20 MB** (`TRAN_NGUOI_TAI` trong `build.py`). Hiện khoảng **15,6 MB**.
- Ảnh trong game (không tính `-cu`): **20,9 triệu điểm ảnh có hình** (không tính phần trong suốt). PNG nặng 17,3 MB, khi phát ra được mã hoá WebP không mất mát. Riêng quái là 11,3 MB PNG, trong đó **3 trùm vùng chiếm 7,1 MB**.

### 3.2 Đo thử (15/10, trên 4 ảnh gốc thật: Heo Rừng Con, Mộc Tinh, Zed, Cá Nóc Chúa, thu về cỡ game net 2)

| Cách lưu | Byte cho mỗi điểm ảnh có hình |
|---|---:|
| Pixel hiện tại (PNG của game) | ≈ 0,80 |
| Tranh mịn, WebP **không mất mát** | gấp 6–17 lần bản pixel. **Không dùng được** |
| Tranh mịn, WebP **có mất mát** chất lượng 80 | 0,79–0,93 |
| Tranh mịn, WebP **có mất mát** chất lượng 70 | 0,69–0,82 |

Kết luận: tranh mịn **bắt buộc dùng WebP có mất mát**. `build.py` hiện chỉ làm WebP không mất mát, cần thêm đường cho `art/min/`. Nếu chỉ làm vậy, bộ mịn nặng **bằng hoặc hơn bộ pixel khoảng 10–25%**. Ước tổng 17–20 MB, quá sát trần.

### 3.3 Cách giữ dưới trần (mục tiêu bộ mịn ≤ 17 MB, chừa 3 MB cho nội dung mới)

1. **WebP có mất mát chất lượng khoảng 75**, alpha chất lượng 80–85. Bước 0 so mắt q70 / q75 / q85 rồi chốt.
2. **Net 1,5 cho trùm vùng, tinh anh, hiệu ứng TO:** giảm khoảng 44% điểm ảnh của nhóm nặng nhất, ước bớt 2,5–3 MB.
3. **Bản hệ của hiệu ứng nhuộm bằng máy** (bớt 39 tệp). **Hiệu ứng đơn giản vẽ bằng code** (mục 2.8).
4. **Bỏ khung trùng** (đã có cơ chế bảng `khung`), **cắt sát khung**: hiện có khung trùm rộng 166 × 210 trong khi hình chỉ 177 × 119.
5. **Tải theo vùng** (đã có, `?taivung=0` để tắt): vào Rừng mới tải quái Rừng. Cách này không giảm tổng, nhưng giảm lượng tải lúc mở game.
6. **Ngân sách từng nhóm.** Phiên nào vượt thì tự giảm chất lượng hoặc dùng net lẻ trước khi nộp:

| Nhóm (bản mịn) | Ngân sách |
|---|---:|
| Zed 4 bộ + vũ khí | 1,4 MB |
| Mỗi vùng (12 con + nền + trang trí + hiệu ứng riêng vùng) | 2,8 MB × 3 = 8,4 MB |
| Hiệu ứng chung | 2,2 MB |
| Giao diện + làng + người làng + đồ rơi | 1,4 MB |
| Trang chính + bìa + truyện (giữ nguyên) | ≈ 3,0 MB |
| **Cộng** | **≈ 16,4 MB / trần 20 MB** |

Mỗi đợt báo "người chơi tải" trước/sau như các phiên quái mới đã làm. Máy chủ sẽ chứa cả hai bộ (thêm khoảng 15 MB). Con số này chỉ để thông tin, không tính vào trần người chơi.

---

## 4. Cách gen ảnh

### 4.1 Luật vẽ chung bản mịn (thay mục "5 luật" của `docs/LUAT-VE-CHUNG.md` khi ở chế độ mịn)

1. **Tỉ lệ theo Zed.** Giữ nguyên bảng cỡ chuẩn hiện có (Zed thân 16 × 29 điểm game, quái thường 29–63, trùm 140–177…). Hình mịn đứng cạnh hình cũ phải **cùng cỡ**.
2. **Viền:** một nét tối **`#14182e`** (giữ mã cũ, để code nhuộm dò viền dễ), dày đều, ở cỡ game khoảng 1 điểm. Không viền sáng quanh mép.
3. **Tô màu:** màu phẳng + đổ bóng mềm 2 lớp + 1 điểm sáng nhấn. Ánh sáng **trên bên trái**. Không vân giấy, không nhiễu hạt, không chuyển màu kiểu ảnh chụp.
4. **Màu:** bảng màu gần với bìa và truyện, độ tươi vừa phải. Không giới hạn số màu, nhưng giữ đúng các mã màu riêng đã ghi (màu hệ, màu nhấn của từng con).
5. **Ít chi tiết vụn:** ở cỡ thật trên màn 480 × 270, cái gì nhỏ hơn 2 điểm game thì bỏ. Tranh mịn rất dễ bị "quá chi tiết so với cỡ hình".
6. **Nghiệm thu ở cỡ thật**, cạnh Zed, trong một phòng thật (ảnh chụp từ game ở `?netmin=1`).

### 4.2 Quy cách prompt

- **Ngắn gọn**, một ý một câu. Khoảng 5–8 câu.
- **Luôn gửi kèm:**
  1. **Ảnh mẫu phong cách đã duyệt.** Sau Bước 0A là ảnh mẫu Zed mịn. Gửi kèm ở mọi prompt để mọi con cùng một nét.
  2. **Ảnh cũ của chính đối tượng đó**, để giữ thiết kế: dáng, màu, chi tiết.
  3. Khi vẽ động tác: **ảnh hàng cũ** (giữ số khung và tư thế) hoặc **khung xương** (Zed).
- **1 prompt = 1 hàng khung**, đọc trái sang phải, các hình không chạm nhau, không chạm mép.
- **Nền xanh lá thuần `#00FF00`.** Trên hình không dùng màu xanh lá, không quầng sáng màu nền dưới chân. **Ngoại lệ:** con có nhiều xanh lá (Mộc Tinh, Hoa Bào Tử, Nhím Độc, các hiệu ứng độc) dùng nền **hồng tím `#FF00FF`**, như `tach-quai` đang làm (cờ `nenXanh`).
- Không chữ, không số, không lưới, không bóng đổ dưới chân (game tự vẽ bóng).
- **Giữ thiết kế nhân vật cũ:** "giữ y hệt mặt, tóc, đồ, màu, tỉ lệ đầu/thân như ẢNH CŨ, chỉ đổi cách vẽ".
- **Dùng một công cụ tạo ảnh duy nhất cho cả đợt.** Đổi công cụ giữa chừng là lệch phong cách.

Khung mẫu (thay phần trong ngoặc nhọn):

```
{ĐỐI TƯỢNG} như ẢNH CŨ gửi kèm: giữ y hệt thiết kế (dáng, màu, chi tiết, tỉ lệ), chỉ đổi cách vẽ.
Vẽ theo phong cách của ẢNH MẪU PHONG CÁCH: tranh minh hoạ hoạt hình 2D vẽ tay, nét mịn, viền tối #14182e rõ và đều, màu phẳng, đổ bóng mềm, sáng từ trên bên trái. KHÔNG pixel art, không ô vuông, không nhiễu hạt.
{ĐỘNG TÁC / NỘI DUNG}.
1 hàng {N} khung đều nhau, trái sang phải, cùng cỡ ở mọi khung, chân chạm cùng một đường đất; các hình không chạm nhau, không chạm mép ảnh.
Nền trơn xanh lá thuần #00FF00 (không dùng xanh lá trên hình), không chữ, không lưới, không bóng dưới chân.
```

### 4.3 Có phải đổi công cụ tách `tools/tach-quai` (và 6 trang `tach-*` kia) không? **Có, nhưng là thêm chế độ, không viết lại.**

`tach-quai` đã có sẵn ô "Nét vẽ: Mịn" khi thu nhỏ và có xuất net 2. Còn thiếu:

| Phần | Hiện tại | Cần thêm ở "Kiểu ảnh: Mịn" |
|---|---|---|
| Xoá nền | Alpha cứng 0/255 (`fg ? 255 : 0`) | Alpha mềm theo khoảng cách tới màu nền, **khử ám xanh** ở mép (despill) |
| Giảm màu | Luôn ép 32/48 màu (`giamMau`) | Tắt |
| Viền ngoài | Tự thêm viền (`vienNgoai`) | Tắt (tranh đã có viền) |
| Thu nhỏ | Mịn / Sắc nét | Lọc chất lượng cao (Lanczos/diện tích) và hệ số net lẻ 1,5 |
| Tệp xuất | PNG trong `.sprite.json` | PNG (để `build.py` mã hoá WebP có mất mát), thêm `"kieu": "min"` |
| Câu phong cách trong prompt | `CAU_PHONG_CACH` (pixel) | `CAU_PHONG_CACH_MIN` theo mục 4.1 |
| Tìm khung, căn tâm, căn chân, xuất số đo | Giữ | Giữ (thêm nút "chép số đo từ tệp pixel cũ") |

Làm một tệp JS dùng chung (ví dụ `tools/chung/tach-min.js`) cho cả 7 trang, để không lệch nhau. Script Python cho Zed thêm tham số `--min`.

---

## 5. Lộ trình

Nhịp làm: mỗi đợt **khoảng 3 phiên Claude song song**. Chủ game gen ảnh theo danh sách của đợt, đặt vào thư mục nhận ảnh (`docs/anh-goc/min/<đợt>/`), rồi các phiên cắt, dựng, kiểm và báo cáo. Mỗi đợt kết thúc bằng một **tấm "cả nhà đứng cạnh nhau"**: mọi hình mịn đã có, cỡ thật, cạnh Zed, để soát lệch phong cách.

### Bước 0A: Xem phong cách bằng ảnh tĩnh (không đụng code game)

- **Chủ game gen 5 prompt "ảnh mẫu"** (mục 6.1): Zed, Heo Rừng Con, Nấm Chúa, nền phòng Rừng, bộ nút chiến đấu.
- **1 phiên** cắt ảnh rồi ghép một **ảnh cảnh giả** 960 × 540: phòng Rừng, Zed giữa phòng, 3 heo, Nấm Chúa, nút bên phải. Đặt **cạnh** ảnh chụp bản pixel cùng bố cục. Kèm ảnh phóng to ×2 trên điện thoại.
- **Chủ game chọn:** (a) đi tiếp; (b) chỉnh phong cách (đậm nhạt viền, độ tươi, độ "hoạt hình") rồi gen lại 5 ảnh mẫu; (c) dừng, giữ pixel.
- Tốn: 5 prompt, 1 phiên.

### Bước 0B: Chạy thật trong game bằng cờ `?netmin=1`

Ảnh cần gen: 26 prompt (mục 6.2). Ba phiên song song:

| Phiên | Việc | Xong khi |
|---|---|---|
| **A: Kỹ thuật game** | Cờ `?netmin=1`, `G.NET_MIN`, thư mục `art/min/`, dùng ảnh pixel khi thiếu ảnh mịn, `G.datMin`, bỏ làm tròn chỗ vẽ hình động, làm tròn camera, tấm đệm nền phòng, nhuộm thân dò viền có dung sai, `docNet` nhận số lẻ, `build.py` mã hoá WebP có mất mát cho `art/min/` và báo dung lượng hai bộ | Mặc định (pixel) **giống từng điểm ảnh** so với trước (ảnh chụp 10 cảnh trước/sau). `tests/balance.py`, `tests/perf.py`, `tests/au_hieunang.py` chạy cả hai chế độ. Mọi bài kiểm cũ xanh |
| **B: Công cụ** | Chế độ "Mịn" cho `tach-quai`, `tach-phong`, `tach-giao-dien` (dùng chung `tach-min.js`), `--min` cho script Zed, bài kiểm "số đo mịn = số đo pixel" | Cắt thử được 5 ảnh mẫu Bước 0A, mép không ám xanh |
| **C: Dựng ảnh Bước 0** | Nhận 26 tấm, cắt, dựng `.sprite.json` mịn (chép số đo cũ), đo lại neo vũ khí Zed cho các hàng kiếm, ảnh chồng viền cũ/mới, GIF từng động tác, quay video ngắn một trận ở phòng Rừng (pixel và mịn) | Báo cáo `docs/ke-hoach/khong-pixel/buoc-0/bao-cao.md` |

Phạm vi chơi thử của Bước 0B: Zed **cầm kiếm** (các vũ khí khác vẫn ảnh pixel), phòng Rừng, Heo Rừng Con, Nấm Chúa giữ hình pha 1 suốt trận (cờ có sẵn `?trumnho=0`), nút đánh, né, đặc biệt, tạm dừng.

Báo cáo Bước 0 phải có:

1. Ảnh và video so sánh.
2. Dung lượng thật (byte trên mỗi điểm ảnh ở q70/75/85).
3. Số khung/giây hai chế độ.
4. Danh sách chỗ "lộ pixel" còn lại.
5. Ước lượng lại tổng prompt và tổng MB.

**Chủ game quyết làm tiếp hay dừng.**

### Đợt 1: Zed và chiến đấu chung (người chơi nhìn thấy suốt)

| Phiên | Việc |
|---|---|
| A | Zed bộ Ninja: 16 hàng còn lại (giáo, búa, phi tiêu, chưởng, đặc biệt, đâm…) + 3 vũ khí còn lại; đo neo; ảnh soát cầm vũ khí |
| B | Hiệu ứng đòn của Zed: chém kiếm, quét giáo, nện búa, phi tiêu, chưởng, Trảm Nguyệt, trúng, chí mạng… (khoảng 35 hiệu ứng); bản hệ nhuộm bằng máy |
| C | Giao diện trong ải: nút còn lại, thanh máu/mana, khung trùm, ô, vòng báo trước, biểu tượng hệ, đồ rơi; cắt lại khung có ảnh gốc; vẽ hạt và bóng bằng code mịn |

Ảnh chủ game gen: khoảng 18 (Zed) + 3 (vũ khí) + 35 (hiệu ứng) + 10 (giao diện) ≈ **66 prompt**.

### Đợt 2: Vùng Rừng già (vùng người mới chơi gặp đầu tiên)

| Phiên | Việc |
|---|---|
| A | 7 quái thường còn lại + 2 tinh anh/chúa |
| B | Mộc Tinh 3 pha + Nấm Chúa pha 2 + hiệu ứng riêng của trùm Rừng |
| C | Nền phòng Rừng (tường, cửa, 18 món trang trí) + bộ đồ Rừng của Zed (28 prompt) |

Ảnh: khoảng 63 (quái) + 21 (trùm) + 8 (hiệu ứng) + 6 (nền) + 28 (bộ đồ) ≈ **126 prompt**.

### Đợt 3: Làng và giao diện ngoài ải

| Phiên | Việc |
|---|---|
| A | Nền làng + đình, lò rèn, cây đa, gánh hàng… |
| B | 7 người làng + 3 bạn |
| C | Bảng, thẻ, ô đồ, bản đồ vùng, thanh trên, biểu tượng còn lại, hiệu ứng ép đồ, lên cấp |

Ảnh: khoảng 5 + 30 + 15 ≈ **50 prompt**.

### Đợt 4: Hang biển và Đợt 5: Lâu đài cổ

Mỗi đợt làm y như Đợt 2:

- 8 quái thường + 2 tinh anh/chúa
- Trùm nhỏ 2 pha + trùm vùng 3 pha
- Nền, cửa, trang trí
- Bộ đồ vùng của Zed
- Hiệu ứng riêng vùng

Ảnh: khoảng **150 prompt mỗi đợt**.

### Đợt 6: Chốt

- Một phiên soát lệch phong cách toàn bộ: các tấm "cả nhà", danh sách con cần gen lại.
- Một phiên đo dung lượng, hiệu năng (máy thật Android tầm trung), bài kiểm "0 hình thiếu", "0 số đo lệch".
- Một phiên làm lựa chọn ở Anh Mõ, đổi mặc định, cập nhật `README.md` và `docs/LUAT-VE-CHUNG.md`.
- Giữ bản pixel ít nhất 2 tuần làm đường lui.

### Thứ tự gen ảnh (chủ game làm theo, trong mỗi đợt)

1. **Ảnh mẫu từng đối tượng trước** (1 tư thế đứng, to rõ). Phiên dựng xem ở cỡ thật rồi báo duyệt, sau đó mới gen hàng động tác. Ảnh mẫu lệch thì cả bộ hàng lệch.
2. Hàng động tác theo thứ tự: **đứng → đi → báo đòn → đánh → trúng đòn → chết**. Hàng đứng là hàng người chơi nhìn lâu nhất, nên làm trước để khoá dáng.
3. Trùm: **pha 1 xong hết mới làm pha 2, 3**, gửi kèm ảnh pha 1 mịn.
4. Nền: **sàn → tường → cửa → trang trí**.
5. Mỗi lần gửi kèm đúng 2–3 ảnh: ảnh mẫu phong cách, ảnh cũ của đối tượng, ảnh hàng cũ hoặc khung xương.

### Tổng khối lượng

Khoảng **580–610 prompt** (bảng 1.1), chia theo đợt khoảng 28 (Bước 0) + 66 + 126 + 50 + 150 + 150 ≈ 570; phần còn lại là biểu tượng, đồ rơi và hiệu ứng lẻ, rải vào các đợt. Nếu gen hỏng phải làm lại khoảng 25% (theo kinh nghiệm các đợt quái mới), tính thêm khoảng 150. Bước 0 rất nhỏ so với cả kế hoạch, nên **xem kỹ ở Bước 0 rồi hãy quyết**.

### Rủi ro và cách đỡ

| Rủi ro | Mức | Cách đỡ |
|---|---|---|
| **Lệch phong cách giữa các con** (con này dày nét, con kia mềm; khác độ tươi) | Cao | Một ảnh mẫu phong cách gửi kèm mọi prompt; một công cụ gen; duyệt ảnh mẫu từng con trước khi gen hàng; tấm "cả nhà" cuối mỗi đợt; một phiên chỉ soát lệch ở Đợt 6 |
| **Chuyển động kém mượt hơn pixel.** Tranh mịn chỉ 4–6 khung trông giật hơn pixel cùng số khung, vì mắt thấy rõ chỗ nhảy | Cao | Giữ số khung và thời lượng (không đổi cân bằng); vẽ không làm tròn + nội suy hiển thị; thêm nhún, nảy, nghiêng bằng code ở hàng đứng/đi (chỉ hình). Nếu cần thêm khung cho Zed đứng/đi thì giữ nguyên tổng giây và mốc chạm |
| **Khối lượng ảnh lớn** (≈ 600 prompt + làm lại) | Cao | Chia đợt theo vùng, có điểm dừng sau mỗi đợt; cắt lại ảnh gốc mịn chỗ được; hiệu ứng hệ nhuộm bằng máy; hiệu ứng đơn giản vẽ bằng code |
| **Vượt trần 20 MB** | Trung bình | WebP có mất mát, net 1,5 cho hình to, ngân sách từng nhóm, báo dung lượng mỗi đợt |
| **Nền xanh dính mép** (viền xanh lờ mờ quanh hình mịn) | Trung bình | Khử ám xanh ở công cụ; nền hồng tím cho con nhiều xanh lá; ảnh soát trên nền tối và nền sáng |
| **Hình to hơn hình cũ**, người chơi tưởng va chạm sai | Trung bình | Chép số đo cũ; ảnh chồng viền cũ/mới; bài kiểm tự động |
| **Neo vũ khí lệch tay** | Trung bình | Đo lại neo mỗi hàng Zed, ảnh soát cầm vũ khí |
| **Máy yếu chậm** | Thấp–TB | Giữ canvas 960 × 540; đo hai chế độ; máy yếu tự về "Độ nét: Thường" |
| **Lẫn pixel với mịn trong giai đoạn làm** | Thấp (chỉ khi bật cờ) | Mặc định vẫn pixel; bài kiểm "0 hình thiếu" trước khi chốt |
| **Hai bộ ảnh song song tốn công:** mỗi quái mới phải làm 2 bản | Trung bình | Trong thời gian chuyển, nội dung mới chỉ cần bản mịn (pixel dùng hình dự phòng bằng code); chốt sớm sau Đợt 2 nếu chủ game ưng |
| **Lệch cân bằng** | Thấp | Không đụng số; chạy `tests/balance.py` hai chế độ, kết quả phải giống hệt (bot không nhìn hình) |

---

## 6. Danh sách prompt cho Bước 0

Đường dẫn tính từ gốc repo. "ẢNH CŨ" = ảnh của chính đối tượng đó. "ẢNH MẪU PHONG CÁCH" = ảnh mịn đã duyệt, ở Bước 0A thì gửi kèm **một cảnh truyện** làm mẫu nét (`docs/anh-goc/truyen/b4-trao-vu-khi.png`).

Câu chốt dùng chung (gọi tắt **[CHỐT]**), dán vào cuối mỗi prompt:

> Nền trơn xanh lá thuần #00FF00 (không dùng màu xanh lá trên hình, không quầng sáng màu nền), không chữ, không số, không lưới, không bóng dưới chân. Các hình không chạm nhau, không chạm mép ảnh.

Câu phong cách dùng chung (gọi tắt **[PHONG CÁCH]**):

> Vẽ theo kiểu tranh minh hoạ hoạt hình 2D vẽ tay: nét mịn, viền tối #14182e rõ và đều, màu phẳng, đổ bóng mềm hai lớp, sáng từ trên bên trái, màu tươi vừa phải như ẢNH MẪU PHONG CÁCH. KHÔNG pixel art, không ô vuông, không răng cưa, không nhiễu hạt, không vân giấy.

### 6.1 Bước 0A: 5 ảnh mẫu

**P0-1. Zed, ảnh mẫu**
Gửi kèm: `docs/anh-goc/zed/moi/00-anh-mau.png` (ẢNH CŨ) + `docs/anh-goc/truyen/b4-trao-vu-khi.png` (ẢNH MẪU PHONG CÁCH)

```
Vẽ lại cậu bé Zed như ẢNH CŨ: giữ y hệt mặt, mắt đỏ, tóc đen bù xù, áo võ đen, đai đỏ, quấn tay, quần đen rộng, dép, tỉ lệ đầu/thân chibi. Chỉ đổi cách vẽ.
[PHONG CÁCH]
Đứng thế thủ, quay mặt sang PHẢI (nghiêng 3/4), hai tay nắm, tay không cầm gì. Một hình duy nhất, to rõ giữa ảnh.
[CHỐT]
```

**P0-2. Heo Rừng Con, ảnh mẫu**
Gửi kèm: `docs/anh-goc/quai-moi/heoCon-mau-moi.png` (ẢNH CŨ) + ảnh P0-1 đã duyệt (ẢNH MẪU PHONG CÁCH; nếu chưa có thì dùng `docs/anh-goc/truyen/b4-trao-vu-khi.png`)

```
Vẽ lại Heo Rừng Con như ẢNH CŨ: giữ y hệt dáng, lông nâu, mõm hồng, nanh trắng nhỏ, bờm lưng, vết sẹo. Chỉ đổi cách vẽ.
[PHONG CÁCH] Cùng nét vẽ, độ dày viền, độ tươi với nhân vật trong ẢNH MẪU PHONG CÁCH.
Đứng nhìn ngang, quay mặt sang PHẢI, bốn chân chạm đất. Một hình duy nhất, to rõ giữa ảnh.
[CHỐT]
```

**P0-3. Nấm Chúa (trùm nhỏ), ảnh mẫu pha 1**
Gửi kèm: `docs/anh-goc/trum-moi/nam-chua-p1.png` (ẢNH CŨ) + ảnh P0-1 (ẢNH MẪU PHONG CÁCH)

```
Vẽ lại trùm Nấm Chúa như ẢNH CŨ: giữ y hệt dáng, mũ nấm tím đốm, thân nâu, hai tay, màu và chi tiết. Chỉ đổi cách vẽ.
[PHONG CÁCH] Cùng nét vẽ với ẢNH MẪU PHONG CÁCH, khối lớn rõ ràng, ít chi tiết vụn.
Đứng chính diện hơi chếch sang PHẢI, chân chạm đất. Một hình duy nhất, to rõ giữa ảnh.
[CHỐT]
```

**P0-4. Nền phòng Rừng (sàn + tường)**
Gửi kèm: `docs/ke-hoach/khong-pixel/mau-cu/nen-rung-cu.png` (ẢNH CŨ: hàng tường trên, sàn 4 × 2 ô dưới, cắt từ game) + `docs/anh-goc/bia/bia-1-cay-da.png` (ẢNH MẪU PHONG CÁCH)

```
Vẽ lại nền một căn phòng trong rừng già cho game nhìn từ trên xuống, giữ bố cục và màu như ẢNH CŨ: dải tường trên là hàng thân cây to, tán lá rậm, bụi cây chân tường; sàn là cỏ rêu xanh thẫm, vài mảng đất nâu, lá rơi, sỏi nhỏ.
[PHONG CÁCH] Nền tối và trầm hơn nhân vật để nhân vật nổi lên, chi tiết thưa, không có vật cao che đường.
Một ảnh ngang tỉ lệ 2:1: nửa trên là dải tường liền một hàng; nửa dưới là MỘT ô sàn vuông lát liền mép (cạnh trái nối liền cạnh phải, cạnh trên nối liền cạnh dưới), không viền, không bóng tối ở mép.
Không chữ, không lưới, không nhân vật.
```

(Nền không cần nền xanh. Phiên dựng tự cắt ô sàn thành `san0`–`san2`, `san-nhan`, `ngoai` và cắt tường.)

**P0-5. Bộ nút chiến đấu**
Gửi kèm: `docs/ke-hoach/khong-pixel/mau-cu/nut-chien-dau-cu.png` (ẢNH CŨ: nút Đánh kiếm, Né, Đặc biệt kiếm, Tạm dừng) + `docs/anh-goc/giao-dien/gd-nut-chu-4-mau.png` (ẢNH MẪU PHONG CÁCH: viền đồng chạm mây)

```
Vẽ lại 4 nút tròn bấm trên điện thoại như ẢNH CŨ, giữ biểu tượng và màu từng nút: (1) Đánh: thanh kiếm; (2) Né: mũi tên lộn vòng; (3) Đặc biệt: kiếm và vầng trăng khuyết; (4) Tạm dừng: hai vạch đứng.
[PHONG CÁCH] Viền đồng chạm mây như ẢNH MẪU PHONG CÁCH, mặt nút tròn hơi lồi, biểu tượng trắng ngà to rõ giữa nút, nhìn rõ khi thu còn 48 điểm ảnh.
1 hàng 4 nút đều nhau, cùng cỡ, trái sang phải.
[CHỐT]
```

### 6.2 Bước 0B: động tác (gen sau khi 0A được duyệt)

Mọi prompt Zed gửi kèm: **ảnh P0-1 đã duyệt** (ẢNH MẪU PHONG CÁCH và cũng là ảnh nhân vật) + ảnh ghi ở từng dòng. Đầu prompt Zed luôn là:

> Nhân vật như ẢNH MẪU gửi kèm (giữ y hệt mặt, tóc, đồ, đai đỏ, màu, tỉ lệ đầu/thân, cùng nét vẽ). [PHONG CÁCH] Quay mặt PHẢI, cùng cỡ người ở mọi khung, chân trụ chạm cùng một đường đất. Tay KHÔNG cầm vũ khí (game tự vẽ vũ khí).

Sau đó là câu động tác (lấy nguyên văn từ tệp cũ ghi trong bảng, **bỏ câu "Pixel art chibi…"**), câu "1 hàng N khung đều nhau, đọc trái sang phải", rồi [CHỐT].

| Mã | Động tác | Số khung | Câu động tác lấy từ | Gửi kèm thêm |
|---|---|---:|---|---|
| Z-01 | Đứng thở (lặp) | 8 | `docs/anh-goc/zed/prompt-moi/01-dung.txt` | `docs/anh-goc/mau-tu-the/tu-the/01-dung.png` |
| Z-02 | Đi bộ (lặp) | 8 | `.../prompt-moi/02-di.txt` | `docs/anh-goc/mau-tu-the/mau-di-bo-v2.png` |
| Z-03 | Chạy (lặp) | 12 | `.../prompt-moi/03-chay.txt` (sửa "8 tư thế" thành 12 khung như hàng chạy hiện dùng) | `docs/anh-goc/mau-tu-the/mau-chay-v4.png` + `docs/anh-goc/zed/moi/03-chay-v4.png` (hàng cũ) |
| Z-04 | Lộn né | 6 | `.../prompt-moi/04-lon.txt` | `docs/anh-goc/mau-tu-the/tu-the/04-lon.png` |
| Z-05 | Trúng đòn | 4 | `.../prompt-moi/05-trung-don.txt` | `docs/anh-goc/mau-tu-the/tu-the/05-trung-don.png` |
| Z-06 | Ngã chết | 8 | `.../prompt-moi/06-chet.txt` | `docs/anh-goc/mau-tu-the/tu-the/06-chet.png` |
| Z-07 | Kiếm nhát 1 | 5 | `.../prompt-moi/08-kiem-1.txt` | `docs/anh-goc/zed/sua-tay/sua-08-k2.png` |
| Z-08 | Kiếm nhát 2 | 5 | `.../prompt-moi/09-kiem-2.txt` | `docs/anh-goc/zed/sua-tay/sua-08-k2.png` |
| Z-09 | Kiếm nhát 3 | 6 | `.../prompt-moi/10-kiem-3.txt` | `docs/anh-goc/mau-tu-the/tu-the/10-kiem-3.png` |
| Z-10 | Trảm Nguyệt (đặc biệt kiếm) | 6 | `.../prompt-moi/23-tram-nguyet.txt` | `docs/anh-goc/zed/sua-tay/sua-08-k2.png` |

**Z-11. Kiếm 4 cấp.** Gửi kèm: ảnh P0-1 + `docs/anh-goc/zed/moi/vk-kiem-moi.png` (ẢNH CŨ). Dùng nguyên văn `docs/anh-goc/zed/prompt-moi/vk-1-kiem.txt`, chỉ thay câu "Pixel art như ẢNH MẪU Zed, viền tối 1 nét" bằng [PHONG CÁCH].

**Heo Rừng Con:** mỗi prompt gửi kèm ảnh P0-2 đã duyệt + ảnh hàng cũ cùng động tác. Đầu prompt:

> Heo Rừng Con như ẢNH MẪU gửi kèm (giữ y hệt thiết kế, màu, cùng nét vẽ). [PHONG CÁCH] Nhìn ngang, quay mặt PHẢI, cùng cỡ ở mọi khung, bốn chân chạm cùng một đường đất. Làm đúng tư thế từng khung như ẢNH HÀNG CŨ.

| Mã | Động tác | Khung | Câu động tác | ẢNH HÀNG CŨ |
|---|---|---:|---|---|
| H-1 | Đứng (lặp) | 6 | Đứng thở, bụng phập phồng nhẹ, tai và đuôi ve vẩy; khung 6 nối khung 1. | `docs/anh-goc/quai-moi/dong-tac/heoCon-1-dung.png` |
| H-2 | Đi (lặp) | 6 | Lon ton chạy chậm, bốn chân bước chéo, đầu nhấp nhô; khung 6 nối khung 1. | `.../heoCon-2-di.png` |
| H-3 | Báo đòn | 6 | Hạ thấp đầu, chân sau cào đất, lùi nhẹ lấy đà, bờm dựng lên. | `.../heoCon-3-bao-don.png` |
| H-4 | Đánh (húc) | 6 | Khung 1 bật lao tới, khung 2 húc mạnh nhất, nanh chĩa trước; 3–6 trượt chậm lại và về thế đứng. | `.../heoCon-4-danh.png` |
| H-5 | Trúng đòn | 4 | Giật lùi, nhắm mắt, người co lại; về thế đứng. | `.../heoCon-5-trung-don.png` |
| H-6 | Chết | 6 | Loạng choạng, ngã nghiêng, nằm im (khung 5–6 giống nhau). | `.../heoCon-6-chet.png` |

**Nấm Chúa pha 1:** mỗi prompt gửi kèm ảnh P0-3 đã duyệt + `docs/anh-goc/trum-moi/nam-chua-p1.png`. Đầu prompt:

> Trùm Nấm Chúa như ẢNH MẪU gửi kèm (giữ y hệt thiết kế, màu, cùng nét vẽ). [PHONG CÁCH] Chính diện hơi chếch PHẢI, cùng cỡ ở mọi khung, chân chạm cùng một đường đất.

| Mã | Động tác | Khung | Câu động tác |
|---|---|---:|---|
| N-1 | Đứng (lặp) | 6 | Đứng thở, mũ nấm phập phồng nhẹ, hai tay đung đưa, bào tử nhỏ bay lên quanh mũ; khung 6 nối khung 1. |
| N-2 | Đi (lặp) | 6 | Lạch bạch bước tới, thân lắc trái phải, mũ nấm nhún theo bước. |
| N-3 | Báo đòn | 8 | Ngửa mũ ra sau, hai tay giơ cao, mũ phồng to dần, đốm trên mũ sáng lên (khung 8 phồng nhất). |
| N-4 | Đánh (phun bào tử) | 4 | Gập mũ về trước, phun mạnh một luồng bào tử tím ra phía trước; về thế đứng. |
| N-5 | Trúng đòn | 4 | Mũ bẹp xuống, người co lại, nhăn mặt; về thế đứng. |
| N-6 | Chết | 6 | Mũ xẹp dần, thân khuỵu, đổ xuống thành đống nấm, mờ đi (khung 5–6 nằm im). |

Phiên dựng **phải đối chiếu số khung ở cột "Khung" với bảng `dong_tac` trong `.sprite.json` cũ** trước khi gen. Ví dụ Nấm Chúa: đứng 6, đi 6, báo đòn 8, đánh 4, trúng 4, chết 6. Nếu tranh ra khác số khung, sửa bảng `khung` / `cham` để giữ mốc chạm theo giây.

**Cộng Bước 0:** 5 (0A) + 11 (Zed) + 6 (Heo) + 6 (Nấm Chúa) = **28 prompt**. Nền và nút đã xong ở 0A. Dự phòng gen lại khoảng 7, tức khoảng **35 lần gen**.

---

## Phụ lục: số liệu gốc dùng trong kế hoạch

- Đếm tệp, khung: đọc `game/art/custom/*.sprite.json` (trường `doi_tuong`, `dong_tac`, `so`, `net`, `rong`, `cao`, `khung_rong`, `khung_cao`), 15/10/2026, nhánh `khoi-tao-du-an` (commit `ebcd0c4b`).
- Điểm ảnh có hình theo nhóm (triệu điểm): quái 14,8 · hiệu ứng 3,19 · giao diện 1,63 · Zed 1,01 · người làng 0,19 · em bé 0,04 · đồ rơi 0,01.
- Đo WebP: Pillow, method 6, alpha_quality 85; ảnh gốc xoá nền xanh, thu về cỡ game net 2 bằng LANCZOS.
- Ảnh tham chiếu mới tạo cho kế hoạch: `docs/ke-hoach/khong-pixel/mau-cu/nen-rung-cu.png`, `nut-chien-dau-cu.png` (xuất từ ảnh trong game, phóng NEAREST, không sửa).
