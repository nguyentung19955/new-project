# Bản thử trang trí địa hình – Cổng làng (27/10/2026)

> **ĐÃ THAY BẰNG GAME CHÍNH (27/10, chiều):** sau khi chủ dự án duyệt (mục cuối), trang trí địa hình đã được sửa theo duyệt và ghép thẳng
> vào `game/demo.html` cho cả 3 màn. `thu-cong-lang.html` giờ chỉ là trang báo + link sang demo.html; thư mục `cong-cu/` đã bỏ
> (công cụ chụp / quay chuyển sang `game/kiem-thu-trang-tri/cong-cu/`). Ảnh dưới `xem-thu/` là bản thử CŨ (bệ rễ đỡ, cửa nhà) – để
> đối chiếu. Bản mới: **`game/kiem-thu-trang-tri/GHI-CHU.md`**.

Viết cho người không rành kỹ thuật. Mục tiêu: cảnh Cổng làng bớt giống Mario (khối vuông đều, bệ lơ lửng, bố cục phẳng) bằng
6 ảnh gen v3 (`art/the-gioi-moi/nguon-v3/`), **chỉ ở Cổng làng, chỉ trong bản thử** – `game/demo.html` và
`demo-doi-chieu-v3.html` KHÔNG đổi. Collider, vị trí sàn, độ cao nhảy, tỷ lệ Lam giữ nguyên 100 %.

**Chơi thử:** https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-cong-lang/thu-cong-lang.html
(thêm `?tt=0` để xem đúng bản cũ; phím **H** hoặc nút ▣ góc phải: bật overlay collider; `?vao=cong2`: vào thẳng nửa sau có bệ + cổng).
**Chưa thử trên iPhone thật** – mọi số đo dưới đây là Chromium headless trên máy chủ Linux (không GPU). Link githack **chưa mở thử được
từ máy chủ này** (mạng bị chặn); đường dẫn tài nguyên đặt giống bản thử quái + boss (`thu-quai-boss/`) đã chạy trên githack.

## 1. Xem gì trước (thư mục `xem-thu/`)

| File | Nội dung |
|---|---|
| `ghep-truoc-sau.png` | **3 góc Cổng làng, mỗi hàng TRƯỚC \| SAU cạnh nhau**, cùng vị trí camera (1920×1620) |
| `truoc-dau.png`, `truoc-tuong.png`, `truoc-be-cong.png` | TRƯỚC = bản thử mở với `?tt=0` (y hệt demo.html), đúng 960×540 |
| `sau-dau.png`, `sau-tuong.png`, `sau-be-cong.png` | SAU, cùng camera (x = 0 / 192 / 1152) |
| `sau-*-collider.png` | SAU + overlay collider: ô chặn (vàng = gỗ, xanh nhạt = đá), **cạnh lộ = nét cam**, bệ một chiều = vạch lục đậm ở mép trên, hitbox Lam (xanh), vùng ăn đòn (lục đứt), cổng đang đóng (vàng đứt) |
| `lam-chay-cong-lang-60fps.mp4` | 8,8 s, 60 hình/giây (mỗi hình = đúng 1 bước game): Lam (bot) chạy, nhảy 2 bậc, bay qua hố; cắt cảnh sang nửa sau: nhảy lên **bệ rễ đỡ**, ghi Tiếng Vọng giữ công tắc, qua cổng |
| `so-do.json` | lỗi console / lỗi trang / tải hỏng (đều 0), số đo nạp, kiểm mở qua `file://` |

Ảnh kiểm viền từng asset (nền hồng `#ff00ff` và nền đen, đúng cỡ ảnh 2x): `art/the-gioi-moi/cong-lang-v3/xem-thu/kiem-vien-*-hong.png` / `-den.png`.

## 2. Đã đặt gì, ở đâu (toạ độ thế giới, px logic; ô 32)

Thứ tự vẽ mỗi khung: nền → đèn → **[lớp SAU]** → gạch → **[lớp THÂN]** → mảng rễ rong-re → **[lớp MẶT]** → chuông / công tắc / cổng → quái → Lam → tiền cảnh Làng Chuông + **[tiền cảnh rễ-đá]** → hiệu ứng → HUD.
Mọi mảnh dùng **cùng hệ toạ độ camera với collider** (không parallax), trừ tiền cảnh rễ-đá cuộn 1,05 như tiền cảnh cũ.

| Mảnh (ảnh gen) | Đặt ở đâu | Cỡ logic | Ghi chú |
|---|---|---|---|
| **Bệ rễ đỡ** `be-re-do` (ghép từ `be-neo.png` mảnh 2 "rễ cây đỡ") | thay **bệ ván lơ lửng** nửa sau Cổng làng: x 1312..1408, mặt y 352 (ô 41–43, hàng 11). 3 ô ván không vẽ nữa, **collider `=` giữ nguyên** | 96 × 102 | mặt rêu = đúng mép trên collider, rộng đúng 3 ô; thân xuống sàn (96) + lún 6 px dưới gạch sàn; phần thân gen cao hơn mặt bệ đã CẮT bỏ (không có mặt nào cao hơn collider); thân nối dài bằng chính vỏ cây cắt ra, hoà trộn chéo |
| **Mảng gỗ lớn** `mang-go-1…6` | sàn A1: x 96, 332, 556, 770, 1012 · khối tường A1 (896..992): y 146 và 236 · sàn A2: x 1176, 1396, 1656, 1848, 2004 | ≈112 × 108 | phủ lên thân, **cắt theo ô đặc** (lùi 1,5 px ở cạnh lộ → viền đen gạch còn nguyên, không bao giờ thò ra ngoài collider); biến thể chọn bằng băm vị trí ô. 3 mảng (x 332, 1012, 1848) đặt cao, bị cắt phẳng ngay dưới viền mặt sàn → **mép gỗ trơ ngắt dải rêu** một đoạn dài; mảng khác chỉ đỉnh chạm mặt hoặc nằm dưới dải rêu |
| **Mép đất rễ-rêu** `mep-1/2-trai/giua/phai` | mặt bậc 1 (288..384, y 416), mặt bậc 2 (448..544, y 384), sàn → mép hố (544..608, y 448), đáy hố (608..704, y 512), mép hố → sàn (704..800), đỉnh khối tường (896..992, y 128) | dày 30–48 | nắp cuộn chỉ ở đầu THẬT (cạnh lộ); đầu đụng tường / bậc thì cắt phẳng (đầu mờ dần). Neo đặt **2 px dưới đỉnh rêu** → rêu nhô lên tối đa 2 px trên mặt collider. Rễ cuộn ở đầu nằm THẤP hơn mặt, thò ngang ra ngoài mép 6–10 px (như rễ rủ) |
| **Chân rễ thấp** `chan-re-1/2-thap` (nửa dưới chân rễ, mép cắt mờ dần) | 8 góc chân khối: bậc 1 (290, 382), bậc 2 (450, 542), đáy hố (612, 700), khối tường (894, 994); neo giữa đáy, lún 4 px vào dải rêu sàn | 65 × 21 | nửa trong nằm đè mặt khối, nửa ngoài loang ra sàn → phá đường bao vuông ở góc. Cao 21 logic, tròn, không có mặt phẳng |
| **Rễ ôm cột đá** `re-om-cot-1` (đã BỎ phần đá trong ảnh gen) | chân cột đá đầu A1 (x 0..32): neo (40, 450) | 87 × 120 | chỗ **đá gặp gỗ**: rễ quấn mặt phải cột đá của game, loang ra sàn; một phần bị tượng chuông lưu che |
| **Cửa nhà trong thân cây** `cua-nha` (khung cửa + giá đèn lồng + cờ, bỏ thân cây hai bên) | chân khối tường A1: khung cửa đúng bề rộng khối 96 (x 896..992), đáy y 448; **lật** để đèn + cờ nhô sang phải 44 logic (bên trái là ống nhảy tường) | 138 × 122 | trang trí nền sau gameplay, vẽ trước Lam; cửa cao 122 ≈ Lam 112 |
| **Tiền cảnh rễ-đá** `tien-canh-trai/phai` | cụm trái ở mép trái phòng, cụm phải ở mép phải phòng (A1: 0 / 1152; A2: 1152 / 2112), dời lên 60 px; cuộn 1,05; vẽ SAU Lam | 169 × 315, 191 × 315 (thu 0,8) | đã làm tối 0,62 + bớt màu như tiền cảnh Làng Chuông v2; tip thấp nhất ≈ y 255 < đầu Lam đứng sàn (336) → không che Lam. Game thu ½ lúc nạp |

**Chưa dùng** (đã tách, để trong atlas `-kho`, game không nạp): 6 bệ gốc (giá gỗ 2, rễ đỡ 2, ván treo dây 2), ban công, cổng vòm đá có chuông, cửa gỗ chặn rễ, 2 rễ ôm góc đá. Xem `kiem-vien-*-kho-*.png`.

## 3. Cách kiểm "không có mặt đứng giả"

Quy tắc đã áp: (1) mặt đứng chính = mép trên collider; (2) hình chỉ nhô LÊN tối đa 2 px (mép đất, bệ rễ đỡ đã trừ sẵn trong neo;
mảng gỗ cắt theo ô đặc nên không nhô); (3) mọi thứ nằm ngoài collider đều thấp (chân rễ 21, rễ cuộn ở đầu dải) hoặc treo
dưới mặt (rễ rủ, đèn lồng, cờ) – không có mặt phẳng ngang nào ngoài collider.

Tự kiểm: mở bản thử, bấm **H** → nhìn **nét cam** (cạnh lộ của collider): mọi mặt rêu / mặt gỗ phải nằm ngay dưới nét cam; không
có "mặt" nào có nét cam bên dưới mà không có collider. Ảnh `sau-*-collider.png` đã chụp sẵn 3 góc. Bệ rễ đỡ: vạch lục đậm
(bệ một chiều) nằm đúng trên mặt rêu, dài đúng 3 ô.

## 4. Bộ nhớ, nạp, vẽ

| | Số |
|---|---|
| Atlas game nạp | 6 PNG, 0,98 MB tải: `mang-go-lon` 1024×440, `chan-re-goc` 858×240, `mep-dat-re` 1024×160, `be-neo` 196×204, `cua-cong-nha` 281×244, `tien-canh-re-da` 727×632 (thu ½ lúc nạp) |
| Bộ nhớ ảnh giải mã | **≈ 3,98 MB** (atlas 2x) + **2,2 MB** canvas nướng sẵn 12 mảng gỗ đã cắt theo ô đặc = **≈ 6,2 MB** (Làng Chuông hiện 28,4 MB) |
| Nạp + decode | ≈ 100 ms (localhost), ở màn nạp trước nút Bắt đầu; số hiện trên màn Bắt đầu |
| Vẽ mỗi khung (headless không GPU, bộ đệm 1920×1080, 500 khung, gồm cả bước logic) | TB 70,7 ms (tắt) → 78,3 ms (bật): **+≈ 11 %** trên máy vẽ bằng phần mềm; máy có GPU chỉ thêm ~25 lần `drawImage`, 0 clip mỗi khung (đã nướng sẵn) – **phải đo lại trên iPhone** |
| Lỗi console / lỗi trang / tải hỏng | 0 / 0 / 0 (bản thử qua http, bản tự chứa qua file://) |

`file://`: `thu-cong-lang.html` mở trực tiếp từ ổ đĩa **không chạy** (giống demo.html: trình duyệt chặn `fetch` JSON qua file://). Bản
tự chứa **`thu-cong-lang.build.html`** (14,1 MB, tạo bằng `python3 game/thu-cong-lang/cong-cu/tao-ban-tu-chua.py`, KHÔNG commit)
mở qua file:// **không lỗi, trang trí đầy đủ** – đã kiểm trong `so-do.json` (`file_build`).

## 5. Còn chưa đẹp

1. **Bệ rễ đỡ**: cành của ảnh gen mỏng (rêu + cành ≈ 15 logic) nên bệ nhìn vẫn hơi "thanh"; thân nối dài (ghép vỏ cây) có 1 mối nối
   mờ ngang ở ⅓ trên, nhìn kỹ ở cỡ lớn mới thấy. Thân chỉ ở đầu trái bệ (đúng ảnh gen), đầu phải chỉ có rêu rủ.
2. **Mảng gỗ** sáng/bão hoà hơn thân gạch một chút (màu trung bình 105/75/53 so với 108/80/57) → thấy rõ là "mảng" chứ chưa hoà vào thân;
   trên khối tường 2 mảng chồng gần hết bề rộng nên mép răng cưa hai bên bị cắt thẳng theo mặt khối.
3. **Mép đất** ở bậc 3 ô: hai nắp gối nhau ở giữa (đầu mờ dần) – chỗ nối còn thấy đổi hình rễ nếu nhìn kỹ; dải đáy hố bị dòng chữ gợi ý phím che.
4. **Chân rễ thấp** nhỏ (21 logic), ở cỡ 960 chỉ là cụm rễ mờ ở góc – đúng ý "không có mặt", nhưng tác dụng phá góc vuông nhẹ.
5. **Tiền cảnh rễ-đá** tối 0,62 nên khá chìm vào nền tối (phân biệt chủ yếu khi cuộn); hai cụm A1-phải và A2-trái cách nhau ~48 px ở
   ranh giới phòng → vùng rễ tối khá rộng khi camera quay sang A2.
6. **Cột treo** (ô 24, hàng 3–8) vẫn lơ lửng, chưa có cách neo (cần ảnh rễ treo từ mép trên).
7. Rễ ôm cột đá bị tượng chuông lưu (x 80) che mất gần nửa; còn sót vài điểm xám của đá gen ở chân rễ.
8. Cửa nhà: phần mái vòm xám (đá) và rêu rủ bên phải khung là của ảnh gen, hơi khác tông gỗ thân.

## 6. Câu hỏi cần quyết

1. **Kiểu bệ neo**: đã chọn *rễ cây đỡ* (sàn ngay dưới bệ 3 ô). Có muốn thử *ván treo dây* (dây lên mép trên màn) hoặc *giá gỗ gắn tường*
   (cần bệ cạnh tường – Cổng làng không có) cho bệ này không? 6 bệ gốc đã tách sẵn trong `be-neo-kho.png`.
2. **Mảng gỗ**: có làm tối 5–8 % cho chìm hẳn vào thân, hay giữ nổi nhẹ như hiện tại?
3. **Ngắt rêu**: 3 chỗ ngắt bằng mép gỗ trơ (x 332, 1012, 1848). Đủ / nhiều / ít?
4. **Tiền cảnh rễ-đá**: giữ cùng lúc với tiền cảnh rễ treo cũ (như hiện tại), hay chỉ giữ một?
5. **Cửa nhà** ở chân khối tường A1 có hợp không, hay bỏ để khối tường chỉ là vỏ cây? Các mảnh cổng vòm / ban công / cửa chặn rễ chưa đặt
   (ban công có sàn ngang = mặt đứng giả → không nên đặt cùng lớp gameplay).
6. Có muốn mảng gỗ / mép đất cũng lên **sàn dài phẳng** (A2) nhiều hơn không? Hiện A2 chỉ có mảng gỗ (sàn không có cạnh lộ nên không đặt mép đất).

## 7. Cách áp sang Sân chuông / Phòng boss

Trang trí là **module riêng** `game/runtime/trang-tri-dia-hinh.js` (TT) + **dữ liệu theo màn** `game/runtime/trang-tri/<man>.js`
(Cổng làng: `cong-lang.js`). Không cần sửa module; mỗi màn mới chỉ thêm 1 file dữ liệu:

1. Tạo `game/runtime/trang-tri/san-chuong.js` (hoặc `phong-boss.js`) gọi `TT.them('san-chuong', {an_o, dat, tien_canh})` – toạ độ
   thế giới logic (RB: x từ 2112, RE: x từ 5312 – xem `ROOMS` trong demo). Các loại mảnh dùng lại y nguyên: `mang-go*` (phủ thân, `cat:'dac'`),
   `giai:'mep'` (dải mép đất: x0, x1, y, trai/phai), `chan-re-*-thap` (góc chân khối), `re-om-cot-*` (chỗ đá gặp gỗ: tường phòng boss
   đứng trên sàn gỗ, cột đá đầu Sân chuông), `be-re-do` (bệ 3 ô; bệ 2 ô ở Sân chuông x 25–26 cần ghép lại bản 64 logic trong `tach.py`).
2. Thêm `<script src="runtime/trang-tri/san-chuong.js">` sau `cong-lang.js`. `TT.nap` tự nạp đúng atlas mà dữ liệu dùng.
3. Nếu dùng mảnh mới (vd. cổng vòm đá ở phòng boss): thêm vào `dat`, mảnh đã có trong `cong-lang-v3.json` (họ `-kho` tự được nạp khi có dữ liệu dùng).
4. Ghép vào `demo.html` khi duyệt: đúng 8 chỗ ghi trong `cong-cu/tao-tu-demo.py` (cột "ghép"); `build-demo.py` cần nhúng thêm `TV.NHUNG.tt`
   (cách làm có sẵn trong `cong-cu/tao-ban-tu-chua.py`).

## 8. File và cách chạy lại

```
art/the-gioi-moi/cong-lang-v3/      cong-lang-v3.json (khung, neo, cỡ logic từng ô) + 9 atlas PNG 2x (3 atlas "-kho" game không nạp)
  code/tach.py                      tách nền 6 ảnh gen (flood-fill từ mép + khử viền trắng), ghép bệ rễ đỡ, bỏ đá khỏi rễ ôm cột,
                                    cắt khung cửa, ảnh kiểm viền       → python3 -B art/the-gioi-moi/cong-lang-v3/code/tach.py (~10 s)
  xem-thu/kiem-vien-*-hong/den.png  ảnh kiểm viền từng họ asset
game/runtime/trang-tri-dia-hinh.js  module TT (nạp, vẽ 3 lớp + tiền cảnh, cắt theo ô đặc, nướng sẵn, overlay collider)
game/runtime/trang-tri/cong-lang.js dữ liệu đặt mảnh Cổng làng (sửa vị trí ở đây)
game/thu-cong-lang/thu-cong-lang.html   bản thử (sinh ra, đừng sửa tay)   → python3 game/thu-cong-lang/cong-cu/tao-tu-demo.py
  cong-cu/khoi-thu.js               khối THỬ: ?tt=0, ?vao=cong2, bot kịch bản, API chụp/quay TVTHU (không ghép vào demo)
  cong-cu/chup.py                   ảnh TRƯỚC/SAU/collider 3 góc + ảnh ghép + so-do.json   → python3 -B game/thu-cong-lang/cong-cu/chup.py
  cong-cu/quay-video.py             video 60 fps (thêm "collider" để quay bản bật overlay)
  cong-cu/tao-ban-tu-chua.py        bản tự chứa thu-cong-lang.build.html cho file:// (không commit)
  xem-thu/                          ảnh duyệt, video, so-do.json
```
Không có kiểm thử tự động; `chup.py` / `quay-video.py` chỉ chụp và ghi số đo để người duyệt xem.

## Trả lời của chủ dự án (27/10/2026, 12:08) – nguyên văn
1, ván treo
2. Tối thêm
3.nhiều
4.giữ cả
5. Bỏ
6. Ok
(Điều phối hiểu: 1 = bệ neo dùng kiểu VÁN TREO DÂY; 2 = mảng gỗ làm tối thêm 5–8 % cho chìm vào thân; 3 = ba chỗ ngắt rêu là NHIỀU → giảm bớt; 4 = giữ cả tiền cảnh rễ-đá và rễ treo; 5 = BỎ cửa nhà ở chân tường; 6 = duyệt hướng, áp sang Sân chuông và Phòng boss, rồi ghép vào game chính.)
