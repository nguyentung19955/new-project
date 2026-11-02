# Báo cáo: đổi toàn bộ chữ trong game sang tiếng Anh (02/11/2026)

## Đã đổi gì
- **Tên game**: "Tiếng Vọng Cuối Cùng" → **The Last Echo** (tiêu đề trang, menu). Mọi trang `<html lang="en">`.
- **Vùng 1** (`game/vung-1/`): menu (Continue / New Game / Keep progress with Google), bảng Rest Bell, màn "Region 1 Complete",
  dòng phím, màn xoay ngang, nút Map / Rest at Bell, HUD, bia chỉ đường P05 ("Broken Bells 1/3 · 2 missing · ← Broken Bell Hall"),
  chữ "↑ Rest at the Rest Bell", bản đồ, tên trùm trên thanh máu, mọi thông báo nhặt đồ / cổng rễ / cửa trùm / chết / hồi máu.
- **Tên phòng**: sửa trong `cong-cu-man/dung-phong.py` rồi chạy lại để sinh `phong/*.json` + `ban-do.json` (không sửa tay JSON); `kiem-tra.py` không lỗi.
- **Quái / trùm / cấp kiếm** (`game/thu-mat-na/*.json`), lý do không hồi máu (`dong-co-mn.js`).
- **Phòng demo**, **trang chọn game/**, **Làng Chuông** (trang chờ), **lưu mây** (`luu-may.js`: dòng trạng thái),
  **hệ thống đồ** (bảng "Silver Strings", Sigil, độ hiếm), **bí mật / Echo Journal / thành tựu**, **trạm dịch chuyển** (`tram-dich-chuyen.json`), `the-gioi.json`.
- Không đổi tên biến / hàm / file / khoá dữ liệu / khoá localStorage, không đổi chú thích code, không đổi lối chơi, không đổi hình.

## Bảng tên
Toàn bộ ở **docs/tieng-anh/BANG-DOI-CHIEU.md**. Tên nhân vật dùng bản chốt "huyền bí" (TEN-HUYEN-BI.md):
Bà Ngân → Vesper, the Bellkeeper · Tích Tắc → Tock, the Clockwork Owl · Thợ Rèn Hòn → Morrow, the Stone Smith ·
Kha → Kaelith · Người Gác Lặng → The Hushed Warden · Kiếm Khách → The Masked Wanderer.
(Hiện trong game mới có chữ "Kiếm Khách" ở tên một nút kỹ năng → "Awakened Wanderer Stance" và gợi ý nhiệm vụ → "the Masked Wanderer";
các nhân vật khác chưa có hộp thoại nào trong game.)

## Ảnh có chữ tiếng Việt in sẵn
Không thấy ảnh nào đang dùng trong game có chữ in sẵn (đã xem nút cảm ứng, HUD, khung bảng, khung hộp thoại, nền phòng qua ảnh chụp).

## Kết quả kiểm
| Phép thử | Kết quả |
|---|---|
| tools/vung-1/kiem-thu-f.js | 66/66 đạt |
| kiem-thu-g.js / kiem-thu-h.js | 4/4 · 4/4 |
| tools/vung-1/kiem-tra-vung1.js | đi hết P01 → P12, đủ hình (lỗi duy nhất: không tải được phông Google trong máy kiểm – có từ trước) |
| kiem-thu-day-xuyen-san.js | 6 chỗ đều leo được |
| game/tools/kiem-thu-vung-1.js | 54/54 (trước khi đổi có 1 lỗi chập chờn ở phép thử trùm; lần này đạt) |
| tools/an (logic + vùng 1) | 35/35 · 22/22 |
| tools/he-thong (logic + vùng 1) | 22/22 · 11/11 (sửa phép thử so chữ: "Forge Ringing Tone", "Art pending", "1 Note") |
| tools/cot-truyen | 23/23 · 4/4 (sửa so chữ "Rotting Roots") |
| tools/firebase | 17/17 · 17/17 |
| tools/suc-manh | 21/21 |
| cong-cu-man/kiem-tra.py | 0 lỗi, 0 cảnh báo |

Ảnh chụp Playwright (menu, HUD + bia P05, bảng Rest Bell, cổng rễ P11, trùm P12, bản đồ, màn hết vùng, phòng demo, Silver Strings, Echo Journal):
không còn chữ Việt, không tràn chữ. Dòng phím được rút gọn để vừa màn 844px. Grep cuối các file game/: chỉ còn chữ Việt trong chú thích code và ghi chú nội bộ (ghi_chu, ghi).
