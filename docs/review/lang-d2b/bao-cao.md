# Báo cáo làn D2b: khung cửi và lửa lò vẽ chung một tấm ảnh

Ngày 11/10/2026 · nhánh `khoi-tao-du-an` · brief `docs/review/ke-hoach-cai-thien/lan-d2b-gop-khung-cui-lua-lo.md` (Đợt 11, mục 9.2, phương án b)

**Kết quả chính: phiên D2 giờ chỉ cần gen 2 tấm thay vì 3.** Khung cửi và lửa lò vẽ chung một tấm (khung cửi hàng trên, lửa lò hàng dưới). Trang Tách Làng cắt tấm đó ra đúng 2 tệp với mã cũ, giống hệt tệp của hai lô lẻ.

Ba điều cần biết trước:

1. Mọi kiểm thử dùng **ảnh mẫu máy tự dựng**. Chưa có tấm gộp nào do ChatGPT vẽ thật.
2. Game **không bị đụng tới**. Chưa có tệp ảnh nào được thêm, làng vẫn y như cũ.
3. Hai lô lẻ (khung cửi, lửa lò) **vẫn còn nguyên** trên trang, dùng làm dự phòng.

## 1. Tệp đã đổi

| Tệp | Đổi gì |
|---|---|
| `tools/tach-lang/index.html` | Thêm lô "Làng · Khung cửi + Lửa lò (1 tấm, 2 hàng × 3 khung)" ở CUỐI danh sách. Phần ghép dải, xem thử, ảnh tham chiếu, nút tải nhận được lô nhiều hàng. |
| `docs/review/lang-d2/PROMPT.md` | Thêm mục "Cách nhanh: 2 tấm thay 3". Hai prompt lẻ dời xuống mục "Dự phòng", nội dung giữ nguyên. |
| `docs/review/ke-hoach-cai-thien/dot-11/bao-cao.md` | Ghi bổ sung ở mục 9.2: phương án (b) đã làm. |
| `docs/review/ke-hoach-cai-thien/TRANG-THAI.md` | Dòng D2 (3 tấm → 2 tấm), dòng Đợt 11 (tổng 20 → 19), mục 4 điểm 9(b). |
| `docs/review/lang-d2b/` (mới) | Báo cáo này, `anh-kiem.png`, `lang-khung-cui-lua-lo-tham-chieu.png`, `kiem.py`, `so-do.json`. |

Không sửa `game/js`, không sửa `game/dist`, không thêm tệp vào `game/art/custom`. Không đụng trang của phiên C5 (`tach-giao-dien`) và E1 (`tach-do`).

## 2. Đã làm gì, vì sao

**Lô mới trên trang Tách Làng** (https://spiritblade.web.app/tach-lang.html, bước 1, lô cuối danh sách):

- Một tấm ảnh ngang 3:2, lưới 3 cột × 2 hàng, **nền xanh dương cho cả tấm**. Hàng trên: 3 khung của khung cửi. Hàng dưới: 3 khung của lửa lò.
- Trang cắt sát từng hình, rồi mỗi hàng đi **đúng đường xử lý của lô lẻ**: thu về cỡ khung của lô lẻ, 3 khung thu chung một tỉ lệ, đặt giữa theo chiều ngang và sát đáy, giảm màu chung cả dải.
- Ra 2 tệp với mã cũ: `hu-lang-khung-cui` (dải 168 × 44) và `hu-lang-lua-lo` (dải 72 × 30), nét gấp đôi. Nút **Tải tất cả (.zip)** cho 4 tệp: mỗi mã một bản nét cao và một bản nét thường, như lô lẻ.
- Số màu: ô "Số màu" có thêm mục "Theo từng dải (32 / 16)" và được chọn sẵn. Khung cửi 32 màu, lửa lò 16 màu, đúng như hai lô lẻ.
- Một hàng vẽ hỏng thì trang báo CÓ LỖI, nhưng vẫn tải được hàng kia.
- Bước 4 (xem thử trong làng): có hai nút "Khung cửi" và "Lửa lò rèn". Cả hai hình hiện đúng chỗ từ một tấm ảnh.
- Ảnh tham chiếu của lô: một ảnh 6 khung hình hiện tại, nền xanh dương, trang tự dựng.

**Prompt của tấm gộp** ghép từ chính các đoạn của hai prompt lẻ; hai lô lẻ và lô gộp giờ lấy chữ từ cùng một chỗ trong code. Phần thêm vào chỉ có:

- câu mở (tấm có 2 hàng, hàng nào là hình gì);
- câu chia hàng ("HÀNG TRÊN là KHUNG CỬI…", "HÀNG DƯỚI là LỬA LÒ RÈN…") và câu dặn không vẽ lẫn hai hàng;
- câu dặn không dùng xanh dương, xanh lam, tím ở bất cứ hình nào (lý do ở mục 2.1).

Một chỗ chữ đổi theo hình dáng ô: lửa lò ghi "to khoảng 70% **chiều cao** ô" thay cho "70% bề ngang ô". Ô của tấm gộp vuông, ngọn lửa cao hơn rộng, nếu giữ "70% bề ngang" thì ngọn lửa gần chạm đường lưới. Prompt của hai lô lẻ **không đổi một chữ** (đã so với trang cũ).

### 2.1. Màu khung cửi trên nền xanh dương

Brief dặn kiểm màu khung cửi trong code và ghi rõ. Kết quả (hàm `khungCui` trong `game/js/village_scene.js`, chỉ đọc):

| Phần | Mã màu trong code |
|---|---|
| Cột, xà, thanh đế | nâu `#8a5a34`, `#a8703f`, `#6a4428` |
| Sợi dọc, đầu cuộn sợi | trắng ngà `#f4eee0` |
| Tấm vải | hồng `#f08aa8`, mép `#ffd0dc` |
| Con thoi | vàng `#ffd23f` |
| Sọc vải và cuộn sợi | **xanh lơ nhạt `#6fc0d0`** |

Vậy khung cửi code **không chỉ có nâu và vàng** như brief ghi: có một màu xanh lơ nhạt. Màu này không phải xanh dương của nền. Trang chỉ xoá những điểm rất gần màu nền; xanh lơ nằm xa ngưỡng đó. Đã kiểm: trên nền xanh dương khung cửi không mất điểm nào, tệp ra giống hệt bản tách trên nền hồng tím.

Với ảnh ChatGPT thật: prompt tả vải đỏ, sọc và cuộn sợi màu lục, nên không cần xanh. Chỗ cần để ý là bảng màu vải trong prompt có ghi một màu tím `#7763ac`, khá gần xanh dương. Nếu ChatGPT tô tím đậm lên khung cửi, trang có thể xoá nhầm chỗ đó. Vì vậy tôi thêm câu dặn không dùng xanh dương, xanh lam, tím.

### 2.2. Chỗ tôi hiểu brief theo cách ít rủi ro nhất

- **"Ô dùng tỉ lệ của khung cửi (28×22)".** Tôi giữ ảnh 3:2 như mọi lô khác của trang (cỡ ChatGPT vẽ được), nên 6 ô đều vuông. Khung cửi to khoảng 70% bề ngang ô, bằng đúng lô lẻ. Lửa lò to khoảng 70% chiều cao ô.
- **"Lửa lò căn giữa đáy ô".** Trong tệp ra, ngọn lửa nằm giữa theo chiều ngang và sát đáy khung, đúng như lô lẻ. Trong tấm vẽ, ngọn lửa nằm giữa ô như ở lô lẻ; trang tự cắt sát rồi đặt lại.

## 3. Kiểm thử

Một lượt Playwright, bề rộng điện thoại (390), bài kiểm `docs/review/lang-d2b/kiem.py`, số đo `so-do.json`: **25/25 mục đạt**.

Ảnh mẫu: lấy 6 khung hình code từ ảnh tham chiếu của trang, **lật ngang từng hình** để nhìn là biết ảnh mẫu chứ không phải hình code, xếp 2 hàng × 3 cột trên nền xanh dương. Từ chính 6 hình đó dựng thêm hai ảnh mẫu lẻ: khung cửi 3 × 1 nền hồng tím, lửa lò 3 × 1 nền xanh dương.

| Tiêu chí của brief | Kết quả |
|---|---|
| Ảnh mẫu 2 hàng × 3 cột nền xanh dương → 2 tệp đúng mã | **Đạt.** Bấm nút tải thật, mở .zip: đúng 4 tệp `hu-lang-khung-cui` và `hu-lang-lua-lo` (bản nét cao và `.thuong`). |
| Đúng cỡ, nét gấp đôi | **Đạt.** 168 × 44 và 72 × 30, tệp ghi `"net": 2`; bản thường 84 × 22 và 36 × 15; 3 khung 28 × 22 và 12 × 15; nhịp 1,364 và 0,429 giây. |
| Giống từng byte tệp của hai lô lẻ, cùng hình | **Đạt.** Cả 4 tệp trùng từng byte với tệp tải từ hai lô lẻ. |
| Hai lô lẻ ở trang mới giống trang cũ từng byte | **Đạt.** Đưa cùng ảnh mẫu lẻ vào trang cũ (bản trước phiên này) và trang mới: tệp trùng từng byte. Prompt và ảnh tham chiếu của cả 6 lô cũ cũng giống hệt. |
| Xem thử trong làng hiện cả hai từ một tấm | **Đạt.** Bản game xem thử nhận cả 2 dải; khung cửi hiện trước nhà thợ may, lửa trong miệng lò rèn; cả hai khác hình code (vì ảnh mẫu đã lật ngang). |
| Không lỗi JavaScript | **Đạt**, ở cả trang mới và trang cũ. |
| `python3 game/build.py` không đổi | **Đạt.** Chạy lại: chỉ khác dòng mã phiên bản theo giờ gói; đã trả các tệp `game/dist` về như cũ, không đưa vào commit. |

Kiểm thêm:

- Ca một hàng hỏng (xoá khung 2 của lửa trong ảnh mẫu): trang báo CÓ LỖI, nút tải còn "1 tệp dải", tệp khung cửi tải về vẫn trùng từng byte; phần xem thử giữ khung cửi, lửa lò về hình code.
- Trang không tràn ngang ở bề rộng 390.
- Rời lô gộp thì ô "Số màu" trở về như cũ.
- Đưa ảnh tham chiếu lửa lò của lô lẻ (ngọn lửa phóng to hơn tấm gộp) vào lô lẻ: tệp vẫn trùng từng byte với tệp của lô gộp.
- Lần đẩy trang công cụ (`4d81405`): kiểm tra tự động (workflow) xanh. Lần đẩy tài liệu chỉ đổi `docs/` nên không kích hoạt workflow.

**Chưa kiểm:**

- Chưa thử với ảnh ChatGPT thật.
- Chưa mở trên điện thoại thật; chưa mở bản đã đăng trên web (chỉ thử bản trên máy kiểm).
- Không nạp thử tệp vào game thật trong phiên này. Tệp trùng từng byte với tệp của lô lẻ, mà phiên D2 đã thử nạp tệp lô lẻ vào game thật.

## 4. Ảnh

- `anh-kiem.png`: ảnh mẫu gộp; hai dải ra; xem thử trong làng (trái là ảnh từ tấm gộp, phải là hình code cũ); bước 3 của trang trên điện thoại; cả làng lúc chạng vạng.
- `lang-khung-cui-lua-lo-tham-chieu.png`: ảnh tham chiếu gửi kèm prompt tấm gộp.

Không có ảnh "trước / sau" trong game, vì game không đổi.

## 5. Số đo

| Thứ | Số |
|---|---|
| Số tấm phải gen cho D2 | 3 → **2** |
| Tổng số tấm của Đợt 11 (B1 + B2 + B3 + A2 + D2) | 20 → **19** |
| Prompt tấm gộp | 6 312 ký tự (hai prompt lẻ: 3 531 + 3 190 = 6 721) |
| Tệp mẫu `hu-lang-khung-cui` | 1 355 byte (nét cao), 923 byte (thường) |
| Tệp mẫu `hu-lang-lua-lo` | 674 byte (nét cao), 574 byte (thường) |
| Độ phóng khi vẽ, tấm 1536 × 1024, hình chiếm 70% ô | khung cửi khoảng 12,8 lần cỡ game (bằng lô lẻ); lửa lò khoảng 23,9 lần (lô lẻ 29,9). Tệp nét gấp đôi chỉ cần 2. |
| Ảnh thêm vào game | 0 MB |

## 6. Rủi ro còn lại

1. **ChatGPT có thể vẽ sai tấm 2 hàng**: lẫn hình giữa hai hàng, đổi chỗ hai hàng, hoặc vẽ ngọn lửa bé tí cho cân với khung cửi. Đường lui: tải hàng đúng, vẽ lại hàng hỏng bằng lô lẻ. Khi đó vẫn là 3 tấm, không lợi gì.
2. **Màu gần xanh dương trên khung cửi** (tím đậm, xanh lam) có thể bị xoá nhầm (mục 2.1). Prompt đã dặn. Nếu vẫn bị: bỏ tích "Lọc đốm màu nền" ở bước 2 của trang, hoặc vẽ khung cửi bằng lô lẻ (nền hồng tím).
3. **Ngọn lửa quá nhỏ so với khung cửi.** Trang bỏ những hình bé hơn khoảng một phần tám hình cỡ vừa trong tấm, coi là vụn. Vẽ đúng "70% chiều cao ô" thì không sao; ngọn lửa bé cỡ đồng xu thì sẽ bị bỏ và trang báo thiếu.
4. **Tàn lửa và mảnh lửa rời** bị bỏ nếu nhỏ hơn 15% ngọn lửa. Lô lẻ cũng làm vậy từ phiên D2, không phải do gộp. Ở `anh-kiem.png`, ngọn lửa mẫu là mấy ô vuông rời vì hình code của lửa vốn là mấy mảnh rời; khung 1 mất một mảnh cam nhỏ vì lý do này.
5. **Prompt dài** (6 312 ký tự, gần gấp đôi một prompt lẻ). ChatGPT có thể bỏ sót lời dặn của hàng dưới.

## 7. Cách quay lui

- Bỏ lô gộp, trang về như trước: `git revert 4d81405`. Commit này chỉ đụng `tools/tach-lang/index.html`, không đụng game.
- Chỉ ẩn lô gộp mà giữ code: xoá mục `{ id: 'khung-cui-lua-lo', … }` ở cuối mảng `LO` trong `tools/tach-lang/index.html`. Hai lô lẻ không phụ thuộc gì vào mục đó.
- Tài liệu: `git revert` commit báo cáo (commit ngay sau `4d81405`, có chữ "Báo cáo làn D2b").
- Không quay lui gì thì hai lô lẻ và hai prompt lẻ vẫn dùng được như cũ.

## 8. Quyết định mới cần duyệt

1. **Câu dặn màu thêm vào prompt tấm gộp** ("không dùng xanh dương, xanh lam hay tím ở bất cứ hình nào"). Mặc định: giữ. Hệ quả: khung cửi vẽ theo tấm gộp sẽ không có chi tiết tím hay xanh lam, dù bảng màu vải của game có màu tím.
2. **Lửa lò "70% chiều cao ô"** trong tấm gộp, thay cho "70% bề ngang ô" của lô lẻ. Mặc định: giữ. Ngọn lửa được vẽ nhỏ hơn lô lẻ khoảng một phần năm, vẫn thừa nét.
3. **Thứ tự thử.** Đề xuất: gen thử tấm gộp một lần. Nếu ChatGPT vẽ đúng 2 hàng thì dùng luôn; nếu sai thì quay về hai lô lẻ cho D2, không cần sửa gì thêm.

## 9. Commit và kiểm tra tự động

- `4d81405`: trang Tách Làng (lô gộp). Workflow: xanh.
- Commit báo cáo và tài liệu (ngay sau `4d81405` trong lịch sử nhánh): chỉ đổi `docs/`, không kích hoạt workflow, không đổi gì trên web.
