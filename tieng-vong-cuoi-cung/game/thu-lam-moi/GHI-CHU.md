# Thử Lam mới "Cổ tích chuông tàn": ĐỨNG nghe · CHẠY · CHÉM đòn 1 (27/10/2026) – BẢN CHỜ DUYỆT CHUYỂN ĐỘNG

Viết cho người không rành kỹ thuật. Đợt này **chỉ** làm 3 chuyển động để anh xem và duyệt. **Chưa ghép vào game**:
`game/demo.html`, `build-demo.py` không sửa; Lam cũ (rig-v4) giữ nguyên vì game còn dùng.
**Chưa thử trên iPhone thật** – mọi ảnh, video, số đo ở đây lấy trong Chromium headless trên máy chủ Linux không có GPU.

**Chơi thử:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-lam-moi/thu-lam-moi.html

| Cách bấm | |
|---|---|
| ← → (hoặc A, D) / nút ◀ ▶ | chạy trái, phải. Nhả phím → Lam dừng và đứng nghe |
| X (hoặc J, K) / nút **Chém** | chém đòn 1 |
| thêm `?so=1` vào cuối link | có thêm **Lam cũ** (rig-v4) đứng cạnh, cùng phím → so trực tiếp |
| thêm `?rim=0` | tắt vệt sáng mép mũ/vai + quầng sáng mờ sau lưng + vũng sáng dưới chân (để xem Lam "trần") |
| thêm `?debug=1` | hiện hộp đòn (khung đỏ) + điểm chân + số khung |

Nhiều cờ nối bằng `&`, ví dụ `...thu-lam-moi.html?so=1&rim=0`.

## 1. Xem gì trước

| File | Nội dung |
|---|---|
| **`xem-thu/so-cu-moi-60fps.mp4`** | **xem đầu tiên**: Lam cũ (trái) và Lam mới (phải) cùng đứng – chạy qua lại – chém, 12 s, 60 hình/giây |
| `xem-thu/dung-nghe-60fps.mp4` | đứng nghe 6 s (thở 2 nhịp; giây 3,4–5,6 nghiêng đầu nghe chuông) |
| `xem-thu/chay-qua-lai-60fps.mp4` | chạy phải, nhả (giảm tốc), chạy tiếp, quay đầu, chạm mép cảnh, dừng |
| `xem-thu/chem-3-lan-60fps.mp4` (+ `-hop-don-`) | 3 lần chém: đứng chém, đang chạy chém, chém quay trái (bản `-hop-don-` có khung đỏ hộp đòn) |
| `xem-thu/dung.png`, `chay.png`, `chem.png` (+ `-xam.png`) | ảnh 960×540 cảnh chuẩn; bản xám để chấm sáng–tối |
| `xem-thu/so-cu-moi-{dung,chay,chem}.png` (+ `-xam`) | Lam cũ \| Lam mới cùng cảnh |
| `xem-thu/dung-khong-vet-sang.png` (+ `-xam`) | `?rim=0` – để thấy vệt sáng/quầng/vũng giúp được bao nhiêu |
| `xem-thu/chem-hop-don.png`, `man-choi-co-nut.png` | hộp đòn lúc trúng; màn có nút cảm ứng |
| `art/huong-moi/lam-rig/gif/*-lon.gif`, `*-112px.gif` | GIF lớn (Lam cao 448 px, vẽ thẳng từ rig) + GIF đúng cỡ game 112 px (không phóng) |
| `art/huong-moi/lam-rig/kiem/rap-so-sanh.png` | ảnh chốt \| ráp từ 13 mảnh \| chồng bóng \| khác màu |
| `art/huong-moi/lam-rig/kiem/rap-tach-lop.png` | 13 mảnh, mỗi mảnh một màu + từng mảnh rời |

Các GIF đúng nhịp: chạy 25 hình × 20 ms = 0,50 s; đứng 60 × 100 ms = 6 s; chém 20 ms/hình. Có bản chậm (`-cham-x5/x6`) để soi.

## 2. Đã làm gì

**Tách + ráp 13 mảnh** (`art/huong-moi/lam-rig/`): mũ, chóp mũ, mắt (một mắt hổ phách), chuông có đoạn dây, áo choàng vai,
thân áo, vạt trước, vạt sau, găng gần (kèm tay áo), găng xa, dao, 2 mũi ủng.
- Tách bảng mảnh: tô loang nền trắng từ mép ảnh + lỗ trắng kín (lòng vòng dây chuông), khử viền trắng ở mép → không còn quầng trắng.
- **Đo cỡ** bảng mảnh so với ảnh đã chốt (`manh/do-co.json`): dao 1,07 · chuông 1,06 · mắt 1,04 (cao) · mũ 1,15 × 1,12 – tức bảng mảnh
  gần đúng cỡ ảnh chốt. Riêng **vải** (thân, 2 vạt, áo choàng vai) trong bảng mảnh **khác hình** ảnh chốt (thân là cái nón dài, vạt là
  hai cái váy rời), nên không ráp nguyên được.
- Vì vậy mỗi mảnh = **phần nhìn thấy lấy đúng từ ảnh chốt** + **phần bị che lấp thêm** (mũ, chuôi dao, găng xa, 2 ủng lấy từ bảng mảnh;
  vải kéo dài vân theo nếp dọc, tối hơn 8 %). Ráp lại dáng nghỉ **trùng ảnh chốt: IoU 0,9996** (yêu cầu ≥ 0,97), lệch màu trung bình 0,07/255.
- Chóp mũ là mảnh riêng, xoay quanh điểm neo **giấu trong lòng mũ**; chân chóp đè lên mũ có mép mềm 20 px nên lúc xoay không lộ vết cắt.
- Thứ tự vẽ (sau → trước): găng xa, ủng xa, vạt sau, thân, ủng gần, vạt trước, áo choàng vai, mũ, chóp, mắt, chuông, dao, găng gần.
  Dao nằm **dưới** găng gần để nắm tay che chuôi như ảnh chốt. Tay áo sát áo, mũi ủng nằm dưới vạt – không có khoảng trắng rời rạc.
- Găng xa + ủng xa tối 10 % (như rig-v4).

**3 clip** (mục 4 tư vấn): động tác chính đặt mốc theo tick rồi nội suy mượt (Hermite đơn điệu); động tác phụ (mũ, chóp, chuông,
áo vai, 2 vạt, dao trong tay) là **lò xo tắt dần**, bị thân kéo theo → tự trễ đúng chuỗi *thân → mũ → chóp/chuông*. Mỗi lò xo một
tần số + độ tắt riêng → **không mảnh nào chạy cùng một đường sin**.

| | Số đo (`art/huong-moi/lam-rig/so-lieu.json`) |
|---|---|
| **ĐỨNG = lắng nghe** | thở 3 s/nhịp (hít chậm – ngừng – thở ra dài, không phải sin); đỉnh mũ lên xuống **0,60 px logic** (< 1); vòng lặp 6 s, nối vòng lệch 0,1 px; giây 3,4–5,6 mũ cúi 5,6° về phía chuông rồi ngẩng lại, chóp mũ đung đưa trễ (xa nhất 5,6 px), chuông + 2 vạt trễ nhịp nhẹ. Khung 0 = đúng ảnh chốt. 72 khung × 5 tick |
| **CHẠY** | 30 khung = 132 px logic/chu kỳ ở 264 px/s (đúng tốc độ game), phát theo **quãng đường** như rig-v4 (mỗi bước game = 1 khung). Chân chịu lực **trượt ≤ 0,19 px logic/bước**. Thân nghiêng tới 7–9°, nhấc khỏi dáng nghỉ 1,5–4,7 px (vạt hở, ủng ló dưới vạt), nén 2,6 % lúc chịu lực / giãn 1,8 % lúc đạp (mũ, chuông, tay giữ cỡ). Mũ trễ, chóp kéo ra sau 5–13°, chuông lắc 9–16°, 2 vạt xoay theo bước chân, tay gần vung ngược chân gần |
| **CHÉM đòn 1** | 26 khung = atkT 1…26, **khớp ATK[1] của demo.html** (su 11 / ac 8 / re 8, hộp [4, −97, 91, 48] – script đọc và kiểm). Nén 1–5 (khuỵu 2,8 %, ngả sau, kéo tay ra sau ngang vai) → giữ thế 6–9 → **vung 9→11 (2 tick)** qua trước ngực → trúng 11–18 (bước tới bằng ủng gần, thân chúi 10–12°, dao duỗi thẳng ra trước, hơi chếch lên) → **hồi chậm 19–26**. Dao có hướng riêng: bị kéo trễ khi vung rồi quất qua. Mũi dao **nằm trong hộp đòn 8/8 bước** hộp bật. Ủng bù đúng quãng game tự đẩy Lam tới (lunge 4,4 px) → trôi trên đất ≤ 0,46 px |

**Trang thử** `thu-lam-moi.html`: cảnh chuẩn co về 960×540, sàn rễ ở y 416 (~¾ dưới). Vật lý chạy/chém chép đúng game (tăng tốc 6 bước,
giảm 5, quay đầu ×1,6, lunge). Có **vệt sáng mép mũ/chóp/vai vẽ sẵn** (sheet riêng, màu lõi đèn #F2D69A, chỉ phía trên-trước, không viền
cả người), **quầng sáng mờ sau lưng** và **vũng sáng dưới chân** – cả hai vẽ sẵn 1 lần lúc nạp; **không dùng shadowBlur**, không lọc ảnh mỗi khung.

## 3. Tự chấm theo tiêu chí duyệt của tư vấn

| Tiêu chí | Tự chấm | Vì sao |
|---|---|---|
| Nhìn ở cỡ chơi vẫn nhận ra **mắt – mũ – chuông** | **Đạt** (chuông hơi nhỏ) | Mắt hổ phách là điểm sáng nhất trên người; mũ + chóp là bóng rõ nhất; chuông đồng đọc được nhưng chỉ ~8×15 px, lúc chạy lẫn vào áo choàng vai (xem `gif/*-112px.gif`) |
| **Lam không chìm** trong tối | **Đạt một phần** | Bản xám `dung-khong-vet-sang-xam.png`: áo xanh đậm gần cùng độ sáng thân cây phía sau → chìm. Có vệt sáng + quầng + vũng (`dung-xam.png`) thì bóng Lam tách ra, nhưng vẫn tối hơn Lam cũ nhiều. Đứng trước vùng sáng (đèn, sàn) thì rõ; đứng trước gốc cây tối thì yếu nhất |
| Có **sức nặng**, không cứng | **Khá** – cần anh xem video | Có nén/giãn 2–3 %, nén trước khi vung, vung 2 tick rồi hồi chậm, chuỗi trễ thân → mũ → chóp/chuông, 2 vạt theo chân. Nhưng chạy **không có chân** (chỉ mũi ủng) nên trông như "lướt nảy" hơn là chạy sải |

## 4. Cái chưa đẹp / cần biết
- **Tầm dao ngắn hơn hộp đòn**: mũi dao xa nhất khi hộp bật **68,5 px logic**, mép trước hộp đòn ở **95 px** → hộp dài hơn dao **26,5 px**
  (hộp 91 đã sửa theo dao Lam cũ đầu to, tay dài). Đã cho Lam bước tới + chúi người tới mức tối đa còn giữ dáng. Xem câu hỏi 1.
- Lúc chém, thân Lam dồn tới trước collider tới **13 px logic** (rồi lùi về khi hồi) – nhìn như bước vào đâm; nếu sau này có combo 2–3
  thì phải nối tiếp từ tư thế này.
- **Phần bị che lộ ra** khi tay vung / vạt tung (thân dưới tay áo, thân dưới vạt trước) là vân vải kéo dài + tối hơn: ở 112 px gần như
  không thấy, ở GIF lớn thấy vệt dọc và mép vạt trước thành một đường thẳng khi vạt xoay mạnh.
- Thế kéo tay ra sau: tay áo là một mảnh cứng nên lúc vung qua ngực tay chỉ "ngắn lại" 1 tick – xem chậm thấy hơi giả.
- Chạy: đỉnh mũ nảy **5,1 px logic** (Lam cũ v4: 3,1) vì thân nhấc lên cho ủng ló; có thể thấy hơi "nhún" – xem câu hỏi 2.
  Mũi ủng nhỏ (~8×4 px ở 112 px) nên bước chân khó thấy; găng xa gần như không bao giờ lộ.
- Vệt sáng mép mũ đi theo Lam (lật khi Lam quay trái), chưa theo hướng đèn thật trong cảnh.
- Mảnh chuông dính một mẩu nhỏ mép áo choàng vai; quả lắc + vòng dây ngắn.
- **RAM sheet** (giải nén): đứng 9,8 MB + chạy 5,6 MB + chém 7,8 MB, cộng sheet vệt sáng cùng cỡ ≈ **46 MB** – nặng cho iPhone; có thể
  giảm đứng còn 36 khung (10 tick) và cắt sheet vệt sáng sát hình. Chưa đo trên máy thật. Thời gian vẽ 1 bước (2 Lam, máy chủ không GPU)
  10–23 ms – không dùng được để đoán iPhone.

## 5. Câu hỏi cần anh quyết
1. **Hộp đòn đòn 1**: (a) thu hộp cho khớp dao Lam mới – rộng 91 → **~66** (mép trước 70 px); (b) giữ 91, coi vệt chém phủ phần thiếu;
   hay (c) cho tay/dao vươn dài hơn ảnh chốt? Tôi đề xuất **(a)** để "thấy trúng mới trúng".
2. Chạy: giữ độ nảy đầu ~5 px như bản này, hay giảm về ~3 px (đỡ nhún, ủng ít ló hơn)?
3. Lam chìm: giữ cách "vệt sáng + quầng + vũng vẽ sẵn" và tăng thêm, hay gen lại mũ có mép sáng hơn (sáng hơn ở ảnh gốc)?
4. Đứng nghe: nghiêng đầu nghe chuông 1 lần / 6 s – thưa quá, dày quá hay vừa?
5. Duyệt xong thì làm tiếp gì trước: nhảy/rơi + bám/trượt tường (chóp gập xuống như đã chốt), combo đòn 2–3, rồi ghép vào `demo.html`?

## 6. Chạy lại
```
cd art/huong-moi/lam-rig/code && python3 chay_het.py      # mảnh + clip + sheet + GIF (~6 phút); cần pillow numpy scipy opencv-python
python3 game/thu-lam-moi/cong-cu/quay.py                  # ảnh + video xem-thu/ (~6 phút); cần playwright + Chromium, ffmpeg
```
`xem-thu/so-do.json`: số hình mỗi video, lỗi trang (= 0).
