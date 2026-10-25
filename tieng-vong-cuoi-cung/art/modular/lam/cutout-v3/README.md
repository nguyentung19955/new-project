# Lam cutout v3 – bộ mảnh + rig đọc JSON

Bản sửa từ `../review-v2/` (giữ nguyên v2 để đối chiếu) theo `review-v2/REVIEW.md` và `review-v2/PROMPT-CLAUDE.txt`.
Thiết kế và tỉ lệ giữ theo ảnh 02 (`code/master-s.png`). Không gen ảnh AI, không mesh, không GIF chạy.
Chi tiết từng thay đổi, số trước/sau và lỗi còn lại: **CHANGELOG.md**.

## Thư mục
| Đường dẫn | Nội dung |
|---|---|
| `lam-v3.json` | Metadata thống nhất: cha, điểm gắn (`gan`), P/D, xương, `huong_anh`, góc nghỉ **tương đối**, `ti_le`, slot, slot đổi theo tư thế, chuyển động phụ, bán kính khớp, quy ước góc (`quy_uoc_goc`) |
| `manh/*.png` | 24 mảnh RGBA tô bằng mask (phía xa `-xa` đã tối 18 %), `manh/xam/*.png` bản xám |
| `manh/sheet-xam.png`, `manh/sheet-to-mask.png` | Sheet xám / tô mask, có chấm P (đỏ) và D (xanh) |
| `kiem-thu/` | Ảnh và số liệu kiểm chứng (bảng dưới) |
| `code/` | Code v3 chạy độc lập + `manh-goc/` (24 mảnh nguồn chép từ v2) + `master-s.png` |

## Chạy
```
pip install pillow numpy scipy
cd code
python3 xuat.py              # dựng mảnh → ../manh/, ../lam-v3.json, ../kiem-thu/01-do-mau-ketqua.json (~15 s)
python3 thu3.py              # mọi bài thử → ../kiem-thu/ (~20 s); chọn mục: python3 thu3.py nghi chi chop ...
python3 kiem_chuyen_doi.py   # (cần ../../review-v2) chứng minh bước chuyển v2 → offset cục bộ không nhảy vị trí
python3 rap3.py              # ảnh ráp nhanh dáng nghỉ → ../kiem-thu/rest3-nhanh.png
```
`thu3.py` tự vẽ cột v2 đối chứng nếu có thư mục `../../review-v2/lam-cutout/code` (qua `v2ref.py`, không sửa v2);
không có thì chỉ vẽ v3.

## File code
| File | Vai trò |
|---|---|
| `khuon3.py` | Dựng mảnh: tách mask / vật liệu / viền; bỏ viền nguồn; khớp lồng; cắt mũ–chóp; hồ sơ đùi/cẳng |
| `khung.py` | **Nguồn duy nhất** cho quyết định rig: chuyển v2 → cục bộ, thứ tự lớp v3, điểm gắn chi, hướng IK, mảnh ẩn, chuyển động phụ, slot theo tư thế |
| `do_mau.py` | Dò vị trí mảnh trên ảnh 02 + IK giữ xương → góc nghỉ (gọi khi xuất) |
| `meta.py` | Ghép rig + số đo mảnh → JSON |
| `xuat.py` | Xuất PNG, sheet, JSON |
| `rap3.py` | Ráp **chỉ từ JSON + PNG** (như runtime game) |
| `thu3.py`, `v2ref.py` | Bài thử, nạp v2 để đối chứng |
| `kiem_chuyen_doi.py` | Kiểm bước 1 (v2 → cục bộ) |

## Quy ước góc (cũng ghi trong JSON)
x phải, y xuống; độ; **dương = chiều kim đồng hồ trên màn hình**; 0° = +x, 90° = xuống.
`goc_nghi` là góc **tương đối**: hướng mảnh so với hướng cha (hướng = hướng xương D−P nếu có, ngược lại trục x ảnh).
Pose cộng delta: `pose['goc'][ten]`. Ma trận: `M_con = M_cha·T(gan)·R(goc_nghi+delta+huong_cha−huong_con)·S(ti_le)·T(−P)`.
v2 dùng góc tuyệt đối thế giới cho chuỗi chi (không cộng góc cha) – v3 đổi có chủ đích và ghi rõ.

## Đơn vị và cỡ hiển thị
1 px thế giới = 112/470 ≈ 0,238 px logic. Viền 8 px thế giới ≈ 1,91 px logic ≈ 4,14 px thiết bị (hệ số 2,17).
Bài 112 px dùng khung thế giới cố định 600×520 (gốc thế giới tại (40,20) của khung, đất y = 468 → 488) thu đồng nhất
hai trục: 143×124 px logic, 310×269 px thiết bị.

## Ảnh kiểm thử (`kiem-thu/`)
| File | Nội dung |
|---|---|
| `00-chuyen-doi-v2-cuc-bo.*` | v2 render bằng rap3 sau khi chuyển sang offset cục bộ: khác 0 px ngoài mắt 1 (nội suy scale 0,92) |
| `01-do-mau-manh.png`, `01-do-mau-ketqua.json` | Vị trí dò của từng mảnh trên ảnh 02 + IK chi |
| `02-nghi-mau-v2-v3-chong.png` | Ảnh mẫu / ráp / chồng – v2 và v3, cùng gốc và scale; số IoU trong `02-nghi-so-lieu.json` |
| `03-tay-chan-gan-xa-0-50-105.png` | Tay/chân gần–xa ở 0/50/105°, v2 cạnh v3, ×2 trên caro hồng, đánh dấu lỗi |
| `04-dai-goc-*.png` | Dải 0–120° mỗi 10° cho 4 chi, v2 và v3 |
| `05-112px-*.png` | 8 tư thế ở 112 px logic 1:1, phóng ×4, và px thiết bị 1:1; nền sáng/tối/caro |
| `06-lean-8-0+8.png` | Thân −8/0/+8°, phóng vùng cổ/capelet; v2 cùng tư thế |
| `07-chop-0-6-10.png` | Chóp 0/±6/±10° ×3, v2 cạnh v3 |
| `08-dien-tich-dui-cang.md/.json` | Diện tích đùi/cẳng còn thấy trên full rig + mảnh nào che |
| `09-dau-duoi-cang-chan-w1-r1.png` | So 3 phương án đầu dưới cẳng chân (v2 / REVIEW w1 28 r1 14 / v3) |
| `10-net-trong-8-6-5.png` | Đối chứng T_LINE 8 với nét trong 6 và 5 + silhouette 8 |
| `11-slot-chan-gan.png` | Luật slot chân gần quanh ngưỡng 30° |

Màu đánh dấu lỗi trên ảnh 03/04/07: đỏ = viền hở (điểm màu sát nền), xanh lá = khe nền kín, xanh dương = điểm viền
nằm sâu trong hình gần khớp (vành ống/khớp cầu, nhưng cũng gồm nếp gấp trong khuỷu và mép găng/ủng hợp lệ).
