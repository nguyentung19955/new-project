# Prompt v3 — thứ tự gen ảnh Zed ghép lớp

Quy cách đầy đủ: [LINH_KHI_MODULAR_SPRITE_SPEC.md](../../../review/ke-hoach-cai-thien/zed-asset/LINH_KHI_MODULAR_SPRITE_SPEC.md).

**Nhân vật nào?** Các tệp `NN-*.txt` ở thư mục này là bản **Zed v2 (tóc trắng, hai sừng)** — gửi kèm `zed-v2-canonical.png` (repo chốt làm canonical lúc 12/10 tối, sau khi yêu cầu phiên này được viết). Bản **Zed ninja (tóc đen, khăn đỏ, không sừng)** — gửi kèm `zed-canonical.png` — nằm ở `ninja/`, cùng số thứ tự, cùng bố cục ô. Sửa prompt: sửa `ninja/` rồi chạy `python3 tao-ban-v2.py` để sinh lại bản v2. Chủ dự án chỉ dùng MỘT bộ.

**Cách làm mỗi ảnh (trên iPhone):**
1. Mở tệp prompt, chép **nguyên văn**, gửi kèm đúng các ảnh ghi ở dòng đầu ("Gửi kèm: …"). Mỗi prompt = **1 ảnh**.
2. Lưu ảnh nhận được vào `docs/anh-goc/zed/v3/` với **đúng tên** ở cột "Lưu thành".
3. Nhờ Claude chạy lệnh kiểm ở cột "Kiểm" (hoặc tự chạy nếu có máy). Có LỖI → gen lại ảnh đó (có thể thêm câu sửa lỗi vào cuối prompt). Không dùng ảnh LỖI cho bước sau.
4. Ảnh có chữ "SỬA ảnh này" (09, 16, 19, 23): gửi kèm **ảnh đã đạt** của bước trước, yêu cầu công cụ sửa ảnh (edit), không vẽ mới.
5. Nếu công cụ AI không vẽ được "chỉ món đồ, người tô xanh" trong một lần: làm 2 bước — (a) "vẽ Zed mặc món đồ này, giữ nguyên mọi thứ", (b) gửi ảnh (a) kèm câu "giữ lại CHỈ món đồ, tô mọi thứ khác #00FF00".

Ký hiệu kiểu: **khung** = vẽ theo từng khung thân; **gan** = 1 ảnh gắn vào điểm neo; **tham chiếu** = ảnh có vũ khí chỉ để đo góc/điểm nắm, không vào game.

## A. VERTICAL SLICE (làm trước, theo đúng thứ tự)

| # | Prompt | Ra gì | Kiểu | Lưu thành | Kiểm (`cd docs/anh-goc/zed`) |
|---|---|---|---|---|---|
| 1 | `01-than-tron.txt` | Thân trơn Zed, đứng/đi/chạy 8×3 | khung (thân) | `v3/01-than-tron.png` | `python3 kiem-sheet.py v3/01-than-tron.png --cot 8 --hang 3 --ten dung,di,chay --giay 1.2,0.9,0.6 --chuan zed-v2-canonical.png --ra kiem/01` |
| 2 | `02-ao-mac-dinh.txt` | Áo + khăn + đai mặc định 8×3 | khung | `v3/02-ao-mac-dinh.png` | `… v3/02-ao-mac-dinh.png --cot 8 --hang 3 --ten dung,di,chay --giay 1.2,0.9,0.6 --loai lop --theo kiem/01/do-dac.json --ra kiem/02` |
| 3 | `03-quan-giay-mac-dinh.txt` | Quần rộng + giày nâu 8×3 | khung | `v3/03-quan-giay-mac-dinh.png` | như 2, `--ra kiem/03` |
| 4 | `04-giap-tre.txt` | Giáp tre (thay áo) 8×3 | khung | `v3/04-giap-tre.png` | như 2, `--ra kiem/04` |
| 5 | `05-non-la.txt` | Nón lá | gan (đầu) | `v3/05-non-la.png` | `… --cot 1 --hang 1 --loai lop --ra kiem/05` |
| 6 | `06-canh-la.txt` | Cánh lá vỗ 8 khung | gan (lưng) | `v3/06-canh-la.png` | `… --cot 8 --hang 1 --ten vo --giay 0.8 --loai lop --ra kiem/06` |
| 7 | `07-kiem.txt` | Thanh kiếm | gan (tay) | `v3/07-kiem.png` | `… --cot 1 --hang 1 --loai vu-khi --ra kiem/07` |
| 8 | `08-kiem-combo-co-kiem.txt` | Zed cầm kiếm, 3 nhát 6×3 | tham chiếu | `v3/08-kiem-combo-co-kiem.png` | `… --cot 6 --hang 3 --ten kiem_1,kiem_2,kiem_3 --giay 0.3,0.3,0.46 --chuan zed-v2-canonical.png --ra kiem/08` |
| 9 | `09-kiem-combo-than.txt` | Như 8, đã xoá kiếm | khung (thân) | `v3/09-kiem-combo-than.png` | như 8, `--ra kiem/09` |
| 10 | `10-ao-mac-dinh-kiem.txt` | Áo mặc định cho combo kiếm | khung | `v3/10-ao-mac-dinh-kiem.png` | `… --cot 6 --hang 3 --ten kiem_1,kiem_2,kiem_3 --giay 0.3,0.3,0.46 --loai lop --theo kiem/09/do-dac.json --ra kiem/10` |
| 11 | `11-quan-giay-mac-dinh-kiem.txt` | Quần giày cho combo kiếm | khung | `v3/11-quan-giay-mac-dinh-kiem.png` | như 10, `--ra kiem/11` |
| 12 | `12-giap-tre-kiem.txt` | Giáp tre cho combo kiếm | khung | `v3/12-giap-tre-kiem.png` | như 10, `--ra kiem/12` |

Sau mỗi ảnh đạt: mở trang ghép `https://spiritblade.web.app/tach-ghep-lop.html`, thả `kiem/NN/sheet-game.png` + `kiem/NN/do-dac.json` vào đúng lớp, chỉnh neo, bấm "Xuất JSON" (xem báo cáo, mục "Cách dùng").

**Slice xong khi:** trên trang ghép, thân trơn + áo mặc định + quần giày mặc định trông như canonical; đổi áo mặc định ↔ giáp tre, bật/tắt nón lá, cánh lá, kiếm ở đứng/đi/chạy/3 nhát kiếm mà không lệch.

## B. PHẦN CÒN LẠI (sau khi slice đạt)

| # | Prompt | Ra gì | Kiểu | Kiểm |
|---|---|---|---|---|
| 13 | `13-than-lon-trung-chet-chuong.txt` | Lộn 6, trúng 3, gục 8, chưởng 6 (8×4) | khung (thân) | `--cot 8 --hang 4 --ten lon,trung,chet,chuong --giay 0.27,0.2,0.6,0.3 --chuan zed-v2-canonical.png` |
| 14 | `14-thuong.txt` | Cây thương | gan | `--cot 1 --hang 1 --loai vu-khi` |
| 15 | `15-thuong-combo-co-thuong.txt` | 3 đâm + quét + lấy đà/xốc (6×5) | tham chiếu | `--cot 6 --hang 5 --ten thuong_1,thuong_2,thuong_3,thuong_4,thuong_giu --giay 0.38,0.34,0.34,0.52,0.4 --chuan zed-v2-canonical.png` |
| 16 | `16-thuong-combo-than.txt` | Như 15, xoá thương | khung (thân) | như 15 |
| 17 | `17-bua.txt` | Cây búa | gan | `--cot 1 --hang 1 --loai vu-khi` |
| 18 | `18-bua-combo-co-bua.txt` | Nện 8 + lấy đà 2 (8×2) | tham chiếu | `--cot 8 --hang 2 --ten bua,bua_giu --giay 0.8,0.5 --chuan zed-v2-canonical.png` |
| 19 | `19-bua-combo-than.txt` | Như 18, xoá búa | khung (thân) | như 18 |
| 20 | `20-phi-tieu.txt` | Phi tiêu cầm tay | gan | `--cot 1 --hang 1 --loai vu-khi` |
| 21 | `21-dan-phi-tieu.txt` | Phi tiêu bay xoay 4 khung | đạn | `--cot 4 --hang 1 --ten bay --giay 0.16 --loai dan` |
| 22 | `22-phi-tieu-co-phi-tieu.txt` | Ném 6 + ngắm 3 + tung 3 (6×2) | tham chiếu | `--cot 6 --hang 2 --ten phitieu,phitieu_giu --giay 0.38,0.5 --chuan zed-v2-canonical.png` |
| 23 | `23-phi-tieu-than.txt` | Như 22, xoá phi tiêu | khung (thân) | như 22 |
| 24 | `24-giap-vai-do.txt` | Giáp vai đỏ | khung | `--cot 8 --hang 3 … --loai lop --theo kiem/01/do-dac.json` |
| 25 | `25-gang-tay-do.txt` | Găng + giáp tay đỏ | khung | như 24 |
| 26 | `26-giay-giap-do.txt` | Giày giáp đỏ | khung | như 24 |
| 27 | `27-dai-lung.txt` | Đai da + túi hông | khung | như 24 |
| 28 | `28-ao-thay-lang.txt` | Áo Thầy Lang | khung | như 24 |
| 29 | `29-gui-tre-sau.txt` | Gùi tre (phần sau lưng) | gan (lưng) | `--cot 1 --hang 1 --loai lop` |
| 30 | `30-gui-tre-quai-truoc.txt` | Quai gùi (phần trước ngực) | khung | như 24 |
| 31 | `31-mu-giap.txt` | Mũ giáp đỏ (trùm kín tóc) | gan (đầu) | `--cot 1 --hang 1 --loai lop` |
| 90+ | `90-mau-lop-do-theo-dong-tac.txt` | Mỗi món khung × mỗi bộ động tác chiến đấu | khung | theo bộ thân tương ứng, `--theo kiem/<thân>/do-dac.json` |

**Số ảnh cần cho đủ một món đồ ôm người:** 1 (đứng/đi/chạy) + 5 (kiếm, chung, thương, búa, phi tiêu) = 6 ảnh. Mũ, gùi, cánh, vũ khí: 1 ảnh mỗi món (gắn neo, dùng cho mọi động tác). Thân: 6 ảnh (01, 09, 13, 16, 19, 23) + 4 ảnh tham chiếu (08, 15, 18, 22).

Thứ tự gợi ý phần B: 13 → 15 → 16 → 18 → 19 → 20 → 21 → 22 → 23 (đủ thân mọi động tác), rồi mặc định cho các bộ đó (mẫu 90), rồi đồ mới 24–31.
