# Báo cáo: hiệu ứng TỤ LỰC bằng ảnh (hu-tu-luc)

Commit: **efd677d9** trên nhánh `khoi-tao-du-an`.

Xem ảnh xem trước: `xem-tu-luc.png` (cùng thư mục): 6 khung × 4 màu hệ (không hệ, Lửa, Độc, Băng), mỗi điểm ảnh game phóng 6 lần, nền tối, chấm đỏ là tâm vòng (điểm neo đặt dưới chân Zed).

## Đã làm
1. **Cắt ảnh** — `docs/anh-goc/zed/hieu-ung/cat_tu_luc.py` (dùng lại các bước của `cat_phi_tieu.py`: xoá nền xanh, bỏ mảnh vụn, cắt khung theo đường viền, khử viền xanh rồi đổi điểm ám xanh sang xám).
   - Kết quả: `game/art/custom/hu-tu-luc.sprite.json`: 6 khung, 52×63 điểm ảnh game, net 2, lặp, 0,6 giây một vòng, cộng sáng.
   - Cỡ: vòng dẹt ở khung 1 rộng 44 điểm ảnh game ở cỡ 1.
   - Mỗi khung canh ngang theo tâm vòng, không theo khung bao, để tia bốc lên lệch một bên không làm vòng nhảy qua lại. Điểm neo (goc) = tâm vòng (26; 45,65).
2. **Vẽ dưới chân Zed khi giữ nút đánh lấy đà** — `game/js/fx_he.js`, hàm `drawTuLuc`, móc vào `fx.drawGround`: đây là lớp mặt đất, vẽ trước người.
   - Có ở mọi vũ khí có lấy đà: thương, búa, phi tiêu (phi tiêu vẫn có ảnh ném chùm riêng, vòng này nằm dưới chân lúc giữ). Kiếm không có lấy đà nên không có vòng.
   - Vòng chỉ hiện từ lúc đà bắt đầu tính (`chargeT ≥ 0`), nên bấm nhanh thì không hiện. Vòng hiện dần trong khoảng 0,1 giây.
   - **Nhuộm theo hệ** bằng bảng màu hệ có sẵn (`pal(el).c` của js/fx.js):
     - không hệ: giữ màu trắng;
     - Lửa: cam `#ff7a2a`;
     - Độc: xanh chanh `#6fcf3a`;
     - Băng: xanh nhạt `#7fd4ff`.
   - Cách nhuộm: nhân màu hệ rồi cộng lại 25% ảnh gốc để lõi vẫn sáng. Tấm nhuộm chỉ làm một lần cho mỗi màu rồi dùng lại, không tạo canvas mới ở mỗi khung.
   - **To dần theo nấc:**
     - chưa tới nấc 1: cỡ 0,8;
     - nấc 1: cỡ 1;
     - đầy: cỡ 1,2.
     - Cỡ đổi êm, không nhảy. Với vũ khí chỉ có một nấc (thương, phi tiêu), lúc đủ nửa đà được tính là nấc 1.
   - **Đầy nấc:** vẽ thêm một lớp vòng nhuộm vàng `#ffd23f` nhấp nháy (cùng nhịp 12 lần/giây như thanh đà cũ).
3. **Thay phần vẽ bằng code** — khi có ảnh:
   - api `mvCharge` (vòng sáng, chớp và lấp lánh ở tay mỗi lần lên nấc) không vẽ nữa;
   - các gạch/hạt màu hệ bay vòng quanh rồi bị hút về tay khi giữ (trong `fx.heStep`; hệ Độc là gạch tím/xanh) cũng không vẽ nữa.
   - Tiếng "pick" khi lên nấc vẫn do js/moves.js phát như cũ.
   - Không tìm thấy vòng nào chỉ để báo TẦM quét/xốc lúc giữ. Thanh đà nhỏ trên đầu (`drawCharge`) là thanh báo đà, không phải vòng tầm, nên giữ nguyên.
4. **Cờ tắt** `?tuluc=0` (hoặc `G.TU_LUC = false`): mọi thứ về đúng như cũ (vòng, gạch, hạt bằng code; không có vòng ảnh). Thiếu tệp ảnh thì cũng tự về như cũ.
5. **Không đổi:**
   - luật lấy đà, nấc, thời gian, sát thương (js/moves.js không sửa);
   - `game/js/zed_moi.js`;
   - đăng nhập Google, lưu mây, `?cloud=0`.
   - Không chép apiKey.
   - Đã làm sau phiên "Hiệu ứng Thức tỉnh bớt chồng chéo" (commit 62b445b4 đã có trên nhánh, cờ `?gonhu=0` giữ nguyên).

## Kiểm tra (theo luật: KHÔNG chạy game, không Playwright)
- Đã chạy script cắt ảnh; `node --check` qua mọi tệp `game/js/*.js`; `python3 game/build.py` đã nhúng `hu-tu-luc` (635 hình).
- Chưa xem trong game: cần người chơi thử giữ nút đánh với thương, búa và phi tiêu ở từng hệ, để xem cỡ, độ sáng và vị trí vòng có vừa mắt không.
  - Nếu cần chỉnh: hằng `TL_CO` (các cỡ theo nấc), `TL_GIU` (độ trắng của lõi) và độ đậm (`* 0.9`) nằm trong `drawTuLuc`, ở cuối `game/js/fx_he.js`.
