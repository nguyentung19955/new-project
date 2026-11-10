# Rà soát giao diện toàn game — bảng lỗi (10/11)

Công cụ: `tools/thap-kt-ra-soat-gd.js` — mở ~40 màn ở 390×844 · 393×852 · 375×667 · 844×390, EN + VI; đo bằng `getBoundingClientRect`:
LOI (icon/ảnh vượt khung có hình) · CAT (bị overflow cắt) · CHU (chữ tràn/bị cắt) · CHONG (nút chồng nhau) · NGOAI (ra ngoài màn).
Mỗi màn chụp `<man>_<cỡ>_<ngôn ngữ>.jpg` + `_d.jpg` (khoanh màu chỗ nghi). Máy đo chỉ khoanh nghi vấn — mọi dòng dưới đây đã xem tận mắt (Read, phóng to).

| # | Màn | Cỡ | NN | Mô tả lỗi | Sửa | Trạng thái |
|---|-----|----|----|-----------|-----|-----------|
| 1 | Trang ụ › bắn thử | mọi cỡ | EN/VI | Khung thép xám góc xanh lá (khung_bang + h2_glint), nút 1★/4★/7★ thép, nút dừng thép đè pha lê lõi | `ui-anime.css`: khung ua_o, pill ua_pill_tat/bat, nút tròn ua_nut_tron + ha_ic_dung2 / duong_mui, góc dưới phải dưới lõi | Đã sửa |
| 2 | Trang ụ › bắn thử | mọi cỡ | EN/VI | Băng chú thích (thép bang_wave_nen) đè lên làn dưới / đáy bàn BC_SOLO | `skilldemo.js` khung cắt 120…592 (trước 112…532), băng ở y 562 dưới làn; băng = tấm ua_tam 9 mảnh; `unitpage.js` khungXem 472 | Đã sửa |
| 3 | Trang ụ › bắn thử | 390×844 | EN | Ụ to tràn ô / vạch tối trên làn | Bản hiện tại (BC_SOLO + render.js) đã đúng trong demo — chụp 3 ụ (canon/hydra/lualien) ụ nằm gọn ô; làn giống hệt trận. Bản live cũ (cache) mới còn lỗi | Không cần sửa thêm |
| 4 | Xếp bộ bài (chưa qua hướng dẫn) | mọi cỡ | EN/VI | Bảng TURRETS LOCKED + 2 nút còn khung thép (khung_tt, nut_nho) | `ui-anime.css`: tấm ua_tam2, PLAY = nút chính cam, SKIP = nút phụ chàm | Đã sửa |
| 5 | Xếp bộ bài / Bộ sưu tập | 390×844 | EN | Tên thẻ "NOT OWNED" bị cắt chân chữ (hộp 10 px, chữ 12 px: "Dice Gun", "Guillotine") | `ui-anime.css` hộp tên 13/14 px, line-height = hộp | Đã sửa |
| 6 | Lưới thẻ | mọi cỡ | EN/VI | Badge NEW! vẽ gradient hồng + nhịp phóng liên tục, đè huy hiệu LV góc phải | pill cyan ua_pill_bat, đứng yên, giữa mép trên chân dung | Đã sửa |
| 7 | Khay trận (Lucky Slot) | mọi cỡ | EN/VI | Dải số quả = gradient tối vẽ CSS (demkn.css) | tấm ua_tam 9 mảnh | Đã sửa |
| 8 | Trang ụ › hàng CARD LV | 390×844 | EN | Thanh bản sao lòi lên mép khung, "Need 1 more copy" chạm mép dưới, chữ LEVEL UP bị mép nút cắt; icon vàng là ngọc vàng cũ (lệch HOME/cửa hàng) | hàng cao ≥74 px + đệm, nút 50 px; `thebai-ui.js` icon vàng theo KTA.vang (ua_ts_vang) | Đã sửa |
