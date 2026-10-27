# Thử quái mới: Bọ Vỏ Mộc – BẢN 2, đã chỉnh theo phản hồi 3 (27/10/2026)

Viết cho người không rành kỹ thuật. Đây là **trang thử riêng**, sinh từ `game/demo.html` bằng script (`cong-cu/tao-tu-demo.py`), giống các
thư mục `thu-*` khác. **KHÔNG sửa** `game/demo.html`, `build-demo.py`, `docs/gameplay/`, `game/thu-p0a/`, `game/thu-quai-huong-moi/`.

> **Chưa thử trên iPhone thật.** Ảnh, video, số đo đều lấy trong Chromium headless trên máy chủ Linux không có GPU. Độ mượt, độ nhạy,
> cảm giác "dội", âm thanh và việc dấu báo có đọc được trên màn nhỏ hay không **chưa được kiểm**. Các con số dưới đây là kiểm bằng code.

**Chơi thử:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-bo-vo-moc/index.html

Vào trận là đứng ngay trong **phòng thử phẳng** (phòng "Điểm lưu" cũ, đã bỏ 2 bệ, chặn tường hai đầu, chuông lưu dời về đầu phòng), có **2 con Bọ**.
Lam là **Lam hiện có của game** (rig-v4), phím/nút y như demo. Cảnh có ánh sáng + màu hướng mới (khối của `thu-huong-moi`).

| Cờ thêm vào cuối link (nối bằng `&`) | Làm gì |
|---|---|
| **`?dauthan=0`** (mới) | **tắt dấu "!"** báo húc – để so: chỉ còn cúi đầu, rung mai, chân sau cào đất + bụi, lóe cam đỏ, 2 tiếng gõ mai |
| `?hitbox=1` (hoặc phím H / nút ▣) | hộp thân (xanh), phần bụng lộ (lục đứt), vùng húc (cam = sắp húc, đỏ = đang húc) + chữ trạng thái/clip |
| `?xem=1` | 2 con đứng yên diễn lần lượt **mọi clip** (con trái nhìn trái, con phải nhìn phải) |
| `?mot=1` | chỉ 1 con |
| `?battu=1` | Lam không chết |
| `?mau=0` | ẩn chấm máu (chấm máu chỉ có ở bản thử) |
| `?hm=0` | tắt màu/ánh sáng hướng mới (cảnh như demo hiện tại) |

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
- **Trúng bụng**: **cả thân co lại** (hẹp + dẹt, bụng thắt), nháy trắng, vòng mềm + hạt xám đất rơi, tiếng "bụp" trầm – khác hẳn keng (tiếng kim cao, tia sáng, không nháy).
- **Lật ngửa**: hiện **mảng bụng mềm** to (1,5× bụng) phủ mặt dưới thân, thở phập phồng.
- **Báo húc**: dấu "!" to ~3 lần (8×22 px, viền tối, bật lên rồi nhấp theo 2 tiếng gõ), đặt **trên** thanh mai để không bị che;
  thêm **chân sau cào đất** + bụi + sỏi bắn ra sau (cả khi tắt "!").

## 2. Xem gì trước (`game/kiem-thu-bo-vo-moc/`, đã quay lại)
| File | Nội dung |
|---|---|
| **`danh-mai-vo-lat-ngua-60fps.mp4`** | 13,6 s: Lam đứng trước chém mai: keng + tia, dội nhẹ (bây giờ Lam **gần như đứng tại chỗ**), mai nứt → **Vỡ mai!** → lật ngửa lộ bụng, choáng 2 s → chém tới chết (bot, bật bất tử) |
| **`vong-ra-sau-danh-bung-60fps.mp4`** | 11,9 s: Bọ báo trước (chân cào, "!") → húc, Lam lướt xuyên qua ra sau lưng, chém bụng (thân co), lặp tới chết |
| `cac-clip-60fps.mp4` | 13,4 s: mọi clip theo thứ tự đi · báo trước · húc · hồi · quay · keng · trúng bụng · lật · nằm ngửa · dậy · đứng · chết |
| **`bao-truoc-huc.png`** / **`bao-truoc-huc-tat-dau-than.png`** | cùng một khung báo trước, có và **không** có dấu "!" – để so |
| **`keng-tia-tren-mai.png`** / **`trung-bung-co-than.png`** | chém mai (tia trên mai) và chém bụng (thân co + bụp mềm), cùng con, cùng chỗ |
| `nam-ngua-choang.png` | lật ngửa, mảng bụng mềm |
| **`canh-huong-moi.png` / `canh-huong-moi-xam.png`** | Bọ trong cảnh tối hướng mới, bản màu + **xám** (chấm "không chìm nền"); `canh-mau-demo-hien-tai(-xam).png` = màu demo cũ |
| `so-co-lam-112-bo-74.png`, `man-choi.png`, `chet-mai-roi.png`, `hitbox-bao-truoc.png` | ảnh 960×540 cỡ thật |

Video H.264 60 hình/s (`-preset veryfast`), mỗi hình = đúng 1 bước game. Số đo ở `so-lieu.json` (máy chủ không GPU): vẽ Bọ **0,13 ms/khung**,
cả khung TB 9,6 ms (phần lớn là cảnh). Gói hình vẫn 7 PNG ≈ 74 KB (mảnh bụng lật dùng lại ảnh bụng, không thêm file).

## 3. Luật hiện tại (tóm tắt)
| | |
|---|---|
| Đánh **trước mặt** (vào mai) | Keng + tia trên mai, dội nhẹ 4 px, **0 máu**, thanh mai −1 (nhát 3: −2). Mai nứt dần |
| Đánh **từ sau** (vào bụng) | −1 máu, thân co lại. Máu 4 |
| Chém nảy (bổ xuống) | theo chỗ chạm: phần bụng lộ phía sau = bụng; trên mai = keng, **nảy lên được** |
| Thanh mai về 0 | **Vỡ mai** (nhát này 0 máu): lật ngửa lộ bụng, choáng **2 s**, đánh hướng nào cũng −1. Dậy lại → mai đầy |
| Cộng hưởng | như đòn thường + **thêm** vỡ mai ngay + 1 máu (công thức chung) |
| Mai hồi | không bị đánh vào mai 1,5 s → hồi 1 nấc mỗi 0,5 s |
| Tấn công | Lam **trước mặt** trong 240 px → **báo trước 0,5 s** → **húc** 0,4 s (~144 px) → **hồi 0,67 s** (húc vào tường hồi 1 s). **Chỉ cú húc** gây sát thương |
| Quay đầu | Lam ở sau lưng 0,5 s → quay **chậm** 0,4 s |

## 4. Câu hỏi còn lại
1. **Choáng 2 s vẫn đủ giết từ đầy máu** nếu Lam đứng sát: trong video "đánh mai" bot (vụng) vẫn chém đủ 4 nhát trong lúc choáng (mai vỡ bước 367,
   chết bước 482). Có muốn hạ còn ~1,5 s, hoặc để Bọ **dậy sớm** khi bị đánh N nhát, để "phá mai" và "vòng ra sau" cân hơn? Hay giữ để thử người thật trước?
2. **Dội 4 px** có còn cảm được "keng" không, hay bây giờ quá nhẹ (trên máy chủ nhìn Lam gần như đứng yên)? Có thể thử 5 px hoặc thêm khựng tay 2–3 bước (không khoá di chuyển).
3. **Dấu "!"**: so `bao-truoc-huc.png` với bản tắt. Khi có người mới thử, hỏi họ có tự nhận ra "khép mai + cào chân = sắp húc" khi tắt "!" không.
4. **Trúng bụng nháy trắng cả thân** – rất rõ nhưng có thể quá chói trong cảnh tối; muốn chỉ nháy phần bụng không? (cần tách cache nháy theo mảnh, chưa làm).
5. **Bụng xám đất nhạt** đã đủ tách khỏi mai trong bản xám chưa, hay cần sáng hơn nữa? (Đã giữ "một chút" theo phản hồi.)
6. Bóng (Vọng) đánh Bọ hiện vẫn mất **1 máu đủ** như Lam (trang thử chưa có `BONG_MAU`); khi Bọ vào P0-B sẽ dùng `BONG_MAU`/`BONG_THE` chung (0,25 → tối thiểu 1, nên kết quả hiện giống nhau).

## 5. Cái chưa đẹp / cần biết
- Lúc **nằm ngửa** cả đầu cũng lộn ngược (lật quanh trục ngang) – ở cỡ chơi đọc được là "lật ngửa giãy chân".
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
