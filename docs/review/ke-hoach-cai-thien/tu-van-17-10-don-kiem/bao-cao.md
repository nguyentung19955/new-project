# Đòn kiếm nặng của Cu Tí — làm theo tư vấn ChatGPT 17/10 (mục 3, việc 1)

**Chờ trước:** phiên "Thử độ nét cao hơn cho Cu Tí" xong lúc 08:13 (có `net-cao/bao-cao.md`) → chờ ~27 phút (không quá 150 phút), làm TRÊN nền phiên đó.

## Tóm tắt cho chủ game

Combo kiếm nặng 3 nhát của Cu Tí giờ "có lực" hơn, **không đổi cân bằng**:

| Việc | Trước | Sau | Cờ tắt (thêm vào cuối địa chỉ game) |
|---|---|---|---|
| 1. Dừng hình khi trúng | nhát 1: 50 ms · nhát 2: **33 ms** (bị cắt) · nhát 3: 83 ms | nhát 1: **50 ms** · nhát 2: **50 ms** · nhát kết: **100 ms** | `?kndung=0` |
| 2. Rung màn khi nhát kết trúng | tới 3,5–4 điểm ảnh, kéo 200 ms | **tối đa 2 điểm ảnh, ~70 ms** (4 hình), tắt dần | `?knrung=0` (người chơi: nút **Rung màn** ở Anh Mõ) |
| 3. Tiếng va chạm | một tiếng "kiếm" chung cho cả 3 nhát | mỗi nhát một tiếng riêng, **nhát kết nặng nhất** | `?knam=0` |
| 4. Nhịp từng nhát | xem dưới | lê kiếm 5 hình · giữ thế 3 hình trước nhát bổ · theo đà 6 hình rồi thu kiếm | `?knnhip=0` |
| 5. Nhát 1 kiếm "dịch chuyển" từ sau ra trước | mũi nhảy ~50 điểm ảnh trong 1 hình | mũi **trượt liền trên mặt đất** qua dưới chân trong 3 hình | `?knmuot=0` |
| 6. Nhát 3 lúc đang chạy | đổi thế đứng tấn đột ngột | **ghìm lại** 4 hình: ngả ra sau, hạ người, trượt nhẹ, bụi sau gót (ảnh có sẵn) | `?knghim=0` |

Mặc định **BẬT cả 6**. Tắt hết 6 cờ = y như trước phiên này (đã so bằng bot: số dừng hình, rung, nhịp đồng hồ đòn trùng bản cũ).
Chỉ áp cho **Cu Tí cầm kiếm có hàng kiếm nặng** (bộ Ninja). Bộ khác, `?kiemnang=0`, vũ khí khác: như cũ.

**Cân bằng không đổi:** không sửa dòng nào trong `moves.js` / `combat.js`. Thời lượng mỗi nhát (0,3 / 0,3 / 0,46 giây), lúc chạm (u = 0,45), vùng trúng, sát thương giữ nguyên. Bot đếm nhịp đồng hồ đòn (không tính lúc dừng hình): **19 / 19 / 28 nhịp, trước và sau như nhau.**

## 1. Dừng hình (hit-stop) — số thật

**Sửa câu nhầm:** báo cáo `kiem-bot-cung/bao-cao.md` ghi "game chưa có hit-stop" — **sai**. Game ĐÃ có dừng hình theo vũ khí từ 16/10 (`js/fx.js` `khungVk`): kiếm 45 / nhát kết 70 ms, thương 55 / 65, búa 90 / 110, phi tiêu 25 / 35 (chí mạng +25, kết liễu +15). Đã sửa câu đó trong báo cáo cũ (và chú thích trong `zed_moi.js`).

Đo bằng bot (quái bù nhìn trước mặt, 60 hình/giây), **bản cũ**: nhát 1 = 3 hình (50 ms), **nhát 2 chỉ 2 hình (33 ms)** — vì luật "lần dừng thứ hai trong 0,5 giây chỉ còn 60 %" cắt bớt; nhát kết 70 ms → 5 hình (83 ms).

**Bản mới (`?kndung=0` tắt):** nhát 1, 2 đặt 48 ms → đúng **3 hình = 50 ms**; nhát kết 95 ms → **6 hình = 100 ms**. Đòn kiếm nặng không bị luật 60 % cắt nữa. Chí mạng / kết liễu cộng như cũ (tối đa 115 / 100 ms).

**Dừng hình có làm chậm đòn không? (cần chủ game biết)**
- Dừng hình của game là **đứng cả thế giới** (Cu Tí, quái, đạn đều đứng). Đồng hồ đòn cũng đứng → thời lượng đòn tính theo giờ game **không đổi**. Nhưng theo giờ thật, cả combo dài thêm 0 + 17 + 17 ms ≈ **+33 ms** (khoảng 3 %), quái cũng đứng y vậy nên không ai lợi.
- Game có sẵn cơ chế "trả lại khung" (`?bukhung=0` tắt): phần dừng **dài hơn số cũ** được trả lại bằng cách cho đồng hồ đòn chạy nhanh hơn chút ngay sau đó (để sát thương mỗi giây theo giờ thật không tụt). Cơ chế này **có đổi** thời lượng đòn theo giờ game. Với kiếm, phần trả lại vốn = 0 (số mới thấp hơn số cũ). Phiên này **giữ phần trả lại = 0** cho đòn kiếm nặng, để thời lượng logic đúng y như cũ.
- **Hỏi chủ game:** có muốn trả lại ~33 ms giờ thật này (cho combo đúng nhịp giờ thật như cũ, nhưng đồng hồ đòn sẽ chạy nhanh hơn một chút sau mỗi lần dừng) không? Mặc định: không trả.

## 2. Rung khung hình khi nhát kết trúng

- Trước: nhát kết trúng = rung ~0,75 điểm ảnh + cú giật 2,5 điểm ảnh → đo được tới **3,5–4 điểm ảnh**, kéo **200 ms**.
- Sau (`?knrung=0` tắt): rung riêng, **tối đa 2 điểm ảnh game**, **70 ms** (bot đo: 4 hình ≈ 67 ms, lớn nhất 2,0), tắt dần theo hướng chém. Nhát 1, 2 giữ rung nhẹ cũ (≤ 1,5 điểm ảnh).
- **Tắt rung trong cài đặt:** game ĐÃ có nút **"Rung màn: bật / tắt"** ở **Anh Mõ › Âm thanh** (mặc định bật). Nút này tắt luôn rung mới → không thêm nút trùng.

## 3. Âm va chạm riêng từng nhát

Tạo bằng WebAudio trong code (`js/engine.js`, không thêm tệp âm thanh), theo âm lượng "Tiếng" và luật giới hạn tiếng cùng lúc sẵn có:
- **Nhát 1 (hất lên):** tiếng kim loại rít lên ngắn + tiếng xẹt.
- **Nhát 2 (bổ xuống):** tiếng chặt trầm + tiếng đất bục.
- **Nhát kết:** **nặng nhất** — tiếng "ùng" trầm dài 0,26 giây + lớp chặt + tiếng rè dài hơn, to nhất.
- Chí mạng vẫn thêm lớp cao như cũ. `?knam=0` → tiếng kiếm chung như cũ.
- Chưa nghe thử được trên máy thật (máy chủ không có loa) — **cần chủ game nghe trên điện thoại**.

## 4. Nhịp từng nhát (chỉ chia lại khung hình trong thời lượng cũ, ★ vẫn đúng u = 0,45)

Đo bằng bot, 60 hình/giây:

| | Trước | Sau (`?knnhip=0` tắt) |
|---|---|---|
| Nhát 1 (18 hình) | lê kiếm sau lưng 6 hình, rồi mũi nhảy ra trước | **lê kiếm 5 hình**, quét qua dưới chân 3 hình, ★ hất lên |
| Nhát 2 (18 hình) | giơ kiếm lên 5 hình, giữ 1 hình, bổ | giơ lên nhanh (3 hình), **giữ thế giơ cao 3 hình ngay trước va chạm**, bổ trong 2 hình |
| Nhát 3 (28 hình) | ★ khung 9 hiện 7 hình, theo đà kéo dài ~13 hình, không thu | ★ khung 9 hiện 3 hình, **theo đà 6 hình**, rồi **thu kiếm** về vai (~9 hình) |

Vệt chém ngang nhát 3 đổi điểm cuối từ u 0,6 → 0,5 (lúc kiếm hết tầm ngang), để vệt vẫn nằm ngang (sau 0,5 kiếm đã theo đà vòng lên).

## 5. Nhát 1: kiếm "dịch chuyển" từ sau ra trước

- Lý do cũ: lưỡi kiếm không được xuyên đất, nên khi quét từ sau lưng ra trước (đi qua dưới chân) mũi bị chặn ở sau, rồi bật ra trước trong 1 hình (mũi nhảy từ −27 tới +29 điểm ảnh).
- Cách sửa (`?knmuot=0` tắt): lúc kiếm đi qua dải "xuyên đất", mũi **trượt trên vạch đất** từ sau → ngay dưới tay → trước, **lưỡi vẽ ngắn lại** theo phối cảnh (như đang quét chéo trước bụng, nhìn hơi từ bên). Chỉ co ảnh kiếm có sẵn — không vẽ hiệu ứng bằng code. Tia lửa ảnh `hu-chem-kiem-nang-1` bám theo mũi như cũ.
- Bot đo mũi kiếm (điểm ảnh so với chân, cấp 1): trước `−27, −27, +29, +28` · sau `−27, −20, +11, +29` — liền, luôn trên mặt đất.
- Ảnh soát: `nhat1-qua-chan.png` (trên: trước, dưới: sau; 6 hình liên tiếp).
- Nếu chủ game muốn đẹp hơn nữa: gen thêm 1 khung giữa (prompt tiếng Anh, dán kèm khung 2–3 của tấm kiếm nặng):

> Pixel art sprite, same character and style as reference (Cu Ti, black ninja gi, red belt), side view facing right, green #00FF00 background, 1 frame, EMPTY HANDS. In-between pose of a two-handed low sweep: both fists together low in front of the belly, arms angled down, as if a long greatsword is passing diagonally under the body from back to front; knees bent, torso leaning forward. Do not change proportions, outline or colors.

## 6. Nhát 3 khi đang chạy: "ghìm lại"

- `moves.js` vẫn cho nhát kết là đòn đứng tấn (không đổi). Trước: chạy đang bước thì thân đổi ngay sang thế đứng tấn.
- Sau (`?knghim=0` tắt): nếu nhát 3 bắt đầu lúc **đang chạy**, 4 hình đầu thân **ngả ra sau 6°**, thân trên **hạ 1,5 điểm ảnh**, người **trượt tới ~2 điểm ảnh** theo đà rồi về chỗ (hết ở u 0,3) + **bụi chân** ảnh `hu-lao-bui` (ảnh bụi lao có sẵn) sau gót. Chỉ hình — vị trí thật, vùng trúng không đổi.

## Ảnh / GIF (thư mục này)

- `combo-truoc-sau-x1.gif` — **đúng thời lượng** (50 hình/giây, có cả dừng hình + rung thật): trái TRƯỚC (tắt 6 cờ), phải SAU. Phần đầu: đứng chém combo; phần sau: **chạy + chém** cả combo. Quái bù nhìn trước mặt (bot giữ đứng yên).
- `combo-truoc-sau-x3.gif` — như trên, chậm 3 lần.
- `nhat1-qua-chan.png` — nhát 1 lúc kiếm quét qua dưới chân, trước / sau.
- Công cụ (chạy từ thư mục `game` sau khi build): `do_dung.py` (đo dừng hình, rung, nhịp đồng hồ đòn), `do_goc.py` (góc + mũi kiếm từng hình, `--chay` để chạy + chém), `quay_gif.py` (GIF).

## Kiểm

| Bài | Kết quả |
|---|---|
| `node --check` mọi `game/js/*.js` | Đạt |
| `python3 game/build.py` / `--hai-tep` | Đạt — một tệp **29,87 MB** / 30; người chơi tải **17,75 MB** / 20 (không thêm ảnh) |
| Nạp `dist/linh-khi.html?cloud=0` headless (bot, không chơi tay), đứng chém + chạy chém: mặc định, tắt từng cờ (`kndung`, `knrung`, `knam`, `knnhip`, `knmuot`, `knghim`), tắt cả 6, `?kiemnang=0` | **0 lỗi JS**, 0 lỗi vẽ (`G.zedMoi.loi` rỗng) |
| `game/tests/smoke.py` | 0 lỗi |
| `cam_giac_vk.test.js` / `cam_giac_danh.test.js` | đạt 24 / đạt 15 |
| Nhịp đồng hồ đòn (bot) | 19 / 19 / 28 — trước = sau |

Không đụng đăng nhập Google / lưu mây / `?cloud=0`. Không sửa `moves.js` / `combat.js`.

## Cần chủ game xem trên điện thoại

1. Cảm giác nhát kết 100 ms + rung 2 điểm ảnh có đủ "nặng" chưa (GIF không thay được ngón tay + loa).
2. Ba tiếng va chạm mới (loa điện thoại nhỏ: tiếng "ùng" trầm của nhát kết có thể nghe nhỏ hơn trên tai nghe).
3. Câu hỏi ở mục 1: có trả lại ~33 ms giờ thật mỗi combo không.
4. Nhát 1: lưỡi ngắn lại lúc qua dưới chân (3 hình) có ổn không, hay muốn gen khung giữa (prompt ở mục 5).
