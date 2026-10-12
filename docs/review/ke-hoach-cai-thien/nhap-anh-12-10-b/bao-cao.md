# Nhập ảnh 12/10 (b): trang trí Lâu đài cổ, 9 mũ, 3 đồ lưng, đòn Cái Bống

Ảnh gốc: `docs/anh-goc/2026-10-12/` (trang-tri-lau-dai.png, ve-lai-mu-9.png, ve-lai-do-lung-3.png, em-be-healer-don.png).
Cắt bằng trang công cụ chạy headless (đúng lô, hàm xuất của trang `phanTep` / `taoTep`), độ nét Gấp đôi (net 2). Script dùng lại: `tach_phong.py`, `tach_do.py`, `kiem.py` trong thư mục này (cắt Cái Bống dùng `../don-cu-ti-cu-teo/tach.py healer`).

## 1. Trang trí Lâu đài cổ — 16 tệp `gd-tt-lau-*` (thay tệp cũ, mã như cũ)
- Lô "Trang trí · Lâu đài cổ · 16 hình", 16/16 ô cắt được, 0 lỗi trang.
- Kiểu Việt đã vào game: cửa sổ song gỗ mái ngói (ô 5, mã vẫn `cua-so-kinh`), tượng quan võ đá (ô 6, mã vẫn `tuong-hiep-si`), 2 cờ mặt trời trống đồng, cửa sổ song gỗ nhỏ, thảm tròn hoa văn sao trống đồng, 2 cụm tiền cảnh cột gãy.
- Lửa: giá đuốc (4×11, cũ 5×11) và chân nến (5×15) — game vẫn đặt lửa đúng đỉnh đuốc / đỉnh chân nến (xem `phong-lau-0.png`, `phong-lau-1.png`).
- Cỡ đổi đáng kể: cửa sổ mái ngói 16×17 (cũ 16×25, thấp hơn), tượng 16×32 (cũ 16×22, cao hơn) — nhìn trong phòng vẫn cân.

## 2. Mũ — 9 tệp `tp-hats-*` (nón lá, khăn xếp, mũ rơm, mũ sừng, vòng lá, mũ da cá, khăn đá lửa, mũ vây cá, mũ tai cáo)
- Lô "VẼ LẠI 12/10 · Mũ", 9/9 đúng mã, net 2, cỡ đúng cỡ chuẩn của lô.
- `tp-hats-non_la` là tệp MỚI → game dùng nón lá ảnh thay hình code. `TP_CHINH` tự thôi áp (hệ số co của mọi mũ = 1).
- Đo trong game (đứng, đánh, 4 em bé): mép dưới mũ ở −25…−21, mắt ở −21…−19 → **không che mắt**. Bảng: `mu-9.png` (4 em bé × đứng/chạy/đánh).
- Nhận xét khi nhìn: nón lá, khăn xếp, mũ rơm, vòng lá, khăn đá lửa ôm đầu đẹp. Mũ sừng, mũ vây cá, mũ tai cáo vẫn ngồi trên đỉnh tóc (cao, hơi "hai tầng đầu") nhưng chấp nhận được.
- (Số đo tự động báo "che mắt" ở tư thế lộn và chạy của Cu Tèo/Cu Lì là do điểm mắt khung đó/xoay khi lộn, không phải mũ che — nhìn bảng thấy mắt vẫn lộ.)
- **Nên gen lại mũ da cá**: ChatGPT vẽ con cá trê nguyên con; đội lên thành cục xanh trên đầu, không ra cái mũ. Câu sửa prompt cho ô 6:
  > "Ô 6: MŨ DA CÁ — một chiếc MŨ TRÙM ĐẦU tròn may bằng da cá trê xanh xám, nhìn nghiêng sang phải, có CHỖ HỞ cho mặt ở phía dưới như mũ len; trên đỉnh mũ chỉ có một vây lưng nhỏ, hai râu cá ngắn rủ ở trước trán. KHÔNG vẽ đầu cá, mắt cá, đuôi cá, KHÔNG vẽ con cá nguyên con."

## 3. Đồ đeo lưng — 3 tệp `tp-backs-ao_choang`, `tp-backs-ho_lo`, `tp-backs-trong_nho`
- Lô "VẼ LẠI 12/10 · Đồ đeo lưng", 3/3 đúng mã, net 2: áo choàng 14×15, hồ lô 10×18, trống 12×13.
- Trên 4 em bé đều nhỏ hơn thân, nằm sau lưng (`do-lung-3.png`).

## 4. Đòn theo vũ khí Cái Bống — `game/art/custom/em-be-healer-don.sprite.json`
- Tự kiểm của trang: **ĐẠT** (lưới 8×5, đủ 6·6·6·6·6 khung, khung 48×48, chân (24, 45), net 2, cao TB 29, 48 màu).
- Trong game: thân Cái Bống ghép thêm `atk_sword@7 atk_bow@8 atk_spear@9 atk_hammer@10 cast@11`; kiếm/cung/giáo/búa chọn đúng hàng `atk_<vũ khí>`, chưởng chọn `cast`. Vũ khí nằm trong nắm tay (`don-healer.png`, có và không mặc đồ). Chạy được cả bản một tệp và bản hai tệp.
- **Lưu ý**: lúc nhập, thân mới (bé gái) của Cái Bống CHƯA có trong repo — thân đang dùng vẫn là thân cũ, nên khi đánh Cái Bống đổi sang hình bé gái tóc đen rồi đứng lại thành thân cũ. Khi phiên "Nhập Cái Bống" đưa `em-be-healer.sprite.json` mới vào thì hết lệch (cùng khung 48×48, cùng điểm chân). Nếu cần tắt tạm: `?donvk=0`.

## Kiểm chung
- 0 pageerror (trang công cụ, game bản một tệp, bản hai tệp `linh-khi-nhe.html`).
- `python3 game/build.py` và `LK_HAI_TEP=1 python3 game/build.py --hai-tep` chạy được: hai tệp 25,18 MB / trần 26 MB (còn 0,82 MB). Tệp đầu 5,06 MB (cảnh báo có từ trước).
