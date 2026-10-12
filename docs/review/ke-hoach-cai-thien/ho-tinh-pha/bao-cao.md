# Hồ Tinh pha 2, pha 3 — nhập ảnh ChatGPT 12/10

Ảnh gốc: `docs/anh-goc/2026-10-12/hoTinh-pha2.png` (mắt tím, khí lam tím) và `hoTinh-pha3.png` (hoá cuồng, lửa cam).
Tệp mới trong game: `game/art/custom/hoTinh-p2.sprite.json`, `game/art/custom/hoTinh-p3.sprite.json`. Không đụng `hoTinh.sprite.json` (pha 1 do phiên "Nhập ảnh 12/10" thay, commit 19298e2, đã gộp trước khi so cỡ).

## Kết quả nhìn nhanh
- `pha-1.png`, `pha-2.png`, `pha-3.png`: phòng trùm thật (844×390), hạ máu để game TỰ chuyển pha.
- `chuyen-pha.gif` (152 KB): pha 1 → 2 → 3, có chớp trắng lúc đổi dáng.
- `can-canh.png`: đúng đường vẽ của game, 3 pha × đứng, lấy đà, tấn công, trúng đòn, chạy, chết.
- `hinh-bong-3-pha.png`: 3 pha cạnh nhau và hình bóng chồng lên nhau (đỏ pha 1, lam pha 2, vàng pha 3).

## Định dạng (trùng pha 1)
| | pha 1 | pha 2 | pha 3 |
|---|---|---|---|
| ô | 208×128, nét ×2 | 208×128, nét ×2 | 208×128, nét ×2 |
| điểm chân / cỡ trong game | [104,124] / 177×119 | như pha 1 | như pha 1 |
| khung đứng · lấy đà · tấn công · trúng đòn | 6 · 4 · 6 · 4 | 6 · 4 · 6 · 4 | 6 · 4 · 6 · 4 |
| hàng chạy, chết | có | mượn pha 1 (game tự làm) | mượn pha 1 |

## Số khung
- **Pha 2** (lưới 7 cột): đứng 6, lấy đà 4 đủ. Tấn công chỉ 5 hình → thêm khung 6 bằng cách **giữ lại hình cuối** (vệt chém lớn nhất): 1-2-3-4-5-5. Trang công cụ mặc định lặp hình đầu (1-1-2-3-4-5), làm đòn khựng lúc mở đầu nên đã xếp lại. Trúng đòn 4 đủ.
- **Pha 3** (lưới 8 cột): đứng 6, tấn công 6 đủ. Lấy đà 5 → bỏ hình 3 (gần giống hình 2 và 4), giữ 1-2-4-5. Trúng đòn 5 → bỏ hình 3, giữ 1-2-4-5 (bật lùi → hồi → cúi thấp, cùng nhịp với pha 2).

## Cách cắt
Cắt bằng trang `tools/tach-quai` chạy headless (mục "Hồ Tinh · pha 2 (mắt tím, phân thân) (hoTinh-p2)" / "… pha 3 (hoá cuồng) (hoTinh-p3)"), đưa ảnh vào `#chonAnh`, xuất bằng `taoTep()` của trang. Trang tự tắt "Lọc đốm màu nền" cho nền xanh; tách theo vạch kẻ thật (pha 2: 7 cột × 4 hàng, pha 3: 8 cột × 4 hàng). Nét gấp đôi, 48 màu. Ba chỉnh khi chạy (chỉ trong lần chạy, KHÔNG sửa tệp trang, script ở `cong-cu/tach.py`):
1. **Độ dày nét kẻ tối đa (MONG) = 6 điểm** thay vì 1,5% cạnh ảnh (= 22 điểm ở ảnh 1448). Với 22, trang coi dải lửa mỏng ở chân và đỉnh đuôi là "nét kẻ" rồi xoá: **pha 3 khung đứng 1 mất cả 4 chân**, đầu bị cắt thẳng. Vạch kẻ thật ở hai ảnh này chỉ dày 2–3 điểm. (Đây cũng là lỗi "góc vuông" phiên pha 1 gặp; nếu sửa hẳn trang thì nên cho MONG theo độ dày đo được của nét kẻ.)
2. **Khử viền xanh lá trước khi đưa vào trang** (`cong-cu/prep.py`): điểm ngả lục mạnh (lục > max(đỏ, lam) + 50) về màu nền, ngả nhẹ thì hạ kênh lục. Không có bước này, lửa và khí lam tím viền ~32 000 điểm xanh lá.
3. **Một tỉ lệ chung cho mọi khung** (không thu nhỏ riêng khung cao), để thân cáo không co giãn giữa các khung; phần vượt mép trên ô thì cắt (pha 1 hiện có cũng cắt như vậy). Bị cắt: pha 2 tấn công khung 5, 6 (chóp vệt khí, ≤ 7 điểm game); pha 3 đứng khung 3, 6 (đỉnh ngọn lửa, ≤ 6 điểm game).

Hậu kỳ (`cong-cu/sau.py`): xếp lại khung tấn công pha 2; ~350 điểm còn ám xanh → màu lân cận (còn 0); **lấp lỗ kín nhỏ** (khe nền lọt trong thân, ≤ 15 điểm game; pha 2: 146 lỗ, pha 3: 183 lỗ) bằng màu điểm lân cận như bước "lấp lỗ" đã làm ở pha 1; chân, móng, đuôi đủ (nền xanh lá nên không bị ăn trắng). Lưu PNG **bảng màu** (không mất điểm nào, đã so từng điểm) — nhẹ ~3 lần PNG RGBA: mỗi tệp ~0,4 MB.

## Cỡ: so 3 pha
- Tỉ lệ: pha 2 = 1,23 (trang tự tính 1,16), pha 3 = 1,20 (trang tự tính 1,15). Tăng nhẹ vì pha 1 mới (cắt bằng script, tỉ lệ theo khung đứng) to hơn cách trang tự tính.
- Pha 2 khớp pha 1: mặt nạ ~55×50 điểm (pha 1 ~59×50), đèn lồng bằng nhau, chân cùng chỗ, đỉnh hình bóng cùng tầm.
- Pha 3: đỉnh hình bóng (ngọn lửa) cùng tầm pha 1, chân cùng vạch. **Thân cáo nhỏ hơn pha 1 ~10–15%** vì ChatGPT vẽ pha 3 lông dựng + lửa cao, mà ô phải giữ 208×128 như pha 1; to thêm thì phải cắt cụt lửa nhiều hơn. Lúc chuyển pha thấy lửa bùng lên che việc này, nhưng nhìn kỹ vẫn thấy thân nhỏ hơn một chút.

## Kiểm
- `kiem.py` (cạnh tệp này): vào phòng trùm Lâu đài cổ (Hồ Tinh), pha 1 → hạ máu → game tự chuyển pha 2, pha 3 (b.phase 1, 2). Pha 2, 3 vẽ đứng / lấy đà / tấn công / trúng đòn từ `hoTinh-p2` / `hoTinh-p3`; chạy, chết mượn `hoTinh` (đúng thiết kế phiên E2). **0 pageerror**, 0 lỗi trang. Kết quả: `ket-qua.json`.
- `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep` chạy được. Sau khi gộp các phiên song song: **hai tệp 25,94 MB / trần 26 MB** (hai tệp mới của phiên này +0,79 MB; nếu để PNG RGBA như trang xuất thì +2,2 MB và vượt trần). Tệp đầu 5,06 MB (cảnh báo "nên dưới 5 MB" có từ trước, ảnh trùm nằm ở tệp tải sau nên phiên này không làm tệp đầu nặng thêm).

## Còn lại / gợi ý
- **Gần chạm trần dung lượng (còn 0,06 MB).** Ảnh gốc Mộc Tinh pha 2, 3 mới đã nằm chờ nhập; phiên nhập đó sẽ vượt trần nếu giữ PNG RGBA. Cách rẻ nhất: lưu các tấm trùm/quái hiện có sang PNG bảng màu (không mất điểm nào, như `cong-cu/sau.py`), riêng pha 1 Hồ Tinh (1,3 MB) và 4 tệp pha của Ngư Tinh, Mộc Tinh (~1,1 MB mỗi tệp) sẽ bớt được ~3–4 MB. Việc này thuộc phiên Tải nhanh / đóng gói.
- Pha 3 lúc chạy vẫn mượn hình chạy pha 1 (cáo trắng không lửa). Muốn đều hơn: nhờ ChatGPT vẽ thêm hàng chạy pha 3; game đã đọc sẵn hàng `move` trong tệp pha, không phải sửa code.
- Trang `tools/tach-quai`: nên sửa hẳn MONG (mục 1 ở trên) và cho chọn "giữ hình cuối" khi thiếu khung tấn công.
