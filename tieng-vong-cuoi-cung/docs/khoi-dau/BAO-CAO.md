# Báo cáo – Khởi đầu, đợt 1 (02/11/2026)

Làm theo tư vấn ChatGPT (`docs/khoi-dau/tu-van-chatgpt.txt`): **Sprint 1 + phần dễ của Sprint 2**. Không đụng Vùng 3.

## Luồng mới
```
Mở link → màn tiêu đề (ảnh ChatGPT)
  ├─ chưa có lưu:  NEW GAME → phim mở đầu (Skip từ tranh 1, không chiếu lại) → Làng, đứng cạnh Vesper
  │                 → "Drag to move" → đi được → "Find the Rootbound Bell" → rung chuông → "Weeping Heartwood — Enter"
  │                 → tối dần → màn tải → Vùng 1 phòng đầu (KHÔNG qua menu vùng) → tên vùng hiện mờ dần
  └─ có lưu:       CONTINUE ("Weeping Heartwood · Rest Bell · Saved 5 min ago") → đúng nơi an toàn cuối
                    (Làng, hoặc phòng Chuông Lưu cuối của vùng)
Hạ trùm Vùng 1 → cổng rễ P12 → màn tối → Vùng 2 R201 (không menu). Mọi màn chơi: nút Menu góc phải trên → tạm dừng.
```

## Đã làm
| Việc | % | Ghi chú |
|---|---|---|
| Màn tiêu đề thật (`game/index.html`) | 100% | Toạ độ theo mục 3, vùng an toàn thật; chưa lưu: NEW GAME + Options + Account; có lưu: CONTINUE + dòng trạng thái + NEW GAME. Đã bỏ: link Region 1/2, Demo Room (chỉ còn qua `?debug=1`), ô đăng nhập, nút xung đột, xuất/nhập, dòng phím. |
| NEW GAME khi đã có lưu | 100% | Hộp "Start a new journey?…" Cancel / Start New; sao lưu toàn bộ vào `tvcc-sao-luu-hanh-trinh` rồi mới xoá (chung + vùng 1 + vùng 2 + đồ/ẩn/trang bị). |
| Account (bảng phủ) | 100% | Đăng nhập/xuất Google (dùng DangNhap sẵn có), trạng thái chữ rõ (Guest · On-device save / Signed in · Synced / Offline · Saved on device / Action needed · Choose a save…), hộp "Two journeys were found" so sánh THIS DEVICE / CLOUD (thời gian, nơi, thời gian chơi, số trùm) → Use this device / Use cloud / Not now, sao lưu trước khi chọn. Tiêu đề chỉ hiện huy hiệu "Two saves found — Review", không chặn chơi. |
| Options (bảng phủ) | 100% | Master / Music / SFX + Mute (lưu máy, `tvcc-tuy-chon` – game chưa có âm thanh nên chưa nghe khác), SAVE DATA: Export / Import. |
| Xoay dọc | 100% | Màn "Rotate to Play" gọn, có "Play anyway" (không bế tắc). |
| Bỏ menu riêng của vùng | 100% | Vùng 1/2 nhận `?tiep=1 ?moi=1 ?tu_lang=1 ?tu_vung=…` → màn tải → vào thẳng. Mở trang vùng trơn → về tiêu đề. Menu cũ chỉ còn cho phép thử (`?tu=1`, `?debug=1`). Lỗi tải → "Couldn't load this area. Retry / Return to Title". |
| Một hành trình | 100% | `LuuChung.noiCuoi` (nơi an toàn cuối) + `capNhat` (giờ ghi); `game/hanh-trinh.js` đọc các khoá cũ. Không thêm khoá lưu mây mới. |
| Làng | 100% | Bỏ chữ "waiting for art" (màn tải thay thế), gợi ý một dòng, bảng teleport: không Skip, "Rotting Roots — Defeat the Hollow Bell Mother" hiện mờ; bỏ mục "Watch The First Silence". Nút Skip/Talk đổi sang ảnh nút ChatGPT (trước là viền CSS). |
| Menu tạm dừng chung | 100% | Vùng 1, Vùng 2, Làng: Resume / Map / Journal / Lattice / Options / Return to Title (có xác nhận). Game dừng thật (cả khi khoá màn/chuyển app). Journal/Lattice mờ khi tính năng đang tắt; Làng không có Map. Chuông Lưu giữ menu riêng. |
| Không chữ phím trên cảm ứng | 100% | Mọi trang; cả chữ vẽ trên màn ("↑ Rest…", "M / Map…") và dòng "Keys:" ở Chuông Lưu. |

## Ảnh
- **Đã lắp (đợt 1 về đủ):** tieu-de-nen, logo, nut-chinh-thuong/nhan/tat, nut-phu-thuong/nhan/tat, bang-lon, bang-vua, tai-chuong, tai-nen (`art/khoi-dau/`). Nút "Rest at Bell" của vùng cũng đổi sang nút phụ.
- **Còn chờ:** A19 biểu tượng tạm dừng – code đã dò sẵn `art/khoi-dau/nut-tam-dung.png` (dải 176×88, 2 trạng thái); chưa có thì là nút phụ chữ "Menu". A17 khung tên vùng (hiện chỉ chữ). A11 hình xoay máy, A32 ngón tay hướng dẫn, A36–A38 thanh trượt/công tắc (đang dùng thanh trượt mặc định của trình duyệt).

## Kết quả kiểm (844×390, cảm ứng)
- **Mới** `tools/khoi-dau/kiem-thu-luong.js`: **38/38 đạt** (A khách mới, B màn dọc, C không chiếu lại mở đầu, D Continue đúng Chuông Lưu, E cổng P12→R201 + teleport có Rotting Roots, H lỗi tải, K không chữ phím, L New Game xác nhận + sao lưu, N tạm dừng thật). Ảnh chụp để ngoài repo, đã tự xem.
- Phép thử cũ: kiem-thu-f / g / h, vung-2 dat-muc, firebase luu-may, he-thong ×2, an ×3, kiem-tra-trinh-duyet (cốt truyện): đạt như trước.
- Sửa cho khớp luồng mới (không nới điều kiện khác): `tools/firebase/kiem-tra-dang-nhap.js` (ô đăng nhập giờ nằm trong Account) **28/28**; `tools/cot-truyen/kiem-tra-lang.js` (bảng đích mới) **đạt hết**.
- Hỏng sẵn từ trước, không liên quan: kiem-thu-luu-chung (2 mục về the-gioi.json), firebase/kiem-tra-trinh-duyet (2 mục chữ trạng thái mây), kiem-tra-vung1 + game/tools (lỗi mạng tải phông `net::ERR_` trong máy kiểm).

## Chưa làm / để đợt sau
- Dạy nhảy/đánh ở phòng đầu Vùng 1, "Progress saved" nhỏ, nút cảm ứng theo bố cục mới (cần ảnh đợt 2).
- `tvcc-vung2` vẫn chưa đồng bộ mây (cần thêm vào KHOA_CHO_PHEP + firestore.rules cùng lúc – chưa làm để tránh lỗi nếu quy tắc chưa kịp cập nhật).
