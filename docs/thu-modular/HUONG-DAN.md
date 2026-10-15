# Bộ thử mặc đồ modular cho Zed (Cu Tí)

Mục đích: thử lại cách **ghép đồ lên khung xương**: vẽ một món đồ một lần (áo, mũ, giáp, quần…), máy tự dời và xoay nó theo xương ở từng khung động tác. Bộ thử chỉ nằm trong `docs/thu-modular/`, **không đụng code game**.

## 1. Trong thư mục có gì

| Tệp | Là gì |
|---|---|
| `nhan-vat-zed-dung-x4.png` | Zed đứng nghiêng phải, phóng ×4 (ảnh mẫu chính để gửi kèm khi gen) |
| `nhan-vat-zed-dung.png` | Như trên, cỡ thật 157×237, nền trong suốt |
| `nhan-vat-khop.png` | Zed + 23 khớp đánh số + tên + toạ độ (ảnh gốc và điểm game) |
| `nhan-vat.json` | Cỡ khung, điểm gốc (chân), toạ độ từng khớp, độ dài và góc từng xương, thứ tự lớp vẽ |
| `que-dung.png` | Hình que dáng đứng, đúng tỉ lệ Zed, ×2, khớp đánh số như `nhan-vat-khop.png` |
| `que-dung-x1.png` | Như trên nhưng cỡ thật (ô 256×256), dùng làm "giấy nền" khi vẽ đồ |
| `que-dung-chong-hinh.png` | Que chồng lên Zed thật, để thấy que khớp người |
| `que-di-6.png`, `que-chay-8.png`, `que-kiem-1-nhat.png` | Que đi 6 khung, chạy 8 khung, chém kiếm 1 nhát 6 khung, mỗi tấm 1 hàng ô 256×256 |
| `que-*.gif` | Phát thử từng động tác |
| `que-*-luoi.png` | Que ×2 có lưới toạ độ (vạch mảnh mỗi 8, số mỗi 32) |
| `que-*.json` | Toạ độ khớp **từng khung**, góc từng xương, **neo đồ** từng khung (áo, quần, tóc/mũ, phụ kiện) |
| `bo-phan/*.png` | 14 bộ phận rời: đầu, thân, cánh tay trên/dưới, bàn tay, đùi, cẳng chân, bàn chân (phải/trái) |
| `bo-phan.png`, `bo-phan.json` | Ảnh tổng các bộ phận + bản ráp lại; pivot, độ dài, góc gốc, lớp, cha của từng bộ phận |
| `ghep-thu-dung-tren-zed.png` | Giáp + nón lá có sẵn đặt lên Zed thật (kiểm neo đúng chỗ) |
| `ghep-thu-giap-non-chay.png`, `.gif` | Cùng giáp + nón lá đó đặt lên que **chạy** 8 khung: thấy đồ tự đi theo xương |
| `kiem-tra.html` | Trang kiểm tra: mở bằng trình duyệt, chọn dáng, chạy từng khung, bật/tắt lưới, xương, khớp, từng món đồ, nạp ảnh đồ mới |
| `tao-bo-thu.py` | Lệnh sinh lại toàn bộ: `python3 docs/thu-modular/tao-bo-thu.py` |

## 2. Hiểu toạ độ trong 1 phút

- Zed nhìn **nghiêng 3/4 sang phải**. "Phải/trái" là tay chân **của nhân vật**: tay/chân **phải** ở bên trái màn hình, gần người xem, **vẽ trước thân**; tay/chân **trái** ở bên phải màn hình, ở xa, **vẽ sau thân** (trong que vẽ màu xám).
- Mỗi ô que là **256×256**, **cùng tỉ lệ ảnh gốc** (1 điểm ảnh que = 1 điểm ảnh Zed). Gốc (0, 0) là **góc trên-trái của ô**. x sang phải, y xuống.
- **Điểm gốc (chân)** = giữa hai bàn chân, mép dưới đế = (128, 248) trong ô. Mọi khung đều đứng trên cùng đường đất y = 248.
- Đổi sang game (khung 48×48, chân tại [24, 45]): `x_game = 24 + (x − 128) × 0.1314`, `y_game = 45 + (y − 248) × 0.1314`. Zed cao 236 điểm ảnh, tức 31 điểm game. Các tệp json đã ghi sẵn cả hai loại toạ độ.
- Góc: 0° = chỉ sang phải, 90° = chỉ thẳng xuống, −90° = chỉ thẳng lên.
- Thứ tự lớp (số nhỏ vẽ trước, nằm dưới): áo choàng 5 → nón (mặt sau) 8 → tay trái 10–12 → chân trái 20–22 → thân 30 → áo/giáp 35 → chân phải 40–42 → quần 45 → đầu 50 → mặt nạ 55 → tay phải 70–72 → vũ khí 75 → nón/mũ (mặt trước) 85.

## 3. Cách gen một món đồ khớp khung

Mỗi món đồ **bám vào một xương** và có **một điểm neo**. Bạn chỉ cần gen món đồ ở **dáng đứng**, đúng cỡ Zed. Phần dời và xoay theo từng khung thì máy làm (xem `ghep-thu-giap-non-chay.gif`).

| Món | Bám xương | Neo đặt vào | Ảnh mẫu gửi kèm |
|---|---|---|---|
| Mũ, nón, tóc giả, mặt nạ | đầu | cổ (`co`), canh thêm theo đỉnh đầu (`dinh_dau`) | `nhan-vat-zed-dung-x4.png` + `bo-phan/dau.png` |
| Áo, giáp thân, áo yếm | thân | cổ (`co`) và eo (`eo`) | `nhan-vat-zed-dung-x4.png` + `bo-phan/than.png` |
| Tay áo, giáp vai | cánh tay trên / dưới | vai, khuỷu | `bo-phan/canh-tay-tren-phai.png`… |
| Quần | cạp theo thân, ống theo đùi/cẳng | hông (`hong`), gối | `bo-phan/dui-phai.png`, `bo-phan/cang-chan-phai.png` |
| Găng tay | bàn tay | cổ tay | `bo-phan/ban-tay-phai.png` |
| Giày, dép | bàn chân | cổ chân | `bo-phan/ban-chan-phai.png` |
| Áo choàng, khăn, đồ sau lưng | thân | lưng (`neo_do.phu_kien.lung`) | `nhan-vat-zed-dung-x4.png` |

Ba quy tắc khi gen:

1. **Cùng dáng, cùng cỡ, cùng hướng**: nghiêng 3/4 sang phải như Zed. Món đồ không được to hay nhỏ hơn người Zed.
2. **Chỉ vẽ món đồ**: không vẽ người, không chữ, không bóng đổ, nền xanh lá thuần `#00FF00`.
3. **Đồ cứng thì vẽ một mảnh, đồ quấn quanh khớp thì chia mảnh**: nón, giáp ngực và găng chỉ cần một mảnh. Quần và áo có tay thì chia theo bộ phận (cạp + ống trái + ống phải; thân áo + tay áo), vì khi chạy, đùi và tay xoay nhiều.

Khi có ảnh, mở `kiem-tra.html` → **Thêm ảnh đồ** (ảnh cỡ ô 256, vẽ chồng đúng chỗ trên `que-dung-x1.png`), chọn bám thân hay đầu và lớp, rồi bấm Chạy xem cả chu kỳ. Nếu AI vẽ lệch chỗ, gửi ảnh cho Claude: Claude đo neo (cổ áo, đai, vành nón) và đặt lại giống cách đã làm với giáp và nón lá ở `docs/anh-goc/zed/lop-ghep/`.

## 4. Prompt mẫu (ngắn, dán thẳng)

Mỗi prompt ghi rõ ảnh cần gửi kèm. Gửi ảnh trước rồi dán chữ.

**P1. Mũ / nón**
Gửi kèm: `nhan-vat-zed-dung-x4.png`, `que-dung.png`
> Pixel art, vẽ CHỈ một chiếc mũ trụ đồng cho nhân vật trong ảnh 1, đúng cỡ đầu và đúng hướng nghiêng 3/4 sang phải, đặt như đang đội (vành ngang tai, chừa lỗ cho 2 sừng). Không vẽ người. Nền xanh #00FF00 thuần, không chữ, không bóng đổ, viền tối 1 điểm ảnh.

**P2. Áo giáp thân (không tay)**
Gửi kèm: `nhan-vat-zed-dung-x4.png`, `bo-phan/than.png`
> Pixel art, vẽ CHỈ áo giáp ngực da nâu viền đồng vừa khít thân nhân vật ảnh 1 (từ cổ đến eo, rộng bằng 2 vai như hình thân ở ảnh 2), nghiêng 3/4 sang phải. Không tay áo, không người. Nền #00FF00 thuần, không chữ, không bóng.

**P3. Quần chia mảnh**
Gửi kèm: `nhan-vat-zed-dung-x4.png`, `bo-phan/dui-phai.png`, `bo-phan/cang-chan-phai.png`
> Pixel art, quần võ sinh màu chàm cho nhân vật ảnh 1, vẽ thành 3 mảnh rời xếp ngang: cạp quần, ống đùi (dài và nghiêng như ảnh 2), ống cẳng chân (như ảnh 3). Đúng cỡ nhân vật, nghiêng 3/4 sang phải. Nền #00FF00 thuần, không chữ, không bóng, mỗi mảnh cách nhau rõ.

**P4. Găng tay + giày**
Gửi kèm: `nhan-vat-zed-dung-x4.png`, `bo-phan/ban-tay-phai.png`, `bo-phan/ban-chan-phai.png`
> Pixel art, một đôi găng vải đỏ và một đôi dép rơm cho nhân vật ảnh 1, đúng cỡ bàn tay/bàn chân của nhân vật, hướng như ảnh 2 và ảnh 3. Xếp 4 món rời thành 1 hàng. Nền #00FF00 thuần, không chữ, không bóng.

**P5. Áo cho cả chu kỳ chạy (khi muốn đẹp nhất)**
Gửi kèm: `que-chay-8.png`, `nhan-vat-zed-dung-x4.png`
> Pixel art, 8 khung xếp 1 hàng đúng như ảnh 1 (mỗi ô 256×256). Ở mỗi khung vẽ CHỈ chiếc áo ngắn tay màu nâu của nhân vật ảnh 2, ôm đúng các que thân và cánh tay trên của khung đó (tay áo theo que vai–khuỷu). Không vẽ người, không vẽ que. Nền #00FF00 thuần, không chữ, không bóng.

## 5. Xem thử

- `ghep-thu-dung-tren-zed.png`: giáp và nón lá có sẵn (`docs/anh-goc/zed/lop-ghep/`) đặt lên Zed thật bằng neo cổ. Nón mặt sau vẽ sau đầu, nón mặt trước vẽ trước.
- `ghep-thu-giap-non-chay.png` / `.gif`: chính hai món đó, không vẽ lại, đặt lên que chạy 8 khung. Giáp bám thân (nghiêng theo thân), nón bám đầu.
- `kiem-tra.html`: kiểm bằng số, không phải chỉ bằng hình. Bên phải trang liệt kê toạ độ khớp, góc và neo đồ của khung đang xem.

## 6. Giới hạn đã biết

- Xoay ảnh pixel nhiều độ sẽ làm méo nét. Thân xoay khoảng 14°, đầu khoảng 8° thì còn chấp nhận được. Tay và đùi khi chạy xoay tới 40–60°, nên đồ ở tay và chân phải vẽ **theo từng khung** (như P5) hoặc chia mảnh nhỏ.
- Que đi, chạy và kiếm do máy dựng bằng góc khớp (động học thuận), **không đo từ hình chạy thật** của Zed. Khung xương đúng tỉ lệ Zed, nhưng dáng chạy không trùng từng điểm với `docs/anh-goc/zed/v2/00-than-dung-di-chay.png` hàng 3.
- Khớp của dáng đứng được đo bằng mắt trên ảnh phóng ×4, sai khoảng ±2 điểm ảnh (±0.3 điểm game).
- Đầu Zed rất to (chiếm khoảng 47% chiều cao), nên mũ/nón quyết định dáng nhìn. Nên thử mũ trước.
