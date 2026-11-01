# Báo cáo Luồng C – Đưa phong cách phòng demo sang Vùng 1

## Đã làm
1. **Ảnh phòng nướng sẵn** – `tools/vung-1/ve-phong.py` (dựa trên `tools/phong-demo/tokien.py`, không sửa file đó).
   - Chạy `python3 tools/vung-1/ve-phong.py` (≈12 giây, mọi phòng) hoặc `... P03 P06` (vài phòng). Mỗi phòng ra `art/vung-1/<ID>-canh.png`, `<ID>-truoc.png`, `<ID>-canh.json`, và `<ID>-manh.png` nếu có tường nứt/giả.
   - Đá tô liền theo điểm ảnh, chìm dần vào bóng tối; viền sáng ấm dọc mép; cỏ rễ trên mặt sàn, rễ rủ dưới trần.
   - Mép đá **luôn trùm ra ngoài ô va chạm** (không bao giờ khoét vào ô `#`). Độ trùm lượn 0–7 điểm, có gợn tối thiểu nên không đoạn tường nào thành vạch thẳng. Mặt sàn giữ phẳng đúng chỗ chân đứng.
   - Mép phòng có đệm đá 4 ô, nên mép ngoài cũng méo tự nhiên. Cửa phòng được khoét thông ra mép.
   - Không có mảnh lơ lửng: đá vụn không dính ô đặc thì bị xoá. **Mấu đá nhỏ đứng riêng** (≤ 6 ô) vẽ thành **bệ rễ** như phòng demo, không còn là cục vuông.
   - **Sàn mỏng `=`**: bệ rễ ghép đầu–giữa–đuôi từ `plat_4`, dài đúng bằng đoạn sàn.
   - **Dây leo `H`**: vẽ bằng `v_top / v_mid1 / v_mid2 / v_bot`, kéo lên tới trần thật nên không treo giữa không trung.
   - **Tường nứt `N`**: có mạch nứt sẫm viền ấm khắc vào đá, nhìn ra được. Càng chém càng thêm vệt nứt nhỏ. Khi vỡ, dán mảnh "lộ hốc" đã nướng sẵn nên liền mạch, không có lỗ vuông.
   - **Tường giả `G`**: ảnh cảnh vẽ sẵn hốc phía sau, lớp đá giả phủ lên và mờ dần khi nhân vật bước vào.
   - **Đồ trang trí / hài cốt** từ `tools/phong-demo/*.png`. Đồ đặt và đồ treo chỉ được đặt khi mép đá thật nằm dưới ≥ 90% chân hoặc phần móc chạm trần. Đồ không đè dây leo, cửa, sàn mỏng hay tường nứt/giả. Đặt theo `trang_tri` của luồng B: đầu lâu, hài cốt, xác ngồi, lò đúc, giàn chuông, chuông vỡ lớn, cổng rễ, dàn ống chuông… Ngoài ra còn rải ngẫu nhiên, cố định theo ID phòng.
   - **Đèn**: lồng đèn treo nếu gần trần, không thì đèn thờ đứng trên sàn. Vị trí quầng sáng ghi trong `<ID>-canh.json` để khớp với đèn.
   - **Chuông Lưu**: chuông đồng lớn úp trên sàn, vẽ sẵn trong ảnh. Lúc chơi có quầng đồng, sáng hơn khi đã nghỉ ở chuông.
   - Tiền cảnh: vài bóng rễ gần như đen, vẽ sau lớp bóng tối như phòng demo.
2. **ve.js / nap.js / the-gioi.js**
   - Nạp ảnh cả 9 phòng lúc bắt đầu. Có ảnh thì dùng ảnh. **Thiếu ảnh** (vd. phòng thử `phong-thu/`) thì tự quay về vẽ ô bằng code như cũ.
   - Cửa bị bịt (khoá cần 3 Chuông Vỡ / rễ khép khi đánh tinh anh, trùm) vẽ bằng 2 song dây leo thật, có chuông đồng nhỏ làm dấu khoá. Không còn ô tối vuông.
   - Nền xa/giữa lặp cả ngang lẫn dọc, lật gương xen kẽ, nên không lộ vạch ngang khi camera đi xuống.
3. **Quái** – các phòng chỉ dùng 5 quái mới (cau, vai, tang, ken, tan).
   - Viền sáng theo màu riêng quanh quái (`SpriteMN.veVien`), vẽ **sau** lớp bóng tối.
   - Chiêu quái + hiệu ứng ChatGPT vẽ (`art/hieu-ung/chieu-quai/*.png`): tụ năng lượng trước khi bắn, đạn, sóng vải, vuốt Màn Tang, sóng chấn động Vọng Tàn.
   - Khói bụi khi trượt bám tường.
4. **Nút cảm ứng** giống phòng demo:
   - Nửa trái màn hình là cần di chuyển nổi: chạm đâu thì tâm cần ở đó. Kéo lên/xuống = ↑ / ↓, dùng để leo dây, nghỉ chuông, xuống sàn mỏng.
   - Nửa phải: bấm gần nút nào thì ra nút đó (Chém / Nhảy / Lướt / Hồi), biểu tượng `art/giao-dien/nut/*.png`.
   - **Chơi được cả màn dọc**: khung game nằm trên, nút ở dưới, đã bỏ màn "Xoay ngang".
   - Vẫn giữ nút **Bản đồ** và **Nghỉ ở Chuông**.

## Kiểm tra (Playwright, chromium)
- `node tools/vung-1/kiem-tra-vung1.js` – trước đó cần chạy `python3 -m http.server 8765` trong thư mục `tieng-vong-cuoi-cung`. Đi qua cửa **P01 → P02 → P03 → P04 → P05 → P06 → P09 → P11 → P12**: tất cả ok. **Không lỗi JS**, không thiếu hình. Có chụp thêm màn dọc và màn ngang điện thoại.
- `node tools/vung-1/chup-dac-biet.js` – chụp tường nứt (trước/sau khi vỡ), tường giả, cửa khoá song rễ, phòng trùm.
- `python3 tools/vung-1/xem-nhanh.py P03` (thêm `-l`, vd. `P03-l`, để vẽ khung ô va chạm) – xem nguyên ảnh nướng.
- Ảnh đã tự xem nằm ở `tools/vung-1/xem/`: `nuong-P*.png` (cả phòng), `choi-P*.png` (trong game), `choi-doc.png`, `choi-ngang-dt.png`, `nut-*`, `gia-P06.png`, `khoa-P11.png`, `trum-P12.png`.
- Đã sửa sau khi tự xem:
  - Tường dài bị thẳng tắp → thêm độ trùm lượn và gợn tối thiểu.
  - Đèn đè lên dây leo → tránh cột `H`.
  - Xác ngồi bị bỏ sót cạnh Chuông Lưu → đặt lại.
  - Dấu khoá vuông và ô tối vuông ở cửa → đổi sang chuông nhỏ + song dây leo.

## Còn lại / gợi ý
- Tường nứt P02/P03 nằm trong vách 1 ô theo thiết kế phòng, nên vẫn là một cột đá mảnh (có mạch nứt).
- Trùm "Mẫu Chuông Rỗng" vẫn là hình tạm vẽ canvas (chờ sprite `art/trum-vung-1/`). Biểu tượng vật phẩm/HUD vẫn vẽ bằng code.
- Sửa phòng (luồng B) xong thì **chạy lại `ve-phong.py`**. Nếu số cột/hàng không khớp ảnh, game tự quay về vẽ code để không lệch va chạm.
