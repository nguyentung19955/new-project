# Lam cutout v5 – 4 tư thế chạy để duyệt

Làm theo `../review-v4/YEU-CAU-V5.md`. Giai đoạn này **chỉ có 4 tư thế** (chạm đất, chịu lực, đạp, bay) để chủ dự án duyệt.
**Chưa** ráp chu kỳ, **chưa** làm lại GIF. v3, v4 giữ nguyên. Chưa chạy thử trên iPhone/Safari.
Thay đổi, lý do, cái còn chưa đẹp và câu hỏi cần quyết: **GHI-CHU-V5.md**.

## Xem gì trước
| File trong `tu-the/` | Nội dung |
|---|---|
| `01-bang-duyet.png` | **Bảng duyệt chính**: 4 tư thế cạnh nhau – màu cỡ lớn, silhouette đen cỡ lớn, 112 px logic 1:1 (màu + silhouette), 112 px ×4 màu, 112 px ×4 silhouette |
| `02-so-sanh-v4-v5.png` | Cùng tư thế: v4 ↔ v5 (màu, silhouette, 112 px ×4) |
| `03-khuyu-goi-phong-to.png` | Phóng ×3 khuỷu tay cầm dao, gối gần, gối xa ở từng tư thế, v4 ↔ v5 |
| `04-phoi-canh-chan-xa.png` | Chân xa: cùng logic (v5) ↔ thêm DX_SHIFT −32 / nhấc ×0,7 kiểu v4 |
| `05-attachment.png` | Toàn bộ mảnh tay/chân liền (attachment duỗi/gập) đã dựng |
| `tu-the-<ten>-lon.png`, `-112px.png`, `-112px-x4.png` | Từng tư thế riêng |
| `so-lieu.json` | Số đo: độ nhún, đế so với đất, hướng lưỡi dao, góc khuỷu, so sánh v4 |

## Thư mục khác
| Đường dẫn | Nội dung |
|---|---|
| `lam-v5.json` | Metadata (schema 5.0.0) = mọi thứ của v4 + khoá `attachment` (mảnh thay thế theo góc) + khoá `tu_the` (4 tư thế) |
| `manh/*.png` | 24 mảnh – **giống hệt v4** (đã so từng điểm ảnh) |
| `manh/attachment/*.png` | 38 mảnh liền mới: `tay-gan`, `tay-xa` (gập 15…135°), `chan-gan`, `chan-xa` (gập 0…135°), bước 15° |
| `code/` | Code chạy độc lập (copy từ v4 rồi sửa/thêm) |
| `kiem-thu/` | Kết quả validator + dò mẫu (sinh tự động) |

## Chạy
```
pip install pillow numpy scipy
cd code
python3 chay_v5.py      # chạy hết theo thứ tự dưới (~25 s)
# hoặc từng bước:
python3 xuat.py         # mảnh (như v4) → ../manh/, ../lam-v5.json
python3 attachment.py   # mảnh tay/chân liền → ../manh/attachment/, thêm khoá "attachment" vào JSON
python3 tu_the.py       # 4 tư thế → khoá "tu_the" trong JSON
python3 duyet.py        # mọi ảnh duyệt → ../tu-the/  (cột v4 cần ../../cutout-v4/)
python3 kiem_json.py    # kiểm JSON + PNG (mã thoát 1 nếu lỗi)
```

## File code
| File | Vai trò |
|---|---|
| `tu_the.py` | **Nơi đặt dáng**: bảng bước chân chung (8 pha), bảng tay cầm dao, bảng tay không, nghiêng thân. Sửa dáng = sửa số ở đây |
| `attachment.py` | Dựng mảnh tay/chân liền theo góc gập từ PNG mảnh v4 (không gen AI, không vẽ lại) |
| `rap5.py` | Ráp: dùng Rig của v4, khi vẽ thay tay trên/đùi bằng attachment và ẩn cẳng |
| `duyet.py` | Vẽ toàn bộ ảnh trong `tu-the/` + `so-lieu.json` |
| `chay_nhap.py` | Từ v4; **giai đoạn này không chạy**. Đã bỏ DX_SHIFT −32 / LIFT_SCALE 0,7 của chân xa |
| `xuat.py`, `khuon4.py`, `khung.py`, `do_mau.py`, `meta.py`, `rap4.py`, `kiem_json.py`, `chung.py` | Như v4 (đổi tên file JSON sang v5; validator thêm kiểm attachment/tư thế) |

## Thông số 4 tư thế
Góc thế giới, độ: 0° = sang phải (hướng chạy), 90° = thẳng xuống, số dương = quay chiều kim đồng hồ.
Chân ghi (đùi, gập gối, ủng); tay ghi (tay trên, gập khuỷu, cổ tay). Độ nhún: âm = thân cao hơn dáng đứng.

| Tư thế | Nghiêng thân | Chân gần | Chân xa | Tay dao (gần) | Tay xa | Thân lên/xuống | Chạm đất |
|---|---|---|---|---|---|---|---|
| Chạm đất | 6° | (62, 15, 80) | (90, 120, 148) | (100, 105, −15) | (56, 90, −10) | −6,1 px (−1,4 px logic) | gót chân gần |
| Chịu lực | 8° | (66, 75, 90) | (34, 135, 92) | (92, 105, −14) | (66, 75, −10) | +9,7 px (+2,3) | đế phẳng chân gần |
| Đạp | 10° | (96, 30, 110) | (28, 90, 98) | (76, 90, −10) | (96, 60, −8) | −20,4 px (−4,9) | mũi chân gần |
| Bay | 8° | (118, 60, 126) | (36, 30, 82) | (56, 75, −6) | (126, 45, −6) | −14,9 px (−3,5) | không (đế thấp nhất cách đất 12 px) |

Hai chân lấy từ **cùng một bảng 8 pha**; chân xa = pha của chân gần + 4 (nửa chu kỳ). Tay dao gập khuỷu 105° → 75°
qua 4 tư thế (đến 60° ở pha tay trước nhất), lưỡi dao luôn chĩa ra trước-chếch lên (−11° … −18°).
