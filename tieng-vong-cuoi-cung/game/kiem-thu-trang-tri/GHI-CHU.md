# Trang trí địa hình 3 màn – đã ghép vào game chính (27/10/2026)

Viết cho người không rành kỹ thuật. Đây là bước tiếp theo của bản thử Cổng làng (`game/thu-cong-lang/GHI-CHU.md`), làm theo
**trả lời duyệt 12:08** của chủ dự án: sửa Cổng làng (ván treo dây, mảng gỗ tối hơn, bớt ngắt rêu, bỏ cửa nhà, giữ cả 2 tiền cảnh)
rồi áp cùng bộ quy tắc sang **Sân chuông** và **Phòng boss**, và **ghép thẳng vào `game/demo.html`**. Collider, vị trí sàn, độ cao
nhảy, tỷ lệ Lam, quái / boss, hiệu ứng, Làng Chuông v2 giữ nguyên 100 % – trang trí chỉ là HÌNH vẽ thêm.

**Chơi thử:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/demo.html
(thêm `?tt=0` để xem bản KHÔNG trang trí; phím **H** hoặc nút ▣: bật overlay collider; `?vao=quai` / `?vao=boss`: vào thẳng Sân chuông / phòng boss).
Bản kiểm thử có bot quay video: `game/kiem-thu-trang-tri/kiem-thu.html` (thêm `?vao=cong2`).
**Chưa thử trên iPhone thật** – mọi số đo là Chromium headless trên máy chủ Linux (không GPU); link githack chưa mở thử được từ máy chủ này.

## 1. Xem gì trước (thư mục `xem-thu/`)

| File | Nội dung |
|---|---|
| `ghep-truoc-sau.png` | **6 góc (2 góc × 3 màn), mỗi hàng TRƯỚC \| SAU cạnh nhau**, cùng camera / cùng trạng thái (1920×3240) |
| `truoc-<góc>.png` | TRƯỚC = `?tt=0` (đúng gạch cũ), 960×540 |
| `sau-<góc>.png` | SAU, cùng camera |
| `sau-<góc>-collider.png` | SAU + overlay collider: ô chặn (vàng = gỗ, xanh nhạt = đá), **cạnh lộ = nét cam**, bệ một chiều = vạch lục ở mép trên, cổng đóng = vàng đứt, hitbox Lam / quái / boss |
| `lam-di-qua-3-man-60fps.mp4` | 18,9 s, 60 hình/giây (mỗi hình = 1 bước game): Cổng làng (bậc, hố → cắt cảnh: nhảy lên **bệ ván treo**, Tiếng Vọng giữ công tắc, qua cổng) → Sân chuông (chạy suốt sân, nhảy khối đá; **đã bỏ quái** để bot không phải đánh) → Phòng boss `?vao=boss` (boss thức, 1 cú đập, rồi ép sang **pha 2 treo trần**) |
| `iphone-844x390.png` | màn Bắt đầu ở iPhone ngang 844×390 (nút Bắt đầu nằm trong màn, tap được) |
| `so-do.json` | lỗi console / lỗi trang / tải hỏng (đều 0 ở cả bản kiểm thử, demo.html, bản build file://), số đo nạp, kiểm iPhone |

Góc chụp: `cong-lang-tuong` (camera x 192: bậc, hố, cột treo, khối tường) · `cong-lang-be-cong` (x 1152: bệ ván treo, cổng) ·
`san-chuong-dau` (x 2112) · `san-chuong-be-cong` (x 2368: khối đá, bệ ván treo 2 ô, cột treo, cổng) · `phong-boss-vao` (Lam vào, boss ngủ) ·
`phong-boss-treo` (pha 2, boss treo trần – phòng boss đúng 1 màn nên camera đứng yên, 2 "góc" là 2 trạng thái).

## 2. Đã sửa gì ở Cổng làng theo duyệt

| Duyệt | Đã làm |
|---|---|
| 1. Bệ neo → **ván treo dây** | Bệ 3 ô (x 1312..1408, mặt y 352): ván gỗ rộng đúng 96 = 3 ô, **mặt ván = đúng mép trên collider cũ**, 2 dây thừng từ nút buộc 2 đầu ván đi thẳng lên **quá mép trên màn** (cùng hệ toạ độ camera, không parallax). Nút buộc nhô lên ~9 px ở 2 đầu là dây, không phải mặt đứng. Bệ rễ đỡ cũ để dành trong atlas `-kho` (game không nạp) |
| 2. Mảng gỗ **tối thêm** | Làm tối 7 % + bớt màu 5 % ngay trong ảnh (asset): màu trung bình 105/75/53 → **99/70/51** (ô thân gạch `go-than`: 108/80/57 – có cả rãnh tối; nhìn thực tế mảng gỗ vẫn phẳng hơn thân vì không có vân) |
| 3. Ngắt rêu **nhiều** | 3 → **2 chỗ** cả Cổng làng (x 332 nửa đầu, x 1848 trước cổng); mảng x 1012 hạ xuống dưới dải rêu |
| 4. **Giữ cả** 2 tiền cảnh | Rễ-đá (mép phòng, cuộn 1,05) + rễ treo Làng Chuông v2 vẫn cùng lúc |
| 5. **Bỏ** cửa nhà | Đã bỏ; khối tường chỉ còn vỏ cây + 2 mảng gỗ + mép đất trên đỉnh + chân rễ 2 góc. Atlas cửa không còn được nạp |
| Cột treo lơ lửng (x 768..800) | **Để nguyên** – trong 6 ảnh gen v3 không có "rễ treo từ mép trên" cho cột đá/gỗ; tiền cảnh rễ treo v2 là bóng tối, không hợp làm neo. Xem mục 6 (ảnh cần gen) |

## 3. Đã đặt gì ở 2 màn mới (toạ độ thế giới, px logic; ô 32)

Thứ tự vẽ giữ như bản thử: nền → **[SAU]** → gạch → **[THÂN]** → mảng rễ rong-re → **[MẶT]** → đồ vật → quái → Lam/boss → tiền cảnh → hiệu ứng → HUD.
Mọi mảnh ở lớp SAU/THÂN/MẶT vẽ **trước Lam, quái, boss** → không bao giờ che nhân vật.

**Sân chuông** (`runtime/trang-tri/san-chuong.js`, 12 mảnh):

| Mảnh | Đặt ở đâu | Ghi chú |
|---|---|---|
| Bệ **ván treo dây 2 ô** | thay bệ ván lơ lửng x 2912..2976, mặt y 320 | ván 64 logic (cắt bớt khúc giữa ván gen), dây lên quá mép trên; collider `=` giữ nguyên |
| Mảng gỗ ×6 | thân sàn x 2150, 2380 (ngắt rêu – **1 chỗ**), 2600 (dưới khối đá), 2790, 3010, 3220 | mảng gỗ giờ **chỉ cắt theo ô GỖ**, không lan sang khối đá / tường đá |
| Mép đất rễ-rêu | mặt khối đá x 2560..2848, y 352 (2 đầu thật có nắp cuộn) | rêu nhô ≤ 2 px; quái đi trên khối vẽ sau nên không bị che |
| Rễ ôm cột đá ×2 | 2 góc chân khối đá (chỗ **đá gặp gỗ**), lật ở góc trái | cắt hộp từ y 350 → không có gì cao hơn mặt khối quá 2 px; đầu cắt nằm dưới rễ cuộn của dải mép |
| Chân rễ thấp ×2 | 2 góc chân khối đá | nửa ngoài loang ra sàn |
| Tiền cảnh rễ-đá | mép trái / phải phòng (x 2112 / 3328), dời lên 60 | tip ≈ y 255 < đầu Lam 336; quái gác cổng (x 3072, cao 120) không bị che |

**Phòng boss** (`runtime/trang-tri/phong-boss.js`, 7 mảnh) – quy tắc riêng: không có gì trong sân boss ngoài mảng gỗ nằm DƯỚI mặt sàn;
không che Lam / boss; **trần để nguyên** (trần đá; boss pha 2 treo giữa trần x 5824..6024, y −40..250; chưa có ảnh rễ treo hợp với đá):

| Mảnh | Đặt ở đâu | Ghi chú |
|---|---|---|
| Mảng gỗ ×5 | thân sàn x 5330, 5560, 5790 (ngắt rêu – **1 chỗ**), 6010, 6190 | vùng boss đập / quét chỉ là mặt sàn; mảng gỗ không nhô |
| Rễ ôm cột đá + chân rễ thấp | chân tường đá phải (x 6240, chỗ đá gặp gỗ), lật để bám mặt trong tường | vẽ trước boss; khi boss đứng sát tường thì boss đè lên rễ (đúng chiều sâu) |
| Tiền cảnh rễ-đá **thu 0,6**, dời lên 40 | 2 góc trên phòng (x 5312 / 6272) | tip ≈ y 149 < đỉnh boss đứng sàn (158); cách xa chỗ boss treo; chỉ có thể lướt qua đỉnh boss ~0,5 s lúc boss bay lên đập sát mép sân |
| Mép đất | **không đặt** | sàn phòng boss chạy suốt dưới 2 tường, không có cạnh lộ thật |

Cổng làng (`cong-lang.js`, 28 mảnh) như bản thử trừ các sửa ở mục 2. Cả 3 file dữ liệu chỉ là bảng toạ độ – muốn dời / bỏ mảnh nào thì sửa 1 dòng.

## 4. Ghép vào game chính – đã làm

- `game/demo.html`: nạp `runtime/trang-tri-dia-hinh.js` + 3 file dữ liệu; vẽ 3 lớp + tiền cảnh đúng chỗ; nạp + giải mã atlas **ở màn nạp**
  (trước nút Bắt đầu), nướng sẵn 23 mảng gỗ đã cắt theo ô; số đo hiện trên màn Bắt đầu. **Trang trí nạp lỗi thì tự TẮT, game vẫn chạy**
  (báo một dòng nhỏ). `?tt=0` tắt trang trí. Overlay H có thêm collider địa hình + cổng.
- `game/build-demo.py`: nhúng `TV.NHUNG.tt` (JSON + 5 atlas PNG đang dùng, không nhúng họ `-kho`) và chèn inline 4 file JS trang trí →
  `demo.build.html` **13,99 MB**, mở qua `file://` không lỗi, trang trí đầy đủ (`so-do.json` → `file_build`).
- `game/demo-doi-chieu-v3.html`: **không đụng**. `game/thu-cong-lang/thu-cong-lang.html`: thay bằng trang báo "đã thay bằng demo.html" + link.
- Dữ liệu đặt theo màn: `game/runtime/trang-tri/cong-lang.js`, `san-chuong.js`, `phong-boss.js`.

## 5. Bộ nhớ, nạp, kiểm

| | Số |
|---|---|
| Atlas game nạp | **5 PNG, 0,83 MB tải**: `mang-go-lon` 1024×440, `mep-dat-re` 1024×160, `chan-re-goc` 858×240, `tien-canh-re-da` 727×632 (thu ½ lúc nạp), `be-neo` 342×68 (ván 3 ô, ván 2 ô, ô dây lặp) |
| Bộ nhớ ảnh giải mã | **≈ 3,66 MB** (atlas) + **4,24 MB** canvas nướng sẵn 23 mảng gỗ (12 Cổng làng + 6 Sân chuông + 5 boss) = **≈ 7,9 MB** thêm (bản thử Cổng làng: 6,2 MB) |
| Nạp + decode | 65–90 ms (localhost / file://) |
| Vẽ mỗi khung | như bản thử: ~+11 % trên máy vẽ phần mềm; mỗi khung thêm ≈ 25–35 `drawImage`, 0 clip (dây treo: ~12 ô nhỏ mỗi dây). **Phải đo lại trên iPhone** |
| Lỗi console / trang / tải hỏng | 0 / 0 / 0 ở bản kiểm thử (3 lượt), demo.html qua http, demo.build.html qua file:// |
| iPhone ngang 844×390 (giả lập) | màn Bắt đầu: nút Bắt đầu ở (362, 266) 119×46, nằm trong màn, **tap được** → vào game |

## 6. Còn chưa đẹp / cần quyết

1. **Cột treo lơ lửng** ở Cổng làng (x 768..800, hàng 3–8) vẫn lơ lửng – cần ảnh gen (mục 7).
2. **Ván treo dây**: dây thừng thẳng tắp lên mép trên màn, không có điểm móc nhìn thấy (vòng + nút buộc trên của ảnh gen đã bỏ vì nằm ngoài màn).
   Ở Sân chuông, dây đi ngang qua lớp nền có cầu treo / đèn → hơi rối ở 1 góc nhìn. Nếu muốn, có thể thêm xà ngang / cành ở mép trên (cần ảnh).
3. **Mảng gỗ** đã tối hơn nhưng vẫn nhận ra là "mảng" (bề mặt phẳng so với vân rãnh của thân). Muốn chìm hơn nữa thì phải gen mảng có chút vân
   cùng kiểu thân (mục 7) chứ không chỉ chỉnh màu.
4. **Khối đá Sân chuông**: mép đất rễ-rêu màu đất nâu nằm trên đá xám – đọc là "đất phủ trên đá", có thể hơi lạ với người thích đá sạch;
   rễ ôm 2 góc bị cắt phẳng ở mặt khối (giấu dưới rễ cuộn của dải mép, nhìn kỹ ở cỡ lớn mới thấy).
5. **Phòng boss** thay đổi ít (chủ ý): chỉ mảng gỗ dưới sàn, rễ chân tường phải, 2 cụm tiền cảnh nhỏ ở góc trên. Trần đá, tường treo trái vẫn
   vuông vức. Tiền cảnh có thể lướt qua đỉnh boss ~0,5 s khi boss bay lên đập sát mép sân.
6. Tiền cảnh rễ-đá Sân chuông cụm phải đè lên vùng cổng + cột treo (chỉ phần trên cao), đã thấy chấp nhận được ở bản thử.
7. Video bỏ quái Sân chuông (bot không đánh nhau) – xem quái + trang trí cùng lúc thì mở `?vao=quai` chơi tay.

## 7. Ảnh cần gen thêm (nếu muốn đẹp hơn) – prompt ngắn, nền trắng, cùng phong cách 6 ảnh v3

- **Rễ treo từ trần cho cột lơ lửng**: "hanging tree roots growing down from above, gripping a narrow wooden/stone pillar top, moss,
  thick ink outline, flat cartoon game asset, white background, side view, 3 variants" – để neo cột treo Cổng làng (cột 32 logic, cần rễ
  rộng ~96, cao ~120).
- **Xà / cành treo cho bệ ván treo dây**: "thick mossy tree branch stub with two rope loops knotted around it, seen from the side, flat
  cartoon game asset, white background" – đặt ở mép trên màn làm điểm móc dây.
- **Mảng gỗ có vân nhẹ**: "large irregular bark patch, subtle wood grain matching twisted-root bark, no moss, jagged edge, 6 variants" –
  để mảng che vân lặp mà vẫn giống thân.
- **Mép đá rêu** (cho khối đá Sân chuông, thay mép đất nâu): "mossy stone ledge edge, left cap / middle tile / right cap, grey stone with
  moss and small roots, flat cartoon, white background".
- **Rễ treo hợp trần đá phòng boss** (tuỳ chọn): "short dark roots and moss hanging from a stone ceiling, repeating tile, flat cartoon".

## 8. File và cách chạy lại

```
art/the-gioi-moi/cong-lang-v3/code/tach.py   tách ảnh gen → atlas + JSON (thêm: ván treo 3 ô / 2 ô, ô dây lặp dọc, mảng gỗ tối 7 %)
                                              → python3 -B art/the-gioi-moi/cong-lang-v3/code/tach.py  (~8 s; in màu trung bình mảng gỗ)
game/runtime/trang-tri-dia-hinh.js            module TT (thêm giai 'van-day', cắt chỉ ô gỗ, tiền cảnh thu k)
game/runtime/trang-tri/{cong-lang,san-chuong,phong-boss}.js   dữ liệu đặt mảnh từng màn (sửa vị trí ở đây)
game/demo.html                                game chính đã ghép (?tt=0 tắt trang trí)
game/build-demo.py                            → demo.build.html (tự chứa, file://)          python3 game/build-demo.py
game/kiem-thu-trang-tri/kiem-thu.html         bản kiểm thử (SINH RA, đừng sửa tay)         python3 game/kiem-thu-trang-tri/cong-cu/tao-ban-thu.py
  cong-cu/khoi-thu.js                         khối THỬ: ?vao=cong2, ?quai=0, ?ghi=1, bot, API TVTHU (không có trong demo.html)
  cong-cu/chup.py                             ảnh TRƯỚC/SAU/collider 6 góc + ghép + so-do.json + kiểm file:// + iPhone   python3 -B …/chup.py
  cong-cu/quay-video.py                       video 60 fps 3 màn + boss (thêm "collider" để quay bản bật overlay)
  xem-thu/                                    ảnh duyệt, video, so-do.json
```
Không có kiểm thử tự động: `chup.py` / `quay-video.py` chỉ chụp, quay và ghi số đo cho người duyệt xem.
