# Báo cáo đợt 1: 4 vũ khí cố định, bỏ rơi đồ, nâng cấp bằng linh khí

**Mã commit:** `af3a7e7e` (nhánh `khoi-tao-du-an`)

Làm theo `YEU-CAU-1-VU-KHI.md`. Chỉ kiểm bằng `node --check` (mọi tệp `game/js/*.js` đều qua) và `python3 game/build.py` (chạy xong, đã dựng lại `game/dist`). **Không chạy game, không chạy bài kiểm tra nào.** Không xoá tệp hình. Không sửa `game/js/zed_moi.js` và các tệp `fx*.js`. Không chép apiKey, không đụng đăng nhập Google; `?cloud=0` vẫn chạy như cũ.

## 1. Đã đổi gì (người chơi thấy)

**Vũ khí**
- Luôn có đúng 4 vũ khí: **Kiếm, Thương, Búa, Phi tiêu**, luôn mang cả 4. Nút đổi vũ khí (trong trận) xoay vòng 4 món. Thời gian chờ giữa hai lần đổi giảm từ 1,5 xuống 0,75 giây để xoay 4 món không quá chậm.
- Ô vũ khí góc trên bên phải vẫn có 2 ô: ô trái là món đang cầm, ô phải là món sẽ cầm khi bấm đổi.
- Bỏ bậc màu (Thường/Lam/Tím/Vàng), dòng phụ, dòng mạnh, dòng vũ khí. Tên vũ khí = loại + chữ theo hệ và cấp (ví dụ "Kiếm Than Hồng", "Phi tiêu Băng Đế"). Hình trong ô đồ dùng bộ ảnh `zed-vk` (4 loại × 4 cấp, đúng hình Zed cầm trên tay); ảnh chưa tải xong thì tạm vẽ như cũ.
- **Linh khí** nay là một túi chung (trước là dấu ấn riêng từng vũ khí). Nguồn giữ nguyên: hạ tinh anh +5, trùm nhỏ +10, trùm vùng +20, kết liễu quái đang dính hệ +1 (Zed nhận nhanh hơn 20% như trước). Trong trận: tấm "Linh khí N" thay cho ba vạch hệ (có dấu ▲ xanh khi đủ nâng món đang cầm). Màn kết quả: một dòng "+N linh khí trận này · đang có M".
- Nâng cấp: Trắng → Mầm → Thành hình → Thức tỉnh, bằng linh khí. **Lên Mầm thì chọn hệ Lửa / Độc / Băng.** Đã có hệ thì đổi hệ được (giữ nguyên cấp, tốn linh khí). Đặc trưng hệ ở Thành hình và Thức tỉnh y như trước.
- Chỗ nâng: **Ông Thợ Rèn, thẻ "Linh khí"** (thẻ Nâng bậc và Tôi lại đã bỏ; Mài và Nâng lò giữ nguyên) và **Hành trang › Vũ khí** (trong ải chỉ xem). Có nút **"Cầm đầu"** để chọn món cầm khi vào ải.
- Mài vũ khí (quặng, vàng) vẫn giữ như cũ.

**Không rơi đồ nữa**
- Quái, tinh anh, trùm, rương báu, qua ải không còn rơi vũ khí và quần áo. Thay bằng vàng và/hoặc linh khí (bảng ở mục 3).
- Phòng suối không còn "rương đồ" để đổi vũ khí. Bà Hàng Xén chỉ còn thẻ **Nguyên liệu** (không còn rương vũ khí, mua / bán đồ mặc).

**Trang phục**
- Chỉ còn 4 bộ của Zed: Ninja Bóng Đêm, Thợ Săn Rừng, Chiến Binh Biển, Hiệp Sĩ Lâu Đài. Mở bằng hạ trùm vùng như đang có, đổi bộ ở nút trên hình Zed (Hành trang › Nhân vật).
- Quần áo kiểu cũ (mũ, áo, đồ đeo lưng, bùa, cánh) không dùng nữa: Hành trang bỏ thẻ Trang phục và thẻ Linh khí (cũ); Cô Thợ May nay chỉ có khung nâng bộ.
- **Khung nâng cấp bộ** (Hành trang › Nhân vật, ngay dưới phần Zed; và ở Cô Thợ May): mỗi bộ 3 cấp, nâng riêng, bằng linh khí + vàng. Lưu ở `save.boCap`. Móc rỗng `G.boSkill(bo, cap)` (đang trả `null`) đã gắn vào người chơi lúc dựng trận (`P.bo`, `P.boCap`, `P.boSkill`) để đợt 3 gắn skill. **Đợt này nâng bộ chưa có tác dụng gì** (chờ skill đợt 3).

## 2. Bảng giá

**Nâng vũ khí** (`G.VK_MOI` trong `game/js/data.js`)

| Lên cấp | Linh khí | Cộng dồn | Mở |
|---|---|---|---|
| Trắng → Mầm (chọn hệ) | 60 | 60 | theo hệ, hệ số sát thương ×1,15 |
| Mầm → Thành hình | 340 | 400 | đặc trưng 1 (Vệt cháy / Vũng độc / Gai băng), ×1,35 |
| Thành hình → Thức tỉnh | 500 | 900 | đặc trưng 2 (Nổ lan / Lây độc / Băng vỡ), ×1,6 |

Cộng dồn 60 / 400 / 900 đúng bằng mốc dấu ấn cũ của một vũ khí.

| Đổi hệ khi đang ở | Linh khí |
|---|---|
| Mầm | 20 |
| Thành hình | 60 |
| Thức tỉnh | 120 |

Hệ số sát thương theo cấp tăng từ +8/+18/+30% lên +15/+35/+60% (`G.STAGE_MULT`) để bù hệ số bậc màu đã bỏ (cũ Lam ×1,15 … Vàng ×1,5–1,7).

**Nâng bộ trang phục** (`G.BO_MOI`, giống nhau cho cả 4 bộ)

| Lên cấp | Linh khí | Vàng |
|---|---|---|
| 0 → 1 | 80 | 300 |
| 1 → 2 | 200 | 800 |
| 2 → 3 | 400 | 1.800 |

## 3. Bảng phần thưởng thay đồ rơi (`G.ROI_MOI`)

Quy đổi giá trị: món cũ tính theo giá Bà Hàng Xén mua lại (vũ khí Thường 20, Lam 60, Tím 150, Vàng 400; trang phục 10/30/80/200), **1 linh khí = 4 vàng** (bằng hệ số `G.upg.VAL.lk` đang có). Tỉ lệ rơi giữ nguyên, chỉ đổi thứ rơi ra. Giá trị trung bình mỗi lần (vùng Rừng già / Hang biển / Lâu đài cổ):

| Nguồn | Trước | Giá trị cũ | Nay | Giá trị mới |
|---|---|---|---|---|
| Tinh anh gục (35%) | 1 vũ khí bậc ngẫu nhiên | 12,2 / 16,9 / 22,3 | 20/25/35 vàng + 4/6/8 linh khí | 12,6 / 17,2 / 23,5 |
| Qua ải thường (50%) | 1 vũ khí bậc ngẫu nhiên | 17,4 / 24,1 / 31,8 | 20/25/35 vàng + 4/6/8 linh khí | 18 / 24,5 / 33,5 |
| Trùm vùng lần đầu | 1 vũ khí Vàng | 400 | 300 vàng + 25 linh khí | 400 |
| Trùm vùng đánh lại | Tím (88%) / Vàng (12%) | 180 | 130 vàng + 12 linh khí | 178 |
| Rương báu, lựa chọn "vũ khí mới" | 1 vũ khí bậc ngẫu nhiên | 34,8 / 48,2 / 63,6 | 9/12/16 linh khí | 36 / 48 / 64 |
| Quái thường (1,2%) / tinh anh (12%) rơi đồ mặc | 1 trang phục | 14 / 18,5 / 24 | 14/18/24 vàng | 14 / 18 / 24 |
| Trùm nhỏ (35%) rơi đồ mặc | trang phục Lam trở lên | 30 / 31,5 / 34 | 30/32/35 vàng | 30 / 32 / 35 |
| Trùm vùng rơi đồ mặc | Tím (75%) / Vàng (25%) | 110 | 110 vàng | 110 |
| Bùa cũ của tinh anh | trang phục Lam | 30 | 30 vàng | 30 |

## 4. Chuyển bản lưu cũ (an toàn, một lần)

Nằm ở `game/js/vk_moi.js`, bọc `G.fixSave` (cùng cách `js/linhkhi.js` đang làm; `engine.js` có ghi chú chỉ chỗ). Mọi đường nạp (máy, mây) đều đi qua nên **lưu máy và lưu mây cùng định dạng mới**.
1. Trước khi chuyển, chép **nguyên văn** bản lưu gốc sang khoá `linhkhi_save_v1_truoc_he_moi` (chỉ giữ bản đầu tiên).
2. Mỗi loại vũ khí giữ **món có cấp cao nhất** (cấp tính theo bậc cũ, ví dụ vũ khí Thường đủ dấu ấn vẫn chỉ Thành hình) và **hệ của món đó**; độ mài = mài cao nhất của loại đó. Chưa có loại nào thì nhận món Trắng mới.
3. Hoàn lại:
   - Món giữ: bậc màu cũ hoàn vàng (giá Bà Hàng Xén trừ giá đồ Thường: Lam 40, Tím 130, Vàng 380); dấu ấn vượt mốc cấp đang có thành linh khí (hệ khác tính một nửa).
   - Vũ khí trùng: đủ giá Bà Hàng Xén (20/60/150/400 + 15 mỗi cấp mài, trừ phần mài đã chuyển sang món giữ) + một nửa dấu ấn thành linh khí.
   - Quần áo cũ (kể cả mũ, áo, bùa đời trước): gấp đôi giá Bà Hàng Xén (cánh cộng thêm theo cấp) + 2/5/10/20 linh khí theo bậc.
4. Ghi cờ `heMoi = 1` → không chuyển lần hai. Lần đầu về làng, làng báo một câu số vàng, linh khí được hoàn.
5. Chuyển làm trên bản sao; lỗi giữa chừng thì bản lưu không bị chuyển dở (lần nạp sau thử lại). Mỗi lần nạp vẫn kiểm: đúng 4 vũ khí, sửa số hỏng.

Trường mới trong bản lưu: `heMoi`, `linhKhi`, `vkThu` (thứ tự xoay vòng), `boCap`, `heMoiBao` (dấu báo một lần).

## 5. Cờ `?hethongcu=1`

Chơi lại luật cũ (rơi đồ, nhiều vũ khí, bậc màu, quần áo). Đọc / ghi bản lưu **riêng** `linhkhi_save_v1_hecu`; lần đầu lấy từ bản sao `…_truoc_he_moi` (hoặc bản chính nếu chưa chuyển). **Tắt lưu mây** trong chế độ này để không đè tiến trình hệ mới; lượt ải dở cũng lưu riêng. Bỏ cờ là về hệ mới, bản lưu chính không bị đụng.

## 6. Tệp đã sửa

- Mới: `game/js/vk_moi.js` (luật, bản lưu, thưởng, HUD, bảng nâng vũ khí / bộ, hình zed-vk), `game/js/vk_moi_lang.js` (bảng Cô Thợ May). Thêm vào `game/index.html`.
- Sửa: `data.js` (cờ, bảng số), `engine.js` (khoá bản lưu theo cờ), `combat.js` (xoay vòng, tên, linh khí vũ khí thứ hai), `stage.js` (thưởng thay đồ rơi, rương báu, HUD 2 ô, bỏ rương đổi), `linhkhi.js` (HUD, kết quả), `upgrade.js` (gợi ý nâng cấp), `village.js` (Ông Thợ Rèn, Bà Hàng Xén, Xem vũ khí), `village_scene.js` (chấm đỏ, câu báo), `hanh_trang.js` (thẻ), `cloud.js` (tắt mây khi `?hethongcu=1`), `luu_luot.js` (khoá riêng khi `?hethongcu=1`).
- Dựng lại: `game/dist/*`, `tools/xuong-sprite/*`.

## 7. Cần lưu ý (chưa kiểm vì không được chạy game)

- **Cân bằng chưa đo**: mất chỉ số quần áo cũ (máu, giảm sát thương…) và hệ số bậc màu; mới bù một phần bằng hệ số cấp và tiền hoàn. Nên chạy bot cân bằng / chơi thử trước khi đưa người chơi.
- Bản lưu đã chuyển mà mở bằng bản game CŨ (máy còn đệm bản cũ) rồi nhặt đồ: lần sau mở bản mới, vũ khí thừa bị bỏ (không hoàn), quần áo nhặt thêm nằm yên không dùng.
- Chữ bay "+5 Lửa" khi nhận linh khí vẫn ghi tên hệ (nằm trong `fx.js`, không được sửa đợt này).
- Một số chữ hướng dẫn cũ (trang Linh khí của Cụ Đồ, thẻ Tài nguyên) còn nói về dấu ấn từng vũ khí / nâng bậc; chưa thêm bản tiếng Anh cho chữ mới.
- Đợt 2 (xoá hình cũ) và đợt 3 (skill bộ, gắn vào `G.boSkill`) chưa làm.
