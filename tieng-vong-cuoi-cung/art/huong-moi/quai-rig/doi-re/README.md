# Dơi Rễ – rig cutout hướng "Cổ tích chuông tàn" (bản duyệt hình, CHƯA có đòn đánh)

Nguồn: `../../nguon/quai/doi-re.png` (nền trắng). Vai trò, hình dáng: `docs/gameplay/BO-QUAI-DE-XUAT.md`.
Trang xem + ghi chú cho chủ dự án: **`game/thu-quai-huong-moi/GHI-CHU.md`**. Chưa ghép vào `game/demo.html`.

| File | Nội dung |
|---|---|
| `doi-re-rig.json` | rig + clip tính sẵn (khoá mỗi 33 ms) – **cùng định dạng** `game/runtime/quai-boss/quai-moi-rig.json`; nạp bằng `QBR.napThem(base, 'doi-re-rig.json')`, loại `'doire'` |
| `manh/*.png` | 4 mảnh: dáng bay = `than` (thân + đầu + tai + chân), `canh-xa`, `canh-gan`; dáng treo = `treo` (nguyên khối, đã bỏ phiến đá trần) – 2 px ảnh / 1 px logic, đã tô màu nhẹ + **vệt sáng mép vẽ sẵn** |
| `kiem/rap-so-chong.png` (bay), `kiem/rap-so-chong-treo.png` | gốc · ráp lại · so chồng (lục = chỉ gốc, đỏ = chỉ ráp) · khác màu ×4 · mỗi màu một mảnh – dáng bay IoU **0.9999** · dáng treo IoU **1.0000** |
| `kiem/manh-2x.png` | các mảnh đúng ảnh trong gói |
| `xem-thu/*-lon.gif` | clip vẽ từ mảnh phân giải gốc (lớn) |
| `xem-thu/*-co-choi.gif` | clip **đúng cỡ trong game** (1 px logic = 1 px ảnh, vẽ từ mảnh 2x, không phóng nearest) |
| `xem-thu/so-co-lam-1x.png`, `-2x.png` | đứng cạnh Lam mới (`../../lam-rig/`) trên cảnh chuẩn |

**Cỡ**: hộp dáng nghỉ (px logic, so với điểm neo) [-14.5, -39.1, 56.9, 15.9] · `ty_le` = 0.10090 px logic / px ảnh nguồn.
**Cây nút** (quay trái; quay phải = lật ngang quanh điểm neo): `goc` → `treo` (neo = chân bám trần; ẩn khi bay), `than` (neo = giữa thân) → `canh_xa` (vai xa), `canh_gan` (vai gần).
**Thứ tự vẽ**: cánh xa, thân, cánh gần, (treo).
**Clip**: `treo` 4,8 s (đung đưa quanh chân bám, thở, rùng mình 1 lần) · `bay` 0,47 s/nhịp (đập xuống nhanh 40 %, nâng chậm; cánh xoay quanh vai + thu ngắn phối cảnh; thân nảy trễ).
Điểm neo khác nhau: **treo** vẽ tại (x, y mép trần); **bay** vẽ tại giữa thân. Mảnh rời ở hàng dưới ảnh nguồn không dùng (dáng bay đã đủ thân + 2 cánh đúng tư thế; phần cánh khuất sau thân được lấp).

## Chạy lại
```
pip install pillow numpy scipy
cd code && python3 dung.py      # ~30 s: tách nền, cắt mảnh, rig, clip → manh/, *.json, kiem/, xem-thu/
```
Code chung (tách nền + khử viền trắng, cắt mảnh theo hình nguyên con, dò khớp mảnh bảng, tô màu, vệt sáng mép, rig, nội suy Hermite,
lò xo, xuất JSON/GIF): `../code-chung/cutout.py`, `../code-chung/xuat_chung.py`. Đa giác vùng mảnh + điểm neo nằm đầu `code/dung.py`.
