# TURRET MERGE — bộ hình (ChatGPT vẽ, đã tách nền thành PNG trong suốt)
Người dùng 04/11 22h: "Phần nào đang vẽ tay giao chatgpt vẽ luôn, không để sót hình vẽ tay nào" → game KHÔNG được còn hình vẽ bằng code (chỉ còn hạt/glow phụ trợ). Mọi thứ dưới đây dùng ảnh.

## BẬC Ụ SÚNG (như DCDW: trắng / xanh / tím / vàng / đỏ)
| Bậc | Ụ |
|---|---|
| TRẮNG (thường) | canon (pháo nổ lan), bang (băng làm chậm), lien (liên thanh), doc (độc) |
| XANH (hiếm) | set (tesla sét chuỗi), tia (bắn tỉa), radar (buff tốc bắn 4 ô kề), mana (sinh mana) |
| TÍM (sử thi) | laser (tia tăng dần), mimic (ghép với bất kỳ cùng sao), mortar (cối bắn ngẫu nhiên nổ lan — Nade) |
| VÀNG (huyền thoại, kỹ năng riêng) | railgun (bingo: đủ hàng ngang +sát thương, đủ hàng dọc +tốc bắn — Removal Tee), orbital (khi GHÉP, mọi orbital thức tỉnh 20 s bắn phá từ trời — Mafdet), wallgen (định kỳ dựng tường ánh sáng chặn đường rồi nổ — Cleopatra) |
| ĐỎ (thần thoại, mạnh nhất) | blackhole (định kỳ tạo hố đen hút quái lại + nghiền), overlord (khởi động chậm, nạp đầy thì bắn siêu sấm nổ diện rộng — Jacheongbi) |
Bậc thể hiện bằng VÒNG KHUNG bậc quanh bệ (tier_ring_<bac>.png) + KHUNG THẺ trong bộ bài (tier_card_<bac>.png). Bậc cao: rơi hiếm hơn khi triệu hồi? KHÔNG — như DCDW, bộ 5 ụ chọn trước trận, triệu hồi ngẫu nhiên đều trong bộ; bậc chỉ quyết định độ mạnh/kỹ năng.

## FILE (thư mục này)
- `<id>_de.png` bệ 256², `<id>_nong.png` đầu súng 256² (nòng hướng PHẢI, tâm xoay = tâm ảnh). id: canon bang set doc lien laser tia mana radar mimic + mortar railgun orbital wallgen blackhole overlord.
- `tier_ring_{trang,xanh,tim,vang,do}.png`, `tier_card_{...}.png`.
- `fx_<ten>.png` dải 6 khung (nền đen → alpha theo độ sáng, vẽ 'lighter'): no_phao, bang_vo, dien, khoi_doc, chop_nong (hướng phải), laser_trung.
- `dan_<ten>.png` (nền đen, hướng phải): phao, bang, lien, doc, tia; `tia_laser.png`, `tia_set.png` (đoạn lặp ngang); `tia_lua.png`; `khoi_0..3.png`.
- `quai_<ten>.png` dải 4 khung, nhìn XUỐNG (= hướng đi): bo, bay, bay_bang, khong_lo, tach, que_tach.
- `trum_<ten>.png` dải 4 khung (0–2 đi, 3 tung chiêu): mad_crown, freezer, janus, joker_king, nightmare, octopus.
- `khay.png` (bàn 5×3), `duong_thang.png`, `duong_goc.png`, `cong.png` (cổng sinh), `loi.png` (lõi).
- `ui_mana.png ui_tim.png ui_sao.png ui_nangcap.png ui_bang_wave.png ui_nut_trieu.png ui_canh_bao_trum.png ui_thuong.png`, lớp phủ trạng thái `phu_bang.png phu_da.png phu_lua.png phu_ngam.png`.
(File nào chưa có thì phiên chính đang lấy từ ChatGPT; dùng ảnh khi có, tạm vẽ code khi chưa có.)
