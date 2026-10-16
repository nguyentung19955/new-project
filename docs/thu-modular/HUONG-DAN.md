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
- Que đi, `que-chay-8` và kiếm do máy dựng bằng góc khớp (động học thuận). Từ phiên 2 đã có **`que-chay-that`** đo từ hình chạy thật (mục 7) — dùng que này khi gen đồ cho chạy.
- Khớp của dáng đứng được đo bằng mắt trên ảnh phóng ×4, sai khoảng ±2 điểm ảnh (±0.3 điểm game).
- Đầu Zed rất to (chiếm khoảng 47% chiều cao), nên mũ/nón quyết định dáng nhìn. Nên thử mũ trước.

## 7. Chạy THẬT (phiên 2): que đo từ sprite, bộ phận tách từng khung

Nguồn: hàng 3 (chạy, 8 khung) của `docs/anh-goc/zed/zed-v2-canonical.png`, cùng tấm và cùng tỉ lệ với dáng đứng ở trên. Ô que = ô 256 của tấm gốc dời xuống 9 px cho đất ở y = 248 (không co, không dời ngang). Sinh lại: `python3 docs/thu-modular/do-chay-that.py`.

| Tệp | Là gì |
|---|---|
| `zed-chay-that-hang.png` | Hàng chạy thật trơn: 8 ô 256×256, nền xanh, cùng đường đất. **Gửi kèm khi gen.** |
| `que-chay-that-chong-zed.png` / `.gif` | Que đo được đè lên Zed thật từng khung. **Gửi kèm khi gen.** |
| `que-chay-that-chong-zed-luoi.png` | Như trên ×3, có lưới toạ độ và số khớp (2 hàng × 4 khung) |
| `que-chay-that.png`, `.gif`, `-luoi.png` | Que trơn, giống các que phiên 1 |
| `que-chay-that.json` | 23 khớp **từng khung** (px ô + điểm game), góc xương, neo đồ, nguồn từng khớp (tự động / chỉnh tay) |
| `que-chay-that.chinh-tay.json` | Các khớp đã sửa tay sau khi soát bằng mắt, có ghi chú từng khung |
| `que-chay-that-tu-dong-va-chinh.png` | So: que cam = đo tự động, que đen = sau chỉnh tay |
| `bo-phan-chay/khung-NN/*.png` | Bộ phận cắt từ sprite thật **mỗi khung**: đầu, thân, tay trên/dưới, bàn tay, đùi, cẳng chân, bàn chân (phải/trái) + khăn |
| `bo-phan-chay.json`, `bo-phan-chay.png` | Vị trí đặt (`dat_tai_o`), pivot, góc, lớp từng bộ phận từng khung; ảnh tổng: gốc / bản đồ màu / ráp lại / tách rời |
| `mau-gen/vung-*.png` | 1 hàng 8 khung: Zed xám, **vùng món đồ cần phủ tô cam** (áo, quần, mũ, găng, giày). Gửi kèm khi gen theo từng phần |
| `ghep-thu-giap-non-chay-that.png` / `.gif` | Giáp + nón lá có sẵn đặt lên Zed chạy thật bằng neo từng khung |

Trong hàng này tay chân **không đổi bên**: chân phải (gần) = chân trước, chân trái (xa) = chân sau đá lên; tay phải = nắm tay trước ngực, tay trái = tay xa (ló dưới tay phải ở khung 1, 2, 7, 8; vung ra sau ở khung 3–6). Khung 3 và 6 là lúc bay (hai chân không chạm đất).

### Prompt mẫu gen theo TỪNG PHẦN cho cả chu kỳ chạy

Gửi **đúng 3 ảnh theo thứ tự**: (1) `zed-chay-that-hang.png`, (2) `que-chay-that-chong-zed.png`, (3) `mau-gen/vung-<phần>.png`. Ảnh ra phải là **1 hàng 8 ô, mỗi ô 256×256**, để cắt thẳng theo ô và đặt chồng lên khung cùng số.

**C1. Áo (thân + tay áo ngắn)** — ảnh 3: `mau-gen/vung-ao.png`
> Pixel art, 1 hàng 8 khung, mỗi ô 256×256, đúng vị trí và cỡ như ảnh 1. Mỗi khung vẽ CHỈ chiếc áo ngắn tay vải nâu phủ đúng vùng tô cam ở ảnh 3 của khung đó, theo dáng chạy của ảnh 1 và que ảnh 2. Không vẽ người, không vẽ que. Nền xanh #00FF00 thuần, không chữ, không bóng.

**C2. Quần** — ảnh 3: `mau-gen/vung-quan.png`
> Pixel art, 1 hàng 8 khung, mỗi ô 256×256, khớp từng khung ảnh 1. Mỗi khung vẽ CHỈ chiếc quần võ ống thụng màu chàm phủ đúng vùng tô cam ở ảnh 3 (chân trước đậm, chân sau nhạt hơn). Không vẽ người, không vẽ que. Nền #00FF00 thuần, không chữ, không bóng.

**C3. Mũ / tóc** — ảnh 3: `mau-gen/vung-mu.png`
> Pixel art, 1 hàng 8 khung, mỗi ô 256×256, khớp từng khung ảnh 1. Mỗi khung vẽ CHỈ chiếc mũ trụ đồng đội trên đầu ở vùng tô cam ảnh 3, chừa lỗ cho 2 sừng, nghiêng theo đầu từng khung. Không vẽ mặt, không người. Nền #00FF00 thuần, không chữ, không bóng.

**C4. Găng tay** — ảnh 3: `mau-gen/vung-gang.png`
> Pixel art, 1 hàng 8 khung, mỗi ô 256×256, khớp từng khung ảnh 1. Mỗi khung vẽ CHỈ đôi găng da đỏ ở vùng tô cam ảnh 3 (cẳng tay + nắm tay), tay xa nhạt hơn. Không người. Nền #00FF00 thuần, không chữ, không bóng.

**C5. Giày / dép** — ảnh 3: `mau-gen/vung-giay.png`
> Pixel art, 1 hàng 8 khung, mỗi ô 256×256, khớp từng khung ảnh 1. Mỗi khung vẽ CHỈ đôi giày vải đen ở vùng tô cam ảnh 3, đúng hướng bàn chân từng khung. Không người. Nền #00FF00 thuần, không chữ, không bóng.

Nhận ảnh về: mở `kiem-tra.html` → dáng `chay-that` → bật **Zed thật dưới que**, so từng khung với `que-chay-that.json` (neo `neo_do` của khung đó). Món đồ đúng thì nằm gọn trong vùng tô cam của khung cùng số; lệch chỗ thì gửi Claude đo lại.

### Giới hạn của phiên 2

- Gối và khuỷu nằm trong quần thụng và ống tay, nên đặt theo chỗ gập của khối quần/ống tay: sai số khoảng ±5 px (±0.7 điểm game). Các khớp khác ±3 px.
- Tự động chỉ giữ được đỉnh đầu, tâm đầu, cằm; 19/23 khớp mỗi khung là chỉnh tay (lý do ghi ở `que-chay-that.chinh-tay.json`). Bộ đo tự động vẫn để lại để đo nhanh hàng khác, nhưng phải soát.
- Thân chạy nghiêng 18–32° so với dáng đứng: giáp vẽ ở dáng đứng xoay theo thì méo và lệch (xem `ghep-thu-giap-non-chay-that.png`). Vì vậy đồ cho chạy nên gen theo từng khung như C1–C5.
- Hàng chạy game đang dùng (`moi/03-chay-v4`, 12 khung) là bản vẽ khác (bộ ninja, cỡ khác), không phải hàng đo ở đây.
