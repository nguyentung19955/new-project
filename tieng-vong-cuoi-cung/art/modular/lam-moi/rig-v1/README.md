# Lam – rig "tay chân rời" v1 (4 tư thế chạy để duyệt)

Nguồn: `../1-mau-chuan-nhin-cheo.png` (mẫu chuẩn), `../2-nhin-ngang.png` (nguồn tỷ lệ/vị trí), `../3-bang-manh.png` (9 mảnh).
Giai đoạn này **chỉ có rig + 4 tư thế** (chạm đất, chịu lực, đạp, bay). **Chưa** làm GIF/chu kỳ. **Chưa** chạy thử trên iPhone/Safari.
Không gen ảnh AI – mọi mảnh lấy từ ảnh có sẵn.
Đã làm gì, quyết định, cái chưa đẹp, câu hỏi cần quyết: **GHI-CHU.md**.

## Xem gì trước (`tu-the/`)
| File | Nội dung |
|---|---|
| `01-bang-duyet.png` | **Bảng duyệt chính**: 4 tư thế – màu lớn, silhouette lớn, 112 px 1:1 (màu + bóng), 112 px ×4 màu, 112 px ×4 silhouette. Khung + đường đất cố định |
| `00-nghi-so-sanh.png` | Dáng nghỉ: ảnh mẫu nhìn ngang / bản ráp / chồng 50 % / vùng lệch bóng (cùng scale) |
| `02-so-sanh-v5.png` | Bảng v5 cũ (tay chân có khuỷu/gối) cạnh bảng mới |
| `03-chop-mu-lac.png` | Mũ + chóp mũ lắc −10° / 0° / +10° – kiểm gốc chóp không lộ, không thủng |
| `04-manh.png` | 10 mảnh đã chuẩn hoá, chấm đỏ = pivot |
| `tu-the-<ten>-lon.png`, `-112px.png`, `-112px-x4.png` | Từng tư thế riêng |
| `so-lieu.json` | Số đo: cao nhân vật, hệ số 112 px, IoU dáng nghỉ, đế–đất, chồng dao–ủng, chóp |

## Thư mục
| Đường dẫn | Nội dung |
|---|---|
| `manh/*.png` | 10 mảnh RGBA đã chuẩn hoá về cỡ ảnh nhìn ngang: `mu`, `chop-mu`, `than`, `tay-truoc-dao`, `tay-sau`, `ung-gan`, `ung-xa`, `mat-gan`, `mat-xa`, `chuong` |
| `manh/goc/` | 9 mảnh cắt nguyên cỡ bảng mảnh + `tach.json` (hộp cắt), `khop.json` (hệ số/góc/tâm đo được), `chuan-hoa.json` |
| `lam-moi.json` | Metadata: quy ước, mảnh (cỡ, hệ số), rig (cha, điểm gắn, pivot, góc nghỉ, thứ tự vẽ, mặt đất), 4 tư thế, cách đổi chân nửa sau chu kỳ, quỹ đạo ủng 8 mốc |
| `code/` | Code chạy độc lập |

## Chạy
```
pip install pillow numpy scipy
cd code
python3 chay_het.py     # chạy hết theo thứ tự dưới (~2–3 phút, phần lâu nhất là khop_co)
# hoặc từng bước:
python3 tach_manh.py    # 1a tách 9 mảnh từ 3-bang-manh.png → ../manh/goc/
python3 khop_co.py      # 1b dò hệ số/góc/tâm từng mảnh trên 2-nhin-ngang.png → ../manh/goc/khop.json
python3 chuan_hoa.py    # 1c phóng mảnh về cỡ ảnh ngang, tạo mắt gần/xa → ../manh/*.png
python3 tu_the.py       # 2–3 dựng rig + 4 tư thế → ../lam-moi.json
python3 duyet.py        # 4 ảnh duyệt → ../tu-the/ (ảnh so v5 cần ../../lam/cutout-v5/tu-the/01-bang-duyet.png)
python3 kiem_tra.py     # kiểm JSON + PNG + tư thế (mã thoát 1 nếu lỗi)
```
Chỉnh tư thế: sửa các bảng số ở đầu `code/tu_the.py` (`DAT_UNG`, `THAN`, `GOC`, `MU`, `CHOP`, `CHUONG`, biên độ tay) rồi chạy lại `tu_the.py`, `duyet.py`, `kiem_tra.py` (~30 s).

## File code
| File | Việc |
|---|---|
| `chung.py` | Đường dẫn, font, tách nền trắng (flood-fill + connected components), khử viền trắng (unmix) |
| `tach_manh.py` | Cắt 9 mảnh, đặt tên theo ô bảng 3×3 |
| `khop_co.py` | Đo cỡ mảnh so với ảnh ngang (dò màu Nelder–Mead; chóp neo đỉnh; mắt đo trực tiếp) |
| `chuan_hoa.py` | Phóng mảnh (premultiplied alpha), đổi tên theo vai trò rig, tạo `mat-xa` |
| `rig.py` | Cây xương, ma trận, hàm vẽ tư thế (ủng tự chạm đất) |
| `tu_the.py` | Bảng số 4 tư thế + ghi `lam-moi.json` |
| `duyet.py` | Mọi ảnh duyệt + `so-lieu.json` |
| `kiem_tra.py` | Kiểm tra tự động |

## Dùng JSON trong game (gợi ý, chưa làm)
Vẽ theo `rig.thu_tu_ve`. Mỗi nút: `W = W_cha · T(diem_gan + dich) · R(goc_nghi + goc)`; vẽ ảnh mảnh sao cho điểm `pivot` trùng gốc nút.
Góc tính bằng độ, dương = thuận chiều kim đồng hồ trên màn hình (Canvas `ctx.rotate` cũng dương = thuận kim đồng hồ vì y hướng xuống).
Đơn vị = px ảnh ngang; nhân `tu-the/so-lieu.json → he_so_112` (≈ 0,1077) để ra px logic 112.
