# Báo cáo: sửa nhỏ — bật cử động NPC, giãn thẻ ô ải bản đồ — 14/10

Commit: **`e94347e`** (nhánh `khoi-tao-du-an`, nối sau `6f47d46` của phiên ba bạn nhỏ).

Cách kiểm:
- Không chạy game, không Playwright.
- Chỉ chạy `node --check` toàn bộ `game/js/*.js`, `python3 game/build.py --hai-tep` và ảnh soát tĩnh.
- Không đổi số cân bằng.
- Không đụng `firebase-config.js`, đăng nhập Google, lưu mây, `?cloud=0`.

## 1. Cử động NPC (`G.NL_DONG`)
- **`sprite_custom.js`**:
  - Cờ `G.NL_DONG` nay **mặc định bật**.
  - Tắt bằng `?nldong=0` hoặc đặt `G.NL_DONG = false` trước khi nạp. Khi tắt, game như 12/10: đứng yên ở khung đầu hàng đứng.
  - Cờ này viết cùng kiểu với `KHUNG_TRUNG`, `PHAN_THAN_ANH`.
- **Khi cờ bật**:
  - Hàng **đứng** chạy 6 khung, 1,2 s lặp.
  - Hàng **nói** chạy 6 khung, 0,9 s lặp khi em bé lại gần, đang nói chuyện hoặc có bong bóng (`look` ≠ 0 trong `village_scene.js`).
  - Chân dung cạnh bảng (`bigNpc`), Lái Đò trên bản đồ và cảnh truyện (`truyen.js`) luôn dùng hàng nói, như code đã thiết kế.
- **Kết quả grep chỗ dùng cờ**:
  - Chỉ có `SC.veNguoiLang` đọc cờ này.
  - Khung mặt (`vungMat`, dùng cho dải lối tắt và khung thoại) cố ý lấy khung đầu hàng đứng. Đây là ảnh tĩnh nên để nguyên.
  - Hộp chạm, đỉnh đầu (`VS.coAnh` → `topOf`, `halfW`) tính theo cỡ ghi trong tệp (`rong`, `cao`), không phụ thuộc khung.
  - Đường vẽ code cũ (`npcSprite`, thở, chớp mắt) chỉ chạy khi thiếu ảnh. Không chỗ nào còn giả định chỉ có khung đầu.
- **Đo tĩnh 7 tệp `nl-*`** (tâm ngang và đỉnh đầu qua các khung):
  - Chân đứng yên ở mọi khung.
  - Tâm thân lệch ≤ 1,6 điểm. Riêng Thợ Rèn lệch 2,8 điểm vì búa vung.
  - Đỉnh đầu lệch ≤ 2 điểm.
  - Ông Từ không còn thân lệch 8 điểm như lỗi A11 của ảnh cũ.

## 2. Bản đồ chọn ải (`VS.MAP`, nguồn `cong-cu/ban-do-toa-do.json`)
- Đã kiểm hộp bao từng thẻ (thẻ thường 35×34, thẻ trùm 40×41) cùng dòng sao / ⚔ dưới thẻ, tên trùm, nhãn "sắp có", tên vùng và các ô giao diện.
- Trước khi sửa có **8 chỗ chồng**: Lâu đài cổ 4 chỗ, Rừng già 4 chỗ (kể cả thẻ 4 đè nhãn "sắp có" Núi tuyết). Sau khi sửa: **0 chỗ**.
- Thẻ giữ **đúng cỡ**, không phải thu nhỏ.

Toạ độ trước → sau:

| Vùng | Trước | Sau |
|---|---|---|
| Rừng già | (102,172) (126,136) (98,104) (132,74) **trùm** (176,66) | (102,178) (128,138) (98,104) (138,80) **trùm** (180,66) |
| Lâu đài cổ | (312,114) (344,96) (378,78) (406,102) **trùm** (438,80) | (300,112) (336,96) (372,104) (408,92) **trùm** (449,84) |
| Hang biển | không đổi | |

- **Lâu đài cổ** xếp zíc zắc trên cao nguyên và đường đá lên lâu đài:
  - Các thẻ thường cách nhau ngang 36.
  - Thẻ 4 cách thẻ trùm 41.
  - Thẻ trùm vẫn nằm dưới nút "Ải ngày" (đỉnh thẻ 56 > 48).
- `from[2]` (đường vào vùng 3, đi từ trùm Rừng già) dời theo trùm Rừng già, thành (180,66).
- `dung-ban-do.py` có thêm cờ `--soat=<tệp>`. Ảnh soát: **`xem-ban-do-2.png`**. Ảnh cũ `xem-ban-do.png` giữ nguyên để so.

## 3. Dung lượng (`build.py --hai-tep`)
| | Trước | Sau | Trần |
|---|---|---|---|
| Bản một tệp | 21,22 MB | 21,23 MB | 30 |
| Ảnh máy chủ PNG + WebP | 25,68 MB | 25,68 MB | 26 |

## Cần chủ dự án xem khi chơi
1. **NPC cử động**:
   - Xem nhịp đứng 1,2 s có quá "nhún nhảy" không. Lý do 12/10 tắt cờ là vì điều này; ảnh mới chân đứng yên.
   - Hàng nói có tâm thân lệch 1–2 điểm so với hàng đứng (Cụ Đồ, Anh Mõ, Bà Hàng Xén). Khi em bé lại gần, người làng có thể nhích nhẹ.
   - Nếu không ưng thì mở `?nldong=0` để so.
2. **Bản đồ**:
   - Thẻ 1 Lâu đài cổ nay nằm trên bãi cát giữa tranh, xa lâu đài hơn trước.
   - Trùm Hỏa Tinh nằm trên sườn đá dưới cổng lâu đài.
   - Đường nét đứt từ trùm Hang biển lên thẻ 1 vùng 3 ngắn hơn.
   - Em bé và bong bóng "Ải n" đứng trên thẻ đang chọn vẫn có thể che thẻ ngay trên. Chỉ hiện lúc chọn nên không tính là chồng.
