# Soát thiết kế UI/UX — Thần Thoại Việt (bản 233, pixel đã gộp đủ)

Người soát: vai designer UI/UX game mobile (pixel art, thủ thành). **Chỉ soát và báo cáo, không sửa code.**
Nhánh soát: `claude/mobile-tower-defense-game-k5oxzo` — lần 1 @ `ef3eb06` (v231), **chụp lại @ `2c81aa1` (v233)** sau khi gộp icon kỹ năng riêng, hào quang Tím/Vàng, ảnh cũ chuyển pixel, ẩn chợ khi mở bảng.
Cách chụp: Playwright, `file://index.html`, font Google tải thật (Handjet / Alegreya SC / Alegreya Sans / VT323), save giả lập
(mở 20 ải, 8 tướng huyền thoại, Ngân khố 50.000). Mỗi màn chụp ở **1920×934, 844×390, 667×375, dọc 390×844** — 128 ảnh mỗi lần (v231 + v233), đã xem từng ảnh. v233: không lỗi JS.
Ảnh minh hoạ (thu nhỏ) ở `docs/design-review/`. Ảnh gốc không commit (ở scratchpad của session).

> Ghi chú: ở dọc 390×844 game tự xoay 90° (giao diện nằm ngang trên màn dọc), nên bố cục giống 844×390 xoay; điểm dọc chấm riêng cho trải nghiệm cầm máy.

---

# PHẦN A — THẨM MỸ: CÓ ĐẸP KHÔNG, ĐẸP LÊN ĐƯỢC TỚI ĐÂU (v233)

## A1. Điểm ĐẸP từng màn + cảm nhận

| Màn | Đẹp | Cảm nhận thật (người chơi / designer) |
|---|---|---|
| Menu chính | **7** | Hút mắt nhất game: trống đồng – mặt trời – thành Cổ Loa – sóng dữ, đúng chất "Sơn Tinh – Thủy Tinh". Nhưng là tranh vẽ mịn kiểu anime, vào trận lại thành pixel → cảm giác 2 game khác nhau. Bảng nút gỗ đẹp, 3 link phụ kiểu web làm "rẻ" góc dưới. |
| Đăng nhập | 5 | Tranh đẹp nhưng hộp đen trơn giữa màn như popup trình duyệt. |
| Chọn chế độ | 5 | Bố cục thẻ ổn, nền cát + gradient xanh đục; thẻ "Cùng Giữ Thành" xám chết. Không có không khí. |
| Bản đồ chương 1 | **8** | Đẹp, có chiều sâu: sông uốn, ruộng, núi, làng, số mốc vàng. Đây là chuẩn nên nhân ra. |
| Bản đồ chương 2–5 | 3 | Trời phẳng + 3 tam giác xanh + nét đứt: trông như bản phác, kéo tụt cảm nhận chất lượng cả game. |
| Chuẩn bị | 5 | Thanh gỗ hậu cần đẹp, chân dung tròn viền Tím/Vàng đẹp; nền sóng mờ bẩn, nửa dưới trống → hụt. |
| Anh Hùng | **8** | Màn đẹp nhất phần quản lý: lưới chân dung pixel to, nhãn hành màu, icon kỹ năng riêng (mới) rất có hồn. Đa dạng tạo hình (xương, ma, lửa, đá) — điểm cộng lớn so với game cùng loại. |
| Ấn Phù | 5 | 3 cột màu (đỏ/lục/lam) có ý đồ nhưng ô ấn xám đục, nhìn như form cài đặt; không có cảm giác "khắc phù". |
| Kho Báu | 3 | Lưới ô đen gần như trống — màn "sưu tầm" lẽ ra phải là màn khoe đồ đẹp nhất. |
| Bách khoa | 6 | Sprite quái đẹp; thẻ cam + tab viên thuốc lệch phong cách, chữ đè. |
| Cài đặt | 4 | Công tắc xanh iOS → phá chất cổ. |
| **Trong trận** | **7** | Bản đồ pixel sạch, viền đậm, sông/cầu/đò/cổng đọc tốt; tướng – quái – boss cùng độ phân giải, hào quang Tím/Vàng (mới) giúp nổi tướng hiếm. Thiếu: ánh sáng / chiều sâu (phẳng như bản đồ trên giấy), ô đặt tướng là đĩa xanh lặp lại nhàm, cỏ lặp, không có không khí (sương, nắng, bóng mây), hiệu ứng trạng thái nhỏ. |
| Boss | 7 | Thuồng Luồng to, uy, bong bóng khiên đẹp. Cần thêm khoảnh khắc "boss xuất hiện" (rung, tối màn, tên boss lớn). |
| Thanh tướng / Cây kỹ năng | 7.5 | Icon kỹ năng pixel riêng từng tướng (v233) làm cây kỹ năng "đắt" hẳn. Cột khoá tối đều hơi buồn. |
| Hợp thể | 3 | Rối nhất: đè HUD, thẻ trong suốt thấy bản đồ. |
| Túi đồ / Tiến hoá / Lò đúc | 6.5 | Gọn, khung gỗ thống nhất; thiếu điểm nhấn (đồ Huyền thoại nên phát sáng). |
| Núi Tản Viên | **8** | 5 giai đoạn núi pixel tròn rất đẹp, nút chính vàng nổi — đúng chất. |
| Sính lễ | 7 | Ngựa Chín Hồng Mao, Hũ Vua Hùng, cảnh kho lúa — tranh pixel đẹp, chữ "Vua Hùng ban thưởng" có khí thế. Nút "Chọn" xám làm mất hứng. |
| Kết quả | 5 | Tranh thành ngập có kể chuyện, nhưng bảng số liệu dài như bảng tính; thắng/thua chưa có cảm xúc. |

**Kết luận đẹp: 6/10 hiện tại.** Mỹ thuật nhân vật/bản đồ pixel thuộc nhóm khá (≈ 7,5); thứ kéo xuống là "lớp vỏ" — nền tranh lẫn pixel, khung/nút/tab không cùng một ngôn ngữ, màn phụ trống, thiếu ánh sáng và chuyển động.
**Trần có thể đạt: 8–8,5/10** chỉ bằng việc thống nhất lớp vỏ + ánh sáng, KHÔNG cần vẽ lại nhân vật.

## A2. So với game thủ thành pixel / 2D đẹp cùng thể loại

| Tiêu chí | Kingdom Rush | Legend of Keepers / game pixel mobile nổi (Kingdom Two Crowns, Pixel Defenders) | Thần Thoại Việt v233 |
|---|---|---|---|
| Một ngôn ngữ hình ảnh | Toàn bộ vẽ tay cùng nét, cùng bảng màu | 100% pixel cùng độ phân giải, UI cũng pixel | Pixel + tranh anime + UI web (font serif mịn, công tắc iOS, gradient CSS) |
| Ánh sáng & chiều sâu | Đổ bóng mềm dưới mọi vật, tối viền màn, ánh nắng | Lighting động (đuốc, nắng chiều, phản chiếu nước) | Phẳng, không bóng đổ ngoài đĩa đứng; không vignette |
| Bản đồ có "kể chuyện" | Mỗi màn có chi tiết riêng (thuyền đắm, làng cháy) | Nền nhiều lớp parallax | Bản đồ sạch nhưng lặp (cây/nhà/đĩa giống nhau) |
| Ô đặt tháp | Bệ đá có cờ, rất "mời gọi" bấm | Bệ có hoạ tiết riêng | Đĩa xanh nhạt lẫn vào cỏ |
| Phản hồi (juice) | Số sát thương nảy, nổ, rung, chậm khung | Hạt, flash trắng khi trúng | Có số + rung, thiếu flash trúng đòn, hạt khi chết |
| Khung UI | Khung gỗ + đinh tán, cùng một bộ cho mọi bảng | Khung pixel 9-slice | Khung gỗ đẹp ở menu/nút, nhưng tab có 3 kiểu, nút phụ kiểu web |
| Bản sắc văn hoá | Fantasy châu Âu chung chung | Fantasy | **Điểm mạnh riêng**: Đông Sơn, truyền thuyết Việt, tạo hình phá cách (thầy mo xương, ma đèn trời) — chưa khai thác vào UI |

**Mình thua ở:** thống nhất phong cách, ánh sáng, độ "mời bấm" của ô đặt tướng, và juice khi đánh. **Mình hơn ở:** bản sắc Việt & tạo hình nhân vật — đang bị giấu sau UI quá trung tính.

## A3. Bảng màu thống nhất đề xuất (đồng hun – son – chàm, theo QUY-CHUAN.md)

| Vai trò | Hex | Dùng cho |
|---|---|---|
| Nền sâu | `#0E0B08` | nền màn phụ (thay tranh mờ) |
| Gỗ tối | `#2A1C10` | panel, tab chưa chọn, dải hoa văn |
| Gỗ sơn | `#3A2E20` | thẻ, ô |
| Viền đồng | `#8C6A2E` → sáng `#C9963A` | viền 2–3px mọi khung (bỏ viền 1px mảnh) |
| Vàng nghệ (nút chính) | `#E8B83A`, chữ `#2A1A08` | 1 nút chính / màn |
| Vàng chữ tiêu đề | `#F2D27A` | tiêu đề, số |
| Chữ thường | `#E8DCC0`, phụ `#B8A888` | thay `#7A705C` (quá tối) |
| Son đỏ | `#B8321E` | nguy hiểm, boss, mạng |
| Chàm | `#1E3A5A` / sáng `#4FA3D9` | Hiếm, nước, thông tin |
| Rêu | `#4E6A2A` / sáng `#7FC24A` | đạt, hồi máu |
| Tím Sử thi | `#A86CE0` | giữ |
| Cam Huyền thoại | `#F0A030` + phát sáng `#FFB44A55` | giữ, thêm glow |
| Bóng / vignette | `#0B0704` 70–80% | tối viền màn, bóng đổ |
Bỏ hẳn: xanh lá iOS `#2EA043`, gradient xanh–cát ở Chọn chế độ, xám trung tính `#8A8478` cho chữ.

## A4. Mockup trước/sau (chèn CSS tạm vào game thật + nền pixel hoá bằng Pillow)

- `design-review/mockup-menu-1920.jpg`, `design-review/mockup-menu-844.jpg`
- `design-review/mockup-tran-1920.jpg`, `design-review/mockup-tran-844.jpg`
- Mã mockup (CSS + script Playwright): `design-review/mockup-css.js` — các khối CSS trong đó dùng thẳng được.

Thay đổi trong mockup (tổng ~40 dòng CSS + 1 ảnh):
1. **Nền menu pixel hoá**: thu `nen-menu.jpg` về 534×248, 64 màu, phóng nearest ×3 — giữ được hoa văn trống đồng (bản 320×180 trước đây làm mất), đồng bộ với game pixel.
2. **Vignette** `radial-gradient(… transparent 55%, #0B0704CC)` ở menu và trận: dồn mắt vào giữa, bớt "phẳng".
3. **Dải hoa văn Đông Sơn** (vòng tròn chấm + răng cưa, SVG 24×12 pixel) viền bảng menu và dưới topbar trận — bản sắc Việt với 1 ảnh lặp.
4. **Số kiểu lining** (`0` thay vì `o`): "đợt 0", "Cấp 1".
5. **Nút phụ menu** thành nút gỗ 40px (bỏ link gạch chân kiểu web); nút Xuất Quân phát sáng `drop-shadow(0 0 10px #FFB44A88)`.
6. **Trận**: chỉnh màu `saturate(1.12) contrast(1.08) sepia(.08)` → ấm, cổ hơn; topbar nút tối thiểu 40px.

Cảm nhận sau mockup: menu từ 7 → **8** (liền mạch với trận, sang hơn), trận từ 7 → **7,5** (có khung, có không khí). Muốn trận lên 8,5 cần thêm mục A5.3–A5.4 (vẽ trong canvas).

## A5. 5 việc làm đẹp — ít công, đẹp lên nhiều (theo thứ tự)

1. **Một bộ "da" UI pixel dùng chung** (≈ 1 ngày): khung 9-slice gỗ + viền đồng 3px + đinh tán góc, 1 kiểu tab, 1 kiểu nút (chính vàng `#E8B83A` / phụ gỗ `#3A2E20` / khoá đá `#2A2620`), công tắc pixel, dải hoa văn Đông Sơn. Áp cho mọi bảng → hết cảm giác "web". Kèm `lining-nums` + tiêu đề Alegreya SC 800 (bỏ Handjet mảnh ở tiêu đề).
2. **Ánh sáng & không khí trong trận** (≈ ½ ngày, vẽ trong canvas): vignette + chỉnh màu ấm như mockup; bóng đổ elip `#00000055` dưới mọi tướng/quái; lớp bóng mây trôi chậm 6% alpha; nước lấp lánh 2–3 pixel sáng chạy theo dòng.
3. **Ô đặt tướng thành bệ đá Đông Sơn** (≈ 2 giờ, 1 sprite 24×12): bệ đá `#9A9284` viền tối, mặt khắc vòng tròn chấm; nhấp nháy viền vàng khi đang kéo tướng. Đây là thứ người chơi nhìn nhiều nhất sau tướng.
4. **Nền màn phụ = nền tối + hoạ tiết** thay tranh mờ (≈ 2 giờ): `#0E0B08` + mặt trống đồng pixel 10% alpha góc phải; áp cho Chuẩn bị, Kết quả, Chọn chế độ, Đăng nhập. Menu dùng bản pixel hoá như mockup. Bản đồ chương 2–5: tạm dùng ảnh nền trận ải đầu chương + tối 40% cho tới khi vẽ bản đồ riêng.
5. **Juice khoảnh khắc lớn** (≈ ½ ngày): boss xuất hiện = tối màn 0,4 s + tên boss Handjet to giữa màn + rung; quái chết = 6 hạt pixel màu quái; trúng đòn = flash trắng 1 khung; thắng/kỷ lục = chữ vàng lớn + pháo giấy đỏ–vàng. Đồ Huyền thoại trong Túi/Kho phát sáng `#FFB44A55` nhịp 2 s.

Làm đủ 5 việc: ước **8–8,5/10**, ngang mặt bằng game pixel mobile tốt, và có bản sắc riêng mà Kingdom Rush không có.

---

# PHẦN B — LỖI KỸ THUẬT GIAO DIỆN

> Trạng thái v233 (chụp lại 2c81aa1): **[còn]** = vẫn thấy ở v233, **[đỡ]** = đã cải thiện một phần, **[hết]** = không còn.
> Đã cải thiện ở v233: icon kỹ năng pixel riêng từng tướng (Anh Hùng, Cây kỹ năng, thanh tướng) — đồng bộ hơn hẳn; hào quang Tím/Vàng giúp phân biệt tướng hiếm trên sân; chợ ẩn khi mở bảng. Chưa lỗi nào trong danh sách dưới được sửa hẳn.

## 1. Điểm từng màn (1–10) — chấm ở v231, v233 gần như giữ nguyên (Cây kỹ năng +0,5 nhờ icon riêng)

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

**Điểm chung (kỹ thuật + bố cục) toàn game: 6.3/10 (v231) → 6.4/10 (v233).** Phần in-game, Anh Hùng, Cây kỹ năng, Núi Tản Viên đã đạt chuẩn pixel tốt. Kéo điểm xuống là:
lẫn tranh vẽ mịn với pixel, 4 font chồng nhau (số 0 hiện như chữ "o"), các lớp phủ chồng nhau trong trận, vùng chạm nhỏ trên điện thoại.

---

## 2. Vấn đề theo mức

### NẶNG

[còn] **N1. Bảng Hợp thể trong trận tràn đè HUD, rất rối** — mọi cỡ. Ảnh: `design-review/hop-the-de-hud.jpg`
- Tiêu đề "Hợp thể · Tím · Vàng" đè lên chữ "Đợt 9 · Vô tận"; nút ? / ✕ đè nút ☰ của topbar; dòng hướng dẫn đè chip "Đợt 10: Boss Thuồng Luồng" (chữ lồng chữ).
- Thẻ tướng chưa mở trong suốt ~50% → nhìn xuyên thấy sông, cây, ô đặt tướng phía sau.
- Đề xuất: panel bắt đầu dưới topbar (`top: 44px` ở 844, `top: 84px` ở 1920), nền đặc `#15110C` (alpha ≥ .96) + lớp tối toàn màn `#000000B3` phía sau;
  ẩn chip đợt sau/banner khi panel mở; thẻ khoá giữ nền `#1E1912` đặc, chỉ làm xám ảnh (`filter: grayscale(1) brightness(.55)`), chữ tên `#9A8C70`.

[còn] **N2. Số 0 hiện như chữ "o"** (Alegreya Sans dùng số kiểu cổ — oldstyle) — mọi màn có số.
- Ví dụ: "Cấp 1 · ∞ đợt o" (menu), "Kỷ lục: đợt o" (chế độ), "o/5" "o/3" (Ấn Phù), "Đã sưu tầm o / 78" (Kho báu), "1 điểm (còn o)" (Cây kỹ năng), "Tổng vàng đã kiếm o".
- Số lẫn cao thấp ("150", "+15") nhìn nhảy dòng.
- Đề xuất: `body { font-variant-numeric: lining-nums tabular-nums; }` (hoặc `font-feature-settings: "lnum" 1, "tnum" 1`) cho toàn bộ chữ Alegreya.

[còn] **N3. Kho Báu & Sính Lễ: ô chưa có gần như vô hình** — mọi cỡ. Ảnh: `design-review/kho-bau-tuong-phan.jpg`
- Bóng món đồ ~`#1C1A16` trên ô `#16130F`, tương phản ≈ 1,1:1 — người chơi thấy một lưới ô đen trống, không biết đó là gì.
- Không tên, không gợi ý cách lấy, không tiến độ từng nhóm.
- Đề xuất: viền ô `#5A4A30` 2px, bóng món `#3A3326` + dấu "?" `#8C7A55` góc; chạm ô hiện tên + "Rơi từ: boss X / Lò đúc"; tiêu đề nhóm thêm "3/22"; ô đã có viền theo độ hiếm.

[còn] **N4. Hội thoại, banner, toast, chip đợt chồng lên nhau** — trong trận, 844/667 rõ nhất. Ảnh: `design-review/thoai-chong-banner.jpg`
- Lời thoại tướng (y≈55–100), banner "Thủy Tinh dâng nước" (y≈95–130) và chip "Đợt 10: Boss…" cùng một vùng; toast "Thánh Gióng đã vào vị trí" bên phải che thành.
- Đề xuất: một hàng đợi duy nhất cho banner + thoại (không hiện cùng lúc); thoại đặt góc trái dưới ngay trên deck (`bottom: 64px; left: 8px; max-width: 46%`);
  banner giữa màn ở 38% chiều cao; toast cột phải dưới topbar, tối đa 2 dòng, không quá 34% bề ngang; ẩn chip "Đợt N" khi banner đang hiện.

[còn] **N5. Vùng chạm nhỏ trên điện thoại** — đo ở 667×375 (đã có "tự động +20%"):
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

[còn] **N6. Bản đồ chương 2–5 là nền tạm** — 844/1920. Ảnh: `design-review/ban-do-chuong2.jpg` so với `ban-do-chuong1.jpg`
- Trời xanh phẳng + 3 tam giác núi + nền đất phẳng + đường nét đứt; chương 1 là bản đồ pixel chi tiết (sông, ruộng, làng). Cảm giác "chưa làm xong".
- Đề xuất: mỗi chương 1 bản đồ pixel 480×270 theo `docs/pixel/QUY-CHUAN.md` (Thạch Sanh: rừng đa + miếu; Thánh Gióng: làng tre + đồng; Lạc Long Quân: biển; An Dương Vương: thành ốc). Tạm thời: dùng ảnh nền trận của ải đầu chương, phủ tối 40%.

[còn — menu cố ý giữ tranh cũ, xem A4.1] **N7. Lẫn tranh vẽ mịn với pixel** — menu, đăng nhập, chuẩn bị, kết quả, sính lễ (nền).
- Nền menu/đăng nhập là tranh vẽ mịn độ phân giải cao; nền chuẩn bị/kết quả là sóng tranh vẽ bị làm mờ; trong khi trận, tướng, bảng là pixel.
- Đề xuất: (a) bản pixel của `nen-menu` (vẽ lại 480×270, phóng nearest ×4) hoặc tối thiểu pixel hoá (thu ¼, bảng 32 màu, phóng nearest); (b) nền chuẩn bị/kết quả thay bằng nền tối `#0E0B08` + hoạ tiết trống đồng pixel 10% — bớt rối.

### VỪA

[còn] **V1. 4 font, tiêu đề Handjet mảnh** — mọi bảng.
- Handjet (tiêu đề bảng: "Anh Hùng Văn Lang", "Lạc Tướng", "Cây kỹ năng", "Túi đồ", "Cài đặt", "Chọn chế độ", "Hợp thể") nét mảnh, nhạt hơn nút phụ cạnh nó dùng Alegreya SC đậm ("Đền Anh Hùng") → phân cấp ngược.
- Đề xuất: tiêu đề bảng dùng Alegreya SC 800 (như logo, nút) hoặc Handjet 800 + `text-shadow: 0 2px 0 #000, 0 0 1px #000` và cỡ ×1,2; giữ Handjet cho banner/tên boss; VT323 chỉ cho số HUD. Tối đa 3 font.

[còn] **V2. Nút "Chọn" ở bảng Sính lễ trông như bị khoá** — mọi cỡ. Ảnh: `design-review/sinh-le-nut-chon.jpg`
- Trong 1,2 s chặn bấm nhầm, cả 3 nút nền `#4A3A22`, chữ `#8A7650` → giống nút vô hiệu; nút chính không nổi.
- Đề xuất: giữ màu nút vàng `#E8B83A` chữ `#2A1A08`, thể hiện thời gian chặn bằng thanh chạy mảnh 3px ở đáy nút.

[còn] **V3. Thẻ Bách khoa: mô tả tràn khỏi thẻ, tương phản thấp** — mọi cỡ. Ảnh: `design-review/bach-khoa.jpg`
- Mô tả xám `#9A8A70` trên dải cam `#B07A2A` (≈ 2:1), dòng 2 chạy ra ngoài viền dưới; tên thẻ đè viền ảnh. Tab "Quái / Boss / Bí truyền / Vai trò" dạng viên thuốc bo tròn — khác tab gỗ của Lò đúc và tab chữ nhật của bản đồ (3 kiểu tab).
- Đề xuất: dải tên nền `#2A2118`, tên `#F2D27A`, mô tả `#E8DCC0` `-webkit-line-clamp: 2`, thẻ cao cố định; thống nhất 1 kiểu tab pixel (góc vuông, viền 2px bậc thang, chọn = vàng `#E8B83A`, chưa chọn = `#3A2E20`).

[còn] **V4. Lò đúc: tab chưa chọn nổi hơn tab đang chọn** — "Cửa hàng", "Hũ báu" nền cam sáng, "Công thức" (đang chọn) nền tối. Đảo lại: chọn = vàng sáng, chưa chọn = gỗ tối `#3A2E20`.

[còn] **V5. Cài đặt: công tắc kiểu iOS** — `#2EA043` bo tròn, không pixel; 1920 trống 2 bên; nội dung dưới bị cắt, không có dấu hiệu cuộn. Ảnh: `design-review/cai-dat.jpg`
- Đề xuất: công tắc pixel 52×28 (tắt: gỗ `#3A2E20`, bật: vàng `#E8B83A` + chữ BẬT); 2 cột ở ≥ 1280px; bóng mờ cuối danh sách khi còn nội dung.

[còn] **V6. Chuẩn bị xuất quân** — Ảnh: `design-review/chuan-bi.jpg`
- Mô tả Hậu cần chạm/đè đường chấm viền dưới thanh gỗ (1920: "lên vào túi", "(35% đồ bộ)"); nhãn "khắc hành Thủy" 9px; ~40% dưới trống, nền sóng tranh vẽ.
- Đề xuất: thanh cao 64px (1920) / 46px (844), mô tả 1 dòng + ellipsis; nhãn khắc chế ≥ 11px; dồn lưới tướng lên giữa, nền tối đặc.

[còn] **V7. Bản đồ chương: cột phải bị cắt** — 844/667. Hàng icon "Tướng khắc chế" bị hàng nút Thường/Khó + "Vào vô tận" cắt nửa. Đề xuất: rút mô tả còn 3 dòng (line-clamp) hoặc cho cột phải cuộn với nút cố định đáy.

[còn] **V8. Ấn Phù** — Ảnh: `design-review/an-phu.jpg`
- 844: nút "Khắc cấp 1 · 1 điểm Ấn" chỉ hiện nửa trên ở đáy cột phải. 1920: ~35% dưới trống.
- Ô ấn chưa mở tương phản thấp; badge số "3"/"1" chồng lên chân dung tướng ở thanh trên.
- Đề xuất: nút khắc cố định đáy panel (sticky), danh sách cấp cuộn; ô khoá viền `#5A4A30` thay vì gần như trùng nền; badge đặt ngoài vòng tròn.

[còn] **V9. Hiệu ứng trạng thái khó nhận ra** — trận, rõ nhất 667.
- Bỏng/độc là chấm 3–4px; băng không đổi màu quái rõ; choáng (vòng xoáy trắng) thấy được. Quái ở 667 chỉ ~14px.
- Đề xuất: icon trạng thái pixel 8×8 cạnh thanh máu (lửa `#FF8A2A`, độc `#7CE04A`, choáng sao `#F2D27A`, băng `#9EDDF2`); băng: tô quái `#9EDDF2` 45% + viền 1px.

[còn] **V10. Ô đặt tướng trống lẫn vào cỏ** — bản đồ cỏ: đĩa `#7FA85A` trên cỏ `#4E7A2E`. Đề xuất: viền sáng `#F2E6C8` 1px + bóng đáy `#00000066`, hoặc đĩa đá xám `#9A9284`.

[còn] **V11. Tướng ở mép trái sát cửa quái ra** — cầu, bến đò, chia nhánh, cổng 3: tướng đứng x < 40px bị cắt nửa ở mép màn và đè lên quái vừa sinh. Đề xuất: không đặt ô trong 1 ô đầu bản đồ, hoặc thêm lề trái cho khung nhìn.

[đỡ — chân dung đổi pixel mới nhưng vẫn ~20px] **V12. Thẻ chợ triệu hồi** — chân dung chỉ ~20px, giá + icon vai trò chiếm phần lớn thẻ → khó nhận ra tướng. Đề xuất: chân dung 32px (844), giá dời xuống viền dưới thẻ 12px.

[còn] **V13. Chọn chế độ** — Ảnh: `design-review/che-do.jpg`. Chữ mô tả trắng chạy qua vùng cát sáng `#D8C08A` (667 khó đọc); thẻ "Cùng Giữ Thành" xám quá. Đề xuất: lớp tối phủ trái→phải đến 75% bề ngang `linear-gradient(90deg,#0E1A22F2 0 55%,#0E1A2200 80%)`; thẻ "Sắp ra mắt" giữ chữ `#C8BFA8`.

[còn] **V14. Kết quả trận vô tận** — Ảnh: `design-review/ket-qua.jpg`. Lập kỷ lục mới mà tiêu đề vẫn đỏ "Phong Châu thất thủ" + chip đỏ "Thành đã mất" lấn át "Kỷ lục mới!" nhỏ; nút "Chơi lại / Menu chính" mờ trong thời gian chặn. Đề xuất: khi có kỷ lục, tiêu đề vàng "Kỷ lục mới · Đợt 15", dòng phụ "Phong Châu thất thủ"; nút như V2.

[còn] **V15. Dọc 390×844** — game xoay 90°, không có lời nhắc; người chơi cầm dọc phải nghiêng đầu đọc chữ. Đề xuất: lớp phủ "Xoay ngang để chơi" (icon điện thoại pixel) khi dọc, hoặc giữ xoay nhưng hiện lời nhắc 2 s lần đầu.

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

## 4. Thứ tự nên sửa lỗi kỹ thuật (top 10) — làm song song với PHẦN A5
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
