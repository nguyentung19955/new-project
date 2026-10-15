# Báo cáo: viền vũ khí theo bậc ép đồ + ánh theo cấp mài (15/10)

Commit: `3fc2256d` trên nhánh `khoi-tao-du-an`. Không đụng master, không PR, không force push. Không sửa `cloud.js`, `cloud_ui.js`, `firebase-config.js` (đăng nhập Google, lưu mây, `?cloud=0` giữ nguyên). Không chép apiKey.

## Đã làm

| Mục YEU-CAU | Làm thế nào | Tệp |
|---|---|---|
| 1. Viền + hào quang trên tay | `G.vienVk.truoc/sau` gọi trong `veVk` (mọi hàng có vũ khí: đứng, đi, chạy, chém, phi tiêu đang cầm). Vẽ trong cùng hệ toạ độ đã xoay/lật/thu của ảnh vũ khí nên theo vũ khí như ảnh gốc | `js/zed_moi.js`, `js/vien_vk.js` |
| Trắng / Lam, Lục / Tím, Vàng / Đỏ / Rực lửa | Không viền / viền 1 điểm ảnh game / + hào quang mờ nhấp nháy nhẹ (alpha 0,62 ± 0,22, ~0,5 nhịp/s) / + 5 đốm sáng bay quanh lưỡi / + 6 đốm sáng và 10 đốm lửa vàng-cam chạy dọc mép trên-dưới vũ khí (cùng màu, nhịp 0,35 của `E.vien` bậc tối đa) | `js/vien_vk.js` |
| Dựng sẵn, đúng nét pixel | Mặt nạ dựng 1 lần cho mỗi (ô ảnh loại+cấp, cỡ điểm ảnh game): thu ảnh về lưới ≈ 1 điểm ảnh game, cắt ngưỡng alpha, giãn 1 ô (8 hướng) → viền; làm mờ phần giãn 3 lượt → hào quang; nhuộm mỗi bậc một canvas (nhớ lại). Vẽ ra bằng `imageSmoothingEnabled = false`. Ảnh gốc không bị làm mờ. Mặt nạ vũ khí trên tay (4 loại × 4 cấp theo `vk_tl` của tấm thân) dựng sẵn khi ảnh `zed-vk` + `zed-moi` nạp xong, chia mỗi việc một nhịp 16 ms | `js/vien_vk.js` `dungSan` |
| 2. Hình vũ khí trong ô | `VM.icon` (mọi `G.art.weaponIcon`: ô trong trận, Hành trang, bảng ép đồ, Ông Thợ Rèn, bảng Linh khí) vẽ viền/hào quang/ánh như trên tay, ngoài khung ô đã có | `js/vk_moi.js` |
| 3. Ánh mài | Vệt trắng xiên lướt dọc vũ khí trong 0,38 s (12 pha dựng sẵn), chỉ phủ trên thân vũ khí | `js/vien_vk.js` |
| 4. Cờ `?vienvk=0` | `G.VIEN_VK = false` → không vẽ thêm gì, đường vẽ y như trước | `js/data.js` |
| `G.wStage` | Xem mục dưới | `js/combat.js`, `js/linhkhi.js`, `js/stage.js` |
| 5. Ảnh soát | `xem-vien.png`, `xem-vien.gif` (cùng thư mục), chụp bằng `chup_xem_vien.py` | — |

Vệt chém (`vet-chem`) pha màu bậc: mục ghi "có thể", **chưa làm** (giữ vệt theo hệ như cũ, tránh đụng `fx.js`). Phi tiêu ĐANG BAY (đã ném) không có viền — YEU-CAU chỉ nói phi tiêu đang cầm.

## Mốc cấp mài

`G.MAX_SHARPEN = 15` (`js/data.js`). Giữ đúng mốc đã duyệt, nhóm cuối kéo tới hết thang:

- +0..+2: không có ánh
- +3..+5: 1 vệt mỗi 2,5 s
- +6..+8: 1 vệt mỗi 1,6 s
- +9..+15: 2 vệt nối nhau mỗi 1 s; từ +12 vệt sáng hơn (alpha 0,95 thay 0,75) để +12..+15 vẫn khác +9..+11

Bảng mốc ở `G.vienVk.MOC_MAI`.

## Lỗi nghi ngờ `G.wStage` kẹp theo bậc màu cũ

Đã kiểm tra bằng cách nạp `data.js` trong Node: `G.RARITY.map(r => r.maxStage)` = `[3, 3, 3, 3]`, vì `data.js` dòng 119 đặt `G.RARITY[0].maxStage = 3` và các bậc 1–3 vốn là 3. `G.wRar` kẹp vào 0..3, nên phép `Math.min(s, maxStage)` **hiện không chặn gì**. Vũ khí vẫn lên được cấp 2–3, kể cả bản lưu cũ còn `w.rarity`. Kết luận: **không phải lỗi đang xảy ra**, chỉ là chỗ còn dựa vào bậc màu cũ đã bỏ. Nếu ai đổi lại bảng `G.RARITY` thì lỗi sẽ xuất hiện.

Đã bỏ kẹp: `G.wStage` tính cấp thẳng từ dấu ấn hệ chính. `LK.info` (`linhkhi.js`) và `markInfo` (`stage.js`) dùng mức trần 3 cố định. Kết quả không đổi với mọi bản lưu, kể cả bản cũ (không vũ khí nào nhảy hay tụt cấp), vì trước đây trần cũng luôn là 3.

## Hiệu năng

Không có công cụ đo hiệu năng trong trận chạy được mà không chơi game, nên đo bằng vi đo trong `chup_xem_vien.py`. Script gọi `G.art.hero` (Zed cầm kiếm Thức tỉnh) 3.000 lần trên Chromium không giao diện, dựng hình bằng phần mềm (không GPU), sau khi đã làm nóng bộ nhớ đệm. Kết quả tính bằng µs cho mỗi lần vẽ:

| Trường hợp | µs/lần |
|---|---|
| `?vienvk=0`, Trắng | 40 |
| Trắng +0 (bật, không có gì để vẽ) | 45 |
| Xanh lam (viền) | 75 |
| Tím (viền + hào quang) | 121 |
| Rực lửa +12 (đủ mọi thứ) | 187 |
| `?vienvk=0`, Rực lửa +12 | 40 |

Trường hợp nặng nhất thêm khoảng 0,15 ms mỗi khung cho nhân vật (khung 16,7 ms ≈ 0,9%). Mỗi khung không tính lại gì, chỉ có 1–3 `drawImage` cộng tối đa 16 ô vuông. Sau khi vẽ đủ 4 loại và các ô, tổng cộng có 17 mặt nạ. Máy có GPU sẽ nhẹ hơn.

## Kiểm tra (KHÔNG test game)

- `node --check` mọi `game/js/*.js`: đạt.
- `python3 build.py`: đạt (25,15 MB / trần 30 MB). Sau khi rebase lên commit mới của phiên khác, đã build lại; chỉ dấu phiên bản build thay đổi nên không commit lại `dist`.
- Ảnh soát tĩnh: script nạp `dist/linh-khi.html?cloud=0` (file://) chỉ để lấy hàm vẽ rồi vẽ ra canvas riêng, không chơi game. `G.zedMoi.loi` rỗng, không có lỗi trang. Lỗi duy nhất trong console là tải phông Google qua proxy (môi trường, không liên quan).
  - `xem-vien.png`: Zed cầm 4 loại × 7 bậc (cấp hình đổi theo cột cho dễ nhìn: Trắng/Lam = Trắng, Lục/Tím = Mầm, Vàng/Đỏ = Thành hình, Rực lửa = Thức tỉnh), kèm ô vũ khí 7 bậc (kiếm, phi tiêu).
  - `xem-vien.gif`: ánh mài theo thời gian từ 0 đến 2,5 s, mài +0/+2/+3/+6/+9/+12/+15, trên tay (kiếm Trắng) và trong ô (thương Vàng).

## Nên xem thêm khi chơi thật

- Hào quang Vàng/Đỏ/Rực lửa trên thương dài khá nổi. Nếu thấy chói, giảm hệ số `* 200` (độ đậm hào quang) hoặc `0.62` (alpha nền) trong `js/vien_vk.js`.
- Phi tiêu đang cầm rất nhỏ (~4 điểm ảnh), viền 1 điểm ảnh làm nó to lên thấy rõ. Đây là chủ ý để nhìn ra bậc.
