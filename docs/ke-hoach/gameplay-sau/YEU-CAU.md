# Yêu cầu: kế hoạch gameplay các phần tiếp theo (chủ game, 15/10/2026 22:38)

Chủ game muốn có KẾ HOẠCH (chưa code) cho: các vùng tiếp theo, quái mới, cách ra đòn mới, các tính năng tăng lực chiến, phụ kiện, linh thú, hiệu ứng nhân vật khi mặc phụ kiện, v.v.

Chia 3 phiên lập kế hoạch song song, mỗi phiên một tệp riêng trong thư mục này:
- **Phiên 1 — VUNG.md**: vùng 5 Núi Sét, 6 Rừng đá vôi/hang tối, 7 Đỉnh mây, 8 Đền trống đồng (Hắc Long). Mỗi vùng: luật riêng của vùng, 8 quái thường + tinh anh + trùm nhỏ + trùm vùng (vai, hệ, chiêu, cách né/cách khắc chế), nền phòng, mảnh trống, người cần cứu, câu móc. Vùng 4 đã có ở docs/ke-hoach/buoc-3/KE-HOACH.md — giữ khuôn đó.
- **Phiên 2 — LOI-DANH.md**: cách ra đòn mới của Cu Tí (vũ khí mới, chiêu mới, combo, hệ Sét mới, phản đòn/né hoàn hảo, chiêu hợp lực với linh thú…), quái/trùm có kiểu ra đòn mới để người chơi phải học (cơ chế chung dùng lại được giữa các vùng).
- **Phiên 3 — LUC-CHIEN.md**: tăng lực chiến dài hạn: phụ kiện (ô đeo, bộ, dòng chỉ số, nâng cấp), linh thú (cách có, đi theo, đánh, nâng cấp, kỹ năng, tiến hoá), hiệu ứng nhìn thấy trên nhân vật khi mặc phụ kiện/bộ đồ (hào quang, vệt, đổi màu vũ khí…), các tính năng tăng lực chiến khác (ấn ký, cảnh giới, thiên phú…). Kèm nguồn có được và kinh tế (vàng, đá, mảnh).

Luật chung:
- Đọc trước: docs/cot-truyen/CHUNG.md (đã chốt Hắc Long = Thuồng Luồng hoá rồng; mảnh mặt trời giữ tới vùng 8), docs/ke-hoach/BUOC-2-3-4.md, docs/ke-hoach/buoc-3/KE-HOACH.md, docs/ke-hoach/LUAT-CAN-BANG.md, code hiện có (game/js/data.js, moves.js, combat.js, chieu_trum.js, hanh_trang.js…) để không trùng hệ đã có (trang phục, mài, ép đồ, cây chưởng, linh khí, Sổ yêu quái, thành tựu…).
- CÂN BẰNG: mọi thứ tăng lực chiến phải có trần, ghi rõ con số đề xuất và cách kiểm bằng bot (tests/cay.py, tools/can-bang/tinh.js). Không làm game dễ đi đột ngột.
- Phong cách ảnh chưa chốt (pixel hay nét vẽ mịn — docs/ke-hoach/khong-pixel/), nên chỉ ghi DANH SÁCH ảnh cần (tên, số khung), CHƯA viết prompt.
- Viết tiếng Việt dễ hiểu cho người không chuyên; cuối mỗi tệp: thứ tự làm (đợt, mỗi đợt ~3 phiên), câu hỏi cần chủ game quyết.
- Tránh chủ đề Sơn Tinh – Thủy Tinh.
