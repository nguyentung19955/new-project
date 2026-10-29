# Trang thử Âm Đao cấp 1–4 (trên P0-A) – 27/10/2026 theo phản hồi 6, sửa 28/10/2026 theo phản hồi 7, 8, nhận xét iPhone 28/10 và camera kiểu Dead Cells 28/10

Viết cho người không rành kỹ thuật. Làm theo `docs/gameplay/PHAN-HOI-6-BO-BAN-3-VA-AM-DAO.md`, `KE-HOACH-VU-KHI.md` mục 2d, 3, 4b, 5, 7a, 8, 10,
`KE-HOACH-GAMEPLAY-V2.md` mục 3, 5, 6. **Trang con riêng** `am-dao.html`; bản P0-A gốc `index.html` **giữ nguyên** để so.
**Không sửa** `game/demo.html`, `build-demo.py`, `game/thu-bo-vo-moc/`, ảnh nguồn, rig. Không publish. Chưa ghép vào game chính.

## Link chơi thử

| Link | Dùng để |
|---|---|
| https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-p0a/am-dao.html | **Người chơi thử trên iPhone** (log + hộp đòn TẮT). Vào cấp 1. Đổi cấp: ⚙ → nút **"Âm Đao cấp N – bấm để đổi"** (1→2→3→4→1) |
| …/am-dao.html?cap=3 | Vào thẳng cấp 3 (cấp 1–4) |
| …/am-dao.html?debug=input&hitbox=1 | Log (lần bấm, giữ Chém, kỹ năng, vết, trúng) + lớp hộp đòn (đỏ = đang gây sát thương; cam đứt = vết Dư Âm đang chờ vang) |
| …/am-dao.html?pogo=moi | **Biến thể thử PH8**: hộp nảy theo đường bổ xuống `[−2,−24,48,82]`. Mặc định giữ hộp cũ `[−26,−24,64,82]` |
| …/am-dao.html?cap=3&giu=16 | **Biến thể thử PH8**: ngưỡng giữ Dư Âm 16 tick (nhận 15/16) thay 20; hồi + sát thương giữ nguyên. Mặc định tắt |
| …/am-dao.html?nhay=cu | **So nhảy (28/10)**: số + công thức nhảy CŨ. Mặc định = nhảy mềm mới |
| …/am-dao.html?cam=phong | **So camera (28/10)**: camera CŨ khoá theo phòng. Mặc định = camera kiểu Dead Cells |
| …/am-dao.html?quet=1 | **So vệt (28/10)**: bật lại dải "quét âm" PH7 (đã làm mờ dần về mép). Mặc định tắt |
| …/am-dao.html?cg=36 | **Chỉ là biến thể thử** (KHVK 4b): Chuông Gỗ máu 36. **Mặc định và số chính thức: 40** (PH7 chốt) – không đưa 36 vào game chính |
| https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-p0a/index.html | Bản **P0-A gốc** (dao placeholder) – nhịp MỚI. Thêm `?p0=0` = nhịp CŨ, **cùng dao** (dùng để so độ nhạy – mục PH7-9) |

> **Thay đổi luật (pogo tự động, xuống + Chém, kẹp rơi) ghi RIÊNG ở mục "Thay đổi luật" bên dưới (PH14).**

Điều khiển: chạm **Chém** = đánh thường (luôn ra ngay). **Giữ Chém ≥ 20 tick (⅓ giây)** ở cấp 3–4 = **Dư Âm**. Phòng A hình nộm → B hai Chuông Gỗ → C quái gác (giống P0-A).

## Thay đổi luật (ghi riêng, có phiên bản) – PH14 mục 7.1

Thay HÌNH (tư thế, vệt, móc, mép, cổng) **không** đổi luật. Các dòng dưới đây là **đổi LUẬT / INPUT / VẬT LÝ** – hộp đòn giữ nguyên **không** có nghĩa gameplay giữ nguyên.
Kết quả thử trước và sau một phiên bản luật **không gộp** như cùng một build.

| Phiên bản | Từ | Nội dung | Ở đâu trong code | Cờ so |
|---|---|---|---|---|
| **LUẬT-RƠI v1** | trước 29/10 | Bấm Chém lúc đang rơi mà có quái / hình nộm ngay dưới chân → game TỰ đổi thành chém nảy (pogo tự động, `P.autoPogo`), **mỗi lần**; không kẹp tốc độ rơi khi chém trên không | — | `?roi=cu` |
| **LUẬT-RƠI v2** | 29/10 (commit c730a97 "Sửa iPhone 29/10") | (1) **Pogo tự động chỉ 1 lần mỗi lần rời đất / nhảy tường** (nảy pogo không trả lại lượt); sau đó Chém trên không = chém thường, rơi theo trọng lực. (2) **Xuống + Chém** = pogo CỐ Ý, nảy như cũ, không giới hạn (phím ↓, hoặc cần gạt chúc xuống quá ~45°; chỉ hơi chúc không tính). (3) **Kẹp rơi lần chém đầu**: lần chém trên không ĐẦU mỗi lần rời đất / nảy pogo / nhảy tường – 6 bước đầu đòn, tốc độ rơi ≤ 1,2 px/bước (chỉ khi đang rơi); các lần sau rơi bình thường | `cong-cu/khoi-am-dao.js` khối `ROI` → `am-dao.html` | `?roi=cu` = v1 |

**Trang nào dùng luật nào** (cập nhật PH14, 29/10):

| Trang | Luật rơi | Ghi chú |
|---|---|---|
| `thu-p0a/am-dao.html` | v2 | nguồn của luật |
| P0-C `thu-p0c/` (phiên `p0c-2910-e9cba386`) | v2 | Lam cũ |
| P0-B `thu-p0b/` – đóng băng lần 4 `p0b-2910-e8aa09dc` trở đi (hiện lần 6 `p0b-2910-6941b504`) | v2 | Lam cũ; lần 1–3 (`p0b-2810-*`) là **v1** – log cũ không gộp với log mới |
| Lam mới 2 `thu-lam-moi-2/` | v2 | |
| **P0-C Lam mới** `thu-p0c-lam-moi/` (phiên `p0cLM-2910-*`) | v2 | bản tích hợp riêng PH14 |
| Phòng B `thu-phong-b/`, P0-A gốc `thu-p0a/index.html` | **v1** | sinh từ P0-A gốc, không có khối ROI |

Cần thử iPhone (chưa làm): nút xuống + Chém (pogo cố ý) trên cảm ứng, cần gạt chéo có bị nhận nhầm, bấm Chém liên tục trên quái có còn thấy "treo".
Đợt PH14 (móc, vệt, mép, cổng, chết tạm, sóng pogo) **không thêm thay đổi luật nào**.

## Camera kiểu Dead Cells 28/10

Người dùng thấy **"màn hình bị kéo"** khi sang phòng: camera cũ khoá trong từng phòng (Lam tới mép phòng thì camera đứng, qua ranh thì camera trượt nguyên
một màn + nền trôi theo vì trục nền `S.rc` nhảy theo tâm phòng). Yêu cầu: **làm camera kiểu Dead Cells**. Sửa ở nguồn `game/thu-p0a/`:
code camera mới ở **`cong-cu/camera-dead-cells.js`**, chèn vào trang bằng 3 chỗ thay trong `cong-cu/tao-am-dao.py` (sau `roomAt()`, trong `placePlayer()`,
trong `step()`), rồi sinh lại `am-dao.html` → **P0-C** (`thu-p0c/cong-cu/tao-p0c.py`) và **P0-B** (`thu-p0b/cong-cu/tao-p0b.py`, đóng băng lần 3).
`index.html` (P0-A gốc), `demo.html` **không đổi**. **`?cam=phong`** = camera cũ y nguyên để so.

**Cách camera chạy bây giờ**

- **Ngang – đi theo Lam liên tục** qua các phòng nối liền, **không khoá theo phòng**. Chỉ kẹp ở **mép thế giới**: trang tự tìm các "khu" = chuỗi phòng liền nhau;
  ranh phòng bị tường đặc bịt kín cả chiều cao thì tách khu (vd. tường trái phòng A ngăn với phòng boss cũ) → camera **không bao giờ lộ ra ngoài bản đồ**.
  Khu ở trang này: A → C (Khởi đầu → Hành lang gác); P0-B: A → D; P0-C: A → F.
- **Bám ngang mềm**: mỗi bước camera đi **11 %** quãng còn lại tới đích (≈ 0,35 s đuổi kịp).
- **Nhìn trước (look-ahead) theo hướng chạy**: đứng **24 px**, chạy hết tốc **120 px**. Mức "đang chạy" tăng 0,04 / bước (≈ 0,4 s), giảm 0,02 / bước (≈ 0,8 s), đường cong mềm (smoothstep).
  Look-ahead đi 8 % quãng còn lại mỗi bước, tối đa 4 px / bước → **quay đầu khi đang chạy: đổi dần ≈ 1 s**, không giật.
- **Chống rung khi bấm qua lại**: phải giữ hướng mới **8 bước (≈ 0,13 s)** thì hướng nhìn mới đổi.
- **Dọc – vùng chết**: nhảy thường **không** kéo camera. Mốc dọc chỉ đổi khi Lam **đứng** lên mặt đất cao / thấp hơn mốc **> 44 px** (hơn 1 ô), hoặc **rơi xa hơn 120 px**
  dưới mốc; rơi nhanh (vy > 7) → nhìn xuống trước tối đa **48 px**. Bám dọc 6 % / bước. **Giữ lệch +28 cho cảm ứng** (nút không che nhân vật).
  Thế giới cao 17 ô = 544 px, gần bằng màn 540 → dọc chỉ dịch được trong **0 → 28 px** (cảm ứng) hoặc 0 → 4 px (bàn phím) để không lộ ngoài bản đồ:
  đứng lên ván cao (vd. ván phòng D, cao hơn sàn 160 px) camera nâng 28 → 0, xuống sàn trở lại 28 trong ≈ 1 s.
- **Boss thật** (phòng "Chuông Gác Làng" của demo cũ, chỉ có ở khu cũ): khi boss đang đánh và Lam trong sân boss → **khoá trong sân boss như cũ**
  (đo: boss thức → camx 5312 = mép sân, đứng yên suốt trận). **Tinh anh không khoá** (P0-C phòng E).
- **Nền (parallax)**: trục `S.rc` **cố định trong khu** (= trục giữa phòng đầu khu) → nền xa / giữa cuộn **liên tục** theo camera, không nhảy theo tâm phòng.
  Nền của trang này (lớp lặp) vốn đã theo camera, không cần chỉnh; nền giữa từng mảnh của P0-C: xem `thu-p0c/GHI-CHU.md`.
- **Giữ nguyên luật** (chỉ camera đổi): `S.room` / đổi phòng (log đổi phòng, huỷ kỹ năng khi đổi phòng, xoá chỗ chờ, xoá bóng Vọng B), quái, va chạm.
  Quái thường đã chỉ "đứng yên khi xa Lam > 1152 px" (không theo phòng) → mọi quái nằm trong màn (cách Lam ≤ ~600 px) đều được cập nhật.
- Lỗi cũ tiện thấy: camera cũ ở phòng A (24 ô, hẹp hơn màn) có lúc lộ ~190 px phòng boss bên kia tường trái A (đo camx 6085 < mép A 6272). Camera mới hết.

**Đã kiểm (Chromium headless, bot – chưa thử iPhone)**

- `?cam=phong` **trùng khít** bản cũ: cùng đầu vào, so từng bước camx / camy / trục nền / vị trí Lam → 0 bước khác (P0-C 1591 bước, P0-B 900 bước, trang này 600 bước).
- Qua ranh mọi phòng (P0-C A → F): camera đi **đúng tốc độ chạy (4,4 px / bước)** cả bước trước lẫn bước qua ranh – không còn cú trượt nguyên màn.
  Lam trên màn khi chạy phải: x ≈ 396 / 960 (nhìn trước 84 px); đứng: ≈ 456. Camera trong suốt lượt: 0 bước ra ngoài thế giới.
- Bấm trái / phải luân phiên mỗi 4 bước: hướng nhìn không lật theo (camera xê dịch ≤ 2,7 px / bước).
- Ranh mảng đất nướng (cách soi `TVPB.soiRanh` của thu-phong-b B3.2) ở 26 vị trí camera lẻ × 5 tỉ lệ (1 / 1,5 / 2 / 2,17 iPhone / 3) × lệch dọc 0 / 28: **0 điểm hở**.
- 0 lỗi trang ở `am-dao.html`, P0-B, P0-C (mặc định và `?cam=phong`). Video + số: `thu-p0c/video/camera-dead-cells-2810.*` (xem `thu-p0c/GHI-CHU.md`).

**Cần thử iPhone (chưa làm – không đánh dấu đạt)**: qua ranh phòng còn thấy "bị kéo" không; nhìn trước 120 px khi chạy có đủ / quá; quay đầu ≈ 1 s có chậm quá;
đứng lên ván cao camera nâng 28 px có khó chịu; nền giữa P0-C (đặt lại) có trống / dày chỗ nào.

## Sửa theo nhận xét iPhone 28/10

Người chơi thử P0-C trên iPhone nhận xét 3 điều: (1) **kiếm quá bé** (trông như dao găm), (2) **chém xong cuối đường chém có vạch kẻ thẳng** (như bị cắt sai), (3) **nhảy lên rơi xuống hơi cứng, nặng**.
Sửa ở nguồn `game/thu-p0a/` (`cong-cu/tao-asset-am-dao.py`, `cong-cu/khoi-am-dao.js`, `cong-cu/tao-am-dao.py`) rồi sinh lại `am-dao.html` → **P0-C** (`tao-p0c.py`) và **P0-B** (`tao-p0b.py`).
`index.html` (P0-A gốc), `demo.html`, ảnh nguồn, rig **không đổi**. Không gen ảnh mới. **Hộp đòn / sát thương / nhịp đánh không đổi.**

### 1. Kiếm to hơn (chỉ hình)

| | Trước | Sau |
|---|---|---|
| Lưỡi (chắn tay → mũi) | 170 px rig = **17,8 px logic** | **×1,48 → 252 px rig = 26,3 px logic** (≈ chiều cao thân Lam ~28 px; đầu Lam ~70 px nên không quá đầu) |
| Bản lưỡi / khe hai nhánh | ×1,3 / 2,5 px | phóng theo lưỡi, bản nới ×1,15 (thay ×1,3) / khe **3,8 px** |
| Chuôi dưới nắm tay | 60 px ảnh nguồn | rút theo tỉ lệ → dài **bằng cũ** trên rig, chắn tay vẫn ở đúng chỗ nắm tay (x 168 của mảnh tay) |

- Lấy lại **từ ảnh nguồn** `art/huong-moi/nguon/vu-khi/vu-khi-mau.png` (kiếm ≈ 450 px → thu còn 252 px) nên **không nhoè** (vẫn là thu nhỏ, không phóng ảnh nhỏ lên).
- Vì sao 1,48 mà không 1,55: sheet chạy rig-v4 phải giữ đúng ô 266 × 241 (game bắt buộc cỡ 2142 × 970). Ở ×1,55 mũi kiếm lúc chạy lố khỏi ô 1 px → công cụ tự đổi ô → trang báo lỗi. ×1,48 vừa ô (cần 140/141 px).
- Dựng lại bằng đúng công cụ cũ: `python3 -B game/thu-p0a/cong-cu/tao-asset-am-dao.py` (≈ 80 s) → `am-dao-cap1.png` (không đổi), `tay-truoc-am-dao.png`, `lam-hanh-dong-am-dao-2x.*` (2034×2317 → 2010×2404), `lam-chay-am-dao-2x.*` (cỡ giữ nguyên).

**Mũi lưỡi so với hộp đòn lúc hộp bật** (bảng `luoi` của sheet, px logic so với chân, nhìn phải – `video-am-dao/2810/ket-qua-truoc.json` / `ket-qua-sau.json → mui`):

| Đòn | Hộp (không đổi) | Mũi x trước | Mũi x sau | Tick mũi trong hộp (sau) | **Mũi vượt hộp xa nhất** |
|---|---|---|---|---|---|
| nhát 1 | `[4,−97,86,48]` (mép 90) | 82–84,7 | 90,4–93 | 0/8 | **3 px** |
| nhát 2 | `[−10,−100,90,48]` | 67–71 | 74–78 | 8/8 | 0 |
| nhát 3 | `[−13,−59,99,59]` | 78,6–79,3 | 84,8–85,4 | 2/8 | 0,3 px (mũi chạm đất) |
| nảy / bổ xuống | `[−26,−24,64,82]` | 22,6–25,4 | 22,8–25,6 | 11/11 | 0 |
| hất | `[−9,−140,87,60]` | 10,7–24,3 | 7,2–22,5 | 8/8 | 0 |
| trên không | `[−3,−107,95,48]` (mép 92) | 76,6–81,8 | 84,9–90,3 | 8/8 | 0 |
| chém vang | `[−13,−66,103,66]` | 78,6–79,3 | 84,8–85,4 | 3/8 | 0,3 px |

→ Mũi chỉ lố hộp **tối đa 3 px** (nhát 1) – gần như đúng "thấy lưỡi tới đâu là trúng tới đó". Mũi lố hộp thì phần "âm nhận" nối dài không còn vẽ (lưỡi đã tự chạm mép).

### 2. Bỏ vạch thẳng cuối vệt chém

**Nguyên nhân** (chụp từng tick, phóng ×3 – `video-am-dao/2810/so-nhat1-phong-to.jpg`): **không phải** ảnh vệt chém bị cắt ở mép ô (đã kiểm 12 khung sheet `vet-chem-2x.png`: mép ô đều trong suốt) và **không phải** vị trí PH8. Vạch thẳng là lớp vẽ bằng code của PH7:
dải **"quét âm"** (đa giác nối đường lưỡi giữa các tick, tô mờ) + **quầng âm nhận** (nét dày 15 px) được tô **đặc tới mép hộp** rồi **cắt bằng khung chữ nhật của hộp đòn** → mép hộp hiện thành một đường thẳng sáng; thêm **vạch đồng vuông góc** cố ý đặt đúng mép hộp. Lưỡi dài ra thì mũi lố hộp, dải quét càng bị cắt ngang rõ hơn.

**Sửa** (`khoi-am-dao.js`):
- **Tắt dải quét âm mặc định** (đa giác luôn có cạnh thẳng ở hai đầu; vệt chém + lưỡi dài đã cho thấy đường quét). `?quet=1` bật lại để so (bản bật lại cũng đã mờ dần về mép, đoạn lưỡi lố hộp được cắt đúng chỗ ra khỏi hộp).
- Quầng + tia âm nhận **mờ dần về 0 trước khi chạm mép hộp** (gradient dọc tia); **bỏ vạch đồng + chấm trắng ở mép**; 2 cung sóng lùi vào trong 5 px. Khung cắt hộp vẫn giữ làm lưới an toàn nhưng tới mép thì nét đã tắt hẳn → không còn cạnh.
- Ảnh vệt chém (sprite) **tan mềm**: khung áp chót mờ 1 → 0,65, khung cuối 0,65 → **0** (trước: chỉ khung cuối, còn 15 % rồi tắt phụt). Vị trí / cỡ / góc vệt **giữ đúng PH8** → lõi sáng vẫn trong hộp như bảng PH8.

Ảnh từng tick trước / sau (bản sạch + bản `?hitbox=1`) cho **nhát 1, 2, 3, hất, trên không, bổ xuống, chém vang**: `video-am-dao/2810/khung-<đòn>-truoc[-hop].jpg` / `khung-<đòn>-sau[-hop].jpg`. Bổ xuống (nảy) không có ảnh vệt chém (như trước), chỉ lưỡi.

### 3. Nhảy mềm hơn – `?nhay=cu` = bản cũ để so

| Số | Cũ (`?nhay=cu`) | Mới (mặc định) |
|---|---|---|
| jumpHeight / gravity (lúc lên) | 112 / 0,64 | 118 / **0,768** (lên nhanh hơn) |
| Vận tốc bật | 11,97 | **13,46** |
| Vùng đỉnh (apexThreshold / apexGravMul khi giữ) | \|vy\| < 1,8 / ×0,5, chuyển **thẳng** | \|vy\| < **4** / ×**0,3**, chuyển **mượt** (smoothstep) → treo đỉnh lâu hơn |
| Trọng lực rơi | 0,64 × 1,12 = 0,717 | **giữ 0,717** (0,768 × 0,933) |
| Trần tốc độ rơi | 10,4 – **cắt cứng** (gãy đột ngột) | 10,4 – **tiến dần** (trên 7,4 cong mềm, không gãy) |
| jumpCut, coyote, đệm nhảy, nhảy tường, lướt | giữ | giữ |

**Đo trong game** (Chromium, đứng yên, `ket-qua-sau.json → nhay`; tick = 1/60 s):

| Kiểu nhảy | Chiều cao cũ → mới | Lên đỉnh (tick) | Rơi về đất (tick) | Tới 90 % đỉnh (tick) | Ở trong 8 px quanh đỉnh (tick) |
|---|---|---|---|---|---|
| Giữ nhảy hết | **118,4 → 127,8 px (+7,9 %)** | 20 → 22 | 20 → 24 | 14 → **13** | 11 → **15** |
| Chạm 1 tick | 40,0 → 43,4 | 11 → 10 | 11 → 12 | 7 → 7 | 10 → 10 |
| Giữ 8 tick | 88,9 → 97,3 | 14 → 14 | 17 → 18 | 9 → 9 | 11 → 10 |

Hoạt ảnh (giữ nhảy hết): cũ `bật×3 · lên×10 · đỉnh×11 · rơi×7 · rơi-nhanh×8`; mới `bật×3 · lên×10 · đỉnh×15 · rơi×8 · rơi-nhanh×9` – khung đỉnh dài theo đúng đoạn treo, không khung nào lệch trạng thái.

**Không phá bệ / phòng:**
- So quỹ đạo (cùng công thức game, `cong-cu` mô phỏng giống hệt – khớp số đo trong game): ở **mọi độ cao** từ −200 tới đỉnh cũ, lúc Lam **rơi qua** độ cao đó luôn **muộn hơn hoặc bằng** bản cũ → bay được xa hơn hoặc bằng → bệ nào nhảy tới được bằng bản cũ thì vẫn tới được. Đúng cho nhảy đất (giữ 1, 2, 4, 6, 8, 10, 12, 16, 20 tick, giữ hết) và **nhảy tường** (cùng các mức giữ; đỉnh 100,7 → 109,2). **Nảy (pogo) không giữ nhảy**: đỉnh 118,1 → 125,3; có một điểm (27 px trên chỗ nảy) rơi qua **sớm 1 tick** – không đáng kể (≈ 4 px ngang), mọi điểm khác muộn hơn / bằng.
- Trần: ô 32 px nên khoảng trống trên chỗ đứng chỉ có 98 px (4 ô – cả hai bản đều chạm trần) hoặc 130 px (5 ô – cả hai bản đều không chạm: đỉnh mới 127,8 < 130). Không có chỗ nào **mới** bị cụng đầu.
- Quét bản đồ trong trang (P0-B và P0-C, cả `?nhay=cu` lẫn mặc định): mọi bậc phải nhảy lên trong 5 ô ngang ≤ 32 px, trừ đỉnh tường treo phòng Câu đố chuông (128 px – leo bằng nhảy tường, như cũ). 0 lỗi trang.
- Nhảy tường thử trong game: ôm tường → nhảy tường ra đúng (cả hai bản), Lam lên cao hơn 12 px. Nảy trên hình nộm: có trong video.

### 4. Sinh lại các trang

- `am-dao.html` ← `tao-am-dao.py` (thêm 3 chỗ thay: vùng đỉnh smoothstep, trần rơi mềm, vệt tan mềm).
- **P0-C** ← `tao-p0c.py` → phiên **`p0c-2810-91df6356`**.
- **P0-B** ← `tao-p0b.py` → phiên đóng băng mới **`p0b-2810-8210801c`**, nhãn **"28/10/2026 lần 2 (kiếm to, vệt chém mềm, nhảy mềm)"**. Cấu hình Vọng A/B, số, luật **giữ nguyên**; `?nhay=cu` / `?quet=1` bị trang tính là **BIẾN THỂ** như mọi cờ thử khác.

### 5. Video / ảnh (`video-am-dao/2810/`)

| File | Nội dung |
|---|---|
| `2810-chay-nhay-chem.mp4` (7 s, **không bất tử**) | Bản sạch, nhảy mới, kiếm mới: nhảy tới → combo 1-2-3 → hất → nhảy chém trên không → lùi → nhảy bổ xuống hình nộm (nảy) → combo |
| `so-nhat1-phong-to.jpg` | Nhát 1 phóng ×3: hàng trên TRƯỚC (dải sáng bị cắt thẳng ở mép hộp, kiếm nhỏ), hàng dưới SAU |
| `khung-*-truoc*.jpg` / `khung-*-sau*.jpg` | Từng tick 7 đòn, bản sạch + bản hộp đòn |
| `ket-qua-truoc.json` / `ket-qua-sau.json` | Số mũi lưỡi, quỹ đạo nhảy (từng tick + tên khung hoạt ảnh) |

Chụp lại: `python3 -B game/thu-p0a/cong-cu/quay-2810.py [khung mui nhay video]` (bản trước: thêm `--goc <git worktree commit 29a9ac9> --nhan truoc`).

### 6. Cần thử iPhone (chưa làm – không đánh dấu đạt)

- Kiếm: còn thấy "dao găm" không; lưỡi to có che mặt / lệch nét rig không.
- Vệt chém: còn thấy vạch / cạnh thẳng nào không (nhất là nhát 1 và trên không).
- Nhảy: so `…/am-dao.html` với `…/am-dao.html?nhay=cu` (hoặc P0-C / P0-B thêm `?nhay=cu`). Hết "cứng, nặng" chưa; có thấy **quá bay** không (nếu bay quá: giảm apexThreshold 4 → 3 trong `khoi-am-dao.js`).

## Sửa theo phản hồi 8 (28/10/2026)

Làm theo `docs/gameplay/PHAN-HOI-8-AM-DAO-PHONG-ABC-BO5.md` mục 1, 2 và phần "Âm Đao", "Dư Âm" trong "GỬI CLAUDE". Chỉ sửa `game/thu-p0a/` (`am-dao.html`, `cong-cu/`, `video-am-dao/`, ghi chú này). `index.html` (P0-A gốc), `thu-p0b/`, `thu-bo-vo-moc/`, `thu-phong-b/`, `demo.html`, `build-demo.py`, `docs/gameplay/` **không đổi**. Mọi đổi chỉ có trên trang Âm Đao.

| # | Yêu cầu | Đã làm |
|---|---|---|
| 1 | Nhát 2: thu hộp sau lưng | **`[−36,−100,116,48]` → `[−10,−100,90,48]`** (mép sau −36 → −10 = lưng Lam; mép trước 80 giữ). Đường lưỡi nhát 2 (bảng `luoi` của sheet) ở x ≈ +52…+76, không có tick nào ở sau lưng |
| 2 | Chém hất: thu mép trước thừa | **`[−9,−140,97,60]` → `[−9,−140,87,60]`** (mép trước 88 → 78). Không kéo thêm tia: vệt chém hất được dời/thu cỡ vào trong hộp (mục 5) nên mép trước nay có nét chém ở 71 % vị trí (trước: 0 %) |
| 3 | Pogo: giữ cũ, thêm biến thể | Mặc định **giữ `[−26,−24,64,82]`**. `?pogo=moi` = **`[−2,−24,48,82]`** (lưỡi bổ thẳng xuống ở x ≈ 22–25 so với chân, dung sai ≈ ±23 px, vẫn phủ nửa trước thân). **Chưa giảm 64 → 30** |
| 4 | Không bắt phủ 100 % | Không thêm VFX lấp hộp. Thước đo đổi sang "lõi sáng có nằm trong hộp không" + "mép có nét chém không" |
| 5 | Vệt chém lố: lõi sáng trong tầm | **Không cắt ảnh**. Dời / thu cỡ / xoay ảnh vệt P0-A cho trang Âm Đao (bảng `VET_CHEM_AD` trong `khoi-am-dao.js`, số tìm bằng `cong-cu/can-vet-chem.py`): mọi điểm lõi (2 khung đầu, độ đục ≥ 0,5) trong hộp ± 1,5 px; 2 khung mảnh vỡ sau được vượt nhẹ (≤ 3,5 px đo được) |
| 6 | Vết Dư Âm bản sạch không như ô vuông | Ảnh vết đặt **vừa** hộp (không phóng phủ kín rồi cắt) + **mặt nạ bầu dục mờ dần** (đặc tới 55 % bán kính → 0 ở mép hộp); **bỏ viền chữ nhật lúc vang ở bản sạch** (khung hộp chỉ còn ở `?hitbox=1`). Ảnh so: `video-am-dao/9-vet-du-am-sach-truoc-sau.png` |
| Dư Âm | Giữ cấu hình làm mốc | **Không đổi** sát thương / hồi 150 / chống ngắt. Thêm biến thể **`?giu=16`** (nhận 15 hoặc 16; **mặc định tắt = 20**): chỉ đổi ngưỡng giữ, hồi + sát thương giữ nguyên (`10b-debug-giu16.mp4`: giữ 15 → nhả sớm; giữ 17 → nạp ở 16, Dư Âm [15,20], vết [10,10]) |

### Bảng vùng hộp đo lại (PH8)

`video-am-dao/9-vung-hop-phu-vfx-ph8.png/.json` (trước: `8-vung-hop-phu-vfx.*`). Cách đo như PH7; thêm: **vàng** trên ảnh = lõi vệt chém; "lõi ngoài hộp" = px lõi (độ đục ≥ 0,5) ngoài hộp và khoảng vượt xa nhất; "mờ ngoài" = mọi px ≥ 0,02 ngoài hộp (gồm viền khử răng cưa, mảnh vỡ).

| Đòn | Hộp (cũ → mới) | Phủ cả hộp | Mép trên / dưới / trước / sau | Sáng ngoài hộp (px) | Lõi vệt ngoài hộp |
|---|---|---|---|---|---|
| nhát 1 | `[4,−97,86,48]` (giữ) | 47 → 53 % | 40→85 / 100 / 82→91 / 27 % | **437 → 56** | 34 px, xa nhất 1,5 px |
| nhát 2 | **`[−36,−100,116,48]` → `[−10,−100,90,48]`** | 27 → 38 % | 25→33 / 50→76 / 100 / 0 % ¹ | **860 → 43** | 3 px, 1,5 |
| nhát 3 | `[−13,−59,99,59]` (giữ) | 50 % | 48 / 70→74 / 46 / 0 % | 58 → 7 | 1 px, 0,5 |
| nảy (mặc định) | `[−26,−24,64,82]` (giữ) | 27 % | 33 / 47 / 100 / 0 % | 0 | 0 |
| nảy `?pogo=moi` | `[−2,−24,48,82]` (biến thể) | 35 % | 45 / 82 / **0** / 0 % ² | 0 | 0 |
| hất | **`[−9,−140,97,60]` → `[−9,−140,87,60]`** | 64 → 74 % | 96→100 / 61→90 / **0→71** / 21 % | **615 → 44** | 7 px, 1,5 |
| trên không | `[−3,−107,95,48]` (giữ) | 40 → 45 % | 64→73 / 77→82 / 91 / 0 % | 266 → 48 | 30 px, 1,5 |
| chém vang | `[−13,−66,103,66]` (giữ) | 53 → 54 % | 71→63 / 63→67 / 33→40 / 0→33 % | 132 → 15 | 0 |
| vết cấp 3 / 4 | `[0,−66,90,66]` (giữ) | (đo theo **độ sáng**) 38 / 44 % | góc hộp sáng **59 / 77 % → 0 / 0 %** | 0 / 0 | – |

¹ Dải 10 px sau tâm Lam của nhát 2 nay là **thân Lam** (không có nét chém, nhưng mục tiêu ở đó đang chồng người Lam). Debug `10-debug-hop-ph8.mp4`: hình nộm sau lưng 25 px và 6 px **không trúng** (Lam lao tới trong combo nên hộp nhát 2 bật thì hình nộm đã ra sau mép −10); lấn 6 px vào nửa trước thân → **trúng 12**. Hất: hình nộm cách 82 px **không trúng** (PH7 trúng), 70 px **trúng**.
² Biến thể pogo: lưỡi ở x ≈ 23 nên dải 8 px sát mép trước (38–46) **không có nét** – nếu chọn hướng này thì còn thu được nữa, nhưng PH8 dặn chưa chốt bề rộng từ bản đồ VFX.

Vệt chém – số đặt (so với chân, nhìn phải; `x, y, k (cỡ), góc`), cũ (sheet) → mới (trang Âm Đao): nhát 1 `58,−66,0.5,0` → `54.1,−72.7,0.5,0` · nhát 2 `54,−86,0.5,−10` → `49.4,−77.5,`**`0.4`**`,10` · nhát 3 `48,−35,0.52,0` → `45,−34.5,0.52,−10` · hất `26,−104,0.5,−30` → `26,−109.6,`**`0.39`**`,−10` · trên không `55,−78,0.5,0` → `55,−82.7,0.5,0` · chém vang `48,−35,0.598,0` → `42.6,−35,0.598,−10`. Nhát 2 và hất **nhỏ đi ≈ 20 %** (hộp hai đòn này thấp 48 / 60 px, vệt cũ cao hơn hộp); các đòn khác chỉ dời 0–7 px / xoay 10°.

**Pogo – lệch ngang nảy được** (`do-so`, `ket-qua.json → pogo`; Lam rơi từ 40 px trên đỉnh hình nộm rộng 72 px, nhìn phải, tâm Lam − tâm hình nộm, bước 4 px): cũ **−72 … +60** (33 vị trí) · `?pogo=moi` **−80 … +36** (30 vị trí). Với mục tiêu rộng như hình nộm/Chuông Gỗ, biến thể chủ yếu **dời** vùng nảy về phía trước (theo lưỡi) và hẹp đi ≈ 16 px, không phải giảm một nửa.

**Vết Dư Âm bản sạch** (`9-vet-du-am-sach-truoc-sau.png` hàng trên PH7 / hàng dưới PH8; đo độ sáng `9-vung-vet-kieu-ph7-do-lai.json` so `9-vung-hop-phu-vfx-ph8.json`): PH7 sáng TB dải mép 3 px **0,46 / 0,83** (cấp 3 / 4) – **sáng hơn giữa hộp** (0,30 / 0,33), 4 góc hộp sáng 59 / 77 %, cộng viền chữ nhật lúc vang → đọc như ô vuông. PH8: dải mép **0,009 / 0,009**, góc 0 %, giữa 0,37 / 0,43; 0 px sáng ngoài hộp.

### Dư Âm – 3 kịch bản so (PH8 mục 2)

Cùng đối thủ (2 Chuông Gỗ 40 máu + quái gác có vỏ, đi liền một mạch), trạng thái đầu giống nhau ở 6 ô (đặt **một lần** trước trận như PH7), **trong trận không dời quái, không đặt lại hồi chiêu**. Cấu hình Dư Âm = mốc (giữ 20, hồi 150, [15,20] / vết [10,10], không chống ngắt). Video **sạch** `11-sach-du-am-3-kich-ban.mp4` (6 ô cùng lúc) + **debug** `12-debug-du-am-3-kich-ban.mp4` (hộp đòn + log, log từng ô `-log-1..6.txt`), `ket-qua.json → kb`. Hai lần quay cho **cùng số** (chạy tất định).

Bot (`bot_kb` trong `quay-am-dao.py`): **"PH7"** = bot tự do cũ (đi tới, chạm Chém mỗi 14 tick, không né). **"né"** = như PH7 nhưng khi quái lấy đà / đang đập mà Lam trong 140 px thì lùi (lướt nếu sát), quái đập hụt hoặc đang đi thì áp sát chém. **(b)** = "né" + khi quái vừa **đánh hụt** (đập → hồi mà Lam không bị trúng) và Dư Âm sẵn: áp sát ≤ 66 px, giữ 21 tick. **(c)** = "né" + khi Dư Âm sẵn: không chém, giữ khoảng 115–130 px chờ quái; quái bắt đầu lấy đà ở 70–150 px thì giữ 21 tick (vết đặt), **lướt lùi** + lùi 14 tick, quái lao vào vết; chờ 150 tick không thấy quái lấy đà thì đánh thường 240 tick rồi thử lại.

| | (a) cấp 1 chỉ thường | (a) cấp 3 chỉ thường | mốc PH7 cấp 3 (giữ khi hết hồi) | nền "né" cấp 3 chỉ thường | **(b)** cấp 3 sau đòn hụt | **(c)** cấp 3 đặt vết rồi lùi |
|---|---|---|---|---|---|---|
| Chuông Gỗ #1 / #2 chết (tick) | 149 / 372 | 149 / 372 | 144 / 403 | 166 / 404 | 156 / 393 | 229 / 578 |
| **Xong trận (quái gác chết)** | **761** | **761** | 820 | 798 | **775** | 942 |
| **Lam bị đánh trúng** | 2 | 2 | 2 | **0** | **0** | **0** |
| **Tick đứng trong vùng nguy hiểm** ³ | 78 | 78 | 78 | 0 | **0** | 8 |
| Quái đánh hụt | 0 | 0 | 0 | 2 | 2 | 3 |
| Bot bắt đầu giữ / tung Dư Âm | – | – | 6 / 3 | – | 2 / 2 | 2 / 2 |
| **Lần giữ bị huỷ** (chưa nạp / đã nạp bị xoá) | – | – | **2** / 0 | – | 0 / 0 | 0 / 0 |
| Chém vang trúng / hụt | – | – | 3 / 0 | – | 2 / 0 | 0 / 2 (cố ý – bẫy) |
| **Vết vang trúng / hụt** | – | – | 1 / **2** | – | **2 / 0** | 1 / **1** |
| Bỏ chờ bẫy (quá 150 tick) | – | – | – | – | – | 1 |
| Thiếu kết cục bấm | 0 | 0 | 0 | 0 | 0 | 0 |

³ Tick mà vùng ăn đòn của Lam chồng hộp đập của một quái **đang lấy đà hoặc đang đập** (hộp đập nới thêm đoạn lao tới còn lại). Không tính chạm thân.

Đọc số (bot, chưa phải cảm nhận):
- **(a)** cấp 1 và cấp 3 chỉ đánh thường cho **cùng từng tick** (761, cùng tick chết, cùng 2 lần bị đánh): mở skill **không làm yếu bộ đánh nền**. (Cấp 3 đánh thường 12/nhát nhờ +20 % của cấp 2, cấp 1 là 10 – với 40 máu / vỏ quái gác cả hai vẫn cùng số nhát nên cùng tick, như PH7 đã ghi về cấp 2.) Phần chậm của mốc PH7 (+59 tick) hoàn toàn do **cách dùng** skill: 2/6 lần giữ bị Chuông Gỗ đập huỷ, 2/3 vết hụt.
- **(b)** Dùng sau đòn hụt: **nhanh hơn nền "né" cùng hành vi 23 tick** (775 so 798), **0 lần bị đánh, 0 tick nguy hiểm, 0 lần giữ bị huỷ, 2/2 vết trúng**. So bot PH7 không né (761) thì vẫn chậm 14 tick nhưng bot PH7 ăn 2 đòn và đứng nguy hiểm 78 tick. Tức là **phần thưởng của chọn thời cơ có thật**: Dư Âm bù gần hết thời gian mất vì né.
- **(c)** Đặt vết rồi lùi: **an toàn** (0 lần bị đánh) nhưng **chậm nhất** (942, +144 so nền né): bot đứng chờ không chém, 1 lần chờ quá 150 tick; 1/2 vết hụt (vết thứ 2 vang khi quái đã dừng ngoài vùng) và 8 tick nguy hiểm khi đang giữ. Với **quái thường đánh gần** như Chuông Gỗ, bẫy chủ yếu là lợi ích an toàn, không phải tốc độ – đúng như PH8 dự đoán; bot đặt bẫy còn thô (người thật có thể canh tốt hơn).
- Không đổi số Dư Âm. **Nếu người thật thấy giữ ì: chỉ thử riêng `?giu=16`** (biến thể có sẵn, tắt mặc định), giữ nguyên hồi 150 và sát thương.

### PH8 – KIỂM BẰNG CODE (Chromium headless)

| Kiểm | Kết quả |
|---|---|
| Hộp mới đúng ở game và sheet | Trang tự kiểm sheet ↔ `ATK` lúc nạp (sheet nhận hộp mới qua `P0.catBang`); lỗi trang 0 ở mọi cảnh |
| Nhát 2 không còn trúng sau lưng / hất không trúng ở 82 px | `10-debug-hop-ph8.mp4` + log (bảng trên, chú thích ¹) |
| Lõi vệt chém trong hộp | 6/6 đòn: lõi vượt ≤ 1,5 px (viền khử răng cưa); sáng ngoài hộp giảm 437/860/58/615/266/132 → 56/43/7/44/48/15 px |
| Vết không còn "ô vuông" | góc hộp 0 %, mép tối (số trên); ảnh so trước/sau |
| `?pogo=moi`, `?giu=16` mặc định TẮT | Log đầu ván ghi "hộp nảy … (mặc định)", "giữ 20 tick (mặc định)"; bật thì ghi "BIẾN THỂ THỬ" |
| Dư Âm 3 kịch bản | Bảng trên, `11-sach-…mp4` (sạch), `12-debug-…mp4` + `-log-1..6.txt`; thiếu kết cục bấm 0 ở cả 6 |

Video 1–7 và `8-vung-hop-phu-vfx.*` là **trạng thái PH7** (hộp / vệt cũ) – giữ để so, không quay lại. Video mới: `10-debug-hop-ph8.mp4`, `10b-debug-giu16.mp4`, `11-sach-du-am-3-kich-ban.mp4`, `12-debug-du-am-3-kich-ban.mp4` (60 hình/s, H.264 `-preset veryfast`, mỗi hình = 1 bước logic). Quay lại: `python3 -B game/thu-p0a/cong-cu/quay-am-dao.py vetanh vung8 pogo hop8 kb`; số vệt: `cong-cu/can-vet-chem.py`.

### PH8 – CẦN THỬ IPHONE (chưa làm – không đánh dấu đạt)

| Câu | Cần gì |
|---|---|
| Hộp mới | Người thử có thấy "trúng mà không thấy nét" / "thấy nét mà không trúng" ở nhát 2 (lưng) và hất (mép trước) không. Hất ngắn đi 10 px có làm hụt đòn chống trên không không |
| Pogo | So `am-dao.html` với `am-dao.html?pogo=moi` trên cùng đoạn nảy (Chuông Gỗ, hình nộm): có nảy hụt nhiều hơn không; có thấy nảy "ăn" chỗ không có lưỡi không |
| Vệt chém | Nhát 2 / hất vệt nhỏ đi ≈ 20 %: còn đủ "đã" không; vệt các đòn có trông xa hơn tầm thật không |
| Vết sạch | Không xem hộp đòn: vết có còn trông như ô vuông không; có đoán được vùng vết gây sát thương (rộng ≈ 90 px trước Lam) không |
| Giữ ì | Nếu người thử thấy giữ 20 ì → thử **riêng** `?giu=16` (các số khác giữ nguyên) |
| Thời cơ / bẫy | Người thử có tự dùng Dư Âm sau đòn hụt / đặt bẫy không, sau bao lâu |

### PH8 – câu hỏi còn lại

1. Nhát 2 nay hụt mục tiêu chạm lưng lúc bắt đầu combo (vì Lam lao tới). Chấp nhận (đúng đường quét), hay để −14 … −16 cho dung sai lao?
2. Vệt nhát 2 / hất nhỏ đi ≈ 20 % để lõi vào hộp. Chấp nhận, hay muốn clip vệt riêng thấp hơn cho Âm Đao (không đổi hộp)?
3. Pogo `?pogo=moi` còn dải 8 px trước không có nét. Sau buổi thử, nếu biến thể không làm nảy khó hơn thì thu tiếp về ≈ `[−2,−24,40,82]`?
4. Dư Âm: xem bảng 3 kịch bản – giữ mốc tới buổi thử iPhone?

## Sửa theo phản hồi 7 (28/10/2026)

Làm theo `docs/gameplay/PHAN-HOI-7-AM-DAO-BO-P0B.md` mục 1, 2 và phần "Âm Đao" trong đoạn "Gửi Claude". Chỉ sửa `game/thu-p0a/` (`am-dao.html`, `cong-cu/`, `am-dao/`, `video-am-dao/`, ghi chú này). `index.html` (P0-A gốc), `demo.html`, `build-demo.py`, `thu-bo-vo-moc/`, `thu-phong-b/`, `docs/gameplay/` **không đổi**. P0-B chưa làm ở lượt này.

| # | Yêu cầu | Đã làm |
|---|---|---|
| 1 | Chuông Gỗ giữ 40 máu | Mặc định 40. `?cg=36` ghi rõ **chỉ là biến thể thử** (đầu `khoi-am-dao.js`, link ở trên, dòng log "ÂM ĐAO cấp N … Chuông Gỗ 40 máu (mặc định)" / "36 máu (BIẾN THỂ THỬ ?cg=36)") |
| 2 | Lưỡi dài, đọc rõ hai nhánh ở 112 px, giữ tầm 90 | Lưỡi chắn → mũi **150 → 170 px rig (15,7 → 17,8 px logic)**; bản lưỡi ×1,3 (≈ 7 px); khe giữa hai nhánh mở **≈ 1 → 2,5 px logic** và tô viền tối trong khe; thép lưỡi sáng hơn (×0,72 khoảng cách tới trắng, chắn tay giữ nguyên). **Hộp nhát 1 vẫn `[4,−97,86,48]` (mép 90), mọi hộp khác không đổi.** Âm nhận nhát 1 còn **5,5–8 px** (trước 7,6–10,2). Ảnh so: `video-am-dao/7-luoi-112px-cu-moi.png` |
| 3 | Hộp chém vang quét thấp theo hình nhát 3 – duyệt tạm | Giữ `[−13,−66,103,66]`; code, log (`CHÉM VANG (quét thấp)`) và bảng thông số ghi rõ **"cú quét thấp – duyệt tạm tới khi có clip riêng"** |
| 4 | Hồi chiêu bắt đầu khi hộp/vết xuất hiện | Lúc tung: hồi **chưa chạy**. Tick hộp chém vang bật (= tick đặt vết): `hộp chém vang BẬT → hồi chiêu BẮT ĐẦU 150 tick`. Lướt / bị đánh trước đó: `KHÔNG MẤT hồi chiêu … dùng lại được ngay` (đếm `hoanHoi`). Lướt sau khi hộp bật: hồi giữ nguyên |
| 5 | Vết chỉ phía trước Lam | Vết = phần hộp chém vang **từ tâm Lam về phía trước** (`[0,−66,90,66]`, bỏ 13 px sau lưng); log `= phần TRƯỚC Lam … (bỏ 13 px sau tâm Lam)`. Đòn chém vang **giữ cả hộp** |
| 6 | Giữ nút khi pause / ⚙ / mất focus / chuyển tab | Mọi lúc đó **huỷ lần giữ** (cả khi đã nạp / thế tụ / đang chờ tung): không tích, không tự tung khi quay lại, không mất hồi; phải nhả rồi chạm lại mới đếm lần giữ mới (`choNha`). Bắt: bước chạy khi `S.paused` (⚙, màn dừng), `blur`, `visibilitychange` (ẩn), `pagehide`, và **hai bước logic cách nhau > 250 ms thật** (Safari ngưng rAF khi ẩn tab). Log mỗi lần giữ ghi **tách**: `N tick mô phỏng (a bước logic + b bước khựng) · M ms thật` (ms thật = `performance.now()`; trong công cụ quay ghi "–" vì công cụ tự bước, không có đồng hồ thật) |
| 7 | Kiểm toàn vùng hộp + âm nhận pogo | Thêm lớp **"quét âm"**: dải sáng nối đường lưỡi + âm nhận giữa các tick (từ tick đà vung tới tick hiện tại), **cắt trong hộp**. Âm nhận cũng cắt trong hộp. Đo vùng phủ cả 7 đòn (bảng dưới) + đo âm nhận **pogo `ATK[4]`: 54,6–59,8 px, mép trên cạnh hộp 10/10 tick**. **Chưa đạt "khớp hình" toàn bộ hộp** – xem bảng và câu hỏi |
| 8 | Cấp 4: tách trang trí với vùng sát thương | VFX vết vẽ **cắt đúng hộp vết** + viền hộp sáng lúc vang. Cấp 4 khác cấp 3 ở: số [16,20], hitstop 3, rung màn hình 2,4 (cấp 3: 1,4), tiếng trầm + `thud`, lớp nổ **sáng hơn cùng cỡ**, viền vàng dày hơn. Bỏ phóng to nổ ×1,35 / ×1,2. Đo: **0 px sáng ngoài hộp** ở cả cấp 3 và cấp 4 |
| 9 | Hướng dẫn so độ nhạy | Sửa mục 4b: so **`index.html?p0=0` với `index.html` (cùng dao)** trước; sau đó mới so `index.html` với `am-dao.html` (cùng nhịp, khác hình vũ khí) |
| 10 | Trận tự do | Video sạch `7-tu-do-cap-1-2-3-4.mp4` + số ở bảng dưới |

### PH7 – KIỂM BẰNG CODE (Chromium headless, mỗi hình video = 1 bước logic)

**Giữ nút / hồi chiêu / vết** (`video-am-dao/6-debug-sua-ph7.mp4` + `-log.txt`):

| Ca | Kết quả (log) |
|---|---|
| Giữ 15 → mở ⚙ 60 bước (ngón vẫn đè) → đóng ⚙ → đè thêm 45 → nhả | `HUY:tam-dung … đã giữ 15 tick mô phỏng (12 bước logic + 3 bước khựng) · chưa nạp`; sau đó **không** nạp, **không** Dư Âm (`tung` 0) |
| Giữ 35 (thế tụ) → mất focus → đè thêm 40 → nhả | `HUY:mat-focus … đang ở THẾ TỤ`; không tung |
| Giữ 21 → nhả (xếp hàng) → chuyển tab ngay tick sau | `HUY:chuyen-tab … đang CHỜ TUNG`; không tung |
| Tung → lướt 2 tick sau (trước hộp, su 6) → giữ lại 30 | `chém vang bị huỷ (lướt) TRƯỚC khi hộp bật → KHÔNG có vết, KHÔNG MẤT hồi chiêu (hồi hiện tại 0)`; lần giữ sau **ra Dư Âm #2** ngay |
| Tung → hộp bật (`hồi chiêu BẮT ĐẦU 150`) → lướt 9 tick sau → giữ lại 30 | Hồi giữ: `nha-som … đủ ngưỡng nhưng KHÔNG nạp được; Dư Âm đang hồi 105` |
| Hình nộm sau lưng 6 px, Dư Âm | Chém vang (cả hộp) **trúng 15**; vết (chỉ phía trước) `trúng 0 mục tiêu` |
| Hình nộm sau lưng 25 px, nhát 1 → 2 | Nhát 2 (hộp từ −36) **trúng 12** – và **không có VFX ở chỗ đó** (bảng vùng phủ: mép sau nhát 2 = 0 %) |
| Chạm → hộp | Vẫn **7 tick ở cả 4 cấp**, chạm 1 tick lẫn giữ 30 tick (20 lần mỗi kiểu, `do-so.json`) |
| Ca cũ (video 1–5 quay lại với lưỡi mới) | 10 lần dùng → 10 vết; bóng không sinh vết; vết vào vỏ = 0 máu; âm nhận lệch hộp 0 tick; lỗi trang 0 ở mọi cảnh |

**Vùng hộp có VFX** (`8-vung-hop-phu-vfx.png/.json`). Mỗi tick hộp bật vẽ lại riêng phần nhìn thấy của đòn (vệt chém P0-A, thân lưỡi, quét âm, âm nhận), cộng dồn; pixel có độ đục ≥ 0,2 = có VFX. "Mép" = % vị trí (cửa sổ 8 px, dọc theo dải 8 px sát mép) có VFX – tức một mục tiêu chỉ chạm mép đó có thấy nét chém không.

| Đòn | Hộp | Phủ cả hộp | Mép trên | Mép dưới | Mép trước | Mép sau | Sáng NGOÀI hộp |
|---|---|---|---|---|---|---|---|
| nhát 1 | `[4,−97,86,48]` | 47 % | 40 % | 100 % | 82 % | 27 % | 437 px (vệt chém P0-A lố trước) |
| nhát 2 | `[−36,−100,116,48]` | 27 % | 25 % | 50 % | 100 % | **0 %** | 860 px |
| nhát 3 | `[−13,−59,99,59]` | 50 % | 48 % | 70 % | 46 % | **0 %** | 58 px |
| nảy (pogo) | `[−26,−24,64,82]` | 27 % | 33 % | 47 % | 100 % | **0 %** | 0 |
| hất | `[−9,−140,97,60]` | 64 % | 96 % | 61 % | **0 %** | 21 % | 615 px |
| trên không | `[−3,−107,95,48]` | 40 % | 64 % | 77 % | 91 % | **0 %** | 266 px |
| chém vang (quét thấp) | `[−13,−66,103,66]` | 53 % | 71 % | 63 % | 33 % | **0 %** | 132 px |
| vết cấp 3 / cấp 4 | `[0,−66,90,66]` | 100 % / 100 % | 100 % | 100 % | 100 % | – | **0 / 0 px** |

Kết luận trung thực: **chưa khớp toàn bộ hộp**. Âm nhận (một tia) chạm đúng mép ở 7/7 đòn, vết khớp 100 %, nhưng đánh thường còn những dải hộp gây sát thương mà không có nét chém: **phía sau lưng** (nhát 2: 36 px, nhát 3 / chém vang: 13 px, nảy: 26 px), **mép trước của chém hất**, phần lớn **bề ngang hộp nảy**. Ngược lại vệt chém của P0-A ở nhát 1/2/hất **lố ra ngoài hộp** (trông xa hơn tầm thật). Không sửa hộp ở lượt này vì sẽ đổi tầm đánh cùng lúc với đổi lưỡi (PH7 mục 2) và đổi luật P0-A – xem câu hỏi PH7 bên dưới.

**Trận tự do** (`7-tu-do-cap-1-2-3-4.mp4`, log `-log-cap1..4.txt`, `ket-qua.json → tudo`). Trạng thái đầu giống nhau ở 4 cấp (quái ở chỗ gốc, Lam đầu Sân hai chuông, hồi 0) – đặt **một lần** trước trận; **trong trận không dời quái, không đặt lại hồi chiêu, không can thiệp**. Bot chung mọi cấp: đi tới quái gần nhất, trong tầm thì chạm Chém mỗi 14 tick; nếu Dư Âm có và hết hồi thì giữ Chém 24 tick, nhả, 30 tick sau mới giữ lại được; không né. Đối thủ: 2 Chuông Gỗ (40 máu) + quái gác (vỏ), đi liền một mạch.

| | Cấp 1 | Cấp 2 | Cấp 3 | Cấp 4 |
|---|---|---|---|---|
| Chuông Gỗ #1 chết (tick) | 149 | 149 | **144** | **144** |
| Chuông Gỗ #2 chết | **372** | **372** | 403 | 403 |
| Quái gác chết = xong trận | **761** | **761** | 820 | 804 |
| Lam bị đánh trúng | 2 | 2 | 2 | 2 |
| Bot bắt đầu giữ Dư Âm / tung được / vết trúng | – | – | 6 / 3 / 3 | 6 / 3 / 3 |

Đọc số (một kịch bản bot, chưa phải cảm nhận): trong trận tự do **cấp 3–4 chỉ nhanh hơn ở Chuông Gỗ đầu (5 tick) rồi CHẬM hơn cấp 1** (cả trận +59 / +43 tick). Lý do đọc từ log: 6 lần bot giữ chỉ ra 3 Dư Âm (2 lần bị Chuông Gỗ đập trúng khi đang giữ → `huy:bi-danh`), hồi 150 tick nên mỗi con chỉ ăn ≈ 1 lần, thời gian giữ 24 tick ăn vào nhịp chém thường, và vết thứ 3 vào quái gác còn vỏ = 0 máu. Cấp 4 nhanh hơn cấp 3 ở quái gác (16 tick) nhờ vết mạnh hơn. **Cấp 2 = cấp 1** về số tick (12 × 4 = 10 × 4 nhát với 40 máu). Con số 161 / 105 / 71 ở mục 4c là kịch bản **dựng cảnh** (dời quái, đặt lại hồi) – chỉ chứng minh chức năng, không phải mức mạnh lên trong trận thật. Bot không né và không chọn thời điểm như người – người chơi giỏi có thể khác; cần thử thật.

### PH7 – CẦN THỬ IPHONE (chưa làm – không đánh dấu đạt)

| Câu | Cần gì |
|---|---|
| Độ nhạy (PH7-9) | Bước 1: `index.html?p0=0` vs `index.html` (**cùng dao**), 3 người, đổi thứ tự. Bước 2: `index.html` vs `am-dao.html` cấp 1 (cùng nhịp, khác vũ khí) – chỉ hỏi về hình vũ khí / âm nhận, không kết luận nhịp từ bước này |
| Hai nhánh âm thoa | Ở cỡ màn iPhone ngang, người thử không được gợi ý có nhận ra lưỡi **hai nhánh** không; âm nhận nhát 1 (5,5–8 px) còn thấy không |
| Giữ nút trên Safari | Giữ Chém rồi: vuốt về màn chính / chuyển tab / mở ⚙ / khoá máy → quay lại: không được tự tung. Mở `?debug=input` đọc `HUY:…` và **ms thật**. Đo một lần chạm thường dài bao nhiêu **ms thật** (log `nha-som … M ms thật`) – công cụ quay không đo được |
| Đếm xuyên hitstop | Khi đang chém trúng, giữ 20 tick (≈ 333 ms thật) có thấy "đúng lúc" không, hay cần đếm thuần ms |
| Vùng hộp | Người thử có thấy "bị/được trúng mà không thấy nét chém" ở sau lưng (nhát 2, nảy) hay mép trước chém hất không |
| Cấp 4 | Có thấy vết cấp 4 mạnh hơn cấp 3 mà **không** thấy nó đánh xa hơn không |

### PH7 – câu hỏi cần chủ dự án quyết

1. **Dải hộp không có nét chém** (bảng vùng phủ): (a) thu hộp đòn của Âm Đao cho khớp hình – ví dụ nhát 2 mép sau −36 → ≈ −10, hất mép trước 88 → ≈ 80, nảy rộng 64 → ≈ 30 (đổi tầm đánh, nên làm **sau** buổi thử iPhone lưỡi mới); hay (b) giữ hộp và thêm VFX sóng âm phủ các dải đó; hay (c) giữ như hiện tại cho buổi thử đầu?
2. **Vệt chém P0-A lố ngoài hộp** (nhát 1: 437 px, nhát 2: 860, hất: 615): cắt vệt theo hộp trên trang Âm Đao (giống vết), hay giữ vệt gốc?
3. **Dư Âm trong trận tự do** chưa làm trận nhanh hơn (bảng trên). Giữ số hiện tại tới khi có kết quả iPhone, hay xem lại hồi 150 / thời gian giữ 20?

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
- **Chém vang** = đòn `ATK[7]`, **cú quét thấp** (chưa có clip mới: dùng tư thế nhát 3 – KHVK mục 10). **Vết**: đặt **một vết theo mỗi lần dùng**, ngay lúc hộp chém vang bật (trúng hay hụt), chỉ phần phía trước Lam (PH7), vang sau 24 tick. Cấp 4: vết mạnh hơn (số, tiếng trầm hơn, rung hơn, sáng hơn – PH7: **không** to hơn hộp).
- **Công thức** dùng chung của P0-A (gom theo tick, chặn theo Thế đầu tick, Cộng hưởng theo mục tiêu…). Vết là `D` riêng `src 'k'`, cờ `co = {ch:false, duChan:true, hieuUng:false, kichDau:false}`.
- **Chí mạng 5 % ×1,5** gieo **một lần lúc tạo đòn** bằng bộ sinh có hạt giống (mulberry32, đặt lại khi vào phòng) – cùng chuỗi vung ở mọi cấp cho cùng chuỗi chí mạng (so công bằng). Chỉ nhân máu.
- **Chỉ số chốt lúc tạo đòn gốc**: `D.goc` chép từ `pl.cs`; vết chép số lúc **tung kỹ năng**; bóng giữ số đã ghi. Đổi cấp giữa chừng không sửa đòn / vết / bóng đã có (video 4, ca cuối).
- **HUD**: dưới máu có "Âm Đao · cấp N" + vòng hồi Dư Âm (cấp 3+). Hình nộm thêm dòng **"tổng 10 giây"**. Trên đầu Lam: vòng nạp khi giữ; khi đã nạp: ánh dọc lưỡi (không nối dài – không phải hộp đòn). Nút Chém trên màn có viền: đang giữ / đã nạp / chờ tung.
- **Nút debug đổi cấp** trong ⚙ (thay nút "Nhịp đánh" ở trang này). Không có menu nâng cấp, save, vật liệu, Vọng Chiến, tinh anh, quái mới, cấp 5–8, 3 vũ khí kia.

## 2. Thông số (sửa ở đầu `cong-cu/khoi-am-dao.js`, chạy lại `tao-am-dao.py`)

| Số | Giá trị | Ghi chú |
|---|---|---|
| Đánh thường | bộ `ATK[1..6]`, su 7/7/9 (P0-A); [máu, Thế] nhát 1, 2, hất, trên không, nảy [10,10], nhát 3 [10,30] | Không đổi nhịp theo cấp |
| Hộp nhát 1 | mép trước **95 → 90** (`[4,−97,86,48]`) | Theo KHVK 2d. **PH8**: nhát 2 `[−10,−100,90,48]` (cũ −36…80), hất `[−9,−140,87,60]` (cũ mép trước 88); nảy giữ `[−26,−24,64,82]` (`?pogo=moi` = `[−2,−24,48,82]`); nhát 3, trên không giữ |
| Lưỡi âm thoa | chắn → mũi **170 px rig ≈ 17,8 px logic** (PH7; trước 15,7; dao cũ 23), bản ×1,3, khe hai nhánh 2,5 px | Tầm / hộp 90 **giữ**; âm nhận lấp phần còn lại tới mép hộp |
| Âm nhận (đo, PH7) | nhát 1: **5,5–8 px**; nhát 2: 11–12,7; nhát 3: 8,1–9,3; hất: 22–23,5 (lên); trên không: 10,3–15,7; **nảy (pogo): 54,6–59,8 (xuống)**; chém vang: 8,1–11,6 | Điểm cuối tia nằm trên cạnh hộp ở 100 % tick đo của **7/7 đòn**. Đây chỉ là MỘT tia – vùng còn lại của hộp xem mục PH7-7 (`do-so.json → am_nhan`) |
| Cấp 2 | máu đánh thường ×1,2 (10 → **12**) | Thế không đổi |
| Dư Âm (cấp 3) | giữ **20 tick**; chém vang su 6 / ac 8 / re 14, hitstop 5, **[15,20]**, hộp `[−13,−66,103,66]` (mép trước 90); hồi **150 tick tính từ tick hộp bật** (PH7); tụ tối đa 60 tick rồi tự tung | Hộp = **cú quét thấp** theo hình nhát 3, **duyệt tạm** (PH7) tới khi có clip chém vang riêng |
| Vết | vang sau **24 tick**, hộp = **phần phía trước tâm Lam** của hộp chém vang (`[0,−66,90,66]`, PH7), bật **4 tick**, mỗi mục tiêu trúng 1 lần; cấp 3 **[10,10]** hitstop 2; cấp 4 **[16,20]** hitstop 3 | Không chí mạng, không Cộng hưởng, không sinh vết, tối đa 2 vết trên màn. VFX cắt đúng hộp (cấp 4 sáng/rung/tiếng mạnh hơn, **không to hơn**) |
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
- Giữ đếm **xuyên hitstop** (bước khựng khi trúng vẫn cộng), để "giữ 20" không dài ra khi đang chém trúng. **Không** đếm khi tạm dừng / ⚙ / mất focus / chuyển tab – các lúc đó huỷ lần giữ (PH7-6). Bấm dồn không bao giờ ra kỹ năng.
- Thế tụ: Lam đứng yên (nhảy được – rời đất thì huỷ; lướt huỷ).
- Lướt / bị đánh huỷ chém vang **trước** khi hộp bật → không có vết, **không mất hồi chiêu** (hồi chỉ bắt đầu khi hộp bật – PH7-4). Hộp đã bật rồi mới lướt → hồi giữ nguyên.
- Tạm dừng / mở ⚙ / mất focus / chuyển tab / hai bước cách nhau > 250 ms → `HUY:…` (cả khi đã nạp, đang thế tụ, đang chờ tung); quay lại vẫn đè nút cũng **không** tự tung, phải nhả rồi chạm lại (PH7-6).

## 4. Ba câu prototype

### 4a. KIỂM BẰNG CODE (Chromium headless, bàn phím giả lập, mỗi hình video = 1 bước logic)

| Câu | Số đo | Ở đâu |
|---|---|---|
| 1. Đánh thường nhạy hơn? | Chạm → hộp **7 tick ở cả 4 cấp**, cả khi chạm 1 tick lẫn khi **giữ 30 tick** (20 lần mỗi kiểu) – tính năng giữ **không làm chậm** nhát đầu. Mọi lần bấm có đúng 1 kết cục (thiếu 0). P0-A cũ (su 11): 11 tick | `do-so.json` `cham_hop_cap1..4`, log video 2 |
| 2. Dư Âm dễ chủ động dùng? (phần đo được) | Đủ 3 trường hợp nhả + xoá + tự tung đều ra đúng log (video 2). Bot "bẫy" dùng được: chém **hụt**, lướt lùi, Chuông Gỗ đi vào vết → vết trúng (cấp 3: 10, cấp 4: 16) | video 1 (phần 4), video 2 |
| 3. Mở / nâng skill khác biệt? (phần đo được, cùng bot cùng phòng) | Bảng 4c | video 1, `ket-qua.json → sach` |
| Vết theo lần dùng | 10 lần dùng (4 trúng 1 con, **1 trúng 2 con**, 5 hụt) → **đúng 10 vết**; 10 nhát thường sau đó → **0 vết** | video 3 |
| Chống proc | Bóng phát lại chém vang: gây [3,10] (= [15,20]×0,25/0,5), **không sinh vết**. Vết vang **cùng tick** bóng chém: gom 2 lần trúng, **không Cộng hưởng**. Vết vào quái gác còn vỏ: **máu 0** (không thành 1), Thế −20 | video 4 |
| Hình khớp hộp | Debug chậm ¼: âm nhận chỉ hiện ở tick hộp bật, **lệch 0 tick**; điểm cuối tia âm nhận trên cạnh hộp ở 100 % tick. **PH7: đây chỉ là một tia, KHÔNG chứng minh cả hộp khớp hình** – xem bảng vùng phủ mục PH7 | video 5, `5-bang-tick-am-nhan.json`, `8-vung-hop-phu-vfx.json` |
| Lỗi trang | 0 ở mọi cảnh | `ket-qua.json` |

### 4b. CẦN THỬ IPHONE (chưa làm – KHÔNG đánh dấu đạt thay người chơi)

| Câu | Cần gì |
|---|---|
| 1. Nhạy hơn? | **PH7 – sửa cách so** (xem mục PH7-9): bước 1 so **`index.html?p0=0` (nhịp cũ) với `index.html` (nhịp mới) – CÙNG dao placeholder**; bước 2 mới so `index.html` với `am-dao.html` cấp 1 (cùng nhịp mới, chỉ khác hình vũ khí). 3 người, đổi thứ tự; ≥ 2 thấy nhịp mới nhạy hơn, không ai thấy ra đòn ngoài ý muốn. Độ trễ cảm ứng Safari chưa đo |
| 2. Dư Âm dễ dùng trên cảm ứng? | Bật `?debug=input` **sau** buổi thử để đọc dòng thống kê "giữ / nhả sớm / nạp / xếp hàng / tung ngay / xoá"; đạt khi ra nhầm < 3 % số lần giữ, muốn mà không ra < 10 %, người thử tự đặt bẫy được ≥ 1 lần sau 5 phút. **Chưa biết** một lần chạm thường trên iPhone dài bao nhiêu tick (giả định < 12) |
| 3. Khác biệt nhìn thấy / cảm thấy? | Người thử **không xem số** nói được cấp 3 khác cấp 1 ở đâu, cấp 4 khác cấp 3 ở đâu. Cấp 2 được phép khó nhận ra – ghi lại, không tính trượt |
| Âm nhận | Trên màn iPhone thật âm nhận nhát 1 nay **5,5–8 px** (lưỡi dài ra) có **còn đủ thấy** không; tầm 90 có "thấy trúng mới trúng" không |
| Kiếm âm thoa | Lưỡi 17,8 px – trên màn iPhone có đọc ra **hai nhánh** không; có bị "dao găm" không; nét vẽ tranh cạnh nét rig dày có lệch không |

### 4c. Cùng phòng, cùng đối thủ, cùng bot (video 1, số đo – không phải cảm nhận). **Kịch bản dựng cảnh: CÓ dời quái + đặt lại hồi chiêu** – chỉ kiểm chức năng; trận tự do xem mục PH7-10

| Cảnh | Cấp 1 | Cấp 2 | Cấp 3 | Cấp 4 |
|---|---|---|---|---|
| Hình nộm: combo + giữ Chém 30 + combo (tổng máu) | 70 | **84** | **109** | **115** |
| Chuông Gỗ [40]: tick tới khi chết | 161 | 161 (**không đổi**, vẫn 4 nhát) | **105** | **71** |
| Quái gác [30, vỏ 60]: tick tới khi chết | 201 | 201 (**không đổi**) | **171** | **155** |
| Bẫy (chém hụt, địch đi vào) | không có gì | không có gì | vết trúng **10** | vết trúng **16** |

(Đo lại 28/10 sau khi sửa PH7: số không đổi.) Kết luận trung thực (từ số đo của KỊCH BẢN DỰNG, chưa phải cảm nhận): **cấp 3** đổi hẳn cách đánh (có thêm hành động, Chuông Gỗ chết nhanh hơn ~⅓); **cấp 4** thấy ở số, tiếng, rung và độ sáng vết (Chuông Gỗ còn ~44 % thời gian so với cấp 1). **Cấp 2 với quái thường không đổi số nhát giết** (đúng như bảng 4b kế hoạch) – chỉ thấy số trúng 12 thay 10 và thanh máu tụt nhanh hơn. Biến thể `?cg=36` chỉ để thử; mặc định giữ 40 (PH7).

## 5. Video (`video-am-dao/`, 60 hình/s, H.264 `-preset veryfast`)

| File | Nội dung |
|---|---|
| `1-sach-cap-1-2-3-4.mp4` | **VIDEO SẠCH** (không log, không hộp đòn), 4 ô cấp 1 | 2 / 3 | 4 chạy cùng lúc, cùng bot: hình nộm → Chuông Gỗ → quái gác → **bẫy Dư Âm** (chém hụt, lướt lùi, Chuông Gỗ đi vào vết). Log từng ô: `-log-cap1..4.txt` |
| `2-debug-giu-nha.mp4` | Giữ / nhả ở nhiều thời điểm: chạm 1 tick, giữ 15, 21, 22 (xếp hàng), 40 (tụ → tung ngay), 100 (tự tung), lướt huỷ, đang hồi, chạm mới thắng, bị đánh huỷ, cấp 1/2 không có, cấp 4 |
| `3-debug-vet-du-am.mp4` | 10 lần dùng → 10 vết (1 lần trúng 2 con), rồi 10 nhát thường → 0 vết |
| `4-debug-chong-proc-cong-huong.mp4` | Bóng phát lại chém vang không sinh vết; vết vang cùng tick bóng → không Cộng hưởng; vết vào vỏ = 0 máu; 4 ca Cộng hưởng của P0-A chạy lại ở Âm Đao cấp 1; đổi cấp khi bóng còn (bóng 2, Lam 12, thêm 12 = 26) |
| `5-debug-cham-am-nhan-hop-don.mp4` | Debug chậm ¼: combo 1-2-3 + Dư Âm + vết vang; dòng dưới ghi tick · hộp · mép âm nhận · vết |
| `6-debug-sua-ph7.mp4` (+ `-log.txt`) | PH7: mở ⚙ khi đang giữ, mất focus khi thế tụ, chuyển tab khi chờ tung; lướt trước / sau hộp chém vang (hồi chiêu); hình nộm sau lưng 6 px (chém vang trúng, vết không) và 25 px (nhát 2 trúng) |
| `7-tu-do-cap-1-2-3-4.mp4` (+ log 4 cấp) | **VIDEO SẠCH** PH7-10: trận tự do 2 Chuông Gỗ + quái gác, không dời quái, không đặt lại hồi chiêu |
| `7-luoi-112px-cu-moi.png` | Lưỡi cũ / mới ở cỡ game (Lam ≈ 112 px) + phóng ×8 |
| `8-vung-hop-phu-vfx.png` / `.json` | PH7-7/8: bản đồ phần hộp có VFX của 7 đòn + vết cấp 3/4 |
| `do-so.json`, `ket-qua.json`, `5-bang-tick-am-nhan.json` | Số đo ở mục 4 |
| `9-vung-hop-phu-vfx-ph8.png/.json`, `9-vung-hop-pogo-moi.*`, `9-vung-vet-kieu-ph7-do-lai.*` | **PH8**: bản đồ vùng phủ sau sửa (vàng = lõi vệt chém), biến thể pogo, vết kiểu PH7 đo lại theo độ sáng |
| `9-vet-du-am-sach-truoc-sau.png` | **PH8**: vết Dư Âm bản sạch, chụp màn game: hàng trên PH7, hàng dưới PH8 |
| `10-debug-hop-ph8.mp4`, `10b-debug-giu16.mp4` (+ `-log.txt`) | **PH8**: mục tiêu sau lưng nhát 2 / mép trước hất; biến thể `?giu=16` |
| `11-sach-du-am-3-kich-ban.mp4` / `12-debug-du-am-3-kich-ban.mp4` (+ `-log-1..6.txt`) | **PH8**: Dư Âm 6 ô – (a) cấp 1 / cấp 3 chỉ thường, mốc PH7, nền né, (b) sau đòn hụt, (c) đặt vết rồi lùi |

Quay lại: `python3 -B game/thu-p0a/cong-cu/quay-am-dao.py [sach giu vet proc cham do ph7 vung tudo]` (video 1–5 đã quay lại 28/10 với lưỡi mới); ảnh lưỡi: `cong-cu/so-luoi-112.py`. Dựng lại: `tao-asset-am-dao.py` (≈ 80 s) → `tao-am-dao.py`. Chỉ là quay + ghi số, không phải bộ kiểm thử tự động.

## 6. Câu hỏi PH6 – ĐÃ CHỐT ở phản hồi 7 (giữ để tra; quyết định ở mục PH7)

1. **Cấp 2** không đổi số nhát giết Chuông Gỗ / quái gác (12 × 3 = 36 < 40). Giữ như kế hoạch ("cấp nền"), hay bật biến thể **Chuông Gỗ 36** (`?cg=36`: cấp 2 giết trong 1 combo) cho buổi thử?
2. **Lưỡi âm thoa ngắn hơn dao cũ** (15,7 so với 23 px) để phần âm nhận lấp tới mép hộp 90. Nhát 1 âm nhận chỉ 8–10 px. Chấp nhận, hay kéo dài lưỡi và **dời mép hộp ra ~95–100** (tầm lớn hơn 90)?
3. **Hộp chém vang** đổi thành `[−13,−66,103,66]` (thấp, theo hình nhát 3) thay `[0,−100,96,56]` của kế hoạch – vì chưa có clip chém vang riêng. Đồng ý tạm thời tới khi có clip?
4. **Lướt huỷ chém vang trước khi hộp bật**: không có vết nhưng **vẫn mất hồi chiêu** (đã tung). Giữ, hay hoàn hồi chiêu khi huỷ trước hộp?
5. Vết đặt **đúng hộp chém vang**, nên một phần vết nằm chỗ Lam đứng (hộp bắt đầu sau lưng 13 px). Giữ, hay chỉ lấy phần trước mặt?

## 7. Chưa làm / cần biết

- Chưa thử trên iPhone (mục 4b). Mọi số là Chromium headless.
- Chưa có clip tụ / chém vang riêng (dùng khung nhát 1 giữ yên + tư thế nhát 3, đúng KHVK mục 10). Âm thanh là tiếng tổng hợp có sẵn (`bell`), chưa có âm "vang" riêng; video không có tiếng.
- Đòn nảy (`ATK[4]`) **đã đo** âm nhận (PH7): 54,6–59,8 px chĩa xuống, mép trên cạnh dưới hộp 10/10 tick. Kỹ năng chỉ dùng trên đất (KHVK 2a).
- Công cụ quay có dời vị trí quái để dựng cảnh (dời Chuông Gỗ cho cảnh bẫy và cảnh đánh; quái gác cạnh hình nộm cho ca "trúng 2 con"; đặt lại hồi chiêu giữa các lần thử) – ghi trong log mỗi cảnh, không phải luật game.

## Sửa iPhone 29/10 – chém trên không không treo

Nhận xét (trang Lam mới, sinh từ trang này): **"nếu cứ bay trên không chém thì chả bao giờ xuống"**. Sửa ở nguồn `cong-cu/khoi-am-dao.js` (khối `ROI`),
sinh lại `am-dao.html` bằng `tao-am-dao.py`. Đo + video: `game/thu-lam-moi-2/xem-thu/sua-2910/` (`do-roi.json`, `chem-tren-khong-truoc-sau-60fps.mp4`).

- **Nguyên nhân:** trọng lực vẫn tác dụng khi chém trên không; thứ giữ Lam trên không là **pogo tự động** (`P.autoPogo`): bấm Chém lúc rơi mà có quái /
  hình nộm ngay dưới → thành chém nảy → trúng → nảy lên (vy −13,46) → lặp vô hạn.
- **Sửa:** pogo tự động (không cố ý giữ ↓) chỉ **1 lần mỗi lần rời đất / nhảy tường** (nảy pogo không trả lại lượt này); sau đó Chém trên không = chém thường, rơi.
  Giữ ↓ (phím, hoặc cần gạt quá ngưỡng hướng 0,7 ≈ 45° như lúc ra đòn) + Chém = pogo cố ý, nảy như cũ. **Khựng nhẹ** cho lần chém trên không đầu mỗi lần rời đất /
  nảy pogo / nhảy tường: 6 bước đầu, rơi kẹp ≤ 1,2 px/bước; các lần sau rơi bình thường. Hitstop không đổi (không có vật lý trong lúc khựng → không cộng dồn).
- `?roi=cu` = như cũ (biến thể). Mọi luật khác giữ nguyên (sát thương, hộp, ATK, pogo cố ý, nhảy mềm).

| Bot (giữ nhảy 14 bước rồi bấm Chém mỗi 2 bước) | Trước (`?roi=cu`) | Sau |
|---|---|---|
| Ngay trên hình nộm phòng A | **không bao giờ chạm đất** (thử 1200 bước = 20 s, nảy mãi) | **chạm đất sau 53 bước** (≈ 0,9 s: 1 lần nảy tự động rồi rơi) |
| Bấm mỗi 4 bước, trên hình nộm | không bao giờ chạm đất | 53 bước |
| Khoảng trống (không có gì dưới chân) | 23 bước | 24 bước (+1 bước do "khựng nhẹ" lần chém đầu) |
| Không bấm gì (nhảy thường) | 23 bước | 23 bước (không đổi) |
| Giữ ↓ + Chém trên hình nộm (pogo CỐ Ý) | nảy mãi | nảy mãi – **giữ nguyên** luật pogo kiểu Hollow Knight |

Trang sinh lại: `thu-lam-moi-2`, P0-C (`p0c-2910-e9cba386`), P0-B (đóng băng lần 4 `p0b-2910-e8aa09dc`). 0 lỗi trang ở cả 5 trang (am-dao, P0-C, P0-B, phòng B, Lam mới 2);
bot spam chém trên hình nộm chạm đất sau 53 bước ở am-dao / P0-C / P0-B / Lam mới 2. Phòng B (`thu-phong-b`) sinh từ P0-A gốc nên **không** có sửa này.
