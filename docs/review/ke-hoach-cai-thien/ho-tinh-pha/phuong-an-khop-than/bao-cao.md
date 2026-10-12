# Phương án B — Hồ Tinh pha 2, pha 3 "khớp thân pha 1" (CHƯA đưa vào game)

> Một lượt chạy song song của cùng phiên đã nhập pha 2, 3 và đẩy lên trước (commit d2f7865, báo cáo ở thư mục cha). Lượt này **không ghi đè**; để đây làm phương án thay.
> Khác chính: pha 3 ở bản đang chạy có thân cáo nhỏ hơn pha 1 ~10–15% (báo cáo cha tự ghi). Bản này đo tỉ lệ bằng cách chồng hình bóng cho chân, thân khớp pha 1 → **thân cáo 3 pha cùng cỡ**, đổi lại đỉnh ngọn lửa/khí bị cắt nhiều hơn (làm mờ dần, không cắt phẳng).
> Muốn dùng: chép `hoTinh-p2.sprite.json`, `hoTinh-p3.sprite.json` ở thư mục này vào `game/art/custom/`, chạy `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep` (hai tệp này nhẹ hơn bản đang chạy ~0,02 MB, không vượt trần). Ảnh trong game ở dưới chụp với bản này.

Ảnh gốc: `docs/anh-goc/2026-10-12/hoTinh-pha2.png` (mắt tím, khí lam tím), `hoTinh-pha3.png` (hoá cuồng, lửa cam).
Tệp: `hoTinh-p2.sprite.json`, `hoTinh-p3.sprite.json` trong thư mục này. Không đụng `hoTinh.sprite.json` (pha 1 của phiên Nhập ảnh 12/10).

## Cách cắt
- Thử trang `tools/tach-quai` đúng như dặn (mục "Hồ Tinh · pha 2 / pha 3", nạp ảnh vào `#chonAnh`, `#locDom` trang tự tắt cho nền xanh, xuất bằng `taoTep()`): trang nhận đúng lưới (7×4 và 8×4) nhưng **cắt mất chân và tạo mảng vuông** (vệt lửa dưới chân bị coi là đường kẻ lưới, thân bị cắt theo ô), còn ~3–5% điểm ám xanh lá. Giống hệt lỗi phiên pha 1 gặp, nên **không nhận bản đó**.
- Cắt theo vạch kẻ thật bằng `kiem/cat_pha.py`, **cùng cách và cùng phép biến đổi với pha 1** (`nhap-anh-12-10/kiem/hotinh.py`): xoá nền xanh, viền ám xanh → màu viền, lấp lỗ nhỏ kín bằng màu điểm ảnh lân cận (pha 2: 1 457 điểm, pha 3: 1 749 điểm), viền 1 điểm như pha 1.
- Chân, móng, đuôi đủ (không còn mảng vuông, không thủng). Không còn điểm xanh lá.

## Số khung (lưới dáng pha 4 hàng)
| | đứng | lấy đà | tấn công | trúng đòn |
|---|---|---|---|---|
| Pha 2 (ảnh 7 cột) | 6 | 4 | **5** (ảnh chỉ có 5; game chia thời gian theo số khung nên để 5, không lặp khung giả) | 4 |
| Pha 3 (ảnh 8 cột) | 6 | 4 (5 → bỏ khung 3, giống khung 2 nhất) | 6 | 4 (5 → bỏ khung 3, giống khung 4 nhất) |

## Cỡ và chỗ đứng trùng pha 1
- Cả hai tệp: khung 208×128, nét ×2, chân [104, 124], rong 177, cao 119 — y như pha 1.
- ChatGPT vẽ con cáo ở ba tấm với cỡ khác nhau (ô pha 2 to hơn). Tỉ lệ = tỉ lệ pha 1 × K, K đo bằng cách chồng hình bóng lên pha 1 cho chân, thân khớp: pha 2 K = 0,84, pha 3 K = 0,86. Ảnh chồng hình: `chong-hinh-bong-3-pha.png` (trắng = trùng; trái pha 1 đỏ + pha 2 xanh, phải pha 1 đỏ + pha 3 vàng; vạch xanh = điểm chân).
- Khí (pha 2) và lửa, lông dựng (pha 3) cao hơn ô 128: phần nhô quá mép trên bị cắt; để không thành vệt phẳng, dải 12 điểm sát mép trên mờ dần kiểu lửa tan. Nếu muốn giữ trọn ngọn lửa thì cần nới ô (đổi cỡ khung) — chưa làm vì phải trùng pha 1.

## Dung lượng
- Ảnh lưu PNG bảng màu (65 màu) thay RGBA: hai tệp chỉ 0,37 + 0,38 MB.
- `python3 game/build.py`: chạy được. `LK_HAI_TEP=1 python3 game/build.py --hai-tep`: **25,91 MB / trần 26 MB** (còn 0,09 MB, sau khi gộp các phiên khác). Cảnh báo tệp đầu 5,05 MB có từ trước (không do hai tệp này, chúng thuộc phần tải sau).

## Kiểm trong game (`kiem/kiem_game.py`, bản `game/dist/linh-khi.html?cloud=0`)
- Phòng trùm Lâu đài cổ 5, hạ máu 60% rồi 30%: `pha-1-trong-game.png`, `pha-2-trong-game.png`, `pha-3-trong-game.png`, GIF chuyển pha `chuyen-pha.gif` (274 KB).
- Chuyển pha: chớp trắng che lúc đổi dáng, con cáo không nhảy cỡ, chân vẫn trên bóng. 0 pageerror.
