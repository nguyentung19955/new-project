# Trang thử P0-C – tinh anh · Ấn Rèn I · đe rèn · Âm Đao cấp 3 (28/10/2026, sửa theo PH10 + nhận xét iPhone 28/10 + camera kiểu Dead Cells 28/10)

Viết cho người không rành kỹ thuật. Bản đầu làm theo `docs/gameplay/PHAN-HOI-9-P0B.md` mục 4 + "GỬI CLAUDE" điểm 9, `KE-HOACH-GAMEPLAY-V2.md` mục 5, 7, 8,
`KE-HOACH-VU-KHI.md` mục 3, 4b, 6b, PHAN-HOI-2, 5, 7, 8. **Lần này sửa theo `docs/gameplay/PHAN-HOI-10-P0C-AMDAO-P0B-DEF.md`** mục 1, 2, 5 và "6. ĐOẠN GỬI CLAUDE".

> **Chưa thử trên iPhone thật.** Mọi ảnh / video / số đo là Chromium headless (máy chủ Linux không GPU), người chơi là **bot**.
> Bot đọc trạng thái tinh anh "hoàn hảo" (biết ngay đòn nào đang báo) – số bot chỉ là kiểm chức năng, **không kết luận "người mới sống đủ lâu" hay "cảm giác tiến triển đã đạt"**.

**Không sửa** `game/thu-p0a/`, `game/thu-p0b/` (phiên khác đang đóng băng), `game/thu-bo-vo-moc/`, `game/thu-phong-b/`, `demo.html`, `build-demo.py`, `docs/gameplay/`, ảnh nguồn, rig.
Không publish. Không gen ảnh. Không viết bộ kiểm thử tự động (chỉ script quay video + ghi số / log, không có đạt / trượt).

## Link chơi thử

| Link | Dùng để |
|---|---|
| https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-p0c/index.html | **Người chơi thử** (log nền vẫn thu, không hiện bảng / hộp đòn). Vào phòng **A (điểm lưu)**, đi A → B → C → D → **E (tinh anh)** → **F (đe rèn + hình nộm)** → quay lại E (2 Chuông Gỗ sau rèn). Âm Đao **cấp 1**. **Không bất tử**. Vào E là có **mốc hồi sinh ở đầu E** |
| …/thu-p0c/index.html?vao=e | **Rút gọn**: vào thẳng đầu phòng E (tinh anh). Mốc hồi sinh ở đầu E |
| …/thu-p0c/index.html?vao=f | Vào thẳng phòng F – chỉ để xem đe / hình nộm (chưa có Ấn thì **không** rèn được) |
| …/thu-p0c/index.html?vao=e&hitbox=1&debug=p0c | Bảng log P0-C trên màn + hộp đòn + chữ trạng thái tinh anh dưới chân |
| …/thu-p0c/index.html?nhay=cu | **So nhảy (28/10)**: nhảy CŨ (mặc định = nhảy mềm mới) |
| …/thu-p0c/index.html?cam=phong | **So camera (28/10)**: camera CŨ khoá theo phòng (dính mép phải ở F, nền giữa hoà theo phòng). Mặc định = camera kiểu Dead Cells |
| …/thu-p0c/index.html?vao=e&choang=120 | **BIẾN THỂ (tắt mặc định)**: choáng lần vỡ Thế đầu **120** tick thay 150. Chỉ dùng nếu người thử thấy trận thành "đứng chém quái bất động" |
| …/thu-p0c/index.html?vao=e&tamau=600 | **CHỈ ĐỂ KIỂM** chu trình Thế (tinh anh 600 máu). Mặc định tắt (160) – không dùng khi thử người chơi |

Xuất log sau lượt chơi: ⚙ → **"Xuất log P0-C (lượt này)"**: **chép vào bộ nhớ tạm** (dán vào tin nhắn) và thử tải file .txt.
Điều khiển như trang Âm Đao: chạm **Chém** = đánh thường; ở cấp 3 **giữ Chém ≥ 20 tick rồi thả** = Dư Âm. **V** = Vọng A. Cạnh đe có Ấn: nút **"🔨 Rèn Âm Đao"** (bàn phím **F**).

## Camera kiểu Dead Cells 28/10

Người dùng thấy **"màn hình bị kéo"** khi sang phòng → làm **camera kiểu Dead Cells**. Code camera ở nguồn Âm Đao (`game/thu-p0a/cong-cu/camera-dead-cells.js`,
cách chạy + số: `game/thu-p0a/GHI-CHU-AM-DAO.md` mục **"Camera kiểu Dead Cells 28/10"**), trang này sinh lại bằng `cong-cu/tao-p0c.py` → phiên **`p0c-2810-2c7f3936`**.
`?cam=phong` = camera cũ y nguyên (so từng bước 1591 bước cùng đầu vào: 0 khác). **Luật chơi không đổi** – chỉ camera + vị trí mảnh nền giữa.

**Số dùng**: bám ngang 11 % / bước · nhìn trước 24 px (đứng) → 120 px (chạy hết tốc), quay đầu đổi dần ≈ 1 s · trễ quay đầu 8 bước ·
vùng chết dọc 44 px khi đứng đất, 120 px khi rơi, rơi nhanh nhìn xuống 48 px · bám dọc 6 % / bước · lệch dọc cảm ứng +28.

**Riêng P0-C**
- Camera đi liền **A → F** (một khu: tường trái A ngăn với khu demo cũ; F là cuối thế giới). Kẹp mép thế giới **trùng đúng chỗ camera F cũ dừng** (camx 10624)
  → **bỏ ghi đè dính mép riêng của F** (`camF()` trong bản chép khối phòng B; chỉ còn chạy ở `?cam=phong`). `datCam` (công cụ quay cuộn) dùng trục nền cố định của khu.
- **Phòng E (tinh anh) không khoá camera** – đi theo Lam liên tục như mọi phòng. Luật tinh anh giữ nguyên: chỉ đánh / nhận đòn khi Lam trong E, Lam rời E thì nó về chỗ hồi đầy.
- **Nền giữa đặt lại** (`cong-cu/nen-giua-lien.js`, chèn vào bản chép khối phòng B): bản cũ mỗi phòng một bộ mảnh, hoà theo phần màn phòng đó chiếm – camera mới
  có thể dừng giữa 2 phòng → 2 bộ chồng nhau mờ 50 % (12 mảnh trong dải parallax 2700 px, gần như dính liền). Nay **một dải 7 mảnh, luôn hiện đủ**, đặt theo toạ độ
  parallax liên tục (hệ số 0,4 như cũ): cây A · tháp A cửa sổ vàng (như cũ) · tháp B nén sáng, **lật ngang** cho khác tháp A, sau ván B · cây C · cây phải D (giữa D vẫn tối) ·
  tháp + cây F **y như cũ** ở cuối thế giới. E không còn mảnh riêng (thấy cây D bên trái, tháp F bên phải). Khoảng hở giữa 2 mảnh: 413 / 130 / 110 / 583 / 297 px
  (cặp tháp + cây F chồng 20 px như thiết kế F). Quầng ấm A / F và màn tầm đánh D vẫn hoà theo phần màn (lớp màu, không phải mảnh hình).
- Nền xa lặp soi gương → cuộn liên tục không có đường nối; lệch dọc 0 → 28 vẫn trong ảnh (ảnh cao 570, đặt từ −12).

**Đã kiểm (Chromium headless, bot – chưa thử iPhone)** – công cụ `cong-cu/quay-camera.py` (chỉ quay + ghi số, không đạt / trượt) → `video/camera-dead-cells-2810.json`
- **Video `video/camera-dead-cells-2810.mp4`** (25 s, 1511 bước, **không bất tử**, chế độ cảm ứng): bot chạy liền từ chuông A → B (chém 2 Chuông Gỗ) → C (chém quái gác mở cổng)
  → D (lướt qua Bọ) → E (lướt qua tinh anh) → giữa F. Tới F, không chết; mất 1 máu ở D (Bọ húc), hồi đầy ở chuông F.
- Qua cả 5 ranh phòng (7 lần qua – 2 lần lùi qua lại ranh A|B khi né Chuông Gỗ): camera ở bước qua ranh đi đúng như bước trước (A|B 4,4 · B|C 4,6 · C|D 4,4 · D|E 4,6 · E|F 0,4 px / bước – ở E|F camera đã chạm mép thế giới) → **không còn cú trượt nguyên màn**.
  0 bước camera ra ngoài thế giới (camx 6272 → 10624 = đúng mép A → mép cuối F). Lam trên màn x 145 → 705 / 960.
- **Quái phòng kề trên màn**: Chuông Gỗ B thấy được từ A, tinh anh E thấy từ D… – không quái nào nằm trong màn mà đứng im: chỉ 2 lần **1 bước lẻ** không đếm nhịp
  (bị trúng đòn đặt lại bộ đếm), không có chuỗi ≥ 2 bước. Mọi lần mất máu: quái cùng phòng với Lam (không đánh xuyên ranh).
- **Ảnh nền quét A → F** (12 vị trí, lệch dọc 28): `video/camera-dead-cells-nen-2810.png` – không lộ mép / khe nền, không mảnh chồng mờ.
- **Ranh mảng đất** (`TVPB.soiRanh`): 26 vị trí × 5 tỉ lệ × lệch dọc 0 / 28 → **0 điểm hở**. 0 lỗi trang.

**Cần thử iPhone (chưa làm)**: qua ranh còn cảm giác "bị kéo" không · nhìn trước khi chạy đủ chưa · nền giữa mới có trống quá đoạn C → D không.

## Sửa theo nhận xét iPhone 28/10

Người thử trang này trên iPhone nhận xét: **kiếm quá bé**, **cuối đường chém có vạch kẻ thẳng**, **nhảy lên rơi xuống hơi cứng, nặng**. Sửa ở nguồn Âm Đao (`game/thu-p0a/`), rồi sinh lại trang này bằng `cong-cu/tao-p0c.py` (khối P0-C **không đổi**) → phiên **`p0c-2810-91df6356`**. Chi tiết + số đo + ảnh trước/sau: `game/thu-p0a/GHI-CHU-AM-DAO.md` mục **"Sửa theo nhận xét iPhone 28/10"**.

| Nhận xét | Đã sửa |
|---|---|
| Kiếm quá bé | Lưỡi Âm Đao **×1,48** (17,8 → 26,3 px, ≈ chiều cao thân Lam), lấy lại từ ảnh nguồn nên không nhoè. **Hộp đòn / tầm 90 không đổi** – mũi lưỡi lố hộp tối đa 3 px (nhát 1) |
| Vạch thẳng cuối vệt chém | Do lớp sáng vẽ bằng code (dải "quét âm" + quầng âm nhận) bị **cắt bằng khung chữ nhật của hộp đòn** + vạch đồng đặt ở mép hộp. Nay: tắt dải quét, quầng mờ dần về 0 trước mép, bỏ vạch mép; ảnh vệt chém tan mềm về 0. Vị trí vệt giữ như PH8 |
| Nhảy cứng, nặng | Lên nhanh hơn (vận tốc bật 11,97 → 13,46), treo đỉnh lâu hơn (trong 8 px quanh đỉnh 11 → 15 tick), rơi tăng tốc mượt tới trần (không gãy). Đỉnh 118,4 → 127,8 px (+7,9 %). Mọi bệ phòng A–F vẫn tới được (quỹ đạo mới luôn cao hơn/bằng cũ khi rơi qua mọi độ cao); nhảy tường, nảy vẫn chạy |

- **So nhảy cũ**: thêm `?nhay=cu` vào link (vd. `…/thu-p0c/index.html?vao=e&nhay=cu`). `?quet=1` = bật lại dải quét âm cũ để so.
- Video ngắn (không bất tử, chạy – nhảy – chém, trang Âm Đao): `game/thu-p0a/video-am-dao/2810/2810-chay-nhay-chem.mp4`.
- Đã tải P0-C trong Chromium cả mặc định lẫn `?nhay=cu`: 0 lỗi trang. **Chưa thử iPhone.**

## Sửa theo phản hồi 10

### Đã làm

| # | Yêu cầu PH10 | Đã làm |
|---|---|---|
| chốt | Giữ: cấp 3 gồm +20 % cấp 2 · chạm thân chỉ đẩy, húc vẫn đau · choáng 150 · Lam chết → tinh anh hồi đầy · E không cổng · Vọng tạm A · chưa gen Ấn | Giữ nguyên. Rèn xong: chữ lớn **"Đánh thường mạnh hơn · Mở Dư Âm"** + chữ nổi "Âm Đao cấp 3" trên đe, sau 1,6 s nhắc "Giữ Chém rồi thả = Dư Âm · thử vào hình nộm". **`?choang=120`** thêm làm biến thể tắt mặc định (một dòng cấu hình) |
| 1 | Log đối chiếu ID tinh anh | **Mọi dòng về tinh anh** trong log P0-C có tiền tố `[Chuông Gỗ#7 \| elite:chuong-go-gac-lon \| Chuông Gỗ Gác Lớn]` = enemyId (đúng tên `Chuông Gỗ#7` mà log P0-A `?debug=input` dùng – chỉ số trong mảng quái) · loại elite · tên hiển thị. Dòng **VÁN MỚI** ghi bảng đối chiếu (tinh anh = Q[7]; Chuông Gỗ sau rèn = #8, #9; hình nộm F = #10). Tóm tắt xuất log có `ta.enemyId / elite / ten`. Bảng log trên màn (hẹp) chỉ ghi `#7`. Ví dụ cùng frame: P0-A `f149 → Chuông Gỗ#7 tick này: máu −10 (160 → 150)` ↔ P0-C `f149 [Chuông Gỗ#7 \| …] tinh anh: máu 160 → 150` |
| 2 | Báo đòn: bỏ vàng, phân biệt bằng tư thế | **ĐẬP**: **giơ tay cao** (tay trước giơ quá đầu) + **vươn người** (cao 6 %) + lóe **hổ phách ngả cam** `#F0882A` + dấu "!" cùng màu + ting. **HÚC**: **rụt người** (thấp 14 %, bè 8 %, cúi đầu, tay ôm sát) + **mũi tên » trước ngực chỉ hướng lao** (dời từ trên đầu xuống – trên đầu bị tên tinh anh che) + lóe **đỏ** `#E5432E` + bụi chân + tiếng trầm. Ánh nền thường của tinh anh đổi từ vàng đồng sang đồng sẫm `#9A6A44` (vàng ấm chỉ còn cho dẫn đường / an toàn: nút Rèn, Ấn, điểm lưu). Gợi ý chữ: "Giơ tay = sắp đập · lùi ra hoặc lướt", "Rụt người + » = sắp húc · lùi xa hoặc lướt xuyên" |
| 3 | Lướt xuyên thân lớn | **Có lỗi, đã sửa trước** (số đo dưới). Luật mới: lướt mà **chạm thân lúc còn miễn sát thương của lướt** → **giữ miễn tới khi ra khỏi thân**; hết lướt mà còn trong thân → **đẩy tiếp theo hướng lướt 7 px/tick** (không kéo ngược về chỗ cũ); hướng lướt bị tường chặn → đẩy ra phía kia; tối đa 40 tick; ra khỏi thân → thêm 4 tick miễn. Lướt **quá sớm** (hết lướt + hết miễn trước khi chạm) **vẫn trúng** – không thành "lướt luôn an toàn". Chạm thân thường: đẩy ra **tới mép thân** (≤ 6 px/tick, nhanh hơn chạy 4,4) thay vì 2,5 px/tick – không còn đi chậm xuyên qua thân; hướng đẩy chọn một lần và giữ (không lật mỗi tick); phía gần có tường → đẩy sang phía kia |
| 4 | Luật rời E khi đang đánh | Lam ra khỏi E (sang **F** hoặc **D**) khi tinh anh đang thức / đánh → tinh anh **ngừng ngay** (huỷ cả đòn đang báo / đang lao), **không truy đuổi** (vẫn chỉ trong sân cột 3–27), **đi về chỗ** (cột 19, 1,6 px/tick), tới nơi **HỒI ĐẦY máu + Thế** ("Hồi đầy" nổi trên đầu) rồi ngủ gác; Lam vào lại E → thức lại. Vào lại **trước** khi nó về tới → đánh tiếp với máu hiện có (chưa hồi). Chữ báo: "Rời sân · tinh anh về chỗ, hồi đầy". **Không đánh được từ vùng an toàn**: khi Lam ở ngoài E tinh anh **không nhận đòn nào** (đòn Lam, chém vang, vết Dư Âm vang muộn, bóng Vọng). **Không đòn nào lọt vào F**: đòn của tinh anh chỉ tính khi Lam ở trong E (vị trí thật, không trễ 1 bước) |
| 5 | Trạng thái tiến trình | Kiểm từng ca (video 3, `log-debug-trang-thai.txt`). Sửa thêm: **rèn đúng MỘT lần** (`REN.lan`, bấm lại → ghi log "không rèn lặp, không thưởng thêm"); **ván mới đặt lại cấp 1** (bản trước: tạo ván mới sau khi rèn thì Ấn mất mà cấp 3 vẫn giữ). **Mảng sáng ấm nhẹ** hình elip trên sàn quanh đe (rõ hơn, nhịp chậm khi rèn được) |
| 6 | Hồi sinh gần E | **Mốc hồi sinh ẩn ở đầu E** (cột 1): vào E là đặt (chữ "Mốc hồi sinh: đầu sân tinh anh"), trừ khi đã lưu ở chuông F (sau E). Không phải chuông: **không hồi máu khi chạm** (không thành chỗ hồi máu giữa trận). Hồi sinh: "Hồi sinh ở đầu sân tinh anh". Tinh anh cách mốc ≈ 600 px > 560 → hồi sinh xong nó vẫn ngủ |
| 7 | Đoạn ngắn sau rèn | Dùng lại phòng / quái có sẵn, không dựng vùng mới: **(a)** **hình nộm** (cùng hình nộm phòng A, 999 máu, bảng số trên đầu) ở **F cột 11** – sau đe, sát tường cuối, chỗ an toàn; gợi ý "Thử: giữ Chém rồi thả vào hình nộm". **(b)** Rèn xong **quay lại E** → **2 Chuông Gỗ thường** (40 máu, đúng loại đã gặp ở B; `Chuông Gỗ#8`, `#9`) ra sân E (ngoài F), cột 5–13 và 17–25. **(c)** Chuông Gỗ có nhịp rõ: lóe báo 30 tick → đập → **hồi 26 + nghỉ 60 tick** – đủ để né rồi giữ 20 tick + thả Dư Âm; gợi ý lúc nó hồi: "Nó đang hồi · giữ Chém rồi thả". Không đặt quái nhiều máu |
| 8 | Video không bất tử | Video 1–2 **không** `?battu=1`. Video 3 debug riêng cho các ca trạng thái (và lướt / rời E / mốc hồi sinh) |

### KIỂM BẰNG CODE (Chromium headless, bot)

| Kiểm | Kết quả |
|---|---|
| Trang sinh đúng | `tao-p0c.py`: 18 chỗ thay của phòng B + **9** chỗ riêng P0-C trên trang Âm Đao (thêm 1: `P0.thuThap` bỏ qua mục tiêu `khongDanh()` – chỉ tinh anh có) + 2 + 5 chỗ trên bản chép – khớp đủ. Lỗi trang **0** ở mọi lần chạy |
| **Lướt xuyên – TRƯỚC sửa** (đo trên bản cũ, cùng cách đo) | Húc đối đầu ở giữa sân, Lam cách 150 / 200 / 250 px: chỉ lướt khi khe hở **3–25 px** mới qua (≈ 1–2 tick); lướt sớm hơn **2–4 tick (khe 36–77 px) → TRÚNG** lúc vừa hết 11 tick miễn mà còn mắc trong thân (thân 108 + vùng ăn đòn Lam 40 = 148 px > lướt 88 px). Khe 25 px mà không giữ phím tiến → cũng trúng |
| **Lướt xuyên – SAU sửa** (`video/do-luot-day.json`, 72 lần) | Cách 150 / 250 px: lướt ở **mọi khe 1–159 px → qua, 0 lần trúng** (có giữ hoặc không giữ phím tiến); miễn được giữ thêm 0–11 tick (lướt đúng lúc: 0 – không đổi gì). Cách 400 px: khe 95–160 → qua; khe ≤ 80 → húc dừng (hết 36 tick) trước khi tới, không chạm. Khe 0 (đã chạm rồi mới lướt) → **trúng** (đúng) |
| Lướt – mép sân | Tinh anh lao về mép trái sân (cột 3), Lam đứng sát mép: khe 1–99 px → qua cả 4 lần |
| Lướt – sát tường | Tường giả cột 0–2 của E sau lưng Lam (E thật không có tường trong tầm thân tinh anh): khe 1–99 px → qua cả 4 lần (trong thân 8–10 tick). Tường **ngay sau thân** tinh anh, Lam lướt vào phía tường: đổi hướng đẩy ra phía kia, không trúng; nếu Lam **cố giữ phím vào tường** thì hết 40 tick giữ miễn, sau đó đẩy thường đưa ra ngoài – không kẹt |
| Lướt quá sớm vẫn trúng | Video 3 ca 3b: lướt ngay khi húc vừa lao (khe ≈ 250 px) → hết lướt + hết miễn trước khi chạm → trúng (máu 5 → 4) |
| Đẩy chạm thân | Bản cũ: đẩy 2,5 px/tick < chạy 4,4 → **đi chậm xuyên qua thân** (≈ 60 tick). Bản mới: đi vào thân từ trái / phải → dừng đúng mép (tâm cách 64 px), **0 lần đổi chiều** trong 120 tick (không rung). **Ép giữa tường giả và thân**: bản nháp đầu bị **rung 0 ↔ 6 px mỗi tick** (đẩy vào tường bị chặn rồi đẩy ngược) – đã sửa bằng chọn hướng một lần + giữ; giờ đẩy sang phía kia, ra khỏi thân sau ≈ 16 tick, 0 lần đổi chiều, không mất máu |
| Rời E khi đang đánh | Video 3 ca 4 (DEBUG: cấp 3, tinh anh 120 máu): Dư Âm trúng (120 → 93), lướt sang F. f46 "Lam RỜI sân E … NGỪNG đánh, không truy đuổi, về chỗ"; **vết Dư Âm vang lúc Lam đã ở F → HỤT** "(Lam ở ngoài E → tinh anh không nhận đòn)", máu giữ 93; chém về phía E từ F: không trúng; f105 "VỀ TỚI chỗ → HỒI ĐẦY 160 máu, Thế 80/80 → ngủ gác"; vào lại E → thức, 160 máu |
| Không đòn lọt vào F | Đòn tinh anh chỉ tính khi Lam ở trong E; ngoài ra hình học: hộp đập vươn tối đa 81 px ngoài mép phải sân (cột 27) → dừng 15 px trước F |
| Mốc hồi sinh E | Ca 6: đang lưu ở chuông A, đi D → E → log "MỐC HỒI SINH = đầu sân E"; ngã → hồi sinh ở x 10160 (đầu E), tinh anh ngủ, đầy máu |
| Tinh anh chết → Lam ngã trước khi nhặt | Ca 5a: "LAM NGÃ … Ấn: còn trên đất ở x 10774 (giữ)" → hồi sinh mốc E → đi lại nhặt được |
| Đã nhặt rồi ngã | Ca 5b: "Ấn: ĐÃ NHẶT (giữ)"; sang F → nút Rèn hiện |
| F không tự rèn | Ca 5c: đứng cạnh đe có Ấn **150 tick** → vẫn cấp 1 (nút hiện, chưa bấm); bấm F → cấp 3. Luồng chính: đứng 40 tick, cấp 1, rồi mới bấm |
| Rèn rồi quay lại | Ca 5d: ra xa, quay lại, bấm F **2 lần** → cấp 3, `REN.lan` 1, log 2 dòng "không rèn lặp"; nút Rèn không hiện lại |
| Rời phòng khi Ấn trên đất | Ca 5e: sang F rồi quay lại E → Ấn còn → nhặt. Ca 5e′: sang D rồi quay lại E → Ấn còn → nhặt |
| **Luồng người chơi, không bất tử** (video 1–2, `log-luong-nguoi-choi-*.txt`) | Bot chỉ đánh thường, cấp 1: 2 húc đều **lướt xuyên** (giữ miễn thêm tổng 7 tick), 3 đập đều né; **Lam bị đánh 0, không ngã**; vỡ Thế f530 → choáng 150; hạ tinh anh **f809**; nhặt Ấn f847; tới đe f966, đứng 40 tick (cấp 1); rèn **f1008**; hình nộm: đòn chạm 12 + chém vang 15 + vết 10 = 37 (f1159); vào lại E f1302 → 2 Chuông Gỗ; né đập → **Dư Âm trong lúc hồi** 2 lần (f1402, f1612; chém vang + vết đều trúng); hạ #9 f1445, #8 f1655. 1773 hình; trang sạch / debug lệch **0** bước. Bot đọc trạng thái hoàn hảo nên không bị đánh – **không nói lên người mới** |
| `?choang=120` | Cùng bot, không video: vỡ Thế f530 → "CHOÁNG 120 tick", hạ f793 (mặc định 150: f809). Log VÁN MỚI ghi "choáng 120 (BIẾN THỂ ?choang=120)" |
| Màu / tư thế báo đòn | Ảnh trích video 1: đập = tay giơ quá đầu + vươn + lóe cam; húc = thấp bè, đỏ, » trước ngực. Không còn vàng trên tinh anh |

### CẦN THỬ IPHONE (chưa làm – không đánh dấu đạt)

| Câu | Cần gì |
|---|---|
| Đọc hai đòn bằng tư thế | Không giải thích trước: người thử có phân biệt **giơ tay = đập gần** / **rụt người + » = húc lao xa** không, sau mấy lần bị trúng. Lóe cam (đập) và đỏ (húc) có lẫn nhau trên màn iPhone không (không được dựa vào màu) |
| Lướt xuyên | Lướt sớm một chút vẫn qua – có thấy "ăn gian" / quá dễ không; lướt quá sớm bị trúng có hiểu vì sao không. Bị đẩy theo hướng lướt khi còn trong thân có thấy giật không |
| Chạm thân | Đứng sát thân bị chặn ở mép (không đi xuyên được nữa, phải lướt) có thấy cứng / kẹt không; có rung trên Safari không |
| Rời E | Người thử có chạy sang F để hồi rồi quay lại không; chữ "Rời sân · tinh anh về chỗ, hồi đầy" có đọc kịp không; có thấy bị phạt oan không |
| Mốc hồi sinh | Chết ở E hồi sinh đầu E – có thấy hợp lý, có cần dấu hình trên sàn không (hiện chỉ có chữ báo) |
| Sau rèn | Có tự đến hình nộm thử giữ–thả không; với 2 Chuông Gỗ có chủ động chờ nó hồi để dùng Dư Âm không, có nói được đánh thường mạnh hơn không (12 so với 10) – KHVK 10a câu 3 |
| Choáng 150 | Lần vỡ Thế đầu: có dồn hết máu trong lúc choáng, trận có thành "đứng chém quái bất động" không – nếu có mới so `?choang=120` (lượt riêng, không ghép) |
| Đe | Mảng sáng ấm trên sàn có thấy không (đang để nhẹ); nút / nhãn "RÈN" đủ rõ |
| Ấn Rèn | Ấn cao 24 px có thấy giữa đống vụn tinh anh không (chưa gen ảnh mới – PH10 chốt 6) |
| Hiệu năng | Tinh anh vẽ qua canvas phụ ≈ 360 × 290 × tỉ lệ màn mỗi khung + giờ thêm co giãn khi báo – đo khung hình Safari |

## Phần đã có từ bản đầu (vẫn đúng)

| # | Nội dung |
|---|---|
| 0 | Trang sinh bằng `cong-cu/tao-p0c.py`: nền = `thu-p0a/am-dao.html` (bản PH8) + bộ đất / phòng D–F của `thu-phong-b` (đọc danh sách chỗ thay bằng AST, không chạy script đó) + bản chép khối phòng B / Bọ + khối riêng `cong-cu/khoi-p0c.js`. Mỗi chỗ thay phải khớp đúng số lần – nguồn đổi thì script dừng và báo |
| 1 | Tinh anh "Chuông Gỗ Gác Lớn" = Chuông Gỗ biến thể: cùng rig + clip, phóng ×1,5 (thân 108 × 162), tô màu gỗ sơn sẫm. [160 máu, Thế 80], `THE_TINH_ANH` (hồi khi không bị đánh, vỡ → choáng → hồi phục → ổn định, chống chuỗi choáng ×0,6 / ×0,4). Nặng: đòn thường không làm khựng; chỉ vỡ Thế mới huỷ đòn |
| 1a–c | ĐẬP: báo 30, hộp ×1,5 tick 5–10, hồi 34. HÚC: báo 36, lao 6,5 px/tick ≤ 36 tick, hồi 46. Sau 2 đập liên tiếp: lùi lấy đà rồi húc |
| 2 | Ấn Rèn I (`p0c/an-ren-2x.png`, cao 24 px): rơi, nảy, quầng ấm, chạm để nhặt (sau 18 tick), bay về HUD. Không tiêu hao |
| 3 | Đe 2 trạng thái (nguội / đang rèn) của phòng B. Có Ấn + đứng ≤ 80 px: nút Rèn + nhãn "RÈN" trên đe |
| 4 | Vọng tạm A + sửa PH9 (mẫu cuối xử lý đủ, bóng nghỉ không hộp). Đổi phòng / chết → xoá bóng |
| 6 | Log nền P0-C luôn thu (6000 dòng) |

## Thông số (số thử, thang ×10, tick = 1/60 s)

| | Số | Ghi chú |
|---|---|---|
| Tinh anh máu / Thế | **160 / 80** | `?tamau=N` chỉ để kiểm |
| Thế tinh anh | `THE_TINH_ANH`: choáng **150** (`?choang=120` biến thể tắt mặc định), hồi phục 20, ổn định 120, chờ 90 rồi +1 / 3 tick, chống chuỗi ×0,6 / ×0,4 (tối thiểu 45) | |
| Đập | báo 30 (giơ tay + lóe `#F0882A` + "!") · hộp tick 5–10 · hồi 34 · nghỉ 34 · tầm < 175 px | |
| Húc | báo 36 (rụt người 14 % / bè 8 % + » trước ngực + lóe `#E5432E`) · lao 6,5 px/tick ≤ 36 tick · hồi 46 · nghỉ 150 · tầm 150–440 px | |
| Chạm thân | đẩy ra **tới mép thân, ≤ 6 px/tick**, không sát thương; hướng giữ tới khi hết chồng; sát tường → phía kia | PH10 chốt 2 |
| Lướt xuyên | chạm thân lúc còn miễn của lướt → giữ miễn tới khi ra; đẩy theo hướng lướt **7 px/tick**, tối đa **40 tick**, ra rồi **+4 tick** | Lướt: 8 tick × 11 px, miễn 11 tick (không đổi) |
| Rời E | về chỗ **1,6 px/tick**, tới nơi hồi đầy máu + Thế, ngủ gác; thức lại khi Lam trong E cách ≤ 560 px | |
| Mốc hồi sinh | E cột 1 (ẩn, không hồi máu) | Chuông F (sau E) được ưu tiên nếu đã lưu |
| Sau rèn | hình nộm F cột 11 (999 máu); 2 Chuông Gỗ 40 máu ở E cột 9 (tuần 5–13) và 21 (17–25); Chuông Gỗ: báo 30, hồi 26, nghỉ 60 | Không đổi số Chuông Gỗ |
| Âm Đao cấp 3 | đánh thường **12** (nhát 3 [12, 30]), Dư Âm: chém vang [15, 20], vết [10, 10], giữ 20 tick, hồi 150 | Gồm +20 % cấp 2 (chốt PH10) |

## Video (`video/`, 60 hình/s, mỗi hình = 1 bước logic, H.264 `-preset veryfast`)

| File | Nội dung |
|---|---|
| `1-sach-luong-nguoi-choi-khong-bat-tu.mp4` / `2-debug-…` | `?vao=e`, **không bất tử**: tinh anh (chỉ đánh thường) → Ấn → F (đứng cạnh đe 40 tick, bấm Rèn) → hình nộm (giữ–thả Dư Âm) → quay lại E: 2 Chuông Gỗ, né rồi Dư Âm lúc nó hồi. Bản debug thêm `?hitbox=1&debug=p0c`. 1773 hình. Dòng chữ dưới: việc bot đang làm + máu Lam |
| `3-debug-trang-thai-luot-roi-E-hoi-sinh-an-de.mp4` | Một trang debug, từng ca dựng bằng lệnh debug (tên ca ở góc dưới trái): 3a lướt sớm · 3b lướt quá sớm · 4 rời E (+ vết vang lúc ở F) · 6 mốc hồi sinh · 5a chết trước khi nhặt · 5b nhặt rồi chết · 5c đứng cạnh đe không tự rèn · 5d rèn lặp · 5e / 5e′ rời phòng khi Ấn trên đất |
| `log-luong-nguoi-choi-*.txt`, `log-debug-trang-thai.txt` | Log P0-C từng dòng |
| `do-luot-day.json` | Số đo lướt xuyên (đối đầu / mép sân / sát tường) + đẩy chạm thân |
| `ket-qua.json` | Tóm tắt luồng (mốc bot, log P0-A dòng `Chuông Gỗ#7`), kết quả từng ca, `?choang=120` |

Bản video cũ (`?battu=1`, `?tamau=600`) đã bỏ – chu trình Thế không đổi code từ bản trước.
Quay lại: `python3 -B game/thu-p0c/cong-cu/quay-p0c.py` (≈ 10 phút; thêm `do`, `choang`, `trang`, `luong` để chạy riêng phần đó, `--khong-video` để chỉ ghi số).

## Câu hỏi bản trước – đã chốt ở PH10

1. Cấp 3 gồm +20 % cấp 2 → **giữ**, thông báo "Đánh thường mạnh hơn · Mở Dư Âm". 2. Chạm thân chỉ đẩy → **giữ**, húc vẫn đau. 3. Choáng → **150**, 120 là biến thể phụ.
4. Chết hồi đầy, E không cổng → **giữ** + luật rời E (ở trên). 5. Vọng B → **chờ** kết quả iPhone A/B. 6. Gen Ấn → **chưa**. 7. Log → **đối chiếu ID** (ở trên).

Không còn câu hỏi mới bắt buộc. Một điểm để ý khi thử: luật lướt xuyên mới khá rộng tay (lướt sớm ≈ 2–9 tick vẫn qua khi tinh anh đang lao tới) – nếu người thử thấy húc quá dễ né, có thể thu lại (vd chỉ giữ miễn khi chạm thân trong 8 tick đầu của lướt) ở lượt sau, không đổi giữa buổi.

## Tập tin

- `index.html` – trang thử (SINH RA, không sửa tay). `p0c/an-ren-2x.png/.json` – ảnh Ấn Rèn I.
- `cong-cu/tao-p0c.py` – sinh trang. `cong-cu/khoi-p0c.js` – khối P0-C. `cong-cu/tao-asset-p0c.py` – cắt ảnh Ấn.
- `cong-cu/quay-p0c.py` – quay video + ghi số. `cong-cu/do-luot-day.js` – đo lướt xuyên / đẩy chạm thân (chạy trong trang, chỉ ghi số).
- Khi `thu-p0a/am-dao.html`, `thu-phong-b`, khối Bọ đổi: chạy lại `python3 game/thu-p0c/cong-cu/tao-p0c.py`.
