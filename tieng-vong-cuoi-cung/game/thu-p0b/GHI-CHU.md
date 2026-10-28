# Trang thử P0-B – hai cách gọi bóng: A ghi chủ động / B Vọng Chiến (28/10/2026)

Viết cho người không rành kỹ thuật. Làm theo `docs/gameplay/PHAN-HOI-7-AM-DAO-BO-P0B.md` (mục 4 + phần "P0-B" trong "Gửi Claude"),
`KE-HOACH-GAMEPLAY-V2.md` mục 4, 4a, 6, 7, `PHAN-HOI-1` mục 2 (không chạm đúp), `PHAN-HOI-3` mục 5 (đo độ trễ, chưa cắt đoạn đứng yên).
**Trang riêng**, chưa ghép game chính. **Không sửa** `game/thu-p0a/`, `game/thu-bo-vo-moc/` (chỉ đọc khối Bọ), `game/demo.html`, `build-demo.py`,
`game/thu-phong-b/`. Không publish. Không có bộ kiểm thử tự động – chỉ công cụ quay + ghi số.

> **Mọi số dưới đây đo trong Chromium headless trên máy chủ, do bot bấm.** Chưa ai chơi trên iPhone. **Không kết luận điều khiển đạt từ Chromium.**

## Link chơi thử

| Link | Dùng để |
|---|---|
| https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-p0b/index.html | **Người chơi thử trên iPhone.** Màn bắt đầu có 2 nút: **A – Ghi chủ động** / **B – Vọng Chiến** (chọn trước khi vào phòng). Log + hộp đòn TẮT |
| …/index.html?vong=a | Vào thẳng cấu hình A |
| …/index.html?vong=b | Vào thẳng cấu hình B |
| …/index.html?vong=b&nac=1 | **Lượt 2** – B tốn nấc Vọng (2 nấc, hồi 1 nấc / 150 tick). A ở lượt 2 vẫn miễn phí |
| …/index.html?vong=a&debug=vong&hitbox=1 | Bảng log Vọng (độ trễ, gọi hụt, Cộng hưởng, sát thương bóng) + lớp hộp đòn (teal = hộp bóng) |

Trong game: ⚙ → nút **"Vọng: A/B – bấm để đổi"** (tải lại trang, vào lại từ đầu – không đổi giữa phòng). Đường đi: phòng A (hình nộm) → **B** (2 Chuông Gỗ)
→ **C** (quái gác có vỏ, cổng mở khi nó chết) → **D** (2 Bọ Vỏ Mộc, mới). HUD dưới máu ghi "A · Ghi chủ động" / "B · Vọng Chiến"; B có thanh nhỏ = vòng đệm đã đầy bao nhiêu (và 2 ô nấc ở lượt 2).

## 1. Đã làm gì

- **Trang `index.html`** sinh bằng `cong-cu/tao-p0b.py` từ `game/thu-p0a/am-dao.html` + khối Bọ (`game/thu-bo-vo-moc/cong-cu/khoi-bo.js`, đọc rồi chỉnh trên **bản chép**)
  + khối Vọng `cong-cu/khoi-p0b.js`. Mỗi chỗ thay phải khớp đúng số lần, lệch thì script dừng. Ảnh Âm Đao lấy thẳng từ `../thu-p0a/am-dao/`.
- **Âm Đao khoá cấp 1** (không Dư Âm, nút đổi cấp ẩn, `?cap=` bị bỏ qua). Nhịp P0-A (su 7/7/9, hàng chờ 1 nhát) giữ nguyên.
- **Nút V có một nghĩa theo cấu hình đã chọn** – không chạm đúp:
  - **A – Ghi chủ động** = code hiện tại, **không đổi**: chạm V bắt đầu ghi (tối đa 180 tick = 3 s), chạm lần nữa dừng → bóng phát; hết 180 tick tự dừng và phát; ghi ≤ 3 tick thì không phát.
  - **B – Vọng Chiến**: vòng đệm **90 tick (1,5 s) luôn ghi** trạng thái Lam (vị trí, tư thế, hộp đòn kèm `goc`/`co`/`maGoc` đã chốt – **không ghi phím**), **dừng trong hitstop**.
    Chạm V một lần → bóng phát lại đoạn 1,5 s vừa qua. Mới vào phòng chưa đủ 90 tick → phát đoạn đang có nếu > 3 tick; nút V **mờ** khi chưa đủ 90 tick.
    B ghi bằng **đúng hàm `recordFrame` của trang** (chung với A) vào một vòng đệm riêng, lúc bấm thì chép sâu sang bảng phát của bóng → cùng định dạng, cùng mã đòn bền, cùng công thức.
  - **Không cắt phần đứng yên đầu đoạn** (PH3 mục 5) – chỉ đo và ghi log.
- **Chung A và B**: 1 bóng; gọi bóng mới thì bóng cũ mất; **đổi phòng xoá bóng** (mới thêm – P0-A cũ không xoá; ở B xoá luôn vòng đệm, ở A huỷ luôn đoạn đang ghi); chết xoá bóng (có sẵn).
- **Phòng D** (30 ô, trần 8 ô như hành lang C): bỏ tường phải phòng C để đi sang; **2 Bọ Vỏ Mộc** nạp từ `LOAI_QUAI.bo` / `THE_BO` **thang ×10** (máu 40, Thế mai 40, `mat`, vỡ một lần) –
  phiên Bọ bản 5 đã lên nhánh (commit `64e0bcb`) nên **không phải chờ**. Bọ dùng **`CFG` chung** của P0-A (bóng 0,25 / 0,5; Cộng hưởng +10). Đòn Lam và bóng vào Bọ đi qua **mã đòn bền** của P0-A
  (mã đòn = `D.ma`; mỗi lần phát bóng mã mới) → hộp nhiều tick vẫn trúng mỗi con 1 lần, phát lại lần sau không bị chặn vì trùng mã.
- **Lượt 1 / lượt 2 tách hẳn**: mặc định **cả hai miễn phí**. Cờ riêng `?nac=1` mới bật chi phí của Vọng Chiến (2 nấc, hồi 1 nấc / 150 tick, bấm khi 0 nấc → không phát, log "HẾT NẤC").
- **Log `?debug=vong`** (bảng trái màn + console): mọi dòng có chuỗi cấu hình (vd. `B|bm0.25|bt0.5|ch1|ct0.5|mien-phi|cap1`); mỗi lần phát ghi
  độ dài đoạn, tick có hộp đầu, số tick đứng yên đầu đoạn, **bấm V → hộp bóng đầu** (bước logic, kể cả bước khựng) và **→ lần trúng đầu**, trúng / máu / Thế / Cộng hưởng của lần phát,
  và **"HỤT TÁC DỤNG"** khi cả lần phát không trúng gì (tách "đoạn không có đòn" / "có đòn nhưng không trúng").

## 2. Thông số (giống hệt ở A và B – đo trên trang, `video/kiem-code.json`)

| Số | A | B | Ghi chú |
|---|---|---|---|
| Âm Đao | cấp 1, không Dư Âm | cấp 1, không Dư Âm | nhát thường [10 máu, 10 Thế], nhát 3 [10, 30] |
| `BONG_MAU` / `BONG_THE` | 0,25 / 0,5 | 0,25 / 0,5 | bóng nhát thường = 2 máu, 5 Thế |
| `CH_MAU` / `CH_THE` | 1 / 0,5 | 1 / 0,5 | Cộng hưởng +10 máu; vỏ / mai vỡ ngay |
| Quái | Chuông Gỗ 40 ×2, quái gác [30, vỏ 60], Bọ [40, mai 40] ×2 | giống | cùng vị trí đầu |
| Gọi bóng | chạm V ghi, chạm V phát; ghi tối đa 180 tick | chạm V một lần; vòng đệm 90 tick | |
| Tài nguyên lượt 1 | miễn phí | **miễn phí** | |
| Tài nguyên lượt 2 (`?nac=1`) | miễn phí | 1 nấc / lần, tối đa 2, hồi 1 / 150 tick | |

Sửa số: khối `VB_SO` đầu `cong-cu/khoi-p0b.js` (B: `dem` 90, `toiThieu` 3, `nacToiDa` 2, `hoiNac` 150) rồi chạy lại `python3 game/thu-p0b/cong-cu/tao-p0b.py`.

## 3. Kết quả – KIỂM BẰNG CODE (Chromium headless, bot bấm, mỗi hình video = 1 bước logic)

### 3a. Luật Vọng

| Kiểm | Kết quả |
|---|---|
| Thông số A = B | `kiem-code.json → thong_so_A / thong_so_B` trùng từng số |
| B mới vào phòng | sau 3 tick: bấm V **không phát**; sau 30 tick: phát **đoạn 30 tick**; đầy tối đa **90** |
| B dừng ghi trong hitstop | 40 bước chém hình nộm (7 bước khựng): vòng đệm **+33** = số tick mô phỏng **+33** |
| Đổi phòng xoá bóng | có bóng → sang phòng: **không còn bóng**, vòng đệm B về **0** (trong trận: 2 lần ở cả A và B) |
| A không đổi | ghi 3 tick → không phát; ghi đủ 180 tick → **tự dừng và phát đoạn 180** |
| Lượt 2 nấc | nấc 2 → 1 → 0; bấm thêm 2 lần → "HẾT NẤC", không phát; 150 tick sau → 1 nấc |
| Link mặc định | chưa chọn cấu hình → 2 nút A / B, nút "Bắt đầu" ẩn; log Vọng, log input, hộp đòn đều **TẮT** |
| Mã đòn bền, gom tick, Cộng hưởng | dùng nguyên khối P0-A: log "D … vẫn chồng … đã trúng → bỏ qua các tick sau" (1 hộp nhiều tick = 1 lần trúng) |
| Lỗi trang | **0** ở cả 6 trang quay; "lần bấm Chém thiếu kết cục" **0** |
| Video sạch và video debug | cùng bot, **mọi số trùng khít** (debug không đổi luật) |

### 3b. Bảng so A / B – LƯỢT 1 (cả hai MIỄN PHÍ), cùng kịch bản

**Kịch bản** (`video/1-sach-A-vs-B.mp4`, `ket-qua.json → luot1`): trạng thái đầu giống nhau (quái ở chỗ gốc, Lam đầu phòng B), đặt **một lần**; trong trận **không dời quái, không đặt lại gì**.
Bot chung: đi tới mục tiêu sống gần nhất, trong 62 px thì chạm Chém mỗi 14 tick, không né Chuông Gỗ, lùi / nhảy khi Bọ báo húc mà mình ở trước mặt.
**Gọi bóng sau mỗi nhóm 3 nhát** (nhóm chỉ bắt đầu khi không có bóng đang phát; mục tiêu chết giữa nhóm cũng gọi):
**A** chạm V ở nhát đầu nhóm (bắt đầu ghi) và chạm V lúc gọi (dừng → phát); **B** chỉ chạm V lúc gọi. Hai bên **chỉ khác cách bấm V**. 1 bước ≈ 1/60 s.

| | **A – Ghi chủ động** | **B – Vọng Chiến** |
|---|---|---|
| Xong trận (bước bot) | 1555 | 1581 |
| Chết lúc: Chuông Gỗ #1 / #2 · quái gác · Bọ #1 / #2 | 172 / 418 · 744 · 1237 / 1555 | 167 / 419 · 784 · 1261 / 1581 |
| Lam bị đánh trúng | 2 | 4 |
| Số lần chạm V | **16** (9 bắt đầu ghi + 7 dừng) | **6** |
| Số lần bóng phát | 7 | 6 |
| **Chạm V (lần phát) → hộp bóng đầu**, TB (min–max) | **8,3 bước ≈ 0,14 s** (6–12) | **51 bước ≈ 0,85 s** (4–73) |
| Chạm V → bóng trúng đầu, TB | 8,8 | 51 |
| A: chạm V **bắt đầu ghi** → hộp bóng đầu, TB | **58 bước ≈ 0,97 s** (40–78) | – |
| Đoạn phát mở đầu chưa có hộp đòn, TB | 5,1 tick | **42,7 tick** |
| … trong đó **đứng yên** (không cắt) | 0 | **0,8** tick |
| **Gọi hụt tác dụng** (cả lần phát không trúng gì) | **2 / 7** (cả 2 là "có đòn nhưng không trúng") | **0 / 6** |
| **Cộng hưởng** (có bóng) | 4 | 5 |
| Bóng trúng (lần) | 10 | 6 |
| Sát thương bóng: máu / Thế | 18 / 5 | 12 / 0 |

**Tách theo phòng** (phòng B + C trước, phòng D sau – theo thứ tự PH7):

| Phòng | A: phát · hụt · Cộng hưởng · máu bóng · trễ (bước) | B: phát · hụt · Cộng hưởng · máu bóng · trễ (bước) |
|---|---|---|
| B (2 Chuông Gỗ) | 2 · 0 · 1 · 8 · 6, 6 | 2 · 0 · 2 · 4 · 42, 44 |
| C (quái gác) | 2 · 1 · 1 · 2 (+Thế 5) · 8, – | 2 · 0 · 1 · 4 · 70, 4 |
| **B + C** | **4 · 1 · 2 · 10** | **4 · 0 · 3 · 8** |
| D (2 Bọ) | 3 · 1 · 2 · 8 · 12, 6, 12 | 2 · 0 · 2 · 4 · 73, 73 |

**Đọc số (một kịch bản bot, chưa phải cảm nhận):**
- Độ trễ B (TB 0,85 s, tới 1,2 s) **gần như không phải do đứng yên** (TB 0,8 tick): đoạn 1,5 s chủ yếu là lúc **đi tới quái** trước khi chém.
  Cắt "phần đứng yên" sẽ gần như không đổi gì ở kịch bản này; cái làm chậm là đoạn di chuyển. (Chưa cắt gì – đúng PH3.)
- A trễ ngắn sau lần chạm thứ hai **vì người chơi đã chạm V trước đó ~1 s**: tính từ lần chạm đầu, A mất TB 58 bước – xấp xỉ B (51). Khác nhau là A đòi **lên kế hoạch trước + 2 lần chạm**, B chỉ 1 lần chạm nhưng phải chờ bóng đi lại đoạn tiếp cận.
- B **không hụt** lần nào nhưng mỗi lần phát chỉ trúng **1** nhát (đoạn 1,5 s thường chứa 1 nhát ở chỗ quái đã bị đẩy đi); A trúng 2 nhát / lần khi trúng, hụt 2 lần
  (1 lần đoạn chỉ 7 tick vì quái gác chết giữa nhóm; 1 lần Bọ đã đổi chỗ khi bóng tới). Tổng Cộng hưởng gần nhau (4 / 5), thời gian qua trận gần nhau (A nhanh hơn 26 bước ≈ 1,7 %).
- Không có số nào ở đây cho biết "cách nào làm trận đánh hay hơn" – đó là câu hỏi cho người chơi (mục 4).

### 3c. LƯỢT 2 (`?nac=1`) – chỉ thêm chi phí của Vọng Chiến (`ket-qua.json → luot2`, cùng bot, không video)

| | A (miễn phí) | B (tốn nấc) |
|---|---|---|
| Lần chạm V / phát | 16 / 7 | 6 / 6 |
| Lần chạm khi **hết nấc** | – | **0** |
| Mọi số còn lại | trùng lượt 1 | trùng lượt 1 |

Bot này chỉ gọi bóng 6 lần trong ~26 s (mỗi lần cách nhau > 150 tick) nên **2 nấc / 150 tick không bao giờ cạn** → ở nhịp gọi này chi phí không đổi kết quả.
Muốn biết chi phí có cắn không phải xem người chơi gọi dày hơn bot bao nhiêu (log `?debug=vong&nac=1` có dòng "hết nấc").

### 3d. Ghi nhận thêm (chưa sửa – cần duyệt)
- **Tick cuối của đoạn ghi không bao giờ được phát** (code replay cũ, cả A và B): `updateEcho` đánh dấu xong trước khi thu hộp ở tick cuối. Ví dụ A lần phát đoạn 7 tick có hộp ở tick 6 → hộp đó không bật.
  Không sửa vì luật số 4 (không đổi replay ngoài phần cần cho B).
- **Lỗi nhỏ trong khối Bọ bản 5** (`game/thu-bo-vo-moc/cong-cu/khoi-bo.js`, hàm `veThanh`, dòng ~511): chú thích `// PH7: chỉ ở ?debug / ?hitbox=1` nằm **trước** `const a = …, sx, sy` trên cùng một dòng
  nên khai báo bị nuốt → khi Bọ sụp choáng mà bật `?hitbox=1` hoặc `?debug=…` thì trang lỗi `sx is not defined`. Link mặc định không bị (3 chấm quay tắt).
  **Không sửa thư mục Bọ**; trang P0-B sửa trên **bản chép** trong `tao-p0b.py` (ghi rõ chỗ). Phiên Bọ nên sửa gốc.
- Bóng sau khi phát xong vẫn **đứng giữ tư thế cuối** (như A hiện tại) ở cả A và B; không trúng gì.

## 4. CẦN THỬ IPHONE (chưa làm – KHÔNG đánh dấu đạt)

Theo KHGP2 mục 4a dòng "A ↔ B": mỗi người chơi **cả hai**, **đổi thứ tự** (người 1 A → B, người 2 B → A, người 3 A → B…), cùng máy, link mặc định (chọn ở màn bắt đầu), lượt 1 (miễn phí).
Mỗi lượt ~3 phút: B (2 Chuông Gỗ) → C (quái gác) → D (2 Bọ). Câu dẫn duy nhất: "chém, lướt, chạm Vọng để gọi bóng" + mô tả cách gọi của cấu hình đó (đã in sẵn ở màn bắt đầu).

| Hỏi / đo | Vì sao chưa biết từ máy chủ |
|---|---|
| **"Cách nào làm trận đánh hay hơn?"** (hỏi cuối buổi) | Cảm nhận |
| Sau mỗi cấu hình: "bóng có ích" 1–5; "gọi bóng có kịp lúc không, hay phải chờ lâu?" | Độ trễ B ≈ 0,85 s TB – chưa biết người chơi thấy "hụt nhịp" hay không (PH3 mục 5) |
| B: nút V mờ khi mới vào phòng có hiểu không | Chỉ thấy trên máy thật |
| A: có quên chạm V lần hai / ghi quá dài không (log: số lần tự dừng 180 tick, ghi ≤ 3 tick) | Bot không quên |
| Chạm V cùng lúc với chém / lướt trên màn cảm ứng có bị trượt nút không | Cảm ứng Safari |
| Lượt 2 (`?nac=1`, sau khi xong lượt 1): có lúc hết nấc không, có khó chịu không | Bot không gọi đủ dày để cạn nấc |
| Đọc log sau buổi (`?debug=vong`, không bật trong lúc thử): độ trễ, gọi hụt, Cộng hưởng của từng người | – |

Thử iPhone P0-A / Âm Đao vẫn chạy song song (PH7); kết quả đó quyết định điều khiển cuối cùng.

## 5. Câu hỏi cần chủ dự án quyết

1. **Độ trễ B** (TB 0,85 s, tối đa 1,2 s) chủ yếu là **đoạn đi tới quái**, không phải đứng yên. Nếu người thử thấy chậm, biến thể nên so là **"bắt đầu từ nhát đánh gần nhất trong 1,5 s"** (PH3) – cắt đứng yên gần như vô tác dụng ở số đo này. Chuẩn bị sẵn biến thể đó (tắt mặc định) cho buổi thử, hay đợi kết quả người chơi trước?
2. **Đổi phòng xoá cả vòng đệm B** → vào phòng mới phải 1,5 s mới đầy (nút mờ). Giữ, hay chỉ xoá bóng mà vẫn giữ vòng đệm?
3. **Tick cuối của đoạn ghi không phát** (mục 3d, code cũ cả A và B). Sửa cho đúng (đổi replay của cả hai) hay giữ tới sau P0-B?
4. **Bóng giữ tư thế cuối** sau khi phát xong (di sản câu đố công tắc của A). Trong phòng P0-B không có câu đố – giữ cho giống A, hay cho bóng tan khi phát xong ở cả hai?
5. **Lượt 2**: với nhịp gọi của bot chi phí không cắn. Thử người chơi với 2 nấc / 150 tick như kế hoạch, hay thêm biến thể chặt hơn (vd. 1 nấc / 150) – theo 4a chỉ đổi **một** nhóm mỗi vòng?

## 6. Video và số (`video/`, 60 hình/s, H.264 `-preset veryfast`)

| File | Nội dung |
|---|---|
| `1-sach-A-vs-B.mp4` | **VIDEO SẠCH** 1920×540: trái A, phải B, cùng bot, chạy song song từng bước, phòng B → C → D (không log, không hộp đòn) |
| `2-debug-A-vs-B.mp4` | Cùng kịch bản, `?hitbox=1&debug=vong`: hộp đòn (teal = bóng) + bảng log Vọng |
| `luot1-log-*.txt`, `luot2-log-*.txt` | Log Vọng (từng lần phát) + log trúng / Cộng hưởng của P0 cho từng trang |
| `ket-qua.json` | Mọi số ở mục 3b, 3c (kể cả danh sách từng lần phát: phòng, độ dài đoạn, tick hộp đầu, đứng yên, trễ, trúng, máu, Thế, Cộng hưởng) |
| `kiem-code.json` | Số đo mục 3a (thông số A/B, vòng đệm khi mới vào phòng, hitstop, đổi phòng, A tự dừng, nấc, link mặc định) |

Quay lại: `python3 -B game/thu-p0b/cong-cu/quay-p0b.py [luot1 luot2]` (cần playwright, Chromium, ffmpeg, Pillow; ≈ 15 phút). Đây chỉ là quay + ghi số, không phải bộ kiểm thử tự động.

## 7. Chưa làm
- Chưa thử trên iPhone (mục 4). Không kết luận điều khiển đạt từ Chromium.
- Chưa có vòng 1–3 của KHGP2 4a (đổi `BONG_MAU`, `CH_MAU`, nấc) – P0-B lượt này chỉ so **cách gọi bóng** (A ↔ B) với mọi số ở mốc gốc.
- Chưa có tinh anh, nâng cấp, Dư Âm (P0-C). Chưa ghép game chính.
