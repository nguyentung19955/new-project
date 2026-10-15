# Báo cáo — đưa 6 quái Rừng già còn lại vẽ lại (đủ 6 động tác) vào game (15/10)

Làm theo `YEU-CAU.md` cùng thư mục, y cách phiên `quai-moi-4-con`. **Không chạy game, không test**: chỉ xử lý ảnh, vẽ ảnh soát tĩnh, `node --check`, `build.py`.
Không đụng đăng nhập Google / lưu mây / `?cloud=0`, không chép apiKey, không đụng master, không PR.

- Ảnh soát: `xem-6-con.png` (mỗi con 6 hàng × khung, cùng tỉ lệ game ×3, vạch đỏ = đường đất, vạch xanh = điểm neo, cột đầu = tấm cũ cùng tỉ lệ, cùng điểm neo),
  `xem-6-con.gif` (6 con lần lượt: đứng thở → đi → báo đòn → đánh → trúng đòn → chết, cỡ game ×3; Nhím chạy hàng đánh 1,5 s để thấy lặp lăn).
- Công cụ (dùng lại `../quai-moi-4-con/cong-cu/`): `cong-cu/dung-6-con.py` nạp `anh_quai.py` và các hàm `thu` / `luu_png` / `ti_le_hang` của `dung-quai-moi.py`
  (tệp này chỉ thêm `if __name__ == '__main__':` quanh phần dựng 4 con — chạy thẳng vẫn như cũ). `cong-cu/ve-soat.py` chép từ `ve-soat.py` phiên trước, đổi sang 6 con.
  Chạy: `python3 dung-6-con.py [--ghi]` rồi `python3 ve-soat.py`.

## 1. Dựng lại 6 tấm `game/art/custom/<mã>.sprite.json`

Nguồn: `docs/anh-goc/quai-moi/dong-tac/<mã>-<bước>-cat/<hàng>/khung-NN.png` (6/6/6/6/4/6 khung, thư mục hàng dò bằng glob). `namPhongChua-3-bao-don-b.png` (dự phòng) không dùng.
Định dạng như phiên trước: `tam`, `net: 2`, `khung_rong`/`khung_cao`, `goc`, `rong`/`cao` **giữ số cũ** (hộp va chạm không đổi), `dong_tac`, `can_tam`.
Ảnh: LANCZOS trên màu nhân alpha, alpha cắt 0/255 (viền sắc), lượng tử không hoà sắc. Chuẩn cỡ theo thân: hệ số mỗi hàng = trung bình nhân (khớp SIFT với 6 khung đứng thở) × (căn tỉ lệ diện tích), chỉnh riêng khung lệch > 4%; hàng trúng đòn đo khung 2–4, hàng chết đo khung 1–2 (y phiên trước). Hàng trúng đòn AI vẽ to hơn hẳn được đưa về đúng cỡ (hệ số 1,28–1,75).

Khác phiên trước:
- **Đo thân bỏ mảng rời nhỏ** (< 20% mảng lớn nhất): bụi lăn của Nhím, quả hạt dẻ nằm cạnh Sóc chết, mảnh văng — không kéo lệch tâm. (Ảnh vẫn giữ nguyên các mảng đó.)
- **Sóc Nổ**: khung 5 hàng đánh **vẫn còn** hạt dẻ bay (mảng rời phía trên, ~3200 điểm ảnh) dù yêu cầu ghi đã xoá → công cụ xoá mảng rời đó (hạt dẻ là đạn code vẽ, giữ như cũ). Hàng chết giữ quả hạt dẻ.
- **Hoa Bào Tử**: đứng một chỗ (rễ) → tâm đo ở 15% dưới cùng (ụ đất), hàng đi chỉ đung đưa, chân không trượt. Viên bào tử dính miệng ở khung phun giữ.
- **Ong Vò** (bay, bầy 3 con): căn theo **tâm bầy** (trọng tâm mọi điểm ảnh); độ cao bay giữ như tấm cũ — tâm bầy cao hơn điểm neo 14,4 điểm game, đúng như đo trên tấm cũ. Khung chết 5–6 (khung 4 mờ dần sẵn) được đưa alpha về đủ đậm (không thì mất khi cắt alpha 0/255) và `mo` = 0,67 để game bắt đầu mờ đúng từ khung 5.
- **Nấm nảy / nhảy** (mục 2).
- **Bảng màu**: 32 màu như cũ; con nào sau 32 màu còn > 4000 điểm ảnh lệch màu xa thì thêm 16 màu riêng cho phần lệch (48 màu): Nấm Phồng (mây nổ tím ở 2 khung nổ bị gộp thành xanh nhạt), Hoa Bào Tử, Nhím Độc. Ba con còn lại 32 màu.

| Con | hệ số hàng (ảnh gốc / idle): đi · báo đòn · đánh · trúng đòn · chết | thân đứng cũ → mới (cao × rộng) | ô khung cũ → mới | neo `goc` | tệp cũ → mới |
|---|---|---|---|---|---|
| namPhong | 0,948 · 0,982 · 0,953 · 1,276 · 1,177 | 26×29 → 26×29,2 | 44×44 → 47×41 | [22, 39] | 14 → 51 KB |
| namPhongChua | 0,981 · 0,985 · 0,886 · 1,496 · 1,155 | 51×70 → 51×68,1 | 96×56 → 124×104 | [59, 101] | 56 → 248 KB |
| hoaBaoTu | 1,075 · 1,105 · 1,111 · 1,748 · 1,125 | 41×48 → 41×36,8 | 64×48 → 63×55 | [23, 52] | 33 → 91 KB |
| socNo | 0,995 · 0,944 · 0,821 · 1,567 · 1,011 | 35×48 → 35×44,6 | 60×48 → 79×58 | [48, 55] | 25 → 101 KB |
| nhimDoc | 0,967 · 1,016 · 0,983 · 1,426 · 1,018 | 29×38 → 29×38,5 | 56×36 → 50×40 | [25, 37] | 21 → 88 KB |
| ongVo | 0,975 · 1,061 · 1,061 · 1,601 · 1,063 | bầy 27×44 → 27×36,8 | 56×56 → 47×39 | [21, 33] | 22 → 49 KB |

Cỡ trong game = chiều cao thân đứng (trung vị hàng idle) của tấm cũ, giữ nguyên. Hoa và Ong mới gọn hơn chiều ngang (đúng ảnh mẫu). Nấm Phồng Chúa ô to vì độ nhảy thật (≈ 49 điểm game) và khung đáp có bụi văng rộng.

## 2. Căn chân, căn tâm, độ nhảy của nấm

Mọi khung: đáy thân lên cùng đường đất `goc[1]`, tâm thân trên sàn trùng `goc[0]`; đo lại trên tấm đã dựng và ghi `can_tam` (gần như toàn 0, lớn nhất ±2):
namPhong idle `[0,0,1,0,1,0]`, atk `[1,0,0,1,0,0]`, die `[0,1,0,1,0,0]`; namPhongChua tele `[0,1,0,0,0,0]`, hit `[0,1,0,0]`, die `[0,0,0,1,0,-1]`; hoaBaoTu hit `[0,0,0,1]`;
socNo atk `[1,1,0,0,0,0]`; nhimDoc atk `[0,0,0,0,-2,0]`; ongVo die `[1,1,0,0,0,0]`; còn lại 0. Đổi hàng không nhảy hình (xem `xem-6-con.png`).

**Độ nhảy thật** (máy cắt căn đáy nên mất): hàng đi của Nấm Phồng, hàng đi và hàng đánh của Nấm Phồng Chúa. Đọc `khung_bao` trong `bao-cao.json` của lần cắt; đáy thân
(mảng lớn nhất) của từng khung trên tấm gốc; đường đất của hàng = đáy thấp nhất; mỗi khung đặt đúng độ cao của nó so với đường đất đó, nhân hệ số chuẩn cỡ. Độ cao được
**vẽ thẳng vào tấm** (thân bay lên thật trong ô khung, bóng / điểm neo vẫn ở đất; `can_tam` chỉ là độ dời ngang nên không dùng để chở độ cao). Độ cao (điểm game):
- namPhong đi: `[0, 0.9, 10.7, 0, 0, 0.9]` (nảy ở khung 3)
- namPhongChua đi: `[0, 17.1, 32.5, 9.8, 0, 0]` (ụ đất ở lại dưới đất, thân nhảy lên); đánh: `[0, 27.0, 48.7, 0, 0, 0.8]` (bật lên → đỉnh → đáp có bụi văng)
- Các hàng khác của nấm (đứng, báo đòn, trúng đòn, chết) không nhảy: căn chân bình thường.

## 3. Thời gian

Cách game phát (đọc code, không đổi nhịp): hàng lặp theo `giay` của tệp; báo đòn trải đúng thời gian báo trước thật (`js/mobs.js`: `e.wind / e.act.T`);
đánh / trúng đòn / chết theo `MA.dur` của `js/monster_art.js` (số trong tệp ghi cùng giá trị cho khớp). Khung bị `khung` bỏ vẫn nằm trong tấm (`?khungtrung=0` phát đủ).

| Con · kỹ năng | idle | move | tele (báo trước) | atk | die (`mo`) |
|---|---|---|---|---|---|
| namPhong · Phồng nổ | 1,2 | 0,35 (sàn; 48 điểm/s) | 1,0 s phồng (vòng đỏ) | 0,9 s, `khung [4,5]`: **khung nổ hiện đúng lúc nổ** (mây độc + vụ nổ code cùng lúc), rồi mây tan; game xoá thân sau 0,855 s | 1,1 (0,82) |
| namPhongChua · tinh anh | 1,2 | 0,85 (40 điểm/s) | đòn nổ thường 0,7 s | 0,7 s, `khung [1,2,3,4,5]`: bỏ khung ngồi thu, mở bằng cú bật lên ngay lúc ra đòn, đáp ở ~0,28 s (game còn giữ khung lâu hơn — "ra đòn nặng") | 1,4 (0,64) |
| hoaBaoTu · phun 3 hạt | 1,2 | 0,9 (đung đưa) | 0,7 s (nụ mở miệng dần) | `khung [2,3,4,5]`: **khung phun có viên bào tử ở miệng hiện đúng lúc 3 hạt bay ra**; game cắt hàng ở 0,45 s | 1,4 (0,64) |
| socNo · ném hạt dẻ | 1,2 | 0,66 (34 điểm/s) | 0,5 s (giơ hạt dẻ qua đầu) | 0,75 s, `khung [3,4,5]`: **khung vung tay (hạt dẻ đã rời tay) đúng lúc hạt dẻ (đạn code) bay ra**; game cắt ở 0,6 s | 1,2 (0,75) |
| nhimDoc · cuộn lăn | 1,2 | 0,74 (26 điểm/s) | 2,2 s = cuộn 1,4 + báo 0,8 (cuộn tròn dần, khung 6 tròn hẳn) | 0,6 s một lượt rồi **lặp khung 3–6** (`lap_tu: 2`) suốt lúc lăn tới khi dừng | 1,1 (0,82) |
| ongVo · bổ 3 lần | 0,6 (vỗ cánh) | 0,4 | mỗi lần bổ: hàng báo đòn ×1,2 (≈ 0,58 s; tới mắt đỏ đúng lúc vạch nổ ở 0,5 s) | `khung [2,3,4,5]`: **cú lao 0,12 s hiện khung bầy lao ngang**; sau đó code về hàng đi (bay vòng) | 1,1 (0,67, mờ từ khung 5) |

**Mã đã đổi cho khớp:**
- `js/sprite_custom.js`: mục `"lap_tu"` của hàng đánh (đọc ở `SC.add`, phát ở `SC.chonQuai`: hết một lượt `t >= D` thì lặp các cột `lap_tu..so-1`, mỗi cột `D/so` giây). Tệp không có mục này: như cũ.
- `js/ky_nang_quai.js` (Nhím, `cuonLan`): tấm có hàng lăn lặp thì **không xoay thân bằng code** nữa (trước đây xoay cả hình → vệt bụi trong ảnh mới sẽ quay tròn theo). Tấm cũ (`?quaicu=1`) vẫn xoay như trước.

**Hàng game cần mà tấm không có**: tinh anh Nấm Phồng Chúa dùng `chieu1` cho chiêu **Nhảy dập** (`js/chieu_trum.js`, 1,9 s). Không thêm hàng (danh sách động tác `ANIMS` không có `chieu1`); `SC.chonQuai` sẵn có dùng lại hàng gần nhất: 40% đầu = hàng báo đòn, 60% sau = hàng đánh (theo bảng `khung`). Khớp khá: lần nhảy 2 của chiêu (bay 0,95–1,3 s) trùng khung bật/đỉnh của hàng đánh (0,99–1,21 s), khung đáp tới ở 1,21 s. **Lưu ý**: chiêu này vốn nhấc cả thân lên bằng code (`ctCao`, cao 26) nên lúc đó độ nhảy vẽ trong ảnh cộng thêm → nhảy cao gấp đôi trong ~0,3 s. Không vẽ code gì thêm. Các con còn lại không cần hàng mới (`spawn` = hàng đứng mờ vào như cũ).

## 4. Cờ `?quaicu=1`

Mở rộng cách phiên trước: `QUAI_MOI` trong `js/sprite_custom.js` thêm 6 mã; tấm cũ giữ nguyên ảnh trong `game/art/custom/<mã>-cu.sprite.json` (`"cu_cua": "<mã>"`, tên "… (tấm cũ)").
Bình thường tấm cũ bị bỏ ngay ở `SC.add` (không tải, không tính vào vùng); `?quaicu=1` nạp tấm cũ dưới đúng mã, bỏ tấm mới. `build.py` đã giữ `cu_cua` và không tính tấm cũ vào người chơi tải (không phải sửa).

## 5. Dung lượng (`build.py --hai-tep`)

| | trước | sau |
|---|---|---|
| **NGƯỜI CHƠI TẢI** | 12,99 MB / trần 20 MB | **13,28 MB** / trần 20 MB (+0,29) |
| Vùng Rừng già (46 ảnh) | 2,90 MB | 3,20 MB |
| Trình duyệt không có WebP | 15,08 MB | 15,53 MB |
| Tải trước khi vào vùng đầu | 4,73 MB | 4,73 MB |
| Bản một tệp (trang công cụ) | 21,82 / 30 MB | 22,44 / 30 MB |
| Tấm cũ chỉ tải khi `?quaicu=1` (không tính) | 4 tấm 0,07 MB | 10 tấm 0,18 MB |
| Tổng ảnh trên máy chủ (chỉ để biết) | 26,31 MB | 27,17 MB |

## Tệp đã đổi

- `game/art/custom/{namPhong,namPhongChua,hoaBaoTu,socNo,nhimDoc,ongVo}.sprite.json` (dựng lại), `…-cu.sprite.json` (mới: tấm cũ cho cờ).
- `game/js/sprite_custom.js` (6 mã vào `QUAI_MOI`, mục `lap_tu`), `game/js/ky_nang_quai.js` (Nhím không xoay thân khi ảnh đã vẽ lăn).
- `game/dist/*`, `tools/xuong-sprite/index.html` (build lại).
- `docs/review/ke-hoach-cai-thien/quai-moi-4-con/cong-cu/dung-quai-moi.py` (chỉ thêm `if __name__ == '__main__':` để dùng lại hàm).
- Thư mục này: `xem-6-con.png`, `xem-6-con.gif`, `cong-cu/dung-6-con.py`, `cong-cu/ve-soat.py`, báo cáo này.

Kiểm: `node --check game/js/sprite_custom.js`, `node --check game/js/ky_nang_quai.js` — đạt. `python3 game/build.py --hai-tep` — đạt (số ở mục 5).

## Còn lưu ý

- Nấm Phồng Chúa: chiêu Nhảy dập nhảy cao gấp đôi một lúc (code nhấc + ảnh nhảy, mục 3). Muốn bớt thì giảm `cao` của `namPhongNhay` trong `chieu_trum.js` — chưa làm vì ngoài yêu cầu.
- Nấm Phồng: các khung phồng to dần (cột 1–4 hàng đánh) không phát, vì game nổ ngay lúc ra đòn (phồng đã nằm trong 1 s báo đòn). `?khungtrung=0` phát đủ.
- Ong: cú lao trong kỹ năng chỉ 0,12 s rồi code trả về hàng đi, nên hàng đánh chỉ thấy khung lao đầu tiên (đúng lúc lao).
- Sóc Nổ khung 5 ảnh cắt còn hạt dẻ bay — đã xoá khi dựng (nên xoá luôn ở ảnh cắt nếu cắt lại).
- Nấm Phồng / Hoa / Nhím 48 màu (32 + 16) thay vì 32, tệp nặng hơn chút.
- Chưa xem trong game thật (không chạy game theo yêu cầu): nên mở Rừng già nhìn 6 con, và thử `?quaicu=1` để so.
