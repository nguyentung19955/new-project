# Khung que 8 hướng cho Cu Tí — báo cáo

*16/10/2026 · cho chủ game · không sửa code game, không chơi thử game. Đủ 27/27 động tác.*

## Tóm tắt nhanh

- Đã làm **bộ xương chuẩn** cho Cu Tí (đầu to kiểu chibi, ô 96×96, chân chạm đất luôn ở điểm (48, 90)) và **khung que cho 27 động tác × 5 hướng**, mỗi khung đều có toạ độ khớp (JSON), ảnh khung que nền xanh #00FF00 để gửi kèm khi gen, ảnh động GIF và prompt tiếng Anh.
- **8 hướng nhưng chỉ phải gen 5**: Xuống (S), Chéo xuống phải (SE), Phải (E), Chéo lên phải (NE), Lên (N). Ba hướng trái là **lật gương** của SE / E / NE (game vốn đã lật như vậy).
- **Số khung, thời lượng, khung chạm ★ giữ đúng như game hiện tại** (đọc từ bảng động tác và bảng mốc khung của game). Không động tới code game.
- **Mượt**: máy tự đo, mọi khớp tay chân đổi **không quá 45°** giữa 2 khung liền nhau. Một chỗ duy nhất vượt là cú **lộn** (cả người phải xoay đủ 1 vòng trong 6 khung) — xem bảng kiểm.
- **Mở trang xem trên điện thoại**: `docs/khung-que-8-huong/xem.html` — chọn động tác + hướng, chạy chậm ×0,25, xem cùng lúc 8 hướng, có bảng tự kiểm.

## Khối lượng phải gen (nói thẳng)

| Cách | Số lần gen (chưa tính gen lại) |
|---|---|
| Bước 0: khung chuẩn mỗi hướng | **4** (E đã có sẵn) |
| Cách A: gen **cả hàng** mỗi động tác × hướng | **135 hàng** (27 động tác × 5 hướng) |
| Cách B (khuyên dùng): **sửa từng khung** | **805 khung** (161 khung × 5 hướng) |
| Cách B nhưng giữ nguyên hướng E đang có trong game | **644 khung** (4 hướng) — rẻ hơn nhưng hướng E sẽ hơi khác dáng các hướng kia |

Thực tế nên cộng thêm khoảng 20–30% lần gen lại. Đây là khối lượng lớn: nếu mỗi ngày làm ~40 khung thì khoảng 3–4 tuần cho đủ 27 động tác. Vì vậy **làm theo thứ tự ưu tiên** dưới đây, xong nhóm nào đưa vào game nhóm đó.

## Thứ tự gen đề xuất

1. **Bước 0 — khung chuẩn 5 hướng** (`prompt/00-khung-chuan.md`): E có sẵn → SE → S, và E → NE → N (mỗi lần chỉ xoay 45° để AI giữ đúng mặt mũi, quần áo).
2. **Đứng thở** (8 khung) → **Chạy** (12) → **Đi bộ** (8) → **Lộn né** (6) → **Kiếm nhát 1–3** (5 + 5 + 6). Nhóm này là thứ người chơi nhìn thấy nhiều nhất.
3. Trúng đòn, Chết, Đấm.
4. Thương (1–3, quét, giữ, xốc) → Búa (nện, giữ, nện đất) → Phi tiêu (ném, ngắm, chùm) → Chưởng.
5. Bốn chiêu đặc biệt: Trảm nguyệt, Phi thương, Địa chấn, Mưa phi tiêu.

## Cách dùng ảnh khung que khi gen

**Bài học cũ:** gen kiểu "vẽ lại từ khung que" chỉ khớp dáng **45–65%**; gen kiểu "sửa ảnh gốc, giữ dáng" khớp **92–94%**. Nên quy trình là:

1. **Bước 0** — mỗi hướng gen **1 khung chuẩn** (Cu Tí đứng thủ) bằng cách **sửa ảnh** khung chuẩn của hướng bên cạnh + khung que `anh/01-dung/<hướng>/k1.png`.
2. **Khung 1 của mỗi động tác** — sửa ảnh khung chuẩn của hướng đó theo khung que `anh/<động-tác>/<hướng>/k1.png`.
3. **Khung 2, 3, …** — **sửa ảnh khung vừa gen** theo khung que `kN.png` của khung tiếp theo, dùng prompt **B (sửa khung trước)** + dán dòng mô tả khung N trong prompt A. Mỗi lần chỉ đổi một chút → AI không vẽ sai tay.
4. Muốn nhanh thì thử prompt **A (gen cả hàng)** với ảnh `anh/<động-tác>/<hướng>-sach.png`; hàng nào lệch dáng thì sửa riêng khung đó bằng cách B.
5. Gen xong, đặt ảnh cạnh GIF khung que (`gif/<động-tác>/<hướng>.gif`) để so: tay cam phải nằm đúng chỗ, tay tím phải bị thân che đúng lúc.

**Đọc ảnh khung que:**

| Màu | Là gì |
|---|---|
| 🟧 cam `#ff8a00` | **tay phải** (tay cầm vũ khí). Ở 3 hướng phải SE / E / NE đây là tay **gần camera = TRƯỚC thân** |
| 🟪 tím `#6a2ca0` | **tay trái**. Ở SE / E / NE là tay **xa camera = SAU thân** |
| 🟨 vàng `#ffd200` | **chân phải** (gần camera ở SE / E / NE) |
| 🟦 xanh đậm `#1f4fa0` | **chân trái** (xa camera ở SE / E / NE) |
| ⬜ trắng viền đen | thân, đầu. Mảng xám trên đầu = tóc (cho biết đầu quay hướng nào), chấm đỏ = mắt |
| 🟥 đỏ | **hướng vũ khí** (kiếm / thương / búa) hoặc ngôi sao = phi tiêu. **Không vẽ vũ khí vào ảnh nhân vật**: game tự gắn vũ khí theo cấp (Trắng … Thức tỉnh), nên chỉ vẽ nắm tay cầm theo hướng vạch đỏ |
| ★ cạnh số khung | **khung chạm** (lúc gây sát thương) |
| vạch xanh đậm ngang | đường đất (y = 90) |

Chi xa camera được vẽ **trước** (nằm dưới), chi gần vẽ **sau** (nằm trên) — đúng thứ tự AI cần vẽ tay nào che tay nào. Tệp `-sach.png` là bản không số để gửi kèm; tệp có số để chủ game đối chiếu.

## Bộ xương chuẩn

- **Khớp** (tên trong JSON): đầu `dau`, cổ `co`, ngực `nguc`, eo/hông giữa `eo`, vai T/P `vai_t` `vai_p`, khuỷu `khuyu_t` `khuyu_p`, cổ tay `co_tay_t` `co_tay_p`, hông `hong_t` `hong_p`, gối `goi_t` `goi_p`, cổ chân `co_chan_t` `co_chan_p`, mũi chân `mui_chan_t` `mui_chan_p`, vũ khí `vk_goc` (chuôi) `vk_mui` (mũi). T = trái, P = phải của Cu Tí.
- **Tỉ lệ chibi theo ảnh Cu Tí**: đầu bán kính 14,5 (cao ~42% người), thân hông→vai 13, cánh tay 9 + cẳng tay 8, đùi 10 + cẳng chân 10, bàn chân 5. Đứng thẳng: đỉnh đầu ở y ≈ 23, hông ở y ≈ 68, chân ở y = 90.
- **Ô 96×96, điểm chạm đất cố định (48, 90)** cho mọi khung, mọi hướng: điểm trên đất ngay dưới hông giữa. Khung nào nhảy (chạy bay người, kiếm 3, búa nện đất, địa chấn) thì cả người nhấc lên khỏi đường đất; riêng **lộn** thì tâm người lăn qua điểm gốc.
- **Phối cảnh** nhìn từ trên xuống ~30°: càng xa camera (phía Bắc) càng cao lên màn hình nửa đơn vị. Vì thế ở hướng S chân bước tới trông thấp hơn chân sau một chút — đúng phối cảnh.
- Tư thế dựng bằng **góc khớp** (vai, khuỷu, cổ tay, hông, gối, cổ chân, eo, cổ) rồi tính ra toạ độ → mọi điểm đi theo **cung tròn**, không đi thẳng. Một tư thế dùng chung cho cả 5 hướng (chỉ xoay người), nên các hướng luôn khớp nhau từng khung.

## 8 hướng — tay chân nào gần / xa camera

| Hướng | Thấy gì | Gần camera (TRƯỚC) | Xa camera (SAU) |
|---|---|---|---|
| **S** Xuống | mặt, ngực | tay/chân nào đang **vung tới** (về phía camera) | tay/chân **vung lùi** |
| **SE** Chéo xuống phải | 3/4 mặt | bên **phải**: tay cam, chân vàng | bên trái: tay tím, chân xanh |
| **E** Phải | nghiêng, 1 mắt | bên **phải**: tay cam, chân vàng | bên trái: tay tím, chân xanh |
| **NE** Chéo lên phải | 3/4 lưng | bên **phải** | bên trái |
| **N** Lên | lưng, gáy | tay/chân **vung lùi** (về phía camera) | tay **vươn tới** (bị thân/đầu che) |
| SW / W / NW | = lật gương SE / E / NE | | |

Prompt từng khung ghi sẵn "orange arm FRONT / purple arm BEHIND body…" tính theo đúng độ sâu của khung đó, nên ở S và N cũng không phải đoán.

**Lật gương làm tay cầm vũ khí đổi phía — chọn: CHẤP NHẬN ĐỔI TAY.** Lý do ngắn: (1) game hiện tại đã lật cả người lẫn vũ khí khi quay trái, người chơi đã quen; (2) đỡ 3/8 khối lượng (khoảng 483 khung); (3) ở cỡ thật 48 điểm ảnh, áo ninja gần như đối xứng (chỉ nút đai đổi bên), khó nhận ra tay trái hay phải. Nếu sau này muốn tay phải tuyệt đối thì công cụ đã sẵn: bộ xương xoay được sang W/SW/NW thật, chỉ cần gen thêm 3 hướng.

## Bảng tự kiểm mượt

Đo góc quay của **từng khớp** (vai, khuỷu, cổ tay/vũ khí, hông, gối, cổ chân, eo, cổ, cả người) giữa 2 khung liền nhau; động tác lặp đo cả khung cuối → khung đầu. Ngưỡng: **≤ 45°**. Cột "2D" là góc xoay lớn nhất của một đoạn xương trên màn hình ở 5 hướng (bỏ qua đoạn chĩa thẳng vào camera, bị chiếu ngắn < 50%).

| # | Động tác | Khung | Giây | ★ | Khớp đổi nhiều nhất | Góc lớn nhất | Giữa khung | Đạt ≤45° | 2D lớn nhất (hướng) |
|---|---|---|---|---|---|---|---|---|---|
| 01 | Đứng thở | 8 | 1.0 | — | khuỷu phải | 2.1° | 3→4 | ✅ | 4.2° (SE) |
| 02 | Đi bộ | 8 | 0.8 | — | gối phải | 22.6° | 5→6 | ✅ | 30.1° (E) |
| 03 | Chạy | 12 | 0.6 | — | gối phải | 25.0° | 12→1 | ✅ | 43.6° (SE) |
| 04 | Lộn né | 6 | 0.27 | — | cả người | 95.0° | 3→4 | ⚠️ cả người 95.0° | 180.0° (S) |
| 05 | Trúng đòn | 4 | 0.2 | — | khuỷu trái | 30.0° | 2→3 | ✅ | 46.8° (E) |
| 06 | Chết | 8 | 0.6 | — | gối phải | 28.0° | 1→2 | ✅ | 52.6° (NE) |
| 07 | Chưởng | 6 | 0.3 | 4 | khuỷu phải | 44.0° | 3→4 | ✅ | 42.5° (E) |
| 08 | Kiếm nhát 1 | 5 | 0.3 | 3 | khuỷu phải | 45.0° | 2→3 | ✅ | 151.0° (S) |
| 09 | Kiếm nhát 2 | 5 | 0.3 | 3 | cổ tay phải (vũ khí) | 45.0° | 1→2 | ✅ | 109.2° (NE) |
| 10 | Kiếm nhát 3 | 6 | 0.46 | 3 | cổ tay phải (vũ khí) | 45.0° | 2→3 | ✅ | 177.5° (SE) |
| 11 | Thương nhát 1 | 6 | 0.38 | 3 | vai phải | 45.0° | 2→3 | ✅ | 56.7° (S) |
| 12 | Thương nhát 2 | 6 | 0.34 | 3 | vai phải | 45.0° | 2→3 | ✅ | 56.7° (S) |
| 13 | Thương nhát 3 | 6 | 0.34 | 3 | vai phải | 45.0° | 2→3 | ✅ | 58.8° (S) |
| 14 | Thương quét | 6 | 0.52 | 3 | vai phải | 40.0° | 2→3 | ✅ | 90.3° (S) |
| 15 | Thương giữ (tụ lực) | 3 | 0.45 | — | eo (thân trên) | 2.0° | 2→3 | ✅ | 2.2° (NE) |
| 16 | Thương xốc (lướt đâm) | 4 | 0.16 | 2 | gối phải | 30.0° | 3→4 | ✅ | 50.8° (SE) |
| 17 | Búa nện | 8 | 0.8 | 3 | vai phải | 45.0° | 1→2 | ✅ | 180.0° (SE) |
| 18 | Búa giữ (tụ lực) | 4 | 0.5 | — | gối phải | 2.0° | 2→3 | ✅ | 4.0° (NE) |
| 19 | Búa nện đất | 6 | 0.7 | 3 | vai phải | 40.0° | 1→2 | ✅ | 126.0° (E) |
| 20 | Phi tiêu | 6 | 0.38 | 3 | khuỷu phải | 45.0° | 2→3 | ✅ | 77.9° (NE) |
| 21 | Phi tiêu ngắm | 3 | 0.45 | — | eo (thân trên) | 2.0° | 2→3 | ✅ | 4.0° (N) |
| 22 | Phi tiêu chùm | 6 | 0.5 | 2 | khuỷu phải | 45.0° | 1→2 | ✅ | 73.0° (NE) |
| 23 | Trảm nguyệt (chiêu kiếm) | 6 | 0.35 | 2 | eo (thân trên) | 41.2° | 1→2 | ✅ | 69.0° (SE) |
| 24 | Phi thương (chiêu thương) | 6 | 0.35 | 2 | khuỷu phải | 45.0° | 1→2 | ✅ | 58.5° (SE) |
| 25 | Địa chấn (chiêu búa) | 6 | 0.35 | 2 | vai phải | 45.0° | 1→2 | ✅ | 177.1° (SE) |
| 26 | Mưa phi tiêu (chiêu phi tiêu) | 6 | 0.35 | 2 | vai phải | 43.0° | 4→5 | ✅ | 70.7° (SE) |
| 27 | Đấm (tay không) | 5 | 0.3 | 3 | khuỷu phải | 45.0° | 2→3 | ✅ | 56.0° (NE) |

⚠️ duy nhất: **Lộn né** — "cả người" xoay ~85–95° mỗi khung khi cuộn tròn. Lộn trọn 1 vòng 360° trong 6 khung (0,27 giây) bắt buộc ~72°/khung trung bình; các khớp tay chân vẫn ≤ 45° (người cuộn tròn như quả bóng nên mắt không thấy giật). Không thể dưới 45° nếu giữ 6 khung; muốn tuyệt đối thì phải thêm khung (đổi game) — không làm.


Cột **2D** (tham khảo) đo góc xoay của từng đoạn xương *trên màn hình* (không tính vũ khí). Với đòn nhanh (kiếm, búa, các chiêu: 0,3–0,5 giây, khung chạm ở khung 2–3) cẳng tay vẫn quét 60–180° trên màn hình giữa khung lấy đà và khung chạm, vì vai + khuỷu + cổ tay + eo cùng xoay (mỗi khớp ≤ 45°). Đây là giới hạn khi **giữ nguyên số khung**; game đã xoay vũ khí nội suy êm giữa 2 khung và có vệt chém che chỗ này. Đi, chạy, đứng: mọi đoạn xương trên màn hình đổi ≤ ~45°.

Đã lo thêm cho mượt: vòng lặp (đứng, đi, chạy, giữ thương, giữ búa, ngắm phi tiêu) có khung cuối nối khung đầu; đi/chạy tay vung **ngược pha** chân (chân phải tới thì tay trái tới), vai xoay ngược hông; mỗi đòn có **khung lấy đà** (vặn eo, dồn trọng tâm ra sau) và **khung dư** (vũ khí đi tiếp theo cung rồi mới hồi) nằm trong số khung sẵn có; đòn đánh lấy đà chủ yếu bằng eo và chân để tay không phải giật xa.

## 27 động tác (giữ như game)

| Mã | Động tác | Khung | Giây | Thời gian từng khung (ms) | ★ | Vũ khí | Ghi chú |
|---|---|---|---|---|---|---|---|
| 01 | Đứng thở | 8 | 1.0 | 156 · 156 · 156 · 156 · 156 · 156 · 156 · 156 | — | tay không | Game phát qua lại 1-2-3-4-5-4-3-2 (bảng QUA_LAI) và chậm ×1,25; khung 1→8→1 cũng nối vòng mượt. |
| 02 | Đi bộ | 8 | 0.8 | 125 · 125 · 125 · 125 · 125 · 125 · 125 · 125 | — | tay không | Lặp; game chậm ×1,25. |
| 03 | Chạy | 12 | 0.6 | 62 · 62 · 62 · 62 · 62 · 62 · 62 · 62 · 62 · 62 · 62 · 62 | — | tay không | Lặp; game chậm ×1,25. Chạy lùi = phát ngược. |
| 04 | Lộn né | 6 | 0.27 | 45 · 45 · 45 · 45 · 45 · 45 | — | tay không | Không vũ khí. |
| 05 | Trúng đòn | 4 | 0.2 | 50 · 50 · 50 · 50 | — | tay không |  |
| 06 | Chết | 8 | 0.6 | 75 · 75 · 75 · 75 · 75 · 75 · 75 · 75 | — | tay không |  |
| 07 | Chưởng | 6 | 0.3 | 36 · 39 · 45 · 60 · 60 · 60 | 4 | tay không | Viên chưởng sinh ngay lúc bấm; ★ = khung đẩy chưởng mạnh nhất (khung 4). |
| 08 | Kiếm nhát 1 | 5 | 0.3 | 66 · 69 · 60 · 51 · 54 | 3 | kiếm | ★ ở 0,45. |
| 09 | Kiếm nhát 2 | 5 | 0.3 | 66 · 69 · 60 · 51 · 54 | 3 | kiếm | ★ ở 0,45. |
| 10 | Kiếm nhát 3 | 6 | 0.46 | 92 · 115 · 69 · 69 · 60 · 55 | 3 | kiếm | ★ ở 0,45. |
| 11 | Thương nhát 1 | 6 | 0.38 | 84 · 87 · 38 · 57 · 57 · 57 | 3 | thương | ★ ở 0,45. |
| 12 | Thương nhát 2 | 6 | 0.34 | 75 · 78 · 34 · 51 · 51 · 51 | 3 | thương | ★ ở 0,45. |
| 13 | Thương nhát 3 | 6 | 0.34 | 75 · 78 · 34 · 51 · 51 · 51 | 3 | thương | ★ ở 0,45. |
| 14 | Thương quét | 6 | 0.52 | 114 · 120 · 52 · 78 · 78 · 78 | 3 | thương | ★ ở 0,45. |
| 15 | Thương giữ (tụ lực) | 3 | 0.45 | 150 · 150 · 150 | — | thương | Lặp khi giữ nút. |
| 16 | Thương xốc (lướt đâm) | 4 | 0.16 | 40 · 40 · 40 · 40 | 2 | thương | Khung chọn theo tiến độ lướt; trúng trong lúc lướt, ★ đánh dấu khung 2. |
| 17 | Búa nện | 8 | 0.8 | 120 · 160 · 120 · 96 · 96 · 88 · 64 · 56 | 3 | búa | ★ ở 0,35. |
| 18 | Búa giữ (tụ lực) | 4 | 0.5 | 125 · 125 · 125 · 125 | — | búa | Game phát qua lại 1-2-3-4-3-2. |
| 19 | Búa nện đất | 6 | 0.7 | 140 · 175 · 105 · 105 · 91 · 84 | 3 | búa | Thả nút vào từ u 0,36 (khung 2); ★ ở 0,45. |
| 20 | Phi tiêu | 6 | 0.38 | 84 · 87 · 57 · 57 · 49 · 46 | 3 | phi tiêu | ★ ở 0,45: phi tiêu rời tay (đạn sinh lúc chạm). |
| 21 | Phi tiêu ngắm | 3 | 0.45 | 150 · 150 · 150 | — | phi tiêu | Lặp khi giữ nút. |
| 22 | Phi tiêu chùm | 6 | 0.5 | 225 · 75 · 60 · 60 · 50 · 30 | 2 | phi tiêu | Thả nút vào từ u 0,45 → khung 2 (ném) hiện ngay. |
| 23 | Trảm nguyệt (chiêu kiếm) | 6 | 0.35 | 42 · 46 · 52 · 70 · 70 · 70 | 2 | kiếm | Hiệu ứng sinh ngay lúc bấm; ★ = khung chém ra (khung 2). |
| 24 | Phi thương (chiêu thương) | 6 | 0.35 | 42 · 46 · 52 · 70 · 70 · 70 | 2 | thương | Khung 3–6 giáo đã bay đi (game: neo null). ★ = khung phóng. |
| 25 | Địa chấn (chiêu búa) | 6 | 0.35 | 42 · 46 · 52 · 70 · 70 · 70 | 2 | búa | Hiệu ứng sinh ngay lúc bấm; ★ = khung nện đất. |
| 26 | Mưa phi tiêu (chiêu phi tiêu) | 6 | 0.35 | 42 · 46 · 52 · 70 · 70 · 70 | 2 | phi tiêu | Hiệu ứng sinh ngay lúc bấm; ★ = khung tung lên. |
| 27 | Đấm (tay không) | 5 | 0.3 | 66 · 69 · 60 · 51 · 54 | 3 | tay không | ★ ở 0,45. |

Ghi chú: đứng / đi / chạy trong game chạy chậm ×1,25 (đã tính vào thời gian từng khung trong JSON, GIF và trang xem). Đứng thở trong game phát qua lại 1-2-3-4-5-4-3-2; khung que đứng thở là nhịp thở hình sin nên phát kiểu nào cũng mượt.

## Thư mục `docs/khung-que-8-huong/`

| Tệp | Là gì |
|---|---|
| `xem.html` | trang xem trên điện thoại (tự chứa, không cần mạng) |
| `prompt/00-khung-chuan.md` | prompt bước 0: khung chuẩn 5 hướng |
| `prompt/<động-tác>.md` | prompt A (cả hàng) + B (sửa khung trước) cho 5 hướng, kèm tên ảnh phải gửi |
| `anh/<động-tác>/<hướng>.png` | khung que cả hàng, có số khung và ★ |
| `anh/<động-tác>/<hướng>-sach.png` | như trên nhưng không số — **ảnh gửi kèm khi gen** |
| `anh/<động-tác>/<hướng>/kN.png` | từng khung riêng — gửi kèm khi sửa khung N |
| `gif/<động-tác>/<hướng>.gif` | ảnh động xem thử |
| `khop/<động-tác>/<hướng>.json` | toạ độ mọi khớp từng khung ([x, y, độ gần camera]), thời gian từng khung, khung chạm, tay nào trước/sau thân |
| `la-ban-dung.png/.gif`, `la-ban-chay.png/.gif` | tấm tổng 8 hướng xếp vòng la bàn |
| `mau/cu-ti-mau.png`, `mau/cu-ti-dung-e-k1.png` | ảnh mẫu Cu Tí (bản mới) để gửi kèm |
| `bang-kiem.md` / `.json` | bảng tự kiểm |
| `cong-cu/` | công cụ Python dựng lại tất cả: `python3 cong-cu/lam.py` (sửa tư thế trong `cong-cu/dong_tac.py`) |

## Còn hạn chế (nói rõ)

- Tư thế khung que do tôi dựng theo ý nghĩa từng động tác và bảng mốc của game, **không đo lại từ ảnh hiện có**, nên hướng E mới sẽ hơi khác dáng ảnh E đang dùng (vì vậy khuyên gen lại cả 5 hướng cho đồng bộ).
- Khung que không có tóc, áo, đai — AI lấy chi tiết từ ảnh mẫu; khung que chỉ quyết định **dáng và tay nào trước/sau**.
- Hai tay cầm thương/búa chỉ đặt gần nhau, không khoá chính xác lên cán (game tự vẽ cán vũ khí và nắm tay đè lên).
- Hướng N (quay lưng): tay vươn ra trước bị thân và đầu to che gần hết — đúng thực tế, AI chỉ cần vẽ vai/khuỷu ló ra.
- Đưa ảnh 8 hướng vào game (chọn hướng theo góc nhắm/di chuyển, tấm sprite mới, neo vũ khí cho từng hướng) là **việc code riêng**, chưa làm ở đợt này.
