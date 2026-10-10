# Quy chuẩn phong cách chibi (kiểu số 2)

Bạn đã chọn **kiểu số 2** trong ảnh [mau/style.png](mau/style.png): chibi mềm, viền tối vừa, tô 2 tông màu, khối tròn, màu ấm. Tệp này ghi lại "luật vẽ" để **mọi hình trong game ra đồng đều**, dù vẽ ở ngày nào, cuộc trò chuyện nào.

Các prompt trong [PROMPT-GEMINI.md](PROMPT-GEMINI.md) đã viết sẵn theo đúng luật này. Bạn chỉ cần đọc tệp này khi muốn **tự viết prompt mới** hoặc **kiểm tra một hình Gemini vẽ ra có đạt không**.

---

## 1. Năm điều cốt lõi của kiểu số 2

| Điều | Nghĩa là | Câu tiếng Anh dùng trong prompt |
|---|---|---|
| Chibi mềm | Đầu to, thân nhỏ, tay chân ngắn mũm mĩm, mọi góc đều bo tròn | `soft chibi style, rounded chunky shapes` |
| Viền tối vừa | Một nét viền **nâu tím đậm** (gần `#2a1c22`) chạy quanh mép ngoài, dày vừa, đều nhau, **không** dày như sticker, **không** mảnh như tranh chì | `medium-thickness dark brown-plum outline of even width` |
| Tô 2 tông | Mỗi màu chỉ có **2 sắc**: màu gốc + một sắc tối hơn cho phần khuất. Thêm được **một đốm sáng nhỏ** (như đốm bóng trên mũ đỏ ở ảnh mẫu). Không chuyển màu mượt, không hoa văn, không vân vải | `simple two-tone cel shading (one base tone and one darker shadow tone per color, a small soft highlight allowed), no gradients, no textures` |
| Khối tròn, ít chi tiết | Hình to, rõ, đọc được khi nhỏ. Nét phá cách vẽ **TO và rõ** | `low detail, big readable shapes, the twist detail big and obvious` |
| Màu ấm | Màu hơi ngả ấm (vàng, cam, nâu đỏ), kể cả vùng lạnh như Hang biển cũng giữ chút ấm ở viền và bóng | `warm cozy colors, like a cozy mobile RPG` |

**Ánh sáng:** từ **trên bên trái**. Phần tối nằm ở mép dưới và mép phải của mỗi khối.

**Mặt:**
- Em bé: mặt tròn hồng nhạt, mắt to đen có đốm sáng, má hồng, miệng cười nhỏ (như ảnh mẫu [mau/hero_full.png](mau/hero_full.png)).
- Người làng: mặt là **mặt nạ tinh linh trắng** (`#f4eee0`), mắt chấm đen, má hồng, đúng như trong game.
- Quái: **hung dữ nhưng vẫn dễ thương**: mắt phát sáng giận dữ, lông mày chau xuống, nanh hoặc răng nhọn lộ ra, dáng chồm tới. Không máu me, không ghê rợn. Tinh anh và trùm dữ hơn (sẹo, gai, giáp).

---

## 2. Tỉ lệ

| Loại | Tỉ lệ |
|---|---|
| Em bé | Đầu (cả mũ trùm) = **1/2 chiều cao**. Áo choàng ngắn, kết thúc **trên đầu gối**, hai chân ngắn lộ rõ. |
| Người làng | Đầu = **1/2 chiều cao** (to hơn hình cũ một chút cho đồng bộ với em bé). |
| Quái khung Người | Đầu (hoặc mũ giáp) ≈ **1/2 chiều cao**, thân ngắn. |
| Quái khung Bốn chân | Đầu ≈ **1/2 thân**, thân tròn mũm, chân ngắn cỡ **1/3 chiều cao**. |
| Quái khung Cua | Mai/thân tròn ở giữa, hai càng **to bằng nửa thân**, chân ngắn nhọn. |
| Tinh anh | Như quái thường cùng loại nhưng **to gấp rưỡi**, thân chắc hơn. |
| Trùm nhỏ, trùm vùng | **Khổng lồ**, dáng nặng nề, nhưng vẫn ít chi tiết (vài khối lớn rõ ràng). |

Cỡ trong game không cần vẽ đúng: game tự co ảnh. Chỉ cần **tỉ lệ đúng** và **hình đủ to, rõ**.

---

## 3. Hướng nhìn: luôn quay sang PHẢI

Game chỉ cần hình quay phải; khi quái đi sang trái game tự lật hình.

| Loại | Góc nhìn |
|---|---|
| Em bé, người làng, quái khung Người | **Chéo 3/4 quay phải**: thân quay sang phải, mặt hơi nhìn ra phía người xem |
| Quái khung Bốn chân, cá, chim, dơi, rắn | **Nhìn ngang**, mũi/mỏ chĩa về **mép phải** ảnh, đuôi ở **bên trái** |
| Quái khung Cua (cua, ốc, bọ, sứa, nhím...) | **Nhìn ngang** quay phải: càng trước ở bên phải |
| Vũ khí kiếm, giáo, búa | **Nằm ngang**: cán/chuôi bên **TRÁI**, mũi/đầu búa chỉ sang **PHẢI**, lưỡi hướng lên |
| Cung, nỏ, ná | **Dựng đứng**: dây cung bên **TRÁI**, bụng cung cong sang **PHẢI**, không vẽ mũi tên (game tự vẽ dây và tên khi bắn) |
| Trang phục (mũ, áo, đồ lưng) | Chéo 3/4 quay phải, đúng như khi mặc trên em bé, nhưng không có ai mặc |
| Cánh | **Một bên cánh**, gốc cánh ở **góc dưới bên phải**, cánh xoè lên trên sang trái (game tự vẽ cánh thứ hai) |
| Bùa, dấu mặt nạ, đồ và tài nguyên | Nhìn thẳng, một biểu tượng đơn giản |

Lỗi đã gặp: [mau/boar_full.png](mau/boar_full.png) heo bị **quay trái**. Vì vậy mọi prompt đều nhắc `facing RIGHT` hai lần và nói rõ mũi ở mép phải, đuôi ở mép trái.

---

## 4. Quy tắc tách bộ phận (Lần B)

Mỗi nhân vật vẽ 2 lần: **Lần A** cả con (để xem dáng), **Lần B** tách rời các mảnh như búp bê giấy. Game ráp các mảnh lại bằng khung xương và cho cử động.

1. **Mỗi mảnh nằm riêng**, có **khoảng trắng rộng** giữa các mảnh, không mảnh nào chạm hay đè lên mảnh khác.
2. **Nền trắng tinh**, không chữ, không số, không nhãn, không bóng đổ, không mặt đất.
3. **Cùng cỡ** với hình cả con, cùng màu, cùng nét, **cùng quay phải**.
4. **Đầu khớp tròn, giấu dưới thân:** chỗ nối tay, chân, đuôi, đầu được vẽ **tròn trơn, cùng màu với mảnh đó**, hơi dài ra một chút để khi ráp thì phần này nằm khuất dưới thân. **KHÔNG vẽ núm khớp, vòng tròn, đinh tán, ổ khớp lộ ra** (lỗi đã gặp ở chân heo trong [mau/boar_parts.png](mau/boar_parts.png)).
5. **Mảnh ở xa tối hơn một chút** (tay sau, chân sau, chân phía xa, càng sau...), để khi ráp nhìn có chiều sâu.
6. **Vũ khí và đồ cầm tay LUÔN là mảnh riêng**, vẽ một mình, không có bàn tay dính vào; bàn tay vẽ nắm hờ, **trống** (lỗi đã gặp: chổi dính vào tay lính ma trong [mau/knight_parts.png](mau/knight_parts.png)). Vũ khí của mảnh riêng cũng vẽ nằm ngang, cán trái, đầu phải.
7. **Thân không có tay chân**, đầu không có thân. Phần nào thuộc mảnh nào ghi rõ trong từng prompt.
8. Con vật **không có** mảnh nào trong danh sách thì bỏ mảnh đó (ví dụ cá không có chân sau).

---

## 5. Tên các mảnh theo từng khung (trường `vai` trong tệp khung xương)

Đây là đúng tên trong [KE-HOACH-CHIBI.md](KE-HOACH-CHIBI.md). Khi đưa ảnh vào Xưởng Rối, mỗi mảnh chọn đúng **vai** ghi trong prompt.

### Khung `nguoi` (em bé, người làng, quái đứng hai chân)

| Vai | Mảnh | Ghi chú |
|---|---|---|
| `dau` | Đầu (cả mũ, tóc, sừng, mặt nạ) | Có cổ ngắn tròn ở dưới, giấu dưới thân |
| `than` | Thân (áo, giáp, thắt lưng), **không tay, không chân** | Mảnh gốc |
| `tay-truoc` | Tay phía người xem (bên phải), cả cánh tay một mảnh, hơi cong | Đầu vai tròn |
| `tay-sau` | Tay phía xa, **tối hơn một chút** | |
| `chan-truoc` | Chân phía người xem, cả chân và giày một mảnh | Đầu hông tròn |
| `chan-sau` | Chân phía xa, tối hơn | |
| `vu-khi` | Vũ khí hoặc đồ cầm tay, **mảnh riêng** | Đi theo `tay-truoc` |
| `phu-kien` | Đồ lắc lư: tóc, khăn, đuôi áo, đuôi, khiên, cờ sau lưng, con vật đậu trên vai | Ghi rõ đi theo mảnh nào |

### Khung `bon-chan` (heo, chồn, mèo, hổ, cáo...)

| Vai | Mảnh |
|---|---|
| `dau` | Đầu nhìn ngang quay phải (cả nanh, tai, sừng), cổ tròn ở bên trái |
| `than` | Thân ngang, **không đầu, không chân, không đuôi** (đồ trên lưng vẽ dính vào thân) |
| `chan-truoc-gan` | Chân trước phía người xem |
| `chan-truoc-xa` | Chân trước phía xa, tối hơn |
| `chan-sau-gan` | Chân sau phía người xem |
| `chan-sau-xa` | Chân sau phía xa, tối hơn |
| `duoi` | Đuôi, đầu khớp tròn ở phía bên phải |
| `phu-kien` | Đồ rời lắc lư (đuôi thứ hai, vật cầm trong miệng hay ôm trong tay...) |

### Khung `cua` (cua, ốc, bọ, sứa, nhím biển...)

| Vai | Mảnh |
|---|---|
| `than` | Mai hoặc thân (cả mắt, mũ), **không càng, không chân** |
| `cang-truoc` | Càng (hoặc sừng, tay) phía người xem |
| `cang-sau` | Càng phía xa, tối hơn |
| `chan-gan-1`, `chan-gan-2`, `chan-gan-3` | Ba chân phía người xem, mỗi chân một mảnh, từ trước ra sau |
| `chan-xa-1`, `chan-xa-2`, `chan-xa-3` | Ba chân phía xa, tối hơn |
| `phu-kien` | Đồ rời (thìa canh trong càng, cờ cắm lưng...) |

### Quái không giống người, thú hay cua

Game chỉ có 3 khung, nên các quái khác được **gán vào khung gần nhất**. Prompt từng con đã ghi sẵn mảnh nào là vai nào.

| Dạng quái | Khung dùng | Cách gán |
|---|---|---|
| Nấm, hũ, hoa, cây, hải quỳ (có tay/cành) | `nguoi` | mũ nấm, tán cây, miệng hoa = `dau`; thân, hũ, gốc = `than`; lá, cành, ống điếu = `tay-truoc`/`tay-sau`; rễ, chân ghế = `chan-truoc`/`chan-sau` |
| Cá, cá nóc, rắn biển | `bon-chan` | thân cá (cả đầu) = `than`; vây hai bên = `chan-truoc-gan`/`chan-truoc-xa`; đuôi = `duoi` |
| Bầy (ong, cá, dơi) | `bon-chan` | con to nhất = `than`; cánh/vây của nó = `chan-truoc-gan`/`chan-truoc-xa`; hai con nhỏ = `phu-kien` |
| Sứa, đèn lồng, lư hương, nhím biển, bọ hung, ốc | `cua` | thân = `than`; xúc tu, tua, chân = `chan-gan-*`/`chan-xa-*`; sừng, càng = `cang-*` |

---

## 6. Bảng màu theo vùng

Màu chính từng con vẫn theo màu đang có trong game (ghi trong prompt). Bảng dưới là **tông chung của vùng** để các con cùng vùng trông cùng một nhà. Viền luôn nâu tím đậm `#2a1c22`.

| Vùng | Hệ | Tông chung | Màu gốc nên dùng | Ánh nhấn (mắt, lửa, phép) |
|---|---|---|---|---|
| **Làng** (em bé, người làng) | — | Ấm, tươi, đồng quê | đỏ `#d2362e`, kem `#f6f0e2`, nâu `#8a5632`, rơm `#d8b45c`, xanh lá `#479544` | vàng đồng `#e2b64e` |
| **Rừng già** | Độc | Xanh lá rừng, nâu gỗ, tím nấm | xanh lá `#22692c` `#78b818`, nâu `#80542c` `#4e3018`, tím `#9a48d4` `#58208c` | xanh độc phát sáng `#9bd14a` |
| **Hang biển** | Băng | Xanh biển, trắng, san hô ấm | xanh biển `#1b4c92` `#3883d4`, xanh ngọc `#0e746e` `#1fb49c`, trắng `#e6f4f2`, đỏ san hô `#ee5c3a` | xanh băng `#7fd4ff` |
| **Lâu đài cổ** | Lửa | Đỏ cam, xám đá, gỉ sắt | xám đá `#8a8288` `#57505a`, gỉ `#a85a26` `#6e3418`, đỏ `#b0261a`, than `#48424e` | cam lửa `#ff8a1e`, vàng lửa `#ffd23c` |
| **Đồ, vũ khí** | — | Theo chất liệu | sắt `#b4c0d4` `#5f6b84`, gỗ `#a8783e` `#6e4a26`, đồng Đông Sơn `#c4853a` `#754418`, tre `#b3b84a` | vàng `#e2b64e` |

---

## 7. Kiểm tra nhanh một hình (đạt thì dùng)

- [ ] Quay sang **phải**?
- [ ] Nền trắng tinh, không chữ, không bóng?
- [ ] Viền tối đều, tô 2 tông, không vân, không chuyển màu?
- [ ] Đầu to đúng tỉ lệ, khối tròn, ít chi tiết?
- [ ] Nét phá cách to, nhìn ra ngay?
- [ ] Quái trông dữ (mắt giận, mày chau, nanh) mà vẫn dễ thương?
- [ ] (Lần B) Các mảnh tách rời, cách xa nhau, đủ mảnh, mảnh xa tối hơn?
- [ ] (Lần B) Không có núm khớp tròn lộ ra? Vũ khí là mảnh riêng, tay trống?

Chưa đạt thì dùng các câu nhắn sửa nhanh ở đầu [PROMPT-GEMINI.md](PROMPT-GEMINI.md).
