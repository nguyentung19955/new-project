# Làng hoàn thiện – ghép ảnh gen mới vào demo.html (27/10/2026)

Viết cho người không rành kỹ thuật. Đợt này ghép **các ảnh gen mới** (điểm lưu, đèn lồng, rễ trần, chuông lớn, đồ làng, HUD, nút cảm ứng,
tranh màn bắt đầu / kết, NPC + chân dung) **thẳng vào `game/demo.html`**. Lam, hiệu ứng, quái / boss, Làng Chuông, trang trí địa hình
+ cổng rễ đợt v4 giữ nguyên. **Không đổi gameplay, bản đồ, collider**: mọi thứ mới chỉ là HÌNH (không có ô chặn nào mới); hộp thoại NPC
không dừng game.

**Chơi thử:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/demo.html
(`?vao=quai` vào thẳng Sân chuông – gặp NPC ngay; `?vao=boss` vào phòng boss; phím **H** / nút ▣ bật collider). Ảnh mới nạp lỗi → game
tự quay về hình / nút cũ và báo một dòng nhỏ. **Chưa thử trên iPhone thật** – mọi số đo là Chromium headless trên máy chủ Linux.

## 1. Xem gì trước (thư mục `xem-thu/`)

| File | Nội dung |
|---|---|
| `ghep-truoc-sau.png` | **12 cảnh, mỗi hàng TRƯỚC \| SAU** cùng camera, cùng trạng thái |
| `truoc-<cảnh>.png` / `sau-<cảnh>.png` | TRƯỚC = demo.html ở commit trước đợt này (ad1605e); SAU = bây giờ. 960×540, riêng `iphone-hud-nut` là 844×390 |
| `bat-dau-noi-chuyen-cong-huong-60fps.mp4` | 17 s, 60 hình/giây (1 hình = 1 bước game): màn Bắt đầu → Sân chuông, nói chuyện **Trưởng làng** (4 câu) và **Thợ Rèn Hòn** (búa gõ) → Vọng – chém – Vọng, chém cùng bóng vào quái gác → **Cộng hưởng → chuông lớn rung** (video chỉ giữ quái gác cổng để bot không phải đánh 2 con kia) |
| `iphone-844x390-man-bat-dau.png`, `iphone-844x390-vao-game.png` | iPhone ngang 844×390 (giả lập cảm ứng): màn Bắt đầu và sau khi chạm Bắt đầu |
| `so-do.json` | lỗi console / lỗi trang / tải hỏng, số đo nạp, kiểm iPhone |

Cảnh: `man-bat-dau`, `iphone-hud-nut` (đang ghi Vọng, đứng cạnh NPC → hiện nút "Nói chuyện"), `san-chuong` (chuông lớn, 2 NPC, quầy hàng,
điểm lưu – bỏ quái cho dễ nhìn), `san-chuong-noi-chuyen` (hộp thoại), `san-chuong-cong-huong` (chuông lớn đang rung), `diem-luu-tat` /
`diem-luu-sang`, `cong-lang-do-lang` (bảng nhiệm vụ + đèn treo thêm), `cong-lang-bien` (biển chỉ đường), `phong-boss-re-tran`,
`phong-boss-treo` (boss treo trần – chỗ treo dùng dải đá trơn), `man-ket`. Dòng gợi ý ở mép trên được ẩn ở ảnh cảnh vật.

## 2. Đã ghép gì

| Việc | Đã làm | Ghi chú |
|---|---|---|
| 1. **Điểm lưu** (`diem-luu.png`) | Thay hình cũ ở cả 3 chỗ lưu (Cổng làng, Sân chuông, Điểm lưu). Khung vòm rễ ≈ 206×146, **chuông tách rời** treo dưới vòm: tắt = chuông đồng xỉn; **sáng (đã lưu) = chuông vàng + quầng ngọc + quầng vàng**; lúc vừa lưu chuông **lắc** quanh vòng treo rồi dừng, bình thường đung đưa rất nhẹ | Vị trí, vùng chạm lưu (±40 px), hồi máu, âm thanh giữ nguyên. Quầng ngọc trong ảnh gen dính rêu + nhuộm cả nét viền, cắt không sạch → **vẽ quầng bằng code**; chuông sáng = đúng hình chuông bản tắt, lấy màu từ chuông bản sáng |
| 2. **Đèn lồng** (`den-long.png`) | 3 kiểu (tròn / lồng vuông / chuông) chọn theo seed cố định, giữ 11 vị trí cũ; **đèn Phòng boss TẮT cho tới khi thắng boss thì sáng**. Thêm 5 đèn theo seed: 2 đèn lớp sau (Cổng làng 2, cuối Sân chuông), 3 đèn **lớp trước** treo sát mép trên (đáy đèn y ≤ 84, chỗ không có bệ cao → không bao giờ che Lam / quái) | Bỏ móc tường của ảnh gen; dây vẫn vẽ từ mép trên màn như cũ |
| 3. **Rễ trần** (`re-tran.png`) | Phòng boss: dải đá gen phủ đúng hàng ô trần dưới (y 32..64) – đầu trái / giữa / đầu phải, rễ + rêu rủ **≤ 56 px dưới trần** (đáy ≈ y 120, nửa trên màn). Chỗ boss treo (x 5824..6024) dùng **đoạn "giữa trơn"** (chỉ đá + rêu bám, cắt rễ) | Đá xếp ở 2 đầu (góc tường) nằm trong bề rộng tường đá → không nhô ra ngoài collider. Vẽ ở lớp địa hình (trước boss) → boss, xích, mảnh rơi luôn vẽ đè lên |
| 4. **Chuông lớn** (`chuong-lon.png`) | Sân chuông, giữa khối đá (x 2704), ≈ 285×287, vẽ **sau gạch** → khối đá che chân khung, chuông nhô lên trên khối; không collider. **Rung** khi có Cộng hưởng (2,5 s) và khi thắng boss (5,3 s): đổi qua lại 2 ảnh im / rung + quầng ngọc | Ảnh gen chỉ có 2 tư thế, chuông dính vào chân khung (vẽ đè lên chân) nên không tách ra lắc mượt được |
| 5. **Đồ làng** (`do-lang.png`) | Bảng nhiệm vụ (Cổng làng, x 240, cạnh chỗ bắt đầu), biển chỉ đường (Cổng làng 2, x 2016 – sau cổng, trước Sân chuông), quầy hàng mái vải (Sân chuông, sau lưng Thợ rèn) – trang trí nền đứng trên sàn, không collider | **Thang 3 đoạn: demo chưa có cơ chế thang → chưa đặt**, đã tách sẵn (`art/lang-hoan-thien/thang-kho.png`, họ "-kho", game không nạp) |
| 6a. **HUD** (`hud.png`) | Máu = 5 chuông đầy / rỗng; thanh Vọng có biểu tượng sóng **ngọc = sẵn sàng**, **xám xanh = đang ghi / bóng đang chạy**; **vòng Cộng hưởng ×n** hiện sau lần Cộng hưởng đầu, nháy to khi có Cộng hưởng mới | **Mảnh chuông (tiền): demo chưa có tiền → chưa hiện**, ảnh đã tách sẵn trong atlas HUD |
| 6b. **Nút cảm ứng** (`nut-cam-ung.png`) | Nhảy / Chém / Lướt / Vọng (ảnh thường, ảnh nhấn khi chạm), cần joystick = đế + núm. **Giữ đúng vị trí, cỡ, vùng chạm** (chỉ đổi hình nền của nút cũ); nút Vọng lúc đang ghi: ảnh nhấn + viền sáng ngọc; mũi tên trên đế giữ lại | Chữ trên nút bỏ (biểu tượng thay); núm to hơn chút (52 thay 40, chỉ hình). Mở `demo.html` trực tiếp bằng file:// (không phải bản build) thì trình duyệt chặn cắt ảnh → tự giữ nút cũ |
| 6c. **Màn bắt đầu / kết** | Tranh `man-bat-dau` / `man-ket` làm nền; tên game + nút **Bắt đầu** (nay nằm ngay dưới tên game) đặt ở phần trên tối | iPhone 844×390: nút Bắt đầu ở (362, 122) 119×46, trong màn, **chạm được** (cả demo.html qua http lẫn bản build file://) |
| 6d. **Vật phẩm** (`vat-pham.png`) | Mảnh chuông / bình máu giữ như cũ. **Mảnh Ký Ức, Âm Phù 3 màu, rương rễ: demo chưa có cơ chế → chưa đưa vào**, đã tách sẵn sprite 2x + JSON (`vat-pham-kho.png`, game không nạp) | |
| 7. **NPC** (`npc-lang.png`, `npc-lang-manh.png`, `chan-dung.png`) | **Thợ Rèn Hòn** (x 2448, trước quầy hàng) và **Trưởng làng** (x 2288, cạnh điểm lưu) ở Sân chuông, cao ≈ 108 (Lam 112). Rig từ mảnh rời: thở, gật đầu theo nhịp seed + khi nói, tay cầm búa / gậy nhích; Thợ rèn **gõ búa** (kèm tiếng "keng" nhỏ) khi "nói". NPC quay mặt về phía Lam. Lam đứng gần (≤ 80 px) → bong bóng "…" trên đầu NPC + nút **"💬 Nói chuyện"** (bàn phím: **F** hoặc **Enter**). Hộp thoại ở trên giữa màn: chân dung + tên + câu; chạm hộp / **Tiếp** / F = câu sau, **✕** / Esc = đóng, đi xa > 150 px tự đóng. **Game không dừng** khi nói | Câu thoại theo `docs/gdd.md`: Trưởng làng kể chuông làng nứt, Sự Lặng bò lên, nhờ Lam làm Chuông Gác Làng im lặng; Thợ Rèn Hòn câm, "nói" bằng nhịp búa → gợi ý chém cùng bóng (Cộng hưởng). Mỗi NPC 3 câu + 1 phản ứng của Lam (Lam câm – chỉ là hành động). Chân dung Lam **đã cắt chóp mũ** (bo tròn đỉnh mũ, kẻ lại nét viền) cho khớp Lam trong game |

Tách nền: mọi ảnh nền trắng đều flood-fill từ mép + lỗ trắng kín có viền mực, khử viền trắng (alpha theo độ pha trắng), xuất **2x**;
ảnh kiểm viền nền hồng / đen (có dấu neo) ở `art/lang-hoan-thien/xem-thu/kiem-vien-<họ>-hong.png` / `-den.png`. Tranh 2 màn (không có nền
trắng) giữ cỡ gốc 1672×941 (phóng lên 1920×1080 không thêm chi tiết mà tốn thêm bộ nhớ). Mọi biến thể chọn bằng seed cố định (không
ngẫu nhiên mỗi khung). Mọi thứ gắn địa hình dùng cùng hệ toạ độ camera với collider.

Thứ tự vẽ: nền → đèn lớp sau → **chuông lớn + đồ làng** → gạch + trang trí địa hình → **rễ trần** → **điểm lưu** → công tắc → cổng →
**NPC** → boss → quái → Lam → tiền cảnh → **đèn lớp trước** → hiệu ứng → **HUD**.

## 3. Bộ nhớ, nạp, kiểm

| | Số |
|---|---|
| Ảnh mới game nạp | 9 atlas (2x) + 2 tranh, **≈ 3,2 MB tải** (PNG + JPEG); bản build nhúng WebP q90 + tranh WebP q84 |
| Bộ nhớ ảnh giải mã thêm | **≈ 23,5 MB**: atlas ≈ 11,4 MB (nút cảm ứng 3,4 · chuông lớn 2,4 · rễ trần 1,5 · điểm lưu 1,1 · đồ làng 1,0 · chân dung 0,9 · NPC 0,6 · đèn 0,4 · HUD 0,2) + **2 tranh màn hình 12 MB** + ≈ 2 MB ảnh nút / chân dung cắt ra cho giao diện DOM. Đợt trước cả game ≈ 10,7 MB trang trí + Lam / quái / Làng Chuông – **tăng khá nhiều, phải đo trên iPhone** |
| Nạp + giải mã ảnh mới | 145–220 ms (localhost, ở màn nạp, trước nút Bắt đầu; số đo hiện ở màn Bắt đầu) |
| Vẽ mỗi khung | thêm vài `drawImage`: Sân chuông ≈ 15 (chuông lớn, 2 NPC × 6 mảnh, quầy), Phòng boss 5 (rễ trần), HUD 7–8 thay các ô pixel cũ |
| Lỗi console / trang / tải hỏng | **0 / 0 / 0**: 24 lần chụp (trước + sau), demo.html qua http, demo.build.html qua file:// (vào game được, nút ảnh gen bật) |
| Bản build `demo.build.html` | **15,45 MB** (đợt trước 14,3) – vượt mốc 15 MB tự đặt dù đã nén WebP (lossless thì 17,4 MB) |

## 4. Còn chưa đẹp / cần quyết

1. **NPC rig**: mảnh rời được gen với tỉ lệ khác ảnh ghép (thân thợ rèn dài, gậy trưởng làng ngắn hơn) → ghép theo mắt; thợ rèn hơi lùn,
   đầu to; gậy trưởng làng chỉ cao tới vai. Chưa có tư thế nói riêng, chỉ gật + gõ búa.
2. **NPC đứng giữa đường tuần của quái Chuông Gỗ đầu sân** (cả Sân chuông là chỗ đánh nhau, không có khoảng trống) → lúc mới vào, quái
   đi đè lên NPC (vẽ trước NPC). Có thể dời NPC sang Cổng làng 2 (sau cổng, yên tĩnh) nếu bạn muốn.
3. **Chuông lớn rung** = đổi qua lại 2 ảnh im / rung (7,5 lần/giây) → hơi giật, không lắc mượt. Muốn mượt cần gen chuông và khung tách rời.
4. **Điểm lưu sáng**: quầng ngọc là code (vòng sáng mềm), không phải nét vẽ gen.
5. **Rễ trần**: chỗ nối 2 đoạn còn nét viền dọc (đọc như khe giữa 2 phiến đá); hàng ô trần trên cùng vẫn là gạch cũ, màu đá gen sáng hơn.
6. **Chân dung Lam**: cắt chóp theo vòm elip + kẻ lại nét → mép trái mũ hơi phẳng so với Lam trong game.
7. **Đèn lồng**: dây vẽ code nối vào đoạn dây thừng trong ảnh – chỗ nối khác màu một chút.
8. Hộp thoại che một phần nền phía trên (xà, đèn) khi mở; dòng gợi ý vẫn hiện phía trên hộp.
9. Bộ nhớ ảnh thêm ≈ 23,5 MB và bản build 15,45 MB – nếu iPhone giật / nơi đăng giới hạn 15 MB: thu nhỏ 2 tranh màn hình là đỡ nhất.

## 5. Để sau (chưa có cơ chế trong demo)

- **Thang** 3 đoạn – chờ cơ chế leo thang (`thang-kho.png` + JSON đã sẵn, neo giữa đáy).
- **Mảnh Ký Ức (mờ / sáng), Âm Phù ngọc / vàng / đỏ, rương rễ đóng / mở** – `vat-pham-kho.png` + JSON đã sẵn.
- **Mảnh chuông (tiền) trên HUD** – chờ cơ chế tiền.
- Dơi Chuông (`quai-doi-chuong.png`) không thuộc đợt này.

## 6. File và cách chạy lại

```
art/lang-hoan-thien/code/tach.py        tách ảnh gen → 11 atlas 2x + lang-hoan-thien.json + ảnh kiểm viền + 2 tranh JPEG   python3 -B …/tach.py (~60 s)
art/lang-hoan-thien/                    atlas đang dùng + họ "-kho" (thang, vật phẩm – game không nạp), xem-thu/kiem-vien-*.png
game/runtime/lang-hoan-thien.js         module LHT: nạp + giải mã sẵn, vẽ mảnh theo neo, cắt ảnh cho nút DOM, rig NPC
game/demo.html                          đã ghép (khối "LÀNG HOÀN THIỆN": vị trí NPC / đồ làng / rễ trần / đèn thêm, câu thoại – sửa ở đây)
game/build-demo.py                      → demo.build.html tự chứa (nhúng thêm TV.NHUNG.lht)                                   python3 game/build-demo.py
game/kiem-thu-lang-hoan-thien/cong-cu/
  tao-ban-thu.py                        sinh kiem-thu.html (bản hiện tại) + kiem-thu-truoc.html (commit trước, chỉ để chụp, không commit)
  khoi-thu.js                           khối THỬ: ?ghi=1, ?quai=0|gac, API TVTHU (đặt camera, bước, mở thoại, lưu, rung chuông, boss treo, màn kết)
  chup.py                               ảnh TRƯỚC/SAU 12 cảnh + ghép + so-do.json + kiểm file:// + iPhone 844×390          python3 -B …/chup.py
  quay-video.py                         video 60 fps (thử trước độ trễ chém để chắc có Cộng hưởng rồi mới quay)           python3 -B …/quay-video.py
```
Không có kiểm thử tự động: các script chỉ chụp, quay và ghi số đo cho người duyệt xem.
