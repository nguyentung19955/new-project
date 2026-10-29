# Trang thử PHÒNG B hướng mới (28/10/2026)

Viết cho người không rành kỹ thuật. Làm đúng bước đầu của mục **"THỨ TỰ THỰC HIỆN"** trong
`art/huong-moi/TU-VAN-CHUYEN-GIA-3-MOI-TRUONG-PHONG-A-F.md`: **chỉ phòng B (Sân hai Chuông Gỗ)**, đưa nền xa mới + thân đất mới vào, giữ đồ cũ đã chỉnh màu.
Chưa áp sang A, C–F. **Chưa thử trên iPhone thật** – mọi ảnh / số đo là Chromium headless trên máy chủ Linux không GPU.

**Chơi thử:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-phong-b/index.html
(vào thẳng phòng B; đi sang trái là phòng A, sang phải là C → D → E → F – bước 3: cả A–F dùng bộ đất mới; `?vao=d|e|f` vào thẳng phòng đó).

| Thêm vào địa chỉ | Để làm gì |
|---|---|
| (không thêm) | bản mới |
| `?moi=0` | tắt hết phần mới (nền, đất, đèn, HUD, nút) – chỉ còn màu HM, để so |
| `?nen=0` / `?dat=0` / `?hud=0` | tắt riêng nền mới / đất mới / HUD + nút mới |
| `?vao=a` | vào phòng A như `thu-p0a` |
| các cờ của `thu-p0a` | `?hitbox=1`, `?debug=input`, `?p0=0`… vẫn dùng được |

Trang này **sinh bằng script** từ `game/thu-p0a/index.html` hiện tại (`cong-cu/tao-tu-p0a.py`) – không sửa `thu-p0a/`, `demo.html`,
`build-demo.py`, `thu-bo-vo-moc/`, `docs/gameplay/`. Khi phiên Âm Đao sửa `thu-p0a` xong, chạy lại script là có bản mới (script báo lỗi rõ nếu chỗ móc bị đổi).

## Đất mới 28/10 – góc lõm, biến thể mặt sàn, bệ rễ mỏng (góp ý chuyên gia PH8)

> Mục mới nhất. **Chưa thử trên iPhone thật** – ảnh / video là Chromium headless. Collider **không đổi** (chỉ đọc lưới ô như trước).

Cờ mới: **`?bosung=0`** = đất như sáng 28/10 (không góc lõm, không biến thể, bệ rêu dày) – để so. Dùng được cả ở P0-C.

- **Ảnh**: 3 ảnh gen mới (`art/huong-moi/nguon/dia-hinh/goc-lom.png`, `mat-san-bien-the.png`, `be-re-mong.png`) → `art/huong-moi/dia-hinh/code/tao-dat-bo-sung.py`
  (cùng công cụ tách nền / ép mép / đoạn khớp với bộ đất trước) → `dat-bo-sung.png` + khoá `bo_sung` trong `dia-hinh.json`. Bộ cũ `dat-moi.png` giữ nguyên.
  Chi tiết + cách đọc ảnh góc lõm: `art/huong-moi/nguon/dia-hinh/GHI-CHU.md` mục "Đất mới 28/10".
- **Góc lõm** (`game/runtime/dia-hinh-huong-moi.js`, lớp 3.8): mảnh 64×64 logic tô theo khuôn, tự đặt GIỮA tại điểm góc khi sàn gặp tường cao ≥ 2 ô,
  hoặc đáy trần gặp tường thõng ≥ 2 ô; mép mờ 8 logic phủ lên mặt trên / cạnh đứng / thân → thay "mặt trên mờ dần + bóng tối nhỏ" ở đó.
  Bậc chỉ cao 1 ô vẫn dùng cách cũ (mặt trên của bậc nằm trong cửa sổ). Trong A–F: 2 góc trần ở cột treo hành lang C; sàn gặp tường (ảnh kiểm `goc-lom`).
- **Biến thể mặt sàn**: đoạn giữa 128 logic chọn thêm **D (mắt gỗ)** ~10 % và **E (rễ ngang)** ~16 % theo băm (đoạn, hàng) cố định;
  không 2 biến thể kề nhau, không cùng biến thể cách 1 đoạn. Cùng cỡ, cùng đường mặt, cùng khớp 2 đầu với A/B/C gốc → nối liền cả 2 phía.
- **Bệ mỏng** (lớp 3.7): ô đất lộ CẢ trên lẫn dưới (bệ treo 1 ô cao) bỏ thân / cạnh / đáy rêu, thay bằng bệ rễ mỏng: đoạn giữa 128 logic theo băm +
  đầu trái / phải phủ lên (phía trong mờ dần), thân kín đúng ô, chỉ đầu rễ thõng ≤ 22 logic dưới (đo được ~20). Đầu chạm tường thì không có đầu.
  **A–F hiện không có bệ 1 ô cao** (chỉ có ván một chiều) → thấy ở ảnh kiểm `be-don`; phòng nào thêm bệ 1 ô sẽ tự dùng bệ mới.
- **Ảnh trước / sau** (`xem-thu/dat-moi-2810/`, trên = TRƯỚC `?bosung=0`, dưới = SAU): `1-be-mong.png`, `2-goc-lom-san.png`, `3-goc-lom-tran.png`,
  `3b-goc-lom-tran-phong-c.png` (trong game, phóng 3×), `4-san-dai-kiem.png`, `4a-san-dai-phong-a.png`, `4b-san-dai-phong-b.png`.
  Video `cuon-a-f-sau-60fps.mp4`: camera cuộn A → F 6 px / khung (12 s). Ảnh kiểm từng mảnh: `art/huong-moi/dia-hinh/xem-thu/bs-*.png`.
- **Soi ranh mảng nướng** (24 vị trí × K 1 / 2,1656): 0 điểm hở mới. Còn 70 điểm ở 1 cột điểm ảnh **mép trái A khi camera đặt đúng x = đầu A**
  (ranh giữa đất mới và gạch cũ của các phòng trước A) – có y hệt ở `?bosung=0`, không do lần này.
- Chạy lại: `python3 -B art/huong-moi/dia-hinh/code/tao-dat-bo-sung.py` rồi `python3 -B game/thu-phong-b/cong-cu/chup-va-quay.py dat-moi`.
  `tao-tu-p0a.py` sinh lại ra đúng file cũ (đất nằm ở `game/runtime/`, trang chỉ nạp).
- **Còn chưa đẹp**: nhịp "vòm rễ" của sàn dài chủ yếu do khối thân 320 logic lặp – biến thể mặt trên chỉ phá lặp ở dải 116 logic trên cùng.
  Rêu ở góc lõm dày hơn mặt trên kề (ảnh gen như vậy) – trông như rêu tụ ở góc.

## Bước 3 (29/10) – dựng D / E / F, kiểm ranh khi cuộn, Bọ trên nền mới, tháp B, gợi ý ngắn (phản hồi 8)

> Mục mới nhất. **Chưa thử trên iPhone thật** – mọi ảnh / video / số đo là Chromium headless, máy chủ Linux không GPU.
> Không gen ảnh mới (đe rèn cắt từ `nguon/vu-khi/de-ren.png` có sẵn). Không sửa `thu-p0a/`, `thu-p0b/`, code Bọ, `demo.html`, `build-demo.py`, `docs/gameplay/`.

Cờ mới: `?vao=d|e|f` (vào đầu phòng D / E / F), `?goiy=cu` (dòng hướng dẫn dài cũ), `?thapB=cu` (tháp B chưa nén sáng), `?nenD=goc` (nền D chưa giảm).
Mọi cờ cũ (`?moi=0`, `?dv=0`, `?hitbox=1` …) và của Bọ (`?dauthan=0`, `?huongdan=1`, `?mot=1`) vẫn dùng được.

### B3.1 Đã dựng (sơ đồ v2: D 30 ô, E 30 ô, F 16 ô; mỗi phòng 17 hàng, không trần)

- **Thế giới**: C → D → E → F nối liền (tường phải hành lang C bỏ; tường cuối F cột 15). Cả A → F vẽ bằng bộ đất / ván / nền bước 2
  (`PB_SO.cot` = cột đầu A → cuối F), cùng luật: collider không đổi (chỉ đọc lưới ô), nhô ≤ 3–4 px, không mặt đứng giả, băm vị trí cố định.
- **D – Bọ Vỏ Mộc**: 2 Bọ (cột 13 tuần tra 6–17, cột 23 tuần tra 18–28), ván một chiều 4 ô (cột 9–12, hàng 9). Khối Bọ **chép CHỈ ĐỌC** từ
  `thu-bo-vo-moc/cong-cu/khoi-bo.js` trong `tao-tu-p0a.py` (giống `thu-p0b/cong-cu/tao-p0b.py`: RD → PD, bỏ phần bot / quay, không đặt Lam / chuông):
  `LOAI_QUAI.bo` thang ×10 + rig Bọ giữ nguyên. Đòn Lam (cả nhịp P0 và `?p0=0`), chém nảy, hitbox, xác / dấu báo đều nối như trang Bọ.
  Sàn thoáng; nền giữa chỉ 2 cây sát 2 mép (al 0,8); 1 đèn, 1 nấm ở mép trái.
- **E – sân tinh anh (chưa có tinh anh)**: trống đúng 30 ô, sàn phẳng. Tháp nền nén sáng (như B) lệch về cuối sân, 2 đèn cao sát mép.
  Vào phòng hiện "ĐẤU TRƯỜNG TINH ANH · chưa có tinh anh".
- **F – lò rèn**: ấm, an toàn như A – tháp cửa sổ vàng, 3 đèn sáng (quầng 54–58), quầng ấm nền, 2 nấm; **chuông lưu** cột 2 (điểm lưu mới bước 2,
  `BELLS[4]`, lưu / hồi máu như cũ); **đe rèn** tâm cột 7.
  - Ảnh: `art/huong-moi/dia-hinh/code/tao-do-vat-f.py` → `do-vat-f.png` + khoá `do_vat_f` trong `dia-hinh.json` (tách nền trắng như bước 2,
    cả khe trắng bị bao kín giữa đe và cột treo búa; khớp vị trí 2 trạng thái bằng mask; rêu giảm bão hoà nhẹ). Kiểm: `art/huong-moi/dia-hinh/xem-thu/do-vat-f-ban-co.png`.
  - Cỡ **80 × 64 logic** (cao 64 gồm cột treo búa; mặt đe cao 48 = ngang hông Lam). Tỉ lệ ảnh cho 78 → giãn ngang 2,3 % lên 80 cho vừa "rộng 80–112".
  - Vẽ ở lớp địa hình (sau chuông lưu, quái, **Lam**), neo giữa đáy, lún 2 px + bóng đổ nhỏ. 2 trạng thái **hoà dần**: nguội; Lam đứng cách ≤ 80 px →
    "đang rèn" (than đỏ) + quầng lò nhỏ cộng sáng (nhấp nháy nhẹ), rời đi thì nguội lại. Chưa gắn nâng cấp (P0-C).
- **Camera F**: F (16 ô) hẹp hơn màn ở cuối thế giới – hàm kẹp gốc với phòng hẹp sẽ nhảy qua lại, nên ở F camera **dính mép phải**
  (thấy thêm 14 ô cuối E, cùng nhịp trôi 0,1). Nền: phần màn chia theo cỡ phòng → nền F đủ đậm, nền E mờ về 0 trong 256 px cuối (không chồng 2 tháp).
- **Chưa đặt cổng D / E** (cổng cũ kiểu chibi; D chưa có điều kiện mở, E chưa có tinh anh) – vị trí theo sơ đồ: D cột ~26, E cột ~27.

### B3.2 Ranh mảng đất nướng khi camera cuộn (phản hồi 8 mục 3)

- **Video** `xem-thu/buoc-3/cuon-cham-a-f-60fps.mp4`: camera đặt thẳng, cuộn **1,5 px / khung** từ đầu A tới chỗ camera dừng ở F (4352 px, 2902 khung, 48,4 s),
  đi qua mọi ranh 256 × 128. Xem bằng mắt: không thấy khe / lệch.
- **Soi bằng số** (`TVPB.soiRanh`): vẽ RIÊNG lớp đất (đúng hàm game) trên nền đen rồi nền trắng, điểm nào khác nhau = chưa phủ kín; đếm trong mọi ô đặc
  có 8 ô kề cũng đặc (phải kín 100 %). 48 vị trí camera lẻ (A → F) × tỉ lệ K 1 / 1,5 / 2 / **2,1656 (= iPhone 844×390 @3x)** / 3.
  - Kiểm cách đo có bắt được lỗi: dời giả 0,6 px một nửa số mảng → báo 415 điểm hở ở ranh (rồi bỏ dời giả).
  - Lần đầu: **0 điểm hở ở mọi ranh mảng**, nhưng 70 / 96 điểm (K 2,17 / 3) ở **cột điểm ảnh cuối màn khi camera dừng ở F** = mép thế giới:
    dải mép lố ra ngoài thế giới (trong suốt dần) bị pha vào điểm ảnh cuối khi vẽ phóng. **Đã sửa** (`dia-hinh-huong-moi.js`: cắt mảng nướng ở 0 … WW·T).
  - Sau sửa: **0 điểm hở** ở cả 5 tỉ lệ (`so-do.json` → `buoc_3.ranh.soi`). Video quay trước bản sửa này (K = 1, không bị ảnh hưởng).
- **Ảnh phóng 4× quanh giao điểm ranh** (đường đứt hồng = ranh): `ranh-{san-b,tran-c,san-d,san-e}-k{2,2_165625}.png` – không thấy đường nối.

### B3.3 Bọ màu trầm trong nền mới (phòng D)

`bo-tren-nen-d-ghep.png` (màu + xám, nền D gốc / đã giảm), ảnh rời `bo-nen-{goc,giam}[-xam].png`. Nền gốc: Bọ 1 (đang báo húc, lóe cam đỏ) nổi;
**Bọ 2 (xám xanh trầm) hơi chìm** – đầu và chân lẫn vào vòm teal / thân cây nền. Làm theo hướng phản hồi: **giảm tương phản NỀN, không đổi viền / màu Bọ**:
- "màn tầm đánh": dải màu nền tối phẳng phủ lên nền xa ở tầm Bọ (y 250 → 470, đậm 0,42 ở 330–440), chỉ lớp nền (sau địa hình, sau mọi nhân vật);
- thân cây nền giữa ở D al 0,8 và đặt sát 2 mép (không đứng sau vùng tuần tra).

| Đo trên ảnh xám (độ sáng 0–255; "nền quanh" lấy từ CÙNG khung vẽ lại không có Bọ) | Bọ 1 gốc → giảm | Bọ 2 gốc → giảm |
|---|---|---|
| Bọ (trung vị) / nền quanh (trung vị) | 72 / 43 → 69 / 33 | 62 / 42 → 61 / 33 |
| chênh (Weber) | 0,67 → **1,09** | 0,48 → **0,85** |
| % điểm của Bọ sáng hơn nền ≥ 10 | 96,9 → 99,9 | **71,4 → 94,1** |
| độ lệch chuẩn nền quanh Bọ 2 (tương phản nền) | – | 4,3 → 2,7 |

### B3.4 Phòng B: cửa sổ sáng / ban công sau giữa sân

`thap-b-truoc-sau[-xam].png`, phóng: `thap-b-phong-cua-so.png`. Chọn **giảm sáng** (không dời cụm – tháp vẫn đứng sau ván một chiều, chỗ không có quái):
mảnh tháp ở B được **nén vùng sáng** (điểm sáng hơn ngưỡng 92 chỉ giữ 30 % phần trên ngưỡng, giảm bão hoà 55 %) + al 0,88. Cửa sổ / lan can còn đọc
được nhưng không còn là điểm sáng nhất sau giữa sân. A giữ cửa sổ vàng (A, F cần ấm). `?thapB=cu` để so.
Mảnh nén dựng 1 lần lúc nạp rồi đổi thành **ảnh** (`DHM.taoGiam`): để canvas thì Chromium thu nhỏ lại mỗi khung, đo **+1,8–2 ms / khung** ở B; đổi sang ảnh thì hết.

### B3.5 Gợi ý ngắn theo tình huống (thay dòng hướng dẫn dài đầu màn)

Vào phòng: chỉ **tên phòng 2,5 s**. Sau đó màn **không có chữ**, trừ khi xảy ra tình huống (hiện tối thiểu 1 s, tối đa 3,3 s, cùng câu không lặp trong 15 s):

| Tình huống | Câu |
|---|---|
| gần chuông lưu chưa bật | Chạm chuông: lưu + hồi máu |
| A, gần hình nộm chưa chém | Bấm Chém vào hình nộm để xem số |
| B, Chuông Gỗ đang lấy đà trong 320 px | Lóe vàng = sắp đập · Lướt né |
| C, quái gác thức trong 300 px | Vỏ cứng · nhát 3 làm nứt mạnh |
| D, Bọ còn mai, Lam ở phía trước | Mai cứng phía trước · vòng ra sau |
| D, Bọ vỡ mai đang sụp | Mai vỡ · đánh lúc nó sụp |
| F, cạnh đe | Đe rèn · nâng cấp ở bản P0-C |

Câu không kèm tên phòng (bản cũ: "TÊN PHÒNG" + câu dài). Nút được nhắc vẫn sáng viền như cũ. `?goiy=cu` = dòng cũ.
Dòng phím ở đáy màn (chỉ hiện khi dùng bàn phím) chưa đổi.

### B3.6 Xem gì (`xem-thu/buoc-3/`)

| File | Nội dung |
|---|---|
| `ghep-phong-def[-xam].png`, `phong-{d,e,f}[-xam].png` | 960×540: D Lam trước Bọ đang báo húc + Bọ 2; E sân trống; F chuông đã lưu, Lam cạnh đe (đang rèn) |
| `iphone-844x390-{d,e,f}.png` | giả lập iPhone ngang @3x, HUD + nút + gợi ý; vùng chạm giữ nguyên (`so-do.json` → `buoc_3.iphone`) |
| `lam-d-e-f-60fps.mp4` | 17,7 s, 60 hình/s, H.264 `-preset veryfast`: bot đánh gục 2 Bọ (vỡ mai → sụp → chết), qua E, tới đe (đe nóng lên) |
| `cuon-cham-a-f-60fps.mp4` | 48,4 s cuộn chậm A → F (mục B3.2) |
| `ranh-*.png`, `bo-*.png`, `thap-b-*.png` | B3.2, B3.3, B3.4 |

Chạy lại: `python3 -B game/thu-phong-b/cong-cu/chup-va-quay.py phong-def iphone-def bo-nen thap-b do-def ranh video-def` (`soi` = chỉ soi ranh, không quay).
Chỉ chụp / quay / ghi số, **không phải kiểm thử tự động**.

### B3.7 Đo (`so-do.json` → `buoc_3.do_ve`; Chromium headless, máy không GPU – **chưa đo iPhone**)

| Vẽ 1 khung, đứng yên 300 khung (ms) | tb | 95 % |
|---|---|---|
| A | 7,5 | 9,9 |
| B | 3,2 | 7,6 |
| C | 10,1 | 13,3 |
| D (2 Bọ tuần tra) | 7,1 | 11,2 |
| E | 4,5 | 7,9 |
| F | 7,2 | 9,0 |

Máy đo lần này chậm hơn lần bước 2: trang bước 2 đo lại cùng lúc được A 7,5–8,0 / B 2,9–4,3 / C 10,3–11,9 (bước 2 ghi 4,1 / 1,7 / 4,6) → so trong cùng bảng này, không so với B2.3.
Nạp: nướng đất **A–F 75 ms** (1473 lệnh → 64 mảng); **bộ nhớ**: ảnh địa hình giải mã 23,8 MB + **mảng nướng 20,1 MB** (A–C: 12,9) – trên iPhone cần để ý;
cách giảm như B2.3 (nướng 1,5x, hoặc chỉ nướng phòng đang ở ± 1). Khối màu HM ~1,3 s như cũ.

### B3.8 Ghi lại – CHƯA làm, không gen

- **Nhịp lặp sàn**: hàng sàn dài D / E (30 ô liền) vẫn nhận ra vòm rễ lặp 128 logic (3 đoạn). Sửa sau bằng **biến thể mảng lớn** (đoạn 256–384 logic
  ghép từ ảnh hiện có / ảnh gen thêm), không phủ thêm chi tiết dày.
- Nếu gen tiếp, chỉ ưu tiên (mẫu đính kèm: `bo-dat-3x3.png` + ảnh chụp phòng D, nền trắng, không chữ):
  1. **Bệ rễ mỏng, bụng ít rêu**: *"2D side-view thin root ledge matching the attached terrain: left cap, repeatable middle, right cap, flat top, thin underside with very little moss, pure white background, no text."*
  2. **Góc lõm theo khuôn** (`khuon/goc-lom-*.png`): *"Fill the attached template exactly: inner corner where a root floor meets a root wall, same texture and scale as the attached tiles, nothing outside the template, pure white outside."*
  3. **1–2 biến thể mặt sàn / vân lớn**: *"One wide repeatable floor top strip (4× the attached piece's width) matching the attached root terrain, flat standing line, sparse moss, varied large root pattern, pure white background."*
- Bệ mỏng 1 ô, trần C, giá ván: như B2.4 (chưa đổi).

## Bước 2 (28/10) – bộ đất mới từ ảnh gen, áp cho A + B + C, điểm lưu + hình nộm mới

> Mục này là phần mới nhất. Mục 1–8 bên dưới là bước 1 (giữ để đối chiếu; chỗ nào bước 2 thay thì đã ghi ở đây).
> **Chưa thử trên iPhone thật** – mọi ảnh / số đo là Chromium headless, máy chủ Linux không GPU.

Thêm cờ: `?vao=c` (vào đầu phòng C), `?bo=cu` (đất bước 1: thân mới + mép cũ), `?dv=0` (điểm lưu + hình nộm cũ). `?moi=0` vẫn tắt hết.

### B2.1 Đã ghép gì

**Ảnh nguồn** (`art/huong-moi/nguon/dia-hinh/`) → `art/huong-moi/dia-hinh/code/tao-bo-moi.py` (~20 s) → `dat-moi.png` (atlas đất 1600×1144) + `do-vat-a.png` + khoá `bo_moi`, `do_vat_a` trong `dia-hinh.json`.

- **Tách nền trắng**: flood-fill từ mép ảnh qua điểm gần trắng (chỉ phần nối với mép mới là nền → vải hình nộm, dấu ngà trên chuông giữ nguyên),
  alpha dải mép 3 px theo độ trắng, khử viền trắng (un-premultiply), hạ alpha điểm mép sáng hơn hẳn bên trong. Kiểm trên ô bàn cờ: `art/huong-moi/dia-hinh/xem-thu/bo-moi-tach-nen-*.png`.
- **Quy mô**: mọi mảnh đất cùng tỉ lệ **0,48 logic / px gen** (mảnh thân 330 px gen = 160 logic, mảnh mặt trên 419 px = 200 logic) – không nén mảnh vào ô 32;
  game cắt theo ô ở toạ độ thế giới. Khuôn bước 1 (36×64…) dùng làm **hình học lát cắt** (32 trong + nhô), vật liệu lấy từ dải đủ cỡ.
- **Ép mép** (thay cho cắt phẳng): cục rêu / rễ lồi ra ngoài đường collider bị *nén* lại (giữ nét viền), chỉ còn ≤ 3 logic (mặt trên, cạnh đứng), ≤ 4 logic (đáy);
  chỗ lõm vào được kéo ra lấp kín (không còn khe giữa hình và collider).
- **Các phần** (đều 2x, liền mép bằng "khớp chung" + mask nhiễu như bước 1):
  - thân: 4 mảnh (thân giữa 2 phần, trong cạnh trái, trong cạnh phải) → khối lặp liền 320×320 logic (`xem-thu/bo-moi-than-lap-2x2.png`)
  - mặt trên: 3 đoạn 128 logic (A: mặt trên giữa, B: trong đầu trái, C: trong đầu phải) + đầu trái / phải (= góc lồi trên) 96 logic; dải cao 116 logic
  - cạnh đứng trái / phải: mỗi bên 3 đoạn lặp dọc 128 logic (từ đầu / giữa / cuối của `canh-day-re`), dải 47 logic (3 nhô + 44 vào trong, mờ vào thân)
  - đáy: 3 đoạn (đáy giữa của 2 tấm + trong đáy trái) + đầu đáy trái / phải (= góc lồi dưới), dải 61,5 logic, rêu rủ ≤ 4 logic dưới collider
  - ván một chiều: 2 bộ × (đầu trái 64 + giữa 64 + đầu phải 64 logic); ván dày ≈ 15 logic, **mặt ván = mặt collider ô `=`**, giá đỡ chỉ chĩa xuống (nén dọc 0,6 → sâu ~29 logic dưới ván);
    ngang nén nhẹ (0,25 / 0,34) để giá đỡ nằm gọn trong đầu 64 logic. Ván B 4 ô = đầu trái + đầu phải.
  - góc lõm: không gen; code làm mặt trên / đáy sát tường mờ về phía tường + bóng tối nhỏ ở chân tường.
- **Trong game** (`game/runtime/dia-hinh-huong-moi.js`, hàm `dungMoi`): 5 lớp (thân → cạnh đứng → đáy + đầu đáy → mặt trên + đầu → ván) được **nướng sẵn 1 lần** vào
  các mảng canvas 256×128 logic (chỉ giữ khung bao phần có hình). Lớp mặt trên bị **xoá dần 26 logic sát mọi mép đáy lộ** → bệ mỏng thấy rêu đáy, hết "đáy cắt thẳng".
  Mỗi khung chỉ vẽ các mảng trong màn (~6–12 lệnh). Collider không đổi (chỉ đọc lưới ô); ô `S` (đá) trong A–C cũng vẽ bằng đất mới (trần C, tường trái A, khối trên cổng C).
  Chọn đoạn A/B/C theo băm vị trí cố định.
- **A + B + C cùng bộ mới** (`PB_SO.cot` = cột đầu A → cuối C). Nền giữa / đèn / trang trí theo từng phòng (`PA_SO`, `PB_SO`, `PC_SO` trong `cong-cu/khoi-phong-b.js`);
  khi đổi phòng nền giữa **hoà dần** theo phần màn mỗi phòng chiếm (không nhảy). Hết chỗ đổi đột ngột ở ranh giới A|B|C (mục 6.6 cũ).
  - **A ấm, an toàn**: tháp cửa sổ vàng sau khoảng trống giữa hình nộm và cuối phòng, 3 đèn sáng hơn (quầng 52–58), quầng ấm rất nhẹ ở lớp nền, 2 nấm.
  - **B** giữ bố cục bước 1 (2 cây sát mép, tháp sau ván, 2 đèn, 2 nấm). **C** thoáng: 1 cây mép trái (ngọn khuất sau trần), 1 đèn treo từ trần, không đồ sàn.
- **Điểm lưu mới** (A, cột 2): vòm rễ **cao 110, rộng 112** logic (ngang nén 0,8 vì chân rễ choãi), vẽ ở lớp điểm lưu = **sau Lam**. Chuông **tách rời** khỏi vòm, lắc quanh
  điểm treo (lắc mạnh khi vừa lưu). 2 trạng thái: tắt = đồng xỉn; đã lưu = chuông có dấu ngà + quầng ấm nhỏ (không quầng teal, không cổng sáng).
  Rêu giảm bão hoà 50 %, tối 10 %, phần rêu không sát bóng kéo 28 % về màu vỏ gỗ (trông mỏng hơn) – bằng code, không gen lại. Vùng lưu / hồi máu giữ nguyên.
- **Hình nộm mới** (A, cột 10): cao 108, rộng 56 logic, neo giữa đáy hộp va chạm 72×108 (không đổi), cùng lớp quái (sau Lam, trước hiệu ứng → không che điểm va chạm / vệt chém / số).
  Giữ hành vi cũ: lắc khi trúng (nghiêng quanh gốc), sáng lên (bản sáng vẽ sẵn), bảng số trên đầu, thanh Thế, hồi máu.

### B2.2 Xem gì (`xem-thu/`)

| File | Nội dung |
|---|---|
| `ghep-phong-abc.png` / `-xam.png` | **3 hàng A / B / C × TRƯỚC (thu-p0a) \| SAU**, mỗi ô 960×540 (từng ảnh rời: `phong-{a,b,c}-{truoc,sau}[-xam].png`). A: vừa chém hình nộm, điểm lưu đã bật; B: cảnh chiến đấu bước 1; C: Lam trước quái gác + cổng |
| `iphone-844x390-{a,b,c}-{truoc,sau}.png` | giả lập iPhone ngang @3x, có HUD + nút + gợi ý. Vùng chạm giống hệt TRƯỚC / SAU (`so-do.json` → `iphone_phong`) |
| `lam-di-a-b-c-60fps.mp4` | 18,7 s, 60 hình/giây, H.264 `-preset veryfast`: bot đi từ điểm lưu A, chém hình nộm 4 lần, đánh gục 2 Chuông Gỗ ở B, sang C đánh quái gác |
| `kiem-mep-{hang-dai,mang-4x4,goc-lom,be-don,hanh-lang-tran}[-collider].png` | ảnh kiểm liền mép, vẽ bằng chính code game; bản collider: đỏ = mặt trên (đứt = ván), cam = cạnh |
| `art/huong-moi/dia-hinh/xem-thu/bo-moi-*.png` | từng bước xử lý: tách nền, mặt trên / đáy / cạnh đứng / ván ghép nối tiếp, thân lặp 2×2, đồ vật A |

Ảnh / video bước 1 (`ghep-truoc-sau*`, `iphone-844x390-{truoc,sau}`, `lam-danh-2-chuong-go-60fps.mp4`) đã **chụp lại** với bộ mới.
Chạy lại: `python3 -B game/thu-phong-b/cong-cu/chup-va-quay.py phong iphone-phong do-phong video-abc` (chỉ chụp / quay / đo, không phải kiểm thử tự động).

### B2.3 Đo (`so-do.json` → `do_phong`, `do_ve`; Chromium headless, máy không GPU – **chưa đo iPhone**)

| Vẽ 1 khung (ms), đứng yên 300 khung | TRƯỚC tb / 95 % | SAU tb / 95 % |
|---|---|---|
| phòng A | 7,5 / 9,1 | 4,1 / 4,9 |
| phòng B | 5,1 / 22,8 | 1,7 / 2,7 |
| phòng C | 8,3 / 10,6 | 4,6 / 6,4 |
| B, bot đánh 600 khung | 6,2 / 8,3 | 2,1 / 4,1 |

(A, C nặng hơn B một phần vì phần vẽ cũ khác: số Thế, bảng hình nộm, cổng rễ.) Khung tối đa (47–105 ms) là giật lẻ của máy đo, có ở cả TRƯỚC.
Nạp: ảnh địa hình 0,1 s; **nướng đất A–C 57 ms** (917 lệnh → 40 mảng). **Bộ nhớ ảnh**: ảnh địa hình giải mã 23,7 MB (trong đó `dat-moi.png` 7,3 MB)
+ mảng đất nướng 12,9 MB (trần C chiếm nhiều) – trên iPhone nên để ý; nếu cần giảm: nướng mảng ở 1,5x thay vì 2x, hoặc bỏ ảnh đất bước 1 (`mat-tren.png`, `than-dat.png`) khi không dùng `?bo=cu`.
Khối màu HM (tô đồ cũ lúc nạp) vẫn ~1,2 s như bước 1.

### B2.4 Còn chưa đẹp

1. **Bệ mỏng 1 ô** (be-don): sau khi xoá dần mặt trên, gần như cả bệ là rêu đáy + đầu – đọc được nhưng "rậm". Cần một dải mép riêng cho bệ mỏng nếu dùng nhiều.
2. **Góc lõm** chỉ là mờ + bóng; nhìn kỹ chân tường vẫn thấy mặt trên sàn "chui" vào thân tường. Bậc cao (goc-lom): đầu trái của bậc hơi nhiều rêu so với tường bên cạnh.
3. Cạnh đứng: rêu chạy đều suốt chiều cao → tường cao (A cột 0, tường phải C) trông lặp nhịp 128 logic.
4. Hàng sàn dài vẫn nhận ra 3 đoạn (vòm rễ), đỡ hơn bước 1 (2 đoạn) nhưng chưa hết.
5. Ván: giá đỡ nén dọc 0,6 nên thanh chéo hơi bẹt; mặt ván + giá đỡ hơi sáng hơn đất (gỗ khác gỗ rễ – cố ý cho dễ nhận ván một chiều).
6. Điểm lưu: chuông hơi nhỏ trong vòm (vòm 110 logic) – dấu ngà khó thấy trên điện thoại; có thể vẽ thêm dấu ngà bằng code khi đã lưu.
7. Trần C là một khối thân lớn phẳng (không có gì ngoài vân rễ) – có thể thêm vài rễ rủ / lỗ tối bằng trang trí sau.
8. Lam, quái, cổng vẫn hình cũ (viền cyan, rêu xanh) – không thuộc bước này.

### B2.5 Ảnh còn cần gen (prompt ngắn; mẫu đính kèm: `bo-dat-3x3.png` + Lam mới, nền trắng, không chữ)

- **Bệ mỏng 1–2 ô**: *"2D side-view thin floating root-ledge sheet matching the attached terrain: left cap, repeatable middle, right cap, 1:4 thickness to length, level top, mossy underside, pure white background, no text."*
- **Góc lõm** (theo khuôn `khuon/goc-lom-*.png`, tô vào khuôn): *"Fill the attached template: inner corner where a root floor meets a root wall, same texture and scale as the attached tiles, no plants above the floor line, pure white outside the template."*
- **Thêm 1–2 đoạn mặt trên giữa** (bớt nhịp lặp): *"Two more repeatable middle top-edge pieces matching the attached root terrain, flat standing line, sparse moss, pure white background."*
- **Trang trí trần C** (sau P0): *"Sparse hanging root tips and dark hollows for a root ceiling, separate small pieces, pure white background, no glow."*

### B2.6 Ghép sang thu-p0a / demo

Như mục 7, thêm:
1. Đường dẫn ảnh: `art/huong-moi/dia-hinh/dia-hinh.json` (có khoá `bo_moi`, `do_vat_a`; DHM tự nạp `dat-moi.png`, `do-vat-a.png`).
2. `DHM.dung({..., cot: [[PA.x0, PC.x0 + PC.w - 1]]})` – muốn phòng nào dùng đất mới thì thêm khoảng cột phòng đó. Phòng có đá `S` muốn giữ đá cũ: `daLaDat: false`.
3. Bọc `drawSaveBell` và `drawQuai` như trong `khoi-phong-b.js` (khối "ĐIỂM LƯU MỚI", "HÌNH NỘM MỚI") – chỉ vẽ, không đổi luật.
4. Nền giữa / đèn mỗi phòng: bảng `PA_SO` / `PB_SO` / `PC_SO` + `NEN_ABC` (mảnh mang `rc` của phòng nó, trọng số theo phần màn).
5. Sinh lại ảnh: `python3 -B art/huong-moi/dia-hinh/code/tao-bo-moi.py` (bộ mới), `tao.py` (nền + đất bước 1 – giữ khoá bo_moi), rồi `python3 game/thu-phong-b/cong-cu/tao-tu-p0a.py`.

## 1. Xem gì trước (`xem-thu/`)

| File | Nội dung |
|---|---|
| `ghep-truoc-sau.png` | **TRƯỚC (thu-p0a) \| SAU**, 960×540, cùng một khoảnh khắc: Lam chém trúng Chuông Gỗ 1 (vệt chém + số 10), Chuông Gỗ 2 đang **lấy đà** (lóe vàng + dấu "!") |
| `ghep-truoc-sau-xam.png` | như trên, bản xám – kiểm Lam / quái / vệt / dấu báo có nổi hơn nền không |
| `truoc-chien-dau*.png`, `sau-chien-dau*.png` | từng ảnh rời (màu + xám) |
| `iphone-844x390-truoc.png` / `-sau.png` | giả lập iPhone ngang 844×390 @3x, có HUD + nút cảm ứng + dòng gợi ý |
| `lam-danh-2-chuong-go-60fps.mp4` | 7,5 s, 60 hình/giây (mỗi hình = 1 bước game), H.264 `-preset veryfast`: bot điều khiển Lam đánh gục 2 Chuông Gỗ |
| `kiem-mep-*.png` | **ảnh kiểm liền mép** (mục 3), vẽ bằng CHÍNH code của game; bản `-collider` có nét đỏ = mặt trên collider, cam = cạnh |
| `so-do.json` | số đo (thời gian vẽ, nạp, vùng chạm, lỗi trang = 0) |

Quay / chụp lại: `python3 -B game/thu-phong-b/cong-cu/chup-va-quay.py [mep] [anh] [iphone] [do] [video]` (cần playwright, Chromium, ffmpeg, Pillow).
Đây chỉ là công cụ chụp / quay / ghi số, **không phải kiểm thử tự động**.

## 2. Đã làm gì

**Nền** (`art/huong-moi/dia-hinh/nen-xa.jpg`, `nen-giua.png`)
- `lang-xa-tan.png` là **nền xa chính** (cuộn 0,08 như cũ, dọc 0,15). Ảnh không lặp liền → lặp **soi gương** (bản kề lật ngang) nên không bao giờ có đường nối.
  Đã làm nền lùi sau sàn + nhân vật: giữ 72 % tương phản, tối 20 %, dải ngang tầm chiến đấu (y ≈ 300–450) tối thêm ~14 %.
- `lang-giua-tan.png` dùng **thưa**: chỉ tách 3 mảnh (cây chuông trái, tháp cửa sổ, cây chuông phải), cuộn 0,40 như cũ.
  Mỗi mảnh giảm tương phản 25–28 %, tối 16 %, **giảm ánh vàng phụ** (2 cây hai bên giữ 35 % sắc vàng, tháp giữa 55 %).
  Hai cây đặt sát 2 mép màn, ngoài vùng tuần tra của 2 Chuông Gỗ; tháp đứng sau **ván một chiều** giữa sân (chỗ không có quái).
  **Đường cắt dưới thân cây** đặt 22 px dưới mặt sàn → luôn nằm sau địa hình (kể cả camera cảm ứng lệch 28 px). Mép trên ảnh gen bị cắt → mờ 40 px, nằm trên mép màn.
- Lệch cuộn tính theo **trục giữa phòng** (biến `S.rc` có sẵn) → camera ở giữa phòng là đúng bố cục đã chọn, không phụ thuộc vị trí phòng trong thế giới.
- **Chưa thêm lớp gần**; trong phòng B bỏ luôn rễ treo tiền cảnh cũ. **Không có quầng sáng bám theo quái.**

**Thân đất** (`than-dat.png`, `mat-tren.png` – code `art/huong-moi/dia-hinh/code/tao.py`)
- Thân: 4 mảnh thân vuông của `gach-re-tan.png`, mỗi mảnh dùng ở **160 logic** (không nén vào ô 32), ghép 2×2 thành **khối lặp liền 320×320 logic**;
  đường nối giữa 4 mảnh sửa bằng **mask nhiễu** (ranh giới gồ ghề, trộn hẹp ~20 logic), màu trung bình 4 mảnh kéo về một. Trong game khối này **cắt theo ô**
  ở toạ độ thế giới (ô (x, y) lấy phần (x mod 10, y mod 10)) – ô kề nhau luôn liền.
- Mặt trên: **2 đoạn giữa** (A: từ đoạn giữa ảnh gen; B: phần trong của mảnh đầu trái, chỗ không có cây – để hai đoạn khác hẳn nhau) mỗi đoạn 128 logic
  + **đầu trái / phải** từ ảnh. Hai đầu MỌI đoạn được thay bằng cùng một "khớp" lấy từ giữa ảnh gốc → ghép A/B theo thứ tự nào cũng liền; chọn A/B theo băm vị trí cố định.
  Mép rêu san phẳng 70 % (giữ chút gồ ghề), **rêu nhô tối đa 3 px** trên mặt collider. Dải cao 100 logic, đáy mờ dần 22 logic vào thân.
- Đầu trái / phải: mép đứng của ảnh gen được **nắn thẳng** (giữ 30 % gồ ghề) để **nhô ra ngoài collider tối đa 3 px**; phía trong mờ dần (mask nhiễu) phủ lên đoạn giữa.
- **Cây / nấm ở hai đầu ảnh đã tách** thành trang trí riêng (`trang-tri-dh.png`, 6 mảnh) – không làm mép collider. Phòng B chỉ đặt 2 nấm nhỏ ở 2 mép phòng (sàn thoáng).
- Collider **không đổi**: code chỉ đọc lưới ô. Mặt trên chỉ vẽ ở ô đặc có ô trống phía trên (không có mặt đứng giả). Vẽ cùng toạ độ camera, làm tròn theo điểm ảnh thật như gạch cũ.

**Mép / cạnh / đáy / ván chưa có ảnh mới** – tạm dùng **mép cũ đã chỉnh màu** (khối màu HM của `thu-huong-moi`): ở cạnh lộ còn lại chỉ giữ dải ~5–11 logic sát cạnh,
mờ vào thân mới. Ván một chiều, đá vẽ nguyên ô cũ đã chỉnh màu. **Không dùng mảng gỗ che vân** ở phòng B. Khuôn cho ảnh gen: mục 4.

**Đèn lồng cũ** (`den-tron-sang` của làng hoàn thiện): giữ + chỉnh màu (HM), **thu còn cao 34 logic**, **giảm nét** (viền đen ngoài → nâu sẫm, mảnh hơn), dây mảnh,
quầng nhỏ (bán kính 46, độ mạnh 0,22) vẽ ở **lớp nền** – sau địa hình, sau nhân vật và mọi đòn → không che đòn. Chỉ 2 đèn, sát 2 mép phòng, cao (đáy y ≈ 150, đầu quái ở y ≥ 300).

**HUD + nút cảm ứng** (`game/runtime/giao-dien-huong-moi.js`, chỉ trang này, bằng code)
- **Vùng chạm giữ nguyên**: đo trong giả lập iPhone – dpad 135×135, Vọng / Chém / Lướt 62×62, Nhảy 74×74, cùng toạ độ ở TRƯỚC và SAU (`so-do.json` → `iphone.vung_cham`).
- Hình nút nhỏ hơn vùng chạm (lõm vào 17 %): nền than trong, viền đồng mảnh 1,5 px, ký hiệu màu ngà (SVG). Teal **chỉ** ở nút Vọng + thanh Vọng.
  Bỏ quầng teal quanh nút Vọng khi ghi, bỏ viền teal nhấp nháy toàn màn (còn viền mảnh tĩnh), bỏ nhấp nháy vàng của nút được gợi ý (chỉ viền sáng hơn).
- HUD: 5 chuông vẽ bằng code (đầy = đồng, rỗng = viền đồng), thanh Vọng 5 px: teal đầy = sẵn sàng; ngà ngắn dần = đang ghi; teal chạy = bóng đang lặp; teal mờ + chấm = bóng giữ.
  Dòng gợi ý trên cùng thu hẹp lại để không đè HUD (bản cũ đè lên HUD trên iPhone).
- Nút "Nói chuyện": gọn, không nhấp nháy; **ẩn ngay khi rời vùng NPC**, hộp thoại đang mở đóng khi đi xa 80 px (cũ 150). Phòng B không có NPC – móc này để dành khi ghép.

## 3. Ảnh kiểm liền mép (`xem-thu/kiem-mep-*.png`, cỡ 2x, nền xám xanh để lộ chỗ hở)

| Ảnh | Thấy gì |
|---|---|
| `hang-dai` | 40 ô sàn dài: đoạn A/B nối liền, không thấy khe; vẫn **nhận ra nhịp 128 logic** khi nhìn cả hàng (vòm rễ lặp) |
| `mang-4x4` | khối 4×4 lơ lửng: mặt trên + 2 đầu ổn; nửa dưới là **mép cũ** (dải rễ sáng kiểu cũ) – khác chất liệu, đúng là chỗ chờ ảnh gen cạnh / đáy |
| `goc-lom` | sàn gặp tường + bậc cao: mặt trên mờ vào thân tường; đầu trái của bậc dừng ở mặt sàn thấp; tường dùng mép cũ – **góc lõm chưa có mảnh riêng** |
| `be-don` | bệ 6×1, 6×2, khối 1×1: bệ mỏng bị cắt đáy thẳng + dải mép cũ; khối 1 ô chỉ chấp nhận được |

## 4. Khuôn chờ ảnh gen (`art/huong-moi/dia-hinh/khuon/`)

16 khuôn PNG **nền trắng, đúng cỡ ảnh 2x**, + tấm tổng `khuon-tong-4x.png` (1536×1024, có tên + cỡ) để gửi kèm prompt.
Xám = trong collider, hồng = được nhô ≤ 4 logic, đỏ = mặt đứng, xanh đứt = cạnh phải nối liền. Cỡ / cạnh nối ghi trong `khuon.json` (và `dia-hinh.json` → `khuon`).

| Chờ ảnh gen | Khuôn (logic) |
|---|---|
| **Prompt A** – cạnh đứng trái / phải, mỗi bên đầu / giữa / cuối | `canh-trai-dau/giua/cuoi`, `canh-phai-…` 36×64 (32 trong + 4 nhô) |
| **Prompt A** – mép đáy trái / giữa / phải (trần C, đáy bệ) | `day-trai` 68×36, `day-giua` 64×36, `day-phai` 68×36 (gồm góc lồi dưới) |
| Góc lõm (Claude dựng khuôn, AI tô theo) | `goc-lom-san-trai/phai`, `goc-lom-tran-trai/phai` 64×64. Góc lồi trên = 2 đầu của mặt trên (đã có) |
| **Prompt B** – ván một chiều trái / giữa / phải | `van-trai` 36×28, `van-giua` 32×28, `van-phai` 36×28 (ván dày 16, giá đỡ chĩa xuống tới 28; ván B 4 ô = trái + giữa ×2 + phải) |

Khi có ảnh: cắt theo khuôn, ghi tên tệp vào `tep_anh_gen` trong `khuon.json`, rồi thêm vào `dia-hinh-huong-moi.js` chỗ đang gọi `vienCu` (mép cũ) và ô `'='` (ván cũ).
Chạy lại khuôn: `python3 -B art/huong-moi/dia-hinh/code/khuon.py`; chạy lại bộ địa hình: `python3 -B art/huong-moi/dia-hinh/code/tao.py` (~8 s).

## 5. Đo (`so-do.json`; Chromium headless, máy KHÔNG GPU – chỉ để so TRƯỚC / SAU, **chưa đo iPhone**)

| Vẽ 1 khung (ms) | TRƯỚC (thu-p0a) | SAU |
|---|---|---|
| bot đánh 2 Chuông Gỗ, 600 khung: trung bình / 95 % / tối đa | 6,45 / 8,5 / 66,9 | 1,55 / 2,7 / 50,3 |
| đứng yên, 2 quái tuần tra, 600 khung | 6,37 / 9,3 / 117,8 | 1,45 / 2,0 / 120,5 |

SAU nhanh hơn vì nền cũ 3 lớp + tiền cảnh rộng được thay bằng 1 ảnh xa + 3 mảnh nhỏ, và đất được gộp thành ~39 lệnh vẽ (khung tối đa là giật lẻ của máy đo).
Nạp thêm: ảnh địa hình mới ~0,07 s, 16 MB bộ nhớ ảnh giải mã; khối màu HM (tô màu đồ cũ lúc nạp) ~1,2–1,9 s – trên iPhone có thể 3–5 s → khi chốt màu nên tô sẵn ra file.

## 6. Còn chưa đẹp

1. Hàng sàn dài vẫn lộ **nhịp lặp 128 logic** (vòm rễ). Cần thêm 1–2 đoạn giữa nữa (gen thêm hoặc lấy mảnh khác) nếu muốn hết hẳn.
2. Mặt trên ở bệ mỏng: ngay trên đường collider có một **dải tối 2–3 px** (nét viền rêu của ảnh gen sau khi san phẳng) trông hơi "nắp phẳng".
3. **Mép cũ** (tường, đáy bệ, khối lơ lửng) khác chất liệu rõ – chỉ là tạm tới khi có ảnh prompt A. Góc lõm chưa có mảnh.
4. **Ván một chiều cũ** (xám, mỏng) lạc tông nhất phòng B – chờ prompt B.
5. Nền giữa: khi camera chạy hết biên phòng, mép tháp giữa có lúc nằm sau đầu Chuông Gỗ (chênh cuộn 0,6 × 64 px); đã làm tối + giảm tương phản nên vẫn đọc được (ảnh xám).
6. Đi sang phòng A / C: nền và đất **đổi đột ngột** ở ranh giới phòng (chỉ phòng B dùng bộ mới).
7. Lam, Chuông Gỗ vẫn là hình cũ (viền cyan, rêu xanh) – chưa thuộc bước này.

## 7. Cách ghép sang thu-p0a / demo và các phòng A–F

Mọi code mới ở **module riêng**, trang chỉ cần vài dòng:
1. Thêm 2 thẻ script sau `lang-hoan-thien.js`: `runtime/dia-hinh-huong-moi.js`, `runtime/giao-dien-huong-moi.js`.
2. Trong `boot()` sau `dungGach(); dungDen();` (và sau `HM.chuanBi` nếu đã ghép màu HM): `await DHM.nap('<đường>/art/huong-moi/dia-hinh/dia-hinh.json'); DHM.dung({...});`
   – tham số y như hàm `PBK.optThat()` trong `cong-cu/khoi-phong-b.js`; **muốn áp cho phòng nào thì thêm khoảng cột của phòng đó vào `cot`** (vd. `[[PA.x0, PC.x0+PC.w-1]]` cho A–C).
3. Bọc 4 hàm vẽ như trong `khoi-phong-b.js`: `drawNen` (gọi `DHM.veNen` + `DHM.veDen`), `drawGach` (bỏ qua cột `DHM.coCot`, gọi `DHM.veDat`), `drawTienCanh`, `veHUD` (gọi `GDHM.veHUD`), `thBuoc`; gọi `GDHM.ap()` một lần.
4. Mỗi phòng cần một bộ số như `PB_SO.nen` (3 mảnh nền giữa đặt ở đâu – tránh vùng tuần tra quái), `PB_SO.den`, `PB_SO.trangTri`. A và F (an toàn, ấm) có thể giữ ánh vàng tháp, B–E giữ sàn thoáng.
5. Màu đồ cũ: các móc HM (cột `ghep=True` trong `cong-cu/tao-tu-p0a.py`, 7 chỗ, in ra khi chạy script).

## 8. File

```
game/runtime/dia-hinh-huong-moi.js         module DHM: nền, đất, đèn (dùng chung cho mọi phòng)
game/runtime/giao-dien-huong-moi.js        module GDHM: HUD + nút cảm ứng
art/huong-moi/dia-hinh/                    ảnh 2x + dia-hinh.json; code/tao.py (nền, đất bước 1), code/tao-bo-moi.py (bộ đất mới + điểm lưu + hình nộm, bước 2),
                                           code/khuon.py (khuôn); xem-thu/ ảnh kiểm từng bước xử lý
game/thu-phong-b/index.html                trang thử (SINH RA, đừng sửa tay)      python3 game/thu-phong-b/cong-cu/tao-tu-p0a.py
  cong-cu/khoi-phong-b.js                  số đặt phòng B (PB_SO) + móc vẽ + API chụp (TVPB)
  cong-cu/chup-va-quay.py                  ảnh, video, số đo → xem-thu/
```

## Sửa iPhone 29/10

- **Mép đất bo mềm**: trang này dùng chung `game/runtime/dia-hinh-huong-moi.js` nên mép đứng + góc lồi đã hữu cơ (cạnh sần, rêu, rễ con, góc bo tròn) – **collider không đổi**.
  `?mep=cu` = mép thẳng cũ để so. Ảnh trước / sau phòng A, C, E, F + video: `game/thu-lam-moi-2/xem-thu/sua-2910/`.
- Đã chạy lại `cong-cu/tao-tu-p0a.py`: ra **đúng file cũ** (trang này sinh từ P0-A gốc `thu-p0a/index.html`, không qua Âm Đao) → **không có** sửa "chém trên không không treo"
  (pogo tự động ở đây vẫn như cũ). Muốn có thì phải đổi nguồn của trang này sang `am-dao.html` – chưa làm.

## Móc, vệt gen, cổng dọc 29/10 – trang này nhận CỔNG DỌC

- **Cổng dọc** thay hình cổng rễ ngang ở mọi cổng (cổng rễ phòng C và các cổng Làng Chuông cũ) – nằm trong file dùng chung `game/runtime/trang-tri-dia-hinh.js`
  (ảnh `art/the-gioi-moi/dia-hinh-v4/cong-doc-3x.png`), nên thu-phong-b tự có mà `index.html` không đổi (chạy lại script sinh trang: ra đúng file cũ).
- **Hộp chặn 183 × 159 và luật đóng/mở KHÔNG đổi**. 3 khối dọc (giữa có khoá chuông, hai bên rễ đan) phủ đủ bề ngang hộp chặn; đóng → mở ≈ 15 bước: cánh giữa tách đôi, hai khối
  bên rút xuống đất, lối tối hiện dần; đèn báo = loé xanh ngọc ở khoá chuông. `?cong=cu` = cổng cũ để so.
- Móc tường + vệt chém gen chỉ có ở trang Lam mới (`thu-lam-moi-2`); trang này vẫn Lam cũ. Chi tiết: `game/thu-lam-moi-2/GHI-CHU.md` mục "Móc, vệt gen, cổng dọc 29/10",
  ảnh `game/thu-lam-moi-2/xem-thu/moc-vet-cong/cong-trong-phong-b.png`. Chưa thử trên iPhone thật.
