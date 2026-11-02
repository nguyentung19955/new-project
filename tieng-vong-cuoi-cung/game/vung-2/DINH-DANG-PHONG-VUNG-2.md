# Định dạng phòng – Vùng 2 "Rotting Roots"

Giống hệt Vùng 1 (`game/vung-1/DINH-DANG-PHONG.md`: `luoi`, `cua`, `quai`, `vat_pham`, `chuong_luu`, `den`, `dau_hieu`, `trang_tri`…), **thêm**:

## Ký tự lưới mới
| Ký tự | Ý nghĩa (kế hoạch ChatGPT docs/vung-2/ke-hoach-chatgpt.txt mục 3) | Va chạm |
|---|---|---|
| `R` | Gỗ Mục thường: chân chạm mặt trên → cảnh báo 120 khung (nứt ở khung 0/40/80, cọt kẹt 0/80, bụi 105) → rơi 12 khung (còn va chạm 4 khung đầu) → mất 180 → mọc 18 (va chạm lại ở khung cuối; người đứng trong thì hoãn). Cụm liền nhau cùng hàng chung 1 đồng hồ. | đặc khi chắc |
| `Q` | Gỗ Mục nhanh (từ R208): cảnh báo 72, mất 210 | như trên |
| `P` | Gỗ Mục xung (từ R206): như thường + chu kỳ xung 240 khung (ngủ 150, xung 30, hồi 60) – mỗi chu kỳ tăng tốc cụm đã kích hoạt 30 khung | như trên |
| `X` | Gai rễ: chạm mất 1 mặt nạ, bất tử 60 khung, về gờ chắc gần nhất | đặc, không đứng được |
| `B` | Ao bào tử: như gai | đặc, không đứng được |
| `L` | Chốt rễ: Neo Rễ giữ mở 180 khung | đặc khi đóng |
| `C` | Cổng rễ đan (lối tắt / niêm sau trùm), xem `cong` | đặc khi đóng |

Logic các ô này: `game/vung-2/dat-muc.js` (không vẽ gì; phép thử `node tools/vung-2/kiem-thu-dat-muc.js`).

## Trường mới
- `neo`: `[{"id","cot","hang","cum":[[c,r],…]}]` – nút Neo Rễ (ảnh yêu cầu 014). `cum` ≤ 4 ô gỗ mục/chốt rễ mà nút này giữ. Kỹ năng nhắm nút gần nhất trong 144 px theo hướng nhìn, cần đường ngắm; không có nút → nút kỹ năng xám, không tốn hồi chiêu. Thời gian 180, hồi chiêu 360 (tính từ lúc đặt), 1 neo cùng lúc.
- `cong`: `[{"id","loai":"re_dan","o":[[c,r],…],"mo_tu":"trai|phai|tren|duoi|trum"}]` – cổng tự nhiên (ảnh 016–018), mở 1 lần từ phía `mo_tu` rồi giữ mở (lưu vào bản lưu); `trum` = mở khi hạ trùm.
- `ky_nang`: `{"id":"neo_re","cot","hang"}` – chỗ nhận kỹ năng (Đền Neo Rễ, R206).
- `trum_o`: chỗ trùm xuất hiện (R213).
- `vat_pham.loai` thêm: `manh_ky_uc` (Memory Shard, dùng chung art/an/manh-ky-uc), `manh_hoi` (mảnh tăng sức chứa hồi máu, 1/3), `bua_neo_re` (bùa –10% hồi chiêu Neo Rễ), `nut_warden` (Warden Knot – lore).

## Quái
`game/vung-2/quai.json`: `gnawer`, `spore_bell`, `husk_leaper`, `root_siphon`, tinh anh `warden`. Trùm `game/vung-2/trum.json` (Mold Mother). Tất cả `"bat": false` cho tới khi có ảnh.

## Kiểm tra
`python3 game/vung-2/cong-cu-man/dung-phong.py` rồi `python3 game/vung-2/cong-cu-man/kiem-tra.py` (dùng lại máy mô phỏng hộp của Vùng 1, ~3 phút). Ảnh xem trước ra `cong-cu-man/xem/` (không đưa vào repo).
