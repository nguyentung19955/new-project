# Trang thử Âm Đao cấp 1–4 (trên P0-A) – 27/10/2026, theo phản hồi 6

Viết cho người không rành kỹ thuật. Làm theo `docs/gameplay/PHAN-HOI-6-BO-BAN-3-VA-AM-DAO.md`, `KE-HOACH-VU-KHI.md` mục 2d, 3, 4b, 5, 7a, 8, 10,
`KE-HOACH-GAMEPLAY-V2.md` mục 3, 5, 6. **Trang con riêng** `am-dao.html`; bản P0-A gốc `index.html` **giữ nguyên** để so.
**Không sửa** `game/demo.html`, `build-demo.py`, `game/thu-bo-vo-moc/`, ảnh nguồn, rig. Không publish. Chưa ghép vào game chính.

## Link chơi thử

| Link | Dùng để |
|---|---|
| https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-p0a/am-dao.html | **Người chơi thử trên iPhone** (log + hộp đòn TẮT). Vào cấp 1. Đổi cấp: ⚙ → nút **"Âm Đao cấp N – bấm để đổi"** (1→2→3→4→1) |
| …/am-dao.html?cap=3 | Vào thẳng cấp 3 (cấp 1–4) |
| …/am-dao.html?debug=input&hitbox=1 | Log (lần bấm, giữ Chém, kỹ năng, vết, trúng) + lớp hộp đòn (đỏ = đang gây sát thương; cam đứt = vết Dư Âm đang chờ vang) |
| …/am-dao.html?cg=36 | **Biến thể thử** (KHVK 4b): Chuông Gỗ máu 36 thay 40 – chỉ dùng nếu người thử không nhận ra cấp 2. Mặc định TẮT |
| https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-p0a/index.html | Bản **P0-A gốc** (dao placeholder) để so |

Điều khiển: chạm **Chém** = đánh thường (luôn ra ngay). **Giữ Chém ≥ 20 tick (⅓ giây)** ở cấp 3–4 = **Dư Âm**. Phòng A hình nộm → B hai Chuông Gỗ → C quái gác (giống P0-A).

## 0. Bước 0 – kiểm trước khi làm (kết quả)

Chạy trong Chromium headless, đọc trạng thái từng bước. **Không có gì hỏng → không phải sửa P0-A / Bọ.**

| Kiểm | Cách | Kết quả |
|---|---|---|
| Quái thường không tự hồi vỏ | P0-A: đặt quái gác Thế 10, chém 1 nhát → vỡ; chờ 900 tick không đánh | Thế giữ **0**, trạng thái `matVo` (mất vỏ) suốt; nhát sau **−10 máu** (30 → 20) |
| Bọ không tự hồi mai | Trang Bọ: chém mai 1 lần (mai 4 → 3), rồi để yên 700 tick | Mai vẫn **3** (`maiHoi: false`) |
| Bọ mai vỡ vẫn đánh được sau khi dậy | Trang Bọ, bot đánh mai: vỡ ở bước 367, choáng, **dậy bước 546 – mai vẫn 0** → `bao` 596 → `huc` 626; lần 2 đặt Lam đứng trước | Húc **trúng Lam** (Lam mất máu bước 629). Không sửa gì ở `thu-bo-vo-moc/` |
| Startup 7 tick còn tư thế lấy đà, hình khớp hộp | Bảng từng tick nhát 1 (P0-A) | tick 1–2 `chuanbi`, 3–5 `giuong`, 6 `vung`, **7 `trung` + hộp bật + vệt khung 0** cùng tick; hộp 7–14. Trang Âm Đao giữ **đúng bảng này** (đo lại: `video-am-dao/5-bang-tick-am-nhan.json`) |
| Buffer, mã đòn replay, Cộng hưởng | Chạy lại các ca của P0-A **trên trang Âm Đao cấp 1** (video `4-debug…`) | Hộp bóng 8 tick → trúng **1** lần; cùng tick Thế 10 → **+10**; Lam trước 5 tick → bóng **2 + 10 = 12**; đã mất vỏ → **22**. Mọi lần bấm có kết cục (thiếu **0** ở mọi cảnh); chạm → hộp **7 tick** |

## 1. Đã làm gì

- **Trang `am-dao.html`** sinh bằng `cong-cu/tao-am-dao.py` từ `index.html` (P0-A) + khối `cong-cu/khoi-am-dao.js`. Dao placeholder được thay bằng Âm Đao **qua bảng `VK` / `CAP_VK` / `DON`** sẵn có (`VK.amDao`, `CAP_VK.amDao`, `PL_CS` = `pl.cs`). Luôn dùng nhịp P0-A mới (su 7/7/9, hàng chờ 1 nhát).
- **Ảnh** (`cong-cu/tao-asset-am-dao.py` → `am-dao/`):
  - `am-dao-cap1.png`: kiếm âm thoa **cắt từ `vu-khi-mau.png`**, nền trắng tách sạch (lấp từ mép, khe giữa hai nhánh trong suốt, khử viền trắng).
  - Lam rig-v4 **dựng lại sheet hành động + sheet chạy** bằng đúng code của `art/modular/lam-moi/` (tư thế, bảng tick y nguyên), **chỉ thay mảnh tay trước**: lưỡi âm thoa thay dao, kẻ viền tối cho hợp nét rig. Ghi riêng vào `am-dao/`, **không ghi đè** sheet gốc (đã kiểm `git status`: `art/` không đổi).
  - `vet-du-am-2x.png`: 5 khung VFX Dư Âm từ `vet-du-am.png`, **giữ nền đen, vẽ cộng sáng** (`lighter`).
- **Âm nhận** (cấp 1): vẽ bằng code nối từ mũi lưỡi theo hướng lưỡi **tới đúng mép hộp đòn** (tia từ mũi cắt cạnh hộp), vạch đồng + chấm sáng ở mép, 2 cung sóng. **Chỉ vẽ ở các tick hộp bật**, vẽ **sau** vệt chém (không bị vệt che). Chí mạng: vàng, dày hơn. Bóng: âm nhận teal mờ theo đúng hộp bóng.
- **Giữ Chém → Dư Âm** (cấp 3+, phương án THỬ – KHVK 7a): đủ 3 trường hợp nhả + xoá + tự tung, log từng lần (mục 3).
- **Chém vang** = đòn `ATK[7]` (chưa có clip mới: dùng tư thế nhát 3 – KHVK mục 10). **Vết**: đặt **một vết theo mỗi lần dùng**, ngay lúc hộp chém vang bật (trúng hay hụt), vang sau 24 tick. Cấp 4: vết mạnh hơn (số, hình nổ to hơn, tiếng trầm hơn, rung hơn).
- **Công thức** dùng chung của P0-A (gom theo tick, chặn theo Thế đầu tick, Cộng hưởng theo mục tiêu…). Vết là `D` riêng `src 'k'`, cờ `co = {ch:false, duChan:true, hieuUng:false, kichDau:false}`.
- **Chí mạng 5 % ×1,5** gieo **một lần lúc tạo đòn** bằng bộ sinh có hạt giống (mulberry32, đặt lại khi vào phòng) – cùng chuỗi vung ở mọi cấp cho cùng chuỗi chí mạng (so công bằng). Chỉ nhân máu.
- **Chỉ số chốt lúc tạo đòn gốc**: `D.goc` chép từ `pl.cs`; vết chép số lúc **tung kỹ năng**; bóng giữ số đã ghi. Đổi cấp giữa chừng không sửa đòn / vết / bóng đã có (video 4, ca cuối).
- **HUD**: dưới máu có "Âm Đao · cấp N" + vòng hồi Dư Âm (cấp 3+). Hình nộm thêm dòng **"tổng 10 giây"**. Trên đầu Lam: vòng nạp khi giữ; khi đã nạp: ánh dọc lưỡi (không nối dài – không phải hộp đòn). Nút Chém trên màn có viền: đang giữ / đã nạp / chờ tung.
- **Nút debug đổi cấp** trong ⚙ (thay nút "Nhịp đánh" ở trang này). Không có menu nâng cấp, save, vật liệu, Vọng Chiến, tinh anh, quái mới, cấp 5–8, 3 vũ khí kia.

## 2. Thông số (sửa ở đầu `cong-cu/khoi-am-dao.js`, chạy lại `tao-am-dao.py`)

| Số | Giá trị | Ghi chú |
|---|---|---|
| Đánh thường | bộ `ATK[1..6]`, su 7/7/9 (P0-A); [máu, Thế] nhát 1, 2, hất, trên không, nảy [10,10], nhát 3 [10,30] | Không đổi nhịp theo cấp |
| Hộp nhát 1 | mép trước **95 → 90** (`[4,−97,86,48]`) | Theo KHVK 2d. Hộp đòn 2–6 giữ như cũ |
| Lưỡi âm thoa | chắn → mũi **150 px rig ≈ 15,7 px logic** (dao cũ 23) | Ngắn hơn dao cũ để **âm nhận lấp phần còn lại tới mép hộp** |
| Âm nhận (đo) | nhát 1: **7,6–10,2 px**; nhát 2: 13–15; nhát 3: 10–11; hất: 24–26 (lên); trên không: 12,5–18; chém vang: 10–14 | Mép âm nhận nằm **trên cạnh hộp** ở 100 % số tick đo; chỉ ở tick hộp bật (`do-so.json → am_nhan`) |
| Cấp 2 | máu đánh thường ×1,2 (10 → **12**) | Thế không đổi |
| Dư Âm (cấp 3) | giữ **20 tick**; chém vang su 6 / ac 8 / re 14, hitstop 5, **[15,20]**, hộp `[−13,−66,103,66]` (mép trước 90); hồi **150 tick**; tụ tối đa 60 tick rồi tự tung | Hộp chém vang **khác bản kế hoạch** `[0,−100,96,56]` vì kế hoạch dùng hình nhát 3 (quét thấp) – hộp cao không khớp hình. Xem câu hỏi 3 |
| Vết | vang sau **24 tick**, hộp = đúng hộp chém vang, bật **4 tick**, mỗi mục tiêu trúng 1 lần; cấp 3 **[10,10]** hitstop 2; cấp 4 **[16,20]** hitstop 3, nổ to ×1,35 | Không chí mạng, không Cộng hưởng, không sinh vết, tối đa 2 vết trên màn |
| Chí mạng | 5 %, ×1,5 máu, gieo lúc tạo đòn | Đo 400 nhát: **24 chí mạng (6 %)**, chạy lại cùng hạt → **cùng chuỗi** |

## 3. Luật đã làm (log `?debug=input`)

| Lúc nhả nút | Kết quả | Log |
|---|---|---|
| Trước ngưỡng 20 tick | Chỉ là nhát thường (nhát 1 đã ra ngay lúc chạm) | `giu #n: nha-som (giữ N tick …)` – kèm lý do "cấp 1/2 chưa có Dư Âm" / "Dư Âm đang hồi" |
| Sau ngưỡng, đòn thường **chưa xong** | Kỹ năng vào **hàng chờ 1 chỗ** (thay nhát combo đang chờ nếu có), tung ở tick đầu tiên đòn hết `re`; hạn = hết đòn + 6 | `DA NAP` → `xep-hang (… tung sau tối đa N tick)` → `TUNG (xep-hang …, chờ N tick)` |
| Sau ngưỡng, đòn đã xong (thế tụ) | Tung **ngay tick nhả** | `vào thế tụ` → `TUNG (nhả trong thế tụ → tung ngay)` |
| Giữ quá 60 tick ở thế tụ | Tự tung (không kẹt) | `TUNG (tu-tung …)` |
| Lướt / bị đánh / đổi phòng / rơi khỏi đất / chạm Chém mới khi đang chờ | **Xoá**, **không mất hồi chiêu** (chưa tung) | `xoa:luot` / `xoa:bi-danh` / `xoa:bi-thay (chạm mới)` … |

- Nhả nút trước khi đòn thường kết thúc **không mất lệnh và không tung muộn**: xa nhất là hết đòn đang chạy (đo: chờ 3–4 tick), hạn +6 tick rồi bỏ có log.
- Giữ đếm theo **thời gian thật của ngón tay** (cả lúc game khựng khi trúng), để "giữ 20" không dài ra khi đang chém trúng. Bấm dồn không bao giờ ra kỹ năng.
- Thế tụ: Lam đứng yên (nhảy được – rời đất thì huỷ; lướt huỷ).
- Lướt huỷ chém vang **trước** khi hộp bật → không có vết (không có hộp thì không có vết), hồi chiêu vẫn tính vì đã tung (log riêng). Xem câu hỏi 4.

## 4. Ba câu prototype

### 4a. KIỂM BẰNG CODE (Chromium headless, bàn phím giả lập, mỗi hình video = 1 bước logic)

| Câu | Số đo | Ở đâu |
|---|---|---|
| 1. Đánh thường nhạy hơn? | Chạm → hộp **7 tick ở cả 4 cấp**, cả khi chạm 1 tick lẫn khi **giữ 30 tick** (20 lần mỗi kiểu) – tính năng giữ **không làm chậm** nhát đầu. Mọi lần bấm có đúng 1 kết cục (thiếu 0). P0-A cũ (su 11): 11 tick | `do-so.json` `cham_hop_cap1..4`, log video 2 |
| 2. Dư Âm dễ chủ động dùng? (phần đo được) | Đủ 3 trường hợp nhả + xoá + tự tung đều ra đúng log (video 2). Bot "bẫy" dùng được: chém **hụt**, lướt lùi, Chuông Gỗ đi vào vết → vết trúng (cấp 3: 10, cấp 4: 16) | video 1 (phần 4), video 2 |
| 3. Mở / nâng skill khác biệt? (phần đo được, cùng bot cùng phòng) | Bảng 4c | video 1, `ket-qua.json → sach` |
| Vết theo lần dùng | 10 lần dùng (4 trúng 1 con, **1 trúng 2 con**, 5 hụt) → **đúng 10 vết**; 10 nhát thường sau đó → **0 vết** | video 3 |
| Chống proc | Bóng phát lại chém vang: gây [3,10] (= [15,20]×0,25/0,5), **không sinh vết**. Vết vang **cùng tick** bóng chém: gom 2 lần trúng, **không Cộng hưởng**. Vết vào quái gác còn vỏ: **máu 0** (không thành 1), Thế −20 | video 4 |
| Hình khớp hộp | Debug chậm ¼: âm nhận chỉ hiện ở tick hộp bật, **lệch 0 tick** (đếm: 0 tick lệch); mép âm nhận trên cạnh hộp ở 100 % tick | video 5, `5-bang-tick-am-nhan.json` |
| Lỗi trang | 0 ở mọi cảnh | `ket-qua.json` |

### 4b. CẦN THỬ IPHONE (chưa làm – KHÔNG đánh dấu đạt thay người chơi)

| Câu | Cần gì |
|---|---|
| 1. Nhạy hơn? | 3 người, so `index.html?p0=0` (nhịp cũ) với `am-dao.html` cấp 1, đổi thứ tự; ≥ 2 thấy bản mới nhạy hơn, không ai thấy ra đòn ngoài ý muốn. Độ trễ cảm ứng Safari chưa đo |
| 2. Dư Âm dễ dùng trên cảm ứng? | Bật `?debug=input` **sau** buổi thử để đọc dòng thống kê "giữ / nhả sớm / nạp / xếp hàng / tung ngay / xoá"; đạt khi ra nhầm < 3 % số lần giữ, muốn mà không ra < 10 %, người thử tự đặt bẫy được ≥ 1 lần sau 5 phút. **Chưa biết** một lần chạm thường trên iPhone dài bao nhiêu tick (giả định < 12) |
| 3. Khác biệt nhìn thấy / cảm thấy? | Người thử **không xem số** nói được cấp 3 khác cấp 1 ở đâu, cấp 4 khác cấp 3 ở đâu. Cấp 2 được phép khó nhận ra – ghi lại, không tính trượt |
| Âm nhận | Trên màn iPhone thật (nhỏ hơn màn máy tính) âm nhận 8–10 px ở nhát 1 có **đủ thấy** không; tầm 90 có "thấy trúng mới trúng" không |
| Kiếm âm thoa | Lưỡi ngắn hơn dao cũ – nhìn có bị "dao găm" không; nét vẽ tranh (vu-khi-mau) cạnh nét rig dày có lệch không |

### 4c. Cùng phòng, cùng đối thủ, cùng bot (video 1, số đo – không phải cảm nhận)

| Cảnh | Cấp 1 | Cấp 2 | Cấp 3 | Cấp 4 |
|---|---|---|---|---|
| Hình nộm: combo + giữ Chém 30 + combo (tổng máu) | 70 | **84** | **109** | **115** |
| Chuông Gỗ [40]: tick tới khi chết | 161 | 161 (**không đổi**, vẫn 4 nhát) | **105** | **71** |
| Quái gác [30, vỏ 60]: tick tới khi chết | 201 | 201 (**không đổi**) | **171** | **155** |
| Bẫy (chém hụt, địch đi vào) | không có gì | không có gì | vết trúng **10** | vết trúng **16** |

Kết luận trung thực (từ số đo, chưa phải cảm nhận): **cấp 3** đổi hẳn cách đánh (có thêm hành động, Chuông Gỗ chết nhanh hơn ~⅓); **cấp 4** thấy ở số và vụ nổ to hơn (Chuông Gỗ còn ~44 % thời gian so với cấp 1). **Cấp 2 với quái thường không đổi số nhát giết** (đúng như bảng 4b kế hoạch) – chỉ thấy số trúng 12 thay 10 và thanh máu tụt nhanh hơn. Biến thể `?cg=36` để thử nếu người chơi không nhận ra (câu hỏi 1).

## 5. Video (`video-am-dao/`, 60 hình/s, H.264 `-preset veryfast`)

| File | Nội dung |
|---|---|
| `1-sach-cap-1-2-3-4.mp4` | **VIDEO SẠCH** (không log, không hộp đòn), 4 ô cấp 1 | 2 / 3 | 4 chạy cùng lúc, cùng bot: hình nộm → Chuông Gỗ → quái gác → **bẫy Dư Âm** (chém hụt, lướt lùi, Chuông Gỗ đi vào vết). Log từng ô: `-log-cap1..4.txt` |
| `2-debug-giu-nha.mp4` | Giữ / nhả ở nhiều thời điểm: chạm 1 tick, giữ 15, 21, 22 (xếp hàng), 40 (tụ → tung ngay), 100 (tự tung), lướt huỷ, đang hồi, chạm mới thắng, bị đánh huỷ, cấp 1/2 không có, cấp 4 |
| `3-debug-vet-du-am.mp4` | 10 lần dùng → 10 vết (1 lần trúng 2 con), rồi 10 nhát thường → 0 vết |
| `4-debug-chong-proc-cong-huong.mp4` | Bóng phát lại chém vang không sinh vết; vết vang cùng tick bóng → không Cộng hưởng; vết vào vỏ = 0 máu; 4 ca Cộng hưởng của P0-A chạy lại ở Âm Đao cấp 1; đổi cấp khi bóng còn (bóng 2, Lam 12, thêm 12 = 26) |
| `5-debug-cham-am-nhan-hop-don.mp4` | Debug chậm ¼: combo 1-2-3 + Dư Âm + vết vang; dòng dưới ghi tick · hộp · mép âm nhận · vết |
| `do-so.json`, `ket-qua.json`, `5-bang-tick-am-nhan.json` | Số đo ở mục 4 |

Quay lại: `python3 -B game/thu-p0a/cong-cu/quay-am-dao.py [sach giu vet proc cham do]`. Dựng lại: `tao-asset-am-dao.py` (≈ 80 s) → `tao-am-dao.py`. Chỉ là quay + ghi số, không phải bộ kiểm thử tự động.

## 6. Câu hỏi cần chủ dự án quyết

1. **Cấp 2** không đổi số nhát giết Chuông Gỗ / quái gác (12 × 3 = 36 < 40). Giữ như kế hoạch ("cấp nền"), hay bật biến thể **Chuông Gỗ 36** (`?cg=36`: cấp 2 giết trong 1 combo) cho buổi thử?
2. **Lưỡi âm thoa ngắn hơn dao cũ** (15,7 so với 23 px) để phần âm nhận lấp tới mép hộp 90. Nhát 1 âm nhận chỉ 8–10 px. Chấp nhận, hay kéo dài lưỡi và **dời mép hộp ra ~95–100** (tầm lớn hơn 90)?
3. **Hộp chém vang** đổi thành `[−13,−66,103,66]` (thấp, theo hình nhát 3) thay `[0,−100,96,56]` của kế hoạch – vì chưa có clip chém vang riêng. Đồng ý tạm thời tới khi có clip?
4. **Lướt huỷ chém vang trước khi hộp bật**: không có vết nhưng **vẫn mất hồi chiêu** (đã tung). Giữ, hay hoàn hồi chiêu khi huỷ trước hộp?
5. Vết đặt **đúng hộp chém vang**, nên một phần vết nằm chỗ Lam đứng (hộp bắt đầu sau lưng 13 px). Giữ, hay chỉ lấy phần trước mặt?

## 7. Chưa làm / cần biết

- Chưa thử trên iPhone (mục 4b). Mọi số là Chromium headless.
- Chưa có clip tụ / chém vang riêng (dùng khung nhát 1 giữ yên + tư thế nhát 3, đúng KHVK mục 10). Âm thanh là tiếng tổng hợp có sẵn (`bell`), chưa có âm "vang" riêng; video không có tiếng.
- Đòn nảy (`ATK[4]`) chưa đo âm nhận. Kỹ năng chỉ dùng trên đất (KHVK 2a).
- Công cụ quay có dời vị trí quái để dựng cảnh (dời Chuông Gỗ cho cảnh bẫy và cảnh đánh; quái gác cạnh hình nộm cho ca "trúng 2 con"; đặt lại hồi chiêu giữa các lần thử) – ghi trong log mỗi cảnh, không phải luật game.
