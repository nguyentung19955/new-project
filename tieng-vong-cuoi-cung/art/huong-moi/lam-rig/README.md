# Lam "Cổ tích chuông tàn" – rig 13 mảnh + clip ĐỨNG / CHẠY / CHÉM 1 (bản chờ duyệt chuyển động)

Làm theo `../TU-VAN-CHUYEN-GIA-2-CO-TICH-CHUONG-TAN.md` (mục 2, 4, 5) và `../QUYET-DINH.md` (giữ chóp mũ).
Nguồn: ảnh đã chốt `../nguon/lam-moi-chuong-tan.png` + bảng mảnh `../nguon/lam-moi-manh.png`. **Chưa ghép vào game** (`game/demo.html`
vẫn dùng Lam cũ rig-v4). Ghi chú cho chủ dự án + tự chấm: **`game/thu-lam-moi/GHI-CHU.md`**.

## Xem gì
| File | Nội dung |
|---|---|
| `kiem/rap-so-sanh.png` | ảnh chốt \| ráp lại từ 13 mảnh \| chồng bóng (IoU 0,9996) \| khác màu ×4 |
| `kiem/rap-tach-lop.png` | mỗi màu một mảnh + 13 mảnh rời (đã lấp phần bị che) |
| `kiem/khop-vien.png` | viền mảnh của BẢNG MẢNH đặt lên ảnh chốt sau khi đo cỡ/khớp vị trí |
| `gif/dung-lon.gif`, `gif/dung-112px.gif` | đứng lắng nghe, 6 s (60 hình × 100 ms) |
| `gif/chay-lon.gif`, `gif/chay-112px.gif`, `gif/chay-lon-cham-x5.gif` | chạy, 25 hình × 20 ms = 0,50 s (đúng nhịp ở 264 px/s) |
| `gif/chem1-lon.gif`, `gif/chem1-112px.gif`, `gif/chem1-lon-cham-x6.gif` | đứng → chém đòn 1 (26 tick) → đứng |
| `sprite/lam-ct-{dung,chay,chem1}-2x.png/.json` | sheet 2x + JSON (quy ước rig-v4: ô chung, neo chân, 224 px nguồn = 112 px logic) |
| `sprite/lam-ct-*-rim-2x.png` | vệt sáng mép mũ/chóp/vai vẽ sẵn, cùng lưới ô (trang thử chồng lên; `?rim=0` tắt) |
| `lam-chuong-tan.json` | rig nguồn: mảnh, điểm neo, cây cha–con, thứ tự vẽ, điểm đo |
| `so-lieu.json` | số đo (trượt chân, nảy đầu, mũi dao theo atkT, RAM sheet…) |
| `manh/*.png`, `manh/manh.json`, `manh/do-co.json` | 13 mảnh trong hệ toạ độ ảnh chốt + số đo cỡ bảng mảnh so với ảnh chốt |

"Lớn" = vẽ thẳng từ rig ở cỡ Lam cao 448 px (không phóng). "112px" = gộp 2×2 từ sheet 2x → đúng cỡ trong game 1:1 (không phóng nearest).

## Chạy lại
```
pip install pillow numpy scipy opencv-python
cd code && python3 chay_het.py          # ~6 phút; --nhanh bỏ GIF
```
| File | Việc |
|---|---|
| `tach_manh.py` | tách 13 mảnh bảng mảnh (flood-fill nền trắng + lỗ kín, khử viền trắng) → `manh/goc/` |
| `khop_manh.py` | đo cỡ + vị trí từng mảnh bảng so với ảnh chốt (dò lưới + Nelder–Mead, sai số màu có chặn) |
| `dung_manh.py` | dựng 13 mảnh rig: phần thấy = điểm ảnh ảnh chốt, phần khuất = bảng mảnh (mũ, chuôi dao, găng xa, ủng) hoặc kéo vân vải theo cột; đường ráp mềm |
| `kiem_rap.py` | ráp dáng nghỉ, đo IoU / lệch màu, ảnh so sánh |
| `do_co.py`, `xem_khop.py` | bảng đo cỡ, ảnh viền khớp |
| `rig.py` | cây mảnh, neo, ma trận, vẽ (siêu mẫu ×4) |
| `clip.py` | 3 clip: mốc khoá theo tick + nội suy Hermite (PCHIP) cho động tác chính, lò xo tắt dần cho mũ/chóp/chuông/vạt/áo vai/dao |
| `sprite.py` | sheet + JSON + vệt sáng + GIF + số đo; kiểm `ATK[1]` đọc từ `game/demo.html` khớp clip |
