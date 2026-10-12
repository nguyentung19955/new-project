# Nhập đòn theo vũ khí Cu Tí, Cu Tèo (12/10/2026)

## Đã làm
- Cắt 2 tấm ChatGPT `docs/anh-goc/2026-10-12/em-be-smith-don.png` (Cu Tí) và `em-be-hunter-don.png` (Cu Tèo) bằng trang `tools/tach-anh-hung` (chạy headless, mục "· Đòn theo vũ khí", cách tách "Tự tìm từng hình", nét gấp đôi, 48 màu, giảm màu "Tự do", tệp xuất bằng `taoTep()` của trang = đúng bản `.sprite.json` gấp đôi mà nút tải tạo ra).
- Trang tự nhận lưới kẻ tối thật: 8 cột × 5 hàng, tách theo từng ô (ảnh Cu Tí có hàng cao không đều vẫn cắt đúng).
- Tệp mới (chỉ 2 tệp, không đụng tệp thân):
  - `game/art/custom/em-be-smith-don.sprite.json` (117 KB)
  - `game/art/custom/em-be-hunter-don.sprite.json` (140 KB)
- Cỡ khớp thân gốc: khung 48×48, chân (24, 45), net 2, cao trung bình các khung đòn 29 (Cu Tí) / 28,5 (Cu Tèo) điểm ảnh game, thân đứng 29.
- Tự kiểm của trang: cả hai **ĐẠT** (đủ 6·6·6·6·6 khung, không sát mép, 2 cột cuối trống, 48 màu).

## Kiểm trong game (`game/dist/linh-khi.html?cloud=0` và bản hai tệp `linh-khi-nhe.html`)
- Thân ghép thêm hàng: `atk_sword@7 atk_bow@8 atk_spear@9 atk_hammer@10 cast@11` (6 khung mỗi hàng) ở cả Cu Tí và Cu Tèo, ở cả bản một tệp và bản hai tệp (tệp -don nằm trong phần ảnh tải sau).
- Đánh kiếm/cung/giáo/búa chọn đúng hàng `atk_<vũ khí>`, ra chưởng chọn hàng `cast`.
- Bảng ảnh (hàng = vũ khí, có và không mặc đồ; cột = khung đòn): `don-smith.png`, `don-hunter.png`. Vũ khí nằm trong nắm tay (game tự đo), nón lá, áo, hồ lô bám theo thân.
- 0 pageerror.
- `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep` chạy được: hai tệp 25,27 MB / trần 26 MB (còn 0,73 MB — **sắp chạm trần**, phiên sau thêm ảnh cần để ý). Tệp đầu 5,07 MB (cảnh báo này có từ trước, tệp -don không nằm trong tệp đầu).

## Ghi chú
- Bảng kiểm dùng hàm `BANG` của `game/tests/don_vk_shots.py`; script dùng lại: `tach.py` (cắt), `kiem.py` (kiểm + chụp) trong thư mục này.
- Còn lại: Cu Lì (-don) do phiên Nhập ảnh 12/10 làm; Cái Bống chưa có ảnh đòn.
- Muốn tắt đòn theo vũ khí: mở game với `?donvk=0`.
