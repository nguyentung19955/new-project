# Icon nhỏ (v159)

Mọi icon nhỏ trong các bảng (chỉ số, trạng thái, tiền tệ, ngũ hành…) đi qua **một hàm dùng chung** `ic(tên, alt)` trong `js/ui.js`:

1. có ảnh `assets/ui/ic-<tên>.png` (hoặc ảnh cũ ghi trong `IC_ALT`) → `<img class="icn">`;
2. chưa có → **SVG nội tuyến** `IC_SVG[tên]` (không dùng emoji: điện thoại thiếu font hiện ô vuông "□", như `🪙` ở thanh máu boss trước v159).

Ảnh icon luôn được dùng khi có (giống nút giao diện `ui-tran-…`), không phụ thuộc cài đặt "Dùng ảnh AI". Ảnh được tải trước khi mở game (`icPreload`).
Ngũ hành dùng `elIcon(hành)`: `ui/ic-hanh-<hành>.png` → `hanh_<hành>.png` (chỉ khi bật ảnh AI) → SVG.

**Tạo ảnh:** prompt ở `docs/PROMPT_GEMINI_FULL.txt` nhóm **14. Icon nhỏ** (9 tấm, mỗi tấm 4–5 ô 128 px).
**Cắt:** `python3 tools/cat-items.py <ảnh> <mã tấm>` → `assets/ui/ic-<tên>.png` cỡ 64 px (`"size": 64` trong `tools/item-sheets.json`; ghi đè cỡ: thêm số px ở cuối lệnh).
Cắt xong tấm nào thì prompt tấm đó tự ẩn khi chạy lại `node tools/build-prompts.js`.

## Bảng kê

| Tên (`ic('…')`) | Tấm prompt | Chỗ dùng | Trước v159 vẽ bằng | Mô tả ảnh |
|---|---|---|---|---|
| giap | ic-chi-so-1 | thanh máu boss, thẻ quái/boss bách khoa | 🛡 emoji / chữ trơn | khiên đồng |
| khang-phep | ic-chi-so-1 | thanh máu boss, bách khoa | 🔮 emoji / chữ trơn | quả cầu tím trong vòng đồng |
| toc-chay | ic-chi-so-1 | thanh máu boss | 👣 emoji | dép cỏ + vệt tốc độ |
| toc-danh | ic-chi-so-1 | bảng chỉ số tướng | chữ trơn | tia sét vàng |
| sat-thuong | ic-chi-so-1 | bảng chỉ số tướng | chữ trơn | kiếm đồng ngắn |
| mau | ic-chi-so-2 | bảng chỉ số tướng, bách khoa | chữ trơn | giọt máu đỏ |
| chi-mang | ic-chi-so-2 | bảng chỉ số tướng | chữ trơn | tia nổ đỏ cam |
| tam-danh | ic-chi-so-2 | bảng chỉ số tướng | chữ trơn | bia tròn + mũi tên |
| hoi-chieu | ic-chi-so-2 | bảng chỉ số tướng | chữ trơn | đồng hồ cát |
| nang-luong | ic-chi-so-2 | bảng chỉ số tướng | chữ trơn | giọt nước xanh lam |
| suc-manh | ic-chi-so-3 | bảng chỉ số tướng (Sức mạnh) | chữ trơn | nắm đấm cam |
| nhanh-nhen | ic-chi-so-3 | bảng chỉ số tướng (Nhanh nhẹn) | chữ trơn | lông chim Lạc xanh |
| tri-tue | ic-chi-so-3 | bảng chỉ số tướng (Trí tuệ) | chữ trơn | sách tre mở |
| giam-sat-thuong | ic-chi-so-3 | bảng chỉ số tướng | chữ trơn | khiên + mũi tên xuống |
| xuyen-giap | ic-chi-so-3 | chip xuyên giáp ở Cây kỹ năng | ⚔ | mũi giáo phá khiên |
| cham | ic-trang-thai-1 | thanh máu boss (Chậm) | chữ trơn | ốc sên |
| choang | ic-trang-thai-1 | thanh máu boss (Choáng) | chữ trơn | vòng sao vàng |
| dot | ic-trang-thai-1 | thanh máu boss (Thiêu đốt) | chữ trơn | ngọn lửa |
| doc | ic-trang-thai-1 | (dự phòng — chưa có trạng thái độc riêng) | — | giọt độc xanh |
| dong-bang | ic-trang-thai-1 | thanh máu boss (Đóng băng) | chữ trơn | bông tuyết băng |
| sa-lay | ic-trang-thai-2 | (dự phòng — tướng sa lầy) | — | vũng bùn |
| khien | ic-trang-thai-2 | (dự phòng — khiên) | — | bong bóng xanh |
| hoi-mau | ic-trang-thai-2 | (dự phòng — hồi máu) | — | dấu cộng xanh |
| noi-gian | ic-trang-thai-2 | thanh máu boss (Đang hóa điên) | chữ trơn | dấu gân giận đỏ |
| bay | ic-trang-thai-2 | thanh máu boss (nhãn Bay) | chữ trơn | cánh trắng |
| boss | ic-trang-thai-3 | nhãn BOSS / Tướng địch, danh sách quái từng chương | chữ trơn, 👑 | vương miện quỷ đỏ |
| cam-lang | ic-trang-thai-3 | thanh máu boss (Câm lặng) | chữ trơn | bóng thoại gạch chéo |
| tinh-anh | ic-trang-thai-3 | thanh máu boss (nhãn Tinh anh) | chữ trơn | ngọc tím |
| lan | ic-trang-thai-3 | (dự phòng — boss đang lặn) | — | sóng nước |
| tui-vang | ic-tien-te | thanh máu boss (vàng rơi), bách khoa, thẻ Lương thảo trước trận | 🪙 (ô vuông!) / 🌾 | túi vải + đồng vàng |
| diem-ky-nang | ic-tien-te | bảng chỉ số tướng (Điểm đã cộng) | chữ trơn | sao vàng trên đĩa đồng |
| diem-an-phu | ic-tien-te | (dự phòng — điểm Ấn Phù) | — | ấn đá có mặt trời |
| luc-chien | ic-tien-te | bảng chỉ số tướng (lực chiến) | chữ trơn | hai kiếm đồng bắt chéo |
| cap-do | ic-tien-te | (dự phòng — lên cấp) | — | hai mũi tên lên |
| kho | ic-khac | thanh đợt (· Khó), nút Khó ở chọn ải | 🔥 | đầu lâu mắt đỏ |
| nuoc-dang | ic-khac | cảnh báo đợt "Nước sắp dâng", Sính lễ/cảnh báo ngập, bảng thua | 💧 | sóng + mũi tên lên (dự phòng `ui_muc-nuoc.png`) |
| khac-che | ic-khac | (dự phòng — khắc chế hành) | — | mũi tên trúng tia sáng |
| nang-cap | ic-khac | (dự phòng — nâng cấp) | — | mũi tên lên xanh |
| xuyen-phep | ic-khac | chip xuyên kháng phép ở Cây kỹ năng | ✦ | mũi giáo tím |
| hanh-kim/moc/thuy/hoa/tho | ic-ngu-hanh | mọi `elIcon` (thanh máu boss, bách khoa, thẻ tướng…) | SVG / `hanh_hoa.png`, `hanh_moc.png` (chỉ 2 hành, chỉ khi bật ảnh AI) | 5 đĩa tròn: rìu bạc · lá · sóng · lửa · núi |
| vang | (có sẵn) | tab Cửa hàng | 🪙 (ô vuông!) | `ui_dong-xu.png` → `ui/ui-tai-nguyen-1.png` |
| mang | (có sẵn) | bảng kết quả, Sính lễ kho lúa, Đắp thành, Mạng thành, bách khoa boss | ♥ / 🧱 | `ui_mang.png` → `ui/ui-tai-nguyen-2.png` |
| bac | (có sẵn) | bảng kết quả (Ngân khố nhận) | 🏦 | `ui/ui-tai-nguyen-3.png` |
| tu-vi | (có sẵn) | bảng kết quả, thông báo lên Tu Vi, Ấn Phù, Anh Hùng | ☯ | `ui/ui-tai-nguyen-4.png` |
| hu-bau | (có sẵn) | tab Hũ báu, thẻ Hũ đồng trước trận | 🏺 | `ui_hu-bau.png` |

## Còn lại (chưa thay, để session khác / lượt sau)

- Nút & huy chương đang gắn ảnh ở nhánh `claude/gan-anh-dot-0710` (ui-tran-4/5, ui-huy-chuong): ★ ghép sao, 🔒 khóa, ↻ đổi hàng, 💡 mẹo, ♾ vô tận, ⚔ vào trận, ✓ xong, 🥇🥈🥉.
- Ngăn kéo menu ≡ (`index.html`: 🎒👑🔯📖⏸✉🏳), nút tự động (⬆ 🛡), thanh thao tác trên tướng (✦ ⇄ ▲ 🛡 ✸ 🗑) — đã có/đang có ảnh nút `ui-tran-…`, `ui-menu-…`.
- Ký hiệu dự phòng của Ấn Phù / Thần Khí trong `js/data.js` (🪨🪙🩸🪤🪝🪽🪷🪓…) chỉ hiện khi thiếu ảnh `assets/runes/*.png`, `packs/*/tk-*.png`.
- Canvas (`js/render.js`) không vẽ icon bằng chữ, trừ nốt nhạc ♪ (có trong font thường).
- Độ hiếm hiện bằng màu viền/chữ (không có icon riêng).
