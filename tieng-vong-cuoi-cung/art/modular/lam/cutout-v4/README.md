# Lam cutout v4 – bộ mảnh + rig đọc JSON + chạy nháp

Bản sửa từ `../cutout-v3/` (giữ nguyên, không sửa) theo `../review-v3/REVIEW-V3.md` và `../review-v3/PROMPT-CLAUDE-V4.txt`.
Thiết kế và tỉ lệ giữ theo ảnh 02 (`code/master-s.png`). Không gen ảnh AI, không mesh, không kéo dài xương, viền ngoài 8.
Chi tiết thay đổi, số trước/sau, phần **đã đo** và phần **chưa kiểm chứng**: **CHANGELOG-V4.md**.

> Trạng thái: bốn P0 của REVIEW-V3 đã làm và đo (xem CHANGELOG-V4 §Tóm tắt). Chạy trong `chay-nhap/` là **bản nháp
> để kiểm rig**, KHÔNG phải animation game hoàn thiện. Chưa chạy trên Safari/iPhone, chưa đo FPS.

## Thư mục
| Đường dẫn | Nội dung |
|---|---|
| `lam-v4.json` | Metadata runtime (schema_version 4.0.0): cha, `gan`, P/D, xương, `huong_anh`, góc nghỉ tương đối, `visible`, `slot` + `thu_tu_phu`, `sap_lop`, `thu_tu_xu_ly`, `ik` (chuỗi/gap/mix/điểm đế), `khoa_chan`, `lat_ngang`, `gioi_han_goc`, `phu` (bù góc tĩnh), `slot_theo_tu_the`, `world_to_logic` |
| `manh/*.png` | 24 mảnh RGBA (phía `-xa` tối 18 %), `manh/xam/` bản xám, `sheet-xam.png`, `sheet-to-mask.png` (chấm đỏ P, xanh D) |
| `kiem-thu/` | Ảnh + số kiểm chứng (bảng dưới) |
| `chay-nhap/` | GIF chạy nháp cỡ lớn, GIF 112 px logic (sáng/tối/caro, 1:1 và ×4), contact sheet, `chay-nhap.json` |
| `code/` | Code v4 chạy độc lập + `manh-goc/` (24 mảnh nguồn) + `master-s.png` |

## Chạy
```
pip install pillow numpy scipy
cd code
python3 xuat.py        # dựng mảnh → ../manh/, ../lam-v4.json, ../kiem-thu/01-do-mau-ketqua.json (~20 s)
python3 kiem_json.py   # validator JSON/PNG → ../kiem-thu/00-validator-lam-v4.json (mã thoát 1 nếu lỗi)
python3 thu4.py        # mọi bài thử → ../kiem-thu/ (~50 s); chọn mục: python3 thu4.py nghi chi dai khuyu lean an chop 112 slot
python3 chay_nhap.py   # chạy nháp → ../chay-nhap/ (~15 s)
python3 rap4.py        # ảnh ráp nhanh dáng nghỉ → ../kiem-thu/rest4-nhanh.png
```
Đường dẫn đều tương đối theo vị trí file; font tìm theo danh sách thư mục thường gặp rồi lùi về font mặc định của Pillow
(`code/chung.py`). Cột đối chứng v3 chỉ vẽ khi có `../../cutout-v3/lam-v3.json` (đọc bằng cùng `rap4.Rig`); không có thì chỉ vẽ v4.

## File code
| File | Vai trò |
|---|---|
| `khung.py` | **Nguồn duy nhất** cho quyết định rig: điểm gắn v4 (`ATTACH_V4`), `VISIBLE_FALSE`, `thu_tu_phu`, `IK_CHAINS`, `PHU`, luật slot |
| `khuon4.py` | Dựng mảnh: mask/vật liệu/viền; khớp lồng; **`elbow_transition`** (khuỷu v4); mũ–chóp + mask nét hốc (`HOC_R`, `HOC_MU`) |
| `do_mau.py` | Dò mảnh trên ảnh 02 + IK giữ xương → góc nghỉ (gọi khi xuất) |
| `meta.py` | Ghép rig + số đo → JSON (schema, quy ước, thứ tự xử lý, quy tắc lật) |
| `xuat.py` | Xuất PNG, sheet, JSON; điểm tiếp xúc đế ủng (`diem_de`) |
| `rap4.py` | Runtime mẫu: **chỉ đọc JSON + PNG**; visible, sắp lớp ổn định, IK hai đoạn + khoá chân, hạ root khi ngoài tầm, lật ngang |
| `kiem_json.py` | Validator JSON/PNG |
| `thu4.py` | Bài thử kiem-thu/ |
| `chay_nhap.py` | Chạy nháp tại chỗ (khoá tư thế, nội suy theo thời gian, khoá chân pha chịu lực) |
| `chung.py` | Font fallback, đường dẫn |

## Quy ước (cũng ghi trong JSON)
x phải, y xuống; độ; **dương = chiều kim đồng hồ trên màn hình**; 0° = +x, 90° = xuống. `goc_nghi` tương đối với cha.
`M_con = M_cha·T(gan)·R(goc_nghi+delta+huong_cha−huong_con)·S(ti_le)·T(−P)`.
Thứ tự một khung: góc pose → `phu` (bù góc **tĩnh**) → FK root/lean → IK chuỗi khoá → luật slot (trên góc sau IK)
→ sắp lớp `(slot, thu_tu_phu, ten)` → bỏ mảnh `visible=false` (chỉ mảnh đó, con vẫn vẽ) → vẽ.
Pose: `goc{ten: delta}`, `goc_toa_do [x,y]`, `hien{ten: bool}` (ghi đè visible), `khoa_chan{chuoi: {de, huong_ung, mix}}`.

## Đơn vị
1 px thế giới = `world_to_logic` = 112/470 ≈ 0,2383 px logic. px thiết bị = px logic × devicePixelRatio thật của canvas;
bài thử dùng **giả định** 2,17 (chưa đo trên máy thật). Viền 8 px thế giới ≈ 1,91 px logic.

## Ảnh/số kiểm thử (`kiem-thu/`)
| File | Nội dung |
|---|---|
| `00-validator-lam-v4.json` | Validator v4 (ĐẠT). `00-validator-lam-v3.json`: chạy cùng validator trên v3 để thấy trường thiếu + trùng khoá slot 115 |
| `01-do-mau-ketqua.json` | Dò mảnh trên ảnh 02 + IK chi (giải lại với hông gần [81,45]) |
| `02-nghi-mau-v3-v4-chong.*` | Mẫu / v3 / v4 / chồng / silhouette v3–v4 và mẫu–v4, cùng gốc/scale; phóng vùng chân |
| `03-tay-chan-gan-xa-0-50-105.*` | 4 chi × 0/50/105°, v3 và v4, silhouette chưa đánh dấu + bản đánh dấu |
| `04-dai-goc-*.png`, `04-dai-goc-so-lieu.json` | Dải 0–120° mỗi 10°, v3 và v4 |
| `05-khuyu-duoi-v3-v4-Z.png` | Khuỷu 0/15/30/60/100°: v3, Z8, Z10, Z12 |
| `05-co-tay-dao-chay-chem.png`, `05-khuyu-co-tay-so-lieu.json` | Cổ tay −40/0/+40° ở 5 tư thế tay chạy/chém, có dao |
| `06-lean-8-0+8-ik.png`, `06-lean-ik-so-lieu.json` | Lean −8..+8 với IK khoá chân: sai số đế/cổ chân (px thế giới + logic), thiếu tầm, hạ root; v3 bù đùi để so |
| `07-manh-tat-dau-lean.png`, `07-manh-tat-so-lieu.json` | Mảnh tắt ở nghỉ / đầu ±10 / lean ±8: px thấy v3 vs v4 |
| `08-chop-hoc.png`, `08-chop-so-lieu.json` | Chóp −10/−6/0/+6/+10, v3 vs v4, phóng hốc ×6, đếm vạch mảnh ở hốc |
| `09-112px-*` | 112 px: logic 1:1, logic ×4, thiết bị 1:1 (giả định 2,17); nền sáng/tối/caro; khung/root/đất cố định |
| `10-slot-*` | Luật slot: quét đùi/gối liên tục hai chiều nhiều góc gối/lean, luật v3 vs v4, thử rung có/không hysteresis |

Màu đánh dấu: đỏ = viền hở (màu sát nền), xanh lá = khe nền kín, **cam = khe mở thông ra nền gần khớp** (bao đóng r3,
mới ở v4), xanh dương = viền nằm sâu gần khớp (gồm cả nếp gấp hợp lệ – không phải tỉ lệ lỗi).
