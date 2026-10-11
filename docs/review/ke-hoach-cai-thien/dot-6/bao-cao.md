# Báo cáo Đợt 6: thử tile 16×16 cho sàn và tường vùng Rừng già (Q2)

Ngày 11/10/2026 · nhánh `khoi-tao-du-an` · commit `fea42c76` (game + công cụ) và `bdeb2b88` (công cụ theo đặc tả)

## Tóm tắt

**Game đã sẵn sàng lát sàn, tường, nền ngoài và cỏ mép của vùng Rừng già bằng tile 16×16, có cờ tắt.** Hiện chưa có ảnh tile thật nào trong game, nên trên web phòng Rừng già **vẫn y như cũ** (đã so từng điểm ảnh: khác 0). Hang biển và Lâu đài không bị đụng tới. Hình học phòng, lối chơi, bản lưu, đăng nhập, lưu mây không đổi.

Mọi kiểm thử trong báo cáo dùng **bộ tile mẫu máy tự dựng**, không phải tranh thật. Chưa thử với ảnh ChatGPT thật. Vì vậy đợt này mới đạt mức "máy móc chạy đúng"; còn "tile có đẹp và liền mép không" chỉ biết được khi có ảnh thật.

## Bạn cần làm gì tiếp

1. Mở https://spiritblade.web.app/tach-phong.html, chọn lô **Nền phòng · Rừng già · 9 mảng (tile)**, bấm **Sao chép prompt vẽ**, dán vào ChatGPT.
2. Đưa ảnh vào bước 2. Bước 3 phải hiện **ĐẠT**. Ở phần **Xem lát lặp**, bấm **Mảng sau** soi từng mảng: dọc theo các vạch vàng không được thấy đường thẳng hay hình bị cắt cụt.
3. Bước 4: bấm **Đổi phòng** xem 5 phòng, bấm **Xem bản vẽ code (cũ)** để so với sàn hiện tại.
4. Mảng sàn nào chưa liền mép: dùng lô **vẽ riêng** của mảng đó (4 lô ở cuối danh sách).
5. Ưng thì bấm **Tải tất cả (.zip)** và gửi cho Claude đưa vào game. Khi đó Rừng già mới đổi sang tile.

Prompt đầy đủ: [`PROMPT.md`](PROMPT.md).

## 1. Tệp đã đổi

| Tệp | Đổi gì |
|---|---|
| `game/js/room_art.js` | Phần Rừng già: thêm khối tile (`TR`, `tileRung`, `trSan`, `trDai`…); 6 hàm `paintVoid`, `back`, `backDeco`, `sides`, `front`, `fore` và 3 kiểu sàn rẽ sang tile khi đủ điều kiện, không thì chạy code cũ. Ngoài phần Rừng chỉ đổi 2 dòng ở bộ nhớ đệm phòng (đổi cờ lúc đang chơi thì dựng lại phòng). |
| `game/js/data.js` | Cờ `G.TILE_RUNG = true` và công tắc `?tile=0` trên địa chỉ trang (6 dòng). |
| `tools/tach-phong/index.html` | Lô **Nền phòng · Rừng già · 9 mảng**, 4 lô **vẽ riêng** một mảng sàn, prompt, ô **Làm liền mép**, phần **Xem lát lặp**, xem thử cả phòng, các dòng kiểm (mép, số màu, màu hệ Độc). Prompt và cách tách của 5 lô cũ không đổi (đã so: y hệt). |
| `game/dist/*`, `tools/xuong-sprite/index.html` | `build.py` tạo lại. |
| `docs/review/ke-hoach-cai-thien/dot-6/` | Báo cáo này, `PROMPT.md`, `anh/`, `kiem/kiem.py`, `kiem/tile_mau.js` (bộ tile mẫu, chỉ sinh trong trang thử). |

Không thêm tệp nào vào `game/art/custom`. Ảnh lưới mẫu dùng để thử công cụ đã xoá sau khi chạy.

## 2. Đã làm gì và vì sao

**Trong game**

- **Lưới ô 16×16** bắt đầu ở góc trên trái của sàn. Sàn 300×196 không chia hết cho 16 nên cột và hàng cuối bị cắt ở mép; tường phải và tường trước che chỗ cắt. Không đổi kích thước phòng.
- **Sàn:** mỗi mảng 64×64 là 4×4 ô. Game chia sàn thành các khối 4×4 ô; mỗi khối chọn 1 trong 3 mảng sàn và có lật ngang hay không, theo hạt giống của phòng. Kiểu phòng (0, 1, 2) quyết định mảng nào chiếm nhiều (khoảng một nửa). Hai khối kề nhau không được giống hệt nhau.
- **Điểm nhấn:** tối đa 6% số khối, tức 1 khối mỗi phòng. Chỉ đặt ở khối nằm trọn trong sàn, không đè lối mòn và giữa phòng, không hai khối kề nhau.
- **Tường sau, tường trước, tường bên, cỏ mép:** dải lặp một chiều, mỗi phòng lệch đầu một khoảng khác nhau. Tường phải là ảnh tường trái lật ngang. Nền ngoài lát kín cả màn.
- **Giữ nguyên bằng code, vẽ đè lên tile:** ánh sáng giữa phòng, bóng tường, cột nắng, dấu sàn theo loại phòng, đồ trang trí, nấm sáng, dây leo, cửa, bụi cây hai góc dưới. Lối mòn nối các cửa là một lớp nâu nhạt mờ phủ lên tile.
- **Tile vẽ một lần vào nền phòng dựng sẵn**, giống sàn code cũ. Mọi ô nằm ở toạ độ nguyên nên không thể hở khe ở bất kỳ cỡ cửa sổ nào.

**Cờ tắt**

- Một chỗ duy nhất: `G.TILE_RUNG` trong `game/js/data.js`. Đổi `true` thành `false` là Rừng già vẽ bằng code y như trước.
- Thử nhanh không cần sửa code: thêm `?tile=0` vào cuối địa chỉ trang.
- Thiếu bất kỳ tệp bắt buộc nào thì game cũng tự vẽ bằng code và ghi một dòng `console.info`. Vì hiện chưa có tệp, dòng này đang hiện một lần mỗi lần mở game.
- Bắt buộc 7 tệp: 3 sàn, tường sau, tường trước, tường bên, nền ngoài. Không bắt buộc 2 tệp: điểm nhấn (thiếu thì không rải), cỏ mép (thiếu thì cỏ vẽ bằng code).

**Trong công cụ**

- Lô chính: một tấm ảnh lưới 3×3 chứa 9 mảng. Prompt tiếng Việt, dặn rõ "mép trái khớp mép phải, mép trên khớp mép dưới", có đoạn bảng màu (cỏ cây, gỗ, đá, bóng).
- **Xem lát lặp:** mảng được xếp lặp 3×3 (dải ngang: 3 bản nối ngang; dải dọc: 3 bản nối dọc; điểm nhấn: đặt giữa 8 ô Sàn A), có vạch vàng chỉ đúng chỗ nối.
- **Xem cả phòng:** phòng Rừng già do chính code game vẽ, 5 phòng mẫu (hạt giống 1 đến 5), so được với bản code cũ.
- **Làm liền mép** (mặc định bật): trộn dần hai mép đối nhau trong dải rộng 1/8 cạnh để mép khớp. Tắt được để xem mép gốc.
- Công cụ tự lấp lỗ thủng nhỏ trong mảng phải kín đặc, giới hạn số màu từng mảng, báo lỗi nếu mảng có màu của hệ Độc.

**Làm theo đặc tả mới.** Giữa chừng phiên này có thêm tệp `dac-ta-trang-thai-va-tile.md` (đẩy lên sau brief). Đã áp các điểm sau vào công cụ và prompt: 5 màu sàn, số màu tối đa từng mảng, cấm 3 màu hệ Độc, dải tối ở chân tường sau và mép tường bên, sàn A/B/C là nhiều rêu / nhiều đất / nhiều sỏi, đo chênh sáng ở mép (ngưỡng 8/255), và cách "vẽ một mảng lặp 3×3 rồi lấy ô giữa" (4 lô vẽ riêng, có dò lệch ±4 điểm ảnh). Các chỗ chưa theo đặc tả ghi ở mục 7.

## 3. Kiểm thử theo tiêu chí nghiệm thu

Chạy lại được bằng `python3 docs/review/ke-hoach-cai-thien/dot-6/kiem/kiem.py <tên bài>`.

| Tiêu chí | Kết quả | Bằng chứng |
|---|---|---|
| Cờ tắt hoặc thiếu tệp: so ảnh với bản trước đợt = 0 | **Đạt** | 30 phòng × 3 lớp ảnh (3 vùng, 3 kiểu sàn, phòng trùm, cửa mở và khoá), 4 trường hợp: không có tệp; đủ tệp + cờ `false`; đủ tệp + `?tile=0`; thiếu 1 tệp bắt buộc. Tất cả **khác 0 điểm ảnh**. Đã chạy lại sau khi gộp code của các phiên khác: vẫn 0. |
| Không đụng Hang biển, Lâu đài | **Đạt** | Bật tile, 6 phòng của 2 vùng kia: khác 0 điểm ảnh so với bản trước. |
| Không khe hở, tile đúng chỗ | **Đạt** (bộ mẫu) | Bộ tile một màu chói, 10 phòng (5 hạt giống × phòng thường và phòng trùm): 0 điểm nền ngoài lọt vào trong khung phòng; nền ngoài, tường trước, tường bên đúng màu từng điểm. Ảnh `anh/do-khe-ho-bo-mot-mau.png`. |
| Không đường nối lộ ở 960×540 và tỉ lệ lẻ | **Đạt** (bộ mẫu) | Vào game thật ở 960×540, 844×390, 1280×720, 1024×768 (tỉ lệ 1,93; 1,44; 2,6; 2,07). Ảnh phóng 6 chỗ nối mỗi cỡ: `anh/phong-to-mep-noi-*.png`. Bốn góc phòng bị giao diện che nên soi ở bài dò khe phía trên. |
| 5 phòng liên tiếp không giống nhau | **Đạt** (bộ mẫu) | `anh/5-phong-tile.png`. Cặp giống nhau nhất vẫn khác 22% số điểm ảnh sàn. Không có hai khối điểm nhấn kề nhau. |
| Cửa, vật thể, vùng sinh quái, va chạm đúng chỗ | **Đạt** | Cùng hạt giống, chạy 900 bước có vẽ, một lần bật tile và một lần code: khung sàn, vùng đi được, vị trí cửa, em bé, quái, vật thể **y hệt nhau**. Ảnh `anh/game-tile-960x540.png` (phòng 3 cửa, 6 quái). |
| FPS không giảm | **Đạt trên máy thử** | Bảng ở mục 4. Đo trên máy chủ, không phải điện thoại tầm trung. |
| Công cụ: tách đúng, xem lát lặp, xem cả phòng | **Đạt** (ảnh lưới mẫu) | 9/9 mảng, đúng cỡ, "net": 2. Một tấm ảnh cố ý xấu (Sàn A có dải sáng ở mép) bị báo **CÓ LỖI** khi tắt Làm liền mép, bật lại thì ĐẠT. Trang vừa màn điện thoại rộng 390, không cuộn ngang. Ảnh `anh/cong-cu-*.png`. |
| Kiểm lỗi gõ, bài kiểm lưu mây, gói game | **Đạt** | `node --check` mọi tệp, `cloud_save_regression` 7/7, `build.py` chạy xong. |
| Đẩy lên, workflow đăng web | **Đạt** | Lượt chạy số 174 cho commit `bdeb2b88`: xanh. Bản trên web đã có trang công cụ mới. |
| Liền mép với ảnh ChatGPT thật | **Chưa kiểm** | Chưa có ảnh thật. |
| Kiểm trên điện thoại thật | **Chưa kiểm** | Phiên này chỉ có trình duyệt máy chủ. |

## 4. Số đo

| | Trước đợt (code) | Sau đợt, chưa có tệp (code) | Sau đợt, bật tile mẫu |
|---|---|---|---|
| Khung hình/giây, 10 giây, phòng Rừng 6 quái | 60,08 | 59,67 | 60,05 |
| Một lần vẽ cả cảnh | 3,62 ms | 3,56 ms | 3,71 ms |
| Dựng một phòng mới | khoảng 26 ms | khoảng 26 ms | khoảng 13 ms |

Trình duyệt thử bị khoá ở 60 khung/giây nên ba cột coi như bằng nhau; chênh lệch nhỏ là nhiễu của máy thử. Lần đo đầu trong phiên cho 60,06 / 60,08 / 60,08.

**Dung lượng:** đợt này thêm 0 MB ảnh. Bộ tile mẫu 9 tệp nặng 19 KB. Tranh thật nhiều chi tiết hơn nên ước **0,05 đến 0,1 MB cho một vùng** (bản game hiện khoảng 10,2 MB). Phần code mới làm bản game nặng thêm khoảng 11 KB.

## 5. Ảnh

- Trước và sau, một phòng 4 cửa: `anh/truoc-sau-phong-4-cua.png` (trái: code cũ; phải: tile mẫu)
- 5 phòng liên tiếp: `anh/5-phong-tile.png`, `anh/5-phong-code-cu.png`
- Trong game: `anh/game-tile-<cỡ>.png`, `anh/game-code-cu-960x540.png`
- Phóng mép nối: `anh/phong-to-mep-noi-<cỡ>.png`
- Thiếu 2 tệp không bắt buộc: `anh/thieu-diem-nhan-va-co-mep.png`
- Công cụ: `anh/cong-cu-may1200-buoc3.png`, `anh/cong-cu-may1200-lat-lap-*.png`, `anh/cong-cu-may1200-buoc4-ca-phong.png`, `anh/cong-cu-ve-rieng-san-b.png`, bản điện thoại `anh/cong-cu-dt390-*.png`

Hình trong mọi ảnh là **tile mẫu máy tự dựng**, vẽ rất đơn giản. Đừng lấy đó để đánh giá tile đẹp hay xấu.

## 6. Rủi ro còn lại

- **Chưa thử với ảnh ChatGPT thật.** ChatGPT thường không vẽ được mép khớp tuyệt đối. Công cụ có hai cách chữa (Làm liền mép, lô vẽ riêng) nhưng cả hai mới thử với ảnh mẫu.
- **Chỗ hai mảng sàn khác nhau gặp nhau** chỉ liền khi cả ba mảng dùng chung một nền và chi tiết to không chạm mép. Prompt đã dặn, nhưng phải nhìn ở bước 4 mới biết.
- **Tile hiện ở độ nét thường** (như sàn code cũ), không phải nét gấp đôi như quái và em bé. Ảnh nét gấp đôi vẫn được nhận và tự thu lại. Muốn sàn nét gấp đôi phải viết lại phần ánh sáng sàn, ngoài phạm vi đợt này.
- **Làm liền mép** để lại một vệt hơi đối xứng rộng khoảng 8 điểm ảnh sát mép. Với mảng vốn đã liền thì nên tắt để giữ nguyên nét vẽ.
- **Màu sàn theo đặc tả xanh và sáng hơn sàn hiện tại** (xem ảnh trước và sau). Nền ngoài theo đặc tả có đốm `#14182e` nên ngả xanh tím. Cần mắt bạn duyệt khi có ảnh thật.
- **Bớt biến hoá:** dùng tile thì phòng không còn vòng đá, bãi hoa, rễ cây của sàn code (kiểu sàn 1 và 2), và cửa trên không còn thân cây to riêng phía sau.
- Mỗi phòng chỉ có khoảng 20 khối sàn từ 3 mảng, nên nhìn kỹ vẫn có thể nhận ra mảng lặp.

## 7. Chỗ tự quyết và chỗ khác tài liệu

- **Chọn theo khối 64×64, không theo từng ô 16×16.** Brief ghi "mỗi ô chọn 1 trong 3 mảng". Nếu từng ô 16×16 chọn riêng thì hoa văn của mảng 64×64 bị băm vụn và lộ đường nối ở mọi ô. Chọn theo khối giữ được hoa văn liền; lưới vẫn là 16×16. Đổi lại được bằng một số (`khoi: 1`).
- **6 biến thể mỗi khối, không phải 12.** 3 mảng × lật ngang. Brief và đặc tả đều dặn mặc định chỉ lật ngang; lật dọc có sẵn công tắc (`latDoc`) nhưng đang tắt.
- **Điểm nhấn 1 khối mỗi phòng:** bằng 5% số khối, nhưng khoảng 7% diện tích sàn, hơi quá con số 6% nếu tính theo diện tích.
- **Đo mép:** đặc tả ghi ngưỡng 8/255. Mảng thưa hoặc hẹp (cỏ mép, tường bên) có hai cột kề nhau vốn đã chênh hơn 8 dù liền tuyệt đối, nên công cụ so với mức chênh thường gặp trong chính mảng đó rồi mới báo lỗi.
- **Thứ tự lớp** giữ như game đang có (sàn, tường sau, tường bên, tường trước), không đổi sang thứ tự trong đặc tả mục 6. Kết quả như nhau vì tường phủ kín; bài dò khe xác nhận không hở.
- **Prompt tiếng Việt** theo yêu cầu của phiên; prompt tiếng Anh trong đặc tả mục 4 được dịch lại cho 4 lô vẽ riêng.
- **Chưa làm** "dịch vòng" đúng như đặc tả bước 3 cho lô 9 mảng; thay bằng Làm liền mép. Lô vẽ riêng thì có dò lệch khi cắt ô giữa.
- **Thêm công tắc `?tile=0`** ngoài brief, để bạn so nhanh trên điện thoại.
- Báo cáo cố vấn ngày 11/10 dặn chỉ bật tile mặc định khi đã kiểm đủ. Cờ đang là `true` theo brief, nhưng không có tệp thì tile không chạy. Khi đưa ảnh thật vào, nên kiểm lại 5 phòng và FPS trước khi để bật.

## 8. Cách quay lui

- Nhanh nhất: sửa `G.TILE_RUNG = true` thành `false` trong `game/js/data.js`, hoặc không đưa tệp `gd-nen-rung-*` vào game.
- Gỡ hẳn code: `git revert bdeb2b88 fea42c76`, rồi chạy `python3 game/build.py`.

## 9. Quyết định cần bạn duyệt

1. **Có mở rộng tile sang Hang biển và Lâu đài không?** Đề nghị chỉ quyết sau khi Rừng già đã có ảnh thật và bạn thấy ưng. Đợt này không làm gì ở hai vùng đó.
2. Khi dùng tile, có chấp nhận bỏ vòng đá, bãi hoa, rễ cây của sàn code không, hay muốn giữ chúng vẽ đè lên tile?
3. Màu sàn xanh hơn theo đặc tả, hay giữ tông nâu rêu của sàn hiện tại?
4. Có cần sàn nét gấp đôi không (phải làm thêm một đợt riêng)?
