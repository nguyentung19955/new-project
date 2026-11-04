# TURRET MERGE — bộ hình (ChatGPT vẽ, đã tách nền thành PNG trong suốt)
Người dùng 04/11 22h: "Phần nào đang vẽ tay giao chatgpt vẽ luôn, không để sót hình vẽ tay nào" → game KHÔNG được còn hình vẽ bằng code (chỉ còn hạt/glow phụ trợ). Mọi thứ dưới đây dùng ảnh.

## BẬC Ụ SÚNG — 64 loại như DCDW (người dùng 22h27: "vẽ tầm 60 loại ụ như dcdw")
Mỗi ụ ứng với 1 thẻ DCDW (bậc theo bậc DCDW: Thường→TRẮNG, Hiếm→XANH, Sử thi→TÍM, Huyền thoại→VÀNG, Cổ đại + mới→ĐỎ). Dữ liệu máy đọc: `roster.json`.

| id | Tên | Bậc | Thẻ DCDW | Kỹ năng |
|---|---|---|---|---|
| canon | Pháo Nổ | TRẮNG | Joan of Arc | Bắn chậm, nổ lan; sao tăng vùng nổ |
| xucxac | Pháo May Rủi | TRẮNG | Fenrir | Sát thương ngẫu nhiên 3–300; chí mạng luôn tối đa |
| lien | Liên Thanh | TRẮNG | Esch | Bắn rất nhanh; sao tăng tốc bắn |
| phun | Súng Phun Loạn | TRẮNG | Hairball | Bắn cực nhanh vào quái ngẫu nhiên |
| sungluc | Súng Lục | TRẮNG | Girl detective | Một phát sát thương lớn vào quái đầu |
| bang | Băng | TRẮNG | Liza | Làm chậm quái đầu 35% 4 s |
| doc | Độc | TRẮNG | Unknown | Gây độc theo thời gian |
| mana | Máy Mana | TRẮNG | Syrinx | Không bắn; sinh mana mỗi 7 s |
| tia | Bắn Tỉa | TRẮNG | Artemis | Nhắm quái nhiều máu nhất; +100% vào quái to |
| set | Tesla | TRẮNG | Arges | Sét chuỗi N quái = số sao |
| maychem | Máy Chém | TRẮNG | Scaffold | Xác suất giết ngay quái nhỏ |
| phagiap | Phá Giáp | TRẮNG | Freya | Gắn suy yếu: quái nhận thêm sát thương |
| bua | Búa Đẩy | TRẮNG | Atalante | Chí mạng đẩy lùi quái |
| nam | Nắm Đấm Sắt | TRẮNG | Vesta | Đánh gần: nổ tỏa tròn xung quanh, rất nhanh |
| bomhen | Bom Hẹn Giờ | TRẮNG | Hecate | Gắn bom hẹn giờ vào quái ngẫu nhiên, 5 s nổ |
| nhanmana | Máy Nhân Mana | XANH | Thisbe | Khi GHÉP: nhận nhiều mana |
| kiembang | Kiếm Băng | XANH | Ymir | +400% sát thương vào quái đang bị chậm |
| mimic | Mimic | XANH | Aurora | Ghép với BẤT KỲ ụ cùng sao; ghép xong buff tấn công |
| chimang | Ăng-ten Chí Mạng | XANH | Siren | Hỗ trợ: +tỉ lệ chí mạng 4 ô kề |
| dichchuyen | Bệ Dịch Chuyển | XANH | Merlin | Đổi chỗ với ụ khác cùng sao |
| radar | Radar | XANH | Kirinus | Hỗ trợ: +30% tốc bắn 4 ô kề |
| drone | Bệ Phóng Drone | XANH | Hermes | Khi GHÉP: phóng drone bom chạy ngược đường đâm quái |
| tron | Bộ Trộn | XANH | Zarramim | Ghép với bất kỳ ụ nào; sao = trung bình |
| nangluong | Pháo Năng Lượng | XANH | Jupiter | Sát thương tăng theo mana đang có |
| laser | Laser | XANH | Nebula | Tia liên tục, giữ lâu càng mạnh |
| lanhgia | Máy Phát Lạnh | XANH | Neptune | Hỗ trợ: ụ kề bắn kèm làm chậm |
| mortar | Súng Cối | XANH | Nade | Bắn quái ngẫu nhiên, nổ lan |
| khuech | Bộ Khuếch Đại | XANH | Mars | Hỗ trợ: +sát thương cộng dồn cho 4 ô kề |
| vungdoc | Bom Vũng Độc | XANH | Flora | Ném vũng độc lên đường |
| loa | Loa Hồi Chiêu | XANH | Melpomene | Khi GHÉP: giảm hồi chiêu kỹ năng Ma vương |
| hutmana | Máy Hút Mana | XANH | Elizabeth | Mỗi phát trúng nhận mana |
| min | Bệ Rải Mìn | XANH | Ptah | Rải mìn trên đường; đôi khi mìn sao (x3) |
| cuongno | Súng Cuồng Nộ | TÍM | Danu | Chí mạng → chế độ bùng nổ tốc bắn 5 s |
| baotuyet | Bão Tuyết | TÍM | Mayauel | Định kỳ làm chậm TOÀN BỘ quái |
| nhanban | Máy Nhân Bản | TÍM | Ivory | Khi GHÉP: gọi thêm 1 ụ 1 sao |
| lienket | Chuỗi Liên Kết | TÍM | Won | Mạnh hơn theo số ụ cùng loại nối liền kề |
| kepha | Kẹp Phá | TÍM | Myrina | Khi GHÉP: PVP làm chậm ụ đối thủ; co-op tăng tốc ụ đồng đội |
| taylo | Máy Tẩy Lỗi | TÍM | Gemina | Khi GHÉP: xoá hiệu ứng xấu cho N ụ |
| khien | Máy Khiên | TÍM | Mona | Khi GHÉP: khiên chặn 1 lần cho N ụ |
| hopbi | Hộp Bí Ẩn | TÍM | Daron | Sau 47 s biến thành ụ ngẫu nhiên 1–7 sao |
| nangsao | Bệ Nâng Sao | TÍM | Brownie | Khi GHÉP: +1 sao cho 1 ụ khác |
| tuthan | Cột Tử Thần | TÍM | Thanatos | Hỗ trợ: ụ kề có xác suất giết ngay quái nhỏ |
| xaotron | Máy Xáo Trộn | TÍM | Neban | Khi GHÉP: PVP đổi ngẫu nhiên ụ đối thủ |
| epxung | Bộ Ép Xung | TÍM | Pararamim | Ghép với ụ cùng sao: ụ đó +65% tốc bắn |
| no5 | Nỏ Năm Nhịp | TÍM | Amor | Phát thứ 5 bắn 3 mũi tên nổ |
| bao | Súng Bão | TÍM | Pantheon | Trúng tức thì, cực nhanh; chậm lại khi đứng cạnh ụ cùng loại |
| anhsang | Tháp Ánh Sáng | TÍM | Venus | Quả cầu sáng định kỳ gọi ụ 1 sao |
| aten | Pháo Thanh Tẩy | VÀNG | Aten | +300% vào quái trúng độc; giết thì nổ lan |
| dongbo | Pháo Đồng Bộ | VÀNG | Cosmem | Mạnh hơn theo số ụ cùng sao trên bàn |
| railgun | Railgun | VÀNG | Removal Tee | Bingo: đủ hàng ngang +sát thương, đủ hàng dọc +tốc bắn |
| vughep | Vua Ghép | VÀNG | Aurora King | Ghép cùng sao: +1 sao (bản vàng +2) |
| sinhdoi | Máy Sinh Đôi | VÀNG | Berit | Khi GHÉP: gọi thêm 1 ụ cùng sao |
| hasao | Súng Hạ Sao | VÀNG | Giltine | Khi GHÉP: PVP -1 sao ụ đối thủ; co-op +sao ụ đồng đội |
| saochep | Máy Sao Chép | VÀNG | Shamash | Sao chép ụ bất kỳ cùng sao (giảm sát thương) |
| ngoisao | Pháo Ngôi Sao | VÀNG | Darby | Tổng sao bội số 10 → tăng tốc; đủ 50 → siêu sát thương |
| soi | Sói Máy | VÀNG | Werewolf | Đánh gần; bản thức tỉnh luôn chí mạng |
| tienhoa | Hộp Tiến Hoá | VÀNG | Moa | Sau một lúc biến thành ụ ngẫu nhiên +1 sao |
| cauvong | Máy Cầu Vồng | VÀNG | Yuna | Vẽ cầu vồng lên đường: quái yếu đi (co-op) |
| wallgen | Máy Dựng Tường | VÀNG | Cleopatra | Dựng tường chặn đường rồi nổ |
| orbital | Vệ Tinh | VÀNG | Mafdet | Khi GHÉP: mọi vệ tinh bắn phá từ trời 20 s |
| blackhole | Hố Đen | ĐỎ | (mới) | Hút quái lại rồi nghiền |
| overlord | Overlord | ĐỎ | Jacheongbi | Khởi động chậm, nạp đầy bắn siêu sấm nổ diện rộng |
| lophanung | Lò Phản Ứng Băng | ĐỎ | Devil Cider Liza | Hào quang làm chậm quanh; càng chậm càng đau; kỹ năng chủ động |
| haoquang | Hào Quang Thánh | ĐỎ | Halo Mona | Kỹ năng chủ động: khiên bất tử toàn bàn vài giây |

Bộ bài 5 ụ chọn trước trận (như DCDW); triệu hồi ngẫu nhiên đều trong bộ. Bậc thể hiện bằng `tier_ring_<bac>` quanh bệ + `tier_card_<bac>`.

## BÀN CHƠI
Người dùng 22h28: chỉ 1 loại bàn, kiểu MÁY MÓC, màu XÁM, có dầu mỡ — để ụ súng và hiệu ứng nổi bật. `khay.png` + đường/cổng/lõi đều tông xám máy móc. Bỏ lựa chọn nhiều loại sàn/skin.

## FILE (thư mục này)
- `<id>_de.png` bệ 256², `<id>_nong.png` đầu súng 256² (nòng hướng PHẢI, tâm xoay = tâm ảnh). id: xem roster.json (64 id).
- `tier_ring_{trang,xanh,tim,vang,do}.png`, `tier_card_{...}.png`.
- `fx_<ten>.png` dải 6 khung (nền đen → alpha theo độ sáng, vẽ 'lighter'): no_phao, bang_vo, dien, khoi_doc, chop_nong (hướng phải), laser_trung.
- `dan_<ten>.png` (nền đen, hướng phải): phao, bang, lien, doc, tia; `tia_laser.png`, `tia_set.png` (đoạn lặp ngang); `tia_lua.png`; `khoi_0..3.png`.
- `quai_<ten>.png` dải 4 khung, nhìn XUỐNG (= hướng đi): bo, bay, bay_bang, khong_lo, tach, que_tach.
- `trum_<ten>.png` dải 4 khung (0–2 đi, 3 tung chiêu): mad_crown, freezer, janus, joker_king, nightmare, octopus.
- `khay.png` (bàn 5×3), `duong_thang.png`, `duong_goc.png`, `cong.png` (cổng sinh), `loi.png` (lõi).
- `ui_mana.png ui_tim.png ui_sao.png ui_nangcap.png ui_bang_wave.png ui_nut_trieu.png ui_canh_bao_trum.png ui_thuong.png`, lớp phủ trạng thái `phu_bang.png phu_da.png phu_lua.png phu_ngam.png`.
(File nào chưa có thì phiên chính đang lấy từ ChatGPT; dùng ảnh khi có, tạm vẽ code khi chưa có.)
