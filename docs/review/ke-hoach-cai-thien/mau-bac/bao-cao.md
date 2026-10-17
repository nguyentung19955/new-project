# Đổi thứ tự màu bậc: Trắng → Xanh lục → Xanh lam → Tím → Vàng → Đỏ → Rực lửa (17/10)

Chủ game góp ý: thứ tự quen thuộc là xanh **lục** trước, xanh **lam** sau. Trước đây game để ngược (bậc 1 Lam, bậc 2 Lục).

## Đã đổi gì

| Bậc (số trong bản lưu) | Trước | Bây giờ |
|---|---|---|
| 0 | Trắng | Trắng |
| 1 (Luyện cấp 3–5) | Xanh lam | **Xanh lục** |
| 2 (Luyện cấp 6–8) | Xanh lục | **Xanh lam** |
| 3–6 | Tím, Vàng, Đỏ, Rực lửa | giữ nguyên |

- Tên bậc (tiếng Việt + tiếng Anh), mã màu, **ảnh khung ô** (bậc 1 nay dùng khung lá xanh lục, bậc 2 dùng khung pha lê xanh lam), số nhỏ ở góc ô, chữ màu tên vũ khí ở Lò rèn / Ép đồ / Luyện / Hành trang / ô vũ khí trong ải, viền nhuộm vũ khí (đang tắt sẵn, nếu bật cũng theo màu mới).
- Câu gợi ý trong Sổ ("Khung ô đổi màu theo cấp…", "Vũ khí có bảy bậc ép đồ…") kể đúng thứ tự mới, cả tiếng Anh.
- **Chỉ đổi màu và tên hiển thị.** Số bậc trong bản lưu, sức mạnh theo bậc (×1 / ×1,08 / ×1,17 …), giá, tỉ lệ: không đổi một con số nào. Bản lưu cũ và lưu mây không bị ảnh hưởng.
- Đồ rơi trên sàn: hiện chỉ rơi mảnh trùm và nguyên liệu, không có màu bậc ép đồ → không có gì phải đổi.

## Quay lui

Thêm `?maucu=1` vào địa chỉ trang → hiện lại thứ tự cũ (bậc 1 Lam, bậc 2 Lục), kể cả câu gợi ý.

## Kiểm tra

- `node --check` các tệp đã sửa: không lỗi. Build một tệp 29,86 MB (dưới 30 MB); build `--hai-tep`: trang chính nén 1,35 MB.
- Mở game không giao diện (không chơi thử): 0 lỗi JS ở cả hai chế độ (mới và `?maucu=1`), cả giao diện cũ `?luyen=0`.
- Bài kiểm tra Luyện (88 điều kiện) và lưu mây / đăng nhập Google: đều qua.

## Ảnh TRƯỚC / SAU (thư mục `anh/`; "trước" chụp bằng `?maucu=1`)

- Bảng Luyện cấp 1→15 và bậc 0→6: `truoc-bang-cap-1-15.jpg` / `sau-bang-cap-1-15.jpg`
- Lò rèn › Luyện: `*-ren-luyen-cap4.jpg`, `*-ren-luyen-cap7.jpg`
- Túi đồ (Hành trang › Vũ khí): `*-tui-do-vu-khi.jpg`
- Ô vũ khí trong ải (phóng to): `*-hud-trong-ai-cap5-phong-to.jpg`, `*-hud-trong-ai-cap8-phong-to.jpg`
- Lò rèn › Ép đồ (giao diện cũ `?luyen=0`): `*-ep-do-luyen0.jpg`

## Chỗ sửa (cho người làm kỹ thuật)

`game/js/data.js` (G.EP_DO.ten / mau đổi chỗ 1↔2, thêm G.EP_DO.anh = bảng số ảnh khung, cờ G.MAU_CU), `game/js/ep_do.js` (ảnh gd-o-ep theo G.EP_DO.anh), `game/js/luyen_ui.js`, `game/js/ngon_ngu_en.js` + `tools/ngon-ngu/tu-dien/zed.json` (câu gợi ý), chú thích `game/js/vien_vk.js`, nhãn trong `game/tests/luyen.test.js`. Tệp ảnh gd-o-ep-1/2 giữ nguyên, chỉ đổi bậc nào dùng ảnh nào.
