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
| 9 | Cửa hàng / Nhiệm vụ / Sự kiện | 390×844 | EN/VI | Ổ tròn thưởng (ua_nut_tron) lòi mép dưới hàng 4 px, "×1" dưới chân dung bị cắt | hàng kt-h 68 px, ổ tròn đặt lại | Đã sửa |
| 10 | Nhiệm vụ › Đăng nhập hằng ngày | 390×844 | EN/VI | "DAY n" đè mép trên ô, số thưởng đè mép dưới | đệm 11/9 px theo mép ua_o | Đã sửa |
| 11 | Cửa hàng › Rương | mọi cỡ | EN/VI | Nút i (tỉ lệ) ảnh 44 px trong nút 29 px → lòi ra ngoài góc thẻ rương | nút + ảnh 30 px, nằm trong góc | Đã sửa |
| 12 | Sự kiện tuần (chưa mở Huyền thoại) | mọi cỡ | EN/VI | Ô chân dung trống trơn, tên trống | ổ khoá anime + "Legendary / Unlocks at Pilot Level 6" | Đã sửa |
| 13 | Bảng phủ: UNLOCKED (lên cấp), tỉ lệ rương, Leo Tháp, Săn Trùm, Thử thách, Vô tận, Tuần | mọi cỡ | EN/VI | Nội dung cuộn trượt QUA mép khung ảnh (hàng cuối đè/lòi dưới viền vàng) | viền trong suốt thật = bề dày khung → cắt ở mép trong | Đã sửa |
| 14 | Bảng trượt HOME: danh sách trùm, chi tiết trùm, chế độ, cài đặt | mọi cỡ | EN/VI | như #13 (ALL BOSSES / hàng cuối bị viền cắt ngang) | như #13 | Đã sửa |
| 15 | Hồ sơ phi công | 390×844 | EN/VI | Tiêu đề đè mép trên khung, nút SAVE tràn sát 2 cạnh/đè góc | viền trong suốt 30/18 px | Đã sửa |
| 16 | Vô tận / Thử thách tuần › mốc tuần | 390×844 | EN/VI | "WAVE n" đè mép trên ô, "2,000" chạm mép phải, rương chạm đáy | đệm 10/6/9 px, icon 18 px | Đã sửa |
| 17 | Chế độ chơi › hàng khoá | 390×844 | EN | Chữ phụ 2 dòng ("Beat a boss…", "After Tower floor 100…") chạm/bị mép dưới cắt | đệm 11 px, cao theo nội dung | Đã sửa |
| 18 | Rương / vòng quay / thưởng thẻ | mọi cỡ | — | Khung chân dung nhỏ o_vien_<bậc> còn kiểu thép có ốc (lệch tông anime) | Cần ảnh khung vuông anime theo bậc (chưa có trong assets) | Còn lại — cần ảnh mới |
