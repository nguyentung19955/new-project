# Đặc điểm hình đang có trong game (đo bằng máy)

Mọi hình trong game hiện vẽ bằng code (`game/js/monster_art.js`, `hero_tinhlinh.js`/`hero_art.js`, `weapon_art.js`, `ui_theme.js` và `do_roi.js` cho đồ, `village_scene.js` cho người làng). Tệp `tham-chieu/tao_anh.py` mở Xưởng Sprite trong Chromium, vẽ lại từng thứ ở **cỡ thật, quay mặt sang phải**, cắt sát, bỏ bóng đổ dưới chân, rồi đo. Ảnh phóng to 8 lần (nền trắng, giữ nguyên điểm ảnh) nằm ở `tham-chieu/<mã>.png`; số đo đầy đủ ở `tham-chieu/do-dac.json`. Các số này đã được đưa vào từng dòng prompt trong [PROMPT-VE.md](PROMPT-VE.md).

## 1. Đặc điểm chung theo nhóm

| Nhóm | Số hình | Cỡ thật (rộng × cao, điểm ảnh) | Góc nhìn, hướng | Viền | Số màu thật | Tỉ lệ, dáng |
|---|---|---|---|---|---|---|
| Em bé | 4 | 19–24 × 29–33 | chéo 3/4 quay phải, mặt hơi nhìn ra | 1 điểm ảnh, `#1b1118` (tím than) | 14–23 | đầu cả mũ trùm ≈ 1/2 chiều cao, thân nhỏ, chân ngắn; tay sát thân, không cầm vũ khí (game vẽ vũ khí riêng) |
| Quái thường | 24 | 29–63 × 24–43 | phần lớn nhìn ngang quay phải; cua, nấm, sứa, hũ, đèn lồng nhìn chính diện | 1 điểm ảnh, `#14182e` (xanh than) | 14–32 | đầu to, mắt giận, nanh |
| Quái tinh anh | 6 | 59–90 × 42–63 | như quái thường | 1 điểm ảnh, `#14182e` | 19–35 | to gấp rưỡi, thêm giáp, gai, sẹo |
| Trùm nhỏ, trùm vùng | 6 | 97–177 × 63–131 | như quái thường | 1 điểm ảnh, `#14182e` | 25–47 | khổng lồ, nhiều chi tiết lớn |
| Vũ khí | 40 | 19–62 × 11–44 (nằm ngang) | nhìn ngang, nằm ngang chuôi trái mũi phải; cung dựng đứng dây trái | 1 điểm ảnh, `#1b1118` | 5–20 | có đôi mắt nhỏ (vũ khí sống) |
| Trang phục | 51 | 4–26 × 4–28 | chéo 3/4 quay phải (như trên người em bé) | 1 điểm ảnh, `#1b1118` | 2–16 | mũ 17–26 rộng; áo chỉ 11–15; bùa 5 × 13; dấu mặt nạ 4–11; cánh một bên 17–18 |
| Đồ và tài nguyên | 14 | 6–10 × 6–10 | chính diện, biểu tượng | viền tối cùng tông màu món đồ | 2–5 | biểu tượng ở dải tài nguyên chỉ 7 × 7 |
| Người làng | 7 | 19–29 × 28–40 | chính diện, hơi chếch | 1 điểm ảnh, `#1a1420` | 12–19 | đầu ≈ 2/5 chiều cao, mặt nạ tinh linh trắng `#f4eee0`, mắt chấm, má hồng |

**Đổ bóng:** mỗi chất liệu chỉ có bộ ba sắc độ **tối, vừa, sáng**, tô mảng phẳng, không chuyển màu mượt, không nhoè. Quái sáng từ trên bên trái (quả cầu có đốm sáng góc trên trái); em bé và trang phục sáng từ trên bên phải (mép trên sáng, mép dưới và mép trái tối). Không có bóng mềm; dưới chân quái game tự vẽ một bóng bầu dục mờ riêng (không thuộc hình), nên ảnh AI **không được** có bóng đổ.

**Viền:** luôn đúng **1 điểm ảnh** quanh mép ngoài, màu gần đen ngả xanh hoặc tím. Khi đưa ảnh vào, Xưởng thu nhỏ rồi **tự thêm viền 1 điểm ảnh** đúng màu đó, nên nét viền AI vẽ chỉ cần dày khoảng 1/(chiều cao game) của hình: dày hơn sẽ ăn mất màu bên trong.

**Vì sao AI hay vẽ lệch:** AI quen vẽ nhân vật chính diện, cân đối như người thật, tay sát thân, nhiều hoa văn nhỏ. Hình game thì phần lớn quay ngang sang phải, đầu rất to, hình khối to; và một chi tiết nhỏ hơn 1 điểm ảnh game (ví dụ nhỏ hơn 1/30 chiều cao với quái 30 điểm ảnh) sẽ biến mất khi thu nhỏ.

## 2. Xưởng Sprite cần hình như thế nào

Đọc từ `tools/xuong-sprite/nguon/` (`xu-ly-anh.js`, `khung.js`, `do.js`):

- **Tách nền**: lấy màu hay gặp nhất ở mép ảnh làm nền rồi loang từ mép vào. Nền trắng trơn đều là tốt nhất; khoảng trắng kẹp giữa hai chân vẫn được tách nếu thông ra mép.
- **Bỏ đốm lẻ**: mảng rời nhỏ hơn khoảng 1,2% mảng lớn nhất bị xoá (tia lửa, hạt bụi, bào tử bay rời). Chi tiết muốn giữ phải **dính vào thân**.
- **Thu nhỏ**: theo chiều cao game (vũ khí theo chiều dài). Ô nào hình phủ dưới 40% thì bỏ, nên **nét mảnh hơn 1 điểm ảnh game sẽ mất**. Giữ tối đa 20 màu, ô có nét tối được ưu tiên giữ tối.
- **Tự đoán bộ phận**: đặt khớp của khung theo **tỉ lệ khung bao hình**, rồi mỗi điểm ảnh thuộc về xương gần nhất. Vì vậy tay, chân, đuôi, cánh phải nằm **đúng chỗ khung chờ** và **có khe trắng tách khỏi thân**, nếu không sẽ bị tính là thân (cử động bị vỡ, tay dính thân).
- **Hướng**: mọi động tác làm cho hình **quay mặt sang phải**; game tự lật khi quái quay trái.

Chỗ đặt khớp mặc định của từng khung (tính theo khung bao: 0 là trái hoặc trên, 1 là phải hoặc dưới):

| Khung | Bộ phận cử động | Dáng cần vẽ để Tự đoán đúng |
|---|---|---|
| **Người (2 chân)** | thân, đầu, tay trước, tay sau, chân trước, chân sau | Cổ ở 36% chiều cao (đầu chiếm phần trên), vai ở 42%; tay trước thả xuống chéo ra phải tới (80%, 62%), tay sau chéo ra trái tới (24%, 62%): **tay tách thân, bàn tay ngang hông**. Hông ở 60%, hai bàn chân ở đáy tại 38% và 62% bề ngang: **hai chân dang, có khe giữa**. Em bé mặc định chỉ tay và chân cử động. |
| **Bốn chân** | thân, đầu, 4 chân, đuôi | Thân ngang từ 30% tới 68% bề ngang; cổ ở (74%, 42%), mũi ở mép phải hơi cao (100%, 32%): **đầu bên phải**. Bốn chân thẳng xuống từ 62% tới đáy: chân trước ở 63–73%, chân sau ở 22–32% bề ngang: **có khe giữa chân trước và chân sau**. Đuôi từ (16%, 42%) chĩa lên trái tới (0%, 22%). |
| **Cua, bọ (nhiều chân)** | thân/mai, càng trước, càng sau, chân phải, chân trái | Thân ngang giữa ở 55% chiều cao; **hai càng giơ lên hai góc trên** (100%, 15%) và (0%, 15%); chân xoè xuống hai góc dưới (84%, 100%) và (16%, 100%). |
| **Cá, chim bay** | thân, đầu, cánh gần, cánh xa, đuôi | Thân ngang ở 55% chiều cao, **đầu phải** (mũi 100%, 52%), **đuôi trái** (0%, 50%); **hai cánh giơ lên trên lưng** tới đỉnh hình (42%, 0%) và (70%, 4%). Kiểu đi: bay nhấp nhô. |
| **Khối mềm (slime, lửa, ma)** | thân dưới, phần trên, tua phải, tua trái | Thân tròn ngồi ở đáy, phần trên tới đỉnh; **hai tua thò ra thấp hai bên** tới (100%, 85%) và (0%, 85%). Kiểu đi: nhún nhảy. |
| **Rắn (trườn)** | thân giữa, cổ, đầu, đuôi gần, chóp đuôi | Thân dài nằm thấp (62–70% chiều cao) chạy hết bề ngang, **đầu ngẩng ở phải** (100%, 36%), **đuôi thon về trái** (0%, 66%). |
| **Cây, đứng yên** | gốc rễ, thân, tán/đầu, cành phải, cành trái | Rễ ở đáy, thân đứng giữa (78% lên 42%), tán hoặc đầu trên cùng; **hai cành chĩa ra hai bên và hơi lên** tới (100%, 32%) và (0%, 32%). Gốc cắm đất, chỉ nhún. |

**Chỗ lệch giữa game và khung Người:** em bé trong game có đầu cả mũ chiếm khoảng 1/2 chiều cao, chân chỉ khoảng 1/6; khung Người lại chờ cổ ở 36% và hông ở 60%. Thử thật (xem [PROMPT-THU.md](PROMPT-THU.md)) cho thấy đầu 1/2 làm phần áo bị chia nhầm sang tay chân. Vì vậy prompt em bé xin **đầu khoảng 2/5, áo choàng ngắn tới 2/3 chiều cao, hai chân lộ rõ**: vẫn rất chibi mà Tự đoán đúng hơn nhiều.

Đồ vật (không có khung, đứng yên):

- **Kiếm, giáo, búa**: nếu hình rộng hơn 1,25 lần chiều cao thì Xưởng coi là **nằm ngang**: điểm cầm ở 14% từ trái, mũi ở mép phải. Ngược lại coi là **dựng đứng**: điểm cầm ở 86% từ trên, mũi ở đỉnh. Thanh trượt cỡ là chiều dài.
- **Cung**: dựng đứng; điểm cầm ở 45% bề ngang giữa chiều cao, mũi ở mép phải, hai đầu dây ở 20% từ trái (trên và dưới). Game tự vẽ dây và mũi tên khi giương, nên **không vẽ mũi tên**.
- **Trang phục**: kéo đặt lên em bé mẫu (quay phải). Mũ đặt trên đầu, áo ở thân, đồ lưng sau lưng, bùa bên hông. **Cánh: một bên cánh, gốc ở góc dưới bên phải**; game tự vẽ cánh xa và cho vỗ.
- **Đồ và tài nguyên**: chỉ đưa hình; một hình dùng ở mọi chỗ (dải tài nguyên 7 × 7, Hành trang, giá bán, đồ rơi ≈ 18 điểm ảnh).

## 3. Từng hình

Màu chính: các màu chiếm nhiều chỗ nhất (đã bỏ màu viền), theo thứ tự nhiều tới ít. Tỉ lệ: rộng chia cao.

### Em bé (khung Người)

| Mã | Tên | Cỡ | Tỉ lệ | Số màu | Màu chính | Ảnh |
|---|---|---|---|---|---|---|
| em-be-smith | Thợ Rèn | 19 × 31 | 0,6 | 15 | `#d2362e` `#f6f0e2` `#8c1c1f` `#f47a62` | [ảnh](tham-chieu/em-be-smith.png) |
| em-be-hunter | Thợ Săn | 22 × 33 | 0,7 | 14 | `#479544` `#255a2c` `#f6f0e2` `#8fd070` | [ảnh](tham-chieu/em-be-hunter.png) |
| em-be-healer | Thầy Lang | 24 × 32 | 0,8 | 23 | `#27407f` `#4468c0` `#f6f0e2` `#86a8f0` | [ảnh](tham-chieu/em-be-healer.png) |
| em-be-wrestler | Đô Vật | 20 × 29 | 0,7 | 15 | `#9a4a16` `#dd7c2a` `#f6f0e2` `#8c1c1f` | [ảnh](tham-chieu/em-be-wrestler.png) |

### Quái

Cột "Bộ phận cử động" là tên các phần (`parts`) mà `monster_art.js` cho xoay riêng; phần còn lại đi theo thân.

| Mã | Tên | Loại | Cỡ | Tỉ lệ | Góc nhìn | Khung nên chọn | Bộ phận cử động | Màu chính | Ảnh |
|---|---|---|---|---|---|---|---|---|---|
| cua | Cua Lính | thường | 47 × 36 | 1,3 | chính diện (hơi chếch phải) | Cua, bọ (nhiều chân) | tayT, cangT, tayP, cangP, cT1, cT2, cT3, cP1, cP2, cP3 | `#ee5c3a` `#3883d4` `#1b4c92` `#b32a2c` | [ảnh](tham-chieu/cua.png) |
| caCon | Bầy Cá Con | thường | 36 × 34 | 1,1 | nhìn ngang, quay phải | Cá, chim bay | ca1, ca2, ca3, duoi1, duoi2, duoi3 | `#b32a2c` `#0e746e` `#1b4c92` `#6a1220` | [ảnh](tham-chieu/caCon.png) |
| oc | Ốc Mượn Hồn | thường | 52 × 41 | 1,3 | nhìn ngang, quay phải | Cua, bọ (nhiều chân) | cang, chan1, chan2, chan3 | `#9bb4e8` `#5265ae` `#a9d8ee` `#2c3a7c` | [ảnh](tham-chieu/oc.png) |
| haiQuy | Hải Quỳ | thường | 44 × 43 | 1,0 | chính diện (hơi chếch phải) | Cây, đứng yên | tuaT, tuaG, tuaP, rong | `#6a1220` `#0e746e` `#b32a2c` `#ee5c3a` | [ảnh](tham-chieu/haiQuy.png) |
| caChuon | Cá Chuồn | thường | 53 × 35 | 1,5 | nhìn ngang, quay phải | Cá, chim bay | canh, duoi, vay | `#a9d8ee` `#1b4c92` `#3883d4` `#4f86b0` | [ảnh](tham-chieu/caChuon.png) |
| caNoc | Cá Nóc | thường | 33 × 28 | 1,2 | chính diện (hơi chếch phải) | Khối mềm (slime, lửa, ma) | vay, duoi, gai, gaiD | `#e6f4f2` `#063b3c` `#1fb49c` `#ffffff` | [ảnh](tham-chieu/caNoc.png) |
| sua | Sứa Bom | thường | 39 × 37 | 1,1 | chính diện (hơi chếch phải) | Khối mềm (slime, lửa, ma) | tuaT, tuaP, bom | `#50bde6` `#0f437a` `#2273b2` `#3fa8d8` | [ảnh](tham-chieu/sua.png) |
| nhim | Nhím Biển | thường | 29 × 24 | 1,2 | chính diện (hơi chếch phải) | Khối mềm (slime, lửa, ma) | gaiTren, gaiT, gaiP | `#4836a0` `#bfe9ff` `#ffffff` | [ảnh](tham-chieu/nhim.png) |
| cuaTuong | Cua Tướng | tinh anh | 84 × 63 | 1,3 | chính diện (hơi chếch phải) | Cua, bọ (nhiều chân) | cả hình | `#ee5c3a` `#3883d4` `#1b4c92` `#b32a2c` | [ảnh](tham-chieu/cuaTuong.png) |
| caNocChua | Cá Nóc Chúa | tinh anh | 66 × 63 | 1,0 | chính diện (hơi chếch phải) | Khối mềm (slime, lửa, ma) | cả hình | `#ffffff` `#dff6ff` `#e6f4f2` `#1aa894` | [ảnh](tham-chieu/caNocChua.png) |
| cuaDa | Cua Đá | trùm nhỏ | 117 × 71 | 1,6 | chéo 3/4, quay phải | Cua, bọ (nhiều chân) | cangT, cangP, chanT, chanP | `#7187a8` `#46567a` `#222a40` `#a9bcd8` | [ảnh](tham-chieu/cuaDa.png) |
| nguTinh | Ngư Tinh | trùm vùng | 152 × 105 | 1,4 | nhìn ngang, quay phải | Rắn (trườn) | song, duoi, vay, vayBung, ham, rau | `#149c8c` `#1f559a` `#1f5f9c` `#2f8fc8` | [ảnh](tham-chieu/nguTinh.png) |
| heoCon | Heo Rừng Con | thường | 52 × 32 | 1,6 | nhìn ngang, quay phải | Bốn chân | dau, chanT, chanS, bom, bui | `#80542c` `#4e3018` `#c89460` `#22692c` | [ảnh](tham-chieu/heoCon.png) |
| ongVo | Bầy Ong Vò Vẽ | thường | 43 × 39 | 1,1 | nhìn ngang, quay phải | Cá, chim bay | ong1, ong2, ong3, canh1, canh2, canh3 | `#7aa8a4` `#d8f4ec` `#c45a1a` `#a8901a` | [ảnh](tham-chieu/ongVo.png) |
| boHung | Bọ Hung Mai Cứng | thường | 54 × 34 | 1,6 | nhìn ngang, quay phải | Cua, bọ (nhiều chân) | mai, c1, c2, c3 | `#3a9a5c` `#b08a3a` `#6a4a1e` `#1a5a40` | [ảnh](tham-chieu/boHung.png) |
| hoaBaoTu | Hoa Phun Bào Tử | thường | 53 × 37 | 1,4 | nhìn ngang, quay phải | Cây, đứng yên | dau, la, bao | `#78b818` `#22692c` `#123a1c` `#58208c` | [ảnh](tham-chieu/hoaBaoTu.png) |
| chonBong | Chồn Bóng | thường | 63 × 28 | 2,2 | nhìn ngang, quay phải | Bốn chân | dau, duoi, chanT, chanS | `#40305e` `#9a48d4` `#9a88c8` `#b8a8d8` | [ảnh](tham-chieu/chonBong.png) |
| namPhong | Nấm Phồng | thường | 32 × 29 | 1,1 | chính diện (hơi chếch phải) | Khối mềm (slime, lửa, ma) | mu, reT, reP | `#9a48d4` `#b0a488` `#58208c` `#3c5a0c` | [ảnh](tham-chieu/namPhong.png) |
| socNo | Sóc Ném Quả Nổ | thường | 49 × 38 | 1,3 | chéo 3/4, quay phải | Bốn chân | qua, duoi, dau | `#d0682a` `#8a3a14` `#f0d8a8` `#7a38b0` | [ảnh](tham-chieu/socNo.png) |
| nhimDoc | Nhím Gai Độc | thường | 44 × 29 | 1,5 | nhìn ngang, quay phải | Bốn chân | dau, gai, chanT, chanS | `#1c1210` `#6a4c38` `#3e2a20` `#9a48d4` | [ảnh](tham-chieu/nhimDoc.png) |
| heoNanh | Heo Rừng Nanh Dài | tinh anh | 90 × 46 | 2,0 | nhìn ngang, quay phải | Bốn chân | dau, chanT, chanS, bui, bom | `#644022` `#fff8e0` `#b0a488` | [ảnh](tham-chieu/heoNanh.png) |
| namPhongChua | Nấm Phồng Chúa | tinh anh | 83 × 45 | 1,8 | chính diện (hơi chếch phải) | Khối mềm (slime, lửa, ma) | mu | `#a048e0` `#b0a488` `#5c1c98` `#f4ffb0` | [ảnh](tham-chieu/namPhongChua.png) |
| namChua | Nấm Chúa | trùm nhỏ | 97 × 63 | 1,5 | chính diện (hơi chếch phải) | Khối mềm (slime, lửa, ma) | mu, tayT, tayP | `#9a48d4` `#5c3a1e` `#58208c` `#9a8a78` | [ảnh](tham-chieu/namChua.png) |
| mocTinh | Mộc Tinh | trùm vùng | 140 × 131 | 1,1 | chính diện (hơi chếch phải) | Cây, đứng yên | tan, canhT, canhP, reT, reP, ham | `#46a83c` `#5c3a1e` `#22692c` `#123a1c` | [ảnh](tham-chieu/mocTinh.png) |
| linhMa | Lính Ma Giáp Gỉ | thường | 50 × 31 | 1,6 | nhìn ngang, quay phải | Người (2 chân) | giao, non, ao | `#5c1a22` `#a85a26` `#6e3418` `#9a3428` | [ảnh](tham-chieu/linhMa.png) |
| doiThan | Bầy Dơi Than | thường | 45 × 38 | 1,2 | chéo 3/4, quay phải | Cá, chim bay | d1, cT1, cP1, d2, cT2, cP2, d3, cT3, cP3 | `#48424e` `#f0506e` `#a8324a` `#fff8e0` | [ảnh](tham-chieu/doiThan.png) |
| tuongDa | Tượng Đá Cầm Khiên | thường | 51 × 32 | 1,6 | chéo 3/4, quay phải | Người (2 chân) | khien, chuy | `#8a8288` `#57505a` `#2c2830` `#cbc3c0` | [ảnh](tham-chieu/tuongDa.png) |
| denLong | Đèn Lồng Ma | thường | 44 × 32 | 1,4 | chính diện (hơi chếch phải) | Khối mềm (slime, lửa, ma) | tua, quai | `#f0582a` `#ff8a1e` `#ffd23c` `#b0261a` | [ảnh](tham-chieu/denLong.png) |
| meoDen | Mèo Đen Hai Đuôi | thường | 58 × 33 | 1,8 | nhìn ngang, quay phải | Bốn chân | dau, duoi, chanT, chanS | `#26222c` `#a8324a` `#48424e` `#f0582a` | [ảnh](tham-chieu/meoDen.png) |
| huLua | Hũ Lửa Sống | thường | 30 × 31 | 1,0 | chính diện (hơi chếch phải) | Khối mềm (slime, lửa, ma) | nap, taiT, taiP, chanT, chanS | `#5c2418` `#96402a` `#ffd23c` `#f0582a` | [ảnh](tham-chieu/huLua.png) |
| tieuYeu | Tiểu Yêu Ném Pháo | thường | 44 × 32 | 1,4 | chéo 3/4, quay phải | Người (2 chân) | phao, dau, duoi | `#b0261a` `#f0582a` `#ffb070` `#fff8e0` | [ảnh](tham-chieu/tieuYeu.png) |
| nhimThan | Nhím Than Hồng | thường | 31 × 28 | 1,1 | chính diện (hơi chếch phải) | Khối mềm (slime, lửa, ma) | gaiTren, gaiT, gaiP, chanT, chanS | `#48424e` `#f0506e` `#ffb070` | [ảnh](tham-chieu/nhimThan.png) |
| tuongMa | Tướng Ma | tinh anh | 64 × 43 | 1,5 | chéo 3/4, quay phải | Người (2 chân) | dao, ao, ngu | `#a85a26` `#6e3418` `#ff8a1e` `#e8e0c4` | [ảnh](tham-chieu/tuongMa.png) |
| huChua | Hũ Lửa Chúa | tinh anh | 59 × 42 | 1,4 | chính diện (hơi chếch phải) | Khối mềm (slime, lửa, ma) | mien | `#8a1c16` `#d2401e` `#ff8a1e` `#ffd23c` | [ảnh](tham-chieu/huChua.png) |
| hoLua | Hổ Lửa | trùm nhỏ | 109 × 64 | 1,7 | nhìn ngang, quay phải | Bốn chân | dau, chanT, chanS, duoi, bom | `#52302a` `#c43c10` `#ff8a1e` `#ffd23c` | [ảnh](tham-chieu/hoLua.png) |
| hoTinh | Hồ Tinh | trùm vùng | 177 × 119 | 1,5 | nhìn ngang, quay phải | Bốn chân | chanT, chanS, dau, d0, d1, d2, d3, d4, d5, d6, d7, d8 | `#f2e6cf` `#c9ad98` `#e8442a` `#fffdf2` | [ảnh](tham-chieu/hoTinh.png) |

### Vũ khí (vẽ nằm ngang, góc 0)

| Mã | Tên | Cỡ | Tỉ lệ | Màu chính | Ảnh |
|---|---|---|---|---|---|
| vk-sword-0 | Kiếm Rèn | 44 × 19 | 2,3 | `#b4c0d4` `#5f6b84` `#f4f8ff` `#e2b64e` | [ảnh](tham-chieu/vk-sword-0.png) |
| vk-sword-1 | Đao Lưỡi Liềm | 44 × 28 | 1,6 | `#b4c0d4` `#5f6b84` `#f4f8ff` `#ffffff` | [ảnh](tham-chieu/vk-sword-1.png) |
| vk-sword-2 | Kiếm Lá Lúa | 45 × 20 | 2,2 | `#b9d8a6` `#5f8a5a` `#e0c060` `#f2fbe2` | [ảnh](tham-chieu/vk-sword-2.png) |
| vk-sword-3 | Gươm Rồng | 46 × 24 | 1,9 | `#b4c0d4` `#e2b64e` `#9c7426` `#5f6b84` | [ảnh](tham-chieu/vk-sword-3.png) |
| vk-sword-4 | Mã Tấu | 46 × 17 | 2,7 | `#7a8496` `#3d4354` `#ffffff` `#c2cad8` | [ảnh](tham-chieu/vk-sword-4.png) |
| vk-sword-5 | Dao Rựa | 48 × 18 | 2,7 | `#7a8496` `#c2cad8` `#3d4354` `#5f6b84` | [ảnh](tham-chieu/vk-sword-5.png) |
| vk-sword-6 | Kiếm Tre | 45 × 22 | 2,0 | `#6f7a2a` `#b3b84a` `#e6e28a` `#2f6a2c` | [ảnh](tham-chieu/vk-sword-6.png) |
| vk-sword-7 | Đoản Kiếm Đông Sơn | 48 × 22 | 2,2 | `#c4853a` `#754418` `#f6d07c` `#ffffff` | [ảnh](tham-chieu/vk-sword-7.png) |
| vk-sword-8 | Đao Cá Chép | 47 × 21 | 2,2 | `#b4c0d4` `#5f6b84` `#f4f8ff` `#9a4a16` | [ảnh](tham-chieu/vk-sword-8.png) |
| vk-sword-9 | Kiếm Sóng Nước | 46 × 18 | 2,6 | `#a9c6e0` `#4f6f94` `#f0f8ff` `#e2b64e` | [ảnh](tham-chieu/vk-sword-9.png) |
| vk-bow-0 | Cung Rồng Rắn | 22 × 38 | 0,6 | `#479544` `#255a2c` `#e2b64e` `#8fd070` | [ảnh](tham-chieu/vk-bow-0.png) |
| vk-bow-1 | Nỏ Thần | 31 × 37 | 0,8 | `#a8783e` `#8a5a34` `#e8e2d0` `#754418` | [ảnh](tham-chieu/vk-bow-1.png) |
| vk-bow-2 | Cung Sừng Trâu | 21 × 37 | 0,6 | `#5a4c58` `#2c2530` `#e8e2d0` `#7a6458` | [ảnh](tham-chieu/vk-bow-2.png) |
| vk-bow-3 | Cung Tre | 22 × 40 | 0,6 | `#a8842e` `#e6e28a` `#6f7a2a` `#b3b84a` | [ảnh](tham-chieu/vk-bow-3.png) |
| vk-bow-4 | Ná Thun | 19 × 32 | 0,6 | `#a8783e` `#6e4a26` `#d2362e` `#d6a868` | [ảnh](tham-chieu/vk-bow-4.png) |
| vk-bow-5 | Cung Cánh Cò | 25 × 37 | 0,7 | `#eeeaf2` `#b9b4c4` `#ffffff` `#e8e2d0` | [ảnh](tham-chieu/vk-bow-5.png) |
| vk-bow-6 | Cung Trăng Khuyết | 20 × 44 | 0,5 | `#f2df8a` `#b89a3e` `#e8e2d0` `#fffbe0` | [ảnh](tham-chieu/vk-bow-6.png) |
| vk-bow-7 | Cung Đàn Bầu | 21 × 39 | 0,5 | `#a8783e` `#a8642a` `#e8e2d0` `#6e4a26` | [ảnh](tham-chieu/vk-bow-7.png) |
| vk-bow-8 | Cung Xương Cá | 20 × 40 | 0,5 | `#e6dcc4` `#a89c84` `#ffffff` `#e8e2d0` | [ảnh](tham-chieu/vk-bow-8.png) |
| vk-bow-9 | Cung Đèn Ông Sao | 25 × 40 | 0,6 | `#e2b64e` `#b3b84a` `#e8e2d0` `#ffe9a0` | [ảnh](tham-chieu/vk-bow-9.png) |
| vk-spear-0 | Giáo Tre Vót | 58 × 18 | 3,2 | `#6f7a2a` `#e6e28a` `#b3b84a` `#ffffff` | [ảnh](tham-chieu/vk-spear-0.png) |
| vk-spear-1 | Đinh Ba | 58 × 23 | 2,5 | `#5f6b84` `#f4f8ff` `#754418` `#b4c0d4` | [ảnh](tham-chieu/vk-spear-1.png) |
| vk-spear-2 | Câu Liêm | 57 × 22 | 2,6 | `#5f6b84` `#b4c0d4` `#f4f8ff` `#b78350` | [ảnh](tham-chieu/vk-spear-2.png) |
| vk-spear-3 | Mác | 59 × 15 | 3,9 | `#5f6b84` `#b4c0d4` `#f4f8ff` `#b78350` | [ảnh](tham-chieu/vk-spear-3.png) |
| vk-spear-4 | Lao Phóng | 58 × 20 | 2,9 | `#d2362e` `#e09c4a` `#8c1c1f` `#5f6b84` | [ảnh](tham-chieu/vk-spear-4.png) |
| vk-spear-5 | Giáo Đồng Đông Sơn | 58 × 15 | 3,9 | `#754418` `#ffffff` `#c4853a` `#f6d07c` | [ảnh](tham-chieu/vk-spear-5.png) |
| vk-spear-6 | Xà Mâu | 62 × 16 | 3,9 | `#3d4354` `#7a8496` `#c2cad8` `#9c7426` | [ảnh](tham-chieu/vk-spear-6.png) |
| vk-spear-7 | Mái Chèo | 57 × 13 | 4,4 | `#a8783e` `#6e4a26` `#d6a868` `#5a3822` | [ảnh](tham-chieu/vk-spear-7.png) |
| vk-spear-8 | Cờ Lau | 60 × 21 | 2,9 | `#b8a890` `#efe6d2` `#ffffff` `#6f7a2a` | [ảnh](tham-chieu/vk-spear-8.png) |
| vk-spear-9 | Bút Lông | 62 × 11 | 5,6 | `#6f7a2a` `#ffffff` `#b9b4c4` `#b3b84a` | [ảnh](tham-chieu/vk-spear-9.png) |
| vk-hammer-0 | Búa Lò Rèn | 41 × 25 | 1,6 | `#7a8496` `#3d4354` `#f4f8ff` `#b4c0d4` | [ảnh](tham-chieu/vk-hammer-0.png) |
| vk-hammer-1 | Chày Giã Gạo | 44 × 17 | 2,6 | `#a8783e` `#6e4a26` `#d6a868` `#eeeaf2` | [ảnh](tham-chieu/vk-hammer-1.png) |
| vk-hammer-2 | Chùy Gai | 45 × 27 | 1,7 | `#7a8496` `#3d4354` `#ffffff` `#c2cad8` | [ảnh](tham-chieu/vk-hammer-2.png) |
| vk-hammer-3 | Rìu Đá | 43 × 26 | 1,7 | `#8e9099` `#a8842e` `#e0c060` `#c9cbd2` | [ảnh](tham-chieu/vk-hammer-3.png) |
| vk-hammer-4 | Vồ Gỗ | 41 × 29 | 1,4 | `#a8783e` `#7a8496` `#6e4a26` `#d6a868` | [ảnh](tham-chieu/vk-hammer-4.png) |
| vk-hammer-5 | Chiêng Đồng | 46 × 25 | 1,8 | `#c4853a` `#754418` `#f6d07c` `#ffffff` | [ảnh](tham-chieu/vk-hammer-5.png) |
| vk-hammer-6 | Trống Đồng | 43 × 26 | 1,7 | `#c4853a` `#754418` `#f6d07c` `#ffffff` | [ảnh](tham-chieu/vk-hammer-6.png) |
| vk-hammer-7 | Rìu Xéo Đông Sơn | 42 × 23 | 1,8 | `#c4853a` `#754418` `#f6d07c` `#ffffff` | [ảnh](tham-chieu/vk-hammer-7.png) |
| vk-hammer-8 | Búa Đầu Trâu | 44 × 35 | 1,3 | `#7a6458` `#5a4c58` `#4a3a34` `#c9a59a` | [ảnh](tham-chieu/vk-hammer-8.png) |
| vk-hammer-9 | Chùy Hồ Lô | 45 × 22 | 2,0 | `#a8642a` `#e09c4a` `#8c1c1f` `#d2362e` | [ảnh](tham-chieu/vk-hammer-9.png) |

### Trang phục (một lớp trên em bé Thợ Rèn đứng yên)

| Mã | Tên | Cỡ | Màu chính | Ảnh |
|---|---|---|---|---|
| tp-hats-trum_sung | Mũ trùm sừng nhỏ | 17 × 20 | `#d2362e` `#8c1c1f` `#f47a62` `#f6f0e2` | [ảnh](tham-chieu/tp-hats-trum_sung.png) |
| tp-hats-trum_nhon | Mũ trùm chóp nhọn | 17 × 22 | `#d2362e` `#8c1c1f` `#f47a62` | [ảnh](tham-chieu/tp-hats-trum_nhon.png) |
| tp-hats-trum_la | Mũ trùm mầm lá | 17 × 21 | `#d2362e` `#8c1c1f` `#f47a62` `#479544` | [ảnh](tham-chieu/tp-hats-trum_la.png) |
| tp-hats-trum_khan | Mũ trùm quấn khăn đỏ | 20 × 18 | `#d2362e` `#8c1c1f` `#f47a62` | [ảnh](tham-chieu/tp-hats-trum_khan.png) |
| tp-hats-non_la | Nón lá | 25 × 22 | `#d8b45c` `#8f6c2a` `#f8e6a4` `#d2362e` | [ảnh](tham-chieu/tp-hats-non_la.png) |
| tp-hats-khan_xep | Khăn xếp | 18 × 9 | `#2e2d55` `#5c5a92` `#e2b64e` | [ảnh](tham-chieu/tp-hats-khan_xep.png) |
| tp-hats-mu_rom | Mũ rơm | 26 × 9 | `#f8e6a4` `#8f6c2a` `#d8b45c` | [ảnh](tham-chieu/tp-hats-mu_rom.png) |
| tp-hats-mu_sung | Mũ sừng | 25 × 14 | `#e2b64e` `#8a5a34` `#b78350` `#a89c84` | [ảnh](tham-chieu/tp-hats-mu_sung.png) |
| tp-hats-vong_la | Vòng lá | 17 × 7 | `#479544` `#8fd070` `#255a2c` `#d2362e` | [ảnh](tham-chieu/tp-hats-vong_la.png) |
| tp-hats-mu_da_ca | Mũ da cá | 19 × 16 | `#2a5a70` `#4a7f9a` `#8fc0d4` | [ảnh](tham-chieu/tp-hats-mu_da_ca.png) |
| tp-hats-khan_lua | Khăn đá lửa | 22 × 9 | `#7a2a12` `#b0502a` `#f08a4a` `#ffe9a0` | [ảnh](tham-chieu/tp-hats-khan_lua.png) |
| tp-hats-mu_vay_ca | Mũ vây cá | 22 × 17 | `#8fd0ea` `#3f8fb5` `#7fc4f2` `#2f62ad` | [ảnh](tham-chieu/tp-hats-mu_vay_ca.png) |
| tp-hats-mu_tai_cao | Mũ tai cáo | 17 × 21 | `#f0ece2` `#b8b0a8` `#ffffff` `#f0a0a0` | [ảnh](tham-chieu/tp-hats-mu_tai_cao.png) |
| tp-robes-ao_trum | Áo trùm | 13 × 13 | `#d2362e` `#8c1c1f` `#f47a62` | [ảnh](tham-chieu/tp-robes-ao_trum.png) |
| tp-robes-ao_toi | Áo tơi lá | 15 × 14 | `#d8b45c` `#8f6c2a` `#f8e6a4` | [ảnh](tham-chieu/tp-robes-ao_toi.png) |
| tp-robes-ao_the | Áo the | 12 × 13 | `#2e2d55` `#5c5a92` `#f6f0e2` `#ffffff` | [ảnh](tham-chieu/tp-robes-ao_the.png) |
| tp-robes-giap_tre | Giáp tre | 15 × 13 | `#6c6a2c` `#b4ae58` `#e6e298` `#d2362e` | [ảnh](tham-chieu/tp-robes-giap_tre.png) |
| tp-robes-ao_da | Áo da | 11 × 13 | `#8a5a34` `#5a3822` `#f0ece2` `#ffffff` | [ảnh](tham-chieu/tp-robes-ao_da.png) |
| tp-robes-ao_la | Áo lá | 15 × 14 | `#479544` `#255a2c` `#8fd070` `#d2362e` | [ảnh](tham-chieu/tp-robes-ao_la.png) |
| tp-robes-kho_vat | Khố đô vật | 11 × 8 | `#8c1c1f` `#d2362e` `#f47a62` `#e2b64e` | [ảnh](tham-chieu/tp-robes-kho_vat.png) |
| tp-robes-ao_vai | Áo vải thô | 12 × 12 | `#7a6a4a` `#a89872` `#d8ccaa` `#8a5a34` | [ảnh](tham-chieu/tp-robes-ao_vai.png) |
| tp-robes-ao_da_bien | Áo da biển | 11 × 13 | `#4a7f9a` `#7fc4f2` `#2a5a70` `#eafcff` | [ảnh](tham-chieu/tp-robes-ao_da_bien.png) |
| tp-robes-giap_da | Áo giáp đá | 15 × 13 | `#5a4e4a` `#8a7a74` `#bdb0a8` `#b0502a` | [ảnh](tham-chieu/tp-robes-giap_da.png) |
| tp-robes-ao_vo_cay | Áo vỏ cây | 15 × 16 | `#4a3018` `#7a5632` `#479544` `#a8804e` | [ảnh](tham-chieu/tp-robes-ao_vo_cay.png) |
| tp-robes-ao_vay | Áo vảy | 12 × 12 | `#3f8fb5` `#8fd0ea` `#1f5f85` `#e2b64e` | [ảnh](tham-chieu/tp-robes-ao_vay.png) |
| tp-robes-ao_long | Áo lông trắng | 15 × 14 | `#f0ece2` `#b8b0a8` `#ffffff` `#d2362e` | [ảnh](tham-chieu/tp-robes-ao_long.png) |
| tp-backs-ho_lo | Bầu hồ lô | 20 × 28 | `#e09c4a` `#a8642a` `#f9d08c` `#d2362e` | [ảnh](tham-chieu/tp-backs-ho_lo.png) |
| tp-backs-ong_ten | Ống tên | 18 × 18 | `#8a5a34` `#5a3822` `#b78350` `#e2b64e` | [ảnh](tham-chieu/tp-backs-ong_ten.png) |
| tp-backs-ao_choang | Áo choàng | 13 × 15 | `#d2362e` `#8c1c1f` `#f47a62` `#e2b64e` | [ảnh](tham-chieu/tp-backs-ao_choang.png) |
| tp-backs-gui_tre | Gùi tre | 12 × 16 | `#b4ae58` `#6c6a2c` `#e6e298` `#5a3822` | [ảnh](tham-chieu/tp-backs-gui_tre.png) |
| tp-backs-khan_bang | Khăn choàng sương | 18 × 16 | `#eafcff` `#2f62ad` `#4a7f9a` `#7fc4f2` | [ảnh](tham-chieu/tp-backs-khan_bang.png) |
| tp-backs-trong_nho | Trống đồng nhỏ | 16 × 25 | `#754418` `#c4853a` `#ffe9a0` `#d2362e` | [ảnh](tham-chieu/tp-backs-trong_nho.png) |
| tp-hands-bua_con | Búa rèn tí hon | 7 × 11 | `#5f6b84` `#5a3822` `#f4f8ff` `#b4c0d4` | [ảnh](tham-chieu/tp-hands-bua_con.png) |
| tp-hands-gang_dong | Găng đồng | 14 × 5 | `#754418` `#f6d07c` `#c4853a` `#ffffff` | [ảnh](tham-chieu/tp-hands-gang_dong.png) |
| tp-hands-bua_nanh | Bùa nanh rắn | 5 × 13 | `#f47a62` `#fffaf0` `#a89c84` `#5a3822` | [ảnh](tham-chieu/tp-hands-bua_nanh.png) |
| tp-hands-bua_oc | Bùa vỏ ốc | 5 × 13 | `#f47a62` `#5a3822` `#2f62ad` `#eafcff` | [ảnh](tham-chieu/tp-hands-bua_oc.png) |
| tp-hands-bua_lua | Bùa đá lửa | 5 × 13 | `#a32418` `#f47a62` `#ffc64c` `#f2622a` | [ảnh](tham-chieu/tp-hands-bua_lua.png) |
| tp-hands-bua_hut | Bùa hút máu | 5 × 13 | `#f47a62` `#8c1c1f` `#d2362e` `#5a3822` | [ảnh](tham-chieu/tp-hands-bua_hut.png) |
| tp-hands-bua_tan | Bùa tàn lửa | 5 × 13 | `#f47a62` `#5a3822` `#7a2a12` `#f08a4a` | [ảnh](tham-chieu/tp-hands-bua_tan.png) |
| tp-hands-bua_suong | Bùa sương | 5 × 13 | `#27407f` `#f47a62` `#86a8f0` `#4468c0` | [ảnh](tham-chieu/tp-hands-bua_suong.png) |
| tp-hands-bua_tham | Bùa tham | 5 × 13 | `#f47a62` `#5a3822` `#9c7426` `#ffe9a0` | [ảnh](tham-chieu/tp-hands-bua_tham.png) |
| tp-hands-bua_linh | Bùa linh | 5 × 13 | `#a56fd0` `#3d1d55` `#f47a62` `#6b3a8f` | [ảnh](tham-chieu/tp-hands-bua_linh.png) |
| tp-masks-lua | Dấu lửa | 4 × 4 | `#d2362e` `#ffe9a0` | [ảnh](tham-chieu/tp-masks-lua.png) |
| tp-masks-la | Dấu lá | 11 × 8 | `#479544` | [ảnh](tham-chieu/tp-masks-la.png) |
| tp-masks-xoay | Dấu nước | 4 × 4 | `#4468c0` `#86a8f0` | [ảnh](tham-chieu/tp-masks-xoay.png) |
| tp-masks-du | Dấu đô vật | 10 × 5 | `#d2362e` | [ảnh](tham-chieu/tp-masks-du.png) |
| tp-masks-ho | Mặt nạ hổ | 11 × 9 | `#dd7c2a` | [ảnh](tham-chieu/tp-masks-ho.png) |
| tp-wings-chuon | Cánh chuồn chuồn | 17 × 17 | `#a8dcf0` `#5a8fb8` `#f0fcff` `#2c4a6a` | [ảnh](tham-chieu/tp-wings-chuon.png) |
| tp-wings-la | Cánh lá | 17 × 17 | `#255a2c` `#479544` `#8fd070` | [ảnh](tham-chieu/tp-wings-la.png) |
| tp-wings-lua | Cánh lửa | 18 × 19 | `#f2622a` `#a32418` `#ffc64c` `#7a1810` | [ảnh](tham-chieu/tp-wings-lua.png) |
| tp-wings-bang | Cánh băng | 18 × 18 | `#7fc4f2` `#2f62ad` `#ffffff` `#eafcff` | [ảnh](tham-chieu/tp-wings-bang.png) |

### Đồ và tài nguyên

| Mã | Tên | Cỡ | Màu chính | Ảnh |
|---|---|---|---|---|
| vp-gold | Vàng | 7 × 7 | `#ffd23f` `#e0a020` `#fff6c0` | [ảnh](tham-chieu/vp-gold.png) |
| vp-potion | Bình máu | 8 × 9 | `#c4202c` `#e8e0d0` `#ff5a5a` `#5a3a1e` | [ảnh](tham-chieu/vp-potion.png) |
| vp-linhkhi-fire | Linh khí Lửa | 10 × 10 | `#ff7a2a` `#ffd23f` `#ffffff` | [ảnh](tham-chieu/vp-linhkhi-fire.png) |
| vp-linhkhi-poison | Linh khí Độc | 10 × 10 | `#6fcf3a` `#c2f58a` `#ffffff` | [ảnh](tham-chieu/vp-linhkhi-poison.png) |
| vp-linhkhi-ice | Linh khí Băng | 10 × 10 | `#7fd4ff` `#e9f9ff` `#ffffff` | [ảnh](tham-chieu/vp-linhkhi-ice.png) |
| vp-ore | Quặng | 7 × 7 | `#c9ccd2` `#8a8f98` `#ffffff` | [ảnh](tham-chieu/vp-ore.png) |
| vp-stone | Đá tôi | 7 × 7 | `#d48af5` `#8a4ab0` `#ffffff` | [ảnh](tham-chieu/vp-stone.png) |
| vp-mat0 | Gỗ linh | 7 × 6 | `#a06a3a` `#9bd14a` `#f0d090` `#6a4424` | [ảnh](tham-chieu/vp-mat0.png) |
| vp-mat1 | Vảy cá | 7 × 7 | `#7fd4ff` `#3f8be0` `#ffffff` | [ảnh](tham-chieu/vp-mat1.png) |
| vp-mat2 | Đá lửa | 7 × 7 | `#ff7a2a` `#ffe07a` `#ffb040` | [ảnh](tham-chieu/vp-mat2.png) |
| vp-shard0 | Mảnh Mộc Tinh | 6 × 7 | `#8ac84a` `#eaffc0` `#4a8a2a` | [ảnh](tham-chieu/vp-shard0.png) |
| vp-shard1 | Mảnh Ngư Tinh | 6 × 7 | `#5ab0f0` `#e0f4ff` `#2a6ab0` | [ảnh](tham-chieu/vp-shard1.png) |
| vp-shard2 | Mảnh Hồ Tinh | 6 × 7 | `#ff8a4a` `#fff0d0` `#c04a1a` | [ảnh](tham-chieu/vp-shard2.png) |
| vp-xp | Kinh nghiệm | 7 × 7 | `#ffffff` | [ảnh](tham-chieu/vp-xp.png) |

### Người làng (khung Người; đứng thở và nói chuyện, vẫy tay)

| Mã | Tên | Cỡ | Tỉ lệ | Số màu | Màu chính | Ảnh |
|---|---|---|---|---|---|---|
| nl-lai | Chú Lái Đò | 29 × 40 | 0,7 | 15 | `#8a5632` `#f4eee0` `#b8a45a` `#d9cfbb` | [ảnh](tham-chieu/nl-lai.png) |
| nl-ren | Ông Thợ Rèn | 28 × 40 | 0,7 | 19 | `#3a2a26` `#9a4a30` `#7a3622` `#f4eee0` | [ảnh](tham-chieu/nl-ren.png) |
| nl-xen | Bà Hàng Xén | 19 × 29 | 0,7 | 14 | `#2e2838` `#f4eee0` `#8a5a38` `#6fb060` | [ảnh](tham-chieu/nl-xen.png) |
| nl-may | Cô Thợ May | 24 × 33 | 0,7 | 13 | `#2e2838` `#f4eee0` `#d86a7a` `#b04a5e` | [ảnh](tham-chieu/nl-may.png) |
| nl-do | Cụ Đồ | 21 × 28 | 0,8 | 12 | `#363e6c` `#f4eee0` `#4a548c` `#fbf7ee` | [ảnh](tham-chieu/nl-do.png) |
| nl-tu | Ông Từ | 26 × 32 | 0,8 | 16 | `#d0a440` `#f4eee0` `#7a3a2a` `#a87e2a` | [ảnh](tham-chieu/nl-tu.png) |
| nl-mo | Anh Mõ | 25 × 31 | 0,8 | 16 | `#f4eee0` `#3f9a8c` `#3a4a8a` `#2c7468` | [ảnh](tham-chieu/nl-mo.png) |

## 4. Làm lại số đo

Khi hình trong game đổi: `python3 docs/xuong-sprite/tham-chieu/tao_anh.py` (vẽ lại ảnh tham chiếu và số đo), rồi `viet_dac_diem.py` (tệp này) và `viet_prompt.py` (cập nhật PROMPT-VE.md). Không cần chạy bài kiểm tra game.
