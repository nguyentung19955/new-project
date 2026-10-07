# Prompt thay hình vẽ bằng code — 112 ảnh

> Sinh bằng `node tools/build-prompt-hinh-code.js` — đừng sửa tay. Bản chép-dán: `docs/PROMPT-THAY-HINH-CODE.txt`.

## Tóm tắt theo nhóm

| Nhóm | Ảnh gửi AI | File trong assets/ |
|---|---|---|
| A. Bản đồ · ô đặt tướng · công trình | 2 | 10 |
| B. Thanh máu · khung HUD trong trận | 3 | 5 |
| C. Đạn bay | 3 | 15 |
| D. Hiệu ứng chiêu / trúng đòn / vfx | 46 | 46 |
| E. Triệu hồi · vật ném | 11 | 11 |
| F. Icon UI (trạng thái, tài nguyên, chỉ số) | 3 | 17 |
| G. Khung · nút · nền panel | 5 | 15 |
| H. Tướng · đồ (icon kỹ năng, đồ ghép) | 21 | 84 |
| I. Màn hình (kết quả, chương, menu, truyện, núi) | 18 | 19 |
| **Tổng** | **112** | **222** |

## Hướng dẫn

```
============================================================
CHỈ THỊ CHO AI / INSTRUCTIONS FOR THE AI
============================================================
EN: Each block between the dashed lines is ONE separate request — generate exactly ONE image per block, at the size written in the block.
Follow the cell layout exactly (one element per cell, same size, empty margin, nothing crosses into another cell). Background: perfectly flat
pure magenta #FF00FF (or fully transparent) unless the block says BLACK #000000 or full-bleed painting. Never write text, letters, numbers,
labels, signatures or watermarks; never draw grid lines or cell borders. Style: cute chibi Vietnamese-mythology game art, Dong Son bronze drum.
VI: Mỗi khối giữa hai đường gạch là MỘT yêu cầu riêng — gen đúng MỘT ảnh cho mỗi khối, đúng kích thước ghi trong khối. Làm đúng bố cục ô
(mỗi ô một vật, cùng cỡ, chừa lề, không lấn sang ô khác). Nền hồng tím phẳng #FF00FF (hoặc trong suốt), trừ khi khối ghi nền ĐEN #000000 hoặc
tranh tràn viền. Tuyệt đối không chữ, số, nhãn, chữ ký, watermark, không kẻ lưới / viền ô. Phong cách chibi thần thoại Việt, trống đồng Đông Sơn.
============================================================
HƯỚNG DẪN NGƯỜI DÙNG: GEN → CẮT → GỬI ZIP
============================================================
1. Gen theo thứ tự số khối (ưu tiên: thứ người chơi thấy nhiều nhất ở trên). Chép phần giữa hai đường gạch, dán vào AI tạo ảnh.
   Khối có nhân vật / con vật: đính kèm ảnh mẫu phong cách docs/mau-luoi/vi-du-hero12-lactuong.png kèm câu "Match the art style and line art of the attached style sample".
2. Lưu ảnh ĐÚNG "Lưu ảnh tên" ghi trên khối (vd hc-de-tuong.png, dan-he.png, icon-xathu.png, thua-sontinh.png).
3. Mở tools/cat-anh.html (Chrome / Edge, chạy trên máy), kéo thả cả thư mục ảnh vào → tool tự nhận tên, xoá nền hồng tím, tách từng ô,
   đặt đúng đường dẫn trong assets/ (dòng "Tên file" của khối). Ô báo đỏ "tìm thấy N vật, cần M" = ảnh sai số ô → gen lại khối đó.
   Khối ghi "Cắt: không cần cắt" (tranh nền kết quả / chương / nền màn phụ / logo): ĐỪNG kéo vào cat-anh (tool có thể nhận nhầm
   "thua-giong" thành tướng Gióng) — đổi tên đúng "Tên file" rồi bỏ thẳng vào zip theo đúng thư mục (vd scenes/thua-sontinh.png).
4. Bấm "Tải zip" trong tool, gửi zip lại cho Claude: Claude giải nén vào assets/, chạy node tools/build-asset-list.js, kiểm tra trong game.
5. Kiểm tra trước khi nhận ảnh: đúng số ô · mỗi ô một vật · không chữ / số / watermark · nền phẳng · không cắt mất mép vật.
ƯU TIÊN (người chơi thấy nhiều nhất trước):
  1 = thấy liên tục trong MỌI trận / mọi màn (ô đặt tướng, thanh máu, đạn theo hệ, trúng đòn, quái chết, khung bảng / nút / thanh chợ, icon trạng thái, nền màn phụ)
  2 = thấy thường xuyên (đạn riêng, vòng chiêu, chém, icon kỹ năng, tranh chương / kết quả)
  3 = hiếm (chiêu riêng của vài tướng, boss chết, dải thông báo, icon ui_* chỉ hiện khi bật "Dùng ảnh AI", núi Tản Viên, logo tuỳ chọn…)
```

## Danh sách

| # | Ưu tiên | Nhóm | Mục | Lưu ảnh tên | File thiếu | Cỡ trên màn | Đã có prompt tổng |
|---|---|---|---|---|---|---|---|
| 1 | 1 | A | Đế đặt tướng · 5 trạng thái | `hc-de-tuong.png` | 5 | ≈27×18 px trên màn 844×390 (≈40×27 ở 1920×934) | chưa |
| 2 | 1 | A | Đế đặt tướng · theo chủ đề bản đồ | `hc-de-tuong-chu-de.png` | 5 | ≈27×18 px trên màn 844×390 (≈40×27 ở 1920×934) | chưa |
| 3 | 1 | B | Khung thanh máu boss / tướng / quái | `hc-thanh-mau.png` | 3 | tướng 22×3 · quái 16–40×2 · boss ~300×10 px (844×390) | chưa |
| 4 | 1 | C | Đạn bay theo hệ (Kim · Mộc · Thủy · Hỏa · Thổ) | `dan-he.png` | 5 | 7–12 px | có |
| 5 | 1 | D | Trúng đòn hệ Kim (đạn chạm quái) | `trung-kim.png` | 1 | 34–46 px | có |
| 6 | 1 | D | Trúng đòn hệ Mộc (đạn chạm quái) | `trung-moc.png` | 1 | 34–46 px | có |
| 7 | 1 | D | Trúng đòn hệ Thủy (đạn chạm quái) | `trung-thuy.png` | 1 | 34–46 px | có |
| 8 | 1 | D | Trúng đòn hệ Hỏa (đạn chạm quái) | `trung-hoa.png` | 1 | 34–46 px | có |
| 9 | 1 | D | Trúng đòn hệ Thổ (đạn chạm quái) | `trung-tho.png` | 1 | 34–46 px | có |
| 10 | 1 | D | Quái chết (khói tan) | `chet-quai.png` | 1 | ≈34 px | có |
| 11 | 1 | D | Hiệu ứng slash-gold · chém của 30 tướng cận chiến | `slash-gold.png` | 1 | 22–34 px | có |
| 12 | 1 | D | Hiệu ứng spawn-ring · đặt tướng / triệu hồi | `spawn-ring.png` | 1 | 30×21 px | có |
| 13 | 1 | D | Hiệu ứng ring · vòng sóng toả (lên cấp, đánh lan) | `ring.png` | 1 | theo bán kính | có |
| 14 | 1 | F | Icon nhỏ · ic-trang-thai-1 | `hc-ic-trang-thai-1.png` | 5 | 12–14 px trên thanh boss (vẽ 128, cắt 64) | chưa |
| 15 | 1 | F | Icon nhỏ · ic-trang-thai-3 | `hc-ic-trang-thai-3.png` | 4 | 12–14 px trên thanh boss (vẽ 128, cắt 64) | chưa |
| 16 | 1 | G | Khung bảng / popup (giấy dó viền đồng, 9 mảnh) | `hc-khung-bang.png` | 1 | bảng 300–800 px (9-slice) | có |
| 17 | 1 | G | Nút chữ nhật vàng + đồng · thường / nhấn / khóa | `hc-nut-chu-nhat.png` | 6 | nút 120–240×36–48 px | chưa |
| 18 | 1 | G | Khung thanh đáy (chợ tướng trong trận) | `hc-khung-thanh-day.png` | 1 | ≈700×70 px | có |
| 19 | 1 | G | Khung thẻ chợ tướng + nút đổi | `hc-khung-the-cho.png` | 4 | ≈80×64 px | chưa |
| 20 | 1 | I | Nền đồng tối cho màn phụ | `nen-man-phu.png` | 1 | toàn màn | có |
| 21 | 2 | C | Đạn riêng 1: cầu lửa · mũi băng · mũi tên · tên nỏ · cầu phép | `dan-1.png` | 5 | 7–12 px | có |
| 22 | 2 | C | Đạn riêng 2: lông vũ · cánh hoa · dưa hấu · hạt lúa · phép quái | `dan-2.png` | 5 | 7–12 px | có |
| 23 | 2 | D | Vòng chiêu / hào quang hệ Kim (dưới chân tướng khi tung chiêu) | `vong-chieu-kim.png` | 1 | 55–80 px | có |
| 24 | 2 | D | Vòng chiêu / hào quang hệ Mộc (dưới chân tướng khi tung chiêu) | `vong-chieu-moc.png` | 1 | 55–80 px | có |
| 25 | 2 | D | Vòng chiêu / hào quang hệ Thủy (dưới chân tướng khi tung chiêu) | `vong-chieu-thuy.png` | 1 | 55–80 px | có |
| 26 | 2 | D | Vòng chiêu / hào quang hệ Hỏa (dưới chân tướng khi tung chiêu) | `vong-chieu-hoa.png` | 1 | 55–80 px | có |
| 27 | 2 | D | Vòng chiêu / hào quang hệ Thổ (dưới chân tướng khi tung chiêu) | `vong-chieu-tho.png` | 1 | 55–80 px | có |
| 28 | 2 | D | Hiệu ứng hit-spark · đòn choáng | `hit-spark.png` | 1 | 30×12 px | có |
| 29 | 2 | D | Hiệu ứng fire-burst · nổ lửa | `fire-burst.png` | 1 | theo bán kính chiêu | có |
| 30 | 2 | D | Hiệu ứng fire-pillar · cột lửa Thầy Mo | `fire-pillar.png` | 1 | 26×73 px | có |
| 31 | 2 | D | Hiệu ứng ice-ring · vòng băng | `ice-ring.png` | 1 | theo bán kính | có |
| 32 | 2 | D | Hiệu ứng freeze · mù sương / đóng băng | `freeze.png` | 1 | theo bán kính | có |
| 33 | 2 | D | Hiệu ứng water-wave · sóng nước | `water-wave.png` | 1 | theo bán kính | có |
| 34 | 2 | D | Hiệu ứng lightning · sét | `lightning.png` | 1 | ≈170 px cao | có |
| 35 | 2 | D | Hiệu ứng heal · hồi máu | `heal.png` | 1 | vòng + dấu cộng | có |
| 36 | 2 | D | Hiệu ứng streak · tia bắn thẳng | `streak.png` | 1 | đường 4 px | có |
| 37 | 2 | D | Hiệu ứng sweep · quét gậy tre | `sweep.png` | 1 | cung bán kính | có |
| 38 | 2 | D | Hiệu ứng warn · vùng cảnh báo | `warn.png` | 1 | elip bán kính | có |
| 39 | 2 | D | Hiệu ứng rain · mưa tên | `rain.png` | 1 | 22 nét trên vùng | có |
| 40 | 2 | E | Đá lăn Phong Châu (Lạc Hầu) | `hieu-ung_da-lan.png` | 1 | 24×20 px | có |
| 41 | 2 | E | Đèn trời ném | `hieu-ung_den-troi.png` | 1 | 11–20 px | có |
| 42 | 2 | E | Chai ném (Ngư Phủ) | `hieu-ung_chai.png` | 1 | 11–20 px | có |
| 43 | 2 | E | Bình gốm ném (Thợ Gốm) | `hieu-ung_binh-gom.png` | 1 | 11–20 px | có |
| 44 | 2 | E | Dưa hấu ném (An Tiêm, Sọ Dừa) | `hieu-ung_dua-hau.png` | 1 | 11–20 px | có |
| 45 | 2 | G | Nút tròn (quay lại / đóng) · thường / nhấn / khóa | `hc-nut-tron.png` | 3 | 36–44 px | chưa |
| 46 | 2 | H | Icon kỹ năng · Lạc Tướng | `icon-lactuong.png` | 4 | 28–44 px | có |
| 47 | 2 | H | Icon kỹ năng · Lực Sĩ Núi | `icon-lucsi.png` | 4 | 28–44 px | có |
| 48 | 2 | H | Icon kỹ năng · Xạ Thủ Văn Lang | `icon-xathu.png` | 4 | 28–44 px | có |
| 49 | 2 | H | Icon kỹ năng · Thợ Săn Rừng | `icon-thosan.png` | 4 | 28–44 px | có |
| 50 | 2 | H | Icon kỹ năng · Thầy Mo Lửa | `icon-thaymo.png` | 4 | 28–44 px | có |
| 51 | 2 | H | Icon kỹ năng · Thần Sương Núi | `icon-thansuong.png` | 4 | 28–44 px | có |
| 52 | 2 | H | Icon kỹ năng · Thánh Gióng | `icon-giong.png` | 4 | 28–44 px | có |
| 53 | 2 | H | Icon kỹ năng · Lạc Long Quân | `icon-llq.png` | 4 | 28–44 px | có |
| 54 | 2 | H | Icon kỹ năng · Thần Kim Quy | `icon-kimquy.png` | 4 | 28–44 px | có |
| 55 | 2 | H | Icon kỹ năng · Thạch Sanh | `icon-thachsanh.png` | 4 | 28–44 px | có |
| 56 | 2 | H | Icon kỹ năng · Cao Lỗ | `icon-caolo.png` | 4 | 28–44 px | có |
| 57 | 2 | H | Icon kỹ năng · Mai An Tiêm | `icon-antiem.png` | 4 | 28–44 px | có |
| 58 | 2 | H | Icon kỹ năng · Âu Cơ | `icon-auco.png` | 4 | 28–44 px | có |
| 59 | 2 | H | Icon kỹ năng · Chử Đồng Tử | `icon-cdt.png` | 4 | 28–44 px | có |
| 60 | 2 | H | Icon kỹ năng · Tiên Dung | `icon-tiendung.png` | 4 | 28–44 px | có |
| 61 | 2 | H | Icon kỹ năng · Lạc Hầu | `icon-lachau.png` | 4 | 28–44 px | có |
| 62 | 2 | H | Icon kỹ năng · Thần Săn Ba Vì | `icon-thansan.png` | 4 | 28–44 px | có |
| 63 | 2 | H | Icon kỹ năng · An Dương Vương | `icon-adv.png` | 4 | 28–44 px | có |
| 64 | 2 | H | Icon kỹ năng · Mẫu Thượng Ngàn | `icon-mau.png` | 4 | 28–44 px | có |
| 65 | 2 | H | Đồ ghép 1 | `hc-do-ghep-1.png` | 4 | 24–48 px | có |
| 66 | 2 | H | Đồ ghép 3 | `hc-do-ghep-3.png` | 4 | 24–48 px | có |
| 67 | 2 | I | Thắng · Sơn Tinh – Thủy Tinh | `thang-sontinh.png` | 1 | nền màn kết quả ≈844×390 | có |
| 68 | 2 | I | Thua · Sơn Tinh – Thủy Tinh | `thua-sontinh.png` | 1 | nền màn kết quả ≈844×390 | có |
| 69 | 2 | I | Thắng · Thạch Sanh | `thang-thachsanh.png` | 1 | nền màn kết quả ≈844×390 | có |
| 70 | 2 | I | Thua · Thạch Sanh | `thua-thachsanh.png` | 1 | nền màn kết quả ≈844×390 | có |
| 71 | 2 | I | Thắng · Thánh Gióng | `thang-giong.png` | 1 | nền màn kết quả ≈844×390 | có |
| 72 | 2 | I | Thua · Thánh Gióng | `thua-giong.png` | 1 | nền màn kết quả ≈844×390 | có |
| 73 | 2 | I | Thắng · Lạc Long Quân | `thang-llq.png` | 1 | nền màn kết quả ≈844×390 | có |
| 74 | 2 | I | Thua · Lạc Long Quân | `thua-llq.png` | 1 | nền màn kết quả ≈844×390 | có |
| 75 | 2 | I | Thắng · An Dương Vương | `thang-adv.png` | 1 | nền màn kết quả ≈844×390 | có |
| 76 | 2 | I | Thua · An Dương Vương | `thua-adv.png` | 1 | nền màn kết quả ≈844×390 | có |
| 77 | 2 | I | Bản đồ chương · Sơn Tinh – Thủy Tinh | `chuong-sontinh.png` | 1 | khung bản đồ chương ≈800×300 | có |
| 78 | 2 | I | Bản đồ chương · Thạch Sanh | `chuong-thachsanh.png` | 1 | khung bản đồ chương ≈800×300 | có |
| 79 | 2 | I | Bản đồ chương · Thánh Gióng | `chuong-giong.png` | 1 | khung bản đồ chương ≈800×300 | có |
| 80 | 2 | I | Bản đồ chương · Lạc Long Quân | `chuong-llq.png` | 1 | khung bản đồ chương ≈800×300 | có |
| 81 | 2 | I | Bản đồ chương · An Dương Vương | `chuong-adv.png` | 1 | khung bản đồ chương ≈800×300 | có |
| 82 | 3 | B | Dải thông báo (tên chiêu lớn, boss tới) | `hc-dai-thong-bao.png` | 1 | ≈260×44 px | có |
| 83 | 3 | B | Sao Thần tinh trên đầu tướng thần | `hc-sao-than-tinh.png` | 1 | 8×8 px (vẽ 16 px để nét) | có |
| 84 | 3 | D | Vụ nổ hệ Kim (đạn nổ lan) | `no-kim.png` | 1 | 50–90 px | có |
| 85 | 3 | D | Vụ nổ hệ Mộc (đạn nổ lan) | `no-moc.png` | 1 | 50–90 px | có |
| 86 | 3 | D | Vụ nổ hệ Thủy (đạn nổ lan) | `no-thuy.png` | 1 | 50–90 px | có |
| 87 | 3 | D | Vụ nổ hệ Hỏa (đạn nổ lan) | `no-hoa.png` | 1 | 50–90 px | có |
| 88 | 3 | D | Vụ nổ hệ Thổ (đạn nổ lan) | `no-tho.png` | 1 | 50–90 px | có |
| 89 | 3 | D | Boss chết (nổ lớn + cột sáng) | `chet-boss.png` | 1 | ≈90 px | có |
| 90 | 3 | D | Hiệu ứng dust · bụi khi chết (dự phòng chet-quai) | `dust.png` | 1 | 34 px | có |
| 91 | 3 | D | Hiệu ứng shield-gold · khiên vàng | `shield-gold.png` | 1 | nửa elip bán kính | có |
| 92 | 3 | D | Hiệu ứng rocks · đá rơi, nứt đất | `rocks.png` | 1 | 29×21 px | có |
| 93 | 3 | D | Hiệu ứng coins · rơi đồ | `coins.png` | 1 | 11 px | có |
| 94 | 3 | D | Hiệu ứng music-notes · nốt nhạc (Trương Chi, Thạch Sanh) | `music-notes.png` | 1 | 12 px | có |
| 95 | 3 | D | Hiệu ứng flood-rise · nước dâng cả màn | `flood-rise.png` | 1 | toàn màn | có |
| 96 | 3 | D | Hiệu ứng mountain-rise · mọc núi | `mountain-rise.png` | 1 | 34×24 px | có |
| 97 | 3 | D | Hiệu ứng afterimage · bóng lướt | `afterimage.png` | 1 | 5 bóng 9×21 px | có |
| 98 | 3 | D | Hiệu ứng hook · ném đá tảng / móc kéo | `hook.png` | 1 | dây + đầu 7 px | có |
| 99 | 3 | D | Hiệu ứng vortex · xoáy | `vortex.png` | 1 | 30 px | có |
| 100 | 3 | D | Hiệu ứng revive · hồi sinh | `revive.png` | 1 | 25×92 px | có |
| 101 | 3 | D | Hiệu ứng volley · loạt tên bắn lên | `volley.png` | 1 | 6 nét | có |
| 102 | 3 | D | Hiệu ứng mark · dấu săn mục tiêu | `mark.png` | 1 | 21–34 px | có |
| 103 | 3 | D | Hiệu ứng meteor · thiên thạch / Hỏa Sơn | `meteor.png` | 1 | 20 px + đuôi | có |
| 104 | 3 | E | Cây Đa Thần (Mẫu Thượng Ngàn) | `trieu-hoi_cay-da-than.png` | 1 | 34×60 px | có |
| 105 | 3 | E | Ngựa sắt (Thánh Gióng) | `trieu-hoi_ngua-sat.png` | 1 | 25×14 px | có |
| 106 | 3 | E | Gióng bay về trời | `trieu-hoi_giong-bay.png` | 1 | 18–32 px | có |
| 107 | 3 | E | Hổ Ba Vì vồ | `trieu-hoi_ho-ba-vi.png` | 1 | 21×13 px | có |
| 108 | 3 | E | Chim Lạc | `trieu-hoi_chim-lac.png` | 1 | 9–15 px | có |
| 109 | 3 | E | Chim Thần (Mai An Tiêm) | `trieu-hoi_chim-than.png` | 1 | 9–15 px | có |
| 110 | 3 | F | Icon vẽ tay ui_*.png (gọi sớm · khám phá · luyện · hũ · kho lúa · đồng vàng) | `hc-ui-ic.png` | 8 | 16–22 px (thẻ thưởng 100–300 px) | có |
| 111 | 3 | I | Núi Tản Viên · bậc 2 + bậc 5 | `hc-nui.png` | 2 | ô 100 px cao | có |
| 112 | 3 | I | Logo chữ "Thần Thoại Việt" (tùy chọn — AI hay viết sai dấu; sai thì bỏ, game dùng chữ HTML) | `logo-tua.png` | 1 | ≈420×110 px | có |

## Prompt

### #1 · Đế đặt tướng · 5 trạng thái

```
#1 · Đế đặt tướng · 5 trạng thái · nhóm A · ưu tiên 1
Lưu ảnh tên: hc-de-tuong.png   ·   Cắt: tools/cat-anh.html nhận tên hc-de-tuong.png → tách 5 vật theo thứ tự đọc (trái→phải, trên→dưới)
Tên file (trong assets/, đúng như code đang tìm): tiles/de-tuong-thuong.png · tiles/de-tuong-san-sang.png · tiles/de-tuong-chon.png · tiles/de-tuong-ngap.png · tiles/de-tuong-nui.png
Chỗ dùng: js/render.js:573-648 (drawSpot: đế tướng, chưa có ảnh thì vẽ elip + vòng trống đồng)
Cỡ hiện trên màn: ≈27×18 px trên màn 844×390 (≈40×27 ở 1920×934)   ·   Khung: tĩnh · 1 ảnh / trạng thái
Đã có prompt trong file tổng: CHƯA
```

```
Create ONE image: a 640x128 row of 5 equal 128x128 square game map tiles for a cute mobile tower-defense game, one per cell, left to right:
[1] a low round pedestal / plinth seen from a 3/4 top-down view, so it looks like a FLAT WIDE ELLIPSE (about 3 wide : 2 tall, the top face fills ~75% of the cell width), short visible side rim only a few pixels thick, the top face is EMPTY and flat (a hero stands on it), carved Dong Son bronze-drum ring pattern (sun-star in the middle, circle-dot band, zigzag rim) engraved very lightly on the top face, plain weathered grey-brown stone with dull bronze inlay, calm (normal empty spot)  [2] a low round pedestal / plinth seen from a 3/4 top-down view, so it looks like a FLAT WIDE ELLIPSE (about 3 wide : 2 tall, the top face fills ~75% of the cell width), short visible side rim only a few pixels thick, the top face is EMPTY and flat (a hero stands on it), carved Dong Son bronze-drum ring pattern (sun-star in the middle, circle-dot band, zigzag rim) engraved very lightly on the top face, same stone but the bronze inlay softly glows warm cream-white (ready to place a hero), faint light on the top face only  [3] a low round pedestal / plinth seen from a 3/4 top-down view, so it looks like a FLAT WIDE ELLIPSE (about 3 wide : 2 tall, the top face fills ~75% of the cell width), short visible side rim only a few pixels thick, the top face is EMPTY and flat (a hero stands on it), carved Dong Son bronze-drum ring pattern (sun-star in the middle, circle-dot band, zigzag rim) engraved very lightly on the top face, same stone with a bright gold rim glowing around the top edge and a golden sun-star (selected spot)  [4] a low round pedestal / plinth seen from a 3/4 top-down view, so it looks like a FLAT WIDE ELLIPSE (about 3 wide : 2 tall, the top face fills ~75% of the cell width), short visible side rim only a few pixels thick, the top face is EMPTY and flat (a hero stands on it), carved Dong Son bronze-drum ring pattern (sun-star in the middle, circle-dot band, zigzag rim) engraved very lightly on the top face, the stone half sunk under shallow blue river water, ripples and a few duckweed leaves on the water around it (flooded spot)  [5] a low round pedestal / plinth seen from a 3/4 top-down view, so it looks like a FLAT WIDE ELLIPSE (about 3 wide : 2 tall, the top face fills ~75% of the cell width), short visible side rim only a few pixels thick, the top face is EMPTY and flat (a hero stands on it), carved Dong Son bronze-drum ring pattern (sun-star in the middle, circle-dot band, zigzag rim) engraved very lightly on the top face, the stone pushed up on a small green-brown rocky mountain mound with grass tufts on the sides, top face still flat and empty (raised mountain spot).
Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading for a cute mobile game. All cells: the same camera angle, the same size and the same ellipse shape, centered in the cell, readable at 50 px, no characters on top, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #2 · Đế đặt tướng · theo chủ đề bản đồ

```
#2 · Đế đặt tướng · theo chủ đề bản đồ · nhóm A · ưu tiên 1
Lưu ảnh tên: hc-de-tuong-chu-de.png   ·   Cắt: tools/cat-anh.html nhận tên hc-de-tuong-chu-de.png → tách 5 vật theo thứ tự đọc (trái→phải, trên→dưới)
Tên file (trong assets/, đúng như code đang tìm): tiles/de-tuong-co.png · tiles/de-tuong-dat.png · tiles/de-tuong-da.png · tiles/de-tuong-cat.png · tiles/de-tuong-gach.png
Chỗ dùng: js/render.js:573-648 (drawSpot: đế tướng, chưa có ảnh thì vẽ elip + vòng trống đồng)
Cỡ hiện trên màn: ≈27×18 px trên màn 844×390 (≈40×27 ở 1920×934)   ·   Khung: tĩnh · 1 ảnh / trạng thái
Đã có prompt trong file tổng: CHƯA
```

```
Create ONE image: a 640x128 row of 5 equal 128x128 square game map tiles for a cute mobile tower-defense game, one per cell, left to right:
[1] a low round pedestal / plinth seen from a 3/4 top-down view, so it looks like a FLAT WIDE ELLIPSE (about 3 wide : 2 tall, the top face fills ~75% of the cell width), short visible side rim only a few pixels thick, the top face is EMPTY and flat (a hero stands on it), carved Dong Son bronze-drum ring pattern (sun-star in the middle, circle-dot band, zigzag rim) engraved very lightly on the top face, made of packed earth with a ring of short green grass and two tiny reeds (river / marsh / rice-field maps)  [2] a low round pedestal / plinth seen from a 3/4 top-down view, so it looks like a FLAT WIDE ELLIPSE (about 3 wide : 2 tall, the top face fills ~75% of the cell width), short visible side rim only a few pixels thick, the top face is EMPTY and flat (a hero stands on it), carved Dong Son bronze-drum ring pattern (sun-star in the middle, circle-dot band, zigzag rim) engraved very lightly on the top face, a flat old tree-stump slice with roots and moss around the rim (forest map)  [3] a low round pedestal / plinth seen from a 3/4 top-down view, so it looks like a FLAT WIDE ELLIPSE (about 3 wide : 2 tall, the top face fills ~75% of the cell width), short visible side rim only a few pixels thick, the top face is EMPTY and flat (a hero stands on it), carved Dong Son bronze-drum ring pattern (sun-star in the middle, circle-dot band, zigzag rim) engraved very lightly on the top face, dark cave stone slab with two small blue glowing crystals at the rim (cave map)  [4] a low round pedestal / plinth seen from a 3/4 top-down view, so it looks like a FLAT WIDE ELLIPSE (about 3 wide : 2 tall, the top face fills ~75% of the cell width), short visible side rim only a few pixels thick, the top face is EMPTY and flat (a hero stands on it), carved Dong Son bronze-drum ring pattern (sun-star in the middle, circle-dot band, zigzag rim) engraved very lightly on the top face, pale sandstone with small seashells and a bit of sand at the rim (sea shore map)  [5] a low round pedestal / plinth seen from a 3/4 top-down view, so it looks like a FLAT WIDE ELLIPSE (about 3 wide : 2 tall, the top face fills ~75% of the cell width), short visible side rim only a few pixels thick, the top face is EMPTY and flat (a hero stands on it), carved Dong Son bronze-drum ring pattern (sun-star in the middle, circle-dot band, zigzag rim) engraved very lightly on the top face, fitted old red-brown bricks and a bronze rim like a citadel tower base (citadel map).
Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading for a cute mobile game. All cells: the same camera angle, the same size and the same ellipse shape, centered in the cell, readable at 50 px, no characters on top, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #3 · Khung thanh máu boss / tướng / quái

```
#3 · Khung thanh máu boss / tướng / quái · nhóm B · ưu tiên 1
Lưu ảnh tên: hc-thanh-mau.png   ·   Cắt: tools/cat-anh.html nhận tên hc-thanh-mau.png → tách 3 vật theo thứ tự đọc (trái→phải, trên→dưới)
Tên file (trong assets/, đúng như code đang tìm): ui/thanh-mau-boss.png · ui/thanh-mau-tuong.png · ui/thanh-mau-quai.png
Chỗ dùng: js/main.js:702-710 (máu tướng) · js/render.js:2278-2298 (máu quái / boss) · thanh boss HTML #bossbar
Cỡ hiện trên màn: tướng 22×3 · quái 16–40×2 · boss ~300×10 px (844×390)   ·   Khung: 3 khung tĩnh (boss · tướng · quái); ruột thanh vẫn vẽ code
Đã có prompt trong file tổng: CHƯA
```

```
Create ONE image: a 1024x384 game UI sheet, an invisible 1x3 grid of 3 equal 1024x128 cells, one element per cell, read left to right, top to bottom:
[1] very long thin BOSS health bar frame (about 8:1): dark iron and red-bronze with a small horned demon-mask cap on the left end and a spiked cap on the right end; the inside of the bar is an EMPTY flat magenta slot
[2] long thin HERO health bar frame (about 8:1): slim polished bronze with tiny sun-star rivets at both ends; the inside is an EMPTY flat magenta slot
[3] long thin ENEMY health bar frame (about 8:1): slim dark iron with tiny claw tips at both ends; the inside is an EMPTY flat magenta slot.
Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading for a cute mobile game. Same lighting and the same bronze palette in every cell; elements fill about 90% of their cell; straight, symmetric, front view (no perspective), no text, no letters, no numbers, no icons inside.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #4 · Đạn bay theo hệ (Kim · Mộc · Thủy · Hỏa · Thổ)

```
#4 · Đạn bay theo hệ (Kim · Mộc · Thủy · Hỏa · Thổ) · nhóm C · ưu tiên 1
Lưu ảnh tên: dan-he.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên dan-he.png (cat-fx.py hat dan-he.png dan-kim dan-moc dan-thuy dan-hoa dan-tho --mau)
Tên file (trong assets/, đúng như code đang tìm): fx/dan-kim.png · fx/dan-moc.png · fx/dan-thuy.png · fx/dan-hoa.png · fx/dan-tho.png
Chỗ dùng: js/main.js:390-466 drawProjectile (đạn theo hệ khi loại đạn chưa có ảnh riêng)
Cỡ hiện trên màn: 7–12 px   ·   Khung: 1 ảnh / hệ, game tự xoay theo hướng bay
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1280x256 row of five equal 256x256 square cells, one small flying magic projectile per cell, left to right, all pointing RIGHT where they have a direction, one per Vietnamese five-element (ngu hanh):
[1] METAL: a spinning silver-white metal blade shard with a bronze edge and a tiny golden spark tail, pointing RIGHT.
[2] WOOD: a glowing green leaf dart with a small curling vine and two tiny leaves behind it, pointing RIGHT.
[3] WATER: a blue water orb with a white swirl inside and a short splashing water tail, flying RIGHT.
[4] FIRE: a red-orange fireball with a yellow core and a short flickering flame tail, flying RIGHT.
[5] EARTH: a golden-brown rock clod with small cracks and a dusty trail, flying RIGHT.
Each projectile centered, about 60% of the cell, bold and readable at 20 px, the five clearly different in shape and color.
STYLE: cute mobile-game art matching chibi heroes of a Vietnamese folk-legend tower-defense game: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), a small bright glow core, about 10-15 flat colors per projectile, no gradients.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the projectiles. No text, no numbers, no labels, no grid lines, no borders, no watermark. At least 8% empty margin in every cell; nothing crosses into another cell.
```

### #5 · Trúng đòn hệ Kim (đạn chạm quái)

```
#5 · Trúng đòn hệ Kim (đạn chạm quái) · nhóm D · ưu tiên 1
Lưu ảnh tên: trung-kim.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên trung-kim.png (cat-fx.py dai trung-kim.png trung-kim)
Tên file (trong assets/, đúng như code đang tìm): vfx/trung-kim.png
Chỗ dùng: js/main.js:1028 drawFxArt impact (đạn trúng quái)
Cỡ hiện trên màn: 34–46 px   ·   Khung: dải 6 khung (1536×256)
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: a SMALL METAL hit spark when a projectile strikes an enemy: silver-white star sparks and tiny metal shards flying out from the center, a sharp white cross flash. [1] tiny flash at the center [2] flash opening [3] full burst [4] pieces flying outward [5] pieces small and scattered [6] last faint bits.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every frame with at least 6% empty margin; nothing crosses into another frame.
```

### #6 · Trúng đòn hệ Mộc (đạn chạm quái)

```
#6 · Trúng đòn hệ Mộc (đạn chạm quái) · nhóm D · ưu tiên 1
Lưu ảnh tên: trung-moc.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên trung-moc.png (cat-fx.py dai trung-moc.png trung-moc)
Tên file (trong assets/, đúng như code đang tìm): vfx/trung-moc.png
Chỗ dùng: js/main.js:1028 drawFxArt impact (đạn trúng quái)
Cỡ hiện trên màn: 34–46 px   ·   Khung: dải 6 khung (1536×256)
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: a SMALL WOOD hit spark when a projectile strikes an enemy: green leaves and small yellow pollen dots bursting out, a soft green flash. [1] tiny flash at the center [2] flash opening [3] full burst [4] pieces flying outward [5] pieces small and scattered [6] last faint bits.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every frame with at least 6% empty margin; nothing crosses into another frame.
```

### #7 · Trúng đòn hệ Thủy (đạn chạm quái)

```
#7 · Trúng đòn hệ Thủy (đạn chạm quái) · nhóm D · ưu tiên 1
Lưu ảnh tên: trung-thuy.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên trung-thuy.png (cat-fx.py dai trung-thuy.png trung-thuy)
Tên file (trong assets/, đúng như code đang tìm): vfx/trung-thuy.png
Chỗ dùng: js/main.js:1028 drawFxArt impact (đạn trúng quái)
Cỡ hiện trên màn: 34–46 px   ·   Khung: dải 6 khung (1536×256)
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: a SMALL WATER hit spark when a projectile strikes an enemy: a blue water splash: droplets flying out in a crown shape, white foam. [1] tiny flash at the center [2] flash opening [3] full burst [4] pieces flying outward [5] pieces small and scattered [6] last faint bits.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every frame with at least 6% empty margin; nothing crosses into another frame.
```

### #8 · Trúng đòn hệ Hỏa (đạn chạm quái)

```
#8 · Trúng đòn hệ Hỏa (đạn chạm quái) · nhóm D · ưu tiên 1
Lưu ảnh tên: trung-hoa.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên trung-hoa.png (cat-fx.py dai trung-hoa.png trung-hoa)
Tên file (trong assets/, đúng như code đang tìm): vfx/trung-hoa.png
Chỗ dùng: js/main.js:1028 drawFxArt impact (đạn trúng quái)
Cỡ hiện trên màn: 34–46 px   ·   Khung: dải 6 khung (1536×256)
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: a SMALL FIRE hit spark when a projectile strikes an enemy: a small fire burst: orange flames and embers popping out, a yellow flash. [1] tiny flash at the center [2] flash opening [3] full burst [4] pieces flying outward [5] pieces small and scattered [6] last faint bits.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every frame with at least 6% empty margin; nothing crosses into another frame.
```

### #9 · Trúng đòn hệ Thổ (đạn chạm quái)

```
#9 · Trúng đòn hệ Thổ (đạn chạm quái) · nhóm D · ưu tiên 1
Lưu ảnh tên: trung-tho.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên trung-tho.png (cat-fx.py dai trung-tho.png trung-tho)
Tên file (trong assets/, đúng như code đang tìm): vfx/trung-tho.png
Chỗ dùng: js/main.js:1028 drawFxArt impact (đạn trúng quái)
Cỡ hiện trên màn: 34–46 px   ·   Khung: dải 6 khung (1536×256)
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: a SMALL EARTH hit spark when a projectile strikes an enemy: a dust puff with small brown pebbles bouncing out, a yellow-brown flash. [1] tiny flash at the center [2] flash opening [3] full burst [4] pieces flying outward [5] pieces small and scattered [6] last faint bits.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every frame with at least 6% empty margin; nothing crosses into another frame.
```

### #10 · Quái chết (khói tan)

```
#10 · Quái chết (khói tan) · nhóm D · ưu tiên 1
Lưu ảnh tên: chet-quai.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên chet-quai.png (cat-fx.py dai chet-quai.png chet-quai)
Tên file (trong assets/, đúng như code đang tìm): vfx/chet-quai.png
Chỗ dùng: js/main.js:1044, 1822 (quái chết: 8 chấm code + khói)
Cỡ hiện trên màn: ≈34 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: a small cartoon monster defeat poof: [1] small white flash star [2] round puff of pale grey-blue smoke with a thick outline [3] bigger cloud puff with two tiny spinning stars [4] cloud breaking into three small puffs, a tiny cute ghost wisp rising from the top [5] puffs shrinking, wisp higher and fading [6] last tiny puff.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every frame with at least 6% empty margin; nothing crosses into another frame.
```

### #11 · Hiệu ứng slash-gold · chém của 30 tướng cận chiến

```
#11 · Hiệu ứng slash-gold · chém của 30 tướng cận chiến · nhóm D · ưu tiên 1
Lưu ảnh tên: slash-gold.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên slash-gold.png (cat-fx.py dai slash-gold.png slash-gold)
Tên file (trong assets/, đúng như code đang tìm): vfx/slash-gold.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (slash / xslash / claw — chém của 30 tướng cận chiến)
Cỡ hiện trên màn: 22–34 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a golden sword slash: [1] thin bright line starting at the upper left [2] crescent slash arc half drawn [3] full wide golden crescent slash with white core [4] second crossing slash forming an X [5] slashes thinning with sparks [6] faint golden sparks.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #12 · Hiệu ứng spawn-ring · đặt tướng / triệu hồi

```
#12 · Hiệu ứng spawn-ring · đặt tướng / triệu hồi · nhóm D · ưu tiên 1
Lưu ảnh tên: spawn-ring.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên spawn-ring.png (cat-fx.py dai spawn-ring.png spawn-ring)
Tên file (trong assets/, đúng như code đang tìm): vfx/spawn-ring.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (summon — đặt tướng / triệu hồi)
Cỡ hiện trên màn: 30×21 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a summoning circle (flattened ellipse on the ground): [1] small green-gold ring appears [2] ring expands with circle-dot bronze-drum pattern [3] light column rising from the ring [4] bright flash with a sun-star in the middle [5] column fading [6] ring fading.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #13 · Hiệu ứng ring · vòng sóng toả (lên cấp, đánh lan)

```
#13 · Hiệu ứng ring · vòng sóng toả (lên cấp, đánh lan) · nhóm D · ưu tiên 1
Lưu ảnh tên: ring.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên ring.png (cat-fx.py dai ring.png ring)
Tên file (trong assets/, đúng như code đang tìm): vfx/ring.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (ring — vòng sóng toả (lên cấp, đánh lan))
Cỡ hiện trên màn: theo bán kính   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-GUI-AI.txt, PROMPT_GEMINI_FULL.txt, PROMPT-CAN-GEN.txt, PROMPT-HIEU-UNG.txt, PROMPT-FOOOCUS.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a thin expanding shockwave ring (flattened ellipse): [1] small ring [2] bigger [3] bigger and brighter [4] biggest [5] thin [6] gone.
STYLE: game VFX animation frames in the style of the free Kenney Particle Pack: ONLY pure white and light-grey shapes on a perfectly flat pure BLACK #000000 background, soft glowing edges, bright core, NO color at all (the game tints it), no outline, no shading other than brightness, no text, no numbers, no labels, no grid lines, no borders, no watermark. Each shape centered in every frame with at least 8% empty black margin; nothing touches or crosses into another cell.
```

### #14 · Icon nhỏ · ic-trang-thai-1

```
#14 · Icon nhỏ · ic-trang-thai-1 · nhóm F · ưu tiên 1
Lưu ảnh tên: hc-ic-trang-thai-1.png   ·   Cắt: tools/cat-anh.html nhận tên hc-ic-trang-thai-1.png → tách 5 vật theo thứ tự đọc (trái→phải, trên→dưới)
Tên file (trong assets/, đúng như code đang tìm): ui/ic-cham.png · ui/ic-choang.png · ui/ic-dot.png · ui/ic-doc.png · ui/ic-dong-bang.png
Chỗ dùng: js/ui.js:78-133 ic() → thanh boss (js/ui.js:2207-2223): chậm · choáng · đốt · độc · đóng băng — chưa có ảnh thì vẽ SVG IC_SVG · bảng chỗ dùng: docs/ICON-NHO.md
Cỡ hiện trên màn: 12–14 px trên thanh boss (vẽ 128, cắt 64)   ·   Khung: tĩnh
Đã có prompt trong file tổng: CHƯA
Ghi chú: Tấm cũ trong assets/chua-dung/ cắt hỏng (ra 7 vật thay vì 5 / 4) → gen lại, mỗi ô MỘT vật rời, không chữ dưới icon.
```

```
Create ONE image: a 640x128 row of 5 equal 128x128 square TINY game UI icons (status / stat icons), one per cell, left to right:
[1] slowed: a small brown snail  [2] stunned: three yellow stars circling in a ring  [3] burning: an orange-red flame  [4] poisoned: a green poison drop with a tiny skull  [5] frozen: a light-blue ice crystal snowflake.
Dong Son bronze-drum style kept minimal: warm bronze gold #C9963A and dark green patina #2F6B5E accents, flat cartoon shading for a cute mobile game, at most one tiny zigzag or circle-dot accent (no rings, no birds, no busy engraving). These icons are shown VERY SMALL (16-20 px on a phone): one big simple silhouette that fills about 80% of the cell, VERY thick dark-brown outline #2A1608, at most 2-3 flat colors, no thin lines, no tiny details, no background shapes unless described, high contrast, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #15 · Icon nhỏ · ic-trang-thai-3

```
#15 · Icon nhỏ · ic-trang-thai-3 · nhóm F · ưu tiên 1
Lưu ảnh tên: hc-ic-trang-thai-3.png   ·   Cắt: tools/cat-anh.html nhận tên hc-ic-trang-thai-3.png → tách 4 vật theo thứ tự đọc (trái→phải, trên→dưới)
Tên file (trong assets/, đúng như code đang tìm): ui/ic-boss.png · ui/ic-cam-lang.png · ui/ic-tinh-anh.png · ui/ic-lan.png
Chỗ dùng: js/ui.js:78-133 ic() → thẻ boss / tinh anh trên thanh boss (js/ui.js:2213, 2560) + câm lặng · lặn · bảng chỗ dùng: docs/ICON-NHO.md
Cỡ hiện trên màn: 12–14 px trên thanh boss (vẽ 128, cắt 64)   ·   Khung: tĩnh
Đã có prompt trong file tổng: CHƯA
Ghi chú: Tấm cũ trong assets/chua-dung/ cắt hỏng (ra 7 vật thay vì 5 / 4) → gen lại, mỗi ô MỘT vật rời, không chữ dưới icon.
```

```
Create ONE image: a 512x128 row of 4 equal 128x128 square TINY game UI icons (status / stat icons), one per cell, left to right:
[1] boss: a red demon crown with two small horns  [2] silenced: a cream speech bubble crossed by a red slash  [3] elite: a purple faceted gem  [4] diving underwater: two blue wave lines with bubbles.
Dong Son bronze-drum style kept minimal: warm bronze gold #C9963A and dark green patina #2F6B5E accents, flat cartoon shading for a cute mobile game, at most one tiny zigzag or circle-dot accent (no rings, no birds, no busy engraving). These icons are shown VERY SMALL (16-20 px on a phone): one big simple silhouette that fills about 80% of the cell, VERY thick dark-brown outline #2A1608, at most 2-3 flat colors, no thin lines, no tiny details, no background shapes unless described, high contrast, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #16 · Khung bảng / popup (giấy dó viền đồng, 9 mảnh)

```
#16 · Khung bảng / popup (giấy dó viền đồng, 9 mảnh) · nhóm G · ưu tiên 1
Lưu ảnh tên: hc-khung-bang.png   ·   Cắt: tools/cat-anh.html nhận tên hc-khung-bang.png → tách 1 vật theo thứ tự đọc (trái→phải, trên→dưới)
Tên file (trong assets/, đúng như code đang tìm): ui/khung-bang.png
Chỗ dùng: js/ui.js:37-53 UI_SKIN → css biến --sk-khung-bang (mọi bảng / popup: Cài đặt, Túi đồ, Lò đúc…)
Cỡ hiện trên màn: bảng 300–800 px (9-slice)   ·   Khung: 1 khung
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 1024x1024 game UI sheet, one element centered:
one square panel frame: thick bronze border with ornate Dong Son corner pieces (sun-star discs) and PLAIN straight edges between the corners (so the frame can be stretched as 9-slice), the inside filled with flat dark aged paper #17130F with very faint fiber texture; corners take about 22% of the width.
Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading for a cute mobile game. Same lighting and the same bronze palette in every cell; elements fill about 90% of their cell; straight, symmetric, front view (no perspective), no text, no letters, no numbers, no icons inside.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #17 · Nút chữ nhật vàng + đồng · thường / nhấn / khóa

```
#17 · Nút chữ nhật vàng + đồng · thường / nhấn / khóa · nhóm G · ưu tiên 1
Lưu ảnh tên: hc-nut-chu-nhat.png   ·   Cắt: tools/cat-anh.html nhận tên hc-nut-chu-nhat.png → tách 6 vật theo thứ tự đọc (trái→phải, trên→dưới)
Tên file (trong assets/, đúng như code đang tìm): ui/nut-vang-thuong.png · ui/nut-vang-nhan.png · ui/nut-vang-khoa.png · ui/nut-dong-thuong.png · ui/nut-dong-nhan.png · ui/nut-dong-khoa.png
Chỗ dùng: js/ui.js:37-53 UI_SKIN nut-vang-* / nut-dong-* (nút Vào trận, Xuất quân, Mua…)
Cỡ hiện trên màn: nút 120–240×36–48 px   ·   Khung: 3 trạng thái × 2 màu
Đã có prompt trong file tổng: CHƯA
```

```
Create ONE image: a 1536x512 game UI sheet, an invisible 3x2 grid of 6 equal 512x256 cells, one element per cell, read left to right, top to bottom:
[1] wide rectangular GOLD button (3:1), polished gold-bronze with a zigzag border and small sun-star studs at both ends, empty smooth middle for text — NORMAL state, bright with a top highlight
[2] the same GOLD button — PRESSED state: slightly darker, highlight moved to the bottom, looks pushed in by 2 px
[3] the same GOLD button — DISABLED state: desaturated grey-brown, dull, no shine
[4] wide rectangular BRONZE button (3:1), dark brown-bronze with patina-green trims and a circle-dot border, empty middle — NORMAL state
[5] the same BRONZE button — PRESSED state: darker, pushed in
[6] the same BRONZE button — DISABLED state: grey, dull.
Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading for a cute mobile game. Same lighting and the same bronze palette in every cell; elements fill about 90% of their cell; straight, symmetric, front view (no perspective), no text, no letters, no numbers, no icons inside.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #18 · Khung thanh đáy (chợ tướng trong trận)

```
#18 · Khung thanh đáy (chợ tướng trong trận) · nhóm G · ưu tiên 1
Lưu ảnh tên: hc-khung-thanh-day.png   ·   Cắt: tools/cat-anh.html nhận tên hc-khung-thanh-day.png → tách 1 vật theo thứ tự đọc (trái→phải, trên→dưới)
Tên file (trong assets/, đúng như code đang tìm): ui/khung-thanh-day.png
Chỗ dùng: js/ui.js:37-53 UI_SKIN khung-thanh-day (thanh chợ tướng dưới đáy trận)
Cỡ hiện trên màn: ≈700×70 px   ·   Khung: 1 khung
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 1600x320 game UI sheet, one element centered:
one very wide low tray frame (5:1) for the bottom bar of a game screen: carved bronze rim with a zigzag band, small Lac birds at both ends, a slightly raised center, the inside filled with flat dark bronze #1E1810 (cards are drawn on top).
Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading for a cute mobile game. Same lighting and the same bronze palette in every cell; elements fill about 90% of their cell; straight, symmetric, front view (no perspective), no text, no letters, no numbers, no icons inside.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #19 · Khung thẻ chợ tướng + nút đổi

```
#19 · Khung thẻ chợ tướng + nút đổi · nhóm G · ưu tiên 1
Lưu ảnh tên: hc-khung-the-cho.png   ·   Cắt: tools/cat-anh.html nhận tên hc-khung-the-cho.png → tách 4 vật theo thứ tự đọc (trái→phải, trên→dưới)
Tên file (trong assets/, đúng như code đang tìm): ui/the-cho-thuong.png · ui/the-cho-ghep.png · ui/the-cho-thieu.png · ui/nut-doi-cho.png
Chỗ dùng: js/ui.js:37-53 UI_SKIN the-cho-* + nut-doi-cho (thẻ tướng trong chợ trận)
Cỡ hiện trên màn: ≈80×64 px   ·   Khung: 3 trạng thái thẻ + nút đổi
Đã có prompt trong file tổng: CHƯA
```

```
Create ONE image: a 1024x256 game UI sheet, an invisible 4x1 grid of 4 equal 256x256 cells, one element per cell, read left to right, top to bottom:
[1] landscape card frame (5:4) of plain bronze with rounded corners and an EMPTY magenta window inside (a hero portrait is drawn there) — NORMAL
[2] the same card frame glowing gold with sparkles — CAN MERGE (ghép)
[3] the same card frame dull grey-brown and cracked — NOT ENOUGH GOLD
[4] small square bronze button plate with rounded corners and an EMPTY dark center — REROLL button base.
Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading for a cute mobile game. Same lighting and the same bronze palette in every cell; elements fill about 90% of their cell; straight, symmetric, front view (no perspective), no text, no letters, no numbers, no icons inside.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #20 · Nền đồng tối cho màn phụ

```
#20 · Nền đồng tối cho màn phụ · nhóm I · ưu tiên 1
Lưu ảnh tên: nen-man-phu.png   ·   Cắt: không cần cắt — đổi tên đúng "scenes/nen-man-phu.png" rồi để vào zip (đúng thư mục)
Tên file (trong assets/, đúng như code đang tìm): scenes/nen-man-phu.png
Chỗ dùng: js/ui.js:52 loadUiSkins → css --sk-nen-man-phu (Chuẩn bị · Kết quả · Phần thưởng)
Cỡ hiện trên màn: toàn màn   ·   Khung: 1 tranh
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 1792x832 wide background texture (full bleed) for secondary screens (prepare for battle, results, rewards) of a cute mobile tower-defense game based on Vietnamese folk legends.
CONTENT: a dark aged bronze drum surface seen from the front, very low contrast: faint concentric rings, a dim sun-star in the center, Lac birds and zigzag bands engraved softly, warm dark brown #1A140E to deep patina green #16231F, a soft vignette. It must stay DARK and calm so white and gold text is readable on top.
No text, no letters, no numbers, no UI, no frame, no watermark.
```

### #21 · Đạn riêng 1: cầu lửa · mũi băng · mũi tên · tên nỏ · cầu phép

```
#21 · Đạn riêng 1: cầu lửa · mũi băng · mũi tên · tên nỏ · cầu phép · nhóm C · ưu tiên 2
Lưu ảnh tên: dan-1.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên dan-1.png (cat-fx.py hat dan-1.png dan_fireball dan_frostbolt dan_arrow dan_bolt dan_orb --mau)
Tên file (trong assets/, đúng như code đang tìm): fx/dan_fireball.png · fx/dan_frostbolt.png · fx/dan_arrow.png · fx/dan_bolt.png · fx/dan_orb.png
Chỗ dùng: js/main.js:394 fx/dan_<loại>.png (cầu lửa · băng · tên · tên nỏ vàng · cầu phép)
Cỡ hiện trên màn: 7–12 px   ·   Khung: 1 ảnh / loại
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 640x128 row of five equal 128x128 square cells, one small flying projectile per cell, left to right, all pointing RIGHT where they have a direction:
[1] a small flaming fireball flying RIGHT with a short fire tail.
[2] an ice shard bolt flying RIGHT, pale blue crystal with frosty trail.
[3] a wooden arrow with a bronze head and white feather fletching pointing RIGHT.
[4] a short crossbow bolt (no) pointing RIGHT, bronze tip, golden glint.
[5] a glowing water orb, light-blue sphere with a white swirl inside.
Each projectile centered, about 60% of the cell, bold and readable at 16 px.
STYLE: cute mobile-game art matching chibi heroes of a Vietnamese folk-legend tower-defense game: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds), about 20-30 flat colors, no gradients.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #22 · Đạn riêng 2: lông vũ · cánh hoa · dưa hấu · hạt lúa · phép quái

```
#22 · Đạn riêng 2: lông vũ · cánh hoa · dưa hấu · hạt lúa · phép quái · nhóm C · ưu tiên 2
Lưu ảnh tên: dan-2.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên dan-2.png (cat-fx.py hat dan-2.png dan_feather dan_petal dan_melon dan_rice dan_evil --mau)
Tên file (trong assets/, đúng như code đang tìm): fx/dan_feather.png · fx/dan_petal.png · fx/dan_melon.png · fx/dan_rice.png · fx/dan_evil.png
Chỗ dùng: js/main.js:394 fx/dan_<loại>.png (lông vũ · cánh hoa · dưa hấu · hạt lúa · phép quái)
Cỡ hiện trên màn: 7–12 px   ·   Khung: 1 ảnh / loại
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 640x128 row of five equal 128x128 square cells, one small flying projectile per cell, left to right, all pointing RIGHT where they have a direction:
[1] a single glowing white-pink goose feather flying RIGHT.
[2] a pink lotus petal spinning, soft glow.
[3] a small green watermelon (Mai An Tiem) with dark stripes.
[4] a small bundle of golden rice grains flying RIGHT.
[5] a dark-blue evil water spirit ball with a grumpy face and a wispy tail, flying RIGHT.
Each projectile centered, about 60% of the cell, bold and readable at 16 px.
STYLE: cute mobile-game art matching chibi heroes of a Vietnamese folk-legend tower-defense game: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds), about 20-30 flat colors, no gradients.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #23 · Vòng chiêu / hào quang hệ Kim (dưới chân tướng khi tung chiêu)

```
#23 · Vòng chiêu / hào quang hệ Kim (dưới chân tướng khi tung chiêu) · nhóm D · ưu tiên 2
Lưu ảnh tên: vong-chieu-kim.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên vong-chieu-kim.png (cat-fx.py dai vong-chieu-kim.png vong-chieu-kim)
Tên file (trong assets/, đúng như code đang tìm): vfx/vong-chieu-kim.png
Chỗ dùng: js/main.js:1036 drawFxArt cast (vòng dưới chân khi tung chiêu)
Cỡ hiện trên màn: 55–80 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: a METAL magic casting circle on the ground under a hero, drawn as a PERFECT ROUND circle seen from directly above (the game flattens it into an ellipse): a bronze-drum sun-star in the middle, concentric rings with circle-dot bands, colors silver-white and pale gold, a ring of small sword-blade shapes pointing outward. [1] thin ring appearing [2] ring growing, symbols drawing in [3] full bright circle with small rising sparkles [4] circle turned a little, still bright [5] dimmer [6] faint ring fading.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every frame with at least 6% empty margin; nothing crosses into another frame.
```

### #24 · Vòng chiêu / hào quang hệ Mộc (dưới chân tướng khi tung chiêu)

```
#24 · Vòng chiêu / hào quang hệ Mộc (dưới chân tướng khi tung chiêu) · nhóm D · ưu tiên 2
Lưu ảnh tên: vong-chieu-moc.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên vong-chieu-moc.png (cat-fx.py dai vong-chieu-moc.png vong-chieu-moc)
Tên file (trong assets/, đúng như code đang tìm): vfx/vong-chieu-moc.png
Chỗ dùng: js/main.js:1036 drawFxArt cast (vòng dưới chân khi tung chiêu)
Cỡ hiện trên màn: 55–80 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: a WOOD magic casting circle on the ground under a hero, drawn as a PERFECT ROUND circle seen from directly above (the game flattens it into an ellipse): a bronze-drum sun-star in the middle, concentric rings with circle-dot bands, colors fresh green with brown wood, a ring of leaves and tiny sprouts. [1] thin ring appearing [2] ring growing, symbols drawing in [3] full bright circle with small rising sparkles [4] circle turned a little, still bright [5] dimmer [6] faint ring fading.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every frame with at least 6% empty margin; nothing crosses into another frame.
```

### #25 · Vòng chiêu / hào quang hệ Thủy (dưới chân tướng khi tung chiêu)

```
#25 · Vòng chiêu / hào quang hệ Thủy (dưới chân tướng khi tung chiêu) · nhóm D · ưu tiên 2
Lưu ảnh tên: vong-chieu-thuy.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên vong-chieu-thuy.png (cat-fx.py dai vong-chieu-thuy.png vong-chieu-thuy)
Tên file (trong assets/, đúng như code đang tìm): vfx/vong-chieu-thuy.png
Chỗ dùng: js/main.js:1036 drawFxArt cast (vòng dưới chân khi tung chiêu)
Cỡ hiện trên màn: 55–80 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: a WATER magic casting circle on the ground under a hero, drawn as a PERFECT ROUND circle seen from directly above (the game flattens it into an ellipse): a bronze-drum sun-star in the middle, concentric rings with circle-dot bands, colors light blue and white, a ring of curling waves and droplets. [1] thin ring appearing [2] ring growing, symbols drawing in [3] full bright circle with small rising sparkles [4] circle turned a little, still bright [5] dimmer [6] faint ring fading.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every frame with at least 6% empty margin; nothing crosses into another frame.
```

### #26 · Vòng chiêu / hào quang hệ Hỏa (dưới chân tướng khi tung chiêu)

```
#26 · Vòng chiêu / hào quang hệ Hỏa (dưới chân tướng khi tung chiêu) · nhóm D · ưu tiên 2
Lưu ảnh tên: vong-chieu-hoa.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên vong-chieu-hoa.png (cat-fx.py dai vong-chieu-hoa.png vong-chieu-hoa)
Tên file (trong assets/, đúng như code đang tìm): vfx/vong-chieu-hoa.png
Chỗ dùng: js/main.js:1036 drawFxArt cast (vòng dưới chân khi tung chiêu)
Cỡ hiện trên màn: 55–80 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: a FIRE magic casting circle on the ground under a hero, drawn as a PERFECT ROUND circle seen from directly above (the game flattens it into an ellipse): a bronze-drum sun-star in the middle, concentric rings with circle-dot bands, colors red-orange and gold, a ring of small flames. [1] thin ring appearing [2] ring growing, symbols drawing in [3] full bright circle with small rising sparkles [4] circle turned a little, still bright [5] dimmer [6] faint ring fading.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every frame with at least 6% empty margin; nothing crosses into another frame.
```

### #27 · Vòng chiêu / hào quang hệ Thổ (dưới chân tướng khi tung chiêu)

```
#27 · Vòng chiêu / hào quang hệ Thổ (dưới chân tướng khi tung chiêu) · nhóm D · ưu tiên 2
Lưu ảnh tên: vong-chieu-tho.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên vong-chieu-tho.png (cat-fx.py dai vong-chieu-tho.png vong-chieu-tho)
Tên file (trong assets/, đúng như code đang tìm): vfx/vong-chieu-tho.png
Chỗ dùng: js/main.js:1036 drawFxArt cast (vòng dưới chân khi tung chiêu)
Cỡ hiện trên màn: 55–80 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: a EARTH magic casting circle on the ground under a hero, drawn as a PERFECT ROUND circle seen from directly above (the game flattens it into an ellipse): a bronze-drum sun-star in the middle, concentric rings with circle-dot bands, colors ochre yellow and earth brown, a ring of small rocks and mountain-peak shapes. [1] thin ring appearing [2] ring growing, symbols drawing in [3] full bright circle with small rising sparkles [4] circle turned a little, still bright [5] dimmer [6] faint ring fading.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every frame with at least 6% empty margin; nothing crosses into another frame.
```

### #28 · Hiệu ứng hit-spark · đòn choáng

```
#28 · Hiệu ứng hit-spark · đòn choáng · nhóm D · ưu tiên 2
Lưu ảnh tên: hit-spark.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên hit-spark.png (cat-fx.py dai hit-spark.png hit-spark)
Tên file (trong assets/, đúng như code đang tìm): vfx/hit-spark.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (bash — đòn choáng)
Cỡ hiện trên màn: 30×12 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a heavy hit impact: [1] small white flash [2] star-shaped impact burst, yellow-white [3] biggest burst with radiating sparks and a ground shock ring [4] sparks flying outward [5] sparks thinning [6] faint sparks.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #29 · Hiệu ứng fire-burst · nổ lửa

```
#29 · Hiệu ứng fire-burst · nổ lửa · nhóm D · ưu tiên 2
Lưu ảnh tên: fire-burst.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên fire-burst.png (cat-fx.py dai fire-burst.png fire-burst)
Tên file (trong assets/, đúng như code đang tìm): vfx/fire-burst.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (explosion — nổ lửa)
Cỡ hiện trên màn: theo bán kính chiêu   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a round fire explosion: [1] tiny bright yellow flash in the center [2] expanding orange fireball [3] biggest fireball with spiky edges and flying sparks [4] fire turning into dark-orange smoke ring [5] smoke ring wider, embers [6] faint smoke fading.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #30 · Hiệu ứng fire-pillar · cột lửa Thầy Mo

```
#30 · Hiệu ứng fire-pillar · cột lửa Thầy Mo · nhóm D · ưu tiên 2
Lưu ảnh tên: fire-pillar.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên fire-pillar.png (cat-fx.py dai fire-pillar.png fire-pillar)
Tên file (trong assets/, đúng như code đang tìm): vfx/fire-pillar.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (pillar — cột lửa Thầy Mo)
Cỡ hiện trên màn: 26×73 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a pillar of fire erupting from the ground: [1] small glowing crack and sparks at the bottom [2] flames shoot up half height [3] full tall roaring fire pillar, orange-red with yellow core [4] pillar at full height, flames twisting [5] pillar breaking into embers [6] few embers and thin smoke fading.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #31 · Hiệu ứng ice-ring · vòng băng

```
#31 · Hiệu ứng ice-ring · vòng băng · nhóm D · ưu tiên 2
Lưu ảnh tên: ice-ring.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên ice-ring.png (cat-fx.py dai ice-ring.png ice-ring)
Tên file (trong assets/, đúng như code đang tìm): vfx/ice-ring.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (nova — vòng băng)
Cỡ hiện trên màn: theo bán kính   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: an ice shockwave ring seen at a slight top-down angle (flattened ellipse): [1] small icy-blue flash in center [2] ring of ice shards expanding [3] wide ring with sharp crystals pointing outward [4] ring at full size, shards glinting white [5] shards breaking into snow sparkles [6] faint sparkles fading.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #32 · Hiệu ứng freeze · mù sương / đóng băng

```
#32 · Hiệu ứng freeze · mù sương / đóng băng · nhóm D · ưu tiên 2
Lưu ảnh tên: freeze.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên freeze.png (cat-fx.py dai freeze.png freeze)
Tên file (trong assets/, đúng như code đang tìm): vfx/freeze.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (snow — mù sương / đóng băng)
Cỡ hiện trên màn: theo bán kính   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a freezing frost effect: [1] a few snowflakes falling [2] more snowflakes, frosty mist [3] ice crystals forming in a cluster [4] full icy block of crystals with white highlights [5] crystals cracking [6] snow dust fading.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #33 · Hiệu ứng water-wave · sóng nước

```
#33 · Hiệu ứng water-wave · sóng nước · nhóm D · ưu tiên 2
Lưu ảnh tên: water-wave.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên water-wave.png (cat-fx.py dai water-wave.png water-wave)
Tên file (trong assets/, đúng như code đang tìm): vfx/water-wave.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (wave — sóng nước)
Cỡ hiện trên màn: theo bán kính   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt, PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a curling river wave rushing to the RIGHT: [1] small rising water bump [2] wave growing, white foam on top [3] big curling blue wave with foam crest (Thuy Tinh water style) [4] wave crashing forward, splashes [5] splashes and droplets [6] droplets fading.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #34 · Hiệu ứng lightning · sét

```
#34 · Hiệu ứng lightning · sét · nhóm D · ưu tiên 2
Lưu ảnh tên: lightning.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên lightning.png (cat-fx.py dai lightning.png lightning)
Tên file (trong assets/, đúng như code đang tìm): vfx/lightning.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (bolt — sét)
Cỡ hiện trên màn: ≈170 px cao   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-GUI-AI.txt, PROMPT_GEMINI_FULL.txt, PROMPT-CAN-GEN.txt, PROMPT-HIEU-UNG.txt, PROMPT-FOOOCUS.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a lightning strike from the sky: [1] small spark at the top of the cell [2] thin jagged bolt halfway down [3] full bright bolt from top to ground, white core with violet-blue glow, small flash at the bottom [4] bolt flickering, branches [5] bolt fading, electric sparks on the ground [6] faint sparks.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #35 · Hiệu ứng heal · hồi máu

```
#35 · Hiệu ứng heal · hồi máu · nhóm D · ưu tiên 2
Lưu ảnh tên: heal.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên heal.png (cat-fx.py dai heal.png heal)
Tên file (trong assets/, đúng như code đang tìm): vfx/heal.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (heal — hồi máu)
Cỡ hiện trên màn: vòng + dấu cộng   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-GUI-AI.txt, PROMPT_GEMINI_FULL.txt, PROMPT-CAN-GEN.txt, PROMPT-HIEU-UNG.txt, PROMPT-FOOOCUS.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a healing effect: [1] a soft green glow circle on the ground [2] small green leaves and light dots rising [3] more leaves and a plus-shaped sparkle rising [4] gentle green light column with rising leaves [5] leaves floating higher, fading [6] few sparkles.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #36 · Hiệu ứng streak · tia bắn thẳng

```
#36 · Hiệu ứng streak · tia bắn thẳng · nhóm D · ưu tiên 2
Lưu ảnh tên: streak.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên streak.png (cat-fx.py dai streak.png streak)
Tên file (trong assets/, đúng như code đang tìm): vfx/streak.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (streak / beam — tia bắn thẳng)
Cỡ hiện trên màn: đường 4 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-GUI-AI.txt, PROMPT_GEMINI_FULL.txt, PROMPT-CAN-GEN.txt, PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a straight water beam going from LEFT to RIGHT across the cell: [1] short beam start [2] half length [3] full length bright beam with white core [4] beam pulsing with droplets [5] thinning [6] droplets.
STYLE: game VFX animation frames in the style of the free Kenney Particle Pack: ONLY pure white and light-grey shapes on a perfectly flat pure BLACK #000000 background, soft glowing edges, bright core, NO color at all (the game tints it), no outline, no shading other than brightness, no text, no numbers, no labels, no grid lines, no borders, no watermark. Each shape centered in every frame with at least 8% empty black margin; nothing touches or crosses into another cell.
```

### #37 · Hiệu ứng sweep · quét gậy tre

```
#37 · Hiệu ứng sweep · quét gậy tre · nhóm D · ưu tiên 2
Lưu ảnh tên: sweep.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên sweep.png (cat-fx.py dai sweep.png sweep)
Tên file (trong assets/, đúng như code đang tìm): vfx/sweep.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (sweep — quét gậy tre)
Cỡ hiện trên màn: cung bán kính   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-GUI-AI.txt, PROMPT_GEMINI_FULL.txt, PROMPT-CAN-GEN.txt, PROMPT-HIEU-UNG.txt, PROMPT-FOOOCUS.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a sweeping arc of a bamboo staff: [1] start of a green-ivory arc on the left [2] half arc [3] full wide arc with leaf bits [4] arc trail thinning [5] few bamboo leaves [6] fading.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #38 · Hiệu ứng warn · vùng cảnh báo

```
#38 · Hiệu ứng warn · vùng cảnh báo · nhóm D · ưu tiên 2
Lưu ảnh tên: warn.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên warn.png (cat-fx.py dai warn.png warn)
Tên file (trong assets/, đúng như code đang tìm): vfx/warn.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (warn — vùng cảnh báo)
Cỡ hiện trên màn: elip bán kính   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a warning area on the ground (flattened ellipse): [1] faint ring [2] ring with dashed inner circle [3] bright pulsing ring [4] dimmer [5] bright again [6] fading.
STYLE: game VFX animation frames in the style of the free Kenney Particle Pack: ONLY pure white and light-grey shapes on a perfectly flat pure BLACK #000000 background, soft glowing edges, bright core, NO color at all (the game tints it), no outline, no shading other than brightness, no text, no numbers, no labels, no grid lines, no borders, no watermark. Each shape centered in every frame with at least 8% empty black margin; nothing touches or crosses into another cell.
```

### #39 · Hiệu ứng rain · mưa tên

```
#39 · Hiệu ứng rain · mưa tên · nhóm D · ưu tiên 2
Lưu ảnh tên: rain.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên rain.png (cat-fx.py dai rain.png rain)
Tên file (trong assets/, đúng như code đang tìm): vfx/rain.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (rain — mưa tên)
Cỡ hiện trên màn: 22 nét trên vùng   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-GUI-AI.txt, PROMPT_GEMINI_FULL.txt, PROMPT-CAN-GEN.txt, PROMPT-HIEU-UNG.txt, PROMPT-FOOOCUS.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: many arrows raining down onto an area (slightly top-down): [1] few arrows at the top [2] more arrows falling [3] arrows hitting, dust puffs [4] full rain hitting [5] fewer [6] dust fading.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #40 · Đá lăn Phong Châu (Lạc Hầu)

```
#40 · Đá lăn Phong Châu (Lạc Hầu) · nhóm E · ưu tiên 2
Lưu ảnh tên: hieu-ung_da-lan.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên hieu-ung_da-lan.png (cat-fx.py don hieu-ung_da-lan.png hieu-ung_da-lan)
Tên file (trong assets/, đúng như code đang tìm): hieu-ung_da-lan.png
Chỗ dùng: js/main.js:1546 (elip đá)
Cỡ hiện trên màn: 24×20 px   ·   Khung: 1 ảnh rời, game tự xoay / lật
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt, PROMPT-FOOOCUS.txt
```

```
Create ONE image: a 512x512 single game sprite, one object centered, filling about 85% of the image.
SUBJECT: a round rolling boulder seen from the side: grey-brown stone ball with cracks, a little moss, a carved bronze-drum sun-star on its face, perfectly round outline. Readable at 30 px.
STYLE: cute mobile-game art matching chibi heroes of a Vietnamese folk-legend tower-defense game: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds), about 20-30 flat colors, no gradients.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #41 · Đèn trời ném

```
#41 · Đèn trời ném · nhóm E · ưu tiên 2
Lưu ảnh tên: hieu-ung_den-troi.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên hieu-ung_den-troi.png (cat-fx.py don hieu-ung_den-troi.png hieu-ung_den-troi)
Tên file (trong assets/, đúng như code đang tìm): hieu-ung_den-troi.png
Chỗ dùng: js/main.js:1080, 1632 (code luôn vẽ quả dưa xanh)
Cỡ hiện trên màn: 11–20 px   ·   Khung: 1 ảnh rời, game tự xoay / lật
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 512x512 single game sprite, one subject centered, filling about 85% of the image.
SUBJECT: a glowing Vietnamese sky lantern (paper lantern) with a small flame inside, warm yellow-orange paper, bronze-drum zigzag band, upright. Readable at 40 px.
STYLE: cute mobile-game art matching chibi heroes of a Vietnamese folk-legend tower-defense game: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds), about 20-30 flat colors, no gradients.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #42 · Chai ném (Ngư Phủ)

```
#42 · Chai ném (Ngư Phủ) · nhóm E · ưu tiên 2
Lưu ảnh tên: hieu-ung_chai.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên hieu-ung_chai.png (cat-fx.py don hieu-ung_chai.png hieu-ung_chai)
Tên file (trong assets/, đúng như code đang tìm): hieu-ung_chai.png
Chỗ dùng: js/main.js:1080, 1632
Cỡ hiện trên màn: 11–20 px   ·   Khung: 1 ảnh rời, game tự xoay / lật
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 512x512 single game sprite, one subject centered, filling about 85% of the image.
SUBJECT: a round fishing cast net spread open in the air, brown rope mesh with small lead weights around the rim, seen from the front. Readable at 40 px.
STYLE: cute mobile-game art matching chibi heroes of a Vietnamese folk-legend tower-defense game: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds), about 20-30 flat colors, no gradients.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #43 · Bình gốm ném (Thợ Gốm)

```
#43 · Bình gốm ném (Thợ Gốm) · nhóm E · ưu tiên 2
Lưu ảnh tên: hieu-ung_binh-gom.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên hieu-ung_binh-gom.png (cat-fx.py don hieu-ung_binh-gom.png hieu-ung_binh-gom)
Tên file (trong assets/, đúng như code đang tìm): hieu-ung_binh-gom.png
Chỗ dùng: js/main.js:1080, 1632
Cỡ hiện trên màn: 11–20 px   ·   Khung: 1 ảnh rời, game tự xoay / lật
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 512x512 single game sprite, one subject centered, filling about 85% of the image.
SUBJECT: a small round clay pot (Bat Trang pottery) with a short neck, ochre glaze with a dark-brown zigzag band, a lit fuse on top. Readable at 40 px.
STYLE: cute mobile-game art matching chibi heroes of a Vietnamese folk-legend tower-defense game: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds), about 20-30 flat colors, no gradients.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #44 · Dưa hấu ném (An Tiêm, Sọ Dừa)

```
#44 · Dưa hấu ném (An Tiêm, Sọ Dừa) · nhóm E · ưu tiên 2
Lưu ảnh tên: hieu-ung_dua-hau.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên hieu-ung_dua-hau.png (cat-fx.py don hieu-ung_dua-hau.png hieu-ung_dua-hau)
Tên file (trong assets/, đúng như code đang tìm): hieu-ung_dua-hau.png
Chỗ dùng: js/main.js:1080, 1632
Cỡ hiện trên màn: 11–20 px   ·   Khung: 1 ảnh rời, game tự xoay / lật
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 512x512 single game sprite, one subject centered, filling about 85% of the image.
SUBJECT: a whole round green watermelon with dark green stripes and a short stem. Readable at 40 px.
STYLE: cute mobile-game art matching chibi heroes of a Vietnamese folk-legend tower-defense game: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds), about 20-30 flat colors, no gradients.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #45 · Nút tròn (quay lại / đóng) · thường / nhấn / khóa

```
#45 · Nút tròn (quay lại / đóng) · thường / nhấn / khóa · nhóm G · ưu tiên 2
Lưu ảnh tên: hc-nut-tron.png   ·   Cắt: tools/cat-anh.html nhận tên hc-nut-tron.png → tách 3 vật theo thứ tự đọc (trái→phải, trên→dưới)
Tên file (trong assets/, đúng như code đang tìm): ui/nut-tron-thuong.png · ui/nut-tron-nhan.png · ui/nut-tron-khoa.png
Chỗ dùng: js/ui.js:37-53 UI_SKIN nut-tron-* (nút đóng / quay lại / tạm dừng)
Cỡ hiện trên màn: 36–44 px   ·   Khung: 3 trạng thái
Đã có prompt trong file tổng: CHƯA
```

```
Create ONE image: a 768x256 game UI sheet, an invisible 3x1 grid of 3 equal 256x256 cells, one element per cell, read left to right, top to bottom:
[1] round bronze drum-face button with a ring of Lac birds on the rim and an EMPTY dark center (an icon is drawn on top) — NORMAL
[2] the same round button — PRESSED: darker, pushed in
[3] the same round button — DISABLED: grey and dull.
Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading for a cute mobile game. Same lighting and the same bronze palette in every cell; elements fill about 90% of their cell; straight, symmetric, front view (no perspective), no text, no letters, no numbers, no icons inside.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #46 · Icon kỹ năng · Lạc Tướng

```
#46 · Icon kỹ năng · Lạc Tướng · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-lactuong.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-lactuong.png (kiểu icon4 → packs/lactuong/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_lac-tuong_q.png · ky-nang_lac-tuong_w.png · ky-nang_lac-tuong_e.png · ky-nang_lac-tuong_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/lactuong/sk-q…r.png; khi gộp, session điều phối thêm 'lactuong' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_lac-tuong_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Lạc Tướng (Vietnamese folk legend), one icon per cell, left to right:
[1] «Bổ Rìu Đồng»: a bronze axe chopping down with an impact spark  [2] «Rìu Lốc Xoáy»: a bronze axe spinning in a whirlwind  [3] «Hùng Khí»: a roaring warrior aura: red-gold flame around a fist  [4] «Sấm Tản Viên»: a lightning bolt striking from a storm cloud over a mountain.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color silver-white #D9DDE0 with bronze-gold accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #47 · Icon kỹ năng · Lực Sĩ Núi

```
#47 · Icon kỹ năng · Lực Sĩ Núi · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-lucsi.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-lucsi.png (kiểu icon4 → packs/lucsi/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_luc-si-nui_q.png · ky-nang_luc-si-nui_w.png · ky-nang_luc-si-nui_e.png · ky-nang_luc-si-nui_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/lucsi/sk-q…r.png; khi gộp, session điều phối thêm 'lucsi' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_luc-si-nui_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Lực Sĩ Núi (Vietnamese folk legend), one icon per cell, left to right:
[1] «Ném Đá Tảng»: a big boulder thrown with a motion arc  [2] «Gánh Núi»: a strong shoulder carrying a small mountain  [3] «Bụi Đá»: a cloud of rock dust  [4] «Vùi Đá»: a pile of rocks burying the ground.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color earth ochre #C99A3C with brown accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #48 · Icon kỹ năng · Xạ Thủ Văn Lang

```
#48 · Icon kỹ năng · Xạ Thủ Văn Lang · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-xathu.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-xathu.png (kiểu icon4 → packs/xathu/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_xa-thu-van-lang_q.png · ky-nang_xa-thu-van-lang_w.png · ky-nang_xa-thu-van-lang_e.png · ky-nang_xa-thu-van-lang_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/xathu/sk-q…r.png; khi gộp, session điều phối thêm 'xathu' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_xa-thu-van-lang_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Xạ Thủ Văn Lang (Vietnamese folk legend), one icon per cell, left to right:
[1] «Tên Xuyên Thấu»: an arrow piercing through two shields  [2] «Đa Tiễn»: three arrows flying in a fan  [3] «Tên Tẩm Nhựa Độc»: an arrow tip dripping dark poison resin  [4] «Mưa Tên»: a rain of arrows falling from the sky.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color silver-white #D9DDE0 with bronze-gold accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #49 · Icon kỹ năng · Thợ Săn Rừng

```
#49 · Icon kỹ năng · Thợ Săn Rừng · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-thosan.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-thosan.png (kiểu icon4 → packs/thosan/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_tho-san-rung_q.png · ky-nang_tho-san-rung_w.png · ky-nang_tho-san-rung_e.png · ky-nang_tho-san-rung_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/thosan/sk-q…r.png; khi gộp, session điều phối thêm 'thosan' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_tho-san-rung_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Thợ Săn Rừng (Vietnamese folk legend), one icon per cell, left to right:
[1] «Bước Lá Rừng»: a footstep made of green leaves with a dash trail  [2] «Giáo Ẩn»: a hidden spear among leaves  [3] «Đòn Chí Mạng»: a red critical-hit burst on a target  [4] «Săn Mồi»: a hunting dagger with a red target mark.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color leaf green #5FB84A with brown wood accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #50 · Icon kỹ năng · Thầy Mo Lửa

```
#50 · Icon kỹ năng · Thầy Mo Lửa · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-thaymo.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-thaymo.png (kiểu icon4 → packs/thaymo/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_thay-mo-lua_q.png · ky-nang_thay-mo-lua_w.png · ky-nang_thay-mo-lua_e.png · ky-nang_thay-mo-lua_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/thaymo/sk-q…r.png; khi gộp, session điều phối thêm 'thaymo' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_thay-mo-lua_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Thầy Mo Lửa (Vietnamese folk legend), one icon per cell, left to right:
[1] «Cột Lửa»: a tall fire pillar  [2] «Đuốc Linh Hồn»: a spirit torch with a blue-orange flame  [3] «Lửa Thiêu»: burning flames on the ground  [4] «Hỏa Sơn»: a fiery volcano erupting meteors.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color flame red-orange #E0452C with gold accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #51 · Icon kỹ năng · Thần Sương Núi

```
#51 · Icon kỹ năng · Thần Sương Núi · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-thansuong.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-thansuong.png (kiểu icon4 → packs/thansuong/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_than-suong-nui_q.png · ky-nang_than-suong-nui_w.png · ky-nang_than-suong-nui_e.png · ky-nang_than-suong-nui_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/thansuong/sk-q…r.png; khi gộp, session điều phối thêm 'thansuong' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_than-suong-nui_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Thần Sương Núi (Vietnamese folk legend), one icon per cell, left to right:
[1] «Vòng Sương»: a frosty white mist ring  [2] «Mũi Sương Giá»: a sharp ice shard  [3] «Hơi Lạnh Đỉnh Núi»: a cold wind swirl over a snowy mountain peak  [4] «Mù Sương Tản Viên»: a thick fog blizzard swirl.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color water blue #5AB4D6 with white accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #52 · Icon kỹ năng · Thánh Gióng

```
#52 · Icon kỹ năng · Thánh Gióng · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-giong.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-giong.png (kiểu icon4 → packs/giong/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_thanh-giong_q.png · ky-nang_thanh-giong_w.png · ky-nang_thanh-giong_e.png · ky-nang_thanh-giong_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/giong/sk-q…r.png; khi gộp, session điều phối thêm 'giong' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_thanh-giong_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Thánh Gióng (Vietnamese folk legend), one icon per cell, left to right:
[1] «Gậy Tre Ngà»: a bamboo stalk with ivory joints swung like a club  [2] «Giáp Sắt»: an iron chest armor plate  [3] «Ngựa Sắt Phun Lửa»: an iron horse head breathing a trail of fire  [4] «Bay Về Trời»: a hero silhouette flying up into the sky on an iron horse with a light beam.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color flame red-orange #E0452C with gold accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #53 · Icon kỹ năng · Lạc Long Quân

```
#53 · Icon kỹ năng · Lạc Long Quân · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-llq.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-llq.png (kiểu icon4 → packs/llq/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_lac-long-quan_q.png · ky-nang_lac-long-quan_w.png · ky-nang_lac-long-quan_e.png · ky-nang_lac-long-quan_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/llq/sk-q…r.png; khi gộp, session điều phối thêm 'llq' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_lac-long-quan_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Lạc Long Quân (Vietnamese folk legend), one icon per cell, left to right:
[1] «Vuốt Rồng»: a green dragon claw slash with three claw marks  [2] «Vảy Rồng»: shiny jade dragon scales  [3] «Gầm Biển»: a big roaring sea wave  [4] «Hóa Rồng»: a dragon head breathing a blue beam.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color water blue #5AB4D6 with white accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #54 · Icon kỹ năng · Thần Kim Quy

```
#54 · Icon kỹ năng · Thần Kim Quy · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-kimquy.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-kimquy.png (kiểu icon4 → packs/kimquy/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_than-kim-quy_q.png · ky-nang_than-kim-quy_w.png · ky-nang_than-kim-quy_e.png · ky-nang_than-kim-quy_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/kimquy/sk-q…r.png; khi gộp, session điều phối thêm 'kimquy' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_than-kim-quy_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Thần Kim Quy (Vietnamese folk legend), one icon per cell, left to right:
[1] «Mai Vàng»: a golden turtle shell  [2] «Móng Thần»: a golden turtle claw  [3] «Địa Chấn»: cracked ground with a shockwave  [4] «Kim Quy Hộ Thành»: a golden turtle shell shield over a small citadel.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color silver-white #D9DDE0 with bronze-gold accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #55 · Icon kỹ năng · Thạch Sanh

```
#55 · Icon kỹ năng · Thạch Sanh · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-thachsanh.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-thachsanh.png (kiểu icon4 → packs/thachsanh/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_thach-sanh_q.png · ky-nang_thach-sanh_w.png · ky-nang_thach-sanh_e.png · ky-nang_thach-sanh_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/thachsanh/sk-q…r.png; khi gộp, session điều phối thêm 'thachsanh' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_thach-sanh_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Thạch Sanh (Vietnamese folk legend), one icon per cell, left to right:
[1] «Rìu Đốn Củi»: a woodcutter axe chopping a log  [2] «Cung Tên Vàng»: a golden bow with a golden arrow  [3] «Đàn Thần»: a magic lute (dan) with music notes  [4] «Diệt Chằn Tinh»: a broken ogre horn with a slash mark.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color leaf green #5FB84A with brown wood accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #56 · Icon kỹ năng · Cao Lỗ

```
#56 · Icon kỹ năng · Cao Lỗ · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-caolo.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-caolo.png (kiểu icon4 → packs/caolo/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_cao-lo_q.png · ky-nang_cao-lo_w.png · ky-nang_cao-lo_e.png · ky-nang_cao-lo_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/caolo/sk-q…r.png; khi gộp, session điều phối thêm 'caolo' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_cao-lo_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Cao Lỗ (Vietnamese folk legend), one icon per cell, left to right:
[1] «Nỏ Liên Châu»: three crossbow bolts in a row  [2] «Lẫy Thần»: a bronze crossbow trigger mechanism  [3] «Tên Móng Rùa»: an arrow with a turtle-claw arrowhead  [4] «Nỏ Thần»: a giant glowing divine crossbow.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color silver-white #D9DDE0 with bronze-gold accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #57 · Icon kỹ năng · Mai An Tiêm

```
#57 · Icon kỹ năng · Mai An Tiêm · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-antiem.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-antiem.png (kiểu icon4 → packs/antiem/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_mai-an-tiem_q.png · ky-nang_mai-an-tiem_w.png · ky-nang_mai-an-tiem_e.png · ky-nang_mai-an-tiem_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/antiem/sk-q…r.png; khi gộp, session điều phối thêm 'antiem' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_mai-an-tiem_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Mai An Tiêm (Vietnamese folk legend), one icon per cell, left to right:
[1] «Ném Dưa Hấu»: a watermelon slice flying  [2] «Hạt Giống Vàng»: a golden seed sprouting  [3] «Chim Thần»: a magic bird carrying a seed  [4] «Mưa Dưa»: many watermelons raining down.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color leaf green #5FB84A with brown wood accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #58 · Icon kỹ năng · Âu Cơ

```
#58 · Icon kỹ năng · Âu Cơ · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-auco.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-auco.png (kiểu icon4 → packs/auco/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_au-co_q.png · ky-nang_au-co_w.png · ky-nang_au-co_e.png · ky-nang_au-co_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/auco/sk-q…r.png; khi gộp, session điều phối thêm 'auco' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_au-co_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Âu Cơ (Vietnamese folk legend), one icon per cell, left to right:
[1] «Hoa Tiên»: a pink fairy flower with a green healing sparkle  [2] «Lông Vũ Tiên»: one white fairy feather with a soft glow  [3] «Núi Mẹ»: a gentle green mountain with a mother-shape silhouette  [4] «Bọc Trăm Trứng»: a big golden egg sack with many small eggs inside.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color earth ochre #C99A3C with brown accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #59 · Icon kỹ năng · Chử Đồng Tử

```
#59 · Icon kỹ năng · Chử Đồng Tử · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-cdt.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-cdt.png (kiểu icon4 → packs/cdt/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_chu-dong-tu_q.png · ky-nang_chu-dong-tu_w.png · ky-nang_chu-dong-tu_e.png · ky-nang_chu-dong-tu_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/cdt/sk-q…r.png; khi gộp, session điều phối thêm 'cdt' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_chu-dong-tu_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Chử Đồng Tử (Vietnamese folk legend), one icon per cell, left to right:
[1] «Gậy Thần»: a magic walking staff with a green heal glow  [2] «Nón Thần»: a conical magic hat (non la) with sparkles  [3] «Sóng Sông Hồng»: a red river wave  [4] «Thành Một Đêm»: a citadel appearing overnight under a crescent moon.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color water blue #5AB4D6 with white accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #60 · Icon kỹ năng · Tiên Dung

```
#60 · Icon kỹ năng · Tiên Dung · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-tiendung.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-tiendung.png (kiểu icon4 → packs/tiendung/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_tien-dung_q.png · ky-nang_tien-dung_w.png · ky-nang_tien-dung_e.png · ky-nang_tien-dung_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/tiendung/sk-q…r.png; khi gộp, session điều phối thêm 'tiendung' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_tien-dung_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Tiên Dung (Vietnamese folk legend), one icon per cell, left to right:
[1] «Quạt Tiên»: a round fairy fan with sparkles  [2] «Ánh Ngọc»: a shining jewel  [3] «Sen Hồng»: a pink lotus flower  [4] «Mưa Hoa Tiên»: many fairy flower petals raining.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color flame red-orange #E0452C with gold accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #61 · Icon kỹ năng · Lạc Hầu

```
#61 · Icon kỹ năng · Lạc Hầu · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-lachau.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-lachau.png (kiểu icon4 → packs/lachau/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_lac-hau_q.png · ky-nang_lac-hau_w.png · ky-nang_lac-hau_e.png · ky-nang_lac-hau_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/lachau/sk-q…r.png; khi gộp, session điều phối thêm 'lachau' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_lac-hau_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Lạc Hầu (Vietnamese folk legend), one icon per cell, left to right:
[1] «Trống Hiệu Triệu»: a bronze war drum with sound rings  [2] «Giáp Da Tê Gai»: spiky rhino-hide armor  [3] «Đá Lăn Phong Châu»: a big round boulder rolling with dust  [4] «Lời Thề Bộ Lạc»: three raised fists with a sun-star behind (tribe oath).
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color earth ochre #C99A3C with brown accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #62 · Icon kỹ năng · Thần Săn Ba Vì

```
#62 · Icon kỹ năng · Thần Săn Ba Vì · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-thansan.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-thansan.png (kiểu icon4 → packs/thansan/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_than-san-ba-vi_q.png · ky-nang_than-san-ba-vi_w.png · ky-nang_than-san-ba-vi_e.png · ky-nang_than-san-ba-vi_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/thansan/sk-q…r.png; khi gộp, session điều phối thêm 'thansan' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_than-san-ba-vi_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Thần Săn Ba Vì (Vietnamese folk legend), one icon per cell, left to right:
[1] «Lao Tẩm Độc»: a spear tip dripping green poison  [2] «Nanh Hổ»: a sharp tiger fang  [3] «Gọi Hổ Ba Vì»: a roaring tiger head  [4] «Cuộc Săn Lớn»: a hunting horn with crossed spears.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color leaf green #5FB84A with brown wood accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #63 · Icon kỹ năng · An Dương Vương

```
#63 · Icon kỹ năng · An Dương Vương · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-adv.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-adv.png (kiểu icon4 → packs/adv/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_an-duong-vuong_q.png · ky-nang_an-duong-vuong_w.png · ky-nang_an-duong-vuong_e.png · ky-nang_an-duong-vuong_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/adv/sk-q…r.png; khi gộp, session điều phối thêm 'adv' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_an-duong-vuong_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero An Dương Vương (Vietnamese folk legend), one icon per cell, left to right:
[1] «Tên Đồng Nảy»: a bronze arrow bouncing between two targets with motion arcs  [2] «Thành Ốc Cổ Loa»: a small spiral Co Loa citadel wall seen from above  [3] «Lũy Nỏ Cổ Loa»: a fan of five crossbow bolts flying up from a bronze rampart  [4] «Linh Quang Thần Nỏ»: a glowing golden turtle-claw crossbow with radiant light.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color silver-white #D9DDE0 with bronze-gold accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #64 · Icon kỹ năng · Mẫu Thượng Ngàn

```
#64 · Icon kỹ năng · Mẫu Thượng Ngàn · nhóm H · ưu tiên 2
Lưu ảnh tên: icon-mau.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên icon-mau.png (kiểu icon4 → packs/mau/sk-q…sk-r.png)
Tên file (trong assets/, đúng như code đang tìm): ky-nang_mau-thuong-ngan_q.png · ky-nang_mau-thuong-ngan_w.png · ky-nang_mau-thuong-ngan_e.png · ky-nang_mau-thuong-ngan_r.png
Chỗ dùng: js/ui.js:149-155 skillIcon() + js/render.js:468 skillPngPath() — chưa có ảnh thì vẽ SVG ART.skill (bảng kỹ năng, thẻ tướng, thanh chiêu trong trận)
Cỡ hiện trên màn: 28–44 px   ·   Khung: 4 icon tĩnh (Q · W · E · R)
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: cat-anh cắt ra packs/mau/sk-q…r.png; khi gộp, session điều phối thêm 'mau' vào SKILL_PACK (js/render.js:465) để game dùng (hoặc đổi tên thành ky-nang_mau-thuong-ngan_q…r.png ở gốc assets/).
```

```
Create ONE image: a 512x128 row of four equal 128x128 square game skill icons for the hero Mẫu Thượng Ngàn (Vietnamese folk legend), one icon per cell, left to right:
[1] «Dây Rừng Trói»: green forest vines tying in a knot  [2] «Rễ Ngàn Năm»: thick old tree roots  [3] «Cây Đa Thần»: a sacred banyan tree  [4] «Rừng Thiêng Nổi Giận»: an angry forest: dark trees with glowing eyes and falling leaves.
Each icon: one bold simple symbol, centered, fills about 80% of the cell, thick dark-brown outline #2A1608, flat cel shading, main color leaf green #5FB84A with brown wood accents, small Dong Son bronze-drum accents; no character body, no face. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #65 · Đồ ghép 1

```
#65 · Đồ ghép 1 · nhóm H · ưu tiên 2
Lưu ảnh tên: hc-do-ghep-1.png   ·   Cắt: tools/cat-anh.html nhận tên hc-do-ghep-1.png → tách 4 vật theo thứ tự đọc (trái→phải, trên→dưới)
Tên file (trong assets/, đúng như code đang tìm): do-ghep_trong-dong.png · do-ghep_song-riu-cuong-no.png · do-ghep_gay-tam-gioi.png · do-ghep_gay-thoi-khong.png
Chỗ dùng: js/ui.js itemIcon() — túi đồ, Lò đúc, công thức ghép (chưa có ảnh thì SVG NEW_ITEM_ART)
Cỡ hiện trên màn: 24–48 px   ·   Khung: tĩnh
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
```

```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] Dong Son bronze drum, full drum with frogs on top, rare magical crafted item, slightly glowing  [2] two crossed red-glowing battle axes, rare magical crafted item, slightly glowing  [3] staff with three rings of sky, earth and water, rare magical crafted item, slightly glowing  [4] staff topped with a spinning hourglass and stars, rare magical crafted item, slightly glowing.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #66 · Đồ ghép 3

```
#66 · Đồ ghép 3 · nhóm H · ưu tiên 2
Lưu ảnh tên: hc-do-ghep-3.png   ·   Cắt: tools/cat-anh.html nhận tên hc-do-ghep-3.png → tách 4 vật theo thứ tự đọc (trái→phải, trên→dưới)
Tên file (trong assets/, đúng như code đang tìm): do-ghep_cung-mat-chim.png · do-ghep_bua-chim-lac.png · do-ghep_ao-vay-ca.png · do-ghep_ngoc-tran-thuy.png
Chỗ dùng: js/ui.js itemIcon() — túi đồ, Lò đúc, công thức ghép (chưa có ảnh thì SVG NEW_ITEM_ART)
Cỡ hiện trên màn: 24–48 px   ·   Khung: tĩnh
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
```

```
Create ONE image: a 512x128 row of 4 equal 128x128 square game item icons, one per cell, left to right:
[1] bow with a bird eye on the grip, rare magical crafted item, slightly glowing  [2] bronze Lac bird talisman on a red string, rare magical crafted item, slightly glowing  [3] shirt covered in silver fish scales, rare magical crafted item, slightly glowing  [4] blue water-sealing jade with a calm wave inside, rare magical crafted item, slightly glowing.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object, readable at 40 px, no text, no letters, no numbers.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #67 · Thắng · Sơn Tinh – Thủy Tinh

```
#67 · Thắng · Sơn Tinh – Thủy Tinh · nhóm I · ưu tiên 2
Lưu ảnh tên: thang-sontinh.png   ·   Cắt: không cần cắt — đổi tên đúng "scenes/thang-sontinh.png" rồi để vào zip (đúng thư mục)
Tên file (trong assets/, đúng như code đang tìm): scenes/thang-sontinh.png
Chỗ dùng: js/ui.js màn kết quả (finishLevel) — chưa có ảnh thì ghép SVG storyScene()
Cỡ hiện trên màn: nền màn kết quả ≈844×390   ·   Khung: 1 tranh
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 768x832 portrait illustration (full bleed) for the VICTORY result screen of a cute mobile tower-defense game based on Vietnamese folk legends, chapter Sơn Tinh – Thủy Tinh (Phong Châu citadel of the Hung Kings by the Da river).
SCENE: Sơn Tinh, the mountain god in a leafy green-brown robe with a stone crown, stands on a green mountain that has just risen above the river, raising his arms; the flood water recedes, sun-star breaks through the clouds, Phong Châu citadel with bronze roofs safe and dry, villagers cheering on the walls.
COMPOSITION: main subject in the lower 2/3, keep the top-left corner calm (a small label is drawn there), readable at 320 px wide. Mood: triumphant, warm golden light.
Painterly cute mobile-game illustration in the same family as the main menu key art: warm Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked into the scenery, soft cel shading, rich but readable colors, chibi characters with big round eyes and thick dark-brown outlines #2A1608. No text, no letters, no numbers, no UI, no frame, no watermark, full bleed.
```

### #68 · Thua · Sơn Tinh – Thủy Tinh

```
#68 · Thua · Sơn Tinh – Thủy Tinh · nhóm I · ưu tiên 2
Lưu ảnh tên: thua-sontinh.png   ·   Cắt: không cần cắt — đổi tên đúng "scenes/thua-sontinh.png" rồi để vào zip (đúng thư mục)
Tên file (trong assets/, đúng như code đang tìm): scenes/thua-sontinh.png
Chỗ dùng: js/ui.js màn kết quả (finishLevel) — chưa có ảnh thì ghép SVG storyScene()
Cỡ hiện trên màn: nền màn kết quả ≈844×390   ·   Khung: 1 tranh
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 768x832 portrait illustration (full bleed) for the DEFEAT result screen of a cute mobile tower-defense game based on Vietnamese folk legends, chapter Sơn Tinh – Thủy Tinh (Phong Châu citadel of the Hung Kings by the Da river).
SCENE: night storm over Phong Châu citadel: the flood of Thủy Tinh breaks the earthen walls, the bronze gate half under water, broken banners floating, giant water snake and dark waves curling around the towers, lightning in purple clouds; sad but not gory.
COMPOSITION: main subject in the lower 2/3, keep the top-left corner calm (a small label is drawn there), readable at 320 px wide. Mood: dark and tense, cold or fiery shadows, but still cute and family-friendly.
Painterly cute mobile-game illustration in the same family as the main menu key art: warm Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked into the scenery, soft cel shading, rich but readable colors, chibi characters with big round eyes and thick dark-brown outlines #2A1608. No text, no letters, no numbers, no UI, no frame, no watermark, full bleed.
```

### #69 · Thắng · Thạch Sanh

```
#69 · Thắng · Thạch Sanh · nhóm I · ưu tiên 2
Lưu ảnh tên: thang-thachsanh.png   ·   Cắt: không cần cắt — đổi tên đúng "scenes/thang-thachsanh.png" rồi để vào zip (đúng thư mục)
Tên file (trong assets/, đúng như code đang tìm): scenes/thang-thachsanh.png
Chỗ dùng: js/ui.js màn kết quả (finishLevel) — chưa có ảnh thì ghép SVG storyScene()
Cỡ hiện trên màn: nền màn kết quả ≈844×390   ·   Khung: 1 tranh
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 768x832 portrait illustration (full bleed) for the VICTORY result screen of a cute mobile tower-defense game based on Vietnamese folk legends, chapter Thạch Sanh (forest temple and highland village).
SCENE: Thạch Sanh, young woodcutter hero with bare chest, red headband and a bronze axe and bow, stands victorious in front of the old forest temple at dawn; the ogre Chằn Tinh lies defeated (cartoon stars over its head) in the background, villagers and their stilt house safe, fireflies turning into morning light.
COMPOSITION: main subject in the lower 2/3, keep the top-left corner calm (a small label is drawn there), readable at 320 px wide. Mood: triumphant, warm golden light.
Painterly cute mobile-game illustration in the same family as the main menu key art: warm Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked into the scenery, soft cel shading, rich but readable colors, chibi characters with big round eyes and thick dark-brown outlines #2A1608. No text, no letters, no numbers, no UI, no frame, no watermark, full bleed.
```

### #70 · Thua · Thạch Sanh

```
#70 · Thua · Thạch Sanh · nhóm I · ưu tiên 2
Lưu ảnh tên: thua-thachsanh.png   ·   Cắt: không cần cắt — đổi tên đúng "scenes/thua-thachsanh.png" rồi để vào zip (đúng thư mục)
Tên file (trong assets/, đúng như code đang tìm): scenes/thua-thachsanh.png
Chỗ dùng: js/ui.js màn kết quả (finishLevel) — chưa có ảnh thì ghép SVG storyScene()
Cỡ hiện trên màn: nền màn kết quả ≈844×390   ·   Khung: 1 tranh
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 768x832 portrait illustration (full bleed) for the DEFEAT result screen of a cute mobile tower-defense game based on Vietnamese folk legends, chapter Thạch Sanh (forest temple and highland village).
SCENE: night in the ancient forest: the green ogre Chằn Tinh and little forest goblins swarm into the stilt-house village and the small temple, temple doors broken open, torches knocked over, eerie green mist and glowing red eyes among the banyan roots; spooky but cute, no gore.
COMPOSITION: main subject in the lower 2/3, keep the top-left corner calm (a small label is drawn there), readable at 320 px wide. Mood: dark and tense, cold or fiery shadows, but still cute and family-friendly.
Painterly cute mobile-game illustration in the same family as the main menu key art: warm Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked into the scenery, soft cel shading, rich but readable colors, chibi characters with big round eyes and thick dark-brown outlines #2A1608. No text, no letters, no numbers, no UI, no frame, no watermark, full bleed.
```

### #71 · Thắng · Thánh Gióng

```
#71 · Thắng · Thánh Gióng · nhóm I · ưu tiên 2
Lưu ảnh tên: thang-giong.png   ·   Cắt: không cần cắt — đổi tên đúng "scenes/thang-giong.png" rồi để vào zip (đúng thư mục)
Tên file (trong assets/, đúng như code đang tìm): scenes/thang-giong.png
Chỗ dùng: js/ui.js màn kết quả (finishLevel) — chưa có ảnh thì ghép SVG storyScene()
Cỡ hiện trên màn: nền màn kết quả ≈844×390   ·   Khung: 1 tranh
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 768x832 portrait illustration (full bleed) for the VICTORY result screen of a cute mobile tower-defense game based on Vietnamese folk legends, chapter Thánh Gióng (Phù Đổng village, Red River delta rice fields).
SCENE: Saint Gióng, giant young warrior in iron armor riding a fire-breathing iron horse, holding an uprooted bamboo, at sunset over golden rice fields; the Ân invaders flee in the distance, Phù Đổng village gate with bamboo hedge safe, villagers waving.
COMPOSITION: main subject in the lower 2/3, keep the top-left corner calm (a small label is drawn there), readable at 320 px wide. Mood: triumphant, warm golden light.
Painterly cute mobile-game illustration in the same family as the main menu key art: warm Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked into the scenery, soft cel shading, rich but readable colors, chibi characters with big round eyes and thick dark-brown outlines #2A1608. No text, no letters, no numbers, no UI, no frame, no watermark, full bleed.
```

### #72 · Thua · Thánh Gióng

```
#72 · Thua · Thánh Gióng · nhóm I · ưu tiên 2
Lưu ảnh tên: thua-giong.png   ·   Cắt: không cần cắt — đổi tên đúng "scenes/thua-giong.png" rồi để vào zip (đúng thư mục)
Tên file (trong assets/, đúng như code đang tìm): scenes/thua-giong.png
Chỗ dùng: js/ui.js màn kết quả (finishLevel) — chưa có ảnh thì ghép SVG storyScene()
Cỡ hiện trên màn: nền màn kết quả ≈844×390   ·   Khung: 1 tranh
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 768x832 portrait illustration (full bleed) for the DEFEAT result screen of a cute mobile tower-defense game based on Vietnamese folk legends, chapter Thánh Gióng (Phù Đổng village, Red River delta rice fields).
SCENE: Phù Đổng village under attack: Ân invader soldiers in horned helmets and the Ân King on a dark warhorse charge through the bamboo village gate, thatched roofs on fire, red smoke over the rice fields, a broken bamboo hedge; dramatic but not gory.
COMPOSITION: main subject in the lower 2/3, keep the top-left corner calm (a small label is drawn there), readable at 320 px wide. Mood: dark and tense, cold or fiery shadows, but still cute and family-friendly.
Painterly cute mobile-game illustration in the same family as the main menu key art: warm Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked into the scenery, soft cel shading, rich but readable colors, chibi characters with big round eyes and thick dark-brown outlines #2A1608. No text, no letters, no numbers, no UI, no frame, no watermark, full bleed.
```

### #73 · Thắng · Lạc Long Quân

```
#73 · Thắng · Lạc Long Quân · nhóm I · ưu tiên 2
Lưu ảnh tên: thang-llq.png   ·   Cắt: không cần cắt — đổi tên đúng "scenes/thang-llq.png" rồi để vào zip (đúng thư mục)
Tên file (trong assets/, đúng như code đang tìm): scenes/thang-llq.png
Chỗ dùng: js/ui.js màn kết quả (finishLevel) — chưa có ảnh thì ghép SVG storyScene()
Cỡ hiện trên màn: nền màn kết quả ≈844×390   ·   Khung: 1 tranh
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 768x832 portrait illustration (full bleed) for the VICTORY result screen of a cute mobile tower-defense game based on Vietnamese folk legends, chapter Lạc Long Quân (East Sea coast, dragon king).
SCENE: Lạc Long Quân, the dragon lord in jade-green scale armor with a pearl crown, stands on a sea rock above calm turquoise water at sunrise, a friendly sea dragon spirit coiling behind him; the giant fish demon Ngư Tinh defeated sinking far away, fishing boats returning safely to the shore village.
COMPOSITION: main subject in the lower 2/3, keep the top-left corner calm (a small label is drawn there), readable at 320 px wide. Mood: triumphant, warm golden light.
Painterly cute mobile-game illustration in the same family as the main menu key art: warm Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked into the scenery, soft cel shading, rich but readable colors, chibi characters with big round eyes and thick dark-brown outlines #2A1608. No text, no letters, no numbers, no UI, no frame, no watermark, full bleed.
```

### #74 · Thua · Lạc Long Quân

```
#74 · Thua · Lạc Long Quân · nhóm I · ưu tiên 2
Lưu ảnh tên: thua-llq.png   ·   Cắt: không cần cắt — đổi tên đúng "scenes/thua-llq.png" rồi để vào zip (đúng thư mục)
Tên file (trong assets/, đúng như code đang tìm): scenes/thua-llq.png
Chỗ dùng: js/ui.js màn kết quả (finishLevel) — chưa có ảnh thì ghép SVG storyScene()
Cỡ hiện trên màn: nền màn kết quả ≈844×390   ·   Khung: 1 tranh
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 768x832 portrait illustration (full bleed) for the DEFEAT result screen of a cute mobile tower-defense game based on Vietnamese folk legends, chapter Lạc Long Quân (East Sea coast, dragon king).
SCENE: stormy East Sea: the giant fish demon Ngư Tinh with huge jaws rises from black waves, sharks and crab monsters crash onto the shore, fishing boats smashed, the stilt-house fishing village flooded by surging waves, lightning; scary but cute, no gore.
COMPOSITION: main subject in the lower 2/3, keep the top-left corner calm (a small label is drawn there), readable at 320 px wide. Mood: dark and tense, cold or fiery shadows, but still cute and family-friendly.
Painterly cute mobile-game illustration in the same family as the main menu key art: warm Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked into the scenery, soft cel shading, rich but readable colors, chibi characters with big round eyes and thick dark-brown outlines #2A1608. No text, no letters, no numbers, no UI, no frame, no watermark, full bleed.
```

### #75 · Thắng · An Dương Vương

```
#75 · Thắng · An Dương Vương · nhóm I · ưu tiên 2
Lưu ảnh tên: thang-adv.png   ·   Cắt: không cần cắt — đổi tên đúng "scenes/thang-adv.png" rồi để vào zip (đúng thư mục)
Tên file (trong assets/, đúng như code đang tìm): scenes/thang-adv.png
Chỗ dùng: js/ui.js màn kết quả (finishLevel) — chưa có ảnh thì ghép SVG storyScene()
Cỡ hiện trên màn: nền màn kết quả ≈844×390   ·   Khung: 1 tranh
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 768x832 portrait illustration (full bleed) for the VICTORY result screen of a cute mobile tower-defense game based on Vietnamese folk legends, chapter An Dương Vương (spiral Cổ Loa citadel).
SCENE: King An Dương Vương in red royal robe and golden crown holds the magic crossbow on the spiral walls of Cổ Loa citadel, the Golden Turtle god Kim Quy smiling beside him, bronze arrows of light raining on the fleeing Triệu army, sun-star sky, banners flying.
COMPOSITION: main subject in the lower 2/3, keep the top-left corner calm (a small label is drawn there), readable at 320 px wide. Mood: triumphant, warm golden light.
Painterly cute mobile-game illustration in the same family as the main menu key art: warm Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked into the scenery, soft cel shading, rich but readable colors, chibi characters with big round eyes and thick dark-brown outlines #2A1608. No text, no letters, no numbers, no UI, no frame, no watermark, full bleed.
```

### #76 · Thua · An Dương Vương

```
#76 · Thua · An Dương Vương · nhóm I · ưu tiên 2
Lưu ảnh tên: thua-adv.png   ·   Cắt: không cần cắt — đổi tên đúng "scenes/thua-adv.png" rồi để vào zip (đúng thư mục)
Tên file (trong assets/, đúng như code đang tìm): scenes/thua-adv.png
Chỗ dùng: js/ui.js màn kết quả (finishLevel) — chưa có ảnh thì ghép SVG storyScene()
Cỡ hiện trên màn: nền màn kết quả ≈844×390   ·   Khung: 1 tranh
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 768x832 portrait illustration (full bleed) for the DEFEAT result screen of a cute mobile tower-defense game based on Vietnamese folk legends, chapter An Dương Vương (spiral Cổ Loa citadel).
SCENE: Cổ Loa citadel falls at dusk: Triệu Đà soldiers and war elephants pour through the broken spiral earthen walls, watchtowers burning, the magic crossbow lying broken on the ground, fallen bronze banners, orange smoke in the sky; dramatic but not gory.
COMPOSITION: main subject in the lower 2/3, keep the top-left corner calm (a small label is drawn there), readable at 320 px wide. Mood: dark and tense, cold or fiery shadows, but still cute and family-friendly.
Painterly cute mobile-game illustration in the same family as the main menu key art: warm Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked into the scenery, soft cel shading, rich but readable colors, chibi characters with big round eyes and thick dark-brown outlines #2A1608. No text, no letters, no numbers, no UI, no frame, no watermark, full bleed.
```

### #77 · Bản đồ chương · Sơn Tinh – Thủy Tinh

```
#77 · Bản đồ chương · Sơn Tinh – Thủy Tinh · nhóm I · ưu tiên 2
Lưu ảnh tên: chuong-sontinh.png   ·   Cắt: không cần cắt — đổi tên đúng "scenes/chuong-sontinh.png" rồi để vào zip (đúng thư mục)
Tên file (trong assets/, đúng như code đang tìm): scenes/chuong-sontinh.png
Chỗ dùng: js/ui.js:1280 showCampaign() — nền bản đồ chọn ải (SVG storyScene)
Cỡ hiện trên màn: khung bản đồ chương ≈800×300   ·   Khung: 1 tranh
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 1280x768 illustrated campaign map background (bird's-eye view, slightly tilted, like a painted fantasy map) for the level-select screen of a cute mobile tower-defense game, chapter Sơn Tinh – Thủy Tinh (Phong Châu citadel of the Hung Kings by the Da river): the Da river valley seen from above: winding blue river, green Tản Viên mountains, rice terraces, small bronze-roofed villages and Phong Châu citadel at the far right.
Keep the middle band fairly calm (the game draws level badges and a dotted route on top). Subtle Dong Son bronze-drum border ornaments at the corners only.
Painterly cute mobile-game illustration in the same family as the main menu key art: warm Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked into the scenery, soft cel shading, rich but readable colors, chibi characters with big round eyes and thick dark-brown outlines #2A1608. No text, no letters, no numbers, no UI, no frame, no watermark, full bleed.
```

### #78 · Bản đồ chương · Thạch Sanh

```
#78 · Bản đồ chương · Thạch Sanh · nhóm I · ưu tiên 2
Lưu ảnh tên: chuong-thachsanh.png   ·   Cắt: không cần cắt — đổi tên đúng "scenes/chuong-thachsanh.png" rồi để vào zip (đúng thư mục)
Tên file (trong assets/, đúng như code đang tìm): scenes/chuong-thachsanh.png
Chỗ dùng: js/ui.js:1280 showCampaign() — nền bản đồ chọn ải (SVG storyScene)
Cỡ hiện trên màn: khung bản đồ chương ≈800×300   ·   Khung: 1 tranh
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 1280x768 illustrated campaign map background (bird's-eye view, slightly tilted, like a painted fantasy map) for the level-select screen of a cute mobile tower-defense game, chapter Thạch Sanh (forest temple and highland village): an ancient misty forest seen from above: giant banyan tree, a small temple, a dark cave mouth in rocky hills, a stilt-house village.
Keep the middle band fairly calm (the game draws level badges and a dotted route on top). Subtle Dong Son bronze-drum border ornaments at the corners only.
Painterly cute mobile-game illustration in the same family as the main menu key art: warm Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked into the scenery, soft cel shading, rich but readable colors, chibi characters with big round eyes and thick dark-brown outlines #2A1608. No text, no letters, no numbers, no UI, no frame, no watermark, full bleed.
```

### #79 · Bản đồ chương · Thánh Gióng

```
#79 · Bản đồ chương · Thánh Gióng · nhóm I · ưu tiên 2
Lưu ảnh tên: chuong-giong.png   ·   Cắt: không cần cắt — đổi tên đúng "scenes/chuong-giong.png" rồi để vào zip (đúng thư mục)
Tên file (trong assets/, đúng như code đang tìm): scenes/chuong-giong.png
Chỗ dùng: js/ui.js:1280 showCampaign() — nền bản đồ chọn ải (SVG storyScene)
Cỡ hiện trên màn: khung bản đồ chương ≈800×300   ·   Khung: 1 tranh
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 1280x768 illustrated campaign map background (bird's-eye view, slightly tilted, like a painted fantasy map) for the level-select screen of a cute mobile tower-defense game, chapter Thánh Gióng (Phù Đổng village, Red River delta rice fields): Red River delta rice fields seen from above: golden paddies with dikes, bamboo groves, Phù Đổng village, Sóc mountain in the distance.
Keep the middle band fairly calm (the game draws level badges and a dotted route on top). Subtle Dong Son bronze-drum border ornaments at the corners only.
Painterly cute mobile-game illustration in the same family as the main menu key art: warm Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked into the scenery, soft cel shading, rich but readable colors, chibi characters with big round eyes and thick dark-brown outlines #2A1608. No text, no letters, no numbers, no UI, no frame, no watermark, full bleed.
```

### #80 · Bản đồ chương · Lạc Long Quân

```
#80 · Bản đồ chương · Lạc Long Quân · nhóm I · ưu tiên 2
Lưu ảnh tên: chuong-llq.png   ·   Cắt: không cần cắt — đổi tên đúng "scenes/chuong-llq.png" rồi để vào zip (đúng thư mục)
Tên file (trong assets/, đúng như code đang tìm): scenes/chuong-llq.png
Chỗ dùng: js/ui.js:1280 showCampaign() — nền bản đồ chọn ải (SVG storyScene)
Cỡ hiện trên màn: khung bản đồ chương ≈800×300   ·   Khung: 1 tranh
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 1280x768 illustrated campaign map background (bird's-eye view, slightly tilted, like a painted fantasy map) for the level-select screen of a cute mobile tower-defense game, chapter Lạc Long Quân (East Sea coast, dragon king): the East Sea coast seen from above: turquoise sea with islands of Hạ Long, sandy beaches, coral, a fishing village, a lake shaped like a fox (Hồ Tây).
Keep the middle band fairly calm (the game draws level badges and a dotted route on top). Subtle Dong Son bronze-drum border ornaments at the corners only.
Painterly cute mobile-game illustration in the same family as the main menu key art: warm Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked into the scenery, soft cel shading, rich but readable colors, chibi characters with big round eyes and thick dark-brown outlines #2A1608. No text, no letters, no numbers, no UI, no frame, no watermark, full bleed.
```

### #81 · Bản đồ chương · An Dương Vương

```
#81 · Bản đồ chương · An Dương Vương · nhóm I · ưu tiên 2
Lưu ảnh tên: chuong-adv.png   ·   Cắt: không cần cắt — đổi tên đúng "scenes/chuong-adv.png" rồi để vào zip (đúng thư mục)
Tên file (trong assets/, đúng như code đang tìm): scenes/chuong-adv.png
Chỗ dùng: js/ui.js:1280 showCampaign() — nền bản đồ chọn ải (SVG storyScene)
Cỡ hiện trên màn: khung bản đồ chương ≈800×300   ·   Khung: 1 tranh
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 1280x768 illustrated campaign map background (bird's-eye view, slightly tilted, like a painted fantasy map) for the level-select screen of a cute mobile tower-defense game, chapter An Dương Vương (spiral Cổ Loa citadel): the spiral Cổ Loa citadel seen from above: three spiral earthen walls, moats, bronze banners, villages and fields around, the sea far to the right.
Keep the middle band fairly calm (the game draws level badges and a dotted route on top). Subtle Dong Son bronze-drum border ornaments at the corners only.
Painterly cute mobile-game illustration in the same family as the main menu key art: warm Dong Son bronze-drum motifs (sun-star, Lac birds, zigzag bands) worked into the scenery, soft cel shading, rich but readable colors, chibi characters with big round eyes and thick dark-brown outlines #2A1608. No text, no letters, no numbers, no UI, no frame, no watermark, full bleed.
```

### #82 · Dải thông báo (tên chiêu lớn, boss tới)

```
#82 · Dải thông báo (tên chiêu lớn, boss tới) · nhóm B · ưu tiên 3
Lưu ảnh tên: hc-dai-thong-bao.png   ·   Cắt: tools/cat-anh.html nhận tên hc-dai-thong-bao.png → tách 1 vật theo thứ tự đọc (trái→phải, trên→dưới)
Tên file (trong assets/, đúng như code đang tìm): ui/dai-thong-bao.png
Chỗ dùng: js/main.js:1138 (banner tên chiêu lớn / boss tới)
Cỡ hiện trên màn: ≈260×44 px   ·   Khung: 1 ảnh tĩnh, chữ vẽ code đè lên
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 1536x256 game UI sheet, one element centered:
one long horizontal ribbon banner (6:1): deep red cloth with gold-bronze edges, folded swallow-tail ends, small sun-star medallions at both ends, the long middle EMPTY and plain for text.
Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading for a cute mobile game. Same lighting and the same bronze palette in every cell; elements fill about 90% of their cell; straight, symmetric, front view (no perspective), no text, no letters, no numbers, no icons inside.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #83 · Sao Thần tinh trên đầu tướng thần

```
#83 · Sao Thần tinh trên đầu tướng thần · nhóm B · ưu tiên 3
Lưu ảnh tên: hc-sao-than-tinh.png   ·   Cắt: tools/cat-anh.html nhận tên hc-sao-than-tinh.png → tách 1 vật theo thứ tự đọc (trái→phải, trên→dưới)
Tên file (trong assets/, đúng như code đang tìm): ui_than-tinh.png
Chỗ dùng: js/main.js:714-721 (★ trên đầu tướng; tướng thần dùng ui_than-tinh.png)
Cỡ hiện trên màn: 8×8 px (vẽ 16 px để nét)   ·   Khung: 1 ảnh tĩnh
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
```

```
Create ONE image: a 256x256 square game UI icon, one element centered: a small five-pointed star made of glowing orange-gold bronze with a tiny red sun-star gem in the middle and a thin dark-brown outline #2A1608 — the "god star" rank mark shown above a hero's head.
Dong Son bronze drum art style (Vietnamese trong dong): engraved bronze surfaces, concentric rings, a sun-star with pointed rays, flying Lac birds, zigzag and circle-dot bands, warm bronze gold #C9963A with dark green patina #2F6B5E accents, thick dark-brown outline #2A1608, flat cartoon shading for a cute mobile game. One bold simple shape readable at 8-12 px: no fine engraving, thick outline, fills about 80% of the image. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #84 · Vụ nổ hệ Kim (đạn nổ lan)

```
#84 · Vụ nổ hệ Kim (đạn nổ lan) · nhóm D · ưu tiên 3
Lưu ảnh tên: no-kim.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên no-kim.png (cat-fx.py dai no-kim.png no-kim)
Tên file (trong assets/, đúng như code đang tìm): vfx/no-kim.png
Chỗ dùng: js/main.js:1028 (đạn nổ lan)
Cỡ hiện trên màn: 50–90 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: a METAL area explosion seen from the front, slightly from above: a burst of silver blades and golden sun-star rays exploding outward, sharp metal shards, a bright white core. [1] small bright core on the ground [2] blast growing [3] biggest blast [4] blast breaking apart [5] debris and smoke thinning [6] faint smoke.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every frame with at least 6% empty margin; nothing crosses into another frame.
```

### #85 · Vụ nổ hệ Mộc (đạn nổ lan)

```
#85 · Vụ nổ hệ Mộc (đạn nổ lan) · nhóm D · ưu tiên 3
Lưu ảnh tên: no-moc.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên no-moc.png (cat-fx.py dai no-moc.png no-moc)
Tên file (trong assets/, đúng như code đang tìm): vfx/no-moc.png
Chỗ dùng: js/main.js:1028 (đạn nổ lan)
Cỡ hiện trên màn: 50–90 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: a WOOD area explosion seen from the front, slightly from above: thorny green vines and leaves bursting up from the ground in a ring, flowers blooming, green spores. [1] small bright core on the ground [2] blast growing [3] biggest blast [4] blast breaking apart [5] debris and smoke thinning [6] faint smoke.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every frame with at least 6% empty margin; nothing crosses into another frame.
```

### #86 · Vụ nổ hệ Thủy (đạn nổ lan)

```
#86 · Vụ nổ hệ Thủy (đạn nổ lan) · nhóm D · ưu tiên 3
Lưu ảnh tên: no-thuy.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên no-thuy.png (cat-fx.py dai no-thuy.png no-thuy)
Tên file (trong assets/, đúng như code đang tìm): vfx/no-thuy.png
Chỗ dùng: js/main.js:1028 (đạn nổ lan)
Cỡ hiện trên màn: 50–90 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: a WATER area explosion seen from the front, slightly from above: a blue water geyser splash: a ring of big waves bursting outward, droplets and white foam. [1] small bright core on the ground [2] blast growing [3] biggest blast [4] blast breaking apart [5] debris and smoke thinning [6] faint smoke.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every frame with at least 6% empty margin; nothing crosses into another frame.
```

### #87 · Vụ nổ hệ Hỏa (đạn nổ lan)

```
#87 · Vụ nổ hệ Hỏa (đạn nổ lan) · nhóm D · ưu tiên 3
Lưu ảnh tên: no-hoa.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên no-hoa.png (cat-fx.py dai no-hoa.png no-hoa)
Tên file (trong assets/, đúng như code đang tìm): vfx/no-hoa.png
Chỗ dùng: js/main.js:1028 (đạn nổ lan)
Cỡ hiện trên màn: 50–90 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: a FIRE area explosion seen from the front, slightly from above: a fiery explosion: orange-red fireball, flames and embers, then dark smoke puffs. [1] small bright core on the ground [2] blast growing [3] biggest blast [4] blast breaking apart [5] debris and smoke thinning [6] faint smoke.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every frame with at least 6% empty margin; nothing crosses into another frame.
```

### #88 · Vụ nổ hệ Thổ (đạn nổ lan)

```
#88 · Vụ nổ hệ Thổ (đạn nổ lan) · nhóm D · ưu tiên 3
Lưu ảnh tên: no-tho.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên no-tho.png (cat-fx.py dai no-tho.png no-tho)
Tên file (trong assets/, đúng như code đang tìm): vfx/no-tho.png
Chỗ dùng: js/main.js:1028 (đạn nổ lan)
Cỡ hiện trên màn: 50–90 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: a EARTH area explosion seen from the front, slightly from above: an earth eruption: rock chunks and dirt blasting up in a ring, a dust cloud. [1] small bright core on the ground [2] blast growing [3] biggest blast [4] blast breaking apart [5] debris and smoke thinning [6] faint smoke.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every frame with at least 6% empty margin; nothing crosses into another frame.
```

### #89 · Boss chết (nổ lớn + cột sáng)

```
#89 · Boss chết (nổ lớn + cột sáng) · nhóm D · ưu tiên 3
Lưu ảnh tên: chet-boss.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên chet-boss.png (cat-fx.py dai chet-boss.png chet-boss)
Tên file (trong assets/, đúng như code đang tìm): vfx/chet-boss.png
Chỗ dùng: js/main.js:1044 (boss chết)
Cỡ hiện trên màn: ≈90 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-CAN-GEN.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames (frame 1 = start, frames 3-4 = strongest, frame 6 = almost gone).
EFFECT: a BIG boss defeat burst: [1] bright white-gold flash in the center [2] golden bronze-drum sun-star with many rays exploding outward [3] shockwave ring and a tall column of golden light rising, sparks flying [4] smoke clouds rolling out at the base, light column at its brightest [5] column thinning, golden sparkles falling [6] faint sparkles and thin smoke.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked. Readable at 50 px.
STYLE LOCK: cartoon VFX matching chibi Vietnamese-mythology game art (Dong Son bronze-drum flavor), the SAME effect in every frame. NEGATIVE (do NOT draw): characters, people, faces, hands, text, letters, numbers, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every frame with at least 6% empty margin; nothing crosses into another frame.
```

### #90 · Hiệu ứng dust · bụi khi chết (dự phòng chet-quai)

```
#90 · Hiệu ứng dust · bụi khi chết (dự phòng chet-quai) · nhóm D · ưu tiên 3
Lưu ảnh tên: dust.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên dust.png (cat-fx.py dai dust.png dust)
Tên file (trong assets/, đúng như code đang tìm): vfx/dust.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (die — bụi khi chết (dự phòng chet-quai))
Cỡ hiện trên màn: 34 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-GUI-AI.txt, PROMPT_GEMINI_FULL.txt, PROMPT-CAN-GEN.txt, PROMPT-HIEU-UNG.txt, PROMPT-FOOOCUS.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a monster vanishing into dust: [1] small puff of pale smoke [2] bigger puff with light-blue sparkles [3] round cloud of dust and spirit sparkles [4] cloud breaking up, sparkles rising [5] thin wisps [6] almost gone.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #91 · Hiệu ứng shield-gold · khiên vàng

```
#91 · Hiệu ứng shield-gold · khiên vàng · nhóm D · ưu tiên 3
Lưu ảnh tên: shield-gold.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên shield-gold.png (cat-fx.py dai shield-gold.png shield-gold)
Tên file (trong assets/, đúng như code đang tìm): vfx/shield-gold.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (dome — khiên vàng)
Cỡ hiện trên màn: nửa elip bán kính   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a protective golden dome: [1] a thin golden ring on the ground [2] dome rising half, engraved with bronze-drum zigzag bands [3] full translucent golden dome with a sun-star on top [4] dome glowing brighter, small Lac birds circling [5] dome cracking into light shards [6] fading golden dust.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #92 · Hiệu ứng rocks · đá rơi, nứt đất

```
#92 · Hiệu ứng rocks · đá rơi, nứt đất · nhóm D · ưu tiên 3
Lưu ảnh tên: rocks.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên rocks.png (cat-fx.py dai rocks.png rocks)
Tên file (trong assets/, đúng như code đang tìm): vfx/rocks.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (rockfall / cracks — đá rơi, nứt đất)
Cỡ hiện trên màn: 29×21 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-GUI-AI.txt, PROMPT_GEMINI_FULL.txt, PROMPT-CAN-GEN.txt, PROMPT-HIEU-UNG.txt, PROMPT-FOOOCUS.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: falling rocks and cracking ground: [1] a few small rocks in the air [2] rocks falling, dust [3] rocks hitting the ground, ground cracks [4] big dust cloud and cracked earth [5] dust settling, rubble [6] small rubble and thin dust.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #93 · Hiệu ứng coins · rơi đồ

```
#93 · Hiệu ứng coins · rơi đồ · nhóm D · ưu tiên 3
Lưu ảnh tên: coins.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên coins.png (cat-fx.py dai coins.png coins)
Tên file (trong assets/, đúng như code đang tìm): vfx/coins.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (drop — rơi đồ)
Cỡ hiện trên màn: 11 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt, PROMPT-FOOOCUS.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: bronze coins with a square hole popping out: [1] one coin jumping up [2] three coins flying up and outward [3] coins at the top, spinning, glinting [4] coins falling down [5] coins bouncing on the ground [6] coins shining then fading.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #94 · Hiệu ứng music-notes · nốt nhạc (Trương Chi, Thạch Sanh)

```
#94 · Hiệu ứng music-notes · nốt nhạc (Trương Chi, Thạch Sanh) · nhóm D · ưu tiên 3
Lưu ảnh tên: music-notes.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên music-notes.png (cat-fx.py dai music-notes.png music-notes)
Tên file (trong assets/, đúng như code đang tìm): vfx/music-notes.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (notes — nốt nhạc (Trương Chi, Thạch Sanh))
Cỡ hiện trên màn: 12 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: magic music notes from a lute: [1] one small golden note appears [2] three notes floating up in a wave [3] many golden and cyan notes swirling, sparkles [4] notes spreading outward [5] notes fading [6] faint sparkles.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #95 · Hiệu ứng flood-rise · nước dâng cả màn

```
#95 · Hiệu ứng flood-rise · nước dâng cả màn · nhóm D · ưu tiên 3
Lưu ảnh tên: flood-rise.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên flood-rise.png (cat-fx.py dai flood-rise.png flood-rise)
Tên file (trong assets/, đúng như code đang tìm): vfx/flood-rise.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (floodrise — nước dâng cả màn)
Cỡ hiện trên màn: toàn màn   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: flood water rising: [1] water ripples on the ground [2] water level rising, small waves [3] high blue water wall with foam crest [4] wave peak, splashing [5] water falling back [6] ripples fading.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #96 · Hiệu ứng mountain-rise · mọc núi

```
#96 · Hiệu ứng mountain-rise · mọc núi · nhóm D · ưu tiên 3
Lưu ảnh tên: mountain-rise.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên mountain-rise.png (cat-fx.py dai mountain-rise.png mountain-rise)
Tên file (trong assets/, đúng như code đang tìm): vfx/mountain-rise.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (raise — mọc núi)
Cỡ hiện trên màn: 34×24 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a rocky green mountain pushing up from the ground: [1] ground cracking, pebbles [2] rocky peak breaking through [3] mountain half up, dust [4] full small green-topped stone mountain, dust clouds [5] mountain standing, dust settling [6] mountain with small rubble around.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, a thin dark-brown #2A1608 outline only on solid objects (rocks, coins, notes), Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #97 · Hiệu ứng afterimage · bóng lướt

```
#97 · Hiệu ứng afterimage · bóng lướt · nhóm D · ưu tiên 3
Lưu ảnh tên: afterimage.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên afterimage.png (cat-fx.py dai afterimage.png afterimage)
Tên file (trong assets/, đúng như code đang tìm): vfx/afterimage.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (afterimage — bóng lướt)
Cỡ hiện trên màn: 5 bóng 9×21 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a dash trail of speed lines from LEFT to RIGHT: [1] short streaks [2] longer [3] full ghostly speed trail [4] trail breaking [5] thin [6] faint.
STYLE: game VFX animation frames in the style of the free Kenney Particle Pack: ONLY pure white and light-grey shapes on a perfectly flat pure BLACK #000000 background, soft glowing edges, bright core, NO color at all (the game tints it), no outline, no shading other than brightness, no text, no numbers, no labels, no grid lines, no borders, no watermark. Each shape centered in every frame with at least 8% empty black margin; nothing touches or crosses into another cell.
```

### #98 · Hiệu ứng hook · ném đá tảng / móc kéo

```
#98 · Hiệu ứng hook · ném đá tảng / móc kéo · nhóm D · ưu tiên 3
Lưu ảnh tên: hook.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên hook.png (cat-fx.py dai hook.png hook)
Tên file (trong assets/, đúng như code đang tìm): vfx/hook.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (hook — ném đá tảng / móc kéo)
Cỡ hiện trên màn: dây + đầu 7 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a vine rope with a hook shooting RIGHT then pulling back: [1] short vine [2] half [3] full vine with hook [4] hook caught, vine tight [5] pulling back [6] short vine.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #99 · Hiệu ứng vortex · xoáy

```
#99 · Hiệu ứng vortex · xoáy · nhóm D · ưu tiên 3
Lưu ảnh tên: vortex.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên vortex.png (cat-fx.py dai vortex.png vortex)
Tên file (trong assets/, đúng như code đang tìm): vfx/vortex.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (vortex — xoáy)
Cỡ hiện trên màn: 30 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a spinning sand-and-wind vortex: [1] small swirl [2] swirl growing with sand grains [3] full tornado swirl, tan and white [4] spinning faster [5] breaking apart [6] fading grains.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #100 · Hiệu ứng revive · hồi sinh

```
#100 · Hiệu ứng revive · hồi sinh · nhóm D · ưu tiên 3
Lưu ảnh tên: revive.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên revive.png (cat-fx.py dai revive.png revive)
Tên file (trong assets/, đúng như code đang tìm): vfx/revive.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (revive — hồi sinh)
Cỡ hiện trên màn: 25×92 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a golden revive light column: [1] gold dot on ground [2] thin column rising [3] full column with a sun-star at the top and rising sparkles [4] column glowing [5] column thinning [6] sparkles fading.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #101 · Hiệu ứng volley · loạt tên bắn lên

```
#101 · Hiệu ứng volley · loạt tên bắn lên · nhóm D · ưu tiên 3
Lưu ảnh tên: volley.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên volley.png (cat-fx.py dai volley.png volley)
Tên file (trong assets/, đúng như code đang tìm): vfx/volley.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (volley — loạt tên bắn lên)
Cỡ hiện trên màn: 6 nét   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a fan of five light arrows shooting RIGHT: [1] arrows appear at the left [2] spread forming a fan [3] full fan with streaks [4] streaks stretching [5] thinning [6] faint streaks.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #102 · Hiệu ứng mark · dấu săn mục tiêu

```
#102 · Hiệu ứng mark · dấu săn mục tiêu · nhóm D · ưu tiên 3
Lưu ảnh tên: mark.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên mark.png (cat-fx.py dai mark.png mark)
Tên file (trong assets/, đúng như code đang tìm): vfx/mark.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (mark — dấu săn mục tiêu)
Cỡ hiện trên màn: 21–34 px   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-GUI-AI.txt, PROMPT_GEMINI_FULL.txt, PROMPT-CAN-GEN.txt, PROMPT-HIEU-UNG.txt, PROMPT-FOOOCUS.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a red-orange target mark above an enemy: [1] small circle [2] circle with four inward arrows [3] full crosshair seal with bronze-drum dots, bright [4] pulsing [5] shrinking [6] fading.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #103 · Hiệu ứng meteor · thiên thạch / Hỏa Sơn

```
#103 · Hiệu ứng meteor · thiên thạch / Hỏa Sơn · nhóm D · ưu tiên 3
Lưu ảnh tên: meteor.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên meteor.png (cat-fx.py dai meteor.png meteor)
Tên file (trong assets/, đúng như code đang tìm): vfx/meteor.png
Chỗ dùng: js/main.js:1053-1712 / js/render.js:471-485 VFX_FILE (meteor — thiên thạch / Hỏa Sơn)
Cỡ hiện trên màn: 20 px + đuôi   ·   Khung: dải 6 khung
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 1536x256 horizontal animation strip of 6 equal 256x256 square frames in ONE row, read left to right, for a cute mobile tower-defense game based on Vietnamese folk legends. Each frame is one moment of the SAME effect, same center, same scale, smooth change between neighbouring frames.
EFFECT: a flaming rock falling diagonally from upper right to lower left: [1] small fiery dot top-right [2] rock with fire tail [3] closer, bigger tail [4] about to hit [5] impact flash [6] smoke.
STYLE: bold readable cartoon VFX, thick simple shapes, flat colors with a bright core, Vietnamese Dong Son bronze-drum flavor (sun-star rays, Lac birds, zigzag and circle-dot bands) only where it is asked.
BACKGROUND: perfectly flat pure BLACK #000000 everywhere (the game turns black into transparency, so dark parts become see-through). Bright, saturated glowing colors; no text, no numbers, no labels, no grid lines, no borders, no watermark. The effect is centered in every cell with at least 6% empty margin; nothing crosses into another cell.
```

### #104 · Cây Đa Thần (Mẫu Thượng Ngàn)

```
#104 · Cây Đa Thần (Mẫu Thượng Ngàn) · nhóm E · ưu tiên 3
Lưu ảnh tên: trieu-hoi_cay-da-than.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên trieu-hoi_cay-da-than.png (cat-fx.py don trieu-hoi_cay-da-than.png trieu-hoi_cay-da-than)
Tên file (trong assets/, đúng như code đang tìm): trieu-hoi_cay-da-than.png
Chỗ dùng: js/main.js:500-519 (vòng + thân + 4 tán lá code)
Cỡ hiện trên màn: 34×60 px   ·   Khung: 1 ảnh rời, game tự xoay / lật
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt, PROMPT-FOOOCUS.txt
```

```
Create ONE image: a 512x512 single game sprite, one object centered, filling about 85% of the image.
SUBJECT: a magical banyan tree growing from the ground: thick twisted trunk, hanging aerial roots, round dense green crown with small golden glowing leaves, roots spread at the base, full tree standing on its base. Readable at 30 px.
STYLE: cute mobile-game art matching chibi heroes of a Vietnamese folk-legend tower-defense game: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds), about 20-30 flat colors, no gradients.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every cell with at least 6% empty margin; nothing crosses into another cell.
STYLE LOCK: Vietnamese-mythology CHIBI game art like the attached style sample — chibi body 2.5 to 3 heads tall (big head about 1/3 of the height, big expressive eyes, short body and short limbs), thick clean dark-brown outline, flat cel shading, bright colors; Van Lang / Au Lac / Dong Son costume and weapons (bronze-drum patterns, Lac-bird feather headdress, loincloth, ao the, bronze spear, bronze axe, crossbow), never Chinese, Japanese, Korean or Western fantasy style. Animals and spirits are chibi too: round, chunky, cute-but-fierce, the same line art.
NEGATIVE (do NOT draw): two or more characters in the image, duplicated / cloned character, extra people, extra limbs, extra fingers, missing arms, missing legs, cropped feet or head, body cut by the image edge, twisted or broken body, text, letters, numbers, captions, speech bubbles, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render, tall anime proportions, Chinese armor, Japanese samurai or kimono, Korean hanbok, Western knight armor, magenta on the character, floor shadow.
```

### #105 · Ngựa sắt (Thánh Gióng)

```
#105 · Ngựa sắt (Thánh Gióng) · nhóm E · ưu tiên 3
Lưu ảnh tên: trieu-hoi_ngua-sat.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên trieu-hoi_ngua-sat.png (cat-fx.py don trieu-hoi_ngua-sat.png trieu-hoi_ngua-sat)
Tên file (trong assets/, đúng như code đang tìm): trieu-hoi_ngua-sat.png
Chỗ dùng: js/main.js:1092, 1522 (hộp xám + lửa)
Cỡ hiện trên màn: 25×14 px   ·   Khung: 1 ảnh rời, game tự xoay / lật
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 512x512 single game sprite, one subject centered, filling about 85% of the image.
SUBJECT: the iron horse of Saint Giong galloping RIGHT, black iron armor plates, flaming red-orange mane and tail, breathing a small fire jet from its mouth, side view, whole body. Readable at 40 px.
STYLE: cute mobile-game art matching chibi heroes of a Vietnamese folk-legend tower-defense game: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds), about 20-30 flat colors, no gradients.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every cell with at least 6% empty margin; nothing crosses into another cell.
STYLE LOCK: Vietnamese-mythology CHIBI game art like the attached style sample — chibi body 2.5 to 3 heads tall (big head about 1/3 of the height, big expressive eyes, short body and short limbs), thick clean dark-brown outline, flat cel shading, bright colors; Van Lang / Au Lac / Dong Son costume and weapons (bronze-drum patterns, Lac-bird feather headdress, loincloth, ao the, bronze spear, bronze axe, crossbow), never Chinese, Japanese, Korean or Western fantasy style. Animals and spirits are chibi too: round, chunky, cute-but-fierce, the same line art.
NEGATIVE (do NOT draw): two or more characters in the image, duplicated / cloned character, extra people, extra limbs, extra fingers, missing arms, missing legs, cropped feet or head, body cut by the image edge, twisted or broken body, text, letters, numbers, captions, speech bubbles, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render, tall anime proportions, Chinese armor, Japanese samurai or kimono, Korean hanbok, Western knight armor, magenta on the character, floor shadow.
```

### #106 · Gióng bay về trời

```
#106 · Gióng bay về trời · nhóm E · ưu tiên 3
Lưu ảnh tên: trieu-hoi_giong-bay.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên trieu-hoi_giong-bay.png (cat-fx.py don trieu-hoi_giong-bay.png trieu-hoi_giong-bay)
Tên file (trong assets/, đúng như code đang tìm): trieu-hoi_giong-bay.png
Chỗ dùng: js/main.js:1554 (chấm cam)
Cỡ hiện trên màn: 18–32 px   ·   Khung: 1 ảnh rời, game tự xoay / lật
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt
```

```
Create ONE image: a 512x512 single game sprite, one subject centered, filling about 85% of the image.
SUBJECT: young giant hero Saint Giong riding the flying iron horse to the RIGHT, swinging an uprooted bamboo cane, flame trail behind, side view. Readable at 40 px.
STYLE: cute mobile-game art matching chibi heroes of a Vietnamese folk-legend tower-defense game: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds), about 20-30 flat colors, no gradients.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every cell with at least 6% empty margin; nothing crosses into another cell.
STYLE LOCK: Vietnamese-mythology CHIBI game art like the attached style sample — chibi body 2.5 to 3 heads tall (big head about 1/3 of the height, big expressive eyes, short body and short limbs), thick clean dark-brown outline, flat cel shading, bright colors; Van Lang / Au Lac / Dong Son costume and weapons (bronze-drum patterns, Lac-bird feather headdress, loincloth, ao the, bronze spear, bronze axe, crossbow), never Chinese, Japanese, Korean or Western fantasy style. Animals and spirits are chibi too: round, chunky, cute-but-fierce, the same line art.
NEGATIVE (do NOT draw): two or more characters in the image, duplicated / cloned character, extra people, extra limbs, extra fingers, missing arms, missing legs, cropped feet or head, body cut by the image edge, twisted or broken body, text, letters, numbers, captions, speech bubbles, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render, tall anime proportions, Chinese armor, Japanese samurai or kimono, Korean hanbok, Western knight armor, magenta on the character, floor shadow.
```

### #107 · Hổ Ba Vì vồ

```
#107 · Hổ Ba Vì vồ · nhóm E · ưu tiên 3
Lưu ảnh tên: trieu-hoi_ho-ba-vi.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên trieu-hoi_ho-ba-vi.png (cat-fx.py don trieu-hoi_ho-ba-vi.png trieu-hoi_ho-ba-vi)
Tên file (trong assets/, đúng như code đang tìm): trieu-hoi_ho-ba-vi.png
Chỗ dùng: js/main.js:1653 (khối cam sọc)
Cỡ hiện trên màn: 21×13 px   ·   Khung: 1 ảnh rời, game tự xoay / lật
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt, PROMPT-FOOOCUS.txt
```

```
Create ONE image: a 512x512 single game sprite, one object centered, filling about 85% of the image.
SUBJECT: a fierce but cute orange tiger of Ba Vi mountain leaping forward to pounce, front paws stretched out, mouth open, black stripes, small bronze collar, side view facing RIGHT, whole body. Readable at 30 px.
STYLE: cute mobile-game art matching chibi heroes of a Vietnamese folk-legend tower-defense game: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds), about 20-30 flat colors, no gradients.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every cell with at least 6% empty margin; nothing crosses into another cell.
STYLE LOCK: Vietnamese-mythology CHIBI game art like the attached style sample — chibi body 2.5 to 3 heads tall (big head about 1/3 of the height, big expressive eyes, short body and short limbs), thick clean dark-brown outline, flat cel shading, bright colors; Van Lang / Au Lac / Dong Son costume and weapons (bronze-drum patterns, Lac-bird feather headdress, loincloth, ao the, bronze spear, bronze axe, crossbow), never Chinese, Japanese, Korean or Western fantasy style. Animals and spirits are chibi too: round, chunky, cute-but-fierce, the same line art.
NEGATIVE (do NOT draw): two or more characters in the image, duplicated / cloned character, extra people, extra limbs, extra fingers, missing arms, missing legs, cropped feet or head, body cut by the image edge, twisted or broken body, text, letters, numbers, captions, speech bubbles, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render, tall anime proportions, Chinese armor, Japanese samurai or kimono, Korean hanbok, Western knight armor, magenta on the character, floor shadow.
```

### #108 · Chim Lạc

```
#108 · Chim Lạc · nhóm E · ưu tiên 3
Lưu ảnh tên: trieu-hoi_chim-lac.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên trieu-hoi_chim-lac.png (cat-fx.py don trieu-hoi_chim-lac.png trieu-hoi_chim-lac)
Tên file (trong assets/, đúng như code đang tìm): trieu-hoi_chim-lac.png
Chỗ dùng: js/main.js:1673 (nét chữ V)
Cỡ hiện trên màn: 9–15 px   ·   Khung: 1 ảnh rời, game tự xoay / lật
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt, PROMPT-FOOOCUS.txt
```

```
Create ONE image: a 512x512 single game sprite, one object centered, filling about 85% of the image.
SUBJECT: a Lac bird from the Dong Son bronze drum flying RIGHT, long beak, long crest feathers and long tail, wings spread, bronze-gold with teal patina accents, side view. Readable at 30 px.
STYLE: cute mobile-game art matching chibi heroes of a Vietnamese folk-legend tower-defense game: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds), about 20-30 flat colors, no gradients.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every cell with at least 6% empty margin; nothing crosses into another cell.
STYLE LOCK: Vietnamese-mythology CHIBI game art like the attached style sample — chibi body 2.5 to 3 heads tall (big head about 1/3 of the height, big expressive eyes, short body and short limbs), thick clean dark-brown outline, flat cel shading, bright colors; Van Lang / Au Lac / Dong Son costume and weapons (bronze-drum patterns, Lac-bird feather headdress, loincloth, ao the, bronze spear, bronze axe, crossbow), never Chinese, Japanese, Korean or Western fantasy style. Animals and spirits are chibi too: round, chunky, cute-but-fierce, the same line art.
NEGATIVE (do NOT draw): two or more characters in the image, duplicated / cloned character, extra people, extra limbs, extra fingers, missing arms, missing legs, cropped feet or head, body cut by the image edge, twisted or broken body, text, letters, numbers, captions, speech bubbles, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render, tall anime proportions, Chinese armor, Japanese samurai or kimono, Korean hanbok, Western knight armor, magenta on the character, floor shadow.
```

### #109 · Chim Thần (Mai An Tiêm)

```
#109 · Chim Thần (Mai An Tiêm) · nhóm E · ưu tiên 3
Lưu ảnh tên: trieu-hoi_chim-than.png   ·   Cắt: tools/cat-anh.html nhận sẵn tên trieu-hoi_chim-than.png (cat-fx.py don trieu-hoi_chim-than.png trieu-hoi_chim-than)
Tên file (trong assets/, đúng như code đang tìm): trieu-hoi_chim-than.png
Chỗ dùng: js/main.js:1673 (nét chữ V)
Cỡ hiện trên màn: 9–15 px   ·   Khung: 1 ảnh rời, game tự xoay / lật
Đã có prompt trong file tổng: CÓ — PROMPT-HIEU-UNG.txt, PROMPT-FOOOCUS.txt
```

```
Create ONE image: a 512x512 single game sprite, one object centered, filling about 85% of the image.
SUBJECT: a small white-and-gold divine bird flying RIGHT, wings spread, glowing tail feathers, side view. Readable at 30 px.
STYLE: cute mobile-game art matching chibi heroes of a Vietnamese folk-legend tower-defense game: thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, Lac birds), about 20-30 flat colors, no gradients.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. Never use magenta or pink on the effect. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Centered in every cell with at least 6% empty margin; nothing crosses into another cell.
STYLE LOCK: Vietnamese-mythology CHIBI game art like the attached style sample — chibi body 2.5 to 3 heads tall (big head about 1/3 of the height, big expressive eyes, short body and short limbs), thick clean dark-brown outline, flat cel shading, bright colors; Van Lang / Au Lac / Dong Son costume and weapons (bronze-drum patterns, Lac-bird feather headdress, loincloth, ao the, bronze spear, bronze axe, crossbow), never Chinese, Japanese, Korean or Western fantasy style. Animals and spirits are chibi too: round, chunky, cute-but-fierce, the same line art.
NEGATIVE (do NOT draw): two or more characters in the image, duplicated / cloned character, extra people, extra limbs, extra fingers, missing arms, missing legs, cropped feet or head, body cut by the image edge, twisted or broken body, text, letters, numbers, captions, speech bubbles, signature, watermark, logo, grid lines, cell borders, frames, realistic, photo, 3D render, tall anime proportions, Chinese armor, Japanese samurai or kimono, Korean hanbok, Western knight armor, magenta on the character, floor shadow.
```

### #110 · Icon vẽ tay ui_*.png (gọi sớm · khám phá · luyện · hũ · kho lúa · đồng vàng)

```
#110 · Icon vẽ tay ui_*.png (gọi sớm · khám phá · luyện · hũ · kho lúa · đồng vàng) · nhóm F · ưu tiên 3
Lưu ảnh tên: hc-ui-ic.png   ·   Cắt: tools/cat-anh.html nhận tên hc-ui-ic.png → tách 8 vật theo thứ tự đọc (trái→phải, trên→dưới)
Tên file (trong assets/, đúng như code đang tìm): ui_dong-vang.png · ui_goi-som.png · ui_da-kham-pha.png · ui_luyen-the.png · ui_tay-luyen.png · ui_hu-dong.png · ui_hu-vua-hung.png · ui_kho-lua.png
Chỗ dùng: ui_dong-vang.png: js/ui.js:596 applyUiArt — vàng trên thanh trên cùng (đang là đồng CSS) · ui_goi-som.png: js/ui.js:2172 nút gọi đợt sớm · ui_da-kham-pha.png: js/ui.js:258 dấu đã khám phá (Bách khoa) · ui_luyen-the.png: js/ui.js:2321 luyện thể tướng · ui_tay-luyen.png: js/ui.js:3935 tẩy luyện · ui_hu-dong.png: js/ui.js:3846 nút Hũ đồng · ui_hu-vua-hung.png: js/ui.js:3846 nút Hũ Vua Hùng · js/render.js:473 sính lễ · ui_kho-lua.png: js/render.js:473 sceneArt(kholua) — thẻ thưởng kho lúa
Cỡ hiện trên màn: 16–22 px (thẻ thưởng 100–300 px)   ·   Khung: tĩnh
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: Chỉ hiện khi người chơi bật "Dùng ảnh AI" (Cài đặt); tắt thì game vẫn dùng ký hiệu / SVG.
```

```
Create ONE image: a 1024x512 game UI icon sheet, an invisible 4x2 grid of eight equal 256x256 cells, one icon per cell, read left to right, top to bottom:
[1] gold coin of the battle: a round gold coin with a square hole and a sun-star engraving  [2] call the next wave early: a small bronze war horn with two speed lines  [3] discovered: an open bronze-bound book with a small sparkle  [4] body training: a stone dumbbell with a fist  [5] reset training: a bronze washing basin with a circular arrow  [6] bronze jar: a round lidded bronze urn with drum patterns  [7] Hung King jar: a tall golden bronze urn with a sun-star and red cloth seal  [8] rice storehouse: a small stilt granary with a thatched roof full of golden rice.
cute mobile-game item icon, chunky readable shape, thick clean dark-brown outline #2A1608, flat cel shading (one shadow, one highlight), small Dong Son bronze-drum motifs (zigzag bands, sun-star, circle-dots). Each icon: one bold centered object filling about 80% of its cell, readable at 20 px, empty magenta margin around it, nothing touching another cell. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #111 · Núi Tản Viên · bậc 2 + bậc 5

```
#111 · Núi Tản Viên · bậc 2 + bậc 5 · nhóm I · ưu tiên 3
Lưu ảnh tên: hc-nui.png   ·   Cắt: tools/cat-anh.html nhận tên hc-nui.png → tách 2 vật theo thứ tự đọc (trái→phải, trên→dưới)
Tên file (trong assets/, đúng như code đang tìm): ban-do_nui-2.png · ban-do_nui-5.png
Chỗ dùng: js/ui.js:4127 render_mountain → sceneArt(mountain2 / mountain5), js/render.js:474 (bậc 1, 3, 4 đã có ảnh)
Cỡ hiện trên màn: ô 100 px cao   ·   Khung: 2 ảnh tĩnh
Đã có prompt trong file tổng: CÓ — PROMPT-FOOOCUS.txt
Ghi chú: Chỉ hiện khi bật "Dùng ảnh AI". Đính kèm assets/ban-do_nui-1.png / -3 / -4 làm ảnh mẫu để cùng nét.
```

```
Create ONE image: a 1024x512 sheet, an invisible 2x1 grid of two equal 512x512 cells, one mountain per cell, left to right:
[1] stage 2 "Đồi Nhỏ": a small rocky green hill, a bit bigger than a mound, a few rocks and two small trees  [2] stage 5 "Núi Thần": a giant sacred mountain with misty cliffs, lingzhi mushrooms on the slopes and warm golden light glowing at the peak.
Both drawn as a single standalone map object seen from a 3/4 top-down view, same camera, same painterly cute style as the other mountain stages (Gò Đất, Núi Non, Núi Cao already exist — match them), soft dark-brown outline, rich colors, Dong Son flavor; the whole mountain inside its cell with an empty margin. NOT a round medallion, NOT a coin, NOT a badge, no circular frame. No text, no letters, no numbers, no signature, no watermark, no logo, no grid lines, no cell borders.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

### #112 · Logo chữ "Thần Thoại Việt" (tùy chọn — AI hay viết sai dấu; sai thì bỏ, game dùng chữ HTML)

```
#112 · Logo chữ "Thần Thoại Việt" (tùy chọn — AI hay viết sai dấu; sai thì bỏ, game dùng chữ HTML) · nhóm I · ưu tiên 3
Lưu ảnh tên: logo-tua.png   ·   Cắt: không cần cắt — đổi tên đúng "ui/logo-tua.png" rồi để vào zip (đúng thư mục)
Tên file (trong assets/, đúng như code đang tìm): ui/logo-tua.png
Chỗ dùng: js/ui.js:360 logo menu (chưa có ảnh thì chữ CSS gradient) — TUỲ CHỌN: logo là chữ, AI hay sai dấu; sai thì bỏ
Cỡ hiện trên màn: ≈420×110 px   ·   Khung: 1 tranh
Đã có prompt trong file tổng: CÓ — PROMPT_GEMINI_FULL.txt
```

```
Create ONE image: a 1024x384 game title logo that reads exactly "Thần Thoại Việt" (Vietnamese, with correct diacritics: Thần = T-h-ầ-n, Thoại = T-h-o-ạ-i, Việt = V-i-ệ-t), one or two lines, big and centered.
LETTERS: thick bold carved bronze letters like engraved Dong Son bronze, warm gold #F2D27A to bronze #B8852A with dark green patina #2F6B5E edges, thick dark-brown outline #2A1608, small zigzag and circle-dot bands engraved inside the strokes, slight 3D bevel.
DECOR: behind the letters a thin half bronze-drum ring with a small sun-star and two flying Lac birds; a small mountain on the left end and a small wave curl on the right end. Keep the decoration small; the words must be the most readable thing.
Cute mobile-game look, flat cel shading, no gradients except the metal sheen, no glow outside the letters.
BACKGROUND: perfectly flat pure magenta #FF00FF everywhere. No other text, no numbers, no labels, no grid lines, no borders, no floor shadow, no watermark. Never use magenta on the subject. Keep at least 8% empty margin inside every cell; nothing crosses into another cell.
```

## Còn vẽ code nhưng chưa có chỗ nhận ảnh

```
============================================================
CÒN VẼ BẰNG CODE NHƯNG CODE CHƯA CÓ CHỖ NHẬN ẢNH (chưa tạo prompt — cần nối code trước, xem GAMEPLAY.md)
============================================================
- Trên bản đồ: vòng tầm đánh, vòng chọn / gợi ý ô đặt, đường nối tương sinh (js/main.js:328-351, js/render.js:650-699); gợn nước, mũi tên dòng chảy,
  dấu chân, cọc đầu đường (js/maps.js:307-396); mực nước dâng (js/render.js:559-568); viền / cỏ bờ đường (js/maps.js:232-303).
- Trên tướng / quái: bóng đổ, hào quang hạng, cột sáng tung chiêu, sao ★ hạng, huy hiệu cấp, chấm hệ (js/main.js:702-805, 943-968);
  bia mộ chờ hồi sinh (js/main.js:652-669); mũi tên ghép (js/main.js:610-629); dấu trạng thái trên đầu quái (sao choáng, khối băng, rễ trói, mây câm…);
  hào quang boss, vòng tinh anh, hạt biến thể (js/render.js:2072-2325); cánh rồng Lạc Long Quân (js/render.js:1626-1664).
- Vật trong trận: đồng xu rơi khi giết quái, hộp rơi đồ, số sát thương bay (js/main.js:1125-1837); khiên Kim Quy trên thành (js/main.js:573-591);
  Thành Một Đêm (js/main.js:544-549); vùng lửa / lúa / đá (js/main.js:474-532).
- Ảnh code có tìm nhưng KHÔNG phải hình code (thiếu thì dùng ảnh khác, không cần gấp): khung giận packs/<quái>/rage.png của camap, camapden, casau, kybinh, ran, ranbang, thietky;
  khung hoạt hình nhiều ảnh packs/<id>/{idle,attack,cast,walk}_N.png; tiles/castle-phong-chau.png (chương Sơn Tinh, thiếu thì không vẽ gì).
- Giao diện HTML (SVG / emoji / CSS, chưa có hook): icon vai trò 7 màu (js/roles.js:96); nút đóng ✕ / quay lại ‹, dấu ✓, ↑ nâng kỹ năng, núi (ICON ui.js:19-32);
  khoá chợ mở / đóng (MK_LOCK ui.js:63); SVG_LOCK / SVG_SK (ui.js:69-70); sách Bách khoa, trống đồng cảm ơn (ui.js:4164, 1569); nén bạc Ngân khố (.bac CSS);
  nút 💬 trò chuyện, ≡ menu, mắt ẩn / hiện giao diện, x1 / x2 tốc độ (index.html:35-40); ngăn kéo 🎒 🔯 📖 ⏸ ✉ 🏳 (index.html:61-67);
  ⚒ Lò đúc, ⛺ Nghỉ chân, ☀ nhiệm vụ ngày, 🤝 Cùng giữ thành, ⚜ Thần Khí, 📜 Công thức, 🍄 Linh Chi, ⛰ bồi đất, 🎁 quà (ui.js nhiều chỗ);
  sao ★ bậc tướng 1–3 (ui.js:1823…4086); icon chương khi thua 👹 🔥 🌊 🏹 ♾ (js/chapters.js CH_THEME.ic); màn xoay ngang sceneArt('rotate');
  khung kim loại .metal / .inset / tab .seg / đinh tán / hoa văn menu (css); ruột thanh máu boss, máu / năng lượng tướng, thanh tiến độ (css).
  Nhiều chỗ đã có ảnh nhưng code chưa dùng: ⚔ ui-tran-5-3, ▲ ui-tran-4-2, ↻ ui-tran-4-4, bạc ui-tai-nguyen-3, 🔥 ic-kho — chỉ cần nối code, không cần gen.

```

## Style bible

```
============================================================
STYLE BIBLE / CHUẨN PHONG CÁCH (áp dụng cho MỌI ảnh nhân vật bên dưới)
============================================================
ẢNH MẪU PHONG CÁCH: đính kèm docs/mau-luoi/vi-du-hero12-lactuong.png (tấm Lạc Tướng 12 khung đạt chuẩn; bản 1 nhân vật: docs/mau-lac-tuong.png) cùng mọi prompt và ghi thêm câu:
  "Match the art style, chibi proportions and line art of the attached style sample exactly, but draw the NEW character described below."

1. NHÂN VẬT NGƯỜI / TƯỚNG: CHIBI cao 2.5–3 đầu (đầu to ~1/3 chiều cao, mắt to, thân và tay chân ngắn), viền nâu sẫm đậm và sạch, tô cel-shading phẳng, màu tươi.
   Tướng già / to cao / gầy vẫn là chibi — khác nhau bằng bề ngang, dáng đứng, cỡ người, râu tóc, mảng hình đặc trưng, KHÔNG thu nhỏ đầu thành người thật.
2. CHẤT VIỆT: trang phục / vũ khí thần thoại Việt thời Văn Lang – Âu Lạc, văn hoá Đông Sơn: hoa văn trống đồng (mặt trời, chim Lạc, răng cưa, vòng tròn chấm),
   khố, áo the, váy đụp, mũ lông chim, giáo đồng, rìu đồng, dao găm, nỏ thần, khiên đồng. KHÔNG phong cách Trung Quốc / Nhật / Hàn / phương Tây (không giáp Tàu, kimono, samurai, hanbok, hiệp sĩ).
3. QUÁI / BOSS / THÚ: vẫn chibi tròn trịa, mập mạp, "dễ thương mà dữ", cùng nét vẽ với tướng.
4. GIẢI PHẪU: đúng 1 đầu, 2 tay, 2 chân, bàn tay 5 ngón (vẽ đơn giản được), tay chân nối đúng khớp, không thiếu / thừa chi. Thú, rồng, hồn ma: đúng số đầu / chân / cánh / đuôi như mô tả.
   TOÀN THÂN (từ đỉnh mũ lông tới bàn chân) luôn nằm trọn trong ô, chừa lề ~8% — không cắt mất chân / đầu.
5. MỖI Ô ĐÚNG MỘT NHÂN VẬT: không nhân bản 2–3 người trong một ô, không thêm người phụ / đám đông. CÙNG MỘT NHÂN VẬT ở mọi ô: cùng mặt, tóc, màu áo, vũ khí, tỉ lệ — chỉ khác tư thế.
6. TUYỆT ĐỐI KHÔNG chữ, số, chữ ký, watermark, logo, nhãn, khung, đường lưới, bóng chữ trong ảnh.
7. NỀN hồng tím #FF00FF phẳng tuyệt đối (hiệu ứng ghi BLACK thì nền đen #000000), không bóng đổ ra nền, không dùng màu hồng tím trên nhân vật.
8. VŨ KHÍ & CHUYỂN ĐỘNG ĐÁNH: vũ khí cùng cỡ, cùng hình ở mọi khung, luôn nằm trong tay (không biến mất, không nhân đôi, không bay lơ lửng).
   Cung: khung 5 lắp tên → khung 6 kéo dây tới má, mũi tên LUÔN thấy trên dây → khung 7 buông, tên vừa rời cung → khung 8 thu tay. Nỏ tương tự (mũi tên trong rãnh).
   Kiếm / rìu / giáo / gậy phép: khung 5 giơ cao ra sau → khung 6 giữa đường vung (một vệt mờ duy nhất) → khung 7 cuối đường vung, tay duỗi → khung 8 thu về; đầu vũ khí đi theo MỘT cung tròn mượt.

ENGLISH SUMMARY FOR THE AI: Vietnamese-mythology CHIBI game art (2.5-3 heads tall, big head and eyes, short limbs, thick clean dark-brown outline, flat cel shading, bright colors),
Van Lang / Au Lac / Dong Son costume and weapons, never Chinese / Japanese / Korean / Western style. Exactly ONE character per cell and the SAME character design in every cell,
correct anatomy (1 head, 2 arms, 2 legs, 5 fingers), whole body inside the cell, no text / letters / numbers / watermark, flat magenta #FF00FF background.

QUY TRÌNH NÊN LÀM (giảm sai nhân vật giữa các ô):
  B1. Gen trước một ảnh "character sheet" 1 nhân vật đứng thẳng (dán prompt + câu: "First draw ONLY ONE full-body character, standing, on flat magenta #FF00FF — no grid, no text").
  B2. Duyệt ảnh đó theo danh sách kiểm tra bên dưới; sai thì gen lại B1, đúng thì giữ.
  B3. Gen tấm nhiều khung: đính kèm ảnh B1 làm ẢNH THAM CHIẾU + ảnh lưới docs/mau-luoi/<kiểu>.png + ảnh mẫu phong cách, dán prompt đầy đủ và ghi thêm:
      "Use the first attached image as the exact character reference — same face, hair, outfit colors, weapon and proportions in every cell."

KIỂM TRA TRƯỚC KHI NHẬN ẢNH (sai 1 dòng → gen lại, đừng cắt):
  [ ] Mỗi ô đúng 1 nhân vật (không nhân bản 2–3 người, không người phụ)
  [ ] Đủ đầu, 2 tay, 2 chân, nối đúng khớp; toàn thân nằm trọn trong ô, không bị cắt chân / đầu
  [ ] Các ô giống nhau: cùng mặt, tóc, màu áo, vũ khí, tỉ lệ (không như 2 người khác nhau)
  [ ] Không có chữ, số, chữ ký, watermark, khung, đường lưới
  [ ] Đúng chibi 2.5–3 đầu, chất Việt (Đông Sơn), không ra kiểu Trung / Nhật / Hàn / Tây
  [ ] Nền hồng tím #FF00FF phẳng, không bóng đổ, không màu hồng tím trên nhân vật
  [ ] Hàng đánh: vũ khí còn nguyên ở mọi khung; cung có mũi tên trên dây (khung 5–6) và tên vừa bay ra (khung 7); đường vung kiếm / gậy liền mạch

```
