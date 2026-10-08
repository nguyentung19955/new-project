# Soát thiết kế UI/UX — Thần Thoại Việt (bản 231, pixel mặc định)

Người soát: vai designer UI/UX game mobile (pixel art, thủ thành). **Chỉ soát và báo cáo, không sửa code.**
Nhánh soát: `claude/mobile-tower-defense-game-k5oxzo` @ `ef3eb06` (v231).
Cách chụp: Playwright, `file://index.html`, font Google tải thật (Handjet / Alegreya SC / Alegreya Sans / VT323), save giả lập
(mở 20 ải, 8 tướng huyền thoại, Ngân khố 50.000). Mỗi màn chụp ở **1920×934, 844×390, 667×375, dọc 390×844** — 128 ảnh, đã xem từng ảnh.
Ảnh minh hoạ (thu nhỏ) ở `docs/design-review/`. Ảnh gốc không commit (ở scratchpad của session).

> Ghi chú: ở dọc 390×844 game tự xoay 90° (giao diện nằm ngang trên màn dọc), nên bố cục giống 844×390 xoay; điểm dọc chấm riêng cho trải nghiệm cầm máy.

---

## 1. Điểm từng màn (1–10)

| Màn | 1920 | 844 | 667 | Dọc | Nhận xét nhanh |
|---|---|---|---|---|---|
| Menu chính | 7 | 7 | 6 | 5 | Nền tranh vẽ mịn (không pixel) đẹp nhưng lệch phong cách; nút phụ nhỏ |
| Đăng nhập | 6 | 6 | 6 | 5 | Hộp thoại trơn, nút pixel + chữ serif mịn |
| Chọn chế độ | 7 | 6 | 5 | 5 | Mô tả trắng đè lên vùng cát sáng của ảnh nền |
| Bản đồ chương 1 (Sơn Tinh) | 8 | 7.5 | 7 | 6 | Bản đồ pixel đẹp; "Tướng khắc chế" bị cắt; nút độ khó quá nhỏ |
| Bản đồ chương 2–5 | 5 | 5 | 5 | 4 | Nền placeholder phẳng (trời + 3 núi tam giác) — trông chưa xong |
| Chuẩn bị xuất quân | 6 | 6 | 5.5 | 5 | Mô tả đè viền thanh gỗ; nền sóng tranh vẽ; 40% dưới trống |
| Anh Hùng | 8 | 8 | 7.5 | 6 | Tốt nhất; pixel thống nhất; tiêu đề Handjet mảnh |
| Ấn Phù | 6 | 6 | 6 | 5 | Nút "Khắc cấp" bị cắt đáy (844); ô khoá tối; trống nhiều ở 1920 |
| Kho Báu & Sính Lễ | 4 | 4 | 4 | 3.5 | Ô chưa có gần như vô hình; không có thông tin gì |
| Bách khoa | 6.5 | 6.5 | 6 | 5 | Mô tả thẻ tràn ra ngoài thẻ, chữ xám trên dải cam; tab kiểu viên thuốc |
| Cài đặt | 5 | 5 | 5 | 4.5 | Công tắc kiểu iOS, không pixel; trống 2 bên |
| Trong trận (thẳng/chia nhánh/cầu/bến đò/cổng 3) | 7.5 | 7 | 6.5 | 5.5 | Bản đồ pixel nhất quán; hiệu ứng trạng thái khó thấy; ô trống lẫn vào cỏ |
| Boss | 7.5 | 7 | 6.5 | 5.5 | Boss pixel rõ, khiên bong bóng đẹp |
| Thanh tướng (chọn tướng trên sân) | 7.5 | 7.5 | 7 | 6 | Gọn; nhãn "cấp 3" trên ô đồ 9px |
| Chợ triệu hồi (deck) | 6.5 | 6.5 | 6 | 5.5 | Chân dung tướng trên thẻ quá nhỏ (~20px) |
| Hợp thể | 4 | 4 | 3.5 | 3 | Tràn đè HUD, thẻ khoá trong suốt thấy bản đồ → rối |
| Cây kỹ năng | 8 | 7.5 | 7 | 6 | Rõ ràng; cột khoá hơi tối |
| Túi đồ | 7.5 | 7.5 | 7 | 6 | Ổn; ô trang bị trống chữ xám nhỏ |
| Tiến hoá | 6.5 | 6.5 | 6 | 5.5 | Thẻ bậc dày chữ; danh sách hợp thể đặc |
| Lò đúc | 7 | 7 | 6.5 | 6 | Tab chưa chọn nổi hơn tab đang chọn |
| Núi Tản Viên | 8 | 8 | 7.5 | 6.5 | Đẹp, nút chính nổi rõ |
| Sính lễ (chọn thưởng boss) | 7.5 | 7 | 6.5 | 6 | Nút "Chọn" trông như bị khoá trong 1,2 s đầu |
| Kết quả (thua/kỷ lục) | 6 | 6 | 5.5 | 5 | Tiêu đề đỏ "thất thủ" lấn át "Kỷ lục mới"; nền tranh vẽ |
| Hội thoại / toast / banner | 5 | 5 | 4.5 | 4 | Chồng nhau cùng một vùng phía trên |

**Điểm chung toàn game: 6.3/10.** Phần in-game, Anh Hùng, Cây kỹ năng, Núi Tản Viên đã đạt chuẩn pixel tốt. Kéo điểm xuống là:
lẫn tranh vẽ mịn với pixel, 4 font chồng nhau (số 0 hiện như chữ "o"), các lớp phủ chồng nhau trong trận, vùng chạm nhỏ trên điện thoại.

---

## 2. Vấn đề theo mức

### NẶNG

**N1. Bảng Hợp thể trong trận tràn đè HUD, rất rối** — mọi cỡ. Ảnh: `design-review/hop-the-de-hud.jpg`
- Tiêu đề "Hợp thể · Tím · Vàng" đè lên chữ "Đợt 9 · Vô tận"; nút ? / ✕ đè nút ☰ của topbar; dòng hướng dẫn đè chip "Đợt 10: Boss Thuồng Luồng" (chữ lồng chữ).
- Thẻ tướng chưa mở trong suốt ~50% → nhìn xuyên thấy sông, cây, ô đặt tướng phía sau.
- Đề xuất: panel bắt đầu dưới topbar (`top: 44px` ở 844, `top: 84px` ở 1920), nền đặc `#15110C` (alpha ≥ .96) + lớp tối toàn màn `#000000B3` phía sau;
  ẩn chip đợt sau/banner khi panel mở; thẻ khoá giữ nền `#1E1912` đặc, chỉ làm xám ảnh (`filter: grayscale(1) brightness(.55)`), chữ tên `#9A8C70`.

**N2. Số 0 hiện như chữ "o"** (Alegreya Sans dùng số kiểu cổ — oldstyle) — mọi màn có số.
- Ví dụ: "Cấp 1 · ∞ đợt o" (menu), "Kỷ lục: đợt o" (chế độ), "o/5" "o/3" (Ấn Phù), "Đã sưu tầm o / 78" (Kho báu), "1 điểm (còn o)" (Cây kỹ năng), "Tổng vàng đã kiếm o".
- Số lẫn cao thấp ("150", "+15") nhìn nhảy dòng.
- Đề xuất: `body { font-variant-numeric: lining-nums tabular-nums; }` (hoặc `font-feature-settings: "lnum" 1, "tnum" 1`) cho toàn bộ chữ Alegreya.

**N3. Kho Báu & Sính Lễ: ô chưa có gần như vô hình** — mọi cỡ. Ảnh: `design-review/kho-bau-tuong-phan.jpg`
- Bóng món đồ ~`#1C1A16` trên ô `#16130F`, tương phản ≈ 1,1:1 — người chơi thấy một lưới ô đen trống, không biết đó là gì.
- Không tên, không gợi ý cách lấy, không tiến độ từng nhóm.
- Đề xuất: viền ô `#5A4A30` 2px, bóng món `#3A3326` + dấu "?" `#8C7A55` góc; chạm ô hiện tên + "Rơi từ: boss X / Lò đúc"; tiêu đề nhóm thêm "3/22"; ô đã có viền theo độ hiếm.

**N4. Hội thoại, banner, toast, chip đợt chồng lên nhau** — trong trận, 844/667 rõ nhất. Ảnh: `design-review/thoai-chong-banner.jpg`
- Lời thoại tướng (y≈55–100), banner "Thủy Tinh dâng nước" (y≈95–130) và chip "Đợt 10: Boss…" cùng một vùng; toast "Thánh Gióng đã vào vị trí" bên phải che thành.
- Đề xuất: một hàng đợi duy nhất cho banner + thoại (không hiện cùng lúc); thoại đặt góc trái dưới ngay trên deck (`bottom: 64px; left: 8px; max-width: 46%`);
  banner giữa màn ở 38% chiều cao; toast cột phải dưới topbar, tối đa 2 dòng, không quá 34% bề ngang; ẩn chip "Đợt N" khi banner đang hiện.

**N5. Vùng chạm nhỏ trên điện thoại** — đo ở 667×375 (đã có "tự động +20%"):
| Phần tử | Kích thước | Màn |
|---|---|---|
| 5 nút topbar (ẩn UI, chi tiết, x1, chạy, menu) | 36×27 | Trận |
| Tab chương (Sơn Tinh, Thạch Sanh…) | cao 21 | Bản đồ |
| Thường / Khó ×1,60 | 66×16–17 | Bản đồ |
| Nút quay lại | 31×27 | Bản đồ, các bảng |
| Bách khoa / Xếp hạng / Góp ý | cao 21 | Menu |
| Anh Hùng / Ấn Phù / Kho Báu / Cài Đặt | cao 31 | Menu |
| Thẻ chợ, Đổi, Khoá, Hợp thể | cao 38 | Trận |
- Đề xuất: cao tối thiểu 40px trên màn ≤ 900px (có thể giữ hình nhỏ và mở rộng vùng bằng `::after { inset: -6px }`); Thường/Khó gộp thành 1 nút công tắc 120×40.

**N6. Bản đồ chương 2–5 là nền tạm** — 844/1920. Ảnh: `design-review/ban-do-chuong2.jpg` so với `ban-do-chuong1.jpg`
- Trời xanh phẳng + 3 tam giác núi + nền đất phẳng + đường nét đứt; chương 1 là bản đồ pixel chi tiết (sông, ruộng, làng). Cảm giác "chưa làm xong".
- Đề xuất: mỗi chương 1 bản đồ pixel 480×270 theo `docs/pixel/QUY-CHUAN.md` (Thạch Sanh: rừng đa + miếu; Thánh Gióng: làng tre + đồng; Lạc Long Quân: biển; An Dương Vương: thành ốc). Tạm thời: dùng ảnh nền trận của ải đầu chương, phủ tối 40%.

**N7. Lẫn tranh vẽ mịn với pixel** — menu, đăng nhập, chuẩn bị, kết quả, sính lễ (nền).
- Nền menu/đăng nhập là tranh vẽ mịn độ phân giải cao; nền chuẩn bị/kết quả là sóng tranh vẽ bị làm mờ; trong khi trận, tướng, bảng là pixel.
- Đề xuất: (a) bản pixel của `nen-menu` (vẽ lại 480×270, phóng nearest ×4) hoặc tối thiểu pixel hoá (thu ¼, bảng 32 màu, phóng nearest); (b) nền chuẩn bị/kết quả thay bằng nền tối `#0E0B08` + hoạ tiết trống đồng pixel 10% — bớt rối.

### VỪA

**V1. 4 font, tiêu đề Handjet mảnh** — mọi bảng.
- Handjet (tiêu đề bảng: "Anh Hùng Văn Lang", "Lạc Tướng", "Cây kỹ năng", "Túi đồ", "Cài đặt", "Chọn chế độ", "Hợp thể") nét mảnh, nhạt hơn nút phụ cạnh nó dùng Alegreya SC đậm ("Đền Anh Hùng") → phân cấp ngược.
- Đề xuất: tiêu đề bảng dùng Alegreya SC 800 (như logo, nút) hoặc Handjet 800 + `text-shadow: 0 2px 0 #000, 0 0 1px #000` và cỡ ×1,2; giữ Handjet cho banner/tên boss; VT323 chỉ cho số HUD. Tối đa 3 font.

**V2. Nút "Chọn" ở bảng Sính lễ trông như bị khoá** — mọi cỡ. Ảnh: `design-review/sinh-le-nut-chon.jpg`
- Trong 1,2 s chặn bấm nhầm, cả 3 nút nền `#4A3A22`, chữ `#8A7650` → giống nút vô hiệu; nút chính không nổi.
- Đề xuất: giữ màu nút vàng `#E8B83A` chữ `#2A1A08`, thể hiện thời gian chặn bằng thanh chạy mảnh 3px ở đáy nút.

**V3. Thẻ Bách khoa: mô tả tràn khỏi thẻ, tương phản thấp** — mọi cỡ. Ảnh: `design-review/bach-khoa.jpg`
- Mô tả xám `#9A8A70` trên dải cam `#B07A2A` (≈ 2:1), dòng 2 chạy ra ngoài viền dưới; tên thẻ đè viền ảnh. Tab "Quái / Boss / Bí truyền / Vai trò" dạng viên thuốc bo tròn — khác tab gỗ của Lò đúc và tab chữ nhật của bản đồ (3 kiểu tab).
- Đề xuất: dải tên nền `#2A2118`, tên `#F2D27A`, mô tả `#E8DCC0` `-webkit-line-clamp: 2`, thẻ cao cố định; thống nhất 1 kiểu tab pixel (góc vuông, viền 2px bậc thang, chọn = vàng `#E8B83A`, chưa chọn = `#3A2E20`).

**V4. Lò đúc: tab chưa chọn nổi hơn tab đang chọn** — "Cửa hàng", "Hũ báu" nền cam sáng, "Công thức" (đang chọn) nền tối. Đảo lại: chọn = vàng sáng, chưa chọn = gỗ tối `#3A2E20`.

**V5. Cài đặt: công tắc kiểu iOS** — `#2EA043` bo tròn, không pixel; 1920 trống 2 bên; nội dung dưới bị cắt, không có dấu hiệu cuộn. Ảnh: `design-review/cai-dat.jpg`
- Đề xuất: công tắc pixel 52×28 (tắt: gỗ `#3A2E20`, bật: vàng `#E8B83A` + chữ BẬT); 2 cột ở ≥ 1280px; bóng mờ cuối danh sách khi còn nội dung.

**V6. Chuẩn bị xuất quân** — Ảnh: `design-review/chuan-bi.jpg`
- Mô tả Hậu cần chạm/đè đường chấm viền dưới thanh gỗ (1920: "lên vào túi", "(35% đồ bộ)"); nhãn "khắc hành Thủy" 9px; ~40% dưới trống, nền sóng tranh vẽ.
- Đề xuất: thanh cao 64px (1920) / 46px (844), mô tả 1 dòng + ellipsis; nhãn khắc chế ≥ 11px; dồn lưới tướng lên giữa, nền tối đặc.

**V7. Bản đồ chương: cột phải bị cắt** — 844/667. Hàng icon "Tướng khắc chế" bị hàng nút Thường/Khó + "Vào vô tận" cắt nửa. Đề xuất: rút mô tả còn 3 dòng (line-clamp) hoặc cho cột phải cuộn với nút cố định đáy.

**V8. Ấn Phù** — Ảnh: `design-review/an-phu.jpg`
- 844: nút "Khắc cấp 1 · 1 điểm Ấn" chỉ hiện nửa trên ở đáy cột phải. 1920: ~35% dưới trống.
- Ô ấn chưa mở tương phản thấp; badge số "3"/"1" chồng lên chân dung tướng ở thanh trên.
- Đề xuất: nút khắc cố định đáy panel (sticky), danh sách cấp cuộn; ô khoá viền `#5A4A30` thay vì gần như trùng nền; badge đặt ngoài vòng tròn.

**V9. Hiệu ứng trạng thái khó nhận ra** — trận, rõ nhất 667.
- Bỏng/độc là chấm 3–4px; băng không đổi màu quái rõ; choáng (vòng xoáy trắng) thấy được. Quái ở 667 chỉ ~14px.
- Đề xuất: icon trạng thái pixel 8×8 cạnh thanh máu (lửa `#FF8A2A`, độc `#7CE04A`, choáng sao `#F2D27A`, băng `#9EDDF2`); băng: tô quái `#9EDDF2` 45% + viền 1px.

**V10. Ô đặt tướng trống lẫn vào cỏ** — bản đồ cỏ: đĩa `#7FA85A` trên cỏ `#4E7A2E`. Đề xuất: viền sáng `#F2E6C8` 1px + bóng đáy `#00000066`, hoặc đĩa đá xám `#9A9284`.

**V11. Tướng ở mép trái sát cửa quái ra** — cầu, bến đò, chia nhánh, cổng 3: tướng đứng x < 40px bị cắt nửa ở mép màn và đè lên quái vừa sinh. Đề xuất: không đặt ô trong 1 ô đầu bản đồ, hoặc thêm lề trái cho khung nhìn.

**V12. Thẻ chợ triệu hồi** — chân dung chỉ ~20px, giá + icon vai trò chiếm phần lớn thẻ → khó nhận ra tướng. Đề xuất: chân dung 32px (844), giá dời xuống viền dưới thẻ 12px.

**V13. Chọn chế độ** — Ảnh: `design-review/che-do.jpg`. Chữ mô tả trắng chạy qua vùng cát sáng `#D8C08A` (667 khó đọc); thẻ "Cùng Giữ Thành" xám quá. Đề xuất: lớp tối phủ trái→phải đến 75% bề ngang `linear-gradient(90deg,#0E1A22F2 0 55%,#0E1A2200 80%)`; thẻ "Sắp ra mắt" giữ chữ `#C8BFA8`.

**V14. Kết quả trận vô tận** — Ảnh: `design-review/ket-qua.jpg`. Lập kỷ lục mới mà tiêu đề vẫn đỏ "Phong Châu thất thủ" + chip đỏ "Thành đã mất" lấn át "Kỷ lục mới!" nhỏ; nút "Chơi lại / Menu chính" mờ trong thời gian chặn. Đề xuất: khi có kỷ lục, tiêu đề vàng "Kỷ lục mới · Đợt 15", dòng phụ "Phong Châu thất thủ"; nút như V2.

**V15. Dọc 390×844** — game xoay 90°, không có lời nhắc; người chơi cầm dọc phải nghiêng đầu đọc chữ. Đề xuất: lớp phủ "Xoay ngang để chơi" (icon điện thoại pixel) khi dọc, hoặc giữ xoay nhưng hiện lời nhắc 2 s lần đầu.

### NHẸ

- **L1** Menu: Bách khoa / Xếp hạng / Góp ý 11–12px gạch chân kiểu web → đổi thành 3 nút icon pixel 40×40 có nhãn.
- **L2** Bách khoa ở menu hiện "220" (vàng trận) thay vì Ngân khố → ẩn khi mở từ menu.
- **L3** Thanh "Đợt 1 · Vô tận": chữ chạm mép trên thanh tiến độ; dấu "·" dính chữ ("·Vô tận").
- **L4** Ở 1920 sprite tướng phóng ~8× trong khi icon UI ~2–3× → mật độ pixel lệch. Giữ phóng nguyên lần tối đa ×5 cho chân dung.
- **L5** Toast "Đã khám phá…" 3 dòng che vùng thành; nhãn "Đã dừng" giữa màn đè lên đường đi → dời xuống dưới topbar, cạnh nút chạy.
- **L6** Tiến hoá: 3 thẻ bậc nhiều dòng chỉ số, chữ 10–11px ở 667; danh sách hợp thể bên phải dày (4 dòng điều kiện đỏ) → gom điều kiện thành 1 dòng "Thiếu 3 điều kiện ▸".
- **L7** Túi đồ: chữ "Vũ khí / Mũ / Giáp" trong ô trống `#6A5E4A` 10px — dùng icon bóng mờ thay chữ.
- **L8** Cây kỹ năng: cột chưa mở tối đều; nhấn mạnh hơn hàng "Cần tướng cấp 3" (vàng `#E8B83A`) để người chơi biết bước tiếp theo.

---

## 3. Điểm làm tốt (giữ nguyên)
- Bản đồ trận pixel (sông, đường, cầu, đò, cổng 3 phía) thống nhất, viền tối dày, đọc đường rõ.
- Tướng/quái/boss pixel cùng độ phân giải, sao bậc rõ, khung thẻ theo hành (Kim/Mộc/Thủy/Hỏa/Thổ) dễ nhận.
- Núi Tản Viên, Cây kỹ năng, Túi đồ: phân cấp nút chính tốt (nút vàng nổi), khoảng cách đều.
- Không có lỗi JS ở cả 4 cỡ khi đi qua toàn bộ màn.

## 4. Thứ tự nên sửa (top 10)
1. N1 Hợp thể đè HUD + thẻ trong suốt
2. N2 Số 0 thành "o" (1 dòng CSS `lining-nums`)
3. N4 Thoại/banner/toast chồng nhau
4. N5 Vùng chạm < 40px (topbar trận, tab chương, Thường/Khó)
5. N3 Kho Báu ô vô hình
6. V2 + V14 Nút "Chọn"/"Chơi lại" trông như bị khoá
7. N6 Bản đồ chương 2–5 placeholder
8. V1 Tiêu đề Handjet mảnh / quá nhiều font
9. V3 + V4 Thống nhất tab + thẻ Bách khoa
10. N7 Pixel hoá nền menu / chuẩn bị / kết quả
