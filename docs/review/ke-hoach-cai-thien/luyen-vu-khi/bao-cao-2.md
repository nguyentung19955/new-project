# Báo cáo phiên 2 — Luyện vũ khí: giao diện (16/10)

Làm "Phiên 2: giao diện" ở mục 5.1 và 5.2 của [THIET-KE.md](THIET-KE.md), nối tiếp [bao-cao-1.md](bao-cao-1.md). **Không đổi luật, không đổi số** (`G.LUYEN` giữ nguyên, trần 5/9/12/13/15, mảnh Hồ Tinh ở cấp 13). Chữ trong khung căn theo cách của phiên [căn chữ](../can-chu-khung/bao-cao.md) (`T.chuTrongKhung` / `T.chuO`).

## Tóm tắt 1 phút

- **Bảng Ông Thợ Rèn › Luyện làm lại** theo khung của phiên Vũ khí C: cột trái 4 ô vũ khí; bên phải là **hình hiện tại ▶ hình mốc kế** (3/6/9/12/15), **thanh tiến độ tới mốc**, dòng **"Lên Lv N: đòn X → Y"** + mốc mở gì, **giá bằng biểu tượng** (thiếu thì số đỏ, bên phải ghi "thiếu 350 vàng"), nút **"Luyện lên N · giá"**, dòng khoá **"Cần 1 mảnh Mộc Tinh — hạ Mộc Tinh ở Rừng già 5"**.
  - Mốc 9 / 15 không đổi dáng: ô bên phải là hình hiện tại trong **khung màu của mốc**, ghi "Tinh luyện" / "Viên mãn".
  - Lên cấp 3: ba nút **Lửa / Độc / Băng** ngay chỗ nút luyện. Cấp 15: ba nút chọn dòng Viên mãn.
- **Số ở góc ô vũ khí là cấp Luyện 1–15** (màu theo khung). Đã soát ô cỡ 20, 32 và ô trong trận 54×35: "12", "15" không tràn.
- **Ăn mừng 3 kiểu:** dài 1,45 s ở cấp 3/6/12 (dùng lại ăn mừng đổi dáng của phiên C), ngắn 0,9 s ở cấp 9/15 (ô bật ra trong khung màu mới + tên hiệu ứng), dải "+1 · đòn +X" 0,5 s ở cấp thường (không chặn chạm).
- **Màn kết quả:** "Kiếm lá đồng Lv 4 → Kiếm răng sói (Lv 6): còn 2 cấp · thiếu 350 vàng" (hoặc "đủ đồ luyện lên 5!", "cần hạ Mộc Tinh").
- **Hành trang › Vũ khí:** bản rút gọn, mỗi vũ khí một hàng (cấp, mốc kế, giá, nút luyện; trong ải chỉ xem).
- **Thanh tài nguyên ở làng còn 3 ô:** vàng, nguyên liệu rèn, linh khí.
- **Bảng báo một lần khi chuyển bản lưu** (thay câu nói của phiên 1): 4 vũ khí với cấp mới, đồ được hoàn, nút "Đã hiểu".
- Thêm: gợi ý trong Sổ (số 1, 7, 9, 10) và thẻ Tài nguyên ở Hành trang nói theo Luyện.
- **VI + EN** đủ chữ (0 chữ chưa dịch). **`?luyen=0`** về giao diện cũ y như trước (đã chụp).
- **Ảnh mới:** chưa cần để chạy. 2 ảnh nên gen (biểu tượng nguyên liệu rèn, nút Ải Rèn) ở mục 4.

---

## 1. Đã làm

Tệp mới **`game/js/luyen_ui.js`** (nạp ngay sau `js/luyen.js`), chỉ lớp giao diện. Mọi hàm trả về bản phiên 1 / bản cũ khi `?luyen=0`.

| Chỗ | Làm gì |
|---|---|
| Ông Thợ Rèn › Luyện | Bảng mới như trên. Dòng ví đầu bảng bằng biểu tượng (vàng, NLR, linh khí). Nút "Đổi hệ · giá" và "Cầm đầu" ở hàng dưới. Nút cao 17–18 để chữ có dấu không chạm viền (theo đề xuất của báo cáo căn chữ). |
| Số góc ô 1–15 | `js/ep_do.js` `E.soBac` nhận thêm số muốn ghi (2 chữ số thì chữ nhỏ hơn 0,5); `js/vk_moi.js` `VM.icon` ghi cấp Luyện, cả cấp 1–2. |
| Ăn mừng | Bọc `G.luyen.nang`: chỉ chạy khi luyện ở làng, trên bản lưu thật. Dài: `G.hinhThai.am` của phiên C. Ngắn và "+1": vẽ trên lớp giao diện, ngắn thì chạm để bỏ qua. |
| Màn kết quả | Bọc `VM.ketQua`: dòng 2 là tiến độ món đang cầm tới mốc kế + thanh mảnh. |
| Hành trang › Vũ khí | `G.luyen.panel` không có chiều cao → bản rút gọn 4 hàng. |
| Hành trang › Tài nguyên | Ô "Quặng" thành "Nguyên liệu rèn"; chữ "dùng / kiếm" của vàng, nguyên liệu vùng, mảnh trùm theo Luyện (`js/hanh_trang.js`). |
| Thanh làng | `villageScene.resParts` còn 3 ô. Biểu tượng `nlr` mượn ảnh quặng, `lk` là viên linh khí (thêm vào `T.resIcon` / `T.resName`, chạm vào hiện tên). |
| Bảng báo | `G.luyen.bao` mở bảng thay câu nói; chặn chạm tới khi bấm "Đã hiểu". |
| Gợi ý nâng cấp / bảng thua | Mục "Luyện X lên N" (phiên 1 đã có) — đã chụp bảng thua để soát. |
| Sổ | `G.HINTS` số 1, 7, 9, 10 đổi câu khi Luyện bật. |

## 2. Ảnh soát (không chơi thử, chụp tĩnh)

Thư mục [`anh-phien-2/`](anh-phien-2/), tạo bằng `python3 game/tests/luyen2_shots.py` (chạy `python3 game/build.py` trước). Mỗi cảnh có bản `vi-` và `en-`:

- Thợ Rèn: `ren-cap2` (lên Mầm, chọn hệ), `ren-cap5-khoa-tran` (chưa hạ Mộc Tinh), `ren-cap5-thieu-manh` (đã hạ nhưng hết mảnh), `ren-cap8` (mốc 9 Tinh luyện), `ren-cap14`, `ren-cap15` (dòng Viên mãn).
- Ăn mừng: `an-mung-dai-cap6`, `an-mung-ngan-cap9`, `an-mung-1-cap7`.
- `hanh-trang`, `hanh-trang-tai-nguyen`, `thanh-lang`, `bao-chuyen`, `ket-qua`, `bang-thua`, `hud-trong-ai`, `o-trong-tran-phong-to` (ô 54×35 phóng ×3), `o-co-20-va-32-phong-to.jpg` (cấp 1/2/5/9/12/15).
- Màn điện thoại ngang 844×390: `dien-thoai-ngang-ren-cap8`.
- `?luyen=0`: `vi-luyen0-ren` (4 thẻ cũ), `vi-luyen0-thanh-lang` (thanh 8 ô cũ).

**Đo chữ trong khung** bằng công cụ của phiên căn chữ (`can-chu-khung/cong-cu/do-can-chu.py`, thêm 9 cảnh Luyện ở bản chép tạm), 844×390 / 667×375 / 1280×720, VI + EN: bảng Luyện **không còn chữ lệch tâm, không cắt "…"**. Còn:
- nút "Luyện lên 6 · 500" khi bị khoá: biểu tượng đồng vàng sát mép trên lòng nút 0,05 điểm (mắt không thấy);
- bảng báo: công cụ đếm "chữ đè chữ" với dải "Mở mới: …" của làng nằm **dưới** bảng (bảng che kín dải, không phải lỗi thật).

## 3. Kiểm

| Bài | Kết quả |
|---|---|
| `node --check` mọi `game/js/*.js` | Đạt |
| `python3 game/build.py`, `--hai-tep` | Đạt |
| `node game/tests/luyen.test.js` | **PASS 88 điều kiện** (81 cũ + 7 mới: ăn mừng 3 kiểu đúng cấp và thời gian, thanh làng 3 ô, dòng kết quả, dòng khoá, gợi ý, bảng báo mở / đóng, `?luyen=0` như cũ). Bài bấm nút nay bấm theo vị trí bảng ghi lại (`G.luyen.ui.nut`). |
| `python3 game/tests/luyen_may.py` (lưu mây giả, Google, `?cloud=0`) | PASS 10/10 |
| `node game/tests/cloud_save_regression.test.js` | PASS |
| `python3 game/tests/smoke.py` | Không lỗi |
| `luyen2_shots.py` | 0 chữ chưa dịch, 0 chữ cắt "…", 0 lỗi console |

Không đụng đăng nhập Google, lưu mây, `?cloud=0`.

## 4. Ảnh cần gen (đang dùng ảnh mượn, game chạy được)

Ảnh mẫu gửi kèm ở [`anh-phien-2/mau-gen/`](anh-phien-2/mau-gen/). Gen xong đặt đúng mã là game tự dùng (không phải sửa code).

| Mã ảnh | Đang mượn | Cỡ đích | Prompt |
|---|---|---|---|
| `vp-nlr` (vật phẩm, biểu tượng Nguyên liệu rèn) | `vp-ore` (quặng) — mẫu `mau-vp-ore.png` | 17×18 điểm game, ảnh gốc ×2 = 34×36 | *pixel art game item icon, a small bundle of forge materials: an iron ingot, a chunk of ore and a glowing ember tied with rope, dark outline, warm metal colors, 3/4 view, centered, flat solid #00FF00 background, no text, 34×36 px* |
| `gd-ai-ngay-ren` (nút Ải Rèn ở bảng Ải ngày) | `gd-ai-ngay-mai` (Ải Đá Mài) — mẫu `mau-gd-ai-ngay-mai.png` | 32×32 điểm game, ảnh gốc ×2 = 64×64 | *pixel art round game button icon, a blacksmith anvil with a hammer striking glowing hot metal and sparks, bronze frame matching the sample, centered, flat solid #00FF00 background, no text, 64×64 px* |

Ghi chú: nút Ải Rèn đọc ảnh ở `js/ai_ngay.js` (dòng `loai === 'ren' ? 'mai' : loai`): khi có `gd-ai-ngay-ren` thì đổi chữ `'mai'` thành `'ren'` (1 chữ).

## 5. Cần biết

- **Nút chọn dòng Viên mãn** ghi ngắn ("Chí mạng / Trùm / Hồi chiêu") cho vừa nút; dòng đã chọn ghi đủ ngay trên ("Đã chọn dòng: Trùm, tinh anh +16%").
- **Ô vũ khí bên trái** bỏ thanh tiến độ nhỏ (để khối tên + cấp nằm giữa ô theo luật căn chữ); thanh tiến độ tới mốc ở thẻ bên phải. Dấu "luyện được" là tam giác xanh.
- **Hành trang** vẫn luyện được (nút "Luyện lên N"); lên Mầm cần chọn hệ thì ghi "Đến Ông Thợ Rèn để chọn hệ".
- Ăn mừng **chỉ ở làng**. Gợi ý nâng cấp tự luyện (`G.upg`) không bật ăn mừng khi chạy trên bản sao.
- Chưa làm (để phiên 3 / phiên dọn): 12 ảnh "gân" tiến độ 25/50% (bao-cao-C mục 4), dọn ảnh không dùng (`gd-da-nang-bac`, `gd-bua-giu-bac`...).

## 6. Tệp

- Mới: `game/js/luyen_ui.js`, `game/tests/luyen2_shots.py`, ảnh `anh-phien-2/`.
- Sửa: `game/index.html` (nạp `luyen_ui.js`), `game/js/ep_do.js` (`E.soBac`), `game/js/vk_moi.js` (`VM.icon` ghi cấp Luyện), `game/js/hanh_trang.js` (thẻ Tài nguyên), `game/tests/luyen.test.js`; `game/dist` dựng lại.
