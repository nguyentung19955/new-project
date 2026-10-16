# Báo cáo phiên 3: bộ thử mặc đồ modular làm lại bằng Cu Tí MỚI

Phiên 1 và phiên 2 dùng nhầm Cu Tí cũ (`zed-v2-canonical.png`). Phiên này làm lại toàn bộ theo `YEU-CAU-2.md`, dùng Cu Tí MỚI, đúng nhân vật đang có trong game. Code game không đổi. Sinh lại bằng `python3 docs/thu-modular/tao-bo-thu.py` (khoảng 10 giây).

## 1. Dùng ảnh nào

| Việc | Ảnh |
|---|---|
| Ảnh mẫu, so bằng mắt, gửi kèm prompt | `docs/anh-goc/zed/moi/00-anh-mau.png` |
| Nhân vật mẫu đứng | `moi/01-dung-gif/dung/khung-01.png` (cắt từ `moi/01-dung.png`): khung 1 hàng `dung` của game, cùng dáng ảnh mẫu |
| Que chạy | `moi/03-chay-v4-gif/03-chay-v4/khung-01..12.png` (cắt từ `moi/03-chay-v4.png`), **12 khung** |
| Toạ độ khung trên tấm gốc | `moi/*-gif/bao-cao.json` |
| Cách game co và đặt khung | `docs/anh-goc/zed/dung-zed-game.py`, nạp như thư viện |
| Soát với game | `game/art/custom/zed-moi.sprite.json`: chỉ đọc |

**Hàng chạy nào đang thật sự được dùng:** `game/js/zed_moi.js` chọn hàng `chay` mỗi khi chạy. Chỉ khi cầm thương hoặc búa (và `?chay2tay` không tắt) mới đổi sang `chay2tay`. Trong `dung-zed-game.py`, hàng `chay` dựng từ `03-chay-v4`, còn `chay2tay` dựng từ `03-chay-2tay`. Vì vậy bộ thử đo hàng `03-chay-v4`. Hàng này dùng cho tay không, cầm kiếm, cầm phi tiêu, và mọi bộ trang phục khác.

`neo.json` (`gan-vk`) có neo cầm vũ khí của `03-chay-v4`. Neo này thuộc vũ khí, không phải neo khớp người, nên bộ thử chỉ đối chiếu chứ không chép.

## 2. Khớp đo thế nào

1. **Đặt khung y như game.** Mỗi khung được co theo hàng: `s = 62 / chiều cao đứng`, rồi nhân `r_hang` để đầu ở hàng nào cũng bằng đầu ở dáng đứng. Sau đó đặt ngang theo tâm đầu, đặt chân xuống (48, 90) trong ô 96, và dời vào trong nếu tràn ô. Code chép đúng `dung_than()` của `dung-zed-game.py`. Script so mặt nạ điểm ảnh với tấm `zed-moi.sprite.json` và đòi trùng tuyệt đối. Kết quả **IoU = 1,0000 ở cả 1 khung đứng lẫn 12 khung chạy**. Không trùng thì script dừng.
2. **Ô que.** Ô que cùng tỉ lệ với ảnh khung. Mỗi khung được dán vào ô với một độ dời nguyên, sao cho:
   - điểm x = 24 của game rơi vào cùng một cột (đứng: 160, chạy: 150);
   - đáy chân ở cùng một đường (đứng: y = 520, chạy: y = 308).

   Nhờ vậy 12 ô chạy cùng cỡ 256×320, cùng đường chân, và giữ đúng chỗ đầu như trong game.
3. **Khớp.** Mỗi khung có 23 khớp: đỉnh đầu, tâm đầu, cằm, cổ, 2 vai, 2 khuỷu, 2 cổ tay, 2 nắm tay, eo, hông, 2 hông bên, 2 gối, 2 cổ chân, 2 mũi chân, gốc.
   - Tôi đặt bằng mắt trên ảnh ×2 có lưới 10 điểm ảnh, rồi ghi vào **tệp chỉnh tay** `chinh-tay-dung.json` và `chinh-tay-chay.json`, theo điểm ảnh của ảnh khung.
   - Nhóm đầu (đỉnh đầu, tâm đầu, cằm, cổ) đo ở khung 1. Các khung khác dời theo độ lệch khi khớp mặt nạ phần đầu với khung 1.
   - Gốc tính từ cách game đặt chân, không đo tay.
   - Sau đó vẽ que chồng lên Cu Tí từng khung (`que-chay-12-chong-hinh.png`, ×2) và soát từng khung. Đã sửa một lỗi: khung 2 bị đảo tên chân.
   - Sai số còn lại khoảng ±3–4 điểm ảnh nguồn (±0,3–0,4 điểm game). Gối và khuỷu kém chính xác nhất vì nằm trong quần thụng và ống tay.
4. **Chân A/B.** Chân `phai` (A) đỡ người ở khung 1, đạp ra sau ở khung 4–6, rồi co lên ở khung 7–9. Chân `trai` (B) đỡ người ở khung 7. Hàng chạy là hai bước, mỗi bước 6 khung. Tay xa luôn đưa tới trước vì ảnh gốc vẽ như vậy.
5. **Đổi toạ độ.** JSON ghi sẵn 6 hệ: ô que, ảnh khung, tấm gốc 2172×724, ô 96 của game, khung game 48×48, game tính từ chân. Gốc mọi hệ ở góc trên-trái. Soát nhanh: tâm đầu ở game là [24,4; 21,0] khi đứng và [25,2; 20,8] khi chạy khung 1, tức đầu gần như cùng chỗ, đúng như game neo theo đầu.
6. **Bộ phận tách lớp.** Lấy điểm ảnh thật của từng khung và chia thành 14 bộ phận theo xương. Mỗi điểm ảnh rơi vào đúng một bộ phận; script kiểm điều này ở mọi khung, nên ráp lại trùng ảnh gốc 100%. Ranh giới giữa các mảnh vẫn chỉ xấp xỉ ở chỗ chồng lấn.
7. **Neo đồ.** Mỗi khung có neo cho:
   - áo: cổ, eo, vai, hông, tay áo;
   - quần: eo, hông, hai ống;
   - tóc/mũ: tâm đầu, đỉnh đầu, bán kính;
   - phụ kiện: lưng, túi eo, tay cầm, găng, giày.

   Mỗi neo kèm góc xương, độ xoay so với dáng đứng và cỡ so với dáng đứng (≈ 0,57).
8. **Kiểm bằng mắt.** So `soat-cu-ti-moi.png` (ảnh mẫu, khung đứng, 6 khung chạy) với `00-anh-mau.png`: cùng cậu bé ninja tóc đen, mắt đỏ, áo đen, đai đỏ, dép. Đã xem từng ảnh soát dưới đây và thấy Cu Tí trong đó đều là Cu Tí MỚI:
   - `nhan-vat-khop.png`
   - `que-dung-chong-hinh.png`
   - `que-chay-12-chong-hinh.png`
   - `neo-do-chay-12.png`
   - `bo-phan.png`
   - `mau-gen/vung-*.png`
   - `ghep-thu-*.png`
   - `kiem-tra.html`, chụp bằng Chromium, không có lỗi console.

## 3. Đã thay / xoá gì (đều là bản dùng Cu Tí cũ)

**Phiên 1, thay bằng bản Cu Tí mới cùng tên hoặc tên mới:**

| Tệp cũ | Xử lý |
|---|---|
| `nhan-vat-zed-dung.png`, `nhan-vat-zed-dung-x4.png` | xoá, thay bằng `nhan-vat-cu-ti-dung.png` |
| `nhan-vat-khop.png`, `nhan-vat.json` | làm lại |
| `que-dung.png`, `que-dung-x1.png`, `que-dung-luoi.png`, `que-dung-chong-hinh.png`, `que-dung.json` | làm lại |
| `que-chay-8.*` (máy dựng, không đo) | xoá, thay bằng `que-chay-12.*` đo từ hàng chạy thật |
| `que-di-6.*`, `que-kiem-1-nhat.*` (que máy dựng theo tỉ lệ Cu Tí cũ) | xoá. Yêu cầu không đòi hai dáng này; khi cần thì đo lại từ `moi/02-di`, `moi/08-kiem-1` bằng cùng script |
| `bo-phan/*.png` (14 bộ phận que vẽ theo Cu Tí cũ), `bo-phan.json`, `bo-phan.png` | thay bằng `bo-phan/dung/`, `bo-phan/chay/` (điểm ảnh thật Cu Tí mới) |
| `ghep-thu-dung-tren-zed.png`, `ghep-thu-giap-non-chay.png/.gif` (dùng `lop-ghep/zed-v2-*`) | xoá, thay bằng `ghep-thu-dung.png`, `ghep-thu-chay-12.png/.gif` |
| `kiem-tra.html`, `kiem-tra.tmpl.html`, `tao-bo-thu.py`, `HUONG-DAN.md` | viết lại |

**Phiên 2** (chạy song song; đẩy lên lúc tôi đang làm; dùng `zed-v2-canonical.png` hàng 3): **xoá hết**.

| Tệp | Số tệp |
|---|---|
| `do-chay-that.py` | 1 |
| `que-chay-that.png/.gif/.json/-luoi.png/-chong-zed.png/.gif/-chong-zed-luoi.png/-tu-dong-va-chinh.png`, `que-chay-that.chinh-tay.json` | — |
| `bo-phan-chay/` (8 khung × 15 ảnh + 8 bản đồ), `bo-phan-chay.json`, `bo-phan-chay.png` | — |
| `ghep-thu-giap-non-chay-that.png/.gif` | — |
| `mau-gen/vung-{ao,quan,mu,gang,giay}.png` | thay bằng `mau-gen/vung-*-chay.png`, `-dung.png` của Cu Tí mới |
| `zed-chay-that-hang.png` | thay bằng `cu-ti-chay-12-hang.png` |
| Mục 7 của `HUONG-DAN.md` | bỏ, viết lại cả tệp |
| **Tổng** | **148 tệp** (commit b86b9f52) |

Hai ý hay của phiên 2 vẫn giữ, làm lại bằng Cu Tí mới: ảnh vùng mẫu gen theo từng phần, và hàng nhân vật trơn để gửi kèm.

`bao-cao.md` và `bao-cao-2.md` giữ làm lịch sử. Đầu mỗi tệp có dòng ghi "ĐÃ BỎ".

## 4. Ảnh gửi chủ game xem

1. `soat-cu-ti-moi.png`: để thấy đúng Cu Tí mới.
2. `nhan-vat-khop.png`: nhân vật mẫu đứng, 23 khớp, toạ độ.
3. `que-chay-12-chong-hinh.png` (hoặc `.gif`): que chạy 12 khung chồng lên Cu Tí thật từng khung.
4. `que-chay-12-luoi.png`: que có lưới toạ độ.
5. `neo-do-chay-12.png`: neo áo, quần, tóc, phụ kiện từng khung.
6. `bo-phan.png`: bộ phận tách lớp từng khung.
7. `ghep-thu-chay-12.gif`: đồ thử đi theo neo cả chu kỳ.
8. `kiem-tra.html`: mở bằng trình duyệt, bật "Xem MỌI khung cùng lúc".

## 5. Prompt mẫu và ảnh mẫu gửi kèm

Chi tiết ở `HUONG-DAN.md` mục 6. Ảnh mẫu luôn là **`docs/anh-goc/zed/moi/00-anh-mau.png`**.

| Prompt | Phần | Ảnh gửi kèm (theo thứ tự) |
|---|---|---|
| C0 | mũ/nón, một lần | `00-anh-mau.png`, `mau-gen/vung-mu-dung.png`, `que-dung-x1.png` |
| C1 | áo thân, một lần | `00-anh-mau.png`, `mau-gen/vung-ao-dung.png`, `que-dung-x1.png` |
| C2 | áo + tay áo, 12 khung | `00-anh-mau.png`, `cu-ti-chay-12-hang.png`, `que-chay-12-chong-hinh.png`, `mau-gen/vung-ao-chay.png` |
| C3 | quần, 12 khung | như C2, ảnh 4 = `mau-gen/vung-quan-chay.png` |
| C4 | găng/bao tay, 12 khung | như C2, ảnh 4 = `mau-gen/vung-gang-chay.png` |
| C5 | giày/dép, 12 khung | như C2, ảnh 4 = `mau-gen/vung-giay-chay.png` |

Ví dụ C3, dán sau khi gửi 4 ảnh:

> Pixel art, 1 hàng 12 khung, mỗi ô 256×320, đúng vị trí như ảnh 2. Ở mỗi khung vẽ CHỈ chiếc quần võ ống rộng màu chàm, phủ đúng vùng xanh dương ở ảnh 4 (đùi + ống tới cổ chân), gập gối như que hông–gối–cổ chân ở ảnh 3. Ống gần trước, ống xa sau. Không vẽ người, không vẽ que. Nền #00FF00 thuần, không chữ, không bóng.

## 6. Còn mở

- Đi (`moi/02-di`) và kiếm (`moi/08-kiem-1-tp`) chưa đo. Script đọc được mọi hàng trong `moi/`: chỉ cần thêm một mục vào `DONG` và một tệp chỉnh tay.
- Hàng `chay2tay` (cầm thương/búa) cũng là hàng chạy game có dùng. Nếu muốn đồ khớp cả khi cầm thương/búa thì cần đo thêm hàng này.
- Chưa thử gen thật. Bước tiếp theo là chạy C3 (quần), vì đây là phần xoay nhiều nhất, rồi nạp vào `kiem-tra.html` bằng "Ảnh theo từng khung" để soát.
