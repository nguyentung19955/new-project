# Thử quái mới: Bọ Vỏ Mộc – BẢN 5 (thang ×10 + công thức chung, bản sạch choáng / xác, 28/10/2026); động tác bản 4; luật bản 2 + **mai vỡ giữ tới chết (PH5)**

Viết cho người không rành kỹ thuật. Đây là **trang thử riêng**, sinh từ `game/demo.html` bằng script (`cong-cu/tao-tu-demo.py`), giống các
thư mục `thu-*` khác. **KHÔNG sửa** `game/demo.html`, `build-demo.py`, `docs/gameplay/`, `game/thu-p0a/`, `game/thu-quai-huong-moi/`.

> **Chưa thử trên iPhone thật.** Ảnh, video, số đo đều lấy trong Chromium headless trên máy chủ Linux không có GPU. Độ mượt, độ nhạy,
> cảm giác "dội", âm thanh và việc dấu báo có đọc được trên màn nhỏ hay không **chưa được kiểm**. Các con số dưới đây là kiểm bằng code.

**Chơi thử:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-bo-vo-moc/index.html

Vào trận là đứng ngay trong **phòng thử phẳng** (phòng "Điểm lưu" cũ, đã bỏ 2 bệ, chặn tường hai đầu, chuông lưu dời về đầu phòng), có **2 con Bọ**.
Lam là **Lam hiện có của game** (rig-v4), phím/nút y như demo. Cảnh có ánh sáng + màu hướng mới (khối của `thu-huong-moi`).

| Cờ thêm vào cuối link (nối bằng `&`) | Làm gì |
|---|---|
| **`?dauthan=0`** | **tắt dấu "!"** báo húc – để so: chỉ còn cúi đầu, rung mai, chân sau cào đất + bụi, lóe cam đỏ, 2 tiếng gõ mai |
| **`?huongdan=1`** (mới, bản 3) | chữ **"Keng! Mai cứng"** hiện **mỗi lần** mai chặn (chế độ hướng dẫn). Mặc định chỉ hiện **lần đầu** |
| `?hitbox=1` (hoặc phím H / nút ▣) | hộp thân (xanh), phần bụng lộ (lục đứt), vùng húc (cam = sắp húc, đỏ = đang húc) + chữ trạng thái/clip |
| `?xem=1` | 2 con đứng yên diễn lần lượt **mọi clip** (con trái nhìn trái, con phải nhìn phải) |
| `?mot=1` | chỉ 1 con |
| `?battu=1` | Lam không chết |
| `?mau=0` | ẩn chấm máu (chấm máu chỉ có ở bản thử) |
| `?hm=0` | tắt màu/ánh sáng hướng mới (cảnh như demo hiện tại) |

## Bản 5 – theo phản hồi 7 (`docs/gameplay/PHAN-HOI-7-AM-DAO-BO-P0B.md` mục 3, mục 4 dòng Bọ)

**Nhịp chơi không đổi:** quay lại 3 video, trạng thái Bọ từng bước trong `so-lieu.json` → `video` **trùng khít** bản 4 (715 / 1069 / 912 khung).

### 5a. Thang máu / Thế ×10 + công thức chung (mục 4: "không bê nguyên máu 4 rồi dùng sát thương bóng tối thiểu 1")
Số / luật Bọ gom vào **một khối dữ liệu** đầu `cong-cu/khoi-bo.js`: `LOAI_QUAI.bo` (= `BO_LOAI`, Thế = `THE_BO`), cùng dạng `LOAI_QUAI` của P0-A
(KE-HOACH-GAMEPLAY-V2 mục 6a). Trang có khối P0-A (nạp `khoi-p0a.js` **trước** khối Bọ) → Bọ dùng **`CFG` chung** và gắn `.bo` vào `LOAI_QUAI` chung;
trang thử này không có P0-A → `BO_CFG` chép đúng các hệ số chung (`CH_MAU` 1, `CH_THE` 0,5, **`BONG_MAU` 0,25**, **`BONG_THE` 0,5**, khoá Cộng hưởng 45, hitstop 8).
Đòn Lam lấy `goc` từ `PL_CS` của P0-A nếu có, không thì dao placeholder P0-A (nhát 1–2, 4–6 [10,10], nhát 3 [10,30]). Phiên P0-B: `LOAI_QUAI.bo` + `THE_BO` là đủ để nạp Bọ vào phòng D.

| Bảng quy đổi | Bản 4 | **Bản 5** | Nhịp cảm nhận |
|---|---|---|---|
| Máu | 4 | **40** | |
| Mai | 4 nấc | **Thế 40** (`mat` – chỉ che phía trước, `phaMotLan`) | thanh vẫn vẽ 4 ô (10 Thế / ô), chấm máu 4 chấm (10 máu / chấm) |
| Lam đòn thường vào **bụng** | −1 | **−10** | **4 nhát** chết (như cũ) |
| Lam đòn thường vào **mai** | 0 máu, mai −1 | 0 máu, **Thế −10** | **4 đòn** vỡ mai (như cũ) |
| Lam **nhát 3** vào mai | mai −2 | **Thế −30** | nhanh hơn: **nhát 3 + 1 đòn thường** = vỡ (cũ: cần 2 nhát 3 hoặc nhát 3 + 2 đòn). Combo 1-2-3 vẫn vỡ ở nhát 3 |
| **Bóng** vào bụng / mai đã vỡ | −1 (**bằng Lam**) | **−2** = floor(10 × 0,25), tối thiểu 1 chỉ khi gốc > 0 và không bị chặn | bóng = 1/5 Lam |
| Bóng vào mai còn | mai −1 | **0 máu**, Thế −5 (nhát 3: −15) | |
| Cộng hưởng | +1 máu + vỡ mai | **+10** = floor(`CH_MAU` × máu gốc nhát Lam) + vỡ mai ngay (mai đã vỡ: chỉ +10) | cùng tỉ lệ |
| Đòn húc của Bọ | 1 máu Lam | `goc` [1, 0] (thang máu Lam như Chuông Gỗ P0-A) | như cũ |

Kiểm bằng tay trên trang (không phải kiểm thử tự động): 4 đòn mai → Thế 30 / 20 / 10 / **vỡ**; nhát 3 rồi 1 đòn → 10 / **vỡ**; 4 nhát bụng → 30 / 20 / 10 / **chết**;
bóng vào bụng 40 → **38**, vào mai 38 máu giữ, Thế 40 → 35 → 20 (nhát 3); Lam mai + bóng mai cách 5 bước → Cộng hưởng: vỡ + 40 → **30**;
Lam bụng + bóng bụng cùng bước → 40 − 10 − 2 − 10 = **18** + vỡ mai.
**Giữ luật cũ của Bọ (đã chốt bản 2), ghi rõ vì khác quái gác `vo`:** đòn vào **bụng không trừ Thế** (`THE_BO.truTheKhiTrungBung: false`) – mai chỉ mòn khi bị đánh vào mai.

### 5b. Bản sạch lúc choáng (mục 3)
- **Bỏ 3 chấm quay** trên đầu; chỉ còn khi thêm `?debug=…` hoặc `?hitbox=1` (để soi). Thanh thời gian choáng + chấm máu bản thử giữ.
- **Tư thế bất động**: clip `sup_choang` bỏ chân run và mảng mai lắc, thân chỉ phập phồng ~0,2 px logic; **bụng lộ** vẫn thở chậm.
- **Một dấu nứt**: vạch răng cưa tĩnh (tối 2 px + mép sáng 1 px) trên mảng mai giữa, hiện trong 6 bước đầu khi vỡ, đứng yên tới lúc dậy.
- Ảnh: `pha-vo-mai-choang-day.png` (chụp lại).

### 5c. Đầu lún đất khi sụp / chết (mục 3)
Rig kẹp **đầu + 3 mảng mai** không thấp hơn mặt đất quá 1 px logic (bằng chân). Đo trước → sau (px dưới mặt đất): đầu khi sụp choáng **7,6 → 1,0**,
đầu khi chết **12,2 → 1,0**, mảng mai rơi khi chết **10 / 5 / 3 → 1,0**. Ảnh: `pha-chet-sup-tan-vun.png`, `pha-chet-mai-da-vo.png`, `chet-sup-tan-vun.png`.
Chi tiết: `art/huong-moi/quai-rig/bo-vo-moc/README.md` mục "Bản 5".

### 5d. Xác (mục 3) – kiểm bằng ảnh + số đo (`so-lieu.json` → `xac`)
- **Không gây hại**: chỉ cú húc (`st 'huc'`) gây sát thương; xác không ăn đòn, không nhận chém nảy. Lam đứng **chồng lên xác 60 bước**: máu 1 → không giảm.
- **Không chặn nhặt đồ**: bình máu rơi từ xác (bước 57 của chết), Lam đứng lên → nhặt được (máu 1 → 2, bình biến mất) khi xác còn nằm (bước 117).
  Bình máu vẽ sau mọi quái nên không bị xác che.
- **Không chặn đòn vào con khác**: hộp chém phủ cả xác và con sống phía sau → chỉ con sống trúng (40 → 30), xác không "ăn" mất nhát.
- **Không che dấu báo**: xác vẽ ở **lớp sau** (`BO.veXac` gọi **trước** quái sống), con sống vẽ sau; dấu "!" + thanh của mọi con vẽ **cuối cùng** (lớp phủ).
  Xác **mờ dần** 1 → 0,7 (bước 40 → 110) rồi tan như bản 4 (150 → 210).
  Ảnh: **`xac-khong-che-dau-bao.png`** (xác nằm đè ngay sau con đang báo húc, phóng 2×) và **`xac-hitbox.png`** (xác: khung xám đứt, không có vùng ăn đòn / vùng húc).
- `?hitbox=1` ghi chữ "xác: không ăn đòn, không gây hại" trên xác.

### 5e. Ghi lại để theo dõi (mục 3, 4) – CHƯA làm
- **Chưa thêm chống ngắt sau mất mai** (`LOAI_QUAI.bo.khongNgatSau: Infinity` = luôn bị ngắt, như bản 4): mọi nhát gây máu (trừ lúc vỡ mai / sụp) → khựng 16 bước,
  kể cả khi đang báo trước / húc. Theo dõi khi có người thử: nếu Bọ luôn chết trước khi kịp đánh lại thì chấp nhận được với quái thường (PH7); nếu cần,
  thêm "đã lấy đà ≥ N bước thì không ngắt" như Chuông Gỗ.
- Bước lật gương t11 → t12 vẫn đổi silhouette tức thì; chưa kiểm ở 120 Hz thật.

**Chưa thử trên iPhone thật** (Chromium headless, máy chủ không GPU). Vẽ cả khung TB 9,1 ms, phần Bọ **0,11 ms/khung** (máy chủ).
Video quay lại: `danh-mai-vo-sup-choang-60fps.mp4`, `vong-ra-sau-danh-bung-60fps.mp4`, `cac-clip-60fps.mp4` (H.264 60 hình/s, `-preset veryfast`); mọi ảnh trong
`game/kiem-thu-bo-vo-moc/` chụp lại (số máu / Thế trên chấm và thanh theo thang mới; hình giống bản 4 trừ choáng / chết).
Chạy lại phần bản 5: `python3 -B game/thu-bo-vo-moc/cong-cu/quay-va-chup.py video anh so pha xac` (sau `dung_rig.py` và `tao-tu-demo.py`).

## Bản 4 – sửa ĐỘNG TÁC quay đầu / choáng / chết (chủ dự án chê "lật trang sách" + "bọ chết hoạt hình")

**Chỉ đổi hình, KHÔNG đổi luật / số** (`BO_SO` giữ nguyên: quay 24 bước, lật hướng ở bước 12, `lat` 30, choáng 120, `day` 30; biến mất ở bước 210 như cũ).
Đã quay lại 3 video: trạng thái Bọ từng bước trong `so-lieu.json` **trùng khít** bản trước (715 / 1069 khung như cũ). Quy ước chung cho mọi quái từ nay:
**`art/huong-moi/quai-rig/QUY-UOC-DONG-TAC-QUAI.md`**. Chi tiết rig: `art/huong-moi/quai-rig/bo-vo-moc/README.md` mục "Bản 4".

| | Trước (bản 1–3) | **Bản 4 (bây giờ)** |
|---|---|---|
| **Quay đầu** | thân co dẹt ngang tới 0,58 rồi lật = "lật trang sách" | **hãm** (chân trước cắm, thân dồn ra sau ~5 px, đầu rụt vào mai) → **bước 12 lật gương tức thì** + bụi nhỏ ở chân → mai **nảy nhẹ** do quán tính, chân **bước lại tại chỗ**, đầu thò ra. Không khung nào co ngang (đo: `sx` thấp nhất 1,0; quy ước ≥ 0,9). Clip khoá mỗi bước, bước lật không nội suy với bước trước |
| **Vỡ mai → choáng** | hất lật ngửa, giãy chân trên không | mai vỡ thành **3 mảng bật hé, lệch lên phía trước** (mảng sau vểnh đuôi), **thân sụp sấp**, chân khuỵu **run nhẹ**, lộ **mảng bụng mềm** dưới / sau mai (vẫn đánh được mọi hướng như luật). Tia/vòng/chữ "Vỡ mai!" giữ |
| **Đứng dậy** | lật úp lại, mai liền | nhấc thử – khuỵu lại – **chân chống, thân nhấc**; mai vỡ **vẫn lệch** (mảng lệch nhỏ hơn lúc choáng) và giữ tới chết (PH5) |
| **Chết** | giật, mai bay văng ra sau; nếu đang lật thì chết ngửa; vỡ tung hạt (`shatter`) | **khựng** → chân khuỵu, **thân đổ sụp** (chậm rồi nhanh, bụi thấp) → mai **nứt tách 3 mảng trượt rơi** (tiếng gỗ khô trầm) → **bụng xẹp**, tối dần → nằm im → **tan** thành vụn vỏ cây + **bụi bào tử xám ấm** bay lên chậm (không teal), xác khoét vụn dần + mờ hẳn trong **1 s** (bước 150 → 210). Bỏ `shatter`; rơi đồ (`dropShards`) giữ nguyên |

**Xem trong `game/kiem-thu-bo-vo-moc/`** (đã quay / chụp lại, H.264 60 hình/s `-preset veryfast`):
- `pha-quay-dau.png` – 9 khung (t1 … t24), lật gương giữa **t11 → t12**.
- `pha-vo-mai-choang-day.png` – vỡ mai → sụp choáng → dậy → đi tiếp với mai vẫn vỡ. `pha-chet-sup-tan-vun.png` – chết khi đứng (khựng → sụp → tách mai → tan).
  `pha-chet-mai-da-vo.png` – chết khi mai đã vỡ từ trước. Ảnh cắt 300×170 quanh Bọ, cỡ thật, nhãn = trạng thái + bước.
- `danh-mai-vo-sup-choang-60fps.mp4` (**đổi tên** từ `danh-mai-vo-lat-ngua-60fps.mp4`), `vong-ra-sau-danh-bung-60fps.mp4`, `cac-clip-60fps.mp4` (15,2 s, chuỗi `?xem=1` mới: quay có lật gương, chết có tan vụn).
- `sup-choang-lo-bung.png` (thay `nam-ngua-choang.png`), `chet-sup-tan-vun.png` (thay `chet-mai-roi.png`); các ảnh khác chụp lại cùng khung.
- Tư thế vẽ bằng Python (cùng ma trận): `art/huong-moi/quai-rig/bo-vo-moc/kiem/tu-the-ban-4.png`.

**Chưa thử trên iPhone thật** (vẫn Chromium headless, máy chủ không GPU). Chưa kiểm: cú lật ở 120 Hz (bước lật vẽ không nội suy nên ở 120 Hz đứng 2 khung);
tan vụn dùng 1 canvas phụ 320×190 × tỉ lệ màn trong 60 bước cho mỗi con đang tan – cần đo trên iPhone. Vẽ Bọ trên máy chủ 0,13 → **0,18 ms/khung**
(thêm 3 mảng mai khi mai đã vỡ). Gói hình 7 → 10 PNG ≈ 111 KB (thêm `mai-manh-1/2/3`).
**Còn hơi "hoạt hình", chưa đổi (không thuộc yêu cầu lần này):** 3 chấm quay tròn trên đầu lúc choáng (dấu choáng của bản thử) – có thể thay bằng thanh choáng
đơn giản nếu muốn; đầu khi chết gục hơi lún dưới mặt đất 1–2 px (bị mảng mai che, rồi tan).

Chạy lại riêng phần bản 4: `python3 -B game/thu-bo-vo-moc/cong-cu/quay-va-chup.py video anh pha` (sau khi chạy `dung_rig.py` và `tao-tu-demo.py`).

## Sửa theo phản hồi 5 (`docs/gameplay/PHAN-HOI-5-P0A.md` mục 3)

**Luật mới:** mai là **vỏ vật lý của quái thường** → phá **một lần**, **giữ vỡ** tới chết.

| | Trước (bản 2–3) | **Bây giờ** |
|---|---|---|
| Hết choáng, đứng dậy | "Dậy lại → mai đầy" (4 / 4) | Mai **vẫn vỡ** (0 / 4) tới chết. Thanh mai rỗng có gạch đồng, lớp nứt mai nặng giữ nguyên |
| Mai tự hồi | Không bị đánh vào mai 1,5 s → +1 nấc / 0,5 s | **Bỏ** (`BO_SO.maiHoi: false` – không có bộ đếm vô hình làm kín vỏ) |
| Sau khi dậy | – | Bọ **đánh tiếp** bình thường: đi, báo trước 0,5 s, húc, hồi, quay đầu |
| Đánh Bọ đã mất mai | – | **Mọi hướng** vào thân, mất 1 máu (hiệu ứng bụng: thân co + bụp ấm), không keng, không dội |
| Cộng hưởng vào Bọ đã mất mai | – | Không lật lại, chỉ **cộng 1 máu thêm** (không bị chặn) |
| Hộp đòn (`?hitbox=1`) | xanh = mai còn | **lục** cả thân khi mai đã vỡ (đứng hay nằm) |

Nhát làm vỡ mai vẫn **không** gây máu; choáng vẫn 120 bước (2 s); mọi số khác giữ nguyên. Thứ tự trong cùng bước: "mai đã vỡ" xét theo **đầu bước** như các luật cũ.

**Quay lại** `game/kiem-thu-bo-vo-moc/danh-mai-vo-lat-ngua-60fps.mp4` (bản 4 đổi tên `danh-mai-vo-sup-choang-60fps.mp4`; 17,8 s, 1069 hình, H.264 60 hình/s `-preset veryfast`, bot + bất tử):
chém mai keng → mai vỡ bước 367 → (bản 4: sụp) + choáng → bot chém 2 nhát (còn 2 máu) rồi **lùi ra chờ** → Bọ đứng dậy bước 546, **mai vẫn vỡ** →
Bọ **báo trước 596 → húc 626 → hồi 650** (bot lùi + nhảy né) → bot chém **trực diện**: mất máu (bước 711 phản ứng "đau") → chết bước 738.
Trạng thái từng bước: `so-lieu.json` → `video`. Cũng quay lại `vong-ra-sau-danh-bung-60fps.mp4` và 2 ảnh so mai / bụng (luật không đổi ở hai cảnh này, trạng thái trùng bản trước).
Bot chỉ để minh hoạ: đoạn "chờ Bọ dậy rồi húc một lần" là kịch bản của bot cho video, không phải luật.

**Cần biết / hỏi:** Bọ đã mất mai bị chém trực diện vẫn **khựng "đau" 16 bước** như khi trúng bụng (luật cũ không đổi). Nếu Lam chém liên tục thì Bọ có thể bị khựng
liên tục và ít có cơ hội húc. Lần này **không** đổi (không thêm luật mới); nếu muốn Bọ "đánh tiếp" rõ hơn, có thể cho cú húc đã báo trước không bị ngắt (như Chuông Gỗ ≥ 18 tick).

## Bản 3 – chỉnh HÌNH/VFX theo phản hồi 4 (`docs/gameplay/PHAN-HOI-4-QUAI-HUONG-MOI-VA-BO.md` mục 2, 3)

**Chỉ đổi hình, KHÔNG đổi luật / số gameplay** (`BO_SO` giữ nguyên). Đã quay lại 2 video chính: trạng thái Bọ từng bước ghi trong `so-lieu.json` **trùng khít** bản 2.

| | Bản 2 | **Bản 3 (bây giờ)** |
|---|---|---|
| Dấu "!" báo húc | có, tắt bằng `?dauthan=0` | **giữ nguyên** (cam đỏ, không teal), vẫn tắt được |
| Viền sáng toàn thân | không tăng | **không tăng** |
| Chớp khi **trúng bụng** | bóng **trắng đặc phủ cả con**, 7 khung (0,8 → 0,45) | **3 khung** (0,7 → 0,45 → 0,2), lớp chớp riêng của Bọ: **chỉ bụng** chớp **ấm** (kem-mật), mai/đầu/chân hắt ấm rất nhẹ; lớp chớp **bỏ đường bao (mép 2 px) và mảng tối** → vẫn thấy khối tối, viền và thân co |
| Tia **trúng bụng** | ảnh trúng đòn cỡ 0,85, đặt đúng chỗ dao chạm (che dao + một phần thân) | cỡ **0,38**, đặt ở **giữa bụng phía sau**, thấp hơn đầu, lệch khỏi lưỡi dao; vòng nhỏ **ấm** + 5 hạt ấm rơi chậm (mềm) |
| Thân co khi trúng bụng | bụng thắt 24 %, thân hẹp 10 %, dẹt 6 % | **bụng thắt 34 %, thân hẹp 15 %, dẹt 10 %** (clip `dau`) |
| Phản ứng khi **đánh mai** | thân nén 4 % / phình 2 % | **nhẹ hơn: 2,5 % / 1 %** (mai vẫn dội, đầu rụt) → co bụng khác hẳn |
| Tia **trên mai** | 5 tia dày 2 px, 9 bước, lõi 4 px; ảnh "keng" cỡ 1 | **nhỏ, sắc**: 4 vạch mảnh 1 px dài/ngắn xen kẽ, **6 bước**, lõi 2 px; ảnh "keng" cỡ **0,5**; kem trắng / đồng nhạt |
| Chữ "Keng! Mai cứng" | nhát 1–2 + mỗi nhát thứ 4 | **chỉ lần đầu** (hoặc mỗi lần khi `?huongdan=1`); sau đó chỉ **âm keng + tia + dội nhẹ** |
| Nâng sáng có chọn lọc | – | **đầu** sáng 0,92 → **0,96**, **bụng** ×1,06 → **×1,10** (mảnh PNG, `dung_rig.py`). Mai, chân **giữ nguyên**; không tăng độ rực, không chỉnh Bọ cho khớp Lam cũ |

**Đã quay lại** (`game/kiem-thu-bo-vo-moc/`, **cùng khung** với bản 2 để so): `keng-tia-tren-mai.png` (bước 5 sau nhát; là lần keng đầu nên vẫn có chữ),
`trung-bung-co-than.png` (bước 6 sau nhát: chớp đã tắt, thấy thân co + bụp ấm nhỏ ở bụng), `vong-ra-sau-danh-bung-60fps.mp4`, `danh-mai-vo-lat-ngua-60fps.mp4`
(H.264 60 hình/s, `-preset veryfast`; trong video "đánh mai" chữ chỉ hiện ở nhát đầu). **Chưa quay lại** các ảnh/video khác (`cac-clip-60fps.mp4`,
ảnh báo trước, cảnh, hitbox…) – chúng chỉ khác ở đầu/bụng sáng hơn chút.

**Chưa thử trên iPhone thật** (vẫn chỉ Chromium headless, máy chủ không GPU). Chưa kiểm: chớp 3 khung có còn đủ "trúng" trên màn nhỏ không;
tia mai 1 px có quá mảnh trên màn iPhone không; tạo lớp chớp lúc nạp (đọc pixel 7 mảnh, một lần) mất bao lâu trên iPhone.
**Chưa làm** từ mục 3: làm nền ngay sau vùng chiến đấu ít tương phản hơn (cảnh thuộc khối hướng mới, ngoài phạm vi lần này); "mép vũ khí" (Bọ không có vũ khí).
Lưu ý: lớp chớp dùng `getImageData`; mở trang bằng `file://` trình duyệt có thể chặn → tự lùi về chớp ấm một màu phủ mảnh (vẫn 3 khung).

Chạy lại riêng phần bản 3: `python3 -B game/thu-bo-vo-moc/cong-cu/quay-va-chup.py video2 so` (2 video chính + 2 ảnh so).

## 1. Đã đổi gì theo phản hồi 3 (mục 3, 4 và điểm 4 trong đoạn chốt)

**Số và luật** (đầu `cong-cu/khoi-bo.js`, mục `BO_SO`):

| | Bản 1 | **Bản 2 (bây giờ)** |
|---|---|---|
| Cao | 74 px | **74 px** (giữ) |
| Máu / mai | 4 / 4 | **4 / 4** (giữ) |
| Choáng sau vỡ mai | 3 s (180 bước) | **2 s (120 bước)** |
| Đánh vào mai | không mất máu | **không mất máu** (giữ); nhát làm vỡ mai cũng **không** gây máu |
| Cộng hưởng | luật riêng: vỡ mai **+ 3 máu** | **công thức chung** (KE-HOACH-GAMEPLAY-V2 mục 6b): hai nhát (Lam + bóng) xử lý như thường, rồi **thêm**: mai vỡ ngay + `floor(CH_MAU × máu gốc nhát Lam)` = **1 máu**, phần thêm không bị mai chặn; khoá Cộng hưởng 45 bước trên con đó. Bỏ chữ "×3" của demo |
| Lam bị dội khi chém mai | đặt tốc độ lùi 3,6 px/bước (trượt xa, át cả bước lao) | **tổng 4 px** trả trong 3 bước (1,5 + 1,5 + 1), **không đụng tốc độ Lam** → không khoá điều khiển; mép chân phía sau phải còn đất (không đẩy xuống hố); vướng vật thì dừng (không xuyên); đang nhảy / lướt thì bỏ |
| Chạm thân lúc Bọ đi bộ | mất máu (như Chuông Gỗ) | **không mất máu**. Chỉ **cú húc chủ động** (vùng húc đỏ trong `?hitbox=1`) gây sát thương |
| Dấu "!" | có | **giữ, to hơn** + tắt được bằng `?dauthan=0` |

**Thứ tự trúng trong cùng một bước** (phản hồi 3 mục 2, áp dụng luôn ở đây): mọi nhát trúng Bọ trong cùng một bước xét "mai còn / đã lật" theo
trạng thái **đầu bước**, nên đổi thứ tự duyệt không đổi kết quả. Đã chạy tay (không phải kiểm thử tự động) mấy cặp: mai 1 nấc, Lam + bóng cùng bước
đánh mai → máu 4 → 3 dù ai trước; Lam đánh bụng + bóng đánh mai cùng bước → 4 → 2 dù ai trước; Lam + bóng cùng đánh bụng → 4 → 1 (1 + 1 + thêm 1).
Nhát ở bước sau dùng trạng thái thật lúc trúng (mai đã vỡ thì vào bụng).

**Hình** (bằng code, **không gen lại**; chi tiết: `art/huong-moi/quai-rig/bo-vo-moc/README.md`):
- **Không tăng viền sáng toàn thân.** Mai tối hơn một chút, không neon.
- **Bụng phía sau** sáng hơn chút, kéo về **xám đất nhạt** (bớt vàng ngà) → tách mai / bụng bằng độ sáng.
- **Đầu**: tương phản cao hơn + viền **tối** mỏng tách khỏi mai.
- **Bị chặn**: tia va chạm nhỏ (5 tia kem/đồng, 9 bước) **ngay trên mép mai** chỗ chạm + "Keng" nhỏ; Bọ **không** nháy trắng.
- **Trúng bụng**: **cả thân co lại** (hẹp + dẹt, bụng thắt), nháy trắng (bản 3: thay bằng chớp ấm ngắn chỉ ở bụng), vòng mềm + hạt xám đất rơi, tiếng "bụp" trầm – khác hẳn keng (tiếng kim cao, tia sáng, không nháy).
- **Lật ngửa**: hiện **mảng bụng mềm** to (1,5× bụng) phủ mặt dưới thân, thở phập phồng.
- **Báo húc**: dấu "!" to ~3 lần (8×22 px, viền tối, bật lên rồi nhấp theo 2 tiếng gõ), đặt **trên** thanh mai để không bị che;
  thêm **chân sau cào đất** + bụi + sỏi bắn ra sau (cả khi tắt "!").

## 2. Xem gì trước (`game/kiem-thu-bo-vo-moc/`, đã quay lại)
| File | Nội dung |
|---|---|
| **`danh-mai-vo-sup-choang-60fps.mp4`** | **Quay lại bản 4**, 17,8 s: Lam đứng trước chém mai: keng + tia, dội nhẹ, mai nứt → **Vỡ mai!** → mai bật hé, sụp sấp lộ bụng, choáng 2 s (bot chém 2 nhát rồi lùi) → **đứng dậy, mai vẫn vỡ** → Bọ báo trước + húc lại → bot chém trực diện mất máu → chết (bot, bật bất tử) |
| **`vong-ra-sau-danh-bung-60fps.mp4`** | 11,9 s: Bọ báo trước (chân cào, "!") → húc, Lam lướt xuyên qua ra sau lưng, chém bụng (thân co), lặp tới chết |
| `cac-clip-60fps.mp4` | 15,2 s (bản 4): mọi clip theo thứ tự đi · báo trước · húc · hồi · quay (lật gương) · keng · trúng bụng · vỡ mai · sụp choáng · dậy · đứng · chết + tan |
| **`bao-truoc-huc.png`** / **`bao-truoc-huc-tat-dau-than.png`** | cùng một khung báo trước, có và **không** có dấu "!" – để so |
| **`keng-tia-tren-mai.png`** / **`trung-bung-co-than.png`** | chém mai (tia trên mai) và chém bụng (thân co + bụp mềm), cùng con, cùng chỗ |
| `sup-choang-lo-bung.png` | (bản 4) sụp choáng, mai vỡ hé, mảng bụng mềm · `pha-*.png`: từng pha quay đầu / choáng / chết |
| **`canh-huong-moi.png` / `canh-huong-moi-xam.png`** | Bọ trong cảnh tối hướng mới, bản màu + **xám** (chấm "không chìm nền"); `canh-mau-demo-hien-tai(-xam).png` = màu demo cũ |
| `so-co-lam-112-bo-74.png`, `man-choi.png`, `chet-sup-tan-vun.png`, `hitbox-bao-truoc.png` | ảnh 960×540 cỡ thật |

Video H.264 60 hình/s (`-preset veryfast`), mỗi hình = đúng 1 bước game. Số đo ở `so-lieu.json` (máy chủ không GPU): vẽ Bọ **0,13 ms/khung**,
cả khung TB 9,6 ms (phần lớn là cảnh). Gói hình vẫn 7 PNG ≈ 74 KB (mảnh bụng lật dùng lại ảnh bụng, không thêm file).

## 3. Luật hiện tại (tóm tắt)
| | |
|---|---|
| Đánh **trước mặt** (vào mai) | Keng + tia trên mai, dội nhẹ 4 px, **0 máu**, Thế mai −10 (nhát 3: −30; bóng ×0,5) (bản 5; cũ: −1 / −2 nấc). Mai nứt dần |
| Đánh **từ sau** (vào bụng) | −10 máu (bóng −2), thân co lại. Máu 40 (bản 5; cũ: −1 / 4) |
| Chém nảy (bổ xuống) | theo chỗ chạm: phần bụng lộ phía sau = bụng; trên mai = keng, **nảy lên được** |
| Thanh mai về 0 | **Vỡ mai** (nhát này 0 máu): (bản 4: sụp sấp, mai vỡ hé) lộ bụng, choáng **2 s**, đánh hướng nào cũng −1. **PH5: dậy lại mai vẫn vỡ tới chết**, Bọ đánh tiếp, đánh hướng nào cũng −1 |
| Cộng hưởng | như đòn thường + **thêm** vỡ mai ngay + 10 máu (công thức chung; cũ: + 1 / 4) |
| Mai hồi | **PH5: bỏ** (trước: không bị đánh vào mai 1,5 s → hồi 1 nấc mỗi 0,5 s). Mai chỉ nứt thêm, không tự lành |
| Tấn công | Lam **trước mặt** trong 240 px → **báo trước 0,5 s** → **húc** 0,4 s (~144 px) → **hồi 0,67 s** (húc vào tường hồi 1 s). **Chỉ cú húc** gây sát thương |
| Quay đầu | Lam ở sau lưng 0,5 s → quay **chậm** 0,4 s |

## 4. Câu hỏi còn lại
1. (PH5: mai giờ giữ vỡ sau khi dậy, nên dù không giết kịp trong lúc choáng thì phần còn lại vẫn đánh được mọi hướng.) **Choáng 2 s vẫn đủ giết từ đầy máu** nếu Lam đứng sát: trong video "đánh mai" bot (vụng) vẫn chém đủ 4 nhát trong lúc choáng (mai vỡ bước 367,
   chết bước 482). Có muốn hạ còn ~1,5 s, hoặc để Bọ **dậy sớm** khi bị đánh N nhát, để "phá mai" và "vòng ra sau" cân hơn? Hay giữ để thử người thật trước?
2. **Dội 4 px** có còn cảm được "keng" không, hay bây giờ quá nhẹ (trên máy chủ nhìn Lam gần như đứng yên)? Có thể thử 5 px hoặc thêm khựng tay 2–3 bước (không khoá di chuyển).
3. **Dấu "!"**: so `bao-truoc-huc.png` với bản tắt. Khi có người mới thử, hỏi họ có tự nhận ra "khép mai + cào chân = sắp húc" khi tắt "!" không.
4. ~~Trúng bụng nháy trắng cả thân~~ → **bản 3**: chỉ bụng chớp ấm, 3 khung, giữ mảng tối + viền. Cần người thật xem có còn đủ "trúng" không.
5. **Bụng xám đất nhạt** đã đủ tách khỏi mai trong bản xám chưa, hay cần sáng hơn nữa? (Đã giữ "một chút" theo phản hồi.)
6. ~~Bóng đánh Bọ mất 1 máu đủ như Lam~~ → **bản 5**: thang ×10, bóng −2 máu / −5 Thế (`BONG_MAU` 0,25 / `BONG_THE` 0,5 chung).

## 5. Cái chưa đẹp / cần biết
- ~~Lúc nằm ngửa cả đầu cũng lộn ngược~~ → bản 4 bỏ lật ngửa (sụp sấp).
- **Đầu đặt đè lên mai** (để che khoang tối dưới mai); viền tối mới làm mép này rõ hơn.
- Lớp nứt mai và tia va chạm vẽ bằng code, chưa phải art gen.
- Lam vẫn là Lam cũ (blue chibi) – lệch tông với Bọ hướng mới.
- Bot trong video chỉ để minh hoạ, đánh vụng.

## 6. Chạy lại
```
cd art/huong-moi/quai-rig/bo-vo-moc/code && python3 tach.py && python3 khop.py && python3 dung_rig.py   # art + rig
python3 game/thu-bo-vo-moc/cong-cu/tao-tu-demo.py                                                      # sinh index.html từ demo.html
python3 -B game/thu-bo-vo-moc/cong-cu/quay-va-chup.py video anh                                         # video + ảnh (~4 phút)
```
`tao-tu-demo.py` liệt kê **9 chỗ cần ghép** khi đưa Bọ vào `demo.html` (nạp gói, đặt lại, lưu vị trí, cập nhật, vẽ, trúng đòn, chém nảy, hitbox, khối mã).
