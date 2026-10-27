# Người Gác Câm – rig cutout hướng "Cổ tích chuông tàn" (bản duyệt hình, CHƯA có đòn đánh)

Nguồn: `../../nguon/quai/nguoi-gac-cam.png` (nền trắng). Vai trò, hình dáng: `docs/gameplay/BO-QUAI-DE-XUAT.md`.
Trang xem + ghi chú cho chủ dự án: **`game/thu-quai-huong-moi/GHI-CHU.md`**. Chưa ghép vào `game/demo.html`.

| File | Nội dung |
|---|---|
| `nguoi-gac-cam-rig.json` | rig + clip tính sẵn (khoá mỗi 33 ms) – **cùng định dạng** `game/runtime/quai-boss/quai-moi-rig.json`; nạp bằng `QBR.napThem(base, 'nguoi-gac-cam-rig.json')`, loại `'gaccam'` |
| `manh/*.png` | 7 mảnh: `mu`, `than` (chuông ngực bịt vải + áo choàng + váy), `tay-trai` (bàn tay cầm trượng), `tay-phai`, `chan-trai`, `chan-phai`, `truong` (trượng chuông) – 2 px ảnh / 1 px logic, đã tô màu nhẹ + **vệt sáng mép vẽ sẵn** |
| `kiem/rap-so-chong.png` | gốc · ráp lại · so chồng (lục = chỉ gốc, đỏ = chỉ ráp) · khác màu ×4 · mỗi màu một mảnh – nguyên con IoU **0.9995** |
| `kiem/manh-2x.png` | các mảnh đúng ảnh trong gói |
| `xem-thu/*-lon.gif` | clip vẽ từ mảnh phân giải gốc (lớn) |
| `xem-thu/*-co-choi.gif` | clip **đúng cỡ trong game** (1 px logic = 1 px ảnh, vẽ từ mảnh 2x, không phóng nearest) |
| `xem-thu/so-co-lam-1x.png`, `-2x.png` | đứng cạnh Lam mới (`../../lam-rig/`) trên cảnh chuẩn |

**Cỡ**: hộp dáng nghỉ (px logic, so với điểm neo) [-62.4, -170.9, 52.7, 0.9] · `ty_le` = 0.17872 px logic / px ảnh nguồn.
**Cây nút** (quay trái; quay phải = lật ngang quanh điểm neo): `goc` (giữa hai ủng, trên đất) → `chan_trai`, `chan_phai` (đầu gối/hông), `than` (hông) → `tay_trai` (vai khuất) → `truong` (chỗ nắm); `than` → `mu` (cổ), `tay_phai` (vai).
**Thứ tự vẽ**: trượng, tay trái, chân trái, chân phải, thân, mũ, tay phải.
**Clip**: `dung` 3,6 s (thở sâu, vai nâng–hạ, mũ gật trễ, bàn tay giữ trượng đứng yên) · `di` 1,8 s/2 bước, **phát theo quãng đường** 54 px/chu kỳ (30 px/s); thân sụp + nén mỗi lần đặt chân (pha 0,08 / 0,58), tay trái bù nhịp sụp → trượng như chống gậy.
Trượng lấy từ **trượng rời trong bảng**, dò tỉ lệ 0,98 + nghiêng −4,7° cho khớp trượng trong hình nguyên con → phần khuất sau bàn tay đủ nét.

## Chạy lại
```
pip install pillow numpy scipy
cd code && python3 dung.py      # ~30 s: tách nền, cắt mảnh, rig, clip → manh/, *.json, kiem/, xem-thu/
```
Code chung (tách nền + khử viền trắng, cắt mảnh theo hình nguyên con, dò khớp mảnh bảng, tô màu, vệt sáng mép, rig, nội suy Hermite,
lò xo, xuất JSON/GIF): `../code-chung/cutout.py`, `../code-chung/xuat_chung.py`. Đa giác vùng mảnh + điểm neo nằm đầu `code/dung.py`.
