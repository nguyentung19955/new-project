# Rà soát ụ KHÔNG BẮN (09/11)

Yêu cầu người dùng: "Cổng Ấp Nở là tướng không có dame nên sẽ không bắn được nhé, nhớ như vậy" + "Check cả các ụ tương tự như này".
Lỗi gốc: trang ụ Cổng Ấp Nở ghi Sát thương "—", Tốc bắn "—", Mục tiêu "Không bắn" nhưng Tầm bắn "Toàn đường đi".

## Cách lọc
`SKILLS[id].dmg = 0` và có trong roster → 29 ụ. Trong đó:
- **25 ụ không bắn thật** (`upKhongBan(id)` trong `thap/js/unitpage.js`): không có đòn bắn, không gây sát thương.
- **4 ụ dmg 0 nhưng vẫn nhắm quái trên đường** (giữ "Toàn đường đi"): Băng (đóng băng quái đầu), Độc (đánh dấu quái đầu),
  Bom Hẹn Giờ (gắn bom quái ngẫu nhiên), Vệ Tinh (không bắn thường; ghép Vệ Tinh → thức tỉnh thả bom = sát thương theo thiết kế).
  Vệ Tinh đổi Mục tiêu "Không bắn" → "Kiểu riêng", vì tầm đường đi + "Không bắn" mâu thuẫn nhau.
- Các ụ người dùng nêu nhưng **có sát thương** (bắn thật, không thuộc nhóm): Máy Nhân Mana (dmg 6.23), Tháp Ánh Sáng (12), Mạch Máu (22), Thác Mana (20).

## Logic (a)
Chặn ở gốc: `game.js capNhatU` → `if (!sk.dmg) return;` (không có đường bắn nào khác gọi `sk.ban`). `dmgU()` nhân `sk.dmg` = 0, nên mọi buff
(Ép Xung, tăng tốc, Kẹp Phá, chỉ huy +ST, Cuồng nộ ×2, Mimic, bản sao Copycat, mốc sao) vẫn ra 0. Chỉ huy (chihuy*.js) chỉ cộng `buf.dmg` và không tự đánh.
Đã kiểm bằng trận thật trong trình duyệt (`tools/thap-kt-u-khong-ban.js`): 25 ụ × Solo/PVP/Co-op × {trơn 1/4/7★, buff dồn 1/4/7★, ghép cùng loại,
Wild Link, Mimic, Copycat} → **0 sát thương ghi cho ụ không bắn**. Không phải sửa logic.

## Bảng kết quả
Tầm/Vùng = ô "Tầm bắn" (ụ Đặc biệt) hoặc ô "Tăng" (ụ Hỗ trợ), kèm dòng "Tầm với" ở bảng chi tiết.

| Ụ | Bậc | Không bắn? | Vùng | Trước | Sau | Logic |
|---|---|---|---|---|---|---|
| congap Cổng Ấp Nở | Vàng | ✓ | không (ô trống ngẫu nhiên) | Tầm "Toàn đường đi"; chạm "ST gốc 0" | "—"; chạm "Không bắn" | OK |
| mana Máy Mana | Trắng | ✓ | không | Tăng "4 ô kề", Từ 5★ "Cùng ô"; Tầm với "Toàn đường đi"; chạm "ST gốc 0" | "—" / "—"; chạm "Không bắn" | OK |
| hopbi Hộp Bí Ẩn | Tím | ✓ | không | "Toàn đường đi"; chạm "ST gốc 0" | "—"; chạm "Không bắn" | OK |
| tienhoa Trứng Tiến Hoá | Vàng | ✓ | không | "Toàn đường đi"; chạm "ST gốc 0" | "—"; chạm "Không bắn" | OK |
| loren Đe Rèn | Vàng | ✓ | không (kéo thả) | "Toàn đường đi"; chạm "ST gốc 0" | "—"; chạm "Không bắn" | OK |
| khoisinh Lõi Khởi Sinh | Đỏ | ✓ | 4 ô kề | "Toàn đường đi"; chạm "ST gốc 0" | "4 ô kề"; chạm "Không bắn" | OK |
| radar, phagiap, bua, chimang, tron, lanhgia, khuech, nangsao, tuthan, hasao, lophanung, thaukinh, guongcong | Trắng–Đỏ | ✓ | 4 ô kề | Tăng "4 ô kề" đúng; Tầm với "Toàn đường đi" | Tầm với "4 ô kề" | OK |
| taylo Máy Tẩy Lỗi, khien Máy Khiên | Tím | ✓ | 4 ô kề | như trên + chạm "ST gốc 0" | "4 ô kề"; chạm "Không bắn" | OK |
| thanhdia Thánh Địa | Vàng | ✓ | 4 ô kề (5★ + ô chéo) | Tầm với "Toàn đường đi" | "4 ô kề", Từ 5★ "+ ô chéo" | OK |
| luoicheo Lưới Cộng Hưởng | Vàng | ✓ | 4 ô chéo | Tầm với "Toàn đường đi" | "4 ô chéo" | OK |
| dongbo Pháo Đồng Bộ | Vàng | ✓ | Cả bàn | Tầm với "Toàn đường đi" | "Cả bàn" | OK |
| cauvong Máy Cầu Vồng | Vàng | ✓ | 4 ô kề + vệt trên đường | Tăng "4 ô kề"; Tầm với "Toàn đường đi" | "4 ô kề + đường đi" | OK |
| orbital Vệ Tinh | Vàng | không bắn thường (có bom kỹ năng) | đường đi | Mục tiêu "Không bắn" + "Toàn đường đi" | Mục tiêu "Kiểu riêng" | OK (thiết kế) |
| bang / doc / bomhen | Trắng | nhắm quái, 0 sát thương | đường đi | "Toàn đường đi" | giữ nguyên | OK |

Trong trận: xem nhanh (`hudb.js`) đã ghi "Không bắn" + dòng hỗ trợ, `statThuc` trả `coDmg:false` → không phải sửa.

## Sửa
- `thap/js/unitpage.js`: thêm `upKhongBan` / `upVung`. Ô Tầm bắn, dòng Tầm với và ô "Tăng"/"Từ 5★" giờ ghi vùng thật, không còn "Whole path".
  Vệ Tinh đổi Mục tiêu sang "Own pattern".
- `thap/js/ttgon.js`: bảng chạm ngoài trận của ụ không bắn ghi "Does not shoot" thay "Base damage 0".
- `vi.json` + `ngonngu-vi.js`: "# neighbours + path" → "# ô kề + đường đi".
- Test mới `tools/thap-kt-u-khong-ban.js` (đưa vào `thap-kt-hoiquy.js`): kiểm logic + hiển thị EN/VI. Bản code cũ trượt 66 lỗi, bản sửa đạt.

## Ảnh (390×844, đã xem)
- `ghep-vi.jpg` / `ghep-en.jpg`: trang ụ Cổng Ấp Nở, Lõi Khởi Sinh, Lưới Cộng Hưởng, Máy Mana, Hộp Bí Ẩn, Cầu Vồng.
- `ghep-ban.jpg`: các ụ không bắn trên bàn (thân ụ hiện đủ) + xem nhanh Cổng Ấp Nở "Không bắn".
