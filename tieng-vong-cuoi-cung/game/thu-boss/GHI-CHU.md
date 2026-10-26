# Thử boss: vẽ từ mảnh (A) hay nạp sẵn sprite sheet (B)

Làm theo mục 4 của `art/modular/lam-moi/YEU-CAU-CHAY-NHANH-C.md`. Đây là trang thử **riêng**: không sửa `game/demo.html`.

**Chơi thử / đo trên iPhone (xoay ngang):**
https://raw.githack.com/nguyentung19955/new-project/tieng-vong-cuoi-cung/tieng-vong-cuoi-cung/game/thu-boss/thu-boss.html

> ⚠️ **CHƯA đo trên iPhone thật.** Mọi số dưới đây đo trên Chromium headless (Playwright). Phần "giả lập iPhone"
> chỉ giả cỡ màn, dpr 3 và tên trình duyệt, cộng CPU chậm 4×. Ở đó vẽ bằng GPU **phần mềm**, không phải Safari, không phải GPU Apple.

## 1. Trang thử làm gì
- Chọn **Cách A** (vẽ từ 6 mảnh), **A2** (như A nhưng mảnh được thu nhỏ sẵn lúc nạp), **Cách B** (sheet 2x) hoặc
  **Đối chứng** (không vẽ boss, dùng để biết máy tự giật bao nhiêu). Mỗi cách mở bằng một lần tải trang riêng (`?cach=A|A2|B|0`),
  nên bộ nhớ không dính từ cách trước.
- **Màn chờ có thanh nạp**: tải hết ảnh, rồi **giải mã** bằng `createImageBitmap` (dự phòng `img.decode()`), rồi vẽ nháp mỗi ảnh
  một lần để đẩy lên GPU. Phải xong cả ba bước mới vào trận. Không có ảnh nào được nạp lần đầu lúc boss bắt đầu đánh.
- **Đấu trường đúng cỡ chơi**: canvas logic 960×540, letterbox, bộ đệm = cỡ CSS × devicePixelRatio, đất ở y = 448, 60 bước/s,
  giống demo. Boss cao 330 px logic, đặt cạnh khối giữ chỗ "Lam 112" để so cỡ. Boss tự diễn
  đứng → đập → đứng → quét → đứng → trúng → đứng → chết (giữ 1 s), chạy 2 vòng, rồi hiện bảng số.
- **Bảng số trên màn hình** (góc trái): cỡ ảnh khi đã giải mã (rộng × cao × 4 byte), số ảnh giữ cùng lúc, thời gian
  nạp + giải mã, thời gian vẽ boss mỗi khung (trung bình / p95 / tệ nhất), khoảng cách giữa các khung, số lần giật,
  và giật lúc đổi động tác (có liệt kê từng lần đổi). Nút **Chép số** chép toàn bộ kết quả dạng JSON để dán lại cho tôi.
  **Đo lại** chạy lại 2 vòng. **Ẩn số** để nhìn boss cho rõ.
- **So A↔B**: vẽ cùng một khung bằng A và bằng ô sheet B ở cỡ sheet 2x, đặt cạnh nhau, kèm ảnh chỗ lệch (đỏ = lệch > 24/255).
  Nút **So hết 132 khung** so mọi khung của 5 động tác. Nên bấm sau khi đo xong, vì nó phải nạp thêm sheet.

"Giật" = một khung cách khung trước hơn max(25 ms, 1,5 × khoảng cách trung vị). Ở 60 hình/s thì nghĩa là lỡ ít nhất một nhịp.
"Vẽ boss" chỉ là thời gian lệnh vẽ chạy trên CPU. Phần GPU làm thêm không nằm trong số này mà lộ ra ở khoảng cách khung.

## 2. Kết quả đo (Chromium headless, `do-thu-boss.py`, số thô trong `so-do.json`)

### Bộ nhớ và thời gian nạp
| | A: 6 mảnh | A2: mảnh thu nhỏ | B: sheet 2x |
|---|---|---|---|
| Ảnh giữ cùng lúc | 6 mảnh + 12 bóng tô* | 6 + 12 bóng tô* | **9 trang sheet** (132 khung) |
| Ảnh giải mã (w×h×4) | **9,5 MB** + 6,8 MB bóng tô = 16,3 MB | 3,4 MB + 6,8 MB = 10,2 MB (lúc nạp có lúc lên 9,5 MB) | **405,9 MB** |
| File tải về | 2,0 MB | 2,0 MB | 56,1 MB |
| Nạp + giải mã, máy bàn | 143 ms | 170 ms | **1 473 ms** (riêng giải mã 1 178) |
| Nạp + giải mã, giả lập iPhone | 670 ms | 1 002 ms | **1 978 ms** |
| RAM thật cả Chromium sau nạp (máy bàn / giả lập) | 545 / 565 MB | 541 / 558 MB | **931 / 957 MB** |
| RAM khi không vẽ boss (đối chứng) | 556 / 549 MB | | |

\* Bóng tô là bóng đen / bóng trắng của từng mảnh, cỡ 0,6, làm sẵn lúc nạp. Dùng cho nháy trắng (trúng đòn) và
tối dần (chết), nên trong trận không phải vẽ lại canvas nào. Nếu game tự nháy thì có thể bỏ bóng trắng, giảm còn khoảng 3,4 MB.

So với lúc không vẽ boss: **B tốn thêm khoảng 375–410 MB RAM, A chỉ khoảng 0–20 MB** (RAM thật, đo bằng psutil).
Con số này cho thấy chỉ nhìn dung lượng PNG (56 MB) thì đoán sai: ảnh đã giải mã nặng gấp hơn 7 lần file.

### Vẽ mỗi khung và giật
| | Đối chứng | A | A2 | B |
|---|---|---|---|---|
| **Máy bàn** (1280×720, dpr 1): vẽ boss TB / p95 / tệ nhất (ms) | 0 | 0,08 / 0,2 / 1,5 | 0,08 / 0,2 / 2,5 | 0,03 / 0,1 / 1,8 |
| Máy bàn: khoảng cách khung TB / tệ nhất (ms) | 16,7 / 16,8 | 16,7 / 33,4 | 16,7 / 33,4 | 16,7 / 50,1 |
| Máy bàn: giật / số khung | 0 / 1289 | 3 / 1286 | 3 / 1286 | 2 / 1286 |
| Máy bàn: giật **lúc đổi động tác** | 0 / 16 | **0 / 16** | **0 / 16** | **0 / 16** |
| **Giả lập iPhone 13** (750×342, dpr 3, bộ đệm 1824×1026, CPU 4×): vẽ boss TB / p95 / tệ nhất | 0 | 0,15 / 0,5 / 4,2 | 0,19 / 1,4 / 2,6 | 0,08 / 0,1 / 3,1 |
| Giả lập: khoảng cách khung TB (ms) | 35,6 | 71,6 | 68,5 | 60,1 |
| Giả lập: giật lúc đổi động tác | 4 / 16 | 2 / 16 | 2 / 16 | 0 / 16 |

Đọc bảng:
- **Máy bàn**: cả ba cách đều giữ 60 hình/s. Đổi động tác (đứng→đập→quét→trúng→chết) **không giật lần nào**, vì mọi ảnh đã
  giải mã và đẩy lên GPU trước trận. Vài lần giật lẻ là giật nền của trình duyệt headless; chúng không rơi vào lúc đổi động tác.
- **Giả lập iPhone**: ngay cả khi **không vẽ boss**, máy cũng chỉ được khoảng 28 hình/s, và vẫn giật ở 4/16 lần đổi. Lý do là
  GPU phần mềm bị bóp CPU 4× phải tô 1,9 triệu điểm ảnh mỗi khung. Trong điều kiện đó A chậm hơn B một chút: 6 mảnh xoay/co
  giãn tốn công tô hơn một lần chép ô vuông. Trên iPhone thật canvas vẽ bằng GPU Apple, việc này thường rất nhẹ,
  nhưng **chưa kiểm**. Số giả lập chỉ để so tương đối, không phải số của iPhone.

### Hai cách nhìn có giống nhau không (so điểm ảnh với sheet, cả 132 khung)
| Động tác | Khung | A: lệch TB /255 | A: % điểm lệch > 24 | A2: lệch TB | A2: % lệch > 24 |
|---|---|---|---|---|---|
| đứng | 32 | 1,44 | 0,05 % | 3,26 | 2,14 % |
| đập | 34 | 1,62 | 0,27 % (tệ nhất k5: 0,99 %) | 3,32 | 2,23 % |
| quét | 27 | 1,42 | 0,05 % | 3,23 | 2,07 % |
| trúng | 6 | 1,46 | 0,61 % (tệ nhất k0: 1,93 %) | 2,83 | 1,97 % |
| chết | 33 | 1,53 | 0,40 % | 3,10 | 2,02 % |
| **Tổng** | 132 | **1,51** | | **3,21** | |

Chỗ lệch chỉ là **viền khử răng cưa** mảnh dày 1 px (xem `chup-so-diem-anh-A.png`). Lý do: sheet được vẽ bằng Python
(siêu lấy mẫu, bicubic), còn canvas dùng nội suy riêng của trình duyệt. Dáng, vị trí và khung chạm trùng nhau. Ở cỡ chơi không
phân biệt được bằng mắt. Khung trúng đòn lệch nhiều nhất (1,9 %) vì bóng trắng phủ cả viền. A2 mờ hơn A một chút,
vì mảnh bị thu nhỏ hai lần.

## 3. Khuyến nghị cho game
1. **Boss dùng Cách A: vẽ từ 6 mảnh + `boss.json`.** Ảnh giải mã chỉ khoảng 16 MB so với khoảng 406 MB của sheet 2x.
   Nạp + giải mã nhanh hơn khoảng 10 lần, và nhìn giống sheet (lệch TB 1,5/255, chỉ ở viền). Với B, riêng boss đã chiếm khoảng
   400 MB RAM. Trên iPhone, Safari có thể đóng tab hoặc tải lại trang khi thiếu bộ nhớ. **B không nên dùng nguyên bộ** (chỉ hợp làm đối chứng).
2. Cách nạp trong game: nạp 6 mảnh bằng `fetch` → `createImageBitmap`. Làm bóng tô (nếu còn nướng nháy/tối vào clip).
   Vẽ nháp mỗi ảnh một lần. Làm hết trong màn tải đầu game hoặc lúc vào phòng trước đấu trường, **không** làm lúc boss thức.
   `boss.json` (100 KB) có sẵn tư thế từng khung; mỗi khung chỉ cần nhân 6 ma trận rồi gọi 6–12 lệnh `drawImage`.
3. Giữ A (mảnh cỡ gốc), không cần A2: A2 tiết kiệm 6 MB nhưng mờ hơn và nạp lâu hơn.
4. **Việc cần chủ dự án làm:** mở link trên iPhone (xoay ngang), lần lượt vào **Cách A**, rồi **Cách B**, rồi **Đối chứng**.
   Chờ hết 2 vòng (khoảng 20 s mỗi cách), bấm **Chép số** và dán lại cho tôi. Nếu Cách B làm Safari tải lại trang hay văng
   thì ghi lại, vì đó là kết quả quan trọng. Trên iPhone thật, đáng xem nhất là dòng "Lúc đổi động tác"
   (cần 0 giật) và "Khoảng cách khung" của A so với Đối chứng. Nếu A làm mất hình/s rõ rệt so với Đối chứng thì phương án
   dự phòng là sheet theo từng clip, nạp trước (vẫn khoảng 60–95 MB mỗi clip) hoặc sheet 1x (¼ bộ nhớ). Hai phương án này chưa làm.

## 4. File
| File | Nội dung |
|---|---|
| `thu-boss.html` | trang thử (tự chứa; đọc ảnh/JSON từ `art/the-gioi-moi/quai-boss/` bằng đường dẫn tương đối) |
| `do-thu-boss.py` | script đo: `python3 do-thu-boss.py` (cần `playwright`, `psutil`), tự mở máy chủ tĩnh, ghi `so-do.json` |
| `so-do.json` | số thô mọi lần đo (kể cả thời gian nạp/giải mã từng ảnh, từng lần đổi động tác) |
| `chup-*.png` | ảnh chụp trang: máy bàn A, B; giả lập iPhone B; so điểm ảnh A, A2 |

Ghi chú kỹ thuật: hoà trắng / làm tối trong A được làm bằng cách vẽ mảnh rồi vẽ đè bóng đen/trắng với độ đục = `toi` / `trang`.
Kết quả bằng đúng công thức trong `code/rig.py` ở phần đặc của mảnh. Mảnh dùng ma trận
`W = W_cha · T(diem_gan + dich) · R(goc) · S(ty)` như README của quai-boss.
