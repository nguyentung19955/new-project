# Rễ Mục – asset từ 5 ảnh gen (27/10/2026)

Ghi chú đầy đủ (đã làm gì, số gameplay, bộ nhớ, chưa đẹp, prompt gen, cách ghép): **`game/thu-re-muc/GHI-CHU.md`**.
Ảnh duyệt cảnh thật (960×540, bản xám, collider, video): `game/thu-re-muc/xem-thu/`. Bảng mọi ô gạch có tên: `xem-thu/bang-o-gach.png`;
`xem-thu/canh-960.png` + `canh-xam.png` = chép từ ảnh duyệt màn thử.

Chạy lại tất cả: `cd art/re-muc/code && python3 -B chay_het.py` (Pillow, numpy, scipy; ≈ 25 s). Code dùng lại hàm Làng Chuông
(`art/the-gioi-moi/lang-chuong/code/`), tên file có đuôi `_rm` để không trùng.

| Thư mục | Nội dung | Code |
|---|---|---|
| `nen/` | `re-muc-xa.png` 1773×1178 (0,08, đục, phóng 9 % cho cuộn dọc) · `re-muc-giua.png` 1559×1080 (0,40, trong suốt) · `re-muc-gan.png` 1619×880 (0,65, trong suốt, **lặp dọc liền**) · `nen.json` | `nen_rm.py` |
| `gach/` | `rm-atlas.png` 1024×264 + `rm-atlas.json` + `o/` 59 ô: thân ×8 (gen, liền mạch), mặt trên mép mục ×4 (không rêu), tường / đáy / góc / cột / gờ / khối / góc trong, ván mục ×5, dốc ×6, **tường mục TẠM** lành / nứt / nứt-2 + 4 mảnh | `gach_rm.py` |
| `do-vat/` | 15 PNG (tỷ lệ chung 0,42) + `do-vat.json`: nấm nhỏ / lớn, gốc rễ, kén, chuông vỡ, bào tử kín / nổ + 3 bong bóng, giọt ×3, vũng bắn / lặng | `do_vat_rm.py` |
| `trang-tri/` | `re-muc-tt.png` 1024×372 + `re-muc-tt.json` (dạng cong-lang-v3): mảng rễ ×4 (che vân lặp), chân rễ góc ×2 | `trang_tri_rm.py` |
| `nguon/` | 5 ảnh gen + `GHI-CHU-NGUON.md` (chủ dự án) | |

Độ sáng trung bình nền sau xử lý: xa 34 / giữa 28 / gần 19 (Làng Chuông 42 / 40 / 26; Lam ≈ 62). Kiểm nối mép ngang: xa 0,86, giữa 0,67
(≈ 1 là không thấy); gần lặp dọc 0,81. Kiểm nối 8 ô thân: 0,54–0,68 (không thấy nối).
