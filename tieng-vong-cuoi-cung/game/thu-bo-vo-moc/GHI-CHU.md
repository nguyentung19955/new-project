# Thử quái mới: Bọ Vỏ Mộc (27/10/2026) – BẢN CHỜ DUYỆT

Viết cho người không rành kỹ thuật. Đây là **trang thử riêng**, sinh từ `game/demo.html` bằng script (`cong-cu/tao-tu-demo.py`), giống các
thư mục `thu-*` khác. **KHÔNG sửa** `game/demo.html`, `build-demo.py` hay `game/thu-chien-dau/`. **Chưa thử trên iPhone thật** – ảnh, video,
số đo đều lấy trong Chromium headless trên máy chủ Linux không có GPU.

**Chơi thử:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-bo-vo-moc/index.html

Vào trận là đứng ngay trong **phòng thử phẳng** (phòng "Điểm lưu" cũ, đã bỏ 2 bệ, chặn tường hai đầu, chuông lưu dời về đầu phòng), có **2 con Bọ**.
Lam là **Lam hiện có của game** (rig-v4), phím/nút y như demo. Cảnh có ánh sáng + màu hướng mới (khối của `thu-huong-moi`).

| Cờ thêm vào cuối link (nối bằng `&`) | Làm gì |
|---|---|
| `?hitbox=1` (hoặc phím H / nút ▣) | hộp thân (xanh), phần bụng lộ (lục đứt), vùng húc (cam = sắp húc, đỏ = đang húc) + chữ trạng thái/clip |
| `?xem=1` | 2 con đứng yên diễn lần lượt **mọi clip** (con trái nhìn trái, con phải nhìn phải) |
| `?mot=1` | chỉ 1 con |
| `?battu=1` | Lam không chết |
| `?mau=0` | ẩn chấm máu (chấm máu chỉ có ở bản thử) |
| `?hm=0` | tắt màu/ánh sáng hướng mới (cảnh như demo hiện tại) |

## 1. Xem gì trước (`game/kiem-thu-bo-vo-moc/`)
| File | Nội dung |
|---|---|
| **`vong-ra-sau-danh-bung-60fps.mp4`** | 12 s: Bọ báo trước → húc, Lam **lướt xuyên qua** ra sau lưng, chém bụng (giật, mất máu); Bọ quay đầu chậm, lặp lại tới chết (mai rơi, bụng xẹp) |
| `danh-mai-vo-lat-ngua-60fps.mp4` | 14 s: Lam đứng trước chém mai: **Keng**, bị dội lùi, thanh mai giảm, mai nứt dần → **Vỡ mai!** → lật ngửa giãy, choáng → chém tới chết (bot vụng, có trúng đòn; bật bất tử) |
| `cac-clip-60fps.mp4` | 13 s: mọi clip theo thứ tự đi · báo trước · húc · hồi · quay · keng · trúng bụng · lật · nằm ngửa · dậy · đứng · chết |
| `so-co-lam-112-bo-74.png` | Lam đứng cạnh Bọ, cỡ thật |
| `man-choi.png`, `bao-truoc-huc.png`, `nam-ngua-choang.png`, `chet-mai-roi.png`, `hitbox-bao-truoc.png` | ảnh 960×540 cỡ thật |
| `canh-huong-moi(-xam).png`, `canh-mau-demo-hien-tai(-xam).png` | Bọ trong cảnh tối hướng mới / màu demo hiện tại; bản xám để chấm "không chìm nền" |

Video mỗi hình = đúng 1 bước game (60/s). Art + rig: `art/huong-moi/quai-rig/bo-vo-moc/README.md`.

## 2. Đã làm gì
**Art** (`art/huong-moi/quai-rig/bo-vo-moc/`): tách nền trắng (giữ viền tối, không quầng trắng), cắt **5 mảnh** mai · bụng · đầu · chân trước · chân sau;
đo mảnh rời to hơn hình nguyên con 1/0,89 lần rồi ráp theo hình nguyên con (`kiem/rap-so-nguyen-con.png`). Mảnh 2x + JSON rig cùng định dạng
quái mới đang có (`QBR.napThem`). Hai cụm chân dùng lại làm **chân phía xa** (tối 45 %, lệch pha) nên khi đi thấy 4 nhịp chân. Thêm 2 lớp **nứt mai**.
**Màu hướng mới**: tối, gỗ về dải #39312E–#65503C, rêu xanh → olive xỉn, bụng ngà dịu (vẫn là chỗ sáng nhất – dấu hiệu điểm yếu), mắt hổ phách giữ sáng,
**vệt sáng mép trên-trước vẽ sẵn** (#F2D69A) ở mai/đầu/bụng để không chìm nền. Không dùng shadowBlur, không xử lý ảnh mỗi khung.
**Cỡ**: cao **74 px**, dài 128 px (Lam 112).

**Luật trong trang thử** (số ở đầu `cong-cu/khoi-bo.js`, mục `BO_SO`):
| | |
|---|---|
| Đánh **trước mặt** (vào mai) | "Keng", Lam **bị dội lùi**, Bọ **không mất máu**, chỉ trừ **thanh mai** (đồng, 4 nấc trên đầu): đòn thường −1, nhát 3 −2. Mai nứt dần |
| Đánh **từ sau** (vào bụng) | mất máu đủ (1; Cộng hưởng 3), bụng giật. Máu 4 |
| Chém nảy (bổ xuống) | theo chỗ chạm: phần bụng lộ phía sau = bụng; trên mai = keng, **nảy lên được** |
| Thanh mai về 0 | **Vỡ mai**: lật ngửa, choáng **3 s** (3 chấm sáng quay + thanh đếm), đánh hướng nào cũng mất máu, không gây sát thương chạm. Dậy lại → mai đầy |
| Cộng hưởng trúng mai | mai vỡ ngay + 3 máu |
| Mai hồi | không bị đánh vào mai 1,5 s → hồi 1 nấc mỗi 0,5 s |
| Tấn công | Lam ở **trước mặt** trong 240 px → **báo trước 0,5 s** (cúi đầu, rung mai, 2 tiếng khép mai gõ gỗ, lóe **cam đỏ**, dấu "!") → **húc** 0,4 s (~144 px) → **hồi 0,67 s** (dễ vòng ra sau; húc vào tường hồi 1 s) |
| Quay đầu | Lam ở sau lưng 0,5 s → quay **chậm** 0,4 s – đủ chém 1–2 nhát vào bụng |
| Đi | 36 px/s, chân bước khớp tốc độ (không trượt), mai nhấp nhô trễ nhịp |

Thanh mai **tách riêng** khỏi Thế của boss/tinh anh (theo phản hồi 1 mục 5) – đây chỉ là vỏ cứng của quái thường.

**Số đo** (`game/kiem-thu-bo-vo-moc/so-lieu.json`, máy chủ không GPU): nạp gói Bọ 40 ms · 7 PNG = 74 KB · bộ nhớ ảnh 1,6 MB (gồm ảnh trắng/tối/cam
cache sẵn). Vẽ 2 con: **0,14 ms/khung**. Cả khung (có ánh sáng hướng mới) TB 9,8 ms – phần lớn là cảnh, không phải Bọ.

## 3. Cái chưa đẹp / cần biết
- Lúc **nằm ngửa** cả đầu cũng lộn ngược (lật quanh trục ngang) – nhìn hơi lạ ở cỡ lớn, ở cỡ chơi đọc được là "lật ngửa giãy chân".
- **Đầu đặt đè lên mai** (để che khoang tối dưới mai) nên mép trên đầu cắt thẳng vào mai; ở 74 px khó thấy.
- Lớp nứt mai vẽ bằng code (đường gãy), chưa phải art gen.
- Lam vẫn là Lam cũ (blue chibi) – lệch tông với Bọ hướng mới; khi ghép Lam mới cần xem lại độ tương phản.
- Bot trong video chỉ để minh hoạ, đánh vụng (video "đánh mai" Lam có trúng đòn).

## 4. Câu hỏi cần anh duyệt
1. **Cỡ** 74 px cao / 128 px dài có ổn? (dài vì mai thấp, bè). Muốn gọn hơn có thể hạ 70 px.
2. Đánh vào mai **0 máu** hay cho trầy nhẹ (vd. 0,25)? Hiện 0 – đúng chữ "gần như không mất máu" nhưng nghiêng về "bắt buộc vòng ra sau / phá mai".
3. Số nấc mai **4** (nhát 3 trừ 2), choáng **3 s**, máu **4**: nhanh / chậm?
4. Cộng hưởng vào mai: vỡ ngay **và** mất 3 máu – hay chỉ vỡ mai?
5. Lam có nên **bị dội lùi** khi chém mai (hiện 3,6 px/bước) – rõ "keng" nhưng làm chậm nhịp đánh?
6. Báo trước 0,5 s: lóe cam đỏ + dấu "!" + rung mai + 2 tiếng gõ – đủ rõ, hay bỏ dấu "!" cho đỡ rối?
7. Chạm thân lúc Bọ đi bộ cũng mất máu (như Chuông Gỗ) – giữ, hay chỉ mất máu khi bị húc?
8. Màu: Bọ có đủ nổi trong cảnh tối (`canh-huong-moi-xam.png`)? Vệt sáng mép cần mạnh hơn không?

## 5. Chạy lại
```
cd art/huong-moi/quai-rig/bo-vo-moc/code && python3 tach.py && python3 khop.py && python3 dung_rig.py   # art + rig
python3 game/thu-bo-vo-moc/cong-cu/tao-tu-demo.py                                                      # sinh index.html từ demo.html
python3 -B game/thu-bo-vo-moc/cong-cu/quay-va-chup.py video anh                                         # video + ảnh (~4 phút)
```
`tao-tu-demo.py` liệt kê **9 chỗ cần ghép** khi đưa Bọ vào `demo.html` (nạp gói, đặt lại, lưu vị trí, cập nhật, vẽ, trúng đòn, chém nảy, hitbox, khối mã).
