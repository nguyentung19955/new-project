Tôi đang làm game metroidvania 2D "Tiếng Vọng Cuối Cùng" (HTML5 Canvas, màn logic 960×540, ô 32 px, chơi iPhone ngang trên Safari). Hướng mỹ thuật đã chốt: "Cổ tích chuông tàn" (huyền bí, trầm, bớt trẻ con; bảng màu #17272C #39312E #65503C #35465C #648D88 #A78046 #F2D69A; teal chỉ dành cho ký ức/Vọng; vàng ấm = đèn dẫn đường; cam đỏ = nguy hiểm). Ảnh gen bằng ChatGPT trên nền trắng, cắt mảnh, ráp cutout.

ĐÃ CÓ THEO HƯỚNG MỚI (ảnh đính kèm):
- Lam mới (112 px), 5 quái mới (Bọ Vỏ Mộc, Phu Đèn Lạc, Dơi Rễ, Nấm Thở, Người Gác Câm), vũ khí, đe rèn, Ấn Rèn, vết Dư Âm.
- Cảnh chuẩn canh-chuan-lang.png, nền xa lang-xa-tan.png, nền giữa lang-giua-tan.png, gạch gach-re-tan.png, boss-gac-lang-tan.png – CHƯA đưa vào game.

CÒN THEO KIỂU CŨ "One Mage Army" (viền đen dày, màu tươi) – đang dùng trong game, xem ảnh sau-san-chuong / cong-lang / hud:
- Bộ gạch Làng Chuông, mép đá rêu, ván treo, cột rễ, cổng rễ, mảng gỗ che vân.
- Đồ vật: điểm lưu, đèn lồng, rễ trần, chuông lớn, quầy hàng, bảng nhiệm vụ, biển chỉ đường, NPC thợ rèn + trưởng làng.
- HUD (chuông máu, sóng Vọng), nút cảm ứng, màn bắt đầu, màn kết.
- Hiện chỉ chỉnh màu bằng code (trang thu-huong-moi, ảnh sau.png) để thử hướng mới.

GAMEPLAY ĐANG ƯU TIÊN (chỉ làm đồ cho những phòng này trước):
- P0-A: 3 phòng thử A (hình nộm, điểm lưu), B (sân 2 Chuông Gỗ, ván một chiều), C (hành lang trần cao, quái gác, cổng).
- P0-B: thêm phòng D có Bọ Vỏ Mộc. P0-C: phòng E tinh anh, phòng F đe rèn (nâng Âm Đao).
- Boss, làng đầy đủ, NPC, menu để sau.
- Luật trang trí đã chốt: collider không đổi; trang trí nhô tối đa 2–4 px; không mặt đứng giả; cùng toạ độ camera (không parallax); vùng chiến đấu phải đọc rõ quái, dấu báo đòn, hộp đòn.

NHỜ ANH/CHỊ TƯ VẤN:
1. Từng nhóm đồ cũ ở trên: GIỮ + chỉnh màu bằng code, hay GEN LẠI? Nhóm nào đáng gen lại trước, nhóm nào để sau?
2. Bộ gạch/mặt đất mới: gach-re-tan.png đã đủ chưa? Cần những mảnh nào (mép trên, tường, đáy, góc trong/ngoài, ván một chiều, cột, dốc…) để dựng 6 phòng thử mà không lộ lặp và không làm rối vùng chiến đấu?
3. Nền xa/giữa mới có dùng được không? Có cần lớp gần (foreground) không? Làm sao để nền ngay sau vùng chiến đấu ít tương phản mà vẫn huyền bí?
4. Danh sách đồ vật tối thiểu cho phòng A–F (điểm lưu, đèn, cổng, đe…), cỡ so với Lam 112 px, đặt ở lớp nào.
5. HUD + nút cảm ứng + màn bắt đầu: gen lại ngay hay đợi qua P0? Nếu gen, nên theo hướng nào để đọc rõ trên iPhone?
6. Với mỗi món nên gen: một prompt NGẮN (tiếng Anh, nền trắng, mảnh tách rời) và ghi ảnh mẫu nào cần đính kèm.

Trả lời dạng bảng: món → giữ/chỉnh màu/gen lại → ưu tiên (ngay / sau P0 / sau) → lý do ngắn. Rồi danh sách prompt.
