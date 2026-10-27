# Trang trí địa hình đợt 4 – rễ neo cột, xà móc dây, mảng gỗ vân, mép đá rêu, cổng rễ cây (27/10/2026)

Viết cho người không rành kỹ thuật. Đợt này sửa đúng những chỗ "còn chưa đẹp" ghi ở mục 6 của `game/kiem-thu-trang-tri/GHI-CHU.md`,
bằng 5 ảnh gen mới trong `art/the-gioi-moi/nguon-v4/`. **Đã ghép thẳng vào `game/demo.html`.** Collider, vị trí sàn, độ cao nhảy, tỷ lệ Lam,
quái / boss, hiệu ứng, Làng Chuông v2 và các trang trí đợt trước giữ nguyên 100 % – đợt này chỉ đổi HÌNH.

**Chơi thử:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/demo.html
(thêm `?tt=0` để xem bản KHÔNG trang trí – lúc đó cổng cũng quay về cổng gỗ cũ; phím **H** hoặc nút ▣: bật overlay collider;
`?vao=quai` / `?vao=boss`: vào thẳng Sân chuông / phòng boss). Bản kiểm thử có bot quay video: `game/kiem-thu-trang-tri-v4/kiem-thu.html`.
**Chưa thử trên iPhone thật** – mọi số đo là Chromium headless trên máy chủ Linux (không GPU); link githack chưa mở thử được từ máy chủ này.

## 1. Xem gì trước (thư mục `xem-thu/`)

| File | Nội dung |
|---|---|
| `ghep-truoc-sau.png` | **7 góc, mỗi hàng TRƯỚC \| SAU cạnh nhau**, cùng camera / cùng trạng thái (1920×3780) |
| `truoc-<góc>.png` | TRƯỚC = `?tt=0` (gạch cũ, cổng gỗ cũ, không trang trí), 960×540 |
| `sau-<góc>.png` | SAU, cùng camera |
| `sau-<góc>-collider.png` | SAU + overlay collider: ô chặn (vàng = gỗ, xanh nhạt = đá), cạnh lộ = nét cam, bệ một chiều = vạch lục, **cổng đóng = vàng đứt**, hitbox Lam / quái |
| `lam-mo-cong-re-san-chuong-60fps.mp4` | 9,9 s, 60 hình/giây (mỗi hình = 1 bước game): nhảy lên bệ ván treo (dây móc vào xà), Tiếng Vọng giữ công tắc → **cổng rễ mở** (rễ co rút về 2 trụ, mắt ngọc sáng) → qua cổng → Sân chuông (khối đá mép rêu, ván treo 2 ô + xà, cổng rễ cuối sân; **đã bỏ quái** để bot không phải đánh) |
| `iphone-844x390.png` | màn Bắt đầu ở iPhone ngang 844×390 (nút Bắt đầu nằm trong màn, tap được) |
| `so-do.json` | lỗi console / lỗi trang / tải hỏng (đều 0 ở bản kiểm thử, demo.html, bản build file://), số đo nạp, kiểm iPhone |

Góc chụp: `cot-neo-re` (camera x 192: cột treo có rễ neo) · `be-van-xa` (x 1152: bệ ván treo + xà, cổng đóng) · `cong-re-dong` /
`cong-re-dang-mo` (40 %) / `cong-re-mo` (x 1152, Lam đứng trước cổng) · `khoi-da-mep-reu` (x 2368: khối đá, ván treo 2 ô + xà, cổng cuối sân) ·
`mang-go-van` (x 0: mảng gỗ vân, chỗ ngắt rêu x 332). **Dòng gợi ý ở mép trên màn được ẩn** trong mọi ảnh để thấy xà và rễ neo
(trong game dòng gợi ý vẫn hiện như cũ, lúc đó nó che một phần xà / rễ – chỉ là chữ, không phải lỗi).

## 2. Đã đặt gì (toạ độ thế giới, px logic; ô 32)

| Việc | Đã làm | Ghi chú an toàn |
|---|---|---|
| 1. **Rễ treo neo cột** (`re-treo-cot*`, 3 biến thể chọn theo seed) | Cột treo lơ lửng Cổng làng (x 768..800, y 96..288): rễ bám đầu cột (ngón ôm phủ xuống ~38 px), thân rễ toả lên **quá mép trên màn** (đỉnh y ≈ −9). Cột gỗ trong ảnh gen **đã bỏ** (cắt bằng flood-fill) → chỉ còn rễ, cột của game lộ ra giữa các ngón | Rộng ≈ 180 (x 694..874), không chạm khối tường x 896. Không có mặt phẳng nào ngoài collider; mặt cột (y 96) vẫn là mặt đứng thật, Lam đứng lên thì Lam vẽ đè lên rễ |
| 2. **Xà móc dây** (`xa-day-3` 173×75, `xa-day-2` 126×66) | Cổng làng: xà trên bệ ván treo 3 ô (dây cách 74); Sân chuông: xà trên ván 2 ô (dây cách 42). Xà bám **mép trên màn** (y ≈ 3..78 / 4..70); dây của ván chỉ xếp lên tới nút buộc dưới của xà rồi xà vẽ đè lên (dây rủ của xà đã cắt ngay dưới nút, mờ dần 14 px) | Khoảng giữa 2 vòng dây được **kéo dài bằng code** (chèn dải vỏ cành, hoà trộn chéo) để 2 dây xà cách ĐÚNG 2 dây ván. Lam không với tới xà (bệ 352 / 320, nhảy 112) → không phải mặt đứng giả. Trên cảm ứng (camera lệch 28) chỉ thấy nửa dưới xà |
| 3. **Mảng gỗ có vân** (`mang-go-van*`, 6 mảng 112×108) | Thay mảng gỗ trơ ở **cả 23 chỗ** (12 Cổng làng + 6 Sân chuông + 5 phòng boss), vị trí / cắt theo ô gỗ y như trước | Màu trung bình chỉnh về **99/70/51** = đúng mức mảng trơ đã tối 7 % đợt trước (ảnh gen gốc 115/78/53 → nhân 0,86 / 0,90 / 0,97 từng kênh) |
| 4. **Mép đá rêu** (`mep-da-1/2-trai/giua/phai`, 2 bộ theo seed) | Thay mép đất nâu trên **khối đá Sân chuông** (x 2560..2848, y 352): đầu trái / giữa lặp / đầu phải, cao 34 (phủ hàng gạch đá trên cùng) | Mặt rêu = mặt collider + 1 px, lá nhô tối đa 4 px (cắt). Bụi cỏ ở chân 2 đầu trong ảnh gen **đã bỏ** (nằm giữa mặt đứng khối thì vô lý). Rễ ôm 2 góc giờ vẽ TRƯỚC dải đá → đầu cắt phẳng nằm khuất dưới đá (hết lỗi "cắt phẳng" đợt trước). Khối đá khác có mặt lộ: không có → chỉ 1 chỗ |
| 5. **Cổng rễ cây** (`cong-re-*`) | Thay cổng gỗ ở **cả 4 cổng** (Cổng làng, Sân chuông, Câu đố chuông, cửa vào phòng boss – cùng một hàm vẽ). ĐÓNG = ảnh gen (rễ đan + 2 trụ, cắt 3 mảnh); **CHỈ TRỤ** = 2 trụ đơn (ảnh gen trụ #2, #4; đặt đúng tâm / đúng cỡ trụ bản đóng); **MỞ dựng bằng code**: rễ giữa tách đôi, mỗi nửa bóp ngang về trụ của nó + mờ dần (hết hẳn ở 70 % tiến độ mở; cổng đi xuyên được từ 60 % như cũ), trụ bản đóng mờ dần lộ trụ đơn bên dưới. **Mắt ngọc = đèn báo**: tối (phủ xám xanh) khi chưa đủ điều kiện, sáng dần theo số điều kiện xong (Sân chuông: 3 quái → 1/3, 2/3, 3/3), loé xanh ngọc + nhấp nhẹ khi cổng mở. Chấm tròn đỏ / xanh vẽ bằng code **đã bỏ** | Cao 162 (sàn 448 → 286, đáy tường 288 – rêu đỉnh nhô 3 px), thân 2 trụ rộng ≈ 173 nằm trong hộp chặn 183 (như cổng gỗ cũ 192, hộp 183); rễ chân loang ra sàn thêm ~17 px mỗi bên (chỉ hình). Hộp chặn / cách mở / âm thanh **không đổi** |

Thứ tự vẽ như trước: nền → [SAU: ván treo + dây + xà] → gạch → [THÂN: mảng gỗ vân] → mảng rễ rong-re → [MẶT: rễ ôm cột, mép đá, chân rễ,
rễ neo cột] → đồ vật (cổng rễ) → quái → Lam/boss → tiền cảnh → hiệu ứng → HUD. Cổng vẽ ở lớp đồ vật như cổng gỗ cũ.

## 3. Ghép vào game chính – đã làm

- `game/demo.html`: đổi JSON trang trí sang `art/the-gioi-moi/dia-hinh-v4/dia-hinh-v4.json` (gồm cả ô đợt v3 còn dùng: mép đất, chân rễ,
  ván treo / dây, tiền cảnh); `drawDoor` gọi `TT.veCong(...)` (cổng rễ) – khi `?tt=0` hoặc trang trí nạp lỗi thì **tự quay về cổng gỗ + chấm đèn cũ**.
  Ảnh vẫn nạp + giải mã **ở màn nạp** (trước nút Bắt đầu), số đo hiện trên màn Bắt đầu.
- `game/runtime/trang-tri-dia-hinh.js`: thêm `xa` / `xa_y` cho bệ ván treo, `kieu: 'da'` cho mép, `cong: true` (nạp 5 ô cổng), hàm `TT.veCong`.
- `game/runtime/trang-tri/{cong-lang,san-chuong,phong-boss}.js`: bảng toạ độ (sửa vị trí ở đây).
- `game/build-demo.py`: nhúng JSON v4 + 9 atlas đang dùng (họ `-kho` không nhúng). Atlas trang trí giờ nhúng **WebP không mất dữ liệu**
  (lossless, ≈ 65 % cỡ PNG) để bản build dưới 15 MB → `demo.build.html` **14,3 MB** (đợt trước 13,99), mở `file://` không lỗi.
- `game/demo-doi-chieu-v3.html`: **không đụng**. `game/kiem-thu-trang-tri/` (đợt trước) giữ nguyên, chỉ sửa 1 dòng đường dẫn JSON trong
  `cong-cu/tao-ban-thu.py` để script còn chạy được.

## 4. Bộ nhớ, nạp, kiểm

| | Số |
|---|---|
| Atlas game nạp | **9 ảnh, ≈ 1,7 MB tải** (PNG; bản build: WebP lossless ≈ 1,2 MB): v4 `re-treo-cot` 1080×292, `xa-moc-day` 604×152, `mang-go-van` 1024×440, `mep-da-reu` 1004×72, `cong-re` 776×324 + v3 `mep-dat-re`, `chan-re-goc`, `be-neo`, `tien-canh-re-da` (thu ½). Mảng gỗ trơ v3 `mang-go-lon` không nạp nữa |
| Bộ nhớ ảnh giải mã | **≈ 6,44 MB** (atlas) + 4,24 MB canvas nướng sẵn 23 mảng gỗ = **≈ 10,7 MB** (đợt trước 7,9 → **thêm ≈ 2,8 MB**, chủ yếu rễ neo cột 1,26 MB + cổng rễ 1 MB) |
| Nạp + decode | 125–170 ms (localhost / file://) – đợt trước 65–90 |
| Vẽ mỗi khung | thêm ≈ 1 `drawImage` (xà) ở màn có ván treo; cổng: 3–5 `drawImage` + 2 hình tròn (mắt) thay 3 `drawImage` + chấm tròn cũ; lúc cổng đang mở thêm 2 ảnh trụ (0,23 s). **Phải đo lại trên iPhone** |
| Lỗi console / trang / tải hỏng | 0 / 0 / 0 ở bản kiểm thử (3 lượt), demo.html qua http, demo.build.html qua file:// |
| iPhone ngang 844×390 (giả lập) | màn Bắt đầu: nút Bắt đầu ở (362, 266) 119×46, nằm trong màn, **tap được** → vào game |
| Ảnh kiểm viền | `art/the-gioi-moi/dia-hinh-v4/xem-thu/kiem-vien-<họ>-hong.png` / `-den.png` (mọi mảnh đúng cỡ 2x trên nền hồng / đen, có dấu neo) |

## 5. Còn chưa đẹp / cần quyết

1. **Xà 3 ô** (Cổng làng): đoạn cành chèn thêm giữa 2 vòng dây (để đúng khoảng cách dây 74) có vân chéo lặp hơi đều – nhìn ở cỡ lớn thấy
   "gợn sóng"; ở cỡ game 960×540 chấp nhận được. Muốn đẹp hơn cần gen xà có 2 vòng dây cách xa nhau sẵn (≈ 2,3 lần bề dày cành).
2. **Xà** nằm sát mép trên màn, dòng gợi ý (chữ) che một phần khi hiện; trên cảm ứng chỉ thấy nửa dưới. Ở Sân chuông đèn lồng trang trí
   cũ (x 2976) treo ngay cạnh dây phải – hơi chen (đèn giữ nguyên vị trí như yêu cầu).
3. **Rễ neo cột**: tiền cảnh rễ treo Làng Chuông v2 (bóng tối, vẽ trước mặt) đè lên phần trên bên phải của rễ neo ở gần mọi vị trí camera
   (vì cả hai cùng trôi theo camera) – đọc là rễ tối ở gần hơn, không che chỗ bám cột. Vài ngón ôm còn vụn nét đen nhỏ (chỗ cắt bỏ cột gen).
4. **Cổng rễ**: ép ảnh gen 0,63 ngang / 0,56 dọc (lệch 11 %) để vừa đúng hộp chặn → mắt ngọc hơi bầu dục. Lúc đang mở (0,23 s) trụ bản
   đóng mờ dần đè lên trụ đơn → thoáng "bóng ma" 2 trụ chồng nhau; mở hẳn thì sạch. Cửa vào phòng boss (luôn mở) giờ là 2 trụ rễ
   thay 2 cột gỗ – trụ trái nằm ngoài mép phòng 40 px như cổng cũ.
5. **Mép đá rêu**: đá gen xám hơi xanh, gạch đá của game xám xanh đậm hơn một chút → thấy ranh giới mờ ở đáy dải (y 386). Có thể cho tôi
   duyệt bản nhuộm dải đá tối thêm 5 % nếu muốn liền hơn.
6. **Mảng gỗ vân**: vân gen chạy chéo / dọc, vân thân gạch là rãnh xoắn → vẫn nhận ra mảng khi nhìn kỹ, nhưng chìm hơn mảng trơ rõ rệt.
7. Video bỏ quái Sân chuông (bot không đánh nhau) – xem quái + mắt ngọc sáng dần 1/3 → 3/3 thì mở `?vao=quai` chơi tay.

## 6. File và cách chạy lại

```
art/the-gioi-moi/dia-hinh-v4/code/tach.py       tách 5 ảnh gen v4 → atlas + dia-hinh-v4.json + ảnh kiểm viền    python3 -B …/tach.py  (~15 s)
art/the-gioi-moi/dia-hinh-v4/                   atlas 2x đang dùng + họ -kho (trụ đơn #3 #5, 3 xà gốc – game không nạp)
game/runtime/trang-tri-dia-hinh.js              module TT (thêm xà, mép đá, TT.veCong)
game/runtime/trang-tri/{cong-lang,san-chuong,phong-boss}.js   dữ liệu đặt mảnh từng màn
game/demo.html                                  game chính đã ghép (?tt=0 tắt trang trí + về cổng gỗ cũ)
game/build-demo.py                              → demo.build.html (tự chứa, file://)          python3 game/build-demo.py
game/kiem-thu-trang-tri-v4/kiem-thu.html        bản kiểm thử (SINH RA, đừng sửa tay)         python3 game/kiem-thu-trang-tri-v4/cong-cu/tao-ban-thu.py
  cong-cu/khoi-thu.js                           khối THỬ: ?vao=cong2, ?quai=0, ?ghi=1, bot, API TVTHU (+ TVTHU.cong(o) đặt tiến độ mở cổng)
  cong-cu/chup.py                               ảnh TRƯỚC/SAU/collider 7 góc + ghép + so-do.json + kiểm file:// + iPhone   python3 -B …/chup.py
  cong-cu/quay-video.py                         video 60 fps mở cổng rễ + Sân chuông (thêm "collider" để quay bản bật overlay)
  xem-thu/                                      ảnh duyệt, video, so-do.json
```
Không có kiểm thử tự động: `chup.py` / `quay-video.py` chỉ chụp, quay và ghi số đo cho người duyệt xem.
