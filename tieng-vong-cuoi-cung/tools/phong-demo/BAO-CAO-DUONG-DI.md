# Báo cáo đường đi – phòng demo "tổ kiến"

## Vấn đề
Người chơi rơi xuống hang dưới (C) thì **không leo lên lại được**: sàn C ở hàng 39, mà bệ thấp nhất trong hai giếng (giếng A, giếng B) cao hơn 11–13 ô, trong khi nhân vật nhảy + nhảy đôi chỉ cao tối đa **4,75 ô**. Cả hang C + phòng cổng D thành "đường một chiều". Ngoài ra 2 bệ không với tới được (bệ giữa hang C và bệ cao trong phòng cổng D – cao 5 và 7 ô).

## Tầm nhảy của nhân vật (tính từ dong-co-mn.js, nhân vật cao 78, ô = 48)
- Nhảy thường: cao 2,66 ô, xa (đang chạy) 3,8 ô
- Nhảy + nhảy đôi: cao tối đa 4,75 ô, xa tối đa 7,3 ô
- Lưu ý: đi bộ rơi khỏi mép thì **không** có nhảy đôi (chỉ có khi đã nhảy, bám vách hoặc bám dây)

## Đã sửa (trong tokien.py)
1. **Rễ leo giếng A** (cột 13, từ miệng giếng hàng 16 xuống tận sàn C): sát mép phải giếng → leo lên đỉnh rồi nhảy sang phải là về lối vào A.
2. **Rễ leo giếng B** (cột 52, từ miệng giếng hàng 18 xuống tận sàn C): sát mép trái giếng → leo lên rồi nhảy sang trái là về đại sảnh chuông B.
3. Dời nhẹ bệ trong giếng cho rễ không xuyên qua bệ: giếng A (20,11–12), (28,11–12); giếng B (22,53–54).
4. **Bậc phụ**: hang C (hàng 36, cột 40–41) để lên bệ giữa; phòng cổng D (hàng 36, cột 74–76) để lên bệ cao.
5. tokien.py giờ tự **báo lỗi nếu dây leo xuyên qua đá/bệ**.
Bố cục tổ kiến nhiều tầng, mép đá bo méo, đồ trang trí và quái giữ nguyên.

## Công cụ kiểm tra
- `python3 kiemtra_duongdi.py` – mô phỏng bằng hộp (chép vật lý game) từ mọi chỗ đứng / chỗ bám dây: đi, rơi, nhảy, nhảy đôi, leo dây. Báo vùng một chiều và vùng không tới được. Thêm `--du` để tính cả trèo vách; `--cao` chỉ in tầm nhảy.
- `node thu_duongdi_playwright.js` – chơi thật trong trình duyệt (cần `python3 -m http.server 8765` ở thư mục tieng-vong-cuoi-cung): xuống giếng A tới sàn C rồi leo về A; xuống giếng B tới sàn C rồi leo về B (khi thử tắt sát thương quái để đo đường đi).

## Kết quả
| | Trước sửa | Sau sửa |
|---|---|---|
| Vùng một chiều | 1 (cả sàn hang C + phòng cổng D, 73 ô) | **0** |
| Chỗ không tới được | 2 bệ | **0** |
| Tới cổng & quay về được | tới được nhưng không quay về | **được** |
| Thử thật Playwright | – | **ĐẠT** cả hai giếng |

Cả chế độ dễ (không cần trèo vách) lẫn chế độ đủ đều không còn chỗ một chiều hay chỗ kẹt. Ảnh toàn phòng sau sửa: `xem-sau-sua.png`.
