# Trang thử P0-B – hai cách gọi bóng: A ghi chủ động / B Vọng Chiến (28/10/2026, sửa theo phản hồi 9)

Viết cho người không rành kỹ thuật. Làm theo `docs/gameplay/PHAN-HOI-7-AM-DAO-BO-P0B.md` (mục 4 + "P0-B"), `KE-HOACH-GAMEPLAY-V2.md` mục 4, 4a, 6, 7,
`PHAN-HOI-1` mục 2 (không chạm đúp), `PHAN-HOI-3` mục 5, và **`PHAN-HOI-9-P0B.md`** (mục 1, 2, 3 và "5. GỬI CLAUDE" điểm 1–8).
**Trang riêng**, chưa ghép game chính. **Không sửa** `game/thu-p0a/`, `game/thu-bo-vo-moc/`, `game/thu-phong-b/`, `game/demo.html`, `build-demo.py`, `docs/gameplay/`.
Không publish. Không có bộ kiểm thử tự động – chỉ công cụ quay + ghi số.

> **Mọi số dưới đây đo trong Chromium headless trên máy chủ, do bot bấm.** Chưa ai chơi trên iPhone. **Không kết luận điều khiển / trải nghiệm đạt từ Chromium.**
> Chưa chọn A hay B (PH9). Số bot chỉ là kiểm chức năng / kịch bản.

## Link chơi thử

| Link | Dùng để |
|---|---|
| https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-p0b/index.html | **Người chơi thử trên iPhone.** Màn bắt đầu có 2 nút **A – Ghi chủ động** / **B – Vọng Chiến** và hướng dẫn riêng từng cách. Log nền LUÔN thu; hộp đòn TẮT |
| …/index.html?vong=a · …?vong=b | Vào thẳng A / B (lượt chính: cả hai **miễn phí**, bóng xong đứng **nghỉ**) |
| …/index.html?vong=b2 | **B2 – biến thể, TẮT mặc định**: phát từ lúc bắt đầu nhát chém gần nhất (chỉ thử SAU A và B gốc) |
| …/index.html?vong=b&nac=1 | **Lượt tài nguyên**: B tốn nấc – 2 nấc, hồi 1 nấc / 150 tick mô phỏng |
| …/index.html?vong=b&nac=1&suc=1 | Lượt tài nguyên – **1 nấc** / 150 tick (chuẩn bị thử sau, TẮT mặc định; chỉ đổi sức chứa) |
| …&tan=1 | Biến thể bóng **tan** khi phát xong (TẮT mặc định, áp cho cả A và B; thử riêng, sau khi so cách gọi) |
| …/index.html?vong=a&debug=vong&hitbox=1 | Bảng log Vọng trên màn + lớp hộp đòn (teal = hộp bóng). **Không cần** để đọc log – log nền đã thu sẵn |

Trong game, ⚙ (tạm dừng, không che lúc chơi):
- **"Xuất log lượt này (JSON + tóm tắt)"** – tóm tắt hiện ở đầu bảng ⚙; file JSON tải về / chia sẻ (iPhone: bảng Chia sẻ → Lưu vào Tệp / AirDrop). Màn kết thúc cũng có nút này.
- **"Chơi lại từ đầu"** – đặt lại máu, quái, lịch sử, nấc như nhau (dùng khi bắt đầu mỗi lượt).
- **"Vọng: A/B – đổi"** – lưu log lượt này vào máy rồi tải lại trang với cấu hình kia; lần xuất log sau sẽ **kèm lượt trước** (`luotTruoc`).

Đường đi: phòng A (hình nộm) → **B** (2 Chuông Gỗ) → **C** (quái gác có vỏ) → **D** (2 Bọ Vỏ Mộc). HUD dưới máu ghi cấu hình; B có thanh lịch sử + chữ trạng thái (và ô nấc ở lượt tài nguyên).

## Sửa theo phản hồi 9

### Đã làm (điểm 1–8 của "GỬI CLAUDE")

1. **Replay mẫu cuối (cả A và B)** – `updateEcho` dùng chung cho A và B: trước đây bước lấy mẫu cuối đặt luôn `done`, nên hộp đòn của mẫu cuối không bao giờ bật
   (đúng lỗi JSON A lần phát id=4: n=7, hop0=6, tHop=-1). Giờ: bước lấy mẫu cuối xử lý **đủ** hình + hộp + hit của tick đó (thu hộp → gom trúng → Cộng hưởng),
   **bước sau** mới kết thúc phát → tư thế nghỉ. Không có tick nào được phát hai lần. Sửa bằng `tao-p0b.py` trên bản sinh (không sửa `thu-p0a/`).
2. **Vòng đệm B**: giữ xoá bóng + vòng đệm khi đổi **phòng gameplay**. Gọi được khi đoạn **> 3 tick** – không đợi đầy. Ba trạng thái lịch sử:
   ≤ 3 tick **chưa sẵn sàng** (nút Vọng mờ) · > 3 và < 90 **sẵn sàng, lịch sử chưa đầy** (nút sáng bình thường + viền gạch đứt, HUD "sẵn sàng") · ≥ 90 **đầy** ("sẵn sàng · đầy").
   Trạng thái **nấc tách riêng**: hết nấc = nút xám viền cam + số "0" ở góc, ô nấc riêng trên HUD (không dùng độ mờ của lịch sử).
3. **B2** (`?vong=b2`, tắt mặc định): trong vòng đệm tìm lần bắt đầu đòn gần nhất **đã có hộp** (đòn đang chuẩn bị chưa ra hộp → bỏ qua, lấy đòn trước);
   phát từ tick bắt đầu đòn (gồm chuẩn bị) tới cuối bản ghi. Không bắt đầu giữa tick active (luôn từ đầu đòn); giữ mã đòn gốc (`maGoc` → mã replay, chống trúng lặp như A/B).
   Đầu đòn nằm ngoài vòng đệm → bỏ đòn đó. Không có đòn hợp lệ → toast **"Chưa có đòn để vọng"**, không phát, **không tốn nấc, không xoá bóng cũ**.
   Toạ độ gốc, không kéo tới Lam / quái, không chọn đòn từng trúng. Log đo riêng: số nhát, sát thương, Cộng hưởng, nhịp gọi, số tick bỏ đầu vòng đệm.
4. **Bóng phát xong (A và B)**: tư thế **nghỉ** (khung thở đầu) theo **hướng cuối**, không còn hộp đòn nào, độ mờ 0,24 cố định (trước: 0,36–0,50 nhấp nháy),
   thanh Vọng không nhấp nháy. `?tan=1`: mờ dần 30 tick rồi mất (cả A và B). Game chính chưa đổi gì (câu đố giữ công tắc không đụng tới).
5. **Tài nguyên**: lượt chính miễn phí; `?nac=1` = 2 nấc / 150 tick; `?nac=1&suc=1` = 1 nấc / 150 tick (tắt mặc định). Thiếu nấc / thiếu lịch sử / B2 chưa có đòn:
   không trừ, không xoá bóng cũ. Nấc hồi theo **tick mô phỏng** (bước sau khựng) – tạm dừng / tab ẩn không chạy bước nên không hồi.
   Lượt 2 so **B miễn phí / B 2 nấc / B 1 nấc**; A chỉ tham chiếu.
6. **Đo**: độ trễ có **mẫu số** (thành công / tổng), tách **tick mô phỏng**, **bước có khựng** (mốc = trước bước bấm, nên bước ≥ tick; chênh = bước khựng) và **ms thật**
   (ms thật chỉ có khi người chơi – công cụ tự bước không có đồng hồ thật). Chỉ số đổi tên thành **"không gây hit / ảnh hưởng chiến đấu"**, tách:
   *không có đòn* · *có đòn nhưng hụt* · *mục tiêu đã chết* (hộp bóng chạm xác, hoặc không còn địch sống trong phòng lúc bấm / lúc hộp bật) ·
   *bị huỷ khi đổi phòng* · *bị huỷ khi thay bóng* · *huỷ khác* (chết / chơi lại). Thêm đếm: mẫu cuối có hộp, trúng ở mẫu cuối, Cộng hưởng ở mẫu cuối.
   Thêm **4 tình huống ngắn** trạng thái đầu giống nhau (mục 3c).
7. **Log nền** từ đầu (không cần `?debug`): mọi lần bấm V, ghi / ghi quá ngắn / thiếu lịch sử / B2 chưa có đòn / hết nấc, mỗi lần phát (đoạn, nhát, trễ, trúng, máu, Thế, Cộng hưởng,
   lý do không gây hit), thay bóng, đổi phòng, chết, chơi lại, **tạm dừng / mất focus / tab ẩn / xoay màn**. Gói JSON có: phiên bản game (`p0b-ddmm-mãbăm`), cấu hình,
   máy (UA, iOS, Safari?, cỡ màn, dpr, hướng), giờ bắt đầu, tóm tắt, số tổng, từng lần phát, sự kiện, log Vọng + log trúng P0. Màn bắt đầu: A **"bấm Vọng để GHI, đánh,
   bấm Vọng lần nữa để PHÁT"**; B **"bấm Vọng một lần để gọi lại 1,5 giây vừa qua"**. Gợi ý trên màn cũng theo từng cấu hình.
8. **Lỗi `sx` của Bọ**: đã sửa tại nguồn `thu-bo-vo-moc/cong-cu/khoi-bo.js` (commit `0836a73`, phiên khác). `tao-p0b.py` **bỏ bản vá trên bản chép**, thêm kiểm: nếu nguồn còn lỗi thì
   script dừng. Kiểm: đặt Bọ vào trạng thái sụp choáng với `?hitbox=1&debug=vong` → 0 lỗi trang; trận quay debug (cả A, B) → 0 lỗi trang.

**Âm Đao PH8**: phiên Âm Đao đang sửa hitbox trong `thu-p0a/`. Khi bản đó lên nhánh thì **chạy lại `tao-p0b.py`** để A/B dùng chung bản sửa (rồi quay lại số).
Lúc commit này: chưa có bản PH8 trên nhánh – P0-B sinh từ `am-dao.html` hiện tại (phiên `p0b-2810-e58986fc`).

### Kiểm bằng code (Chromium headless, `video/kiem-code.json`)

| Ca (PH9 mục 1.3) | A | B |
|---|---|---|
| Đoạn hợp lệ ngắn nhất | ghi 3 tick → không phát ("ghi quá ngắn"); ghi 4 → phát đủ 4 mẫu rồi nghỉ | vòng đệm 3 tick → không phát; 4 tick → phát đủ 4 mẫu |
| Đòn **chỉ ở mẫu cuối** (hộp ở mẫu 17/18 · 36/37) | hộp bóng bật **1 tick**, trúng **1**, "trúng ở mẫu cuối" | như A (trước sửa: hộp không bật, 0 trúng) |
| Nhiều mẫu active cùng mã (8 mẫu hộp, 1 mã) | hộp bóng bật **8 tick** = 8 mẫu, trúng **1** lần | như A |
| Mẫu cuối trùng Cộng hưởng (Lam chém trước ≤ 12 tick) | Cộng hưởng **1**, ghi "Cộng hưởng ở tick mẫu cuối" | như A |
| Hết đoạn khi có hitstop | hit mẫu cuối gây khựng 4 bước; bóng chỉ kết thúc **sau** khựng, không thêm tick có hộp | như A |
| Bóng sau khi phát | tư thế `idle`, lật theo hướng cuối (Lam đi trái → lật), không hộp; 30 tick sau vẫn thế | như A |
| `?tan=1` | bóng mất sau 30 tick | như A |

| Ca khác | Kết quả |
|---|---|
| B: trạng thái lịch sử / nút | 3 tick: "chưa sẵn sàng", nút mờ · 4 tick: "sẵn sàng, chưa đầy", viền đứt · 90: "đầy" |
| B: đổi phòng | có bóng → sang phòng: không còn bóng, vòng đệm **0** |
| B `?nac=1` | nấc 2 → 1 → 0; bấm khi 0 nấc: không phát, **bóng cũ còn nguyên**; 300 bước tạm dừng: **không hồi**; 150 tick chơi: +1 nấc |
| B `?nac=1&suc=1` | sức chứa 1; lần 2 → "hết nấc" |
| B2: chưa chém | "chưa có đòn để vọng", không phát; nếu đang có bóng → **bóng cũ còn nguyên** |
| B2: có 1 nhát trong vòng | phát từ tick đầu đòn (mẫu 0: `atkN=1, atkT=1`), bỏ 30 tick đầu vòng đệm, trễ tới hộp **7 tick** (= chuẩn bị) |
| B2: nhát mới đang chuẩn bị (chưa ra hộp) | bỏ qua, phát nhát trước |
| B2: đầu đòn trôi khỏi vòng đệm | "đòn gần nhất bắt đầu NGOÀI vòng đệm – bỏ", không phát |
| Link mặc định | chưa chọn → 2 nút A/B + hướng dẫn hai cách; log nền đã thu; debug / hộp đòn tắt; nút Xuất log + Chơi lại có trong ⚙ |
| Lỗi trang | **0** ở mọi trang kiểm / quay; "lần bấm Chém thiếu kết cục" **0** |

### Cần thử iPhone (chưa làm – KHÔNG đánh dấu đạt)
- Người chơi có hiểu A "ghi – đánh – phát" và B "gọi lại 1,5 s vừa qua" chỉ từ màn bắt đầu không.
- Nút Vọng B: mờ / viền đứt / đầy có đọc được trên nút ảnh không; "hết nấc" (xám + số 0) có lẫn với "chưa sẵn sàng" không.
- Bóng nghỉ mờ 0,24 có còn bị tưởng là đang đánh không; có cần `?tan=1` không (thử riêng, sau).
- Độ trễ thật (ms), cảm ứng, bấm Vọng cùng lúc chém / lướt có trượt nút không, hiệu năng Safari – chỉ đo được trên máy (log có ms thật + sự kiện tạm dừng / focus).
- Nút Xuất log trên Safari iOS: bảng Chia sẻ có hiện file JSON không (nếu không: tải về trong Tệp). Đổi cấu hình qua ⚙ có giữ log lượt trước không.

## Hướng dẫn buổi thử (theo PH9 mục 3)

**Trước buổi**: đóng băng phiên bản (`p0b-ddmm-mãbăm` in trên màn bắt đầu + trong log). Nếu Âm Đao PH8 lên nhánh trước buổi → sinh lại P0-B để A và B dùng chung bản sửa,
ghi phiên bản mới. Cấp 1, không Dư Âm, không đổi quái / tầm / VFX giữa A và B. Ghi máy, iOS, trình duyệt, hướng màn (log tự ghi), **không** bật `?battu`.

**Thứ tự**: mỗi người chơi **cả A và B**, thời gian tương đương. Chia **A→B** và **B→A** (4 người: 2 người mỗi thứ tự; 3 người: dùng để phát hiện vấn đề, không làm thống kê).
1. Tập di chuyển / đánh / né ở phòng A (hình nộm) vài phút.
2. Lượt 1: cấu hình đầu (link mặc định, chọn A hoặc B trên màn bắt đầu) – **miễn phí**, B+C rồi phòng Bọ, vài phút. Cuối lượt: ⚙ → **Xuất log lượt này**.
3. Lượt 2: ⚙ → "Vọng: đổi" (log lượt 1 được lưu, vào lại từ đầu – **máu, quái, lịch sử, nấc như nhau**). Chơi tương đương, xuất log.
4. Chỉ sau đó, nếu thấy cần: thử **B2** (`?vong=b2`). Sau nữa mới tới lượt tài nguyên (`?vong=b` vs `?vong=b&nac=1`). Không bắt một người thử hết mọi biến thể.
5. Nếu được: một lượt ngắn **không gọi bóng** để hỏi bóng có làm trận hay hơn không.
Câu dẫn chung: "chém, lướt, nút Vọng gọi bóng" + đúng câu hướng dẫn của cấu hình đó trên màn bắt đầu. **Hỏi người chơi trước khi giải thích số.**

**Bốn câu hỏi ngắn** (sau mỗi cấu hình, câu 4 cuối buổi):
1) Bạn định làm gì lúc bấm V, bóng có làm đúng điều bạn nghĩ không?
2) Có phải chờ quá lâu không? Chỉ đúng khoảnh khắc đó.
3) Bạn có chủ động phối hợp được một Cộng hưởng, hay chỉ thấy nó tự xảy ra?
4) Bạn muốn dùng kiểu nào tiếp, và vì sao?

**Số đo** (có sẵn trong log xuất ra): số lần bấm; đoạn huỷ / ghi quá ngắn / thiếu lịch sử; độ trễ bấm → hộp và → hit (thành công / tổng; tick mô phỏng, bước có khựng, ms thật);
thay bóng; hết nấc; phát khi không có đòn; gọi sau khi mục tiêu đã chết; có đòn nhưng hụt; Cộng hưởng có bóng; tạm dừng / mất focus / tab ẩn.
Ghi tay thêm: trúng trước / sau lúc người chơi muốn, trượt nút khi bấm cùng lúc, lỗi cảm ứng, hiệu năng (báo riêng).

## 1. Đã làm (từ đầu P0-B)

- **Trang `index.html`** sinh bằng `cong-cu/tao-p0b.py` từ `game/thu-p0a/am-dao.html` + khối Bọ (`game/thu-bo-vo-moc/cong-cu/khoi-bo.js`, đọc rồi chỉnh trên **bản chép**: phòng thử → phòng D)
  + khối Vọng `cong-cu/khoi-p0b.js`. Mỗi chỗ thay phải khớp đúng số lần, lệch thì script dừng. Ảnh Âm Đao lấy thẳng từ `../thu-p0a/am-dao/`.
- **Âm Đao khoá cấp 1** (không Dư Âm, nút đổi cấp ẩn, `?cap=` bị bỏ qua). Nhịp P0-A (su 7/7/9, hàng chờ 1 nhát) giữ nguyên.
- **Nút V có một nghĩa theo cấu hình đã chọn** – không chạm đúp. A = code ghi của trang (bắt đầu ghi / dừng → phát, tối đa 180 tick, ≤ 3 tick không phát).
  B = vòng đệm 90 tick luôn ghi trạng thái Lam bằng **đúng `recordFrame` của trang** (dừng trong hitstop), bấm V → chép sâu sang bảng phát của bóng (cùng định dạng, mã đòn bền, công thức).
  Không cắt phần đứng yên đầu đoạn (PH3 mục 5) – chỉ đo.
- **Chung A và B**: 1 bóng; gọi bóng mới thì bóng cũ mất; đổi phòng xoá bóng (B xoá luôn vòng đệm, A huỷ đoạn đang ghi); chết xoá bóng.
- **Phòng D** (30 ô, trần 8 ô): 2 Bọ Vỏ Mộc thang ×10 (máu 40, Thế mai 40), dùng `CFG` chung của P0-A (bóng 0,25 / 0,5; Cộng hưởng +10); đòn Lam và bóng vào Bọ qua mã đòn bền.

## 2. Thông số (giống hệt ở A, B, B2)

| Số | A | B / B2 |
|---|---|---|
| Âm Đao | cấp 1, không Dư Âm (nhát thường [10 máu, 10 Thế], nhát 3 [10, 30]) | giống |
| `BONG_MAU` / `BONG_THE` · `CH_MAU` / `CH_THE` | 0,25 / 0,5 · 1 / 0,5 | giống |
| Quái | Chuông Gỗ 40 ×2, quái gác [30, vỏ 60], Bọ [40, mai 40] ×2 | giống |
| Gọi bóng | bấm V ghi, bấm V phát; ghi tối đa 180 tick | bấm V một lần; vòng đệm 90 tick (B2: từ đầu nhát gần nhất trong vòng) |
| Bóng phát xong | nghỉ, không hộp, mờ (`?tan=1`: tan) | giống |
| Tài nguyên | miễn phí | lượt chính miễn phí · `?nac=1` 2 nấc / 150 · `&suc=1` 1 nấc / 150 |

Sửa số: khối `VB_SO` đầu `cong-cu/khoi-p0b.js` rồi chạy lại `python3 game/thu-p0b/cong-cu/tao-p0b.py`.

## 3. Kết quả – KIỂM BẰNG CODE (bot, mỗi hình video = 1 bước logic) – SAU SỬA PH9

Kịch bản trận (`video/1-sach-A-vs-B.mp4`, `ket-qua.json → luot1`) **không đổi** so với lần trước: trạng thái đầu giống nhau, đặt một lần; bot đi tới mục tiêu gần nhất,
trong 62 px chém mỗi 14 tick, **gọi sau mỗi nhóm 3 nhát** (A bấm ghi ở nhát đầu nhóm). B2 chạy cùng bot, cùng cách bấm như B. **Nhịp gọi này thuận cho A** (PH9 2B) –
xem thêm tình huống ngắn ở 3c. Bước = 1/60 s logic (kể cả khựng); tick = tick mô phỏng.

### 3a. Lượt chính (cả hai MIỄN PHÍ)

| | **A – Ghi chủ động** | **B – Vọng Chiến** | B2 (biến thể, tham khảo) |
|---|---|---|---|
| Xong trận (bước bot) | 1555 | 1581 | 1529 |
| Chết lúc: Chuông Gỗ #1 / #2 · gác · Bọ #1 / #2 | 172 / 418 · 744 · 1237 / 1555 | 167 / 419 · 784 · 1261 / 1581 | 166 / 441 · 772 · 1236 / 1529 |
| Lam bị trúng | 2 | 4 | 3 |
| Bấm V / lần phát | 16 (9 ghi + 7 dừng) / 7 | 6 / 6 | 11 / 10 (1 lần "chưa có đòn": đầu đòn ngoài vòng) |
| **Bấm V → hộp bóng đầu** | **7/7** có hộp · TB **6,1 tick** (1–7) · 9,6 bước (khựng 3,4) | **6/6** · TB **43,7 tick** (5–61) · 52 bước (khựng 8,3) | 10/10 · 7 tick · 10,6 bước |
| Bấm V → trúng đầu | 5/7 trúng · TB 7 tick | 6/6 · TB 43,7 tick | 5/10 · 7 tick |
| A: bấm **bắt đầu ghi** → hộp bóng | TB 51 bước (18–79) | – | – |
| Đoạn phát TB · mở đầu chưa có hộp TB · đứng yên TB | 35,9 · 5,1 · 0 tick | 90 · 42,7 · 0,8 tick | 18,2 · 6 · 0 tick |
| **Không gây hit / ảnh hưởng chiến đấu** | **2/7** – cả 2 **mục tiêu đã chết** (gác chết giữa nhóm; Bọ #1 vừa chết) | **0/6** | 5/10 – cả 5 mục tiêu đã chết (phát lại đúng nhát kết liễu) |
| … không có đòn · có đòn hụt · bị huỷ | 0 · 0 · 0 | 0 · 0 · 0 | 0 · 0 · 0 |
| Số nhát trong đoạn (tổng · TB) | 13 · 1,9 | 11 · 1,8 | 10 · 1 |
| Bóng trúng (lần) · máu · Thế (chỉ phần bóng) | 10 · 18 · 5 | 6 · 12 · 0 | 5 · 8 · 5 |
| Cộng hưởng có bóng (phần thêm của Cộng hưởng KHÔNG cộng vào máu bóng) | 4 | 5 | 3 |
| Nhịp gọi TB (min), bước | 225 (63) | 276 (206) | 157 (53) |
| Mẫu cuối có hộp · trúng ở mẫu cuối | 2 · 0 | 0 · 0 | 3 · 0 |

**Tách theo phòng** (phát · không gây hit · Cộng hưởng · máu bóng · trễ tới hộp, tick):

| Phòng | A | B | B2 |
|---|---|---|---|
| B (2 Chuông Gỗ) | 2 · 0 · 1 · 8 · 7, 7 | 2 · 0 · 2 · 4 · 37, 39 | 4 · 2 · 0 · 4 · 7×4 |
| C (quái gác) | 2 · 1 · 1 · 2 (+Thế 5) · 7, 7 | 2 · 0 · 1 · 4 · 59, 5 | 2 · 1 · 1 · 0 (+Thế 5) · 7, 7 |
| D (2 Bọ) | 3 · 1 · 2 · 8 · 7, 1, 7 | 2 · 0 · 2 · 4 · 61, 61 | 4 · 2 · 2 · 4 · 7×4 |

**So với TRƯỚC SỬA** (`video/truoc-sua/ket-qua-truoc-sua-PH9.json`, log cũ `video/truoc-sua/log/`):
- A lần phát id=4 (n=7, hộp ở mẫu 6 = mẫu cuối): trước **không bật hộp** (tHop=-1) và bị tính "có đòn nhưng không trúng"; giờ hộp bật (7/7 lần có hộp).
  Nó vẫn không trúng vì quái gác **đã chết** → giờ xếp đúng loại "mục tiêu đã chết". Lần hụt thứ hai cũng vậy (Bọ vừa chết). Không còn lần nào "có đòn nhưng hụt" ở A.
- Máu / Thế / Cộng hưởng / thời điểm chết của A và B **không đổi** ở kịch bản này (nhát bị mất trước đây không trúng ai). B không có đoạn nào kết thúc bằng hộp nên không bị ảnh hưởng.
- Đơn vị: số cũ "8,3 bước" (A) / "51 bước" (B) tính từ mốc sau bước bấm, chỉ trên các lần có hộp (A 6/7). Số mới: mốc trước bước bấm (+1 bước), mẫu số ghi rõ, tách tick / bước khựng.
  Đọc theo tick mô phỏng: A 6,1 tick (7/7), B 43,7 tick (6/6).

**Đọc số (một kịch bản bot, chưa phải cảm nhận – không suy A tốt hơn, PH9 2F):** chênh thời gian 26 bước ≈ 0,43 s; Lam bị trúng 2 / 4 không đủ nói gì về an toàn;
A "trễ ngắn" vì đã bấm ghi trước ~51 bước. B2 cắt trễ tới hộp xuống 7 tick nhưng đổi **nội dung**: mỗi lần chỉ 1 nhát, và với nhịp "gọi sau nhóm 3 nhát / khi mục tiêu vừa chết"
của bot nó hay phát lại đúng nhát kết liễu → 5/10 lần không gây hit. Đó là tương tác giữa luật B2 và nhịp bot, không phải kết luận về B2.

### 3b. Lượt TÀI NGUYÊN (`ket-qua.json → luot2`, cùng bot, không video)

| | A (tham chiếu, miễn phí) | B miễn phí | B 2 nấc / 150 | B 1 nấc / 150 |
|---|---|---|---|---|
| Bấm V / phát | 16 / 7 | 6 / 6 | 6 / 6 | 6 / 6 |
| Bấm khi hết nấc | – | – | **0** | **0** |
| Mọi số còn lại | = lượt chính | = lượt chính | = B miễn phí | = B miễn phí |

Bot gọi thưa (khoảng cách nhỏ nhất 206 bước > 150) nên cả 1 nấc cũng không cạn → kịch bản này **không chạm giới hạn**; không chứng minh tài nguyên vô ích (PH9 1.5).

### 3c. Tình huống ngắn – trạng thái đầu giống nhau (`ket-qua.json → tinh_huong`)

Mỗi ô một trang mới: hình nộm phòng A đặt lại, Lam cách nộm (200 px cho "áp sát", 60 px cho còn lại), mặt phải, **đứng 100 tick** (vòng đệm B đầy cảnh đứng), không bóng.
Cùng chuỗi phím cho A / B / B2; A bấm ghi **cùng lúc** bắt đầu hành động. Sau khi gọi: Lam chém tại chỗ mỗi 14 tick nếu còn trong 62 px.

| Tình huống | A: đoạn · nhát · bấm→hộp (tick) · trúng · máu · CH | B: đoạn · nhát · bấm→hộp · trúng · máu · CH | B2: đoạn · nhát · bấm→hộp · trúng · máu · CH |
|---|---|---|---|
| **Vừa áp sát** (đi tới, chém 1, 14 tick sau gọi) | 47 · 1 · 43 · 1 · 2 · 1 (từ lúc bấm ghi: 103 bước) | 90 · 1 · **86** (43 tick đứng đầu đoạn) · 1 · 2 · 1 | 11 · 1 · **7** · 1 · 2 · 1 |
| **Đánh tại chỗ** (5 nhát, gọi) | 57 · 3 · 7 · 3 · 6 · 1 | 90 · 3 · 40 · 3 · 6 · 1 | 27 · 1 · 9 · 1 · 2 · 1 |
| **Né / lùi rồi gọi** (2 nhát, lướt + chạy lùi 20 tick) | 43 · 2 · 7 · 2 · 4 · 0 | 90 · 2 · 54 · 2 · 4 · 0 | 28 · 1 · 7 · 1 · 2 · 0 |
| **Gọi khi chưa có đòn** | 30 · 0 · – · 0 → **không có đòn** | 90 · 0 · – · 0 → **không có đòn** | **không phát** – "chưa có đòn để vọng", không tốn gì |

Ghi chú: "áp sát" của B phải đi lại cả cảnh đứng + đi tới (86 tick); A cũng phải đi lại đoạn đi tới vì bấm ghi từ lúc bắt đầu đi (43 tick); B2 chỉ phát nhát chém.
"Tại chỗ": A và B có cả 3 nhát cuối còn trong đoạn; B2 chỉ nhát cuối (đổi nội dung, không chỉ giảm trễ – PH9 1.1). Thế khác nhau giữa các ô do nộm vỡ Thế ở thời điểm khác – không so.

## 4. Câu hỏi / việc chờ chủ dự án
1. Bot B2 hay phát lại nhát kết liễu khi gọi ngay lúc mục tiêu chết (5/10). Nếu người thử cũng gặp, có cân nhắc luật "bỏ nhát đã giết mục tiêu" không? (Hiện **không** làm – PH9 cấm tự chọn đòn từng trúng.)
2. Khi bản Âm Đao PH8 lên nhánh: sinh lại P0-B và quay lại số (đã ghi ở "Sửa theo phản hồi 9").

## 5. Video và số (`video/`, 60 hình/s, H.264 `-preset veryfast`)

| File | Nội dung |
|---|---|
| `1-sach-A-vs-B.mp4` | **VIDEO SẠCH** 1920×540 (sau sửa PH9): trái A, phải B, cùng bot, phòng B → C → D (không log, không hộp đòn) |
| `2-debug-A-vs-B.mp4` | Cùng kịch bản, `?hitbox=1&debug=vong`: hộp đòn (teal = bóng) + bảng log Vọng |
| `luot1-log-*.txt`, `luot2-log-*.txt` | Log Vọng + log trúng / Cộng hưởng P0 cho từng trang (có B2, B 1 nấc / 2 nấc) |
| `ket-qua.json` | Số mục 3a–3c (từng lần phát: phòng, đoạn, nhát, hộp đầu, đứng yên, trễ tick / bước, trúng, máu, Thế, Cộng hưởng, lý do không gây hit, mẫu cuối) |
| `kiem-code.json` | Số kiểm mục "Kiểm bằng code" |
| `truoc-sua/` | **TRƯỚC SỬA PH9**: `ket-qua-truoc-sua-PH9.json`, `kiem-code-truoc-sua-PH9.json`, `log/` |

Quay lại: `python3 -B game/thu-p0b/cong-cu/quay-p0b.py [luot1 luot2 tinh-huong]` (cần playwright, Chromium, ffmpeg, Pillow; ≈ 10 phút). Chỉ quay + ghi số, không phải bộ kiểm thử.

## 6. Chưa làm
- Chưa thử trên iPhone. Không kết luận điều khiển / trải nghiệm đạt từ Chromium.
- Chưa chọn A / B / B2, chưa chốt chi phí, chưa ghép game chính, chưa đổi cách giữ công tắc trong game chính.
- P0-C (tinh anh Chuông Gỗ, Ấn Rèn, đe mở Dư Âm) – làm riêng, không trong trang này.
