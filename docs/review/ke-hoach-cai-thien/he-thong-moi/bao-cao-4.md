# Báo cáo đợt 4: cân lại đồ trong bản lưu + soát cân bằng

**Mã commit:** `3b1e6915` (nhánh `khoi-tao-du-an`)

Làm theo `YEU-CAU-4-RESET-CAN-BANG.md`, sau khi đọc báo cáo đợt 1, 2, 3. **Không chạy game, không Playwright, không bài kiểm tra nào.** Chỉ kiểm bằng: script tính số liệu `node tools/can-bang/tinh.js`, `node --check` (mọi tệp `game/js/*.js` đều qua) và `python3 game/build.py` (đã dựng lại `game/dist`). Không đụng `master`, không force push, không PR. Không đụng đăng nhập Google, lưu mây (`cloud.js` không sửa), `?cloud=0`, không chép apiKey.

## A. Cân lại đồ trong bản lưu cũ

### Cách chạy
- `js/engine.js`: thêm số phiên bản **`G.SAVE_CAN_LAI = 1`**. Bản lưu nào có `canLai` khác số này thì chạy bước cân lại **một lần** rồi ghi `canLai = 1`. Lần sau đổi luật đồ, chỉ cần tăng số này.
- Bước cân lại là `VM.canLai` trong `js/vk_moi.js`. Nó chạy trong `G.fixSave`, nên mọi đường nạp đều đi qua: bản trên máy, bản tải từ mây, bản mây cũ. Lưu mây vẫn cùng định dạng.
- Bước này làm trên bản sao. Nếu lỗi giữa chừng thì bản lưu giữ nguyên, lần nạp sau thử lại.

### Bước cân lại làm gì
| Phần | Làm gì |
|---|---|
| 4 vũ khí | Dựng lại từng món từ đầu. **Chỉ giữ:** loại, cấp (Trắng / Mầm / Thành hình / Thức tỉnh), hệ, số lần mài (và số quái đã hạ, để thống kê). Bậc màu, dòng phụ, dòng mạnh, dòng vũ khí, danh hiệu cũ, hệ phủ tạm đều bỏ. Sát thương tính lại theo `G.WTYPES × G.STAGE_MULT × mài` như luật hiện hành. Mài cao hơn `G.MAX_SHARPEN` (15) thì kẹp lại và hoàn đủ quặng, vàng, nguyên liệu của các nấc bị kẹp. |
| Trang phục | Chỉ còn 4 bộ. Bộ được mở đúng theo trùm vùng đã hạ (độ khó nào cũng tính). Nếu bộ đã hạ trùm mà chưa mở thì mở luôn, làng báo như cũ. Nếu bộ đang mở mà chưa hạ trùm thì đóng lại và hoàn linh khí + vàng đã bỏ ra nâng bộ đó. Mặc bộ đã đóng thì quay về Ninja. Xoá hẳn mã đồ mặc cũ (`outfit`, `owned`, `helm`, `armor`, `charm`). Cấp bộ (`boCap`) giữ nguyên. |
| Chỉ số nhân vật | Máu, công… không lưu trong bản lưu mà tính lúc vào trận từ cấp + điểm kỹ năng, nên tự theo luật mới (máu mỗi cấp mới ở mục B2). Bước này kiểm cấp (1–40), kinh nghiệm (thừa thì lên cấp, không bao giờ tụt cấp), điểm kỹ năng (mỗi nhánh tối đa 5, tổng không quá cấp/3), điểm chưởng (tổng không quá cấp, nút phải đủ điểm mới mở). Phân sai luật thì **trả hết** để người chơi phân lại, và câu báo ở làng nhắc việc này. |
| Hành trang | Đá tôi không còn dùng (mục B5), nên đổi ra **6 quặng mỗi viên**. Trường của luật đã bỏ (`grit`, `_hecu`…) bị xoá. Quặng, nguyên liệu vùng, mảnh trùm giữ nguyên. |
| Không đụng | Vàng, linh khí, cấp, sao ải, tiến độ vùng, bạn đã cứu. Những thứ này chỉ được **cộng** phần hoàn lại. |
| Báo | Lần đầu về làng hiện một câu: **"Đã cân lại đồ theo luật mới. Hoàn lại: … vàng, … linh khí, … quặng."** Có trả điểm thì nói thêm. Nếu đợt 1 cũng còn câu báo thì hai câu gộp làm một. Bản lưu mới tinh không hiện câu này. |
| Lượt ải chơi dở | Bản ghi `linhkhi_luot_v1` từ trước khi cân lại có máu tối đa theo luật cũ. Khi chơi tiếp, game lấy máu tối đa mới (vẫn trừ 20% nếu có lời nguyền "frail"), và máu đang có không vượt máu tối đa. |

### Lỗi của đợt 1 tìm thấy khi làm (đã sửa)
`G.fixSave` của `engine.js` bù trường thiếu bằng bản `G.newSave()`. Bản này đã có sẵn `heMoi = 1`, nên bản lưu cũ nhận cờ `heMoi = 1` ngay trong lần nạp đầu, và **bước chuyển của đợt 1 (`VM.chuyen`) không bao giờ chạy**. Hậu quả:
- Không hoàn vàng / linh khí cho vũ khí trùng, bậc màu và quần áo cũ.
- Mỗi loại vũ khí giữ món **đầu danh sách** chứ không phải món cấp cao nhất.

Đã sửa như sau:
- Cờ nay được xét trên bản lưu **đưa vào**, trước bước sửa. Bản lưu cũ chưa từng mở (ví dụ bản cũ chỉ còn trên mây) sẽ được chuyển đúng.
- Bản lưu đã bị "chuyển hụt" được **hoàn bù một lần** (cờ `heMoiHoan`), lấy từ bản sao gốc `linhkhi_save_v1_truoc_he_moi` còn trên máy. Phần hoàn gồm vàng + linh khí của đợt 1, và mỗi loại vũ khí được nâng lên cấp / mài của món tốt nhất cũ nếu cao hơn.
- Phần hoàn bù chỉ chạy khi chắc chắn là cùng một bản lưu:
  - cùng chủ;
  - số thứ tự đồ không lùi;
  - mọi sao ải cũ đều còn;
  - vũ khí cũ còn đó và số quái đã hạ không ít hơn.
- Máy không có bản sao gốc thì bỏ qua. Cờ không bị ghi, nên máy có bản sao gốc vẫn hoàn được sau.
- Trong `engine.js` có ghi chú: **không thêm cờ phiên bản vào `G.newSave`**.

## B. Soát cân bằng (tính bằng số, không chạy game)

**Công cụ:** `tools/can-bang/tinh.js`. Script nạp thẳng `game/js/data.js` và đọc nhịp đòn từ `game/js/moves.js`.
- Chạy `node tools/can-bang/tinh.js` để in 5 bảng.
- Thêm `--dat LVL_HP=0.05` để thử số khác mà không sửa tệp.
- Thêm `LK_GOC=<thư mục js cũ>` để so với bản cũ.

**Mô hình:** chơi 15 ải lần lượt. Chưa đủ 90% Sức mạnh khuyên dùng thì chơi lại ải trước để cày. Mỗi lượt cộng thưởng **kỳ vọng** (tỉ lệ × giá trị). Số quái mỗi ải lấy theo luật đợt quái của `stage.js`. Linh khí dùng cho kiếm trước, phi tiêu sau. Vàng / quặng dùng nâng lò, mài. Đây là thước đo để so, không thay được chơi thật.

**Bảng hằng số gom về một chỗ:** đầu `game/js/data.js` có **mục lục bảng cân bằng**, ghi bảng nào nằm ở đâu: vũ khí, mài/lò, nhân vật, chưởng (`js/chuong.js`), skill bộ, nâng bộ, quái/trùm, khuyên dùng, thu nhập.

### 1. Đồ / vũ khí (không đổi số)
Sát thương mỗi giây của chuỗi đòn thường, đánh một con, cấp 1, mài +0:

| Vũ khí | Đòn gốc | Nhát TB | Trắng | Mầm | Thành hình | Thức tỉnh | So trung bình | Tầm |
|---|---|---|---|---|---|---|---|---|
| Kiếm | 9 | 11,5 | 32,7 | 37,6 | 44,1 | 52,3 | +5% | gần 32–40 |
| Giáo (Thương) | 10,7 | 13,8 | 34,9 | 40,1 | 47,1 | 55,8 | +12% | gần 60–62, quét 44 |
| Búa | 21,3 | 21,3 | 26,6 | 30,6 | 35,9 | 42,6 | −14% | gần 32, choáng 0,4 giây |
| Phi tiêu | 11,4 | 11,4 | 30,0 | 34,5 | 40,5 | 48,0 | −3% | xa 180 (ném mạnh 250) |

- Cả 4 món đều nằm trong ±20% và có lý do. Búa chậm nhưng mạnh nhất mỗi nhát, có choáng, đánh cụm. Phi tiêu đánh xa, an toàn. Giáo cao nhất vì tầm gần dài, nhưng bài đo cũ trên quái thật (`tests/dps.py`) cho kiếm hơn giáo nhờ tự ngắm.
- Hệ số cấp như nhau cho cả 4 món, nên tỉ lệ giữ nguyên ở mọi cấp.
- **Không đổi số.**

### 2. Chỉ số Zed so với quái

| Hằng số | Cũ → mới | Lý do |
|---|---|---|
| `G.LVL_HP` (máu mỗi cấp) | **0,035 → 0,06** | Đợt 1 bỏ quần áo cũ mà chưa bù máu. Áo vùng ba bậc Vàng từng cho +187 máu và ~15% giảm sát thương. Với số cũ, Zed cấp 40 chỉ có 260 máu, trùm vùng ba hạ trong 2 đòn, và Sức mạnh tối đa (491) **không với tới** khuyên dùng 3-5 (560). |

Tình trạng lúc vào ải, theo mô hình. "Đánh hạ" là số nhát kiếm thường; "Quái hạ Zed" là số đòn gốc, chưa tính né và kỹ năng. Mỗi ô ghi **cũ → mới**:

| Ải | Cấp | Máu | Đòn kiếm | Đánh hạ quái / tinh anh / trùm | Quái / tinh anh / trùm hạ Zed (đòn trùm) |
|---|---|---|---|---|---|
| 1-1 | 1 → 1 | 100 → 100 | 9,9 → 9,9 | 7 / 34 / 92 → 7 / 34 / 92 | 10 / 8 / 8 → 10 / 8 / 8 (13) |
| 1-5 | 13 → 10 | 156 → 169 | 23,8 → 24,2 | 7 / 31 / 156 → 7 / 31 / 153 | 8 / 6 / 4 → 9 / 7 / 5 (39) |
| 2-1 | 16 → 15 | 168 → 202 | 31,5 → 27,8 | 6 / 30 / 95 → 7 / 34 / 108 | 7 / 6 / 3 → 9 / 7 / 4 (62) |
| 2-5 | 30 → 26 | 222 → 275 | 49,9 → 47,8 | 7 / 33 / 150 → 7 / 34 / 156 | 6 / 5 / 3 → 7 / 5 / 3 (112) |
| 3-1 | 33 → 27 | 233 → 282 | 51,5 → 48,3 | 8 / 36 / 123 → 8 / 38 / 131 | 6 / 4 / 2 → 6 / 5 / 2 (150) |
| 3-5 | 40 → 32 | 260 → 315 | 70,5 → 62,8 | 7 / 34 / 123 → 8 / 39 / 138 | 5 / 4 / 2 → 5 / 4 / 2 (195) |

- Một đòn trùm vùng ba nay ăn ~50–60% máu Zed (trước ~75%), gần với mức ~50% mà phiên cân bằng cũ nhắm tới.
- Zed tới vùng ba ở cấp thấp hơn mà vẫn đủ Sức mạnh, vì máu đã tính vào Sức mạnh.
- Khuyên dùng (`G.STAGE_REC`) **giữ nguyên**: số này do bot đo, và không chạy lại bot được. Chỗ phải cày nhiều nhất theo mô hình: trước 1-5 (~8 lượt), 2-1 (~8), 2-5 (~8). Cả chiến dịch **114 → 58 lượt**, và 3-5 từ "không với tới" thành "vừa đủ".

### 3. Kỹ năng

| Thứ | Cũ → mới | Lý do |
|---|---|---|
| Phân thân (bộ Ninja cấp 2) | không hồi → **hồi 4 giây** (`G.SKILL_BO.ninja[1].hoi`) | Lộn hồi ~1 giây, nên lộn liên tục thì gần như luôn có bóng hút quái thường. |
| Khiên nước (bộ Biển cấp 1) | chặn trọn mọi đòn → **mỗi lần đỡ tối đa 25% máu tối đa** (`toiDa: 0.25`) | Trước đây cứ 10 giây khiên chặn trọn một đòn trùm vùng ba (150–195 gốc, ~50–60% máu). Nay đòn quái thường (~15–20% máu) vẫn bị chặn trọn. Đòn to hơn thì khiên vỡ (chữ "Khiên vỡ!") và phần vượt vẫn trúng; Thuỷ triều vẫn kích. |
| Khí thế, Ám sát, Bóng lướt, Giáp bạc, Phản đòn, Nhựa rừng, Gai độc, Bẫy dây leo, Sóng dội | giữ | Có giới hạn sẵn: mỗi ải 1 lần, hồi 4 giây, đòn đầu sau lộn, 10%, phải lộn đúng lúc, phải đứng yên, 1 lớp độc… |
| Cây kỹ năng (Công / Thủ / Hệ) | giữ | Cấp 40 có 13 điểm cho 15 nút: phải chọn, không học hết được. Engine nay kẹp mỗi nhánh theo số nút thật. |
| Chưởng (`G.CHUONG`) | giữ | Mỗi điểm chỉ +0,4% Sức mạnh. Ba cây đã cân ở phiên trước (lệch nhau ±25%). |

Mô tả trong khung nâng bộ tự đổi theo số mới. Đã thêm bản tiếng Anh.

### 4. Hệ thống nâng cấp

| Hằng số | Cũ → mới | Lý do |
|---|---|---|
| Giá nâng vũ khí `G.VK_MOI.gia` | 60 / 340 / 500 → **100 / 400 / 800** (cộng dồn 100 / 500 / 1.300) | Linh khí nay là một túi chung, lại có thêm thưởng thay đồ rơi, nên thu ~40–95 linh khí mỗi lượt, gấp 2–3 lần dấu ấn của một vũ khí ở luật cũ. Với giá cũ, Mầm có ngay sau ải 1-1, và món chính Thức tỉnh ngay ở 1-5. |
| Đổi hệ `doiHe` | giữ 20 / 60 / 120 | Đổi hệ để khắc trùm (trùm học kháng hệ) là lối chơi chính, nên để rẻ. |
| Nâng bộ `G.BO_MOI` | vàng 300 / 800 / 1.800 → **500 / 1.500 / 3.000**; thêm **mảnh trùm 0 / 3 / 6** ở cấp 1 / 2 / 3 (mảnh của vùng mở bộ đó; bộ Ninja dùng mảnh Mộc Tinh). Linh khí giữ 80 / 200 / 400 | Vàng dư hàng nghìn từ giữa vùng hai. Mảnh trùm đang vô dụng. Mỗi lần hạ trùm vùng được 3 mảnh, nên cấp 2 nâng được ngay sau lần hạ đầu, còn cấp 3 cần thêm 2 lần hạ trùm (**phải cày lại vùng**). |

Mốc theo mô hình (ải đang chơi lúc đủ linh khí):

| Mốc | Mục tiêu | Trước | Sau |
|---|---|---|---|
| Món chính lên Mầm | sau ~2–3 ải đầu | sau 1-1 | **sau 1-2** |
| Món chính Thành hình | quanh trùm vùng 1 | 1-5 | **1-5** |
| Món chính Thức tỉnh | quanh vùng 2–3 | dồn 1 món: 1-5; nâng 2 món xen kẽ: 2-1 | **dồn: 2-1; xen kẽ: 2-4** (món phụ Thức tỉnh 3-1) |
| Bộ Rừng cấp 1 | ngay sau khi mở bộ | ngay sau 1-5 | **ngay sau 1-5** (lượt 14, mở ở lượt 13) |
| Bộ cấp 3 | phải cày lại vùng | mua được ngay khi đủ linh khí + vàng | **cần 6 mảnh = hạ trùm vùng thêm 2 lần** |

Đường cày và thu nhập: chi tiết từng ải in bằng `node tools/can-bang/tinh.js` (bảng "CHIẾN DỊCH": cấp, Sức mạnh, vũ khí, lò, linh khí, vàng mỗi lượt).
- Linh khí mỗi lượt: ~33–60 ở ải thường, 82–95 ở ải trùm vùng.
- Vàng mỗi lượt: ~180–1.075.

### 5. Kiếm vật phẩm (sau khi bỏ rơi đồ)

Nguồn mỗi lượt, ví dụ ải 1-5 lần đầu:

| Nguồn | Linh khí | Vàng |
|---|---|---|
| Hạ tinh anh | 6 | – |
| Tinh anh thưởng (35%) | 1,4 | 7 |
| Hạ trùm vùng | 24 | – |
| Thưởng trùm vùng | 25 | 410 |
| Rương báu (chọn linh khí) | 9 | – |
| Kết liễu quái đang dính hệ | ~16 | – |
| Quần áo cũ đổi ra vàng | – | 16 |
| Phòng thử thách (1/3 số ải) | – | 27 |

| Chỗ vô dụng / lệch | Sửa |
|---|---|
| **Đá tôi**: chỉ dùng cho Tôi lại, nâng bậc Tím/Vàng, nâng bậc trang phục, mà cả ba đã bỏ ở đợt 1–2 | Bỏ hẳn. Ba sao lần đầu / 15% sau ải thường nay cho **6 quặng** (`G.DA_TOI_QUANG`). Phòng thử thách luôn cho 6 quặng (trước: nửa đá tôi, nửa 6 quặng). Đá tôi trong bản lưu đổi ra quặng (mục A). Bỏ ô đá tôi ở dải tài nguyên làng và ở thẻ Tài nguyên. Quặng là thứ thiếu nhất khi mài, nên chuyển sang quặng là có ích. |
| **Mảnh trùm**: chỉ dùng nâng bậc Vàng (đã bỏ) | Dùng để nâng bộ cấp 2, 3 (mục B4). |
| **Gỗ linh**: chỉ dùng cho lò cấp 2 (6 món), cuối vùng một đã dồn ~170 không tiêu | Mài +5 lên +6 nay tốn gỗ linh (trước tốn vảy cá). Lò cấp 2 mài tới +6, đúng lúc đang ở vùng một. |
| **Vàng dư** (mô hình cũ: dư 7.000 ở đầu vùng hai, 45.000 cuối game) | Nâng bộ đắt hơn (mục B4). Mô hình có mua bộ: cuối game còn dư ~6.000 thay vì 14.700–45.800. Vẫn còn dư, xem mục C. |
| Thẻ Tài nguyên (Hành trang) còn ghi luật cũ | Viết lại chữ "Dùng / Kiếm" theo luật mới, kèm bản tiếng Anh. |
| Rương báu, thương nhân, Bà Hàng Xén, Cô Thợ May | Vẫn có việc: rương cho linh khí / quặng / bùa; thương nhân bán bình, bùa, quặng, nguyên liệu; Bà Hàng Xén đổi vàng lấy nguyên liệu; Cô Thợ May nâng bộ. |
| Vòng cày quá lợi | Không thấy vòng nào lợi bất thường. `G.grindMult` đã giảm kinh nghiệm và vàng khi cày ải quá dễ (linh khí không giảm). Cày lại ải trùm vùng cho nhiều linh khí nhất (~95 mỗi lượt, lần đầu được thêm 25), và đó là chỗ người chơi phải cày để lấy mảnh. |

## C. Còn lại / nên xem khi chạy thử
- **Chưa chạy game.** Mọi số trên là kỳ vọng của mô hình. Phần "kết liễu quái dính hệ" ước 10% số quái khi còn Trắng và 35% khi đã có hệ. Nên chạy bot cân bằng (`tests/cay.py`, `tests/campaign.py`) để đo lại `G.STAGE_REC` với máu mới và giá linh khí mới.
- **Cần thử tay:**
  - Mở bản lưu cũ: xem câu báo ở làng, vàng / linh khí / quặng hoàn lại, 4 vũ khí đúng cấp, bộ đúng.
  - Tải bản mây cũ.
  - Chơi tiếp lượt ải dở.
  - Nâng bộ cấp 2 (cần mảnh trùm).
  - Khiên nước đỡ đòn trùm (khiên vỡ, phần vượt vẫn trúng).
  - Phân thân hồi 4 giây.
- **Hoàn bù đợt 1** chỉ làm được trên máy còn bản sao gốc `linhkhi_save_v1_truoc_he_moi`. Máy khác (chỉ có bản mây) không hoàn bù được.
- Vàng vẫn dư nhẹ ở cuối game. Nếu muốn tiêu hết, có thể cho Bà Hàng Xén bán quặng (thêm giao diện, đợt này chưa làm).
- Một số câu gợi ý trong `G.HINTS` (data.js) và trang Cụ Đồ vẫn nói về bậc màu và dấu ấn của luật cũ. Đợt này chưa sửa vì sẽ mất bản dịch tiếng Anh sẵn có.
