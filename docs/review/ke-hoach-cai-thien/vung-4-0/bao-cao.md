# Bước 3 · vùng 4 Sông sâu — Phiên 0: báo cáo

Ngày 15/10/2026 · nhánh `khoi-tao-du-an`. Làm theo `docs/ke-hoach/buoc-3/KE-HOACH.md` (mục 4B, mục 5 hàng "0", mục 8.4) và `QUYET-DINH.md`.
**Không sửa `game/`** (Phiên 1 đang làm khung vùng 4 song song). Không chơi thử game. Dung lượng người chơi tải: **không đổi** (phiên này không có tệp nào vào game).

## 1. Khung que mới: `ran`, `ran3`, `vo2`

- Script `docs/anh-goc/quai-moi/que/que5.py` (chép kiểu `que4.py`: ô 300×230, cách 40, vạch đất y=150, nét đen trên nền trắng, nét đỏ là hiệu ứng).
  Chạy: `cd docs/anh-goc/quai-moi/que && python3 que5.py .` → 18 tấm `ran-*`, `ran3-*`, `vo2-*` (`1-dung` … `6-chet`; tấm 6 khung 2080×320, tấm `5-trung-don` 4 khung 1400×320).
- Thêm so với `que4.py`: script **tự soát** sau khi vẽ — khe giữa các ô phải trắng và hình không chạm mép trên/dưới ô; tràn là dừng và báo tấm nào, khung nào.
- Động tác đúng như mục 4B:
  - `ran` (Rắn Nước): đứng = cuộn 2 vòng, cổ ngóc, lè lưỡi ở khung 3 · đi = uốn chữ S trôi pha · báo đòn = rụt đầu, S chặt dần, 3 vạch đỏ trên đầu · đánh = phóng thân thẳng, lưỡi + vạch đỏ ở mõm · trúng = thân gập vồng lên, mắt X · chết = duỗi thẳng, mờ dần.
  - `ran3` (Bầy Đỉa Trâu): 3 con `ran` nhỏ xếp so le (sau to dần ra trước); đánh = con dẫn đầu lao xa nhất; trúng = cả bầy tản ra; chết = 3 con nằm thẳng mờ dần.
  - `vo2` (Trai Sông Gai): khép (mắt nhìn ra từ khe, chớp mắt) · lết chân thịt · há rộng dần, ngọc to dần, tia đỏ quanh ngọc · bật mở bắn 5 chấm đỏ hình quạt (có vệt đỏ nối ngọc → chấm) · khép chặt rung · vỡ vỏ hai mảnh, mảnh vụn, mờ dần.
- Ảnh soát: `soat-khung-que.png` (18 tấm xếp chồng, thu ½: ran trên, ran3 giữa, vo2 dưới).

## 2. Ảnh mẫu từ game: `docs/anh-goc/vung-4/mau/`

Script `xuat-mau.py` (chạy từ gốc repo) đọc `game/art/custom/*.sprite.json`, ghép **không chữ** (ChatGPT hay chép chữ), thứ tự ghi trong `THU-TU.md`:

| Tệp | Nội dung | Nền, phóng |
|---|---|---|
| `cua-bien.png` 1800×352 | 6 cửa Hang biển: trên, trên-khoá, dưới, dưới-khoá, bên, bên-khoá — chân cửa trên một đường đáy | hồng `#FF00FF`, ×4 |
| `icon-manh.png` 1236×264 | `vp-shard0..2` rồi `vp-mat0..2` | xanh `#00FF00`, ×6 |
| `hieu-ung.png` 1600×671 | 3 hàng đủ khung: `hu-vung-quai-bang`, `hu-cot-nuoc`, `hu-manh-san-ho` (mỗi hiệu ứng cắt theo khung bao chung để giữ chuyển động, phóng ×2…×8 cho cao ~220) | xanh `#00FF00` |

## 3. Thêm vùng `song` vào 4 trang công cụ

Nguyên tắc chung: **mục mới đặt ở CUỐI danh sách** để số thứ tự đã lưu trong máy người dùng (`tq_quai`, `tph_lo`, `thu_hu`) của mục cũ không đổi
(đã kiểm bằng máy: danh sách cũ của cả 3 trang là tiền tố y hệt danh sách mới). Prompt và tệp xuất của mục cũ không đổi.

- **`tools/tach-quai`**: 12 con vùng 4 (`raiCa`, `diaTrau`, `baBa`, `cocTia`, `ranNuoc`, `echPhinh`, `maDa`, `traiGai`, `raiCaChua`, `cocChua`, `caTre`, `thuongLuong`),
  `vung: 'song'`, nền vẽ theo màu thân (con tím / có ngọc hồng: nền xanh; con xanh lá / nâu: nền hồng), cỡ ô là **số xuất phát** chép từ con cũ cùng dáng.
  Thêm 3 mục dáng pha: `caTre-p2` (nổi giận), `thuongLuong-p2` (hệ Băng), `thuongLuong-p3` (hệ Lửa) theo Q1 = A. Bảng màu prompt của vùng: nước, cỏ cây, gỗ.
  Nút "Tải ảnh tham chiếu pha 1" nhận thêm `caTre`, `thuongLuong` (khi game có tấm pha 1); chưa có thì báo gửi kèm ảnh pha 1 trong `docs/anh-goc/trum-moi/`.
- **`tools/tach-phong`**: lô **Cửa · Sông sâu · 6 hình** (`gd-cua-song-<tren|duoi|ben>[-khoa]`: cổng tre, mành sậy; khoá bằng khúc gỗ ướt buộc thừng — không vẽ ổ khoá, game tự vẽ)
  và lô **Trang trí · Sông sâu · 16 hình** (`gd-tt-song-*`: chum sành, bó sậy, đá rêu, gỗ trôi, thuyền úp, thuyền thúng, lá sen, cọc tre, lưới phơi, bia đá, đèn đá, miếu, góc nhà sàn, 2 tiền cảnh).
  Lô gộp "Cửa · GỘP cả 3 vùng" **giữ nguyên 3 vùng cũ** (`CUA_GOP`). Bước 4 "xem thử trong phòng": game chưa có phòng vùng 4 nên trang **báo rõ**
  "game chưa có phòng vùng Sông sâu…" thay vì vẽ nhầm phòng Lâu đài (game hiện lấy `THEMES[3] || Castle`). Khi phiên 1/2B thêm theme thứ 4, xem thử tự chạy.
  **Chưa thêm lô Nền phòng 9 mảng** cho Sông sâu: prompt lô nền hiện viết riêng cho Rừng già (`promptNen`), còn KE-HOACH D1 cắt bằng `cat-nen-bien-lau.py` — để phiên 2B chọn.
- **`tools/tach-hieu-ung`**: 8 hiệu ứng quái vùng 4 (E1–E8: `hu-bot-doc`, `hu-gon-nuoc`, `hu-no-nuoc`, `hu-xoay-nuoc`, `hu-dan-ngoc`, `hu-dia-bam`, `hu-luoi-chai`, `hu-bun-phun`)
  có `vung: 'song'`; tệp xuất ghi `"vung": "song"` (khoá này đã có trong `HU_KEYS` của `game/build.py`, game tải theo vùng). 2 lô gộp: `v4-6-hong` (bọt độc, gợn nước, nổ nước lạnh)
  và `v4-6-xanh` (lưới chài, bùn phụt). Nền vẽ chọn theo màu hình như luật của trang (KE-HOACH ghi chung "nền xanh"; ở đây bọt độc, nước, đỉa dùng nền hồng vì gần màu xanh lá).
  Hiệu ứng trùm E9–E13 vẫn theo `dung-hieu-ung-trum.py` như trùm cũ. Cỡ / số khung / giây là số xuất phát, phiên 2A chỉnh khi gắn.
- **`tools/xuong-sprite`**: `nguon/giao-dien.js` thêm `song: 'Sông sâu'` (chỉ số phòng 3), lựa chọn "Sông sâu" trong hộp Quái mới; nhóm vùng chưa có quái trong game thì không hiện
  (nên hôm nay danh sách y như cũ). Nền phòng xem thử: game chưa có phòng vùng 4 thì dùng tạm Hang biển. `index.html` (tệp tạo) **chỉ thay khối `giao-dien.js`**
  (có kiểm khối cũ đúng bằng bản HEAD) — không chạy `build.py` để không đụng `game/dist` khi Phiên 1 đang sửa game.
  Lần tới ai chạy `python3 game/build.py` thì `index.html` được dựng lại đủ (kể cả các thay đổi `game/js` của phiên khác chưa vào tệp này).

### Ảnh không pixel (kiểu vẽ chưa chốt)
Không thêm chế độ "Mịn" (alpha mềm, khử ám, không giảm màu) — đó là việc Bước B của `docs/ke-hoach/khong-pixel/KE-HOACH.md` (`tools/chung/tach-min.js` dùng chung 7 trang),
làm riêng ở đây sẽ lệch các trang. Phần **cắt** (tìm lưới, tìm từng hình, căn chân) đã thử trên ảnh nét mịn: chạy được, kết quả như ảnh pixel (xem mục 4).

## 4. Kiểm (máy, không chơi game)

Chạy Chromium không màn hình qua máy chủ tĩnh, ảnh thử tự dựng từ ảnh trong game (mỗi ảnh hai bản: **pixel** phóng lân cận, và **nét mịn** phóng Lanczos + làm nhoè 1,2 điểm — giả ảnh không pixel), có kẻ lưới tối:

| Trang · mục | Ảnh pixel | Ảnh nét mịn |
|---|---|---|
| tach-quai · Rái Cá (lưới 8×6, 6·6·4·6·4·8 khung) | ĐẠT, đủ khung, tách theo lưới, tệp `vung: "song"`, 0 điểm ám hồng | ĐẠT, như bên trái |
| tach-phong · Cửa Sông sâu (3×2) | ĐẠT 6/6 hình, tách theo lưới | ĐẠT 6/6 |
| tach-hieu-ung · lô `v4-6-hong` (3 hàng × 6 khung) | 3/3 hàng ĐẠT, cắt theo vạch kẻ | 3/3 hàng ĐẠT |
| tach-hieu-ung · mục lẻ `hu-xoay-nuoc` | tệp xuất có `vung: "song"` | — |
| tach-phong · Trang trí Sông sâu / lô gộp cửa | prompt đủ 16 ô; lô gộp vẫn 18 hình, không có Sông sâu | — |
| tach-quai · Thuồng Luồng pha 2 | báo gửi kèm ảnh pha 1 (game chưa có) | — |
| xuong-sprite | mở không lỗi; nhóm như cũ; hộp Quái mới có "Sông sâu" | — |

Lỗi console duy nhất là tải phông Google (máy thử không có mạng ngoài) và 404 khi trang Tách Phòng dò nguồn game (đúng cách cũ, thử nguồn kế). `node --check` cho `giao-dien.js`.
Không chạy `game/tests/xuong_sprite.py` (bài đó bỏ tệp vào `game/art/custom/` rồi đóng gói lại game — đụng phần Phiên 1 đang sửa).

Ảnh soát trong thư mục này: `soat-khung-que.png`, `soat-cat-anh-min.png` (3 khung cắt ra từ ảnh nét mịn, phóng ×3 trên nền tối),
`thu-tach-quai-min.png`, `thu-tach-phong-min.png`, `thu-tach-hieu-ung-min.png` (chụp trang sau khi cắt ảnh nét mịn).

## 5. Việc để lại cho phiên sau

- Phiên 1/2B: thêm theme phòng thứ 4 thì bước "xem thử" của Tách Phòng tự chạy; tên tệp `gd-tt-song-*` là đề xuất, đổi trong `TT` của trang nếu cần **trước khi** chủ game gen D4.
- Phiên 2B: lô Nền phòng 9 mảng Sông sâu (prompt riêng) nếu không dùng `cat-nen-bien-lau.py`.
- Phiên 2A/3A/3B: cỡ ô của 12 con trong `tach-quai` là số xuất phát — sửa theo ảnh thật (luồng chính vẫn là `dung-song.py`).
- Chủ game: prompt C của Bầy Đỉa gửi kèm `que/ran3-*.png`, Rắn Nước kèm `que/ran-*.png`, Trai Gai kèm `que/vo2-*.png` (đã có sẵn, đúng tên KE-HOACH).
