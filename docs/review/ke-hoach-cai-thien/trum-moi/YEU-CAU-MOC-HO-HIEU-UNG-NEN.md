# Đưa Mộc Tinh + Hồ Tinh mới, 9 hiệu ứng chiêu trùm, sửa phân thân, nền Hang biển + Lâu đài vào game (14/10 00:10)

Đọc trước: `bao-cao-ngu-tinh.md` (cùng thư mục) và dùng lại công cụ `cong-cu/dung-ngu-tinh.py`, `cong-cu/neo.py` (cách co cỡ theo đầu/thân từng hàng, đường đất, nhịp tele/atk).

## 1. Mộc Tinh + Hồ Tinh mới (giống hệt cách đã làm Ngư Tinh)
Khung đã cắt sẵn (PNG trong suốt):
- `docs/anh-goc/trum-moi/moc-tinh/` : pha 1 `1-dung`…`6-chet`, pha 2 `p2-1-dung`…`p2-4-trung-don`, pha 3 `p3-1-dung`…`p3-4-trung-don` (mỗi hàng ở `<ten>-cat/<ten>/khung-NN.png`).
- `docs/anh-goc/trum-moi/ho-tinh/` : cùng cấu trúc, đủ 3 pha.
- Ảnh mẫu cả con: `docs/anh-goc/trum-moi/moc-tinh-p1..3.png`, `ho-tinh-p1..3.png`.
Thay `game/art/custom/mocTinh*.sprite.json`, `hoTinh*.sprite.json`. Co từng hàng cho đầu/thân cùng cỡ giữa mọi hàng và pha, chân cùng đường đất, cỡ đứng ≈ con cũ; giữ `rong`/`cao`/hộp va chạm. Ghép khung "chạm/nện/cào" đúng mốc gây sát thương như Ngư Tinh. Không đổi số cân bằng.
Lưu ý: Mộc Tinh pha 2 hàng đứng đỏ rực hơn các hàng khác — chấp nhận.

## 2. Sửa phân thân Hồ Tinh pha 2 (đang VÔ HÌNH)
`monster_art.js` ~dòng 2061 (`bongMa`): bóng ma vẽ bằng cách cũ không chạy với ảnh AI nên bản sao không hiện. Sửa: vẽ chính sprite Hồ Tinh hiện tại (đúng khung động tác) với độ trong ~0,5 và nhuộm tím hồng, cho người chơi nhận ra là bản sao. Không gen ảnh mới.

## 3. 9 hiệu ứng chiêu trùm (thay phần vẽ code, CẦN THÊM MÓC CODE)
Khung đã cắt: `docs/anh-goc/trum-moi/hieu-ung/<ma>-cat/<ma>/khung-NN.png`. Tạo `game/art/custom/<ma>.sprite.json` và móc vào đúng chỗ (giữ bản vẽ code làm dự phòng khi thiếu ảnh):
| Mã | Khung | Thay chỗ |
|---|---|---|
| hu-song-than | 6 lặp | Ngư Tinh tường sóng thần (`mobs.js drawWall`, `monster_art ngutinh c2`) |
| hu-bang-nhon-roi | 6 | Ngư Tinh băng nhọn rơi (c4), cột băng pha 3 |
| hu-xoay-nuoc | 8 lặp | Ngư Tinh xoáy nước (c5) |
| hu-phun-bang | 6 | Ngư Tinh phun băng hình nón (c3), xoay theo hướng phun |
| hu-gai-re | 6 | Mộc Tinh rễ gai (c2, vòng c5) |
| hu-qua-doc-roi | 5 | Mộc Tinh quả độc rơi (c3) |
| hu-la-chem | 5 | Mộc Tinh lá chém (c1), xoay theo hướng |
| hu-cau-lua-ma | 4 lặp | Hồ Tinh cầu lửa ma (c1, c5) |
| hu-doi-pha | 8 | Chung 3 trùm lúc đổi pha (`TRUM.doiPha`); ảnh trắng-vàng, nhuộm theo trùm |
Cỡ hiệu ứng khớp vùng gây sát thương hiện có (không đổi vùng/sát thương/thời gian). Cờ tắt chung `?hutrum=0`.

## 4. Nền phòng Hang biển + Lâu đài cổ (CẦN THÊM MÓC CODE)
Ảnh: `docs/anh-goc/nen-phong/lau-dai-9-mang.png`, `hang-bien-9-mang.png` (lưới 3×3, nền hồng tím #FF00FF, thứ tự ô giống bộ Rừng: san0, san1, san2, san-nhan, ngoai, tuong-sau, tuong-truoc, mep, tuong-ben — xem `docs/review/ke-hoach-cai-thien/dot-6/PROMPT.md` và `dot-6-tile-rung.md` để biết cỡ 64×64 / 64×49 / 64×12 / 14×64 và cách bộ Rừng được cắt).
- Hang biển: 4 ô sàn trong tấm 9 mảng có viền đá ở mép → KHÔNG dùng; sàn lấy từ `hang-bien-san-lien.png` (một tấm lớn, KHÔNG lặp 3×3 thật) — cắt 3 vùng khác nhau làm san0/1/2 và làm liền mép (trộn mép / offset) để lát không lộ đường nối; san-nhan có thể lấy ô 4 (vũng nước + san hô) sau khi cắt bỏ viền đá, hoặc bỏ qua.
- Tạo `gd-nen-bien-*`, `gd-nen-lau-*` cùng tên đuôi như `gd-nen-rung-*`, và mở rộng `room_art.js` (`TR_CO`/`tileRung` hoặc tương đương) để Cave/Castle dùng tile ảnh khi có, giữ bản code làm dự phòng. Cờ `?nentile=0` tắt.
- Thảm `gd-tt-lau-tham-*` giữ nguyên.

## Kiểm
**Được chạy game CHỈ để chụp ảnh soát** (chủ dự án đã cho phép kiểm bằng ảnh khi đưa trùm vào): chụp 1 phòng Hang biển, 1 phòng Lâu đài, mỗi trùm 3 pha + vài chiêu. Không chạy bài kiểm khác. Ảnh soát: `xem-moc-ho.png`, `xem-hieu-ung-trum.png`, `xem-nen.png` trong thư mục này.
Ràng buộc: KHÔNG đụng master, KHÔNG force push, KHÔNG PR. Không chép apiKey trong game/js/firebase-config.js. Không làm hỏng đăng nhập Google, lưu mây, `?cloud=0`. Xung đột game/dist khi rebase: lấy bản trên nhánh rồi build lại. `python3 game/build.py` (timeout dài). Push bị từ chối thì pull --rebase rồi push lại.
Viết `bao-cao-moc-ho-hieu-ung-nen.md` (tiếng Việt, ngắn, có mã commit).
Commit kết thúc bằng:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_017N7QXqfkK27mirk6Hvvt7g
