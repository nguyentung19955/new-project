# Sửa 3 lỗi ở làng (15/10)

Ảnh soát tĩnh trước/sau: `xem-truoc.png` (chụp bằng Playwright ở chế độ không giao diện, ảnh tĩnh, không chơi thử). Ảnh chủ game gửi: `anh-chu-nhan-len-do.png`.

## 1. Cụ Đồ mất mặt

**Nguyên nhân.** Cảnh làng và bảng Cụ Đồ vẫn vẽ đủ mặt; chỗ mất mặt là **ô tròn của Cụ ở dải lối tắt** (ô "Kỹ năng"). Hàm `vungMat` (js/sprite_custom.js) tự dò ô mặt theo một cách chung cho mọi người làng: lấy 45% chiều cao hình tính từ đỉnh đầu, rồi căn giữa theo bề ngang phần đó. Cụ Đồ **ngồi**, nên đầu chiếm gần nửa hình, và đuôi khăn dài phía sau kéo bề ngang lệch sang trái. Vì thế ô cắt chỉ lấy mũ cùng nửa trên khuôn mặt, mặt lệch xuống góc phải và bị vòng tròn cắt mất mắt, mũi, râu. Ảnh gốc và khung cắt (`-tay.json`) đều đúng, không phải lỗi cắt ảnh.

**Đã sửa.**
- `nl-do.sprite.json` có thêm trường `"vung_mat": [12, 1, 17]`, tức ô mặt ghi tay theo điểm game trong khung đứng thở đầu.
- `js/sprite_custom.js` đọc trường này: có thì dùng ô ghi tay, không có thì tự dò như cũ. Sáu người làng còn lại không đổi.
- `game/build.py` thêm `vung_mat` vào RUNTIME_KEYS để khi đóng gói không bị bỏ.

## 2. Bà Hàng Xén thừa gánh sau lưng

**Nguyên nhân.** Hình bà (`nl-xen`) đã tự gánh một đôi quang gánh. Ảnh sạp `gd-lang-hang-xen` (dù, rương, bàn hàng) lại vẽ thêm một đòn gánh và hai thúng ở bên trái. Ảnh sạp nằm ngay sau chỗ bà đứng, nên thành ra bà có thêm một gánh thừa sau lưng.

**Đã sửa.** Xoá phần đòn gánh và hai thúng (1.830 điểm ảnh, phần bên trái cột dù và dưới tán dù) trong ảnh của `gd-lang-hang-xen.sprite.json`. Cỡ ảnh giữ nguyên 72×55, nên chỗ đặt (giữa đáy ảnh) không đổi. Dù, rương, bàn hàng giữ nguyên, dáng người của bà không đụng tới. Vùng không đi được (RECTS) không đổi. Hình vẽ bằng code của sạp chỉ dùng khi thiếu ảnh, cũng không đổi.

## 3. Chữ nút "Lên đò" sát viền

**Nguyên nhân.** Nút dùng ảnh `gd-nut-chinh`. `T.datChu` đặt chữ theo bảng lòng LONG_BANG, tức là cả dải đỏ. Ở giữa nút, dải đỏ chạy tới tận dưới hai nút thắt hoa văn hai đầu, nên chữ cỡ 11 được phép tràn sát hoặc đè lên hoa văn. "Set sail" bị đè rõ hơn.

**Đã sửa.**
- `js/ui_theme.js`: `T.datChu` có thêm tuỳ chọn `trongVien`. Khi bật, chữ chỉ được đặt trong lòng **trừ viền `vien`** của ảnh gd-* (gd-nut-chinh: 9/13/9/13), tự thu cỡ cho vừa và căn giữa. Nếu lòng trong viền quá nhỏ (cao dưới 9 hoặc rộng dưới 18) thì vẫn đặt như cũ. `T.btn` truyền tuỳ chọn này xuống.
- `js/village.js` bật `trongVien` cho các nút lớn ở làng: **Lên đò / Set sail / Đang tải…**, nút việc ở lò rèn (`actBtn`: Mài / Linh khí… có dòng phụ) và **Nâng lò**.
- Cùng thẻ ải: ở tiếng Anh, dòng "Mini-boss … · 8 rooms · Poison" dài và lấn vào dưới nút. Giờ dòng này tự xuống cỡ nhỏ cũ 6,5; vẫn dài thì ép ngang cho vừa, không cắt chữ.
- Nút nhỏ (`T.sbtn`) và các nút ở chỗ khác không đổi.

Ghi chú: nút việc ở lò rèn có hai dòng (tên + dòng phụ), nên khi nằm gọn trong viền thì chữ nhỏ hơn trước. Ảnh soát ở dòng 3c.

## Kiểm

- `node --check` toàn bộ `game/js/*.js`: đạt.
- `python3 game/build.py`: đạt (đã đóng gói lại dist sau khi rebase).
- Ảnh soát tĩnh `xem-truoc.png`: ô mặt Cụ Đồ, sạp Bà Hàng Xén, nút Lên đò tiếng Việt và Set sail tiếng Anh, nút lò rèn và Nâng lò (VI/EN). Trang không báo lỗi.
- Không đổi luật chơi hay số liệu. Không đụng đăng nhập Google, lưu mây hay `?cloud=0`.

## Commit

- `f93b7d72`: sửa cả 3 lỗi, kèm ảnh soát (khi rebase đã gộp `vung_mat` cùng các khoá mới `muot_cua`, `muot`, `bo_va` của phiên soát mượt trong build.py).
- Commit kế tiếp: báo cáo này.

## Có cần gen lại ảnh không?

**Không cần.** Cả hai lỗi ảnh đều sửa thẳng trên tệp sprite có sẵn. Chỉ lưu ý một điều: nếu sau này dựng lại `gd-lang-hang-xen` từ ảnh gốc qua công cụ tách làng, thì phải bỏ đòn gánh khỏi ảnh gốc (hoặc xoá lại vùng đó), nếu không gánh thừa sẽ quay lại. Dựng lại `nl-do` thì nhớ giữ trường `vung_mat`.
